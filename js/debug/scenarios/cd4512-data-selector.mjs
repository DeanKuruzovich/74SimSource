// ── CD4512 8-channel data selector (8-to-1 mux), 3-state — regression ────────
// The CD4512 (js/chips/chips136.js) is primitive-backed: one MUX_8TO1_TRI_INH
// gate (inputs [D0..D7, A, B, C, INHIBIT, 3-STATE DISABLE], output SEL OUTPUT).
// It guards the chip's DB pin map (verified vs TI CD4512B SCHS073C Terminal
// Assignment + Functional Diagram + Truth Table:
//   D0=1 D1=2 D2=3 D3=4 D4=5 D5=6 D6=7 VSS=8 D7=9 INHIBIT=10 A=11 B=12 C=13
//   SEL OUTPUT=14 3-STATE DISABLE=15 VDD=16)
// and the truth table:
//
//   DISABLE INHIBIT | SEL OUTPUT
//      0       0     | D[A + 2B + 4C]   (non-inverting select)
//      0       1     | 0                (forced LOW, actively DRIVEN)
//      1       X     | Z                (high-impedance, dominates INHIBIT)
//
// Key subtleties: A is the LSB of the select; INHIBIT drives a 0 (push-pull),
// whereas 3-STATE DISABLE releases to Hi-Z. We distinguish the two by querying
// sim.pinDriveStates directly.
//
// Run:  node js/debug/scenarios/cd4512-data-selector.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4512');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DINS = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];

// Drive the 8 data bits (one per Dn), the 3-bit select, INHIBIT, DISABLE; solve.
function apply(dWord, sel, inhibit, disable) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4512 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (let i = 0; i < 8; i++) wirePin(DINS[i], (dWord >> i) & 1);
  wirePin('A', sel & 1);
  wirePin('B', (sel >> 1) & 1);
  wirePin('C', (sel >> 2) & 1);
  wirePin('INHIBIT', inhibit);
  wirePin('3-STATE DISABLE', disable);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const out = () => isHigh(read('SEL OUTPUT')) ? 1 : 0;
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Plain 8-to-1 select: for each address, output must equal D[sel] ───────
// Use a data word with a known per-bit pattern and sweep the address; also
// test the complement word to be sure each channel is independently routed.
for (const dWord of [0b10110100, 0b01001011, 0b11111111, 0b00000000]) {
  for (let sel = 0; sel < 8; sel++) {
    apply(dWord, sel, 0, 0);
    const expect = (dWord >> sel) & 1;
    assert(out() === expect,
      `select sel=${sel} D=${dWord.toString(2).padStart(8, '0')}: expected ${expect}, got ${out()}`);
    assert(!isHiZ('SEL OUTPUT'), `select sel=${sel}: output must be driven, not Hi-Z`);
  }
}

// ── 2. INHIBIT=1 (DISABLE=0) → output LOW, but actively DRIVEN (not Hi-Z) ─────
for (let sel = 0; sel < 8; sel++) {
  apply(0xFF, sel, 1, 0); // all data HIGH, so a non-inhibited mux would read 1
  assert(out() === 0, `INHIBIT sel=${sel}: expected 0, got ${out()}`);
  assert(!isHiZ('SEL OUTPUT'), `INHIBIT sel=${sel}: output must be DRIVEN LOW, not Hi-Z`);
}

// ── 3. 3-STATE DISABLE=1 → Hi-Z, and it dominates INHIBIT ────────────────────
apply(0xFF, 3, 0, 1);
assert(isHiZ('SEL OUTPUT'), 'DISABLE=1,INHIBIT=0: SEL OUTPUT must be Hi-Z');
apply(0xFF, 3, 1, 1); // DISABLE must override INHIBIT
assert(isHiZ('SEL OUTPUT'), 'DISABLE=1,INHIBIT=1: DISABLE must dominate → Hi-Z');

if (failures.length) {
  console.error(`CD4512 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD4512 data-selector: all checks passed');
