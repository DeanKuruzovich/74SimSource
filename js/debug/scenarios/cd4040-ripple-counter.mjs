// ── CD4040 12-stage binary ripple counter regression ────────────────────────
// The CD4040 (Batch 5, js/chips/chips83.js) reuses the generic
// COUNTER_BIN_RIPPLE primitive (also used by the CD4020). Unlike the CD4020,
// ALL 12 stages Q1–Q12 are brought out to pins, so this scenario also guards
// the consecutive-stage pin map (Q1..Q12) and the 2^12 = 4096 wrap.
//
// Method: place ONE CD4040 and keep the same chip + sim instance across the
// whole run so the counter's sequential state (comp.ffState) persists. A clock
// "pulse" is produced by re-wiring the CLK pin HIGH then LOW (a falling edge);
// each high→low transition advances the count by one. Outputs are read straight
// off the pins by name.
//
// Stage→bit map (Q_n = bit n-1): Q1=bit0, Q2=bit1, … Q12=bit11.
// Checks:
//   • RESET HIGH → every output LOW                       (async clear)
//   • 1 falling edge → Q1 HIGH, Q2/Q3 LOW                 (LSB toggles, count=1)
//   • a bare rising edge alone does NOT advance the count (falling-edge only)
//   • count=8 → Q4 HIGH, lower bits LOW                   (bit3 set)
//   • count=4095 → Q1..Q12 all HIGH                       (full scale)
//   • 1 more edge (→4096) wraps to all LOW                (2^12 rollover)
//   • RESET HIGH mid-count → all outputs LOW again        (async clear wins)
//
// Run:  node js/debug/scenarios/cd4040-ripple-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4040');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLK and RESET held at the given rail levels (1 = VCC row, 0 =
// GND row). A fresh WireManager each call is fine — the counter state lives on
// the (persistent) chip component, not the wires.
function apply({ clk, reset }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4040 has no pin named ${name}`);
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

const ALL_Q = ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q11','Q12'];
const allLow  = () => ALL_Q.every(q => isLow(read(q)));
const allHigh = () => ALL_Q.every(q => isHigh(read(q)));

// ── 0. Power up with RESET asserted → all stages cleared ─────────────────────
apply({ clk: false, reset: true });
assert(allLow(), `reset: expected all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);

// Release reset (CLK low, no edge yet) — still zero.
apply({ clk: false, reset: false });
assert(allLow(), 'post-reset idle: expected all Q LOW');

// ── 1. One falling edge → count = 1 → Q1 HIGH, Q2/Q3 LOW ─────────────────────
pulse(1);
assert(isHigh(read('Q1')), `1 edge: Q1 should be HIGH (count=1), got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q2')),  `1 edge: Q2 should be LOW, got ${read('Q2').toFixed(2)} V`);
assert(isLow(read('Q3')),  `1 edge: Q3 should be LOW, got ${read('Q3').toFixed(2)} V`);

// ── 2. A bare rising edge must NOT advance the count (falling-edge only) ──────
apply({ clk: true, reset: false });
assert(isHigh(read('Q1')), `rising edge: Q1 should stay HIGH (no advance), got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q2')),  `rising edge: Q2 should stay LOW, got ${read('Q2').toFixed(2)} V`);
apply({ clk: false, reset: false }); // falling edge → count now 2

// ── 3. Advance to count = 8 → Q4 (bit3) HIGH, Q1/Q2/Q3 LOW ───────────────────
// We are at count=2 after the previous falling edge; +6 more = 8.
pulse(6);
assert(isHigh(read('Q4')), `8 edges: Q4 should be HIGH (count=8, bit3), got ${read('Q4').toFixed(2)} V`);
assert(isLow(read('Q1')),  `8 edges: Q1 should be LOW, got ${read('Q1').toFixed(2)} V`);
assert(isLow(read('Q2')),  `8 edges: Q2 should be LOW, got ${read('Q2').toFixed(2)} V`);
assert(isLow(read('Q3')),  `8 edges: Q3 should be LOW, got ${read('Q3').toFixed(2)} V`);

// ── 4. Advance to full scale count = 4095 → every stage HIGH ─────────────────
// Currently at count=8; +4087 more = 4095 (all 12 bits set).
pulse(4087);
assert(allHigh(), `4095 edges: expected all Q HIGH, got [${ALL_Q.filter(q => isLow(read(q))).join(',')}] LOW`);

// ── 5. One more edge → count rolls over 4096 → 0 (2^12 wrap) ─────────────────
pulse(1);
assert(allLow(), `4096 edges: expected wrap to all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);

// ── 6. Asynchronous RESET mid-count clears everything ────────────────────────
pulse(5); // count = 5, some bits set
apply({ clk: false, reset: true });
assert(allLow(), `async reset: expected all Q LOW, got [${ALL_Q.filter(q => isHigh(read(q))).join(',')}] HIGH`);

console.log(`cd4040-ripple-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
