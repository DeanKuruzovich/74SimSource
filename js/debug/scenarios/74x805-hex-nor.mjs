// ── 74x805 hex 2-input NOR driver — regression ───────────────────────────────
// The 74x805 (js/chips/chips40.js) is six independent 2-input NOR gates with
// high output drive. The drive capability has no effect on digital logic, so the
// chip is modeled with the built-in NOR primitive (one per gate). This guard
// pins down the corrected pin map — the original stub had A/B swapped on gates
// 4/5/6 — and the per-gate truth table Y = !(A + B).
//
// Datasheet pins (TI SDAS023C, SN54/SN74 ALS805A/AS805B): 1A=1,1B=2,1Y=3,2A=4,
// 2B=5,2Y=6,3A=7,3B=8,3Y=9,GND=10,4Y=11,4A=12,4B=13,5Y=14,5A=15,5B=16,6Y=17,
// 6A=18,6B=19,VCC=20. The DB entry uses 1-indexed gate names 1A..6A / 1B..6B /
// 1Y..6Y.
//
// Method: place ONE 74x805 (purely combinational) and drive each gate's A/B to
// the VCC or GND rail, re-solving for every input combination. Outputs read off
// the pins by name.
//
// Checks: for each of the six gates, the full 2-input NOR table
//   (0,0)->1  (0,1)->0  (1,0)->0  (1,1)->0.
//
// Run:  node js/debug/scenarios/74x805-hex-nor.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x805');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const GATES = [1, 2, 3, 4, 5, 6];

// Drive every gate's A/B inputs to a chosen pair of bits, re-solve.
function apply(aBit, bBit) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x805 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const g of GATES) {
    wirePin(`${g}A`, aBit);
    wirePin(`${g}B`, bBit);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── Full 2-input NOR table on all six gates ──────────────────────────────────
const TABLE = [
  { a: 0, b: 0, y: 1 },
  { a: 0, b: 1, y: 0 },
  { a: 1, b: 0, y: 0 },
  { a: 1, b: 1, y: 0 },
];

for (const { a, b, y } of TABLE) {
  apply(a, b);
  for (const g of GATES) {
    const got = isHigh(read(`${g}Y`)) ? 1 : 0;
    assert(got === y,
      `gate ${g}: A=${a} B=${b} expected Y=${y}, got ${got}`);
  }
}

console.log(`74x805-hex-nor: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
