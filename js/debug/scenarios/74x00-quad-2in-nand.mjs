// ── 74x00 quad 2-input NAND — regression ─────────────────────────────────────
// The 74x00 (js/chips/chips1.js) is four independent 2-input NAND gates, modeled
// with the built-in NAND primitive (one per gate). So the only things that can go
// wrong are (a) the pin map and (b) the per-gate truth table.
//
// Verified against TI SDLS025D ("SNx400/SNx4LS00/SNx4S00 Quadruple 2-Input
// Positive-NAND Gates," terminal diagram + Pin Functions table, read as 300-dpi
// PDF page images — issues.md C4). The standard DIP-14 terminal assignment is:
//   1A=1, 1B=2, 1Y=3, 2A=4, 2B=5, 2Y=6, GND=7,
//   3Y=8, 4Y=11, VCC=14, with gate-3 and gate-4 inputs on 9/10 and 12/13.
//
// A/B LABEL NOTE (issues.md C112): the A/B labels on the symmetric gate inputs are
// arbitrary and TI's own datasheets disagree — SDLS025D prints 3A=10/3B=9 and
// 4A=13/4B=12, while the '03 (SDLS028) and '132 (SDLS047) print the reverse. 74Sim
// uses the '03/'132 order (3A=9, 3B=10, 4A=12, 4B=13) consistently across all its
// 2-input gate chips (74x08/74x32/74x86), and this guard asserts that order. Because
// NAND is commutative, the choice never changes the simulation — this test would
// still pass if the two input labels of any gate were swapped; it exists to catch a
// gate/output landing on the WRONG pin (the CD4082 / issues.md C2 hazard), not to
// police the immaterial A-vs-B naming.
//
// Checks:
//   1. Structural — each input/output sits on its expected pin, and the outputs
//      (3Y=8, 4Y=11) are NOT swapped with an input pin.
//   2. Functional — the full 2-input NAND truth table (all 4 rows) on all four
//      gates: Y is LOW only when both inputs are HIGH, HIGH otherwise.
//
// Run:  node js/debug/scenarios/74x00-quad-2in-nand.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x00');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate → { inputs [name,pin], output {name,pin} } — the 74Sim pin map (see note above)
const GATES = [
  { a: ['1A', 1],  b: ['1B', 2],  y: ['1Y', 3]  },
  { a: ['2A', 4],  b: ['2B', 5],  y: ['2Y', 6]  },
  { a: ['3A', 9],  b: ['3B', 10], y: ['3Y', 8]  },
  { a: ['4A', 12], b: ['4B', 13], y: ['4Y', 11] },
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Structural: inputs and outputs land on the expected pins ──────────────
for (const g of GATES) {
  for (const [name, pin] of [g.a, g.b]) {
    const p = chip.getPinByName(name);
    assert(p && p.pin === pin && p.type === 'input',
      `${name} should be an input on pin ${pin}, got pin ${p && p.pin} (${p && p.type})`);
  }
  const [yName, yPin] = g.y;
  const out = chip.getPinByName(yName);
  assert(out && out.pin === yPin && out.type === 'output',
    `${yName} should be an output on pin ${yPin}, got pin ${out && out.pin} (${out && out.type})`);
}
assert(chip.getPinByName('GND')?.pin === 7,  'GND should be pin 7');
assert(chip.getPinByName('VCC')?.pin === 14, 'VCC should be pin 14');
// Guard the outputs specifically: pins 3, 6, 8, 11 must be the gate outputs.
assert(chip.getPinByNumber(3)?.name === '1Y',  'pin 3 must be gate 1 output 1Y');
assert(chip.getPinByNumber(6)?.name === '2Y',  'pin 6 must be gate 2 output 2Y');
assert(chip.getPinByNumber(8)?.name === '3Y',  'pin 8 must be gate 3 output 3Y');
assert(chip.getPinByNumber(11)?.name === '4Y', 'pin 11 must be gate 4 output 4Y');

// ── 2. Functional: full 2-input NAND truth table on all four gates ───────────
function apply(aBit, bBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x00 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const g of GATES) {
    wirePin(g.a[0], aBit);
    wirePin(g.b[0], bBit);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

for (let n = 0; n < 4; n++) {
  const a = (n >> 1) & 1, b = n & 1;
  const expected = (a === 1 && b === 1) ? 0 : 1; // NAND: LOW only when both HIGH
  apply(a, b);
  for (const g of GATES) {
    const got = isHigh(read(g.y[0])) ? 1 : 0;
    assert(got === expected, `${g.y[0]}: A=${a} B=${b} expected Y=${expected}, got ${got}`);
  }
}

console.log(`74x00-quad-2in-nand: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
