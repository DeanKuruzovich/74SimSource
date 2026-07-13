// ── Canvas Renderer ──────────────────────────────────────────────────────────
// Draws the breadboard grid, components, wire endpoints, and overlays
// onto an HTML5 Canvas with pan/zoom support.

import { GRID, COLORS, REALISTIC_COLORS, COMP, SNAP_RADIUS, getFamilySpec } from './constants.js';

// Replaces the `74x` placeholder in chip names with the selected family letters
// so the DIP package renders as `74LS00`, `74HC00`, or `74HCT00`.
// Per-chip override (comp.chipFamily) wins over the project default (state.chipFamily).
function chipDisplayName(comp, state) {
  if (state && state.showSimpleChipNames && comp.chipId) {
    return comp.chipDef?.simpleName || comp.chipId;
  }
  const raw = comp.name || '';
  const label = getFamilySpec(comp?.chipFamily ?? state?.chipFamily).label;
  return raw.replace(/^74x/, label);
}

export class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world; // BreadboardWorld

    // Camera / viewport
    this.offsetX = 50;
    this.offsetY = 50;
    this.zoom = 1;

    // ── Power-node caches (avoids rebuilding every animation frame) ─────────
    // Topology cache: invalidated when wire count changes.
    this._topoCache = null;
    this._topoCacheWireCount = -1;
    // Sim-based cache: invalidated when simulator.simVersion changes.
    this._simPowerCache = null;
    this._simPowerCacheVersion = -1;

    // Optional callback (set by the app) invoked after every resize so the
    // owner can mark its frame dirty and repaint immediately — otherwise a
    // resized canvas stays cleared until the next redraw, flashing the dark
    // page background through.
    this.onResize = null;

    this._resize();

    // Track container size with a ResizeObserver rather than only the window
    // 'resize' event. The window event fires *before* the flex layout settles
    // when Chrome DevTools docks/undocks/closes, so getBoundingClientRect()
    // returns a stale (smaller) width and the canvas gets locked too narrow —
    // leaving a "black bar" strip on the right where the page background shows
    // through. ResizeObserver fires after layout with the true content-box size
    // and catches every size change, so it fixes that case. We keep a window
    // 'resize' listener as well, only to catch devicePixelRatio changes (moving
    // the window between monitors / browser zoom), which don't change the CSS
    // box and so wouldn't trip the observer.
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._resize());
      this._resizeObserver.observe(this.canvas.parentElement);
    } else {
      window.addEventListener('resize', () => this._resize());
    }
    this._lastDpr = window.devicePixelRatio || 1;
    window.addEventListener('resize', () => {
      const dpr = window.devicePixelRatio || 1;
      if (dpr !== this._lastDpr) { this._lastDpr = dpr; this._resize(); }
    });
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    // Round to whole device pixels so a fractional dpr can't leave a sub-pixel
    // gap between the canvas and the container edge.
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    // Skip no-op resizes: reassigning canvas.width/height clears the canvas
    // even when the value is unchanged, which would flash on every observer tick.
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.screenW = rect.width;
    this.screenH = rect.height;
    if (this.onResize) this.onResize();
  }

  // ── Coordinate transforms ────────────────────────────────────────────────
  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.offsetX,
      y: wy * this.zoom + this.offsetY,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.zoom,
      y: (sy - this.offsetY) / this.zoom,
    };
  }

  // ── Main draw loop ───────────────────────────────────────────────────────
  draw(state) {
    const ctx = this.ctx;
    ctx.save();

    // Clear
    if (state.showRealisticBoard) {
      // Soft workbench vignette — center slightly lifted, edges fall off dark
      const vg = ctx.createRadialGradient(
        this.screenW / 2, this.screenH * 0.42, 0,
        this.screenW / 2, this.screenH * 0.50, Math.max(this.screenW, this.screenH) * 0.72
      );
      vg.addColorStop(0, '#3c3c30');
      vg.addColorStop(1, '#22221a');
      ctx.fillStyle = vg;
    } else {
      ctx.fillStyle = COLORS.BG;
    }
    ctx.fillRect(0, 0, this.screenW, this.screenH);

    // Apply camera transform
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.zoom, this.zoom);

    // Draw each breadboard tile
    for (const tile of this.world.tiles) {
      this._drawTile(ctx, tile, state);
    }

    // Topology-based power map only wires physically touching a power rail
    // are labelled VCC/GND. Never changes due to simulation state (button presses, etc.)
    // Cache by simVersion (incremented on every evaluate()) AND wire count so
    // that adding/removing/moving wires always rebuilds the map.
    const wireCount = state.wireManager.wires.length;
    const simVer = state.simulator?.simVersion ?? -1;
    if (this._topoCache === null ||
        wireCount !== this._topoCacheWireCount ||
        simVer !== this._simPowerCacheVersion) {
      this._topoCache = this._buildPowerNodes(state.wireManager.wires);
      this._topoCacheWireCount = wireCount;
    }
    const topologicalPowerNodes = this._topoCache;

    // Simulation-based power map used only for the glow/current-dot layer so
    // that powered wires light up when a button is pressed, but net labels stay stable.
    // Cache by simulator.simVersion invalidated after each evaluate() / time step.
    let simPowerNodes;
    if (!state.simulator) {
      simPowerNodes = topologicalPowerNodes;
    } else if (state.showNetPower) {
      if (this._simPowerCache === null || simVer !== this._simPowerCacheVersion) {
        this._simPowerCache = this._buildPowerNodesFromSim(state.wireManager.wires, state.simulator);
        this._simPowerCacheVersion = simVer;
      }
      simPowerNodes = this._simPowerCache;
    } else {
      // showNetPower is off skip the expensive build entirely
      simPowerNodes = topologicalPowerNodes;
    }

    // Build skip set for wires currently being dragged they're rendered
    // separately inside the drag-translate block so they follow the cursor.
    const movingWireIds = new Set();
    if (state.movingWires) {
      for (const mw of state.movingWires) movingWireIds.add(mw.wire.id);
    }
    // Partial endpoint moves: skip these items in normal passes; drawn separately
    // after ctx.restore() so fixed end stays put and moving end follows cursor.
    const partialCompIds = new Set();
    if (state.partialEndpointMoves) {
      for (const pe of state.partialEndpointMoves) {
        if (pe.kind === 'wire')  movingWireIds.add(pe.ref.id);
        else                     partialCompIds.add(pe.ref.id);
      }
    }

    // Draw powered-wire glow + current-flow dots (toggled by showNetPower)
    if (state.showNetPower) {
      const wires = movingWireIds.size > 0
        ? state.wireManager.wires.filter(w => !movingWireIds.has(w.id))
        : state.wireManager.wires;
      this._drawPoweredWires(ctx, wires, simPowerNodes, state.simulator);
    }

    // Bottom layer: chips, 7-seg, slide switches drawn first (behind wires/terminals)
    const BOTTOM_TYPES = new Set([COMP.CHIP, COMP.SEVEN_SEG, COMP.SLIDE_SWITCH, COMP.DIP_SWITCH]);
    for (const comp of state.components) {
      if (!comp.placed) continue;
      if (!BOTTOM_TYPES.has(comp.type)) continue;
      if (state.draggingCompEp && state.draggingCompEp.comp.id === comp.id) continue;
      if (partialCompIds.has(comp.id)) continue;
      this._drawComponent(ctx, comp, state);
    }

    // Wire endpoints drawn above chips/7-seg/slide switches but below top-layer components
    this._drawWireEndpoints(ctx, state, topologicalPowerNodes, state.simulator, movingWireIds);

    // Top layer: buttons, switches, LEDs, resistors drawn on top of wire terminals
    for (const comp of state.components) {
      if (!comp.placed) continue;
      if (BOTTOM_TYPES.has(comp.type)) continue;
      if (state.draggingCompEp && state.draggingCompEp.comp.id === comp.id) continue;
      if (partialCompIds.has(comp.id)) continue;
      this._drawComponent(ctx, comp, state);
    }

    // Short-circuit highlight: red rings on every wire endpoint and component pin
    // belonging to a VCC↔GND shorted net. Drawn above components so the user can
    // identify the conducting bridge at a glance.
    this._drawShortHighlights(ctx, state);

    // Draw node values (voltage + current) overlay when enabled
    if (state.showValues) {
      this._drawNodeValues(ctx, state);
    }

    // Resistor/Capacitor labels drawn last always on top of leads/body/wires
    this._drawResistorLabels(ctx, state, partialCompIds);

    // Drag-translate: during MOVE_COMP, ghosts and moving wires are rendered
    // shifted by (cursor − initial-click) so they smoothly follow the mouse.
    // The underlying snapped positions are still tracked for commit/validation.
    const dragOffset = state.dragPixelOffset;
    if (dragOffset) { ctx.save(); ctx.translate(dragOffset.x, dragOffset.y); }

    // Draw ghost (placement preview)
    if (state.ghost) {
      this._drawGhost(ctx, state.ghost, state);
    }
    // Draw secondary ghosts (multi-component drag-move)
    if (state.ghosts && state.ghosts.length > 0) {
      for (const g of state.ghosts) {
        if (g && g.placed) this._drawGhost(ctx, g, state);
      }
    }
    // Draw selected wires that are part of the drag at original positions,
    // visually shifted by the translate so they follow the cursor.
    if (state.movingWires && state.movingWires.length > 0) {
      for (const mw of state.movingWires) {
        this._drawWireEndpoint(ctx, mw.wire.startHoleId, mw.wire.startNet, mw.wire.color, state.simulator);
        this._drawWireEndpoint(ctx, mw.wire.endHoleId,   mw.wire.endNet,   mw.wire.color, state.simulator);
      }
    }
    // Draw paste-preview ghost wires as faded endpoint discs at the snapped
    // positions, matching the chip ghost's translucent style.
    if (state.ghostWires && state.ghostWires.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      for (const gw of state.ghostWires) {
        this._drawGhostWireEndpoint(ctx, gw.startHoleId, gw.color);
        this._drawGhostWireEndpoint(ctx, gw.endHoleId,   gw.color);
      }
      ctx.restore();
    }

    if (dragOffset) { ctx.restore(); }

    // Partial endpoint moves: items where only one endpoint was in the selection rect.
    // Fixed end drawn at original world position; moving end drawn at candidate hole
    // (snapped) or approximate translated pixel when off-board.
    if (state.partialEndpointMoves && state.partialEndpointMoves.length > 0 && state.dragPixelOffset) {
      const doff = state.dragPixelOffset;
      for (const pe of state.partialEndpointMoves) {
        if (pe.kind === 'wire') {
          const wire = pe.ref;
          const fixedNet  = pe.movedEnd === 'start' ? wire.endNet   : wire.startNet;
          const movingNet = pe.movedEnd === 'start' ? wire.startNet : wire.endNet;
          // Fixed endpoint draw at original world position (no translate)
          this._drawWireEndpoint(ctx, pe.fixedHoleId, fixedNet, wire.color, state.simulator);
          // Moving endpoint draw at candidate hole or approximate position
          if (pe.candidateHoleId) {
            this._drawWireEndpoint(ctx, pe.candidateHoleId, movingNet, wire.color, state.simulator);
          } else {
            const mp = { x: pe.movingPx.x + doff.x, y: pe.movingPx.y + doff.y };
            ctx.beginPath();
            ctx.arc(mp.x, mp.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = wire.color || COLORS.WIRE_DEFAULT || '#888';
            ctx.fill();
          }
        } else if (pe.kind === 'comp' && pe.ghost && pe.ghost.placed) {
          // Draw the ghost component at its updated position
          this._drawGhost(ctx, pe.ghost, state);
        }
      }
    }

    // Live drag preview for 2-terminal components: draws the actual component
    // body following the cursor (clamped to max lead length) instead of a
    // simple dashed line. Falls through to the wire preview otherwise.
    if (state.compDragPreview) {
      this._drawCompDragPreview(ctx, state);
    } else if (state.wireStart && state.mouseWorld) {
      this._drawWirePreview(ctx, state);
    }

    // Draw hover highlight also shown during drag-move so the user can see
    // the snap target while the ghost smoothly follows the cursor.
    if (state.hoveredHole && (!state.ghost || dragOffset)) {
      const pos = this.world.getHolePosById(state.hoveredHole.id);
      if (pos) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, GRID.HOLE_RADIUS + 3, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.HOLE_HOVER;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Selection highlights
    if (state.selectedItems && state.selectedItems.length > 0) {
      // When more than 3 component/wire items are selected, draw a single
      // combined bounding box around all of them instead of per-item outlines.
      const groupable = state.selectedItems.filter(i => i.type === 'component' || i.type === 'wire');
      const useCombined = groupable.length > 3;

      if (useCombined) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let anyMoving = false;
        const addPt = (p) => {
          if (!p) return;
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        };
        for (const item of groupable) {
          if (item.type === 'component') {
            let drawComp = item.ref;
            if (state.movingComp && item.ref === state.movingComp && state.ghost && state.ghost.placed) {
              drawComp = state.ghost; anyMoving = true;
            } else if (state.movingCompItems && state.movingCompItems.length > 0) {
              const mover = state.movingCompItems.find(m => m.comp === item.ref);
              if (mover && mover.ghost && mover.ghost.placed) { drawComp = mover.ghost; anyMoving = true; }
            }
            if (!drawComp.placed) continue;
            for (const pin of drawComp.pins) addPt(this.world.getHolePosById(pin.holeId));
          } else if (item.type === 'wire') {
            if (movingWireIds.has(item.ref.id)) anyMoving = true;
            addPt(this.world.getHolePosById(item.ref.startHoleId));
            addPt(this.world.getHolePosById(item.ref.endHoleId));
          }
        }
        if (isFinite(minX)) {
          const pad = 12;
          ctx.save();
          if (anyMoving && dragOffset) ctx.translate(dragOffset.x, dragOffset.y);
          ctx.strokeStyle = COLORS.SELECTION;
          ctx.fillStyle = 'rgba(255,255,255,0.04)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.fillRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
          ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
          ctx.setLineDash([]);
          ctx.restore();
        }
        // Still draw breadboard selection highlights individually
        for (const item of state.selectedItems) {
          if (item.type === 'breadboard') this._drawBreadboardSelection(ctx, item);
        }
      } else {
        for (const item of state.selectedItems) {
          if (item.type === 'component') {
            // During a drag-move, draw the selection outline on the ghost so it
            // follows the cursor rather than staying at the original position.
            let drawComp = item.ref;
            let isMoving = false;
            if (state.movingComp && item.ref === state.movingComp && state.ghost && state.ghost.placed) {
              drawComp = state.ghost; isMoving = true;
            } else if (state.movingCompItems && state.movingCompItems.length > 0) {
              const mover = state.movingCompItems.find(m => m.comp === item.ref);
              if (mover && mover.ghost && mover.ghost.placed) { drawComp = mover.ghost; isMoving = true; }
            }
            if (isMoving && dragOffset) {
              ctx.save(); ctx.translate(dragOffset.x, dragOffset.y);
              this._drawSelection(ctx, drawComp);
              ctx.restore();
            } else {
              this._drawSelection(ctx, drawComp);
            }
          } else if (item.type === 'wire') {
            const isMovingWire = movingWireIds.has(item.ref.id);
            if (isMovingWire && dragOffset) {
              ctx.save(); ctx.translate(dragOffset.x, dragOffset.y);
              this._drawWireSelection(ctx, item.ref);
              ctx.restore();
            } else {
              this._drawWireSelection(ctx, item.ref);
            }
          } else if (item.type === 'breadboard') {
            this._drawBreadboardSelection(ctx, item);
          }
        }
      }
    }

    // Live rubber-band selection rectangle
    if (state.selectRect) {
      const { x1, y1, x2, y2 } = state.selectRect;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = COLORS.SELECTION;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore();
  }

  // ── Breadboard Tile ──────────────────────────────────────────────────────
  _drawTile(ctx, tile, state) {
    if (state.showRealisticBoard) {
      this._drawTileRealistic(ctx, tile, state);
      return;
    }
    const origin = tile.getOrigin();
    const w = GRID.TILE_WIDTH;
    const h = GRID.TILE_HEIGHT;

    // Board background
    ctx.fillStyle = COLORS.BOARD_BG;
    ctx.fillRect(origin.x + 4, origin.y + 4, w - 8, h - 8);
    ctx.strokeStyle = COLORS.BOARD_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(origin.x + 4, origin.y + 4, w - 8, h - 8);

    // Power rail markings
    this._drawPowerRails(ctx, tile);

    // Center channel
    const channelY = origin.y + GRID.TILE_PADDING + GRID.POWER_RAIL_HEIGHT + GRID.POWER_RAIL_GAP + GRID.HALF_HEIGHT;
    const channelBarH = Math.round((GRID.CHANNEL_GAP - 4) * 0.7);
    ctx.fillStyle = COLORS.CHANNEL;
    ctx.fillRect(origin.x + GRID.TILE_PADDING - 4, channelY + (GRID.CHANNEL_GAP - channelBarH) / 2, (GRID.COLS - 1) * GRID.HOLE_SPACING + 8, channelBarH);

    // Occupied holes set (for dimming)
    const occupied = new Set();
    for (const comp of state.components) {
      if (comp.placed) {
        for (const p of comp.pins) {
          occupied.add(p.holeId);
        }
      }
    }

    // Main grid holes
    for (let col = 0; col < GRID.COLS; col++) {
      for (let row = 0; row < 10; row++) {
        const pos = tile.getMainHolePos(col, row);
        const hid = `${tile.tileX}:${tile.tileY}:main:${col}:${row}`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, GRID.HOLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = occupied.has(hid) ? COLORS.HOLE_OCCUPIED : COLORS.HOLE;
        ctx.fill();
      }
    }

    // Power rail holes 10 groups of 5, one-hole gap between groups
    // Groups start at col 2: cols 2-6, 8-12, 14-18, ..., 56-60
    for (let col = 0; col < GRID.COLS; col++) {
      const oc = col - 2;
      if (oc < 0 || oc >= 59 || oc % 6 === 5) continue;
      for (let row = 0; row < 4; row++) {
        const pos = tile.getPowerHolePos(col, row);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, GRID.HOLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = (row === 1 || row === 3) ? COLORS.POWER_PLUS : COLORS.POWER_MINUS;
        ctx.fill();
      }
    }

    // Row labels
    ctx.font = '10px monospace';
    ctx.fillStyle = COLORS.TEXT_DIM;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const labels = 'ABCDEFGHIJ';
    for (let r = 0; r < 10; r++) {
      const pos = tile.getMainHolePos(0, r);
      ctx.fillText(labels[r], pos.x - 10, pos.y);
    }

    // Column numbers (every 5)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let c = 0; c < GRID.COLS; c += 5) {
      const pos = tile.getMainHolePos(c, 0);
      ctx.fillText(String(c + 1), pos.x, pos.y - 10);
    }

    // Big "+" buttons in all 4 directions where there is no neighbour tile
    ctx.save();
    ctx.font = 'bold 56px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (!this.world.getTile(tile.tileX + 1, tile.tileY)) {
      ctx.fillText('+', origin.x + w + 52, origin.y + h / 2);
    }
    if (!this.world.getTile(tile.tileX - 1, tile.tileY)) {
      ctx.fillText('+', origin.x - 52, origin.y + h / 2);
    }
    if (!this.world.getTile(tile.tileX, tile.tileY + 1)) {
      ctx.fillText('+', origin.x + w / 2, origin.y + h + 52);
    }
    if (!this.world.getTile(tile.tileX, tile.tileY - 1)) {
      ctx.fillText('+', origin.x + w / 2, origin.y - 52);
    }
    ctx.restore();
  }

  _drawPowerRails(ctx, tile) {
    const origin = tile.getOrigin();
    const startX = origin.x + GRID.TILE_PADDING;

    const topPlusY  = origin.y + GRID.TILE_PADDING;
    const topMinusY = origin.y + GRID.TILE_PADDING + GRID.POWER_RAIL_HEIGHT;
    const botMinusY = origin.y + GRID.TILE_HEIGHT - GRID.TILE_PADDING - GRID.POWER_RAIL_HEIGHT;
    const botPlusY  = origin.y + GRID.TILE_HEIGHT - GRID.TILE_PADDING;

    // Draw lines as 10 segments matching the hole groups (cols 2-6, 8-12, ..., 56-60)
    const drawSegLines = (y, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let k = 0; k < 10; k++) {
        const sx = origin.x + GRID.TILE_PADDING + (2 + k * 6) * GRID.HOLE_SPACING - 1;
        const ex = origin.x + GRID.TILE_PADDING + (6 + k * 6) * GRID.HOLE_SPACING + 1;
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(ex, y);
        ctx.stroke();
      }
    };

    drawSegLines(topPlusY,  COLORS.POWER_MINUS_MARK);
    drawSegLines(topMinusY, COLORS.POWER_PLUS_MARK);
    drawSegLines(botMinusY, COLORS.POWER_MINUS_MARK);
    drawSegLines(botPlusY,  COLORS.POWER_PLUS_MARK);

    // + / - labels
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.POWER_MINUS_MARK;
    ctx.fillText('−', startX - 12, topPlusY);
    ctx.fillStyle = COLORS.POWER_PLUS_MARK;
    ctx.fillText('+', startX - 12, topMinusY);
    ctx.fillText('+', startX - 12, botPlusY);
    ctx.fillStyle = COLORS.POWER_MINUS_MARK;
    ctx.fillText('−', startX - 12, botMinusY);

    ctx.setLineDash([]);
  }

  // ── Realistic Breadboard Tile ─────────────────────────────────────────────
  _drawTileRealistic(ctx, tile, state) {
    const RC = REALISTIC_COLORS;
    const origin = tile.getOrigin();
    const w = GRID.TILE_WIDTH;
    const h = GRID.TILE_HEIGHT;

    // Drop shadow — soft and mostly downward, like a board resting on a bench
    ctx.save();
    ctx.shadowColor = 'rgba(10, 8, 2, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = RC.BOARD_BG;
    ctx.beginPath();
    ctx.roundRect(origin.x + 4, origin.y + 4, w - 8, h - 8, 7);
    ctx.fill();
    ctx.restore();

    // Board body with subtle gradient (top highlight → slightly darker bottom)
    const bodyGrad = ctx.createLinearGradient(origin.x, origin.y, origin.x, origin.y + h);
    bodyGrad.addColorStop(0,   '#fbf7f0');
    bodyGrad.addColorStop(0.5, '#f5f0e8');
    bodyGrad.addColorStop(1,   '#eae3d4');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(origin.x + 4, origin.y + 4, w - 8, h - 8, 7);
    ctx.fill();

    // Edge bevel: light catch along the top edge, shaded lower edge — makes
    // the plastic slab read as having thickness instead of a flat sticker.
    const bevelGrad = ctx.createLinearGradient(origin.x, origin.y, origin.x, origin.y + h);
    bevelGrad.addColorStop(0,    'rgba(255,255,255,0.85)');
    bevelGrad.addColorStop(0.12, 'rgba(255,255,255,0.25)');
    bevelGrad.addColorStop(0.85, 'rgba(140,125,100,0.18)');
    bevelGrad.addColorStop(1,    'rgba(120,105,80,0.55)');
    ctx.strokeStyle = bevelGrad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(origin.x + 5, origin.y + 5, w - 10, h - 10, 6);
    ctx.stroke();

    // Board outline
    ctx.strokeStyle = RC.BOARD_BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(origin.x + 4, origin.y + 4, w - 8, h - 8, 7);
    ctx.stroke();

    // ── Power rail lines ─────────────────────────────────────────────────────
    // Top section  (top→bottom): red line | + holes |   holes | blue line
    // Bottom section (top→bottom): blue line |   holes | + holes | red line
    const startX = origin.x + GRID.TILE_PADDING;
    const railW  = (GRID.COLS - 1) * GRID.HOLE_SPACING;
    const topPlusY  = origin.y + GRID.TILE_PADDING;
    const topMinusY = topPlusY + GRID.POWER_RAIL_HEIGHT;
    const botMinusY = origin.y + h - GRID.TILE_PADDING - GRID.POWER_RAIL_HEIGHT;
    const botPlusY  = origin.y + h - GRID.TILE_PADDING;
    const railOff = 7;

    // Draw rail stripes as 10 segments matching hole groups (cols 2-6, 8-12, ..., 56-60)
    const drawRealisticSegLines = (y, color) => {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.82;   // printed-ink look rather than solid plastic
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.setLineDash([]);
      for (let k = 0; k < 10; k++) {
        const sx = origin.x + GRID.TILE_PADDING + (2 + k * 6) * GRID.HOLE_SPACING - 6;
        const ex = origin.x + GRID.TILE_PADDING + (6 + k * 6) * GRID.HOLE_SPACING + 6;
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(ex, y);
        ctx.stroke();
      }
    };
    drawRealisticSegLines(topPlusY  - railOff, RC.POWER_PLUS_MARK);
    drawRealisticSegLines(botPlusY  + railOff, RC.POWER_PLUS_MARK);
    drawRealisticSegLines(topMinusY + railOff, RC.POWER_MINUS_MARK);
    drawRealisticSegLines(botMinusY - railOff, RC.POWER_MINUS_MARK);
    ctx.globalAlpha = 1;

    // Rail +/- labels
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = RC.POWER_PLUS_MARK;
    ctx.fillText('+', startX - 12, topPlusY);
    ctx.fillText('+', startX - 12, botPlusY);
    ctx.fillStyle = RC.POWER_MINUS_MARK;
    ctx.fillText('−', startX - 12, topMinusY);
    ctx.fillText('−', startX - 12, botMinusY);

    // ── Center channel (recessed groove between the two halves) ───────────
    const channelY = origin.y + GRID.TILE_PADDING + GRID.POWER_RAIL_HEIGHT + GRID.POWER_RAIL_GAP + GRID.HALF_HEIGHT;
    const channelBarH = Math.round((GRID.CHANNEL_GAP - 4) * 0.7);
    const chX = origin.x + GRID.TILE_PADDING - 4;
    const chY = channelY + (GRID.CHANNEL_GAP - channelBarH) / 2;
    const chW = railW + 8;
    // Groove floor: darker than the board face, with the top wall in shadow
    // and the bottom lip catching light — reads as an actual recess.
    const chGrad = ctx.createLinearGradient(0, chY, 0, chY + channelBarH);
    chGrad.addColorStop(0,    '#b7ac97');
    chGrad.addColorStop(0.18, '#cfc5b0');
    chGrad.addColorStop(0.8,  '#dbd2bf');
    chGrad.addColorStop(1,    '#c9bfa9');
    ctx.fillStyle = chGrad;
    ctx.fillRect(chX, chY, chW, channelBarH);
    // Crisp shadow line under the top lip
    ctx.strokeStyle = 'rgba(90, 78, 58, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chX, chY + 0.5);
    ctx.lineTo(chX + chW, chY + 0.5);
    ctx.stroke();
    // Bright catch on the bottom lip (just below the groove)
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(chX, chY + channelBarH + 0.5);
    ctx.lineTo(chX + chW, chY + channelBarH + 0.5);
    ctx.stroke();
    // Faint engraved line along the groove center
    ctx.strokeStyle = 'rgba(150, 138, 112, 0.5)';
    ctx.beginPath();
    ctx.moveTo(chX, channelY + GRID.CHANNEL_GAP / 2);
    ctx.lineTo(chX + chW, channelY + GRID.CHANNEL_GAP / 2);
    ctx.stroke();

    // ── Occupied holes set ─────────────────────────────────────────────────
    const occupied = new Set();
    for (const comp of state.components) {
      if (comp.placed) {
        for (const p of comp.pins) occupied.add(p.holeId);
      }
    }

    // ── Main grid holes ────────────────────────────────────────────────────
    for (let col = 0; col < GRID.COLS; col++) {
      for (let row = 0; row < 10; row++) {
        const pos = tile.getMainHolePos(col, row);
        const hid = `${tile.tileX}:${tile.tileY}:main:${col}:${row}`;
        this._drawRealisticHole(ctx, pos.x, pos.y, occupied.has(hid));
      }
    }

    // ── Power rail holes 10 groups of 5, one-hole gap between groups ──
    // Groups: cols 2-6, 8-12, 14-18, ..., 56-60
    for (let col = 0; col < GRID.COLS; col++) {
      const oc = col - 2;
      if (oc < 0 || oc >= 59 || oc % 6 === 5) continue;
      for (let row = 0; row < 4; row++) {
        const pos = tile.getPowerHolePos(col, row);
        const isPlus = (row === 0 || row === 3);
        this._drawRealisticPowerHole(ctx, pos.x, pos.y, isPlus);
      }
    }

    // ── Row labels ─────────────────────────────────────────────────────────
    ctx.font = '10px sans-serif';
    ctx.fillStyle = RC.LABEL_INK;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const labels = 'ABCDEFGHIJ';
    for (let r = 0; r < 10; r++) {
      const pos = tile.getMainHolePos(0, r);
      ctx.fillText(labels[r], pos.x - 10, pos.y);
    }

    // Column numbers (every 5)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let c = 0; c < GRID.COLS; c += 5) {
      const pos = tile.getMainHolePos(c, 0);
      ctx.fillText(String(c + 1), pos.x, pos.y - 10);
    }

    // ── Add-tile "+" buttons ───────────────────────────────────────────────
    ctx.save();
    ctx.font = 'bold 56px monospace';
    ctx.fillStyle = 'rgba(120,100,60,0.25)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (!this.world.getTile(tile.tileX + 1, tile.tileY))
      ctx.fillText('+', origin.x + w + 52, origin.y + h / 2);
    if (!this.world.getTile(tile.tileX - 1, tile.tileY))
      ctx.fillText('+', origin.x - 52,     origin.y + h / 2);
    if (!this.world.getTile(tile.tileX, tile.tileY + 1))
      ctx.fillText('+', origin.x + w / 2,  origin.y + h + 52);
    if (!this.world.getTile(tile.tileX, tile.tileY - 1))
      ctx.fillText('+', origin.x + w / 2,  origin.y - 52);
    ctx.restore();
  }

  /** Draw a single realistic main-grid hole at (x,y).
   *  A recessed square aperture in cream plastic: shaded chamfer above,
   *  light catch below, dark warm interior. Flat fills only — this runs for
   *  every hole on every tile, so no gradient allocation here. */
  _drawRealisticHole(ctx, x, y, occupied) {
    const r = GRID.HOLE_RADIUS;
    // Light catch on the bottom lip (light comes from the top of the screen)
    ctx.beginPath();
    ctx.roundRect(x - r - 0.5, y - r + 0.9, (r + 0.5) * 2, r * 2, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fill();
    // Shaded chamfer ring, biased upward
    ctx.beginPath();
    ctx.roundRect(x - r - 0.5, y - r - 0.9, (r + 0.5) * 2, r * 2, 2);
    ctx.fillStyle = 'rgba(126, 110, 86, 0.5)';
    ctx.fill();
    // Dark warm interior
    ctx.beginPath();
    ctx.roundRect(x - r + 0.2, y - r + 0.2, r * 2 - 0.4, r * 2 - 0.4, 1.6);
    ctx.fillStyle = occupied ? '#3a2a18' : '#221a10';
    ctx.fill();
    // Hint of the metal contact leaf inside the aperture
    ctx.fillStyle = occupied ? 'rgba(200,170,120,0.28)' : 'rgba(190,175,150,0.20)';
    ctx.fillRect(x - r + 1, y + r - 2.1, r * 2 - 2, 1.1);
  }

  /** Draw a power-rail hole — same recessed aperture as the main grid. */
  _drawRealisticPowerHole(ctx, x, y, isPlus) {
    this._drawRealisticHole(ctx, x, y, false);
  }

  // ── Realistic Component Renderers ─────────────────────────────────────────

  /** Realistic 5mm through-hole LED, seen from above: round lens between the
   *  two pin holes, flange with a flat spot on the cathode side, reflector
   *  cup and die visible through the translucent plastic. */
  _drawLEDRealistic(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const cPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !cPos) return;

    const cs = this._ledColorScheme(comp.color || 'red');
    // Brightness 0..1; gradient stops lerp from dark → lit by this value.
    const b = (typeof comp.brightness === 'number') ? comp.brightness : (comp.lit ? 1 : 0);
    const lit = b > 0.05;

    const angle = Math.atan2(cPos.y - aPos.y, cPos.x - aPos.x);
    const dist = Math.hypot(cPos.x - aPos.x, cPos.y - aPos.y);
    const cx = (aPos.x + cPos.x) / 2;
    const cy = (aPos.y + cPos.y) / 2;

    const flangeR = 9;    // flange (widest ring at the base of a 5mm LED)
    const lensR   = 7.2;  // lens body

    // Glow halo under everything; alpha scales with brightness.
    if (lit) {
      const halo = ctx.createRadialGradient(cx, cy, lensR * 0.3, cx, cy, flangeR * 4);
      halo.addColorStop(0,    `rgba(${cs.halo}, ${(0.75 * b).toFixed(3)})`);
      halo.addColorStop(0.35, `rgba(${cs.halo}, ${(0.28 * b).toFixed(3)})`);
      halo.addColorStop(1,    `rgba(${cs.halo}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, flangeR * 4, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();
    }

    // Leads from the holes in under the flange
    ctx.strokeStyle = '#a9acaf';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(aPos.x, aPos.y);
    ctx.lineTo(cx - Math.cos(angle) * lensR * 0.5, cy - Math.sin(angle) * lensR * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cPos.x, cPos.y);
    ctx.lineTo(cx + Math.cos(angle) * lensR * 0.5, cy + Math.sin(angle) * lensR * 0.5);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);   // local +x points toward the cathode pin

    // Contact shadow under the package so it sits on the board
    if (!lit) {
      ctx.fillStyle = 'rgba(40,30,12,0.22)';
      ctx.beginPath();
      ctx.ellipse(0.6, 1.4, flangeR, flangeR * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Flange: full disc except a flat chord on the cathode (+x) side
    const flangeColor = this._lerpHex(this._lightenColor(cs.darkBody, -25), cs.litBody, b * 0.8);
    const flat = Math.acos(0.72); // chord at x = 0.72·flangeR
    ctx.beginPath();
    ctx.arc(0, 0, flangeR, flat, Math.PI * 2 - flat);
    ctx.closePath();
    ctx.fillStyle = flangeColor;
    ctx.fill();
    ctx.strokeStyle = this._lerpHex(cs.darkStroke, cs.litStroke, b);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Lens body: radial gradient, light biased to the upper-left
    const lens = ctx.createRadialGradient(-lensR * 0.35, -lensR * 0.35, lensR * 0.12, 0, 0, lensR);
    const midDark = this._lightenColor(cs.darkBody, 28);
    lens.addColorStop(0,   this._lerpHex(this._lightenColor(cs.darkBody, 55), '#ffffff', b));
    lens.addColorStop(0.45, this._lerpHex(midDark, cs.litStroke, b));
    lens.addColorStop(0.85, this._lerpHex(cs.darkBody, cs.litBody, b));
    lens.addColorStop(1,   this._lerpHex(this._lightenColor(cs.darkBody, -20), cs.litBody, b));
    if (lit) {
      ctx.shadowBlur = 16 * b;
      ctx.shadowColor = cs.shadow;
    }
    ctx.beginPath();
    ctx.arc(0, 0, lensR, 0, Math.PI * 2);
    ctx.fillStyle = lens;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Reflector cup + die, visible through the plastic when unlit;
    // washed out by the emission when lit.
    if (b < 0.85) {
      ctx.globalAlpha = 1 - b;
      ctx.beginPath();
      ctx.arc(0.5, 0.5, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0.5, 0.5, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(235,235,225,0.55)';
      ctx.fill();
      // Bond-wire hint
      ctx.strokeStyle = 'rgba(60,60,60,0.5)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0.5, 0.5);
      ctx.lineTo(-2.6, -1.6);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Hot core when lit
    if (lit) {
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, lensR * 0.75);
      core.addColorStop(0, `rgba(255,255,255,${(0.95 * b).toFixed(3)})`);
      core.addColorStop(0.55, `rgba(${cs.halo}, ${(0.45 * b).toFixed(3)})`);
      core.addColorStop(1, `rgba(${cs.halo}, 0)`);
      ctx.beginPath();
      ctx.arc(0, 0, lensR * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();
    }

    // Lens rim + specular highlight
    ctx.strokeStyle = this._lerpHex(cs.darkStroke, cs.litStroke, b);
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, lensR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${lit ? 0.75 : 0.5})`;
    ctx.beginPath();
    ctx.ellipse(-lensR * 0.42, -lensR * 0.45, lensR * 0.3, lensR * 0.17, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();

    // Overdrive warning: red ring around the flange
    if (comp.overdrive) {
      ctx.strokeStyle = '#ff2020';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, flangeR + 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Anode (+) / cathode (-) markers near pin holes (world space)
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#666';
    ctx.fillText('+', aPos.x, aPos.y + 1);
    ctx.fillText('−', cPos.x, cPos.y + 1);
  }

  /** Lighten (positive amount) or darken (negative amount) a hex color. */
  _lightenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  /** Linear interpolation between two #rrggbb hex colors. t clamped to 0..1. */
  _lerpHex(a, b, t) {
    const tt = Math.min(1, Math.max(0, t));
    const na = parseInt(a.replace('#', ''), 16);
    const nb = parseInt(b.replace('#', ''), 16);
    const ar = (na >> 16) & 0xff, ag = (na >> 8) & 0xff, ab = na & 0xff;
    const br = (nb >> 16) & 0xff, bg = (nb >> 8) & 0xff, bb = nb & 0xff;
    const r = Math.round(ar + (br - ar) * tt);
    const g = Math.round(ag + (bg - ag) * tt);
    const bC = Math.round(ab + (bb - ab) * tt);
    return `#${((r << 16) | (g << 8) | bC).toString(16).padStart(6, '0')}`;
  }

  /** Realistic axial resistor: beige cylinder with color bands, kinked leads. */
  _drawResistorRealistic(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist  = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);
    const cx    = (aPos.x + bPos.x) / 2;
    const cy    = (aPos.y + bPos.y) / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const bodyW = Math.min(dist * 0.6, 26);
    const bodyH = 8;

    // Tinned leads
    ctx.strokeStyle = '#b0b3b6';
    ctx.lineWidth = 1.6;
    ctx.lineCap  = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-bodyW / 2 + 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(bodyW / 2 - 2, 0);
    ctx.stroke();

    // Contact shadow so the body sits above the board
    ctx.fillStyle = 'rgba(40,30,12,0.20)';
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2 + 0.5, -bodyH / 2 + 1.6, bodyW, bodyH, bodyH / 2);
    ctx.fill();

    // Body: beige capsule with cylindrical shading (light from above)
    const bodyGrad = ctx.createLinearGradient(0, -bodyH / 2, 0, bodyH / 2);
    bodyGrad.addColorStop(0,    '#cbb98e');
    bodyGrad.addColorStop(0.22, '#f2e6c4');
    bodyGrad.addColorStop(0.45, '#f8eed2');
    bodyGrad.addColorStop(0.75, '#d9c69a');
    bodyGrad.addColorStop(1,    '#a8946a');
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, bodyH / 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Color bands derive from resistance value; clip to the capsule so the
    // band ends follow the body's rounded profile.
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, bodyH / 2);
    ctx.clip();
    const bands = this._resistorColorBands(comp.resistance || 1000);
    const bandW = 2.6;
    const bandSpacing = (bodyW - 6) / (bands.length + 1);
    for (let i = 0; i < bands.length; i++) {
      // Tolerance band sits apart, near the far end
      const bx = (i === bands.length - 1)
        ? bodyW / 2 - 4.6
        : -bodyW / 2 + 3 + bandSpacing * (i + 1) - bandW / 2;
      ctx.fillStyle = bands[i];
      ctx.fillRect(bx, -bodyH / 2, bandW, bodyH);
      // Cylindrical shading over the band (dark at both rims)
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(bx, -bodyH / 2, bandW, 1.4);
      ctx.fillRect(bx, bodyH / 2 - 1.8, bandW, 1.8);
    }
    // Glossy lacquer stripe along the top of the whole body
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2 + 2.5, -bodyH / 2 + 1.1, bodyW - 5, 1.4, 0.7);
    ctx.fill();
    ctx.restore();

    // Body outline
    ctx.strokeStyle = 'rgba(130, 106, 62, 0.75)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, bodyH / 2);
    ctx.stroke();

    ctx.restore();
  }

  /** Map resistance to IEC 4-band color code (accurate). */
  _resistorColorBands(ohms) {
    // Digit colors 0 9 per IEC 60062
    const D = [
      '#222222', // 0 Black
      '#7b3200', // 1 Brown
      '#cc0000', // 2 Red
      '#ff6600', // 3 Orange
      '#ffe000', // 4 Yellow
      '#00aa00', // 5 Green
      '#1155cc', // 6 Blue
      '#9900bb', // 7 Violet
      '#888888', // 8 Gray
      '#eeeeee', // 9 White
    ];
    const GOLD   = '#c8a000'; // multiplier ×0.1  AND tolerance ±5%
    const SILVER = '#b0b0b0'; // multiplier ×0.01

    if (!ohms || ohms <= 0) return [D[1], D[0], D[0], GOLD]; // 100 Ω fallback

    // Express value as (sig) × 10^mult  where sig is a 2-digit integer (10 99)
    let mult, sig;
    if (ohms < 1) {
      // ×0.01 (silver) multiplier: sig = ohms × 100
      mult = -2;
      sig  = Math.round(ohms * 100);
    } else if (ohms < 10) {
      // ×0.1 (gold) multiplier: sig = ohms × 10
      mult = -1;
      sig  = Math.round(ohms * 10);
    } else {
      mult = Math.floor(Math.log10(ohms)) - 1;
      sig  = Math.round(ohms / Math.pow(10, mult));
      // Fix rounding pushing sig out of 10 99 range
      if (sig >= 100) { sig = Math.round(sig / 10); mult++; }
      if (sig < 10)   { sig = Math.round(sig * 10); mult--; }
    }

    const d1 = Math.floor(sig / 10) % 10;
    const d2 = sig % 10;

    let multColor;
    if      (mult === -2) multColor = SILVER;
    else if (mult === -1) multColor = GOLD;
    else                  multColor = D[Math.min(Math.max(mult, 0), 9)];

    return [D[d1], D[d2], multColor, GOLD]; // 4th band always gold (±5%)
  }

  /** Realistic DIP chip: matte black body, beveled notch, metallic leads. */
  _drawChipRealistic(ctx, comp, state) {
    // Reuse existing structure but with realistic styling
    if (!comp.pins.length) return;
    const half = comp.chipDef.pins / 2;
    const firstPin    = this.world.getHolePosById(comp.pins[0].holeId);
    const lastTopPin  = this.world.getHolePosById(comp.pins[half - 1].holeId);
    const firstBotPin = this.world.getHolePosById(comp.pins[half].holeId);
    if (!firstPin || !lastTopPin || !firstBotPin) return;

    const padX   = 6;  // horizontal padding beyond outer pins
    const legLen = 8;  // visible metal leg length from hole to body edge

    // Body bounds legs sit outside, body does NOT overlap holes
    const x = firstPin.x - padX;
    const y = firstPin.y + legLen;                              // body top is legLen below top row
    const w = lastTopPin.x - firstPin.x + padX * 2;
    const h = firstBotPin.y - firstPin.y - 2 * legLen;         // body bottom is legLen above bottom row

    // ── Tinned DIP legs drawn BEFORE body so body edge is clean ────────
    // Each leg is a tapered trapezoid: wide shoulder at the body narrowing
    // toward the hole, like a real stamped DIP lead.
    const shoulderW = 7.5;  // width where the leg leaves the body
    const tipW      = 4.5;  // width where it enters the breadboard hole
    for (const p of comp.pins) {
      const pos = this.world.getHolePosById(p.holeId);
      if (!pos) continue;

      const isTop = pos.y < (firstPin.y + firstBotPin.y) / 2;
      const bodyEdgeY = isTop ? pos.y + legLen : pos.y - legLen;
      const tipY      = isTop ? pos.y - 1      : pos.y + 1;

      const lg = ctx.createLinearGradient(pos.x - shoulderW / 2, 0, pos.x + shoulderW / 2, 0);
      lg.addColorStop(0,    '#5a5a5a');
      lg.addColorStop(0.3,  '#c2c2c2');
      lg.addColorStop(0.5,  '#e8e8e8');
      lg.addColorStop(0.7,  '#b0b0b0');
      lg.addColorStop(1,    '#4e4e4e');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(pos.x - shoulderW / 2, bodyEdgeY);
      ctx.lineTo(pos.x + shoulderW / 2, bodyEdgeY);
      ctx.lineTo(pos.x + tipW / 2, tipY);
      ctx.lineTo(pos.x - tipW / 2, tipY);
      ctx.closePath();
      ctx.fill();
      // Shoulder shadow where the leg exits the epoxy body
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(pos.x - shoulderW / 2, isTop ? bodyEdgeY - 1.2 : bodyEdgeY, shoulderW, 1.2);
    }

    // ── Soft contact shadow under the package (cheap, no shadowBlur) ────
    ctx.fillStyle = 'rgba(40, 30, 12, 0.30)';
    ctx.beginPath();
    ctx.roundRect(x - 1.5, y + 2, w + 3, h + 1, 3);
    ctx.fill();

    // ── Chip body gradient near-black epoxy mold compound ─────────────
    const bodyGrad = ctx.createLinearGradient(x, y, x, y + h);
    bodyGrad.addColorStop(0,    '#3a3a3a');
    bodyGrad.addColorStop(0.06, '#2c2c2c');
    bodyGrad.addColorStop(0.5,  '#1c1c1c');
    bodyGrad.addColorStop(0.94, '#121212');
    bodyGrad.addColorStop(1,    '#060606');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 2.5);
    ctx.fill();

    // Side bevels: the molded package's chamfered long edges
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(x + 1, y + 2, 1.2, h - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x + w - 2.2, y + 2, 1.2, h - 4);

    // Top-edge sheen line (specular reflection off the molded edge)
    const sheenGrad = ctx.createLinearGradient(x, y, x + w, y);
    sheenGrad.addColorStop(0,   'rgba(255,255,255,0.02)');
    sheenGrad.addColorStop(0.3, 'rgba(255,255,255,0.14)');
    sheenGrad.addColorStop(0.7, 'rgba(255,255,255,0.14)');
    sheenGrad.addColorStop(1,   'rgba(255,255,255,0.02)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(x + 2, y + 0.6, w - 4, 1.6);

    // Faint mold ejector marks — two shallow circles on the package face
    if (w > 70) {
      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.lineWidth = 1;
      for (const mx of [x + w * 0.22, x + w * 0.78]) {
        ctx.beginPath();
        ctx.arc(mx, y + h / 2, Math.min(6, h * 0.16), 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Body border
    ctx.strokeStyle = '#3c3c3c';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 2.5);
    ctx.stroke();

    // ── DIP notch semicircle on left edge, shaded as a recess ──────────
    ctx.beginPath();
    ctx.arc(x, y + h / 2, 5, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = '#050505';
    ctx.fill();
    // Light catch on the lower inside wall of the notch
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y + h / 2, 4.2, Math.PI * 0.12, Math.PI * 0.5);
    ctx.stroke();
    // Shadow on the upper inside wall
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    ctx.arc(x, y + h / 2, 4.4, -Math.PI * 0.5, -Math.PI * 0.1);
    ctx.stroke();

    // Pin-1 dimple: shallow molded depression with a light catch below
    ctx.beginPath();
    ctx.arc(x + 9, y + h - 7, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(x + 9, y + h - 7, 2.1, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    // ── Chip name label laser-etched look (emboss + main) ─────────────
    ctx.font = 'bold 10px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    // Subtle dark shadow for emboss depth
    ctx.fillStyle = '#000';
    ctx.fillText(
      chipDisplayName(comp, state),
      x + w / 2 + 0.7, y + h / 2 + 0.7
    );
    // Main label slightly warm white, like laser etching
    ctx.fillStyle = '#e2ded4';
    ctx.fillText(
      chipDisplayName(comp, state),
      x + w / 2, y + h / 2
    );
  }

  /** Realistic tact button. Horizontal: 40×40px square body, left/right legs.
   *  Vertical (channel-straddle): same square body, top/bottom legs. */
  _drawButtonRealistic(ctx, comp) {
    if (comp.pins.length < 4) return;
    const tlPos = this.world.getHolePosById(comp.pins[0].holeId);
    const trPos = this.world.getHolePosById(comp.pins[1].holeId);
    const blPos = this.world.getHolePosById(comp.pins[2].holeId);
    const brPos = this.world.getHolePosById(comp.pins[3].holeId);
    if (!tlPos || !trPos || !blPos || !brPos) return;

    const cx = (tlPos.x + trPos.x) / 2;
    const cy = (tlPos.y + blPos.y) / 2;
    const hw = 20, hh = 20; // 40×40 square body

    // Legs
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#909090';
    ctx.lineCap = 'round';
    if (comp.vertical) {
      // Top/bottom legs: body top/bottom edges → pin holes
      for (const [pos, edgeY] of [
        [tlPos, cy - hh], [trPos, cy - hh],
        [blPos, cy + hh], [brPos, cy + hh],
      ]) {
        ctx.beginPath();
        ctx.moveTo(pos.x, edgeY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else {
      // Left/right legs
      for (const [pos, edgeX] of [
        [tlPos, cx - hw], [blPos, cx - hw],
        [trPos, cx + hw], [brPos, cx + hw],
      ]) {
        ctx.beginPath();
        ctx.moveTo(edgeX, pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }

    this._drawTactHousing(ctx, cx, cy, hw, 14, comp.pressed);
  }

  /** Shared realistic tact-switch housing: brushed metal plate, corner
   *  rivets, black base, round plunger. `half` is the housing half-size,
   *  `capR` the plunger radius. */
  _drawTactHousing(ctx, cx, cy, half, capR, pressed) {
    const r = 3;
    // Contact shadow
    ctx.fillStyle = 'rgba(40,30,12,0.30)';
    ctx.beginPath();
    ctx.roundRect(cx - half - 0.5, cy - half + 1.5, half * 2 + 1, half * 2 + 1, r);
    ctx.fill();

    // Brushed metal top plate
    const housingGrad = ctx.createLinearGradient(cx - half, cy - half, cx + half, cy + half);
    housingGrad.addColorStop(0,    '#e2e0da');
    housingGrad.addColorStop(0.35, '#c2beb4');
    housingGrad.addColorStop(0.65, '#a9a59a');
    housingGrad.addColorStop(1,    '#8b877c');
    ctx.beginPath();
    ctx.roundRect(cx - half, cy - half, half * 2, half * 2, r);
    ctx.fillStyle = housingGrad;
    ctx.fill();
    ctx.strokeStyle = '#6e6a60';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Light catch along the top edge of the plate
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(cx - half + r, cy - half + 0.8);
    ctx.lineTo(cx + half - r, cy - half + 0.8);
    ctx.stroke();

    // Corner rivets (stamped dimples)
    const rd = Math.max(1.6, half * 0.11);
    const ro = half - rd - 1.5;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      ctx.beginPath();
      ctx.arc(cx + sx * ro, cy + sy * ro, rd, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(60,55,45,0.55)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + sx * ro - 0.4, cy + sy * ro - 0.4, rd * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    }

    // Round opening in the plate (dark base visible)
    ctx.beginPath();
    ctx.arc(cx, cy, capR + 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#15130f';
    ctx.fill();

    // Plunger: radial-shaded cap; pressed = darker, highlight collapses
    const capGrad = ctx.createRadialGradient(
      cx - capR * 0.35, cy - capR * 0.35, capR * 0.15, cx, cy, capR
    );
    if (pressed) {
      capGrad.addColorStop(0, '#6b4a33');
      capGrad.addColorStop(0.7, '#48301e');
      capGrad.addColorStop(1, '#301d10');
    } else {
      capGrad.addColorStop(0, '#a57b52');
      capGrad.addColorStop(0.6, '#7d5936');
      capGrad.addColorStop(1, '#52371e');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, capR, 0, Math.PI * 2);
    ctx.fillStyle = capGrad;
    ctx.fill();
    ctx.strokeStyle = '#2c1a08';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Rim ring on the plunger + specular dot
    ctx.strokeStyle = pressed ? 'rgba(0,0,0,0.4)' : 'rgba(255,235,210,0.30)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, capR * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    if (!pressed) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - capR * 0.4, cy - capR * 0.45, capR * 0.24, capR * 0.14, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Realistic 2 pin push button (small inline tact switch). */
  _drawPushButtonRealistic(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const s = 12;

    // Legs: from body edge to pin holes (same style as 4-terminal)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#909090';
    ctx.lineCap = 'round';
    const edgeA = { x: cx - Math.cos(angle) * s, y: cy - Math.sin(angle) * s };
    const edgeB = { x: cx + Math.cos(angle) * s, y: cy + Math.sin(angle) * s };
    ctx.beginPath(); ctx.moveTo(edgeA.x, edgeA.y); ctx.lineTo(aPos.x, aPos.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(edgeB.x, edgeB.y); ctx.lineTo(bPos.x, bPos.y); ctx.stroke();

    this._drawTactHousing(ctx, cx, cy, s, 7, comp.pressed);

    // Pin endpoint dots
    for (const pos of [aPos, bPos]) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
    }
  }

  _drawSlideSwitch(ctx, comp, palette) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);

    const bezelBase = Math.min(30, Math.max(16, dist - 10));
    const bezelW = bezelBase * 1.7;
    const bezelH = bezelBase * 1.2;
    const halfBezelW = bezelW / 2;
    const halfBezelH = bezelH / 2;

    // ONE trapezoid Slide switch.
    // Left & right edges are perfectly VERTICAL.
    // Top & bottom edges are DIAGONAL connecting the two different-height vertical edges.
    // Active side is SHORTER (depressed), inactive side is TALLER (raised).
    //
    //  (-W, -leftH) ---- seam ---- (+W, -rightH)   ← diagonal top edge
    //       |              |              |
    //  (-W, +leftH) ---- seam ---- (+W, +rightH)   ← diagonal bottom edge
    //
    // The seam at x=0 is vertical, at the midpoint of the diagonal edges.

    const TALL_H  = halfBezelH * 0.86;
    const SHORT_H = halfBezelH * 0.40;
    const halfSlideW = halfBezelW - Math.max(2, bezelW * 0.05);

    const leftIsActive = !!comp.on;
    const leftH  = leftIsActive ? SHORT_H : TALL_H;
    const rightH = leftIsActive ? TALL_H  : SHORT_H;

    // Seam Y coords: midpoint of the top/bottom diagonal edges at x=0
    const seamTopY = -(leftH + rightH) / 2;
    const seamBotY = +(leftH + rightH) / 2;
    const seamWidth = Math.max(1.0, halfSlideW * 0.04);

    const leadStop = Math.min(dist / 2 - 2, halfBezelW + 2.5);
    const pinDotR = Math.max(2, bezelBase * 0.11);
    const labelFont = Math.max(5, Math.round(SHORT_H * 1.1));
    const labelX = halfSlideW * 0.44;

    const leftTop    = leftIsActive ? palette.faceActiveTop    : palette.faceNeutralTop;
    const leftBottom = leftIsActive ? palette.faceActiveBottom : palette.faceNeutralBottom;
    const rightTop   = leftIsActive ? palette.faceNeutralTop   : palette.faceActiveTop;
    const rightBottom= leftIsActive ? palette.faceNeutralBottom: palette.faceActiveBottom;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Leads
    ctx.strokeStyle = palette.lead;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-leadStop, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(leadStop, 0);
    ctx.stroke();

    // Pin dots
    ctx.fillStyle = palette.lug;
    ctx.beginPath();
    ctx.arc(-dist / 2, 0, pinDotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(dist / 2, 0, pinDotR, 0, Math.PI * 2);
    ctx.fill();

    // Bezel square, no outline
    ctx.save();
    ctx.shadowColor = palette.shadowGlow;
    ctx.shadowBlur = 6;
    const bezelGrad = ctx.createLinearGradient(0, -halfBezelH, 0, halfBezelH);
    bezelGrad.addColorStop(0, palette.bezelTop);
    bezelGrad.addColorStop(1, palette.bezelBottom);
    ctx.fillStyle = bezelGrad;
    ctx.fillRect(-halfBezelW, -halfBezelH, bezelW, bezelH);
    ctx.restore();

    // Left half of trapezoid (1 side):
    //   corners: top-left (-W,-leftH), top-right (seam), bottom-right (seam), bottom-left (-W,+leftH)
    const gradL = ctx.createLinearGradient(0, -TALL_H, 0, TALL_H);
    gradL.addColorStop(0, leftTop);
    gradL.addColorStop(1, leftBottom);
    ctx.fillStyle = gradL;
    ctx.beginPath();
    ctx.moveTo(-halfSlideW, -leftH);
    ctx.lineTo(0,             seamTopY);
    ctx.lineTo(0,             seamBotY);
    ctx.lineTo(-halfSlideW, +leftH);
    ctx.closePath();
    ctx.fill();

    // Right half of trapezoid (0 side):
    //   corners: top-left (seam), top-right (+W,-rightH), bottom-right (+W,+rightH), bottom-left (seam)
    const gradR = ctx.createLinearGradient(0, -TALL_H, 0, TALL_H);
    gradR.addColorStop(0, rightTop);
    gradR.addColorStop(1, rightBottom);
    ctx.fillStyle = gradR;
    ctx.beginPath();
    ctx.moveTo(0,            seamTopY);
    ctx.lineTo(+halfSlideW, -rightH);
    ctx.lineTo(+halfSlideW, +rightH);
    ctx.lineTo(0,            seamBotY);
    ctx.closePath();
    ctx.fill();

    // Center seam vertical line
    ctx.strokeStyle = palette.seam;
    ctx.lineWidth = seamWidth;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(0, seamTopY);
    ctx.lineTo(0, seamBotY);
    ctx.stroke();

    // "1" label vertical line, sized to match "0" glyph height
    const lineH = labelFont * 1.1;
    ctx.strokeStyle = leftIsActive ? palette.labelActive : palette.label;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-labelX, -lineH / 2);
    ctx.lineTo(-labelX, +lineH / 2);
    ctx.stroke();

    // "0" label text
    ctx.font = `bold ${labelFont}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = leftIsActive ? palette.label : palette.labelActive;
    ctx.fillText('0', labelX, 0);

    ctx.restore();
  }

  /** Realistic SPST panel Slide switch body. */
  _drawSwitchRealistic(ctx, comp) {
    this._drawSwitch(ctx, comp, true);
  }

  /** Realistic 3 pin SPDT slide switch. */
  _drawSlideSwitchRealistic(ctx, comp) {
    this._drawSlideSwitch(ctx, comp, true);
  }

  // ── Components ────────────────────────────────────────────────────────────
  _drawComponent(ctx, comp, state) {
    const realistic = state && state.showRealisticBoard;
    switch (comp.type) {
      case COMP.CHIP:
        if (comp.chipDef && comp.chipDef.name === 'XO') {
          this._drawCrystalOscCan(ctx, comp);
        } else if (realistic) {
          this._drawChipRealistic(ctx, comp, state);
        } else {
          this._drawChip(ctx, comp, state);
        }
        break;
      case COMP.LED:
        if (realistic) this._drawLEDRealistic(ctx, comp);
        else this._drawLED(ctx, comp);
        break;
      case COMP.SEVEN_SEG: this._drawSevenSeg(ctx, comp, state); break;
      case COMP.BUTTON:
        if (realistic) this._drawButtonRealistic(ctx, comp);
        else this._drawButton(ctx, comp);
        break;
      case COMP.PUSH_BUTTON:
        if (realistic) this._drawPushButtonRealistic(ctx, comp);
        else this._drawPushButton(ctx, comp);
        break;
      case COMP.SWITCH:
        if (realistic) this._drawSwitchRealistic(ctx, comp);
        else this._drawSwitch(ctx, comp);
        break;
      case COMP.SLIDE_SWITCH:
        if (realistic) this._drawSlideSwitchRealistic(ctx, comp);
        else this._drawSlideSwitch(ctx, comp);
        break;
      case COMP.RESISTOR:
        if (realistic) this._drawResistorRealistic(ctx, comp);
        else this._drawResistor(ctx, comp);
        break;
      case COMP.CAPACITOR:
        if (realistic) this._drawCapacitorRealistic(ctx, comp);
        else this._drawCapacitor(ctx, comp);
        break;
      case COMP.POLARIZED_CAPACITOR:
        if (realistic) this._drawPolarizedCapacitorRealistic(ctx, comp);
        else this._drawPolarizedCapacitor(ctx, comp);
        break;
      case COMP.INDUCTOR:
        this._drawInductor(ctx, comp);
        break;
      case COMP.DIODE:
        if (realistic) this._drawDiodeRealistic(ctx, comp);
        else this._drawDiode(ctx, comp);
        break;
      case COMP.CRYSTAL:
        this._drawCrystal(ctx, comp);
        break;
      case COMP.CLOCK:
        this._drawClock(ctx, comp);
        break;
      case COMP.TESTPOINT:
        this._drawTestPoint(ctx, comp, state);
        break;
      case COMP.DIP_SWITCH:
        this._drawDipSwitch(ctx, comp, state);
        break;
    }

    // Overcurrent error outline
    if (state.overcurrentIds && state.overcurrentIds.has(comp.id)) {
      this._drawOvercurrentOutline(ctx, comp);
    }

    // Logic Analyzer labels draw below component when panel is open
    if (state.logicLabels && state.logicLabels.has(comp.id)) {
      this._drawLogicLabel(ctx, comp, state.logicLabels.get(comp.id));
    }
  }

  _drawLogicLabel(ctx, comp, label) {
    let cx, cy;

    if (comp.type === COMP.SLIDE_SWITCH) {
      const p1 = this.world.getHolePosById(comp.pins[0].holeId);
      const p3 = this.world.getHolePosById(comp.pins[2].holeId);
      if (!p1 || !p3) return;
      cx = (p1.x + p3.x) / 2;
      cy = Math.max(p1.y, p3.y) + 14;
    } else if (comp.type === COMP.BUTTON && comp.pins.length >= 4) {
      const tlPos = this.world.getHolePosById(comp.pins[0].holeId);
      const trPos = this.world.getHolePosById(comp.pins[1].holeId);
      const blPos = this.world.getHolePosById(comp.pins[2].holeId);
      if (!tlPos || !trPos || !blPos) return;
      cx = (tlPos.x + trPos.x) / 2;
      cy = (tlPos.y + blPos.y) / 2;
    } else if (comp.pins.length >= 2) {
      const a = this.world.getHolePosById(comp.pins[0].holeId);
      const b = this.world.getHolePosById(comp.pins[1].holeId);
      if (!a || !b) return;
      cx = (a.x + b.x) / 2;
      cy = (a.y + b.y) / 2;
    } else {
      return;
    }

    ctx.font = 'bold 8px monospace';
    const tw = ctx.measureText(label).width;
    const padX = 3, padY = 2;
    const bw = tw + padX * 2;
    const bh = 10 + padY * 2;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.beginPath();
    ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 3);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
  }

  _drawChip(ctx, comp, state) {
    if (!comp.pins.length) return;
    const half = comp.chipDef.pins / 2;

    // Get bounding box from pin positions
    const firstPin    = this.world.getHolePosById(comp.pins[0].holeId);
    const lastTopPin  = this.world.getHolePosById(comp.pins[half - 1].holeId);
    const firstBotPin = this.world.getHolePosById(comp.pins[half].holeId);
    if (!firstPin || !lastTopPin || !firstBotPin) return;

    const padX   = 6;   // horizontal padding beyond outer pins
    const legLen = 8;   // leg length from hole to body edge (matches realistic)
    const legW   = 8;   // thick leg width in px

    // Body sits legLen inward from the pin rows same proportions as realistic
    const x = firstPin.x - padX;
    const y = firstPin.y + legLen;
    const w = lastTopPin.x - firstPin.x + padX * 2;
    const h = firstBotPin.y - firstPin.y - 2 * legLen;
    const midY = (firstPin.y + firstBotPin.y) / 2;

    // ── Thick legs drawn BEFORE body ─────────────────────────────────────
    for (const p of comp.pins) {
      const pos = this.world.getHolePosById(p.holeId);
      if (!pos) continue;
      const isTop = pos.y < midY;
      const legTop = isTop ? pos.y - 2      : pos.y - legLen;
      const legBot = isTop ? pos.y + legLen : pos.y + 2;
      ctx.fillStyle = COLORS.CHIP_PIN;
      ctx.fillRect(pos.x - legW / 2, legTop, legW, legBot - legTop);
      // Bright edge highlight on outer tip
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      if (isTop) {
        ctx.fillRect(pos.x - legW / 2 + 1, legTop, legW - 2, 1.5);
      } else {
        ctx.fillRect(pos.x - legW / 2 + 1, legBot - 1.5, legW - 2, 1.5);
      }
    }

    // ── Chip body ─────────────────────────────────────────────────────────
    ctx.fillStyle = COLORS.CHIP_BODY;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = COLORS.CHIP_PIN;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Notch on left side
    ctx.beginPath();
    ctx.arc(x, y + h / 2, 5, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = COLORS.CHIP_NOTCH;
    ctx.fill();

    // Chip name label
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = COLORS.CHIP_TEXT;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      chipDisplayName(comp, state),
      x + w / 2, y + h / 2
    );
  }

  // ── XO crystal oscillator can ─────────────────────────────────────────────
  // A single rounded-rectangle metal can no legs, no visible board hookup.
  // The body extends a little past both pin rows so the holes are covered and
  // it reads as a solid can sitting on the board.
  // Top-down look: warm nickel lid inside a crimped rim (the visible border),
  // nearly flat shading, and the pin-1 index dot in the corner nearest pin 1.
  _drawCrystalOscCan(ctx, comp) {
    if (!comp.pins.length) return;
    const half = comp.chipDef.pins / 2;
    const firstPin    = this.world.getHolePosById(comp.pins[0].holeId);
    const lastTopPin  = this.world.getHolePosById(comp.pins[half - 1].holeId);
    const firstBotPin = this.world.getHolePosById(comp.pins[half].holeId);
    if (!firstPin || !lastTopPin || !firstBotPin) return;

    const padX = 6;
    const over = GRID.HOLE_RADIUS + 3;  // extend past each pin row → covers holes
    const x = firstPin.x - padX;
    const y = firstPin.y - over;
    const w = lastTopPin.x - firstPin.x + padX * 2;
    const h = (firstBotPin.y - firstPin.y) + over * 2;

    // Outer flange the crimped edge where the lid is folded over the base
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fillStyle = '#b4b0a8';
    ctx.fill();
    ctx.strokeStyle = '#67635c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Lid face, inset inside the rim near-flat warm nickel, faint sheen only
    const rim = 3;
    const grad = ctx.createLinearGradient(0, y + rim, 0, y + h - rim);
    grad.addColorStop(0, '#dbd8d1');
    grad.addColorStop(1, '#c9c5bd');
    ctx.beginPath();
    ctx.roundRect(x + rim, y + rim, w - rim * 2, h - rim * 2, 5.5);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,56,50,0.28)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pin-1 index dot in whichever corner of the lid is nearest pin 1
    const pin1 = comp.getPinByNumber(1);
    const p1 = pin1 ? this.world.getHolePosById(pin1.holeId) : null;
    if (p1) {
      const inset = rim + 5;
      const dotX = p1.x < x + w / 2 ? x + inset : x + w - inset;
      const dotY = p1.y < y + h / 2 ? y + inset : y + h - inset;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#45413b';
      ctx.fill();
    }
  }

  // ── Chip Logic Diagram View ───────────────────────────────────────────────
  _drawChipLogic(ctx, comp, state) {
    if (!comp.pins.length) return;
    const half = comp.chipDef.pins / 2;

    const firstPin = this.world.getHolePosById(comp.pins[0].holeId);
    const lastTopPin = this.world.getHolePosById(comp.pins[half - 1].holeId);
    const firstBotPin = this.world.getHolePosById(comp.pins[half].holeId);
    if (!firstPin || !lastTopPin || !firstBotPin) return;

    const padding = 6;
    const bx = firstPin.x - padding;
    const by = firstPin.y - padding;
    const bw = lastTopPin.x - firstPin.x + padding * 2;
    const bh = firstBotPin.y - firstPin.y + padding * 2;
    const midY = (firstPin.y + firstBotPin.y) / 2;

    // Chip body
    ctx.fillStyle = COLORS.CHIP_BODY;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = COLORS.CHIP_PIN;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    // Notch
    ctx.beginPath();
    ctx.arc(bx, by + bh / 2, 5, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = COLORS.CHIP_NOTCH;
    ctx.fill();

    // Pin 1 dot mark actual pin 1 (bottom-left after layout fix)
    const pin1InfoL = comp.getPinByNumber(1);
    const pin1PosL = pin1InfoL ? this.world.getHolePosById(pin1InfoL.holeId) : null;
    if (pin1PosL) {
      ctx.beginPath();
      ctx.arc(pin1PosL.x, pin1PosL.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.CHIP_TEXT;
      ctx.fill();
    }

    // Pin circles
    for (const p of comp.pins) {
      const pos = this.world.getHolePosById(p.holeId);
      if (!pos) continue;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, GRID.HOLE_RADIUS + 1, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.CHIP_PIN;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const chipDef = comp.chipDef;
    // Standard gate types we can draw
    const DRAWABLE = new Set(['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR', 'NOT']);
    const hasDrawableGates = chipDef.gates && chipDef.gates.length > 0 &&
      chipDef.gates.every(g => DRAWABLE.has(g.type));

    if (!hasDrawableGates) {
      // Fallback: show chip name (for BCD_7SEG, D_FF, etc.)
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = COLORS.CHIP_TEXT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        chipDisplayName(comp, state),
        bx + bw / 2, by + bh / 2
      );
      return;
    }

    // Build pin name → pixel position map
    const pinPos = {};
    for (const p of comp.pins) {
      const pos = this.world.getHolePosById(p.holeId);
      if (pos) pinPos[p.name] = pos;
    }

    // Draw each gate with internal wiring
    for (const gate of chipDef.gates) {
      const inputPositions = gate.inputs.map(n => pinPos[n]).filter(Boolean);
      const outputPosition = pinPos[gate.output];
      if (!outputPosition || inputPositions.length === 0) continue;

      // Gate center x = average of all associated pins
      const allPos = [...inputPositions, outputPosition];
      const minPX = Math.min(...allPos.map(p => p.x));
      const maxPX = Math.max(...allPos.map(p => p.x));
      const gateCx = (minPX + maxPX) / 2;

      // Gate dimensions
      const isNot = gate.inputs.length === 1;
      const gw = isNot ? 10 : 14;
      const gh = isNot ? 8 : 10;

      // Draw gate symbol, returns the output x position
      const outX = this._drawGateShape(ctx, gate.type, gateCx, midY, gw, gh);

      // Internal wires (thin lines)
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 0.7;

      // Wires from input pins to gate input stubs
      const numInputs = inputPositions.length;
      const stubSpacing = gh / (numInputs + 1);
      for (let i = 0; i < numInputs; i++) {
        const ip = inputPositions[i];
        const stubX = gateCx - gw / 2;
        const stubY = midY - gh / 2 + stubSpacing * (i + 1);

        ctx.beginPath();
        ctx.moveTo(ip.x, ip.y);
        ctx.lineTo(ip.x, stubY);
        ctx.lineTo(stubX, stubY);
        ctx.stroke();
      }

      // Wire from gate output to output pin
      ctx.beginPath();
      ctx.moveTo(outX, midY);
      ctx.lineTo(outputPosition.x, midY);
      ctx.lineTo(outputPosition.x, outputPosition.y);
      ctx.stroke();
    }
  }

  // Draw a standard logic gate symbol centered at (cx, cy).
  // Returns the x coordinate of the output connection point.
  _drawGateShape(ctx, type, cx, cy, gw, gh) {
    const left = cx - gw / 2;
    const right = cx + gw / 2;
    const top = cy - gh / 2;
    const bot = cy + gh / 2;

    const isNeg = type === 'NAND' || type === 'NOR' || type === 'XNOR' || type === 'NOT';
    const base = isNeg
      ? (type === 'NAND' ? 'AND' : type === 'NOR' ? 'OR' : type === 'XNOR' ? 'XOR' : 'TRI')
      : type;

    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.8;

    let outputX = right;

    switch (base) {
      case 'AND': {
        const arcR = gh / 2;
        const arcCx = right - arcR;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(arcCx, top);
        ctx.arc(arcCx, cy, arcR, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(left, bot);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        outputX = right;
        break;
      }
      case 'OR': {
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.quadraticCurveTo(cx + gw * 0.1, top, right, cy);
        ctx.quadraticCurveTo(cx + gw * 0.1, bot, left, bot);
        ctx.quadraticCurveTo(left + gw * 0.3, cy, left, top);
        ctx.fill();
        ctx.stroke();
        outputX = right;
        break;
      }
      case 'XOR': {
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.quadraticCurveTo(cx + gw * 0.1, top, right, cy);
        ctx.quadraticCurveTo(cx + gw * 0.1, bot, left, bot);
        ctx.quadraticCurveTo(left + gw * 0.3, cy, left, top);
        ctx.fill();
        ctx.stroke();
        // Extra XOR input curve
        ctx.beginPath();
        ctx.moveTo(left - 2, top);
        ctx.quadraticCurveTo(left - 2 + gw * 0.3, cy, left - 2, bot);
        ctx.stroke();
        outputX = right;
        break;
      }
      case 'TRI': // triangle for NOT
      default: {
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(right, cy);
        ctx.lineTo(left, bot);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        outputX = right;
        break;
      }
    }

    // Negation bubble
    if (isNeg) {
      const br = 2;
      ctx.beginPath();
      ctx.arc(outputX + br, cy, br, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      ctx.strokeStyle = '#999';
      ctx.stroke();
      outputX += br * 2;
    }

    return outputX;
  }

  _ledColorScheme(color) {
    // darkBody should still look like the LED color, just dimmer (like real diffused plastic)
    const schemes = {
      red:    { litBody: '#ff2222', darkBody: '#8b2020', halo: '255,50,50',  shadow: '#ff3333', litStroke: '#ff9999', darkStroke: '#6b3030', darkSymbol: '#883333' },
      green:  { litBody: '#22ff44', darkBody: '#2a7a3a', halo: '50,255,80',  shadow: '#22ff44', litStroke: '#99ffaa', darkStroke: '#3a6a4a', darkSymbol: '#338844' },
      blue:   { litBody: '#4488ff', darkBody: '#3050a0', halo: '80,130,255', shadow: '#4488ff', litStroke: '#99bbff', darkStroke: '#4060a0', darkSymbol: '#334488' },
      yellow: { litBody: '#ffee22', darkBody: '#9a8520', halo: '255,238,50', shadow: '#ffee22', litStroke: '#fff799', darkStroke: '#7a6530', darkSymbol: '#887733' },
      white:  { litBody: '#ffffff', darkBody: '#a8a8a8', halo: '220,220,255',shadow: '#ddeeff', litStroke: '#ffffff', darkStroke: '#888888', darkSymbol: '#777777' },
    };
    return schemes[color] || schemes.red;
  }

  _drawLED(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const cPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !cPos) return;

    const cx = (aPos.x + cPos.x) / 2;
    const cy = (aPos.y + cPos.y) / 2;

    // Wire line between endpoints
    ctx.beginPath();
    ctx.moveTo(aPos.x, aPos.y);
    ctx.lineTo(cPos.x, cPos.y);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const r = 10;
    const cs = this._ledColorScheme(comp.color || 'red');
    // Brightness 0..1 from sim; fall back to legacy boolean for any sim mode that hasn't been updated.
    const b = (typeof comp.brightness === 'number') ? comp.brightness : (comp.lit ? 1 : 0);
    const lit = b > 0.05;

    // Radial glow halo when lit (drawn first, behind body); alpha scales with brightness.
    if (lit) {
      const halo = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 3.5);
      halo.addColorStop(0, `rgba(${cs.halo}, ${(0.55 * b).toFixed(3)})`);
      halo.addColorStop(1, `rgba(${cs.halo}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();
    }

    // LED body colored circle; body color lerps dark → lit by brightness.
    if (lit) {
      ctx.shadowBlur = 18 * b;
      ctx.shadowColor = cs.shadow;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = this._lerpHex(cs.darkBody, cs.litBody, b);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = lit ? cs.litStroke : cs.darkStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Overdrive warning: red ring around the dome when current exceeds rated max.
    if (comp.overdrive) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff2020';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Diode triangle + line to indicate direction (anode→cathode)
    const angle = Math.atan2(cPos.y - aPos.y, cPos.x - aPos.x);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    // Triangle pointing in flow direction
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(4, 0);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fillStyle = lit ? '#fff' : cs.darkSymbol;
    ctx.fill();
    // Cathode bar
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.lineTo(4, 4);
    ctx.strokeStyle = lit ? '#fff' : cs.darkSymbol;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Pin endpoint dots
    ctx.beginPath();
    ctx.arc(aPos.x, aPos.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cPos.x, cPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSevenSeg(ctx, comp, state) {
    if (comp.pins.length < 10) return;
    const half = 5;
    const firstPin = this.world.getHolePosById(comp.pins[0].holeId);
    const lastTopPin = this.world.getHolePosById(comp.pins[half - 1].holeId);
    const firstBotPin = this.world.getHolePosById(comp.pins[half].holeId);
    if (!firstPin || !lastTopPin || !firstBotPin) return;

    // Body exactly matches the selection outline (pin bounding box + 10px pad)
    const pad = 10;
    const x = firstPin.x - pad;
    const y = firstPin.y - pad;
    const w = lastTopPin.x - firstPin.x + pad * 2;
    const h = firstBotPin.y - firstPin.y + pad * 2;

    // Body
    const realisticSS = state && state.showRealisticBoard;
    if (realisticSS) {
      // Contact shadow + molded charcoal package with a soft face sheen
      ctx.fillStyle = 'rgba(40,30,12,0.35)';
      ctx.beginPath();
      ctx.roundRect(x - 1.5, y + 2.5, w + 3, h + 1, 4);
      ctx.fill();
      const ssg = ctx.createLinearGradient(x, y, x, y + h);
      ssg.addColorStop(0,    '#2e2e30');
      ssg.addColorStop(0.08, '#232325');
      ssg.addColorStop(0.85, '#141416');
      ssg.addColorStop(1,    '#0a0a0c');
      ctx.fillStyle = ssg;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 3);
      ctx.fill();
      // Inset bezel line around the display window
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 2);
      ctx.stroke();
      ctx.strokeStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 3);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#111111';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }

    // Digit area centered in body, well proportioned
    const dw = w * 0.52;
    const dh = h * 0.80;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    const t  = dw * 0.18;   // segment thickness
    const b  = t * 0.55;    // bevel cut at segment ends
    const gap = t * 0.28;   // gap between adjacent segments

    const segs = comp.segments || {};
    const segBr = comp.segmentBrightness || {};
    const segOd = comp.segmentOverdrive || {};
    const realistic = realisticSS;
    const offColor = realistic ? '#57150a' : '#3d0a00';
    const onColor  = realistic ? '#ff3300' : '#ff5500';
    // Lerp off→on by per-segment brightness; fall back to legacy boolean.
    const segBright = (name) =>
      (typeof segBr[name] === 'number') ? segBr[name] : (segs[name] ? 1 : 0);
    const segColor = (name) => this._lerpHex(offColor, onColor, segBright(name));
    // In realistic mode a lit segment blooms slightly, like a real LED bar
    // behind a tinted window. shadowBlur only fires on lit segments.
    const segGlow = (name) => {
      if (!realistic) return;
      const br = segBright(name);
      if (br > 0.15) {
        ctx.shadowColor = 'rgba(255, 60, 10, 0.9)';
        ctx.shadowBlur = 7 * br;
      }
    };

    // Horizontal segment (flat hexagon)
    const drawH = (sx, sy, name) => {
      const sw = dw - 2 * t;
      ctx.beginPath();
      ctx.moveTo(sx + b,      sy);
      ctx.lineTo(sx + sw - b, sy);
      ctx.lineTo(sx + sw,     sy + t / 2);
      ctx.lineTo(sx + sw - b, sy + t);
      ctx.lineTo(sx + b,      sy + t);
      ctx.lineTo(sx,          sy + t / 2);
      ctx.closePath();
      segGlow(name);
      ctx.fillStyle = segColor(name);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (segOd[name]) {
        ctx.strokeStyle = '#ff2020';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Vertical segment (tall hexagon), sh = explicit height
    const drawV = (sx, sy, sh, name) => {
      ctx.beginPath();
      ctx.moveTo(sx + t / 2, sy);
      ctx.lineTo(sx + t,     sy + b);
      ctx.lineTo(sx + t,     sy + sh - b);
      ctx.lineTo(sx + t / 2, sy + sh);
      ctx.lineTo(sx,         sy + sh - b);
      ctx.lineTo(sx,         sy + b);
      ctx.closePath();
      segGlow(name);
      ctx.fillStyle = segColor(name);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (segOd[name]) {
        ctx.strokeStyle = '#ff2020';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const vH = dh / 2 - 1.5 * t - 2 * gap; // height of each vertical half-segment

    // a: top horizontal
    drawH(dx + t, dy, 'a');
    // f: top-left vertical
    drawV(dx, dy + t + gap, vH, 'f');
    // b: top-right vertical
    drawV(dx + dw - t, dy + t + gap, vH, 'b');
    // g: middle horizontal
    drawH(dx + t, dy + dh / 2 - t / 2, 'g');
    // e: bottom-left vertical
    drawV(dx, dy + dh / 2 + t / 2 + gap, vH, 'e');
    // c: bottom-right vertical
    drawV(dx + dw - t, dy + dh / 2 + t / 2 + gap, vH, 'c');
    // d: bottom horizontal
    drawH(dx + t, dy + dh - t, 'd');

    // dp: decimal point bottom-right, level with segment d
    const dpR = t * 0.55;
    const dpX = dx + dw + gap + dpR;
    const dpY = dy + dh - dpR;
    ctx.beginPath();
    ctx.arc(dpX, dpY, dpR, 0, Math.PI * 2);
    segGlow('dp');
    ctx.fillStyle = segColor('dp');
    ctx.fill();
    ctx.shadowBlur = 0;
    if (segOd['dp']) {
      ctx.strokeStyle = '#ff2020';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Label intentionally omitted
  }

  _drawButton(ctx, comp) {
    if (comp.pins.length < 4) return;
    const tlPos = this.world.getHolePosById(comp.pins[0].holeId);
    const trPos = this.world.getHolePosById(comp.pins[1].holeId);
    const blPos = this.world.getHolePosById(comp.pins[2].holeId);
    const brPos = this.world.getHolePosById(comp.pins[3].holeId);
    if (!tlPos || !trPos || !blPos || !brPos) return;

    const cx = (tlPos.x + trPos.x) / 2;
    const cy = (tlPos.y + blPos.y) / 2;
    const hw = 20, hh = 20; // 40×40 square body

    // Legs
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#888888';
    ctx.lineCap = 'round';
    if (comp.vertical) {
      for (const [pos, edgeY] of [
        [tlPos, cy - hh], [trPos, cy - hh],
        [blPos, cy + hh], [brPos, cy + hh],
      ]) {
        ctx.beginPath();
        ctx.moveTo(pos.x, edgeY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else {
      for (const [pos, edgeX] of [
        [tlPos, cx - hw], [blPos, cx - hw],
        [trPos, cx + hw], [brPos, cx + hw],
      ]) {
        ctx.beginPath();
        ctx.moveTo(edgeX, pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }

    // Square body
    const r = 4;
    ctx.beginPath();
    ctx.roundRect(cx - hw, cy - hh, hw * 2, hh * 2, r);
    ctx.fillStyle = comp.pressed ? '#777' : '#444';
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner brown circle
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = comp.pressed ? '#aa8855' : '#775533';
    ctx.fill();

    // Pin endpoint dots
    for (const pos of [tlPos, trPos, blPos, brPos]) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
    }
  }

  _drawPushButton(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Wire stubs from each pin to body center
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-dist / 2, 0); ctx.lineTo(0, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dist / 2, 0); ctx.lineTo(0, 0); ctx.stroke();

    // Button body rounded square aligned to wire axis
    const s = 12;
    const r = 3;
    ctx.beginPath();
    ctx.roundRect(-s, -s, s * 2, s * 2, r);
    ctx.fillStyle = comp.pressed ? '#777' : '#444';
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = comp.pressed ? '#aa8855' : '#775533';
    ctx.fill();

    // Pin endpoint dots
    ctx.fillStyle = '#888';
    for (const x of [-dist / 2, dist / 2]) {
      ctx.beginPath();
      ctx.arc(x, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawSwitch(ctx, comp, realistic = false) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);

    // Fixed-size body (shorter than the 3-state slide switch)
    const bodyW = 34;
    const bodyH = 20;
    const trackH = 6;
    const knobW = 14;
    const knobH = 18;
    const knobOffset = 8; // distance from center to each knob position

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Wires from pins to body edges (like resistor style)
    ctx.strokeStyle = realistic ? '#b0b3b6' : '#888';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-bodyW / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(bodyW / 2, 0);
    ctx.stroke();

    // Pin endpoint dots
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(-dist / 2, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(dist / 2, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (realistic) {
      // Contact shadow
      ctx.fillStyle = 'rgba(40,30,12,0.28)';
      ctx.beginPath();
      ctx.roundRect(-bodyW / 2 - 0.5, -bodyH / 2 + 1.5, bodyW + 1, bodyH + 0.5, 2.5);
      ctx.fill();
      // Stamped metal frame
      const fg = ctx.createLinearGradient(0, -bodyH / 2, 0, bodyH / 2);
      fg.addColorStop(0,    '#dcdad2');
      fg.addColorStop(0.25, '#c0bcb2');
      fg.addColorStop(0.8,  '#9d998e');
      fg.addColorStop(1,    '#807c72');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 2.5);
      ctx.fill();
      ctx.strokeStyle = '#6b675d';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 2.5);
      ctx.stroke();

      // Recessed track with an upper inner shadow
      ctx.fillStyle = '#1b1913';
      ctx.beginPath();
      ctx.roundRect(-bodyW / 2 + 2.5, -trackH / 2 - 2, bodyW - 5, trackH + 4, 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(-bodyW / 2 + 3, -trackH / 2 - 1.6, bodyW - 6, 1.4);

      // Red plastic slider knob: left=off, right=on
      const knobX = comp.on ? knobOffset : -knobOffset;
      const kg = ctx.createLinearGradient(0, -knobH / 2, 0, knobH / 2);
      kg.addColorStop(0,   '#e8695c');
      kg.addColorStop(0.4, '#c93a2c');
      kg.addColorStop(1,   '#8e2015');
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.roundRect(knobX - knobW / 2, -knobH / 2 + 1, knobW, knobH - 2, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,10,4,0.8)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(knobX - knobW / 2, -knobH / 2 + 1, knobW, knobH - 2, 2);
      ctx.stroke();
      // Grip ridges on the knob
      ctx.strokeStyle = 'rgba(255,180,170,0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (const gx of [-3, 0, 3]) {
        ctx.moveTo(knobX + gx, -knobH / 2 + 4);
        ctx.lineTo(knobX + gx, knobH / 2 - 4);
      }
      ctx.stroke();

      // Closed-state cue: same white outline as the schematic look, kept for
      // at-a-glance readability on the cream board.
      if (comp.on) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 2.5);
        ctx.stroke();
      }
    } else {
      // Body
      ctx.fillStyle = '#666';
      ctx.fillRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

      // White outline around whole body when closed (on=true)
      if (comp.on) {
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.5;
      }
      ctx.strokeRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

      // Track
      ctx.fillStyle = '#333';
      ctx.fillRect(-bodyW / 2 + 2, -trackH / 2, bodyW - 4, trackH);

      // Knob: left=off, right=on
      const knobX = comp.on ? knobOffset : -knobOffset;
      ctx.fillStyle = '#000';
      ctx.fillRect(knobX - knobW / 2, -knobH / 2, knobW, knobH);
    }

    ctx.restore();
  }

  _drawDipSwitch(ctx, comp, state) {
    const count = comp.count;
    if (comp.pins.length < 2 * count) return;

    const topPos = [];
    const botPos = [];
    for (let i = 0; i < count; i++) {
      topPos.push(this.world.getHolePosById(comp.pins[i].holeId));
      botPos.push(this.world.getHolePosById(comp.pins[count + i].holeId));
    }
    if (!topPos[0] || !botPos[0]) return;

    const padX  = 6;
    const legLen = 9;
    const legW  = 6;

    const lastTop = topPos[count - 1];
    const bodyX = topPos[0].x - padX;
    const bodyW = (count > 1 ? lastTop.x - topPos[0].x : 0) + padX * 2;
    const bodyTop = topPos[0].y + legLen;
    const bodyBot = botPos[0].y - legLen;
    const bodyH = bodyBot - bodyTop;

    const realistic = state && state.showRealisticBoard;
    const legColor = realistic ? '#b9bcbf' : COLORS.CHIP_PIN;
    const bodyColor = realistic ? '#1c3f8f' : COLORS.CHIP_BODY;

    // Legs
    ctx.fillStyle = legColor;
    for (let i = 0; i < count; i++) {
      const tp = topPos[i];
      const bp = botPos[i];
      if (!tp || !bp) continue;
      ctx.fillRect(tp.x - legW / 2, tp.y - 2, legW, legLen + 2);
      ctx.fillRect(bp.x - legW / 2, bp.y - legLen - 2, legW, legLen + 2);
    }

    // Body
    if (realistic) {
      // Contact shadow + molded blue body with a top light catch
      ctx.fillStyle = 'rgba(40,30,12,0.30)';
      ctx.beginPath();
      ctx.roundRect(bodyX - 1, bodyTop + 2, bodyW + 2, bodyH, 2);
      ctx.fill();
      const bg = ctx.createLinearGradient(0, bodyTop, 0, bodyTop + bodyH);
      bg.addColorStop(0,    '#3a63c0');
      bg.addColorStop(0.08, '#2a4da6');
      bg.addColorStop(0.6,  '#1c3f8f');
      bg.addColorStop(1,    '#132b66');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(bodyX, bodyTop, bodyW, bodyH, 2);
      ctx.fill();
      ctx.strokeStyle = '#0e2150';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(bodyX, bodyTop, bodyW, bodyH, 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = bodyColor;
      ctx.fillRect(bodyX, bodyTop, bodyW, bodyH);
      ctx.strokeStyle = legColor;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bodyX, bodyTop, bodyW, bodyH);
    }

    // Individual switch slots and knobs — fixed size matching original body height,
    // centered vertically in the taller body.
    const slotW        = Math.min(10, GRID.HOLE_SPACING - 4);
    const margin       = 6;
    const origBodyH    = GRID.CHANNEL_GAP - 2 * legLen;  // height when pins were at rows 4/5
    const slotH        = origBodyH - margin * 2;
    const slotTop      = bodyTop + (bodyH - slotH) / 2;

    // "ON" marking + position numbers, printed on the molded body
    if (bodyW > 30) {
      ctx.fillStyle = 'rgba(240,244,255,0.85)';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('ON', bodyX + 3, slotTop + 3);
    }

    for (let i = 0; i < count; i++) {
      const tp = topPos[i];
      if (!tp) continue;
      const cx = tp.x;
      const isOn = comp.states[i];

      if (realistic) {
        // Slot recess with an inner top shadow
        ctx.fillStyle = '#0c1530';
        ctx.beginPath();
        ctx.roundRect(cx - slotW / 2, slotTop, slotW, slotH, 1);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(cx - slotW / 2 + 0.5, slotTop + 0.5, slotW - 1, 1.4);

        // Ivory slider with a subtle 3D face
        const knobH = Math.floor(slotH / 2) - 1;
        const knobY = isOn ? slotTop + 1 : slotTop + slotH - knobH - 1;
        const kg = ctx.createLinearGradient(0, knobY, 0, knobY + knobH);
        kg.addColorStop(0, '#ffffff');
        kg.addColorStop(0.5, '#eceada');
        kg.addColorStop(1, '#c9c5b2');
        ctx.fillStyle = kg;
        ctx.beginPath();
        ctx.roundRect(cx - slotW / 2 + 1, knobY, slotW - 2, knobH, 1);
        ctx.fill();
        ctx.strokeStyle = 'rgba(20,30,60,0.5)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.roundRect(cx - slotW / 2 + 1, knobY, slotW - 2, knobH, 1);
        ctx.stroke();
        // Grip line across the slider face
        ctx.strokeStyle = 'rgba(120,115,95,0.65)';
        ctx.beginPath();
        ctx.moveTo(cx - slotW / 2 + 2.5, knobY + knobH / 2);
        ctx.lineTo(cx + slotW / 2 - 2.5, knobY + knobH / 2);
        ctx.stroke();
      } else {
        // Slot recess
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(cx - slotW / 2, slotTop, slotW, slotH);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx - slotW / 2, slotTop, slotW, slotH);

        // Knob: top half when ON, bottom half when OFF
        const knobH = Math.floor(slotH / 2) - 1;
        const knobY = isOn ? slotTop + 1 : slotTop + slotH - knobH - 1;
        ctx.fillStyle = isOn ? '#c0c0c0' : '#555555';
        ctx.fillRect(cx - slotW / 2 + 1, knobY, slotW - 2, knobH);
      }
    }
  }

  _drawSlideSwitch(ctx, comp, realistic = false) {
    if (comp.pins.length < 3) return;
    const p1 = this.world.getHolePosById(comp.pins[0].holeId);
    const p2 = this.world.getHolePosById(comp.pins[1].holeId);
    const p3 = this.world.getHolePosById(comp.pins[2].holeId);
    if (!p1 || !p2 || !p3) return;

    const cx = (p1.x + p3.x) / 2;
    const cy = (p1.y + p3.y) / 2;
    const bodyW = (p3.x - p1.x) + 14;
    const bodyH = 20;

    // Slider knob geometry, position based on state
    const knobW = 20;
    const knobH = 18;
    let knobX;
    if (comp.state === 0) {
      knobX = (p1.x + p2.x) / 2; // between pin 1 and pin 2
    } else if (comp.state === 1) {
      knobX = p2.x;               // over pin 2 (open, no connection)
    } else {
      knobX = (p2.x + p3.x) / 2; // between pin 2 and pin 3
    }

    if (realistic) {
      // Contact shadow
      ctx.fillStyle = 'rgba(40,30,12,0.28)';
      ctx.beginPath();
      ctx.roundRect(cx - bodyW / 2 - 0.5, cy - bodyH / 2 + 1.5, bodyW + 1, bodyH + 0.5, 2.5);
      ctx.fill();
      // Stamped metal frame
      const fg = ctx.createLinearGradient(0, cy - bodyH / 2, 0, cy + bodyH / 2);
      fg.addColorStop(0,    '#dcdad2');
      fg.addColorStop(0.25, '#c0bcb2');
      fg.addColorStop(0.8,  '#9d998e');
      fg.addColorStop(1,    '#807c72');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.roundRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 2.5);
      ctx.fill();
      ctx.strokeStyle = '#6b675d';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.roundRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 2.5);
      ctx.stroke();

      // Recessed track with an upper inner shadow
      const trackH = 6;
      ctx.fillStyle = '#1b1913';
      ctx.beginPath();
      ctx.roundRect(cx - bodyW / 2 + 2.5, cy - trackH / 2 - 2, bodyW - 5, trackH + 4, 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(cx - bodyW / 2 + 3, cy - trackH / 2 - 1.6, bodyW - 6, 1.4);

      // Red plastic slider knob
      const kg = ctx.createLinearGradient(0, cy - knobH / 2, 0, cy + knobH / 2);
      kg.addColorStop(0,   '#e8695c');
      kg.addColorStop(0.4, '#c93a2c');
      kg.addColorStop(1,   '#8e2015');
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.roundRect(knobX - knobW / 2, cy - knobH / 2 + 1, knobW, knobH - 2, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,10,4,0.8)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(knobX - knobW / 2, cy - knobH / 2 + 1, knobW, knobH - 2, 2);
      ctx.stroke();
      // Grip ridges
      ctx.strokeStyle = 'rgba(255,180,170,0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (const gx of [-4, 0, 4]) {
        ctx.moveTo(knobX + gx, cy - knobH / 2 + 4);
        ctx.lineTo(knobX + gx, cy + knobH / 2 - 4);
      }
      ctx.stroke();
    } else {
      // Body darker gray rectangle, thin black outline
      ctx.fillStyle = '#666';
      ctx.fillRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH);

      // Track dark channel through the center
      const trackH = 6;
      ctx.fillStyle = '#333';
      ctx.fillRect(cx - bodyW / 2 + 2, cy - trackH / 2, bodyW - 4, trackH);

      ctx.fillStyle = '#000';
      ctx.fillRect(knobX - knobW / 2, cy - knobH / 2, knobW, knobH);
    }
  }

  _drawResistor(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;

    // Wire line between endpoints
    ctx.beginPath();
    ctx.moveTo(aPos.x, aPos.y);
    ctx.lineTo(bPos.x, bPos.y);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Resistor body small rectangle aligned to wire angle
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-10, -4, 20, 8);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -4, 20, 8);

    // Color bands (decorative)
    const bands = ['#aa4444', '#444', '#aa8833'];
    for (let i = 0; i < bands.length; i++) {
      ctx.fillStyle = bands[i];
      ctx.fillRect(-7 + i * 5, -4, 2, 8);
    }
    ctx.restore();

    // Pin endpoint dots
    ctx.beginPath();
    ctx.arc(aPos.x, aPos.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bPos.x, bPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Capacitor (schematic style) ──────────────────────────────────────────

  _drawCapacitor(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);
    const upSign = Math.cos(angle) >= 0 ? -1 : 1;

    // Disc-local geometry (origin at disc center, +y toward pins)
    const r         = 8;  // fixed size always 1-hole-apart look
    const lobeOffX  = r * 0.48;
    const lobeHalfW = r * 0.28;
    const lobeExt   = r * 0.32;
    const cornerR   = lobeHalfW * 0.55;
    const smallGap  = 3.6;  // fixed
    const lobeBotY  = r + lobeExt;
    const D         = lobeBotY + smallGap;

    const rlrX = lobeOffX + lobeHalfW;
    const rllX = lobeOffX - lobeHalfW;
    const rlrY = Math.sqrt(Math.max(0, r * r - rlrX * rlrX));
    const rllY = Math.sqrt(Math.max(0, r * r - rllX * rllX));
    const angleTop = -Math.PI / 2;
    const angleRLR = Math.atan2(rlrY, rlrX);
    const angleRLL = Math.atan2(rllY, rllX);
    const angleLLR = Math.PI - angleRLL;
    const angleLLL = Math.PI - angleRLR;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // L-shaped leads from each lobe bottom out to the pin holes
    const leadY = upSign * smallGap;
    ctx.strokeStyle = '#9aa0a6';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo( lobeOffX, leadY);
    ctx.lineTo( lobeOffX, 0);
    ctx.lineTo( dist / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-lobeOffX, leadY);
    ctx.lineTo(-lobeOffX, 0);
    ctx.lineTo(-dist / 2, 0);
    ctx.stroke();

    // Body: draw in disc-local frame with +y toward pins
    ctx.save();
    ctx.translate(0, upSign * D);
    ctx.scale(1, -upSign);

    ctx.beginPath();
    ctx.arc(0, 0, r, angleTop, angleRLR);
    ctx.lineTo(rlrX, lobeBotY - cornerR);
    ctx.quadraticCurveTo(rlrX, lobeBotY, rlrX - cornerR, lobeBotY);
    ctx.lineTo(rllX + cornerR, lobeBotY);
    ctx.quadraticCurveTo(rllX, lobeBotY, rllX, lobeBotY - cornerR);
    ctx.lineTo(rllX, rllY);
    ctx.arc(0, 0, r, angleRLL, angleLLR);
    ctx.lineTo(-rllX, lobeBotY - cornerR);
    ctx.quadraticCurveTo(-rllX, lobeBotY, -rllX - cornerR, lobeBotY);
    ctx.lineTo(-rlrX + cornerR, lobeBotY);
    ctx.quadraticCurveTo(-rlrX, lobeBotY, -rlrX, lobeBotY - cornerR);
    ctx.lineTo(-rlrX, rlrY);
    ctx.arc(0, 0, r, angleLLL, angleTop + 2 * Math.PI);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(0, -r, 0, lobeBotY);
    bodyGrad.addColorStop(0,    '#ff9642');
    bodyGrad.addColorStop(0.55, '#ee6c1e');
    bodyGrad.addColorStop(1,    '#b84b10');
    ctx.fillStyle = bodyGrad;
    ctx.fill();



    ctx.restore();
    ctx.restore();

    // Pin endpoint dots
    ctx.beginPath();
    ctx.arc(aPos.x, aPos.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bPos.x, bPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Inductor (top view: dark core rod with copper winding) ──────────────
  // Black core rectangle on the lead axis with its ends exposed, wrapped by
  // stacked, slightly bowed copper rings so the wire reads as coiled around it.

  _drawInductor(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);

    const bodyHalf = Math.min(dist * 0.38, 20);   // core half-length
    const coreHalfH = Math.min(6, bodyHalf * 0.45); // core half-height
    const windHalf = bodyHalf * 0.72;             // winding half-length (core ends stay bare)
    const ringHalfH = coreHalfH + 1.2;            // rings wrap just past the core edges

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Copper leads from the pins to the ends of the winding
    ctx.strokeStyle = '#b87333';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-windHalf, 0);
    ctx.moveTo(windHalf, 0);
    ctx.lineTo(dist / 2, 0);
    ctx.stroke();

    // Core: dark cylinder rod, ends protruding beyond the winding
    const coreGrad = ctx.createLinearGradient(0, -coreHalfH, 0, coreHalfH);
    coreGrad.addColorStop(0,    '#1c1c1e');
    coreGrad.addColorStop(0.45, '#3d3d40');
    coreGrad.addColorStop(1,    '#111113');
    ctx.beginPath();
    ctx.roundRect(-bodyHalf, -coreHalfH, bodyHalf * 2, coreHalfH * 2, coreHalfH * 0.6);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Winding: stacked copper rings, each bowed to one side so the wire
    // appears to wrap around the core like a beehive of turns
    const spacing = 3.3;
    const turns = Math.max(5, Math.floor((windHalf * 2) / spacing));
    const step = (windHalf * 2) / turns;
    const bow = 1.8;    // sideways bulge of each ring
    const lean = 0.7;   // helix slant: top of each ring trails the bottom
    const ringGrad = ctx.createLinearGradient(0, -ringHalfH, 0, ringHalfH);
    ringGrad.addColorStop(0,   '#8a4d16');
    ringGrad.addColorStop(0.5, '#f2a35c');
    ringGrad.addColorStop(1,   '#8a4d16');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = Math.min(2.4, step * 0.72);
    ctx.beginPath();
    for (let i = 0; i < turns; i++) {
      const tx = -windHalf + step * (i + 0.5);
      ctx.moveTo(tx - lean, -ringHalfH);
      ctx.quadraticCurveTo(tx + bow, 0, tx - lean, ringHalfH);
    }
    ctx.stroke();

    ctx.restore();

    // Pin endpoint dots
    ctx.beginPath();
    ctx.arc(aPos.x, aPos.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bPos.x, bPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Capacitor (realistic ceramic disc) ─────────────────────────────────

  _drawCapacitorRealistic(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);
    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const upSign = Math.cos(angle) >= 0 ? -1 : 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Front-facing disc view: full circular face offset perpendicular (screen-up)
    // from the lead axis, with both leads emerging from the underside and angling
    // outward to reach the pins matches the classic ceramic-disc look.
    const r = Math.min(dist * 0.38, 10.5);
    const discCy = upSign * r * 1.0;
    const leadSpread = r * 0.42;
    const attachY = discCy - upSign * Math.sqrt(Math.max(0, r * r - leadSpread * leadSpread));

    // Tinned leads from pins into the underside of the disc
    ctx.strokeStyle = '#a6aaae';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-leadSpread, attachY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(leadSpread, attachY);
    ctx.stroke();

    // Contact shadow under the disc
    ctx.fillStyle = 'rgba(40,30,12,0.20)';
    ctx.beginPath();
    ctx.ellipse(0.5, discCy + 1.4, r, r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Disc body: dipped-ceramic orange with the light biased top-left.
    // A slightly wavy rim (dip-coating bulge) reads more like the real part
    // than a perfect circle.
    const bodyGrad = ctx.createRadialGradient(
      -r * 0.35, discCy - r * 0.4, r * 0.15, 0, discCy, r * 1.05
    );
    bodyGrad.addColorStop(0,    '#ffab5e');
    bodyGrad.addColorStop(0.45, '#f27a28');
    bodyGrad.addColorStop(0.85, '#d55c16');
    bodyGrad.addColorStop(1,    '#b34a10');
    ctx.beginPath();
    ctx.arc(0, discCy, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Soft dark outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(80, 32, 6, 0.75)';
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 235, 205, 0.5)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, discCy - r * 0.42, r * 0.34, r * 0.18, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Capacitance marking on the face when there's room (e.g. "104")
    if (r >= 8 && comp.capacitance) {
      const code = this._capCodeMarking(comp.capacitance);
      if (code) {
        ctx.font = 'bold 5.5px monospace';
        ctx.fillStyle = 'rgba(60, 24, 4, 0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(code, 0, discCy + r * 0.18);
      }
    }

    ctx.restore();
  }

  /** Three-digit EIA marking for a capacitance in farads (e.g. 1e-7 → "104"). */
  _capCodeMarking(farads) {
    if (!farads || farads <= 0) return null;
    const pF = farads * 1e12;
    if (pF < 10 || pF >= 1e6) return null;
    const exp = Math.floor(Math.log10(pF)) - 1;
    const sig = Math.round(pF / Math.pow(10, exp));
    if (sig < 10 || sig > 99) return null;
    return `${sig}${exp}`;
  }

  // ── Polarized Capacitor (schematic style) ────────────────────────────────

  _drawPolarizedCapacitor(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);
    // Rotate so cylinder stands perpendicular to the A→B line
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);

    const bodyW   = 15;  // fixed max size
    const bodyH   = 26;  // fixed max size
    const capRy   = bodyW * 0.2;   // elliptic top/bottom cap height
    const stripeW = bodyW * 0.26;  // negative stripe width

    // Which Y direction in rotated frame maps to screen-up
    const upSign = Math.cos(angle) >= 0 ? -1 : 1;

    const legLen    = 8;  // fixed
    const cylBottom = upSign * legLen;           // near edge (close to wire), screen-upward
    const cylTop    = upSign * (legLen + bodyH); // far edge (away from wire), screen-upward
    const rectTop   = Math.min(cylTop, cylBottom); // upper canvas-Y for fillRect

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Leads from pin holes to bottom of cylinder (both from same side)
    ctx.strokeStyle = '#8e8e8e';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-bodyW * 0.22, cylBottom - upSign * capRy * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(bodyW * 0.22, cylBottom - upSign * capRy * 0.4);
    ctx.stroke();

    // Near-side cap half-ellipse facing the wire (3D depth body covers the rest)
    ctx.beginPath();
    ctx.ellipse(0, cylBottom, bodyW / 2, capRy, 0,
      upSign < 0 ? 0 : Math.PI,
      upSign < 0 ? Math.PI : 2 * Math.PI);
    ctx.fillStyle = '#2a5e7a';
    ctx.fill();

    // Body rectangle
    const bodyGrad = ctx.createLinearGradient(-bodyW / 2, 0, bodyW / 2, 0);
    bodyGrad.addColorStop(0,    '#7ab8d2');
    bodyGrad.addColorStop(0.38, '#4f8eb1');
    bodyGrad.addColorStop(1,    '#2f698a');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-bodyW / 2, rectTop, bodyW, bodyH);

    // Negative stripe on the right (B / cathode side)
    ctx.save();
    ctx.beginPath();
    ctx.rect(-bodyW / 2, rectTop, bodyW, bodyH);
    ctx.clip();
    const stripeGrad = ctx.createLinearGradient(bodyW / 2 - stripeW, 0, bodyW / 2, 0);
    stripeGrad.addColorStop(0,   '#c8d4de');
    stripeGrad.addColorStop(0.5, '#eaf0f6');
    stripeGrad.addColorStop(1,   '#b0bec8');
    ctx.fillStyle = stripeGrad;
    ctx.fillRect(bodyW / 2 - stripeW, rectTop, stripeW, bodyH);
    ctx.restore();

    // Body side outlines (far edge covered by cap ellipse)
    ctx.strokeStyle = '#19455b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2, cylTop);
    ctx.lineTo(-bodyW / 2, cylBottom);
    ctx.lineTo( bodyW / 2, cylBottom);
    ctx.lineTo( bodyW / 2, cylTop);
    ctx.stroke();

    // Far-side cap ellipse (3D cylinder look)
    const topGrad = ctx.createLinearGradient(0, cylTop - capRy, 0, cylTop + capRy);
    topGrad.addColorStop(0, '#9acce0');
    topGrad.addColorStop(1, '#4a8ab0');
    ctx.beginPath();
    ctx.ellipse(0, cylTop, bodyW / 2, capRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.strokeStyle = '#19455b';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // + marker on positive (A / anode) side
    ctx.font = 'bold 7px sans-serif';
    ctx.fillStyle = '#e8f4fb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 35% from the far (screen-top) end toward the near end consistent regardless of direction
    ctx.fillText('+', -bodyW * 0.3, cylTop - upSign * bodyH * 0.35);

    ctx.restore();

    // Pin endpoint dots (world space after restore)
    ctx.beginPath();
    ctx.arc(aPos.x, aPos.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bPos.x, bPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Polarized Capacitor (realistic electrolytic) ────────────────────────

  _drawPolarizedCapacitorRealistic(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const bPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !bPos) return;

    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);
    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Cylindrical electrolytic body
    const bodyW = Math.min(dist * 0.45, 20);
    const bodyH = Math.min(dist * 0.5, 11);
    const halfW = bodyW / 2;
    const halfH = bodyH / 2;

    // Tinned lead wires
    ctx.strokeStyle = '#b0b3b6';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-halfW, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(halfW, 0);
    ctx.stroke();

    // Contact shadow
    ctx.fillStyle = 'rgba(40,30,12,0.22)';
    ctx.beginPath();
    ctx.roundRect(-halfW + 0.5, -halfH + 1.5, bodyW, bodyH, 2);
    ctx.fill();

    // Main cylindrical body: navy vinyl sleeve with a glossy top band
    const bodyGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    bodyGrad.addColorStop(0,    '#2e2e40');
    bodyGrad.addColorStop(0.18, '#5a5a72');
    bodyGrad.addColorStop(0.35, '#43435a');
    bodyGrad.addColorStop(0.75, '#26263a');
    bodyGrad.addColorStop(1,    '#141422');
    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, bodyW, bodyH, 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Crimp grooves near the positive end (sleeve pinched into the can)
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-halfW + 3.5, -halfH + 0.8);
    ctx.lineTo(-halfW + 3.5, halfH - 0.8);
    ctx.moveTo(-halfW + 5.5, -halfH + 0.8);
    ctx.lineTo(-halfW + 5.5, halfH - 0.8);
    ctx.stroke();

    // Silver stripe on negative (B) side rightmost ~28% of body
    const stripeX = halfW * 0.44;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, bodyW, bodyH, 2);
    ctx.clip();
    const stripeGrad = ctx.createLinearGradient(stripeX, 0, halfW, 0);
    stripeGrad.addColorStop(0, '#b0b8c8');
    stripeGrad.addColorStop(0.4, '#d0d8e8');
    stripeGrad.addColorStop(1, '#a0a8b8');
    ctx.fillStyle = stripeGrad;
    ctx.fillRect(stripeX, -halfH, halfW - stripeX, bodyH);
    ctx.restore();

    // Body outline
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, bodyW, bodyH, 2);
    ctx.stroke();

    // Metal end caps
    ctx.beginPath();
    ctx.ellipse(-halfW + 1.5, 0, 2, halfH * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8898aa';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(halfW - 1.5, 0, 2, halfH * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8898aa';
    ctx.fill();

    // + marker on positive (A) side
    ctx.font = `bold ${Math.max(5, Math.round(halfH * 0.9))}px sans-serif`;
    ctx.fillStyle = '#e0e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', -halfW * 0.35, 0);

    ctx.restore();
  }

  // ── Diode drawing ─────────────────────────────────────────────────────────

  _drawDiode(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const cPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !cPos) return;

    const cx = (aPos.x + cPos.x) / 2;
    const cy = (aPos.y + cPos.y) / 2;
    const angle = Math.atan2(cPos.y - aPos.y, cPos.x - aPos.x);
    const dist = Math.hypot(cPos.x - aPos.x, cPos.y - aPos.y);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const bodyW = 22;
    const bodyH = 10;
    const halfW = bodyW / 2;
    const halfH = bodyH / 2;

    // Tinned leads
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-halfW + 1, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(halfW - 1, 0);
    ctx.stroke();

    // Dark epoxy body
    const bodyGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    bodyGrad.addColorStop(0, '#4a4a4a');
    bodyGrad.addColorStop(0.25, '#2a2a2a');
    bodyGrad.addColorStop(0.6, '#1a1a1a');
    bodyGrad.addColorStop(1, '#333');
    ctx.beginPath();
    ctx.rect(-halfW, -halfH, bodyW, bodyH);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Cathode band stripe (right side)
    ctx.save();
    ctx.beginPath();
    ctx.rect(-halfW, -halfH, bodyW, bodyH);
    ctx.clip();
    const bandGrad = ctx.createLinearGradient(halfW - 8, 0, halfW - 2, 0);
    bandGrad.addColorStop(0, '#999');
    bandGrad.addColorStop(0.4, '#d0d0d0');
    bandGrad.addColorStop(1, '#bbb');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(halfW - 7, -halfH, 5, bodyH);
    ctx.restore();

    // Current direction arrow: small triangle pointing anode→cathode (left→right)
    // Centered in the dark body area (left of cathode band)
    const ts = Math.min(halfH * 0.58, 2.6);  // half-size of triangle
    const tx = (-halfW + (halfW - 7)) / 2;   // center of non-band area
    ctx.beginPath();
    ctx.moveTo(tx - ts, -ts);
    ctx.lineTo(tx + ts, 0);
    ctx.lineTo(tx - ts,  ts);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fill();

    ctx.restore();
  }

  // 2-pin quartz crystal: two nested pill (stadium) shapes a dark outer pill
  // for the can edge and a lighter inner pill for the raised dome/bump. Tinned
  // leads run out to the two holes. The inner pill lights up when OUT is HIGH.
  _drawCrystal(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId); // OUT
    const bPos = this.world.getHolePosById(comp.pins[1].holeId); // GND
    if (!aPos || !bPos) return;

    const cx = (aPos.x + bPos.x) / 2;
    const cy = (aPos.y + bPos.y) / 2;
    const angle = Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    const dist = Math.hypot(bPos.x - aPos.x, bPos.y - aPos.y);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const bodyW = 26;
    const bodyH = 13;
    const halfW = bodyW / 2;

    // Pill / stadium centred on the origin (fully rounded ends)
    const pill = (w, h) => {
      const hw = w / 2, hh = h / 2, rad = hh;
      ctx.beginPath();
      ctx.moveTo(-hw + rad, -hh);
      ctx.arcTo( hw, -hh,  hw,  hh, rad);
      ctx.arcTo( hw,  hh, -hw,  hh, rad);
      ctx.arcTo(-hw,  hh, -hw, -hh, rad);
      ctx.arcTo(-hw, -hh,  hw, -hh, rad);
      ctx.closePath();
    };

    // Tinned leads from each hole to the can body
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-halfW + 1, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(halfW - 1, 0);
    ctx.stroke();

    // Outer pill the can edge (darker)
    pill(bodyW, bodyH);
    ctx.fillStyle = '#33373b';
    ctx.fill();
    ctx.strokeStyle = '#1c1e20';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Inner pill the raised dome/bump. Fixed white — the crystal is idealized as
    // a self-running clock, so its body doesn't visually change with the tick.
    pill(bodyW - 6, bodyH - 5);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  _drawDiodeRealistic(ctx, comp) {
    if (comp.pins.length < 2) return;
    const aPos = this.world.getHolePosById(comp.pins[0].holeId);
    const cPos = this.world.getHolePosById(comp.pins[1].holeId);
    if (!aPos || !cPos) return;

    const cx = (aPos.x + cPos.x) / 2;
    const cy = (aPos.y + cPos.y) / 2;
    const angle = Math.atan2(cPos.y - aPos.y, cPos.x - aPos.x);
    const dist = Math.hypot(cPos.x - aPos.x, cPos.y - aPos.y);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const bodyW = 22;
    const bodyH = 10;
    const halfW = bodyW / 2;
    const halfH = bodyH / 2;

    // Tinned leads
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dist / 2, 0);
    ctx.lineTo(-halfW + 1, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dist / 2, 0);
    ctx.lineTo(halfW - 1, 0);
    ctx.stroke();

    // Dark epoxy body (square)
    const bodyGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    bodyGrad.addColorStop(0, '#4a4a4a');
    bodyGrad.addColorStop(0.25, '#2a2a2a');
    bodyGrad.addColorStop(0.6, '#1a1a1a');
    bodyGrad.addColorStop(1, '#333');
    ctx.beginPath();
    ctx.rect(-halfW, -halfH, bodyW, bodyH);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Cathode band stripe (silver, right side stops short of edge)
    ctx.save();
    ctx.beginPath();
    ctx.rect(-halfW, -halfH, bodyW, bodyH);
    ctx.clip();
    const bandGrad = ctx.createLinearGradient(halfW - 8, 0, halfW - 2, 0);
    bandGrad.addColorStop(0, '#999');
    bandGrad.addColorStop(0.4, '#d0d0d0');
    bandGrad.addColorStop(1, '#bbb');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(halfW - 7, -halfH, 5, bodyH);
    ctx.restore();

    // Specular highlight
    ctx.beginPath();
    ctx.ellipse(-halfW * 0.15, -halfH * 0.45, bodyW * 0.28, halfH * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();

    ctx.restore();
  }

  // ── Resistor / Capacitor / Diode Labels (top-most z pass) ─────────────────

  _drawResistorLabels(ctx, state, partialCompIds) {
    if (!state.showValues && !state.showRealisticBoard) return;
    const realistic = state.showRealisticBoard;
    for (const comp of state.components) {
      if (!comp.placed || (comp.type !== COMP.RESISTOR && comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR && comp.type !== COMP.INDUCTOR)) continue;
      // Skip the comp whose endpoint is being dragged its body is hidden
      // and the live preview handles its visualization (without label).
      if (state.draggingCompEp && state.draggingCompEp.comp.id === comp.id) continue;
      // Skip partial endpoint comps their ghost handles rendering
      if (partialCompIds && partialCompIds.has(comp.id)) continue;
      // In realistic mode, suppress capacitor value text unless Circuit Analysis tab is open
      if (realistic && !state.showValues && (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR)) continue;
      if (comp.pins.length < 2) continue;
      const aPos = this.world.getHolePosById(comp.pins[0].holeId);
      const bPos = this.world.getHolePosById(comp.pins[1].holeId);
      if (!aPos || !bPos) continue;
      const cx = (aPos.x + bPos.x) / 2;
      const cy = (aPos.y + bPos.y) / 2;
      ctx.font = realistic ? 'bold 7px sans-serif' : 'bold 7px monospace';
      ctx.fillStyle = realistic ? '#3a3020' : COLORS.COMPONENT_TEXT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(comp.getLabel(), cx, cy - 8);
    }
  }

  // ── Node Values Overlay ───────────────────────────────────────────────────

  _drawNodeValues(ctx, state) {
    const sim = state.simulator;
    if (!sim) return;

    // Voltage labels (amber) at unique wire endpoint holes
    const labeled = new Set();
    for (const wire of state.wireManager.wires) {
      for (const holeId of [wire.startHoleId, wire.endHoleId]) {
        const pos = this.world.getHolePosById(holeId);
        if (!pos) continue;
        const key = `${Math.round(pos.x)},${Math.round(pos.y)}`;
        if (labeled.has(key)) continue;
        labeled.add(key);
        const net = sim.netlist.findNetByHole(holeId);
        if (!net) continue;
        const v = sim.netVoltages.get(net.id);
        if (v === undefined) continue;
        const label = v.toFixed(2) + 'V';
        ctx.save();
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, pos.x, pos.y - 11);
        ctx.restore();
      }
    }

    // Current labels (cyan) at resistor/LED/capacitor/diode body midpoints
    for (const comp of state.components) {
      if (!comp.placed) continue;
      if (comp.type !== COMP.RESISTOR && comp.type !== COMP.LED && comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR && comp.type !== COMP.INDUCTOR && comp.type !== COMP.DIODE) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      const p0 = this.world.getHolePosById(comp.pins[0].holeId);
      const p1 = this.world.getHolePosById(comp.pins[1].holeId);
      if (!p0 || !p1) continue;
      const I = sim.getComponentCurrent(comp.id);
      if (!I || I < 1e-7) continue;
      let label;
      if (I >= 1) label = I.toFixed(2) + 'A';
      else if (I >= 0.001) label = (I * 1000).toFixed(2) + 'mA';
      else label = (I * 1e6).toFixed(1) + 'μA';
      const cx = (p0.x + p1.x) / 2;
      const cy = (p0.y + p1.y) / 2;
      ctx.save();
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, cx, cy + 3);
      ctx.restore();
    }

    // Charge labels (amber) at capacitor body midpoints. Q = C · ΔV.
    // Stacked below the current label when one is drawn, otherwise at top of body.
    for (const comp of state.components) {
      if (!comp.placed) continue;
      if (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      const p0 = this.world.getHolePosById(comp.pins[0].holeId);
      const p1 = this.world.getHolePosById(comp.pins[1].holeId);
      if (!p0 || !p1) continue;
      const netA = sim.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = sim.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB) continue;
      const vA = sim.netVoltages.get(netA.id);
      const vB = sim.netVoltages.get(netB.id);
      if (vA === undefined || vB === undefined) continue;
      const Q = comp.capacitance * (vA - vB);
      const absQ = Math.abs(Q);
      if (absQ < 1e-12) continue; // skip < 1 pC
      let label;
      if (absQ >= 1e-3)      label = (Q * 1e3).toFixed(2) + 'mC';
      else if (absQ >= 1e-6) label = (Q * 1e6).toFixed(2) + 'µC';
      else if (absQ >= 1e-9) label = (Q * 1e9).toFixed(1) + 'nC';
      else                   label = (Q * 1e12).toFixed(1) + 'pC';
      const I = sim.getComponentCurrent(comp.id);
      const hasCurrentLabel = I && Math.abs(I) >= 1e-7;
      const cx = (p0.x + p1.x) / 2;
      const cy = (p0.y + p1.y) / 2;
      ctx.save();
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, cx, cy + (hasCurrentLabel ? 13 : 3));
      ctx.restore();
    }
  }

  // ── Wire Power Utilities ──────────────────────────────────────────────────

  // Check if a holeId is on a power rail and return 'VCC', 'GND', or null
  // breadboard.js power rows: 0=top−(GND), 1=top+(VCC), 2=bottom−(GND), 3=bottom+(VCC)
  _powerLabel(holeId) {
    const parts = holeId.split(':');
    if (parts[2] === 'power') {
      const railRow = parseInt(parts[4]);
      return (railRow === 1 || railRow === 3) ? 'VCC' : 'GND';
    }
    return null;
  }

  // Build map of net number → 'VCC' | 'GND' for any net touching a power rail
  _buildPowerNodes(wires) {
    const powerNodes = new Map();
    for (const wire of wires) {
      const startPower = this._powerLabel(wire.startHoleId);
      const endPower   = this._powerLabel(wire.endHoleId);
      if (startPower) {
        powerNodes.set(wire.startNet, startPower);
        powerNodes.set(wire.endNet,   startPower);
      }
      if (endPower) {
        powerNodes.set(wire.endNet,   endPower);
        powerNodes.set(wire.startNet, endPower);
      }
    }
    return powerNodes;
  }

  // Build power map from simulator voltage data wires glow if their net
  // has voltage > 2.5V (powered), and show GND for 0V nodes
  _buildPowerNodesFromSim(wires, simulator) {
    const powerNodes = new Map();
    for (const wire of wires) {
      const labelStart = this._simPowerLabel(wire.startHoleId, simulator);
      const labelEnd   = this._simPowerLabel(wire.endHoleId, simulator);
      if (labelStart) {
        powerNodes.set(wire.startNet, labelStart);
        if (!powerNodes.has(wire.endNet)) powerNodes.set(wire.endNet, labelStart);
      }
      if (labelEnd) {
        powerNodes.set(wire.endNet, labelEnd);
        if (!powerNodes.has(wire.startNet)) powerNodes.set(wire.startNet, labelEnd);
      }
    }
    return powerNodes;
  }

  _simPowerLabel(holeId, simulator) {
    // Direct power rail check first
    const direct = this._powerLabel(holeId);
    if (direct) return direct;
    // Check simulator voltage data
    if (simulator.isNetVCC(holeId)) return 'VCC';
    const net = simulator.netlist.findNetByHole(holeId);
    if (net) {
      const v = simulator.netVoltages.get(net.id);
      if (v !== undefined && v >= 4.9) return 'VCC';
      if (v !== undefined && v <= 0.1) return 'GND';
    }
    return null;
  }

  // ── Powered-Wire Glow + Current Dots ─────────────────────────────────────

  _drawPoweredWires(ctx, wires, powerNodes, simulator) {
    const now = performance.now() / 1000; // seconds

    for (const wire of wires) {
      const startPos = this.world.getHolePosById(wire.startHoleId);
      const endPos   = this.world.getHolePosById(wire.endHoleId);
      if (!startPos || !endPos) continue;

      // Get voltage and current from the simulator
      const vStart = simulator ? simulator.getVoltageAtHole(wire.startHoleId) : undefined;
      const vEnd   = simulator ? simulator.getVoltageAtHole(wire.endHoleId)   : undefined;
      const iStart = simulator ? simulator.getCurrentAtHole(wire.startHoleId) : 0;
      const iEnd   = simulator ? simulator.getCurrentAtHole(wire.endHoleId)   : 0;

      const maxV = Math.max(vStart !== undefined ? vStart : 0, vEnd !== undefined ? vEnd : 0);
      const maxI = Math.max(iStart, iEnd);

      // Determine direction: current flows from high voltage to low voltage
      const vS = vStart !== undefined ? vStart : 0;
      const vE = vEnd   !== undefined ? vEnd   : 0;
      const fromPos = vS >= vE ? startPos : endPos;
      const toPos   = vS >= vE ? endPos   : startPos;

      const dx  = toPos.x - fromPos.x;
      const dy  = toPos.y - fromPos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2) continue;

      // Glow line: interpolate from light gray (0V) to red (5V)
      const t = Math.min(1, maxV / 5.0);
      const gR = 220;
      const gG = Math.round(220 - 180 * t);
      const gB = Math.round(220 - 180 * t);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.strokeStyle = `rgb(${gR}, ${gG}, ${gB})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Animated dots: only when current > 0 (requires complete circuit path)
      // TODO: Re-enable animated current-flow dots when feature is ready
      // if (maxI > 0.0001) {
      //   const spacing = 16;   // px between dots
      //   // Speed proportional to current: 5mA → ~25px/s, 50mA → ~120px/s
      //   const speed   = Math.min(120, Math.max(10, maxI * 5000));
      //   const dotR    = 2.2;
      //   const offset  = (now * speed) % spacing;
      //   const numDots = Math.ceil(len / spacing) + 1;
      //
      //   for (let i = 0; i < numDots; i++) {
      //     const t = (offset + i * spacing) / len;
      //     if (t < 0 || t > 1) continue;
      //     const px = fromPos.x + dx * t;
      //     const py = fromPos.y + dy * t;
      //     ctx.beginPath();
      //     ctx.arc(px, py, dotR, 0, Math.PI * 2);
      //     ctx.fillStyle = 'rgba(255, 90, 90, 0.9)';
      //     ctx.fill();
      //   }
      // }
    }
  }

  // ── Wire Endpoints ────────────────────────────────────────────────────────

  // ── Clock Component ───────────────────────────────────────────────────────
  _drawClock(ctx, comp) {
    if (!comp.placed || comp.pins.length === 0) return;
    const pos = this.world.getHolePosById(comp.pins[0].holeId);
    if (!pos) return;

    const radius = 8;

    // Blue filled circle (same size as wire terminal)
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1565c0';
    ctx.fill();

    // Red outline when HIGH, like a powered wire terminal
    if (comp.high) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(220, 50, 50, 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 'CLK' label same style as VCC/GND text on wire terminals
    ctx.font = 'bold 6px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLK', pos.x, pos.y + 1);
  }

  // ── Test point ─────────────────────────────────────────────────────────────
  // A labelled probe flag on a single hole. The terminal dot uses the test
  // point's lane color (matching its timing-diagram trace); the red "powered"
  // ring follows the same convention as wire endpoints — net voltage above
  // the family VIH (see _drawWireEndpoint).
  _drawTestPoint(ctx, comp, state) {
    if (!comp.placed || comp.pins.length === 0) return;
    const pos = this.world.getHolePosById(comp.pins[0].holeId);
    if (!pos) return;

    const simulator = state && state.simulator;
    const radius = 6;

    // Terminal dot in the lane color
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = comp.color || '#f39c12';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Powered ring: net above the family VIH — identical rule to wire terminals
    if (simulator) {
      const v = simulator.getVoltageAtHole(comp.pins[0].holeId);
      const vih = simulator._spec ? simulator._spec.VIH : 2.0;
      if (v !== undefined && v > vih) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(220, 50, 50, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    // Label flag above the dot (below when on the top row so it stays on-board)
    const label = comp.label || 'TP';
    const below = comp.row <= 0;
    const flagY = below ? pos.y + radius + 11 : pos.y - radius - 11;
    ctx.font = 'bold 9px monospace';
    const w = ctx.measureText(label).width + 8;
    ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
    ctx.strokeStyle = comp.color || '#f39c12';
    ctx.lineWidth = 1.5;
    const rx = pos.x - w / 2, ry = flagY - 8, rw = w, rh = 15;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, 3);
    else ctx.rect(rx, ry, rw, rh);
    ctx.fill();
    ctx.stroke();
    // Stem from flag to dot
    ctx.beginPath();
    ctx.moveTo(pos.x, below ? ry : ry + rh);
    ctx.lineTo(pos.x, below ? pos.y + radius : pos.y - radius);
    ctx.strokeStyle = comp.color || '#f39c12';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, pos.x, flagY - 0.5);
  }

  _drawWireEndpoints(ctx, state, _powerNodes, simulator, skipWireIds) {
    // While dragging a single endpoint, hide that endpoint circle so the
    // dashed preview line from the stationary end is the only visual indicator
    const dwe = state.draggingWireEp; // { wire, endpoint: 'start'|'end' } or null

    for (const wire of state.wireManager.wires) {
      if (skipWireIds && skipWireIds.has(wire.id)) continue;
      const skipStart = dwe && dwe.wire.id === wire.id && dwe.endpoint === 'start';
      const skipEnd   = dwe && dwe.wire.id === wire.id && dwe.endpoint === 'end';
      if (!skipStart) this._drawWireEndpoint(ctx, wire.startHoleId, wire.startNet, wire.color, simulator);
      if (!skipEnd)   this._drawWireEndpoint(ctx, wire.endHoleId,   wire.endNet,   wire.color, simulator);
    }
  }

  _drawWireEndpoint(ctx, holeId, netNum, color, simulator) {
    const pos = this.world.getHolePosById(holeId);
    if (!pos) return;

    // Determine VCC/GND label. The hole's own rail position is the authoritative
    // truth: a terminal sitting on the − rail must read GND even if the net it
    // belongs to is shorted to VCC elsewhere   otherwise the user can't see which
    // side of the short is which.
    let powerLabel = this._powerLabel(holeId);
    // Off-rail holes inherit their label from the net's rail tags (set by BFS
    // over wires + breadboard internal connections in netlist.build).
    if (!powerLabel && simulator && simulator.netlist && simulator.netlist.nodes.length > 0) {
      const net = simulator.netlist.findNetByHole(holeId);
      if (net) {
        if (net.isVCC) powerLabel = 'VCC';
        else if (net.isGND) powerLabel = 'GND';
      }
    }

    const label = powerLabel || String(netNum);

    // Same-size circle for all endpoints
    const isVCC = label === 'VCC';
    const isGND = label === 'GND';
    const isLabel = isVCC || isGND;
    const radius = 8;
    const circleColor = isVCC ? '#cc0000' : isGND ? '#111111' : color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = circleColor;
    ctx.fill();

    // Red outline on numbered (non-VCC/GND) terminals when the net's voltage
    // would register as a logic HIGH input for the active 74-series family
    // (i.e. above VIH). Below VIH a real chip can't be guaranteed to read it
    // as a 1, so the terminal isn't drawn as "powered".
    if (!isLabel && simulator) {
      const v = simulator.getVoltageAtHole(holeId);
      const vih = simulator._spec ? simulator._spec.VIH : 2.0;
      if (v !== undefined && v > vih) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(220, 50, 50, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Label text keep numbered text at 8px, power labels at 6px
    ctx.font = isLabel ? 'bold 6px monospace' : 'bold 8px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, pos.x, pos.y + (isLabel ? 1 : 0));
  }

  // ── Short-Circuit Highlight ───────────────────────────────────────────────
  // Paints a bright red ring on every wire endpoint and component pin sitting
  // on a shorted net, so the user can spot the offending wires plus the
  // closed switch/pressed button bridging VCC↔GND. Static color (no pulse)  
  // the main render loop is dirty-gated, so a continuous animation wouldn't
  // run without forcing redraws every frame.
  _drawShortHighlights(ctx, state) {
    const sim = state.simulator;
    if (!sim || !sim.netlist) return;
    const shortNetIds = sim.shortCircuits;
    const shortCompIds = sim.shortCircuitComponents;
    if (shortNetIds.length === 0 && (!shortCompIds || shortCompIds.size === 0)) return;

    const shortNetSet = new Set(shortNetIds);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 32, 32, 0.95)';
    ctx.lineWidth = 3;

    const ring = (holeId) => {
      const pos = this.world.getHolePosById(holeId);
      if (!pos) return;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawnHoles = new Set();
    const ringOnce = (holeId) => {
      if (drawnHoles.has(holeId)) return;
      drawnHoles.add(holeId);
      ring(holeId);
    };

    // Wires: any endpoint whose net is in shortCircuits gets ringed.
    for (const wire of state.wireManager.wires) {
      const sNet = sim.netlist.findNetByHole(wire.startHoleId);
      const eNet = sim.netlist.findNetByHole(wire.endHoleId);
      if (sNet && shortNetSet.has(sNet.id)) ringOnce(wire.startHoleId);
      if (eNet && shortNetSet.has(eNet.id)) ringOnce(wire.endHoleId);
    }

    // Bridging components (closed switch, pressed button, slide-switch active):
    // every pin gets ringed regardless of which side is the rail.
    if (shortCompIds && shortCompIds.size > 0) {
      for (const comp of state.components) {
        if (!comp.placed || !shortCompIds.has(comp.id)) continue;
        for (const pin of comp.pins) ringOnce(pin.holeId);
      }
    }

    ctx.restore();
  }

  // ── Wire Preview ──────────────────────────────────────────────────────────
  _drawWirePreview(ctx, state) {
    const startPos = this.world.getHolePosById(state.wireStart.id);
    if (!startPos) return;

    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(state.mouseWorld.x, state.mouseWorld.y);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight start point
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ── Component Drag Preview ─────────────────────────────────────────────────
  // Renders the actual component body following the cursor while a 2-terminal
  // component is being placed (initial 2-click flow) or its endpoint is being
  // dragged. Uses sentinel hole IDs + a temporary world.getHolePosById patch
  // so the existing _drawXxx body functions render the body at arbitrary
  // (stationary, lead-end) positions without modification.
  _drawCompDragPreview(ctx, state) {
    const dp = state.compDragPreview;
    if (!dp) return;
    const { comp, endpoint, stationaryPos, endPos } = dp;
    if (!comp || !stationaryPos || !endPos) return;

    const SENTINEL_STATIONARY = '__compDragPreview_stationary__';
    const SENTINEL_MOVING = '__compDragPreview_moving__';

    // Snapshot the bits we mutate so we can restore them.
    const origStartHoleId = comp.startHoleId;
    const origEndHoleId = comp.endHoleId;
    const origPins = comp.pins;
    const origPlaced = comp.placed;

    if (endpoint === 'start') {
      comp.startHoleId = SENTINEL_MOVING;
      comp.endHoleId = SENTINEL_STATIONARY;
    } else {
      comp.startHoleId = SENTINEL_STATIONARY;
      comp.endHoleId = SENTINEL_MOVING;
    }
    // Build minimal pins so body draws (which read pins[0..1].holeId) work
    // regardless of whether we're previewing a placed comp or an unplaced ghost.
    const basePin0 = origPins && origPins[0] ? origPins[0] : { pinIndex: 0, name: 'A', type: 'passive' };
    const basePin1 = origPins && origPins[1] ? origPins[1] : { pinIndex: 1, name: 'B', type: 'passive' };
    comp.pins = [
      { ...basePin0, holeId: comp.startHoleId },
      { ...basePin1, holeId: comp.endHoleId },
    ];
    comp.placed = true;

    const origGetHolePos = this.world.getHolePosById.bind(this.world);
    this.world.getHolePosById = (id) => {
      if (id === SENTINEL_STATIONARY) return stationaryPos;
      if (id === SENTINEL_MOVING) return endPos;
      return origGetHolePos(id);
    };

    ctx.save();
    ctx.globalAlpha = 0.7;
    try {
      this._drawComponent(ctx, comp, state);
    } finally {
      ctx.restore();
      this.world.getHolePosById = origGetHolePos;
      comp.startHoleId = origStartHoleId;
      comp.endHoleId = origEndHoleId;
      comp.pins = origPins;
      comp.placed = origPlaced;
    }
  }

  // ── Ghost (placement preview) ─────────────────────────────────────────────
  _drawGhost(ctx, ghost, state) {
    ctx.globalAlpha = 0.5;
    this._drawComponent(ctx, ghost, state);
    ctx.globalAlpha = 1.0;
  }

  // Ghost wire endpoint: same disc as a real wire, drawn at the snapped hole
  // but skipping the powered/net glow (preview has no net yet). Caller handles
  // globalAlpha for the translucent ghost look.
  _drawGhostWireEndpoint(ctx, holeId, color) {
    const pos = this.world.getHolePosById(holeId);
    if (!pos) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = color || '#888';
    ctx.fill();
  }

  // ── Selection highlight ───────────────────────────────────────────────────
  _drawOvercurrentOutline(ctx, comp) {
    if (!comp.placed || comp.pins.length === 0) return;

    ctx.save();
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 6;
    ctx.setLineDash([]);

    const isWireLike = !!(comp.startHoleId && comp.endHoleId);
    if (isWireLike) {
      const a = this.world.getHolePosById(comp.startHoleId);
      const b = this.world.getHolePosById(comp.endHoleId);
      if (a && b) {
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        let perpHalf;
        if (comp.type === COMP.PUSH_BUTTON) perpHalf = 12;
        else if (comp.type === COMP.SWITCH || comp.type === COMP.SLIDE_SWITCH) perpHalf = 10;
        else perpHalf = 10;
        const pad = 10;
        const hw = len / 2 + pad;
        let hh = (perpHalf + pad) / 2;
        if (comp.type === COMP.LED || comp.type === COMP.SWITCH || comp.type === COMP.PUSH_BUTTON) hh *= 1.4;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        if (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) {
          const upSign = Math.cos(angle) >= 0 ? -1 : 1;
          const scale = comp.type === COMP.POLARIZED_CAPACITOR ? 4 : 2.5;
          const bodyHalf = hh * scale;
          const topHalf  = upSign < 0 ? bodyHalf : hh;
          const botHalf  = upSign < 0 ? hh       : bodyHalf;
          ctx.strokeRect(-hw, -topHalf, hw * 2, topHalf + botHalf);
        } else {
          ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
        }
        ctx.restore();
        return;
      }
    }

    // Fallback: axis-aligned bounding box from pins
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pin of comp.pins) {
      const pos = this.world.getHolePosById(pin.holeId);
      if (!pos) continue;
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x > maxX) maxX = pos.x;
      if (pos.y > maxY) maxY = pos.y;
    }

    const pad = 10;
    if (comp.type === COMP.SLIDE_SWITCH) {
      const w = maxX - minX;
      const h = maxY - minY;
      const scx = (minX + maxX) / 2;
      const scy = (minY + maxY) / 2;
      const hw = (w / 2 + pad) * 1.5;
      const hh = (h / 2 + pad) * 1.5;
      ctx.strokeRect(scx - hw, scy - hh, hw * 2, hh * 2);
    } else {
      ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
    }
    ctx.restore();
  }

  _drawSelection(ctx, comp) {
    if (!comp.placed || comp.pins.length === 0) return;

    // For 2-terminal wire-like components (resistor, LED, diode, capacitor,
    // switches, etc.), draw an oriented bounding box aligned with the line
    // between the two terminals so diagonal placements get a tight fit
    // parallel/perpendicular to the body, not a loose axis-aligned box.
    const isWireLike = !!(comp.startHoleId && comp.endHoleId);
    if (isWireLike) {
      const a = this.world.getHolePosById(comp.startHoleId);
      const b = this.world.getHolePosById(comp.endHoleId);
      if (a && b) {
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        // Perpendicular half-height matches body widths used in hit testing.
        let perpHalf;
        if (comp.type === COMP.PUSH_BUTTON) perpHalf = 12;
        else if (comp.type === COMP.SWITCH || comp.type === COMP.SLIDE_SWITCH) perpHalf = 10;
        else perpHalf = 10;
        const pad = 10;
        const hw = len / 2 + pad;
        let hh = (perpHalf + pad) / 2;
        if (comp.type === COMP.LED || comp.type === COMP.SWITCH || comp.type === COMP.PUSH_BUTTON) hh *= 1.4;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeStyle = COLORS.SELECTION;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        if (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) {
          // The capacitor body sticks out perpendicular to the lead axis on the
          // upSign side. Extend the selection box on that side only.
          const upSign = Math.cos(angle) >= 0 ? -1 : 1;
          const scale = comp.type === COMP.POLARIZED_CAPACITOR ? 4 : 2.5;
          const bodyHalf = hh * scale;
          const topHalf  = upSign < 0 ? bodyHalf : hh;
          const botHalf  = upSign < 0 ? hh       : bodyHalf;
          ctx.strokeRect(-hw, -topHalf, hw * 2, topHalf + botHalf);
        } else {
          ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
        }
        ctx.setLineDash([]);
        ctx.restore();
        return;
      }
    }

    // Find bounding box of all pins
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pin of comp.pins) {
      const pos = this.world.getHolePosById(pin.holeId);
      if (!pos) continue;
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x > maxX) maxX = pos.x;
      if (pos.y > maxY) maxY = pos.y;
    }

    const pad = 10;
    ctx.strokeStyle = COLORS.SELECTION;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    if (comp.type === COMP.SLIDE_SWITCH) {
      const w = maxX - minX;
      const h = maxY - minY;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const hw = (w / 2 + pad) * 1.5;
      const hh = (h / 2 + pad) * 1.5;
      ctx.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2);
    } else {
      ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
    }
    ctx.setLineDash([]);

    // 7-seg and XO can: their solid bodies hide the holes, so on selection
    // draw dots where the pins connect. Light dots on the 7-seg's black body;
    // dark ringed dots on the XO's bright metal lid. The XO skips NC
    // positions the real half-can only has the four corner pins.
    const isXOCan = comp.type === COMP.CHIP && comp.chipDef && comp.chipDef.name === 'XO';
    if (comp.type === COMP.SEVEN_SEG || isXOCan) {
      for (const pin of comp.pins) {
        if (isXOCan && pin.type === 'nc') continue;
        const pos = this.world.getHolePosById(pin.holeId);
        if (!pos) continue;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, GRID.HOLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = isXOCan ? 'rgba(35,32,28,0.9)' : 'rgba(210,210,210,0.85)';
        ctx.fill();
        if (isXOCan) {
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }
  }

  _drawWireSelection(ctx, wire) {
    const startPos = this.world.getHolePosById(wire.startHoleId);
    const endPos = this.world.getHolePosById(wire.endHoleId);
    if (!startPos || !endPos) return;
    ctx.strokeStyle = COLORS.SELECTION;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, GRID.HOLE_RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(endPos.x, endPos.y, GRID.HOLE_RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const r = GRID.HOLE_RADIUS + 6;
      const ux = dx / dist;
      const uy = dy / dist;
      ctx.beginPath();
      ctx.moveTo(startPos.x + ux * r, startPos.y + uy * r);
      ctx.lineTo(endPos.x - ux * r, endPos.y - uy * r);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  _drawBreadboardSelection(ctx, item) {
    const tile = this.world.getTile(item.tileX, item.tileY);
    if (!tile) return;
    const origin = tile.getOrigin();
    const w = GRID.TILE_WIDTH;
    const h = GRID.TILE_HEIGHT;
    ctx.save();
    ctx.strokeStyle = COLORS.SELECTION;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(origin.x + 4, origin.y + 4, w - 8, h - 8);
    ctx.setLineDash([]);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.restore();
  }

  // ── Pan/Zoom controls ─────────────────────────────────────────────────────
  pan(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
  }

  zoomAt(sx, sy, factor) {
    const worldBefore = this.screenToWorld(sx, sy);
    this.zoom *= factor;
    this.zoom = Math.max(0.15, Math.min(4, this.zoom));
    const worldAfter = this.screenToWorld(sx, sy);
    this.offsetX += (worldAfter.x - worldBefore.x) * this.zoom;
    this.offsetY += (worldAfter.y - worldBefore.y) * this.zoom;
  }
}
