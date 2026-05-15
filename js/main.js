// ── 74SIM Main Entry Point ───────────────────────────────────────────────────

import { COMP, MODE, getFamilySpec, DEFAULT_FAMILY } from './constants.js';
import { createComponent } from './components.js';
import { BreadboardWorld, parseHoleId } from './breadboard.js';
import { Renderer } from './renderer.js';
import { Interaction } from './interaction.js';
import { WireManager } from './wire.js';
import { LogicAnalyzer, exprToString, exprToProgramming, exprToMath, exprToStatement, renameInputs, evalExpr } from './logic.js';
import { CircuitSimulator } from './simulator.js';
import { getAllChipIds, searchChips, getChipDef, CHIP_DB } from './chips.js';
import {
  serializeState, saveToLocalStorage, loadFromLocalStorage,
  deserializeState, importFromFile, exportToFile,
  suggestCircuitName, generateProjectId, getCurrentProjectId, setCurrentProjectId,
  isTauri, saveStateToFile, openStateFromFile,
  getCurrentFilePath, setCurrentFilePath, basenameOf,
  isAutosaveEnabled, setAutosaveEnabled,
  scheduleFsAutosave, loadFsAutosave,
  onAutosaveStatus, emitAutosaveStatus,
} from './storage.js';

import { TextBoxManager } from './textbox.js';
import { loadExamples } from './examples.js';

// ── Debounced localStorage save ───────────────────────────────────────────────
// Circuit topology doesn't change during rapid interactions (dragging, etc.)
// so we defer the JSON.stringify to avoid blocking the main thread.
let _saveTimer = null;
function debouncedSave(state, fsTargetPath = null) {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => saveToLocalStorage(state), 400);
  // In Tauri, also debounce-write to the bound file path (the user's opened
  // file). If no file is bound, scheduleFsAutosave falls back to a recovery
  // autosave.json in the OS app data dir.
  scheduleFsAutosave(state, fsTargetPath);
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

// 2-bit gray code sequence
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
    return `<div class="la-kmap-empty">K-Map only supported for 2–4 inputs (this output uses ${n}).</div>`;
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
    this.interaction = new Interaction(this);
    this.analyzer = new LogicAnalyzer();
    this.simulator = new CircuitSimulator();

    this.undoStack = [];
    this.clipboard = null;
    this.chipPopularityMap = {};
    this.chipPopularityLoaded = false;
    this.currentInfoComp = null;
    this.lastInteractionTime = Date.now();
    this._currentProjectId = getCurrentProjectId();

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
      showNetPower: false,
      showSimpleChipNames: false,
      showValues: false,
      showRealisticBoard: false,
      pureDigital: false,
      chipFamily: DEFAULT_FAMILY,
      extraTiles: [],
      textBoxes: [],
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
      }
    );

    // Track which file (if any) the current circuit lives in on disk.
    this._currentFilePath = isTauri() ? getCurrentFilePath() : null;

    // Try to restore from localStorage. In Tauri, prefer the on-disk autosave
    // when it is newer or when localStorage is empty (loaded async, applied
    // only if the user hasn't started editing yet).
    const saved = loadFromLocalStorage();
    if (saved) {
      deserializeState(saved, this.state, this.world);
      this._rebuildWorldTiles();
      this.textBoxManager.deserialize(this.state.textBoxes);
      this._resetTransientRefs();
    }
    if (isTauri()) {
      loadFsAutosave().then(fsState => {
        if (!fsState) return;
        if (this._dirty || this._hasWork()) return; // user already started editing
        if (deserializeState(fsState, this.state, this.world)) {
          this._rebuildWorldTiles();
          this.textBoxManager.deserialize(this.state.textBoxes ?? []);
          this._resetTransientRefs();
          this.onCircuitChanged();
          this._renderDirty = true;
        }
      }).catch(() => {});
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

    // Warm up chip popularity in the background so the first dropdown open
    // is instant (no extra round-trip to /api/chips/popularity).
    this._loadChipPopularity();

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
      window.location.href = 'docs.html#examples';
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
      const m = this.interaction.mode;
      // Always render during active interactions or when state has changed.
      // Also keep rendering every frame when showNetPower is on because the
      // animated current-flow dots use performance.now() for animation timing.
      const needsRedraw = this._renderDirty ||
                          m !== MODE.IDLE ||
                          this.interaction.isPanning ||
                          this.state.showNetPower;

      if (needsRedraw) {
        // Merge interaction state into draw state
        // Show ghost for DIP placement modes AND drag-to-move (all component types)
        this.state.ghost = (m === MODE.PLACE_CHIP || m === MODE.PLACE_OUTPUT || m === MODE.MOVE_COMP)
          ? this.interaction.ghost : null;
        this.state.ghosts = (m === MODE.MOVE_COMP) ? this.interaction.ghosts : [];
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
      // Always sync textbox DOM positions to the current viewport this must run
      // every frame (not just when needsRedraw) so boxes track pan/zoom instantly.
      this.textBoxManager.updateViewport(
        this.renderer.offsetX, this.renderer.offsetY, this.renderer.zoom
      );
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
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
        this._loadChipPopularity().then(() => this._renderChipList(chipSearch.value));
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

    dropInput.querySelectorAll('.dropdown-item').forEach(item => {
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

    const itemPureDigital = document.getElementById('more-pure-digital');
    itemPureDigital.classList.toggle('active', this.state.pureDigital);
    itemPureDigital.addEventListener('click', () => this._togglePureDigital());
    const pdBadge = document.getElementById('pure-digital-badge');
    if (pdBadge) pdBadge.style.display = this.state.pureDigital ? '' : 'none';

    itemHelp.addEventListener('click', () => {
      this._closeAllDropdowns();
      // Navigate in same window so Tauri doesn't need extra window permissions.
      window.location.href = 'docs.html';
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

    const itemSimpleClock = document.getElementById('more-simple-clock');
    itemSimpleClock.addEventListener('click', () => {
      this._closeAllDropdowns();
      this.interaction.startPlacement(COMP.CLOCK);
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
      dropFile.classList.toggle('show');
    });

    // Reveal desktop-only File / Settings menu items when running in Tauri.
    if (isTauri()) {
      document.querySelectorAll('.desktop-only').forEach(el => {
        el.style.display = '';
      });
      this._refreshSaveLabel();
    }

    // Tauri-only filesystem Save / Save As / Open.
    const elSave   = document.getElementById('file-save-fs');
    const elSaveAs = document.getElementById('file-save-as');
    const elOpen   = document.getElementById('file-open');
    if (elSave) elSave.addEventListener('click', async () => {
      this._closeAllDropdowns();
      await this._fsSave({ saveAs: false });
    });
    if (elSaveAs) elSaveAs.addEventListener('click', async () => {
      this._closeAllDropdowns();
      await this._fsSave({ saveAs: true });
    });
    if (elOpen) elOpen.addEventListener('click', async () => {
      this._closeAllDropdowns();
      await this._fsOpen();
    });

    // Autosave toggle (desktop-only).
    const elAutosave = document.getElementById('more-autosave');
    if (elAutosave) {
      elAutosave.classList.toggle('active', isAutosaveEnabled());
      this._applyAutosaveUi(isAutosaveEnabled());
      elAutosave.addEventListener('click', () => {
        const next = !isAutosaveEnabled();
        setAutosaveEnabled(next);
        elAutosave.classList.toggle('active', next);
        this._applyAutosaveUi(next);
        if (next) {
          // Kick off an immediate write so the indicator confirms the file
          // is current — and so a freshly-toggled-on autosave doesn't sit
          // silent until the user makes the next change.
          scheduleFsAutosave(this.state, this._currentFilePath || null);
        }
      });
    }

    // Subscribe to autosave status events to drive the toolbar indicator.
    if (isTauri()) {
      onAutosaveStatus((status) => this._renderAutosaveStatus(status));
      // Initial state: nothing pending yet, file is current.
      this._renderAutosaveStatus('saved');
    }

    document.getElementById('file-clear').addEventListener('click', () => {
      this._closeAllDropdowns();
      this.pushUndo();
      this.state.components = [];
      this.state.wireManager.clear();
      this.state.selectedItems = [];
      this.state.extraTiles = [];
      this.state.textBoxes = [];
      this.textBoxManager.clear();
      this._rebuildWorldTiles();
      this._resetTransientRefs();
      this._resetPureDigital();
      this.interaction.cancelMode();
      this._currentProjectId = generateProjectId();
      setCurrentProjectId(this._currentProjectId);
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
        // Cmd/Ctrl+Shift+S → Save As, plain Cmd/Ctrl+S → Save (or first-time prompt)
        if (isTauri()) this._fsSave({ saveAs: e.shiftKey });
      } else if (key === 'o') {
        e.preventDefault();
        if (isTauri()) this._fsOpen();
      } else if (key === 'l') {
        // Legacy shortcut from the old "Load from local" item.
        e.preventDefault();
        if (isTauri()) this._fsOpen();
      }
    });
  }

  // ── Tauri filesystem Save / Open helpers ────────────────────────────────────
  async _fsSave({ saveAs = false } = {}) {
    if (!isTauri()) return;
    try {
      const target = saveAs ? null : this._currentFilePath;
      const path = await saveStateToFile(this.state, target);
      if (!path) return; // cancelled
      this._currentFilePath = path;
      setCurrentFilePath(path);
      this._refreshSaveLabel();
      this._dirty = false;
      // Keep the autosave indicator in sync with an explicit save.
      emitAutosaveStatus('saved');
    } catch (e) {
      console.error('Save failed:', e);
      emitAutosaveStatus('error', e);
      alert('Save failed: ' + (e?.message || e));
    }
  }

  async _fsOpen() {
    if (!isTauri()) return;
    try {
      const result = await openStateFromFile();
      if (!result) return; // cancelled
      const { path, data } = result;
      if (deserializeState(data, this.state, this.world)) {
        this._rebuildWorldTiles();
        this.textBoxManager.deserialize(this.state.textBoxes ?? []);
        this._resetTransientRefs();
        this._currentFilePath = path;
        setCurrentFilePath(path);
        this._refreshSaveLabel();
        this._currentProjectId = generateProjectId();
        setCurrentProjectId(this._currentProjectId);
        this.onCircuitChanged();
        this._renderDirty = true;
        this._dirty = false;
      }
    } catch (e) {
      console.error('Open failed:', e);
      alert('Open failed: ' + (e?.message || e));
    }
  }

  async _refreshSaveLabel() {
    const desc = document.getElementById('file-save-fs-desc');
    if (!desc) return;
    if (this._currentFilePath) {
      const name = await basenameOf(this._currentFilePath);
      desc.textContent = `Save to ${name}`;
    } else {
      desc.textContent = 'Save...';
    }
  }

  // Hide the manual "Save" item (and its divider) when autosave is on —
  // every change is already being written. Show the toolbar status indicator
  // so the user can see autosave activity.
  _applyAutosaveUi(autosaveOn) {
    if (!isTauri()) return;
    const elSave = document.getElementById('file-save-fs');
    const elDivider = document.getElementById('file-divider-1');
    const elStatus = document.getElementById('autosave-status');
    if (elSave) elSave.style.display = autosaveOn ? 'none' : '';
    if (elDivider) elDivider.style.display = autosaveOn ? 'none' : '';
    if (elStatus) elStatus.style.display = autosaveOn ? '' : 'none';
  }

  _renderAutosaveStatus(status) {
    const el = document.getElementById('autosave-status');
    if (!el) return;
    el.classList.remove('is-pending', 'is-saving', 'is-saved', 'is-error');
    switch (status) {
      case 'pending':
      case 'saving':
        el.textContent = 'Saving...';
        el.classList.add('is-saving');
        break;
      case 'error':
        el.textContent = 'Save failed';
        el.classList.add('is-error');
        break;
      case 'saved':
      default:
        el.textContent = 'Saved';
        el.classList.add('is-saved');
        break;
    }
  }

  _closeAllDropdowns() {
    document.querySelectorAll('.dropdown-panel').forEach(d => d.classList.remove('show'));
    // Collapse examples submenu
    const el = document.getElementById('examples-list');
    if (el) el.style.display = 'none';
    const toggle = document.getElementById('more-examples');
    if (toggle) toggle.querySelector('.dropdown-item-name').textContent = 'Example Projects ▸';
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

  _renderChipList(query) {
    const chipList = document.getElementById('chip-list');
    const sortByNumber = !document.getElementById('chip-sort-by-number').checked;
    const opts = { popularityMap: this.chipPopularityMap, sortByNumber };
    chipList.innerHTML = '';

    const ids = searchChips(query, opts);
    if (ids.length === 0) {
      chipList.innerHTML = '<div class="empty-state">No chips found</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    for (const id of ids) {
      frag.appendChild(this._makeChipListItem(id));
    }
    chipList.appendChild(frag);
  }

  async _loadChipPopularity() {
    if (this.chipPopularityLoaded) return;
    // Best-effort fetch from the live website. Fails silently in the desktop
    // app when offline or when the WebView can't reach 74sim.com.
    try {
      const res = await fetch('https://74sim.com/api/chips/popularity');
      if (res.ok) {
        const data = await res.json();
        for (const { chip_id, total_count } of data) {
          this.chipPopularityMap[chip_id] = total_count;
        }
      }
    } catch (_) { /* non-critical, silently ignore */ }
    this.chipPopularityLoaded = true;
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

    html += `<div class="sim-note">Note: simulation is not perfect and can have errors be careful with real circuits.</div>`;

    container.innerHTML = html;
  }

  // ── Chip / 7-Seg Info Panel ───────────────────────────────────────────────
  showChipInfo(comp) {
    this.currentInfoComp = comp;
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

    // ── Push Button ───────────────────────────────────────────────────────
    if (comp.type === COMP.BUTTON) {
      title.textContent = 'Push Button';
      const sim = this.simulator;
      const nl  = sim.netlist;
      const pinVoltage = (pin) => {
        const net = nl.findNetByHole(pin.holeId);
        if (!net) return undefined;
        return sim.netVoltages.get(net.id);
      };
      const fmtV = (v) => {
        if (v === undefined) return '<span class="pin-v-float">?</span>';
        if (v >= 4.5)        return '<span class="pin-v-hi">H</span>';
        if (v <= 0.5)        return '<span class="pin-v-lo">L</span>';
        return `<span class="pin-v-mid">${v.toFixed(1)}</span>`;
      };

      const stateBadge = comp.pressed
        ? '<div class="comp-state-badge comp-state-active">▶ PRESSED</div>'
        : '<div class="comp-state-badge comp-state-inactive">○ RELEASED</div>';

      const pinDefs = [
        { name: 'TL', label: 'Top Left'  },
        { name: 'TR', label: 'Top Right' },
        { name: 'BL', label: 'Bot Left'  },
        { name: 'BR', label: 'Bot Right' },
      ];
      let pinRows = '';
      for (const pd of pinDefs) {
        const cp = comp.pins.find(p => p.name === pd.name);
        const v  = cp ? pinVoltage(cp) : undefined;
        pinRows += `<tr>
          <td class="pin-num">${pd.name}</td>
          <td class="pin-name pin-passive">${pd.label}</td>
          <td>${fmtV(v)}</td>
        </tr>`;
      }

      // SVG pinout diagram: 2×2 grid resembles a 6×6 mm tactile switch
      const svgBtn = `
        <svg class="btn-pinout-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- body -->
          <rect x="10" y="10" width="60" height="60" rx="6" fill="#1a1a1a" stroke="#555" stroke-width="2"/>
          <!-- button cap -->
          <circle cx="40" cy="40" r="16" fill="${comp.pressed ? '#555' : '#333'}" stroke="#777" stroke-width="1.5"/>
          <circle cx="40" cy="40" r="10" fill="${comp.pressed ? '#888' : '#444'}" stroke="#999" stroke-width="1"/>
          <!-- pins -->
          <rect x="4"  y="20" width="8" height="4" rx="1" fill="#aaa"/><text x="2" y="17" fill="#ffffff" font-size="7" font-family="monospace">TL</text>
          <rect x="68" y="20" width="8" height="4" rx="1" fill="#aaa"/><text x="64" y="17" fill="#ffffff" font-size="7" font-family="monospace">TR</text>
          <rect x="4"  y="56" width="8" height="4" rx="1" fill="#aaa"/><text x="2" y="68" fill="#ffffff" font-size="7" font-family="monospace">BL</text>
          <rect x="68" y="56" width="8" height="4" rx="1" fill="#aaa"/><text x="64" y="68" fill="#ffffff" font-size="7" font-family="monospace">BR</text>
          <!-- internal connections (left pair + right pair always joined) -->
          <line x1="8" y1="22" x2="8" y2="58" stroke="${comp.pressed ? '#4f4' : '#484'}" stroke-width="1" stroke-dasharray="3,2"/>
          <line x1="72" y1="22" x2="72" y2="58" stroke="${comp.pressed ? '#4f4' : '#484'}" stroke-width="1" stroke-dasharray="3,2"/>
          ${comp.pressed ? '<line x1="8" y1="40" x2="72" y2="40" stroke="#4f4" stroke-width="1" stroke-dasharray="3,2"/>' : ''}
        </svg>`;

      container.innerHTML = `
        <div class="comp-state-wrap">${stateBadge}</div>
        <div class="chip-info-desc">Momentary 4-pin tactile push button (6×6 mm). Click to press/release.</div>
        <div class="btn-pinout-wrap">${svgBtn}</div>
        <table class="chip-pinout-table">
          <thead><tr><th class="pin-num">Pin</th><th class="pin-name">Name</th><th>State</th></tr></thead>
          <tbody>${pinRows}</tbody>
        </table>
        <div class="chip-pinout-legend">
          <span style="color:#888">TL/BL always joined &nbsp;·&nbsp; TR/BR always joined &nbsp;·&nbsp; Press bridges both pairs</span>
        </div>
        <a class="chip-datasheet-link" href="https://components101.com/switches/push-button" target="_blank" rel="noopener">View on Components101 ↗</a>
        <div class="chip-help-section">
          <button class="chip-help-btn">How to use</button>
          <div class="chip-help-text">
            <strong>Typical wiring:</strong> Connect one side (TL/BL) to GND and the other side (TR/BR) to your input node plus a <strong>pull-up resistor to VCC</strong>. The input reads HIGH when the button is released, and LOW when pressed.<br><br>
            <strong>Pin pairs:</strong> TL↔BL and TR↔BR are internally connected at all times. Press bridges both pairs together (TL=TR=BL=BR).
          </div>
        </div>`;

      container.querySelector('.chip-help-btn').addEventListener('click', () => {
        const helpText = container.querySelector('.chip-help-text');
        const visible = helpText.classList.toggle('chip-help-text-open');
        container.querySelector('.chip-help-btn').textContent = visible ? 'Hide' : 'How to use';
      });
      return;
    }

    // ── Push Button (2-pin momentary) ─────────────────────────────────────
    if (comp.type === COMP.PUSH_BUTTON) {
      title.textContent = 'Push Button (2-pin)';
      const sim = this.simulator;
      const nl  = sim.netlist;
      const pinVoltage = (pin) => {
        const net = nl.findNetByHole(pin.holeId);
        if (!net) return undefined;
        return sim.netVoltages.get(net.id);
      };
      const fmtV = (v) => {
        if (v === undefined) return '<span class="pin-v-float">?</span>';
        if (v >= 4.5)        return '<span class="pin-v-hi">H</span>';
        if (v <= 0.5)        return '<span class="pin-v-lo">L</span>';
        return `<span class="pin-v-mid">${v.toFixed(1)}</span>`;
      };

      const stateBadge = comp.pressed
        ? '<div class="comp-state-badge comp-state-active">▶ PRESSED</div>'
        : '<div class="comp-state-badge comp-state-inactive">○ RELEASED</div>';

      const pinDefs = [
        { name: 'A', label: 'Pin A' },
        { name: 'B', label: 'Pin B' },
      ];
      let pinRows = '';
      for (const pd of pinDefs) {
        const cp = comp.pins.find(p => p.name === pd.name);
        const v  = cp ? pinVoltage(cp) : undefined;
        pinRows += `<tr>
          <td class="pin-num">${pd.name}</td>
          <td class="pin-name pin-passive">${pd.label}</td>
          <td>${fmtV(v)}</td>
        </tr>`;
      }

      const svgBtn = `
        <svg class="btn-pinout-svg" viewBox="0 0 80 42" xmlns="http://www.w3.org/2000/svg">
          <!-- body -->
          <rect x="15" y="6" width="50" height="30" rx="5" fill="#1a1a1a" stroke="#555" stroke-width="2"/>
          <!-- button cap -->
          <circle cx="40" cy="21" r="10" fill="${comp.pressed ? '#555' : '#333'}" stroke="#777" stroke-width="1.5"/>
          <circle cx="40" cy="21" r="6" fill="${comp.pressed ? '#f0e0cc' : '#d4b896'}" stroke="#bba" stroke-width="1"/>
          <!-- pins -->
          <rect x="0"  y="19" width="16" height="4" rx="1" fill="#aaa"/><text x="1" y="14" fill="#ffffff" font-size="7" font-family="monospace">A</text>
          <rect x="64" y="19" width="16" height="4" rx="1" fill="#aaa"/><text x="66" y="14" fill="#ffffff" font-size="7" font-family="monospace">B</text>
          ${comp.pressed ? '<line x1="8" y1="21" x2="72" y2="21" stroke="#4f4" stroke-width="1" stroke-dasharray="3,2"/>' : ''}
        </svg>`;

      container.innerHTML = `
        <div class="comp-state-wrap">${stateBadge}</div>
        <div class="chip-info-desc">Momentary 2-pin push button. A↔B open when released, bridged when pressed.</div>
        <div class="btn-pinout-wrap">${svgBtn}</div>
        <table class="chip-pinout-table">
          <thead><tr><th class="pin-num">Pin</th><th class="pin-name">Name</th><th>State</th></tr></thead>
          <tbody>${pinRows}</tbody>
        </table>
        <div class="chip-help-section">
          <button class="chip-help-btn">How to use</button>
          <div class="chip-help-text">
            <strong>Typical wiring:</strong> Connect pin A to GND and pin B to your input node plus a <strong>pull-up resistor to VCC</strong>. The input reads HIGH when released, LOW when pressed.
          </div>
        </div>`;

      container.querySelector('.chip-help-btn').addEventListener('click', () => {
        const helpText = container.querySelector('.chip-help-text');
        const visible = helpText.classList.toggle('chip-help-text-open');
        container.querySelector('.chip-help-btn').textContent = visible ? 'Hide' : 'How to use';
      });
      return;
    }

    // ── Slide Switch (SPDT) ───────────────────────────────────────────────
    if (comp.type === COMP.SLIDE_SWITCH) {
      title.textContent = 'Slide Switch (SPDT)';
      const sim = this.simulator;
      const nl  = sim.netlist;
      const pinVoltage = (pin) => {
        const net = nl.findNetByHole(pin.holeId);
        if (!net) return undefined;
        return sim.netVoltages.get(net.id);
      };
      const fmtV = (v) => {
        if (v === undefined) return '<span class="pin-v-float">?</span>';
        if (v >= 4.5)        return '<span class="pin-v-hi">H</span>';
        if (v <= 0.5)        return '<span class="pin-v-lo">L</span>';
        return `<span class="pin-v-mid">${v.toFixed(1)}</span>`;
      };

      const stateLabels = ['1–2 connected', 'OPEN (all floating)', '2–3 connected'];
      const stateBadge = `<div class="comp-state-badge comp-state-active">⇄ ${stateLabels[comp.state]}</div>`;

      const pinDefs = [
        { name: '1', label: 'Pin 1' },
        { name: '2', label: 'Pin 2 (common)' },
        { name: '3', label: 'Pin 3' },
      ];
      let pinRows = '';
      for (const pd of pinDefs) {
        const cp = comp.pins.find(p => p.name === pd.name);
        const v  = cp ? pinVoltage(cp) : undefined;
        pinRows += `<tr>
          <td class="pin-num">${pd.name}</td>
          <td class="pin-name pin-passive">${pd.label}</td>
          <td>${fmtV(v)}</td>
        </tr>`;
      }

      // SVG SPDT diagram
      const c0 = comp.state === 0 ? '#4f4' : '#555'; // 1-2 active colour
      const c2 = comp.state === 2 ? '#4f4' : '#555'; // 2-3 active colour
      const svgSpdt = `
        <svg class="spdt-svg" viewBox="0 0 110 60" xmlns="http://www.w3.org/2000/svg">
          <!-- Pin labels -->
          <text x="6"  y="14" fill="#ffffff" font-size="9" font-family="monospace">1</text>
          <text x="6"  y="54" fill="#ffffff" font-size="9" font-family="monospace">3</text>
          <text x="86" y="34" fill="#ffffff" font-size="9" font-family="monospace">2</text>
          <!-- Pin stubs -->
          <line x1="14" y1="10" x2="34" y2="10" stroke="#aaa" stroke-width="2"/>
          <line x1="14" y1="50" x2="34" y2="50" stroke="#aaa" stroke-width="2"/>
          <line x1="76" y1="30" x2="96" y2="30" stroke="#aaa" stroke-width="2"/>
          <!-- Dots at pin ends -->
          <circle cx="34" cy="10" r="3" fill="#aaa"/>
          <circle cx="34" cy="50" r="3" fill="#aaa"/>
          <circle cx="76" cy="30" r="3" fill="#aaa"/>
          <!-- Switch arm to pin 2 (common) -->
          <line x1="76" y1="30" x2="${comp.state === 0 ? '34' : comp.state === 2 ? '34' : '55'}" y2="${comp.state === 0 ? '10' : comp.state === 2 ? '50' : '30'}" stroke="${comp.state === 1 ? '#555' : '#4f4'}" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Connections (dashed when active) -->
          ${comp.state === 0 ? '<line x1="34" y1="10" x2="76" y2="30" stroke="#4f4" stroke-width="1.5" stroke-dasharray="4,2"/>' : ''}
          ${comp.state === 2 ? '<line x1="34" y1="50" x2="76" y2="30" stroke="#4f4" stroke-width="1.5" stroke-dasharray="4,2"/>' : ''}
        </svg>`;

      container.innerHTML = `
        <div class="comp-state-wrap">${stateBadge}</div>
        <div class="chip-info-desc">3-position Single Pole Double Throw (SPDT) slide switch. Click to cycle states.</div>
        <div class="btn-pinout-wrap">${svgSpdt}</div>
        <table class="chip-pinout-table">
          <thead><tr><th class="pin-num">#</th><th class="pin-name">Name</th><th>State</th></tr></thead>
          <tbody>${pinRows}</tbody>
        </table>
        <div class="chip-pinout-legend">
          <span style="color:#888">3 states: 1–2 &nbsp;·&nbsp; OPEN &nbsp;·&nbsp; 2–3 &nbsp;&nbsp;|&nbsp;&nbsp; Click to advance</span>
        </div>
        <div class="chip-help-section">
          <button class="chip-help-btn">Grounding &amp; wiring tips</button>
          <div class="chip-help-text">
            <strong>Pin 2 is the common (wiper).</strong> Pins 1 and 3 are the two switched terminals.<br><br>
            <strong>As a digital input:</strong> Wire pin 2 to VCC. Connect pin 1 (or 3) to your signal node plus a <strong>pull-down resistor (1 kΩ–10 kΩ) to GND</strong>. When the switch selects that pin, the node is pulled HIGH. In the OPEN state the pull-down holds the node LOW.<br><br>
            <strong>Important floating pins:</strong> The unselected terminal (pin 1 or 3) floats in the open and opposite-selected states. A <strong>pull-down resistor to GND on each output pin</strong> prevents undefined logic levels. Without pull-downs, any unconnected pin can drift to an unpredictable voltage.<br><br>
            <strong>Center-off use:</strong> Place the switch in the OPEN state to cut the circuit entirely both pin 1 and pin 3 are then floating.
          </div>
        </div>`;

      container.querySelector('.chip-help-btn').addEventListener('click', () => {
        const helpText = container.querySelector('.chip-help-text');
        const visible = helpText.classList.toggle('chip-help-text-open');
        container.querySelector('.chip-help-btn').textContent = visible ? 'Hide' : 'Grounding & wiring tips';
      });
      return;
    }

    // ── 7-Segment Display ─────────────────────────────────────────────────
    if (comp.type === COMP.SEVEN_SEG) {
      title.textContent = '7-Segment';
      const s = comp.segments;
      const isAnode = !!comp.commonAnode;
      const comTag  = isAnode ? '5V' : 'GND';
      const titleText = `Common ${isAnode ? 'Anode' : 'Cathode'} 7-Segment Display`;

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

      // Standardized neutral pin styling — no state-dependent colors
      const C_PIN_NAME = '#cfcfcf';
      const C_PIN_NUM  = '#777';
      const C_LEG      = '#9a9a9a';
      const C_TITLE    = '#d8d8d8';

      // Horizontal squish factor (graphics only — text counter-scales to stay
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
        return txt(x, y, `text-anchor="middle" fill="${C_PIN_NAME}" font-size="${fs}" font-family="monospace" font-weight="${fw}"`, pd.name);
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
        return txt(x, y, `text-anchor="middle" fill="${C_PIN_NUM}" font-size="9" font-weight="bold" font-family="monospace"`, pd.num);
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

      // Inner digit area — proportions tuned from the canvas renderer
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
             + txt(lx, ly, `text-anchor="middle" font-family="monospace" font-size="${labFs}" font-weight="bold" fill="${labCol(name)}"`, name);
      };
      // Vertical hex segment + centered label
      const hexV = (sx, sy, sh, name) => {
        const pts = `${sx + t / 2},${sy} ${sx + t},${sy + b} ${sx + t},${sy + sh - b} ${sx + t / 2},${sy + sh} ${sx},${sy + sh - b} ${sx},${sy + b}`;
        const lx = sx + t / 2;
        const ly = sy + sh / 2 + parseFloat(labFs) * 0.36;
        return `<polygon points="${pts}" fill="${segCol(name)}"/>`
             + txt(lx, ly, `text-anchor="middle" font-family="monospace" font-size="${labFs}" font-weight="bold" fill="${labCol(name)}"`, name);
      };

      // Decimal point — circle large enough to host its label inside
      const dpR = t * 0.78;
      const dpX = dgX + dgW + gap + dpR;
      const dpY = dgY + dgH - dpR;
      const dpFs = (dpR * 0.95).toFixed(1);
      const dpSvg =
        `<circle cx="${dpX}" cy="${dpY}" r="${dpR}" fill="${segCol('dp')}"/>`
      + txt(dpX, dpY + parseFloat(dpFs) * 0.36, `text-anchor="middle" font-family="monospace" font-size="${dpFs}" font-weight="bold" fill="${labCol('dp')}"`, 'dp');

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
        `text-anchor="middle" fill="${C_TITLE}" font-size="11" font-weight="bold" font-family="monospace"`,
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
<div class="chip-info-desc">7-segment LED display. Each segment is a separate LED sharing one common pin.</div>
<div class="chip-help-section">
  <div class="chip-help-text chip-help-text-open">
    <div class="chip-guide-subtitle">Common anode</div>
    <div class="chip-guide-paragraph">COM → VCC (+5V). A segment turns ON when its pin is pulled LOW. Current path: VCC → COM → LED → resistor → pin → GND.</div>
    <div class="chip-guide-subtitle">Common cathode</div>
    <div class="chip-guide-paragraph">COM → GND (0V). A segment turns ON when its pin is driven HIGH. Current path: VCC → resistor → pin → LED → COM → GND.</div>
    <div class="chip-guide-subtitle">Current limits</div>
    <div class="chip-guide-paragraph">Max per segment: 20 mA, typical 10–15 mA. At 5V with a 2.0V LED forward voltage, use a 220Ω resistor for about 15 mA per segment.</div>
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
      if (sim.floatingNets.has(net.id)) return undefined;
      return sim.netVoltages.get(net.id);
    };

    const fmtV = (v) => {
      if (v === undefined) return '<span class="pin-v-float">?</span>';
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
    const powered = hasVCC && hasGND;

    // Power status badge
    const vccDefPin = def.pinout.find(p => p.pin === def.vcc);
    const gndDefPin = def.pinout.find(p => p.pin === def.gnd);
    const vccName = vccDefPin ? vccDefPin.name : 'VCC';
    const gndName = gndDefPin ? gndDefPin.name : 'GND';

    let powerBadge;
    if (powered) {
      powerBadge = ``;
    } else if (!hasVCC && !hasGND) {
      powerBadge = `<div class="chip-power-badge chip-power-none">Chip Unpowered, connect pin ${def.vcc} to VCC and pin ${def.gnd} to GND</div>`;
    } else if (!hasVCC) {
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
      const ACTIVE_LOW_NAMES = new Set(['CLR', 'MR', 'RST', 'RESET', '1CLR', '2CLR', '1MR', '2MR']);
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
      const typeCol  = t => t === 'input' ? '#8d8' : t === 'output' ? '#e88' : '#fd6';
      const fmtVSvg  = (pin) => {
        const cp = comp.getPinByName(pin.name);
        const v  = cp ? pinVoltage(cp) : undefined;
        if (v === undefined) return { t: '?', c: '#666' };
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
        s += '<text x="' + x + '" y="' + (voltH - 1) + '" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="8" fill="' + c + '">' + t + '</text>';
        s += '<text x="' + x + '" y="' + (voltH + nameH - 1) + '" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="9" font-weight="bold" fill="' + col + '">' + dipName(pin) + '</text>';
        if (isActiveLow(pin)) { const hw = dipName(pin).length * 2.7; s += '<line x1="' + (x - hw).toFixed(1) + '" y1="' + (voltH + nameH - 10) + '" x2="' + (x + hw).toFixed(1) + '" y2="' + (voltH + nameH - 10) + '" stroke="' + col + '" stroke-width="0.9"/>'; }
        // Flat metallic leg (matches canvas style without harsh chrome gradient)
        s += '<rect x="' + (x - legW / 2) + '" y="' + (voltH + nameH + pinGap) + '" width="' + legW + '" height="' + legLen + '" fill="#aaaaaa"/>';
      }

      // Body (flat, matches canvas chip art — almost solid black epoxy)
      s += '<rect x="0" y="' + bodyTopY + '" width="' + svgW + '" height="' + bH + '" rx="2" fill="#111" stroke="#222" stroke-width="0.8"/>';
      // Notch (filled semicircle on left edge)
      s += '<circle cx="0" cy="' + bcy + '" r="6" fill="#555"/>';
      s += '<path d="M 0,' + (bcy - 6).toFixed(1) + ' A 6,6 0 0 1 0,' + (bcy + 6).toFixed(1) + '" fill="none" stroke="#777" stroke-width="0.8"/>';
      // Pin-1 indicator dot
      s += '<circle cx="11" cy="' + bcy + '" r="2.2" fill="#0d0d0d"/>';

      // Top pin numbers inside body
      for (let i = 0; i < half; i++) {
        const pin = def.pinout[def.pins - 1 - i];
        s += '<text x="' + px(i) + '" y="' + (bodyTopY + 13) + '" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="7.5" fill="#666">' + pin.pin + '</text>';
      }

      // Chip name (with family substituted) centered in body — laser-etched warm white like canvas
      s += '<text x="' + (svgW / 2) + '" y="' + (bcy + 4) + '" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="11" font-weight="bold" fill="#d8d4cc" letter-spacing="1.8">' + displayName + '</text>';

      // Bottom pin numbers inside body
      for (let i = 0; i < half; i++) {
        const pin = def.pinout[i];
        s += '<text x="' + px(i) + '" y="' + (bodyBotY - 4) + '" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="7.5" fill="#666">' + pin.pin + '</text>';
      }

      // Bottom pins
      for (let i = 0; i < half; i++) {
        const pin = def.pinout[i];
        const { t, c } = fmtVSvg(pin);
        const x = px(i);
        const col = typeCol(pin.type);
        s += '<rect x="' + (x - legW / 2) + '" y="' + bodyBotY + '" width="' + legW + '" height="' + legLen + '" fill="#aaaaaa"/>';
        s += '<text x="' + x + '" y="' + (bodyBotY + legLen + nameH - 1) + '" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="9" font-weight="bold" fill="' + col + '">' + dipName(pin) + '</text>';
        if (isActiveLow(pin)) { const hw = dipName(pin).length * 2.7; s += '<line x1="' + (x - hw).toFixed(1) + '" y1="' + (bodyBotY + legLen + nameH - 10) + '" x2="' + (x + hw).toFixed(1) + '" y2="' + (bodyBotY + legLen + nameH - 10) + '" stroke="' + col + '" stroke-width="0.9"/>'; }
        s += '<text x="' + x + '" y="' + (bodyBotY + legLen + nameH + voltH - 1) + '" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-size="8" fill="' + c + '">' + t + '</text>';
      }

      s += '</svg></div>';
      s += '<div class="chip-pinout-legend"><span class="legend-input">● Input</span> <span class="legend-output">● Output</span> <span class="legend-power">● Power</span></div>';
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
        const qPattern = /^Q(?:[0-9]+|[A-H])?$/;
        let counterRows = '';
        counterGates.forEach((gate, idx) => {
          const qPins = (gate.outputs || []).filter(n => qPattern.test(n));
          if (qPins.length === 0) return;
          const bits = qPins.map(readBit);
          const anyUnknown = bits.some(b => b === undefined);
          let value = 0;
          for (let i = 0; i < bits.length; i++) if (bits[i] === 1) value |= (1 << i);
          const binStr = bits.map(b => b === undefined ? '?' : b).reverse().join('');
          const label = counterGates.length > 1 ? `Counter ${idx + 1}` : 'Count';
          const valStr = anyUnknown ? '?' : String(value);
          counterRows += `<div class="gate-eval-row">` +
            `<span class="gate-eval-expr">${label}: ` +
            `<span class="gate-eval-out gate-eval-hi">${valStr}</span>` +
            ` <span style="color:#666">(${qPins.length}-bit · b${binStr})</span>` +
            `</span></div>`;
        });
        if (counterRows) {
          html += `<div class="gate-eval-section"><div class="gate-eval-title">Counter</div>${counterRows}</div>`;
        }
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
        helpBtn.textContent = visible ? 'Hide' : 'Chip Guide';
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
    const ACTIVE_LOW_NAMES = new Set(['CLR', 'MR', 'RST', 'RESET', '1CLR', '2CLR', '1MR', '2MR']);
    for (const p of sorted) {
      const al = ACTIVE_LOW_NAMES.has(p.name) || (p.name.length > 1 && p.name.endsWith('n')) || /active[\s-]low/i.test(p.description || '');
      const dn = al && p.name.endsWith('n') ? p.name.slice(0, -1) : p.name;
      const nameCell = al ? `<span style="text-decoration:overline">${dn}</span>` : dn;
      html += `<tr><td class="cg-pin">${p.pin}</td><td class="cg-name">${nameCell}</td><td class="cg-desc">${this._describePinName(p.name, def)}</td></tr>`;
    }
    html += '</tbody></table>';

    // ── Chip Explanation (overview) last in sidebar
    const overview = this._chipOverview(def);
    if (overview) html += `<div class="chip-guide-overview">${overview}</div>`;

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
      html += `<div class="chip-guide-paragraph">${this._escapeHtml(paragraph)}</div>`;
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
        html += `<li>${this._escapeHtml(item)}</li>`;
      }
      html += '</ul>';
    }

    if (section.note) {
      html += `<div class="chip-guide-note">${this._escapeHtml(section.note)}</div>`;
    }

    return html;
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
        return `${multi}Non-inverting buffer. Output follows the input with no logic inversion. Used to boost drive strength when a signal needs to fan out to many loads.`;
      case 'AOI_2WIDE':
      case 'AOI_4WIDE':
        return 'AND-OR-INVERT gate. Each section ANDs a group of inputs, the results are OR-ed together, and the whole thing is inverted all in one stage. Efficient way to implement sum-of-products (SOP) logic without chaining separate gates.';
      case 'DECODER_2TO4':
        return '2-to-4 line decoder. The 2-bit address (A, B) selects exactly one of four active-LOW outputs; the rest stay HIGH. Enable must be asserted. Useful for chip-select generation and small demux tasks.';
      case 'DECODER_3TO8':
        return '3-to-8 line decoder / demultiplexer. The 3-bit address drives exactly one of eight active-LOW outputs LOW while the rest stay HIGH. Three enable pins must all be satisfied. Standard address decoder for memory banking and bus expansion.';
      case 'DECODER_4TO16':
        return '4-to-16 line decoder. The 4-bit address selects one of 16 active-LOW outputs. Enable input lets you cascade two chips to build a 5-to-32 decoder.';
      case 'BCD_DECIMAL':
        return 'BCD-to-decimal decoder. Converts a 4-bit BCD digit (0–9) so that the corresponding decimal output goes LOW while the rest stay HIGH. Inputs 10–15 drive all outputs HIGH (blanked). Designed for driving indicator lamps or relay banks.';
      case 'MUX_8TO1':
        return '8-to-1 multiplexer. A 3-bit select code routes one of eight data inputs to the output. Both true (Y) and complemented (W) outputs are available. Enable input disables both outputs when HIGH.';
      case 'MUX_16TO1':
        return '16-to-1 multiplexer. A 4-bit select code routes one of 16 data inputs to the output. Active-LOW enable; both true and complement outputs available. Useful as a 16-bit look-up table or data selector.';
      case 'D_FF_QUAD':
        return 'Quad D flip-flop. Four independent edge-triggered D flip-flops, each with its own clock, set, and clear. Each captures its D input on the rising clock edge and holds it until the next.';
      case 'D_FF_HEX':
        return 'Hex D flip-flop. Six D flip-flops sharing a common clock and a common active-LOW clear. All six capture their D inputs simultaneously on the rising clock edge.';
      case 'D_FF_OCTAL':
        return 'Octal D flip-flop. Eight D flip-flops on a shared clock. All eight capture their D inputs on the rising edge in lock-step. The classic 8-bit pipeline register and bus latch.';
      case 'D_FF_OCTAL_TRI':
        return 'Octal D flip-flop with tri-state outputs. Like the octal D-FF, but the outputs go high-impedance when OE is deasserted letting you connect multiple chips directly on a shared data bus.';
      case 'D_LATCH_OCTAL_TRI':
        return 'Octal transparent D latch with tri-state outputs. While LE is HIGH, outputs follow their D inputs in real time. When LE goes LOW, the last value is captured and held. OE = HIGH puts all outputs in high-Z so the bus is free for other drivers.';
      case 'ADDRESSABLE_LATCH':
        return '1-of-8 addressable latch (demux with memory). A 3-bit address selects which of the eight output latches receives the D input. In latch mode each selected bit stores independently; in demux mode the addressed output follows D while the rest hold. Handy for expanding a single control line to eight independent outputs.';
      case 'COUNTER_4BIT':
        return '4-bit binary ripple counter. Each flip-flop output clocks the next stage, dividing the input frequency by 2 each time for an overall ÷16. Async clear resets all four bits immediately.';
      case 'COUNTER_DECADE':
        return 'Decade ripple counter. Counts in binary from 0 to 9, then automatically resets to 0 on the next clock a divide-by-10 cascade. Pair QA (÷2) with QD (÷5) for independent divider stages.';
      case 'COUNTER_DIV12':
        return 'Divide-by-12 ripple counter. An internal feedback network resets at 12, giving a 12-state binary sequence. Used in 12-hour clock displays and frequency synthesizer chains.';
      case 'COUNTER_SYNC_BIN':
        return '4-bit synchronous binary counter. All flip-flops clock simultaneously no ripple, no glitches. Counts 0–15, cascadable via ripple-carry output. Two count-enable pins (EP, ET) give you look-ahead carry capability.';
      case 'COUNTER_SYNC_BIN_SC':
        return '4-bit synchronous binary counter with synchronous clear. Identical to the standard sync binary counter except the clear takes effect on the next rising clock edge rather than immediately avoiding timing hazards in high-speed designs.';
      case 'COUNTER_SYNC_DECADE':
        return '4-bit synchronous decade counter. Counts 0–9 with all flip-flops clocking simultaneously. Resets synchronously on the 10th clock. Cascadable for multi-digit BCD counting.';
      case 'COUNTER_UPDOWN':
        return '4-bit synchronous up/down binary counter. Counts up (0→15) or down (15→0) depending on the U/D control pin. Parallel load lets you preset any starting value. Cascadable via MAX/MIN terminal-count output.';
      case 'COUNTER_UPDOWN_DC':
        return '4-bit synchronous up/down decade counter. Same as the up/down binary counter but resets at 9 when counting up (0→9) or at 0 when counting down. Produces a BCD output suitable for driving decoders directly.';
      case 'SHIFT_REG_4BIT':
        return '4-bit universal shift register. Can shift left, shift right, load parallel data, or hold controlled by two mode pins (S0, S1). Cascade the serial output to a second chip to build wider shift registers.';
      case 'SHIFT_REG_SIPO':
        return 'Serial-in, parallel-out shift register. Data enters one bit per clock via the serial input; all bits appear simultaneously on the parallel outputs. Expands a serial data stream into parallel form the building block of SPI receivers and LED drivers.';
      case 'SHIFT_REG_PISO':
        return 'Parallel-in, serial-out shift register. Loads 8 bits of parallel data in one shot, then clocks them out serially one bit at a time. Used to serialize a byte for transmission over a single wire.';
      case 'SHIFT_REG_LATCH':
        return 'Shift register with separated storage latch. Data shifts through an 8-bit register privately; the outputs only update when you fire the storage-register clock (RCLK). Prevents glitchy transitions while the shift is in progress essential for driving LEDs or other visible loads cleanly.';
      case 'REG_4BIT_TRI':
        return '4-bit register with tri-state outputs. Stores 4 bits on the clock edge; the OE pin puts all outputs in high-impedance so the register can sit on a shared bus without driving it.';
      case 'PRIORITY_ENC_8TO3':
        return '8-to-3 priority encoder. Scans eight active-LOW inputs and outputs the 3-bit binary code for the highest-numbered asserted input. If multiple inputs are active at once, the highest wins. Cascade EO → EI to build a 16-to-4 (or wider) encoder.';
      case 'COMPARATOR_4BIT':
        return '4-bit magnitude comparator. Compares two 4-bit binary words A and B and asserts one of three outputs: A>B, A=B, or A<B. Cascade inputs (AGTBIN, AEQBIN, ALTBIN) let you chain chips for 8-bit, 12-bit, or wider comparisons.';
      case 'ADDER_4BIT':
        return '4-bit binary full adder. Adds two 4-bit numbers (A0–A3, B0–B3) plus a carry-in (C0) and produces a 4-bit sum (S0–S3) and carry-out (C4). Wire C4 to C0 of the next chip to build an 8-bit or wider adder.';
      case 'TRANSCEIVER_8BIT':
        return '8-bit bidirectional bus transceiver. Passes data between two 8-bit buses. DIR controls which direction: A→B or B→A. OE disables all drivers and puts both sides in high-Z when not needed. Typical use: isolating a CPU bus from a peripheral bus.';
      case 'RAM_16X4':
        return '16×4-bit static RAM. Sixteen 4-bit locations addressed by A0–A3. Write enable (WE, active-LOW) stores whatever is on the data inputs to the selected address. Output enable (OE, active-LOW) drives the stored value onto the outputs. Use as a 16-entry look-up table or small scratchpad.';
      case 'TIMER_555':
        return 'General-purpose timer / oscillator. The 555 watches analog voltages on TRIG and THRESH, flips an internal latch when they cross its reference levels, and controls both OUTPUT and the DISCHARGE transistor from that latch state.';
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
    if (n === 'CLK' || n === 'CK' || n === 'CP') return 'Clock input, rising-edge triggered';
    if (n === 'UP')   return 'Count-up clock increments on rising edge';
    if (n === 'DOWN') return 'Count-down clock decrements on rising edge';
    if (/^\d+CLK$/.test(n)) { const g = n.match(/^(\d+)/)[1]; return `Clock for flip-flop ${g}, rising-edge triggered`; }
    if (n === 'CLKINH') return 'Clock inhibit HIGH blocks the clock';

    // ── Async clear / preset
    if (n === 'CLR' || n === 'MR') return 'Clear, active-LOW forces all outputs to 0';
    if (n === 'SRCLR')             return 'Shift register clear, active-LOW resets all bits to 0';
    if (n === 'PRE' || n === 'SD') return 'Preset, active-LOW forces Q HIGH';
    if (/^\d+CLR$/.test(n)) { const g = n.match(/^(\d+)/)[1]; return `Clear for flip-flop ${g}, active-LOW`; }
    if (/^\d+PRE$/.test(n)) { const g = n.match(/^(\d+)/)[1]; return `Preset for flip-flop ${g}, active-LOW`; }

    // ── Output / input enables
    if (n === 'OE')  return 'Output enable, active-LOW outputs are high-Z when HIGH';
    if (n === '1OE') return 'Output enable for bus 1, active-LOW';
    if (n === '2OE') return 'Output enable for bus 2, active-LOW';
    if (n === 'OE1') return 'Output enable 1, active-LOW';
    if (n === 'OE2') return 'Output enable 2, active-LOW';
    if (n === 'IE1') return 'Input enable 1, active-LOW HIGH disables data loading';
    if (n === 'IE2') return 'Input enable 2, active-LOW HIGH disables data loading';

    // ── Decoder / gate enable pins
    if (n === 'G1') {
      const hasG2A = def.pinout.some(p => p.name.toUpperCase() === 'G2A');
      return hasG2A ? 'Enable input, active-HIGH chip off when LOW' : 'Enable input, active-LOW';
    }
    if (n === 'G2' || n === 'G2A' || n === 'G2B') return 'Enable input, active-LOW chip off when HIGH';
    if (/^\d+G$/.test(n)) {
      return gateType === 'NOR' ? 'Strobe HIGH forces output LOW' : 'Enable input, active-LOW';
    }
    if (n === 'ME') return 'Memory enable, active-LOW';

    // ── Latch / register controls
    if (n === 'LE')    return 'Latch enable transparent when HIGH, latches on falling edge';
    if (n === 'SRCLK') return 'Shift register clock shifts data on rising edge';
    if (n === 'RCLK')  return 'Storage register clock latches shift data on rising edge';
    if (n === 'WE')    return 'Write enable, active-LOW';
    if (n === 'SH/LD') return 'Shift/load HIGH shifts, LOW loads parallel data';

    // ── Count / direction controls
    if (n === 'CE' || n === 'EP' || n === 'ET' || n === 'CEP' || n === 'CET' || n === 'CTEN') return 'Count enable, active-LOW';
    if (n === 'PE' || n === 'LOAD') return 'Parallel load, active-LOW loads preset data on next clock';
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

    // ── 7-segment display controls
    if (n === 'BI/RBO') return 'Blanking input / ripple blank output, active-LOW';
    if (n === 'RBI')    return 'Ripple blanking input, active-LOW blanks leading zeros';
    if (n === 'LT')     return 'Lamp test, active-LOW lights all segments';

    // ── Serial / shift register
    if (n === 'SER' || n === 'SI') return 'Serial data input';
    if (n === 'QHS')               return 'Serial cascade output connect to SER of next chip';
    if (n === 'QHN')               return 'Inverted serial output (Q̅H)';

    // ── Priority encoder
    if (n === 'EI') return 'Enable input, active-LOW';
    if (n === 'EO') return 'Enable output connect to EI of next encoder to daisy-chain';
    if (n === 'GS') return 'Group signal output HIGH when any input is active';

    // ── Adder carry
    if (n === 'C0') return 'Carry-in tie to GND for standalone use, or to C4 of previous stage';
    if (n === 'C4') return 'Carry-out connect to C0 of next adder stage to cascade';

    // ── Double-indexed pins: 1A1, 2B3, etc. (AOI groups or bus driver banks)
    const doubleMatch = n.match(/^(\d+)([A-Z])(\d+)$/);
    if (doubleMatch) {
      const [, gNum, group, idx] = doubleMatch;
      if (isAOI) return `Gate ${gNum}, AND group ${group}, input ${idx}`;
      return `Bus ${gNum}, channel ${idx} ${group === 'Y' ? 'output' : 'input'}`;
    }

    // ── JK flip-flop inputs: 1J, 2J, 1K, 2K, 3J, 3K
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

    // ── Numbered D inputs: 1D-8D (individual flip-flop data)
    if (/^\d+D$/.test(n)) {
      const num = n.match(/^(\d+)/)[1];
      return `Data input for flip-flop / register ${num}`;
    }

    // ── Numbered Q outputs: 1Q-8Q, 1Qn-4Qn
    const numberedQMatch = n.match(/^(\d+)(QN?)$/);
    if (numberedQMatch) {
      const [, num, qType] = numberedQMatch;
      return qType === 'QN' ? `Inverted Q output (Q̅) for flip-flop ${num}` : `Q output for flip-flop ${num}`;
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

    // ── 7-segment outputs: a-g, dp
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
      if (gateType === 'SHIFT_REG_SIPO') return 'Serial data input (AND-gated with B)';
      if (isShift)   return 'Parallel load data, bit 0';
      if (isCounter) return 'Parallel load data, bit 0';
      if (isDecoder || isBCD) return 'Address/BCD bit 0 (LSB)';
      return 'Input A';
    }
    if (n === 'B') {
      if (gateType === 'SHIFT_REG_SIPO') return 'Serial data input (AND-gated with A)';
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
    this.state.components = this.state.components.filter(comp => {
      if (!comp.placed) return true;
      return !comp.pins.some(p => {
        const h = parseHoleId(p.holeId);
        return h.tileX === tx && h.tileY === ty;
      });
    });
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
    const floatingInput = document.getElementById('floating-input-overlay');
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
    this.state.selectedItems = [];
    if (this.currentInfoComp && compIds.has(this.currentInfoComp.id)) {
      this._closeInfoPanel();
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

    // Single chip paste: enter ghost placement mode so user can drag to a valid spot
    // (avoids silent failure when offset position is blocked by another chip)
    if (this.clipboard.components.length === 1 && this.clipboard.wires.length === 0) {
      const data = this.clipboard.components[0];
      if (data.type === COMP.CHIP) {
        this.interaction.startPlacement(data.type, data.chipId);
        return;
      }
    }

    this.pushUndo();

    // Smart col offset: place next to the currently selected component when possible
    let COL_OFFSET = 5;
    if (this.state.selectedItems.length === 1 && this.state.selectedItems[0].type === 'component') {
      const selComp = this.state.selectedItems[0].ref;
      if (selComp.placed && selComp.pins.length > 0) {
        const rightmostCol = Math.max(...selComp.pins.map(p => parseInt(p.holeId.split(':')[3])));
        const clipData = this.clipboard.components[0];
        if (clipData) {
          let leftmostClipCol;
          if (clipData.startHoleId) {
            leftmostClipCol = Math.min(
              parseInt(clipData.startHoleId.split(':')[3]),
              parseInt(clipData.endHoleId.split(':')[3])
            );
          } else {
            leftmostClipCol = clipData.col || 0;
          }
          const computed = rightmostCol - leftmostClipCol + 2;
          if (computed > 0) COL_OFFSET = computed;
        }
      }
    }

    const offsetHoleId = (id) => {
      const parts = id.split(':');
      const newCol = parseInt(parts[3]) + COL_OFFSET;
      if (newCol >= 63) return null;
      return `${parts[0]}:${parts[1]}:${parts[2]}:${newCol}:${parts[4]}`;
    };
    const newItems = [];
    for (const data of this.clipboard.components) {
      const comp = createComponent(data.type, data.chipId);
      if (!comp) continue;
      if (data.type === COMP.BUTTON && data.vertical) {
        comp.vertical = true;
        comp.colSpan = 2;
      }
      if (data.startHoleId && data.endHoleId && comp.placeWireLike) {
        const s = offsetHoleId(data.startHoleId);
        const e = offsetHoleId(data.endHoleId);
        if (!s || !e) continue;
        comp.placeWireLike(s, e);
      } else if (data.col !== undefined) {
        const newCol = (data.col || 0) + COL_OFFSET;
        if (newCol + (comp.colSpan || 1) > 63) continue;
        comp.place(data.tileX ?? 0, data.tileY ?? 0, newCol, data.row);
      } else {
        continue;
      }
      if (data.resistance !== undefined && comp.setResistance) comp.setResistance(data.resistance);
      if (data.color !== undefined && comp.color !== undefined) comp.color = data.color;
      if (data.on !== undefined) comp.on = data.on;
      if (data.pressed !== undefined) comp.pressed = data.pressed;
      if (data.state !== undefined && data.type === COMP.SLIDE_SWITCH) comp.state = data.state;
      if (this.interaction._checkOverlap(comp)) continue;
      this.state.components.push(comp);
      newItems.push({ type: 'component', ref: comp });
    }
    for (const data of this.clipboard.wires) {
      const s = offsetHoleId(data.startHoleId);
      const e = offsetHoleId(data.endHoleId);
      if (!s || !e) continue;
      if (this.state.wireManager.findEndpointAtHole(s)) continue;
      if (this.state.wireManager.findEndpointAtHole(e)) continue;
      const wire = this.state.wireManager.addWire(s, e);
      wire.color = data.color;
      newItems.push({ type: 'wire', ref: wire });
    }
    this.state.selectedItems = newItems;
    this.onCircuitChanged();
  }

  cutSelected() {
    this.copySelected();
    this.deleteSelected();
  }
  // ── Pure Digital Mode Toggle ───────────────────────────────────────────────
  // Shared handler for both the Settings dropdown and the Analyzer panel
  // items. Flips state.pureDigital, syncs both UI items, persists, re-runs
  // simulation, and refreshes any open side panel.
  _togglePureDigital() {
    this.state.pureDigital = !this.state.pureDigital;
    const itemS = document.getElementById('more-pure-digital');
    const itemA = document.getElementById('la-pure-digital');
    if (itemS) itemS.classList.toggle('active', this.state.pureDigital);
    if (itemA) itemA.classList.toggle('active', this.state.pureDigital);
    const badge = document.getElementById('pure-digital-badge');
    if (badge) badge.style.display = this.state.pureDigital ? '' : 'none';
    saveToLocalStorage(this.state);
    this.simulator.pureDigital = this.state.pureDigital;
    this.simulator.evaluate(this.world, this.state.components, this.state.wireManager);
    if (this.state.showLogicView)    this._showLogicAnalyzer();
    if (this.state.showCircuitInfo)  this._showCircuitInfo();
    this._updateStatusBar();
  }

  // Force Pure Digital off and sync UI/simulator. Used on clear and on
  // opening a different project so the mode doesn't bleed across sessions.
  _resetPureDigital() {
    if (!this.state.pureDigital) return;
    this.state.pureDigital = false;
    const itemS = document.getElementById('more-pure-digital');
    const itemA = document.getElementById('la-pure-digital');
    if (itemS) itemS.classList.remove('active');
    if (itemA) itemA.classList.remove('active');
    const badge = document.getElementById('pure-digital-badge');
    if (badge) badge.style.display = 'none';
    this.simulator.pureDigital = false;
  }

  // ── Circuit Changed Callback ───────────────────────────────────────────────
  onCircuitChanged() {
    if (this._dirty !== undefined) this._dirty = true;
    this._renderDirty = true;
    this.lastInteractionTime = Date.now();
    // Keep the simulator's solver mode in sync with the app flag
    this.simulator.pureDigital = this.state.pureDigital ?? false;
    // Run circuit simulation (voltages, currents, LEDs, 7-segs)
    this.simulator.evaluate(this.world, this.state.components, this.state.wireManager);
    // Start/restart time-stepping loop for capacitor-based circuits
    this.simulator.startTimeLoop(this.world, this.state.components, this.state.wireManager, () => {
      // Callback after each time step refresh display
      // Do NOT call saveToLocalStorage here circuit topology doesn't change
      // during time-stepping and calling JSON.stringify 50×/s is wasteful.
      this._renderDirty = true;
      this._updateStatusBar();
    });
    debouncedSave(this.state, this._currentFilePath || null);
    // Update bottom status bar (overcurrent errors + red outlines)
    this._updateStatusBar();
    // Only refresh the info panel if a chip/7-seg is currently being viewed
    if (this.currentInfoComp) {
      const _c = this.currentInfoComp;
      if (_c.type === COMP.BUTTON || _c.type === COMP.PUSH_BUTTON || _c.type === COMP.SWITCH) {
        this.showInputContextPanel(_c);
      } else if (_c.type === COMP.SLIDE_SWITCH) {
        this.showSlideContextPanel(_c);
      } else {
        this.showChipInfo(_c);
      }
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

    // ── Mode toggle (Pure Digital) ──
    html += `<div class="la-section-title">Mode</div>
      <div class="dropdown-item dropdown-item-toggle${this.state.pureDigital ? ' active' : ''}"
           id="la-pure-digital" style="margin-bottom:8px;">
        <span class="dropdown-item-name">Pure Digital</span>
        <span class="dropdown-item-desc">Ignore analog HIGH/LOW only, no warnings</span>
      </div>`;

    // ── Current State ──
    if (switches.length > 0 || buttons.length > 0 || leds.length > 0) {
      html += '<div class="la-section-title">Current State</div>';
      html += '<ul class="la-state-list">';

      for (const sw of switches) {
        const label = labels.get(sw.id);
        const isOn = sw.type === COMP.SLIDE_SWITCH ? (sw.state !== 1) : sw.on;
        html += `<li class="la-state-item">
          <span class="la-state-label la-state-label-in">${label}</span>
          <span class="la-state-val ${isOn ? 'la-state-on' : 'la-state-off'}">${isOn ? 'ON' : 'OFF'}</span>
        </li>`;
      }

      for (const btn of buttons) {
        const label = labels.get(btn.id);
        html += `<li class="la-state-item">
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

    if (html === '') {
      html = '<div class="empty-state">Place switches/buttons (inputs) and LEDs (outputs) wired through chips to see logic expressions.</div>';
    }

    container.innerHTML = html;

    // Wire up the format dropdown
    const sel = document.getElementById('la-format-select');
    if (sel) {
      sel.addEventListener('change', (ev) => {
        this.state.logicFormat = ev.target.value;
        this._showLogicAnalyzer();
      });
    }

    // Wire up the Pure Digital toggle
    const pdItem = document.getElementById('la-pure-digital');
    if (pdItem) {
      pdItem.addEventListener('click', () => this._togglePureDigital());
    }
  }

  // ── Circuit Info Panel ───────────────────────────────────────────────────

  // Shared label map builder: R1, D1, U1, Button1, Switch1, SEG1...
  _buildLabelMap(comps) {
    const labelMap = new Map();
    const counters = { R: 0, C: 0, D: 0, U: 0, B: 0, S: 0, SW: 0, SEG: 0 };
    for (const comp of comps) {
      switch (comp.type) {
        case COMP.RESISTOR:     labelMap.set(comp.id, `R${++counters.R}`); break;
        case COMP.CAPACITOR:    labelMap.set(comp.id, `C${++counters.C}`); break;
        case COMP.POLARIZED_CAPACITOR: labelMap.set(comp.id, `C${++counters.C}`); break;
        case COMP.DIODE:         labelMap.set(comp.id, `D${++counters.D}`); break;
        case COMP.LED:          labelMap.set(comp.id, `D${++counters.D}`); break;
        case COMP.CHIP:         labelMap.set(comp.id, `U${++counters.U}`); break;
        case COMP.BUTTON:       labelMap.set(comp.id, `Button${++counters.B}`); break;
        case COMP.PUSH_BUTTON:  labelMap.set(comp.id, `Button${++counters.B}`); break;
        case COMP.SWITCH:       labelMap.set(comp.id, `Switch${++counters.S}`); break;
        case COMP.SLIDE_SWITCH: labelMap.set(comp.id, `Switch${++counters.SW}`); break;
        case COMP.SEVEN_SEG:    labelMap.set(comp.id, `SEG${++counters.SEG}`); break;
      }
    }
    return labelMap;
  }

  // Shared warning builder returns [{level, msg, compId}]
  _buildCircuitWarnings(comps, sim, nl, labelMap, fmtI) {
    if (this.state.pureDigital) return [];
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
            msg: `${lbl}: no current limiting resistor — ~${fmtI(perSegEst)}/seg (max 30 mA/seg) — segments will burn out`,
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

    // Gray-zone input warnings (family-dependent thresholds) 
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

    // Floating-input warnings (CMOS families: HC, HCT) 
    // 74LS tolerates floating inputs via internal weak pull-up. 74HC / 74HCT
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
          msg: `${lbl}: floating input on pin${floatPins.length > 1 ? 's' : ''} ${floatPins.join(', ')} ${chipSpec.label} requires an explicit pull-up or pull-down`,
          compId: comp.id });
      }
    }

    // Clock frequency vs family max 
    for (const comp of comps.filter(c => c.type === COMP.CLOCK)) {
      const f = comp.frequencyHz || 0;
      if (f > spec.MAX_FREQ_HZ) {
        const lbl = labelMap.get(comp.id) || 'Clock';
        const fMHz  = (f / 1e6).toFixed(1);
        const maxMHz = (spec.MAX_FREQ_HZ / 1e6).toFixed(0);
        warnings.push({ level: 'warn',
          msg: `${lbl}: ${fMHz} MHz exceeds ${spec.label} max of ${maxMHz} MHz`,
          compId: comp.id });
      }
    }

    // Fan-out: too many chip inputs on one chip output 
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
            msg: `${lbl}: ${loadCount} chip inputs on output ${pin.name} exceeds ${chipSpec.label} fan-out of ${chipSpec.MAX_FANOUT}`,
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

    // 7-segment segment input pins in gray zone
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
    if (!this.state.pureDigital) {
      for (const net of nl.nodes) {
        if (!net.isVCC) continue;
        const v = sim.netVoltages.get(net.id);
        if (v !== undefined && v < psuMinVoltage) psuMinVoltage = v;
        if (v !== undefined && v < 3.5) psuVoltageDrop = true;
      }
    }

    const el = document.getElementById('overcurrent-status');
    if (errors.length === 0 && !(sim.shortCircuits && sim.shortCircuits.length > 0) && !psuVoltageDrop) {
      el.textContent = '';
      return;
    }

    const parts = [];
    if (!this.state.pureDigital && sim.shortCircuits && sim.shortCircuits.length > 0) {
      parts.push(`Short circuit on ${sim.shortCircuits.length} net(s)`);
    }
    if (psuVoltageDrop) {
      parts.push(`Power supply: significant voltage drop (${psuMinVoltage.toFixed(2)}V) — overcurrent`);
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

    // ── 7-Segment Displays ────────────────────────────────────────────────
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
      html += '<div class="ci-section-title">7-Segment Displays</div>';
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
        svgHtml = `
          <div class="btn-pinout-wrap">
            <svg class="btn-pinout-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="60" height="60" rx="6" fill="#1a1a1a" stroke="#555" stroke-width="2"/>
              <circle cx="40" cy="40" r="16" fill="${pressed ? '#555' : '#333'}" stroke="#777" stroke-width="1.5"/>
              <circle cx="40" cy="40" r="10" fill="${pressed ? '#888' : '#444'}" stroke="#999" stroke-width="1"/>
              <rect x="4"  y="20" width="8" height="4" rx="1" fill="#aaa"/><text x="2" y="17" fill="#ffffff" font-size="7" font-family="monospace">TL</text>
              <rect x="68" y="20" width="8" height="4" rx="1" fill="#aaa"/><text x="64" y="17" fill="#ffffff" font-size="7" font-family="monospace">TR</text>
              <rect x="4"  y="56" width="8" height="4" rx="1" fill="#aaa"/><text x="2" y="68" fill="#ffffff" font-size="7" font-family="monospace">BL</text>
              <rect x="68" y="56" width="8" height="4" rx="1" fill="#aaa"/><text x="64" y="68" fill="#ffffff" font-size="7" font-family="monospace">BR</text>
              <line x1="8" y1="22" x2="8" y2="58" stroke="${pressed ? '#4f4' : '#484'}" stroke-width="1" stroke-dasharray="3,2"/>
              <line x1="72" y1="22" x2="72" y2="58" stroke="${pressed ? '#4f4' : '#484'}" stroke-width="1" stroke-dasharray="3,2"/>
              ${pressed ? '<line x1="8" y1="40" x2="72" y2="40" stroke="#4f4" stroke-width="1" stroke-dasharray="3,2"/>' : ''}
            </svg>
          </div>
          <div class="chip-pinout-legend" style="margin-bottom:10px">
            <span style="color:#888">TL/BL always joined &nbsp;·&nbsp; TR/BR always joined &nbsp;·&nbsp; Press bridges both pairs</span>
          </div>`;
      } else if (isPushBtn) {
        const pressed = !!comp.pressed;
        svgHtml = `
          <div class="btn-pinout-wrap">
            <svg class="btn-pinout-svg" viewBox="0 0 80 42" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="6" width="50" height="30" rx="5" fill="#1a1a1a" stroke="#555" stroke-width="2"/>
              <circle cx="40" cy="21" r="10" fill="${pressed ? '#555' : '#333'}" stroke="#777" stroke-width="1.5"/>
              <circle cx="40" cy="21" r="6" fill="${pressed ? '#f0e0cc' : '#d4b896'}" stroke="#bba" stroke-width="1"/>
              <rect x="0"  y="19" width="16" height="4" rx="1" fill="#aaa"/><text x="1" y="14" fill="#ffffff" font-size="7" font-family="monospace">A</text>
              <rect x="64" y="19" width="16" height="4" rx="1" fill="#aaa"/><text x="66" y="14" fill="#ffffff" font-size="7" font-family="monospace">B</text>
              ${pressed ? '<line x1="8" y1="21" x2="72" y2="21" stroke="#4f4" stroke-width="1" stroke-dasharray="3,2"/>' : ''}
            </svg>
          </div>
          <div class="chip-pinout-legend" style="margin-bottom:10px">
            <span style="color:#888">A↔B open when released &nbsp;·&nbsp; Press bridges A and B</span>
          </div>`;
      }

      container.innerHTML = `
        <div class="ctx-panel-controls">
          <div class="ctx-toggle-item${heldOn ? ' active' : ''}" id="ctx-hold-toggle">Hold</div>
          <div class="ctx-toggle-item${bounceOn ? ' active' : ''}" id="ctx-bounce-toggle">Realistic Bouncing</div>
        </div>
        ${svgHtml}
        <div class="ctx-pullres-link">
          <a href="docs.html#floating" target="_blank" rel="noopener">
            About pull-down &amp; pull-up resistors ↗
          </a>
        </div>`;

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
    const panel = document.getElementById('side-panel');
    const container = document.getElementById('analysis-content');
    const title = document.querySelector('#side-panel .panel-title');
    panel.classList.remove('collapsed');
    this.renderer._resize();
    this._renderDirty = true;

    title.textContent = 'Slide Switch (SPDT)';

    const stateLabels = ['1–2 connected', 'OPEN', '2–3 connected'];
    const stateBadge = `<div class="comp-state-badge comp-state-active">⇄ ${stateLabels[comp.state]}</div>`;

    container.innerHTML = `
      <div class="comp-state-wrap">${stateBadge}</div>
      <div class="chip-info-desc" style="margin-bottom:10px">
        This is a <strong>3-position SPDT switch</strong>, not a simple 2-state toggle. It has three states:
        <ul class="ctx-spdt-list">
          <li><strong>1–2:</strong> Pin 2 (common) connected to Pin 1.</li>
          <li><strong>OPEN:</strong> All three pins are disconnected. Both output pins (1 and 3) will float to undefined voltages unless held by pull-down (or pull-up) resistors.</li>
          <li><strong>2–3:</strong> Pin 2 (common) connected to Pin 3.</li>
        </ul>
        The center OPEN position is why this is a <strong>3-state</strong> switch it cannot be represented as a single ON/OFF toggle.
      </div>
      <div class="ctx-pullres-link">
        <a href="docs.html#floating" target="_blank" rel="noopener">
          About pull-down &amp; pull-up resistors ↗
        </a>
      </div>`;
  }

  // ── Rotating Status Message & Bug Report ─────────────────────────────────
  _initRotatingMessage() {
    const chipCount = getAllChipIds().length;
    const messages = [
      { text: 'Found a bug? <u>Report it</u>', action: 'bugreport' },
      { text: 'Feedback?', action: 'feedback' },
      { text: 'Got questions? Ask the community', href: 'https://www.reddit.com/r/74SIM' },
      { text: `${chipCount} chips, infinite possibilities` },
      { text: 'Want to support 74SIM? Share with your friends' },
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
    this._initReportModalsOnce();
    const el = document.getElementById('bug-report-backdrop');
    if (el) el.style.display = 'flex';
  }

  _openFeedback() {
    this._initReportModalsOnce();
    const el = document.getElementById('feedback-backdrop');
    if (el) el.style.display = 'flex';
  }

  // Wire up the bug-report / feedback modals on first open.
  // Submission goes through the Tauri Rust command in desktop mode, and
  // through a same-origin POST to /api/reports in web mode.
  _initReportModalsOnce() {
    if (this._reportModalsReady) return;
    this._reportModalsReady = true;

    const closeOf = (backdropId) => {
      const el = document.getElementById(backdropId);
      if (el) el.style.display = 'none';
    };

    const wire = ({ backdropId, closeId, formId, descId, submitId, statusId, kind, submitLabel }) => {
      const backdrop = document.getElementById(backdropId);
      const closeBtn = document.getElementById(closeId);
      const form     = document.getElementById(formId);
      const submit   = document.getElementById(submitId);
      const status   = document.getElementById(statusId);
      const desc     = document.getElementById(descId);
      if (!form || !submit) return;

      if (closeBtn) closeBtn.addEventListener('click', () => closeOf(backdropId));
      if (backdrop) backdrop.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeOf(backdropId);
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = (desc?.value || '').trim();
        if (!text) return;
        submit.disabled = true;
        if (status) { status.style.color = '#888'; status.textContent = 'Submitting...'; }
        try {
          if (isTauri()) {
            const t = globalThis.__TAURI__;
            await t.core.invoke('submit_report', { reportType: kind, description: text });
          } else {
            const fd = new FormData();
            fd.append('report_type', kind);
            fd.append('description', text);
            // For bug reports, forward any selected screenshots to the server.
            if (kind === 'bug') {
              const filesEl = document.getElementById('bug-images');
              if (filesEl?.files) {
                for (const f of filesEl.files) fd.append('images', f);
              }
            }
            const res = await fetch('/api/reports', { method: 'POST', body: fd });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.detail || `Server error ${res.status}`);
            }
          }
          if (status) { status.style.color = '#60c060'; status.textContent = 'Thanks — submitted!'; }
          if (desc) desc.value = '';
          submit.textContent = 'Submitted';
          setTimeout(() => {
            closeOf(backdropId);
            submit.disabled = false;
            submit.textContent = submitLabel;
            if (status) status.textContent = '';
          }, 1200);
        } catch (err) {
          if (status) { status.style.color = '#e06060'; status.textContent = String(err?.message || err); }
          submit.disabled = false;
        }
      });
    };

    wire({
      backdropId: 'bug-report-backdrop', closeId: 'bug-report-close',
      formId: 'bug-report-form', descId: 'bug-explanation',
      submitId: 'bug-report-submit', statusId: 'bug-report-status',
      kind: 'bug', submitLabel: 'Submit Bug Report',
    });
    wire({
      backdropId: 'feedback-backdrop', closeId: 'feedback-close',
      formId: 'feedback-form', descId: 'feedback-text',
      submitId: 'feedback-submit', statusId: 'feedback-status',
      kind: 'feedback', submitLabel: 'Submit Feedback',
    });
  }

  _closeInfoPanel() {
    this.currentInfoComp = null;
    this.state.showLogicView = false;
    this.state.showCircuitInfo = false;
    this.state.showValues = false;
    this.state.logicLabels = null;
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
    // producing intermediate voltages (~2.5–3 V) on contested nets.
    this.simulator.pinDriveStates.clear();
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
