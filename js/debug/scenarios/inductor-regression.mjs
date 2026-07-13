// ── Inductor regression suite ────────────────────────────────────────────────
// Guards the inductor backward-Euler companion model (the dual of the
// capacitor model): G_eq = dt/L_eff stamped in parallel with a current source
// carrying the stored current iPrev, plus a built-in parallel loss path that
// bounds the flyback spike. Cases:
//
//   1. RL ramp        — current through a coil ramps gradually, not instantly.
//   2. DC steady state— coil settles to a wire: full current, ~0V across it.
//   3. Flyback spike  — breaking the current path produces a large negative
//                       spike (bounded by the internal loss path), which decays.
//   4. Flyback diode  — a freewheel diode clamps the spike to ~a diode drop.
//   5. Dangling coil  — no closed loop → no stored current, sane voltages.
//   6. Serialization  — inductance survives a save/load round trip.
//
// Run:  node js/debug/scenarios/inductor-regression.mjs   (exits non-zero on failure)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}

// VCC rail = power row 1 (top+); GND = power row 0 (top−).
// A main column's top half (rows 0-4) is one node.
// Circuit: VCC ─[switch]─ nodeX ─[L 10mH]─ nodeY ─[R 330Ω]─ GND
const RL_CIRCUIT = {
  components: [
    { id: 1, type: 'switch', on: false, startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:5:0' },
    { id: 2, type: 'inductor', inductance: 10e-3, startHoleId: '0:0:main:5:1', endHoleId: '0:0:main:7:0' },
    { id: 3, type: 'resistor', resistance: 330, startHoleId: '0:0:main:7:1', endHoleId: '0:0:power:7:0' },
  ],
  wires: [],
};

// ── 1 & 2. RL ramp + DC steady state ────────────────────────────────────────
{
  console.log('\n1. RL ramp (VCC ─sw─ L ─R─ GND): current ramps, then coil = wire');
  const h = CircuitHarness.fromJSON(RL_CIRCUIT);
  h.evaluate();
  const L = h.byId(2);
  check('starts at 0 current', Math.abs(L.iPrev) < 1e-6, `i0=${(L.iPrev * 1e3).toFixed(4)}mA`);

  h.setSwitch(1, true);
  h.run(0.15);
  const iMid = L.iPrev;
  check('ramps gradually (partway after 0.15s)', iMid > 0.0005 && iMid < 0.012,
    `iMid=${(iMid * 1e3).toFixed(2)}mA`);

  h.run(10);
  const iEnd = L.iPrev;
  const vL = h.voltageAcross(2);
  // Steady state: I = 5V / (330Ω + 2.5Ω VCC internal) ≈ 15.0 mA
  check('reaches full DC current (~15mA)', iEnd > 0.013 && iEnd < 0.017,
    `iEnd=${(iEnd * 1e3).toFixed(2)}mA`);
  check('acts as a wire at DC (~0V across)', Math.abs(vL) < 0.1, `vL=${vL.toFixed(3)}V`);
  check('engine current matches stored current', Math.abs(h.current(2) - iEnd) < 1e-3,
    `I=${(h.current(2) * 1e3).toFixed(2)}mA`);
}

// ── 3. Flyback spike without a freewheel diode ───────────────────────────────
{
  console.log('\n2. Flyback: opening the switch spikes nodeX negative, then decays');
  const h = CircuitHarness.fromJSON(RL_CIRCUIT);
  h.evaluate();
  h.setSwitch(1, true);
  h.run(10);
  const iBefore = h.byId(2).iPrev;

  h.setSwitch(1, false);           // break the current path
  const vSpike = h.pinVoltage(2, 'A'); // nodeX, coil's cut-off side
  check('had stored current before break', iBefore > 0.013, `i=${(iBefore * 1e3).toFixed(2)}mA`);
  check('nodeX spikes hard negative (kickback)', vSpike < -5, `vX=${vSpike.toFixed(1)}V`);
  check('spike is bounded by loss path (no gigavolts)', vSpike > -500, `vX=${vSpike.toFixed(1)}V`);

  h.run(5);
  const iAfter = h.byId(2).iPrev;
  const vAfter = h.pinVoltage(2, 'A');
  check('stored current fully decays', Math.abs(iAfter) < 5e-4, `i=${(iAfter * 1e3).toFixed(3)}mA`);
  check('spike is gone after decay', Math.abs(vAfter) < 1, `vX=${vAfter.toFixed(2)}V`);
}

// ── 4. Freewheel diode clamps the spike ──────────────────────────────────────
{
  console.log('\n3. Flyback diode (GND → nodeX) clamps the spike to ~a diode drop');
  const h = CircuitHarness.fromJSON({
    components: [
      ...RL_CIRCUIT.components,
      // Anode on GND, cathode on nodeX: conducts when nodeX swings below ~-0.7V
      { id: 4, type: 'diode', startHoleId: '0:0:power:6:0', endHoleId: '0:0:main:5:2' },
    ],
    wires: [],
  });
  h.evaluate();
  h.setSwitch(1, true);
  h.run(10);
  h.setSwitch(1, false);
  const vClamped = h.pinVoltage(2, 'A'); // nodeX
  check('diode clamps nodeX near -0.7V', vClamped > -2 && vClamped < -0.3,
    `vX=${vClamped.toFixed(2)}V`);
  h.run(8);
  const iAfter = h.byId(2).iPrev;
  check('current freewheels down to ~0', Math.abs(iAfter) < 5e-4, `i=${(iAfter * 1e3).toFixed(3)}mA`);
}

// ── 5. Dangling inductor (no closed loop) ────────────────────────────────────
{
  console.log('\n4. Dangling coil: one leg on VCC, other leg open');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 1, type: 'inductor', inductance: 10e-3, startHoleId: '0:0:power:10:1', endHoleId: '0:0:main:10:0' },
      // Unrelated load elsewhere so the circuit has a GND reference and the
      // MNA actually solves (a board with no GND at all never solves).
      { id: 2, type: 'resistor', resistance: 1000, startHoleId: '0:0:power:20:1', endHoleId: '0:0:power:20:0' },
    ],
    wires: [],
  });
  h.evaluate();
  h.run(2);
  const L = h.byId(1);
  const vOpen = h.pinVoltage(1, 'B');
  check('carries no current', Math.abs(L.iPrev) < 1e-5, `i=${(L.iPrev * 1e6).toFixed(2)}µA`);
  check('open leg floats to the driven side (~5V, like a wire stub)',
    Number.isFinite(vOpen) && Math.abs(vOpen - 5) < 0.3, `v=${vOpen?.toFixed(2)}V`);
}

// ── 6. Serialization round trip ──────────────────────────────────────────────
{
  console.log('\n5. Serialization round trip');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 1, type: 'inductor', inductance: 47e-3, startHoleId: '0:0:main:3:0', endHoleId: '0:0:main:6:0' },
    ],
    wires: [],
  });
  const L = h.byId(1);
  const data = L.serialize();
  check('inductance survives serialize', data.inductance === 47e-3, JSON.stringify(data));
  check('label formats in mH', L.getLabel() === '47.0mH', L.getLabel());
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
