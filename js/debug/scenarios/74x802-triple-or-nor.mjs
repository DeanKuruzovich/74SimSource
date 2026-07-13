// ── 74x802 triple 4-input OR/NOR line driver — regression ────────────────────
// The 74x802 (js/chips/chips40.js) is three independent 4-input sections. Each
// section n drives a true OR output nY = An+Bn+Cn+Dn and a complementary NOR
// output nZ = ~(An+Bn+Cn+Dn). The part's analog selling points (< 0.5 ns
// true/complement skew, 48 mA drive) have no effect on digital logic, so each
// section is modeled with the built-in OR + NOR primitives.
//
// This guard pins down the CORRECTED pin map (the original stub was hand-entered
// with sequential 0/1/2 channels and was wrong) and the per-section behavior.
//
// Datasheet pins (TI SN74AS802, D2662, in The TTL Data Book Vol.3 1984 p.2-509,
// N package TOP VIEW): 1A=1, 2A=2, 2B=3, 2C=4, 2D=5, 3A=6, 3B=7, 3C=8, 3D=9,
// GND=10, 3Z=11, 3Y=12, 2Y=13, 2Z=14, 1Z=15, 1Y=16, 1B=17, 1C=18, 1D=19, VCC=20.
//
// Method: place ONE 74x802 (purely combinational), drive each section's four
// inputs to a chosen bit pattern, re-solve, and read Y/Z off the pins by name.
//
// Checks, per section: Y = OR of the four inputs, Z = NOR (inverse of Y).
//   - all four LOW   -> Y=0, Z=1
//   - any one HIGH   -> Y=1, Z=0   (tested by pulling each input high in turn)
//   - all four HIGH  -> Y=1, Z=0
//
// Run:  node js/debug/scenarios/74x802-triple-or-nor.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x802');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const SECTIONS = [1, 2, 3];
const LETTERS = ['A', 'B', 'C', 'D'];

// Drive all three sections to the same 4-bit input pattern, re-solve.
// `bits` is [a,b,c,d] with 1 = VCC rail, 0 = GND rail.
function apply(bits) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x802 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const s of SECTIONS) {
    LETTERS.forEach((L, i) => wirePin(`${s}${L}`, bits[i]));
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Build the test patterns: all-low, all-high, and each-one-input-high.
const PATTERNS = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

for (const bits of PATTERNS) {
  apply(bits);
  const expectY = bits.some((b) => b === 1) ? 1 : 0;
  const expectZ = expectY ? 0 : 1;
  for (const s of SECTIONS) {
    const gotY = isHigh(read(`${s}Y`)) ? 1 : 0;
    const gotZ = isHigh(read(`${s}Z`)) ? 1 : 0;
    assert(gotY === expectY,
      `section ${s}: inputs=${bits.join('')} expected Y=${expectY}, got ${gotY}`);
    assert(gotZ === expectZ,
      `section ${s}: inputs=${bits.join('')} expected Z=${expectZ}, got ${gotZ}`);
    assert(gotZ === (gotY ^ 1),
      `section ${s}: inputs=${bits.join('')} Z (${gotZ}) is not the inverse of Y (${gotY})`);
  }
}

console.log(`74x802-triple-or-nor: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
