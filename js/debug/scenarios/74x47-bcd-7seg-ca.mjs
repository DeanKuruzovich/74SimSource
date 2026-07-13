// ── 74x47 BCD-to-7-segment decoder/driver (common anode, OC) — regression ────
// The 74x47 (js/chips/chips1.js) drives the BCD_7SEG_7447 primitive. This guard
// pins down the datasheet-verified behaviour of the part.
//
// Verified against TI SDLS111 ("BCD-to-Seven-Segment Decoders/Drivers", Mar. 1974,
// rev. Mar. 1988): TERMINAL ASSIGNMENT (D/N package, TOP VIEW, p.1), the driver-
// outputs table (SN74LS47 = active-LOW, OPEN-COLLECTOR, 24 mA sink, 15 V max, p.2),
// and the '46A/'47A/'LS47 FUNCTION TABLE T1 (p.3), read as 300-dpi PDF page images
// (issues.md C4). The sn74ls47.pdf symlink resolves to SDLS111.
//
// Two bugs this was written for (issues.md C115):
//   1. Glyph/font — the '47 was on the shared BCD_7SEG table, which draws 6 and 9
//      "with tails" (correct for the '246/'247). SDLS111 T1 shows the '47 draws a
//      TAIL-LESS 6 (segment a OFF) and TAIL-LESS 9 (segment d OFF). Digits 6 and 9
//      below assert the tail-less pattern, so a regression back to the shared tailed
//      table fails here.
//   2. Open collector — the entry omitted openCollector:true (every sibling sets it).
//      Check 0 asserts the flag directly.
//
// Because the outputs are open collector and active LOW, a lit segment is pulled
//   LOW and a dark segment is RELEASED (Hi-Z) and read HIGH via the engine's
//   implicit pull-up (issues.md A8) — no explicit pull-up is wired. So the tables
//   below are in OUTPUT-LEVEL terms: 0 = LOW = segment ON, 1 = HIGH = segment OFF.
//
// Behaviors checked: openCollector flag, physical pinout (pin number → name),
//   active-LOW decode of 0-9 (with tail-less 6 and 9), LT#=LOW lamp test (all on),
//   BI#=LOW blank (all off), and RBI#=LOW zero-blank of a decimal 0 vs RBI#=HIGH
//   showing the 0.
//
// Note: BCD inputs 10-15 (invalid) are not decoded by the table, so they are not
//   asserted here — the real chip shows fixed odd partial glyphs for them.
//
// Run:  node js/debug/scenarios/74x47-bcd-7seg-ca.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V; OC HIGH is the pull-up)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x47');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// OUTPUT-LEVEL patterns from the '46A/'47A/'LS47 function table (T1), active LOW /
// common anode: 0 = LOW = segment ON, 1 = HIGH = segment OFF. Note the TAIL-LESS 6
// (segment a OFF) and TAIL-LESS 9 (segment d OFF) — this is the glyph font that
// distinguishes the '46/'47 from the '246/'247.
//                a  b  c  d  e  f  g
const TABLE = [
  /* 0 */ [0, 0, 0, 0, 0, 0, 1],
  /* 1 */ [1, 0, 0, 1, 1, 1, 1],
  /* 2 */ [0, 0, 1, 0, 0, 1, 0],
  /* 3 */ [0, 0, 0, 0, 1, 1, 0],
  /* 4 */ [1, 0, 0, 1, 1, 0, 0],
  /* 5 */ [0, 1, 0, 0, 1, 0, 0],
  /* 6 */ [1, 1, 0, 0, 0, 0, 0], // tail-less: segment a OFF
  /* 7 */ [0, 0, 0, 1, 1, 1, 1],
  /* 8 */ [0, 0, 0, 0, 0, 0, 0],
  /* 9 */ [0, 0, 0, 1, 1, 0, 0], // tail-less: segment d OFF
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 0. Open-collector flag (guards the missing-openCollector bug) ─────────────
assert(chip.chipDef && chip.chipDef.openCollector === true,
  `74x47 must set openCollector:true (real part is open-collector), got ${chip.chipDef && chip.chipDef.openCollector}`);

// ── 0b. Physical pinout (catches a swapped/invented pin map) ──────────────────
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
// combinationally (the '47 has no stored state). Defaults: normal decode.
function apply({ code, lt = 1, bi = 1, rbi = 1 }) {
  const wm = new WireManager();
  const wireLevel = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x47 has no pin named ${name}`);
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
    `decode ${code}: expected [${want}] got [${got}] (0=ON/LOW, 1=OFF/HIGH)`);
}

// ── 1b. Explicit tail-less checks (clear message on a font regression) ────────
apply({ code: 6 });
assert(isHigh(read('a')), 'digit 6 must be TAIL-LESS: segment a OFF (output HIGH)');
apply({ code: 9 });
assert(isHigh(read('d')), 'digit 9 must be TAIL-LESS: segment d OFF (output HIGH)');

// ── 2. LT#=LOW lamp test → all seven segments ON (all outputs LOW) ────────────
apply({ code: 3, lt: 0 });
assert(segBits().every(b => b === 0),
  `LT#=LOW should light all segments (all LOW), got [${segBits()}]`);

// ── 3. BI#=LOW blanking → all segments OFF (all outputs HIGH) regardless of BCD
apply({ code: 8, bi: 0 });
assert(segBits().every(b => b === 1),
  `BI#=LOW should blank all segments (all HIGH), got [${segBits()}]`);

// ── 4. RBI# zero suppression: RBI#=LOW + code 0 blanks; RBI#=HIGH shows 0 ─────
apply({ code: 0, rbi: 0 });
assert(segBits().every(b => b === 1),
  `RBI#=LOW with input 0 should blank the digit (all HIGH), got [${segBits()}]`);
apply({ code: 0, rbi: 1 });
assert(segBits().join('') === TABLE[0].join(''),
  `RBI#=HIGH with input 0 should show "0", got [${segBits()}]`);

console.log(`74x47-bcd-7seg-ca: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
