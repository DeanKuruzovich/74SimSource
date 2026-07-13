// ── CD4055 BCD-to-7-segment LCD decoder/driver — regression ──────────────────
// The CD4055 (Batch 15, js/chips/chips168.js) maps onto the new BCD_7SEG_4055
// engine primitive. It is "BCD_7SEG_4543-style" (DF sets output polarity the way
// the CD4543 Ph pin does) but is its OWN type, because it differs in two ways:
//   • purely combinational — NO input latch and NO blanking pin (those are the
//     CD4056B / CD4543), so the segments follow the BCD inputs in real time;
//   • it decodes ALL 16 input codes — 0-9 plus L, H, P, A, "-", and a blank —
//     whereas the CD4543 blanks codes 10-15.
//
// This guard pins down both the verified CD4055B pinout (TI/Harris SCHS048C
// terminal assignment 92CS-24486 — A=2^0 pin5, B=2^1 pin3, C=2^2 pin2, D=2^3 pin4,
// DF=pin6, DFO=pin1, segs a=9..g=14,f=15; NOT cloned from the CD4054B/CD4056B
// siblings, issues.md C2) and three behaviors:
//   • combinational decode of all 16 codes to the datasheet segment patterns
//     (DF=LOW → selected segments drive HIGH);
//   • DF=HIGH inverts every segment output (common-anode polarity);
//   • DFO is a buffered copy of DF IN.
//
// Run:  node js/debug/scenarios/cd4055-bcd-7seg-lcd.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4055');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// Verified TRUTH TABLE FOR CD4055B (SCHS048C), active-HIGH reference (DF=LOW).
//                a  b  c  d  e  f  g
const TABLE = [
  /*  0 */ [1, 1, 1, 1, 1, 1, 0],
  /*  1 */ [0, 1, 1, 0, 0, 0, 0],
  /*  2 */ [1, 1, 0, 1, 1, 0, 1],
  /*  3 */ [1, 1, 1, 1, 0, 0, 1],
  /*  4 */ [0, 1, 1, 0, 0, 1, 1],
  /*  5 */ [1, 0, 1, 1, 0, 1, 1],
  /*  6 */ [1, 0, 1, 1, 1, 1, 1],
  /*  7 */ [1, 1, 1, 0, 0, 0, 0],
  /*  8 */ [1, 1, 1, 1, 1, 1, 1],
  /*  9 */ [1, 1, 1, 1, 0, 1, 1],
  /* 10 L     */ [0, 0, 0, 1, 1, 1, 0],
  /* 11 H     */ [0, 1, 1, 0, 1, 1, 1],
  /* 12 P     */ [1, 1, 0, 0, 1, 1, 1],
  /* 13 A     */ [1, 1, 1, 0, 1, 1, 1],
  /* 14 -     */ [0, 0, 0, 0, 0, 0, 1],
  /* 15 blank */ [0, 0, 0, 0, 0, 0, 0],
];

function apply({ code, df }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4055 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('A', (code >> 0) & 1);
  wirePin('B', (code >> 1) & 1);
  wirePin('C', (code >> 2) & 1);
  wirePin('D', (code >> 3) & 1);
  wirePin('DF', df ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const segBits = () => SEGS.map(s => isHigh(read(s)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. DF=LOW: every code decodes to the active-HIGH datasheet pattern ───────
for (let code = 0; code < 16; code++) {
  apply({ code, df: 0 });
  const got = segBits();
  assert(got.join('') === TABLE[code].join(''),
    `DF=LOW code ${code}: expected [${TABLE[code]}] got [${got}]`);
  assert(!isHigh(read('DFO')), `DF=LOW code ${code}: DFO should be LOW`);
}

// ── 2. DF=HIGH: every segment output is inverted; DFO follows DF ─────────────
for (let code = 0; code < 16; code++) {
  apply({ code, df: 1 });
  const got = segBits();
  const want = TABLE[code].map(b => b ^ 1);
  assert(got.join('') === want.join(''),
    `DF=HIGH code ${code}: expected [${want}] got [${got}]`);
  assert(isHigh(read('DFO')), `DF=HIGH code ${code}: DFO should follow DF (HIGH)`);
}

// ── 3. Spot-check a couple of named characters for human sanity ──────────────
apply({ code: 8, df: 0 });
assert(segBits().every(b => b === 1), 'code 8 ("8") should light all seven segments');
apply({ code: 14, df: 0 });
assert(segBits().join('') === '0000001', 'code 14 ("-") should light only segment g');
apply({ code: 15, df: 0 });
assert(segBits().every(b => b === 0), 'code 15 (blank) should light no segments');

console.log(`cd4055-bcd-7seg-lcd: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
