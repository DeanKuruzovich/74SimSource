// ── CD4029 presettable up/down binary/BCD counter regression ─────────────────
// The CD4029 (Batch 6, js/chips/chips85.js) is the behavioral coverage of the
// COUNTER_UPDOWN_4029 primitive. It guards the chip's DB entry and the engine
// evaluator: the JAM/Q pin map, the ASYNCHRONOUS active-HIGH PRESET ENABLE
// jam-load, the POSITIVE-edge clock, the active-LOW CARRY IN clock-enable, the
// UP/DOWN polarity (HIGH=up), the BINARY/DECADE mode select, and the active-LOW
// CARRY OUT terminal-count line.
//
// Method: place ONE CD4029 and keep the same chip + sim instance across the run
// so the counter's sequential state persists. A clock "pulse" is a low→high→low
// on CLOCK; the count advances on the rising edge. Inputs are re-wired to the
// VCC/GND rails each solve; outputs are read straight off the pins by name.
//
// Pin map (verified vs TI SCHS034C): JAM J1-J4 → Q1-Q4 (J1/Q1 = LSB). UP/DOWN
// HIGH=up, BINARY/DECADE HIGH=binary(0-15)/LOW=decade(0-9). PRESET ENABLE HIGH =
// async jam. CARRY IN LOW = count enabled. CARRY OUT active LOW at terminal count.
//
// Run:  node js/debug/scenarios/cd4029-updown-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4029');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive all CD4029 inputs to rail levels and solve. Bits: clk, ce (CARRY IN),
// ud (UP/DOWN), pe (PRESET ENABLE), bd (BINARY/DECADE), j1..j4 (JAM inputs).
function apply({ clk, ce, ud, pe, bd, j1 = 0, j2 = 0, j3 = 0, j4 = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4029 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', clk);
  wirePin('CARRY IN', ce);
  wirePin('UP/DOWN', ud);
  wirePin('PRESET ENABLE', pe);
  wirePin('BINARY/DECADE', bd);
  wirePin('J1', j1); wirePin('J2', j2); wirePin('J3', j3); wirePin('J4', j4);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const count = () =>
  (isHigh(read('Q1')) ? 1 : 0) | (isHigh(read('Q2')) ? 2 : 0) |
  (isHigh(read('Q3')) ? 4 : 0) | (isHigh(read('Q4')) ? 8 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// A clock pulse: rising edge advances, then return CLOCK low. `cfg` holds the
// steady control-pin state (ce/ud/pe/bd + any jam bits) for the pulse.
function pulse(cfg, n = 1) {
  for (let i = 0; i < n; i++) {
    apply({ ...cfg, clk: 1 }); // rising edge → advance
    apply({ ...cfg, clk: 0 }); // back low
  }
}

// ── 1. Asynchronous jam-load (PRESET ENABLE HIGH, no clock) ───────────────────
// J = 0b0101 = 5. With PE HIGH the count must equal 5 immediately, clock idle.
apply({ clk: 0, ce: 0, ud: 1, pe: 1, bd: 1, j1: 1, j2: 0, j3: 1, j4: 0 });
assert(count() === 5, `async jam: expected count 5, got ${count()}`);

// Jam to 0 to confirm a LOW jam line resets that bit (datasheet: all-LOW jam = 0).
apply({ clk: 0, ce: 0, ud: 1, pe: 1, bd: 1, j1: 0, j2: 0, j3: 0, j4: 0 });
assert(count() === 0, `async jam zero: expected count 0, got ${count()}`);

// ── 2. Count up in BINARY mode ────────────────────────────────────────────────
// Preset to 13, release PE, then count up: 13→14→15(terminal)→0(wrap).
apply({ clk: 0, ce: 0, ud: 1, pe: 1, bd: 1, j1: 1, j2: 0, j3: 1, j4: 1 });
assert(count() === 13, `preset 13: got ${count()}`);
const upBin = { ce: 0, ud: 1, pe: 0, bd: 1 };
pulse(upBin); assert(count() === 14, `up bin +1: expected 14, got ${count()}`);
pulse(upBin); assert(count() === 15, `up bin +2: expected 15, got ${count()}`);
// At terminal count (15) counting up with CARRY IN LOW → CARRY OUT LOW.
assert(isLow(read('CARRY OUT')), `up bin terminal: CARRY OUT should be LOW at 15`);
pulse(upBin); assert(count() === 0, `up bin wrap: expected 0, got ${count()}`);
assert(isHigh(read('CARRY OUT')), `up bin off-terminal: CARRY OUT should be HIGH at 0 (up)`);

// ── 3. CARRY IN HIGH inhibits counting ────────────────────────────────────────
// count is 0; with CE=1 a clock edge must not advance.
pulse({ ce: 1, ud: 1, pe: 0, bd: 1 });
assert(count() === 0, `carry-in inhibit: count should stay 0, got ${count()}`);
// And CARRY OUT must be HIGH (terminal detect is gated by CARRY IN LOW). At 0 up
// it isn't terminal anyway; jam to 15 and check CO stays HIGH while CE=1.
apply({ clk: 0, ce: 1, ud: 1, pe: 1, bd: 1, j1: 1, j2: 1, j3: 1, j4: 1 });
assert(count() === 15, `preset 15 (CE high): got ${count()}`);
assert(isHigh(read('CARRY OUT')), `CARRY OUT must stay HIGH at terminal while CARRY IN HIGH`);

// ── 4. Count down in BINARY mode ──────────────────────────────────────────────
// Preset to 2, count down: 2→1→0(terminal)→15(wrap).
apply({ clk: 0, ce: 0, ud: 0, pe: 1, bd: 1, j1: 0, j2: 1, j3: 0, j4: 0 });
assert(count() === 2, `preset 2: got ${count()}`);
const downBin = { ce: 0, ud: 0, pe: 0, bd: 1 };
pulse(downBin); assert(count() === 1, `down bin -1: expected 1, got ${count()}`);
pulse(downBin); assert(count() === 0, `down bin -2: expected 0, got ${count()}`);
assert(isLow(read('CARRY OUT')), `down terminal: CARRY OUT should be LOW at 0 (down)`);
pulse(downBin); assert(count() === 15, `down bin wrap: expected 15, got ${count()}`);

// ── 5. Rising-edge only (a falling edge must not advance) ─────────────────────
// Preset to 4, then drive CLOCK high (advance to 5), then high→low must NOT add.
apply({ clk: 0, ce: 0, ud: 1, pe: 1, bd: 1, j1: 0, j2: 0, j3: 1, j4: 0 });
assert(count() === 4, `preset 4: got ${count()}`);
apply({ clk: 1, ce: 0, ud: 1, pe: 0, bd: 1 }); // rising edge → 5
assert(count() === 5, `rising edge: expected 5, got ${count()}`);
apply({ clk: 0, ce: 0, ud: 1, pe: 0, bd: 1 }); // falling edge → no change
assert(count() === 5, `falling edge: should stay 5, got ${count()}`);

// ── 6. DECADE mode wrap and terminal carry ────────────────────────────────────
// Preset to 8, count up decade: 8→9(terminal)→0(wrap, not 10).
apply({ clk: 0, ce: 0, ud: 1, pe: 1, bd: 0, j1: 0, j2: 0, j3: 0, j4: 1 });
assert(count() === 8, `decade preset 8: got ${count()}`);
const upDec = { ce: 0, ud: 1, pe: 0, bd: 0 };
pulse(upDec); assert(count() === 9, `up decade +1: expected 9, got ${count()}`);
assert(isLow(read('CARRY OUT')), `up decade terminal: CARRY OUT should be LOW at 9`);
pulse(upDec); assert(count() === 0, `up decade wrap: expected 0 (not 10), got ${count()}`);
// Count down decade from 0 wraps to 9.
const downDec = { ce: 0, ud: 0, pe: 0, bd: 0 };
pulse(downDec); assert(count() === 9, `down decade wrap: expected 9, got ${count()}`);

console.log(`cd4029-updown-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
