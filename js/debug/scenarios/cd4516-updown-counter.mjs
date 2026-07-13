// ── CD4516 presettable 4-bit binary up/down counter regression ───────────────
// The CD4516 (Batch 6, js/chips/chips99.js) is the behavioral coverage of the
// COUNTER_BIN_UPDOWN_CD primitive driven with carryActiveLow:true (the real
// CD4516B active-LOW CARRY IN / CARRY OUT semantics). It guards the chip's DB
// entry: the verified pin map (Q1=LSB…Q4=MSB; P1=LSB…P4=MSB), the binary mod-16
// up/down count, the active-LOW CARRY IN count-enable, the active-LOW CARRY OUT
// terminal-count flag, the active-HIGH asynchronous PRESET ENABLE jam-load, and
// the active-HIGH asynchronous RESET (which dominates).
//
// Datasheet (TI SCHS071B, CD4510B/CD4516B): the counter advances UP or DOWN by
// one on each POSITIVE-going CLOCK edge while CARRY IN is LOW. UP/DOWN HIGH =
// up, LOW = down. A HIGH on RESET clears to 0000; a HIGH on PRESET ENABLE jam-
// loads P1–P4. CARRY OUT goes LOW at the terminal count (1111 up / 0000 down)
// while CARRY IN is LOW.
//
// Method: place ONE CD4516 and keep the same chip + sim instance across the run
// so the counter state persists. Re-wire all inputs each solve.
//
// Run:  node js/debug/scenarios/cd4516-updown-counter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4516');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC, 0 = GND).
function apply(s) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4516 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK', s.clk ? 1 : 0);
  wirePin('UD',  s.ud  ? 1 : 0);
  wirePin('PE',  s.pe  ? 1 : 0);
  wirePin('CIn', s.cin ? 1 : 0);
  wirePin('RST', s.rst ? 1 : 0);
  wirePin('P1',  s.p1  ? 1 : 0);
  wirePin('P2',  s.p2  ? 1 : 0);
  wirePin('P3',  s.p3  ? 1 : 0);
  wirePin('P4',  s.p4  ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const count = () => {
  const b = (q) => (isHigh(read(q)) ? 1 : 0);
  return b('Q1') | (b('Q2') << 1) | (b('Q3') << 2) | (b('Q4') << 3);
};
const carryOut = () => (isHigh(read('COn')) ? 1 : 0);   // active LOW → 0 means asserted

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Default state: up direction, carry-in asserted (LOW), nothing else active.
const st = { clk: 0, ud: 1, pe: 0, cin: 0, rst: 0, p1: 0, p2: 0, p3: 0, p4: 0 };
const solve = () => apply(st);

// Rising-edge clock pulse (advance), then return CLOCK low.
function pulse(n = 1) {
  for (let i = 0; i < n; i++) {
    st.clk = 1; solve();   // rising edge → advance
    st.clk = 0; solve();   // falling edge → hold
  }
}

// ── 0. Power up with RESET asserted → count cleared ──────────────────────────
st.rst = 1; solve();
assert(count() === 0, `reset: count should be 0, got ${count()}`);
// At 0 counting up, terminal-up is 15, so CARRY OUT is NOT asserted (HIGH).
assert(carryOut() === 1, `reset: CARRY OUT should be HIGH (not terminal-up), got ${carryOut()}`);
st.rst = 0; solve();

// ── 1. Count up 0→6 (rising-edge, CARRY IN low) ──────────────────────────────
for (let n = 1; n <= 6; n++) {
  pulse(1);
  assert(count() === n, `up: after ${n} pulses count should be ${n}, got ${count()}`);
}

// ── 2. Falling CLOCK edge alone must NOT advance ─────────────────────────────
const before = count();                 // 6
st.clk = 1; solve();                    // rising edge → 7
assert(count() === before + 1, `rising edge should advance to ${before + 1}, got ${count()}`);
st.clk = 0; solve();                    // falling edge → hold
assert(count() === before + 1, `falling edge must hold at ${before + 1}, got ${count()}`);

// ── 3. CARRY IN HIGH (de-asserted) must inhibit counting ─────────────────────
const held = count();                   // 7
st.cin = 1; solve();                    // de-assert carry-in (HIGH)
pulse(2);                               // two clock pulses while inhibited
assert(count() === held, `CARRY IN HIGH must inhibit count (hold ${held}), got ${count()}`);
// CARRY OUT must be HIGH while CARRY IN is de-asserted, even at a terminal count.
assert(carryOut() === 1, `CARRY OUT should be HIGH while CARRY IN de-asserted, got ${carryOut()}`);
st.cin = 0; solve();                    // re-assert carry-in (LOW)

// ── 4. Count up to terminal 1111 → CARRY OUT asserts LOW ─────────────────────
pulse(15 - count());                    // drive up to 15
assert(count() === 15, `up-terminal: count should be 15, got ${count()}`);
assert(isHigh(read('Q1')) && isHigh(read('Q2')) && isHigh(read('Q3')) && isHigh(read('Q4')),
  `count 15 weighting wrong: Q4..Q1 = ${['Q4','Q3','Q2','Q1'].map(q=>isHigh(read(q))?1:0).join('')}`);
assert(carryOut() === 0, `up-terminal: CARRY OUT should assert LOW at 1111, got ${carryOut()}`);

// ── 5. Wrap 15→0 on the next up pulse ────────────────────────────────────────
pulse(1);
assert(count() === 0, `up-wrap: 15→0 expected, got ${count()}`);
assert(carryOut() === 1, `after wrap CARRY OUT should be HIGH (0 is not terminal-up), got ${carryOut()}`);

// ── 6. Asynchronous PRESET ENABLE jam-load (P4..P1 = 1010 = decimal 10) ──────
st.p1 = 0; st.p2 = 1; st.p3 = 0; st.p4 = 1;  // value 0b1010 = 10
st.pe = 1; solve();                          // PE high → async load
assert(count() === 10, `preset: jam-load should give 10, got ${count()}`);
st.pe = 0; solve();
assert(count() === 10, `preset: value should persist after PE low, got ${count()}`);

// ── 7. Count DOWN to terminal 0000 → CARRY OUT asserts LOW ───────────────────
st.ud = 0; solve();                     // down direction
pulse(10);                              // 10 → 0
assert(count() === 0, `down: count should reach 0, got ${count()}`);
assert(carryOut() === 0, `down-terminal: CARRY OUT should assert LOW at 0000, got ${carryOut()}`);

// ── 8. Down-wrap 0→15 ────────────────────────────────────────────────────────
pulse(1);
assert(count() === 15, `down-wrap: 0→15 expected, got ${count()}`);

// ── 9. RESET dominates PRESET ENABLE ─────────────────────────────────────────
st.p1 = 1; st.p2 = 1; st.p3 = 1; st.p4 = 1;  // would load 15
st.pe = 1; st.rst = 1; solve();              // both asserted → RESET wins
assert(count() === 0, `reset dominance: RESET over PE should give 0, got ${count()}`);
st.pe = 0; st.rst = 0; st.p1 = 0; st.p2 = 0; st.p3 = 0; st.p4 = 0; st.ud = 1; solve();

console.log(`cd4516-updown-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
