// ── 74x27 triple 3-input NOR — regression ────────────────────────────────────
// The 74x27 (js/chips/chips2.js) is three independent 3-input NOR gates, modeled
// with the built-in NOR primitive (one per gate). So the only things that can go
// wrong are (a) the pin map and (b) the per-gate truth table.
//
// This guard exists because the 7427 pin map has a trap: gates 2 and 3 keep their
// three inputs and their output on neighbouring pins, but gate 1 splits its third
// input (1C) and its output (1Y) across the package. Verified against TI SDLS089
// (SN5427/SN74LS27 terminal diagram + function table, read as 300-dpi PDF page
// images — issues.md C4), the DIP-14 terminal assignment is:
//   1A=1, 1B=2, 2A=3, 2B=4, 2C=5, 2Y=6, GND=7,
//   3Y=8, 3A=9, 3B=10, 3C=11, 1Y=12, 1C=13, VCC=14.
//
// Checks:
//   1. Structural — each input/output sits on its datasheet pin. Catches a
//      copied/scrambled pin map (the CD4082 / issues.md C2 hazard), in particular
//      gate 1's split 1C=13 / 1Y=12.
//   2. Functional — the full 3-input NOR truth table (all 8 rows) on all three
//      gates: Y is HIGH only for A=B=C=0, LOW for every other combination.
//
// Run:  node js/debug/scenarios/74x27-triple-3in-nor.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x27');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate → { inputs [name,pin], output {name,pin} } from the verified datasheet map
const GATES = [
  { a: ['1A', 1], b: ['1B', 2],  c: ['1C', 13], y: ['1Y', 12] },
  { a: ['2A', 3], b: ['2B', 4],  c: ['2C', 5],  y: ['2Y', 6]  },
  { a: ['3A', 9], b: ['3B', 10], c: ['3C', 11], y: ['3Y', 8]  },
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
assert(chip.getPinByName('VCC')?.pin === 14, 'VCC should be pin 14');
// Guard the split gate-1 layout specifically: pin 13 is an input, pin 12 an output.
assert(chip.getPinByNumber(13)?.name === '1C', 'pin 13 must be gate 1 input 1C (split layout)');
assert(chip.getPinByNumber(12)?.name === '1Y', 'pin 12 must be gate 1 output 1Y (split layout)');

// ── 2. Functional: full 3-input NOR truth table on all three gates ───────────
function apply(aBit, bBit, cBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x27 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
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
  const expected = (a === 0 && b === 0 && c === 0) ? 1 : 0; // NOR: HIGH only when all LOW
  apply(a, b, c);
  for (const g of GATES) {
    const got = isHigh(read(g.y[0])) ? 1 : 0;
    assert(got === expected, `${g.y[0]}: A=${a} B=${b} C=${c} expected Y=${expected}, got ${got}`);
  }
}

console.log(`74x27-triple-3in-nor: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
