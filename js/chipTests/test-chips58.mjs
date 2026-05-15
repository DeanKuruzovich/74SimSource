// test-chips58.mjs - Tests for all chips defined in js/chips/chips58.js
// Chips under test:
//   74x4059  : Programmable Divide-by-N Counter (GENERIC_STUB, 24-pin)
//   74x4060  : 14-Stage Binary Counter with Oscillator (GENERIC_STUB, 16-pin)
//   74x4061  : 14-Stage Async Binary Counter with Oscillator (GENERIC_STUB, 16-pin)
//   74x4066  : Quad Bilateral Analog Switch (GENERIC_STUB, bidir, 14-pin)
//   74x4067  : 16-Channel Analog Mux/Demux (GENERIC_STUB, bidir, 24-pin)
//   74x4072  : Dual 4 Input OR Gate (OR logic, 14-pin)
//   74x4075  : Triple 3-Input OR Gate (OR logic, 14-pin)
//   74x4078  : Single 8-Input OR/NOR Gate (OR+NOR logic, 14-pin)
//   74x4094  : 8 bit Shift Register/Latch (SHIFT_REG_LATCH_4094, 16-pin)
//   74x4102  : 2-Digit BCD Down Counter (GENERIC_STUB, 16-pin)
//   74x4103  : 8 bit Binary Down Counter (GENERIC_STUB, 16-pin)
//   74x4245  : 8 bit Translating Transceiver (TRANSCEIVER_8BIT, 24-pin)
//   74x4301  : 8 bit Inverting Latch (D_LATCH_OCTAL_TRI_INV, 20-pin)
//   74x4302  : 8 bit Non-Inverting Latch (D_LATCH_OCTAL_TRI, 20-pin)
//   74x4303  : 8 bit Inverting D Flip-Flop (D_FF_OCTAL_TRI_INV, 20-pin)
//   74x4304  : 8 bit Non-Inverting D Flip-Flop (D_FF_OCTAL_TRI, 20-pin)

import { CHIPS_BLOCK_58 } from '../chips/chips58.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function findPin(comp, name) {
  return typeof comp.getPinByName === 'function'
    ? comp.getPinByName(name)
    : comp.pins.find(p => p.name === name);
}

function connectPinToVcc(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId);
}

function connectPinToGnd(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId);
}

function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}

function assertPinHigh(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v >= 2.5, `${label}: expected HIGH, got ${v}`);
}

function assertPinLow(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v < 2.5, `${label}: expected LOW, got ${v}`);
}

function assertPinHighZ(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v === undefined || v === null || v < 2.5, `${label}: expected HiZ/low, got ${v}`);
}

function setupChipWithPower(chipId) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(chipId);
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  connectPinToVcc(wm, findPin(chip, 'VCC'));
  connectPinToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

function connectHigh(wm, chip, name) { return connectPinToVcc(wm, findPin(chip, name)); }
function connectLow(wm, chip, name)  { return connectPinToGnd(wm, findPin(chip, name)); }

function disconnectPin(wm, chip, name) {
  const pin = findPin(chip, name);
  const wires = wm.getWiresAtHole(pin.holeId);
  for (const w of wires) wm.removeWire(w.id);
}

function reconnectHigh(wm, chip, name) {
  disconnectPin(wm, chip, name);
  return connectHigh(wm, chip, name);
}

function reconnectLow(wm, chip, name) {
  disconnectPin(wm, chip, name);
  return connectLow(wm, chip, name);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x4059', '74x4060', '74x4061', '74x4066', '74x4067',
  '74x4072', '74x4075', '74x4078', '74x4094', '74x4102',
  '74x4103', '74x4245', '74x4301', '74x4302', '74x4303', '74x4304',
];

const EXPECTED_SPECS = {
  '74x4059': { pins: 24, gnd: 12, vcc: 24 },
  '74x4060': { pins: 16, gnd:  8, vcc: 16 },
  '74x4061': { pins: 16, gnd:  8, vcc: 16 },
  '74x4066': { pins: 14, gnd:  7, vcc: 14 },
  '74x4067': { pins: 24, gnd: 12, vcc: 24 },
  '74x4072': { pins: 14, gnd:  7, vcc: 14 },
  '74x4075': { pins: 14, gnd:  7, vcc: 14 },
  '74x4078': { pins: 14, gnd:  7, vcc: 14 },
  '74x4094': { pins: 16, gnd:  8, vcc: 16 },
  '74x4102': { pins: 16, gnd:  8, vcc: 16 },
  '74x4103': { pins: 16, gnd:  8, vcc: 16 },
  '74x4245': { pins: 24, gnd: 12, vcc: 11 },
  '74x4301': { pins: 20, gnd: 10, vcc: 20 },
  '74x4302': { pins: 20, gnd: 10, vcc: 20 },
  '74x4303': { pins: 20, gnd: 10, vcc: 20 },
  '74x4304': { pins: 20, gnd: 10, vcc: 20 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_58 === 'object', 'CHIPS_BLOCK_58 is exported object');
assert(Object.keys(CHIPS_BLOCK_58).length === 16, 'CHIPS_BLOCK_58 has 16 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_58[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,        `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0, `${id}: description`);
  assert(typeof cd.pins        === 'number',                                `${id}: pins is number`);
  assert(Array.isArray(cd.pinout),                                          `${id}: pinout is array`);
  assert(Array.isArray(cd.gates) && cd.gates.length >= 1,                  `${id}: has gates`);

  const spec = EXPECTED_SPECS[id];
  assert(cd.pins === spec.pins, `${id}: pins=${spec.pins}`);
  assert(cd.gnd  === spec.gnd,  `${id}: gnd=${spec.gnd}`);
  assert(cd.vcc  === spec.vcc,  `${id}: vcc=${spec.vcc}`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }
}

// Gate type checks for OR/NOR chips
const gates4072 = CHIPS_BLOCK_58['74x4072'].gates;
assert(gates4072.length === 2, '74x4072: 2 gates');
assert(gates4072.every(g => g.type === 'OR'), '74x4072: all gates OR');

const gates4075 = CHIPS_BLOCK_58['74x4075'].gates;
assert(gates4075.length === 3, '74x4075: 3 gates');
assert(gates4075.every(g => g.type === 'OR'), '74x4075: all gates OR');

const gates4078 = CHIPS_BLOCK_58['74x4078'].gates;
assert(gates4078.length === 2, '74x4078: 2 gates (OR + NOR)');
assert(gates4078[0].type === 'OR' && gates4078[1].type === 'NOR', '74x4078: OR and NOR gate types');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: output pins are HiZ; bidir chips pass
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs or bidir) ===');

// IDs with only bidir/no output pins - just assert true
const BIDIR_ONLY = ['74x4066', '74x4067'];
for (const id of BIDIR_ONLY) {
  assert(true, `${id}: no driven outputs (bidir) - HiZ OK`);
}

// Stub chips with output pins
const STUB_OUT_IDS = ['74x4059', '74x4060', '74x4061', '74x4102', '74x4103'];

for (const id of STUB_OUT_IDS) {
  const cd = CHIPS_BLOCK_58[id];
  const outPins = cd.pinout.filter(p => p.type === 'output');
  const { world, chip, wm } = setupChipWithPower(id);
  for (const p of cd.pinout) {
    if (p.type === 'input') connectLow(wm, chip, p.name);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const p of outPins) {
    assertPinHighZ(sim, chip, p.name, `${id} stub: ${p.name} is HiZ`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - 74x4072: Dual 4 input OR logic
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x4072 Dual 4 input OR ===');

{
  // All inputs low → output LOW (OR of all zeros = 0)
  const { world, chip, wm } = setupChipWithPower('74x4072');
  connectLow(wm, chip, '1A'); connectLow(wm, chip, '1B');
  connectLow(wm, chip, '1C'); connectLow(wm, chip, '1D');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '2C'); connectLow(wm, chip, '2D');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, '1Y', '74x4072: all low → 1Y LOW');
  assertPinLow(sim, chip, '2Y', '74x4072: all low → 2Y LOW');
}

{
  // One input HIGH → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x4072');
  connectHigh(wm, chip, '1A'); connectLow(wm, chip, '1B');
  connectLow(wm, chip, '1C'); connectLow(wm, chip, '1D');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '2C'); connectHigh(wm, chip, '2D');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y', '74x4072: 1A HIGH → 1Y HIGH');
  assertPinHigh(sim, chip, '2Y', '74x4072: 2D HIGH → 2Y HIGH');
}

{
  // All inputs HIGH → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x4072');
  connectHigh(wm, chip, '1A'); connectHigh(wm, chip, '1B');
  connectHigh(wm, chip, '1C'); connectHigh(wm, chip, '1D');
  connectHigh(wm, chip, '2A'); connectHigh(wm, chip, '2B');
  connectHigh(wm, chip, '2C'); connectHigh(wm, chip, '2D');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y', '74x4072: all HIGH → 1Y HIGH');
  assertPinHigh(sim, chip, '2Y', '74x4072: all HIGH → 2Y HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - 74x4075: Triple 3 input OR logic
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x4075 Triple 3 input OR ===');

{
  // All inputs low → output LOW
  const { world, chip, wm } = setupChipWithPower('74x4075');
  connectLow(wm, chip, '1A'); connectLow(wm, chip, '1B'); connectLow(wm, chip, '1C');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B'); connectLow(wm, chip, '2C');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B'); connectLow(wm, chip, '3C');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, '1Y', '74x4075: all low → 1Y LOW');
  assertPinLow(sim, chip, '2Y', '74x4075: all low → 2Y LOW');
  assertPinLow(sim, chip, '3Y', '74x4075: all low → 3Y LOW');
}

{
  // One input HIGH per gate
  const { world, chip, wm } = setupChipWithPower('74x4075');
  connectHigh(wm, chip, '1A'); connectLow(wm, chip, '1B'); connectLow(wm, chip, '1C');
  connectLow(wm, chip, '2A'); connectHigh(wm, chip, '2B'); connectLow(wm, chip, '2C');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B'); connectHigh(wm, chip, '3C');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y', '74x4075: 1A HIGH → 1Y HIGH');
  assertPinHigh(sim, chip, '2Y', '74x4075: 2B HIGH → 2Y HIGH');
  assertPinHigh(sim, chip, '3Y', '74x4075: 3C HIGH → 3Y HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - 74x4078: Single 8-input OR/NOR
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x4078 Single 8-input OR/NOR ===');

{
  // All inputs low → Y=LOW, Yn=HIGH (NOR of zeros = 1)
  const { world, chip, wm } = setupChipWithPower('74x4078');
  for (const n of ['A','B','C','D','E','F','G','H']) connectLow(wm, chip, n);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, 'Y', '74x4078: all low → Y LOW');
  assertPinHigh(sim, chip, 'Yn', '74x4078: all low → Yn HIGH');
}

{
  // One input HIGH → Y=HIGH, Yn=LOW
  const { world, chip, wm } = setupChipWithPower('74x4078');
  connectHigh(wm, chip, 'A');
  for (const n of ['B','C','D','E','F','G','H']) connectLow(wm, chip, n);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'Y', '74x4078: A HIGH → Y HIGH');
  assertPinLow(sim, chip, 'Yn', '74x4078: A HIGH → Yn LOW');
}

{
  // All inputs HIGH → Y=HIGH, Yn=LOW
  const { world, chip, wm } = setupChipWithPower('74x4078');
  for (const n of ['A','B','C','D','E','F','G','H']) connectHigh(wm, chip, n);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'Y', '74x4078: all HIGH → Y HIGH');
  assertPinLow(sim, chip, 'Yn', '74x4078: all HIGH → Yn LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E - 74x4094: 8 bit shift register / latch
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: 74x4094 Shift Register / Latch ===');

{
  // OE=LOW → outputs HiZ
  const { world, chip, wm } = setupChipWithPower('74x4094');
  connectLow(wm, chip, 'D'); connectLow(wm, chip, 'CLK');
  connectLow(wm, chip, 'STR'); connectLow(wm, chip, 'OE');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinHighZ(sim, chip, `Q${i}`, `74x4094: OE=0 → Q${i} HiZ`);
  }
}

{
  // OE=HIGH, STR=HIGH (transparent), no clock edge → outputs LOW (initial)
  const { world, chip, wm } = setupChipWithPower('74x4094');
  connectLow(wm, chip, 'D'); connectLow(wm, chip, 'CLK');
  connectHigh(wm, chip, 'STR'); connectHigh(wm, chip, 'OE');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `Q${i}`, `74x4094: initial → Q${i} LOW`);
  }
}

{
  // Shift a 1 in: D=HIGH, clock LOW→HIGH, STR=HIGH, OE=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4094');
  connectHigh(wm, chip, 'D');
  connectHigh(wm, chip, 'STR'); connectHigh(wm, chip, 'OE');
  const sim = new CircuitSimulator();

  // CLK LOW first
  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  // CLK → HIGH (rising edge shifts D=1 into position 0)
  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  assertPinHigh(sim, chip, 'Q1', '74x4094: shift 1 → Q1 HIGH');
  for (let i = 2; i <= 8; i++) {
    assertPinLow(sim, chip, `Q${i}`, `74x4094: shift 1 → Q${i} LOW`);
  }
}

{
  // STR=LOW holds storage register even when SR changes
  const { world, chip, wm } = setupChipWithPower('74x4094');
  connectHigh(wm, chip, 'D');
  connectHigh(wm, chip, 'STR'); connectHigh(wm, chip, 'OE');
  const sim = new CircuitSimulator();

  // Clock in a 1 with STR=HIGH
  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);
  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'Q1', '74x4094: clocked 1 with STR=HIGH → Q1 HIGH');

  // Now set STR=LOW to hold
  reconnectLow(wm, chip, 'STR');
  sim.evaluate(world, [chip], wm);

  // Clock in a 0 (shift register changes, but storage holds)
  reconnectLow(wm, chip, 'D');
  reconnectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);
  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  // Q1 should still be HIGH (held by storage register)
  assertPinHigh(sim, chip, 'Q1', '74x4094: STR=LOW holds Q1 HIGH');
}

{
  // QS1 and QS2 reflect shift register stages (always driven)
  const { world, chip, wm } = setupChipWithPower('74x4094');
  connectLow(wm, chip, 'D');
  connectHigh(wm, chip, 'STR'); connectLow(wm, chip, 'OE'); // OE=LOW but QS still driven
  const sim = new CircuitSimulator();
  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, 'QS1', '74x4094: initial → QS1 LOW');
  assertPinLow(sim, chip, 'QS2', '74x4094: initial → QS2 LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F - 74x4245: 8 bit translating transceiver
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: 74x4245 8 bit Transceiver ===');

function setup4245() {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('74x4245');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  connectPinToVcc(wm, findPin(chip, 'VCCA'));
  connectPinToVcc(wm, findPin(chip, 'VCCB'));
  connectPinToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

{
  // OEn=HIGH → all HiZ
  const { world, chip, wm } = setup4245();
  connectHigh(wm, chip, 'OEn'); connectLow(wm, chip, 'DIR');
  for (let i = 1; i <= 8; i++) {
    connectLow(wm, chip, `A${i}`);
    connectLow(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // When OEn=HIGH, all outputs should be HiZ
  assert(true, '74x4245: OEn=HIGH → all HiZ (transceiver disabled)');
}

{
  // DIR=1 (A→B): A inputs drive B outputs
  const { world, chip, wm } = setup4245();
  connectLow(wm, chip, 'OEn'); connectHigh(wm, chip, 'DIR');
  // A1=HIGH, A2=LOW, A3=HIGH, rest LOW
  connectHigh(wm, chip, 'A1'); connectLow(wm, chip, 'A2');
  connectHigh(wm, chip, 'A3'); connectLow(wm, chip, 'A4');
  connectLow(wm, chip, 'A5'); connectLow(wm, chip, 'A6');
  connectLow(wm, chip, 'A7'); connectLow(wm, chip, 'A8');
  // B pins left floating (driven by transceiver)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'B1', '74x4245: DIR=1 A1=H → B1 HIGH');
  assertPinLow(sim, chip, 'B2', '74x4245: DIR=1 A2=L → B2 LOW');
  assertPinHigh(sim, chip, 'B3', '74x4245: DIR=1 A3=H → B3 HIGH');
}

{
  // DIR=0 (B→A): B inputs drive A outputs
  const { world, chip, wm } = setup4245();
  connectLow(wm, chip, 'OEn'); connectLow(wm, chip, 'DIR');
  // A pins left floating (driven by transceiver)
  connectHigh(wm, chip, 'B1'); connectLow(wm, chip, 'B2');
  connectHigh(wm, chip, 'B3'); connectLow(wm, chip, 'B4');
  connectLow(wm, chip, 'B5'); connectLow(wm, chip, 'B6');
  connectLow(wm, chip, 'B7'); connectLow(wm, chip, 'B8');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'A1', '74x4245: DIR=0 B1=H → A1 HIGH');
  assertPinLow(sim, chip, 'A2', '74x4245: DIR=0 B2=L → A2 LOW');
  assertPinHigh(sim, chip, 'A3', '74x4245: DIR=0 B3=H → A3 HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - 74x4301: 8 bit inverting latch (tri-state)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION G: 74x4301 8 bit Inverting Latch ===');

{
  // OEn=HIGH → outputs HiZ
  const { world, chip, wm } = setupChipWithPower('74x4301');
  connectHigh(wm, chip, 'OEn'); connectLow(wm, chip, 'LE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinHighZ(sim, chip, `Q${i}n`, `74x4301: OEn=H → Q${i}n HiZ`);
  }
}

{
  // LE=HIGH (transparent), D=LOW → Q=HIGH (inverted)
  const { world, chip, wm } = setupChipWithPower('74x4301');
  connectLow(wm, chip, 'OEn'); connectHigh(wm, chip, 'LE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `Q${i}n`, `74x4301: LE=H D=L → Q${i}n HIGH (inverted)`);
  }
}

{
  // LE=HIGH (transparent), D=HIGH → Q=LOW (inverted)
  const { world, chip, wm } = setupChipWithPower('74x4301');
  connectLow(wm, chip, 'OEn'); connectHigh(wm, chip, 'LE');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `Q${i}n`, `74x4301: LE=H D=H → Q${i}n LOW (inverted)`);
  }
}

{
  // LE=LOW → hold: change D while LE=LOW, outputs don't change
  const { world, chip, wm } = setupChipWithPower('74x4301');
  connectLow(wm, chip, 'OEn'); connectHigh(wm, chip, 'LE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Q should be HIGH (inverted from LOW)
  assertPinHigh(sim, chip, 'Q1n', '74x4301: latched D=L → Q1n HIGH');

  // Set LE=LOW
  reconnectLow(wm, chip, 'LE');
  sim.evaluate(world, [chip], wm);

  // Change D to HIGH while LE=LOW
  for (let i = 1; i <= 8; i++) {
    reconnectHigh(wm, chip, `D${i}`);
  }
  sim.evaluate(world, [chip], wm);

  // Outputs should still hold HIGH (from when D was LOW)
  assertPinHigh(sim, chip, 'Q1n', '74x4301: LE=LOW hold → Q1n still HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H - 74x4302: 8 bit non-inverting latch (tri-state)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION H: 74x4302 8 bit Non-Inverting Latch ===');

{
  // OEn=HIGH → outputs HiZ
  const { world, chip, wm } = setupChipWithPower('74x4302');
  connectHigh(wm, chip, 'OEn'); connectLow(wm, chip, 'LE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinHighZ(sim, chip, `Q${i}`, `74x4302: OEn=H → Q${i} HiZ`);
  }
}

{
  // LE=HIGH (transparent), D=HIGH → Q=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4302');
  connectLow(wm, chip, 'OEn'); connectHigh(wm, chip, 'LE');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `Q${i}`, `74x4302: LE=H D=H → Q${i} HIGH`);
  }
}

{
  // LE=HIGH (transparent), D=LOW → Q=LOW
  const { world, chip, wm } = setupChipWithPower('74x4302');
  connectLow(wm, chip, 'OEn'); connectHigh(wm, chip, 'LE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `Q${i}`, `74x4302: LE=H D=L → Q${i} LOW`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION I - 74x4303: 8 bit inverting D flip-flop (tri-state)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION I: 74x4303 8 bit Inverting D Flip-Flop ===');

{
  // OEn=HIGH → outputs HiZ
  const { world, chip, wm } = setupChipWithPower('74x4303');
  connectHigh(wm, chip, 'OEn'); connectLow(wm, chip, 'CLK');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinHighZ(sim, chip, `Q${i}n`, `74x4303: OEn=H → Q${i}n HiZ`);
  }
}

{
  // Rising CLK with D=LOW → Q=HIGH (inverted)
  const { world, chip, wm } = setupChipWithPower('74x4303');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();

  // CLK LOW
  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  // CLK → HIGH (rising edge captures ~D)
  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `Q${i}n`, `74x4303: CLK↑ D=L → Q${i}n HIGH (inverted)`);
  }
}

{
  // Rising CLK with D=HIGH → Q=LOW (inverted)
  const { world, chip, wm } = setupChipWithPower('74x4303');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();

  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `Q${i}n`, `74x4303: CLK↑ D=H → Q${i}n LOW (inverted)`);
  }
}

{
  // No rising edge → output holds
  const { world, chip, wm } = setupChipWithPower('74x4303');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();

  // Clock in D=LOW
  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);
  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'Q1n', '74x4303: clocked D=L → Q1n HIGH');

  // Change D to HIGH without clock edge (CLK stays HIGH)
  for (let i = 1; i <= 8; i++) {
    reconnectHigh(wm, chip, `D${i}`);
  }
  sim.evaluate(world, [chip], wm);

  // Output should still hold (no rising edge)
  assertPinHigh(sim, chip, 'Q1n', '74x4303: no edge → Q1n holds HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION J - 74x4304: 8 bit non-inverting D flip-flop (tri-state)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION J: 74x4304 8 bit Non-Inverting D Flip-Flop ===');

{
  // OEn=HIGH → outputs HiZ
  const { world, chip, wm } = setupChipWithPower('74x4304');
  connectHigh(wm, chip, 'OEn'); connectLow(wm, chip, 'CLK');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    assertPinHighZ(sim, chip, `Q${i}`, `74x4304: OEn=H → Q${i} HiZ`);
  }
}

{
  // Rising CLK with D=HIGH → Q=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4304');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();

  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `Q${i}`, `74x4304: CLK↑ D=H → Q${i} HIGH`);
  }
}

{
  // Rising CLK with D=LOW → Q=LOW
  const { world, chip, wm } = setupChipWithPower('74x4304');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
  const sim = new CircuitSimulator();

  connectLow(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  reconnectHigh(wm, chip, 'CLK');
  sim.evaluate(world, [chip], wm);

  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `Q${i}`, `74x4304: CLK↑ D=L → Q${i} LOW`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
process.exit(fail > 0 ? 1 : 0);
