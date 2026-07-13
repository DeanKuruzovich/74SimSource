// ── 74x96 (SN7496) 5-bit shift register — regression ────────────────────────
// Guards the facts that were WRONG in the fast-batch entry (issues.md, 74x96):
//   1. Terminal assignment. The batch entry invented a standard VCC=16/GND=8
//      pinout; the real SN7496 has VCC on pin 5 and GND on pin 12, with CLK=1,
//      A=2, B=3, C=4, D=6, E=7, PE=8, SER=9, QE=10, QD=11, QC=13, QB=14,
//      QA=15, CLR=16 (TI SDLS946, TOP VIEW). If the pinout regresses, wiring
//      VCC/GND by name below lands on the wrong holes and the register stops
//      behaving.
//   2. Behaviour. The batch entry modelled a SYNCHRONOUS parallel load on the
//      clock edge. The real preset is ASYNCHRONOUS and SET-ONLY: PE HIGH sets
//      stages whose A..E input is HIGH, never clears, and ignores the clock.
//      Tests 3–5 below fail against the old synchronous-load model.
//
// Method (mirrors cd4018-divide-by-n.mjs): place ONE 74x96 and keep the same
// chip + sim instance for the whole run so register state persists. Each input
// pin is wired to the VCC row (1) or GND row (0) before a solve. A clock pulse
// is a LOW→HIGH→LOW on CLK; the shift happens on the rising edge.
//
// Run:  node js/debug/scenarios/74x96-shift-preset.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x96');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const PRESETS = ['A', 'B', 'C', 'D', 'E'];
let preset = { A: 0, B: 0, C: 0, D: 0, E: 0 };

function apply({ clk = 0, clr = 1, pe = 0, ser = 0, a = null } = {}) {
  if (a) preset = { ...preset, ...a };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x96 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('CLR', clr ? 1 : 0);   // active-LOW: clr=1 means "not clearing"
  wirePin('PE',  pe  ? 1 : 0);
  wirePin('SER', ser ? 1 : 0);
  for (const name of PRESETS) wirePin(name, preset[name] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);
const q = () => `QA=${bit('QA')} QB=${bit('QB')} QC=${bit('QC')} QD=${bit('QD')} QE=${bit('QE')}`;
const word = () => [bit('QA'), bit('QB'), bit('QC'), bit('QD'), bit('QE')].join('');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One clock pulse (rising edge shifts) with the given SERIAL bit.
function clock(ser = 0) {
  apply({ clk: 1, ser });
  apply({ clk: 0, ser });
}

// ── 0. Non-standard terminal assignment matches the datasheet (TI SDLS946) ───
const pinOf = (name) => chip.getPinByName(name)?.pin;
const EXPECTED_PINS = {
  CLK: 1, A: 2, B: 3, C: 4, VCC: 5, D: 6, E: 7, PE: 8, SER: 9,
  QE: 10, QD: 11, GND: 12, QC: 13, QB: 14, QA: 15, CLR: 16,
};
for (const [name, num] of Object.entries(EXPECTED_PINS)) {
  assert(pinOf(name) === num, `pinout: ${name} should be pin ${num}, got ${pinOf(name)}`);
}

// ── 1. Async clear forces all outputs LOW (no clock edge) ────────────────────
apply({ clr: 0 });
assert(isLow(read('QA')) && isLow(read('QB')) && isLow(read('QC')) &&
       isLow(read('QD')) && isLow(read('QE')),
  `clear: all outputs should be LOW, got ${q()}`);

// ── 2. Serial shift: a single 1 ripples QA→QB→…→QE ───────────────────────────
apply({ clr: 1 });               // release clear
clock(1);                        // QA<-1
assert(bit('QA') === 1 && bit('QB') === 0, `shift1: expected QA=1,QB=0, got ${q()}`);
clock(0);                        // QA<-0, QB<-1
assert(bit('QA') === 0 && bit('QB') === 1 && bit('QC') === 0, `shift2: expected QB=1, got ${q()}`);
clock(0); clock(0); clock(0);    // ripple the 1 out to QE
assert(bit('QE') === 1 && bit('QA') === 0 && bit('QB') === 0 && bit('QC') === 0 && bit('QD') === 0,
  `shift5: the single 1 should reach QE and clear behind it, got ${q()}`);

// ── 3. Async, SET-ONLY preset (no clock edge) ────────────────────────────────
// Clear first, then preset the word 1,0,1,1,0 with PE HIGH and CLK LOW.
apply({ clr: 0 });                                   // zero everything
apply({ clr: 1, clk: 0, pe: 1, a: { A: 1, B: 0, C: 1, D: 1, E: 0 } });
assert(word() === '10110', `preset load: expected 10110 with no clock, got ${q()}`);

// A LOW preset input must NOT clear a stage that is already HIGH (set-only).
// Stage A is currently HIGH; drive A LOW with PE still HIGH — A must hold HIGH.
apply({ clr: 1, clk: 0, pe: 1, a: { A: 0 } });
assert(bit('QA') === 1, `set-only: A LOW must not clear an already-HIGH stage, got ${q()}`);

// Raising a preset input from LOW to HIGH while PE stays HIGH sets that stage.
apply({ clr: 1, clk: 0, pe: 1, a: { E: 1 } });
assert(bit('QE') === 1, `set-only: E raised HIGH should set stage E, got ${q()}`);

// ── 4. Preset ignores the clock; the register holds after PE drops ───────────
// Load 0,1,0,0,1 (clear then preset), drop PE, and confirm the word is held.
apply({ clr: 0 });
apply({ clr: 1, clk: 0, pe: 1, a: { A: 0, B: 1, C: 0, D: 0, E: 1 } });
assert(word() === '01001', `preset word: expected 01001, got ${q()}`);
apply({ clr: 1, clk: 0, pe: 0, a: { A: 0, B: 0, C: 0, D: 0, E: 0 } });  // drop PE + inputs
assert(word() === '01001', `hold after PE low: expected 01001 held, got ${q()}`);

// ── 5. The set-only preset cannot write a 0 over a 1 without a clear ──────────
// Register holds 01001. Preset the word 0,0,0,0,0 with PE HIGH: nothing changes,
// because a preset can only set 1s. (A synchronous full-load model would wrongly
// zero the register here.)
apply({ clr: 1, clk: 0, pe: 1, a: { A: 0, B: 0, C: 0, D: 0, E: 0 } });
assert(word() === '01001', `zero preset is a no-op: expected 01001 unchanged, got ${q()}`);

console.log(`74x96-shift-preset: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
