// ── Timing engine: clock edges are exact sim-time events ─────────────────────
// In propagation-delay analysis mode (js/timing.js), CLOCK components are
// event sources scheduled in integer picoseconds — not sampled from
// performance.now() like live mode. This scenario guards:
//   • the entry convention: t=0 starts with every clock at the beginning of
//     its LOW phase, first rising edge one full LOW portion after t=0
//   • ps-exact edge times for a 50% clock and an asymmetric-duty clock
//   • full determinism (no wall-clock reads anywhere in the mode)
//
// Run:  node js/debug/scenarios/timing-clock-exact.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import { CircuitHarness } from '../harness.mjs';
import { ClockComponent } from '../../components.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const h = new CircuitHarness();

// 1 kHz, 50% duty: period 1e9 ps → LOW 5e8, rise @5e8, fall @1e9, rise @1.5e9.
const clkA = new ClockComponent(1000, 0.5);
clkA.place(0, 0, 5, 2);
h.components.push(clkA);

// 12.5 kHz, 25% duty: period 8e7 ps → HIGH 2e7 / LOW 6e7.
// Rise @6e7, fall @8e7, rise @1.4e8, fall @1.6e8.
const clkB = new ClockComponent(12500, 0.25);
clkB.place(0, 0, 10, 2);
h.components.push(clkB);

// A GND reference somewhere on the board — without one the MNA solver has no
// reference node and no net voltage can be resolved (physically fair: you
// can't measure a voltage without a return path).
h.wireManager.addWire(holeId(0, 0, 'power', 20, 0), holeId(0, 0, 'main', 50, 7));

h.enableTiming();

// Clocks are auto-watched as lanes labelled "CLK <id>".
h.advanceNs(2_000_000); // 2 ms

const trA = h.transitions(`CLK ${clkA.id}`);
const trB = h.transitions(`CLK ${clkB.id}`);

// Lane starts LOW at t=0 (entry convention).
assert(trA.length > 0 && trA[0].tPs === 0 && trA[0].level === 0,
  `clkA initial sample should be (0ps, 0), got ${JSON.stringify(trA[0])}`);

// 1 kHz edge times, exact to the picosecond.
const expA = [
  [500_000_000, 1], [1_000_000_000, 0], [1_500_000_000, 1], [2_000_000_000, 0],
];
for (let i = 0; i < expA.length; i++) {
  const tr = trA[i + 1];
  assert(tr && tr.tPs === expA[i][0] && tr.level === expA[i][1],
    `clkA edge ${i}: expected (${expA[i][0]}ps, ${expA[i][1]}), got ${JSON.stringify(tr)}`);
}

// 12.5 kHz / 25% duty edge times.
const expB = [
  [60_000_000, 1], [80_000_000, 0], [140_000_000, 1], [160_000_000, 0],
  [220_000_000, 1], [240_000_000, 0],
];
for (let i = 0; i < expB.length; i++) {
  const tr = trB[i + 1];
  assert(tr && tr.tPs === expB[i][0] && tr.level === expB[i][1],
    `clkB edge ${i}: expected (${expB[i][0]}ps, ${expB[i][1]}), got ${JSON.stringify(tr)}`);
}

// 2 ms of a 1 kHz clock = 4 edges (+1 initial sample).
assert(trA.length === 5, `clkA should have exactly 5 entries, got ${trA.length}`);
// 2 ms of 12.5 kHz = 25 periods × 2 edges = 50 edges (+1 initial).
assert(trB.length === 51, `clkB should have exactly 51 entries, got ${trB.length}`);

// Determinism: a second identical run must produce identical transitions.
const h2 = new CircuitHarness();
const clkA2 = new ClockComponent(1000, 0.5);
clkA2.place(0, 0, 5, 2);
h2.components.push(clkA2);
const clkB2 = new ClockComponent(12500, 0.25);
clkB2.place(0, 0, 10, 2);
h2.components.push(clkB2);
h2.wireManager.addWire(holeId(0, 0, 'power', 20, 0), holeId(0, 0, 'main', 50, 7));
h2.enableTiming();
h2.advanceNs(2_000_000);
const trA2 = h2.transitions(`CLK ${clkA2.id}`).map(t => [t.tPs, t.level]);
assert(JSON.stringify(trA2) === JSON.stringify(trA.map(t => [t.tPs, t.level])),
  'second run of clkA must be transition-identical (determinism)');

console.log(`timing-clock-exact: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
