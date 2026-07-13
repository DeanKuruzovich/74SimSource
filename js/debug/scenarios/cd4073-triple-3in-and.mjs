// ── CD4073 triple 3-input AND — regression ───────────────────────────────────
// The CD4073 (js/chips/chips68.js) is three independent 3-input AND gates, modeled
// with the built-in AND primitive (one per gate). So the only things that can go
// wrong are (a) the pin map and (b) the per-gate truth table.
//
// This guard exists because the CD4073 pin map is INTERLEAVED and was found wrong:
// the batch entry drove pins 1/2/5 into the pin-6 output and pins 3/4/8 into the
// pin-9 output — gate 1 and gate 2's outputs AND their third inputs were both
// transposed. Verified against TI SCHS057C (CD4073B/CD4081B/CD4082B, CD4073B
// functional diagram p.1 + Fig. 13 logic diagram p.3, read as 400-dpi PDF page
// images — issues.md C4/C114) and cross-checked against the identical CD4075B
// functional diagram (SCHS056D), the DIP-14 terminal assignment is:
//   gate 1: A1=1, B1=2, C1=8 → Q1=9
//   gate 2: A2=3, B2=4, C2=5 → Q2=6
//   gate 3: A3=11, B3=12, C3=13 → Q3=10
//   GND(VSS)=7, VDD=14.
//
// Checks:
//   1. Structural — each input/output sits on its datasheet pin. In particular
//      Q1 must be pin 9 / Q2 must be pin 6 (the output swap that was fixed), and
//      C1 must be pin 8 / C2 must be pin 5 (the third-input swap that was fixed).
//      Catches a copied/scrambled pin map (the CD4082 / issues.md C2 hazard).
//   2. Functional — the full 3-input AND truth table (all 8 rows) on all three
//      gates: Q is HIGH only for A=B=C=1, LOW for every other combination.
//
// Run:  node js/debug/scenarios/cd4073-triple-3in-and.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4073');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate → { inputs [name,pin], output {name,pin} } from the verified datasheet map
const GATES = [
  { a: ['A1', 1],  b: ['B1', 2],  c: ['C1', 8],  y: ['Q1', 9]  },
  { a: ['A2', 3],  b: ['B2', 4],  c: ['C2', 5],  y: ['Q2', 6]  },
  { a: ['A3', 11], b: ['B3', 12], c: ['C3', 13], y: ['Q3', 10] },
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Structural: inputs and outputs land on the datasheet pins ─────────────
for (const g of GATES) {
  for (const [name, pin] of [g.a, g.b, g.c]) {
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
assert(chip.getPinByName('VDD')?.pin === 14, 'VDD should be pin 14');
// Guard the specific batch bug: outputs and third inputs of gates 1 & 2 were swapped.
assert(chip.getPinByNumber(6)?.name === 'Q2', 'pin 6 must be gate 2 output Q2 (was swapped with pin 9)');
assert(chip.getPinByNumber(9)?.name === 'Q1', 'pin 9 must be gate 1 output Q1 (was swapped with pin 6)');
assert(chip.getPinByNumber(8)?.name === 'C1', 'pin 8 must be gate 1 third input C1 (was swapped with pin 5)');
assert(chip.getPinByNumber(5)?.name === 'C2', 'pin 5 must be gate 2 third input C2 (was swapped with pin 8)');

// ── 2. Functional: full 3-input AND truth table on all three gates ───────────
function apply(aBit, bBit, cBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4073 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  for (const g of GATES) {
    wirePin(g.a[0], aBit);
    wirePin(g.b[0], bBit);
    wirePin(g.c[0], cBit);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

for (let n = 0; n < 8; n++) {
  const a = (n >> 2) & 1, b = (n >> 1) & 1, c = n & 1;
  const expected = (a === 1 && b === 1 && c === 1) ? 1 : 0; // AND: HIGH only when all HIGH
  apply(a, b, c);
  for (const g of GATES) {
    const got = isHigh(read(g.y[0])) ? 1 : 0;
    assert(got === expected, `${g.y[0]}: A=${a} B=${b} C=${c} expected Q=${expected}, got ${got}`);
  }
}

console.log(`cd4073-triple-3in-and: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
