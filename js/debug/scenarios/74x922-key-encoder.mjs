// ── 74x922 16-key matrix encoder (MM74C922) — regression ────────────────────
// The 74x922 (js/chips/chips44.js) is the upgraded former stub: an 18-pin 4×4
// keyboard encoder, the MM74C922. It uses the KEY_ENCODER_SCAN primitive.
// This guards its DB entry after the stub fix that corrected an invented pinout
// to the verified Fairchild DS006037 map (ROW Y1-Y4=1-4, OSC=5, KBM=6,
// COLUMN X4=7, X3=8, GND=9, X2=10, X1=11, DA=12, OEn=13, DATA D/C/B/A=14-17,
// VCC=18) and wired the real scan behavior.
//
// How the part works: OSC clocks an internal 2-bit counter that pulls one
// COLUMN output (C1..C4) LOW at a time (open-drain) while the others float.
// ROW inputs (R1..R4) have internal pull-ups, so an unpressed row reads HIGH.
// A "key" is a switch joining a column to a row; in this headless test we model
// a pressed key as a direct wire from a Cn pin to an Rm pin. When the scan
// reaches the key's column, that row is pulled LOW, the scan stops, the 4-bit
// code (A,B = column 0..3, C,D = row 0..3) is latched on A-D and DA goes HIGH.
// The code is retained after release; only DA drops. OEn (active LOW) gates the
// 3-state A-D outputs.
//
// Method: ONE 74x922, same chip + sim across the run so the scan state persists.
// Each OSC "pulse" re-wires OSC LOW then HIGH (a rising edge advances the scan
// by one column unless a key already stopped it).
//
// Run:  node js/debug/scenarios/74x922-key-encoder.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x922');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with OSC at the given level, OEn either enabled (LOW) or disabled
// (HIGH), and a set of "pressed keys" — each [colPin, rowPin] becomes a wire
// joining that column output to that row input. Fresh WireManager each call;
// the scan/latch state lives on the chip component so it persists.
function apply({ osc, oeHigh = false, keys = [] }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x922 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OSC', osc ? 1 : 0);
  wirePin('OEn', oeHigh ? 1 : 0); // active LOW: 0 = outputs enabled
  for (const [colName, rowName] of keys) {
    wm.addWire(chip.getPinByName(colName).holeId, chip.getPinByName(rowName).holeId);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const code = () =>
  (isHigh(read('A')) ? 1 : 0) +
  (isHigh(read('B')) ? 2 : 0) +
  (isHigh(read('C')) ? 4 : 0) +
  (isHigh(read('D')) ? 8 : 0);
const daHigh = () => isHigh(read('DA'));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Pulse OSC (LOW then HIGH) up to `maxPulses` times, holding `opts`, stopping
// early once DATA AVAILABLE goes HIGH. Returns the number of pulses applied.
function scanUntilDA(opts, maxPulses = 12) {
  let n = 0;
  for (; n < maxPulses; n++) {
    apply({ osc: false, ...opts });
    apply({ osc: true,  ...opts });
    if (daHigh()) break;
  }
  return n;
}

// ── 0. No key pressed: scan free-runs, DATA AVAILABLE stays LOW ───────────────
for (let i = 0; i < 8; i++) {
  apply({ osc: false });
  apply({ osc: true });
  assert(!daHigh(), `idle scan: DA went HIGH with no key (pulse ${i})`);
}

// ── 1. Press key at COLUMN X1 / ROW Y1 → code 0, DA HIGH ──────────────────────
scanUntilDA({ keys: [['C1', 'R1']] });
assert(daHigh(), 'key (C1,R1): DA never asserted');
assert(code() === 0, `key (C1,R1): expected code 0, got ${code()}`);

// Release → DA drops, but the last code stays latched on A-D (= 0 here).
apply({ osc: true, keys: [] });
assert(!daHigh(), 'release after (C1,R1): DA stuck HIGH');

// ── 2. Press key at COLUMN X3 / ROW Y2 → code 6 (B,C high), DA HIGH ───────────
// position Y2,X3: col index 2, row index 1 → 2 | (1<<2) = 6.
scanUntilDA({ keys: [['C3', 'R2']] });
assert(daHigh(), 'key (C3,R2): DA never asserted');
assert(code() === 6, `key (C3,R2): expected code 6, got ${code()}`);

// ── 3. Code is retained after release (last-key register) ─────────────────────
apply({ osc: false, keys: [] });
apply({ osc: true,  keys: [] });
assert(!daHigh(), 'release after (C3,R2): DA stuck HIGH');
assert(code() === 6, `release after (C3,R2): code should stay 6, got ${code()}`);

// ── 4. Corner key COLUMN X4 / ROW Y4 → code 15 (all data HIGH) ────────────────
scanUntilDA({ keys: [['C4', 'R4']] });
assert(daHigh(), 'key (C4,R4): DA never asserted');
assert(code() === 15, `key (C4,R4): expected code 15, got ${code()}`);
apply({ osc: true, keys: [] }); // release

// ── 5. Two keys on the same column: lowest row index wins (row lock-out) ──────
// (C2,R1) and (C2,R3) both closed → R1 (index 0) wins → code 1.
scanUntilDA({ keys: [['C2', 'R3'], ['C2', 'R1']] });
assert(daHigh(), 'two keys col X2: DA never asserted');
assert(code() === 1, `two keys col X2: expected code 1 (R1 priority), got ${code()}`);
apply({ osc: true, keys: [] }); // release

// ── 6. DATA AVAILABLE is independent of OUTPUT ENABLE ─────────────────────────
// Re-press (C3,R2); with OEn HIGH (outputs 3-stated) DA must still assert.
scanUntilDA({ keys: [['C3', 'R2']], oeHigh: true });
assert(daHigh(), 'OEn HIGH: DA should still assert on a keypress');

console.log(`74x922-key-encoder: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
