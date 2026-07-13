// ── 74x4040 12-stage binary ripple counter regression ───────────────────────
// The 74x4040 (js/chips/chips57.js) reuses the generic COUNTER_BIN_RIPPLE engine
// primitive (also used by the CD4020/CD4024/CD4040). All 12 stages Q1–Q12 are
// brought out to pins, so this scenario also guards the pin map (Q1..Q12 across
// the corrected pin assignment) and the 2^12 = 4096 wrap.
//
// Pinout verified vs TI SCLS160E (SNx4HC4040): the hand-entered stub had CLK/MR
// swapped (pin10=CLK, pin11=MR) and Q8–Q11 scrambled; fixed in place. Counter
// advances on the HIGH→LOW (falling) CLK edge; a HIGH on MR clears all stages.
//
// Method: place ONE 74x4040 and keep the same chip + sim instance across the
// whole run so the counter's sequential state persists. A clock "pulse" re-wires
// CLK HIGH then LOW (a falling edge); each high→low transition advances by one.
//
// Run:  node js/debug/scenarios/74x4040-ripple-counter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4040');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply({ clk, reset }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4040 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('MR',  reset ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// One full clock pulse = rising then falling edge; advance is on the falling edge.
function pulse(n = 1, reset = false) {
  for (let i = 0; i < n; i++) {
    apply({ clk: true,  reset });   // rising edge (no advance)
    apply({ clk: false, reset });   // falling edge (advance)
  }
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const ALL_Q = ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q11','Q12'];
const allLow  = () => ALL_Q.every(q => isLow(read(q)));
const allHigh = () => ALL_Q.every(q => isHigh(read(q)));

// ── 0. Power up with MR asserted → all stages cleared ────────────────────────
apply({ clk: false, reset: true });
assert(allLow(), `reset: expected all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);
apply({ clk: false, reset: false });
assert(allLow(), 'post-reset idle: expected all Q LOW');

// ── 1. One falling edge → count = 1 → Q1 HIGH, Q2/Q3 LOW ─────────────────────
pulse(1);
assert(isHigh(read('Q1')), `1 edge: Q1 should be HIGH (count=1), got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q2')),  `1 edge: Q2 should be LOW, got ${read('Q2').toFixed(2)} V`);

// ── 2. A bare rising edge must NOT advance (falling-edge only) ────────────────
apply({ clk: true, reset: false });
assert(isHigh(read('Q1')), `rising edge: Q1 should stay HIGH (no advance), got ${read('Q1').toFixed(2)} V`);
apply({ clk: false, reset: false }); // falling edge → count now 2

// ── 3. Advance to count = 8 → Q4 (bit3) HIGH, lower bits LOW ──────────────────
pulse(6); // 2 + 6 = 8
assert(isHigh(read('Q4')), `8 edges: Q4 should be HIGH (count=8), got ${read('Q4').toFixed(2)} V`);
assert(isLow(read('Q1')),  `8 edges: Q1 should be LOW`);
assert(isLow(read('Q2')),  `8 edges: Q2 should be LOW`);
assert(isLow(read('Q3')),  `8 edges: Q3 should be LOW`);

// ── 4. count = 2048 → only Q12 (bit11) HIGH (guards high-stage pin map) ───────
pulse(2040); // 8 + 2040 = 2048
assert(isHigh(read('Q12')), `2048 edges: Q12 should be HIGH, got ${read('Q12').toFixed(2)} V`);
for (const q of ['Q8','Q9','Q10','Q11'])
  assert(isLow(read(q)), `2048 edges: ${q} should be LOW`);

// ── 5. Full scale count = 4095 → every stage HIGH ────────────────────────────
pulse(2047); // 2048 + 2047 = 4095
assert(allHigh(), `4095 edges: expected all Q HIGH, got [${ALL_Q.filter(q => isLow(read(q))).join(',')}] LOW`);

// ── 6. One more edge → 4096 wraps to all LOW (2^12 rollover) ──────────────────
pulse(1);
assert(allLow(), `4096 edges: expected wrap to all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);

// ── 7. Asynchronous MR mid-count clears everything ───────────────────────────
pulse(5);
apply({ clk: false, reset: true });
assert(allLow(), `async reset: expected all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);

console.log(`74x4040-ripple-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
