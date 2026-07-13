// ── 74x283 4 bit binary full adder — regression ─────────────────────────────
// The 74x283 (js/chips/chips18.js) is the classic 74 series 4 bit binary full
// adder with fast (look-ahead) carry. It is purely combinational and uses the
// shared ADDER_4BIT engine primitive (js/specificChipsSim.js _evaluateAdder4Bit).
//
// Source: Texas Instruments, "SN54283 ... SN74LS283 ... 4-Bit Binary Full Adders
//   With Fast Carry", SDLS095A (Oct 1976, rev Mar 1988).
//   https://www.ti.com/lit/ds/symlink/sn74ls283.pdf — terminal assignment (D/N
//   package top view) + function table, page 1, read as rendered PDF page images
//   (issues.md C4). Verified pins (A1 = LSB): 1=S2 2=B2 3=A2 4=S1 5=A1 6=B1
//   7=C0 8=GND 9=C4 10=S4 11=B4 12=A4 13=S3 14=A3 15=B3 16=VCC.
//
// This guards the S5 -> C4 carry-out rename (issues.md C92): the physical pin
// assignment was already right, but pin 9 was mis-labeled 'S5'. If a future edit
// desyncs the pinout name from the gate output name, the carry out stops driving
// and the 5 bit sums below fail.
//
// ADDER_4BIT contract: inputs [A1,A2,A3,A4,B1,B2,B3,B4,C0], outputs
//   [S1,S2,S3,S4,C4]. Straight binary: (C4,S4,S3,S2,S1) = A + B + C0.
//
// Run:  node js/debug/scenarios/74x283-4bit-adder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x283');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive A (4 bits), B (4 bits) and C0, then re-solve. Pins are 1-based (A1 = LSB).
function apply(a, b, c0) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x283 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(`A${i + 1}`, (a >> i) & 1);
    wirePin(`B${i + 1}`, (b >> i) & 1);
  }
  wirePin('C0', c0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);
const readS = () => {
  let v = 0;
  for (let i = 0; i < 4; i++) if (isHigh(read(`S${i + 1}`))) v |= (1 << i);
  return v;
};

const failures = [];
// Check the full 5 bit result: low nibble on S1..S4, top bit on C4.
const check = (a, b, c0) => {
  apply(a, b, c0);
  const total = a + b + c0;
  const expS = total & 0x0f;
  const expC4 = (total >> 4) & 1;
  if (readS() !== expS) failures.push(`${a}+${b}+${c0}: expected sum ${expS}, got ${readS()}`);
  if (readBit('C4') !== expC4) failures.push(`${a}+${b}+${c0}: expected C4 ${expC4}, got ${readBit('C4')}`);
};

check(0, 0, 0);   // 0            -> sum 0,  C4 0
check(5, 3, 0);   // 8            -> sum 8,  C4 0
check(1, 0, 1);   // 2            -> sum 2,  C4 0
check(6, 9, 0);   // 15          -> sum 15, C4 0 (no overflow)
check(9, 7, 0);   // 16          -> sum 0,  C4 1 (the worked example in the docs)
check(8, 8, 0);   // 16          -> sum 0,  C4 1
check(15, 15, 1); // 31          -> sum 15, C4 1 (full range)

if (failures.length) {
  console.error(`74x283 4 bit adder regression FAILED (${failures.length}):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('74x283 4 bit adder regression PASSED');
