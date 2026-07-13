// ── 74Sim Main Entry Point ───────────────────────────────────────────────────

import { COMP, MODE, getFamilySpec, DEFAULT_FAMILY } from './constants.js';
import { createComponent } from './components.js';
import { BreadboardWorld, parseHoleId } from './breadboard.js';
import { Renderer } from './renderer.js';
import { Interaction } from './interaction.js';
import { WireManager } from './wire.js';
import { LogicAnalyzer, exprToString, exprToProgramming, exprToMath, exprToStatement, renameInputs, evalExpr } from './logic.js';
import { CircuitSimulator } from './simulator.js';
import { getAllChipIds, searchChips, getChipDef, CHIP_DB } from './chips.js';
import { t } from './i18n.js';
import {
  serializeState, saveToLocalStorage, loadFromLocalStorage,
  deserializeState, importFromFile, exportToFile,
  suggestCircuitName, generateProjectId, getCurrentProjectId, setCurrentProjectId,
  saveProjectSnapshot, getProjectCache, loadProjectById, deleteProjectFromCache,
  getStoredFilename, setStoredFilename, clearStoredFilename
} from './storage.js';

import { TextBoxManager } from './textbox.js';
import { ImageBoxManager } from './imagebox.js';
import { analyze555Timing, fmtFreq, fmtTime, fmtRes, fmtCapVal } from './timer555.js';
import { loadExamples } from './examples.js';
import { TimingDiagram } from './timingDiagram.js';

// ── Debounced localStorage save ───────────────────────────────────────────────
// Circuit topology doesn't change during rapid interactions (dragging, etc.)
// so we defer the JSON.stringify to avoid blocking the main thread.
let _saveTimer = null;
function debouncedSave(state) {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => saveToLocalStorage(state), 400);
}

// ── Logic Analyzer helpers (K-Map + Truth Table) ─────────────────────────────

function collectInputs(node) {
  const set = new Set();
  const walk = (n) => {
    if (!n) return;
    if (n.type === 'input') { set.add(n.name); return; }
    if (n.operand) walk(n.operand);
    if (n.operands) n.operands.forEach(walk);
  };
  walk(node);
  return [...set].sort();
}

// 2 bit gray code sequence
const GRAY2 = [0, 1, 3, 2];

function evalAt(expr, inputs, bits) {
  const env = {};
  for (let i = 0; i < inputs.length; i++) env[inputs[i]] = (bits >> (inputs.length - 1 - i)) & 1;
  return evalExpr(expr, env);
}

function renderTruthTable(expr, inputs, outName) {
  const n = inputs.length;
  if (n === 0) {
    const v = evalExpr(expr, {});
    return `<div class="la-tt-empty">${outName} = ${v} (constant)</div>`;
  }
  const rows = 1 << n;
  let html = '<table class="la-tt"><thead><tr>';
  for (const name of inputs) html += `<th>${name}</th>`;
  html += `<th class="la-tt-out">${outName}</th></tr></thead><tbody>`;
  for (let i = 0; i < rows; i++) {
    html += '<tr>';
    for (let j = 0; j < n; j++) {
      const bit = (i >> (n - 1 - j)) & 1;
      html += `<td>${bit}</td>`;
    }
    const out = evalAt(expr, inputs, i);
    html += `<td class="la-tt-out la-tt-${out ? 'one' : 'zero'}">${out}</td>`;
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

// Build a Karnaugh map for 1-4 inputs. >4 falls back to a notice.
function renderKMap(expr, inputs) {
  const n = inputs.length;
  if (n === 0) {
    const v = evalExpr(expr, {});
    return `<div class="la-kmap-empty">Constant: ${v}</div>`;
  }
  if (n > 4) {
    return `<div class="la-kmap-empty">K-Map only supported for 2 4 inputs (this output uses ${n}).</div>`;
  }
  if (n === 1) {
    const a = inputs[0];
    const v0 = evalExpr(expr, { [a]: 0 });
    const v1 = evalExpr(expr, { [a]: 1 });
    return `<table class="la-kmap"><thead><tr><th class="la-kmap-corner">${a}</th><th>0</th><th>1</th></tr></thead>
      <tbody><tr><th></th><td class="la-kmap-${v0 ? 'one' : 'zero'}">${v0}</td><td class="la-kmap-${v1 ? 'one' : 'zero'}">${v1}</td></tr></tbody></table>`;
  }

  // Split inputs between row and col axes
  let rowVars, colVars;
  if (n === 2) { rowVars = [inputs[0]]; colVars = [inputs[1]]; }
  else if (n === 3) { rowVars = [inputs[0]]; colVars = [inputs[1], inputs[2]]; }
  else { rowVars = [inputs[0], inputs[1]]; colVars = [inputs[2], inputs[3]]; } // n === 4

  const rowSeq = rowVars.length === 1 ? [0, 1] : GRAY2;
  const colSeq = colVars.length === 1 ? [0, 1] : GRAY2;
  const rowBits = rowVars.length;
  const colBits = colVars.length;

  const labelBits = (val, bits) => val.toString(2).padStart(bits, '0');

  let html = '<table class="la-kmap"><thead><tr>';
  html += `<th class="la-kmap-corner"><span class="la-kmap-rowname">${rowVars.join('')}</span><span class="la-kmap-slash">\\</span><span class="la-kmap-colname">${colVars.join('')}</span></th>`;
  for (const c of colSeq) html += `<th>${labelBits(c, colBits)}</th>`;
  html += '</tr></thead><tbody>';
  for (const r of rowSeq) {
    html += `<tr><th>${labelBits(r, rowBits)}</th>`;
    for (const c of colSeq) {
      const env = {};
      for (let i = 0; i < rowVars.length; i++) env[rowVars[i]] = (r >> (rowBits - 1 - i)) & 1;
      for (let i = 0; i < colVars.length; i++) env[colVars[i]] = (c >> (colBits - 1 - i)) & 1;
      const v = evalExpr(expr, env);
      html += `<td class="la-kmap-${v ? 'one' : 'zero'}">${v}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

// ── App State ────────────────────────────────────────────────────────────────

class App {
  constructor() {
    this.canvas = document.getElementById('board-canvas');
    this.world = new BreadboardWorld(2, 2);
    this.renderer = new Renderer(this.canvas, this.world);
    // Repaint right after the canvas is resized so the freshly-cleared backing
    // store doesn't briefly show the dark page background (e.g. when DevTools
    // docks/undocks and the canvas grows, or the side panel animates its width
    // when a chip is clicked). This must repaint SYNCHRONOUSLY, not just set the
    // dirty flag: ResizeObserver callbacks fire after requestAnimationFrame but
    // before paint, so a resize that only defers to the next RAF would paint the
    // just-cleared (blank) canvas this frame — flashing for the whole transition.
    this.renderer.onResize = () => { this._composeAndDraw(); };
    this.interaction = new Interaction(this);
    this.analyzer = new LogicAnalyzer();
    this.simulator = new CircuitSimulator();

    this.undoStack = [];
    this.clipboard = null;
    this.currentInfoComp = null;
    this.currentProbe = null; // right-click voltage/current readout for a wire or LED
    this.lastInteractionTime = Date.now();
    this._currentProjectId = getCurrentProjectId();
    this._lastStructuralHash = '';

    this.state = {
      components: [],
      wireManager: new WireManager(),
      simulator: this.simulator,
      selectedItems: [],
      hoveredHole: null,
      wireStart: null,
      mouseWorld: null,
      ghost: null,
      lastUsedChips: [],
      showLogicView: false,
      showCircuitInfo: false,
      showTiming: false,
      showNetPower: false,
      showSimpleChipNames: false,
      showValues: false,
      showRealisticBoard: false,
      chipFamily: DEFAULT_FAMILY,
      extraTiles: [],
      textBoxes: [],
      imageBoxes: [],
      logicLabels: null,   // Map<compId, label> when logic analyzer is open
      logicFormat: 'programming', // 'programming' | 'math' | 'statement'
      overcurrentIds: new Set(), // Set<compId> of components with error-level overcurrent
    };

    // Text box manager (overlay on top of the canvas)
    this.textBoxManager = new TextBoxManager(
      document.getElementById('textbox-layer'),
      () => {
        this.state.textBoxes = this.textBoxManager.serialize();
        saveToLocalStorage(this.state);
      },
      () => { this.pushUndo(); }
    );

    // Image box manager (overlay on top of the canvas, below text boxes)
    this.imageBoxManager = new ImageBoxManager(
      document.getElementById('imagebox-layer'),
      () => {
        this.state.imageBoxes = this.imageBoxManager.serialize();
        saveToLocalStorage(this.state);
      },
      () => { this.pushUndo(); }
    );

    // Try to restore from localStorage
    const saved = loadFromLocalStorage();
    if (saved) {
      deserializeState(saved, this.state, this.world);
      this._rebuildWorldTiles();
      this.textBoxManager.deserialize(this.state.textBoxes);
      this.imageBoxManager.deserialize(this.state.imageBoxes);
      this._resetTransientRefs();
    }

    // Push the restored (or default) chip family into the simulator before
    // the first evaluate() keeps saved circuits' semantics stable.
    this.simulator.setFamily(this.state.chipFamily);

    this._initToolbar();
    this._initRotatingMessage();

    // Load example from URL param (e.g. index.html?example=hello_led)
    const urlExample = new URLSearchParams(window.location.search).get('example');
    if (urlExample) {
      // Remove the query param from the URL without reloading
      history.replaceState(null, '', window.location.pathname);
      loadExamples().then(examples => {
        const match = examples.find(e => e.id === urlExample);
        if (match && deserializeState(match.state, this.state, this.world)) {
          this._rebuildWorldTiles();
          this.textBoxManager.deserialize(this.state.textBoxes ?? []);
          this.imageBoxManager.deserialize(this.state.imageBoxes ?? []);
          this._resetTransientRefs();
          this.onCircuitChanged();
          this._renderDirty = true;
        }
      });
    }

    this._initWelcomeScreen(!!urlExample);

    // Status bar click → open Circuit Info
    document.getElementById('overcurrent-status').addEventListener('click', () => {
      this._showCircuitInfo();
    });

    // Run initial simulation on loaded state
    this.onCircuitChanged();
    this._renderDirty = true;
    this._startRenderLoop();

    // Mark clean after initial load, then track unsaved changes
    this._dirty = false;
    this._initUnsavedWarning();
  }

  // ── Unsaved Warning ───────────────────────────────────────────────────────
  _hasWork() {
    return this.state.components.some(c => c.placed) ||
      this.state.wireManager.wires.length > 0;
  }

  _initUnsavedWarning() {
    // Native dialog for tab/window close
    window.addEventListener('beforeunload', (e) => {
      if (this._dirty && this._hasWork()) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  // ── Welcome Screen ────────────────────────────────────────────────────────
  _initWelcomeScreen(suppressWelcome = false) {
    const overlay = document.getElementById('welcome-overlay');
    const modal = document.getElementById('welcome-modal');
    if (!overlay) return;

    // Show on first visit (no visited key in localStorage), unless suppressed by URL example
    if (!suppressWelcome && !localStorage.getItem('74sim_visited')) {
      overlay.classList.remove('hidden');
    }

    const dismiss = () => {
      overlay.classList.add('hidden');
      localStorage.setItem('74sim_visited', '1');
    };

    document.getElementById('welcome-close-btn').addEventListener('click', dismiss);

    document.getElementById('welcome-examples-btn').addEventListener('click', () => {
      dismiss();
      window.open('/docs#examples', '_blank');
    });

    // Clicking the backdrop (outside the modal card) also dismisses
    overlay.addEventListener('click', (e) => {
      if (!modal.contains(e.target)) dismiss();
    });
  }

  // ── Render Loop ────────────────────────────────────────────────────────────
  _startRenderLoop() {
    // Mark dirty whenever the mouse moves over the canvas (hover / ghost / drag)
    this.renderer.canvas.addEventListener('mousemove', () => { this._renderDirty = true; });
    // Also mark dirty on wheel (zoom) and mousedown (selection, placement start)
    // Use the container so dirty-flag fires even when the mouse is over a textbox.
    this.renderer.canvas.parentElement.addEventListener('wheel', () => { this._renderDirty = true; }, { passive: true });
    this.renderer.canvas.addEventListener('mousedown', () => { this._renderDirty = true; });
    // Mouseup/click resolve click state (button release, _maybePanning → click,
    // selection changes from _handleIdleClick, etc.) those can change visible
    // state without going through onCircuitChanged, so force a redraw here too.
    // Mouseup is listened on document to catch releases outside the canvas.
    document.addEventListener('mouseup', () => { this._renderDirty = true; });
    this.renderer.canvas.addEventListener('click', () => { this._renderDirty = true; });
    window.addEventListener('resize', () => { this._renderDirty = true; });

    const loop = () => {
      // Timing-analysis playback: advance sim time at the selected rate.
      // Wall-clock dt only paces playback — event times stay ps-exact.
      const nowMs = performance.now();
      // Another view can take over the shared side panel without knowing
      // about timing mode — detect the missing canvas and exit cleanly so
      // the engine never keeps intercepting a sim the user believes is live.
      if (this.state.showTiming && !document.getElementById('timing-canvas')) {
        this._teardownTimingMode();
      }
      const tEng = this.simulator.timing;
      if (this.state.showTiming && tEng && tEng.active) {
        if (tEng.running) {
          const dtSec = Math.min(0.1, Math.max(0, (nowMs - (this._lastTimingFrameMs ?? nowMs)) / 1000));
          if (dtSec > 0) tEng.advanceByPs(tEng.rateNsPerSec * dtSec * 1000);
          this._renderDirty = true; // wires/LEDs animate as events commit
        }
        if (this.timingDiagram) this.timingDiagram.render();
        this._updateTimingReadout();
      }
      this._lastTimingFrameMs = nowMs;

      const m = this.interaction.mode;
      // Always render during active interactions or when state has changed.
      // Also keep rendering every frame when showNetPower is on because the
      // animated current-flow dots use performance.now() for animation timing.
      const needsRedraw = this._renderDirty ||
                          m !== MODE.IDLE ||
                          this.interaction.isPanning ||
                          this.state.showNetPower;

      if (needsRedraw) {
        this._composeAndDraw();
      }
      // Always sync textbox DOM positions to the current viewport this must run
      // every frame (not just when needsRedraw) so boxes track pan/zoom instantly.
      this.textBoxManager.updateViewport(
        this.renderer.offsetX, this.renderer.offsetY, this.renderer.zoom
      );
      this.imageBoxManager.updateViewport(
        this.renderer.offsetX, this.renderer.offsetY, this.renderer.zoom
      );
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Merge the current interaction state into the draw state and paint one frame.
  // Called from the RAF loop and, synchronously, from renderer.onResize so a
  // resize-cleared canvas is refilled before the browser paints (see onResize).
  _composeAndDraw() {
    const m = this.interaction.mode;
    // Show ghost for DIP placement modes AND drag-to-move (all component types)
    this.state.ghost = (m === MODE.PLACE_CHIP || m === MODE.PLACE_OUTPUT || m === MODE.MOVE_COMP)
      ? this.interaction.ghost : null;
    this.state.ghosts = (m === MODE.MOVE_COMP || m === MODE.PASTE_PREVIEW)
      ? this.interaction.ghosts : [];
    // Ghost wires for multi-item paste preview (rendered as semi-transparent wires)
    this.state.ghostWires = (m === MODE.PASTE_PREVIEW)
      ? this.interaction._pasteWireHoles : [];
    this.state.wireStart = this.interaction.wireStart || this.interaction.compStart;
    if (m === MODE.WIRE_END || m === MODE.COMP_END || m === MODE.MOVE_WIRE_EP || m === MODE.MOVE_COMP_EP) {
      this.state.mouseWorld = this.interaction.mouseWorld;
    }
    this.state.draggingWireEp = m === MODE.MOVE_WIRE_EP ? this.interaction._moveWireEp : null;
    this.state.draggingCompEp = m === MODE.MOVE_COMP_EP ? this.interaction._moveCompEp : null;
    this.state.movingComp = m === MODE.MOVE_COMP ? this.interaction._movingComp : null;
    this.state.movingCompItems = m === MODE.MOVE_COMP ? this.interaction._movingComps : [];
    this.state.movingWires = m === MODE.MOVE_COMP ? this.interaction._movingWires : [];
    this.state.partialEndpointMoves = m === MODE.MOVE_COMP ? this.interaction._partialEndpointMoves : [];
    this.state.dragPixelOffset = m === MODE.MOVE_COMP ? this.interaction._dragPixelOffset : null;

    this.renderer.draw(this.state);
    this._renderDirty = false;
  }

  // ── Toolbar ────────────────────────────────────────────────────────────────
  _initToolbar() {
    // Chip dropdown
    const btnChip = document.getElementById('btn-chip');
    const dropChip = document.getElementById('dropdown-chip');
    const chipSearch = document.getElementById('chip-search');
    const chipList = document.getElementById('chip-list');
    const chipLastUsed = document.getElementById('chip-last-used');
    const chipSortByNumber = document.getElementById('chip-sort-by-number');

    chipSortByNumber.addEventListener('change', () => {
      this._renderChipList(chipSearch.value);
    });

    btnChip.addEventListener('click', () => {
      this._closeAllDropdowns();
      dropChip.classList.toggle('show');
      if (dropChip.classList.contains('show')) {
        chipSearch.focus();
        this._renderChipList(chipSearch.value);
        this._renderLastUsed();
      }
    });

    chipSearch.addEventListener('input', () => {
      this._renderChipList(chipSearch.value);
    });

    // Output dropdown
    const btnOutput = document.getElementById('btn-output');
    const dropOutput = document.getElementById('dropdown-output');
    const ledColorsList = document.getElementById('led-colors-list');
    const sevensegTypesList = document.getElementById('sevenseg-types-list');

    btnOutput.addEventListener('click', () => {
      this._closeAllDropdowns();
      dropOutput.classList.toggle('show');
    });

    // LED submenu toggle
    document.getElementById('output-led-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = ledColorsList.style.display !== 'none';
      ledColorsList.style.display = isOpen ? 'none' : 'block';
      e.currentTarget.querySelector('.dropdown-item-name').textContent = isOpen ? 'LED ▸' : 'LED ▾';
      sevensegTypesList.style.display = 'none';
      document.getElementById('output-7seg-toggle').querySelector('.dropdown-item-name').textContent = '7 Seg Display ▸';
    });

    // LED color items
    ledColorsList.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const color = item.dataset.color;
        this._closeAllDropdowns();
        this.interaction.startPlacement(COMP.LED, color || 'red');
        this._setActiveBtn(btnOutput);
      });
    });

    // 7-Seg submenu toggle
    document.getElementById('output-7seg-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sevensegTypesList.style.display !== 'none';
      sevensegTypesList.style.display = isOpen ? 'none' : 'block';
      e.currentTarget.querySelector('.dropdown-item-name').textContent = isOpen ? '7 Seg Display ▸' : '7 Seg Display ▾';
      ledColorsList.style.display = 'none';
      document.getElementById('output-led-toggle').querySelector('.dropdown-item-name').textContent = 'LED ▸';
    });

    // 7-Seg type items
    sevensegTypesList.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        this._closeAllDropdowns();
        if (type === 'seven_seg_cathode') this.interaction.startPlacement(COMP.SEVEN_SEG, '5161as');
        else if (type === 'seven_seg_anode') this.interaction.startPlacement(COMP.SEVEN_SEG);
        this._setActiveBtn(btnOutput);
      });
    });

    // Input dropdown
    const btnInput = document.getElementById('btn-input');
    const dropInput = document.getElementById('dropdown-input');

    btnInput.addEventListener('click', () => {
      this._closeAllDropdowns();
      dropInput.classList.toggle('show');
    });

    // DIP switch submenu
    const dipToggle = document.getElementById('input-dip-toggle');
    const dipSizesList = document.getElementById('dip-sizes-list');
    dipToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dipSizesList.style.display !== 'none';
      dipSizesList.style.display = isOpen ? 'none' : 'block';
      dipToggle.querySelector('.dropdown-item-name').textContent = isOpen ? 'DIP Switch ▸' : 'DIP Switch ▾';
    });
    dipSizesList.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const count = parseInt(item.dataset.count, 10);
        this._closeAllDropdowns();
        this.interaction.startPlacement(COMP.DIP_SWITCH, count);
        this._setActiveBtn(btnInput);
      });
    });

    dropInput.querySelectorAll('.dropdown-item[data-type]:not([data-type="dip_switch"])').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        this._closeAllDropdowns();
        if (type === 'button') this.interaction.startPlacement(COMP.BUTTON);
        else if (type === 'push_button') this.interaction.startPlacement(COMP.PUSH_BUTTON);
        else if (type === 'switch') this.interaction.startPlacement(COMP.SWITCH);
        else if (type === 'slide_switch') this.interaction.startPlacement(COMP.SLIDE_SWITCH);
        this._setActiveBtn(btnInput);
      });
    });

    // Wire
    const btnWire = document.getElementById('btn-wire');
    btnWire.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startWireMode();
      this._setActiveBtn(btnWire);
    });

    // Analog dropdown
    const btnAnalog = document.getElementById('btn-analog');
    const dropAnalog = document.getElementById('dropdown-analog');

    btnAnalog.addEventListener('click', () => {
      this._closeAllDropdowns();
      dropAnalog.classList.toggle('show');
    });

    document.getElementById('analog-resistor').addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.RESISTOR);
      this._setActiveBtn(btnAnalog);
    });

    document.getElementById('analog-capacitor').addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.CAPACITOR);
      this._setActiveBtn(btnAnalog);
    });

    document.getElementById('analog-polarized-capacitor').addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.POLARIZED_CAPACITOR);
      this._setActiveBtn(btnAnalog);
    });

    document.getElementById('analog-diode').addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.DIODE);
      this._setActiveBtn(btnAnalog);
    });

    document.getElementById('analog-inductor').addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.INDUCTOR);
      this._setActiveBtn(btnAnalog);
    });

    // More dropdown
    const btnMore = document.getElementById('btn-more');
    const dropMore = document.getElementById('dropdown-more');
    const itemViewWires = document.getElementById('more-view-wires');
    const itemSimpleNames = document.getElementById('more-simple-names');
    const itemHelp = document.getElementById('more-help');

    btnMore.addEventListener('click', () => {
      this._closeAllDropdowns();
      dropMore.classList.toggle('show');
    });

    // Sync initial toggle state from loaded settings
    itemViewWires.classList.toggle('active', this.state.showNetPower);

    itemViewWires.addEventListener('click', () => {
      this.state.showNetPower = !this.state.showNetPower;
      itemViewWires.classList.toggle('active', this.state.showNetPower);
      saveToLocalStorage(this.state);
    });

    itemSimpleNames.classList.toggle('active', this.state.showSimpleChipNames);
    itemSimpleNames.addEventListener('click', () => {
      this.state.showSimpleChipNames = !this.state.showSimpleChipNames;
      itemSimpleNames.classList.toggle('active', this.state.showSimpleChipNames);
      saveToLocalStorage(this.state);
    });

    const itemRealisticBoard = document.getElementById('more-realistic-board');
    itemRealisticBoard.classList.toggle('active', this.state.showRealisticBoard);
    itemRealisticBoard.addEventListener('click', () => {
      this.state.showRealisticBoard = !this.state.showRealisticBoard;
      itemRealisticBoard.classList.toggle('active', this.state.showRealisticBoard);
      saveToLocalStorage(this.state);
    });

    itemHelp.addEventListener('click', () => {
      this._closeAllDropdowns();
      window.open('/docs', '_blank');
    });

    const itemExamples = document.getElementById('more-examples');
    const examplesList = document.getElementById('examples-list');
    // Populate examples submenu loaded async from /api/examples
    loadExamples().then(examples => {
      examples.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `<span class="dropdown-item-name">${ex.name}</span>${ex.description ? `<span class="dropdown-item-desc">${ex.description}</span>` : ''}`;
        item.addEventListener('click', () => {
          this._closeAllDropdowns();
          if (deserializeState(ex.state, this.state, this.world)) {
            this._rebuildWorldTiles();
            this.textBoxManager.deserialize(this.state.textBoxes ?? []);
            this.imageBoxManager.deserialize(this.state.imageBoxes ?? []);
            this._resetTransientRefs();
            saveToLocalStorage(this.state);
            this.onCircuitChanged();
            this._renderDirty = true;
          }
        });
        examplesList.appendChild(item);
      });
    });
    itemExamples.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = examplesList.style.display !== 'none';
      examplesList.style.display = isOpen ? 'none' : 'block';
      itemExamples.querySelector('.dropdown-item-name').textContent = isOpen ? 'Example Projects ▸' : 'Example Projects ▾';
    });

    const itemAddTextbox = document.getElementById('more-add-textbox');
    itemAddTextbox.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.textBoxManager.addBox();
    });

    const itemAddImagebox = document.getElementById('more-add-imagebox');
    itemAddImagebox.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.imageBoxManager.addBox();
    });

    const itemSimpleClock = document.getElementById('more-simple-clock');
    itemSimpleClock.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.CLOCK);
      this._setActiveBtn(btnMore);
    });

    const itemTestPoint = document.getElementById('more-test-point');
    itemTestPoint.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.TESTPOINT);
      this._setActiveBtn(btnMore);
    });

    const itemCrystal = document.getElementById('more-crystal');
    itemCrystal.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.CRYSTAL);
      this._setActiveBtn(btnMore);
    });

    const itemCrystalCan = document.getElementById('more-crystal-can');
    itemCrystalCan.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.CHIP, 'XO');
      this._setActiveBtn(btnMore);
    });

    const itemCircuitInfo = document.getElementById('more-circuit-info');
    itemCircuitInfo.addEventListener('click', () => {
      this._closeAllDropdowns();
      if (this.state.showCircuitInfo) {
        this._closeInfoPanel();
      } else {
        this._showCircuitInfo();
      }
    });

    // Timing Analysis
    const itemTiming = document.getElementById('more-timing');
    itemTiming.addEventListener('click', () => {
      this._closeAllDropdowns();
      if (this.state.showTiming) {
        this._closeInfoPanel();
      } else {
        this._showTimingAnalyzer();
      }
    });

    // Logic Analyzer button
    const btnLogic = document.getElementById('btn-logic');
    btnLogic.addEventListener('click', () => {
      this._closeAllDropdowns();
      if (this.state.showLogicView) {
        this._closeInfoPanel();
      } else {
        this._showLogicAnalyzer();
      }
    });

    // Analysis dropdown
    const btnAnalysis = document.getElementById('btn-analysis');
    const dropAnalysis = document.getElementById('dropdown-analysis');
    btnAnalysis.addEventListener('click', () => {
      this._closeAllDropdowns();
      dropAnalysis.classList.toggle('show');
    });

    // Settings dropdown
    const btnSettings = document.getElementById('btn-settings');
    const dropSettings = document.getElementById('dropdown-settings');
    btnSettings.addEventListener('click', () => {
      this._closeAllDropdowns();
      dropSettings.classList.toggle('show');
    });

    const familySelect = document.getElementById('settings-chip-family');
    familySelect.value = this.state.chipFamily;
    familySelect.addEventListener('click', (e) => e.stopPropagation());
    familySelect.addEventListener('change', (e) => {
      e.stopPropagation();
      this.state.chipFamily = e.target.value;
      this.simulator.setFamily(this.state.chipFamily);
      saveToLocalStorage(this.state);
      this.onCircuitChanged();
    });

    // File dropdown
    const btnFile = document.getElementById('btn-file');
    const dropFile = document.getElementById('dropdown-file');

    btnFile.addEventListener('click', () => {
      this._closeAllDropdowns();
      this._renderCachedProjects();
      dropFile.classList.toggle('show');
    });

    document.getElementById('file-save').addEventListener('click', () => {
      this._closeAllDropdowns();
      exportToFile(this.state);
      this._dirty = false;
    });

    document.getElementById('file-load').addEventListener('click', () => {
      this._closeAllDropdowns();
      importFromFile((data, filename) => {
        if (deserializeState(data, this.state, this.world)) {
          this._rebuildWorldTiles();
          this.textBoxManager.deserialize(this.state.textBoxes);
          this.imageBoxManager.deserialize(this.state.imageBoxes);
          this._resetTransientRefs();
          // Loaded file becomes a new project session
          this._currentProjectId = generateProjectId();
          setCurrentProjectId(this._currentProjectId);
          this._lastStructuralHash = '';
          // Sticky filename: subsequent saves suggest the loaded file's name.
          if (filename) setStoredFilename(filename);
          this.onCircuitChanged();
        }
      });
    });

    document.getElementById('file-clear').addEventListener('click', () => {
      this._closeAllDropdowns();
      this.pushUndo();
      this.state.components = [];
      this.state.wireManager.clear();
      this.state.selectedItems = [];
      this.state.extraTiles = [];
      this.state.textBoxes = [];
      this.textBoxManager.clear();
      this.state.imageBoxes = [];
      this.imageBoxManager.clear();
      this._rebuildWorldTiles();
      this._resetTransientRefs();
      this.interaction.cancelMode();
      // Start a fresh project session so the old circuit stays in cache
      this._currentProjectId = generateProjectId();
      setCurrentProjectId(this._currentProjectId);
      this._lastStructuralHash = '';
      clearStoredFilename();
      this.onCircuitChanged();
      this._dirty = false;
    });

    // Close dropdowns on clicking elsewhere
    // Close side panel button
    document.getElementById('panel-close').addEventListener('click', () => {
      this._closeInfoPanel();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#toolbar')) {
        this._closeAllDropdowns();
      }
    });

    // ESC clears active buttons
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._clearActiveBtn();
        this._closeAllDropdowns();
      }

      const mod = e.ctrlKey || e.metaKey;
      if (!mod || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        document.getElementById('file-save').click();
      } else if (key === 'l') {
        e.preventDefault();
        document.getElementById('file-load').click();
      }
    });
  }

  _closeAllDropdowns() {
    document.querySelectorAll('.dropdown-panel').forEach(d => d.classList.remove('show'));
    // Collapse examples submenu
    const el = document.getElementById('examples-list');
    if (el) el.style.display = 'none';
    const toggle = document.getElementById('more-examples');
    if (toggle) toggle.querySelector('.dropdown-item-name').textContent = 'Example Projects ▸';
    // Collapse DIP switch sizes submenu
    const dipList = document.getElementById('dip-sizes-list');
    if (dipList) dipList.style.display = 'none';
    const dipTgl = document.getElementById('input-dip-toggle');
    if (dipTgl) dipTgl.querySelector('.dropdown-item-name').textContent = 'DIP Switch ▸';
    // Collapse LED colors submenu
    const ledList = document.getElementById('led-colors-list');
    if (ledList) ledList.style.display = 'none';
    const ledToggle = document.getElementById('output-led-toggle');
    if (ledToggle) ledToggle.querySelector('.dropdown-item-name').textContent = 'LED ▸';
    // Collapse 7-seg types submenu
    const segList = document.getElementById('sevenseg-types-list');
    if (segList) segList.style.display = 'none';
    const segToggle = document.getElementById('output-7seg-toggle');
    if (segToggle) segToggle.querySelector('.dropdown-item-name').textContent = '7 Seg Display ▸';
  }

  _setActiveBtn(btn) {
    document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  _clearActiveBtn() {
    document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('active'));
  }

  // ── Chip List Rendering ────────────────────────────────────────────────────
  _makeChipListItem(id) {
    const def = getChipDef(id);
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    const familyCode = this.state.chipFamily;
    const baseName = def.name.includes('74x') ? def.name.replace('74x', '74' + familyCode) : def.name;
    const displayName = def.datasheet ? baseName : '*' + baseName;
    item.innerHTML = `
      <span class="dropdown-item-name">${displayName}</span>
      <span class="dropdown-item-desc">${def.description}</span>
    `;
    item.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.CHIP, id);
      this._setActiveBtn(document.getElementById('btn-chip'));
    });
    return item;
  }

  // Non-chip placeable components (inputs, outputs, analog, wire, text, clocks).
  // Built once and cached. Each entry is searchable by name + keywords and
  // carries a `place` callback that mirrors its normal toolbar menu action.
  _getComponentCatalog() {
    if (this._componentCatalog) return this._componentCatalog;
    const place = (compType, subtype) => () => this.interaction.startPlacement(compType, subtype);
    this._componentCatalog = [
      // Inputs
      { name: '4-pin Push Button', desc: 'Momentary 4-pin tactile push button', keywords: 'input button push tactile momentary', place: place(COMP.BUTTON) },
      { name: '2-pin Push Button', desc: 'Momentary 2-pin push button', keywords: 'input button push momentary', place: place(COMP.PUSH_BUTTON) },
      { name: '2-pin SPST Slide Switch', desc: 'Single-pole single-throw slide switch', keywords: 'input switch spst slide toggle', place: place(COMP.SWITCH) },
      { name: '3-pin SPDT Slide Switch', desc: 'Single-pole double-throw slide switch', keywords: 'input switch spdt slide toggle', place: place(COMP.SLIDE_SWITCH) },
      { name: '2-Switch DIP Switch', desc: '2-position DIP switch', keywords: 'input dip switch', place: place(COMP.DIP_SWITCH, 2) },
      { name: '4-Switch DIP Switch', desc: '4-position DIP switch', keywords: 'input dip switch', place: place(COMP.DIP_SWITCH, 4) },
      { name: '6-Switch DIP Switch', desc: '6-position DIP switch', keywords: 'input dip switch', place: place(COMP.DIP_SWITCH, 6) },
      { name: '8-Switch DIP Switch', desc: '8-position DIP switch', keywords: 'input dip switch', place: place(COMP.DIP_SWITCH, 8) },
      { name: '10-Switch DIP Switch', desc: '10-position DIP switch', keywords: 'input dip switch', place: place(COMP.DIP_SWITCH, 10) },
      // Outputs
      { name: 'Red LED', desc: 'Light emitting diode (red)', keywords: 'output led light indicator', place: place(COMP.LED, 'red') },
      { name: 'Green LED', desc: 'Light emitting diode (green)', keywords: 'output led light indicator', place: place(COMP.LED, 'green') },
      { name: 'Blue LED', desc: 'Light emitting diode (blue)', keywords: 'output led light indicator', place: place(COMP.LED, 'blue') },
      { name: 'Yellow LED', desc: 'Light emitting diode (yellow)', keywords: 'output led light indicator', place: place(COMP.LED, 'yellow') },
      { name: 'White LED', desc: 'Light emitting diode (white)', keywords: 'output led light indicator', place: place(COMP.LED, 'white') },
      { name: '7 Segment Display (Common Cathode)', desc: 'Common-cathode 7-segment display', keywords: 'output 7 seven segment display digit', place: place(COMP.SEVEN_SEG, '5161as') },
      { name: '7 Segment Display (Common Anode)', desc: 'Common-anode 7-segment display', keywords: 'output 7 seven segment display digit', place: place(COMP.SEVEN_SEG) },
      // Analog
      { name: 'Resistor', desc: 'Fixed resistor', keywords: 'analog resistor passive ohm', place: place(COMP.RESISTOR) },
      { name: 'Capacitor', desc: 'Non-polarized capacitor', keywords: 'analog capacitor passive farad', place: place(COMP.CAPACITOR) },
      { name: 'Polarized Capacitor', desc: 'Polarized (electrolytic) capacitor', keywords: 'analog capacitor electrolytic passive farad', place: place(COMP.POLARIZED_CAPACITOR) },
      { name: 'Diode', desc: 'Signal diode', keywords: 'analog diode passive rectifier', place: place(COMP.DIODE) },
      // -1.2push- hidden from search catalog for release; uncomment to re-enable
      // { name: 'Inductor', desc: 'Inductor (coil)', keywords: 'analog inductor coil passive henry choke', place: place(COMP.INDUCTOR) },
      // Wire / misc
      { name: 'Wire', desc: 'Draw a wire between holes', keywords: 'wire connection net jumper', place: () => this.interaction.startWireMode() },
      { name: 'Text box', desc: 'Add a floating text label', keywords: 'text box label note annotation', place: () => this.textBoxManager.addBox() },
      { name: 'Image box', desc: 'Add a floating picture', keywords: 'image picture photo box figure annotation screenshot', place: () => this.imageBoxManager.addBox() },
      { name: 'Simple Clock', desc: 'Adjustable square-wave clock source', keywords: 'clock oscillator square wave timing', place: place(COMP.CLOCK) },
      // -1.2push- hidden from search catalog for release; uncomment to re-enable
      // { name: 'Crystal', desc: '2-pin crystal clock source — right-click to set frequency', keywords: 'clock crystal oscillator timing frequency xtal quartz', place: place(COMP.CRYSTAL) },
      { name: 'Test Point', desc: 'Voltage probe & timing-diagram lane', keywords: 'test point probe scope waveform timing analysis tp', place: place(COMP.TESTPOINT) },
    ];
    // Stable, locale-independent key for each entry (derived from the English
    // name) so t() can look up translated name/desc at render/search time.
    for (const e of this._componentCatalog) {
      e._slug = e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    return this._componentCatalog;
  }

  // Localized name/desc for a catalog entry (falls back to English).
  _compName(e) { return t(`comp.${e._slug}.name`, { def: e.name }); }
  _compDesc(e) { return t(`comp.${e._slug}.desc`, { def: e.desc }); }

  _searchComponents(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    return this._getComponentCatalog().filter(c =>
      this._compName(c).toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.keywords.includes(q)
    );
  }

  _makeComponentListItem(entry) {
    const item = document.createElement('div');
    item.className = 'dropdown-item dropdown-item--component';
    item.innerHTML = `
      <span class="dropdown-item-name">${this._compName(entry)}</span>
      <span class="dropdown-item-desc">${this._compDesc(entry)}</span>
    `;
    item.addEventListener('click', () => {
      this._closeAllDropdowns();
      entry.place();
      this._setActiveBtn(document.getElementById('btn-chip'));
    });
    return item;
  }

  _renderChipList(query) {
    const chipList = document.getElementById('chip-list');
    const sortByNumber = !document.getElementById('chip-sort-by-number').checked;
    chipList.innerHTML = '';

    const components = this._searchComponents(query);
    const ids = searchChips(query, { sortByNumber });
    if (ids.length === 0 && components.length === 0) {
      chipList.innerHTML = `<div class="empty-state">${t('sim.noMatches', { def: 'No matches found' })}</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    // Matching components surface at the top, styled distinctly from chips.
    for (const entry of components) {
      frag.appendChild(this._makeComponentListItem(entry));
    }
    for (const id of ids) {
      frag.appendChild(this._makeChipListItem(id));
    }
    chipList.appendChild(frag);
  }

  _renderLastUsed() {
    const container = document.getElementById('chip-last-used');
    const section = container.closest('.dropdown-section');
    container.innerHTML = '';
    if (!this.state.lastUsedChips.length) {
      if (section) section.style.display = 'none';
      return;
    }
    if (section) section.style.display = '';
    for (const id of this.state.lastUsedChips) {
      const def = getChipDef(id);
      if (!def) continue;
      // Skip stub-only parts (info sheet in docs but not implemented).
      if (def.tags?.includes('stub')) continue;
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      const familyCode = this.state.chipFamily;
      const baseName = def.name.includes('74x') ? def.name.replace('74x', '74' + familyCode) : def.name;
      const label = def.simpleName ? `${baseName} (${def.simpleName})` : baseName;
      item.innerHTML = `<span class="dropdown-item-name">${label}</span>`;
      item.addEventListener('click', () => {
        this._closeAllDropdowns();
        this.interaction.startPlacement(COMP.CHIP, id);
        this._setActiveBtn(document.getElementById('btn-chip'));
      });
      container.appendChild(item);
    }
  }

  addLastUsedChip(chipId) {
    // Remove duplicates, add to front, keep max 5
    this.state.lastUsedChips = this.state.lastUsedChips.filter(id => id !== chipId);
    this.state.lastUsedChips.unshift(chipId);
    if (this.state.lastUsedChips.length > 5) {
      this.state.lastUsedChips.pop();
    }
  }

  // ── Analysis ───────────────────────────────────────────────────────────────
  _runAnalysis() {
    this.analyzer.analyze(this.world, this.state.components, this.state.wireManager);
    const result = this.analyzer.getAnalysisResult();
    this._renderAnalysis(result);
  }

  _renderAnalysis(result) {
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    title.textContent = 'Analysis';

    if (result.expressions.length === 0 && result.warnings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Click a chip to see its pinout.<br>
          Wire inputs through chips to outputs<br>
          to see logic expressions and truth tables.
        </div>
      `;
      return;
    }

    let html = '';

    // Warnings
    for (const w of result.warnings) {
      html += `<div class="warning-box">${w}</div>`;
    }

    // Expressions
    for (const e of result.expressions) {
      html += `
        <div class="expr-block">
          <div class="expr-label">${e.name} Inputs: ${e.inputs.join(', ') || 'none'}</div>
          <div class="expr-text">${e.expression}</div>
        </div>
      `;
    }

    // Truth tables
    for (const t of result.truthTables) {
      html += `<div class="expr-label" style="margin:8px 0 4px">${t.outputName} Truth Table</div>`;
      html += '<table class="truth-table"><thead><tr>';
      for (const name of t.inputNames) {
        html += `<th>${name}</th>`;
      }
      html += `<th>${t.outputName}</th>`;
      html += '</tr></thead><tbody>';

      for (const row of t.rows) {
        html += '<tr>';
        for (const v of row.inputs) {
          html += `<td>${v}</td>`;
        }
        html += `<td class="output-col">${row.output}</td>`;
        html += '</tr>';
      }
      html += '</tbody></table>';
    }

    html += `<div class="sim-note">${t('sim.note', { def: 'Note: simulation is not perfect and can have errors be careful with real circuits.' })}</div>`;

    container.innerHTML = html;
  }

  // ── Chip / 7-Seg Info Panel ───────────────────────────────────────────────
  showChipInfo(comp) {
    this.currentInfoComp = comp;
    this.currentProbe = null;
    // Take over the side panel from Circuit Analyzer / Logic Analyzer so their
    // time-step refresh loop doesn't repaint over the component panel.
    this.state.showCircuitInfo = false;
    this.state.showLogicView = false;
    this.state.logicLabels = null;
    document.getElementById('btn-logic').classList.remove('active');
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');

    // Ensure panel is visible
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    // ── 7 Segment Display ─────────────────────────────────────────────────
    if (comp.type === COMP.SEVEN_SEG) {
      title.textContent = '7 Segment';
      const s = comp.segments;
      const isAnode = !!comp.commonAnode;
      const comTag  = isAnode ? '5V' : 'GND';
      const titleText = `Common ${isAnode ? 'Anode' : 'Cathode'} 7 Segment Display`;

      // ── Layout (viewBox 0 0 280 290) ─────────────────────────────────────
      const VBW = 280, VBH = 290;
      const PX7 = [44, 92, 140, 188, 236];                 // pin x centers
      const BX1 = 22, BX2 = 258;                           // body x bounds
      const BY1 = 60, BY2 = 232;                           // body y bounds (height 172)
      const PIN_NAME_TOP_Y = 36;                           // outside text y (top)
      const PIN_NAME_BOT_Y = 264;                          // outside text y (bottom)
      const LEG_TOP_Y      = 44;                           // top leg starts here, ends at BY1
      const LEG_BOT_Y      = 248;                          // bottom leg ends here, starts at BY2
      const PIN_NUM_TOP_Y  = BY1 + 10;                     // pin numbers inside body, top edge
      const PIN_NUM_BOT_Y  = BY2 - 6;                      // pin numbers inside body, bottom edge

      // Standardized neutral pin styling   no state-dependent colors
      const C_PIN_NAME = '#cfcfcf';
      const C_PIN_NUM  = '#777';
      const C_LEG      = '#9a9a9a';
      const C_TITLE    = '#d8d8d8';

      // Horizontal squish factor (graphics only   text counter-scales to stay
      // at native aspect ratio).
      const SX     = 0.771;
      const INV_SX = (1 / SX).toFixed(5);  // ~1.29702
      // Emit text inside the scale(SX,1) group with a counter-scale so glyphs
      // render at full width while the position is still in original coords.
      const txt = (x, y, attrs, label) =>
        `<text transform="translate(${x} ${y}) scale(${INV_SX} 1)" ${attrs}>${label}</text>`;

      const topPins7 = [
        { name: 'g',                  num: 1, com: false },
        { name: 'f',                  num: 2, com: false },
        { name: `COM1 (${comTag})`,   num: 3, com: true  },
        { name: 'a',                  num: 4, com: false },
        { name: 'b',                  num: 5, com: false },
      ];
      const botPins7 = [
        { name: 'e',                  num: 10, com: false },
        { name: 'd',                  num: 9,  com: false },
        { name: `COM2 (${comTag})`,   num: 8,  com: true  },
        { name: 'c',                  num: 7,  com: false },
        { name: 'dp',                 num: 6,  com: false },
      ];

      const pinNameSvg = (i, top) => {
        const pd = top ? topPins7[i] : botPins7[i];
        const x = PX7[i];
        const fs = pd.name.length > 4 ? 7.5 : 9;
        const fw = pd.com ? '600' : '400';
        const y  = top ? PIN_NAME_TOP_Y : PIN_NAME_BOT_Y;
        return txt(x, y, `text-anchor="middle" fill="${C_PIN_NAME}" font-size="${fs}" font-family="Roboto, Arial, sans-serif" font-weight="${fw}"`, pd.name);
      };
      const legSvg = (i, top) => {
        const x = PX7[i];
        return top
          ? `<line x1="${x}" y1="${LEG_TOP_Y}" x2="${x}" y2="${BY1}" stroke="${C_LEG}" stroke-width="1.6"/>`
          : `<line x1="${x}" y1="${BY2}"      x2="${x}" y2="${LEG_BOT_Y}" stroke="${C_LEG}" stroke-width="1.6"/>`;
      };
      const pinNumSvg = (i, top) => {
        const pd = top ? topPins7[i] : botPins7[i];
        const x  = PX7[i];
        const y  = top ? PIN_NUM_TOP_Y : PIN_NUM_BOT_Y;
        return txt(x, y, `text-anchor="middle" fill="${C_PIN_NUM}" font-size="9" font-weight="bold" font-family="Roboto, Arial, sans-serif"`, pd.num);
      };

      let pinNamesAndLegs = '';
      let pinNumsInside  = '';
      for (let i = 0; i < 5; i++) {
        pinNamesAndLegs += pinNameSvg(i, true)  + legSvg(i, true);
        pinNamesAndLegs += pinNameSvg(i, false) + legSvg(i, false);
        pinNumsInside   += pinNumSvg(i, true)   + pinNumSvg(i, false);
      }

      // ── Display geometry (centered in body, leaves room for pin numbers) ─
      const DW = 140, DH = 140;
      const DX = 140 - DW / 2;                       // 70
      const DY = (BY1 + BY2) / 2 - DH / 2;           // 76

      // Inner digit area   proportions tuned from the canvas renderer
      const dgW = DW * 0.55;                         // 77
      const dgH = DH * 0.86;                         // 120.4
      const dgX = DX + (DW - dgW) / 2;               // ~101.5
      const dgY = DY + (DH - dgH) / 2;               // ~85.8
      const t   = dgW * 0.13;                        // ~10 (segment thickness)
      const b   = t * 0.55;                          // bevel
      const gap = t * 0.28;                          // gap
      const vH  = dgH / 2 - 1.5 * t - 2 * gap;       // vertical segment length

      // Colors match canvas (#ff5500 lit / #3d0a00 unlit, default mode)
      const segOn  = '#ff3a00';
      const segOff = '#3d0a00';
      const segCol = (n) => s[n] ? segOn : segOff;
      const labCol = (n) => s[n] ? 'rgba(255,255,255,0.95)' : 'rgba(180,180,180,0.55)';
      const labFs  = Math.max(5.5, t * 0.55).toFixed(1);

      // Horizontal hex segment + centered label
      const hexH = (sx, sy, name) => {
        const sw = dgW - 2 * t;
        const pts = `${sx + b},${sy} ${sx + sw - b},${sy} ${sx + sw},${sy + t / 2} ${sx + sw - b},${sy + t} ${sx + b},${sy + t} ${sx},${sy + t / 2}`;
        const lx = sx + sw / 2;
        const ly = sy + t / 2 + parseFloat(labFs) * 0.36;
        return `<polygon points="${pts}" fill="${segCol(name)}"/>`
             + txt(lx, ly, `text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="${labFs}" font-weight="bold" fill="${labCol(name)}"`, name);
      };
      // Vertical hex segment + centered label
      const hexV = (sx, sy, sh, name) => {
        const pts = `${sx + t / 2},${sy} ${sx + t},${sy + b} ${sx + t},${sy + sh - b} ${sx + t / 2},${sy + sh} ${sx},${sy + sh - b} ${sx},${sy + b}`;
        const lx = sx + t / 2;
        const ly = sy + sh / 2 + parseFloat(labFs) * 0.36;
        return `<polygon points="${pts}" fill="${segCol(name)}"/>`
             + txt(lx, ly, `text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="${labFs}" font-weight="bold" fill="${labCol(name)}"`, name);
      };

      // Decimal point   circle large enough to host its label inside
      const dpR = t * 0.78;
      const dpX = dgX + dgW + gap + dpR;
      const dpY = dgY + dgH - dpR;
      const dpFs = (dpR * 0.95).toFixed(1);
      const dpSvg =
        `<circle cx="${dpX}" cy="${dpY}" r="${dpR}" fill="${segCol('dp')}"/>`
      + txt(dpX, dpY + parseFloat(dpFs) * 0.36, `text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="${dpFs}" font-weight="bold" fill="${labCol('dp')}"`, 'dp');

      const segmentsSvg = ''
        + hexH(dgX + t,           dgY,                            'a')
        + hexV(dgX,               dgY + t + gap,             vH,  'f')
        + hexV(dgX + dgW - t,     dgY + t + gap,             vH,  'b')
        + hexH(dgX + t,           dgY + dgH / 2 - t / 2,          'g')
        + hexV(dgX,               dgY + dgH / 2 + t / 2 + gap, vH, 'e')
        + hexV(dgX + dgW - t,     dgY + dgH / 2 + t / 2 + gap, vH, 'c')
        + hexH(dgX + t,           dgY + dgH - t,                  'd')
        + dpSvg;

      // SVG renders at 77.1% of panel width; viewBox shrinks by the same factor
      // so the scale(SX,1) parent fits content from original 280-wide coords
      // into the narrowed viewBox while rendered height stays the same as
      // before. Each <text> applies a counter-scale via txt() so glyphs render
      // at full native width even though graphics are horizontally squeezed.
      const VBW_S = (VBW * SX).toFixed(3);
      const titleSvg = txt(VBW / 2, 16,
        `text-anchor="middle" fill="${C_TITLE}" font-size="11" font-weight="bold" font-family="Roboto, Arial, sans-serif"`,
        titleText);
      const diagSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW_S} ${VBH}" style="width:77.1%;display:block;margin-bottom:6px">
  <g transform="scale(${SX} 1)">
    <!-- title -->
    ${titleSvg}
    <!-- pin names + legs (drawn under body so legs tuck under edge) -->
    ${pinNamesAndLegs}
    <!-- body (pure black, no pin-1 dot) -->
    <rect x="${BX1}" y="${BY1}" width="${BX2 - BX1}" height="${BY2 - BY1}" rx="6" fill="#000000" stroke="#444" stroke-width="1.5"/>
    <!-- pin numbers inside body -->
    ${pinNumsInside}
    <!-- segments drawn directly on body (no inner display window) -->
    ${segmentsSvg}
  </g>
</svg>`;

      const explanationHtml = `
<div class="chip-info-desc">7 segment LED display. Each segment is a separate LED sharing one common pin.</div>
<div class="chip-help-section">
  <div class="chip-help-text chip-help-text-open">
    <div class="chip-guide-subtitle">Common anode</div>
    <div class="chip-guide-paragraph">COM → VCC (+5V). A segment turns ON when its pin is pulled LOW. Current path: VCC → COM → LED → resistor → pin → GND.</div>
    <div class="chip-guide-subtitle">Common cathode</div>
    <div class="chip-guide-paragraph">COM → GND (0V). A segment turns ON when its pin is driven HIGH. Current path: VCC → resistor → pin → LED → COM → GND.</div>
    <div class="chip-guide-subtitle">Current limits</div>
    <div class="chip-guide-paragraph">Max per segment: 20 mA, typical 10 15 mA. At 5V with a 2.0V LED forward voltage, use a 220Ω resistor for about 15 mA per segment.</div>
  </div>
</div>`;

      container.innerHTML = `<div class="chip-dip-wrap">${diagSvg}</div>` + explanationHtml;
      return;
    }

    // ── IC Chip ───────────────────────────────────────────────────────────
    const def = comp.chipDef;

    // ── Live simulator state ──────────────────────────────────────────────
    const sim = this.simulator;
    const nl  = sim.netlist;

    const pinVoltage = (pin) => {
      const net = nl.findNetByHole(pin.holeId);
      if (!net) return undefined;
      return sim.netVoltages.get(net.id);
    };

    const fmtV = (v) => {
      if (v === undefined) return '<span class="pin-v-lo">0.0</span>';
      if (v >= 4.5)        return '<span class="pin-v-hi">H</span>';
      if (v <= 0.5)        return '<span class="pin-v-lo">L</span>';
      return `<span class="pin-v-mid">${v.toFixed(1)}</span>`;
    };

    // Check VCC and GND connections
    let hasVCC = false, hasGND = false;
    for (const pin of comp.pins) {
      if (pin.type !== 'power') continue;
      const net = nl.findNetByHole(pin.holeId);
      if (!net) continue;
      if (net.isVCC) hasVCC = true;
      if (net.isGND) hasGND = true;
    }
    // Chips flagged noVccPin (ULN2003, LM7805) have no VCC pin — GND alone powers them.
    const powered = hasGND && (hasVCC || def.noVccPin);

    // Power status badge
    const vccDefPin = def.pinout.find(p => p.pin === def.vcc);
    const gndDefPin = def.pinout.find(p => p.pin === def.gnd);
    const vccName = vccDefPin ? vccDefPin.name : 'VCC';
    const gndName = gndDefPin ? gndDefPin.name : 'GND';

    let powerBadge;
    if (powered) {
      powerBadge = ``;
    } else if (!hasVCC && !hasGND && !def.noVccPin) {
      powerBadge = `<div class="chip-power-badge chip-power-none">Chip Unpowered, connect pin ${def.vcc} to VCC and pin ${def.gnd} to GND</div>`;
    } else if (!hasVCC && !def.noVccPin) {
      powerBadge = `<div class="chip-power-badge chip-power-partial">Missing VCC, connect pin ${def.vcc} to VCC</div>`;
    } else {
      powerBadge = `<div class="chip-power-badge chip-power-partial">Missing GND, connect pin ${def.gnd} to GND</div>`;
    }

    {
      const _fl = getFamilySpec(comp.chipFamily ?? this.state.chipFamily).label;
      title.textContent = (def.name || '').replace(/^74x/, _fl);
    }

    const half = def.pins / 2;
    let html = powerBadge;
    html += `<div class="chip-info-desc">${def.description}</div>`;

    // ── SVG DIP diagram ───────────────────────────────────────────────────
    {
      const ACTIVE_LOW_NAMES = new Set(['CLR', 'MR', 'RST', 'RESET', '1CLR', '2CLR', '1MR', '2MR', 'LOAD']);
      const isActiveLow = p => ACTIVE_LOW_NAMES.has(p.name) || (p.name.length > 1 && p.name.endsWith('n')) || /active[\s-]low/i.test(p.description || '');
      const dipName = p => isActiveLow(p) && p.name.endsWith('n') ? p.name.slice(0, -1) : p.name;
      const maxNameLen = Math.max(...def.pinout.map(p => dipName(p).length));
      // Roomier proportions: more vertical breathing room, closer to actual DIP aspect
      const pinSp  = Math.max(28, Math.ceil(maxNameLen * 5.2) + 12);  // px between pin centers
      const notch  = 22;   // left space for notch
      const padR   = 12;   // right padding
      const bH     = 78;   // body height px (taller; closer to real DIP aspect)
      const legLen = 11;   // leg length (body edge to pin)
      const legW   = 3.5;  // leg width
      const voltH  = 12;   // voltage text area height
      const nameH  = 14;   // pin name text area height
      const pinGap = 6;    // gap between pin label and leg top
      const svgW     = notch + half * pinSp + padR;
      const bodyTopY = voltH + nameH + pinGap + legLen + 2;
      const bodyBotY = bodyTopY + bH;
      const svgH     = bodyBotY + legLen + nameH + voltH + 2;
      const bcy      = bodyTopY + bH / 2;
      const familyLabel = getFamilySpec(comp.chipFamily ?? this.state.chipFamily).label; // '74LS' | '74HC' | '74HCT'
      const displayName = (def.name || '').replace(/^74x/, familyLabel);
      const typeCol  = t => t === 'input' ? '#8d8' : t === 'output' ? '#e88' : t === 'nc' ? '#888' : '#fd6';
      const fmtVSvg  = (pin) => {
        const cp = comp.getPinByName(pin.name);
        let v  = cp ? pinVoltage(cp) : undefined;
        if (v === undefined) v = 0;
        if (v >= 4.5) return { t: '5V', c: '#6d6' };
        if (v <= 0.5) return { t: '0V', c: '#d66' };
        return { t: v.toFixed(1) + 'V', c: '#fa4' };
      };
      const px = i => notch + i * pinSp + pinSp / 2;

      let s = '<div class="chip-dip-wrap"><svg class="chip-dip-svg" width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg">';

      // Top pins
      for (let i = 0; i < half; i++) {
        const pin = def.pinout[def.pins - 1 - i];
        const { t, c } = fmtVSvg(pin);
        const x = px(i);
        const col = typeCol(pin.type);
        s += '<text x="' + x + '" y="' + (voltH - 1) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="8" fill="' + c + '">' + t + '</text>';
        s += '<text x="' + x + '" y="' + (voltH + nameH - 1) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="9" font-weight="bold" fill="' + col + '">' + dipName(pin) + '</text>';
        if (isActiveLow(pin)) { const hw = dipName(pin).length * 2.7; s += '<line x1="' + (x - hw).toFixed(1) + '" y1="' + (voltH + nameH - 10) + '" x2="' + (x + hw).toFixed(1) + '" y2="' + (voltH + nameH - 10) + '" stroke="' + col + '" stroke-width="0.9"/>'; }
        // Flat metallic leg (matches canvas style without harsh chrome gradient)
        s += '<rect x="' + (x - legW / 2) + '" y="' + (voltH + nameH + pinGap) + '" width="' + legW + '" height="' + legLen + '" fill="#aaaaaa"/>';
      }

      // Body (flat, matches canvas chip art   almost solid black epoxy)
      s += '<rect x="0" y="' + bodyTopY + '" width="' + svgW + '" height="' + bH + '" rx="2" fill="#111" stroke="#222" stroke-width="0.8"/>';
      // Notch (filled semicircle on left edge)
      s += '<circle cx="0" cy="' + bcy + '" r="6" fill="#555"/>';
      s += '<path d="M 0,' + (bcy - 6).toFixed(1) + ' A 6,6 0 0 1 0,' + (bcy + 6).toFixed(1) + '" fill="none" stroke="#777" stroke-width="0.8"/>';
      // Pin-1 indicator dot
      s += '<circle cx="11" cy="' + bcy + '" r="2.2" fill="#0d0d0d"/>';

      // Top pin numbers inside body
      for (let i = 0; i < half; i++) {
        const pin = def.pinout[def.pins - 1 - i];
        s += '<text x="' + px(i) + '" y="' + (bodyTopY + 13) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="7.5" fill="#666">' + pin.pin + '</text>';
      }

      // Chip name (with family substituted) centered in body   laser-etched warm white like canvas
      s += '<text x="' + (svgW / 2) + '" y="' + (bcy + 4) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="11" font-weight="bold" fill="#d8d4cc" letter-spacing="1.8">' + displayName + '</text>';

      // Bottom pin numbers inside body
      for (let i = 0; i < half; i++) {
        const pin = def.pinout[i];
        s += '<text x="' + px(i) + '" y="' + (bodyBotY - 4) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="7.5" fill="#666">' + pin.pin + '</text>';
      }

      // Bottom pins
      for (let i = 0; i < half; i++) {
        const pin = def.pinout[i];
        const { t, c } = fmtVSvg(pin);
        const x = px(i);
        const col = typeCol(pin.type);
        s += '<rect x="' + (x - legW / 2) + '" y="' + bodyBotY + '" width="' + legW + '" height="' + legLen + '" fill="#aaaaaa"/>';
        s += '<text x="' + x + '" y="' + (bodyBotY + legLen + nameH - 1) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="9" font-weight="bold" fill="' + col + '">' + dipName(pin) + '</text>';
        if (isActiveLow(pin)) { const hw = dipName(pin).length * 2.7; s += '<line x1="' + (x - hw).toFixed(1) + '" y1="' + (bodyBotY + legLen + nameH - 10) + '" x2="' + (x + hw).toFixed(1) + '" y2="' + (bodyBotY + legLen + nameH - 10) + '" stroke="' + col + '" stroke-width="0.9"/>'; }
        s += '<text x="' + x + '" y="' + (bodyBotY + legLen + nameH + voltH - 1) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="8" fill="' + c + '">' + t + '</text>';
      }

      s += '</svg></div>';
      s += '<div class="chip-pinout-legend"><span class="legend-input">● Input</span> <span class="legend-output">● Output</span> <span class="legend-power">● Power</span> <span class="legend-nc">● No Connect</span></div>';
      html += s;
    }

    // ── Per-chip family override (placed below the diagram, smaller) ──────
    {
      const chipFamilyVal = comp.chipFamily || '';
      html += `<div class="chip-family-override-row">
        <span class="chip-family-override-label">Family</span>
        <select class="chip-family-override-select">
          <option value="" ${chipFamilyVal === '' ? 'selected' : ''}>Project default (74${this.state.chipFamily})</option>
          <option value="LS" ${chipFamilyVal === 'LS' ? 'selected' : ''}>74LS</option>
          <option value="HC" ${chipFamilyVal === 'HC' ? 'selected' : ''}>74HC</option>
          <option value="HCT" ${chipFamilyVal === 'HCT' ? 'selected' : ''}>74HCT</option>
          <option value="LVC" ${chipFamilyVal === 'LVC' ? 'selected' : ''}>74LVC</option>
        </select>
      </div>`;
    }

    // ── Counter Value (for chips with counter gates) ──────────────────────
    {
      const counterGates = (def.gates || []).filter(g =>
        typeof g?.type === 'string' && g.type.startsWith('COUNTER_'));
      if (counterGates.length > 0) {
        const vth = getFamilySpec(comp.chipFamily ?? this.state.chipFamily).VTH;
        const readBit = (pinName) => {
          const cp = comp.getPinByName(pinName);
          const v  = cp ? pinVoltage(cp) : undefined;
          if (v === undefined) return undefined;
          return v >= vth ? 1 : 0;
        };
        // Returns the bit position encoded in a Q pin name:
        //   QA→0, QB→1, …, QH→7  |  Q0→0, Q1→1, Q4→4, Q14→14
        // Returns -1 for non-Q pins (RCO, CO, MAX/MIN, etc.)
        const qBitPos = (name) => {
          const m = name.match(/^Q([A-H]|[0-9]+)?$/);
          if (!m) return -1;
          if (!m[1]) return 0;
          return /^[A-H]$/.test(m[1]) ? m[1].charCodeAt(0) - 65 : parseInt(m[1], 10);
        };
        let counterRows = '';
        counterGates.forEach((gate, idx) => {
          const qPins = (gate.outputs || []).filter(n => qBitPos(n) >= 0);
          if (qPins.length === 0) return;
          // Sort LSB→MSB by bit position so index 0 is always the lowest-significance bit
          const sorted = [...qPins].sort((a, b) => qBitPos(a) - qBitPos(b));
          const label = counterGates.length > 1 ? `Counter ${idx + 1}` : 'Count';

          // Decoded (one-hot) counter — Q outputs are mutually exclusive step indicators,
          // not weighted binary bits.  Find the active output and report its step number.
          if (gate.type.includes('DECODED')) {
            const active = sorted.find(n => readBit(n) === 1);
            const stepStr = active !== undefined ? String(qBitPos(active)) : '?';
            counterRows += `<div class="gate-eval-row">` +
              `<span class="gate-eval-expr">${label}: ` +
              `<span class="gate-eval-out gate-eval-hi">${stepStr}</span>` +
              ` <span style="color:#666">(decoded)</span>` +
              `</span></div>`;
            return;
          }

          const bits = sorted.map(readBit);
          const anyUnknown = bits.some(b => b === undefined);
          // Value: use array index (not pin name) as bit weight so that chips whose
          // Q outputs are ordered LSB-first in gate.outputs decode correctly regardless
          // of whether the naming convention is 0-based (Q0=bit0) or 1-based (Q1=bit0).
          let value = 0;
          for (let i = 0; i < bits.length; i++) {
            if (bits[i] === 1) value |= (1 << i);
          }
          // Binary string: sorted is LSB→MSB; reverse → MSB first (standard notation)
          const binStr = bits.map(b => b === undefined ? '?' : b).reverse().join('');
          const valStr = anyUnknown ? '?' : String(value);
          // Explicit bit-significance label so the user knows which pin is MSB/LSB
          const msbPin = sorted[sorted.length - 1];
          const lsbPin = sorted[0];
          const bitLabel = msbPin !== lsbPin ? `${msbPin}..${lsbPin}` : lsbPin;
          counterRows += `<div class="gate-eval-row">` +
            `<span class="gate-eval-expr">${label}: ` +
            `<span class="gate-eval-out gate-eval-hi">${valStr}</span>` +
            ` <span style="color:#666">(${sorted.length}-bit · b${binStr} [${bitLabel}])</span>` +
            `</span></div>`;
        });
        if (counterRows) {
          html += `<div class="gate-eval-section"><div class="gate-eval-title">Counter</div>${counterRows}</div>`;
        }
      }
    }

    // ── 555 Timing Readout (computed from the R/C parts wired to the pins) ─
    {
      const hasTimer = (def.gates || []).some(g => g.type === 'TIMER_555');
      if (hasTimer) {
        const analyses = analyze555Timing(comp, def, nl, this.state.components);
        let rows = '';
        // Grayscale only — no state colors. Mode name bold, values plain,
        // hints/notes dimmed. Each fact on its own line per Dean's layout.
        const row  = (inner) => `<div class="gate-eval-row" style="justify-content:center;text-align:center"><span class="gate-eval-expr">${inner}</span></div>`;
        const mode = (text) => row(`<b style="color:#e0e0e0">${text}</b>`);
        const val  = (text) => row(`<span style="color:#cfcfcf">${text}</span>`);
        const muted = (text) => row(`<span style="color:#888">${text}</span>`);
        for (const a of analyses) {
          const tag = a.label ? `${a.label}: ` : '';
          if (a.mode === 'astable') {
            rows += mode(`${tag}Astable`);
            rows += val(`${fmtFreq(a.freq)} · ${fmtTime(a.period)} period`);
            if (a.r2 > 0) {
              rows += val(`${fmtTime(a.tHigh)} high · ${fmtTime(a.tLow)} low`);
              rows += val(`${(a.duty * 100).toFixed(0)}% duty cycle`);
            }
            if (a.note) rows += muted(a.note);
          } else if (a.mode === 'monostable') {
            rows += mode(`${tag}Monostable`);
            rows += val(`${fmtTime(a.pulse)} pulse`);
          } else if (a.hint) {
            rows += muted(`${tag}${a.hint}`);
          } else {
            rows += muted(`${tag}No RC timing network detected — see Chip Guide below for astable/monostable wiring`);
          }
        }
        html += `<div class="gate-eval-section" style="text-align:center"><div class="gate-eval-title" style="text-align:center">Timing (from connected parts)</div>${rows}</div>`;
      }
    }

    // ── Live Gate Evaluation (combinational chips only) ───────────────────
    {
      const COMB_TYPES = new Set(['AND', 'OR', 'NAND', 'NOR', 'NOT', 'XOR', 'XNOR', 'BUFFER']);
      if (def.gates && def.gates.length > 0 && def.gates.every(g => COMB_TYPES.has(g.type))) {
        const vth = getFamilySpec(comp.chipFamily ?? this.state.chipFamily).VTH;
        const readBit = (pinName) => {
          const cp = comp.getPinByName(pinName);
          const v  = cp ? pinVoltage(cp) : undefined;
          if (v === undefined) return undefined;
          return v >= vth ? 1 : 0;
        };
        const evalGate = (type, bits) => {
          switch (type) {
            case 'AND':    return bits.every(Boolean) ? 1 : 0;
            case 'OR':     return bits.some(Boolean)  ? 1 : 0;
            case 'NAND':   return bits.every(Boolean) ? 0 : 1;
            case 'NOR':    return bits.some(Boolean)  ? 0 : 1;
            case 'NOT':    return bits[0] ? 0 : 1;
            case 'BUFFER': return bits[0] ? 1 : 0;
            case 'XOR':    return bits.reduce((a, b) => a ^ b) ? 1 : 0;
            case 'XNOR':   return bits.reduce((a, b) => a ^ b) ? 0 : 1;
            default:       return undefined;
          }
        };
        let gateRows = '';
        for (let gi = 0; gi < def.gates.length; gi++) {
          const gate    = def.gates[gi];
          const inBits  = gate.inputs.map(readBit);
          const typeLo  = gate.type.toLowerCase();
          const inputStr = inBits.map(b => b === undefined ? '?' : b).join(', ');
          const outBit  = readBit(gate.output);
          const outStr  = outBit === undefined ? '?' : String(outBit);
          const outCls  = outBit === 1 ? ' gate-eval-hi' : outBit === 0 ? ' gate-eval-lo' : '';
          gateRows += `<div class="gate-eval-row">` +
            `<span class="gate-eval-num">${gi + 1}</span>` +
            `<span class="gate-eval-expr">${typeLo}(${inputStr})` +
            ` = <span class="gate-eval-out${outCls}">${outStr}</span></span>` +
            `</div>`;
        }
        html += `<div class="gate-eval-section"><div class="gate-eval-title">Gate State</div>${gateRows}</div>`;
      }
    }

    html += `<div class="chip-help-section">
      ${def.datasheet ? `<a class="chip-datasheet-link" href="${def.datasheet}" target="_blank" rel="noopener">View Datasheet ↗</a>` : ''}
      <div class="chip-help-text">
        ${this._buildChipGuide(def)}
      </div>
    </div>`;

    container.innerHTML = html;

    const familyOverrideSelect = container.querySelector('.chip-family-override-select');
    if (familyOverrideSelect) {
      familyOverrideSelect.addEventListener('change', (e) => {
        comp.chipFamily = e.target.value || null;
        this.onCircuitChanged();
      });
    }

    const helpBtn = container.querySelector('.chip-help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        const helpText = container.querySelector('.chip-help-text');
        const visible = helpText.classList.toggle('chip-help-text-open');
        helpBtn.textContent = visible ? t('sim.hide', { def: 'Hide' }) : t('sim.chipGuide', { def: 'Chip Guide' });
      });
    }
  }
  // ── Chip Guide Generator ──────────────────────────────────────────────────
  _buildChipGuide(def) {
    let html = '';

    // ── How to Use (guide sections) first in sidebar
    if (Array.isArray(def.guideSections)) {
      for (const section of def.guideSections) {
        if (!section?.title) continue;
        html += this._buildChipGuideSection(section);
      }
    }

    // ── Pinout table all pins sorted by number
    html += `<div class="chip-guide-subtitle">Pinout</div>`;
    html += '<table class="chip-guide-table"><tbody>';
    const sorted = [...def.pinout].sort((a, b) => a.pin - b.pin);
    const ACTIVE_LOW_NAMES = new Set(['CLR', 'MR', 'RST', 'RESET', '1CLR', '2CLR', '1MR', '2MR', 'LOAD']);
    const typeColor = t => t === 'input' ? '#8d8' : t === 'output' ? '#e88' : t === 'nc' ? '#888' : '#fd6';
    for (const p of sorted) {
      const al = ACTIVE_LOW_NAMES.has(p.name) || (p.name.length > 1 && p.name.endsWith('n')) || /active[\s-]low/i.test(p.description || '');
      const dn = al && p.name.endsWith('n') ? p.name.slice(0, -1) : p.name;
      const nameCell = al ? `<span style="text-decoration:overline">${dn}</span>` : dn;
      const col = typeColor(p.type);
      html += `<tr><td class="cg-pin">${p.pin}</td><td class="cg-name" style="color:${col}">${nameCell}</td><td class="cg-desc">${this._applyOverlines(this._describePinName(p.name, def))}</td></tr>`;
    }
    html += '</tbody></table>';

    // ── Chip Explanation (overview) last in sidebar
    const overview = this._chipOverview(def);
    if (overview) html += `<div class="chip-guide-overview">${this._applyOverlines(overview)}</div>`;

    return html;
  }

  _buildChipGuideSection(section) {
    let html = `<div class="chip-guide-subtitle">${this._escapeHtml(section.title)}</div>`;

    if (section.image?.src) {
      const alt = this._escapeHtml(section.image.alt || section.title);
      html += `<figure class="chip-guide-figure">` +
        `<img class="chip-guide-image" src="${section.image.src}" alt="${alt}">`;
      if (section.image.caption) {
        html += `<figcaption class="chip-guide-caption">${this._escapeHtml(section.image.caption)}</figcaption>`;
      }
      html += `</figure>`;
    }

    for (const paragraph of section.paragraphs || []) {
      html += `<div class="chip-guide-paragraph">${this._applyOverlines(this._escapeHtml(paragraph))}</div>`;
    }

    if (Array.isArray(section.formulas) && section.formulas.length) {
      html += '<div class="chip-guide-formulas">';
      for (const formula of section.formulas) {
        html += `<div class="chip-guide-formula">${this._escapeHtml(formula)}</div>`;
      }
      html += '</div>';
    }

    if (Array.isArray(section.list) && section.list.length) {
      html += '<ul class="chip-guide-list">';
      for (const item of section.list) {
        html += `<li>${this._applyOverlines(this._escapeHtml(item))}</li>`;
      }
      html += '</ul>';
    }

    if (section.note) {
      html += `<div class="chip-guide-paragraph">${this._applyOverlines(this._escapeHtml(section.note))}</div>`;
    }

    return html;
  }

  // Convert "PINNAME (active LOW)" to overline HTML in already-safe text.
  _applyOverlines(html) {
    return html
      .replace(/\b([A-Z][A-Z0-9]+)n(_[A-Z0-9]+)/g,
        '<span style="text-decoration:overline">$1</span>$2')
      .replace(/\b([A-Z][A-Z0-9]+)n\b/g,
        '<span style="text-decoration:overline">$1</span>')
      .replace(/\b([A-Z][A-Z0-9]{1,})\s*\(active LOW\)/g,
        '<span style="text-decoration:overline">$1</span>');
  }

  _escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  _chipOverview(def) {
    if (def.guideOverview) return def.guideOverview;

    const gt = def.gates?.[0]?.type ?? '';
    const gateCount = def.gates?.length ?? 0;
    const multi = gateCount > 1 ? `${gateCount}x ` : '';

    switch (gt) {
      case 'NAND':
        return `${multi}NAND gate. Output is LOW only when all inputs are HIGH otherwise HIGH. The NAND is a universal gate: any logic function can be built from NANDs alone.`;
      case 'NOR':
        return `${multi}NOR gate. Output is HIGH only when all inputs are LOW otherwise LOW. Like NAND, NOR is universal and can implement any Boolean function.`;
      case 'AND':
        return `${multi}AND gate. Output is HIGH only when all inputs are HIGH otherwise LOW.`;
      case 'OR':
        return `${multi}OR gate. Output is HIGH when any input is HIGH, LOW only when all inputs are LOW.`;
      case 'NOT':
        return `${multi}Inverter. Each gate drives its output to the logical complement of its input: HIGH in → LOW out, LOW in → HIGH out.`;
      case 'XOR':
        return `${multi}Exclusive-OR gate. Output is HIGH when the two inputs differ. Useful for parity generation, binary addition, and controlled inversion.`;
      case 'XNOR':
        return `${multi}Exclusive-NOR gate. Output is HIGH when both inputs match. Opposite of XOR useful for equality detection.`;
      case 'BUFFER':
        return `${multi}Non inverting buffer. Output follows the input with no logic inversion. Used to boost drive strength when a signal needs to fan out to many loads.`;
      case 'AOI_2WIDE':
      case 'AOI_4WIDE':
        return 'AND OR-INVERT gate. Each section ANDs a group of inputs, the results are OR-ed together, and the whole thing is inverted all in one stage. Efficient way to implement sum-of-products (SOP) logic without chaining separate gates.';
      case 'DECODER_2TO4':
        return '2-to-4 line decoder. The 2 bit address (A, B) selects exactly one of four active LOW outputs; the rest stay HIGH. Enable must be asserted. Useful for chip-select generation and small demux tasks.';
      case 'DECODER_3TO8':
        return '3 to 8 line decoder / demultiplexer. The 3 bit address drives exactly one of eight active LOW outputs LOW while the rest stay HIGH. Three enable pins must all be satisfied. Standard address decoder for memory banking and bus expansion.';
      case 'DECODER_4TO16':
        return '4-to-16 line decoder. The 4 bit address selects one of 16 active LOW outputs. Enable input lets you cascade two chips to build a 5-to-32 decoder.';
      case 'BCD_DECIMAL':
        return 'BCD to-decimal decoder. Converts a 4 bit BCD digit (0 9) so that the corresponding decimal output goes LOW while the rest stay HIGH. Inputs 10 15 drive all outputs HIGH (blanked). Designed for driving indicator lamps or relay banks.';
      case 'MUX_8TO1':
        return '8-to-1 multiplexer. A 3 bit select code routes one of eight data inputs to the output. Both true (Y) and complemented (W) outputs are available. Enable input disables both outputs when HIGH.';
      case 'MUX_16TO1':
        return '16-to-1 multiplexer. A 4 bit select code routes one of 16 data inputs to the output. Active LOW enable; both true and complement outputs available. Useful as a 16 bit look-up table or data selector.';
      case 'D_FF_QUAD':
        return 'Quad D flip flop. Four independent edge triggered D flip flops, each with its own clock, set, and clear. Each captures its D input on the rising clock edge and holds it until the next.';
      case 'D_FF_HEX':
        return 'Hex D flip flop. Six D flip flops sharing a common clock and a common active LOW clear. All six capture their D inputs simultaneously on the rising clock edge.';
      case 'D_FF_OCTAL':
        return 'Octal D flip flop. Eight D flip flops on a shared clock. All eight capture their D inputs on the rising edge in lock-step. The classic 8 bit pipeline register and bus latch.';
      case 'D_FF_OCTAL_TRI':
        return 'Octal D flip flop with tri state outputs. Like the octal D-FF, but the outputs go high-impedance when OE is deasserted letting you connect multiple chips directly on a shared data bus.';
      case 'D_LATCH_OCTAL_TRI':
        return 'Octal transparent D latch with tri state outputs. While LE is HIGH, outputs follow their D inputs in real time. When LE goes LOW, the last value is captured and held. OE = HIGH puts all outputs in high-Z so the bus is free for other drivers.';
      case 'ADDRESSABLE_LATCH':
        return '1-of-8 addressable latch (demux with memory). A 3 bit address selects which of the eight output latches receives the D input. In latch mode each selected bit stores independently; in demux mode the addressed output follows D while the rest hold. Handy for expanding a single control line to eight independent outputs.';
      case 'COUNTER_4BIT':
        return '4 bit binary ripple counter. Each flip flop output clocks the next stage, dividing the input frequency by 2 each time for an overall ÷16. Async clear resets all four bits immediately.';
      case 'COUNTER_DECADE':
        return 'Decade ripple counter. Counts in binary from 0 to 9, then automatically resets to 0 on the next clock a divide by-10 cascade. Pair QA (÷2) with QD (÷5) for independent divider stages.';
      case 'COUNTER_DIV12':
        return 'Divide by-12 ripple counter. An internal feedback network resets at 12, giving a 12-state binary sequence. Used in 12-hour clock displays and frequency synthesizer chains.';
      case 'COUNTER_SYNC_BIN':
        return '4 bit synchronous binary counter. All flip flops clock simultaneously no ripple, no glitches. Counts 0 15, cascadable via ripple-carry output. Two count-enable pins (EP, ET) give you look ahead carry capability.';
      case 'COUNTER_SYNC_BIN_SC':
        return '4 bit synchronous binary counter with synchronous clear. Identical to the standard sync binary counter except the clear takes effect on the next rising clock edge rather than immediately avoiding timing hazards in high speed designs.';
      case 'COUNTER_SYNC_DECADE':
        return '4 bit synchronous decade counter. Counts 0 9 with all flip flops clocking simultaneously. Resets synchronously on the 10th clock. Cascadable for multi-digit BCD counting.';
      case 'COUNTER_UPDOWN':
        return '4 bit synchronous up/down binary counter. Counts up (0→15) or down (15→0) depending on the U/D control pin. Parallel load lets you preset any starting value. Cascadable via MAX/MIN terminal-count output.';
      case 'COUNTER_UPDOWN_DC':
        return '4 bit synchronous up/down decade counter. Same as the up/down binary counter but resets at 9 when counting up (0→9) or at 0 when counting down. Produces a BCD output suitable for driving decoders directly.';
      case 'SHIFT_REG_4BIT':
        return '4 bit universal shift register. Can shift left, shift right, load parallel data, or hold controlled by two mode pins (S0, S1). Cascade the serial output to a second chip to build wider shift registers.';
      case 'SHIFT_REG_SIPO':
        return 'Serial in, parallel out shift register. Data enters one bit per clock via the serial input; all bits appear simultaneously on the parallel outputs. Expands a serial data stream into parallel form the building block of SPI receivers and LED drivers.';
      case 'SHIFT_REG_PISO':
        return 'Parallel in, serial out shift register. Loads 8 bits of parallel data in one shot, then clocks them out serially one bit at a time. Used to serialize a byte for transmission over a single wire.';
      case 'SHIFT_REG_LATCH':
        return 'Shift register with separated storage latch. Data shifts through an 8 bit register privately; the outputs only update when you fire the storage-register clock (RCLK). Prevents glitchy transitions while the shift is in progress essential for driving LEDs or other visible loads cleanly.';
      case 'REG_4BIT_TRI':
        return '4 bit register with tri state outputs. Stores 4 bits on the clock edge; the OE pin puts all outputs in high-impedance so the register can sit on a shared bus without driving it.';
      case 'PRIORITY_ENC_8TO3':
        return '8 to 3 priority encoder. Scans eight active LOW inputs and outputs the 3 bit binary code for the highest-numbered asserted input. If multiple inputs are active at once, the highest wins. Cascade EO → EI to build a 16-to-4 (or wider) encoder.';
      case 'COMPARATOR_4BIT':
        return '4 bit magnitude comparator. Compares two 4 bit binary words A and B and asserts one of three outputs: A>B, A=B, or A<B. Cascade inputs (AGTBIN, AEQBIN, ALTBIN) let you chain chips for 8 bit, 12 bit, or wider comparisons.';
      case 'ADDER_4BIT':
        return '4 bit binary full adder. Adds two 4 bit numbers (A0 A3, B0 B3) plus a carry in (C0) and produces a 4 bit sum (S0 S3) and carry out (C4). Wire C4 to C0 of the next chip to build an 8 bit or wider adder.';
      case 'TRANSCEIVER_8BIT':
        return '8 bit bidirectional bus transceiver. Passes data between two 8 bit buses. DIR controls which direction: A→B or B→A. OE disables all drivers and puts both sides in high-Z when not needed. Typical use: isolating a CPU bus from a peripheral bus.';
      case 'RAM_16X4':
        return '16×4 bit static RAM. Sixteen 4 bit locations addressed by A0 A3. Write enable (WE, active LOW) stores whatever is on the data inputs to the selected address. Output enable (OE, active LOW) drives the stored value onto the outputs. Use as a 16-entry look-up table or small scratchpad.';
      case 'TIMER_555':
        return 'General purpose timer / oscillator. The 555 watches analog voltages on TRIG and THRESH, flips an internal latch when they cross its reference levels, and controls both OUTPUT and the DISCHARGE transistor from that latch state.';
      default:
        return '';
    }
  }

  _describePinName(name, def) {
    const n = name.toUpperCase();
    if (def.guidePinDescriptions) {
      for (const [pinName, description] of Object.entries(def.guidePinDescriptions)) {
        if (pinName.toUpperCase() === n) return description;
      }
    }

    const gateType = def.gates?.[0]?.type ?? '';
    const isLogicGate = ['AND', 'OR', 'NAND', 'NOR', 'NOT', 'XOR', 'XNOR', 'BUFFER'].includes(gateType);
    const isDecoder   = gateType.startsWith('DECODER');
    const isBCD       = gateType.startsWith('BCD');
    const isComparator = gateType === 'COMPARATOR_4BIT';
    const isAdder     = gateType === 'ADDER_4BIT';
    const isCounter   = gateType.startsWith('COUNTER');
    const isShift     = gateType.startsWith('SHIFT');
    const isRAM       = gateType === 'RAM_16X4';
    const isAOI       = gateType === 'AOI_2WIDE' || gateType === 'AOI_4WIDE';

    // ── Power
    if (n === 'VCC') return 'Power input';
    if (n === 'GND') return 'Ground';

    // ── No connect
    if (/^NC\d*$/.test(n)) return 'No connect leave unconnected';

    // ── Clock
    if (n === 'CLK' || n === 'CK' || n === 'CP') return 'Clock input, rising edge triggered';
    if (n === 'UP')   return 'Count-up clock increments on rising edge';
    if (n === 'DOWN') return 'Count-down clock decrements on rising edge';
    if (/^\d+CLK$/.test(n)) { const g = n.match(/^(\d+)/)[1]; return `Clock for flip flop ${g}, rising edge triggered`; }
    if (n === 'CLKINH') return 'Clock inhibit HIGH blocks the clock';

    // ── Async clear / preset
    if (n === 'CLR' || n === 'MR') return 'Clear, active LOW forces all outputs to 0';
    if (n === 'SRCLR')             return 'Shift register clear, active LOW resets all bits to 0';
    if (n === 'PRE' || n === 'SD') return 'Preset, active LOW forces Q HIGH';
    if (/^\d+CLR$/.test(n)) { const g = n.match(/^(\d+)/)[1]; return `Clear for flip flop ${g}, active LOW`; }
    if (/^\d+PRE$/.test(n)) { const g = n.match(/^(\d+)/)[1]; return `Preset for flip flop ${g}, active LOW`; }

    // ── Output / input enables
    if (n === 'OE')  return 'Output enable, active LOW outputs are high-Z when HIGH';
    if (n === '1OE') return 'Output enable for bus 1, active LOW';
    if (n === '2OE') return 'Output enable for bus 2, active LOW';
    if (n === 'OE1') return 'Output enable 1, active LOW';
    if (n === 'OE2') return 'Output enable 2, active LOW';
    if (n === 'IE1') return 'Input enable 1, active LOW HIGH disables data loading';
    if (n === 'IE2') return 'Input enable 2, active LOW HIGH disables data loading';

    // ── Decoder / gate enable pins
    if (n === 'G1') {
      const hasG2A = def.pinout.some(p => p.name.toUpperCase() === 'G2A');
      return hasG2A ? 'Enable input, active HIGH chip off when LOW' : 'Enable input, active LOW';
    }
    if (n === 'G2' || n === 'G2A' || n === 'G2B') return 'Enable input, active LOW chip off when HIGH';
    if (/^\d+G$/.test(n)) {
      return gateType === 'NOR' ? 'Strobe HIGH forces output LOW' : 'Enable input, active LOW';
    }
    if (n === 'ME') return 'Memory enable, active LOW';

    // ── Latch / register controls
    if (n === 'LE')    return 'Latch enable transparent when HIGH, latches on falling edge';
    if (n === 'SRCLK') return 'Shift register clock shifts data on rising edge';
    if (n === 'RCLK')  return 'Storage register clock latches shift data on rising edge';
    if (n === 'WE')    return 'Write enable, active LOW';
    if (n === 'SH/LD') return 'Shift/load HIGH shifts, LOW loads parallel data';

    // ── Count / direction controls
    if (n === 'CE' || n === 'EP' || n === 'ET' || n === 'CEP' || n === 'CET' || n === 'CTEN') return 'Count enable, active LOW';
    if (n === 'PE' || n === 'LOAD') return 'Parallel load, active LOW loads preset data on next clock';
    if (n === 'U/D' || n === 'D/U') return 'Count direction HIGH counts up, LOW counts down';
    if (n === 'DIR') return 'Direction HIGH: A→B, LOW: B→A';
    if (n === 'S' || n === 'SEL') return 'Select chooses between data inputs';

    // ── Comparator cascade / result pins
    if (n === 'AGTBIN') return 'Cascade A>B input from previous stage (tie LOW if no cascade)';
    if (n === 'AEQBIN') return 'Cascade A=B input from previous stage (tie HIGH if first stage)';
    if (n === 'ALTBIN') return 'Cascade A<B input from previous stage (tie LOW if no cascade)';
    if (n === 'AGTB')   return 'Output: A is greater than B';
    if (n === 'AEQB')   return 'Output: A equals B';
    if (n === 'ALTB')   return 'Output: A is less than B';

    // ── Counter carry / terminal count
    if (n === 'TC' || n === 'RCO') return 'Ripple carry / terminal count output';
    if (n === 'CO')      return 'Carry output';
    if (n === 'BO')      return 'Borrow output';
    if (n === 'MAX/MIN') return 'Terminal count HIGH at max when counting up, at min when counting down';

    // ── 7 segment display controls
    if (n === 'BI/RBO') return 'Blanking input / ripple blank output, active LOW';
    if (n === 'RBI')    return 'Ripple blanking input, active LOW blanks leading zeros';
    if (n === 'LT')     return 'Lamp test, active LOW lights all segments';

    // ── Serial / shift register
    if (n === 'SER' || n === 'SI') return 'Serial data input';
    if (n === 'QHS')               return 'Serial cascade output connect to SER of next chip';
    if (n === 'QHN')               return 'Inverted serial output (Q̅H)';

    // ── Priority encoder
    if (n === 'EI') return 'Enable input, active LOW';
    if (n === 'EO') return 'Enable output connect to EI of next encoder to daisy-chain';
    if (n === 'GS') return 'Group signal output HIGH when any input is active';

    // ── Adder carry
    if (n === 'C0') return 'Carry in tie to GND for standalone use, or to C4 of previous stage';
    if (n === 'C4') return 'Carry out connect to C0 of next adder stage to cascade';

    // ── Double-indexed pins: 1A1, 2B3, etc. (AOI groups or bus driver banks)
    const doubleMatch = n.match(/^(\d+)([A-Z])(\d+)$/);
    if (doubleMatch) {
      const [, gNum, group, idx] = doubleMatch;
      if (isAOI) return `Gate ${gNum}, AND group ${group}, input ${idx}`;
      return `Bus ${gNum}, channel ${idx} ${group === 'Y' ? 'output' : 'input'}`;
    }

    // ── JK flip flop inputs: 1J, 2J, 1K, 2K, 3J, 3K
    const jkMatch = n.match(/^(\d+)([JK])$/);
    if (jkMatch) {
      const [, idx, type] = jkMatch;
      return `${type === 'J' ? 'J (set)' : 'K (reset)'} input ${idx}`;
    }

    // ── Numbered gate inputs: 1A, 2B, 3C (single letter A-D, logic gates)
    const gateInputMatch = n.match(/^(\d+)([A-D])$/);
    if (gateInputMatch) {
      const [, gNum, letter] = gateInputMatch;
      return `Gate ${gNum}, input ${letter}`;
    }

    // ── Numbered gate outputs: 1Y, 2Y (no trailing digit)
    const outMatch = n.match(/^(\d+)Y$/);
    if (outMatch) {
      return `Gate ${outMatch[1]} output`;
    }

    // ── Decoder / demux outputs: Y0-Y15 and prefixed 1Y0-2Y3
    const yDecMatch = n.match(/^(\d+)?Y(\d+)$/);
    if (yDecMatch) {
      const prefix = yDecMatch[1];
      const idx    = parseInt(yDecMatch[2]);
      const pre    = prefix ? `Gate ${prefix}, ` : '';
      if (isDecoder) {
        const bits = gateType === 'DECODER_2TO4' ? 2 : gateType === 'DECODER_4TO16' ? 4 : 3;
        const addrLabels = ['A', 'B', 'C', 'D'].slice(0, bits).join('');
        return `${pre}output ${idx}, LOW when ${addrLabels} = ${idx.toString(2).padStart(bits, '0')}`;
      }
      if (isBCD) return `${pre}output ${idx}, LOW when BCD = ${idx}`;
      return `${pre}output ${idx}`;
    }

    // ── Single output Y (e.g. 7430, 7454)
    if (n === 'Y') return 'Gate output';

    // ── Numbered D inputs: 1D-8D (individual flip flop data)
    if (/^\d+D$/.test(n)) {
      const num = n.match(/^(\d+)/)[1];
      return `Data input for flip flop / register ${num}`;
    }

    // ── Numbered Q outputs: 1Q-8Q, 1Qn-4Qn
    const numberedQMatch = n.match(/^(\d+)(QN?)$/);
    if (numberedQMatch) {
      const [, num, qType] = numberedQMatch;
      return qType === 'QN' ? `Inverted Q output (Q̅) for flip flop ${num}` : `Q output for flip flop ${num}`;
    }

    // ── Numbered CLK/CLR not already caught (e.g. 1CLK via regex above already handles it)

    // ── Plain Q / Qn
    if (n === 'Q')  return 'Q output';
    if (n === 'QN') return 'Inverted Q output (Q̅)';

    // ── QA-QH (counter / shift register bit outputs)
    if (/^Q[A-H]$/.test(n)) {
      const bit = n.charCodeAt(1) - 'A'.charCodeAt(0);
      const lsb = bit === 0 ? ' (LSB)' : '';
      return `Bit ${bit} output${lsb}`;
    }

    // ── 7 segment outputs: a-g, dp
    if (/^[a-g]$/.test(name)) return `Segment ${name}`;
    if (name === 'dp' || n === 'DP') return 'Decimal point segment';

    // ── Comparator operand inputs
    if (isComparator) {
      const cmp = n.match(/^([AB])(\d)$/);
      if (cmp) return `${cmp[1] === 'A' ? 'A-side' : 'B-side'} input, bit ${cmp[2]}`;
    }

    // ── Adder operand / sum pins
    if (isAdder) {
      const add = n.match(/^([AB])(\d)$/);
      if (add) return `${add[1] === 'A' ? 'Addend' : 'Augend'} bit ${add[2]}`;
      const sum = n.match(/^S(\d)$/);
      if (sum) return `Sum output, bit ${sum[1]}`;
    }

    // ── Transceiver bus pins A1-A8, B1-B8
    if (gateType === 'TRANSCEIVER_8BIT') {
      const bus = n.match(/^([AB])(\d)$/);
      if (bus) return `Bus ${bus[1]}, channel ${bus[2]}`;
    }

    // ── Address bits A0-A9
    if (/^A\d$/.test(n)) {
      if (isRAM) return `Address bit ${n[1]}`;
      return `Address bit ${n[1]}`;
    }

    // ── B-side data B0-B9 (general)
    if (/^B\d$/.test(n)) return `B-side bit ${n[1]}`;

    // ── Select bits S0-S3
    if (/^S\d$/.test(n)) return `Select bit ${n[1]}`;

    // ── Data bus D0-D7, I0-I7
    if (/^D\d$/.test(n)) return isRAM ? `Data input bit ${n[1]}` : `Data bit ${n[1]}`;
    if (/^I\d$/.test(n)) return `Data input bit ${n[1]}`;

    // ── RAM data outputs O1-O4
    if (/^O\d$/.test(n)) return `Data output bit ${n[1]}`;

    // ── Single-letter gate inputs (A-H on wide logic gates like 7430)
    if (isLogicGate && /^[A-H]$/.test(n)) return `Gate input ${n}`;

    // ── Context-sensitive single-letter pins
    if (n === 'A') {
      if (gateType === 'SHIFT_REG_SIPO') return 'Serial data input (AND gated with B)';
      if (isShift)   return 'Parallel load data, bit 0';
      if (isCounter) return 'Parallel load data, bit 0';
      if (isDecoder || isBCD) return 'Address/BCD bit 0 (LSB)';
      return 'Input A';
    }
    if (n === 'B') {
      if (gateType === 'SHIFT_REG_SIPO') return 'Serial data input (AND gated with A)';
      if (isShift)   return 'Parallel load data, bit 1';
      if (isCounter) return 'Parallel load data, bit 1';
      if (isDecoder || isBCD) return 'Address/BCD bit 1';
      return 'Input B';
    }
    if (n === 'C') {
      if (isDecoder || isBCD) return 'Address/BCD bit 2';
      if (isCounter || isShift) return 'Parallel load data, bit 2';
      return 'Latch enable transparent when HIGH';
    }
    if (n === 'D') {
      if (isDecoder || isBCD) return 'Address/BCD bit 3 (MSB)';
      if (isCounter || isShift) return 'Parallel load data, bit 3';
      return 'Data input';
    }
    if (n === 'E') {
      if (isShift || isCounter) return 'Parallel load data, bit 4';
      return 'Gate input E';
    }
    if (n === 'F') {
      if (isShift || isCounter) return 'Parallel load data, bit 5';
      return 'Gate input F';
    }
    if (n === 'G') {
      if (isShift || isCounter) return 'Parallel load data, bit 6';
      return 'Gate input G';
    }
    if (n === 'H') {
      if (isShift || isCounter) return 'Parallel load data, bit 7';
      return 'Gate input H';
    }

    // ── Plain J/K inputs
    if (n === 'J') return 'J input set on clock edge';
    if (n === 'K') return 'K input reset on clock edge';

    return '';
  }

  // ── Undo ─────────────────────────────────────────────────────────────────────
  pushUndo() {
    const snapshot = serializeState(this.state);
    this.undoStack.push(JSON.parse(JSON.stringify(snapshot)));
    if (this.undoStack.length > 50) this.undoStack.shift();
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const snapshot = this.undoStack.pop();
    deserializeState(snapshot, this.state, this.world);
    this._rebuildWorldTiles();
    this.textBoxManager.deserialize(this.state.textBoxes ?? []);
    this.imageBoxManager.deserialize(this.state.imageBoxes ?? []);
    this.state.selectedItems = [];
    this._resetTransientRefs();
    this.onCircuitChanged();
  }

  // ── Breadboard management ─────────────────────────────────────────────────
  _rebuildWorldTiles() {
    // Reset to initial 2x2 tiles only
    this.world.tiles = this.world.tiles.filter(t => this.world.isInitialTile(t.tileX, t.tileY));
    // Re-add extra tiles from state
    for (const { tx, ty } of (this.state.extraTiles || [])) {
      this.world.addTile(tx, ty);
    }
  }

  addBreadboard(tx, ty) {
    if (!this.world.addTile(tx, ty)) return;
    this.state.extraTiles = [...(this.state.extraTiles || []), { tx, ty }];
    saveToLocalStorage(this.state);
  }

  deleteBreadboard(tx, ty) {
    if (this.world.isInitialTile(tx, ty)) return;
    this.pushUndo();
    // Remove components whose pins are on this tile
    const removedIds = new Set();
    this.state.components = this.state.components.filter(comp => {
      if (!comp.placed) return true;
      const onTile = comp.pins.some(p => {
        const h = parseHoleId(p.holeId);
        return h.tileX === tx && h.tileY === ty;
      });
      if (onTile) removedIds.add(comp.id);
      return !onTile;
    });
    // Drop retained drive states/couplings for the removed components.
    this.simulator.purgeComponentStates(removedIds);
    // Remove wires with endpoints on this tile
    this.state.wireManager.wires = this.state.wireManager.wires.filter(wire => {
      const s = parseHoleId(wire.startHoleId);
      const en = parseHoleId(wire.endHoleId);
      return !((s.tileX === tx && s.tileY === ty) || (en.tileX === tx && en.tileY === ty));
    });
    this.world.removeTile(tx, ty);
    this.state.extraTiles = (this.state.extraTiles || []).filter(t => !(t.tx === tx && t.ty === ty));
    if (this.currentInfoComp) {
      const infoHole = this.currentInfoComp.pins[0] && parseHoleId(this.currentInfoComp.pins[0].holeId);
      if (infoHole && infoHole.tileX === tx && infoHole.tileY === ty) {
        this._closeInfoPanel();
      }
    }
    this.onCircuitChanged();
  }

  // ── Selection ────────────────────────────────────────────────────────────────
  selectAll() {
    const items = [];
    for (const comp of this.state.components) {
      items.push({ type: 'component', ref: comp });
    }
    for (const wire of this.state.wireManager.wires) {
      items.push({ type: 'wire', ref: wire });
    }
    this.state.selectedItems = items;
  }

  deleteSelected() {
    if (this.state.selectedItems.length === 0) return;
    const floatingInput = document.getElementById('floating input-overlay');
    if (floatingInput) floatingInput.remove();
    this.pushUndo();
    const compIds = new Set();
    const wireIds = new Set();
    for (const item of this.state.selectedItems) {
      if (item.type === 'component') compIds.add(item.ref.id);
      else if (item.type === 'wire') wireIds.add(item.ref.id);
    }
    const deletedHoles = new Set();
    for (const comp of this.state.components) {
      if (compIds.has(comp.id)) {
        for (const h of comp.getOccupiedHoles()) deletedHoles.add(h);
      }
    }
    this.state.wireManager.wires = this.state.wireManager.wires.filter(w =>
      !wireIds.has(w.id) && !deletedHoles.has(w.startHoleId) && !deletedHoles.has(w.endHoleId)
    );
    this.state.components = this.state.components.filter(c => !compIds.has(c.id));
    // Drop retained drive states/couplings for the deleted components so
    // orphans can't keep driving nets at their old hole positions.
    this.simulator.purgeComponentStates(compIds);
    this.state.selectedItems = [];
    if (this.currentInfoComp && compIds.has(this.currentInfoComp.id)) {
      this._closeInfoPanel();
    }
    // Close the probe panel if its component or wire was just deleted.
    if (this.currentProbe) {
      const p = this.currentProbe;
      if ((p.comp && compIds.has(p.comp.id)) ||
          (p.kind === 'wire' && wireIds.has(p.wire.id))) {
        this._closeInfoPanel();
      }
    }
    // If any in-flight interaction ref points at a deleted component, drop the
    // entire interaction (held buttons, drag ghosts, bounce timers).
    const ix = this.interaction;
    const stale =
      (ix._pressedButton && compIds.has(ix._pressedButton.id)) ||
      (ix._movingComp && compIds.has(ix._movingComp.id)) ||
      (ix._moveTarget && compIds.has(ix._moveTarget.id)) ||
      (ix._bounceComp && compIds.has(ix._bounceComp.id)) ||
      ix._movingComps.some(m => compIds.has(m.comp.id));
    if (stale) ix.resetAll();
    this.onCircuitChanged();
  }

  // ── Clipboard ───────────────────────────────────────────────────────────────
  copySelected() {
    if (this.state.selectedItems.length === 0) return;
    const components = [];
    const wires = [];
    for (const item of this.state.selectedItems) {
      if (item.type === 'component') components.push(item.ref.serialize());
      else if (item.type === 'wire') wires.push(item.ref.serialize());
    }
    this.clipboard = { components, wires };
  }

  pasteClipboard() {
    if (!this.clipboard) return;
    if (this.clipboard.components.length === 0 && this.clipboard.wires.length === 0) return;

    // All paste flows route through the ghost preview: the cluster (components +
    // wires) follows the cursor; left-click commits. Matches single-chip paste
    // and lands "where the mouse is" instead of at a fixed offset from origin.
    this.interaction.startPastePreview(this.clipboard);
  }

  cutSelected() {
    this.copySelected();
    this.deleteSelected();
  }
  // ── Circuit Changed Callback ───────────────────────────────────────────────
  onCircuitChanged() {
    if (this._dirty !== undefined) this._dirty = true;
    this._renderDirty = true;
    this.lastInteractionTime = Date.now();
    // Reassign wire nets from physical connectivity before anything reads
    // wire.startNet, so stale numbers from any mutation path (drag, paste,
    // undo, future code) can't leak into the simulator or renderer.
    this.state.wireManager.recomputeNets(this.world);
    // Run circuit simulation (voltages, currents, LEDs, 7-segs)
    this.simulator.evaluate(this.world, this.state.components, this.state.wireManager);
    // Start/restart time-stepping loop for capacitor-based circuits
    this.simulator.startTimeLoop(this.world, this.state.components, this.state.wireManager, () => {
      // Callback after each time step refresh display
      // Do NOT call saveToLocalStorage here circuit topology doesn't change
      // during time-stepping and calling JSON.stringify 50×/s is wasteful.
      this._renderDirty = true;
      this._updateStatusBar();
      // Refresh Circuit Analyzer so cap charge/voltage track time-stepping.
      // Throttle to ~10Hz; full HTML rebuild is too heavy at 50Hz.
      if (this.state.showCircuitInfo) {
        const now = performance.now();
        if (now - (this._lastAnalyzerRefresh || 0) >= 100) {
          this._lastAnalyzerRefresh = now;
          this._showCircuitInfo();
        }
      }
      // Refresh chip side panel so pin voltages track time-stepping too.
      // Skip the rebuild if the user is interacting with a control in the
      // panel (e.g. an open <select> dropdown) — replacing the element while
      // its native popup is open silently dismisses the popup.
      if (this.currentInfoComp) {
        const now = performance.now();
        if (now - (this._lastChipInfoRefresh || 0) >= 100) {
          const ae = document.activeElement;
          const panel = document.getElementById('side-panel');
          const userInteracting = ae && panel && panel.contains(ae) &&
            (ae.tagName === 'SELECT' || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
          if (!userInteracting) {
            this._lastChipInfoRefresh = now;
            const _c = this.currentInfoComp;
            if (_c.type === COMP.BUTTON || _c.type === COMP.PUSH_BUTTON || _c.type === COMP.SWITCH) {
              this.showInputContextPanel(_c);
            } else if (_c.type === COMP.SLIDE_SWITCH) {
              this.showSlideContextPanel(_c);
            } else if (_c.type === COMP.DIP_SWITCH) {
              this.showDipSwitchContextPanel(_c);
            } else if (_c.type === COMP.CLOCK) {
              this.showClockContextPanel(_c);
            } else if (_c.type === COMP.CRYSTAL) {
              // Crystal panel is static (no live readouts) — skip the periodic
              // rebuild, which would detach a preset button mid-click while
              // the crystal's edges keep the time loop solving.
            } else {
              this.showChipInfo(_c);
            }
          }
        }
      }
      // Refresh the probe panel so its voltage/current track time-stepping too.
      if (this.currentProbe) {
        const now = performance.now();
        if (now - (this._lastProbeRefresh || 0) >= 100) {
          this._lastProbeRefresh = now;
          this.showProbePanel(this.currentProbe);
        }
      }
    });
    debouncedSave(this.state);
    // Snapshot for cached projects list on structural changes
    const structHash =
      this.state.components.filter(c => c.placed).length + ':' +
      this.state.wireManager.wires.length;
    if (structHash !== this._lastStructuralHash) {
      this._lastStructuralHash = structHash;
      const sticky = getStoredFilename();
      const snapName = (sticky || suggestCircuitName(this.state.components)).replace(/\.json$/i, '');
      saveProjectSnapshot(this.state, this._currentProjectId, snapName);
    }
    // Update bottom status bar (overcurrent errors + red outlines)
    this._updateStatusBar();
    // Only refresh the info panel if a chip/7-seg is currently being viewed
    if (this.currentInfoComp) {
      const _c = this.currentInfoComp;
      if (_c.type === COMP.BUTTON || _c.type === COMP.PUSH_BUTTON || _c.type === COMP.SWITCH) {
        this.showInputContextPanel(_c);
      } else if (_c.type === COMP.SLIDE_SWITCH) {
        this.showSlideContextPanel(_c);
      } else if (_c.type === COMP.CLOCK) {
        this.showClockContextPanel(_c);
      } else if (_c.type === COMP.CRYSTAL) {
        this.showCrystalContextPanel(_c);
      } else {
        this.showChipInfo(_c);
      }
    }
    // Refresh the probe panel (right-click wire/LED readout) if open
    if (this.currentProbe) {
      this.showProbePanel(this.currentProbe);
    }
    // Refresh logic analyzer if open
    if (this.state.showLogicView) {
      this._showLogicAnalyzer();
    }
    // Refresh circuit info if open
    if (this.state.showCircuitInfo) {
      this._showCircuitInfo();
    }
  }

  // ── Logic Analyzer ───────────────────────────────────────────────────────
  _showLogicAnalyzer() {
    this.state.showLogicView = true;
    this.state.showCircuitInfo = false;
    this.currentInfoComp = null;
    this.currentProbe = null;

    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;
    title.textContent = 'Combinational Logic Analyzer';

    const btnLogic = document.getElementById('btn-logic');
    btnLogic.classList.add('active');

    const comps = this.state.components.filter(c => c.placed);

    // Build auto-numbered labels
    // Switches → S1, S2...  Buttons → B1, B2...  LEDs → LED1, LED2...
    const switches = comps.filter(c => c.type === COMP.SWITCH || c.type === COMP.SLIDE_SWITCH).sort((a, b) => a.id - b.id);
    const buttons = comps.filter(c => c.type === COMP.BUTTON || c.type === COMP.PUSH_BUTTON).sort((a, b) => a.id - b.id);
    const leds = comps.filter(c => c.type === COMP.LED).sort((a, b) => a.id - b.id);

    const labels = new Map(); // compId → label
    const internalToFriendly = new Map(); // internal analyzer name → friendly name

    let sIdx = 1;
    for (const sw of switches) {
      const label = `S${sIdx++}`;
      labels.set(sw.id, label);
      const internalName = `${sw.name}${sw.id}`;
      internalToFriendly.set(internalName, label);
    }

    let bIdx = 1;
    for (const btn of buttons) {
      const label = `B${bIdx++}`;
      labels.set(btn.id, label);
      const internalName = `${btn.name}${btn.id}`;
      internalToFriendly.set(internalName, label);
    }

    let ledIdx = 1;
    for (const led of leds) {
      const label = `LED${ledIdx++}`;
      labels.set(led.id, label);
    }

    this.state.logicLabels = labels;

    // Run analysis
    this.analyzer.analyze(this.world, this.state.components, this.state.wireManager);
    const result = this.analyzer.getAnalysisResult();

    // Remap output names: LED<id> → LED<idx>
    const outputNameMap = new Map();
    for (const led of leds) {
      outputNameMap.set(`LED${led.id}`, labels.get(led.id));
    }

    const format = this.state.logicFormat || 'programming';
    const formatExpr = (expr) => {
      const renamed = renameInputs(expr, internalToFriendly);
      if (format === 'math') return exprToMath(renamed);
      if (format === 'statement') return exprToStatement(renamed);
      return exprToProgramming(renamed);
    };

    let html = '';

    // ── Current State ──
    if (switches.length > 0 || buttons.length > 0 || leds.length > 0) {
      html += '<div class="la-section-title">Current State</div>';
      html += '<ul class="la-state-list">';

      for (const sw of switches) {
        const label = labels.get(sw.id);
        const isOn = sw.type === COMP.SLIDE_SWITCH ? (sw.state !== 1) : sw.on;
        html += `<li class="la-state-item la-state-item--interactive" data-la-sw-id="${sw.id}">
          <span class="la-state-label la-state-label-in">${label}</span>
          <span class="la-state-val ${isOn ? 'la-state-on' : 'la-state-off'}">${isOn ? 'ON' : 'OFF'}</span>
        </li>`;
      }

      for (const btn of buttons) {
        const label = labels.get(btn.id);
        html += `<li class="la-state-item la-state-item--interactive" data-la-btn-id="${btn.id}">
          <span class="la-state-label la-state-label-in">${label}</span>
          <span class="la-state-val ${btn.pressed ? 'la-state-on' : 'la-state-off'}">${btn.pressed ? 'ON' : 'OFF'}</span>
        </li>`;
      }

      for (const led of leds) {
        const label = labels.get(led.id);
        html += `<li class="la-state-item">
          <span class="la-state-label la-state-label-out">${label}</span>
          <span class="la-state-val ${led.lit ? 'la-state-on' : 'la-state-off'}">${led.lit ? 'ON' : 'OFF'}</span>
        </li>`;
      }

      html += '</ul>';
    }

    // ── Expressions (after Current State) ──
    const realExprs = result.expressions.filter(e => e.expr);
    if (result.expressions.length > 0) {
      html += `<div class="la-section-title la-expr-header">
        <span>Expressions</span>
        <select class="la-format-select" id="la-format-select">
          <option value="programming"${format === 'programming' ? ' selected' : ''}>a*b+c</option>
          <option value="math"${format === 'math' ? ' selected' : ''}>a∧b ∨ c</option>
          <option value="statement"${format === 'statement' ? ' selected' : ''}>AND / OR</option>
        </select>
      </div>`;
      for (const e of result.expressions) {
        const outName = outputNameMap.get(e.name) || e.name;
        if (e.expr === null || e.expr === undefined) {
          html += `<div class="la-expr"><span class="la-out-name">${outName}</span> <span class="la-eq">=</span> <span class="la-non-comb-label">Non-combinational logic</span></div>`;
        } else {
          const exprStr = formatExpr(e.expr);
          html += `<div class="la-expr"><span class="la-out-name">${outName}</span> <span class="la-eq">=</span> ${exprStr}</div>`;
        }
      }
    } else if (leds.length > 0 && (switches.length > 0 || buttons.length > 0)) {
      html += '<div class="empty-state">No chip-based logic path found between inputs and outputs.</div>';
    }

    // ── K-Maps ──
    if (realExprs.length > 0) {
      html += '<div class="la-section-title">Karnaugh Maps</div>';
      for (const e of realExprs) {
        const outName = outputNameMap.get(e.name) || e.name;
        const renamed = renameInputs(e.expr, internalToFriendly);
        const inputs = collectInputs(renamed);
        html += `<div class="la-kmap-block">
          <div class="la-kmap-title"><span class="la-out-name">${outName}</span></div>
          ${renderKMap(renamed, inputs)}
        </div>`;
      }
    }

    // ── Truth Tables ──
    if (realExprs.length > 0) {
      html += '<div class="la-section-title">Truth Tables</div>';
      for (const e of realExprs) {
        const outName = outputNameMap.get(e.name) || e.name;
        const renamed = renameInputs(e.expr, internalToFriendly);
        const inputs = collectInputs(renamed);
        html += `<div class="la-tt-block">
          <div class="la-tt-title"><span class="la-out-name">${outName}</span></div>
          ${renderTruthTable(renamed, inputs, outName)}
        </div>`;
      }
    }

    if (switches.length === 0 && buttons.length === 0 && leds.length === 0 && result.expressions.length === 0) {
      html += '<div class="empty-state">No combinational logic components found.</div>';
    }

    container.innerHTML = html;

    // Wire up interactive switches in the state list
    for (const sw of switches) {
      const el = container.querySelector(`[data-la-sw-id="${sw.id}"]`);
      if (!el) continue;
      el.addEventListener('click', () => {
        if (sw.held) return;
        this.pushUndo();
        if (sw.type === COMP.SLIDE_SWITCH) {
          sw.state = sw.state === 2 ? 0 : 2;
        } else {
          sw.on = !sw.on;
        }
        this.onCircuitChanged();
      });
    }

    // Wire up interactive buttons in the state list (momentary: hold while mouse is down)
    for (const btn of buttons) {
      const el = container.querySelector(`[data-la-btn-id="${btn.id}"]`);
      if (!el) continue;
      el.addEventListener('mousedown', () => {
        if (btn.held) return;
        btn.pressed = true;
        this.interaction._pressedButton = btn;
        this.onCircuitChanged();
        document.addEventListener('mouseup', () => {
          if (btn.held) return;
          btn.pressed = false;
          if (this.interaction._pressedButton === btn) this.interaction._pressedButton = null;
          this.onCircuitChanged();
        }, { once: true });
      });
    }

    // Wire up the format dropdown
    const sel = document.getElementById('la-format-select');
    if (sel) {
      sel.addEventListener('change', (ev) => {
        this.state.logicFormat = ev.target.value;
        this._showLogicAnalyzer();
      });
    }

  }

  // ── Circuit Info Panel ───────────────────────────────────────────────────

  // Shared label map builder: R1, D1, U1, Button1, Switch1, SEG1...
  _buildLabelMap(comps) {
    const labelMap = new Map();
    const counters = { R: 0, C: 0, L: 0, D: 0, U: 0, B: 0, S: 0, SW: 0, SEG: 0, DIP: 0 };
    for (const comp of comps) {
      switch (comp.type) {
        case COMP.RESISTOR:     labelMap.set(comp.id, `R${++counters.R}`); break;
        case COMP.CAPACITOR:    labelMap.set(comp.id, `C${++counters.C}`); break;
        case COMP.POLARIZED_CAPACITOR: labelMap.set(comp.id, `C${++counters.C}`); break;
        case COMP.INDUCTOR:     labelMap.set(comp.id, `L${++counters.L}`); break;
        case COMP.DIODE:         labelMap.set(comp.id, `D${++counters.D}`); break;
        case COMP.LED:          labelMap.set(comp.id, `D${++counters.D}`); break;
        case COMP.CHIP:         labelMap.set(comp.id, `U${++counters.U}`); break;
        case COMP.BUTTON:       labelMap.set(comp.id, `Button${++counters.B}`); break;
        case COMP.PUSH_BUTTON:  labelMap.set(comp.id, `Button${++counters.B}`); break;
        case COMP.SWITCH:       labelMap.set(comp.id, `Switch${++counters.S}`); break;
        case COMP.SLIDE_SWITCH: labelMap.set(comp.id, `Switch${++counters.SW}`); break;
        case COMP.DIP_SWITCH:   labelMap.set(comp.id, `DIP${++counters.DIP}`); break;
        case COMP.SEVEN_SEG:    labelMap.set(comp.id, `SEG${++counters.SEG}`); break;
      }
    }
    return labelMap;
  }

  // Shared warning builder returns [{level, msg, compId}]
  _buildCircuitWarnings(comps, sim, nl, labelMap, fmtI) {
    const warnings = [];
    const spec = getFamilySpec(this.state.chipFamily);

    const findResistorOnNet = (netId) => {
      if (netId === undefined || netId === null) return null;
      for (const c of comps) {
        if (c.type !== COMP.RESISTOR) continue;
        const nA = nl.findNetByHole(c.pins[0].holeId);
        const nB = nl.findNetByHole(c.pins[1].holeId);
        if ((nA && nA.id === netId) || (nB && nB.id === netId)) return c;
      }
      return null;
    };

    // LED warnings 
    for (const comp of comps.filter(c => c.type === COMP.LED)) {
      const lbl = labelMap.get(comp.id);
      const I   = sim.componentCurrents.get(comp.id) || 0;
      if (I > 0.040) {
        warnings.push({ level: 'error',
          msg: `${lbl}: overcurrent ${fmtI(I)} max 40 mA`, compId: comp.id });
      } else {
        const anodeNet = nl.findNetByHole(comp.pins[0].holeId);
        const cathNet  = nl.findNetByHole(comp.pins[1].holeId);
        const vA = anodeNet ? sim.netVoltages.get(anodeNet.id) : undefined;
        const vK = cathNet  ? sim.netVoltages.get(cathNet.id)  : undefined;
        if (vA !== undefined && vK !== undefined && vA > vK + 0.1) {
          const hasRes = (anodeNet && findResistorOnNet(anodeNet.id)) ||
                         (cathNet  && findResistorOnNet(cathNet.id));
          if (!hasRes) {
            warnings.push({ level: 'warn',
              msg: `${lbl}: no current limiting resistor max 40 mA`, compId: comp.id });
          }
        }
      }
    }

    // Polarized capacitor reverse-polarity
    for (const comp of comps) {
      if (comp.type !== COMP.POLARIZED_CAPACITOR || !comp.placed) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      const netA = nl.findNetByHole(comp.pins[0].holeId);
      const netB = nl.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB) continue;
      const vA = sim.netVoltages.get(netA.id);
      const vB = sim.netVoltages.get(netB.id);
      if (vA === undefined || vB === undefined) continue;
      const vCap = vA - vB;
      if (vCap < -0.3) {
        const lbl = labelMap.get(comp.id) || 'C?';
        warnings.push({ level: 'error',
          msg: `${lbl}: reverse polarity (${vCap.toFixed(2)} V)   + lead at lower voltage, real cap would leak and fail`,
          compId: comp.id });
      }
    }

    // 7-seg warnings
    for (const comp of comps.filter(c => c.type === COMP.SEVEN_SEG)) {
      const lbl = labelMap.get(comp.id);
      const com1Net = nl.findNetByPin(comp, 'COM1');
      const com2Net = nl.findNetByPin(comp, 'COM2');
      const comNetId = com1Net ? com1Net.id : (com2Net ? com2Net.id : null);
      const comRes   = comNetId !== null ? findResistorOnNet(comNetId) : null;
      const segNames = ['a','b','c','d','e','f','g','dp'];
      const activeSegs = segNames.filter(s => comp.segments && comp.segments[s]);
      if (activeSegs.length === 0) continue;

      let segResFound = false;
      for (const seg of segNames) {
        const pin = comp.pins.find(p => p.name === seg);
        if (!pin) continue;
        const net = nl.findNetByHole(pin.holeId);
        if (net && findResistorOnNet(net.id)) { segResFound = true; break; }
      }

      if (!comRes && !segResFound) {
        // Simulator doesn't track per-seg current; estimate via LED diode model.
        const VF = 2.0, R_BULK = 33, MAX_SAFE = 0.030;
        const comV = comNetId !== null ? sim.netVoltages.get(comNetId) : undefined;
        let perSegEst = 0;
        for (const seg of activeSegs) {
          const pin = comp.pins.find(p => p.name === seg);
          if (!pin) continue;
          const net = nl.findNetByHole(pin.holeId);
          const segV = net ? sim.netVoltages.get(net.id) : undefined;
          if (segV === undefined || comV === undefined) continue;
          const dV = comp.commonAnode ? (comV - segV) : (segV - comV);
          const I = dV > VF ? (dV - VF) / R_BULK : 0;
          if (I > perSegEst) perSegEst = I;
        }
        if (perSegEst > MAX_SAFE) {
          warnings.push({ level: 'error',
            msg: `${lbl}: no current limiting resistor   ~${fmtI(perSegEst)}/seg (max 30 mA/seg)   segments will burn out`,
            compId: comp.id });
        } else {
          warnings.push({ level: 'warn',
            msg: `${lbl}: no current limiting resistors add one per segment or on common pin (max 30 mA/seg)`,
            compId: comp.id });
        }
      } else if (comRes) {
        const totalI   = sim.componentCurrents.get(comRes.id) || 0;
        const perSegI  = activeSegs.length > 0 ? totalI / activeSegs.length : 0;
        if (perSegI > 0.030) {
          warnings.push({ level: 'error',
            msg: `${lbl}: ~${fmtI(perSegI)}/seg via common resistor (max 30 mA/seg) use per-seg resistors`,
            compId: comp.id });
        }
      } else {
        for (const seg of activeSegs) {
          const pin = comp.pins.find(p => p.name === seg);
          if (!pin) continue;
          const net = nl.findNetByHole(pin.holeId);
          if (!net) continue;
          const res = findResistorOnNet(net.id);
          if (!res) continue;
          const I = sim.componentCurrents.get(res.id) || 0;
          if (I > 0.030) {
            warnings.push({ level: 'error',
              msg: `${lbl} seg '${seg}': overcurrent ${fmtI(I)} (max 30 mA/seg)`,
              compId: comp.id });
          }
        }
      }
    }

    // Chip output-load warnings 
    for (const comp of comps.filter(c => c.type === COMP.CHIP)) {
      const lbl = labelMap.get(comp.id);
      const counted = new Set();
      let totalI = 0;
      for (const pin of comp.pins) {
        if (pin.type !== 'output') continue;
        const net = nl.findNetByHole(pin.holeId);
        if (!net) continue;
        for (const c2 of comps) {
          if (counted.has(c2.id)) continue;
          if (c2.type !== COMP.RESISTOR && c2.type !== COMP.LED) continue;
          const nA = nl.findNetByHole(c2.pins[0].holeId);
          const nB = nl.findNetByHole(c2.pins[1].holeId);
          if ((nA && nA.id === net.id) || (nB && nB.id === net.id)) {
            totalI += sim.componentCurrents.get(c2.id) || 0;
            counted.add(c2.id);
          }
        }
      }
      if (totalI > 0.100) {
        warnings.push({ level: 'error',
          msg: `${lbl}: output load current ${fmtI(totalI)} exceeds 100 mA`,
          compId: comp.id });
      }
    }

    // Gray-zone input warnings (family dependent thresholds) 
    // Inputs above VIL but below VIH are indeterminate for the selected family.
    const GRAY_LOW  = spec.VIL;
    const GRAY_HIGH = spec.VIH;
    const LED_VF    = 2.0;   // LED forward voltage needed to conduct

    // Chip input pins (use per-chip family override when set)
    for (const comp of comps.filter(c => c.type === COMP.CHIP)) {
      const chipSpec = getFamilySpec(comp.chipFamily ?? this.state.chipFamily);
      const lbl = labelMap.get(comp.id);
      const grayPins = [];
      for (const pin of comp.pins) {
        if (pin.type !== 'input') continue;
        const net = nl.findNetByHole(pin.holeId);
        if (!net || sim.floatingNets.has(net.id)) continue;
        const v = sim.netVoltages.get(net.id);
        if (v !== undefined && v > chipSpec.VIL && v < chipSpec.VIH) {
          grayPins.push(`${pin.name} (${v.toFixed(2)}V)`);
        }
      }
      if (grayPins.length > 0) {
        warnings.push({ level: 'warn',
          msg: `${lbl}: indeterminate input voltage on pin${grayPins.length > 1 ? 's' : ''} ${grayPins.join(', ')} ${chipSpec.label} needs ≤${chipSpec.VIL} V or ≥${chipSpec.VIH} V`,
          compId: comp.id });
      }
    }

    // Floating input warnings (CMOS families: HC, HCT) 
    // 74LS tolerates floating inputs via internal weak pull up. 74HC / 74HCT
    // inputs are high-impedance CMOS a floating input is electrically
    // indeterminate and can self-oscillate or draw through-current.
    for (const comp of comps.filter(c => c.type === COMP.CHIP)) {
      const chipSpec = getFamilySpec(comp.chipFamily ?? this.state.chipFamily);
      if (chipSpec.FLOAT_HIGH) continue;
      const lbl = labelMap.get(comp.id);
      const floatPins = [];
      for (const pin of comp.pins) {
        if (pin.type !== 'input') continue;
        const net = nl.findNetByHole(pin.holeId);
        if (!net) continue;
        if (sim.floatingNets.has(net.id)) floatPins.push(pin.name);
      }
      if (floatPins.length > 0) {
        warnings.push({ level: 'warn',
          msg: `${lbl}: floating input on pin${floatPins.length > 1 ? 's' : ''} ${floatPins.join(', ')} ${chipSpec.label} requires an explicit pull up (140 kΩ) or pull down to GND`,
          compId: comp.id });
      }
    }

    // Clock/crystal frequency vs family max
    for (const comp of comps.filter(c => c.type === COMP.CLOCK || c.type === COMP.CRYSTAL)) {
      const f = comp.frequencyHz || 0;
      if (f > spec.MAX_FREQ_HZ) {
        const lbl = labelMap.get(comp.id) || (comp.type === COMP.CRYSTAL ? 'Crystal' : 'Clock');
        const fMHz  = (f / 1e6).toFixed(1);
        const maxMHz = (spec.MAX_FREQ_HZ / 1e6).toFixed(0);
        warnings.push({ level: 'warn',
          msg: `${lbl}: ${fMHz} MHz exceeds ${spec.label} max of ${maxMHz} MHz`,
          compId: comp.id });
      }
    }

    // Fan out: too many chip inputs on one chip output 
    for (const comp of comps.filter(c => c.type === COMP.CHIP)) {
      const chipSpec = getFamilySpec(comp.chipFamily ?? this.state.chipFamily);
      const lbl = labelMap.get(comp.id);
      for (const pin of comp.pins) {
        if (pin.type !== 'output') continue;
        const net = nl.findNetByHole(pin.holeId);
        if (!net) continue;
        let loadCount = 0;
        for (const c2 of comps) {
          if (c2.type !== COMP.CHIP) continue;
          for (const p2 of c2.pins) {
            if (p2.type !== 'input') continue;
            const n2 = nl.findNetByHole(p2.holeId);
            if (n2 && n2.id === net.id) loadCount++;
          }
        }
        if (loadCount > chipSpec.MAX_FANOUT) {
          warnings.push({ level: 'warn',
            msg: `${lbl}: ${loadCount} chip inputs on output ${pin.name} exceeds ${chipSpec.label} fan out of ${chipSpec.MAX_FANOUT}`,
            compId: comp.id });
        }
      }
    }

    // LED anode voltage in gray zone (partially driven, not enough to light)
    for (const comp of comps.filter(c => c.type === COMP.LED)) {
      if (comp.lit) continue;
      const lbl = labelMap.get(comp.id);
      const anodeNet = nl.findNetByHole(comp.pins[0].holeId);
      const cathNet  = nl.findNetByHole(comp.pins[1].holeId);
      if (!anodeNet || !cathNet) continue;
      if (sim.floatingNets.has(anodeNet.id) || sim.floatingNets.has(cathNet.id)) continue;
      const vA = sim.netVoltages.get(anodeNet.id);
      const vK = sim.netVoltages.get(cathNet.id);
      if (vA === undefined || vK === undefined) continue;
      const dV = vA - vK;
      if (dV > GRAY_LOW && dV < LED_VF) {
        warnings.push({ level: 'warn',
          msg: `${lbl}: ${dV.toFixed(2)}V across LED not enough to light (needs ≥${LED_VF}V)`,
          compId: comp.id });
      }
    }

    // 7 segment segment input pins in gray zone
    for (const comp of comps.filter(c => c.type === COMP.SEVEN_SEG)) {
      const lbl = labelMap.get(comp.id);
      const segNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
      const grayPins = [];
      for (const seg of segNames) {
        const pin = comp.pins.find(p => p.name === seg);
        if (!pin) continue;
        const net = nl.findNetByHole(pin.holeId);
        if (!net || sim.floatingNets.has(net.id)) continue;
        const v = sim.netVoltages.get(net.id);
        if (v !== undefined && v > GRAY_LOW && v < GRAY_HIGH) {
          grayPins.push(`${seg} (${v.toFixed(2)}V)`);
        }
      }
      if (grayPins.length > 0) {
        warnings.push({ level: 'warn',
          msg: `${lbl}: indeterminate drive voltage on segment${grayPins.length > 1 ? 's' : ''} ${grayPins.join(', ')} ${spec.label} needs ≤${GRAY_LOW} V or ≥${GRAY_HIGH} V`,
          compId: comp.id });
      }
    }

    return warnings;
  }

  // Update the bottom status bar after each simulation
  _updateStatusBar() {
    const sim   = this.simulator;
    const nl    = sim.netlist;
    const comps = this.state.components.filter(c => c.placed);

    const fmtI = (a) => {
      if (a === undefined || a === null) return '';
      if (a === 0) return '0 mA';
      const mA = a * 1000;
      if (mA < 0.1) return (a * 1e6).toFixed(0) + ' µA';
      if (mA < 100) return mA.toFixed(2) + ' mA';
      return mA.toFixed(0) + ' mA';
    };

    const labelMap = this._buildLabelMap(comps);
    const warnings = this._buildCircuitWarnings(comps, sim, nl, labelMap, fmtI);
    const errors   = warnings.filter(w => w.level === 'error');

    // Update shared overcurrentIds for renderer outlines
    this.state.overcurrentIds = new Set(errors.map(w => w.compId));

    // Check for power supply voltage drop (VCC sagging below 3.5V → overcurrent)
    let psuVoltageDrop = false;
    let psuMinVoltage = 5;
    for (const net of nl.nodes) {
      if (!net.isVCC) continue;
      const v = sim.netVoltages.get(net.id);
      if (v !== undefined && v < psuMinVoltage) psuMinVoltage = v;
      if (v !== undefined && v < 3.5) psuVoltageDrop = true;
    }

    const el = document.getElementById('overcurrent-status');
    if (errors.length === 0 && !(sim.shortCircuits && sim.shortCircuits.length > 0) && !psuVoltageDrop) {
      el.textContent = '';
      return;
    }

    const parts = [];
    if (sim.shortCircuits && sim.shortCircuits.length > 0) {
      parts.push(`Short circuit on ${sim.shortCircuits.length} net(s)`);
    }
    if (psuVoltageDrop) {
      parts.push(`Power supply: significant voltage drop (${psuMinVoltage.toFixed(2)}V)   overcurrent`);
    }
    if (errors.length > 0) {
      // Group unique component labels
      const seen = new Set();
      const labels = [];
      for (const w of errors) {
        const lbl = labelMap.get(w.compId);
        if (lbl && !seen.has(lbl)) { seen.add(lbl); labels.push(lbl); }
      }
      const shown = labels.slice(0, 3).join(', ');
      const suffix = labels.length > 3 ? `, +${labels.length - 3} more` : '';
      parts.push(`Overcurrent on ${shown}${suffix}`);
    }

    el.textContent = parts.join('  •  ') + ' click for details';
  }

  _showCircuitInfo() {
    this.state.showCircuitInfo = true;
    this.state.showLogicView = false;
    this.state.showValues = true;
    this.currentInfoComp = null;
    this.currentProbe = null;

    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;
    title.textContent = 'Circuit Analyzer';
    document.getElementById('btn-logic').classList.remove('active');

    const sim = this.simulator;
    const nl  = sim.netlist;
    const comps = this.state.components.filter(c => c.placed);

    const fmtV = (v) => {
      if (v === undefined || v === null) return '<span class="ci-float">?</span>';
      return v.toFixed(2) + 'V';
    };

    const fmtI = (a) => {
      if (a === undefined || a === null) return '';
      if (a === 0) return '0 mA';
      const mA = a * 1000;
      if (mA < 0.1) return (a * 1e6).toFixed(0) + ' µA';
      if (mA < 100) return mA.toFixed(2) + ' mA';
      return mA.toFixed(0) + ' mA';
    };

    const fmtP = (p) => {
      if (p === undefined || p === null) return '';
      if (p === 0) return '0 mW';
      const mW = p * 1000;
      if (mW < 0.1) return (p * 1e6).toFixed(0) + ' µW';
      if (mW < 1000) return mW.toFixed(2) + ' mW';
      return (mW / 1000).toFixed(2) + ' W';
    };

    const labelMap = this._buildLabelMap(comps);

    let html = '';

    // Short-circuit warning
    if (sim.shortCircuits && sim.shortCircuits.length > 0) {
      html += '<div class="warning-box">Short circuit detected on ' +
        sim.shortCircuits.length + ' net(s)!</div>';
    }

    // ── Wires ─────────────────────────────────────────────────────────────
    const nodes = nl.nodes;
    if (nodes.length > 0) {
      // Compute net current: sum of component currents for passive components on each net
      const netCurrentMap = new Map();
      for (const comp of comps) {
        if (comp.type !== COMP.RESISTOR && comp.type !== COMP.LED && comp.type !== COMP.DIODE) continue;
        const I = sim.componentCurrents.get(comp.id) || 0;
        if (I === 0) continue;
        for (const pin of comp.pins) {
          const net = nl.findNetByHole(pin.holeId);
          if (!net) continue;
          netCurrentMap.set(net.id, (netCurrentMap.get(net.id) || 0) + I);
        }
      }

      const vccNets    = nodes.filter(n => n.isVCC && !n.isGND);
      const gndNets    = nodes.filter(n => n.isGND && !n.isVCC);
      const signalNets = nodes.filter(n => !n.isVCC && !n.isGND);

      // ── Totals (total current & power draw) ─────────────────────────────
      // Compute total power as sum of I×ΔV across all passive components.
      // This is electrically correct regardless of whether components are
      // wired directly from VCC or driven by chip outputs.
      // Total supply current = total_power / V_VCC.
      let totalP = 0;
      for (const comp of comps) {
        if (comp.type !== COMP.RESISTOR && comp.type !== COMP.LED && comp.type !== COMP.DIODE) continue;
        const I = sim.componentCurrents.get(comp.id) || 0;
        if (I === 0) continue;
        const netA = nl.findNetByHole(comp.pins[0].holeId);
        const netB = nl.findNetByHole(comp.pins[1].holeId);
        const vA = netA ? (sim.netVoltages.get(netA.id) ?? 0) : 0;
        const vB = netB ? (sim.netVoltages.get(netB.id) ?? 0) : 0;
        totalP += I * Math.abs(vA - vB);
      }
      const vccV = vccNets.length > 0 ? (sim.netVoltages.get(vccNets[0].id) || 5) : 5;
      const totalI = vccV > 0 ? totalP / vccV : 0;
      let totalsHtml = '<div class="ci-section-title">Totals</div>';
      totalsHtml += '<table class="ci-table"><tbody>' +
        `<tr><td class="ci-lbl">Current</td><td class="ci-val ci-cur">${fmtI(totalI)}</td></tr>` +
        `<tr><td class="ci-lbl">Power</td><td class="ci-val ci-drop">${fmtP(totalP)}</td></tr>` +
        '</tbody></table>';
      html = totalsHtml + html;

      html += '<div class="ci-section-title">Nets</div>';
      html += '<table class="ci-table ci-power-table"><thead><tr>' +
        '<th>Net</th><th>Voltage</th><th>Current</th>' +
        '</tr></thead><tbody>';

      let vccIdx = 0;
      for (const net of vccNets) {
        const v = sim.netVoltages.get(net.id);
        const I = netCurrentMap.get(net.id);
        html += `<tr data-net-id="${net.id}" class="ci-clickable-row"><td class="ci-lbl"><span class="ci-net-vcc">VCC${vccIdx}</span></td>` +
          `<td class="ci-val">${fmtV(v)}</td><td class="ci-val ci-cur">${fmtI(I)}</td></tr>`;
        vccIdx++;
      }

      let gndIdx = 0;
      for (const net of gndNets) {
        const v = sim.netVoltages.get(net.id);
        const I = netCurrentMap.get(net.id);
        html += `<tr data-net-id="${net.id}" class="ci-clickable-row"><td class="ci-lbl"><span class="ci-net-gnd">GND${gndIdx}</span></td>` +
          `<td class="ci-val">${fmtV(v)}</td><td class="ci-val ci-cur">${fmtI(I)}</td></tr>`;
        gndIdx++;
      }

      let sigIdx = 1;
      for (const net of signalNets) {
        const v = sim.netVoltages.get(net.id);
        const I = netCurrentMap.get(net.id);
        html += `<tr data-net-id="${net.id}" class="ci-clickable-row"><td class="ci-lbl">Net${sigIdx}</td>` +
          `<td class="ci-val">${fmtV(v)}</td><td class="ci-val ci-cur">${fmtI(I)}</td></tr>`;
        sigIdx++;
      }

      html += '</tbody></table>';
    }

    // ── Resistors ─────────────────────────────────────────────────────────
    const resistors = comps.filter(c => c.type === COMP.RESISTOR);
    if (resistors.length > 0) {
      html += '<div class="ci-section-title">Resistors</div>';
      html += '<table class="ci-table"><thead><tr>' +
        '<th>Comp</th><th>R</th><th>ΔV</th><th>Current</th>' +
        '</tr></thead><tbody>';
      for (const comp of resistors) {
        const lbl  = labelMap.get(comp.id);
        const netA = nl.findNetByHole(comp.pins[0].holeId);
        const netB = nl.findNetByHole(comp.pins[1].holeId);
        const vA   = netA ? sim.netVoltages.get(netA.id) : undefined;
        const vB   = netB ? sim.netVoltages.get(netB.id) : undefined;
        const dV   = (vA !== undefined && vB !== undefined) ? Math.abs(vA - vB) : undefined;
        const I    = sim.componentCurrents.get(comp.id);
        const Rlbl = comp.getLabel ? comp.getLabel() : `${comp.resistance}Ω`;
        html += `<tr data-comp-id="${comp.id}" class="ci-clickable-row">
          <td class="ci-lbl">${lbl}</td>
          <td class="ci-val">${Rlbl}</td>
          <td class="ci-val ci-drop">${dV !== undefined ? dV.toFixed(2) + 'V' : ''}</td>
          <td class="ci-val ci-cur">${fmtI(I)}</td>
        </tr>`;
      }
      html += '</tbody></table>';
    }

    // ── LEDs ──────────────────────────────────────────────────────────────
    const leds = comps.filter(c => c.type === COMP.LED);
    if (leds.length > 0) {
      html += '<div class="ci-section-title">LEDs</div>';
      html += '<table class="ci-table"><thead><tr>' +
        '<th>Comp</th><th>State</th><th>ΔV</th><th>Current</th>' +
        '</tr></thead><tbody>';
      for (const comp of leds) {
        const lbl       = labelMap.get(comp.id);
        const anodeNet  = nl.findNetByHole(comp.pins[0].holeId);
        const cathNet   = nl.findNetByHole(comp.pins[1].holeId);
        const vA        = anodeNet ? sim.netVoltages.get(anodeNet.id) : undefined;
        const vK        = cathNet  ? sim.netVoltages.get(cathNet.id)  : undefined;
        const dV        = (vA !== undefined && vK !== undefined) ? (vA - vK) : undefined;
        const I         = sim.componentCurrents.get(comp.id);
        const I_mA = (I || 0) * 1000;
        const ledOverI = I_mA > 40;
        const stHtml    = comp.lit
          ? '<span class="ci-led-on">● LIT</span>'
          : '<span class="ci-led-off">○ OFF</span>';
        const curHtml = ledOverI
          ? `<span class="ci-over">${fmtI(I)}</span>`
          : fmtI(I);
        html += `<tr data-comp-id="${comp.id}" class="ci-clickable-row${ledOverI ? ' ci-row-warn' : ''}">
          <td class="ci-lbl">${lbl}</td>
          <td>${stHtml}</td>
          <td class="ci-val ci-drop">${dV !== undefined ? dV.toFixed(2) + 'V' : ''}</td>
          <td class="ci-val ci-cur">${curHtml}</td>
        </tr>`;
      }
      html += '</tbody></table>';
    }

    // ── 7 Segment Displays ────────────────────────────────────────────────
    const sevenSegs = comps.filter(c => c.type === COMP.SEVEN_SEG);
    if (sevenSegs.length > 0) {
      const findResistorOnNet = (netId) => {
        if (netId === undefined || netId === null) return null;
        for (const c of comps) {
          if (c.type !== COMP.RESISTOR) continue;
          const nA = nl.findNetByHole(c.pins[0].holeId);
          const nB = nl.findNetByHole(c.pins[1].holeId);
          if ((nA && nA.id === netId) || (nB && nB.id === netId)) return c;
        }
        return null;
      };
      const segNames = ['a','b','c','d','e','f','g','dp'];
      html += '<div class="ci-section-title">7 Segment Displays</div>';
      html += '<table class="ci-table"><thead><tr>' +
        '<th>Seg</th><th>State</th><th>ΔV</th><th>Current</th>' +
        '</tr></thead><tbody>';
      for (const comp of sevenSegs) {
        const lbl = labelMap.get(comp.id);
        const com1Net = nl.findNetByPin(comp, 'COM1');
        const com2Net = nl.findNetByPin(comp, 'COM2');
        const comNetId = com1Net ? com1Net.id : (com2Net ? com2Net.id : null);
        const comV = comNetId !== null ? sim.netVoltages.get(comNetId) : undefined;
        const comRes = comNetId !== null ? findResistorOnNet(comNetId) : null;
        const activeSegs = segNames.filter(s => comp.segments && comp.segments[s]);
        const comResI = comRes ? (sim.componentCurrents.get(comRes.id) || 0) : 0;

        for (const seg of segNames) {
          const pin = comp.pins.find(p => p.name === seg);
          if (!pin) continue;
          const net = nl.findNetByHole(pin.holeId);
          const segV = net ? sim.netVoltages.get(net.id) : undefined;
          const isOn = !!(comp.segments && comp.segments[seg]);

          let dV;
          if (segV !== undefined && comV !== undefined) {
            dV = comp.commonAnode ? (comV - segV) : (segV - comV);
          }

          let I = 0;
          if (isOn) {
            const segRes = net ? findResistorOnNet(net.id) : null;
            if (segRes) {
              I = sim.componentCurrents.get(segRes.id) || 0;
            } else if (comRes) {
              I = activeSegs.length > 0 ? comResI / activeSegs.length : 0;
            } else if (dV !== undefined && dV > 2.0) {
              I = (dV - 2.0) / 33;
            }
          }

          const I_mA = I * 1000;
          const overI = I_mA > 30;
          const stHtml = isOn
            ? '<span class="ci-led-on">● ON</span>'
            : '<span class="ci-led-off">○ OFF</span>';
          const curHtml = overI
            ? `<span class="ci-over">${fmtI(I)}</span>`
            : fmtI(I);
          html += `<tr data-comp-id="${comp.id}" class="ci-clickable-row${overI ? ' ci-row-warn' : ''}">
            <td class="ci-lbl">${lbl}.${seg}</td>
            <td>${stHtml}</td>
            <td class="ci-val ci-drop">${dV !== undefined ? dV.toFixed(2) + 'V' : ''}</td>
            <td class="ci-val ci-cur">${curHtml}</td>
          </tr>`;
        }
      }
      html += '</tbody></table>';
    }

    // ── Capacitors ────────────────────────────────────────────────────────
    const capacitors = comps.filter(c => c.type === COMP.CAPACITOR || c.type === COMP.POLARIZED_CAPACITOR);
    if (capacitors.length > 0) {
      const fmtQ = (q) => {
        const absQ = Math.abs(q);
        if (absQ >= 1e-3) return (q * 1e3).toFixed(3) + ' mC';
        if (absQ >= 1e-6) return (q * 1e6).toFixed(3) + ' µC';
        if (absQ >= 1e-9) return (q * 1e9).toFixed(3) + ' nC';
        return (q * 1e12).toFixed(3) + ' pC';
      };
      html += '<div class="ci-section-title">Capacitors</div>';
      html += '<table class="ci-table"><thead><tr>' +
        '<th>Comp</th><th>C</th><th>ΔV</th><th>Charge</th>' +
        '</tr></thead><tbody>';
      for (const comp of capacitors) {
        const lbl  = labelMap.get(comp.id);
        const netA = nl.findNetByHole(comp.pins[0].holeId);
        const netB = nl.findNetByHole(comp.pins[1].holeId);
        const vA   = netA ? sim.netVoltages.get(netA.id) : undefined;
        const vB   = netB ? sim.netVoltages.get(netB.id) : undefined;
        const dV   = (vA !== undefined && vB !== undefined) ? (vA - vB) : undefined;
        const Q    = (dV !== undefined) ? comp.capacitance * dV : undefined;
        const Clbl = comp.getLabel ? comp.getLabel() : `${comp.capacitance}F`;
        html += `<tr data-comp-id="${comp.id}" class="ci-clickable-row">
          <td class="ci-lbl">${lbl}</td>
          <td class="ci-val">${Clbl}</td>
          <td class="ci-val ci-drop">${dV !== undefined ? dV.toFixed(2) + 'V' : ''}</td>
          <td class="ci-val ci-cur">${Q !== undefined ? fmtQ(Q) : ''}</td>
        </tr>`;
      }
      html += '</tbody></table>';
    }

    // ── Inductors ─────────────────────────────────────────────────────────
    const inductors = comps.filter(c => c.type === COMP.INDUCTOR);
    if (inductors.length > 0) {
      html += '<div class="ci-section-title">Inductors</div>';
      html += '<table class="ci-table"><thead><tr>' +
        '<th>Comp</th><th>L</th><th>ΔV</th><th>Current</th>' +
        '</tr></thead><tbody>';
      for (const comp of inductors) {
        const lbl  = labelMap.get(comp.id);
        const netA = nl.findNetByHole(comp.pins[0].holeId);
        const netB = nl.findNetByHole(comp.pins[1].holeId);
        const vA   = netA ? sim.netVoltages.get(netA.id) : undefined;
        const vB   = netB ? sim.netVoltages.get(netB.id) : undefined;
        const dV   = (vA !== undefined && vB !== undefined) ? (vA - vB) : undefined;
        const I    = sim.componentCurrents.get(comp.id);
        const Llbl = comp.getLabel ? comp.getLabel() : `${comp.inductance}H`;
        html += `<tr data-comp-id="${comp.id}" class="ci-clickable-row">
          <td class="ci-lbl">${lbl}</td>
          <td class="ci-val">${Llbl}</td>
          <td class="ci-val ci-drop">${dV !== undefined ? dV.toFixed(2) + 'V' : ''}</td>
          <td class="ci-val ci-cur">${fmtI(I)}</td>
        </tr>`;
      }
      html += '</tbody></table>';
    }

    // ── Diodes ────────────────────────────────────────────────────────────
    const diodes = comps.filter(c => c.type === COMP.DIODE);
    if (diodes.length > 0) {
      html += '<div class="ci-section-title">Diodes</div>';
      html += '<table class="ci-table"><thead><tr>' +
        '<th>Comp</th><th>Type</th><th>ΔV</th><th>Current</th>' +
        '</tr></thead><tbody>';
      for (const comp of diodes) {
        const lbl      = labelMap.get(comp.id);
        const anodeNet = nl.findNetByHole(comp.pins[0].holeId);
        const cathNet  = nl.findNetByHole(comp.pins[1].holeId);
        const vA       = anodeNet ? sim.netVoltages.get(anodeNet.id) : undefined;
        const vK       = cathNet  ? sim.netVoltages.get(cathNet.id)  : undefined;
        const dV       = (vA !== undefined && vK !== undefined) ? (vA - vK) : undefined;
        const I        = sim.componentCurrents.get(comp.id);
        const stHtml   = (dV !== undefined && dV > 0.7)
          ? '<span class="ci-led-on">● FWD</span>'
          : '<span class="ci-led-off">○ REV</span>';
        html += `<tr data-comp-id="${comp.id}" class="ci-clickable-row">
          <td class="ci-lbl">${lbl}</td>
          <td>${stHtml}</td>
          <td class="ci-val ci-drop">${dV !== undefined ? dV.toFixed(2) + 'V' : ''}</td>
          <td class="ci-val ci-cur">${fmtI(I)}</td>
        </tr>`;
      }
      html += '</tbody></table>';
    }

    if (comps.length === 0) {
      html = '<div class="empty-state">No circuit to analyze.<br>Place components and wire them up.</div>';
    }

    container.innerHTML = html;

    // ── Row click → select component on board ──────────────────────────────
    container.querySelectorAll('tr[data-comp-id]').forEach(row => {
      row.addEventListener('click', () => {
        const compId = parseInt(row.dataset.compId, 10);
        const comp = this.state.components.find(c => c.id === compId);
        if (comp) {
          this.state.selectedItems = [{ type: 'component', ref: comp }];
          this._panToComponent(comp);
          this.renderer.render();
        }
      });
    });

    // ── Net row click → select all wires on that net ──────────────────────
    container.querySelectorAll('tr[data-net-id]').forEach(row => {
      row.addEventListener('click', () => {
        const netId = parseInt(row.dataset.netId, 10);
        const nl = this.simulator.netlist;
        if (!nl) return;
        const net = nl.nodes.find(n => n.id === netId);
        if (!net) return;
        const wiresOnNet = this.state.wireManager.wires.filter(w =>
          net.holes.has(w.startHoleId) || net.holes.has(w.endHoleId)
        );
        if (wiresOnNet.length > 0) {
          this.state.selectedItems = wiresOnNet.map(w => ({ type: 'wire', ref: w }));
          this.renderer.render();
        }
      });
    });

    // Re-apply selection highlight (survives circuit-change rebuilds)
    this._highlightSelectedInAnalyzer();
  }

  // ── Smoothly pan the camera so the component is centered in the viewport ──
  _panToComponent(comp) {
    if (!comp || !comp.pins || comp.pins.length === 0) return;
    let sumX = 0, sumY = 0, count = 0;
    for (const pin of comp.pins) {
      const pos = this.world.getHolePosById(pin.holeId);
      if (pos) { sumX += pos.x; sumY += pos.y; count++; }
    }
    if (count === 0) return;
    const cx = sumX / count;
    const cy = sumY / count;

    const z = this.renderer.zoom;
    const targetX = this.renderer.screenW / 2 - cx * z;
    const targetY = this.renderer.screenH / 2 - cy * z;

    const startX = this.renderer.offsetX;
    const startY = this.renderer.offsetY;
    if (Math.abs(targetX - startX) < 0.5 && Math.abs(targetY - startY) < 0.5) return;

    const startTime = performance.now();
    const duration = 250;
    if (this._panAnimId) cancelAnimationFrame(this._panAnimId);
    const step = () => {
      const t = Math.min(1, (performance.now() - startTime) / duration);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.renderer.offsetX = startX + (targetX - startX) * ease;
      this.renderer.offsetY = startY + (targetY - startY) * ease;
      this._renderDirty = true;
      if (t < 1) {
        this._panAnimId = requestAnimationFrame(step);
      } else {
        this._panAnimId = null;
      }
    };
    this._panAnimId = requestAnimationFrame(step);
  }

  // ── Highlight a selected component or wire in the Circuit Analyzer ────────
  _highlightSelectedInAnalyzer() {
    if (!this.state.showCircuitInfo) return;
    const container = document.getElementById('analysis-content');
    if (!container) return;

    // Clear previous highlights
    container.querySelectorAll('tr.ci-selected').forEach(r => r.classList.remove('ci-selected'));

    for (const item of (this.state.selectedItems || [])) {
      if (item.type === 'component') {
        const row = container.querySelector(`tr[data-comp-id="${item.ref.id}"]`);
        if (row) {
          row.classList.add('ci-selected');
          row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else if (item.type === 'wire') {
        const nl = this.simulator.netlist;
        if (!nl) continue;
        const net = nl.findNetByHole(item.ref.startHoleId) ||
                    nl.findNetByHole(item.ref.endHoleId);
        if (!net) continue;
        const row = container.querySelector(`tr[data-net-id="${net.id}"]`);
        if (row) {
          row.classList.add('ci-selected');
          row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }

  // ── Close Info Panel ─────────────────────────────────────────────────────
  // ── Right-click panel for Switch / Buttons ───────────────────────────────
  showInputContextPanel(comp) {
    this.currentInfoComp = comp;
    this.currentProbe = null;
    // Take over the side panel from Circuit Analyzer / Logic Analyzer so their
    // time-step refresh loop doesn't repaint over the component panel.
    this.state.showCircuitInfo = false;
    this.state.showLogicView = false;
    document.getElementById('btn-logic').classList.remove('active');
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    const isSwitch    = comp.type === COMP.SWITCH;
    const isButton    = comp.type === COMP.BUTTON;
    const isPushBtn   = comp.type === COMP.PUSH_BUTTON;
    title.textContent = isSwitch ? 'Switch Settings' : 'Button Settings';

    const _render = () => {
      const heldOn   = !!comp.held;
      const bounceOn = !!comp.bounce;

      // ── SVG diagrams ──────────────────────────────────────────────────────
      let svgHtml = '';
      if (isButton) {
        const pressed = !!comp.pressed;
        // Straddling the channel rotates the button 90° on the board; match it.
        const rot = comp.vertical ? ' style="transform:rotate(90deg)"' : '';
        svgHtml = `
          <div class="btn-pinout-wrap">
            <svg class="btn-pinout-svg"${rot} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="60" height="60" rx="6" fill="#1a1a1a" stroke="#555" stroke-width="2"/>
              <circle cx="40" cy="40" r="16" fill="${pressed ? '#555' : '#333'}" stroke="#777" stroke-width="1.5"/>
              <circle cx="40" cy="40" r="10" fill="${pressed ? '#888' : '#444'}" stroke="#999" stroke-width="1"/>
              <rect x="4"  y="20" width="8" height="4" rx="1" fill="#aaa"/>
              <rect x="68" y="20" width="8" height="4" rx="1" fill="#aaa"/>
              <rect x="4"  y="56" width="8" height="4" rx="1" fill="#aaa"/>
              <rect x="68" y="56" width="8" height="4" rx="1" fill="#aaa"/>
              <line x1="8" y1="22" x2="8" y2="58" stroke="${pressed ? '#4f4' : '#484'}" stroke-width="1" stroke-dasharray="3,2"/>
              <line x1="72" y1="22" x2="72" y2="58" stroke="${pressed ? '#4f4' : '#484'}" stroke-width="1" stroke-dasharray="3,2"/>
              ${pressed ? '<line x1="8" y1="40" x2="72" y2="40" stroke="#4f4" stroke-width="1" stroke-dasharray="3,2"/>' : ''}
            </svg>
          </div>`;
      } else if (isPushBtn) {
        const pressed = !!comp.pressed;
        // Detect on-board orientation from the two terminal holes: when they
        // straddle the channel the button reads more vertical than horizontal,
        // so rotate the diagram 90° to match how the button is drawn.
        const aPos = comp.pins[0] && this.world.getHolePosById(comp.pins[0].holeId);
        const bPos = comp.pins[1] && this.world.getHolePosById(comp.pins[1].holeId);
        const pbVert = aPos && bPos && Math.abs(bPos.y - aPos.y) > Math.abs(bPos.x - aPos.x);
        const rot = pbVert ? ' style="transform:rotate(90deg)"' : '';
        svgHtml = `
          <div class="btn-pinout-wrap">
            <svg class="btn-pinout-svg"${rot} viewBox="0 0 80 42" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="6" width="50" height="30" rx="5" fill="#1a1a1a" stroke="#555" stroke-width="2"/>
              <circle cx="40" cy="21" r="10" fill="${pressed ? '#555' : '#333'}" stroke="#777" stroke-width="1.5"/>
              <circle cx="40" cy="21" r="6" fill="${pressed ? '#f0e0cc' : '#d4b896'}" stroke="#bba" stroke-width="1"/>
              <rect x="0"  y="19" width="16" height="4" rx="1" fill="#aaa"/>
              <rect x="64" y="19" width="16" height="4" rx="1" fill="#aaa"/>
              ${pressed ? '<line x1="8" y1="21" x2="72" y2="21" stroke="#4f4" stroke-width="1" stroke-dasharray="3,2"/>' : ''}
            </svg>
          </div>`;
      }

      // Pull-up guidance is only shown for the switch; the buttons omit it.
      const pullResHtml = isSwitch ? `
        <div class="ctx-pullres-link">
          <div style="color:#aaa;font-size:11px;margin-bottom:4px">Recommended pull-up: ${getFamilySpec(this.state.chipFamily).FLOAT_HIGH ? '1.4 kΩ' : '140 kΩ'} to VCC</div>
          <a href="/docs#floating" target="_blank" rel="noopener">
            About pull down &amp; pull up resistors ↗
          </a>
        </div>` : '';

      container.innerHTML = `
        <div class="ctx-panel-controls">
          <div class="ctx-toggle-item${heldOn ? ' active' : ''}" id="ctx-hold-toggle">Hold</div>
          <div class="ctx-toggle-item${bounceOn ? ' active' : ''}" id="ctx-bounce-toggle">Realistic Bouncing</div>
        </div>
        ${svgHtml}
        ${pullResHtml}`;

      container.querySelector('#ctx-hold-toggle').addEventListener('click', () => {
        comp.held = !comp.held;
        if (comp.held) {
          this.interaction._cancelBounce();
          if (isSwitch) {
            comp.on = true;
          } else {
            comp.pressed = true;
            this.interaction._pressedButton = comp;
          }
        } else {
          if (!isSwitch) {
            comp.pressed = false;
            if (this.interaction._pressedButton === comp) {
              this.interaction._pressedButton = null;
            }
          }
        }
        this.onCircuitChanged();
        _render();
      });

      container.querySelector('#ctx-bounce-toggle').addEventListener('click', () => {
        comp.bounce = !comp.bounce;
        _render();
      });
    };

    _render();
  }

  // ── Right-click panel for Slide Switch ───────────────────────────────────
  showSlideContextPanel(comp) {
    this.currentInfoComp = comp;
    this.currentProbe = null;
    // Take over the side panel from Circuit Analyzer / Logic Analyzer so their
    // time-step refresh loop doesn't repaint over the component panel.
    this.state.showCircuitInfo = false;
    this.state.showLogicView = false;
    document.getElementById('btn-logic').classList.remove('active');
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    title.textContent = 'Slide Switch (SPDT)';

    const s = comp.state;
    const armX = s === 0 ? '44' : s === 2 ? '44' : '55';
    const armY = s === 0 ? '10' : s === 2 ? '50' : '30';

    container.innerHTML = `
      <div class="btn-pinout-wrap">
        <svg class="spdt-svg" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
          <text x="3"  y="14" fill="#aaa" font-size="9" font-family="Roboto, Arial, sans-serif">1</text>
          <text x="3"  y="54" fill="#aaa" font-size="9" font-family="Roboto, Arial, sans-serif">3</text>
          <text x="99" y="34" fill="#aaa" font-size="9" font-family="Roboto, Arial, sans-serif">2</text>
          <line x1="24" y1="10" x2="44" y2="10" stroke="#aaa" stroke-width="2"/>
          <line x1="24" y1="50" x2="44" y2="50" stroke="#aaa" stroke-width="2"/>
          <line x1="76" y1="30" x2="96" y2="30" stroke="#aaa" stroke-width="2"/>
          <circle cx="44" cy="10" r="3" fill="#aaa"/>
          <circle cx="44" cy="50" r="3" fill="#aaa"/>
          <circle cx="76" cy="30" r="3" fill="#aaa"/>
          <line x1="76" y1="30" x2="${armX}" y2="${armY}" stroke="#ddd" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="spdt-state-btns">
        <button class="spdt-state-btn${s === 0 ? ' active' : ''}" id="spdt-btn-0">1─2</button>
        <button class="spdt-state-btn${s === 1 ? ' active' : ''}" id="spdt-btn-1">OPEN</button>
        <button class="spdt-state-btn${s === 2 ? ' active' : ''}" id="spdt-btn-2">2─3</button>
      </div>
      <div class="chip-pinout-legend" style="margin-bottom:10px">
        <span style="color:#aaa">Click toggles 1-2 / 2-3. Shift+click sets OPEN</span>
      </div>
      <div class="ctx-pullres-link" style="text-align:center;margin-top:24px">
        <div style="color:#aaa;font-size:11px;margin-bottom:4px">Recommended pull-up: ${getFamilySpec(this.state.chipFamily).FLOAT_HIGH ? '1.4 kΩ' : '140 kΩ'} to VCC</div>
        <a href="/docs#floating" target="_blank" rel="noopener">
          About pull down &amp; pull up resistors ↗
        </a>
      </div>`;

    for (const [btnId, newState] of [['spdt-btn-0', 0], ['spdt-btn-1', 1], ['spdt-btn-2', 2]]) {
      container.querySelector(`#${btnId}`).addEventListener('click', () => {
        if (comp.state === newState) return;
        this.pushUndo();
        comp.state = newState;
        this.onCircuitChanged();
      });
    }
  }

  showDipSwitchContextPanel(comp) {
    this.currentInfoComp = comp;
    this.currentProbe = null;
    this.state.showCircuitInfo = false;
    this.state.showLogicView = false;
    document.getElementById('btn-logic').classList.remove('active');
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    title.textContent = `DIP Switch (${comp.count}-Switch)`;

    const btns = comp.states.map((on, i) => `
      <button class="spdt-state-btn${on ? ' active' : ''}" data-sw="${i}">
        ${i + 1}
      </button>`).join('');

    container.innerHTML = `
      <div class="chip-pinout-legend" style="margin-bottom:8px;color:#aaa;font-size:11px">
        Click a switch to toggle it.
      </div>
      <div class="spdt-state-btns" style="flex-wrap:wrap;gap:4px">
        ${btns}
      </div>
      <div class="ctx-pullres-link" style="text-align:center;margin-top:24px">
        <a href="/docs#floating" target="_blank" rel="noopener">
          About pull down &amp; pull up resistors ↗
        </a>
      </div>`;

    container.querySelectorAll('[data-sw]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.sw, 10);
        this.pushUndo();
        comp.states[i] = !comp.states[i];
        this.onCircuitChanged();
      });
    });
  }

  // ── Right-click panel for Simple Clock (push-pull) ───────────────────────
  showClockContextPanel(comp) {
    this.currentInfoComp = comp;
    this.currentProbe = null;
    // Take over the side panel from Circuit Analyzer / Logic Analyzer so their
    // time-step refresh loop doesn't repaint over the clock panel.
    this.state.showCircuitInfo = false;
    this.state.showLogicView = false;
    document.getElementById('btn-logic').classList.remove('active');
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    title.textContent = 'Simple Clock (Push-Pull)';

    if (comp.dutyCycle === undefined) comp.dutyCycle = 0.5;
    const dutyPct = Math.round(comp.dutyCycle * 100);

    container.innerHTML = `
      <div class="ctx-duty-wrap">
        <div class="ctx-duty-label">
          <span>Duty Cycle</span>
          <span id="ctx-duty-readout">${dutyPct}% high</span>
        </div>
        <input type="range" id="ctx-duty-slider" min="1" max="99" step="1" value="${dutyPct}" class="ctx-duty-slider">
        <div class="ctx-duty-help">
          Fraction of each period spent HIGH (5V). 50% = symmetric square wave.
        </div>
      </div>
      <div style="color:#bbb;font-size:12px;line-height:1.5;padding:0 4px">
        <p style="margin:0 0 8px 0">
          The Simple Clock is a <b>push-pull</b> source with a single terminal (CLK).
          Internally it behaves like an SPDT switch that flips between <b>5V</b> and <b>GND</b>
          at the frequency you set, so the one output pin is always actively driven — never floating.
        </p>
        <p style="margin:0 0 8px 0">
          <b>Push</b> = when HIGH, the terminal is connected to 5V and sources current into your circuit.<br>
          <b>Pull</b> = when LOW, the terminal is connected to GND and sinks current to ground.
        </p>
        <p style="margin:0;color:#888">
          Because it actively drives both rails, you do <b>not</b> need a pull-up or pull-down
          resistor on the CLK line — wire it straight into a chip's clock input.
        </p>
      </div>`;

    const slider = container.querySelector('#ctx-duty-slider');
    const readout = container.querySelector('#ctx-duty-readout');
    let undoPushed = false;
    slider.addEventListener('input', () => {
      if (!undoPushed) { this.pushUndo(); undoPushed = true; }
      const pct = parseInt(slider.value, 10);
      comp.dutyCycle = pct / 100;
      readout.textContent = `${pct}% high`;
      this.onCircuitChanged();
    });
    slider.addEventListener('change', () => { undoPushed = false; });
  }

  // ── Crystal context panel: right-click a 2-pin crystal ─────────────────────
  // Same shape as the clock panel, but the adjustable quantity is frequency:
  // a real crystal's frequency is fixed by its quartz cut, so "setting" it
  // models unplugging the can and installing a different one. Duty stays 50%.
  showCrystalContextPanel(comp) {
    this.currentInfoComp = comp;
    this.currentProbe = null;
    // Take over the side panel from Circuit Analyzer / Logic Analyzer so their
    // time-step refresh loop doesn't repaint over this panel.
    this.state.showCircuitInfo = false;
    this.state.showLogicView = false;
    document.getElementById('btn-logic').classList.remove('active');
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    title.textContent = 'Quartz Crystal (Push-Pull)';

    // Practical range only — this simulator's crystal is a visual demo (LED
    // blink, slow counter), not a real oscillator can. Past ~50 Hz an LED
    // just blurs, so there's no MHz/kHz tier worth offering.
    const presets = [
      { label: '1 Hz',  hz: 1 },
      { label: '2 Hz',  hz: 2 },
      { label: '4 Hz',  hz: 4 },
      { label: '5 Hz',  hz: 5 },
      { label: '8 Hz',  hz: 8 },
      { label: '10 Hz', hz: 10 },
      { label: '16 Hz', hz: 16 },
      { label: '32 Hz', hz: 32 },
      { label: '50 Hz', hz: 50 },
    ];

    container.innerHTML = `
      <div class="ctx-duty-wrap">
        <div class="ctx-duty-label">
          <span>Frequency</span>
          <span id="ctx-xtal-readout">${comp.getLabel()}</span>
        </div>
        <div class="ctx-xtal-presets">
          ${presets.map((p, i) =>
            `<button class="ctx-xtal-preset${p.hz === comp.frequencyHz ? ' active' : ''}" data-idx="${i}">${p.label}</button>`
          ).join('')}
        </div>
        <div class="ctx-xtal-custom">
          <input type="text" id="ctx-xtal-input" placeholder="custom Hz, e.g. 45" autocomplete="off" spellcheck="false">
          <button id="ctx-xtal-set">Set</button>
        </div>
        <div class="ctx-duty-help">
          Swap in a different crystal can. Practical range is about 1–50 Hz — faster just blurs the LED.
        </div>
      </div>
      <div style="color:#bbb;font-size:12px;line-height:1.5;padding:0 4px">
        <p style="margin:0 0 8px 0">
          A quartz crystal resonates at <b>one fixed frequency</b> set by how its quartz
          sliver was cut at the factory. You never tune a crystal — you pick a can with
          the frequency you need. Setting the frequency here models swapping the can.
        </p>
        <p style="margin:0 0 8px 0">
          Like the Simple Clock, the output pin (A) is <b>push-pull</b>: actively driven
          to 5V then GND, never floating, so it wires straight into a chip's clock input.
          Pin B is the ground-reference leg. Duty cycle is locked at <b>50%</b> — there is
          no slider, because a crystal's symmetric resonance is exactly what you buy it for.
        </p>
        <p style="margin:0;color:#888">
          A real bare crystal is passive — it only oscillates with an amplifier (usually
          an inverter) wrapped around it. The simulator hands you the finished clock
          signal directly. Above ~30 Hz an LED blurs; use Timing Analysis to see fast edges.
        </p>
      </div>`;

    const setFreq = (hz) => {
      if (!isFinite(hz) || hz <= 0) return;
      this.pushUndo();
      comp.frequencyHz = hz;
      this.onCircuitChanged();   // re-renders this panel via currentInfoComp
    };
    container.querySelectorAll('.ctx-xtal-preset').forEach(btn => {
      btn.addEventListener('click', () => setFreq(presets[parseInt(btn.dataset.idx, 10)].hz));
    });
    const input = container.querySelector('#ctx-xtal-input');
    const commit = () => setFreq(parseFloat(input.value));
    container.querySelector('#ctx-xtal-set').addEventListener('click', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
      e.stopPropagation(); // prevent board hotkeys while typing
    });
  }

  // ── Probe panel: right-click a wire/LED/resistor/capacitor for a bare readout ──
  // probe = { kind: 'wire', wire } | { kind: 'led'|'resistor'|'capacitor', comp }.
  // Shows only the relevant electrical quantities for that part — nothing else.
  // Lives in the same side panel as the other context panels and is re-rendered
  // each simulation step via onCircuitChanged.
  showProbePanel(probe) {
    // If the probed item was deleted out from under us, close instead of crashing.
    if (probe.comp && !this.state.components.includes(probe.comp)) {
      this._closeInfoPanel();
      return;
    }
    if (probe.kind === 'wire' && !this.state.wireManager.wires.includes(probe.wire)) {
      this._closeInfoPanel();
      return;
    }

    this.currentProbe = probe;
    this.currentInfoComp = null;
    // Take over the side panel from Circuit Analyzer / Logic Analyzer.
    this.state.showCircuitInfo = false;
    this.state.showLogicView = false;
    document.getElementById('btn-logic').classList.remove('active');
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    const sim = this.simulator;
    const nl  = sim.netlist;

    const fmtV = (v) => (v === undefined || v === null) ? '—' : v.toFixed(2) + ' V';
    const fmtI = (a) => {
      if (a === undefined || a === null) return '—';
      const mA = a * 1000;
      if (Math.abs(mA) < 0.001) return '0 mA';
      if (Math.abs(mA) < 0.1)   return (a * 1e6).toFixed(0) + ' µA';
      if (Math.abs(mA) < 100)   return mA.toFixed(2) + ' mA';
      return mA.toFixed(0) + ' mA';
    };
    const fmtC = (c) => {            // capacitance, farads
      if (c === undefined || c === null) return '—';
      if (c >= 1e-3) return (c * 1e3).toFixed(1) + ' mF';
      if (c >= 1e-6) return (c * 1e6).toFixed(1) + ' µF';
      if (c >= 1e-9) return (c * 1e9).toFixed(1) + ' nF';
      return (c * 1e12).toFixed(1) + ' pF';
    };
    const fmtQ = (q) => {            // charge, coulombs
      if (q === undefined || q === null) return '—';
      const aq = Math.abs(q);
      if (aq < 1e-15) return '0 C';
      if (aq >= 1)    return q.toFixed(2) + ' C';
      if (aq >= 1e-3) return (q * 1e3).toFixed(2) + ' mC';
      if (aq >= 1e-6) return (q * 1e6).toFixed(2) + ' µC';
      if (aq >= 1e-9) return (q * 1e9).toFixed(2) + ' nC';
      return (q * 1e12).toFixed(2) + ' pC';
    };
    // High/low terminal voltages and the drop across a 2-pin component, from
    // its solved net voltages. "high"/"low" are by potential, so drop ≥ 0.
    const acrossVolts = (comp) => {
      const nA = nl.findNetByHole(comp.pins[0].holeId);
      const nB = nl.findNetByHole(comp.pins[1].holeId);
      const vA = nA ? sim.netVoltages.get(nA.id) : undefined;
      const vB = nB ? sim.netVoltages.get(nB.id) : undefined;
      if (vA === undefined || vB === undefined) return { high: undefined, low: undefined, drop: undefined };
      return { high: Math.max(vA, vB), low: Math.min(vA, vB), drop: Math.abs(vA - vB) };
    };

    // Build a list of [label, value] rows per probed item — nothing else.
    let rows = [];
    if (probe.kind === 'led') {
      const comp = probe.comp;
      title.textContent = 'LED';
      // Anode = pins[0], cathode = pins[1]; forward drop is anode − cathode.
      const aNet = nl.findNetByHole(comp.pins[0].holeId);
      const kNet = nl.findNetByHole(comp.pins[1].holeId);
      const vA = aNet ? sim.netVoltages.get(aNet.id) : undefined;
      const vK = kNet ? sim.netVoltages.get(kNet.id) : undefined;
      const drop = (vA !== undefined && vK !== undefined) ? (vA - vK) : undefined;
      rows = [
        ['Anode', fmtV(vA)],
        ['Cathode', fmtV(vK)],
        ['Voltage Drop', fmtV(drop)],
        ['Current', fmtI(sim.componentCurrents.get(comp.id) || 0)],
      ];
    } else if (probe.kind === 'resistor') {
      const comp = probe.comp;
      title.textContent = 'Resistor';
      const { high, low, drop } = acrossVolts(comp);
      rows = [
        ['Resistance', comp.getLabel ? comp.getLabel() : comp.resistance + ' Ω'],
        ['V+', fmtV(high)],
        ['V−', fmtV(low)],
        ['Voltage Drop', fmtV(drop)],
        ['Current', fmtI(sim.componentCurrents.get(comp.id) || 0)],
      ];
    } else if (probe.kind === 'capacitor') {
      const comp = probe.comp;
      title.textContent = comp.type === COMP.POLARIZED_CAPACITOR ? 'Capacitor (Polarized)' : 'Capacitor';
      // vPrev is the simulator's integrated cap voltage (the state variable);
      // charge follows from Q = C·V.
      const vCap = comp.vPrev ?? 0;
      rows = [
        ['Capacitance', fmtC(comp.capacitance)],
        ['Charge', fmtQ(comp.capacitance * vCap)],
        ['Voltage', fmtV(vCap)],
      ];
    } else if (probe.kind === 'inductor') {
      const comp = probe.comp;
      title.textContent = 'Inductor';
      // iPrev is the simulator's stored coil current (the state variable);
      // the interesting number for a coil is its current, not its voltage.
      const { drop } = acrossVolts(comp);
      rows = [
        ['Inductance', comp.getLabel ? comp.getLabel() : comp.inductance + ' H'],
        ['Current', fmtI(Math.abs(comp.iPrev ?? 0))],
        ['Voltage Drop', fmtV(drop)],
      ];
    } else { // wire (jumper)
      const wire = probe.wire;
      title.textContent = 'Wire';
      // A jumper is a single electrical node, so its voltage is the net potential.
      const net = nl.findNetByHole(wire.startHoleId) || nl.findNetByHole(wire.endHoleId);
      rows = [
        ['Voltage', fmtV(net ? sim.netVoltages.get(net.id) : undefined)],
        // Actual current through THIS jumper, as a series meter would read it.
        ['Current', fmtI(this._wireCurrent(wire))],
      ];
    }

    container.innerHTML = `
      <div class="probe-readout">
        ${rows.map(([label, value]) => `
        <div class="probe-row">
          <span class="probe-label">${label}</span>
          <span class="probe-value">${value}</span>
        </div>`).join('')}
      </div>`;
  }

  // Current actually flowing through a single jumper wire — what a multimeter
  // placed in series would read. The simulator treats jumpers as ideal merges
  // (no per-wire current), so we reconstruct it by KCL: a jumper is an edge in
  // the graph of breadboard strips that make up its net. Cutting that edge
  // splits the net in two; the current through the wire is the net current
  // entering whichever side we can account for from its branch currents.
  _wireCurrent(wire) {
    const sim = this.simulator;
    const nl  = sim.netlist;
    const world = this.world;
    const net = nl.findNetByHole(wire.startHoleId) || nl.findNetByHole(wire.endHoleId);
    if (!net) return 0;
    const holeSet = net.holes;

    // Union-find: group the net's holes into physical breadboard strips. Strips
    // are joined by the board itself (getConnectedHoles), NOT by jumper wires.
    const parent = new Map();
    for (const h of holeSet) parent.set(h, h);
    const find = (h) => { let r = h; while (parent.get(r) !== r) r = parent.get(r); while (parent.get(h) !== r) { const n = parent.get(h); parent.set(h, r); h = n; } return r; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
    for (const h of holeSet) {
      for (const nb of world.getConnectedHoles(h)) {
        if (holeSet.has(nb)) union(h, nb);
      }
    }
    const stripOf = (holeId) => find(holeId);

    const sStart = stripOf(wire.startHoleId);
    const sEnd   = stripOf(wire.endHoleId);
    // Wire's two holes already share a strip → it bridges nothing, carries ~0.
    if (sStart === sEnd) return 0;

    // Jumper wires within this net are the edges between strips. The wires that
    // directly parallel this one (same pair of strips) form a bundle; current
    // splits evenly across them.
    const netWires = this.state.wireManager.wires.filter(w =>
      holeSet.has(w.startHoleId) && holeSet.has(w.endHoleId));
    const adj = new Map();
    const addAdj = (a, b) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b); };
    let parallelCount = 0;
    for (const w of netWires) {
      const a = stripOf(w.startHoleId), b = stripOf(w.endHoleId);
      const parallelToW = (a === sStart && b === sEnd) || (a === sEnd && b === sStart);
      if (parallelToW) { parallelCount++; continue; } // exclude the whole bundle
      addAdj(a, b); addAdj(b, a);
    }
    if (parallelCount < 1) parallelCount = 1;

    // BFS one side of the cut (sStart) without crossing the parallel bundle.
    const side1 = new Set([sStart]);
    const queue = [sStart];
    while (queue.length) {
      const s = queue.pop();
      for (const nb of (adj.get(s) || [])) if (!side1.has(nb)) { side1.add(nb); queue.push(nb); }
    }
    const onSide1 = (holeId) => side1.has(stripOf(holeId));

    // Sum signed branch current entering each side from cross-net components we
    // can model (passive: resistor / LED / diode / capacitor). A side that also
    // carries an un-modelled source (power rail, chip pin, clock, 7-seg, switch)
    // is flagged incomputable; we then read the current off the purely-passive
    // side instead — by KCL it carries the same magnitude through the wire.
    let sum1 = 0, sum2 = 0;
    let ok1 = true, ok2 = true;
    for (const h of holeSet) {
      if (parseHoleId(h).type === 'power') { if (onSide1(h)) ok1 = false; else ok2 = false; }
    }
    for (const { comp, pin } of net.pins) {
      const s1 = onSide1(pin.holeId);
      const inj = this._pinInjection(comp, pin);
      if (inj === undefined) { if (s1) ok1 = false; else ok2 = false; continue; }
      if (s1) sum1 += inj; else sum2 += inj;
    }

    let total;
    if (ok1)      total = Math.abs(sum1);
    else if (ok2) total = Math.abs(sum2);
    else          total = Math.abs(sum1); // best effort when both sides have sources
    return total / parallelCount;
  }

  // Signed current entering `pin`'s net from a 2-terminal passive component
  // (positive = into the net). Returns undefined for components we don't model
  // as passive branches (chips, switches, etc.) so the caller can fall back.
  _pinInjection(comp, pin) {
    const sim = this.simulator;
    const nl  = sim.netlist;
    const thisNet = nl.findNetByHole(pin.holeId);
    const vThis = thisNet ? sim.netVoltages.get(thisNet.id) : undefined;

    if (comp.type === COMP.RESISTOR) {
      const other = comp.pins.find(p => p !== pin);
      const oNet  = other ? nl.findNetByHole(other.holeId) : null;
      const vOther = oNet ? sim.netVoltages.get(oNet.id) : undefined;
      if (vThis === undefined || vOther === undefined || !comp.resistance) return undefined;
      return (vOther - vThis) / comp.resistance; // current flows in from the higher side
    }
    if (comp.type === COMP.LED || comp.type === COMP.DIODE) {
      const I = sim.componentCurrents.get(comp.id) || 0;
      // Conventional current flows anode→cathode: it leaves the anode net (−I)
      // and enters the cathode net (+I). pins[0]=anode, pins[1]=cathode.
      const isAnode = comp.pins[0] === pin;
      return isAnode ? -I : I;
    }
    if (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) {
      const I = sim.componentCurrents.get(comp.id) || 0;
      const other = comp.pins.find(p => p !== pin);
      const oNet  = other ? nl.findNetByHole(other.holeId) : null;
      const vOther = oNet ? sim.netVoltages.get(oNet.id) : undefined;
      if (vThis === undefined || vOther === undefined) return undefined;
      return Math.sign(vOther - vThis) * I; // charging current flows toward the lower side
    }
    if (comp.type === COMP.INDUCTOR) {
      // Stored current iPrev flows pin A → pin B: it leaves A's net (−I)
      // and enters B's net (+I). pins[0]=A, pins[1]=B.
      const I = comp.iPrev || 0;
      const isA = comp.pins[0] === pin;
      return isA ? -I : I;
    }
    return undefined;
  }

  // ── Rotating Status Message & Bug Report ─────────────────────────────────
  _initRotatingMessage() {
    const chipCount = getAllChipIds().length;
    const messages = [
      { text: 'Found a bug? <u>Report it</u>', action: 'bugreport' },
      { text: 'Feedback?', action: 'feedback' },
      { text: 'Got questions? Ask the community', href: 'https://www.reddit.com/r/74Sim' },
      { text: `${chipCount} chips, infinite possibilities` },
      { text: 'Want to support 74Sim? Share with your friends' },
    ];

    const span = document.getElementById('rotating-message-text');
    let idx = 0;

    const applyMessage = (msg) => {
      span.innerHTML = '';
      if (msg.href) {
        const a = document.createElement('a');
        a.href = msg.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = msg.text;
        span.appendChild(a);
      } else if (msg.action === 'bugreport') {
        const btn = document.createElement('button');
        btn.className = 'rotating-msg-btn';
        btn.innerHTML = msg.text;
        btn.addEventListener('click', () => this._openBugReport());
        span.appendChild(btn);
      } else if (msg.action === 'feedback') {
        const btn = document.createElement('button');
        btn.className = 'rotating-msg-btn';
        btn.textContent = msg.text;
        btn.addEventListener('click', () => this._openFeedback());
        span.appendChild(btn);
      } else {
        span.textContent = msg.text;
      }
    };

    applyMessage(messages[0]);

    setInterval(() => {
      span.classList.add('fading');
      setTimeout(() => {
        idx = (idx + 1) % messages.length;
        applyMessage(messages[idx]);
        span.classList.remove('fading');
      }, 400);
    }, 10000);

    if (location.hash === '#feedback') this._openFeedback();
    else if (location.hash === '#bugreport') this._openBugReport();
  }

  _openBugReport() {
    window.open('/bug-report', '_blank');
  }

  _openFeedback() {
    window.open('/feedback', '_blank');
  }

  // ── Timing Analysis panel ─────────────────────────────────────────
  // Opt-in timing mode: real per-chip tPD, event-driven engine (js/timing.js),
  // waveform lanes for every clock and test point (js/timingDiagram.js).
  _showTimingAnalyzer() {
    // Take over the shared side panel (same convention as the other views).
    this.currentInfoComp = null;
    this.currentProbe = null;
    this.state.showLogicView = false;
    this.state.showCircuitInfo = false;
    this.state.showValues = false;
    this.state.logicLabels = null;
    this.state.showTiming = true;

    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    title.textContent = 'Timing Analysis';
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    container.innerHTML = `
      <div class="timing-modes" id="tm-modes">
        <button class="timing-mode" id="tm-mode-stop" data-mode="stop">■ Stopped</button>
        <button class="timing-mode" id="tm-mode-real" data-mode="real">▶ Real time<small>1 s / s</small></button>
        <button class="timing-mode" id="tm-mode-prop" data-mode="prop">▶ Propagation<small>10 ns / s</small></button>
      </div>
      <div class="timing-row">
        <button class="timing-btn" id="tm-step" title="Advance the analysis by 10 ns">Step 10 ns</button>
        <button class="timing-btn" id="tm-reset" title="Restart the analysis at t = 0">t=0</button>
        <span class="timing-time" id="tm-time">t = 0 ps</span>
      </div>
      <div class="timing-row">
        <span class="timing-behind" id="tm-behind" style="display:none">⚠ can't keep up — lower the speed or clock</span>
      </div>
      <canvas id="timing-canvas"></canvas>
      <div class="timing-row">
        <button class="timing-btn" id="tm-place-tp" title="Place a Test Point probe on the board to record its trace">+ Place Test Point</button>
      </div>`;

    // Enter timing mode: current settled state becomes t=0.
    const eng = this.simulator.beginTimingMode(this.world, this.state.components, this.state.wireManager);
    eng.rateNsPerSec = 10;
    eng.running = true;
    eng.onReset = () => {
      if (this.timingDiagram) this.timingDiagram.resetView();
      this._renderDirty = true;
    };

    this.timingDiagram = new TimingDiagram(container.querySelector('#timing-canvas'), this);

    // Three-way run mode: Stopped / Real time / Propagation-scale. The buttons
    // form a segmented control — one is always active and highlighted.
    const modeBtns = container.querySelectorAll('.timing-mode');
    const setMode = (mode) => {
      if (mode === 'stop') {
        eng.running = false;
      } else if (mode === 'real') {
        eng.rateNsPerSec = 1e9;
        eng.running = true;
        // Seconds-scale zoom: at this pxPerNs the 1-2-5 time axis lands on a
        // 500 ms step, i.e. a marker every half second in the "1 s / s" view.
        if (this.timingDiagram) { this.timingDiagram.pxPerNs = 2e-7; this.timingDiagram.follow = true; }
      } else { // 'prop'
        eng.rateNsPerSec = 10;
        eng.running = true;
        // Nanosecond-scale zoom for propagation-delay viewing.
        if (this.timingDiagram) { this.timingDiagram.pxPerNs = 6; this.timingDiagram.follow = true; }
      }
      modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    };
    modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    setMode('prop');

    container.querySelector('#tm-step').addEventListener('click', () => {
      setMode('stop');
      eng.advanceByPs(10000); // 10 ns
      this._renderDirty = true;
    });
    // t=0 restarts the analysis and drops playback to Stopped, so the trace
    // freezes at t=0 instead of immediately running forward again.
    container.querySelector('#tm-reset').addEventListener('click', () => {
      setMode('stop');
      eng.reset();
    });
    // Place a Test Point probe straight from the panel (adds a lane on drop).
    container.querySelector('#tm-place-tp').addEventListener('click', () => {
      this.interaction.startPlacement(COMP.TESTPOINT);
    });
  }

  /**
   * Leave timing mode and restore the live engine. Safe to call from any
   * path — the panel close button, another view taking over the side panel,
   * or a full state reload. No-op when timing was never entered.
   */
  _teardownTimingMode() {
    if (!this.state.showTiming && !this.simulator.timing) return;
    this.state.showTiming = false;
    if (this.timingDiagram) { this.timingDiagram.destroy(); this.timingDiagram = null; }
    const wasActive = !!(this.simulator.timing && this.simulator.timing.active);
    this.simulator.endTimingMode();
    const panel = document.getElementById('side-panel');
    if (panel) panel.classList.remove('timing-wide');
    if (wasActive) this.onCircuitChanged(); // re-evaluate live + restart wall-clock loop
  }

  _updateTimingReadout() {
    const eng = this.simulator.timing;
    if (!eng) return;
    const el = document.getElementById('tm-time');
    if (el) {
      const ps = eng.timePs;
      const fmt = ps < 1e3 ? `${ps} ps`
        : ps < 1e6 ? `${(ps / 1e3).toFixed(1)} ns`
        : ps < 1e9 ? `${(ps / 1e6).toFixed(3)} µs`
        : ps < 1e12 ? `${(ps / 1e9).toFixed(3)} ms`
        : `${(ps / 1e12).toFixed(3)} s`;
      el.textContent = `t = ${fmt}`;
    }
    const behind = document.getElementById('tm-behind');
    if (behind) behind.style.display = eng.behind ? '' : 'none';
  }

  _closeInfoPanel() {
    this.currentInfoComp = null;
    this.currentProbe = null;
    this.state.showLogicView = false;
    this.state.showCircuitInfo = false;
    this.state.showValues = false;
    this.state.logicLabels = null;
    this._teardownTimingMode();
    const panel = document.getElementById('side-panel');
    panel.classList.add('collapsed');
    // Resize after the CSS width transition completes so the canvas fills the
    // newly freed space. A timeout fallback handles prefers-reduced-motion
    // (where no transitionend fires).
    let resized = false;
    const doResize = () => { if (!resized) { resized = true; this.renderer._resize(); this._renderDirty = true; } };
    panel.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName === 'width') { panel.removeEventListener('transitionend', onEnd); doResize(); }
    });
    setTimeout(doResize, 220);
    const btnLogic = document.getElementById('btn-logic');
    btnLogic.classList.remove('active');
  }

  // Drop every in-memory reference that points at state.components / wires.
  // Must be called after any path that replaces or rebuilds state.components
  // (load from storage, cloud load, undo). Without this, currentInfoComp,
  // drag ghosts, held buttons, and bounce timers keep pointing at orphans
  // the class of bug that historically made users reload the page.
  _resetTransientRefs() {
    this._closeInfoPanel();
    this.interaction.resetAll();
    // Wipe simulator drive states the map is keyed by compId:pinName and
    // holds closure refs to the old component objects. After topology
    // replacement those refs are orphans; their stale PUSH_PULL stamps would
    // still be applied at their old hole positions during the next MNA solve,
    // producing intermediate voltages (~2.5 3 V) on contested nets.
    this.simulator.pinDriveStates.clear();
    // Same for chip pin couplings (bilateral switches, analog muxes): stale
    // entries would keep a phantom resistive bridge stamped between holes.
    this.simulator.chipCouplings.clear();
  }

  // ── Cached Projects ────────────────────────────────────────────────────────
  _renderCachedProjects() {
    const container = document.getElementById('cached-projects-list');
    if (!container) return;
    const projects = getProjectCache();
    container.innerHTML = '';
    if (projects.length === 0) {
      container.innerHTML = `<div class="cached-project-empty">${t('file.noCached', { def: 'No cached projects yet' })}</div>`;
      return;
    }
    for (const p of projects) {
      const isActive = p.id === this._currentProjectId;
      const item = document.createElement('div');
      item.className = 'dropdown-item cached-project-item' + (isActive ? ' cached-project-active' : '');
      item.dataset.id = p.id;

      const d = new Date(p.timestamp);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      const dateStr = `${mm}/${dd}/${yy}`;
      const countStr = `${p.componentCount} components`;

      item.innerHTML = `
        <div class="cached-project-row">
          <div class="cached-project-info">
            <span class="cached-project-name">${_escHtml(p.name)}${isActive ? ' <span class="cached-project-badge">current</span>' : ''}</span>
            <span class="cached-project-meta">${dateStr} · ${countStr}</span>
          </div>
          <button class="cached-project-delete" data-id="${p.id}" title="Remove from cache">×</button>
        </div>`;

      item.querySelector('.cached-project-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteProjectFromCache(p.id);
        this._renderCachedProjects();
      });

      item.addEventListener('click', () => {
        if (!isActive) this._loadCachedProject(p.id);
      });

      container.appendChild(item);
    }
  }

  _loadCachedProject(id) {
    const entry = loadProjectById(id);
    if (!entry || !entry.state) return;
    if (deserializeState(entry.state, this.state, this.world)) {
      this._rebuildWorldTiles();
      this.textBoxManager.deserialize(this.state.textBoxes);
      this.imageBoxManager.deserialize(this.state.imageBoxes);
      this._resetTransientRefs();
      this._currentProjectId = id;
      setCurrentProjectId(id);
      this._lastStructuralHash = '';
      // Restore the sticky filename for this project so saves suggest its name.
      if (entry.name) {
        const fname = /\.json$/i.test(entry.name) ? entry.name : `${entry.name}.json`;
        setStoredFilename(fname);
      } else {
        clearStoredFilename();
      }
      this.onCircuitChanged();
      this._closeAllDropdowns();
    }
  }
}

function _escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
