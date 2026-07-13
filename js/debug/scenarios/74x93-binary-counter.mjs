// ── 74x93 (7493) 4 bit binary ripple counter regression ─────────────────────
// The 74x93 (js/chips/chips4.js) is the behavioral coverage of the COUNTER_4BIT
// primitive. It guards the chip's DB entry: the non-standard power pins (VCC=5,
// GND=10), the split ÷2 (CKA→QA) and ÷8 (CKB→QB/QC/QD) sections, falling-edge
// triggering, the async reset-to-0 (R0(1)·R0(2)), and the full 0→15 binary count
// obtained by wiring QA→CKB.
//
// Datasheet: TI SN5493A/SN74LS93, SDLS940A (Mar. 1974, rev. Mar. 1988). Verified
// from 300-dpi PDF page images: package pinout p.1, IEC logic symbol p.2
// (CKA→DIV2→QA, CKB→DIV8→QB/QC/QD, R0(1)·R0(2)→CT=0), '93A/'LS93 count sequence
// 0→15 + '92/'93 reset/count function table p.3, and the p.4 logic diagram showing
// negative-edge master-slave JK stages. Unlike the sibling 7490, the 7493 has NO
// set-to-nine (R9) inputs — reset is the only override, and it only forces 0.
//
// Method: place ONE 74x93 and keep the same chip + sim across the run so the
// counter state (comp.ffState) persists. All control inputs and both clocks are
// driven on every solve. The counter triggers on the HIGH→LOW clock edge, so one
// "pulse" = clock HIGH then clock LOW.
//
// Run:  node js/debug/scenarios/74x93-binary-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x93');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC row, 0 =
// GND row). A fresh WireManager each call is fine — the counter state lives on
// the (persistent) chip component, not the wires.
function apply({ cka, ckb, r01, r02 }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x93 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CKA', cka ? 1 : 0);
  wirePin('CKB', ckb ? 1 : 0);
  wirePin('R01', r01 ? 1 : 0);
  wirePin('R02', r02 ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);
// Full 4 bit value, weight QD=8 QC=4 QB=2 QA=1.
const val  = () => bit('QA') | (bit('QB') << 1) | (bit('QC') << 2) | (bit('QD') << 3);
// ÷8 section value on its own (QB=1 QC=2 QD=4).
const div8 = () => bit('QB') | (bit('QC') << 1) | (bit('QD') << 2);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Current input state — mutated by helpers so each apply() carries all pins.
const st = { cka: 0, ckb: 0, r01: 0, r02: 0 };
const solve = () => apply(st);

function pulseCKA(n = 1) {         // ÷2 section advances on CKA HIGH→LOW
  for (let i = 0; i < n; i++) { st.cka = 1; solve(); st.cka = 0; solve(); }
}
function pulseCKB(n = 1) {         // ÷8 section advances on CKB HIGH→LOW
  for (let i = 0; i < n; i++) { st.ckb = 1; solve(); st.ckb = 0; solve(); }
}

// ── 0. Power up, then async reset to 0 via R0(1)·R0(2) ───────────────────────
st.r01 = 1; st.r02 = 1; solve();
assert(val() === 0, `reset: expected 0000, got ${val()}`);
st.r01 = 0; st.r02 = 0; solve();

// ── 1. ÷2 section: CKA toggles QA on each falling edge ───────────────────────
pulseCKA(1);
assert(bit('QA') === 1, `÷2: after 1 CKA pulse QA should be 1, got ${bit('QA')}`);
pulseCKA(1);
assert(bit('QA') === 0, `÷2: after 2 CKA pulses QA should be 0, got ${bit('QA')}`);
assert(div8() === 0, `÷2 must not disturb the ÷8 section, got ${div8()}`);

// ── 2. Reset ignores the clock: only R0(1)·R0(2) HIGH forces 0 ───────────────
pulseCKA(1);                       // QA = 1
assert(bit('QA') === 1, `setup for reset test: QA should be 1, got ${bit('QA')}`);
st.r01 = 1; st.r02 = 0; solve();   // one reset pin HIGH alone must NOT reset
assert(bit('QA') === 1, `single reset pin must not clear (R0(1) only), got ${bit('QA')}`);
st.r01 = 0; st.r02 = 1; solve();
assert(bit('QA') === 1, `single reset pin must not clear (R0(2) only), got ${bit('QA')}`);
st.r01 = 1; st.r02 = 1; solve();   // both HIGH → async clear
assert(val() === 0, `both reset pins HIGH must clear to 0000, got ${val()}`);
st.r01 = 0; st.r02 = 0; solve();

// ── 3. ÷8 section: CKB walks QB/QC/QD through 0→1→…→7→0 ───────────────────────
const div8Seq = [1, 2, 3, 4, 5, 6, 7, 0];
for (let i = 0; i < div8Seq.length; i++) {
  pulseCKB(1);
  assert(div8() === div8Seq[i],
    `÷8: after ${i + 1} CKB pulses value should be ${div8Seq[i]}, got ${div8()}`);
}
assert(bit('QA') === 0, `÷8 must not disturb QA, got ${bit('QA')}`);

// ── 4. Full 0→15 binary count, wired as QA→CKB (the datasheet's 4 bit mode) ───
// Emulate the QA→CKB ripple: clock CKA; whenever QA falls 1→0, that IS the CKB
// falling edge, so pulse CKB once. Reset first so we start clean at 0.
st.r01 = 1; st.r02 = 1; solve(); st.r01 = 0; st.r02 = 0; solve();
const seq = [];
for (let step = 0; step < 16; step++) {
  const qaBefore = bit('QA');
  pulseCKA(1);                       // toggle QA
  if (qaBefore === 1 && bit('QA') === 0) pulseCKB(1); // QA fell → advance ÷8
  seq.push(val());
}
// Values AFTER each of the 16 clocks, starting from 0: 1,2,…,15,0 (wrap).
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
assert(JSON.stringify(seq) === JSON.stringify(expected),
  `binary count wrong: expected ${expected.join(',')} got ${seq.join(',')}`);

console.log(`74x93-binary-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
