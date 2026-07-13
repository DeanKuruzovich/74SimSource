// ── CD40102 2-decade BCD presettable synchronous down counter regression ─────
// The CD40102 (js/chips/chips129.js) is the CMOS 8-stage presettable synchronous
// down counter, configured as two cascaded BCD decades (00–99). It uses the
// dedicated BCD_DOWN_2DEC_CD40102 engine primitive — the hinted BCD_DOWN_2DEC is
// a fictional 2-output (TC/TCdec) device with only a synchronous preset and no
// CLR/APE, so it does NOT fit. This scenario guards the DB entry against the
// verified TI/Harris CD40102B datasheet (SCHS095B, July 2003):
//   - verified pin map (CLOCK=1, CLR=2, CI/CE=3, J0–J3=4–7 units, VSS=8, APE=9,
//     J4–J7=10–13 tens, CO/ZD=14, SPE=15, VDD=16)
//   - single active-LOW CARRY OUT/ZERO DETECT output, LOW only when count==00
//     AND CI/CE is LOW
//   - CLR LOW → async clear to MAXIMUM count (99); dominates everything
//   - APE LOW → async jam-load J0–J7
//   - SPE LOW → synchronous jam-load on the next rising CLOCK edge
//   - count DOWN on a rising CLOCK edge only while CI/CE is LOW
//   - at 00 the counter jumps back to 99 on the next clock (one-clock-wide pulse)
//   - decade borrow: units 0→9 borrows one from tens
//
// The internal count is not on a pin, so behaviour is checked through the timing
// of CO/ZD (when zero is reached) — which fully exercises load/count/clear logic.
//
// Method: place ONE CD40102 and keep the same chip + sim instance across the run
// so the counter state persists. Re-wire all inputs each solve.
//
// Run:  node js/debug/scenarios/cd40102-bcd-down.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40102');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Default: normal counting setup. Active-LOW controls held inactive (HIGH),
// CI/CE LOW (counting enabled), clock low, jam value 0.
const st = { clk: 0, clr: 1, cice: 0, ape: 1, spe: 1,
             j0: 0, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0, j7: 0 };

function apply() {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40102 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', st.clk);
  wirePin('CLR',   st.clr);
  wirePin('CI/CE', st.cice);
  wirePin('APE',   st.ape);
  wirePin('SPE',   st.spe);
  wirePin('J0', st.j0); wirePin('J1', st.j1); wirePin('J2', st.j2); wirePin('J3', st.j3);
  wirePin('J4', st.j4); wirePin('J5', st.j5); wirePin('J6', st.j6); wirePin('J7', st.j7);
  sim.evaluate(world, [chip], wm);
}
const solve = () => apply();
const cozd  = () => (isHigh(sim.getVoltageAtHole(chip.getPinByName('CO/ZD').holeId)) ? 1 : 0);

function pulse(n = 1) {
  for (let i = 0; i < n; i++) { st.clk = 1; solve(); st.clk = 0; solve(); }
}
function setJam(units, tens) {
  st.j0 = units & 1; st.j1 = (units >> 1) & 1; st.j2 = (units >> 2) & 1; st.j3 = (units >> 3) & 1;
  st.j4 = tens  & 1; st.j5 = (tens  >> 1) & 1; st.j6 = (tens  >> 2) & 1; st.j7 = (tens  >> 3) & 1;
}
function asyncPreset(units, tens) { setJam(units, tens); st.ape = 0; solve(); st.ape = 1; solve(); }
function syncPreset(units, tens)  { setJam(units, tens); st.spe = 0; pulse(1); st.spe = 1; solve(); }

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 0. CLEAR (async) → maximum count 99; dominates everything ─────────────────
st.clr = 0; solve();
assert(cozd() === 1, `CLR loads max (99), CO/ZD should be HIGH, got ${cozd()}`);
st.clk = 1; solve();
assert(cozd() === 1, `CLR overrides clock, CO/ZD HIGH, got ${cozd()}`);
st.clk = 0; asyncPreset(0, 0);   // APE while CLR LOW must NOT load 00
assert(cozd() === 1, `CLR dominates APE (count stays 99), CO/ZD HIGH, got ${cozd()}`);
st.clr = 1; solve();

// ── 1. CLR really loads 99: exactly 99 clocks reach zero ─────────────────────
st.clr = 0; solve(); st.clr = 1; solve();   // re-clear to 99
pulse(98);
assert(cozd() === 1, `98 counts from 99 → count 1, CO/ZD HIGH, got ${cozd()}`);
pulse(1);
assert(cozd() === 0, `99th count from 99 → count 0, CO/ZD LOW, got ${cozd()}`);

// ── 2. At zero, next clock jumps back to max → CO/ZD HIGH again ───────────────
pulse(1);
assert(cozd() === 1, `from 00 next clock jumps to 99, CO/ZD HIGH, got ${cozd()}`);

// ── 3. Asynchronous preset (APE) loads immediately ───────────────────────────
asyncPreset(3, 0);              // count = 03
assert(cozd() === 1, `APE load 03, CO/ZD HIGH, got ${cozd()}`);
pulse(2);
assert(cozd() === 1, `03 → 01 after 2 clocks, CO/ZD HIGH, got ${cozd()}`);
pulse(1);
assert(cozd() === 0, `03 → 00 after 3 clocks, CO/ZD LOW, got ${cozd()}`);

// ── 4. CO/ZD is gated by CI/CE: zero-detect only when CI/CE LOW ───────────────
assert(cozd() === 0, `count 00, CI/CE LOW, CO/ZD LOW, got ${cozd()}`);
st.cice = 1; solve();
assert(cozd() === 1, `count 00 but CI/CE HIGH, CO/ZD HIGH, got ${cozd()}`);
// CI/CE HIGH also freezes the count: clocks must not move it off 00
pulse(3);
st.cice = 0; solve();
assert(cozd() === 0, `CI/CE HIGH froze count at 00, CO/ZD LOW again, got ${cozd()}`);

// ── 5. Synchronous preset (SPE) loads on the clock edge ──────────────────────
syncPreset(5, 0);              // count = 05
assert(cozd() === 1, `SPE load 05, CO/ZD HIGH, got ${cozd()}`);
pulse(4);
assert(cozd() === 1, `05 → 01 after 4 clocks, CO/ZD HIGH, got ${cozd()}`);
pulse(1);
assert(cozd() === 0, `05 → 00 after 5 clocks, CO/ZD LOW, got ${cozd()}`);

// ── 6. Decade borrow: units 0 borrows from tens ──────────────────────────────
asyncPreset(0, 1);            // count = 10
assert(cozd() === 1, `count 10, CO/ZD HIGH, got ${cozd()}`);
pulse(9);
assert(cozd() === 1, `10 → 01 after 9 clocks (decade borrow), CO/ZD HIGH, got ${cozd()}`);
pulse(1);
assert(cozd() === 0, `10 → 00 after 10 clocks, CO/ZD LOW, got ${cozd()}`);

// ── 7. Tens-MSB preset reaches the high decade (90) ──────────────────────────
asyncPreset(0, 9);           // count = 90 (uses J7 weight 8)
pulse(89);
assert(cozd() === 1, `90 → 01 after 89 clocks, CO/ZD HIGH, got ${cozd()}`);
pulse(1);
assert(cozd() === 0, `90 → 00 after 90 clocks, CO/ZD LOW, got ${cozd()}`);

if (failures.length) {
  console.error(`CD40102: ${failures.length} FAILURE(S):`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('CD40102: all checks passed ✓');
