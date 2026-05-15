// test-chips42.mjs - Tests for all chips defined in js/chips/chips42.js
// Chips under test:
//   74852        : 8 bit univ transceiver port controller          (GENERIC_STUB, 24-pin)
//   74853        : 8-to-9 transceiver w/ parity latch, non-inv     (GENERIC_STUB, 24-pin)
//   74854        : 8-to-9 transceiver w/ parity latch, inv         (GENERIC_STUB, 24-pin)
//   74856        : 8 bit univ transceiver port controller w/ latch  (GENERIC_STUB, 24-pin)
//   74857        : Hex 2-to-1 multiplexer, TRI                     (GENERIC_STUB, 24-pin)
//   74861        : 10 bit bus transceiver, non-inv, TRI             (GENERIC_STUB, 24-pin)
//   74862        : 10 bit bus transceiver, inv, TRI                 (GENERIC_STUB, 24-pin)
//   74863        : 9 bit bus transceiver, non-inv, TRI              (GENERIC_STUB, 24-pin)
//   74864        : 9 bit bus transceiver, inv, TRI                  (GENERIC_STUB, 24-pin)
//   74866        : 8 bit magnitude comparator w/ latches            (GENERIC_STUB, 24-pin)
//   74867        : 8 bit sync up/down counter, async CLR            (GENERIC_STUB, 24-pin)
//   74869        : 8 bit sync up/down counter, sync CLR             (GENERIC_STUB, 24-pin)
//   74870        : Dual 16x4 register files                         (GENERIC_STUB, 24-pin)
//   74873        : Dual 4 bit transparent latch w/ clear, TRI       (GENERIC_STUB, 24-pin)
//   74874        : Dual 4 bit D-FF w/ clear, TRI                    (GENERIC_STUB, 24-pin)
//   74876        : Dual 4 bit D-FF w/ set, inv out, TRI             (GENERIC_STUB, 24-pin)

import { CHIPS_BLOCK_42 } from '../chips/chips42.js';
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
  '74852','74853','74854','74856','74857',
  '74861','74862','74863','74864',
  '74866','74867','74869','74870',
  '74873','74874','74876',
];

const EXPECTED_SPECS = {
  '74852': { pins: 24, gnd: 12, vcc: 24 },
  '74853': { pins: 24, gnd: 12, vcc: 24 },
  '74854': { pins: 24, gnd: 12, vcc: 24 },
  '74856': { pins: 24, gnd: 12, vcc: 24 },
  '74857': { pins: 24, gnd: 12, vcc: 24 },
  '74861': { pins: 24, gnd: 12, vcc: 24 },
  '74862': { pins: 24, gnd: 12, vcc: 24 },
  '74863': { pins: 24, gnd: 12, vcc: 24 },
  '74864': { pins: 24, gnd: 12, vcc: 24 },
  '74866': { pins: 24, gnd: 12, vcc: 24 },
  '74867': { pins: 24, gnd: 12, vcc: 24 },
  '74869': { pins: 24, gnd: 12, vcc: 24 },
  '74870': { pins: 24, gnd: 12, vcc: 24 },
  '74873': { pins: 24, gnd: 12, vcc: 24 },
  '74874': { pins: 24, gnd: 12, vcc: 24 },
  '74876': { pins: 24, gnd: 12, vcc: 24 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_42 === 'object', 'CHIPS_BLOCK_42 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_42[id];
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

  // No OC chips in Block 42
  assert(cd.openCollector !== true, `${id}: not openCollector`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips with real outputs: all outputs HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

// Bidir transceivers have no driven outputs - nothing to test for HiZ pins
// Only chips with actual 'output' type pins are tested here
const STUB_CONFIGS = [
  { id: '74857', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5'] },
  { id: '74866', outputs: ['AGEB','ALTB','AGTB','AEQB'] },
  { id: '74867', outputs: ['RCO','Q7','Q6','Q5','Q4','Q3','Q2'] },
  { id: '74869', outputs: ['RCO','Q7','Q6','Q5','Q4','Q3','Q2'] },
  { id: '74870', outputs: ['QA0','QA1','QA2'] },
  { id: '74873', outputs: ['Q10','Q11','Q12','Q13','Q20','Q21','Q22','Q23'] },
  { id: '74874', outputs: ['Q10','Q11','Q12','Q13','Q20','Q21','Q22','Q23'] },
  { id: '74876', outputs: ['Q10n','Q11n','Q12n','Q13n','Q20n','Q21n','Q22n','Q23n'] },
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
// SECTION B - Bidir transceiver chips: confirm they instantiate correctly
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: Bidir transceiver chips (instantiation check) ===');

const BIDIR_IDS = ['74852','74853','74854','74856','74861','74862','74863','74864'];

for (const id of BIDIR_IDS) {
  const { world, chip, wm } = setupChipWithPower(id);
  const sim = new CircuitSimulator();
  // Should not throw - bidir transceivers with empty outputs just pass through
  let threw = false;
  try { sim.evaluate(world, [chip], wm); } catch(e) { threw = true; }
  assert(!threw, `${id}: evaluate() does not throw`);
  assert(chip.pins.length > 0, `${id}: has pins after placement`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${pass} passed, ${fail} failed ===\n`);
if (fail > 0) process.exit(1);
