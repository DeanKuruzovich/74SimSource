// ── 74x257 quad 2-to-1 data selector/mux, 3-state (non-inverting) — regression ─
// The 74x257 (js/chips/chips6.js) is primitive-backed: four MUX_2TO1_TRI gates
// (inputs [nA, nB, SEL, OE], output nY) sharing the single SEL (SELECT) and OE
// (OUTPUT ENABLE, active LOW) pins. Guards the DIP-16 pin map and truth table,
// verified vs TI SDLS148 (SN74LS257B, terminal assignment TOP VIEW + FUNCTION
// TABLE '257 column, page 1, read as rendered PDF page images — issues.md C4):
//   SEL=1 1A=2 1B=3 1Y=4 2A=5 2B=6 2Y=7 GND=8 3Y=9 3B=10 3A=11 4Y=12 4B=13
//   4A=14 OE=15 VCC=16
// Function table (one OE + one SEL feed all four sections):
//
//   OUTPUT ENABLE OE# | SELECT | nY
//          1          |   X    | Z   (high impedance, all four)
//          0          |   0    | nA  (true / non-inverting)
//          0          |   1    | nB  (true / non-inverting)
//
// Key subtleties, and the reason this part is NOT the 74x157: the disabled
// output is HIGH-IMPEDANCE, not a driven LOW — that is what lets several 257
// outputs share one bus. SELECT and OE are common to all four sections; SELECT
// LOW picks A, HIGH picks B; OE is an active-LOW output enable. The inverting
// twin is the 74x258.
//
// Run:  node js/debug/scenarios/74x257-quad-mux-tri.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x257');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A = ['1A', '2A', '3A', '4A'];
const B = ['1B', '2B', '3B', '4B'];
const Y = ['1Y', '2Y', '3Y', '4Y'];

// Drive the four A and four B bits (a 4-bit word each), SELECT, OE; solve.
function apply(aWord, bWord, sel, oe) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x257 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(A[i], (aWord >> i) & 1);
    wirePin(B[i], (bWord >> i) & 1);
  }
  wirePin('SEL', sel);
  wirePin('OE', oe);
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

// ── 1. OE#=0: SEL=0 → every nY follows nA; SEL=1 → every nY follows nB ────────
// Distinct A and B words so a stuck/crossed section shows up; also the
// complement words to confirm each section is independently routed.
for (const [aWord, bWord] of [[0b1010, 0b0101], [0b0101, 0b1010], [0b1111, 0b0000], [0b0000, 0b1111], [0b1100, 0b0011]]) {
  apply(aWord, bWord, 0, 0); // SELECT=0 → A path
  for (let i = 0; i < 4; i++) {
    const expect = (aWord >> i) & 1;
    assert(outBit(Y[i]) === expect,
      `SEL=0 A=${aWord.toString(2).padStart(4,'0')} B=${bWord.toString(2).padStart(4,'0')} ${Y[i]}: expected A=${expect}, got ${outBit(Y[i])}`);
    assert(!isHiZ(Y[i]), `SEL=0 ${Y[i]}: output must be driven, not Hi-Z`);
  }
  apply(aWord, bWord, 1, 0); // SELECT=1 → B path
  for (let i = 0; i < 4; i++) {
    const expect = (bWord >> i) & 1;
    assert(outBit(Y[i]) === expect,
      `SEL=1 A=${aWord.toString(2).padStart(4,'0')} B=${bWord.toString(2).padStart(4,'0')} ${Y[i]}: expected B=${expect}, got ${outBit(Y[i])}`);
    assert(!isHiZ(Y[i]), `SEL=1 ${Y[i]}: output must be driven, not Hi-Z`);
  }
}

// ── 2. OUTPUT ENABLE OE#=1 → all four outputs Hi-Z (NOT driven LOW) ──────────
// This is the whole point of the 257 vs the 157; drive data both ways so a
// non-disabled mux would clearly show 1s/0s.
for (const sel of [0, 1]) {
  apply(0b1111, 0b0000, sel, 1);
  for (let i = 0; i < 4; i++) {
    assert(isHiZ(Y[i]), `OE#=1 SEL=${sel} ${Y[i]}: must be Hi-Z (high impedance)`);
  }
}

// ── 3. After re-enabling, outputs drive data again (no latched state) ────────
apply(0b0110, 0b1001, 1, 0);
for (let i = 0; i < 4; i++) {
  assert(outBit(Y[i]) === ((0b1001 >> i) & 1), `re-enable ${Y[i]}: expected B bit, got ${outBit(Y[i])}`);
  assert(!isHiZ(Y[i]), `re-enable ${Y[i]}: must drive again`);
}

if (failures.length) {
  console.error(`74x257 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x257 quad-mux-tri: all checks passed');
