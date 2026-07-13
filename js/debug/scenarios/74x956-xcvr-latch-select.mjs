// ── 74x956 — octal bus transceiver + latch with real-time/stored select ──────
// The 74x956 (SN74BCT956, js/chips/chips45.js) is the LATCH version of the
// 'BCT646 registered transceiver: eight bidirectional bits between an A bus and
// a B bus, a single active-LOW OE plus DIR to pick the driven side, an
// independent transparent latch per direction (LEAB / LEBA), and a real-time vs
// stored select per direction (SAB / SBA). It rides the new
// TRANSCEIVER_OCTAL_LATCH_SEL primitive (js/specificChipsSim.js).
//
// Contract:
//   OEn LOW = transceiver, HIGH = isolation (both sides Hi-Z).
//   DIR HIGH → drive B from A (A input); DIR LOW → drive A from B (B input).
//   LEAB/LEBA HIGH → latch transparent (follows bus); LOW → holds last value.
//   SAB/SBA LOW → output live bus data (thru); HIGH → output the latched data.
//
// Pinout + FUNCTION TABLE + Figure 1 verified vs TI SCBS088A (Nov 1993), read as
// PDF page images: LEAB=1 SAB=2 DIR=3 A1..A8=4..11 GND=12 B8..B1=13..20 OE=21
// SBA=22 LEBA=23 VCC=24. (The original stub pinout was invented and wrong.)
//
// Checks:
//   1. A→B thru (DIR=H, SAB=L): B follows live A.
//   2. Capture then hold: latch A while LEAB=H, drop LEAB=L, change A, select
//      stored (SAB=H) → B shows the captured word, not the new live A.
//   3. Isolation (OEn=H): both sides Hi-Z; latch still captured value.
//   4. B→A thru (DIR=L, SBA=L): A follows live B, B side released.
//
// Run:  node js/debug/scenarios/74x956-xcvr-latch-select.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x956');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A = ['A1','A2','A3','A4','A5','A6','A7','A8'];
const B = ['B1','B2','B3','B4','B5','B6','B7','B8'];

// Wire control pins + power always; wire the bus bits listed in `driven`
// ({name: bit}); leave the rest for the chip to drive.
function apply(st, driven) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x956 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn',  st.oe);
  wirePin('DIR',  st.dir);
  wirePin('LEAB', st.leab);
  wirePin('LEBA', st.leba);
  wirePin('SAB',  st.sab);
  wirePin('SBA',  st.sba);
  for (const [name, bit] of Object.entries(driven)) wirePin(name, bit);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bitOf = (name) => (isHigh(read(name)) ? 1 : 0);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const P1 = [1,0,1,1,0,0,1,0];   // first A word
const P2 = [0,1,0,0,1,1,0,1];   // second A word

// ── 1. A→B thru: DIR=H, SAB=L, LEAB=H → B follows live A ──────────────────────
{
  const driven = {}; A.forEach((n,i) => driven[n] = P1[i]);
  apply({ oe:0, dir:1, leab:1, leba:0, sab:0, sba:0 }, driven);
  B.forEach((n,i) => assert(bitOf(n) === P1[i], `A→B thru: ${n} want ${P1[i]} got ${bitOf(n)}`));
  A.forEach((n) => assert(isHiZ(n), `A→B thru: ${n} (input side) should be Hi-Z`));
}

// ── 2. Capture then hold: latch P1, drop LEAB, change A to P2, select stored ──
{
  // P1 already captured in step 1 (LEAB was HIGH). Freeze the latch:
  const driven = {}; A.forEach((n,i) => driven[n] = P2[i]);   // now drive NEW data on A
  apply({ oe:0, dir:1, leab:0, leba:0, sab:1, sba:0 }, driven); // LEAB=0 hold, SAB=1 stored
  B.forEach((n,i) => assert(bitOf(n) === P1[i],
    `stored: ${n} want held ${P1[i]} got ${bitOf(n)} (must ignore live P2)`));
  // Flip SAB back to real-time → B must now show live P2, proving the mux works.
  apply({ oe:0, dir:1, leab:0, leba:0, sab:0, sba:0 }, driven);
  B.forEach((n,i) => assert(bitOf(n) === P2[i],
    `thru after stored: ${n} want live ${P2[i]} got ${bitOf(n)}`));
}

// ── 3. Isolation: OEn=H → both sides Hi-Z ────────────────────────────────────
{
  apply({ oe:1, dir:1, leab:0, leba:0, sab:1, sba:0 }, {});
  [...A, ...B].forEach((n) => assert(isHiZ(n), `isolation: ${n} should be Hi-Z`));
}

// ── 4. B→A thru: DIR=L, SBA=L → A follows live B, B released ──────────────────
{
  const driven = {}; B.forEach((n,i) => driven[n] = P1[i]);
  apply({ oe:0, dir:0, leab:0, leba:1, sab:0, sba:0 }, driven);
  A.forEach((n,i) => assert(bitOf(n) === P1[i], `B→A thru: ${n} want ${P1[i]} got ${bitOf(n)}`));
  B.forEach((n) => assert(isHiZ(n), `B→A thru: ${n} (input side) should be Hi-Z`));
}

console.log(`74x956-xcvr-latch-select: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
