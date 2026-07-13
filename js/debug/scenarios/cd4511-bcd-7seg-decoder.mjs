// ── CD4511 BCD-to-7-segment latch/decoder/driver — regression ────────────────
// The CD4511 (js/chips/chips68.js) maps onto the BCD_7SEG_4511 engine primitive.
// This guard pins down two hand-entry bugs found in the July 2026 docs pass and
// the four control behaviors from the datasheet function table.
//
// Verified against TI/Harris CD4511B (SCHS072B, Rev. July 2003): TERMINAL
// ASSIGNMENT + FUNCTIONAL DIAGRAM (p.1) and TRUTH TABLE (p.4), read as 400-dpi
// PDF page images (issues.md C4).
//
// Bug 1 — pinout: the segment outputs had been entered a..g in sequence on pins
//   9..15. The real part orders them e(9) d(10) c(11) b(12) a(13) g(14) f(15).
//   Checked here by physical pin number so a name-only test can't mask it.
// Bug 2 — font: the evaluator drew the modern "tailed" 6 and 9. The CD4511B draws
//   a tail-less 6 (segment a OFF) and a tail-less 9 (segment d OFF).
//
// Behaviors checked: transparent decode (0-9), blank on invalid codes (10-15),
//   LE=HIGH latch/hold, BL=LOW blank, LT=LOW lamp test, and the LT > BL > LE
//   priority order.
//
// Run:  node js/debug/scenarios/cd4511-bcd-7seg-decoder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4511');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// Active-HIGH segment patterns from the CD4511B truth table (common cathode).
// Note the tail-less 6 (a off) and tail-less 9 (d off) — specific to this part.
//                a  b  c  d  e  f  g
const TABLE = [
  /* 0 */ [1, 1, 1, 1, 1, 1, 0],
  /* 1 */ [0, 1, 1, 0, 0, 0, 0],
  /* 2 */ [1, 1, 0, 1, 1, 0, 1],
  /* 3 */ [1, 1, 1, 1, 0, 0, 1],
  /* 4 */ [0, 1, 1, 0, 0, 1, 1],
  /* 5 */ [1, 0, 1, 1, 0, 1, 1],
  /* 6 */ [0, 0, 1, 1, 1, 1, 1],
  /* 7 */ [1, 1, 1, 0, 0, 0, 0],
  /* 8 */ [1, 1, 1, 1, 1, 1, 1],
  /* 9 */ [1, 1, 1, 0, 0, 1, 1],
];
const BLANK = [0, 0, 0, 0, 0, 0, 0];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 0. Physical pinout (catches Bug 1) ───────────────────────────────────────
// Datasheet terminal assignment, pin → name.
const EXPECT_PINS = {
  1: 'D1', 2: 'D2', 3: 'LT', 4: 'BL', 5: 'LE', 6: 'D3', 7: 'D0', 8: 'GND',
  9: 'e', 10: 'd', 11: 'c', 12: 'b', 13: 'a', 14: 'g', 15: 'f', 16: 'VDD',
};
for (const [pin, name] of Object.entries(EXPECT_PINS)) {
  const p = chip.getPinByNumber(Number(pin));
  assert(p && p.name === name,
    `pin ${pin}: expected "${name}", got "${p ? p.name : '(missing)'}"`);
}

// One evaluation pass. The same sim + chip persist across calls so the latch's
// stored value survives (the part is sequential).
function apply({ code, le, bl, lt }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4511 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  wirePin('D0', (code >> 0) & 1);
  wirePin('D1', (code >> 1) & 1);
  wirePin('D2', (code >> 2) & 1);
  wirePin('D3', (code >> 3) & 1);
  wirePin('LE', le ? 1 : 0);
  wirePin('BL', bl ? 1 : 0);
  wirePin('LT', lt ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const segBits = () => SEGS.map(s => isHigh(read(s)) ? 1 : 0);

// ── 1. Transparent decode: codes 0-9 decode (catches Bug 2), 10-15 blank ─────
// LE=LOW transparent, BL=HIGH (no blank), LT=HIGH (no lamp test).
for (let code = 0; code < 16; code++) {
  apply({ code, le: 0, bl: 1, lt: 1 });
  const want = code <= 9 ? TABLE[code] : BLANK;
  const got = segBits();
  assert(got.join('') === want.join(''),
    `decode code ${code}: expected [${want}] got [${got}]`);
}

// ── 2. LE=HIGH latches the last transparent value ────────────────────────────
apply({ code: 5, le: 0, bl: 1, lt: 1 });            // load "5" transparently
assert(segBits().join('') === TABLE[5].join(''), 'load 5 failed');
apply({ code: 8, le: 1, bl: 1, lt: 1 });            // latch: inputs say 8, display holds 5
assert(segBits().join('') === TABLE[5].join(''),
  `hold: display should stay "5" with LE=HIGH, got [${segBits()}]`);
apply({ code: 8, le: 0, bl: 1, lt: 1 });            // transparent again: now shows 8
assert(segBits().join('') === TABLE[8].join(''),
  `reopen: display should follow to "8" with LE=LOW, got [${segBits()}]`);

// ── 3. BL=LOW blanks all segments (overrides decode) ─────────────────────────
apply({ code: 8, le: 0, bl: 0, lt: 1 });
assert(segBits().every(b => b === 0),
  `BL=LOW should blank all segments, got [${segBits()}]`);

// ── 4. LT=LOW lamp test lights all segments (highest priority) ───────────────
// Also blank (BL=LOW) at the same time to prove LT wins over BL.
apply({ code: 3, le: 0, bl: 0, lt: 0 });
assert(segBits().every(b => b === 1),
  `LT=LOW should light all segments even with BL=LOW, got [${segBits()}]`);

console.log(`cd4511-bcd-7seg-decoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
