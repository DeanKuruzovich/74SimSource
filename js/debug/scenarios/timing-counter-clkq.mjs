// ── Timing engine: sequential chip clock→Q delay (74x161) ───────────────────
// A 74x161 synchronous binary counter clocked at 1 MHz. Every Q output must
// change exactly one chip tPD after the rising clock edge (LS CLK→Q typical
// from CHIP_TPD_NS), and the
// counter must count correctly — i.e. the engine's one-evaluation-per-event
// delivery does not double-trigger the prevClk edge detector.
//
// Control pins (CLR/LOAD/ENP/ENT) are left floating: LS inputs read HIGH,
// so the counter free-runs. Clock rising edges land at 500 ns + k·1000 ns.
//
// Run:  node js/debug/scenarios/timing-counter-clkq.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import { ChipComponent, ClockComponent } from '../../components.js';
import { CircuitHarness } from '../harness.mjs';
import { CHIP_TPD_NS } from '../../timing.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const h = new CircuitHarness(); // LS

const counter = new ChipComponent('74x161');
counter.place(0, 0, 10, 4);
h.components.push(counter);

const clk = new ClockComponent(1e6, 0.5);
clk.place(0, 0, 30, 2);
h.components.push(clk);

const wm = h.wireManager;
wm.addWire(holeId(0, 0, 'power', 5, 1), counter.getPinByName('VCC').holeId);
wm.addWire(holeId(0, 0, 'power', 5, 0), counter.getPinByName('GND').holeId);
wm.addWire(clk.pins[0].holeId, counter.getPinByName('CLK').holeId);

// No live evaluate() first: live mode samples performance.now() for the
// clock level and could clock the circuit nondeterministically before
// t=0. enableTiming() performs the entry settle itself, clocks held LOW.
h.enableTiming();
h.watch(counter.getPinByName('QA').holeId, 'QA');
h.watch(counter.getPinByName('QB').holeId, 'QB');
h.watch(counter.getPinByName('QC').holeId, 'QC');

h.advanceNs(4000); // four rising edges: 500, 1500, 2500, 3500 ns

const TPD = CHIP_TPD_NS['74x161'] * 1000; // ps — LS CLK→Q typical
const qa = h.transitions('QA');
const qb = h.transitions('QB');
const qc = h.transitions('QC');

// Counter starts at 0.
assert(qa[0].tPs === 0 && qa[0].level === 0, `QA must start 0, got ${JSON.stringify(qa[0])}`);

// QA toggles on every count: 0→1→2→3→4 gives QA = 1,0,1,0 at each edge + tPD.
const edgeNs = [500_000, 1_500_000, 2_500_000, 3_500_000]; // ps of clock edges
const qaWant = [[edgeNs[0] + TPD, 1], [edgeNs[1] + TPD, 0], [edgeNs[2] + TPD, 1], [edgeNs[3] + TPD, 0]];
assert(qa.length === 1 + qaWant.length,
  `QA should have ${1 + qaWant.length} entries, got ${qa.length}: ${JSON.stringify(qa.map(t => [t.tPs, t.level]))}`);
for (let i = 0; i < qaWant.length; i++) {
  const e = qa[i + 1];
  assert(e && e.tPs === qaWant[i][0] && e.level === qaWant[i][1],
    `QA edge ${i}: expected (${qaWant[i][0]}ps, ${qaWant[i][1]}), got ${JSON.stringify(e)}`);
}

// QB rises at count 2 (edge 1) and falls at count 4 (edge 3), both + tPD.
const qbWant = [[edgeNs[1] + TPD, 1], [edgeNs[3] + TPD, 0]];
assert(qb.length === 1 + qbWant.length,
  `QB should have ${1 + qbWant.length} entries, got ${qb.length}: ${JSON.stringify(qb.map(t => [t.tPs, t.level]))}`);
for (let i = 0; i < qbWant.length; i++) {
  const e = qb[i + 1];
  assert(e && e.tPs === qbWant[i][0] && e.level === qbWant[i][1],
    `QB edge ${i}: expected (${qbWant[i][0]}ps, ${qbWant[i][1]}), got ${JSON.stringify(e)}`);
}

// QC rises at count 4 (edge 3) + tPD and stays.
const qcWant = [[edgeNs[3] + TPD, 1]];
assert(qc.length === 1 + qcWant.length,
  `QC should have ${1 + qcWant.length} entries, got ${qc.length}: ${JSON.stringify(qc.map(t => [t.tPs, t.level]))}`);
assert(qc[1] && qc[1].tPs === qcWant[0][0] && qc[1].level === 1,
  `QC edge: expected (${qcWant[0][0]}ps, 1), got ${JSON.stringify(qc[1])}`);

console.log(`timing-counter-clkq: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
