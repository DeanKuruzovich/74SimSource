// ── 74x163 synchronous 4-bit binary counter (SYNCHRONOUS clear) regression ───
// The 74x163 (js/chips/chips5.js) drives the COUNTER_SYNC_BIN_SC primitive. It is
// the synchronous-clear twin of the 74x161 (async clear). This guards the DB
// entry: the verified TI terminal map (QA=LSB…QD=MSB, A=LSB…D=MSB), the binary
// mod-16 count, the active-HIGH dual count enables ENP·ENT, the active-LOW
// SYNCHRONOUS parallel LOAD, the active-LOW SYNCHRONOUS CLEAR, and RCO HIGH at
// terminal count 15 while ENT is HIGH.
//
// Datasheet (TI SDLS060, SN74LS163A), p.1 function description:
//   CLR=1 LOAD=0            → PRESET (load A..D on rising edge)
//   CLR=1 LOAD=1 ENP=0      → hold ;  CLR=1 LOAD=1 ENT=0 → hold
//   CLR=1 LOAD=1 ENP=ENT=1  → COUNT
//   CLR=0 on rising edge    → CLEAR to 0000 (SYNCHRONOUS — the '163's whole point)
// Priority CLEAR > LOAD > count, all sampled on the rising CLOCK edge.
//
// The key '163-vs-'161 distinction proven below: asserting CLR LOW does NOT clear
// until a rising clock edge actually arrives.
//
// Run:  node js/debug/scenarios/74x163-sync-binary-counter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x163');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC, 0 = GND).
function apply(s) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x163 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK',  s.clk  ? 1 : 0);
  wirePin('CLR',  s.clr  ? 1 : 0);   // active LOW (1 = inactive/run)
  wirePin('LOAD', s.load ? 1 : 0);   // active LOW (1 = inactive)
  wirePin('ENP',  s.enp  ? 1 : 0);
  wirePin('ENT',  s.ent  ? 1 : 0);
  wirePin('A',    s.a    ? 1 : 0);
  wirePin('B',    s.b    ? 1 : 0);
  wirePin('C',    s.c    ? 1 : 0);
  wirePin('D',    s.d    ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const count = () => {
  const b = (q) => (isHigh(read(q)) ? 1 : 0);
  return b('QA') | (b('QB') << 1) | (b('QC') << 2) | (b('QD') << 3);
};
const rco = () => (isHigh(read('RCO')) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Default state: CLR + LOAD inactive (HIGH), both count enables HIGH (counting).
const st = { clk: 0, clr: 1, load: 1, enp: 1, ent: 1, a: 0, b: 0, c: 0, d: 0 };
const solve = () => apply(st);

// Rising-edge clock pulse, then return CLK low.
function pulse(n = 1) {
  for (let i = 0; i < n; i++) {
    st.clk = 1; solve();   // rising edge → act
    st.clk = 0; solve();   // falling edge → hold
  }
}

solve(); // establish initial state (count 0)

// ── 0. Count up 0→6 (rising edge, both enables HIGH) ─────────────────────────
for (let n = 1; n <= 6; n++) {
  pulse(1);
  assert(count() === n, `up: after ${n} pulses count should be ${n}, got ${count()}`);
}

// ── 1. Falling edge alone must NOT advance ───────────────────────────────────
const before = count();                    // 6
st.clk = 1; solve();                       // rising edge → 7
assert(count() === before + 1, `rising edge should advance to ${before + 1}, got ${count()}`);
st.clk = 0; solve();                       // falling edge → hold
assert(count() === before + 1, `falling edge must hold at ${before + 1}, got ${count()}`);

// ── 2. ENP=0 inhibits counting ───────────────────────────────────────────────
let held = count();                        // 7
st.enp = 0; solve();
pulse(2);
assert(count() === held, `ENP=0 must inhibit count (hold ${held}), got ${count()}`);
st.enp = 1; solve();

// ── 3. ENT=0 inhibits counting AND forces RCO LOW ────────────────────────────
held = count();
st.ent = 0; solve();
pulse(2);
assert(count() === held, `ENT=0 must inhibit count (hold ${held}), got ${count()}`);
st.ent = 1; solve();

// ── 4. Count up to terminal 1111 → RCO HIGH (with ENT HIGH) ──────────────────
pulse(15 - count());
assert(count() === 15, `up-terminal: count should be 15, got ${count()}`);
assert(isHigh(read('QA')) && isHigh(read('QB')) && isHigh(read('QC')) && isHigh(read('QD')),
  `count 15 weighting wrong: QD..QA = ${['QD','QC','QB','QA'].map(q=>isHigh(read(q))?1:0).join('')}`);
assert(rco() === 1, `up-terminal: RCO should be HIGH at 1111 with ENT HIGH, got ${rco()}`);

// RCO must drop when ENT goes LOW even at terminal count.
st.ent = 0; solve();
assert(rco() === 0, `RCO should follow ENT LOW even at count 15, got ${rco()}`);
st.ent = 1; solve();

// ── 5. Wrap 15→0 on the next pulse ───────────────────────────────────────────
pulse(1);
assert(count() === 0, `up-wrap: 15→0 expected, got ${count()}`);
assert(rco() === 0, `after wrap RCO should be LOW (0 is not terminal), got ${rco()}`);

// ── 6. SYNCHRONOUS clear: asserting CLR alone must NOT clear before an edge ───
pulse(5);                                   // count up to 5 so a clear is observable
assert(count() === 5, `pre-clear setup: count should be 5, got ${count()}`);
st.clr = 0; solve();                        // CLR asserted, no rising edge yet
assert(count() === 5, `sync clear: CLR LOW alone must NOT clear before a rising edge, got ${count()}`);
st.clk = 1; solve();                        // rising edge → clears to 0
assert(count() === 0, `sync clear: should clear to 0 on the rising edge, got ${count()}`);
st.clk = 0; st.clr = 1; solve();            // release CLR

// ── 7. SYNCHRONOUS load: A..D = 1010 = decimal 10, loads on rising edge ───────
st.a = 0; st.b = 1; st.c = 0; st.d = 1;     // value 0b1010 = 10
st.load = 0; solve();                       // LOAD asserted, no edge yet
assert(count() === 0, `sync load: must NOT load before a rising edge, got ${count()}`);
pulse(1);                                   // rising edge → load
assert(count() === 10, `sync load: jam-load should give 10, got ${count()}`);
st.load = 1; solve();
pulse(1);                                   // now counts up from 10 → 11
assert(count() === 11, `after load should count 10→11, got ${count()}`);

// ── 8. CLEAR is synchronous and dominates LOAD ───────────────────────────────
st.a = 1; st.b = 1; st.c = 1; st.d = 1;     // would load 15
st.load = 0; st.clr = 0; solve();           // both asserted, no edge → still 11
assert(count() === 11, `sync clear: no change before rising edge, got ${count()}`);
pulse(1);                                   // rising edge → CLEAR wins over LOAD
assert(count() === 0, `clear dominance: CLR over LOAD should give 0, got ${count()}`);
st.load = 1; st.clr = 1; st.a = 0; st.b = 0; st.c = 0; st.d = 0; solve();

console.log(`74x163-sync-binary-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
