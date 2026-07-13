// ── Capacitor regression suite ───────────────────────────────────────────────
// Guards the cap-isolation / time-domain behaviour after the pass-0
// forceStampCaps fix (see cap-discharge-through-led.mjs). The fix changes how
// pass 0 treats caps for ALL circuits, so these check the neighbouring cases:
//
//   1. RC charge      — cap charges toward the rail through a resistor.
//   2. RC discharge   — charged cap fully bleeds to 0 through a resistor to GND.
//   3. Decoupling cap — cap straight across VCC↔GND sits at 5V, ~0 steady current.
//   4. Dangling cap   — cap with one terminal on a floating node MUST stay
//                       isolated (frozen at 0). This is the exact case the
//                       isolation gate exists for; the fix must not break it.
//
// Run:  node js/debug/scenarios/cap-regression.mjs   (exits non-zero on failure)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}

// VCC rail = power row 1 (top+) / row 3 (bottom+); GND = row 0 (top−) / row 2.
// A main column's top half (rows 0-4) is one node.

// ── 1. RC charge ─────────────────────────────────────────────────────────────
// VCC ─[1kΩ]─ nodeA ─[100µF]─ GND.  nodeA should charge toward ~5V.
{
  console.log('\n1. RC charge (VCC ─R─ node ─C─ GND)');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 1, type: 'resistor', resistance: 1000, startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:5:0' },
      { id: 2, type: 'capacitor', capacitance: 100e-6, startHoleId: '0:0:main:5:1', endHoleId: '0:0:power:5:0' },
    ],
    wires: [],
  });
  h.evaluate();
  const v0 = h.capState(2).vPrev;
  h.settle({ maxSteps: 4000 });
  const vEnd = h.capState(2).vPrev;
  check('starts near 0V', Math.abs(v0) < 0.3, `v0=${v0.toFixed(3)}`);
  check('charges toward 5V', vEnd > 4.5, `vEnd=${vEnd.toFixed(3)}`);
  check('not flagged isolated', !h.capState(2).isolated);
}

// ── 2. RC discharge to zero ──────────────────────────────────────────────────
// Button VCC→nodeA, R nodeA→GND, C nodeA→GND. Press to charge, release to bleed.
{
  console.log('\n2. RC discharge through resistor to GND');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 1, type: 'push_button', startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:5:0' },
      { id: 2, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:5:1', endHoleId: '0:0:power:5:0' },
      { id: 3, type: 'capacitor', capacitance: 100e-6, startHoleId: '0:0:main:5:2', endHoleId: '0:0:power:6:0' },
    ],
    wires: [],
  });
  h.evaluate();
  h.press(1); h.settle({ maxSteps: 4000 });
  const vCharged = h.capState(3).vPrev;
  h.release(1); h.settle({ maxSteps: 8000 });
  const vDischarged = h.capState(3).vPrev;
  check('charges while pressed (>3V)', vCharged > 3.0, `v=${vCharged.toFixed(3)}`);
  check('fully discharges to ~0V (R to GND, no LED floor)', vDischarged < 0.2, `v=${vDischarged.toFixed(3)}`);
}

// ── 3. Decoupling cap straight across the rails ──────────────────────────────
{
  console.log('\n3. Decoupling cap across VCC↔GND');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 1, type: 'capacitor', capacitance: 10e-6, startHoleId: '0:0:power:6:1', endHoleId: '0:0:power:6:0' },
    ],
    wires: [],
  });
  h.evaluate();
  h.settle({ maxSteps: 4000 });
  const cs = h.capState(1);
  check('charges to ~5V across rails', Math.abs(cs.vPrev - 5) < 0.3, `v=${cs.vPrev.toFixed(3)}`);
  check('steady-state current ≈ 0 (blocks DC)', cs.current < 1e-3, `I=${(cs.current * 1e6).toFixed(2)}µA`);
  check('no short reported', !h.hasShort);
}

// ── 4. Dangling cap must stay isolated ───────────────────────────────────────
// One plate on VCC, other plate on a main column that connects to nothing.
// A separate VCC→GND resistor provides the GND reference the MNA solver needs
// (without any GND-tagged net the solver bails before isolation even runs).
{
  console.log('\n4. Dangling cap (one terminal floating) stays isolated');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 9, type: 'resistor', resistance: 1000, startHoleId: '0:0:power:2:1', endHoleId: '0:0:power:2:0' },
      { id: 1, type: 'capacitor', capacitance: 10e-6, startHoleId: '0:0:power:7:1', endHoleId: '0:0:main:7:0' },
    ],
    wires: [],
  });
  h.evaluate();
  h.settle({ maxSteps: 2000 });
  const cs = h.capState(1);
  check('flagged isolated', cs.isolated);
  check('does NOT phantom-charge (vPrev stays ~0)', Math.abs(cs.vPrev) < 0.3, `v=${cs.vPrev.toFixed(3)}`);
}

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
