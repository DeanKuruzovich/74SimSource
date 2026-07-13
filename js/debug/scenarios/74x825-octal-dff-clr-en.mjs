// ── 74x825 8-bit D flip-flop (CLRn + clock-enable + 3-state) regression ──────
// The 74x825 (js/chips/chips40.js) is a byte-wide bus register: eight rising-edge
// D flip-flops sharing one clock (CP), with an asynchronous active-LOW clear
// (CLRn), an active-LOW clock enable (ENn), and three active-LOW output enables
// (OE1n/OE2n/OE3n) that must ALL be low for the outputs to drive.
// It rides the D_FF_REG_TRI_CLR_EN engine primitive in js/specificChipsSim.js.
//
// D_FF_REG_TRI_CLR_EN contract (width N = 8 here):
//   inputs:  [D0..D7, CP, CLRn, ENn, OE1n, OE2n, OE3n]
//   outputs: [O0..O7]
//   CLRn=0 → async clear (dominant); rising CP with ENn=0 → load D; ENn=1 → hold;
//   any OEn high → outputs High-Z (read HIGH here via the weak TTL pull-up).
//
// Guards: rising-edge load, clock-enable hold, async clear dominance, that a HIGH
// clock LEVEL (no edge) does not reload, and that each OE independently vetoes the
// bus drive without disturbing the stored byte.
//
// Run:  node js/debug/scenarios/74x825-octal-dff-clr-en.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x825');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Control state: clear inactive (HIGH), clock enable active (LOW), all OE low = drive.
const st = { d: [0,0,0,0,0,0,0,0], cp: 0, clrn: 1, enn: 0, oe1: 0, oe2: 0, oe3: 0 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x825 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 8; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  wirePin('CP',   st.cp   ? 1 : 0);
  wirePin('CLRn', st.clrn ? 1 : 0);
  wirePin('ENn',  st.enn  ? 1 : 0);
  wirePin('OE1n', st.oe1  ? 1 : 0);
  wirePin('OE2n', st.oe2  ? 1 : 0);
  wirePin('OE3n', st.oe3  ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const O = (i) => isHigh(read(`O${i}`)) ? 1 : 0;
const word = () => O(0)|(O(1)<<1)|(O(2)<<2)|(O(3)<<3)|(O(4)<<4)|(O(5)<<5)|(O(6)<<6)|(O(7)<<7);
const setD = (v) => { for (let i = 0; i < 8; i++) st.d[i] = (v >> i) & 1; };
const pulse = () => { st.cp = 0; solve(); st.cp = 1; solve(); };  // rising edge

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const hex = (v) => '0x' + v.toString(16).padStart(2, '0');

// ── 0. Rising edge loads the byte ─────────────────────────────────────────────
setD(0xA5); pulse();
assert(word() === 0xA5, `rising-edge load: expected 0xA5, got ${hex(word())}`);

// ── 1. Clock enable HIGH holds the byte (edge ignored) ────────────────────────
st.enn = 1; setD(0x3C); pulse();
assert(word() === 0xA5, `ENn=1 must hold: expected 0xA5, got ${hex(word())}`);
st.enn = 0; pulse();   // re-enable and clock: now it loads 0x3C
assert(word() === 0x3C, `ENn=0 reload: expected 0x3C, got ${hex(word())}`);

// ── 2. HIGH clock LEVEL (no edge) must not reload ─────────────────────────────
setD(0xFF);            // present new data while clock already HIGH
solve();
assert(word() === 0x3C, `static HIGH clock must not reload: expected 0x3C, got ${hex(word())}`);

// ── 3. Asynchronous clear dominates, regardless of clock/enable ───────────────
st.enn = 1;            // clock enable off — clear must still work
st.clrn = 0; solve();
assert(word() === 0x00, `async clear: expected 0x00, got ${hex(word())}`);
st.clrn = 1; st.enn = 0; solve();
assert(word() === 0x00, `after clear released, byte stays 0x00 until next load, got ${hex(word())}`);

// reload all-HIGH for the tri-state tests: an enabled output drives 5 V (reads 1),
// a High-Z output floats to ~0 V (reads 0), so the two states are distinguishable.
setD(0xFF); pulse();

// ── 4. Each OE independently forces High-Z (a floating output reads LOW) ───────
assert(word() === 0xFF, `enabled with data 0xFF should read 0xFF, got ${hex(word())}`);
for (const oe of ['oe1','oe2','oe3']) {
  st[oe] = 1; solve();
  assert(word() === 0x00, `${oe} HIGH must tri-state all outputs (float LOW), got ${hex(word())}`);
  st[oe] = 0; solve();
  assert(word() === 0xFF, `${oe} back LOW must drive stored 0xFF again, got ${hex(word())}`);
}

// ── 5. Output disable does not disturb the stored byte ────────────────────────
setD(0x5A); pulse();
st.oe2 = 1; solve();                 // disable outputs
setD(0xFF);                          // change data inputs while disabled
st.cp = 0; solve(); st.cp = 1; solve();  // edge while disabled loads 0xFF internally
st.oe2 = 0; solve();
assert(word() === 0xFF, `load while disabled then enable: expected 0xFF, got ${hex(word())}`);

console.log(`74x825-octal-dff-clr-en: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
