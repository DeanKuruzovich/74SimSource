// ── CD4028 BCD-to-decimal / binary-to-octal decoder — regression ─────────────
// The CD4028 (Batch 10, js/chips/chips90.js) is the first behavioral coverage of
// the BCD_DECIMAL_HI primitive — the ACTIVE-HIGH sibling of BCD_DECIMAL (7442,
// active-LOW). It guards the chip's DB entry: the output pin map
// (0=3, 1=14, 2=2, 3=15, 4=1, 5=6, 6=7, 7=4, 8=9, 9=5), the input weights
// (A=10=LSB, B=13, C=12, D=11=MSB), the active-HIGH one-hot decode, the
// all-LOW response to invalid BCD codes 10-15, and the 3-to-8 octal sub-mode.
//
// Method: place ONE CD4028 (purely combinational — no sequential state) and
// drive A/B/C/D to each 4-bit code by wiring each input to the VCC or GND rail.
// Outputs are read straight off the pins by name ('0'..'9').
//
// Checks:
//   • codes 0..9 → exactly the matching output HIGH, all others LOW (active HIGH)
//   • codes 10..15 → every output LOW (invalid BCD rejected)
//   • 3-to-8 octal: D=0, sweep A/B/C 0..7 → outputs 0..7 one-hot, 8/9 LOW
//
// Run:  node js/debug/scenarios/cd4028-bcd-decoder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4028');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the 4-bit code on A(LSB) B C D(MSB); re-solve combinationally.
function apply(code) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4028 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  wirePin('A', (code >> 0) & 1);
  wirePin('B', (code >> 1) & 1);
  wirePin('C', (code >> 2) & 1);
  wirePin('D', (code >> 3) & 1);
  sim.evaluate(world, [chip], wm);
}

const OUTS = ['0','1','2','3','4','5','6','7','8','9'];
const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const highOuts = () => OUTS.filter(o => isHigh(read(o)));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Valid BCD 0..9 → exactly the matching output HIGH (active HIGH) ───────
for (let n = 0; n <= 9; n++) {
  apply(n);
  const hot = highOuts();
  assert(hot.length === 1 && hot[0] === String(n),
    `code ${n}: expected only output ${n} HIGH, got [${hot.join(',')}]`);
}

// ── 2. Invalid BCD 10..15 → every output LOW ─────────────────────────────────
for (let n = 10; n <= 15; n++) {
  apply(n);
  const hot = highOuts();
  assert(hot.length === 0,
    `code ${n}: invalid BCD should leave all outputs LOW, got [${hot.join(',')}]`);
}

// ── 3. Binary-to-octal (3-to-8): D=0, sweep A/B/C → outputs 0..7 one-hot ─────
for (let n = 0; n <= 7; n++) {
  apply(n); // n < 8 → D bit is 0
  const hot = highOuts();
  assert(hot.length === 1 && hot[0] === String(n),
    `octal ${n}: expected only output ${n} HIGH (8/9 LOW), got [${hot.join(',')}]`);
  assert(!isHigh(read('8')) && !isHigh(read('9')),
    `octal ${n}: outputs 8 and 9 must stay LOW`);
}

console.log(`cd4028-bcd-decoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
