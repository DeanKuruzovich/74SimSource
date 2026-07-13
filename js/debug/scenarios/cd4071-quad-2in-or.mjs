// ── CD4071 quad 2-input OR (CMOS 4000 series) — regression ───────────────────
// The CD4071 (js/chips/chips68.js) is four independent 2-input OR gates, modeled
// with the built-in OR primitive (one per gate). So the only things that can go
// wrong are (a) the pin map and (b) the per-gate truth table.
//
// Verified against Texas Instruments SCHS056D ("CD4071B, CD4072B, CD4075B Types —
// CMOS OR Gates," TERMINAL ASSIGNMENTS TOP VIEW + FUNCTIONAL DIAGRAM, read as
// 300-dpi PDF page images — issues.md C4). The DIP-14 terminal assignment is:
//   A=1, B=2, J(=A+B)=3, K(=C+D)=4, C=5, D=6, VSS=7,
//   E=8, F=9, L(=E+F)=10, M(=G+H)=11, G=12, H=13, VDD=14.
// In the entry's A1/B1/Q1 naming that is:
//   gate1 in 1,2 → out 3 | gate2 in 5,6 → out 4 |
//   gate3 in 8,9 → out 10 | gate4 in 12,13 → out 11.
//
// PINOUT HAZARD (issues.md C2/C5): the 4000-series quad-2-input gate family lands
// its outputs on pins 3,4,10,11 — a DIFFERENT map from the 74-series 7432/74HC32
// OR (outputs on 3,6,8,11). This guard exists to catch a gate/output landing on
// the wrong pin (e.g. a 74x32 pin map copied onto this part), not to police the
// commutative A-vs-B input naming (OR is commutative, so swapping a gate's two
// input labels would still pass).
//
// Checks:
//   1. Structural — each input/output sits on its expected pin, and the four
//      outputs land on pins 3, 4, 10, 11 (NOT the 74x32's 3, 6, 8, 11).
//   2. Functional — the full 2-input OR truth table (all 4 rows) on all four
//      gates: Q is LOW only when both inputs are LOW, HIGH otherwise.
//
// Run:  node js/debug/scenarios/cd4071-quad-2in-or.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4071');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate → { inputs [name,pin], output {name,pin} } — the verified CD4071 pin map
const GATES = [
  { a: ['A1', 1],  b: ['B1', 2],  q: ['Q1', 3]  },
  { a: ['A2', 5],  b: ['B2', 6],  q: ['Q2', 4]  },
  { a: ['A3', 8],  b: ['B3', 9],  q: ['Q3', 10] },
  { a: ['A4', 12], b: ['B4', 13], q: ['Q4', 11] },
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
  const [qName, qPin] = g.q;
  const out = chip.getPinByName(qName);
  assert(out && out.pin === qPin && out.type === 'output',
    `${qName} should be an output on pin ${qPin}, got pin ${out && out.pin} (${out && out.type})`);
}
assert(chip.getPinByName('GND')?.pin === 7,  'GND (VSS) should be pin 7');
assert(chip.getPinByName('VDD')?.pin === 14, 'VDD should be pin 14');
// Guard the outputs specifically: pins 3, 4, 10, 11 are the gate outputs — the
// 4000-series family map, NOT the 74x32's 3, 6, 8, 11 (issues.md C2 hazard).
assert(chip.getPinByNumber(3)?.name === 'Q1',  'pin 3 must be gate 1 output Q1');
assert(chip.getPinByNumber(4)?.name === 'Q2',  'pin 4 must be gate 2 output Q2');
assert(chip.getPinByNumber(10)?.name === 'Q3', 'pin 10 must be gate 3 output Q3');
assert(chip.getPinByNumber(11)?.name === 'Q4', 'pin 11 must be gate 4 output Q4');

// ── 2. Functional: full 2-input OR truth table on all four gates ─────────────
function apply(aBit, bBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4071 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VDD', 1);
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
  const expected = (a === 0 && b === 0) ? 0 : 1; // OR: LOW only when both LOW
  apply(a, b);
  for (const g of GATES) {
    const got = isHigh(read(g.q[0])) ? 1 : 0;
    assert(got === expected, `${g.q[0]}: A=${a} B=${b} expected Q=${expected}, got ${got}`);
  }
}

console.log(`cd4071-quad-2in-or: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
