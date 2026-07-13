// ── Scenario / regression: capacitor discharging through an LED ──────────────
// Reproduces the "broken capacitor" bug from brokencap.json:
//   Circuit: VCC ─[push-button]─ nodeX ─[LED]─[40Ω R]─ GND, with a 100nF cap
//            from nodeX to GND.
//
//   Symptom (before fix):
//     • Press button → cap charges to ~4.9V, LED ~3.3V across, ~40mA.  (correct)
//     • Release button → cap stays frozen at 4.9V forever ("never discharges"),
//       LED reports 4.9V across at ~88mA (bogus overcurrent), while the resistor
//       in series reports 0mA — a KCL violation that reveals the result is
//       internally inconsistent.
//
//   Root cause: the cap-isolation analysis only treats an LED as a possible DC
//   return path if it is already in `conductingLEDs`, but that set is derived
//   from pass 0 where the cap itself was judged isolated and not stamped. So a
//   cap that can ONLY discharge by forward-biasing an LED via its own stored
//   charge is wrongly classified as permanently isolated.
//
// Run:  node js/debug/scenarios/cap-discharge-through-led.mjs
// Exits non-zero if the post-release behaviour is wrong (so it doubles as a test).

import { CircuitHarness } from '../harness.mjs';

const CIRCUIT = {
  components: [
    { id: 427, type: 'led', color: 'red', startHoleId: '0:0:main:13:0', endHoleId: '0:0:main:17:0' },
    { id: 429, type: 'resistor', resistance: 40, startHoleId: '0:0:main:17:1', endHoleId: '0:0:power:17:0' },
    { id: 431, type: 'push_button', startHoleId: '0:0:main:10:4', endHoleId: '0:0:main:10:6' },
    { id: 433, type: 'capacitor', capacitance: 1e-7, startHoleId: '0:0:main:10:0', endHoleId: '0:0:power:10:0' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:power:8:3', endHoleId: '0:0:main:10:9' },
    { id: 2, startHoleId: '0:0:main:10:1', endHoleId: '0:0:main:13:1' },
  ],
  chipFamily: 'LS',
};

const LED = 427, R = 429, BTN = 431, CAP = 433;

function main() {
  const h = CircuitHarness.fromJSON(CIRCUIT);
  h.evaluate();

  // 1) Press and settle — should charge the cap and light the LED normally.
  h.press(BTN);
  h.settle();
  const charged = {
    capV: h.capState(CAP).vPrev,
    ledV: h.voltageAcross(LED),
    ledI: h.current(LED),
  };
  console.log(`charged:  cap=${charged.capV.toFixed(3)}V  LED=${charged.ledV.toFixed(3)}V across  ${(charged.ledI * 1000).toFixed(2)}mA`);

  // 2) Release and let it evolve.
  h.release(BTN);
  const trace = h.run(0.8, {
    record: [
      { name: 'capV', fn: hh => hh.capState(CAP).vPrev },
      { name: 'capIso', fn: hh => (hh.capState(CAP).isolated ? 1 : 0) },
      { name: 'ledV', fn: hh => hh.voltageAcross(LED) },
      { name: 'ledI_mA', fn: hh => hh.current(LED) * 1000 },
      { name: 'R_I_mA', fn: hh => hh.current(R) * 1000 },
    ],
  });
  console.log('\nafter release (every 8th sample):');
  CircuitHarness.printTrace(trace.filter((_, i) => i % 8 === 0));

  const end = trace[trace.length - 1];
  const startCapV = trace[0].capV;

  // ── Assertions ─────────────────────────────────────────────────────────────
  const checks = [];
  // The LED can't have more across it than the supply once the button is open.
  checks.push(['LED voltage stays physical (< 4.5V across after release)',
    Math.max(...trace.map(r => r.ledV)) < 4.5]);
  // No bogus overcurrent: with a 100nF cap the discharge current is tiny.
  checks.push(['no bogus LED overcurrent (< 30mA after release)',
    Math.max(...trace.map(r => r.ledI_mA)) < 30]);
  // KCL: LED and the series resistor must carry (nearly) the same current.
  checks.push(['LED and series resistor currents agree (KCL holds)',
    trace.every(r => Math.abs(r.ledI_mA - r.R_I_mA) < 1)]);
  // The cap must actually lose charge instead of freezing at 4.9V.
  checks.push(['cap actually discharges (drops at least 1V from start)',
    startCapV - end.capV > 1.0]);

  let ok = true;
  console.log('');
  for (const [name, pass] of checks) {
    console.log(`  ${pass ? '✓' : '✗'} ${name}`);
    if (!pass) ok = false;
  }
  console.log(`\n${ok ? 'PASS' : 'FAIL'}  (final cap=${end.capV.toFixed(3)}V, LED=${end.ledV.toFixed(3)}V across, ${end.ledI_mA.toFixed(3)}mA)`);
  process.exit(ok ? 0 : 1);
}

main();
