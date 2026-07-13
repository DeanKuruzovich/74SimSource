// ── 74x681 4-bit parallel binary accumulator — regression ────────────────────
// The 74x681 (js/chips/chips36.js) is the TI SN74LS681: a 4-bit ALU wired to two
// 4-bit registers (word A + word B shift/accumulator) with three bidirectional
// I/O ports. It drives the ACC_4BIT_681 engine primitive
// (js/specificChipsSim.js _evaluateAcc4Bit681).
//
// Contract (js/specificChipsSim.js):
//   inputs:  [CLK, RS2, RS1, RS0, AS2, AS1, AS0, M, Cn, LI/RO, RI/LO,
//             I/O0, I/O1, I/O2, I/O3]
//   outputs: [I/O0, I/O1, I/O2, I/O3, Cn+4, G, P, LI/RO, RI/LO]
//   RS mode (RS2..RS0): 0 ACCUM, 1 LOAD B, 2 LEFT SHIFT LOGICAL,
//     3 LEFT SHIFT ARITH, 4 RIGHT SHIFT LOGICAL, 5 RIGHT SHIFT ARITH,
//     6 HOLD, 7 LOAD A.
//   ALU sel (AS2..AS0), M=0 arithmetic: 3 = A PLUS B, 2 = A MINUS B, 4 = B.
//   Cn is active HIGH ("with carry" column). M=1 = logic; sel 4 = AND, 7 = OR.
//
// This guards the verified pinout (CLK=1,RS2=2,RS1=3,RS0=4,LI/RO=5,Cn=6,G=7,
// Cn+4=8,P=9,GND=10,I/O3=11,I/O2=12,I/O1=13,I/O0=14,M=15,AS2=16,AS1=17,AS0=18,
// RI/LO=19,VCC=20) and the core behaviour: load A/B, the accumulate loop
// (B ← A+B each edge, with carry out), arithmetic subtract, a logic op through
// the I/O bus, HOLD, and a B-register shift.
//
// Method: place ONE 74x681. In load modes we drive the I/O bus from rails; in
// output modes we leave the I/O pins un-wired so the chip drives them, and read
// the ALU result F back off those pins. A clock pulse = solve(CLK=1),solve(CLK=0).
//
// Run:  node js/debug/scenarios/74x681-accumulator.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x681');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Control state. `io` is the 4-bit word driven onto the I/O bus, or null to
// release the bus so the chip drives it (output modes).
const st = { clk: 0, rs: 6, as: 4, m: 0, cn: 0, li: 0, ri: 0, io: null };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x681 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk);
  wirePin('RS0', (st.rs >> 0) & 1);
  wirePin('RS1', (st.rs >> 1) & 1);
  wirePin('RS2', (st.rs >> 2) & 1);
  wirePin('AS0', (st.as >> 0) & 1);
  wirePin('AS1', (st.as >> 1) & 1);
  wirePin('AS2', (st.as >> 2) & 1);
  wirePin('M', st.m);
  wirePin('Cn', st.cn);
  wirePin('LI/RO', st.li);
  wirePin('RI/LO', st.ri);
  if (st.io !== null) {
    // Load mode: drive the bus. (LI/RO and RI/LO are only serial ports; they
    // stay wired from st.li/st.ri above.)
    wirePin('I/O0', (st.io >> 0) & 1);
    wirePin('I/O1', (st.io >> 1) & 1);
    wirePin('I/O2', (st.io >> 2) & 1);
    wirePin('I/O3', (st.io >> 3) & 1);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);
const readF = () => {
  let v = 0;
  for (let i = 0; i < 4; i++) if (isHigh(read(`I/O${i}`))) v |= (1 << i);
  return v;
};
function pulse() { st.clk = 1; solve(); st.clk = 0; solve(); }

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. LOAD A = 3, LOAD B = 5 ────────────────────────────────────────────────
st.rs = 7; st.io = 3; solve(); pulse();   // LOAD A ← 3
st.rs = 1; st.io = 5; solve(); pulse();   // LOAD B ← 5

// Switch to a mode that drives the bus and set the ALU to A PLUS B (sel 3),
// arithmetic, no carry-in. HOLD (rs=6) drives the bus without changing anything.
st.rs = 6; st.as = 3; st.m = 0; st.cn = 0; st.io = null; solve();
assert(readF() === 8, `ALU A+B with A=3,B=5 should read 8, got ${readF()}`);
assert(readBit('Cn+4') === 0, `A+B=8 should not carry, got Cn+4=${readBit('Cn+4')}`);

// ── 2. Accumulate loop: B ← A + B each clock edge ────────────────────────────
// ACCUM (rs=0) stores the pre-edge ALU result (A+B) back into B, so the bus,
// which shows A + B, advances by A (=3) each pulse: 8 → 11 → 14 → (17→1,carry).
st.rs = 0; solve();
pulse();
assert(readF() === 11, `after 1st accumulate bus should show 11, got ${readF()}`);
pulse();
assert(readF() === 14, `after 2nd accumulate bus should show 14, got ${readF()}`);
pulse();
assert(readF() === 1,  `3rd accumulate: 3+14=17 → F=1, got ${readF()}`);
assert(readBit('Cn+4') === 1, `3rd accumulate should carry out, got Cn+4=${readBit('Cn+4')}`);

// ── 3. HOLD keeps B; the bus keeps showing the same result ───────────────────
st.rs = 6; solve();          // HOLD, still A PLUS B
const held = readF();
pulse();
assert(readF() === held, `HOLD must not change B (bus stayed ${held}), got ${readF()}`);

// ── 4. Arithmetic subtract A MINUS B (sel 2), Cn=1 = true subtract ───────────
// Reload known words: A=8, B=3.
st.rs = 7; st.io = 8; solve(); pulse();   // A ← 8
st.rs = 1; st.io = 3; solve(); pulse();   // B ← 3
st.rs = 6; st.as = 2; st.cn = 1; st.io = null; solve();   // A MINUS B
assert(readF() === 5, `A MINUS B with A=8,B=3 should be 5, got ${readF()}`);
assert(readBit('Cn+4') === 1, `8-3 has no borrow → Cn+4=1, got ${readBit('Cn+4')}`);
// Reverse: A=3, B=8 → 3-8 borrows.
st.rs = 7; st.io = 3; solve(); pulse();
st.rs = 1; st.io = 8; solve(); pulse();
st.rs = 6; st.as = 2; st.cn = 1; st.io = null; solve();
assert(readF() === 11, `A MINUS B with A=3,B=8 → (3-8)&15 = 11, got ${readF()}`);
assert(readBit('Cn+4') === 0, `3-8 borrows → Cn+4=0, got ${readBit('Cn+4')}`);

// ── 5. Logic mode through the I/O bus: A AND B, A OR B (Cn=0) ─────────────────
// A=0b1100 (12), B=0b1010 (10).
st.rs = 7; st.io = 0b1100; solve(); pulse();
st.rs = 1; st.io = 0b1010; solve(); pulse();
st.rs = 6; st.m = 1; st.cn = 0; st.io = null;
st.as = 4; solve();   // AND
assert(readF() === 0b1000, `logic AND(1100,1010) should be 1000, got ${readF().toString(2)}`);
st.as = 7; solve();   // OR
assert(readF() === 0b1110, `logic OR(1100,1010) should be 1110, got ${readF().toString(2)}`);

// ── 6. B-register left shift (sel: read B via arithmetic "B", AS=4, M=0) ──────
// Load B = 0b0110 (6). LEFT SHIFT LOGICAL (rs=2) with serial-in li=0 gives
// newB = [b1,b2,b3,li] = [1,1,0,0] = 0b0011 (3). Show B on the bus with AS=4
// (arithmetic "B", Cn=0 → F=B).
st.rs = 1; st.m = 0; st.as = 4; st.cn = 0; st.io = 0b0110; solve(); pulse();  // B ← 6
st.rs = 6; st.io = null; solve();
assert(readF() === 6, `pre-shift B should read 6, got ${readF()}`);
st.rs = 2; st.li = 0; solve();   // LEFT SHIFT LOGICAL mode (still drives bus = B)
pulse();
assert(readF() === 3, `LEFT SHIFT of 0110 with li=0 should give 0011 (3), got ${readF()}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`74x681 accumulator regression FAILED (${failures.length}):`);
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('74x681 accumulator regression PASSED');
