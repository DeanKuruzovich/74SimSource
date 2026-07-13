// ── CD4503 hex non-inverting buffer, 3-state, split disable — regression ─────
// The CD4503 (Batch 3, js/chips/chips108.js) is primitive-backed: one
// BUFFER_HEX_TRI gate in "splitDisable" mode (inputs [D1..D6, DIS A, DIS B],
// outputs [Q1..Q6]). It guards both the chip's DB pin map (verified vs TI
// CD4503B SCHS068C Functional Diagram + Terminal Assignment:
// DIS A=1,D1=2,D2=3,D3=4,Q1=5,Q2=6,Q3=7,VSS=8,Q4=9,D4=10,Q5=11,D5=12,Q6=13,
// D6=14,DIS B=15,VDD=16) and the split-disable truth table:
//
//   Dn DIS(governing) | Qn
//    0       0         | 0     ← non-inverting buffer (pass-through)
//    1       0         | 1
//    X       1         | Z     ← disabled → high-impedance
//
// The CD4503 difference vs the bare 74365 the primitive normally serves: the
// two disables are ACTIVE HIGH and split the six buffers into TWO independent
// groups — DIS A controls buffers 1-4 (Q1-Q4), DIS B controls buffers 5-6
// (Q5-Q6). We confirm each group disables independently (Hi-Z) by querying
// sim.pinDriveStates directly.
//
// Run:  node js/debug/scenarios/cd4503-hex-buffer.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4503');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DINS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
const QOUTS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];

// Drive D1..D6 (data nibble bit0..5), DIS A, DIS B; re-solve.
function apply(dWord, disA, disB) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4503 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (let i = 0; i < 6; i++) wirePin(DINS[i], (dWord >> i) & 1);
  wirePin('DIS A', disA);
  wirePin('DIS B', disB);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readWord = () => QOUTS.reduce((acc, o, i) => acc | (isHigh(read(o)) ? (1 << i) : 0), 0);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const GROUP_A = ['Q1', 'Q2', 'Q3', 'Q4']; // disabled by DIS A
const GROUP_B = ['Q5', 'Q6'];             // disabled by DIS B

const words = [0b000000, 0b101010, 0b110011, 0b111111, 0b011001, 0b100100];

for (const d of words) {
  const dStr = d.toString(2).padStart(6, '0');

  // ── 1. Both enabled: DIS A=0, DIS B=0 → Q = D (pass-through), all driven ────
  apply(d, 0, 0);
  assert(readWord() === d,
    `DIS A=0,DIS B=0 D=${dStr}: expected Q=${dStr}, got ${readWord().toString(2).padStart(6, '0')}`);
  for (const q of QOUTS) assert(!isHiZ(q), `DIS A=0,DIS B=0: ${q} must be driven, not Hi-Z`);

  // ── 2. DIS A=1 only → Q1-Q4 Hi-Z; Q5-Q6 still pass D5/D6 ───────────────────
  apply(d, 1, 0);
  for (const q of GROUP_A) assert(isHiZ(q), `DIS A=1: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
  for (const q of GROUP_B) {
    const i = QOUTS.indexOf(q);
    assert(!isHiZ(q), `DIS A=1: ${q} (group B) must stay driven`);
    assert((isHigh(read(q)) ? 1 : 0) === ((d >> i) & 1), `DIS A=1: ${q} should still equal D${i + 1}`);
  }

  // ── 3. DIS B=1 only → Q5-Q6 Hi-Z; Q1-Q4 still pass D1..D4 ──────────────────
  apply(d, 0, 1);
  for (const q of GROUP_B) assert(isHiZ(q), `DIS B=1: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
  for (const q of GROUP_A) {
    const i = QOUTS.indexOf(q);
    assert(!isHiZ(q), `DIS B=1: ${q} (group A) must stay driven`);
    assert((isHigh(read(q)) ? 1 : 0) === ((d >> i) & 1), `DIS B=1: ${q} should still equal D${i + 1}`);
  }

  // ── 4. Both disabled: DIS A=1, DIS B=1 → all six Hi-Z ──────────────────────
  apply(d, 1, 1);
  for (const q of QOUTS) assert(isHiZ(q), `DIS A=1,DIS B=1: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
}

console.log(`cd4503-hex-buffer: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
