// ── CD4527 BCD (decade) rate multiplier regression ──────────────────────────
// The CD4527 (js/chips/chips160.js) is the CMOS BCD rate multiplier. It uses the
// dedicated RATE_MULT_BCD_4527 engine primitive (the hinted RATE_MULT_DECADE is
// the 74167, whose CLR/LOAD/ENP/ENT pin contract + single-pulse Z model do not
// fit). This scenario guards the DB entry against the verified TI/Harris CD4527B
// datasheet (SCHS080C):
//   - verified pin map (A=14 LSB … D=3 MSB; OUT=6; NINE=1; CARRYOUT=7)
//   - OUT delivers exactly N pulses per 10 clock pulses, N = BCD(D,C,B,A)
//   - the full TRUTH TABLE for ALL 16 input codes (valid 0-9 → N; invalid → 8/9)
//   - asynchronous CLEAR (→0) and SET TO "9" (→9, NINE output HIGH)
//   - STROBE HIGH and INHIBIT IN HIGH blank OUT; CASCADE HIGH forces OUT HIGH
//   - INHIBIT/CARRY OUT goes LOW at the count-9 terminal state
//
// Method: place ONE CD4527 and keep the same chip + sim instance across the run
// so the decade counter state persists. Re-wire all inputs each solve.
//
// Run:  node js/debug/scenarios/cd4527-bcd-rate-mult.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4527');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Mutable input state. Defaults: single-chip config (all controls inactive LOW).
const st = { clk: 0, clr: 0, set9: 0, str: 0, inh: 0, cas: 0, a: 0, b: 0, c: 0, d: 0 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, level) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4527 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), level ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK',   st.clk);
  wirePin('CLEAR',   st.clr);
  wirePin('SET9',    st.set9);
  wirePin('STROBE',  st.str);
  wirePin('INHIBIT', st.inh);
  wirePin('CASCADE', st.cas);
  wirePin('A', st.a);
  wirePin('B', st.b);
  wirePin('C', st.c);
  wirePin('D', st.d);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Force the internal counter to a known state (0) via the async CLEAR.
function clearCounter() {
  st.clr = 1; st.clk = 0; solve();
  st.clr = 0; solve();
}

// Set the rate inputs from a 4-bit value (A = LSB … D = MSB).
function setRate(n) {
  st.a = n & 1; st.b = (n >> 1) & 1; st.c = (n >> 2) & 1; st.d = (n >> 3) & 1;
}

// Apply 10 clock pulses; count how many output periods had OUT HIGH while CLK HIGH.
function countOutPulses() {
  let pulses = 0;
  for (let i = 0; i < 10; i++) {
    st.clk = 1; solve();
    if (bit('OUT')) pulses++;
    st.clk = 0; solve();
  }
  return pulses;
}

// 1) Truth-table pulse count for every 4-bit input code (datasheet page 6).
//    valid BCD 0-9 → N pulses; invalid 10-15 → 8 (A=0) or 9 (A=1).
const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 9, 8, 9, 8, 9];
for (let n = 0; n < 16; n++) {
  clearCounter();
  setRate(n);
  const got = countOutPulses();
  assert(got === expected[n],
    `code ${n} (DCBA=${(n>>3)&1}${(n>>2)&1}${(n>>1)&1}${n&1}): expected ${expected[n]} OUT pulses/10, got ${got}`);
}

// 2) OUTn is the complement of OUT (check across a full cycle at N=5).
clearCounter();
setRate(5);
let mismatched = 0;
for (let i = 0; i < 10; i++) {
  st.clk = 1; solve();
  if (bit('OUT') === bit('OUTn')) mismatched++;
  st.clk = 0; solve();
  if (bit('OUT') === bit('OUTn')) mismatched++;
}
assert(mismatched === 0, `OUTn should always be the inverse of OUT (got ${mismatched} mismatches)`);

// 3) STROBE HIGH blanks OUT (truth table: STR=1 → OUT=L).
clearCounter();
setRate(9);               // a high rate so OUT would otherwise pulse a lot
st.str = 1;
assert(countOutPulses() === 0, 'STROBE HIGH should blank OUT (0 pulses)');
st.str = 0;

// 4) INHIBIT IN HIGH blanks OUT and forces INHIBIT/CARRY OUT HIGH.
clearCounter();
setRate(9);
st.inh = 1;
const inhPulses = countOutPulses();
assert(inhPulses === 0, `INHIBIT IN HIGH should blank OUT (got ${inhPulses})`);
st.clk = 1; solve();
assert(bit('CARRYOUT') === 1, 'INHIBIT IN HIGH should force INHIBIT/CARRY OUT HIGH');
st.inh = 0; st.clk = 0; solve();

// 5) CASCADE HIGH forces OUT HIGH (truth table: CAS=1 → OUT=H).
clearCounter();
setRate(0);               // rate 0 → no pulses normally
st.cas = 1;
st.clk = 1; solve();
assert(bit('OUT') === 1, 'CASCADE HIGH should force OUT HIGH');
st.cas = 0; st.clk = 0; solve();

// 6) CLEAR holds the counter at 0: NINE LOW, no output pulses.
clearCounter();
setRate(9);
st.clr = 1;
assert(countOutPulses() === 0, 'CLEAR HIGH should hold count 0 and blank OUT');
st.clk = 1; solve();
assert(bit('NINE') === 0, 'CLEAR HIGH: "9" OUT should be LOW (count 0)');
st.clr = 0; st.clk = 0; solve();

// 7) SET TO "9" presets the counter to 9: NINE HIGH, CARRY OUT LOW, OUT blanked.
clearCounter();
setRate(5);
st.set9 = 1;
st.clk = 0; solve();
assert(bit('NINE') === 1, 'SET TO "9" should drive "9" OUT HIGH');
assert(bit('CARRYOUT') === 0, 'SET TO "9" (count 9) should drive INHIBIT/CARRY OUT LOW');
assert(bit('OUT') === 0, 'SET TO "9" should blank OUT');
st.set9 = 0; solve();

// 8) Carry pulse: across a normal decade, INHIBIT/CARRY OUT is LOW only at count 9.
clearCounter();
setRate(0);
let carryLowCount = 0;
for (let i = 0; i < 10; i++) {
  st.clk = 1; solve();
  if (bit('CARRYOUT') === 0) carryLowCount++;
  st.clk = 0; solve();
}
assert(carryLowCount === 1, `INHIBIT/CARRY OUT should go LOW exactly once per 10 clocks (count 9); got ${carryLowCount}`);

if (failures.length) {
  console.error(`CD4527 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD4527 BCD rate multiplier: all checks passed');
