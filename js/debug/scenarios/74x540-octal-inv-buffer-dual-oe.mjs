// ── 74x540 octal INVERTING buffer/line driver, 3-state, DUAL enable — regression ─
// The 74x540 (js/chips/chips30.js) is primitive-backed by ONE BUF_OCTAL_INV_TRI
// gate: inputs [OE1, OE2, A1..A8], outputs [Y1..Y8], Yn = NOT(An).
//
// Verified against Texas Instruments "SN54ALS541, SN74ALS540, SN74ALS541 Octal
// Buffers and Line Drivers With 3-State Outputs", SDAS025D (Apr. 1982, rev. Mar.
// 2002): 20-pin terminal assignment (TOP VIEW, p.1), SN74ALS540 logic diagram +
// the "3-state control gate is a 2-input NOR" description (p.2), read as rendered
// PDF page images (issues.md C4). DIP-20 terminal assignment:
//   OE1=1, A1=2, A2=3, A3=4, A4=5, A5=6, A6=7, A7=8, A8=9, GND=10,
//   Y8=11, Y7=12, Y6=13, Y5=14, Y4=15, Y3=16, Y2=17, Y1=18, OE2=19, VCC=20.
//
// This guards TWO things the prior hand-entered entry got wrong (issues.md C108):
//   1. There are TWO active-low enables (OE1 pin 1, OE2 pin 19). The old entry
//      marked pin 19 as NC and modeled a single enable — so OE2 was ignored.
//   2. NO Schmitt inputs (irrelevant to logic, but the old entry claimed them).
//
// 3-state control = 2-input NOR: outputs drive ONLY when BOTH OE1 and OE2 are
// LOW; if EITHER is HIGH all eight outputs are high impedance. Inverting:
//
//   OE1 OE2 An | Yn
//    0   0   0 | 1     ← enabled, Yn = NOT(An)
//    0   0   1 | 0
//    1   X   X | Z     ← either enable HIGH → high impedance
//    X   1   X | Z
//
// This test FAILS against the old single-enable engine + NC-at-19 pinout: with
// OE1=0 and OE2=1 the old model still drove all eight outputs (OE2 unconnected).
//
// Run:  node js/debug/scenarios/74x540-octal-inv-buffer-dual-oe.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x540');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const AINS  = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];
const YOUTS = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8'];

// Drive A1..A8 (bit0..7), OE1, OE2; re-solve.
function apply(aWord, oe1, oe2) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x540 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 8; i++) wirePin(AINS[i], (aWord >> i) & 1);
  wirePin('OE1', oe1);
  wirePin('OE2', oe2);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// inverted, enabled expected bit for output index i given input word
const expBit = (a, i) => ((a >> i) & 1) ^ 1;

const words = [0b00000000, 0b10101010, 0b11001100, 0b11111111, 0b01100110, 0b10010011];

for (const a of words) {
  const aStr = a.toString(2).padStart(8, '0');

  // ── 1. Both enabled: OE1=0, OE2=0 → Yn = NOT(An), all eight driven ──────────
  apply(a, 0, 0);
  for (let i = 0; i < 8; i++) {
    assert(!isHiZ(YOUTS[i]), `OE1=0,OE2=0 A=${aStr}: ${YOUTS[i]} must be driven`);
    assert((isHigh(read(YOUTS[i])) ? 1 : 0) === expBit(a, i),
      `OE1=0,OE2=0 A=${aStr}: ${YOUTS[i]} should be NOT(A${i + 1})`);
  }

  // ── 2. OE1 HIGH alone → all eight Hi-Z (the key catch for the OE2-only bug) ─
  apply(a, 1, 0);
  for (const q of YOUTS) assert(isHiZ(q), `OE1=1,OE2=0 A=${aStr}: ${q} must be Hi-Z, got drive ${driveOf(q)}`);

  // ── 3. OE2 HIGH alone → all eight Hi-Z (old engine ignored OE2 and drove!) ──
  apply(a, 0, 1);
  for (const q of YOUTS) assert(isHiZ(q), `OE1=0,OE2=1 A=${aStr}: ${q} must be Hi-Z, got drive ${driveOf(q)}`);

  // ── 4. Both HIGH → all eight Hi-Z ──────────────────────────────────────────
  apply(a, 1, 1);
  for (const q of YOUTS) assert(isHiZ(q), `OE1=1,OE2=1 A=${aStr}: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
}

// ── Physical pin map guard (pin number ↔ name), verified vs TI SDAS025D p.1 ───
const PINMAP = {
  1: 'OE1', 2: 'A1', 3: 'A2', 4: 'A3', 5: 'A4', 6: 'A5', 7: 'A6', 8: 'A7',
  9: 'A8', 10: 'GND', 11: 'Y8', 12: 'Y7', 13: 'Y6', 14: 'Y5', 15: 'Y4',
  16: 'Y3', 17: 'Y2', 18: 'Y1', 19: 'OE2', 20: 'VCC',
};
for (const [num, name] of Object.entries(PINMAP)) {
  const p = chip.getPinByName(name);
  assert(p && p.pin === Number(num), `pin ${num} should be ${name} (got pin ${p && p.pin})`);
}

console.log(`74x540-octal-inv-buffer-dual-oe: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
