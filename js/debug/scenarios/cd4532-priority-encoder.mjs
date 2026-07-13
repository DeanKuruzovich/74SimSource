// ── CD4532B CMOS 8-bit priority encoder — regression ────────────────────────
// The CD4532 (js/chips/chips140.js) is primitive-backed by the new
// PRIORITY_ENC_8TO3_HI gate: eight active-HIGH priority inputs D0–D7 (D7 highest)
// plus an active-HIGH enable EI → a 3-bit binary code Q2Q1Q0, a group-select GS,
// and a cascade enable-output EO. This is the ACTIVE-HIGH counterpart of the
// 74x148 (which is fully active-LOW with inverted-binary outputs), so a dedicated
// primitive was added rather than reusing PRIORITY_ENC_8TO3 / PRIORITY_ENC_8LINE
// (see issues.md C2: never clone a sibling's polarity).
//
// This guards the verified CD4532B map (TI SCHS082C: D4=1,D5=2,D6=3,D7=4,EI=5,
// Q2=6,Q1=7,VSS=8,Q0=9,D0=10,D1=11,D2=12,D3=13,GS=14,EO=15,VDD=16) and the
// datasheet TRUTH TABLE:
//   • EI=0 (disabled): GS=Q2=Q1=Q0=EO=0 regardless of data.
//   • EI=1, no input HIGH: GS=0, Q=000, EO=1.
//   • EI=1, highest HIGH input Dn: GS=1, Q2Q1Q0 = binary(n), EO=0.
//
// Method: place ONE CD4532 (purely combinational — no sequential state), drive
// the eight data pins plus EI, re-solve, read Q2/Q1/Q0/GS/EO off the pins.
//
// Run:  node js/debug/scenarios/cd4532-priority-encoder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4532');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DATA = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];

// Drive the eight data inputs (bit i of `word` → Di) plus EI, then re-solve.
function apply(word, ei) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4532 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (let i = 0; i < 8; i++) wirePin(DATA[i], (word >> i) & 1);
  wirePin('EI', ei);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);
const code = () => readBit('Q2') * 4 + readBit('Q1') * 2 + readBit('Q0');

// Highest set bit index of an 8-bit word, or -1 if none.
const highestSet = (w) => { for (let i = 7; i >= 0; i--) if ((w >> i) & 1) return i; return -1; };

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// 1) Sweep all 256 input words with EI=1 (enabled).
for (let w = 0; w < 256; w++) {
  apply(w, 1);
  const h = highestSet(w);
  if (h === -1) {
    assert(code() === 0 && readBit('GS') === 0 && readBit('EO') === 1,
      `enabled, no input: expected Q=0 GS=0 EO=1, got Q=${code()} GS=${readBit('GS')} EO=${readBit('EO')}`);
  } else {
    assert(code() === h, `enabled, word=0x${w.toString(16)}: expected code ${h}, got ${code()}`);
    assert(readBit('GS') === 1, `enabled, word=0x${w.toString(16)}: expected GS=1, got ${readBit('GS')}`);
    assert(readBit('EO') === 0, `enabled, word=0x${w.toString(16)}: expected EO=0, got ${readBit('EO')}`);
  }
}

// 2) EI=0 (disabled) forces ALL outputs LOW regardless of data.
for (const w of [0x00, 0x01, 0x80, 0xFF, 0x55, 0xAA]) {
  apply(w, 0);
  assert(code() === 0 && readBit('GS') === 0 && readBit('EO') === 0,
    `disabled, word=0x${w.toString(16)}: expected Q=0 GS=0 EO=0, got Q=${code()} GS=${readBit('GS')} EO=${readBit('EO')}`);
}

// 3) Priority: a higher input wins over any combination of lower ones.
const cases = [
  // [word, ei, expCode, expGS, expEO, label]
  [0b00000001, 1, 0, 1, 0, 'only D0 → code 0, GS=1 (distinguishes from no-input)'],
  [0b10000000, 1, 7, 1, 0, 'only D7 → code 7'],
  [0b10000001, 1, 7, 1, 0, 'D7 + D0 → D7 wins (code 7)'],
  [0b01111111, 1, 6, 1, 0, 'D6 highest among D0..D6 → code 6'],
  [0b00011000, 1, 4, 1, 0, 'D4 + D3 → D4 wins (code 4)'],
  [0b00000000, 1, 0, 0, 1, 'no input, enabled → code 0, GS=0, EO=1'],
  [0b11111111, 0, 0, 0, 0, 'all inputs HIGH but EI=0 → everything LOW'],
];
for (const [w, ei, ec, egs, eeo, label] of cases) {
  apply(w, ei);
  assert(code() === ec && readBit('GS') === egs && readBit('EO') === eeo,
    `${label}: expected code=${ec} GS=${egs} EO=${eeo}, got code=${code()} GS=${readBit('GS')} EO=${readBit('EO')}`);
}

console.log(`cd4532-priority-encoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
