// ── CD40107 dual 2-input NAND buffer/driver, open-drain — regression ─────────
// The CD40107 (Batch 3, js/chips/chips109.js) is built-in-gate-backed: two
// `NAND` gates (gate 1 in [A,B]→C, gate 2 in [D,E]→F) plus the chip-level
// `openCollector: true` flag. It guards both the chip's DB pin map (verified vs
// TI CD40107B SCHS098D Functional Diagram + Truth Table + TERMINAL ASSIGNMENTS
// for the 8-lead CD40107BE: A=1,B=2,C=3,VSS=4,F=5,E=6,D=7,VDD=8) and the
// open-drain truth table:
//
//   A B | C            (per gate; D E | F is identical)
//   0 0 | 1  (Hi-Z, pulled HIGH by implicit pull-up to VDD)
//   1 0 | 1  (Hi-Z)
//   0 1 | 1  (Hi-Z)
//   1 1 | 0  (SINK_ONLY — on-chip n-channel transistor pulls to VSS)
//
// The key open-drain subtlety: the HIGH state is NOT push-pull — the output is
// released (high-impedance / sink-only off) and only reads HIGH because the
// engine auto-applies an implicit pull-up to any Hi-Z OC net (issues.md A8).
// Only the logic-0 (both inputs HIGH) case actively drives, sinking to VSS.
// We distinguish the two by querying sim.pinDriveStates directly.
//
// Run:  node js/debug/scenarios/cd40107-nand-opendrain.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40107');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive the four data inputs (A,B for gate 1; D,E for gate 2); re-solve.
function apply(a, b, d, e) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40107 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('A', a);
  wirePin('B', b);
  wirePin('D', d);
  wirePin('E', e);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isSinking = (name) => driveOf(name) === DRIVE.SINK_ONLY;
const isReleased = (name) => driveOf(name) === DRIVE.HIGH_Z;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Exhaustive over all 16 input combinations; check both gates independently.
for (let a = 0; a <= 1; a++)
for (let b = 0; b <= 1; b++)
for (let d = 0; d <= 1; d++)
for (let e = 0; e <= 1; e++) {
  apply(a, b, d, e);

  const cExpectLow = (a === 1 && b === 1); // NAND==0 only when both HIGH
  const fExpectLow = (d === 1 && e === 1);

  // ── Gate 1 (C = NAND(A,B)) ────────────────────────────────────────────────
  if (cExpectLow) {
    assert(!isHigh(read('C')), `A=${a},B=${b}: C must be LOW (both inputs HIGH)`);
    assert(isSinking('C'), `A=${a},B=${b}: C must actively SINK to VSS (open-drain on), got drive ${driveOf('C')}`);
  } else {
    assert(isHigh(read('C')), `A=${a},B=${b}: C must read HIGH via implicit pull-up`);
    assert(isReleased('C'), `A=${a},B=${b}: C must be released/Hi-Z (open-drain off, NOT push-pull), got drive ${driveOf('C')}`);
  }

  // ── Gate 2 (F = NAND(D,E)) — independent of gate 1 ────────────────────────
  if (fExpectLow) {
    assert(!isHigh(read('F')), `D=${d},E=${e}: F must be LOW (both inputs HIGH)`);
    assert(isSinking('F'), `D=${d},E=${e}: F must actively SINK to VSS (open-drain on), got drive ${driveOf('F')}`);
  } else {
    assert(isHigh(read('F')), `D=${d},E=${e}: F must read HIGH via implicit pull-up`);
    assert(isReleased('F'), `D=${d},E=${e}: F must be released/Hi-Z (open-drain off), got drive ${driveOf('F')}`);
  }

  // Sanity: a push-pull HIGH would be a bug (would defeat wired-AND).
  assert(driveOf('C') !== DRIVE.PUSH_PULL, `A=${a},B=${b}: C must never be PUSH_PULL (open-drain part)`);
  assert(driveOf('F') !== DRIVE.PUSH_PULL, `D=${d},E=${e}: F must never be PUSH_PULL (open-drain part)`);
}

console.log(`cd40107-nand-opendrain: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
