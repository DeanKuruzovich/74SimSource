// ── 74x992 9-bit transparent read-back latch regression ─────────────────────
// The 74x992 (js/chips/chips46.js) is a 9-bit bus-interface transparent D latch
// with an asynchronous active-LOW clear (CLRn) and TWO independent active-LOW
// 3-state controls: OEQ gates the true Q outputs, OERB gates a read-back path
// that drives the stored word back onto the shared, bidirectional D bus. Data
// capture is LEVEL-sensitive on LE (transparent while HIGH, held while LOW) — it
// is NOT edge-triggered. It rides the LATCH_9BIT_READBACK_TRI engine primitive.
// This guards the DB entry against the corrected TI SN74ALS992 pin map
// (OERB=1, D0-D8=2-10, CLR=11, LE=13, OEQ=14, Q8-Q0=15-23) — the hand-entered
// stub had CLR/LE/OEQ in the wrong places and invented NC pins on 22/23.
//
// LATCH_9BIT_READBACK_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D8, LE, OEQn, OERBn, CLRn]  (all controls active LOW)
//   outputs: [Q0..Q8, D0..D8]  (D repeated: the read-back drive onto the bus)
//
// Function table (SN74ALS992, verified against the datasheet):
//   CLR OEQ OERB LE  D | Q      D pins
//    L   X   X   X  X | L        (async clear -> 0)
//    H   L   H   H  d | d        (LE high: transparent, Q follows D)
//    H   L   H   L  X | Q0       (LE low: hold)
//    H   H   X   X  X | Z        Q disabled (state kept)
//    H   X   L   X  X | -        stored word driven back onto D pins
//
// Run:  node js/debug/scenarios/74x992-9bit-readback-latch.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x992');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every wired input pin held at a rail level (1 = VCC, 0 = GND).
// When st.driveD is false the nine D pins are left unwired so the chip can source
// them during read-back. Latch state lives on the persistent chip component.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x992 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEQn',  st.oeqn ? 1 : 0);
  wirePin('OERBn', st.oerbn ? 1 : 0);
  wirePin('CLRn',  st.clrn ? 1 : 0);
  wirePin('LE',    st.le ? 1 : 0);
  if (st.driveD !== false) {
    for (let i = 0; i < 9; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const wordFrom = (prefix) => {
  let v = 0;
  for (let i = 0; i < 9; i++) if (isHigh(read(`${prefix}${i}`))) v |= (1 << i);
  return v;
};
const qbits = () => wordFrom('Q');
const dbits = () => wordFrom('D');
const bin9 = (v) => v.toString(2).padStart(9, '0');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Defaults: Q enabled (OEQ low), read-back OFF (OERB high), not clearing, open.
const st = { oeqn: 0, oerbn: 1, clrn: 1, le: 1, driveD: true, d: [0,0,0,0,0,0,0,0,0] };
const solve = () => apply(st);
function setD(pattern9) { for (let i = 0; i < 9; i++) st.d[i] = (pattern9 >> i) & 1; }

// ── 0. Transparent: while LE HIGH, Q tracks D live (no edge needed) ──────────
setD(0b101010101); st.le = 1; solve();
assert(qbits() === 0b101010101, `transparent follow: got ${bin9(qbits())}`);
setD(0b010101010); solve();
assert(qbits() === 0b010101010, `transparent tracks new D: got ${bin9(qbits())}`);

// 9th bit (D8/Q8) specifically — the bit that makes this a 9-bit part.
setD(0b100000000); solve();
assert(qbits() === 0b100000000, `transparent bit8 only: got ${bin9(qbits())}`);

// ── 1. Hold: while LE LOW, D changes are ignored ─────────────────────────────
setD(0b000111000); st.le = 1; solve();
assert(qbits() === 0b000111000, `preload: got ${bin9(qbits())}`);
st.le = 0; solve();
setD(0b111111111); solve();
assert(qbits() === 0b000111000, `LE low holds through D change: got ${bin9(qbits())}`);
st.le = 1; solve();
assert(qbits() === 0b111111111, `LE high reopens transparent: got ${bin9(qbits())}`);

// ── 2. Asynchronous active-LOW CLEAR forces all nine Q to 0, ignores LE ──────
st.le = 0; setD(0b111111111); solve();
st.clrn = 0; solve();
assert(qbits() === 0, `async clear ignores LE: got ${bin9(qbits())}`);
st.clrn = 1; solve();

// ── 3. OEQ: HIGH → Q 3-state (not HIGH), latch state preserved ───────────────
setD(0b110011001); st.le = 1; solve();
assert(qbits() === 0b110011001, `preload for OEQ test: got ${bin9(qbits())}`);
st.le = 0; st.oeqn = 1; solve();
assert(!isHigh(read('Q0')), `OEQ high: Q0 should be high-impedance, not HIGH`);
assert(!isHigh(read('Q8')), `OEQ high: Q8 should be high-impedance, not HIGH`);
st.oeqn = 0; solve();
assert(qbits() === 0b110011001, `OEQ low: stored state should reappear, got ${bin9(qbits())}`);

// ── 4. Read-back: OERB LOW drives the stored word back onto the D pins ───────
// Load a known word, close the latch, stop driving D externally, enable OERB.
setD(0b101100110); st.le = 1; st.driveD = true; solve();
assert(qbits() === 0b101100110, `preload for read-back: got ${bin9(qbits())}`);
st.le = 0; solve();                       // hold it
st.driveD = false; st.oerbn = 0; solve(); // release D bus, turn read-back on
assert(dbits() === 0b101100110, `read-back drives stored word onto D: got ${bin9(dbits())}`);
// Q outputs can be disabled independently while read-back still drives D.
st.oeqn = 1; solve();
assert(dbits() === 0b101100110, `read-back independent of OEQ: got ${bin9(dbits())}`);
assert(!isHigh(read('Q3')), `OEQ high during read-back: Q3 should be high-impedance`);
// Turning read-back off releases the D pins (chip stops driving them).
st.oerbn = 1; solve();
assert(!isHigh(read('D0')), `OERB high releases D0 (chip should not drive it)`);
assert(!isHigh(read('D8')), `OERB high releases D8 (chip should not drive it)`);

if (failures.length) {
  console.error(`74x992: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x992: PASS — transparent follow, hold, async clear, OEQ 3-state, and read-back onto the bidirectional D bus all correct');
