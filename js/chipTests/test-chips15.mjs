// test-chips15.mjs - Tests for all chips defined in js/chips/chips15.js

import { CHIPS_BLOCK_15 } from '../chips/chips15.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  \u2713 ${msg}`); }
  else       { fail++; console.error(`  \u2717 ${msg}`); }
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

function applyInputs(wm, chip, inputMap) {
  for (const [pinName, val] of Object.entries(inputMap)) {
    const p = findPin(chip, pinName);
    if (!p) continue;
    if (val) wirePinToVcc(wm, p);
    else     wirePinToGnd(wm, p);
  }
}

function simulate(world, chip, wm) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  return sim;
}

function setupWorld(chipId) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(chipId);
  chip.place(0, 0, 10, 4);
  return { world, chip };
}

function makeWm(chip, inputs) {
  const wm = new WireManager(); resetWireCounter();
  wirePinToVcc(wm, findPin(chip, 'VCC'));
  wirePinToGnd(wm, findPin(chip, 'GND'));
  if (inputs) applyInputs(wm, chip, inputs);
  return wm;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x206', '74x207', '74x208', '74x209', '74x210', '74x211', '74x212', '74x213',
  '74x214', '74x215', '74x216', '74x217', '74x218', '74x219', '74x222', '74x224',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_15');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_15, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_15).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_15 has exactly ${EXPECTED_CHIP_IDS.length} chips`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_15)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id} has field '${f}'`);
    }
  }
}

console.log('\nS3: VCC/GND pins exist on every chip');
for (const [id, def] of Object.entries(CHIPS_BLOCK_15)) {
  const pinNames = def.pinout.map(p => p.name);
  assert(pinNames.includes('VCC'), `${id} has VCC pin`);
  assert(pinNames.includes('GND'), `${id} has GND pin`);
}

// ─────────────────────────────────────────────────────────────────────────────
// G1: 74206
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG1: 74206 - 256x1 OC RAM');
{
  const { world, chip } = setupWorld('74x206');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0, DIN:0, WE:1, CS:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74206: CS=1 -> DOUT=HIGH (OC pull up)');
}
{
  const { world, chip } = setupWorld('74x206');
  const wmW = makeWm(chip, { A0:1,A1:0,A2:1,A3:0,A4:0,A5:0,A6:0,A7:0, DIN:1, WE:0, CS:0, NC1:0, NC2:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:0,A2:1,A3:0,A4:0,A5:0,A6:0,A7:0, DIN:0, WE:1, CS:0, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74206: wrote 1 at addr5 -> READ HIGH');
}
{
  const { world, chip } = setupWorld('74x206');
  const wmW = makeWm(chip, { A0:1,A1:1,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0, DIN:0, WE:0, CS:0, NC1:0, NC2:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:1,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0, DIN:0, WE:1, CS:0, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74206: wrote 0 at addr3 -> READ LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G2: 74207
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG2: 74207 - 256x4 common I/O RAM');
{
  const { world, chip } = setupWorld('74x207');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,
    IO0:0, IO1:1, IO2:0, IO3:1, WE:0, CS:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0, WE:1, CS:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO0'))),  '74207: IO0=LOW (wrote 0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO1'))), '74207: IO1=HIGH (wrote 1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO2'))),  '74207: IO2=LOW (wrote 0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO3'))), '74207: IO3=HIGH (wrote 1)');
}
{
  const { world, chip } = setupWorld('74x207');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0, WE:1, CS:1 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'IO0'));
  assert(v === undefined || isLow(v), '74207: CS=1 -> IO0 floating');
}
{
  const { world, chip } = setupWorld('74x207');
  const wmW7 = makeWm(chip, { A0:1,A1:1,A2:1,A3:0,A4:0,A5:0,A6:0,A7:0,
    IO0:1,IO1:1,IO2:1,IO3:1, WE:0, CS:0 });
  simulate(world, chip, wmW7);
  const wmR7 = makeWm(chip, { A0:1,A1:1,A2:1,A3:0,A4:0,A5:0,A6:0,A7:0, WE:1, CS:0 });
  const sim7 = simulate(world, chip, wmR7);
  assert(isHigh(getPinVoltage(sim7, findPin(chip, 'IO0'))), '74207: addr7 IO0=HIGH');
  assert(isHigh(getPinVoltage(sim7, findPin(chip, 'IO3'))), '74207: addr7 IO3=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G3: 74208
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG3: 74208 - 256x4 separate I/O RAM');
{
  const { world, chip } = setupWorld('74x208');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,
    DIN0:0,DIN1:0,DIN2:0,DIN3:0, CS:1, WE:0 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'DOUT0'));
  assert(v === undefined || isLow(v), '74208: CS=1 -> DOUT0 floating');
}
{
  const { world, chip } = setupWorld('74x208');
  const wmW = makeWm(chip, { A0:0,A1:1,A2:0,A3:1,A4:0,A5:0,A6:0,A7:0,
    DIN0:0,DIN1:0,DIN2:1,DIN3:1, CS:0, WE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:1,A2:0,A3:1,A4:0,A5:0,A6:0,A7:0,
    DIN0:0,DIN1:0,DIN2:0,DIN3:0, CS:0, WE:1 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT0'))),  '74208: DOUT0=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT1'))),  '74208: DOUT1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT2'))), '74208: DOUT2=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT3'))), '74208: DOUT3=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G4: 74209
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG4: 74209 - 1024x1 RAM');
{
  const { world, chip } = setupWorld('74x209');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,
    DIN:0, CS:1, WE:1 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'DOUT'));
  assert(v === undefined || isLow(v), '74209: CS=1 -> DOUT floating/low');
}
{
  const { world, chip } = setupWorld('74x209');
  const wmW = makeWm(chip, { A0:1,A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,A7:1,A8:1,A9:0,
    DIN:1, CS:0, WE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,A7:1,A8:1,A9:0,
    DIN:0, CS:0, WE:1 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74209: wrote 1 to addr511 -> DOUT=HIGH');
}
{
  const { world, chip } = setupWorld('74x209');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,
    DIN:0, CS:0, WE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,
    DIN:0, CS:0, WE:1 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74209: addr0 default 0 -> DOUT=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G5: 74210
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG5: 74210 - Octal inverting buffer (3-state)');
{
  const { world, chip } = setupWorld('74x210');
  const wm = makeWm(chip, {
    '1OE':0, '1A1':1, '1A2':0, '1A3':1, '1A4':0,
    '2OE':1, '2A1':0, '2A2':0, '2A3':0, '2A4':0,
  });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y1'))),  '74210: 1OE=0, 1A1=1 -> 1Y1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y2'))), '74210: 1OE=0, 1A2=0 -> 1Y2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y3'))),  '74210: 1OE=0, 1A3=1 -> 1Y3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y4'))), '74210: 1OE=0, 1A4=0 -> 1Y4=HIGH');
  const v2y1 = getPinVoltage(sim, findPin(chip, '2Y1'));
  assert(v2y1 === undefined || isLow(v2y1), '74210: 2OE=1 -> 2Y1 floating');
}

// ─────────────────────────────────────────────────────────────────────────────
// G6: 74211
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG6: 74211 - 16x9 RAM with latch');
{
  const { world, chip } = setupWorld('74x211');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,
    IO0:0,IO1:0,IO2:0,IO3:0,IO4:0,IO5:0,IO6:0,IO7:0,
    WE:1, CE:1, OE:0, LE:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'IO0'));
  assert(v === undefined || isLow(v), '74211: CE=1 -> IO0 floating');
}
{
  const { world, chip } = setupWorld('74x211');
  const wmW = makeWm(chip, { A0:1,A1:0,A2:1,A3:0,
    IO0:0,IO1:1,IO2:0,IO3:1,IO4:0,IO5:0,IO6:1,IO7:1,
    WE:0, CE:0, OE:0, LE:1, NC1:0, NC2:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:0,A2:1,A3:0,
    WE:1, CE:0, OE:0, LE:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO0'))),  '74211: IO0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO1'))), '74211: IO1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO2'))),  '74211: IO2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO3'))), '74211: IO3=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO4'))),  '74211: IO4=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO5'))),  '74211: IO5=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO6'))), '74211: IO6=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO7'))), '74211: IO7=HIGH');
}
{
  const { world, chip } = setupWorld('74x211');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,
    IO0:1,IO1:1,IO2:1,IO3:1,IO4:1,IO5:1,IO6:1,IO7:1,
    WE:0, CE:0, OE:0, LE:1, NC1:0, NC2:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,
    IO0:0,IO1:0,IO2:0,IO3:0,IO4:0,IO5:0,IO6:0,IO7:0,
    WE:1, CE:0, OE:1, LE:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wmR);
  const v = getPinVoltage(sim, findPin(chip, 'IO0'));
  assert(v === undefined || isLow(v), '74211: OE=1 -> IO0 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G7: 74212
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG7: 74212 - 16x9 RAM (no latch)');
{
  const { world, chip } = setupWorld('74x212');
  const wmW = makeWm(chip, { A0:1,A1:1,A2:0,A3:0,
    IO0:0,IO1:1,IO2:0,IO3:1,IO4:0,IO5:1,IO6:0,IO7:1,
    WE:0, CE:0, OE:0, NC1:0, NC2:0, NC3:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:1,A2:0,A3:0,
    WE:1, CE:0, OE:0, NC1:0, NC2:0, NC3:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO0'))),  '74212: IO0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO1'))), '74212: IO1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO7'))), '74212: IO7=HIGH');
}
{
  const { world, chip } = setupWorld('74x212');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,
    IO0:0,IO1:0,IO2:0,IO3:0,IO4:0,IO5:0,IO6:0,IO7:0,
    WE:1, CE:1, OE:0, NC1:0, NC2:0, NC3:0 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'IO0'));
  assert(v === undefined || isLow(v), '74212: CE=1 -> IO0 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G8: 74213
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG8: 74213 - 16x12 RAM');
{
  const { world, chip } = setupWorld('74x213');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,
    IO0:0,IO1:1,IO2:0,IO3:1,IO4:0,IO5:1,IO6:0,IO7:1,IO8:0,IO9:1,IO10:0,IO11:1,
    WE:0, CE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,
    WE:1, CE:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO0'))),   '74213: IO0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO1'))),  '74213: IO1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO10'))),  '74213: IO10=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO11'))), '74213: IO11=HIGH');
}
{
  const { world, chip } = setupWorld('74x213');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,
    IO0:0,IO1:0,IO2:0,IO3:0,IO4:0,IO5:0,IO6:0,IO7:0,IO8:0,IO9:0,IO10:0,IO11:0,
    WE:1, CE:1 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'IO0'));
  assert(v === undefined || isLow(v), '74213: CE=1 -> IO0 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G9: 74214
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG9: 74214 - 1024x1 RAM');
{
  const { world, chip } = setupWorld('74x214');
  const wmW = makeWm(chip, { A0:1,A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,A7:1,A8:1,A9:1,
    DIN:1, CS:0, WE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,A7:1,A8:1,A9:1,
    DIN:0, CS:0, WE:1 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74214: addr1023 wrote1 -> DOUT=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G10: 74215
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG10: 74215 - 1024x1 RAM with power-down');
{
  const { world, chip } = setupWorld('74x215');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,
    DIN:0, PD:1, WE:1 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'DOUT'));
  assert(v === undefined || isLow(v), '74215: PD=1 -> DOUT floating/low');
}
{
  const { world, chip } = setupWorld('74x215');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:1,A3:1,A4:0,A5:0,A6:1,A7:0,A8:0,A9:0,
    DIN:1, PD:0, WE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:0,A2:1,A3:1,A4:0,A5:0,A6:1,A7:0,A8:0,A9:0,
    DIN:0, PD:0, WE:1 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT'))), '74215: addr100 wrote1 -> DOUT=HIGH');
}
{
  const { world, chip } = setupWorld('74x215');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,
    DIN:1, PD:0, WE:0 });
  simulate(world, chip, wmW);
  const wmPD = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,
    DIN:0, PD:1, WE:1 });
  const sim = simulate(world, chip, wmPD);
  const v = getPinVoltage(sim, findPin(chip, 'DOUT'));
  assert(v === undefined || isLow(v), '74215: PD=1 overrides stored -> DOUT HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G11: 74216
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG11: 74216 - 64x4 common I/O RAM');
{
  const { world, chip } = setupWorld('74x216');
  const wmW = makeWm(chip, { A0:1,A1:1,A2:1,A3:1,A4:0,A5:0,
    IO0:1,IO1:0,IO2:0,IO3:1, WE:0, CS:0, OE:0, NC1:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:1,A2:1,A3:1,A4:0,A5:0,
    WE:1, CS:0, OE:0, NC1:0 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO0'))), '74216: IO0=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO1'))),  '74216: IO1=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IO2'))),  '74216: IO2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IO3'))), '74216: IO3=HIGH');
}
{
  const { world, chip } = setupWorld('74x216');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0, WE:1, CS:1, OE:0, NC1:0 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'IO0'));
  assert(v === undefined || isLow(v), '74216: CS=1 -> IO0 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G12: 74217
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG12: 74217 - 64x4 separate I/O RAM');
{
  const { world, chip } = setupWorld('74x217');
  const wmW = makeWm(chip, { A0:1,A1:0,A2:1,A3:0,A4:0,A5:0,
    DIN0:0,DIN1:1,DIN2:1,DIN3:0, WE:0, CS:0, OE:0, NC1:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:0,A2:1,A3:0,A4:0,A5:0,
    DIN0:0,DIN1:0,DIN2:0,DIN3:0, WE:1, CS:0, OE:0, NC1:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT0'))),  '74217: DOUT0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT1'))), '74217: DOUT1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT2'))), '74217: DOUT2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT3'))),  '74217: DOUT3=LOW');
}
{
  const { world, chip } = setupWorld('74x217');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,
    DIN0:0,DIN1:0,DIN2:0,DIN3:0, WE:1, CS:1, OE:0, NC1:0 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'DOUT0'));
  assert(v === undefined || isLow(v), '74217: CS=1 -> DOUT0 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G13: 74218
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG13: 74218 - 32x8 common I/O RAM');
{
  const { world, chip } = setupWorld('74x218');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,
    IO0:1,IO1:1,IO2:1,IO3:1,IO4:1,IO5:1,IO6:1,IO7:1,
    WE:0, CS:0, OE:0, NC1:0, NC2:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,
    WE:1, CS:0, OE:0, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wmR);
  for (let i = 0; i < 8; i++) {
    assert(isHigh(getPinVoltage(sim, findPin(chip, `IO${i}`))), `74218: IO${i}=HIGH (0xFF)`);
  }
}
{
  const { world, chip } = setupWorld('74x218');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0,A4:0,
    WE:1, CS:1, OE:0, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'IO0'));
  assert(v === undefined || isLow(v), '74218: CS=1 -> IO0 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G14: 74219
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG14: 74219 - 16x4 non inverting RAM');
{
  const { world, chip } = setupWorld('74x219');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0,A3:0, D1:0,D2:0,D3:0,D4:0, CS:1, WE:0 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, 'Q1'));
  assert(v === undefined || isLow(v), '74219: CS=1 -> Q1 HiZ');
}
{
  const { world, chip } = setupWorld('74x219');
  const wmW = makeWm(chip, { A0:0,A1:0,A2:0,A3:0, D1:0,D2:1,D3:0,D4:1, CS:0, WE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:0,A1:0,A2:0,A3:0, D1:0,D2:0,D3:0,D4:0, CS:0, WE:1 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q1'))),  '74219: Q1=LOW (non-inv, stored 0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q2'))), '74219: Q2=HIGH (non-inv, stored 1)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Q3'))),  '74219: Q3=LOW (non-inv, stored 0)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q4'))), '74219: Q4=HIGH (non-inv, stored 1)');
}
{
  const { world, chip } = setupWorld('74x219');
  const wmW = makeWm(chip, { A0:1,A1:1,A2:0,A3:0, D1:1,D2:1,D3:1,D4:1, CS:0, WE:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { A0:1,A1:1,A2:0,A3:0, D1:0,D2:0,D3:0,D4:0, CS:0, WE:1 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q1'))), '74219: Q1=HIGH (stored 1, non-inv)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Q4'))), '74219: Q4=HIGH (stored 1, non-inv)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G15: 74222
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG15: 74222 - FIFO (16x4) sync with IR/OR/EF/FF');

function fifoRisingWr222(world, chip, din) {
  const wmL = makeWm(chip, { ...din, WR_CLK:0, RD_CLK:0, WR_EN:0, RD_EN:1, NC1:0, NC2:0 });
  simulate(world, chip, wmL);
  const wmH = makeWm(chip, { ...din, WR_CLK:1, RD_CLK:0, WR_EN:0, RD_EN:1, NC1:0, NC2:0 });
  return simulate(world, chip, wmH);
}

function fifoRisingRd222(world, chip) {
  const wmL = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:0, NC1:0, NC2:0 });
  simulate(world, chip, wmL);
  const wmH = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:1, WR_EN:1, RD_EN:0, NC1:0, NC2:0 });
  return simulate(world, chip, wmH);
}

{
  const { world, chip } = setupWorld('74x222');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,
    WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),   '74222: initial EF=LOW (empty)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))),  '74222: initial FF=HIGH (not full)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'IR'))),  '74222: initial IR=HIGH (input ready)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'OR'))),   '74222: initial OR=LOW (not ready)');
}
{
  const { world, chip } = setupWorld('74x222');
  fifoRisingWr222(world, chip, { DIN0:0,DIN1:1,DIN2:0,DIN3:1 });
  const simCheck = fifoRisingWr222(world, chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0 });
  assert(isHigh(getPinVoltage(simCheck, findPin(chip, 'EF'))), '74222: after write EF=HIGH (not empty)');
  assert(isHigh(getPinVoltage(simCheck, findPin(chip, 'OR'))), '74222: after write OR=HIGH');

  const simR = fifoRisingRd222(world, chip);
  assert(isLow(getPinVoltage(simR, findPin(chip, 'DOUT0'))),  '74222: DOUT0=LOW (read 0b0101)');
  assert(isHigh(getPinVoltage(simR, findPin(chip, 'DOUT1'))), '74222: DOUT1=HIGH');
  assert(isLow(getPinVoltage(simR, findPin(chip, 'DOUT2'))),  '74222: DOUT2=LOW');
  assert(isHigh(getPinVoltage(simR, findPin(chip, 'DOUT3'))), '74222: DOUT3=HIGH');
}
{
  const { world, chip } = setupWorld('74x222');
  for (let i = 0; i < 16; i++) {
    fifoRisingWr222(world, chip, { DIN0:i&1, DIN1:(i>>1)&1, DIN2:(i>>2)&1, DIN3:(i>>3)&1 });
  }
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,
    WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:1, NC1:0, NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'FF'))),   '74222: FF=LOW when full');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'IR'))),   '74222: IR=LOW when full');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'EF'))),  '74222: EF=HIGH (not empty, full)');
}

// ─────────────────────────────────────────────────────────────────────────────
// G16: 74224
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG16: 74224 - FIFO (16x4)');

function fifoRisingWr224(world, chip, din) {
  const wmL = makeWm(chip, { ...din, WR_CLK:0, RD_CLK:0, WR_EN:0, RD_EN:1 });
  simulate(world, chip, wmL);
  const wmH = makeWm(chip, { ...din, WR_CLK:1, RD_CLK:0, WR_EN:0, RD_EN:1 });
  return simulate(world, chip, wmH);
}

function fifoRisingRd224(world, chip) {
  const wmL = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:0 });
  simulate(world, chip, wmL);
  const wmH = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:1, WR_EN:1, RD_EN:0 });
  return simulate(world, chip, wmH);
}

{
  const { world, chip } = setupWorld('74x224');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,
    WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),  '74224: initial EF=LOW (empty)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))), '74224: initial FF=HIGH (not full)');
}
{
  const { world, chip } = setupWorld('74x224');
  fifoRisingWr224(world, chip, { DIN0:1,DIN1:0,DIN2:1,DIN3:0 });
  const simR = fifoRisingRd224(world, chip);
  assert(isHigh(getPinVoltage(simR, findPin(chip, 'DOUT0'))), '74224: DOUT0=HIGH');
  assert(isLow(getPinVoltage(simR, findPin(chip, 'DOUT1'))),  '74224: DOUT1=LOW');
  assert(isHigh(getPinVoltage(simR, findPin(chip, 'DOUT2'))), '74224: DOUT2=HIGH');
  assert(isLow(getPinVoltage(simR, findPin(chip, 'DOUT3'))),  '74224: DOUT3=LOW');
}
{
  const { world, chip } = setupWorld('74x224');
  for (let i = 0; i < 16; i++) {
    fifoRisingWr224(world, chip, { DIN0:i&1, DIN1:(i>>1)&1, DIN2:(i>>2)&1, DIN3:(i>>3)&1 });
  }
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,
    WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'FF'))),  '74224: FF=LOW when full');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'EF'))), '74224: EF=HIGH (not empty, full)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\\n${'-'.repeat(60)}`);
console.log(`TOTAL: ${pass + fail} tests | ${pass} passed | ${fail} failed`);
if (fail === 0) console.log('ALL TESTS PASSED');
else { console.error(`${fail} TESTS FAILED`); process.exit(1); }
