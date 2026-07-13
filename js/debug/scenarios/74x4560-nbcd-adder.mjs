// ── 74x4560 NBCD adder — regression ──────────────────────────────────────────
// The 74x4560 (js/chips/chips59.js) is the CMOS 4000-series NBCD adder
// (Motorola MC14560B). It is purely combinational and reuses the existing
// ADDER_BCD_4BIT engine primitive (js/specificChipsSim.js _evaluateAdderBcd4Bit),
// shared with the 74x583.
//
// Source: Motorola, "MC14560B NBCD Adder", Motorola CMOS Logic Data (Rev 0,
//   1/94). https://digsys.upc.edu/csd/chips/classic/MC14560.pdf — PIN ASSIGNMENT
//   + partial truth table, page 2, read as rendered PDF page images (issues.md C4).
//
// This guards the corrected pin map (the original stub had A/B swapped and
// Cout/S1 transposed — issues.md C2 class error). Datasheet pins (A1 = LSB):
//   1=A2 2=B2 3=A3 4=B3 5=A4 6=B4 7=Cin 8=VSS
//   9=Cout 10=S4 11=S3 12=S2 13=S1 14=B1 15=A1 16=VDD
// In engine 0-based names: A0(=A1)=pin15, A1(=A2)=pin1, A2(=A3)=pin3,
// A3(=A4)=pin5, B0=14, B1=2, B2=4, B3=6, S0(=S1)=13, S1=12, S2=11, S3(=S4)=10.
//
// ADDER_BCD_4BIT contract: inputs [A0,A1,A2,A3,B0,B1,B2,B3,Cin],
//   outputs [S0,S1,S2,S3,Cout]. BCD: sum<=9 -> sum, Cout=0; sum>9 -> +6, Cout=1.
//
// Rows checked against the datasheet truth table:
//   4+3=7 (Cout 0); 4+3+1=8; 7+4=11 -> BCD 1 carry 1; and full-range 9+9+1=19.
//
// Run:  node js/debug/scenarios/74x4560-nbcd-adder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4560');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive A (4 bits), B (4 bits) and Cin, then re-solve.
function apply(a, b, cin) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4560 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(`A${i}`, (a >> i) & 1);
    wirePin(`B${i}`, (b >> i) & 1);
  }
  wirePin('Cin', cin);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);
const readS = () => {
  let v = 0;
  for (let i = 0; i < 4; i++) if (isHigh(read(`S${i}`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// 4 + 3 = 7, no carry.
apply(4, 3, 0);
assert(readS() === 7,        `4+3: expected sum 7, got ${readS()}`);
assert(readBit('Cout') === 0, `4+3: expected Cout 0, got ${readBit('Cout')}`);

// 4 + 3 + 1 = 8, no carry.
apply(4, 3, 1);
assert(readS() === 8,        `4+3+1: expected sum 8, got ${readS()}`);
assert(readBit('Cout') === 0, `4+3+1: expected Cout 0, got ${readBit('Cout')}`);

// 7 + 4 = 11 -> BCD sum 1, carry out 1 (datasheet row).
apply(7, 4, 0);
assert(readS() === 1,        `7+4: expected BCD sum 1, got ${readS()}`);
assert(readBit('Cout') === 1, `7+4: expected Cout 1, got ${readBit('Cout')}`);

// 5 + 5 = 10 -> BCD sum 0, carry out 1.
apply(5, 5, 0);
assert(readS() === 0,        `5+5: expected BCD sum 0, got ${readS()}`);
assert(readBit('Cout') === 1, `5+5: expected Cout 1, got ${readBit('Cout')}`);

// Full range: 9 + 9 + 1 = 19 -> BCD sum 9, carry out 1.
apply(9, 9, 1);
assert(readS() === 9,        `9+9+1: expected BCD sum 9, got ${readS()}`);
assert(readBit('Cout') === 1, `9+9+1: expected Cout 1, got ${readBit('Cout')}`);

// 0 + 0 = 0, no carry.
apply(0, 0, 0);
assert(readS() === 0,        `0+0: expected sum 0, got ${readS()}`);
assert(readBit('Cout') === 0, `0+0: expected Cout 0, got ${readBit('Cout')}`);

if (failures.length) {
  console.error(`74x4560 NBCD adder regression FAILED (${failures.length}):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('74x4560 NBCD adder regression PASSED');
