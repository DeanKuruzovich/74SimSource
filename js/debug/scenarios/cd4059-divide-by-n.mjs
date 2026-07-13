// ── CD4059 programmable divide-by-N counter regression ───────────────────────
// The CD4059 (js/chips/chips121.js) is the first behavioral coverage of the new
// FREQ_DIV_PROG_4059 primitive. It guards: the rising-edge clock, the divide
// ratio N = M*(1000*D5+100*D4+10*D3+D2)+D1 with the MODE-dependent jam-input
// split (Table I), the one-clock-wide output pulse, the Master-Preset hold, and
// the Latch-Enable output latch.
//
// Method: place ONE CD4059, keep the same chip + sim instance across a test so
// the counter's sequential state (comp.state) persists. A clock "pulse" is a
// rising then falling edge on CLK; the counter advances on the rising edge.
// Each test rebuilds the chip so state starts clean.
//
// Checks:
//   • Mode 10 (Ka1 Kb1 Kc0), D1=3 → ÷3: OUT pulses on every 3rd clock
//   • Mode  5 (Ka1 Kb0 Kc1), D1=2,D2=1 → ÷7: jam split J1-3=units, J5-8=D2
//   • Mode  2 (Ka1 Kb1 Kc1), D1=1(J1),D2=2(J6) → ÷5: mode-2 jam mapping
//   • Master Preset (Kb0 Kc0) → OUT stays LOW through many clocks (no count)
//   • Latch Enable HIGH holds OUT high after a pulse until LE returns LOW
//
// Run:  node js/debug/scenarios/cd4059-divide-by-n.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Build a fresh CD4059 + sim. `levels` is a map of pinName → 0/1 for the static
// control inputs (mode + jam bits, plus LE); anything not listed is driven LOW.
function makeChip(levels) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('CD4059');
  chip.place(0, 0, 2, 4);
  const sim = new CircuitSimulator();

  const base = { LE: 0, Ka: 0, Kb: 0, Kc: 0,
    J1: 0, J2: 0, J3: 0, J4: 0, J5: 0, J6: 0, J7: 0, J8: 0,
    J9: 0, J10: 0, J11: 0, J12: 0, J13: 0, J14: 0, J15: 0, J16: 0, ...levels };

  const read = () => sim.getVoltageAtHole(chip.getPinByName('OUT').holeId);

  // Drive CLK to the given level, holding every other pin at its configured rail.
  function setClk(clk) {
    const wm = new WireManager();
    const wirePin = (name, bit) => {
      const p = chip.getPinByName(name);
      if (!p) throw new Error(`CD4059 has no pin named ${name}`);
      wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
    };
    wirePin('VDD', 1);
    wirePin('VSS', 0);
    wirePin('CLK', clk);
    for (const [name, bit] of Object.entries(base)) wirePin(name, bit);
    sim.evaluate(world, [chip], wm);
  }

  // One clock pulse = rising (counts) then falling (no count). Returns OUT after.
  function pulse() { setClk(1); setClk(0); return isHigh(read()); }

  setClk(0);          // establish CLK-low baseline (seeds prevClk = 0)
  return { pulse, read: () => isHigh(read()), setClk, setLE: (b) => { base.LE = b; } };
}

// ── Test A: Mode 10, ÷3 (D1 = 3 via J1,J2) ───────────────────────────────────
// N = 10*(1000*0+100*0+10*0+0) + 3 = 3. OUT high on pulses 3,6,9; low elsewhere.
{
  const c = makeChip({ Ka: 1, Kb: 1, Kc: 0, J1: 1, J2: 1 });   // D1 = 1+2 = 3
  const pattern = [];
  for (let i = 1; i <= 9; i++) pattern.push(c.pulse());
  const expected = [false, false, true, false, false, true, false, false, true];
  assert(JSON.stringify(pattern) === JSON.stringify(expected),
    `mode10 ÷3: expected OUT high on pulses 3/6/9, got [${pattern.map((b,i)=>b?i+1:'').filter(Boolean).join(',')}]`);
}

// ── Test B: Mode 5, ÷7 (D1 = 2 via J2, D2 = 1 via J5) ────────────────────────
// N = 5*(1000*0+100*0+10*0+1) + 2 = 7. OUT high on pulses 7 and 14.
{
  const c = makeChip({ Ka: 1, Kb: 0, Kc: 1, J2: 1, J5: 1 });   // D1=2, D2=1
  let highs = [];
  for (let i = 1; i <= 14; i++) if (c.pulse()) highs.push(i);
  assert(JSON.stringify(highs) === JSON.stringify([7, 14]),
    `mode5 ÷7: expected OUT high on pulses 7,14, got [${highs.join(',')}]`);
}

// ── Test C: Mode 2, ÷5 (D1 = 1 via J1, D2 = 2 via J6) ────────────────────────
// Mode 2: M=2, D1 = J1 only, D5 = J2,J3,J4. N = 2*(0+0+0+2) + 1 = 5.
{
  const c = makeChip({ Ka: 1, Kb: 1, Kc: 1, J1: 1, J6: 1 });   // D1=1, D2=2
  let highs = [];
  for (let i = 1; i <= 10; i++) if (c.pulse()) highs.push(i);
  assert(JSON.stringify(highs) === JSON.stringify([5, 10]),
    `mode2 ÷5: expected OUT high on pulses 5,10, got [${highs.join(',')}]`);
}

// ── Test D: Master Preset (Kb=0, Kc=0) → no counting, OUT stays LOW ───────────
{
  const c = makeChip({ Ka: 1, Kb: 0, Kc: 0, J1: 1, J2: 1 });   // would be ÷3 if counting
  let everHigh = false;
  for (let i = 1; i <= 12; i++) if (c.pulse()) everHigh = true;
  assert(!everHigh, 'master-preset: OUT should stay LOW (counter held, not counting)');
}

// ── Test E: Latch Enable holds OUT high after a pulse ─────────────────────────
// Mode 10 ÷3 with LE=1: once OUT pulses (pulse 3) it must stay high through the
// next pulses; dropping LE then one more clock releases it.
{
  const c = makeChip({ Ka: 1, Kb: 1, Kc: 0, J1: 1, J2: 1, LE: 1 });
  c.pulse(); c.pulse();
  assert(!c.read(), 'latch: OUT should still be LOW before the first terminal count');
  const atThree = c.pulse();                 // pulse 3 → terminal count, OUT high
  assert(atThree, 'latch: OUT should go HIGH at pulse 3');
  const held = c.pulse();                     // LE high, cnt now 1 → OUT stays high
  assert(held, 'latch: OUT should remain HIGH while LE is high (latched)');
  c.setLE(0);                                 // release the latch (cnt=1, next edge is not terminal)
  c.setClk(1);                                // rising edge clears the latched pulse, cnt→2 (no re-pulse)
  c.setClk(0);
  assert(!c.read(), 'latch: OUT should drop after LE returns low and a clock edge');
}

console.log(`cd4059-divide-by-n: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
