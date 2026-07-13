// ── CD4536 programmable timer regression ─────────────────────────────────────
// The CD4536 (js/chips/chips143.js) is the first behavioral coverage of the new
// FREQ_DIV_PROG_4536 primitive. It guards the externally-clocked programmable
// divider core: the 24-stage ripple counter (advances on the FALLING edge of
// IN1), the 1-of-16 BCD output tap (A=LSB..D=MSB), the 8-BYPASS tap relocation,
// CLOCK INHIBIT freeze, and the async RESET (clear) / SET (fill) controls.
//
// The on-chip RC oscillator and the variable monostable pulse width are NOT
// modeled (issues.md A3/A9), so there is nothing to test there — DECODE OUT is
// the raw divided clock, matching the datasheet "MONO IN grounded" mode.
//
// Method mirrors cd4059-divide-by-n.mjs: place ONE CD4536, keep the same chip +
// sim across a test so comp.state persists. A clock "pulse" is rising then
// falling on IN1; the counter advances on the falling edge.
//
// Run:  node js/debug/scenarios/cd4536-prog-timer.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Build a fresh CD4536 + sim. `levels` sets the static control pins (BYP8, the
// A/B/C/D select code, etc.); anything not listed is driven LOW.
function makeChip(levels) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('CD4536');
  chip.place(0, 0, 2, 4);
  const sim = new CircuitSimulator();

  const base = { CLKINH: 0, BYP8: 0, RESET: 0, SET: 0,
    A: 0, B: 0, C: 0, D: 0, ...levels };
  let clk = 0;

  const read = () => isHigh(sim.getVoltageAtHole(chip.getPinByName('DEC').holeId));

  function evalNow() {
    const wm = new WireManager();
    const wirePin = (name, bit) => {
      const p = chip.getPinByName(name);
      if (!p) throw new Error(`CD4536 has no pin named ${name}`);
      wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
    };
    wirePin('VDD', 1);
    wirePin('VSS', 0);
    wirePin('IN1', clk);
    for (const [name, bit] of Object.entries(base)) wirePin(name, bit);
    sim.evaluate(world, [chip], wm);
  }

  function setClk(c) { clk = c; evalNow(); }
  function set(name, bit) { base[name] = bit; evalNow(); }
  // One clock pulse = rising (no count) then falling (counts).
  function pulse() { setClk(1); setClk(0); return read(); }

  setClk(0);   // establish IN1-low baseline (seeds prevClk = 0)
  return { pulse, read, set, setClk };
}

// ── Test A: 8-BYPASS, tap 0 (n=0) → DECODE OUT = IN1/2 ───────────────────────
// count after pulse k = k; DEC = bit0 = k & 1.
{
  const c = makeChip({ BYP8: 1 });               // A=B=C=D=0 → n=0
  const pattern = [];
  for (let i = 1; i <= 6; i++) pattern.push(c.pulse());
  const expected = [true, false, true, false, true, false];
  assert(JSON.stringify(pattern) === JSON.stringify(expected),
    `bypass n=0 (÷2): expected ${JSON.stringify(expected)}, got ${JSON.stringify(pattern)}`);
}

// ── Test B: 8-BYPASS, tap 1 (n=1 via B) → DECODE OUT = IN1/4 ──────────────────
// DEC = bit1 = (k>>1)&1.
{
  const c = makeChip({ BYP8: 1, B: 1 });         // n = 2? no: B is bit1 → n=2... see note
  // NOTE: B is bit1 of n, so {B:1} gives n=2, tapping bit (8*0 + 2)=bit2 → IN1/8.
  // Use A for n=1 to test the IN1/4 tap explicitly below; keep this as IN1/8.
  let highs = [];
  for (let i = 1; i <= 16; i++) if (c.pulse()) highs.push(i);
  // bit2 high when (k & 4): counts 4,5,6,7,12,13,14,15.
  assert(JSON.stringify(highs) === JSON.stringify([4, 5, 6, 7, 12, 13, 14, 15]),
    `bypass n=2 (÷8): expected highs at 4-7,12-15, got [${highs.join(',')}]`);
}

// ── Test B2: 8-BYPASS, n=1 via A → DECODE OUT = IN1/4 ────────────────────────
{
  const c = makeChip({ BYP8: 1, A: 1 });         // A is bit0 of n → n=1 → tap bit1
  let highs = [];
  for (let i = 1; i <= 8; i++) if (c.pulse()) highs.push(i);
  assert(JSON.stringify(highs) === JSON.stringify([2, 3, 6, 7]),
    `bypass n=1 (÷4): expected highs at 2,3,6,7, got [${highs.join(',')}]`);
}

// ── Test C: no bypass, n=0 → DECODE OUT = IN1/512 (tap bit 8) ─────────────────
{
  const c = makeChip({ BYP8: 0 });               // n=0 → tap bit 8
  let any = false;
  for (let i = 1; i <= 255; i++) if (c.pulse()) any = true;
  assert(!any, 'no-bypass ÷512: DEC must stay LOW for the first 255 counts');
  assert(c.pulse(), 'no-bypass ÷512: DEC must go HIGH at count 256');
}

// ── Test D: async RESET clears the counter ───────────────────────────────────
{
  const c = makeChip({ BYP8: 1 });               // n=0, ÷2
  c.pulse();                                      // count=1 → DEC high
  assert(c.read(), 'reset setup: DEC should be HIGH at count 1');
  c.set('RESET', 1);                              // async clear, no clock edge
  assert(!c.read(), 'reset: DEC should be LOW after RESET (count cleared to 0)');
  c.set('RESET', 0);
}

// ── Test E: async SET fills all stages (any tap reads HIGH) ───────────────────
{
  const c = makeChip({ BYP8: 1, C: 1 });         // n=4 → tap bit4
  assert(!c.read(), 'set setup: DEC should start LOW (count 0)');
  c.set('SET', 1);                                // fill all 24 stages
  assert(c.read(), 'set: DEC should be HIGH after SET (all stages = 1)');
}

// ── Test F: CLOCK INHIBIT freezes the count ──────────────────────────────────
{
  const c = makeChip({ BYP8: 1 });               // n=0, ÷2
  c.pulse();                                      // count=1 → DEC high
  assert(c.read(), 'inhibit setup: DEC high at count 1');
  c.set('CLKINH', 1);                             // freeze
  for (let i = 0; i < 5; i++) c.pulse();          // pulses ignored
  assert(c.read(), 'inhibit: DEC should stay HIGH (count frozen at 1)');
  c.set('CLKINH', 0);                             // release
  assert(!c.pulse(), 'inhibit release: next pulse advances to count 2 → DEC LOW');
}

console.log(`cd4536-prog-timer: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
