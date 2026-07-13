// ── 74x4015 dual 4-stage serial-in / parallel-out shift register — regression ──
// The 74x4015 (js/chips/chips57.js) was a documented stub with a wrong, hand-
// entered pinout (invented NC pins, omitted both Master Resets). It is now backed
// by the SHIFT_REG_DUAL4_SIPO_4015 primitive, verified against the TI CD74HC4015
// datasheet (SCHS198C) truth table & functional diagram. This scenario guards:
//   1. 4-stage latency — a single 1 injected on 1D reaches 1Q3 after EXACTLY 4
//      rising 1CP edges, laying out 1000 → 0100 → 0010 → 0001 across the outputs.
//   2. Active-HIGH asynchronous Master Reset — 1MR=1 clears 1Q0..1Q3 immediately,
//      with no clock edge.
//   3. The two sections are independent — clocking section 1 does not disturb
//      section 2, and 2MR only resets section 2.
//   4. Static hold — changing 1D with no clock edge does not change the outputs.
//
// Method mirrors cd4031-shift-register.mjs: one chip + one sim instance for the
// whole run so sequential state persists; each pin is wired HIGH or LOW before
// every solve; a clock pulse is LOW→HIGH→LOW with the shift on the rising edge.
//
// Run:  node js/debug/scenarios/74x4015-dual-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4015');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply({ cp1 = 0, d1 = 0, mr1 = 0, cp2 = 0, d2 = 0, mr2 = 0 } = {}) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x4015 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('1CP', cp1 ? 1 : 0);
  wirePin('1D',  d1  ? 1 : 0);
  wirePin('1MR', mr1 ? 1 : 0);
  wirePin('2CP', cp2 ? 1 : 0);
  wirePin('2D',  d2  ? 1 : 0);
  wirePin('2MR', mr2 ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);
const reg1 = () => [bit('1Q0'), bit('1Q1'), bit('1Q2'), bit('1Q3')];
const reg2 = () => [bit('2Q0'), bit('2Q1'), bit('2Q2'), bit('2Q3')];
const eq   = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One clock pulse on section 1 (inputs held across both half-cycles).
function pulse1({ d1 = 0 } = {}) {
  apply({ cp1: 1, d1 });   // rising edge → shift
  apply({ cp1: 0, d1 });   // falling edge → no change
}

// ── 1. 4-stage latency: a single 1 walks 1Q0 → 1Q3 ───────────────────────────
apply({ mr1: 1 });                 // async clear section 1
assert(eq(reg1(), [0, 0, 0, 0]), `after reset, 1Q should be 0000, got ${reg1()}`);
apply({ mr1: 0 });

pulse1({ d1: 1 });                                  // edge 1: 1D=1 enters 1Q0
assert(eq(reg1(), [1, 0, 0, 0]), `edge 1 → expected 1000, got ${reg1()}`);
pulse1({ d1: 0 });                                  // edge 2: zero behind it
assert(eq(reg1(), [0, 1, 0, 0]), `edge 2 → expected 0100, got ${reg1()}`);
pulse1({ d1: 0 });
assert(eq(reg1(), [0, 0, 1, 0]), `edge 3 → expected 0010, got ${reg1()}`);
pulse1({ d1: 0 });
assert(eq(reg1(), [0, 0, 0, 1]), `edge 4 → expected 0001, got ${reg1()}`);
pulse1({ d1: 0 });                                  // the 1 falls off the end
assert(eq(reg1(), [0, 0, 0, 0]), `edge 5 → 1 should fall off, expected 0000, got ${reg1()}`);

// ── 2. Asynchronous Master Reset clears without a clock edge ──────────────────
pulse1({ d1: 1 }); pulse1({ d1: 1 });               // load some 1s
assert(reg1().some((b) => b === 1), `setup: section 1 should hold some 1s, got ${reg1()}`);
apply({ mr1: 1 });                                  // MR high, clk LOW, no edge
assert(eq(reg1(), [0, 0, 0, 0]), `1MR=1 should clear section 1 async, got ${reg1()}`);
apply({ mr1: 0 });

// ── 3. The two sections are independent ──────────────────────────────────────
apply({ mr1: 1, mr2: 1 }); apply({ mr1: 0, mr2: 0 });   // both cleared
// Walk a 1 fully into section 2.
apply({ cp2: 1, d2: 1 }); apply({ cp2: 0, d2: 0 });
for (let i = 0; i < 3; i++) { apply({ cp2: 1, d2: 0 }); apply({ cp2: 0, d2: 0 }); }
assert(eq(reg2(), [0, 0, 0, 1]), `section 2 should hold 0001, got ${reg2()}`);
// Now clock section 1 hard; section 2 must not move.
for (let i = 0; i < 4; i++) pulse1({ d1: 1 });
assert(eq(reg2(), [0, 0, 0, 1]), `clocking section 1 disturbed section 2: got ${reg2()}`);
// And 1MR must not clear section 2.
apply({ mr1: 1 }); apply({ mr1: 0 });
assert(eq(reg2(), [0, 0, 0, 1]), `1MR wrongly cleared section 2: got ${reg2()}`);

// ── 4. Static hold: changing 1D with no edge does nothing ─────────────────────
apply({ mr1: 1 }); apply({ mr1: 0 });
pulse1({ d1: 1 });                                  // 1Q0 = 1
const before = reg1();
apply({ cp1: 0, d1: 1 });                           // re-solve, still LOW, no edge
apply({ cp1: 0, d1: 0 });                           // change 1D, still no edge
assert(eq(reg1(), before), `static hold: section 1 changed without an edge (${before} → ${reg1()})`);

console.log(`74x4015-dual-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
