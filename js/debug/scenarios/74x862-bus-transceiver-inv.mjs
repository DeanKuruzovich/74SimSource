// ── 74x862 — 10-bit bus transceiver (INVERTING, 3-state) — regression ─────────
// The 74x862 (js/chips/chips42.js) is the inverting sibling of the 74x861: a
// 10-bit bidirectional bus transceiver with two active-LOW output enables and no
// direction pin. Data is complemented as it crosses. Control scheme + pinout are
// taken from Texas Instruments, "SN54ABT861, SN74ABT861 10-Bit Transceivers With
// 3-State Outputs", SCBS199C (Feb 1991, rev. May 1997), FUNCTION TABLE, page 2
// (the '862 shares the '861 terminal assignment; only the buffers invert):
//     OEAB=L OEBA=H  ->  A data to B bus   (B = NOT A, A side Hi-Z)
//     OEAB=H OEBA=L  ->  B data to A bus   (A = NOT B, B side Hi-Z)
//     OEAB=H OEBA=H  ->  Isolation         (both sides Hi-Z)
//     OEAB=L OEBA=L  ->  Latch (holds the last word; buses hold complementary levels)
//
// Method: place ONE 74x862, drive the enables and the active source-side bus bits
// to the VCC/GND rails, re-solve, read the destination-side pins by name. The same
// chip object is reused across evaluate() calls so the internal latch state
// persists, which lets us test the latch/hold mode.
//
// Checks:
//   1. A→B: B is the bitwise complement of the A pattern.
//   2. B→A: A is the bitwise complement of the B pattern.
//   3. Isolation: with nothing external driving, outputs are not held HIGH.
//   4. Latch: after data flows A→B, dropping both enables LOW holds A=PATTERN and
//      B=~PATTERN (the complementary word that was on the buses).
//
// Run:  node js/debug/scenarios/74x862-bus-transceiver-inv.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x862');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A = ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10'];
const B = ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10'];

// Wire the named pins to rails: always power + the two enables, plus any bus bits
// listed in `driven` ({name: bit}). Pins not listed are left for the chip to drive.
function apply(oeABn, oeBAn, driven) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x862 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEABn', oeABn);
  wirePin('OEBAn', oeBAn);
  for (const [name, bit] of Object.entries(driven)) wirePin(name, bit);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bitOf = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const PATTERN = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1];
const NOT = PATTERN.map((b) => b ^ 1);

// ── 1. A → B (OEABn=0, OEBAn=1): B is the complement of A ─────────────────────
{
  const driven = {};
  A.forEach((name, i) => { driven[name] = PATTERN[i]; });
  apply(0, 1, driven);
  B.forEach((name, i) => {
    assert(bitOf(name) === NOT[i],
      `A→B: ${name} expected ${NOT[i]} (=NOT A${i + 1}), got ${bitOf(name)}`);
  });
}

// ── 2. B → A (OEABn=1, OEBAn=0): A is the complement of B ─────────────────────
{
  const driven = {};
  B.forEach((name, i) => { driven[name] = PATTERN[i]; });
  apply(1, 0, driven);
  A.forEach((name, i) => {
    assert(bitOf(name) === NOT[i],
      `B→A: ${name} expected ${NOT[i]} (=NOT B${i + 1}), got ${bitOf(name)}`);
  });
}

// ── 3. Isolation (OEABn=1, OEBAn=1): outputs released, not driven HIGH ────────
{
  apply(1, 1, {});
  [...A, ...B].forEach((name) => {
    assert(bitOf(name) === 0, `Isolation: ${name} should not read HIGH, got ${bitOf(name)}`);
  });
}

// ── 4. Latch (OEABn=0, OEBAn=0): hold last word, buses complementary ──────────
{
  // First push a known word A→B so the internal latch captures it.
  const driven = {};
  A.forEach((name, i) => { driven[name] = PATTERN[i]; });
  apply(0, 1, driven);
  // Now drop both enables LOW with NO external drive: chip holds A=PATTERN, B=~PATTERN.
  apply(0, 0, {});
  A.forEach((name, i) => {
    assert(bitOf(name) === PATTERN[i],
      `Latch: ${name} expected held ${PATTERN[i]}, got ${bitOf(name)}`);
  });
  B.forEach((name, i) => {
    assert(bitOf(name) === NOT[i],
      `Latch: ${name} expected held ${NOT[i]}, got ${bitOf(name)}`);
  });
}

console.log(`74x862-bus-transceiver-inv: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
