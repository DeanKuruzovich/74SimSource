// ── 74x918 dual 2-input NAND relay driver — regression ───────────────────────
// The 74x918 (js/chips/chips44.js) is the National MM74C918: two 2-input NAND
// gates, each feeding a 30V/250mA emitter-follower darlington output. The high
// output drive has no effect on digital logic, so each gate is modeled with the
// built-in NAND primitive. The darlington sources current to the load when the
// gate output is HIGH, so the output pin follows Y = !(A · B).
//
// Datasheet pins (National Interface Databook 1979, p. 9-25, MM74C918N / package
// N14A): 1A=1, 1Y=2, VCC=3/4/5, 2Y=6, 2A=7, 2B=8, GND=9, VCC=10/11/12, NC=13,
// 1B=14. The original stub pinout (GND=7, VCC=14, pins 1-4 absent) was wrong and
// has been corrected against the datasheet.
//
// Method: place ONE 74x918 (purely combinational) and drive each gate's inputs to
// the VCC or GND rail, re-solving for every combination. Outputs read by pin name.
//
// Checks:
//   1. Full 2-input NAND table on both gates: (0,0)->1 (0,1)->1 (1,0)->1 (1,1)->0.
//   2. Gate independence: the two gates can hold opposite outputs at once.
//
// Run:  node js/debug/scenarios/74x918-dual-nand-driver.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x918');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the four gate inputs to chosen bits, re-solve.
function apply(a1, b1, a2, b2) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x918 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('1A', a1);
  wirePin('1B', b1);
  wirePin('2A', a2);
  wirePin('2B', b2);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Full 2-input NAND table, applied to both gates simultaneously ─────────
const TABLE = [
  { a: 0, b: 0, y: 1 },
  { a: 0, b: 1, y: 1 },
  { a: 1, b: 0, y: 1 },
  { a: 1, b: 1, y: 0 },
];

for (const { a, b, y } of TABLE) {
  apply(a, b, a, b);
  const y1 = isHigh(read('1Y')) ? 1 : 0;
  const y2 = isHigh(read('2Y')) ? 1 : 0;
  assert(y1 === y, `gate 1: A=${a} B=${b} expected 1Y=${y}, got ${y1}`);
  assert(y2 === y, `gate 2: A=${a} B=${b} expected 2Y=${y}, got ${y2}`);
}

// ── 2. Gate independence: gate 1 inputs HIGH (1Y LOW), gate 2 not both HIGH ───
apply(1, 1, 1, 0);
assert(isHigh(read('1Y')) === false, 'independence: 1Y should be LOW (1A=1B=1)');
assert(isHigh(read('2Y')) === true,  'independence: 2Y should be HIGH (2A=1,2B=0)');

console.log(`74x918-dual-nand-driver: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
