// ── 74x48 BCD-to-7-segment decoder/driver (common cathode) — regression ──────
// The 74x48 (js/chips/chips1.js) drives the BCD_7SEG_CC_7448 primitive. This
// guard pins down the datasheet-verified behaviour of the part.
//
// Verified against TI SDLS111 ("BCD-to-Seven-Segment Decoders/Drivers", Mar. 1974,
// rev. Mar. 1988): TERMINAL ASSIGNMENT (D/N package, TOP VIEW, p.1) and the
// '48/'LS48 FUNCTION TABLE T2 (p.4), read as 300-dpi PDF page images (issues.md C4).
//
// The bug this was written for — font/glyph: the shared BCD_7SEG_CC_TABLE draws
//   the "with tails" 6 and 9 (correct for the '247/'248). The SN7448 draws a
//   TAIL-LESS 6 (segment a OFF) and TAIL-LESS 9 (segment d OFF). 74x48 was moved
//   to a dedicated tail-less primitive; digits 6 and 9 below assert the tail-less
//   pattern, so a regression back to the shared tailed table fails here. See
//   issues.md C108.
//
// Behaviors checked: physical pinout (pin number → name), active-HIGH decode of
//   0-9, LT#=LOW lamp test (all on), BI#=LOW blank (all off), and RBI#=LOW
//   zero-blank of a decimal 0 vs RBI#=HIGH showing the 0.
//
// Note: BCD inputs 10-15 (invalid) are not decoded by the shared table, so they
//   are not asserted here — the real chip shows odd partial glyphs for them.
//
// Run:  node js/debug/scenarios/74x48-bcd-7seg-cc.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x48');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// Active-HIGH segment patterns from the '48/'LS48 function table (T2), common
// cathode. Note the TAIL-LESS 6 (a off) and TAIL-LESS 9 (d off) — this is the
// glyph font that distinguishes the '48 from the '247/'248.
//                a  b  c  d  e  f  g
const TABLE = [
  /* 0 */ [1, 1, 1, 1, 1, 1, 0],
  /* 1 */ [0, 1, 1, 0, 0, 0, 0],
  /* 2 */ [1, 1, 0, 1, 1, 0, 1],
  /* 3 */ [1, 1, 1, 1, 0, 0, 1],
  /* 4 */ [0, 1, 1, 0, 0, 1, 1],
  /* 5 */ [1, 0, 1, 1, 0, 1, 1],
  /* 6 */ [0, 0, 1, 1, 1, 1, 1], // tail-less: segment a OFF
  /* 7 */ [1, 1, 1, 0, 0, 0, 0],
  /* 8 */ [1, 1, 1, 1, 1, 1, 1],
  /* 9 */ [1, 1, 1, 0, 0, 1, 1], // tail-less: segment d OFF
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 0. Physical pinout (catches a swapped/invented pin map) ───────────────────
// Datasheet terminal assignment (D/N package, TOP VIEW), pin → name.
const EXPECT_PINS = {
  1: 'B', 2: 'C', 3: 'LT', 4: 'BI/RBO', 5: 'RBI', 6: 'D', 7: 'A', 8: 'GND',
  9: 'e', 10: 'd', 11: 'c', 12: 'b', 13: 'a', 14: 'g', 15: 'f', 16: 'VCC',
};
for (const [pin, name] of Object.entries(EXPECT_PINS)) {
  const p = chip.getPinByNumber(Number(pin));
  assert(p && p.name === name,
    `pin ${pin}: expected "${name}", got "${p ? p.name : '(missing)'}"`);
}

// Drive the four BCD inputs plus the three active-LOW control pins; re-solve
// combinationally (the '48 has no stored state). Defaults: normal decode.
function apply({ code, lt = 1, bi = 1, rbi = 1 }) {
  const wm = new WireManager();
  const wireLevel = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x48 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wireLevel('VCC', 1);
  wireLevel('GND', 0);
  wireLevel('A', (code >> 0) & 1);
  wireLevel('B', (code >> 1) & 1);
  wireLevel('C', (code >> 2) & 1);
  wireLevel('D', (code >> 3) & 1);
  wireLevel('LT', lt);
  wireLevel('BI/RBO', bi);
  wireLevel('RBI', rbi);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const segBits = () => SEGS.map(s => isHigh(read(s)) ? 1 : 0);

// ── 1. Normal decode of 0-9 (catches the tailed-6/9 font bug) ────────────────
for (let code = 0; code <= 9; code++) {
  apply({ code });
  const want = TABLE[code];
  const got = segBits();
  assert(got.join('') === want.join(''),
    `decode ${code}: expected [${want}] got [${got}]`);
}

// ── 2. LT#=LOW lamp test → all seven segments ON ──────────────────────────────
apply({ code: 3, lt: 0 });
assert(segBits().every(b => b === 1),
  `LT#=LOW should light all segments, got [${segBits()}]`);

// ── 3. BI#=LOW blanking → all segments OFF regardless of BCD ─────────────────
apply({ code: 8, bi: 0 });
assert(segBits().every(b => b === 0),
  `BI#=LOW should blank all segments, got [${segBits()}]`);

// ── 4. RBI# zero suppression: RBI#=LOW + code 0 blanks; RBI#=HIGH shows 0 ─────
apply({ code: 0, rbi: 0 });
assert(segBits().every(b => b === 0),
  `RBI#=LOW with input 0 should blank the digit, got [${segBits()}]`);
apply({ code: 0, rbi: 1 });
assert(segBits().join('') === TABLE[0].join(''),
  `RBI#=HIGH with input 0 should show "0", got [${segBits()}]`);

console.log(`74x48-bcd-7seg-cc: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
