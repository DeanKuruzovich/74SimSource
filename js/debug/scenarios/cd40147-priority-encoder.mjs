// ── CD40147 10-to-4 BCD priority encoder — regression ────────────────────────
// The CD40147 (js/chips/chips141.js) reuses the existing PRIORITY_ENC_10TO4
// primitive (shared with the TTL 74x147). This guards the chip's DB entry: the
// active-LOW input pin map (I1=11,I2=12,I3=13,I4=1,I5=2,I6=3,I7=4,I8=5,I9=10),
// the active-LOW inverted-BCD output map (A0n=9,A1n=7,A2n=6,A3n=14), the
// priority order (I9 highest), and the fact that the physical line-0 pin
// (I0=15) does NOT change the output.
//
// All inputs are active LOW: drive a line LOW to assert it. Outputs are active
// LOW inverted BCD: output value = ~(decimal) on A3n..A0n. So decimal 0 reads
// 1111 and decimal 9 reads 0110.
//
// Run:  node js/debug/scenarios/cd40147-priority-encoder.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40147');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const INS = ['I0','I1','I2','I3','I4','I5','I6','I7','I8','I9'];
const OUTS = ['A0n','A1n','A2n','A3n']; // weights 1,2,4,8

// asserted = Set of input names to drive LOW; all other inputs driven HIGH.
function apply(asserted) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40147 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (const n of INS) wirePin(n, asserted.has(n) ? 0 : 1); // LOW=assert
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
// Decode the active-LOW inverted-BCD outputs back to a decimal value.
function decodeDecimal() {
  let invBits = 0; // bits as read on the pins
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

// ── 2. No line 1..9 asserted → decimal 0 (outputs all HIGH) ──────────────────
apply(new Set());
assert(decodeDecimal() === 0, `no input asserted: expected decimal 0, got ${decodeDecimal()}`);
assert(OUTS.every(o => isHigh(read(o))), 'no input asserted: all outputs should be HIGH (active-LOW 0)');

// ── 3. Priority: higher-numbered line wins over lower ────────────────────────
apply(new Set(['I3','I7'])); // 7 beats 3
assert(decodeDecimal() === 7, `I3+I7 LOW: expected 7 (higher priority wins), got ${decodeDecimal()}`);
apply(new Set(['I1','I2','I5','I9'])); // 9 beats all
assert(decodeDecimal() === 9, `I1+I2+I5+I9 LOW: expected 9, got ${decodeDecimal()}`);
apply(new Set(['I1','I2'])); // 2 beats 1
assert(decodeDecimal() === 2, `I1+I2 LOW: expected 2, got ${decodeDecimal()}`);

// ── 4. Line 0 is a no-op: asserting I0 must not change the decimal-0 output ───
apply(new Set(['I0']));
assert(decodeDecimal() === 0, `only I0 LOW: expected decimal 0 (line 0 has no effect), got ${decodeDecimal()}`);
apply(new Set(['I0','I5'])); // I0 must not disturb the I5 encode
assert(decodeDecimal() === 5, `I0+I5 LOW: expected 5 (line 0 ignored), got ${decodeDecimal()}`);

console.log(`cd40147-priority-encoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
