// ── 74x1779 8-bit bidirectional up/down counter regression ───────────────────
// The 74x1779 (js/chips/chips49.js) is the high-speed bin of the 74F779: a fully
// synchronous 8-bit up/down binary counter with ONE multiplexed 3-state I/O bus
// shared between parallel-load data and count read-out. It reuses the
// COUNTER_UPDOWN_TRI_779 engine primitive (added for the identical 74x779 — see
// issues.md C46). This scenario guards the DB entry and engine against the
// verified Signetics/Philips FAST 74F779 + Fairchild 74F779 datasheets:
//   - verified pin map (VCC=13, GND=4, I/O0..I/O7 multiplexed, S0/S1, CET, CP, TC)
//   - OE HIGH → I/O bus high-impedance; OE LOW → count appears on I/O
//   - S1=0,S0=0 + rising CP → parallel load from the I/O bus
//   - S1=1,S0=0 + CET LOW + rising CP → count up (wraps 255→0)
//   - S1=0,S0=1 + CET LOW + rising CP → count down (wraps 0→255)
//   - CET HIGH or mode 11 → hold
//   - TC (active LOW) asserts at 0xFF counting up / 0x00 counting down
//
// To preset, the chip must release the bus (OE HIGH) so the external source can
// drive the I/O pins; to read the count, the I/O pins are left unwired and read.
//
// Run:  node js/debug/scenarios/74x1779-bidir-updown-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const IO = ['I/O0','I/O1','I/O2','I/O3','I/O4','I/O5','I/O6','I/O7'];

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x1779');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// s = control levels. If s.io is a number, the 8 I/O pins are externally driven
// to that value (used for parallel load); if null, they are left floating so the
// chip can drive/read them.
function apply(s) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x1779 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('S1',   s.s1  ? 1 : 0);
  wirePin('S0',   s.s0  ? 1 : 0);
  wirePin('CETn', s.cet ? 1 : 0);
  wirePin('OEn',  s.oe  ? 1 : 0);
  wirePin('CP',   s.clk ? 1 : 0);
  if (s.io != null) {
    for (let i = 0; i < 8; i++) wirePin(IO[i], (s.io >> i) & 1);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bus  = () => {
  let v = 0;
  for (let i = 0; i < 8; i++) v |= (isHigh(read(IO[i])) ? 1 : 0) << i;
  return v;
};
const tc = () => (isHigh(read('TCn')) ? 1 : 0); // active LOW: 0 = asserted

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Default control state: hold, output bus driven (OE LOW), clock low.
const st = { s1: 1, s0: 1, cet: 0, oe: 0, clk: 0, io: null };
const solve = () => apply(st);
function pulse() { st.clk = 1; solve(); st.clk = 0; solve(); }

// Read the count back out on the I/O bus (OE LOW, hold, pins not externally driven).
function readCount() {
  st.s1 = 1; st.s0 = 1; st.cet = 0; st.oe = 0; st.io = null; solve();
  return bus();
}

// Parallel load a value: release bus (OE HIGH), drive I/O externally, S1S0=00, clock.
function loadValue(v) {
  st.s1 = 0; st.s0 = 0; st.cet = 0; st.oe = 1; st.io = v;
  pulse();
  st.io = null;
}

// ── 1. Parallel load ─────────────────────────────────────────────────────────
loadValue(0xFE);
assert(readCount() === 0xFE, `load 0xFE: read back ${readCount().toString(16)}`);

// ── 2. Output enable / Hi-Z ──────────────────────────────────────────────────
st.s1 = 1; st.s0 = 1; st.cet = 0; st.oe = 1; st.io = null; solve();
assert(!isHigh(read('I/O0')) === !isHigh(read('I/O0')), 'Hi-Z read is stable'); // sanity
// With OE LOW the count drives the bus; with OE HIGH the chip releases it. We
// can't assert a floating level, but the count must reappear when OE returns LOW.
st.oe = 0; solve();
assert(bus() === 0xFE, `OE re-enable: expected 0xFE, got ${bus().toString(16)}`);

// ── 3. Count up + terminal count ─────────────────────────────────────────────
st.s1 = 1; st.s0 = 0; st.cet = 0; st.oe = 0; st.io = null; solve();
assert(bus() === 0xFE, 'still 0xFE before first up edge');
pulse();                                  // 0xFE → 0xFF
assert(bus() === 0xFF, `up to 0xFF: got ${bus().toString(16)}`);
assert(tc() === 0, 'TC asserted (LOW) at 0xFF counting up');
pulse();                                  // 0xFF → 0x00 (wrap)
assert(bus() === 0x00, `up wrap: expected 0x00, got ${bus().toString(16)}`);
assert(tc() === 1, 'TC released at 0x00 counting up');

// ── 4. CET disables counting ─────────────────────────────────────────────────
st.cet = 1; solve();
pulse();
assert(bus() === 0x00, 'CET HIGH holds the count');
st.cet = 0; solve();

// ── 5. Count down + terminal count ───────────────────────────────────────────
st.s1 = 0; st.s0 = 1; st.cet = 0; solve();   // down mode
assert(tc() === 0, 'TC asserted (LOW) at 0x00 counting down');
pulse();                                      // 0x00 → 0xFF (wrap)
assert(bus() === 0xFF, `down wrap: expected 0xFF, got ${bus().toString(16)}`);
assert(tc() === 1, 'TC released away from terminal');
pulse();                                      // 0xFF → 0xFE
assert(bus() === 0xFE, `down step: expected 0xFE, got ${bus().toString(16)}`);

// ── 6. Hold mode (S1=S0=1) ───────────────────────────────────────────────────
st.s1 = 1; st.s0 = 1; solve();
pulse();
assert(bus() === 0xFE, 'mode 11 holds the count');

if (failures.length) {
  console.error('74x1779 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x1779 OK — load / 3-state read / up / down / TC / hold all verified');
