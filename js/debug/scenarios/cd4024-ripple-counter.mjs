// ── CD4024 7-stage binary ripple counter regression ──────────────────────────
// The CD4024 (Batch 5, js/chips/chips84.js) reuses the generic
// COUNTER_BIN_RIPPLE primitive (shared with the CD4020/CD4040). Unlike the
// CD4020, the CD4024 brings out ALL seven stages (Q1..Q7), so this scenario
// guards the full stage→pin map plus the falling-edge clock and active-HIGH
// asynchronous RESET.
//
// Method: place ONE CD4024 and keep the same chip + sim instance across the
// whole run so the counter's sequential state (comp.ffState) persists. A clock
// "pulse" is produced by re-wiring the CLK pin HIGH then LOW (a falling edge);
// each high→low transition advances the count by one. Outputs are read straight
// off the pins by name.
//
// Stage→bit map (Q_n = bit n-1): Q1=bit0 … Q7=bit6, wrap at 2^7 = 128.
// Checks:
//   • RESET HIGH → every output LOW                       (async clear)
//   • 1 falling edge → Q1 HIGH, rest LOW                  (count=1, LSB toggles)
//   • a rising edge alone does NOT advance the count      (falling-edge only)
//   • 8 falling edges → Q4 HIGH, Q1/Q2/Q3 LOW             (count=8, bit3 set)
//   • 64 falling edges → Q7 HIGH, all lower LOW           (count=64, bit6/MSB)
//   • 128 edges total → wrap back to 0 (all LOW)          (mod-128 rollover)
//   • RESET HIGH mid-count → all outputs LOW again        (async clear wins)
//
// Run:  node js/debug/scenarios/cd4024-ripple-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4024');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLK and RESET held at the given rail levels (1 = VCC row, 0 =
// GND row). A fresh WireManager each call is fine — the counter state lives on
// the (persistent) chip component, not the wires.
function apply({ clk, reset }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4024 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('RESET', reset ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// One full clock pulse = rising then falling edge; the count advances on the
// falling edge. RESET held LOW unless overridden.
function pulse(n = 1, reset = false) {
  for (let i = 0; i < n; i++) {
    apply({ clk: true,  reset });   // rising edge (no advance)
    apply({ clk: false, reset });   // falling edge (advance)
  }
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const ALL_Q = ['Q1','Q2','Q3','Q4','Q5','Q6','Q7'];
const allLow = () => ALL_Q.every(q => isLow(read(q)));
const highList = () => ALL_Q.filter(q => isHigh(read(q))).join(',');

// ── 0. Power up with RESET asserted → all stages cleared ─────────────────────
apply({ clk: false, reset: true });
assert(allLow(), `reset: expected all Q LOW, got [${highList()}] HIGH`);

// Release reset (CLK low, no edge yet) — still zero.
apply({ clk: false, reset: false });
assert(allLow(), 'post-reset idle: expected all Q LOW');

// ── 1. One falling edge → count = 1 → Q1 HIGH, rest LOW ──────────────────────
pulse(1);
assert(isHigh(read('Q1')), `1 edge: Q1 should be HIGH (count=1), got ${read('Q1').toFixed(2)} V`);
assert(ALL_Q.slice(1).every(q => isLow(read(q))), `1 edge: Q2..Q7 should be LOW, got [${highList()}] HIGH`);

// ── 2. A bare rising edge must NOT advance the count (falling-edge only) ──────
apply({ clk: true, reset: false });
assert(isHigh(read('Q1')), `rising edge: Q1 should stay HIGH (no advance), got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q2')),  `rising edge: Q2 should stay LOW, got ${read('Q2').toFixed(2)} V`);
apply({ clk: false, reset: false }); // falling edge → count now 2

// ── 3. Advance to count = 8 → Q4 (bit3) HIGH, Q1/Q2/Q3 LOW ───────────────────
// We are at count=2 after the previous falling edge; +6 more = 8.
pulse(6);
assert(isHigh(read('Q4')), `8 edges: Q4 should be HIGH (count=8, bit3), got ${read('Q4').toFixed(2)} V`);
assert(isLow(read('Q1')) && isLow(read('Q2')) && isLow(read('Q3')),
  `8 edges: Q1/Q2/Q3 should be LOW, got [${highList()}] HIGH`);

// ── 4. Advance to count = 64 → Q7 (bit6, MSB) HIGH, all lower LOW ─────────────
// We are at count=8; +56 more = 64.
pulse(56);
assert(isHigh(read('Q7')), `64 edges: Q7 should be HIGH (count=64, MSB), got ${read('Q7').toFixed(2)} V`);
assert(ALL_Q.slice(0, 6).every(q => isLow(read(q))),
  `64 edges: Q1..Q6 should be LOW, got [${highList()}] HIGH`);

// ── 5. Wrap: 128 edges total → back to 0 (mod-128 rollover) ──────────────────
// We are at count=64; +64 more = 128 ≡ 0.
pulse(64);
assert(allLow(), `128 edges: expected wrap to 0 (all LOW), got [${highList()}] HIGH`);

// ── 6. Asynchronous RESET mid-count clears everything ────────────────────────
pulse(5); // count = 5, some stages high
apply({ clk: false, reset: true });
assert(allLow(), `async reset: expected all Q LOW, got [${highList()}] HIGH`);

console.log(`cd4024-ripple-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
