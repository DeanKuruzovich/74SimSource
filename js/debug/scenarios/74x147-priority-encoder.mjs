// ── 74x147 10-line-to-4-line BCD priority encoder — regression ───────────────
// Guards the DB entry in js/chips/chips12.js against the PRIORITY_ENC_10TO4
// primitive. Verifies the verified pin map (SN74LS147 / CD74HC147, SCHS149G,
// read as PDF page images per issues.md C4):
//   inputs  I1=11, I2=12, I3=13, I4=1, I5=2, I6=3, I7=4, I8=5, I9=10 (all active LOW)
//   outputs A0n=9, A1n=7, A2n=6, A3n=14 (active LOW, inverted BCD; A0n = LSB)
//   power   GND=8, VCC=16;  pin 15 = NC (there is NO I0 pin — decimal 0 is the
//           implied "all inputs HIGH" state, unlike the CD40147 which has I0=15).
//
// This is the distinction from cd40147-priority-encoder.mjs: the 74x147 has no
// physical line-0 pin, so we assert priority + encode + the all-HIGH → 0 case,
// and confirm that touching the NC pin (15) does not disturb the output.
//
// All inputs active LOW: drive a line LOW to assert it. Outputs active LOW
// inverted BCD: value on the pins = ~(decimal). So decimal 0 reads 1111 and
// decimal 9 reads 0110 on A3n..A0n.
//
// Run:  node js/debug/scenarios/74x147-priority-encoder.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x147');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const INS = ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9'];
const OUTS = ['A0n', 'A1n', 'A2n', 'A3n']; // weights 1,2,4,8

// asserted = Set of input names to drive LOW; every other input is driven HIGH.
// extraHigh / extraLow let us also wire non-input pins (e.g. the NC pin 15).
function apply(asserted, { extraLow = [], extraHigh = [] } = {}) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x147 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1); // +5 V rail
  wirePin('GND', 0); // 0 V rail
  for (const n of INS) wirePin(n, asserted.has(n) ? 0 : 1); // LOW = assert
  for (const n of extraLow) wirePin(n, 0);
  for (const n of extraHigh) wirePin(n, 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
// Decode the active-LOW inverted-BCD outputs back to a decimal value.
function decodeDecimal() {
  let invBits = 0; // bits as they read on the pins
  OUTS.forEach((o, i) => { if (isHigh(read(o))) invBits |= (1 << i); });
  return (~invBits) & 0x0F; // outputs are the complement of the BCD value
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Each single line 1..9 asserted → its decimal value on the outputs ─────
for (let n = 1; n <= 9; n++) {
  apply(new Set([`I${n}`]));
  const got = decodeDecimal();
  assert(got === n, `only I${n} LOW: expected decimal ${n}, got ${got}`);
}

// ── 2. No input asserted → decimal 0 (implied zero: all outputs HIGH) ────────
apply(new Set());
assert(decodeDecimal() === 0, `no input asserted: expected decimal 0, got ${decodeDecimal()}`);
assert(OUTS.every(o => isHigh(read(o))), 'no input asserted: all outputs should be HIGH (active-LOW 0)');

// ── 3. Priority: the higher-numbered LOW line wins ───────────────────────────
apply(new Set(['I3', 'I7'])); // 7 beats 3
assert(decodeDecimal() === 7, `I3+I7 LOW: expected 7 (higher priority wins), got ${decodeDecimal()}`);
apply(new Set(['I1', 'I2', 'I5', 'I9'])); // 9 beats all
assert(decodeDecimal() === 9, `I1+I2+I5+I9 LOW: expected 9, got ${decodeDecimal()}`);
apply(new Set(['I1', 'I2'])); // 2 beats 1
assert(decodeDecimal() === 2, `I1+I2 LOW: expected 2, got ${decodeDecimal()}`);

// ── 4. Spot-check the exact inverted-BCD code, not just the decode helper ────
// I9 LOW must drive A3n A2n A1n A0n = 0 1 1 0 (decimal 9 = BCD 1001, inverted).
apply(new Set(['I9']));
assert(!isHigh(read('A3n')) && isHigh(read('A2n')) && isHigh(read('A1n')) && !isHigh(read('A0n')),
  `I9 LOW: expected A3n..A0n = 0110, got ${OUTS.slice().reverse().map(o => isHigh(read(o)) ? 1 : 0).join('')}`);

// ── 5. Pin 15 is NC: wiring it must not change anything ──────────────────────
apply(new Set(['I5']), { extraLow: ['NC'] });
assert(decodeDecimal() === 5, `I5 LOW with NC pulled LOW: expected 5 (pin 15 is a no-connect), got ${decodeDecimal()}`);
apply(new Set(['I5']), { extraHigh: ['NC'] });
assert(decodeDecimal() === 5, `I5 LOW with NC pulled HIGH: expected 5 (pin 15 is a no-connect), got ${decodeDecimal()}`);

console.log(`74x147-priority-encoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
