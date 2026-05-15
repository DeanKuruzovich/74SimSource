// test-chips64.mjs - Tests for all chips defined in js/chips/chips64.js
// Implemented: 74x9014, 74x9015, 74x9034, 74x9035, 74x9114, 74x9115, 74x9134,
//              74x8244, 74x8245, 74x8373, 74x8374, 74x8541, 74x8996, 74x9046
// Stubs: 74x8980, 74x9000

import { CHIPS_BLOCK_64 } from '../chips/chips64.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else      { fail++; console.error(`  ✗ ${msg}`); }
}

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
function assertPinHigh(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v >= 2.5, `${label}: expected HIGH, got ${v}`);
}
function assertPinLow(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v < 2.5, `${label}: expected LOW, got ${v}`);
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
function connectHigh(wm, chip, name) { return connectPinToVcc(wm, findPin(chip, name)); }
function connectLow(wm, chip, name)  { return connectPinToGnd(wm, findPin(chip, name)); }
function disconnectPin(wm, chip, name) {
  const pin = findPin(chip, name);
  const wires = wm.getWiresAtHole(pin.holeId);
  for (const w of wires) wm.removeWire(w.id);
}
function reconnectHigh(wm, chip, name) { disconnectPin(wm, chip, name); return connectHigh(wm, chip, name); }
function reconnectLow(wm, chip, name)  { disconnectPin(wm, chip, name); return connectLow(wm, chip, name); }
function simulate(world, wm, chips) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, Array.isArray(chips) ? chips : [chips], wm);
  return sim;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x8244', '74x8245', '74x8373', '74x8374', '74x8541',
  '74x8980', '74x8996', '74x9000', '74x9014', '74x9015',
  '74x9034', '74x9035', '74x9046', '74x9114', '74x9115', '74x9134',
];

const EXPECTED_SPECS = {
  '74x8244': { pins: 24, gnd: 12, vcc: 24 },
  '74x8245': { pins: 24, gnd: 12, vcc: 24 },
  '74x8373': { pins: 24, gnd: 12, vcc: 24 },
  '74x8374': { pins: 24, gnd: 12, vcc: 24 },
  '74x8541': { pins: 20, gnd: 10, vcc: 20 },
  '74x8980': { pins: 24, gnd: 12, vcc: 24 },
  '74x8996': { pins: 24, gnd: 12, vcc: 24 },
  '74x9000': { pins: 20, gnd: 10, vcc: 20 },
  '74x9014': { pins: 20, gnd: 10, vcc: 20 },
  '74x9015': { pins: 20, gnd: 10, vcc: 20 },
  '74x9034': { pins: 20, gnd: 10, vcc: 20 },
  '74x9035': { pins: 20, gnd: 10, vcc: 20 },
  '74x9046': { pins: 16, gnd:  8, vcc: 16 },
  '74x9114': { pins: 20, gnd: 10, vcc: 20 },
  '74x9115': { pins: 20, gnd: 10, vcc: 20 },
  '74x9134': { pins: 20, gnd: 10, vcc: 20 },
};

const OC_CHIPS = ['74x9114', '74x9115', '74x9134'];

console.log('\n=== SECTION S: Structure ===');

// S1 - 16 entries
{
  const keys = Object.keys(CHIPS_BLOCK_64);
  assert(keys.length === 16, `S1: block has ${keys.length} entries, expected 16`);
}
// S2 - All expected IDs present
for (const id of EXPECTED_IDS) {
  assert(!!CHIPS_BLOCK_64[id], `S2: '${id}' present`);
}
// S3 - Names start with 74
for (const key of Object.keys(CHIPS_BLOCK_64)) {
  const def = CHIPS_BLOCK_64[key];
  assert(def.name && def.name.startsWith('74'), `S3: key=${key} name starts with 74`);
}
// S4 - Pin counts, VCC, GND
for (const [id, spec] of Object.entries(EXPECTED_SPECS)) {
  const def = CHIPS_BLOCK_64[id];
  if (!def) continue;
  assert(def.pins === spec.pins, `S4: ${id} pins=${def.pins} expected ${spec.pins}`);
  assert(def.gnd === spec.gnd, `S4: ${id} gnd=${def.gnd} expected ${spec.gnd}`);
  assert(def.vcc === spec.vcc, `S4: ${id} vcc=${def.vcc} expected ${spec.vcc}`);
}
// S5 - All have gates array
for (const key of Object.keys(CHIPS_BLOCK_64)) {
  const def = CHIPS_BLOCK_64[key];
  assert(Array.isArray(def.gates), `S5: ${key} has gates array`);
}
// S6 - All have pinout array
for (const key of Object.keys(CHIPS_BLOCK_64)) {
  const def = CHIPS_BLOCK_64[key];
  assert(Array.isArray(def.pinout), `S6: ${key} has pinout array`);
}
// S7 - All have tags array
for (const key of Object.keys(CHIPS_BLOCK_64)) {
  const def = CHIPS_BLOCK_64[key];
  assert(Array.isArray(def.tags), `S7: ${key} has tags array`);
}
// S8 - All have simpleName
for (const key of Object.keys(CHIPS_BLOCK_64)) {
  const def = CHIPS_BLOCK_64[key];
  assert(typeof def.simpleName === 'string' && def.simpleName.length > 0, `S8: ${key} has simpleName`);
}
// S9 - All have description
for (const key of Object.keys(CHIPS_BLOCK_64)) {
  const def = CHIPS_BLOCK_64[key];
  assert(typeof def.description === 'string' && def.description.length > 0, `S9: ${key} has description`);
}
// S10 - OC chips have openCollector flag
for (const id of OC_CHIPS) {
  const def = CHIPS_BLOCK_64[id];
  assert(def && def.openCollector === true, `S10: ${id} has openCollector: true`);
}
// S11 - Non-OC chips should NOT have openCollector flag
for (const key of Object.keys(CHIPS_BLOCK_64)) {
  if (OC_CHIPS.includes(key)) continue;
  const def = CHIPS_BLOCK_64[key];
  assert(!def.openCollector, `S11: ${key} should not have openCollector`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION P - Placement
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION P: Placement ===');

for (const id of EXPECTED_IDS) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(id);
  let placed = false;
  try { chip.place(0, 0, 10, 4); placed = true; } catch (e) { /* skip */ }
  assert(placed, `P1: ${id} places without error`);
  if (placed) {
    const vcc = findPin(chip, 'VCC');
    const gnd = findPin(chip, 'GND');
    assert(!!vcc, `P2: ${id} has VCC pin`);
    assert(!!gnd, `P3: ${id} has GND pin`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - Basic nine-wide inverter tests (74x9014, 74x9034)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: Nine-wide inverters ===');

for (const chipId of ['74x9014', '74x9034']) {
  // B1 - All inputs LOW → all outputs HIGH (inverted)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinHigh(sim, chip, `Y${i}`, `B1-${chipId}: A${i}=L → Y${i}=H`);
    }
  }

  // B2 - All inputs HIGH → all outputs LOW
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinLow(sim, chip, `Y${i}`, `B2-${chipId}: A${i}=H → Y${i}=L`);
    }
  }

  // B3 - Each channel independently
  for (let ch = 1; ch <= 9; ch++) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) {
      if (i === ch) connectHigh(wm, chip, `A${i}`);
      else connectLow(wm, chip, `A${i}`);
    }
    const sim = simulate(world, wm, chip);
    assertPinLow(sim, chip, `Y${ch}`, `B3-${chipId}: ch${ch} HIGH→LOW`);
    for (let i = 1; i <= 9; i++) {
      if (i !== ch) assertPinHigh(sim, chip, `Y${i}`, `B3-${chipId}: ch${i} still HIGH`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - Basic nine-wide buffer tests (74x9015, 74x9035)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: Nine-wide buffers ===');

for (const chipId of ['74x9015', '74x9035']) {
  // C1 - All inputs LOW → all outputs LOW (buffered)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinLow(sim, chip, `Y${i}`, `C1-${chipId}: A${i}=L → Y${i}=L`);
    }
  }

  // C2 - All inputs HIGH → all outputs HIGH
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinHigh(sim, chip, `Y${i}`, `C2-${chipId}: A${i}=H → Y${i}=H`);
    }
  }

  // C3 - Each channel independently
  for (let ch = 1; ch <= 9; ch++) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) {
      if (i === ch) connectHigh(wm, chip, `A${i}`);
      else connectLow(wm, chip, `A${i}`);
    }
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, `Y${ch}`, `C3-${chipId}: ch${ch} HIGH→HIGH`);
    for (let i = 1; i <= 9; i++) {
      if (i !== ch) assertPinLow(sim, chip, `Y${i}`, `C3-${chipId}: ch${i} still LOW`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - OC nine-wide inverters (74x9114, 74x9134)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: OC nine-wide inverters ===');

for (const chipId of ['74x9114', '74x9134']) {
  // D1 - All inputs LOW → all outputs HIGH (inverted, OC)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinHigh(sim, chip, `Y${i}`, `D1-${chipId}: A${i}=L → Y${i}=H`);
    }
  }

  // D2 - All inputs HIGH → all outputs LOW
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinLow(sim, chip, `Y${i}`, `D2-${chipId}: A${i}=H → Y${i}=L`);
    }
  }

  // D3 - Each channel independently
  for (let ch = 1; ch <= 9; ch++) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) {
      if (i === ch) connectHigh(wm, chip, `A${i}`);
      else connectLow(wm, chip, `A${i}`);
    }
    const sim = simulate(world, wm, chip);
    assertPinLow(sim, chip, `Y${ch}`, `D3-${chipId}: ch${ch} HIGH→LOW`);
    for (let i = 1; i <= 9; i++) {
      if (i !== ch) assertPinHigh(sim, chip, `Y${i}`, `D3-${chipId}: ch${i} still HIGH`);
    }
  }

  // D4 - openCollector flag
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.openCollector === true, `D4-${chipId}: openCollector flag is true`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E - OC nine-wide buffer (74x9115)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: OC nine-wide buffer ===');

{
  const chipId = '74x9115';

  // E1 - All inputs LOW → all outputs LOW (buffered, OC)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinLow(sim, chip, `Y${i}`, `E1: A${i}=L → Y${i}=L`);
    }
  }

  // E2 - All inputs HIGH → all outputs HIGH
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      assertPinHigh(sim, chip, `Y${i}`, `E2: A${i}=H → Y${i}=H`);
    }
  }

  // E3 - Each channel independently
  for (let ch = 1; ch <= 9; ch++) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    for (let i = 1; i <= 9; i++) {
      if (i === ch) connectHigh(wm, chip, `A${i}`);
      else connectLow(wm, chip, `A${i}`);
    }
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, `Y${ch}`, `E3: ch${ch} HIGH→HIGH`);
    for (let i = 1; i <= 9; i++) {
      if (i !== ch) assertPinLow(sim, chip, `Y${i}`, `E3: ch${i} still LOW`);
    }
  }

  // E4 - openCollector flag
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.openCollector === true, `E4: openCollector flag is true`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F - Mixed pattern tests for nine-wide chips
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: Mixed patterns ===');

// Test alternating bit patterns on all nine-wide chips
const NINE_WIDE_INV = ['74x9014', '74x9034', '74x9114', '74x9134'];
const NINE_WIDE_BUF = ['74x9015', '74x9035', '74x9115'];

// F1 - Alternating pattern (odd=HIGH, even=LOW) on inverters
for (const chipId of NINE_WIDE_INV) {
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
    else connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1) assertPinLow(sim, chip, `Y${i}`, `F1-${chipId}: odd ch${i} H→L`);
    else assertPinHigh(sim, chip, `Y${i}`, `F1-${chipId}: even ch${i} L→H`);
  }
}

// F2 - Alternating pattern (odd=HIGH, even=LOW) on buffers
for (const chipId of NINE_WIDE_BUF) {
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
    else connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1) assertPinHigh(sim, chip, `Y${i}`, `F2-${chipId}: odd ch${i} H→H`);
    else assertPinLow(sim, chip, `Y${i}`, `F2-${chipId}: even ch${i} L→L`);
  }
}

// F3 - Reverse alternating pattern (odd=LOW, even=HIGH) on inverters
for (const chipId of NINE_WIDE_INV) {
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 0) connectHigh(wm, chip, `A${i}`);
    else connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 0) assertPinLow(sim, chip, `Y${i}`, `F3-${chipId}: even ch${i} H→L`);
    else assertPinHigh(sim, chip, `Y${i}`, `F3-${chipId}: odd ch${i} L→H`);
  }
}

// F4 - Reverse alternating pattern (odd=LOW, even=HIGH) on buffers
for (const chipId of NINE_WIDE_BUF) {
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 0) connectHigh(wm, chip, `A${i}`);
    else connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 0) assertPinHigh(sim, chip, `Y${i}`, `F4-${chipId}: even ch${i} H→H`);
    else assertPinLow(sim, chip, `Y${i}`, `F4-${chipId}: odd ch${i} L→L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Pinout integrity
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION G: Pinout integrity ===');

// G1 - Nine-wide chips have 20 pins, GND=10, VCC=20
const NINE_WIDE_ALL = ['74x9014', '74x9015', '74x9034', '74x9035', '74x9114', '74x9115', '74x9134'];
for (const chipId of NINE_WIDE_ALL) {
  const def = CHIPS_BLOCK_64[chipId];
  assert(def.pins === 20, `G1-${chipId}: pins=20`);
  assert(def.gnd === 10, `G1-${chipId}: gnd=10`);
  assert(def.vcc === 20, `G1-${chipId}: vcc=20`);
  assert(def.pinout.length === 20, `G1-${chipId}: pinout has 20 entries`);
  // Verify pin 10 is GND
  const p10 = def.pinout.find(p => p.pin === 10);
  assert(p10 && p10.name === 'GND' && p10.type === 'power', `G1-${chipId}: pin 10 is GND`);
  // Verify pin 20 is VCC
  const p20 = def.pinout.find(p => p.pin === 20);
  assert(p20 && p20.name === 'VCC' && p20.type === 'power', `G1-${chipId}: pin 20 is VCC`);
}

// G2 - Nine-wide chips have pins 1-9 as inputs (A1-A9)
for (const chipId of NINE_WIDE_ALL) {
  const def = CHIPS_BLOCK_64[chipId];
  for (let i = 1; i <= 9; i++) {
    const p = def.pinout.find(pp => pp.pin === i);
    assert(p && p.name === `A${i}` && p.type === 'input', `G2-${chipId}: pin ${i} is A${i} input`);
  }
}

// G3 - Nine-wide chips have pins 11-19 as outputs (Y9 down to Y1)
for (const chipId of NINE_WIDE_ALL) {
  const def = CHIPS_BLOCK_64[chipId];
  for (let i = 11; i <= 19; i++) {
    const expectedY = 20 - i; // pin 11→Y9, pin 12→Y8, ... pin 19→Y1
    const p = def.pinout.find(pp => pp.pin === i);
    assert(p && p.name === `Y${expectedY}` && p.type === 'output',
      `G3-${chipId}: pin ${i} is Y${expectedY} output`);
  }
}

// G4 - Nine-wide chips have 9 gates each
for (const chipId of NINE_WIDE_ALL) {
  const def = CHIPS_BLOCK_64[chipId];
  assert(def.gates.length === 9, `G4-${chipId}: has 9 gates`);
}

// G5 - Inverter chips use NOT gate type
for (const chipId of ['74x9014', '74x9034', '74x9114', '74x9134']) {
  const def = CHIPS_BLOCK_64[chipId];
  for (const g of def.gates) {
    assert(g.type === 'NOT', `G5-${chipId}: gate type is NOT`);
  }
}

// G6 - Buffer chips use BUFFER gate type
for (const chipId of ['74x9015', '74x9035', '74x9115']) {
  const def = CHIPS_BLOCK_64[chipId];
  for (const g of def.gates) {
    assert(g.type === 'BUFFER', `G6-${chipId}: gate type is BUFFER`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H - Stub checks
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION H: Stubs ===');

const STUB_IDS = ['74x8980', '74x9000'];

// H1 - Stubs have GENERIC_STUB gate
for (const id of STUB_IDS) {
  const def = CHIPS_BLOCK_64[id];
  assert(def && def.gates.length >= 1, `H1-${id}: has at least one gate`);
  const stub = def.gates.find(g => g.type === 'GENERIC_STUB');
  assert(!!stub, `H1-${id}: uses GENERIC_STUB`);
}

// H2 - Stubs can be placed and powered
for (const id of STUB_IDS) {
  let ok = false;
  try {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = simulate(world, wm, chip);
    ok = true;
  } catch (e) { /* skip */ }
  assert(ok, `H2-${id}: places and simulates`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION I - Dynamic tests (reconnect pins)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION I: Dynamic ===');

// I1 - 74x9014: Toggle channel 5 LOW→HIGH→LOW
{
  const chipId = '74x9014';
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y5', `I1a-${chipId}: A5=L → Y5=H`);
  
  reconnectHigh(wm, chip, 'A5');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y5', `I1b-${chipId}: A5=H → Y5=L`);
  
  reconnectLow(wm, chip, 'A5');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y5', `I1c-${chipId}: A5=L → Y5=H again`);
}

// I2 - 74x9035: Toggle channel 3 LOW→HIGH→LOW
{
  const chipId = '74x9035';
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y3', `I2a-${chipId}: A3=L → Y3=L`);
  
  reconnectHigh(wm, chip, 'A3');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y3', `I2b-${chipId}: A3=H → Y3=H`);
  
  reconnectLow(wm, chip, 'A3');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y3', `I2c-${chipId}: A3=L → Y3=L again`);
}

// I3 - 74x9114 (OC): Toggle channel 7
{
  const chipId = '74x9114';
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y7', `I3a-${chipId}: A7=L → Y7=H`);
  
  reconnectHigh(wm, chip, 'A7');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y7', `I3b-${chipId}: A7=H → Y7=L`);
}

// I4 - 74x9115 (OC): Toggle channel 1
{
  const chipId = '74x9115';
  const { world, chip, wm } = setupChipWithPower(chipId);
  for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y1', `I4a-${chipId}: A1=H → Y1=H`);
  
  reconnectLow(wm, chip, 'A1');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y1', `I4b-${chipId}: A1=L → Y1=L`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION J - JTAG chip specific checks
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION J: JTAG chips ===');

const JTAG_CHIPS = ['74x8244', '74x8245', '74x8373', '74x8374'];

// J1 - JTAG chips are 24-pin
for (const id of JTAG_CHIPS) {
  const def = CHIPS_BLOCK_64[id];
  assert(def.pins === 24, `J1-${id}: 24 pins`);
}

// J2 - JTAG chips have jtag in tags
for (const id of JTAG_CHIPS) {
  const def = CHIPS_BLOCK_64[id];
  assert(def.tags.includes('jtag'), `J2-${id}: has 'jtag' tag`);
}

// J3 - JTAG chips have TDI, TDO, TMS, TCK pins
for (const id of JTAG_CHIPS) {
  const def = CHIPS_BLOCK_64[id];
  const pinNames = def.pinout.map(p => p.name);
  assert(pinNames.includes('TDI'), `J3-${id}: has TDI pin`);
  assert(pinNames.includes('TDO'), `J3-${id}: has TDO pin`);
  assert(pinNames.includes('TMS'), `J3-${id}: has TMS pin`);
  assert(pinNames.includes('TCK'), `J3-${id}: has TCK pin`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION K - 74x8244 (Octal Non-Inverting Buffer + JTAG)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION K: 74x8244 Octal Non-Inverting Buffer ===');

{
  const chipId = '74x8244';

  // K1 - Both OE LOW, all inputs LOW → all outputs LOW
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, '1OE'); connectLow(wm, chip, '2OE');
    for (let i = 1; i <= 4; i++) { connectLow(wm, chip, `1A${i}`); connectLow(wm, chip, `2A${i}`); }
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 4; i++) {
      assertPinLow(sim, chip, `1Y${i}`, `K1: 1A${i}=L → 1Y${i}=L`);
      assertPinLow(sim, chip, `2Y${i}`, `K1: 2A${i}=L → 2Y${i}=L`);
    }
  }

  // K2 - Both OE LOW, all inputs HIGH → all outputs HIGH
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, '1OE'); connectLow(wm, chip, '2OE');
    for (let i = 1; i <= 4; i++) { connectHigh(wm, chip, `1A${i}`); connectHigh(wm, chip, `2A${i}`); }
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 4; i++) {
      assertPinHigh(sim, chip, `1Y${i}`, `K2: 1A${i}=H → 1Y${i}=H`);
      assertPinHigh(sim, chip, `2Y${i}`, `K2: 2A${i}=H → 2Y${i}=H`);
    }
  }

  // K3 - 1OE HIGH (group 1 tri-stated), 2OE LOW → group 2 still active
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, '1OE'); connectLow(wm, chip, '2OE');
    for (let i = 1; i <= 4; i++) { connectLow(wm, chip, `1A${i}`); connectHigh(wm, chip, `2A${i}`); }
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 4; i++) {
      assertPinHigh(sim, chip, `2Y${i}`, `K3: 2A${i}=H, 2OE=L → 2Y${i}=H`);
    }
  }

  // K4 - 1OE LOW, 2OE HIGH → group 1 active, group 2 tri-stated
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, '1OE'); connectHigh(wm, chip, '2OE');
    for (let i = 1; i <= 4; i++) { connectHigh(wm, chip, `1A${i}`); connectLow(wm, chip, `2A${i}`); }
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 4; i++) {
      assertPinHigh(sim, chip, `1Y${i}`, `K4: 1A${i}=H, 1OE=L → 1Y${i}=H`);
    }
  }

  // K5 - gate count check (8 TRI_BUFFER_LO + 1 BUFFER = 9)
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.gates.length === 9, `K5: 74x8244 has 9 gates`);
    const triCount = def.gates.filter(g => g.type === 'TRI_BUFFER_LO').length;
    assert(triCount === 8, `K5: 74x8244 has 8 TRI_BUFFER_LO gates`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION L - 74x8245 (Octal Transceiver + JTAG)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION L: 74x8245 Octal Transceiver ===');

{
  const chipId = '74x8245';

  // L1 - OE LOW, DIR HIGH → A drives B
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE'); connectHigh(wm, chip, 'DIR');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `B${i}`, `L1: A${i}=H, DIR=H → B${i}=H`);
    }
  }

  // L2 - OE LOW, DIR HIGH, mixed inputs
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE'); connectHigh(wm, chip, 'DIR');
    for (let i = 1; i <= 8; i++) {
      if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
      else connectLow(wm, chip, `A${i}`);
    }
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      if (i % 2 === 1) assertPinHigh(sim, chip, `B${i}`, `L2: A${i}=H → B${i}=H`);
      else             assertPinLow(sim, chip,  `B${i}`, `L2: A${i}=L → B${i}=L`);
    }
  }

  // L3 - OE LOW, DIR LOW → B drives A
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE'); connectLow(wm, chip, 'DIR');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `B${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `A${i}`, `L3: B${i}=H, DIR=L → A${i}=H`);
    }
  }

  // L4 - gate structure check (1 TRANSCEIVER_8BIT + 1 BUFFER)
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.gates.length === 2, `L4: 74x8245 has 2 gates`);
    assert(def.gates[0].type === 'TRANSCEIVER_8BIT', `L4: first gate is TRANSCEIVER_8BIT`);
    assert(def.gates[1].type === 'BUFFER', `L4: second gate is BUFFER (TDO)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION M - 74x8373 (Octal Transparent Latch + JTAG)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION M: 74x8373 Octal Transparent Latch ===');

{
  const chipId = '74x8373';

  // M1 - LE=HIGH, OE=LOW → transparent (Q=D)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'LE'); connectLow(wm, chip, 'OE');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `Q${i}`, `M1: D${i}=H, LE=H, OE=L → Q${i}=H`);
    }
  }

  // M2 - LE=HIGH, OE=LOW, all D LOW → Q=LOW
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'LE'); connectLow(wm, chip, 'OE');
    for (let i = 1; i <= 8; i++) connectLow(wm, chip, `D${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinLow(sim, chip, `Q${i}`, `M2: D${i}=L, LE=H, OE=L → Q${i}=L`);
    }
  }

  // M3 - LE=HIGH captures data, then LE=LOW holds it
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'LE'); connectLow(wm, chip, 'OE');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
    let sim = simulate(world, wm, chip);
    // Latch data then disable LE
    reconnectLow(wm, chip, 'LE');
    // Change D to opposite
    for (let i = 1; i <= 8; i++) reconnectLow(wm, chip, `D${i}`);
    sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `Q${i}`, `M3: LE=L holds Q${i}=H despite D=L`);
    }
  }

  // M4 - OE=HIGH → outputs HiZ (float low)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'LE'); connectHigh(wm, chip, 'OE');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinLow(sim, chip, `Q${i}`, `M4: OE=H → Q${i} HiZ (floats low)`);
    }
  }

  // M5 - sequential flag and gate structure
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.sequential === true, `M5: 74x8373 has sequential: true`);
    assert(def.gates[0].type === 'D_LATCH_OCTAL_TRI', `M5: first gate is D_LATCH_OCTAL_TRI`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION N - 74x8374 (Octal D Flip-Flop + JTAG)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION N: 74x8374 Octal D Flip-Flop ===');

{
  const chipId = '74x8374';

  // N1 - Rising CLK captures D (all HIGH)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE'); connectLow(wm, chip, 'CLK');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
    let sim = simulate(world, wm, chip);
    // Clock rising edge
    reconnectHigh(wm, chip, 'CLK');
    sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `Q${i}`, `N1: D${i}=H captured on rising CLK → Q${i}=H`);
    }
  }

  // N2 - CLK low state does not capture (Q holds previous value)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE'); connectLow(wm, chip, 'CLK');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
    let sim = simulate(world, wm, chip);
    // Rising edge: capture HIGH
    reconnectHigh(wm, chip, 'CLK');
    sim = simulate(world, wm, chip);
    // Falling edge + change D
    reconnectLow(wm, chip, 'CLK');
    for (let i = 1; i <= 8; i++) reconnectLow(wm, chip, `D${i}`);
    sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `Q${i}`, `N2: Q${i} holds HIGH after D goes LOW (no new clock)`);
    }
  }

  // N3 - OE=HIGH → outputs HiZ
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'OE'); connectLow(wm, chip, 'CLK');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `D${i}`);
    let sim = simulate(world, wm, chip);
    reconnectHigh(wm, chip, 'CLK');
    sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinLow(sim, chip, `Q${i}`, `N3: OE=H → Q${i} HiZ (floats low)`);
    }
  }

  // N4 - sequential flag and gate structure
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.sequential === true, `N4: 74x8374 has sequential: true`);
    assert(def.gates[0].type === 'D_FF_OCTAL_TRI', `N4: first gate is D_FF_OCTAL_TRI`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION O - 74x8541 (8 bit Selectable Inversion Buffer)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION O: 74x8541 Selectable Inversion Buffer ===');

{
  const chipId = '74x8541';

  // O1 - OE1=LOW, INV=LOW → non-inverting (Y=A)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE1'); connectLow(wm, chip, 'INV');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `Y${i}`, `O1: A${i}=H, INV=L → Y${i}=H`);
    }
  }

  // O2 - OE1=LOW, INV=LOW, all A LOW → Y LOW
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE1'); connectLow(wm, chip, 'INV');
    for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinLow(sim, chip, `Y${i}`, `O2: A${i}=L, INV=L → Y${i}=L`);
    }
  }

  // O3 - OE1=LOW, INV=HIGH → inverting (Y=NOT A)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE1'); connectHigh(wm, chip, 'INV');
    for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinLow(sim, chip, `Y${i}`, `O3: A${i}=H, INV=H → Y${i}=L (inverted)`);
    }
  }

  // O4 - OE1=LOW, INV=HIGH, A=LOW → Y HIGH (inverted)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE1'); connectHigh(wm, chip, 'INV');
    for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      assertPinHigh(sim, chip, `Y${i}`, `O4: A${i}=L, INV=H → Y${i}=H (inverted)`);
    }
  }

  // O5 - OE1=HIGH → all outputs HiZ regardless of INV
  {
    for (const invState of ['INV', null]) {
      const { world, chip, wm } = setupChipWithPower(chipId);
      connectHigh(wm, chip, 'OE1');
      if (invState) connectHigh(wm, chip, invState);
      else connectLow(wm, chip, 'INV');
      for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
      const sim = simulate(world, wm, chip);
      for (let i = 1; i <= 8; i++) {
        assertPinLow(sim, chip, `Y${i}`, `O5: OE1=H → Y${i} HiZ (floats low)`);
      }
    }
  }

  // O6 - alternating inputs with INV=LOW (non-inverting)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE1'); connectLow(wm, chip, 'INV');
    for (let i = 1; i <= 8; i++) {
      if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
      else connectLow(wm, chip, `A${i}`);
    }
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      if (i % 2 === 1) assertPinHigh(sim, chip, `Y${i}`, `O6: A${i}=H, INV=L → Y${i}=H`);
      else             assertPinLow(sim, chip,  `Y${i}`, `O6: A${i}=L, INV=L → Y${i}=L`);
    }
  }

  // O7 - alternating inputs with INV=HIGH (inverting)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'OE1'); connectHigh(wm, chip, 'INV');
    for (let i = 1; i <= 8; i++) {
      if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
      else connectLow(wm, chip, `A${i}`);
    }
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      if (i % 2 === 1) assertPinLow(sim, chip,  `Y${i}`, `O7: A${i}=H, INV=H → Y${i}=L`);
      else             assertPinHigh(sim, chip, `Y${i}`, `O7: A${i}=L, INV=H → Y${i}=H`);
    }
  }

  // O8 - gate structure check
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.gates.length === 8, `O8: 74x8541 has 8 gates`);
    for (const g of def.gates) {
      assert(g.type === 'TRI_BUFFER_SEL_INV', `O8: gate type is TRI_BUFFER_SEL_INV`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION Q - 74x8996 JTAG ASP
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION Q: 74x8996 JTAG ASP ===');

{
  const chipId = '74x8996';

  // Q1 - gate structure: one JTAG_ASP gate
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.gates.length === 1, 'Q1: 74x8996 has 1 gate');
    assert(def.gates[0].type === 'JTAG_ASP', 'Q1: gate type is JTAG_ASP');
  }

  // Q2 - STCK always follows PTCK, STRST always follows PTRST (regardless of BYP)
  for (const byp of [0, 1]) {
    for (const clk of [0, 1]) {
      const { world, chip, wm } = setupChipWithPower(chipId);
      if (byp) connectHigh(wm, chip, 'BYP'); else connectLow(wm, chip, 'BYP');
      if (clk) connectHigh(wm, chip, 'PTCK'); else connectLow(wm, chip, 'PTCK');
      connectHigh(wm, chip, 'PTRST');
      connectLow(wm, chip, 'PTDI'); connectLow(wm, chip, 'PTMS'); connectLow(wm, chip, 'STDI');
      const sim = simulate(world, wm, chip);
      if (clk) assertPinHigh(sim, chip, 'STCK',  `Q2: PTCK=H BYP=${byp} → STCK=H`);
      else     assertPinLow(sim,  chip, 'STCK',  `Q2: PTCK=L BYP=${byp} → STCK=L`);
      assertPinHigh(sim, chip, 'STRST', `Q2: PTRST=H BYP=${byp} → STRST=H`);
    }
  }

  // Q3 - BYP=LOW (connected): STDO=PTDI, PTDO=STDI, STMS=PTMS, CON=LOW
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'BYP');
    connectHigh(wm, chip, 'PTDI'); connectHigh(wm, chip, 'PTMS');
    connectLow(wm, chip, 'STDI');
    connectLow(wm, chip, 'PTCK'); connectHigh(wm, chip, 'PTRST');
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, 'STDO',  'Q3: BYP=L, PTDI=H → STDO=H');
    assertPinHigh(sim, chip, 'STMS',  'Q3: BYP=L, PTMS=H → STMS=H');
    assertPinLow(sim,  chip, 'PTDO',  'Q3: BYP=L, STDI=L → PTDO=L');
    assertPinLow(sim,  chip, 'CON',   'Q3: BYP=L → CON=L (asserted)');
  }

  // Q4 - BYP=HIGH (disconnected): STDO HiZ, PTDO HiZ, STMS=H, CON=H
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'BYP');
    connectHigh(wm, chip, 'PTDI'); connectLow(wm, chip, 'PTMS');
    connectHigh(wm, chip, 'STDI');
    connectLow(wm, chip, 'PTCK'); connectHigh(wm, chip, 'PTRST');
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, 'STMS', 'Q4: BYP=H → STMS=H (held high)');
    assertPinHigh(sim, chip, 'CON',  'Q4: BYP=H → CON=H (deasserted)');
  }

  // Q5 - tags include 'jtag'
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.tags.includes('jtag'), 'Q5: 74x8996 has jtag tag');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION P - 74x9046 PLL
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION P: 74x9046 PLL ===');

{
  const chipId = '74x9046';

  // P1 - gate structure: one PLL_9046 gate
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.gates.length === 1, 'P1: 74x9046 has 1 gate');
    assert(def.gates[0].type === 'PLL_9046', 'P1: gate type is PLL_9046');
  }

  // P2 - PC1out = SIGin XOR COMPin (XOR phase comparator)
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'SIGin'); connectLow(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, 'PC1out', 'P2a: SIG=H COMPin=L → PC1=H');
    assertPinLow(sim, chip,  'PC3out', 'P2a: SIG=H COMPin=L → PC3=L');
  }
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'SIGin'); connectHigh(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinLow(sim, chip,  'PC1out', 'P2b: SIG=H COMPin=H → PC1=L');
    assertPinHigh(sim, chip, 'PC3out', 'P2b: SIG=H COMPin=H → PC3=H');
  }
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'SIGin'); connectLow(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinLow(sim, chip,  'PC1out', 'P2c: SIG=L COMPin=L → PC1=L');
    assertPinHigh(sim, chip, 'PC3out', 'P2c: SIG=L COMPin=L → PC3=H');
  }

  // P3 - LD: high when SIGin === COMPin, low when different
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'SIGin'); connectHigh(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, 'LD', 'P3a: SIG=H COMPin=H → LD=H (locked)');
  }
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'SIGin'); connectLow(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, 'LD', 'P3b: SIG=L COMPin=L → LD=H (locked)');
  }
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'SIGin'); connectLow(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinLow(sim, chip, 'LD', 'P3c: SIG=H COMPin=L → LD=L (unlocked)');
  }

  // P4 - VCOout: follows SIGin when INH=L; LOW when INH=H
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'SIGin'); connectLow(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, 'VCOout', 'P4a: INH=L, SIG=H → VCOout=H');
  }
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectLow(wm, chip, 'SIGin'); connectLow(wm, chip, 'COMPin');
    connectLow(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinLow(sim, chip, 'VCOout', 'P4b: INH=L, SIG=L → VCOout=L');
  }
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectHigh(wm, chip, 'SIGin'); connectLow(wm, chip, 'COMPin');
    connectHigh(wm, chip, 'INH');
    const sim = simulate(world, wm, chip);
    assertPinLow(sim, chip, 'VCOout', 'P4c: INH=H, SIG=H → VCOout=L (inhibited)');
  }

  // P5 - tags include 'pll'
  {
    const def = CHIPS_BLOCK_64[chipId];
    assert(def.tags.includes('pll'), 'P5: 74x9046 has pll tag');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n=== Chips64 Tests: ${pass} passed, ${fail} failed (${pass + fail} total) ===`);
if (fail > 0) process.exit(1);
