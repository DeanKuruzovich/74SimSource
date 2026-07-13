// ── 74x861 — 10-bit bus transceiver (non-inverting, 3-state) — regression ─────
// The 74x861 (js/chips/chips42.js) is a 10-bit bidirectional bus transceiver with
// two active-LOW output enables. Verified against Texas Instruments, "SN54ABT861,
// SN74ABT861 10-Bit Transceivers With 3-State Outputs", SCBS199C (Feb 1991, rev.
// May 1997), FUNCTION TABLE, page 2:
//     OEAB=L OEBA=H  ->  A data to B bus   (A→B, A side Hi-Z)
//     OEAB=H OEBA=L  ->  B data to A bus   (B→A, B side Hi-Z)
//     OEAB=H OEBA=H  ->  Isolation         (both sides Hi-Z)
//     OEAB=L OEBA=L  ->  Latch A and B (A=B, holds the last word on both buses)
//
// Method: place ONE 74x861, drive the enables and the active source-side bus bits
// to the VCC/GND rails, re-solve, read the destination-side pins by name. The same
// chip object is reused across evaluate() calls so the internal latch state (from
// _getSeqState) persists — that lets us test the "Latch A and B" hold mode.
//
// Checks:
//   1. A→B: B mirrors the A pattern, non-inverted.
//   2. B→A: A mirrors the B pattern, non-inverted.
//   3. Isolation: with nothing external driving, outputs are not held HIGH.
//   4. Latch: after data flows A→B, dropping both enables LOW holds that word on
//      both buses with no external drive.
//
// Run:  node js/debug/scenarios/74x861-bus-transceiver.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x861');
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
    if (!p) throw new Error(`74x861 has no pin named ${name}`);
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

// ── 1. A → B (OEABn=0, OEBAn=1): B mirrors A ─────────────────────────────────
{
  const driven = {};
  A.forEach((name, i) => { driven[name] = PATTERN[i]; });
  apply(0, 1, driven);
  B.forEach((name, i) => {
    assert(bitOf(name) === PATTERN[i],
      `A→B: ${name} expected ${PATTERN[i]}, got ${bitOf(name)}`);
  });
}

// ── 2. B → A (OEABn=1, OEBAn=0): A mirrors B ─────────────────────────────────
{
  const inv = PATTERN.map((b) => b ^ 1); // different pattern to be sure
  const driven = {};
  B.forEach((name, i) => { driven[name] = inv[i]; });
  apply(1, 0, driven);
  A.forEach((name, i) => {
    assert(bitOf(name) === inv[i],
      `B→A: ${name} expected ${inv[i]}, got ${bitOf(name)}`);
  });
}

// ── 3. Isolation (OEABn=1, OEBAn=1): outputs released, not driven HIGH ────────
{
  apply(1, 1, {});
  [...A, ...B].forEach((name) => {
    assert(bitOf(name) === 0, `Isolation: ${name} should not read HIGH, got ${bitOf(name)}`);
  });
}

// ── 4. Latch A and B (OEABn=0, OEBAn=0): hold the last A→B word ───────────────
{
  // First push a known word A→B so the internal latch captures it.
  const driven = {};
  A.forEach((name, i) => { driven[name] = PATTERN[i]; });
  apply(0, 1, driven);
  // Now drop both enables LOW with NO external drive: the chip holds A=B=PATTERN.
  apply(0, 0, {});
  A.forEach((name, i) => {
    assert(bitOf(name) === PATTERN[i],
      `Latch: ${name} expected held ${PATTERN[i]}, got ${bitOf(name)}`);
  });
  B.forEach((name, i) => {
    assert(bitOf(name) === PATTERN[i],
      `Latch: ${name} expected held ${PATTERN[i]}, got ${bitOf(name)}`);
  });
}

console.log(`74x861-bus-transceiver: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
