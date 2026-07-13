// ── CD4043 quad 3-state NOR R/S latch regression ────────────────────────────
// The CD4043 (Batch 4, js/chips/chips111.js) maps onto the dedicated
// SR_LATCH_QUAD_TRI engine primitive: four cross-coupled active-HIGH NOR R/S
// latches (set-dominant) sharing one common active-HIGH 3-state ENABLE.
//
// Datasheet truth table (TI CD4043B/CD4044B SCHS041D, CD4043B TRUTH TABLE):
//   S R E | Q
//   X X 0 | open circuit (3-state / Hi-Z on the Q outputs)
//   0 0 1 | NC   (no change / hold)
//   0 1 1 | 0    (reset)
//   1 0 1 | 1    (set)
//   1 1 1 | 1    (SET dominates — "DOMINATED BY S=1 INPUT")
//
// Method: place ONE CD4043 and keep the same chip + sim instance across the run
// so the latch state (comp.state) persists. Inputs are re-wired HIGH/LOW each
// solve. Q outputs are read by voltage when ENABLE=1 and by drive-state (Hi-Z)
// when ENABLE=0.
//
// Checks:
//   • set / reset / hold per the truth table on all four independent latches
//   • S=R=1 → Q=1 (set dominates) on the NOR latch
//   • ENABLE=0 → all four Q pins go true Hi-Z (3-state), state retained
//   • re-enabling restores the held value
//
// Run:  node js/debug/scenarios/cd4043-rs-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4043');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with each input held at the given rail level (1 = VCC row, 0 = GND
// row). A fresh WireManager each call is fine — the latch state lives on the
// (persistent) chip component, not the wires.
function apply({ s1, r1, s2, r2, s3, r3, s4, r4, en }) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4043 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('S1', s1); wirePin('R1', r1);
  wirePin('S2', s2); wirePin('R2', r2);
  wirePin('S3', s3); wirePin('R3', r3);
  wirePin('S4', s4); wirePin('R4', r4);
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

const QS = ['Q1', 'Q2', 'Q3', 'Q4'];
function expectQ(tag, [q1, q2, q3, q4]) {
  const want = { Q1: q1, Q2: q2, Q3: q3, Q4: q4 };
  for (const [q, v] of Object.entries(want)) {
    const got = read(q);
    assert(v ? isHigh(got) : isLow(got),
      `${tag}: ${q} expected ${v ? 'HIGH' : 'LOW'}, got ${got.toFixed(2)} V`);
  }
}

// ── 1. Reset all four latches to a known 0, ENABLE on ────────────────────────
apply({ s1: 0, r1: 1, s2: 0, r2: 1, s3: 0, r3: 1, s4: 0, r4: 1, en: 1 });
expectQ('reset all', [0, 0, 0, 0]);

// ── 2. Set each latch independently: S=1,R=0 → Q=1 (set), one at a time ──────
apply({ s1: 1, r1: 0, s2: 0, r2: 0, s3: 0, r3: 0, s4: 0, r4: 0, en: 1 });
expectQ('set Q1 only (others hold 0)', [1, 0, 0, 0]);

apply({ s1: 0, r1: 0, s2: 1, r2: 0, s3: 0, r3: 0, s4: 1, r4: 0, en: 1 });
expectQ('set Q2 & Q4, Q1 holds 1', [1, 1, 0, 1]);

// ── 3. Hold: all inputs LOW → no change ──────────────────────────────────────
apply({ s1: 0, r1: 0, s2: 0, r2: 0, s3: 0, r3: 0, s4: 0, r4: 0, en: 1 });
expectQ('hold (S=R=0 everywhere)', [1, 1, 0, 1]);

// ── 4. Reset Q1 & Q4, leave Q2 set, set Q3 ──────────────────────────────────
apply({ s1: 0, r1: 1, s2: 0, r2: 0, s3: 1, r3: 0, s4: 0, r4: 1, en: 1 });
expectQ('mixed reset/set/hold', [0, 1, 1, 0]);

// ── 5. SET dominates on the NOR latch: S=1,R=1 → Q=1 ────────────────────────
apply({ s1: 1, r1: 1, s2: 1, r2: 1, s3: 1, r3: 1, s4: 1, r4: 1, en: 1 });
expectQ('S=R=1 → set dominates', [1, 1, 1, 1]);

// ── 6. ENABLE LOW → all Q pins go true Hi-Z (3-state), data retained ─────────
apply({ s1: 0, r1: 1, s2: 0, r2: 0, s3: 0, r3: 0, s4: 0, r4: 0, en: 0 });
for (const q of QS) assert(isHiZ(q), `ENABLE=0: ${q} must be Hi-Z, got drive ${driveOf(q)}`);

// ── 7. Re-enable: latch 1 was reset while disabled (inputs still tracked),
//      latches 2-4 retained their HIGH from step 5 ───────────────────────────
apply({ s1: 0, r1: 0, s2: 0, r2: 0, s3: 0, r3: 0, s4: 0, r4: 0, en: 1 });
expectQ('re-enable: Q1 reset-while-disabled, Q2-Q4 retained HIGH', [0, 1, 1, 1]);
for (const q of QS) assert(!isHiZ(q), `ENABLE=1: ${q} must be driven, not Hi-Z`);

console.log(`cd4043-rs-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
