// ── CD40110 dual-clocked decade up/down counter + 7-seg + latch — regression ──
// The CD40110 (Batch 8, js/chips/chips131.js) is the behavioral coverage of the
// new COUNTER_7SEG_40110 primitive — a dual-clocked (separate CLOCK UP / CLOCK
// DOWN) decade up/down counter with an output latch, a decoded 7-segment driver,
// and CARRY/BORROW cascade outputs. It guards the chip's DB entry: the segment
// pin map (a=1,b=15,c=14,d=13,e=12,f=3,g=2), the two separate positive-edge
// clocks (increment / decrement, mod-10), the active-HIGH async RESET, the
// active-LOW TOGGLE ENABLE count-inhibit (pin HIGH holds), the LATCH ENABLE
// transparent(LOW)/hold(HIGH) display latch, the active-HIGH 7-seg decode, and
// the CARRY/BORROW outputs (normally HIGH, LOW at the 9->0 / 0->9 rollover phase,
// the 74x192 cascade convention).
//
// Method: place ONE CD40110 and keep the same chip + sim instance across the run
// so the counter's sequential state persists. A clock "pulse" re-wires a clock
// line LOW then HIGH (a rising edge). The non-pulsed clock is held HIGH so the
// CARRY/BORROW outputs read their resting HIGH level (they only go LOW during the
// terminal-count clock-LOW phase). Outputs are read straight off the pins.
//
// Run:  node js/debug/scenarios/cd40110-updown-7seg.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40110');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with the five control inputs held at the given rail levels. Counter
// state lives on the chip component, so a fresh WireManager each call is fine.
// up/down = clock lines; le = LATCH ENABLE (false=transparent); te = TOGGLE
// ENABLE (false=count enabled); reset active-HIGH.
function apply({ up = false, down = false, le = false, te = false, reset = false }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40110 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  wirePin('CLOCK UP', up ? 1 : 0);
  wirePin('CLOCK DOWN', down ? 1 : 0);
  wirePin('LATCH ENABLE', le ? 1 : 0);
  wirePin('TOGGLE ENABLE', te ? 1 : 0);
  wirePin('RESET', reset ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const SEG = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const segPattern = () => SEG.map(s => isHigh(read(s)) ? 1 : 0);

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

// One count-up pulse: CLOCK UP low->high while CLOCK DOWN held HIGH (no down
// edge, and down=HIGH keeps BORROW at its resting HIGH level).
function pulseUp(opts = {}) {
  apply({ up: false, down: true, ...opts });
  apply({ up: true,  down: true, ...opts });
}
// One count-down pulse: CLOCK DOWN low->high while CLOCK UP held HIGH.
function pulseDown(opts = {}) {
  apply({ up: true, down: false, ...opts });
  apply({ up: true, down: true,  ...opts });
}

function expectDigit(d, label) {
  const got = segPattern();
  assert(eq(got, SEG7[d]),
    `${label}: expected segments ${SEG7[d].join('')} for "${d}", got ${got.join('')}`);
}

// ── 0. Power up with RESET asserted → count 0 (shows "0"), CARRY/BORROW HIGH ──
apply({ up: true, down: true, reset: true });
expectDigit(0, 'reset');
assert(isHigh(read('CARRY')),  'reset: CARRY should rest HIGH (clocks high)');
assert(isHigh(read('BORROW')), 'reset: BORROW should rest HIGH (clocks high)');
apply({ up: true, down: true, reset: false }); // release, no edge → still 0
expectDigit(0, 'post-reset idle');

// ── 1. Count UP through the full decade 1..9 ─────────────────────────────────
for (let d = 1; d <= 9; d++) {
  pulseUp();
  expectDigit(d, `up to ${d}`);
  assert(isHigh(read('CARRY')), `up to ${d}: CARRY should be HIGH (resting)`);
}

// ── 2. CARRY pulses LOW at count 9 during the CLOCK UP low phase ─────────────
apply({ up: false, down: true }); // count 9, CLOCK UP low → carry asserted LOW
assert(!isHigh(read('CARRY')),
  'carry: at count 9 with CLOCK UP low, CARRY should pulse LOW');
apply({ up: true, down: true });  // rising edge → wrap 9->0; carry back HIGH
expectDigit(0, 'wrap up (10th edge)');
assert(isHigh(read('CARRY')), 'carry: back HIGH after 9->0 rollover');

// ── 3. Count DOWN wraps 0 -> 9, and BORROW pulses LOW at count 0 ─────────────
apply({ up: true, down: false }); // count 0, CLOCK DOWN low → borrow asserted LOW
assert(!isHigh(read('BORROW')),
  'borrow: at count 0 with CLOCK DOWN low, BORROW should pulse LOW');
apply({ up: true, down: true });  // rising edge → wrap 0->9; borrow back HIGH
expectDigit(9, 'wrap down (0->9)');
assert(isHigh(read('BORROW')), 'borrow: back HIGH after 0->9 rollover');
pulseDown();
expectDigit(8, 'down to 8');

// ── 4. TOGGLE ENABLE HIGH inhibits both clocks (count holds) ─────────────────
pulseUp({ te: true });   // rising edge while inhibited → no change
expectDigit(8, 'inhibited up edge');
pulseDown({ te: true }); // also inhibited
expectDigit(8, 'inhibited down edge');
pulseUp();               // enable restored → advances to 9
expectDigit(9, 'post-inhibit');

// ── 5. LATCH ENABLE HIGH freezes the display while the counter keeps running ─
pulseUp();               // 9 -> 0 (display now "0", latch transparent)
expectDigit(0, 'pre-latch');
// Raise LATCH ENABLE, then count up: display must HOLD "0" though count advances.
apply({ up: true, down: true, le: true });
pulseUp({ le: true });   // count -> 1, but latch holds
expectDigit(0, 'latched display holds while counting');
pulseUp({ le: true });   // count -> 2, still held
expectDigit(0, 'latched display still holds');
// Release the latch → display catches up to the live count (2).
apply({ up: true, down: true, le: false });
expectDigit(2, 'latch released → display follows count');

console.log(`cd40110-updown-7seg: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
