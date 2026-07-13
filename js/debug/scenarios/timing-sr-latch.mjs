// ── Timing engine: user-built NAND SR latch settles, doesn't oscillate ───────
// Two cross-coupled 74x00 NAND gates (a hand-wired S̄R̄ latch). In timing mode
// a SET pulse must ripple through: Q rises one tPD after S̄ falls, Q̄ falls one
// tPD after that, and then the latch is STABLE — the event queue drains and
// nothing re-fires. Feedback + transport delay is the classic way to blow up
// an event-driven simulator, so this guards convergence explicitly.
//
//   S̄ ──▷ NAND1 ── Q ──┐      S̄/R̄ idle HIGH (LS floating inputs read HIGH);
//         ▲            │      a switch to GND pulls one low to pulse it.
//         └── Q̄ ◁──────┘
//   R̄ ──▷ NAND2 ── Q̄
//
// Run:  node js/debug/scenarios/timing-sr-latch.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import { ChipComponent, SwitchComponent } from '../../components.js';
import { CircuitHarness } from '../harness.mjs';
import { CHIP_TPD_NS } from '../../timing.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const h = new CircuitHarness(); // LS
const NAND = CHIP_TPD_NS['74x00'] * 1000; // ps

const chip = new ChipComponent('74x00'); // gate1: 1A,1B→1Y   gate2: 2A,2B→2Y
chip.place(0, 0, 10, 4);
h.components.push(chip);

const pin = (name) => chip.getPinByName(name).holeId;
const wm = h.wireManager;
wm.addWire(holeId(0, 0, 'power', 5, 1), pin('VCC'));
wm.addWire(holeId(0, 0, 'power', 5, 0), pin('GND'));
// Cross-couple: Q (1Y) → 2A, Q̄ (2Y) → 1B. S̄ = 1A, R̄ = 2B.
wm.addWire(pin('1Y'), pin('2A'));
wm.addWire(pin('2Y'), pin('1B'));

// S̄ and R̄ pulled LOW through switches to GND; open switch = floating = HIGH (LS).
const sSwitch = new SwitchComponent();
sSwitch.placeWireLike(pin('1A'), holeId(0, 0, 'power', 8, 0));
h.components.push(sSwitch);
const rSwitch = new SwitchComponent();
rSwitch.placeWireLike(pin('2B'), holeId(0, 0, 'power', 12, 0));
h.components.push(rSwitch);

// Define the initial state: reset pulse in live mode (R̄ low), then release.
h.setSwitch(rSwitch, true);
h.setSwitch(rSwitch, false);
h.evaluate();

h.enableTiming();
h.watch(pin('1Y'), 'Q').watch(pin('2Y'), 'Qn');

// Idle: latch holds reset (Q=0, Q̄=1), queue drains, nothing oscillates.
h.advanceNs(200);
let q = h.transitions('Q'), qn = h.transitions('Qn');
assert(q.length === 1 && q[0].level === 0, `idle: Q must stay 0 with no extra events, got ${JSON.stringify(q)}`);
assert(qn.length === 1 && qn[0].level === 1, `idle: Q̄ must stay 1, got ${JSON.stringify(qn)}`);
assert(h.timing._heap.length === 0, 'idle: event queue must be empty (latch stable)');

// SET pulse at t=200ns: S̄ → 0.
h.setSwitch(sSwitch, true);
h.advanceNs(100);

q = h.transitions('Q'); qn = h.transitions('Qn');
// Q rises one NAND delay after S̄ falls; Q̄ falls one more delay later.
assert(q.length === 2 && q[1].tPs === 200_000 + NAND && q[1].level === 1,
  `set: Q should rise once at ${200_000 + NAND} ps, got ${JSON.stringify(q.map(t => [t.tPs, t.level]))}`);
assert(qn.length === 2 && qn[1].tPs === 200_000 + 2 * NAND && qn[1].level === 0,
  `set: Q̄ should fall once at ${200_000 + 2 * NAND} ps, got ${JSON.stringify(qn.map(t => [t.tPs, t.level]))}`);
assert(h.timing._heap.length === 0, 'set: queue must drain (no oscillation after latching)');

// Release S̄ (back to floating HIGH): latch HOLDS — no further transitions.
h.setSwitch(sSwitch, false);
h.advanceNs(100);
q = h.transitions('Q'); qn = h.transitions('Qn');
assert(q.length === 2, `hold: releasing S̄ must not change Q, got ${q.length} entries`);
assert(qn.length === 2, `hold: releasing S̄ must not change Q̄, got ${qn.length} entries`);
assert(h.timing._heap.length === 0, 'hold: queue must stay empty');

// The poke path must inject at the current time, NOT restart the analysis.
assert(h.timePs === 400_000, `time should be 400000 ps after 400ns, got ${h.timePs}`);

console.log(`timing-sr-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
