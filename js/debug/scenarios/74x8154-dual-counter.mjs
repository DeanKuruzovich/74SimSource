// ── 74x8154 dual 16-bit counter + 3-state register regression ────────────────
// The 74x8154 (js/chips/chips63.js) drives the DUAL_CTR16_REG_TRI engine
// primitive. It was upgraded in place from a wrong hand-entered stub (the stub
// modeled it as two 8-bit counters; the real TI SN74LV8154 is dual 16-bit).
// Verified vs TI SCLS589B Table 1/Table 2. This scenario guards:
//   • two independent 16-bit up-counters (CLKA, CLKB), proving the counter is
//     16 bits wide — it does NOT wrap at 256 like the old 8-bit stub;
//   • CCLR active-LOW asynchronous clear of both counters;
//   • RCLK rising edge snapshotting both counters into the storage register,
//     and the register HOLDING that snapshot while the counters keep running;
//   • the four active-LOW byte gates GAL/GAU/GBL/GBU selecting A-low / A-high /
//     B-low / B-high onto the shared Y bus, and all-HIGH → Hi-Z;
//   • CLKBEN active-LOW clock enable gating counter B;
//   • RCOA active-LOW carry HIGH while counter A is below full count.
//
// Run:  node js/debug/scenarios/74x8154-dual-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x8154');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Active-LOW controls idle HIGH (gates inactive, no clear, counter B disabled).
const st = { CLKA: 0, CLKB: 0, CLKBEN: 1, CCLR: 1, RCLK: 0,
             GAL: 1, GAU: 1, GBL: 1, GBU: 1 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x8154 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const [name, bit] of Object.entries(st)) wirePin(name, bit);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// One CLKA pulse: low then high (rising edge counts A up by one).
function tickA() { st.CLKA = 0; solve(); st.CLKA = 1; solve(); }
// One CLKB pulse at the current CLKBEN level.
function tickB() { st.CLKB = 0; solve(); st.CLKB = 1; solve(); }
// One RCLK pulse: snapshot both counters into the storage register.
function latch() { st.RCLK = 0; solve(); st.RCLK = 1; solve(); st.RCLK = 0; solve(); }

// Read one byte of the stored register by pulling exactly one gate LOW.
function readByte(gate) {
  st.GAL = st.GAU = st.GBL = st.GBU = 1;
  st[gate] = 0;
  solve();
  let v = 0;
  for (let i = 0; i < 8; i++) if (isHigh(read(`Y${i}`))) v |= (1 << i);
  st[gate] = 1;
  return v;
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 0. Power-up clear via CCLR (active LOW) ──────────────────────────────────
st.CCLR = 0; solve();
st.CCLR = 1; solve();
latch();
assert(readByte('GAL') === 0, `CCLR: A low byte should be 0, got ${readByte('GAL')}`);
assert(readByte('GAU') === 0, `CCLR: A high byte should be 0, got ${readByte('GAU')}`);
assert(readByte('GBL') === 0, `CCLR: B low byte should be 0, got ${readByte('GBL')}`);
assert(readByte('GBU') === 0, `CCLR: B high byte should be 0, got ${readByte('GBU')}`);

// ── 1. Counter A is 16 bits wide (does NOT wrap at 256) ──────────────────────
// 260 = 0x0104 → low byte 0x04, high byte 0x01. An 8-bit counter would read 4
// with a high byte stuck at 0; the 16-bit part carries into the high byte.
for (let i = 0; i < 260; i++) tickA();
latch();
assert(readByte('GAL') === 0x04, `A 16-bit: low byte should be 0x04, got ${readByte('GAL')}`);
assert(readByte('GAU') === 0x01, `A 16-bit: high byte should be 0x01 (proves >8 bits), got ${readByte('GAU')}`);
assert(isHigh(read('RCOA')), `RCOA should be HIGH well below full count`);

// ── 2. Register holds the snapshot while the counter keeps running ───────────
for (let i = 0; i < 5; i++) tickA();   // live count now 265, but no RCLK yet
assert(readByte('GAL') === 0x04, `hold: register must stay 0x04 until RCLK, got ${readByte('GAL')}`);
latch();                                // snapshot the new value 265 = 0x0109
assert(readByte('GAL') === 0x09, `after RCLK register should update to 0x09, got ${readByte('GAL')}`);
assert(readByte('GAU') === 0x01, `after RCLK A high byte should be 0x01, got ${readByte('GAU')}`);

// ── 3. CLKBEN gates counter B ────────────────────────────────────────────────
st.CLKBEN = 1;                          // B disabled
for (let i = 0; i < 4; i++) tickB();
latch();
assert(readByte('GBL') === 0, `CLKBEN HIGH must freeze counter B, got ${readByte('GBL')}`);
st.CLKBEN = 0;                          // B enabled
for (let i = 0; i < 3; i++) tickB();
latch();
assert(readByte('GBL') === 3, `CLKBEN LOW must let counter B count to 3, got ${readByte('GBL')}`);

// ── 4. All gates HIGH → Y bus is Hi-Z ────────────────────────────────────────
// First confirm a byte with its MSB set drives Y7 HIGH, then disable all gates
// and confirm Y7 is no longer driven HIGH (floats).
st.CCLR = 0; solve(); st.CCLR = 1; solve();   // clear
for (let i = 0; i < 0x80; i++) tickA();        // A low byte = 0x80 → Y7 set
latch();
st.GAL = 0; st.GAU = st.GBL = st.GBU = 1; solve();
assert(isHigh(read('Y7')), `gate LOW: Y7 should be HIGH for byte 0x80, got ${read('Y7')}`);
st.GAL = 1; solve();                           // all gates HIGH now
assert(!isHigh(read('Y7')), `all gates HIGH: Y7 must be Hi-Z (not driven HIGH), got ${read('Y7')}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error('74x8154 FAIL:');
  for (const f of failures) console.error('  • ' + f);
  process.exit(1);
}
console.log('74x8154 dual 16-bit counter + 3-state register: all checks passed.');
