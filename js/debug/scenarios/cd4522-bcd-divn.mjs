// ── CD4522 programmable BCD divide-by-N down counter regression ──────────────
// The CD4522 (js/chips/chips122.js) is the CMOS programmable BCD divide-by-N
// DOWN counter. It uses the dedicated BCD_DIVN_DOWN_4522 engine primitive (the
// hinted FREQ_DIV_PROG is the 74292 and does not fit). This scenario guards the
// chip's DB entry against the verified TI/Harris CD4522B datasheet (SCHS079C):
//   - verified pin map (Q0=LSB…Q3=MSB; P0=LSB…P3=MSB; "0"=ZERO output)
//   - asynchronous active-HIGH MASTER RESET → count 0 (dominates)
//   - asynchronous active-HIGH PRESET ENABLE → jam-load P0–P3
//   - count DOWN on a rising CLOCK edge while CLOCK INHIBIT is LOW (BCD wrap 0→9)
//   - count DOWN on a falling CLOCK INHIBIT edge while CLOCK is HIGH
//   - CLOCK INHIBIT HIGH freezes the count
//   - decoded "0" output = HIGH when count==0 AND CASCADE FEEDBACK HIGH
//   - CASCADE FEEDBACK LOW disables counting and forces "0" LOW
//
// Method: place ONE CD4522 and keep the same chip + sim instance across the run
// so the counter state persists. Re-wire all inputs each solve.
//
// Run:  node js/debug/scenarios/cd4522-bcd-divn.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4522');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply(s) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4522 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK', s.clk ? 1 : 0);
  wirePin('CI',  s.ci  ? 1 : 0);
  wirePin('PE',  s.pe  ? 1 : 0);
  wirePin('MR',  s.mr  ? 1 : 0);
  wirePin('CF',  s.cf  ? 1 : 0);
  wirePin('P0',  s.p0  ? 1 : 0);
  wirePin('P1',  s.p1  ? 1 : 0);
  wirePin('P2',  s.p2  ? 1 : 0);
  wirePin('P3',  s.p3  ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read  = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const count = () => {
  const b = (q) => (isHigh(read(q)) ? 1 : 0);
  return b('Q0') | (b('Q1') << 1) | (b('Q2') << 2) | (b('Q3') << 3);
};
const zero = () => (isHigh(read('ZERO')) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Default: no reset, no preset, not inhibited, cascade feedback HIGH (single chip),
// clock low, preset value 0.
const st = { clk: 0, ci: 0, pe: 0, mr: 0, cf: 1, p0: 0, p1: 0, p2: 0, p3: 0 };
const solve = () => apply(st);
function pulse(n = 1) {
  for (let i = 0; i < n; i++) { st.clk = 1; solve(); st.clk = 0; solve(); }
}
function presetTo(v) {
  st.p0 = v & 1; st.p1 = (v >> 1) & 1; st.p2 = (v >> 2) & 1; st.p3 = (v >> 3) & 1;
  st.pe = 1; solve();            // async jam-load while PE HIGH
  st.pe = 0; solve();
}

// ── 0. MASTER RESET (async, dominates) ───────────────────────────────────────
st.mr = 1; solve();
assert(count() === 0, `MR reset: expected 0, got ${count()}`);
st.clk = 1; solve();
assert(count() === 0, `MR overrides clock: expected 0, got ${count()}`);
st.clk = 0; st.mr = 1; presetTo(5);  // PE while MR HIGH must NOT load (MR dominates)
assert(count() === 0, `MR dominates PE: expected 0, got ${count()}`);
st.mr = 0; solve();

// ── 1. Decoded "0" output is HIGH at count 0 with CF HIGH ─────────────────────
assert(zero() === 1, `ZERO HIGH at count 0 (CF=1), got ${zero()}`);

// ── 2. PRESET ENABLE jam-loads P0–P3 (async) ─────────────────────────────────
presetTo(5);
assert(count() === 5, `preset to 5: got ${count()}`);
assert(zero() === 0, `ZERO LOW when count!=0, got ${zero()}`);

// ── 3. Count DOWN on rising clock (CI low, CF high), BCD wrap 0→9 ─────────────
for (let expected = 4; expected >= 0; expected--) {
  pulse();
  assert(count() === expected, `count down: expected ${expected}, got ${count()}`);
}
assert(zero() === 1, `ZERO HIGH after reaching 0, got ${zero()}`);
pulse(); // 0 → 9 BCD wrap
assert(count() === 9, `BCD wrap: expected 9 after 0, got ${count()}`);
assert(zero() === 0, `ZERO LOW at count 9, got ${zero()}`);

// ── 4. CLOCK INHIBIT HIGH freezes the count ──────────────────────────────────
st.ci = 1; pulse(3);
assert(count() === 9, `CI=1 freeze: expected 9, got ${count()}`);
st.ci = 0; solve();

// ── 5. Count DOWN on a falling CLOCK INHIBIT edge while CLOCK is HIGH ─────────
//  Bring CLOCK HIGH first (that 0→1 transition is itself one rising-edge count),
//  then hold it HIGH and toggle CI 1→0; each falling CI edge decrements once more.
presetTo(4);
st.clk = 1; solve();              // rising CLOCK edge: 4 → 3
assert(count() === 3, `rising edge while raising CLOCK: expected 3, got ${count()}`);
for (let expected = 2; expected >= 0; expected--) {
  st.ci = 1; solve();             // raise inhibit (no count: rising CI edge does nothing)
  st.ci = 0; solve();             // falling inhibit edge while CLOCK HIGH → count down
  assert(count() === expected, `inhibit-edge count: expected ${expected}, got ${count()}`);
}
st.clk = 0; solve();

// ── 6. CASCADE FEEDBACK LOW disables counting AND forces "0" LOW ─────────────
presetTo(4);
st.cf = 0; pulse(3);
assert(count() === 4, `CF=0 disables counting: expected 4, got ${count()}`);
presetTo(0);
st.cf = 0; solve();
assert(zero() === 0, `CF=0 forces ZERO LOW even at count 0, got ${zero()}`);
st.cf = 1; solve();
assert(zero() === 1, `CF back HIGH at count 0 → ZERO HIGH, got ${zero()}`);

// ── 7. Divide-by-N: emulate "0"→PE feedback for N=3 (period = 3 clocks) ───────
//  Reload N when ZERO is HIGH, then count down; ZERO should pulse every 3 clocks.
const N = 3;
presetTo(N);
let zeroPulses = 0;
for (let i = 0; i < 9; i++) {       // 9 clocks → expect 3 ZERO pulses
  if (zero() === 1) { presetTo(N); }   // feedback: "0" → PE reloads N
  pulse();
  if (zero() === 1) zeroPulses++;
}
assert(zeroPulses === 3, `divide-by-${N}: expected 3 ZERO pulses over 9 clocks, got ${zeroPulses}`);

if (failures.length) {
  console.error('CD4522 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD4522 BCD divide-by-N down counter: all checks passed');
