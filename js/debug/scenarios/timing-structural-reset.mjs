// ── Timing engine: pokes inject, structural edits restart at t=0 ─────────────
// The engine distinguishes two kinds of external change routed through
// CircuitSimulator.evaluate() while active:
//   • POKE (switch flip, value edit): injected at the current sim time —
//     the run continues, recorder history is preserved.
//   • STRUCTURAL (add/move/delete a component or wire): the analysis restarts
//     at t=0 with a fresh recorder, and the onReset callback fires (the UI
//     uses it to clear the diagram and toast the user).
//
// Run:  node js/debug/scenarios/timing-structural-reset.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import { ChipComponent, SwitchComponent } from '../../components.js';
import { CircuitHarness } from '../harness.mjs';
import { CHIP_TPD_NS } from '../../timing.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const h = new CircuitHarness(); // LS
const INV = CHIP_TPD_NS['74x04'] * 1000; // ps

const inv = new ChipComponent('74x04');
inv.place(0, 0, 10, 4);
h.components.push(inv);

const wm = h.wireManager;
wm.addWire(holeId(0, 0, 'power', 5, 1), inv.getPinByName('VCC').holeId);
wm.addWire(holeId(0, 0, 'power', 5, 0), inv.getPinByName('GND').holeId);

const sw = new SwitchComponent();
sw.placeWireLike(inv.getPinByName('1A').holeId, holeId(0, 0, 'power', 8, 0));
sw.on = true; // input LOW → 1Y HIGH
h.components.push(sw);

h.evaluate();
h.enableTiming();
h.watch(inv.getPinByName('1Y').holeId, 'Y');

// ── Poke: time keeps running, history accumulates ────────────────────────────
h.advanceNs(300);
h.setSwitch(sw, false); // input floats HIGH (LS) → Y falls one tPD later
h.advanceNs(100);

let y = h.transitions('Y');
assert(h.timePs === 400_000, `poke must not reset time: expected 400000 ps, got ${h.timePs}`);
assert(y.length === 2 && y[1].tPs === 300_000 + INV && y[1].level === 0,
  `Y should fall at ${300_000 + INV} ps after the poke, got ${JSON.stringify(y.map(t => [t.tPs, t.level]))}`);

// ── Structural change: new wire → restart at t=0 ────────────────────────────
let resetFired = false;
h.timing.onReset = () => { resetFired = true; };

// Tie the second inverter's input high-ish by wiring it to the first's output
// (any new wire is a structural edit).
wm.addWire(inv.getPinByName('1Y').holeId, inv.getPinByName('2A').holeId);
h.markChanged(); // app path: mutate → evaluate() → engine sees new structure

assert(resetFired, 'structural change must fire onReset');
assert(h.timePs === 0, `structural change must restart at t=0, got ${h.timePs}`);
y = h.transitions('Y');
assert(y.length === 1 && y[0].tPs === 0,
  `recorder must restart with a single t=0 sample, got ${JSON.stringify(y.map(t => [t.tPs, t.level]))}`);

// The engine keeps working after the reset: poke again, edge arrives on time.
h.advanceNs(50);
h.setSwitch(sw, true); // input LOW → Y rises one tPD later
h.advanceNs(50);
y = h.transitions('Y');
assert(y.length === 2 && y[1].tPs === 50_000 + INV && y[1].level === 1,
  `post-reset poke: Y should rise at ${50_000 + INV} ps, got ${JSON.stringify(y.map(t => [t.tPs, t.level]))}`);

console.log(`timing-structural-reset: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
