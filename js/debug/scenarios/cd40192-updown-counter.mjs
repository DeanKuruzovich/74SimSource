// ── CD40192 presettable BCD up/down counter, DUAL clock — regression ─────────
// The CD40192 (js/chips/chips127.js) is the behavioral coverage of the
// COUNTER_DECADE_DC primitive (the dual-clock 74x192 decade up/down model). It
// guards the chip's DB entry against the coverage-plan's mis-hint: the plan maps
// CD40192 to COUNTER_BCD_UPDOWN_CD (the SINGLE-clock CD4510 model with a UP/DOWN
// pin + carry-in), but the real CD40192B is the 74192 family — two separate
// clocks (CLOCK UP / CLOCK DOWN), no direction pin, and active-LOW CARRY/BORROW
// cascade outputs. This test pins down the verified pin map (Q1=LSB…Q4=MSB;
// J1=LSB…J4=MSB), the BCD mod-10 dual-clock count, the active-LOW asynchronous
// PRESET ENABLE jam-load, the active-HIGH asynchronous RESET (which dominates),
// and the active-LOW CARRY (count 9 with CLOCK UP low) / BORROW (count 0 with
// CLOCK DOWN low) outputs.
//
// Datasheet (Harris/TI SCHS046, CD40192B/CD40193B): count advances on the
// POSITIVE edge of CLOCK UP (CLOCK DOWN held HIGH) and decrements on the POSITIVE
// edge of CLOCK DOWN (CLOCK UP held HIGH); BCD modulus 10. RESET HIGH clears to 0
// asynchronously; PRESET ENABLE LOW jam-loads J1–J4 asynchronously. CARRY pulses
// LOW at 9 while CLOCK UP is LOW; BORROW pulses LOW at 0 while CLOCK DOWN is LOW.
//
// Method: place ONE CD40192 and keep the same chip + sim instance across the run
// so the counter state persists. Re-wire all inputs each solve. Both clocks idle
// HIGH (per the datasheet "hold the unused clock HIGH"); a count pulse is
// HIGH→LOW→HIGH, counting on the rising (LOW→HIGH) edge.
//
// Run:  node js/debug/scenarios/cd40192-updown-counter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40192');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC, 0 = GND).
function apply(s) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40192 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK_UP',   s.up   ? 1 : 0);
  wirePin('CLK_DOWN', s.down ? 1 : 0);
  wirePin('PE',       s.pe   ? 1 : 0);
  wirePin('RESET',    s.rst  ? 1 : 0);
  wirePin('J1', s.j1 ? 1 : 0);
  wirePin('J2', s.j2 ? 1 : 0);
  wirePin('J3', s.j3 ? 1 : 0);
  wirePin('J4', s.j4 ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read  = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const count = () => {
  const b = (q) => (isHigh(read(q)) ? 1 : 0);
  return b('Q1') | (b('Q2') << 1) | (b('Q3') << 2) | (b('Q4') << 3);
};
const carry  = () => (isHigh(read('CARRY'))  ? 1 : 0);  // active LOW → 0 = asserted
const borrow = () => (isHigh(read('BORROW')) ? 1 : 0);  // active LOW → 0 = asserted

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Default: both clocks idle HIGH, PRESET ENABLE HIGH (inactive — it is ACTIVE
// LOW, so st.pe=1 means "do not load"), nothing else active.
const st = { up: 1, down: 1, pe: 1, rst: 0, j1: 0, j2: 0, j3: 0, j4: 0 };
const solve = () => apply(st);

// One count-up pulse: CLOCK UP HIGH→LOW→HIGH (count on the rising edge), CLOCK
// DOWN held HIGH throughout.
function pulseUp(n = 1) {
  for (let i = 0; i < n; i++) {
    st.up = 0; solve();   // falling edge → no count
    st.up = 1; solve();   // rising edge → +1
  }
}
// One count-down pulse: CLOCK DOWN HIGH→LOW→HIGH, CLOCK UP held HIGH.
function pulseDown(n = 1) {
  for (let i = 0; i < n; i++) {
    st.down = 0; solve();
    st.down = 1; solve();
  }
}

// ── 0. Power up with RESET asserted → count cleared ──────────────────────────
st.rst = 1; solve();
assert(count() === 0, `reset: count should be 0, got ${count()}`);
st.rst = 0; solve();

// ── 1. Count up 0→9 in BCD (rising-edge CLOCK UP) ────────────────────────────
for (let n = 1; n <= 9; n++) {
  pulseUp(1);
  assert(count() === n, `up: after ${n} pulses count should be ${n}, got ${count()}`);
}

// ── 2. Weighting at 9 (Q4 Q3 Q2 Q1 = 1001) ──────────────────────────────────
assert(isHigh(read('Q4')) && !isHigh(read('Q3')) && !isHigh(read('Q2')) && isHigh(read('Q1')),
  `count 9 weighting wrong: Q4..Q1 = ${['Q4','Q3','Q2','Q1'].map(q=>isHigh(read(q))?1:0).join('')}`);

// ── 3. CARRY asserts LOW at 9 while CLOCK UP is LOW ──────────────────────────
st.up = 0; solve();                 // CLOCK UP low, still at 9
assert(count() === 9, `carry-check: count should still be 9, got ${count()}`);
assert(carry() === 0, `carry: should assert LOW at 9 with CLOCK UP low, got ${carry()}`);
st.up = 1; solve();                 // rising edge → wrap 9→0
assert(count() === 0, `up-wrap: 9→0 expected, got ${count()}`);
assert(carry() === 1, `after wrap CARRY should be HIGH (0 is not terminal-up), got ${carry()}`);

// ── 4. Falling CLOCK UP edge alone must NOT advance ──────────────────────────
pulseUp(3);                         // now at 3
const before = count();             // 3
st.up = 0; solve();                 // falling edge → hold
assert(count() === before, `falling CLOCK UP edge must hold at ${before}, got ${count()}`);
st.up = 1; solve();                 // rising edge → 4

// ── 5. Asynchronous PRESET ENABLE jam-load (J4..J1 = 0111 = decimal 7) ───────
st.j1 = 1; st.j2 = 1; st.j3 = 1; st.j4 = 0;  // value 0b0111 = 7
st.pe = 0;                                    // PRESET ENABLE LOW = active → async load
solve();                                      // PE low → async load J1..J4
assert(count() === 7, `preset: jam-load should give 7, got ${count()}`);
st.pe = 1; solve();                           // PE HIGH → counting (value persists)
assert(count() === 7, `preset: value should persist after PE high, got ${count()}`);

// ── 6. Count DOWN to 0 (rising-edge CLOCK DOWN, CLOCK UP held HIGH) ───────────
pulseDown(7);                        // 7 → 0
assert(count() === 0, `down: count should reach 0, got ${count()}`);

// ── 7. BORROW asserts LOW at 0 while CLOCK DOWN is LOW ───────────────────────
st.down = 0; solve();                // CLOCK DOWN low, at 0
assert(count() === 0, `borrow-check: count should still be 0, got ${count()}`);
assert(borrow() === 0, `borrow: should assert LOW at 0 with CLOCK DOWN low, got ${borrow()}`);
st.down = 1; solve();                // rising edge → wrap 0→9 (BCD down-wrap)
assert(count() === 9, `down-wrap: 0→9 expected, got ${count()}`);
assert(borrow() === 1, `after down-wrap BORROW should be HIGH, got ${borrow()}`);

// ── 8. RESET dominates PRESET ENABLE ─────────────────────────────────────────
st.j1 = 1; st.j2 = 0; st.j3 = 0; st.j4 = 1;  // would load 9
st.pe = 0; st.rst = 1; solve();              // PE active (load) AND RESET → RESET wins
assert(count() === 0, `reset dominance: RESET over PRESET ENABLE should give 0, got ${count()}`);
st.pe = 1; st.rst = 0; st.j1 = 0; st.j2 = 0; st.j3 = 0; st.j4 = 0; solve();

console.log(`cd40192-updown-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
