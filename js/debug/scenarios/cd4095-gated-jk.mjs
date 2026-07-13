// ── CD4095 gated J-K master/slave flip-flop regression ──────────────────────
// The CD4095 (js/chips/chips114.js) maps onto the shared JK_FF engine primitive
// with the opt-in gate.preClrActiveHigh flag. It is a single positive-edge J-K
// FF with THREE AND-gated non-inverting J inputs (internal J = J1·J2·J3), THREE
// AND-gated non-inverting K inputs (internal K = K1·K2·K3), and ACTIVE-HIGH
// asynchronous SET and RESET (verified vs Intersil CD4096BMS family datasheet;
// see issues.md). RESET is modeled reset-dominant over SET.
//
// J-K next-state on the clock rising edge (SET=RESET=0):
//   J=0,K=0 hold · J=1,K=0 set · J=0,K=1 reset · J=1,K=1 toggle.
//
// Method: place ONE CD4095 and keep the same chip + sim instance across the run
// so the FF state (comp.state, incl. prevClk) persists. A clocked transition is
// driven as a setup solve (CLOCK=0) followed by an edge solve (CLOCK=1).
//
// Run:  node js/debug/scenarios/cd4095-gated-jk.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4095');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Solve once with each input held at the given rail (1 = VCC row, 0 = GND row).
// FF state lives on the persistent chip component, not the wires.
function apply({ j1, j2, j3, k1, k2, k3, clk, set, reset }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4095 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('J1', j1 ? 1 : 0);
  wirePin('J2', j2 ? 1 : 0);
  wirePin('J3', j3 ? 1 : 0);
  wirePin('K1', k1 ? 1 : 0);
  wirePin('K2', k2 ? 1 : 0);
  wirePin('K3', k3 ? 1 : 0);
  wirePin('CLOCK', clk ? 1 : 0);
  wirePin('SET', set ? 1 : 0);
  wirePin('RESET', reset ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

function expectQ(tag, q) {
  const gotQ = read('Q');
  const gotQn = read('Qn');
  assert(q ? isHigh(gotQ) : isLow(gotQ),
    `${tag}: Q expected ${q ? 'HIGH' : 'LOW'}, got ${gotQ.toFixed(2)} V`);
  assert(q ? isLow(gotQn) : isHigh(gotQn),
    `${tag}: Qn expected ${q ? 'LOW' : 'HIGH'}, got ${gotQn.toFixed(2)} V`);
}

// Drive a rising clock edge while holding the J/K/SET/RESET configuration.
function pulse(cfg) {
  apply({ ...cfg, clk: 0 });
  apply({ ...cfg, clk: 1 });
}

const J_ALL = { j1: 1, j2: 1, j3: 1 };
const J_NONE = { j1: 0, j2: 0, j3: 0 };
const K_ALL = { k1: 1, k2: 1, k3: 1 };
const K_NONE = { k1: 0, k2: 0, k3: 0 };

// ── Asynchronous SET / RESET (active HIGH, override the clock) ───────────────
apply({ ...J_NONE, ...K_NONE, clk: 0, set: 0, reset: 1 });
expectQ('async RESET', 0);
apply({ ...J_NONE, ...K_NONE, clk: 0, set: 1, reset: 0 });
expectQ('async SET', 1);
apply({ ...J_NONE, ...K_NONE, clk: 0, set: 0, reset: 1 });
expectQ('async RESET again', 0);
// RESET dominates SET when both HIGH.
apply({ ...J_NONE, ...K_NONE, clk: 0, set: 1, reset: 1 });
expectQ('SET+RESET → reset-dominant', 0);

// ── Clocked J-K behavior (SET=RESET=0) ──────────────────────────────────────
// Start from Q=0 (clear set/reset first).
apply({ ...J_NONE, ...K_NONE, clk: 0, set: 0, reset: 0 });

// J=1,K=0 → set on the edge.
pulse({ ...J_ALL, ...K_NONE, set: 0, reset: 0 });
expectQ('J=1,K=0 → set', 1);
// J=0,K=0 → hold (stays 1).
pulse({ ...J_NONE, ...K_NONE, set: 0, reset: 0 });
expectQ('J=0,K=0 → hold', 1);
// J=0,K=1 → reset on the edge.
pulse({ ...J_NONE, ...K_ALL, set: 0, reset: 0 });
expectQ('J=0,K=1 → reset', 0);
// J=1,K=1 → toggle 0→1.
pulse({ ...J_ALL, ...K_ALL, set: 0, reset: 0 });
expectQ('J=1,K=1 → toggle (0→1)', 1);
// J=1,K=1 → toggle 1→0.
pulse({ ...J_ALL, ...K_ALL, set: 0, reset: 0 });
expectQ('J=1,K=1 → toggle (1→0)', 0);

// ── AND-gating of the three J / three K inputs ──────────────────────────────
// One J input LOW → internal J=0, so J=1,K=0 no longer sets: from Q=0 it holds.
pulse({ j1: 1, j2: 1, j3: 0, ...K_NONE, set: 0, reset: 0 });
expectQ('J1·J2·J3 gating: one J LOW → no set (hold 0)', 0);
// All three J HIGH → internal J=1 → sets.
pulse({ ...J_ALL, ...K_NONE, set: 0, reset: 0 });
expectQ('all three J HIGH → set', 1);
// One K input LOW → internal K=0, so J=0,K=1 no longer resets: from Q=1 it holds.
pulse({ ...J_NONE, k1: 1, k2: 0, k3: 1, set: 0, reset: 0 });
expectQ('K1·K2·K3 gating: one K LOW → no reset (hold 1)', 1);
// All three K HIGH → internal K=1 → resets.
pulse({ ...J_NONE, ...K_ALL, set: 0, reset: 0 });
expectQ('all three K HIGH → reset', 0);

// ── No edge ⇒ no change (level on CLOCK alone does nothing) ──────────────────
// Set Q=1 via the clock, then hold CLOCK HIGH and flip to K=1 — must not reset
// without a fresh rising edge.
pulse({ ...J_ALL, ...K_NONE, set: 0, reset: 0 });
expectQ('precondition Q=1', 1);
apply({ ...J_NONE, ...K_ALL, clk: 1, set: 0, reset: 0 }); // CLOCK stays HIGH, no new edge
expectQ('K=1 with no new rising edge → hold', 1);

console.log(`cd4095-gated-jk: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
