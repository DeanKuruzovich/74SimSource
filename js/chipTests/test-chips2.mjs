// test-chips2.mjs - Tests for all chips defined in js/chips/chips2.js
// Style matches test-chips1.mjs: plain Node.js ESM, no test framework.
// Covers structure validation AND gate logic simulation for all 13 chips.

import { CHIPS_BLOCK_2 } from '../chips/chips2.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Shared helpers (same API as test-chips1.mjs) ──────────────────────────────
function findPin(comp, name) {
  return typeof comp.getPinByName === 'function'
    ? comp.getPinByName(name)
    : comp.pins.find(p => p.name === name);
}

function wirePinToVcc(wm, pin) {
  wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId);
}

function wirePinToGnd(wm, pin) {
  wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId);
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
 * Expected values are 5 (HIGH) or 0 (LOW).
 */
function test2InputGate(chipId, inA, inB, outPin, gateType) {
  const tables = {
    NAND: [[0,0,5],[0,1,5],[1,0,5],[1,1,0]],
    AND:  [[0,0,0],[0,1,0],[1,0,0],[1,1,5]],
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
 * Test a 3 input gate with key representative cases.
 * gateType: 'AND' | 'NAND' | 'NOR'
 */
function test3InputGate(chipId, inA, inB, inC, outPin, gateType) {
  const caseMap = {
    AND:  [[0,0,0,0,'AND(0,0,0)=0'], [1,0,1,0,'AND(1,0,1)=0'], [1,1,1,5,'AND(1,1,1)=1']],
    NAND: [[0,0,0,5,'NAND(0,0,0)=1'],[1,0,1,5,'NAND(1,0,1)=1'],[1,1,1,0,'NAND(1,1,1)=0']],
    NOR:  [[0,0,0,5,'NOR(0,0,0)=1'], [1,0,0,0,'NOR(1,0,0)=0'], [0,1,0,0,'NOR(0,1,0)=0'], [1,1,1,0,'NOR(1,1,1)=0']],
  };
  for (const [a, b, c, expected, label] of caseMap[gateType]) {
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
 * Test a 4 input gate with key representative cases.
 * gateType: 'AND' | 'NAND' | 'NOR'
 */
function test4InputGate(chipId, ins, outPin, gateType) {
  const [inA, inB, inC, inD] = ins;
  const caseMap = {
    AND:  [[0,0,0,0,0,'AND(0,0,0,0)=0'], [1,1,1,0,0,'AND(1,1,1,0)=0'],  [1,1,1,1,5,'AND(1,1,1,1)=1']],
    NAND: [[0,0,0,0,5,'NAND(0,0,0,0)=1'],[1,1,1,0,5,'NAND(1,1,1,0)=1'],[1,1,1,1,0,'NAND(1,1,1,1)=0']],
    NOR:  [[0,0,0,0,5,'NOR(0,0,0,0)=1'], [1,0,0,0,0,'NOR(1,0,0,0)=0'],  [0,0,1,0,0,'NOR(0,0,1,0)=0'], [1,1,1,1,0,'NOR(1,1,1,1)=0']],
  };
  for (const [a, b, c, d, expected, label] of caseMap[gateType]) {
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

/**
 * Test an 8-input NAND gate with 3 key cases.
 */
function test8InputNAND(chipId, inputNames, outPin) {
  const cases = [
    { bits: [0,0,0,0,0,0,0,0], expected: 5, label: 'NAND(0,0,0,0,0,0,0,0)=1' },
    { bits: [1,1,1,1,0,1,1,1], expected: 5, label: 'NAND(1,1,1,1,0,1,1,1)=1' },
    { bits: [1,1,1,1,1,1,1,1], expected: 0, label: 'NAND(1,1,1,1,1,1,1,1)=0' },
  ];
  for (const tc of cases) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    tc.bits.forEach((bit, i) => {
      if (bit) wirePinToVcc(wm, findPin(chip, inputNames[i]));
      else     wirePinToGnd(wm, findPin(chip, inputNames[i]));
    });
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    const vOut = getPinVoltage(sim, findPin(chip, outPin));
    const ok = tc.expected === 0 ? (vOut !== undefined && vOut < 2.5) : (vOut !== undefined && vOut > 2.5);
    assert(ok, `${chipId} ${tc.label} (got ${vOut})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure & Definition Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x15','74x16','74x17',
  '74x21','74x22','74x25',
  '74x27','74x30','74x37',
  '74x38','74x40','74x42',
  '74x45',
];

console.log('\nS1: All 13 chip IDs present in CHIPS_BLOCK_2');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_2, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_2).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_2 contains exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_2).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED_FIELDS = ['name','simpleName','description','pins','vcc','gnd','pinout','gates','tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_2)) {
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
  for (const [id, def] of Object.entries(CHIPS_BLOCK_2)) {
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

// ── G1: 7415 Triple 3 input AND (open collector) ─────────────────────────────
console.log('\nG1: 7415 - Triple 3 input AND OC (key cases, all 3 gates)');
test3InputGate('74x15', '1A', '1B', '1C', '1Y', 'AND');
test3InputGate('74x15', '2A', '2B', '2C', '2Y', 'AND');
test3InputGate('74x15', '3A', '3B', '3C', '3Y', 'AND');

// ── G2: 7416 Hex NOT (open collector) ────────────────────────────────────────
console.log('\nG2: 7416 - Hex NOT OC (all 6 gates, 2 cases each)');
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    testSingleInputGate('74x16', inp, out, 'NOT');
  }
}

// ── G3: 7417 Hex BUFFER (open collector) ─────────────────────────────────────
console.log('\nG3: 7417 - Hex BUFFER OC (all 6 gates, 2 cases each)');
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    testSingleInputGate('74x17', inp, out, 'BUFFER');
  }
}

// ── G4: 7421 Dual 4 input AND ────────────────────────────────────────────────
console.log('\nG4: 7421 - Dual 4 input AND (key cases, both gates)');
test4InputGate('74x21', ['1A','1B','1C','1D'], '1Y', 'AND');
test4InputGate('74x21', ['2A','2B','2C','2D'], '2Y', 'AND');

// ── G5: 7422 Dual 4 input NAND (open collector) ──────────────────────────────
console.log('\nG5: 7422 - Dual 4 input NAND OC (key cases, both gates)');
test4InputGate('74x22', ['1A','1B','1C','1D'], '1Y', 'NAND');
test4InputGate('74x22', ['2A','2B','2C','2D'], '2Y', 'NAND');

// ── G6: 7425 Dual 4 input NOR (with strobe) ──────────────────────────────────
// Note: the strobe pin (1G/2G) is in the pinout but absent from the gate
// definition, so it is not evaluated by the simulator. Tests cover the 4
// declared inputs only.
console.log('\nG6: 7425 - Dual 4 input NOR (strobe not in gate def) (both gates)');
test4InputGate('74x25', ['1A','1B','1C','1D'], '1Y', 'NOR');
test4InputGate('74x25', ['2A','2B','2C','2D'], '2Y', 'NOR');

// ── G7: 7427 Triple 3 input NOR ──────────────────────────────────────────────
console.log('\nG7: 7427 - Triple 3 input NOR (key cases, all 3 gates)');
test3InputGate('74x27', '1A', '1B', '1C', '1Y', 'NOR');
test3InputGate('74x27', '2A', '2B', '2C', '2Y', 'NOR');
test3InputGate('74x27', '3A', '3B', '3C', '3Y', 'NOR');

// ── G8: 7430 8-input NAND ────────────────────────────────────────────────────
console.log('\nG8: 7430 - 8-input NAND (3 key cases)');
test8InputNAND('74x30', ['A','B','C','D','E','F','G','H'], 'Y');

// ── G9: 7437 Quad 2 input NAND (buffer) ──────────────────────────────────────
console.log('\nG9: 7437 - Quad 2 input NAND buffer (full truth table gate 1, spot-check gate 4)');
test2InputGate('74x37', '1A', '1B', '1Y', 'NAND');
test2InputGate('74x37', '4A', '4B', '4Y', 'NAND');

// ── G10: 7438 Quad 2 input NAND (open collector) ─────────────────────────────
console.log('\nG10: 7438 - Quad 2 input NAND OC (full truth table gate 1, spot-check gate 4)');
test2InputGate('74x38', '1A', '1B', '1Y', 'NAND');
test2InputGate('74x38', '4A', '4B', '4Y', 'NAND');

// ── G11: 7440 Dual 4 input NAND (buffer) ─────────────────────────────────────
console.log('\nG11: 7440 - Dual 4 input NAND buffer (key cases, both gates)');
test4InputGate('74x40', ['1A','1B','1C','1D'], '1Y', 'NAND');
test4InputGate('74x40', ['2A','2B','2C','2D'], '2Y', 'NAND');

// ── G12: 7442 BCD to Decimal Decoder ─────────────────────────────────────────
// The simulator does not implement BCD_DECIMAL gate evaluation (falls through
// to default: continue). These tests confirm the chip can be placed and
// simulated without throwing, and that output pin count is correct.
console.log('\nG12: 7442 - BCD to Decimal (BCD_DECIMAL not simulated - smoke test)');
{
  const { world, chip, wm } = setupChipWithPower('74x42');
  const sim = new CircuitSimulator();
  let threw = false;
  try { sim.evaluate(world, [chip], wm); } catch (e) { threw = true; }
  assert(!threw, '7442: simulate without BCD_DECIMAL support does not throw');

  // Verify all 10 output pins (Y0 Y9) exist on the placed chip
  for (let i = 0; i <= 9; i++) {
    const p = findPin(chip, `Y${i}`);
    assert(p !== undefined, `7442: output pin Y${i} present after placement`);
  }

  // Verify the 4 BCD input pins exist
  for (const name of ['A','B','C','D']) {
    assert(findPin(chip, name) !== undefined, `7442: input pin ${name} present`);
  }
}

// ── G13: 7445 BCD to Decimal Decoder/Driver (open collector) ─────────────────
console.log('\nG13: 7445 - BCD to Decimal OC (BCD_DECIMAL not simulated - smoke test)');
{
  const { world, chip, wm } = setupChipWithPower('74x45');
  const sim = new CircuitSimulator();
  let threw = false;
  try { sim.evaluate(world, [chip], wm); } catch (e) { threw = true; }
  assert(!threw, '7445: simulate without BCD_DECIMAL support does not throw');

  for (let i = 0; i <= 9; i++) {
    const p = findPin(chip, `Y${i}`);
    assert(p !== undefined, `7445: output pin Y${i} present after placement`);
  }

  for (const name of ['A','B','C','D']) {
    assert(findPin(chip, name) !== undefined, `7445: input pin ${name} present`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION P - Pin Placement & Layout Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nP1: All 13 chips place successfully');
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
  for (const chipId of EXPECTED_CHIP_IDS.filter(id => CHIPS_BLOCK_2[id].pins === 14)) {
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
  for (const chipId of EXPECTED_CHIP_IDS.filter(id => CHIPS_BLOCK_2[id].pins === 16)) {
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
