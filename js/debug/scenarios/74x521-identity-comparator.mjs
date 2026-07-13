// ── 74x521 regression: 8-bit identity comparator, interleaved A/B pinout ─────
// The '521 pulls its single output (pin 19) LOW when the two 8-bit words A and B
// are equal AND the enable (pin 1) is LOW. Equality only — no A>B. It is the
// inverting (active-LOW), totem-pole, no-input-pull-up member of the family and
// is functionally identical to the 74x688.
//
// This scenario guards a real bug fixed 2026-07-04 (issues.md C102). The prior
// hand-entered entry (Wikipedia-only) got THREE things wrong at once:
//   1. pinout GROUPED — A0-A7 on pins 2-9, B0-B7 on pins 11-18. The real part
//      INTERLEAVES them (A0,B0,A1,B1,...).
//   2. output polarity backwards — modeled active HIGH; the real output is
//      active LOW (LOW when equal).
//   3. output type wrong — modeled tri-state; the real '521 output is totem-pole
//      (disabled -> driven HIGH, not high-Z).
// Verified against TI SDAS224B (SN74ALS521, terminal diagram + function table)
// and Fairchild DS009545 (74F521, connection diagram + truth table), both read
// as PDF page images (issues.md C4, not a text summarizer). Verified DIP-20 map:
//   G1n=1; A0=2,B0=3,A1=4,B1=5,A2=6,B2=7,A3=8,B3=9; GND=10;
//   A4=11,B4=12,A5=13,B5=14,A6=15,B6=16,A7=17,B7=18; EQn(out)=19; VCC=20.
//
// Why a NAME-based test would miss the interleave bug: COMPARATOR_8BIT_EQ
// resolves its inputs by pin NAME, so equality still computes correctly no
// matter which physical hole a name sits on. To catch a *physical* pinout error
// the checks below assert the pin->name map directly AND drive holes by physical
// PIN NUMBER using a word pattern that is equal under the interleaved map but
// UNequal under the old grouped map, so the equality result itself flips.
//
// Run:  node js/debug/scenarios/74x521-identity-comparator.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent, deserializeComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmtV = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3) + 'V';
const isLow  = v => v !== undefined && v !== null && !Number.isNaN(v) && v < 1.5;
const isHigh = v => v !== undefined && v !== null && !Number.isNaN(v) && v > 3.5;

// Valid physical power-rail columns (10 groups of 5: 2-6, 8-12, ...).
const RAIL_COLS = [2, 8, 14, 20, 26, 32, 38, 44, 50, 56].flatMap(b => [b, b + 1, b + 2, b + 3, b + 4]);

// Build a powered 74x521 and drive its input holes BY PHYSICAL PIN NUMBER.
//   data: { <pinNumber>: 0|1 } for the 16 data pins (2-9, 11-18)
//   g:    0|1 for the enable on pin 1 (active LOW)
// Returns the voltage on the A=B output (physical pin 19).
function evalOut(data, g) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x521');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();

  let railIdx = 0;
  const wirePin = (pinNum, level) => {
    const pin = chip.getPinByNumber(pinNum);
    const col = RAIL_COLS[railIdx++];
    const row = level ? 1 : 0;           // power rail row 1 = top+ (5V), row 0 = top- (GND)
    wm.addWire(pin.holeId, holeId(0, 0, 'power', col, row));
  };

  wirePin(20, 1);                        // VCC -> 5V
  wirePin(10, 0);                        // GND -> 0V
  wirePin(1, g);                         // enable (active LOW)
  for (const [pinNum, level] of Object.entries(data)) wirePin(Number(pinNum), level);

  // 10k pull-up on the output (pin 19). The totem-pole driver overpowers it when
  // the chip is enabled, so a match still reads ~0V and a mismatch ~5V. When the
  // chip is DISABLED the engine floats the output (a small simplification vs. the
  // datasheet's driven HIGH); the pull-up then holds the de-asserted line HIGH,
  // which is the level the real '521 drives when disabled.
  const outHole = chip.getPinByNumber(19).holeId;
  const pullup = deserializeComponent({
    type: 'resistor', id: 900, resistance: 10000,
    startHoleId: outHole, endHoleId: holeId(0, 0, 'power', RAIL_COLS[railIdx++], 1),
  });

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, pullup], wm);
  return sim.getVoltageAtHole(outHole);
}

// Two words EQUAL under the interleaved pinout: every adjacent (A,B) hole pair
// carries the same level, so A0..A7 == B0..B7. The low half (pins 2-9) and high
// half (pins 11-18) deliberately differ, so under the OLD GROUPED pinout
// (A=pins2-9, B=pins11-18) the two words are UNequal and the output would read
// HIGH — check 1 then fails loudly on the old map.
const EQUAL_A = {
  2: 1, 3: 1,  4: 1, 5: 1,  6: 0, 7: 0,  8: 0, 9: 0,       // A0B0 A1B1 A2B2 A3B3
  11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 16: 1, 17: 1, 18: 1,  // A4B4 A5B5 A6B6 A7B7
};
// A second, different equal pattern for good measure.
const EQUAL_B = {
  2: 0, 3: 0,  4: 0, 5: 0,  6: 1, 7: 1,  8: 1, 9: 1,
  11: 1, 12: 1, 13: 1, 14: 1, 15: 0, 16: 0, 17: 0, 18: 0,
};

// ── 0. Physical pin -> name map matches the verified interleaved pinout ───────
{
  console.log('\n0. Physical pin map is interleaved (A0,B0,A1,B1,... not grouped)');
  const expected = {
    1: 'G1n', 2: 'A0', 3: 'B0', 4: 'A1', 5: 'B1', 6: 'A2', 7: 'B2', 8: 'A3',
    9: 'B3', 10: 'GND', 11: 'A4', 12: 'B4', 13: 'A5', 14: 'B5', 15: 'A6',
    16: 'B6', 17: 'A7', 18: 'B7', 19: 'EQn', 20: 'VCC',
  };
  const chip = new ChipComponent('74x521');
  chip.place(0, 0, 2, 4);
  let bad = [];
  for (const [num, name] of Object.entries(expected)) {
    const got = chip.getPinByNumber(Number(num))?.name;
    if (got !== name) bad.push(`pin ${num}: ${got} (want ${name})`);
  }
  check('all 20 pins match the datasheet terminal assignment', bad.length === 0, bad.join('; '));
}

// ── 1. Equal words, enabled → output LOW ─────────────────────────────────────
{
  console.log('\n1. A == B and enable = LOW → output LOW (match asserted)');
  const out = evalOut(EQUAL_A, 0);
  check('output pulled LOW on a match', isLow(out), `Vout=${fmtV(out)}`);
}

// ── 2. One bit different, enabled → output HIGH ──────────────────────────────
// Flip pin 3 (B0) so the A0/B0 pair disagrees; every other pair still matches.
{
  console.log('\n2. One bit differs (B0) and enable = LOW → output HIGH (no match)');
  const out = evalOut({ ...EQUAL_A, 3: 0 }, 0);
  check('output HIGH when a single bit differs', isHigh(out), `Vout=${fmtV(out)}`);
}

// ── 3. Second equal pattern, enabled → output LOW ────────────────────────────
{
  console.log('\n3. Different equal word (bits inverted), enable = LOW → output LOW');
  const out = evalOut(EQUAL_B, 0);
  check('output LOW on a second matching pattern', isLow(out), `Vout=${fmtV(out)}`);
}

// ── 4. Enable HIGH forces the output inactive ────────────────────────────────
// Equal words, but enable = HIGH. The datasheet forces the output HIGH when
// disabled; the engine floats it (a small simplification), so the 10k pull-up in
// evalOut() holds the de-asserted line HIGH. Either way the match is NOT asserted.
{
  console.log('\n4. A == B but enable = HIGH → comparison disabled, output de-asserted (HIGH)');
  const out = evalOut(EQUAL_A, 1);
  check('output HIGH (not asserted) while disabled', isHigh(out), `Vout=${fmtV(out)}`);
}

console.log(failures === 0 ? '\nAll 74x521 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
