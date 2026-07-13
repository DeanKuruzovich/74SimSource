// ── CD4094 8-stage shift-and-store bus register regression ───────────────────
// The CD4094 (Batch 9, js/chips/chips88.js) is the behavioral coverage of the
// SHIFT_REG_LATCH_4094 primitive against the VERIFIED CD4094B pinout (TI
// SCHS063B, Fig. 1) — distinct from the pre-existing 74HC-style `74x4094`
// entry (see chips88.js header + issues.md). It guards:
//   • serial shift: DATA sampled on the POSITIVE CLOCK edge; the first bit lands
//     on Q1 (O1) and walks toward Q8 (O8) on subsequent edges;
//   • the storage latch: STROBE HIGH = transparent (outputs follow the shift
//     register), STROBE LOW = hold (outputs frozen while new bits shift in);
//   • 3-state outputs: OUTPUT ENABLE (OE) HIGH drives Q1..Q8, OE LOW = Hi-Z;
//   • serial cascade output QS = 8th shift-register stage, ALWAYS driven (it is
//     not gated by OE).
//
// Run:  node js/debug/scenarios/cd4094-shift-store.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4094');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC row, 0 =
// GND row). The shift/store state lives on the (persistent) chip component, so a
// fresh WireManager each call is fine.
function apply({ data, clk, strobe, oe }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4094 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('DATA',   data   ? 1 : 0);
  wirePin('CLOCK',  clk    ? 1 : 0);
  wirePin('STROBE', strobe ? 1 : 0);
  wirePin('OE',     oe     ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const par = () => {
  const b = (q) => (isHigh(read(q)) ? 1 : 0);
  // return Q8..Q1 as an 8-char string (MSB = Q8 = oldest bit)
  return [8,7,6,5,4,3,2,1].map(i => b(`Q${i}`)).join('');
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Current input state — mutated by helpers so each apply() carries all 4 inputs.
const st = { data: 0, clk: 0, strobe: 1, oe: 1 };
const solve = () => apply(st);

// One shift: present DATA, then a rising then falling CLOCK edge.
function shift(bit) {
  st.data = bit ? 1 : 0;
  st.clk = 0; solve();    // ensure CLOCK low
  st.clk = 1; solve();    // rising edge → DATA sampled into stage 1
  st.clk = 0; solve();    // falling edge → no shift
}

// ── 0. Power-up: clear the register by shifting in eight 0s ───────────────────
for (let i = 0; i < 8; i++) shift(0);
assert(par() === '00000000', `clear: all stages should be 0, got ${par()}`);

// ── 1. First bit appears on Q1, then walks toward Q8 ─────────────────────────
shift(1);
assert(par() === '00000001', `after 1 shift the bit should be on Q1, got ${par()}`);
shift(0);
assert(par() === '00000010', `bit should walk Q1→Q2, got ${par()}`);
shift(0);
assert(par() === '00000100', `bit should walk Q2→Q3, got ${par()}`);

// ── 2. Walk the lone 1 all the way to Q8 and confirm QS picks it up ──────────
// We are at Q3 (3 shifts in). Five more 0-shifts → bit reaches the 8th stage.
for (let i = 0; i < 5; i++) shift(0);
assert(par() === '10000000', `bit should reach Q8 after 8 total shifts, got ${par()}`);
assert(isHigh(read('QS')), `QS (serial cascade) should be HIGH when the 1 is in stage 8`);

// ── 3. STROBE LOW freezes the parallel outputs while new bits shift in ───────
const frozen = par();                 // 10000000
st.strobe = 0; solve();               // latch holds
shift(1); shift(1); shift(1);         // shift register changes underneath
assert(par() === frozen, `STROBE LOW must freeze outputs at ${frozen}, got ${par()}`);
// QS is taken from the shift register, not the latch, so it must have moved:
// after the three 1-shifts above the 8th stage holds the bit shifted out earlier.
st.strobe = 1; solve();               // re-open the latch → outputs catch up
assert(par() !== frozen, `re-opening STROBE should update outputs away from ${frozen}, got ${par()}`);

// ── 4. OUTPUT ENABLE LOW puts Q1..Q8 in Hi-Z, but QS stays driven ────────────
// Load a known pattern: clear, then shift a single 1 into stage 8.
for (let i = 0; i < 8; i++) shift(0);
shift(1);
for (let i = 0; i < 7; i++) shift(0);
assert(par() === '10000000', `setup for OE test: expected Q8 high, got ${par()}`);
const qsDriven = isHigh(read('QS'));
assert(qsDriven, `QS should be HIGH before disabling outputs`);

st.oe = 0; solve();                   // disable 3-state parallel outputs
assert(!isHigh(read('Q8')), `OE LOW must make Q8 Hi-Z (not driven HIGH), got ${read('Q8')}`);
assert(isHigh(read('QS')), `QS must stay driven HIGH regardless of OE`);
st.oe = 1; solve();                   // re-enable
assert(isHigh(read('Q8')), `OE HIGH must restore Q8 HIGH, got ${read('Q8')}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error('CD4094 FAIL:');
  for (const f of failures) console.error('  • ' + f);
  process.exit(1);
}
console.log('CD4094 shift-and-store register: all checks passed.');
