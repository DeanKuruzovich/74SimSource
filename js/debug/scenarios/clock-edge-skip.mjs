// ── Edge-gated solving regression ────────────────────────────────────────────
// Guards the June 2026 perf fix (BenEater-Performance-Plan.md, lever B): when a
// circuit's only time-domain driver is digital CLOCK/CRYSTAL sources, the
// time-loop must SKIP the ~100ms MNA solve between clock edges (the circuit is
// static there) and SOLVE only when a clock flips — without changing results.
//
// Asserts, on the Ben Eater 8-bit CPU (35 chips, 1× 1Hz clock, no caps):
//   1. _edgeSkipEligible is true (digital clock is the sole time driver).
//   2. Ticks that stay within one clock half-period do NOT re-solve.
//   3. A tick that crosses a clock edge DOES re-solve.
//   4. The edge-gated solved state is identical to solving every tick (LED
//      brightness per component id), i.e. the optimization is exact.
//
// performance.now() is stubbed so the 1Hz clock is deterministic.
//
// Run:  node js/debug/scenarios/clock-edge-skip.mjs   (exits non-zero on failure)

import { CircuitHarness } from '../harness.mjs';
import { COMP } from '../../constants.js';

const EXAMPLE = 'js/examples/BenEater8BitCPU.json';

// Deterministic wall clock (ms). The 1Hz/50%-duty CLOCK is HIGH for [0,500)ms
// of each 1000ms period and LOW for [500,1000)ms.
let fakeMs = 0;
performance.now = () => fakeMs;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Edge-gated harness (production path: drives _timeStep, which may skip).
const h = CircuitHarness.fromFile(EXAMPLE);
const sim = h.sim;

// Count real solves by wrapping _solveMNA.
let solves = 0;
const proto = Object.getPrototypeOf(sim);
const origSolve = proto._solveMNA;
proto._solveMNA = function (...a) { solves++; return origSolve.apply(this, a); };

// t=0ms (clock HIGH): initial solve, mirrors onCircuitChanged → evaluate.
fakeMs = 0;
h.evaluate();
assert(sim._edgeSkipEligible === true,
  `expected _edgeSkipEligible=true for digital-clock-only circuit, got ${sim._edgeSkipEligible}`);

// (2) Ticks within the same HIGH half-period must skip the solve entirely.
solves = 0;
for (const t of [10, 50, 200, 400, 499]) { fakeMs = t; h.step(); }
assert(solves === 0, `expected 0 solves for in-phase ticks, got ${solves}`);

// (3) Crossing into the LOW half (t≥500ms) must trigger exactly one solve.
solves = 0;
fakeMs = 600;
h.step();
assert(solves > 0, `expected a solve when the clock edge is crossed, got ${solves}`);

// A second in-phase tick (still LOW) must skip again.
solves = 0;
fakeMs = 700;
h.step();
assert(solves === 0, `expected 0 solves for in-phase tick after edge, got ${solves}`);

// Restore the real solver before the correctness control run.
proto._solveMNA = origSolve;

// (4) Correctness: an independent harness that solves on EVERY tick must reach
// the same LED state at the same wall-clock time as the edge-gated harness.
const control = CircuitHarness.fromFile(EXAMPLE);
fakeMs = 700;
control.evaluate(); // full solve at t=700ms (clock LOW)

const ledBrightness = (harness) => {
  const m = new Map();
  for (const c of harness.components) {
    if (c.type === COMP.LED && c.placed) m.set(c.id, c.brightness ?? 0);
  }
  return m;
};
const a = ledBrightness(h);
const b = ledBrightness(control);
assert(a.size > 0, 'no LEDs found to compare');
assert(a.size === b.size, `LED count mismatch: edge-gated ${a.size} vs control ${b.size}`);
let mismatched = 0;
for (const [id, bv] of b) {
  if (Math.abs((a.get(id) ?? 0) - bv) > 1e-6) mismatched++;
}
assert(mismatched === 0, `${mismatched} LED(s) differ between edge-gated and solve-every-tick paths`);

console.log(`clock-edge-skip: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
