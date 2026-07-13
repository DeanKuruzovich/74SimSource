// ── CD40174 hex D flip-flop regression ───────────────────────────────────────
// The CD40174 (Batch 4, js/chips/chips92.js) is the CMOS 4000-series hex D-type
// flip-flop with a common clock and a common asynchronous active-LOW clear. It
// rides the existing D_FF_HEX engine primitive (shared with the 74x174). This
// scenario guards the chip's DB entry: the verified CD40174B pin map (CLEAR=1,
// CLK=9; the six D/Q pairs), the simultaneous capture of all six bits on the
// rising clock edge, the asynchronous active-LOW CLEAR, and that a falling clock
// edge holds state.
//
// D_FF_HEX contract (js/specificChipsSim.js):
//   inputs:  [1D,2D,3D,4D,5D,6D, CLK, CLR]   (CLR active LOW)
//   outputs: [1Q,2Q,3Q,4Q,5Q,6Q]            rising-edge capture
//
// Method: place ONE CD40174 and keep the same chip + sim instance across the
// whole run so the register state (comp.ffState) persists.
//
// Run:  node js/debug/scenarios/cd40174-hex-dff.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40174');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// A fresh WireManager each call is fine — the register state lives on the
// (persistent) chip component, not the wires.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40174 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK', st.clk ? 1 : 0);
  wirePin('CLR', st.clr ? 1 : 0);
  for (let i = 1; i <= 6; i++) wirePin(`${i}D`, st.d[i - 1] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 1; i <= 6; i++) if (isHigh(read(`${i}Q`))) v |= (1 << (i - 1));
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Current input state (mutated by helpers so each apply() carries the full
// picture — all 8 inputs are driven every solve). CLR held HIGH = not clearing.
const st = { clk: 0, clr: 1, d: [0, 0, 0, 0, 0, 0] };
const solve = () => apply(st);

// Load a 6-bit pattern: present D, then a rising clock edge captures it.
function load(pattern6) {
  for (let i = 0; i < 6; i++) st.d[i] = (pattern6 >> i) & 1;
  st.clk = 0; solve();   // setup data, clock low
  st.clk = 1; solve();   // rising edge → capture all six bits at once
}

// ── 0. Asynchronous active-LOW CLEAR forces all six Q to 0 ───────────────────
st.clr = 0; solve();
assert(qbits() === 0, `clear: all Q should be 0, got ${qbits().toString(2)}`);
st.clr = 1; solve();

// ── 1. Load a pattern and confirm parallel capture on the rising edge ────────
load(0b101010);
assert(qbits() === 0b101010, `load 101010: got ${qbits().toString(2).padStart(6,'0')}`);

// Per-bit weighting sanity: Q2,Q4,Q6 high; Q1,Q3,Q5 low.
assert(isHigh(read('2Q')) && isHigh(read('4Q')) && isHigh(read('6Q')),
  'expected 2Q,4Q,6Q HIGH');
assert(!isHigh(read('1Q')) && !isHigh(read('3Q')) && !isHigh(read('5Q')),
  'expected 1Q,3Q,5Q LOW');

// ── 2. A falling clock edge must NOT change state ────────────────────────────
// Present a new pattern but only drop the clock — no capture should happen.
for (let i = 0; i < 6; i++) st.d[i] = (0b010101 >> i) & 1;
st.clk = 0; solve();
assert(qbits() === 0b101010, `falling edge held wrong: ${qbits().toString(2).padStart(6,'0')}`);
// Now the rising edge captures the new value.
st.clk = 1; solve();
assert(qbits() === 0b010101, `rising edge capture: ${qbits().toString(2).padStart(6,'0')}`);

// ── 3. Data changing while clock stays HIGH must NOT change Q (edge-only) ─────
const before = qbits();               // 010101
for (let i = 0; i < 6; i++) st.d[i] = (0b111111 >> i) & 1;
solve();                              // clock still HIGH, data changed → hold
assert(qbits() === before, `level-change while CLK high must hold ${before.toString(2)}, got ${qbits().toString(2)}`);

// ── 4. Async CLEAR overrides a held value regardless of clock ────────────────
st.clr = 0; solve();                  // clock still HIGH, clear asserted
assert(qbits() === 0, `async clear over held value: got ${qbits().toString(2)}`);
st.clr = 1; solve();

// ── 5. All-ones load, then all-zeros load (full-rail toggle) ─────────────────
load(0b111111);
assert(qbits() === 0b111111, `load all-ones: got ${qbits().toString(2).padStart(6,'0')}`);
load(0b000000);
assert(qbits() === 0b000000, `load all-zeros: got ${qbits().toString(2).padStart(6,'0')}`);

console.log(`cd40174-hex-dff: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
