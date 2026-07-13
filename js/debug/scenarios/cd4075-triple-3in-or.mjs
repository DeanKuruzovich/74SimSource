// ── CD4075 triple 3-input OR — regression ────────────────────────────────────
// The CD4075 (js/chips/chips68.js) is three independent 3-input OR gates, modeled
// with the built-in OR primitive (one per gate). So the only things that can go
// wrong are (a) the pin map and (b) the per-gate truth table.
//
// This guard exists because the CD4075 pin map is INTERLEAVED and was found wrong:
// the batch entry drove pins 1/2/5 into the pin-6 output and pins 3/4/8 into the
// pin-9 output — the two outputs were swapped. Verified against TI SCHS056D
// (CD4071B/CD4072B/CD4075B, CD4075B functional diagram, read as 300-dpi PDF page
// images — issues.md C4/C109), the DIP-14 terminal assignment is:
//   gate 1: A1=1, B1=2, C1=5 → Q1=9
//   gate 2: A2=3, B2=4, C2=8 → Q2=6
//   gate 3: A3=13, B3=12, C3=11 → Q3=10
//   GND(VSS)=7, VDD=14.
//
// Checks:
//   1. Structural — each input/output sits on its datasheet pin. In particular
//      Q1 must be pin 9 and Q2 must be pin 6 (the swap that was fixed). Catches a
//      copied/scrambled pin map (the CD4082 / issues.md C2 hazard).
//   2. Functional — the full 3-input OR truth table (all 8 rows) on all three
//      gates: Q is LOW only for A=B=C=0, HIGH for every other combination.
//
// Run:  node js/debug/scenarios/cd4075-triple-3in-or.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4075');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate → { inputs [name,pin], output {name,pin} } from the verified datasheet map
const GATES = [
  { a: ['A1', 1],  b: ['B1', 2],  c: ['C1', 5], y: ['Q1', 9]  },
  { a: ['A2', 3],  b: ['B2', 4],  c: ['C2', 8], y: ['Q2', 6]  },
  { a: ['A3', 13], b: ['B3', 12], c: ['C3', 11], y: ['Q3', 10] },
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
// Guard the interleaved-output swap specifically: pin 6 = gate 2 out, pin 9 = gate 1 out.
assert(chip.getPinByNumber(6)?.name === 'Q2', 'pin 6 must be gate 2 output Q2 (was swapped with pin 9)');
assert(chip.getPinByNumber(9)?.name === 'Q1', 'pin 9 must be gate 1 output Q1 (was swapped with pin 6)');

// ── 2. Functional: full 3-input OR truth table on all three gates ────────────
function apply(aBit, bBit, cBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4075 has no pin named ${name}`);
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
  const expected = (a === 0 && b === 0 && c === 0) ? 0 : 1; // OR: LOW only when all LOW
  apply(a, b, c);
  for (const g of GATES) {
    const got = isHigh(read(g.y[0])) ? 1 : 0;
    assert(got === expected, `${g.y[0]}: A=${a} B=${b} C=${c} expected Q=${expected}, got ${got}`);
  }
}

console.log(`cd4075-triple-3in-or: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
