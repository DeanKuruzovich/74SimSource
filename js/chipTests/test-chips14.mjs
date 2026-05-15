// test-chips14.mjs - Tests for all chips defined in js/chips/chips14.js

import { CHIPS_BLOCK_14 } from '../chips/chips14.js';
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

// Falling edge helper (for 74196/74197 which count on falling edges)
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
  '74185', '74189', '74190', '74192',
  '74194', '74195', '74196', '74197', '74198', '74199', '74200', '74201', '74202',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_14');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_14, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_14).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_14 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_14).length})`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_14)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id} has field '${f}'`);
    }
  }
}

console.log('\nS3: VCC/GND pins exist on every chip');
for (const [id, def] of Object.entries(CHIPS_BLOCK_14)) {
  const pinNames = def.pinout.map(p => p.name);
  assert(pinNames.includes('VCC'), `${id} has VCC pin`);
  assert(pinNames.includes('GND'), `${id} has GND pin`);
}

// ─────────────────────────────────────────────────────────────────────────────
// G1: 74185 - 6 bit Binary-to-BCD Converter (OC)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG1: 74185 - Binary-to-BCD Converter');
{
  // G=1 → all outputs HiZ → OC pull up → HIGH
  const { world, chip, wm } = setupChipWithPower('74185');
  applyInputs(wm, chip, { G:1, B1:0, B2:0, B3:0, B4:0, B5:0, B6:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74185: G=1 → Y2=HIGH (OC pull up)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y8'))), '74185: G=1 → Y8=HIGH (OC pull up)');
}
{
  // G=0, B1-B6=0 → binVal=0 → BCD=0x00 → all Y=0 → OC sinks → LOW
  const { world, chip, wm } = setupChipWithPower('74185');
  applyInputs(wm, chip, { G:0, B1:0, B2:0, B3:0, B4:0, B5:0, B6:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y2'))), '74185: G=0, 0 → Y2=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y8'))), '74185: G=0, 0 → Y8=LOW');
}
{
  // G=0, B1=1 (binVal=1) → BCD=0x01 → bit0=1→Y2=HIGH; bits 1-6=0→Y3-Y8=LOW
  const { world, chip, wm } = setupChipWithPower('74185');
  applyInputs(wm, chip, { G:0, B1:1, B2:0, B3:0, B4:0, B5:0, B6:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74185: binVal=1 → Y2=HIGH (bit0=1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y3'))),  '74185: binVal=1 → Y3=LOW (bit1=0)');
}
{
  // G=0, binVal=25 (B1=1,B2:0,B3=0,B4=1,B5=1,B6=0 → 1+8+16=25)
  // BCD: tens=2(0010), units=5(0101) → packed=0x25=0b00100101
  // Y2=bit0=1, Y3=bit1=0, Y4=bit2=1, Y5=bit3=0, Y6=bit4=0, Y7=bit5=1, Y8=bit6=0
  const { world, chip, wm } = setupChipWithPower('74185');
  applyInputs(wm, chip, { G:0, B1:1, B2:0, B3:0, B4:1, B5:1, B6:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74185: binVal=25 → Y2=HIGH (bit0=1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y3'))),  '74185: binVal=25 → Y3=LOW (bit1=0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y4'))), '74185: binVal=25 → Y4=HIGH (bit2=1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y5'))),  '74185: binVal=25 → Y5=LOW (bit3=0)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y6'))),  '74185: binVal=25 → Y6=LOW (bit4=0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y7'))), '74185: binVal=25 → Y7=HIGH (bit5=1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y8'))),  '74185: binVal=25 → Y8=LOW (bit6=0)');
}
{
  // binVal=9 → BCD=0x09 → bits 0,3 set: Y2=1 Y3=0 Y4=0 Y5=1 Y6-Y8=0
  const { world, chip, wm } = setupChipWithPower('74185');
  applyInputs(wm, chip, { G:0, B1:1, B2:0, B3:0, B4:1, B5:0, B6:0 }); // 1+8=9
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74185: binVal=9 → Y2=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y5'))), '74185: binVal=9 → Y5=HIGH (units bit3=1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y6'))),  '74185: binVal=9 → Y6=LOW');
}

{
  const { world, chip, wm } = setupChipWithPower('74186');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, G1:0, G2:0,
    NC1:0, NC2:0, NC3:0, NC4:0, NC5:0, NC6:0 });
  const sim = simulate(world, chip, wm);
  for (let i = 0; i < 8; i++) {
    assert(isHigh(getPinVoltage(sim, findPin(chip, `Y${i}`))), `74186: Y${i}=HIGH (OC pull up)`);
  }
}
{
  // Even when disabled (G1=1)
  const { world, chip, wm } = setupChipWithPower('74186');
  applyInputs(wm, chip, { A0:1, A1:1, A2:0, A3:0, A4:0, A5:0, G1:1, G2:0,
    NC1:0, NC2:0, NC3:0, NC4:0, NC5:0, NC6:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74186: G1=1 → Y0=HIGH (OC)');
}

{
  const { world, chip, wm } = setupChipWithPower('74187');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0, G1:0, G2:0 });
  const sim = simulate(world, chip, wm);
  for (let i = 0; i < 4; i++) {
    assert(isHigh(getPinVoltage(sim, findPin(chip, `Y${i}`))), `74187: Y${i}=HIGH (OC pull up)`);
  }
}

{
  // CE=1 (disabled) → still HiZ → OC pull up → HIGH
  const { world, chip, wm } = setupChipWithPower('74188');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, CE:1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74188: CE=1 → Y0=HIGH (OC)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y7'))), '74188: CE=1 → Y7=HIGH (OC)');
}
{
  // CE=0 (enabled) - content unknown → HiZ → OC pull up → HIGH
  const { world, chip, wm } = setupChipWithPower('74188');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, CE:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74188: CE=0 → Y0=HIGH (OC stub)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G5: 74189 - 16×4 RAM with inverted outputs
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG5: 74189 - 16x4 RAM (inverted outputs)');
{
  // CS=1 → all outputs HiZ (non-OC) → isLow
  const { world, chip, wm } = setupChipWithPower('74189');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, D1:0, D2:0, D3:0, D4:0, CS:1, WE:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q1'))), '74189: CS=1 → Q1=HiZ (isLow)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q4'))), '74189: CS=1 → Q4=HiZ (isLow)');
}
{
  // Write D1=1,D2=0,D3=1,D4=0 to addr 0; then read → Q1=0(inv 1),Q2=1(inv 0),Q3=0(inv 1),Q4=1(inv 0)
  const { world, chip } = setupChipWithPower('74189');
  // Write phase
  const wmW = new WireManager(); resetWireCounter();
  wirePinToVcc(wmW, findPin(chip, 'VCC'));
  wirePinToGnd(wmW, findPin(chip, 'GND'));
  applyInputs(wmW, chip, { A0:0, A1:0, A2:0, A3:0, D1:1, D2:0, D3:1, D4:0, CS:0, WE:0 });
  new CircuitSimulator().evaluate(world, [chip], wmW);
  // Read phase (WE=1)
  const wmR = new WireManager(); resetWireCounter();
  wirePinToVcc(wmR, findPin(chip, 'VCC'));
  wirePinToGnd(wmR, findPin(chip, 'GND'));
  applyInputs(wmR, chip, { A0:0, A1:0, A2:0, A3:0, D1:0, D2:0, D3:0, D4:0, CS:0, WE:1 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q1'))),  '74189: read D1=1 → Q1=LOW (inverted)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q2'))), '74189: read D2=0 → Q2=HIGH (inverted)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q3'))),  '74189: read D3=1 → Q3=LOW (inverted)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q4'))), '74189: read D4=0 → Q4=HIGH (inverted)');
}
{
  // Write to addr 5, read back
  const { world, chip } = setupChipWithPower('74189');
  const wmW = new WireManager(); resetWireCounter();
  wirePinToVcc(wmW, findPin(chip, 'VCC'));
  wirePinToGnd(wmW, findPin(chip, 'GND'));
  applyInputs(wmW, chip, { A0:1, A1:0, A2:1, A3:0, D1:0, D2:1, D3:0, D4:1, CS:0, WE:0 }); // addr=5=0101
  new CircuitSimulator().evaluate(world, [chip], wmW);
  const wmR = new WireManager(); resetWireCounter();
  wirePinToVcc(wmR, findPin(chip, 'VCC'));
  wirePinToGnd(wmR, findPin(chip, 'GND'));
  applyInputs(wmR, chip, { A0:1, A1:0, A2:1, A3:0, D1:0, D2:0, D3:0, D4:0, CS:0, WE:1 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q1'))), '74189: addr5 D1=0 → Q1=HIGH (inv)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q2'))),  '74189: addr5 D2=1 → Q2=LOW (inv)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G6: 74190 - Synchronous Up/Down Decade Counter (single clock)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG6: 74190 - Sync Up/Down Decade Counter');
{
  // LOAD=0 (async preset): A=1,B=1,C=0,D=0 → count=3
  const { world, chip, wm } = setupChipWithPower('74190');
  applyInputs(wm, chip, { CLK:0, UD:0, CTEN:0, LOAD:0, A:1, B:1, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74190: LOAD=0, A=1 → QA=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QB'))), '74190: LOAD=0, B=1 → QB=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QC'))),  '74190: LOAD=0, C=0 → QC=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74190: LOAD=0, D=0 → QD=LOW');
}
{
  // Count up: preset to 8, 1 clock → count=9 (terminal for up)
  const { world, chip } = setupChipWithPower('74190');
  // Preset to 8 (A=0,B=0,C=0,D=1)
  const wmP = new WireManager(); resetWireCounter();
  wirePinToVcc(wmP, findPin(chip, 'VCC'));
  wirePinToGnd(wmP, findPin(chip, 'GND'));
  applyInputs(wmP, chip, { CLK:0, UD:0, CTEN:0, LOAD:0, A:0, B:0, C:0, D:1 });
  new CircuitSimulator().evaluate(world, [chip], wmP);
  // Count up once (LOAD=1)
  const { sim } = clockEdge(world, chip, 'CLK', { UD:0, CTEN:0, LOAD:1, A:0, B:0, C:0, D:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74190: count=9 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74190: count=9 → QB=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QC'))),  '74190: count=9 → QC=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QD'))), '74190: count=9 → QD=HIGH');
  // MX_MN=HIGH at terminal up (count=9, CTEN=0)
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'MX_MN'))), '74190: count=9 up-terminal → MX_MN=HIGH');
  // RCO=LOW at terminal
  assert(isLow(getPinVoltage(sim, findPin(chip, 'RCO'))),    '74190: count=9 up-terminal → RCO=LOW');
}
{
  // Count up wraps: preset to 9, 1 more clock → count wraps to 0 → QA-QD=0
  const { world, chip } = setupChipWithPower('74190');
  const wmP = new WireManager(); resetWireCounter();
  wirePinToVcc(wmP, findPin(chip, 'VCC'));
  wirePinToGnd(wmP, findPin(chip, 'GND'));
  applyInputs(wmP, chip, { CLK:0, UD:0, CTEN:0, LOAD:0, A:1, B:0, C:0, D:1 }); // preset=9
  new CircuitSimulator().evaluate(world, [chip], wmP);
  const { sim } = clockEdge(world, chip, 'CLK', { UD:0, CTEN:0, LOAD:1, A:0, B:0, C:0, D:0 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74190: 9+1 → wraps to 0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '74190: 9+1 → wraps to 0 → QD=LOW');
}
{
  // Count down: preset to 1, 1 clock down → count=0 (terminal for down)
  const { world, chip } = setupChipWithPower('74190');
  const wmP = new WireManager(); resetWireCounter();
  wirePinToVcc(wmP, findPin(chip, 'VCC'));
  wirePinToGnd(wmP, findPin(chip, 'GND'));
  applyInputs(wmP, chip, { CLK:0, UD:1, CTEN:0, LOAD:0, A:1, B:0, C:0, D:0 }); // preset=1
  new CircuitSimulator().evaluate(world, [chip], wmP);
  const { sim } = clockEdge(world, chip, 'CLK', { UD:1, CTEN:0, LOAD:1, A:0, B:0, C:0, D:0 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))),     '74190: 1-1=0 → QA=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'MX_MN'))), '74190: count=0 down-terminal → MX_MN=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'RCO'))),    '74190: count=0 down-terminal → RCO=LOW');
}
{
  // CTEN=1 (disabled) → counting inhibited
  const { world, chip } = setupChipWithPower('74190');
  const wmP = new WireManager(); resetWireCounter();
  wirePinToVcc(wmP, findPin(chip, 'VCC'));
  wirePinToGnd(wmP, findPin(chip, 'GND'));
  applyInputs(wmP, chip, { CLK:0, UD:0, CTEN:1, LOAD:0, A:1, B:0, C:0, D:0 }); // preset=1
  new CircuitSimulator().evaluate(world, [chip], wmP);
  const { sim } = clockEdge(world, chip, 'CLK', { UD:0, CTEN:1, LOAD:1, A:0, B:0, C:0, D:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74190: CTEN=1 → counting inhibited, QA=1 still');
}

// ─────────────────────────────────────────────────────────────────────────────
// G7: 74192 - Synchronous BCD Up/Down Counter (dual clock)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG7: 74192 - BCD Up/Down Counter (dual clk)');
{
  // CLR=1 (active HIGH) → all outputs LOW
  const { world, chip, wm } = setupChipWithPower('74192');
  applyInputs(wm, chip, { A:0, B:0, C:0, D:0, CLK_UP:0, CLK_DOWN:1, CLR:1, LOAD:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74192: CLR=1 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '74192: CLR=1 → QD=LOW');
}
{
  // LOAD=0 (active LOW async): A=1,B=0,C=1,D=0 → preset count=5
  const { world, chip, wm } = setupChipWithPower('74192');
  applyInputs(wm, chip, { A:1, B:0, C:1, D:0, CLK_UP:0, CLK_DOWN:1, CLR:0, LOAD:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74192: LOAD preset A=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74192: LOAD preset B=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74192: LOAD preset C=1 → QC=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74192: LOAD preset D=0 → QD=LOW');
}
{
  // Count up: start at 8, CLK_UP rising → count=9; CO fires
  const { world, chip } = setupChipWithPower('74192');
  // Preset to 8
  const wmP = new WireManager(); resetWireCounter();
  wirePinToVcc(wmP, findPin(chip, 'VCC'));
  wirePinToGnd(wmP, findPin(chip, 'GND'));
  applyInputs(wmP, chip, { A:0, B:0, C:0, D:1, CLK_UP:0, CLK_DOWN:1, CLR:0, LOAD:0 });
  new CircuitSimulator().evaluate(world, [chip], wmP);
  // One CLK_UP rising edge (CLK_DOWN=1=idle)
  const { sim } = clockEdge(world, chip, 'CLK_UP', { A:0, B:0, C:0, D:0, CLK_DOWN:1, CLR:0, LOAD:1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74192: 8+1=9 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74192: 8+1=9 → QB=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QC'))),  '74192: 8+1=9 → QC=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QD'))), '74192: 8+1=9 → QD=HIGH');
  // CO=LOW when count=9 and CLK_UP=0 (CLK_UP=1 here, so CO=HIGH after clock)
  // Actually during the CLK_UP=1 phase: CO = (count==9 && CLK_UP==0) → 0&&1=false → CO=1=HIGH
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'CO'))), '74192: count=9 CLK_UP=1 → CO=HIGH');
}
{
  // Count down from 0 → wraps to 9; BO fires when count=0 and CLK_DOWN=0
  const { world, chip } = setupChipWithPower('74192');
  // CLR to 0
  const wmC = new WireManager(); resetWireCounter();
  wirePinToVcc(wmC, findPin(chip, 'VCC'));
  wirePinToGnd(wmC, findPin(chip, 'GND'));
  applyInputs(wmC, chip, { A:0, B:0, C:0, D:0, CLK_UP:1, CLK_DOWN:1, CLR:1, LOAD:1 });
  new CircuitSimulator().evaluate(world, [chip], wmC);
  // Count down (CLK_UP=1=idle)
  const { sim } = clockEdge(world, chip, 'CLK_DOWN', { A:0, B:0, C:0, D:0, CLK_UP:1, CLR:0, LOAD:1 });
  // count wrapped to 9
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74192: 0-1 wraps to 9 → QA=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QD'))), '74192: 0-1 wraps to 9 → QD=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G8: 74194 - 4 bit Bidirectional Shift Register with CLR
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG8: 74194 - 4 bit Bidirectional Shift Register');
{
  // CLR=0 → async clear → all Q=LOW
  const { world, chip, wm } = setupChipWithPower('74194');
  applyInputs(wm, chip, { CLR:0, CLK:0, S0:0, S1:0, SER_R:0, SER_L:0, A:1, B:1, C:1, D:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74194: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '74194: CLR=0 → QD=LOW');
}
{
  // Parallel load (S1=1, S0=1): A=1,B=0,C=1,D=0
  const { world, chip } = setupChipWithPower('74194');
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, S0:1, S1:1, SER_R:0, SER_L:0, A:1, B:0, C:1, D:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74194: parallel load A=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74194: parallel load B=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74194: parallel load C=1 → QC=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74194: parallel load D=0 → QD=LOW');
}
{
  // Shift right (S1=0, S0=1): SER_R=1 → after 1 clock QA=1, QB=old-QA
  const { world, chip } = setupChipWithPower('74194');
  // First load A=0,B=1,C=0,D=0
  clockEdge(world, chip, 'CLK', { CLR:1, S0:1, S1:1, SER_R:0, SER_L:0, A:0, B:1, C:0, D:0 });
  // Shift right with SER_R=1
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, S0:1, S1:0, SER_R:1, SER_L:0, A:0, B:0, C:0, D:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74194: shift-right SER_R=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74194: shift-right old QA=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74194: shift-right old QB=1 → QC=HIGH');
}
{
  // Shift left (S1=1, S0=0): SER_L=1 → after 1 clock QD=1
  const { world, chip } = setupChipWithPower('74194');
  clockEdge(world, chip, 'CLK', { CLR:1, S0:1, S1:1, SER_R:0, SER_L:0, A:0, B:0, C:0, D:0 });
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, S0:0, S1:1, SER_R:0, SER_L:1, A:0, B:0, C:0, D:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QD'))), '74194: shift-left SER_L=1 → QD=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QC'))),  '74194: shift-left old QD=0 → QC=LOW');
}
{
  // Hold mode (S1=0, S0=0): no change after clock
  const { world, chip } = setupChipWithPower('74194');
  clockEdge(world, chip, 'CLK', { CLR:1, S0:1, S1:1, SER_R:0, SER_L:0, A:1, B:1, C:0, D:0 });
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, S0:0, S1:0, SER_R:0, SER_L:0, A:0, B:0, C:0, D:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74194: hold mode → QA unchanged (still HIGH)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QB'))), '74194: hold mode → QB unchanged (still HIGH)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G9: 74195 - 4 bit Shift Register with J-K̄ input
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG9: 74195 - 4 bit Shift Register (J-K input)');
{
  // CLR=0 → async clear → QA-QD=LOW, QDn=HIGH
  const { world, chip, wm } = setupChipWithPower('74195');
  applyInputs(wm, chip, { CLR:0, CLK:0, J:0, Kn:0, PE:1, A:1, B:1, C:1, D:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))),  '74195: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74195: CLR=0 → QD=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QDn'))), '74195: CLR=0 → QDn=HIGH');
}
{
  // Parallel load (PE=0): A=1,B=0,C=1,D=1
  const { world, chip } = setupChipWithPower('74195');
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, J:0, Kn:0, PE:0, A:1, B:0, C:1, D:1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74195: PE=0 load A=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74195: PE=0 load B=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74195: PE=0 load C=1 → QC=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QD'))), '74195: PE=0 load D=1 → QD=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QDn'))), '74195: QD=HIGH → QDn=LOW');
}
{
  // Shift with JK: J=1,Kn=1 → QA_next=1 (set), shift right
  const { world, chip } = setupChipWithPower('74195');
  // Load all zeros first
  clockEdge(world, chip, 'CLK', { CLR:1, J:0, Kn:0, PE:0, A:0, B:0, C:0, D:0 });
  // Shift: J=1,Kn=1 → QA sets to 1
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, J:1, Kn:1, PE:1, A:0, B:0, C:0, D:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74195: J=1,Kn=1 → QA=HIGH (set)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74195: QB=old-QA=0 → QB=LOW');
}
{
  // J=0,Kn=0 → QA_next=0 (reset), regardless of old QA
  const { world, chip } = setupChipWithPower('74195');
  // Load QA=1
  clockEdge(world, chip, 'CLK', { CLR:1, J:0, Kn:0, PE:0, A:1, B:0, C:0, D:0 });
  // Shift: J=0,Kn=0 → QA resets to 0
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, J:0, Kn:0, PE:1, A:0, B:0, C:0, D:0 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74195: J=0,Kn=0 → QA=LOW (reset)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QB'))), '74195: QB=old-QA=1 → QB=HIGH');
}
{
  // QDn: load D=0 → QD=0 → QDn=HIGH
  const { world, chip } = setupChipWithPower('74195');
  const { sim } = clockEdge(world, chip, 'CLK', { CLR:1, J:0, Kn:0, PE:0, A:0, B:0, C:0, D:0 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74195: QD=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QDn'))), '74195: QD=0 → QDn=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G10: 74196 - Presettable Bi-Quinary Counter (same as 74176, falling edge)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG10: 74196 - Presettable Bi-Quinary Counter');
{
  // CLR=0 → all LOW
  const { world, chip, wm } = setupChipWithPower('74196');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:0, LOAD:1, A:0, B:0, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74196: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))), '74196: CLR=0 → QB=LOW');
}
{
  // LOAD=0 (async preset): B=1 → QB=HIGH
  const { world, chip, wm } = setupChipWithPower('74196');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:1, LOAD:0, A:0, B:1, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QB'))), '74196: LOAD preset B=1 → QB=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))),  '74196: LOAD preset A=0 → QA=LOW');
}
{
  // Falling CLK1 toggles QA
  const { world, chip } = setupChipWithPower('74196');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK2:0 };
  const { sim: s1 } = fallingEdge(world, chip, 'CLK1', base);
  assert(isHigh(getPinVoltage(s1, findPin(chip, 'QA'))), '74196: 1st falling CLK1 → QA=HIGH');
  const { sim: s2 } = fallingEdge(world, chip, 'CLK1', base);
  assert(isLow(getPinVoltage(s2, findPin(chip, 'QA'))),  '74196: 2nd falling CLK1 → QA=LOW');
}
{
  // Falling CLK2: cnt5 advances
  const { world, chip } = setupChipWithPower('74196');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK1:0 };
  const { sim: s1 } = fallingEdge(world, chip, 'CLK2', base);
  assert(isHigh(getPinVoltage(s1, findPin(chip, 'QB'))), '74196: CLK2 fall 1 → QB=HIGH (cnt5=1)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G11: 74197 - Presettable Binary Counter (same as 74177, falling edge)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG11: 74197 - Presettable Binary Counter');
{
  // CLR=0 → all LOW
  const { world, chip, wm } = setupChipWithPower('74197');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:0, LOAD:1, A:0, B:0, C:0, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74197: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))), '74197: CLR=0 → QD=LOW');
}
{
  // LOAD=0 preset: A=1,C=1
  const { world, chip, wm } = setupChipWithPower('74197');
  applyInputs(wm, chip, { CLK1:0, CLK2:0, CLR:1, LOAD:0, A:1, B:0, C:1, D:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74197: preset A=1 → QA=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74197: preset C=1 → QC=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74197: preset B=0 → QB=LOW');
}
{
  // Falling CLK1 toggles QA
  const { world, chip } = setupChipWithPower('74197');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK2:0 };
  const { sim: s1 } = fallingEdge(world, chip, 'CLK1', base);
  assert(isHigh(getPinVoltage(s1, findPin(chip, 'QA'))), '74197: 1st falling CLK1 → QA=HIGH');
}
{
  // Falling CLK2 7 times → cnt8=7
  const { world, chip } = setupChipWithPower('74197');
  const base = { CLR:1, LOAD:1, A:0, B:0, C:0, D:0, CLK1:0 };
  let r;
  for (let i = 0; i < 7; i++) r = fallingEdge(world, chip, 'CLK2', base);
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QB'))), '74197: CLK2 fall 7 → QB=HIGH (cnt8=7)');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QC'))), '74197: CLK2 fall 7 → QC=HIGH');
  assert(isHigh(getPinVoltage(r.sim, findPin(chip, 'QD'))), '74197: CLK2 fall 7 → QD=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G12: 74198 - 8 bit Bidirectional Shift Register
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG12: 74198 - 8 bit Bidirectional Shift Register');
{
  // CLR=0 → all Q=LOW
  const { world, chip, wm } = setupChipWithPower('74198');
  applyInputs(wm, chip, { CLR:0, CLK:0, S0:0, S1:0, SER_R:0, SER_L:0,
    A:1, B:1, C:1, D:1, E:1, F:1, G:1, H:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74198: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QH'))), '74198: CLR=0 → QH=LOW');
}
{
  // Parallel load (S1=1, S0=1): A=1,B=0,C=0,D=0,E=0,F=0,G=0,H=1
  const { world, chip } = setupChipWithPower('74198');
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, S0:1, S1:1, SER_R:0, SER_L:0, A:1, B:0, C:0, D:0, E:0, F:0, G:0, H:1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74198: parallel load A=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74198: parallel load B=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QH'))), '74198: parallel load H=1 → QH=HIGH');
}
{
  // Shift right (S1=0, S0=1): SER_R=1 → QA=1, other bits shift
  const { world, chip } = setupChipWithPower('74198');
  // Load all 0
  clockEdge(world, chip, 'CLK',
    { CLR:1, S0:1, S1:1, SER_R:0, SER_L:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0 });
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, S0:1, S1:0, SER_R:1, SER_L:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74198: shift-right SER_R=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74198: shift-right → QB=LOW (old QA=0)');
}
{
  // Shift left (S1=1, S0=0): SER_L=1 → QH=1
  const { world, chip } = setupChipWithPower('74198');
  clockEdge(world, chip, 'CLK',
    { CLR:1, S0:1, S1:1, SER_R:0, SER_L:0, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0 });
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, S0:0, S1:1, SER_R:0, SER_L:1, A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QH'))), '74198: shift-left SER_L=1 → QH=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QG'))),  '74198: shift-left → QG=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G13: 74199 - 8 bit Shift Register with J-K̄ input
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG13: 74199 - 8 bit Shift Register (J-K input)');
{
  // CLR=0 → all Q=LOW
  const { world, chip, wm } = setupChipWithPower('74199');
  applyInputs(wm, chip, { CLR:0, CLK:0, J:0, Kn:0, PE:1,
    A:1, B:1, C:1, D:1, E:1, F:1, G2:1, H:1, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74199: CLR=0 → QA=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QH'))), '74199: CLR=0 → QH=LOW');
}
{
  // Parallel load (PE=0): A=1,B=0,C=1,D=0,E=0,F=0,G2=0,H=0
  const { world, chip } = setupChipWithPower('74199');
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, J:0, Kn:0, PE:0, A:1, B:0, C:1, D:0, E:0, F:0, G2:0, H:0, NC1:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74199: PE=0 load A=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74199: PE=0 load B=0 → QB=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74199: PE=0 load C=1 → QC=HIGH');
}
{
  // Shift with J=1,Kn=1 → QA sets to 1
  const { world, chip } = setupChipWithPower('74199');
  // Load all zeros
  clockEdge(world, chip, 'CLK',
    { CLR:1, J:0, Kn:0, PE:0, A:0, B:0, C:0, D:0, E:0, F:0, G2:0, H:0, NC1:0 });
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, J:1, Kn:1, PE:1, A:0, B:0, C:0, D:0, E:0, F:0, G2:0, H:0, NC1:0 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74199: J=1,Kn=1 → QA=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74199: QB=old-QA=0 → QB=LOW');
}
{
  // Shift with J=0,Kn=0 → QA resets to 0
  const { world, chip } = setupChipWithPower('74199');
  clockEdge(world, chip, 'CLK',
    { CLR:1, J:0, Kn:0, PE:0, A:1, B:0, C:0, D:0, E:0, F:0, G2:0, H:0, NC1:0 });
  const { sim } = clockEdge(world, chip, 'CLK',
    { CLR:1, J:0, Kn:0, PE:1, A:0, B:0, C:0, D:0, E:0, F:0, G2:0, H:0, NC1:0 });
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))),  '74199: J=0,Kn=0 → QA=LOW (reset)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QB'))), '74199: QB=old-QA=1 → QB=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G14: 74200 - 256 bit RAM (256×1)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG14: 74200 - 256x1 RAM');
{
  // CS=1 → HiZ (non-OC) → isLow
  const { world, chip, wm } = setupChipWithPower('74200');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:0, CS:1, WE:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74200: CS=1 → DOUT=HiZ (isLow)');
}
{
  // Write DIN=1 to addr 0, then read back
  const { world, chip } = setupChipWithPower('74200');
  const wmW = new WireManager(); resetWireCounter();
  wirePinToVcc(wmW, findPin(chip, 'VCC'));
  wirePinToGnd(wmW, findPin(chip, 'GND'));
  applyInputs(wmW, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:1, CS:0, WE:0, NC1:0, NC2:0 });
  new CircuitSimulator().evaluate(world, [chip], wmW);
  // Read (WE=1)
  const wmR = new WireManager(); resetWireCounter();
  wirePinToVcc(wmR, findPin(chip, 'VCC'));
  wirePinToGnd(wmR, findPin(chip, 'GND'));
  applyInputs(wmR, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:0, CS:0, WE:1, NC1:0, NC2:0 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74200: write/read addr0 DIN=1 → DOUT=HIGH');
}
{
  // Unwritten address → DOUT=0
  const { world, chip, wm } = setupChipWithPower('74200');
  applyInputs(wm, chip, { A0:1, A1:1, A2:1, A3:1, A4:1, A5:1, A6:1, A7:1,
    DIN:0, CS:0, WE:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74200: unwritten addr → DOUT=LOW');
}
{
  // Write to addr 127 (A0-A6=1, A7=0), read back
  const { world, chip } = setupChipWithPower('74200');
  const wmW = new WireManager(); resetWireCounter();
  wirePinToVcc(wmW, findPin(chip, 'VCC'));
  wirePinToGnd(wmW, findPin(chip, 'GND'));
  applyInputs(wmW, chip, { A0:1, A1:1, A2:1, A3:1, A4:1, A5:1, A6:1, A7:0,
    DIN:1, CS:0, WE:0, NC1:0, NC2:0 });
  new CircuitSimulator().evaluate(world, [chip], wmW);
  const wmR = new WireManager(); resetWireCounter();
  wirePinToVcc(wmR, findPin(chip, 'VCC'));
  wirePinToGnd(wmR, findPin(chip, 'GND'));
  applyInputs(wmR, chip, { A0:1, A1:1, A2:1, A3:1, A4:1, A5:1, A6:1, A7:0,
    DIN:0, CS:0, WE:1, NC1:0, NC2:0 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74200: write/read addr127 → DOUT=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G15: 74201 - 256 bit RAM (identical to 74200)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG15: 74201 - 256x1 RAM (same as 74200)');
{
  // CS=1 → HiZ
  const { world, chip, wm } = setupChipWithPower('74201');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:0, CS:1, WE:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74201: CS=1 → DOUT=HiZ (isLow)');
}
{
  // Write DIN=1 to addr 200 (A0-A7 = 11001000 = 200), read back
  const { world, chip } = setupChipWithPower('74201');
  // 200 = 0b11001000: A0=0,A1=0,A2=0,A3=1,A4=0,A5=0,A6=1,A7=1
  const wmW = new WireManager(); resetWireCounter();
  wirePinToVcc(wmW, findPin(chip, 'VCC'));
  wirePinToGnd(wmW, findPin(chip, 'GND'));
  applyInputs(wmW, chip, { A0:0, A1:0, A2:0, A3:1, A4:0, A5:0, A6:1, A7:1,
    DIN:1, CS:0, WE:0, NC1:0, NC2:0 });
  new CircuitSimulator().evaluate(world, [chip], wmW);
  const wmR = new WireManager(); resetWireCounter();
  wirePinToVcc(wmR, findPin(chip, 'VCC'));
  wirePinToGnd(wmR, findPin(chip, 'GND'));
  applyInputs(wmR, chip, { A0:0, A1:0, A2:0, A3:1, A4:0, A5:0, A6:1, A7:1,
    DIN:0, CS:0, WE:1, NC1:0, NC2:0 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74201: write/read addr200 → DOUT=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G16: 74202 - 256 bit RAM with power-down
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG16: 74202 - 256x1 RAM with power-down');
{
  // PD=1 → HiZ regardless of CS/WE
  const { world, chip, wm } = setupChipWithPower('74202');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:0, CS:0, WE:1, PD:1, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74202: PD=1 → DOUT=HiZ (isLow)');
}
{
  // CS=1 → HiZ
  const { world, chip, wm } = setupChipWithPower('74202');
  applyInputs(wm, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:0, CS:1, WE:1, PD:0, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74202: CS=1 → DOUT=HiZ (isLow)');
}
{
  // Normal write/read (PD=0, CS=0)
  const { world, chip } = setupChipWithPower('74202');
  const wmW = new WireManager(); resetWireCounter();
  wirePinToVcc(wmW, findPin(chip, 'VCC'));
  wirePinToGnd(wmW, findPin(chip, 'GND'));
  applyInputs(wmW, chip, { A0:1, A1:0, A2:1, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:1, CS:0, WE:0, PD:0, NC1:0 });
  new CircuitSimulator().evaluate(world, [chip], wmW);
  const wmR = new WireManager(); resetWireCounter();
  wirePinToVcc(wmR, findPin(chip, 'VCC'));
  wirePinToGnd(wmR, findPin(chip, 'GND'));
  applyInputs(wmR, chip, { A0:1, A1:0, A2:1, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:0, CS:0, WE:1, PD:0, NC1:0 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74202: PD=0 write/read → DOUT=HIGH');
}
{
  // PD=1 blocks read even after write
  const { world, chip } = setupChipWithPower('74202');
  const wmW = new WireManager(); resetWireCounter();
  wirePinToVcc(wmW, findPin(chip, 'VCC'));
  wirePinToGnd(wmW, findPin(chip, 'GND'));
  applyInputs(wmW, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:1, CS:0, WE:0, PD:0, NC1:0 });
  new CircuitSimulator().evaluate(world, [chip], wmW);
  const wmPD = new WireManager(); resetWireCounter();
  wirePinToVcc(wmPD, findPin(chip, 'VCC'));
  wirePinToGnd(wmPD, findPin(chip, 'GND'));
  applyInputs(wmPD, chip, { A0:0, A1:0, A2:0, A3:0, A4:0, A5:0, A6:0, A7:0,
    DIN:0, CS:0, WE:1, PD:1, NC1:0 });
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wmPD);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74202: PD=1 blocks read after write → HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\nResults: ${pass} passed, ${fail} failed out of ${pass + fail} total`);
if (fail > 0) process.exit(1);
