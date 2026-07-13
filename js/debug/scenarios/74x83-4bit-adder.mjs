// ── 74x83 4 bit binary full adder — regression ──────────────────────────────
// The 74x83 (js/chips/chips3.js) is the classic 74 series 4 bit binary full
// adder with fast (look-ahead) carry. It is purely combinational and uses the
// shared ADDER_4BIT engine primitive (js/specificChipsSim.js _evaluateAdder4Bit),
// the same primitive as the newer 74x283.
//
// Source: Motorola, "SN54/74LS83A 4-Bit Binary Full Adder With Fast Carry",
//   FAST and LS TTL Data, pp. 5-1..5-2.
//   https://www.datasheethub.com/wp-content/uploads/2022/03/83.pdf — connection
//   diagram (DIP top view) + functional truth table, read as rendered PDF page
//   images (issues.md C4). Cross-checked against the 54/7483A second source at
//   eelabs.faculty.unlv.edu/docs/datasheets/7483.pdf.
//   Verified pins (A1/S1 = LSB): 1=A4 2=S3 3=A3 4=B3 5=VCC 6=S2 7=B2 8=A2
//   9=S1 10=A1 11=B1 12=GND 13=C0 14=C4 15=S4 16=B4. NOTE the non-standard
//   power pins: VCC on pin 5, GND on pin 12 (not the corners).
//
// This guards the 74x83's specific pin-name -> gate wiring. If a future edit
// desyncs a pinout name from a gate output name (the same class of bug that hit
// the 74x283, where pin 9 was once mis-labeled 'S5' instead of 'C4'), the sum or
// carry stops driving and the checks below fail. The datasheet worked example
// (10 + 9 = 19) is included explicitly.
//
// ADDER_4BIT contract: inputs [A1,A2,A3,A4,B1,B2,B3,B4,C0], outputs
//   [S1,S2,S3,S4,C4]. Straight binary: (C4,S4,S3,S2,S1) = A + B + C0.
//
// Run:  node js/debug/scenarios/74x83-4bit-adder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x83');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive A (4 bits), B (4 bits) and C0, then re-solve. Pins are 1-based (A1 = LSB).
function apply(a, b, c0) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x83 has no pin named ${name}`);
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
check(1, 0, 1);   // 2            -> sum 2,  C4 0 (carry in adds in)
check(6, 9, 0);   // 15          -> sum 15, C4 0 (no overflow)
check(10, 9, 0);  // 19          -> sum 3,  C4 1 (the datasheet worked example)
check(8, 8, 0);   // 16          -> sum 0,  C4 1
check(15, 15, 1); // 31          -> sum 15, C4 1 (full range)

if (failures.length) {
  console.error(`74x83 4 bit adder regression FAILED (${failures.length}):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('74x83 4 bit adder regression PASSED');
