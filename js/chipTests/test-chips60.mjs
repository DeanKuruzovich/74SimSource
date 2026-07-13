// test-chips60.mjs - Tests for all chips defined in js/chips/chips60.js
// Chips under test:
//   74x4724  : 8 bit Addressable Latch (ADDRESSABLE_LATCH, 16 pin)
//   74x4799  : NiCd/NiMH Charge Timer (GENERIC_STUB, 16 pin)
//   74x4851  : 8-Channel Analog Mux (GENERIC_STUB, 16 pin)
//   74x4852  : Dual 4-Channel Analog Mux (GENERIC_STUB, 16 pin)
//   74x5074  : Dual D FF (D_FF, 14 pin)
//   74x5245  : Octal Transceiver (TRANSCEIVER_8BIT, 20 pin)
//   74x5300  : Fiber Optic LED Driver (GENERIC_STUB, 8 pin)
//   74x5302  : Dual Fiber Optic Driver (GENERIC_STUB, 14 pin)
//   74x5555  : Programmable Delay Timer (GENERIC_STUB, 16 pin)
//   74x5620  : Octal Transceiver (TRANSCEIVER_8BIT, 20 pin)
//   74x6000  : Optocoupler Non-Inv (BUFFER, 6 pin)
//   74x6001  : Optocoupler Inv (NOT, 6 pin)
//   74x6010  : Optocoupler Non-Inv OC (BUFFER, 6 pin)
//   74x6011  : Optocoupler Inv OC (NOT, 6 pin)
//   74x6300  : DRAM Refresh Timer (GENERIC_STUB, 16 pin)
//   74x6310  : DRAM Access Detector (GENERIC_STUB, 20 pin)

import { CHIPS_BLOCK_60 } from '../chips/chips60.js';
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

function simulate(world, wm, chips) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, Array.isArray(chips) ? chips : [chips], wm);
  return sim;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x4724', '74x4799', '74x4851', '74x4852', '74x5074', '74x5245', '74x5555', '74x5620', '74x6000', '74x6001',
  '74x6010', '74x6011', '74x6300', '74x6310',
];

const EXPECTED_SPECS = {
  '74x4724': { pins: 16, gnd:  8, vcc: 16 },
  '74x4799': { pins: 16, gnd:  8, vcc: 16 },
  '74x4851': { pins: 16, gnd:  8, vcc: 16 },
  '74x4852': { pins: 16, gnd:  8, vcc: 16 },
  '74x5074': { pins: 14, gnd:  7, vcc: 14 },
  '74x5245': { pins: 20, gnd: 10, vcc: 20 },
  '74x5555': { pins: 16, gnd:  8, vcc: 16 },
  '74x5620': { pins: 20, gnd: 10, vcc: 20 },
  '74x6000': { pins:  6, gnd:  4, vcc:  6 },
  '74x6001': { pins:  6, gnd:  4, vcc:  6 },
  '74x6010': { pins:  6, gnd:  4, vcc:  6 },
  '74x6011': { pins:  6, gnd:  4, vcc:  6 },
  '74x6300': { pins: 16, gnd:  8, vcc: 16 },
  '74x6310': { pins: 20, gnd: 10, vcc: 20 },
};

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_60 === 'object', 'CHIPS_BLOCK_60 is exported object');
assert(Object.keys(CHIPS_BLOCK_60).length === 14, 'CHIPS_BLOCK_60 has 14 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_60[id];
  assert(cd !== undefined, `${id} exists in CHIPS_BLOCK_60`);
  if (!cd) continue;

  const sp = EXPECTED_SPECS[id];
  assert(cd.pins === sp.pins, `${id} pin count = ${sp.pins}`);
  assert(cd.gnd  === sp.gnd,  `${id} gnd pin  = ${sp.gnd}`);
  assert(cd.vcc  === sp.vcc,  `${id} vcc pin  = ${sp.vcc}`);
  assert(cd.name === `74x${id.slice(3)}`, `${id} name = ${cd.name}`);
  assert(Array.isArray(cd.pinout), `${id} has pinout array`);
  assert(cd.pinout.length === sp.pins, `${id} pinout length = ${sp.pins}`);
  assert(Array.isArray(cd.gates), `${id} has gates array`);
  assert(cd.gates.length >= 1, `${id} has at least 1 gate`);
  assert(Array.isArray(cd.tags), `${id} has tags array`);

  // Check VCC and GND pins exist in pinout
  const vccPin = cd.pinout.find(p => p.name === 'VCC');
  const gndPin = cd.pinout.find(p => p.name === 'GND');
  assert(vccPin && vccPin.pin === sp.vcc, `${id} VCC at correct pin`);
  assert(gndPin && gndPin.pin === sp.gnd, `${id} GND at correct pin`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-4724 - 74x4724 Addressable Latch functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-4724: 74x4724 8 bit Addressable Latch ===');
{
  // Test: CLR resets all outputs to LOW
  const { world, chip, wm } = setupChipWithPower('74x4724');
  // CLR=HIGH (active low: clear when LOW), G=HIGH (enable, active low)
  connectHigh(wm, chip, 'CLR');
  connectLow(wm, chip, 'G');    // G=LOW → transparent
  connectLow(wm, chip, 'A0');
  connectLow(wm, chip, 'A1');
  connectLow(wm, chip, 'A2');
  connectHigh(wm, chip, 'D');    // D=HIGH

  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Q0', '4724: G=0 A=000 D=1 → Q0=HIGH');

  // Clear all outputs
  reconnectLow(wm, chip, 'CLR');
  sim = simulate(world, wm, chip);
  for (let i = 0; i < 8; i++) {
    assertPinLow(sim, chip, `Q${i}`, `4724: CLR=LOW → Q${i}=LOW`);
  }

  // Release CLR, set address 3, D=HIGH
  reconnectHigh(wm, chip, 'CLR');
  reconnectHigh(wm, chip, 'A0');
  reconnectHigh(wm, chip, 'A1');
  reconnectLow(wm, chip, 'A2');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Q3', '4724: A=011 D=1 → Q3=HIGH');
  assertPinLow(sim, chip, 'Q0', '4724: Q0 stays LOW');
  assertPinLow(sim, chip, 'Q7', '4724: Q7 stays LOW');

  // Set address 7, D=HIGH
  reconnectHigh(wm, chip, 'A2');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Q7', '4724: A=111 D=1 → Q7=HIGH');
  assertPinHigh(sim, chip, 'Q3', '4724: Q3 still HIGH');

  // Set address 7, D=LOW → Q7 goes LOW
  reconnectLow(wm, chip, 'D');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Q7', '4724: A=111 D=0 → Q7=LOW');
  assertPinHigh(sim, chip, 'Q3', '4724: Q3 still HIGH (not addressed)');

  // G=HIGH (latch mode), change D, verify Q doesn't change
  reconnectHigh(wm, chip, 'G');
  reconnectHigh(wm, chip, 'D');
  reconnectLow(wm, chip, 'A0');
  reconnectLow(wm, chip, 'A1');
  reconnectLow(wm, chip, 'A2');
  sim = simulate(world, wm, chip);
  // Q0 should retain its previous value (LOW since it was cleared)
  assertPinLow(sim, chip, 'Q0', '4724: G=1 (latch) → Q0 retains LOW');
  assertPinHigh(sim, chip, 'Q3', '4724: G=1 → Q3 retains HIGH');
}

// Test all 8 addresses individually
console.log('  -- 4724: All 8 addresses --');
{
  for (let addr = 0; addr < 8; addr++) {
    const { world, chip, wm } = setupChipWithPower('74x4724');
    connectHigh(wm, chip, 'CLR');
    connectLow(wm, chip, 'G');   // transparent
    // Set address
    if (addr & 1) connectHigh(wm, chip, 'A0'); else connectLow(wm, chip, 'A0');
    if (addr & 2) connectHigh(wm, chip, 'A1'); else connectLow(wm, chip, 'A1');
    if (addr & 4) connectHigh(wm, chip, 'A2'); else connectLow(wm, chip, 'A2');
    connectHigh(wm, chip, 'D');

    const sim = simulate(world, wm, chip);
    assertPinHigh(sim, chip, `Q${addr}`, `4724: addr=${addr} D=1 → Q${addr}=HIGH`);
    // Other outputs should be LOW
    for (let j = 0; j < 8; j++) {
      if (j !== addr) {
        assertPinLow(sim, chip, `Q${j}`, `4724: addr=${addr} → Q${j}=LOW`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-5074 - 74x5074 Dual D Flip Flop functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-5074: 74x5074 Dual D Flip Flop ===');
{
  // Test FF1: PRE and CLR active low
  const { world, chip, wm } = setupChipWithPower('74x5074');
  // Both PRE and CLR inactive (HIGH)
  connectHigh(wm, chip, '1PRE');
  connectHigh(wm, chip, '1CLR');
  connectHigh(wm, chip, '2PRE');
  connectHigh(wm, chip, '2CLR');
  // Start with CLK=LOW, D=LOW
  connectLow(wm, chip, '1CLK');
  connectLow(wm, chip, '1D');
  connectLow(wm, chip, '2CLK');
  connectLow(wm, chip, '2D');

  let sim = simulate(world, wm, chip);

  // Test CLR active (LOW) → Q=LOW, Qn=HIGH
  reconnectLow(wm, chip, '1CLR');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '1Q', '5074: FF1 CLR=LOW → Q=LOW');
  assertPinHigh(sim, chip, '1Qn', '5074: FF1 CLR=LOW → Qn=HIGH');

  // Release CLR
  reconnectHigh(wm, chip, '1CLR');

  // Test PRE active (LOW) → Q=HIGH, Qn=LOW
  reconnectLow(wm, chip, '1PRE');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '1Q', '5074: FF1 PRE=LOW → Q=HIGH');
  assertPinLow(sim, chip, '1Qn', '5074: FF1 PRE=LOW → Qn=LOW');

  // Release PRE
  reconnectHigh(wm, chip, '1PRE');

  // Clock D=HIGH → Q=HIGH
  reconnectHigh(wm, chip, '1D');
  reconnectHigh(wm, chip, '1CLK');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '1Q', '5074: FF1 CLK↑ D=1 → Q=HIGH');
  assertPinLow(sim, chip, '1Qn', '5074: FF1 CLK↑ D=1 → Qn=LOW');

  // Clock D=LOW → Q=LOW
  reconnectLow(wm, chip, '1CLK');
  sim = simulate(world, wm, chip);
  reconnectLow(wm, chip, '1D');
  reconnectHigh(wm, chip, '1CLK');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '1Q', '5074: FF1 CLK↑ D=0 → Q=LOW');
  assertPinHigh(sim, chip, '1Qn', '5074: FF1 CLK↑ D=0 → Qn=HIGH');
}

// Test FF2
console.log('  -- 5074: FF2 --');
{
  const { world, chip, wm } = setupChipWithPower('74x5074');
  connectHigh(wm, chip, '1PRE');
  connectHigh(wm, chip, '1CLR');
  connectHigh(wm, chip, '2PRE');
  connectHigh(wm, chip, '2CLR');
  connectLow(wm, chip, '1CLK');
  connectLow(wm, chip, '1D');
  connectLow(wm, chip, '2CLK');
  connectHigh(wm, chip, '2D');

  // Establish initial state with CLK=LOW
  let sim = simulate(world, wm, chip);

  // Rising edge: CLK LOW→HIGH with D=HIGH
  reconnectHigh(wm, chip, '2CLK');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, '2Q', '5074: FF2 CLK↑ D=1 → Q=HIGH');
  assertPinLow(sim, chip, '2Qn', '5074: FF2 CLK↑ D=1 → Qn=LOW');

  // CLR FF2
  reconnectLow(wm, chip, '2CLR');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, '2Q', '5074: FF2 CLR=LOW → Q=LOW');
  assertPinHigh(sim, chip, '2Qn', '5074: FF2 CLR=LOW → Qn=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-5245 - 74x5245 Octal Transceiver functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-5245: 74x5245 Octal Transceiver ===');
{
  // Test A→B direction (DIR=HIGH, OE=LOW)
  const { world, chip, wm } = setupChipWithPower('74x5245');
  connectHigh(wm, chip, 'DIR');  // A→B
  connectLow(wm, chip, 'OE');   // enabled

  // Drive A1 HIGH, A2 LOW
  connectHigh(wm, chip, 'A1');
  connectLow(wm, chip, 'A2');
  connectHigh(wm, chip, 'A3');
  connectLow(wm, chip, 'A4');
  connectHigh(wm, chip, 'A5');
  connectLow(wm, chip, 'A6');
  connectHigh(wm, chip, 'A7');
  connectLow(wm, chip, 'A8');

  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'B1', '5245: DIR=1 A1=H → B1=H');
  assertPinLow(sim, chip, 'B2', '5245: DIR=1 A2=L → B2=L');
  assertPinHigh(sim, chip, 'B3', '5245: DIR=1 A3=H → B3=H');
  assertPinLow(sim, chip, 'B4', '5245: DIR=1 A4=L → B4=L');
  assertPinHigh(sim, chip, 'B5', '5245: DIR=1 A5=H → B5=H');
  assertPinLow(sim, chip, 'B6', '5245: DIR=1 A6=L → B6=L');
  assertPinHigh(sim, chip, 'B7', '5245: DIR=1 A7=H → B7=H');
  assertPinLow(sim, chip, 'B8', '5245: DIR=1 A8=L → B8=L');
}

{
  // Test B→A direction (DIR=LOW, OE=LOW)
  const { world, chip, wm } = setupChipWithPower('74x5245');
  connectLow(wm, chip, 'DIR');   // B→A
  connectLow(wm, chip, 'OE');    // enabled

  // Drive B side
  connectHigh(wm, chip, 'B1');
  connectLow(wm, chip, 'B2');
  connectHigh(wm, chip, 'B3');
  connectHigh(wm, chip, 'B4');
  connectLow(wm, chip, 'B5');
  connectLow(wm, chip, 'B6');
  connectHigh(wm, chip, 'B7');
  connectHigh(wm, chip, 'B8');

  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'A1', '5245: DIR=0 B1=H → A1=H');
  assertPinLow(sim, chip, 'A2', '5245: DIR=0 B2=L → A2=L');
  assertPinHigh(sim, chip, 'A3', '5245: DIR=0 B3=H → A3=H');
  assertPinHigh(sim, chip, 'A4', '5245: DIR=0 B4=H → A4=H');
  assertPinLow(sim, chip, 'A5', '5245: DIR=0 B5=L → A5=L');
  assertPinLow(sim, chip, 'A6', '5245: DIR=0 B6=L → A6=L');
  assertPinHigh(sim, chip, 'A7', '5245: DIR=0 B7=H → A7=H');
  assertPinHigh(sim, chip, 'A8', '5245: DIR=0 B8=H → A8=H');
}

{
  // Test OE=HIGH → outputs disabled (Hi-Z)
  const { world, chip, wm } = setupChipWithPower('74x5245');
  connectHigh(wm, chip, 'DIR');
  connectHigh(wm, chip, 'OE');  // disabled
  connectHigh(wm, chip, 'A1');

  let sim = simulate(world, wm, chip);
  assertPinHighZ(sim, chip, 'B1', '5245: OE=1 → B1=Hi-Z');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-5620 - 74x5620 Octal Transceiver functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-5620: 74x5620 Octal Transceiver ===');
{
  // Test A→B direction
  const { world, chip, wm } = setupChipWithPower('74x5620');
  connectHigh(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');

  connectHigh(wm, chip, 'A1');
  connectHigh(wm, chip, 'A2');
  connectLow(wm, chip, 'A3');
  connectLow(wm, chip, 'A4');
  connectHigh(wm, chip, 'A5');
  connectHigh(wm, chip, 'A6');
  connectLow(wm, chip, 'A7');
  connectLow(wm, chip, 'A8');

  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'B1', '5620: DIR=1 A1=H → B1=H');
  assertPinHigh(sim, chip, 'B2', '5620: DIR=1 A2=H → B2=H');
  assertPinLow(sim, chip, 'B3', '5620: DIR=1 A3=L → B3=L');
  assertPinLow(sim, chip, 'B4', '5620: DIR=1 A4=L → B4=L');
  assertPinHigh(sim, chip, 'B5', '5620: DIR=1 A5=H → B5=H');
  assertPinHigh(sim, chip, 'B6', '5620: DIR=1 A6=H → B6=H');
  assertPinLow(sim, chip, 'B7', '5620: DIR=1 A7=L → B7=L');
  assertPinLow(sim, chip, 'B8', '5620: DIR=1 A8=L → B8=L');
}

{
  // Test B→A direction
  const { world, chip, wm } = setupChipWithPower('74x5620');
  connectLow(wm, chip, 'DIR');
  connectLow(wm, chip, 'OE');

  connectHigh(wm, chip, 'B1');
  connectLow(wm, chip, 'B2');
  connectHigh(wm, chip, 'B3');
  connectLow(wm, chip, 'B4');
  connectHigh(wm, chip, 'B5');
  connectLow(wm, chip, 'B6');
  connectHigh(wm, chip, 'B7');
  connectLow(wm, chip, 'B8');

  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'A1', '5620: DIR=0 B1=H → A1=H');
  assertPinLow(sim, chip, 'A2', '5620: DIR=0 B2=L → A2=L');
  assertPinHigh(sim, chip, 'A3', '5620: DIR=0 B3=H → A3=H');
  assertPinLow(sim, chip, 'A4', '5620: DIR=0 B4=L → A4=L');
  assertPinHigh(sim, chip, 'A5', '5620: DIR=0 B5=H → A5=H');
  assertPinLow(sim, chip, 'A6', '5620: DIR=0 B6=L → A6=L');
  assertPinHigh(sim, chip, 'A7', '5620: DIR=0 B7=H → A7=H');
  assertPinLow(sim, chip, 'A8', '5620: DIR=0 B8=L → A8=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-6000 - 74x6000 Optocoupler (Non Inverting) functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-6000: 74x6000 Optocoupler (Non-Inv) ===');
{
  const { world, chip, wm } = setupChipWithPower('74x6000');
  // A=HIGH → Y=HIGH (non inverting buffer)
  connectHigh(wm, chip, 'A');
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y', '6000: A=H → Y=H');

  // A=LOW → Y=LOW
  reconnectLow(wm, chip, 'A');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y', '6000: A=L → Y=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-6001 - 74x6001 Optocoupler (Inverting) functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-6001: 74x6001 Optocoupler (Inv) ===');
{
  const { world, chip, wm } = setupChipWithPower('74x6001');
  // A=HIGH → Y=LOW (inverting)
  connectHigh(wm, chip, 'A');
  let sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y', '6001: A=H → Y=L');

  // A=LOW → Y=HIGH
  reconnectLow(wm, chip, 'A');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y', '6001: A=L → Y=H');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-6010 - 74x6010 Optocoupler (Non-Inv OC) functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-6010: 74x6010 Optocoupler (Non-Inv OC) ===');
{
  const { world, chip, wm } = setupChipWithPower('74x6010');
  connectHigh(wm, chip, 'A');
  let sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y', '6010: A=H → Y=H');

  reconnectLow(wm, chip, 'A');
  sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y', '6010: A=L → Y=L');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-6011 - 74x6011 Optocoupler (Inv OC) functional tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-6011: 74x6011 Optocoupler (Inv OC) ===');
{
  const { world, chip, wm } = setupChipWithPower('74x6011');
  connectHigh(wm, chip, 'A');
  let sim = simulate(world, wm, chip);
  assertPinLow(sim, chip, 'Y', '6011: A=H → Y=L');

  reconnectLow(wm, chip, 'A');
  sim = simulate(world, wm, chip);
  assertPinHigh(sim, chip, 'Y', '6011: A=L → Y=H');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F-STUBS - Structural tests for stub chips
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SECTION F-STUBS: Stub chip structure ===');
{
  const stubIds = ['74x4799','74x4851','74x4852','74x5555','74x6300','74x6310'];
  for (const id of stubIds) {
    const cd = CHIPS_BLOCK_60[id];
    assert(cd !== undefined, `${id}: exists`);
    if (!cd) continue;
    assert(cd.gates[0].type === 'GENERIC_STUB', `${id}: gate type is GENERIC_STUB`);
    // Verify the chip can be instantiated and placed
    const { world, chip, wm } = setupChipWithPower(id);
    assert(chip !== undefined, `${id}: chip instantiated`);
    assert(findPin(chip, 'VCC') !== undefined, `${id}: VCC pin exists`);
    assert(findPin(chip, 'GND') !== undefined, `${id}: GND pin exists`);

    // Simulate - should not throw
    let threw = false;
    try {
      simulate(world, wm, chip);
    } catch (e) {
      threw = true;
    }
    assert(!threw, `${id}: simulation does not throw`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n──────────────────────────────────────`);
console.log(`test-chips60  pass: ${pass}  fail: ${fail}`);
console.log(`──────────────────────────────────────`);
if (fail > 0) process.exit(1);
