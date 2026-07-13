// ── CD4019 quad AND/OR select gate — regression ──────────────────────────────
// The CD4019 (Batch 2, js/chips/chips101.js) is primitive-backed: four AO_22
// gates, each computing Dn = (An·Ka) + (Bn·Kb), with the two select lines Ka
// (pin 9) and Kb (pin 14) shared across all four sections. This guards the chip's
// DB entry: the interleaved input pin map (A1=6,B1=7,A2=4,B2=5,A3=2,B3=3,A4=15,
// B4=1), the output pins (D1=10,D2=11,D3=12,D4=13), and the four documented
// select modes from the TI CD4019B (SCHS029C) truth table.
//
// Method: place ONE CD4019 (purely combinational — no sequential state) and
// drive A1..A4 / B1..B4 / Ka / Kb to the rails, then read D1..D4 off the pins.
//
// Checks (per datasheet truth table):
//   • Ka=1,Kb=0  → D = A  (pass the A word)
//   • Ka=0,Kb=1  → D = B  (pass the B word)
//   • Ka=0,Kb=0  → D = 0  (all outputs LOW)
//   • Ka=1,Kb=1  → D = A OR B  (bit-wise OR)
//
// Run:  node js/debug/scenarios/cd4019-andor-select.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4019');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive A1..A4 (aNib bit0..3), B1..B4 (bNib bit0..3), Ka, Kb; re-solve.
function apply(aNib, bNib, ka, kb) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4019 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(`A${i + 1}`, (aNib >> i) & 1);
    wirePin(`B${i + 1}`, (bNib >> i) & 1);
  }
  wirePin('Ka', ka);
  wirePin('Kb', kb);
  sim.evaluate(world, [chip], wm);
}

const OUTS = ['D1', 'D2', 'D3', 'D4'];
const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
// Read the output word back as a nibble (D1=bit0 .. D4=bit3).
const readNib = () => OUTS.reduce((acc, o, i) => acc | (isHigh(read(o)) ? (1 << i) : 0), 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Sweep several A/B word combinations through all four select modes.
const words = [
  [0b0000, 0b0000],
  [0b1010, 0b0101],
  [0b1100, 0b0011],
  [0b1111, 0b0000],
  [0b0110, 0b1001],
  [0b1111, 0b1111],
];

for (const [a, b] of words) {
  // Ka=1 Kb=0 → D = A
  apply(a, b, 1, 0);
  assert(readNib() === a,
    `Ka=1,Kb=0 (A=${a.toString(2)},B=${b.toString(2)}): expected D=${a.toString(2)}, got ${readNib().toString(2)}`);

  // Ka=0 Kb=1 → D = B
  apply(a, b, 0, 1);
  assert(readNib() === b,
    `Ka=0,Kb=1 (A=${a.toString(2)},B=${b.toString(2)}): expected D=${b.toString(2)}, got ${readNib().toString(2)}`);

  // Ka=0 Kb=0 → D = 0
  apply(a, b, 0, 0);
  assert(readNib() === 0,
    `Ka=0,Kb=0 (A=${a.toString(2)},B=${b.toString(2)}): expected D=0, got ${readNib().toString(2)}`);

  // Ka=1 Kb=1 → D = A OR B
  apply(a, b, 1, 1);
  assert(readNib() === (a | b),
    `Ka=1,Kb=1 (A=${a.toString(2)},B=${b.toString(2)}): expected D=${(a | b).toString(2)}, got ${readNib().toString(2)}`);
}

console.log(`cd4019-andor-select: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
