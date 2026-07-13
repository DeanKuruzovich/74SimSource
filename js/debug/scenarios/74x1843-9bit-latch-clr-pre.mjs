// ── 74x1843 9-bit transparent D latch (clear + preset) regression ────────────
// The 74x1843 (js/chips/chips50.js) is the balanced/series-damped output variant
// (IDT/Cypress FCT1843) of the JEDEC-standard 843: a 9-bit bus-interface
// transparent D latch with an asynchronous active-LOW preset (PREn), an
// asynchronous active-LOW clear (CLRn) and active-LOW 3-state output control
// (OEn). Data capture is LEVEL-sensitive on LE (transparent while HIGH, held on
// the falling level) — NOT an edge-triggered flip-flop. It reuses the same
// LATCH_9BIT_PRE_CLR_TRI engine primitive as the 74x843.
//
// The stub this replaced had a WRONG hand-entered pinout (LE=2, CLR=3, D0..D8
// shifted to 4-13, PRE omitted, pin 23 marked NC). This scenario guards the
// corrected pin map from the Fairchild 74ACT843 datasheet (DS009800):
//   OEn=1, D0-D8=2-10, CLRn=11, GND=12, LE=13, PREn=14, Q8-Q0=15-23, VCC=24.
//
// Function table (74ACT843, verified against the datasheet page images):
//   PRE CLR OE LE  D | Q
//    L   X  L  X   X | H     (async preset dominates)
//    H   L  L  X   X | L     (async clear)
//    H   H  L  H   D | D     (LE high: transparent, Q follows D)
//    H   H  L  L   X | Q0    (LE low: hold last data)
//    X   X  H  X   X | Z     (output disabled, latch state kept)
//
// Run:  node js/debug/scenarios/74x1843-9bit-latch-clr-pre.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x1843');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x1843 has no pin named ${name}`);
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

const st = { oen: 0, clrn: 1, pren: 1, le: 1, d: [0,0,0,0,0,0,0,0,0] };
const solve = () => apply(st);
function setD(pattern9) { for (let i = 0; i < 9; i++) st.d[i] = (pattern9 >> i) & 1; }

// ── 0. Transparent: while LE HIGH, Q tracks D live ───────────────────────────
setD(0b101010101); st.le = 1; solve();
assert(qbits() === 0b101010101, `transparent follow: got ${bin9(qbits())}`);
setD(0b010101010); solve();
assert(qbits() === 0b010101010, `transparent tracks new D: got ${bin9(qbits())}`);
setD(0b100000000); solve();          // the 9th bit specifically (D8/Q8)
assert(qbits() === 0b100000000, `transparent bit8 only: got ${bin9(qbits())}`);

// ── 1. Hold on the falling level, then ignore D ──────────────────────────────
setD(0b000111000); st.le = 1; solve();
assert(qbits() === 0b000111000, `preload: got ${bin9(qbits())}`);
st.le = 0; solve();
setD(0b111111111); solve();
assert(qbits() === 0b000111000, `LE low holds through D change: got ${bin9(qbits())}`);
st.le = 1; solve();
assert(qbits() === 0b111111111, `LE high reopens transparent: got ${bin9(qbits())}`);

// ── 2. Async CLEAR forces all nine Q to 0, ignores LE ────────────────────────
st.le = 0; setD(0b111111111); solve();
st.clrn = 0; solve();
assert(qbits() === 0, `async clear ignores LE: got ${bin9(qbits())}`);
st.clrn = 1; solve();

// ── 3. Async PRESET forces all nine Q to 1, ignores LE ───────────────────────
st.le = 0; setD(0b000000000); solve();
st.pren = 0; solve();
assert(qbits() === 0b111111111, `async preset ignores LE: got ${bin9(qbits())}`);

// ── 4. Preset dominates clear when both asserted ─────────────────────────────
st.clrn = 0; st.pren = 0; solve();
assert(qbits() === 0b111111111, `preset dominates clear: got ${bin9(qbits())}`);
st.clrn = 1; st.pren = 1; solve();

// ── 5. OEn HIGH → 3-state (not HIGH), latch state preserved ──────────────────
setD(0b110011001); st.le = 1; solve();
assert(qbits() === 0b110011001, `preload for OEn test: got ${bin9(qbits())}`);
st.le = 0; st.oen = 1; solve();
assert(!isHigh(read('Q0')), `OEn high: Q0 should be high-impedance, not HIGH`);
assert(!isHigh(read('Q8')), `OEn high: Q8 should be high-impedance, not HIGH`);
st.oen = 0; solve();
assert(qbits() === 0b110011001, `OEn low: stored state should reappear, got ${bin9(qbits())}`);

if (failures.length) {
  console.error(`74x1843: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x1843: PASS — transparent follow, hold, async clear, async preset (dominates), 3-state output all correct');
