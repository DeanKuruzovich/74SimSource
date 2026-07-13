// ── 74x182 look-ahead carry generator — regression ──────────────────────────
// The 74x182 (js/chips/chips13.js, CHIPS_BLOCK_13) is the bipolar Schottky-TTL
// look-ahead carry generator that pairs with the 74181 ALU. It is purely
// combinational and reuses the CARRY_LOOKAHEAD engine primitive
// (js/specificChipsSim.js _evaluateCarryLookahead), which the repo models in
// plain ACTIVE-HIGH logic (see the chips13.js header + issues.md C16/C18).
//
// WHY THIS SCENARIO EXISTS
// The original hand-entered 74x182 pinout was wrong: it placed P0=1, G0=2,
// P1=3 ... (a made-up map that matched no datasheet, issues.md C18) instead of
// the JEDEC-standard map G1=1, P1=2, G0=3, P0=4 ... verified against TI SDLS206
// and Fairchild DS006474. Because CARRY_LOOKAHEAD keys off pin *names*, a
// name-driven behavior test (like cd40182-carry-lookahead.mjs) passes even with
// a scrambled pin-*number* map. So this scenario has TWO parts:
//   (1) PIN-MAP assertion — checks each physical pin NUMBER carries the
//       datasheet-correct NAME. This is the check that would have caught the bug.
//   (2) BEHAVIOR sweep — exhaustive 2^9 = 512-vector check that the corrected
//       pinout still simulates the datasheet carry equations end to end.
//
// CARRY_LOOKAHEAD contract (js/specificChipsSim.js):
//   inputs:  [P0, G0, P1, G1, P2, G2, P3, G3, Cn]
//   outputs: [Cn_x, Cn_y, Cn_z, P, G]
// with (active-high modeled):
//   Cn_x = G0 + P0·Cn
//   Cn_y = G1 + P1·Cn_x  ( = G1 + P1·G0 + P1·P0·Cn )
//   Cn_z = G2 + P2·Cn_y  ( = G2 + P2·G1 + P2·P1·G0 + P2·P1·P0·Cn )
//   P    = P3·P2·P1·P0
//   G    = G3 + P3·G2 + P3·P2·G1 + P3·P2·P1·G0
//
// Run:  node js/debug/scenarios/74x182-carry-lookahead.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];

// ── Part 1: physical pin map matches TI SDLS206 / Fairchild DS006474 ─────────
// Standard JEDEC 16-pin DIP terminal assignment (top view).
const EXPECTED_PINS = {
  1: 'G1',  2: 'P1',  3: 'G0',  4: 'P0',
  5: 'G3',  6: 'P3',  7: 'P',   8: 'GND',
  9: 'Cn_z', 10: 'G', 11: 'Cn_y', 12: 'Cn_x',
  13: 'Cn', 14: 'G2', 15: 'P2', 16: 'VCC',
};
{
  const chip = new ChipComponent('74x182');
  chip.place(0, 0, 2, 4);
  for (const [num, name] of Object.entries(EXPECTED_PINS)) {
    const p = chip.getPinByNumber(Number(num));
    const got = p ? p.name : '(missing)';
    if (got !== name) {
      failures.push(`pin ${num}: expected '${name}', got '${got}'`);
    }
  }
}

// ── Part 2: behavior sweep over all 512 input vectors ───────────────────────
const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x182');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const INPUTS = ['P0', 'G0', 'P1', 'G1', 'P2', 'G2', 'P3', 'G3', 'Cn'];
function apply(vec) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x182 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  INPUTS.forEach((name, i) => wirePin(name, (vec >> i) & 1));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);

// Software oracle (the datasheet carry equations, active-high form).
function oracle(vec) {
  const b = (i) => (vec >> i) & 1;
  const p0 = b(0), g0 = b(1), p1 = b(2), g1 = b(3);
  const p2 = b(4), g2 = b(5), p3 = b(6), g3 = b(7), cn = b(8);
  const cnX = g0 | (p0 & cn);
  const cnY = g1 | (p1 & cnX);
  const cnZ = g2 | (p2 & cnY);
  const P = p3 & p2 & p1 & p0;
  const G = g3 | (p3 & g2) | (p3 & p2 & g1) | (p3 & p2 & p1 & g0);
  return { Cn_x: cnX, Cn_y: cnY, Cn_z: cnZ, P, G };
}

for (let vec = 0; vec < 512 && failures.length < 12; vec++) {
  apply(vec);
  const exp = oracle(vec);
  for (const name of ['Cn_x', 'Cn_y', 'Cn_z', 'P', 'G']) {
    const got = readBit(name);
    if (got !== exp[name]) {
      failures.push(`vec=${vec.toString(2).padStart(9, '0')} ${name}: expected ${exp[name]}, got ${got}`);
    }
  }
}

if (failures.length) {
  console.error(`74x182 carry-lookahead regression FAILED (${failures.length} shown):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('74x182 carry-lookahead regression PASSED (16-pin map + 512 vectors)');
