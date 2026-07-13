// ── CD4031 64-stage static SISO shift register — regression ──────────────────
// The CD4031 (Batch 9, js/chips/chips164.js) is the first behavioral coverage of
// the new SHIFT_REG_64BIT_4031 primitive. The coverage-plan hint mapped it onto
// the inert SHIFT_REG_16BIT_STUB; this scenario guards the real model:
//   1. 64-stage latency — a single 1 injected on DATA IN 1 reaches Q (stage 64)
//      after EXACTLY 64 rising clock edges, and not before.
//   2. Q-bar (pin 7) is the complement of Q (pin 6).
//   3. Q' (pin 5) lags Q by half a clock: it is captured from stage 64 on the
//      FALLING edge, so right after a rising edge Q can differ from Q', and after
//      the following falling edge Q' equals Q.
//   4. MODE CONTROL selects the input: MODE=1 routes DATA IN 2 (recirculate) into
//      stage 1 and blocks DATA IN 1; MODE=0 routes DATA IN 1.
//   5. CL_D (pin 9) follows the clock level (delayed clock out).
//   6. Static hold — no clock edge means no change.
//
// Method (mirrors cd4021-piso-shift.mjs / cd4020-ripple-counter.mjs): place ONE
// CD4031 and keep the same chip + sim instance for the whole run so the register's
// sequential state persists. Each input pin is wired to the VCC row (1) or GND row
// (0) before every solve. A clock pulse is LOW→HIGH→LOW on CLK; the shift happens
// on the rising edge.
//
// Run:  node js/debug/scenarios/cd4031-shift-register.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4031');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply({ clk = 0, mode = 0, di1 = 0, di2 = 0 } = {}) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4031 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK',  clk  ? 1 : 0);
  wirePin('MODE', mode ? 1 : 0);
  wirePin('DI1',  di1  ? 1 : 0);
  wirePin('DI2',  di2  ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const Q    = () => isHigh(read('Q'))    ? 1 : 0;
const QBAR = () => isHigh(read('QBAR')) ? 1 : 0;
const QP   = () => isHigh(read('QP'))   ? 1 : 0;
const CLD  = () => isHigh(read('CLD'))  ? 1 : 0;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One full clock pulse with the given input levels held across both half-cycles.
function pulse({ mode = 0, di1 = 0, di2 = 0 } = {}) {
  apply({ clk: 1, mode, di1, di2 });   // rising edge → shift
  apply({ clk: 0, mode, di1, di2 });   // falling edge → 1/2 stage captures Q
}

// Flush 65 zeros to guarantee a known all-zero register + half stage.
function clearRegister() {
  for (let i = 0; i < 65; i++) pulse({ mode: 0, di1: 0, di2: 0 });
}

// ── 1. 64-stage latency on DATA IN 1 (MODE=0) ────────────────────────────────
clearRegister();
assert(Q() === 0, `after clear, Q should be 0, got ${Q()}`);

// Edge 1: inject a single 1, then zeros behind it.
apply({ clk: 1, mode: 0, di1: 1 });   // rising edge #1 → stage 1 = 1
apply({ clk: 0, mode: 0, di1: 0 });
assert(Q() === 0, `edge 1: the injected 1 is at stage 1, Q (stage 64) must still be 0, got ${Q()}`);

// Edges 2..63: keep clocking zeros; Q must stay 0 the whole way.
let qWentHighEarly = false;
for (let edge = 2; edge <= 63; edge++) {
  pulse({ mode: 0, di1: 0 });
  if (Q() === 1) qWentHighEarly = true;
}
assert(!qWentHighEarly, 'Q went HIGH before the 64th clock edge (latency wrong)');
assert(Q() === 0, `after 63 edges, Q must still be 0, got ${Q()}`);

// Edge 64: the bit reaches stage 64 → Q = 1.
pulse({ mode: 0, di1: 0 });
assert(Q() === 1, `edge 64: the injected bit should reach Q, got ${Q()}`);

// ── 2. Q-bar is the complement of Q ──────────────────────────────────────────
assert(QBAR() === 0, `Q-bar should be complement of Q (Q=1 → Qbar=0), got ${QBAR()}`);

// ── 3. Q' lags Q by half a clock ─────────────────────────────────────────────
// State: Q=1 (bit at stage 64), and the last falling edge set Q'=1 too.
assert(QP() === 1, `Q' should have captured the stage-64 = 1 on the last falling edge, got ${QP()}`);
// Apply ONLY a rising edge that shifts a 0 into stage 1 and pushes the 1 out of
// stage 64: now Q=0 immediately, but Q' still holds the old 1 (no falling edge yet).
apply({ clk: 1, mode: 0, di1: 0 });
assert(Q() === 0,  `after the rising edge the 1 left stage 64, Q should be 0, got ${Q()}`);
assert(QP() === 1, `Q' must still hold the previous value (1) until the falling edge — half-clock lag, got ${QP()}`);
// Now the falling edge: Q' captures the new stage 64 (=0).
apply({ clk: 0, mode: 0, di1: 0 });
assert(QP() === 0, `after the falling edge Q' should equal the new Q (0), got ${QP()}`);

// ── 4. MODE CONTROL selects the input ────────────────────────────────────────
// 4a. MODE=1 routes DATA IN 2 into the chain (DATA IN 1 forced 1 but ignored).
clearRegister();
apply({ clk: 1, mode: 1, di1: 0, di2: 1 });   // edge 1 via DI2
apply({ clk: 0, mode: 1, di1: 0, di2: 0 });
for (let edge = 2; edge <= 64; edge++) pulse({ mode: 1, di1: 1, di2: 0 }); // DI1=1 must NOT enter
assert(Q() === 1, `MODE=1: the DATA IN 2 bit should reach Q after 64 edges, got ${Q()}`);

// 4b. MODE=1 blocks DATA IN 1 entirely: 64 edges of DI1=1, DI2=0 leave Q at 0.
clearRegister();
for (let edge = 1; edge <= 64; edge++) pulse({ mode: 1, di1: 1, di2: 0 });
assert(Q() === 0, `MODE=1 must block DATA IN 1; Q should stay 0, got ${Q()}`);

// ── 5. CL_D follows the clock level ──────────────────────────────────────────
apply({ clk: 1, mode: 0, di1: 0 });
assert(CLD() === 1, `CL_D should follow CLK high, got ${CLD()}`);
apply({ clk: 0, mode: 0, di1: 0 });
assert(CLD() === 0, `CL_D should follow CLK low, got ${CLD()}`);

// ── 6. Static hold: no clock edge → no change ────────────────────────────────
// Load a known 1 at stage 64 again, then re-solve at clk LOW without an edge.
clearRegister();
apply({ clk: 1, mode: 0, di1: 1 }); apply({ clk: 0, mode: 0, di1: 0 });
for (let edge = 2; edge <= 64; edge++) pulse({ mode: 0, di1: 0 });
assert(Q() === 1, `static-hold setup: Q should be 1, got ${Q()}`);
const before = Q();
apply({ clk: 0, mode: 0, di1: 0 });   // re-solve, still LOW → no edge
apply({ clk: 0, mode: 0, di1: 1 });   // change DI1 with no edge → still no change
assert(Q() === before, `static hold: register changed without a clock edge (${before} → ${Q()})`);

console.log(`cd4031-shift-register: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
