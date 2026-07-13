// ── CD4076 4-bit D register (3-state) regression ─────────────────────────────
// The CD4076 (Batch 4, js/chips/chips113.js) is the CMOS 4000-series 4-bit
// D-type register with 3-state outputs. It rides the existing REG_4BIT_TRI
// engine primitive (shared with the 74x173), with the entry setting the opt-in
// `asyncReset:true` flag because — unlike the 74173's synchronous clear — the
// CD4076 RESET is ASYNCHRONOUS (verified vs TI CD4076B SCHS058C truth table &
// Fig.8 logic diagram: Reset=1, Clock=X → Q=0).
//
// This scenario guards the chip's DB entry + the new flag:
//   • verified CD4076B pin map (M=1,N=2,Q1..Q4=3..6,CLK=7,VSS=8,G1=9,G2=10,
//     D4=11,D3=12,D2=11.. -> D1=14,RESET=15,VDD=16);
//   • load on the rising clock edge when both DATA INPUT DISABLE inputs (G1,G2)
//     are LOW;
//   • data-disable hold: a HIGH on G1 OR G2 blocks capture (register holds);
//   • ASYNCHRONOUS reset: RESET HIGH clears Q to 0 with NO clock edge;
//   • 3-state outputs: either OUTPUT DISABLE (M or N) HIGH → all four Q Hi-Z,
//     and the stored data is undisturbed (sequential operation unaffected).
//
// REG_4BIT_TRI contract (js/specificChipsSim.js):
//   inputs:  [1D,2D,3D,4D, CLK, CLR, IE1,IE2, OE1,OE2]   (IE/OE active LOW)
//   outputs: [1Q,2Q,3Q,4Q]                                rising-edge capture
//
// Run:  node js/debug/scenarios/cd4076-d-register.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4076');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Current input state (mutated by helpers). RESET LOW = not clearing,
// G1=G2 LOW = data enabled, M=N LOW = outputs driven.
const st = { clk: 0, reset: 0, g1: 0, g2: 0, m: 0, n: 0, d: [0, 0, 0, 0] };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4076 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk);
  wirePin('RESET', st.reset);
  wirePin('G1', st.g1);
  wirePin('G2', st.g2);
  wirePin('OE1', st.m);
  wirePin('OE2', st.n);
  for (let i = 1; i <= 4; i++) wirePin(`D${i}`, st.d[i - 1]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;
const qbits = () => {
  let v = 0;
  for (let i = 1; i <= 4; i++) if (isHigh(read(`Q${i}`))) v |= (1 << (i - 1));
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Present D and pulse a rising clock edge.
function clockIn(pattern4) {
  for (let i = 0; i < 4; i++) st.d[i] = (pattern4 >> i) & 1;
  st.clk = 0; solve();
  st.clk = 1; solve();
}

// ── 0. Async reset from power-up; then load 0b1010 ───────────────────────────
st.reset = 1; solve();
assert(qbits() === 0, `RESET=1 should clear all Q (got 0b${qbits().toString(2)})`);
st.reset = 0; solve();

clockIn(0b1010);
assert(qbits() === 0b1010, `load 0b1010 failed (got 0b${qbits().toString(2)})`);

// ── 1. Data-input-disable hold: G1 HIGH blocks capture ───────────────────────
st.g1 = 1;
clockIn(0b0101);
assert(qbits() === 0b1010, `G1=1 should hold (got 0b${qbits().toString(2)})`);
st.g1 = 0;

// G2 HIGH also blocks capture
st.g2 = 1;
clockIn(0b1111);
assert(qbits() === 0b1010, `G2=1 should hold (got 0b${qbits().toString(2)})`);
st.g2 = 0;

// Both LOW again → capture works
clockIn(0b1100);
assert(qbits() === 0b1100, `G1=G2=0 capture failed (got 0b${qbits().toString(2)})`);

// ── 2. No capture without a rising edge (level hold) ─────────────────────────
for (let i = 0; i < 4; i++) st.d[i] = (0b0011 >> i) & 1;
st.clk = 1; solve();   // clock already HIGH (no 0→1 transition since last solve)
assert(qbits() === 0b1100, `no rising edge should not capture (got 0b${qbits().toString(2)})`);

// ── 3. ASYNCHRONOUS reset: clear with NO clock edge ──────────────────────────
clockIn(0b1111);
assert(qbits() === 0b1111, `setup for async test failed (got 0b${qbits().toString(2)})`);
st.clk = 1;            // hold clock HIGH/static — no edge will occur
st.reset = 1; solve(); // RESET asserted while clock is static
assert(qbits() === 0, `ASYNC RESET should clear Q with no clock edge (got 0b${qbits().toString(2)})`);
st.reset = 0; solve();
// stays cleared after reset releases (no edge)
assert(qbits() === 0, `register should remain 0 after async reset releases`);

// ── 4. 3-state outputs + data preserved through Hi-Z ──────────────────────────
clockIn(0b0110);
assert(qbits() === 0b0110, `reload after reset failed (got 0b${qbits().toString(2)})`);
for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) assert(!isHiZ(q), `${q} should be driven when M=N=0`);

st.m = 1; solve();   // OUTPUT DISABLE M HIGH → all four Q Hi-Z
for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) assert(isHiZ(q), `M=1: ${q} must be Hi-Z (got drive ${driveOf(q)})`);
st.m = 0; solve();

st.n = 1; solve();   // OUTPUT DISABLE N HIGH → all four Q Hi-Z
for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) assert(isHiZ(q), `N=1: ${q} must be Hi-Z (got drive ${driveOf(q)})`);
st.n = 0; solve();

// Data was undisturbed by the Hi-Z excursions (sequential op unaffected)
assert(qbits() === 0b0110, `data must survive output disable (got 0b${qbits().toString(2)})`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`CD4076: ${failures.length} FAIL`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('CD4076: all checks passed ✓');
