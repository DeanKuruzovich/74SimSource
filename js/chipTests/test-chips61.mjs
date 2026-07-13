// test-chips61.mjs - Tests for all chips defined in js/chips/chips61.js
// Chips under test:
//   74x6311  : DRAM Access Detector (GENERIC_STUB, 20 pin)
//   74x6323  : Ripple Counter/Osc (GENERIC_STUB, 8 pin)
//   74x6800  : 10 bit Bus Switch (GENERIC_STUB, 24 pin)
//   74x6845  : 8 bit Bus Switch (GENERIC_STUB, 20 pin)
//   74x7001  : Quad AND Schmitt (AND, 14 pin)
//   74x7002  : Quad NOR Schmitt (NOR, 14 pin)
//   74x7003  : Quad NAND Schmitt OC (NAND, 14 pin)
//   74x7006  : Mixed Gate (NOT/NAND3/NAND4/NOR3/NOR4/NOT, 24 pin)
//   74x7007  : Hex Buffer (BUFFER, 14 pin)
//   74x7008  : Mixed Gate (NOT/NAND/NAND/NAND/NOR/NOR/NOR/NOT, 24 pin)
//   74x7014  : Hex Buffer Schmitt (BUFFER, 14 pin)
//   74x7022  : ÷8 Johnson Counter (GENERIC_STUB, 14 pin)
//   74x7032  : Quad OR Schmitt (OR, 14 pin)
//   74x7038  : 9 bit Transceiver/Latch (GENERIC_STUB, 24 pin)
//   74x7060  : 14-stage Counter/Osc (GENERIC_STUB, 20 pin)

import { CHIPS_BLOCK_61 } from '../chips/chips61.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else      { fail++; console.error(`  ✗ ${msg}`); }
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

function reconnectHigh(wm, chip, name) {
  disconnectPin(wm, chip, name);
  return connectHigh(wm, chip, name);
}

function reconnectLow(wm, chip, name) {
  disconnectPin(wm, chip, name);
  return connectLow(wm, chip, name);
}

function simulate(world, wm, chips) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, Array.isArray(chips) ? chips : [chips], wm);
  return sim;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x6311', '74x6323', '74x6800', '74x6845', '74x7001', '74x7002',
  '74x7003', '74x7006', '74x7007', '74x7008', '74x7014', '74x7022',
  '74x7032', '74x7038', '74x7060',
];

const EXPECTED_SPECS = {
  '74x6311': { pins: 20, gnd: 10, vcc: 20 },
  '74x6323': { pins:  8, gnd:  4, vcc:  8 },
  '74x6800': { pins: 24, gnd: 12, vcc: 24 },
  '74x6845': { pins: 20, gnd: 10, vcc: 20 },
  '74x7001': { pins: 14, gnd:  7, vcc: 14 },
  '74x7002': { pins: 14, gnd:  7, vcc: 14 },
  '74x7003': { pins: 14, gnd:  7, vcc: 14 },
  '74x7006': { pins: 24, gnd: 12, vcc: 24 },
  '74x7007': { pins: 14, gnd:  7, vcc: 14 },
  '74x7008': { pins: 24, gnd: 12, vcc: 24 },
  '74x7014': { pins: 14, gnd:  7, vcc: 14 },
  '74x7022': { pins: 14, gnd:  7, vcc: 14 },
  '74x7032': { pins: 14, gnd:  7, vcc: 14 },
  '74x7038': { pins: 24, gnd: 12, vcc: 24 },
  '74x7060': { pins: 20, gnd: 10, vcc: 20 },
};

console.log('\n=== SECTION S: Structure ===');

// S1 - Block has exactly 15 entries
{
  const keys = Object.keys(CHIPS_BLOCK_61);
  assert(keys.length === 15, `S1: block has ${keys.length} entries, expected 15`);
}

// S2 - Every expected chip ID resolves
for (const id of EXPECTED_IDS) {
  const def = CHIPS_BLOCK_61[id];
  assert(!!def, `S2: '${id}' present`);
}

// S3 - Each chip's name starts with "74x"
for (const key of Object.keys(CHIPS_BLOCK_61)) {
  const def = CHIPS_BLOCK_61[key];
  assert(def.name && def.name.startsWith('74x'), `S3: key=${key} name='${def.name}' starts with 74x`);
}

// S4 - pin count, VCC pin, GND pin
for (const [id, spec] of Object.entries(EXPECTED_SPECS)) {
  const def = CHIPS_BLOCK_61[id];
  if (!def) continue;
  assert(def.pins === spec.pins, `S4: ${id} pins=${def.pins} expected ${spec.pins}`);
  assert(def.vcc === spec.vcc,   `S4: ${id} vcc=${def.vcc} expected ${spec.vcc}`);
  assert(def.gnd === spec.gnd,   `S4: ${id} gnd=${def.gnd} expected ${spec.gnd}`);
}

// S5 - Each chip has at least one gate
for (const key of Object.keys(CHIPS_BLOCK_61)) {
  const def = CHIPS_BLOCK_61[key];
  assert(Array.isArray(def.gates) && def.gates.length > 0, `S5: key=${key} gates non-empty`);
}

// S6 - Each chip has a pinout with the correct number of entries
for (const key of Object.keys(CHIPS_BLOCK_61)) {
  const def = CHIPS_BLOCK_61[key];
  assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
    `S6: key=${key} pinout length=${def.pinout?.length} expected ${def.pins}`);
}

// S7 - VCC and GND pins have type 'power'
for (const key of Object.keys(CHIPS_BLOCK_61)) {
  const def = CHIPS_BLOCK_61[key];
  const vccPin = def.pinout.find(p => p.name === 'VCC');
  const gndPin = def.pinout.find(p => p.name === 'GND');
  assert(vccPin && vccPin.type === 'power', `S7: key=${key} VCC pin type=power`);
  assert(gndPin && gndPin.type === 'power', `S7: key=${key} GND pin type=power`);
}

// S8 - Each chip can be instantiated and placed
for (const id of EXPECTED_IDS) {
  try {
    const chip = new ChipComponent(id);
    chip.place(0, 0, 10, 4);
    assert(chip.pins.length > 0, `S8: ${id} placed with ${chip.pins.length} pins`);
  } catch (e) {
    fail++; console.error(`  ✗ S8: ${id} failed to instantiate: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A: 74x7001 - Quad 2 input AND (Schmitt trigger)
// Same logic as 74x08
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: 74x7001 (Quad AND Schmitt) ===');

// Full truth table for all 4 gates
{
  const GATES_7001 = [
    { a: '1A', b: '1B', y: '1Y' },
    { a: '2A', b: '2B', y: '2Y' },
    { a: '3A', b: '3B', y: '3Y' },
    { a: '4A', b: '4B', y: '4Y' },
  ];
  const rows = [
    { a: 0, b: 0, y: 0 },
    { a: 0, b: 1, y: 0 },
    { a: 1, b: 0, y: 0 },
    { a: 1, b: 1, y: 1 },
  ];
  for (const g of GATES_7001) {
    for (const r of rows) {
      const { world, chip, wm } = setupChipWithPower('74x7001');
      if (r.a) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      if (r.b) connectHigh(wm, chip, g.b); else connectLow(wm, chip, g.b);
      const sim = simulate(world, wm, chip);
      const label = `A: ${g.y} AND(${r.a},${r.b})=${r.y}`;
      if (r.y) assertPinHigh(sim, chip, g.y, label);
      else     assertPinLow(sim, chip, g.y, label);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B: 74x7002 - Quad 2 input NOR (Schmitt trigger)
// Same logic as 74x02 - pinout is Y,A,B on low side
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x7002 (Quad NOR Schmitt) ===');

{
  const GATES_7002 = [
    { a: '1A', b: '1B', y: '1Y' },
    { a: '2A', b: '2B', y: '2Y' },
    { a: '3A', b: '3B', y: '3Y' },
    { a: '4A', b: '4B', y: '4Y' },
  ];
  const rows = [
    { a: 0, b: 0, y: 1 },
    { a: 0, b: 1, y: 0 },
    { a: 1, b: 0, y: 0 },
    { a: 1, b: 1, y: 0 },
  ];
  for (const g of GATES_7002) {
    for (const r of rows) {
      const { world, chip, wm } = setupChipWithPower('74x7002');
      if (r.a) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      if (r.b) connectHigh(wm, chip, g.b); else connectLow(wm, chip, g.b);
      const sim = simulate(world, wm, chip);
      const label = `B: ${g.y} NOR(${r.a},${r.b})=${r.y}`;
      if (r.y) assertPinHigh(sim, chip, g.y, label);
      else     assertPinLow(sim, chip, g.y, label);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: 74x7003 - Quad 2 input NAND (Schmitt trigger, open collector)
// Same logic as 74x03/74x00
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x7003 (Quad NAND Schmitt OC) ===');

{
  const GATES_7003 = [
    { a: '1A', b: '1B', y: '1Y' },
    { a: '2A', b: '2B', y: '2Y' },
    { a: '3A', b: '3B', y: '3Y' },
    { a: '4A', b: '4B', y: '4Y' },
  ];
  const rows = [
    { a: 0, b: 0, y: 1 },
    { a: 0, b: 1, y: 1 },
    { a: 1, b: 0, y: 1 },
    { a: 1, b: 1, y: 0 },
  ];
  for (const g of GATES_7003) {
    for (const r of rows) {
      const { world, chip, wm } = setupChipWithPower('74x7003');
      if (r.a) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      if (r.b) connectHigh(wm, chip, g.b); else connectLow(wm, chip, g.b);
      const sim = simulate(world, wm, chip);
      const label = `C: ${g.y} NAND(${r.a},${r.b})=${r.y}`;
      if (r.y) assertPinHigh(sim, chip, g.y, label);
      else     assertPinLow(sim, chip, g.y, label);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D: 74x7006 - Mixed gate
//   Gate1: NOT (1A→1Y)
//   Gate2: 3-NAND (2A,2B,2C→2Y)
//   Gate3: 4-NAND (3A,3B,3C,3D→3Y)
//   Gate4: 3-NOR (4A,4B,4C→4Y)
//   Gate5: 4-NOR (5A,5B,5C,5D→5Y)
//   Gate6: NOT (6A→6Y)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x7006 (Mixed Gate) ===');

// D1 - NOT gates (1A→1Y and 6A→6Y)
{
  for (const [a, y] of [['1A', '1Y'], ['6A', '6Y']]) {
    for (const input of [0, 1]) {
      const { world, chip, wm } = setupChipWithPower('74x7006');
      if (input) connectHigh(wm, chip, a); else connectLow(wm, chip, a);
      // connect unused inputs low to avoid floats
      const unusedInputs = ['2A','2B','2C','3A','3B','3C','3D','4A','4B','4C','5A','5B','5C','5D'];
      if (a === '1A') unusedInputs.push('6A'); else unusedInputs.push('1A');
      for (const u of unusedInputs) connectLow(wm, chip, u);
      const sim = simulate(world, wm, chip);
      const expected = input ? 0 : 1;
      const label = `D1: NOT(${a}=${input})=${expected}`;
      if (expected) assertPinHigh(sim, chip, y, label);
      else          assertPinLow(sim, chip, y, label);
    }
  }
}

// D2 - 3 input NAND (2A,2B,2C→2Y)
{
  for (let i = 0; i < 8; i++) {
    const a = (i >> 2) & 1, b = (i >> 1) & 1, c = i & 1;
    const expected = (a && b && c) ? 0 : 1;
    const { world, chip, wm } = setupChipWithPower('74x7006');
    if (a) connectHigh(wm, chip, '2A'); else connectLow(wm, chip, '2A');
    if (b) connectHigh(wm, chip, '2B'); else connectLow(wm, chip, '2B');
    if (c) connectHigh(wm, chip, '2C'); else connectLow(wm, chip, '2C');
    // tie other inputs
    for (const u of ['1A','3A','3B','3C','3D','4A','4B','4C','5A','5B','5C','5D','6A'])
      connectLow(wm, chip, u);
    const sim = simulate(world, wm, chip);
    const label = `D2: NAND3(${a},${b},${c})=${expected}`;
    if (expected) assertPinHigh(sim, chip, '2Y', label);
    else          assertPinLow(sim, chip, '2Y', label);
  }
}

// D3 - 4 input NAND (3A,3B,3C,3D→3Y)
{
  for (let i = 0; i < 16; i++) {
    const a = (i >> 3) & 1, b = (i >> 2) & 1, c = (i >> 1) & 1, d = i & 1;
    const expected = (a && b && c && d) ? 0 : 1;
    const { world, chip, wm } = setupChipWithPower('74x7006');
    if (a) connectHigh(wm, chip, '3A'); else connectLow(wm, chip, '3A');
    if (b) connectHigh(wm, chip, '3B'); else connectLow(wm, chip, '3B');
    if (c) connectHigh(wm, chip, '3C'); else connectLow(wm, chip, '3C');
    if (d) connectHigh(wm, chip, '3D'); else connectLow(wm, chip, '3D');
    for (const u of ['1A','2A','2B','2C','4A','4B','4C','5A','5B','5C','5D','6A'])
      connectLow(wm, chip, u);
    const sim = simulate(world, wm, chip);
    const label = `D3: NAND4(${a},${b},${c},${d})=${expected}`;
    if (expected) assertPinHigh(sim, chip, '3Y', label);
    else          assertPinLow(sim, chip, '3Y', label);
  }
}

// D4 - 3 input NOR (4A,4B,4C→4Y)
{
  for (let i = 0; i < 8; i++) {
    const a = (i >> 2) & 1, b = (i >> 1) & 1, c = i & 1;
    const expected = (a || b || c) ? 0 : 1;
    const { world, chip, wm } = setupChipWithPower('74x7006');
    if (a) connectHigh(wm, chip, '4A'); else connectLow(wm, chip, '4A');
    if (b) connectHigh(wm, chip, '4B'); else connectLow(wm, chip, '4B');
    if (c) connectHigh(wm, chip, '4C'); else connectLow(wm, chip, '4C');
    for (const u of ['1A','2A','2B','2C','3A','3B','3C','3D','5A','5B','5C','5D','6A'])
      connectLow(wm, chip, u);
    const sim = simulate(world, wm, chip);
    const label = `D4: NOR3(${a},${b},${c})=${expected}`;
    if (expected) assertPinHigh(sim, chip, '4Y', label);
    else          assertPinLow(sim, chip, '4Y', label);
  }
}

// D5 - 4 input NOR (5A,5B,5C,5D→5Y)
{
  for (let i = 0; i < 16; i++) {
    const a = (i >> 3) & 1, b = (i >> 2) & 1, c = (i >> 1) & 1, d = i & 1;
    const expected = (a || b || c || d) ? 0 : 1;
    const { world, chip, wm } = setupChipWithPower('74x7006');
    if (a) connectHigh(wm, chip, '5A'); else connectLow(wm, chip, '5A');
    if (b) connectHigh(wm, chip, '5B'); else connectLow(wm, chip, '5B');
    if (c) connectHigh(wm, chip, '5C'); else connectLow(wm, chip, '5C');
    if (d) connectHigh(wm, chip, '5D'); else connectLow(wm, chip, '5D');
    for (const u of ['1A','2A','2B','2C','3A','3B','3C','3D','4A','4B','4C','6A'])
      connectLow(wm, chip, u);
    const sim = simulate(world, wm, chip);
    const label = `D5: NOR4(${a},${b},${c},${d})=${expected}`;
    if (expected) assertPinHigh(sim, chip, '5Y', label);
    else          assertPinLow(sim, chip, '5Y', label);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: 74x7007 - Hex buffer gate
// Same logic as 74x07
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: 74x7007 (Hex Buffer) ===');

{
  const GATES_7007 = [
    { a: '1A', y: '1Y' },
    { a: '2A', y: '2Y' },
    { a: '3A', y: '3Y' },
    { a: '4A', y: '4Y' },
    { a: '5A', y: '5Y' },
    { a: '6A', y: '6Y' },
  ];
  for (const g of GATES_7007) {
    for (const input of [0, 1]) {
      const { world, chip, wm } = setupChipWithPower('74x7007');
      if (input) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      const sim = simulate(world, wm, chip);
      const label = `E: ${g.y} BUF(${input})=${input}`;
      if (input) assertPinHigh(sim, chip, g.y, label);
      else       assertPinLow(sim, chip, g.y, label);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F: 74x7008 - Mixed gate
//   Gate1: NOT (1A→1Y)
//   Gate2: 2-NAND (2A,2B→2Y)
//   Gate3: 2-NAND (3A,3B→3Y)
//   Gate4: 2-NAND (4A,4B→4Y)
//   Gate5: 2-NOR (5A,5B→5Y)
//   Gate6: 2-NOR (6A,6B→6Y)
//   Gate7: 2-NOR (7A,7B→7Y)
//   Gate8: NOT (8A→8Y)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: 74x7008 (Mixed Gate) ===');

// F1 - NOT gates (1A→1Y and 8A→8Y)
{
  for (const [a, y] of [['1A', '1Y'], ['8A', '8Y']]) {
    for (const input of [0, 1]) {
      const { world, chip, wm } = setupChipWithPower('74x7008');
      if (input) connectHigh(wm, chip, a); else connectLow(wm, chip, a);
      // tie other inputs low
      const otherInputs = ['2A','2B','3A','3B','4A','4B','5A','5B','6A','6B','7A','7B'];
      if (a === '1A') otherInputs.push('8A'); else otherInputs.push('1A');
      for (const u of otherInputs) connectLow(wm, chip, u);
      const sim = simulate(world, wm, chip);
      const expected = input ? 0 : 1;
      const label = `F1: NOT(${a}=${input})=${expected}`;
      if (expected) assertPinHigh(sim, chip, y, label);
      else          assertPinLow(sim, chip, y, label);
    }
  }
}

// F2 - 2 input NAND gates (2, 3, 4)
{
  const nandGates = [
    { a: '2A', b: '2B', y: '2Y' },
    { a: '3A', b: '3B', y: '3Y' },
    { a: '4A', b: '4B', y: '4Y' },
  ];
  const rows = [
    { a: 0, b: 0, y: 1 },
    { a: 0, b: 1, y: 1 },
    { a: 1, b: 0, y: 1 },
    { a: 1, b: 1, y: 0 },
  ];
  for (const g of nandGates) {
    for (const r of rows) {
      const { world, chip, wm } = setupChipWithPower('74x7008');
      if (r.a) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      if (r.b) connectHigh(wm, chip, g.b); else connectLow(wm, chip, g.b);
      // tie other inputs low
      for (const u of ['1A','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B','7A','7B','8A']) {
        if (u !== g.a && u !== g.b) connectLow(wm, chip, u);
      }
      const sim = simulate(world, wm, chip);
      const label = `F2: ${g.y} NAND(${r.a},${r.b})=${r.y}`;
      if (r.y) assertPinHigh(sim, chip, g.y, label);
      else     assertPinLow(sim, chip, g.y, label);
    }
  }
}

// F3 - 2 input NOR gates (5, 6, 7)
{
  const norGates = [
    { a: '5A', b: '5B', y: '5Y' },
    { a: '6A', b: '6B', y: '6Y' },
    { a: '7A', b: '7B', y: '7Y' },
  ];
  const rows = [
    { a: 0, b: 0, y: 1 },
    { a: 0, b: 1, y: 0 },
    { a: 1, b: 0, y: 0 },
    { a: 1, b: 1, y: 0 },
  ];
  for (const g of norGates) {
    for (const r of rows) {
      const { world, chip, wm } = setupChipWithPower('74x7008');
      if (r.a) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      if (r.b) connectHigh(wm, chip, g.b); else connectLow(wm, chip, g.b);
      for (const u of ['1A','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B','7A','7B','8A']) {
        if (u !== g.a && u !== g.b) connectLow(wm, chip, u);
      }
      const sim = simulate(world, wm, chip);
      const label = `F3: ${g.y} NOR(${r.a},${r.b})=${r.y}`;
      if (r.y) assertPinHigh(sim, chip, g.y, label);
      else     assertPinLow(sim, chip, g.y, label);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G: 74x7014 - Hex Schmitt trigger buffer (non inverting)
// Same logic as 74x7007 / 74x07
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION G: 74x7014 (Hex Buffer Schmitt) ===');

{
  const GATES_7014 = [
    { a: '1A', y: '1Y' },
    { a: '2A', y: '2Y' },
    { a: '3A', y: '3Y' },
    { a: '4A', y: '4Y' },
    { a: '5A', y: '5Y' },
    { a: '6A', y: '6Y' },
  ];
  for (const g of GATES_7014) {
    for (const input of [0, 1]) {
      const { world, chip, wm } = setupChipWithPower('74x7014');
      if (input) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      const sim = simulate(world, wm, chip);
      const label = `G: ${g.y} BUF(${input})=${input}`;
      if (input) assertPinHigh(sim, chip, g.y, label);
      else       assertPinLow(sim, chip, g.y, label);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H: 74x7032 - Quad 2 input OR (Schmitt trigger)
// Same logic as 74x32
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION H: 74x7032 (Quad OR Schmitt) ===');

{
  const GATES_7032 = [
    { a: '1A', b: '1B', y: '1Y' },
    { a: '2A', b: '2B', y: '2Y' },
    { a: '3A', b: '3B', y: '3Y' },
    { a: '4A', b: '4B', y: '4Y' },
  ];
  const rows = [
    { a: 0, b: 0, y: 0 },
    { a: 0, b: 1, y: 1 },
    { a: 1, b: 0, y: 1 },
    { a: 1, b: 1, y: 1 },
  ];
  for (const g of GATES_7032) {
    for (const r of rows) {
      const { world, chip, wm } = setupChipWithPower('74x7032');
      if (r.a) connectHigh(wm, chip, g.a); else connectLow(wm, chip, g.a);
      if (r.b) connectHigh(wm, chip, g.b); else connectLow(wm, chip, g.b);
      const sim = simulate(world, wm, chip);
      const label = `H: ${g.y} OR(${r.a},${r.b})=${r.y}`;
      if (r.y) assertPinHigh(sim, chip, g.y, label);
      else     assertPinLow(sim, chip, g.y, label);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION T: Stub smoke tests
// Quick power-up verification for stubs
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION T: Stub smoke tests ===');

const STUB_IDS = [
  '74x6311', '74x6323', '74x6800', '74x6845',
  '74x7022', '74x7038', '74x7060',
];

for (const id of STUB_IDS) {
  try {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = simulate(world, wm, chip);
    assert(true, `T: ${id} simulates without error`);
  } catch (e) {
    fail++; console.error(`  ✗ T: ${id} simulation error: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Result
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${pass} passed, ${fail} failed, ${pass + fail} total ===`);
process.exit(fail > 0 ? 1 : 0);
