// ── 74x874 dual 4-bit D flip-flop (async clear + 3-state) regression ─────────
// The 74x874 (js/chips/chips42.js) is a dual nibble-wide bus register: two
// independent banks of four rising-edge D flip-flops. Each bank has its own
// clock (CLKn), an asynchronous active-LOW clear (CLRn) that dominates the
// clock, and an active-LOW output enable (OEn) that tri-states that nibble.
// It rides the D_FF_REG_TRI_CLR engine primitive in js/specificChipsSim.js.
//
// D_FF_REG_TRI_CLR contract (width N = 4 per bank):
//   inputs:  [D0..D3, CLK, CLRn, OEn]
//   outputs: [Q0..Q3]
//   CLRn=0 → async clear (dominant); rising CLK → load D; no edge → hold;
//   OEn HIGH → outputs High-Z (read LOW here as the float decays to ~0 V).
//
// Datasheet: TI SN74ALS874B (SDAS061C). Function table (each flip-flop):
//   OE=L CLR=L → Q=L;  OE=L CLR=H rising CLK D=H/L → Q=H/L;  OE=L CLR=H no
//   edge → Q holds;  OE=H → Q=Z.
//
// Guards: rising-edge load, that a HIGH clock LEVEL (no edge) does not reload,
// async clear dominance over the clock, tri-state disable (float reads LOW),
// that disable does not disturb the stored nibble, and independence of the two
// banks (clocking/clearing one leaves the other untouched).
//
// Run:  node js/debug/scenarios/74x874-dual-dff-clr-tri.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x874');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Control state: both banks clear inactive (HIGH), outputs enabled (OE LOW).
const st = {
  d1: [0,0,0,0], clk1: 0, clr1: 1, oe1: 0,
  d2: [0,0,0,0], clk2: 0, clr2: 1, oe2: 0,
};

function solve() {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x874 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) wirePin(`D1${i}`, st.d1[i] ? 1 : 0);
  for (let i = 0; i < 4; i++) wirePin(`D2${i}`, st.d2[i] ? 1 : 0);
  wirePin('CLK1',  st.clk1 ? 1 : 0);
  wirePin('CLR1n', st.clr1 ? 1 : 0);
  wirePin('OE1n',  st.oe1  ? 1 : 0);
  wirePin('CLK2',  st.clk2 ? 1 : 0);
  wirePin('CLR2n', st.clr2 ? 1 : 0);
  wirePin('OE2n',  st.oe2  ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit = (bank, i) => isHigh(read(`Q${bank}${i}`)) ? 1 : 0;
const nib = (bank) => bit(bank,0)|(bit(bank,1)<<1)|(bit(bank,2)<<2)|(bit(bank,3)<<3);
const setD = (bank, v) => { for (let i = 0; i < 4; i++) st[`d${bank}`][i] = (v >> i) & 1; };
const pulse = (bank) => { st[`clk${bank}`] = 0; solve(); st[`clk${bank}`] = 1; solve(); };

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const hex = (v) => '0x' + v.toString(16);

// ── 0. Rising edge loads the nibble ───────────────────────────────────────────
setD(1, 0xA); pulse(1);
assert(nib(1) === 0xA, `bank1 rising-edge load: expected 0xA, got ${hex(nib(1))}`);

// ── 1. HIGH clock LEVEL (no edge) must not reload ─────────────────────────────
setD(1, 0x5);        // present new data while clock already HIGH
solve();
assert(nib(1) === 0xA, `static HIGH clock must not reload: expected 0xA, got ${hex(nib(1))}`);

// ── 2. Asynchronous clear dominates the clock ─────────────────────────────────
st.clr1 = 0; solve();
assert(nib(1) === 0x0, `async clear: expected 0x0, got ${hex(nib(1))}`);
// clear is level-sensitive and dominant even with a rising edge presented
setD(1, 0xF); pulse(1);
assert(nib(1) === 0x0, `clear must dominate a clock edge: expected 0x0, got ${hex(nib(1))}`);
st.clr1 = 1; solve();
assert(nib(1) === 0x0, `after clear released, nibble stays 0x0 until next load, got ${hex(nib(1))}`);

// ── 3. Tri-state disable: a floating output reads LOW ─────────────────────────
setD(1, 0xF); pulse(1);
assert(nib(1) === 0xF, `enabled with data 0xF should read 0xF, got ${hex(nib(1))}`);
st.oe1 = 1; solve();
assert(nib(1) === 0x0, `OE1n HIGH must tri-state the nibble (float LOW), got ${hex(nib(1))}`);
st.oe1 = 0; solve();
assert(nib(1) === 0xF, `OE1n back LOW must drive stored 0xF again, got ${hex(nib(1))}`);

// ── 4. Output disable does not disturb the stored nibble ──────────────────────
setD(1, 0x6); pulse(1);
st.oe1 = 1; solve();          // disable outputs
setD(1, 0xF);                 // change data inputs while disabled
pulse(1);                     // edge while disabled loads 0xF internally
st.oe1 = 0; solve();
assert(nib(1) === 0xF, `load while disabled then enable: expected 0xF, got ${hex(nib(1))}`);

// ── 5. The two banks are independent ──────────────────────────────────────────
st.clr1 = 0; solve(); st.clr1 = 1; solve();   // bank1 = 0
setD(2, 0x9); pulse(2);
assert(nib(2) === 0x9, `bank2 load independent of bank1: expected 0x9, got ${hex(nib(2))}`);
assert(nib(1) === 0x0, `bank1 must be unaffected by bank2 clocking, got ${hex(nib(1))}`);
st.clr2 = 0; solve(); st.clr2 = 1; solve();   // clear bank2
assert(nib(2) === 0x0, `bank2 clear: expected 0x0, got ${hex(nib(2))}`);
setD(1, 0xC); pulse(1);
assert(nib(1) === 0xC, `bank1 still works after bank2 activity: expected 0xC, got ${hex(nib(1))}`);
assert(nib(2) === 0x0, `bank2 must be unaffected by bank1 clocking, got ${hex(nib(2))}`);

console.log(`74x874-dual-dff-clr-tri: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
