// ── 74x164 8-bit SIPO shift register — regression ───────────────────────────
// Guards the four behaviors that define the 74x164 (chips5.js, SHIFT_REG_SIPO):
//   1. Serial input is A AND B — a LOW on EITHER serial pin shifts in a 0.
//   2. Rising-edge shift toward QH: a new bit enters QA and every stage copies
//      its neighbor (QB←old QA, QC←old QB, … QH←old QG).
//   3. Asynchronous active-LOW clear: CLR=0 zeroes QA..QH with NO clock edge.
//   4. Cascade order: the first bit clocked in reaches QH after exactly 8 clocks
//      (QH is the serial-out pin used to chain 164s into wider registers).
//
// Pinout verified against TI SN74LS164 (March 1974, rev. March 1988): terminal
// diagram (D/N package) + FUNCTION TABLE read as PDF page images (C4). Method
// mirrors cd4006-shift.mjs: one chip + one sim instance reused for the whole run
// so sequential state persists across clocks.
//
// Run:  node js/debug/scenarios/74x164-sipo-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x164');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Held input state, re-applied every solve (row 1 = +rail HIGH, row 0 = GND LOW).
let st = { clk: 0, clr: 1, a: 0, b: 0 };

function apply(next = {}) {
  st = { ...st, ...next };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x164 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk ? 1 : 0);
  wirePin('CLR', st.clr ? 1 : 0);
  wirePin('A', st.a ? 1 : 0);
  wirePin('B', st.b ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const bit  = (name) => (isHigh(sim.getVoltageAtHole(chip.getPinByName(name).holeId)) ? 1 : 0);
const outs = () => ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH'].map(bit).join('');

// One clock: rising edge (0→1) shifts; falling edge (1→0) does nothing.
function clock() { apply({ clk: 1 }); apply({ clk: 0 }); }

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Settle: CLR high (run mode), clock low, no serial data.
apply({ clk: 0, clr: 1, a: 0, b: 0 });

// ── 1. Shift in a 1: A=B=1 → new QA=1 on the rising edge ──────────────────────
apply({ a: 1, b: 1 });
clock();
assert(outs() === '10000000', `shift-in 1: expected 10000000, got ${outs()}`);

// ── 2. Shift toward QH: a second 1 pushes the first to QB ─────────────────────
clock();
assert(outs() === '11000000', `second 1: expected 11000000, got ${outs()}`);

// ── 3. A LOW forces a 0 in (A AND B), older bits shift one place right ─────────
apply({ a: 0, b: 1 });
clock();
assert(outs() === '01100000', `shift-in 0 (A low): expected 01100000, got ${outs()}`);

// ── 4. B LOW ALSO forces a 0 — proves the input is A AND B, not A alone ────────
apply({ a: 1, b: 0 });
clock();
assert(outs() === '00110000', `shift-in 0 (B low): expected 00110000, got ${outs()}`);

// ── 5. Asynchronous clear: CLR=0 with NO clock edge zeroes everything ─────────
apply({ clr: 0 });
assert(outs() === '00000000', `async clear: expected all 0, got ${outs()}`);
apply({ clr: 1 });

// ── 6. Cascade order: first bit in walks to QH after exactly 8 clocks ─────────
apply({ a: 1, b: 1 }); clock();      // marker 1 enters QA
apply({ a: 0, b: 0 });               // feed 0s behind it
assert(bit('QA') === 1, `cascade: marker should start at QA, got ${outs()}`);
for (let i = 0; i < 6; i++) clock();  // 6 more shifts → marker at QG (7 total)
assert(bit('QG') === 1 && bit('QH') === 0,
  `cascade: after 7 clocks marker should sit at QG, got ${outs()}`);
clock();                              // 8th shift → marker reaches QH
assert(bit('QH') === 1, `cascade: after 8 clocks marker should reach QH, got ${outs()}`);

console.log(`74x164-sipo-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
