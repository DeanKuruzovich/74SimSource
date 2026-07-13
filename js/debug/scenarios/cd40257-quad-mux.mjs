// ── CD40257 quad 2-to-1 data selector/mux, 3-state — regression ─────────────
// The CD40257 (js/chips/chips139.js) is primitive-backed: four MUX_2TO1_TRI
// gates (inputs [An, Bn, SEL, OD], output Dn) sharing the single SEL (INPUT
// SELECT) and OD (OUTPUT DISABLE) pins. It guards the chip's DB pin map
// (verified vs TI CD40257B SCHS108C Terminal Assignment + Functional Diagram +
// Truth Table:
//   SEL=1 A1=2 B1=3 D1=4 A2=5 B2=6 D2=7 VSS=8 D3=9 B3=10 A3=11 D4=12 B4=13
//   A4=14 OD=15 VDD=16)
// and the truth table (one OUTPUT DISABLE + one SELECT feed all four sections):
//
//   OUTPUT DISABLE (OD) | SELECT | Dn
//          1            |   X    | Z   (high impedance, all four)
//          0            |   0    | An  (non-inverting)
//          0            |   1    | Bn  (non-inverting)
//
// Key subtleties: SELECT and OD are common to all four sections; OD is an
// ACTIVE-HIGH disable (HIGH → Hi-Z, the active-high-disable view of the 74257's
// active-low output enable). No clock / no storage (the clocked sibling is the
// 74298 = MUX_QUAD_2TO1_STORED).
//
// Run:  node js/debug/scenarios/cd40257-quad-mux.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40257');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A = ['A1', 'A2', 'A3', 'A4'];
const B = ['B1', 'B2', 'B3', 'B4'];
const D = ['D1', 'D2', 'D3', 'D4'];

// Drive the four A and four B bits (a 4-bit word each), SELECT, OD; solve.
function apply(aWord, bWord, sel, od) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40257 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(A[i], (aWord >> i) & 1);
    wirePin(B[i], (bWord >> i) & 1);
  }
  wirePin('SEL', sel);
  wirePin('OD', od);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const outBit = (name) => isHigh(read(name)) ? 1 : 0;
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. SELECT=0 → every Dn follows its An; SELECT=1 → every Dn follows its Bn ─
// Use distinct A and B words so a stuck/crossed section shows up. Also test the
// complement words to confirm each section is independently routed.
for (const [aWord, bWord] of [[0b1010, 0b0101], [0b0101, 0b1010], [0b1111, 0b0000], [0b0000, 0b1111], [0b1100, 0b0011]]) {
  // SELECT=0 → A path
  apply(aWord, bWord, 0, 0);
  for (let i = 0; i < 4; i++) {
    const expect = (aWord >> i) & 1;
    assert(outBit(D[i]) === expect,
      `SEL=0 A=${aWord.toString(2).padStart(4,'0')} B=${bWord.toString(2).padStart(4,'0')} ${D[i]}: expected A=${expect}, got ${outBit(D[i])}`);
    assert(!isHiZ(D[i]), `SEL=0 ${D[i]}: output must be driven, not Hi-Z`);
  }
  // SELECT=1 → B path
  apply(aWord, bWord, 1, 0);
  for (let i = 0; i < 4; i++) {
    const expect = (bWord >> i) & 1;
    assert(outBit(D[i]) === expect,
      `SEL=1 A=${aWord.toString(2).padStart(4,'0')} B=${bWord.toString(2).padStart(4,'0')} ${D[i]}: expected B=${expect}, got ${outBit(D[i])}`);
    assert(!isHiZ(D[i]), `SEL=1 ${D[i]}: output must be driven, not Hi-Z`);
  }
}

// ── 2. OUTPUT DISABLE=1 → all four outputs Hi-Z, regardless of SELECT/data ───
for (const sel of [0, 1]) {
  apply(0b1111, 0b0000, sel, 1); // drive data so a non-disabled mux would show 1s/0s
  for (let i = 0; i < 4; i++) {
    assert(isHiZ(D[i]), `OD=1 SEL=${sel} ${D[i]}: must be Hi-Z`);
  }
}

// ── 3. After re-enabling, outputs drive again (no latched state) ─────────────
apply(0b0110, 0b1001, 0, 0);
for (let i = 0; i < 4; i++) {
  assert(outBit(D[i]) === ((0b0110 >> i) & 1), `re-enable ${D[i]}: expected A bit, got ${outBit(D[i])}`);
  assert(!isHiZ(D[i]), `re-enable ${D[i]}: must drive again`);
}

if (failures.length) {
  console.error(`CD40257 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD40257 quad-mux: all checks passed');
