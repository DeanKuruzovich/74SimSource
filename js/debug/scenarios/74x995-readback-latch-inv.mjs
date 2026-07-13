// ── 74x995 10-bit inverting transparent read-back latch — regression ─────────
// The 74x995 (js/chips/chips46.js) is the inverting member of the SN74ALS99x
// read-back latch family. It is a LEVEL-sensitive transparent latch: while the
// latch enable (LE) is HIGH the outputs continuously follow the inputs; when LE
// goes LOW the ten bits are held. The '995 inverts, so Q = NOT (stored bit).
//
// Unlike a 373-style latch, this part has NO output-enable on its Q pins — the
// ten Q0n..Q9n outputs are TRUE LOGIC and ALWAYS driven. The single 3-state
// control is OERB (read-back enable, active LOW): OERB LOW drives the stored word
// back onto the bidirectional D0..D9 bus; OERB HIGH releases the D pins (Hi-Z) so
// they act as data inputs. Read-back presents the stored (NON-inverted) word.
//
// LATCH_10BIT_READBACK_INV contract (js/specificChipsSim.js):
//   inputs:  [OERB, D0..D9, LE]
//   outputs: [Q0n..Q9n, D0..D9]   (Q outputs + read-back drivers on the D bus)
//   LE=1 → transparent (internal latch follows D); LE=0 → hold.
//   Q0n..Q9n = NOT stored, always driven.
//   OERB=0 → D0..D9 driven with the stored (true) word; OERB=1 → D0..D9 Hi-Z.
//
// Pinout + architecture verified against the SN74ALS990/992 read-back-latch family
// datasheets (the '995-specific sheet is obsolete/unpublished; see the chip entry
// header comment): OERB=1, D0..D9=2..11, GND=12, LE=13, Q9n..Q0n=14..23, VCC=24.
//
// Checks:
//   1. Transparent capture is INVERTING (Q = complement of D) while LE HIGH.
//   2. Pure inversion at the rails (zeros→all-ones Q, ones→all-zeros Q).
//   3. Transparency: D changes flow to Q while LE stays HIGH.
//   4. LE LOW freezes the word; later D changes are ignored until LE returns HIGH.
//   5. Q outputs are ALWAYS driven — never Hi-Z, regardless of OERB.
//   6. Read-back: OERB LOW drives the stored (NON-inverted) word onto D0..D9;
//      OERB HIGH releases them (Hi-Z). Read-back does not disturb the stored word.
//
// Run:  node js/debug/scenarios/74x995-readback-latch-inv.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x995');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every control pin held at a rail level. The D pins are only wired
// to rails when st.driveD is true; during read-back we leave them floating so the
// chip itself drives them and we can observe the read-back word.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x995 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('LE', st.le ? 1 : 0);
  wirePin('OERB', st.oerb ? 1 : 0);
  if (st.driveD) for (let i = 0; i < 10; i++) wirePin(`D${i}`, (st.d >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 10; i++) if (isHigh(read(`Q${i}n`))) v |= (1 << i);
  return v;
};
const dbits = () => {
  let v = 0;
  for (let i = 0; i < 10; i++) if (isHigh(read(`D${i}`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const MASK = 0x3FF; // 10 bits
const inv = (n) => (~n) & MASK;
const b10 = (n) => n.toString(2).padStart(10, '0');

// Default picture: OERB HIGH (read-back off, D are inputs), D wired to rails.
const st = { le: 0, oerb: 1, d: 0, driveD: true };
const solve = () => apply(st);

// Transparent load: raise LE, present D — Q follows NOT D — then drop LE to hold.
function load(word) {
  st.d = word; st.driveD = true; st.oerb = 1;
  st.le = 1; solve();   // transparent → Q = NOT D
  st.le = 0; solve();   // latch closes → word held
}

// ── 1. Transparent capture is INVERTING ──────────────────────────────────────
load(0b1010110010);
assert(qbits() === inv(0b1010110010), `inv load: got ${b10(qbits())}, want ${b10(inv(0b1010110010))}`);

// ── 2. Pure inversion at the rails ───────────────────────────────────────────
load(0b0000000000);
assert(qbits() === MASK, `zeros → all Q high, got ${b10(qbits())}`);
load(0b1111111111);
assert(qbits() === 0, `ones → all Q low, got ${b10(qbits())}`);

// ── 3. Transparency: D changes flow to Q WHILE LE stays HIGH ──────────────────
st.le = 1; st.d = 0b1010110010; solve();
assert(qbits() === inv(0b1010110010), `LE high, first word: got ${b10(qbits())}`);
st.d = 0b0101001101; solve();               // LE still HIGH, new data
assert(qbits() === inv(0b0101001101), `transparent follow-through: got ${b10(qbits())}, want ${b10(inv(0b0101001101))}`);

// ── 4. LE LOW freezes; later D changes are ignored until LE returns HIGH ──────
st.le = 0; solve();                         // close latch on stored = 0101001101
const held = qbits();
st.d = 0b1111111111; solve();               // LE low, data changed → hold
assert(qbits() === held, `LE low must hold ${b10(held)}, got ${b10(qbits())}`);

// ── 5. Q outputs are ALWAYS driven (never Hi-Z), OERB does not gate them ──────
for (let i = 0; i < 10; i++) assert(driveOf(`Q${i}n`) !== DRIVE.HIGH_Z, `Q${i}n must always drive (OERB high)`);
st.oerb = 0; st.driveD = false; solve();    // read-back on — Q must still drive
for (let i = 0; i < 10; i++) assert(driveOf(`Q${i}n`) !== DRIVE.HIGH_Z, `Q${i}n must always drive (OERB low)`);

// ── 6. Read-back: stored word = 0101001101 appears (NON-inverted) on D bus ────
// Stored word is the last transparently-latched value: 0101001101.
const stored = 0b0101001101;
assert(dbits() === stored, `read-back word: got ${b10(dbits())}, want ${b10(stored)} (non-inverted)`);
for (let i = 0; i < 10; i++) assert(driveOf(`D${i}`) !== DRIVE.HIGH_Z, `D${i} must be driven during read-back`);
// Q still reflects the inverted stored word alongside read-back.
assert(qbits() === inv(stored), `Q during read-back: got ${b10(qbits())}, want ${b10(inv(stored))}`);

// OERB HIGH releases the D bus (chip stops driving), stored word untouched.
st.oerb = 1; solve();                        // D floats (driveD still false)
for (let i = 0; i < 10; i++) assert(driveOf(`D${i}`) === DRIVE.HIGH_Z, `D${i} must be Hi-Z when OERB high`);
st.le = 1; st.driveD = true; st.d = 0; solve(); // reopen transparent to confirm latch alive
assert(qbits() === MASK, `reopen transparent after read-back: got ${b10(qbits())}`);

console.log(`74x995-readback-latch-inv: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
