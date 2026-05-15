// test-chips9.mjs - Tests for all chips defined in js/chips/chips9.js

import { CHIPS_BLOCK_9 } from '../chips/chips9.js';
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
  '74L68','74LS68','74L69','74LS69',
  '74H71','74L71',
  '7477',
  '74H78','74L78','74LS78',
  '7479','7480','7481','7482','7484','7487',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_9');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_9, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_9).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_9 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_9).length})`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name','simpleName','description','pins','vcc','gnd','pinout','gates','tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_9)) {
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
for (const [id, def] of Object.entries(CHIPS_BLOCK_9)) {
  const pinNames = new Set(def.pinout.map(p => p.name));
  for (const gate of def.gates) {
    const all = [...(gate.inputs||[]), ...(gate.outputs||[]), ...(gate.output?[gate.output]:[])].filter(n => n != null);
    for (const n of all) {
      assert(pinNames.has(n), `${id}: pin '${n}' in pinout`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// G1: 74L68 - Dual JK FF, async CLR
console.log('\nG1: 74L68 - Dual JK FF (async CLR)');
{
  const { world, chip, wm } = setupChipWithPower('74L68');
  applyInputs(wm, chip, { '1J':0, '1K':0, '1CLK':0, '1CLR':0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))), '74L68 1CLR=LOW → 1Q=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Qn'))), '74L68 1CLR=LOW → 1Qn=1');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74L68');
  applyInputs(wm2, c2, { '2J':0, '2K':0, '2CLK':0, '2CLR':0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '2Q'))), '74L68 2CLR=LOW → 2Q=0');
}

// G2: 74LS68 - Dual decade counter
console.log('\nG2: 74LS68 - Dual decade counters');
{
  const { world, chip, wm } = setupChipWithPower('74LS68');
  applyInputs(wm, chip, { '1CLK':0, '1CLR':0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1QA'))), '74LS68 CLR=LOW → 1QA=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1QD'))), '74LS68 CLR=LOW → 1QD=0');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74LS68');
  applyInputs(wm2, c2, { '1CLK':0, '1CLR':1 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '1QA'))), '74LS68 after CLR, initial QA=0');
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74LS68');
  applyInputs(wm3, c3, { '2CLK':0, '2CLR':0 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, '2QA'))), '74LS68 2CLR=LOW → 2QA=0');
}

// G3: 74L69 - Dual JK FF, shared CLK+CLR, individual PRE
console.log('\nG3: 74L69 - Dual JK FF (shared CLK/CLR)');
{
  const { world, chip, wm } = setupChipWithPower('74L69');
  applyInputs(wm, chip, { '1J':0, '1K':0, 'CLK':0, '1PRE':0, 'CLR':1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '74L69 1PRE=LOW → 1Q=1');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74L69');
  applyInputs(wm2, c2, { '1J':0, '1K':0, 'CLK':0, '1PRE':1, 'CLR':0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '1Q'))), '74L69 CLR=LOW → 1Q=0');
}

// G4: 74LS69 - Dual binary counter
console.log('\nG4: 74LS69 - Dual binary counters');
{
  const { world, chip, wm } = setupChipWithPower('74LS69');
  applyInputs(wm, chip, { '1CLK':0, '1CLR':0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1QA'))), '74LS69 CLR=0 → 1QA=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1QD'))), '74LS69 CLR=0 → 1QD=0');
}

// G5: 74H71 - JK FF with preset only
console.log('\nG5: 74H71 - JK FF (AND-OR-gated, preset only)');
{
  const { world, chip, wm } = setupChipWithPower('74H71');
  applyInputs(wm, chip, { J1:0, J2:0, J3:0, K1:0, K2:0, K3:0, CLK:0, PRE:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74H71 PRE=LOW → Q=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Qn'))), '74H71 PRE=LOW → Qn=0');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74H71');
  applyInputs(wm2, c2, { J1:0, J2:0, J3:0, K1:0, K2:0, K3:0, CLK:0, PRE:1 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Q'))), '74H71 PRE=HIGH, no CLK → Q=0');
}

// G6: 74L71 - RS FF
console.log('\nG6: 74L71 - AND-gated RS controller-device FF');
{
  const { world, chip, wm } = setupChipWithPower('74L71');
  applyInputs(wm, chip, { S1:0, S2:0, S3:0, R1:0, R2:0, R3:0, CLK:0, PRE:0, CLR:1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q'))), '74L71 PRE=LOW → Q=1');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74L71');
  applyInputs(wm2, c2, { S1:0, S2:0, S3:0, R1:0, R2:0, R3:0, CLK:0, PRE:1, CLR:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Q'))), '74L71 CLR=LOW → Q=0');
}

// G7: 74x77 - 4 bit bistable latch
console.log('\nG7: 74x77 - 4 bit latch');
{
  const { world, chip, wm } = setupChipWithPower('7477');
  applyInputs(wm, chip, { '1D':1, '2D':0, '3D':1, '4D':0, E:1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '7477 E=1, D1=1 → Q1=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))), '7477 E=1, D2=0 → Q2=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '3Q'))), '7477 E=1, D3=1 → Q3=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, '4Q'))), '7477 E=1, D4=0 → Q4=0');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('7477');
  applyInputs(wm2, c2, { '1D':0, '2D':0, '3D':0, '4D':0, E:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '1Q'))), '7477 E=0 → Q holds at 0');
}

// G8: 74H78, 74L78, 74LS78 - Dual JK FF shared CLK+CLR
console.log('\nG8: 74H78/74L78/74LS78 - Dual JK FF (shared CLK/CLR)');
{
  for (const id of ['74H78', '74L78', '74LS78']) {
    const { world, chip, wm } = setupChipWithPower(id);
    applyInputs(wm, chip, { '1J':0, '1K':0, 'CLK':0, '1PRE':0, 'CLR':1 });
    const sim = simulate(world, chip, wm);
    assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), `${id} 1PRE=LOW → 1Q=1`);
    const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower(id);
    applyInputs(wm2, c2, { '1J':0, '1K':0, 'CLK':0, '1PRE':1, 'CLR':0 });
    const sim2 = simulate(w2, c2, wm2);
    assert(isLow(getPinVoltage(sim2, findPin(c2, '1Q'))), `${id} CLR=LOW → 1Q=0`);
    const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower(id);
    applyInputs(wm3, c3, { '2J':0, '2K':0, 'CLK':0, '2PRE':0, 'CLR':1 });
    const sim3 = simulate(w3, c3, wm3);
    assert(isHigh(getPinVoltage(sim3, findPin(c3, '2Q'))), `${id} 2PRE=LOW → 2Q=1`);
  }

  // 74LS78 is the negative-edge member of the family.
  {
    const world = new BreadboardWorld(1, 1);
    const chip = new ChipComponent('74LS78');
    chip.place(0, 0, 10, 4);

    const wm0 = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm0, findPin(chip, 'VCC'));
    wirePinToGnd(wm0, findPin(chip, 'GND'));
    applyInputs(wm0, chip, { '1J':1, '1K':0, 'CLK':0, '1PRE':1, 'CLR':1 });
    simulate(world, chip, wm0);

    const wm1 = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm1, findPin(chip, 'VCC'));
    wirePinToGnd(wm1, findPin(chip, 'GND'));
    applyInputs(wm1, chip, { '1J':1, '1K':0, 'CLK':1, '1PRE':1, 'CLR':1 });
    const simRise = simulate(world, chip, wm1);
    assert(isLow(getPinVoltage(simRise, findPin(chip, '1Q'))), '74LS78 rising edge alone does not set 1Q');

    const wm2 = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm2, findPin(chip, 'VCC'));
    wirePinToGnd(wm2, findPin(chip, 'GND'));
    applyInputs(wm2, chip, { '1J':1, '1K':0, 'CLK':0, '1PRE':1, 'CLR':1 });
    const simFall = simulate(world, chip, wm2);
    assert(isHigh(getPinVoltage(simFall, findPin(chip, '1Q'))), '74LS78 falling edge sets 1Q when J=1 and K=0');
  }
}

// G9: 74x79 - Dual D FF
console.log('\nG9: 74x79 - Dual D FF');
{
  const { world, chip, wm } = setupChipWithPower('7479');
  applyInputs(wm, chip, { '1D':0, '1CLK':0, '1PRE':0, '1CLR':1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))), '7479 1PRE=LOW → 1Q=1');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('7479');
  applyInputs(wm2, c2, { '1D':0, '1CLK':0, '1PRE':1, '1CLR':0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, '1Q'))), '7479 1CLR=LOW → 1Q=0');
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('7479');
  applyInputs(wm3, c3, { '2D':0, '2CLK':0, '2PRE':0, '2CLR':1 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isHigh(getPinVoltage(sim3, findPin(c3, '2Q'))), '7479 2PRE=LOW → 2Q=1');
}

// G10: 74x80 - Gated full adder
console.log('\nG10: 74x80 - Gated full adder');
{
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('7480');
  applyInputs(wm1, c1, { A:0, B:0, CIN:0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'SUM'))), '7480 0+0+0: SUM=0');
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'COUT'))), '7480 0+0+0: COUT=0');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('7480');
  applyInputs(wm2, c2, { A:1, B:0, CIN:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(c2, 'SUM'))), '7480 1+0+0: SUM=1');
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'COUT'))), '7480 1+0+0: COUT=0');
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('7480');
  applyInputs(wm3, c3, { A:1, B:1, CIN:0 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, 'SUM'))), '7480 1+1+0: SUM=0');
  assert(isHigh(getPinVoltage(sim3, findPin(c3, 'COUT'))), '7480 1+1+0: COUT=1');
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('7480');
  applyInputs(wm4, c4, { A:1, B:1, CIN:1 });
  const sim4 = simulate(w4, c4, wm4);
  assert(isHigh(getPinVoltage(sim4, findPin(c4, 'SUM'))), '7480 1+1+1: SUM=1');
  assert(isHigh(getPinVoltage(sim4, findPin(c4, 'COUT'))), '7480 1+1+1: COUT=1');
}

// G11: 74x81 - 16x1 RAM
console.log('\nG11: 74x81 - 16x1 bit RAM');
{
  // Write 1 to address 3, then read it back using fresh WireManagers
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('7481');
  chip.place(0, 0, 10, 4);
  // Write cycle
  {
    const wm = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm, findPin(chip, 'VCC'));
    wirePinToGnd(wm, findPin(chip, 'GND'));
    applyInputs(wm, chip, { A0:1, A1:1, A2:0, A3:0, DIN:1, DINn:0, CE:1, WE:1 });
    const sim1 = new CircuitSimulator();
    sim1.evaluate(world, [chip], wm);
  }
  // Read cycle at same address
  {
    const wm2 = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm2, findPin(chip, 'VCC'));
    wirePinToGnd(wm2, findPin(chip, 'GND'));
    applyInputs(wm2, chip, { A0:1, A1:1, A2:0, A3:0, DIN:0, DINn:0, CE:1, WE:0 });
    const sim2 = new CircuitSimulator();
    sim2.evaluate(world, [chip], wm2);
    assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q'))), '7481 write 1 to addr 3, read back Q=1');
  }
  // CE=0 → output disabled
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('7481');
  applyInputs(wm3, c3, { A0:0, A1:0, A2:0, A3:0, DIN:1, CE:0, WE:0 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, 'Q'))), '7481 CE=0 → Q=0');
}

// G12: 74x82 - 2 bit full adder
console.log('\nG12: 74x82 - 2 bit full adder');
{
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('7482');
  applyInputs(wm1, c1, { A1:1, A2:0, B1:0, B2:0, CIN:0 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isHigh(getPinVoltage(sim1, findPin(c1, 'SUM1'))), '7482 A=01+B=00: SUM1=1');
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'SUM2'))), '7482 A=01+B=00: SUM2=0');
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'COUT'))), '7482 A=01+B=00: COUT=0');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('7482');
  applyInputs(wm2, c2, { A1:1, A2:1, B1:1, B2:0, CIN:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'SUM1'))), '7482 A=11+B=01: SUM1=0');
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'SUM2'))), '7482 A=11+B=01: SUM2=0');
  assert(isHigh(getPinVoltage(sim2, findPin(c2, 'COUT'))), '7482 A=11+B=01: COUT=1');
}

// G13: 74x84 - 16x1 RAM (16-pin)
console.log('\nG13: 74x84 - 16x1 bit RAM (16-pin)');
{
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('7484');
  chip.place(0, 0, 10, 4);
  // Write 1 to address 2
  {
    const wm = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm, findPin(chip, 'VCC'));
    wirePinToGnd(wm, findPin(chip, 'GND'));
    applyInputs(wm, chip, { A0:0, A1:1, A2:0, A3:0, DIN:1, DINn:0, CE:1, WE:1 });
    const sim1 = new CircuitSimulator();
    sim1.evaluate(world, [chip], wm);
  }
  // Read back at same address
  {
    const wm2 = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm2, findPin(chip, 'VCC'));
    wirePinToGnd(wm2, findPin(chip, 'GND'));
    applyInputs(wm2, chip, { A0:0, A1:1, A2:0, A3:0, DIN:0, DINn:0, CE:1, WE:0 });
    const sim2 = new CircuitSimulator();
    sim2.evaluate(world, [chip], wm2);
    assert(isHigh(getPinVoltage(sim2, findPin(chip, 'Q'))), '7484 write 1 to addr 2, read back Q=1');
  }
  // CE=0 → output disabled
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('7484');
  applyInputs(wm2, c2, { A0:0, A1:0, A2:0, A3:0, DIN:0, CE:0, WE:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'Q'))), '7484 CE=0 → Q=0');
}

// G14: 74x87 - 4 bit TRUE/COMP/ZERO/ONE
console.log('\nG14: 74x87 - True/Complement/Zero/One element');
{
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('7487');
  applyInputs(wm1, c1, { S0:0, S1:0, A:1, B:1, C:1, D:1 });
  const sim1 = simulate(w1, c1, wm1);
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'QA'))), '7487 S=00, A=1 → QA=0 (zero)');
  assert(isLow(getPinVoltage(sim1, findPin(c1, 'QB'))), '7487 S=00, B=1 → QB=0 (zero)');
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('7487');
  applyInputs(wm2, c2, { S0:1, S1:0, A:1, B:0, C:1, D:0 });
  const sim2 = simulate(w2, c2, wm2);
  assert(isHigh(getPinVoltage(sim2, findPin(c2, 'QA'))), '7487 S=01, A=1 → QA=1 (true)');
  assert(isLow(getPinVoltage(sim2, findPin(c2, 'QB'))), '7487 S=01, B=0 → QB=0 (true)');
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('7487');
  applyInputs(wm3, c3, { S0:0, S1:1, A:1, B:0, C:1, D:0 });
  const sim3 = simulate(w3, c3, wm3);
  assert(isLow(getPinVoltage(sim3, findPin(c3, 'QA'))), '7487 S=10, A=1 → QA=0 (comp)');
  assert(isHigh(getPinVoltage(sim3, findPin(c3, 'QB'))), '7487 S=10, B=0 → QB=1 (comp)');
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('7487');
  applyInputs(wm4, c4, { S0:1, S1:1, A:0, B:0, C:0, D:0 });
  const sim4 = simulate(w4, c4, wm4);
  assert(isHigh(getPinVoltage(sim4, findPin(c4, 'QA'))), '7487 S=11, A=0 → QA=1 (one)');
  assert(isHigh(getPinVoltage(sim4, findPin(c4, 'QD'))), '7487 S=11, D=0 → QD=1 (one)');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${pass + fail} tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
