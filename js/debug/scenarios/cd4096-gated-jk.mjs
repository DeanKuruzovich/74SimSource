// ── CD4096 gated J-K master/slave flip-flop (inv + non-inv inputs) — regression ─
// The CD4096 (Batch 4, js/chips/chips115.js) reuses the existing JK_FF primitive
// with two CD4096-specific features that this scenario guards:
//   1. INVERTING J3/K3 inputs. Internal J = J1·J2·/J3, K = K1·K2·/K3. The pins are
//      named 'J3n'/'K3n' so the engine reads them inverted (a J/K pin whose name
//      ends in 'n' is complemented). Holding J3n/K3n LOW enables that side.
//   2. ACTIVE-HIGH asynchronous SET/RESET (preClrActiveHigh:true) — opposite the
//      active-LOW PRE/CLR of the 74-series gated-JK parts.
//   Plus the standard CD4096 behavior: positive-edge clock, JK hold/set/reset/
//   toggle, reset-dominant when SET and RESET are both HIGH (model choice; the
//   datasheet leaves that combination undefined — see issues.md).
//
// Method mirrors cd4035-pipo-shift.mjs: one CD4096, one sim instance reused for
// the whole run so sequential state persists; each pin is wired to the VCC (1) or
// GND (0) rail before each solve; a clock pulse is LOW→HIGH→LOW on CLOCK.
//
// Run:  node js/debug/scenarios/cd4096-gated-jk.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4096');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// All gating inputs default to "side disabled" (J1=K1=0) with J3n/K3n LOW.
const PIN_DEFAULTS = { J1:0, J2:1, J3n:0, K1:0, K2:1, K3n:0, CLOCK:0, SET:0, RESET:0 };
let pinState = { ...PIN_DEFAULTS };

function apply(overrides = {}) {
  pinState = { ...pinState, ...overrides };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4096 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  for (const name of Object.keys(PIN_DEFAULTS)) wirePin(name, pinState[name]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const Q  = () => isHigh(read('Q')) ? 1 : 0;
const Qn = () => isHigh(read('Qn')) ? 1 : 0;
const show = () => `Q=${Q()} Qn=${Qn()}`;

// Set internal J and K via the gating inputs (J3n/K3n held LOW = enabled side).
// internal J = J1·J2·/J3n  → J=1 needs J1=1; internal K = K1·K2·/K3n → K=1 needs K1=1.
const jk = (j, k) => ({ J1: j ? 1 : 0, J2: 1, J3n: 0, K1: k ? 1 : 0, K2: 1, K3n: 0 });

// One positive clock edge (LOW→HIGH→LOW), holding the supplied gating/control pins.
function clock(extra = {}) {
  apply({ ...extra, CLOCK: 1 });
  apply({ ...extra, CLOCK: 0 });
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const expectQ = (qv, msg) => assert(Q() === qv && Qn() === (qv ? 0 : 1), `${msg}: expected Q=${qv}/Qn=${qv?0:1}, got ${show()}`);

// ── 0. Active-HIGH RESET clears Q ────────────────────────────────────────────
apply({ SET: 0, RESET: 1 });
expectQ(0, 'RESET HIGH → Q=0');
apply({ RESET: 0 });
expectQ(0, 'RESET released → Q holds 0');

// ── 1. Active-HIGH SET forces Q=1 (asynchronous, no clock) ───────────────────
apply({ SET: 1 });
expectQ(1, 'SET HIGH → Q=1');
apply({ SET: 0 });
expectQ(1, 'SET released → Q holds 1');

// ── 2. RESET again, then JK set on the clock edge ────────────────────────────
apply({ RESET: 1 }); expectQ(0, 'RESET HIGH → Q=0'); apply({ RESET: 0 });
clock(jk(1, 0));                 // J=1,K=0 → set
expectQ(1, 'J=1,K=0 clock → set Q=1');

// ── 3. JK hold ───────────────────────────────────────────────────────────────
clock(jk(0, 0));                 // J=0,K=0 → hold
expectQ(1, 'J=0,K=0 clock → hold Q=1');

// ── 4. JK reset ──────────────────────────────────────────────────────────────
clock(jk(0, 1));                 // J=0,K=1 → reset
expectQ(0, 'J=0,K=1 clock → reset Q=0');

// ── 5. JK toggle (two edges) ─────────────────────────────────────────────────
clock(jk(1, 1)); expectQ(1, 'J=1,K=1 clock #1 → toggle Q=1');
clock(jk(1, 1)); expectQ(0, 'J=1,K=1 clock #2 → toggle Q=0');

// ── 6. INVERTING J3: with J1=J2=1 but J3n HIGH, internal J=0 → no set ─────────
apply({ RESET: 1 }); apply({ RESET: 0 });           // start from Q=0
clock({ J1: 1, J2: 1, J3n: 1, K1: 0, K2: 1, K3n: 0 });   // /J3 = /1 = 0 → J=0
expectQ(0, 'J3n HIGH blocks J side (internal J=0) → Q stays 0');
clock({ J1: 1, J2: 1, J3n: 0, K1: 0, K2: 1, K3n: 0 });   // /J3 = /0 = 1 → J=1
expectQ(1, 'J3n LOW enables J side (internal J=1) → Q=1');

// ── 7. INVERTING K3: with K1=K2=1 but K3n HIGH, internal K=0 → no reset ───────
clock({ J1: 0, J2: 1, J3n: 0, K1: 1, K2: 1, K3n: 1 });   // /K3 = /1 = 0 → K=0
expectQ(1, 'K3n HIGH blocks K side (internal K=0) → Q stays 1');
clock({ J1: 0, J2: 1, J3n: 0, K1: 1, K2: 1, K3n: 0 });   // /K3 = /0 = 1 → K=1
expectQ(0, 'K3n LOW enables K side (internal K=1) → Q=0');

// ── 8. Positive-edge only: a falling edge must NOT transfer JK ────────────────
apply({ SET: 1 }); apply({ SET: 0 }); expectQ(1, 'preset Q=1 for edge test');
apply({ ...jk(0, 1), CLOCK: 1 });   // rising edge with J=0,K=1 → reset to 0
expectQ(0, 'rising edge with K=1 → Q=0');
apply({ SET: 1 }); apply({ SET: 0 }); expectQ(1, 'preset Q=1 again');
apply({ ...jk(1, 0), CLOCK: 1 });   // CLOCK already HIGH from prior — no new rising edge
apply({ ...jk(1, 0), CLOCK: 0 });   // falling edge: must NOT set
expectQ(1, 'falling edge with J=1 → Q unchanged (still 1)');

// ── 9. Reset-dominant when SET and RESET both HIGH (model choice) ─────────────
apply({ SET: 1, RESET: 0 }); expectQ(1, 'SET only → Q=1');
apply({ SET: 1, RESET: 1 }); expectQ(0, 'SET+RESET both HIGH → reset-dominant Q=0');
apply({ SET: 0, RESET: 0 });

if (failures.length) {
  console.error(`CD4096 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD4096 gated J-K FF: all checks passed.');
