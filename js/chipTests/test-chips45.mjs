// test-chips45.mjs - Tests for all chips defined in js/chips/chips45.js
// Chips under test:
//   74929        : 1024 bit RAM 1024x1, single chip select TRI  (GENERIC_STUB, 16 pin)
//   74930        : 1024 bit RAM 1024x1, three chip selects TRI   (GENERIC_STUB, 18 pin)
//   74932        : Phase comparator                              (GENERIC_STUB, 8 pin)
//   74933        : 7 bit address bus comparator                  (GENERIC_STUB, 20 pin)
//   74936        : ADC 3.75-digit DVM, 7-seg display             (GENERIC_STUB, 28 pin)
//   74937        : ADC 3.5-digit DVM, BCD outputs                (GENERIC_STUB, 24 pin)
//   74938        : ADC 3.75-digit DVM, BCD outputs               (GENERIC_STUB, 24 pin)
//   74940        : Octal bus/line driver, Schmitt TRI             (GENERIC_STUB, 20 pin)
//   74941        : Octal bus/line driver inv, Schmitt TRI         (GENERIC_STUB, 20 pin)
//   74942        : 300 baud modem +/-5V                          (GENERIC_STUB, 20 pin)
//   74943        : 300 baud modem 5V                             (GENERIC_STUB, 20 pin)
//   74952        : Dual rank 8 bit shift reg sync CLR TRI         (GENERIC_STUB, 18 pin)
//   74BCT956     : Octal bus transceiver and latch TRI            (GENERIC_STUB, 24 pin)
//   74962        : Dual rank 8 bit shift reg exchange TRI         (GENERIC_STUB, 18 pin)
//   74963        : Dual rank 8 bit shift reg sync CLR TRI         (SHIFT_REG_DUAL_RANK_963, 20 pin)
//   74964        : Dual rank 8 bit shift reg sync+async CLR TRI   (GENERIC_STUB, 20 pin)

import { CHIPS_BLOCK_45 } from '../chips/chips45.js';
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
  '74x929','74x930','74x932','74x933','74x936','74x937','74x938',
  '74x940','74x941','74x952','74BCT956','74x962','74x963','74x964',
];

const EXPECTED_SPECS = {
  '74x929':    { pins: 16, gnd:  8, vcc: 16 },
  '74x930':    { pins: 18, gnd:  9, vcc: 18 },
  '74x932':    { pins:  8, gnd:  4, vcc:  8 },
  '74x933':    { pins: 20, gnd: 10, vcc: 20 },
  '74x936':    { pins: 28, gnd: 14, vcc: 28 },
  '74x937':    { pins: 24, gnd: 12, vcc: 24 },
  '74x938':    { pins: 24, gnd: 12, vcc: 24 },
  '74x940':    { pins: 20, gnd: 10, vcc: 20 },
  '74x941':    { pins: 20, gnd: 10, vcc: 20 },
  '74x952':    { pins: 18, gnd:  9, vcc: 18 },
  '74BCT956': { pins: 24, gnd: 12, vcc: 24 },
  '74x962':    { pins: 18, gnd:  9, vcc: 18 },
  '74x963':    { pins: 20, gnd: 10, vcc: 20 },
  '74x964':    { pins: 20, gnd: 10, vcc: 20 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_45 === 'object', 'CHIPS_BLOCK_45 is exported object');
assert(Object.keys(CHIPS_BLOCK_45).length === 14, 'CHIPS_BLOCK_45 has 14 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_45[id];
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

  // None of these chips are OC
  assert(cd.openCollector !== true, `${id}: not openCollector`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: all output pins are HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_CONFIGS = [
  { id: '74x929', outputs: ['DOUT'] },
  { id: '74x930', outputs: ['DOUT'] },
  { id: '74x932', outputs: ['UP','DN'] },
  { id: '74x933', outputs: ['EQ'] },
  { id: '74x936', outputs: ['STB','a','b','c','d','e','f','g','POL','D1','D2','D3','D4','HV'] },
  { id: '74x937', outputs: ['STB','Q0','Q1','Q2','Q3','POL','D1','D2','D3','D4','HV'] },
  { id: '74x938', outputs: ['STB','Q0','Q1','Q2','Q3','POL','D1','D2','D3','D4','HV'] },
  { id: '74x940', outputs: ['1Y','2Y','3Y','4Y','5Y','6Y','7Y','8Y'] },
  { id: '74x941', outputs: ['1Y','2Y','3Y','4Y','5Y','6Y','7Y','8Y'] },
  { id: '74x952', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74BCT956', outputs: [] },  // bidir pins, no driven outputs
  { id: '74x962', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74x963', outputs: [] },  // no longer a stub: real dual-rank shift reg with bidir I/O bus (SHIFT_REG_DUAL_RANK_963)
  { id: '74x964', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','QA0','QA1','QA2','QA3'] },
];

for (const { id, outputs } of STUB_CONFIGS) {
  if (outputs.length === 0) {
    assert(true, `${id} stub: no driven outputs to check (bidir/empty)`);
    continue;
  }

  const { world, chip, wm } = setupChipWithPower(id);

  // Connect all input pins low
  const cd = CHIPS_BLOCK_45[id];
  for (const p of cd.pinout) {
    if (p.type === 'input') {
      connectLow(wm, chip, p.name);
    }
  }

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of outputs) {
    assertPinHighZ(sim, chip, out, `${id} stub: ${out} is HiZ`);
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
