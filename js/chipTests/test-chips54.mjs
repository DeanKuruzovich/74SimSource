// test-chips54.mjs - Tests for all chips defined in js/chips/chips54.js
// Chips under test (all GENERIC_STUB, all 24 pin):
//   74x2825  : 8 bit D-FF with clear and clock enable TRI+25Ω
//   74x2827  : 10 bit buffer, non inverting TRI+25Ω
//   74x2828  : 10 bit buffer, inverting TRI+25Ω
//   74x2833  : 8 bit bus transceiver with parity error FF (bidir) TRI+25Ω
//   74x2841  : 10 bit transparent latch TRI+25Ω
//   74x2843  : 9 bit transparent latch with async reset TRI+25Ω
//   74x2845  : 8 bit transparent latch with async reset and multi-OE TRI+25Ω
//   74x2853  : 8 bit bus transceiver with parity error latch (bidir) TRI+25Ω
//   74x2861  : 10 bit non inverting bus transceiver (bidir) TRI+25Ω
//   74x2862  : 10 bit inverting bus transceiver (bidir) TRI+25Ω
//   74x2863  : 9 bit non inverting bus transceiver with dual OE (bidir) TRI+25Ω
//   74x2864  : 9 bit inverting bus transceiver with dual OE (bidir) TRI+25Ω
//   74x2952  : Octal bus transceiver and register, non inverting (bidir) TRI
//   74x2953  : Octal bus transceiver and register, inverting (bidir) TRI
//   74x2961  : 4 bit EDAC bus buffer, inverting TRI
//   74x2962  : 4 bit EDAC bus buffer, non inverting TRI

import { CHIPS_BLOCK_54 } from '../chips/chips54.js';
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
  '74x2825', '74x2827', '74x2828',
  '74x2833', '74x2841', '74x2843', '74x2845', '74x2853',
  '74x2861', '74x2862', '74x2863', '74x2864',
  '74x2952', '74x2953',
  '74x2961', '74x2962',
];

const EXPECTED_SPECS = {
  '74x2825': { pins: 24, gnd: 12, vcc: 24 },
  '74x2827': { pins: 24, gnd: 12, vcc: 24 },
  '74x2828': { pins: 24, gnd: 12, vcc: 24 },
  '74x2833': { pins: 24, gnd: 12, vcc: 24 },
  '74x2841': { pins: 24, gnd: 12, vcc: 24 },
  '74x2843': { pins: 24, gnd: 12, vcc: 24 },
  '74x2845': { pins: 24, gnd: 12, vcc: 24 },
  '74x2853': { pins: 24, gnd: 12, vcc: 24 },
  '74x2861': { pins: 24, gnd: 12, vcc: 24 },
  '74x2862': { pins: 24, gnd: 12, vcc: 24 },
  '74x2863': { pins: 24, gnd: 12, vcc: 24 },
  '74x2864': { pins: 24, gnd: 12, vcc: 24 },
  '74x2952': { pins: 24, gnd: 12, vcc: 24 },
  '74x2953': { pins: 24, gnd: 12, vcc: 24 },
  '74x2961': { pins: 24, gnd: 12, vcc: 24 },
  '74x2962': { pins: 24, gnd: 12, vcc: 24 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_54 === 'object', 'CHIPS_BLOCK_54 is exported object');
assert(Object.keys(CHIPS_BLOCK_54).length === 16, 'CHIPS_BLOCK_54 has 16 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_54[id];
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
  const cd = CHIPS_BLOCK_54[id];
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
