// ── CD4026 decade counter + 7-seg driver, display enable — regression ────────
// The CD4026 (Batch 8, js/chips/chips94.js) is the behavioral coverage of the
// COUNTER_7SEG_4026 primitive — the DISPLAY-ENABLE sibling of the CD4033's
// ripple-blanking decade-counter-plus-7-segment-decoder. It guards the chip's
// DB entry: the segment pin map (a=10,b=12,c=13,d=9,e=11,f=6,g=7), the
// RISING-edge clock gated by active-HIGH CLOCK INHIBIT (and the inhibit-as-
// negative-edge-clock mode), the active-HIGH asynchronous RESET, the CARRY OUT
// (CLOCK/10) HIGH for counts 0-4 / LOW for 5-9, the active-HIGH 7-seg decode,
// the DISPLAY ENABLE IN blanking (segments forced low while CARRY OUT and the
// UNGATED "C" SEGMENT stay live), and DISPLAY ENABLE OUT = buffered DEI.
//
// Method: place ONE CD4026 and keep the same chip + sim instance across the run
// so the counter's sequential state persists. A clock "pulse" re-wires CLOCK LOW
// then HIGH (a rising edge); each LOW->HIGH transition with CLOCK INHIBIT LOW
// advances the count by one. Outputs are read straight off the pins by name.
//
// Checks:
//   • RESET HIGH → count 0: segments show "0" (a-f on, g off), CARRY HIGH
//   • walk 0..9 → segment pattern matches the standard 7-seg decode each step
//   • CARRY OUT HIGH for counts 0-4, LOW for counts 5-9                (CLOCK/10)
//   • UNGATED "C" SEGMENT tracks the c-segment decode each step
//   • 10th edge wraps mod-10 back to 0
//   • CLOCK INHIBIT HIGH freezes the count across a clock edge
//   • inhibit-as-clock: CLOCK held HIGH, a falling edge on CLOCK INHIBIT counts
//   • DISPLAY ENABLE IN LOW → all 7 segments OFF, but CARRY + UNGATED C unchanged
//   • DISPLAY ENABLE OUT mirrors DISPLAY ENABLE IN
//
// Run:  node js/debug/scenarios/cd4026-counter-7seg.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4026');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLOCK, RESET, CLOCK INHIBIT, DISPLAY ENABLE IN held at the given
// rail levels (1 = VCC row, 0 = GND row). Counter state lives on the chip
// component, so a fresh WireManager each call is fine.
function apply({ clk, reset = false, inhibit = false, dispEn = true }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4026 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', clk ? 1 : 0);
  wirePin('RESET', reset ? 1 : 0);
  wirePin('CLKINH', inhibit ? 1 : 0);
  wirePin('DEI', dispEn ? 1 : 0);
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

// Expect the segment pattern of digit `d`, the CARRY half-cycle rule, and that
// the UNGATED "C" segment equals the c-bit of the decode.
function expectDigit(d, label) {
  const got = segPattern();
  assert(eq(got, SEG7[d]),
    `${label}: expected segments ${SEG7[d].join('')} for "${d}", got ${got.join('')}`);
  const carryExpected = d <= 4; // CARRY HIGH for counts 0-4, LOW for 5-9
  assert(isHigh(read('CARRY')) === carryExpected,
    `${label}: CARRY OUT should be ${carryExpected ? 'HIGH' : 'LOW'} at count ${d}`);
  assert((isHigh(read('UC')) ? 1 : 0) === SEG7[d][2],
    `${label}: UNGATED C should equal c-segment (${SEG7[d][2]}) at count ${d}`);
}

// ── 0. Power up with RESET asserted → count 0 (shows "0", CARRY HIGH) ─────────
apply({ clk: false, reset: true });
expectDigit(0, 'reset');
apply({ clk: false, reset: false }); // release reset, no edge → still 0
expectDigit(0, 'post-reset idle');

// ── 1. Walk the full decade 1..9, segment decode + CARRY + UNGATED C track ────
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

// ── 4. Inhibit-as-clock: CLOCK held HIGH, falling edge on CLOCK INHIBIT counts ─
// Gated clock G = CLOCK AND NOT INHIBIT. With CLOCK high, releasing INHIBIT
// (HIGH→LOW) is a rising edge of G and advances the counter.
apply({ clk: true, inhibit: true });  // G low (inhibited), no edge; still 2
expectDigit(2, 'inhibit-as-clock setup');
apply({ clk: true, inhibit: false }); // INHIBIT falls while CLOCK high → G rises
expectDigit(3, 'inhibit-as-clock advance');

// ── 5. DISPLAY ENABLE IN LOW blanks the 7 segments, leaves CARRY + UNGATED C ──
apply({ clk: true, dispEn: true });
expectDigit(3, 'display enabled');
const carryBefore = isHigh(read('CARRY'));
const ucBefore = isHigh(read('UC'));
apply({ clk: true, dispEn: false });  // blank
assert(eq(segPattern(), [0,0,0,0,0,0,0]),
  'display enable LOW: all 7 segments should be OFF');
assert(isHigh(read('CARRY')) === carryBefore,
  'display enable LOW must NOT affect CARRY OUT');
assert(isHigh(read('UC')) === ucBefore,
  'display enable LOW must NOT affect the UNGATED "C" segment');
assert(!isHigh(read('DEO')),
  'DISPLAY ENABLE OUT should mirror DISPLAY ENABLE IN (LOW)');

// ── 6. Re-enable display: digit reappears, DEO mirrors DEI, count preserved ───
apply({ clk: true, dispEn: true });
expectDigit(3, 're-enabled display');
assert(isHigh(read('DEO')),
  'DISPLAY ENABLE OUT should mirror DISPLAY ENABLE IN (HIGH)');

console.log(`cd4026-counter-7seg: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
