// ── 74x157 quad 2-to-1 data selector/mux (non-inverting) — regression ───────
// The 74x157 (js/chips/chips5.js) is primitive-backed: four MUX_2TO1 gates
// (inputs [nA, nB, S, En], output nY) sharing the single S (SELECT) and En
// (STROBE, active LOW) pins. Guards the DIP-16 pin map and truth table,
// verified vs TI SDLS058 (SN74LS157, Terminal Assignment N package + Function
// Table, page 1, read as rendered PDF page images — issues.md C4):
//   S=1 1A=2 1B=3 1Y=4 2A=5 2B=6 2Y=7 GND=8 3Y=9 3B=10 3A=11 4Y=12 4B=13
//   4A=14 En=15 VCC=16
// Function table (one STROBE + one SELECT feed all four sections):
//
//   STROBE En# | SELECT S | nY
//        1     |    X     | 0   (all four forced LOW)
//        0     |    0     | nA  (true / non-inverting)
//        0     |    1     | nB  (true / non-inverting)
//
// Key subtleties, and the reason this part is NOT the CD40257/74x257: the
// disabled output is a driven LOW, not high impedance — you cannot bus two
// 157 outputs together. SELECT and STROBE are common to all four sections;
// SELECT LOW picks A, HIGH picks B; STROBE is an active-LOW enable.
//
// Run:  node js/debug/scenarios/74x157-quad-mux.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x157');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A = ['1A', '2A', '3A', '4A'];
const B = ['1B', '2B', '3B', '4B'];
const Y = ['1Y', '2Y', '3Y', '4Y'];

// Drive the four A and four B bits (a 4-bit word each), SELECT S, STROBE En; solve.
function apply(aWord, bWord, s, en) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x157 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(A[i], (aWord >> i) & 1);
    wirePin(B[i], (bWord >> i) & 1);
  }
  wirePin('S', s);
  wirePin('En', en);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const outBit = (name) => isHigh(read(name)) ? 1 : 0;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. En#=0: S=0 → every nY follows nA; S=1 → every nY follows nB ───────────
// Distinct A and B words so a stuck/crossed section shows up; also the
// complement words to confirm each section is independently routed.
for (const [aWord, bWord] of [[0b1010, 0b0101], [0b0101, 0b1010], [0b1111, 0b0000], [0b0000, 0b1111], [0b1100, 0b0011]]) {
  apply(aWord, bWord, 0, 0); // SELECT=0 → A path
  for (let i = 0; i < 4; i++) {
    const expect = (aWord >> i) & 1;
    assert(outBit(Y[i]) === expect,
      `S=0 A=${aWord.toString(2).padStart(4,'0')} B=${bWord.toString(2).padStart(4,'0')} ${Y[i]}: expected A=${expect}, got ${outBit(Y[i])}`);
  }
  apply(aWord, bWord, 1, 0); // SELECT=1 → B path
  for (let i = 0; i < 4; i++) {
    const expect = (bWord >> i) & 1;
    assert(outBit(Y[i]) === expect,
      `S=1 A=${aWord.toString(2).padStart(4,'0')} B=${bWord.toString(2).padStart(4,'0')} ${Y[i]}: expected B=${expect}, got ${outBit(Y[i])}`);
  }
}

// ── 2. STROBE En#=1 → all four outputs LOW (driven, NOT Hi-Z), any SELECT/data ─
for (const s of [0, 1]) {
  apply(0b1111, 0b1111, s, 1); // drive all data HIGH so an enabled mux would read 1s
  for (let i = 0; i < 4; i++) {
    assert(outBit(Y[i]) === 0, `En#=1 S=${s} ${Y[i]}: must be forced LOW, got ${outBit(Y[i])}`);
  }
}

// ── 3. After re-enabling, outputs follow data again (no latched state) ────────
apply(0b0110, 0b1001, 1, 0);
for (let i = 0; i < 4; i++) {
  assert(outBit(Y[i]) === ((0b1001 >> i) & 1), `re-enable ${Y[i]}: expected B bit, got ${outBit(Y[i])}`);
}

if (failures.length) {
  console.error(`74x157 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x157 quad-mux: all checks passed');
