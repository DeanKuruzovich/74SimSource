// ── 74x925 4-decade counter + multiplexed 7-segment display driver — regression ─
// The 74x925 (js/chips/chips44.js) is the upgraded former stub: the 16-pin
// MM74C925, base of the MM74C925/926/927/928 family. It shares the family
// primitive COUNTER_DISPLAY_4DIGIT_928 with the 74x928 entry, driven here with
// gate.maxCount:9999 and no DS input / no CO output.
//
// Verified pinout (Fairchild DS005919, MM74C925 Connection Diagram, Top View):
//   d1 e2 f3 g4, LATCH ENABLE 5, A_OUT 6, B_OUT 7, GND 8, C_OUT 9, D_OUT 10,
//   CLOCK 11, RESET 12, a13 b14 c15, VCC 16.
// Behavior under test: negative-edge clock advances 0000→9999, asynchronous
// active-HIGH reset, LATCH ENABLE HIGH = display follows count / LOW = frozen,
// the display always shows the latch (no display-select pin), one-digit-at-a-time
// multiplexing (D1..D4 one-hot, D1 = units), and that it counts past 1999 without
// wrapping (the modulus that distinguishes it from the 74x928).
//
// The display multiplexes one digit per evaluate() (simVersion % 4), so the count
// is read by scanning four consecutive evaluate passes with the clock held steady
// (no new edge) and decoding each scanned digit's segments back to a value.
//
// Run:  node js/debug/scenarios/74x925-counter-display.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { BCD_7SEG_CC_TABLE } from '../../chips.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x925');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with CLK, RST and LE held at the given rail levels. Counter/latch
// state lives on the chip component, so a fresh WireManager each call is fine.
function apply({ clk, reset = false, le = true }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x925 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('RST', reset ? 1 : 0);
  wirePin('LE',  le ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Decode the currently-lit digit's 7 segments (active-HIGH a..g) back to 0-9 by
// matching against the same table the engine drives. Returns -1 if no match.
function decodeSegments() {
  const segs = ['a','b','c','d','e','f','g'].map(s => isHigh(read(s)) ? 1 : 0);
  for (let d = 0; d <= 9; d++) {
    const want = BCD_7SEG_CC_TABLE[d].slice(4, 11);
    if (want.every((b, i) => b === segs[i])) return d;
  }
  return -1;
}

// The clock RESTS HIGH between operations. The MM74C925 advances on the negative
// (HIGH→LOW) edge, so one pulse dips LOW (advance) then returns to the HIGH rest
// level. Keeping the rest level HIGH means stray apply() calls elsewhere can't
// manufacture an unwanted falling edge.
function pulse(n = 1, opts = {}) {
  for (let i = 0; i < n; i++) {
    apply({ clk: false, ...opts }); // HIGH→LOW edge → advance
    apply({ clk: true,  ...opts }); // back to rest
  }
}

// Read the whole 4-digit number by scanning four evaluate passes (clock held HIGH,
// no edge → no count change). Asserts D1..D4 are each selected exactly once.
function readDisplay(label, { le = true } = {}) {
  const seen = {};        // position(0=units..3=thousands) -> digit value
  const hits = { D1:0, D2:0, D3:0, D4:0 };
  for (let pass = 0; pass < 4; pass++) {
    apply({ clk: true, le });
    const hot = ['D1','D2','D3','D4'].filter(d => isHigh(read(d)));
    assert(hot.length === 1, `${label}: expected one digit-select HIGH, got [${hot.join(',')}]`);
    if (hot.length === 1) {
      hits[hot[0]]++;
      const posByName = { D1:0, D2:1, D3:2, D4:3 };
      seen[posByName[hot[0]]] = decodeSegments();
    }
  }
  for (const d of ['D1','D2','D3','D4'])
    assert(hits[d] === 1, `${label}: ${d} should be selected exactly once per 4 scans, got ${hits[d]}`);
  const num = (seen[3] ?? 0) * 1000 + (seen[2] ?? 0) * 100 + (seen[1] ?? 0) * 10 + (seen[0] ?? 0);
  return num;
}

// ── 0. Power up with RESET asserted → 0000 ───────────────────────────────────
apply({ clk: true, reset: true }); // clock at rest (HIGH), reset asserted
assert(readDisplay('reset') === 0, 'reset: display should read 0000');

apply({ clk: true, reset: false }); // release reset, no edge → still 0
assert(readDisplay('post-reset idle') === 0, 'post-reset idle: should stay 0000');

// ── 1. Count single digits 1..9 ──────────────────────────────────────────────
for (let n = 1; n <= 9; n++) {
  pulse(1);
  const got = readDisplay(`count ${n}`);
  assert(got === n, `count ${n}: display should read ${n}, got ${got}`);
}

// ── 2. Cross the units→tens boundary (9→10) and keep going to 23 ──────────────
pulse(1); // 10
assert(readDisplay('count 10') === 10, 'count 10: tens digit should roll in');
pulse(13); // 23
assert(readDisplay('count 23') === 23, 'count 23: two-digit value');

// ── 3. LATCH ENABLE LOW freezes the display while the counter runs underneath ─
// Freeze at 23, advance the counter 5 edges with LE LOW, display must stay 23.
pulse(5, { le: false });
assert(readDisplay('latched', { le: false }) === 23,
  'latched: display frozen at 23 while LE LOW even though counter advanced');
// Release LE (transparent) → display catches up to the true count (28).
assert(readDisplay('unlatched', { le: true }) === 28,
  'unlatched: display should jump to the live count 28');

// ── 4. Asynchronous reset mid-count clears to 0000 ───────────────────────────
apply({ clk: true, reset: true });
assert(readDisplay('async reset') === 0, 'async reset: back to 0000');

// ── 5. Modulus check: counts past 1999 (would wrap there on a 74x928) ─────────
// Drive to 2001 and confirm the display reads 2001, proving maxCount:9999.
pulse(2001);
assert(readDisplay('past 2000') === 2001,
  'past 2000: 74x925 counts past 1999 without wrapping (got the 928 modulus?)');

console.log(`74x925-counter-display: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
