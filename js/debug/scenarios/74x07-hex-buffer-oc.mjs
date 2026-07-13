// ── 74x07 hex non-inverting buffer, open collector — regression ──────────────
// The 74x07 (js/chips/chips1.js) is the NON-inverting open-collector hex
// buffer/driver: six independent buffers, Y = A, but the outputs only SINK.
// Per the TI SN7407 datasheet (SDLS032H) Function Table: input A=H -> output
// Hi-Z (the external pull-up brings the net to VCC, so it reads HIGH); A=L ->
// output L (the transistor actively sinks). It is the non-inverting twin of the
// inverting 74x06 — the property this guard locks in, because the entry's prose
// was once written describing the INVERTING behavior (transistor on when the
// input is HIGH), while the engine (BUFFER primitive + openCollector flag) has
// always been correct.
//
// Modeled with the built-in BUFFER primitive (one per buffer) plus the
// entry-level openCollector flag; simulator.js (_drivePinOC) converts each
// computed HIGH to a Hi-Z release and each LOW to a GND sink.
//
// Pinout (TI SDLS032H "Pin Functions", 14-pin D/N/NS/J/W package, read as PDF
// page images per issues.md C4): 1A=1, 1Y=2, 2A=3, 2Y=4, 3A=5, 3Y=6, GND=7,
// 4Y=8, 4A=9, 5Y=10, 5A=11, 6Y=12, 6A=13, VCC=14. Note the non-standard split:
// inputs on odd pins 1/3/5 then 9/11/13, outputs on even pins 2/4/6 then 8/10/12.
//
// Checks:
//   1. Pin split: each buffer's input pin and output pin sit on the expected
//      numbers (catches a gate-block shift or an input/output swap in pinout[]).
//   2. Non-inverting OC truth table on all six buffers: A=0 -> Y=0 (sunk LOW),
//      A=1 -> Y=1 (Hi-Z, pulled up). A wrong NOT-for-BUFFER swap fails both rows;
//      a lost openCollector flag would still pass logic but this documents intent.
//   3. Cross-wiring guard: drive the six buffers with a distinct A per buffer in
//      one solve so a mis-routed output (e.g. 3Y reading buffer 4's input) fails.
//
// Run:  node js/debug/scenarios/74x07-hex-buffer-oc.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V; OC HIGH is the pull-up)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x07');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const BUFFERS = [1, 2, 3, 4, 5, 6];
// Expected pin numbers per buffer: [inputPin, outputPin].
const PINMAP = { 1: [1, 2], 2: [3, 4], 3: [5, 6], 4: [9, 8], 5: [11, 10], 6: [13, 12] };

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Pin split ─────────────────────────────────────────────────────────────
for (const b of BUFFERS) {
  const aPin = chip.getPinByName(`${b}A`);
  const yPin = chip.getPinByName(`${b}Y`);
  assert(aPin && aPin.pin === PINMAP[b][0], `input ${b}A expected pin ${PINMAP[b][0]}, got ${aPin && aPin.pin}`);
  assert(yPin && yPin.pin === PINMAP[b][1], `output ${b}Y expected pin ${PINMAP[b][1]}, got ${yPin && yPin.pin}`);
}

// Drive each buffer's A input from a per-buffer bit table, then re-solve.
function applyPerBuffer(bits) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x07 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const b of BUFFERS) wirePin(`${b}A`, bits[b - 1]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// ── 2. Non-inverting OC truth table, same input on all six buffers ────────────
for (const a of [0, 1]) {
  applyPerBuffer(BUFFERS.map(() => a));
  for (const b of BUFFERS) {
    const got = isHigh(read(`${b}Y`)) ? 1 : 0;
    assert(got === a, `buffer ${b}: A=${a} expected Y=${a} (non-inverting), got ${got}`);
  }
}

// ── 3. Cross-wiring guard: distinct A per buffer in one solve ─────────────────
const DISTINCT = [0, 1, 0, 1, 1, 0]; // buffers 1..6
applyPerBuffer(DISTINCT);
for (const b of BUFFERS) {
  const exp = DISTINCT[b - 1];
  const got = isHigh(read(`${b}Y`)) ? 1 : 0;
  assert(got === exp, `distinct buffer ${b}: A=${exp} expected Y=${exp}, got ${got}`);
}

console.log(`74x07-hex-buffer-oc: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
