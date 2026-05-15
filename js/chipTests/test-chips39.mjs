// test-chips39.mjs - Tests for all chips defined in js/chips/chips39.js
// Chips under test:
//   74758        : Quad bus transceiver, inverting, OC        (GENERIC_STUB + OC, 14-pin)
//   74759        : Quad bus transceiver, non-inverting, OC    (GENERIC_STUB + OC, 14-pin)
//   74760        : Octal buffer, non-inverting, OC            (GENERIC_STUB + OC, 20-pin)
//   74762        : Octal buffer, inv+non-inv, OC              (GENERIC_STUB + OC, 20-pin)
//   74763        : Octal buffer, inverting, comp.en, OC       (GENERIC_STUB + OC, 20-pin)
//   74777        : Triple latched transceiver, TRI+OC         (GENERIC_STUB, 20-pin)
//   74779        : 8 bit bidirectional counter, TRI           (GENERIC_STUB, 16-pin)
//   74784        : 8 bit multiplier/adder                     (GENERIC_STUB, 20-pin)
//   74786        : 4 input asynchronous bus arbiter           (GENERIC_STUB, 16-pin)
//   74793        : 8 bit latch, readback                      (GENERIC_STUB, 20-pin)
//   74794        : 8 bit register, readback                   (GENERIC_STUB, 20-pin)
//   74795        : Octal buffer, non-inv, shared en, TRI      (GENERIC_STUB, 20-pin)
//   74796        : Octal buffer, inv, shared en, TRI          (GENERIC_STUB, 20-pin)
//   74797        : Octal buffer, non-inv, split en, TRI       (GENERIC_STUB, 20-pin)
//   74798        : Octal buffer, inv, split en, TRI           (GENERIC_STUB, 20-pin)
//   74800        : Triple 4 input AND/NAND driver             (GENERIC_STUB, 20-pin)

import { CHIPS_BLOCK_39 } from '../chips/chips39.js';
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

function assertPinBit(sim, chip, pinName, expectedBit, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  const ok = expectedBit ? (v !== undefined && v > 2.5) : (v === undefined || v < 2.5);
  assert(ok, `${label}: expected ${expectedBit ? 'HIGH' : 'LOW'}, got ${v}`);
}

function assertPinHighZ(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  const ok = (v === undefined || v === null || v < 2.5);
  assert(ok, `${label}: expected HiZ/low, got ${v}`);
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

function connectPinHigh(wm, chip, name) {
  return connectPinToVcc(wm, findPin(chip, name));
}

function connectPinLow(wm, chip, name) {
  return connectPinToGnd(wm, findPin(chip, name));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74758','74759',
  '74760',
  '74762','74763',
  '74777',
  '74779',
  '74784',
  '74786',
  '74793','74794',
  '74795','74796',
  '74797','74798',
  '74800',
];

const EXPECTED_SPECS = {
  '74758': { pins: 14, gnd:  7, vcc: 14 },
  '74759': { pins: 14, gnd:  7, vcc: 14 },
  '74760': { pins: 20, gnd: 10, vcc: 20 },
  '74762': { pins: 20, gnd: 10, vcc: 20 },
  '74763': { pins: 20, gnd: 10, vcc: 20 },
  '74777': { pins: 20, gnd: 10, vcc: 20 },
  '74779': { pins: 16, gnd:  8, vcc: 16 },
  '74784': { pins: 20, gnd: 10, vcc: 20 },
  '74786': { pins: 16, gnd:  8, vcc: 16 },
  '74793': { pins: 20, gnd: 10, vcc: 20 },
  '74794': { pins: 20, gnd: 10, vcc: 20 },
  '74795': { pins: 20, gnd: 10, vcc: 20 },
  '74796': { pins: 20, gnd: 10, vcc: 20 },
  '74797': { pins: 20, gnd: 10, vcc: 20 },
  '74798': { pins: 20, gnd: 10, vcc: 20 },
  '74800': { pins: 20, gnd: 10, vcc: 20 },
};

const OC_IDS = ['74758','74759','74760','74762','74763'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_39 === 'object', 'CHIPS_BLOCK_39 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_39[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,          `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0,   `${id}: description`);
  assert(typeof cd.pins        === 'number',                                  `${id}: pins is number`);
  assert(Array.isArray(cd.pinout),                                            `${id}: pinout is array`);
  assert(Array.isArray(cd.gates) && cd.gates.length >= 1,                    `${id}: has gates`);

  const spec = EXPECTED_SPECS[id];
  assert(cd.pins === spec.pins, `${id}: pins=${spec.pins}`);
  assert(cd.gnd  === spec.gnd,  `${id}: gnd=${spec.gnd}`);
  assert(cd.vcc  === spec.vcc,  `${id}: vcc=${spec.vcc}`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }

  if (OC_IDS.includes(id)) {
    assert(cd.openCollector === true, `${id}: openCollector flag set at chip level`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Non-OC stub chips: all outputs HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_CONFIGS = [
  { id: '74777', outputs: ['B0','B1','B2'] },
  { id: '74779', outputs: ['D0','D1','D2','D3','D4','D5','D6','D7','TC'] },
  { id: '74784', outputs: ['S0','S1','S2','S3','S4','S5','S6','S7','OVF'] },
  { id: '74786', outputs: ['GNT0n','GNT1n','GNT2n','GNT3n'] },
  { id: '74793', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74794', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74795', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74796', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74797', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74798', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74800', outputs: ['Y0','Y0n','Y1','Y1n','Y2','Y2n'] },
];

for (const { id, outputs } of STUB_CONFIGS) {
  const { world, chip, wm } = setupChipWithPower(id);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of outputs) {
    assertPinHighZ(sim, chip, out, `${id} stub: ${out} is HiZ`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - OC stub chips: outputs released (pulled HIGH via pull up)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: OC stub chips (outputs pulled HIGH) ===');

const OC_STUB_CONFIGS = [
  { id: '74758', outputs: ['B0','B1','B2','B3'] },
  { id: '74759', outputs: ['B0','B1','B2','B3'] },
  { id: '74760', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74762', outputs: ['Y4','Y4n','Y5','Y5n','Y6','Y6n','Y7','Y7n'] },
  { id: '74763', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
];

for (const { id, outputs } of OC_STUB_CONFIGS) {
  const { world, chip, wm } = setupChipWithPower(id);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of outputs) {
    // OC stub: all outputs HiZ → pulled HIGH via 4.7kΩ pull up
    assertPinBit(sim, chip, out, 1, `${id} OC stub: ${out} pulled HIGH`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
