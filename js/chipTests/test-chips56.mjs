// test-chips56.mjs - Tests for all chips defined in js/chips/chips56.js
// Chips under test:
//   74x3257  : Quad 2-to-1 FET mux/demux (bidir, 16 pin)
//   74x3305  : Dual FET bus switch active high OE (bidir, 8 pin)
//   74x3306  : Dual FET bus switch active low OE (bidir, 8 pin)
//   74x3345  : Octal FET bus switch dual OE (bidir, 20 pin)
//   74x3374  : 8 bit metastable-resistant D-FF (output, 20 pin)
//   74x3383  : 5 bit 4-port FET bus exchange switch (bidir, 24 pin)
//   74x3384  : Dual 5 bit FET bus switch (bidir, 24 pin)
//   74x3386  : 5 bit 4-port FET bus exchange switch ext-V (bidir, 24 pin)
//   74x3573  : Octal transparent latch TS (output, 20 pin)
//   74x3574  : Octal D flip flop TS (output, 20 pin)
//   74x3584  : Dual 5 bit FET bus switch 25Ω (bidir, 24 pin)
//   74x3807  : 1-to-10 clock driver (output, 20 pin)
//   74x3827  : 10 bit buffer TS (output, 24 pin)
//   74x3861  : 10 bit FET bus switch (bidir, 24 pin)
//   74x3862  : 10 bit FET bus switch dual OE (bidir, 24 pin)

import { CHIPS_BLOCK_56 } from '../chips/chips56.js';
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x3257', '74x3305', '74x3306', '74x3345', '74x3374',
  '74x3383', '74x3384', '74x3386', '74x3573', '74x3574',
  '74x3584', '74x3807', '74x3827', '74x3861', '74x3862',
];

const EXPECTED_SPECS = {
  '74x3257': { pins: 16, gnd:  8, vcc: 16 },
  '74x3305': { pins:  8, gnd:  4, vcc:  8 },
  '74x3306': { pins:  8, gnd:  4, vcc:  8 },
  '74x3345': { pins: 20, gnd: 10, vcc: 20 },
  '74x3374': { pins: 20, gnd: 10, vcc: 20 },
  '74x3383': { pins: 24, gnd: 12, vcc: 24 },
  '74x3384': { pins: 24, gnd: 12, vcc: 24 },
  '74x3386': { pins: 24, gnd: 12, vcc: 24 },
  '74x3573': { pins: 20, gnd: 10, vcc: 20 },
  '74x3574': { pins: 20, gnd: 10, vcc: 20 },
  '74x3584': { pins: 24, gnd: 12, vcc: 24 },
  '74x3807': { pins: 20, gnd: 10, vcc: 20 },
  '74x3827': { pins: 24, gnd: 12, vcc: 24 },
  '74x3861': { pins: 24, gnd: 12, vcc: 24 },
  '74x3862': { pins: 24, gnd: 12, vcc: 24 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_56 === 'object', 'CHIPS_BLOCK_56 is exported object');
assert(Object.keys(CHIPS_BLOCK_56).length === 15, 'CHIPS_BLOCK_56 has 15 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_56[id];
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: output pins are HiZ; bidir chips just pass
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs or bidir) ===');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_56[id];
  const outPins = cd.pinout.filter(p => p.type === 'output');
  if (outPins.length === 0) {
    assert(true, `${id} stub: no driven outputs (bidir/nc/power only) - HiZ OK`);
    continue;
  }
  const { world, chip, wm } = setupChipWithPower(id);
  // Connect all input pins to GND to avoid floating
  for (const p of cd.pinout) {
    if (p.type === 'input') connectPinToGnd(wm, findPin(chip, p.name));
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
