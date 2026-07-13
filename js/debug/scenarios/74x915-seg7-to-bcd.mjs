// ── 74x915 (MM74C915) 7-segment-to-BCD converter regression ──────────────────
// Behavioural coverage of the SEG7_TO_BCD_915 engine primitive against the
// VERIFIED National MM74C915 truth table (1981 CMOS Databook, p.2-38, read as
// PDF page images — see the 74x915 header in js/chips/chips44.js + issues.md).
// It guards:
//   • digit decode: the standard 7-seg shapes 0-9 map to BCD 0000..1001 with
//     ERROR=0, MINUS=0, including the two accepted glyphs each for 1, 6 and 9;
//   • blank display (no segments lit) → BCD 1111, ERROR=0;
//   • minus code (segment g only) → ERROR=1, MINUS=1, BCD = Hi-Z;
//   • any other pattern → ERROR=1, MINUS=0, BCD = Hi-Z;
//   • INVERT control: HIGH reads the segment inputs active-LOW;
//   • OE (active LOW) HIGH forces the BCD pins Hi-Z while ERROR/MINUS stay driven;
//   • LE: LOW = flow-through, HIGH = latched.
//
// Run:  node js/debug/scenarios/74x915-seg7-to-bcd.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x915');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Segment order for the 7-char pattern string is [a,b,c,d,e,f,g].
const SEG = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

function apply({ seg, inv = 0, le = 0, oe = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x915 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 7; i++) wirePin(SEG[i], Number(seg[i]));
  wirePin('INV', inv);
  wirePin('LE', le);
  wirePin('OEn', oe);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit = (name) => (isHigh(read(name)) ? 1 : 0);
const isHiZ = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type === DRIVE.HIGH_Z : false;
};
const bcd = () => bit('A') | (bit('B') << 1) | (bit('C') << 2) | (bit('D') << 3);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Standard digit shapes 0-9 (a,b,c,d,e,f,g) ─────────────────────────────
const DIGITS = {
  0: ['1111110'],
  1: ['0110000', '0000110'],          // right (b,c) or left (e,f)
  2: ['1101101'],
  3: ['1111001'],
  4: ['0110011'],
  5: ['1011011'],
  6: ['1011111', '0011111'],          // with top bar a, or without
  7: ['1110000'],
  8: ['1111111'],
  9: ['1111011', '1110011'],          // with bottom d, or without
};
for (const [val, forms] of Object.entries(DIGITS)) {
  for (const seg of forms) {
    apply({ seg });
    assert(bcd() === Number(val), `digit ${val} (${seg}): expected BCD ${val}, got ${bcd()}`);
    assert(bit('ERROR') === 0, `digit ${val} (${seg}): ERROR must be LOW`);
    assert(bit('MINUS') === 0, `digit ${val} (${seg}): MINUS must be LOW`);
    assert(!isHiZ('A'), `digit ${val} (${seg}): BCD must be driven`);
  }
}

// ── 2. Blank display → BCD 1111, no error ────────────────────────────────────
apply({ seg: '0000000' });
assert(bcd() === 0b1111, `blank: expected BCD 15, got ${bcd()}`);
assert(bit('ERROR') === 0, 'blank: ERROR must be LOW');
assert(bit('MINUS') === 0, 'blank: MINUS must be LOW');
assert(!isHiZ('A'), 'blank: BCD must be driven');

// ── 3. Minus sign (segment g only) → ERROR=1, MINUS=1, BCD Hi-Z ──────────────
apply({ seg: '0000001' });
assert(bit('ERROR') === 1, 'minus: ERROR must be HIGH');
assert(bit('MINUS') === 1, 'minus: MINUS must be HIGH');
assert(isHiZ('A') && isHiZ('B') && isHiZ('C') && isHiZ('D'), 'minus: BCD must be Hi-Z');

// ── 4. Non-standard code (segment a only) → ERROR=1, MINUS=0, BCD Hi-Z ────────
apply({ seg: '1000000' });
assert(bit('ERROR') === 1, 'bad code: ERROR must be HIGH');
assert(bit('MINUS') === 0, 'bad code: MINUS must be LOW');
assert(isHiZ('A'), 'bad code: BCD must be Hi-Z');

// ── 5. INVERT control: drive the complement of digit 5, read with INV=1 ──────
//    '1011011' inverted is '0100100'; with active-LOW decoding it is still a 5.
apply({ seg: '0100100', inv: 1 });
assert(bcd() === 5, `invert: expected BCD 5, got ${bcd()}`);
assert(bit('ERROR') === 0, 'invert: ERROR must be LOW');

// ── 6. OE (active LOW) HIGH → BCD Hi-Z, ERROR/MINUS still driven ──────────────
apply({ seg: DIGITS[3][0], oe: 1 });
assert(isHiZ('A') && isHiZ('B') && isHiZ('C') && isHiZ('D'), 'OE=1: BCD must be Hi-Z');
assert(!isHiZ('ERROR'), 'OE=1: ERROR must still be driven');
assert(bit('ERROR') === 0, 'OE=1: valid digit → ERROR LOW');

// ── 7. Latch: load 5 transparently, hold it while inputs change to 8 ─────────
apply({ seg: DIGITS[5][0], le: 0 });          // transparent: latch tracks 5
assert(bcd() === 5, `latch load: expected 5, got ${bcd()}`);
apply({ seg: DIGITS[8][0], le: 1 });          // latched: hold 5 despite "8" input
assert(bcd() === 5, `latch hold: expected held 5, got ${bcd()}`);
apply({ seg: DIGITS[8][0], le: 0 });          // transparent again: now follow 8
assert(bcd() === 8, `latch release: expected 8, got ${bcd()}`);

if (failures.length) {
  console.error(`74x915: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x915: PASS — 7-segment-to-BCD decode, blank, minus, error, invert, OE, latch');
