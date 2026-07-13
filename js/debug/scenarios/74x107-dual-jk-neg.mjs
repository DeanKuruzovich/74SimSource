// ── 74x107 dual negative-edge JK flip-flop regression ────────────────────────
// The 74x107 (js/chips/chips4.js) is the "dual J-K flip-flops with clear" part:
// two independent JK flip flops, each with its own J, K, clock, and an active-LOW
// asynchronous clear — and NO preset. Both variants (the master-slave '107 and
// the negative-edge 'LS107A, TI SDLS036) change Q on the HIGH→LOW clock
// transition, so the simulator models it as negative-edge-triggered.
//
// It rides the shared JK_FF_SIMPLE primitive, which DEFAULTS to the rising edge.
// The 74x107 gates carry triggerEdge:'falling' to get the datasheet behavior
// (issues.md C113). Before that flag existed this part toggled on the WRONG
// (rising) edge — this scenario is the guard that would have caught it.
//
// JK_FF_SIMPLE contract (js/specificChipsSim.js):
//   inputs:  [J, K, CLK, CLR]     (CLR active LOW)
//   outputs: [Q, Qn]              triggerEdge:'falling' → HIGH→LOW capture
//
// This scenario guards: the RISING edge does NOT act, the FALLING edge applies
// JK (set / reset / toggle / hold), the active-LOW async clear, that there is no
// preset (Q only reaches 1 by clocking), Qn = complement of Q, and that the two
// flip flops are fully independent (own clock AND own clear).
//
// Run:  node js/debug/scenarios/74x107-dual-jk-neg.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x107');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Current input levels. Clears held HIGH (inactive) for normal clocking.
const st = { j1: 0, k1: 0, clk1: 0, clr1: 1, j2: 0, k2: 0, clk2: 0, clr2: 1 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x107 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('1J', st.j1); wirePin('1K', st.k1); wirePin('1CLK', st.clk1); wirePin('1CLR', st.clr1);
  wirePin('2J', st.j2); wirePin('2K', st.k2); wirePin('2CLK', st.clk2); wirePin('2CLR', st.clr2);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const Q  = (n) => isHigh(read(`${n}Q`))  ? 1 : 0;
const Qn = (n) => isHigh(read(`${n}Qn`)) ? 1 : 0;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const checkCompl = (ctx) => {
  assert(Q(1) !== Qn(1), `${ctx}: 1Qn must be the complement of 1Q`);
  assert(Q(2) !== Qn(2), `${ctx}: 2Qn must be the complement of 2Q`);
};

// helper: one full clock pulse on FF1 (rising then falling).
const pulse1 = () => { st.clk1 = 1; solve(); st.clk1 = 0; solve(); };

// ── 0. Async active-LOW clear forces Q=0 regardless of clock ──────────────────
st.clr1 = 0; solve();
assert(Q(1) === 0, 'async clear: 1Q should be 0');
assert(Qn(1) === 1, 'async clear: 1Qn should be 1');
st.clr1 = 1; solve();
checkCompl('after clear');

// ── 1. RISING edge must NOT act (this is the bug the fix addresses) ───────────
// Present a SET request (J=1,K=0) and take the clock LOW→HIGH. A rising-edge
// model would set Q here; the real negative-edge part must not.
st.j1 = 1; st.k1 = 0; st.clk1 = 0; solve();
st.clk1 = 1; solve();               // LOW→HIGH rising edge
assert(Q(1) === 0, 'rising edge must NOT set (1Q should still be 0)');

// ── 2. FALLING edge sets (J=1,K=0) ────────────────────────────────────────────
st.clk1 = 0; solve();               // HIGH→LOW falling edge captures the set
assert(Q(1) === 1, 'falling edge with J=1,K=0 should set 1Q');
checkCompl('after set');

// ── 3. FALLING edge holds (J=0,K=0) ───────────────────────────────────────────
st.j1 = 0; st.k1 = 0; pulse1();
assert(Q(1) === 1, 'J=0,K=0 hold: 1Q should stay 1 across a clock');

// ── 4. FALLING edge resets (J=0,K=1) ──────────────────────────────────────────
st.j1 = 0; st.k1 = 1; pulse1();
assert(Q(1) === 0, 'falling edge with J=0,K=1 should reset 1Q to 0');

// ── 5. FALLING edge toggles (J=1,K=1) ─────────────────────────────────────────
st.j1 = 1; st.k1 = 1;
pulse1(); assert(Q(1) === 1, 'toggle 1: 1Q should flip 0→1');
pulse1(); assert(Q(1) === 0, 'toggle 2: 1Q should flip 1→0');
checkCompl('after toggles');

// ── 6. Level change while CLK is steady must NOT act (edge-only) ───────────────
st.j1 = 1; st.k1 = 0; st.clk1 = 0; solve();  // set request, clock parked LOW
assert(Q(1) === 0, 'no edge (clock parked LOW): 1Q must not change');
st.clk1 = 1; solve();                          // rising: still nothing
assert(Q(1) === 0, 'rising edge must not set even with J=1');
st.clk1 = 0; solve();                          // falling: now it sets
assert(Q(1) === 1, 'falling edge should finally set 1Q');

// ── 7. Clear overrides the clock asynchronously (mid-cycle) ───────────────────
st.clk1 = 1; solve();               // clock parked HIGH
st.clr1 = 0; solve();               // clear while clock HIGH
assert(Q(1) === 0, 'async clear should force 1Q=0 even with clock HIGH');
st.clr1 = 1; st.clk1 = 0; solve();

// ── 8. No preset: the only way to Q=1 is clocking a set/toggle in ─────────────
// (There is no preset pin to assert; this is a structural check — the chip must
//  not expose one.)
assert(chip.getPinByName('1PRE') == null && chip.getPinByName('1PR') == null,
  'no-preset: 74x107 must not have a preset pin on FF1');
assert(chip.getPinByName('2PRE') == null && chip.getPinByName('2PR') == null,
  'no-preset: 74x107 must not have a preset pin on FF2');

// ── 9. Second flip flop is fully independent (own clock AND own clear) ────────
// Set FF1 to a known 1, then exercise FF2 and confirm FF1 is untouched.
st.j1 = 1; st.k1 = 0; pulse1();
assert(Q(1) === 1, 'setup: 1Q should be 1 before FF2 test');

st.j2 = 1; st.k2 = 0; st.clk2 = 0; solve();
st.clk2 = 1; solve();               // FF2 rising: ignored
assert(Q(2) === 0, 'FF2 rising edge must not set');
st.clk2 = 0; solve();               // FF2 falling: sets
assert(Q(2) === 1, 'FF2 falling edge should set 2Q');
assert(Q(1) === 1, 'FF1 must be unaffected by clocking FF2');

st.clr2 = 0; solve();               // clear FF2 only
assert(Q(2) === 0, 'FF2 clear should reset 2Q');
assert(Q(1) === 1, 'FF1 must be unaffected by clearing FF2');
st.clr2 = 1; solve();
checkCompl('independence');

console.log(`74x107-dual-jk-neg: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
