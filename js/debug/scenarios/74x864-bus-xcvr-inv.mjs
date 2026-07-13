// ── 74x864 9-bit INVERTING bus transceiver (3-state) — regression ────────────
// The 74x864 (js/chips/chips42.js) drives the BUS_XCVR_9BIT_DUAL_OE primitive
// with invert:true. It is the inverting sibling of the 74x863 and guards:
//   1. Inverting transfer both ways: A→B gives B=/A, B→A gives A=/B.
//   2. Two active-LOW enables PER direction, ANDed: BOTH pins of a pair must be
//      LOW for that direction to drive; a single HIGH disables it (isolation).
//   3. All four enables HIGH = isolation (both buses float).
//   4. All four enables LOW = "Latch A and B": the chip holds the last word that
//      crossed. For the inverting part the held B side is the complement of the
//      stored A word (A = W, B = /W).
//
// Method (mirrors 74x863-bus-xcvr.mjs): one 74x864, reuse the same chip + sim so
// the latch's sequential state persists. Each solve wires the control pins plus
// whichever data pins are INPUTS for that mode; pins the chip drives are left
// unwired and read back.
//
// Pin map (verified vs Philips 74ABT863 + TI SCBS199C, see chip header comment):
//   OEBA0=1, A0..A8=2..10, OEBA1=11, GND=12, OEAB1=13, OEAB0=14, B8..B0=15..23,
//   VCC=24.  A→B needs OEAB0=OEAB1=0; B→A needs OEBA0=OEBA1=0.
//
// Run:  node js/debug/scenarios/74x864-bus-xcvr-inv.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const bit = (v) => (v > HIGH ? 1 : 0);
const inv = (arr) => arr.map((b) => (b ? 0 : 1));

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x864');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A_PINS = ['A0','A1','A2','A3','A4','A5','A6','A7','A8'];
const B_PINS = ['B0','B1','B2','B3','B4','B5','B6','B7','B8'];

function solve(driven) {
  const wm = new WireManager();
  const wirePin = (name, b) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x864 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), b ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const [name, b] of Object.entries(driven)) wirePin(name, b);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBus = (pins) => pins.map((n) => bit(read(n)));
const busDrive = (pins, arr) => Object.fromEntries(pins.map((n, i) => [n, arr[i]]));
const eqBus = (got, want) => got.length === want.length && got.every((v, i) => v === want[i]);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const WORD1 = [1,0,1,1,0,0,1,0,1];
const WORD2 = [0,1,1,0,1,0,0,1,1];

// ── 1. Transmit A→B (OEAB0=OEAB1=0, OEBA pair HIGH) — inverted copy ───────────
for (const w of [WORD1, WORD2]) {
  solve({ OEAB0: 0, OEAB1: 0, OEBA0: 1, OEBA1: 1, ...busDrive(A_PINS, w) });
  const b = readBus(B_PINS);
  assert(eqBus(b, inv(w)), `A→B: B should be /A for A=${w}, want ${inv(w)}, got ${b}`);
}

// ── 2. Receive B→A (OEBA0=OEBA1=0, OEAB pair HIGH) — inverted copy ────────────
for (const w of [WORD1, WORD2]) {
  solve({ OEBA0: 0, OEBA1: 0, OEAB0: 1, OEAB1: 1, ...busDrive(B_PINS, w) });
  const a = readBus(A_PINS);
  assert(eqBus(a, inv(w)), `B→A: A should be /B for B=${w}, want ${inv(w)}, got ${a}`);
}

// ── 3. A single HIGH in the A→B pair disables it (isolation) ─────────────────
// Drive A=all-1 but leave OEAB1 HIGH: the A→B path must NOT drive B.
solve({ OEAB0: 0, OEAB1: 1, OEBA0: 1, OEBA1: 1, ...busDrive(A_PINS, [1,1,1,1,1,1,1,1,1]) });
{
  const b = readBus(B_PINS);
  assert(eqBus(b, [0,0,0,0,0,0,0,0,0]), `isolation: one enable HIGH must leave B undriven (0), got ${b}`);
}

// ── 4. Full isolation: all four enables HIGH, B does not follow A ─────────────
solve({ OEAB0: 1, OEAB1: 1, OEBA0: 1, OEBA1: 1, ...busDrive(A_PINS, [1,1,1,1,1,1,1,1,1]) });
{
  const b = readBus(B_PINS);
  assert(eqBus(b, [0,0,0,0,0,0,0,0,0]), `isolation: all enables HIGH, B must stay undriven (0), got ${b}`);
}

// ── 5. Latch A and B: send a word A→B, then set all four enables LOW ──────────
// The chip holds the last word: A = WORD1, B = /WORD1, with no external drive.
solve({ OEAB0: 0, OEAB1: 0, OEBA0: 1, OEBA1: 1, ...busDrive(A_PINS, WORD1) }); // load latch via A→B
solve({ OEAB0: 0, OEAB1: 0, OEBA0: 0, OEBA1: 0 });                            // all four LOW = latch
{
  const a = readBus(A_PINS);
  const b = readBus(B_PINS);
  assert(eqBus(a, WORD1), `latch: A should hold last A word ${WORD1}, got ${a}`);
  assert(eqBus(b, inv(WORD1)), `latch: B should hold /A = ${inv(WORD1)}, got ${b}`);
}

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`74x864: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x864: PASS — A↔B inverting transfer, dual-enable-per-direction gating, isolation, latch');
