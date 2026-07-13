// ── 74x927 (MM74C927) 4-digit timer counter / display driver regression ──────
// The 74x927 (js/chips/chips44.js) is the timer member of the MM74C925/6/7/8
// family. It uses the dedicated COUNTER_DISPLAY_4DIGIT_927 engine primitive: it
// is the '926 except the second-most-significant digit divides by 6 instead of
// 10, so at 10 Hz the four digits read minutes:seconds.tenths up to 9:59.9.
//
// This scenario guards the DB entry + primitive against the verified National
// Semiconductor / Fairchild DS005919 datasheet:
//   - verified 18-pin map (segments a–g, D1=A_OUT … D4=D_OUT, CLK, RST, LE, DS, CO)
//   - counter advances on the CLOCK FALLING edge
//   - RST asynchronous, active HIGH → count 0, carry-out LOW
//   - mixed radix: D1 ÷10, D2 ÷10, D3 ÷6 (0–5 only), D4 ÷10; wraps after 9:59.9
//   - LATCH ENABLE HIGH = flow-through, LOW = hold; DISPLAY SELECT HIGH = counter,
//     LOW = latched value
//   - CARRY-OUT HIGH from display 6:00.0 (count 3600) and back LOW at the
//     9:59.9 → 0:00.0 rollover (a cascade level, not a latched overflow)
//
// The display is time-multiplexed: each engine evaluate drives ONE digit (the D1–
// D4 line that is HIGH) and its a–g segments. We read the full reading by solving
// repeatedly (clock held, so the count is frozen) until all four digit positions
// have been seen, decoding each digit's segments back through the 7-seg table.
//
// Run:  node js/debug/scenarios/74x927-timer-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { BCD_7SEG_CC_TABLE } from '../../chips.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

// Reverse map: active-HIGH a–g pattern → decimal digit.
const segKey = (bits) => bits.join('');
const SEG_TO_DIGIT = new Map(
  BCD_7SEG_CC_TABLE.map((row, d) => [segKey(row.slice(4, 11)), d]),
);

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x927');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const st = { clk: 0, rst: 0, le: 1, ds: 1 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x927 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk ? 1 : 0);
  wirePin('RST', st.rst ? 1 : 0);
  wirePin('LE',  st.le  ? 1 : 0);
  wirePin('DS',  st.ds  ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// Decode the segment lines for whichever digit is currently driven.
function decodeActiveSeg() {
  const bits = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((s) => (isHigh(read(s)) ? 1 : 0));
  const d = SEG_TO_DIGIT.get(segKey(bits));
  return d === undefined ? -1 : d;
}

// Read the full 4-digit reading as [D1,D2,D3,D4] = [tenths, sec-units, sec-tens, min].
// Solve repeatedly with the clock unchanged (count frozen) until each of the four
// digit-select lines D1–D4 has been the active one at least once.
function readDigits() {
  const digits = [null, null, null, null];
  for (let i = 0; i < 16 && digits.includes(null); i++) {
    solve();
    for (let k = 0; k < 4; k++) {
      if (isHigh(read('D' + (k + 1)))) digits[k] = decodeActiveSeg();
    }
  }
  return digits;
}

function pulse() {
  st.clk = 1; solve();
  st.clk = 0; solve();
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const eqDigits = (got, want) => got.length === 4 && want.every((v, i) => got[i] === v);

// Expected display digits for an internal count.
function expect(count) {
  return [count % 10, Math.floor(count / 10) % 10,
          Math.floor(count / 100) % 6, Math.floor(count / 600) % 10];
}

// ── 0. Async reset → 0:00.0, carry LOW ───────────────────────────────────────
st.rst = 1; solve();
assert(eqDigits(readDigits(), [0, 0, 0, 0]), 'reset: display should read 0:00.0');
assert(!isHigh(read('CO')), 'reset: carry-out should be LOW');
st.rst = 0; solve();

// ── 1. Counts on the FALLING clock edge ──────────────────────────────────────
st.clk = 1; solve();                 // rising edge: must NOT count
assert(eqDigits(readDigits(), [0, 0, 0, 0]), 'rising edge should not advance count');
st.clk = 0; solve();                 // falling edge: count → 1
assert(eqDigits(readDigits(), [1, 0, 0, 0]), 'falling edge should advance to tenths=1');

// continue to a known value: 5 pulses already at 1, add 4 → count 5
for (let i = 0; i < 4; i++) pulse();
assert(eqDigits(readDigits(), [5, 0, 0, 0]), 'count 5 → display 0:00.5');

// ── 2. LATCH ENABLE freeze + DISPLAY SELECT source ───────────────────────────
st.le = 0; solve();                  // freeze latch at current count (5)
for (let i = 0; i < 3; i++) pulse(); // counter now 8, latch still 5
st.ds = 0;                           // show the latch
assert(eqDigits(readDigits(), [5, 0, 0, 0]), 'DS LOW shows frozen latch (0:00.5)');
st.ds = 1;                           // show the live counter
assert(eqDigits(readDigits(), [8, 0, 0, 0]), 'DS HIGH shows live counter (0:00.8)');
st.le = 1; solve();                  // re-open latch
assert(eqDigits(readDigits(), [8, 0, 0, 0]), 'LE HIGH flow-through tracks counter');

// ── 3. Full count sweep: ÷6 digit, carry-out, and the 9:59.9 rollover ─────────
st.rst = 1; solve(); st.rst = 0; solve();   // back to 0
for (let i = 1; i <= 6000; i++) {
  pulse();
  const count = i % 6000;
  // Carry-out is a level: HIGH for the upper part of the cycle (count >= 3600 =
  // display 6:00.0), LOW otherwise; falling edge at the rollover.
  const coWant = count >= 3600 ? 1 : 0;
  if ((isHigh(read('CO')) ? 1 : 0) !== coWant) {
    assert(false, `carry-out at count ${count}: want ${coWant}`);
    break;
  }
  // Spot-check the displayed digits at the interesting boundaries.
  if (count === 599 || count === 600 || count === 3599 || count === 3600 ||
      count === 5999 || count === 0) {
    const got = readDigits();
    assert(eqDigits(got, expect(count)),
      `display at count ${count}: want [${expect(count)}], got [${got}]`);
  }
}

if (failures.length) {
  console.error('74x927 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x927 4-digit timer counter/display driver: all checks passed');
