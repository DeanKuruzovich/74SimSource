// ── CD4538 dual monostable trigger/reset regression ──────────────────────────
// The CD4538 (Batch 12, js/chips/chips73.js) is the first behavioral coverage of
// the monostable family (shared MONOSTABLE_RC primitive, also used by 74x123).
// It guards the chip's DB entry: the two sections' A/B/CD/Q pin mapping and the
// active-LOW reset. Each case places a fresh chip (fresh latch state, prevA=1,
// prevB=0), wires VDD/VSS and the section's three control inputs to the power
// rails, runs one evaluate(), and reads the driven Q / Q-bar.
//
// With no RC network on the timing pin the pulse never times out, so a valid
// trigger leaves Q latched HIGH — exactly what we want to assert the digital
// trigger/reset logic in isolation:
//   • valid trigger (A low, B high, CD high) → Q HIGH      (datasheet trigger row)
//   • reset asserted (CD low)                → Q LOW        (CD is active LOW)
//   • idle / blocked (A high, B low, CD high)→ Q LOW        (A=H and B=L both block)
// Section 2 is checked too, so a copy-paste slip in the 2A/2B/2CD/2Q names fails.
//
// Run:  node js/debug/scenarios/cd4538-monostable.mjs   (exits non-zero on failure)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)

// Place a CD4538, tie VDD/GND to the rails, drive the named control pins to a
// rail (1 = VCC rail, 0 = GND rail), evaluate once, and read pin voltages.
function evalCase(levels) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('CD4538');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4538 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  for (const [name, row] of Object.entries(levels)) wirePin(name, row);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
  return read;
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const isHigh = (v) => v > HIGH;
const isLow = (v) => v <= HIGH;

// Section 1 ── valid trigger: A low (falling vs initial high), B held high, reset high.
let r = evalCase({ '1A': 0, '1B': 1, '1CD': 1 });
assert(isHigh(r('1Q')),  `S1 trigger: 1Q should be HIGH, got ${r('1Q').toFixed(2)} V`);
assert(isLow(r('1Qn')),  `S1 trigger: 1Qn should be LOW, got ${r('1Qn').toFixed(2)} V`);

// Section 1 ── reset dominates: same trigger wiring but CD LOW → output forced low.
r = evalCase({ '1A': 0, '1B': 1, '1CD': 0 });
assert(isLow(r('1Q')),   `S1 reset: 1Q should be LOW (CD active-low), got ${r('1Q').toFixed(2)} V`);
assert(isHigh(r('1Qn')), `S1 reset: 1Qn should be HIGH, got ${r('1Qn').toFixed(2)} V`);

// Section 1 ── idle / blocked: A held HIGH and B held LOW → no valid trigger.
r = evalCase({ '1A': 1, '1B': 0, '1CD': 1 });
assert(isLow(r('1Q')),   `S1 idle: 1Q should be LOW (no trigger), got ${r('1Q').toFixed(2)} V`);
assert(isHigh(r('1Qn')), `S1 idle: 1Qn should be HIGH, got ${r('1Qn').toFixed(2)} V`);

// Section 2 ── independent: valid trigger fires 2Q (guards the 2A/2B/2CD/2Q map).
r = evalCase({ '2A': 0, '2B': 1, '2CD': 1 });
assert(isHigh(r('2Q')),  `S2 trigger: 2Q should be HIGH, got ${r('2Q').toFixed(2)} V`);
assert(isLow(r('2Qn')),  `S2 trigger: 2Qn should be LOW, got ${r('2Qn').toFixed(2)} V`);

// Section 2 ── reset: CD low forces 2Q low, and does not disturb section 1.
r = evalCase({ '2A': 0, '2B': 1, '2CD': 0 });
assert(isLow(r('2Q')),   `S2 reset: 2Q should be LOW (CD active-low), got ${r('2Q').toFixed(2)} V`);

console.log(`cd4538-monostable: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
