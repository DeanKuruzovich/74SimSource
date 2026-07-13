// test-chips33.mjs - Tests for all chips defined in js/chips/chips33.js
// Style matches test-chips1.mjs .. test-chips32.mjs: plain Node.js ESM, no framework.
// Covers structure validation AND gate logic simulation for all chips.
//
// Chips under test:
//   74615   Octal reg bus transceiver, non-inv, OC
//   74620   Octal bus transceiver, inverting, TRI
//   74621   Octal bus transceiver, non inverting, OC
//   74622   Octal bus transceiver, inverting, OC
//   74623   Octal bus transceiver, non inverting, TRI
//   74624   VCO single (analog stub)
//   74625   Dual VCO (analog stub)
//   74626   Dual VCO with enable (analog stub)
//   74627   Dual VCO compact (analog stub)
//   74628   VCO single + ext temp comp (analog stub)
//   74629   Dual VCO with enable+range (analog stub)
//   74636   8 bit ECC, TRI (stub)
//   74637   8 bit ECC, OC (stub)
//   74638   Octal bus transceiver, inverting, TS/OC
//   74639   Octal bus transceiver, non inverting, TS/OC
//   74640   Octal bus transceiver, inverting, TRI

import { CHIPS_BLOCK_33 } from '../chips/chips33.js';
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
  // HiZ: no driver → net resolves to 0V or undefined (no pull up in test harness)
  const ok = (v === undefined || v === null || v < 2.5);
  assert(ok, `${label}: expected HiZ (undefined or low), got ${v}`);
}

function readPinBit(sim, chip, pinName) {
  const v = getPinVoltage(sim, findPin(chip, pinName));
  return (v !== undefined && v > 2.5) ? 1 : 0;
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
// SECTION S - Structure & Definition Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x615',
  '74x620', '74x621', '74x622', '74x623',
  '74x624', '74x625', '74x626', '74x627', '74x628', '74x629',
  '74x636', '74x637',
  '74x638', '74x639', '74x640',
];

const SEQUENTIAL_IDS = ['74x615'];

console.log('\nS1: All 16 chip IDs present in CHIPS_BLOCK_33');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_33, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_33).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_33 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_33).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_33)) {
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
  for (const [id, def] of Object.entries(CHIPS_BLOCK_33)) {
    const pinNames = new Set(def.pinout.map(p => p.name));
    for (const gate of def.gates) {
      const inputs  = Array.isArray(gate.inputs)  ? gate.inputs  : [];
      const outputs = Array.isArray(gate.outputs) ? gate.outputs
                    : gate.output                 ? [gate.output] : [];
      // null entries are positional placeholders (e.g. a VCO channel with no
      // enable or range pin) — same convention as the 74x113's null CLR slot.
      for (const name of [...inputs, ...outputs].filter(n => n != null)) {
        assert(pinNames.has(name), `${id}: gate references '${name}' in pinout`);
      }
    }
  }
}

console.log('\nS4: Sequential chips are marked sequential');
{
  for (const id of SEQUENTIAL_IDS) {
    assert(CHIPS_BLOCK_33[id]?.sequential === true, `${id}: sequential flag set`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// ── G1: 74620 - Octal inverting transceiver (TRI) ────────────────────────────
// OEn=0: enabled; OEn=1: all HiZ.
// DIR=1: A→/B (inverted). DIR=0: B→/A (inverted).

console.log('\nG1: 74620 - Octal inverting transceiver (TRI)');

console.log('  G1a: OEn=H → all outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x620');
  // OEn=H (disabled), DIR=H
  connectPinsHigh(wm, chip, ['OEn', 'DIR']);
  // Set A-side inputs high
  connectPinsHigh(wm, chip, ['A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74620 OEn=H → ${b} HiZ`);
}

console.log('  G1b: OEn=L, DIR=H → A→/B (B=NOT A)');
{
  const { world, chip, wm } = setupChipWithPower('74x620');
  // OEn=L (enabled), DIR=H (A→B direction)
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  // A1,A3,A5,A7 = H; A2,A4,A6,A8 = L
  connectPinsHigh(wm, chip, ['A1','A3','A5','A7']);
  connectPinsLow(wm, chip, ['A2','A4','A6','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // B = NOT A: B1=0,B2=1,B3=0,B4=1,B5=0,B6=1,B7=0,B8=1
  assertPinBit(sim, chip, 'B1', 0, '74620 DIR=H: B1=NOT A1=0');
  assertPinBit(sim, chip, 'B2', 1, '74620 DIR=H: B2=NOT A2=1');
  assertPinBit(sim, chip, 'B3', 0, '74620 DIR=H: B3=NOT A3=0');
  assertPinBit(sim, chip, 'B4', 1, '74620 DIR=H: B4=NOT A4=1');
  assertPinBit(sim, chip, 'B5', 0, '74620 DIR=H: B5=NOT A5=0');
  assertPinBit(sim, chip, 'B6', 1, '74620 DIR=H: B6=NOT A6=1');
  assertPinBit(sim, chip, 'B7', 0, '74620 DIR=H: B7=NOT A7=0');
  assertPinBit(sim, chip, 'B8', 1, '74620 DIR=H: B8=NOT A8=1');
}

console.log('  G1c: OEn=L, DIR=L → B→/A (A=NOT B)');
{
  const { world, chip, wm } = setupChipWithPower('74x620');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'DIR'));
  // B1-B8: all HIGH
  connectPinsHigh(wm, chip, ['B1','B2','B3','B4','B5','B6','B7','B8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // A = NOT B → all 0
  for (const a of ['A1','A2','A3','A4','A5','A6','A7','A8'])
    assertPinBit(sim, chip, a, 0, `74620 DIR=L: ${a}=NOT B=0`);
}

// ── G2: 74621 - Octal non inverting transceiver (OC) ─────────────────────────
// Same function as 74245/74623: non inverting, bidirectional.

console.log('\nG2: 74621 - Octal non inverting transceiver (OC)');

console.log('  G2a: OEn=H → all outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x621');
  connectPinsHigh(wm, chip, ['OEn', 'DIR', 'A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74621 OEn=H → ${b} HiZ`);
}

console.log('  G2b: OEn=L, DIR=H → A→B (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x621');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['A1','A3','A5','A7']);
  connectPinsLow(wm, chip, ['A2','A4','A6','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'B1', 1, '74621 DIR=H: B1=A1=1');
  assertPinBit(sim, chip, 'B2', 0, '74621 DIR=H: B2=A2=0');
  assertPinBit(sim, chip, 'B3', 1, '74621 DIR=H: B3=A3=1');
  assertPinBit(sim, chip, 'B4', 0, '74621 DIR=H: B4=A4=0');
}

console.log('  G2c: OEn=L, DIR=L → B→A (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x621');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['B1','B3','B5','B7']);
  connectPinsLow(wm, chip, ['B2','B4','B6','B8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A1', 1, '74621 DIR=L: A1=B1=1');
  assertPinBit(sim, chip, 'A2', 0, '74621 DIR=L: A2=B2=0');
  assertPinBit(sim, chip, 'A3', 1, '74621 DIR=L: A3=B3=1');
  assertPinBit(sim, chip, 'A4', 0, '74621 DIR=L: A4=B4=0');
}

// ── G3: 74622 - Octal inverting transceiver (OC) ─────────────────────────────
// Same as 74620 behaviour (inverting). OEn=L enabled.

console.log('\nG3: 74622 - Octal inverting transceiver (OC)');

console.log('  G3a: OEn=H → all outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x622');
  connectPinsHigh(wm, chip, ['OEn', 'DIR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74622 OEn=H → ${b} HiZ`);
}

console.log('  G3b: OEn=L, DIR=H → A→/B (inverted)');
{
  const { world, chip, wm } = setupChipWithPower('74x622');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinBit(sim, chip, b, 0, `74622 DIR=H: ${b}=NOT A=0`);
}

// ── G4: 74623 - Octal non inverting transceiver (TRI) ────────────────────────
// Same as 74621 behaviour.

console.log('\nG4: 74623 - Octal non inverting transceiver (TRI)');

console.log('  G4a: OEn=H → all outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x623');
  connectPinsHigh(wm, chip, ['OEn', 'DIR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74623 OEn=H → ${b} HiZ`);
}

console.log('  G4b: OEn=L, DIR=H → A→B (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x623');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinBit(sim, chip, b, 1, `74623 DIR=H: ${b}=A=1`);
}

// ── G5: 74638 - Octal inverting transceiver (TS/OC) ──────────────────────────
// Inverting, same logic as 74620/622.

console.log('\nG5: 74638 - Octal inverting transceiver (TS/OC)');

console.log('  G5a: OEn=H → all outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x638');
  connectPinsHigh(wm, chip, ['OEn', 'DIR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74638 OEn=H → ${b} HiZ`);
}

console.log('  G5b: OEn=L, DIR=H → A→/B (inverted)');
{
  const { world, chip, wm } = setupChipWithPower('74x638');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinsLow(wm, chip, ['A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinBit(sim, chip, b, 1, `74638 DIR=H: ${b}=NOT A(0)=1`);
}

// ── G6: 74639 - Octal non inverting transceiver (TS/OC) ──────────────────────

console.log('\nG6: 74639 - Octal non inverting transceiver (TS/OC)');

console.log('  G6a: OEn=H → all outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x639');
  connectPinsHigh(wm, chip, ['OEn', 'DIR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74639 OEn=H → ${b} HiZ`);
}

console.log('  G6b: OEn=L, DIR=L → B→A (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x639');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['B1','B2','B3','B4','B5','B6','B7','B8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const a of ['A1','A2','A3','A4','A5','A6','A7','A8'])
    assertPinBit(sim, chip, a, 1, `74639 DIR=L: ${a}=B=1`);
}

// ── G7: 74640 - Octal inverting transceiver (TRI) ────────────────────────────

console.log('\nG7: 74640 - Octal inverting transceiver (TRI)');

console.log('  G7a: OEn=H → all outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x640');
  connectPinsHigh(wm, chip, ['OEn', 'DIR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const b of ['B1','B2','B3','B4','B5','B6','B7','B8'])
    assertPinHighZ(sim, chip, b, `74640 OEn=H → ${b} HiZ`);
}

console.log('  G7b: OEn=L, DIR=L → B→/A (inverted)');
{
  const { world, chip, wm } = setupChipWithPower('74x640');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'DIR'));
  connectPinsHigh(wm, chip, ['B1','B2','B3','B4','B5','B6','B7','B8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const a of ['A1','A2','A3','A4','A5','A6','A7','A8'])
    assertPinBit(sim, chip, a, 0, `74640 DIR=L: ${a}=NOT B(1)=0`);
}

// ── G8: 74624 - VCO (behavioral) ─────────────────────────────────────────────
// The VCO family is simulated behaviorally: outputs oscillate from simTime.
// OEn is active LOW; floating (TTL pull-up HIGH) = disabled, OUT held LOW
// with OUTn its complement.

console.log('\nG8: 74624 - VCO behavioral model');

console.log('  G8a: OEn floating (disabled): OUT LOW, OUTn HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74x624');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const vOut  = getPinVoltage(sim, findPin(chip, 'OUT'));
  const vOutn = getPinVoltage(sim, findPin(chip, 'OUTn'));
  assert(vOut !== undefined && vOut < 2.5,   `74624: OEn floating -> OUT LOW (got ${vOut})`);
  assert(vOutn !== undefined && vOutn > 2.5, `74624: OEn floating -> OUTn HIGH (got ${vOutn})`);
}

console.log('  G8b: OEn=0 (enabled): outputs driven and complementary');
{
  const { world, chip, wm } = setupChipWithPower('74x624');
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const vOut  = getPinVoltage(sim, findPin(chip, 'OUT'));
  const vOutn = getPinVoltage(sim, findPin(chip, 'OUTn'));
  assert(vOut !== undefined && vOutn !== undefined, '74624: enabled -> both outputs driven');
  const outBit  = vOut  > 2.5 ? 1 : 0;
  const outnBit = vOutn > 2.5 ? 1 : 0;
  assert(outBit !== outnBit, `74624: OUT/OUTn complementary (got ${vOut} / ${vOutn})`);
}

// ── G9: 74625 - Dual VCO (behavioral, no enable: free-running) ───────────────

console.log('\nG9: 74625 - Dual VCO behavioral model');

console.log('  G9a: Both channels free-running with complementary outputs');
{
  const { world, chip, wm } = setupChipWithPower('74x625');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const [p, pn] of [['OUTA','OUTnA'], ['OUTB','OUTnB']]) {
    const v  = getPinVoltage(sim, findPin(chip, p));
    const vn = getPinVoltage(sim, findPin(chip, pn));
    assert(v !== undefined && vn !== undefined, `74625: ${p}/${pn} driven`);
    assert((v > 2.5) !== (vn > 2.5), `74625: ${p}/${pn} complementary (got ${v} / ${vn})`);
  }
}

// ── G10: 74636 - ECC stub (all outputs HiZ) ───────────────────────────────────

console.log('\nG10: 74636 - 8 bit ECC stub');

console.log('  G10a: All outputs HiZ (ECC too complex to simulate)');
{
  const { world, chip, wm } = setupChipWithPower('74x636');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const p of ['D0','D1','D2','D3','D4','D5','D6','D7','CB0','CB1','CB2','CB3','CB4','CB5','CB6','fE'])
    assertPinHighZ(sim, chip, p, `74636: ${p} HiZ`);
}

// ── G11: 74637 - ECC stub (OC, all outputs HiZ → pulled HIGH by implicit pullup) ─

console.log('\nG11: 74637 - 8 bit ECC stub (OC)');

console.log('  G11a: All outputs HiZ → implicit 4.7kΩ pull-up drives them HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74x637');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // The 74x637 has openCollector: true. A HiZ OC output gets an implicit
  // 4.7kΩ pull-up to VCC, so the net resolves to HIGH (not floating low).
  for (const p of ['D0','D1','D2','D3','D4','D5','D6','D7','CB0','CB1','CB2','CB3','CB4','CB5','CB6','fE'])
    assertPinBit(sim, chip, p, 1, `74637: ${p} pulled HIGH by OC pullup`);
}

// ── G12: 74615 - Octal registered transceiver (TRANSCEIVER_OCTAL_REG) ─────────
// LEAB=H (latch transparent A→B reg), OEABn=L, DIR=H → pass A into reg → drive B.
// This uses the same evaluator as 74543.

console.log('\nG12: 74615 - Octal registered transceiver (basic latch-through)');

console.log('  G12a: DIR=H, CLK rising edge captures A data, then drives B with OEABn=L');
{
  const { world, chip, wm } = setupChipWithPower('74x615');
  // OEABn=L (enable A→B output), OEBAn=H (disable B→A), DIR=H
  connectPinToGnd(wm, findPin(chip, 'OEABn'));
  connectPinToVcc(wm, findPin(chip, 'OEBAn'));
  connectPinToVcc(wm, findPin(chip, 'DIR'));
  connectPinToVcc(wm, findPin(chip, 'LEAB'));
  connectPinToGnd(wm, findPin(chip, 'LEBA'));
  // Set A0,A2,A4,A6 HIGH; A1,A3,A5,A7 LOW
  connectPinsHigh(wm, chip, ['A0','A2','A4','A6']);
  connectPinsLow(wm, chip, ['A1','A3','A5','A7']);
  // Pre-ground CLK before initial eval
  const clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Pulse clock HIGH to capture A into register
  disconnectWire(wm, clkGnd);
  const clkVcc = connectPinToVcc(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  // Return CLK LOW
  disconnectWire(wm, clkVcc);
  const clkGnd2 = connectPinToGnd(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  // B should now reflect registered A data
  assertPinBit(sim, chip, 'B0', 1, '74615 CLK↑: B0=A0=1');
  assertPinBit(sim, chip, 'B1', 0, '74615 CLK↑: B1=A1=0');
  assertPinBit(sim, chip, 'B2', 1, '74615 CLK↑: B2=A2=1');
  assertPinBit(sim, chip, 'B3', 0, '74615 CLK↑: B3=A3=0');
  disconnectWire(wm, clkGnd2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\nResults: ${pass} passed, ${fail} failed, ${pass + fail} total`);
process.exit(fail > 0 ? 1 : 0);
