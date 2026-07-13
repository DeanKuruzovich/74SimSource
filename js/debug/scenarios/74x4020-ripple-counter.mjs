// ── 74x4020 14-stage binary ripple counter regression ────────────────────────
// The 74x4020 (js/chips/chips57.js) is the 74-series twin of the CD4020 and rides
// the same generic COUNTER_BIN_RIPPLE primitive. It was upgraded in place from a
// GENERIC_STUB; this guard locks in the corrected DB entry: the Q-stage pin map
// (the original stub mis-numbered the high stages and wrongly brought out Q2/Q3),
// the FALLING-edge clock, and the active-HIGH asynchronous master reset (MR).
//
// Pinout verified vs TI SCLS158F (SN74HC4020): CLK=pin 10, MR(CLR)=pin 11, power
// pins named VCC(16)/GND(8). Stage→bit map (Q_n = bit n-1): Q1=bit0, Q4=bit3 …
// Q14=bit13. Stages 2 and 3 are internal-only, so Q2/Q3 are absent from the part.
// Checks:
//   • MR HIGH → every output LOW                          (async clear)
//   • 1 falling edge → Q1 HIGH, Q4/Q5 LOW                 (LSB toggles, count=1)
//   • a rising edge alone does NOT advance the count      (falling-edge only)
//   • 8 falling edges → Q4 HIGH (÷16 stage), Q1/Q5 LOW    (count=8, bit3 set)
//   • 16 falling edges → Q5 HIGH, Q4 LOW                  (count=16, bit4 set)
//   • MR HIGH mid-count → all outputs LOW again           (async clear wins)
//
// Run:  node js/debug/scenarios/74x4020-ripple-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4020');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLK and MR held at the given rail levels (1 = VCC row, 0 = GND
// row). A fresh WireManager each call is fine — the counter state lives on the
// (persistent) chip component, not the wires.
function apply({ clk, reset }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4020 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('MR', reset ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// One full clock pulse = rising then falling edge; the count advances on the
// falling edge. MR held LOW unless overridden.
function pulse(n = 1, reset = false) {
  for (let i = 0; i < n; i++) {
    apply({ clk: true,  reset });   // rising edge (no advance)
    apply({ clk: false, reset });   // falling edge (advance)
  }
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const ALL_Q = ['Q1','Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q11','Q12','Q13','Q14'];
const allLow = () => ALL_Q.every(q => isLow(read(q)));

// ── 0. Power up with MR asserted → all stages cleared ────────────────────────
apply({ clk: false, reset: true });
assert(allLow(), `reset: expected all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);

// Release reset (CLK low, no edge yet) — still zero.
apply({ clk: false, reset: false });
assert(allLow(), 'post-reset idle: expected all Q LOW');

// ── 1. One falling edge → count = 1 → Q1 HIGH, Q4/Q5 LOW ─────────────────────
pulse(1);
assert(isHigh(read('Q1')), `1 edge: Q1 should be HIGH (count=1), got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q4')),  `1 edge: Q4 should be LOW, got ${read('Q4').toFixed(2)} V`);
assert(isLow(read('Q5')),  `1 edge: Q5 should be LOW, got ${read('Q5').toFixed(2)} V`);

// ── 2. A bare rising edge must NOT advance the count (falling-edge only) ──────
apply({ clk: true, reset: false });
assert(isHigh(read('Q1')), `rising edge: Q1 should stay HIGH (no advance), got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q4')),  `rising edge: Q4 should stay LOW, got ${read('Q4').toFixed(2)} V`);
apply({ clk: false, reset: false }); // falling edge → count now 2

// ── 3. Advance to count = 8 → Q4 (÷16 stage, bit3) HIGH, Q1/Q5 LOW ───────────
pulse(6); // count 2 → 8
assert(isHigh(read('Q4')), `8 edges: Q4 should be HIGH (count=8, bit3), got ${read('Q4').toFixed(2)} V`);
assert(isLow(read('Q1')),  `8 edges: Q1 should be LOW, got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q5')),  `8 edges: Q5 should be LOW, got ${read('Q5').toFixed(2)} V`);

// ── 4. Advance to count = 16 → Q5 (bit4) HIGH, Q4 LOW ────────────────────────
pulse(8);
assert(isHigh(read('Q5')), `16 edges: Q5 should be HIGH (count=16, bit4), got ${read('Q5').toFixed(2)} V`);
assert(isLow(read('Q4')),  `16 edges: Q4 should be LOW, got ${read('Q4').toFixed(2)} V`);
assert(isLow(read('Q1')),  `16 edges: Q1 should be LOW, got ${read('Q1').toFixed(2)} V`);

// ── 5. Asynchronous MR mid-count clears everything ───────────────────────────
apply({ clk: false, reset: true });
assert(allLow(), `async reset: expected all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);

console.log(`74x4020-ripple-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
