// ── 74x823 9-bit bus-interface D flip-flop regression ────────────────────────
// The 74x823 (js/chips/chips40.js) is a 9-bit D-type register with an
// asynchronous active-LOW clear (CLRn), an active-LOW clock enable (CEN, the
// datasheet's CLKENn) and active-LOW 3-state output control (OEn). It rides the
// D_FF_9BIT_CLR_CE_TRI engine primitive. This scenario guards the DB entry: the
// corrected TI SN74AS823A pin map (OEn=1, D0-D8=2-10, CLRn=11, CLK=13, CEN=14,
// Q8-Q0=15-23), non-inverting rising-edge capture (Q=D), the active-LOW clock
// enable hold, the asynchronous clear, and 3-state output control.
//
// D_FF_9BIT_CLR_CE_TRI contract (js/specificChipsSim.js):
//   inputs:  [OEn, CLRn, CEN, CLK, D0..D8]   (OEn/CLRn/CEN all active LOW)
//   outputs: [Q0..Q8]                        rising-edge capture when CEN LOW
//
// Function table (SN74AS823A, verified against the datasheet):
//   OEn CLRn CEN CLK  D | Q
//    L   L    X   X   X | L     (async clear dominates)
//    L   H    L   ↑   H | H     (CEN low: load D on rising edge)
//    L   H    H   X   X | hold  (CEN high: clock disabled)
//    H   X    X   X   X | Z     (output disabled, FF state kept)
//
// Run:  node js/debug/scenarios/74x823-9bit-dff.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x823');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Register state lives on the persistent chip component, not the wires, so a
// fresh WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x823 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn',  st.oen ? 1 : 0);
  wirePin('CLRn', st.clrn ? 1 : 0);
  wirePin('CEN',  st.cen ? 1 : 0);
  wirePin('CLK',  st.clk ? 1 : 0);
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

// Full input picture is driven every solve. Defaults: outputs enabled (OEn low),
// not clearing (CLRn high), clock enabled (CEN low), clock low.
const st = { oen: 0, clrn: 1, cen: 0, clk: 0, d: [0,0,0,0,0,0,0,0,0] };
const solve = () => apply(st);

function setD(pattern9) { for (let i = 0; i < 9; i++) st.d[i] = (pattern9 >> i) & 1; }
function load(pattern9) {
  setD(pattern9);
  st.clk = 0; solve();   // present data, clock low
  st.clk = 1; solve();   // rising edge captures all nine bits
}

// ── 0. Asynchronous active-LOW CLEAR forces all nine Q to 0 ──────────────────
st.clrn = 0; solve();
assert(qbits() === 0, `clear: all Q should be 0, got ${bin9(qbits())}`);
st.clrn = 1; solve();

// ── 1. Non-inverting parallel load on the rising edge (Q = D) ────────────────
load(0b101010101);
assert(qbits() === 0b101010101, `load 101010101: got ${bin9(qbits())}`);

// 9th bit (D8/Q8) specifically — the parity/control bit that makes this a 9-bit part
load(0b100000000);
assert(qbits() === 0b100000000, `load bit8 only: got ${bin9(qbits())}`);

// ── 2. Active-LOW clock enable: CEN HIGH holds through a rising edge ──────────
load(0b000111000);
assert(qbits() === 0b000111000, `preload: got ${bin9(qbits())}`);
st.cen = 1;                     // disable clock
setD(0b111111111);
st.clk = 0; solve();
st.clk = 1; solve();            // rising edge, but CEN high → no capture
assert(qbits() === 0b000111000, `CEN high should hold, got ${bin9(qbits())}`);
st.cen = 0;                     // re-enable; now a real edge loads the new data
st.clk = 0; solve();
st.clk = 1; solve();
assert(qbits() === 0b111111111, `CEN low reload: got ${bin9(qbits())}`);

// ── 3. Output enable: OEn HIGH → 3-state (not HIGH), state preserved ─────────
st.oen = 1; solve();
assert(!isHigh(read('Q0')), `OEn high: Q0 should be high-impedance, not HIGH`);
assert(!isHigh(read('Q8')), `OEn high: Q8 should be high-impedance, not HIGH`);
st.oen = 0; solve();            // re-enable outputs, no clock edge
assert(qbits() === 0b111111111, `OEn low: stored state should reappear, got ${bin9(qbits())}`);

// ── 4. Async clear dominates a coincident rising clock edge ──────────────────
setD(0b111111111);
st.clrn = 0;
st.clk = 0; solve();
st.clk = 1; solve();            // clear held low during the edge
assert(qbits() === 0, `clear dominates clock: got ${bin9(qbits())}`);
st.clrn = 1; solve();

if (failures.length) {
  console.error(`74x823: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x823: PASS — clear, non-inverting load, CEN hold, 3-state output all correct');
