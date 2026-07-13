// ── 555 timing readout (js/timer555.js) — regression ─────────────────────────
// The chip side panel shows a live frequency / pulse-width readout for the 555
// computed from the actual R and C parts wired to its pins (analyze555Timing).
// This scenario builds each recognized wiring on a real board, lets the real
// netlist resolve the connections, and asserts the analyzer's numbers against
// the datasheet formulas:
//
//   Astable      f = 1/(0.693·(R1+2·R2)·C), duty = (R1+R2)/(R1+2·R2)
//   Astable R2=0 f ≈ 1/(0.693·R1·C) (DISCH tied to THRESH, tLOW ≈ 0)
//   Monostable   pulse = 1.1·R·C
//
// Also checks: parallel resistors combine, partial wiring reports a hint that
// names the missing part, and a bare chip reports no mode at all.
//
// Run:  node js/debug/scenarios/555-timing-readout.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent, ResistorComponent, CapacitorComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { analyze555Timing } from '../../timer555.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const close = (a, b, tol = 0.01) => Math.abs(a - b) <= tol * Math.abs(b);

const VCC = (col) => holeId(0, 0, 'power', col, 1);
const GND = (col) => holeId(0, 0, 'power', col, 0);

// Build a fresh board with one 555 plus the given passives/wires, run the
// netlist, and return the single analyzer result for the timer.
function analyze(build) {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('555');
  chip.place(0, 0, 2, 4);
  const pin = (name) => chip.getPinByName(name).holeId;

  const wm = new WireManager();
  const components = [chip];
  wm.addWire(VCC(0), pin('VCC'));
  wm.addWire(GND(1), pin('GND'));
  wm.addWire(VCC(2), pin('RESETn'));
  build({ pin, wm, components });

  const sim = new CircuitSimulator();
  sim.evaluate(world, components, wm);
  const results = analyze555Timing(chip, chip.chipDef, sim.netlist, components);
  assert(results.length === 1, `expected 1 timer analysis, got ${results.length}`);
  return results[0] || {};
}

const R = (ohms, a, b) => { const r = new ResistorComponent(ohms); r.placeWireLike(a, b); return r; };
const C = (farads, a, b) => { const c = new CapacitorComponent(farads); c.placeWireLike(a, b); return c; };

// ── 1. Classic astable: R1=10k VCC→DISCH, R2=10k DISCH→THRESH, C=100n ────────
{
  const a = analyze(({ pin, wm, components }) => {
    wm.addWire(pin('TRIG'), pin('THRESH'));
    components.push(
      R(10000, VCC(3), pin('DISCH')),
      R(10000, pin('DISCH'), pin('THRESH')),
      C(100e-9, pin('THRESH'), GND(4)),
    );
  });
  assert(a.mode === 'astable', `astable: mode is ${a.mode}`);
  assert(a.r1 === 10000 && a.r2 === 10000 && a.c === 100e-9,
    `astable: parts R1=${a.r1} R2=${a.r2} C=${a.c}`);
  const fExp = 1 / (0.693 * (10000 + 2 * 10000) * 100e-9); // ≈ 481 Hz
  assert(close(a.freq, fExp), `astable: f=${a.freq}, expected ~${fExp.toFixed(1)}`);
  assert(close(a.duty, 2 / 3), `astable: duty=${a.duty}, expected 0.667`);
  assert(close(a.tHigh, 0.693 * 20000 * 100e-9), `astable: tHigh=${a.tHigh}`);
  assert(close(a.tLow, 0.693 * 10000 * 100e-9), `astable: tLow=${a.tLow}`);
}

// ── 2. Parallel resistors combine: two 10k as R1 → 5k ────────────────────────
{
  const a = analyze(({ pin, wm, components }) => {
    wm.addWire(pin('TRIG'), pin('THRESH'));
    components.push(
      R(10000, VCC(3), pin('DISCH')),
      R(10000, VCC(5), pin('DISCH')),
      R(10000, pin('DISCH'), pin('THRESH')),
      C(100e-9, pin('THRESH'), GND(4)),
    );
  });
  assert(a.mode === 'astable' && close(a.r1, 5000),
    `parallel R1: mode=${a.mode} r1=${a.r1}, expected 5000`);
}

// ── 3. Minimal blinker (R2=0): DISCH tied to the TRIG/THRESH node ────────────
{
  const a = analyze(({ pin, wm, components }) => {
    wm.addWire(pin('TRIG'), pin('THRESH'));
    wm.addWire(pin('DISCH'), pin('THRESH'));
    components.push(
      R(100000, VCC(3), pin('THRESH')),
      C(1e-6, pin('THRESH'), GND(4)),
    );
  });
  assert(a.mode === 'astable' && a.r2 === 0, `R2=0 astable: mode=${a.mode} r2=${a.r2}`);
  const fExp = 1 / (0.693 * 100000 * 1e-6); // ≈ 14.4 Hz
  assert(close(a.freq, fExp), `R2=0 astable: f=${a.freq}, expected ~${fExp.toFixed(1)}`);
}

// ── 4. Monostable: THRESH tied to DISCH, R=47k to VCC, C=10µF to GND ─────────
{
  const a = analyze(({ pin, wm, components }) => {
    wm.addWire(pin('THRESH'), pin('DISCH'));
    components.push(
      R(47000, VCC(3), pin('THRESH')),
      C(10e-6, pin('THRESH'), GND(4)),
    );
  });
  assert(a.mode === 'monostable', `monostable: mode is ${a.mode}`);
  assert(close(a.pulse, 1.1 * 47000 * 10e-6), `monostable: pulse=${a.pulse}, expected 0.517`);
}

// ── 5. Partial astable (no cap) → hint names the missing part ────────────────
{
  const a = analyze(({ pin, wm, components }) => {
    wm.addWire(pin('TRIG'), pin('THRESH'));
    components.push(
      R(10000, VCC(3), pin('DISCH')),
      R(10000, pin('DISCH'), pin('THRESH')),
    );
  });
  assert(a.mode === null, `partial: mode should be null, got ${a.mode}`);
  assert(a.hint && a.hint.includes('C (THRESH→GND)'), `partial: hint=${a.hint}`);
}

// ── 6. Bare chip → no mode, no hint ──────────────────────────────────────────
{
  const a = analyze(() => {});
  assert(a.mode === null && !a.hint, `bare: mode=${a.mode} hint=${a.hint}`);
}

console.log(`555-timing-readout: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
