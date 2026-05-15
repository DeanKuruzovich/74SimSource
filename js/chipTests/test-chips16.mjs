// test-chips16.mjs - Tests for all chips defined in js/chips/chips16.js

import { CHIPS_BLOCK_16 } from '../chips/chips16.js';
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
  '74225', '74226', '74227', '74228', '74229', '74230', '74231', '74232',
  '74233', '74234', '74235', '74236', '74237', '74238', '74239', '74241',
];

console.log('\nS1: All chip IDs present in CHIPS_BLOCK_16');
for (const id of EXPECTED_CHIP_IDS) {
  assert(id in CHIPS_BLOCK_16, `Chip ${id} exists`);
}
assert(Object.keys(CHIPS_BLOCK_16).length === EXPECTED_CHIP_IDS.length,
  `CHIPS_BLOCK_16 has exactly ${EXPECTED_CHIP_IDS.length} chips`);

console.log('\nS2: Required fields on every chip');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_16)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id} has field '${f}'`);
    }
  }
}

console.log('\nS3: VCC/GND pins exist on every chip');
for (const [id, def] of Object.entries(CHIPS_BLOCK_16)) {
  const pinNames = def.pinout.map(p => p.name);
  assert(pinNames.includes('VCC'), `${id} has VCC pin`);
  assert(pinNames.includes('GND'), `${id} has GND pin`);
}

// ─────────────────────────────────────────────────────────────────────────────
// G1: 74225 - FIFO 16x5 Async
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG1: 74225 - FIFO 16x5 Async');
{
  // Empty FIFO: EF=LOW (active LOW empty), FF=HIGH (not full)
  const { world, chip } = setupWorld('74225');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),  '74225: empty FIFO -> EF=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))), '74225: empty FIFO -> FF=HIGH');
}
{
  // Write 10101 and read it back with OE=LOW
  const { world, chip } = setupWorld('74225');
  const wmW = makeWm(chip, { DIN0:1,DIN1:0,DIN2:1,DIN3:0,DIN4:1, WR:0, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:0, OE:0, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT0'))), '74225: DOUT0=HIGH (wrote 10101)');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT1'))),  '74225: DOUT1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT2'))), '74225: DOUT2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT3'))),  '74225: DOUT3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT4'))), '74225: DOUT4=HIGH');
}
{
  // OE=HIGH: data outputs should be HiZ
  const { world, chip } = setupWorld('74225');
  const wmW = makeWm(chip, { DIN0:1,DIN1:1,DIN2:1,DIN3:1,DIN4:1, WR:0, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:0, OE:1, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wmR);
  const v = getPinVoltage(sim, findPin(chip, 'DOUT0'));
  assert(v === undefined || isLow(v), '74225: OE=HIGH -> DOUT0 HiZ/floating');
}
{
  // Non-empty FIFO: EF=HIGH
  const { world, chip } = setupWorld('74225');
  const wmW = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:0, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wmW);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'EF'))), '74225: non-empty -> EF=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G2: 74226 - 4 bit Latched Bus Transceiver
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG2: 74226 - Latched Bus Transceiver');
{
  // DIR=1, LE=1 (transparent), OEB=0: A->B, read A, drive B
  // Do NOT wire B pins - chip drives them as outputs
  const { world, chip } = setupWorld('74226');
  const wm = makeWm(chip, { A1:1, A2:0, A3:1, A4:0, OEA:1, OEB:0, DIR:1, LE:1, NC1:0,NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'B1'))), '74226: DIR=A->B, A1=1 -> B1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'B2'))),  '74226: DIR=A->B, A2=0 -> B2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'B3'))), '74226: DIR=A->B, A3=1 -> B3=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'B4'))),  '74226: DIR=A->B, A4=0 -> B4=LOW');
}
{
  // DIR=0, LE=1 (transparent), OEA=0: B->A
  // Do NOT wire A pins - chip drives them as outputs
  const { world, chip } = setupWorld('74226');
  const wm = makeWm(chip, { B1:1, B2:0, B3:1, B4:0, OEA:0, OEB:1, DIR:0, LE:1, NC1:0,NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'A1'))), '74226: DIR=B->A, B1=1 -> A1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'A2'))),  '74226: DIR=B->A, B2=0 -> A2=LOW');
}
{
  // LE=0 (hold), latch retains last transparent value
  // First pass: LE=1, A inputs HIGH, do NOT wire B pins
  const { world, chip } = setupWorld('74226');
  const wmLe1 = makeWm(chip, { A1:1, A2:1, A3:1, A4:1, OEA:1, OEB:0, DIR:1, LE:1, NC1:0,NC2:0 });
  simulate(world, chip, wmLe1);
  // Second pass: LE=0, A inputs LOW (latch should hold previous HIGH), do NOT wire B pins
  const wmLe0 = makeWm(chip, { A1:0, A2:0, A3:0, A4:0, OEA:1, OEB:0, DIR:1, LE:0, NC1:0,NC2:0 });
  const sim = simulate(world, chip, wmLe0);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'B1'))), '74226: LE=0, latch holds A1=1 -> B1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'B2'))), '74226: LE=0, latch holds A2=1 -> B2=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G3: 74227 - FIFO 16x4 Sync OC IR/OR
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG3: 74227 - FIFO 16x4 Sync OC');
{
  // Empty state: EF=LOW (active LOW empty)
  const { world, chip } = setupWorld('74227');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:1, NC1:0,NC2:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),  '74227: empty -> EF=LOW (active LOW)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))), '74227: not full -> FF=HIGH');
}
{
  // Write on rising WR_CLK edge (WR_EN=0), then read on rising RD_CLK edge (RD_EN=0)
  const { world, chip } = setupWorld('74227');
  const wmW = makeWm(chip, { DIN0:1,DIN1:0,DIN2:1,DIN3:0, WR_CLK:0, RD_CLK:0, WR_EN:0, RD_EN:1, NC1:0,NC2:0 });
  simulate(world, chip, wmW);
  const wmW2 = makeWm(chip, { DIN0:1,DIN1:0,DIN2:1,DIN3:0, WR_CLK:1, RD_CLK:0, WR_EN:0, RD_EN:1, NC1:0,NC2:0 });
  simulate(world, chip, wmW2);
  const wmR1 = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:0, NC1:0,NC2:0 });
  simulate(world, chip, wmR1);
  const wmR2 = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:1, WR_EN:1, RD_EN:0, NC1:0,NC2:0 });
  const sim = simulate(world, chip, wmR2);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT0'))), '74227: DOUT0=HIGH after read');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT1'))),  '74227: DOUT1=LOW after read');
}

// ─────────────────────────────────────────────────────────────────────────────
// G4: 74228 - FIFO 16x4 Sync OC (EF/FF only)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG4: 74228 - FIFO 16x4 Sync OC');
{
  const { world, chip } = setupWorld('74228');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:1, NC1:0,NC2:0,NC3:0,NC4:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))), '74228: empty -> EF=LOW');
}
{
  const { world, chip } = setupWorld('74228');
  const wmW = makeWm(chip, { DIN0:0,DIN1:1,DIN2:0,DIN3:1, WR_CLK:0, RD_CLK:0, WR_EN:0, RD_EN:1, NC1:0,NC2:0,NC3:0,NC4:0 });
  simulate(world, chip, wmW);
  const wmW2 = makeWm(chip, { DIN0:0,DIN1:1,DIN2:0,DIN3:1, WR_CLK:1, RD_CLK:0, WR_EN:0, RD_EN:1, NC1:0,NC2:0,NC3:0,NC4:0 });
  simulate(world, chip, wmW2);
  const wmR1 = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:0, WR_EN:1, RD_EN:0, NC1:0,NC2:0,NC3:0,NC4:0 });
  simulate(world, chip, wmR1);
  const wmR2 = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0, RD_CLK:1, WR_EN:1, RD_EN:0, NC1:0,NC2:0,NC3:0,NC4:0 });
  const sim = simulate(world, chip, wmR2);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT0'))),  '74228: DOUT0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT1'))), '74228: DOUT1=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G5: 74229 - FIFO 16x5 Async (same gate as 74225)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG5: 74229 - FIFO 16x5 Async');
{
  const { world, chip } = setupWorld('74229');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),  '74229: empty -> EF=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))), '74229: empty -> FF=HIGH');
}
{
  const { world, chip } = setupWorld('74229');
  const wmW = makeWm(chip, { DIN0:0,DIN1:1,DIN2:1,DIN3:0,DIN4:1, WR:0, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:0, OE:0, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT0'))),  '74229: DOUT0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT1'))), '74229: DOUT1=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT2'))), '74229: DOUT2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT3'))),  '74229: DOUT3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT4'))), '74229: DOUT4=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G6: 74230 - Dual 4 bit Buffer (Inverting + Non-inverting)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG6: 74230 - Inv+Non-Inv 4 bit Buffers');
{
  // Group 1 (TRI_NOT_LO): 1OE=0 -> 1Y = NOT(1A)
  const { world, chip } = setupWorld('74230');
  const wm = makeWm(chip, { '1OE':0, '1A1':1,'1A2':0,'1A3':1,'1A4':0, '2OE':1, '2A1':0,'2A2':0,'2A3':0,'2A4':0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y1'))),  '74230: 1OE=0, 1A1=1 -> 1Y1=LOW (inv)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y2'))), '74230: 1OE=0, 1A2=0 -> 1Y2=HIGH (inv)');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y3'))),  '74230: 1OE=0, 1A3=1 -> 1Y3=LOW (inv)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y4'))), '74230: 1OE=0, 1A4=0 -> 1Y4=HIGH (inv)');
}
{
  // Group 2 (TRI_BUFFER_LO): 2OE=0 -> 2Y = 2A
  const { world, chip } = setupWorld('74230');
  const wm = makeWm(chip, { '1OE':1, '1A1':0,'1A2':0,'1A3':0,'1A4':0, '2OE':0, '2A1':1,'2A2':0,'2A3':1,'2A4':0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y1'))), '74230: 2OE=0, 2A1=1 -> 2Y1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y2'))),  '74230: 2OE=0, 2A2=0 -> 2Y2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y3'))), '74230: 2OE=0, 2A3=1 -> 2Y3=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y4'))),  '74230: 2OE=0, 2A4=0 -> 2Y4=LOW');
}
{
  // Disabled: HiZ
  const { world, chip } = setupWorld('74230');
  const wm = makeWm(chip, { '1OE':1, '1A1':1,'1A2':1,'1A3':1,'1A4':1, '2OE':1, '2A1':1,'2A2':1,'2A3':1,'2A4':1 });
  const sim = simulate(world, chip, wm);
  const v1 = getPinVoltage(sim, findPin(chip, '1Y1'));
  const v2 = getPinVoltage(sim, findPin(chip, '2Y1'));
  assert(v1 === undefined || isLow(v1), '74230: 1OE=1 -> 1Y1 HiZ');
  assert(v2 === undefined || isLow(v2), '74230: 2OE=1 -> 2Y1 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G7: 74231 - Dual 4 bit Inv Buffer (negative + positive OE)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG7: 74231 - Dual Inv Buffer (neg+pos OE)');
{
  // Group 1 (TRI_NOT_LO): 1OE=0 -> 1Y = NOT(1A)
  const { world, chip } = setupWorld('74231');
  const wm = makeWm(chip, { '1OE':0, '1A1':1,'1A2':0,'1A3':0,'1A4':1, '2OE':0, '2A1':0,'2A2':1,'2A3':1,'2A4':0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y1'))),  '74231: 1OE=0, 1A1=1 -> 1Y1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y2'))), '74231: 1OE=0, 1A2=0 -> 1Y2=HIGH');
}
{
  // Group 2 (TRI_NOT_HI): 2OE=1 -> 2Y = NOT(2A)
  const { world, chip } = setupWorld('74231');
  const wm = makeWm(chip, { '1OE':1, '1A1':0,'1A2':0,'1A3':0,'1A4':0, '2OE':1, '2A1':1,'2A2':0,'2A3':1,'2A4':0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y1'))),  '74231: 2OE=1, 2A1=1 -> 2Y1=LOW (inv)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y2'))), '74231: 2OE=1, 2A2=0 -> 2Y2=HIGH (inv)');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y3'))),  '74231: 2OE=1, 2A3=1 -> 2Y3=LOW (inv)');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y4'))), '74231: 2OE=1, 2A4=0 -> 2Y4=HIGH (inv)');
}
{
  // Group 2 disabled (2OE=0): HiZ
  const { world, chip } = setupWorld('74231');
  const wm = makeWm(chip, { '1OE':1, '1A1':0,'1A2':0,'1A3':0,'1A4':0, '2OE':0, '2A1':1,'2A2':1,'2A3':1,'2A4':1 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, '2Y1'));
  assert(v === undefined || isLow(v), '74231: 2OE=0 -> 2Y1 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G8: 74232 - FIFO 16x4 Async
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG8: 74232 - FIFO 16x4 Async');
{
  const { world, chip } = setupWorld('74232');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR:1, RD:1, OE:1, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),  '74232: empty -> EF=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))), '74232: empty -> FF=HIGH');
}
{
  const { world, chip } = setupWorld('74232');
  const wmW = makeWm(chip, { DIN0:1,DIN1:1,DIN2:0,DIN3:0, WR:0, RD:1, OE:1, NC1:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR:1, RD:0, OE:0, NC1:0 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT0'))), '74232: DOUT0=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT1'))), '74232: DOUT1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT2'))),  '74232: DOUT2=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT3'))),  '74232: DOUT3=LOW');
}
{
  // OE=HIGH -> HiZ outputs
  const { world, chip } = setupWorld('74232');
  const wmW = makeWm(chip, { DIN0:1,DIN1:1,DIN2:1,DIN3:1, WR:0, RD:1, OE:1, NC1:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR:1, RD:0, OE:1, NC1:0 });
  const sim = simulate(world, chip, wmR);
  const v = getPinVoltage(sim, findPin(chip, 'DOUT0'));
  assert(v === undefined || isLow(v), '74232: OE=HIGH -> DOUT0 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// G9: 74233 - FIFO 16x5 Async
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG9: 74233 - FIFO 16x5 Async');
{
  const { world, chip } = setupWorld('74233');
  const wmW = makeWm(chip, { DIN0:1,DIN1:1,DIN2:1,DIN3:1,DIN4:0, WR:0, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:0, OE:0, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT0'))), '74233: DOUT0=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT3'))), '74233: DOUT3=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT4'))),  '74233: DOUT4=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G10: 74234 - FIFO 64x4 Async
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG10: 74234 - FIFO 64x4 Async');
{
  const { world, chip } = setupWorld('74234');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR:1, RD:1, OE:1, NC1:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),  '74234: empty -> EF=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))), '74234: empty -> FF=HIGH');
}
{
  const { world, chip } = setupWorld('74234');
  const wmW = makeWm(chip, { DIN0:0,DIN1:1,DIN2:0,DIN3:1, WR:0, RD:1, OE:1, NC1:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR:1, RD:0, OE:0, NC1:0 });
  const sim = simulate(world, chip, wmR);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT0'))),  '74234: DOUT0=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT1'))), '74234: DOUT1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT2'))),  '74234: DOUT2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT3'))), '74234: DOUT3=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G11: 74235 - FIFO 64x5 Async
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG11: 74235 - FIFO 64x5 Async');
{
  const { world, chip } = setupWorld('74235');
  const wm = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'EF'))),  '74235: empty -> EF=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'FF'))), '74235: empty -> FF=HIGH');
}
{
  const { world, chip } = setupWorld('74235');
  const wmW = makeWm(chip, { DIN0:1,DIN1:0,DIN2:0,DIN3:1,DIN4:1, WR:0, RD:1, OE:1, NC1:0,NC2:0,NC3:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,DIN4:0, WR:1, RD:0, OE:0, NC1:0,NC2:0,NC3:0 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT0'))), '74235: DOUT0=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT1'))),  '74235: DOUT1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT3'))), '74235: DOUT3=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT4'))), '74235: DOUT4=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G12: 74236 - FIFO 64x4 Async (same as 74234)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG12: 74236 - FIFO 64x4 Async');
{
  const { world, chip } = setupWorld('74236');
  const wmW = makeWm(chip, { DIN0:1,DIN1:1,DIN2:0,DIN3:1, WR:0, RD:1, OE:1, NC1:0 });
  simulate(world, chip, wmW);
  const wmR = makeWm(chip, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR:1, RD:0, OE:0, NC1:0 });
  const sim = simulate(world, chip, wmR);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT0'))), '74236: DOUT0=HIGH');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT1'))), '74236: DOUT1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'DOUT2'))),  '74236: DOUT2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'DOUT3'))), '74236: DOUT3=HIGH');
}

// ─────────────────────────────────────────────────────────────────────────────
// G13: 74237 - 3-to-8 Decoder with Latch (active HIGH)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG13: 74237 - 3-to-8 Decoder with Latch (active HIGH)');
{
  // Enabled: E1n=0, E2=HIGH; LE=1; A=000 -> Y0=HIGH
  const { world, chip } = setupWorld('74237');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0, E1n:0,E2:1, LE:1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74237: A=000 -> Y0=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y1'))),  '74237: A=000 -> Y1=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y7'))),  '74237: A=000 -> Y7=LOW');
}
{
  // A=101 (5) -> Y5=HIGH
  const { world, chip } = setupWorld('74237');
  const wm = makeWm(chip, { A0:1,A1:0,A2:1, E1n:0,E2:1, LE:1 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y5'))), '74237: A=101 -> Y5=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y0'))),  '74237: A=101 -> Y0=LOW');
}
{
  // Latch: set A=011, LE=1; then change A=111, LE=0 -> Y3 should still be HIGH
  const { world, chip } = setupWorld('74237');
  const wmLe1 = makeWm(chip, { A0:1,A1:1,A2:0, E1n:0,E2:1, LE:1 });
  simulate(world, chip, wmLe1);
  const wmLe0 = makeWm(chip, { A0:1,A1:1,A2:1, E1n:0,E2:1, LE:0 });
  const sim = simulate(world, chip, wmLe0);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y3'))), '74237: LE=0 holds Y3=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y7'))),  '74237: LE=0 holds Y7=LOW');
}
{
  // Disabled: E2=0 -> all outputs LOW
  const { world, chip } = setupWorld('74237');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0, E1n:0,E2:0, LE:1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y0'))), '74237: disabled (E2=0) -> Y0=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G14: 74238 - 3-to-8 Decoder (active HIGH)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG14: 74238 - 3-to-8 Decoder (active HIGH)');
{
  // Enabled: E3=1, E1n=0, E2n=0; A=000 -> Y0=HIGH
  const { world, chip } = setupWorld('74238');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0, E3:1,E1n:0,E2n:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y0'))), '74238: A=000 -> Y0=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y1'))),  '74238: A=000 -> Y1=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y7'))),  '74238: A=000 -> Y7=LOW');
}
{
  // A=111 (7) -> Y7=HIGH
  const { world, chip } = setupWorld('74238');
  const wm = makeWm(chip, { A0:1,A1:1,A2:1, E3:1,E1n:0,E2n:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y7'))), '74238: A=111 -> Y7=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y0'))),  '74238: A=111 -> Y0=LOW');
}
{
  // A=011 (3) -> Y3=HIGH
  const { world, chip } = setupWorld('74238');
  const wm = makeWm(chip, { A0:1,A1:1,A2:0, E3:1,E1n:0,E2n:0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, 'Y3'))), '74238: A=011 -> Y3=HIGH');
}
{
  // Disabled: E3=0 -> all outputs LOW
  const { world, chip } = setupWorld('74238');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0, E3:0,E1n:0,E2n:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y0'))), '74238: E3=0 -> all outputs LOW');
}
{
  // Disabled: E1n=1 -> all outputs LOW
  const { world, chip } = setupWorld('74238');
  const wm = makeWm(chip, { A0:0,A1:0,A2:0, E3:1,E1n:1,E2n:0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, 'Y0'))), '74238: E1n=1 -> all outputs LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G15: 74239 - Dual 2-to-4 Decoder (active HIGH)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG15: 74239 - Dual 2-to-4 Decoder (active HIGH)');
{
  // Section 1: 1E=1, 1A0=0, 1A1=0 -> 1Y0=HIGH
  const { world, chip } = setupWorld('74239');
  const wm = makeWm(chip, { '1E':1,'1A0':0,'1A1':0, '2E':0,'2A0':0,'2A1':0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y0'))), '74239: 1E=1, A=00 -> 1Y0=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y1'))),  '74239: 1E=1, A=00 -> 1Y1=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y2'))),  '74239: 1E=1, A=00 -> 1Y2=LOW');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y3'))),  '74239: 1E=1, A=00 -> 1Y3=LOW');
}
{
  // Section 1: 1A0=1, 1A1=1 -> 1Y3=HIGH
  const { world, chip } = setupWorld('74239');
  const wm = makeWm(chip, { '1E':1,'1A0':1,'1A1':1, '2E':0,'2A0':0,'2A1':0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y3'))), '74239: 1E=1, A=11 -> 1Y3=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y0'))),  '74239: 1E=1, A=11 -> 1Y0=LOW');
}
{
  // Section 2: 2E=1, 2A0=1, 2A1=0 -> 2Y1=HIGH
  const { world, chip } = setupWorld('74239');
  const wm = makeWm(chip, { '1E':0,'1A0':0,'1A1':0, '2E':1,'2A0':1,'2A1':0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y1'))), '74239: 2E=1, A=01 -> 2Y1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y0'))),  '74239: 2E=1, A=01 -> 2Y0=LOW');
}
{
  // Disabled: 1E=0 -> all outputs LOW
  const { world, chip } = setupWorld('74239');
  const wm = makeWm(chip, { '1E':0,'1A0':0,'1A1':0, '2E':0,'2A0':0,'2A1':0 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y0'))), '74239: 1E=0 -> 1Y0=LOW');
}

// ─────────────────────────────────────────────────────────────────────────────
// G16: 74241 - Octal Buffer (non-inv + non-inv, neg+pos OE)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nG16: 74241 - Octal Buffer');
{
  // Group 1 (TRI_BUFFER_LO): 1OE=0 -> 1Y = 1A
  const { world, chip } = setupWorld('74241');
  const wm = makeWm(chip, { '1OE':0, '1A1':1,'1A2':0,'1A3':1,'1A4':0, '2OE':1, '2A1':0,'2A2':0,'2A3':0,'2A4':0 });
  const sim = simulate(world, chip, wm);
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y1'))), '74241: 1OE=0, 1A1=1 -> 1Y1=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y2'))),  '74241: 1OE=0, 1A2=0 -> 1Y2=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '1Y3'))), '74241: 1OE=0, 1A3=1 -> 1Y3=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '1Y4'))),  '74241: 1OE=0, 1A4=0 -> 1Y4=LOW');
}
{
  // Group 2 (TRI_BUFFER_HI): 2OE=1 -> 2Y = 2A
  const { world, chip } = setupWorld('74241');
  const wm = makeWm(chip, { '1OE':1, '1A1':0,'1A2':0,'1A3':0,'1A4':0, '2OE':1, '2A1':0,'2A2':1,'2A3':0,'2A4':1 });
  const sim = simulate(world, chip, wm);
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y1'))),  '74241: 2OE=1, 2A1=0 -> 2Y1=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y2'))), '74241: 2OE=1, 2A2=1 -> 2Y2=HIGH');
  assert(isLow(getPinVoltage(sim, findPin(chip, '2Y3'))),  '74241: 2OE=1, 2A3=0 -> 2Y3=LOW');
  assert(isHigh(getPinVoltage(sim, findPin(chip, '2Y4'))), '74241: 2OE=1, 2A4=1 -> 2Y4=HIGH');
}
{
  // Group 1 disabled (1OE=1): HiZ
  const { world, chip } = setupWorld('74241');
  const wm = makeWm(chip, { '1OE':1, '1A1':1,'1A2':1,'1A3':1,'1A4':1, '2OE':0, '2A1':0,'2A2':0,'2A3':0,'2A4':0 });
  const sim = simulate(world, chip, wm);
  const v1 = getPinVoltage(sim, findPin(chip, '1Y1'));
  assert(v1 === undefined || isLow(v1), '74241: 1OE=1 -> 1Y1 HiZ');
}
{
  // Group 2 disabled (2OE=0): HiZ
  const { world, chip } = setupWorld('74241');
  const wm = makeWm(chip, { '1OE':1, '1A1':0,'1A2':0,'1A3':0,'1A4':0, '2OE':0, '2A1':1,'2A2':1,'2A3':1,'2A4':1 });
  const sim = simulate(world, chip, wm);
  const v = getPinVoltage(sim, findPin(chip, '2Y1'));
  assert(v === undefined || isLow(v), '74241: 2OE=0 -> 2Y1 HiZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'-'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
if (fail > 0) process.exit(1);
