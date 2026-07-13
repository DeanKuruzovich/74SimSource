// ── 74x688 regression: 8-bit identity comparator, interleaved P/Q pinout ─────
// The 'LS688 pulls its single P=Q output (pin 19) LOW when the two 8-bit words
// P and Q are equal AND the enable /G (pin 1) is LOW. Equality only — no P>Q.
//
// This scenario guards a real pinout bug fixed 2026-07-04 (issues.md C95). The
// prior hand-entered pinout GROUPED the inputs (P0-P7 on pins 2-9, Q7-Q0 on
// 11-18). The real part INTERLEAVES them, verified against TI SDLS008
// (SN74LS688, DW/N package terminal diagram + 'LS688 logic symbol, read as
// 300-dpi PDF page images):
//   G=1; P0=2,Q0=3,P1=4,Q1=5,P2=6,Q2=7,P3=8,Q3=9; GND=10;
//   P4=11,Q4=12,P5=13,Q5=14,P6=15,Q6=16,P7=17,Q7=18; P=Q(out)=19; VCC=20.
//
// Why a NAME-based test would miss the bug: the COMPARATOR_8BIT_EQ evaluator
// resolves its inputs by pin NAME, so equality still computes correctly no
// matter which physical hole a name sits on. To catch a *physical* pinout
// error the checks below drive holes by physical PIN NUMBER and also assert the
// pin→name map directly. Both fail loudly under the old grouped pinout.
//
// Run:  node js/debug/scenarios/74x688-identity-comparator.mjs  (exits non-zero on fail)

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

// Build a powered 74x688 and drive its input holes BY PHYSICAL PIN NUMBER.
//   data: { <pinNumber>: 0|1 } for the 16 data pins (2-9, 11-18)
//   g:    0|1 for the enable on pin 1
// Returns the voltage on the P=Q output (physical pin 19).
function evalOut(data, g) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x688');
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
  wirePin(1, g);                         // /G enable
  for (const [pinNum, level] of Object.entries(data)) wirePin(Number(pinNum), level);

  // 10k pull-up on the P=Q output (pin 19). The totem-pole driver overpowers it
  // when the chip is enabled, so a match still reads ~0V and a mismatch ~5V.
  // When the chip is DISABLED the engine floats the output (HiZ); the pull-up
  // then holds it HIGH — which is also what the real 'LS688 drives when /G=HIGH.
  const outHole = chip.getPinByNumber(19).holeId;
  const pullup = deserializeComponent({
    type: 'resistor', id: 900, resistance: 10000,
    startHoleId: outHole, endHoleId: holeId(0, 0, 'power', RAIL_COLS[railIdx++], 1),
  });

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, pullup], wm);
  return sim.getVoltageAtHole(outHole);
}

// Two words that are EQUAL under the correct interleaved pinout: every adjacent
// (P,Q) hole pair carries the same level, so P0..P7 == Q0..Q7.
// Under the OLD grouped pinout these same holes make P != Q, so P=Q would read
// HIGH and check 1 would fail.
const EQUAL_A = {
  2: 1, 3: 1,  4: 0, 5: 0,  6: 1, 7: 1,  8: 0, 9: 0,       // P0Q0 P1Q1 P2Q2 P3Q3
  11: 1, 12: 1, 13: 0, 14: 0, 15: 1, 16: 1, 17: 0, 18: 0,  // P4Q4 P5Q5 P6Q6 P7Q7
};
// A second, different equal pattern (bits inverted) for good measure.
const EQUAL_B = {
  2: 0, 3: 0,  4: 1, 5: 1,  6: 0, 7: 0,  8: 1, 9: 1,
  11: 0, 12: 0, 13: 1, 14: 1, 15: 0, 16: 0, 17: 1, 18: 1,
};

// ── 0. Physical pin → name map matches the verified interleaved pinout ───────
{
  console.log('\n0. Physical pin map is interleaved (P0,Q0,P1,Q1,... not grouped)');
  const expected = {
    1: 'G', 2: 'P0', 3: 'Q0', 4: 'P1', 5: 'Q1', 6: 'P2', 7: 'Q2', 8: 'P3',
    9: 'Q3', 10: 'GND', 11: 'P4', 12: 'Q4', 13: 'P5', 14: 'Q5', 15: 'P6',
    16: 'Q6', 17: 'P7', 18: 'Q7', 19: 'PEQQ', 20: 'VCC',
  };
  const chip = new ChipComponent('74x688');
  chip.place(0, 0, 2, 4);
  let bad = [];
  for (const [num, name] of Object.entries(expected)) {
    const got = chip.getPinByNumber(Number(num))?.name;
    if (got !== name) bad.push(`pin ${num}: ${got} (want ${name})`);
  }
  check('all 20 pins match the datasheet terminal assignment', bad.length === 0, bad.join('; '));
}

// ── 1. Equal words, enabled → P=Q LOW ────────────────────────────────────────
{
  console.log('\n1. P == Q and /G = LOW → P=Q output LOW (match asserted)');
  const out = evalOut(EQUAL_A, 0);
  check('P=Q output pulled LOW on a match', isLow(out), `Vout=${fmtV(out)}`);
}

// ── 2. One bit different, enabled → P=Q HIGH ─────────────────────────────────
// Flip pin 3 (Q0) so the P0/Q0 pair disagrees; every other pair still matches.
{
  console.log('\n2. One bit differs (Q0) and /G = LOW → P=Q output HIGH (no match)');
  const out = evalOut({ ...EQUAL_A, 3: 0 }, 0);
  check('P=Q output HIGH when a single bit differs', isHigh(out), `Vout=${fmtV(out)}`);
}

// ── 3. Second equal pattern, enabled → P=Q LOW ───────────────────────────────
{
  console.log('\n3. Different equal word (bits inverted), /G = LOW → P=Q output LOW');
  const out = evalOut(EQUAL_B, 0);
  check('P=Q output LOW on a second matching pattern', isLow(out), `Vout=${fmtV(out)}`);
}

// ── 4. Enable HIGH forces the output inactive ────────────────────────────────
// Equal words, but /G = HIGH. The datasheet forces P=Q HIGH when disabled; the
// engine models the disabled output as high-impedance (a small simplification),
// so the 10k pull-up in evalOut() holds the de-asserted line HIGH. Either way
// the match is NOT asserted.
{
  console.log('\n4. P == Q but /G = HIGH → comparison disabled, P=Q de-asserted (HIGH)');
  const out = evalOut(EQUAL_A, 1);
  check('P=Q output HIGH (not asserted) while disabled', isHigh(out), `Vout=${fmtV(out)}`);
}

console.log(failures === 0 ? '\nAll 74x688 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
