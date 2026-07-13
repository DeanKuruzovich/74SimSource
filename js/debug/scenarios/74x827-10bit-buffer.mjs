// ── 74x827 10-bit non-inverting buffer/line driver, 3-state — regression ────
// The 74x827 (js/chips/chips41.js) is primitive-backed: ten TRI_BUFFER_DUAL_OE
// gates (74541-style), one per bit, each fed [Dn, OE0, OE1] → Qn. Both output
// enables are ACTIVE LOW and NOR-combined: the outputs drive only when BOTH OE0
// and OE1 are LOW; raise either one and ALL ten outputs go high-impedance.
//
// Pin map verified vs NXP (Philips) 74F827 data sheet (Rev. 2004 Jan 21),
// PIN CONFIGURATION + FUNCTION TABLE, read as rendered PDF page images:
//   OE0=1, D0..D9=2..11, GND=12, OE1=13, Q9..Q0=14..23, VCC=24.
//
//   OE0 OE1 | Qn
//    0   0  | Dn   ← both enabled → non-inverting pass-through
//    0   1  | Z
//    1   0  | Z
//    1   1  | Z    ← either high → all outputs Hi-Z
//
// Run:  node js/debug/scenarios/74x827-10bit-buffer.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x827');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DINS  = ['D0','D1','D2','D3','D4','D5','D6','D7','D8','D9'];
const QOUTS = ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'];

// Drive D0..D9 (10-bit word), OE0, OE1; re-solve.
function apply(word, oe0, oe1) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x827 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 10; i++) wirePin(DINS[i], (word >> i) & 1);
  wirePin('OE0', oe0);
  wirePin('OE1', oe1);
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

// A spread of 10-bit test words including all-0, all-1, and mixed patterns.
const words = [0x000, 0x3FF, 0x2AA, 0x155, 0x199, 0x2CC, 0x201, 0x180];

for (const d of words) {
  const dStr = d.toString(2).padStart(10, '0');

  // ── 1. Both enabled: OE0=0, OE1=0 → Q = D (pass-through), all driven ────────
  apply(d, 0, 0);
  assert(readWord() === d,
    `OE0=0,OE1=0 D=${dStr}: expected Q=${dStr}, got ${readWord().toString(2).padStart(10, '0')}`);
  for (const q of QOUTS) assert(!isHiZ(q), `OE0=0,OE1=0: ${q} must be driven, not Hi-Z`);

  // ── 2. OE0=1 only → all ten outputs Hi-Z ───────────────────────────────────
  apply(d, 1, 0);
  for (const q of QOUTS) assert(isHiZ(q), `OE0=1,OE1=0 D=${dStr}: ${q} must be Hi-Z, got drive ${driveOf(q)}`);

  // ── 3. OE1=1 only → all ten outputs Hi-Z ───────────────────────────────────
  apply(d, 0, 1);
  for (const q of QOUTS) assert(isHiZ(q), `OE0=0,OE1=1 D=${dStr}: ${q} must be Hi-Z, got drive ${driveOf(q)}`);

  // ── 4. Both disabled: OE0=1, OE1=1 → all ten Hi-Z ──────────────────────────
  apply(d, 1, 1);
  for (const q of QOUTS) assert(isHiZ(q), `OE0=1,OE1=1 D=${dStr}: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
}

console.log(`74x827-10bit-buffer: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
