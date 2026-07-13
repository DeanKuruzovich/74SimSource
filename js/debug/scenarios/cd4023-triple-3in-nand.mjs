// ── CD4023 triple 3-input NAND — regression ──────────────────────────────────
// The CD4023 (js/chips/chips68.js) is three independent 3-input NAND gates,
// modeled with the built-in NAND primitive (one per gate). The only things that
// can go wrong are (a) the pin map and (b) the per-gate truth table.
//
// Verified against TI SCHS021D ("CD4011B, CD4012B, CD4023B Types — CMOS NAND
// Gates," rev. Sept. 2003) — CD4023B terminal assignment + Fig. 9 logic diagram,
// read as ~300-dpi PDF page images (issues.md C4). The DIP-14 map is:
//   gate 1: in {1,2,8} -> out 9
//   gate 2: in {3,4,5} -> out 6
//   gate 3: in {11,12,13} -> out 10
//   VSS(GND)=7, VDD=14.
//
// PIN-COMPAT NOTE (issues.md C2): this is NOT the TTL 74x10 pinout. The 74x10
// puts gate 1 on {1,2,13}->12 and gate 3 on {8,9,10}->11. Same truth table,
// different wiring — so the CD4023 map must NOT be cloned from the 74x10. This
// guard asserts the real CD4023B map to catch exactly that hazard. (A/B/C input
// labels within a gate are arbitrary — NAND is commutative — so the test would
// still pass if two inputs of a gate were swapped; it exists to catch a gate
// output landing on the WRONG pin.)
//
// Checks:
//   1. Structural — each input/output sits on its expected pin; the outputs
//      (Q1=9, Q2=6, Q3=10) are NOT swapped with an input pin.
//   2. Functional — the full 3-input NAND truth table (all 8 rows) on all three
//      gates: Q is LOW only when all three inputs are HIGH, HIGH otherwise.
//
// Run:  node js/debug/scenarios/cd4023-triple-3in-nand.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4023');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate → { a/b/c [name,pin], y {name,pin} } — the verified CD4023B pin map
const GATES = [
  { a: ['A1', 1],  b: ['B1', 2],  c: ['C1', 8],  y: ['Q1', 9]  },
  { a: ['A2', 3],  b: ['B2', 4],  c: ['C2', 5],  y: ['Q2', 6]  },
  { a: ['A3', 11], b: ['B3', 12], c: ['C3', 13], y: ['Q3', 10] },
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Structural: inputs and outputs land on the expected pins ──────────────
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
// Guard the outputs specifically: pins 9, 6, 10 must be the gate outputs.
assert(chip.getPinByNumber(9)?.name === 'Q1',  'pin 9 must be gate 1 output Q1');
assert(chip.getPinByNumber(6)?.name === 'Q2',  'pin 6 must be gate 2 output Q2');
assert(chip.getPinByNumber(10)?.name === 'Q3', 'pin 10 must be gate 3 output Q3');

// ── 2. Functional: full 3-input NAND truth table on all three gates ──────────
function apply(aBit, bBit, cBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4023 has no pin named ${name}`);
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
  const expected = (a === 1 && b === 1 && c === 1) ? 0 : 1; // NAND: LOW only when all HIGH
  apply(a, b, c);
  for (const g of GATES) {
    const got = isHigh(read(g.y[0])) ? 1 : 0;
    assert(got === expected, `${g.y[0]}: A=${a} B=${b} C=${c} expected Q=${expected}, got ${got}`);
  }
}

console.log(`cd4023-triple-3in-nand: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
