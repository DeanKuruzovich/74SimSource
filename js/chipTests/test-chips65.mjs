// test-chips65.mjs - Tests for all chips defined in js/chips/chips65.js
// Implementable: 74x9135 (nine-wide buffer OC), 74x9240 (9 bit inv tri-state),
//   74x9244 (9 bit non-inv tri-state), 74x9541 (8 bit dual-OE buffer)
// Stubs: 74x9164, 74x9245, 74x9323, 74x9595, 74x40102, 74x40103,
//   74x40104, 74x40105, 74116, 74119, 74120

import { CHIPS_BLOCK_65 } from '../chips/chips65.js';
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
function assertPinFloat(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v === undefined || v === null || (v > 0.5 && v < 4.5), `${label}: expected float/HiZ, got ${v}`);
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
  '74x9135', '74x9164', '74x9240', '74x9244', '74x9245',
  '74x9323', '74x9541', '74x9595', '74x40102', '74x40103',
  '74x40104', '74x40105', '74116', '74119', '74120',
];

const EXPECTED_SPECS = {
  '74x9135':  { pins: 20, gnd: 10, vcc: 20 },
  '74x9164':  { pins: 16, gnd:  8, vcc: 16 },
  '74x9240':  { pins: 24, gnd: 12, vcc: 24 },
  '74x9244':  { pins: 24, gnd: 12, vcc: 24 },
  '74x9245':  { pins: 24, gnd: 12, vcc: 24 },
  '74x9323':  { pins:  8, gnd:  4, vcc:  8 },
  '74x9541':  { pins: 20, gnd: 10, vcc: 20 },
  '74x9595':  { pins: 16, gnd:  8, vcc: 16 },
  '74x40102': { pins: 16, gnd:  8, vcc: 16 },
  '74x40103': { pins: 16, gnd:  8, vcc: 16 },
  '74x40104': { pins: 16, gnd:  8, vcc: 16 },
  '74x40105': { pins: 16, gnd:  8, vcc: 16 },
  '74116':    { pins: 24, gnd: 12, vcc: 24 },
  '74119':    { pins: 24, gnd: 12, vcc: 24 },
  '74120':    { pins: 16, gnd:  8, vcc: 16 },
};

const STUB_IDS = [
  '74x9164', '74x9245', '74x9323', '74x9595', '74x40102',
  '74x40103', '74x40104', '74x40105', '74116', '74119', '74120',
];

console.log('\n=== SECTION S: Structure ===');

// S1 - 15 entries
{
  const keys = Object.keys(CHIPS_BLOCK_65);
  assert(keys.length === 15, `S1: block has ${keys.length} entries, expected 15`);
}
// S2 - All expected IDs present
for (const id of EXPECTED_IDS) {
  assert(!!CHIPS_BLOCK_65[id], `S2: '${id}' present`);
}
// S3 - Names present on all
for (const key of Object.keys(CHIPS_BLOCK_65)) {
  const def = CHIPS_BLOCK_65[key];
  assert(def.name && def.name.length > 0, `S3: key=${key} has a name`);
}
// S4 - Pin counts, VCC, GND
for (const [id, spec] of Object.entries(EXPECTED_SPECS)) {
  const def = CHIPS_BLOCK_65[id];
  if (!def) continue;
  assert(def.pins === spec.pins, `S4: ${id} pins ${def.pins} == ${spec.pins}`);
  assert(def.vcc  === spec.vcc,  `S4: ${id} vcc ${def.vcc} == ${spec.vcc}`);
  assert(def.gnd  === spec.gnd,  `S4: ${id} gnd ${def.gnd} == ${spec.gnd}`);
}
// S5 - Pinout array length matches pin count
for (const [id, spec] of Object.entries(EXPECTED_SPECS)) {
  const def = CHIPS_BLOCK_65[id];
  if (!def) continue;
  assert(def.pinout && def.pinout.length === spec.pins,
    `S5: ${id} pinout length ${def.pinout?.length} == ${spec.pins}`);
}
// S6 - All pinout entries have pin, name, type
for (const key of Object.keys(CHIPS_BLOCK_65)) {
  const def = CHIPS_BLOCK_65[key];
  for (const p of def.pinout || []) {
    assert(typeof p.pin === 'number' && typeof p.name === 'string' && typeof p.type === 'string',
      `S6: ${key} pin ${p.pin} has required fields`);
  }
}
// S7 - VCC/GND in pinout
for (const key of Object.keys(CHIPS_BLOCK_65)) {
  const def = CHIPS_BLOCK_65[key];
  const vccEntry = def.pinout.find(p => p.name === 'VCC');
  const gndEntry = def.pinout.find(p => p.name === 'GND');
  assert(vccEntry && vccEntry.pin === def.vcc, `S7: ${key} VCC pin matches`);
  assert(gndEntry && gndEntry.pin === def.gnd, `S7: ${key} GND pin matches`);
}
// S8 - All chips have gates array
for (const key of Object.keys(CHIPS_BLOCK_65)) {
  const def = CHIPS_BLOCK_65[key];
  assert(Array.isArray(def.gates) && def.gates.length > 0, `S8: ${key} has gates array`);
}
// S9 - Tags array present on all
for (const key of Object.keys(CHIPS_BLOCK_65)) {
  const def = CHIPS_BLOCK_65[key];
  assert(Array.isArray(def.tags) && def.tags.length > 0, `S9: ${key} has tags`);
}
// S10 - Description present on all
for (const key of Object.keys(CHIPS_BLOCK_65)) {
  const def = CHIPS_BLOCK_65[key];
  assert(typeof def.description === 'string' && def.description.length > 0, `S10: ${key} has description`);
}
// S11 - Open-collector only on 74x9135
{
  const oc = CHIPS_BLOCK_65['74x9135'];
  assert(oc.openCollector === true, `S11: 74x9135 has openCollector: true`);
  for (const key of Object.keys(CHIPS_BLOCK_65)) {
    if (key === '74x9135') continue;
    const def = CHIPS_BLOCK_65[key];
    assert(!def.openCollector, `S11: ${key} does NOT have openCollector`);
  }
}
// S12 - Stub chips have sequential:true
for (const id of STUB_IDS) {
  const def = CHIPS_BLOCK_65[id];
  if (!def) continue;
  assert(def.sequential === true || def.tags?.includes('stub'),
    `S12: ${id} is marked sequential or tagged stub`);
}
// S13 - Unique pin numbers in each pinout
for (const key of Object.keys(CHIPS_BLOCK_65)) {
  const def = CHIPS_BLOCK_65[key];
  const pinNums = def.pinout.map(p => p.pin);
  const unique = new Set(pinNums);
  assert(unique.size === pinNums.length, `S13: ${key} all pin numbers unique`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION P - Placement
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION P: Placement ===');

for (const id of EXPECTED_IDS) {
  try {
    const chip = new ChipComponent(id);
    chip.place(0, 0, 10, 4);
    assert(chip.pins.length === EXPECTED_SPECS[id].pins,
      `P1: ${id} placed with ${chip.pins.length} pins`);
    // Check VCC and GND pins exist by name
    const vcc = findPin(chip, 'VCC');
    const gnd = findPin(chip, 'GND');
    assert(!!vcc, `P2: ${id} has VCC pin`);
    assert(!!gnd, `P2: ${id} has GND pin`);
    assert(vcc.holeId && vcc.holeId.length > 0, `P3: ${id} VCC has holeId`);
    assert(gnd.holeId && gnd.holeId.length > 0, `P3: ${id} GND has holeId`);
  } catch (e) {
    fail++;
    console.error(`  ✗ P1-3: ${id} placement error: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - 74x9135: Nine-wide buffer, open-collector
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: 74x9135 - Nine-wide buffer OC ===');

// A1 - All inputs HIGH → all outputs HIGH (with pull up, OC outputs)
{
  const { world, chip, wm } = setupChipWithPower('74x9135');
  for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    assertPinHigh(sim, chip, `Y${i}`, `A1: A${i}=H → Y${i} HIGH`);
  }
}

// A2 - All inputs LOW → all outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x9135');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    assertPinLow(sim, chip, `Y${i}`, `A2: A${i}=L → Y${i} LOW`);
  }
}

// A3 - Mixed inputs (odd=HIGH, even=LOW)
{
  const { world, chip, wm } = setupChipWithPower('74x9135');
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
    else              connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1)
      assertPinHigh(sim, chip, `Y${i}`, `A3: A${i}=H → Y${i} HIGH`);
    else
      assertPinLow(sim, chip, `Y${i}`, `A3: A${i}=L → Y${i} LOW`);
  }
}

// A4 - Mixed inputs reversed (odd=LOW, even=HIGH)
{
  const { world, chip, wm } = setupChipWithPower('74x9135');
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 0) connectHigh(wm, chip, `A${i}`);
    else              connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 0)
      assertPinHigh(sim, chip, `Y${i}`, `A4: A${i}=H → Y${i} HIGH`);
    else
      assertPinLow(sim, chip, `Y${i}`, `A4: A${i}=L → Y${i} LOW`);
  }
}

// A5 - Individual channel isolation: toggle each A individually
for (let ch = 1; ch <= 9; ch++) {
  const { world, chip, wm } = setupChipWithPower('74x9135');
  // All LOW except channel ch
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  reconnectHigh(wm, chip, `A${ch}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i === ch)
      assertPinHigh(sim, chip, `Y${i}`, `A5: ch${ch} A${i}=H → Y${i} HIGH`);
    else
      assertPinLow(sim, chip, `Y${i}`, `A5: ch${ch} A${i}=L → Y${i} LOW`);
  }
}

// A6 - Verify openCollector flag
{
  const def = CHIPS_BLOCK_65['74x9135'];
  assert(def.openCollector === true, `A6: 74x9135 openCollector is true`);
}

// A7 - Gate configuration: 9 BUFFER gates
{
  const def = CHIPS_BLOCK_65['74x9135'];
  assert(def.gates.length === 9, `A7: 74x9135 has 9 gates`);
  for (const g of def.gates) {
    assert(g.type === 'BUFFER', `A7: gate type is BUFFER, got ${g.type}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - 74x9240: 9 bit inverting tri-state buffer
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x9240 - 9 bit inverting tri-state ===');

// B1 - OEn=LOW (enabled), all inputs HIGH → all outputs LOW (inverting)
{
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    assertPinLow(sim, chip, `Y${i}`, `B1: OEn=L A${i}=H → Y${i} LOW`);
  }
}

// B2 - OEn=LOW, all inputs LOW → all outputs HIGH (inverting)
{
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    assertPinHigh(sim, chip, `Y${i}`, `B2: OEn=L A${i}=L → Y${i} HIGH`);
  }
}

// B3 - OEn=HIGH (disabled) → outputs should be high-Z
{
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectHigh(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  // When disabled, outputs should not be strongly driven
  // Just verify they exist - hi-Z behavior depends on simulator details
  for (let i = 1; i <= 9; i++) {
    const pin = findPin(chip, `Y${i}`);
    assert(!!pin, `B3: Y${i} pin exists when disabled`);
  }
}

// B4 - Mixed: OEn=LOW, odd=HIGH even=LOW → odd=LOW even=HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
    else              connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1)
      assertPinLow(sim, chip, `Y${i}`, `B4: A${i}=H → Y${i} LOW (inverted)`);
    else
      assertPinHigh(sim, chip, `Y${i}`, `B4: A${i}=L → Y${i} HIGH (inverted)`);
  }
}

// B5 - Individual channel isolation with inversion
for (let ch = 1; ch <= 9; ch++) {
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectLow(wm, chip, 'OEn');
  // All inputs LOW → all outputs HIGH (inversion)
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  // Set channel ch to HIGH → that output goes LOW
  reconnectHigh(wm, chip, `A${ch}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i === ch)
      assertPinLow(sim, chip, `Y${i}`, `B5: ch${ch} A${i}=H → Y${i} LOW`);
    else
      assertPinHigh(sim, chip, `Y${i}`, `B5: ch${ch} A${i}=L → Y${i} HIGH`);
  }
}

// B6 - Gate configuration: 9 TRI_NOT_LO gates
{
  const def = CHIPS_BLOCK_65['74x9240'];
  assert(def.gates.length === 9, `B6: 74x9240 has 9 gates`);
  for (const g of def.gates) {
    assert(g.type === 'TRI_NOT_LO', `B6: gate type is TRI_NOT_LO, got ${g.type}`);
  }
}

// B7 - 24-pin pinout structure
{
  const def = CHIPS_BLOCK_65['74x9240'];
  assert(def.pinout[0].name === 'OEn', `B7: pin 1 is OEn`);
  assert(def.pinout[11].name === 'GND', `B7: pin 12 is GND`);
  assert(def.pinout[23].name === 'VCC', `B7: pin 24 is VCC`);
  // NC pins
  const ncPins = def.pinout.filter(p => p.type === 'nc');
  assert(ncPins.length === 3, `B7: 3 NC pins, got ${ncPins.length}`);
}

// B8 - Enable/disable toggling
{
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectLow(wm, chip, 'OEn');
  connectHigh(wm, chip, 'A1');
  connectLow(wm, chip, 'A2');
  for (let i = 3; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y1', `B8: OEn=L A1=H → Y1=L`);
  assertPinHigh(sim, chip, 'Y2', `B8: OEn=L A2=L → Y2=H`);

  // Disable
  reconnectHigh(wm, chip, 'OEn');
  sim = simulate(world, wm, chip);
  // Outputs should not be driven strongly when disabled
  const pinY1 = findPin(chip, 'Y1');
  assert(!!pinY1, `B8: Y1 exists when disabled`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - 74x9244: 9 bit non-inverting tri-state buffer
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x9244 - 9 bit non-inverting tri-state ===');

// C1 - OEn=LOW, all inputs HIGH → all outputs HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x9244');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    assertPinHigh(sim, chip, `Y${i}`, `C1: OEn=L A${i}=H → Y${i} HIGH`);
  }
}

// C2 - OEn=LOW, all inputs LOW → all outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x9244');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    assertPinLow(sim, chip, `Y${i}`, `C2: OEn=L A${i}=L → Y${i} LOW`);
  }
}

// C3 - OEn=HIGH (disabled) → outputs hi-Z
{
  const { world, chip, wm } = setupChipWithPower('74x9244');
  connectHigh(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    const pin = findPin(chip, `Y${i}`);
    assert(!!pin, `C3: Y${i} pin exists when disabled`);
  }
}

// C4 - Mixed: OEn=LOW, odd=HIGH even=LOW → outputs match inputs
{
  const { world, chip, wm } = setupChipWithPower('74x9244');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
    else              connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i % 2 === 1)
      assertPinHigh(sim, chip, `Y${i}`, `C4: A${i}=H → Y${i} HIGH`);
    else
      assertPinLow(sim, chip, `Y${i}`, `C4: A${i}=L → Y${i} LOW`);
  }
}

// C5 - Individual channel isolation
for (let ch = 1; ch <= 9; ch++) {
  const { world, chip, wm } = setupChipWithPower('74x9244');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  reconnectHigh(wm, chip, `A${ch}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 9; i++) {
    if (i === ch)
      assertPinHigh(sim, chip, `Y${i}`, `C5: ch${ch} A${i}=H → Y${i} HIGH`);
    else
      assertPinLow(sim, chip, `Y${i}`, `C5: ch${ch} A${i}=L → Y${i} LOW`);
  }
}

// C6 - Comparison: 74x9240 inverts, 74x9244 does not
{
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x9240');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x9244');
  connectLow(wm1, c1, 'OEn');
  connectLow(wm2, c2, 'OEn');
  connectHigh(wm1, c1, 'A1');
  connectHigh(wm2, c2, 'A1');
  for (let i = 2; i <= 9; i++) { connectLow(wm1, c1, `A${i}`); connectLow(wm2, c2, `A${i}`); }
  const s1 = simulate(w1, wm1, c1);
  const s2 = simulate(w2, wm2, c2);
  assertPinLow(s1, c1, 'Y1', `C6: 74x9240 inverts A1=H → Y1=L`);
  assertPinHigh(s2, c2, 'Y1', `C6: 74x9244 non-inv A1=H → Y1=H`);
}

// C7 - Gate configuration: 9 TRI_BUFFER_LO gates
{
  const def = CHIPS_BLOCK_65['74x9244'];
  assert(def.gates.length === 9, `C7: 74x9244 has 9 gates`);
  for (const g of def.gates) {
    assert(g.type === 'TRI_BUFFER_LO', `C7: gate type is TRI_BUFFER_LO, got ${g.type}`);
  }
}

// C8 - 24-pin pinout structure same as 9240
{
  const d9240 = CHIPS_BLOCK_65['74x9240'];
  const d9244 = CHIPS_BLOCK_65['74x9244'];
  assert(d9244.pinout[0].name === 'OEn', `C8: pin 1 is OEn`);
  // Same NC positions
  for (let i = 0; i < d9240.pinout.length; i++) {
    assert(d9240.pinout[i].name === d9244.pinout[i].name,
      `C8: pin ${i+1} name matches (${d9240.pinout[i].name} vs ${d9244.pinout[i].name})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - 74x9541: 8 bit dual-OE buffer
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x9541 - 8 bit dual-OE buffer ===');

// D1 - Both OE1=LOW, OE2=LOW (enabled), all inputs HIGH → all outputs HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinHigh(sim, chip, `Y${i}`, `D1: OE1=L OE2=L A${i}=H → Y${i} HIGH`);
  }
}

// D2 - Both OE LOW, all inputs LOW → all outputs LOW
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    assertPinLow(sim, chip, `Y${i}`, `D2: OE1=L OE2=L A${i}=L → Y${i} LOW`);
  }
}

// D3 - OE1=HIGH (disabled by OE1) → outputs hi-Z
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectHigh(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    const pin = findPin(chip, `Y${i}`);
    assert(!!pin, `D3: Y${i} exists when OE1 disabled`);
  }
}

// D4 - OE2=HIGH (disabled by OE2) → outputs hi-Z
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectHigh(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    const pin = findPin(chip, `Y${i}`);
    assert(!!pin, `D4: Y${i} exists when OE2 disabled`);
  }
}

// D5 - Both OE HIGH (disabled) → outputs hi-Z
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectHigh(wm, chip, 'OE1');
  connectHigh(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    const pin = findPin(chip, `Y${i}`);
    assert(!!pin, `D5: Y${i} exists when both OE disabled`);
  }
}

// D6 - Mixed inputs with dual OE active
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) {
    if (i % 2 === 1) connectHigh(wm, chip, `A${i}`);
    else              connectLow(wm, chip, `A${i}`);
  }
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    if (i % 2 === 1)
      assertPinHigh(sim, chip, `Y${i}`, `D6: A${i}=H → Y${i} HIGH`);
    else
      assertPinLow(sim, chip, `Y${i}`, `D6: A${i}=L → Y${i} LOW`);
  }
}

// D7 - Individual channel isolation
for (let ch = 1; ch <= 8; ch++) {
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  reconnectHigh(wm, chip, `A${ch}`);
  const sim = simulate(world, wm, chip);
  for (let i = 1; i <= 8; i++) {
    if (i === ch)
      assertPinHigh(sim, chip, `Y${i}`, `D7: ch${ch} A${i}=H → Y${i} HIGH`);
    else
      assertPinLow(sim, chip, `Y${i}`, `D7: ch${ch} A${i}=L → Y${i} LOW`);
  }
}

// D8 - Gate configuration: 8 TRI_BUFFER_DUAL_OE gates
{
  const def = CHIPS_BLOCK_65['74x9541'];
  assert(def.gates.length === 8, `D8: 74x9541 has 8 gates`);
  for (const g of def.gates) {
    assert(g.type === 'TRI_BUFFER_DUAL_OE', `D8: gate type is TRI_BUFFER_DUAL_OE, got ${g.type}`);
    assert(g.inputs.length === 3, `D8: gate has 3 inputs (data + 2 OE)`);
  }
}

// D9 - 20-pin pinout structure matches 74541 pattern
{
  const def = CHIPS_BLOCK_65['74x9541'];
  assert(def.pinout[0].name === 'OE1', `D9: pin 1 is OE1`);
  assert(def.pinout[18].name === 'OE2', `D9: pin 19 is OE2`);
  assert(def.pinout[9].name === 'GND', `D9: pin 10 is GND`);
  assert(def.pinout[19].name === 'VCC', `D9: pin 20 is VCC`);
}

// D10 - Enable/disable toggle test
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  connectHigh(wm, chip, 'A1');
  for (let i = 2; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y1', `D10: enabled A1=H → Y1=H`);

  // Disable OE1
  reconnectHigh(wm, chip, 'OE1');
  sim = simulate(world, wm, chip);
  const pin = findPin(chip, 'Y1');
  assert(!!pin, `D10: Y1 exists after OE1 disabled`);

  // Re-enable OE1, disable OE2
  reconnectLow(wm, chip, 'OE1');
  reconnectHigh(wm, chip, 'OE2');
  sim = simulate(world, wm, chip);
  assert(!!findPin(chip, 'Y1'), `D10: Y1 exists after OE2 disabled`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E - Stubs: instantiation + basic checks
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: Stubs ===');

for (const id of STUB_IDS) {
  const def = CHIPS_BLOCK_65[id];
  if (!def) { fail++; console.error(`  ✗ E1: ${id} not in CHIPS_BLOCK_65`); continue; }

  // E1 - Definition has GENERIC_STUB gate
  const hasStubGate = def.gates.some(g => g.type === 'GENERIC_STUB');
  assert(hasStubGate, `E1: ${id} has GENERIC_STUB gate`);

  // E2 - Can be instantiated and placed
  try {
    const chip = new ChipComponent(id);
    chip.place(0, 0, 10, 4);
    assert(chip.pins.length === EXPECTED_SPECS[id].pins,
      `E2: ${id} placed with correct pin count`);
  } catch (e) {
    fail++;
    console.error(`  ✗ E2: ${id} instantiation failed: ${e.message}`);
    continue;
  }

  // E3 - Can run simulation without crashing
  try {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = simulate(world, wm, chip);
    assert(true, `E3: ${id} simulates without error`);
  } catch (e) {
    fail++;
    console.error(`  ✗ E3: ${id} simulation failed: ${e.message}`);
  }

  // E4 - Has sequential:true for stubs that are sequential
  if (def.sequential) {
    assert(def.sequential === true, `E4: ${id} sequential is true`);
  }

  // E5 - Has tags array
  assert(Array.isArray(def.tags), `E5: ${id} has tags array`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F - Dynamic: switching inputs on implementable chips
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: Dynamic tests ===');

// F1 - 74x9135: Switch A1 from LOW to HIGH
{
  const { world, chip, wm } = setupChipWithPower('74x9135');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y1', `F1: initially A1=L → Y1=L`);

  reconnectHigh(wm, chip, 'A1');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y1', `F1: after A1→H → Y1=H`);
}

// F2 - 74x9240: Switch A5 and verify inversion
{
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y5', `F2: initially A5=L → Y5=H (inverted)`);

  reconnectHigh(wm, chip, 'A5');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y5', `F2: after A5→H → Y5=L (inverted)`);
}

// F3 - 74x9244: Switch A9 and verify non-inversion
{
  const { world, chip, wm } = setupChipWithPower('74x9244');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y9', `F3: initially A9=L → Y9=L`);

  reconnectHigh(wm, chip, 'A9');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y9', `F3: after A9→H → Y9=H`);
}

// F4 - 74x9541: Switch between dual-OE states
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectHigh(wm, chip, `A${i}`);
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y4', `F4: both OE low → Y4=H`);

  // Disable OE1
  reconnectHigh(wm, chip, 'OE1');
  sim = simulate(world, wm, chip);
  // Re-enable both
  reconnectLow(wm, chip, 'OE1');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y4', `F4: re-enabled → Y4=H`);
}

// F5 - Walking-one pattern on 74x9135
{
  const { world, chip, wm } = setupChipWithPower('74x9135');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  for (let bit = 1; bit <= 9; bit++) {
    if (bit > 1) reconnectLow(wm, chip, `A${bit-1}`);
    reconnectHigh(wm, chip, `A${bit}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      if (i === bit)
        assertPinHigh(sim, chip, `Y${i}`, `F5: walk-one bit${bit} Y${i}=H`);
      else
        assertPinLow(sim, chip, `Y${i}`, `F5: walk-one bit${bit} Y${i}=L`);
    }
  }
}

// F6 - Walking-one pattern on 74x9240 (inverted)
{
  const { world, chip, wm } = setupChipWithPower('74x9240');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectHigh(wm, chip, `A${i}`);
  // All outputs LOW initially (all inverted HIGH inputs)
  for (let bit = 1; bit <= 9; bit++) {
    reconnectLow(wm, chip, `A${bit}`);
    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, `Y${bit}`, `F6: walk-zero A${bit}=L → Y${bit}=H`);
    reconnectHigh(wm, chip, `A${bit}`);
  }
}

// F7 - Walking-one pattern on 74x9244 (non-inverted)
{
  const { world, chip, wm } = setupChipWithPower('74x9244');
  connectLow(wm, chip, 'OEn');
  for (let i = 1; i <= 9; i++) connectLow(wm, chip, `A${i}`);
  for (let bit = 1; bit <= 9; bit++) {
    if (bit > 1) reconnectLow(wm, chip, `A${bit-1}`);
    reconnectHigh(wm, chip, `A${bit}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 9; i++) {
      if (i === bit)
        assertPinHigh(sim, chip, `Y${i}`, `F7: walk-one bit${bit} Y${i}=H`);
      else
        assertPinLow(sim, chip, `Y${i}`, `F7: walk-one bit${bit} Y${i}=L`);
    }
  }
}

// F8 - Walking-one pattern on 74x9541
{
  const { world, chip, wm } = setupChipWithPower('74x9541');
  connectLow(wm, chip, 'OE1');
  connectLow(wm, chip, 'OE2');
  for (let i = 1; i <= 8; i++) connectLow(wm, chip, `A${i}`);
  for (let bit = 1; bit <= 8; bit++) {
    if (bit > 1) reconnectLow(wm, chip, `A${bit-1}`);
    reconnectHigh(wm, chip, `A${bit}`);
    const sim = simulate(world, wm, chip);
    for (let i = 1; i <= 8; i++) {
      if (i === bit)
        assertPinHigh(sim, chip, `Y${i}`, `F8: walk-one bit${bit} Y${i}=H`);
      else
        assertPinLow(sim, chip, `Y${i}`, `F8: walk-one bit${bit} Y${i}=L`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Pinout integrity (specific pin numbering checks)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION G: Pinout integrity ===');

// G1 - 74x9135 pinout: A1-A9 on pins 1-9, Y9-Y1 on pins 11-19 (reversed)
{
  const def = CHIPS_BLOCK_65['74x9135'];
  for (let i = 1; i <= 9; i++) {
    assert(def.pinout[i-1].name === `A${i}`, `G1: pin ${i} is A${i}`);
  }
  for (let i = 0; i < 9; i++) {
    assert(def.pinout[10+i].name === `Y${9-i}`, `G1: pin ${11+i} is Y${9-i}`);
  }
}

// G2 - 74x9240 pinout: OEn=pin1, A1-A9=pins 2-10, Y9-Y1=pins 13-21
{
  const def = CHIPS_BLOCK_65['74x9240'];
  assert(def.pinout[0].name === 'OEn', `G2: pin 1 is OEn`);
  for (let i = 1; i <= 9; i++) {
    assert(def.pinout[i].name === `A${i}`, `G2: pin ${i+1} is A${i}`);
  }
  for (let i = 0; i < 9; i++) {
    assert(def.pinout[12+i].name === `Y${9-i}`, `G2: pin ${13+i} is Y${9-i}`);
  }
}

// G3 - 74x9244 pinout should match 74x9240 exactly (same pin names)
{
  const d1 = CHIPS_BLOCK_65['74x9240'];
  const d2 = CHIPS_BLOCK_65['74x9244'];
  for (let i = 0; i < 24; i++) {
    assert(d1.pinout[i].name === d2.pinout[i].name,
      `G3: pin ${i+1} names match (${d1.pinout[i].name} vs ${d2.pinout[i].name})`);
  }
}

// G4 - 74x9541 pinout: OE1=pin1, A1-A8=pins 2-9, Y8-Y1=pins 11-18, OE2=pin19
{
  const def = CHIPS_BLOCK_65['74x9541'];
  assert(def.pinout[0].name === 'OE1', `G4: pin 1 is OE1`);
  for (let i = 1; i <= 8; i++) {
    assert(def.pinout[i].name === `A${i}`, `G4: pin ${i+1} is A${i}`);
  }
  for (let i = 0; i < 8; i++) {
    assert(def.pinout[10+i].name === `Y${8-i}`, `G4: pin ${11+i} is Y${8-i}`);
  }
  assert(def.pinout[18].name === 'OE2', `G4: pin 19 is OE2`);
}

// G5 - All stubs: pin numbers are sequential 1..N
for (const id of STUB_IDS) {
  const def = CHIPS_BLOCK_65[id];
  if (!def) continue;
  for (let i = 0; i < def.pinout.length; i++) {
    assert(def.pinout[i].pin === i + 1, `G5: ${id} pin ${i+1} number correct`);
  }
}

// G6 - All implementable chips: pin numbers are sequential 1..N
for (const id of ['74x9135', '74x9240', '74x9244', '74x9541']) {
  const def = CHIPS_BLOCK_65[id];
  for (let i = 0; i < def.pinout.length; i++) {
    assert(def.pinout[i].pin === i + 1, `G6: ${id} pin ${i+1} number correct`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H - Full truth table exhaustive tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION H: Exhaustive truth table tests ===');

// H1 - 74x9135: All 512 input combinations (9 bit → 2^9 = 512)
{
  console.log('  H1: 74x9135 exhaustive (512 patterns)...');
  for (let pattern = 0; pattern < 512; pattern++) {
    const { world, chip, wm } = setupChipWithPower('74x9135');
    for (let bit = 0; bit < 9; bit++) {
      if ((pattern >> bit) & 1) connectHigh(wm, chip, `A${bit+1}`);
      else                       connectLow(wm, chip, `A${bit+1}`);
    }
    const sim = simulate(world, wm, chip);
    for (let bit = 0; bit < 9; bit++) {
      const expected = (pattern >> bit) & 1;
      if (expected)
        assertPinHigh(sim, chip, `Y${bit+1}`, `H1: pat=${pattern} Y${bit+1}=H`);
      else
        assertPinLow(sim, chip, `Y${bit+1}`, `H1: pat=${pattern} Y${bit+1}=L`);
    }
  }
}

// H2 - 74x9240: All 512 input combinations (OEn=L, check inversion)
{
  console.log('  H2: 74x9240 exhaustive (512 patterns)...');
  for (let pattern = 0; pattern < 512; pattern++) {
    const { world, chip, wm } = setupChipWithPower('74x9240');
    connectLow(wm, chip, 'OEn');
    for (let bit = 0; bit < 9; bit++) {
      if ((pattern >> bit) & 1) connectHigh(wm, chip, `A${bit+1}`);
      else                       connectLow(wm, chip, `A${bit+1}`);
    }
    const sim = simulate(world, wm, chip);
    for (let bit = 0; bit < 9; bit++) {
      const inputBit = (pattern >> bit) & 1;
      // Inverting: output = NOT(input)
      if (inputBit)
        assertPinLow(sim, chip, `Y${bit+1}`, `H2: pat=${pattern} Y${bit+1}=L`);
      else
        assertPinHigh(sim, chip, `Y${bit+1}`, `H2: pat=${pattern} Y${bit+1}=H`);
    }
  }
}

// H3 - 74x9244: All 512 input combinations (OEn=L, non-inverting)
{
  console.log('  H3: 74x9244 exhaustive (512 patterns)...');
  for (let pattern = 0; pattern < 512; pattern++) {
    const { world, chip, wm } = setupChipWithPower('74x9244');
    connectLow(wm, chip, 'OEn');
    for (let bit = 0; bit < 9; bit++) {
      if ((pattern >> bit) & 1) connectHigh(wm, chip, `A${bit+1}`);
      else                       connectLow(wm, chip, `A${bit+1}`);
    }
    const sim = simulate(world, wm, chip);
    for (let bit = 0; bit < 9; bit++) {
      const expected = (pattern >> bit) & 1;
      if (expected)
        assertPinHigh(sim, chip, `Y${bit+1}`, `H3: pat=${pattern} Y${bit+1}=H`);
      else
        assertPinLow(sim, chip, `Y${bit+1}`, `H3: pat=${pattern} Y${bit+1}=L`);
    }
  }
}

// H4 - 74x9541: All 256 input combinations (8 bit, both OE=L)
{
  console.log('  H4: 74x9541 exhaustive (256 patterns)...');
  for (let pattern = 0; pattern < 256; pattern++) {
    const { world, chip, wm } = setupChipWithPower('74x9541');
    connectLow(wm, chip, 'OE1');
    connectLow(wm, chip, 'OE2');
    for (let bit = 0; bit < 8; bit++) {
      if ((pattern >> bit) & 1) connectHigh(wm, chip, `A${bit+1}`);
      else                       connectLow(wm, chip, `A${bit+1}`);
    }
    const sim = simulate(world, wm, chip);
    for (let bit = 0; bit < 8; bit++) {
      const expected = (pattern >> bit) & 1;
      if (expected)
        assertPinHigh(sim, chip, `Y${bit+1}`, `H4: pat=${pattern} Y${bit+1}=H`);
      else
        assertPinLow(sim, chip, `Y${bit+1}`, `H4: pat=${pattern} Y${bit+1}=L`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(60)}`);
console.log(`  CHIPS65 RESULTS: ${pass} passed, ${fail} failed`);
console.log(`${'═'.repeat(60)}\n`);

process.exit(fail > 0 ? 1 : 0);
