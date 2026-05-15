// test-chips59.mjs - Tests for all chips defined in js/chips/chips59.js
// Chips under test:
//   74x4305  : Dual 4 bit Inverting Buffer (TRI_NOT_LO, 20-pin)
//   74x4306  : Dual 4 bit Non-Inverting Buffer (TRI_BUFFER_LO, 20-pin)
//   74x4316  : Quad Analog Switch (GENERIC_STUB, 14-pin)
//   74x4351  : 8-Ch Analog Mux with Latch (GENERIC_STUB, 20-pin)
//   74x4352  : Dual 4-Ch Analog Mux with Latch (GENERIC_STUB, 20-pin)
//   74x4353  : Triple 2-Ch Analog Mux with Latch (GENERIC_STUB, 20-pin)
//   74x4374  : 8 bit Dual-Rank Synchronizer (GENERIC_STUB, 20-pin)
//   74x4510  : BCD Decade Up/Down Counter (COUNTER_BCD_UPDOWN_CD, 16-pin)
//   74x4511  : BCD to 7-Segment Decoder (BCD_7SEG_4511, 16-pin)
//   74x4514  : 4-to-16 Decoder Active HIGH, Latched (DEC_4TO16_LATCH_HI, 24-pin)
//   74x4515  : 4-to-16 Decoder Active LOW, Latched (DEC_4TO16_LATCH_LO, 24-pin)
//   74x4516  : 4 bit Binary Up/Down Counter (COUNTER_BIN_UPDOWN_CD, 16-pin)
//   74x4518  : Dual Synchronous BCD Counter (COUNTER_GATED_DECADE, 16-pin)
//   74x4520  : Dual Synchronous Binary Counter (COUNTER_GATED_BIN, 16-pin)
//   74x4543  : BCD to 7-Segment LCD Driver (GENERIC_STUB, 16-pin)
//   74x4560  : 4 bit BCD Adder (GENERIC_STUB, 16-pin)

import { CHIPS_BLOCK_59 } from '../chips/chips59.js';
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

function assertPinHighZ(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v === undefined || v === null || v < 2.5, `${label}: expected HiZ/low, got ${v}`);
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

function makeSim(world, chips, wm) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, chips, wm);
  return sim;
}

function clockPulse(wm, chip, pinName, world, chips, sim) {
  reconnectHigh(wm, chip, pinName);
  sim.evaluate(world, chips, wm);
  reconnectLow(wm, chip, pinName);
  sim.evaluate(world, chips, wm);
}

function readCount(sim, chip, pins) {
  let val = 0;
  for (let i = 0; i < pins.length; i++) {
    const pin = findPin(chip, pins[i]);
    const v = getPinVoltage(sim, pin);
    if (v !== undefined && v !== null && v >= 2.5) val |= (1 << i);
  }
  return val;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x4305', '74x4306', '74x4316', '74x4351', '74x4352', '74x4353',
  '74x4374', '74x4510', '74x4511', '74x4514', '74x4515', '74x4516',
  '74x4518', '74x4520', '74x4543', '74x4560',
];

const EXPECTED_SPECS = {
  '74x4305': { pins: 20, gnd: 10, vcc: 20 },
  '74x4306': { pins: 20, gnd: 10, vcc: 20 },
  '74x4316': { pins: 14, gnd:  7, vcc: 14 },
  '74x4351': { pins: 20, gnd: 10, vcc: 20 },
  '74x4352': { pins: 20, gnd: 10, vcc: 20 },
  '74x4353': { pins: 20, gnd: 10, vcc: 20 },
  '74x4374': { pins: 20, gnd: 10, vcc: 20 },
  '74x4510': { pins: 16, gnd:  8, vcc: 16 },
  '74x4511': { pins: 16, gnd:  8, vcc: 16 },
  '74x4514': { pins: 24, gnd: 12, vcc: 24 },
  '74x4515': { pins: 24, gnd: 12, vcc: 24 },
  '74x4516': { pins: 16, gnd:  8, vcc: 16 },
  '74x4518': { pins: 16, gnd:  8, vcc: 16 },
  '74x4520': { pins: 16, gnd:  8, vcc: 16 },
  '74x4543': { pins: 16, gnd:  8, vcc: 16 },
  '74x4560': { pins: 16, gnd:  8, vcc: 16 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_59 === 'object', 'CHIPS_BLOCK_59 is exported object');
assert(Object.keys(CHIPS_BLOCK_59).length === 16, 'CHIPS_BLOCK_59 has 16 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_59[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,        `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0, `${id}: description`);
  assert(typeof cd.pins        === 'number',                                `${id}: pins is number`);
  assert(Array.isArray(cd.pinout),                                          `${id}: pinout is array`);
  assert(Array.isArray(cd.gates) && cd.gates.length >= 1,                  `${id}: has gates`);

  const spec = EXPECTED_SPECS[id];
  assert(cd.pins === spec.pins, `${id}: pins=${spec.pins}`);
  assert(cd.gnd  === spec.gnd,  `${id}: gnd=${spec.gnd}`);
  assert(cd.vcc  === spec.vcc,  `${id}: vcc=${spec.vcc}`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips ===');

const STUB_IDS = ['74x4316', '74x4351', '74x4352', '74x4353', '74x4374', '74x4543', '74x4560'];

for (const id of STUB_IDS) {
  const cd = CHIPS_BLOCK_59[id];
  assert(cd.tags.includes('stub'), `${id}: tagged as stub`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - 74x4305: Dual 4 bit inverting buffer, tri-state
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74x4305 Dual 4 bit Inverting Buffer ===');

{
  // OE enabled (LOW), input LOW → output HIGH (inverted)
  const { world, chip, wm } = setupChipWithPower('74x4305');
  connectLow(wm, chip, '1OEn');
  connectLow(wm, chip, '1A1'); connectLow(wm, chip, '1A2');
  connectLow(wm, chip, '1A3'); connectLow(wm, chip, '1A4');
  connectLow(wm, chip, '2OEn');
  connectLow(wm, chip, '2A1'); connectLow(wm, chip, '2A2');
  connectLow(wm, chip, '2A3'); connectLow(wm, chip, '2A4');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y1', '4305: in=L, OE=L → 1Y1=H');
  assertPinHigh(sim, chip, '1Y2', '4305: in=L, OE=L → 1Y2=H');
  assertPinHigh(sim, chip, '1Y3', '4305: in=L, OE=L → 1Y3=H');
  assertPinHigh(sim, chip, '1Y4', '4305: in=L, OE=L → 1Y4=H');
  assertPinHigh(sim, chip, '2Y1', '4305: in=L, OE=L → 2Y1=H');
  assertPinHigh(sim, chip, '2Y2', '4305: in=L, OE=L → 2Y2=H');
  assertPinHigh(sim, chip, '2Y3', '4305: in=L, OE=L → 2Y3=H');
  assertPinHigh(sim, chip, '2Y4', '4305: in=L, OE=L → 2Y4=H');
}

{
  // OE enabled (LOW), input HIGH → output LOW (inverted)
  const { world, chip, wm } = setupChipWithPower('74x4305');
  connectLow(wm, chip, '1OEn');
  connectHigh(wm, chip, '1A1'); connectHigh(wm, chip, '1A2');
  connectHigh(wm, chip, '1A3'); connectHigh(wm, chip, '1A4');
  connectLow(wm, chip, '2OEn');
  connectHigh(wm, chip, '2A1'); connectHigh(wm, chip, '2A2');
  connectHigh(wm, chip, '2A3'); connectHigh(wm, chip, '2A4');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, '1Y1', '4305: in=H, OE=L → 1Y1=L');
  assertPinLow(sim, chip, '1Y2', '4305: in=H, OE=L → 1Y2=L');
  assertPinLow(sim, chip, '1Y3', '4305: in=H, OE=L → 1Y3=L');
  assertPinLow(sim, chip, '1Y4', '4305: in=H, OE=L → 1Y4=L');
  assertPinLow(sim, chip, '2Y1', '4305: in=H, OE=L → 2Y1=L');
  assertPinLow(sim, chip, '2Y2', '4305: in=H, OE=L → 2Y2=L');
  assertPinLow(sim, chip, '2Y3', '4305: in=H, OE=L → 2Y3=L');
  assertPinLow(sim, chip, '2Y4', '4305: in=H, OE=L → 2Y4=L');
}

{
  // OE disabled (HIGH) → outputs HiZ
  const { world, chip, wm } = setupChipWithPower('74x4305');
  connectHigh(wm, chip, '1OEn');
  connectLow(wm, chip, '1A1'); connectLow(wm, chip, '1A2');
  connectLow(wm, chip, '1A3'); connectLow(wm, chip, '1A4');
  connectHigh(wm, chip, '2OEn');
  connectLow(wm, chip, '2A1'); connectLow(wm, chip, '2A2');
  connectLow(wm, chip, '2A3'); connectLow(wm, chip, '2A4');
  const sim = makeSim(world, [chip], wm);
  assertPinHighZ(sim, chip, '1Y1', '4305: OE=H → 1Y1 HiZ');
  assertPinHighZ(sim, chip, '1Y2', '4305: OE=H → 1Y2 HiZ');
  assertPinHighZ(sim, chip, '2Y1', '4305: OE=H → 2Y1 HiZ');
  assertPinHighZ(sim, chip, '2Y4', '4305: OE=H → 2Y4 HiZ');
}

{
  // Independent sections: section 1 enabled, section 2 disabled
  const { world, chip, wm } = setupChipWithPower('74x4305');
  connectLow(wm, chip, '1OEn');
  connectHigh(wm, chip, '1A1');
  connectLow(wm, chip, '1A2'); connectLow(wm, chip, '1A3'); connectLow(wm, chip, '1A4');
  connectHigh(wm, chip, '2OEn');
  connectLow(wm, chip, '2A1'); connectLow(wm, chip, '2A2');
  connectLow(wm, chip, '2A3'); connectLow(wm, chip, '2A4');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, '1Y1', '4305: sect1 en, 1A1=H → 1Y1=L');
  assertPinHigh(sim, chip, '1Y2', '4305: sect1 en, 1A2=L → 1Y2=H');
  assertPinHighZ(sim, chip, '2Y1', '4305: sect2 dis → 2Y1 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - 74x4306: Dual 4 bit non-inverting buffer, tri-state
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74x4306 Dual 4 bit Non-Inverting Buffer ===');

{
  // OE enabled, input LOW → output LOW
  const { world, chip, wm } = setupChipWithPower('74x4306');
  connectLow(wm, chip, '1OEn'); connectLow(wm, chip, '2OEn');
  connectLow(wm, chip, '1A1'); connectLow(wm, chip, '1A2');
  connectLow(wm, chip, '1A3'); connectLow(wm, chip, '1A4');
  connectLow(wm, chip, '2A1'); connectLow(wm, chip, '2A2');
  connectLow(wm, chip, '2A3'); connectLow(wm, chip, '2A4');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, '1Y1', '4306: in=L, OE=L → 1Y1=L');
  assertPinLow(sim, chip, '1Y4', '4306: in=L, OE=L → 1Y4=L');
  assertPinLow(sim, chip, '2Y1', '4306: in=L, OE=L → 2Y1=L');
}

{
  // OE enabled, input HIGH → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x4306');
  connectLow(wm, chip, '1OEn'); connectLow(wm, chip, '2OEn');
  connectHigh(wm, chip, '1A1'); connectHigh(wm, chip, '1A2');
  connectHigh(wm, chip, '1A3'); connectHigh(wm, chip, '1A4');
  connectHigh(wm, chip, '2A1'); connectHigh(wm, chip, '2A2');
  connectHigh(wm, chip, '2A3'); connectHigh(wm, chip, '2A4');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, '1Y1', '4306: in=H, OE=L → 1Y1=H');
  assertPinHigh(sim, chip, '1Y4', '4306: in=H, OE=L → 1Y4=H');
  assertPinHigh(sim, chip, '2Y1', '4306: in=H, OE=L → 2Y1=H');
  assertPinHigh(sim, chip, '2Y4', '4306: in=H, OE=L → 2Y4=H');
}

{
  // OE disabled → HiZ
  const { world, chip, wm } = setupChipWithPower('74x4306');
  connectHigh(wm, chip, '1OEn'); connectHigh(wm, chip, '2OEn');
  connectHigh(wm, chip, '1A1'); connectHigh(wm, chip, '1A2');
  connectHigh(wm, chip, '1A3'); connectHigh(wm, chip, '1A4');
  connectHigh(wm, chip, '2A1'); connectHigh(wm, chip, '2A2');
  connectHigh(wm, chip, '2A3'); connectHigh(wm, chip, '2A4');
  const sim = makeSim(world, [chip], wm);
  assertPinHighZ(sim, chip, '1Y1', '4306: OE=H → 1Y1 HiZ');
  assertPinHighZ(sim, chip, '2Y1', '4306: OE=H → 2Y1 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - 74x4510: BCD decade up/down counter
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74x4510 BCD Decade Up/Down Counter ===');

{
  // Controller reset clears counter
  const { world, chip, wm } = setupChipWithPower('74x4510');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectLow(wm, chip, 'CI'); connectHigh(wm, chip, 'UD');
  connectHigh(wm, chip, 'MR');
  connectLow(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectLow(wm, chip, 'P3');
  const sim = makeSim(world, [chip], wm);
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 0, '4510: MR → count=0');
}

{
  // Count up: 0 → 9 → 0 (BCD wraps at 10)
  const { world, chip, wm } = setupChipWithPower('74x4510');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectHigh(wm, chip, 'CI'); connectHigh(wm, chip, 'UD');
  connectLow(wm, chip, 'MR');
  connectLow(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectLow(wm, chip, 'P3');
  // Reset first
  reconnectHigh(wm, chip, 'MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, 'MR');
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 10; i++) {
    assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === i, `4510: count up step ${i}`);
    clockPulse(wm, chip, 'CP', world, [chip], sim);
  }
  // After 10 clock pulses, should wrap to 0
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 0, '4510: wraps 9→0');
}

{
  // Count down: 0 → 9 (wraps)
  const { world, chip, wm } = setupChipWithPower('74x4510');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectHigh(wm, chip, 'CI'); connectLow(wm, chip, 'UD'); // UD=0 = down
  connectLow(wm, chip, 'MR');
  connectLow(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectLow(wm, chip, 'P3');
  reconnectHigh(wm, chip, 'MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, 'MR');
  sim.evaluate(world, [chip], wm);
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 0, '4510: start at 0');
  clockPulse(wm, chip, 'CP', world, [chip], sim);
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 9, '4510: count down 0→9');
}

{
  // Preset enable loads P0-P3
  const { world, chip, wm } = setupChipWithPower('74x4510');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'CI');
  connectLow(wm, chip, 'UD'); connectLow(wm, chip, 'MR');
  connectHigh(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectHigh(wm, chip, 'P2'); connectLow(wm, chip, 'P3');
  connectHigh(wm, chip, 'PE'); // PE=HIGH → load
  const sim = makeSim(world, [chip], wm);
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 5, '4510: PE loads 0101=5');
}

{
  // CI=LOW disables counting
  const { world, chip, wm } = setupChipWithPower('74x4510');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectLow(wm, chip, 'CI'); // disabled
  connectHigh(wm, chip, 'UD');
  connectLow(wm, chip, 'MR');
  connectLow(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectLow(wm, chip, 'P3');
  reconnectHigh(wm, chip, 'MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, 'MR');
  sim.evaluate(world, [chip], wm);
  clockPulse(wm, chip, 'CP', world, [chip], sim);
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 0, '4510: CI=0 → no count');
}

{
  // Carry output: active LOW at terminal count (9 up, 0 down) when CI=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4510');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectHigh(wm, chip, 'CI'); connectHigh(wm, chip, 'UD');
  connectLow(wm, chip, 'MR');
  // Load 9
  connectHigh(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectHigh(wm, chip, 'P3');
  reconnectHigh(wm, chip, 'PE');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, 'PE');
  sim.evaluate(world, [chip], wm);
  // At count=9, UD=1, CI=1 → COn should be LOW
  assertPinLow(sim, chip, 'COn', '4510: at 9, UD=1, CI=1 → COn=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E - 74x4511: BCD to 7-Segment Decoder
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: 74x4511 BCD to 7-Segment Decoder ===');

// Expected segment patterns (a,b,c,d,e,f,g):
//   0: 1110111  1: 0010010  2: 1011101  3: 1011011  4: 0111010
//   5: 1101011  6: 1101111  7: 1010010  8: 1111111  9: 1111011
const SEG_TABLE = [
  [1,1,1,1,1,1,0], // 0
  [0,1,1,0,0,0,0], // 1
  [1,1,0,1,1,0,1], // 2
  [1,1,1,1,0,0,1], // 3
  [0,1,1,0,0,1,1], // 4
  [1,0,1,1,0,1,1], // 5
  [1,0,1,1,1,1,1], // 6
  [1,1,1,0,0,0,0], // 7
  [1,1,1,1,1,1,1], // 8
  [1,1,1,1,0,1,1], // 9
];
const SEG_PINS = ['a','b','c','d','e','f','g'];

for (let digit = 0; digit <= 9; digit++) {
  const { world, chip, wm } = setupChipWithPower('74x4511');
  // LE=LOW (transparent), BIn=HIGH (no blank), LTn=HIGH (no lamp test)
  connectLow(wm, chip, 'LE');
  connectHigh(wm, chip, 'BIn');
  connectHigh(wm, chip, 'LTn');
  // Set BCD inputs
  if (digit & 1) connectHigh(wm, chip, 'A'); else connectLow(wm, chip, 'A');
  if (digit & 2) connectHigh(wm, chip, 'B'); else connectLow(wm, chip, 'B');
  if (digit & 4) connectHigh(wm, chip, 'C'); else connectLow(wm, chip, 'C');
  if (digit & 8) connectHigh(wm, chip, 'D'); else connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (let s = 0; s < 7; s++) {
    const expected = SEG_TABLE[digit][s];
    if (expected) assertPinHigh(sim, chip, SEG_PINS[s], `4511: digit ${digit} → ${SEG_PINS[s]}=H`);
    else          assertPinLow(sim, chip, SEG_PINS[s],  `4511: digit ${digit} → ${SEG_PINS[s]}=L`);
  }
}

{
  // Lamp test: LTn=LOW → all segments ON
  const { world, chip, wm } = setupChipWithPower('74x4511');
  connectLow(wm, chip, 'LE');
  connectHigh(wm, chip, 'BIn');
  connectLow(wm, chip, 'LTn'); // lamp test
  connectLow(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (const s of SEG_PINS) assertPinHigh(sim, chip, s, `4511: LT → ${s}=H`);
}

{
  // Blanking: BIn=LOW → all segments OFF
  const { world, chip, wm } = setupChipWithPower('74x4511');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'BIn'); // blank
  connectHigh(wm, chip, 'LTn');
  connectLow(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (const s of SEG_PINS) assertPinLow(sim, chip, s, `4511: BI → ${s}=L`);
}

{
  // Latch: LE=HIGH holds last value
  const { world, chip, wm } = setupChipWithPower('74x4511');
  connectLow(wm, chip, 'LE');
  connectHigh(wm, chip, 'BIn');
  connectHigh(wm, chip, 'LTn');
  // Show digit 5 first
  connectHigh(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectHigh(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  // Now latch
  reconnectHigh(wm, chip, 'LE');
  sim.evaluate(world, [chip], wm);
  // Change input to 0
  reconnectLow(wm, chip, 'A');
  reconnectLow(wm, chip, 'C');
  sim.evaluate(world, [chip], wm);
  // Should still show digit 5
  for (let s = 0; s < 7; s++) {
    const expected = SEG_TABLE[5][s];
    if (expected) assertPinHigh(sim, chip, SEG_PINS[s], `4511: latch holds 5 → ${SEG_PINS[s]}=H`);
    else          assertPinLow(sim, chip, SEG_PINS[s],  `4511: latch holds 5 → ${SEG_PINS[s]}=L`);
  }
}

{
  // Invalid BCD (10-15) → blank
  const { world, chip, wm } = setupChipWithPower('74x4511');
  connectLow(wm, chip, 'LE');
  connectHigh(wm, chip, 'BIn');
  connectHigh(wm, chip, 'LTn');
  // BCD = 10 (ABCD = 0101 → A=0,B=1,C=0,D=1)
  connectLow(wm, chip, 'A'); connectHigh(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectHigh(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (const s of SEG_PINS) assertPinLow(sim, chip, s, `4511: BCD=10 → ${s}=L`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F - 74x4514: 4-to-16 Decoder Active HIGH, Latched
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: 74x4514 4-to-16 Decoder (Active HIGH, Latched) ===');

{
  // Enabled, address 0 → Y0=HIGH, all others LOW
  const { world, chip, wm } = setupChipWithPower('74x4514');
  connectLow(wm, chip, 'LE'); // transparent
  connectLow(wm, chip, 'ENn'); // enabled
  connectLow(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, 'Y0', '4514: addr 0 → Y0=H');
  for (let i = 1; i < 16; i++) {
    assertPinLow(sim, chip, `Y${i}`, `4514: addr 0 → Y${i}=L`);
  }
}

{
  // Address 5 → Y5=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4514');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'ENn');
  // 5 = 0101: A=1, B=0, C=1, D=0
  connectHigh(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectHigh(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (let i = 0; i < 16; i++) {
    if (i === 5) assertPinHigh(sim, chip, `Y${i}`, `4514: addr 5 → Y5=H`);
    else         assertPinLow(sim, chip, `Y${i}`, `4514: addr 5 → Y${i}=L`);
  }
}

{
  // Address 15 → Y15=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4514');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'ENn');
  connectHigh(wm, chip, 'A'); connectHigh(wm, chip, 'B');
  connectHigh(wm, chip, 'C'); connectHigh(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, 'Y15', '4514: addr 15 → Y15=H');
  for (let i = 0; i < 15; i++) {
    assertPinLow(sim, chip, `Y${i}`, `4514: addr 15 → Y${i}=L`);
  }
}

{
  // Disabled (ENn=HIGH) → all outputs LOW
  const { world, chip, wm } = setupChipWithPower('74x4514');
  connectLow(wm, chip, 'LE');
  connectHigh(wm, chip, 'ENn'); // disabled
  connectLow(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (let i = 0; i < 16; i++) {
    assertPinLow(sim, chip, `Y${i}`, `4514: disabled → Y${i}=L`);
  }
}

{
  // Latch: LE=HIGH holds address
  const { world, chip, wm } = setupChipWithPower('74x4514');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'ENn');
  // Set addr 3 (A=1, B=1, C=0, D=0)
  connectHigh(wm, chip, 'A'); connectHigh(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  assertPinHigh(sim, chip, 'Y3', '4514: addr 3 transparent → Y3=H');
  // Latch
  reconnectHigh(wm, chip, 'LE');
  sim.evaluate(world, [chip], wm);
  // Change address to 7
  reconnectHigh(wm, chip, 'C');
  sim.evaluate(world, [chip], wm);
  // Still addr 3
  assertPinHigh(sim, chip, 'Y3', '4514: latched → Y3=H');
  assertPinLow(sim, chip, 'Y7', '4514: latched → Y7=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - 74x4515: 4-to-16 Decoder Active LOW, Latched
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION G: 74x4515 4-to-16 Decoder (Active LOW, Latched) ===');

{
  // Enabled, address 0 → Y0n=LOW, all others HIGH
  const { world, chip, wm } = setupChipWithPower('74x4515');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'ENn');
  connectLow(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, 'Y0n', '4515: addr 0 → Y0n=L');
  for (let i = 1; i < 16; i++) {
    assertPinHigh(sim, chip, `Y${i}n`, `4515: addr 0 → Y${i}n=H`);
  }
}

{
  // Address 10 → Y10n=LOW
  const { world, chip, wm } = setupChipWithPower('74x4515');
  connectLow(wm, chip, 'LE');
  connectLow(wm, chip, 'ENn');
  // 10 = 1010: A=0, B=1, C=0, D=1
  connectLow(wm, chip, 'A'); connectHigh(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectHigh(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  assertPinLow(sim, chip, 'Y10n', '4515: addr 10 → Y10n=L');
  assertPinHigh(sim, chip, 'Y0n', '4515: addr 10 → Y0n=H');
  assertPinHigh(sim, chip, 'Y15n', '4515: addr 10 → Y15n=H');
}

{
  // Disabled → all outputs HIGH
  const { world, chip, wm } = setupChipWithPower('74x4515');
  connectLow(wm, chip, 'LE');
  connectHigh(wm, chip, 'ENn');
  connectLow(wm, chip, 'A'); connectLow(wm, chip, 'B');
  connectLow(wm, chip, 'C'); connectLow(wm, chip, 'D');
  const sim = makeSim(world, [chip], wm);
  for (let i = 0; i < 16; i++) {
    assertPinHigh(sim, chip, `Y${i}n`, `4515: disabled → Y${i}n=H`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H - 74x4516: 4 bit binary up/down counter
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION H: 74x4516 4 bit Binary Up/Down Counter ===');

{
  // Count up 0-15 and wrap
  const { world, chip, wm } = setupChipWithPower('74x4516');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectHigh(wm, chip, 'CI'); connectHigh(wm, chip, 'UD');
  connectLow(wm, chip, 'MR');
  connectLow(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectLow(wm, chip, 'P3');
  reconnectHigh(wm, chip, 'MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, 'MR');
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 16; i++) {
    assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === i, `4516: count up step ${i}`);
    clockPulse(wm, chip, 'CP', world, [chip], sim);
  }
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 0, '4516: wraps 15→0');
}

{
  // Count down from 0 → 15
  const { world, chip, wm } = setupChipWithPower('74x4516');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectHigh(wm, chip, 'CI'); connectLow(wm, chip, 'UD');
  connectLow(wm, chip, 'MR');
  connectLow(wm, chip, 'P0'); connectLow(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectLow(wm, chip, 'P3');
  reconnectHigh(wm, chip, 'MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, 'MR');
  sim.evaluate(world, [chip], wm);
  clockPulse(wm, chip, 'CP', world, [chip], sim);
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 15, '4516: down 0→15');
}

{
  // Preset load
  const { world, chip, wm } = setupChipWithPower('74x4516');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'CI');
  connectLow(wm, chip, 'UD'); connectLow(wm, chip, 'MR');
  connectHigh(wm, chip, 'P0'); connectHigh(wm, chip, 'P1');
  connectLow(wm, chip, 'P2'); connectHigh(wm, chip, 'P3');
  connectHigh(wm, chip, 'PE');
  const sim = makeSim(world, [chip], wm);
  assert(readCount(sim, chip, ['Q0','Q1','Q2','Q3']) === 11, '4516: PE loads 1011=11');
}

{
  // Carry output at terminal count
  const { world, chip, wm } = setupChipWithPower('74x4516');
  connectLow(wm, chip, 'CP'); connectLow(wm, chip, 'PE');
  connectHigh(wm, chip, 'CI'); connectHigh(wm, chip, 'UD');
  connectLow(wm, chip, 'MR');
  // Load 15
  connectHigh(wm, chip, 'P0'); connectHigh(wm, chip, 'P1');
  connectHigh(wm, chip, 'P2'); connectHigh(wm, chip, 'P3');
  reconnectHigh(wm, chip, 'PE');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, 'PE');
  sim.evaluate(world, [chip], wm);
  assertPinLow(sim, chip, 'COn', '4516: at 15, UD=1, CI=1 → COn=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION I - 74x4518: Dual Synchronous BCD Counter
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION I: 74x4518 Dual Synchronous BCD Counter ===');

{
  // Section 1: count on rising CP while EN=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4518');
  connectLow(wm, chip, '1CP'); connectHigh(wm, chip, '1EN');
  connectLow(wm, chip, '1MR');
  connectLow(wm, chip, '2CP'); connectLow(wm, chip, '2EN');
  connectLow(wm, chip, '2MR');
  // Reset section 1
  reconnectHigh(wm, chip, '1MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, '1MR');
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 10; i++) {
    assert(readCount(sim, chip, ['1Q0','1Q1','1Q2','1Q3']) === i, `4518 s1: count ${i}`);
    clockPulse(wm, chip, '1CP', world, [chip], sim);
  }
  assert(readCount(sim, chip, ['1Q0','1Q1','1Q2','1Q3']) === 0, '4518 s1: wraps 9→0');
}

{
  // Section 2: count on rising EN while CP=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4518');
  connectLow(wm, chip, '1CP'); connectLow(wm, chip, '1EN');
  connectLow(wm, chip, '1MR');
  connectHigh(wm, chip, '2CP'); // CP held HIGH
  connectLow(wm, chip, '2EN');  // EN toggled
  connectLow(wm, chip, '2MR');
  reconnectHigh(wm, chip, '2MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, '2MR');
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 5; i++) {
    assert(readCount(sim, chip, ['2Q0','2Q1','2Q2','2Q3']) === i, `4518 s2 (EN clk): count ${i}`);
    // Pulse EN (rising edge while CP=HIGH)
    clockPulse(wm, chip, '2EN', world, [chip], sim);
  }
}

{
  // Controller reset clears counter
  const { world, chip, wm } = setupChipWithPower('74x4518');
  connectLow(wm, chip, '1CP'); connectHigh(wm, chip, '1EN');
  connectLow(wm, chip, '1MR');
  connectLow(wm, chip, '2CP'); connectLow(wm, chip, '2EN');
  connectLow(wm, chip, '2MR');
  const sim = makeSim(world, [chip], wm);
  // Count up a few
  clockPulse(wm, chip, '1CP', world, [chip], sim);
  clockPulse(wm, chip, '1CP', world, [chip], sim);
  clockPulse(wm, chip, '1CP', world, [chip], sim);
  assert(readCount(sim, chip, ['1Q0','1Q1','1Q2','1Q3']) === 3, '4518: count 3');
  // Reset
  reconnectHigh(wm, chip, '1MR');
  sim.evaluate(world, [chip], wm);
  assert(readCount(sim, chip, ['1Q0','1Q1','1Q2','1Q3']) === 0, '4518: MR → 0');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION J - 74x4520: Dual Synchronous Binary Counter
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION J: 74x4520 Dual Synchronous Binary Counter ===');

{
  // Section 1: count 0-15 and wrap
  const { world, chip, wm } = setupChipWithPower('74x4520');
  connectLow(wm, chip, '1CP'); connectHigh(wm, chip, '1EN');
  connectLow(wm, chip, '1MR');
  connectLow(wm, chip, '2CP'); connectLow(wm, chip, '2EN');
  connectLow(wm, chip, '2MR');
  reconnectHigh(wm, chip, '1MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, '1MR');
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 16; i++) {
    assert(readCount(sim, chip, ['1Q0','1Q1','1Q2','1Q3']) === i, `4520 s1: count ${i}`);
    clockPulse(wm, chip, '1CP', world, [chip], sim);
  }
  assert(readCount(sim, chip, ['1Q0','1Q1','1Q2','1Q3']) === 0, '4520 s1: wraps 15→0');
}

{
  // Section 2: EN as clock with CP=HIGH
  const { world, chip, wm } = setupChipWithPower('74x4520');
  connectLow(wm, chip, '1CP'); connectLow(wm, chip, '1EN');
  connectLow(wm, chip, '1MR');
  connectHigh(wm, chip, '2CP');
  connectLow(wm, chip, '2EN');
  connectLow(wm, chip, '2MR');
  reconnectHigh(wm, chip, '2MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, '2MR');
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 5; i++) {
    assert(readCount(sim, chip, ['2Q0','2Q1','2Q2','2Q3']) === i, `4520 s2 EN clk: ${i}`);
    clockPulse(wm, chip, '2EN', world, [chip], sim);
  }
}

{
  // Neither EN nor CP rising → no count
  const { world, chip, wm } = setupChipWithPower('74x4520');
  connectLow(wm, chip, '1CP'); connectLow(wm, chip, '1EN'); // both LOW
  connectLow(wm, chip, '1MR');
  connectLow(wm, chip, '2CP'); connectLow(wm, chip, '2EN');
  connectLow(wm, chip, '2MR');
  reconnectHigh(wm, chip, '1MR');
  const sim = makeSim(world, [chip], wm);
  reconnectLow(wm, chip, '1MR');
  sim.evaluate(world, [chip], wm);
  // Pulse CP but EN is LOW → no count
  reconnectHigh(wm, chip, '1CP');
  sim.evaluate(world, [chip], wm);
  reconnectLow(wm, chip, '1CP');
  sim.evaluate(world, [chip], wm);
  assert(readCount(sim, chip, ['1Q0','1Q1','1Q2','1Q3']) === 0, '4520: CP rise while EN=L → no count');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed, ${pass + fail} total ===`);
if (fail > 0) process.exit(1);
