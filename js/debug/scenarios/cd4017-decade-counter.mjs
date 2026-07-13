// ── CD4017 decade (÷10) Johnson counter, decoded — regression ────────────────
// The CD4017 (js/chips/chips68.js) is a 16-pin divide-by-10 Johnson counter with
// ten one-hot decoded outputs Q0..Q9. It shares the COUNTER_DECADE_DECODED
// primitive (js/specificChipsSim.js). This guards its DB entry after the July
// 2026 docs-verification pass, which confirmed the pin map against the TI/Harris
// CD4017B datasheet (SCHS027C, Rev. Feb 2004) read as PDF page images: decoded
// 0..9 on pins 3,2,4,7,10,1,5,6,9,11; CARRY OUT 12; CLOCK INHIBIT 13; CLOCK 14;
// RESET 15; VDD 16; VSS 8. Behaviour guarded: RISING-edge clock gated by the
// active-HIGH CLOCK INHIBIT (CI), the active-HIGH asynchronous RESET (MR), mod-10
// wrap, and CARRY OUT HIGH for counts 0-4 / LOW for counts 5-9.
//
// Method: place ONE CD4017 and keep the same chip + sim instance across the run
// so the counter's sequential state persists. A clock "pulse" re-wires CLK LOW
// then HIGH (a rising edge); each LOW→HIGH transition with CI LOW advances by one.
//
// Run:  node js/debug/scenarios/cd4017-decade-counter.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4017');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLK, MR (reset) and CI (clock inhibit) held at the given rail
// levels (1 = VCC row, 0 = GND row). Counter state lives on the chip component,
// so a fresh WireManager each call is fine.
function apply({ clk, reset = false, inhibit = false }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4017 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('MR',  reset ? 1 : 0);
  wirePin('CI',  inhibit ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const ALL_Q = ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'];
const highQs = () => ALL_Q.filter(q => isHigh(read(q)));

// One full clock pulse = LOW then HIGH; the count advances on the rising edge.
function pulse(n = 1, opts = {}) {
  for (let i = 0; i < n; i++) {
    apply({ clk: false, ...opts }); // bring clock low
    apply({ clk: true,  ...opts }); // rising edge → advance (unless inhibited)
  }
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Expect exactly Q<n> HIGH (one-hot) and CO matching the half-cycle rule.
function expectCount(n, label) {
  const hot = highQs();
  assert(hot.length === 1 && hot[0] === `Q${n}`,
    `${label}: expected only Q${n} HIGH, got [${hot.join(',')}]`);
  const coExpected = n <= 4; // CO HIGH for counts 0-4, LOW for 5-9
  assert(isHigh(read('CO')) === coExpected,
    `${label}: CO should be ${coExpected ? 'HIGH' : 'LOW'} at count ${n}, got ${read('CO').toFixed(2)} V`);
}

// ── 0. Power up with RESET asserted → count 0 (Q0 HIGH, CO HIGH) ─────────────
apply({ clk: false, reset: true });
expectCount(0, 'reset');
apply({ clk: false, reset: false }); // release reset, no edge → still 0
expectCount(0, 'post-reset idle');

// ── 1. Walk the full decade 1..9, one-hot decoded, CO tracks half cycle ──────
for (let n = 1; n <= 9; n++) {
  pulse(1);
  expectCount(n, `${n} edge(s)`);
}

// ── 2. 10th rising edge wraps mod-10 back to Q0 ──────────────────────────────
pulse(1);
expectCount(0, 'wrap (10th edge)');

// ── 3. CLOCK INHIBIT HIGH freezes the count across a clock edge ──────────────
pulse(1);                       // count now 1
expectCount(1, 'pre-inhibit');
pulse(1, { inhibit: true });    // rising edge while inhibited → no advance
expectCount(1, 'inhibited edge');
pulse(1);                       // inhibit released → advances to 2
expectCount(2, 'post-inhibit');

// ── 4. CO transition: HIGH through count 4, LOW at count 5 ───────────────────
pulse(2);                       // count now 4
expectCount(4, 'count 4 (CO still HIGH)');
pulse(1);                       // count now 5
expectCount(5, 'count 5 (CO drops LOW)');

// ── 5. Asynchronous RESET mid-count clears back to count 0 ───────────────────
apply({ clk: false, reset: true });
expectCount(0, 'async reset mid-count');

console.log(`cd4017-decade-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
