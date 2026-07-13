// ── 74x4028 BCD-to-decimal / binary-to-octal decoder — regression ────────────
// The 74x4028 (js/chips/chips57.js) is the 74-series-labelled CD4028: a BCD to
// decimal decoder with ACTIVE-HIGH one-hot outputs. It reuses the BCD_DECIMAL_HI
// primitive (the active-HIGH sibling of BCD_DECIMAL / 7442). This guards its DB
// entry, whose stub pinout was originally wrong and was corrected against the
// TI/Harris CD4028B datasheet (SCHS033C) functional diagram + Table I:
//   inputs  A=10 (LSB), B=13, C=12, D=11 (MSB)
//   outputs Q0=3, Q1=14, Q2=2, Q3=15, Q4=1, Q5=6, Q6=7, Q7=4, Q8=9, Q9=5
//   power   VSS/GND=8, VDD/VCC=16
//
// Method: place ONE 74x4028 (purely combinational — no sequential state) and
// drive A/B/C/D to each 4-bit code by wiring each input to the VCC or GND rail.
// Outputs are read straight off the pins by name ('Q0'..'Q9').
//
// Checks:
//   • codes 0..9 → exactly the matching Qn HIGH, all others LOW (active HIGH)
//   • codes 10..15 → every output LOW (invalid BCD rejected)
//   • 3-to-8 octal: D=0, sweep A/B/C 0..7 → Q0..Q7 one-hot, Q8/Q9 LOW
//
// Run:  node js/debug/scenarios/74x4028-bcd-decoder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4028');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the 4-bit code on A(LSB) B C D(MSB); re-solve combinationally.
function apply(code) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4028 has no pin named ${name}`);
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

const OUTS = ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'];
const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const highOuts = () => OUTS.filter(o => isHigh(read(o)));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Valid BCD 0..9 → exactly the matching Qn HIGH (active HIGH) ───────────
for (let n = 0; n <= 9; n++) {
  apply(n);
  const hot = highOuts();
  assert(hot.length === 1 && hot[0] === `Q${n}`,
    `code ${n}: expected only Q${n} HIGH, got [${hot.join(',')}]`);
}

// ── 2. Invalid BCD 10..15 → every output LOW ─────────────────────────────────
for (let n = 10; n <= 15; n++) {
  apply(n);
  const hot = highOuts();
  assert(hot.length === 0,
    `code ${n}: invalid BCD should leave all outputs LOW, got [${hot.join(',')}]`);
}

// ── 3. Binary-to-octal (3-to-8): D=0, sweep A/B/C → Q0..Q7 one-hot ───────────
for (let n = 0; n <= 7; n++) {
  apply(n); // n < 8 → D bit is 0
  const hot = highOuts();
  assert(hot.length === 1 && hot[0] === `Q${n}`,
    `octal ${n}: expected only Q${n} HIGH (Q8/Q9 LOW), got [${hot.join(',')}]`);
  assert(!isHigh(read('Q8')) && !isHigh(read('Q9')),
    `octal ${n}: outputs Q8 and Q9 must stay LOW`);
}

console.log(`74x4028-bcd-decoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
