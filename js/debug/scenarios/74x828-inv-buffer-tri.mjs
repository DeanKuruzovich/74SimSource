// ── 74x828 10-bit inverting buffer/line driver (3-State) — regression ────────
// The 74x828 (js/chips/chips41.js) is primitive-backed by TRI_BUFFER_DUAL_OE with
// invert:true — one gate per bit. Verified against Philips Semiconductors "74F827
// 10-bit buffer/line driver, non-inverting (3-State)" (2004 Jan 21), which
// "Replaces Product specification 74F827/74F828 of 1994 Dec 5" (shared pinout),
// plus Fairchild's "74F828 is an inverting version of the 74F827".
//
// Behaviour (FUNCTION TABLE, per bit n):
//   OE0=L, OE1=L, Dn=L → Qn=H     (enabled, inverting)
//   OE0=L, OE1=L, Dn=H → Qn=L
//   OE0=H  or  OE1=H   → Qn=Z      (high impedance)
// The two output enables are active-LOW and NOR-combined: outputs drive only
// when BOTH OE0 (pin 1) and OE1 (pin 13) are LOW.
//
// Method: place ONE 74x828 (purely combinational), drive the ten data inputs and
// the two enables to the VCC/GND rail, re-solve, read the Q pins by name.
//
// Checks:
//   1. Enabled (OE0=OE1=0): Qn = NOT Dn across a sweep of 10-bit patterns.
//   2. Either enable HIGH → outputs not actively driven HIGH (high impedance).
//      Dn is held LOW so a driven output would read HIGH; when disabled it must
//      NOT read HIGH (mirrors the 74x40104 Hi-Z convention).
//
// Run:  node js/debug/scenarios/74x828-inv-buffer-tri.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x828');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const D = ['D0','D1','D2','D3','D4','D5','D6','D7','D8','D9'];
const Q = ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'];

// Drive the ten data inputs (bits[]) and the two active-LOW enables (oe0, oe1).
function apply(bits, oe0, oe1) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x828 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OE0', oe0);
  wirePin('OE1', oe1);
  D.forEach((name, i) => wirePin(name, bits[i]));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qStr = () => Q.map(n => (isHigh(read(n)) ? 1 : 0)).join('');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Enabled (OE0=OE1=0): Qn = NOT Dn ──────────────────────────────────────
const PATTERNS = [
  [0,0,0,0,0,0,0,0,0,0], // all LOW  → all Q HIGH
  [1,1,1,1,1,1,1,1,1,1], // all HIGH → all Q LOW
  [1,0,1,0,1,0,1,0,1,0], // alternating
  [0,1,0,1,0,1,0,1,0,1], // alternating (opposite)
  [1,0,0,0,0,0,0,0,0,1], // ends only
  [0,0,0,0,1,1,0,0,0,0], // middle only
];

for (const bits of PATTERNS) {
  apply(bits, 0, 0);
  const exp = bits.map(b => b ? 0 : 1).join('');
  const got = qStr();
  assert(got === exp, `enabled: D=[${bits}] expected Q=${exp}, got ${got}`);
}

// ── 2. Either enable HIGH → high impedance (not driven HIGH) ──────────────────
// D held LOW, so an enabled output would read HIGH (inverting). Disabled → Hi-Z.
const LOW10 = [0,0,0,0,0,0,0,0,0,0];
for (const [oe0, oe1, label] of [[1,0,'OE0 HIGH'], [0,1,'OE1 HIGH'], [1,1,'both HIGH']]) {
  apply(LOW10, oe0, oe1);
  for (const n of Q) {
    assert(!isHigh(read(n)),
      `${label}: ${n} should be high impedance (not HIGH), got ${qStr()}`);
  }
}

// Sanity: with the same LOW inputs but both enables LOW, every Q is HIGH.
apply(LOW10, 0, 0);
assert(qStr() === '1111111111', `enable sanity: expected all Q HIGH, got ${qStr()}`);

console.log(`74x828-inv-buffer-tri: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
