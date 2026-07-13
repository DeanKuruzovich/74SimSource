// ── 74x843 9-bit transparent D latch regression ──────────────────────────────
// The 74x843 (js/chips/chips41.js) is a 9-bit bus-interface transparent D latch
// with an asynchronous active-LOW preset (PREn), an asynchronous active-LOW
// clear (CLRn) and active-LOW 3-state output control (OEn). Data capture is
// LEVEL-sensitive on LE (transparent while HIGH, held on the falling level) —
// it is NOT an edge-triggered flip-flop. It rides the LATCH_9BIT_PRE_CLR_TRI
// engine primitive. This scenario guards the DB entry against the corrected TI
// SN74ALS843 pin map (OEn=1, D0-D8=2-10, CLRn=11, LE=13, PREn=14, Q8-Q0=15-23).
//
// LATCH_9BIT_PRE_CLR_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D8, LE, OEn, CLRn, PREn]   (OEn/CLRn/PREn all active LOW)
//   outputs: [Q0..Q8]                        non-inverting
//
// Function table (SN74ALS843, verified against the datasheet):
//   PRE CLR OE LE  D | Q
//    L   X  L  X   X | H     (async preset dominates)
//    H   L  L  X   X | L     (async clear)
//    H   H  L  H   D | D     (LE high: transparent, Q follows D)
//    H   H  L  L   X | Q0    (LE low: hold last data)
//    X   X  H  X   X | Z     (output disabled, latch state kept)
//
// Run:  node js/debug/scenarios/74x843-9bit-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x843');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Latch state lives on the persistent chip component, not the wires, so a fresh
// WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x843 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn',  st.oen ? 1 : 0);
  wirePin('CLRn', st.clrn ? 1 : 0);
  wirePin('PREn', st.pren ? 1 : 0);
  wirePin('LE',   st.le ? 1 : 0);
  for (let i = 0; i < 9; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 9; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};
const bin9 = (v) => v.toString(2).padStart(9, '0');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Defaults: outputs enabled (OEn low), not presetting/clearing, latch open (LE high).
const st = { oen: 0, clrn: 1, pren: 1, le: 1, d: [0,0,0,0,0,0,0,0,0] };
const solve = () => apply(st);
function setD(pattern9) { for (let i = 0; i < 9; i++) st.d[i] = (pattern9 >> i) & 1; }

// ── 0. Transparent: while LE HIGH, Q tracks D live (no edge needed) ──────────
setD(0b101010101); st.le = 1; solve();
assert(qbits() === 0b101010101, `transparent follow: got ${bin9(qbits())}`);
setD(0b010101010); solve();     // change D with LE still high → Q must change too
assert(qbits() === 0b010101010, `transparent tracks new D: got ${bin9(qbits())}`);

// 9th bit (D8/Q8) specifically — the bit that makes this a 9-bit part.
setD(0b100000000); solve();
assert(qbits() === 0b100000000, `transparent bit8 only: got ${bin9(qbits())}`);

// ── 1. Hold: capture on the falling level, then D changes are ignored ────────
setD(0b000111000); st.le = 1; solve();   // latch open, load pattern
assert(qbits() === 0b000111000, `preload: got ${bin9(qbits())}`);
st.le = 0; solve();                        // close latch
setD(0b111111111); solve();                // D moves while held → Q must not
assert(qbits() === 0b000111000, `LE low holds through D change: got ${bin9(qbits())}`);
st.le = 1; solve();                        // reopen → now Q follows the new D
assert(qbits() === 0b111111111, `LE high reopens transparent: got ${bin9(qbits())}`);

// ── 2. Asynchronous active-LOW CLEAR forces all nine Q to 0, ignores LE ──────
st.le = 0; setD(0b111111111); solve();     // hold something nonzero, latch closed
st.clrn = 0; solve();                       // clear asserted while held
assert(qbits() === 0, `async clear ignores LE: got ${bin9(qbits())}`);
st.clrn = 1; solve();

// ── 3. Asynchronous active-LOW PRESET forces all nine Q to 1, ignores LE ─────
st.le = 0; setD(0b000000000); solve();
st.pren = 0; solve();
assert(qbits() === 0b111111111, `async preset ignores LE: got ${bin9(qbits())}`);

// ── 4. Preset dominates clear when both asserted ─────────────────────────────
st.clrn = 0; st.pren = 0; solve();          // both active-low asserted at once
assert(qbits() === 0b111111111, `preset dominates clear: got ${bin9(qbits())}`);
st.clrn = 1; st.pren = 1; solve();

// ── 5. Output enable: OEn HIGH → 3-state (not HIGH), latch state preserved ────
setD(0b110011001); st.le = 1; solve();
assert(qbits() === 0b110011001, `preload for OEn test: got ${bin9(qbits())}`);
st.le = 0; st.oen = 1; solve();
assert(!isHigh(read('Q0')), `OEn high: Q0 should be high-impedance, not HIGH`);
assert(!isHigh(read('Q8')), `OEn high: Q8 should be high-impedance, not HIGH`);
st.oen = 0; solve();                        // re-enable outputs, latch untouched
assert(qbits() === 0b110011001, `OEn low: stored state should reappear, got ${bin9(qbits())}`);

if (failures.length) {
  console.error(`74x843: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x843: PASS — transparent follow, hold, async clear, async preset (dominates), 3-state output all correct');
