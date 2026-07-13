// test-chips51.mjs - Tests for all chips defined in js/chips/chips51.js
// Chips under test (all GENERIC_STUB):
//   74ACT2163   : Sync presettable 4 bit counter, sync clear (GENERIC_STUB, 16 pin)
//   74FCT2163   : Sync presettable 4 bit counter, sync clear 25Ω (GENERIC_STUB, 16 pin)
//   74x2191     : Sync presettable 4 bit up/down counter, 25Ω (GENERIC_STUB, 16 pin)
//   74x2193     : Sync presettable 4 bit counter sep up/dn clocks, 25Ω (GENERIC_STUB, 16 pin)
//   74x2226     : Dual 64 bit FIFO (64×1) (GENERIC_STUB, 24 pin)
//   74x2228     : Dual 256 bit FIFO (256×1) (GENERIC_STUB, 24 pin)
//   74x2232     : 512 bit FIFO (64×8) TRI (GENERIC_STUB, 24 pin)
//   74x2240     : Dual 4 bit bidir buffer inv TRI+25Ω (GENERIC_STUB, 20 pin, bidir)
//   74x2241     : Dual 4 bit bidir buffer non-inv TRI+25Ω (GENERIC_STUB, 20 pin, bidir)
//   74x2242     : 4 bit bus transceiver inv TRI+25Ω (GENERIC_STUB, 14 pin, bidir)
//   74x2243     : 4 bit bus transceiver non-inv TRI+25Ω (GENERIC_STUB, 14 pin, bidir)
//   74x2244     : Dual 4 bit buffer non-inv TRI+25Ω (GENERIC_STUB, 20 pin)
//   74x2245     : Octal bus transceiver TRI+25Ω (GENERIC_STUB, 20 pin, bidir)
//   74x2253     : Dual 4:1 mux TRI+25Ω (GENERIC_STUB, 16 pin)
//   74x2257     : Quad 2:1 mux TRI+25Ω (GENERIC_STUB, 16 pin)
//   74x2273     : Octal D-FF shared CLK+CLRn 25Ω (GENERIC_STUB, 20 pin)

import { CHIPS_BLOCK_51 } from '../chips/chips51.js';
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
  '74FCT2163',
  '74x2191','74x2193',
  '74x2226','74x2228','74x2232',
  '74x2240','74x2241',
  '74x2242','74x2243',
  '74x2244','74x2245',
  '74x2253','74x2257',
  '74x2273',
];

const EXPECTED_SPECS = {
  '74FCT2163': { pins: 16, gnd:  8, vcc: 16 },
  '74x2191':   { pins: 16, gnd:  8, vcc: 16 },
  '74x2193':   { pins: 16, gnd:  8, vcc: 16 },
  '74x2226':   { pins: 24, gnd: 12, vcc: 24 },
  '74x2228':   { pins: 24, gnd: 12, vcc: 24 },
  '74x2232':   { pins: 24, gnd: 12, vcc: 24 },
  '74x2240':   { pins: 20, gnd: 10, vcc: 20 },
  '74x2241':   { pins: 20, gnd: 10, vcc: 20 },
  '74x2242':   { pins: 14, gnd:  7, vcc: 14 },
  '74x2243':   { pins: 14, gnd:  7, vcc: 14 },
  '74x2244':   { pins: 20, gnd: 10, vcc: 20 },
  '74x2245':   { pins: 20, gnd: 10, vcc: 20 },
  '74x2253':   { pins: 16, gnd:  8, vcc: 16 },
  '74x2257':   { pins: 16, gnd:  8, vcc: 16 },
  '74x2273':   { pins: 20, gnd: 10, vcc: 20 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_51 === 'object', 'CHIPS_BLOCK_51 is exported object');
assert(Object.keys(CHIPS_BLOCK_51).length === 15, 'CHIPS_BLOCK_51 has 15 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_51[id];
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
  const cd = CHIPS_BLOCK_51[id];
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
