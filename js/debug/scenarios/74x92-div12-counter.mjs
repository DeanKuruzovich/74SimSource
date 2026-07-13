// ── 74x92 divide-by-twelve counter regression ───────────────────────────────
// The 74x92 (js/chips/chips4.js) drives the COUNTER_DIV12 primitive. This guards
// the DB entry against the two bugs found and fixed in the July 2026 docs pass:
//
//   1. PINOUT: the outputs on pins 8/9/11 were QC/QB/QD — the '93 output map wrongly
//      cloned onto the '92 (issues.md C2 hazard). The real 'SN7492A pinout (TI
//      SDLS940A, TOP VIEW p.1) is QD=8, QC=9, QB=11, QA=12. A name-keyed sim cannot
//      feel a pin-number swap, so the pin-position asserts below catch it directly.
//   2. COUNT SEQUENCE: _advanceDiv6 counted a straight binary 0–5. The real ÷6
//      section is a ÷3 (QB,QC) followed by a ÷2 (QD): states (QD QC QB) run
//      000,001,010,100,101,110 (TI '92A/'LS92 COUNT SEQUENCE, p.3), which is what
//      makes QD a symmetric ÷12. A 0–5 binary count would produce 011/111 states
//      the real part never shows.
//
// Reset (shared '92/'93 RESET/COUNT FUNCTION TABLE, p.3): R0(1)·R0(2)=H → 0000,
// else count. Negative-edge master-slave stages: the count advances on the
// falling (HIGH→LOW) clock edge.
//
// Run:  node js/debug/scenarios/74x92-div12-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x92');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Physical pin numbers (catches the QC/QB/QD ↔ QD/QC/QB swap) ────────────
const pinOf = (name) => {
  const p = chip.getPinByName(name);
  if (!p) throw new Error(`74x92 has no pin named ${name}`);
  return p.pin;
};
for (const [name, num] of Object.entries({
  CKB: 1, VCC: 5, R01: 6, R02: 7, QD: 8, QC: 9, GND: 10, QB: 11, QA: 12, CKA: 14,
})) {
  assert(pinOf(name) === num, `pinout: ${name} should be pin ${num}, got ${pinOf(name)}`);
}

// Re-solve with each input pin held at a rail level (1 = VCC, 0 = GND).
// `wireQAtoCKB` optionally ties QA (output) to CKB (input) for the full ÷12.
function apply(s, wireQAtoCKB = false) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CKA', s.cka ? 1 : 0);
  wirePin('R01', s.r01 ? 1 : 0);
  wirePin('R02', s.r02 ? 1 : 0);
  if (wireQAtoCKB) {
    wm.addWire(chip.getPinByName('QA').holeId, chip.getPinByName('CKB').holeId);
  } else {
    wirePin('CKB', s.ckb ? 1 : 0);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit = (q) => (isHigh(read(q)) ? 1 : 0);
// Read the four outputs as (QD QC QB QA) — the order the datasheet prints.
const outs = () => `${bit('QD')}${bit('QC')}${bit('QB')}${bit('QA')}`;

const st = { cka: 0, ckb: 0, r01: 0, r02: 0 };
const solve = (wire = false) => apply(st, wire);

// Falling-edge clock: drive line HIGH then LOW; the count acts on the LOW step.
function pulseCKA(n = 1) { for (let i = 0; i < n; i++) { st.cka = 1; solve(); st.cka = 0; solve(); } }
function pulseCKB(n = 1) { for (let i = 0; i < n; i++) { st.ckb = 1; solve(); st.ckb = 0; solve(); } }

// Clear to a known 0000 start.
st.r01 = 1; st.r02 = 1; solve();
assert(outs() === '0000', `reset: both R0 HIGH should clear to 0000, got ${outs()}`);
st.r01 = 0; st.r02 = 0; solve();

// ── 2. ÷2 section: CKA toggles QA on the falling edge only ────────────────────
assert(bit('QA') === 0, `start: QA should be 0, got ${bit('QA')}`);
st.cka = 1; solve();                       // rising edge must NOT toggle
assert(bit('QA') === 0, `QA must not toggle on the rising edge, got ${bit('QA')}`);
st.cka = 0; solve();                       // falling edge toggles 0→1
assert(bit('QA') === 1, `QA should toggle to 1 on the falling edge, got ${bit('QA')}`);
pulseCKA(1);
assert(bit('QA') === 0, `QA should toggle back to 0 after another pulse, got ${bit('QA')}`);

// ── 3. ÷6 section: CKB alone steps (QD QC QB) 000,001,010,100,101,110 ─────────
// (QA is left at 0 by the two pulses above; we only read QD/QC/QB here.)
const div6 = () => `${bit('QD')}${bit('QC')}${bit('QB')}`;
const seq6 = ['001', '010', '100', '101', '110', '000'];
assert(div6() === '000', `÷6 start should be 000, got ${div6()}`);
for (let i = 0; i < seq6.length; i++) {
  pulseCKB(1);
  assert(div6() === seq6[i], `÷6 pulse ${i + 1}: (QD QC QB) should be ${seq6[i]}, got ${div6()}`);
}

// ── 4. Full ÷12: wire QA→CKB, clock CKA, read (QD QC QB QA) over 12 counts ─────
st.r01 = 1; st.r02 = 1; solve(true);       // clear with the wire in place
assert(outs() === '0000', `÷12 reset should give 0000, got ${outs()}`);
st.r01 = 0; st.r02 = 0; solve(true);
const seq12 = [
  '0001', '0010', '0011', '0100', '0101', '1000',
  '1001', '1010', '1011', '1100', '1101', '0000',
];
for (let i = 0; i < seq12.length; i++) {
  st.cka = 1; solve(true); st.cka = 0; solve(true);   // one falling-edge pulse
  assert(outs() === seq12[i], `÷12 count ${i + 1}: (QD QC QB QA) should be ${seq12[i]}, got ${outs()}`);
}

// ── 5. Reset dominates the clock (asynchronous) ──────────────────────────────
pulseCKA(3);                               // land on some nonzero count
st.r01 = 1; st.r02 = 1; solve();
assert(outs() === '0000', `async reset should force 0000 regardless of clock, got ${outs()}`);
st.r01 = 1; st.r02 = 0; solve();           // only one R0 HIGH → still counts (no clear guarantee)
assert(!(st.r01 && st.r02), 'sanity: reset needs BOTH R0 HIGH');

console.log(`74x92-div12-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
