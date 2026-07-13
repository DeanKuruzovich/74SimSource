// ── Timing engine: static-1 hazard produces a real glitch ────────────────────
// Y = A AND (NOT A) is identically 0 on paper. With real propagation delay the
// inverter's output lags A by one tPD, so on every RISING edge of A both AND
// inputs sit HIGH for one inverter-tPD and Y emits a spike one AND-delay later —
// the textbook static hazard this analysis mode exists to demonstrate.
//
//   A ────────────┬──────────▷ AND ── Y
//                 └─▷ INV ───▷
//
// Expected per rising edge of A (A rises at t):
//   Y rises at t + tPD(AND)          (AND sees A=1 while Ā is still 1)
//   Y falls at t + tPD(INV) + tPD(AND) (Ā's fall reaches the AND one tPD later)
// Falling edges of A produce NO glitch (AND sees A=0 immediately).
//
// Run:  node js/debug/scenarios/timing-hazard-glitch.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import { ChipComponent, ClockComponent } from '../../components.js';
import { CircuitHarness } from '../harness.mjs';
import { CHIP_TPD_NS } from '../../timing.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const h = new CircuitHarness(); // LS datasheet typicals (CHIP_TPD_NS)
const INV = CHIP_TPD_NS['74x04'] * 1000; // ps
const AND = CHIP_TPD_NS['74x08'] * 1000; // ps

const inv = new ChipComponent('74x04');
inv.place(0, 0, 5, 4);
h.components.push(inv);

const and = new ChipComponent('74x08');
and.place(0, 0, 20, 4);
h.components.push(and);

const clk = new ClockComponent(1e6, 0.5); // A: rises @500ns, falls @1000ns, …
clk.place(0, 0, 40, 2);
h.components.push(clk);

const wm = h.wireManager;
for (const chip of [inv, and]) {
  wm.addWire(holeId(0, 0, 'power', chip === inv ? 2 : 18, 1), chip.getPinByName('VCC').holeId);
  wm.addWire(holeId(0, 0, 'power', chip === inv ? 2 : 18, 0), chip.getPinByName('GND').holeId);
}
wm.addWire(clk.pins[0].holeId, inv.getPinByName('1A').holeId);   // A → inverter
wm.addWire(clk.pins[0].holeId, and.getPinByName('1A').holeId);   // A → AND input 1
wm.addWire(inv.getPinByName('1Y').holeId, and.getPinByName('1B').holeId); // Ā → AND input 2

// No live evaluate() first: live mode samples performance.now() for the
// clock level and could clock the circuit nondeterministically before
// t=0. enableTiming() performs the entry settle itself, clocks held LOW.
h.enableTiming();
h.watch(and.getPinByName('1Y').holeId, 'Y');

h.advanceNs(2600); // three rising edges of A (500, 1500, 2500 ns)

const tr = h.transitions('Y');

// t=0: A=0, Ā=1 → Y=0.
assert(tr.length > 0 && tr[0].tPs === 0 && tr[0].level === 0,
  `Y initial should be (0, 0), got ${JSON.stringify(tr[0])}`);

// Exactly three glitches — one per rising edge, none on falling edges.
// Y rises one AND-delay after the edge; falls one inverter-delay later still.
const exp = [500_000, 1_500_000, 2_500_000]
  .flatMap(e => [[e + AND, 1], [e + INV + AND, 0]]);
assert(tr.length === 1 + exp.length,
  `Y should have exactly ${1 + exp.length} entries (3 glitches), got ${tr.length}: ` +
  JSON.stringify(tr.map(t => [t.tPs, t.level])));
for (let i = 0; i < exp.length; i++) {
  const e = tr[i + 1];
  assert(e && e.tPs === exp[i][0] && e.level === exp[i][1],
    `Y transition ${i}: expected (${exp[i][0]}ps, ${exp[i][1]}), got ${JSON.stringify(e)}`);
}

// Glitch width is exactly one inverter tPD.
if (tr.length >= 3) {
  const width = tr[2].tPs - tr[1].tPs;
  assert(width === INV, `glitch width should be ${INV} ps, got ${width}`);
}

console.log(`timing-hazard-glitch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
