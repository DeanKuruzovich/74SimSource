// ── 74x85 4-bit magnitude comparator — regression ────────────────────────────
// The 74x85 (js/chips/chips3.js) compares two 4-bit numbers A (A0-A3) and
// B (B0-B3) and drives exactly one of three outputs HIGH: AGTB (A>B), AEQB
// (A=B), ALTB (A<B). Three cascade inputs (AGTBIN/AEQBIN/ALTBIN) chain chips
// for wider words and set the tie behavior of a single chip.
//
// Verified against Texas Instruments, "SN5485 … SN74LS85 … 4-Bit Magnitude
// Comparators", SDLS123 (Mar. 1974, rev. Mar. 1988), page 1 FUNCTION TABLE,
// read as 300-dpi PDF page images (issues.md C4). The COMPARATOR_4BIT primitive
// is shared with CD4063 and CD4585.
//
// Method: place ONE 74x85 (purely combinational), drive A0-A3, B0-B3 and the
// three cascade inputs to the VCC/GND rail, re-solve, read the outputs by name.
//
// Checks (all VALID datasheet rows — the model matches the function table here):
//   1. Standalone (AGTBIN=0, AEQBIN=1, ALTBIN=0): exhaustive 256 (A,B) pairs.
//      Exactly one output HIGH, matching sign(A-B).
//   2. Cascade tie rows: when A==B, the output follows the single asserted
//      cascade line (AGTBIN→AGTB, ALTBIN→ALTB, AEQBIN→AEQB).
//   3. A chip's own bits win over the cascade inputs when they are unequal.
//
// NOT checked (documented idealization, issues.md C93): the two INVALID cascade
// rows — A>Bin & A<Bin both HIGH (silicon → all outputs LOW) and all three
// cascade inputs LOW (silicon → A>Bout & A<Bout both HIGH). Correct wiring never
// reaches them; 74Sim keeps its A>Bin-priority order instead.
//
// Run:  node js/debug/scenarios/74x85-magnitude-comparator.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x85');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A_PINS = ['A0', 'A1', 'A2', 'A3'];
const B_PINS = ['B0', 'B1', 'B2', 'B3'];

// Drive A (0-15), B (0-15) and the three cascade inputs (gt, eq, lt each 0/1).
function apply(a, b, gt, eq, lt) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x85 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  A_PINS.forEach((name, i) => wirePin(name, (a >> i) & 1));
  B_PINS.forEach((name, i) => wirePin(name, (b >> i) & 1));
  wirePin('AGTBIN', gt);
  wirePin('AEQBIN', eq);
  wirePin('ALTBIN', lt);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const outputs = () => ({
  gt: isHigh(read('AGTB')) ? 1 : 0,
  eq: isHigh(read('AEQB')) ? 1 : 0,
  lt: isHigh(read('ALTB')) ? 1 : 0,
});

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Standalone comparison: exhaustive 256 (A,B) pairs ─────────────────────
// Single chip → AEQBIN HIGH, AGTBIN/ALTBIN LOW.
for (let a = 0; a < 16; a++) {
  for (let b = 0; b < 16; b++) {
    apply(a, b, 0, 1, 0);
    const o = outputs();
    const exp = a > b ? { gt: 1, eq: 0, lt: 0 }
      : a < b ? { gt: 0, eq: 0, lt: 1 }
      : { gt: 0, eq: 1, lt: 0 };
    assert(o.gt === exp.gt && o.eq === exp.eq && o.lt === exp.lt,
      `standalone A=${a} B=${b}: expected [${exp.gt}${exp.eq}${exp.lt}], got [${o.gt}${o.eq}${o.lt}]`);
  }
}

// ── 2. Cascade tie rows (A == B) follow the one asserted cascade line ────────
const A = 9, B = 9; // any equal pair
const tieCases = [
  { gt: 1, eq: 0, lt: 0, exp: { gt: 1, eq: 0, lt: 0 }, label: 'AGTBIN' },
  { gt: 0, eq: 0, lt: 1, exp: { gt: 0, eq: 0, lt: 1 }, label: 'ALTBIN' },
  { gt: 0, eq: 1, lt: 0, exp: { gt: 0, eq: 1, lt: 0 }, label: 'AEQBIN' },
];
for (const c of tieCases) {
  apply(A, B, c.gt, c.eq, c.lt);
  const o = outputs();
  assert(o.gt === c.exp.gt && o.eq === c.exp.eq && o.lt === c.exp.lt,
    `cascade tie (A==B, ${c.label} HIGH): expected [${c.exp.gt}${c.exp.eq}${c.exp.lt}], got [${o.gt}${o.eq}${o.lt}]`);
}

// ── 3. Own bits override the cascade inputs when they differ ─────────────────
// A>B on the data, but the cascade lines say A<B — data must win.
apply(12, 3, 0, 0, 1);
let o = outputs();
assert(o.gt === 1 && o.eq === 0 && o.lt === 0,
  `data override (A=12>B=3, ALTBIN HIGH): expected [100], got [${o.gt}${o.eq}${o.lt}]`);
// A<B on the data, but the cascade lines say A>B — data must win.
apply(3, 12, 1, 0, 0);
o = outputs();
assert(o.gt === 0 && o.eq === 0 && o.lt === 1,
  `data override (A=3<B=12, AGTBIN HIGH): expected [001], got [${o.gt}${o.eq}${o.lt}]`);

console.log(`74x85-magnitude-comparator: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
