// test-chips10.mjs - Tests for all chips defined in js/chips/chips10.js

import { CHIPS_BLOCK_10 } from '../chips/chips10.js';
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

// Clock chip: wire CLK low then high using a fresh WireManager pass each time
function clockChip(world, chip, clkPinName) {
  const wm1 = new WireManager();
  resetWireCounter();
  wirePinToVcc(wm1, findPin(chip, 'VCC'));
  wirePinToGnd(wm1, findPin(chip, 'GND'));
  wirePinToGnd(wm1, findPin(chip, clkPinName));
  new CircuitSimulator().evaluate(world, [chip], wm1);

  const wm2 = new WireManager();
  resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  wirePinToVcc(wm2, findPin(chip, clkPinName));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm2);
  return sim;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '7494', '7496', '7497', '7498', '7499',
  '74100',
  '74101', '74102', '74103', '74104', '74105', '74106',
  '74108', '74110', '74111',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_10');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_10, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_10).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_10 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_10).length})`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_10)) {
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
for (const [id, def] of Object.entries(CHIPS_BLOCK_10)) {
  const pinNames = new Set(def.pinout.map(p => p.name));
  for (const gate of def.gates) {
    const all = [...(gate.inputs || []), ...(gate.outputs || []), ...(gate.output ? [gate.output] : [])].filter(n => n != null);
    for (const n of all) {
      assert(pinNames.has(n), `${id}: pin '${n}' in pinout`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// G2: 74x94 - 4 bit shift reg with dual async presets
console.log('\nG2: 7494 - Shift reg (dual preset)');
{
  // CLR=0 → all zeros (QD=0)
  const { world, chip, wm } = setupChipWithPower('7494');
  applyInputs(wm, chip, { CLK: 0, CLR: 0, SER: 0, P1A: 1, P1B: 1, P1C: 1, P1D: 1, P2A: 0, P2B: 0, P2C: 0, P2D: 0, S1: 0, S2: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '7494 CLR=0 → QD=0');
}
{
  // S1=1 → async load from P1 (P1D=1)
  const { world, chip, wm } = setupChipWithPower('7494');
  applyInputs(wm, chip, { CLK: 0, CLR: 1, SER: 0, P1A: 1, P1B: 1, P1C: 1, P1D: 1, P2A: 0, P2B: 0, P2C: 0, P2D: 0, S1: 1, S2: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QD'))), '7494 S1=1 → QD preset to P1D=1');
}
{
  // S2=1 → async load from P2 (P2D=0)
  const { world, chip, wm } = setupChipWithPower('7494');
  applyInputs(wm, chip, { CLK: 0, CLR: 1, SER: 0, P1A: 1, P1B: 1, P1C: 1, P1D: 1, P2A: 0, P2B: 0, P2C: 0, P2D: 0, S1: 0, S2: 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '7494 S2=1 → QD preset to P2D=0');
}
{
  // Shift operation: SER=1 shifts through 4 stages → after 4 clocks, QD=1
  const { world, chip, wm } = setupChipWithPower('7494');
  // Step1: CLR
  applyInputs(wm, chip, { CLK: 0, CLR: 0, SER: 1, P1A: 0, P1B: 0, P1C: 0, P1D: 0, P2A: 0, P2B: 0, P2C: 0, P2D: 0, S1: 0, S2: 0 });
  simulate(world, chip, wm);
  // Clock 4 times to shift SER=1 through all 4 stages to QD
  for (let i = 0; i < 4; i++) {
    const wm_lo = new WireManager(); resetWireCounter();
    wirePinToVcc(wm_lo, findPin(chip, 'VCC'));
    wirePinToGnd(wm_lo, findPin(chip, 'GND'));
    applyInputs(wm_lo, chip, { CLK: 0, CLR: 1, SER: 1, P1A: 0, P1B: 0, P1C: 0, P1D: 0, P2A: 0, P2B: 0, P2C: 0, P2D: 0, S1: 0, S2: 0 });
    simulate(world, chip, wm_lo);
    const wm_hi = new WireManager(); resetWireCounter();
    wirePinToVcc(wm_hi, findPin(chip, 'VCC'));
    wirePinToGnd(wm_hi, findPin(chip, 'GND'));
    applyInputs(wm_hi, chip, { CLK: 1, CLR: 1, SER: 1, P1A: 0, P1B: 0, P1C: 0, P1D: 0, P2A: 0, P2B: 0, P2C: 0, P2D: 0, S1: 0, S2: 0 });
    simulate(world, chip, wm_hi);
  }
  // After 4 rising edges with SER=1, QD should be 1
  const wm_final = new WireManager(); resetWireCounter();
  wirePinToVcc(wm_final, findPin(chip, 'VCC'));
  wirePinToGnd(wm_final, findPin(chip, 'GND'));
  applyInputs(wm_final, chip, { CLK: 0, CLR: 1, SER: 1, P1A: 0, P1B: 0, P1C: 0, P1D: 0, P2A: 0, P2B: 0, P2C: 0, P2D: 0, S1: 0, S2: 0 });
  const sim_final = simulate(world, chip, wm_final);
  assert(isHigh(getPinVoltage(sim_final, findPin(chip, 'QD'))), '7494 shift: after 4 clocks with SER=1, QD=1');
}

// G3: 74x96 - 5 bit PIPO shift register
console.log('\nG3: 7496 - 5 bit shift register');
{
  // CLR=0 → all zero
  const { world, chip, wm } = setupChipWithPower('7496');
  applyInputs(wm, chip, { CLK: 0, CLR: 0, SER: 0, A: 1, B: 1, C: 1, D: 1, E: 1, PE: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '7496 CLR=0 → QA=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QE'))), '7496 CLR=0 → QE=0');
}
{
  // Parallel load: CLK rising with PE=1 → load A-E
  const { world, chip, wm } = setupChipWithPower('7496');
  // CLR first
  applyInputs(wm, chip, { CLK: 0, CLR: 0, SER: 0, A: 1, B: 0, C: 1, D: 0, E: 1, PE: 1 });
  simulate(world, chip, wm);
  // Release CLR, CLK=0
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 0, CLR: 1, SER: 0, A: 1, B: 0, C: 1, D: 0, E: 1, PE: 1 });
  simulate(world, chip, wm2);
  // Rising CLK with PE=1 → parallel load
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { CLK: 1, CLR: 1, SER: 0, A: 1, B: 0, C: 1, D: 0, E: 1, PE: 1 });
  const sim3 = simulate(world, chip, wm3);
  assert(isHigh(getPinVoltage(sim3, findPin(chip, 'QA'))), '7496 parallel load: QA=A=1');
  assert(isLow(getPinVoltage(sim3, findPin(chip, 'QB'))), '7496 parallel load: QB=B=0');
  assert(isHigh(getPinVoltage(sim3, findPin(chip, 'QC'))), '7496 parallel load: QC=C=1');
  assert(isLow(getPinVoltage(sim3, findPin(chip, 'QD'))), '7496 parallel load: QD=D=0');
  assert(isHigh(getPinVoltage(sim3, findPin(chip, 'QE'))), '7496 parallel load: QE=E=1');
}
{
  // Shift: CLR→clear, then SER=1, PE=0, clk → QA=1
  const { world, chip, wm } = setupChipWithPower('7496');
  applyInputs(wm, chip, { CLK: 0, CLR: 0, SER: 1, A: 0, B: 0, C: 0, D: 0, E: 0, PE: 0 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 0, CLR: 1, SER: 1, A: 0, B: 0, C: 0, D: 0, E: 0, PE: 0 });
  simulate(world, chip, wm2);
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { CLK: 1, CLR: 1, SER: 1, A: 0, B: 0, C: 0, D: 0, E: 0, PE: 0 });
  const sim3 = simulate(world, chip, wm3);
  assert(isHigh(getPinVoltage(sim3, findPin(chip, 'QA'))), '7496 shift SER=1 → QA=1');
  assert(isLow(getPinVoltage(sim3, findPin(chip, 'QB'))), '7496 shift SER=1 → QB stays 0');
}

// G4: 74x97 - Rate multiplier (combinational simplified)
console.log('\nG4: 7497 - Rate multiplier');
{
  // ENP=1, CLK=1 → Y=1
  const { world, chip, wm } = setupChipWithPower('7497');
  applyInputs(wm, chip, { CLK: 1, ENP: 1, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y'))), '7497 CLK=1, ENP=1 → Y=1');
}
{
  // ENP=0 → Y=0
  const { world, chip, wm } = setupChipWithPower('7497');
  applyInputs(wm, chip, { CLK: 1, ENP: 0, A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y'))), '7497 ENP=0 → Y=0');
}
{
  // CLK=0 → Y=0
  const { world, chip, wm } = setupChipWithPower('7497');
  applyInputs(wm, chip, { CLK: 0, ENP: 1, A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y'))), '7497 CLK=0 → Y=0');
}

// G5: 74x98 - Data selector/storage register
console.log('\nG5: 7498 - Data selector/storage register');
{
  // S=0: load from group 0 on rising CLK
  const { world, chip, wm } = setupChipWithPower('7498');
  applyInputs(wm, chip, { CLK: 0, S: 0, '0A': 1, '0B': 0, '0C': 1, '0D': 0, '1A': 0, '1B': 1, '1C': 0, '1D': 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 1, S: 0, '0A': 1, '0B': 0, '0C': 1, '0D': 0, '1A': 0, '1B': 1, '1C': 0, '1D': 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'QA'))), '7498 S=0: QA=0A=1');
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'QB'))), '7498 S=0: QB=0B=0');
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'QC'))), '7498 S=0: QC=0C=1');
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'QD'))), '7498 S=0: QD=0D=0');
}
{
  // S=1: load from group 1 on rising CLK
  const { world, chip, wm } = setupChipWithPower('7498');
  applyInputs(wm, chip, { CLK: 0, S: 1, '0A': 1, '0B': 1, '0C': 1, '0D': 1, '1A': 0, '1B': 1, '1C': 0, '1D': 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 1, S: 1, '0A': 1, '0B': 1, '0C': 1, '0D': 1, '1A': 0, '1B': 1, '1C': 0, '1D': 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'QA'))), '7498 S=1: QA=1A=0');
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'QB'))), '7498 S=1: QB=1B=1');
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'QC'))), '7498 S=1: QC=1C=0');
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'QD'))), '7498 S=1: QD=1D=1');
}

// G6: 74x99 - 4 bit bidirectional shift register
console.log('\nG6: 7499 - 4 bit bidirectional shift register');
{
  // Parallel load (S1=1, S0=1)
  const { world, chip, wm } = setupChipWithPower('7499');
  applyInputs(wm, chip, { CLK: 0, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 1, B: 0, C: 1, D: 0 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 1, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 1, B: 0, C: 1, D: 0 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'QA'))), '7499 parallel load: QA=A=1');
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'QB'))), '7499 parallel load: QB=B=0');
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'QC'))), '7499 parallel load: QC=C=1');
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'QD'))), '7499 parallel load: QD=D=0');
}
{
  // Hold (S1=0, S0=0): after parallel load, state should stay
  const { world, chip, wm } = setupChipWithPower('7499');
  // Load ABCD=1010
  applyInputs(wm, chip, { CLK: 0, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 1, B: 0, C: 1, D: 0 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 1, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 1, B: 0, C: 1, D: 0 });
  simulate(world, chip, wm2);
  // Now hold: S=00
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { CLK: 0, S0: 0, S1: 0, SER_R: 1, SER_L: 1, A: 0, B: 1, C: 0, D: 1 });
  simulate(world, chip, wm3);
  const wm4 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm4, findPin(chip, 'VCC'));
  wirePinToGnd(wm4, findPin(chip, 'GND'));
  applyInputs(wm4, chip, { CLK: 1, S0: 0, S1: 0, SER_R: 1, SER_L: 1, A: 0, B: 1, C: 0, D: 1 });
  const sim4 = simulate(world, chip, wm4);
  assert(isHigh(getPinVoltage(sim4, findPin(chip, 'QA'))), '7499 hold: QA still=1');
  assert(isLow(getPinVoltage(sim4, findPin(chip, 'QB'))), '7499 hold: QB still=0');
}
{
  // Shift right (S1=0, S0=1): SER_R=1 → QA becomes 1, QD gets old QC
  const { world, chip, wm } = setupChipWithPower('7499');
  // Clear by loading 0000
  applyInputs(wm, chip, { CLK: 0, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 0, B: 0, C: 0, D: 0 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 1, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 0, B: 0, C: 0, D: 0 });
  simulate(world, chip, wm2);
  // Shift right with SER_R=1
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { CLK: 0, S0: 1, S1: 0, SER_R: 1, SER_L: 0, A: 0, B: 0, C: 0, D: 0 });
  simulate(world, chip, wm3);
  const wm4 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm4, findPin(chip, 'VCC'));
  wirePinToGnd(wm4, findPin(chip, 'GND'));
  applyInputs(wm4, chip, { CLK: 1, S0: 1, S1: 0, SER_R: 1, SER_L: 0, A: 0, B: 0, C: 0, D: 0 });
  const sim4 = simulate(world, chip, wm4);
  assert(isHigh(getPinVoltage(sim4, findPin(chip, 'QA'))), '7499 shift right: SER_R=1 → QA=1');
  assert(isLow(getPinVoltage(sim4, findPin(chip, 'QB'))), '7499 shift right: QB=old QA=0');
}
{
  // Shift left (S1=1, S0=0): SER_L=1 → QD becomes 1
  const { world, chip, wm } = setupChipWithPower('7499');
  // Clear
  applyInputs(wm, chip, { CLK: 0, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 0, B: 0, C: 0, D: 0 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { CLK: 1, S0: 1, S1: 1, SER_R: 0, SER_L: 0, A: 0, B: 0, C: 0, D: 0 });
  simulate(world, chip, wm2);
  // Shift left with SER_L=1
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { CLK: 0, S0: 0, S1: 1, SER_R: 0, SER_L: 1, A: 0, B: 0, C: 0, D: 0 });
  simulate(world, chip, wm3);
  const wm4 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm4, findPin(chip, 'VCC'));
  wirePinToGnd(wm4, findPin(chip, 'GND'));
  applyInputs(wm4, chip, { CLK: 1, S0: 0, S1: 1, SER_R: 0, SER_L: 1, A: 0, B: 0, C: 0, D: 0 });
  const sim4 = simulate(world, chip, wm4);
  assert(isHigh(getPinVoltage(sim4, findPin(chip, 'QD'))), '7499 shift left: SER_L=1 → QD=1');
  assert(isLow(getPinVoltage(sim4, findPin(chip, 'QC'))), '7499 shift left: QC=old QD=0');
}

// G7: 74x100 - Dual 4 bit bistable latch (24-pin)
console.log('\nG7: 74100 - Dual 4 bit bistable latch');
{
  // Group 1: 1E=1 (transparent) → 1Q follows 1D
  const { world, chip, wm } = setupChipWithPower('74100');
  applyInputs(wm, chip, { '1D1': 1, '1D2': 0, '1D3': 1, '1D4': 0, '1E': 1, '2D1': 0, '2D2': 0, '2D3': 0, '2D4': 0, '2E': 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q1'))), '74100 1E=1, 1D1=1 → 1Q1=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q2'))), '74100 1E=1, 1D2=0 → 1Q2=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q3'))), '74100 1E=1, 1D3=1 → 1Q3=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q4'))), '74100 1E=1, 1D4=0 → 1Q4=0');
}
{
  // Group 2: 2E=1 (transparent) → 2Q follows 2D
  const { world, chip, wm } = setupChipWithPower('74100');
  applyInputs(wm, chip, { '1D1': 0, '1D2': 0, '1D3': 0, '1D4': 0, '1E': 0, '2D1': 1, '2D2': 0, '2D3': 1, '2D4': 0, '2E': 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Q1'))), '74100 2E=1, 2D1=1 → 2Q1=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q2'))), '74100 2E=1, 2D2=0 → 2Q2=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Q3'))), '74100 2E=1, 2D3=1 → 2Q3=1');
}
{
  // Hold: 1E=0, data changes, Q should stay
  const { world, chip, wm } = setupChipWithPower('74100');
  applyInputs(wm, chip, { '1D1': 1, '1D2': 1, '1D3': 1, '1D4': 1, '1E': 1, '2E': 0, '2D1': 0, '2D2': 0, '2D3': 0, '2D4': 0 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { '1D1': 0, '1D2': 0, '1D3': 0, '1D4': 0, '1E': 0, '2E': 0, '2D1': 0, '2D2': 0, '2D3': 0, '2D4': 0 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, '1Q1'))), '74100 latch hold: 1Q1 stays 1 after 1E=0');
}

// G8: 74x101 - JK FF (AND-OR gated, preset only)
console.log('\nG8: 74101 - JK FF (AND-OR, preset only)');
{
  // PRE=0 → Q=1
  const { world, chip, wm } = setupChipWithPower('74101');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74101 PRE=0 → Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Qn'))), '74101 PRE=0 → Qn=0');
}
{
  // Set J=1, K=0, clock
  const { world, chip, wm } = setupChipWithPower('74101');
  applyInputs(wm, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 1, PRE: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q'))), '74101 J=1,K=0, clock → Q=1');
}
{
  // Reset K=1, J=0, then clock
  const { world, chip, wm } = setupChipWithPower('74101');
  // First set
  applyInputs(wm, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 1, PRE: 1 });
  simulate(world, chip, wm2);
  // Now reset
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { J1: 0, J2: 0, J3: 0, K1: 1, K2: 1, K3: 1, CLK: 0, PRE: 1 });
  simulate(world, chip, wm3);
  const wm4 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm4, findPin(chip, 'VCC'));
  wirePinToGnd(wm4, findPin(chip, 'GND'));
  applyInputs(wm4, chip, { J1: 0, J2: 0, J3: 0, K1: 1, K2: 1, K3: 1, CLK: 1, PRE: 1 });
  const sim4 = simulate(world, chip, wm4);
  assert(isLow(getPinVoltage(sim4, findPin(chip, 'Q'))), '74101 K=1,J=0, clock → Q=0');
}

// G9: 74x102 - JK FF (AND-gated, preset+clr)
console.log('\nG9: 74102 - JK FF (AND-gated, preset+clear)');
{
  // PRE=0 → Q=1
  const { world, chip, wm } = setupChipWithPower('74102');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 0, CLR: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74102 PRE=0 → Q=1');
}
{
  // CLR=0 → Q=0
  const { world, chip, wm } = setupChipWithPower('74102');
  applyInputs(wm, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))), '74102 CLR=0 → Q=0');
}
{
  // J=1,K=0, clk → Q=1
  const { world, chip, wm } = setupChipWithPower('74102');
  applyInputs(wm, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 1, PRE: 1, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q'))), '74102 J=1,K=0 clk → Q=1');
}

// G10: 74x103 - Dual JK FF (neg-edge, CLR only)
console.log('\nG10: 74103 - Dual JK FF (CLR only)');
{
  // 1CLR=0 → 1Q=0
  const { world, chip, wm } = setupChipWithPower('74103');
  applyInputs(wm, chip, { '1J': 1, '1K': 0, '1CLK': 0, '1CLR': 0, '2J': 0, '2K': 0, '2CLK': 0, '2CLR': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74103 1CLR=0 → 1Q=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Qn'))), '74103 1CLR=0 → 1Qn=1');
}
{
  // FF1: J=1, K=0, CLK→ Q=1; FF2: J=0,K=1 CLK→ Q=0
  const { world, chip, wm } = setupChipWithPower('74103');
  applyInputs(wm, chip, { '1J': 1, '1K': 0, '1CLK': 0, '1CLR': 1, '2J': 0, '2K': 1, '2CLK': 0, '2CLR': 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { '1J': 1, '1K': 0, '1CLK': 1, '1CLR': 1, '2J': 0, '2K': 1, '2CLK': 1, '2CLR': 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, '1Q'))), '74103 1J=1,1K=0, clk → 1Q=1');
  assert(isLow(getPinVoltage(sim2, findPin(chip, '2Q'))), '74103 2J=0,2K=1, clk → 2Q=0');
}
{
  // 2CLR=0 → 2Q=0
  const { world, chip, wm } = setupChipWithPower('74103');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1CLR': 1, '2J': 0, '2K': 0, '2CLK': 0, '2CLR': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74103 2CLR=0 → 2Q=0');
}

// G11: 74x104 - JK MS FF (3 input AND)
console.log('\nG11: 74104 - JK MS FF (3 input AND)');
{
  // PRE=0 → Q=1
  const { world, chip, wm } = setupChipWithPower('74104');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 0, CLR: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74104 PRE=0 → Q=1');
}
{
  // CLR=0 → Q=0
  const { world, chip, wm } = setupChipWithPower('74104');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))), '74104 CLR=0 → Q=0');
}
{
  // J=1 (all 3),K=0, clk → Q=1
  const { world, chip, wm } = setupChipWithPower('74104');
  applyInputs(wm, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 1, PRE: 1, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q'))), '74104 J=1,K=0, clk → Q=1');
}
{
  // J gate blocked (J2=0): J=0 even if J1=J3=1, K=0 → no set
  const { world, chip, wm } = setupChipWithPower('74104');
  applyInputs(wm, chip, { J1: 1, J2: 0, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2: 0, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 1, PRE: 1, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'Q'))), '74104 J2=0 → J blocked → Q stays 0');
}

// G12: 74x105 - JK MS FF with inverted J2/K2
console.log('\nG12: 74105 - JK MS FF (J2n/K2n inverted)');
{
  // PRE=0 → Q=1
  const { world, chip, wm } = setupChipWithPower('74105');
  applyInputs(wm, chip, { J1: 0, J2n: 0, J3: 0, K1: 0, K2n: 0, K3: 0, CLK: 0, PRE: 0, CLR: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74105 PRE=0 → Q=1');
}
{
  // CLR=0 → Q=0
  const { world, chip, wm } = setupChipWithPower('74105');
  applyInputs(wm, chip, { J1: 0, J2n: 0, J3: 0, K1: 0, K2n: 0, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))), '74105 CLR=0 → Q=0');
}
{
  // J2n inverted: J1=1,J2n=0(→inv=1),J3=1 → J=1; K=0 → set on clk
  const { world, chip, wm } = setupChipWithPower('74105');
  applyInputs(wm, chip, { J1: 1, J2n: 0, J3: 1, K1: 0, K2n: 1, K3: 0, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2n: 0, J3: 1, K1: 0, K2n: 1, K3: 0, CLK: 1, PRE: 1, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q'))), '74105 J2n=0(inv=1),J=1 → Q set');
}
{
  // J2n=1 blocks J: J1=1,J2n=1(→inv=0),J3=1 → J=0; K=0 → no set
  const { world, chip, wm } = setupChipWithPower('74105');
  applyInputs(wm, chip, { J1: 1, J2n: 1, J3: 1, K1: 0, K2n: 1, K3: 0, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2n: 1, J3: 1, K1: 0, K2n: 1, K3: 0, CLK: 1, PRE: 1, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(chip, 'Q'))), '74105 J2n=1(inv=0) blocks J → Q stays 0');
}

// G13: 74x106 - Dual JK FF (preset+clear, 16-pin)
console.log('\nG13: 74106 - Dual JK FF (preset+clear)');
{
  // 1PRE=0 → 1Q=1
  const { world, chip, wm } = setupChipWithPower('74106');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 0, '1CLR': 1,
                           '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74106 1PRE=0 → 1Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Qn'))), '74106 1PRE=0 → 1Qn=0');
}
{
  // 2CLR=0 → 2Q=0
  const { world, chip, wm } = setupChipWithPower('74106');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                           '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74106 2CLR=0 → 2Q=0');
}
{
  // Set FF1 by clk with J=1, K=0
  const { world, chip, wm } = setupChipWithPower('74106');
  applyInputs(wm, chip, { '1J': 1, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                           '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { '1J': 1, '1K': 0, '1CLK': 1, '1PRE': 1, '1CLR': 1,
                            '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, '1Q'))), '74106 1J=1,1K=0, clk → 1Q=1');
}

// G14: 74x108 - Dual JK FF (shared CLK+CLR)
console.log('\nG14: 74108 - Dual JK FF (shared CLK/CLR)');
{
  // CLR=0 → both Q=0
  const { world, chip, wm } = setupChipWithPower('74108');
  applyInputs(wm, chip, { '1J': 1, '1K': 0, '1PRE': 1, '2J': 1, '2K': 0, '2PRE': 1, CLK: 0, CLR: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74108 CLR=0 → 1Q=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74108 CLR=0 → 2Q=0');
}
{
  // 1PRE=0 → 1Q=1
  const { world, chip, wm } = setupChipWithPower('74108');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1PRE': 0, '2J': 0, '2K': 0, '2PRE': 1, CLK: 0, CLR: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74108 1PRE=0 → 1Q=1');
}
{
  // Set both: 1J=1,1K=0 and 2J=1,2K=0, shared CLK
  const { world, chip, wm } = setupChipWithPower('74108');
  applyInputs(wm, chip, { '1J': 1, '1K': 0, '1PRE': 1, '2J': 1, '2K': 0, '2PRE': 1, CLK: 0, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { '1J': 1, '1K': 0, '1PRE': 1, '2J': 1, '2K': 0, '2PRE': 1, CLK: 1, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, '1Q'))), '74108 1J=1,1K=0, shared CLK → 1Q=1');
  assert(isHigh(getPinVoltage(sim2, findPin(chip, '2Q'))), '74108 2J=1,2K=0, shared CLK → 2Q=1');
}

// G15: 74x110 - JK FF (AND-gated, data lockout)
console.log('\nG15: 74110 - JK FF (data lockout)');
{
  // PRE=0 → Q=1
  const { world, chip, wm } = setupChipWithPower('74110');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 0, CLR: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74110 PRE=0 → Q=1');
}
{
  // CLR=0 → Q=0
  const { world, chip, wm } = setupChipWithPower('74110');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))), '74110 CLR=0 → Q=0');
}
{
  // J=1(all 3), K=0, clk → set Q
  const { world, chip, wm } = setupChipWithPower('74110');
  applyInputs(wm, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 1, PRE: 1, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q'))), '74110 J=1,K=0, clk → Q=1');
}
{
  // K=1(all 3), J=0, reset Q
  const { world, chip, wm } = setupChipWithPower('74110');
  // Set first
  applyInputs(wm, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 1, PRE: 1, CLR: 1 });
  simulate(world, chip, wm2);
  // Reset
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { J1: 0, J2: 0, J3: 0, K1: 1, K2: 1, K3: 1, CLK: 0, PRE: 1, CLR: 1 });
  simulate(world, chip, wm3);
  const wm4 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm4, findPin(chip, 'VCC'));
  wirePinToGnd(wm4, findPin(chip, 'GND'));
  applyInputs(wm4, chip, { J1: 0, J2: 0, J3: 0, K1: 1, K2: 1, K3: 1, CLK: 1, PRE: 1, CLR: 1 });
  const sim4 = simulate(world, chip, wm4);
  assert(isLow(getPinVoltage(sim4, findPin(chip, 'Q'))), '74110 K=1,J=0, clk → Q=0');
}

// G16: 74x111 - Dual JK MS FF (data lockout, individual PRE/CLR)
console.log('\nG16: 74111 - Dual JK MS FF (data lockout)');
{
  // 1PRE=0 → 1Q=1
  const { world, chip, wm } = setupChipWithPower('74111');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 0, '1CLR': 1,
                           '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74111 1PRE=0 → 1Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Qn'))), '74111 1PRE=0 → 1Qn=0');
}
{
  // 2CLR=0 → 2Q=0
  const { world, chip, wm } = setupChipWithPower('74111');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                           '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74111 2CLR=0 → 2Q=0');
}
{
  // Set FF1 by clk with J=1, K=0
  const { world, chip, wm } = setupChipWithPower('74111');
  applyInputs(wm, chip, { '1J': 1, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                           '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { '1J': 1, '1K': 0, '1CLK': 1, '1PRE': 1, '1CLR': 1,
                            '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, '1Q'))), '74111 1J=1,1K=0, 1CLK → 1Q=1');
}
{
  // Reset FF2 by clk with J=0, K=1
  const { world, chip, wm } = setupChipWithPower('74111');
  // First set FF2
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                           '2J': 1, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                            '2J': 1, '2K': 0, '2CLK': 1, '2PRE': 1, '2CLR': 1 });
  simulate(world, chip, wm2);
  // Now reset FF2
  const wm3 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm3, findPin(chip, 'VCC'));
  wirePinToGnd(wm3, findPin(chip, 'GND'));
  applyInputs(wm3, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                            '2J': 0, '2K': 1, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  simulate(world, chip, wm3);
  const wm4 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm4, findPin(chip, 'VCC'));
  wirePinToGnd(wm4, findPin(chip, 'GND'));
  applyInputs(wm4, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 1,
                            '2J': 0, '2K': 1, '2CLK': 1, '2PRE': 1, '2CLR': 1 });
  const sim4 = simulate(world, chip, wm4);
  assert(isLow(getPinVoltage(sim4, findPin(chip, '2Q'))), '74111 2J=0,2K=1, 2CLK → 2Q=0');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${pass + fail} tests - ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
