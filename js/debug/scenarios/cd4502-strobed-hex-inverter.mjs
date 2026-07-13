// ── CD4502 strobed hex inverter/buffer, 3-state — regression ─────────────────
// The CD4502 (Batch 3, js/chips/chips107.js) is primitive-backed: one
// BUFFER_HEX_INV_TRI gate in "strobedInhibit" mode (inputs [D1..D6, OUTPUT
// DISABLE, INHIBIT], outputs [Q1..Q6]). It guards both the chip's DB pin map
// (verified vs TI CD4502B SCHS067B Functional Diagram + Terminal Assignment:
// D3=1,Q3=2,D1=3,DISABLE=4,Q1=5,D2=6,Q2=7,VSS=8,Q4=9,D4=10,Q5=11,INHIBIT=12,
// D5=13,Q6=14,D6=15,VDD=16) and the three-way truth table:
//
//   DISABLE INHIBIT Dn | Qn
//      0       0     0 |  1      ← inverting buffer
//      0       0     1 |  0
//      0       1     X |  0      ← INHIBIT forces LOW (actively DRIVEN, not Hi-Z)
//      1       X     X |  Z      ← OUTPUT DISABLE → high-impedance
//
// The key subtlety the bare 74366 tri-state primitive cannot express: INHIBIT
// drives the outputs LOW (push-pull 0), whereas OUTPUT DISABLE releases them to
// Hi-Z. We distinguish the two by querying sim.pinDriveStates directly.
//
// Run:  node js/debug/scenarios/cd4502-strobed-hex-inverter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4502');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DINS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
const QOUTS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];

// Drive D1..D6 (data nibble bit0..5), OUTPUT DISABLE, INHIBIT; re-solve.
function apply(dWord, disable, inhibit) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4502 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (let i = 0; i < 6; i++) wirePin(DINS[i], (dWord >> i) & 1);
  wirePin('OUTPUT DISABLE', disable);
  wirePin('INHIBIT', inhibit);
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

// 6-bit mask: full inversion of a 6-bit word.
const inv6 = (w) => (~w) & 0x3f;

const words = [0b000000, 0b101010, 0b110011, 0b111111, 0b011001, 0b100100];

for (const d of words) {
  // ── 1. Normal inverting buffer: DISABLE=0, INHIBIT=0 → Q = NOT(D) ──────────
  apply(d, 0, 0);
  assert(readWord() === inv6(d),
    `DISABLE=0,INHIBIT=0 D=${d.toString(2).padStart(6, '0')}: expected Q=${inv6(d).toString(2).padStart(6, '0')}, got ${readWord().toString(2).padStart(6, '0')}`);
  // every output actively driven (push-pull), none Hi-Z
  for (const q of QOUTS) assert(!isHiZ(q), `DISABLE=0,INHIBIT=0: ${q} must be driven, not Hi-Z`);

  // ── 2. INHIBIT=1 (DISABLE=0) → all outputs LOW, but DRIVEN (not Hi-Z) ──────
  apply(d, 0, 1);
  assert(readWord() === 0,
    `INHIBIT=1 D=${d.toString(2).padStart(6, '0')}: expected Q=000000, got ${readWord().toString(2).padStart(6, '0')}`);
  for (const q of QOUTS) {
    assert(!isHigh(read(q)), `INHIBIT=1: ${q} must be LOW`);
    assert(!isHiZ(q), `INHIBIT=1: ${q} must be actively DRIVEN LOW, not Hi-Z (got drive ${driveOf(q)})`);
    assert(driveOf(q) === DRIVE.PUSH_PULL, `INHIBIT=1: ${q} drive should be push_pull LOW, got ${driveOf(q)}`);
  }

  // ── 3. OUTPUT DISABLE=1 → all outputs Hi-Z (regardless of INHIBIT/data) ────
  apply(d, 1, 0);
  for (const q of QOUTS) assert(isHiZ(q), `DISABLE=1: ${q} must be Hi-Z, got drive ${driveOf(q)}`);

  // ── 4. DISABLE dominates INHIBIT: DISABLE=1, INHIBIT=1 → still Hi-Z ────────
  apply(d, 1, 1);
  for (const q of QOUTS) assert(isHiZ(q), `DISABLE=1,INHIBIT=1: ${q} must be Hi-Z (DISABLE dominates), got drive ${driveOf(q)}`);
}

console.log(`cd4502-strobed-hex-inverter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
