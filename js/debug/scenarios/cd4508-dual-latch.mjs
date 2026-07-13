// ── CD4508 dual 4-bit latch (3-state) regression ────────────────────────────
// The CD4508 (js/chips/chips118.js) maps onto the dedicated LATCH_4BIT_TRI_RST
// engine primitive — one instance per independent 4-bit latch (A and B). The
// coverage-plan hints did NOT fit: LATCH_TRANS_4BIT is the 74226 bidirectional
// bus transceiver and D_LATCH is a single-bit latch with no 3-state/reset.
//
// Datasheet truth table (TI CD4508B SCHS070B, Fig. 7 — all controls active HIGH;
// columns RESET, OUTPUT DISABLE, STROBE, D → Q):
//   OUTPUT DISABLE=1            → Q = Hi-Z (dominant)
//   else RESET=1               → Q = 0   (latch cleared)
//   else STROBE=1              → transparent: Q follows D
//   else (STROBE=0)            → hold last latched value
//
// Method: place ONE CD4508 and keep the same chip + sim instance across the run
// so latch state (comp.state) persists. Inputs are re-wired HIGH/LOW each solve.
// Both latches are exercised independently to prove they don't interfere, and
// the 3-state outputs are checked via the pin drive state (Hi-Z), not voltage.
//
// Run:  node js/debug/scenarios/cd4508-dual-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4508');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A_D = ['D0A', 'D1A', 'D2A', 'D3A'];
const A_Q = ['Q0A', 'Q1A', 'Q2A', 'Q3A'];
const B_D = ['D0B', 'D1B', 'D2B', 'D3B'];
const B_Q = ['Q0B', 'Q1B', 'Q2B', 'Q3B'];

// state object carries the full pin picture so each solve restates everything.
function apply(s) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4508 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (let i = 0; i < 4; i++) wirePin(A_D[i], (s.a >> i) & 1);
  for (let i = 0; i < 4; i++) wirePin(B_D[i], (s.b >> i) & 1);
  wirePin('STROBE A',         s.strA);
  wirePin('RESET A',          s.rstA);
  wirePin('OUTPUT DISABLE A', s.odA);
  wirePin('STROBE B',         s.strB);
  wirePin('RESET B',          s.rstB);
  wirePin('OUTPUT DISABLE B', s.odB);
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

// Assert a 4-bit output group equals `word` (bit0..bit3) and is actively driven.
function expectWord(tag, names, word) {
  for (let i = 0; i < 4; i++) {
    const want = (word >> i) & 1;
    const got = read(names[i]);
    assert(!isHiZ(names[i]), `${tag}: ${names[i]} must be driven, got Hi-Z`);
    assert(want ? isHigh(got) : isLow(got),
      `${tag}: ${names[i]} expected ${want ? 'HIGH' : 'LOW'}, got ${got.toFixed(2)} V`);
  }
}
function expectHiZ(tag, names) {
  for (const n of names) assert(isHiZ(n), `${tag}: ${n} must be Hi-Z, got drive ${driveOf(n)}`);
}

// Baseline: both latches enabled (OD=0), reset off, strobe HIGH (transparent).
const base = { a: 0, b: 0, strA: 1, rstA: 0, odA: 0, strB: 1, rstB: 0, odB: 0 };

// 1. Transparent: A follows D = 0b1010 (=10), B follows D = 0b0110 (=6).
apply({ ...base, a: 0b1010, b: 0b0110 });
expectWord('transparent A', A_Q, 0b1010);
expectWord('transparent B', B_Q, 0b0110);

// 2. Latch A (STROBE A LOW) then change A's data — A HOLDS, B still transparent.
apply({ ...base, a: 0b0101, b: 0b1001, strA: 0 });
expectWord('A held (strobe low)', A_Q, 0b1010);   // unchanged from step 1
expectWord('B transparent', B_Q, 0b1001);          // tracks new B data

// 3. Re-open STROBE A → A picks up the new data 0b0101 (=5).
apply({ ...base, a: 0b0101, b: 0b1001, strA: 1 });
expectWord('A transparent again', A_Q, 0b0101);

// 4. RESET A (active HIGH) forces A LOW regardless of STROBE/data; B untouched.
apply({ ...base, a: 0b1111, b: 0b1001, rstA: 1 });
expectWord('A reset', A_Q, 0b0000);
expectWord('B unaffected by A reset', B_Q, 0b1001);

// 5. RESET cleared, strobe still HIGH → A is transparent again (0b1111).
apply({ ...base, a: 0b1111, b: 0b1001 });
expectWord('A after reset released', A_Q, 0b1111);

// 6. OUTPUT DISABLE A (active HIGH) → A outputs float; B still driven.
apply({ ...base, a: 0b1111, b: 0b1001, odA: 1 });
expectHiZ('A disabled', A_Q);
expectWord('B still driven', B_Q, 0b1001);

// 7. OUTPUT DISABLE dominates RESET: OD=1 AND RESET=1 → still Hi-Z (not driven LOW).
apply({ ...base, a: 0b1111, b: 0b0000, odA: 1, rstA: 1 });
expectHiZ('A disabled (OD over RESET)', A_Q);

// 8. Disable B too → both float independently.
apply({ ...base, a: 0b1111, b: 0b1111, odA: 1, odB: 1 });
expectHiZ('A disabled', A_Q);
expectHiZ('B disabled', B_Q);

console.log(`cd4508-dual-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
