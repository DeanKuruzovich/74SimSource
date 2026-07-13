// ── CD4520 dual 4-bit binary up-counter regression ──────────────────────────
// The CD4520 (Batch 6, js/chips/chips120.js) is the binary (÷16) sibling of the
// CD4518 (÷10 BCD). It reuses the COUNTER_BCD_DUAL_4518 primitive with
// gate.mod = 16. This scenario guards the chip's DB entry: the 8-4-2-1 binary
// pin map per section, the dual CLOCK/ENABLE trigger, the mod-16 wrap (0→15→0,
// the key difference from the CD4518's mod-10), the active-HIGH asynchronous
// RESET, and the independence of the two sections.
//
// Datasheet truth table (TI SCHS076D, CD4518B/CD4520B) — a section advances on:
//   • the rising edge of CLOCK while ENABLE is HIGH, OR
//   • the falling edge of ENABLE while CLOCK is LOW.
// All other CLOCK/ENABLE transitions hold; RESET HIGH clears that section to 0.
//
// Method: place ONE CD4520 and keep the same chip + sim instance across the
// whole run so the counter state (comp.ffState) persists. Section A is driven in
// CLOCK mode (ENA held HIGH, pulse CLKA) and section B in ENABLE mode (CLKB held
// LOW, pulse ENB) to cover both triggering paths.
//
// Run:  node js/debug/scenarios/cd4520-binary-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4520');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at the given rail level (1 = VCC row, 0 =
// GND row). A fresh WireManager each call is fine — the counter state lives on
// the (persistent) chip component, not the wires.
function apply({ clka, ena, rsta, clkb, enb, rstb }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4520 has no pin named ${name}`);
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
const val = (sfx) => {
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
assert(val('A') === 0, `reset: section A should be 0, got ${val('A')}`);
assert(val('B') === 0, `reset: section B should be 0, got ${val('B')}`);
st.rsta = 0; st.rstb = 0; solve();

// ── 1. Section A counts a full 0→15 ramp in CLOCK mode (rising-edge trigger) ──
for (let n = 1; n <= 15; n++) {
  pulseA(1);
  assert(val('A') === n, `clock-mode: after ${n} pulses A should be ${n}, got ${val('A')}`);
}
assert(val('B') === 0, `independence: section B must stay 0 while A counts, got ${val('B')}`);

// At 15 the binary weighting must be 1111 (all four outputs HIGH) — this is the
// key divergence from the CD4518, which would have wrapped at 9.
assert(isHigh(read('Q1A')) && isHigh(read('Q2A')) && isHigh(read('Q3A')) && isHigh(read('Q4A')),
  `binary 15 weighting wrong: Q4..Q1 = ${[read('Q4A'),read('Q3A'),read('Q2A'),read('Q1A')].map(v=>isHigh(v)?1:0).join('')}`);

// ── 2. mod-16 wrap: 15 → 0 (NOT 9→0) ────────────────────────────────────────
pulseA(1);
assert(val('A') === 0, `mod-16 wrap: 15→0 expected, got ${val('A')}`);

// ── 3. Falling CLOCK edge alone must NOT advance section A ────────────────────
st.clka = 1; solve();                  // rising edge → advance 0→1
assert(val('A') === 1, `rising edge should advance A to 1, got ${val('A')}`);
st.clka = 0; solve();                  // falling edge → hold
assert(val('A') === 1, `falling CLOCK edge must hold A at 1, got ${val('A')}`);

// ── 4. Rising CLOCK with ENABLE LOW must NOT advance (no-change row) ──────────
// CAUTION: lowering ENABLE while CLOCK is LOW is itself an increment edge, so we
// raise CLOCK first, then drop ENABLE (a falling-ENABLE-while-CLOCK-HIGH no-op),
// before probing the blocked clock edge.
st.clka = 1; solve();                  // rising CLOCK, ENABLE still HIGH → advance 1→2
assert(val('A') === 2, `setup: A should advance to 2, got ${val('A')}`);
st.ena = 0; solve();                   // ENABLE falls while CLOCK HIGH → no change
const aEnLow = val('A');               // 2
st.clka = 0; solve();                  // falling CLOCK → no change
st.clka = 1; solve();                  // rising CLOCK but ENABLE LOW → hold
assert(val('A') === aEnLow, `ENABLE LOW must block the CLOCK edge (hold ${aEnLow}), got ${val('A')}`);
st.clka = 0; solve();                  // falling CLOCK → no change
st.ena = 1; solve();                   // restore ENABLE high (rising ENA, CLKA low → no change)
assert(val('A') === aEnLow, `restoring ENABLE must not advance A (hold ${aEnLow}), got ${val('A')}`);

// ── 5. Section B counts in ENABLE mode (falling ENABLE edge, CLOCK held LOW) ──
for (let n = 1; n <= 4; n++) {
  pulseB(1);
  assert(val('B') === n, `enable-mode: after ${n} pulses B should be ${n}, got ${val('B')}`);
}
// Rising ENABLE edge alone must not advance.
const bBefore = val('B');              // 4
st.enb = 1; solve();                   // rising edge of ENABLE → no advance
assert(val('B') === bBefore, `rising ENABLE edge must hold B at ${bBefore}, got ${val('B')}`);
st.enb = 0; solve();                   // falling edge → advance to 5
assert(val('B') === bBefore + 1, `falling ENABLE edge should advance B to ${bBefore + 1}, got ${val('B')}`);

// ── 6. Independence + async reset: clear A only, B must be untouched ──────────
const bKeep = val('B');                // 5
st.rsta = 1; solve();
assert(val('A') === 0, `async reset A: expected 0, got ${val('A')}`);
assert(val('B') === bKeep, `reset A must not disturb B (expected ${bKeep}), got ${val('B')}`);
st.rsta = 0; solve();

console.log(`cd4520-binary-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
