// ── CD4045 21-stage ripple counter / frequency divider regression ────────────
// The CD4045 (Batch 5, js/chips/chips162.js) reuses the generic
// COUNTER_BIN_RIPPLE primitive with an explicit bits:[20,20], maxBit:20 so both
// shaped outputs y (pin 7) and y+d (pin 8) follow counter bit 20 — the 21st
// stage — giving a divide-by-2^21 (= 2,097,152). This guard pins down:
//   • the FALLING-edge clock at φ1 (pin 16); a rising edge alone never advances
//   • both outputs LOW for small counts (the divider is genuinely deep)
//   • bit 20 sets exactly at the 2^20 → 2^20 boundary count  (the 21st stage)
//   • wrap back to zero at 2^21                              (divide-by-2^21)
//   • y and y+d carry the same divide-by-2^21 signal         (sim in-phase model)
//   • the part has NO reset pin (counter never auto-clears)
//
// Method: place ONE CD4045 and keep the same chip + sim instance so the
// counter's sequential state (comp.ffState, keyed by the first output 'y+d')
// persists. Because the divider is 2^21 deep, the count is *seeded* directly on
// comp.ffState right before the boundary so a single falling edge can be
// observed crossing it — exercising 2,097,152 real pulses would be absurd.
//
// Run:  node js/debug/scenarios/cd4045-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4045');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with φ1 (the clock-amp input) held at the given rail level.
// VDD = pin 3, VSS = pin 14 on this part — wire by NAME so a pinout slip is caught.
function apply({ clk }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4045 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('φ1', clk ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// One full clock pulse = rising then falling edge; the count advances on the
// falling edge (matching the COUNTER_BIN_RIPPLE primitive).
function pulse(n = 1) {
  for (let i = 0; i < n; i++) {
    apply({ clk: true });   // rising edge (no advance)
    apply({ clk: false });  // falling edge (advance)
  }
}

// Seed the internal count directly, then leave the clock HIGH (prevClk = 1) so
// the very next LOW solve is a clean falling edge that crosses the boundary.
function seed(count) {
  apply({ clk: true });                       // ensure ffState exists, prevClk=1
  const st = chip.ffState.get('y+d');
  if (!st) throw new Error('CD4045 seq state not found under key "y+d"');
  st.count = count;
  st.prevClk = 1;
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Small counts: both outputs stay LOW (deep divider) ────────────────────
// From a known zero, a handful of pulses must NOT move bit 20.
seed(0);
pulse(5);
assert(isLow(read('y')) && isLow(read('y+d')),
  `small count: expected y / y+d LOW after 5 pulses, got y=${read('y').toFixed(2)} y+d=${read('y+d').toFixed(2)}`);

// ── 2. A rising edge alone does not advance ──────────────────────────────────
// Seed one below the 2^20 boundary, apply only a rising edge → still LOW.
seed((1 << 20) - 1);          // count = 1,048,575  (bit 20 = 0)
apply({ clk: true });         // rising edge only — no falling transition
assert(isLow(read('y+d')),
  `falling-edge-only: a rising edge advanced the counter (y+d went HIGH at count 2^20-1)`);

// ── 3. Bit 20 (the 21st stage) sets exactly at the 2^20 boundary ─────────────
// Re-seed and apply one FALLING edge → count = 2^20 → bit 20 HIGH.
seed((1 << 20) - 1);          // count = 1,048,575
apply({ clk: false });        // falling edge → count = 1,048,576 (bit 20 = 1)
assert(isHigh(read('y+d')) && isHigh(read('y')),
  `21st stage: expected y / y+d HIGH at count 2^20, got y=${read('y').toFixed(2)} y+d=${read('y+d').toFixed(2)}`);

// ── 4. y and y+d carry the same divide-by-2^21 signal (in-phase sim model) ───
assert(isHigh(read('y')) === isHigh(read('y+d')),
  `y / y+d should read the same level in the sim model`);

// ── 5. Wrap back to zero at 2^21 (divide-by-2^21) ────────────────────────────
seed((1 << 21) - 1);          // count = 2,097,151  (all 21 stages high)
apply({ clk: false });        // falling edge → wraps to 0 → bit 20 LOW
assert(isLow(read('y+d')) && isLow(read('y')),
  `wrap: expected y / y+d LOW after wrap at 2^21, got y=${read('y').toFixed(2)} y+d=${read('y+d').toFixed(2)}`);

// ── 6. No reset pin: the counter never auto-clears mid-run ───────────────────
// Seed a non-zero count and pulse — the value must persist (only the explicit
// boundary crossing changes the output), confirming there is no reset input
// silently zeroing the chain.
seed((1 << 20));              // bit 20 = 1 → outputs HIGH
pulse(3);                     // 3 more counts, still well above the boundary's low half
assert(isHigh(read('y+d')),
  `no-reset: outputs unexpectedly cleared (no reset pin exists on the CD4045)`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`CD4045 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  • ' + f);
  process.exit(1);
}
console.log('CD4045 OK — divide-by-2^21 at φ1, falling-edge, 21st-stage boundary + 2^21 wrap, y/y+d, no reset');
