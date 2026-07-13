// ── 74x150 16-to-1 data selector/mux (inverted output) — regression ─────────
// The 74x150 (js/chips/chips5.js) is primitive-backed by one MUX_16TO1 gate
// (inputs [E0..E15, A, B, C, D, G], output [W]). Guards the DIP-24 pin map and
// function table, verified vs TI SDLS054 (SN74150, J/N/W-package Terminal
// Assignment + '150 FUNCTION TABLE, pages 1-2, read as rendered PDF page
// images — issues.md C4):
//   E7=1 E6=2 E5=3 E4=4 E3=5 E2=6 E1=7 E0=8 G#=9 W=10 D=11 GND=12
//   C=13 B=14 A=15 E15=16 E14=17 E13=18 E12=19 E11=20 E10=21 E9=22 E8=23 VCC=24
// Function table (D C B A select E0..E15; strobe G# active LOW):
//
//   STROBE G# | select D,C,B,A | W
//        1    |      X         | 1   (output forced HIGH, data ignored)
//        0    |    address n   | NOT(En)   (complement of the selected input)
//
// Two specifics this locks in: A is the LSB and D the MSB of the address, and
// the 74x150 has ONLY the inverted W output (no true output pin, unlike '151).
//
// Run:  node js/debug/scenarios/74x150-16to1-mux.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x150');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const E = Array.from({ length: 16 }, (_, i) => `E${i}`);

// Drive the 16 data bits, the 4 select bits (addr), and strobe G#; then solve.
function apply(dataBits, addr, g) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x150 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 16; i++) wirePin(E[i], dataBits[i]);
  wirePin('A', (addr >> 0) & 1); // A = LSB
  wirePin('B', (addr >> 1) & 1);
  wirePin('C', (addr >> 2) & 1);
  wirePin('D', (addr >> 3) & 1); // D = MSB
  wirePin('G', g);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const outBit = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Enabled (G#=0): W = NOT(selected input), and ONLY the selected input ──
// For each address n: drive En to a known value and every OTHER input to the
// opposite. If any other input leaked, or the address order were wrong, W flips.
for (let addr = 0; addr < 16; addr++) {
  // selected HIGH, all others LOW → W must be NOT(1) = 0
  let bits = Array.from({ length: 16 }, (_, i) => (i === addr ? 1 : 0));
  apply(bits, addr, 0);
  assert(outBit('W') === 0,
    `G#=0 addr=${addr}: E${addr}=1, others=0 → W expected 0 (=NOT E${addr}), got ${outBit('W')}`);

  // selected LOW, all others HIGH → W must be NOT(0) = 1
  bits = Array.from({ length: 16 }, (_, i) => (i === addr ? 0 : 1));
  apply(bits, addr, 0);
  assert(outBit('W') === 1,
    `G#=0 addr=${addr}: E${addr}=0, others=1 → W expected 1 (=NOT E${addr}), got ${outBit('W')}`);
}

// ── 2. Strobe G#=1 → W forced HIGH regardless of data/address ────────────────
// Pick E[addr]=1 (enabled would give W=0) so the forced-HIGH is unambiguous.
for (let addr = 0; addr < 16; addr++) {
  const bits = Array.from({ length: 16 }, (_, i) => (i === addr ? 1 : 0));
  apply(bits, addr, 1);
  assert(outBit('W') === 1, `G#=1 addr=${addr}: W must be forced HIGH, got ${outBit('W')}`);
}

// ── 3. Address order sanity: A=LSB, D=MSB (address 0b1000 selects E8) ─────────
// Only E8 HIGH; addr=8 (D=1, others 0) must route it → W=0. addr=1 (A=1) must
// route E1 (which is 0) → W=1. Catches an A/D swap.
{
  const only8 = Array.from({ length: 16 }, (_, i) => (i === 8 ? 1 : 0));
  apply(only8, 8, 0);
  assert(outBit('W') === 0, `addr=8 should select E8(=1) → W=0, got ${outBit('W')}`);
  apply(only8, 1, 0);
  assert(outBit('W') === 1, `addr=1 should select E1(=0) → W=1, got ${outBit('W')}`);
}

if (failures.length) {
  console.error(`74x150 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x150 16-to-1 mux: all checks passed');
