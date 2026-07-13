// test-chips13.mjs - Tests for all chips defined in js/chips/chips13.js

import { CHIPS_BLOCK_13 } from '../chips/chips13.js';
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

// Rising edge helper
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

// Falling edge helper (for 74176/74177 which count on falling edges)
function fallingEdge(world, chip, clkPinName, otherPins) {
  const wm1 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm1, findPin(chip, 'VCC'));
  wirePinToGnd(wm1, findPin(chip, 'GND'));
  applyInputs(wm1, chip, { ...otherPins, [clkPinName]: 1 });
  new CircuitSimulator().evaluate(world, [chip], wm1);

  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(chip, 'VCC'));
  wirePinToGnd(wm2, findPin(chip, 'GND'));
  applyInputs(wm2, chip, { ...otherPins, [clkPinName]: 0 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm2);
  return { sim, wm: wm2 };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x166', '74x167', '74x168', '74x169', '74x170', '74x171', '74x172',
  '74x176', '74x177', '74x178', '74x179', '74x180', '74x181', '74x182', '74x183', '74x184',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_13');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_13, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_13).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_13 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_13).length})`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_13)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id} has field '${f}'`);
    }
  }
}

console.log('\nS3: VCC/GND pins exist on every chip');
for (const [id, def] of Object.entries(CHIPS_BLOCK_13)) {
  const pinNames = def.pinout.map(p => p.name);
  assert(pinNames.includes('VCC'), `${id} has VCC pin`);
  assert(pinNames.includes('GND'), `${id} has GND pin`);
}

// ─────────────────────────────────────────────────────────────────────────────
// G1: 74166 - 8 bit Parallel In Serial Out Shift Register
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG1: 74166 - 8 bit PISO Shift Register');
{
  // CLR=0 → QH=LOW (async clear)
  const { world, chip, wm } = setupChipWithPower('74x166');
  applyInputs(wm, chip, { CLK:0, CLR:0, SHLD:0, SER:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0, CLK_EN:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QH'))), '74166: CLR=0 → QH=LOW');
}
{
  // Parallel load H=1 (SHLD=0, CLK_EN=0) → H is bit7 → QH=HIGH
  const { world, chip } = setupChipWithPower('74x166');
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, SHLD:0, SER:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:1, CLK_EN:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QH'))), '74166: parallel load H=1 → QH=HIGH');
}
{
  // Parallel load H=0 → QH=LOW
  const { world, chip } = setupChipWithPower('74x166');
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, SHLD:0, SER:0, A:1, B:1, C:1, D:1, E:1, F:1, G:1, H:0, CLK_EN:0 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QH'))), '74166: parallel load H=0 → QH=LOW');
}
{
  // CLK_EN=1 inhibits clock: H=1 but no load → QH stays LOW
  const { world, chip } = setupChipWithPower('74x166');
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, SHLD:0, SER:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:1, CLK_EN:1 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QH'))), '74166: CLK_EN=1 inhibits clock → QH unchanged (LOW)');
}
{
  // Load all 1s, then shift 8 times with SER=0 → reg empties → QH=LOW
  const { world, chip } = setupChipWithPower('74x166');
  clockEdge(world, chip, 'CLK',
    { CLR:1, SHLD:0, SER:0, A:1, B:1, C:1, D:1, E:1, F:1, G:1, H:1, CLK_EN:0 });
  let lastResult;
  for (let i = 0; i < 8; i++) {
    lastResult = clockEdge(world, chip, 'CLK',
      { CLR:1, SHLD:1, SER:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0, CLK_EN:0 });
  }
  assert(isLow(getPinVoltage(lastResult.sim, findPin(chip, 'QH'))),
    '74166: 8 shifts with SER=0 after full load → QH=LOW');
}
{
  // Load all 0s, shift 8 times with SER=1 → reg fills → QH=HIGH
  const { world, chip } = setupChipWithPower('74x166');
  clockEdge(world, chip, 'CLK',
    { CLR:1, SHLD:0, SER:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0, CLK_EN:0 });
  let lastResult;
  for (let i = 0; i < 8; i++) {
    lastResult = clockEdge(world, chip, 'CLK',
      { CLR:1, SHLD:1, SER:1, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0, CLK_EN:0 });
  }
  assert(isHigh(getPinVoltage(lastResult.sim, findPin(chip, 'QH'))),
    '74166: 8 shifts with SER=1 → QH=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G2: 74167 - Decade Rate Multiplier
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG2: 74167 - Decade Rate Multiplier');
{
  // CLR=0 → count=0, rate=0. ENP=1,ENT=1 → Z=LOW (count==rate)
  const { world, chip, wm } = setupChipWithPower('74x167');
  applyInputs(wm, chip, { CLK:0, CLR:0, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Z'))), '74167: CLR=0, count=rate=0, enabled → Z=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y'))), '74167: ENT=1 → Y=HIGH');
}
{
  // Load rate=3 (A=1,B=1,C=0,D=0), then count 3 times → Z=LOW
  const { world, chip } = setupChipWithPower('74x167');
  clockEdge(world, chip, 'CLK', { CLR:1, LOAD:0, ENP:1, ENT:1, A:1, B:1, C:0, D:0 });
  let r;
  for (let i = 0; i < 3; i++) {
    r = clockEdge(world, chip, 'CLK', { CLR:1, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
  }
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'Z'))),
    '74167: rate=3, after 3 counts → Z=LOW');
}
{
  // Count 9 times from CLR → RCO=LOW (ENT=1, count=9)
  const { world, chip } = setupChipWithPower('74x167');
  // Apply CLR first
  {
    const wm0 = new WireManager(); resetWireCounter();
    wirePinToVcc(wm0, findPin(chip, 'VCC'));
    wirePinToGnd(wm0, findPin(chip, 'GND'));
    applyInputs(wm0, chip, { CLK:0, CLR:0, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
    new CircuitSimulator().evaluate(world, [chip], wm0);
  }
  let r;
  for (let i = 0; i < 9; i++) {
    r = clockEdge(world, chip, 'CLK', { CLR:1, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
  }
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'RCO'))),
    '74167: count=9, ENT=1 → RCO=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G3: 74168 - Synchronous Up/Down Decade Counter
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG3: 74168 - Synchronous Up/Down Decade Counter');
{
  // Count up 9 times from 0 → count=9, RCO=LOW
  const { world, chip } = setupChipWithPower('74x168');
  let r;
  for (let i = 0; i < 9; i++) {
    r = clockEdge(world, chip, 'CLK', { UD:1, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
  }
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'RCO'))), '74168: count=9, up → RCO=LOW');
  // 9 = 0b1001: QA=1, QB=0, QC=0, QD=1
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QA'))), '74168: count=9 → QA=HIGH');
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QB'))),  '74168: count=9 → QB=LOW');
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QC'))),  '74168: count=9 → QC=LOW');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QD'))), '74168: count=9 → QD=HIGH');
}
{
  // Load 5 (A=1,B=0,C=1,D=0), count down 5 → count=0, RCO=LOW
  const { world, chip } = setupChipWithPower('74x168');
  clockEdge(world, chip, 'CLK', { UD:0, LOAD:0, ENP:1, ENT:1, A:1, B:0, C:1, D:0 });
  let r;
  for (let i = 0; i < 5; i++) {
    r = clockEdge(world, chip, 'CLK', { UD:0, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
  }
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'RCO'))),
    '74168: load 5, count down 5 → count=0, RCO=LOW');
}
{
  // ENP=0 → no count
  const { world, chip } = setupChipWithPower('74x168');
  let r;
  for (let i = 0; i < 5; i++) {
    r = clockEdge(world, chip, 'CLK', { UD:1, LOAD:1, ENP:0, ENT:1, A:0, B:0, C:0, D:0 });
  }
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QA'))), '74168: ENP=0 → no count → QA=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G4: 74169 - Synchronous Up/Down Binary Counter
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG4: 74169 - Synchronous Up/Down Binary Counter');
{
  // Count up 15 times → count=15=0xF, RCO=LOW
  const { world, chip } = setupChipWithPower('74x169');
  let r;
  for (let i = 0; i < 15; i++) {
    r = clockEdge(world, chip, 'CLK', { UD:1, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
  }
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'RCO'))), '74169: count=15 (up) → RCO=LOW');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QA'))), '74169: count=15 → QA=HIGH');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QB'))), '74169: count=15 → QB=HIGH');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QC'))), '74169: count=15 → QC=HIGH');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QD'))), '74169: count=15 → QD=HIGH');
}
{
  // Load 3 (A=1,B=1,C=0,D=0), count down 3 → count=0, RCO=LOW
  const { world, chip } = setupChipWithPower('74x169');
  clockEdge(world, chip, 'CLK', { UD:0, LOAD:0, ENP:1, ENT:1, A:1, B:1, C:0, D:0 });
  let r;
  for (let i = 0; i < 3; i++) {
    r = clockEdge(world, chip, 'CLK', { UD:0, LOAD:1, ENP:1, ENT:1, A:0, B:0, C:0, D:0 });
  }
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'RCO'))),
    '74169: load 3, count down 3 → count=0, RCO=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G5: 74170 - 4x4 Open Collector Register File
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG5: 74170 - 4x4 OC Register File');
{
  // Write 0b1010 (D1=0,D2=1,D3=0,D4=1) to addr WA=1 (WA1=1,WA2=0)
  // Read from RA=1 (RA1=1,RA2=0), RE=0
  const { world, chip, wm } = setupChipWithPower('74x170');
  applyInputs(wm, chip, { D1:0, D2:1, D3:0, D4:1, WA1:1, WA2:0, WE:0, RA1:1, RA2:0, RE:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q1'))),  '74170: write 0b1010 addr=1, Q1=LOW (bit0=0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q2'))), '74170: Q2=HIGH (bit1=1, OC pull up)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q3'))),  '74170: Q3=LOW (bit2=0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q4'))), '74170: Q4=HIGH (bit3=1, OC pull up)');
}
{
  // RE=1 → outputs HIGH_Z → OC pull up → isHigh
  const { world, chip, wm } = setupChipWithPower('74x170');
  applyInputs(wm, chip, { D1:0, D2:0, D3:0, D4:0, WA1:0, WA2:0, WE:1, RA1:0, RA2:0, RE:1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q1'))), '74170: RE=1 → Q1=HIGH (OC pull up)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q4'))), '74170: RE=1 → Q4=HIGH (OC pull up)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G6: 74171 - Quad D Flip Flop with CLR
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG6: 74171 - Quad D Flip Flop (CLR)');
{
  // CLR=0 → all Q=LOW, Qn=HIGH
  const { world, chip, wm } = setupChipWithPower('74x171');
  applyInputs(wm, chip, { CLK:0, CLR:0, '1D':1, '2D':1, '3D':1, '4D':1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Q'))),   '74171: CLR=0 → 1Q=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Qn'))), '74171: CLR=0 → 1Qn=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '4Q'))),   '74171: CLR=0 → 4Q=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '4Qn'))), '74171: CLR=0 → 4Qn=HIGH');
}
{
  // Rising CLK captures D
  const { world, chip } = setupChipWithPower('74x171');
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, '1D':1, '2D':0, '3D':1, '4D':0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Q'))),  '74171: 1D=1 → 1Q=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Q'))),   '74171: 2D=0 → 2Q=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '3Q'))),  '74171: 3D=1 → 3Q=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '4Q'))),   '74171: 4D=0 → 4Q=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Qn'))),  '74171: 1D=1 → 1Qn=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Qn'))), '74171: 2D=0 → 2Qn=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G7: 74172 - 8x2 Multi-Port Register File (3-state)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG7: 74172 - 8x2 Multi-Port Register File');
{
  // Write D1=1,D2=1 to addr WA=5 (WA1=1,WA2=0,WA3=1), read RA=5, OE=0
  const { world, chip, wm } = setupChipWithPower('74x172');
  applyInputs(wm, chip, {
    D1:1, D2:1, WA1:1, WA2:0, WA3:1, WE:0,
    RA1:1, RA2:0, RA3:1, OE:0,
    NC1:0, NC2:0, NC3:0, NC4:0, NC5:0, NC6:0, NC7:0, NC8:0, NC9:0, NC10:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y1'))), '74172: write D1=1 addr=5, read → Y1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74172: write D2=1 addr=5, read → Y2=HIGH');
}
{
  // OE=1 → outputs HIGH_Z → non-OC → isLow
  const { world, chip, wm } = setupChipWithPower('74x172');
  applyInputs(wm, chip, {
    D1:1, D2:1, WA1:0, WA2:0, WA3:0, WE:1,
    RA1:0, RA2:0, RA3:0, OE:1,
    NC1:0, NC2:0, NC3:0, NC4:0, NC5:0, NC6:0, NC7:0, NC8:0, NC9:0, NC10:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y1'))), '74172: OE=1 → Y1 HIGH_Z (isLow, non-OC)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y2'))), '74172: OE=1 → Y2 HIGH_Z (isLow, non-OC)');
}
{
  // Write 0b01 (D1=1,D2=0) to addr 2, verify Y1=HIGH,Y2=LOW at read
  const { world, chip, wm } = setupChipWithPower('74x172');
  applyInputs(wm, chip, {
    D1:1, D2:0, WA1:0, WA2:1, WA3:0, WE:0,
    RA1:0, RA2:1, RA3:0, OE:0,
    NC1:0, NC2:0, NC3:0, NC4:0, NC5:0, NC6:0, NC7:0, NC8:0, NC9:0, NC10:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y1'))), '74172: D1=1,D2=0 addr=2 → Y1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y2'))),  '74172: D1=1,D2=0 addr=2 → Y2=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G8: 74176 - Presettable Bi Quinary Decade Counter (falling edge)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG8: 74176 - Presettable Bi Quinary Counter');
{
  // CLR=0 → all outputs LOW (async clear)
  const { world, chip, wm } = setupChipWithPower('74x176');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:0, LOAD:1, A:0, B:0, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74176: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))), '74176: CLR=0 → QB=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QC'))), '74176: CLR=0 → QC=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '74176: CLR=0 → QD=LOW');
}
{
  // LOAD=0 (async preset): B=1,C=0,D=0 → cnt5=1 → QB=HIGH
  const { world, chip, wm } = setupChipWithPower('74x176');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:1, LOAD:0, A:0, B:1, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QB'))), '74176: LOAD=0, B=1 → QB=HIGH (cnt5=1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QC'))),  '74176: LOAD=0, C=0 → QC=LOW');
}
{
  // Falling CLK1 toggles QA
  const { world, chip } = setupChipWithPower('74x176');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK2:0 };
  const { sim: s1 } = fallingEdge(world, chip, 'CLK1', base);
  assert(isHigh(getPinVoltage(s1, findPin(chip, 'QA'))), '74176: 1st falling CLK1 → QA toggles HIGH');
  const { sim: s2 } = fallingEdge(world, chip, 'CLK1', base);
  assert(isLow(getPinVoltage(s2, findPin(chip, 'QA'))),  '74176: 2nd falling CLK1 → QA toggles LOW');
}
{
  // Falling CLK2 advances cnt5; after 5 → wraps to 0
  const { world, chip } = setupChipWithPower('74x176');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK1:0 };
  const { sim: s1 } = fallingEdge(world, chip, 'CLK2', base);
  assert(isHigh(getPinVoltage(s1, findPin(chip, 'QB'))), '74176: CLK2 fall 1 → QB=HIGH (cnt5=1)');
  assert(isLow(getPinVoltage(s1, findPin(chip, 'QD'))),  '74176: CLK2 fall 1 → QD=LOW');
  // 4 more falls: cnt5 → 5 → 0 (wraps mod 5)
  let r;
  for (let i = 0; i < 4; i++) r = fallingEdge(world, chip, 'CLK2', base);
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QB'))), '74176: CLK2 fall 5 total → QB=LOW (cnt5=0)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G9: 74177 - Presettable Binary Counter (falling edge)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG9: 74177 - Presettable Binary Counter');
{
  // CLR=0 → all LOW
  const { world, chip, wm } = setupChipWithPower('74x177');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:0, LOAD:1, A:0, B:0, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74177: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '74177: CLR=0 → QD=LOW');
}
{
  // LOAD=0: preset A=1,B=0,C=1,D=0
  const { world, chip, wm } = setupChipWithPower('74x177');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:1, LOAD:0, A:1, B:0, C:1, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74177: preset A=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74177: preset B=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74177: preset C=1 → QC=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74177: preset D=0 → QD=LOW');
}
{
  // Falling CLK1: QA toggles
  const { world, chip } = setupChipWithPower('74x177');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK2:0 };
  const { sim: s1 } = fallingEdge(world, chip, 'CLK1', base);
  assert(isHigh(getPinVoltage(s1, findPin(chip, 'QA'))), '74177: 1st falling CLK1 → QA=HIGH');
}
{
  // Falling CLK2 7 times: cnt8=7 → QB=QC=QD=HIGH; 8th → cnt8=0
  const { world, chip } = setupChipWithPower('74x177');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK1:0 };
  let r;
  for (let i = 0; i < 7; i++) r = fallingEdge(world, chip, 'CLK2', base);
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QB'))), '74177: CLK2 fall 7 → QB=HIGH (cnt8=7)');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QC'))), '74177: CLK2 fall 7 → QC=HIGH');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QD'))), '74177: CLK2 fall 7 → QD=HIGH');
  r = fallingEdge(world, chip, 'CLK2', base);
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QB'))), '74177: CLK2 fall 8 → QB=LOW (cnt8=0)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G10: 74178 - 4 bit Parallel Access Shift Register (reuses SHIFT_REG_4BIT)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG10: 74178 - 4 bit Shift Register (PE=0/1)');
{
  // PE=1: parallel load on rising CLK (MODE=1 → CLK2 rising; CLK1=CLK2='CLK')
  const { world, chip } = setupChipWithPower('74x178');
  const { sim } = clockEdge(world, chip, 'CLK',
    { SER:0, A:1, B:0, C:1, D:0, PE:1, NC1:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74178: PE=1, A=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74178: PE=1, B=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74178: PE=1, C=1 → QC=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74178: PE=1, D=0 → QD=LOW');
}
{
  // PE=0: shift right SER→QA→QB→QC→QD
  const { world, chip } = setupChipWithPower('74x178');
  // Load all 0s first
  clockEdge(world, chip, 'CLK', { SER:0, A:0, B:0, C:0, D:0, PE:1, NC1:0 });
  // Shift SER=1 in twice
  let r = clockEdge(world, chip, 'CLK', { SER:1, A:0, B:0, C:0, D:0, PE:0, NC1:0 });
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QA'))), '74178: 1st shift SER=1 → QA=HIGH');
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QB'))),  '74178: 1st shift → QB=LOW');
  r = clockEdge(world, chip, 'CLK', { SER:1, A:0, B:0, C:0, D:0, PE:0, NC1:0 });
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QB'))), '74178: 2nd shift → QB=HIGH');
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QC'))),  '74178: 2nd shift → QC=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G11: 74179 - 4 bit Shift Register with CLR and QDn
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG11: 74179 - 4 bit Shift Reg (CLR, QDn)');
{
  // CLR=0 → all Q=LOW, QDn=HIGH
  const { world, chip, wm } = setupChipWithPower('74x179');
  applyInputs(wm, chip, { CLR:0, CLK:0, PE:0, SER:0, A:0, B:0, C:0, D:0, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))),  '74179: CLR=0 → QA=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QDn'))), '74179: CLR=0, QD=0 → QDn=HIGH');
}
{
  // PE=1: parallel load A=1,B=0,C=0,D=1 → QA=1, QD=1, QDn=LOW
  const { world, chip } = setupChipWithPower('74x179');
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, PE:1, SER:0, A:1, B:0, C:0, D:1, NC1:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))),  '74179: PE=1, A=1 → QA=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QD'))),  '74179: PE=1, D=1 → QD=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QDn'))),  '74179: QD=1 → QDn=LOW');
}
{
  // PE=0: shift 4x SER=1 → QD=1 (all bits filled), QDn=LOW
  const { world, chip } = setupChipWithPower('74x179');
  clockEdge(world, chip, 'CLK', { CLR:1, PE:1, SER:0, A:0, B:0, C:0, D:0, NC1:0 });
  let r;
  for (let i = 0; i < 4; i++) {
    r = clockEdge(world, chip, 'CLK', { CLR:1, PE:0, SER:1, A:0, B:0, C:0, D:0, NC1:0 });
  }
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QD'))),  '74179: 4 shifts SER=1 → QD=HIGH');
  assert(isLow(getPinVoltage(r.sim, findPin(chip, 'QDn'))),  '74179: QD=1 → QDn=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G12: 74180 - 9 bit Parity Generator/Checker
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG12: 74180 - 9 bit Parity Generator/Checker');
{
  // EVEN=1, ODD=0 (even mode), even parity (all 0s) → EVEN_OUT=HIGH, ODD_OUT=LOW
  const { world, chip, wm } = setupChipWithPower('74x180');
  applyInputs(wm, chip, { A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0, EVEN_IN:1, ODD_IN:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'EVEN_OUT'))),
    '74180: even parity, EVEN mode → EVEN_OUT=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'ODD_OUT'))),
    '74180: even parity, EVEN mode → ODD_OUT=LOW');
}
{
  // EVEN=1, ODD=0, A=1 (odd parity) → EVEN_OUT=LOW, ODD_OUT=HIGH
  const { world, chip, wm } = setupChipWithPower('74x180');
  applyInputs(wm, chip, { A:1,B:0,C:0,D:0,E:0,F:0,G:0,H:0, EVEN_IN:1, ODD_IN:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EVEN_OUT'))),
    '74180: odd parity, EVEN mode → EVEN_OUT=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'ODD_OUT'))),
    '74180: odd parity, EVEN mode → ODD_OUT=HIGH');
}
{
  // EVEN=0, ODD=1 (odd mode), even parity → EVEN_OUT=LOW, ODD_OUT=HIGH
  const { world, chip, wm } = setupChipWithPower('74x180');
  applyInputs(wm, chip, { A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0, EVEN_IN:0, ODD_IN:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EVEN_OUT'))),
    '74180: even parity, ODD mode → EVEN_OUT=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'ODD_OUT'))),
    '74180: even parity, ODD mode → ODD_OUT=HIGH');
}
{
  // EVEN=1, ODD=1 (both same = 1) → EVEN_OUT=LOW, ODD_OUT=LOW
  const { world, chip, wm } = setupChipWithPower('74x180');
  applyInputs(wm, chip, { A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0, EVEN_IN:1, ODD_IN:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EVEN_OUT'))),
    '74180: EVEN=ODD=1 → EVEN_OUT=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'ODD_OUT'))),
    '74180: EVEN=ODD=1 → ODD_OUT=LOW');
}
{
  // EVEN=0, ODD=0 (both same = 0) → EVEN_OUT=HIGH, ODD_OUT=HIGH
  const { world, chip, wm } = setupChipWithPower('74x180');
  applyInputs(wm, chip, { A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0, EVEN_IN:0, ODD_IN:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'EVEN_OUT'))),
    '74180: EVEN=ODD=0 → EVEN_OUT=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'ODD_OUT'))),
    '74180: EVEN=ODD=0 → ODD_OUT=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G13: 74181 - 4 bit ALU
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG13: 74181 - 4 bit ALU');
{
  // M=1, S=15 (0b1111): F=A (pass-through). A=5=0b0101 → F=5
  const { world, chip, wm } = setupChipWithPower('74x181');
  applyInputs(wm, chip, {
    A0:1,A1:0,A2:1,A3:0, B0:0,B1:0,B2:0,B3:0,
    S0:1,S1:1,S2:1,S3:1, M:1, Cn:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'F0'))), '74181: logic S=15 A=5 → F0=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'F1'))),  '74181: logic S=15 A=5 → F1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'F2'))), '74181: logic S=15 A=5 → F2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'F3'))),  '74181: logic S=15 A=5 → F3=LOW');
}
{
  // M=1, S=6 (0b0110): F=A XOR B. A=5=0b0101, B=3=0b0011 → F=6=0b0110
  const { world, chip, wm } = setupChipWithPower('74x181');
  applyInputs(wm, chip, {
    A0:1,A1:0,A2:1,A3:0, B0:1,B1:1,B2:0,B3:0,
    S0:0,S1:1,S2:1,S3:0, M:1, Cn:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'F0'))),  '74181: logic S=6 A=5 XOR B=3 → F0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'F1'))), '74181: logic S=6 A=5 XOR B=3 → F1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'F2'))), '74181: logic S=6 A=5 XOR B=3 → F2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'F3'))),  '74181: logic S=6 A=5 XOR B=3 → F3=LOW');
}
{
  // M=0, S=9 (0b1001): F=A+B+Cn. A=3, B=2, Cn=0 → F=5=0b0101, Cn4=0
  const { world, chip, wm } = setupChipWithPower('74x181');
  applyInputs(wm, chip, {
    A0:1,A1:1,A2:0,A3:0, B0:0,B1:1,B2:0,B3:0,
    S0:1,S1:0,S2:0,S3:1, M:0, Cn:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'F0'))), '74181: arith A=3+B=2 → F=5: F0=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'F1'))),  '74181: arith A=3+B=2 → F=5: F1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'F2'))), '74181: arith A=3+B=2 → F=5: F2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'F3'))),  '74181: arith A=3+B=2 → F=5: F3=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Cn4'))), '74181: 3+2 no overflow → Cn4=LOW');
}
{
  // Overflow: A=15, B=1, Cn=0, S=9 → raw=16, F=0, Cn4=1
  const { world, chip, wm } = setupChipWithPower('74x181');
  applyInputs(wm, chip, {
    A0:1,A1:1,A2:1,A3:1, B0:1,B1:0,B2:0,B3:0,
    S0:1,S1:0,S2:0,S3:1, M:0, Cn:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'F0'))),  '74181: A=15+B=1 → F=0: F0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Cn4'))), '74181: A=15+B=1 → overflow: Cn4=HIGH');
}
{
  // AeqB: M=1, S=15, A=0xF → F=0xF → AeqB=HIGH
  const { world, chip, wm } = setupChipWithPower('74x181');
  applyInputs(wm, chip, {
    A0:1,A1:1,A2:1,A3:1, B0:0,B1:0,B2:0,B3:0,
    S0:1,S1:1,S2:1,S3:1, M:1, Cn:0,
  });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'AeqB'))),
    '74181: M=1 S=15 A=0xF → F=0xF → AeqB=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G14: 74182 - Lookahead Carry Generator
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG14: 74182 - Lookahead Carry Generator');
{
  // G0=1 → Cn_x=1 (generate, regardless of Cn)
  const { world, chip, wm } = setupChipWithPower('74x182');
  applyInputs(wm, chip, { P0:0,G0:1, P1:0,G1:0, P2:0,G2:0, P3:0,G3:0, Cn:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Cn_x'))), '74182: G0=1 → Cn_x=HIGH');
}
{
  // P0=1, Cn=1 → Cn_x=P0&Cn=1 (propagate carry)
  const { world, chip, wm } = setupChipWithPower('74x182');
  applyInputs(wm, chip, { P0:1,G0:0, P1:0,G1:0, P2:0,G2:0, P3:0,G3:0, Cn:1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Cn_x'))), '74182: P0=1 Cn=1 → Cn_x=HIGH');
}
{
  // Cn_y: G0=1→Cn_x=1, P1=1 → Cn_y=P1&Cn_x=1
  const { world, chip, wm } = setupChipWithPower('74x182');
  applyInputs(wm, chip, { P0:0,G0:1, P1:1,G1:0, P2:0,G2:0, P3:0,G3:0, Cn:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Cn_y'))), '74182: G0=1→Cn_x=1, P1=1 → Cn_y=HIGH');
}
{
  // P_grp: all P=1 → P=1
  const { world, chip, wm } = setupChipWithPower('74x182');
  applyInputs(wm, chip, { P0:1,G0:0, P1:1,G1:0, P2:1,G2:0, P3:1,G3:0, Cn:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'P'))), '74182: all P=1 → P_grp=HIGH');
}
{
  // G_grp: G3=1 → G=1
  const { world, chip, wm } = setupChipWithPower('74x182');
  applyInputs(wm, chip, { P0:0,G0:0, P1:0,G1:0, P2:0,G2:0, P3:0,G3:1, Cn:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'G'))), '74182: G3=1 → G_grp=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G15: 74183 - Dual Full Adder
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG15: 74183 - Dual Full Adder');
{
  // Adder 1: 1+1+1=3 → S1=1, C1out=1
  // Adder 2: 0+1+0=1 → S2=1, C2out=0
  const { world, chip, wm } = setupChipWithPower('74x183');
  applyInputs(wm, chip, { A1:1, B1:1, C1in:1, A2:0, B2:1, C2in:0, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'S1'))),    '74183: 1+1+1=3 → S1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'C1out'))), '74183: 1+1+1=3 → C1out=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'S2'))),    '74183: 0+1+0=1 → S2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'C2out'))),  '74183: 0+1+0=1 → C2out=LOW');
}
{
  // Adder 1: 1+1+0=2 → S1=0, C1out=1
  // Adder 2: 1+1+1=3 → S2=1, C2out=1
  const { world, chip, wm } = setupChipWithPower('74x183');
  applyInputs(wm, chip, { A1:1, B1:1, C1in:0, A2:1, B2:1, C2in:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'S1'))),     '74183: 1+1+0=2 → S1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'C1out'))), '74183: 1+1+0=2 → C1out=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'S2'))),    '74183: 1+1+1=3 → S2=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'C2out'))), '74183: 1+1+1=3 → C2out=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G16: 74184 - BCD to Binary Converter (OC)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG16: 74184 - BCD to Binary Converter (OC)');
{
  // G=1 → all HIGH_Z → OC pull up → isHigh
  const { world, chip, wm } = setupChipWithPower('74x184');
  applyInputs(wm, chip, { B1:0, B2:0, B3:0, B4:0, B5:0, G:1, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74184: G=1 → Y2=HIGH (OC pull up)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y8'))), '74184: G=1 → Y8=HIGH (OC pull up)');
}
{
  // G=0, B1=1: bcdVal=2. Y2=(2>>1)&1=1 (HIGH), Y3=(2>>2)&1=0 (LOW via OC sink)
  const { world, chip, wm } = setupChipWithPower('74x184');
  applyInputs(wm, chip, { B1:1, B2:0, B3:0, B4:0, B5:0, G:0, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74184: B1=1 bcdVal=2 → Y2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y3'))),  '74184: B1=1 bcdVal=2 → Y3=LOW');
}
{
  // G=0, B2=1: bcdVal=4. Y2=(4>>1)&1=0 (LOW), Y3=(4>>2)&1=1 (HIGH)
  const { world, chip, wm } = setupChipWithPower('74x184');
  applyInputs(wm, chip, { B1:0, B2:1, B3:0, B4:0, B5:0, G:0, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y2'))),  '74184: B2=1 bcdVal=4 → Y2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y3'))), '74184: B2=1 bcdVal=4 → Y3=HIGH');
}
{
  // G=0, B3=1: bcdVal=8. Y4=(8>>3)&1=1 (HIGH), Y2=Y3=0 (LOW)
  const { world, chip, wm } = setupChipWithPower('74x184');
  applyInputs(wm, chip, { B1:0, B2:0, B3:1, B4:0, B5:0, G:0, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y2'))),  '74184: B3=1 bcdVal=8 → Y2=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y3'))),  '74184: B3=1 bcdVal=8 → Y3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y4'))), '74184: B3=1 bcdVal=8 → Y4=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n--- Results: ${pass} passed, ${fail} failed ---`);
if (fail > 0) process.exit(1);
