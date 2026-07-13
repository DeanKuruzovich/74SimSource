// ── CD4531 13-input parity checker / 12-bit parity tree — regression ────────
// The CD4531 (Batch 2, js/chips/chips106.js) is built-in-gate-backed: a single
// multi-input XOR over its thirteen inputs — twelve data bits D0–D11 plus the
// cascade/parity input W — driving the parity output Q. No engine primitive.
//
// This guards the chip's DB entry: the verified DIP-16 pin map (D6=1 D5=2 D4=3
// D3=4 D2=5 D1=6 D0=7 VSS=8 Q=9 W=10 D11=11 D10=12 D9=13 D8=14 D7=15 VDD=16)
// and the function Q = D0⊕…⊕D11⊕W (HIGH for an odd count of HIGH inputs).
//
// Method: place ONE CD4531 (purely combinational — no sequential state) and
// drive all 13 inputs from a parameter vector each step, then read Q off pin 9.
//
// Run:  node js/debug/scenarios/cd4531-parity-checker.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4531');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const INPUTS = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'W'];

// bits: object {D0:0/1, ..., W:0/1}. Drive every input + power, re-solve.
function apply(bits) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4531 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (const n of INPUTS) wirePin(n, bits[n] || 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// XOR of all 13 inputs == parity of the HIGH count (odd → 1).
const expectQ = (bits) => INPUTS.reduce((acc, n) => acc ^ (bits[n] || 0), 0);

// Build a bit-vector from a 13-bit integer (bit i → INPUTS[i]).
const vec = (n) => Object.fromEntries(INPUTS.map((name, i) => [name, (n >> i) & 1]));
const popcount = (n) => { let c = 0; while (n) { c += n & 1; n >>= 1; } return c; };

// 1) Exhaustive sweep would be 8192 solves; sample deterministically across the
//    whole space plus all single-bit and all-but-one patterns (the parity edges).
const samples = new Set();
for (let n = 0; n < 8192; n += 37) samples.add(n);           // even spread
for (let i = 0; i < 13; i++) samples.add(1 << i);            // single HIGH → odd
for (let i = 0; i < 13; i++) samples.add(0x1FFF ^ (1 << i)); // single LOW (12 HIGH → even)
samples.add(0);            // all LOW → even → Q=0
samples.add(0x1FFF);       // all 13 HIGH → odd → Q=1

for (const n of samples) {
  const bits = vec(n);
  apply(bits);
  const exp = expectQ(bits);
  assert(readBit('Q') === exp,
    `code 0x${n.toString(16)} (popcount ${popcount(n)}): expected Q=${exp}, got ${readBit('Q')}`);
}

// 2) Headline behaviors stated explicitly.
const cases = [
  [0x000, 0, 'all inputs LOW → even → Q=0'],
  [0x001, 1, 'one input HIGH → odd → Q=1'],
  [0x003, 0, 'two inputs HIGH → even → Q=0'],
  [0x1FFF, 1, 'all 13 HIGH → odd → Q=1'],
  [0x0FFF, 0, 'twelve data bits HIGH, W LOW → even → Q=0'],
];
for (const [n, exp, label] of cases) {
  apply(vec(n));
  assert(readBit('Q') === exp, `${label}: expected Q=${exp}, got ${readBit('Q')}`);
}

// 3) Parity-check use: generate even parity for a 12-bit word on W, then verify
//    feeding the full 13 received bits back reads Q=0 (intact), and Q=1 after a
//    single-bit error.
{
  const word = 0b101101001011; // 12 data bits (7 ones → odd)
  const dataBits = vec(word & 0xFFF); dataBits.W = 0;
  apply(dataBits);
  const parityBit = readBit('Q'); // even-parity bit so total ones become even
  assert(parityBit === 1, `parity-gen: 12-bit word with 7 ones → parity bit 1, got ${parityBit}`);

  // Receiver: 12 data on D0–D11, parity bit on W → Q must be 0 (no error).
  const recv = vec(word & 0xFFF); recv.W = parityBit;
  apply(recv);
  assert(readBit('Q') === 0, `parity-check intact: expected Q=0, got ${readBit('Q')}`);

  // Inject a single-bit error → Q must flip to 1.
  const corrupted = vec((word ^ 0b000000100000) & 0xFFF); corrupted.W = parityBit;
  apply(corrupted);
  assert(readBit('Q') === 1, `parity-check 1-bit error: expected Q=1, got ${readBit('Q')}`);
}

console.log(`cd4531-parity-checker: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'} (${samples.size} sampled codes)`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
