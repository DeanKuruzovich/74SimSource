// ── 74x259 8-bit addressable latch regression ────────────────────────────────
// The 74x259 (js/chips/chips6.js) is the classic TTL 8-bit addressable latch. It
// rides the shared ADDRESSABLE_LATCH engine primitive on its DEFAULT path (no
// resetActiveHigh flag), where CLR and G are both ACTIVE LOW. Per the SN74LS259B /
// SN74HC259 function table there are FOUR modes:
//   CLR=H, G=L:  addressable latch — addressed output = D, other seven hold.
//   CLR=H, G=H:  memory           — all eight outputs hold.
//   CLR=L, G=L:  8-line demux     — addressed output = D, other seven forced 0.
//   CLR=L, G=H:  clear            — all eight outputs forced 0 (asynchronous).
//
// This scenario is the regression for issues.md C116: the default path used to do
// `state.q.fill(0)` for ANY CLR=L, so the DEMUX mode (CLR=L, G=L) was broken — the
// addressed output was forced to 0 even with D=1. The demux assertions below fail
// against that old behavior. It also pins the verified pin map by pin number
// (S0/S1/S2 in the datasheet; A0/A1/A2 in 74Sim — same pins 1/2/3).
//
// ADDRESSABLE_LATCH contract (js/specificChipsSim.js), default form:
//   inputs:  [A0, A1, A2, D, G, CLR]   (G, CLR both active LOW)
//   outputs: [Q0..Q7]                  level-sensitive (no clock)
//
// Method: place ONE 74x259 and keep the same chip + sim instance across the whole
// run so the latch state (comp.ffState) persists.
//
// Run:  node js/debug/scenarios/74x259-addressable-latch.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { getChipDef } from '../../chips.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const b8 = (n) => n.toString(2).padStart(8, '0');

// ── 0. Pin map guard (pin NUMBER → name), against the verified TI terminal map ──
const EXPECT_PINS = {
  1: 'A0', 2: 'A1', 3: 'A2', 4: 'Q0', 5: 'Q1', 6: 'Q2', 7: 'Q3', 8: 'GND',
  9: 'Q4', 10: 'Q5', 11: 'Q6', 12: 'Q7', 13: 'D', 14: 'G', 15: 'CLR', 16: 'VCC',
};
const def = getChipDef('74x259');
for (const { pin, name } of def.pinout) {
  assert(EXPECT_PINS[pin] === name, `pin ${pin} should be ${EXPECT_PINS[pin]}, def says ${name}`);
}

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x259');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive every input pin at a rail level on each solve (1 = VCC row, 0 = GND row).
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x259 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('A0', (st.a >> 0) & 1 ? 1 : 0);
  wirePin('A1', (st.a >> 1) & 1 ? 1 : 0);
  wirePin('A2', (st.a >> 2) & 1 ? 1 : 0);
  wirePin('D', st.d ? 1 : 0);
  wirePin('G', st.g ? 1 : 0);
  wirePin('CLR', st.clr ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};

// Current input state. Idle = no write (G=1), no clear (CLR=1).
const st = { a: 0, d: 0, g: 1, clr: 1 };
const solve = () => apply(st);

// Write one addressed bit: CLR high, pulse G low (addressed follows D), then hold.
function writeBit(addr, val) {
  st.a = addr; st.d = val ? 1 : 0; st.clr = 1;
  st.g = 0; solve();   // addressable-latch mode: addressed follows D
  st.g = 1; solve();   // memory mode: hold all
}

// ── 1. Clear mode (CLR=L, G=H): all outputs 0 ────────────────────────────────
st.clr = 0; st.g = 1; solve();
assert(qbits() === 0, `clear: all Q should be 0, got ${b8(qbits())}`);
st.clr = 1; solve();

// ── 2. Addressable-latch writes; unaddressed latches must hold ────────────────
writeBit(0, 1);
writeBit(2, 1);
writeBit(4, 1);
assert(qbits() === 0b00010101, `writes Q0/Q2/Q4: got ${b8(qbits())}`);
writeBit(7, 1);
assert(qbits() === 0b10010101, `write Q7 must hold Q0/Q2/Q4: got ${b8(qbits())}`);

// ── 3. Memory mode (CLR=H, G=H): addressed bit must NOT change ────────────────
st.a = 1; st.d = 1; st.clr = 1; st.g = 1; solve();  // try to set Q1 with G high
assert(qbits() === 0b10010101, `memory mode must inhibit write, got ${b8(qbits())}`);

// ── 4. Clearing a stored bit: address it with D=0 while G=0 ───────────────────
writeBit(0, 0);
assert(qbits() === 0b10010100, `clear Q0 via D=0: got ${b8(qbits())}`);

// ── 5. Demultiplexer mode (CLR=L, G=L): addressed = D, others forced 0 ────────
//     This is the C116 regression: old code forced ALL outputs to 0 here.
st.a = 3; st.d = 1; st.g = 0; st.clr = 0; solve();
assert(qbits() === 0b00001000, `demux: only addressed Q3 high, got ${b8(qbits())}`);
// Moving the address in demux mode steers the single active output.
st.a = 6; solve();
assert(qbits() === 0b01000000, `demux steer to Q6: got ${b8(qbits())}`);
// D=0 in demux mode → all outputs 0.
st.d = 0; solve();
assert(qbits() === 0b00000000, `demux D=0 → all low: got ${b8(qbits())}`);

// ── 6. Clear again from a non-zero state (CLR=L, G=H) ─────────────────────────
st.d = 1; st.g = 0; st.clr = 1; st.a = 5; solve();  // set Q5
assert(((qbits() >> 5) & 1) === 1, `pre-clear Q5 set: got ${b8(qbits())}`);
st.g = 1; st.clr = 0; solve();                       // CLR=L, G=H → clear all
assert(qbits() === 0, `final clear: got ${b8(qbits())}`);

console.log(`74x259-addressable-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
