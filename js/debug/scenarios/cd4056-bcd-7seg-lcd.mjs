// ── CD4056 BCD-to-7-segment LCD decoder/driver (strobed latch) — regression ──
// The CD4056 (Batch 15, js/chips/chips169.js) maps onto the new BCD_7SEG_4056
// engine primitive. It is "BCD_7SEG_4543-style" (DF sets output polarity the way
// the CD4543 Ph pin does) but is its OWN type, because it differs in three ways:
//   • it adds a STROBE input latch (STROBE HIGH = transparent / follow,
//     STROBE LOW = latched / hold) — the OPPOSITE polarity to the CD4543 LE;
//   • it has NO blanking pin and NO Display-Frequency OUT pin (the latter is the
//     CD4055 sibling);
//   • it decodes ALL 16 input codes — 0-9 plus L, H, P, A, "-", and a blank —
//     whereas the CD4543 blanks codes 10-15.
//
// This guard pins down both the verified CD4056B pinout (TI/Harris SCHS048C
// terminal assignment 92CS-24487 + Fig.3 functional diagram — A=2^0 pin5,
// B=2^1 pin3, C=2^2 pin2, D=2^3 pin4, ST=pin1, DF=pin6, segs a=9..e=13, g=14,
// f=15; NOT cloned from the CD4054B/CD4055B/CD4543 siblings, issues.md C2) and
// four behaviors:
//   • STROBE=HIGH (transparent): combinational decode of all 16 codes to the
//     datasheet segment patterns (DF=LOW → selected segments drive HIGH);
//   • DF=HIGH inverts every segment output (common-anode polarity);
//   • STROBE=LOW latches the displayed digit (inputs may change, output holds);
//   • taking STROBE HIGH again re-opens the latch and updates the display.
//
// Run:  node js/debug/scenarios/cd4056-bcd-7seg-lcd.mjs   (exits non-zero on fail)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4056');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// Verified TRUTH TABLE FOR CD4056B (SCHS048C), active-HIGH reference (DF=LOW).
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

function apply({ code, df, st }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4056 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('A', (code >> 0) & 1);
  wirePin('B', (code >> 1) & 1);
  wirePin('C', (code >> 2) & 1);
  wirePin('D', (code >> 3) & 1);
  wirePin('ST', st ? 1 : 0);
  wirePin('DF', df ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const segBits = () => SEGS.map(s => isHigh(read(s)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 0. Verified CD4056B terminal assignment (SCHS048C, 92CS-24487) ───────────
const def = getChipDef('CD4056');
assert(!!def, 'CD4056 should be present in CHIP_DB');
if (def) {
  assert(def.pins === 16 && def.vcc === 16 && def.gnd === 8,
    `package: pins=16,vcc=16,gnd=8 — got ${def.pins}/${def.vcc}/${def.gnd}`);
  const expected = {
    1: 'ST', 2: 'C', 3: 'B', 4: 'D', 5: 'A', 6: 'DF', 7: 'VEE', 8: 'VSS',
    9: 'a', 10: 'b', 11: 'c', 12: 'd', 13: 'e', 14: 'g', 15: 'f', 16: 'VDD',
  };
  const byPin = Object.fromEntries(def.pinout.map(p => [p.pin, p.name]));
  for (const [pin, name] of Object.entries(expected)) {
    assert(byPin[pin] === name, `pin ${pin} should be ${name}, got ${byPin[pin]}`);
  }
}

// ── 1. STROBE=HIGH, DF=LOW: every code decodes to the active-HIGH pattern ─────
for (let code = 0; code < 16; code++) {
  apply({ code, df: 0, st: 1 });
  const got = segBits();
  assert(got.join('') === TABLE[code].join(''),
    `ST=HIGH DF=LOW code ${code}: expected [${TABLE[code]}] got [${got}]`);
}

// ── 2. STROBE=HIGH, DF=HIGH: every segment output is inverted ────────────────
for (let code = 0; code < 16; code++) {
  apply({ code, df: 1, st: 1 });
  const got = segBits();
  const want = TABLE[code].map(b => b ^ 1);
  assert(got.join('') === want.join(''),
    `ST=HIGH DF=HIGH code ${code}: expected [${want}] got [${got}]`);
}

// ── 3. STROBE latch: load "3", then hold while inputs change to "8" ──────────
apply({ code: 3, df: 0, st: 1 });                 // transparent: show 3
assert(segBits().join('') === TABLE[3].join(''), 'latch load: should show "3"');
apply({ code: 8, df: 0, st: 0 });                 // latched: inputs say 8, hold 3
assert(segBits().join('') === TABLE[3].join(''),
  `latch hold: ST=LOW should keep "3" even with code 8 on inputs, got [${segBits()}]`);
apply({ code: 8, df: 0, st: 1 });                 // transparent again: update to 8
assert(segBits().join('') === TABLE[8].join(''),
  `latch reopen: ST=HIGH should update to "8", got [${segBits()}]`);

// ── 4. Spot-check a few named characters for human sanity ────────────────────
apply({ code: 8, df: 0, st: 1 });
assert(segBits().every(b => b === 1), 'code 8 ("8") should light all seven segments');
apply({ code: 10, df: 0, st: 1 });
assert(segBits().join('') === '0001110', 'code 10 ("L") should light d,e,f only');
apply({ code: 14, df: 0, st: 1 });
assert(segBits().join('') === '0000001', 'code 14 ("-") should light only segment g');
apply({ code: 15, df: 0, st: 1 });
assert(segBits().every(b => b === 0), 'code 15 (blank) should light no segments');

console.log(`cd4056-bcd-7seg-lcd: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
