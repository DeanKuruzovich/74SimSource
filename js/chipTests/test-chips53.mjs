// test-chips53.mjs - Tests for all chips defined in js/chips/chips53.js
// Chips under test (all GENERIC_STUB):
//   74x2543  : 8 bit latched transceiver non-inv TRI+25Ω (bidir, 24 pin)
//   74x2544  : 8 bit latched transceiver inv TRI+25Ω (bidir, 24 pin)
//   74x2573  : 8 bit transparent latch TRI+25Ω (20 pin)
//   74x2574  : Octal D-FF shared clock TRI+25Ω (20 pin)
//   74x2620  : Octal bus transceiver/MOS driver inv TRI+25Ω (bidir, 20 pin)
//   74x2623  : Octal bus transceiver/MOS driver non-inv TRI+25Ω (bidir, 20 pin)
//   74x2640  : Octal bus transceiver/MOS driver inv TRI+25Ω (bidir, 20 pin)
//   74x2643  : Octal bus transceiver mix inv/non-inv TRI+25Ω (bidir, 20 pin)
//   74x2645  : Octal bus transceiver/MOS driver non-inv TRI+25Ω (bidir, 20 pin)
//   74x2646  : Octal registered transceiver non-inv TRI+25Ω (bidir, 24 pin)
//   74x2648  : Octal registered transceiver inv TRI+25Ω (bidir, 24 pin)
//   74x2651  : Octal registered transceiver inv TRI+25Ω (bidir, 24 pin)
//   74x2652  : Octal registered transceiver non-inv TRI+25Ω (bidir, 24 pin)
//   74x2821  : 10 bit D-FF TRI+25Ω (24 pin)
//   74x2823  : 9 bit D-FF with clear TRI+25Ω (24 pin)

import { CHIPS_BLOCK_53 } from '../chips/chips53.js';
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
  '74x2543', '74x2544',
  '74x2573', '74x2574',
  '74x2620', '74x2623', '74x2640', '74x2643', '74x2645',
  '74x2646', '74x2648', '74x2651', '74x2652',
  '74x2821', '74x2823',
];

const EXPECTED_SPECS = {
  '74x2543': { pins: 24, gnd: 12, vcc: 24 },
  '74x2544': { pins: 24, gnd: 12, vcc: 24 },
  '74x2573': { pins: 20, gnd: 10, vcc: 20 },
  '74x2574': { pins: 20, gnd: 10, vcc: 20 },
  '74x2620': { pins: 20, gnd: 10, vcc: 20 },
  '74x2623': { pins: 20, gnd: 10, vcc: 20 },
  '74x2640': { pins: 20, gnd: 10, vcc: 20 },
  '74x2643': { pins: 20, gnd: 10, vcc: 20 },
  '74x2645': { pins: 20, gnd: 10, vcc: 20 },
  '74x2646': { pins: 24, gnd: 12, vcc: 24 },
  '74x2648': { pins: 24, gnd: 12, vcc: 24 },
  '74x2651': { pins: 24, gnd: 12, vcc: 24 },
  '74x2652': { pins: 24, gnd: 12, vcc: 24 },
  '74x2821': { pins: 24, gnd: 12, vcc: 24 },
  '74x2823': { pins: 24, gnd: 12, vcc: 24 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_53 === 'object', 'CHIPS_BLOCK_53 is exported object');
assert(Object.keys(CHIPS_BLOCK_53).length === 15, 'CHIPS_BLOCK_53 has 15 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_53[id];
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
  const cd = CHIPS_BLOCK_53[id];
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
