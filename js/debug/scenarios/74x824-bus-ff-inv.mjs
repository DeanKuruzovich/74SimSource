// ── 74x824 9-bit inverting bus-interface D flip-flop regression ──────────────
// The 74x824 (js/chips/chips40.js) is the inverting-input member of the
// SN74AS823A/824A 9-bit bus-interface flip-flop family. It rides the
// BUS_FF_9BIT_TRI engine primitive with gate.invert:true. This scenario guards
// the DB entry: the verified SN74AS824A pin map (OEn=1, D0-D8=2-10, CLRn=11,
// GND=12, CLK=13, CLKENn=14, Q8-Q0=15-23, VCC=24), the INVERTING data path
// (stored Q = NOT D on the rising clock edge), the active-LOW asynchronous
// CLRn, the active-LOW clock enable CLKENn (HIGH = hold), and the active-LOW
// OEn three-state control.
//
// BUS_FF_9BIT_TRI contract (js/specificChipsSim.js):
//   inputs:  [OEn, CLRn, CLKENn, CLK, D0..D8]   (13 inputs)
//   outputs: [Q0..Q8]                            rising-edge capture
//   gate.invert === true → Q = NOT D (the '824); false → Q = D (the '823)
//
// Source of the function table checked here: Texas Instruments SDAS231A
// (SN54AS823A/SN74AS823A/SN74AS824A), '824 function table, page 2.
//
// Run:  node js/debug/scenarios/74x824-bus-ff-inv.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v !== null && v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x824');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// A fresh WireManager each call is fine — the register state lives on the
// (persistent) chip component, not the wires.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x824 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn', st.oen ? 1 : 0);
  wirePin('CLRn', st.clrn ? 1 : 0);
  wirePin('CLKENn', st.clken ? 1 : 0);
  wirePin('CLK', st.clk ? 1 : 0);
  for (let i = 0; i < 9; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 9; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const MASK = 0x1FF; // 9 bits

// Input state (mutated by helpers so each apply() drives the full picture).
// Idle: OEn LOW (outputs enabled), CLRn HIGH (not clearing), CLKENn LOW (armed).
const st = { oen: 0, clrn: 1, clken: 0, clk: 0, d: new Array(9).fill(0) };
const solve = () => apply(st);

// Load a 9-bit D pattern with a rising clock edge (CLKENn already LOW → armed).
function load(pattern9) {
  for (let i = 0; i < 9; i++) st.d[i] = (pattern9 >> i) & 1;
  st.clk = 0; solve();   // present data, clock low
  st.clk = 1; solve();   // rising edge → capture ~D
}

// ── 0. Asynchronous active-LOW CLRn forces all nine Q to 0 ───────────────────
st.clrn = 0; solve();
assert(qbits() === 0, `clear: all Q should be 0, got ${qbits().toString(2)}`);
st.clrn = 1; solve();

// ── 1. INVERTING capture: Q must be the complement of D ──────────────────────
load(0b101010101);
assert(qbits() === ((~0b101010101) & MASK),
  `inv load 101010101: expected ${((~0b101010101)&MASK).toString(2)}, got ${qbits().toString(2)}`);

// All-zeros D → all-ones Q (pure inversion check).
load(0b000000000);
assert(qbits() === MASK, `inv load zeros → all Q high, got ${qbits().toString(2)}`);

// All-ones D → all-zeros Q.
load(0b111111111);
assert(qbits() === 0, `inv load ones → all Q low, got ${qbits().toString(2)}`);

// ── 2. CLKENn HIGH inhibits the clock (hold) ─────────────────────────────────
load(0b000011110);                       // Q now = ~0b000011110
const held = qbits();
st.clken = 1;                            // disable the clock
for (let i = 0; i < 9; i++) st.d[i] = (0b111100001 >> i) & 1;
st.clk = 0; solve();
st.clk = 1; solve();                     // rising edge, but CLKENn HIGH → no load
assert(qbits() === held, `CLKENn HIGH should hold ${held.toString(2)}, got ${qbits().toString(2)}`);
st.clken = 0; solve();                   // re-arm

// ── 3. A falling clock edge must NOT capture ─────────────────────────────────
load(0b010101010);
const beforeFall = qbits();
for (let i = 0; i < 9; i++) st.d[i] = (0b001100110 >> i) & 1;
st.clk = 0; solve();                     // only drop the clock → hold
assert(qbits() === beforeFall, `falling edge held wrong: ${qbits().toString(2)}`);
st.clk = 1; solve();                     // now rising edge captures the new value
assert(qbits() === ((~0b001100110) & MASK), `rising edge capture: ${qbits().toString(2)}`);

// ── 4. OEn HIGH releases the outputs (Hi-Z) without disturbing stored data ───
load(0b111111111);                       // Q = all zeros; drive D8 low so Q8=1
for (let i = 0; i < 9; i++) st.d[i] = 0; // D=0 → stored Q would be all-ones
st.clk = 0; solve();
st.clk = 1; solve();                     // Q now = all ones
assert(qbits() === MASK, `pre-OEn value should be all ones, got ${qbits().toString(2)}`);
st.oen = 1; solve();                     // release outputs
assert(isHigh(read('Q0')) === false, 'OEn HIGH should release Q0 (not driven HIGH)');
assert(isHigh(read('Q8')) === false, 'OEn HIGH should release Q8 (not driven HIGH)');
st.oen = 0; solve();                     // re-enable → stored data reappears
assert(qbits() === MASK, `data preserved through Hi-Z, got ${qbits().toString(2)}`);

// ── 5. Async CLRn overrides a held value regardless of clock level ───────────
st.clk = 1; st.clrn = 0; solve();        // clock HIGH, clear asserted
assert(qbits() === 0, `async clear over held value: got ${qbits().toString(2)}`);
st.clrn = 1; solve();

console.log(`74x824-bus-ff-inv: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
