// ── CD4047 monostable trigger/reset regression ───────────────────────────────
// The CD4047 (Batch 12, js/chips/chips78.js) is a single edge-triggered
// monostable (one-shot) on the shared MONOSTABLE_RC primitive (also used by the
// 74x123 / CD4538). Unlike the CD4538 its EXTERNAL RESET is *active HIGH*
// (gate.resetActiveHigh), so this scenario specifically guards that polarity
// flip plus the +TRIGGER / -TRIGGER edge mapping and the Q / Q-bar pins.
//
// Each case places a fresh chip (fresh latch state, prevA=1, prevB=0), wires
// VDD/VSS and the named control inputs to the rails, runs one evaluate(), and
// reads the driven Q / Q-bar. With no RC network on the timing pin the pulse
// never times out, so a valid trigger leaves Q latched HIGH — isolating the
// digital trigger/reset logic:
//   • +TRIGGER rising, -TRIGGER low, RESET low  → Q HIGH  (positive-edge trigger)
//   • -TRIGGER low (falling), +TRIGGER high, RESET low → Q HIGH (negative-edge)
//   • RESET HIGH (active-high here!)            → Q LOW   (external reset)
//   • idle: +TRIGGER low, -TRIGGER high, RESET low → Q LOW (no valid edge)
//
// Run:  node js/debug/scenarios/cd4047-monostable.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)

// Place a CD4047, tie VDD/VSS to the rails, drive the named control pins to a
// rail (1 = VCC rail, 0 = GND rail), evaluate once, and read pin voltages.
function evalCase(levels) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('CD4047');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4047 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
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

// Positive-edge trigger: +TRIGGER rising (prevB=0 → 1), -TRIGGER held low, reset low.
let r = evalCase({ 'TRIG': 1, 'TRIGn': 0, 'RESET': 0 });
assert(isHigh(r('Q')),  `+edge trigger: Q should be HIGH, got ${r('Q').toFixed(2)} V`);
assert(isLow(r('Qn')),  `+edge trigger: Qn should be LOW, got ${r('Qn').toFixed(2)} V`);

// Negative-edge trigger: -TRIGGER falling (prevA=1 → 0), +TRIGGER held high, reset low.
r = evalCase({ 'TRIGn': 0, 'TRIG': 1, 'RESET': 0 });
assert(isHigh(r('Q')),  `-edge trigger: Q should be HIGH, got ${r('Q').toFixed(2)} V`);
assert(isLow(r('Qn')),  `-edge trigger: Qn should be LOW, got ${r('Qn').toFixed(2)} V`);

// External reset is ACTIVE HIGH on the 4047: RESET high forces Q low despite a
// valid trigger. This is the polarity that differs from the CD4538.
r = evalCase({ 'TRIG': 1, 'TRIGn': 0, 'RESET': 1 });
assert(isLow(r('Q')),   `reset (active-HIGH): Q should be LOW, got ${r('Q').toFixed(2)} V`);
assert(isHigh(r('Qn')), `reset (active-HIGH): Qn should be HIGH, got ${r('Qn').toFixed(2)} V`);

// Idle / blocked: +TRIGGER low and -TRIGGER high → neither edge clause fires.
r = evalCase({ 'TRIG': 0, 'TRIGn': 1, 'RESET': 0 });
assert(isLow(r('Q')),   `idle: Q should be LOW (no trigger), got ${r('Q').toFixed(2)} V`);
assert(isHigh(r('Qn')), `idle: Qn should be HIGH, got ${r('Qn').toFixed(2)} V`);

console.log(`cd4047-monostable: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
