// ── 74x869 synchronous 8-bit up/down counter, SYNCHRONOUS clear ─────────────
// The 74x869 (js/chips/chips42.js) drives the COUNTER_8BIT_SYNC_867 primitive
// with gate.syncClear = true. Two select inputs S0,S1 pick the action taken on
// the next rising CLK edge (function table, TI SDAS115C p.2):
//   S1,S0 = LOW,LOW  -> clear to 0
//          LOW,HIGH -> count down
//          HIGH,LOW -> load A-H
//          HIGH,HIGH-> count up
// Counting needs both ENP and ENT LOW; load and clear ignore the enables.
// RCO is active LOW: LOW only when ENT is LOW and the count is at its terminal
// value (all HIGH counting up, all LOW counting down).
//
// This scenario exercises the behaviour the '869 is named for plus the family
// machinery, so a broken pinout/mode-decode is caught:
//   • count up, with QA as LSB and wrap FF -> 00,
//   • RCO LOW at FF counting up (ENT LOW) and HIGH once ENT goes HIGH,
//   • count down and wrap 00 -> FF, RCO LOW at 00 counting down,
//   • synchronous load of an arbitrary byte,
//   • enables: counting holds when either ENP or ENT is HIGH,
//   • SYNCHRONOUS clear: S0=S1=LOW alone does NOT clear; the next CLK edge does.
//
// Verified against TI, "SN54AS867..SN74AS869 Synchronous 8-Bit Up/Down
// Counters", SDAS115C (1995), https://www.ti.com/lit/ds/symlink/sn74als869.pdf,
// pp.1-3 (terminals, function table, IEEE logic symbol). See chips42.js header.
//
// Run:  node js/debug/scenarios/74x869-updown-sync-clear.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const isHigh = (v) => v > 2.5;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x869');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Idle defaults: clear mode is S1,S0 = 0,0 so start in count-up (both HIGH);
// both enables asserted (LOW); clock low; data inputs 0.
const st = {
  s0: 1, s1: 1,                          // count up
  a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0,
  enpn: 0, entn: 0, clk: 0,
};

function solve() {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x869 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('S0',   st.s0);
  wirePin('S1',   st.s1);
  wirePin('A',    st.a);
  wirePin('B',    st.b);
  wirePin('C',    st.c);
  wirePin('D',    st.d);
  wirePin('E',    st.e);
  wirePin('F',    st.f);
  wirePin('G',    st.g);
  wirePin('H',    st.h);
  wirePin('ENPn', st.enpn);
  wirePin('ENTn', st.entn);
  wirePin('CLK',  st.clk);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qval = () =>
  (isHigh(read('QA')) ? 1   : 0) | (isHigh(read('QB')) ? 2   : 0) |
  (isHigh(read('QC')) ? 4   : 0) | (isHigh(read('QD')) ? 8   : 0) |
  (isHigh(read('QE')) ? 16  : 0) | (isHigh(read('QF')) ? 32  : 0) |
  (isHigh(read('QG')) ? 64  : 0) | (isHigh(read('QH')) ? 128 : 0);
const rcoLow = () => !isHigh(read('RCOn'));

const setData = (byte) => {
  st.a = (byte >> 0) & 1; st.b = (byte >> 1) & 1; st.c = (byte >> 2) & 1;
  st.d = (byte >> 3) & 1; st.e = (byte >> 4) & 1; st.f = (byte >> 5) & 1;
  st.g = (byte >> 6) & 1; st.h = (byte >> 7) & 1;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

function clock() { st.clk = 1; solve(); st.clk = 0; solve(); }
function setMode(s1, s0) { st.s1 = s1; st.s0 = s0; solve(); }

// ── 0. Power up, then synchronously clear to a known 0 ───────────────────────
solve();
setMode(0, 0); clock();                       // clear
assert(qval() === 0, `clear should give 0, got ${qval()}`);

// ── 1. Count up: QA is LSB, advance 0 -> 5 one edge at a time ─────────────────
setMode(1, 1);                                // count up
for (let n = 1; n <= 5; n++) {
  clock();
  assert(qval() === n, `count up: after ${n} edges expect ${n}, got ${qval()}`);
}

// ── 2. Up terminal count FF, RCO LOW (ENT LOW), wrap FF -> 00 ─────────────────
// Jump near the top by loading FE (S1,S0 = HIGH,LOW = load), then step to FF.
setMode(1, 0); setData(0xFE); clock();         // load FE
assert(qval() === 0xFE, `load FE failed, got ${qval()}`);
setMode(1, 1); clock();                        // FE -> FF
assert(qval() === 0xFF, `count up FE -> FF failed, got ${qval()}`);
assert(rcoLow(), 'RCO should be LOW at FF counting up with ENT LOW');
// ENT HIGH must release RCO even at terminal count
st.entn = 1; solve();
assert(!rcoLow(), 'RCO should be HIGH when ENT is HIGH, even at FF');
st.entn = 0; solve();
clock();                                       // FF -> 00 wrap
assert(qval() === 0x00, `count up should wrap FF -> 00, got ${qval()}`);

// ── 3. Count down: 00 -> FF wrap, RCO LOW at 00 ──────────────────────────────
setMode(0, 1);                                 // count down
assert(rcoLow(), 'RCO should be LOW at 00 counting down with ENT LOW');
clock();
assert(qval() === 0xFF, `count down should wrap 00 -> FF, got ${qval()}`);
assert(!rcoLow(), 'RCO should be HIGH at FF counting down');

// ── 4. Enables: counting holds if EITHER ENP or ENT is HIGH ──────────────────
setMode(1, 0); setData(0x40); clock();         // load 0x40
setMode(1, 1);                                 // count up
st.enpn = 1; solve();                          // disable via ENP
clock();
assert(qval() === 0x40, `ENP HIGH should hold the count at 0x40, got ${qval()}`);
st.enpn = 0; st.entn = 1; solve();             // disable via ENT instead
clock();
assert(qval() === 0x40, `ENT HIGH should hold the count at 0x40, got ${qval()}`);
st.entn = 0; solve();                          // both enabled again
clock();
assert(qval() === 0x41, `both enables LOW should count 0x40 -> 0x41, got ${qval()}`);

// ── 5. Load ignores the enables (load works with ENP HIGH) ───────────────────
st.enpn = 1; solve();
setMode(1, 0); setData(0xA5); clock();         // load even though ENP HIGH
assert(qval() === 0xA5, `load should ignore enables, expected 0xA5, got ${qval()}`);
st.enpn = 0; solve();

// ── 6. SYNCHRONOUS clear: select clear, but it must wait for a CLK edge ───────
setMode(0, 0);                                 // S1,S0 = 0,0 -> clear selected, no edge yet
assert(qval() === 0xA5, `sync clear must NOT act without a CLK edge, got ${qval()}`);
clock();                                        // now the edge clears
assert(qval() === 0x00, `sync clear should give 0 after a CLK edge, got ${qval()}`);

console.log(`74x869-updown-sync-clear: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
