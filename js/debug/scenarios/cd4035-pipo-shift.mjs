// ── CD4035 4-stage PIPO shift register, J-K serial in, T/C out — regression ──
// The CD4035 (Batch 9, js/chips/chips100.js) is the first behavioral coverage of
// the new SHIFT_REG_4BIT_PIPO_4035 primitive. It guards the ways the CD4035
// differs from the 7495-style SHIFT_REG_4BIT the coverage plan originally hinted:
//   1. ONE clock + a P/S level control (not MODE + two clocks). Parallel load is
//      SYNCHRONOUS (happens on the positive clock edge while P/S is HIGH).
//   2. Stage 1 is a J-K(bar) flip-flop: the 2nd serial input is K-BAR (already
//      complemented on the chip), so Q1next = J·(~Q1) + K_BAR·Q1. Tie J=K_BAR for
//      D-flip-flop (plain shift) operation.
//   3. Asynchronous ACTIVE-HIGH RESET clears all stages with no clock.
//   4. TRUE/COMPLEMENT (T/C) control inverts ALL outputs asynchronously while the
//      stored data is unchanged: T/C HIGH = true, T/C LOW = complement.
//
// Method (mirrors cd4021-piso-shift.mjs): place ONE CD4035 and reuse the same
// chip + sim instance for the whole run so sequential state persists. Each input
// pin is wired to the VCC row (1) or GND row (0) before a solve. A clock pulse is
// LOW→HIGH→LOW on CLOCK; transfers happen on the rising edge.
//
// Run:  node js/debug/scenarios/cd4035-pipo-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4035');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const PIN_DEFAULTS = { J:0, KBAR:0, RESET:0, CLOCK:0, PS:0, TC:1, I1:0, I2:0, I3:0, I4:0 };
let pinState = { ...PIN_DEFAULTS };

function apply(overrides = {}) {
  pinState = { ...pinState, ...overrides };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4035 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (const name of Object.keys(PIN_DEFAULTS)) wirePin(name, pinState[name]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const q = () => `Q1=${isHigh(read('Q1'))?1:0} Q2=${isHigh(read('Q2'))?1:0} Q3=${isHigh(read('Q3'))?1:0} Q4=${isHigh(read('Q4'))?1:0}`;

// One positive clock edge (then return low). Other pins keep their held state.
function clock(extra = {}) {
  apply({ ...extra, CLOCK: 1 });
  apply({ CLOCK: 0 });
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 0. Async reset clears everything (T/C HIGH so 0 reads as 0) ──────────────
apply({ RESET: 1, TC: 1 });
assert(isLow(read('Q1')) && isLow(read('Q2')) && isLow(read('Q3')) && isLow(read('Q4')),
  `reset: all outputs should be LOW, got ${q()}`);
apply({ RESET: 0 });

// ── 1. Synchronous parallel load (P/S HIGH, on the clock edge) ───────────────
// Load 1,0,1,1 into Q1..Q4. With CLOCK held low first, nothing loads; only the
// rising edge transfers.
apply({ PS: 1, I1: 1, I2: 0, I3: 1, I4: 1, CLOCK: 0 });
assert(isLow(read('Q1')), `sync load: no edge yet, Q1 should still be LOW, got ${q()}`);
clock();                       // rising edge → load
assert(isHigh(read('Q1')) && isLow(read('Q2')) && isHigh(read('Q3')) && isHigh(read('Q4')),
  `sync load: expected Q=1,0,1,1, got ${q()}`);

// ── 2. True/Complement is asynchronous — flips all outputs, data unchanged ────
apply({ PS: 0, TC: 0 });       // serial mode, complement outputs (no clock)
assert(isLow(read('Q1')) && isHigh(read('Q2')) && isLow(read('Q3')) && isLow(read('Q4')),
  `T/C complement: expected ~(1,0,1,1)=0,1,0,0, got ${q()}`);
apply({ TC: 1 });              // back to true — data must be intact
assert(isHigh(read('Q1')) && isLow(read('Q2')) && isHigh(read('Q3')) && isHigh(read('Q4')),
  `T/C true: data should be unchanged 1,0,1,1, got ${q()}`);

// ── 3. Serial shift as a D-FF (tie J=K_BAR) — bit walks Q1→Q2→Q3→Q4 ──────────
// Clear to zero via parallel load, then shift a single 1 through.
apply({ PS: 1, I1: 0, I2: 0, I3: 0, I4: 0 }); clock();
assert(isLow(read('Q1')) && isLow(read('Q4')), `pre-shift clear: expected all LOW, got ${q()}`);
apply({ PS: 0 });
// Shift in a 1 (J=K_BAR=1 → D=1).
clock({ J: 1, KBAR: 1 });
assert(isHigh(read('Q1')) && isLow(read('Q2')), `shift: after D=1 edge, Q1 HIGH Q2 LOW, got ${q()}`);
// Now shift in zeros (J=K_BAR=0 → D=0); the 1 walks toward Q4.
clock({ J: 0, KBAR: 0 });
assert(isLow(read('Q1')) && isHigh(read('Q2')), `shift: 1 moved to Q2, got ${q()}`);
clock({ J: 0, KBAR: 0 });
assert(isHigh(read('Q3')), `shift: 1 moved to Q3, got ${q()}`);
clock({ J: 0, KBAR: 0 });
assert(isHigh(read('Q4')) && isLow(read('Q3')), `shift: 1 reached Q4, got ${q()}`);

// ── 4. J-K first-stage semantics on Q1 (the non-D-FF behavior) ───────────────
// Reset, then exercise the four J/K_BAR combinations on stage 1.
// Recall the chip exposes K-BAR; internally Q1next = J·(~Q1) + K_BAR·Q1.
apply({ RESET: 1 }); apply({ RESET: 0, PS: 0 });
// (J=1, K_BAR=0): SET-style — Q1 → 1 regardless of old value.
clock({ J: 1, KBAR: 0 });
assert(isHigh(read('Q1')), `JK set: J=1,K_BAR=0 should set Q1, got ${q()}`);
// (J=0, K_BAR=1): HOLD — Q1 stays 1 (J·~Q1=0, K_BAR·Q1=1).
clock({ J: 0, KBAR: 1 });
assert(isHigh(read('Q1')), `JK hold: J=0,K_BAR=1 should hold Q1=1, got ${q()}`);
// (J=0, K_BAR=0): RESET-style — Q1 → 0.
clock({ J: 0, KBAR: 0 });
assert(isLow(read('Q1')), `JK reset: J=0,K_BAR=0 should clear Q1, got ${q()}`);
// (J=1, K_BAR=0) then (J=1, K_BAR=0): set, stays set (J·~Q1 when Q1=0 →1; when Q1=1, K_BAR·Q1=0 →0... )
// Toggle case (J=1, K_BAR=0 gives Q1next=~Q1): from Q1=0 → 1, from Q1=1 → 0.
clock({ J: 1, KBAR: 0 });
assert(isHigh(read('Q1')), `JK toggle: from 0 with J=1,K_BAR=0 → 1, got ${q()}`);
clock({ J: 1, KBAR: 0 });
assert(isLow(read('Q1')), `JK toggle: from 1 with J=1,K_BAR=0 → 0 (toggle), got ${q()}`);

console.log(`cd4035-pipo-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
