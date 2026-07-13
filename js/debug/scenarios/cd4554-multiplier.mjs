// ── CD4554 2x2 parallel binary multiplier — regression ───────────────────────
// The CD4554 (js/chips/chips161.js) is the only user of the new MULT_2X2_4554
// engine primitive. It guards the DB entry, the primitive, and the verified pin
// map (which is NOT the 74261 MULT_2X4BIT contract — issues.md C2).
//
// Verified facts (Motorola MC14554B/D Rev 3, page 1 EQUATIONS + worked example,
// page 3 LOGIC DIAGRAM / MULTIPLIER CELL, read as PDF page images — issues.md C4):
//   • S = (X x Y) + K + M, with X=X1X0, Y=Y1Y0 (operands), K=K1K0, M=M2M1M0.
//   • Output is S3 S2 S1 S0 (S0 = LSB) plus the expansion carry C0.
//   • Standalone 2x2 multiply: tie the C0 output to the M2 input (datasheet note);
//     then S3..S0 = X*Y + K + (M1M0) exactly (max 9+3+3 = 15, fits 4 bits).
//   • Datasheet example: X=2, Y=3, K=1, M=2 -> S = 1001 (=9).
//
// Method: place ONE CD4554 (purely combinational), wire C0->M2 for the standalone
// configuration, drive the remaining inputs from the rails, re-solve per case.
//
// Run:  node js/debug/scenarios/cd4554-multiplier.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4554');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive operands X,Y and add-inputs K=K1K0, M=M1M0; C0 is tied to M2 externally
// (standalone configuration per the datasheet note).
function apply({ x, y, k, m, tieC0toM2 = true }) {
  const wm = new WireManager();
  const wireBit = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4554 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wireBit('VDD', 1);
  wireBit('VSS', 0);
  wireBit('X0', x & 1);      wireBit('X1', (x >> 1) & 1);
  wireBit('Y0', y & 1);      wireBit('Y1', (y >> 1) & 1);
  wireBit('K0', k & 1);      wireBit('K1', (k >> 1) & 1);
  wireBit('M0', m & 1);      wireBit('M1', (m >> 1) & 1);
  if (tieC0toM2) {
    wm.addWire(chip.getPinByName('C0').holeId, chip.getPinByName('M2').holeId);
  } else {
    wireBit('M2', 0);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const sumOut = () =>
  (isHigh(read('S0')) ? 1 : 0) |
  (isHigh(read('S1')) ? 2 : 0) |
  (isHigh(read('S2')) ? 4 : 0) |
  (isHigh(read('S3')) ? 8 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Datasheet worked example: X=2, Y=3, K=1, M=2 -> S=1001 (=9) ───────────
apply({ x: 2, y: 3, k: 1, m: 2 });
assert(sumOut() === 9, `datasheet example X=2 Y=3 K=1 M=2: expected S=9, got ${sumOut()}`);

// ── 2. Full sweep: S3..S0 == X*Y + K + M for all X,Y,K,M in 0..3 (standalone) ─
for (let x = 0; x < 4; x++)
  for (let y = 0; y < 4; y++)
    for (let k = 0; k < 4; k++)
      for (let m = 0; m < 4; m++) {
        const expected = x * y + k + m; // max 9+3+3 = 15, fits S3..S0
        apply({ x, y, k, m });
        assert(sumOut() === expected,
          `X=${x} Y=${y} K=${k} M=${m}: expected S=${expected}, got ${sumOut()}`);
      }

// ── 3. Pure product with K=M=0 (C0 tied to M2) ───────────────────────────────
for (let x = 0; x < 4; x++)
  for (let y = 0; y < 4; y++) {
    apply({ x, y, k: 0, m: 0 });
    assert(sumOut() === x * y, `pure product X=${x} Y=${y}: expected ${x * y}, got ${sumOut()}`);
  }

console.log(`cd4554-multiplier: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures.slice(0, 20)) console.log('  ✗ ' + f);
if (failures.length > 20) console.log(`  ... and ${failures.length - 20} more`);
process.exit(failures.length === 0 ? 0 : 1);
