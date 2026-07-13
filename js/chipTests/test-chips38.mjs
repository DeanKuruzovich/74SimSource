// test-chips38.mjs - Tests for all chips defined in js/chips/chips38.js
// Chips under test:
//   74724        : VCO multivibrator               (GENERIC_STUB, 8 pin)
//   74730/731    : Octal DRAM drivers               (GENERIC_STUB)
//   74732/733    : 4 bit 3-bus multiplexers          (GENERIC_STUB)
//   74734        : Octal DRAM driver                 (GENERIC_STUB)
//   74740/741    : Dual 4 bit line drivers            (GENERIC_STUB)
//   74742/743    : Octal line drivers (OC)            (GENERIC_STUB + OC)
//   74744        : Dual 4 bit line driver             (GENERIC_STUB)
//   74746/747    : Octal buffers w/ pull up           (GENERIC_STUB)
//   74748        : 8 to 3 priority encoder            (PRIORITY_ENC_8TO3_TRI)
//   74756/757    : Octal buffer/drivers (OC)          (GENERIC_STUB + OC)

import { CHIPS_BLOCK_38 } from '../chips/chips38.js';
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
  '74x724',
  '74x730','74x731',
  '74x732','74x733',
  '74x734',
  '74x740','74x741',
  '74x742','74x743',
  '74x744',
  '74x746','74x747',
  '74x748',
  '74x756','74x757',
];

const EXPECTED_SPECS = {
  '74x724': { pins:  8, gnd: 4, vcc:  8 },
  '74x730': { pins: 20, gnd:10, vcc: 20 },
  '74x731': { pins: 20, gnd:10, vcc: 20 },
  '74x732': { pins: 20, gnd:10, vcc: 20 },
  '74x733': { pins: 20, gnd:10, vcc: 20 },
  '74x734': { pins: 20, gnd:10, vcc: 20 },
  '74x740': { pins: 20, gnd:10, vcc: 20 },
  '74x741': { pins: 20, gnd:10, vcc: 20 },
  '74x742': { pins: 20, gnd:10, vcc: 20 },
  '74x743': { pins: 20, gnd:10, vcc: 20 },
  '74x744': { pins: 20, gnd:10, vcc: 20 },
  '74x746': { pins: 20, gnd:10, vcc: 20 },
  '74x747': { pins: 20, gnd:10, vcc: 20 },
  '74x748': { pins: 16, gnd: 8, vcc: 16 },
  '74x756': { pins: 20, gnd:10, vcc: 20 },
  '74x757': { pins: 20, gnd:10, vcc: 20 },
};

const OC_IDS = ['74x742','74x743','74x756','74x757'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_38 === 'object', 'CHIPS_BLOCK_38 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_38[id];
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
    assert(cd.openCollector === true, `${id}: openCollector flag set`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: all outputs HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_CONFIGS = [
  { id: '74x724', outputs: ['OUT'] },
  { id: '74x730', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x731', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x732', outputs: ['Y0','Y1','Y2','Y3'] },
  { id: '74x733', outputs: ['Y0','Y1','Y2','Y3'] },
  { id: '74x734', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x740', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x741', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x744', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x746', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x747', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
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
// SECTION B - OC Stub chips: outputs pulled HIGH via pull up
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: OC stub chips (outputs pulled HIGH) ===');

const OC_STUB_CONFIGS = [
  { id: '74x742', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x743', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x756', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  { id: '74x757', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
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
// SECTION C - 74748: 8 to 3 priority encoder (glitch-less)
// Same pinout and behavior as 74348 (reuses PRIORITY_ENC_8TO3_TRI)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74748 - 8 to 3 Priority Encoder ===');

// C1: EIn=1 (disabled) → all outputs HiZ
{
  const { world, chip, wm } = setupChipWithPower('74x748');
  connectPinHigh(wm, chip, 'EIn');
  // I0..I7 all deasserted (HIGH)
  for (let i = 0; i < 8; i++) connectPinHigh(wm, chip, `I${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['A0n','A1n','A2n','GS','EO']) {
    assertPinHighZ(sim, chip, out, `74748 EIn=1: ${out} HiZ`);
  }
}

// C2: EIn=0, no inputs asserted (all HIGH) → GS=1, EO=0, A=inactive
{
  const { world, chip, wm } = setupChipWithPower('74x748');
  connectPinLow(wm, chip, 'EIn');
  for (let i = 0; i < 8; i++) connectPinHigh(wm, chip, `I${i}`); // all deasserted
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'GS',  1, '74748 no input: GS=1 (no group select)');
  assertPinBit(sim, chip, 'EO',  0, '74748 no input: EO=0 (pass-on enable)');
  assertPinBit(sim, chip, 'A0n', 1, '74748 no input: A0n=1');
  assertPinBit(sim, chip, 'A1n', 1, '74748 no input: A1n=1');
  assertPinBit(sim, chip, 'A2n', 1, '74748 no input: A2n=1');
}

// C3: EIn=0, I7=0 (highest priority), others HIGH → A=7 encoded
{
  const { world, chip, wm } = setupChipWithPower('74x748');
  connectPinLow(wm, chip, 'EIn');
  for (let i = 0; i < 7; i++) connectPinHigh(wm, chip, `I${i}`); // I0..I6 deasserted
  connectPinLow(wm, chip, 'I7'); // assert I7
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // encode=7 (0b111): A0n=~bit0=~1=0, A1n=~bit1=~1=0, A2n=~bit2=~1=0
  assertPinBit(sim, chip, 'A0n', 0, '74748 I7=0: A0n=0 (7 bit0=1, active LOW=0)');
  assertPinBit(sim, chip, 'A1n', 0, '74748 I7=0: A1n=0 (7 bit1=1, active LOW=0)');
  assertPinBit(sim, chip, 'A2n', 0, '74748 I7=0: A2n=0 (7 bit2=1, active LOW=0)');
  assertPinBit(sim, chip, 'GS',  0, '74748 I7=0: GS=0 (group select active)');
  assertPinBit(sim, chip, 'EO',  1, '74748 I7=0: EO=1');
}

// C4: EIn=0, I0=0 only (lowest priority) → A=0
{
  const { world, chip, wm } = setupChipWithPower('74x748');
  connectPinLow(wm, chip, 'EIn');
  connectPinLow(wm, chip, 'I0'); // assert I0 (lowest priority)
  for (let i = 1; i < 8; i++) connectPinHigh(wm, chip, `I${i}`); // I1..I7 deasserted
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // encode=0 (0b000): A0n=~0=1, A1n=~0=1, A2n=~0=1
  assertPinBit(sim, chip, 'A0n', 1, '74748 I0=0: A0n=1');
  assertPinBit(sim, chip, 'A1n', 1, '74748 I0=0: A1n=1');
  assertPinBit(sim, chip, 'A2n', 1, '74748 I0=0: A2n=1');
  assertPinBit(sim, chip, 'GS',  0, '74748 I0=0: GS=0');
  assertPinBit(sim, chip, 'EO',  1, '74748 I0=0: EO=1');
}

// C5: EIn=0, I3=0 and I7=0 → priority to I7 → A=7
{
  const { world, chip, wm } = setupChipWithPower('74x748');
  connectPinLow(wm, chip, 'EIn');
  connectPinHigh(wm, chip, 'I0');
  connectPinHigh(wm, chip, 'I1');
  connectPinHigh(wm, chip, 'I2');
  connectPinLow(wm, chip,  'I3');
  connectPinHigh(wm, chip, 'I4');
  connectPinHigh(wm, chip, 'I5');
  connectPinHigh(wm, chip, 'I6');
  connectPinLow(wm, chip,  'I7');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // I7 wins priority → encode=7
  assertPinBit(sim, chip, 'A0n', 0, '74748 I3+I7=0: A0n=0 (encode=7)');
  assertPinBit(sim, chip, 'A1n', 0, '74748 I3+I7=0: A1n=0');
  assertPinBit(sim, chip, 'A2n', 0, '74748 I3+I7=0: A2n=0');
  assertPinBit(sim, chip, 'GS',  0, '74748 I3+I7=0: GS=0');
}

// C6: EIn=0, I4=0 only → encode=4 (0b100): A0n=1, A1n=1, A2n=0
{
  const { world, chip, wm } = setupChipWithPower('74x748');
  connectPinLow(wm, chip, 'EIn');
  connectPinHigh(wm, chip, 'I0');
  connectPinHigh(wm, chip, 'I1');
  connectPinHigh(wm, chip, 'I2');
  connectPinHigh(wm, chip, 'I3');
  connectPinLow(wm, chip,  'I4');
  connectPinHigh(wm, chip, 'I5');
  connectPinHigh(wm, chip, 'I6');
  connectPinHigh(wm, chip, 'I7');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // encode=4 (0b100): A0n=~bit0=~0=1, A1n=~bit1=~0=1, A2n=~bit2=~1=0
  assertPinBit(sim, chip, 'A0n', 1, '74748 I4=0: A0n=1');
  assertPinBit(sim, chip, 'A1n', 1, '74748 I4=0: A1n=1');
  assertPinBit(sim, chip, 'A2n', 0, '74748 I4=0: A2n=0');
  assertPinBit(sim, chip, 'GS',  0, '74748 I4=0: GS=0');
  assertPinBit(sim, chip, 'EO',  1, '74748 I4=0: EO=1');
}

// ── Final Report ──────────────────────────────────────────────────────────────

console.log(`\n========================================`);
console.log(`  Block 38 results: ${pass} passed, ${fail} failed`);
console.log(`========================================\n`);

if (fail > 0) process.exit(1);
