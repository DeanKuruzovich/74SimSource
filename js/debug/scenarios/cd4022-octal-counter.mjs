// ── CD4022 octal (÷8) Johnson counter, decoded — regression ──────────────────
// The CD4022 (Batch 6, js/chips/chips86.js) is the first behavioral coverage of
// the COUNTER_OCTAL_DECODED primitive — the octal sibling of the CD4017's
// COUNTER_DECADE_DECODED. It guards the chip's DB entry: the decoded-output pin
// map (Q0=2, Q1=1, Q2=3, Q3=7, Q4=11, Q5=4, Q6=5, Q7=10), the RISING-edge clock
// gated by active-HIGH CLOCK INHIBIT (CI), the active-HIGH asynchronous RESET
// (MR), the mod-8 wrap, and CARRY OUT HIGH for counts 0-3 / LOW for counts 4-7.
//
// Method: place ONE CD4022 and keep the same chip + sim instance across the run
// so the counter's sequential state persists. A clock "pulse" re-wires CLK LOW
// then HIGH (a rising edge); each LOW→HIGH transition with CI LOW advances the
// count by one. Outputs are read straight off the pins by name.
//
// Checks:
//   • RESET HIGH → Q0 HIGH, all other Q LOW, CO HIGH       (async clear, count 0)
//   • 1 rising edge → Q1 HIGH (one-hot walks)              (count 1)
//   • walk 0..7 → exactly one Q HIGH each step             (decoded one-hot)
//   • CO HIGH for counts 0-3, LOW for counts 4-7           (carry / half cycle)
//   • 8th edge wraps back to Q0                            (mod-8)
//   • CI HIGH freezes the count across a clock edge        (clock inhibit)
//   • RESET HIGH mid-count → Q0 HIGH again                 (async clear wins)
//
// Run:  node js/debug/scenarios/cd4022-octal-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4022');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLK, MR (reset) and CI (clock inhibit) held at the given rail
// levels (1 = VCC row, 0 = GND row). Counter state lives on the chip component,
// so a fresh WireManager each call is fine.
function apply({ clk, reset = false, inhibit = false }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4022 has no pin named ${name}`);
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
const ALL_Q = ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'];
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
  const coExpected = n <= 3; // CO HIGH for counts 0-3, LOW for 4-7
  assert(isHigh(read('CO')) === coExpected,
    `${label}: CO should be ${coExpected ? 'HIGH' : 'LOW'} at count ${n}, got ${read('CO').toFixed(2)} V`);
}

// ── 0. Power up with RESET asserted → count 0 (Q0 HIGH, CO HIGH) ─────────────
apply({ clk: false, reset: true });
expectCount(0, 'reset');
apply({ clk: false, reset: false }); // release reset, no edge → still 0
expectCount(0, 'post-reset idle');

// ── 1. Walk the full octal cycle 1..7, one-hot decoded, CO tracks half cycle ─
for (let n = 1; n <= 7; n++) {
  pulse(1);
  expectCount(n, `${n} edge(s)`);
}

// ── 2. 8th rising edge wraps mod-8 back to Q0 ────────────────────────────────
pulse(1);
expectCount(0, 'wrap (8th edge)');

// ── 3. CLOCK INHIBIT HIGH freezes the count across a clock edge ──────────────
pulse(1);                       // count now 1
expectCount(1, 'pre-inhibit');
pulse(1, { inhibit: true });    // rising edge while inhibited → no advance
expectCount(1, 'inhibited edge');
pulse(1);                       // inhibit released → advances to 2
expectCount(2, 'post-inhibit');

// ── 4. Asynchronous RESET mid-count clears back to count 0 ───────────────────
apply({ clk: false, reset: true });
expectCount(0, 'async reset mid-count');

console.log(`cd4022-octal-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
