// ── 74x1821 10-bit bus-interface D flip-flop regression ──────────────────────
// The 74x1821 (js/chips/chips50.js) is the plain 10-bit member of the F-series
// bus-interface family: ten D-type flip-flops on one common clock (CP) with an
// active-LOW 3-state output enable (OEn). No clear, no clock enable. It rides the
// BUS_FF_10BIT_TRI engine primitive — the same function as the 74F821. This
// scenario guards the DB entry: the corrected pin map (OEn=1, D0-D9=2-11, CLK=13,
// Q9-Q0=14-23 — the stub had CLK on pin 2 and a data bit on pin 13), the
// non-inverting rising-edge capture (Q=D), plain hold between edges, and 3-state
// output control.
//
// BUS_FF_10BIT_TRI contract (js/specificChipsSim.js):
//   inputs:  [OEn, CLK, D0..D9]   (OEn active LOW)
//   outputs: [Q0..Q9]             rising-edge capture, Q = D
//
// Function table (74F821, Fairchild DS009595, verified pages 1-2):
//   OEn CLK  D | Q
//    L   ↑   H | H     (load D on the LOW-to-HIGH edge)
//    L   H/L X | hold  (no edge → hold)
//    H   X   X | Z     (output disabled, FF state kept)
//
// Run:  node js/debug/scenarios/74x1821-10bit-dff.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x1821');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Register state lives on the persistent chip component, not the wires, so a
// fresh WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x1821 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn', st.oen ? 1 : 0);
  wirePin('CLK', st.clk ? 1 : 0);
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

// Full input picture is driven every solve. Defaults: outputs enabled (OEn low),
// clock low.
const st = { oen: 0, clk: 0, d: [0,0,0,0,0,0,0,0,0,0] };
const solve = () => apply(st);

function setD(pattern10) { for (let i = 0; i < 10; i++) st.d[i] = (pattern10 >> i) & 1; }
function load(pattern10) {
  setD(pattern10);
  st.clk = 0; solve();   // present data, clock low
  st.clk = 1; solve();   // rising edge captures all ten bits
}

// ── 1. Non-inverting parallel load on the rising edge (Q = D) ────────────────
load(0b1010101010);
assert(qbits() === 0b1010101010, `load 1010101010: got ${bin10(qbits())}`);

// 10th bit (D9/Q9) specifically — the bit the stub's wrong pinout mis-placed.
load(0b1000000000);
assert(qbits() === 0b1000000000, `load bit9 only: got ${bin10(qbits())}`);

// Full width, then all-zero to prove every bit tracks independently.
load(0b1111111111);
assert(qbits() === 0b1111111111, `load all ones: got ${bin10(qbits())}`);
load(0b0000000000);
assert(qbits() === 0, `load all zeros: got ${bin10(qbits())}`);

// ── 2. Hold between edges: no rising edge → outputs unchanged ─────────────────
load(0b0011110000);
assert(qbits() === 0b0011110000, `preload: got ${bin10(qbits())}`);
setD(0b1111111111);
solve();                 // change D while clock stays high — no edge
assert(qbits() === 0b0011110000, `no edge should hold, got ${bin10(qbits())}`);
st.clk = 0; solve();     // clock falls — still no rising edge
assert(qbits() === 0b0011110000, `falling edge should hold, got ${bin10(qbits())}`);
st.clk = 1; solve();     // now a genuine rising edge loads the new data
assert(qbits() === 0b1111111111, `rising edge reload: got ${bin10(qbits())}`);

// ── 3. Output enable: OEn HIGH → 3-state (not HIGH), state preserved ──────────
st.oen = 1; solve();
assert(!isHigh(read('Q0')), `OEn high: Q0 should be high-impedance, not HIGH`);
assert(!isHigh(read('Q9')), `OEn high: Q9 should be high-impedance, not HIGH`);
st.oen = 0; solve();     // re-enable outputs, no clock edge
assert(qbits() === 0b1111111111, `OEn low: stored state should reappear, got ${bin10(qbits())}`);

if (failures.length) {
  console.error(`74x1821: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x1821: PASS — non-inverting load, hold-between-edges, 3-state output all correct');
