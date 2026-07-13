// ── 74x125 Quad bus buffer, non-inverting, active-LOW enable (3-State) ───────
// The 74x125 (js/chips/chips4.js) is primitive-backed by TRI_BUFFER_LO — one
// gate per channel, inputs [nA, nOE], output nY. Verified against Texas
// Instruments "SN54125/SN54126/... Quadruple Bus Buffers With 3-State Outputs",
// SDLS044A (rev. Mar. 2002): terminal diagram (DIP-14, p.1), logic diagram
// (Y = A, bubble on control Ḡ → active-LOW enable, p.2), and description ("The
// '125 ... outputs are disabled when Ḡ is high"). The enable is called Ḡ on the
// datasheet, OE here.
//
// This is the ACTIVE-LOW sibling of the active-HIGH 74x126 — a polarity swap
// between the two is the most likely future bug, so this guard pins it down.
//
// Behaviour (per channel n):
//   OE=L, A=L → Y=L     (enabled, non-inverting)
//   OE=L, A=H → Y=H
//   OE=H, A=X → Y=Z      (high impedance)
//
// Method: place ONE 74x125 (purely combinational), drive the four data inputs and
// four enables to the VCC/GND rail, re-solve, read the Y pins by name.
//
// Checks:
//   1. Enabled (OE=0): Yn = An across every input pattern.
//   2. Disabled (OE=1) with An held HIGH → Yn is NOT driven HIGH (high impedance).
//      A held HIGH so an enabled output would read HIGH; disabled it must not.
//   3. Channels are independent: enabling one does not disturb a disabled one.
//
// Run:  node js/debug/scenarios/74x125-quad-tri-buffer.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x125');
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
    if (!p) throw new Error(`74x125 has no pin named ${name}`);
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

// ── 1. Enabled (all OE=0, active LOW): Yn = An across a sweep of patterns ──────
const PATTERNS = [
  [0,0,0,0],
  [1,1,1,1],
  [1,0,1,0],
  [0,1,0,1],
  [1,0,0,1],
  [0,1,1,0],
];
for (const bits of PATTERNS) {
  apply([0,0,0,0], bits);
  const exp = bits.join('');
  const got = yStr();
  assert(got === exp, `enabled: A=[${bits}] expected Y=${exp}, got ${got}`);
}

// ── 2. Disabled (all OE=1) with A HIGH → high impedance (not driven HIGH) ──────
apply([1,1,1,1], [1,1,1,1]);
for (const n of Y) {
  assert(!isHigh(read(n)),
    `all disabled: ${n} should be high impedance (not HIGH), got ${yStr()}`);
}

// ── 3. Channel independence: enable ch1 (OE=0, A=HIGH), disable ch2/3/4 (OE=1) ─
// ch1 must read HIGH; ch2/3/4 must not be driven HIGH.
apply([0,1,1,1], [1,1,1,1]);
assert(isHigh(read('1Y')), `independence: 1Y should be HIGH (enabled), got ${yStr()}`);
for (const n of ['2Y','3Y','4Y']) {
  assert(!isHigh(read(n)),
    `independence: ${n} should be Hi-Z while ch1 enabled, got ${yStr()}`);
}

// Sanity: enabled with A LOW drives LOW (proves non-inverting, not just "HIGH").
apply([0,0,0,0], [0,0,0,0]);
assert(yStr() === '0000', `non-inverting sanity: expected Y=0000, got ${yStr()}`);

console.log(`74x125-quad-tri-buffer: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
