// test-chips69.mjs - Tests for all chips defined in js/chips/chips69.js
// Chips under test:
//   CD4011 : Quad 2-Input NAND (14-pin)
//   CD4012 : Dual 4-Input NAND (14-pin)
//   CD4069 : Hex Inverter (14-pin)
//   CD4082 : Dual 4-Input AND (14-pin)
//   CD4543 : BCD to 7-Segment Latch/Decoder/Driver (16-pin, BCD_7SEG_4543)

import { CHIPS_BLOCK_69 } from '../chips/chips69.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ─────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  const vccPin = findPin(chip, 'VDD') || findPin(chip, 'VCC');
  const gndPin = findPin(chip, 'GND');
  connectPinToVcc(wm, vccPin);
  connectPinToGnd(wm, gndPin);
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

function makeSim(world, chips, wm) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, chips, wm);
  return sim;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S   Structure tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION S: Structure ===');

const EXPECTED_IDS = ['CD4011', 'CD4012', 'CD4069', 'CD4082', 'CD4543'];
const EXPECTED_SPECS = {
  'CD4011': { pins: 14, gnd: 7,  vcc: 14 },
  'CD4012': { pins: 14, gnd: 7,  vcc: 14 },
  'CD4069': { pins: 14, gnd: 7,  vcc: 14 },
  'CD4082': { pins: 14, gnd: 7,  vcc: 14 },
  'CD4543': { pins: 16, gnd: 8,  vcc: 16 },
};

assert(typeof CHIPS_BLOCK_69 === 'object', 'CHIPS_BLOCK_69 is an exported object');
assert(Object.keys(CHIPS_BLOCK_69).length === 5, 'CHIPS_BLOCK_69 has 5 chips');

for (const id of EXPECTED_IDS) {
  const def = CHIPS_BLOCK_69[id];
  assert(!!def, `${id} is defined`);
  if (!def) continue;
  assert(def.pins  === EXPECTED_SPECS[id].pins, `${id} has ${EXPECTED_SPECS[id].pins} pins`);
  assert(def.gnd   === EXPECTED_SPECS[id].gnd,  `${id} GND pin is ${EXPECTED_SPECS[id].gnd}`);
  assert(def.vcc   === EXPECTED_SPECS[id].vcc,  `${id} VCC pin is ${EXPECTED_SPECS[id].vcc}`);
  assert(Array.isArray(def.pinout), `${id} has pinout array`);
  assert(Array.isArray(def.gates),  `${id} has gates array`);
  assert(def.pinout.length === def.pins, `${id} pinout length matches pin count`);
  assert(!!def.datasheet, `${id} has datasheet URL`);
  assert(!!def.guideOverview, `${id} has guideOverview`);
}

// Gate counts
assert(CHIPS_BLOCK_69['CD4011'].gates.length === 4, 'CD4011 has 4 gates');
assert(CHIPS_BLOCK_69['CD4012'].gates.length === 2, 'CD4012 has 2 gates');
assert(CHIPS_BLOCK_69['CD4069'].gates.length === 6, 'CD4069 has 6 gates');
assert(CHIPS_BLOCK_69['CD4082'].gates.length === 2, 'CD4082 has 2 gates');
assert(CHIPS_BLOCK_69['CD4543'].gates.length === 1, 'CD4543 has 1 gate');

// Gate types
assert(CHIPS_BLOCK_69['CD4011'].gates.every(g => g.type === 'NAND'), 'CD4011 gates are NAND');
assert(CHIPS_BLOCK_69['CD4012'].gates.every(g => g.type === 'NAND'), 'CD4012 gates are NAND');
assert(CHIPS_BLOCK_69['CD4069'].gates.every(g => g.type === 'NOT'),  'CD4069 gates are NOT');
assert(CHIPS_BLOCK_69['CD4082'].gates.every(g => g.type === 'AND'),  'CD4082 gates are AND');
assert(CHIPS_BLOCK_69['CD4543'].gates[0].type === 'BCD_7SEG_4543',   'CD4543 gate is BCD_7SEG_4543');

// CD4012/CD4082: 4-input gates
assert(CHIPS_BLOCK_69['CD4012'].gates[0].inputs.length === 4, 'CD4012 gate 1 has 4 inputs');
assert(CHIPS_BLOCK_69['CD4012'].gates[1].inputs.length === 4, 'CD4012 gate 2 has 4 inputs');
assert(CHIPS_BLOCK_69['CD4082'].gates[0].inputs.length === 4, 'CD4082 gate 1 has 4 inputs');
assert(CHIPS_BLOCK_69['CD4082'].gates[1].inputs.length === 4, 'CD4082 gate 2 has 4 inputs');

// CD4543: sequential flag
assert(CHIPS_BLOCK_69['CD4543'].sequential === true, 'CD4543 is marked sequential');

// NC pins in CD4012 and CD4082
const nc4012 = CHIPS_BLOCK_69['CD4012'].pinout.filter(p => p.type === 'nc');
assert(nc4012.length === 2, 'CD4012 has 2 NC pins');
const nc4082 = CHIPS_BLOCK_69['CD4082'].pinout.filter(p => p.type === 'nc');
assert(nc4082.length === 2, 'CD4082 has 2 NC pins');

// CD4543 Pin names
const pins4543 = CHIPS_BLOCK_69['CD4543'].pinout.map(p => p.name);
for (const name of ['Ph','D','A','B','C','BL','LE','GND','f','g','a','b','c','d','e','VDD']) {
  assert(pins4543.includes(name), `CD4543 has pin '${name}'`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A   CD4011: Quad 2-Input NAND
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION A: CD4011 Quad 2-Input NAND ===');

// Truth table for gate 1 (A1, B1 → Q1): NAND
// A=0,B=0 → Q=1 | A=1,B=0 → Q=1 | A=0,B=1 → Q=1 | A=1,B=1 → Q=0
const nand2Table = [[0,0,1],[1,0,1],[0,1,1],[1,1,0]];
for (const [a, b, expected] of nand2Table) {
  const { world, chip, wm } = setupChipWithPower('CD4011');
  if (a) connectHigh(wm, chip, 'A1'); else connectLow(wm, chip, 'A1');
  if (b) connectHigh(wm, chip, 'B1'); else connectLow(wm, chip, 'B1');
  const sim = makeSim(world, [chip], wm);
  if (expected) assertPinHigh(sim, chip, 'Q1', `CD4011 NAND: A=${a},B=${b} → Q1=H`);
  else          assertPinLow(sim,  chip, 'Q1', `CD4011 NAND: A=${a},B=${b} → Q1=L`);
}

// Gate 2 (A2, B2 → Q2): spot check all-HIGH → LOW
{
  const { world, chip, wm } = setupChipWithPower('CD4011');
  connectHigh(wm, chip, 'A2'); connectHigh(wm, chip, 'B2');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, 'Q2', 'CD4011 gate 2: A2=H,B2=H → Q2=L');
}

// Gate 3 (A3, B3 → Q3): one LOW → HIGH
{
  const { world, chip, wm } = setupChipWithPower('CD4011');
  connectLow(wm, chip, 'A3'); connectHigh(wm, chip, 'B3');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, 'Q3', 'CD4011 gate 3: A3=L,B3=H → Q3=H');
}

// Gate 4 (A4, B4 → Q4): both HIGH → LOW
{
  const { world, chip, wm } = setupChipWithPower('CD4011');
  connectHigh(wm, chip, 'A4'); connectHigh(wm, chip, 'B4');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, 'Q4', 'CD4011 gate 4: A4=H,B4=H → Q4=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B   CD4012: Dual 4-Input NAND
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION B: CD4012 Dual 4-Input NAND ===');

// All inputs HIGH → output LOW
{
  const { world, chip, wm } = setupChipWithPower('CD4012');
  connectHigh(wm, chip, '1A'); connectHigh(wm, chip, '1B');
  connectHigh(wm, chip, '1C'); connectHigh(wm, chip, '1D');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, '1Y', 'CD4012 gate 1: all HIGH → 1Y=L');
}

// Any one input LOW → output HIGH (test each individually)
for (const inputPin of ['1A','1B','1C','1D']) {
  const { world, chip, wm } = setupChipWithPower('CD4012');
  for (const p of ['1A','1B','1C','1D']) {
    if (p === inputPin) connectLow(wm, chip, p);
    else connectHigh(wm, chip, p);
  }
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y', `CD4012 gate 1: ${inputPin}=L, others=H → 1Y=H`);
}

// Gate 2: all inputs HIGH → output LOW
{
  const { world, chip, wm } = setupChipWithPower('CD4012');
  connectHigh(wm, chip, '2A'); connectHigh(wm, chip, '2B');
  connectHigh(wm, chip, '2C'); connectHigh(wm, chip, '2D');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, '2Y', 'CD4012 gate 2: all HIGH → 2Y=L');
}

// Gate 2: all LOW → output HIGH
{
  const { world, chip, wm } = setupChipWithPower('CD4012');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '2C'); connectLow(wm, chip, '2D');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, '2Y', 'CD4012 gate 2: all LOW → 2Y=H');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C   CD4069: Hex Inverter
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION C: CD4069 Hex Inverter ===');

const inverterPairs = [['A','YA'],['B','YB'],['C','YC'],['D','YD'],['E','YE'],['F','YF']];

for (const [inPin, outPin] of inverterPairs) {
  // Input HIGH → output LOW
  {
    const { world, chip, wm } = setupChipWithPower('CD4069');
    connectHigh(wm, chip, inPin);
    const sim = makeSim(world, [chip], wm);
    assertPinLow(sim, chip, outPin, `CD4069 ${inPin}=H → ${outPin}=L`);
  }
  // Input LOW → output HIGH
  {
    const { world, chip, wm } = setupChipWithPower('CD4069');
    connectLow(wm, chip, inPin);
    const sim = makeSim(world, [chip], wm);
    assertPinHigh(sim, chip, outPin, `CD4069 ${inPin}=L → ${outPin}=H`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D   CD4082: Dual 4-Input AND
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION D: CD4082 Dual 4-Input AND ===');

// All inputs HIGH → output HIGH
{
  const { world, chip, wm } = setupChipWithPower('CD4082');
  connectHigh(wm, chip, '1A'); connectHigh(wm, chip, '1B');
  connectHigh(wm, chip, '1C'); connectHigh(wm, chip, '1D');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y', 'CD4082 gate 1: all HIGH → 1Y=H');
}

// Any one input LOW → output LOW (test each individually)
for (const inputPin of ['1A','1B','1C','1D']) {
  const { world, chip, wm } = setupChipWithPower('CD4082');
  for (const p of ['1A','1B','1C','1D']) {
    if (p === inputPin) connectLow(wm, chip, p);
    else connectHigh(wm, chip, p);
  }
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, '1Y', `CD4082 gate 1: ${inputPin}=L → 1Y=L`);
}

// Gate 2: all inputs HIGH → output HIGH
{
  const { world, chip, wm } = setupChipWithPower('CD4082');
  connectHigh(wm, chip, '2A'); connectHigh(wm, chip, '2B');
  connectHigh(wm, chip, '2C'); connectHigh(wm, chip, '2D');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, '2Y', 'CD4082 gate 2: all HIGH → 2Y=H');
}

// Gate 2: all LOW → output LOW
{
  const { world, chip, wm } = setupChipWithPower('CD4082');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '2C'); connectLow(wm, chip, '2D');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, '2Y', 'CD4082 gate 2: all LOW → 2Y=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E   CD4543: BCD to 7-Segment Decoder/Driver
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION E: CD4543 BCD to 7-Segment Decoder ===');

// Expected segment patterns (a,b,c,d,e,f,g)   active HIGH (Ph=LOW, common cathode):
const SEG_TABLE = [
  /* 0 */ [1, 1, 1, 1, 1, 1, 0],
  /* 1 */ [0, 1, 1, 0, 0, 0, 0],
  /* 2 */ [1, 1, 0, 1, 1, 0, 1],
  /* 3 */ [1, 1, 1, 1, 0, 0, 1],
  /* 4 */ [0, 1, 1, 0, 0, 1, 1],
  /* 5 */ [1, 0, 1, 1, 0, 1, 1],
  /* 6 */ [1, 0, 1, 1, 1, 1, 1],
  /* 7 */ [1, 1, 1, 0, 0, 0, 0],
  /* 8 */ [1, 1, 1, 1, 1, 1, 1],
  /* 9 */ [1, 1, 1, 1, 0, 1, 1],
];
const SEG_PINS = ['a','b','c','d','e','f','g'];

// Digits 0 9 in common-cathode mode (Ph=LOW)
for (let digit = 0; digit <= 9; digit++) {
  const { world, chip, wm } = setupChipWithPower('CD4543');
  connectLow(wm, chip, 'LE');   // transparent
  connectLow(wm, chip, 'BL');   // no blanking
  connectLow(wm, chip, 'Ph');   // common cathode (active HIGH outputs)
  if (digit & 1) connectHigh(wm, chip, 'A'); else connectLow(wm, chip, 'A');
  if (digit & 2) connectHigh(wm, chip, 'B'); else connectLow(wm, chip, 'B');
  if (digit & 4) connectHigh(wm, chip, 'C'); else connectLow(wm, chip, 'C');
  if (digit & 8) connectHigh(wm, chip, 'D'); else connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (let s = 0; s < 7; s++) {
    if (SEG_TABLE[digit][s]) assertPinHigh(sim, chip, SEG_PINS[s], `CD4543 CC digit ${digit}: ${SEG_PINS[s]}=H`);
    else                     assertPinLow(sim,  chip, SEG_PINS[s], `CD4543 CC digit ${digit}: ${SEG_PINS[s]}=L`);
  }
}

// Digits 0 9 in common-anode mode (Ph=HIGH)   all outputs inverted
for (let digit = 0; digit <= 9; digit++) {
  const { world, chip, wm } = setupChipWithPower('CD4543');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'BL');
  connectHigh(wm, chip, 'Ph');  // common anode (active LOW outputs)
  if (digit & 1) connectHigh(wm, chip, 'A'); else connectLow(wm, chip, 'A');
  if (digit & 2) connectHigh(wm, chip, 'B'); else connectLow(wm, chip, 'B');
  if (digit & 4) connectHigh(wm, chip, 'C'); else connectLow(wm, chip, 'C');
  if (digit & 8) connectHigh(wm, chip, 'D'); else connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (let s = 0; s < 7; s++) {
    // Ph=HIGH inverts: active HIGH table bit 1 → output LOW; bit 0 → output HIGH
    if (SEG_TABLE[digit][s]) assertPinLow(sim,  chip, SEG_PINS[s], `CD4543 CA digit ${digit}: ${SEG_PINS[s]}=L`);
    else                     assertPinHigh(sim, chip, SEG_PINS[s], `CD4543 CA digit ${digit}: ${SEG_PINS[s]}=H`);
  }
}

// Blanking: BL=HIGH → all segments in their "off" state
//   Ph=LOW (common-cathode):  off = output LOW
//   Ph=HIGH (common-anode):   off = output HIGH (active LOW, HIGH = cathode high = LED off)
for (const phState of [0, 1]) {
  const { world, chip, wm } = setupChipWithPower('CD4543');
  connectLow(wm, chip, 'LE');
  connectHigh(wm, chip, 'BL');  // blanking active HIGH
  if (phState) connectHigh(wm, chip, 'Ph'); else connectLow(wm, chip, 'Ph');
  connectLow(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (const s of SEG_PINS) {
    if (phState === 0) assertPinLow(sim,  chip, s, `CD4543 BL=H Ph=0 (CC): ${s}=L (off)`);
    else               assertPinHigh(sim, chip, s, `CD4543 BL=H Ph=1 (CA): ${s}=H (off)`);
  }
}

// Latch: LE=HIGH holds last BCD value
{
  const { world, chip, wm } = setupChipWithPower('CD4543');
  connectLow(wm, chip, 'LE');   // transparent
  connectLow(wm, chip, 'BL');
  connectLow(wm, chip, 'Ph');
  // Show digit 5 (A=1,B=0,C=1,D=0)
  connectHigh(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectHigh(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  // Latch it
  reconnectHigh(wm, chip, 'LE');
  sim.evaluate(world, [chip], wm);
  // Change input to 0
  reconnectLow(wm, chip, 'A');
  reconnectLow(wm, chip, 'C');
  sim.evaluate(world, [chip], wm);
  // Outputs should still show digit 5
  for (let s = 0; s < 7; s++) {
    if (SEG_TABLE[5][s]) assertPinHigh(sim, chip, SEG_PINS[s], `CD4543 latch holds 5: ${SEG_PINS[s]}=H`);
    else                 assertPinLow(sim,  chip, SEG_PINS[s], `CD4543 latch holds 5: ${SEG_PINS[s]}=L`);
  }
}

// Invalid BCD (10-15) → all segments off (BL=LOW, Ph=LOW)
{
  const { world, chip, wm } = setupChipWithPower('CD4543');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'BL');
  connectLow(wm, chip, 'Ph');
  // BCD = 10: A=0,B=1,C=0,D=1
  connectLow(wm, chip, 'A'); connectHigh(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectHigh(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (const s of SEG_PINS) assertPinLow(sim, chip, s, `CD4543 BCD=10 (invalid): ${s}=L`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${pass + fail} tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
