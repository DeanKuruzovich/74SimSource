// ── 74x138 3-to-8 line decoder / demultiplexer — regression ──────────────────
// The 74x138 (js/chips/chips4.js) drives the DECODER_3TO8 primitive. This guards
// its datasheet-verified behaviour (TI SN74HC138, SCLS107G, Function Table 8-1,
// read as PDF page images per issues.md C4):
//   • select inputs A(LSB) B C(MSB) form a 3-bit code; outputs Y0..Y7 are ACTIVE LOW
//   • the chip is enabled ONLY when G1=HIGH, G2A=LOW, G2B=LOW (all at once)
//   • when enabled, exactly the addressed output is LOW and the other seven HIGH
//   • when any enable is wrong, every output is HIGH
//
// Method: place ONE 74x138 (purely combinational — no sequential state) and wire
// each input to the VCC or GND rail to set its level, then re-solve. Outputs are
// read straight off the pins by name (Y0..Y7). It would have caught a swapped
// enable polarity, a wrong select-bit weight, or an inverted (active-HIGH) output.
//
// Run:  node js/debug/scenarios/74x138-3to8-decoder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x138');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the 3-bit code plus the three enables; re-solve combinationally.
// Defaults enable the chip (G1=1, G2A=0, G2B=0).
function apply(code, { g1 = 1, g2a = 0, g2b = 0 } = {}) {
  const wm = new WireManager();
  const wireLevel = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x138 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wireLevel('VCC', 1);
  wireLevel('GND', 0);
  wireLevel('A', (code >> 0) & 1);
  wireLevel('B', (code >> 1) & 1);
  wireLevel('C', (code >> 2) & 1);
  wireLevel('G1', g1);
  wireLevel('G2A', g2a);
  wireLevel('G2B', g2b);
  sim.evaluate(world, [chip], wm);
}

const OUTS = ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'];
const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const lowOuts = () => OUTS.filter(o => !isHigh(read(o))); // active LOW → selected line is LOW

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Enabled: code 0..7 → exactly the matching output LOW, rest HIGH ───────
for (let n = 0; n <= 7; n++) {
  apply(n);
  const low = lowOuts();
  assert(low.length === 1 && low[0] === `Y${n}`,
    `code ${n}: expected only Y${n} LOW, got [${low.join(',')}]`);
}

// ── 2. Disabled by each enable in turn → all outputs HIGH ────────────────────
for (const [label, opts] of [
  ['G1=LOW',  { g1: 0 }],
  ['G2A=HIGH',{ g2a: 1 }],
  ['G2B=HIGH',{ g2b: 1 }],
]) {
  for (let n = 0; n <= 7; n++) {
    apply(n, opts);
    const low = lowOuts();
    assert(low.length === 0,
      `${label}, code ${n}: disabled chip should hold all outputs HIGH, got LOW [${low.join(',')}]`);
  }
}

console.log(`74x138-3to8-decoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
