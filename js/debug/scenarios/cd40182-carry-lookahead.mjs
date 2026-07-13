// ── CD40182 CMOS look-ahead carry generator — regression ─────────────────────
// The CD40182 (js/chips/chips148.js, CHIPS_BLOCK_148) is the CMOS twin of the
// 74182. It is purely combinational and reuses the existing CARRY_LOOKAHEAD
// engine primitive (js/specificChipsSim.js _evaluateCarryLookahead), which the
// repo models in plain ACTIVE-HIGH logic (see chips148.js header + issues.md
// C16 for the P/G polarity note).
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
// Method: place ONE CD40182 (no sequential state), drive every input pin from a
// rail, re-solve, read the five outputs off the pins. A software oracle computes
// the expected values for an exhaustive sweep of all 2^9 = 512 input vectors so
// every term in every equation is exercised.
//
// Run:  node js/debug/scenarios/cd40182-carry-lookahead.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40182');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the 9 inputs (P0,G0,P1,G1,P2,G2,P3,G3,Cn) from a packed integer, re-solve.
const INPUTS = ['P0', 'G0', 'P1', 'G1', 'P2', 'G2', 'P3', 'G3', 'Cn'];
function apply(vec) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40182 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  INPUTS.forEach((name, i) => wirePin(name, (vec >> i) & 1));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);

// Software oracle (the datasheet equations).
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

const failures = [];
for (let vec = 0; vec < 512 && failures.length < 10; vec++) {
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
  console.error(`CD40182 carry-lookahead regression FAILED (${failures.length} shown):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('CD40182 carry-lookahead regression PASSED (512 vectors)');
