// ── CD4013 dual D flip-flop (active-HIGH set/reset) regression ────────────────
// The CD4013 (js/chips/chips68.js) is the CMOS 4000-series DUAL D-type flip-flop.
// Each half captures D on the rising CLK edge and has an ASYNCHRONOUS, ACTIVE-HIGH
// set and reset — the opposite polarity from the 74x74's active-LOW preset/clear.
// It rides the D_FF_ACTHI engine primitive (used only by this chip).
//
// Verified against TI CD4013B, doc SCHS023E (read as PDF page images, issues.md C4):
//   pin map  Q1=1, Q1n=2, CLK1=3, RST1=4, D1=5, SET1=6, VSS=7,
//            SET2=8, D2=9, RST2=10, CLK2=11, Q2n=12, Q2=13, VDD=14
//   Table 1  rising CLK captures D; falling CLK holds; SET=1 -> Q=1; RESET=1 -> Q=0.
//
// D_FF_ACTHI contract (js/specificChipsSim.js):
//   inputs:  [D, CLK, SET, RST]   (SET/RST active HIGH, async, override clock)
//   outputs: [Q, Qn]              rising-edge capture
//
// NOTE on the illegal SET=RESET=HIGH input: the real part drives BOTH outputs HIGH
// (Table 1). 74Sim simplifies this to RESET-wins (Q=0), the same simplification the
// shared D_FF primitive uses for the 74x74. This scenario pins the SIMPLIFIED
// behavior so a future engine change is a deliberate, visible decision.
//
// Method: one CD4013, same chip + sim instance across the run so ffState persists.
//
// Run:  node js/debug/scenarios/cd4013-dual-dff-acthi.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4013');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Current input state (mutated by helpers). Both flip flops idle: SET/RST LOW.
const st = {
  clk1: 0, set1: 0, rst1: 0, d1: 0,
  clk2: 0, set2: 0, rst2: 0, d2: 0,
};

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
function solve() {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4013 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  wirePin('CLK1', st.clk1); wirePin('SET1', st.set1); wirePin('RST1', st.rst1); wirePin('D1', st.d1);
  wirePin('CLK2', st.clk2); wirePin('SET2', st.set2); wirePin('RST2', st.rst2); wirePin('D2', st.d2);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const q = (n) => isHigh(read(`Q${n}`));
const qn = (n) => isHigh(read(`Qn${n}`));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const checkComplement = (n, ctx) =>
  assert(q(n) !== qn(n), `${ctx}: Qn${n} should be complement of Q${n} (Q=${q(n)?1:0}, Qn=${qn(n)?1:0})`);

// Present D on flip flop n, then a rising clock edge to capture it.
function loadFF(n, d) {
  st[`d${n}`] = d ? 1 : 0;
  st[`clk${n}`] = 0; solve();  // data set up, clock low
  st[`clk${n}`] = 1; solve();  // rising edge → capture
}

// ── 0. Known start: reset both flip flops ─────────────────────────────────────
st.rst1 = 1; st.rst2 = 1; solve();
assert(!q(1) && !q(2), 'reset: both Q should start LOW');
checkComplement(1, 'after reset'); checkComplement(2, 'after reset');
st.rst1 = 0; st.rst2 = 0; solve();

// ── 1. Rising edge captures D=1, then D=0 (flip flop 1) ───────────────────────
loadFF(1, 1);
assert(q(1), 'FF1: rising edge should capture D1=1');
checkComplement(1, 'FF1 captured 1');
loadFF(1, 0);
assert(!q(1), 'FF1: rising edge should capture D1=0');

// ── 2. Falling edge and steady-HIGH clock must NOT change Q ───────────────────
loadFF(1, 1);                 // Q1 = 1
st.d1 = 0; st.clk1 = 0; solve();      // falling edge with new data
assert(q(1), 'FF1: falling edge must hold (Q1 stayed 1)');
st.clk1 = 1; solve();                 // data still 0, rising edge captures it
st.d1 = 1; solve();                   // clock stays HIGH, data changes → hold
assert(!q(1), 'FF1: level change while CLK high must hold (Q1 stayed 0)');

// ── 3. Asynchronous active-HIGH SET forces Q=1 regardless of clock ────────────
st.rst1 = 0; st.clk1 = 0; st.d1 = 0; solve();  // Q1 currently 0, clock low
st.set1 = 1; solve();
assert(q(1), 'FF1: SET1 HIGH should force Q1 HIGH with no clock edge');
assert(!qn(1), 'FF1: Qn1 should be LOW while SET1 asserted');
st.set1 = 0; solve();
assert(q(1), 'FF1: Q1 should hold HIGH after SET1 released (no clock)');

// ── 4. Asynchronous active-HIGH RESET forces Q=0 regardless of clock ──────────
st.rst1 = 1; solve();
assert(!q(1), 'FF1: RST1 HIGH should force Q1 LOW with no clock edge');
assert(qn(1), 'FF1: Qn1 should be HIGH while RST1 asserted');
st.rst1 = 0; solve();

// ── 5. The two flip flops are independent ─────────────────────────────────────
st.rst1 = 1; st.rst2 = 1; solve(); st.rst1 = 0; st.rst2 = 0; solve();  // both = 0
loadFF(2, 1);                 // clock only FF2
assert(q(2), 'FF2: should capture D2=1');
assert(!q(1), 'FF1 must be untouched by FF2 activity');
st.set1 = 1; solve(); st.set1 = 0; solve();  // set only FF1
assert(q(1) && q(2), 'both halves independent: FF1 set, FF2 still holding 1');

// ── 6. Illegal SET=RESET=HIGH — 74Sim simplification: RESET wins (Q=0) ────────
//     Real CD4013 drives BOTH outputs HIGH here; this pins the documented sim
//     behavior so any future engine change is a deliberate, visible decision.
st.set1 = 1; st.rst1 = 1; solve();
assert(!q(1), 'illegal SET1=RST1=HIGH: 74Sim simplifies to RESET-wins (Q1=0)');
st.set1 = 0; st.rst1 = 0; solve();

console.log(`cd4013-dual-dff-acthi: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
