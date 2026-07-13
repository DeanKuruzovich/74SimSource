// test-chips12.mjs - Tests for all chips defined in js/chips/chips12.js

import { CHIPS_BLOCK_12 } from '../chips/chips12.js';
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

// Helper: drive a single rising clock edge, preserving chip state across calls
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
  '74x137', '74x140', '74x143', '74x144',
  '74x145', '74x146', '74x147', '74x149', '74x152', '74x155',
  '74x156', '74x158', '74x159', '74x162',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_12');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_12, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_12).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_12 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_12).length})`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_12)) {
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
for (const [id, def] of Object.entries(CHIPS_BLOCK_12)) {
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

// G1: 74137 - 3 to 8 decoder with address latch
console.log('\nG1: 74137 - 3 to 8 Decoder with Address Latch');
{
  // Transparent mode: G1n=0, G2=1, LE=1, A0=1 (addr=1) → Y1=LOW, others=HIGH
  const { world, chip, wm } = setupChipWithPower('74x137');
  applyInputs(wm, chip, { A0: 1, A1: 0, A2: 0, G1n: 0, G2: 1, LE: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74137: Y0=HIGH when addr=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y1'))),  '74137: Y1=LOW when addr=1, enabled');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74137: Y2=HIGH when addr=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y7'))), '74137: Y7=HIGH when addr=1');
}
{
  // Disabled: G1n=1 → all outputs HIGH
  const { world, chip, wm } = setupChipWithPower('74x137');
  applyInputs(wm, chip, { A0: 0, A1: 0, A2: 0, G1n: 1, G2: 1, LE: 1 });
  const sim = simulate(world, chip, wm);
  for (let i = 0; i < 8; i++) {
    assert(isHigh(getPinVoltage(sim, findPin(chip, `Y${i}`))), `74137: Y${i}=HIGH when G1n=1`);
  }
}
{
  // Disabled: G2=0 → all outputs HIGH
  const { world, chip, wm } = setupChipWithPower('74x137');
  applyInputs(wm, chip, { A0: 1, A1: 0, A2: 0, G1n: 0, G2: 0, LE: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y1'))), '74137: Y1=HIGH when G2=0');
}
{
  // Latch: LE=1→transparent (addr=2), then LE=0 with addr change → still outputs Y2
  const { world: w1, chip: c1, wm: wm1 } = setupChipWithPower('74x137');
  applyInputs(wm1, c1, { A0: 0, A1: 1, A2: 0, G1n: 0, G2: 1, LE: 1 }); // addr=2
  simulate(w1, c1, wm1);
  const wm2 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm2, findPin(c1, 'VCC'));
  wirePinToGnd(wm2, findPin(c1, 'GND'));
  applyInputs(wm2, c1, { A0: 1, A1: 1, A2: 0, G1n: 0, G2: 1, LE: 0 }); // addr=3 but latched
  const sim2 = simulate(w1, c1, wm2);
  assert(isLow(getPinVoltage(sim2, findPin(c1, 'Y2'))),  '74137: LE=0 latches addr=2 → Y2=LOW');
  assert(isHigh(getPinVoltage(sim2, findPin(c1, 'Y3'))), '74137: LE=0 latches addr=2 → Y3=HIGH');
}
{
  // addr=5: Y5=LOW
  const { world, chip, wm } = setupChipWithPower('74x137');
  applyInputs(wm, chip, { A0: 1, A1: 0, A2: 1, G1n: 0, G2: 1, LE: 1 }); // 101=5
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y5'))),  '74137: Y5=LOW when addr=5');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y4'))), '74137: Y4=HIGH when addr=5');
}

// G2: 74140 - dual 4 input NAND  
console.log('\nG2: 74140 - Dual 4 input NAND (50Ω driver)');
{
  // All inputs HIGH → output LOW
  const { world, chip, wm } = setupChipWithPower('74x140');
  applyInputs(wm, chip, { '1A': 1, '1B': 1, '1C': 1, '1D': 1, '2A': 1, '2B': 1, '2C': 1, '2D': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y'))), '74140: gate1 all-HIGH → 1Y=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y'))), '74140: gate2 all-HIGH → 2Y=LOW');
}
{
  // One input LOW → output HIGH
  const { world, chip, wm } = setupChipWithPower('74x140');
  applyInputs(wm, chip, { '1A': 0, '1B': 1, '1C': 1, '1D': 1, '2A': 1, '2B': 0, '2C': 1, '2D': 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y'))), '74140: gate1 A=0 → 1Y=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y'))), '74140: gate2 B=0 → 2Y=HIGH');
}

console.log('\nG5: 74143 - Decade Counter/7-Seg Driver (CC)');
{
  // CLR=1 → count=0, STROBE=1, ENP=1, ENT=1 → segments for digit '0'
  // '0' segments: a=1,b=1,c=1,d=1,e=1,f=1,g=0
  const { world, chip, wm } = setupChipWithPower('74x143');
  applyInputs(wm, chip, { CLK: 0, CLR: 1, STROBE: 1, ENP: 1, ENT: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'a'))), '74143: digit 0 → seg-a=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'b'))), '74143: digit 0 → seg-b=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'f'))), '74143: digit 0 → seg-f=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'g'))),  '74143: digit 0 → seg-g=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))),  '74143: CLR → QA=0');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74143: CLR → QB=0');
}
{
  // Count to 7: segments a=1,b=1,c=1,d=0,e=0,f=0,g=0
  const { world, chip } = setupChipWithPower('74x143');
  const wm0 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm0, findPin(chip, 'VCC')); wirePinToGnd(wm0, findPin(chip, 'GND'));
  applyInputs(wm0, chip, { CLK: 0, CLR: 1, STROBE: 1, ENP: 1, ENT: 1 });
  new CircuitSimulator().evaluate(world, [chip], wm0);
  for (let i = 0; i < 6; i++) clockEdge(world, chip, 'CLK', { CLR: 0, STROBE: 1, ENP: 1, ENT: 1 });
  const { sim } = clockEdge(world, chip, 'CLK', { CLR: 0, STROBE: 1, ENP: 1, ENT: 1 });
  // count=7, latched=7; segments: a=1,b=1,c=1,d=0,e=0,f=0,g=0
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74143: count=7 → QA=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QB'))), '74143: count=7 → QB=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QC'))), '74143: count=7 → QC=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QD'))),  '74143: count=7 → QD=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'a'))), '74143: digit 7 → seg-a=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'b'))), '74143: digit 7 → seg-b=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'c'))), '74143: digit 7 → seg-c=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'd'))),  '74143: digit 7 → seg-d=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'e'))),  '74143: digit 7 → seg-e=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'f'))),  '74143: digit 7 → seg-f=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'g'))),  '74143: digit 7 → seg-g=LOW');
}
{
  // ENP=0 → count halted
  const { world, chip } = setupChipWithPower('74x143');
  const wm0 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm0, findPin(chip, 'VCC')); wirePinToGnd(wm0, findPin(chip, 'GND'));
  applyInputs(wm0, chip, { CLK: 0, CLR: 1, STROBE: 1, ENP: 1, ENT: 1 });
  new CircuitSimulator().evaluate(world, [chip], wm0);
  clockEdge(world, chip, 'CLK', { CLR: 0, STROBE: 1, ENP: 1, ENT: 1 }); // count=1
  const { sim } = clockEdge(world, chip, 'CLK', { CLR: 0, STROBE: 1, ENP: 0, ENT: 1 }); // halted
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74143: ENP=0 halts → QA=1 (still 1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74143: ENP=0 halts → QB=0 (still 1)');
}
{
  // RCO: ENT=1, count=9 → RCO=HIGH
  const { world, chip } = setupChipWithPower('74x143');
  const wm0 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm0, findPin(chip, 'VCC')); wirePinToGnd(wm0, findPin(chip, 'GND'));
  applyInputs(wm0, chip, { CLK: 0, CLR: 1, STROBE: 1, ENP: 1, ENT: 1 });
  new CircuitSimulator().evaluate(world, [chip], wm0);
  for (let i = 0; i < 8; i++) clockEdge(world, chip, 'CLK', { CLR: 0, STROBE: 1, ENP: 1, ENT: 1 });
  const { sim } = clockEdge(world, chip, 'CLK', { CLR: 0, STROBE: 1, ENP: 1, ENT: 1 });
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'RCO'))), '74143: count=9, ENT=1 → RCO=HIGH');
}

// G6: 74144 - decade counter + 7-seg OC driver (same as 74143 but OC)
console.log('\nG6: 74144 - Decade Counter/7-Seg Driver (OC)');
{
  // CLR=1 → count=0 → seg-g=LOW (OC), seg-a=HIGH (OC pulled up)
  const { world, chip, wm } = setupChipWithPower('74x144');
  applyInputs(wm, chip, { CLK: 0, CLR: 1, STROBE: 1, ENP: 1, ENT: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'a'))), '74144: digit 0 → seg-a=HIGH (OC pulled)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'g'))),  '74144: digit 0 → seg-g=LOW (OC sunk)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QA'))), '74144: CLR → QA=0');
}

// G7: 74145 - BCD to decimal decoder, OC driver
console.log('\nG7: 74145 - BCD to Decimal (OC driver)');
{
  // Input=3 (0011)
  const { world, chip, wm } = setupChipWithPower('74x145');
  applyInputs(wm, chip, { A: 1, B: 1, C: 0, D: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y3'))),  '74145: BCD=3 → Y3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y2'))), '74145: BCD=3 → Y2=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74145: BCD=3 → Y0=HIGH');
}
{
  // Input=9 (1001)
  const { world, chip, wm } = setupChipWithPower('74x145');
  applyInputs(wm, chip, { A: 1, B: 0, C: 0, D: 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y9'))),  '74145: BCD=9 → Y9=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y8'))), '74145: BCD=9 → Y8=HIGH');
}

// G8: 74146 - 3 to 8 line decoder
console.log('\nG8: 74146 - 3 to 8 Line Decoder');
{
  // G1=1, G2A=0, G2B=0, addr=4 (100) → Y4=LOW
  const { world, chip, wm } = setupChipWithPower('74x146');
  applyInputs(wm, chip, { A: 0, B: 0, C: 1, G1: 1, G2A: 0, G2B: 0 }); // A=LSB, C=MSB, sel=4
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y4'))),  '74146: addr=4,enabled → Y4=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y3'))), '74146: addr=4 → Y3=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y5'))), '74146: addr=4 → Y5=HIGH');
}
{
  // G1=0 → all HIGH (disabled)
  const { world, chip, wm } = setupChipWithPower('74x146');
  applyInputs(wm, chip, { A: 0, B: 0, C: 0, G1: 0, G2A: 0, G2B: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74146: G1=0 → Y0=HIGH');
}
{
  // G2A=1 → all HIGH (disabled)
  const { world, chip, wm } = setupChipWithPower('74x146');
  applyInputs(wm, chip, { A: 0, B: 0, C: 0, G1: 1, G2A: 1, G2B: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74146: G2A=1 → Y0=HIGH');
}

// G9: 74147 - 10-to-4 priority encoder
console.log('\nG9: 74147 - 10-to-4 Priority Encoder');
{
  // All inputs HIGH (inactive) → output all HIGH (active LOW BCD=0 → A3n=1,A2n=1,A1n=1,A0n=1)
  const { world, chip, wm } = setupChipWithPower('74x147');
  applyInputs(wm, chip, { I1: 1, I2: 1, I3: 1, I4: 1, I5: 1, I6: 1, I7: 1, I8: 1, I9: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A0n'))), '74147: all inactive → A0n=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A1n'))), '74147: all inactive → A1n=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A2n'))), '74147: all inactive → A2n=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A3n'))), '74147: all inactive → A3n=HIGH');
}
{
  // I9=LOW (active, highest priority 9) → BCD 9=1001 → active LOW → A3n=0,A2n=1,A1n=1,A0n=0
  const { world, chip, wm } = setupChipWithPower('74x147');
  applyInputs(wm, chip, { I1: 1, I2: 1, I3: 1, I4: 1, I5: 1, I6: 1, I7: 1, I8: 1, I9: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'A0n'))),  '74147: I9 active → A0n=0 (BCD9,bit0=1→inv→0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A1n'))), '74147: I9 active → A1n=1 (BCD9,bit1=0→inv→1)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A2n'))), '74147: I9 active → A2n=1 (BCD9,bit2=0→inv→1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'A3n'))),  '74147: I9 active → A3n=0 (BCD9,bit3=1→inv→0)');
}
{
  // I5=LOW, I9=HIGH → priority=5; BCD5=0101 → A3n=1,A2n=0,A1n=1,A0n=0
  const { world, chip, wm } = setupChipWithPower('74x147');
  applyInputs(wm, chip, { I1: 1, I2: 1, I3: 1, I4: 1, I5: 0, I6: 1, I7: 1, I8: 1, I9: 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'A0n'))),  '74147: I5 active → A0n=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A1n'))), '74147: I5 active → A1n=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'A2n'))),  '74147: I5 active → A2n=0');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A3n'))), '74147: I5 active → A3n=1');
}
{
  // I5 and I8 both active → I8 wins (higher priority)
  // BCD 8=1000 → A3n=0,A2n=1,A1n=1,A0n=1
  const { world, chip, wm } = setupChipWithPower('74x147');
  applyInputs(wm, chip, { I1: 1, I2: 1, I3: 1, I4: 1, I5: 0, I6: 1, I7: 1, I8: 0, I9: 1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A0n'))), '74147: I8>I5 → A0n=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A1n'))), '74147: I8>I5 → A1n=1');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A2n'))), '74147: I8>I5 → A2n=1');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'A3n'))),  '74147: I8>I5 → A3n=0');
}

// G10: 74149 - 8 line cascadable priority encoder
console.log('\nG10: 74149 - 8 line Priority Encoder');
{
  // EI=1 → disabled: all Y=HIGH, EO=LOW
  const { world, chip, wm } = setupChipWithPower('74x149');
  applyInputs(wm, chip, { X0: 0, X1: 0, X2: 0, X3: 0, X4: 0, X5: 0, X6: 0, X7: 0, EI: 1 });
  const sim = simulate(world, chip, wm);
  for (let i = 0; i < 8; i++) {
    assert(isHigh(getPinVoltage(sim, findPin(chip, `Y${i}`))), `74149: EI=1 → Y${i}=HIGH`);
  }
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EO'))), '74149: EI=1 → EO=LOW');
}
{
  // EI=0, no active input → all Y=HIGH, EO=0
  const { world, chip, wm } = setupChipWithPower('74x149');
  applyInputs(wm, chip, { X0: 0, X1: 0, X2: 0, X3: 0, X4: 0, X5: 0, X6: 0, X7: 0, EI: 0 });
  const sim = simulate(world, chip, wm);
  for (let i = 0; i < 8; i++) {
    assert(isHigh(getPinVoltage(sim, findPin(chip, `Y${i}`))), `74149: no input → Y${i}=HIGH`);
  }
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EO'))), '74149: no active input → EO=LOW');
}
{
  // EI=0, X3=1 (highest active) → Y3=LOW, others=HIGH, EO=HIGH
  const { world, chip, wm } = setupChipWithPower('74x149');
  applyInputs(wm, chip, { X0: 1, X1: 0, X2: 0, X3: 1, X4: 0, X5: 0, X6: 0, X7: 0, EI: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y3'))),  '74149: X3=highest → Y3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74149: X3=highest → Y0=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'EO'))), '74149: any active → EO=HIGH');
}
{
  // X7=1 → Y7=LOW (highest priority)
  const { world, chip, wm } = setupChipWithPower('74x149');
  applyInputs(wm, chip, { X0: 1, X1: 1, X2: 1, X3: 1, X4: 1, X5: 1, X6: 1, X7: 1, EI: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y7'))),  '74149: X7 highest → Y7=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y6'))), '74149: X7 wins → Y6=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'EO'))), '74149: inputs active → EO=HIGH');
}

// G11: 74152 - 8-to-1 MUX, inverted output
console.log('\nG11: 74152 - 8-to-1 MUX (inverted output)');
{
  // A=0,B=0,C=0 → select D0; D0=1 → W=LOW (inverted)
  const { world, chip, wm } = setupChipWithPower('74x152');
  applyInputs(wm, chip, { D0: 1, D1: 0, D2: 0, D3: 0, D4: 0, D5: 0, D6: 0, D7: 0, A: 0, B: 0, C: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'W'))), '74152: sel=0,D0=1 → W=LOW');
}
{
  // A=0,B=0,C=0 → D0=0 → W=HIGH
  const { world, chip, wm } = setupChipWithPower('74x152');
  applyInputs(wm, chip, { D0: 0, D1: 1, D2: 1, D3: 1, D4: 1, D5: 1, D6: 1, D7: 1, A: 0, B: 0, C: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'W'))), '74152: sel=0,D0=0 → W=HIGH');
}
{
  // A=1,B=1,C=0 → sel=3 → D3
  const { world, chip, wm } = setupChipWithPower('74x152');
  applyInputs(wm, chip, { D0: 1, D1: 1, D2: 1, D3: 0, D4: 1, D5: 1, D6: 1, D7: 1, A: 1, B: 1, C: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'W'))), '74152: sel=3,D3=0 → W=HIGH');
}
{
  // A=1,B=0,C=1 → sel=5 → D5=1 → W=LOW
  const { world, chip, wm } = setupChipWithPower('74x152');
  applyInputs(wm, chip, { D0: 0, D1: 0, D2: 0, D3: 0, D4: 0, D5: 1, D6: 0, D7: 0, A: 1, B: 0, C: 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'W'))), '74152: sel=5,D5=1 → W=LOW');
}

// G12: 74155 - dual 2-to-4 decoder
console.log('\nG12: 74155 - Dual 2-to-4 Decoder');
{
  // Section 1: 1G=0, 1C=0, A=0, B=0 → 1Y0=LOW, others=HIGH
  const { world, chip, wm } = setupChipWithPower('74x155');
  applyInputs(wm, chip, { '1G': 0, '1C': 0, A: 0, B: 0, '2G': 1, '2Cn': 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y0'))),  '74155: s1 G=0,C=0,AB=00 → 1Y0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y1'))), '74155: s1 G=0,C=0,AB=00 → 1Y1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y2'))), '74155: s1 G=0,C=0,AB=00 → 1Y2=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y3'))), '74155: s1 G=0,C=0,AB=00 → 1Y3=HIGH');
}
{
  // Section 1: 1C=1 (data inactive) → all 1Y=HIGH
  const { world, chip, wm } = setupChipWithPower('74x155');
  applyInputs(wm, chip, { '1G': 0, '1C': 1, A: 0, B: 0, '2G': 1, '2Cn': 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y0'))), '74155: s1 1C=1 → 1Y0=HIGH');
}
{
  // Section 1: 1G=1 (disabled) → all HIGH
  const { world, chip, wm } = setupChipWithPower('74x155');
  applyInputs(wm, chip, { '1G': 1, '1C': 0, A: 0, B: 0, '2G': 1, '2Cn': 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y0'))), '74155: s1 1G=1 → 1Y0=HIGH');
}
{
  // Section 2: 2G=0, 2Cn=1 (C=NOT(1)=0 → ACTIVE), A=1, B=0 → 2Y1=LOW
  const { world, chip, wm } = setupChipWithPower('74x155');
  applyInputs(wm, chip, { '1G': 1, '1C': 0, A: 1, B: 0, '2G': 0, '2Cn': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y1'))),  '74155: s2 G=0,Cn=1,AB=01 → 2Y1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y0'))), '74155: s2 G=0,Cn=1,AB=01 → 2Y0=HIGH');
}
{
  // Section 2: 2Cn=0 (inverted → C=1 → disabled) → all HIGH
  const { world, chip, wm } = setupChipWithPower('74x155');
  applyInputs(wm, chip, { '1G': 1, '1C': 0, A: 0, B: 0, '2G': 0, '2Cn': 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y0'))), '74155: s2 Cn=0 → 2Y0=HIGH');
}
{
  // AB=11 → Y3 selected; both sections
  const { world, chip, wm } = setupChipWithPower('74x155');
  applyInputs(wm, chip, { '1G': 0, '1C': 0, A: 1, B: 1, '2G': 0, '2Cn': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y3'))), '74155: s1 AB=11 → 1Y3=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y3'))), '74155: s2 AB=11 → 2Y3=LOW');
}

// G13: 74156 - dual 2-to-4 decoder, OC
console.log('\nG13: 74156 - Dual 2-to-4 Decoder (OC)');
{
  // Section 1: OC, selected=LOW (sunk), non-selected=HIGH (pulled up)
  const { world, chip, wm } = setupChipWithPower('74x156');
  applyInputs(wm, chip, { '1G': 0, '1C': 0, A: 0, B: 1, '2G': 1, '2Cn': 0 }); // AB=10 → Y2
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y2'))),  '74156: OC,AB=10 → 1Y2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y0'))), '74156: OC,AB=10 → 1Y0=HIGH (pulled)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y1'))), '74156: OC,AB=10 → 1Y1=HIGH (pulled)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y3'))), '74156: OC,AB=10 → 1Y3=HIGH (pulled)');
}
{
  // Section 2: 2Cn=1 → active, A=1,B=1 → 2Y3=LOW
  const { world, chip, wm } = setupChipWithPower('74x156');
  applyInputs(wm, chip, { '1G': 1, '1C': 0, A: 1, B: 1, '2G': 0, '2Cn': 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y3'))),  '74156: OC s2 Cn=1,AB=11 → 2Y3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y0'))), '74156: OC s2 AB=11 → 2Y0=HIGH');
}

// G14: 74158 - quad 2-to-1 MUX, inverting output
console.log('\nG14: 74158 - Quad 2-to-1 MUX (inverting)');
{
  // G=1 → all outputs LOW
  const { world, chip, wm } = setupChipWithPower('74x158');
  applyInputs(wm, chip, { SEL: 0, '1A': 1, '1B': 1, '2A': 1, '2B': 1, '3A': 1, '3B': 1, '4A': 1, '4B': 1, G: 1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y'))), '74158: G=1 → 1Y=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y'))), '74158: G=1 → 2Y=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '3Y'))), '74158: G=1 → 3Y=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '4Y'))), '74158: G=1 → 4Y=LOW');
}
{
  // G=0, SEL=0 → Y=NOT(A)
  const { world, chip, wm } = setupChipWithPower('74x158');
  applyInputs(wm, chip, { SEL: 0, '1A': 1, '1B': 0, '2A': 0, '2B': 1, '3A': 1, '3B': 0, '4A': 0, '4B': 1, G: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y'))),  '74158: SEL=0,1A=1 → 1Y=LOW (NOT 1A)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y'))), '74158: SEL=0,2A=0 → 2Y=HIGH (NOT 2A)');
  assert(isLow(getPinVoltage(sim, findPin(chip, '3Y'))),  '74158: SEL=0,3A=1 → 3Y=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '4Y'))), '74158: SEL=0,4A=0 → 4Y=HIGH');
}
{
  // G=0, SEL=1 → Y=NOT(B)
  const { world, chip, wm } = setupChipWithPower('74x158');
  applyInputs(wm, chip, { SEL: 1, '1A': 0, '1B': 1, '2A': 1, '2B': 0, '3A': 0, '3B': 1, '4A': 1, '4B': 0, G: 0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y'))),  '74158: SEL=1,1B=1 → 1Y=LOW (NOT 1B)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y'))), '74158: SEL=1,2B=0 → 2Y=HIGH (NOT 2B)');
}

// G15: 74159 - 4-to-16 decoder, OC
console.log('\nG15: 74159 - 4-to-16 Decoder (OC)');
{
  // G1n=0, G2n=0, addr=7 (0111) → Y7=LOW, others=HIGH
  const { world, chip, wm } = setupChipWithPower('74x159');
  applyInputs(wm, chip, { A0: 1, A1: 1, A2: 1, A3: 0, G1n: 0, G2n: 0 }); // 0111=7
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y7'))),   '74159: addr=7,enabled → Y7=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))),  '74159: addr=7 → Y0=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y15'))), '74159: addr=7 → Y15=HIGH');
}
{
  // G1n=1 → disabled → all HIGH
  const { world, chip, wm } = setupChipWithPower('74x159');
  applyInputs(wm, chip, { A0: 0, A1: 0, A2: 0, A3: 0, G1n: 1, G2n: 0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74159: G1n=1 → Y0=HIGH');
}
{
  // addr=12 (1100) → Y12=LOW
  const { world, chip, wm } = setupChipWithPower('74x159');
  applyInputs(wm, chip, { A0: 0, A1: 0, A2: 1, A3: 1, G1n: 0, G2n: 0 }); // 1100=12
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y12'))),  '74159: addr=12 → Y12=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y11'))), '74159: addr=12 → Y11=HIGH');
}

// G16: 74162 - synchronous BCD counter with synchronous clear
console.log('\nG16: 74162 - Sync BCD Counter (sync CLR)');
{
  // CLR=0 on rising CLK → clears to 0
  const { world, chip } = setupChipWithPower('74x162');
  // First prime with some state (count=5 via LOAD)
  const wmLoad = new WireManager(); resetWireCounter();
  wirePinToVcc(wmLoad, findPin(chip, 'VCC'));
  wirePinToGnd(wmLoad, findPin(chip, 'GND'));
  applyInputs(wmLoad, chip, { CLK: 0, CLR: 1, LOAD: 0, ENP: 0, ENT: 0, A: 1, B: 0, C: 1, D: 0 }); // preload=5
  new CircuitSimulator().evaluate(world, [chip], wmLoad);
  const { sim: simLoad } = clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 0, ENP: 0, ENT: 0, A: 1, B: 0, C: 1, D: 0 });
  assert(isHigh(getPinVoltage(simLoad, findPin(chip, 'QA'))), '74162: LOAD=0 → QA=1 (5=0101)');
  assert(isHigh(getPinVoltage(simLoad, findPin(chip, 'QC'))), '74162: LOAD=0 → QC=1 (5=0101)');
  // Now synchronous clear
  const { sim: simClr } = clockEdge(world, chip, 'CLK', { CLR: 0, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  assert(isLow(getPinVoltage(simClr, findPin(chip, 'QA'))), '74162: CLR=0 sync → QA=0');
  assert(isLow(getPinVoltage(simClr, findPin(chip, 'QB'))), '74162: CLR=0 sync → QB=0');
  assert(isLow(getPinVoltage(simClr, findPin(chip, 'QC'))), '74162: CLR=0 sync → QC=0');
  assert(isLow(getPinVoltage(simClr, findPin(chip, 'QD'))), '74162: CLR=0 sync → QD=0');
}
{
  // ENP=1, ENT=1 → count on rising CLK
  const { world, chip } = setupChipWithPower('74x162');
  // Clear first
  const wm0 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm0, findPin(chip, 'VCC')); wirePinToGnd(wm0, findPin(chip, 'GND'));
  applyInputs(wm0, chip, { CLK: 0, CLR: 0, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  new CircuitSimulator().evaluate(world, [chip], wm0);
  clockEdge(world, chip, 'CLK', { CLR: 0, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 }); // clears
  // Now increment
  clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 }); // count=1
  clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 }); // count=2
  const { sim: sim3 } = clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 }); // count=3
  assert(isHigh(getPinVoltage(sim3, findPin(chip, 'QA'))), '74162: count=3 → QA=1');
  assert(isHigh(getPinVoltage(sim3, findPin(chip, 'QB'))), '74162: count=3 → QB=1');
  assert(isLow(getPinVoltage(sim3, findPin(chip, 'QC'))),  '74162: count=3 → QC=0');
  assert(isLow(getPinVoltage(sim3, findPin(chip, 'QD'))),  '74162: count=3 → QD=0');
}
{
  // Count wraps at 9→0 (decade)
  const { world, chip } = setupChipWithPower('74x162');
  const wm0 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm0, findPin(chip, 'VCC')); wirePinToGnd(wm0, findPin(chip, 'GND'));
  applyInputs(wm0, chip, { CLK: 0, CLR: 0, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  new CircuitSimulator().evaluate(world, [chip], wm0);
  clockEdge(world, chip, 'CLK', { CLR: 0, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 }); // sync clear
  for (let i = 0; i < 9; i++) clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  // Now count=9 → RCO=HIGH
  const wm9 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm9, findPin(chip, 'VCC')); wirePinToGnd(wm9, findPin(chip, 'GND'));
  applyInputs(wm9, chip, { CLK: 1, CLR: 1, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  const sim9 = new CircuitSimulator();
  sim9.evaluate(world, [chip], wm9);
  assert(isHigh(getPinVoltage(sim9, findPin(chip, 'RCO'))), '74162: count=9,ENT=1 → RCO=HIGH');
  // One more edge → wraps to 0
  const { sim: sim0 } = clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  assert(isLow(getPinVoltage(sim0, findPin(chip, 'QA'))), '74162: 9+1 → wraps to 0 → QA=0');
  assert(isLow(getPinVoltage(sim0, findPin(chip, 'RCO'))), '74162: count=0 → RCO=LOW');
}
{
  // ENP=0 → count halted
  const { world, chip } = setupChipWithPower('74x162');
  // Clear
  const wm0 = new WireManager(); resetWireCounter();
  wirePinToVcc(wm0, findPin(chip, 'VCC')); wirePinToGnd(wm0, findPin(chip, 'GND'));
  applyInputs(wm0, chip, { CLK: 0, CLR: 0, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  new CircuitSimulator().evaluate(world, [chip], wm0);
  clockEdge(world, chip, 'CLK', { CLR: 0, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 });
  clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 1, ENP: 1, ENT: 1, A: 0, B: 0, C: 0, D: 0 }); // count=1
  const { sim } = clockEdge(world, chip, 'CLK', { CLR: 1, LOAD: 1, ENP: 0, ENT: 1, A: 0, B: 0, C: 0, D: 0 }); // halted
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'QA'))), '74162: ENP=0 halts → QA=1 (still 1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'QB'))),  '74162: ENP=0 halts → QB=0 (still 1)');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
if (fail > 0) process.exit(1);
