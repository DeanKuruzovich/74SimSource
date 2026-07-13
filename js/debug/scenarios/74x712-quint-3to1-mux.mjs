// ── 74x712 quint 3-to-1 multiplexer — regression ────────────────────────────
// De-stubbed in chips37.js (gate MUX_QUINT_3TO1, new primitive). Five 3-to-1
// muxes share one pair of select lines S0/S1. No output enable, no invert
// control (those are 'F711 only); true totem-pole outputs.
//
// Verified vs Signetics 1989 FAST Data Manual, 74F712 FUNCTION TABLE (p.6-676):
//   S1 S0 | Qn
//    L  L | a   (Dna)
//    L  H | b   (Dnb)
//    H  x | c   (Dnc)   ← S1 dominates; no "unused" code
//
// Pinout verified vs the 24-pin PIN CONFIGURATION (p.6-675):
//   S0=1 S1=2 Q0=3 Q1=4 Q2=5 GND=6 Q3=7 Q4=8 D0c=9 D1c=10 D2c=11 D3c=12 D4c=13
//   D4b=14 D3b=15 D2b=16 D1b=17 D0b=18 VCC=19 D4a=20 D3a=21 D2a=22 D1a=23 D0a=24
// (The logic-diagram note "VCC=20/GND=10" is a stale 'F711 carry-over — see
//  issues.md C58; the pin-configuration map above is authoritative.)
//
// Method: one 74x712 (purely combinational). Each bank gets a distinct 5-bit
// word so a crossed channel or swapped bank shows up. Solve per select code.
//
// Run:  node js/debug/scenarios/74x712-quint-3to1-mux.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x712');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Distinct 5-bit words per bank so any mis-route is visible.
const WORD_A = 0b10110;
const WORD_B = 0b01101;
const WORD_C = 0b11000;

function apply(s0, s1, a, b, c) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x712 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 5; i++) {
    wirePin(`D${i}a`, (a >> i) & 1);
    wirePin(`D${i}b`, (b >> i) & 1);
    wirePin(`D${i}c`, (c >> i) & 1);
  }
  wirePin('S0', s0);
  wirePin('S1', s1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const outWord = () => {
  let w = 0;
  for (let i = 0; i < 5; i++) if (isHigh(read(`Q${i}`))) w |= (1 << i);
  return w;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const bin5 = (n) => n.toString(2).padStart(5, '0');

// ── 1. Function table: S1S0 → a / b / c ─────────────────────────────────────
const cases = [
  { s1: 0, s0: 0, want: WORD_A, lbl: 'S1=0,S0=0 → a' },
  { s1: 0, s0: 1, want: WORD_B, lbl: 'S1=0,S0=1 → b' },
  { s1: 1, s0: 0, want: WORD_C, lbl: 'S1=1,S0=0 → c' },
  { s1: 1, s0: 1, want: WORD_C, lbl: 'S1=1,S0=1 → c (S1 dominates, not "unused")' },
];
for (const { s1, s0, want, lbl } of cases) {
  apply(s0, s1, WORD_A, WORD_B, WORD_C);
  const got = outWord();
  assert(got === want, `${lbl}: expected Q=${bin5(want)}, got ${bin5(got)}`);
}

// ── 2. Channels are independent: change only bank c, S1=H ───────────────────
apply(0, 1, 0b00000, 0b00000, 0b10101);
assert(outWord() === 0b10101, `independent c-route: expected 10101, got ${bin5(outWord())}`);

// ── 3. a/b banks ignored while S1=H (c selected) ────────────────────────────
apply(1, 1, 0b11111, 0b11111, 0b00000);
assert(outWord() === 0b00000,
  `S1=H must ignore a/b: expected 00000, got ${bin5(outWord())}`);

// ── 4. c bank ignored while S1=L ────────────────────────────────────────────
apply(0, 0, 0b01010, 0b11111, 0b11111);
assert(outWord() === 0b01010,
  `S1=L,S0=L must pick a, ignore c: expected 01010, got ${bin5(outWord())}`);

console.log(`74x712-quint-3to1-mux: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
