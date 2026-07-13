// ── CD4099 8-bit addressable latch regression ────────────────────────────────
// The CD4099 (Batch 4, js/chips/chips116.js) is the CMOS 4000-series 8-bit
// addressable latch. It rides the shared ADDRESSABLE_LATCH engine primitive with
// the opt-in `resetActiveHigh:true` flag, which re-interprets the control pins to
// match the CD4099B MODE SELECTION table (WD = WRITE DISABLE, R = RESET, both
// ACTIVE HIGH) and adds the active-high demultiplexer mode:
//   WD=0,R=0:  addressed latch follows DATA;  unaddressed HOLD.
//   WD=0,R=1:  addressed latch follows DATA;  unaddressed reset to 0 (demux).
//   WD=1,R=0:  all latches HOLD.
//   WD=1,R=1:  all latches reset to 0 (master clear).
//
// This scenario guards the chip's DB entry: the verified CD4099B pin map
// (Q7=1, RESET=2, DATA=3, WD=4, A0=5, A1=6, A2=7, VSS=8, Q0..Q6=9..15, VDD=16),
// the active-HIGH RESET / WRITE DISABLE polarity (distinct from the 74x259), and
// each of the four modes including the demux.
//
// ADDRESSABLE_LATCH contract (js/specificChipsSim.js), resetActiveHigh form:
//   inputs:  [A0, A1, A2, D, G(=WD), CLR(=RESET)]   (WD active-HIGH inhibit,
//                                                     RESET active-HIGH)
//   outputs: [Q0..Q7]                                level-sensitive (no clock)
//
// Method: place ONE CD4099 and keep the same chip + sim instance across the whole
// run so the latch state (comp.ffState) persists.
//
// Run:  node js/debug/scenarios/cd4099-addressable-latch.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4099');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive every input pin at a rail level on each solve (1 = VCC row, 0 = GND row).
// A fresh WireManager each call is fine — latch state lives on the chip component.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4099 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('A0', (st.a >> 0) & 1 ? 1 : 0);
  wirePin('A1', (st.a >> 1) & 1 ? 1 : 0);
  wirePin('A2', (st.a >> 2) & 1 ? 1 : 0);
  wirePin('DATA', st.d ? 1 : 0);
  wirePin('WD', st.wd ? 1 : 0);
  wirePin('RESET', st.r ? 1 : 0);
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
const b8 = (n) => n.toString(2).padStart(8, '0');

// Current input state; mutated by helpers so every solve drives all six inputs.
const st = { a: 0, d: 0, wd: 1, r: 0 };
const solve = () => apply(st);

// Write a single addressed bit (WD=0 → addressed follows DATA, others hold),
// then raise WD to latch/hold so subsequent address changes don't disturb it.
function writeBit(addr, val) {
  st.a = addr; st.d = val ? 1 : 0; st.r = 0;
  st.wd = 0; solve();   // addressed latch follows DATA
  st.wd = 1; solve();   // inhibit writes → hold all
}

// ── 0. Master reset (WD=1, R=1) clears all eight latches ─────────────────────
st.wd = 1; st.r = 1; solve();
assert(qbits() === 0, `master reset: all Q should be 0, got ${b8(qbits())}`);
st.r = 0; solve();

// ── 1. Address/data write: set Q0, Q2, Q4 one bit at a time ──────────────────
writeBit(0, 1);
writeBit(2, 1);
writeBit(4, 1);
assert(qbits() === 0b00010101, `addressed writes Q0/Q2/Q4: got ${b8(qbits())}`);

// Unaddressed latches must hold while another bit is being written.
writeBit(7, 1);
assert(qbits() === 0b10010101, `write Q7 must hold Q0/Q2/Q4: got ${b8(qbits())}`);

// ── 2. WRITE DISABLE (WD=1) inhibits writes — addressed bit must NOT change ───
st.a = 1; st.d = 1; st.r = 0; st.wd = 1; solve();   // try to set Q1 with WD high
assert(qbits() === 0b10010101, `WD high must inhibit write, got ${b8(qbits())}`);

// ── 3. Clearing a bit: address it with DATA=0 while WD=0 ─────────────────────
writeBit(0, 0);
assert(qbits() === 0b10010100, `clear Q0 via DATA=0: got ${b8(qbits())}`);

// ── 4. Demultiplexer mode (WD=0, R=1): addressed follows DATA, others → 0 ─────
st.a = 3; st.d = 1; st.wd = 0; st.r = 1; solve();
assert(qbits() === 0b00001000, `demux: only addressed Q3 high, got ${b8(qbits())}`);
// Moving the address in demux mode steers the single active output.
st.a = 6; solve();
assert(qbits() === 0b01000000, `demux steer to Q6: got ${b8(qbits())}`);
// DATA=0 in demux mode → all outputs 0.
st.d = 0; solve();
assert(qbits() === 0b00000000, `demux DATA=0 → all low: got ${b8(qbits())}`);

// ── 5. Master reset again from a non-zero state ──────────────────────────────
st.d = 1; st.wd = 0; st.r = 0; st.a = 5; solve();   // set Q5
assert(((qbits() >> 5) & 1) === 1, `pre-reset Q5 set: got ${b8(qbits())}`);
st.wd = 1; st.r = 1; solve();                        // WD=1,R=1 → clear all
assert(qbits() === 0, `final master reset: got ${b8(qbits())}`);

console.log(`cd4099-addressable-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
