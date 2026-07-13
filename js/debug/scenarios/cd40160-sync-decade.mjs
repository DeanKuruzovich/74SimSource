// ── CD40160 synchronous decade counter regression ───────────────────────────
// The CD40160 (Batch 7, js/chips/chips123.js) is the CMOS synchronous 4-bit
// decade counter with an ASYNCHRONOUS active-LOW CLEAR. It reuses the existing
// COUNTER_SYNC_DECADE primitive (the 74x160 model). This scenario guards the
// chip's DB entry: the verified pin map (Q1=LSB…Q4=MSB; P1=LSB…P4=MSB), the
// decade 0-9 count on the rising CLOCK edge gated by PE & TE, the SYNCHRONOUS
// active-LOW LOAD of P1-P4, the ASYNCHRONOUS active-LOW CLEAR, and the
// CARRY OUT (HIGH at count 9 while TE is HIGH).
//
// Datasheet (TI SCHS103C, CD40160B, TRUTH TABLE p.3): CLEAR=0 → async reset to
// 0; rising CLOCK with LOAD=0 → preset to P1-P4 (sync); rising CLOCK with
// CLEAR=LOAD=1 and PE=TE=1 → count; PE=0 or TE=0 → hold. CARRY OUT = TE AND
// (count == 9).
//
// Method: place ONE CD40160 and keep the same chip + sim instance across the
// run so the counter state persists. Re-wire all inputs each solve.
//
// Run:  node js/debug/scenarios/cd40160-sync-decade.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40160');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VDD, 0 = VSS).
function apply(s) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40160 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', s.clk   ? 1 : 0);
  wirePin('CLEAR', s.clear ? 1 : 0);
  wirePin('LOAD',  s.load  ? 1 : 0);
  wirePin('PE',    s.pe    ? 1 : 0);
  wirePin('TE',    s.te    ? 1 : 0);
  wirePin('P1',    s.p1    ? 1 : 0);
  wirePin('P2',    s.p2    ? 1 : 0);
  wirePin('P3',    s.p3    ? 1 : 0);
  wirePin('P4',    s.p4    ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read  = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const count = () => {
  const b = (q) => (isHigh(read(q)) ? 1 : 0);
  return b('Q1') | (b('Q2') << 1) | (b('Q3') << 2) | (b('Q4') << 3);
};
const carry = () => (isHigh(read('CARRY OUT')) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Default state: CLEAR/LOAD inactive (HIGH), both enables HIGH, P=0.
const st = { clk: 0, clear: 1, load: 1, pe: 1, te: 1, p1: 0, p2: 0, p3: 0, p4: 0 };
const solve = () => apply(st);

// Rising-edge clock pulse, then return CLOCK low.
function pulse(n = 1) {
  for (let i = 0; i < n; i++) {
    st.clk = 1; solve();   // rising edge → act
    st.clk = 0; solve();   // falling edge → hold
  }
}

// ── 0. Async CLEAR holds the count at 0 regardless of the clock ──────────────
st.clear = 0; solve();
assert(count() === 0, `async CLEAR: expected 0, got ${count()}`);
st.clk = 1; solve();
assert(count() === 0, `async CLEAR overrides clock: expected 0, got ${count()}`);
st.clk = 0; st.clear = 1; solve();

// ── 1. Count 0→9 then wrap to 0 (decade) ─────────────────────────────────────
for (let expected = 1; expected <= 9; expected++) {
  pulse();
  assert(count() === expected, `count up: expected ${expected}, got ${count()}`);
}
assert(carry() === 1, `CARRY OUT should be HIGH at count 9 (TE=1), got ${carry()}`);
pulse(); // 9 → 0 wrap
assert(count() === 0, `decade wrap: expected 0 after 9, got ${count()}`);
assert(carry() === 0, `CARRY OUT should drop after wrap, got ${carry()}`);

// ── 2. TE gates CARRY OUT but not the count enable test below ────────────────
//  Drive to 9, then drop TE → CARRY OUT must go low even though count is 9.
for (let i = 0; i < 9; i++) pulse();
assert(count() === 9, `re-reach 9: got ${count()}`);
assert(carry() === 1, `CARRY OUT HIGH at 9 with TE=1, got ${carry()}`);
st.te = 0; solve();
assert(carry() === 0, `TE=0 must force CARRY OUT low, got ${carry()}`);
st.te = 1; solve();

// ── 3. Hold: PE=0 (or TE=0) freezes the count across clock edges ─────────────
st.pe = 0; pulse(3);
assert(count() === 9, `PE=0 hold: expected 9, got ${count()}`);
st.pe = 1;
st.te = 0; pulse(3);
assert(count() === 9, `TE=0 hold: expected 9, got ${count()}`);
st.te = 1; solve();

// ── 4. Synchronous LOAD of P1-P4 = 0101 (=5) on the clock edge ───────────────
st.load = 1; pulse(); // first move off 9 (→0) so the load is observable
st.load = 0; st.p1 = 1; st.p2 = 0; st.p3 = 1; st.p4 = 0; // 0b0101 = 5
//  LOAD is synchronous: nothing should change until the rising edge.
solve();
assert(count() === 0, `sync LOAD before edge: expected hold 0, got ${count()}`);
pulse(); // rising edge → load 5
assert(count() === 5, `sync LOAD on edge: expected 5, got ${count()}`);
st.load = 1; st.p1 = 0; st.p3 = 0; solve();

// ── 5. Continue counting from the loaded value ───────────────────────────────
pulse();
assert(count() === 6, `count after load: expected 6, got ${count()}`);

if (failures.length) {
  console.error('CD40160 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD40160 sync decade counter: all checks passed');
