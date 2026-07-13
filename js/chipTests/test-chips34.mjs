// test-chips34.mjs - Tests for all chips defined in js/chips/chips34.js
// Style matches prior test files: plain Node.js ESM, no framework.
//
// Chips under test:
//   74641   Octal bus transceiver, non inverting, OC
//   74642   Octal bus transceiver, inverting, OC
//   74643   Octal bus transceiver, true/inv, TRI
//   74644   Octal bus transceiver, true/inv, OC
//   74645   Octal bus transceiver, non inverting, TRI
//   74646   Octal transceiver/register, non inverting, TRI (24 pin)
//   74647   Octal transceiver/register, non inverting, OC (24 pin)
//   74648   Octal transceiver/register, inverting, TRI (24 pin)
//   74649   Octal transceiver/register, inverting, OC (24 pin)
//   74651   Octal transceiver/register, inverting, TRI (24 pin)
//   74652   Octal transceiver/register, non inverting, TRI (24 pin)
//   74653   Octal transceiver/register, inverting, TS+OC (24 pin)
//   74654   Octal transceiver/register, non inverting, TS+OC (24 pin)
//   74655   Octal buffer+parity, inverting (stub)
//   74656   Octal buffer+parity, non inverting (stub)
//   74657   Octal transceiver+parity (stub)

import { CHIPS_BLOCK_34 } from '../chips/chips34.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ─────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Shared helpers ────────────────────────────────────────────────────────────
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
  // HiZ: no driver → resolves to 0V or undefined
  const ok = (v === undefined || v === null || v < 2.5);
  assert(ok, `${label}: expected HiZ/low, got ${v}`);
}

/** Place chip at col 10, tile (0,0) and wire VCC + GND. */
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

function connectPinsHigh(wm, chip, pinNames) {
  return pinNames.map(n => connectPinToVcc(wm, findPin(chip, n)));
}

function connectPinsLow(wm, chip, pinNames) {
  return pinNames.map(n => connectPinToGnd(wm, findPin(chip, n)));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x641', '74x642', '74x643', '74x644', '74x645',
  '74x646', '74x647', '74x648', '74x649',
  '74x651', '74x652', '74x653', '74x654',
  '74x655', '74x656', '74x657',
];

const SEQUENTIAL_IDS = [
  '74x646','74x647','74x648','74x649',
  '74x651','74x652','74x653','74x654',
];

console.log('\nS1: All 16 chip IDs present in CHIPS_BLOCK_34');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_34, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_34).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_34 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_34).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_34)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id}: has '${f}'`);
    }
    assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
      `${id}: pinout length === pins (${def.pins})`);
    assert(Array.isArray(def.gates) && def.gates.length > 0,
      `${id}: has at least one gate`);
    assert(def.vcc >= 1 && def.vcc <= def.pins, `${id}: vcc pin in range`);
    assert(def.gnd >= 1 && def.gnd <= def.pins, `${id}: gnd pin in range`);
    assert(def.vcc !== def.gnd, `${id}: vcc != gnd`);
    const vccPin = def.pinout.find(p => p.name === 'VCC');
    const gndPin = def.pinout.find(p => p.name === 'GND');
    assert(vccPin?.pin === def.vcc, `${id}: VCC pin number matches pinout`);
    assert(gndPin?.pin === def.gnd, `${id}: GND pin number matches pinout`);
  }
}

console.log('\nS3: All gate input/output names exist in pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_34)) {
    const pinNames = new Set(def.pinout.map(p => p.name));
    for (const gate of def.gates) {
      const inputs  = Array.isArray(gate.inputs)  ? gate.inputs  : [];
      const outputs = Array.isArray(gate.outputs) ? gate.outputs
                    : gate.output                 ? [gate.output] : [];
      for (const name of [...inputs, ...outputs]) {
        assert(pinNames.has(name), `${id}: gate references '${name}' in pinout`);
      }
    }
  }
}

console.log('\nS4: Sequential chips are marked sequential');
{
  for (const id of SEQUENTIAL_IDS) {
    assert(CHIPS_BLOCK_34[id]?.sequential === true, `${id}: sequential flag set`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// ── G1: 74641 - Octal non inverting transceiver (OC) ─────────────────────────

console.log('\nG1: 74641 - Octal non inverting transceiver (OC)');

console.log('  G1a: OEn=H → outputs HiZ → implicit OC pullup drives them HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74x641');
  connectPinsHigh(wm, chip, ['OEn', 'DIR', 'A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // 74x641 has openCollector: true; HiZ outputs are pulled HIGH via 4.7kΩ implicit pullup.
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinBit(sim, chip, b, 1, `74641 OEn=H → ${b} HIGH (OC pullup)`);
}

console.log('  G1b: OEn=L, DIR=H → A→B (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x641');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['A1','A3','A5','A7']);
  connectPinsLow(wm, chip, ['A2','A4','A6','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'B1', 1, '74641 DIR=H: B1=A1=1');
  assertPinBit(sim, chip, 'B2', 0, '74641 DIR=H: B2=A2=0');
  assertPinBit(sim, chip, 'B3', 1, '74641 DIR=H: B3=A3=1');
  assertPinBit(sim, chip, 'B4', 0, '74641 DIR=H: B4=A4=0');
}

// ── G2: 74642 - Octal inverting transceiver (OC) ─────────────────────────────

console.log('\nG2: 74642 - Octal inverting transceiver (OC)');

console.log('  G2a: OEn=L, DIR=H → A→/B (inverted)');
{
  const { world, chip, wm } = setupChipWithPower('74x642');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinBit(sim, chip, b, 0, `74642 DIR=H: ${b}=NOT A(1)=0`);
}

// ── G3: 74643 - Octal true/inv transceiver (TRI) ─────────────────────────────

console.log('\nG3: 74643 - Octal true/inv transceiver (TRI)');

console.log('  G3a: OEn=H → all outputs HiZ/low');
{
  const { world, chip, wm } = setupChipWithPower('74x643');
  connectPinsHigh(wm, chip, ['OEn', 'DIR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74643 OEn=H → ${b} HiZ`);
}

// ── G4: 74644 - Octal true/inv transceiver (OC) ──────────────────────────────

console.log('\nG4: 74644 - Octal true/inv transceiver (OC)');

console.log('  G4a: OEn=L, DIR=H → A→/B (inverted in A→B direction)');
{
  const { world, chip, wm } = setupChipWithPower('74x644');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsLow(wm, chip, ['A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinBit(sim, chip, b, 1, `74644 DIR=H: ${b}=NOT A(0)=1`);
}

// ── G5: 74645 - Octal non inverting transceiver (TRI) ────────────────────────

console.log('\nG5: 74645 - Octal non inverting transceiver (TRI)');

console.log('  G5a: OEn=L, DIR=L → B→A (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x645');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['B1','B2','B3','B4','B5','B6','B7','B8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const a of ['A1','A2','A3','A4','A5','A6','A7','A8'])
    assertPinBit(sim, chip, a, 1, `74645 DIR=L: ${a}=B=1`);
}

// ── G6: 74646 - Octal transceiver/register, non inverting, TRI (24 pin) ──────
// Data latched on CLK rising edge. OEABn=L enables B output.

console.log('\nG6: 74646 - Octal transceiver/register (non-inv, TRI)');

console.log('  G6a: CLK rising edge captures A→B, OEABn=L enables output');
{
  const { world, chip, wm } = setupChipWithPower('74x646');
  connectPinToGnd(wm, findPin(chip, 'OEABn'));
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinToVcc(wm, findPin(chip, 'CLAB'));
  connectPinToGnd(wm, findPin(chip, 'CLBA'));
  connectPinsHigh(wm, chip, ['A0','A2','A4','A6']);
  connectPinsLow(wm, chip, ['A1','A3','A5','A7']);
  const clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Pulse CLK high to capture
  disconnectWire(wm, clkGnd);
  const clkVcc = connectPinToVcc(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkVcc);
  const clkGnd2 = connectPinToGnd(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'B0', 1, '74646 CLK↑: B0=A0=1');
  assertPinBit(sim, chip, 'B1', 0, '74646 CLK↑: B1=A1=0');
  assertPinBit(sim, chip, 'B2', 1, '74646 CLK↑: B2=A2=1');
  assertPinBit(sim, chip, 'B3', 0, '74646 CLK↑: B3=A3=0');
  disconnectWire(wm, clkGnd2);
}

// ── G7: 74648 - Octal transceiver/register, inverting, TRI (24 pin) ───────────

console.log('\nG7: 74648 - Octal transceiver/register (inv, TRI)');

console.log('  G7a: CLK rising edge captures A, OEABn=L drives /A to B');
{
  const { world, chip, wm } = setupChipWithPower('74x648');
  connectPinToGnd(wm, findPin(chip, 'OEABn'));
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinToVcc(wm, findPin(chip, 'CLAB'));
  connectPinToGnd(wm, findPin(chip, 'CLBA'));
  connectPinsHigh(wm, chip, ['A0','A1','A2','A3','A4','A5','A6','A7']);
  const clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkGnd);
  const clkVcc = connectPinToVcc(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkVcc);
  const clkGnd2 = connectPinToGnd(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  // Inverting: B = NOT A, all A are HIGH → B should be LOW
  for (const b of ['B0','B1','B2','B3','B4','B5','B6','B7'])
    assertPinBit(sim, chip, b, 0, `74648 CLK↑: ${b}=NOT A(1)=0`);
  disconnectWire(wm, clkGnd2);
}

// ── G8: 74652 - Octal transceiver/register, non inverting, TRI (24 pin) ───────

console.log('\nG8: 74652 - Octal transceiver/register (non-inv, TRI)');

console.log('  G8a: CLK rising edge, OEABn=L → B outputs registered A');
{
  const { world, chip, wm } = setupChipWithPower('74x652');
  connectPinToGnd(wm, findPin(chip, 'OEABn'));
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinToVcc(wm, findPin(chip, 'LEAB'));
  connectPinToGnd(wm, findPin(chip, 'LEBA'));
  connectPinsHigh(wm, chip, ['A0','A2','A4','A6']);
  connectPinsLow(wm, chip, ['A1','A3','A5','A7']);
  const clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkGnd);
  const clkVcc = connectPinToVcc(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkVcc);
  const clkGnd2 = connectPinToGnd(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'B0', 1, '74652 CLK↑: B0=A0=1');
  assertPinBit(sim, chip, 'B1', 0, '74652 CLK↑: B1=A1=0');
  disconnectWire(wm, clkGnd2);
}

// ── G9: 74655 - Octal buffer+parity stub (all outputs HiZ) ───────────────────

console.log('\nG9: 74655 - Octal buffer+parity stub');

console.log('  G9a: All outputs HiZ (parity stub)');
{
  const { world, chip, wm } = setupChipWithPower('74x655');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const p of ['YA0','YA1','YB0','YB1','YB2','YB3','YB4','YB5','YB6','YB7','PE'])
    assertPinHighZ(sim, chip, p, `74655: ${p} HiZ`);
}

// ── G10: 74656 - Octal buffer+parity stub ────────────────────────────────────

console.log('\nG10: 74656 - Octal buffer+parity stub');

console.log('  G10a: All outputs HiZ (parity stub)');
{
  const { world, chip, wm } = setupChipWithPower('74x656');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const p of ['YA0','YA1','YB0','YB1','YB2','YB3','YB4','YB5','YB6','YB7','PE'])
    assertPinHighZ(sim, chip, p, `74656: ${p} HiZ`);
}

// ── G11: 74657 - Octal transceiver+parity stub ───────────────────────────────

console.log('\nG11: 74657 - Octal transceiver+parity stub');

console.log('  G11a: PE output HiZ (parity stub); basic transceiver enabled');
{
  const { world, chip, wm } = setupChipWithPower('74x657');
  // OEABn=L, DIR=H → A→B (non inverting)
  connectPinToGnd(wm, findPin(chip, 'OEABn'));
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['A0','A2','A4','A6']);
  connectPinsLow(wm, chip, ['A1','A3','A5','A6','A7']); // override A6 to 0
  // Actually just set all to known state:
  connectPinsHigh(wm, chip, ['A0','A1','A2','A3','A4','A5']);
  connectPinsLow(wm, chip, ['A6','A7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // PE should be HiZ (stub)
  assertPinHighZ(sim, chip, 'PE', '74657: PE HiZ (parity stub)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\nResults: ${pass} passed, ${fail} failed, ${pass + fail} total`);
process.exit(fail > 0 ? 1 : 0);
