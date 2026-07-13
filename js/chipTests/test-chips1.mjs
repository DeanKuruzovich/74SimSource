// test-chips1.mjs - Tests for all chips defined in js/chips/chips1.js
// Style matches test-simulator.mjs: plain Node.js ESM, no test framework.
// Covers structure validation AND gate logic simulation for all 22 chips.

import { CHIPS_BLOCK_1 } from '../chips/chips1.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent, SevenSegComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Shared helpers (same API as test-simulator.mjs) ──────────────────────────
function findPin(comp, name) {
  return typeof comp.getPinByName === 'function'
    ? comp.getPinByName(name)
    : comp.pins.find(p => p.name === name);
}

function wirePinToVcc(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId);
}

function wirePinToGnd(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId);
}

function wirePins(wm, fromPin, toPin) {
  wm.addWire(fromPin.holeId, toPin.holeId);
}

function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}

/** Place chip at col 10, tile (0,0) and wire VCC + GND. */
function setupChipWithPower(chipId) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(chipId);
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  wirePinToVcc(wm, findPin(chip, 'VCC'));
  wirePinToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

// ── Gate-logic helpers ───────────────────────────────────────────────────────

/**
 * Test a 2 input gate against its full 4-row truth table.
 * expected values are 5 (HIGH) or 0 (LOW).
 */
function test2InputGate(chipId, inA, inB, outPin, gateType) {
  const tables = {
    NAND: [[0,0,5],[0,1,5],[1,0,5],[1,1,0]],
    NOR:  [[0,0,5],[0,1,0],[1,0,0],[1,1,0]],
    AND:  [[0,0,0],[0,1,0],[1,0,0],[1,1,5]],
    OR:   [[0,0,0],[0,1,5],[1,0,5],[1,1,5]],
    XOR:  [[0,0,0],[0,1,5],[1,0,5],[1,1,0]],
    XNOR: [[0,0,5],[0,1,0],[1,0,0],[1,1,5]],
  };
  for (const [a, b, expected] of tables[gateType]) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    if (a) wirePinToVcc(wm, findPin(chip, inA));
    else   wirePinToGnd(wm, findPin(chip, inA));
    if (b) wirePinToVcc(wm, findPin(chip, inB));
    else   wirePinToGnd(wm, findPin(chip, inB));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    const vOut = getPinVoltage(sim, findPin(chip, outPin));
    const ok = expected === 0 ? (vOut !== undefined && vOut < 2.5) : (vOut !== undefined && vOut > 2.5);
    assert(ok,
      `${chipId} ${gateType}(${a},${b}) → ${expected}V (got ${vOut})`);
  }
}

/**
 * Test a single-input gate (NOT / BUFFER) for both input states.
 */
function testSingleInputGate(chipId, inPin, outPin, gateType) {
  // With TTL pull ups: floating input reads HIGH
  // NOT(float=HIGH) → LOW, BUFFER(float=HIGH) → HIGH
  const floatExpected = gateType === 'NOT' ? 0 : 5;
  const vccExpected   = gateType === 'NOT' ? 0 : 5;

  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower(chipId);
  const sim1 = new CircuitSimulator();
  sim1.evaluate(w1, [c1], wm1);
  const v1 = getPinVoltage(sim1, findPin(c1, outPin));
  const ok1 = floatExpected === 0 ? (v1 === undefined || v1 < 2.5) : (v1 !== undefined && v1 > 2.5);
  assert(ok1,
    `${chipId} ${gateType}(float=HIGH) → ${floatExpected}V (got ${v1})`);

  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower(chipId);
  wirePinToVcc(wm2, findPin(c2, inPin));
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  const v2 = getPinVoltage(sim2, findPin(c2, outPin));
  const ok2 = vccExpected === 0 ? (v2 !== undefined && v2 < 2.5) : (v2 !== undefined && v2 > 2.5);
  assert(ok2,
    `${chipId} ${gateType}(1) → ${vccExpected}V (got ${v2})`);

  // Also test explicit LOW input
  const gndExpected = gateType === 'NOT' ? 5 : 0;
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower(chipId);
  wirePinToGnd(wm3, findPin(c3, inPin));
  const sim3 = new CircuitSimulator();
  sim3.evaluate(w3, [c3], wm3);
  const v3 = getPinVoltage(sim3, findPin(c3, outPin));
  const ok3 = gndExpected === 0 ? (v3 !== undefined && v3 < 2.5) : (v3 !== undefined && v3 > 2.5);
  assert(ok3,
    `${chipId} ${gateType}(0) → ${gndExpected}V (got ${v3})`);
}

/**
 * Test a 3 input gate with 3 key cases.
 * gateType: 'NAND' or 'AND'
 */
function test3InputGate(chipId, inA, inB, inC, outPin, gateType) {
  const cases = gateType === 'NAND'
    ? [[0,0,0,5,'NAND(0,0,0)=1'],[1,0,1,5,'NAND(1,0,1)=1'],[1,1,1,0,'NAND(1,1,1)=0']]
    : [[0,0,0,0,'AND(0,0,0)=0'], [1,0,1,0,'AND(1,0,1)=0'], [1,1,1,5,'AND(1,1,1)=1']];
  for (const [a, b, c, expected, label] of cases) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    if (a) wirePinToVcc(wm, findPin(chip, inA));
    else   wirePinToGnd(wm, findPin(chip, inA));
    if (b) wirePinToVcc(wm, findPin(chip, inB));
    else   wirePinToGnd(wm, findPin(chip, inB));
    if (c) wirePinToVcc(wm, findPin(chip, inC));
    else   wirePinToGnd(wm, findPin(chip, inC));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    const vOut = getPinVoltage(sim, findPin(chip, outPin));
    const ok = expected === 0 ? (vOut !== undefined && vOut < 2.5) : (vOut !== undefined && vOut > 2.5);
    assert(ok, `${chipId} ${label} (got ${vOut})`);
  }
}

/**
 * Test a 4 input gate with 3 key cases.
 * gateType: 'NAND' or 'AND'
 */
function test4InputGate(chipId, ins, outPin, gateType) {
  const [inA, inB, inC, inD] = ins;
  const cases = gateType === 'NAND'
    ? [[0,0,0,0,5,'NAND(0,0,0,0)=1'],[1,1,1,0,5,'NAND(1,1,1,0)=1'],[1,1,1,1,0,'NAND(1,1,1,1)=0']]
    : [[0,0,0,0,0,'AND(0,0,0,0)=0'], [1,1,1,0,0,'AND(1,1,1,0)=0'],  [1,1,1,1,5,'AND(1,1,1,1)=1']];
  for (const [a, b, c, d, expected, label] of cases) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    if (a) wirePinToVcc(wm, findPin(chip, inA));
    else   wirePinToGnd(wm, findPin(chip, inA));
    if (b) wirePinToVcc(wm, findPin(chip, inB));
    else   wirePinToGnd(wm, findPin(chip, inB));
    if (c) wirePinToVcc(wm, findPin(chip, inC));
    else   wirePinToGnd(wm, findPin(chip, inC));
    if (d) wirePinToVcc(wm, findPin(chip, inD));
    else   wirePinToGnd(wm, findPin(chip, inD));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    const vOut = getPinVoltage(sim, findPin(chip, outPin));
    const ok = expected === 0 ? (vOut !== undefined && vOut < 2.5) : (vOut !== undefined && vOut > 2.5);
    assert(ok, `${chipId} ${label} (got ${vOut})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure & Definition Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x00','74x01','74x02','74x03','74x04','74x05','74x06','74x07',
  '74x08','74x09','74x10','74x11','74x12','74x13','74x14',
  '74x20','74x32','74x47','74x48','74x74','74x86','74x266',
];

console.log('\nS1: All 22 chip IDs present in CHIPS_BLOCK_1');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_1, `  Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_1).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_1 contains exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_1).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED_FIELDS = ['name','simpleName','description','pins','vcc','gnd','pinout','gates','tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_1)) {
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
      `${id}: vcc (${def.vcc}) ≠ gnd (${def.gnd})`);
  }
}

console.log('\nS3: All gate input/output names exist in chip pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_1)) {
    const pinNames = new Set(def.pinout.map(p => p.name));
    for (const gate of def.gates) {
      const inputs  = Array.isArray(gate.inputs)  ? gate.inputs  : [];
      const outputs = Array.isArray(gate.outputs) ? gate.outputs
                    : gate.output                 ? [gate.output] : [];
      for (const name of [...inputs, ...outputs]) {
        assert(pinNames.has(name),
          `${id}: gate references pin '${name}' which exists in pinout`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests (one section per chip)
// ─────────────────────────────────────────────────────────────────────────────

// ── G1: 7400 Quad 2 input NAND ───────────────────────────────────────────────
console.log('\nG1: 7400 - Quad 2 input NAND (full truth table, gate 1)');
test2InputGate('74x00', '1A', '1B', '1Y', 'NAND');

// ── G2: 7401 Quad 2 input NAND (open collector) ──────────────────────────────
console.log('\nG2: 7401 - Quad 2 input NAND OC (full truth table, gate 1)');
test2InputGate('74x01', '1A', '1B', '1Y', 'NAND');

// ── G3: 7402 Quad 2 input NOR ────────────────────────────────────────────────
console.log('\nG3: 7402 - Quad 2 input NOR (full truth table, gate 1)');
test2InputGate('74x02', '1A', '1B', '1Y', 'NOR');

// ── G4: 7403 Quad 2 input NAND (open collector) ──────────────────────────────
console.log('\nG4: 7403 - Quad 2 input NAND OC (full truth table, gate 1)');
test2InputGate('74x03', '1A', '1B', '1Y', 'NAND');

// ── G5: 7404 Hex NOT ─────────────────────────────────────────────────────────
console.log('\nG5: 7404 - Hex NOT (all 6 gates, 2 cases each)');
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    testSingleInputGate('74x04', inp, out, 'NOT');
  }
}

// ── G6: 7405 Hex NOT (open collector) ────────────────────────────────────────
console.log('\nG6: 7405 - Hex NOT OC (gate 1 both cases + gate 6 spot-check)');
testSingleInputGate('74x05', '1A', '1Y', 'NOT');
testSingleInputGate('74x05', '6A', '6Y', 'NOT');

// ── G7: 7406 Hex NOT (open collector, high voltage) ──────────────────────────
console.log('\nG7: 7406 - Hex NOT OC HV (gate 1 both cases + gate 6 spot-check)');
testSingleInputGate('74x06', '1A', '1Y', 'NOT');
testSingleInputGate('74x06', '6A', '6Y', 'NOT');

// ── G8: 7407 Hex Buffer (open collector, high voltage) ───────────────────────
console.log('\nG8: 7407 - Hex BUFFER OC HV (all 6 gates, 2 cases each)');
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    testSingleInputGate('74x07', inp, out, 'BUFFER');
  }
}

// ── G9: 7408 Quad 2 input AND ────────────────────────────────────────────────
console.log('\nG9: 7408 - Quad 2 input AND (full truth table, gate 1)');
test2InputGate('74x08', '1A', '1B', '1Y', 'AND');

// ── G10: 7409 Quad 2 input AND (open collector) ──────────────────────────────
console.log('\nG10: 7409 - Quad 2 input AND OC (full truth table, gate 1)');
test2InputGate('74x09', '1A', '1B', '1Y', 'AND');

// ── G11: 7410 Triple 3 input NAND ────────────────────────────────────────────
console.log('\nG11: 7410 - Triple 3 input NAND (key cases, gates 1 and 2)');
test3InputGate('74x10', '1A', '1B', '1C', '1Y', 'NAND');
test3InputGate('74x10', '2A', '2B', '2C', '2Y', 'NAND');

// ── G12: 7411 Triple 3 input AND ─────────────────────────────────────────────
console.log('\nG12: 7411 - Triple 3 input AND (key cases, gates 1 and 2)');
test3InputGate('74x11', '1A', '1B', '1C', '1Y', 'AND');
test3InputGate('74x11', '2A', '2B', '2C', '2Y', 'AND');

// ── G13: 7412 Triple 3 input NAND (open collector) ───────────────────────────
console.log('\nG13: 7412 - Triple 3 input NAND OC (key cases, gate 1)');
test3InputGate('74x12', '1A', '1B', '1C', '1Y', 'NAND');

// ── G14: 7413 Dual 4 input NAND (Schmitt trigger) ────────────────────────────
console.log('\nG14: 7413 - Dual 4 input NAND (Schmitt) (key cases, gates 1 and 2)');
test4InputGate('74x13', ['1A','1B','1C','1D'], '1Y', 'NAND');
test4InputGate('74x13', ['2A','2B','2C','2D'], '2Y', 'NAND');

// ── G15: 7414 Hex Schmitt trigger NOT ────────────────────────────────────────
console.log('\nG15: 7414 - Hex NOT Schmitt (gate 1 both cases + gate 6 spot-check)');
testSingleInputGate('74x14', '1A', '1Y', 'NOT');
testSingleInputGate('74x14', '6A', '6Y', 'NOT');

// ── G16: 7420 Dual 4 input NAND ──────────────────────────────────────────────
console.log('\nG16: 7420 - Dual 4 input NAND (key cases, gates 1 and 2)');
test4InputGate('74x20', ['1A','1B','1C','1D'], '1Y', 'NAND');
test4InputGate('74x20', ['2A','2B','2C','2D'], '2Y', 'NAND');

// ── G17: 7432 Quad 2 input OR ────────────────────────────────────────────────
console.log('\nG17: 7432 - Quad 2 input OR (full truth table, gate 1)');
test2InputGate('74x32', '1A', '1B', '1Y', 'OR');

// ── G18: 7447 BCD to 7 segment (common anode) ────────────────────────────────
console.log('\nG18: 7447 - BCD to 7-seg (common anode display)');
{
  // Digit 0 (A=B=C=D=0, all floating): a f ON (0V active low → seg lit), g OFF (5V)
  // Digit 8 (D=1, A=B=C=0 floating):   all segments ON (all 0V)
  const digitCases = [
    { value: 0, on: ['a','b','c','d','e','f'], off: ['g'],
      label: 'digit 0: a f lit, g dark' },
    { value: 8, on: ['a','b','c','d','e','f','g'], off: [],
      label: 'digit 8: all segments lit' },
  ];

  for (const tc of digitCases) {
    const { world, chip, wm } = setupChipWithPower('74x47');

    // Common-anode display - COM connected to VCC
    const display = new SevenSegComponent(true, 'CA-7SEG');
    display.place(0, 0, 30, 2);
    wirePinToVcc(wm, findPin(display, 'COM1'));
    wirePinToVcc(wm, findPin(display, 'COM2'));

    // Wire chip segment outputs → display segment inputs
    for (const seg of ['a','b','c','d','e','f','g']) {
      wirePins(wm, findPin(chip, seg), findPin(display, seg));
    }

    // Set BCD inputs (wire bits that are 1 to VCC, bits that are 0 to GND)
    if (tc.value & 1) wirePinToVcc(wm, findPin(chip, 'A')); else wirePinToGnd(wm, findPin(chip, 'A'));
    if (tc.value & 2) wirePinToVcc(wm, findPin(chip, 'B')); else wirePinToGnd(wm, findPin(chip, 'B'));
    if (tc.value & 4) wirePinToVcc(wm, findPin(chip, 'C')); else wirePinToGnd(wm, findPin(chip, 'C'));
    if (tc.value & 8) wirePinToVcc(wm, findPin(chip, 'D')); else wirePinToGnd(wm, findPin(chip, 'D'));

    // Also wire LT, BI/RBO, RBI HIGH to disable blanking (active low control)
    wirePinToVcc(wm, findPin(chip, 'LT'));
    wirePinToVcc(wm, findPin(chip, 'BI/RBO'));
    wirePinToVcc(wm, findPin(chip, 'RBI'));

    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip, display], wm);

    for (const seg of tc.on) {
      assert(display.segments[seg] === 1,
        `7447 ${tc.label}: segment '${seg}' is ON (got ${display.segments[seg]})`);
    }
    for (const seg of tc.off) {
      assert(display.segments[seg] === 0,
        `7447 ${tc.label}: segment '${seg}' is OFF (got ${display.segments[seg]})`);
    }
  }
}

// ── G19: 7448 BCD to 7 segment (common cathode) ──────────────────────────────
console.log('\nG19: 7448 - BCD to 7-seg (common cathode display)');
{
  // Digit 0: a f ON (5V active high), g OFF (0V)
  // Digit 1 (A=1): only b and c ON
  const digitCases = [
    { value: 0, on: ['a','b','c','d','e','f'], off: ['g'],
      label: 'digit 0: a f lit, g dark' },
    { value: 1, on: ['b','c'], off: ['a','d','e','f','g'],
      label: 'digit 1: only b,c lit' },
  ];

  for (const tc of digitCases) {
    const { world, chip, wm } = setupChipWithPower('74x48');

    // Common-cathode display - COM connected to GND
    const display = new SevenSegComponent(false, 'CC-7SEG');
    display.place(0, 0, 30, 2);
    wirePinToGnd(wm, findPin(display, 'COM1'));
    wirePinToGnd(wm, findPin(display, 'COM2'));

    // Wire chip segment outputs → display segment inputs
    for (const seg of ['a','b','c','d','e','f','g']) {
      wirePins(wm, findPin(chip, seg), findPin(display, seg));
    }

    // Set BCD inputs (wire bits that are 1 to VCC, bits that are 0 to GND)
    if (tc.value & 1) wirePinToVcc(wm, findPin(chip, 'A')); else wirePinToGnd(wm, findPin(chip, 'A'));
    if (tc.value & 2) wirePinToVcc(wm, findPin(chip, 'B')); else wirePinToGnd(wm, findPin(chip, 'B'));
    if (tc.value & 4) wirePinToVcc(wm, findPin(chip, 'C')); else wirePinToGnd(wm, findPin(chip, 'C'));
    if (tc.value & 8) wirePinToVcc(wm, findPin(chip, 'D')); else wirePinToGnd(wm, findPin(chip, 'D'));

    // Wire LT, BI/RBO, RBI HIGH (active low blanking controls disabled)
    wirePinToVcc(wm, findPin(chip, 'LT'));
    wirePinToVcc(wm, findPin(chip, 'BI/RBO'));
    wirePinToVcc(wm, findPin(chip, 'RBI'));

    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip, display], wm);

    for (const seg of tc.on) {
      assert(display.segments[seg] === 1,
        `7448 ${tc.label}: segment '${seg}' is ON (got ${display.segments[seg]})`);
    }
    for (const seg of tc.off) {
      assert(display.segments[seg] === 0,
        `7448 ${tc.label}: segment '${seg}' is OFF (got ${display.segments[seg]})`);
    }
  }
}

// ── G20: 7474 Dual D Flip Flop ───────────────────────────────────────────────
console.log('\nG20: 7474 - Dual D Flip Flop');

console.log('  G20a: Async CLR (active low) forces Q=0 regardless of D');
{
  // CLR=LOW (wired to GND, active), PRE=HIGH (disabled), D=HIGH
  // Expected: Q≈0V, Qn≈5V
  const { world, chip, wm } = setupChipWithPower('74x74');
  wirePinToVcc(wm, findPin(chip, '1PRE'));  // PRE disabled
  wirePinToVcc(wm, findPin(chip, '1D'));    // D=HIGH (should be ignored)
  wirePinToVcc(wm, findPin(chip, '1CLK')); // CLK high
  wirePinToGnd(wm, findPin(chip, '1CLR')); // CLR=LOW → clear active
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assert(getPinVoltage(sim, findPin(chip, '1Q'))  < 2.5,
    `7474 CLR active: 1Q ≈ 0V (got ${getPinVoltage(sim, findPin(chip, '1Q'))})`);
  assert(getPinVoltage(sim, findPin(chip, '1Qn')) > 2.5,
    `7474 CLR active: 1Qn ≈ 5V (got ${getPinVoltage(sim, findPin(chip, '1Qn'))})`);
}

console.log('  G20b: Async PRE (active low) forces Q=1 regardless of D');
{
  // PRE=LOW (wired to GND, active), CLR=HIGH (disabled), D=LOW
  // Expected: Q≈5V, Qn≈0V
  const { world, chip, wm } = setupChipWithPower('74x74');
  wirePinToVcc(wm, findPin(chip, '1CLR'));  // CLR disabled
  wirePinToGnd(wm, findPin(chip, '1PRE')); // PRE=LOW → preset active
  wirePinToGnd(wm, findPin(chip, '1D'));   // D=LOW
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assert(getPinVoltage(sim, findPin(chip, '1Q'))  > 2.5,
    `7474 PRE active: 1Q ≈ 5V (got ${getPinVoltage(sim, findPin(chip, '1Q'))})`);
  assert(getPinVoltage(sim, findPin(chip, '1Qn')) < 2.5,
    `7474 PRE active: 1Qn ≈ 0V (got ${getPinVoltage(sim, findPin(chip, '1Qn'))})`);
}

console.log('  G20c: Rising clock edge samples D=1 → Q=1');
{
  const { world, chip, wm } = setupChipWithPower('74x74');
  wirePinToVcc(wm, findPin(chip, '1PRE'));
  wirePinToVcc(wm, findPin(chip, '1CLR'));
  wirePinToVcc(wm, findPin(chip, '1D'));    // D=HIGH
  wirePinToVcc(wm, findPin(chip, '1CLK')); // CLK=HIGH → rising edge (prevClk defaults 0)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assert(getPinVoltage(sim, findPin(chip, '1Q'))  > 2.5,
    `7474 rising edge D=1: 1Q ≈ 5V (got ${getPinVoltage(sim, findPin(chip, '1Q'))})`);
  assert(getPinVoltage(sim, findPin(chip, '1Qn')) < 2.5,
    `7474 rising edge D=1: 1Qn ≈ 0V (got ${getPinVoltage(sim, findPin(chip, '1Qn'))})`);
}

console.log('  G20d: Q holds when clock stays HIGH (no further edge)');
{
  const { world, chip, wm } = setupChipWithPower('74x74');
  wirePinToVcc(wm, findPin(chip, '1PRE'));
  wirePinToVcc(wm, findPin(chip, '1CLR'));
  const dWire = wirePinToVcc(wm, findPin(chip, '1D'));
  wirePinToVcc(wm, findPin(chip, '1CLK')); // CLK=HIGH, rising edge → Q=D=1
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Now change D to LOW - Q should still be 1 (no new edge)
  wm.removeWire(dWire.id);
  wirePinToGnd(wm, findPin(chip, '1D'));
  sim.evaluate(world, [chip], wm);
  assert(getPinVoltage(sim, findPin(chip, '1Q')) > 2.5,
    `7474 CLK steady HIGH, D changed: 1Q still ≈ 5V (holds) (got ${getPinVoltage(sim, findPin(chip, '1Q'))})`);
}

console.log('  G20e: Both flip flops are independent');
{
  const { world, chip, wm } = setupChipWithPower('74x74');
  wirePinToVcc(wm, findPin(chip, '1PRE'));
  wirePinToVcc(wm, findPin(chip, '1CLR'));
  wirePinToVcc(wm, findPin(chip, '1D'));
  wirePinToVcc(wm, findPin(chip, '2PRE'));
  wirePinToVcc(wm, findPin(chip, '2CLR'));
  wirePinToGnd(wm, findPin(chip, '2D'));   // D=LOW explicitly
  wirePinToVcc(wm, findPin(chip, '1CLK'));
  wirePinToVcc(wm, findPin(chip, '2CLK'));
  // CLKs=HIGH → rising edge (prevClk=0) → latch D values
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assert(getPinVoltage(sim, findPin(chip, '1Q'))  > 2.5,
    `7474 FF1 D=1 after rising edge: 1Q ≈ 5V (got ${getPinVoltage(sim, findPin(chip, '1Q'))})`);
  assert(getPinVoltage(sim, findPin(chip, '2Q'))  < 2.5,
    `7474 FF2 D=0 after rising edge: 2Q ≈ 0V (got ${getPinVoltage(sim, findPin(chip, '2Q'))})`);
}

// ── G21: 7486 Quad 2 input XOR ───────────────────────────────────────────────
console.log('\nG21: 7486 - Quad 2 input XOR (full truth table, gate 1)');
test2InputGate('74x86', '1A', '1B', '1Y', 'XOR');

// ── G22: 74266 Quad 2 input XNOR ─────────────────────────────────────────────
console.log('\nG22: 74266 - Quad 2 input XNOR (full truth table, gate 1)');
test2InputGate('74x266', '1A', '1B', '1Y', 'XNOR');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION P - Pin Placement & Layout Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nP1: All 22 chips place successfully');
{
  for (const chipId of EXPECTED_CHIP_IDS) {
    const chip = new ChipComponent(chipId);
    chip.place(0, 0, 10, 4);
    assert(chip.placed === true, `${chipId}: placed === true after place()`);
    assert(chip.pins.length > 0,  `${chipId}: has pin objects after place()`);
  }
}

console.log('\nP2: colSpan === pins/2 for all chips');
{
  for (const chipId of EXPECTED_CHIP_IDS) {
    const chip = new ChipComponent(chipId);
    chip.place(0, 0, 10, 4);
    const expected = chip.chipDef.pins / 2;
    assert(chip.colSpan === expected,
      `${chipId}: colSpan = ${expected} (got ${chip.colSpan})`);
  }
}

console.log('\nP3: VCC and GND pins at correct hole IDs (14 pin and 16 pin layouts)');
{
  // 14 pin DIP at col=10: VCC (pin 14) → top row col=10, row=4; GND (pin 7) → bottom col=16, row=5
  for (const chipId of EXPECTED_CHIP_IDS.filter(id => CHIPS_BLOCK_1[id].pins === 14)) {
    const chip = new ChipComponent(chipId);
    chip.place(0, 0, 10, 4);
    const vccPin = findPin(chip, 'VCC');
    const gndPin = findPin(chip, 'GND');
    assert(vccPin.holeId === holeId(0, 0, 'main', 10, 4),
      `${chipId} VCC at col=10 row=4 (got ${vccPin.holeId})`);
    assert(gndPin.holeId === holeId(0, 0, 'main', 16, 5),
      `${chipId} GND at col=16 row=5 (got ${gndPin.holeId})`);
  }

  // 16 pin DIP at col=10: VCC (pin 16) → top row col=10, row=4; GND (pin 8) → bottom col=17, row=5
  for (const chipId of EXPECTED_CHIP_IDS.filter(id => CHIPS_BLOCK_1[id].pins === 16)) {
    const chip = new ChipComponent(chipId);
    chip.place(0, 0, 10, 4);
    const vccPin = findPin(chip, 'VCC');
    const gndPin = findPin(chip, 'GND');
    assert(vccPin.holeId === holeId(0, 0, 'main', 10, 4),
      `${chipId} VCC at col=10 row=4 (got ${vccPin.holeId})`);
    assert(gndPin.holeId === holeId(0, 0, 'main', 17, 5),
      `${chipId} GND at col=17 row=5 (got ${gndPin.holeId})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error('SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED');
}
