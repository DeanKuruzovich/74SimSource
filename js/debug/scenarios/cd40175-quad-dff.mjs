// ── CD40175 quad D flip-flop regression ──────────────────────────────────────
// The CD40175 (Batch 4, js/chips/chips93.js) is the CMOS 4000-series quad D-type
// flip-flop with a common clock and a common asynchronous active-LOW clear that
// brings out BOTH the true Q and the complementary Q-bar of each section. It
// rides the existing D_FF_QUAD engine primitive (shared with the 74x175). This
// scenario guards the chip's DB entry: the verified CD40175B pin map
// (CLEAR=1, Q1=2, Q1n=3, D1=4, D2=5, Q2n=6, Q2=7, VSS=8, CLOCK=9, Q3=10,
// Q3n=11, D3=12, D4=13, Q4n=14, Q4=15, VDD=16), the simultaneous capture of all
// four bits on the rising clock edge, the asynchronous active-LOW CLEAR, that a
// falling clock edge holds state, and that every Q-bar is the complement of Q.
//
// D_FF_QUAD contract (js/specificChipsSim.js):
//   inputs:  [1D,2D,3D,4D, CLK, CLR]              (CLR active LOW)
//   outputs: [1Q,1Qn, 2Q,2Qn, 3Q,3Qn, 4Q,4Qn]   rising-edge capture
//
// Method: place ONE CD40175 and keep the same chip + sim instance across the
// whole run so the register state (comp.ffState) persists.
//
// Run:  node js/debug/scenarios/cd40175-quad-dff.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40175');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40175 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK', st.clk ? 1 : 0);
  wirePin('CLR', st.clr ? 1 : 0);
  for (let i = 1; i <= 4; i++) wirePin(`${i}D`, st.d[i - 1] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 1; i <= 4; i++) if (isHigh(read(`${i}Q`))) v |= (1 << (i - 1));
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Verify every Q-bar is the strict complement of its Q.
function checkComplements(ctx) {
  for (let i = 1; i <= 4; i++) {
    const q = isHigh(read(`${i}Q`));
    const qn = isHigh(read(`${i}Qn`));
    assert(q !== qn, `${ctx}: ${i}Qn should be complement of ${i}Q (Q=${q?1:0}, Qn=${qn?1:0})`);
  }
}

// Current input state (mutated by helpers). CLR held HIGH = not clearing.
const st = { clk: 0, clr: 1, d: [0, 0, 0, 0] };
const solve = () => apply(st);

// Load a 4-bit pattern: present D, then a rising clock edge captures it.
function load(pattern4) {
  for (let i = 0; i < 4; i++) st.d[i] = (pattern4 >> i) & 1;
  st.clk = 0; solve();   // setup data, clock low
  st.clk = 1; solve();   // rising edge → capture all four bits at once
}

// ── 0. Asynchronous active-LOW CLEAR forces all four Q to 0, Q-bar to 1 ───────
st.clr = 0; solve();
assert(qbits() === 0, `clear: all Q should be 0, got ${qbits().toString(2)}`);
checkComplements('after clear');
assert(isHigh(read('1Qn')) && isHigh(read('2Qn')) && isHigh(read('3Qn')) && isHigh(read('4Qn')),
  'clear: all Q-bar should be HIGH');
st.clr = 1; solve();

// ── 1. Load a pattern and confirm parallel capture on the rising edge ─────────
load(0b1010);
assert(qbits() === 0b1010, `load 1010: got ${qbits().toString(2).padStart(4,'0')}`);
checkComplements('after load 1010');
// Per-bit weighting sanity: Q2,Q4 high; Q1,Q3 low.
assert(isHigh(read('2Q')) && isHigh(read('4Q')), 'expected 2Q,4Q HIGH');
assert(!isHigh(read('1Q')) && !isHigh(read('3Q')), 'expected 1Q,3Q LOW');

// ── 2. A falling clock edge must NOT change state ─────────────────────────────
for (let i = 0; i < 4; i++) st.d[i] = (0b0101 >> i) & 1;
st.clk = 0; solve();
assert(qbits() === 0b1010, `falling edge held wrong: ${qbits().toString(2).padStart(4,'0')}`);
// Now the rising edge captures the new value.
st.clk = 1; solve();
assert(qbits() === 0b0101, `rising edge capture: ${qbits().toString(2).padStart(4,'0')}`);
checkComplements('after capture 0101');

// ── 3. Data changing while clock stays HIGH must NOT change Q (edge-only) ──────
const before = qbits();               // 0101
for (let i = 0; i < 4; i++) st.d[i] = (0b1111 >> i) & 1;
solve();                              // clock still HIGH, data changed → hold
assert(qbits() === before, `level-change while CLK high must hold ${before.toString(2)}, got ${qbits().toString(2)}`);

// ── 4. Async CLEAR overrides a held value regardless of clock ─────────────────
st.clr = 0; solve();                  // clock still HIGH, clear asserted
assert(qbits() === 0, `async clear over held value: got ${qbits().toString(2)}`);
checkComplements('async clear over held');
st.clr = 1; solve();

// ── 5. All-ones load, then all-zeros load (full-rail toggle) ──────────────────
load(0b1111);
assert(qbits() === 0b1111, `load all-ones: got ${qbits().toString(2).padStart(4,'0')}`);
checkComplements('after load all-ones');
load(0b0000);
assert(qbits() === 0b0000, `load all-zeros: got ${qbits().toString(2).padStart(4,'0')}`);
checkComplements('after load all-zeros');

console.log(`cd40175-quad-dff: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
