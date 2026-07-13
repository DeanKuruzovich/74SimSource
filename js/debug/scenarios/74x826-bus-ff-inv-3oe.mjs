// ── 74x826 8-bit inverting bus-interface D flip-flop regression ──────────────
// The 74x826 (js/chips/chips41.js) is the inverting-data member of the
// SN74AS825A/826A (AMD Am29825/826, IDT FCT825) 8-bit bus-interface flip-flop
// family. It rides the BUS_FF_8BIT_3OE_TRI engine primitive with gate.invert:true.
// This scenario guards the DB entry: the verified FCT825 pin map (OE1n=1, OE2n=2,
// D0-D7=3-10, CLRn=11, GND=12, CLK=13, CLKENn=14, Q7-Q0=15-22, OE3n=23, VCC=24),
// the INVERTING data path (stored Q = NOT D on the rising clock edge), the
// active-LOW asynchronous CLRn, the active-LOW clock enable CLKENn (HIGH = hold),
// and the THREE active-LOW output enables (outputs drive only when all are LOW).
//
// BUS_FF_8BIT_3OE_TRI contract (js/specificChipsSim.js):
//   inputs:  [OE1n, OE2n, OE3n, CLRn, CLKENn, CLK, D0..D7]   (14 inputs)
//   outputs: [Q0..Q7]                                         rising-edge capture
//   gate.invert === true → Q = NOT D (the '826); false → Q = D (the '825)
//
// Source of the function table checked here: IDT DSC-2567/7 (FCT821/823/825),
// family function table, page 3. The '826 is the inverting-data twin of the '825.
//
// Run:  node js/debug/scenarios/74x826-bus-ff-inv-3oe.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v !== null && v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x826');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x826 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OE1n', st.oe1 ? 1 : 0);
  wirePin('OE2n', st.oe2 ? 1 : 0);
  wirePin('OE3n', st.oe3 ? 1 : 0);
  wirePin('CLRn', st.clrn ? 1 : 0);
  wirePin('CLKENn', st.clken ? 1 : 0);
  wirePin('CLK', st.clk ? 1 : 0);
  for (let i = 0; i < 8; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const MASK = 0xFF; // 8 bits

// Idle: all three OEn LOW (outputs enabled), CLRn HIGH (not clearing),
// CLKENn LOW (armed).
const st = { oe1: 0, oe2: 0, oe3: 0, clrn: 1, clken: 0, clk: 0, d: new Array(8).fill(0) };
const solve = () => apply(st);

// Load an 8-bit D pattern with a rising clock edge (CLKENn already LOW → armed).
function load(pattern8) {
  for (let i = 0; i < 8; i++) st.d[i] = (pattern8 >> i) & 1;
  st.clk = 0; solve();   // present data, clock low
  st.clk = 1; solve();   // rising edge → capture ~D
}

// ── 0. Asynchronous active-LOW CLRn forces all eight Q to 0 ──────────────────
st.clrn = 0; solve();
assert(qbits() === 0, `clear: all Q should be 0, got ${qbits().toString(2)}`);
st.clrn = 1; solve();

// ── 1. INVERTING capture: Q must be the complement of D ──────────────────────
load(0b10101010);
assert(qbits() === ((~0b10101010) & MASK),
  `inv load 10101010: expected ${((~0b10101010)&MASK).toString(2)}, got ${qbits().toString(2)}`);

load(0b00000000);                        // all-zeros D → all-ones Q
assert(qbits() === MASK, `inv load zeros → all Q high, got ${qbits().toString(2)}`);

load(0b11111111);                        // all-ones D → all-zeros Q
assert(qbits() === 0, `inv load ones → all Q low, got ${qbits().toString(2)}`);

// ── 2. CLKENn HIGH inhibits the clock (hold) ─────────────────────────────────
load(0b00011110);
const held = qbits();
st.clken = 1;                            // disable the clock
for (let i = 0; i < 8; i++) st.d[i] = (0b11100001 >> i) & 1;
st.clk = 0; solve();
st.clk = 1; solve();                     // rising edge, but CLKENn HIGH → no load
assert(qbits() === held, `CLKENn HIGH should hold ${held.toString(2)}, got ${qbits().toString(2)}`);
st.clken = 0; solve();                   // re-arm

// ── 3. A falling clock edge must NOT capture ─────────────────────────────────
load(0b01010101);
const beforeFall = qbits();
for (let i = 0; i < 8; i++) st.d[i] = (0b00110011 >> i) & 1;
st.clk = 0; solve();                     // only drop the clock → hold
assert(qbits() === beforeFall, `falling edge held wrong: ${qbits().toString(2)}`);
st.clk = 1; solve();                     // now rising edge captures the new value
assert(qbits() === ((~0b00110011) & MASK), `rising edge capture: ${qbits().toString(2)}`);

// ── 4. Each output enable, on its own, releases the outputs (Hi-Z) ───────────
// Load a known non-zero value, then check that raising ANY single OEn floats
// the outputs, and that all three must be LOW to drive again.
load(0b00000000);                        // Q = all ones
assert(qbits() === MASK, `pre-OEn value should be all ones, got ${qbits().toString(2)}`);
for (const which of ['oe1', 'oe2', 'oe3']) {
  st[which] = 1; solve();                // one enable HIGH → float
  assert(isHigh(read('Q0')) === false, `${which} HIGH should release Q0`);
  assert(isHigh(read('Q7')) === false, `${which} HIGH should release Q7`);
  st[which] = 0; solve();               // back to all-LOW → drive again
  assert(qbits() === MASK, `data preserved through ${which} Hi-Z, got ${qbits().toString(2)}`);
}

// Two enables LOW is still not enough — the third HIGH keeps outputs floating.
st.oe1 = 0; st.oe2 = 0; st.oe3 = 1; solve();
assert(isHigh(read('Q0')) === false, 'OE3n HIGH (others LOW) still floats Q0');
st.oe3 = 0; solve();

// ── 5. Async CLRn overrides a held value regardless of clock level ───────────
st.clk = 1; st.clrn = 0; solve();        // clock HIGH, clear asserted
assert(qbits() === 0, `async clear over held value: got ${qbits().toString(2)}`);
st.clrn = 1; solve();

console.log(`74x826-bus-ff-inv-3oe: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
