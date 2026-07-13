// ── 74x845 8-bit bus-interface transparent D latch regression ────────────────
// The 74x845 (js/chips/chips41.js) is the 8-bit sibling of the 74x843: a
// bus-interface transparent D latch with an asynchronous active-LOW preset
// (PREn), an asynchronous active-LOW clear (CLRn), and THREE independent
// active-LOW output-control pins (OC1, OC2, OC3). Data capture is LEVEL-
// sensitive on LE (transparent while HIGH, held on the falling level) — the
// original stub wrongly called this an edge-triggered flip-flop with a CLK.
// It rides the LATCH_8BIT_PRE_CLR_OC3_TRI engine primitive. This scenario
// guards the DB entry against the corrected TI databook pin map
// (OC1=1, OC2=2, D0-D7=3-10, CLRn=11, LE=13, PREn=14, Q7-Q0=15-22, OC3=23).
//
// LATCH_8BIT_PRE_CLR_OC3_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D7, LE, OC1, OC2, OC3, CLRn, PREn]  (all controls active LOW)
//   outputs: [Q0..Q7]                                 non-inverting
//
// Function table (SN74ALS845, verified against the TI ALS/AS databook):
//   PRE CLR OC1 OC2 OC3 C  D | Q
//    L   H   L   L   L  X  X | H     (async preset dominates)
//    H   L   L   L   L  X  X | L     (async clear)
//    L   L   L   L   L  X  X | H     (both low → preset condition)
//    H   H   L   L   L  H  D | D     (C high: transparent, Q follows D)
//    H   H   L   L   L  L  X | Q0    (C low: hold last data)
//    X   X   H   X   X  X  X | Z     (any output control high → 3-state)
//
// Run:  node js/debug/scenarios/74x845-8bit-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x845');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Latch state lives on the persistent chip component, not the wires, so a fresh
// WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x845 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OC1', st.oc1 ? 1 : 0);
  wirePin('OC2', st.oc2 ? 1 : 0);
  wirePin('OC3', st.oc3 ? 1 : 0);
  wirePin('CLRn', st.clrn ? 1 : 0);
  wirePin('PREn', st.pren ? 1 : 0);
  wirePin('LE',   st.le ? 1 : 0);
  for (let i = 0; i < 8; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};
const bin8 = (v) => v.toString(2).padStart(8, '0');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Defaults: outputs enabled (all OC low), not presetting/clearing, latch open.
const st = { oc1: 0, oc2: 0, oc3: 0, clrn: 1, pren: 1, le: 1, d: [0,0,0,0,0,0,0,0] };
const solve = () => apply(st);
function setD(pattern8) { for (let i = 0; i < 8; i++) st.d[i] = (pattern8 >> i) & 1; }

// ── 0. Transparent: while LE HIGH, Q tracks D live (no edge needed) ──────────
setD(0b10101010); st.le = 1; solve();
assert(qbits() === 0b10101010, `transparent follow: got ${bin8(qbits())}`);
setD(0b01010101); solve();     // change D with LE still high → Q must change too
assert(qbits() === 0b01010101, `transparent tracks new D: got ${bin8(qbits())}`);

// Top bit (D7/Q7) specifically.
setD(0b10000000); solve();
assert(qbits() === 0b10000000, `transparent bit7 only: got ${bin8(qbits())}`);

// ── 1. Hold: capture on the falling level, then D changes are ignored ────────
setD(0b00111000); st.le = 1; solve();   // latch open, load pattern
assert(qbits() === 0b00111000, `preload: got ${bin8(qbits())}`);
st.le = 0; solve();                        // close latch
setD(0b11111111); solve();                // D moves while held → Q must not
assert(qbits() === 0b00111000, `LE low holds through D change: got ${bin8(qbits())}`);
st.le = 1; solve();                        // reopen → now Q follows the new D
assert(qbits() === 0b11111111, `LE high reopens transparent: got ${bin8(qbits())}`);

// ── 2. Asynchronous active-LOW CLEAR forces all eight Q to 0, ignores LE ─────
st.le = 0; setD(0b11111111); solve();      // hold something nonzero, latch closed
st.clrn = 0; solve();                       // clear asserted while held
assert(qbits() === 0, `async clear ignores LE: got ${bin8(qbits())}`);
st.clrn = 1; solve();

// ── 3. Asynchronous active-LOW PRESET forces all eight Q to 1, ignores LE ────
st.le = 0; setD(0b00000000); solve();
st.pren = 0; solve();
assert(qbits() === 0b11111111, `async preset ignores LE: got ${bin8(qbits())}`);

// ── 4. Preset dominates clear when both asserted ─────────────────────────────
st.clrn = 0; st.pren = 0; solve();          // both active-low asserted at once
assert(qbits() === 0b11111111, `preset dominates clear: got ${bin8(qbits())}`);
st.clrn = 1; st.pren = 1; solve();

// ── 5. Each output control alone forces 3-state (not HIGH); state preserved ───
setD(0b11001100); st.le = 1; solve();
assert(qbits() === 0b11001100, `preload for OC test: got ${bin8(qbits())}`);
st.le = 0;                                   // freeze the value
for (const which of ['oc1', 'oc2', 'oc3']) {
  st.oc1 = st.oc2 = st.oc3 = 0;              // all enabled...
  st[which] = 1;                             // ...except one
  solve();
  assert(!isHigh(read('Q0')), `${which} high: Q0 should be high-impedance, not HIGH`);
  assert(!isHigh(read('Q7')), `${which} high: Q7 should be high-impedance, not HIGH`);
}
st.oc1 = st.oc2 = st.oc3 = 0; solve();       // re-enable outputs, latch untouched
assert(qbits() === 0b11001100, `all OC low: stored state should reappear, got ${bin8(qbits())}`);

if (failures.length) {
  console.error(`74x845: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x845: PASS — transparent follow, hold, async clear, async preset (dominates), 3× output-control 3-state all correct');
