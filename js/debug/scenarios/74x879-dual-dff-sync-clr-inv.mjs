// ── 74x879 dual 4-bit D flip-flop, SYNC clear, INVERTING, 3-STATE — regression ─
// The 74x879 (js/chips/chips43.js) is the inverting member of the TI SN74ALS/AS
// '873-'880 dual 4-bit bus-interface family. Each of its two independent banks is
// a 4-bit positive-edge-triggered D register: on the rising CLK edge it captures
// its four D inputs and drives the COMPLEMENT onto the Q̄ outputs (stored 1 reads
// LOW, stored 0 reads HIGH). The clear is SYNCHRONOUS: pulling CLRn LOW does
// nothing on its own; only the next rising CLK edge clears the register (to 0),
// which drives every Q̄ of that bank HIGH. OEn (active LOW) tri-states the outputs
// without disturbing the stored word. It rides the width-agnostic
// D_FF_REG_SYNC_CLR_TRI engine primitive with invert:true (one gate per bank).
//
// D_FF_REG_SYNC_CLR_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D(N-1), CLK, CLRn, OEn]    (CLRn/OEn active LOW)
//   outputs: [Q0n..Q(N-1)n]                  rising-edge capture, invert:true → Q̄
//   rising CLK, CLRn=1 → register = D  (Q̄ = NOT D)
//   rising CLK, CLRn=0 → register = 0  (Q̄ = HIGH)   ← synchronous clear
//   no rising edge     → hold;   OEn=1 → Hi-Z (state untouched)
//
// Pinout verified against the pin-compatible family datasheets (the '879 datasheet
// is not hosted by TI; see the chip's header comment): CLR1n=1, OE1n=2, D10..D13=
// 3..6, D20..D23=7..10, OE2n=11, GND=12, CLR2n=13, CLK2=14, Q23n..Q20n=15..18,
// Q13n..Q10n=19..22, CLK1=23, VCC=24 — read as PDF page images (issues.md C4).
//
// Checks:
//   1. Rising edge captures D and INVERTS it (D=1→Q̄=0, D=0→Q̄=1).
//   2. Data changing between edges does NOT flow to Q̄ (edge-triggered, not a latch).
//   3. Synchronous clear: CLRn LOW alone changes nothing; the next rising edge
//      clears the register so all Q̄ go HIGH — and CLRn wins over the D inputs.
//   4. OEn HIGH → all four outputs Hi-Z; the stored word survives.
//   5. The two banks are independent.
//
// Run:  node js/debug/scenarios/74x879-dual-dff-sync-clr-inv.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x879');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Full input picture every solve. Clocks start LOW; clears/enables inactive.
const st = {
  clk1: 0, clr1: 1, oe1: 0, d1: 0,   // d1/d2 are 4-bit nibbles
  clk2: 0, clr2: 1, oe2: 0, d2: 0,
};

function solve() {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x879 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK1', st.clk1); wirePin('CLR1n', st.clr1); wirePin('OE1n', st.oe1);
  wirePin('CLK2', st.clk2); wirePin('CLR2n', st.clr2); wirePin('OE2n', st.oe2);
  for (let i = 0; i < 4; i++) wirePin(`D1${i}`, (st.d1 >> i) & 1);
  for (let i = 0; i < 4; i++) wirePin(`D2${i}`, (st.d2 >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;
// Read a bank's 4-bit Q̄ word (bit i = Q{bank}{i}n).
const qbits = (bank) => {
  let v = 0;
  for (let i = 0; i < 4; i++) if (isHigh(read(`Q${bank}${i}n`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const MASK = 0xF;
const inv = (n) => (~n) & MASK;
const b4 = (n) => (n & MASK).toString(2).padStart(4, '0');

// One rising clock edge on bank 1 (data must already be present).
const clockBank1 = () => { st.clk1 = 0; solve(); st.clk1 = 1; solve(); };
const clockBank2 = () => { st.clk2 = 0; solve(); st.clk2 = 1; solve(); };

// ── 1. Rising edge captures D and inverts it ──────────────────────────────────
st.d1 = 0b1010; clockBank1();
assert(qbits(1) === inv(0b1010), `inv capture: Q̄ got ${b4(qbits(1))}, want ${b4(inv(0b1010))}`);
st.d1 = 0b0000; clockBank1();
assert(qbits(1) === MASK, `all-zero D → all Q̄ HIGH, got ${b4(qbits(1))}`);
st.d1 = 0b1111; clockBank1();
assert(qbits(1) === 0, `all-one D → all Q̄ LOW, got ${b4(qbits(1))}`);

// ── 2. Data changing between edges does NOT flow (edge-triggered) ─────────────
// Register currently holds 0b1111 (Q̄=0). Change D with the clock held HIGH.
const heldWord = qbits(1);
st.d1 = 0b0101; solve();                 // clk1 still HIGH from step 1, no new edge
assert(qbits(1) === heldWord, `no edge → hold, got ${b4(qbits(1))} want ${b4(heldWord)}`);
// A rising edge now captures the new data.
clockBank1();
assert(qbits(1) === inv(0b0101), `edge captures new D: got ${b4(qbits(1))}`);

// ── 3. Synchronous clear ──────────────────────────────────────────────────────
// (a) CLRn LOW with NO edge must not disturb the outputs.
const beforeClr = qbits(1);
st.clr1 = 0; solve();                    // assert clear, but clk1 unchanged (HIGH)
assert(qbits(1) === beforeClr, `CLRn low w/o edge must hold ${b4(beforeClr)}, got ${b4(qbits(1))}`);
// (b) A rising edge with CLRn LOW clears the register → all Q̄ HIGH, beating D.
st.d1 = 0b1111;                          // D that would (inverted) give Q̄=0000
clockBank1();
assert(qbits(1) === MASK, `sync clear on edge → all Q̄ HIGH (beats D), got ${b4(qbits(1))}`);
st.clr1 = 1; solve();                    // release clear

// ── 4. OEn HIGH → Hi-Z, stored word survives ──────────────────────────────────
st.d1 = 0b1100; clockBank1();
const stored = qbits(1);                 // == inv(1100)
st.oe1 = 1; solve();
for (let i = 0; i < 4; i++) assert(isHiZ(`Q1${i}n`), `OE1n high: Q1${i}n should be Hi-Z`);
st.oe1 = 0; solve();
assert(qbits(1) === stored, `OE must not disturb state: want ${b4(stored)}, got ${b4(qbits(1))}`);

// ── 5. Banks are independent ──────────────────────────────────────────────────
st.d2 = 0b0011; clockBank2();
assert(qbits(2) === inv(0b0011), `bank2 capture: got ${b4(qbits(2))}`);
assert(qbits(1) === stored, `bank1 unaffected by bank2 clocking: got ${b4(qbits(1))}`);
// Clearing bank 2 must leave bank 1 alone.
st.clr2 = 0; clockBank2(); st.clr2 = 1;
assert(qbits(2) === MASK, `bank2 sync clear → all Q̄ HIGH, got ${b4(qbits(2))}`);
assert(qbits(1) === stored, `bank1 unaffected by bank2 clear: got ${b4(qbits(1))}`);

console.log(`74x879-dual-dff-sync-clr-inv: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
