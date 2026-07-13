// ── CD40109 quad low-to-high voltage level shifter, 3-state — regression ─────
// The CD40109 (Batch 3, js/chips/chips110.js) is primitive-backed: one
// BUFFER_QUAD_TRI_NHIGH gate (inputs [A,EnA, B,EnB, C,EnC, D,EnD], outputs
// [E,F,G,H]). It guards both the chip's DB pin map (verified vs TI/Harris
// CD40109B SCHS099B Fig.1 logic diagram per-unit pin lists:
//   VCC=1, ENABLE A=2, A=3, E=4, F=5, B=6, ENABLE B=7, VSS=8,
//   ENABLE C=9, C=10, G=11, NC=12, H=13, D=14, ENABLE D=15, VDD=16)
// and the per-channel truth table:
//
//   IN  ENABLE | OUT
//    0     1   |  0      ← non-inverting buffer, enabled
//    1     1   |  1
//    X     0   |  Z      ← ENABLE LOW → output high-impedance (3-state)
//
// Each channel has its OWN active-HIGH enable (independent tri-state), so we
// also check that disabling one channel does not disturb the other three. Hi-Z
// vs driven is distinguished via sim.pinDriveStates.
//
// Run:  node js/debug/scenarios/cd40109-level-shifter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40109');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// channel descriptors: [input pin, enable pin, output pin]
const CH = [
  { in: 'A', en: 'ENABLE A', out: 'E' },
  { in: 'B', en: 'ENABLE B', out: 'F' },
  { in: 'C', en: 'ENABLE C', out: 'G' },
  { in: 'D', en: 'ENABLE D', out: 'H' },
];

// Drive the four data inputs + four enables (each a 0/1), re-solve.
function apply(data, enable) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40109 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('VCC', 1); // input-side supply present (informational; engine digital)
  for (let i = 0; i < 4; i++) {
    wirePin(CH[i].in, data[i]);
    wirePin(CH[i].en, enable[i]);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. All enabled: output follows input (non-inverting), all driven ────────
const dataPatterns = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 1, 0, 0],
];
for (const d of dataPatterns) {
  apply(d, [1, 1, 1, 1]);
  for (let i = 0; i < 4; i++) {
    assert(isHigh(read(CH[i].out)) === !!d[i],
      `all-EN d=${d}: ${CH[i].out} should be ${d[i]} (non-inverting), got ${isHigh(read(CH[i].out)) ? 1 : 0}`);
    assert(!isHiZ(CH[i].out), `all-EN: ${CH[i].out} must be driven, not Hi-Z`);
  }
}

// ── 2. All disabled: every output high-impedance regardless of data ─────────
for (const d of dataPatterns) {
  apply(d, [0, 0, 0, 0]);
  for (let i = 0; i < 4; i++)
    assert(isHiZ(CH[i].out), `all-disabled d=${d}: ${CH[i].out} must be Hi-Z, got drive ${driveOf(CH[i].out)}`);
}

// ── 3. Per-channel independence: disable exactly one channel at a time ──────
// Data = all 1s; the disabled channel goes Hi-Z, the other three stay driven HIGH.
for (let dis = 0; dis < 4; dis++) {
  const en = [1, 1, 1, 1];
  en[dis] = 0;
  apply([1, 1, 1, 1], en);
  for (let i = 0; i < 4; i++) {
    if (i === dis) {
      assert(isHiZ(CH[i].out), `only-ch${dis}-disabled: ${CH[i].out} must be Hi-Z, got drive ${driveOf(CH[i].out)}`);
    } else {
      assert(isHigh(read(CH[i].out)), `only-ch${dis}-disabled: ${CH[i].out} (enabled) must follow input HIGH`);
      assert(!isHiZ(CH[i].out), `only-ch${dis}-disabled: ${CH[i].out} (enabled) must stay driven`);
    }
  }
}

// ── 4. Enabled output is push-pull driven (not open) at both logic levels ───
apply([1, 0, 1, 0], [1, 1, 1, 1]);
for (let i = 0; i < 4; i++)
  assert(driveOf(CH[i].out) === DRIVE.PUSH_PULL,
    `enabled ${CH[i].out} drive should be push_pull, got ${driveOf(CH[i].out)}`);

console.log(`cd40109-level-shifter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
