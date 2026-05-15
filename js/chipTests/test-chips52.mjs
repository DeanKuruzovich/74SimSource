// test-chips52.mjs - Tests for all chips defined in js/chips/chips52.js
// Chips under test (all GENERIC_STUB):
//   74x2299     : 8 bit universal shift register TRI+25Ω (GENERIC_STUB, 20-pin)
//   74x2323     : Dual line receiver, analog input (GENERIC_STUB, 8-pin)
//   74x2373     : 8 bit transparent latch TRI+25Ω (GENERIC_STUB, 20-pin)
//   74x2374     : Octal D-FF shared clock TRI+25Ω (GENERIC_STUB, 20-pin)
//   74x2377     : 8 bit register clock enable 25Ω (GENERIC_STUB, 20-pin)
//   74x2400     : Dual 4 bit buffer inv Schmitt TRI (GENERIC_STUB, 20-pin)
//   74x2414     : Dual 2-to-4 decoder + supply monitor (GENERIC_STUB, 20-pin)
//   74x2442     : NuBus block device address generator TRI (GENERIC_STUB, 20-pin)
//   74x2509     : 9-output clock driver with PLL TRI (GENERIC_STUB, 24-pin)
//   74x2510     : 10-output clock driver with PLL TRI (GENERIC_STUB, 24-pin)
//   74x2525     : 8-output clock driver (GENERIC_STUB, 14-pin)
//   74x2526     : 8-output clock driver with input mux (GENERIC_STUB, 16-pin)
//   74x2533     : 8 bit bus interface latch inv TRI+25Ω (GENERIC_STUB, 20-pin)
//   74x2534     : 8 bit bus interface register inv TRI+25Ω (GENERIC_STUB, 20-pin)
//   74x2540     : 8 bit buffer/line driver inv TRI+25Ω (GENERIC_STUB, 20-pin)
//   74x2541     : 8 bit buffer/line driver non-inv TRI+25Ω (GENERIC_STUB, 20-pin)

import { CHIPS_BLOCK_52 } from '../chips/chips52.js';
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
  '74x2299','74x2323',
  '74x2373','74x2374','74x2377',
  '74x2400','74x2414','74x2442',
  '74x2509','74x2510',
  '74x2525','74x2526',
  '74x2533','74x2534',
  '74x2540','74x2541',
];

const EXPECTED_SPECS = {
  '74x2299': { pins: 20, gnd: 10, vcc: 20 },
  '74x2323': { pins:  8, gnd:  4, vcc:  8 },
  '74x2373': { pins: 20, gnd: 10, vcc: 20 },
  '74x2374': { pins: 20, gnd: 10, vcc: 20 },
  '74x2377': { pins: 20, gnd: 10, vcc: 20 },
  '74x2400': { pins: 20, gnd: 10, vcc: 20 },
  '74x2414': { pins: 20, gnd: 10, vcc: 20 },
  '74x2442': { pins: 20, gnd: 10, vcc: 20 },
  '74x2509': { pins: 24, gnd: 12, vcc: 24 },
  '74x2510': { pins: 24, gnd: 12, vcc: 24 },
  '74x2525': { pins: 14, gnd:  7, vcc: 14 },
  '74x2526': { pins: 16, gnd:  8, vcc: 16 },
  '74x2533': { pins: 20, gnd: 10, vcc: 20 },
  '74x2534': { pins: 20, gnd: 10, vcc: 20 },
  '74x2540': { pins: 20, gnd: 10, vcc: 20 },
  '74x2541': { pins: 20, gnd: 10, vcc: 20 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_52 === 'object', 'CHIPS_BLOCK_52 is exported object');
assert(Object.keys(CHIPS_BLOCK_52).length === 16, 'CHIPS_BLOCK_52 has 16 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_52[id];
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
  const cd = CHIPS_BLOCK_52[id];
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
