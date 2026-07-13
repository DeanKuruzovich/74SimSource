// ── 74x126 Quad bus buffer, non-inverting, active-HIGH enable (3-State) ──────
// The 74x126 (js/chips/chips4.js) is primitive-backed by TRI_BUFFER_HI — one
// gate per channel, inputs [nA, nOE], output nY. Verified against Texas
// Instruments "SN54125/SN54126/... Quadruple Bus Buffers With 3-State Outputs",
// SDLS044A (rev. Mar. 2002): terminal diagram (DIP-14, p.1), logic diagram
// (Y = A, active-HIGH control G, p.2), and description ("the '126 ... outputs are
// disabled when G is low"). The enable is called G on the datasheet, OE here.
//
// This is the ACTIVE-HIGH sibling of the active-LOW 74x125 — a polarity swap
// between the two is the most likely future bug, so this guard pins it down.
//
// Behaviour (per channel n):
//   OE=H, A=L → Y=L     (enabled, non-inverting)
//   OE=H, A=H → Y=H
//   OE=L, A=X → Y=Z      (high impedance)
//
// Method: place ONE 74x126 (purely combinational), drive the four data inputs and
// four enables to the VCC/GND rail, re-solve, read the Y pins by name.
//
// Checks:
//   1. Enabled (OE=1): Yn = An across every input pattern.
//   2. Disabled (OE=0) with An held HIGH → Yn is NOT driven HIGH (high impedance).
//      A held HIGH so an enabled output would read HIGH; disabled it must not.
//   3. Channels are independent: enabling one does not disturb a disabled one.
//
// Run:  node js/debug/scenarios/74x126-quad-tri-buffer.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x126');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const OE = ['1OE', '2OE', '3OE', '4OE'];
const A  = ['1A', '2A', '3A', '4A'];
const Y  = ['1Y', '2Y', '3Y', '4Y'];

// Drive the four enables (oes[]) and four data inputs (as[]) to the rails.
function apply(oes, as) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x126 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  OE.forEach((name, i) => wirePin(name, oes[i]));
  A.forEach((name, i) => wirePin(name, as[i]));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const yStr = () => Y.map(n => (isHigh(read(n)) ? 1 : 0)).join('');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Enabled (all OE=1): Yn = An across a sweep of 4-bit patterns ───────────
const PATTERNS = [
  [0,0,0,0],
  [1,1,1,1],
  [1,0,1,0],
  [0,1,0,1],
  [1,0,0,1],
  [0,1,1,0],
];
for (const bits of PATTERNS) {
  apply([1,1,1,1], bits);
  const exp = bits.join('');
  const got = yStr();
  assert(got === exp, `enabled: A=[${bits}] expected Y=${exp}, got ${got}`);
}

// ── 2. Disabled (all OE=0) with A HIGH → high impedance (not driven HIGH) ─────
apply([0,0,0,0], [1,1,1,1]);
for (const n of Y) {
  assert(!isHigh(read(n)),
    `all disabled: ${n} should be high impedance (not HIGH), got ${yStr()}`);
}

// ── 3. Channel independence: enable ch1 (A=HIGH), disable ch2/3/4 (A=HIGH) ────
// ch1 must read HIGH; ch2/3/4 must not be driven HIGH.
apply([1,0,0,0], [1,1,1,1]);
assert(isHigh(read('1Y')), `independence: 1Y should be HIGH (enabled), got ${yStr()}`);
for (const n of ['2Y','3Y','4Y']) {
  assert(!isHigh(read(n)),
    `independence: ${n} should be Hi-Z while ch1 enabled, got ${yStr()}`);
}

// Sanity: enabled with A LOW drives LOW (proves non-inverting, not just "HIGH").
apply([1,1,1,1], [0,0,0,0]);
assert(yStr() === '0000', `non-inverting sanity: expected Y=0000, got ${yStr()}`);

console.log(`74x126-quad-tri-buffer: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
