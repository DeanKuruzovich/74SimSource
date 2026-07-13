// ── 74x854 8-to-9 bit INVERTING parity bus transceiver (latched error) — regression
// The 74x854 (js/chips/chips42.js) is the behavioral coverage of the
// XCVR_PARITY_LATCH_INV engine primitive. It is the 74x853 with both data buses
// inverted end to end, and it stands to the 853 exactly as the 74x834 register
// part stands to the 74x833. This scenario guards the parts that make it more
// than a plain inverting 74x240:
//   1. INVERTED transfer: sending A→B, B = NOT A; receiving B→A, A = NOT B.
//   2. Odd-parity GENERATION when sending A→B. Inverting all eight data bits
//      leaves the count of 1s the same parity, so the generated bit matches the
//      853's and the 9-bit word on B is still valid odd parity.
//   3. Odd-parity CHECK when receiving B→A: a bad (even) 9-bit word is caught.
//   4. The LEVEL-SENSITIVE, open-collector error flag ERRn gated by LEn: LEn LOW
//      is transparent (ERRn follows the live check — a good word after a bad one
//      re-clears it, UNLIKE the sticky 834 register), LEn HIGH freezes the
//      captured value, CLRn LOW forces HIGH.
//   5. The forced-error diagnostic mode (both enables LOW → A→B, parity inverted).
//
// Method (mirrors 74x853-parity-xcvr-latch.mjs): place ONE 74x854 and reuse the
// same chip + sim instance so the latch state persists. ERRn is open collector —
// a released (no-error) flag is pulled HIGH by an external pull-up; an error
// sinks it LOW.
//
// Bus map: A0..A7 on pins 2-9, B0..B7 on pins 23..16, PARITY on 15, ERRn on 10,
// LEn on 13. Modes set by OEAn/OEBn (active LOW): OEBn=0 → A→B; OEAn=0 → B→A;
// both 1 → isolation; both 0 → A→B with inverted parity.
//
// Run:  node js/debug/scenarios/74x854-parity-xcvr-latch-inv.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent, ResistorComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const bit = (v) => (isHigh(v) ? 1 : 0);

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x854');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// ERRn is open-collector — the datasheet requires an external pull-up. Add a real
// 4.7kΩ from ERRn to the VCC rail so a released (no-error) flag reads HIGH and a
// sunk (error) flag reads LOW.
const errPin = chip.getPinByName('ERRn');
const pullup = new ResistorComponent(4700);
pullup.placeWireLike(holeId(0, 0, 'power', Math.min(errPin.col, 29), 1), errPin.holeId);

const A_PINS = ['A0','A1','A2','A3','A4','A5','A6','A7'];
const B_PINS = ['B0','B1','B2','B3','B4','B5','B6','B7'];

function solve(driven) {
  const wm = new WireManager();
  const wirePin = (name, b) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x854 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), b ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const [name, b] of Object.entries(driven)) wirePin(name, b);
  sim.evaluate(world, [chip, pullup], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBus = (pins) => pins.map((n) => bit(read(n)));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const eqBus = (got, want) => got.length === want.length && got.every((v, i) => v === want[i]);

const ones = (arr) => arr.reduce((a, b) => a + b, 0);
const inv = (arr) => arr.map((b) => (b ? 0 : 1));
const busDrive = (pins, arr) => Object.fromEntries(pins.map((n, i) => [n, arr[i]]));

// ── 1. Transmit A→B, INVERT the byte, generate odd parity (OEBn=0, OEAn=1) ────
// B must be the complement of A; PARITY must make the total number of 1s over the
// *transmitted* B word odd. Because inversion preserves the parity of the count,
// the generated bit is computed from A the same way the 853 does.
const TX_CASES = [
  [0,0,0,0,0,0,0,0], // 0 ones (even) → PARITY 1
  [1,0,0,0,0,0,0,0], // 1 one  (odd)  → PARITY 0
  [1,1,0,0,0,0,0,0], // 2 ones (even) → PARITY 1
  [1,1,1,0,1,0,1,0], // 5 ones (odd)  → PARITY 0
];
for (const a of TX_CASES) {
  solve({ OEAn: 1, OEBn: 0, CLRn: 1, LEn: 1, ...busDrive(A_PINS, a) });
  const b = readBus(B_PINS);
  const par = bit(read('PARITY'));
  const wantPar = (ones(a) % 2 === 0) ? 1 : 0;      // odd-parity generator (from A byte)
  assert(eqBus(b, inv(a)), `TX A→B: B should be NOT A=${a} → ${inv(a)}, got ${b}`);
  assert(par === wantPar, `TX A→B: A=${a} parity should be ${wantPar}, got ${par}`);
  assert((ones(b) + par) % 2 === 1, `TX A→B: 9-bit B word for A=${a} not odd (par=${par})`);
}

// ── 2. Forced-error mode: A→B (inverted byte) with inverted parity (both 0) ───
for (const a of TX_CASES) {
  solve({ OEAn: 0, OEBn: 0, CLRn: 1, LEn: 1, ...busDrive(A_PINS, a) });
  const b = readBus(B_PINS);
  const par = bit(read('PARITY'));
  const normal = (ones(a) % 2 === 0) ? 1 : 0;
  assert(eqBus(b, inv(a)), `forced-error: B should still be NOT A=${a}, got ${b}`);
  assert(par === (normal ? 0 : 1), `forced-error: A=${a} parity should be inverted ${normal?0:1}, got ${par}`);
  assert((ones(b) + par) % 2 === 0, `forced-error: 9-bit B word for A=${a} should be EVEN (bad), par=${par}`);
}

// ── 3. Receive B→A, INVERT the byte, check parity with a TRANSPARENT latch ────
// With LEn LOW the flag follows the live check every solve — no clock needed.
function receiveTransparent(b, parity, { clr = 1 } = {}) {
  solve({ OEAn: 0, OEBn: 1, CLRn: clr, LEn: 0, ...busDrive(B_PINS, b), PARITY: parity });
  return { a: readBus(A_PINS), err: bit(read('ERRn')) };
}

// 3a. A good (odd) word keeps ERRn HIGH. B=10000000, PARITY=0 → 1 one total.
{
  const good = receiveTransparent([1,0,0,0,0,0,0,0], 0);
  assert(eqBus(good.a, inv([1,0,0,0,0,0,0,0])), `RX B→A: A should be NOT B, got ${good.a}`);
  assert(good.err === 1, `RX good word: ERRn should be HIGH, got ${good.err}`);
}

// 3b. A bad (even) word pulls ERRn LOW. B=10000000, PARITY=1 → 2 ones total.
{
  const bad = receiveTransparent([1,0,0,0,0,0,0,0], 1);
  assert(bad.err === 0, `RX bad word: ERRn should go LOW, got ${bad.err}`);
}

// 3c. Transparent (NOT sticky): a good word after the error re-clears ERRn while
// LEn is LOW. This is the key behavioral difference from the sticky 74x834.
{
  const good = receiveTransparent([1,1,0,0,0,0,0,0], 1); // 2 data ones + PARITY 1 = 3 (odd) → good
  assert(good.err === 1, `RX transparent: good word should re-clear ERRn to HIGH, got ${good.err}`);
}

// ── 4. LEn HIGH freezes the flag (store) ─────────────────────────────────────
// Latch a bad word transparent, raise LEn, then feed a good word: the frozen LOW
// must hold even though the live check is now good.
{
  receiveTransparent([1,0,0,0,0,0,0,0], 1);           // bad word, LEn=0 → ERRn LOW
  solve({ OEAn: 0, OEBn: 1, CLRn: 1, LEn: 1, ...busDrive(B_PINS, [1,0,0,0,0,0,0,0]), PARITY: 0 });
  assert(bit(read('ERRn')) === 0, `store: LEn HIGH should freeze ERRn LOW despite a good word, got ${bit(read('ERRn'))}`);
}

// ── 5. CLRn LOW pulse forces ERRn HIGH regardless of LEn ─────────────────────
{
  solve({ OEAn: 0, OEBn: 1, CLRn: 0, LEn: 1, ...busDrive(B_PINS, [1,0,0,0,0,0,0,0]), PARITY: 1 });
  assert(bit(read('ERRn')) === 1, `CLRn should force ERRn HIGH, got ${bit(read('ERRn'))}`);
}

// ── 6. Isolation (OEBn=1, OEAn=1): ERRn, when transparent, reflects A-bus parity
{
  // Even A (all zero): pOk = 0 → error (LOW) while LEn=0.
  solve({ OEAn: 1, OEBn: 1, CLRn: 1, LEn: 0, ...busDrive(A_PINS, [0,0,0,0,0,0,0,0]) });
  assert(bit(read('ERRn')) === 0, `isolation: even A bus should pull ERRn LOW, got ${bit(read('ERRn'))}`);
  // Odd A (one 1): pOk = 1 → no error (HIGH).
  solve({ OEAn: 1, OEBn: 1, CLRn: 1, LEn: 0, ...busDrive(A_PINS, [1,0,0,0,0,0,0,0]) });
  assert(bit(read('ERRn')) === 1, `isolation: odd A bus should leave ERRn HIGH, got ${bit(read('ERRn'))}`);
}

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`74x854: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x854: PASS — inverting A↔B transfer, odd-parity gen/check, transparent+frozen ERRn latch, forced-error, isolation');
