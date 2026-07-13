// ── 74x173 4-bit D register (3-state) regression ─────────────────────────────
// The 74x173 (js/chips/chips5.js) is the classic TTL 4-bit D-type register with
// 3-state outputs. It rides the REG_4BIT_TRI engine primitive (shared with the
// CD4076). Two things this test pins down, because both were wrong in the
// fast-batch entry (see issues.md C98):
//   • CLR is ACTIVE HIGH  (datasheet FUNCTION TABLE: CLR=H, CLK=X -> Q=L), and
//   • CLR is ASYNCHRONOUS (LOGIC DIAGRAM: CLR drives the direct R input of every
//     flip-flop, not gated by the clock).
// The entry's gate sets `asyncReset:true`. Under the old default (synchronous
// clear) the "clear with no clock edge" assertion below would FAIL — that is the
// regression this scenario guards.
//
// Verified against TI SDLS067A "4-Bit D-Type Registers With 3-State Outputs",
// read as PDF page images (issues.md C4). Pin map checked here directly:
//   M/OE1=1, N/OE2=2, 1Q=3, 2Q=4, 3Q=5, 4Q=6, CLK=7, GND=8, G1/IE1=9, G2/IE2=10,
//   4D=11, 3D=12, 2D=13, 1D=14, CLR=15, VCC=16.
//
// REG_4BIT_TRI contract (js/specificChipsSim.js):
//   inputs:  [1D,2D,3D,4D, CLK, CLR, IE1,IE2, OE1,OE2]   (IE/OE active LOW)
//   outputs: [1Q,2Q,3Q,4Q]                                rising-edge capture
//
// Run:  node js/debug/scenarios/74x173-4bit-dreg-tri.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x173');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Current input state (mutated by helpers). clr LOW = not clearing,
// ie1=ie2 LOW = data enabled, oe1=oe2 LOW = outputs driven.
const st = { clk: 0, clr: 0, ie1: 0, ie2: 0, oe1: 0, oe2: 0, d: [0, 0, 0, 0] };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x173 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk);
  wirePin('CLR', st.clr);
  wirePin('IE1', st.ie1);
  wirePin('IE2', st.ie2);
  wirePin('OE1', st.oe1);
  wirePin('OE2', st.oe2);
  for (let i = 1; i <= 4; i++) wirePin(`${i}D`, st.d[i - 1]);
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
  for (let i = 1; i <= 4; i++) if (isHigh(read(`${i}Q`))) v |= (1 << (i - 1));
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

// ── 0. Verified pin map (physical pin number ↔ name), both directions ─────────
const PINMAP = {
  1: 'OE1', 2: 'OE2', 3: '1Q', 4: '2Q', 5: '3Q', 6: '4Q', 7: 'CLK', 8: 'GND',
  9: 'IE1', 10: 'IE2', 11: '4D', 12: '3D', 13: '2D', 14: '1D', 15: 'CLR', 16: 'VCC',
};
for (const [numStr, name] of Object.entries(PINMAP)) {
  const num = Number(numStr);
  const byName = chip.getPinByName(name);
  const byNum = chip.getPinByNumber(num);
  assert(byName && byName.pin === num, `pin name ${name} should sit on physical pin ${num}, got ${byName ? byName.pin : 'missing'}`);
  assert(byNum && byNum.name === name, `physical pin ${num} should be named ${name}, got ${byNum ? byNum.name : 'missing'}`);
}

// ── 1. Active-HIGH clear from power-up; then load 0b1010 ──────────────────────
st.clr = 1; solve();
assert(qbits() === 0, `CLR=1 should clear all Q (got 0b${qbits().toString(2)})`);
st.clr = 0; solve();

clockIn(0b1010);
assert(qbits() === 0b1010, `load 0b1010 failed (got 0b${qbits().toString(2)})`);

// ── 2. Data-enable hold: a HIGH on IE1 or IE2 blocks capture ─────────────────
st.ie1 = 1;
clockIn(0b0101);
assert(qbits() === 0b1010, `IE1=1 should hold (got 0b${qbits().toString(2)})`);
st.ie1 = 0;

st.ie2 = 1;
clockIn(0b1111);
assert(qbits() === 0b1010, `IE2=1 should hold (got 0b${qbits().toString(2)})`);
st.ie2 = 0;

// Both enables LOW again → capture works
clockIn(0b1100);
assert(qbits() === 0b1100, `IE1=IE2=0 capture failed (got 0b${qbits().toString(2)})`);

// ── 3. No capture without a rising edge (level hold) ─────────────────────────
for (let i = 0; i < 4; i++) st.d[i] = (0b0011 >> i) & 1;
st.clk = 1; solve();   // clock already HIGH (no 0→1 transition since last solve)
assert(qbits() === 0b1100, `no rising edge should not capture (got 0b${qbits().toString(2)})`);

// ── 4. ASYNCHRONOUS clear: CLR HIGH clears with NO clock edge ────────────────
//   This is the assertion that fails under a synchronous clear.
clockIn(0b1111);
assert(qbits() === 0b1111, `setup for async test failed (got 0b${qbits().toString(2)})`);
st.clk = 1;            // hold clock HIGH/static — no edge will occur
st.clr = 1; solve();   // CLR asserted while clock is static
assert(qbits() === 0, `ASYNC CLR should clear Q with no clock edge (got 0b${qbits().toString(2)})`);

// CLR dominates even a fresh rising edge: try to load while CLR still HIGH
clockIn(0b0110);
assert(qbits() === 0, `CLR HIGH must override a clock-edge load (got 0b${qbits().toString(2)})`);

st.clr = 0; solve();
// stays cleared after CLR releases (no edge)
assert(qbits() === 0, `register should remain 0 after async clear releases`);

// ── 5. 3-state outputs + data preserved through Hi-Z ─────────────────────────
clockIn(0b0110);
assert(qbits() === 0b0110, `reload after clear failed (got 0b${qbits().toString(2)})`);
for (const q of ['1Q', '2Q', '3Q', '4Q']) assert(!isHiZ(q), `${q} should be driven when OE1=OE2=0`);

st.oe1 = 1; solve();   // OUTPUT ENABLE 1 HIGH → all four Q Hi-Z
for (const q of ['1Q', '2Q', '3Q', '4Q']) assert(isHiZ(q), `OE1=1: ${q} must be Hi-Z (got drive ${driveOf(q)})`);
st.oe1 = 0; solve();

st.oe2 = 1; solve();   // OUTPUT ENABLE 2 HIGH → all four Q Hi-Z
for (const q of ['1Q', '2Q', '3Q', '4Q']) assert(isHiZ(q), `OE2=1: ${q} must be Hi-Z (got drive ${driveOf(q)})`);
st.oe2 = 0; solve();

// Data was undisturbed by the Hi-Z excursions (sequential op unaffected)
assert(qbits() === 0b0110, `data must survive output disable (got 0b${qbits().toString(2)})`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`74x173: ${failures.length} FAIL`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('74x173: all checks passed ✓');
