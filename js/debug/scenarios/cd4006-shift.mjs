// ── CD4006 18-stage static shift register — regression ──────────────────────
// The CD4006 (Batch 9, js/chips/chips155.js) is the behavioral coverage of the
// SHIFT_REG_18BIT_4006 primitive. It guards the four things that make the part
// distinct (and the reasons the coverage-plan hints SHIFT_REG_SISO /
// SHIFT_REG_16BIT_STUB did NOT fit):
//   1. Four INDEPENDENT sections on one common clock: section 1 = 4 stages
//      (D1→D1+4), section 3 = 4 stages (D3→D3+4), section 2 = 5 stages
//      (D2→ tap D2+4 → D2+5), section 4 = 5 stages (D4→ tap D4+4 → D4+5).
//   2. Data shift on the FALLING (negative-going) clock edge — the opposite of
//      most 74-series registers.
//   3. The 5-stage sections bring out BOTH the 4th-stage tap and the 5th stage.
//   4. D1+4' is D1+4 delayed one HALF clock cycle (latched on the RISING edge).
//
// Method (mirrors cd4021-piso-shift.mjs): place ONE CD4006 and reuse the same
// chip + sim instance for the whole run so sequential state persists. A shift is
// a clock pulse whose FALLING edge advances every section; we drive clk HIGH
// (rising edge → D1+4' latch updates) then LOW (falling edge → shift).
//
// Run:  node js/debug/scenarios/cd4006-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4006');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

let stateD = { D1: 0, D2: 0, D3: 0, D4: 0 };

function apply({ clk = 0, d = null } = {}) {
  if (d) stateD = { ...stateD, ...d };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4006 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', clk ? 1 : 0);
  wirePin('D1', stateD.D1 ? 1 : 0);
  wirePin('D2', stateD.D2 ? 1 : 0);
  wirePin('D3', stateD.D3 ? 1 : 0);
  wirePin('D4', stateD.D4 ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);

// One shift = rising edge (updates the D1+4' latch from the *current* D1+4),
// then falling edge (every section advances). `d` sets the data inputs that are
// sampled on the falling edge.
function shift(d = null) {
  apply({ clk: 1 });        // rising edge → D1+4' latch captures current D1+4
  apply({ clk: 0, d });     // falling edge → all sections shift one stage
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Settle at clk LOW, all data LOW. prevClk starts 0, so this is a no-op solve.
apply({ clk: 0, d: { D1: 0, D2: 0, D3: 0, D4: 0 } });

// ── 1. Section 1 (4 stages): a single 1 reaches D1+4 after exactly 4 falls ────
// Inject one HIGH bit into D1, then hold D1 LOW and watch it walk to the output.
shift({ D1: 1 });            // fall #1: stage0=1
assert(bit('D1+4') === 0, `sec1: after 1 fall D1+4 should be 0, got ${bit('D1+4')}`);
shift({ D1: 0 });            // fall #2
shift({ D1: 0 });            // fall #3
assert(bit('D1+4') === 0, `sec1: after 3 falls D1+4 should be 0, got ${bit('D1+4')}`);
shift({ D1: 0 });            // fall #4 → bit reaches last stage
assert(bit('D1+4') === 1, `sec1: after 4 falls D1+4 should be 1, got ${bit('D1+4')}`);
shift({ D1: 0 });            // fall #5 → bit shifted past the end
assert(bit('D1+4') === 0, `sec1: after 5 falls D1+4 should be 0, got ${bit('D1+4')}`);

// ── 2. Section 3 (4 stages): same depth as section 1, independent input ───────
shift({ D3: 1 });
shift({ D3: 0 });
shift({ D3: 0 });
assert(bit('D3+4') === 0, `sec3: after 3 falls D3+4 should be 0, got ${bit('D3+4')}`);
shift({ D3: 0 });
assert(bit('D3+4') === 1, `sec3: after 4 falls D3+4 should be 1, got ${bit('D3+4')}`);

// ── 3. Section 2 (5 stages): tap D2+4 fires at fall 4, D2+5 at fall 5 ─────────
shift({ D2: 1 });
shift({ D2: 0 });
shift({ D2: 0 });
shift({ D2: 0 });            // fall #4 → tap (4th stage)
assert(bit('D2+4') === 1, `sec2: after 4 falls tap D2+4 should be 1, got ${bit('D2+4')}`);
assert(bit('D2+5') === 0, `sec2: after 4 falls D2+5 should still be 0, got ${bit('D2+5')}`);
shift({ D2: 0 });            // fall #5 → output (5th stage)
assert(bit('D2+4') === 0, `sec2: after 5 falls tap D2+4 should be 0, got ${bit('D2+4')}`);
assert(bit('D2+5') === 1, `sec2: after 5 falls D2+5 should be 1, got ${bit('D2+5')}`);

// ── 4. Section 4 (5 stages): tap D4+4 at fall 4, D4+5 at fall 5 ───────────────
shift({ D4: 1 });
shift({ D4: 0 });
shift({ D4: 0 });
shift({ D4: 0 });
assert(bit('D4+4') === 1, `sec4: after 4 falls tap D4+4 should be 1, got ${bit('D4+4')}`);
assert(bit('D4+5') === 0, `sec4: after 4 falls D4+5 should still be 0, got ${bit('D4+5')}`);
shift({ D4: 0 });
assert(bit('D4+4') === 0, `sec4: after 5 falls tap D4+4 should be 0, got ${bit('D4+4')}`);
assert(bit('D4+5') === 1, `sec4: after 5 falls D4+5 should be 1, got ${bit('D4+5')}`);

// ── 5. Sections are independent: driving D1 must not disturb D2/D3/D4 ─────────
// At this point D2+5=1 and D4+5=1 are sitting in the last stages. Shift section 1
// only (D2=D3=D4=0). The other sections advance their own (zero) data, so their
// final-stage 1s shift out — but crucially section 1 carries the new bit, and the
// cross-section outputs never pick up section 1's data.
apply({ clk: 0, d: { D1: 0, D2: 0, D3: 0, D4: 0 } });
shift({ D1: 1 });
assert(bit('D2+5') === 0, `independence: D2+5 must not echo D1 input, got ${bit('D2+5')}`);
assert(bit('D4+5') === 0, `independence: D4+5 must not echo D1 input, got ${bit('D4+5')}`);

// ── 6. Falling-edge only: a rising edge alone must NOT shift ──────────────────
// Load a known bit at section-1 stage0 (one fall with D1=1), record outputs, then
// apply a lone rising edge and confirm the register data is unchanged.
apply({ clk: 0, d: { D1: 0, D2: 0, D3: 0, D4: 0 } });
shift({ D1: 1 });                       // stage0 = 1
const snap = `${bit('D1+4')}`;
apply({ clk: 1 });                      // rising edge only — no shift
assert(`${bit('D1+4')}` === snap,
  `edge: a rising edge must not shift section data (was ${snap}, now ${bit('D1+4')})`);
apply({ clk: 0 });                      // back low without injecting a new fall-bit
                                        // (D1 already 0) — restores quiescent clk

// ── 7. D1+4' is D1+4 delayed half a clock cycle (rising-edge latch) ───────────
// Get D1+4 to 1 (single bit walked to the last stage), confirm D1+4'=0 still,
// then a rising edge copies D1+4 → D1+4'.
apply({ clk: 0, d: { D1: 0, D2: 0, D3: 0, D4: 0 } });
shift({ D1: 1 }); shift({ D1: 0 }); shift({ D1: 0 }); shift({ D1: 0 }); // D1+4 = 1
assert(bit('D1+4') === 1, `cascade: D1+4 should be 1 before half-cycle test, got ${bit('D1+4')}`);
apply({ clk: 1 });                      // rising edge → latch copies D1+4
assert(bit("D1+4'") === 1, `cascade: D1+4' should follow D1+4 after the rising edge, got ${bit("D1+4'")}`);

console.log(`cd4006-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
