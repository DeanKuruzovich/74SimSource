// ── 74x1074 dual negative-edge D flip-flop regression ────────────────────────
// The 74x1074 (js/chips/chips48.js) is the negative-edge-triggered member of the
// 7474 dual D flip-flop family: two independent D flip flops, each with an
// active-LOW asynchronous preset (PRn) and clear (CLn). Unlike the common 74x74
// (rising edge), this part captures D on the FALLING clock edge (HIGH→LOW). It
// rides the D_FF_NEG engine primitive added for it in js/specificChipsSim.js.
//
// D_FF_NEG contract (js/specificChipsSim.js):
//   inputs:  [D, CLK, PRn, CLn]   (PRn/CLn active LOW)
//   outputs: [Q, Qn]              falling-edge capture
//
// This scenario guards: falling-edge capture, that the RISING edge does NOT
// capture, that holding the clock level does not capture, the active-LOW async
// preset and clear, Qn = complement of Q, and independence of the two sections.
//
// Run:  node js/debug/scenarios/74x1074-dual-dff-neg.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x1074');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Current input levels (preset/clear held HIGH = inactive for normal clocking).
const st = { d1: 0, clk1: 0, pr1: 1, cl1: 1, d2: 0, clk2: 0, pr2: 1, cl2: 1 };

function solve() {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x1074 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('1D', st.d1 ? 1 : 0);
  wirePin('1CLK', st.clk1 ? 1 : 0);
  wirePin('1PRn', st.pr1 ? 1 : 0);
  wirePin('1CLn', st.cl1 ? 1 : 0);
  wirePin('2D', st.d2 ? 1 : 0);
  wirePin('2CLK', st.clk2 ? 1 : 0);
  wirePin('2PRn', st.pr2 ? 1 : 0);
  wirePin('2CLn', st.cl2 ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const Q = (n) => isHigh(read(`${n}Q`)) ? 1 : 0;
const Qn = (n) => isHigh(read(`${n}Qn`)) ? 1 : 0;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const checkCompl = (ctx) => {
  assert(Q(1) !== Qn(1), `${ctx}: 1Qn must be complement of 1Q`);
  assert(Q(2) !== Qn(2), `${ctx}: 2Qn must be complement of 2Q`);
};

// ── 0. Async active-LOW clear forces Q=0 regardless of clock ──────────────────
st.cl1 = 0; solve();
assert(Q(1) === 0, 'async clear: 1Q should be 0');
assert(Qn(1) === 1, 'async clear: 1Qn should be 1');
st.cl1 = 1; solve();
checkCompl('after clear');

// ── 1. Async active-LOW preset forces Q=1 regardless of clock ─────────────────
st.pr1 = 0; solve();
assert(Q(1) === 1, 'async preset: 1Q should be 1');
st.pr1 = 1; solve();

// reset to known LOW for edge tests
st.cl1 = 0; solve(); st.cl1 = 1; solve();

// ── 2. RISING edge must NOT capture D ─────────────────────────────────────────
st.d1 = 1; st.clk1 = 0; solve();   // present D=1, clock low
st.clk1 = 1; solve();              // LOW→HIGH rising edge: negative-edge part ignores
assert(Q(1) === 0, 'rising edge must NOT capture (1Q should still be 0)');

// ── 3. FALLING edge captures D ────────────────────────────────────────────────
st.clk1 = 0; solve();              // HIGH→LOW falling edge captures D=1
assert(Q(1) === 1, 'falling edge should capture D=1 into 1Q');
checkCompl('after falling capture');

// ── 4. Data changing while clock LOW must NOT change Q (edge-only) ─────────────
st.d1 = 0; solve();                // clock stays low, D changes
assert(Q(1) === 1, 'level change while CLK low must hold (1Q=1)');
// clock back high (rising) still no capture
st.clk1 = 1; solve();
assert(Q(1) === 1, 'rising edge after data change must not capture');
// now falling edge captures the new D=0
st.clk1 = 0; solve();
assert(Q(1) === 0, 'falling edge should capture new D=0');

// ── 5. Second flip flop is independent ────────────────────────────────────────
st.d2 = 1; st.clk2 = 0; solve();
st.clk2 = 1; solve();              // rising: ignored
assert(Q(2) === 0, 'FF2 rising edge must not capture');
st.clk2 = 0; solve();             // falling: capture
assert(Q(2) === 1, 'FF2 falling edge should capture D=1');
assert(Q(1) === 0, 'FF1 must be unaffected by FF2 clocking');
checkCompl('independence');

console.log(`74x1074-dual-dff-neg: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
