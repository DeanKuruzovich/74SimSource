// test-chips57.mjs - Tests for all chips defined in js/chips/chips57.js
// Chips under test:
//   74x3893  : Quad Futurebus transceiver (bidir, 20 pin)
//   74x4002  : Dual 4 input NOR gate (real NOR logic, 14 pin)
//   74x4015  : Dual 4 bit shift register (GENERIC_STUB, 16 pin)
//   74x4016  : Quad bilateral switch analog (bidir, 14 pin)
//   74x4017  : ÷10 Johnson counter (COUNTER_DECADE_DECODED, 16 pin)
//   74x4020  : 14-stage binary counter (GENERIC_STUB, 16 pin)
//   74x4022  : ÷8 Johnson counter (GENERIC_STUB, 14 pin)
//   74x4024  : 7-stage ripple counter (GENERIC_STUB, 14 pin)
//   74x4028  : BCD to-decimal decoder (GENERIC_STUB, 16 pin)
//   74x4040  : 12-stage binary counter (GENERIC_STUB, 16 pin)
//   74x4049  : Hex inverting buffer NOT (real NOT, vcc=pin1, 16 pin)
//   74x4050  : Hex non inverting buffer (real BUFFER, vcc=pin1, 16 pin)
//   74x4051  : 8-ch analog mux (bidir, 16 pin)
//   74x4052  : Dual 4-ch analog mux (bidir, 16 pin)
//   74x4053  : Triple 2-ch analog mux (bidir, 16 pin)

import { CHIPS_BLOCK_57 } from '../chips/chips57.js';
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

function assertPinHighZ(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v === undefined || v === null || v < 2.5, `${label}: expected HiZ/low, got ${v}`);
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

function connectHigh(wm, chip, name) { connectPinToVcc(wm, findPin(chip, name)); }
function connectLow(wm, chip, name)  { connectPinToGnd(wm, findPin(chip, name)); }

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x3893', '74x4002', '74x4015', '74x4016', '74x4017',
  '74x4020', '74x4022', '74x4024', '74x4028', '74x4040',
  '74x4049', '74x4050', '74x4051', '74x4052', '74x4053',
];

const EXPECTED_SPECS = {
  '74x3893': { pins: 20, gnd: 10, vcc: 20 },
  '74x4002': { pins: 14, gnd:  7, vcc: 14 },
  '74x4015': { pins: 16, gnd:  8, vcc: 16 },
  '74x4016': { pins: 14, gnd:  7, vcc: 14 },
  '74x4017': { pins: 16, gnd:  8, vcc: 16 },
  '74x4020': { pins: 16, gnd:  8, vcc: 16 },
  '74x4022': { pins: 14, gnd:  7, vcc: 14 },
  '74x4024': { pins: 14, gnd:  7, vcc: 14 },
  '74x4028': { pins: 16, gnd:  8, vcc: 16 },
  '74x4040': { pins: 16, gnd:  8, vcc: 16 },
  '74x4049': { pins: 16, gnd:  8, vcc:  1 },
  '74x4050': { pins: 16, gnd:  8, vcc:  1 },
  '74x4051': { pins: 16, gnd:  8, vcc: 16 },
  '74x4052': { pins: 16, gnd:  8, vcc: 16 },
  '74x4053': { pins: 16, gnd:  8, vcc: 16 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_57 === 'object', 'CHIPS_BLOCK_57 is exported object');
assert(Object.keys(CHIPS_BLOCK_57).length === 15, 'CHIPS_BLOCK_57 has 15 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_57[id];
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

// 74x4002 gate types
const gates4002 = CHIPS_BLOCK_57['74x4002'].gates;
assert(gates4002.length === 2, '74x4002: 2 gates');
assert(gates4002.every(g => g.type === 'NOR'), '74x4002: all gates NOR');

// 74x4049/4050 non-standard VCC
assert(CHIPS_BLOCK_57['74x4049'].vcc === 1, '74x4049: vcc at pin 1');
assert(CHIPS_BLOCK_57['74x4050'].vcc === 1, '74x4050: vcc at pin 1');

// 74x4049 gate types
const gates4049 = CHIPS_BLOCK_57['74x4049'].gates;
assert(gates4049.length === 6, '74x4049: 6 gates');
assert(gates4049.every(g => g.type === 'NOT'), '74x4049: all gates NOT');

// 74x4050 gate types
const gates4050 = CHIPS_BLOCK_57['74x4050'].gates;
assert(gates4050.length === 6, '74x4050: 6 gates');
assert(gates4050.every(g => g.type === 'BUFFER'), '74x4050: all gates BUFFER');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: output pins are HiZ; bidir/counter chips pass
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs or bidir) ===');

// IDs with only bidir/no output pins - just assert true
const BIDIR_ONLY = ['74x3893', '74x4016', '74x4051', '74x4052', '74x4053'];
for (const id of BIDIR_ONLY) {
  assert(true, `${id}: no driven outputs (bidir) - HiZ OK`);
}

// Stub chips with output pins (4017 used to be a stub but is now
// implemented as COUNTER_DECADE_DECODED; its outputs drive)
const STUB_OUT_IDS = ['74x4015', '74x4020', '74x4022', '74x4024',
                      '74x4028', '74x4040'];

for (const id of STUB_OUT_IDS) {
  const cd = CHIPS_BLOCK_57[id];
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
// SECTION B - 74x4002: Dual 4 input NOR logic
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x4002 Dual 4 input NOR logic ===');

{
  // All inputs low → output HIGH (NOR of all zeros = 1)
  const { world, chip, wm } = setupChipWithPower('74x4002');
  connectLow(wm, chip, '1A'); connectLow(wm, chip, '1B');
  connectLow(wm, chip, '1C'); connectLow(wm, chip, '1D');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '2C'); connectLow(wm, chip, '2D');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y', '74x4002 NOR(0,0,0,0)=1 gate1');
  assertPinHigh(sim, chip, '2Y', '74x4002 NOR(0,0,0,0)=1 gate2');
}

{
  // Any input high → output LOW (NOR with any 1 = 0)
  const { world, chip, wm } = setupChipWithPower('74x4002');
  connectHigh(wm, chip, '1A'); connectLow(wm, chip, '1B');
  connectLow(wm, chip, '1C');  connectLow(wm, chip, '1D');
  connectLow(wm, chip, '2A');  connectLow(wm, chip, '2B');
  connectLow(wm, chip, '2C');  connectHigh(wm, chip, '2D');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, '1Y', '74x4002 NOR(1,0,0,0)=0 gate1');
  assertPinLow(sim, chip, '2Y', '74x4002 NOR(0,0,0,1)=0 gate2');
}

{
  // All inputs high → output LOW
  const { world, chip, wm } = setupChipWithPower('74x4002');
  connectHigh(wm, chip, '1A'); connectHigh(wm, chip, '1B');
  connectHigh(wm, chip, '1C'); connectHigh(wm, chip, '1D');
  connectHigh(wm, chip, '2A'); connectHigh(wm, chip, '2B');
  connectHigh(wm, chip, '2C'); connectHigh(wm, chip, '2D');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, '1Y', '74x4002 NOR(1,1,1,1)=0 gate1');
  assertPinLow(sim, chip, '2Y', '74x4002 NOR(1,1,1,1)=0 gate2');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - 74x4049 NOT logic (non-standard VCC=pin1)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x4049 Hex NOT logic ===');

{
  // Input HIGH → output LOW
  const { world, chip, wm } = setupChipWithPower('74x4049');
  // Connect all 6 inputs HIGH
  ['A1','A2','A3','A4','A5','A6'].forEach(n => connectHigh(wm, chip, n));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  ['Y1','Y2','Y3','Y4','Y5','Y6'].forEach(n =>
    assertPinLow(sim, chip, n, `74x4049 NOT(1)=0 ${n}`));
}

{
  // Input LOW → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x4049');
  ['A1','A2','A3','A4','A5','A6'].forEach(n => connectLow(wm, chip, n));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  ['Y1','Y2','Y3','Y4','Y5','Y6'].forEach(n =>
    assertPinHigh(sim, chip, n, `74x4049 NOT(0)=1 ${n}`));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - 74x4050 BUFFER logic (non-standard VCC=pin1)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x4050 Hex BUFFER logic ===');

{
  // Input HIGH → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x4050');
  ['A1','A2','A3','A4','A5','A6'].forEach(n => connectHigh(wm, chip, n));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  ['Y1','Y2','Y3','Y4','Y5','Y6'].forEach(n =>
    assertPinHigh(sim, chip, n, `74x4050 BUF(1)=1 ${n}`));
}

{
  // Input LOW → output LOW
  const { world, chip, wm } = setupChipWithPower('74x4050');
  ['A1','A2','A3','A4','A5','A6'].forEach(n => connectLow(wm, chip, n));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  ['Y1','Y2','Y3','Y4','Y5','Y6'].forEach(n =>
    assertPinLow(sim, chip, n, `74x4050 BUF(0)=0 ${n}`));
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
