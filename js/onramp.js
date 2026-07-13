// ── 74Sim Onramp Tutorial ────────────────────────────────────────────────────
// Player controller for the onramp lesson flow.
// Courses (each an array of lessons) live in ./onramp-courses.js; the active
// one is picked by the `?course=` query param, defaulting to the intro course.

import { COMP, MODE } from './constants.js';
import { BreadboardWorld } from './breadboard.js';
import { Renderer } from './renderer.js';
import { Interaction } from './interaction.js';
import { WireManager } from './wire.js';
import { CircuitSimulator } from './simulator.js';
import { deserializeState } from './storage.js';
import { COURSES, resolveCourse, courseQuery } from './onramp-courses.js';
import { drawHintOverlay, drawConnectionsOverlay } from './onramp-hints.js';
import { i18nReady, loadLessons, localizeCourse, t } from './i18n.js';



// ── OnrampApp ────────────────────────────────────────────────────────────────

class OnrampApp {
  constructor() {
    this.canvas = document.getElementById('board-canvas');
    this.world = new BreadboardWorld(2, 2);
    this.renderer = new Renderer(this.canvas, this.world);
    this.interaction = new Interaction(this);
    this.simulator = new CircuitSimulator();

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
      extraTiles: [],
      textBoxes: [],
      logicLabels: null,
      logicFormat: 'programming',
      overcurrentIds: new Set(),
      // Onramp-specific
      lockedComponentIds: new Set(),
      lockedWireIds: new Set(),
    };

    const query = new URLSearchParams(window.location.search);
    this.courseId = resolveCourse(query.get('course'));
    this.course = localizeCourse(COURSES[this.courseId]);
    this.lessons = this.course.lessons;
    document.title = `74Sim — ${this.course.title}`;
    this.currentLessonIdx = 0;
    this.currentStepIdx = 0;
    this._ledLitOnce = false;
    this.undoStack = [];
    this.currentInfoComp = null;

    // DOM refs
    this._titleEl = document.getElementById('onramp-lesson-title');
    this._contentEl = document.getElementById('onramp-step-content');
    this._actionsEl = document.getElementById('onramp-toolbar-actions');
    this._btnBack = document.getElementById('onramp-btn-back');
    this._btnNext = document.getElementById('onramp-btn-next');
    this._progressBar = document.getElementById('onramp-progress-bar');
    this._progressText = document.getElementById('onramp-progress-text');
    this._panel = document.getElementById('onramp-panel');
    this._body = document.getElementById('onramp-body');

    // Nav button handlers
    this._btnBack.addEventListener('click', () => this._goBack());
    this._btnNext.addEventListener('click', () => this._goNext());

    // Per-step board overlays (see _loadStep)
    this._showConnections = false;

    // "Show me" visual hint button — lives in the nav bar so it's always
    // visible without scrolling; only shown on steps that declare a hint.
    this._activeHint = null;
    this._hintBtn = document.createElement('button');
    this._hintBtn.type = 'button';
    this._hintBtn.className = 'onramp-hint-show-btn';
    this._hintBtn.textContent = '💡 Show me';
    this._hintBtn.hidden = true;
    this._hintBtn.addEventListener('click', () => this._setHintActive(!this._activeHint));
    const navEl = document.getElementById('onramp-step-nav');
    navEl.insertBefore(this._hintBtn, navEl.firstChild);

    const lessonParam = new URLSearchParams(window.location.search).get('lesson');
    const lessonIdx = lessonParam !== null ? parseInt(lessonParam, 10) : NaN;
    if (Number.isInteger(lessonIdx) && lessonIdx >= 0 && lessonIdx < this.lessons.length) {
      this._loadLesson(lessonIdx);
    } else {
      this._showLessonSelect();
    }
    this._startRenderLoop();
  }

  // ── Render Loop ──────────────────────────────────────────────────────────
  _startRenderLoop() {
    const loop = () => {
      const m = this.interaction.mode;
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
      this.state.dragPixelOffset = m === MODE.MOVE_COMP ? this.interaction._dragPixelOffset : null;
      this.renderer.draw(this.state);
      if (this._showConnections) drawConnectionsOverlay(this.renderer, this.world, performance.now());
      if (this._activeHint) drawHintOverlay(this.renderer, this, this._activeHint, performance.now());
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ── Circuit Changed ──────────────────────────────────────────────────────
  onCircuitChanged() {
    this.simulator.evaluate(this.world, this.state.components, this.state.wireManager);

    // Keep time-domain parts (capacitors, clocks) alive: without this loop a
    // cap on a lesson board only advances one clamped step per user action.
    // startTimeLoop() is a no-op when the circuit has neither caps nor clocks,
    // and it stops/replaces any previous interval, so calling it every change
    // is safe. The onramp render loop redraws every frame already, so the
    // step callback only needs the lesson bookkeeping.
    this.simulator.startTimeLoop(this.world, this.state.components, this.state.wireManager, () => {
      for (const led of this.state.components) {
        if (led.type === COMP.LED && led.lit) this._ledLitOnce = true;
      }
      this._autoValidate();
    });

    // Track if any LED was lit
    const leds = this.state.components.filter(c => c.type === COMP.LED);
    for (const led of leds) {
      if (led.lit) this._ledLitOnce = true;
    }

    // Auto-validate current step
    this._autoValidate();
  }

  // ── Stub methods that Interaction/Renderer may call ────────────────────
  pushUndo() {
    // Simplified: no full undo in onramp
  }

  undo() {}

  _closeAllDropdowns() {}

  _clearActiveBtn() {
    const btns = this._actionsEl.querySelectorAll('.onramp-toolbar-btn');
    btns.forEach(b => b.classList.remove('active'));
  }

  showChipInfo() {}
  showInputContextPanel() {}
  showSlideContextPanel() {}
  _closeInfoPanel() {}
  _updateStatusBar() {}

  selectAll() {
    // Select all non-locked components and wires
    this.state.selectedItems = [];
    for (const c of this.state.components) {
      if (!this.state.lockedComponentIds.has(c.id)) {
        this.state.selectedItems.push({ type: 'component', ref: c });
      }
    }
    for (const w of this.state.wireManager.wires) {
      if (!this.state.lockedWireIds.has(w.id)) {
        this.state.selectedItems.push({ type: 'wire', ref: w });
      }
    }
  }

  deleteSelected() {
    if (this.state.selectedItems.length === 0) return;
    // Filter out locked items
    const items = this.state.selectedItems.filter(item => {
      if (item.type === 'component') return !this.state.lockedComponentIds.has(item.ref.id);
      if (item.type === 'wire') return !this.state.lockedWireIds.has(item.ref.id);
      return true;
    });
    if (items.length === 0) return;

    const compIds = new Set();
    const wireIds = new Set();
    for (const item of items) {
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
    this.onCircuitChanged();
  }

  deleteBreadboard() {}
  addBreadboard() {}
  addLastUsedChip() {}
  _highlightSelectedInAnalyzer() {}
  copySelected() {}
  cutSelected() {}
  pasteClipboard() {}

  // ── Lesson Select Screen ─────────────────────────────────────────────────
  _showLessonSelect() {
    this._titleEl.textContent = this.course.title;
    this._actionsEl.innerHTML = '';
    this._btnBack.style.display = 'none';
    this._btnNext.style.display = 'none';
    this._activeHint = null;
    this._hintBtn.hidden = true;

    let html = '<div class="onramp-lesson-select"><h2>Choose a Lesson</h2>';
    this.lessons.forEach((lesson, idx) => {
      html += `
        <div class="onramp-lesson-card" data-lesson="${idx}">
          <h3>${lesson.title}</h3>
          <p>${lesson.description}</p>
        </div>`;
    });
    html += '</div>';
    this._contentEl.innerHTML = html;

    // Click handlers
    this._contentEl.querySelectorAll('.onramp-lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.lesson);
        this._loadLesson(idx);
      });
    });

    this._updateProgress(0, 1);
  }

  // ── Load Lesson ──────────────────────────────────────────────────────────
  _loadLesson(idx) {
    this.currentLessonIdx = idx;
    this.currentStepIdx = 0;
    this._ledLitOnce = false;
    this._stepCompleted = new Set();

    this._applyLessonBoard(this.lessons[idx]);

    // Show first step
    this._loadStep(0);
  }

  // Load (or restore) a lesson's working board and its locks. Also used by
  // steps that declare `resetBoard: true` to bring the working board back
  // after per-step demo boards (step.boardState) replaced it.
  _applyLessonBoard(lesson) {
    this._boardIsLessonBoard = true;
    this.state.components = [];
    this.state.wireManager = new WireManager();
    this.state.selectedItems = [];
    this.state.extraTiles = [];

    // Component ids repeat across a lesson's boards (demo boards reuse low
    // ids), so wipe retained drive states before deserializing — same reason
    // as _applyBoardState.
    this.simulator.pinDriveStates.clear();
    this.simulator.chipCouplings.clear();

    deserializeState(lesson.initialState, this.state, this.world);

    // Rebuild world tiles
    this.world.tiles = this.world.tiles.filter(t => this.world.isInitialTile(t.tileX, t.tileY));
    for (const { tx, ty } of (this.state.extraTiles || [])) {
      this.world.addTile(tx, ty);
    }

    // Set locked items
    this.state.lockedComponentIds = new Set(lesson.lockedComponents);
    this.state.lockedWireIds = new Set(lesson.lockedWires);

    // Run initial simulation
    this.onCircuitChanged();
  }

  // ── Per-step Board ───────────────────────────────────────────────────────
  // Load a step's own read-only circuit onto the board (used by quiz steps).
  _applyBoardState(state) {
    this._boardIsLessonBoard = false;
    this.state.components = [];
    this.state.wireManager = new WireManager();
    this.state.selectedItems = [];
    this.state.extraTiles = [];

    // Full topology replacement: wipe retained simulator state. Successive
    // quiz boards reuse low component ids, so stale drive states/couplings
    // from the previous board would stamp voltages onto the new board's nets.
    this.simulator.pinDriveStates.clear();
    this.simulator.chipCouplings.clear();

    deserializeState(state, this.state, this.world);

    this.world.tiles = this.world.tiles.filter(t => this.world.isInitialTile(t.tileX, t.tileY));
    for (const { tx, ty } of (this.state.extraTiles || [])) {
      this.world.addTile(tx, ty);
    }

    // Quiz boards are read-only — lock every component and wire.
    this.state.lockedComponentIds = new Set(this.state.components.map(c => c.id));
    this.state.lockedWireIds = new Set(this.state.wireManager.wires.map(w => w.id));

    this.onCircuitChanged();
  }

  // Pan/zoom the camera so everything on the board is visible. Used by steps
  // that carry a whole CPU module — far bigger than the default viewport.
  _fitBoardToView(margin = 60) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const grow = (holeId) => {
      const p = this.world.getHolePosById(holeId);
      if (!p) return;
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    };
    for (const c of this.state.components) {
      if (typeof c.getOccupiedHoles === 'function') {
        for (const h of c.getOccupiedHoles()) grow(h);
      }
      if (c.startHoleId) grow(c.startHoleId);
      if (c.endHoleId) grow(c.endHoleId);
    }
    for (const w of this.state.wireManager.wires) {
      grow(w.startHoleId);
      grow(w.endHoleId);
    }
    if (!isFinite(minX)) return;
    const r = this.renderer;
    r._resize(); // canvas may have just been re-shown; measure fresh
    const w = (maxX - minX) + margin * 2;
    const h = (maxY - minY) + margin * 2;
    if (w <= 0 || h <= 0 || !r.screenW || !r.screenH) return;
    r.zoom = Math.max(0.15, Math.min(r.screenW / w, r.screenH / h, 1.25));
    r.offsetX = (r.screenW - (minX + maxX) * r.zoom) / 2;
    r.offsetY = (r.screenH - (minY + maxY) * r.zoom) / 2;
  }

  // Toggle the canvas. When hidden, the panel goes full-width (CSS .no-board).
  _setBoardVisible(visible) {
    if (visible) {
      this._body.classList.remove('no-board');
      // Canvas may have been hidden; re-measure now that it's laid out again.
      this.renderer._resize();
    } else {
      this._body.classList.add('no-board');
    }
  }

  // ── Load Step ────────────────────────────────────────────────────────────
  _loadStep(stepIdx) {
    const lesson = this.lessons[this.currentLessonIdx];
    this.currentStepIdx = stepIdx;
    const step = lesson.steps[stepIdx];

    // Update title
    this._titleEl.textContent = lesson.title;

    // Update content
    this._quizAnswered = false;
    this._contentEl.innerHTML = step.content;
    this._contentEl.scrollTop = 0;

    // Board handling: a step may carry its own read-only circuit
    // (step.boardState), ask for the lesson's working board back after demo
    // boards replaced it (step.resetBoard), declare itself board-less
    // (step.fullWidth → full-screen text), or inherit whatever is loaded.
    if (step.boardState) {
      this._applyBoardState(step.boardState);
      this._setBoardVisible(true);
      // Large boards (e.g. the Ben Eater CPU modules) ask to be framed whole.
      if (step.fitBoard) this._fitBoardToView();
    } else if (step.resetBoard) {
      // Restore the working board only if a demo board replaced it — plain
      // back/forward navigation between working-board steps must not wipe
      // the user's wiring-in-progress.
      if (!this._boardIsLessonBoard) this._applyLessonBoard(lesson);
      this._setBoardVisible(true);
    } else if (step.fullWidth) {
      this._setBoardVisible(false);
    } else {
      this._setBoardVisible(true);
    }

    // Board-anatomy x-ray (red internal-connection lines) — per-step opt-in.
    this._showConnections = !!step.showConnections;

    // Let the step wire up any dynamic behaviour (e.g. quiz click handlers)
    if (step.setup) step.setup(this);

    // Update toolbar actions
    this._setupToolbarActions(step.allowedActions);

    // Visual hint: reset any active highlight and only offer the button on
    // steps that declare one.
    this._setHintActive(false);
    this._hintBtn.hidden = !step.hint;

    // Update nav buttons
    this._btnBack.style.display = '';
    this._btnNext.style.display = '';
    this._btnBack.disabled = stepIdx === 0;

    // Steps with a validator gate Next until they're completed. Completion is
    // detected automatically (circuit changes, quiz answers), so there is no
    // separate Check button.
    this._btnNext.disabled = step.validate ? !this._stepCompleted.has(stepIdx) : false;

    // The final step of a lesson returns to the catalog.
    this._btnNext.textContent = (stepIdx === lesson.steps.length - 1) ? 'Finish Lesson' : 'Next';

    // Update progress
    const totalSteps = this._getTotalSteps();
    const completedSteps = this._getCompletedStepsCount();
    this._updateProgress(completedSteps, totalSteps);
  }

  // ── Toolbar Actions ──────────────────────────────────────────────────────
  _setupToolbarActions(allowedActions) {
    this._actionsEl.innerHTML = '';
    this.interaction.cancelMode();

    if (!allowedActions || allowedActions.length === 0) return;

    for (const action of allowedActions) {
      if (action === 'interact') continue; // no toolbar button needed for interaction
      if (action === 'delete') continue;   // delete via keyboard

      const btn = document.createElement('button');
      btn.className = 'onramp-toolbar-btn';
      btn.dataset.action = action; // lets a hint's `toolbar` field find and pulse this button

      if (action.startsWith('chip:')) {
        // The id after 'chip:' must be a real CHIP_DB key (e.g. '74x08') —
        // startPlacement passes it straight to ChipComponent.
        const chipId = action.split(':')[1];
        btn.textContent = `Place ${chipId}`;
        btn.addEventListener('click', () => {
          this._clearActiveBtn();
          btn.classList.add('active');
          this.interaction.startPlacement(COMP.CHIP, chipId);
        });
      } else if (action === 'wire') {
        btn.textContent = 'Wire';
        btn.addEventListener('click', () => {
          this._clearActiveBtn();
          btn.classList.add('active');
          this.interaction.startWireMode();
        });
      } else if (action === 'resistor') {
        btn.textContent = 'Resistor';
        btn.addEventListener('click', () => {
          this._clearActiveBtn();
          btn.classList.add('active');
          this.interaction.startPlacement(COMP.RESISTOR);
        });
      }

      this._actionsEl.appendChild(btn);
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  _goBack() {
    if (this.currentStepIdx > 0) {
      this.interaction.cancelMode();
      this._loadStep(this.currentStepIdx - 1);
    }
  }

  _goNext() {
    const lesson = this.lessons[this.currentLessonIdx];
    if (this.currentStepIdx < lesson.steps.length - 1) {
      this.interaction.cancelMode();
      this._stepCompleted.add(this.currentStepIdx);
      this._loadStep(this.currentStepIdx + 1);
    } else {
      // Finished the last step of this lesson → back to the catalog, where a
      // congrats popup offers the next lesson. Don't auto-jump into it.
      this.interaction.cancelMode();
      window.location.href = '/onramp/lessons?' + courseQuery(this.courseId)
        + 'completed=' + this.currentLessonIdx;
    }
  }

  // ── Visual hints ─────────────────────────────────────────────────────────
  // Turns the current step's `hint` highlight on/off: board overlay (drawn in
  // the render loop via drawHintOverlay) plus a pulse on the toolbar button
  // named by hint.toolbar.
  _setHintActive(on) {
    const lesson = this.lessons[this.currentLessonIdx];
    const step = lesson ? lesson.steps[this.currentStepIdx] : null;
    const hint = step ? step.hint : null;
    this._activeHint = (on && hint) ? hint : null;

    this._hintBtn.textContent = this._activeHint ? 'Hide hint' : '💡 Show me';
    this._hintBtn.classList.toggle('active', !!this._activeHint);

    this._actionsEl.querySelectorAll('.onramp-toolbar-btn.hint-pulse')
      .forEach(b => b.classList.remove('hint-pulse'));
    if (this._activeHint && hint.toolbar) {
      const btn = this._actionsEl.querySelector(
        `.onramp-toolbar-btn[data-action="${hint.toolbar}"]`);
      if (btn) btn.classList.add('hint-pulse');
    }
  }

  _autoValidate() {
    const lesson = this.lessons[this.currentLessonIdx];
    if (!lesson) return;
    const step = lesson.steps[this.currentStepIdx];
    if (!step || !step.validate) return;
    if (this._stepCompleted.has(this.currentStepIdx)) return;

    if (step.validate(this)) {
      this._onStepComplete();
    }
  }

  _onStepComplete() {
    this._stepCompleted.add(this.currentStepIdx);
    this._btnNext.disabled = false;

    // The step is done — retire its highlight so the success state reads clean.
    this._setHintActive(false);

    // Show success feedback
    const feedback = document.createElement('div');
    feedback.className = 'onramp-success';
    feedback.textContent = 'Step complete!';
    this._contentEl.appendChild(feedback);
    this._contentEl.scrollTop = this._contentEl.scrollHeight;

    // Animate panel
    this._panel.classList.add('step-complete');
    setTimeout(() => this._panel.classList.remove('step-complete'), 600);

    // Update progress
    const totalSteps = this._getTotalSteps();
    const completedSteps = this._getCompletedStepsCount();
    this._updateProgress(completedSteps, totalSteps);
  }

  // ── Progress ─────────────────────────────────────────────────────────────
  _getTotalSteps() {
    let total = 0;
    for (const lesson of this.lessons) total += lesson.steps.length;
    return total;
  }

  _getCompletedStepsCount() {
    let count = 0;
    // Count steps from previous lessons
    for (let i = 0; i < this.currentLessonIdx; i++) {
      count += this.lessons[i].steps.length;
    }
    // Add completed steps in current lesson
    count += this._stepCompleted ? this._stepCompleted.size : 0;
    return count;
  }

  _updateProgress(completed, total) {
    const pct = total > 0 ? (completed / total) * 100 : 0;
    this._progressBar.style.width = `${pct}%`;
    this._progressText.textContent = total > 0
      ? t('onramp.stepProgress', { vars: { completed, total }, def: `Step ${completed} of ${total}` })
      : '';
  }
}


// ── Boot ─────────────────────────────────────────────────────────────────────
// Wait for the i18n catalog (lesson prose in the active locale) before booting.
// English is the source of truth, so this resolves instantly when locale === 'en'.
i18nReady.then(loadLessons).then(() => { new OnrampApp(); });
