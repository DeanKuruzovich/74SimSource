// test-chips63.mjs - Tests for all chips defined in js/chips/chips63.js
// Implemented: 74x7540, 74x7541, 74x7623, 74x7640, 74x7645, 74x7793, 74x8003, 74x8240
// Stubs: 74x7404, 74x7597, 74x7643, 74x7731, 74x8151, 74x8153, 74x8154, 74x8161

import { CHIPS_BLOCK_63 } from '../chips/chips63.js';
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
// Find the supply pin. Most parts name it 'VCC'/'GND'; dual-supply parts (e.g.
// 74x8153 with VCC1/VCC2 + GND/GND2) do not, so fall back to the pin number the
// chip def declares in its `vcc`/`gnd` field.
function findPowerPin(chip, name, defPinNo) {
  return findPin(chip, name) ||
    chip.pins.find(p => p.pin === defPinNo || p.name === `${name}2`);
}
function setupChipWithPower(chipId) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(chipId);
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  connectPinToVcc(wm, findPowerPin(chip, 'VCC', chip.chipDef?.vcc));
  connectPinToGnd(wm, findPowerPin(chip, 'GND', chip.chipDef?.gnd));
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
  '74x7404', '74x7540', '74x7541', '74x7597', '74x7623',
  '74x7640', '74x7643', '74x7645', '74x7731', '74x7793',
  '74x8003', '74x8151', '74x8153', '74x8154', '74x8161', '74x8240',
];

const EXPECTED_SPECS = {
  '74x7404': { pins: 18, gnd:  9, vcc: 18 },
  '74x7540': { pins: 20, gnd: 10, vcc: 20 },
  '74x7541': { pins: 20, gnd: 10, vcc: 20 },
  '74x7597': { pins: 16, gnd:  8, vcc: 16 },
  '74x7623': { pins: 20, gnd: 10, vcc: 20 },
  '74x7640': { pins: 20, gnd: 10, vcc: 20 },
  '74x7643': { pins: 20, gnd: 10, vcc: 20 },
  '74x7645': { pins: 20, gnd: 10, vcc: 20 },
  '74x7731': { pins: 16, gnd:  8, vcc: 16 },
  '74x7793': { pins: 20, gnd: 10, vcc: 20 },
  '74x8003': { pins:  8, gnd:  4, vcc:  8 },
  '74x8151': { pins: 24, gnd: 12, vcc: 24 },
  '74x8153': { pins: 20, gnd: 10, vcc: 20 },
  '74x8154': { pins: 20, gnd: 10, vcc: 20 },
  '74x8161': { pins: 24, gnd: 12, vcc: 24 },
  '74x8240': { pins: 24, gnd: 12, vcc: 24 },
};

console.log('\n=== SECTION S: Structure ===');

// S1 - 16 entries
{
  const keys = Object.keys(CHIPS_BLOCK_63);
  assert(keys.length === 16, `S1: block has ${keys.length} entries, expected 16`);
}
// S2 - All expected IDs present
for (const id of EXPECTED_IDS) {
  assert(!!CHIPS_BLOCK_63[id], `S2: '${id}' present`);
}
// S3 - Names start with 74
for (const key of Object.keys(CHIPS_BLOCK_63)) {
  const def = CHIPS_BLOCK_63[key];
  assert(def.name && def.name.startsWith('74'), `S3: key=${key} name starts with 74`);
}
// S4 - Pin counts, VCC, GND
for (const [id, spec] of Object.entries(EXPECTED_SPECS)) {
  const def = CHIPS_BLOCK_63[id];
  if (!def) continue;
  assert(def.pins === spec.pins, `S4: ${id} pins=${def.pins} expected ${spec.pins}`);
  assert(def.vcc === spec.vcc,   `S4: ${id} vcc=${def.vcc} expected ${spec.vcc}`);
  assert(def.gnd === spec.gnd,   `S4: ${id} gnd=${def.gnd} expected ${spec.gnd}`);
}
// S5 - Gates non-empty
for (const key of Object.keys(CHIPS_BLOCK_63)) {
  const def = CHIPS_BLOCK_63[key];
  assert(Array.isArray(def.gates) && def.gates.length > 0, `S5: key=${key} gates non-empty`);
}
// S6 - Pinout length matches pin count
for (const key of Object.keys(CHIPS_BLOCK_63)) {
  const def = CHIPS_BLOCK_63[key];
  assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
    `S6: key=${key} pinout length=${def.pinout?.length} expected ${def.pins}`);
}
// S7 - the declared supply pins (def.vcc / def.gnd) have type 'power'.
// Keyed off the pin numbers rather than the literal name 'VCC'/'GND' so that
// dual-supply parts (e.g. 74x8153: VCC1/VCC2, GND/GND2) are accepted.
for (const key of Object.keys(CHIPS_BLOCK_63)) {
  const def = CHIPS_BLOCK_63[key];
  const vcc = def.pinout.find(p => p.pin === def.vcc);
  const gnd = def.pinout.find(p => p.pin === def.gnd);
  assert(vcc && vcc.type === 'power', `S7: key=${key} VCC power`);
  assert(gnd && gnd.type === 'power', `S7: key=${key} GND power`);
}
// S8 - Instantiation
for (const id of EXPECTED_IDS) {
  try {
    const chip = new ChipComponent(id);
    chip.place(0, 0, 10, 4);
    assert(chip.pins.length > 0, `S8: ${id} placed with ${chip.pins.length} pins`);
  } catch (e) {
    fail++; console.error(`  ✗ S8: ${id} failed: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A: 74x8003 - Dual 2 input NAND
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: 74x8003 (Dual NAND) ===');

{
  const combos = [
    { a: 'low', b: 'low', expected: 'high', label: '0,0→1' },
    { a: 'low', b: 'high', expected: 'high', label: '0,1→1' },
    { a: 'high', b: 'low', expected: 'high', label: '1,0→1' },
    { a: 'high', b: 'high', expected: 'low', label: '1,1→0' },
  ];
  for (const gate of [1, 2]) {
    for (const { a, b, expected, label } of combos) {
      const { world, chip, wm } = setupChipWithPower('74x8003');
      if (a === 'high') connectHigh(wm, chip, `${gate}A`);
      else connectLow(wm, chip, `${gate}A`);
      if (b === 'high') connectHigh(wm, chip, `${gate}B`);
      else connectLow(wm, chip, `${gate}B`);
      const sim = simulate(world, wm, chip);
      if (expected === 'high') assertPinHigh(sim, chip, `${gate}Y`, `A: Gate${gate} ${label}`);
      else assertPinLow(sim, chip, `${gate}Y`, `A: Gate${gate} ${label}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B: 74x7540 - Octal Inverting Buffer (TRI_NOT_LO)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x7540 (Octal Inv Buffer) ===');

// B1 - OE active (LOW), inputs HIGH → outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7540');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectHigh(wm, chip, `1A${i}`);
    connectHigh(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinLow(sim, chip, `1Y${i}`, `B1: 1A${i}=H OE=L → 1Y${i}=L`);
    assertPinLow(sim, chip, `2Y${i}`, `B1: 2A${i}=H OE=L → 2Y${i}=L`);
  }
}

// B2 - OE active (LOW), inputs LOW → outputs HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7540');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectLow(wm, chip, `1A${i}`);
    connectLow(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinHigh(sim, chip, `1Y${i}`, `B2: 1A${i}=L OE=L → 1Y${i}=H`);
    assertPinHigh(sim, chip, `2Y${i}`, `B2: 2A${i}=L OE=L → 2Y${i}=H`);
  }
}

// B3 - Mixed: bank 1 enabled, bank 2 disabled
{
  const { world, chip, wm } = setupChipWithPower('74x7540');
  connectLow(wm, chip, '1OE');    // enable
  connectHigh(wm, chip, '2OE');   // disable
  for (let i = 1; i <= 4; i++) {
    connectHigh(wm, chip, `1A${i}`);
    connectHigh(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinLow(sim, chip, `1Y${i}`, `B3: 1A${i}=H 1OE=L → 1Y${i}=L`);
    // 2Y outputs are hi-Z when 2OE=H - skip voltage check
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: 74x7541 - Octal Buffer (TRI_BUFFER_DUAL_OE)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x7541 (Octal Buffer Dual OE) ===');

// C1 - Both OE=LOW, inputs HIGH → outputs HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x7541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `Y${i}`, `C1: A${i}=H OE=LL → Y${i}=H`);
  }
}

// C2 - Both OE=LOW, inputs LOW → outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `Y${i}`, `C2: A${i}=L OE=LL → Y${i}=L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D: 74x7623 - Octal Transceiver
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x7623 (Octal Transceiver) ===');

// D1 - DIR=HIGH, OE=LOW → A drives B (A=HIGH → B=HIGH)
{
  const { world, chip, wm } = setupChipWithPower('74x7623');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `B${i}`, `D1: DIR=H OE=L A${i}=H → B${i}=H`);
  }
}

// D2 - DIR=HIGH, OE=LOW → A drives B (A=LOW → B=LOW)
{
  const { world, chip, wm } = setupChipWithPower('74x7623');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `B${i}`, `D2: DIR=H OE=L A${i}=L → B${i}=L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: 74x7640 - Octal Inverting Transceiver
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: 74x7640 (Octal Inv Transceiver) ===');

// E1 - DIR=HIGH, OEn=LOW → A drives B inverted (A=HIGH → B=LOW)
{
  const { world, chip, wm } = setupChipWithPower('74x7640');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `B${i}`, `E1: DIR=H OEn=L A${i}=H → B${i}=L (inv)`);
  }
}

// E2 - DIR=HIGH, OEn=LOW → A drives B inverted (A=LOW → B=HIGH)
{
  const { world, chip, wm } = setupChipWithPower('74x7640');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `B${i}`, `E2: DIR=H OEn=L A${i}=L → B${i}=H (inv)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F: 74x7645 - Octal Transceiver (Schmitt)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: 74x7645 (Octal Transceiver ST) ===');

// F1 - DIR=HIGH, OE=LOW → A drives B
{
  const { world, chip, wm } = setupChipWithPower('74x7645');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `B${i}`, `F1: DIR=H OE=L A${i}=H → B${i}=H`);
  }
}

// F2 - DIR=HIGH, OE=LOW → A=LOW → B=LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7645');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `B${i}`, `F2: DIR=H OE=L A${i}=L → B${i}=L`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G: 74x7793 - Octal D Transparent Latch
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION G: 74x7793 (Octal D Latch) ===');

// G1 - LE=HIGH (transparent), OE=LOW → D passes through to Q
{
  const { world, chip, wm } = setupChipWithPower('74x7793');
  connectHigh(wm, chip, 'LE');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `${i}D`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `${i}Q`, `G1: LE=H OE=L ${i}D=H → ${i}Q=H`);
  }
}

// G2 - LE=HIGH, OE=LOW, D=LOW → Q=LOW
{
  const { world, chip, wm } = setupChipWithPower('74x7793');
  connectHigh(wm, chip, 'LE');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `${i}D`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `${i}Q`, `G2: LE=H OE=L ${i}D=L → ${i}Q=L`);
  }
}

// G3 - LE goes LOW (latched), D changes → Q stays
{
  const { world, chip, wm } = setupChipWithPower('74x7793');
  connectHigh(wm, chip, 'LE');
  connectLow(wm, chip, 'OE');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `${i}D`);
  simulate(world, wm, chip); // Latch HIGH values
  // Now latch: LE=LOW
  reconnectLow(wm, chip, 'LE');
  // Change D to LOW
  for (let i = 1; i <= 8; i++) reconnectLow(wm, chip, `${i}D`);
  const sim2 = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim2, chip, `${i}Q`, `G3: LE=L (latched) D→L → ${i}Q stays H`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H: 74x8240 - Octal Inverting Buffer w/ JTAG (TRI_NOT_LO)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION H: 74x8240 (Octal Inv Buffer JTAG) ===');

// H1 - Both OE LOW, inputs HIGH → outputs LOW (inverted)
{
  const { world, chip, wm } = setupChipWithPower('74x8240');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectHigh(wm, chip, `1A${i}`);
    connectHigh(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinLow(sim, chip, `1Y${i}`, `H1: 1A${i}=H 1OE=L → 1Y${i}=L`);
    assertPinLow(sim, chip, `2Y${i}`, `H1: 2A${i}=H 2OE=L → 2Y${i}=L`);
  }
}

// H2 - Both OE LOW, inputs LOW → outputs HIGH (inverted)
{
  const { world, chip, wm } = setupChipWithPower('74x8240');
  connectLow(wm, chip, '1OE');
  connectLow(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectLow(wm, chip, `1A${i}`);
    connectLow(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinHigh(sim, chip, `1Y${i}`, `H2: 1A${i}=L 1OE=L → 1Y${i}=H`);
    assertPinHigh(sim, chip, `2Y${i}`, `H2: 2A${i}=L 2OE=L → 2Y${i}=H`);
  }
}

// H3 - Bank 1 enabled, bank 2 disabled: bank 1 inverts, bank 2 Hi-Z
{
  const { world, chip, wm } = setupChipWithPower('74x8240');
  connectLow(wm, chip, '1OE');
  connectHigh(wm, chip, '2OE');
  for (let i = 1; i <= 4; i++) {
    connectHigh(wm, chip, `1A${i}`);
    connectHigh(wm, chip, `2A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 4; i++) {
    assertPinLow(sim, chip, `1Y${i}`, `H3: 1A${i}=H 1OE=L → 1Y${i}=L`);
    // 2Y outputs are Hi-Z when 2OE=H - skip voltage check
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION K: Stub chips - instantiate and evaluate
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION K: Stub chips ===');

const STUB_IDS = ['74x7404', '74x7597', '74x7643', '74x7731', '74x8151', '74x8153', '74x8154', '74x8161'];

for (const id of STUB_IDS) {
  try {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = simulate(world, wm, chip);
    assert(true, `K: ${id} simulated OK`);
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
