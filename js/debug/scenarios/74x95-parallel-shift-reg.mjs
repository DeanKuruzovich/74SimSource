// ── 74x95 (SN74x95) 4-bit parallel-access shift register — regression ────────
// Guards the fact the fast-batch entry got WRONG (issues.md C112): the SN74x95
// clocks on the FALLING edge (HIGH→LOW) of CLK1/CLK2, not the rising edge. Both
// the TI SDLS128 and Motorola SN54/74LS95B datasheets say the transfer happens
// "after the high-to-low transition" and label CLK1/CLK2 as the "active LOW-going
// edge" clocks. The shared SHIFT_REG_4BIT primitive defaulted to rising; the
// 74x95 gate now sets edge:'falling'. Test 1 fails against the old rising model.
//
// Also verifies the terminal assignment (SER=1, A=2, B=3, C=4, D=5, MODE=6,
// GND=7, CLK2=8, CLK1=9, QD=10, QC=11, QB=12, QA=13, VCC=14), the shift
// direction (SER→QA→QB→QC→QD), parallel load (A..D→QA..QD), that MODE selects
// which clock is live, and that there is no reset (clear = load zeros).
//
// Method (mirrors 74x96-shift-preset.mjs): place ONE 74x95 and keep the same
// chip + sim instance so register state persists across solves. A shift/load is
// a HIGH then LOW on the chosen clock; the transfer latches on the HIGH→LOW step.
//
// Run:  node js/debug/scenarios/74x95-parallel-shift-reg.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x95');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Persisted input state; each apply() overrides only the fields you pass.
let st = { mode: 0, clk1: 0, clk2: 0, ser: 0, A: 0, B: 0, C: 0, D: 0 };

function apply(patch = {}) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x95 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('MODE', st.mode ? 1 : 0);
  wirePin('CLK1', st.clk1 ? 1 : 0);
  wirePin('CLK2', st.clk2 ? 1 : 0);
  wirePin('SER', st.ser ? 1 : 0);
  wirePin('A', st.A ? 1 : 0);
  wirePin('B', st.B ? 1 : 0);
  wirePin('C', st.C ? 1 : 0);
  wirePin('D', st.D ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit = (name) => (isHigh(read(name)) ? 1 : 0);
const q = () => `QA=${bit('QA')} QB=${bit('QB')} QC=${bit('QC')} QD=${bit('QD')}`;
const word = () => [bit('QA'), bit('QB'), bit('QC'), bit('QD')].join('');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Shift pulse: CLK1 HIGH then LOW; latches on the HIGH→LOW step.
function shiftClock(ser) { apply({ mode: 0, ser, clk1: 1 }); apply({ mode: 0, ser, clk1: 0 }); }
// Load pulse: CLK2 HIGH then LOW; latches on the HIGH→LOW step.
function loadClock(a) { apply({ mode: 1, ...a, clk2: 1 }); apply({ mode: 1, ...a, clk2: 0 }); }

// ── 0. Terminal assignment matches the datasheet (TI SDLS128) ────────────────
const pinOf = (name) => chip.getPinByName(name)?.pin;
const EXPECTED_PINS = {
  SER: 1, A: 2, B: 3, C: 4, D: 5, MODE: 6, GND: 7,
  CLK2: 8, CLK1: 9, QD: 10, QC: 11, QB: 12, QA: 13, VCC: 14,
};
for (const [name, num] of Object.entries(EXPECTED_PINS)) {
  assert(pinOf(name) === num, `pinout: ${name} should be pin ${num}, got ${pinOf(name)}`);
}

// ── 1. Edge polarity: the RISING CLK1 edge must do nothing; the FALLING edge
//        shifts. This is the exact bug the fast-batch entry had. ──────────────
apply({ mode: 0, ser: 1, clk1: 0 });        // shift mode, SER=1, clock low
apply({ mode: 0, ser: 1, clk1: 1 });        // RISING edge — must NOT shift
assert(bit('QA') === 0, `rising CLK1 must not shift on a falling-edge part, got ${q()}`);
apply({ mode: 0, ser: 1, clk1: 0 });        // FALLING edge — QA<-1
assert(bit('QA') === 1, `falling CLK1 should load SER into QA, got ${q()}`);

// ── 2. Serial shift right: SER→QA→QB→QC→QD ───────────────────────────────────
// QA is 1 now; push in zeros and watch the single 1 ripple out to QD.
shiftClock(0);                               // SER=0→QA, old QA(1)→QB
assert(word() === '0100', `shift: the 1 should move to QB, got ${q()}`);
shiftClock(0); shiftClock(0);                // ripple on to QD
assert(word() === '0001', `shift: the 1 should reach QD, got ${q()}`);
shiftClock(0);                               // 1 falls off the end
assert(word() === '0000', `shift: register should empty, got ${q()}`);

// ── 3. Parallel load on CLK2 falling edge (MODE HIGH); rising must do nothing ─
apply({ mode: 1, A: 1, B: 0, C: 1, D: 1, clk2: 0 });
apply({ mode: 1, A: 1, B: 0, C: 1, D: 1, clk2: 1 });   // RISING — no load
assert(word() === '0000', `rising CLK2 must not load, got ${q()}`);
apply({ mode: 1, A: 1, B: 0, C: 1, D: 1, clk2: 0 });   // FALLING — load 1011
assert(word() === '1011', `falling CLK2 should load A..D into QA..QD, got ${q()}`);

// ── 4. MODE selects which clock is live ──────────────────────────────────────
// In shift mode (MODE LOW), pulsing CLK2 (the load clock) must NOT load.
apply({ mode: 0, clk2: 0 });
apply({ mode: 0, A: 0, B: 0, C: 0, D: 0, clk2: 1 });
apply({ mode: 0, A: 0, B: 0, C: 0, D: 0, clk2: 0 });
assert(word() === '1011', `CLK2 must be ignored in shift mode, got ${q()}`);
// In load mode (MODE HIGH), pulsing CLK1 (the shift clock) must NOT shift.
apply({ mode: 1, ser: 1, clk1: 0 });
apply({ mode: 1, ser: 1, clk1: 1 });
apply({ mode: 1, ser: 1, clk1: 0 });
assert(word() === '1011', `CLK1 must be ignored in load mode, got ${q()}`);

// ── 5. No reset pin: clearing is a zero-load ─────────────────────────────────
loadClock({ A: 0, B: 0, C: 0, D: 0 });
assert(word() === '0000', `a zero-load should clear the register, got ${q()}`);

console.log(`74x95-parallel-shift-reg: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
