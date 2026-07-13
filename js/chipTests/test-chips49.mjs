// test-chips49.mjs - Tests for all chips defined in js/chips/chips49.js
// Chips under test (all GENERIC_STUB):
//   74x1622     : Octal bus transceiver inverting OC            (GENERIC_STUB, 20 pin)
//   74x1623     : Octal bus transceiver non-inv TRI             (GENERIC_STUB, 20 pin)
//   74x1631     : Quad bus driver complementary outputs TRI     (GENERIC_STUB, 16 pin)
//   74x1638     : Octal bus transceiver inv TRI+OC              (GENERIC_STUB, 20 pin)
//   74x1639     : Octal bus transceiver non-inv TRI+OC          (GENERIC_STUB, 20 pin)
//   74x1640     : Octal bus transceiver inv TRI                 (GENERIC_STUB, 20 pin)
//   74x1641     : Octal bus transceiver non-inv OC              (GENERIC_STUB, 20 pin)
//   74x1642     : Octal bus transceiver inv OC                  (GENERIC_STUB, 20 pin)
//   74x1643     : Octal bus transceiver inv/non-inv TRI         (GENERIC_STUB, 20 pin)
//   74x1644     : Octal bus transceiver inv/non-inv OC          (GENERIC_STUB, 20 pin)
//   74ALS1645   : Octal bus transceiver non-inv TRI             (GENERIC_STUB, 20 pin)
//   74x1779     : 8 bit bidirectional binary counter TRI        (GENERIC_STUB, 16 pin)
//   74x1801     : FM/MFM/DM encoder/decoder                     (GENERIC_STUB, 24 pin)
//   74x1803     : Quad clock driver                             (GENERIC_STUB, 14 pin)
//   74x1804     : Hex 2 input NAND driver                       (GENERIC_STUB, 20 pin)
//   74x1805     : Hex 2 input NOR driver                        (GENERIC_STUB, 20 pin)

import { CHIPS_BLOCK_49 } from '../chips/chips49.js';
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

function connectLow(wm, chip, name) {
  return connectPinToGnd(wm, findPin(chip, name));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x1622','74x1623','74x1631',
  '74x1638','74x1639','74x1640','74x1641','74x1642','74x1643','74x1644','74ALS1645',
  '74x1779','74x1801','74x1803','74x1804','74x1805',
];

const EXPECTED_SPECS = {
  '74x1622':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1623':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1631':  { pins: 16, gnd:  8, vcc: 16 },
  '74x1638':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1639':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1640':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1641':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1642':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1643':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1644':  { pins: 20, gnd: 10, vcc: 20 },
  '74ALS1645':{ pins: 20, gnd: 10, vcc: 20 },
  '74x1779':  { pins: 16, gnd:  8, vcc: 16 },
  '74x1801':  { pins: 24, gnd: 12, vcc: 24 },
  '74x1803':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1804':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1805':  { pins: 20, gnd: 10, vcc: 20 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_49 === 'object', 'CHIPS_BLOCK_49 is exported object');
assert(Object.keys(CHIPS_BLOCK_49).length === 16, 'CHIPS_BLOCK_49 has 16 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_49[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,        `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0, `${id}: description`);
  assert(typeof cd.pins        === 'number',                                `${id}: pins is number`);
  assert(Array.isArray(cd.pinout),                                          `${id}: pinout is array`);
  assert(Array.isArray(cd.gates) && cd.gates.length >= 1,                  `${id}: has gates`);
  assert(cd.openCollector !== true,                                          `${id}: not openCollector`);

  const spec = EXPECTED_SPECS[id];
  assert(cd.pins === spec.pins, `${id}: pins=${spec.pins}`);
  assert(cd.gnd  === spec.gnd,  `${id}: gnd=${spec.gnd}`);
  assert(cd.vcc  === spec.vcc,  `${id}: vcc=${spec.vcc}`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - All stub chips: output pins are HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_49[id];
  const outPins = cd.pinout.filter(p => p.type === 'output');
  if (outPins.length === 0) {
    assert(true, `${id} stub: no driven outputs (all bidir/nc/power) - HiZ OK`);
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
// Results
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
