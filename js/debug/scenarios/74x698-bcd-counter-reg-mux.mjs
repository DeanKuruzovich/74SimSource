// ── 74x698 BCD up/down counter + output register + 3-state MUX, SYNC clear ──
// The 74x698 (js/chips/chips37.js) is a synchronous BCD (0-9) UP/DOWN counter
// with a 4-bit output register and a quad 2:1 multiplexer feeding shared 3-state
// Q outputs. It drives the COUNTER_UPDOWN_REG_MUX_TRI primitive with
// gate.mod = 10 (decade) and gate.syncClear = true. It is the SYNCHRONOUS-CLEAR
// BCD member of the '696/'697/'698/'699 family — identical to the '696 except
// the counter clear is sampled on the clock edge instead of acting immediately.
//
// Behaviour verified against TI SDLS199 (SN54/74LS696/697/699), Jan 1981 rev.
// Mar 1988, read as rendered PDF page images (issues.md C4). Note the family's
// ACTIVE-LOW pins (overbars in the datasheet):
//   • CCK rising edge counts when ENP AND ENT are LOW and LOAD is HIGH.
//   • U/D HIGH counts up, LOW counts down.
//   • CCLR LOW clears the counter SYNCHRONOUSLY: only on the next CCK rising
//     edge, and it outranks LOAD and the enables.
//   • LOAD LOW + a CCK rising edge jam-loads A-D (overrides counting).
//   • Decade wrap: up 9 → 0, down 0 → 9.
//   • RCO is active LOW: LOW at terminal count (9 up / 0 down) while ENT is LOW.
//   • RCK rising edge snapshots the counter into the register (no register clear).
//   • R/C selects counter (LOW) or register (HIGH) onto QA-QD.
//   • G (active LOW) gates the Q outputs; HIGH → high-impedance. RCO not 3-stated.
//
// Method: one chip + one sim instance kept across the whole run so counter and
// register state persist. A fresh WireManager each solve is fine.
//
// Run:  node js/debug/scenarios/74x698-bcd-counter-reg-mux.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x698');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// All 13 inputs driven on every solve. Idle defaults: no clear (cclr HIGH),
// outputs enabled (G LOW), show counter (R/C LOW), enables active (ENP/ENT LOW),
// LOAD HIGH, count up (U/D HIGH).
const st = {
  ud: 1, cck: 0, a: 0, b: 0, c: 0, d: 0,
  enp: 0, ent: 0, cclr: 1, rck: 0, load: 1, g: 0, rc: 0,
};

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x698 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('U/D',  st.ud);
  wirePin('CCK',  st.cck);
  wirePin('A',    st.a);
  wirePin('B',    st.b);
  wirePin('C',    st.c);
  wirePin('D',    st.d);
  wirePin('ENP',  st.enp);
  wirePin('ENT',  st.ent);
  wirePin('CCLR', st.cclr);
  wirePin('RCK',  st.rck);
  wirePin('LOAD', st.load);
  wirePin('G',    st.g);
  wirePin('R/C',  st.rc);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;
const qval = () =>
  (isHigh(read('QA')) ? 1 : 0) | (isHigh(read('QB')) ? 2 : 0) |
  (isHigh(read('QC')) ? 4 : 0) | (isHigh(read('QD')) ? 8 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

function clockC() { st.cck = 1; solve(); st.cck = 0; solve(); }
function clockR() { st.rck = 1; solve(); st.rck = 0; solve(); }

function syncClear() {              // proper way to zero the synchronous-clear part
  st.cclr = 0; clockC(); st.cclr = 1; solve();
}

// ── 1. Synchronous clear: CCLR LOW alone does NOT clear (this is the '698's
//      whole point vs the async '696). It needs a CCK edge. ──────────────────
clockC(); clockC(); clockC();          // count = 3
assert(qval() === 3, `setup: count should be 3, got ${qval()}`);
st.cclr = 0; solve();
assert(qval() === 3, `CCLR LOW with no clock must NOT clear yet (synchronous), got ${qval()}`);
clockC();
assert(qval() === 0, `CCLR LOW + CCK edge should clear to 0, got ${qval()}`);
st.cclr = 1; solve();

// ── 2. Count up through 1..9 and check RCO (active LOW) at 9 ─────────────────
for (let n = 1; n <= 9; n++) {
  clockC();
  assert(qval() === n, `after ${n} CCK pulses count should be ${n}, got ${qval()}`);
}
assert(!isHigh(read('RCO')), 'RCO should be LOW (asserted) at count 9 with ENT LOW');

// ── 3. Decade wrap 9 → 0 ─────────────────────────────────────────────────────
clockC();
assert(qval() === 0, `BCD count 9 should wrap to 0, got ${qval()}`);
assert(isHigh(read('RCO')), 'RCO should be HIGH (deasserted) after wrap to 0 while counting up');

// ── 4. Count down: 0 → 9 wrap, RCO asserts at 0 ─────────────────────────────
st.ud = 0; solve();                    // direction = down
assert(!isHigh(read('RCO')), 'RCO should assert LOW at count 0 while counting down (ENT LOW)');
clockC();
assert(qval() === 9, `down count from 0 should wrap to 9 (decade), got ${qval()}`);
clockC();
assert(qval() === 8, `down count should step 9 → 8, got ${qval()}`);
st.ud = 1; solve();                    // back to up

// ── 5. ENT HIGH (inactive) blocks counting and deasserts RCO ─────────────────
syncClear();                           // count = 0
clockC(); clockC();                    // count = 2
assert(qval() === 2, `setup: count should be 2, got ${qval()}`);
st.ent = 1; solve();
clockC();
assert(qval() === 2, `ENT HIGH (inactive) must block the CCK edge (hold 2), got ${qval()}`);
st.ent = 0; solve();

// ── 6. ENP HIGH (inactive) blocks counting ───────────────────────────────────
st.enp = 1; solve();
clockC();
assert(qval() === 2, `ENP HIGH (inactive) must block the CCK edge (hold 2), got ${qval()}`);
st.enp = 0; solve();

// ── 7. Synchronous parallel load (A-D = 7) overrides counting ────────────────
st.a = 1; st.b = 1; st.c = 1; st.d = 0; // 0b0111 = 7
st.load = 0; solve();
clockC();
assert(qval() === 7, `LOAD LOW + CCK should jam-load 7, got ${qval()}`);
st.load = 1; st.a = 0; st.b = 0; st.c = 0; st.d = 0; solve();

// ── 8. Synchronous clear outranks load on the same edge ──────────────────────
st.load = 0; st.a = 1; st.b = 0; st.c = 0; st.d = 1; st.cclr = 0; solve();
clockC();                              // CCLR low + LOAD low on the same edge
assert(qval() === 0, `synchronous clear must outrank load on the CCK edge, got ${qval()}`);
st.cclr = 1; st.load = 1; st.a = 0; st.d = 0; solve();

// ── 9. Register snapshot + R/C multiplexer ───────────────────────────────────
clockC(); clockC(); clockC(); clockC(); clockC(); // count = 5
assert(qval() === 5, `setup: count should be 5, got ${qval()}`);
clockR();                              // register := current count (5)
clockC();                              // counter advances 5 → 6
assert(qval() === 6, `counter should now read 6 with R/C LOW, got ${qval()}`);
st.rc = 1; solve();                    // show register
assert(qval() === 5, `R/C HIGH should show stored register 5, got ${qval()}`);
st.rc = 0; solve();                    // back to counter
assert(qval() === 6, `R/C LOW should show live counter 6, got ${qval()}`);

// ── 10. Output enable G: HIGH → Q outputs high-impedance, RCO still driven ───
st.g = 1; solve();
assert(isHiZ('QA') && isHiZ('QB') && isHiZ('QC') && isHiZ('QD'),
  'G HIGH should put QA-QD in high-impedance');
assert(!isHiZ('RCO'), 'RCO must stay driven regardless of G');
st.g = 0; solve();
assert(qval() === 6, `G LOW should re-drive the counter value 6, got ${qval()}`);

console.log(`74x698-bcd-counter-reg-mux: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
