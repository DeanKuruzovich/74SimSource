// ── 74x42 BCD-to-decimal (1-of-10) decoder — regression ──────────────────────
// The 74x42 (js/chips/chips2.js) reads a 4-bit BCD code on A/B/C/D (A=LSB weight 1,
// D=MSB weight 8) and pulls exactly ONE of ten ACTIVE-LOW outputs LOW. It reuses the
// BCD_DECIMAL primitive. Pinout + behavior verified against TI SDLS109
// (SN5442A/SN54LS42/SN7442A/SN74LS42), terminal diagram p. 1 + FUNCTION TABLE p. 4,
// read as rendered PDF page images:
//   inputs  A=15 (LSB), B=14, C=13, D=12 (MSB)
//   outputs 0-6 on pins 1-7, 7-9 on pins 9-11 (named Y0..Y9)
//   power   GND=8, VCC=16
//
// Method: place ONE 74x42 (purely combinational — no sequential state) and drive
// A/B/C/D to each 4-bit code by wiring each input to the VCC or GND rail. Outputs
// are read straight off the pins by name ('Y0'..'Y9').
//
// Checks:
//   • codes 0..9  → exactly the matching Yn LOW, all others HIGH (active LOW)
//   • codes 10..15 → every output HIGH (invalid BCD leaves nothing active)
//   • 3-to-8 mode: D=0, sweep A/B/C 0..7 → Y0..Y7 one selected LOW, Y8/Y9 HIGH
//
// Run:  node js/debug/scenarios/74x42-bcd-decimal.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x42');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the 4-bit code on A(LSB) B C D(MSB); re-solve combinationally.
function apply(code) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x42 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('A', (code >> 0) & 1);
  wirePin('B', (code >> 1) & 1);
  wirePin('C', (code >> 2) & 1);
  wirePin('D', (code >> 3) & 1);
  sim.evaluate(world, [chip], wm);
}

const OUTS = ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9'];
const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const lowOuts = () => OUTS.filter(o => !isHigh(read(o)));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Valid BCD 0..9 → exactly the matching Yn LOW (active LOW) ──────────────
for (let n = 0; n <= 9; n++) {
  apply(n);
  const low = lowOuts();
  assert(low.length === 1 && low[0] === `Y${n}`,
    `code ${n}: expected only Y${n} LOW, got low=[${low.join(',')}]`);
}

// ── 2. Invalid BCD 10..15 → every output HIGH ────────────────────────────────
for (let n = 10; n <= 15; n++) {
  apply(n);
  const low = lowOuts();
  assert(low.length === 0,
    `code ${n}: invalid BCD should leave all outputs HIGH, got low=[${low.join(',')}]`);
}

// ── 3. 3-to-8 mode: D=0, sweep A/B/C → one of Y0..Y7 LOW, Y8/Y9 stay HIGH ─────
for (let n = 0; n <= 7; n++) {
  apply(n); // n < 8 → D bit is 0
  const low = lowOuts();
  assert(low.length === 1 && low[0] === `Y${n}`,
    `3-to-8 ${n}: expected only Y${n} LOW (Y8/Y9 HIGH), got low=[${low.join(',')}]`);
  assert(isHigh(read('Y8')) && isHigh(read('Y9')),
    `3-to-8 ${n}: outputs Y8 and Y9 must stay HIGH`);
}

console.log(`74x42-bcd-decimal: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
