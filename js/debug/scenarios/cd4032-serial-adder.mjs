// ── CD4032 triple serial adder — regression ─────────────────────────────────
// The CD4032 (js/chips/chips144.js) is the first behavioral coverage of the
// SERIAL_ADDER_TRIPLE_4032 primitive. It guards the two ways the CD4032 differs
// from the 74385 SERIAL_ADDER_QUAD primitive the coverage plan hinted at:
//   1. INVERT complements the SUM OUTPUT, not the B input — so the carry chain
//      is computed from the true A,B bits regardless of INVERT.
//   2. There is a shared CARRY-RESET that clears the stored carry to 0 between
//      words (the 74385 primitive has none).
// Plus the basics: three INDEPENDENT serial full adders sharing one CLOCK, sum
// produced LSB-first, carry latched on the rising clock edge.
//
// Method (mirrors cd4021-piso-shift.mjs): place ONE CD4032 and keep the same
// chip + sim instance for the whole run so the carry flip-flops persist. SUM is
// combinational, so for each bit we: set A/B/INV with CLK low, READ the sum bit,
// then pulse CLK low→high→low to latch the carry for the next bit.
//
// Run:  node js/debug/scenarios/cd4032-serial-adder.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4032');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// All driveable input pins. Outputs (SUM1/2/3) are read, never wired.
const INPUTS = ['CLK','CR','A1','B1','INV1','A2','B2','INV2','A3','B3','INV3'];
let st = Object.fromEntries(INPUTS.map((n) => [n, 0]));

function apply(patch = {}) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4032 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  for (const name of INPUTS) wirePin(name, st[name] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const sumBit = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Pulse CLK to latch the carry-out (carry is added on the positive-going edge).
function clockEdge() {
  apply({ CLK: 1 });
  apply({ CLK: 0 });
}

// Clear all three carries: drive CARRY-RESET HIGH across a clock edge.
function carryReset() {
  apply({ CR: 1 });
  clockEdge();
  apply({ CR: 0 });
}

// Add two numbers on adder 1, LSB first, nbits wide. inv1 optionally complements
// each sum bit. Returns the produced sum stream as an integer (LSB-first read).
function addAdder1(a, b, nbits, inv1 = 0) {
  carryReset();
  let result = 0;
  for (let i = 0; i < nbits; i++) {
    const ab = (a >> i) & 1;
    const bb = (b >> i) & 1;
    apply({ A1: ab, B1: bb, INV1: inv1, CLK: 0 });
    result |= sumBit('SUM1') << i; // combinational read BEFORE the edge
    clockEdge();                   // latch carry for the next bit
  }
  return result;
}

// ── 1. Basic serial addition, adder 1 ───────────────────────────────────────
// 3 + 1 = 4  (0b011 + 0b001 = 0b100), 4 bits.
assert(addAdder1(3, 1, 4) === 4, `3+1 should be 4, got ${addAdder1(3, 1, 4)}`);
// 5 + 6 = 11 (0b0101 + 0b0110 = 0b1011), 5 bits to hold the carry-out.
assert(addAdder1(5, 6, 5) === 11, `5+6 should be 11, got ${addAdder1(5, 6, 5)}`);
// 15 + 15 = 30, needs 5 bits.
assert(addAdder1(15, 15, 5) === 30, `15+15 should be 30, got ${addAdder1(15, 15, 5)}`);

// ── 2. INVERT complements the SUM OUTPUT (not the B input) ───────────────────
// With INV1 held HIGH, every produced sum bit must be the bitwise complement of
// the true-sum bits. True 3+1 over 4 bits = 0b0100; complemented = 0b1011 = 11.
assert(addAdder1(3, 1, 4, 1) === 0b1011,
  `INV1 should complement the 4-bit true sum 0100 → 1011 (11), got ${addAdder1(3, 1, 4, 1)}`);
// Critical distinction vs the 74385 (invert-B) model: the CARRY must still be
// the true-A/true-B carry. If INVERT wrongly inverted B, 3+(~1) carry behaviour
// would differ. true 5+6=01011; complement over 5 bits = 10100 = 20.
assert(addAdder1(5, 6, 5, 1) === 0b10100,
  `INV1 should complement true sum 01011 → 10100 (20), got ${addAdder1(5, 6, 5, 1)}`);

// ── 3. CARRY-RESET actually clears a leftover carry ─────────────────────────
// Generate a carry into the FF (1+1 at bit0 sets carry=1), then WITHOUT resetting
// add 0+0: if the carry leaked, bit0 would read 1. With the reset it reads 0.
carryReset();
apply({ A1: 1, B1: 1, INV1: 0, CLK: 0 }); // bit0: 1+1 → sum0, carry→1
assert(sumBit('SUM1') === 0, 'CR test: 1+1 bit0 sum should be 0');
clockEdge();                              // latch carry=1
// Now clear and verify the carry is gone: 0+0 must give 0, not 1.
carryReset();
apply({ A1: 0, B1: 0, INV1: 0, CLK: 0 });
assert(sumBit('SUM1') === 0, 'CR test: after carry-reset, 0+0 bit0 sum should be 0 (carry cleared)');

// ── 4. Three adders are INDEPENDENT (run different sums at once) ─────────────
// Adder1: 2+1=3, Adder2: 3+3=6, Adder3: 1+1=2, all 4 bits, LSB-first together.
carryReset();
const a = [2, 3, 1], b = [1, 3, 1];
let r = [0, 0, 0];
for (let i = 0; i < 4; i++) {
  apply({
    A1: (a[0] >> i) & 1, B1: (b[0] >> i) & 1, INV1: 0,
    A2: (a[1] >> i) & 1, B2: (b[1] >> i) & 1, INV2: 0,
    A3: (a[2] >> i) & 1, B3: (b[2] >> i) & 1, INV3: 0,
    CLK: 0,
  });
  r[0] |= sumBit('SUM1') << i;
  r[1] |= sumBit('SUM2') << i;
  r[2] |= sumBit('SUM3') << i;
  clockEdge();
}
assert(r[0] === 3, `independent adder1 2+1 should be 3, got ${r[0]}`);
assert(r[1] === 6, `independent adder2 3+3 should be 6, got ${r[1]}`);
assert(r[2] === 2, `independent adder3 1+1 should be 2, got ${r[2]}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`CD4032 serial-adder: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD4032 serial-adder: PASS');
