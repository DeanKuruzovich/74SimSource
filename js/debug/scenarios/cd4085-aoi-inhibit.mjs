// ── CD4085 dual 2-wide 2-input AND-OR-INVERT (with inhibit) — regression ─────
// The CD4085 (Batch 2, js/chips/chips102.js) is primitive-backed: two AOI_2WIDE
// gates, each computing E = NOT(INHIBIT + A·B + C·D). The AOI_2WIDE primitive was
// extended to accept an optional 5th active-HIGH inhibit input (the existing
// 74x50/74x51 keep their 4-input behavior). This guards the chip's DB entry: the
// pin map (A1=1,B1=2,E1=3,E2=4,A2=5,B2=6,VSS=7,C2=8,D2=9,INH1=10,INH2=11,C1=12,
// D1=13,VDD=14) and the full per-gate truth table, including the inhibit override.
//
// Method: place ONE CD4085 (purely combinational — no sequential state) and drive
// the two gates with DIFFERENT input vectors each step (so the gates are also
// proven independent), then read E1/E2 off the pins.
//
//   E = NOT( INH + (A·B) + (C·D) )
//   • INH=0: ordinary 2-wide AOI — LOW iff either AND pair is asserted
//   • INH=1: output forced LOW regardless of A/B/C/D
//
// Run:  node js/debug/scenarios/cd4085-aoi-inhibit.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4085');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Expected AOI-with-inhibit output for one gate.
const expect = ({ a, b, c, d, inh }) => (inh | (a & b) | (c & d)) ? 0 : 1;

// Drive gate 1 (A1,B1,C1,D1,INHIBIT 1) and gate 2 (A2,B2,C2,D2,INHIBIT 2); re-solve.
function apply(g1, g2) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4085 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('A1', g1.a); wirePin('B1', g1.b); wirePin('C1', g1.c); wirePin('D1', g1.d); wirePin('INHIBIT 1', g1.inh);
  wirePin('A2', g2.a); wirePin('B2', g2.b); wirePin('C2', g2.c); wirePin('D2', g2.d); wirePin('INHIBIT 2', g2.inh);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const vec = (n) => ({ a: (n >> 0) & 1, b: (n >> 1) & 1, c: (n >> 2) & 1, d: (n >> 3) & 1, inh: (n >> 4) & 1 });
const fmt = (g) => `A${g.a}B${g.b}C${g.c}D${g.d}I${g.inh}`;

// Sweep all 32 input combinations on gate 1; drive gate 2 with the complementary
// index so the two gates always carry distinct vectors (independence check).
for (let n = 0; n < 32; n++) {
  const g1 = vec(n);
  const g2 = vec(31 - n);
  apply(g1, g2);

  assert(readBit('E1') === expect(g1),
    `gate1 ${fmt(g1)}: expected E1=${expect(g1)}, got ${readBit('E1')}`);
  assert(readBit('E2') === expect(g2),
    `gate2 ${fmt(g2)}: expected E2=${expect(g2)}, got ${readBit('E2')}`);
}

// Spot-check the headline behaviors explicitly.
const cases = [
  // [g, expectedE, label]
  [{ a:0,b:0,c:0,d:0,inh:0 }, 1, 'all-low,inh=0 → HIGH'],
  [{ a:1,b:1,c:0,d:0,inh:0 }, 0, 'A·B asserted → LOW'],
  [{ a:0,b:0,c:1,d:1,inh:0 }, 0, 'C·D asserted → LOW'],
  [{ a:1,b:0,c:0,d:1,inh:0 }, 1, 'no full pair → HIGH'],
  [{ a:0,b:0,c:0,d:0,inh:1 }, 0, 'inhibit forces LOW'],
  [{ a:1,b:0,c:1,d:0,inh:1 }, 0, 'inhibit overrides data → LOW'],
];
for (const [g, exp, label] of cases) {
  apply(g, { a:0,b:0,c:0,d:0,inh:0 });
  assert(readBit('E1') === exp, `${label}: expected E1=${exp}, got ${readBit('E1')}`);
}

console.log(`cd4085-aoi-inhibit: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
