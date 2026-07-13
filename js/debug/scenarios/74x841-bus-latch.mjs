// ── 74x841 10-bit bus-interface D-type latch (3-STATE) — regression ──────────
// The 74x841 (js/chips/chips41.js) is ten TRANSPARENT D-type latches with a
// common latch-enable (LE) and a common active-LOW output enable (OEn), true
// outputs. It is level-controlled, NOT edge-triggered — the key difference from
// the 74x821 flip-flop. It rides the width-agnostic D_LATCH_REG_TRI primitive.
//
// D_LATCH_REG_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D9, LE, OEn]      (OEn active LOW)
//   outputs: [Q0..Q9]              non-inverting
//   LE=1  → transparent, Q follows D
//   LE=0  → latched, Q holds the last value
//   OEn=0 → outputs driven; OEn=1 → Hi-Z; OEn does NOT change stored state.
//
// Pinout + function verified against TI SN74ALS841 (SDAS059C, rev. Jan 1995)
// TOP-VIEW terminal diagram + Function Table, read as PDF page images:
// OEn=1, 1D..10D=2..11, GND=12, LE=13, 10Q..1Q=14..23, VCC=24. Q pins wired
// 0-indexed (D0/Q0 = bit 0 = pin 2 / pin 23).
//
// Checks:
//   1. LE HIGH is transparent: Q follows D as D changes (level, not edge).
//   2. LE HIGH→LOW captures the current word; changing D while LE=0 holds Q.
//   3. Re-opening LE (HIGH) makes it transparent again.
//   4. OE HIGH forces all ten outputs Hi-Z; the stored word is untouched.
//   5. Data can still be latched while OE is HIGH (OE doesn't gate the latch);
//      re-enabling OE shows the word captured while the outputs were off.
//
// Run:  node js/debug/scenarios/74x841-bus-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x841');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Latch state lives on the (persistent) chip component, so a fresh WireManager
// per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x841 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('LE',  st.le ? 1 : 0);
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

const st = { le: 0, oe: 0, d: 0 };
const solve = () => apply(st);

// ── 1. LE HIGH is transparent: Q tracks D as it changes ──────────────────────
st.oe = 0; st.le = 1;
st.d = 0b1010110010; solve();
assert(qbits() === 0b1010110010, `transparent: got ${b10(qbits())}`);
st.d = 0b0101001101; solve();   // still transparent — Q must follow, no edge needed
assert(qbits() === 0b0101001101, `transparent tracks new D: got ${b10(qbits())}`);

// ── 2. LE HIGH→LOW captures; changing D while latched holds Q ────────────────
st.le = 0; solve();             // capture current word (0101001101)
const held = qbits();
assert(held === 0b0101001101, `capture on LE fall: got ${b10(held)}`);
st.d = 0b1111111111; solve();   // change data while latched → must hold
assert(qbits() === held, `latched hold: want ${b10(held)}, got ${b10(qbits())}`);

// ── 3. Re-opening LE makes it transparent again ──────────────────────────────
st.le = 1; solve();
assert(qbits() === 0b1111111111, `re-open transparent: got ${b10(qbits())}`);

// ── 4. OE HIGH → all ten outputs Hi-Z, stored word untouched ─────────────────
st.d = 0b1100110011; solve();   // latch this word while transparent
st.le = 0; solve();             // hold it
const stored = qbits();
st.oe = 1; solve();
for (let i = 0; i < 10; i++) assert(isHiZ(i), `OE high: Q${i} should be Hi-Z`);
st.oe = 0; solve();             // re-enable, no LE change
assert(qbits() === stored, `OE does not disturb state: want ${b10(stored)}, got ${b10(qbits())}`);

// ── 5. Latch can capture new data while OE is HIGH (OE doesn't gate the latch)
st.oe = 1;                      // outputs off
st.le = 1; st.d = 0b0011001100; solve();   // transparent capture with outputs off
st.le = 0; solve();             // hold the new word
st.oe = 0; solve();             // now show it — no re-latch
assert(qbits() === 0b0011001100, `latched while OE off: got ${b10(qbits())}`);

console.log(`74x841-bus-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
