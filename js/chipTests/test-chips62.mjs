// test-chips62.mjs - Tests for all chips defined in js/chips/chips62.js
// Chips under test:
//   74x7074   : Mixed Gate+FF (NOT/NAND/NOR/D_FF/D_FF/NOT, 24 pin)
//   74x7075   : Mixed Gate+FF (NOT/NAND/NAND/D_FF/D_FF/NOT, 24 pin)
//   74x7076   : Mixed Gate+FF (NOT/NOR/NOR/D_FF/D_FF/NOT, 24 pin)
//   74x7080   : 16 bit Parity Gen/Check (GENERIC_STUB, 20 pin)
//   74x7132   : Adj Comparator (GENERIC_STUB, 14 pin)
//   74HCU7204 : Dual Inverter (NOT, 8 pin)
//   74x7240   : Octal Inv Buffer (TRI_NOT_LO, 20 pin)
//   74x7241   : Octal Buffer (TRI_BUFFER_LO/HI, 20 pin)
//   74x7244   : Octal Buffer (TRI_BUFFER_LO, 20 pin)
//   74x7245   : Octal Transceiver (TRANSCEIVER_8BIT, 20 pin)
//   74x7266   : Quad XNOR (XNOR, 14 pin)
//   74x7273   : Octal D FF (D_FF_OCTAL, 20 pin)
//   74x7292   : Divider/Timer (GENERIC_STUB, 16 pin)
//   74x7294   : Divider/Timer (GENERIC_STUB, 16 pin)
//   74x7340   : Bus Driver/Reg (GENERIC_STUB, 24 pin)
//   74x7403   : FIFO 64x4 (GENERIC_STUB, 16 pin)

import { CHIPS_BLOCK_62 } from '../chips/chips62.js';
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
  '74x7074', '74x7075', '74x7076', '74x7080', '74x7132',
  '74HCU7204', '74x7240', '74x7241', '74x7244', '74x7245',
  '74x7266', '74x7273', '74x7292', '74x7294', '74x7340', '74x7403',
];

const EXPECTED_SPECS = {
  '74x7074':   { pins: 24, gnd: 12, vcc: 24 },
  '74x7075':   { pins: 24, gnd: 12, vcc: 24 },
  '74x7076':   { pins: 24, gnd: 12, vcc: 24 },
  '74x7080':   { pins: 20, gnd: 10, vcc: 20 },
  '74x7132':   { pins: 14, gnd:  7, vcc: 14 },
  '74HCU7204': { pins:  8, gnd:  4, vcc:  8 },
  '74x7240':   { pins: 20, gnd: 10, vcc: 20 },
  '74x7241':   { pins: 20, gnd: 10, vcc: 20 },
  '74x7244':   { pins: 20, gnd: 10, vcc: 20 },
  '74x7245':   { pins: 20, gnd: 10, vcc: 20 },
  '74x7266':   { pins: 14, gnd:  7, vcc: 14 },
  '74x7273':   { pins: 20, gnd: 10, vcc: 20 },
  '74x7292':   { pins: 16, gnd:  8, vcc: 16 },
  '74x7294':   { pins: 16, gnd:  8, vcc: 16 },
  '74x7340':   { pins: 24, gnd: 12, vcc: 24 },
  '74x7403':   { pins: 16, gnd:  8, vcc: 16 },
};

console.log('\n=== SECTION S: Structure ===');

// S1 - Block has exactly 16 entries
{
  const keys = Object.keys(CHIPS_BLOCK_62);
  assert(keys.length === 16, `S1: block has ${keys.length} entries, expected 16`);
}

// S2 - Every expected chip ID resolves
for (const id of EXPECTED_IDS) {
  const def = CHIPS_BLOCK_62[id];
  assert(!!def, `S2: '${id}' present`);
}

// S3 - Each chip's name starts with "74"
for (const key of Object.keys(CHIPS_BLOCK_62)) {
  const def = CHIPS_BLOCK_62[key];
  assert(def.name && def.name.startsWith('74'), `S3: key=${key} name='${def.name}' starts with 74`);
}

// S4 - pin count, VCC pin, GND pin
for (const [id, spec] of Object.entries(EXPECTED_SPECS)) {
  const def = CHIPS_BLOCK_62[id];
  if (!def) continue;
  assert(def.pins === spec.pins, `S4: ${id} pins=${def.pins} expected ${spec.pins}`);
  assert(def.vcc === spec.vcc,   `S4: ${id} vcc=${def.vcc} expected ${spec.vcc}`);
  assert(def.gnd === spec.gnd,   `S4: ${id} gnd=${def.gnd} expected ${spec.gnd}`);
}

// S5 - Each chip has at least one gate
for (const key of Object.keys(CHIPS_BLOCK_62)) {
  const def = CHIPS_BLOCK_62[key];
  assert(Array.isArray(def.gates) && def.gates.length > 0, `S5: key=${key} gates non-empty`);
}

// S6 - Each chip has a pinout with the correct number of entries
for (const key of Object.keys(CHIPS_BLOCK_62)) {
  const def = CHIPS_BLOCK_62[key];
  assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
    `S6: key=${key} pinout length=${def.pinout?.length} expected ${def.pins}`);
}

// S7 - VCC and GND pins have type 'power'
for (const key of Object.keys(CHIPS_BLOCK_62)) {
  const def = CHIPS_BLOCK_62[key];
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
// SECTION A: 74HCU7204 - Dual Inverter (NOT gates)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: 74HCU7204 (Dual Inverter) ===');

// A1 - Input LOW → Output HIGH
{
  const { world, chip, wm } = setupChipWithPower('74HCU7204');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '1Y', 'A1a: 1A=L → 1Y=H');
  assertPinHigh(sim, chip, '2Y', 'A1b: 2A=L → 2Y=H');
}

// A2 - Input HIGH → Output LOW
{
  const { world, chip, wm } = setupChipWithPower('74HCU7204');
  connectHigh(wm, chip, '1A');
  connectHigh(wm, chip, '2A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '1Y', 'A2a: 1A=H → 1Y=L');
  assertPinLow(sim, chip, '2Y', 'A2b: 2A=H → 2Y=L');
}

// A3 - Mixed inputs
{
  const { world, chip, wm } = setupChipWithPower('74HCU7204');
  connectHigh(wm, chip, '1A');
  connectLow(wm, chip, '2A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '1Y', 'A3a: 1A=H → 1Y=L');
  assertPinHigh(sim, chip, '2Y', 'A3b: 2A=L → 2Y=H');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B: 74x7266 - Quad 2 input XNOR
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x7266 (Quad XNOR) ===');

{
  const combos = [
    { a: 'low', b: 'low', expected: 'high', label: '0,0→1' },
    { a: 'low', b: 'high', expected: 'low', label: '0,1→0' },
    { a: 'high', b: 'low', expected: 'low', label: '1,0→0' },
    { a: 'high', b: 'high', expected: 'high', label: '1,1→1' },
  ];
  for (const gate of [1, 2, 3, 4]) {
    for (const { a, b, expected, label } of combos) {
      const { world, chip, wm } = setupChipWithPower('74x7266');
      if (a === 'high') connectHigh(wm, chip, `${gate}A`);
      else connectLow(wm, chip, `${gate}A`);
      if (b === 'high') connectHigh(wm, chip, `${gate}B`);
      else connectLow(wm, chip, `${gate}B`);
      const sim = simulate(world, wm, chip);
      if (expected === 'high') assertPinHigh(sim, chip, `${gate}Y`, `B: Gate${gate} ${label}`);
      else assertPinLow(sim, chip, `${gate}Y`, `B: Gate${gate} ${label}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: 74x7240 - Octal Inverting Buffer (TRI_NOT_LO)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x7240 (Octal Inv Buffer) ===');

// C1 - OE active (LOW), inputs HIGH → outputs LOW (inverting)
{
  const { world, chip, wm } = setupChipWithPower('74x7240');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectHigh(wm, chip, `1A${i}`);
    connectHigh(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinLow(sim, chip, `1Y${i}`, `C1: 1A${i}=H, OE=L → 1Y${i}=L`);
    assertPinLow(sim, chip, `2Y${i}`, `C1: 2A${i}=H, OE=L → 2Y${i}=L`);
  }
}

// C2 - OE active (LOW), inputs LOW → outputs HIGH (inverting)
{
  const { world, chip, wm } = setupChipWithPower('74x7240');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectLow(wm, chip, `1A${i}`);
    connectLow(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinHigh(sim, chip, `1Y${i}`, `C2: 1A${i}=L, OE=L → 1Y${i}=H`);
    assertPinHigh(sim, chip, `2Y${i}`, `C2: 2A${i}=L, OE=L → 2Y${i}=H`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D: 74x7241 - Octal Buffer (TRI_BUFFER_LO bank1 / TRI_BUFFER_HI bank2)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x7241 (Octal Buffer LO/HI) ===');

// D1 - Bank 1: OE=LOW (active), inputs HIGH → outputs HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7241');
  connectLow(wm, chip, '1OE');   // active low → enable
  connectHigh(wm, chip, '2OE');  // active high → enable
  for (let i = 1; i <= 4; i++) {
    connectHigh(wm, chip, `1A${i}`);
    connectHigh(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinHigh(sim, chip, `1Y${i}`, `D1: 1A${i}=H, 1OE=L → 1Y${i}=H`);
    assertPinHigh(sim, chip, `2Y${i}`, `D1: 2A${i}=H, 2OE=H → 2Y${i}=H`);
  }
}

// D2 - Bank 1: OE=LOW, inputs LOW → outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7241');
  connectLow(wm, chip, '1OE');
  connectHigh(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectLow(wm, chip, `1A${i}`);
    connectLow(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinLow(sim, chip, `1Y${i}`, `D2: 1A${i}=L, 1OE=L → 1Y${i}=L`);
    assertPinLow(sim, chip, `2Y${i}`, `D2: 2A${i}=L, 2OE=H → 2Y${i}=L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: 74x7244 - Octal Buffer (TRI_BUFFER_LO both banks)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: 74x7244 (Octal Buffer) ===');

// E1 - Both OE active (LOW), inputs HIGH → outputs HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7244');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectHigh(wm, chip, `1A${i}`);
    connectHigh(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinHigh(sim, chip, `1Y${i}`, `E1: 1A${i}=H, OE=L → 1Y${i}=H`);
    assertPinHigh(sim, chip, `2Y${i}`, `E1: 2A${i}=H, OE=L → 2Y${i}=H`);
  }
}

// E2 - Both OE active (LOW), inputs LOW → outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7244');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectLow(wm, chip, `1A${i}`);
    connectLow(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinLow(sim, chip, `1Y${i}`, `E2: 1A${i}=L, OE=L → 1Y${i}=L`);
    assertPinLow(sim, chip, `2Y${i}`, `E2: 2A${i}=L, OE=L → 2Y${i}=L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F: 74x7245 - Octal Bus Transceiver
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: 74x7245 (Octal Transceiver) ===');

// F1 - DIR=HIGH, OE=LOW → A drives B (A=HIGH → B=HIGH)
{
  const { world, chip, wm } = setupChipWithPower('74x7245');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `B${i}`, `F1: DIR=H OE=L A${i}=H → B${i}=H`);
  }
}

// F2 - DIR=HIGH, OE=LOW → A drives B (A=LOW → B=LOW)
{
  const { world, chip, wm } = setupChipWithPower('74x7245');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `B${i}`, `F2: DIR=H OE=L A${i}=L → B${i}=L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G: 74x7273 - Octal D Flip Flop
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION G: 74x7273 (Octal D FF) ===');

// G1 - CLR=LOW (active low) → all Q outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7273');
  connectLow(wm, chip, 'CLR');
  connectLow(wm, chip, 'CLK');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `${i}D`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `${i}Q`, `G1: CLR=L → ${i}Q=L`);
  }
}

// G2 - Clock rising edge with D=HIGH, CLR=HIGH → Q=HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7273');
  connectHigh(wm, chip, 'CLR');
  connectLow(wm, chip, 'CLK');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `${i}D`);
  // First eval with CLK=LOW
  simulate(world, wm, chip);
  // Rising edge
  reconnectHigh(wm, chip, 'CLK');
  const sim2 = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim2, chip, `${i}Q`, `G2: CLK↑ D=H CLR=H → ${i}Q=H`);
  }
}

// G3 - Clock rising edge with D=LOW, CLR=HIGH → Q=LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7273');
  connectHigh(wm, chip, 'CLR');
  connectLow(wm, chip, 'CLK');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `${i}D`);
  simulate(world, wm, chip);
  reconnectHigh(wm, chip, 'CLK');
  const sim2 = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim2, chip, `${i}Q`, `G3: CLK↑ D=L CLR=H → ${i}Q=L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H: 74x7074 - Mixed: 2×NOT + 1×NAND + 1×NOR + 2×D_FF
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION H: 74x7074 (Mixed NOT/NAND/NOR/D_FF) ===');

// H1 - Inverter 1: 1A=L → 1Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  // Must also connect FF controls to avoid floating
  connectHigh(wm, chip, '4PRE');
  connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK');
  connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE');
  connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK');
  connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  connectLow(wm, chip, '2A');
  connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A');
  connectLow(wm, chip, '3B');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '1Y', 'H1: 1A=L → 1Y=H');
}

// H2 - Inverter 1: 1A=H → 1Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectHigh(wm, chip, '1A');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '1Y', 'H2: 1A=H → 1Y=L');
}

// H3 - NAND: 2A=H, 2B=H → 2Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectHigh(wm, chip, '2A'); connectHigh(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '2Y', 'H3: 2A=H,2B=H → 2Y=L (NAND)');
}

// H4 - NAND: 2A=L, 2B=H → 2Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectHigh(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '2Y', 'H4: 2A=L,2B=H → 2Y=H (NAND)');
}

// H5 - NOR: 3A=L, 3B=L → 3Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '3Y', 'H5: 3A=L,3B=L → 3Y=H (NOR)');
}

// H6 - NOR: 3A=H, 3B=L → 3Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectHigh(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '3Y', 'H6: 3A=H,3B=L → 3Y=L (NOR)');
}

// H7 - Inverter 2: 6A=H → 6Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectHigh(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '6Y', 'H7: 6A=H → 6Y=L');
}

// H8 - D-FF 1: CLR=LOW → Q=LOW, Qn=HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectLow(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectHigh(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '4Q',  'H8a: CLR=L → 4Q=L');
  assertPinHigh(sim, chip, '4Qn', 'H8b: CLR=L → 4Qn=H');
}

// H9 - D-FF 1: PRE=LOW → Q=HIGH, Qn=LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectLow(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '4Q',  'H9a: PRE=L → 4Q=H');
  assertPinLow(sim, chip, '4Qn', 'H9b: PRE=L → 4Qn=L');
}

// H10 - D-FF 1: Clock rising edge D=HIGH → Q=HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectHigh(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  simulate(world, wm, chip); // CLK=LOW first
  reconnectHigh(wm, chip, '4CLK');
  const sim2 = simulate(world, wm, chip);
  assertPinHigh(sim2, chip, '4Q',  'H10a: CLK↑ D=H → 4Q=H');
  assertPinLow(sim2, chip, '4Qn', 'H10b: CLK↑ D=H → 4Qn=L');
}

// H11 - D-FF 2: Clock rising edge D=HIGH → Q=HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7074');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectHigh(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  simulate(world, wm, chip);
  reconnectHigh(wm, chip, '5CLK');
  const sim2 = simulate(world, wm, chip);
  assertPinHigh(sim2, chip, '5Q',  'H11a: CLK↑ D=H → 5Q=H');
  assertPinLow(sim2, chip, '5Qn', 'H11b: CLK↑ D=H → 5Qn=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION I: 74x7075 - Mixed: 2×NOT + 2×NAND + 2×D_FF
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION I: 74x7075 (Mixed NOT/NAND/NAND/D_FF) ===');

// I1 - Inverter 1: 1A=L → 1Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7075');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '1Y', 'I1: 1A=L → 1Y=H');
}

// I2 - NAND gate 2: A=H, B=H → Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7075');
  connectLow(wm, chip, '1A');
  connectHigh(wm, chip, '2A'); connectHigh(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '2Y', 'I2: 2A=H,2B=H → 2Y=L (NAND)');
}

// I3 - NAND gate 3: A=H, B=H → Y=L (both gates are NAND)
{
  const { world, chip, wm } = setupChipWithPower('74x7075');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectHigh(wm, chip, '3A'); connectHigh(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '3Y', 'I3: 3A=H,3B=H → 3Y=L (NAND)');
}

// I4 - NAND gate 3: A=L, B=H → Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7075');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectHigh(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '3Y', 'I4: 3A=L,3B=H → 3Y=H (NAND)');
}

// I5 - D-FF 1 clock rising edge
{
  const { world, chip, wm } = setupChipWithPower('74x7075');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectHigh(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  simulate(world, wm, chip);
  reconnectHigh(wm, chip, '4CLK');
  const sim2 = simulate(world, wm, chip);
  assertPinHigh(sim2, chip, '4Q',  'I5a: CLK↑ D=H → 4Q=H');
  assertPinLow(sim2, chip, '4Qn', 'I5b: CLK↑ D=H → 4Qn=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION J: 74x7076 - Mixed: 2×NOT + 2×NOR + 2×D_FF
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION J: 74x7076 (Mixed NOT/NOR/NOR/D_FF) ===');

// J1 - Inverter 1: 1A=H → 1Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7076');
  connectHigh(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '1Y', 'J1: 1A=H → 1Y=L');
}

// J2 - NOR gate 2: A=L, B=L → Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7076');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '2Y', 'J2: 2A=L,2B=L → 2Y=H (NOR)');
}

// J3 - NOR gate 2: A=H, B=L → Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7076');
  connectLow(wm, chip, '1A');
  connectHigh(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '2Y', 'J3: 2A=H,2B=L → 2Y=L (NOR)');
}

// J4 - NOR gate 3: A=L, B=H → Y=L
{
  const { world, chip, wm } = setupChipWithPower('74x7076');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectHigh(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '3Y', 'J4: 3A=L,3B=H → 3Y=L (NOR)');
}

// J5 - NOR gate 3: A=L, B=L → Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7076');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '3Y', 'J5: 3A=L,3B=L → 3Y=H (NOR)');
}

// J6 - D-FF 1 clear
{
  const { world, chip, wm } = setupChipWithPower('74x7076');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectLow(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectHigh(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '4Q',  'J6a: CLR=L → 4Q=L');
  assertPinHigh(sim, chip, '4Qn', 'J6b: CLR=L → 4Qn=H');
}

// J7 - Inverter 2: 6A=L → 6Y=H
{
  const { world, chip, wm } = setupChipWithPower('74x7076');
  connectLow(wm, chip, '1A');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectHigh(wm, chip, '4PRE'); connectHigh(wm, chip, '4CLR');
  connectLow(wm, chip, '4CLK'); connectLow(wm, chip, '4D');
  connectHigh(wm, chip, '5PRE'); connectHigh(wm, chip, '5CLR');
  connectLow(wm, chip, '5CLK'); connectLow(wm, chip, '5D');
  connectLow(wm, chip, '6A');
  const sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '6Y', 'J7: 6A=L → 6Y=H');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION K: Stub chips - just verify they can be instantiated and evaluated
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION K: Stub chips ===');

const STUB_IDS = ['74x7080', '74x7132', '74x7292', '74x7294', '74x7340', '74x7403'];

for (const id of STUB_IDS) {
  try {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = simulate(world, wm, chip);
    assert(true, `K: ${id} instantiated and simulated`);
  } catch (e) {
    fail++; console.error(`  ✗ K: ${id} failed: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n──────────────────────────────`);
console.log(`RESULTS: ${pass} passed, ${fail} failed`);
console.log(`──────────────────────────────`);
if (fail > 0) process.exit(1);
