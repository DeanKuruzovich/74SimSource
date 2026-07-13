// ── 74x1841 10-bit bus-interface transparent latch regression ────────────────
// The 74x1841 (js/chips/chips50.js) is a 10-bit non-inverting D-type transparent
// latch with 3-state outputs and no clear. It is the series-damped variant of the
// '841; the base '841 datasheet is authoritative for pinout and function. It rides
// the LATCH_TRANS_TRI engine primitive. This scenario guards the DB entry: the
// corrected pin map (OEn=1, D0-D9=2-11, LE=13, Q9-Q0=14-23), transparent tracking
// while LE is HIGH, hold when LE falls LOW, and 3-state output control.
//
// LATCH_TRANS_TRI contract (js/specificChipsSim.js):
//   inputs:  [OEn, LE, D0..D9]     outputs: [Q0..Q9]
//
// Function table (SN74ALS841, TI SDAS059C, page 2, verified as PDF page image):
//   OEn LE  D | Q
//    L   H  H | H     (transparent: Q follows D)
//    L   H  L | L
//    L   L  X | Q0    (latched: hold last sampled word)
//    H   X  X | Z     (output disabled, latch state kept)
//
// Run:  node js/debug/scenarios/74x1841-10bit-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x1841');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Latch state lives on the persistent chip component, not the wires, so a fresh
// WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x1841 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn', st.oen ? 1 : 0);
  wirePin('LE',  st.le  ? 1 : 0);
  for (let i = 0; i < 10; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 10; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};
const bin10 = (v) => v.toString(2).padStart(10, '0');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Defaults: outputs enabled (OEn low), latch transparent (LE high).
const st = { oen: 0, le: 1, d: new Array(10).fill(0) };
const solve = () => apply(st);
function setD(pattern10) { for (let i = 0; i < 10; i++) st.d[i] = (pattern10 >> i) & 1; }

// ── 1. Transparent: with LE HIGH, Q follows D directly ───────────────────────
setD(0b1010101010); solve();
assert(qbits() === 0b1010101010, `transparent 1010101010: got ${bin10(qbits())}`);
setD(0b0101010101); solve();
assert(qbits() === 0b0101010101, `transparent tracks change: got ${bin10(qbits())}`);

// 10th bit (D9/Q9) specifically — the extra bit that makes this a 10-bit part
setD(0b1000000000); solve();
assert(qbits() === 0b1000000000, `transparent bit9 only: got ${bin10(qbits())}`);

// ── 2. Hold: drop LE LOW and the outputs freeze at the last value ────────────
setD(0b1100110011); solve();          // present a word while transparent
assert(qbits() === 0b1100110011, `preload: got ${bin10(qbits())}`);
st.le = 0; solve();                   // close the latch
setD(0b0011001100); solve();          // D changes are now ignored
assert(qbits() === 0b1100110011, `LE low should hold, got ${bin10(qbits())}`);
st.le = 1; solve();                   // reopen: outputs track the new D
assert(qbits() === 0b0011001100, `LE high should re-track, got ${bin10(qbits())}`);

// ── 3. Output enable: OEn HIGH → 3-state (not HIGH), stored state preserved ───
setD(0b1111111111); solve();
st.le = 0; solve();                   // latch the all-ones word
st.oen = 1; solve();
assert(!isHigh(read('Q0')), `OEn high: Q0 should be high-impedance, not HIGH`);
assert(!isHigh(read('Q9')), `OEn high: Q9 should be high-impedance, not HIGH`);
st.oen = 0; solve();                  // re-enable; held word reappears without LE
assert(qbits() === 0b1111111111, `OEn low: stored state should reappear, got ${bin10(qbits())}`);

if (failures.length) {
  console.error(`74x1841: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x1841: PASS — transparent tracking, LE hold, 3-state output all correct');
