// ── 74x374 octal D flip-flop (tri-state) regression ──────────────────────────
// The 74x374 (js/chips/chips6.js) is eight edge-triggered D flip-flops on one
// common clock with an active-LOW 3-state output enable (OE, printed OC on the
// datasheet). It rides the D_FF_OCTAL_TRI engine primitive.
//
// This scenario exists mainly to guard a PINOUT FIX (issues.md C92). The hand-
// entered map had 3D/3Q swapped on physical pins 6/7 and 7D/7Q swapped on pins
// 16/17. Because D_FF_OCTAL_TRI keys off pin NAMES, the logic simulated fine
// under the wrong pin numbers — so a logic-only test would NOT have caught it.
// Section 1 below asserts the physical pin<->name mapping against the TI
// datasheet terminal diagram, which is what fails on the bug.
//
// Verified against TI SDLS165B (SN74LS374/'S374), terminal diagram (J/W/DW/N/NS
// package, TOP VIEW, p. 1) and 'LS374/'S374 function table (p. 3), read as PDF
// page images. DIP-20 map:
//   OE=1, 1Q=2, 1D=3, 2D=4, 2Q=5, 3Q=6, 3D=7, 4D=8, 4Q=9, GND=10,
//   CLK=11, 5Q=12, 5D=13, 6D=14, 6Q=15, 7Q=16, 7D=17, 8D=18, 8Q=19, VCC=20.
//
// D_FF_OCTAL_TRI contract (js/specificChipsSim.js):
//   inputs:  [1D..8D, CLK, OE]   (OE active LOW)
//   outputs: [1Q..8Q]            rising-edge capture, Q = D
//
// Function table (74LS374/'S374, each flip-flop):
//   OE  CLK  D | Q
//    L   ↑   H | H      (load D on the LOW-to-HIGH edge)
//    L   ↑   L | L
//    L  H/L  X | hold   (no rising edge → hold)
//    H   X   X | Z      (output disabled, FF state kept)
//
// Run:  node js/debug/scenarios/74x374-octal-dff-tri.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x374');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Physical pinout matches the datasheet terminal diagram ─────────────────
// This is the section that catches the C92 swap. Every pin is checked both ways
// (name→number and number→name) so a scrambled map cannot slip through.
const PINMAP = {
  1: 'OE', 2: '1Q', 3: '1D', 4: '2D', 5: '2Q', 6: '3Q', 7: '3D', 8: '4D',
  9: '4Q', 10: 'GND', 11: 'CLK', 12: '5Q', 13: '5D', 14: '6D', 15: '6Q',
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
// Register state lives on the persistent chip component, not the wires, so a
// fresh WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x374 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OE', st.oe ? 1 : 0);
  wirePin('CLK', st.clk ? 1 : 0);
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
// clock low.
const st = { oe: 0, clk: 0, d: [0, 0, 0, 0, 0, 0, 0, 0] };
const solve = () => apply(st);
function setD(byte) { for (let i = 0; i < 8; i++) st.d[i] = (byte >> i) & 1; }
function load(byte) {
  setD(byte);
  st.clk = 0; solve();   // present data, clock low
  st.clk = 1; solve();   // rising edge captures all eight bits
}

// ── 2. Non-inverting parallel load on the rising edge (Q = D) ─────────────────
load(0b10101010);
assert(qbits() === 0b10101010, `load 10101010: got ${bin8(qbits())}`);

// Bit 3 (3D/3Q, pins 7/6) and bit 7 (7D/7Q, pins 17/16) specifically — the bits
// whose pins the bug swapped. Drive only those high and confirm they land.
load(0b01000100);
assert(qbits() === 0b01000100, `load bit3+bit7 only: got ${bin8(qbits())}`);

load(0b11111111);
assert(qbits() === 0b11111111, `load all ones: got ${bin8(qbits())}`);
load(0b00000000);
assert(qbits() === 0, `load all zeros: got ${bin8(qbits())}`);

// ── 3. Hold between edges: no rising edge → outputs unchanged ──────────────────
load(0b00111100);
assert(qbits() === 0b00111100, `preload: got ${bin8(qbits())}`);
setD(0b11111111);
solve();                 // change D while clock stays high — no edge
assert(qbits() === 0b00111100, `no edge should hold, got ${bin8(qbits())}`);
st.clk = 0; solve();     // clock falls — still no rising edge
assert(qbits() === 0b00111100, `falling edge should hold, got ${bin8(qbits())}`);
st.clk = 1; solve();     // now a genuine rising edge loads the new data
assert(qbits() === 0b11111111, `rising edge reload: got ${bin8(qbits())}`);

// ── 4. Output enable: OE HIGH → 3-state (not HIGH), state preserved ───────────
st.oe = 1; solve();
assert(!isHigh(read('1Q')), `OE high: 1Q should be high-impedance, not HIGH`);
assert(!isHigh(read('8Q')), `OE high: 8Q should be high-impedance, not HIGH`);
// New data can still be clocked in while the outputs are disconnected (OC does
// not affect internal storage — datasheet note).
setD(0b00001111);
st.clk = 0; solve();
st.clk = 1; solve();     // rising edge loads new byte while outputs are off
st.oe = 0; solve();      // re-enable outputs, no further clock edge
assert(qbits() === 0b00001111, `data clocked while disabled should appear on enable, got ${bin8(qbits())}`);

if (failures.length) {
  console.error(`74x374: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x374: PASS — datasheet pinout, rising-edge load, hold-between-edges, 3-state output all correct');
