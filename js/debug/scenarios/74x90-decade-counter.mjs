// ── 74x90 (7490) decade counter regression ───────────────────────────────────
// The 74x90 (js/chips/chips4.js) is the behavioral coverage of the COUNTER_DECADE
// primitive. It guards the chip's DB entry: the non-standard power pins (VCC=5,
// GND=10), the split ÷2 (CKA→QA) and ÷5 (CKB→QB/QC/QD) sections, falling-edge
// triggering, the async reset-to-0 (R0(1)·R0(2)), the async set-to-9
// (R9(1)·R9(2)), and — critically — the set-to-9-over-reset PRIORITY.
//
// Datasheet: TI SN7490A/SN74LS90, RESET/COUNT FUNCTION TABLE. Set-to-nine wins
// when both the reset pair and the set-to-nine pair are asserted (R0 is "don't
// care" in the set-9 row). The pre-fix engine checked R0 first and wrongly output
// 0; step 5 below is the regression that catches that.
//
// Method: place ONE 74x90 and keep the same chip + sim across the run so the
// counter state (comp.ffState) persists. All four control inputs and both clocks
// are driven on every solve. The counter triggers on the HIGH→LOW clock edge, so
// one "pulse" = clock HIGH then clock LOW.
//
// Run:  node js/debug/scenarios/74x90-decade-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x90');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC row, 0 =
// GND row). A fresh WireManager each call is fine — the counter state lives on
// the (persistent) chip component, not the wires.
function apply({ cka, ckb, r01, r02, r91, r92 }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x90 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CKA', cka ? 1 : 0);
  wirePin('CKB', ckb ? 1 : 0);
  wirePin('R01', r01 ? 1 : 0);
  wirePin('R02', r02 ? 1 : 0);
  wirePin('R91', r91 ? 1 : 0);
  wirePin('R92', r92 ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);
// Full BCD value, weight QD=8 QC=4 QB=2 QA=1.
const bcd  = () => bit('QA') | (bit('QB') << 1) | (bit('QC') << 2) | (bit('QD') << 3);
// ÷5 section value on its own (QB=1 QC=2 QD=4).
const div5 = () => bit('QB') | (bit('QC') << 1) | (bit('QD') << 2);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Current input state — mutated by helpers so each apply() carries all pins.
const st = { cka: 0, ckb: 0, r01: 0, r02: 0, r91: 0, r92: 0 };
const solve = () => apply(st);

function pulseCKA(n = 1) {         // ÷2 section advances on CKA HIGH→LOW
  for (let i = 0; i < n; i++) { st.cka = 1; solve(); st.cka = 0; solve(); }
}
function pulseCKB(n = 1) {         // ÷5 section advances on CKB HIGH→LOW
  for (let i = 0; i < n; i++) { st.ckb = 1; solve(); st.ckb = 0; solve(); }
}

// ── 0. Power up, then async reset to 0 via R0(1)·R0(2) ───────────────────────
st.r01 = 1; st.r02 = 1; solve();
assert(bcd() === 0, `reset: expected 0000, got ${bcd()}`);
st.r01 = 0; st.r02 = 0; solve();

// ── 1. ÷2 section: CKA toggles QA on each falling edge ───────────────────────
pulseCKA(1);
assert(bit('QA') === 1, `÷2: after 1 CKA pulse QA should be 1, got ${bit('QA')}`);
pulseCKA(1);
assert(bit('QA') === 0, `÷2: after 2 CKA pulses QA should be 0, got ${bit('QA')}`);
assert(div5() === 0, `÷2 must not disturb the ÷5 section, got ${div5()}`);

// ── 2. ÷5 section: CKB walks QB/QC/QD through 0→1→2→3→4→0 ─────────────────────
const div5Seq = [1, 2, 3, 4, 0];
for (let i = 0; i < div5Seq.length; i++) {
  pulseCKB(1);
  assert(div5() === div5Seq[i],
    `÷5: after ${i + 1} CKB pulses value should be ${div5Seq[i]}, got ${div5()}`);
}
assert(bit('QA') === 0, `÷5 must not disturb QA, got ${bit('QA')}`);

// ── 3. Full BCD decade 0→9→0, wired as the datasheet's BCD mode (QA→CKB) ──────
// Emulate the QA→CKB ripple: clock CKA; whenever QA falls 1→0, that IS the CKB
// falling edge, so pulse CKB once. Reset first so we start clean at 0.
st.r01 = 1; st.r02 = 1; solve(); st.r01 = 0; st.r02 = 0; solve();
const decade = [];
for (let step = 0; step < 10; step++) {
  const qaBefore = bit('QA');
  pulseCKA(1);                       // toggle QA
  if (qaBefore === 1 && bit('QA') === 0) pulseCKB(1); // QA fell → advance ÷5
  decade.push(bcd());
}
// Sequence of values AFTER each of the 10 clocks, starting from 0:
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
assert(JSON.stringify(decade) === JSON.stringify(expected),
  `BCD decade count wrong: expected ${expected.join(',')} got ${decade.join(',')}`);

// ── 4. Async set-to-9 via R9(1)·R9(2) → 1001 (QD,QA high; QB,QC low) ──────────
st.r91 = 1; st.r92 = 1; solve();
assert(bcd() === 9, `set-9: expected 9 (1001), got ${bcd()}`);
assert(bit('QD') === 1 && bit('QC') === 0 && bit('QB') === 0 && bit('QA') === 1,
  `set-9 weighting wrong: QD QC QB QA = ${bit('QD')}${bit('QC')}${bit('QB')}${bit('QA')}`);
st.r91 = 0; st.r92 = 0; solve();

// ── 5. PRIORITY regression: set-9 beats reset when BOTH pairs are asserted ────
// This is the bug the fix corrected. Datasheet: set-to-nine dominates → 9, not 0.
st.r01 = 1; st.r02 = 1; st.r91 = 1; st.r92 = 1; solve();
assert(bcd() === 9, `PRIORITY: R0 and R9 both HIGH must give 9 (set-9 wins), got ${bcd()}`);
// Drop R9, keep R0 → now reset dominates → 0.
st.r91 = 0; st.r92 = 0; solve();
assert(bcd() === 0, `after R9 released, R0 must reset to 0, got ${bcd()}`);
st.r01 = 0; st.r02 = 0; solve();

console.log(`74x90-decade-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
