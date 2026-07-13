// ── 74x692 BCD counter + register + mux, SYNCHRONOUS clear ──────────────────
// The 74x692 (js/chips/chips36.js) is the 74x690 with one change: the counter
// clear is synchronous, not asynchronous. It drives the COUNTER_REG_MUX_TRI
// primitive with gate.mod = 10 (decade) and gate.syncClear = true.
//
// This scenario focuses on the behaviour that distinguishes the '692 from the
// '690 (whose own regression covers the counter/register/mux machinery):
//   • CCLR LOW with NO clock edge must NOT clear — the count holds.
//   • CCLR LOW then a CCK rising edge clears the counter to 0 (synchronous).
//   • A synchronous clear outranks parallel load (LOAD LOW) at the same edge.
//   • A synchronous clear outranks the count even with ENP/ENT HIGH.
// Plus a couple of family-shared checks so a broken pinout/mux is still caught:
//   • decade count up and wrap 9 -> 0 with RCO at 9,
//   • R/C multiplexer picks register vs counter onto QA-QD.
//
// Behaviour verified against TI doc D2423 (SN54LS690..693), 1988 TTL Logic Data
// Book pp. 2-1139..2-1146 (one connection diagram for all four parts; function
// table gives the '692 synchronous CCLR). See chips36.js header for the full
// citation and why a standalone '692 PDF could not be re-fetched.
//
// Run:  node js/debug/scenarios/74x692-sync-clear-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x692');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Idle defaults: no clears armed, outputs enabled (G LOW), show counter (R/C
// LOW), both enables HIGH, LOAD HIGH.
const st = {
  cclr: 1, cck: 0, a: 0, b: 0, c: 0, d: 0,
  enp: 1, ent: 1, rclr: 1, rck: 0, load: 1, g: 0, rc: 0,
};

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x692 has no pin named ${name}`);
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
const qval = () =>
  (isHigh(read('QA')) ? 1 : 0) | (isHigh(read('QB')) ? 2 : 0) |
  (isHigh(read('QC')) ? 4 : 0) | (isHigh(read('QD')) ? 8 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

function clockC() { st.cck = 1; solve(); st.cck = 0; solve(); }
function clockR() { st.rck = 1; solve(); st.rck = 0; solve(); }

// ── 1. Get the counter to a known non-zero value (count up to 5) ─────────────
for (let n = 1; n <= 5; n++) clockC();
assert(qval() === 5, `setup: 5 CCK pulses should give count 5, got ${qval()}`);

// ── 2. SYNCHRONOUS clear: CCLR LOW alone must NOT clear (no clock edge) ──────
st.cclr = 0; solve();
assert(qval() === 5, `CCLR LOW without a CCK edge must hold the count (5), got ${qval()}`);

// ── 3. The next CCK rising edge performs the clear ───────────────────────────
clockC();
assert(qval() === 0, `CCLR LOW + a CCK edge should clear to 0, got ${qval()}`);
st.cclr = 1; solve();

// ── 4. Decade count up + RCO at 9 + wrap 9 -> 0 ──────────────────────────────
for (let n = 1; n <= 9; n++) {
  clockC();
  assert(qval() === n, `after ${n} CCK pulses count should be ${n}, got ${qval()}`);
}
assert(isHigh(read('RCO')), 'RCO should be HIGH at count 9 (ENT HIGH)');
clockC();
assert(qval() === 0, `decade should wrap 9 -> 0, got ${qval()}`);

// ── 5. Synchronous clear OUTRANKS parallel load at the same edge ─────────────
st.a = 1; st.b = 1; st.c = 1; st.d = 0; // would load 7...
st.load = 0; st.cclr = 0; solve();      // ...but CCLR is also LOW
clockC();
assert(qval() === 0, `CCLR must beat LOAD at the same CCK edge (expect 0), got ${qval()}`);
st.load = 1; st.cclr = 1; st.a = 0; st.b = 0; st.c = 0; solve();

// ── 6. Synchronous clear OUTRANKS counting (enables HIGH) ────────────────────
clockC(); clockC(); clockC();           // count = 3
assert(qval() === 3, `setup: count should be 3, got ${qval()}`);
st.cclr = 0; solve();                   // arm clear, enables still HIGH
clockC();
assert(qval() === 0, `CCLR must beat the count at a CCK edge (expect 0), got ${qval()}`);
st.cclr = 1; solve();

// ── 7. Register snapshot + R/C multiplexer (family-shared sanity) ────────────
clockC(); clockC();                     // counter = 2
clockR();                               // register := 2
clockC();                               // counter advances 2 -> 3
assert(qval() === 3, `counter should read 3 with R/C LOW, got ${qval()}`);
st.rc = 1; solve();
assert(qval() === 2, `R/C HIGH should show stored register 2, got ${qval()}`);
st.rc = 0; solve();
assert(qval() === 3, `R/C LOW should show live counter 3, got ${qval()}`);

console.log(`74x692-sync-clear-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
