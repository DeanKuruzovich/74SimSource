// ── 74x810 quad 2-input XNOR — regression ────────────────────────────────────
// The 74x810 (js/chips/chips40.js) is four independent 2-input exclusive-NOR
// gates with totem-pole (push-pull) outputs. Per-gate function Y = NOT(A XOR B):
// the output is HIGH when the two inputs are equal and LOW when they differ.
// The chip is modeled with the built-in XNOR primitive, one per gate. (The OC
// sibling 74x810's open-collector twin, the 74x811, is a separate guard.)
//
// Pinout (TI ALS8xx family sequential convention, corroborated against the
// SN74ALS804A SDAS022C page-1 image and the universal quad-2-input DIP-14 map —
// see the entry header comment): A0=1,B0=2,Y0=3,A1=4,B1=5,Y1=6,GND=7,Y2=8,B2=9,
// A2=10,Y3=11,B3=12,A3=13,VCC=14. The four gates use 0-indexed names.
//
// Method: place ONE 74x810 (purely combinational) and drive each gate's A/B to
// the VCC or GND rail, re-solving for every input combination. Outputs read off
// the pins by name.
//
// Checks:
//   1. Full 2-input XNOR table on all four gates:
//        (0,0)->1  (0,1)->0  (1,0)->0  (1,1)->1.
//   2. Cross-wiring guard: drive the four gates with DISTINCT input patterns in
//      one solve so a mis-routed output (e.g. Y2 reading gate 3's inputs) fails.
//
// Run:  node js/debug/scenarios/74x810-quad-xnor.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x810');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const GATES = [0, 1, 2, 3];
const xnor = (a, b) => (a ^ b) ? 0 : 1;

// Drive each gate's A/B inputs from a per-gate {a,b} table, then re-solve.
function applyPerGate(pattern) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x810 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const g of GATES) {
    wirePin(`A${g}`, pattern[g].a);
    wirePin(`B${g}`, pattern[g].b);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Full 2-input XNOR table, same inputs on all four gates ─────────────────
const TABLE = [
  { a: 0, b: 0 },
  { a: 0, b: 1 },
  { a: 1, b: 0 },
  { a: 1, b: 1 },
];

for (const { a, b } of TABLE) {
  applyPerGate(GATES.map(() => ({ a, b })));
  for (const g of GATES) {
    const got = isHigh(read(`Y${g}`)) ? 1 : 0;
    assert(got === xnor(a, b),
      `gate ${g}: A=${a} B=${b} expected Y=${xnor(a, b)}, got ${got}`);
  }
}

// ── 2. Cross-wiring guard: distinct pattern per gate, all four expected to differ
// gate0 (0,0)->1, gate1 (0,1)->0, gate2 (1,0)->0, gate3 (1,1)->1.
const DISTINCT = [
  { a: 0, b: 0 },
  { a: 0, b: 1 },
  { a: 1, b: 0 },
  { a: 1, b: 1 },
];
applyPerGate(DISTINCT);
for (const g of GATES) {
  const exp = xnor(DISTINCT[g].a, DISTINCT[g].b);
  const got = isHigh(read(`Y${g}`)) ? 1 : 0;
  assert(got === exp,
    `distinct gate ${g}: A=${DISTINCT[g].a} B=${DISTINCT[g].b} expected Y=${exp}, got ${got}`);
}

console.log(`74x810-quad-xnor: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
