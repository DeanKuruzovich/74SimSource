// ── 74x928 (MM74C928) 4-digit (3½-digit) counter + multiplexed display driver ─
// The 74x928 (js/chips/chips44.js) is the CMOS 4-digit counter with an internal
// output latch and NPN sourcing drivers for a multiplexed common-cathode
// 7-segment display. It drives the dedicated COUNTER_DISPLAY_4DIGIT_928 engine
// primitive (js/specificChipsSim.js).
//
// Behaviour verified against Fairchild/National DS005919 (MM74C925/6/7/8),
// rev. Jan 1999, read as 300-dpi PDF page images (issues.md C4):
//   • Counter advances on the NEGATIVE (HIGH→LOW) clock edge.
//   • RESET is asynchronous and active HIGH → count 0, carry/overflow cleared.
//   • LATCH ENABLE HIGH = output latch is transparent (flow-through);
//     LATCH ENABLE LOW = latch holds its last value while the counter runs on.
//   • DISPLAY SELECT HIGH = segments show the live counter;
//     DISPLAY SELECT LOW = segments show the latched value.
//   • The '928 most-significant digit divides by 2, so the reading is 0000-1999.
//     CARRY-OUT is an OVERFLOW flag: HIGH when the count rolls past 1999, and it
//     stays HIGH until RESET (unlike the '926 carry pulse).
//   • Segments a-g are shared by all four digits; D1-D4 are one-hot digit-select
//     (scan) outputs, one active at a time. The scan is driven by the engine's
//     per-evaluate tick standing in for the part's internal (pinless) oscillator.
//
// Method: one chip + one sim instance kept across the whole run so the counter,
// latch and overflow state persist. A fresh WireManager each solve is fine.
// Reading the display means scanning four evaluates (one per digit) and decoding
// each lit digit back to a number.
//
// Run:  node js/debug/scenarios/74x928-counter-display-driver.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { BCD_7SEG_CC_TABLE } from '../../chips.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x928');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Idle defaults: not reset, latch transparent, display = live counter, clock low.
const st = { CLK: 0, RST: 0, LE: 1, DS: 1 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x928 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.CLK);
  wirePin('RST', st.RST);
  wirePin('LE',  st.LE);
  wirePin('DS',  st.DS);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// Reverse 7-segment (active-HIGH common-cathode) decode: segment pattern → digit.
const segKey = (arr) => arr.join('');
const SEG_TO_DIGIT = new Map(
  BCD_7SEG_CC_TABLE.map((row, d) => [segKey(row.slice(4, 11)), d])
);

// Scan all four digit positions and assemble the displayed number.
// Each evaluate lights exactly one digit (D1=units … D4=thousands); four
// consecutive evaluates with the clock held steady cover all four without
// advancing the counter.
function readDisplay() {
  const digits = { D1: null, D2: null, D3: null, D4: null };
  for (let i = 0; i < 4; i++) {
    solve();
    const sel = ['D1', 'D2', 'D3', 'D4'].filter((d) => isHigh(read(d)));
    if (sel.length !== 1) throw new Error(`digit-select not one-hot: [${sel}]`);
    const seg = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((s) => (isHigh(read(s)) ? 1 : 0));
    const digit = SEG_TO_DIGIT.get(segKey(seg));
    if (digit === undefined) throw new Error(`segments ${seg.join('')} decode to no digit`);
    digits[sel[0]] = digit;
  }
  for (const k of ['D1', 'D2', 'D3', 'D4']) {
    if (digits[k] === null) throw new Error(`digit ${k} never scanned`);
  }
  return digits.D1 + 10 * digits.D2 + 100 * digits.D3 + 1000 * digits.D4;
}

const co = () => (isHigh(read('CO')) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One counter advance = a full clock cycle; the count happens on the falling edge.
function pulse(n = 1) {
  for (let i = 0; i < n; i++) {
    st.CLK = 1; solve();   // rising edge: no count
    st.CLK = 0; solve();   // falling edge: count++
  }
}

// ── 0. Asynchronous active-HIGH RESET → 0000, overflow clear ─────────────────
st.RST = 1; solve();
assert(readDisplay() === 0, `reset: expected display 0, got ${readDisplay()}`);
assert(co() === 0, `reset clears overflow, got CO=${co()}`);
st.RST = 0; solve();

// ── 1. Negative-edge clock advances the counter ──────────────────────────────
pulse(7);
assert(readDisplay() === 7, `7 pulses: expected 7, got ${readDisplay()}`);
// Rising edge alone must NOT count.
st.CLK = 1; solve();
assert(readDisplay() === 7, `rising edge must not count, got ${readDisplay()}`);
st.CLK = 0; solve();
assert(readDisplay() === 8, `falling edge counts, got ${readDisplay()}`);

// ── 2. Multi-digit value, verifies the a-g / D1-D4 multiplex decode ──────────
pulse(234);                       // 8 + 234 = 242
assert(readDisplay() === 242, `expected 242, got ${readDisplay()}`);

// ── 3. Output latch: LE LOW freezes the display, counter keeps running ───────
const frozen = readDisplay();     // 242
st.LE = 0; solve();               // latch holds
st.DS = 0; solve();               // show the latched value
pulse(10);                        // counter advances to 252 underneath
assert(readDisplay() === frozen, `LE low must freeze display at ${frozen}, got ${readDisplay()}`);
// DISPLAY SELECT HIGH reveals the live counter even while the latch is held.
st.DS = 1; solve();
assert(readDisplay() === 252, `DS high shows live counter 252, got ${readDisplay()}`);
// Re-opening the latch (LE HIGH) captures the current count.
st.LE = 1; solve();
st.DS = 0; solve();
assert(readDisplay() === 252, `LE high re-captures latch to 252, got ${readDisplay()}`);
st.LE = 1; st.DS = 1; solve();

// ── 4. Overflow at 2000: CARRY-OUT latches HIGH and the count wraps to 0 ─────
st.RST = 1; solve(); st.RST = 0; solve();
pulse(1999);
assert(readDisplay() === 1999, `expected max reading 1999, got ${readDisplay()}`);
assert(co() === 0, `CO low at 1999, got ${co()}`);
pulse(1);                         // 1999 → roll over past 1999
assert(readDisplay() === 0, `display wraps to 0 after overflow, got ${readDisplay()}`);
assert(co() === 1, `CO HIGH on overflow, got ${co()}`);
pulse(5);                         // CO stays HIGH while counting continues
assert(co() === 1, `CO stays HIGH after overflow until reset, got ${co()}`);
assert(readDisplay() === 5, `counter keeps running after overflow, got ${readDisplay()}`);
st.RST = 1; solve(); st.RST = 0; solve();
assert(co() === 0, `RESET clears overflow flag, got ${co()}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`FAIL 74x928: ${failures.length} assertion(s) failed:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('PASS 74x928: counter, negative-edge clock, latch + display-select, '
  + 'multiplexed a-g/D1-D4 decode, and 1999 overflow carry all verified.');
