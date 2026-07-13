// ── CD4038 triple serial adder (negative-edge clock) — regression ────────────
// The CD4038 (js/chips/chips145.js) is the first behavioral coverage of the new
// SERIAL_ADDER_TRIPLE_4038 primitive. It guards the ways the CD4038 differs from
// the 74385 SERIAL_ADDER_QUAD the coverage plan originally hinted:
//   1. THREE independent adders (not four), sharing one CLOCK + one CARRY RESET.
//   2. Each computes SUM = A XOR B XOR carry_in (a real serial full adder); the
//      INVERT command complements the SUM OUTPUT (NOT the B input like the 74385
//      subtract — inverting B would corrupt the carry chain).
//   3. The carry is captured on the FALLING clock edge (the CD4032 is the
//      rising-edge sibling).
//   4. CARRY RESET HIGH clears every stored carry so a new word starts at 0.
//
// Source for the expected numbers: SGS-Thomson "HCC/HCF4032B HCC/HCF4038B Triple
// Serial Adders" (June 1989), read as PDF page images (issues.md C4). The adds
// below are hand-traced LSB-first full additions.
//
// Method (mirrors cd4035-pipo-shift.mjs): place ONE CD4038 and reuse the same
// chip + sim instance so sequential carry state persists. Each input pin is
// wired to the VCC row (1) or GND row (0) before a solve.
//
// Run:  node js/debug/scenarios/cd4038-serial-adder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4038');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const PIN_DEFAULTS = {
  A1: 0, B1: 0, INVERT1: 0,
  A2: 0, B2: 0, INVERT2: 0,
  A3: 0, B3: 0, INVERT3: 0,
  CARRYRST: 0, CLOCK: 0,
};
let pinState = { ...PIN_DEFAULTS };

function apply(overrides = {}) {
  pinState = { ...pinState, ...overrides };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4038 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (const name of Object.keys(PIN_DEFAULTS)) wirePin(name, pinState[name]);
  sim.evaluate(world, [chip], wm);
}

const bit = (name) => (isHigh(sim.getVoltageAtHole(chip.getPinByName(name).holeId)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Reset all stored carries to 0: CARRY RESET HIGH across a falling clock edge.
function resetCarry() {
  apply({ CARRYRST: 1, CLOCK: 1 });
  apply({ CLOCK: 0 });          // falling edge with CR=1 clears the carries
  apply({ CARRYRST: 0 });       // CLOCK left LOW, ready for the first bit
}

// Present one bit position on all three adders, read the three SUM bits while
// CLOCK is HIGH (SUM is combinational, using the carry stored on the previous
// falling edge), then drop CLOCK to latch each carry-out for the next bit.
function tick(ins) {
  apply({ ...ins, CLOCK: 1 });
  const sums = [bit('SUM1'), bit('SUM2'), bit('SUM3')];
  apply({ CLOCK: 0 });          // falling edge → latch carry-out for next bit
  return sums;
}

// ── 1. Three simultaneous serial additions, LSB first ────────────────────────
//   Adder 1: 3 + 5  = 8   → SUM stream 0,0,0,1,0   (INVERT1 = 0, true sum)
//   Adder 2: 6 + 6  = 12  → SUM stream 0,0,1,1,0   (INVERT2 = 0, true sum)
//   Adder 3: 1 + 0  = 1, with INVERT3 = 1 → complemented stream 0,1,1,1,1
// Bit streams (LSB first, 5 positions to flush the final carry):
const A1s = [1, 1, 0, 0, 0], B1s = [1, 0, 1, 0, 0];   // 3, 5
const A2s = [0, 1, 1, 0, 0], B2s = [0, 1, 1, 0, 0];   // 6, 6
const A3s = [1, 0, 0, 0, 0], B3s = [0, 0, 0, 0, 0];   // 1, 0  (INVERT3 held HIGH)
const want1 = [0, 0, 0, 1, 0];   // = 8
const want2 = [0, 0, 1, 1, 0];   // = 12
const want3 = [0, 1, 1, 1, 1];   // complement of 1,0,0,0,0

resetCarry();
const got1 = [], got2 = [], got3 = [];
for (let i = 0; i < 5; i++) {
  const s = tick({
    A1: A1s[i], B1: B1s[i], INVERT1: 0,
    A2: A2s[i], B2: B2s[i], INVERT2: 0,
    A3: A3s[i], B3: B3s[i], INVERT3: 1,
  });
  got1.push(s[0]); got2.push(s[1]); got3.push(s[2]);
}
assert(got1.join('') === want1.join(''), `adder1 3+5: want ${want1.join('')} got ${got1.join('')}`);
assert(got2.join('') === want2.join(''), `adder2 6+6: want ${want2.join('')} got ${got2.join('')}`);
assert(got3.join('') === want3.join(''), `adder3 1+0 INVERT: want ${want3.join('')} got ${got3.join('')}`);

// ── 2. Carry is captured on the FALLING edge only (distinguishes from CD4032) ─
resetCarry();
// Present A1=B1=1 (would generate carry-out=1) and clock HIGH (a RISING edge).
apply({ A1: 1, B1: 1, INVERT1: 0, CLOCK: 1 });
// A rising edge must NOT latch the carry on the 4038. Change inputs to 0,0 and
// the SUM must reflect carry_in still 0 → SUM1 = 0.
apply({ A1: 0, B1: 0 });
assert(bit('SUM1') === 0, `falling-edge: rising edge must not latch carry, SUM1 should be 0, got ${bit('SUM1')}`);
// Now present A1=B1=1 and take a FALLING edge — that must latch carry-out = 1.
apply({ A1: 1, B1: 1, CLOCK: 1 });
apply({ CLOCK: 0 });            // falling edge latches carry = 1
apply({ A1: 0, B1: 0 });        // SUM1 = 0 XOR 0 XOR carry(=1) = 1
assert(bit('SUM1') === 1, `falling-edge: falling edge should latch carry=1, SUM1 should be 1, got ${bit('SUM1')}`);

// ── 3. CARRY RESET clears the stored carry ───────────────────────────────────
// Continuing from above (carry currently 1): pulse CARRY RESET across a falling
// edge, then SUM1 with A=B=0 must be 0 again.
apply({ CARRYRST: 1, CLOCK: 1 });
apply({ CLOCK: 0 });            // falling edge with CR=1 clears carry
apply({ CARRYRST: 0, A1: 0, B1: 0 });
assert(bit('SUM1') === 0, `carry-reset: SUM1 should be 0 after CARRY RESET, got ${bit('SUM1')}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error('CD4038 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD4038 triple serial adder: all checks passed');
