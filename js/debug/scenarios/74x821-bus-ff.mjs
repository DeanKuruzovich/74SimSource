// ── 74x821 10-bit bus interface flip-flop (3-STATE) — regression ─────────────
// The 74x821 (js/chips/chips40.js) is ten D-type edge-triggered flip-flops with
// a common clock (CP) and a common active-LOW output enable (OE), true outputs.
// It rides the width-agnostic D_FF_REG_TRI engine primitive.
//
// D_FF_REG_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D9, CLK, OEn]      (OEn active LOW)
//   outputs: [Q0..Q9]                rising-edge parallel capture, non-inverting
//   OEn=0 → outputs driven; OEn=1 → Hi-Z; OEn does NOT change stored state.
//
// Pinout verified against Fairchild 74F821 (DS009595, rev. Oct 2000) Connection
// Diagram + Function Table, read as PDF page images: OE=1, D0..D9=2..11, GND=12,
// CP=13, O9..O0=14..23, VCC=24. The chip's Q pins are wired 0-indexed.
//
// Method: place ONE 74x821 and keep the same chip + sim instance for the whole
// run so the register state persists. Data is a 10-bit word.
//
// Checks:
//   1. Rising-edge parallel capture of a 10-bit pattern (non-inverting).
//   2. Falling edge holds; the next rising edge captures the new word.
//   3. Data changing while CP stays HIGH must not change Q (edge-only).
//   4. OE HIGH forces all ten outputs Hi-Z; the stored word is untouched
//      (re-enabling OE brings the same word back with no re-clock).
//
// Run:  node js/debug/scenarios/74x821-bus-ff.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x821');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Register state lives on the (persistent) chip component, not the wires, so a
// fresh WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x821 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk ? 1 : 0);
  wirePin('OEn', st.oe ? 1 : 0);
  for (let i = 0; i < 10; i++) wirePin(`D${i}`, (st.d >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(`Q${name}`) === DRIVE.HIGH_Z;
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 10; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const b10 = (n) => n.toString(2).padStart(10, '0');

// Full input picture every solve. OE held LOW = outputs enabled.
const st = { clk: 0, oe: 0, d: 0 };
const solve = () => apply(st);

// Load a 10-bit word: present D, then a rising CP edge captures it.
function load(word) {
  st.d = word;
  st.clk = 0; solve();   // setup data, clock low
  st.clk = 1; solve();   // rising edge → capture all ten bits at once
}

// ── 1. Rising-edge parallel capture, non-inverting ───────────────────────────
load(0b1010110010);
assert(qbits() === 0b1010110010, `load: got ${b10(qbits())}`);

// ── 2. Falling edge holds; next rising edge captures the new word ────────────
st.d = 0b0101001101;
st.clk = 0; solve();   // drop clock only — no capture
assert(qbits() === 0b1010110010, `falling edge must hold, got ${b10(qbits())}`);
st.clk = 1; solve();   // rising edge captures new word
assert(qbits() === 0b0101001101, `rising capture: got ${b10(qbits())}`);

// ── 3. Data changing while CP stays HIGH must NOT change Q (edge-only) ────────
const before = qbits();                 // 0101001101
st.d = 0b1111111111; solve();           // clock still HIGH, data changed → hold
assert(qbits() === before, `level-change while CP high must hold ${b10(before)}, got ${b10(qbits())}`);

// ── 4. OE HIGH → all ten outputs Hi-Z, stored word untouched ─────────────────
st.oe = 1; solve();
for (let i = 0; i < 10; i++) assert(isHiZ(i), `OE high: Q${i} should be Hi-Z`);
// Re-enable without re-clocking: the held word (before) must reappear intact.
st.oe = 0; solve();
assert(qbits() === before, `OE does not disturb state: want ${b10(before)}, got ${b10(qbits())}`);

// ── 5. All-ones then all-zeros full-rail toggle ──────────────────────────────
load(0b1111111111);
assert(qbits() === 0b1111111111, `load all-ones: got ${b10(qbits())}`);
load(0b0000000000);
assert(qbits() === 0b0000000000, `load all-zeros: got ${b10(qbits())}`);

console.log(`74x821-bus-ff: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
