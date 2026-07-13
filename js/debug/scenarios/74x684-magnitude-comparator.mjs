// ── 74x684 regression: 8-bit magnitude comparator, P>Q + P=Q, interleaved pinout ─
// The 'LS684 compares two 8-bit unsigned words P and Q and drives TWO active-LOW
// outputs: P>Q (pin 1) and P=Q (pin 19). It has NO enable pin and NO pull-ups on
// the Q inputs (totem-pole outputs). P<Q is not a pin — it is NAND(PGQ, PEQQ).
//
// This scenario guards a real pinout+logic bug fixed 2026-07-04 (issues.md C102).
// The prior hand-entered entry invented a G enable on pin 1 (pin 1 is the P>Q
// output), GROUPED the inputs (P0-P7 on 2-9, Q7-Q0 on 11-18) instead of
// INTERLEAVING them, put a single "PGQ" output on pin 19 (pin 19 is P=Q), and
// omitted the P>Q output entirely.
//
// Verified against TI SDLS008 (SN54LS682..SN74LS688, doc D2617, Jan 1981 rev
// Mar 1988), '682/'684/'685 J/DW/N 20-pin terminal diagram + '682/'684 logic
// symbol + family function table, read as 300-dpi PDF page images:
//   PGQ(P>Q,out)=1; P0=2,Q0=3,P1=4,Q1=5,P2=6,Q2=7,P3=8,Q3=9; GND=10;
//   P4=11,Q4=12,P5=13,Q5=14,P6=15,Q6=16,P7=17,Q7=18; PEQQ(P=Q,out)=19; VCC=20.
//   Function table: P>Q -> PGQ LOW, PEQQ HIGH | P=Q -> PGQ HIGH, PEQQ LOW |
//   P<Q -> both HIGH. Both outputs active LOW.
//
// Why a NAME-based test would miss the pinout half of the bug: the
// COMPARATOR_8BIT_PQ_EN evaluator resolves its inputs by pin NAME, so the
// magnitude compare still computes no matter which physical hole a name sits on.
// To catch a *physical* interleave error the checks below drive holes by physical
// PIN NUMBER and assert the pin->name map directly. Both fail loudly under the old
// grouped pinout (which also had no PEQQ pin at all).
//
// Run:  node js/debug/scenarios/74x684-magnitude-comparator.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
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

// Valid physical power-rail columns (10 groups of 5).
const RAIL_COLS = [2, 8, 14, 20, 26, 32, 38, 44, 50, 56].flatMap(b => [b, b + 1, b + 2, b + 3, b + 4]);

// Physical input pin for each bit of P and Q, per the verified interleaved pinout.
const P_PINS = [2, 4, 6, 8, 11, 13, 15, 17];  // P0..P7
const Q_PINS = [3, 5, 7, 9, 12, 14, 16, 18];  // Q0..Q7
const PIN_PGQ = 1;   // P>Q output
const PIN_PEQQ = 19; // P=Q output

// Build a powered 74x684, drive P and Q by physical pin number, return the two
// output voltages { pgq, peqq }.
function evalOut(P, Q) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x684');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();

  let railIdx = 0;
  const wirePin = (pinNum, level) => {
    const pin = chip.getPinByNumber(pinNum);
    const col = RAIL_COLS[railIdx++];
    const row = level ? 1 : 0;   // power rail row 1 = 5V, row 0 = GND
    wm.addWire(pin.holeId, holeId(0, 0, 'power', col, row));
  };

  wirePin(20, 1); // VCC
  wirePin(10, 0); // GND
  for (let b = 0; b < 8; b++) {
    wirePin(P_PINS[b], (P >> b) & 1);
    wirePin(Q_PINS[b], (Q >> b) & 1);
  }

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  return {
    pgq:  sim.getVoltageAtHole(chip.getPinByNumber(PIN_PGQ).holeId),
    peqq: sim.getVoltageAtHole(chip.getPinByNumber(PIN_PEQQ).holeId),
  };
}

// ── 0. Physical pin -> name map matches the verified interleaved pinout ──────
{
  console.log('\n0. Physical pin map: PGQ on 1, P/Q interleaved, PEQQ on 19');
  const expected = {
    1: 'PGQ', 2: 'P0', 3: 'Q0', 4: 'P1', 5: 'Q1', 6: 'P2', 7: 'Q2', 8: 'P3',
    9: 'Q3', 10: 'GND', 11: 'P4', 12: 'Q4', 13: 'P5', 14: 'Q5', 15: 'P6',
    16: 'Q6', 17: 'P7', 18: 'Q7', 19: 'PEQQ', 20: 'VCC',
  };
  const chip = new ChipComponent('74x684');
  chip.place(0, 0, 2, 4);
  let bad = [];
  for (const [num, name] of Object.entries(expected)) {
    const got = chip.getPinByNumber(Number(num))?.name;
    if (got !== name) bad.push(`pin ${num}: ${got} (want ${name})`);
  }
  check('all 20 pins match the datasheet terminal assignment', bad.length === 0, bad.join('; '));
}

// ── 1. P > Q → PGQ LOW, PEQQ HIGH ────────────────────────────────────────────
{
  console.log('\n1. P (200) > Q (100) → PGQ LOW, PEQQ HIGH');
  const { pgq, peqq } = evalOut(200, 100);
  check('PGQ asserted LOW when P > Q', isLow(pgq), `PGQ=${fmtV(pgq)}`);
  check('PEQQ HIGH (not equal)', isHigh(peqq), `PEQQ=${fmtV(peqq)}`);
}

// ── 2. P < Q → both outputs HIGH ─────────────────────────────────────────────
{
  console.log('\n2. P (100) < Q (200) → PGQ HIGH, PEQQ HIGH (neither asserted)');
  const { pgq, peqq } = evalOut(100, 200);
  check('PGQ HIGH when P < Q', isHigh(pgq), `PGQ=${fmtV(pgq)}`);
  check('PEQQ HIGH when P != Q', isHigh(peqq), `PEQQ=${fmtV(peqq)}`);
}

// ── 3. P = Q → PGQ HIGH, PEQQ LOW ────────────────────────────────────────────
{
  console.log('\n3. P (170) = Q (170) → PGQ HIGH, PEQQ LOW');
  const { pgq, peqq } = evalOut(170, 170);
  check('PGQ HIGH when P = Q', isHigh(pgq), `PGQ=${fmtV(pgq)}`);
  check('PEQQ asserted LOW on a match', isLow(peqq), `PEQQ=${fmtV(peqq)}`);
}

// ── 4. MSB dominates: 128 (10000000) > 127 (01111111) ────────────────────────
// The most significant bit alone decides, even though Q has seven 1s and P has one.
{
  console.log('\n4. Magnitude, not bit-count: P=128 (0x80) > Q=127 (0x7F) → PGQ LOW');
  const { pgq, peqq } = evalOut(128, 127);
  check('PGQ LOW (MSB set in P wins)', isLow(pgq), `PGQ=${fmtV(pgq)}`);
  check('PEQQ HIGH (not equal)', isHigh(peqq), `PEQQ=${fmtV(peqq)}`);
}

// ── 5. LSB-only difference: 1 > 0, and the equal endpoints 0=0, 255=255 ───────
{
  console.log('\n5. LSB difference and equality endpoints');
  const lsb = evalOut(1, 0);
  check('P=1 > Q=0 → PGQ LOW', isLow(lsb.pgq), `PGQ=${fmtV(lsb.pgq)}`);
  const zero = evalOut(0, 0);
  check('P=0 = Q=0 → PEQQ LOW', isLow(zero.peqq), `PEQQ=${fmtV(zero.peqq)}`);
  check('P=0 = Q=0 → PGQ HIGH', isHigh(zero.pgq), `PGQ=${fmtV(zero.pgq)}`);
  const full = evalOut(255, 255);
  check('P=255 = Q=255 → PEQQ LOW', isLow(full.peqq), `PEQQ=${fmtV(full.peqq)}`);
}

console.log(failures === 0 ? '\nAll 74x684 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
