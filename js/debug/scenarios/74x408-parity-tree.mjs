// ── 74x408 (Motorola MC4008) 8-bit parity tree — regression ──────────────────
// The 74x408 (js/chips/chips66.js) is an 8-bit XNOR parity tree plus one spare
// 2-input XNOR gate. Verified against Motorola, "MTTL Integrated Circuits Data
// Book", 1971 (archive.org bitsavers), function table:
//     EVEN (pin 8) = D0 ⊕ D1 ⊕ D2 ⊕ D3 ⊕ D4 ⊕ D5 ⊕ D6 ⊕ D7  (⊕ = XNOR)
//     GY   (pin 6) = GA ⊕ GB
// An XNOR tree reads HIGH when an EVEN number of its inputs are HIGH, so EVEN is
// a direct even-parity indicator. The spare gate (GA/GB→GY) is independent; tied
// with GB LOW it inverts, turning EVEN into an odd-parity output.
//
// Method: place ONE 74x408 (purely combinational), drive the eight data inputs
// and the two spare-gate inputs to the VCC/GND rail, re-solve, read pins by name.
//
// Checks:
//   1. EVEN is HIGH iff the popcount of D0..D7 is even, across a sweep of
//      patterns (all-zero, single bits, pairs, all-ones, mixed).
//   2. Spare gate: GY = NOT(GA XOR GB) over its full 2-input table.
//   3. Odd-parity wiring intent: GY = NOT(EVEN) when GA=EVEN's value and GB=0.
//
// Run:  node js/debug/scenarios/74x408-parity-tree.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x408');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DATA = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];

// Drive the eight data inputs (bits[]) and the two spare-gate inputs (ga, gb).
function apply(bits, ga, gb) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x408 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  DATA.forEach((name, i) => wirePin(name, bits[i]));
  wirePin('GA', ga);
  wirePin('GB', gb);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const popcount = (bits) => bits.reduce((a, b) => a + b, 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Even-parity table on the 8-input tree ─────────────────────────────────
const PATTERNS = [
  [0, 0, 0, 0, 0, 0, 0, 0], // 0 ones  -> even -> EVEN=1
  [1, 0, 0, 0, 0, 0, 0, 0], // 1 one   -> odd  -> EVEN=0
  [0, 0, 0, 1, 0, 0, 0, 0], // 1 one (pin 9 path)
  [0, 0, 0, 0, 0, 0, 0, 1], // 1 one (pin 13 path)
  [1, 1, 0, 0, 0, 0, 0, 0], // 2 ones  -> even
  [1, 0, 0, 0, 0, 0, 0, 1], // 2 ones split across both halves
  [1, 1, 1, 0, 0, 0, 0, 0], // 3 ones  -> odd
  [1, 1, 1, 1, 1, 1, 1, 0], // 7 ones  -> odd
  [1, 1, 1, 1, 1, 1, 1, 1], // 8 ones  -> even
  [1, 0, 1, 0, 1, 0, 1, 0], // 4 ones  -> even
];

for (const bits of PATTERNS) {
  apply(bits, 0, 0);
  const expEven = (popcount(bits) % 2 === 0) ? 1 : 0;
  const gotEven = isHigh(read('EVEN')) ? 1 : 0;
  assert(gotEven === expEven,
    `EVEN: bits=[${bits}] popcount=${popcount(bits)} expected ${expEven}, got ${gotEven}`);
}

// ── 2. Spare XNOR gate full table ────────────────────────────────────────────
for (const ga of [0, 1]) {
  for (const gb of [0, 1]) {
    apply([0, 0, 0, 0, 0, 0, 0, 0], ga, gb);
    const exp = (ga ^ gb) ? 0 : 1;
    const got = isHigh(read('GY')) ? 1 : 0;
    assert(got === exp, `GY: GA=${ga} GB=${gb} expected ${exp}, got ${got}`);
  }
}

// ── 3. Odd-parity intent: GY = NOT(EVEN) when GA mirrors EVEN and GB is LOW ───
// (Verifies the documented "feed EVEN into GA, tie GB low" inversion trick.)
for (const bits of PATTERNS) {
  const evenVal = (popcount(bits) % 2 === 0) ? 1 : 0;
  apply(bits, evenVal, 0); // GA = the even-parity value, GB = LOW
  const gotOdd = isHigh(read('GY')) ? 1 : 0;
  const expOdd = evenVal ? 0 : 1;
  assert(gotOdd === expOdd,
    `ODD trick: bits=[${bits}] expected GY=${expOdd}, got ${gotOdd}`);
}

console.log(`74x408-parity-tree: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
