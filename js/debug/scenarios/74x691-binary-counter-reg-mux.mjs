// ── 74x691 binary counter + output register + multiplexed 3-state outputs ────
// The 74x691 (js/chips/chips36.js) is the BINARY sibling of the 74x690: a
// synchronous 4-bit counter (0-15) with a 4-bit output register and a quad 2:1
// multiplexer feeding shared 3-state Q outputs. It drives the COUNTER_REG_MUX_TRI
// primitive with gate.mod = 16 (vs 10 for the 690's decade count).
//
// Behaviour verified against TI doc D2423 (SN54LS690..693, "...Binary Counter,
// Direct Clear"), 1988 TI Standard TTL Logic Data Book pp. 2-1139..2-1142, read
// as rendered PDF page images (issues.md C4):
//   • CCK rising edge counts up when ENP AND ENT are HIGH and LOAD is HIGH.
//   • CCLR LOW clears the counter asynchronously (independent of the clock).
//   • LOAD LOW + a CCK rising edge jam-loads A-D (overrides counting).
//   • Binary wrap: 15 → 0; RCO is HIGH at count 15 while ENT is HIGH (and NOT at
//     count 9, which is the key difference from the BCD 74x690).
//   • RCK rising edge snapshots the counter into the register; RCLR LOW clears
//     the register asynchronously.
//   • R/C selects counter (LOW) or register (HIGH) onto QA-QD.
//   • G (active LOW) gates the Q outputs; HIGH → high-impedance. RCO is not
//     3-stated.
//
// Method: one chip + one sim instance kept across the whole run so counter and
// register state (comp.ffState) persist. A fresh WireManager each solve is fine.
//
// Run:  node js/debug/scenarios/74x691-binary-counter-reg-mux.mjs (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x691');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// All 13 inputs are driven on every solve. Idle defaults: no clears, outputs
// enabled (G LOW), show the counter (R/C LOW), enables HIGH, LOAD HIGH.
const st = {
  cclr: 1, cck: 0, a: 0, b: 0, c: 0, d: 0,
  enp: 1, ent: 1, rclr: 1, rck: 0, load: 1, g: 0, rc: 0,
};

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x691 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CCLR', st.cclr);
  wirePin('CCK',  st.cck);
  wirePin('A',    st.a);
  wirePin('B',    st.b);
  wirePin('C',    st.c);
  wirePin('D',    st.d);
  wirePin('ENP',  st.enp);
  wirePin('ENT',  st.ent);
  wirePin('RCLR', st.rclr);
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

// One CCK pulse (rising then falling edge).
function clockC() { st.cck = 1; solve(); st.cck = 0; solve(); }
// One RCK pulse.
function clockR() { st.rck = 1; solve(); st.rck = 0; solve(); }

// ── 1. Async counter clear ───────────────────────────────────────────────────
st.cclr = 0; solve();
assert(qval() === 0, `CCLR LOW should clear counter to 0, got ${qval()}`);
st.cclr = 1; solve();

// ── 2. Count up through the full 0-15 range; RCO must stay LOW at 9 (binary) ──
for (let n = 1; n <= 15; n++) {
  clockC();
  assert(qval() === n, `after ${n} CCK pulses count should be ${n}, got ${qval()}`);
  if (n === 9) {
    assert(!isHigh(read('RCO')), 'RCO must be LOW at count 9 on a binary 691 (not BCD)');
  }
}
assert(isHigh(read('RCO')), 'RCO should be HIGH at count 15 (ENT HIGH)');

// ── 3. Binary wrap 15 → 0 ────────────────────────────────────────────────────
clockC();
assert(qval() === 0, `count 15 should wrap to 0, got ${qval()}`);
assert(!isHigh(read('RCO')), 'RCO should be LOW after wrap to 0');

// ── 4. ENT LOW blocks counting and forces RCO LOW ────────────────────────────
for (let i = 0; i < 15; i++) clockC(); // count = 15
assert(qval() === 15, `setup: count should be 15, got ${qval()}`);
assert(isHigh(read('RCO')), 'RCO HIGH at 15 with ENT HIGH');
st.ent = 0; solve();
assert(!isHigh(read('RCO')), 'ENT LOW must force RCO LOW even at terminal count');
clockC();
assert(qval() === 15, `ENT LOW must block the CCK edge (hold 15), got ${qval()}`);
st.ent = 1; solve();

// ── 5. ENP LOW blocks counting ───────────────────────────────────────────────
st.enp = 0; solve();
clockC();
assert(qval() === 15, `ENP LOW must block the CCK edge (hold 15), got ${qval()}`);
st.enp = 1; solve();

// ── 6. Synchronous parallel load (A-D = 13) overrides counting ───────────────
st.a = 1; st.b = 0; st.c = 1; st.d = 1; // 0b1101 = 13
st.load = 0; solve();
clockC();
assert(qval() === 13, `LOAD LOW + CCK should jam-load 13, got ${qval()}`);
st.load = 1; st.a = 0; st.b = 0; st.c = 0; st.d = 0; solve();

// ── 7. Register snapshot + R/C multiplexer ───────────────────────────────────
clockR();                              // register := current count (13)
clockC();                              // counter advances 13 → 14
assert(qval() === 14, `counter should now read 14 with R/C LOW, got ${qval()}`);
st.rc = 1; solve();                    // show register
assert(qval() === 13, `R/C HIGH should show stored register 13, got ${qval()}`);
st.rc = 0; solve();                    // back to counter
assert(qval() === 14, `R/C LOW should show live counter 14, got ${qval()}`);

// ── 8. Async register clear leaves the counter alone ─────────────────────────
st.rclr = 0; solve();
st.rc = 1; solve();
assert(qval() === 0, `RCLR LOW should clear the register to 0, got ${qval()}`);
st.rc = 0; solve();
assert(qval() === 14, `RCLR must not disturb the counter (expected 14), got ${qval()}`);
st.rclr = 1; solve();

// ── 9. Output enable G: HIGH → Q outputs high-impedance, RCO still driven ────
st.g = 1; solve();
assert(isHiZ('QA') && isHiZ('QB') && isHiZ('QC') && isHiZ('QD'),
  'G HIGH should put QA-QD in high-impedance');
assert(!isHiZ('RCO'), 'RCO must stay driven regardless of G');
st.g = 0; solve();
assert(qval() === 14, `G LOW should re-drive the counter value 14, got ${qval()}`);

console.log(`74x691-binary-counter-reg-mux: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
