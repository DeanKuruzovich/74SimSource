// ── CD4042 quad clocked "D" latch regression ────────────────────────────────
// The CD4042 (Batch 4, js/chips/chips91.js) maps onto the dedicated
// D_LATCH_QUAD_4042 engine primitive. Four latches share one common CLOCK whose
// active level is set by a single POLARITY input — there is NO per-latch enable
// pin (so the 74375 D_LATCH_QUAD_COMPL primitive did not fit; see issues.md).
//
// Datasheet truth table (TI CD4042B SCHS040D, Fig. 1):
//   transparent (Q follows D) when CLOCK == POLARITY; hold otherwise.
//     POLARITY=0 → transparent while CLOCK LOW,  latch on CLOCK 0→1 (rising).
//     POLARITY=1 → transparent while CLOCK HIGH, latch on CLOCK 1→0 (falling).
//
// Method: place ONE CD4042 and keep the same chip + sim instance across the run
// so the latch state (comp.state) persists. Inputs are re-wired HIGH/LOW each
// solve; Q and Q-bar are read straight off the pins by name.
//
// Checks:
//   • POLARITY=0, CLOCK=0 → transparent: Q tracks D, Qn = !Q
//   • POLARITY=0, CLOCK=1 → hold: outputs ignore changing D (latched on rising)
//   • return to CLOCK=0    → transparent again, picks up the new D
//   • POLARITY=1, CLOCK=1 → transparent: Q tracks D
//   • POLARITY=1, CLOCK=0 → hold: outputs ignore changing D (latched on falling)
//   • complementary outputs are always the inverse of the true outputs
//
// Run:  node js/debug/scenarios/cd4042-quad-d-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4042');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input held at the given rail level (1 = VCC row, 0 = GND
// row). A fresh WireManager each call is fine — the latch state lives on the
// (persistent) chip component, not the wires.
function apply({ d1, d2, d3, d4, clk, pol }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4042 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('D1', d1 ? 1 : 0);
  wirePin('D2', d2 ? 1 : 0);
  wirePin('D3', d3 ? 1 : 0);
  wirePin('D4', d4 ? 1 : 0);
  wirePin('CLOCK', clk ? 1 : 0);
  wirePin('POLARITY', pol ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Assert the four true outputs match [q1,q2,q3,q4] AND each complement is the
// inverse of its true output.
function expectQ(tag, [q1, q2, q3, q4]) {
  const want = { Q1: q1, Q2: q2, Q3: q3, Q4: q4 };
  for (const [q, v] of Object.entries(want)) {
    const got = read(q);
    assert(v ? isHigh(got) : isLow(got),
      `${tag}: ${q} expected ${v ? 'HIGH' : 'LOW'}, got ${got.toFixed(2)} V`);
    const qn = q + 'n';
    const gotN = read(qn);
    assert(v ? isLow(gotN) : isHigh(gotN),
      `${tag}: ${qn} (complement) expected ${v ? 'LOW' : 'HIGH'}, got ${gotN.toFixed(2)} V`);
  }
}

// ── POLARITY = 0 (transparent while CLOCK LOW, latch on rising edge) ──────────

// 1. Transparent: CLOCK=0 → Q follows D = [1,0,1,0]
apply({ d1: 1, d2: 0, d3: 1, d4: 0, clk: 0, pol: 0 });
expectQ('pol0 transparent', [1, 0, 1, 0]);

// 2. Latch on the rising edge: take CLOCK HIGH, then change D — outputs HOLD.
apply({ d1: 0, d2: 1, d3: 0, d4: 1, clk: 1, pol: 0 });
expectQ('pol0 hold (D changed while CLOCK HIGH)', [1, 0, 1, 0]);

// 3. Return CLOCK LOW → transparent again → picks up the new D = [0,1,0,1].
apply({ d1: 0, d2: 1, d3: 0, d4: 1, clk: 0, pol: 0 });
expectQ('pol0 transparent again', [0, 1, 0, 1]);

// ── POLARITY = 1 (transparent while CLOCK HIGH, latch on falling edge) ────────

// 4. Transparent: CLOCK=1 → Q follows D = [1,1,1,1]
apply({ d1: 1, d2: 1, d3: 1, d4: 1, clk: 1, pol: 1 });
expectQ('pol1 transparent', [1, 1, 1, 1]);

// 5. Latch on the falling edge: take CLOCK LOW, change D → outputs HOLD all-HIGH.
apply({ d1: 0, d2: 0, d3: 0, d4: 0, clk: 0, pol: 1 });
expectQ('pol1 hold (D changed while CLOCK LOW)', [1, 1, 1, 1]);

// 6. Return CLOCK HIGH → transparent again → picks up D = [0,0,0,0].
apply({ d1: 0, d2: 0, d3: 0, d4: 0, clk: 1, pol: 1 });
expectQ('pol1 transparent again', [0, 0, 0, 0]);

console.log(`cd4042-quad-d-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
