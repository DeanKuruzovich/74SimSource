// ── 74x245 — octal bidirectional bus transceiver (3-state) — regression ──────
// The 74x245 (js/chips/chips6.js) is an 8-bit bidirectional bus transceiver with
// one direction pin and one active-LOW output enable. Verified against Texas
// Instruments, "SN54LS245, SN74LS245 Octal Bus Transceivers With 3-State
// Outputs", SDLS146B (Oct 1976, rev. Sep 2016), §6 Pin Functions + §9.4 Device
// Functional Modes (read as PDF page images, issues.md C4):
//     OE#=L  DIR=H  ->  A data to B bus   (A→B, A side Hi-Z)
//     OE#=L  DIR=L  ->  B data to A bus   (B→A, B side Hi-Z)
//     OE#=H  DIR=X  ->  Isolation         (both sides Hi-Z)
// Verified terminal assignment: DIR=1, A1..A8=2..9, GND=10, B8..B1=11..18,
// OE#=19, VCC=20 — this scenario would fail if that pin map were scrambled.
//
// Method: place ONE 74x245, drive DIR/OE# and the active source-side bus bits to
// the VCC/GND rails, re-solve, read the destination-side pins by name.
//
// Checks:
//   1. A→B (OE#=L, DIR=H): B mirrors the A pattern, non-inverted.
//   2. B→A (OE#=L, DIR=L): A mirrors the B pattern, non-inverted.
//   3. Isolation (OE#=H): with nothing external driving, outputs are not held HIGH.
//
// Run:  node js/debug/scenarios/74x245-octal-bus-transceiver.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x245');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];
const B = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'];

// Wire the named pins to rails: always power + DIR + OE#, plus any bus bits
// listed in `driven` ({name: bit}). Pins not listed are left for the chip to drive.
function apply(dir, oeN, driven) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x245 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('DIR', dir);
  wirePin('OE', oeN);
  for (const [name, bit] of Object.entries(driven)) wirePin(name, bit);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bitOf = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const PATTERN = [1, 0, 1, 1, 0, 0, 1, 0];

// ── 1. A → B (OE#=0, DIR=1): B mirrors A ─────────────────────────────────────
{
  const driven = {};
  A.forEach((name, i) => { driven[name] = PATTERN[i]; });
  apply(1, 0, driven);
  B.forEach((name, i) => {
    assert(bitOf(name) === PATTERN[i],
      `A→B: ${name} expected ${PATTERN[i]}, got ${bitOf(name)}`);
  });
}

// ── 2. B → A (OE#=0, DIR=0): A mirrors B ─────────────────────────────────────
{
  const inv = PATTERN.map((b) => b ^ 1); // different pattern to be sure
  const driven = {};
  B.forEach((name, i) => { driven[name] = inv[i]; });
  apply(0, 0, driven);
  A.forEach((name, i) => {
    assert(bitOf(name) === inv[i],
      `B→A: ${name} expected ${inv[i]}, got ${bitOf(name)}`);
  });
}

// ── 3. Isolation (OE#=1): outputs released, not driven HIGH ──────────────────
{
  apply(1, 1, {});
  [...A, ...B].forEach((name) => {
    assert(bitOf(name) === 0, `Isolation: ${name} should not read HIGH, got ${bitOf(name)}`);
  });
}

console.log(`74x245-octal-bus-transceiver: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
