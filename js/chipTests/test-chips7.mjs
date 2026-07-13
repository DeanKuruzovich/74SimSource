// test-chips7.mjs - Tests for all chips defined in js/chips/chips7.js
// Style matches test-chips1.mjs: plain Node.js ESM, no test framework.

import { CHIPS_BLOCK_7 } from '../chips/chips7.js';
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

// ── Shared helpers ────────────────────────────────────────────────────────────
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

function isHigh(v) { return v !== undefined && v > 2.5; }
function isLow(v)  { return v !== undefined && v < 2.5; }

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

function simulate(world, chip, wm) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  return sim;
}

function applyInputs(wm, chip, inputMap) {
  for (const [pinName, val] of Object.entries(inputMap)) {
    if (val) wirePinToVcc(wm, findPin(chip, pinName));
    else     wirePinToGnd(wm, findPin(chip, pinName));
  }
}

// ── Gate-logic helpers ─────────────────────────────────────────────────────

function test2InputGate(chipId, inA, inB, outPin, gateType) {
  const tables = {
    NAND: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]],
    NOR:  [[0,0,1],[0,1,0],[1,0,0],[1,1,0]],
  };
  for (const [a, b, expectHigh] of tables[gateType]) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    applyInputs(wm, chip, { [inA]: a, [inB]: b });
    const sim = simulate(world, chip, wm);
    const v = getPinVoltage(sim, findPin(chip, outPin));
    const ok = expectHigh ? isHigh(v) : isLow(v);
    assert(ok, `${chipId} ${gateType}(${a},${b}) → ${expectHigh?'HIGH':'LOW'} (got ${v?.toFixed(1)})`);
  }
}

function test4InputGate(chipId, inputs, outPin, gateType) {
  const [inA, inB, inC, inD] = inputs;
  const cases = {
    NAND: [[0,0,0,0,1,'(0,0,0,0)=1'], [1,1,1,0,1,'(1,1,1,0)=1'], [1,1,1,1,0,'(1,1,1,1)=0']],
    NOR:  [[0,0,0,0,1,'(0,0,0,0)=1'], [1,0,0,0,0,'(1,0,0,0)=0'], [0,0,0,1,0,'(0,0,0,1)=0'], [1,1,1,1,0,'(1,1,1,1)=0']],
  };
  for (const [a, b, c, d, expectHigh, label] of cases[gateType]) {
    const { world, chip, wm } = setupChipWithPower(chipId);
    applyInputs(wm, chip, { [inA]: a, [inB]: b, [inC]: c, [inD]: d });
    const sim = simulate(world, chip, wm);
    const v = getPinVoltage(sim, findPin(chip, outPin));
    const ok = expectHigh ? isHigh(v) : isLow(v);
    assert(ok, `${chipId} ${gateType}${label} (got ${v?.toFixed(1)})`);
  }
}

function testSingleInputGate(chipId, inPin, outPin, gateType) {
  // LOW input
  { const { world, chip, wm } = setupChipWithPower(chipId);
    wirePinToGnd(wm, findPin(chip, inPin));
    const sim = simulate(world, chip, wm);
    const v = getPinVoltage(sim, findPin(chip, outPin));
    const expectHigh = gateType === 'NOT';
    const ok = expectHigh ? isHigh(v) : isLow(v);
    assert(ok, `${chipId} ${gateType}(0) → ${expectHigh?'HIGH':'LOW'} (got ${v?.toFixed(1)})`);
  }
  // HIGH input
  { const { world, chip, wm } = setupChipWithPower(chipId);
    wirePinToVcc(wm, findPin(chip, inPin));
    const sim = simulate(world, chip, wm);
    const v = getPinVoltage(sim, findPin(chip, outPin));
    const expectHigh = gateType === 'BUFFER';
    const ok = expectHigh ? isHigh(v) : isLow(v);
    assert(ok, `${chipId} ${gateType}(1) → ${expectHigh?'HIGH':'LOW'} (got ${v?.toFixed(1)})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure & Definition Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x18','74x19','74x23','74x24','74x26',
  '74x28','74x29','74x33','74x34',
  '74x35','74x36','74x39','74x43','74x44',
];

console.log('\nS1: All 14 chip IDs present in CHIPS_BLOCK_7');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_7, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_7).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_7 contains exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_7).length})`);
}

console.log('\nS2: Required fields on every chip definition');
{
  const REQUIRED = ['name','simpleName','description','pins','vcc','gnd','pinout','gates','tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_7)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id}: has '${f}'`);
    }
    assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
      `${id}: pinout length === pins (${def.pins})`);
    assert(Array.isArray(def.gates) && def.gates.length > 0,
      `${id}: has at least one gate`);
    assert(def.vcc >= 1 && def.vcc <= def.pins, `${id}: vcc pin valid`);
    assert(def.gnd >= 1 && def.gnd <= def.pins, `${id}: gnd pin valid`);
    assert(def.vcc !== def.gnd, `${id}: vcc ≠ gnd`);
  }
}

console.log('\nS3: All gate pin names exist in pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_7)) {
    const pinNames = new Set(def.pinout.map(p => p.name));
    for (const gate of def.gates) {
      const all = [...(gate.inputs || []),
                   ...(gate.outputs || []),
                   ...(gate.output ? [gate.output] : [])];
      for (const n of all) {
        assert(pinNames.has(n), `${id}: gate pin '${n}' exists in pinout`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// 74x18: Dual 4 input NAND (Schmitt) ─────────────────────────────────────────
console.log('\nG1: 7418 - Dual 4 input NAND (Schmitt trigger)');
test4InputGate('74x18', ['1A','1B','1C','1D'], '1Y', 'NAND');
test4InputGate('74x18', ['2A','2B','2C','2D'], '2Y', 'NAND');

// 74x19: Hex Inverter (Schmitt) ───────────────────────────────────────────────
console.log('\nG2: 7419 - Hex Inverter (Schmitt trigger)');
for (const n of ['1','2','3','4','5','6']) {
  testSingleInputGate('74x19', `${n}A`, `${n}Y`, 'NOT');
}

// 74x23: Dual 4 input NOR with strobe ─────────────────────────────────────────
console.log('\nG3: 7423 - Dual 4 input NOR with strobe');
{
  // G=0 (enabled): output = NOR(A,B,C,D)
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x23');
  applyInputs(wm1, c1, { '1A':0, '1B':0, '1C':0, '1D':0, '1G':0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, '1Y'))),
    '7423 NOR_STROBE(0,0,0,0, G=0) → HIGH');

  // Per TI SDLS082: Y = NOT(G AND (A+B+C+D)). G LOW blanks the gate (Y HIGH);
  // G HIGH enables normal NOR operation.
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x23');
  applyInputs(wm2, c2, { '1A':1, '1B':0, '1C':0, '1D':0, '1G':0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(c2, '1Y'))),
    '7423 NOR_STROBE(1,0,0,0, G=0) → HIGH (strobe LOW blanks gate)');

  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x23');
  applyInputs(wm3, c3, { '1A':1, '1B':1, '1C':1, '1D':1, '1G':1 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, '1Y'))),
    '7423 NOR_STROBE(1,1,1,1, G=1) → LOW (enabled NOR of HIGH inputs)');

  // Gate 2
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('74x23');
  applyInputs(wm4, c4, { '2A':0, '2B':0, '2C':0, '2D':0, '2G':0 });
  const sim4 = simulate(w4, c4, wm4);
  assert(isHigh(getPinVoltage(sim4, findPin(c4, '2Y'))),
    '7423 gate2 NOR_STROBE(0,0,0,0, G=0) → HIGH');
}

// 74x24: Quad 2 input NAND (Schmitt) ──────────────────────────────────────────
console.log('\nG4: 7424 - Quad 2 input NAND (Schmitt trigger)');
for (const n of ['1','2','3','4']) {
  test2InputGate('74x24', `${n}A`, `${n}B`, `${n}Y`, 'NAND');
}

// 74x26: Quad 2 input NAND (OC 15V) ───────────────────────────────────────────
console.log('\nG5: 7426 - Quad 2 input NAND (open collector)');
for (const n of ['1','2','3','4']) {
  test2InputGate('74x26', `${n}A`, `${n}B`, `${n}Y`, 'NAND');
}

// 74x28: Quad 2 input NOR (driver) ────────────────────────────────────────────
console.log('\nG6: 7428 - Quad 2 input NOR (high-drive)');
for (const n of ['1','2','3','4']) {
  test2InputGate('74x28', `${n}A`, `${n}B`, `${n}Y`, 'NOR');
}

// 74x29: Dual 4 input NOR ──────────────────────────────────────────────────────
console.log('\nG7: 7429 - Dual 4 input NOR');
test4InputGate('74x29', ['1A','1B','1C','1D'], '1Y', 'NOR');
test4InputGate('74x29', ['2A','2B','2C','2D'], '2Y', 'NOR');

// 74x33: Quad 2 input NOR (OC) ────────────────────────────────────────────────
console.log('\nG9: 7433 - Quad 2 input NOR (open collector)');
for (const n of ['1','2','3','4']) {
  test2InputGate('74x33', `${n}A`, `${n}B`, `${n}Y`, 'NOR');
}

// 74x34: Hex Buffer ────────────────────────────────────────────────────────────
console.log('\nG10: 7434 - Hex Buffer');
for (const n of ['1','2','3','4','5','6']) {
  testSingleInputGate('74x34', `${n}A`, `${n}Y`, 'BUFFER');
}

// 74x35: Hex Buffer (OC) ───────────────────────────────────────────────────────
console.log('\nG11: 7435 - Hex Buffer (open collector)');
for (const n of ['1','2','3','4','5','6']) {
  testSingleInputGate('74x35', `${n}A`, `${n}Y`, 'BUFFER');
}

// 74x36: Quad 2 input NOR (different pinout) ──────────────────────────────────
console.log('\nG12: 7436 - Quad 2 input NOR');
for (const n of ['1','2','3','4']) {
  test2InputGate('74x36', `${n}A`, `${n}B`, `${n}Y`, 'NOR');
}

// 74x39: Quad 2 input NAND (OC, 60mA) ────────────────────────────────────────
console.log('\nG13: 7439 - Quad 2 input NAND (open collector)');
for (const n of ['1','2','3','4']) {
  test2InputGate('74x39', `${n}A`, `${n}B`, `${n}Y`, 'NAND');
}

// 74x43: Excess-3 to Decimal Decoder ──────────────────────────────────────────
console.log('\nG15: 7443 - Excess-3 to Decimal Decoder');
{
  // XS3 encodes digit n as binary (n+3)
  for (let dec = 0; dec <= 9; dec++) {
    const xs3 = dec + 3; // XS3 code
    const a = (xs3 >> 0) & 1;
    const b = (xs3 >> 1) & 1;
    const c = (xs3 >> 2) & 1;
    const d = (xs3 >> 3) & 1;
    const { world, chip, wm } = setupChipWithPower('74x43');
    applyInputs(wm, chip, { A: a, B: b, C: c, D: d });
    const sim = simulate(world, chip, wm);
    const vSel = getPinVoltage(sim, findPin(chip, `Y${dec}`));
    assert(isLow(vSel), `7443 XS3(${dec}): Y${dec} is LOW (code 0b${xs3.toString(2).padStart(4,'0')}, got ${vSel?.toFixed(1)})`);
  }
  // Invalid XS3 code (e.g., 0000): all outputs HIGH/HiZ
  {
    const { world, chip, wm } = setupChipWithPower('74x43');
    applyInputs(wm, chip, { A: 0, B: 0, C: 0, D: 0 }); // 0000 → dec=-3, invalid
    const sim = simulate(world, chip, wm);
    for (let i = 0; i <= 9; i++) {
      const v = getPinVoltage(sim, findPin(chip, `Y${i}`));
      assert(isHigh(v) || v === undefined,
        `7443 XS3(0000, invalid): Y${i} HIGH/HiZ (got ${v?.toFixed(1)})`);
    }
  }
}

// 74x44: Gray Code to Decimal Decoder ──────────────────────────────────────────
console.log('\nG16: 7444 - Gray Code to Decimal Decoder');
{
  // Gray codes for 0-9 (4 bit reflected binary):
  // dec: 0     1     2     3     4     5     6     7     8     9
  // gray:0000 0001  0011  0010  0110  0111  0101  0100  1100  1101
  const GRAY_CODES = [0b0000, 0b0001, 0b0011, 0b0010, 0b0110, 0b0111, 0b0101, 0b0100, 0b1100, 0b1101];
  for (let dec = 0; dec <= 9; dec++) {
    const code = GRAY_CODES[dec];
    const a = (code >> 0) & 1;
    const b = (code >> 1) & 1;
    const c = (code >> 2) & 1;
    const d = (code >> 3) & 1;
    const { world, chip, wm } = setupChipWithPower('74x44');
    applyInputs(wm, chip, { A: a, B: b, C: c, D: d });
    const sim = simulate(world, chip, wm);
    const vSel = getPinVoltage(sim, findPin(chip, `Y${dec}`));
    assert(isLow(vSel), `7444 GRAY(${dec}): Y${dec} is LOW (code 0b${code.toString(2).padStart(4,'0')}, got ${vSel?.toFixed(1)})`);
  }
  // Invalid Gray code (e.g., 1110): all outputs HIGH/HiZ
  {
    const { world, chip, wm } = setupChipWithPower('74x44');
    applyInputs(wm, chip, { A: 0, B: 1, C: 1, D: 1 }); // 0b1110 → invalid
    const sim = simulate(world, chip, wm);
    for (let i = 0; i <= 9; i++) {
      const v = getPinVoltage(sim, findPin(chip, `Y${i}`));
      assert(isHigh(v) || v === undefined,
        `7444 GRAY(1110, invalid): Y${i} HIGH/HiZ (got ${v?.toFixed(1)})`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${pass + fail} tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
