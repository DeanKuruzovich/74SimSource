// ── 74x595 8-bit shift register + output latch regression ────────────────────
// The 74x595 (js/chips/chips6.js) is the behavioral coverage of the
// SHIFT_REG_LATCH primitive against the VERIFIED pinout/function table (TI
// SN74HC595 SCLS041J, Table 5-1 + Table 8-1, and SN74LS595 SDLS006 p.1 — read
// as PDF page images, issues.md C4). It guards:
//   • serial shift: SER sampled on the SRCLK rising edge; the first bit lands on
//     the QA-end stage and walks toward QH on later edges;
//   • the two-clock split: shifting with SRCLK does NOT move QA-QH until an RCLK
//     rising edge copies the shift register into the output latch;
//   • SRCLR (active LOW): async-clears the SHIFT register only, leaving the
//     output latch untouched;
//   • OE (active LOW): OE HIGH puts QA-QH in Hi-Z, but QHs (the serial cascade
//     output = last shift stage) stays driven and is never gated by OE.
//
// Run:  node js/debug/scenarios/74x595-shift-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x595');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC row, 0 =
// GND row). The shift/latch state lives on the persistent chip component, so a
// fresh WireManager each call is fine. Note OE and SRCLR are ACTIVE LOW.
function apply({ ser, srclk, rclk, srclr, oe }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x595 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('SER',   ser   ? 1 : 0);
  wirePin('SRCLK', srclk ? 1 : 0);
  wirePin('RCLK',  rclk  ? 1 : 0);
  wirePin('SRCLR', srclr ? 1 : 0);
  wirePin('OE',    oe    ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
// QA = bit0 (LSB), QH = bit7 (MSB). Return QH..QA as an 8-char string so a lone
// 1 at the MSB reads "10000000".
const par = () => ['H','G','F','E','D','C','B','A']
  .map(x => (isHigh(read(`Q${x}`)) ? 1 : 0)).join('');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Current input state. SRCLR HIGH = not clearing; OE LOW = outputs enabled.
const st = { ser: 0, srclk: 0, rclk: 0, srclr: 1, oe: 0 };
const solve = () => apply(st);

function shift(bit) {          // one SER bit: rising then falling SRCLK edge
  st.ser = bit ? 1 : 0;
  st.srclk = 0; solve();
  st.srclk = 1; solve();       // rising edge → SER into first (QA-end) stage
  st.srclk = 0; solve();
}
function latch() {             // rising then falling RCLK edge → publish to QA-QH
  st.rclk = 0; solve();
  st.rclk = 1; solve();
  st.rclk = 0; solve();
}
function clearShiftReg() {     // pulse SRCLR LOW (async clear of the shift reg)
  st.srclr = 0; solve();
  st.srclr = 1; solve();
}

// ── 0. Clear the shift register, then latch → outputs all 0 ───────────────────
clearShiftReg();
latch();
assert(par() === '00000000', `clear+latch: outputs should be 0, got ${par()}`);

// ── 1. Two-clock split: shifting alone must NOT move the outputs ──────────────
shift(1);
assert(par() === '00000000', `SRCLK without RCLK must not change outputs, got ${par()}`);
assert(!isHigh(read('QHs')), `the 1 is at the QA end, so QHs (last stage) is still 0`);
latch();
assert(par() === '00000001', `after RCLK the LSB (QA) should be 1, got ${par()}`);

// ── 2. Walk the lone 1 up to QH and confirm QHs picks it up ───────────────────
for (let i = 0; i < 7; i++) shift(0);  // stage0 → stage7
assert(isHigh(read('QHs')), `QHs should be HIGH when the 1 reaches the last stage`);
latch();
assert(par() === '10000000', `bit should reach QH (MSB) after 8 shifts, got ${par()}`);

// ── 3. OE (active LOW): HIGH tri-states QA-QH, but QHs stays driven ───────────
st.oe = 1; solve();
assert(!isHigh(read('QH')), `OE HIGH must make QH Hi-Z (not driven HIGH), got ${read('QH')}`);
assert(isHigh(read('QHs')), `QHs must stay driven regardless of OE`);
st.oe = 0; solve();
assert(isHigh(read('QH')), `OE LOW must restore QH HIGH, got ${read('QH')}`);

// ── 4. SRCLR clears the SHIFT register only — the output latch is preserved ───
assert(par() === '10000000', `precondition: latch holds 10000000, got ${par()}`);
clearShiftReg();
assert(par() === '10000000', `SRCLR must NOT change the output latch, got ${par()}`);
assert(!isHigh(read('QHs')), `SRCLR must clear the shift register (QHs → 0)`);
latch();
assert(par() === '00000000', `latching the cleared shift reg blanks the outputs, got ${par()}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error('74x595 FAIL:');
  for (const f of failures) console.error('  • ' + f);
  process.exit(1);
}
console.log('74x595 shift register + output latch: all checks passed.');
