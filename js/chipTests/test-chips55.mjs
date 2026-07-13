// test-chips55.mjs - Tests for all chips defined in js/chips/chips55.js
// Chips under test:
//   74x2970     : Memory timing controller (GENERIC_STUB, 24 pin)
//   74x3004     : Selectable GTL voltage reference (GENERIC_STUB, 6 pin)
//   74x3037     : Quad 2 input NAND, 30Ω driver (real NAND logic, 16 pin)
//   74x3038     : Quad 2 input NAND, open collector 30Ω (openCollector, 16 pin)
//   74x3040     : Dual 4 input NAND, 30Ω driver (real NAND logic, 16 pin)
//   74x3125     : Quad FET bus switch active low OE (GENERIC_STUB, 14 pin)
//   74x3126     : Quad FET bus switch active high OE (GENERIC_STUB, 14 pin)
//   74FCT3244   : Dual 4 bit buffer/line driver (GENERIC_STUB, 20 pin)
//   74CBT3244   : Dual 4 bit FET bus switch CBT (GENERIC_STUB bidir, 20 pin)
//   74FST3244   : Dual 4 bit FET bus switch FST (GENERIC_STUB bidir, 20 pin)
//   74FCT3245   : Octal bidir transceiver (GENERIC_STUB bidir, 20 pin)
//   74CBT3245   : Octal FET bus switch CBT (GENERIC_STUB bidir, 20 pin)
//   74FST3245   : Octal FET bus switch FST (GENERIC_STUB bidir, 20 pin)
//   74LVX3245   : Octal bidir voltage-translating transceiver (GENERIC_STUB bidir, 24 pin)
//   74x3251     : 8-to-1 FET mux/demux (GENERIC_STUB bidir, 16 pin)
//   74x3253     : Dual 4-to-1 FET mux/demux (GENERIC_STUB bidir, 16 pin)

import { CHIPS_BLOCK_55 } from '../chips/chips55.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ───────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
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

function assertPinHighZ(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  const ok = (v === undefined || v === null || v < 2.5);
  assert(ok, `${label}: expected HiZ/low, got ${v}`);
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x2970', '74x3004',
  '74x3037', '74x3038', '74x3040',
  '74x3125', '74x3126',
  '74FCT3244',
  '74FCT3245',
  '74LVX3245',
  '74x3251', '74x3253',
];

const EXPECTED_SPECS = {
  '74x2970':  { pins: 24, gnd: 12, vcc: 24 },
  '74x3004':  { pins:  6, gnd:  3, vcc:  6 },
  '74x3037':  { pins: 16, gnd:  8, vcc: 16 },
  '74x3038':  { pins: 16, gnd:  8, vcc: 16 },
  '74x3040':  { pins: 16, gnd:  8, vcc: 16 },
  '74x3125':  { pins: 14, gnd:  7, vcc: 14 },
  '74x3126':  { pins: 14, gnd:  7, vcc: 14 },
  '74FCT3244': { pins: 20, gnd: 10, vcc: 20 },
  '74FCT3245': { pins: 20, gnd: 10, vcc: 20 },
  '74LVX3245': { pins: 24, gnd: 12, vcc: 24 },
  '74x3251':  { pins: 16, gnd:  8, vcc: 16 },
  '74x3253':  { pins: 16, gnd:  8, vcc: 16 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_55 === 'object', 'CHIPS_BLOCK_55 is exported object');
assert(Object.keys(CHIPS_BLOCK_55).length === 12, 'CHIPS_BLOCK_55 has 12 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_55[id];
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

// Check openCollector flag
assert(CHIPS_BLOCK_55['74x3037'].openCollector !== true,  '74x3037: not openCollector');
assert(CHIPS_BLOCK_55['74x3038'].openCollector === true,  '74x3038: is openCollector');
assert(CHIPS_BLOCK_55['74x3040'].openCollector !== true,  '74x3040: not openCollector');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: output pins are HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_IDS = [
  '74x2970', '74x3004',
  '74x3125', '74x3126',
  '74FCT3244',
  '74FCT3245',
  '74LVX3245',
  '74x3251', '74x3253',
];

for (const id of STUB_IDS) {
  const cd = CHIPS_BLOCK_55[id];
  const outPins = cd.pinout.filter(p => p.type === 'output');
  if (outPins.length === 0) {
    assert(true, `${id} stub: no driven outputs (bidir/nc/power only) - HiZ OK`);
    continue;
  }
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
// SECTION B - 74x3037: Quad 2 input NAND logic tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x3037 Quad NAND logic ===');

{
  // Both inputs high → output LOW
  const { world, chip, wm } = setupChipWithPower('74x3037');
  connectHigh(wm, chip, 'A1'); connectHigh(wm, chip, 'B1');
  connectHigh(wm, chip, 'A2'); connectHigh(wm, chip, 'B2');
  connectHigh(wm, chip, 'A3'); connectHigh(wm, chip, 'B3');
  connectHigh(wm, chip, 'A4'); connectHigh(wm, chip, 'B4');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, 'Y1', '74x3037 HH→L gate1');
  assertPinLow(sim, chip, 'Y2', '74x3037 HH→L gate2');
  assertPinLow(sim, chip, 'Y3', '74x3037 HH→L gate3');
  assertPinLow(sim, chip, 'Y4', '74x3037 HH→L gate4');
}

{
  // One input low → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x3037');
  connectLow(wm, chip, 'A1');  connectHigh(wm, chip, 'B1');
  connectHigh(wm, chip, 'A2'); connectLow(wm, chip, 'B2');
  connectLow(wm, chip, 'A3');  connectLow(wm, chip, 'B3');
  connectLow(wm, chip, 'A4');  connectHigh(wm, chip, 'B4');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'Y1', '74x3037 LH→H gate1');
  assertPinHigh(sim, chip, 'Y2', '74x3037 HL→H gate2');
  assertPinHigh(sim, chip, 'Y3', '74x3037 LL→H gate3');
  assertPinHigh(sim, chip, 'Y4', '74x3037 LH→H gate4');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - 74x3038: Open collector NAND logic tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x3038 Open Collector NAND logic ===');

{
  // Both inputs high → output LOW (OC pulls low when FET on)
  const { world, chip, wm } = setupChipWithPower('74x3038');
  connectHigh(wm, chip, 'A1'); connectHigh(wm, chip, 'B1');
  connectHigh(wm, chip, 'A2'); connectHigh(wm, chip, 'B2');
  connectHigh(wm, chip, 'A3'); connectHigh(wm, chip, 'B3');
  connectHigh(wm, chip, 'A4'); connectHigh(wm, chip, 'B4');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, 'Y1', '74x3038 OC HH→L gate1');
  assertPinLow(sim, chip, 'Y2', '74x3038 OC HH→L gate2');
  assertPinLow(sim, chip, 'Y3', '74x3038 OC HH→L gate3');
  assertPinLow(sim, chip, 'Y4', '74x3038 OC HH→L gate4');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - 74x3040: Dual 4 input NAND logic tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x3040 Dual 4 input NAND logic ===');

{
  // All inputs high → output LOW
  const { world, chip, wm } = setupChipWithPower('74x3040');
  connectHigh(wm, chip, 'A1'); connectHigh(wm, chip, 'B1');
  connectHigh(wm, chip, 'C1'); connectHigh(wm, chip, 'D1');
  connectHigh(wm, chip, 'A2'); connectHigh(wm, chip, 'B2');
  connectHigh(wm, chip, 'C2'); connectHigh(wm, chip, 'D2');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, 'Y1', '74x3040 HHHH→L gate1');
  assertPinLow(sim, chip, 'Y2', '74x3040 HHHH→L gate2');
}

{
  // One input low → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x3040');
  connectLow(wm, chip,  'A1'); connectHigh(wm, chip, 'B1');
  connectHigh(wm, chip, 'C1'); connectHigh(wm, chip, 'D1');
  connectHigh(wm, chip, 'A2'); connectHigh(wm, chip, 'B2');
  connectHigh(wm, chip, 'C2'); connectLow(wm, chip,  'D2');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, 'Y1', '74x3040 LHHH→H gate1');
  assertPinHigh(sim, chip, 'Y2', '74x3040 HHHL→H gate2');
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
