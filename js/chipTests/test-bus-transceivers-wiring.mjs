// test-bus-transceivers-wiring.mjs
//
// Focused tests for the bus-transceiver chips that were promoted from
// GENERIC_STUB to real evaluators as part of Simplifications.md item 4.
// Also covers the simulator-level fix that lets the implicit OC pull-up
// fire on 'bidir' / 'io' pins (not just 'output' pins).
//
// Chips exercised:
//   74x1245  - TRANSCEIVER_8BIT          (non-inv, tri-state, 20-pin, A0-A7/B0-B7)
//   74x3245  - TRANSCEIVER_8BIT          (non-inv, tri-state, 20-pin, A1-A8/B1-B8)
//   74x2952  - TRANSCEIVER_OCTAL_REG     (non-inv, registered, 24-pin)
//   74x2953  - TRANSCEIVER_OCTAL_REG_INV (inverting, registered, 24-pin)
//   74x641   - bidir-pin OC pull-up regression (sanity)

import { CHIPS_BLOCK_48 } from '../chips/chips48.js';
import { CHIPS_BLOCK_54 } from '../chips/chips54.js';
import { CHIPS_BLOCK_55 } from '../chips/chips55.js';
import { CHIPS_BLOCK_34 } from '../chips/chips34.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else      { fail++; console.error(`  ✗ ${msg}`); }
}

function findPin(comp, name) {
  return typeof comp.getPinByName === 'function'
    ? comp.getPinByName(name)
    : comp.pins.find(p => p.name === name);
}
function connectPinToVcc(wm, pin) { return wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId); }
function connectPinToGnd(wm, pin) { return wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId); }
function disconnectWire(wm, wire) { if (wire) wm.removeWire(wire.id); }
function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}
function assertHigh(sim, chip, name, label) {
  const v = getPinVoltage(sim, findPin(chip, name));
  assert(v !== undefined && v > 2.5, `${label}: ${name} HIGH (got ${v})`);
}
function assertLow(sim, chip, name, label) {
  const v = getPinVoltage(sim, findPin(chip, name));
  assert(v === undefined || v < 2.5, `${label}: ${name} LOW (got ${v})`);
}
function assertHiZ(sim, chip, name, label) {
  const v = getPinVoltage(sim, findPin(chip, name));
  // No driver → floats to 0V or undefined.
  assert(v === undefined || v === null || v < 2.5, `${label}: ${name} HiZ (got ${v})`);
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
function pulseClkHigh(sim, world, chip, wm, clkLowWire) {
  disconnectWire(wm, clkLowWire);
  const clkHi = connectPinToVcc(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkHi);
  const clkLow = connectPinToGnd(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  return clkLow;
}

// ─────────────────────────────────────────────────────────────────────────────
// S: Structural sanity — make sure the wired chips no longer carry GENERIC_STUB.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nS: Newly wired chips use real transceiver evaluators');
{
  const cases = [
    ['74x1245', CHIPS_BLOCK_48, 'TRANSCEIVER_8BIT'],
    ['74x3245', CHIPS_BLOCK_55, 'TRANSCEIVER_8BIT'],
    ['74x2952', CHIPS_BLOCK_54, 'TRANSCEIVER_OCTAL_REG'],
    ['74x2953', CHIPS_BLOCK_54, 'TRANSCEIVER_OCTAL_REG_INV'],
  ];
  for (const [id, block, expected] of cases) {
    const def = block[id];
    assert(!!def, `${id}: chip def exists`);
    if (!def) continue;
    assert(def.gates?.[0]?.type === expected,
      `${id}: gate type is ${expected} (got ${def.gates?.[0]?.type})`);
    const tags = def.tags || [];
    assert(!tags.includes('stub'), `${id}: 'stub' tag removed`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// G1: 74x1245 — non-inverting, tri-state, A0-A7 / B0-B7
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG1: 74x1245 (TRANSCEIVER_8BIT, non-inv, tri-state)');

console.log('  G1a: OEn=H → all bus pins Hi-Z (tri-state, no implicit pull-up)');
{
  const { world, chip, wm } = setupChipWithPower('74x1245');
  connectPinToVcc(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['A0','A1','A2','A3','A4','A5','A6','A7',
                   'B0','B1','B2','B3','B4','B5','B6','B7']) {
    assertHiZ(sim, chip, n, '74x1245 OEn=H');
  }
}

console.log('  G1b: OEn=L, DIR=H → A→B passes data through');
{
  const { world, chip, wm } = setupChipWithPower('74x1245');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  for (const n of ['A0','A2','A4','A6']) connectPinToVcc(wm, findPin(chip, n));
  for (const n of ['A1','A3','A5','A7']) connectPinToGnd(wm, findPin(chip, n));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertHigh(sim, chip, 'B0', '74x1245 A→B'); assertLow(sim, chip, 'B1', '74x1245 A→B');
  assertHigh(sim, chip, 'B2', '74x1245 A→B'); assertLow(sim, chip, 'B3', '74x1245 A→B');
  assertHigh(sim, chip, 'B4', '74x1245 A→B'); assertLow(sim, chip, 'B5', '74x1245 A→B');
  assertHigh(sim, chip, 'B6', '74x1245 A→B'); assertLow(sim, chip, 'B7', '74x1245 A→B');
}

console.log('  G1c: OEn=L, DIR=L → B→A passes data through');
{
  const { world, chip, wm } = setupChipWithPower('74x1245');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'DIR'));
  for (const n of ['B0','B2','B4','B6']) connectPinToVcc(wm, findPin(chip, n));
  for (const n of ['B1','B3','B5','B7']) connectPinToGnd(wm, findPin(chip, n));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertHigh(sim, chip, 'A0', '74x1245 B→A'); assertLow(sim, chip, 'A1', '74x1245 B→A');
  assertHigh(sim, chip, 'A2', '74x1245 B→A'); assertLow(sim, chip, 'A3', '74x1245 B→A');
}

// ─────────────────────────────────────────────────────────────────────────────
// G2: 74x3245 — non-inverting, tri-state, A1-A8 / B1-B8
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG2: 74x3245 (TRANSCEIVER_8BIT, non-inv, tri-state, A1-A8/B1-B8)');

console.log('  G2a: OEn=L, DIR=H → A→B mirrors A inputs');
{
  const { world, chip, wm } = setupChipWithPower('74x3245');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  for (const n of ['A1','A3','A5','A7']) connectPinToVcc(wm, findPin(chip, n));
  for (const n of ['A2','A4','A6','A8']) connectPinToGnd(wm, findPin(chip, n));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const [name, bit] of [['B1',1],['B2',0],['B3',1],['B4',0],['B5',1],['B6',0],['B7',1],['B8',0]]) {
    if (bit) assertHigh(sim, chip, name, '74x3245 A→B');
    else     assertLow(sim, chip, name, '74x3245 A→B');
  }
}

console.log('  G2b: OEn=H → all bus pins Hi-Z');
{
  const { world, chip, wm } = setupChipWithPower('74x3245');
  connectPinToVcc(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['A1','A2','A3','A4','A5','A6','A7','A8',
                   'B1','B2','B3','B4','B5','B6','B7','B8']) {
    assertHiZ(sim, chip, n, '74x3245 OEn=H');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// G3: 74x2952 — non-inverting registered transceiver
// CLK rising edge latches the source side; OEABn / OEBAn gate destination drive.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG3: 74x2952 (TRANSCEIVER_OCTAL_REG, non-inv, registered)');

console.log('  G3a: DIR=H, OEABn=L → CLK↑ captures A, drives B; OEBAn gates B→A');
{
  const { world, chip, wm } = setupChipWithPower('74x2952');
  connectPinToGnd(wm, findPin(chip, 'OEABn'));   // enable A→B output
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));   // disable B→A output
  connectPinToVcc(wm, findPin(chip, 'DIR'));     // A→B
  for (const n of ['A1','A3','A5','A7']) connectPinToVcc(wm, findPin(chip, n));
  for (const n of ['A2','A4','A6','A8']) connectPinToGnd(wm, findPin(chip, n));
  const clkLow = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClkHigh(sim, world, chip, wm, clkLow);
  for (const [name, bit] of [['B1',1],['B2',0],['B3',1],['B4',0],['B5',1],['B6',0],['B7',1],['B8',0]]) {
    if (bit) assertHigh(sim, chip, name, '74x2952 CLK↑ A→B');
    else     assertLow(sim, chip, name, '74x2952 CLK↑ A→B');
  }
}

console.log('  G3b: OEABn=H → B side Hi-Z (output gated off after capture)');
{
  const { world, chip, wm } = setupChipWithPower('74x2952');
  connectPinToVcc(wm, findPin(chip, 'OEABn'));   // disable A→B output
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));   // disable B→A output
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  for (const n of ['A1','A2','A3','A4','A5','A6','A7','A8']) connectPinToVcc(wm, findPin(chip, n));
  const clkLow = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClkHigh(sim, world, chip, wm, clkLow);
  for (const n of ['B1','B2','B3','B4','B5','B6','B7','B8']) {
    assertHiZ(sim, chip, n, '74x2952 OEABn=H');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// G4: 74x2953 — inverting registered transceiver
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG4: 74x2953 (TRANSCEIVER_OCTAL_REG_INV, inverting, registered)');

console.log('  G4a: DIR=H, OEABn=L → CLK↑ captures A, drives /A onto B');
{
  const { world, chip, wm } = setupChipWithPower('74x2953');
  connectPinToGnd(wm, findPin(chip, 'OEABn'));
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  for (const n of ['A1','A2','A3','A4','A5','A6','A7','A8']) connectPinToVcc(wm, findPin(chip, n));
  const clkLow = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClkHigh(sim, world, chip, wm, clkLow);
  // Inverting: all A=HIGH → all B=LOW
  for (const n of ['B1','B2','B3','B4','B5','B6','B7','B8']) {
    assertLow(sim, chip, n, '74x2953 CLK↑ /A→B');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// G5: Simulator OC pull-up reaches 'bidir' pins
// 74x641 is an OC transceiver. With OEn=H all outputs go Hi-Z; the implicit
// 4.7 kΩ pull-up must drive the bidir pins HIGH, not leave them floating.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG5: Implicit OC pull-up reaches bidir pins on OC transceivers');
{
  assert(CHIPS_BLOCK_34['74x641']?.openCollector === true,
    "74x641 chip def has openCollector: true");
  const { world, chip, wm } = setupChipWithPower('74x641');
  connectPinToVcc(wm, findPin(chip, 'OEn'));   // outputs Hi-Z
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['A1','A2','A3','A4','A5','A6','A7','A8',
                   'B1','B2','B3','B4','B5','B6','B7','B8']) {
    assertHigh(sim, chip, n, '74x641 OC pull-up on bidir');
  }
}

console.log(`\nResults: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
