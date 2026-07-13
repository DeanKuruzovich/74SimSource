// ── 74x834 8-to-9 bit INVERTING parity bus transceiver — regression ──────────
// The 74x834 (js/chips/chips41.js) is the inverting sibling of the 74x833 and
// the behavioral coverage of the XCVR_PARITY_REG_INV engine primitive. It shares
// the 833's architecture — bidirectional byte buses, a 9th (parity) bit on its
// own I/O pin, and a sticky open-collector error flag clocked by CP — but the
// data buses are inverted end to end. This scenario guards the parts that make
// it more than a plain inverting 74x240:
//   1. INVERTED transfer: sending A→B, B = NOT A; receiving B→A, A = NOT B.
//   2. Odd-parity GENERATION when sending A→B. Because inverting all eight data
//      bits leaves the count of 1s the same parity, the generated bit is the same
//      as the 833's and the 9-bit word on B is still valid odd parity.
//   3. Odd-parity CHECK when receiving B→A: a bad (even) 9-bit word is caught.
//   4. A STICKY error flag ERRn: once a bad word pulls it LOW it holds LOW through
//      later good words until a LOW pulse on CLRn clears it.
//   5. The forced-error diagnostic mode (both enables LOW → A→B, parity inverted).
//
// Method (mirrors 74x833-parity-xcvr.mjs): place ONE 74x834 and reuse the same
// chip + sim instance for the whole run so the error register's sequential state
// persists. Each solve wires the control pins plus whichever data pins are INPUTS
// for that mode; pins the chip drives are left unwired and read back. ERRn is open
// collector, so a real 4.7kΩ pull-up to VCC makes a released (no-error) flag read
// HIGH and an error sink it LOW.
//
// Bus map: A0..A7 on pins 2-9, B0..B7 on pins 23..16, PARITY on 15, ERRn on 10,
// CLRn on 11, CP on 13. Modes set by OEAn/OEBn (active LOW): OEBn=0 → A→B;
// OEAn=0 → B→A; both 1 → isolation; both 0 → A→B with inverted parity.
//
// Run:  node js/debug/scenarios/74x834-parity-xcvr-inv.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent, ResistorComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const bit = (v) => (isHigh(v) ? 1 : 0);

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x834');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// ERRn is open-collector — the datasheet requires an external pull-up. Add a
// real 4.7kΩ from ERRn to the VCC rail so a released (no-error) flag reads HIGH
// and a sunk (error) flag reads LOW.
const errPin = chip.getPinByName('ERRn');
const pullup = new ResistorComponent(4700);
pullup.placeWireLike(holeId(0, 0, 'power', Math.min(errPin.col, 29), 1), errPin.holeId);

const A_PINS = ['A0','A1','A2','A3','A4','A5','A6','A7'];
const B_PINS = ['B0','B1','B2','B3','B4','B5','B6','B7'];

// Wire the given {name: bit} map to the power rails and solve. Only listed pins
// are driven; everything else floats or is driven by the chip.
function solve(driven) {
  const wm = new WireManager();
  const wirePin = (name, b) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x834 has no pin named ${name}`);
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
// B must be the complement of A; PARITY must make the total number of 1s (over
// the *transmitted* B word) odd.
const TX_CASES = [
  [0,0,0,0,0,0,0,0], // 0 ones (even) → PARITY 1
  [1,0,0,0,0,0,0,0], // 1 one  (odd)  → PARITY 0
  [1,1,0,0,0,0,0,0], // 2 ones (even) → PARITY 1
  [1,1,1,0,1,0,1,0], // 5 ones (odd)  → PARITY 0
];
for (const a of TX_CASES) {
  solve({ OEAn: 1, OEBn: 0, CLRn: 1, CP: 0, ...busDrive(A_PINS, a) });
  const b = readBus(B_PINS);
  const par = bit(read('PARITY'));
  const wantPar = (ones(a) % 2 === 0) ? 1 : 0;      // odd-parity generator (from A byte)
  assert(eqBus(b, inv(a)), `TX A→B: B should be NOT A=${a} → ${inv(a)}, got ${b}`);
  assert(par === wantPar, `TX A→B: A=${a} parity should be ${wantPar}, got ${par}`);
  assert((ones(b) + par) % 2 === 1, `TX A→B: 9-bit B word for A=${a} not odd (par=${par})`);
}

// ── 2. Forced-error mode: A→B (inverted byte) with inverted parity (both 0) ───
for (const a of TX_CASES) {
  solve({ OEAn: 0, OEBn: 0, CLRn: 1, CP: 0, ...busDrive(A_PINS, a) });
  const b = readBus(B_PINS);
  const par = bit(read('PARITY'));
  const normal = (ones(a) % 2 === 0) ? 1 : 0;
  assert(eqBus(b, inv(a)), `forced-error: B should still be NOT A=${a}, got ${b}`);
  assert(par === (normal ? 0 : 1), `forced-error: A=${a} parity should be inverted ${normal?0:1}, got ${par}`);
  assert((ones(b) + par) % 2 === 0, `forced-error: 9-bit B word for A=${a} should be EVEN (bad), par=${par}`);
}

// ── 3. Receive B→A, INVERT the byte, check parity, and the sticky error flag ──
// Helper: apply a receive word (B + PARITY) and pulse CP LOW→HIGH to sample.
function receiveClock(b, parity, { clr = 1 } = {}) {
  const driven = { OEAn: 0, OEBn: 1, CLRn: clr, ...busDrive(B_PINS, b), PARITY: parity };
  solve({ ...driven, CP: 0 });       // clock low
  const a = readBus(A_PINS);         // A should be NOT B while enabled
  solve({ ...driven, CP: 1 });       // rising edge samples the check
  return { a, err: bit(read('ERRn')) };
}

// 3a. A good (odd) word keeps ERRn HIGH. B=10000000, PARITY=0 → 1 one total.
{
  solve({ OEAn: 0, OEBn: 1, CLRn: 0, CP: 0, ...busDrive(B_PINS, [1,0,0,0,0,0,0,0]), PARITY: 0 }); // clear first
  const good = receiveClock([1,0,0,0,0,0,0,0], 0);
  assert(eqBus(good.a, inv([1,0,0,0,0,0,0,0])), `RX B→A: A should be NOT B, got ${good.a}`);
  assert(good.err === 1, `RX good word: ERRn should stay HIGH, got ${good.err}`);
}

// 3b. A bad (even) word pulls ERRn LOW. B=10000000, PARITY=1 → 2 ones total.
let afterBad;
{
  afterBad = receiveClock([1,0,0,0,0,0,0,0], 1);
  assert(afterBad.err === 0, `RX bad word: ERRn should go LOW, got ${afterBad.err}`);
}

// 3c. Sticky: a good word after the error does NOT clear the flag.
{
  const good = receiveClock([1,1,0,0,0,0,0,0], 1); // 2 data ones + PARITY 1 = 3 (odd) → good
  assert(good.err === 0, `RX sticky: ERRn should hold LOW after a good word, got ${good.err}`);
}

// 3d. CLRn LOW pulse resets the flag to HIGH (async, no clock needed).
{
  solve({ OEAn: 0, OEBn: 1, CLRn: 0, CP: 1, ...busDrive(B_PINS, [1,0,0,0,0,0,0,0]), PARITY: 1 });
  assert(bit(read('ERRn')) === 1, `CLRn should force ERRn HIGH, got ${bit(read('ERRn'))}`);
}

// ── 4. Isolation (OEBn=1, OEAn=1): A/B/PARITY Hi-Z; clocked ERRn reflects A ────
{
  solve({ OEAn: 1, OEBn: 1, CLRn: 0, CP: 0, ...busDrive(A_PINS, [0,0,0,0,0,0,0,0]) }); // clear
  // Even A (all zero): pOk = 0 → error.
  solve({ OEAn: 1, OEBn: 1, CLRn: 1, CP: 0, ...busDrive(A_PINS, [0,0,0,0,0,0,0,0]) });
  solve({ OEAn: 1, OEBn: 1, CLRn: 1, CP: 1, ...busDrive(A_PINS, [0,0,0,0,0,0,0,0]) });
  assert(bit(read('ERRn')) === 0, `isolation: even A bus should clock ERRn LOW, got ${bit(read('ERRn'))}`);

  // Clear, then odd A (one 1): pOk = 1 → no error.
  solve({ OEAn: 1, OEBn: 1, CLRn: 0, CP: 1, ...busDrive(A_PINS, [1,0,0,0,0,0,0,0]) });
  solve({ OEAn: 1, OEBn: 1, CLRn: 1, CP: 0, ...busDrive(A_PINS, [1,0,0,0,0,0,0,0]) });
  solve({ OEAn: 1, OEBn: 1, CLRn: 1, CP: 1, ...busDrive(A_PINS, [1,0,0,0,0,0,0,0]) });
  assert(bit(read('ERRn')) === 1, `isolation: odd A bus should leave ERRn HIGH, got ${bit(read('ERRn'))}`);
}

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`74x834: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x834: PASS — inverting A↔B transfer, odd-parity gen/check, sticky ERRn, forced-error, isolation');
