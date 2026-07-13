// ── 74x273 octal D flip-flop with clear — regression ─────────────────────────
// The 74x273 (js/chips/chips6.js) is eight positive-edge-triggered D flip-flops
// on one common clock (pin 11) with a direct (asynchronous), active-LOW clear
// (CLR, pin 1). Single-rail outputs (Q only, no Q-bar) and NO output enable, so
// it always drives — the tri-state 74x374 is its output-enabled cousin. It rides
// the D_FF_OCTAL engine primitive.
//
// This scenario exists mainly to guard a PINOUT FIX (issues.md C97). The hand-
// entered map had 3D/3Q swapped on physical pins 6/7 and 7D/7Q swapped on pins
// 16/17 — the identical bug the siblings 74x374 (C94) and 74x373 (C96) carried.
// Because D_FF_OCTAL keys off pin NAMES, the logic simulated fine under the wrong
// pin numbers — so a logic-only test would NOT have caught it. Section 1 asserts
// the physical pin<->name mapping against the TI datasheet terminal diagram,
// which is what fails on the bug.
//
// Verified against TI SDLS090 (SN74273/'LS273), terminal diagram (J/W/N/DW
// package, TOP VIEW, p. 1), function table (each flip-flop, p. 1), and logic
// diagram with explicit pin numbers (p. 2), read as PDF page images. DIP-20 map:
//   CLR=1, 1Q=2, 1D=3, 2D=4, 2Q=5, 3Q=6, 3D=7, 4D=8, 4Q=9, GND=10,
//   CLK=11, 5Q=12, 5D=13, 6D=14, 6Q=15, 7Q=16, 7D=17, 8D=18, 8Q=19, VCC=20.
//
// D_FF_OCTAL contract (js/specificChipsSim.js):
//   inputs:  [1D..8D, CLK, CLR]   (CLR active LOW, asynchronous)
//   outputs: [1Q..8Q]             rising-edge capture, Q = D
//
// Function table (74273/'LS273, each flip-flop):
//   CLR  CLK  D | Q
//    L    X   X | L      (direct clear — every output forced LOW, no clock)
//    H    ↑   H | H      (load D on the LOW-to-HIGH edge)
//    H    ↑   L | L
//    H    L   X | hold   (no rising edge → hold)
//
// Run:  node js/debug/scenarios/74x273-octal-dff-clr.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x273');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Physical pinout matches the datasheet terminal diagram ─────────────────
// This is the section that catches the C97 swap. Every pin is checked both ways
// (name→number and number→name) so a scrambled map cannot slip through.
const PINMAP = {
  1: 'CLR', 2: '1Q', 3: '1D', 4: '2D', 5: '2Q', 6: '3Q', 7: '3D', 8: '4D',
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
// fresh WireManager per solve is fine. CLR defaults HIGH (clear inactive).
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x273 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLR', st.clr ? 1 : 0);
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

// Full input picture is driven every solve. Defaults: clear inactive (CLR high),
// clock low.
const st = { clr: 1, clk: 0, d: [0, 0, 0, 0, 0, 0, 0, 0] };
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

// ── 4. Asynchronous clear: CLR LOW forces all outputs to 0, no clock needed ────
load(0b11111111);
assert(qbits() === 0b11111111, `preload ones before clear: got ${bin8(qbits())}`);
st.clr = 0; solve();     // assert clear with the clock sitting still (no edge)
assert(qbits() === 0, `CLR low should force all outputs LOW without a clock edge, got ${bin8(qbits())}`);
// While CLR is held LOW the outputs stay 0 even if D is driven and the clock
// pulses — the direct clear overrides the clocked load.
setD(0b11111111);
st.clk = 0; solve();
st.clk = 1; solve();     // rising edge, but CLR still asserted
assert(qbits() === 0, `clock edge while CLR low must not load data, got ${bin8(qbits())}`);

// ── 5. Release clear, then load again ─────────────────────────────────────────
st.clr = 1;              // deassert clear
st.clk = 0; solve();     // outputs still 0 (clear left them there); no edge yet
assert(qbits() === 0, `after releasing CLR with no edge, outputs hold at 0, got ${bin8(qbits())}`);
load(0b01011010);        // now a real edge loads normally
assert(qbits() === 0b01011010, `load after clear release: got ${bin8(qbits())}`);

if (failures.length) {
  console.error(`74x273: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x273: PASS — datasheet pinout, rising-edge load, hold-between-edges, async active-LOW clear all correct');
