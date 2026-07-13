// ── CD4001 quad 2-input NOR (CMOS 4000 series) — regression ──────────────────
// The CD4001 (js/chips/chips68.js) is four independent 2-input NOR gates. It is
// modeled with the built-in NOR primitive (one per gate), so the only things that
// can go wrong are (a) the pin map and (b) the per-gate truth table.
//
// This guard exists because the CD4001 pinout is a classic trap: it is NOT the
// same as the 74x02 quad NOR. Verified against TI SCHS015C (CD4001B Functional
// Diagram, read as 400-dpi PDF page images — issues.md C4), the CD4001 terminal
// assignment is:
//   A=1, B=2, J(out)=3, K(out)=4, C=5, D=6, VSS=7,
//   E=8, F=9, L(out)=10, M(out)=11, G=12, H=13, VDD=14.
// i.e. outputs live on pins 3, 4, 10, 11 (the 4001/4011 layout), whereas the
// 74x02 puts its outputs on 1, 4, 10, 13. The DB entry names the gates
// A1/B1→Q1 (pin 3), A2/B2→Q2 (pin 4), A3/B3→Q3 (pin 10), A4/B4→Q4 (pin 11).
//
// Checks:
//   1. Structural — each output sits on the datasheet pin (Q1=3, Q2=4, Q3=10,
//      Q4=11) and each input on its datasheet pin. Catches a copied/scrambled
//      pin map (the CD4082 / C2 hazard) before it ever ships.
//   2. Functional — the full 2-input NOR table on all four gates:
//      (0,0)->1  (0,1)->0  (1,0)->0  (1,1)->0.
//
// Run:  node js/debug/scenarios/cd4001-quad-nor.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4001');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// gate index → { a, b, q, outPin, aPin, bPin } from the verified datasheet map
const GATES = [
  { a: 'A1', b: 'B1', q: 'Q1', outPin: 3,  aPin: 1,  bPin: 2  },
  { a: 'A2', b: 'B2', q: 'Q2', outPin: 4,  aPin: 5,  bPin: 6  },
  { a: 'A3', b: 'B3', q: 'Q3', outPin: 10, aPin: 8,  bPin: 9  },
  { a: 'A4', b: 'B4', q: 'Q4', outPin: 11, aPin: 12, bPin: 13 },
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Structural: outputs and inputs land on the datasheet pins ─────────────
for (const g of GATES) {
  const out = chip.getPinByName(g.q);
  assert(out && out.pin === g.outPin && out.type === 'output',
    `${g.q} should be an output on pin ${g.outPin}, got pin ${out && out.pin} (${out && out.type})`);
  const ia = chip.getPinByName(g.a);
  const ib = chip.getPinByName(g.b);
  assert(ia && ia.pin === g.aPin && ia.type === 'input',
    `${g.a} should be an input on pin ${g.aPin}, got pin ${ia && ia.pin}`);
  assert(ib && ib.pin === g.bPin && ib.type === 'input',
    `${g.b} should be an input on pin ${g.bPin}, got pin ${ib && ib.pin}`);
}
// Power pins: VSS=7, VDD=14.
assert(chip.getPinByName('GND')?.pin === 7,  'GND should be pin 7');
assert(chip.getPinByName('VDD')?.pin === 14, 'VDD should be pin 14');
// Guard against a 74x02-style map sneaking in (outputs on 1 & 13).
assert(chip.getPinByNumber(1)?.type === 'input',  'pin 1 must be an input (74x02 puts an output here)');
assert(chip.getPinByNumber(13)?.type === 'input', 'pin 13 must be an input (74x02 puts an output here)');

// ── 2. Functional: NOR truth table on all four gates ─────────────────────────
function apply(aBit, bBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4001 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  for (const g of GATES) {
    wirePin(g.a, aBit);
    wirePin(g.b, bBit);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const TABLE = [
  { a: 0, b: 0, y: 1 },
  { a: 0, b: 1, y: 0 },
  { a: 1, b: 0, y: 0 },
  { a: 1, b: 1, y: 0 },
];

for (const { a, b, y } of TABLE) {
  apply(a, b);
  for (const g of GATES) {
    const got = isHigh(read(g.q)) ? 1 : 0;
    assert(got === y, `${g.q}: A=${a} B=${b} expected Q=${y}, got ${got}`);
  }
}

console.log(`cd4001-quad-nor: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
