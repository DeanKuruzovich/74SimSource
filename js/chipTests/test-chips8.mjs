// test-chips8.mjs - Tests for all chips defined in js/chips/chips8.js
// Style matches test-chips1.mjs: plain Node.js ESM, no test framework.

import { CHIPS_BLOCK_8 } from '../chips/chips8.js';
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x49','74x50','74x52','74x53','74x55','74x56','74x57',
  '74x58','74x59','74x60','74x61','74x62','74x63','74x64','74x65','74x67',
];

console.log('\nS1: All 16 chip IDs present in CHIPS_BLOCK_8');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_8, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_8).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_8 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_8).length})`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name','simpleName','description','pins','vcc','gnd','pinout','gates','tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_8)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id}: has '${f}'`);
    }
    assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
      `${id}: pinout length === pins (${def.pins})`);
    assert(Array.isArray(def.gates) && def.gates.length > 0, `${id}: has gate(s)`);
    assert(def.vcc >= 1 && def.vcc <= def.pins, `${id}: vcc pin in range`);
    assert(def.gnd >= 1 && def.gnd <= def.pins, `${id}: gnd pin in range`);
    assert(def.vcc !== def.gnd, `${id}: vcc ≠ gnd`);
  }
}

console.log('\nS3: All gate pin names exist in pinout');
for (const [id, def] of Object.entries(CHIPS_BLOCK_8)) {
  const pinNames = new Set(def.pinout.map(p => p.name));
  for (const gate of def.gates) {
    const all = [...(gate.inputs||[]), ...(gate.outputs||[]), ...(gate.output?[gate.output]:[])];
    for (const n of all) {
      assert(pinNames.has(n), `${id}: pin '${n}' in pinout`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// 7449: BCD to 7 segment (OC)
console.log('\nG1: 7449 - BCD to 7 segment (OC)');
{
  // Test BCD 0: a,b,c,d,e,f should be active (LOW); g should be off (HIGH)
  const { world, chip, wm } = setupChipWithPower('74x49');
  applyInputs(wm, chip, { A:0, B:0, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'a'))), '7449 BCD(0): a is LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'b'))), '7449 BCD(0): b is LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'c'))), '7449 BCD(0): c is LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'd'))), '7449 BCD(0): d is LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'e'))), '7449 BCD(0): e is LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'f'))), '7449 BCD(0): f is LOW');
  // BCD 1: only b,c active
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x49');
  applyInputs(wm2, c2, { A:1, B:0, C:0, D:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'b'))), '7449 BCD(1): b is LOW');
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'c'))), '7449 BCD(1): c is LOW');
  assert(isHigh(getPinVoltage(sim2, findPin(c2, 'a'))) || getPinVoltage(sim2, findPin(c2, 'a')) === undefined,
    '7449 BCD(1): a is HIGH/HiZ');
}

// 7450: Dual 2-wide 2 input AOI
console.log('\nG2: 7450 - Dual 2-wide 2 input AOI');
{
  // Gate 1: Y = NOT((A&B)|(C&D))
  // All LOW → NOT(0|0)=1
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x50');
  applyInputs(wm1, c1, { '1A':0, '1B':0, '1C':0, '1D':0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, '1Y'))), '7450 AOI_2WIDE(0,0,0,0)=1');
  // A=1,B=1,C=0,D=0 → NOT(1|0)=0
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x50');
  applyInputs(wm2, c2, { '1A':1, '1B':1, '1C':0, '1D':0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '1Y'))), '7450 AOI_2WIDE(1,1,0,0)=0');
  // A=0,B=0,C=1,D=1 → NOT(0|1)=0
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x50');
  applyInputs(wm3, c3, { '1A':0, '1B':0, '1C':1, '1D':1 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, '1Y'))), '7450 AOI_2WIDE(0,0,1,1)=0');
}

// 7452: 3-2-2-2 AND OR gate
console.log('\nG3: 7452 - 3-2-2-2 AND OR gate');
{
  // All LOW → 0
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x52');
  applyInputs(wm1, c1, { A1:0, A2:0, A3:0, B1:0, B2:0, C1:0, C2:0, D1:0, D2:0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'Y'))), '7452 AO_3222(all 0)=0');
  // A1=A2=A3=1 → 1
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x52');
  applyInputs(wm2, c2, { A1:1, A2:1, A3:1, B1:0, B2:0, C1:0, C2:0, D1:0, D2:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(c2, 'Y'))), '7452 AO_3222(A=1,1,1)=1');
  // B1=B2=1 → 1
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x52');
  applyInputs(wm3, c3, { A1:0, A2:0, A3:0, B1:1, B2:1, C1:0, C2:0, D1:0, D2:0 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isHigh(getPinVoltage(sim3, findPin(c3, 'Y'))), '7452 AO_3222(B=1,1)=1');
}

// 7453: 3-2-2-2 AND OR-Invert
console.log('\nG4: 7453 - 3-2-2-2 AOI');
{
  // All LOW → NOT(0)=1
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x53');
  applyInputs(wm1, c1, { A1:0, A2:0, A3:0, B1:0, B2:0, C1:0, C2:0, D1:0, D2:0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, 'Y'))), '7453 AOI_3222(all 0)=1');
  // A1=A2=A3=1 → NOT(1)=0
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x53');
  applyInputs(wm2, c2, { A1:1, A2:1, A3:1, B1:0, B2:0, C1:0, C2:0, D1:0, D2:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Y'))), '7453 AOI_3222(A=1,1,1)=0');
  // D1=D2=1 → NOT(1)=0
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x53');
  applyInputs(wm3, c3, { A1:0, A2:0, A3:0, B1:0, B2:0, C1:0, C2:0, D1:1, D2:1 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, 'Y'))), '7453 AOI_3222(D=1,1)=0');
}

// 7455: 4-4 AOI
console.log('\nG5: 7455 - 4-4 AND OR-Invert');
{
  // All LOW → NOT(0)=1
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x55');
  applyInputs(wm1, c1, { A1:0, A2:0, A3:0, A4:0, B1:0, B2:0, B3:0, B4:0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, 'Y'))), '7455 AOI_44(all 0)=1');
  // A all HIGH → NOT(1)=0
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x55');
  applyInputs(wm2, c2, { A1:1, A2:1, A3:1, A4:1, B1:0, B2:0, B3:0, B4:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Y'))), '7455 AOI_44(A=1111)=0');
  // B all HIGH → NOT(1)=0
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x55');
  applyInputs(wm3, c3, { A1:0, A2:0, A3:0, A4:0, B1:1, B2:1, B3:1, B4:1 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, 'Y'))), '7455 AOI_44(B=1111)=0');
  // A=1111, B=1111 → NOT(1)=0
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('74x55');
  applyInputs(wm4, c4, { A1:1, A2:1, A3:1, A4:1, B1:1, B2:1, B3:1, B4:1 });
  const sim4 = simulate(w4, c4, wm4);
  assert(isLow(getPinVoltage(sim4, findPin(c4, 'Y'))), '7455 AOI_44(all 1)=0');
}

// 7456/7457: Frequency dividers (basic sequential structure check)
console.log('\nG6: 7456/7457 - Frequency Dividers (structure check)');
{
  // Verify chip exists and Q starts LOW
  for (const id of ['74x56', '74x57']) {
    const { world, chip, wm } = setupChipWithPower(id);
    wirePinToGnd(wm, findPin(chip, 'CLK'));
    const sim = simulate(world, chip, wm);
    const v = getPinVoltage(sim, findPin(chip, 'Q'));
    assert(isLow(v) || v === undefined, `${id} Q starts LOW with CLK=0 (got ${v?.toFixed(1)})`);
  }
}

// 7458: 3-3-AND OR + 2-2-AND OR
console.log('\nG7: 7458 - Dual AND OR gates');
{
  // Gate 1 (3-3 AND OR): Y1 = (A1&A2&A3)|(B1&B2&B3)
  // All LOW → 0
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x58');
  applyInputs(wm1, c1, { '1A1':0, '1A2':0, '1A3':0, '1B1':0, '1B2':0, '1B3':0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isLow(getPinVoltage(sim1, findPin(c1, '1Y'))), '7458 AO_33(all 0)=0');
  // A=1,1,1 → 1
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x58');
  applyInputs(wm2, c2, { '1A1':1, '1A2':1, '1A3':1, '1B1':0, '1B2':0, '1B3':0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(c2, '1Y'))), '7458 AO_33(A=111)=1');
  // Gate 2 (2-2 AND OR): Y2 = (A1&A2)|(B1&B2)
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x58');
  applyInputs(wm3, c3, { '2A1':1, '2A2':1, '2B1':0, '2B2':0 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isHigh(getPinVoltage(sim3, findPin(c3, '2Y'))), '7458 AO_22(A=1,1)=1');
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('74x58');
  applyInputs(wm4, c4, { '2A1':0, '2A2':0, '2B1':0, '2B2':0 });
  const sim4 = simulate(w4, c4, wm4);
  assert(isLow(getPinVoltage(sim4, findPin(c4, '2Y'))), '7458 AO_22(all 0)=0');
}

// 7459: Dual 3-2 AOI
console.log('\nG8: 7459 - Dual 3-2 AND OR-Invert');
{
  // Gate 1: Y = NOT((A&B&C)|(D&E))
  // All LOW → NOT(0)=1
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x59');
  applyInputs(wm1, c1, { '1A':0, '1B':0, '1C':0, '1D':0, '1E':0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, '1Y'))), '7459 AOI_32(all 0)=1');
  // A=B=C=1 → NOT(1)=0
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x59');
  applyInputs(wm2, c2, { '1A':1, '1B':1, '1C':1, '1D':0, '1E':0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '1Y'))), '7459 AOI_32(A=1,1,1)=0');
  // D=E=1 → NOT(1)=0
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x59');
  applyInputs(wm3, c3, { '1A':0, '1B':0, '1C':0, '1D':1, '1E':1 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, '1Y'))), '7459 AOI_32(D=1,E=1)=0');
  // Gate 2 (same logic)
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('74x59');
  applyInputs(wm4, c4, { '2A':0, '2B':0, '2C':0, '2D':0, '2E':0 });
  const sim4 = simulate(w4, c4, wm4);
  assert(isHigh(getPinVoltage(sim4, findPin(c4, '2Y'))), '7459 AOI_32 gate2(all 0)=1');
}

// 7460: Dual 4 input AND expander
console.log('\nG9: 7460 - Dual 4 input AND expander');
{
  // Gate 1: 1X = AND(1A,1B,1C,1D)
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x60');
  applyInputs(wm1, c1, { '1A':1, '1B':1, '1C':1, '1D':1 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, '1X'))), '7460 AND(1,1,1,1)=1');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x60');
  applyInputs(wm2, c2, { '1A':1, '1B':0, '1C':1, '1D':1 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '1X'))), '7460 AND(1,0,1,1)=0');
}

// 7461: Triple 3 input AND expander
console.log('\nG10: 7461 - Triple 3 input AND expander');
{
  for (const n of ['1','2','3']) {
    const { world, chip, wm } = setupChipWithPower('74x61');
    applyInputs(wm, chip, { [`${n}A`]:1, [`${n}B`]:1, [`${n}C`]:1 });
    const sim = simulate(world, chip, wm);
    assert(isHigh(getPinVoltage(sim, findPin(chip, `${n}X`))), `7461 AND${n}(1,1,1)=1`);
    const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x61');
    applyInputs(wm2, c2, { [`${n}A`]:1, [`${n}B`]:0, [`${n}C`]:1 });
    const sim2 = simulate(w2, c2, wm2);
    assert(isLow(getPinVoltage(sim2, findPin(c2, `${n}X`))), `7461 AND${n}(1,0,1)=0`);
  }
}

// 7462: 3-3-2-2 AND OR expander
console.log('\nG11: 7462 - 3-3-2-2 AND OR expander');
{
  // All LOW → 0
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x62');
  applyInputs(wm1, c1, { A1:0, A2:0, A3:0, B1:0, B2:0, B3:0, C1:0, C2:0, D1:0, D2:0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'X'))), '7462 AO_3322(all 0)=0');
  // A1=A2=A3=1 → 1
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x62');
  applyInputs(wm2, c2, { A1:1, A2:1, A3:1, B1:0, B2:0, B3:0, C1:0, C2:0, D1:0, D2:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(c2, 'X'))), '7462 AO_3322(A=1,1,1)=1');
}

// 7463: Hex current sensing (NOT/inverter, OC)
console.log('\nG12: 7463 - Hex current sensing inverters');
{
  for (const n of ['1','2','3','4','5','6']) {
    const { world, chip, wm } = setupChipWithPower('74x63');
    wirePinToGnd(wm, findPin(chip, `${n}A`));
    const sim = simulate(world, chip, wm);
    const v = getPinVoltage(sim, findPin(chip, `${n}Y`));
    assert(isHigh(v) || v === undefined, `7463 NOT${n}(0) → HIGH/HiZ (got ${v?.toFixed(1)})`);
    const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x63');
    wirePinToVcc(wm2, findPin(c2, `${n}A`));
    const sim2 = simulate(w2, c2, wm2);
    const v2 = getPinVoltage(sim2, findPin(c2, `${n}Y`));
    assert(isLow(v2), `7463 NOT${n}(1) → LOW (got ${v2?.toFixed(1)})`);
  }
}

// 7464: 4-3-2-2 AOI
console.log('\nG13: 7464 - 4-3-2-2 AND OR-Invert');
{
  // All LOW → NOT(0)=1
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x64');
  applyInputs(wm1, c1, { A1:0, A2:0, A3:0, A4:0, B1:0, B2:0, B3:0, C1:0, C2:0, D1:0, D2:0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, 'Y'))), '7464 AOI_4322(all 0)=1');
  // A all HIGH → NOT(1)=0
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x64');
  applyInputs(wm2, c2, { A1:1, A2:1, A3:1, A4:1, B1:0, B2:0, B3:0, C1:0, C2:0, D1:0, D2:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Y'))), '7464 AOI_4322(A=1111)=0');
  // B all HIGH → NOT(1)=0
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x64');
  applyInputs(wm3, c3, { A1:0, A2:0, A3:0, A4:0, B1:1, B2:1, B3:1, C1:0, C2:0, D1:0, D2:0 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, 'Y'))), '7464 AOI_4322(B=111)=0');
  // C=1,1 → NOT(1)=0
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('74x64');
  applyInputs(wm4, c4, { A1:0, A2:0, A3:0, A4:0, B1:0, B2:0, B3:0, C1:1, C2:1, D1:0, D2:0 });
  const sim4 = simulate(w4, c4, wm4);
  assert(isLow(getPinVoltage(sim4, findPin(c4, 'Y'))), '7464 AOI_4322(C=1,1)=0');
  // D=1,1 → NOT(1)=0
  const { world: w5, chip: c5, wm: wm5 } = setupChipWithPower('74x64');
  applyInputs(wm5, c5, { A1:0, A2:0, A3:0, A4:0, B1:0, B2:0, B3:0, C1:0, C2:0, D1:1, D2:1 });
  const sim5 = simulate(w5, c5, wm5);
  assert(isLow(getPinVoltage(sim5, findPin(c5, 'Y'))), '7464 AOI_4322(D=1,1)=0');
}

// 7465: 4-3-2-2 AOI (OC) - same logic as 7464
console.log('\nG14: 7465 - 4-3-2-2 AOI (open collector)');
{
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x65');
  applyInputs(wm1, c1, { A1:0, A2:0, A3:0, A4:0, B1:0, B2:0, B3:0, C1:0, C2:0, D1:0, D2:0 });
  const sim1 = simulate(w1, c1, wm1);
  const v1 = getPinVoltage(sim1, findPin(c1, 'Y'));
  assert(isHigh(v1) || v1 === undefined, '7465 AOI_4322(all 0)=1/HiZ');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x65');
  applyInputs(wm2, c2, { A1:1, A2:1, A3:1, A4:1, B1:0, B2:0, B3:0, C1:0, C2:0, D1:0, D2:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Y'))), '7465 AOI_4322(A=1111)=0');
}

// 7467: JK controller device FF with AND gated inputs
console.log('\nG15: 7467 - JK controller device FF (AND gated)');
{
  // With PRE active LOW (LOW=preset), Q should be 1
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x67');
  applyInputs(wm1, c1, { CLK:0, J1:0, J2:0, J3:0, K1:0, K2:0, K3:0, PRE:0, CLR:1 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, 'Q'))), '7467 PRE=LOW → Q=1');
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'Qn'))), '7467 PRE=LOW → Qn=0');
  // With CLR active LOW (LOW=clear), Q should be 0
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x67');
  applyInputs(wm2, c2, { CLK:0, J1:0, J2:0, J3:0, K1:0, K2:0, K3:0, PRE:1, CLR:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Q'))), '7467 CLR=LOW → Q=0');
  assert(isHigh(getPinVoltage(sim2, findPin(c2, 'Qn'))), '7467 CLR=LOW → Qn=1');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${pass + fail} tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
