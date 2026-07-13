// ── 74x181 4-bit ALU / function generator — regression ───────────────────────
// The 74x181 (js/chips/chips13.js) is the classic 74181-family 4-bit ALU. It is
// purely combinational and reuses the shared ALU_4BIT engine primitive
// (js/specificChipsSim.js _evaluateAlu4Bit), which implements the datasheet's
// ACTIVE-HIGH data table (TI SDLS136, SN54/74S181, Table 2 / Figure 2, verified
// against the PDF page images). This is a separate entry from the 74x1181
// (chips48.js); both wrap the same primitive, so each carries its own guard so
// their pin maps cannot silently drift.
//
// This guards: the verified pin map (B0=1,A0=2,S3=3,S2=4,S1=5,S0=6,Cn=7,M=8,
// F0=9,F1=10,F2=11,GND=12,F3=13,AeqB=14,P=15,Cn4=16,G=17,B3=18,A3=19,B2=20,
// A2=21,B1=22,A1=23,VCC=24), and a representative slice of the function table:
//   • M=1 (logic, carry ignored): NOT A, A AND B, A XOR B, A OR B, A XNOR B.
//   • M=0 (arithmetic, carry used): A PLUS B (with carry-out), A PLUS 1,
//     A MINUS 1, and the A=B comparator (subtract mode, Cn=0).
//
// Carry polarity note (issues.md C16): the model uses ACTIVE-HIGH carry — Cn=HIGH
// adds one, Cn4=HIGH on overflow — where the silicon uses active-LOW Cn/Cn4. The
// data path matches the datasheet's active-high table bit-for-bit; only the carry
// pin polarity is flipped (consistently on both ends, so cascading still ripples).
//
// ALU_4BIT contract (js/specificChipsSim.js):
//   inputs:  [A0,A1,A2,A3, B0,B1,B2,B3, S0,S1,S2,S3, M, Cn]
//   outputs: [F0,F1,F2,F3, Cn4, P, G, AeqB]
// Select index s = S0 | S1<<1 | S2<<2 | S3<<3.  M=1 logic, M=0 arithmetic.
//
// Method: place ONE 74x181 (no sequential state), drive every input pin from a
// rail, re-solve, read F0–F3 / Cn4 / AeqB off the pins.
//
// Run:  node js/debug/scenarios/74x181-alu.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x181');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive A (4 bits), B (4 bits), S (4 bits), M, Cn, then re-solve.
function apply(a, b, s, m, cn) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x181 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(`A${i}`, (a >> i) & 1);
    wirePin(`B${i}`, (b >> i) & 1);
    wirePin(`S${i}`, (s >> i) & 1);
  }
  wirePin('M', m);
  wirePin('Cn', cn);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);
const readF = () => {
  let v = 0;
  for (let i = 0; i < 4; i++) if (isHigh(read(`F${i}`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── Logic mode (M=1, Cn ignored) ─────────────────────────────────────────────
// NOT A: s=0 → F = ~A & 0xF
apply(0b1100, 0b1010, 0, 1, 0);
assert(readF() === 0b0011, `logic NOT A: expected 0011, got ${readF().toString(2).padStart(4,'0')}`);

// A AND B: s=0b1011 (11) → F = A & B
apply(0b1100, 0b1010, 0b1011, 1, 0);
assert(readF() === 0b1000, `logic A AND B: expected 1000, got ${readF().toString(2).padStart(4,'0')}`);

// A XOR B: s=0b0110 (6) → F = A ^ B
apply(0b1100, 0b1010, 0b0110, 1, 0);
assert(readF() === 0b0110, `logic A XOR B: expected 0110, got ${readF().toString(2).padStart(4,'0')}`);

// A OR B: s=0b1110 (14) → F = A | B
apply(0b1100, 0b1010, 0b1110, 1, 0);
assert(readF() === 0b1110, `logic A OR B: expected 1110, got ${readF().toString(2).padStart(4,'0')}`);

// A XNOR B: s=0b1001 (9) → F = ~(A ^ B) & 0xF
apply(0b1100, 0b1010, 0b1001, 1, 0);
assert(readF() === 0b1001, `logic A XNOR B: expected 1001, got ${readF().toString(2).padStart(4,'0')}`);

// ── Arithmetic mode (M=0, Cn = carry in) ─────────────────────────────────────
// A PLUS B, no carry-in, no carry-out: 5 + 6 = 11, Cn4=0.   s=0b1001 (9)
apply(5, 6, 0b1001, 0, 0);
assert(readF() === 11, `arith A+B: expected 11, got ${readF()}`);
assert(readBit('Cn4') === 0, `arith A+B: expected Cn4=0, got ${readBit('Cn4')}`);

// A PLUS B with carry-out: 12 + 12 = 24 → F=8, Cn4=1.   s=0b1001 (9)
apply(12, 12, 0b1001, 0, 0);
assert(readF() === 8, `arith A+B carry: expected 8, got ${readF()}`);
assert(readBit('Cn4') === 1, `arith A+B carry: expected Cn4=1, got ${readBit('Cn4')}`);

// A PLUS 1 (increment): s=0 (F=A in arithmetic base), Cn=1 → A+1. 7+1=8.
apply(7, 0, 0, 0, 1);
assert(readF() === 8, `arith A+1: expected 8, got ${readF()}`);

// A MINUS 1 (decrement): s=0b1111 (15), Cn=0 → A-1. 5-1=4.
apply(5, 0, 0b1111, 0, 0);
assert(readF() === 4, `arith A-1: expected 4, got ${readF()}`);

// ── A=B comparator: subtract mode (s=6 → A MINUS B MINUS 1), Cn=0 ────────────
// When A==B the result is all-ones and AeqB goes HIGH.
apply(10, 10, 0b0110, 0, 0);
assert(readF() === 0b1111, `compare A==B: expected F=1111, got ${readF().toString(2).padStart(4,'0')}`);
assert(readBit('AeqB') === 1, `compare A==B: expected AeqB=1, got ${readBit('AeqB')}`);

// When A != B, AeqB stays LOW.
apply(10, 7, 0b0110, 0, 0);
assert(readBit('AeqB') === 0, `compare A!=B: expected AeqB=0, got ${readBit('AeqB')}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`74x181 ALU regression FAILED (${failures.length}):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('74x181 ALU regression PASSED');
