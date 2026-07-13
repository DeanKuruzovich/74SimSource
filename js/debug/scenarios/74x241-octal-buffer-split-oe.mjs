// ── 74x241 Octal buffer/line driver, non-inverting, SPLIT enable (3-State) ───
// The 74x241 (js/chips/chips16.js) is primitive-backed by eight tri-state
// buffers: group 1 uses TRI_BUFFER_LO (enable active LOW), group 2 uses
// TRI_BUFFER_HI (enable active HIGH). One gate per line, inputs [nA, nOE],
// output nY.
//
// Verified against Texas Instruments "SNx4LS24x, SNx4S24x Octal Buffers and
// Line Drivers With 3-State Outputs", SDLS144D (rev. Oct. 2016): Pin
// Configuration and Functions (DIP-20, p.3), '241 logic diagram (Fig. 17, p.11,
// non-inverting), and '241 function table (Table 2, p.13). The datasheet
// footnote on pin 19 makes the split explicit: pin 19 is 2G (active HIGH) for
// the '241, but 2G-bar (active LOW) for the '240/'244. The enables are called
// 1G / 2G on the datasheet, 1OE / 2OE here.
//
// The defining feature of the '241 — and the most likely future bug — is that
// the two groups have OPPOSITE enable polarity. If someone ever "cleans up" the
// gates[] to a single polarity (copying the all-active-LOW 74x244), this guard
// catches it.
//
// Behaviour:
//   Group 1 (1Y follows 1A):  1OE=L → enabled,  1OE=H → high impedance
//   Group 2 (2Y follows 2A):  2OE=H → enabled,  2OE=L → high impedance
//   Both groups are non-inverting (Y = A when enabled).
//
// Method: place ONE 74x241 (purely combinational), drive the eight data inputs
// and two enables to the VCC/GND rail, re-solve, read the Y pins by name.
//
// Run:  node js/debug/scenarios/74x241-octal-buffer-split-oe.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x241');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A1 = ['1A1', '1A2', '1A3', '1A4'];
const Y1 = ['1Y1', '1Y2', '1Y3', '1Y4'];
const A2 = ['2A1', '2A2', '2A3', '2A4'];
const Y2 = ['2Y1', '2Y2', '2Y3', '2Y4'];

// Drive both enables and all eight data inputs to the rails, then solve.
function apply({ oe1, oe2, a1, a2 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x241 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('1OE', oe1);
  wirePin('2OE', oe2);
  A1.forEach((name, i) => wirePin(name, a1[i]));
  A2.forEach((name, i) => wirePin(name, a2[i]));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const grp = (names) => names.map(n => (isHigh(read(n)) ? 1 : 0)).join('');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const PATTERNS = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 1, 0],
];

// ── 1. Both groups enabled (1OE=0, 2OE=1): Yn = An, non-inverting ────────────
for (const bits of PATTERNS) {
  apply({ oe1: 0, oe2: 1, a1: bits, a2: bits });
  const exp = bits.join('');
  assert(grp(Y1) === exp, `both enabled: group1 A=[${bits}] expected ${exp}, got ${grp(Y1)}`);
  assert(grp(Y2) === exp, `both enabled: group2 A=[${bits}] expected ${exp}, got ${grp(Y2)}`);
}

// ── 2. Polarity is SPLIT: the OTHER enable state disables each group ─────────
// Group 1 disabled means 1OE=HIGH; group 2 disabled means 2OE=LOW.
// Hold all inputs HIGH so an enabled output would read HIGH; disabled must not.
apply({ oe1: 1, oe2: 0, a1: [1, 1, 1, 1], a2: [1, 1, 1, 1] });
for (const n of Y1) {
  assert(!isHigh(read(n)), `1OE=HIGH must disable group 1: ${n} should be Hi-Z, group1=${grp(Y1)}`);
}
for (const n of Y2) {
  assert(!isHigh(read(n)), `2OE=LOW must disable group 2: ${n} should be Hi-Z, group2=${grp(Y2)}`);
}

// ── 3. Groups are independent: enable group 1 only, group 2 stays Hi-Z ───────
// 1OE=0 (grp1 on), 2OE=0 (grp2 off). All inputs HIGH.
apply({ oe1: 0, oe2: 0, a1: [1, 1, 1, 1], a2: [1, 1, 1, 1] });
assert(grp(Y1) === '1111', `group1 enabled alone should be HIGH, got ${grp(Y1)}`);
for (const n of Y2) {
  assert(!isHigh(read(n)), `group2 disabled while group1 on: ${n} should be Hi-Z, group2=${grp(Y2)}`);
}
// ...and the mirror: enable group 2 only (1OE=1 off, 2OE=1 on).
apply({ oe1: 1, oe2: 1, a1: [1, 1, 1, 1], a2: [1, 1, 1, 1] });
assert(grp(Y2) === '1111', `group2 enabled alone should be HIGH, got ${grp(Y2)}`);
for (const n of Y1) {
  assert(!isHigh(read(n)), `group1 disabled while group2 on: ${n} should be Hi-Z, group1=${grp(Y1)}`);
}

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.log(`✗ 74x241 split-OE octal buffer: ${failures.length} failure(s)`);
  for (const f of failures) console.log('   - ' + f);
  process.exit(1);
}
console.log('✓ 74x241 split-OE octal buffer: all checks pass');
process.exit(0);
