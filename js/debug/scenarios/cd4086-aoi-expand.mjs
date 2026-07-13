// ── CD4086 expandable 4-wide 2-input AND-OR-INVERT — regression ──────────────
// The CD4086 (Batch 2, js/chips/chips103.js) is primitive-backed: one AOI_4WIDE
// gate computing J = NOT( INHIBIT/EXP + NOT(ENABLE/EXP) + A·B + C·D + E·F + G·H ).
// The AOI_4WIDE primitive was extended to accept an optional 9th active-HIGH
// INHIBIT/EXP input and 10th active-HIGH ENABLE/EXP input (a plain 8-input 4-wide
// AOI like the 74x54 keeps its old behavior with both undefined). This guards the
// chip's DB entry: the verified pin map (A=1,B=2,J=3,NC=4,E=5,F=6,VSS=7,G=8,H=9,
// INHIBIT/EXP=10,ENABLE/EXP=11,C=12,D=13,VDD=14) and the function including the
// inhibit override and enable gate.
//
//   J = NOT( INH + !ENABLE + (A·B) + (C·D) + (E·F) + (G·H) )
//   • INH=0, ENABLE=1: ordinary 4-wide AOI — LOW iff any pair is asserted
//   • INH=1: output forced LOW regardless of data
//   • ENABLE=0: output forced LOW regardless of data
//
// Run:  node js/debug/scenarios/cd4086-aoi-expand.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4086');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Expected AOI output. inh active-HIGH ORs in; en active-HIGH (LOW forces J low).
const expect = ({ a, b, c, d, e, f, g, h, inh, en }) =>
  (inh | (en ? 0 : 1) | (a & b) | (c & d) | (e & f) | (g & h)) ? 0 : 1;

function apply(v) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4086 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('A', v.a); wirePin('B', v.b); wirePin('C', v.c); wirePin('D', v.d);
  wirePin('E', v.e); wirePin('F', v.f); wirePin('G', v.g); wirePin('H', v.h);
  wirePin('INHIBIT/EXP', v.inh); wirePin('ENABLE/EXP', v.en);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const fmt = (v) => `AB${v.a}${v.b} CD${v.c}${v.d} EF${v.e}${v.f} GH${v.g}${v.h} I${v.inh}E${v.en}`;

// Sweep all 256 data combinations in normal mode (INH=0, ENABLE=1) — full AOI
// truth table including each of the four AND pairs pulling the output LOW.
for (let n = 0; n < 256; n++) {
  const v = {
    a: (n >> 0) & 1, b: (n >> 1) & 1, c: (n >> 2) & 1, d: (n >> 3) & 1,
    e: (n >> 4) & 1, f: (n >> 5) & 1, g: (n >> 6) & 1, h: (n >> 7) & 1,
    inh: 0, en: 1,
  };
  apply(v);
  assert(readBit('J') === expect(v), `normal ${fmt(v)}: expected J=${expect(v)}, got ${readBit('J')}`);
}

// Headline / control cases: inhibit override and enable gate.
const cases = [
  [{ a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0,inh:0,en:1 }, 1, 'all-low → HIGH'],
  [{ a:1,b:1,c:0,d:0,e:0,f:0,g:0,h:0,inh:0,en:1 }, 0, 'A·B asserted → LOW'],
  [{ a:0,b:0,c:0,d:0,e:0,f:0,g:1,h:1,inh:0,en:1 }, 0, 'G·H asserted → LOW'],
  [{ a:1,b:0,c:0,d:1,e:1,f:0,g:0,h:1,inh:0,en:1 }, 1, 'no full pair → HIGH'],
  [{ a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0,inh:1,en:1 }, 0, 'INHIBIT forces LOW'],
  [{ a:1,b:0,c:1,d:0,e:1,f:0,g:1,h:0,inh:1,en:1 }, 0, 'INHIBIT overrides data → LOW'],
  [{ a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0,inh:0,en:0 }, 0, 'ENABLE LOW forces LOW (all-low data)'],
  [{ a:1,b:1,c:0,d:0,e:0,f:0,g:0,h:0,inh:0,en:0 }, 0, 'ENABLE LOW forces LOW (asserted data)'],
];
for (const [v, exp, label] of cases) {
  apply(v);
  assert(readBit('J') === exp, `${label}: expected J=${exp}, got ${readBit('J')}`);
}

console.log(`cd4086-aoi-expand: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
