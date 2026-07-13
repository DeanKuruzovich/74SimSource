// ── 74x690 BCD counter + output register + multiplexed 3-state outputs ──────
// The 74x690 (js/chips/chips36.js) is a synchronous decade (BCD, 0-9) counter
// with a 4-bit output register and a quad 2:1 multiplexer feeding shared 3-state
// Q outputs. It drives the COUNTER_REG_MUX_TRI primitive (gate.mod = 10).
//
// Behaviour verified against TI doc D2423 (SN54LS690..693), 1988 TTL Logic Data
// Book pp. 2-1139..2-1146, read as rendered PDF page images (issues.md C4):
//   • CCK rising edge counts up when ENP AND ENT are HIGH and LOAD is HIGH.
//   • CCLR LOW clears the counter asynchronously (independent of the clock).
//   • LOAD LOW + a CCK rising edge jam-loads A-D (overrides counting).
//   • Decade wrap: 9 → 0; RCO is HIGH at count 9 while ENT is HIGH.
//   • RCK rising edge snapshots the counter into the register; RCLR LOW clears
//     the register asynchronously.
//   • R/C selects counter (LOW) or register (HIGH) onto QA-QD.
//   • G (active LOW) gates the Q outputs; HIGH → high-impedance. RCO is not
//     3-stated.
//
// Method: one chip + one sim instance kept across the whole run so counter and
// register state (comp.ffState) persist. A fresh WireManager each solve is fine.
//
// Run:  node js/debug/scenarios/74x690-counter-reg-mux.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x690');
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
    if (!p) throw new Error(`74x690 has no pin named ${name}`);
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

// ── 2. Count up through the full decade and check RCO at 9 ───────────────────
for (let n = 1; n <= 9; n++) {
  clockC();
  assert(qval() === n, `after ${n} CCK pulses count should be ${n}, got ${qval()}`);
}
assert(isHigh(read('RCO')), 'RCO should be HIGH at count 9 (ENT HIGH)');

// ── 3. Decade wrap 9 → 0 ─────────────────────────────────────────────────────
clockC();
assert(qval() === 0, `count 9 should wrap to 0, got ${qval()}`);
assert(!isHigh(read('RCO')), 'RCO should be LOW after wrap to 0');

// ── 4. ENT LOW blocks counting and forces RCO LOW ────────────────────────────
clockC(); clockC(); // count = 2
assert(qval() === 2, `setup: count should be 2, got ${qval()}`);
st.ent = 0; solve();
clockC();
assert(qval() === 2, `ENT LOW must block the CCK edge (hold 2), got ${qval()}`);
st.ent = 1; solve();

// ── 5. ENP LOW blocks counting ───────────────────────────────────────────────
st.enp = 0; solve();
clockC();
assert(qval() === 2, `ENP LOW must block the CCK edge (hold 2), got ${qval()}`);
st.enp = 1; solve();

// ── 6. Synchronous parallel load (A-D = 7) overrides counting ────────────────
st.a = 1; st.b = 1; st.c = 1; st.d = 0; // 0b0111 = 7
st.load = 0; solve();
clockC();
assert(qval() === 7, `LOAD LOW + CCK should jam-load 7, got ${qval()}`);
st.load = 1; st.a = 0; st.b = 0; st.c = 0; solve();

// ── 7. Register snapshot + R/C multiplexer ───────────────────────────────────
clockR();                              // register := current count (7)
clockC();                              // counter advances 7 → 8
assert(qval() === 8, `counter should now read 8 with R/C LOW, got ${qval()}`);
st.rc = 1; solve();                    // show register
assert(qval() === 7, `R/C HIGH should show stored register 7, got ${qval()}`);
st.rc = 0; solve();                    // back to counter
assert(qval() === 8, `R/C LOW should show live counter 8, got ${qval()}`);

// ── 8. Async register clear leaves the counter alone ─────────────────────────
st.rclr = 0; solve();
st.rc = 1; solve();
assert(qval() === 0, `RCLR LOW should clear the register to 0, got ${qval()}`);
st.rc = 0; solve();
assert(qval() === 8, `RCLR must not disturb the counter (expected 8), got ${qval()}`);
st.rclr = 1; solve();

// ── 9. Output enable G: HIGH → Q outputs high-impedance, RCO still driven ────
st.g = 1; solve();
assert(isHiZ('QA') && isHiZ('QB') && isHiZ('QC') && isHiZ('QD'),
  'G HIGH should put QA-QD in high-impedance');
assert(!isHiZ('RCO'), 'RCO must stay driven regardless of G');
st.g = 0; solve();
assert(qval() === 8, `G LOW should re-drive the counter value 8, got ${qval()}`);

console.log(`74x690-counter-reg-mux: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
