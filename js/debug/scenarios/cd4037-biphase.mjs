// ── CD4037 triple AND/OR bi-phase pairs — regression ─────────────────────────
// The CD4037 (Batch 2, js/chips/chips104.js) is primitive-backed by the new
// AO_BIPHASE_PAIR engine type. Each of the three sections has its own data input
// Cn and a complementary output pair Dn/En, steered by two shared controls A,B:
//   Dn = NOT( (A·C̄n) + (B·Cn) )
//   En = NOT( (A·Cn)  + (B·C̄n) )
// This guards the chip's DB entry: the 14-pin map (VCC=1, B=2, C1=3, A=4, C2=5,
// C3=6, VSS=7, D3=8, E3=9, D2=10, E2=11, E1=12, D1=13, VDD=14) and the full
// RCA CD4037A truth table read from the 1980 RCA COS/MOS databook:
//   A B │ D    E
//   0 0 │ 1    1
//   1 0 │ C    C̄
//   0 1 │ C̄    C
//   1 1 │ 0    0
//
// Method: place ONE CD4037 (purely combinational) and drive A, B, and the three
// data inputs C1/C2/C3 to the rails, then read all six outputs off the pins.
// Verifies all 8 (A,B,C) input combinations per section AND that the three
// sections are independent (different Cn give independent Dn/En).
//
// Run:  node js/debug/scenarios/cd4037-biphase.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4037');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive A, B and the three data inputs C1/C2/C3; re-solve.
function apply(a, b, c1, c2, c3) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4037 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VCC', 1);   // output-buffer supply
  wirePin('GND', 0);
  wirePin('A', a);
  wirePin('B', b);
  wirePin('C1', c1);
  wirePin('C2', c2);
  wirePin('C3', c3);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Reference model for one section.
const expectD = (a, b, c) => (((a & (c ^ 1)) | (b & c)) ? 0 : 1);
const expectE = (a, b, c) => (((a & c) | (b & (c ^ 1))) ? 0 : 1);

// Exhaustively sweep A,B and an independent C per section so we also confirm the
// three sections don't cross-couple (each uses its own Cn).
for (let a = 0; a <= 1; a++) {
  for (let b = 0; b <= 1; b++) {
    for (let c1 = 0; c1 <= 1; c1++) {
      for (let c2 = 0; c2 <= 1; c2++) {
        for (let c3 = 0; c3 <= 1; c3++) {
          apply(a, b, c1, c2, c3);
          const secs = [
            ['1', c1], ['2', c2], ['3', c3],
          ];
          for (const [n, c] of secs) {
            const gotD = bit(`D${n}`), gotE = bit(`E${n}`);
            const wantD = expectD(a, b, c), wantE = expectE(a, b, c);
            assert(gotD === wantD,
              `A=${a},B=${b},C${n}=${c}: D${n} expected ${wantD}, got ${gotD}`);
            assert(gotE === wantE,
              `A=${a},B=${b},C${n}=${c}: E${n} expected ${wantE}, got ${gotE}`);
          }
        }
      }
    }
  }
}

// Spot-check the four named datasheet truth-table rows on section 1 (C1=1).
apply(0, 0, 1, 0, 0); assert(bit('D1') === 1 && bit('E1') === 1, 'row A=0,B=0: expected D=1,E=1');
apply(1, 0, 1, 0, 0); assert(bit('D1') === 1 && bit('E1') === 0, 'row A=1,B=0,C=1: expected D=C=1,E=C̄=0');
apply(0, 1, 1, 0, 0); assert(bit('D1') === 0 && bit('E1') === 1, 'row A=0,B=1,C=1: expected D=C̄=0,E=C=1');
apply(1, 1, 1, 0, 0); assert(bit('D1') === 0 && bit('E1') === 0, 'row A=1,B=1: expected D=0,E=0');

console.log(`cd4037-biphase: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
