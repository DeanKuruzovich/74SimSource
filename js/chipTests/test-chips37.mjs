// test-chips37.mjs - Tests for all chips defined in js/chips/chips37.js
// Chips under test:
//   74694 74699  : 4 bit counter/latch/mux stubs  (COUNTER_LATCH_MUX_STUB)
//   74700        : Octal DRAM driver, inverting    (GENERIC_STUB)
//   74701        : 8 bit reg/counter/comparator    (GENERIC_STUB)
//   74702        : 8 bit reg read-back transceiver (GENERIC_STUB)
//   74707        : 8 bit TTL-ECL shift register    (GENERIC_STUB)
//   74710        : 8 bit TTL-ECL shift register    (GENERIC_STUB)
//   74711        : Quint 2-to-1 mux, TRI           (MUX_QUINT_2TO1)
//   74712        : Quint 3-to-1 mux                (GENERIC_STUB)
//   74715        : Video sync generator             (GENERIC_STUB)
//   74716        : Programmable decade counter      (GENERIC_STUB)
//   74718        : Programmable binary counter      (GENERIC_STUB)

import { CHIPS_BLOCK_37 } from '../chips/chips37.js';
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

function disconnectWire(wm, wire) {
  if (wire) wm.removeWire(wire.id);
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
  '74x694','74x695','74x696','74x697','74x698','74x699',
  '74x700','74x701','74x702',
  '74x707','74x710',
  '74x711','74x712','74x716','74x718',
];

const SEQUENTIAL_IDS = [
  '74x694','74x695','74x696','74x697','74x698','74x699',
  '74x701','74x702','74x707','74x710','74x716','74x718',
];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_37 === 'object', 'CHIPS_BLOCK_37 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_37[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,   `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0, `${id}: description`);
  assert(typeof cd.pins        === 'number', `${id}: pins is number`);
  assert(Array.isArray(cd.pinout), `${id}: pinout is array`);
  assert(Array.isArray(cd.gates),  `${id}: gates is array`);
  assert(cd.gates.length >= 1,     `${id}: at least one gate`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }

  const vccPin = cd.pinout.find(p => p.name === 'VCC');
  const gndPin = cd.pinout.find(p => p.name === 'GND');
  assert(!!vccPin, `${id}: has VCC pin`);
  assert(!!gndPin, `${id}: has GND pin`);

  if (SEQUENTIAL_IDS.includes(id)) {
    assert(cd.sequential === true, `${id}: sequential flag`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: all outputs HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_CONFIGS = [
  { id: '74x694', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  { id: '74x695', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  { id: '74x696', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  { id: '74x697', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  // 74x698 de-stubbed: real BCD up/down counter/register/mux (COUNTER_UPDOWN_REG_MUX_TRI).
  //   See js/debug/scenarios/74x698-bcd-counter-reg-mux.mjs for its behavioral test.
  { id: '74x699', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  { id: '74x700', outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
  // 74x701 pinout corrected to the real National 54F/74F701 (shared bidirectional
  //   bus, outputs Oa=b + TC); kept a stub — no operation truth table survives. See
  //   issues.md C56 and js/debug/scenarios/74x701-reg-counter-compare-stub.mjs.
  { id: '74x701', outputs: ['Oa=b','TC'] },
  { id: '74x702', outputs: ['B0','B1','B2','B3','B4','B5','B6','B7'] },
  { id: '74x707', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74x710', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74x712', outputs: ['Y0','Y1','Y2','Y3','Y4'] },
  { id: '74x716', outputs: ['QA','QB','QC','QD','RCO'] },
  { id: '74x718', outputs: ['QA','QB','QC','QD','RCO'] },
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
// SECTION B - 74711: Quint 2-to-1 MUX
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74711 - Quint 2-to-1 MUX ===');

// B1: OEn=HIGH → all Y HiZ
{
  const { world, chip, wm } = setupChipWithPower('74x711');
  connectPinHigh(wm, chip, 'OEn');
  connectPinLow(wm, chip, 'SEL');
  for (let i = 0; i < 5; i++) {
    connectPinHigh(wm, chip, `A${i}`);
    connectPinLow(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    assertPinHighZ(sim, chip, `Y${i}`, `74711 OEn=1: Y${i} HiZ`);
  }
}

// B2: OEn=LOW, SEL=LOW → Yi = Ai
{
  const aVals = [1, 0, 1, 0, 1];
  const bVals = [0, 1, 0, 1, 0];
  const { world, chip, wm } = setupChipWithPower('74x711');
  connectPinLow(wm, chip, 'OEn');
  connectPinLow(wm, chip, 'SEL');
  for (let i = 0; i < 5; i++) {
    aVals[i] ? connectPinHigh(wm, chip, `A${i}`) : connectPinLow(wm, chip, `A${i}`);
    bVals[i] ? connectPinHigh(wm, chip, `B${i}`) : connectPinLow(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    assertPinBit(sim, chip, `Y${i}`, aVals[i], `74711 SEL=0: Y${i}=A${i}=${aVals[i]}`);
  }
}

// B3: OEn=LOW, SEL=HIGH → Yi = Bi
{
  const aVals = [0, 1, 0, 1, 0];
  const bVals = [1, 0, 1, 0, 1];
  const { world, chip, wm } = setupChipWithPower('74x711');
  connectPinLow(wm, chip, 'OEn');
  connectPinHigh(wm, chip, 'SEL');
  for (let i = 0; i < 5; i++) {
    aVals[i] ? connectPinHigh(wm, chip, `A${i}`) : connectPinLow(wm, chip, `A${i}`);
    bVals[i] ? connectPinHigh(wm, chip, `B${i}`) : connectPinLow(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    assertPinBit(sim, chip, `Y${i}`, bVals[i], `74711 SEL=1: Y${i}=B${i}=${bVals[i]}`);
  }
}

// B4: SEL=LOW, all A=0 → all Y=0
{
  const { world, chip, wm } = setupChipWithPower('74x711');
  connectPinLow(wm, chip, 'OEn');
  connectPinLow(wm, chip, 'SEL');
  for (let i = 0; i < 5; i++) {
    connectPinLow(wm, chip, `A${i}`);
    connectPinHigh(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    assertPinBit(sim, chip, `Y${i}`, 0, `74711 SEL=0 A=0: Y${i}=0`);
  }
}

// B5: SEL=HIGH, all B=1 → all Y=1
{
  const { world, chip, wm } = setupChipWithPower('74x711');
  connectPinLow(wm, chip, 'OEn');
  connectPinHigh(wm, chip, 'SEL');
  for (let i = 0; i < 5; i++) {
    connectPinLow(wm, chip, `A${i}`);
    connectPinHigh(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    assertPinBit(sim, chip, `Y${i}`, 1, `74711 SEL=1 B=1: Y${i}=1`);
  }
}

// B6: Mixed pattern SEL=LOW → Yi=Ai
{
  const aVals = [0, 1, 1, 0, 0];
  const bVals = [1, 0, 0, 1, 1];
  const { world, chip, wm } = setupChipWithPower('74x711');
  connectPinLow(wm, chip, 'OEn');
  connectPinLow(wm, chip, 'SEL');
  for (let i = 0; i < 5; i++) {
    aVals[i] ? connectPinHigh(wm, chip, `A${i}`) : connectPinLow(wm, chip, `A${i}`);
    bVals[i] ? connectPinHigh(wm, chip, `B${i}`) : connectPinLow(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    assertPinBit(sim, chip, `Y${i}`, aVals[i], `74711 mixed SEL=0: Y${i}=A${i}=${aVals[i]}`);
  }
}

// B7: Mixed pattern SEL=HIGH → Yi=Bi
{
  const aVals = [1, 0, 1, 0, 1];
  const bVals = [0, 1, 0, 1, 0];
  const { world, chip, wm } = setupChipWithPower('74x711');
  connectPinLow(wm, chip, 'OEn');
  connectPinHigh(wm, chip, 'SEL');
  for (let i = 0; i < 5; i++) {
    aVals[i] ? connectPinHigh(wm, chip, `A${i}`) : connectPinLow(wm, chip, `A${i}`);
    bVals[i] ? connectPinHigh(wm, chip, `B${i}`) : connectPinLow(wm, chip, `B${i}`);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    assertPinBit(sim, chip, `Y${i}`, bVals[i], `74711 mixed SEL=1: Y${i}=B${i}=${bVals[i]}`);
  }
}

// ── Final Report ──────────────────────────────────────────────────────────────

console.log(`\n========================================`);
console.log(`  Block 37 results: ${pass} passed, ${fail} failed`);
console.log(`========================================\n`);

if (fail > 0) process.exit(1);
