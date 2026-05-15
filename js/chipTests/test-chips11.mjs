// test-chips11.mjs - Tests for all chips defined in js/chips/chips11.js

import { CHIPS_BLOCK_11 } from '../chips/chips11.js';
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

// Helper: full positive edge clock cycle using two WireManagers
function clockEdge(world, chip, clkPinName, otherPins) {
  const wm1 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm1, findPin(chip, 'VCC'));
  wirePinToGnd(wm1, findPin(chip, 'GND'));
  applyInputs(wm1, chip, { ...otherPins, [clkPinName]: 0 });
  new CircuitSimulator().evaluate(world, [chip], wm1);

  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { ...otherPins, [clkPinName]: 1 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm2);
  return { sim, wm: wm2 };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74112', '74113', '74114', '74115', '74H116', '74117',
  '74118', '74H119', '74H120', '74124', '74128', '74131',
  '74133', '74134', '74135', '74136',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_11');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_11, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_11).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_11 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_11).length})`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_11)) {
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
for (const [id, def] of Object.entries(CHIPS_BLOCK_11)) {
  const pinNames = new Set(def.pinout.map(p => p.name));
  for (const gate of def.gates) {
    const all = [
      ...(gate.inputs || []),
      ...(gate.outputs || []),
      ...(gate.output ? [gate.output] : [])
    ].filter(n => n != null);
    for (const n of all) {
      assert(pinNames.has(n), `${id}: pin '${n}' in pinout`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// G1: 74112 - Dual JK neg-edge FF, individual CLK/PRE/CLR
console.log('\nG1: 74112 - Dual JK FF (PRE/CLR)');
{
  // CLR=0 → Q=0, Qn=1
  const { world, chip, wm } = setupChipWithPower('74112');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 1, '1CLR': 0 });
  applyInputs(wm, chip, { '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))),  '74112 FF1: CLR=0 → 1Q=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Qn'))), '74112 FF1: CLR=0 → 1Qn=1');
}
{
  // PRE=0 → Q=1, Qn=0
  const { world, chip, wm } = setupChipWithPower('74112');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 0, '1CLR': 1 });
  applyInputs(wm, chip, { '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))),  '74112 FF1: PRE=0 → 1Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Qn'))), '74112 FF1: PRE=0 → 1Qn=0');
}
{
  // J=1,K=0 → rising clock sets Q
  const { world, chip, wm } = setupChipWithPower('74112');
  applyInputs(wm, chip, { '1PRE': 1, '1CLR': 1, '2PRE': 1, '2CLR': 1 });
  const { sim } = clockEdge(world, chip, '1CLK', { '1J': 1, '1K': 0, '1PRE': 1, '1CLR': 1, '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74112 FF1: J=1,K=0 → Q=1 after clock');
}
{
  // J=0,K=1 → rising clock clears Q
  const { world, chip, wm } = setupChipWithPower('74112');
  // First set Q=1 via PRE
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 0, '1CLR': 1, '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  simulate(world, chip, wm);
  const { sim } = clockEdge(world, chip, '1CLK', { '1J': 0, '1K': 1, '1PRE': 1, '1CLR': 1, '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1, '2CLR': 1 });
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74112 FF1: J=0,K=1 → Q=0 after clock');
}

// G2: 74113 - Dual JK FF, preset only (no CLR)
console.log('\nG2: 74113 - Dual JK FF (PRE only)');
{
  // PRE=0 → Q=1 async
  const { world, chip, wm } = setupChipWithPower('74113');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '1PRE': 0, '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))),  '74113 FF1: PRE=0 → 1Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Qn'))), '74113 FF1: PRE=0 → 1Qn=0');
}
{
  // J=1,K=0 → clock → Q=1
  const { world, chip, wm } = setupChipWithPower('74113');
  const { sim } = clockEdge(world, chip, '1CLK', { '1J': 1, '1K': 0, '1PRE': 1, '2J': 0, '2K': 0, '2CLK': 0, '2PRE': 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74113 FF1: J=1,K=0 → Q=1');
}

// G3: 74114 - Dual JK FF, shared CLK+CLR
console.log('\nG3: 74114 - Dual JK FF (shared CLK/CLR)');
{
  // CLR=0 → both Q=0
  const { world, chip, wm } = setupChipWithPower('74114');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, 'CLK': 0, '1PRE': 1, 'CLR': 0, '2J': 0, '2K': 0, '2PRE': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74114 CLR=0 → 1Q=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74114 CLR=0 → 2Q=0');
}
{
  // J=1,K=0 → clock both FFs
  const { world, chip, wm } = setupChipWithPower('74114');
  const { sim } = clockEdge(world, chip, 'CLK', { '1J': 1, '1K': 0, '1PRE': 1, 'CLR': 1, '2J': 1, '2K': 0, '2PRE': 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74114 FF1: J=1,K=0 → Q=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Q'))), '74114 FF2: J=1,K=0 → Q=1');
}

// G4: 74115 - Dual JK FF, CLR only, shared CLK
console.log('\nG4: 74115 - Dual JK FF (CLR only, shared CLK)');
{
  // CLR=0 → Q=0
  const { world, chip, wm } = setupChipWithPower('74115');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, 'CLK': 0, '1CLR': 0, '2J': 0, '2K': 0, '2CLR': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74115 CLR=0 → 1Q=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74115 CLR=0 → 2Q=0');
}
{
  // J=1,K=0 → clock → Q=1
  const { world, chip, wm } = setupChipWithPower('74115');
  const { sim } = clockEdge(world, chip, 'CLK', { '1J': 1, '1K': 0, '1CLR': 1, '2J': 1, '2K': 0, '2CLR': 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74115 FF1: J=1,K=0 → Q=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Q'))), '74115 FF2: J=1,K=0 → Q=1');
}

// G5: 74H116 - AND-gated JK FF
console.log('\nG5: 74H116 - AND-gated JK FF');
{
  // CLR=0 → Q=0
  const { world, chip, wm } = setupChipWithPower('74H116');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))),  '74H116 CLR=0 → Q=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Qn'))), '74H116 CLR=0 → Qn=1');
}
{
  // PRE=0 → Q=1
  const { world, chip, wm } = setupChipWithPower('74H116');
  applyInputs(wm, chip, { J1: 0, J2: 0, J3: 0, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 0, CLR: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))),  '74H116 PRE=0 → Q=1');
}
{
  // J all=1, K all=0 → clock → Q=1
  const { world, chip, wm } = setupChipWithPower('74H116');
  const { sim } = clockEdge(world, chip, 'CLK', { J1: 1, J2: 1, J3: 1, K1: 0, K2: 0, K3: 0, PRE: 1, CLR: 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74H116 J all=1,K all=0 → Q=1');
}
{
  // J not all=1 → no set (J2=0, so J-AND=0)
  const { world, chip, wm } = setupChipWithPower('74H116');
  // Ensure Q starts at 0
  applyInputs(wm, chip, { J1: 1, J2: 0, J3: 1, K1: 0, K2: 0, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  simulate(world, chip, wm);
  const { sim } = clockEdge(world, chip, 'CLK', { J1: 1, J2: 0, J3: 1, K1: 0, K2: 0, K3: 0, PRE: 1, CLR: 1 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))), '74H116 J2=0 → J-AND fails, Q stays 0');
}

// G6: 74117 - AND-gated JK FF with J2n/K2n inverted
console.log('\nG6: 74117 - AND-gated JK FF (J2n/K2n inverted)');
{
  // CLR=0 → Q=0
  const { world, chip, wm } = setupChipWithPower('74117');
  applyInputs(wm, chip, { J1: 0, J2n: 0, J3: 0, K1: 0, K2n: 0, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))), '74117 CLR=0 → Q=0');
}
{
  // J1=1, J2n=0 (inverted→1), J3=1 → J=1; K all=0 → set on clock
  const { world, chip, wm } = setupChipWithPower('74117');
  const { sim } = clockEdge(world, chip, 'CLK', { J1: 1, J2n: 0, J3: 1, K1: 0, K2n: 1, K3: 0, PRE: 1, CLR: 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74117 J2n=0 (inverted→1) → J=1 → Q=1');
}
{
  // J2n=1 (inverted→0) → J-AND fails → Q stays 0
  const { world, chip, wm } = setupChipWithPower('74117');
  applyInputs(wm, chip, { J1: 1, J2n: 1, J3: 1, K1: 0, K2n: 1, K3: 0, CLK: 0, PRE: 1, CLR: 0 });
  simulate(world, chip, wm);
  const { sim } = clockEdge(world, chip, 'CLK', { J1: 1, J2n: 1, J3: 1, K1: 0, K2n: 1, K3: 0, PRE: 1, CLR: 1 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q'))), '74117 J2n=1 (inverted→0) → J-AND fails, Q stays 0');
}

// G7: 74118 - Hex SR Latch, shared CLR
console.log('\nG7: 74118 - Hex SR Latch (shared CLR)');
{
  // CLR=0 → all Q=0
  const { world, chip, wm } = setupChipWithPower('74118');
  applyInputs(wm, chip, { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, CLR: 0 });
  const sim = simulate(world, chip, wm);
  for (let i = 1; i <= 6; i++) {
    assert(isLow(getPinVoltage(sim, findPin(chip, `Q${i}`))), `74118 CLR=0 → Q${i}=0`);
  }
}
{
  // S1=1, CLR=1 → Q1=1
  const { world, chip, wm } = setupChipWithPower('74118');
  applyInputs(wm, chip, { S1: 1, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, CLR: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q1'))), '74118 S1=1,CLR=1 → Q1=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q2'))),  '74118 Q2 stays 0');
}
{
  // Set all, then CLR → all go back to 0
  const { world, chip, wm } = setupChipWithPower('74118');
  applyInputs(wm, chip, { S1: 1, S2: 1, S3: 1, S4: 1, S5: 1, S6: 1, CLR: 1 });
  simulate(world, chip, wm);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, CLR: 0 });
  const sim2 = simulate(world, chip, wm2);
  for (let i = 1; i <= 6; i++) {
    assert(isLow(getPinVoltage(sim2, findPin(chip, `Q${i}`))), `74118 CLR=0 clears Q${i}`);
  }
}
{
  // Hold: S=0, CLR=1 → Q retains previous state
  const { world, chip, wm } = setupChipWithPower('74118');
  // Set Q3=1
  applyInputs(wm, chip, { S1: 0, S2: 0, S3: 1, S4: 0, S5: 0, S6: 0, CLR: 1 });
  simulate(world, chip, wm);
  // Remove set signal
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, CLR: 1 });
  const sim2 = simulate(world, chip, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q3'))), '74118 Q3 holds after S3→0');
}

// G8: 74H119 - Dual JK FF, shared CLK+CLR
console.log('\nG8: 74H119 - Dual JK FF (shared CLK/CLR)');
{
  // CLR=0 → both Q=0
  const { world, chip, wm } = setupChipWithPower('74H119');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, 'CLK': 0, 'CLR': 0, '2J': 0, '2K': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74H119 CLR=0 → 1Q=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74H119 CLR=0 → 2Q=0');
}
{
  // J=1,K=0 → clock both
  const { world, chip, wm } = setupChipWithPower('74H119');
  const { sim } = clockEdge(world, chip, 'CLK', { '1J': 1, '1K': 0, 'CLR': 1, '2J': 1, '2K': 0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74H119 FF1 J=1,K=0 → Q=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Q'))), '74H119 FF2 J=1,K=0 → Q=1');
}

// G9: 74H120 - Dual JK FF, separate CLKs, shared CLR
console.log('\nG9: 74H120 - Dual JK FF (separate CLKs, shared CLR)');
{
  // CLR=0 → both Q=0
  const { world, chip, wm } = setupChipWithPower('74H120');
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '2J': 0, '2K': 0, '2CLK': 0, 'CLR': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74H120 CLR=0 → 1Q=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '74H120 CLR=0 → 2Q=0');
}
{
  // Clock FF1 only → 1Q=1, 2Q stays 0
  const { world, chip, wm } = setupChipWithPower('74H120');
  const { sim } = clockEdge(world, chip, '1CLK', { '1J': 1, '1K': 0, '2J': 0, '2K': 0, '2CLK': 0, 'CLR': 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74H120 FF1 clocked J=1 → 1Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))),  '74H120 FF2 not clocked → 2Q=0');
}
{
  // Clock FF2 only → 2Q=1, 1Q stays 0 (after CLR)
  const { world, chip, wm } = setupChipWithPower('74H120');
  // CLR both first
  applyInputs(wm, chip, { '1J': 0, '1K': 0, '1CLK': 0, '2J': 1, '2K': 0, '2CLK': 0, 'CLR': 0 });
  simulate(world, chip, wm);
  const { sim } = clockEdge(world, chip, '2CLK', { '1J': 0, '1K': 0, '1CLK': 0, '2J': 1, '2K': 0, 'CLR': 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Q'))), '74H120 FF2 clocked J=1 → 2Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))),  '74H120 FF1 not clocked → 1Q=0');
}

// G10: 74124 - VCO stub (all outputs HiZ)
console.log('\nG10: 74124 - VCO stub (outputs HiZ)');
{
  const { world, chip, wm } = setupChipWithPower('74124');
  applyInputs(wm, chip, { EN1: 1, FREQ1: 1, RNG1: 1, EN2: 1, FREQ2: 1, RNG2: 1 });
  const sim = simulate(world, chip, wm);
  const v1 = getPinVoltage(sim, findPin(chip, 'Y1'));
  const v2 = getPinVoltage(sim, findPin(chip, 'Y2'));
  // VCO_STUB drives HiZ → net resolves to 0V (no pull up)
  assert(isLow(v1) || v1 === undefined, '74124 Y1 is HiZ/low (no pull up)');
  assert(isLow(v2) || v2 === undefined, '74124 Y2 is HiZ/low (no pull up)');
}

// G11: 74128 - Quad 2 input NOR
console.log('\nG11: 74128 - Quad 2 input NOR');
{
  const { world, chip, wm } = setupChipWithPower('74128');
  // All inputs low → all outputs high
  applyInputs(wm, chip, { '1A': 0, '1B': 0, '2A': 0, '2B': 0, '3A': 0, '3B': 0, '4A': 0, '4B': 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y'))), '74128 NOR: 0+0 → 1Y=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y'))), '74128 NOR: 0+0 → 2Y=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '3Y'))), '74128 NOR: 0+0 → 3Y=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '4Y'))), '74128 NOR: 0+0 → 4Y=1');
}
{
  const { world, chip, wm } = setupChipWithPower('74128');
  // One input high → output low
  applyInputs(wm, chip, { '1A': 1, '1B': 0, '2A': 0, '2B': 1, '3A': 1, '3B': 1, '4A': 0, '4B': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y'))), '74128 NOR: 1+0 → 1Y=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y'))), '74128 NOR: 0+1 → 2Y=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '3Y'))), '74128 NOR: 1+1 → 3Y=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '4Y'))), '74128 NOR: 0+0 → 4Y=1');
}

// G12: 74131 - 3-to-8 registered decoder
console.log('\nG12: 74131 - 3-to-8 decoder (registered)');
{
  // OE=1 → all outputs HiZ
  const { world, chip, wm } = setupChipWithPower('74131');
  applyInputs(wm, chip, { CLK: 0, OE: 1, A0: 0, A1: 0, A2: 0 });
  const sim = simulate(world, chip, wm);
  for (let i = 0; i <= 7; i++) {
    const v = getPinVoltage(sim, findPin(chip, `Y${i}`));
    // OE=1 → HiZ → net resolves to 0V; no pull up so isLow or undefined
    assert(isLow(v) || v === undefined, `74131 OE=1 → Y${i} HiZ/low`);
  }
}
{
  // OE=0, CLK rising, A=0 → Y0=0, Y1-Y7=1
  const { world, chip, wm } = setupChipWithPower('74131');
  const { sim } = clockEdge(world, chip, 'CLK', { OE: 0, A0: 0, A1: 0, A2: 0 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y0'))),  '74131 A=0 → Y0=0 (active)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y1'))), '74131 A=0 → Y1=1 (inactive)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y7'))), '74131 A=0 → Y7=1 (inactive)');
}
{
  // A=5 (101) → Y5=0, others=1
  const { world, chip, wm } = setupChipWithPower('74131');
  const { sim } = clockEdge(world, chip, 'CLK', { OE: 0, A0: 1, A1: 0, A2: 1 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y5'))),  '74131 A=5 → Y5=0 (active)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74131 A=5 → Y0=1 (inactive)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y4'))), '74131 A=5 → Y4=1 (inactive)');
}
{
  // A=7 (111) → Y7=0, others=1
  const { world, chip, wm } = setupChipWithPower('74131');
  const { sim } = clockEdge(world, chip, 'CLK', { OE: 0, A0: 1, A1: 1, A2: 1 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y7'))),  '74131 A=7 → Y7=0 (active)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y6'))), '74131 A=7 → Y6=1 (inactive)');
}

// G13: 74133 - single 13 input NAND
console.log('\nG13: 74133 - 13 input NAND');
{
  // All inputs=1 → Y=0
  const { world, chip, wm } = setupChipWithPower('74133');
  const inMap = {};
  for (let i = 1; i <= 13; i++) inMap[`A${i}`] = 1;
  applyInputs(wm, chip, inMap);
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y'))), '74133 all 1s → Y=0');
}
{
  // One input=0 → Y=1
  const { world, chip, wm } = setupChipWithPower('74133');
  const inMap = {};
  for (let i = 1; i <= 13; i++) inMap[`A${i}`] = (i === 7 ? 0 : 1);
  applyInputs(wm, chip, inMap);
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y'))), '74133 A7=0 → Y=1');
}
{
  // All inputs=0 → Y=1
  const { world, chip, wm } = setupChipWithPower('74133');
  const inMap = {};
  for (let i = 1; i <= 13; i++) inMap[`A${i}`] = 0;
  applyInputs(wm, chip, inMap);
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y'))), '74133 all 0s → Y=1');
}

// G14: 74134 - 12 input NAND with 3-state output
console.log('\nG14: 74134 - 12 input NAND (3-state)');
{
  // OE=1 → Y HiZ
  const { world, chip, wm } = setupChipWithPower('74134');
  const inMap = { OE: 1 };
  for (let i = 1; i <= 12; i++) inMap[`A${i}`] = 1;
  applyInputs(wm, chip, inMap);
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'Y'));
  // OE=1 → HiZ → net resolves to 0V; no pull up so isLow or undefined
  assert(isLow(v) || v === undefined, '74134 OE=1 → Y HiZ/low');
}
{
  // OE=0, all=1 → Y=0
  const { world, chip, wm } = setupChipWithPower('74134');
  const inMap = { OE: 0 };
  for (let i = 1; i <= 12; i++) inMap[`A${i}`] = 1;
  applyInputs(wm, chip, inMap);
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y'))), '74134 OE=0, all inputs=1 → Y=0');
}
{
  // OE=0, A3=0 → Y=1
  const { world, chip, wm } = setupChipWithPower('74134');
  const inMap = { OE: 0 };
  for (let i = 1; i <= 12; i++) inMap[`A${i}`] = (i === 3 ? 0 : 1);
  applyInputs(wm, chip, inMap);
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y'))), '74134 A3=0 → Y=1');
}

// G15: 74135 - Quad XOR/XNOR with select
console.log('\nG15: 74135 - Quad XOR/XNOR (select)');
{
  // C1=0 (XOR): 0⊕0=0, 0⊕1=1
  const { world, chip, wm } = setupChipWithPower('74135');
  applyInputs(wm, chip, { A1: 0, B1: 0, C1: 0, A2: 0, B2: 1, C2: 0, A3: 1, B3: 1, A4: 1, B4: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y1'))),  '74135 C1=0(XOR): 0⊕0=0 → Y1=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74135 C1=0(XOR): 0⊕1=1 → Y2=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y3'))),  '74135 C2=0(XOR): 1⊕1=0 → Y3=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y4'))), '74135 C2=0(XOR): 1⊕0=1 → Y4=1');
}
{
  // C1=1 (XNOR): 0⊕0=1, 0⊕1=0
  const { world, chip, wm } = setupChipWithPower('74135');
  applyInputs(wm, chip, { A1: 0, B1: 0, C1: 1, A2: 0, B2: 1, C2: 1, A3: 1, B3: 1, A4: 1, B4: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y1'))), '74135 C1=1(XNOR): 0⊕0=1 → Y1=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y2'))),  '74135 C1=1(XNOR): 0⊕1=0 → Y2=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y3'))), '74135 C2=1(XNOR): 1⊕1=1 → Y3=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y4'))),  '74135 C2=1(XNOR): 1⊕0=0 → Y4=0');
}

// G16: 74136 - Quad 2 input XOR, open-collector
// OC: when XOR=0 (A=B), output sinks LOW. When XOR=1 (A≠B), output is HiZ → pulled HIGH via 4.7kΩ pull up.
console.log('\nG16: 74136 - Quad 2 input XOR (OC)');
{
  // A≠B → output HiZ → pull up → HIGH
  const { world, chip, wm } = setupChipWithPower('74136');
  applyInputs(wm, chip, { '1A': 0, '1B': 1, '2A': 1, '2B': 0, '3A': 0, '3B': 1, '4A': 1, '4B': 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y'))), '74136 0⊕1=1 OC → 1Y HIGH (pull up)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y'))), '74136 1⊕0=1 OC → 2Y HIGH (pull up)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '3Y'))), '74136 0⊕1=1 OC → 3Y HIGH (pull up)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '4Y'))), '74136 1⊕0=1 OC → 4Y HIGH (pull up)');
}
{
  // A=B → XOR=0 → output sinks → LOW
  const { world, chip, wm } = setupChipWithPower('74136');
  applyInputs(wm, chip, { '1A': 0, '1B': 0, '2A': 1, '2B': 1, '3A': 0, '3B': 0, '4A': 1, '4B': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y'))), '74136 0⊕0=0 → 1Y LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y'))), '74136 1⊕1=0 → 2Y LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '3Y'))), '74136 0⊕0=0 → 3Y LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '4Y'))), '74136 1⊕1=0 → 4Y LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
