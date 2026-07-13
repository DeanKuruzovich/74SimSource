// ── 74x148 8-to-3 priority encoder — regression ─────────────────────────────
// The 74x148 (js/chips/chips5.js) is primitive-backed by the PRIORITY_ENC_8TO3
// gate: eight active-LOW priority inputs I0–I7 (I7 highest) plus an active-LOW
// enable EI → a 3-bit inverted-binary code A2 A1 A0, a group-select GS, and a
// cascade enable-output EO. EVERY pin is active LOW — this is the active-LOW,
// inverted-output counterpart of the CD4532 (which is fully active-HIGH), so the
// two use different primitives (see issues.md C2: never clone a sibling's
// polarity).
//
// This guards the verified TI SN74LS148 map (SDLS053B, terminal diagram page 1:
// I4=1,I5=2,I6=3,I7=4,EI=5,A2=6,A1=7,GND=8,A0=9,I0=10,I1=11,I2=12,I3=13,GS=14,
// EO=15,VCC=16) and the datasheet FUNCTION TABLE (page 3), read as PDF page
// images per issues.md C4:
//   • EI=H (disabled): every output HIGH regardless of the data inputs.
//   • EI=L, no input LOW: A2 A1 A0 = HHH, GS=H, EO=L.
//   • EI=L, highest LOW input In: A2 A1 A0 = inverted-binary(n), GS=L, EO=H.
//
// Method: place ONE 74x148 (purely combinational — no sequential state), drive
// the eight data pins plus EI (an input is "active" when driven LOW), re-solve,
// read A2/A1/A0/GS/EO off the pins. Address bits are read active-LOW, so the
// decoded index is the COMPLEMENT of the raw A pins.
//
// Run:  node js/debug/scenarios/74x148-priority-encoder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x148');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DATA = ['I0', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7'];

// bit i of `word` = 1 → input i ACTIVE → drive Ii LOW. `enabled` = 1 → EI LOW.
function apply(word, enabled) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x148 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 8; i++) wirePin(DATA[i], (word >> i) & 1 ? 0 : 1); // active LOW
  wirePin('EI', enabled ? 0 : 1);                                       // enable LOW
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);
// Address pins are active LOW → the decoded index is their complement.
const trueBit = (name) => 1 - readBit(name);
const code = () => trueBit('A2') * 4 + trueBit('A1') * 2 + trueBit('A0');

const highestSet = (w) => { for (let i = 7; i >= 0; i--) if ((w >> i) & 1) return i; return -1; };

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// 1) Sweep all 256 input words with the chip enabled (EI=L).
for (let w = 0; w < 256; w++) {
  apply(w, 1);
  const h = highestSet(w);
  if (h === -1) {
    // Nothing active: A pins all HIGH (decoded 0), GS HIGH, EO LOW.
    assert(readBit('A2') === 1 && readBit('A1') === 1 && readBit('A0') === 1 &&
           readBit('GS') === 1 && readBit('EO') === 0,
      `enabled, no input: expected A=HHH GS=H EO=L, got A2A1A0=${readBit('A2')}${readBit('A1')}${readBit('A0')} GS=${readBit('GS')} EO=${readBit('EO')}`);
  } else {
    assert(code() === h, `enabled, word=0x${w.toString(16)}: expected code ${h}, got ${code()}`);
    assert(readBit('GS') === 0, `enabled, word=0x${w.toString(16)}: expected GS=L, got ${readBit('GS')}`);
    assert(readBit('EO') === 1, `enabled, word=0x${w.toString(16)}: expected EO=H, got ${readBit('EO')}`);
  }
}

// 2) EI=H (disabled) forces ALL outputs HIGH regardless of data.
for (const w of [0x00, 0x01, 0x80, 0xFF, 0x55, 0xAA]) {
  apply(w, 0);
  assert(readBit('A2') === 1 && readBit('A1') === 1 && readBit('A0') === 1 &&
         readBit('GS') === 1 && readBit('EO') === 1,
    `disabled, word=0x${w.toString(16)}: expected all outputs HIGH, got A2A1A0=${readBit('A2')}${readBit('A1')}${readBit('A0')} GS=${readBit('GS')} EO=${readBit('EO')}`);
}

// 3) Priority + the inverted-binary mapping (highest input wins over any lower ones).
const cases = [
  // [word, enabled, expCode, expGS_bit, expEO_bit, label]   (GS/EO given as raw pin bits)
  [0b00000001, 1, 0, 0, 1, 'only I0 → code 0, GS=L (distinguishes from no-input)'],
  [0b10000000, 1, 7, 0, 1, 'only I7 → code 7 (A pins LLL)'],
  [0b10000001, 1, 7, 0, 1, 'I7 + I0 → I7 wins (code 7)'],
  [0b01111111, 1, 6, 0, 1, 'I6 highest among I0..I6 → code 6'],
  [0b00011000, 1, 4, 0, 1, 'I4 + I3 → I4 wins (code 4)'],
  [0b00100000, 1, 5, 0, 1, 'only I5 → code 5 (A pins LHL, complement of 101)'],
  [0b00000000, 1, 0, 1, 0, 'no input, enabled → code 0, GS=H, EO=L'],
  [0b11111111, 0, 0, 1, 1, 'all inputs active but EI=H → every output HIGH'],
];
for (const [w, en, ec, egs, eeo, label] of cases) {
  apply(w, en);
  assert(code() === ec && readBit('GS') === egs && readBit('EO') === eeo,
    `${label}: expected code=${ec} GS=${egs} EO=${eeo}, got code=${code()} GS=${readBit('GS')} EO=${readBit('EO')}`);
}

console.log(`74x148-priority-encoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
