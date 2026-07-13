// ── 74x990 8-bit D-type transparent read-back latch ─────────────────────────
// The 74x990 (js/chips/chips46.js) is an 8-bit transparent latch with true-logic
// Q outputs and a read-back feature: the D pins are a 3-state I/O bus. It drives
// the READBACK_LATCH primitive (js/specificChipsSim.js).
//
// Behaviour verified against TI SDAS027B (SN74ALS990), read as rendered PDF page
// images (issues.md C4):
//   • LE HIGH  → latch transparent, Q0-Q7 follow D0-D7.
//   • LE LOW   → latch holds the last byte; Q outputs stay driven.
//   • OERB LOW → the stored byte is driven back onto the D0-D7 pins (read-back).
//   • OERB HIGH→ the D pins are released (input only); Q outputs unaffected.
//   • OERB never disturbs the stored data or the Q outputs.
//
// Method: one chip + one sim kept across the run so latch state persists. The D
// pins are only wired to the rails while loading; during read-back they are left
// floating so the chip can drive them and we can read the driven value.
//
// Run:  node js/debug/scenarios/74x990-readback-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x990');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// idle: read-back off (OERB HIGH), latch transparent (LE HIGH), data bus = 0,
// data bus driven externally.
const st = { oerb: 1, le: 1, data: 0, driveData: true };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x990 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OERB', st.oerb);
  wirePin('LE',   st.le);
  if (st.driveData) {
    for (let i = 0; i < 8; i++) wirePin('D' + i, (st.data >> i) & 1);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;
const qval = () => {
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read('Q' + i))) v |= (1 << i);
  return v;
};
const dval = () => {
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read('D' + i))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Transparent: Q follows D while LE HIGH ────────────────────────────────
st.le = 1; st.oerb = 1; st.data = 0xA5; st.driveData = true; solve();
assert(qval() === 0xA5, `LE HIGH should pass D=0xA5 to Q, got 0x${qval().toString(16)}`);
st.data = 0x3C; solve();
assert(qval() === 0x3C, `LE HIGH should track D=0x3C, got 0x${qval().toString(16)}`);

// ── 2. Hold: LE LOW freezes the byte ─────────────────────────────────────────
st.le = 0; solve();                       // latch holds 0x3C
st.data = 0xFF; solve();                  // D changes, Q must not
assert(qval() === 0x3C, `LE LOW should hold 0x3C despite D=0xFF, got 0x${qval().toString(16)}`);

// ── 3. Read-back: OERB LOW drives the stored byte onto the D pins ────────────
st.driveData = false;                     // release the external D drive
st.oerb = 0; solve();
assert(dval() === 0x3C, `OERB LOW should read the stored 0x3C back onto D, got 0x${dval().toString(16)}`);
assert(!isHiZ('D0'), 'D pins should be driven during read-back');
assert(qval() === 0x3C, 'Q outputs must be unaffected by read-back');

// ── 4. OERB does not disturb the stored data ─────────────────────────────────
st.oerb = 1; st.driveData = true; st.data = 0x00; solve();  // D bus back to 0, LE still LOW
assert(qval() === 0x3C, `stored byte must survive OERB toggling, Q got 0x${qval().toString(16)}`);

// ── 5. OERB HIGH releases the D pins (input only) ────────────────────────────
st.driveData = false; solve();
assert(isHiZ('D0') && isHiZ('D7'), 'D pins should be high-impedance when OERB is HIGH');

// ── 6. New load then read-back a different value ─────────────────────────────
st.le = 1; st.driveData = true; st.data = 0x69; solve();     // transparent load 0x69
assert(qval() === 0x69, `reload should show 0x69, got 0x${qval().toString(16)}`);
st.le = 0; solve();                                          // hold
st.driveData = false; st.oerb = 0; solve();                  // read back
assert(dval() === 0x69, `read-back should return 0x69, got 0x${dval().toString(16)}`);

console.log(`74x990-readback-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
