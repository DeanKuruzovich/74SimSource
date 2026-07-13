// ── 74x418 Programmable Modulo-N (mod-16) counter ───────────────────────────
// The 74x418 (js/chips/chips66.js) is the Motorola MC4018 "Programmable
// Modulo-N Hexadecimal Counter". It drives the COUNTER_PROG_MODN_4018 primitive
// (js/specificChipsSim.js) with gate.mod = 16.
//
// Behaviour verified against the Motorola "Programmable Modulo-N Counters —
// MC4316 thru MC4319 / MC4016 thru MC4019" 3-page data sheet (see chips66.js
// header for the full citation). This scenario exercises:
//   • count up 0..15 on the Clock rising edge, with straight-binary outputs,
//   • wrap 15 -> 0,
//   • Bus (carry) HIGH only at the terminal count 15,
//   • MR (pin 10, active-low) ASYNCHRONOUS reset to 0, holds while low,
//   • PE (pin 3, active-low) ASYNCHRONOUS parallel load of D0-D3 (no clock),
//   • MR outranks PE when both are low (-> 0),
//   • Gate (pin 4) SYNCHRONOUS load on the next clock edge (not before it),
//   • R (pin 13) gates Bus; LOW disables the carry, floating enables it
//     (internal pull-up).
//
// Run:  node js/debug/scenarios/74x418-prog-modn-counter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x418');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Idle defaults: not reset (MR HIGH), not loading (PE HIGH), Gate LOW (count),
// clock LOW, data = 0, R HIGH (carry enabled). r === null means leave R floating.
const st = { clock: 0, pe: 1, gate: 0, mr: 1, d0: 0, d1: 0, d2: 0, d3: 0, r: 1 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x418 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('Clock', st.clock);
  wirePin('PE',    st.pe);
  wirePin('Gate',  st.gate);
  wirePin('MR',    st.mr);
  wirePin('D0',    st.d0);
  wirePin('D1',    st.d1);
  wirePin('D2',    st.d2);
  wirePin('D3',    st.d3);
  if (st.r !== null) wirePin('R', st.r); // leave R unwired to test the pull-up
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qval = () =>
  (isHigh(read('Q0')) ? 1 : 0) | (isHigh(read('Q1')) ? 2 : 0) |
  (isHigh(read('Q2')) ? 4 : 0) | (isHigh(read('Q3')) ? 8 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

function clock() { st.clock = 1; solve(); st.clock = 0; solve(); }
function setData(n) { st.d0 = n & 1; st.d1 = (n >> 1) & 1; st.d2 = (n >> 2) & 1; st.d3 = (n >> 3) & 1; }

// ── 1. Async master reset to a known 0 ───────────────────────────────────────
st.mr = 0; solve();
assert(qval() === 0, `MR LOW should force count 0, got ${qval()}`);
assert(!isHigh(read('Bus')), 'Bus should be LOW at count 0');
st.mr = 1; solve();
assert(qval() === 0, `count should still read 0 right after MR release, got ${qval()}`);

// ── 2. Count up 0..15, checking each step and the Bus carry ───────────────────
for (let n = 1; n <= 15; n++) {
  clock();
  assert(qval() === n, `after ${n} clocks count should be ${n}, got ${qval()}`);
  assert(isHigh(read('Bus')) === (n === 15),
    `Bus should be ${n === 15 ? 'HIGH' : 'LOW'} at count ${n}`);
}

// ── 3. Wrap 15 -> 0 and Bus drops ────────────────────────────────────────────
clock();
assert(qval() === 0, `mod-16 should wrap 15 -> 0, got ${qval()}`);
assert(!isHigh(read('Bus')), 'Bus should drop LOW after wrapping to 0');

// ── 4. PE: asynchronous parallel load (no clock edge needed) ─────────────────
setData(10);
st.pe = 0; solve();
assert(qval() === 10, `PE LOW should load D0-D3 = 10 with no clock, got ${qval()}`);
st.pe = 1; solve();
assert(qval() === 10, `count should hold 10 after PE release, got ${qval()}`);
clock();
assert(qval() === 11, `should count on from the loaded value (10 -> 11), got ${qval()}`);

// ── 5. MR outranks PE when both are active ───────────────────────────────────
setData(7);
st.pe = 0; st.mr = 0; solve();
assert(qval() === 0, `MR LOW must beat PE LOW (expect 0), got ${qval()}`);
st.pe = 1; st.mr = 1; solve();

// ── 6. Gate: SYNCHRONOUS load — must NOT load until a clock edge ──────────────
clock(); clock(); clock(); // count up to 3 from 0
assert(qval() === 3, `setup: count should be 3, got ${qval()}`);
setData(12);
st.gate = 1; solve();
assert(qval() === 3, `Gate HIGH without a clock edge must NOT load (hold 3), got ${qval()}`);
clock();
assert(qval() === 12, `Gate HIGH + a clock edge should load 12, got ${qval()}`);
st.gate = 0; solve();
clock();
assert(qval() === 13, `with Gate LOW it should count again (12 -> 13), got ${qval()}`);

// ── 7. R gates the Bus carry ─────────────────────────────────────────────────
setData(15);
st.pe = 0; solve();            // jam to terminal count 15
st.pe = 1; solve();
assert(qval() === 15, `setup: should be at 15, got ${qval()}`);
assert(isHigh(read('Bus')), 'Bus should be HIGH at 15 with R HIGH');
st.r = 0; solve();
assert(!isHigh(read('Bus')), 'R LOW must force Bus LOW even at count 15');
st.r = null; solve();          // leave R floating
assert(isHigh(read('Bus')), 'floating R should enable Bus (internal pull-up) at 15');
st.r = 1; solve();

console.log(`74x418-prog-modn-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
