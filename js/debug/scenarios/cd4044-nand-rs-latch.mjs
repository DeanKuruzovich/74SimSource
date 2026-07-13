// ── CD4044 quad NAND R/S latch (3-state) regression ─────────────────────────
// The CD4044 (Batch 4, js/chips/chips112.js) maps onto the dedicated
// SR_LATCH_QUAD_TRI engine primitive (gate.activeLow = true selects the NAND
// variant). Four cross-coupled NAND R/S latches share one common active-HIGH
// 3-state output ENABLE.
//
// Datasheet truth table (TI CD4043B/CD4044B SCHS041D, "CD4044B"), columns S R E | Q:
//   X X 0 | OC   (ENABLE LOW → outputs open-circuit / Hi-Z)
//   1 1 1 | NC   (hold — inputs are active LOW, both inactive)
//   0 1 1 | 1    (set:   S taken LOW)
//   1 0 1 | 0    (reset: R taken LOW)
//   0 0 1 | 0    ("DOMINATED BY R=0 INPUT" → reset wins when both active)
//
// Method: place ONE CD4044 and keep the same chip + sim instance across the run
// so the latch state (comp.state) persists. Inputs are re-wired HIGH/LOW each
// solve. Hi-Z is detected via sim.pinDriveStates (a Hi-Z pin still reads a
// voltage from the floating net, so the drive TYPE is what we check).
//
// Checks:
//   • active-LOW set / reset / hold, per latch
//   • reset dominance when S=0 and R=0 simultaneously
//   • stored state survives a hold (both inputs returned HIGH)
//   • ENABLE=0 → all four Q outputs Hi-Z; the stored state is retained and
//     reappears when ENABLE returns HIGH
//   • the four latches are independent (different stored values coexist)
//
// Run:  node js/debug/scenarios/cd4044-nand-rs-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4044');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const QOUTS = ['Q1', 'Q2', 'Q3', 'Q4'];

// Drive the four S/R input pairs + ENABLE (all active levels as 0/1), re-solve.
// sr = { s1,r1, s2,r2, s3,r3, s4,r4 }, en = 0|1.
function apply(sr, en) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4044 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('S1', sr.s1); wirePin('R1', sr.r1);
  wirePin('S2', sr.s2); wirePin('R2', sr.r2);
  wirePin('S3', sr.s3); wirePin('R3', sr.r3);
  wirePin('S4', sr.s4); wirePin('R4', sr.r4);
  wirePin('ENABLE', en);
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

// Assert the four Q outputs match [q1,q2,q3,q4] AND are actively driven (not Hi-Z).
function expectQ(tag, [q1, q2, q3, q4]) {
  const want = { Q1: q1, Q2: q2, Q3: q3, Q4: q4 };
  for (const [q, v] of Object.entries(want)) {
    const got = read(q);
    assert(v ? isHigh(got) : isLow(got),
      `${tag}: ${q} expected ${v ? 'HIGH' : 'LOW'}, got ${got.toFixed(2)} V`);
    assert(!isHiZ(q), `${tag}: ${q} must be actively driven (ENABLE HIGH), got Hi-Z`);
  }
}

// HIGH-HIGH on a pair = inactive (hold) for the active-LOW NAND latch.
const HOLD_ALL = { s1: 1, r1: 1, s2: 1, r2: 1, s3: 1, r3: 1, s4: 1, r4: 1 };

// ── 1. Active-LOW SET: take each S LOW (R HIGH) → Q = 1 ──────────────────────
apply({ s1: 0, r1: 1, s2: 0, r2: 1, s3: 0, r3: 1, s4: 0, r4: 1 }, 1);
expectQ('set all (S=0,R=1)', [1, 1, 1, 1]);

// ── 2. Hold: return all inputs HIGH → the set values persist ─────────────────
apply(HOLD_ALL, 1);
expectQ('hold after set (S=1,R=1)', [1, 1, 1, 1]);

// ── 3. Active-LOW RESET: take each R LOW (S HIGH) → Q = 0 ────────────────────
apply({ s1: 1, r1: 0, s2: 1, r2: 0, s3: 1, r3: 0, s4: 1, r4: 0 }, 1);
expectQ('reset all (S=1,R=0)', [0, 0, 0, 0]);

// ── 4. Hold the reset state ─────────────────────────────────────────────────
apply(HOLD_ALL, 1);
expectQ('hold after reset (S=1,R=1)', [0, 0, 0, 0]);

// ── 5. Per-latch independence: set L1+L3, reset L2+L4 in one solve ───────────
apply({ s1: 0, r1: 1, s2: 1, r2: 0, s3: 0, r3: 1, s4: 1, r4: 0 }, 1);
expectQ('mixed set/reset', [1, 0, 1, 0]);

// ── 6. Reset dominance: both S and R LOW on every latch → Q = 0 ─────────────
// (start from the mixed state above so we prove reset overrides a prior 1)
apply({ s1: 0, r1: 0, s2: 0, r2: 0, s3: 0, r3: 0, s4: 0, r4: 0 }, 1);
expectQ('reset dominates (S=0,R=0)', [0, 0, 0, 0]);

// ── 7. Re-establish a known pattern, then test the 3-state ENABLE ───────────
apply({ s1: 0, r1: 1, s2: 1, r2: 0, s3: 0, r3: 1, s4: 1, r4: 0 }, 1);
expectQ('pattern before disable', [1, 0, 1, 0]);

// ENABLE LOW → every Q output goes Hi-Z (open circuit). Hold inputs so the only
// thing changing is ENABLE.
apply({ s1: 1, r1: 1, s2: 1, r2: 1, s3: 1, r3: 1, s4: 1, r4: 1 }, 0);
for (const q of QOUTS) {
  assert(isHiZ(q), `ENABLE=0: ${q} must be Hi-Z (open circuit), got drive ${driveOf(q)}`);
}

// ── 8. Re-enable → the SAME latched pattern reappears (state retained) ───────
apply(HOLD_ALL, 1);
expectQ('pattern retained after re-enable', [1, 0, 1, 0]);

console.log(`cd4044-nand-rs-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
