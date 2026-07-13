// ── Timing diagram (waveform viewer) ─────────────────────────────────────────
// Canvas renderer for the Timing Analysis side panel. Draws one
// lane per recorder probe (clocks first, then test points in placement
// order), in a grayscale datasheet-style visual language:
//   HIGH/LOW  solid trace at the top/bottom of the lane
//   Z         dashed line at mid-level (floating net)
//   X         gray band (short / conflicting drivers)
//
// Interactions:
//   wheel        zoom around the mouse (follow mode keeps tracking the head)
//   drag         pan (disables follow)
//   double-click fit the whole capture and re-enable follow
//
// The engine (js/timing.js) owns the data; this class only reads
// engine.lanes and never mutates simulation state.

import { COMP } from './constants.js';

const LANE_H = 34;      // px per lane
const AXIS_H = 26;      // px for the time axis strip
const LABEL_W = 84;     // px reserved for lane labels
const HEAD_H = 6;       // px top margin above the first lane

// Grayscale lane shades cycled onto Test Points in the diagram. The board flag
// keeps the TESTPOINT_COLORS palette; the waveform view is deliberately mono.
const TP_GRAYS = ['#e6e6e6', '#b4b4b4', '#d2d2d2', '#8f8f8f', '#f2f2f2', '#a2a2a2'];

const fmtTime = (ps) => {
  const abs = Math.abs(ps);
  const f = (v) => {
    const s = v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2);
    return s.replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
  };
  if (abs < 1e3) return `${Math.round(ps)} ps`;
  if (abs < 1e6) return `${f(ps / 1e3)} ns`;
  if (abs < 1e9) return `${f(ps / 1e6)} µs`;
  if (abs < 1e12) return `${f(ps / 1e9)} ms`;
  return `${f(ps / 1e12)} s`;
};

export class TimingDiagram {
  constructor(canvas, app) {
    this.canvas = canvas;
    this.app = app;

    // View state. pxPerNs is the zoom; leftPs the left-edge sim time.
    this.pxPerNs = 6;
    this.leftPs = 0;
    this.follow = true;

    this._drag = null;     // { startX, startLeftPs, moved }
    this._lastSize = { w: 0, h: 0, dpr: 1 };

    this._onWheel = (e) => this._wheel(e);
    this._onDown = (e) => this._down(e);
    this._onMove = (e) => this._move(e);
    this._onUp = (e) => this._up(e);
    this._onDbl = (e) => { e.preventDefault(); this.fit(); };
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    canvas.addEventListener('mousedown', this._onDown);
    window.addEventListener('mousemove', this._onMove);
    window.addEventListener('mouseup', this._onUp);
    canvas.addEventListener('dblclick', this._onDbl);
  }

  destroy() {
    this.canvas.removeEventListener('wheel', this._onWheel);
    this.canvas.removeEventListener('mousedown', this._onDown);
    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('mouseup', this._onUp);
    this.canvas.removeEventListener('dblclick', this._onDbl);
  }

  get engine() { return this.app.simulator.timing; }

  resetView() {
    this.leftPs = 0;
    this.follow = true;
  }

  /** Fit the whole capture (t=0 … now) into the plot and resume following. */
  fit() {
    const eng = this.engine;
    if (!eng) return;
    const plotW = Math.max(50, this._cssWidth() - LABEL_W - 8);
    const spanNs = Math.max(1, eng.timePs / 1000);
    this.pxPerNs = plotW / (spanNs * 1.05);
    this.leftPs = 0;
    this.follow = true;
  }

  // ── Lane list: clocks first, then test points, all in placement order ──────
  _laneList() {
    const eng = this.engine;
    if (!eng) return [];
    const comps = this.app.state.components;
    const out = [];
    for (const c of comps) {
      if (!c.placed || !c.pins || !c.pins.length) continue;
      if (c.type !== COMP.CLOCK && c.type !== COMP.CRYSTAL) continue;
      const lane = eng.lanes.get(c.pins[0].holeId);
      if (lane) out.push({ lane, label: c.type === COMP.CRYSTAL ? `XTAL ${c.id}` : `CLK ${c.id}`, color: '#c8c8c8' });
    }
    let tpIdx = 0;
    for (const c of comps) {
      if (!c.placed || c.type !== COMP.TESTPOINT || !c.pins || !c.pins.length) continue;
      const lane = eng.lanes.get(c.pins[0].holeId);
      // Grayscale by placement order; ignore the board flag's color.
      if (lane) out.push({ lane, label: c.label || 'TP', color: TP_GRAYS[tpIdx % TP_GRAYS.length] });
      tpIdx++;
    }
    return out;
  }

  _cssWidth() {
    return this.canvas.parentElement ? this.canvas.parentElement.clientWidth : this.canvas.clientWidth;
  }

  // ── Rendering ───────────────────────────────────────────────────────────────
  render() {
    const eng = this.engine;
    if (!eng) return;
    const lanes = this._laneList();

    const cssW = Math.max(120, this._cssWidth());
    const cssH = HEAD_H + Math.max(1, lanes.length) * LANE_H + AXIS_H;
    const dpr = window.devicePixelRatio || 1;
    if (this._lastSize.w !== cssW || this._lastSize.h !== cssH || this._lastSize.dpr !== dpr) {
      this.canvas.width = Math.round(cssW * dpr);
      this.canvas.height = Math.round(cssH * dpr);
      this.canvas.style.height = cssH + 'px';
      this._lastSize = { w: cssW, h: cssH, dpr };
    }

    const ctx = this.canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, cssW, cssH);

    const plotX = LABEL_W;
    const plotW = cssW - LABEL_W - 4;

    // Follow mode: keep the head (current sim time) pinned near the right edge.
    if (this.follow) {
      const spanPs = (plotW / this.pxPerNs) * 1000;
      this.leftPs = Math.max(0, eng.timePs - spanPs * 0.92);
    }
    const leftPs = this.leftPs;
    const rightPs = leftPs + (plotW / this.pxPerNs) * 1000;
    const xOf = (ps) => plotX + ((ps - leftPs) / 1000) * this.pxPerNs;

    if (lanes.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Place a Test Point (button below) to record a trace', cssW / 2, cssH / 2);
      ctx.restore();
      return;
    }

    // Lane separators + labels + waveforms
    lanes.forEach((entry, i) => {
      const y0 = HEAD_H + i * LANE_H;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y0 + LANE_H + 0.5);
      ctx.lineTo(cssW, y0 + LANE_H + 0.5);
      ctx.stroke();

      this._drawLane(ctx, entry, y0, plotX, plotW, leftPs, rightPs, xOf);

      // Label
      ctx.fillStyle = entry.color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      let label = entry.label.length > 9 ? entry.label.slice(0, 9) + '…' : entry.label;
      ctx.fillText(label, 6, y0 + LANE_H / 2);
      if (entry.lane.truncated) {
        ctx.fillStyle = '#777';
        ctx.font = '8px monospace';
        ctx.fillText('(trimmed)', 6, y0 + LANE_H - 6);
      }
    });

    this._drawAxis(ctx, plotX, plotW, HEAD_H + lanes.length * LANE_H, leftPs, rightPs, xOf);

    // Head marker (current sim time)
    const headX = xOf(eng.timePs);
    if (headX >= plotX && headX <= plotX + plotW) {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX + 0.5, HEAD_H);
      ctx.lineTo(headX + 0.5, HEAD_H + lanes.length * LANE_H);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Draw one lane's waveform. */
  _drawLane(ctx, entry, y0, plotX, plotW, leftPs, rightPs, xOf) {
    const tr = entry.lane.transitions;
    if (!tr.length) return;
    const yHigh = y0 + 7;
    const yLow = y0 + LANE_H - 9;
    const yMid = (yHigh + yLow) / 2;

    // Binary search: last transition at or before leftPs.
    let lo = 0, hi = tr.length - 1, start = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (tr[mid].t <= leftPs) { start = mid; lo = mid + 1; }
      else hi = mid - 1;
    }

    const endPs = Math.min(rightPs, this.engine.timePs);

    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX, y0, plotW, LANE_H);
    ctx.clip();

    const yOf = (level) => level === 1 ? yHigh : level === 0 ? yLow : yMid;

    for (let i = start; i < tr.length; i++) {
      const cur = tr[i];
      if (cur.t > endPs) break;
      const next = tr[i + 1];
      const segEnd = next ? Math.min(next.t, endPs) : endPs;
      const x1 = Math.max(plotX, xOf(cur.t));
      const x2 = Math.min(plotX + plotW, xOf(segEnd));
      if (x2 < plotX || x1 > plotX + plotW) continue;

      if (cur.level === 'X') {
        // Short / conflicting drivers: gray band (grayscale — was red).
        ctx.fillStyle = 'rgba(210, 210, 210, 0.42)';
        ctx.fillRect(x1, yHigh, Math.max(1, x2 - x1), yLow - yHigh);
      } else if (cur.level === 'Z') {
        ctx.strokeStyle = '#9a9a9a';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, yMid);
        ctx.lineTo(x2, yMid);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = entry.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x1, yOf(cur.level));
        ctx.lineTo(x2, yOf(cur.level));
        ctx.stroke();
      }

      // Vertical edge to the next level
      if (next && next.t <= endPs) {
        const xe = xOf(next.t);
        if (xe >= plotX && xe <= plotX + plotW && cur.level !== 'X' && next.level !== 'X') {
          ctx.strokeStyle = entry.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(xe, yOf(cur.level));
          ctx.lineTo(xe, yOf(next.level));
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  _drawAxis(ctx, plotX, plotW, yAxis, leftPs, rightPs, xOf) {
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, yAxis, plotX + plotW + 4, AXIS_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(plotX, yAxis + 0.5);
    ctx.lineTo(plotX + plotW, yAxis + 0.5);
    ctx.stroke();

    // Nice tick step (1-2-5) targeting ≥ 70px spacing.
    const minStepPs = (70 / this.pxPerNs) * 1000;
    const pow = Math.pow(10, Math.floor(Math.log10(minStepPs)));
    let step = pow;
    for (const m of [1, 2, 5, 10]) {
      if (pow * m >= minStepPs) { step = pow * m; break; }
    }
    const first = Math.ceil(leftPs / step) * step;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let t = first; t <= rightPs; t += step) {
      const x = xOf(t);
      if (x < plotX || x > plotX + plotW) continue;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.moveTo(x + 0.5, yAxis);
      ctx.lineTo(x + 0.5, yAxis + 5);
      ctx.stroke();
      ctx.fillText(fmtTime(t), x, yAxis + 8);
    }
  }

  // ── Interactions ───────────────────────────────────────────────────────────
  _mousePs(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return this.leftPs + ((x - LABEL_W) / this.pxPerNs) * 1000;
  }

  _wheel(e) {
    e.preventDefault();
    const anchorPs = this.follow ? null : this._mousePs(e);
    const factor = e.deltaY < 0 ? 1.3 : 1 / 1.3;
    const next = this.pxPerNs * factor;
    this.pxPerNs = Math.min(2000, Math.max(1e-7, next));
    if (anchorPs !== null) {
      // Keep the time under the mouse stationary.
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.leftPs = Math.max(0, anchorPs - ((x - LABEL_W) / this.pxPerNs) * 1000);
    }
  }

  _down(e) {
    if (e.button !== 0) return;
    this._drag = { startX: e.clientX, startLeftPs: this.leftPs, moved: false };
  }

  _move(e) {
    if (!this._drag) return;
    const dx = e.clientX - this._drag.startX;
    if (Math.abs(dx) > 3) this._drag.moved = true;
    if (this._drag.moved) {
      this.follow = false;
      this.leftPs = Math.max(0, this._drag.startLeftPs - (dx / this.pxPerNs) * 1000);
    }
  }

  _up() {
    // Drag = pan (handled in _move); a plain click no longer does anything now
    // that the A/B measurement cursors are gone. Wheel zooms, dbl-click fits.
    if (!this._drag) return;
    this._drag = null;
  }
}
