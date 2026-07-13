// ── CD4518 dual BCD up-counter regression ────────────────────────────────────
// The CD4518 (Batch 6, js/chips/chips87.js) is the behavioral coverage of the
// COUNTER_BCD_DUAL_4518 primitive. It guards the chip's DB entry: the 8-4-2-1
// BCD pin map per section, the dual CLOCK/ENABLE trigger, the mod-10 wrap, the
// active-HIGH asynchronous RESET, and the independence of the two sections.
//
// Datasheet truth table (TI SCHS076D) — a section advances on:
//   • the rising edge of CLOCK while ENABLE is HIGH, OR
//   • the falling edge of ENABLE while CLOCK is LOW.
// All other CLOCK/ENABLE transitions hold; RESET HIGH clears that section to 0.
//
// Method: place ONE CD4518 and keep the same chip + sim instance across the
// whole run so the counter state (comp.ffState) persists. We exercise section A
// in CLOCK mode (ENA held HIGH, pulse CLKA) and section B in ENABLE mode (CLKB
// held LOW, pulse ENB) to cover both triggering paths.
//
// Run:  node js/debug/scenarios/cd4518-bcd-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4518');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC row, 0 =
// GND row). A fresh WireManager each call is fine — the counter state lives on
// the (persistent) chip component, not the wires.
function apply({ clka, ena, rsta, clkb, enb, rstb }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4518 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLKA', clka ? 1 : 0);
  wirePin('ENA',  ena  ? 1 : 0);
  wirePin('RSTA', rsta ? 1 : 0);
  wirePin('CLKB', clkb ? 1 : 0);
  wirePin('ENB',  enb  ? 1 : 0);
  wirePin('RSTB', rstb ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bcd = (sfx) => {
  const b = (q) => (isHigh(read(q)) ? 1 : 0);
  return b(`Q1${sfx}`) | (b(`Q2${sfx}`) << 1) | (b(`Q3${sfx}`) << 2) | (b(`Q4${sfx}`) << 3);
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Current input state — mutated by the helpers below so each apply() carries the
// full picture (all 6 inputs are driven every solve).
const st = { clka: 0, ena: 1, rsta: 0, clkb: 0, enb: 1, rstb: 0 };
const solve = () => apply(st);

// Section A, CLOCK mode: ENA HIGH, advance on rising edge of CLKA.
function pulseA(n = 1) {
  for (let i = 0; i < n; i++) {
    st.clka = 1; solve();   // rising edge → advance
    st.clka = 0; solve();   // falling edge → no advance
  }
}
// Section B, ENABLE mode: CLKB LOW, advance on falling edge of ENB.
function pulseB(n = 1) {
  for (let i = 0; i < n; i++) {
    st.enb = 1; solve();    // rising edge of ENABLE → no advance
    st.enb = 0; solve();    // falling edge of ENABLE → advance
  }
}

// ── 0. Power up with both RESETs asserted → both sections cleared ────────────
st.rsta = 1; st.rstb = 1; solve();
assert(bcd('A') === 0, `reset: section A should be 0, got ${bcd('A')}`);
assert(bcd('B') === 0, `reset: section B should be 0, got ${bcd('B')}`);
st.rsta = 0; st.rstb = 0; solve();

// ── 1. Section A counts 0→5 in CLOCK mode (rising-edge trigger) ──────────────
for (let n = 1; n <= 5; n++) {
  pulseA(1);
  assert(bcd('A') === n, `clock-mode: after ${n} pulses A should be ${n}, got ${bcd('A')}`);
}
assert(bcd('B') === 0, `independence: section B must stay 0 while A counts, got ${bcd('B')}`);

// ── 2. Falling CLOCK edge alone must NOT advance section A ────────────────────
const aBefore = bcd('A');              // 5
st.clka = 1; solve();                  // rising edge → advance to 6
assert(bcd('A') === aBefore + 1, `rising edge should advance A to ${aBefore + 1}, got ${bcd('A')}`);
const aAfterRise = bcd('A');           // 6
st.clka = 0; solve();                  // falling edge → hold
assert(bcd('A') === aAfterRise, `falling CLOCK edge must hold A at ${aAfterRise}, got ${bcd('A')}`);

// ── 3. Rising CLOCK with ENABLE LOW must NOT advance (no-change row) ──────────
// CAUTION: lowering ENABLE while CLOCK is LOW is itself an increment edge, so we
// must raise CLOCK *first*, then drop ENABLE (a falling-ENABLE-while-CLOCK-HIGH,
// which is a no-change row), before probing the blocked clock edge.
st.clka = 1; solve();                  // rising CLOCK, ENABLE still HIGH → advance 6→7
assert(bcd('A') === 7, `setup: A should advance to 7, got ${bcd('A')}`);
st.ena = 0; solve();                   // ENABLE falls while CLOCK HIGH → no change
const aEnLow = bcd('A');               // 7
st.clka = 0; solve();                  // falling CLOCK → no change
st.clka = 1; solve();                  // rising CLOCK but ENABLE LOW → hold
assert(bcd('A') === aEnLow, `ENABLE LOW must block the CLOCK edge (hold ${aEnLow}), got ${bcd('A')}`);
st.clka = 0; solve();                  // falling CLOCK → no change
st.ena = 1; solve();                   // restore ENABLE high (rising ENA, CLKA low → no change)
assert(bcd('A') === aEnLow, `restoring ENABLE must not advance A (hold ${aEnLow}), got ${bcd('A')}`);

// ── 4. BCD wrap: drive section A from 7 up through 9 → 0 ─────────────────────
// We are at 7. Pulse to 9, confirm 8-4-2-1 = 1001, then one more → wrap to 0.
pulseA(2);
assert(bcd('A') === 9, `wrap setup: A should reach 9, got ${bcd('A')}`);
assert(isHigh(read('Q1A')) && isLow(read('Q2A')) && isLow(read('Q3A')) && isHigh(read('Q4A')),
  `BCD 9 weighting wrong: Q4..Q1 = ${[read('Q4A'),read('Q3A'),read('Q2A'),read('Q1A')].map(v=>isHigh(v)?1:0).join('')}`);
pulseA(1);
assert(bcd('A') === 0, `mod-10 wrap: 9→0 expected, got ${bcd('A')}`);

// ── 5. Section B counts in ENABLE mode (falling ENABLE edge, CLOCK held LOW) ──
for (let n = 1; n <= 4; n++) {
  pulseB(1);
  assert(bcd('B') === n, `enable-mode: after ${n} pulses B should be ${n}, got ${bcd('B')}`);
}
// Rising ENABLE edge alone must not advance (already covered inside pulseB, but
// assert the standalone no-change row explicitly): drive ENB high → hold.
const bBefore = bcd('B');              // 4
st.enb = 1; solve();                   // rising edge of ENABLE → no advance
assert(bcd('B') === bBefore, `rising ENABLE edge must hold B at ${bBefore}, got ${bcd('B')}`);
st.enb = 0; solve();                   // falling edge → advance to 5
assert(bcd('B') === bBefore + 1, `falling ENABLE edge should advance B to ${bBefore + 1}, got ${bcd('B')}`);

// ── 6. Independence + async reset: clear A only, B must be untouched ──────────
const bKeep = bcd('B');                // 5
st.rsta = 1; solve();
assert(bcd('A') === 0, `async reset A: expected 0, got ${bcd('A')}`);
assert(bcd('B') === bKeep, `reset A must not disturb B (expected ${bKeep}), got ${bcd('B')}`);
st.rsta = 0; solve();

console.log(`cd4518-bcd-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
