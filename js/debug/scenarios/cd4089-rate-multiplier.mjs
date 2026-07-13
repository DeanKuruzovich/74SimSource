// ── CD4089 4-bit binary rate multiplier — regression ─────────────────────────
// The CD4089 (js/chips/chips159.js) reuses the 74x97 RATE_MULT_6BIT primitive
// with a new opt-in enableActiveLow flag. This is a behavioral approximation
// (issues.md B4): OUT is modeled as the clock gated by STROBE, i.e.
//   OUT = CLOCK AND NOT STROBE.
// The full N/16 pulse-rate division, the two-chip cascade, the complementary
// OUT-bar pin, the "15" detect, and the inhibit/carry chain are NOT modeled, so
// this scenario only guards the part that IS: the STROBE-gated clock pass-through
// and the pin map. The datasheet truth table (SCHS062B, page 5) is the source for
// the gate polarity: STR=0 → OUT follows the clock train; STR=1 → OUT = L.
//
// Method: place ONE CD4089 and re-solve with CLOCK and STROBE held at rail levels.
// OUT is read straight off pin 6 by name. (The model is combinational in CLOCK and
// STROBE, so no edge stepping is needed.)
//
// Checks:
//   • STROBE LOW,  CLOCK HIGH → OUT HIGH   (enabled, clock passes)
//   • STROBE LOW,  CLOCK LOW  → OUT LOW     (enabled, follows clock)
//   • STROBE HIGH, CLOCK HIGH → OUT LOW     (strobe blanks output)
//   • STROBE HIGH, CLOCK LOW  → OUT LOW     (strobe blanks output)
//
// Run:  node js/debug/scenarios/cd4089-rate-multiplier.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4089');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLOCK and STROBE held at the given rail levels (1 = VCC, 0 = GND).
function apply({ clock, strobe }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4089 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK',  clock  ? 1 : 0);
  wirePin('STROBE', strobe ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Enabled (STROBE LOW): OUT follows CLOCK ───────────────────────────────
apply({ clock: true,  strobe: false });
assert(isHigh(read('OUT')),  'STROBE low + CLOCK high: OUT should be HIGH');
apply({ clock: false, strobe: false });
assert(!isHigh(read('OUT')), 'STROBE low + CLOCK low: OUT should be LOW');

// ── 2. Blanked (STROBE HIGH): OUT forced LOW regardless of CLOCK ─────────────
apply({ clock: true,  strobe: true });
assert(!isHigh(read('OUT')), 'STROBE high + CLOCK high: OUT should be LOW (blanked)');
apply({ clock: false, strobe: true });
assert(!isHigh(read('OUT')), 'STROBE high + CLOCK low: OUT should be LOW (blanked)');

console.log(`cd4089-rate-multiplier: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
