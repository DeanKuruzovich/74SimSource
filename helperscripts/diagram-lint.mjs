#!/usr/bin/env node
// ── Lesson-diagram linter ────────────────────────────────────────────────────
// Brute-force layout checker for js/onramp-diagrams.js. Parses every exported
// SVG_* string and reports:
//   1. palette violations (any fill/stroke outside the grayscale system)
//   2. text collisions: estimated text bbox vs lines, polylines, arrowheads,
//      rect borders, circles, and other text
//   3. elements that stick out of the viewBox
//   4. orphaned arrowheads (a head whose tip/base touches no line endpoint,
//      polyline endpoint, or box edge)
//
// Run from the repo root:  node helperscripts/diagram-lint.mjs
// Exits 1 if any diagram has findings, so it can gate commits.

import * as D from '../js/onramp-diagrams.js';

const ALLOWED = new Set([...D.PALETTE, '#ffffff']);

// Roboto metrics, close enough for collision testing at these sizes.
// Uppercase/digits are wider than lowercase; titles are all-caps, so a flat
// average under-estimates them (a clipped FETCH title escaped v1 of this).
const charW = (ch) => /[A-Z0-9&#;]/.test(ch) ? 0.62 : ch === ' ' ? 0.3 : /[iltjf.,:'!()]/.test(ch) ? 0.3 : 0.52;
const ASC = 0.76;      // ascent above baseline, em
const DESC = 0.2;      // descent below baseline, em
const PAD_LINE = 2;    // min clearance text ↔ line/polygon
const PAD_TEXT = 1;    // min clearance text ↔ text
const PAD_RECT = 0.5;  // text may sit near a box border, just not cross it

const attrs = (tag) => {
  const out = {};
  for (const m of tag.matchAll(/([\w-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
};
const num = (v) => parseFloat(v);
const visible = (s) => s.replace(/&#\d+;|&#x[0-9a-f]+;|&\w+;/gi, 'x');
const textWidth = (s) => [...visible(s)].reduce((w, ch) => w + charW(ch), 0);

function parseSvg(svg) {
  const view = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const els = { texts: [], lines: [], polys: [], heads: [], rects: [], circles: [] };
  els.w = num(view[1]); els.h = num(view[2]);

  for (const m of svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)) {
    const a = attrs(m[1]);
    const size = num(a['font-size']);
    const width = textWidth(m[2]) * size;
    const x = num(a.x), y = num(a.y);
    const anchor = a['text-anchor'] || 'start';
    let x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
    let bb = { x0, x1: x0 + width, y0: y - size * ASC, y1: y + size * DESC };
    if (a.transform) {
      const r = a.transform.match(/rotate\((-?\d+)[ ,]+([\d.]+)[ ,]+([\d.]+)\)/);
      if (r && Math.abs(num(r[1])) === 90) {
        const sgn = Math.sign(num(r[1])), cx = num(r[2]), cy = num(r[3]);
        const rot = (px, py) => sgn < 0
          ? [cx + (py - cy), cy - (px - cx)]
          : [cx - (py - cy), cy + (px - cx)];
        const [ax, ay] = rot(bb.x0, bb.y0), [bx2, by2] = rot(bb.x1, bb.y1);
        bb = { x0: Math.min(ax, bx2), x1: Math.max(ax, bx2), y0: Math.min(ay, by2), y1: Math.max(ay, by2) };
      }
    }
    els.texts.push({ ...bb, s: m[2], fill: a.fill, size });
  }
  for (const m of svg.matchAll(/<line ([^>]*)\/>/g)) {
    const a = attrs(m[1]);
    els.lines.push({ x1: num(a.x1), y1: num(a.y1), x2: num(a.x2), y2: num(a.y2), stroke: a.stroke, w: num(a['stroke-width'] || 1) });
  }
  for (const m of svg.matchAll(/<polyline ([^>]*)\/>/g)) {
    const a = attrs(m[1]);
    const pts = a.points.trim().split(/\s+/).map(p => p.split(',').map(num));
    els.polys.push({ pts, stroke: a.stroke, fill: a.fill });
  }
  for (const m of svg.matchAll(/<polygon ([^>]*)\/>/g)) {
    const a = attrs(m[1]);
    const pts = a.points.trim().split(/\s+/).map(p => p.split(',').map(num));
    (pts.length === 3 && a.fill !== 'none' ? els.heads : els.polys).push({ pts, stroke: a.stroke, fill: a.fill });
  }
  for (const m of svg.matchAll(/<rect ([^>]*)\/>/g)) {
    const a = attrs(m[1]);
    els.rects.push({ x: num(a.x), y: num(a.y), w: num(a.width), h: num(a.height), stroke: a.stroke, fill: a.fill, opacity: a.opacity });
  }
  for (const m of svg.matchAll(/<circle ([^>]*)\/>/g)) {
    const a = attrs(m[1]);
    els.circles.push({ cx: num(a.cx), cy: num(a.cy), r: num(a.r), stroke: a.stroke, fill: a.fill });
  }
  return els;
}

const grow = (bb, p) => ({ x0: bb.x0 - p, x1: bb.x1 + p, y0: bb.y0 - p, y1: bb.y1 + p });
const bbOverlap = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

// Segment vs axis-aligned bbox intersection.
function segHitsBox(x1, y1, x2, y2, bb) {
  const inside = (x, y) => x >= bb.x0 && x <= bb.x1 && y >= bb.y0 && y <= bb.y1;
  if (inside(x1, y1) || inside(x2, y2)) return true;
  const edges = [
    [bb.x0, bb.y0, bb.x1, bb.y0], [bb.x1, bb.y0, bb.x1, bb.y1],
    [bb.x1, bb.y1, bb.x0, bb.y1], [bb.x0, bb.y1, bb.x0, bb.y0],
  ];
  const ccw = (ax, ay, bx, by, cx, cy) => (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
  return edges.some(([ex1, ey1, ex2, ey2]) =>
    ccw(x1, y1, ex1, ey1, ex2, ey2) !== ccw(x2, y2, ex1, ey1, ex2, ey2) &&
    ccw(x1, y1, x2, y2, ex1, ey1) !== ccw(x1, y1, x2, y2, ex2, ey2));
}

const headBBox = (h) => ({
  x0: Math.min(...h.pts.map(p => p[0])), x1: Math.max(...h.pts.map(p => p[0])),
  y0: Math.min(...h.pts.map(p => p[1])), y1: Math.max(...h.pts.map(p => p[1])),
});

function lint(name, svg) {
  const e = parseSvg(svg);
  const issues = [];
  const label = (t) => `"${t.s.slice(0, 32)}"`;

  // 1. palette
  for (const [kind, list, keys] of [
    ['text', e.texts, ['fill']], ['line', e.lines, ['stroke']],
    ['poly', e.polys, ['stroke', 'fill']], ['head', e.heads, ['fill']],
    ['rect', e.rects, ['stroke', 'fill']], ['circle', e.circles, ['stroke', 'fill']],
  ]) {
    for (const el of list) for (const k of keys) {
      const v = el[k];
      if (v && !ALLOWED.has(v)) issues.push(`palette: ${kind} uses ${k}="${v}"`);
    }
  }

  // 2. text collisions
  for (const t of e.texts) {
    const bb = grow(t, PAD_LINE);
    for (const l of e.lines) {
      if (segHitsBox(l.x1, l.y1, l.x2, l.y2, bb))
        issues.push(`text ${label(t)} too close to line (${l.x1},${l.y1})→(${l.x2},${l.y2})`);
    }
    for (const p of e.polys) {
      for (let i = 0; i < p.pts.length - 1; i++) {
        if (segHitsBox(p.pts[i][0], p.pts[i][1], p.pts[i + 1][0], p.pts[i + 1][1], bb)) {
          issues.push(`text ${label(t)} too close to polyline near (${p.pts[i]})`);
          break;
        }
      }
    }
    for (const h of e.heads) {
      if (bbOverlap(bb, headBBox(h))) issues.push(`text ${label(t)} overlaps arrowhead at (${h.pts[0]})`);
    }
    for (const r of e.rects) {
      if (r.opacity) continue; // translucent highlight panes may sit under text
      const rb = grow(t, PAD_RECT);
      const edges = [
        [r.x, r.y, r.x + r.w, r.y], [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
        [r.x + r.w, r.y + r.h, r.x, r.y + r.h], [r.x, r.y + r.h, r.x, r.y],
      ];
      if (edges.some(([a, b, c, d]) => segHitsBox(a, b, c, d, rb)))
        issues.push(`text ${label(t)} crosses box border at (${r.x},${r.y} ${r.w}x${r.h})`);
    }
    for (const c of e.circles) {
      // A label centered inside a circle (state bubble) is intentional.
      const corners = [[t.x0, t.y0], [t.x1, t.y0], [t.x0, t.y1], [t.x1, t.y1]];
      const inside = corners.every(([px, py]) => Math.hypot(px - c.cx, py - c.cy) <= c.r);
      if (inside) continue;
      const nx = Math.max(t.x0, Math.min(c.cx, t.x1));
      const ny = Math.max(t.y0, Math.min(c.cy, t.y1));
      if (Math.hypot(nx - c.cx, ny - c.cy) < c.r + 1.5)
        issues.push(`text ${label(t)} overlaps circle at (${c.cx},${c.cy})`);
    }
    for (const t2 of e.texts) {
      if (t2 === t) continue;
      if (bbOverlap(grow(t, PAD_TEXT), t2) && e.texts.indexOf(t) < e.texts.indexOf(t2))
        issues.push(`text ${label(t)} overlaps text ${label(t2)}`);
    }
    if (t.x0 < 1 || t.x1 > e.w - 1 || t.y0 < 0 || t.y1 > e.h)
      issues.push(`text ${label(t)} sticks out of viewBox (${Math.round(t.x0)}..${Math.round(t.x1)} of 0..${e.w})`);
  }

  // 4. orphaned arrowheads: tip or base-midpoint must touch a line/polyline
  //    endpoint or a rect edge (within tolerance).
  for (const h of e.heads) {
    // tip = vertex opposite the shortest side (the base)
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const sides = [[0, 1], [1, 2], [2, 0]].map(([i, j]) => d(h.pts[i], h.pts[j]));
    const shortest = sides.indexOf(Math.min(...sides));
    const tip = h.pts[[2, 0, 1][shortest]];
    const [b1, b2] = [[0, 1], [1, 2], [2, 0]][shortest].map(i => h.pts[i]);
    const base = [(b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2];
    const near = (p, q, tol) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= tol;
    const distToSeg = (p, a, b) => {
      const l2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
      if (!l2) return Math.hypot(p[0] - a[0], p[1] - a[1]);
      let t = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(p[0] - (a[0] + t * (b[0] - a[0])), p[1] - (a[1] + t * (b[1] - a[1])));
    };
    // Mid-path chevrons: head sits directly ON a line/polyline segment.
    const onSeg =
      e.lines.some(l => distToSeg(tip, [l.x1, l.y1], [l.x2, l.y2]) < 1.2 &&
                        distToSeg(base, [l.x1, l.y1], [l.x2, l.y2]) < 1.2) ||
      e.polys.some(p => {
        for (let i = 0; i < p.pts.length - 1; i++)
          if (distToSeg(tip, p.pts[i], p.pts[i + 1]) < 1.2 &&
              distToSeg(base, p.pts[i], p.pts[i + 1]) < 1.2) return true;
        return false;
      });
    const anchored = onSeg ||
      e.lines.some(l => near(tip, [l.x1, l.y1], 8) || near(tip, [l.x2, l.y2], 8) ||
                        near(base, [l.x1, l.y1], 1.2) || near(base, [l.x2, l.y2], 1.2)) ||
      e.polys.some(p => near(base, p.pts[0], 1.2) || near(base, p.pts.at(-1), 1.2) ||
                        near(tip, p.pts[0], 8) || near(tip, p.pts.at(-1), 8)) ||
      e.rects.some(r => Math.abs(tip[0] - r.x) < 1.2 || Math.abs(tip[0] - (r.x + r.w)) < 1.2 ||
                        Math.abs(tip[1] - r.y) < 1.2 || Math.abs(tip[1] - (r.y + r.h)) < 1.2) ||
      e.circles.some(c => near(tip, [c.cx, c.cy], c.r + 1.2));
    if (!anchored) issues.push(`arrowhead at (${tip}) is not anchored to any line end or box edge`);
  }

  return issues;
}

let bad = 0, total = 0;
for (const [name, svg] of Object.entries(D)) {
  if (!name.startsWith('SVG_')) continue;
  total++;
  const issues = lint(name, svg);
  if (issues.length) {
    bad++;
    console.log(`\n✗ ${name}`);
    for (const i of issues) console.log(`   ${i}`);
  }
}
console.log(`\n${total - bad}/${total} diagrams clean`);
process.exit(bad ? 1 : 0);
