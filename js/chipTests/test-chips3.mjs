// test-chips3.mjs - Tests for all chips defined in js/chips/chips3.js
// Style matches test-chips1.mjs and test-chips2.mjs: plain Node.js ESM.

import { CHIPS_BLOCK_3 } from '../chips/chips3.js';
import { BCD_7SEG_TABLE } from '../chips.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else       { fail++; console.error(`  ✗ ${msg}`); }
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

function disconnectWire(wm, wire) {
  if (wire) wm.removeWire(wire.id);
}

function disconnectWires(wm, wires) {
  for (const wire of wires) disconnectWire(wm, wire);
}

function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}

function assertPinBit(sim, chip, pinName, expectedBit, label) {
  const voltage = getPinVoltage(sim, findPin(chip, pinName));
  const ok = expectedBit
    ? (voltage !== undefined && voltage > 2.5)
    : (voltage === undefined || voltage < 2.5);
  assert(ok, `${label} = ${expectedBit ? 'HIGH' : 'LOW'} (got ${voltage})`);
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

function connectPinsHigh(wm, chip, pinNames) {
  return pinNames.map(name => connectPinToVcc(wm, findPin(chip, name)));
}

function setPinsFromValue(wm, chip, pinNames, value) {
  const wires = [];
  for (let i = 0; i < pinNames.length; i++) {
    if (value & (1 << i)) wires.push(connectPinToVcc(wm, findPin(chip, pinNames[i])));
    else wires.push(connectPinToGnd(wm, findPin(chip, pinNames[i])));
  }
  return wires;
}

function readPinsAsValue(sim, chip, pinNames) {
  let value = 0;
  for (let i = 0; i < pinNames.length; i++) {
    const voltage = getPinVoltage(sim, findPin(chip, pinNames[i]));
    if (voltage !== undefined && voltage > 2.5) value |= (1 << i);
  }
  return value;
}

function pulseClock(sim, world, chip, wm, clockPinName) {
  const clkWire = connectPinToVcc(wm, findPin(chip, clockPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkWire);
  const gndWire = connectPinToGnd(wm, findPin(chip, clockPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, gndWire);
}

function expectedHoleForPin(pinCount, pinNumber, baseCol = 10) {
  const half = pinCount / 2;
  const row = pinNumber <= half ? 5 : 4;
  const col = pinNumber <= half
    ? baseCol + (pinNumber - 1)
    : baseCol + (pinCount - pinNumber);
  return holeId(0, 0, 'main', col, row);
}

function testAOI2WideGate(chipId, inputPins, outputPin) {
  for (let bits = 0; bits < 16; bits++) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    setPinsFromValue(wm, chip, inputPins, bits);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);

    const a1 = bits & 1 ? 1 : 0;
    const a2 = bits & 2 ? 1 : 0;
    const b1 = bits & 4 ? 1 : 0;
    const b2 = bits & 8 ? 1 : 0;
    const expectedBit = ((a1 & a2) | (b1 & b2)) ? 0 : 1;
    assertPinBit(sim, chip, outputPin, expectedBit, `${chipId} ${outputPin} inputs=${bits.toString(2).padStart(4, '0')}`);
  }
}

function testAOI4WideGate(chipId, inputPins, outputPin) {
  const cases = [
    { bits: 0b00000000, expected: 1, label: 'no input pair asserted' },
    { bits: 0b00000011, expected: 0, label: 'A pair asserted' },
    { bits: 0b10101010, expected: 1, label: 'partial pairs do not trigger' },
    { bits: 0b00110000, expected: 0, label: 'C pair asserted' },
    { bits: 0b11111111, expected: 0, label: 'all pairs asserted' },
  ];

  for (const tc of cases) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    setPinsFromValue(wm, chip, inputPins, tc.bits);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, outputPin, tc.expected, `${chipId} ${tc.label}`);
  }
}

function testAndGatedJKChip(chipId) {
  console.log(`  ${chipId}a: async clear dominates`);
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectPinToVcc(wm, findPin(chip, 'PRE'));
    connectPinToGnd(wm, findPin(chip, 'CLR'));   // CLR=LOW (active)
    connectPinsHigh(wm, chip, ['1J', '2J', '3J']);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'Q', 0, `${chipId} CLR active drives Q low`);
    assertPinBit(sim, chip, 'Qn', 1, `${chipId} CLR active drives Qn high`);
  }

  console.log(`  ${chipId}b: rising edge sets when all J inputs are high`);
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectPinsHigh(wm, chip, ['PRE', 'CLR', '1J', '2J', '3J']);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    pulseClock(sim, world, chip, wm, 'CLK');
    assertPinBit(sim, chip, 'Q', 1, `${chipId} set on rising edge`);
    assertPinBit(sim, chip, 'Qn', 0, `${chipId} complement after set`);
  }

  console.log(`  ${chipId}c: missing one J input prevents a set`);
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectPinsHigh(wm, chip, ['PRE', 'CLR', '1J', '2J']);
    connectPinToGnd(wm, findPin(chip, '3J'));   // 3J=LOW (missing)
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    pulseClock(sim, world, chip, wm, 'CLK');
    assertPinBit(sim, chip, 'Q', 0, `${chipId} J inputs are AND gated`);
  }

  console.log(`  ${chipId}d: J=K=1 toggles on successive edges`);
  {
    const { world, chip, wm } = setupChipWithPower(chipId);
    connectPinsHigh(wm, chip, ['PRE', 'CLR', '1J', '2J', '3J', '1K', '2K', '3K']);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    pulseClock(sim, world, chip, wm, 'CLK');
    assertPinBit(sim, chip, 'Q', 1, `${chipId} first toggle sets Q`);
    pulseClock(sim, world, chip, wm, 'CLK');
    assertPinBit(sim, chip, 'Q', 0, `${chipId} second toggle clears Q`);
  }
}

function testAdderCase(a, b, c0, label) {
  const { world, chip, wm } = setupChipWithPower('74x83');
  setPinsFromValue(wm, chip, ['A1', 'A2', 'A3', 'A4'], a);
  setPinsFromValue(wm, chip, ['B1', 'B2', 'B3', 'B4'], b);
  if (c0) connectPinToVcc(wm, findPin(chip, 'C0'));
  else connectPinToGnd(wm, findPin(chip, 'C0'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const total = a + b + c0;
  const sum = total & 0xF;
  const carry = (total >> 4) & 1;
  assert(readPinsAsValue(sim, chip, ['S1', 'S2', 'S3', 'S4']) === sum,
    `7483 ${label} sum=${sum} (got ${readPinsAsValue(sim, chip, ['S1', 'S2', 'S3', 'S4'])})`);
  assertPinBit(sim, chip, 'C4', carry, `7483 ${label} carry`);
}

const EXPECTED_CHIP_IDS = [
  '74x46', '74x51', '74x54', '74x70', '74x72', '74x73',
  '74x75', '74x76', '74x83', '74x85', '74x89',
];

const SEQUENTIAL_CHIP_IDS = ['74x70', '74x72', '74x73', '74x75', '74x76', '74x89'];

console.log('\nS1: All 11 chip IDs present in CHIPS_BLOCK_3');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_3, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_3).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_3 contains exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_3).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED_FIELDS = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_3)) {
    for (const field of REQUIRED_FIELDS) {
      assert(field in def, `${id}: has '${field}' field`);
    }
    assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
      `${id}: pinout length === pin count (${def.pins})`);
    assert(Array.isArray(def.gates) && def.gates.length > 0,
      `${id}: has at least one gate`);
    assert(def.vcc >= 1 && def.vcc <= def.pins,
      `${id}: vcc pin ${def.vcc} in range [1,${def.pins}]`);
    assert(def.gnd >= 1 && def.gnd <= def.pins,
      `${id}: gnd pin ${def.gnd} in range [1,${def.pins}]`);
    assert(def.vcc !== def.gnd,
      `${id}: vcc (${def.vcc}) != gnd (${def.gnd})`);

    const vccPin = def.pinout.find(pin => pin.name === 'VCC');
    const gndPin = def.pinout.find(pin => pin.name === 'GND');
    assert(vccPin?.pin === def.vcc,
      `${id}: vcc metadata matches VCC pinout entry (${def.vcc})`);
    assert(gndPin?.pin === def.gnd,
      `${id}: gnd metadata matches GND pinout entry (${def.gnd})`);
  }
}

console.log('\nS3: All gate input/output names exist in chip pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_3)) {
    const pinNames = new Set(def.pinout.map(p => p.name));
    for (const gate of def.gates) {
      const inputs = Array.isArray(gate.inputs) ? gate.inputs : [];
      const outputs = Array.isArray(gate.outputs) ? gate.outputs
        : gate.output ? [gate.output] : [];
      for (const name of [...inputs, ...outputs]) {
        assert(pinNames.has(name), `${id}: gate references pin '${name}' which exists in pinout`);
      }
    }
  }
}

console.log('\nS4: Sequential chips are marked sequential');
{
  for (const chipId of SEQUENTIAL_CHIP_IDS) {
    assert(CHIPS_BLOCK_3[chipId].sequential === true, `${chipId}: sequential flag set`);
  }
}

console.log('\nG1: 7446 - BCD to 7 segment decoder (representative digits)');
{
  const digits = [0, 2, 9];
  const segNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  for (const digit of digits) {
    const { world, chip, wm } = setupChipWithPower('74x46');
    setPinsFromValue(wm, chip, ['A', 'B', 'C', 'D'], digit);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);

    const row = BCD_7SEG_TABLE[digit];
    for (let i = 0; i < segNames.length; i++) {
      assertPinBit(sim, chip, segNames[i], row[4 + i] ? 1 : 0, `7446 digit ${digit} segment ${segNames[i]}`);
    }
  }
}

console.log('\nG2: 7451 - Dual AOI gate');
testAOI2WideGate('74x51', ['1A1', '1A2', '1B1', '1B2'], '1Y');
testAOI2WideGate('74x51', ['2A1', '2A2', '2B1', '2B2'], '2Y');

console.log('\nG3: 7454 - 4-wide AOI gate');
testAOI4WideGate('74x54', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'], 'Y');

console.log('\nG4: 7470 - AND gated JK flip flop');
testAndGatedJKChip('74x70');

console.log('\nG5: 7472 - AND gated JK controller device flip flop (simplified behavior)');
testAndGatedJKChip('74x72');

console.log('\nG6: 7473 - Dual JK flip flop with clear');
console.log('  7473a: clear holds FF1 low when wired to GND');
{
  const { world, chip, wm } = setupChipWithPower('74x73');
  connectPinToVcc(wm, findPin(chip, '1J'));
  connectPinToGnd(wm, findPin(chip, '1CLR'));  // CLR=LOW (active)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 0, '7473 FF1 clear active drives Q low');
  assertPinBit(sim, chip, '1Qn', 1, '7473 FF1 clear active drives Qn high');
}

console.log('  7473b: both flip flops update independently on their own inputs');
{
  const { world, chip, wm } = setupChipWithPower('74x73');
  connectPinsHigh(wm, chip, ['1CLR', '2CLR', '1J', '2J']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const clk1 = connectPinToVcc(wm, findPin(chip, '1CLK'));
  const clk2 = connectPinToVcc(wm, findPin(chip, '2CLK'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clk1);
  disconnectWire(wm, clk2);
  sim.evaluate(world, [chip], wm);

  assertPinBit(sim, chip, '1Q', 1, '7473 FF1 set on rising edge');
  assertPinBit(sim, chip, '2Q', 1, '7473 FF2 set on rising edge');
}

console.log('\nG7: 7475 - 4 bit latch');
console.log('  7475a: enabled latches are transparent');
{
  const { world, chip, wm } = setupChipWithPower('74x75');
  connectPinToVcc(wm, findPin(chip, '1D'));
  connectPinToGnd(wm, findPin(chip, '2D'));    // 2D=LOW explicitly
  connectPinToVcc(wm, findPin(chip, '12E'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 1, '7475 1Q follows 1D when 12E is high');
  assertPinBit(sim, chip, '2Q', 0, '7475 2Q follows low 2D when 12E is high');
}

console.log('  7475b: disabled latches hold their previous value');
{
  const { world, chip, wm } = setupChipWithPower('74x75');
  const d1Wire = connectPinToVcc(wm, findPin(chip, '1D'));
  const enableWire = connectPinToVcc(wm, findPin(chip, '12E'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, enableWire);
  disconnectWire(wm, d1Wire);
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 1, '7475 1Q holds after 12E goes low');
}

console.log('  7475c: 34E controls only the second latch pair');
{
  const { world, chip, wm } = setupChipWithPower('74x75');
  connectPinToVcc(wm, findPin(chip, '1D'));
  connectPinToVcc(wm, findPin(chip, '3D'));
  connectPinToGnd(wm, findPin(chip, '12E'));   // 12E=LOW → latches 1,2 hold
  connectPinToVcc(wm, findPin(chip, '34E'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 0, '7475 1Q ignores 34E');
  assertPinBit(sim, chip, '3Q', 1, '7475 3Q follows 3D when 34E is high');
}

console.log('\nG8: 7476 - Dual JK flip flop with preset and clear');
console.log('  7476a: async preset forces FF1 high');
{
  const { world, chip, wm } = setupChipWithPower('74x76');
  connectPinToVcc(wm, findPin(chip, '1CLR'));
  connectPinToGnd(wm, findPin(chip, '1PRE'));  // PRE=LOW (active)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 1, '7476 PRE active drives 1Q high');
  assertPinBit(sim, chip, '1Qn', 0, '7476 PRE active drives 1Qn low');
}

console.log('  7476b: both flip flops respond independently when controls are disabled');
{
  const { world, chip, wm } = setupChipWithPower('74x76');
  connectPinsHigh(wm, chip, ['1PRE', '1CLR', '2PRE', '2CLR', '1J', '2J']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const clk1 = connectPinToVcc(wm, findPin(chip, '1CLK'));
  const clk2 = connectPinToVcc(wm, findPin(chip, '2CLK'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clk1);
  disconnectWire(wm, clk2);
  sim.evaluate(world, [chip], wm);

  assertPinBit(sim, chip, '1Q', 1, '7476 FF1 set on rising edge');
  assertPinBit(sim, chip, '2Q', 1, '7476 FF2 set on rising edge');
}

console.log('\nG9: 7483 - 4 bit adder');
testAdderCase(0x0, 0x0, 0, '0 + 0 + C0=0');
testAdderCase(0x3, 0x5, 0, '3 + 5 + C0=0');
testAdderCase(0xF, 0x1, 0, '15 + 1 + C0=0');
testAdderCase(0x2, 0x2, 1, '2 + 2 + C0=1');

console.log('\nG10: 7485 - 4 bit comparator');
{
  const cases = [
    { a: 0x9, b: 0x4, cascade: { AGTBIN: 0, AEQBIN: 1, ALTBIN: 0 }, expected: { AGTB: 1, AEQB: 0, ALTB: 0 }, label: 'A > B' },
    { a: 0x4, b: 0x9, cascade: { AGTBIN: 0, AEQBIN: 1, ALTBIN: 0 }, expected: { AGTB: 0, AEQB: 0, ALTB: 1 }, label: 'A < B' },
    { a: 0x6, b: 0x6, cascade: { AGTBIN: 0, AEQBIN: 1, ALTBIN: 0 }, expected: { AGTB: 0, AEQB: 1, ALTB: 0 }, label: 'A = B' },
    { a: 0x6, b: 0x6, cascade: { AGTBIN: 1, AEQBIN: 0, ALTBIN: 0 }, expected: { AGTB: 1, AEQB: 0, ALTB: 0 }, label: 'A = B with AGTBIN tie-break' },
  ];

  for (const tc of cases) {
    const { world, chip, wm } = setupChipWithPower('74x85');
    setPinsFromValue(wm, chip, ['A0', 'A1', 'A2', 'A3'], tc.a);
    setPinsFromValue(wm, chip, ['B0', 'B1', 'B2', 'B3'], tc.b);
    for (const [pinName, bit] of Object.entries(tc.cascade)) {
      if (bit) connectPinToVcc(wm, findPin(chip, pinName));
      else     connectPinToGnd(wm, findPin(chip, pinName));
    }
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'AGTB', tc.expected.AGTB, `7485 ${tc.label} AGTB`);
    assertPinBit(sim, chip, 'AEQB', tc.expected.AEQB, `7485 ${tc.label} AEQB`);
    assertPinBit(sim, chip, 'ALTB', tc.expected.ALTB, `7485 ${tc.label} ALTB`);
  }
}

console.log('\nG11: 7489 - 16x4 RAM');
console.log('  7489a: write then read back the stored word');
{
  const { world, chip, wm } = setupChipWithPower('74x89');
  let addressWires = setPinsFromValue(wm, chip, ['A0', 'A1', 'A2', 'A3'], 0x3);
  let dataWires = setPinsFromValue(wm, chip, ['D1', 'D2', 'D3', 'D4'], 0xA);
  const sim = new CircuitSimulator();

  // Write: ME=HIGH, WE=HIGH
  const meWrite = connectPinToVcc(wm, findPin(chip, 'ME'));
  const weWrite = connectPinToVcc(wm, findPin(chip, 'WE'));
  sim.evaluate(world, [chip], wm);
  // Switch to read: ME=LOW, WE=LOW
  disconnectWire(wm, meWrite);
  disconnectWire(wm, weWrite);
  const meRead = connectPinToGnd(wm, findPin(chip, 'ME'));
  const weRead = connectPinToGnd(wm, findPin(chip, 'WE'));
  sim.evaluate(world, [chip], wm);
  assert(readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4']) === 0xA,
    `7489 readback returns 0xA (got ${readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4'])})`);

  console.log('  7489b: separate addresses keep separate values');
  // Switch back to write mode for second address
  disconnectWire(wm, meRead);
  disconnectWire(wm, weRead);
  disconnectWires(wm, addressWires);
  disconnectWires(wm, dataWires);
  addressWires = setPinsFromValue(wm, chip, ['A0', 'A1', 'A2', 'A3'], 0x4);
  dataWires = setPinsFromValue(wm, chip, ['D1', 'D2', 'D3', 'D4'], 0x5);
  const meWrite2 = connectPinToVcc(wm, findPin(chip, 'ME'));
  const weWrite2 = connectPinToVcc(wm, findPin(chip, 'WE'));
  sim.evaluate(world, [chip], wm);
  // Switch to read
  disconnectWire(wm, meWrite2);
  disconnectWire(wm, weWrite2);
  const meRead2 = connectPinToGnd(wm, findPin(chip, 'ME'));
  const weRead2 = connectPinToGnd(wm, findPin(chip, 'WE'));
  sim.evaluate(world, [chip], wm);
  assert(readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4']) === 0x5,
    `7489 address 0x4 returns 0x5 (got ${readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4'])})`);

  disconnectWires(wm, addressWires);
  addressWires = setPinsFromValue(wm, chip, ['A0', 'A1', 'A2', 'A3'], 0x3);
  sim.evaluate(world, [chip], wm);
  assert(readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4']) === 0xA,
    `7489 original address 0x3 still returns 0xA (got ${readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4'])})`);

  console.log('  7489c: disabled mode drives outputs low');
  disconnectWire(wm, meRead2);
  disconnectWire(wm, weRead2);
  const disableWire = connectPinToVcc(wm, findPin(chip, 'ME'));
  sim.evaluate(world, [chip], wm);
  assert(readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4']) === 0,
    `7489 disabled mode drives 0x0 (got ${readPinsAsValue(sim, chip, ['O1', 'O2', 'O3', 'O4'])})`);
  disconnectWire(wm, disableWire);
}

console.log('\nP1: All 11 chips place successfully');
{
  for (const chipId of EXPECTED_CHIP_IDS) {
    const chip = new ChipComponent(chipId);
    chip.place(0, 0, 10, 4);
    assert(chip.placed === true, `${chipId}: placed === true after place()`);
    assert(chip.pins.length > 0, `${chipId}: has pin objects after place()`);
  }
}

console.log('\nP2: colSpan === pins/2 for all chips');
{
  for (const chipId of EXPECTED_CHIP_IDS) {
    const chip = new ChipComponent(chipId);
    chip.place(0, 0, 10, 4);
    assert(chip.colSpan === chip.chipDef.pins / 2,
      `${chipId}: colSpan = ${chip.chipDef.pins / 2} (got ${chip.colSpan})`);
  }
}

console.log('\nP3: VCC and GND pins map to the correct breadboard holes');
{
  for (const chipId of EXPECTED_CHIP_IDS) {
    const chip = new ChipComponent(chipId);
    chip.place(0, 0, 10, 4);
    const vccPin = findPin(chip, 'VCC');
    const gndPin = findPin(chip, 'GND');
    const expectedVccHole = expectedHoleForPin(chip.chipDef.pins, chip.chipDef.vcc);
    const expectedGndHole = expectedHoleForPin(chip.chipDef.pins, chip.chipDef.gnd);
    assert(vccPin.holeId === expectedVccHole,
      `${chipId} VCC at ${expectedVccHole} (got ${vccPin.holeId})`);
    assert(gndPin.holeId === expectedGndHole,
      `${chipId} GND at ${expectedGndHole} (got ${gndPin.holeId})`);
  }
}

console.log('\nResults');
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error('SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED');
}