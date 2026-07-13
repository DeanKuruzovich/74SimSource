// ── CD40194 4-bit bidirectional universal shift register — regression ────────
// The CD40194 (js/chips/chips135.js) is the CMOS sibling of the 74194 and reuses
// the existing SHIFT_REG_4BIT_BIDIR_CLR engine primitive. This scenario guards
// the pin-name wiring of the new DB entry (pinout verified vs TI CD40194B
// SCHS197B FUNCTIONAL DIAGRAM + CONTROL TRUTH TABLE) against the four operating
// modes and the asynchronous active-LOW RESET:
//   RESET=0                       → all Q forced to 0 (async, no clock)
//   RESET=1, rising CLK, S1S0=00  → Hold
//   RESET=1, rising CLK, S1S0=01  → Shift Right (SR-IN→Q0, Q0→Q1→Q2→Q3)
//   RESET=1, rising CLK, S1S0=10  → Shift Left  (SL-IN→Q3, Q3→Q2→Q1→Q0)
//   RESET=1, rising CLK, S1S0=11  → Parallel Load (Q0..Q3 ← D0..D3)
//
// Method mirrors cd4021-piso-shift.mjs: one chip + one sim instance for the
// whole run so register state persists; each pin wired HIGH/LOW before a solve.
//
// Run:  node js/debug/scenarios/cd40194-bidir-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40194');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

let st = { reset: 1, clk: 0, s0: 0, s1: 0, sr: 0, sl: 0, D0: 0, D1: 0, D2: 0, D3: 0 };

function apply(patch = {}) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD40194 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('RESET', st.reset);
  wirePin('CLOCK', st.clk);
  wirePin('S0', st.s0);
  wirePin('S1', st.s1);
  wirePin('SR_IN', st.sr);
  wirePin('SL_IN', st.sl);
  wirePin('D0', st.D0);
  wirePin('D1', st.D1);
  wirePin('D2', st.D2);
  wirePin('D3', st.D3);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const q = () => [read('Q0'), read('Q1'), read('Q2'), read('Q3')].map((v) => (isHigh(v) ? 1 : 0));
const qStr = () => q().join('');

// rising clock edge with the given control levels, then return CLK low
function pulse(patch = {}) {
  apply({ ...patch, clk: 0 });
  apply({ clk: 1 });
  apply({ clk: 0 });
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg + ` (Q0..Q3=${qStr()})`); };
const eq = (got, want, msg) => assert(got.join('') === want.join(''), msg + ` want ${want.join('')}`);

// ── 1. Parallel load: D0..D3 = 1,0,1,1 → Q0..Q3 = 1,0,1,1 ────────────────────
pulse({ s0: 1, s1: 1, D0: 1, D1: 0, D2: 1, D3: 1 });
eq(q(), [1, 0, 1, 1], 'parallel load');

// ── 2. Hold: S1S0=00 keeps the value across a clock edge ─────────────────────
pulse({ s0: 0, s1: 0, D0: 0, D1: 0, D2: 0, D3: 0 });
eq(q(), [1, 0, 1, 1], 'hold across clock');

// ── 3. Shift right: SR-IN→Q0, each bit moves toward Q3 ───────────────────────
// Before: 1011. Shift right with SR-IN=0 → Q0=0, Q1=oldQ0=1, Q2=oldQ1=0, Q3=oldQ2=1
pulse({ s0: 1, s1: 0, sr: 0 });
eq(q(), [0, 1, 0, 1], 'shift right (SR-IN=0)');
// Shift right with SR-IN=1 → Q0=1, Q1=oldQ0=0, Q2=oldQ1=1, Q3=oldQ2=0
pulse({ s0: 1, s1: 0, sr: 1 });
eq(q(), [1, 0, 1, 0], 'shift right (SR-IN=1)');

// ── 4. Shift left: SL-IN→Q3, each bit moves toward Q0 ────────────────────────
// Before: Q0..Q3 = 1010. Shift left SL-IN=0 → Q3=0, Q2=oldQ3=0, Q1=oldQ2=1, Q0=oldQ1=0
pulse({ s0: 0, s1: 1, sl: 0 });
eq(q(), [0, 1, 0, 0], 'shift left (SL-IN=0)');
// Shift left SL-IN=1 → Q3=1, Q2=oldQ3=0, Q1=oldQ2=0, Q0=oldQ1=1
pulse({ s0: 0, s1: 1, sl: 1 });
eq(q(), [1, 0, 0, 1], 'shift left (SL-IN=1)');

// ── 5. Asynchronous RESET: forces all Q LOW with no clock edge ───────────────
apply({ reset: 0, clk: 0 });
eq(q(), [0, 0, 0, 0], 'async reset (RESET=0, no clock)');

// RESET held LOW dominates a clock edge in parallel-load mode
pulse({ reset: 0, s0: 1, s1: 1, D0: 1, D1: 1, D2: 1, D3: 1 });
eq(q(), [0, 0, 0, 0], 'reset dominates parallel load');

if (failures.length) {
  console.error('CD40194 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD40194 bidirectional shift register: all checks passed');
