// test-chips40.mjs - Tests for all chips defined in js/chips/chips40.js
// Chips under test:
//   74802        : Triple 4 input OR/NOR driver             (GENERIC_STUB, 20-pin)
//   74803        : Quad D flip-flop                         (GENERIC_STUB, 14-pin)
//   74804        : Hex 2 input NAND driver                  (GENERIC_STUB, 20-pin)
//   74805        : Hex 2 input NOR driver                   (GENERIC_STUB, 20-pin)
//   74807        : 1-to-10 clock driver                     (GENERIC_STUB, 20-pin)
//   74808        : Hex 2 input AND driver                   (GENERIC_STUB, 20-pin)
//   74810        : Quad 2 input XNOR                        (GENERIC_STUB, 14-pin)
//   74811        : Quad 2 input XNOR, OC                    (GENERIC_STUB + OC, 14-pin)
//   74817        : GTL+/LV-TTL fanout driver                (GENERIC_STUB, 24-pin)
//   74818        : 8 bit diagnostic register                (GENERIC_STUB, 24-pin)
//   74819        : 8 bit diagnostic/pipeline register       (GENERIC_STUB, 24-pin)
//   74821        : 10 bit bus interface FF                  (GENERIC_STUB, 24-pin)
//   74822        : 10 bit bus interface FF, inv in          (GENERIC_STUB, 24-pin)
//   74823        : 9 bit D-FF w/ CLRn+CEN                  (GENERIC_STUB, 24-pin)
//   74824        : 9 bit D-FF w/ CLRn+CEN, inv in          (GENERIC_STUB, 24-pin)
//   74825        : 8 bit D-FF w/ CLRn+CEN                  (GENERIC_STUB, 24-pin)

import { CHIPS_BLOCK_40 } from '../chips/chips40.js';
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74802',
  '74804','74805',
  '74807','74808',
  '74810','74811',
  '74817',
  '74818','74819',
  '74821','74822',
  '74823','74824','74825',
];

const EXPECTED_SPECS = {
  '74802': { pins: 20, gnd: 10, vcc: 20 },
  '74804': { pins: 20, gnd: 10, vcc: 20 },
  '74805': { pins: 20, gnd: 10, vcc: 20 },
  '74807': { pins: 20, gnd: 10, vcc: 20 },
  '74808': { pins: 20, gnd: 10, vcc: 20 },
  '74810': { pins: 14, gnd:  7, vcc: 14 },
  '74811': { pins: 14, gnd:  7, vcc: 14 },
  '74817': { pins: 24, gnd: 12, vcc: 24 },
  '74818': { pins: 24, gnd: 12, vcc: 24 },
  '74819': { pins: 24, gnd: 12, vcc: 24 },
  '74821': { pins: 24, gnd: 12, vcc: 24 },
  '74822': { pins: 24, gnd: 12, vcc: 24 },
  '74823': { pins: 24, gnd: 12, vcc: 24 },
  '74824': { pins: 24, gnd: 12, vcc: 24 },
  '74825': { pins: 24, gnd: 12, vcc: 24 },
};

const OC_IDS = ['74811'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_40 === 'object', 'CHIPS_BLOCK_40 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_40[id];
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
  { id: '74802', outputs: ['Y0','Y0n','Y1','Y1n','Y2','Y2n'] },
  { id: '74804', outputs: ['Y0n','Y1n','Y2n','Y3n','Y4n','Y5n'] },
  { id: '74805', outputs: ['Y0n','Y1n','Y2n','Y3n','Y4n','Y5n'] },
  { id: '74807', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9'] },
  { id: '74808', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5'] },
  { id: '74810', outputs: ['Y0','Y1','Y2','Y3'] },
  { id: '74817', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','B0','B1'] },
  { id: '74818', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74819', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74821', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
  { id: '74822', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
  { id: '74823', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
  { id: '74824', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
  { id: '74825', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
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
  { id: '74811', outputs: ['Y0','Y1','Y2','Y3'] },
];

for (const { id, outputs } of OC_STUB_CONFIGS) {
  const { world, chip, wm } = setupChipWithPower(id);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of outputs) {
    assertPinBit(sim, chip, out, 1, `${id} OC stub: ${out} pulled HIGH`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
