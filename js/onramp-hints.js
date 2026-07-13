// ── 74Sim Onramp visual hints ────────────────────────────────────────────────
// Turns a step's declarative `hint` into a pulsing overlay drawn on top of the
// board, so a stuck learner can press "Show me" and see exactly which holes,
// pins, components and rails the step is talking about.
//
// A step declares:
//   hint: {
//     toolbar: 'wire',            // optional: toolbar button to pulse (matches
//                                 //           the step's allowedActions entry)
//     targets: [ ...see below ],  // optional: board highlights
//   }
//
// Target kinds (all accept an optional  label: 'text'  drawn on an amber tag):
//   { hole: '0:0:main:8:3' }                      ring around one hole
//   { area: ['0:0:main:18:4', '0:0:main:24:5'] }  marching-ants rect spanning
//                                                 the two corner holes (works
//                                                 for strips, rail segments and
//                                                 chip placement zones)
//   { comp: 5 }                                   glow box around component #5
//   { chip: '74x08' }                             glow box around the first
//                                                 placed chip with that chipId
//                                                 (for chips the user placed,
//                                                 whose id isn't known ahead)
//   { pin: { chip: '74x08', name: 'VCC' } }       ring on a chip pin, chip
//   { pin: { comp: 13, name: '1A' } }             found by chipId or comp id
//   { arrow: { from: <target>, to: <target> } }   animated dashed arrow from
//                                                 the centre of one resolved
//                                                 target to another (shows
//                                                 "wire from here to here")
//
// Targets that can't resolve yet (e.g. a pin of a chip the user hasn't placed)
// are skipped silently, so a hint can describe the finished circuit and only
// the parts that exist right now light up.
//
// Drawing happens after Renderer.draw() each frame, applying the same camera
// transform, so this file never touches the shared renderer.

import { GRID } from './constants.js';

const HINT = {
  COLOR: '#ffb020',        // amber — visible on both dark and realistic boards
  COLOR_SOFT: 'rgba(255, 176, 32, 0.14)',
  LABEL_TEXT: '#1a1a1a',
};

// ── Target resolution ────────────────────────────────────────────────────────
// Every target resolves to a shape in world coordinates:
//   { kind: 'ring', x, y, label }
//   { kind: 'rect', x, y, w, h, label }
//   { kind: 'arrow', x1, y1, x2, y2 }

function findComp(app, key) {
  const comps = app.state.components;
  if (typeof key === 'number') return comps.find(c => c.id === key && c.placed);
  // string → chipId of a placed chip (the one the user just placed)
  return comps.find(c => c.chipId === key && c.placed);
}

function compHolePositions(app, comp) {
  const ids = new Set();
  if (typeof comp.getOccupiedHoles === 'function') {
    for (const h of comp.getOccupiedHoles()) ids.add(h);
  }
  if (comp.pins) for (const p of comp.pins) if (p.holeId) ids.add(p.holeId);
  if (comp.startHoleId) ids.add(comp.startHoleId);
  if (comp.endHoleId) ids.add(comp.endHoleId);
  const out = [];
  for (const id of ids) {
    const pos = app.world.getHolePosById(id);
    if (pos) out.push(pos);
  }
  return out;
}

function bboxOf(points, pad) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  if (!isFinite(minX)) return null;
  return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
}

function shapeCenter(s) {
  if (!s) return null;
  if (s.kind === 'ring') return { x: s.x, y: s.y };
  if (s.kind === 'rect') return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  return null;
}

function resolveTarget(app, t) {
  if (!t) return null;

  if (t.hole) {
    const pos = app.world.getHolePosById(t.hole);
    if (!pos) return null;
    return { kind: 'ring', x: pos.x, y: pos.y, label: t.label };
  }

  if (t.area) {
    const a = app.world.getHolePosById(t.area[0]);
    const b = app.world.getHolePosById(t.area[1]);
    if (!a || !b) return null;
    const box = bboxOf([a, b], GRID.HOLE_SPACING * 0.55);
    if (!box) return null;
    return { kind: 'rect', ...box, label: t.label };
  }

  if (t.comp !== undefined || t.chip !== undefined) {
    const comp = findComp(app, t.comp !== undefined ? t.comp : t.chip);
    if (!comp) return null;
    const box = bboxOf(compHolePositions(app, comp), GRID.HOLE_SPACING * 0.6);
    if (!box) return null;
    return { kind: 'rect', ...box, label: t.label };
  }

  if (t.pin) {
    const comp = findComp(app, t.pin.comp !== undefined ? t.pin.comp : t.pin.chip);
    if (!comp || !comp.pins) return null;
    const pin = comp.pins.find(p => p.name === t.pin.name);
    if (!pin || !pin.holeId) return null;
    const pos = app.world.getHolePosById(pin.holeId);
    if (!pos) return null;
    return { kind: 'ring', x: pos.x, y: pos.y, label: t.label };
  }

  if (t.arrow) {
    const from = shapeCenter(resolveTarget(app, t.arrow.from));
    const to = shapeCenter(resolveTarget(app, t.arrow.to));
    if (!from || !to) return null;
    return { kind: 'arrow', x1: from.x, y1: from.y, x2: to.x, y2: to.y, label: t.label };
  }

  return null;
}

// ── Drawing ──────────────────────────────────────────────────────────────────

function drawRing(ctx, s, pulse, tMs, zoom) {
  // Keep the ring legible at any zoom: at least ~13 screen px radius.
  const r = Math.max(12, 13 / zoom) + pulse * 2.5;

  // Expanding "tap here" ripple
  const phase = (tMs % 1100) / 1100;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r + phase * (16 / zoom + 6), 0, Math.PI * 2);
  ctx.strokeStyle = HINT.COLOR;
  ctx.globalAlpha = (1 - phase) * 0.55;
  ctx.lineWidth = 2.5 / zoom;
  ctx.stroke();

  // Main ring
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.globalAlpha = 0.85 + pulse * 0.15;
  ctx.strokeStyle = HINT.COLOR;
  ctx.lineWidth = 3.5 / zoom;
  ctx.stroke();

  // Soft fill so the spot reads even over busy silkscreen
  ctx.globalAlpha = 0.10 + pulse * 0.08;
  ctx.fillStyle = HINT.COLOR;
  ctx.fill();
  ctx.globalAlpha = 1;

  if (s.label) drawLabel(ctx, s.label, s.x, s.y - r - 6 / zoom, zoom);
}

function drawRect(ctx, s, pulse, tMs, zoom) {
  const rad = Math.min(10, s.w / 2, s.h / 2);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(s.x, s.y, s.w, s.h, rad);
  else ctx.rect(s.x, s.y, s.w, s.h);

  ctx.fillStyle = HINT.COLOR_SOFT;
  ctx.globalAlpha = 0.7 + pulse * 0.3;
  ctx.fill();

  // Marching-ants border, screen-constant width and dash length
  ctx.strokeStyle = HINT.COLOR;
  ctx.lineWidth = 3 / zoom;
  ctx.setLineDash([9 / zoom, 6 / zoom]);
  ctx.lineDashOffset = -(tMs / 28) / zoom;
  ctx.globalAlpha = 0.8 + pulse * 0.2;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  if (s.label) drawLabel(ctx, s.label, s.x + s.w / 2, s.y - 6 / zoom, zoom);
}

function drawArrow(ctx, s, pulse, tMs, zoom) {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len, uy = dy / len;

  // Pull both ends in so the arrow doesn't sit on top of the endpoint rings
  const inset = Math.min(len * 0.25, Math.max(16, 18 / zoom));
  const x1 = s.x1 + ux * inset, y1 = s.y1 + uy * inset;
  const x2 = s.x2 - ux * inset, y2 = s.y2 - uy * inset;

  ctx.strokeStyle = HINT.COLOR;
  ctx.lineWidth = 3 / zoom;
  ctx.globalAlpha = 0.7 + pulse * 0.3;
  ctx.setLineDash([8 / zoom, 6 / zoom]);
  ctx.lineDashOffset = -(tMs / 22) / zoom;   // dashes flow toward the target
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowhead
  const ah = Math.max(9, 10 / zoom);
  ctx.beginPath();
  ctx.moveTo(x2 + ux * ah * 0.6, y2 + uy * ah * 0.6);
  ctx.lineTo(x2 - ux * ah - uy * ah * 0.55, y2 - uy * ah + ux * ah * 0.55);
  ctx.lineTo(x2 - ux * ah + uy * ah * 0.55, y2 - uy * ah - ux * ah * 0.55);
  ctx.closePath();
  ctx.fillStyle = HINT.COLOR;
  ctx.fill();
  ctx.globalAlpha = 1;

  if (s.label) drawLabel(ctx, s.label, (x1 + x2) / 2, (y1 + y2) / 2 - 10 / zoom, zoom);
}

function drawLabel(ctx, text, cx, bottomY, zoom) {
  // Screen-constant type size so labels stay readable when zoomed out
  const fs = 12.5 / zoom;
  ctx.font = `600 ${fs}px Roboto, sans-serif`;
  const padX = 7 / zoom, padY = 4.5 / zoom;
  const w = ctx.measureText(text).width + padX * 2;
  const h = fs + padY * 2;
  const x = cx - w / 2;
  const y = bottomY - h;

  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 4 / zoom);
  else ctx.rect(x, y, w, h);
  ctx.fillStyle = HINT.COLOR;
  ctx.globalAlpha = 0.95;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = HINT.LABEL_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, y + h / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ── Public entry point ───────────────────────────────────────────────────────
// Called every frame (after Renderer.draw) while a hint is active. Targets are
// re-resolved each frame so highlights track the live circuit — e.g. a pin
// ring appears the moment the user places the chip it belongs to.

export function drawHintOverlay(renderer, app, hint, tMs) {
  if (!hint || !hint.targets || hint.targets.length === 0) return;
  const ctx = renderer.ctx;
  const zoom = renderer.zoom;
  const pulse = 0.5 + 0.5 * Math.sin(tMs / 260);

  ctx.save();
  ctx.translate(renderer.offsetX, renderer.offsetY);
  ctx.scale(zoom, zoom);

  // Arrows go under the rings/rects they connect
  const shapes = [];
  for (const t of hint.targets) {
    const s = resolveTarget(app, t);
    if (s) shapes.push(s);
  }
  for (const s of shapes) if (s.kind === 'arrow') drawArrow(ctx, s, pulse, tMs, zoom);
  for (const s of shapes) if (s.kind === 'rect') drawRect(ctx, s, pulse, tMs, zoom);
  for (const s of shapes) if (s.kind === 'ring') drawRing(ctx, s, pulse, tMs, zoom);

  ctx.restore();
}

// ── Breadboard connections overlay ───────────────────────────────────────────
// An "x-ray" of the breadboard's internal wiring, used by the Welcome lesson:
// draws a red line through every group of holes the board shorts together
// internally — each 5-hole column strip (top and bottom half separately) and
// each full-width power rail row. A step opts in with `showConnections: true`;
// the player draws it every frame under any active hint overlay.

const CONN_COLOR = '#e84338';

export function drawConnectionsOverlay(renderer, world, tMs) {
  const ctx = renderer.ctx;
  const zoom = renderer.zoom;
  // Gentle pulse so the lines read as a temporary overlay, not board art.
  const pulse = 0.5 + 0.14 * Math.sin(tMs / 420);

  ctx.save();
  ctx.translate(renderer.offsetX, renderer.offsetY);
  ctx.scale(zoom, zoom);
  ctx.strokeStyle = CONN_COLOR;
  ctx.lineCap = 'round';
  ctx.globalAlpha = pulse;
  // World-constant width: the lines depict metal strips inside the board, so
  // they should scale with the board like the rest of the artwork.
  ctx.lineWidth = 2.4;

  for (const tile of world.tiles) {
    // Main grid: each column is one strip per half (rows 0-4, rows 5-9).
    for (let col = 0; col < GRID.COLS; col++) {
      for (const [rowA, rowB] of [[0, 4], [5, 9]]) {
        const a = tile.getMainHolePos(col, rowA);
        const b = tile.getMainHolePos(col, rowB);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    // Power rails: one net per row across the whole tile — the line runs
    // straight through the cosmetic gaps between the 5-hole groups on purpose.
    for (let row = 0; row < 4; row++) {
      const a = tile.getPowerHolePos(2, row);
      const b = tile.getPowerHolePos(60, row);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// Exported for the headless hint-validation test (js/debug/test-hints.mjs):
// lets the checker resolve every authored target against a deserialized board.
export { resolveTarget };
