// ── Interaction State Machine ─────────────────────────────────────────────────
// Handles all user input: placement modes, wire drawing, selection, deletion,
// pan/zoom, and component interaction (buttons, switches, resistor editing).

import { MODE, COMP, SNAP_RADIUS, COLORS, COMP_MAX_DIST, GRID, TESTPOINT_COLORS } from './constants.js';
import { createComponent } from './components.js';
import { holeId as makeHoleId, parseHoleId } from './breadboard.js';
import { serializeState } from './storage.js';

// Clamp the moving end of a 2-terminal component to the component's max lead
// length (in pixels). When the mouse is within range, the lead follows it
// freely; otherwise the lead "maxes out" it still points toward the mouse,
// but stops at maxDistPx from the stationary terminal.
function clampLeadEndpoint(stationaryPos, mouseWorld, maxDistPx) {
  const dx = mouseWorld.x - stationaryPos.x;
  const dy = mouseWorld.y - stationaryPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= maxDistPx || dist === 0) {
    return { endPos: { x: mouseWorld.x, y: mouseWorld.y }, isClamped: false };
  }
  const k = maxDistPx / dist;
  return {
    endPos: {
      x: stationaryPos.x + dx * k,
      y: stationaryPos.y + dy * k,
    },
    isClamped: true,
  };
}

export class Interaction {
  constructor(app) {
    this.app = app;
    this.mode = MODE.IDLE;

    // Placement state
    this.placementType = null;   // COMP type
    this.placementSubtype = null; // e.g. chipId
    this.ghost = null;           // ghost component following cursor

    // Wire state
    this.wireStart = null;       // { id, pos, ... } of the starting hole

    // Component wire-like placement state
    this.compStart = null;       // starting hole for 2 pin component placement

    // Pan state
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this._maybePanning = false; // left-click-drag pan candidate
    this._panMouseStart = null; // screen pos at mousedown

    // Mouse state
    this.mouseScreen = { x: 0, y: 0 };
    this.mouseWorld = { x: 0, y: 0 };

    // Move state (drag-to-move a placed component)
    this._movingComp = null;         // component being moved (primary / anchor)
    this._moveOriginalIdx = -1;      // its original index in state.components
    this._moveUndoSnapshot = null;   // serialized state captured at drag-start
    this._moveColOffset = 0;         // comp anchor col minus clicked-hole col
    this._moveRowOffset = 0;         // pin0 row minus clicked-hole row (wire-like)
    this._movePinDeltaCol = 0;       // pin1.col - pin0.col (wire-like span)
    this._movePinDeltaRow = 0;       // pin1.row - pin0.row (wire-like span)
    this._moveIsWireLike = false;
    this._maybeMoving = false;       // mousedown on component, threshold not yet crossed
    this._maybeMovingGroup = false;  // mousedown landed inside a multi-select bbox on empty space
    this._moveTarget = null;         // component under mousedown
    this._moveStartScreen = null;    // screen coords at mousedown
    this._moveClickHole = null;      // hovered hole at mousedown
    this._pressedButton = null;      // button comp currently held down (momentary)
    this._bounceTimers = [];         // active setTimeout handles for contact bounce simulation
    this._bounceComp = null;         // component currently being bounced
    // Multi-component move: secondary movers when multiple items are selected
    this._movingComps = [];          // [{comp, ghost, originalIdx, colOffset, rowOffset, isWireLike, deltaCols, deltaRows}]
    this.ghosts = [];                // secondary ghost clones (rendered alongside this.ghost)
    // Multi-wire move: selected wires dragged with multi-select group
    this._movingWires = [];          // [{wire, savedStart, savedEnd, startColOff, startRowOff, endColOff, endRowOff}]
    // Partial endpoint moves: selected items where only ONE endpoint fell inside the selection rect
    this._partialEndpointMoves = []; // [{kind, ref, fixedHoleId, savedMovingHoleId, movingPx, movedEnd, ghost, candidateHoleId, oob}]

    // Wire endpoint drag state
    this._maybeMovingWireEp = false;   // mousedown on wire endpoint, threshold not yet crossed
    this._moveWireEp = null;           // { wire, endpoint: 'start'|'end' } being dragged
    this._moveWireStartScreen = null;  // screen coords at mousedown
    this._moveWireUndoSnapshot = null; // serialized state captured at drag-start

    // Component pin endpoint drag state (wire-like 2 pin: resistor, LED, switch, push-button)
    this._maybeMovingCompEp = false;    // mousedown on comp pin, threshold not yet crossed
    this._moveCompEp = null;            // { comp, endpoint: 'start'|'end' } being dragged
    this._moveCompEpStartScreen = null; // screen coords at mousedown
    this._moveCompEpUndoSnapshot = null;

    // Multi-item paste preview state
    this._pasteCompItems = []; // [{ ghost, isWireLike, savedGCol, savedRow, ... }]
    this._pasteWireItems = []; // [{ color, startGCol, startRow, ... }]
    this._pasteWireHoles = []; // [{ startHoleId, endHoleId, color }] computed per-frame for rendering

    // Right-click rubber-band selection state
    this._maybeRightSelect = false;       // right-mousedown, threshold not crossed yet
    this._rightSelectStartScreen = null;  // screen coords at right-mousedown
    this._rightSelectStart = null;        // world coords at right-mousedown
    this._rightSelectEnd = null;          // world coords of current mouse position
    this._isRightSelecting = false;       // actively drawing the selection rect
    this._rightSelectSuppressCtx = false; // suppress next contextmenu after a drag

    this._bindEvents();
  }

  _bindEvents() {
    const canvas = this.app.renderer.canvas;

    // Global mousemove so drags (wire/comp endpoint, pan, move) continue tracking
    // the cursor even when it leaves the canvas boundary during a drag.
    document.addEventListener('mousemove', e => this._onMouseMove(e));
    canvas.addEventListener('mousedown', e => this._onMouseDown(e));
    // Global mouseup catches releases outside the canvas, preventing stuck drag state
    document.addEventListener('mouseup', e => this._onMouseUp(e));
    // Listen on the container (parent of both canvas and textbox-layer) so that
    // wheel events still fire when the mouse is hovering over a text box.
    canvas.parentElement.addEventListener('wheel', e => this._onWheel(e), { passive: false });
    canvas.addEventListener('contextmenu', e => this._onContextMenu(e));
    window.addEventListener('keydown', e => this._onKeyDown(e));
  }

  // ── Start placement mode ──────────────────────────────────────────────────
  startPlacement(compType, subtype) {
    // Wire-like 2 pin components use COMP_START/COMP_END flow
    if (compType === COMP.RESISTOR || compType === COMP.LED ||
        compType === COMP.SWITCH || compType === COMP.PUSH_BUTTON ||
        compType === COMP.CAPACITOR || compType === COMP.POLARIZED_CAPACITOR ||
        compType === COMP.INDUCTOR ||
        compType === COMP.DIODE || compType === COMP.CRYSTAL) {
      this.mode = MODE.COMP_START;
      this.placementType = compType;
      this.placementSubtype = subtype;
      this.ghost = createComponent(compType, subtype);
      this.compStart = null;
      this.wireStart = null;
      this.app.canvas.style.cursor = 'crosshair';
      return;
    }
    this.mode = (compType === COMP.CHIP || compType === COMP.BUTTON) ? MODE.PLACE_CHIP :
                (compType === COMP.SEVEN_SEG) ? MODE.PLACE_OUTPUT :
                (compType === COMP.SLIDE_SWITCH) ? MODE.PLACE_CHIP :
                (compType === COMP.DIP_SWITCH) ? MODE.PLACE_CHIP :
                (compType === COMP.CLOCK) ? MODE.PLACE_CHIP :
                (compType === COMP.TESTPOINT) ? MODE.PLACE_CHIP :
                MODE.PLACE_INPUT;
    this.placementType = compType;
    this.placementSubtype = subtype;
    this.ghost = createComponent(compType, subtype);
    this.wireStart = null;
    this.compStart = null;
    this.app.canvas.style.cursor = 'crosshair';
  }

  startWireMode() {
    this.mode = MODE.WIRE_START;
    this.wireStart = null;
    this.ghost = null;
    this.placementType = null;
    this.placementSubtype = null;
    this.app.canvas.style.cursor = 'crosshair';
  }

  // ── Multi-item paste preview ─────────────────────────────────────────────
  // Builds a ghost cluster (components + wires) from clipboard data. The cluster
  // shifts horizontally with the cursor; commit on left-click, cancel on Escape
  // or right-click. Mirrors single-chip ghost paste so all paste flows behave
  // the same: paste lands where the mouse is.
  startPastePreview(clipboard) {
    if (!clipboard) return false;
    const comps = clipboard.components || [];
    const wires = clipboard.wires || [];
    if (comps.length === 0 && wires.length === 0) return false;

    // Compute anchor as the leftmost reference point in global-col space.
    // Anchor row only used as a hint; vertical translation is locked off
    // (mirrors MOVE_COMP, which also restricts group drag to horizontal).
    let anchorGCol = Infinity, anchorRow = 4;
    const considerHole = (id) => {
      const p = parseHoleId(id);
      const gc = p.tileX * GRID.COLS + p.col;
      if (gc < anchorGCol) { anchorGCol = gc; anchorRow = p.row; }
    };
    for (const d of comps) {
      if (d.startHoleId) { considerHole(d.startHoleId); considerHole(d.endHoleId); }
      else if (d.col !== undefined) {
        const gc = (d.tileX || 0) * GRID.COLS + d.col;
        if (gc < anchorGCol) { anchorGCol = gc; anchorRow = d.row ?? 4; }
      }
    }
    for (const d of wires) {
      considerHole(d.startHoleId);
      considerHole(d.endHoleId);
    }
    if (!isFinite(anchorGCol)) return false;

    this._pasteAnchorGCol = anchorGCol;
    this._pasteAnchorRow = anchorRow;
    this._pasteCompItems = [];
    this._pasteWireItems = [];
    this._pasteWireHoles = [];

    for (const data of comps) {
      const ghost = createComponent(data.type, data.type === COMP.DIP_SWITCH ? data.count : data.chipId);
      if (!ghost) continue;
      // Restore state on the ghost so the preview matches the original.
      if (data.type === COMP.BUTTON && data.vertical) { ghost.vertical = true; ghost.colSpan = 2; }
      if (data.vertical !== undefined) ghost.vertical = data.vertical;
      if (data.colSpan !== undefined) ghost.colSpan = data.colSpan;
      if (data.resistance !== undefined && ghost.setResistance) ghost.setResistance(data.resistance);
      if (data.capacitance !== undefined && ghost.setCapacitance) ghost.setCapacitance(data.capacitance);
      if (data.inductance !== undefined && ghost.setInductance) ghost.setInductance(data.inductance);
      if (data.frequencyHz !== undefined && ghost.frequencyHz !== undefined) ghost.frequencyHz = data.frequencyHz;
      if (data.color !== undefined && ghost.color !== undefined) ghost.color = data.color;
      if (data.on !== undefined) ghost.on = data.on;
      if (data.pressed !== undefined) ghost.pressed = data.pressed;
      if (data.state !== undefined && data.type === COMP.SLIDE_SWITCH) ghost.state = data.state;
      if (Array.isArray(data.states) && data.type === COMP.DIP_SWITCH) ghost.states = [...data.states];

      if (data.startHoleId && data.endHoleId && ghost.placeWireLike) {
        const ps = parseHoleId(data.startHoleId);
        const pe = parseHoleId(data.endHoleId);
        this._pasteCompItems.push({
          ghost,
          isWireLike: true,
          startGCol: ps.tileX * GRID.COLS + ps.col, startRow: ps.row, startTileY: ps.tileY, startType: ps.type,
          endGCol:   pe.tileX * GRID.COLS + pe.col, endRow:   pe.row, endTileY:   pe.tileY, endType:   pe.type,
        });
      } else if (data.col !== undefined) {
        const gc = (data.tileX || 0) * GRID.COLS + data.col;
        this._pasteCompItems.push({
          ghost,
          isWireLike: false,
          savedGCol: gc, savedRow: data.row, savedTileY: data.tileY ?? 0,
          colSpan: ghost.colSpan || 1,
        });
      }
    }

    for (const data of wires) {
      const ps = parseHoleId(data.startHoleId);
      const pe = parseHoleId(data.endHoleId);
      this._pasteWireItems.push({
        color: data.color,
        startGCol: ps.tileX * GRID.COLS + ps.col, startRow: ps.row, startTileY: ps.tileY, startType: ps.type,
        endGCol:   pe.tileX * GRID.COLS + pe.col, endRow:   pe.row, endTileY:   pe.tileY, endType:   pe.type,
      });
    }

    if (this._pasteCompItems.length === 0 && this._pasteWireItems.length === 0) return false;

    this.mode = MODE.PASTE_PREVIEW;
    this.ghost = null;
    this.ghosts = this._pasteCompItems.map(ci => ci.ghost);
    this.app.canvas.style.cursor = 'crosshair';

    // Initial positioning at current hovered hole (or anchor's original location)
    const h = this.app.state.hoveredHole;
    if (h && h.type === 'main') {
      this._updatePastePreview(h);
    } else {
      // Snap to anchor's own location so the cluster is visible immediately.
      const anchorTileX = Math.floor(anchorGCol / GRID.COLS);
      const anchorCol   = anchorGCol - anchorTileX * GRID.COLS;
      this._updatePastePreview({ type: 'main', tileX: anchorTileX, tileY: 0, col: anchorCol, row: anchorRow });
    }
    return true;
  }

  _updatePastePreview(hovered) {
    if (this.mode !== MODE.PASTE_PREVIEW) return;
    if (!hovered || hovered.type !== 'main') return;
    const targetGCol = hovered.tileX * GRID.COLS + hovered.col;
    const delta = targetGCol - this._pasteAnchorGCol;

    for (const ci of this._pasteCompItems) {
      if (ci.isWireLike) {
        const sGC = ci.startGCol + delta;
        const eGC = ci.endGCol + delta;
        const sTileX = Math.floor(sGC / GRID.COLS);
        const sCol   = sGC - sTileX * GRID.COLS;
        const eTileX = Math.floor(eGC / GRID.COLS);
        const eCol   = eGC - eTileX * GRID.COLS;
        if (sCol < 0 || sCol >= GRID.COLS || eCol < 0 || eCol >= GRID.COLS) { ci.ghost.placed = false; continue; }
        const sId = makeHoleId(sTileX, ci.startTileY, ci.startType, sCol, ci.startRow);
        const eId = makeHoleId(eTileX, ci.endTileY,   ci.endType,   eCol, ci.endRow);
        if (!this.app.world.getHolePosById(sId) || !this.app.world.getHolePosById(eId)) { ci.ghost.placed = false; continue; }
        ci.ghost.placeWireLike(sId, eId);
      } else {
        const gc = ci.savedGCol + delta;
        const newTileX = Math.floor(gc / GRID.COLS);
        const newCol   = gc - newTileX * GRID.COLS;
        const span     = ci.colSpan || 1;
        if (newCol < 0 || newCol + span > GRID.COLS) { ci.ghost.placed = false; continue; }
        const probeId = makeHoleId(newTileX, ci.savedTileY, 'main', newCol, ci.savedRow);
        if (!this.app.world.getHolePosById(probeId)) { ci.ghost.placed = false; continue; }
        ci.ghost.place(newTileX, ci.savedTileY, newCol, ci.savedRow);
      }
    }

    this._pasteWireHoles = [];
    for (const wi of this._pasteWireItems) {
      const sGC = wi.startGCol + delta;
      const eGC = wi.endGCol + delta;
      const sTileX = Math.floor(sGC / GRID.COLS);
      const sCol   = sGC - sTileX * GRID.COLS;
      const eTileX = Math.floor(eGC / GRID.COLS);
      const eCol   = eGC - eTileX * GRID.COLS;
      if (sCol < 0 || sCol >= GRID.COLS || eCol < 0 || eCol >= GRID.COLS) continue;
      const sId = makeHoleId(sTileX, wi.startTileY, wi.startType, sCol, wi.startRow);
      const eId = makeHoleId(eTileX, wi.endTileY,   wi.endType,   eCol, wi.endRow);
      if (!this.app.world.getHolePosById(sId) || !this.app.world.getHolePosById(eId)) continue;
      this._pasteWireHoles.push({ startHoleId: sId, endHoleId: eId, color: wi.color });
    }
  }

  _commitPastePreview() {
    if (this.mode !== MODE.PASTE_PREVIEW) return false;

    // All ghost components must be placed and not overlap with existing items
    for (const ci of this._pasteCompItems) {
      if (!ci.ghost.placed) return false;
      if (this._checkOverlap(ci.ghost)) return false;
    }
    // Ghost components must not overlap each other
    const occupied = new Set();
    for (const ci of this._pasteCompItems) {
      for (const h of ci.ghost.getOccupiedHoles()) {
        if (occupied.has(h)) return false;
        occupied.add(h);
      }
    }
    // Wires: endpoints can't clash with ghost component pins, existing wire endpoints, or each other
    for (const wh of this._pasteWireHoles) {
      if (occupied.has(wh.startHoleId) || occupied.has(wh.endHoleId)) return false;
      if (this.app.state.wireManager.findEndpointAtHole(wh.startHoleId)) return false;
      if (this.app.state.wireManager.findEndpointAtHole(wh.endHoleId)) return false;
      occupied.add(wh.startHoleId);
      occupied.add(wh.endHoleId);
    }

    this.app.pushUndo();
    const newItems = [];
    for (const ci of this._pasteCompItems) {
      this.app.state.components.push(ci.ghost);
      newItems.push({ type: 'component', ref: ci.ghost });
      if (ci.ghost.type === COMP.CHIP && ci.ghost.chipId) this.app.addLastUsedChip(ci.ghost.chipId);
    }
    for (const wh of this._pasteWireHoles) {
      const wire = this.app.state.wireManager.addWire(wh.startHoleId, wh.endHoleId);
      if (wh.color) wire.color = wh.color;
      newItems.push({ type: 'wire', ref: wire });
    }
    this.app.state.selectedItems = newItems;

    this._endPastePreview();
    this.app.onCircuitChanged();
    return true;
  }

  _endPastePreview() {
    this.mode = MODE.IDLE;
    this.ghost = null;
    this.ghosts = [];
    this._pasteCompItems = [];
    this._pasteWireItems = [];
    this._pasteWireHoles = [];
    this.app.canvas.style.cursor = 'default';
  }

  cancelMode() {
    // Cancel an in-progress drag-to-move (restores component to origin)
    if (this.mode === MODE.MOVE_COMP) {
      this._cancelMove();
      return;
    }
    // Cancel an in-progress wire endpoint drag
    if (this.mode === MODE.MOVE_WIRE_EP) {
      this._cancelWireEndpointDrag();
      return;
    }
    // Cancel an in-progress component pin endpoint drag
    if (this.mode === MODE.MOVE_COMP_EP) {
      this._cancelCompEndpointDrag();
      return;
    }
    if (this.mode === MODE.PASTE_PREVIEW) {
      this._endPastePreview();
      return;
    }
    this.mode = MODE.IDLE;
    this.ghost = null;
    this.wireStart = null;
    this.compStart = null;
    this.placementType = null;
    this.placementSubtype = null;
    this.app.state.compDragPreview = null;
    this.app.canvas.style.cursor = 'default';
  }

  // Hard-reset all in-progress interaction state. Unlike cancelMode(), does NOT
  // re-insert moving components callers must use this after state.components
  // has been replaced (load, undo), where held refs point at orphans.
  resetAll() {
    this._cancelBounce();
    this._pressedButton = null;
    this.ghost = null;
    this.ghosts = [];
    this.wireStart = null;
    this.compStart = null;
    this.placementType = null;
    this.placementSubtype = null;
    this._movingComp = null;
    this._movingComps = [];
    this._movingWires = [];
    this._moveTarget = null;
    this._moveClickHole = null;
    this._moveStartScreen = null;
    this._moveUndoSnapshot = null;
    this._moveOriginalIdx = -1;
    this._maybeMoving = false;
    this._maybeMovingGroup = false;
    this._moveWireEp = null;
    this._moveWireStartScreen = null;
    this._moveWireUndoSnapshot = null;
    this._maybeMovingWireEp = false;
    this._moveCompEp = null;
    this._moveCompEpStartScreen = null;
    this._moveCompEpUndoSnapshot = null;
    this._maybeMovingCompEp = false;
    this._maybeRightSelect = false;
    this._isRightSelecting = false;
    this._rightSelectStart = null;
    this._rightSelectEnd = null;
    this._maybePanning = false;
    this.isPanning = false;
    this._pasteCompItems = [];
    this._pasteWireItems = [];
    this._pasteWireHoles = [];
    this.mode = MODE.IDLE;
    if (this.app.state) this.app.state.compDragPreview = null;
    if (this.app.canvas) this.app.canvas.style.cursor = 'default';
  }

  // ── Mouse handlers ────────────────────────────────────────────────────────
  _onMouseMove(e) {
    const rect = this.app.canvas.getBoundingClientRect();
    this.mouseScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    this.mouseWorld = this.app.renderer.screenToWorld(this.mouseScreen.x, this.mouseScreen.y);

    // When the listener fires outside the canvas (document-level), skip hover-only
    // work unless an active drag is in progress. This keeps the ghost following
    // the cursor during endpoint drags that cross the canvas boundary while
    // preventing spurious hole-hover updates when the mouse is elsewhere.
    const isOverCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                         e.clientY >= rect.top  && e.clientY <= rect.bottom;
    const isDragging = this.mode !== MODE.IDLE ||
                       this._maybeMoving || this._maybeMovingWireEp ||
                       this._maybeMovingCompEp || this.isPanning || this._maybePanning ||
                       this._isRightSelecting || this._maybeRightSelect;
    if (!isOverCanvas && !isDragging) return;

    // Compute the live drag-preview state for 2-terminal component placement
    // and endpoint dragging. When active, the lead is clamped to its max length
    // and the snap target is the END of the lead, not the raw mouse cursor.
    const dragPreview = this._updateCompDragPreview();

    // Update hovered hole
    // Use a large snap radius when dragging a component so the ghost always snaps
    // to the nearest hole even when the mouse is over the chip body (channel gap
    // between pin rows is 30px, wider than the normal 12px SNAP_RADIUS).
    const _snapR = (this.mode === MODE.MOVE_COMP ||
                    this.mode === MODE.PLACE_CHIP ||
                    this.mode === MODE.PLACE_OUTPUT)
      ? Infinity
      : SNAP_RADIUS / this.app.renderer.zoom;
    // For 2-terminal drag, the snap source is the clamped lead endpoint, so
    // the hover circle (drawn on hoveredHole) sticks to the lead's tip rather
    // than the cursor when it sails past max length.
    const _snapPt = dragPreview ? dragPreview.endPos : this.mouseWorld;
    const _nearestHole = this.app.world.findNearestHole(
      _snapPt.x, _snapPt.y, _snapR
    );
    // In IDLE mode, ignore empty holes entirely (no hover, no interaction)
    if (this.mode === MODE.IDLE && _nearestHole &&
        !this._isHoleOccupiedByComponent(_nearestHole.id) &&
        !this.app.state.wireManager.findEndpointAtHole(_nearestHole.id)) {
      this.app.state.hoveredHole = null;
    } else {
      this.app.state.hoveredHole = _nearestHole;
    }

    // Cursor mirrors the click target exactly (same hit-test the click uses):
    // pointer over any clickable component/wire, grab inside a multi-selection
    // bbox, default over empty board. Gives body hits (chip bodies, lead
    // segments) visible feedback even though they have no hover circle.
    if (this.mode === MODE.IDLE && !isDragging && isOverCanvas) {
      let cursor = 'default';
      if (this._findComponentAtMouse() || this._findWireAtMouse() ||
          this._findPlusButtonClick()) {
        cursor = 'pointer';
      } else {
        const gb = this._computeSelectionBBox();
        if (gb && this._pointInBBox(this.mouseWorld, gb)) cursor = 'grab';
      }
      this.app.canvas.style.cursor = cursor;
    }

    // Right-click rubber-band selection tracking
    if (this._maybeRightSelect || this._isRightSelecting) {
      this._rightSelectEnd = { ...this.mouseWorld };
      if (this._maybeRightSelect) {
        const dx = e.clientX - this._rightSelectStartScreen.x;
        const dy = e.clientY - this._rightSelectStartScreen.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          this._maybeRightSelect = false;
          this._isRightSelecting = true;
          this.app.canvas.style.cursor = 'crosshair';
        }
      }
      if (this._isRightSelecting) {
        const x1 = Math.min(this._rightSelectStart.x, this._rightSelectEnd.x);
        const y1 = Math.min(this._rightSelectStart.y, this._rightSelectEnd.y);
        const x2 = Math.max(this._rightSelectStart.x, this._rightSelectEnd.x);
        const y2 = Math.max(this._rightSelectStart.y, this._rightSelectEnd.y);
        this.app.state.selectRect = { x1, y1, x2, y2 };
      }
      return;
    }

    // Panning (middle-button / Alt+click)
    if (this.isPanning) {
      const dx = e.movementX;
      const dy = e.movementY;
      this.app.renderer.pan(dx, dy);
      return;
    }

    // Left-click-drag pan on empty space
    if (this._maybePanning) {
      const dx = e.clientX - this._panMouseStart.x;
      const dy = e.clientY - this._panMouseStart.y;
      // Start panning once moved more than 3px (avoid accidental drags)
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this.isPanning = true;
        this._maybePanning = false;
        this.app.canvas.style.cursor = 'grabbing';
      }
      return;
    }

    // Ghost follows cursor (snap to grid) for chip/DIP/slide-switch placement modes
    if (this.ghost && this.app.state.hoveredHole &&
        (this.mode === MODE.PLACE_CHIP || this.mode === MODE.PLACE_OUTPUT)) {
      const h = this.app.state.hoveredHole;
      if (h.type === 'main') {
        this._updateGhostPosition(h);
      }
    }

    // Multi-item paste preview: ghost cluster follows cursor
    if (this.mode === MODE.PASTE_PREVIEW && this.app.state.hoveredHole &&
        this.app.state.hoveredHole.type === 'main') {
      this._updatePastePreview(this.app.state.hoveredHole);
    }

    // Drag threshold: if mousedown was on a component, check if we've moved far enough
    if (this._maybeMoving) {
      const dx = e.clientX - this._moveStartScreen.x;
      const dy = e.clientY - this._moveStartScreen.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this._maybeMoving = false;
        this._maybeMovingGroup = false;
        // Release any pressed button before starting a drag
        this._releasePressedButton();
        this._startComponentMove();
      }
    }

    // Drag threshold: if mousedown was on a wire endpoint, check if we've moved far enough
    if (this._maybeMovingWireEp) {
      const dx = e.clientX - this._moveWireStartScreen.x;
      const dy = e.clientY - this._moveWireStartScreen.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this._maybeMovingWireEp = false;
        this._startWireEndpointDrag();
      }
    }

    // Drag threshold: if mousedown was on a wire-like component pin, check distance
    if (this._maybeMovingCompEp) {
      const dx = e.clientX - this._moveCompEpStartScreen.x;
      const dy = e.clientY - this._moveCompEpStartScreen.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this._maybeMovingCompEp = false;
        this._startCompEndpointDrag();
      }
    }

    // During drag, only update the snap-quantized pixel offset. The ghost is
    // NOT re-placed live it stays at its initial logical position, and the
    // renderer applies ctx.translate(offset) so the visual jumps cleanly in
    // HOLE_SPACING-sized steps. Final snap to a real hole happens on release.
    if (this.mode === MODE.MOVE_COMP && this._dragAnchorWorld) {
      const rawDx = this.mouseWorld.x - this._dragAnchorWorld.x;
      const rawDy = this.mouseWorld.y - this._dragAnchorWorld.y;
      this._dragPixelOffset = {
        x: Math.round(rawDx / GRID.HOLE_SPACING) * GRID.HOLE_SPACING,
        y: Math.round(rawDy / GRID.HOLE_SPACING) * GRID.HOLE_SPACING,
      };

      // Single-button moves mirror initial placement (_updateGhostPosition):
      // anchor the ghost directly to the hovered hole with auto-orientation.
      // The pixel-translate model is bypassed so the ghost can never appear
      // at a half-snap or invalid-row position (e.g. pins in the channel).
      if (this.ghost && this.ghost.type === COMP.BUTTON &&
          !this._moveIsWireLike &&
          this._movingComp &&
          this._movingComps.length === 0 &&
          this._movingWires.length === 0 &&
          this._partialEndpointMoves.length === 0) {
        const h = this.app.state.hoveredHole;
        let placed = false;
        if (h && h.type === 'main') {
          if (h.row === 4 || h.row === 5) {
            if (h.col + 2 < GRID.COLS) {
              this.ghost.vertical = true;
              this.ghost.colSpan = 3;
              this.ghost.place(h.tileX, h.tileY, h.col, 4);
              placed = true;
            }
          } else if (h.row !== 3 && h.row + 2 < 10 && h.col + 3 < GRID.COLS) {
            this.ghost.vertical = false;
            this.ghost.colSpan = 4;
            this.ghost.place(h.tileX, h.tileY, h.col, h.row);
            placed = true;
          }
        }
        if (placed) {
          const anchorId = makeHoleId(this.ghost.tileX, this.ghost.tileY,
                                      'main', this.ghost.col, this.ghost.row);
          this._movePrimaryAnchorPx = this.app.world.getHolePosById(anchorId);
          this._movePrimarySavedRow = this.ghost.row;
        }
        this._dragPixelOffset = { x: 0, y: 0 };
      }
    }

    // Wire or comp-end in progress: update mouse world pos for preview line
    if (this.mode === MODE.WIRE_END || this.mode === MODE.COMP_END ||
        this.mode === MODE.MOVE_WIRE_EP || this.mode === MODE.MOVE_COMP_EP) {
      this.app.state.mouseWorld = this.mouseWorld;
    }
  }

  _onMouseDown(e) {
    // Middle button or Alt+left → start pan
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      this.app.canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }

    // Right click: in IDLE mode start rubber-band selection candidate; otherwise handled in contextmenu
    if (e.button === 2) {
      if (this.mode === MODE.IDLE) {
        const rect = this.app.canvas.getBoundingClientRect();
        this._maybeRightSelect = true;
        this._rightSelectStartScreen = { x: e.clientX, y: e.clientY };
        this._rightSelectStart = this.app.renderer.screenToWorld(
          e.clientX - rect.left, e.clientY - rect.top
        );
        this._rightSelectEnd = { ...this._rightSelectStart };
      }
      return;
    }

    // Left click
    if (e.button === 0) {
      // In IDLE mode, intercept component clicks for potential drag-to-move
      if (this.mode === MODE.IDLE) {
        const comp = this._findComponentAtMouse();
        if (comp) {
          // If hovering directly over a pin of a wire-like 2 pin component,
          // allow dragging just that pin instead of moving the whole component
          const hh2 = this.app.state.hoveredHole;
          if (hh2 && comp.startHoleId) {
            let epType = null;
            if (hh2.id === comp.startHoleId) epType = 'start';
            else if (hh2.id === comp.endHoleId) epType = 'end';
            if (epType && !this.app.state.lockedComponentIds?.has(comp.id)) {
              this._maybeMovingCompEp = true;
              this._moveCompEp = { comp, endpoint: epType };
              this._moveCompEpStartScreen = { x: e.clientX, y: e.clientY };
              return;
            }
          }
          // Momentary button: press immediately on mousedown.
          // For 2 pin push buttons, only press when the cursor is over the
          // body square not when clicking the leads.
          if (comp.type === COMP.BUTTON ||
              (comp.type === COMP.PUSH_BUTTON && this._isOverComponentBody(comp))) {
            this._pressedButton = comp;
            if (comp.bounce) {
              this._triggerBounce(comp, true);
            } else {
              comp.pressed = true;
              this.app.onCircuitChanged();
            }
          }
          // Defer to mouseup (click) or mousemove threshold (drag)
          if (this.app.state.lockedComponentIds?.has(comp.id)) {
            // Locked component allow button/switch press but not move
            return;
          }
          this._maybeMoving = true;
          this._moveTarget = comp;
          this._moveClickHole = this.app.state.hoveredHole;
          this._moveStartScreen = { x: e.clientX, y: e.clientY };
          return;
        }
        // Wire endpoint under the hover circle: the visible indicator wins, so
        // dragging moves that endpoint. Exception: if the wire belongs to the
        // current multi-selection, fall through to the group grab below so the
        // whole selection moves together (matching the visible bbox outline).
        const hh = this.app.state.hoveredHole;
        const ep = hh ? this.app.state.wireManager.findEndpointAtHole(hh.id) : null;
        const epLocked = !!(ep && this.app.state.lockedWireIds?.has(ep.wire.id));
        const epInSelection = !!(ep && this.app.state.selectedItems.some(
          i => i.type === 'wire' && i.ref === ep.wire));
        if (ep && !epLocked && !epInSelection) {
          this._maybeMovingWireEp = true;
          this._moveWireEp = { wire: ep.wire, endpoint: ep.endpoint };
          this._moveWireStartScreen = { x: e.clientX, y: e.clientY };
          return;
        }
        // Group drag: clicking inside the multi-selection bounding box on empty
        // space grabs the whole group, matching the visible bbox outline.
        const groupBBox = this._computeSelectionBBox();
        if (groupBBox && this._pointInBBox(this.mouseWorld, groupBBox)) {
          const firstComp = this.app.state.selectedItems.find(
            i => i.type === 'component' && i.ref.placed &&
                 !this.app.state.lockedComponentIds?.has(i.ref.id)
          );
          if (firstComp) {
            this._maybeMoving = true;
            this._maybeMovingGroup = true;
            this._moveTarget = firstComp.ref;
            this._moveClickHole = this.app.state.hoveredHole;
            this._moveStartScreen = { x: e.clientX, y: e.clientY };
            this.app.canvas.style.cursor = 'grab';
            return;
          }
        }
        // Selected wire endpoint that didn't form a draggable group (e.g. the
        // wire is the only selected item): still drag the endpoint.
        if (ep && !epLocked) {
          this._maybeMovingWireEp = true;
          this._moveWireEp = { wire: ep.wire, endpoint: ep.endpoint };
          this._moveWireStartScreen = { x: e.clientX, y: e.clientY };
          return;
        }
        const holeIsEmpty = !hh ||
          (!this._isHoleOccupiedByComponent(hh.id) && !ep);
        if (holeIsEmpty) {
          this._maybePanning = true;
          this._panMouseStart = { x: e.clientX, y: e.clientY };
          this.app.canvas.style.cursor = 'grab';
          return;
        }
      }
      this._onLeftClick(e);
    }
  }

  _onMouseUp(e) {
    // Right-click: commit rubber-band selection if we were dragging, otherwise let contextmenu handle it
    if (e.button === 2) {
      if (this._isRightSelecting) {
        this._commitRectSelection();
        this._rightSelectSuppressCtx = true;
      }
      this._maybeRightSelect = false;
      this._isRightSelecting = false;
      this._rightSelectStart = null;
      this._rightSelectEnd = null;
      this._rightSelectStartScreen = null;
      this.app.state.selectRect = null;
      this.app.canvas.style.cursor = this.mode === MODE.IDLE ? 'default' : 'crosshair';
      return;
    }

    // Deferred component click: mousedown was on a comp but no drag occurred → treat as click
    if (this._maybeMoving && e.button === 0) {
      const wasGroup = this._maybeMovingGroup;
      this._maybeMoving = false;
      this._maybeMovingGroup = false;
      this._moveTarget = null;
      this._moveClickHole = null;
      this._moveStartScreen = null;
      // Group-bbox tap with no drag: preserve selection, just reset the cursor.
      if (wasGroup) {
        if (this.mode === MODE.IDLE) this.app.canvas.style.cursor = 'default';
        return;
      }
      this._handleIdleClick(e);
      // Release any momentary button after the click is processed
      this._releasePressedButton();
      return;
    }

    // Deferred wire-endpoint click: mousedown on endpoint but no drag → treat as click (select)
    if (this._maybeMovingWireEp && e.button === 0) {
      this._maybeMovingWireEp = false;
      this._moveWireEp = null;
      this._moveWireStartScreen = null;
      this._handleIdleClick(e);
      return;
    }

    // Deferred comp-pin click: mousedown on pin but no drag → treat as click (select/interact)
    if (this._maybeMovingCompEp && e.button === 0) {
      this._maybeMovingCompEp = false;
      this._moveCompEp = null;
      this._moveCompEpStartScreen = null;
      this._handleIdleClick(e);
      return;
    }

    // Commit or cancel an in-progress component move
    if (this.mode === MODE.MOVE_COMP && e.button === 0) {
      this._releasePressedButton();
      this._commitOrCancelMove();
      return;
    }

    // Commit or cancel an in-progress wire endpoint drag
    if (this.mode === MODE.MOVE_WIRE_EP && e.button === 0) {
      this._commitOrCancelWireEndpointDrag();
      return;
    }

    // Commit or cancel an in-progress component pin endpoint drag
    if (this.mode === MODE.MOVE_COMP_EP && e.button === 0) {
      this._commitOrCancelCompEndpointDrag();
      return;
    }

    if (this._maybePanning && e.button === 0) {
      // Was a click on empty space that didn't move enough to pan
      // Route through idle click so "+" buttons and tile-edge clicks fire
      this._maybePanning = false;
      this.app.canvas.style.cursor = this.mode === MODE.IDLE ? 'default' : 'crosshair';
      this._handleIdleClick(e);
      return;
    }
    if (e.button === 1 || (this.isPanning && e.button === 0)) {
      this.isPanning = false;
      this._maybePanning = false;
      this.app.canvas.style.cursor = this.mode === MODE.IDLE ? 'default' : 'crosshair';
    }
  }

  // Cancel any in-progress bounce simulation
  _cancelBounce() {
    for (const t of this._bounceTimers) clearTimeout(t);
    this._bounceTimers = [];
    this._bounceComp = null;
  }

  // Simulate realistic breadboard button bounce. Schedules rapid pressed-state
  // toggles before settling at finalState, matching typical tactile button behavior
  // (3 6 bounces over ~15 ms as documented in switch-bounce literature).
  _triggerBounce(comp, finalState) {
    this._cancelBounce();
    this._bounceComp = comp;
    // Timestamps (ms) at which state alternates, starting at finalState.
    // Diminishing gaps model real contact bounce settling.
    const sequence = [0, 3, 7, 11, 15];
    sequence.forEach((delay, i) => {
      const state = (i % 2 === 0) ? finalState : !finalState;
      const t = setTimeout(() => {
        if (comp !== this._bounceComp) return;
        comp.pressed = state;
        this.app.onCircuitChanged();
        if (i === sequence.length - 1) this._bounceComp = null;
      }, delay);
      this._bounceTimers.push(t);
    });
  }

  // Release momentary button on mouseup (handles mouse-off-canvas release too)
  _releasePressedButton() {
    if (this._pressedButton) {
      // If the button/push-button is held (latched via right-click panel), keep it pressed
      if (this._pressedButton.held) return;
      const comp = this._pressedButton;
      this._pressedButton = null;
      if (comp.bounce) {
        this._triggerBounce(comp, false);
      } else {
        comp.pressed = false;
        this.app.onCircuitChanged();
      }
    }
  }

  _onWheel(e) {
    e.preventDefault();
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20;
    else if (e.deltaMode === 2) delta *= 400;
    const factor = Math.pow(0.999, delta * 1.35);
    const rect = this.app.canvas.getBoundingClientRect();
    this.app.renderer.zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
  }

  _onContextMenu(e) {
    e.preventDefault();

    // Suppress context menu after a right-click rubber-band drag
    if (this._rightSelectSuppressCtx) {
      this._rightSelectSuppressCtx = false;
      return;
    }

    // If in any placement or wire mode, cancel it
    if (this.mode !== MODE.IDLE) {
      this.cancelMode();
      this.app.state.selectedComponent = null;
      this.app._clearActiveBtn();
      return;
    }

    // Right-click on a component: open appropriate side panel
    const comp = this._findComponentAtMouse();
    if (comp) {
      this.app.state.selectedItems = [{ type: 'component', ref: comp }];
      if (comp.type === COMP.CHIP || comp.type === COMP.SEVEN_SEG) {
        this.app.showChipInfo(comp);
      } else if (comp.type === COMP.BUTTON || comp.type === COMP.PUSH_BUTTON || comp.type === COMP.SWITCH) {
        this.app.showInputContextPanel(comp);
      } else if (comp.type === COMP.SLIDE_SWITCH) {
        this.app.showSlideContextPanel(comp);
      } else if (comp.type === COMP.DIP_SWITCH) {
        this.app.showDipSwitchContextPanel(comp);
      } else if (comp.type === COMP.CLOCK) {
        this.app.showClockContextPanel(comp);
      } else if (comp.type === COMP.CRYSTAL) {
        this.app.showCrystalContextPanel(comp);
      } else if (comp.type === COMP.LED) {
        this.app.showProbePanel({ kind: 'led', comp });
      } else if (comp.type === COMP.RESISTOR) {
        this.app.showProbePanel({ kind: 'resistor', comp });
      } else if (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) {
        this.app.showProbePanel({ kind: 'capacitor', comp });
      } else if (comp.type === COMP.INDUCTOR) {
        this.app.showProbePanel({ kind: 'inductor', comp });
      }
      return;
    }

    // Right-click on a wire (jumper): show its voltage & current
    const wire = this._findWireAtMouse();
    if (wire) {
      this.app.state.selectedItems = [{ type: 'wire', ref: wire }];
      this.app.showProbePanel({ kind: 'wire', wire });
      return;
    }

  }

  _onKeyDown(e) {
    // If the user has text selected or is focused in a text input, let the
    // browser handle clipboard/selection shortcuts natively so they can copy
    // text from the sidebar or any other text element.
    const activeEl = document.activeElement;
    const isTextFocused = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable
    );
    const hasTextSelection = window.getSelection && window.getSelection().toString() !== '';

    if (e.key === 'Escape') {
      this.cancelMode();
      this.app.state.selectedItems = [];
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!isTextFocused && this.app.state.selectedItems.length > 0) {
        const boardItem = this.app.state.selectedItems.find(i => i.type === 'breadboard');
        if (boardItem) {
          this.app.deleteBreadboard(boardItem.tileX, boardItem.tileY);
          this.app.state.selectedItems = [];
        } else {
          this.app.deleteSelected();
        }
      }
    }
    if (isTextFocused || hasTextSelection) return;
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      this.app.undo();
    }
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.app.selectAll();
      this.app._renderDirty = true;
    }
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      if (this.app.state.selectedItems.length > 0) {
        e.preventDefault();
        this.app.copySelected();
      }
    }
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      if (this.app.clipboard) {
        e.preventDefault();
        this.app.pasteClipboard();
      }
    }
    if (e.key === 'x' && (e.ctrlKey || e.metaKey)) {
      if (this.app.state.selectedItems.length > 0) {
        e.preventDefault();
        this.app.cutSelected();
      }
    }
  }

  // ── Left click dispatch ───────────────────────────────────────────────────
  _onLeftClick(e) {
    const hole = this.app.state.hoveredHole;

    switch (this.mode) {
      case MODE.IDLE:
        this._handleIdleClick(e);
        break;

      case MODE.PLACE_CHIP:
      case MODE.PLACE_OUTPUT: {
        // Use the hovered hole if available, otherwise fall back to the ghost's
        // last snapped position so clicking anywhere on the canvas still places
        // the chip as long as the ghost is showing at a valid location.
        const placeHole = (hole && hole.type === 'main') ? hole
          : (this.ghost && this.ghost.placed)
            ? { type: 'main', tileX: this.ghost.tileX, tileY: this.ghost.tileY,
                col: this.ghost.col, row: this.ghost.row }
            : null;
        if (placeHole) {
          this._placeComponent(placeHole);
        }
        break;
      }

      case MODE.PASTE_PREVIEW: {
        // Commit if valid; if blocked (overlap/out-of-bounds), flash red border
        // briefly so user knows the click was registered but not actionable.
        const ok = this._commitPastePreview();
        if (!ok) {
          this.app.canvas.style.outline = '3px solid #ff4444';
          setTimeout(() => { this.app.canvas.style.outline = ''; }, 400);
        }
        break;
      }

      case MODE.COMP_START:
        if (hole) {
          // Block if hole is occupied by a component or wire endpoint
          if (this._isHoleOccupiedByComponent(hole.id)) break;
          if (this.app.state.wireManager.findEndpointAtHole(hole.id)) break;
          this.compStart = hole;
          this.mode = MODE.COMP_END;
          // Seed preview so the body follows the cursor immediately, before
          // the next mousemove fires.
          this._updateCompDragPreview();
        }
        break;

      case MODE.COMP_END:
        if (hole && this.compStart && hole.id !== this.compStart.id) {
          // Block if hole is occupied
          if (this._isHoleOccupiedByComponent(hole.id)) break;
          if (this.app.state.wireManager.findEndpointAtHole(hole.id)) break;
          // Distance check is now defense-in-depth: hoveredHole is computed
          // from the clamped lead endpoint, so it can't be beyond max range
          // unless a snap pulled it slightly past. Keep the guard anyway.
          const maxDist = COMP_MAX_DIST[this.placementType] || 10;
          const dx = hole.pos.x - this.compStart.pos.x;
          const dy = hole.pos.y - this.compStart.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy) / GRID.HOLE_SPACING;
          if (dist > maxDist) break;
          // Place the wire-like component
          this.ghost.placeWireLike(this.compStart.id, hole.id);
          // Check overlap
          if (this._checkOverlap(this.ghost)) {
            this.ghost = createComponent(this.placementType, this.placementSubtype);
            break;
          }
          this.app.pushUndo();
          this.app.state.components.push(this.ghost);
          // Reset for next placement
          this.ghost = createComponent(this.placementType, this.placementSubtype);
          this.compStart = null;
          this.app.state.wireStart = null;
          this.app.state.mouseWorld = null;
          this.app.state.compDragPreview = null;
          this.mode = MODE.COMP_START;
          this.app.onCircuitChanged();
        }
        break;

      case MODE.WIRE_START:
        if (hole) {
          // Block if hole is occupied by a component or wire endpoint
          if (this._isHoleOccupiedByComponent(hole.id)) break;
          if (this.app.state.wireManager.findEndpointAtHole(hole.id)) break;
          this.wireStart = hole;
          this.app.state.wireStart = hole;
          this.mode = MODE.WIRE_END;
        }
        break;

      case MODE.WIRE_END:
        if (hole && hole.id !== this.wireStart.id) {
          // Block if hole is occupied by a component or wire endpoint
          if (this._isHoleOccupiedByComponent(hole.id)) break;
          if (this.app.state.wireManager.findEndpointAtHole(hole.id)) break;
          // Block if this wire would create a VCC-GND short
          if (this.app.simulator.netlist.wouldShort(this.wireStart.id, hole.id, this.app.world)) {
            // Flash the canvas border red briefly to indicate blocked short
            this.app.canvas.style.outline = '3px solid #ff4444';
            setTimeout(() => { this.app.canvas.style.outline = ''; }, 400);
            break;
          }
          // Place wire auto-merge nodes if endpoints share a breadboard strip
          this.app.pushUndo();
          this.app.state.wireManager.addWireSmart(
            this.wireStart.id, hole.id, this.app.world,
            this.app.state.showRealisticBoard
          );
          // Reset to wire start for continuous wiring
          this.wireStart = null;
          this.app.state.wireStart = null;
          this.app.state.mouseWorld = null;
          this.mode = MODE.WIRE_START;
          this.app.onCircuitChanged();
        }
        break;
    }
  }

  _handleIdleClick(e) {
    // Check "+" button to add a new breadboard to the right
    const plusTarget = this._findPlusButtonClick();
    if (plusTarget) {
      this.app.addBreadboard(plusTarget.tx, plusTarget.ty);
      return;
    }

    // Check if clicked on a component
    const comp = this._findComponentAtMouse();
    if (comp) {
      const multiSelect = e.ctrlKey || e.metaKey;
      if (multiSelect) {
        // Toggle this component in/out of selection without touching interactive state
        const existing = this.app.state.selectedItems;
        const idx = existing.findIndex(i => i.type === 'component' && i.ref === comp);
        if (idx >= 0) {
          this.app.state.selectedItems = existing.filter((_, i) => i !== idx);
        } else {
          this.app.state.selectedItems = [...existing, { type: 'component', ref: comp }];
        }
        this.app._highlightSelectedInAnalyzer();
        return;
      }
      // Select the component (regular click replace selection)
      this.app.state.selectedItems = [{ type: 'component', ref: comp }];
      // Handle interactive components
      if (comp.type === COMP.BUTTON || comp.type === COMP.PUSH_BUTTON) {
        // Momentary button: press/release handled by mousedown/mouseup.
      } else if (comp.type === COMP.SWITCH) {
        // Only toggle when the click landed on the switch body, not its leads
        if (comp.held || !this._isOverComponentBody(comp)) { /* do nothing */ } else {
          this.app.pushUndo();
          comp.on = !comp.on;
          this.app.onCircuitChanged();
        }
      } else if (comp.type === COMP.SLIDE_SWITCH) {
        this.app.pushUndo();
        comp.state = e.shiftKey ? 1 : (comp.state === 2 ? 0 : 2);
        this.app.onCircuitChanged();
      } else if (comp.type === COMP.DIP_SWITCH) {
        // Find which individual switch the click landed on (closest column)
        let closestIdx = 0;
        let closestDist = Infinity;
        for (let i = 0; i < comp.count; i++) {
          const pinPos = this.app.world.getHolePosById(comp.pins[i].holeId);
          if (pinPos) {
            const d = Math.abs(this.mouseWorld.x - pinPos.x);
            if (d < closestDist) { closestDist = d; closestIdx = i; }
          }
        }
        this.app.pushUndo();
        comp.states[closestIdx] = !comp.states[closestIdx];
        this.app.onCircuitChanged();
      } else if (comp.type === COMP.CLOCK) {
        this._editClockFrequency(comp, e);
      } else if (comp.type === COMP.CRYSTAL) {
        this._editCrystalFrequency(comp, e);
      } else if (comp.type === COMP.TESTPOINT) {
        this._editTestPointLabel(comp, e);
      } else if (comp.type === COMP.RESISTOR) {
        this._editResistance(comp, e);
      } else if (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) {
        this._editCapacitance(comp, e);
      } else if (comp.type === COMP.INDUCTOR) {
        this._editInductance(comp, e);
      } else if (comp.type === COMP.CHIP && comp.chipDef) {
        this.app.showChipInfo(comp);
      } else if (comp.type === COMP.SEVEN_SEG) {
        this.app.showChipInfo(comp);
      }
      this.app._highlightSelectedInAnalyzer();
      return;
    }

    // Check if clicked on a wire endpoint
    const wire = this._findWireAtMouse();
    if (wire) {
      const multiSelect = e.ctrlKey || e.metaKey;
      if (multiSelect) {
        const existing = this.app.state.selectedItems;
        const idx = existing.findIndex(i => i.type === 'wire' && i.ref === wire);
        if (idx >= 0) {
          this.app.state.selectedItems = existing.filter((_, i) => i !== idx);
        } else {
          this.app.state.selectedItems = [...existing, { type: 'wire', ref: wire }];
        }
        this.app._highlightSelectedInAnalyzer();
        return;
      }
      this.app.state.selectedItems = [{ type: 'wire', ref: wire }];
      this.app._highlightSelectedInAnalyzer();
      return;
    }

    // With modifier held and clicking empty space keep multi-selection intact
    if (e.ctrlKey || e.metaKey) return;

    // Check if clicked on the edge of an extra (non-initial) tile select it
    if (!this.app.state.hoveredHole) {
      const extraTile = this._findExtraTileAtMouse();
      if (extraTile) {
        this.app.state.selectedItems = [{ type: 'breadboard', tileX: extraTile.tileX, tileY: extraTile.tileY }];
        return;
      }
    }

    // Deselect close the info panel
    this.app.state.selectedItems = [];
    this.app._closeInfoPanel();
  }

  // ── Component placement (chips & 7-seg only) ──────────────────────────────
  _placeComponent(hole) {
    if (!this.ghost) return;

    // For chips and 7-seg, anchor at the hole to straddle the channel
    if (this.ghost.type === COMP.CHIP || this.ghost.type === COMP.SEVEN_SEG) {
      // Check if the chip fits on the board
      const colSpan = this.ghost.colSpan || 5; // 7-seg defaults to 5 cols
      if (hole.col + colSpan > 63) return; // doesn't fit

      this.ghost.place(hole.tileX, hole.tileY, hole.col, 4);
    } else if (this.ghost.type === COMP.BUTTON) {
      if (hole.type !== 'main') return;
      if (hole.row === 4 || hole.row === 5) {
        // Straddle channel: vertical orientation, 3 wide × 2 pins (E and F)
        this.ghost.vertical = true;
        this.ghost.colSpan = 3;
        if (hole.col + 2 >= GRID.COLS) return; // needs 3 column slots
        this.ghost.place(hole.tileX, hole.tileY, hole.col, 4);
      } else {
        // Normal: horizontal orientation (3 wide × 2 tall)
        this.ghost.vertical = false;
        this.ghost.colSpan = 4;
        if (hole.col + 3 >= GRID.COLS) return; // needs 4 column slots
        if (hole.row + 2 >= 10 || hole.row === 3) return; // needs 3 rows; row 3 would cross channel
        this.ghost.place(hole.tileX, hole.tileY, hole.col, hole.row);
      }
    } else if (this.ghost.type === COMP.SLIDE_SWITCH) {
      if (hole.type !== 'main') return;
      if (hole.col + 2 >= GRID.COLS) return; // needs 3 holes
      this.ghost.place(hole.tileX, hole.tileY, hole.col, hole.row);
    } else if (this.ghost.type === COMP.DIP_SWITCH) {
      if (hole.col + this.ghost.count > GRID.COLS) return;
      this.ghost.place(hole.tileX, hole.tileY, hole.col, 4);
    } else if (this.ghost.type === COMP.CLOCK) {
      if (hole.type !== 'main') return;
      this.ghost.place(hole.tileX, hole.tileY, hole.col, hole.row);
    } else if (this.ghost.type === COMP.TESTPOINT) {
      if (hole.type !== 'main') return;
      this.ghost.place(hole.tileX, hole.tileY, hole.col, hole.row);
    } else {
      return; // Other 2 pin components use wire-like placement now
    }

    // Check for overlap
    if (this._checkOverlap(this.ghost)) {
      return; // can't place here
    }

    // Add to state
    this.app.pushUndo();
    this.app.state.components.push(this.ghost);

    // Track last used for chips
    if (this.ghost.type === COMP.CHIP && this.ghost.chipId) {
      this.app.addLastUsedChip(this.ghost.chipId);
    }

    // Auto-label test points TP1, TP2, … (first free number, so deleting TP1
    // and placing again reuses it) and cycle a lane color.
    if (this.ghost.type === COMP.TESTPOINT && !this.ghost.label) {
      const used = new Set(this.app.state.components
        .filter(c => c.type === COMP.TESTPOINT && c.label)
        .map(c => c.label));
      let n = 1;
      while (used.has('TP' + n)) n++;
      this.ghost.label = 'TP' + n;
      this.ghost.color = TESTPOINT_COLORS[(n - 1) % TESTPOINT_COLORS.length];
    }

    // Create new ghost for continued placement
    this.ghost = createComponent(this.placementType, this.placementSubtype);
    this.app.onCircuitChanged();
  }

  _updateGhostPosition(hole) {
    if (!this.ghost) return;
    if (this.ghost.type === COMP.CHIP) {
      this.ghost.place(hole.tileX, hole.tileY, hole.col, 4);
    } else if (this.ghost.type === COMP.BUTTON) {
      if (hole.type === 'main') {
        if (hole.row === 4 || hole.row === 5) {
          this.ghost.vertical = true;
          this.ghost.colSpan = 3;
          this.ghost.place(hole.tileX, hole.tileY, hole.col, 4);
        } else {
          if (hole.row === 3) return; // would cross channel
          this.ghost.vertical = false;
          this.ghost.colSpan = 4;
          this.ghost.place(hole.tileX, hole.tileY, hole.col, hole.row);
        }
      }
    } else if (this.ghost.type === COMP.SLIDE_SWITCH) {
      if (hole.type === 'main') {
        this.ghost.place(hole.tileX, hole.tileY, hole.col, hole.row);
      }
    } else if (this.ghost.type === COMP.DIP_SWITCH) {
      if (hole.type === 'main') {
        this.ghost.place(hole.tileX, hole.tileY, hole.col, 4);
      }
    } else if (this.ghost.type === COMP.CLOCK || this.ghost.type === COMP.TESTPOINT) {
      if (hole.type === 'main') {
        this.ghost.place(hole.tileX, hole.tileY, hole.col, hole.row);
      }
    } else {
      let row = hole.row;
      if (row === 4) row = 3;
      if (row === 9) row = 8;
      this.ghost.place(hole.tileX, hole.tileY, hole.col, row);
    }
  }

  // ── Drag-to-move ──────────────────────────────────────────────────────────

  _startComponentMove() {
    const comp = this._moveTarget;
    if (!comp || !comp.placed) { this._maybeMoving = false; return; }

    this._moveIsWireLike = !!(comp.startHoleId && comp.placeWireLike);
    // If the user clicked the chip body (not near a hole), hoveredHole was null.
    // Fall back to the nearest hole (infinite radius) so the grab offset is
    // relative to where on the chip the user actually grabbed it.
    const clickHole = this._moveClickHole
      || this.app.world.findNearestHole(this.mouseWorld.x, this.mouseWorld.y, Infinity);

    const world = this.app.world;

    // ── Pixel-position snapshots ──────────────────────────────────────────
    // The move logic is pure pixel translation: every pin records its world
    // pixel position at drag-start, and on commit we translate by the
    // (HOLE_SPACING-quantized) drag pixel offset and look up each resulting
    // pixel against the breadboard hole grid. This makes "what you see is
    // what you drop" by construction the renderer translates ghost visuals
    // by the same dragPixelOffset, so the visual position during drag is
    // exactly what gets committed on release.
    if (this._moveIsWireLike) {
      const s  = parseHoleId(comp.startHoleId);
      const en = parseHoleId(comp.endHoleId);
      const cCol = clickHole ? clickHole.col : s.col;
      const cRow = clickHole ? clickHole.row : s.row;
      this._moveColOffset   = s.col - cCol;
      this._moveRowOffset   = s.row - cRow;
      this._movePinDeltaCol = en.col - s.col;
      this._movePinDeltaRow = en.row - s.row;
      this._movePrimaryStartPx = world.getHolePosById(comp.startHoleId);
      this._movePrimaryEndPx   = world.getHolePosById(comp.endHoleId);
      this._movePrimaryAnchorPx = null;
    } else {
      // DIP anchor col
      this._moveColOffset = comp.col - (clickHole ? clickHole.col : comp.col);
      this._moveRowOffset = 0;
      this._movePinDeltaCol = 0;
      this._movePinDeltaRow = 0;
      const anchorId = makeHoleId(comp.tileX, comp.tileY, 'main', comp.col, comp.row);
      this._movePrimaryAnchorPx = world.getHolePosById(anchorId);
      this._movePrimarySavedRow = comp.row;
      this._movePrimaryStartPx = null;
      this._movePrimaryEndPx   = null;
    }

    // Snapshot for undo only pushed on successful commit
    this._moveUndoSnapshot = JSON.parse(JSON.stringify(serializeState(this.app.state)));

    // Splice component out of state.components
    const idx = this.app.state.components.indexOf(comp);
    this._moveOriginalIdx = idx >= 0 ? idx : this.app.state.components.length;
    if (idx >= 0) this.app.state.components.splice(idx, 1);

    // Create a ghost clone with the same interactive state
    this.ghost = createComponent(comp.type, comp.type === COMP.DIP_SWITCH ? comp.count : comp.chipId);
    if (comp.type === COMP.SLIDE_SWITCH) this.ghost.state = comp.state;
    if (comp.type === COMP.DIP_SWITCH) this.ghost.states = [...comp.states];
    if (comp.resistance !== undefined && this.ghost.setResistance) {
      this.ghost.setResistance(comp.resistance);
    }
    if (comp.on  !== undefined) this.ghost.on  = comp.on;
    if (comp.pressed !== undefined) this.ghost.pressed = comp.pressed;
    if (comp.vertical !== undefined) this.ghost.vertical = comp.vertical;
    if (comp.colSpan !== undefined) this.ghost.colSpan = comp.colSpan;
    if (comp.color !== undefined) this.ghost.color = comp.color;
    if (comp.label !== undefined) this.ghost.label = comp.label;

    this._movingComp = comp;

    // Pixel anchor for snap-to-grid drag. Use the actual mousedown position
    // (not the post-threshold position) so the ghost's visual offset equals
    // the cursor's true displacement from the click.
    if (this._moveStartScreen) {
      const rect = this.app.canvas.getBoundingClientRect();
      this._dragAnchorWorld = this.app.renderer.screenToWorld(
        this._moveStartScreen.x - rect.left,
        this._moveStartScreen.y - rect.top
      );
    } else {
      this._dragAnchorWorld = { x: this.mouseWorld.x, y: this.mouseWorld.y };
    }
    this._dragPixelOffset = { x: 0, y: 0 };

    // ── Multi-component & wire move: handle other selected items ───────────
    this._movingComps = [];
    this._movingWires = [];
    this.ghosts = [];
    const anchorInSelection = this.app.state.selectedItems.some(i => i.type === 'component' && i.ref === comp);
    if (anchorInSelection) {
      // Secondary components
      const selectedComps = this.app.state.selectedItems
        .filter(i => i.type === 'component' && i.ref !== comp && i.ref.placed);
      for (const selItem of selectedComps) {
        const sc = selItem.ref;
        const isWL = !!(sc.startHoleId && sc.placeWireLike);

        // Partial 2-terminal component: only one pin was inside the selection rect.
        // Move only that endpoint; leave the other end fixed.
        if (isWL && selItem.pin0In !== undefined &&
            selItem.pin0In !== selItem.pin1In) {
          const movedEnd    = selItem.pin0In ? 'start' : 'end';
          const fixedHoleId = movedEnd === 'start' ? sc.endHoleId   : sc.startHoleId;
          const movingHoleId = movedEnd === 'start' ? sc.startHoleId : sc.endHoleId;
          const movingPx    = world.getHolePosById(movingHoleId);
          const partialGhost = createComponent(sc.type, sc.chipId);
          if (sc.resistance !== undefined && partialGhost.setResistance) partialGhost.setResistance(sc.resistance);
          if (sc.on       !== undefined) partialGhost.on       = sc.on;
          if (sc.vertical !== undefined) partialGhost.vertical = sc.vertical;
          if (sc.colSpan  !== undefined) partialGhost.colSpan  = sc.colSpan;
          if (sc.color    !== undefined) partialGhost.color    = sc.color;
          partialGhost.placeWireLike(
            movedEnd === 'start' ? movingHoleId : fixedHoleId,
            movedEnd === 'start' ? fixedHoleId  : movingHoleId
          );
          this._partialEndpointMoves.push({
            kind: 'comp', ref: sc, fixedHoleId, savedMovingHoleId: movingHoleId,
            movingPx, movedEnd, ghost: partialGhost, candidateHoleId: null, oob: false,
          });
          continue; // Do NOT splice from state.components or add to _movingComps
        }

        let colOffset, rowOffset, deltaCols, deltaRows;
        let epStart = null, epEnd = null;
        let nonWLAnchorGlobalCol = 0, nonWLSavedRow = 0;
        let startPx = null, endPx = null, anchorPx = null, savedRow = 0;
        const cCol = clickHole ? clickHole.col : 0;
        const cRow = clickHole ? clickHole.row : 0;
        if (isWL) {
          const ss = parseHoleId(sc.startHoleId);
          const se = parseHoleId(sc.endHoleId);
          colOffset = ss.col - cCol;
          rowOffset = ss.row - cRow;
          deltaCols = se.col - ss.col;
          deltaRows = se.row - ss.row;
          startPx = world.getHolePosById(sc.startHoleId);
          endPx   = world.getHolePosById(sc.endHoleId);
        } else {
          colOffset = sc.col - cCol;
          rowOffset = 0;
          deltaCols = 0;
          deltaRows = 0;
          const aId = makeHoleId(sc.tileX, sc.tileY, 'main', sc.col, sc.row);
          anchorPx = world.getHolePosById(aId);
          savedRow = sc.row;
        }
        const secIdx = this.app.state.components.indexOf(sc);
        const savedIdx = secIdx >= 0 ? secIdx : this.app.state.components.length;
        if (secIdx >= 0) this.app.state.components.splice(secIdx, 1);

        const secGhost = createComponent(sc.type, sc.type === COMP.DIP_SWITCH ? sc.count : sc.chipId);
        if (sc.type === COMP.SLIDE_SWITCH) secGhost.state = sc.state;
        if (sc.type === COMP.DIP_SWITCH) secGhost.states = [...sc.states];
        if (sc.resistance !== undefined && secGhost.setResistance) secGhost.setResistance(sc.resistance);
        if (sc.on  !== undefined) secGhost.on  = sc.on;
        if (sc.pressed !== undefined) secGhost.pressed = sc.pressed;
        if (sc.vertical !== undefined) secGhost.vertical = sc.vertical;
        if (sc.colSpan !== undefined) secGhost.colSpan = sc.colSpan;
        if (sc.color !== undefined) secGhost.color = sc.color;

        this._movingComps.push({ comp: sc, ghost: secGhost, originalIdx: savedIdx, colOffset, rowOffset, isWireLike: isWL, deltaCols, deltaRows, epStart, epEnd, nonWLAnchorGlobalCol, nonWLSavedRow, savedTileY: sc.tileY, startPx, endPx, anchorPx, savedRow });
        this.ghosts.push(secGhost);
      }
      // Selected wires track endpoint offsets from clickHole, then move live
      const selectedWires = this.app.state.selectedItems
        .filter(i => i.type === 'wire');
      for (const selItem of selectedWires) {
        const wire = selItem.ref;

        // Partial wire: only one endpoint was inside the selection rect.
        // Move only that endpoint; leave the other end fixed.
        if (selItem.startIn !== undefined && selItem.startIn !== selItem.endIn) {
          const movedEnd    = selItem.startIn ? 'start' : 'end';
          const fixedHoleId = movedEnd === 'start' ? wire.endHoleId   : wire.startHoleId;
          const movingHoleId = movedEnd === 'start' ? wire.startHoleId : wire.endHoleId;
          const movingPx    = world.getHolePosById(movingHoleId);
          this._partialEndpointMoves.push({
            kind: 'wire', ref: wire, fixedHoleId, savedMovingHoleId: movingHoleId,
            movingPx, movedEnd, ghost: null, candidateHoleId: null, oob: false,
          });
          continue; // Do NOT add to _movingWires
        }

        const ps = parseHoleId(wire.startHoleId);
        const pe = parseHoleId(wire.endHoleId);
        const wcCol = clickHole ? clickHole.col : 0;
        const wcRow = clickHole ? clickHole.row : 0;
        const psGC = ps.tileX * GRID.COLS + ps.col;
        const peGC = pe.tileX * GRID.COLS + pe.col;
        const wStartPx = world.getHolePosById(wire.startHoleId);
        const wEndPx   = world.getHolePosById(wire.endHoleId);
        this._movingWires.push({
          wire,
          savedStart: wire.startHoleId,
          savedEnd:   wire.endHoleId,
          startColOff: ps.col - wcCol,
          startRowOff: ps.row - wcRow,
          endColOff:   pe.col - wcCol,
          endRowOff:   pe.row - wcRow,
          // Pixel-position snapshots pure pixel translation on update/commit.
          startPx: wStartPx,
          endPx:   wEndPx,
          // Global-col anchoring kept for legacy fallback in _updateMoveGhost
          // when a hole-arg path is exercised; pixel path is preferred.
          startGlobalCol: psGC,
          endGlobalCol:   peGC,
          startTileY:     ps.tileY,
          endTileY:       pe.tileY,
          startType:      ps.type,
          endType:        pe.type,
          startSavedRow:  ps.row,
          endSavedRow:    pe.row,
        });
      }
    }

    // Deferred mode: non-chip items and multi-selects keep ghost visible during
    // drag; validity is only enforced on drop, not live during _updateMoveGhost.
    this._moveDeferred = this._moveIsWireLike ||
      (this.ghost.type !== COMP.CHIP && this.ghost.type !== COMP.SEVEN_SEG) ||
      this._movingComps.length > 0 || this._movingWires.length > 0 ||
      this._partialEndpointMoves.length > 0;
    this._moveOutOfBounds = false;

    // Position the ghost immediately. Pure pixel translation with offset
    // (0, 0) places ghosts at their original holes, which is exactly what
    // we want at drag-start before the cursor moves.
    this._applyMovePixelOffset(0, 0);

    this.mode = MODE.MOVE_COMP;
    this.app.canvas.style.cursor = 'grabbing';
  }

  _updateMoveGhost(hole) {
    if (!this.ghost) return;

    // Reset out-of-bounds flag each update.
    this._moveOutOfBounds = false;

    // Clamp helpers: keep a component of size `span` anchored within the board,
    // preserving its shape so the ghost always follows the cursor.
    const clampC = (col, span = 1) => Math.max(0, Math.min(GRID.COLS - span, col));
    const clampR = (row, span = 1) => Math.max(0, Math.min(10 - span, row));

    // ── Rigid-translation model ──────────────────────────────────────────
    // Group drag is locked to **horizontal** translation in GLOBAL column
    // space. Each endpoint preserves its original hole `type` ('main' or
    // 'power') and its original `row`. The cursor's vertical position and
    // hole-type are intentionally ignored, so all components in a multi-
    // selection translate by exactly the same amount even if the cursor
    // strays onto a power rail or a different row mid-drag.
    const cursorGlobalCol = hole.tileX * GRID.COLS + hole.col;
    const deltaGlobalCol  = cursorGlobalCol - this._moveAnchorGlobalCol;
    const world = this.app.world;

    // Translate one endpoint snapshot { globalCol, type, savedRow, tileY }.
    // Returns { tileX, col, row, type, oob } where oob=true means the target
    // hole does not exist (off-board, missing tile, or power-rail gap).
    const translateEP = (ep) => {
      const newGC    = ep.globalCol + deltaGlobalCol;
      const newTileX = Math.floor(newGC / GRID.COLS);
      const newCol   = newGC - newTileX * GRID.COLS;
      const newTileY = ep.tileY;
      const tile     = world.getTile(newTileX, newTileY);
      let oob = !tile || newCol < 0 || newCol >= GRID.COLS;
      if (!oob && ep.type === 'power') {
        // Power rails have physical-hole gaps every 6 cols (matches
        // breadboard.js findNearestHole filter): skip non-existent rail holes.
        const oc = newCol - 2;
        if (oc < 0 || oc >= 59 || oc % 6 === 5) oob = true;
      }
      return { tileX: newTileX, tileY: newTileY, col: newCol, row: ep.savedRow, type: ep.type, oob };
    };
    const placeWLeps = (g, epStart, epEnd) => {
      const a = translateEP(epStart);
      const b = translateEP(epEnd);
      if (a.oob || b.oob) {
        this._moveOutOfBounds = true;
        // Keep the ghost visible at clamped positions for visual feedback,
        // but the drop will be rejected because _moveOutOfBounds is set.
        const ca = { tileX: clampC(a.tileX, 1), tileY: a.tileY, col: clampC(a.col, 1), row: a.row, type: a.type };
        const cb = { tileX: clampC(b.tileX, 1), tileY: b.tileY, col: clampC(b.col, 1), row: b.row, type: b.type };
        g.placeWireLike(
          makeHoleId(ca.tileX, ca.tileY, ca.type, ca.col, ca.row),
          makeHoleId(cb.tileX, cb.tileY, cb.type, cb.col, cb.row),
        );
        return true;
      }
      g.placeWireLike(
        makeHoleId(a.tileX, a.tileY, a.type, a.col, a.row),
        makeHoleId(b.tileX, b.tileY, b.type, b.col, b.row),
      );
      return false;
    };

    // ── Primary ghost ─────────────────────────────────────────────────────
    if (this._moveIsWireLike) {
      const a = translateEP(this._movePrimaryStart);
      const b = translateEP(this._movePrimaryEnd);
      const oob = a.oob || b.oob;
      if (oob && !this._moveDeferred) {
        this.ghost.placed = false;
      } else {
        placeWLeps(this.ghost, this._movePrimaryStart, this._movePrimaryEnd);
      }
    } else if (this.ghost.type === COMP.CHIP || this.ghost.type === COMP.SEVEN_SEG || this.ghost.type === COMP.DIP_SWITCH) {
      // Rigid horizontal translation by global col; row stays at 4.
      const newGC    = this._movePrimaryAnchorGlobalCol + deltaGlobalCol;
      const newTileX = Math.floor(newGC / GRID.COLS);
      const newCol   = newGC - newTileX * GRID.COLS;
      const newTileY = this._movePrimaryAnchorTileY;
      const colSpan  = this.ghost.colSpan || 1;
      const tile     = world.getTile(newTileX, newTileY);
      const oob = !tile || newCol < 0 || newCol + colSpan > GRID.COLS;
      if (oob) {
        if (!this._moveDeferred) { this.ghost.placed = false; }
        else { this._moveOutOfBounds = true; this.ghost.place(newTileX, newTileY, clampC(newCol, colSpan), 4); }
      } else { this.ghost.place(newTileX, newTileY, newCol, 4); }
    } else if (this.ghost.type === COMP.BUTTON) {
      // Rigid horizontal translation by global col; preserve original row
      // and orientation. Vertical cursor motion is ignored.
      const newGC    = this._movePrimaryAnchorGlobalCol + deltaGlobalCol;
      const newTileX = Math.floor(newGC / GRID.COLS);
      const newCol   = newGC - newTileX * GRID.COLS;
      const newTileY = this._movePrimaryAnchorTileY;
      const savedRow = this._movePrimarySavedRow;
      const tile     = world.getTile(newTileX, newTileY);
      const span     = this.ghost.colSpan || 1;
      const oob = !tile || newCol < 0 || newCol + (span - 1) >= GRID.COLS;
      if (oob) {
        if (!this._moveDeferred) { this.ghost.placed = false; }
        else { this._moveOutOfBounds = true; this.ghost.place(newTileX, newTileY, clampC(newCol, span), savedRow); }
      } else { this.ghost.place(newTileX, newTileY, newCol, savedRow); }
    } else if (this.ghost.type === COMP.SLIDE_SWITCH) {
      const newGC    = this._movePrimaryAnchorGlobalCol + deltaGlobalCol;
      const newTileX = Math.floor(newGC / GRID.COLS);
      const newCol   = newGC - newTileX * GRID.COLS;
      const newTileY = this._movePrimaryAnchorTileY;
      const savedRow = this._movePrimarySavedRow;
      const tile     = world.getTile(newTileX, newTileY);
      const oob = !tile || newCol < 0 || newCol + 2 >= GRID.COLS;
      if (oob) {
        if (!this._moveDeferred) { this.ghost.placed = false; }
        else { this._moveOutOfBounds = true; this.ghost.place(newTileX, newTileY, clampC(newCol, 3), savedRow); }
      } else { this.ghost.place(newTileX, newTileY, newCol, savedRow); }
    }

    // ── Secondary component ghosts (multi-move) ───────────────────────────
    // All secondary placement is rigid: global-col translation only, original
    // row preserved. Drop is rejected (via _moveOutOfBounds) if any target
    // hole would be off-board, in a missing tile, or in a power-rail gap.
    for (const mover of this._movingComps) {
      const g = mover.ghost;
      if (mover.isWireLike) {
        placeWLeps(g, mover.epStart, mover.epEnd);
      } else {
        const newGC    = mover.nonWLAnchorGlobalCol + deltaGlobalCol;
        const newTileX = Math.floor(newGC / GRID.COLS);
        const newCol   = newGC - newTileX * GRID.COLS;
        const newTileY = mover.savedTileY;
        const savedRow = mover.nonWLSavedRow;
        const tile     = world.getTile(newTileX, newTileY);
        if (g.type === COMP.CHIP || g.type === COMP.SEVEN_SEG || g.type === COMP.DIP_SWITCH) {
          const colSpan = g.colSpan || 1;
          if (!tile || newCol < 0 || newCol + colSpan > GRID.COLS) {
            this._moveOutOfBounds = true; g.place(newTileX, newTileY, clampC(newCol, colSpan), 4);
          } else { g.place(newTileX, newTileY, newCol, 4); }
        } else if (g.type === COMP.BUTTON) {
          const span = g.colSpan || 1;
          if (!tile || newCol < 0 || newCol + (span - 1) >= GRID.COLS) {
            this._moveOutOfBounds = true; g.place(newTileX, newTileY, clampC(newCol, span), savedRow);
          } else { g.place(newTileX, newTileY, newCol, savedRow); }
        } else if (g.type === COMP.SLIDE_SWITCH) {
          if (!tile || newCol < 0 || newCol + 2 >= GRID.COLS) {
            this._moveOutOfBounds = true; g.place(newTileX, newTileY, clampC(newCol, 3), savedRow);
          } else { g.place(newTileX, newTileY, newCol, savedRow); }
        } else {
          if (!tile || newCol < 0 || newCol >= GRID.COLS) {
            this._moveOutOfBounds = true; g.place(newTileX, newTileY, clampC(newCol), savedRow);
          } else { g.place(newTileX, newTileY, newCol, savedRow); }
        }
      }
    }

    // ── Compute candidate snap targets for selected wires (no live mutation) ──
    // Real wire endpoints are left untouched during drag; the renderer draws
    // them at their original positions translated by the drag pixel offset.
    // On commit, the candidate values are applied; on cancel, nothing to undo.
    for (const mw of this._movingWires) {
      const epS = { globalCol: mw.startGlobalCol, type: mw.startType, savedRow: mw.startSavedRow, tileY: mw.startTileY };
      const epE = { globalCol: mw.endGlobalCol,   type: mw.endType,   savedRow: mw.endSavedRow,   tileY: mw.endTileY   };
      const a = translateEP(epS);
      const b = translateEP(epE);
      mw.oob = a.oob || b.oob;
      if (mw.oob) {
        this._moveOutOfBounds = true;
        const ca = { tileX: clampC(a.tileX, 1), tileY: a.tileY, col: clampC(a.col, 1), row: a.row, type: a.type };
        const cb = { tileX: clampC(b.tileX, 1), tileY: b.tileY, col: clampC(b.col, 1), row: b.row, type: b.type };
        mw.candidateStart = makeHoleId(ca.tileX, ca.tileY, ca.type, ca.col, ca.row);
        mw.candidateEnd   = makeHoleId(cb.tileX, cb.tileY, cb.type, cb.col, cb.row);
      } else {
        mw.candidateStart = makeHoleId(a.tileX, a.tileY, a.type, a.col, a.row);
        mw.candidateEnd   = makeHoleId(b.tileX, b.tileY, b.type, b.col, b.row);
      }
    }
  }

  // ── Pure pixel-position translation ──────────────────────────────────────
  // The single source of truth for "where the group lands". Every moving pin
  // (primary + secondaries + wires) was snapshotted in world-pixel space at
  // drag start. Here we translate every snapshot by (dx, dy) and look up the
  // resulting pixel against the breadboard hole grid. If every required pin
  // resolves to a real hole, ghosts are placed at those holes; otherwise
  // _moveOutOfBounds is set so the drop is rejected.
  //
  // Because the renderer translates ghost visuals by exactly the same
  // dragPixelOffset, the visual position during drag is byte-identical to
  // the committed logical position "what you see is what you drop".
  _applyMovePixelOffset(dx, dy) {
    if (!this.ghost) return;
    this._moveOutOfBounds = false;
    const world = this.app.world;
    // Tight radius: dragPixelOffset is HOLE_SPACING-quantized in _onMouseMove,
    // so an exact hole is either present or not. 1px tolerance for f.p. drift.
    const lookup = (px) => px ? world.findNearestHole(px.x + dx, px.y + dy, 1) : null;

    // Single-button move: mirror initial placement's auto-orientation so the
    // ghost flips between horizontal (rows 0-2/5-7, span 4) and vertical/
    // straddle (rows 4-5, span 3) based on the target row. Skip for multi-
    // component moves so grouped drags stay rigid.
    const isSingleButtonMove = this.ghost && this.ghost.type === COMP.BUTTON &&
      this._movingComps.length === 0 &&
      this._movingWires.length === 0 &&
      this._partialEndpointMoves.length === 0;
    const placeNonWL = (g, anchorPx) => {
      const aH = lookup(anchorPx);
      if (!aH || aH.type !== 'main') {
        this._moveOutOfBounds = true;
        return false;
      }
      if (isSingleButtonMove && g === this.ghost) {
        if (aH.row === 4 || aH.row === 5) {
          if (aH.col + 2 < GRID.COLS) {
            g.vertical = true;
            g.colSpan = 3;
            g.place(aH.tileX, aH.tileY, aH.col, 4);
            return true;
          }
        } else if ((aH.row >= 0 && aH.row <= 2) || (aH.row >= 5 && aH.row <= 7)) {
          if (aH.col + 3 < GRID.COLS) {
            g.vertical = false;
            g.colSpan = 4;
            g.place(aH.tileX, aH.tileY, aH.col, aH.row);
            return true;
          }
        }
        this._moveOutOfBounds = true;
        return false;
      }
      const span = g.colSpan || 1;
      const ok = g.isValidAnchor(aH.row) &&
                 aH.col >= 0 && aH.col + span <= GRID.COLS;
      if (ok) {
        g.place(aH.tileX, aH.tileY, aH.col, aH.row);
        return true;
      }
      this._moveOutOfBounds = true;
      return false;
    };
    const placeWL = (g, sPx, ePx) => {
      const sH = lookup(sPx);
      const eH = lookup(ePx);
      if (sH && eH) {
        g.placeWireLike(sH.id, eH.id);
        return true;
      }
      this._moveOutOfBounds = true;
      return false;
    };

    // Primary
    if (this._moveIsWireLike) {
      placeWL(this.ghost, this._movePrimaryStartPx, this._movePrimaryEndPx);
    } else if (this._movePrimaryAnchorPx) {
      placeNonWL(this.ghost, this._movePrimaryAnchorPx);
    }

    // Secondaries
    for (const mover of this._movingComps) {
      if (mover.isWireLike) {
        placeWL(mover.ghost, mover.startPx, mover.endPx);
      } else if (mover.anchorPx) {
        placeNonWL(mover.ghost, mover.anchorPx);
      }
    }

    // Wires defer logical mutation until commit; just record candidates.
    for (const mw of this._movingWires) {
      const sH = lookup(mw.startPx);
      const eH = lookup(mw.endPx);
      if (sH && eH) {
        mw.candidateStart = sH.id;
        mw.candidateEnd   = eH.id;
        mw.oob = false;
      } else {
        this._moveOutOfBounds = true;
        mw.candidateStart = null;
        mw.candidateEnd   = null;
        mw.oob = true;
      }
    }

    // Partial endpoint moves translate only the moving end; fixed end stays put.
    for (const pe of this._partialEndpointMoves) {
      const movH = world.findNearestHole(pe.movingPx.x + dx, pe.movingPx.y + dy, 1);
      if (movH) {
        pe.candidateHoleId = movH.id;
        pe.oob = false;
        if (pe.kind === 'comp' && pe.ghost) {
          const startId = pe.movedEnd === 'start' ? movH.id : pe.fixedHoleId;
          const endId   = pe.movedEnd === 'start' ? pe.fixedHoleId : movH.id;
          pe.ghost.placeWireLike(startId, endId);
        }
      } else {
        pe.candidateHoleId = null;
        pe.oob = true;
        this._moveOutOfBounds = true;
      }
    }
  }

  _commitOrCancelMove() {
    // Pure pixel-position translation: the same offset that the renderer
    // used to translate ghost visuals during the drag is applied here to
    // resolve every pin's final hole. This guarantees the dropped position
    // exactly matches what the user saw immediately before release.
    this._applyMovePixelOffset(this._dragPixelOffset.x, this._dragPixelOffset.y);

    // All ghosts (primary + secondary) must be placed and overlap-free
    // All ghosts must be placed, overlap-free, and within the board bounds.
    const allValid = this.ghost && this.ghost.placed && !this._checkOverlap(this.ghost) &&
      this._movingComps.every(m => m.ghost.placed && !this._checkOverlap(m.ghost)) &&
      !this._moveOutOfBounds;

    if (allValid) {
      // Apply the ghost's final position back to the primary component
      if (this._moveIsWireLike) {
        this._movingComp.startHoleId = this.ghost.startHoleId;
        this._movingComp.endHoleId   = this.ghost.endHoleId;
        this._movingComp.computePins();
      } else {
        if (this._movingComp.type === COMP.BUTTON) {
          this._movingComp.vertical = this.ghost.vertical;
          this._movingComp.colSpan = this.ghost.colSpan;
        }
        this._movingComp.place(this.ghost.tileX, this.ghost.tileY, this.ghost.col, this.ghost.row);
      }
      // Apply to secondary components
      for (const mover of this._movingComps) {
        if (mover.isWireLike) {
          mover.comp.startHoleId = mover.ghost.startHoleId;
          mover.comp.endHoleId   = mover.ghost.endHoleId;
          mover.comp.computePins();
        } else {
          if (mover.comp.type === COMP.BUTTON) {
            mover.comp.vertical = mover.ghost.vertical;
            mover.comp.colSpan = mover.ghost.colSpan;
          }
          mover.comp.place(mover.ghost.tileX, mover.ghost.tileY, mover.ghost.col, mover.ghost.row);
        }
      }
      // Apply candidate snap targets to selected wires (deferred from drag)
      for (const mw of this._movingWires) {
        if (mw.candidateStart && mw.candidateEnd) {
          mw.wire.startHoleId = mw.candidateStart;
          mw.wire.endHoleId   = mw.candidateEnd;
        }
      }
      // Apply partial endpoint moves (one endpoint per item)
      for (const pe of this._partialEndpointMoves) {
        if (pe.candidateHoleId) {
          if (pe.movedEnd === 'start') pe.ref.startHoleId = pe.candidateHoleId;
          else                        pe.ref.endHoleId   = pe.candidateHoleId;
          if (pe.kind === 'comp') pe.ref.computePins();
        }
      }
      // Push undo snapshot (captured at drag-start)
      this.app.undoStack.push(this._moveUndoSnapshot);
      if (this.app.undoStack.length > 50) this.app.undoStack.shift();
      // Re-add all components and select them all (+ wires)
      this.app.state.components.push(this._movingComp);
      const newSelected = [{ type: 'component', ref: this._movingComp }];
      for (const mover of this._movingComps) {
        this.app.state.components.push(mover.comp);
        newSelected.push({ type: 'component', ref: mover.comp });
      }
      for (const mw of this._movingWires) {
        newSelected.push({ type: 'wire', ref: mw.wire });
      }
      for (const pe of this._partialEndpointMoves) {
        if (pe.kind === 'wire') newSelected.push({ type: 'wire', ref: pe.ref });
        else                   newSelected.push({ type: 'component', ref: pe.ref });
      }
      this.app.state.selectedItems = newSelected;
      this._resetMoveState();
      this.app.onCircuitChanged();
    } else {
      // Invalid drop: flash the canvas border red then restore origin
      this.app.canvas.style.outline = '3px solid #ff4444';
      setTimeout(() => { this.app.canvas.style.outline = ''; }, 400);
      this._cancelMove();
    }
  }

  _cancelMove() {
    if (this._movingComp) {
      const idx = Math.min(this._moveOriginalIdx, this.app.state.components.length);
      this.app.state.components.splice(idx, 0, this._movingComp);
    }
    // Restore secondary components at their original indices
    for (const mover of this._movingComps) {
      const idx = Math.min(mover.originalIdx, this.app.state.components.length);
      this.app.state.components.splice(idx, 0, mover.comp);
    }
    // Restore wire endpoint positions
    for (const mw of this._movingWires) {
      mw.wire.startHoleId = mw.savedStart;
      mw.wire.endHoleId   = mw.savedEnd;
    }
    this._resetMoveState();
    this.app.onCircuitChanged();
  }

  _resetMoveState() {
    this.ghost = null;
    this.ghosts = [];
    this._movingComp = null;
    this._movingComps = [];
    this._movingWires = [];
    this._partialEndpointMoves = [];
    this._moveTarget = null;
    this._moveClickHole = null;
    this._moveStartScreen = null;
    this._moveUndoSnapshot = null;
    this._moveColOffset = 0;
    this._moveRowOffset = 0;
    this._movePinDeltaCol = 0;
    this._movePinDeltaRow = 0;
    this._moveIsWireLike = false;
    this._moveOriginalIdx = -1;
    this._moveDeferred = false;
    this._moveOutOfBounds = false;
    this._dragAnchorWorld = null;
    this._dragPixelOffset = { x: 0, y: 0 };
    this.mode = MODE.IDLE;
    this.app.canvas.style.cursor = 'default';
  }

  // ── Wire endpoint drag ────────────────────────────────────────────────────

  _startWireEndpointDrag() {
    const ep = this._moveWireEp;
    if (!ep) return;
    const wire = ep.wire;
    const stationaryHoleId = ep.endpoint === 'start' ? wire.endHoleId : wire.startHoleId;

    // Snapshot for undo pushed only on successful commit
    this._moveWireUndoSnapshot = JSON.parse(JSON.stringify(serializeState(this.app.state)));

    // wireStart = stationary hole → renderer draws a dashed preview line to cursor
    this.wireStart = { id: stationaryHoleId };

    this.mode = MODE.MOVE_WIRE_EP;
    this.app.canvas.style.cursor = 'crosshair';
  }

  _commitOrCancelWireEndpointDrag() {
    const ep = this._moveWireEp;
    if (!ep) { this._resetWireEndpointDragState(); return; }

    const targetHole = this.app.state.hoveredHole;
    if (!targetHole) {
      this._cancelWireEndpointDrag();
      return;
    }

    const wire = ep.wire;
    const stationaryHoleId = ep.endpoint === 'start' ? wire.endHoleId : wire.startHoleId;

    // Can't place both ends on the same hole
    if (targetHole.id === stationaryHoleId) {
      this._cancelWireEndpointDrag();
      return;
    }

    // Can't place on a hole already occupied by a different wire endpoint
    const existingEp = this.app.state.wireManager.findEndpointAtHole(targetHole.id);
    if (existingEp && existingEp.wire.id !== wire.id) {
      this.app.canvas.style.outline = '3px solid #ff4444';
      setTimeout(() => { this.app.canvas.style.outline = ''; }, 400);
      this._cancelWireEndpointDrag();
      return;
    }

    // Block if this would create a VCC-GND short
    if (this.app.simulator.netlist.wouldShort(stationaryHoleId, targetHole.id, this.app.world)) {
      this.app.canvas.style.outline = '3px solid #ff4444';
      setTimeout(() => { this.app.canvas.style.outline = ''; }, 400);
      this._cancelWireEndpointDrag();
      return;
    }

    // Push undo snapshot
    this.app.undoStack.push(this._moveWireUndoSnapshot);
    if (this.app.undoStack.length > 50) this.app.undoStack.shift();

    // Apply the new endpoint position
    if (ep.endpoint === 'start') {
      wire.startHoleId = targetHole.id;
    } else {
      wire.endHoleId = targetHole.id;
    }

    this._resetWireEndpointDragState();
    this.app.onCircuitChanged();
  }

  _cancelWireEndpointDrag() {
    this._resetWireEndpointDragState();
    // Re-render to restore original appearance
    this.app.renderer.draw(this.app.state);
  }

  _resetWireEndpointDragState() {
    this._maybeMovingWireEp = false;
    this._moveWireEp = null;
    this._moveWireStartScreen = null;
    this._moveWireUndoSnapshot = null;
    this.wireStart = null;
    this.mode = MODE.IDLE;
    this.app.canvas.style.cursor = 'default';
  }

  // ── Wire-like component pin endpoint drag ─────────────────────────────────

  // Recompute the live preview state for a 2-terminal component being placed
  // (MODE.COMP_END) or whose endpoint is being dragged (MODE.MOVE_COMP_EP).
  // Returns the new preview object (or null) and stores it on app.state for
  // the renderer to consume.
  _updateCompDragPreview() {
    let dp = null;
    if (this.mode === MODE.COMP_END && this.ghost && this.compStart) {
      const stationaryPos = this.compStart.pos;
      const maxDistPx = (COMP_MAX_DIST[this.placementType] || 10) * GRID.HOLE_SPACING;
      const { endPos, isClamped } = clampLeadEndpoint(stationaryPos, this.mouseWorld, maxDistPx);
      dp = {
        comp: this.ghost,
        endpoint: 'end',
        stationaryHoleId: this.compStart.id,
        stationaryPos,
        endPos,
        isClamped,
      };
    } else if (this.mode === MODE.MOVE_COMP_EP && this._moveCompEp) {
      const { comp, endpoint } = this._moveCompEp;
      const stationaryHoleId = endpoint === 'start' ? comp.endHoleId : comp.startHoleId;
      const stationaryPos = this.app.world.getHolePosById(stationaryHoleId);
      if (stationaryPos) {
        const maxDistPx = (COMP_MAX_DIST[comp.type] || 10) * GRID.HOLE_SPACING;
        const { endPos, isClamped } = clampLeadEndpoint(stationaryPos, this.mouseWorld, maxDistPx);
        dp = {
          comp,
          endpoint,
          stationaryHoleId,
          stationaryPos,
          endPos,
          isClamped,
        };
      }
    }
    this.app.state.compDragPreview = dp;
    return dp;
  }

  _startCompEndpointDrag() {
    const ep = this._moveCompEp;
    if (!ep) return;
    const { comp, endpoint } = ep;

    this._moveCompEpUndoSnapshot = JSON.parse(JSON.stringify(serializeState(this.app.state)));

    this.mode = MODE.MOVE_COMP_EP;
    this.app.canvas.style.cursor = 'crosshair';

    // Seed compDragPreview for this frame so the renderer immediately shows
    // the body following the cursor (otherwise there'd be a 1-frame gap until
    // the next mousemove).
    this._updateCompDragPreview();
  }

  _commitOrCancelCompEndpointDrag() {
    const ep = this._moveCompEp;
    if (!ep) { this._resetCompEndpointDragState(); return; }

    const targetHole = this.app.state.hoveredHole;
    if (!targetHole) { this._cancelCompEndpointDrag(); return; }

    const { comp, endpoint } = ep;
    const stationaryHoleId = endpoint === 'start' ? comp.endHoleId : comp.startHoleId;

    if (targetHole.id === stationaryHoleId) { this._cancelCompEndpointDrag(); return; }

    // Check distance limit
    const stationary = parseHoleId(stationaryHoleId);
    const target = parseHoleId(targetHole.id);
    const dc = Math.abs(target.col - stationary.col);
    const dr = Math.abs(target.row - stationary.row);
    const dist = Math.sqrt(dc * dc + dr * dr);
    const maxDist = COMP_MAX_DIST[comp.type] || 10;
    if (dist > maxDist) {
      this.app.canvas.style.outline = '3px solid #ff4444';
      setTimeout(() => { this.app.canvas.style.outline = ''; }, 400);
      this._cancelCompEndpointDrag();
      return;
    }

    // Check that target hole is not occupied by another component or wire endpoint
    if (this._isHoleBlockedForComp(targetHole.id, comp)) {
      this.app.canvas.style.outline = '3px solid #ff4444';
      setTimeout(() => { this.app.canvas.style.outline = ''; }, 400);
      this._cancelCompEndpointDrag();
      return;
    }

    // Push undo snapshot
    this.app.undoStack.push(this._moveCompEpUndoSnapshot);
    if (this.app.undoStack.length > 50) this.app.undoStack.shift();

    // Apply new positions
    const newStartId = endpoint === 'start' ? targetHole.id : comp.startHoleId;
    const newEndId   = endpoint === 'start' ? comp.endHoleId : targetHole.id;
    comp.placeWireLike(newStartId, newEndId);

    this._resetCompEndpointDragState();
    this.app.onCircuitChanged();
  }

  _cancelCompEndpointDrag() {
    this._resetCompEndpointDragState();
  }

  _resetCompEndpointDragState() {
    this._maybeMovingCompEp = false;
    this._moveCompEp = null;
    this._moveCompEpStartScreen = null;
    this._moveCompEpUndoSnapshot = null;
    this.wireStart = null;
    this.app.state.compDragPreview = null;
    this.mode = MODE.IDLE;
    this.app.canvas.style.cursor = 'default';
  }

  // Check if a hole is blocked for a component placement (another comp pin or wire endpoint)
  _isHoleBlockedForComp(holeId, excludeComp) {
    for (const comp of this.app.state.components) {
      if (comp.id === excludeComp.id) continue;
      if (!comp.placed) continue;
      for (const pin of comp.pins) {
        if (pin.holeId === holeId) return true;
      }
    }
    if (this.app.state.wireManager.findEndpointAtHole(holeId)) return true;
    return false;
  }

  _checkOverlap(comp) {
    const newHoles = new Set(comp.getOccupiedHoles());
    // Check against existing components
    for (const existing of this.app.state.components) {
      if (existing.id === comp.id) continue;
      if (!existing.placed) continue;
      for (const h of existing.getOccupiedHoles()) {
        if (newHoles.has(h)) return true;
      }
    }
    // Check against wire endpoints, but skip wires that are moving with the group
    // (their endpoints are still at the original positions during the drag and
    // would produce false conflicts with the new ghost positions).
    const movingWireSet = new Set(this._movingWires.map(mw => mw.wire));
    for (const wire of this.app.state.wireManager.wires) {
      if (movingWireSet.has(wire)) continue;
      if (newHoles.has(wire.startHoleId) || newHoles.has(wire.endHoleId)) return true;
    }
    return false;
  }

  // ── Check if a hole is occupied by a component ────────────────────────────
  _isHoleOccupiedByComponent(holeId) {
    for (const comp of this.app.state.components) {
      if (!comp.placed) continue;
      for (const h of comp.getOccupiedHoles()) {
        if (h === holeId) return true;
      }
    }
    return false;
  }

  // ── Rubber-band rect selection ────────────────────────────────────────────
  _commitRectSelection() {
    const rect = this.app.state.selectRect;
    if (!rect) return;
    const matched = [];
    for (const comp of this.app.state.components) {
      if (!comp.placed) continue;
      const isWL = !!(comp.startHoleId && comp.endHoleId);
      if (isWL) {
        // Per-pin point check for 2-terminal (wire-like) components.
        // Record which pins were inside the rect so partial endpoint moves work.
        const p0pos = comp.pins[0] ? this.app.world.getHolePosById(comp.pins[0].holeId) : null;
        const p1pos = comp.pins[1] ? this.app.world.getHolePosById(comp.pins[1].holeId) : null;
        const pin0In = !!(p0pos && p0pos.x >= rect.x1 && p0pos.x <= rect.x2 &&
                                   p0pos.y >= rect.y1 && p0pos.y <= rect.y2);
        const pin1In = !!(p1pos && p1pos.x >= rect.x1 && p1pos.x <= rect.x2 &&
                                   p1pos.y >= rect.y1 && p1pos.y <= rect.y2);
        if (pin0In || pin1In) {
          matched.push({ type: 'component', ref: comp, pin0In, pin1In });
        }
      } else if (this._compIntersectsRect(comp, rect)) {
        matched.push({ type: 'component', ref: comp });
      }
    }
    // Also select wires if either terminal falls inside the selection rect.
    // Record which endpoints were inside so partial endpoint moves work.
    for (const wire of this.app.state.wireManager.wires) {
      const startPos = this.app.world.getHolePosById(wire.startHoleId);
      const endPos   = this.app.world.getHolePosById(wire.endHoleId);
      const startIn  = !!(startPos && startPos.x >= rect.x1 && startPos.x <= rect.x2 &&
                                      startPos.y >= rect.y1 && startPos.y <= rect.y2);
      const endIn    = !!(endPos   && endPos.x   >= rect.x1 && endPos.x   <= rect.x2 &&
                                      endPos.y   >= rect.y1 && endPos.y   <= rect.y2);
      if (startIn || endIn) {
        matched.push({ type: 'wire', ref: wire, startIn, endIn });
      }
    }
    this.app.state.selectedItems = matched;
  }

  _compIntersectsRect(comp, rect) {
    if (comp.pins.length === 0) return false;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pin of comp.pins) {
      const pos = this.app.world.getHolePosById(pin.holeId);
      if (!pos) continue;
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x > maxX) maxX = pos.x;
      if (pos.y > maxY) maxY = pos.y;
    }
    if (minX === Infinity) return false;
    const pad = 10;
    // AABB overlap: component bbox (with pad) vs selection rect
    return (minX - pad) <= rect.x2 && (maxX + pad) >= rect.x1 &&
           (minY - pad) <= rect.y2 && (maxY + pad) >= rect.y1;
  }

  // ── Find component at mouse ───────────────────────────────────────────────
  // Single source of truth for click / right-click targeting, kept in lockstep
  // with the hover circle: when the circle is visible on a hole, that hole's
  // occupant IS the target — a hole occupied by a wire endpoint returns null
  // here so callers fall through to _findWireAtMouse(). Body hit-tests (lead
  // segments, chip bounding boxes) only apply when no hole is hovered, so
  // what the user sees indicated is always what a click acts on.
  /**
   * Returns true when the current mouse world position is within the
   * rendered body of a 2 pin SWITCH or PUSH_BUTTON. For other component
   * types this returns true (no body restriction).
   */
  _isOverComponentBody(comp) {
    if (comp.type !== COMP.PUSH_BUTTON && comp.type !== COMP.SWITCH) return true;
    if (!comp.pins || comp.pins.length < 2) return false;
    const a = this.app.world.getHolePosById(comp.pins[0].holeId);
    const b = this.app.world.getHolePosById(comp.pins[1].holeId);
    if (!a || !b) return false;
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    // Half-extents must match the rendered body in renderer.js
    // PUSH_BUTTON: 24x24 (s=12); SWITCH: 34x20
    let hw, hh;
    if (comp.type === COMP.PUSH_BUTTON) { hw = 12; hh = 12; }
    else { hw = 17; hh = 10; }
    const dx = this.mouseWorld.x - cx;
    const dy = this.mouseWorld.y - cy;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    return Math.abs(lx) <= hw && Math.abs(ly) <= hh;
  }

  // World-space bounding box of the current multi-selection (≥2 component/wire
  // items), padded to match the visible selection outline drawn by the renderer.
  // Returns null if the selection is too small to form a group bbox.
  _computeSelectionBBox() {
    const items = this.app.state.selectedItems;
    if (!items || items.length < 2) return null;
    const groupable = items.filter(i => i.type === 'component' || i.type === 'wire');
    if (groupable.length < 2) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const addPt = (p) => {
      if (!p) return;
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    };
    const world = this.app.world;
    for (const item of groupable) {
      if (item.type === 'component') {
        if (!item.ref.placed) continue;
        for (const pin of item.ref.pins) addPt(world.getHolePosById(pin.holeId));
      } else {
        addPt(world.getHolePosById(item.ref.startHoleId));
        addPt(world.getHolePosById(item.ref.endHoleId));
      }
    }
    if (!isFinite(minX)) return null;
    const pad = 12; // matches renderer.js combined-bbox padding
    return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
  }

  _pointInBBox(p, bb) {
    return p.x >= bb.minX && p.x <= bb.maxX && p.y >= bb.minY && p.y <= bb.maxY;
  }

  _findComponentAtHole(holeId) {
    for (const comp of this.app.state.components) {
      if (!comp.placed) continue;
      for (const h of comp.getOccupiedHoles()) {
        if (h === holeId) return comp;
      }
    }
    return null;
  }

  _findComponentAtMouse() {
    const hole = this.app.state.hoveredHole;
    if (hole) {
      const occupant = this._findComponentAtHole(hole.id);
      if (occupant) return occupant;
      // Hovered hole holds a wire endpoint — the wire owns this click, no
      // component may steal it via a nearby segment or bounding box.
      if (this.app.state.wireManager.findEndpointAtHole(hole.id)) return null;
    }

    // No hovered hole: body hit-tests. Segment threshold is constant in
    // SCREEN pixels (like the hover snap radius) so leads stay equally
    // grabbable at any zoom level.
    const segRadius = 10 / this.app.renderer.zoom;
    let bboxHit = null;
    let closestSeg = null;
    let closestSegDist = Infinity;

    for (const comp of this.app.state.components) {
      if (!comp.placed) continue;

      if (comp.startHoleId && comp.endHoleId) {
        // 2 pin wire-like: perpendicular distance to the lead segment
        const startPos = this.app.world.getHolePosById(comp.startHoleId);
        const endPos = this.app.world.getHolePosById(comp.endHoleId);
        if (startPos && endPos) {
          const dist = this._pointToSegmentDist(this.mouseWorld, startPos, endPos);
          if (dist < segRadius && dist < closestSegDist) {
            closestSegDist = dist;
            closestSeg = comp;
          }
        }
      } else if (comp.pins.length > 0) {
        // Body bbox — last match wins so overlapping bodies resolve to the
        // one drawn on top (renderer paints components in array order).
        const bounds = this._getComponentBounds(comp);
        if (bounds &&
            this.mouseWorld.x >= bounds.x && this.mouseWorld.x <= bounds.x + bounds.w &&
            this.mouseWorld.y >= bounds.y && this.mouseWorld.y <= bounds.y + bounds.h) {
          bboxHit = comp;
        }
      }
    }

    if (closestSeg) return closestSeg;
    return bboxHit;
  }

  _getComponentBounds(comp) {
    if (comp.pins.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pin of comp.pins) {
      const pos = this.app.world.getHolePosById(pin.holeId);
      if (!pos) continue;
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x > maxX) maxX = pos.x;
      if (pos.y > maxY) maxY = pos.y;
    }
    if (minX === Infinity) return null;
    const pad = 10;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }

  _pointToSegmentDist(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  _findWireAtMouse() {
    const hole = this.app.state.hoveredHole;
    if (!hole) return null;
    const ep = this.app.state.wireManager.findEndpointAtHole(hole.id);
    return ep ? ep.wire : null;
  }

  // ── Breadboard + button and extra tile helpers ────────────────────────────
  _findPlusButtonClick() {
    const hitRadius = 42;
    for (const tile of this.app.world.tiles) {
      const origin = tile.getOrigin();
      const w = GRID.TILE_WIDTH;
      const h = GRID.TILE_HEIGHT;
      if (!this.app.world.getTile(tile.tileX + 1, tile.tileY)) {
        const px = origin.x + w + 52, py = origin.y + h / 2;
        if (Math.hypot(this.mouseWorld.x - px, this.mouseWorld.y - py) < hitRadius)
          return { tx: tile.tileX + 1, ty: tile.tileY };
      }
      if (!this.app.world.getTile(tile.tileX - 1, tile.tileY)) {
        const px = origin.x - 52, py = origin.y + h / 2;
        if (Math.hypot(this.mouseWorld.x - px, this.mouseWorld.y - py) < hitRadius)
          return { tx: tile.tileX - 1, ty: tile.tileY };
      }
      if (!this.app.world.getTile(tile.tileX, tile.tileY + 1)) {
        const px = origin.x + w / 2, py = origin.y + h + 52;
        if (Math.hypot(this.mouseWorld.x - px, this.mouseWorld.y - py) < hitRadius)
          return { tx: tile.tileX, ty: tile.tileY + 1 };
      }
      if (!this.app.world.getTile(tile.tileX, tile.tileY - 1)) {
        const px = origin.x + w / 2, py = origin.y - 52;
        if (Math.hypot(this.mouseWorld.x - px, this.mouseWorld.y - py) < hitRadius)
          return { tx: tile.tileX, ty: tile.tileY - 1 };
      }
    }
    return null;
  }

  _findExtraTileAtMouse() {
    for (const tile of this.app.world.tiles) {
      if (this.app.world.isInitialTile(tile.tileX, tile.tileY)) continue;
      const origin = tile.getOrigin();
      const w = GRID.TILE_WIDTH;
      const h = GRID.TILE_HEIGHT;
      const mx = this.mouseWorld.x, my = this.mouseWorld.y;
      // Only trigger in the border/padding strip (TILE_PADDING wide on each side)
      const edge = GRID.TILE_PADDING;
      if (mx >= origin.x + 4 && mx <= origin.x + w - 4 &&
          my >= origin.y + 4 && my <= origin.y + h - 4) {
        const inEdge = mx < origin.x + edge || mx > origin.x + w - edge ||
                       my < origin.y + edge || my > origin.y + h - edge;
        if (inEdge) return tile;
      }
    }
    return null;
  }

  // ── Delete component ──────────────────────────────────────────────────────
  _deleteComponent(comp) {
    if (this.app.state.lockedComponentIds?.has(comp.id)) return;
    // Remove associated wires
    const compHoles = new Set(comp.getOccupiedHoles());
    this.app.state.wireManager.wires = this.app.state.wireManager.wires.filter(w =>
      !compHoles.has(w.startHoleId) && !compHoles.has(w.endHoleId)
    );
    // Remove component
    this.app.state.components = this.app.state.components.filter(c => c.id !== comp.id);
    // Drop the simulator's drive-state entries (and chip pin couplings) for
    // this component otherwise the orphan keeps stamping voltage at its old
    // hole positions and a replacement chip in the same spot will fight it
    // via MNA voltage divider.
    const sim = this.app.simulator;
    if (sim) sim.purgeComponentStates(new Set([comp.id]));
    if (this.app.currentInfoComp && this.app.currentInfoComp.id === comp.id) {
      this.app._closeInfoPanel();
    }
    this.app.onCircuitChanged();
  }

  // ── Edit test point label ───────────────────────────────────────
  _editTestPointLabel(comp, event) {
    this._showFloatingInput(
      'Test Point Label',
      comp.label || '',
      '',
      (value) => {
        const label = String(value).trim().slice(0, 12);
        if (!label) return;
        this.app.pushUndo();
        comp.label = label;
        this.app.onCircuitChanged();
      },
      event
    );
  }

  // ── Edit clock frequency ────────────────────────────────────────
  _editClockFrequency(comp, event) {
    const presets = [
      { label: '1 Hz',    multiplier: 1,   num: 1 },
      { label: '2 Hz',    multiplier: 1,   num: 2 },
      { label: '5 Hz',    multiplier: 1,   num: 5 },
      { label: '10 Hz',   multiplier: 1,   num: 10 },
      { label: '100 Hz',  multiplier: 1,   num: 100 },
      { label: '1 kHz',   multiplier: 1e3, num: 1 },
      { label: '10 kHz',  multiplier: 1e3, num: 10 },
      { label: '100 kHz', multiplier: 1e3, num: 100 },
      { label: '1 MHz',   multiplier: 1e6, num: 1 },
    ];
    this._showFloatingInput(
      'Clock Frequency',
      this._formatWithPrefix(comp.frequencyHz, 'frequency'),
      '',
      (val) => {
        if (isNaN(val) || val <= 0) return;
        this.app.pushUndo();
        comp.frequencyHz = val;
        this.app.onCircuitChanged();
      },
      event,
      { prefixType: 'frequency', presets }
    );
  }

  // ── Edit crystal frequency ────────────────────────────────────
  // A real crystal's frequency is fixed by its quartz cut — you change it by
  // swapping the can. In this simulator it's only ever useful up to ~50 Hz
  // (faster just blurs the LED — there's no scope), so this is a plain Hz
  // field: no kHz/MHz unit selector, no preset dropdown.
  _editCrystalFrequency(comp, event) {
    this._showFloatingInput(
      'Crystal Frequency (Hz)',
      String(comp.frequencyHz),
      '',
      (value) => {
        const val = parseFloat(value);
        if (isNaN(val) || val <= 0) return;
        this.app.pushUndo();
        comp.frequencyHz = val;
        this.app.onCircuitChanged();
      },
      event
    );
  }

  _editResistance(comp, event) {
    const presets = [
      { label: '1 Ω',    multiplier: 1,    num: 1 },
      { label: '10 Ω',   multiplier: 1,    num: 10 },
      { label: '22 Ω',   multiplier: 1,    num: 22 },
      { label: '47 Ω',   multiplier: 1,    num: 47 },
      { label: '100 Ω',  multiplier: 1,    num: 100 },
      { label: '220 Ω',  multiplier: 1,    num: 220 },
      { label: '330 Ω',  multiplier: 1,    num: 330 },
      { label: '470 Ω',  multiplier: 1,    num: 470 },
      { label: '1 kΩ',   multiplier: 1e3,  num: 1 },
      { label: '2.2 kΩ', multiplier: 1e3,  num: 2.2 },
      { label: '4.7 kΩ', multiplier: 1e3,  num: 4.7 },
      { label: '10 kΩ',  multiplier: 1e3,  num: 10 },
      { label: '22 kΩ',  multiplier: 1e3,  num: 22 },
      { label: '47 kΩ',  multiplier: 1e3,  num: 47 },
      { label: '100 kΩ', multiplier: 1e3,  num: 100 },
      { label: '220 kΩ', multiplier: 1e3,  num: 220 },
      { label: '470 kΩ', multiplier: 1e3,  num: 470 },
      { label: '1 MΩ',   multiplier: 1e6,  num: 1 },
    ];
    this._showFloatingInput(
      'Resistance',
      this._formatWithPrefix(comp.resistance, 'resistance'),
      '',
      (val) => {
        if (isNaN(val) || val <= 0) return;
        this.app.pushUndo();
        comp.setResistance(val);
        this.app.onCircuitChanged();
      },
      event,
      { prefixType: 'resistance', presets }
    );
  }

  // ── Edit capacitor value ──────────────────────────────────────────────────
  _editCapacitance(comp, event) {
    const isPolarized = comp.type === COMP.POLARIZED_CAPACITOR;
    const presets = isPolarized ? [
      { label: '1 µF',    multiplier: 1e-6, num: 1 },
      { label: '2.2 µF',  multiplier: 1e-6, num: 2.2 },
      { label: '4.7 µF',  multiplier: 1e-6, num: 4.7 },
      { label: '10 µF',   multiplier: 1e-6, num: 10 },
      { label: '22 µF',   multiplier: 1e-6, num: 22 },
      { label: '47 µF',   multiplier: 1e-6, num: 47 },
      { label: '100 µF',  multiplier: 1e-6, num: 100 },
      { label: '220 µF',  multiplier: 1e-6, num: 220 },
      { label: '470 µF',  multiplier: 1e-6, num: 470 },
      { label: '1000 µF', multiplier: 1e-6, num: 1000 },
      { label: '2200 µF', multiplier: 1e-6, num: 2200 },
      { label: '4700 µF', multiplier: 1e-6, num: 4700 },
      { label: '5000 µF', multiplier: 1e-6, num: 5000 },
    ] : [
      { label: '10 pF',  multiplier: 1e-12, num: 10 },
      { label: '22 pF',  multiplier: 1e-12, num: 22 },
      { label: '47 pF',  multiplier: 1e-12, num: 47 },
      { label: '100 pF', multiplier: 1e-12, num: 100 },
      { label: '220 pF', multiplier: 1e-12, num: 220 },
      { label: '470 pF', multiplier: 1e-12, num: 470 },
      { label: '1 nF',   multiplier: 1e-9,  num: 1 },
      { label: '2.2 nF', multiplier: 1e-9,  num: 2.2 },
      { label: '4.7 nF', multiplier: 1e-9,  num: 4.7 },
      { label: '10 nF',  multiplier: 1e-9,  num: 10 },
      { label: '22 nF',  multiplier: 1e-9,  num: 22 },
      { label: '47 nF',  multiplier: 1e-9,  num: 47 },
      { label: '100 nF', multiplier: 1e-9,  num: 100 },
      { label: '220 nF', multiplier: 1e-9,  num: 220 },
      { label: '470 nF', multiplier: 1e-9,  num: 470 },
      { label: '1 µF',   multiplier: 1e-6,  num: 1 },
    ];
    this._showFloatingInput(
      'Capacitance',
      this._formatWithPrefix(comp.capacitance, 'capacitance'),
      '',
      (val) => {
        if (isNaN(val) || val <= 0) return;
        this.app.pushUndo();
        comp.setCapacitance(val);
        this.app.onCircuitChanged();
      },
      event,
      { prefixType: 'capacitance', presets }
    );
  }

  // ── Edit inductor value ───────────────────────────────────────────────────
  _editInductance(comp, event) {
    const presets = [
      { label: '100 µH', multiplier: 1e-6, num: 100 },
      { label: '220 µH', multiplier: 1e-6, num: 220 },
      { label: '470 µH', multiplier: 1e-6, num: 470 },
      { label: '1 mH',   multiplier: 1e-3, num: 1 },
      { label: '2.2 mH', multiplier: 1e-3, num: 2.2 },
      { label: '4.7 mH', multiplier: 1e-3, num: 4.7 },
      { label: '10 mH',  multiplier: 1e-3, num: 10 },
      { label: '22 mH',  multiplier: 1e-3, num: 22 },
      { label: '47 mH',  multiplier: 1e-3, num: 47 },
      { label: '100 mH', multiplier: 1e-3, num: 100 },
      { label: '470 mH', multiplier: 1e-3, num: 470 },
      { label: '1 H',    multiplier: 1,    num: 1 },
    ];
    this._showFloatingInput(
      'Inductance',
      this._formatWithPrefix(comp.inductance, 'inductance'),
      '',
      (val) => {
        if (isNaN(val) || val <= 0) return;
        this.app.pushUndo();
        comp.setInductance(val);
        this.app.onCircuitChanged();
      },
      event,
      { prefixType: 'inductance', presets }
    );
  }

  // Format a base-unit value with the most appropriate SI prefix letter AND its
  // unit symbol, so the field reads back as a proper value ("10kΩ", "100nF").
  // The trailing unit is what a user can't easily type (Ω isn't on a keyboard);
  // we add it for them, and _parseWithPrefix ignores it on the way back in.
  // type: 'resistance' → Ω (m…G), 'capacitance' → F / 'inductance' → H (p…bare),
  //       'frequency' → Hz (bare…G).
  _formatWithPrefix(value, type) {
    const unit = { resistance: 'Ω', capacitance: 'F', inductance: 'H', frequency: 'Hz' }[type] || '';
    const tiers = (type === 'resistance')
      ? [
          { s: 'G', m: 1e9  },
          { s: 'M', m: 1e6  },
          { s: 'k', m: 1e3  },
          { s: '',  m: 1    },
          { s: 'm', m: 1e-3 },
        ]
      : (type === 'frequency')
      ? [
          { s: 'G', m: 1e9 },
          { s: 'M', m: 1e6 },
          { s: 'k', m: 1e3 },
          { s: '',  m: 1   },
        ]
      : [
          { s: '',  m: 1     },
          { s: 'm', m: 1e-3  },
          { s: 'u', m: 1e-6  },
          { s: 'n', m: 1e-9  },
          { s: 'p', m: 1e-12 },
        ];
    const v = Math.abs(value);
    for (const t of tiers) {
      if (v >= t.m * 0.9999) return this._formatNum(value / t.m) + t.s + unit;
    }
    return this._formatNum(value) + unit;
  }

  // Parse a string like "3k", "4.7k", "100n", "3mf", "3m" to a raw base-unit number.
  // Supported prefixes: p (1e-12), n (1e-9), u/µ (1e-6), m (1e-3),
  //                     k (1e3), M (1e6), G/g (1e9).
  // Trailing unit letters (f, r, Ω, ohm …) are ignored.
  // Returns NaN if the string cannot be parsed.
  _parseWithPrefix(raw) {
    const s = raw.trim();
    // number  +  optional-prefix-letter  +  optional-trailing-unit-text
    const match = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\s*([pnuµmkMGg]?)([a-zA-ZΩΩµ]*)$/);
    if (!match) return NaN;
    const num = parseFloat(match[1]);
    if (isNaN(num)) return NaN;
    const prefix = match[2];
    const mult = { p: 1e-12, n: 1e-9, u: 1e-6, µ: 1e-6, m: 1e-3,
                   '': 1, k: 1e3, K: 1e3, M: 1e6, G: 1e9, g: 1e9 }[prefix];
    if (mult === undefined) return NaN;
    return num * mult;
  }

  _pickUnit(value, units) {
    const v = Math.abs(value);
    if (v === 0) return units.find(u => u.multiplier === 1) || units[0];
    const sorted = [...units].sort((a, b) => b.multiplier - a.multiplier);
    for (const u of sorted) if (v >= u.multiplier) return u;
    return sorted[sorted.length - 1];
  }

  _formatNum(n) {
    return parseFloat(n.toPrecision(6)).toString();
  }

  // ── Floating input popup ──────────────────────────────────────────────────
  // options.prefixType: 'resistance' | 'capacitance' | 'inductance' | 'frequency'
  //   Replaces the unit dropdown with a "?" prefix-guide button. Callback receives
  //   the final base-unit value (ohms/farads/henries/hertz) parsed from the typed
  //   string. User can type "10k", "4.7k", "100n", "3mf", "10kHz" etc.; the field
  //   redisplays with the unit symbol appended (see _formatWithPrefix).
  // options.units: (legacy) [{label, multiplier}] adds unit dropdown beside input;
  //                callback then receives a number (raw × multiplier).
  // options.defaultUnit: which unit label to pre-select.
  // options.presets: optional [{label, multiplier, num}] common-values dropdown
  //                  shown below the input row; selecting an entry fills the field.
  // No options → text-only input; callback receives the raw string.
  _showFloatingInput(title, defaultValue, placeholder, callback, event, options = null) {
    const existing = document.getElementById('floating input-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'floating input-overlay';
    overlay.className = 'floating input-panel';
    overlay.style.left = (event.clientX + 8) + 'px';
    overlay.style.top  = (event.clientY - 16) + 'px';

    const units      = options?.units;
    const defaultUnit = options?.defaultUnit;
    const presets    = options?.presets;
    const prefixType = options?.prefixType;  // 'resistance' | 'capacitance'

    const unitsHTML = units ? `
      <select class="floating input-units" id="floating input-units">
        ${units.map(u => `<option value="${u.multiplier}"${u.label === defaultUnit ? ' selected' : ''}>${u.label}</option>`).join('')}
      </select>
    ` : '';

    const helpBtnHTML = prefixType
      ? `<button class="floating-input-help-btn" id="floating-input-help-btn" tabindex="-1" title="Prefix guide">?</button>`
      : '';

    const presetsHTML = presets ? `
      <select class="floating input-presets" id="floating input-presets">
        <option value="">Standard values</option>
        ${presets.map((p, i) => `<option value="${i}">${p.label}</option>`).join('')}
      </select>
    ` : '';

    // Help tooltip content (shown when "?" is clicked): a plain SI-prefix ladder,
    // pico up to giga. Same guide for every field — only the letter you type
    // changes; the unit symbol (Ω/F/H/Hz) is optional and filled in for you.
    const prefixRows = [
      ['pico',  'p',     '10⁻¹²'],
      ['nano',  'n',     '10⁻⁹'],
      ['micro', 'µ / u', '10⁻⁶'],
      ['milli', 'm',     '10⁻³'],
      ['(base)', '1',    '10⁰'],
      ['kilo',  'k',     '10³'],
      ['mega',  'M',     '10⁶'],
      ['giga',  'G',     '10⁹'],
    ];
    const helpTooltipHTML = prefixType ? `
      <div class="floating-input-help-tooltip" id="floating-input-help-tooltip">
        ${prefixRows.map(([name, sym, pow]) =>
          `<div class="fih-row">
            <span class="fih-name">${name}</span>
            <span class="fih-sym">${sym}</span>
            <span class="fih-pow">${pow}</span>
          </div>`
        ).join('')}
      </div>
    ` : '';

    overlay.innerHTML = `
      <div class="floating input-title-row">
        <div class="floating input-title">${title}</div>
        <button class="floating input-x-btn" id="floating input-x-btn">×</button>
      </div>
      <div class="floating input-row">
        <input type="text" class="floating input-field" id="floating input-field"
               value="${defaultValue}" placeholder="${placeholder}" autocomplete="off" spellcheck="false">
        ${unitsHTML}
        ${helpBtnHTML}
      </div>
      ${presetsHTML}
      ${helpTooltipHTML}
    `;

    document.body.appendChild(overlay);

    const input        = document.getElementById('floating input-field');
    const unitsSelect  = units      ? document.getElementById('floating input-units')        : null;
    const presetsSelect = presets   ? document.getElementById('floating input-presets')      : null;
    const helpBtn      = prefixType ? document.getElementById('floating-input-help-btn')     : null;
    const helpTooltip  = prefixType ? document.getElementById('floating-input-help-tooltip') : null;

    // "?" button toggles the prefix guide
    if (helpBtn && helpTooltip) {
      helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = helpTooltip.classList.toggle('visible');
        helpBtn.classList.toggle('active', open);
      });
    }

    if (presetsSelect) {
      presetsSelect.addEventListener('change', () => {
        const idx = presetsSelect.value;
        if (idx === '') return;
        const p = presets[parseInt(idx, 10)];
        if (prefixType) {
          input.value = this._formatWithPrefix(p.num * p.multiplier, prefixType);
        } else {
          input.value = this._formatNum(p.num);
          if (unitsSelect) {
            for (const opt of unitsSelect.options) {
              if (parseFloat(opt.value) === p.multiplier) { unitsSelect.value = opt.value; break; }
            }
          }
        }
        presetsSelect.value = ''; // reset so same value can be re-selected
        input.focus();
        input.select();
      });
    }

    const confirm = () => {
      const raw = input.value.trim();
      overlay.remove();
      if (!raw) return;
      if (prefixType) {
        const val = this._parseWithPrefix(raw);
        if (isNaN(val)) return;
        callback(val);
      } else if (units) {
        const num = parseFloat(raw);
        if (isNaN(num)) return;
        callback(num * parseFloat(unitsSelect.value));
      } else {
        callback(raw);
      }
    };
    const cancel = () => overlay.remove();

    document.getElementById('floating input-x-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      cancel();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirm();
      if (e.key === 'Escape') cancel();
      e.stopPropagation(); // prevent board hotkeys while typing
    });

    if (unitsSelect) {
      unitsSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') cancel();
        e.stopPropagation();
      });
    }
    if (presetsSelect) {
      presetsSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') cancel();
        e.stopPropagation();
      });
    }

    // Click outside → cancel
    setTimeout(() => {
      const outsideClick = (e) => {
        if (!overlay.contains(e.target)) {
          cancel();
          document.removeEventListener('mousedown', outsideClick);
        }
      };
      document.addEventListener('mousedown', outsideClick);
    }, 0);

    input.focus();
    input.select();
  }

  // ── Get state for renderer ────────────────────────────────────────────────
  getDrawState() {
    return {
      ghost: this.ghost,
      wireStart: this.wireStart ? this.wireStart : this.app.state.wireStart,
      mouseWorld: this.app.state.mouseWorld || this.mouseWorld,
    };
  }
}
