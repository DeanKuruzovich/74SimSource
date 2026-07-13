// ── Timing engine: a gated ring oscillator actually oscillates ───────────────
// A ring of inverting gates has no DC fixed point. Live mode freezes it at the
// settle-loop's 30-iteration cap (issues.md A1/A4). In timing mode the loop
// becomes a real oscillator: one edge travels the ring, and the period is
// 2 × Σ tPD of the three stages (LS datasheet typicals from CHIP_TPD_NS).
//
//   EN ──▷ NAND ── A ──▷ INV1 ── B ──▷ INV2 ── C ──┐
//          ▲                                       │
//          └───────────────────────────────────────┘
//
// The NAND gate is the enable: EN low (switch closed to GND) parks the ring
// stable; opening the switch (LS floating input reads HIGH) launches exactly
// one wavefront that then circulates forever. This is also the physically
// buildable version of the circuit.
//
// Run:  node js/debug/scenarios/timing-ring-oscillator.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import { ChipComponent, SwitchComponent } from '../../components.js';
import { CircuitHarness } from '../harness.mjs';
import { CHIP_TPD_NS } from '../../timing.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const h = new CircuitHarness(); // LS
const NAND = CHIP_TPD_NS['74x00'] * 1000; // ps
const INV = CHIP_TPD_NS['74x04'] * 1000;  // ps
const LOOP = NAND + 2 * INV;              // one traversal of the ring

const nand = new ChipComponent('74x00');
nand.place(0, 0, 5, 4);
h.components.push(nand);

const inv = new ChipComponent('74x04');
inv.place(0, 0, 20, 4);
h.components.push(inv);

const wm = h.wireManager;
wm.addWire(holeId(0, 0, 'power', 2, 1), nand.getPinByName('VCC').holeId);
wm.addWire(holeId(0, 0, 'power', 2, 0), nand.getPinByName('GND').holeId);
wm.addWire(holeId(0, 0, 'power', 18, 1), inv.getPinByName('VCC').holeId);
wm.addWire(holeId(0, 0, 'power', 18, 0), inv.getPinByName('GND').holeId);
// Ring: NAND.1Y (A) → INV1 → B → INV2 → C → back to NAND.1B.
wm.addWire(nand.getPinByName('1Y').holeId, inv.getPinByName('1A').holeId);
wm.addWire(inv.getPinByName('1Y').holeId, inv.getPinByName('2A').holeId);
wm.addWire(inv.getPinByName('2Y').holeId, nand.getPinByName('1B').holeId);

// Enable: NAND.1A through a switch to GND. Closed = EN low = ring parked.
const enSwitch = new SwitchComponent();
enSwitch.placeWireLike(nand.getPinByName('1A').holeId, holeId(0, 0, 'power', 10, 0));
enSwitch.on = true;
h.components.push(enSwitch);

h.evaluate();
h.enableTiming();
h.watch(nand.getPinByName('1Y').holeId, 'A');
h.watch(inv.getPinByName('2Y').holeId, 'C');

// Parked: EN low → A=1, B=0, C=1, NAND(0,1)=1 — consistent, nothing fires.
h.advanceNs(100);
let a = h.transitions('A');
assert(a.length === 1 && a[0].level === 1,
  `parked ring must be stable at A=1 with no events, got ${JSON.stringify(a)}`);
assert(h.timing._heap.length === 0, 'parked: event queue must be empty');

// Launch at t=100ns: open the enable switch → EN floats HIGH.
h.setSwitch(enSwitch, false);
h.advanceNs(1000);

a = h.transitions('A');
const c = h.transitions('C');

// A toggles every ring traversal (NAND + 2×INV), starting one NAND delay
// after launch, alternating 0,1,0,…
assert(a.length > 20, `ring must oscillate (A has ${a.length} entries)`);
for (let k = 1; k < Math.min(a.length, 25); k++) {
  const expT = 100_000 + NAND + (k - 1) * LOOP;
  const expLevel = (k - 1) % 2 === 0 ? 0 : 1;
  assert(a[k].tPs === expT && a[k].level === expLevel,
    `A transition ${k}: expected (${expT}ps, ${expLevel}), got ${JSON.stringify(a[k])}`);
}

// C lags A by two inverter delays.
assert(c.length > 2 && c[1].tPs === 100_000 + NAND + 2 * INV && c[1].level === 0,
  `C first transition should be (${100_000 + NAND + 2 * INV}ps, 0), got ${JSON.stringify(c[1])}`);

// Period = 2 × (sum of stage delays), straight from the waveform.
if (a.length >= 4) {
  const period = a[3].tPs - a[1].tPs;
  assert(period === 2 * LOOP, `ring period should be ${2 * LOOP} ps, got ${period}`);
}

// A traveling wave keeps the queue tiny — this is an event-driven loop, not
// an event explosion.
assert(h.timing._heap.length < 10,
  `queue must stay bounded while oscillating, got ${h.timing._heap.length}`);
assert(h.timing.behind === false, 'ring must not blow the event budget');

console.log(`timing-ring-oscillator: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
