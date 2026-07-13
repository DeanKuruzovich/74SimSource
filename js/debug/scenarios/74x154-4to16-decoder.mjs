// ── 74x154 4-to-16 line decoder / demultiplexer — regression ─────────────────
// The 74x154 (js/chips/chips5.js) drives the DECODER_4TO16 primitive. This guards
// its datasheet-verified behaviour (TI SN54154/SN74154, SDLS056, FUNCTION TABLE,
// pages 1-2, read as PDF page images per issues.md C4):
//   • address inputs A(LSB) B C D(MSB) form a 4-bit code; outputs Y0..Y15 ACTIVE LOW
//   • the chip is enabled ONLY when BOTH strobes G1=LOW and G2=LOW (either HIGH → off)
//   • when enabled, exactly the addressed output is LOW and the other fifteen HIGH
//   • when either strobe is HIGH, every output is HIGH
// Also exercises demultiplexer mode: with G2 held LOW, data on G1 reaches the
// addressed output active LOW.
//
// Method: place ONE 74x154 (purely combinational — no sequential state) and wire
// each input to the VCC or GND rail to set its level, then re-solve. Outputs are
// read straight off the pins by name (Y0..Y15). It would have caught a swapped
// strobe polarity, a wrong address-bit weight, or an inverted (active-HIGH) output.
//
// Run:  node js/debug/scenarios/74x154-4to16-decoder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x154');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the 4-bit code plus the two strobes; re-solve combinationally.
// Defaults enable the chip (G1=0, G2=0, both active LOW).
function apply(code, { g1 = 0, g2 = 0 } = {}) {
  const wm = new WireManager();
  const wireLevel = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x154 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wireLevel('VCC', 1);
  wireLevel('GND', 0);
  wireLevel('A', (code >> 0) & 1);
  wireLevel('B', (code >> 1) & 1);
  wireLevel('C', (code >> 2) & 1);
  wireLevel('D', (code >> 3) & 1);
  wireLevel('G1', g1);
  wireLevel('G2', g2);
  sim.evaluate(world, [chip], wm);
}

const OUTS = Array.from({ length: 16 }, (_, i) => `Y${i}`);
const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const lowOuts = () => OUTS.filter(o => !isHigh(read(o))); // active LOW → selected line is LOW

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Enabled: code 0..15 → exactly the matching output LOW, rest HIGH ──────
for (let n = 0; n <= 15; n++) {
  apply(n);
  const low = lowOuts();
  assert(low.length === 1 && low[0] === `Y${n}`,
    `code ${n}: expected only Y${n} LOW, got [${low.join(',')}]`);
}

// ── 2. Disabled by either strobe HIGH → all outputs HIGH ─────────────────────
for (const [label, opts] of [
  ['G1=HIGH', { g1: 1 }],
  ['G2=HIGH', { g2: 1 }],
  ['both HIGH', { g1: 1, g2: 1 }],
]) {
  for (const n of [0, 5, 10, 15]) {
    apply(n, opts);
    const low = lowOuts();
    assert(low.length === 0,
      `${label}, code ${n}: disabled chip should hold all outputs HIGH, got LOW [${low.join(',')}]`);
  }
}

// ── 3. Demultiplexer mode: G2=LOW, data on G1 steered to the addressed line ───
// Data LOW (G1=0) → addressed output LOW; data HIGH (G1=1) → all outputs HIGH.
for (const n of [3, 9, 12]) {
  apply(n, { g1: 0, g2: 0 }); // data = LOW
  assert(lowOuts().length === 1 && lowOuts()[0] === `Y${n}`,
    `demux data=LOW, addr ${n}: expected only Y${n} LOW, got [${lowOuts().join(',')}]`);
  apply(n, { g1: 1, g2: 0 }); // data = HIGH
  assert(lowOuts().length === 0,
    `demux data=HIGH, addr ${n}: expected all outputs HIGH, got LOW [${lowOuts().join(',')}]`);
}

console.log(`74x154-4to16-decoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
