// ── 74x994 — 10-bit transparent D-type READ-BACK latch (3-state I/O) — regression
// The 74x994 (js/chips/chips46.js) is ten TRANSPARENT D-type latches with a
// common latch-enable (LE). It is NOT the 74x841 pattern:
//   - the ten Q outputs are TRUE LOGIC OUTPUTS — they always drive, never Hi-Z;
//   - pin 1 is OERB (Output-Enable Read-Back, active LOW), NOT a Q output enable.
//     When OERB is LOW the stored word is driven BACK onto the D pins so a CPU can
//     read the held value off the same data bus it captured from. When OERB is
//     HIGH the D pins are ordinary inputs.
// It rides the width-agnostic LATCH_READBACK_TRI primitive.
//
// LATCH_READBACK_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D9, LE, OERB]                     (D pins bidir, OERB active LOW)
//   outputs: [Q0..Q9, D0..D9]                       (Q always driven; D driven only
//                                                     during read-back)
//   LE=1   → transparent, Q follows D
//   LE=0   → latched, Q holds the last value
//   OERB=0 → drive stored word onto D pins; OERB=1 → D pins Hi-Z (inputs)
//
// Pinout + function verified against TI SN74ALS994 (SDAS237A, rev. Jan 1995)
// TOP-VIEW terminal diagram + description + logic diagram, read as PDF page
// images: OERB=1, 1D..10D=2..11, GND=12, LE=13, 10Q..1Q=14..23, VCC=24.
// D0/Q0 = bit 0 = pin 2 / pin 23.
//
// Checks:
//   1. LE HIGH is transparent: Q follows D as D changes (level, not edge).
//   2. LE HIGH→LOW captures the current word; changing D while LE=0 holds Q.
//   3. Q outputs are ALWAYS driven (never Hi-Z), independent of OERB.
//   4. Read-back: with LE=0 (latched) and OERB=0, and NO external drive on the D
//      pins, the D pins read back the stored word.
//   5. OERB HIGH releases the D pins (read-back off) — they are not held HIGH.
//   6. OERB does not disturb the stored word: pulse OERB and the held word stays.
//
// Run:  node js/debug/scenarios/74x994-readback-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x994');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with the control pins and any listed D bits held at a rail level.
// D bits NOT listed in `driveD` are left floating so the chip can drive them
// (that is how read-back is observed). Latch state persists on the chip object.
function apply(le, oerb, driveD /* {i: bit} or null for none */) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x994 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('LE',   le   ? 1 : 0);
  wirePin('OERB', oerb ? 1 : 0);
  if (driveD) for (const [i, bit] of Object.entries(driveD)) wirePin(`D${i}`, bit);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const bitsOf = (prefix) => {
  let v = 0;
  for (let i = 0; i < 10; i++) if (isHigh(read(`${prefix}${i}`))) v |= (1 << i);
  return v;
};
const allD = (word) => {
  const o = {};
  for (let i = 0; i < 10; i++) o[i] = (word >> i) & 1;
  return o;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const b10 = (n) => n.toString(2).padStart(10, '0');

// ── 1. LE HIGH is transparent: Q tracks D as it changes ──────────────────────
apply(1, 1, allD(0b1010110010));
assert(bitsOf('Q') === 0b1010110010, `transparent: got ${b10(bitsOf('Q'))}`);
apply(1, 1, allD(0b0101001101));
assert(bitsOf('Q') === 0b0101001101, `transparent tracks new D: got ${b10(bitsOf('Q'))}`);

// ── 2. LE HIGH→LOW captures; changing D while latched holds Q ────────────────
apply(0, 1, allD(0b0101001101));   // capture current word, then hold
const held = bitsOf('Q');
assert(held === 0b0101001101, `capture on LE fall: got ${b10(held)}`);
apply(0, 1, allD(0b1111111111));   // change data while latched → must hold
assert(bitsOf('Q') === held, `latched hold: want ${b10(held)}, got ${b10(bitsOf('Q'))}`);

// ── 3. Q outputs are ALWAYS driven, even with OERB HIGH ──────────────────────
for (let i = 0; i < 10; i++) {
  assert(driveOf(`Q${i}`) !== DRIVE.HIGH_Z, `Q${i} must always drive (not Hi-Z)`);
}

// ── 4. Read-back: LE=0, OERB=0, no external D drive → D pins show stored word ─
// Load a fresh word first (transparent), latch it, then read it back.
apply(1, 1, allD(0b1100110011));   // transparent load
apply(0, 1, allD(0b1100110011));   // latch it
apply(0, 0, null);                 // OERB LOW, release D bus → read-back drives D
assert(bitsOf('D') === 0b1100110011, `read-back on D: want ${b10(0b1100110011)}, got ${b10(bitsOf('D'))}`);
for (let i = 0; i < 10; i++) {
  assert(driveOf(`D${i}`) !== DRIVE.HIGH_Z, `read-back: D${i} should be driven`);
}

// ── 5. OERB HIGH releases the D pins (read-back off) ─────────────────────────
apply(0, 1, null);                 // OERB HIGH, nothing external → D released
for (let i = 0; i < 10; i++) {
  assert(driveOf(`D${i}`) === DRIVE.HIGH_Z, `OERB high: D${i} should be Hi-Z`);
}

// ── 6. OERB pulse does not disturb the stored word ───────────────────────────
apply(0, 0, null);                 // read-back on
apply(0, 1, null);                 // read-back off
assert(bitsOf('Q') === 0b1100110011, `OERB pulse kept Q: got ${b10(bitsOf('Q'))}`);

console.log(`74x994-readback-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
