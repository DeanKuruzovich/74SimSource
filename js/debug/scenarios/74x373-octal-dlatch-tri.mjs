// ── 74x373 octal D transparent latch (tri-state) regression ──────────────────
// The 74x373 (js/chips/chips6.js) is eight transparent D latches on one common
// enable (LE, printed C on the datasheet) with an active-LOW 3-state output
// enable (OE, printed OC). It rides the D_LATCH_OCTAL_TRI engine primitive.
//
// This scenario exists mainly to guard a PINOUT FIX (issues.md C96). The hand-
// entered map had 3D/3Q swapped on physical pins 6/7 and 7D/7Q swapped on pins
// 16/17 — the same bug the sibling 74x374 carried (C94). Because
// D_LATCH_OCTAL_TRI keys off pin NAMES, the logic simulated fine under the wrong
// pin numbers, so a logic-only test would NOT have caught it. Section 1 asserts
// the physical pin<->name mapping against the TI datasheet terminal diagram,
// which is what fails on the bug.
//
// Verified against TI SDLS165B (SN74LS373/'S373), terminal diagram (J/W/DW/N/NS
// package, TOP VIEW, p. 1) and 'LS373/'S373 function table (p. 3), read as PDF
// page images. DIP-20 map:
//   OE=1, 1Q=2, 1D=3, 2D=4, 2Q=5, 3Q=6, 3D=7, 4D=8, 4Q=9, GND=10,
//   LE=11, 5Q=12, 5D=13, 6D=14, 6Q=15, 7Q=16, 7D=17, 8D=18, 8Q=19, VCC=20.
//
// D_LATCH_OCTAL_TRI contract (js/specificChipsSim.js):
//   inputs:  [1D..8D, LE, OE]   (LE active HIGH, OE active LOW)
//   outputs: [1Q..8Q]            transparent while LE HIGH, hold while LE LOW
//
// Function table (74LS373/'S373, each latch):
//   OE  LE  D | Q
//    L   H   H | H      (transparent: Q follows D)
//    L   H   L | L
//    L   L   X | hold   (LE low → hold last value)
//    H   X   X | Z      (output disabled, latch state kept)
//
// Run:  node js/debug/scenarios/74x373-octal-dlatch-tri.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x373');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Physical pinout matches the datasheet terminal diagram ─────────────────
// This is the section that catches the C96 swap. Every pin is checked both ways
// (name→number and number→name) so a scrambled map cannot slip through.
const PINMAP = {
  1: 'OE', 2: '1Q', 3: '1D', 4: '2D', 5: '2Q', 6: '3Q', 7: '3D', 8: '4D',
  9: '4Q', 10: 'GND', 11: 'LE', 12: '5Q', 13: '5D', 14: '6D', 15: '6Q',
  16: '7Q', 17: '7D', 18: '8D', 19: '8Q', 20: 'VCC',
};
for (const [numStr, name] of Object.entries(PINMAP)) {
  const num = Number(numStr);
  const byName = chip.getPinByName(name);
  const byNum = chip.getPinByNumber(num);
  assert(byName && byName.pin === num, `pin name ${name} should sit on physical pin ${num}, got ${byName ? byName.pin : 'missing'}`);
  assert(byNum && byNum.name === name, `physical pin ${num} should be named ${name}, got ${byNum ? byNum.name : 'missing'}`);
}

// ── Wiring helper for the logic checks ────────────────────────────────────────
// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Latch state lives on the persistent chip component, not the wires, so a fresh
// WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x373 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OE', st.oe ? 1 : 0);
  wirePin('LE', st.le ? 1 : 0);
  for (let i = 1; i <= 8; i++) wirePin(`${i}D`, st.d[i - 1] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 1; i <= 8; i++) if (isHigh(read(`${i}Q`))) v |= (1 << (i - 1));
  return v;
};
const bin8 = (v) => v.toString(2).padStart(8, '0');

// Full input picture is driven every solve. Defaults: outputs enabled (OE low),
// enable held low (holding).
const st = { oe: 0, le: 0, d: [0, 0, 0, 0, 0, 0, 0, 0] };
const solve = () => apply(st);
function setD(byte) { for (let i = 0; i < 8; i++) st.d[i] = (byte >> i) & 1; }
// Capture a byte, then drop back to hold: present data with LE HIGH (transparent),
// then take LE LOW so the value is frozen.
function latch(byte) {
  setD(byte);
  st.le = 1; solve();   // transparent — outputs follow D
  st.le = 0; solve();   // LE falls — value frozen
}

// ── 2. Transparent: while LE is HIGH, Q follows D with no clock edge ──────────
st.le = 1;
setD(0b10101010); solve();
assert(qbits() === 0b10101010, `transparent 10101010: got ${bin8(qbits())}`);

// Bit 3 (3D/3Q, pins 7/6) and bit 7 (7D/7Q, pins 17/16) specifically — the bits
// whose pins the bug swapped. Drive only those high and confirm they land.
setD(0b01000100); solve();
assert(qbits() === 0b01000100, `transparent bit3+bit7 only: got ${bin8(qbits())}`);

// Outputs keep tracking D while LE stays HIGH (level-sensitive, not edge).
setD(0b11111111); solve();
assert(qbits() === 0b11111111, `transparent all ones: got ${bin8(qbits())}`);
setD(0b00000000); solve();
assert(qbits() === 0, `transparent all zeros: got ${bin8(qbits())}`);
st.le = 0;

// ── 3. Latch/hold: after LE falls, D changes are ignored ──────────────────────
latch(0b00111100);
assert(qbits() === 0b00111100, `latched 00111100: got ${bin8(qbits())}`);
setD(0b11111111); solve();            // change D while LE stays LOW — held
assert(qbits() === 0b00111100, `LE low should hold, got ${bin8(qbits())}`);
st.le = 1; solve();                   // LE HIGH again — transparent, follows new D
assert(qbits() === 0b11111111, `LE high should retrack D, got ${bin8(qbits())}`);
st.le = 0; solve();                   // freeze the new value
assert(qbits() === 0b11111111, `re-latch 11111111: got ${bin8(qbits())}`);

// ── 4. Output enable: OE HIGH → 3-state (not HIGH), latch state preserved ──────
latch(0b01011010);
st.oe = 1; solve();
assert(!isHigh(read('1Q')), `OE high: 1Q should be high-impedance, not HIGH`);
assert(!isHigh(read('8Q')), `OE high: 8Q should be high-impedance, not HIGH`);
// New data can still be latched while the outputs are disconnected (OC does not
// affect internal storage — datasheet note). Latch a new byte with OE still HIGH.
setD(0b00001111);
st.le = 1; solve();
st.le = 0; solve();
st.oe = 0; solve();                   // re-enable outputs, LE stays LOW
assert(qbits() === 0b00001111, `data latched while disabled should appear on enable, got ${bin8(qbits())}`);

if (failures.length) {
  console.error(`74x373: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x373: PASS — datasheet pinout, transparent follow, hold-after-LE-fall, 3-state output all correct');
