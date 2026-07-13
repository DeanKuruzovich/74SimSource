// ── 74x733 (Signetics 8264) 3-input 4-bit digital multiplexer — regression ──
// The 733 (js/chips/chips38.js) is primitive-backed by MUX_3IN_4BIT_DC_OE.
// It routes one of three 4-bit buses A/B/C (or a forced 0) to a 4-bit output,
// with a Data Complement (DC) input and a 3-input output-enable code.
//
// Verified function table (Signetics 8263/8264, datasheet page 563):
//   S0 S1 | selected    DC=0 → out=selected,  DC=1 → out=/selected
//    1  1 |  A
//    0  1 |  B
//    1  0 |  C
//    0  0 |  0 (forced)
//   Outputs drive only while OE1=OE2=OE3=1; otherwise every output = 1
//   (bare-collector off, pulled HIGH).
//
// Pinout guarded (24-pin 8264):
//   A1=1 B1=2 C1=3 A0=4 B0=5 C0=6 OE1=7 OE2=8 OE3=9 Y0=10 Y1=11 GND=12
//   Y2=13 Y3=14 DC=15 S1=16 S0=17 C3=18 B3=19 A3=20 C2=21 B2=22 A2=23 VCC=24
//
// Run:  node js/debug/scenarios/74x733-3bus-mux.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x733');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const A = ['A0', 'A1', 'A2', 'A3'];
const B = ['B0', 'B1', 'B2', 'B3'];
const C = ['C0', 'C1', 'C2', 'C3'];
const Y = ['Y0', 'Y1', 'Y2', 'Y3'];

// Drive three 4-bit words, S0/S1, DC, and the three enables; solve.
function apply(aW, bW, cW, s0, s1, dc, oe1, oe2, oe3) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x733 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 4; i++) {
    wirePin(A[i], (aW >> i) & 1);
    wirePin(B[i], (bW >> i) & 1);
    wirePin(C[i], (cW >> i) & 1);
  }
  wirePin('S0', s0); wirePin('S1', s1); wirePin('DC', dc);
  wirePin('OE1', oe1); wirePin('OE2', oe2); wirePin('OE3', oe3);
  sim.evaluate(world, [chip], wm);
}

const read   = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const outBit = (name) => isHigh(read(name)) ? 1 : 0;
const outWord = () => Y.reduce((acc, n, i) => acc | (outBit(n) << i), 0);
const b4 = (n) => n.toString(2).padStart(4, '0');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const aW = 0b1010, bW = 0b0110, cW = 0b1001;

// ── 1. Channel select picks the right bus (enabled, DC=0, non-inverting) ─────
const selCases = [
  // s0, s1, expected word
  [1, 1, aW],     // A
  [0, 1, bW],     // B
  [1, 0, cW],     // C
  [0, 0, 0b0000], // forced 0
];
for (const [s0, s1, exp] of selCases) {
  apply(aW, bW, cW, s0, s1, /*dc*/0, 1, 1, 1);
  assert(outWord() === exp,
    `select S0=${s0} S1=${s1}: expected ${b4(exp)}, got ${b4(outWord())}`);
}

// ── 2. Data Complement inverts the selected bus ─────────────────────────────
for (const [s0, s1, sel] of [[1, 1, aW], [0, 1, bW], [1, 0, cW], [0, 0, 0b0000]]) {
  apply(aW, bW, cW, s0, s1, /*dc*/1, 1, 1, 1);
  const exp = (~sel) & 0b1111;
  assert(outWord() === exp,
    `DC=1 S0=${s0} S1=${s1}: expected ${b4(exp)}, got ${b4(outWord())}`);
}

// ── 3. Output-enable code: any enable LOW → all outputs HIGH (1111) ─────────
for (const [o1, o2, o3] of [[0, 1, 1], [1, 0, 1], [1, 1, 0], [0, 0, 0]]) {
  apply(aW, bW, cW, /*A*/1, 1, /*dc*/0, o1, o2, o3);
  assert(outWord() === 0b1111,
    `disabled OE=${o1}${o2}${o3}: expected 1111 (pulled HIGH), got ${b4(outWord())}`);
}

// ── 4. Re-enable drives the selected bus again (no latched state) ───────────
apply(aW, bW, cW, 1, 0, 0, 1, 1, 1); // select C
assert(outWord() === cW, `re-enable select C: expected ${b4(cW)}, got ${b4(outWord())}`);

if (failures.length) {
  console.error(`74x733 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x733 3-bus mux: all checks passed');
