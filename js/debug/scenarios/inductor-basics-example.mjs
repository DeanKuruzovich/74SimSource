// ── Inductor Basics example project — behavior guard ─────────────────────────
// Validates that js/examples/Inductor-Basics.json actually does what its
// on-board text boxes promise, so engine tuning changes (MAX_IND_DI,
// IND_L_SCALE, IND_R_LOSS, LED model, family R_OUT) can't silently break the
// shipped demo. Three demos on one board:
//
//   1. RL ramp   — red LED (plain resistor) snaps on; green LED behind a 47mH
//                  coil fades in, then coil acts as a wire at DC.
//   2. Flyback   — hold the button to store current in a coil; releasing kicks
//                  the coil node negative and flashes a freewheel LED (yellow).
//   3. RL choke  — 2Hz clock blinks a direct LED hard; the coil branch's LED
//                  is smothered to a dim throb.
//
// Run:  node js/debug/scenarios/inductor-basics-example.mjs   (exits non-zero on failure)

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CircuitHarness } from '../harness.mjs';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)),
  '..', '..', 'examples', 'Inductor-Basics.json');

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}

// ── Demo 1: switch → red LED instant, green LED fades in behind the coil ────
{
  console.log('\nDemo 1: RL ramp vs instant branch');
  const h = CircuitHarness.fromFile(FILE);
  h.evaluate();
  const red = h.byId(3), green = h.byId(6), L = h.byId(4);

  check('both LEDs off before switch', !red.lit && !green.lit);

  h.setSwitch(1, true);
  h.run(0.1);
  check('red LED on almost immediately', red.brightness > 0.5, `b=${red.brightness.toFixed(2)}`);
  check('green LED still dim (coil ramping)', green.brightness < 0.4, `b=${green.brightness.toFixed(2)}`);
  const iMid = L.iPrev;

  h.run(10);
  check('coil current ramped up', L.iPrev > iMid + 0.005, `i=${(L.iPrev * 1e3).toFixed(1)}mA`);
  check('green LED reaches full-ish brightness', green.brightness > 0.6, `b=${green.brightness.toFixed(2)}`);
  check('coil ~0V across at DC (acts as wire)', Math.abs(h.voltageAcross(4)) < 0.15,
    `vL=${h.voltageAcross(4).toFixed(3)}V`);
  check('no LED overdrive', !red.overdrive && !green.overdrive);
}

// ── Demo 2: flyback — freewheel LED flashes on button release ───────────────
{
  console.log('\nDemo 2: flyback kick + freewheel LED');
  const h = CircuitHarness.fromFile(FILE);
  h.evaluate();
  const flyLed = h.byId(10), L = h.byId(8);

  check('freewheel LED off at rest', !flyLed.lit);

  h.press(7);
  h.run(8);
  const iStored = L.iPrev;
  check('coil stores current while held (~22mA)', iStored > 0.018 && iStored < 0.028,
    `i=${(iStored * 1e3).toFixed(1)}mA`);
  check('freewheel LED stays off while held (reverse biased)', !flyLed.lit,
    `b=${flyLed.brightness.toFixed(2)}`);

  h.release(7);
  const vX = h.pinVoltage(8, 'A');
  check('coil node kicks negative on release', vX < -1.5, `vX=${vX.toFixed(2)}V`);
  h.run(0.2);
  check('freewheel LED flashes', flyLed.brightness > 0.5, `b=${flyLed.brightness.toFixed(2)}`);
  check('flash does not overdrive the LED', !flyLed.overdrive);

  h.run(8);
  check('flash decays as stored energy drains', flyLed.brightness < 0.05,
    `b=${flyLed.brightness.toFixed(2)}`);
  check('stored current fully drained', Math.abs(L.iPrev) < 1e-3,
    `i=${(L.iPrev * 1e3).toFixed(2)}mA`);
}

// ── Demo 3: choke — direct LED blinks bright, choked LED stays dim ──────────
// Clocks read wall time inside evaluate(), so sample real time here and keep
// the assertions loose (peaks only, no phase expectations).
{
  console.log('\nDemo 3: RL choke on the 2Hz clock');
  const h = CircuitHarness.fromFile(FILE);
  h.evaluate();
  const direct = h.byId(14), choked = h.byId(17), L = h.byId(15);

  let peakDirect = 0, peakChoked = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 2500) {
    h.step();
    peakDirect = Math.max(peakDirect, direct.brightness);
    peakChoked = Math.max(peakChoked, choked.brightness);
  }
  check('direct LED blinks bright', peakDirect > 0.5, `peak=${peakDirect.toFixed(2)}`);
  check('choked LED stays much dimmer', peakChoked < peakDirect * 0.7,
    `peak=${peakChoked.toFixed(2)} vs ${peakDirect.toFixed(2)}`);
  check('choke current bounded (no runaway)', Math.abs(L.iPrev) < 0.03,
    `i=${(L.iPrev * 1e3).toFixed(1)}mA`);
}

// ── Global sanity ────────────────────────────────────────────────────────────
{
  console.log('\nGlobal sanity');
  const h = CircuitHarness.fromFile(FILE);
  h.evaluate();
  check('no short circuits reported', h.sim.shortCircuits.length === 0,
    `shorts=${h.sim.shortCircuits.length}`);
  check('all 17 components deserialized', h.components.length === 17,
    `n=${h.components.length}`);
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
