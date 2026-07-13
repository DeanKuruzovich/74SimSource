// ── 74x4543 BCD-to-7-segment latch/decoder/driver for LCDs — regression ──────
// The 74x4543 (js/chips/chips59.js) maps onto the BCD_7SEG_4543_HC engine
// primitive. It was upgraded from an inert documentation stub whose hand-entered
// pinout was wrong; this guard pins down the corrected pinout AND the four
// behaviors from the datasheet function table.
//
// Verified against TI/Harris CD74HC4543 (SCHS217B, function table page 2) and the
// original CD4543B (SCHS086D, "TRUTH TABLE FOR CD4543B", page 5) — identical
// pinout and behavior, read as rendered PDF page images (issues.md C4). Corrected
// pinout: LD pin1; C(2^2) pin2, B(2^1) pin3, D(2^3) pin4, A(2^0) pin5; PH pin6,
// BI pin7, GND pin8; a 9, b 10, c 11, d 12, e 13, g 14, f 15, VCC 16.
//
// Behaviors checked:
//   • LD=HIGH transparent: outputs follow the BCD inputs (codes 0-9 decode to the
//     datasheet segment patterns; codes 10-15 blank).
//   • LD=LOW holds the last digit loaded while LD was HIGH.
//   • BI=HIGH blanks all seven segments.
//   • PH=HIGH inverts every segment output (common-anode / LCD anti-phase).
//
// Run:  node js/debug/scenarios/74x4543-bcd-7seg-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4543');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// Active-HIGH reference patterns (PH=LOW), datasheet function table.
//                a  b  c  d  e  f  g
const TABLE = [
  /* 0 */ [1, 1, 1, 1, 1, 1, 0],
  /* 1 */ [0, 1, 1, 0, 0, 0, 0],
  /* 2 */ [1, 1, 0, 1, 1, 0, 1],
  /* 3 */ [1, 1, 1, 1, 0, 0, 1],
  /* 4 */ [0, 1, 1, 0, 0, 1, 1],
  /* 5 */ [1, 0, 1, 1, 0, 1, 1],
  /* 6 */ [1, 0, 1, 1, 1, 1, 1],
  /* 7 */ [1, 1, 1, 0, 0, 0, 0],
  /* 8 */ [1, 1, 1, 1, 1, 1, 1],
  /* 9 */ [1, 1, 1, 1, 0, 1, 1],
];
const BLANK = [0, 0, 0, 0, 0, 0, 0];

// One evaluation pass with the given control/data levels. The same sim + chip are
// reused across calls so the latch's stored value persists (it is sequential).
function apply({ code, ld, bi, ph }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4543 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('A', (code >> 0) & 1);
  wirePin('B', (code >> 1) & 1);
  wirePin('C', (code >> 2) & 1);
  wirePin('D', (code >> 3) & 1);
  wirePin('LD', ld ? 1 : 0);
  wirePin('BI', bi ? 1 : 0);
  wirePin('PH', ph ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const segBits = () => SEGS.map(s => isHigh(read(s)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. LD=HIGH transparent: codes 0-9 decode; 10-15 blank ────────────────────
for (let code = 0; code < 16; code++) {
  apply({ code, ld: 1, bi: 0, ph: 0 });
  const want = code <= 9 ? TABLE[code] : BLANK;
  const got = segBits();
  assert(got.join('') === want.join(''),
    `LD=H code ${code}: expected [${want}] got [${got}]`);
}

// ── 2. LD=LOW holds the last loaded digit ────────────────────────────────────
apply({ code: 5, ld: 1, bi: 0, ph: 0 });            // load "5"
assert(segBits().join('') === TABLE[5].join(''), 'load 5 failed');
apply({ code: 8, ld: 0, bi: 0, ph: 0 });            // hold: inputs say 8, display stays 5
assert(segBits().join('') === TABLE[5].join(''),
  `hold: display should stay "5" with LD=LOW, got [${segBits()}]`);
apply({ code: 8, ld: 1, bi: 0, ph: 0 });            // re-open latch: now shows 8
assert(segBits().join('') === TABLE[8].join(''),
  `reload: display should follow to "8" with LD=HIGH, got [${segBits()}]`);

// ── 3. BI=HIGH blanks all segments (overrides decode) ────────────────────────
apply({ code: 8, ld: 1, bi: 1, ph: 0 });
assert(segBits().every(b => b === 0),
  `BI=HIGH should blank all segments, got [${segBits()}]`);

// ── 4. PH=HIGH inverts every output (common-anode / LCD anti-phase) ──────────
for (const code of [0, 3, 8]) {
  apply({ code, ld: 1, bi: 0, ph: 1 });
  const want = TABLE[code].map(b => b ^ 1);
  assert(segBits().join('') === want.join(''),
    `PH=H code ${code}: expected [${want}] got [${segBits()}]`);
}
// PH also inverts the blank state: blanked display reads all-HIGH under PH=HIGH.
apply({ code: 8, ld: 1, bi: 1, ph: 1 });
assert(segBits().every(b => b === 1),
  `PH=H + BI=H: blanked display should read all-HIGH, got [${segBits()}]`);

console.log(`74x4543-bcd-7seg-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
