// ── 74x368 hex inverting buffer, 3-state, SPLIT enable — regression ──────────
// The 74x368 (Batch 23, js/chips/chips23.js) is primitive-backed: one
// BUFFER_HEX_INV_TRI gate in "splitEnable" mode (inputs [A1..A6, G1n, G2n],
// outputs [Y1..Y6]). This guards the '367A/'368A 4 + 2 SPLIT enable that the
// bare primitive does NOT model by default.
//
// Verified vs TI SDLS102 ('368A logic diagram, read as PDF page images —
// issues.md C4). DIP-16 terminal assignment:
//   1G=1, 1A1=2, 1Y1=3, 1A2=4, 1Y2=5, 1A3=6, 1Y3=7, GND=8,
//   1Y4=9, 1A4=10, 2Y1=11, 2A1=12, 2Y2=13, 2A2=14, 2G=15, VCC=16.
// (The sim names these A1..A6 / Y1..Y6 / G1n / G2n.) Split truth table:
//
//   An  G(governing) | Yn
//    0       0        | 1     ← inverting buffer, output enabled
//    1       0        | 0
//    X       1        | Z     ← disabled → high-impedance
//
// The split the plain 74366 primitive normally serves does NOT capture: G1n
// (active LOW) enables buffers 1-4 (Y1-Y4), G2n (active LOW) enables buffers
// 5-6 (Y5-Y6), INDEPENDENTLY. The 74366 combines both enables over all six.
//
// This test would FAIL against the old combined-enable engine: with G1n=1,
// G2n=0 the old model tri-stated ALL SIX outputs, whereas the real '368A keeps
// Y5-Y6 driving. We confirm each group tri-states on its own by querying
// sim.pinDriveStates directly.
//
// Run:  node js/debug/scenarios/74x368-hex-inv-buffer-split.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x368');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const AINS  = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
const YOUTS = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'];

// Drive A1..A6 (bit0..5), G1n, G2n; re-solve.
function apply(aWord, g1n, g2n) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x368 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 6; i++) wirePin(AINS[i], (aWord >> i) & 1);
  wirePin('G1n', g1n);
  wirePin('G2n', g2n);
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

const GROUP_A = ['Y1', 'Y2', 'Y3', 'Y4']; // enabled by G1n
const GROUP_B = ['Y5', 'Y6'];             // enabled by G2n

// inverted, enabled expected bit for output index i given input word
const expBit = (a, i) => ((a >> i) & 1) ^ 1;

const words = [0b000000, 0b101010, 0b110011, 0b111111, 0b011001, 0b100100];

for (const a of words) {
  const aStr = a.toString(2).padStart(6, '0');

  // ── 1. Both enabled: G1n=0, G2n=0 → Yn = NOT(An), all six driven ───────────
  apply(a, 0, 0);
  for (let i = 0; i < 6; i++) {
    assert(!isHiZ(YOUTS[i]), `G1n=0,G2n=0 A=${aStr}: ${YOUTS[i]} must be driven`);
    assert((isHigh(read(YOUTS[i])) ? 1 : 0) === expBit(a, i),
      `G1n=0,G2n=0 A=${aStr}: ${YOUTS[i]} should be NOT(A${i + 1})`);
  }

  // ── 2. G1n=1 only → Y1-Y4 Hi-Z; Y5-Y6 STILL invert A5/A6 ───────────────────
  //    (the key catch: old combined engine tri-stated all six here)
  apply(a, 1, 0);
  for (const q of GROUP_A) assert(isHiZ(q), `G1n=1: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
  for (const q of GROUP_B) {
    const i = YOUTS.indexOf(q);
    assert(!isHiZ(q), `G1n=1: ${q} (group B) must stay driven — split enable`);
    assert((isHigh(read(q)) ? 1 : 0) === expBit(a, i), `G1n=1: ${q} should still be NOT(A${i + 1})`);
  }

  // ── 3. G2n=1 only → Y5-Y6 Hi-Z; Y1-Y4 STILL invert A1..A4 ──────────────────
  apply(a, 0, 1);
  for (const q of GROUP_B) assert(isHiZ(q), `G2n=1: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
  for (const q of GROUP_A) {
    const i = YOUTS.indexOf(q);
    assert(!isHiZ(q), `G2n=1: ${q} (group A) must stay driven — split enable`);
    assert((isHigh(read(q)) ? 1 : 0) === expBit(a, i), `G2n=1: ${q} should still be NOT(A${i + 1})`);
  }

  // ── 4. Both disabled: G1n=1, G2n=1 → all six Hi-Z ──────────────────────────
  apply(a, 1, 1);
  for (const q of YOUTS) assert(isHiZ(q), `G1n=1,G2n=1: ${q} must be Hi-Z, got drive ${driveOf(q)}`);
}

// ── Physical pin map guard (pin number ↔ name), verified vs TI SDLS102 ───────
const PINMAP = {
  1: 'G1n', 2: 'A1', 3: 'Y1', 4: 'A2', 5: 'Y2', 6: 'A3', 7: 'Y3', 8: 'GND',
  9: 'Y4', 10: 'A4', 11: 'Y5', 12: 'A5', 13: 'Y6', 14: 'A6', 15: 'G2n', 16: 'VCC',
};
for (const [num, name] of Object.entries(PINMAP)) {
  const p = chip.getPinByName(name);
  assert(p && p.pin === Number(num), `pin ${num} should be ${name} (got pin ${p && p.pin})`);
}

console.log(`74x368-hex-inv-buffer-split: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
