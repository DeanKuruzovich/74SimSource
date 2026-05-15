// test-chips41.mjs - Tests for all chips defined in js/chips/chips41.js
// Chips under test:
//   74826        : 8 bit D-FF, CLRn+CEN, inv in, TRI       (GENERIC_STUB, 24-pin)
//   74827        : 10 bit buffer, non-inv, TRI              (GENERIC_STUB, 24-pin)
//   74828        : 10 bit buffer, inv, TRI                  (GENERIC_STUB, 24-pin)
//   74832        : Hex 2 input OR driver                    (GENERIC_STUB, 20-pin)
//   74833        : 8-to-9 transceiver w/ parity (TRI)       (GENERIC_STUB, 24-pin)
//   74834        : 8-to-9 transceiver w/ parity, inv (TRI)  (GENERIC_STUB, 24-pin)
//   74835        : 8 bit shift reg w/ 2:1 MUX               (GENERIC_STUB, 24-pin)
//   74839        : PLA 14×32×6, TRI                         (GENERIC_STUB, 24-pin)
//   74840        : PLA 14×32×6, OC                          (GENERIC_STUB + OC, 24-pin)
//   74841        : 10 bit D-FF, TRI                         (GENERIC_STUB, 24-pin)
//   74842        : 10 bit D-FF, inv in, TRI                 (GENERIC_STUB, 24-pin)
//   74843        : 9 bit D-FF, CLRn+SET, TRI                (GENERIC_STUB, 24-pin)
//   74844        : 9 bit D-FF, CLRn+SET, inv in, TRI        (GENERIC_STUB, 24-pin)
//   74845        : 8 bit D-FF, CLRn+SET, TRI                (GENERIC_STUB, 24-pin)
//   74846        : 8 bit D-FF, CLRn+SET, inv in, TRI        (GENERIC_STUB, 24-pin)
//   74848        : 8-to-3 priority encoder (glitch-less), TRI (PRIORITY_ENC_8TO3_TRI, 16-pin)

import { CHIPS_BLOCK_41 } from '../chips/chips41.js';
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
  '74826',
  '74827','74828',
  '74832',
  '74833','74834','74835',
  '74839','74840',
  '74841','74842',
  '74843','74844',
  '74845','74846',
  '74848',
];

const EXPECTED_SPECS = {
  '74826': { pins: 24, gnd: 12, vcc: 24 },
  '74827': { pins: 24, gnd: 12, vcc: 24 },
  '74828': { pins: 24, gnd: 12, vcc: 24 },
  '74832': { pins: 20, gnd: 10, vcc: 20 },
  '74833': { pins: 24, gnd: 12, vcc: 24 },
  '74834': { pins: 24, gnd: 12, vcc: 24 },
  '74835': { pins: 24, gnd: 12, vcc: 24 },
  '74839': { pins: 24, gnd: 12, vcc: 24 },
  '74840': { pins: 24, gnd: 12, vcc: 24 },
  '74841': { pins: 24, gnd: 12, vcc: 24 },
  '74842': { pins: 24, gnd: 12, vcc: 24 },
  '74843': { pins: 24, gnd: 12, vcc: 24 },
  '74844': { pins: 24, gnd: 12, vcc: 24 },
  '74845': { pins: 24, gnd: 12, vcc: 24 },
  '74846': { pins: 24, gnd: 12, vcc: 24 },
  '74848': { pins: 16, gnd:  8, vcc: 16 },
};

const OC_IDS = ['74840'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_41 === 'object', 'CHIPS_BLOCK_41 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_41[id];
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
  { id: '74826', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74827', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9'] },
  { id: '74828', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9'] },
  { id: '74832', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5'] },
  { id: '74835', outputs: ['QSER'] },
  { id: '74839', outputs: ['O0','O1','O2','O3','O4','O5'] },
  { id: '74841', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
  { id: '74842', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
  { id: '74843', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
  { id: '74844', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
  { id: '74845', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74846', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
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
// SECTION B - OC stub chips: outputs pulled HIGH via pull up
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: OC stub chips (outputs pulled HIGH) ===');

const OC_STUB_CONFIGS = [
  { id: '74840', outputs: ['O0','O1','O2','O3','O4','O5'] },
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
// SECTION C - 74848: 8-to-3 priority encoder (same pinout/behavior as 74348/74748)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74848 - 8-to-3 Priority Encoder ===');

// C1: EIn=1 (disabled) → all outputs HiZ
{
  const { world, chip, wm } = setupChipWithPower('74848');
  connectPinHigh(wm, chip, 'EIn');
  for (let i = 0; i < 8; i++) connectPinHigh(wm, chip, `I${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['A0n','A1n','A2n','GS','EO']) {
    assertPinHighZ(sim, chip, out, `74848 EIn=1: ${out} HiZ`);
  }
}

// C2: EIn=0, all inputs HIGH (no request) → GS=HIGH, EO=LOW, Axn=HIGH
{
  const { world, chip, wm } = setupChipWithPower('74848');
  connectPinLow(wm, chip, 'EIn');
  for (let i = 0; i < 8; i++) connectPinHigh(wm, chip, `I${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'GS',  1, '74848 no-request: GS=1 (no group select)');
  assertPinBit(sim, chip, 'EO',  0, '74848 no-request: EO=0 (pass-on enable)');
  assertPinBit(sim, chip, 'A0n', 1, '74848 no-request: A0n=1');
  assertPinBit(sim, chip, 'A1n', 1, '74848 no-request: A1n=1');
  assertPinBit(sim, chip, 'A2n', 1, '74848 no-request: A2n=1');
}

// C3: EIn=0, I7=LOW (highest priority) → A2n=0, A1n=0, A0n=0 (binary 7 inverted), GS=LOW
{
  const { world, chip, wm } = setupChipWithPower('74848');
  connectPinLow(wm, chip, 'EIn');
  connectPinLow(wm, chip, 'I7');
  for (let i = 0; i < 7; i++) connectPinHigh(wm, chip, `I${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A2n', 0, '74848 I7=low: A2n=0');
  assertPinBit(sim, chip, 'A1n', 0, '74848 I7=low: A1n=0');
  assertPinBit(sim, chip, 'A0n', 0, '74848 I7=low: A0n=0');
  assertPinBit(sim, chip, 'GS',  0, '74848 I7=low: GS=LOW');
}

// C4: EIn=0, I0=LOW only → A2n=1, A1n=1, A0n=1 (binary 0 inverted), GS=LOW
{
  const { world, chip, wm } = setupChipWithPower('74848');
  connectPinLow(wm, chip, 'EIn');
  connectPinLow(wm, chip, 'I0');
  for (let i = 1; i < 8; i++) connectPinHigh(wm, chip, `I${i}`);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A2n', 1, '74848 I0=low: A2n=1');
  assertPinBit(sim, chip, 'A1n', 1, '74848 I0=low: A1n=1');
  assertPinBit(sim, chip, 'A0n', 1, '74848 I0=low: A0n=1');
  assertPinBit(sim, chip, 'GS',  0, '74848 I0=low: GS=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
