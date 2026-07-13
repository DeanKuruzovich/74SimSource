// ── CD40104 4-bit bidirectional UNIVERSAL shift register, tri-state — regression
// The CD40104 (Batch 9, js/chips/chips134.js) is the first behavioral coverage of
// the new SHIFT_REG_4BIT_UNIV_TRI primitive. The coverage-plan hint
// SHIFT_REG_4BIT_BIDIR_TRI (the 74295) only has ONE shift direction + parallel
// load via a single MODE pin and no clear, so it could not model this universal
// part. This guards the four S1/S0 modes plus the active-HIGH three-state output:
//   S1 S0 = 00 → synchronous CLEAR (reg → 0)
//   S1 S0 = 01 → shift right (SR enters first stage Q0, data moves Q0→Q1→Q2→Q3)
//   S1 S0 = 10 → shift left  (SL enters last  stage Q3, data moves Q3→Q2→Q1→Q0)
//   S1 S0 = 11 → parallel load D0..D3 → Q0..Q3
//   OUTPUT ENABLE (OE) HIGH → outputs driven; LOW → all outputs high-impedance.
// All actions occur on the rising CLOCK edge (verified vs SGS-Thomson
// HCC/HCF40104B datasheet, June 1989 — see chips134.js header).
//
// Method mirrors cd4021-piso-shift.mjs: one chip + sim instance kept for the whole
// run so the register's sequential state persists; a clock pulse is LOW→HIGH→LOW.
//
// Run:  node js/debug/scenarios/cd40104-univ-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40104');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

let stateD = { D0:0, D1:0, D2:0, D3:0 };

function apply({ clk = 0, s0 = 0, s1 = 0, sr = 0, sl = 0, oe = 1, d = null } = {}) {
  if (d) stateD = { ...stateD, ...d };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD40104 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', clk);
  wirePin('S0', s0);
  wirePin('S1', s1);
  wirePin('SR', sr);
  wirePin('SL', sl);
  wirePin('OE', oe);
  wirePin('D0', stateD.D0); wirePin('D1', stateD.D1);
  wirePin('D2', stateD.D2); wirePin('D3', stateD.D3);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const q = () =>
  `Q0=${isHigh(read('Q0'))?1:0} Q1=${isHigh(read('Q1'))?1:0} ` +
  `Q2=${isHigh(read('Q2'))?1:0} Q3=${isHigh(read('Q3'))?1:0}`;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const expectQ = (label, e0, e1, e2, e3) => {
  assert(isHigh(read('Q0')) === !!e0 && isHigh(read('Q1')) === !!e1 &&
         isHigh(read('Q2')) === !!e2 && isHigh(read('Q3')) === !!e3,
    `${label}: expected Q=${e0}${e1}${e2}${e3}, got ${q()}`);
};

// One clock pulse in a given mode: rising edge applies the action, then back low.
function clock(opts) {
  apply({ ...opts, clk: 1 });
  apply({ ...opts, clk: 0 });
}

// ── 1. PARALLEL LOAD (S1=1, S0=1): D0..D3 = 1,0,1,0 → Q0..Q3 = 1,0,1,0 ───────
clock({ s1: 1, s0: 1, d: { D0:1, D1:0, D2:1, D3:0 } });
expectQ('parallel load', 1, 0, 1, 0);

// ── 2. SHIFT RIGHT (S1=0, S0=1): SR enters Q0, rest move toward Q3 ───────────
// From Q=1,0,1,0 with SR=1 → new Q0=SR=1, Q1=oldQ0=1, Q2=oldQ1=0, Q3=oldQ2=1.
clock({ s1: 0, s0: 1, sr: 1 });
expectQ('shift right', 1, 1, 0, 1);

// ── 3. Reload, then SHIFT LEFT (S1=1, S0=0): SL enters Q3, rest move toward Q0
clock({ s1: 1, s0: 1, d: { D0:1, D1:0, D2:1, D3:0 } });
expectQ('reload before shift-left', 1, 0, 1, 0);
// From Q=1,0,1,0 with SL=1 → new Q3=SL=1, Q2=oldQ3=0, Q1=oldQ2=1, Q0=oldQ1=0.
clock({ s1: 1, s0: 0, sl: 1 });
expectQ('shift left', 0, 1, 0, 1);

// ── 4. Mode 00 + clock = SYNCHRONOUS CLEAR (this part has no reset pin) ───────
clock({ s1: 0, s0: 0 });
expectQ('synchronous clear', 0, 0, 0, 0);

// ── 5. Hold-without-edge: re-solving without a rising edge must not change reg
clock({ s1: 1, s0: 1, d: { D0:1, D1:1, D2:0, D3:0 } });  // load 1,1,0,0
expectQ('load for hold test', 1, 1, 0, 0);
const before = q();
apply({ s1: 0, s0: 1, sr: 1, clk: 0 });   // mode set, but CLK stays low → no edge
assert(q() === before, `no-edge hold: register changed without a clock edge (${before} → ${q()})`);

// ── 6. OUTPUT ENABLE: LOW → outputs high-impedance (a known-HIGH bit goes away)
// Reload a word with at least one HIGH, confirm it drives, then disable.
clock({ s1: 1, s0: 1, d: { D0:1, D1:0, D2:1, D3:0 } });
expectQ('load before OE test', 1, 0, 1, 0);
apply({ s1: 1, s0: 1, oe: 0 });   // OE low → Hi-Z; do not clock (avoid reload nuance)
assert(!isHigh(read('Q0')), `OE low: Q0 should be high-impedance (not HIGH), got ${q()}`);
assert(!isHigh(read('Q2')), `OE low: Q2 should be high-impedance (not HIGH), got ${q()}`);
// Re-enable and the stored data reappears (OE does not disturb the register).
apply({ s1: 1, s0: 1, oe: 1 });
expectQ('OE re-enabled', 1, 0, 1, 0);

console.log(`cd40104-univ-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
