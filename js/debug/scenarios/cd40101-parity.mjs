// ── CD40101 CMOS 9-bit parity generator/checker (with inhibit) — regression ──
// The CD40101 (Batch 2, js/chips/chips105.js) is primitive-backed by the new
// PARITY_9BIT_INH gate: nine plain data inputs D1–D9 → EVEN OUT / ODD OUT, with an
// active-HIGH INHIBIT that forces BOTH outputs LOW. This is the 74280-style
// "parity of nine inputs" device (NOT the 74180 with EVEN_IN/ODD_IN cascade), so a
// dedicated primitive was added rather than reusing PARITY_9BIT.
//
// This guards: the verified CD40101BMS pin map (D1=1,D2=2,D3=3,D4=4,D9=5,
// ODD OUT=6,VSS=7,INHIBIT=8,EVEN OUT=9,D5=10,D6=11,D7=12,D8=13,VDD=14), and the
// behavior:
//   • INHIBIT=0: EVEN OUT=1 when an even # of D1–D9 are HIGH; ODD OUT=1 when odd.
//     (Outputs always complementary for 9 inputs.)
//   • INHIBIT=1: EVEN OUT = ODD OUT = 0.
//
// Method: place ONE CD40101 (purely combinational — no sequential state), drive the
// nine data pins from a sweep of bit patterns (plus the inhibit), re-solve, read
// EVEN OUT / ODD OUT off the pins.
//
// Run:  node js/debug/scenarios/cd40101-parity.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40101');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DATA = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'];

// Drive the nine data inputs (bit i of `word`) plus INHIBIT, then re-solve.
function apply(word, inh) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40101 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (let i = 0; i < 9; i++) wirePin(DATA[i], (word >> i) & 1);
  wirePin('INHIBIT', inh);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);

const popcount = (n) => { let c = 0; while (n) { c += n & 1; n >>= 1; } return c; };

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// 1) Sweep a representative set of 9-bit words with INHIBIT LOW.
//    EVEN OUT = 1 when popcount even; ODD OUT = its complement.
const words = [];
for (let w = 0; w < 512; w += 7) words.push(w);   // 74 spread-out patterns
words.push(0, 1, 0x1FF, 0x100, 0x0FF, 0xAA, 0x155); // edge/explicit cases
for (const w of words) {
  apply(w, 0);
  const ones = popcount(w & 0x1FF);
  const expEven = (ones % 2 === 0) ? 1 : 0;
  const expOdd = expEven ? 0 : 1;
  assert(readBit('EVEN OUT') === expEven,
    `word=0x${w.toString(16)} (${ones} ones): expected EVEN=${expEven}, got ${readBit('EVEN OUT')}`);
  assert(readBit('ODD OUT') === expOdd,
    `word=0x${w.toString(16)} (${ones} ones): expected ODD=${expOdd}, got ${readBit('ODD OUT')}`);
  assert(readBit('EVEN OUT') !== readBit('ODD OUT'),
    `word=0x${w.toString(16)}: EVEN/ODD must be complementary when not inhibited`);
}

// 2) INHIBIT HIGH forces BOTH outputs LOW, regardless of data.
for (const w of [0, 1, 0x55, 0xAA, 0x1FF, 0x123]) {
  apply(w, 1);
  assert(readBit('EVEN OUT') === 0, `inhibit, word=0x${w.toString(16)}: expected EVEN=0, got ${readBit('EVEN OUT')}`);
  assert(readBit('ODD OUT') === 0, `inhibit, word=0x${w.toString(16)}: expected ODD=0, got ${readBit('ODD OUT')}`);
}

// 3) Headline spot-checks.
const cases = [
  // [word, inh, expEven, expOdd, label]
  [0x000, 0, 1, 0, 'all-low: 0 ones (even) → EVEN'],
  [0x001, 0, 0, 1, 'one input HIGH → ODD'],
  [0x003, 0, 1, 0, 'two inputs HIGH → EVEN'],
  [0x1FF, 0, 0, 1, 'all nine HIGH: 9 ones (odd) → ODD'],
  [0x0FF, 0, 1, 0, 'eight HIGH: 8 ones (even) → EVEN'],
  [0x1FF, 1, 0, 0, 'inhibit overrides all-HIGH → both LOW'],
];
for (const [w, inh, ee, eo, label] of cases) {
  apply(w, inh);
  assert(readBit('EVEN OUT') === ee && readBit('ODD OUT') === eo,
    `${label}: expected EVEN=${ee} ODD=${eo}, got EVEN=${readBit('EVEN OUT')} ODD=${readBit('ODD OUT')}`);
}

console.log(`cd40101-parity: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
