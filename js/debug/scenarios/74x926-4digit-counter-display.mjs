// ── 74x926 (MM74C926) 4-digit decade counter + 7-seg display driver — regression ─
// The 74x926 (js/chips/chips44.js) is the behavioral coverage of the
// COUNTER_DISPLAY_4DIGIT_926 primitive in js/specificChipsSim.js. It is the
// 0–9999 decade sibling of the 0–1999 COUNTER_DISPLAY_4DIGIT_928, differing in
// two ways verified against the datasheet (Fairchild DS005919, p.1–3):
//   • all four digits divide by 10, so it wraps at 9999 (not 1999);
//   • the carry-out is a LEVEL (HIGH at 6000, LOW at 0000), not the '928's
//     latched overflow flag.
//
// Behavior under test (datasheet Functional Description p.2):
//   RST  async, active HIGH        CLK  negative-edge (HIGH→LOW) sensitive
//   LE   HIGH=flow-through/LOW=latch DS   HIGH=show counter/LOW=show latch
//   CO   HIGH while count ≥ 6000     display is time-multiplexed, one digit/pass
//
// Method: place ONE 74x926 and keep the same chip + sim instance so the
// sequential counter state persists. The display is multiplexed by the
// simulator's per-evaluate tick (simVersion % 4): each evaluate() drives one
// digit position. To read the whole number we hold the inputs steady (no clock
// edge) for four evaluates and assemble the digit shown on whichever D-line is
// HIGH that pass. A clock "pulse" is a HIGH→LOW edge (the active edge).
//
// Run:  node js/debug/scenarios/74x926-4digit-counter-display.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x926');
chip.place(0, 0, 2, 9);
const sim = new CircuitSimulator();

// Re-solve with CLK/RST/LE/DS held at the given rail levels. Counter state lives
// on the chip component, so a fresh WireManager each call is fine.
//
// Inputs are PERSISTENT: `set(patch)` merges the patch into the held level of
// each pin and re-solves. This matters because the counter is negative-edge
// triggered — if sampling the multiplexed display toggled CLK it would fabricate
// a HIGH→LOW edge and miscount. So sampling never touches CLK; it just re-solves
// with everything held, advancing only the internal display scan.
const cur = { clk: 0, rst: 0, le: 1, ds: 1 };
function set(patch = {}) {
  Object.assign(cur, patch);
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x926 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', cur.clk ? 1 : 0);
  wirePin('RST', cur.rst ? 1 : 0);
  wirePin('LE',  cur.le ? 1 : 0);
  wirePin('DS',  cur.ds ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// Standard active-HIGH 7-seg decode [a,b,c,d,e,f,g] for digits 0-9. Independent
// reference: if the chip's BCD→7-seg table disagrees, the decode below fails.
const SEG7 = [
  [1,1,1,1,1,1,0], [0,1,1,0,0,0,0], [1,1,0,1,1,0,1], [1,1,1,1,0,0,1],
  [0,1,1,0,0,1,1], [1,0,1,1,0,1,1], [1,0,1,1,1,1,1], [1,1,1,0,0,0,0],
  [1,1,1,1,1,1,1], [1,1,1,1,0,1,1],
];
const SEG = ['a','b','c','d','e','f','g'];
const segToDigit = (pat) => {
  for (let d = 0; d < 10; d++) {
    if (SEG7[d].every((v, i) => v === pat[i])) return d;
  }
  return -1; // unrecognized pattern
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Read the full 4-digit number by sampling four multiplexed passes. CLK is held
// at its current level (never toggled here), so no clock edge occurs and the
// count stays frozen while the internal scan walks all four digits. `opts` may
// set le/ds (e.g. to view the latch). Returns { value, co }, value = D4D3D2D1.
function readDisplay(opts = {}) {
  const digits = [null, null, null, null]; // by D-line index 0..3 (units..thousands)
  let co = 0;
  for (let pass = 0; pass < 4; pass++) {
    set(opts); // CLK unchanged → no edge; scan advances one position
    co = isHigh(read('CO')) ? 1 : 0;
    const sel = [1,2,3,4].map(n => isHigh(read('D' + n)) ? 1 : 0);
    const active = sel.indexOf(1);
    assert(sel.filter(x => x).length === 1,
      `exactly one digit-select line should be HIGH per pass, got D=[${sel}]`);
    if (active >= 0) {
      const pat = SEG.map(s => isHigh(read(s)) ? 1 : 0);
      digits[active] = segToDigit(pat);
    }
  }
  assert(digits.every(d => d !== null),
    `all four digit positions should be scanned over four passes, got ${digits}`);
  assert(digits.every(d => d >= 0),
    `every shown digit should decode to 0-9, got ${digits}`);
  const value = (digits[3] ?? 0) * 1000 + (digits[2] ?? 0) * 100 +
                (digits[1] ?? 0) * 10 + (digits[0] ?? 0);
  return { value, co };
}

// One active clock edge = drive CLK HIGH, then LOW (the HIGH→LOW edge advances).
// CLK ends LOW, so a following readDisplay holds LOW and adds no extra edge.
function clockEdge() {
  set({ clk: 1 });
  set({ clk: 0 });
}

// ── 0. RESET HIGH → count 0 ──────────────────────────────────────────────────
set({ clk: 0, rst: 1 });
let r = readDisplay();
assert(r.value === 0, `after reset, display should read 0, got ${r.value}`);
assert(r.co === 0, `after reset, CO should be LOW, got ${r.co}`);

// ── 1. Count up a handful of edges; display tracks the count ─────────────────
set({ rst: 0 }); // release reset (CLK held LOW → no edge → still 0)
for (let n = 1; n <= 5; n++) {
  clockEdge();
  r = readDisplay();
  assert(r.value === n, `after ${n} edge(s), display should read ${n}, got ${r.value}`);
}

// ── 2. Negative-edge only: a LOW→HIGH transition must NOT advance ────────────
set({ clk: 1 }); // rising edge — should be ignored (count stays 5)
r = readDisplay();
assert(r.value === 5, `rising edge must not advance the counter, got ${r.value}`);
set({ clk: 0 }); // return LOW: this IS a falling edge → count advances to 6
r = readDisplay();
assert(r.value === 6, `the following falling edge should advance to 6, got ${r.value}`);

// ── 3. Latch: LE LOW freezes the displayed value while the counter runs on ───
// Counter is at 6, latch transparent. Clock to 7, freeze the latch there, clock
// the counter on to 8, and confirm the latch still shows 7.
readDisplay({ le: 1 });               // ensure latch has captured 6
clockEdge();                          // → 7 (latch still open here)
set({ le: 0 });                       // freeze the latch at 7
clockEdge();                          // counter → 8, latch frozen at 7
r = readDisplay({ le: 0, ds: 0 });    // view the LATCH
assert(r.value === 7, `latched display should hold 7 while counter runs, got ${r.value}`);
// Viewing the live counter (DS HIGH) shows the real count = 8.
r = readDisplay({ le: 0, ds: 1 });
assert(r.value === 8, `live counter should read 8 behind the frozen latch, got ${r.value}`);
// Re-open the latch (LE HIGH): it catches up to the counter.
r = readDisplay({ le: 1, ds: 0 });
assert(r.value === 8, `re-opened latch should follow counter to 8, got ${r.value}`);

// ── 4. Carry-out: LOW below 6000, HIGH at/above 6000, LOW again after wrap ───
// Reaching 6000+ by hand is thousands of edges. Clock in bulk and read the live
// count straight off the primitive's sequential state (keyed by the first output
// pin name, 'a') so the fast-forward is cheap; assertions still go through the
// real pins via readDisplay.
const liveCount = () => chip.ffState.get('a').count;
function advanceTo(target) {
  let guard = 0;
  while (liveCount() !== target) {
    clockEdge();
    if (++guard > 10100) { assert(false, `advanceTo(${target}) ran away at ${liveCount()}`); break; }
  }
}
set({ clk: 0, rst: 1, le: 1, ds: 1 }); // back to 0, latch transparent
set({ rst: 0 });
advanceTo(5999);
r = readDisplay({ le: 1, ds: 1 });
assert(r.value === 5999 && r.co === 0, `at 5999 CO should be LOW, got value=${r.value} co=${r.co}`);
clockEdge(); // → 6000
r = readDisplay({ le: 1, ds: 1 });
assert(r.value === 6000 && r.co === 1, `at 6000 CO should be HIGH, got value=${r.value} co=${r.co}`);

// ── 5. Wrap at 9999 → 0000, CO returns LOW ───────────────────────────────────
advanceTo(9999);
r = readDisplay({ le: 1, ds: 1 });
assert(r.value === 9999 && r.co === 1, `at 9999 CO should still be HIGH, got value=${r.value} co=${r.co}`);
clockEdge(); // → 0000 (wrap)
r = readDisplay({ le: 1, ds: 1 });
assert(r.value === 0 && r.co === 0, `after 9999 the counter should wrap to 0 with CO LOW, got value=${r.value} co=${r.co}`);

console.log(`74x926-4digit-counter-display: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
