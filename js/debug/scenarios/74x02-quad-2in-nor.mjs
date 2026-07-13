// ── 74x02 quad 2-input NOR — regression ──────────────────────────────────────
// The 74x02 (js/chips/chips1.js) is four independent 2-input NOR gates, modeled
// with the built-in NOR primitive (one per gate). So the only things that can go
// wrong are (a) the pin map and (b) the per-gate truth table.
//
// This guard exists because the 74x02 has the "trap" pinout among the 2-input
// quad gate chips. Verified against TI SDLS027 ("SN5402/SN54LS02/SN54S02/SN7402/
// SN74LS02/SN74S02 Quadruple 2-Input Positive-NOR Gates," standard-DIP terminal
// diagram + Function Table + positive-logic logic diagram, read as 300-dpi PDF
// page images — issues.md C4). The standard DIP-14 terminal assignment is:
//   1Y=1, 1A=2, 1B=3, 2Y=4, 2A=5, 2B=6, GND=7,
//   3A=8, 3B=9, 3Y=10, 4A=11, 4B=12, 4Y=13, VCC=14.
// i.e. the outputs live on pins 1, 4, 10, 13 — NOT on 3, 6, 8, 11 like the 74x00
// NAND / 74x08 AND / 74x32 OR (which put each gate's two inputs first, output
// last). Wiring a 74x02 as if it were a 74x00 is the classic mistake this test
// pins down before it can ship.
//
// Checks:
//   1. Structural — each output sits on the datasheet pin (1Y=1, 2Y=4, 3Y=10,
//      4Y=13) and each input on its datasheet pin. Also asserts pins 3 and 6 are
//      inputs (the 74x00 puts outputs there), catching a copied/scrambled pin map
//      (the CD4082 / issues.md C2 hazard).
//   2. Functional — the full 2-input NOR table on all four gates:
//      (0,0)->1  (0,1)->0  (1,0)->0  (1,1)->0.
//
// Run:  node js/debug/scenarios/74x02-quad-2in-nor.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x02');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate index → { a, b, y, outPin, aPin, bPin } from the verified datasheet map
const GATES = [
  { a: '1A', b: '1B', y: '1Y', outPin: 1,  aPin: 2,  bPin: 3  },
  { a: '2A', b: '2B', y: '2Y', outPin: 4,  aPin: 5,  bPin: 6  },
  { a: '3A', b: '3B', y: '3Y', outPin: 10, aPin: 8,  bPin: 9  },
  { a: '4A', b: '4B', y: '4Y', outPin: 13, aPin: 11, bPin: 12 },
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Structural: outputs and inputs land on the datasheet pins ─────────────
for (const g of GATES) {
  const out = chip.getPinByName(g.y);
  assert(out && out.pin === g.outPin && out.type === 'output',
    `${g.y} should be an output on pin ${g.outPin}, got pin ${out && out.pin} (${out && out.type})`);
  const ia = chip.getPinByName(g.a);
  const ib = chip.getPinByName(g.b);
  assert(ia && ia.pin === g.aPin && ia.type === 'input',
    `${g.a} should be an input on pin ${g.aPin}, got pin ${ia && ia.pin}`);
  assert(ib && ib.pin === g.bPin && ib.type === 'input',
    `${g.b} should be an input on pin ${g.bPin}, got pin ${ib && ib.pin}`);
}
// Power pins: GND=7, VCC=14.
assert(chip.getPinByName('GND')?.pin === 7,  'GND should be pin 7');
assert(chip.getPinByName('VCC')?.pin === 14, 'VCC should be pin 14');
// Guard against a 74x00-style map sneaking in (outputs on 3 & 6, inputs on 1 & 4).
assert(chip.getPinByNumber(1)?.name === '1Y',  'pin 1 must be gate 1 output 1Y (74x00 puts an input here)');
assert(chip.getPinByNumber(4)?.name === '2Y',  'pin 4 must be gate 2 output 2Y');
assert(chip.getPinByNumber(3)?.type === 'input', 'pin 3 must be an input (74x00 puts an output here)');
assert(chip.getPinByNumber(6)?.type === 'input', 'pin 6 must be an input (74x00 puts an output here)');

// ── 2. Functional: NOR truth table on all four gates ─────────────────────────
function apply(aBit, bBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x02 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const g of GATES) {
    wirePin(g.a, aBit);
    wirePin(g.b, bBit);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const TABLE = [
  { a: 0, b: 0, y: 1 }, // NOR: HIGH only when both inputs LOW
  { a: 0, b: 1, y: 0 },
  { a: 1, b: 0, y: 0 },
  { a: 1, b: 1, y: 0 },
];

for (const { a, b, y } of TABLE) {
  apply(a, b);
  for (const g of GATES) {
    const got = isHigh(read(g.y)) ? 1 : 0;
    assert(got === y, `${g.y}: A=${a} B=${b} expected Y=${y}, got ${got}`);
  }
}

console.log(`74x02-quad-2in-nor: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
