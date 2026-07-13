// ── 74x693 binary counter + output register + multiplexed 3-state outputs ───
// The 74x693 (js/chips/chips36.js) is the binary, synchronous-clear member of
// the 74x690 family: a synchronous 4-bit binary (0-15) counter with a 4-bit
// output register and a quad 2:1 multiplexer feeding shared 3-state Q outputs.
// It drives the COUNTER_REG_MUX_TRI primitive with gate.mod = 16 and
// gate.syncClear = true.
//
// Behaviour verified against the ST M54/74HC690-693 datasheet (March 1993),
// PIN CONNECTIONS + PIN DESCRIPTION + DESCRIPTION prose, read as rendered PDF
// page images (issues.md C4). The original TI SN74LS693 (D2423, 1988 TTL Data
// Book) is the same part:
//   • CCK rising edge counts up when ENP AND ENT are HIGH and LOAD is HIGH.
//   • CCLR LOW is SYNCHRONOUS: it does nothing until the next CCK rising edge,
//     which then clears the counter to 0 (this is what distinguishes the '693
//     from the async-clear '691).
//   • LOAD LOW + a CCK rising edge jam-loads A-D (overrides counting).
//   • Binary wrap: 15 → 0; RCO is HIGH at count 15 while ENT is HIGH.
//   • RCK rising edge snapshots the counter into the register.
//   • RCLR LOW is SYNCHRONOUS too: the register clears on the next RCK rising
//     edge, not the instant RCLR goes LOW.
//   • R/C selects counter (LOW) or register (HIGH) onto QA-QD.
//   • G (active LOW) gates the Q outputs; HIGH → high-impedance. RCO is not
//     3-stated.
//
// Method: one chip + one sim instance kept across the whole run so counter and
// register state (comp.ffState) persist. A fresh WireManager each solve is fine.
//
// Run:  node js/debug/scenarios/74x693-counter-reg-mux-sync.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x693');
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
    if (!p) throw new Error(`74x693 has no pin named ${name}`);
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

// ── 1. Count up to 3 so there is something to clear ──────────────────────────
clockC(); clockC(); clockC();
assert(qval() === 3, `setup: 3 CCK pulses should give 3, got ${qval()}`);

// ── 2. SYNCHRONOUS counter clear: CCLR LOW alone does NOT clear ──────────────
st.cclr = 0; solve();
assert(qval() === 3, `CCLR LOW with no clock must hold 3 (sync clear), got ${qval()}`);
clockC();
assert(qval() === 0, `CCLR LOW + a CCK edge should clear to 0, got ${qval()}`);
st.cclr = 1; solve();

// ── 3. Count up through the full binary range and check RCO at 15 ────────────
for (let n = 1; n <= 15; n++) {
  clockC();
  assert(qval() === n, `after ${n} CCK pulses count should be ${n}, got ${qval()}`);
}
assert(isHigh(read('RCO')), 'RCO should be HIGH at count 15 (ENT HIGH)');

// ── 4. Binary wrap 15 → 0 ────────────────────────────────────────────────────
clockC();
assert(qval() === 0, `count 15 should wrap to 0, got ${qval()}`);
assert(!isHigh(read('RCO')), 'RCO should be LOW after wrap to 0');

// ── 5. ENT LOW blocks counting and forces RCO LOW ────────────────────────────
clockC(); clockC(); // count = 2
assert(qval() === 2, `setup: count should be 2, got ${qval()}`);
st.ent = 0; solve();
clockC();
assert(qval() === 2, `ENT LOW must block the CCK edge (hold 2), got ${qval()}`);
st.ent = 1; solve();

// ── 6. ENP LOW blocks counting ───────────────────────────────────────────────
st.enp = 0; solve();
clockC();
assert(qval() === 2, `ENP LOW must block the CCK edge (hold 2), got ${qval()}`);
st.enp = 1; solve();

// ── 7. Synchronous parallel load (A-D = 13) overrides counting ───────────────
st.a = 1; st.b = 0; st.c = 1; st.d = 1; // 0b1101 = 13
st.load = 0; solve();
clockC();
assert(qval() === 13, `LOAD LOW + CCK should jam-load 13, got ${qval()}`);
st.load = 1; st.a = 0; st.b = 0; st.c = 0; st.d = 0; solve();

// ── 8. Register snapshot + R/C multiplexer ───────────────────────────────────
clockR();                              // register := current count (13)
clockC();                              // counter advances 13 → 14
assert(qval() === 14, `counter should now read 14 with R/C LOW, got ${qval()}`);
st.rc = 1; solve();                    // show register
assert(qval() === 13, `R/C HIGH should show stored register 13, got ${qval()}`);
st.rc = 0; solve();                    // back to counter
assert(qval() === 14, `R/C LOW should show live counter 14, got ${qval()}`);

// ── 9. SYNCHRONOUS register clear: RCLR LOW alone does NOT clear ─────────────
st.rclr = 0; solve();
st.rc = 1; solve();
assert(qval() === 13, `RCLR LOW with no RCK edge must hold register 13, got ${qval()}`);
clockR();                              // now the register clears on the RCK edge
assert(qval() === 0, `RCLR LOW + an RCK edge should clear the register, got ${qval()}`);
st.rc = 0; solve();
assert(qval() === 14, `RCLR must not disturb the counter (expected 14), got ${qval()}`);
st.rclr = 1; solve();

// ── 10. Output enable G: HIGH → Q outputs high-impedance, RCO still driven ───
st.g = 1; solve();
assert(isHiZ('QA') && isHiZ('QB') && isHiZ('QC') && isHiZ('QD'),
  'G HIGH should put QA-QD in high-impedance');
assert(!isHiZ('RCO'), 'RCO must stay driven regardless of G');
st.g = 0; solve();
assert(qval() === 14, `G LOW should re-drive the counter value 14, got ${qval()}`);

console.log(`74x693-counter-reg-mux-sync: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
