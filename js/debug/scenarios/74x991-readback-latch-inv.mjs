// ── 74x991 8-bit inverting transparent read-back latch regression ────────────
// The 74x991 (js/chips/chips46.js) is an 8-bit D-type TRANSPARENT latch with
// INVERTING, always-driven Q outputs and a 3-state READ-BACK path: pulling OERB
// LOW pushes the stored byte back out onto the same D pins it was written on.
// It rides the LATCH_READBACK_INV engine primitive.
//
// LATCH_READBACK_INV contract (js/specificChipsSim.js):
//   inputs:  [OERBn, LE, D0..D7]              (OERBn active LOW)
//   outputs: [Q0n..Q7n, D0..D7]
//     Qn      = NOT(stored)  — always driven (no output-enable on the 20-pin part)
//     LE HIGH → transparent (capture D);  LE LOW → hold
//     OERBn LOW  → drive TRUE stored byte back onto D0..D7 (read-back)
//     OERBn HIGH → release D0..D7 (read-back buffer Hi-Z)
//
// Sources (verified as PDF page images): TI SN74ALS990 SDAS027B (the '991's
// non-inverting 20-pin twin) + SN74ALS992 SDAS028B (read-back + OEQ distinction);
// Wikipedia 7400-series list for the 991-specific inverting/8-bit/20-pin facts.
//
// Run:  node js/debug/scenarios/74x991-readback-latch-inv.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x991');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with each control/data pin held at a rail level. When st.driveD is
// false the D pins are left UNWIRED so the chip can drive them via read-back and
// we can read the value it puts there. State lives on the persistent chip
// component, so a fresh WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x991 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OERB', st.oerbn ? 1 : 0);
  wirePin('LE',    st.le    ? 1 : 0);
  if (st.driveD) {
    for (let i = 0; i < 8; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {          // reassemble the byte the inverting outputs present
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read(`Q${i}n`))) v |= (1 << i);
  return v;
};
const dbits = () => {          // reassemble whatever is on the D bus right now
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read(`D${i}`))) v |= (1 << i);
  return v;
};
const hex = (v) => '0x' + (v & 0xff).toString(16).padStart(2, '0').toUpperCase();

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Defaults: read-back off (OERBn HIGH), latch holding (LE LOW), D bus driven.
const st = { oerbn: 1, le: 0, driveD: true, d: [0,0,0,0,0,0,0,0] };
const setD = (byte) => { for (let i = 0; i < 8; i++) st.d[i] = (byte >> i) & 1; };
function store(byte) {          // write a byte through the transparent latch
  setD(byte);
  st.le = 1; st.oerbn = 1; st.driveD = true; apply(st);   // transparent capture
  st.le = 0; apply(st);                                    // freeze it
}

// ── 1. Transparent + inverting: while LE HIGH, Q = NOT(D) ─────────────────────
setD(0x55);
st.le = 1; st.oerbn = 1; st.driveD = true; apply(st);
assert(qbits() === 0xAA, `transparent invert: store 0x55 -> Q should be 0xAA, got ${hex(qbits())}`);

// ── 2. Hold: with LE LOW the outputs ignore new data ─────────────────────────
store(0x0F);
assert(qbits() === 0xF0, `hold after store 0x0F: Q should be 0xF0, got ${hex(qbits())}`);
setD(0xFF);                     // change the inputs while latched
st.le = 0; apply(st);
assert(qbits() === 0xF0, `LE low should hold 0xF0, got ${hex(qbits())}`);

// ── 3. Read-back returns the TRUE stored byte on the D pins ───────────────────
// Store 0x55 (Q therefore reads 0xAA), release the external D drivers, then
// pull OERB LOW: the D bus must present the true stored 0x55, not the inverted Q.
store(0x55);
st.driveD = false;              // let go of the D bus (no external driver)
st.oerbn = 0; apply(st);        // enable read-back
assert(dbits() === 0x55, `read-back: D bus should show true 0x55, got ${hex(dbits())}`);
assert(qbits() === 0xAA, `read-back: Q stays inverted 0xAA, got ${hex(qbits())}`);

// ── 4. OERB HIGH releases the read-back bus (D no longer driven HIGH) ─────────
// Store 0xFF (read-back would drive all D HIGH); with OERB HIGH the D pins are
// released, so they must NOT read HIGH.
store(0xFF);
st.driveD = false;
st.oerbn = 0; apply(st);
assert(dbits() === 0xFF, `read-back 0xFF: D bus should be all HIGH, got ${hex(dbits())}`);
st.oerbn = 1; apply(st);        // disable read-back
assert(dbits() === 0x00, `OERB high: D bus should be released (not driven HIGH), got ${hex(dbits())}`);
assert(qbits() === 0x00, `stored 0xFF -> Q inverted to 0x00, got ${hex(qbits())}`);

if (failures.length) {
  console.error(`74x991: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x991: PASS — transparent invert, hold, true-data read-back, and OERB release all correct');
