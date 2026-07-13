// ── CD4033 decade counter + 7-seg driver, ripple blanking — regression ───────
// The CD4033 (Batch 8, js/chips/chips95.js) is the first behavioral coverage of
// the COUNTER_7SEG_RB primitive — the ripple-blanking / lamp-test sibling of the
// CD4026's decade-counter-plus-7-segment-decoder. It guards the chip's DB entry:
// the segment pin map (a=10,b=12,c=13,d=9,e=11,f=6,g=7), the RISING-edge clock
// gated by active-HIGH CLOCK INHIBIT, the active-HIGH asynchronous RESET, the
// CARRY OUT (CLOCK/10) HIGH for counts 0-4 / LOW for 5-9, the active-HIGH 7-seg
// decode, the LAMP TEST all-segments-on override, and the RBI/RBO leading-zero
// suppression.
//
// Method: place ONE CD4033 and keep the same chip + sim instance across the run
// so the counter's sequential state persists. A clock "pulse" re-wires CLOCK LOW
// then HIGH (a rising edge); each LOW->HIGH transition with CLOCK INHIBIT LOW
// advances the count by one. Outputs are read straight off the pins by name.
//
// Checks:
//   • RESET HIGH → count 0: segments show "0" (a-f on, g off), CARRY HIGH, RBO HIGH
//   • walk 0..9 → segment pattern matches the standard 7-seg decode each step
//   • CARRY OUT HIGH for counts 0-4, LOW for counts 5-9                (CLOCK/10)
//   • 10th edge wraps mod-10 back to 0
//   • CLOCK INHIBIT HIGH freezes the count across a clock edge
//   • LAMP TEST HIGH → all 7 segments ON (display "8")
//   • Ripple blanking: count 0 + RBI LOW → all segments OFF, RBO LOW
//   • count 0 + RBI HIGH → "0" displayed, RBO HIGH                    (zero kept)
//
// Run:  node js/debug/scenarios/cd4033-counter-7seg.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4033');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLOCK, RESET, CLOCK INHIBIT, RBI, LAMP TEST held at the given
// rail levels (1 = VCC row, 0 = GND row). Counter state lives on the chip
// component, so a fresh WireManager each call is fine.
function apply({ clk, reset = false, inhibit = false, rbi = true, lampTest = false }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4033 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  wirePin('CLOCK', clk ? 1 : 0);
  wirePin('RESET', reset ? 1 : 0);
  wirePin('CLOCK INHIBIT', inhibit ? 1 : 0);
  wirePin('RBI', rbi ? 1 : 0);
  wirePin('LAMP TEST', lampTest ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const SEG = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const segPattern = () => SEG.map(s => isHigh(read(s)) ? 1 : 0);

// Standard active-HIGH 7-seg decode [a,b,c,d,e,f,g] for digits 0-9.
const SEG7 = [
  [1,1,1,1,1,1,0], // 0
  [0,1,1,0,0,0,0], // 1
  [1,1,0,1,1,0,1], // 2
  [1,1,1,1,0,0,1], // 3
  [0,1,1,0,0,1,1], // 4
  [1,0,1,1,0,1,1], // 5
  [1,0,1,1,1,1,1], // 6
  [1,1,1,0,0,0,0], // 7
  [1,1,1,1,1,1,1], // 8
  [1,1,1,1,0,1,1], // 9
];

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// One full clock pulse = LOW then HIGH; the count advances on the rising edge.
function pulse(n = 1, opts = {}) {
  for (let i = 0; i < n; i++) {
    apply({ clk: false, ...opts }); // bring clock low
    apply({ clk: true,  ...opts }); // rising edge → advance (unless inhibited)
  }
}

// Expect the segment pattern of digit `d` and the CARRY half-cycle rule.
function expectDigit(d, label) {
  const got = segPattern();
  assert(eq(got, SEG7[d]),
    `${label}: expected segments ${SEG7[d].join('')} for "${d}", got ${got.join('')}`);
  const carryExpected = d <= 4; // CARRY HIGH for counts 0-4, LOW for 5-9
  assert(isHigh(read('CARRY OUT')) === carryExpected,
    `${label}: CARRY OUT should be ${carryExpected ? 'HIGH' : 'LOW'} at count ${d}`);
}

// ── 0. Power up with RESET asserted → count 0 (shows "0", CARRY HIGH, RBO HIGH) ─
apply({ clk: false, reset: true });
expectDigit(0, 'reset');
assert(isHigh(read('RBO')), 'reset: RBO should be HIGH (RBI HIGH, zero displayed)');
apply({ clk: false, reset: false }); // release reset, no edge → still 0
expectDigit(0, 'post-reset idle');

// ── 1. Walk the full decade 1..9, segment decode + CARRY track ───────────────
for (let d = 1; d <= 9; d++) {
  pulse(1);
  expectDigit(d, `${d} edge(s)`);
}

// ── 2. 10th rising edge wraps mod-10 back to 0 ───────────────────────────────
pulse(1);
expectDigit(0, 'wrap (10th edge)');

// ── 3. CLOCK INHIBIT HIGH freezes the count across a clock edge ──────────────
pulse(1);                       // count now 1
expectDigit(1, 'pre-inhibit');
pulse(1, { inhibit: true });    // rising edge while inhibited → no advance
expectDigit(1, 'inhibited edge');
pulse(1);                       // inhibit released → advances to 2
expectDigit(2, 'post-inhibit');

// ── 4. LAMP TEST HIGH lights all seven segments (display "8") ────────────────
apply({ clk: true, lampTest: true });
assert(eq(segPattern(), [1,1,1,1,1,1,1]), 'lamp test: all 7 segments should be ON');
apply({ clk: true, lampTest: false }); // back to normal; count still 2
expectDigit(2, 'post-lamp-test');

// ── 5. Ripple blanking: count 0 + RBI LOW → blank, RBO LOW ───────────────────
apply({ clk: false, reset: true });           // count 0, RBI default HIGH
expectDigit(0, 'reset before blank test');     // zero displayed normally
assert(isHigh(read('RBO')), 'RBI HIGH at count 0: RBO should be HIGH');
apply({ clk: false, rbi: false });             // drive RBI LOW at count 0
assert(eq(segPattern(), [0,0,0,0,0,0,0]),
  'ripple blank: count 0 + RBI LOW → all segments OFF');
assert(!isHigh(read('RBO')),
  'ripple blank: RBO should be LOW to propagate blanking');

// ── 6. count 0 + RBI HIGH keeps the zero (no blank), RBO HIGH ────────────────
apply({ clk: false, rbi: true });
expectDigit(0, 'RBI HIGH keeps zero');
assert(isHigh(read('RBO')), 'unblanked zero: RBO should be HIGH');

// ── 7. A non-zero digit is never blanked even with RBI LOW ───────────────────
pulse(1, { rbi: false });                      // advance to 1 with RBI low
assert(eq(segPattern(), SEG7[1]),
  'non-zero digit with RBI LOW must still display');
assert(isHigh(read('RBO')), 'non-zero digit: RBO should be HIGH');

console.log(`cd4033-counter-7seg: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
