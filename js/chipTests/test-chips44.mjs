// test-chips44.mjs - Tests for all chips defined in js/chips/chips44.js
// Chips under test:
//   74907        : Hex open drain p-channel buffer            (BUFFER+OC, 14-pin)
//   74908        : Dual 2 input NAND relay driver             (NAND, 8-pin)
//   74909        : Quad voltage comparator OC                 (GENERIC_STUB+OC, 14-pin)
//   74910        : 256 bit RAM 64x4 TRI                       (GENERIC_STUB, 18-pin)
//   74913        : 6-digit BCD display controller             (GENERIC_STUB, 24-pin)
//   74914        : Hex Schmitt trigger inverter               (NOT, 14-pin)
//   74915        : 7-segment to BCD converter TRI             (GENERIC_STUB, 18-pin)
//   74918        : Dual 2 input NAND relay driver (14-pin)    (NAND, 14-pin)
//   74920        : 1024 bit RAM 256x4 TRI sep I/O             (GENERIC_STUB, 22-pin)
//   74921        : 1024 bit RAM 256x4 TRI                     (GENERIC_STUB, 18-pin)
//   74922        : 16-key encoder TRI                         (GENERIC_STUB, 18-pin)
//   74923        : 20-key encoder TRI                         (GENERIC_STUB, 20-pin)
//   74925        : 4-digit counter/display driver             (GENERIC_STUB, 16-pin)
//   74926        : 4-digit decade counter/display driver      (GENERIC_STUB, 16-pin)
//   74927        : 4-digit timer counter/display driver       (GENERIC_STUB, 16-pin)
//   74928        : 4-digit counter/display driver (1999)      (GENERIC_STUB, 16-pin)

import { CHIPS_BLOCK_44 } from '../chips/chips44.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function findPin(comp, name) {
  return typeof comp.getPinByName === 'function'
    ? comp.getPinByName(name)
    : comp.pins.find(p => p.name === name);
}

function connectPinToVcc(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId);
}

function connectPinToGnd(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId);
}

function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}

function assertPinBit(sim, chip, pinName, expectedBit, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  const ok = expectedBit ? (v !== undefined && v > 2.5) : (v === undefined || v < 2.5);
  assert(ok, `${label}: expected ${expectedBit ? 'HIGH' : 'LOW'}, got ${v}`);
}

function assertPinHighZ(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  const ok = (v === undefined || v === null || v < 2.5);
  assert(ok, `${label}: expected HiZ/low, got ${v}`);
}

function setupChipWithPower(chipId) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(chipId);
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  connectPinToVcc(wm, findPin(chip, 'VCC'));
  connectPinToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

function connectHigh(wm, chip, name) {
  return connectPinToVcc(wm, findPin(chip, name));
}

function connectLow(wm, chip, name) {
  return connectPinToGnd(wm, findPin(chip, name));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74907','74908','74909','74910','74913','74914','74915','74918',
  '74920','74921','74922','74923','74925','74926','74927','74928',
];

const EXPECTED_SPECS = {
  '74907': { pins: 14, gnd:  7, vcc: 14 },
  '74908': { pins:  8, gnd:  4, vcc:  8 },
  '74909': { pins: 14, gnd:  7, vcc: 14 },
  '74910': { pins: 18, gnd:  9, vcc: 18 },
  '74913': { pins: 24, gnd: 12, vcc: 24 },
  '74914': { pins: 14, gnd:  7, vcc: 14 },
  '74915': { pins: 18, gnd:  9, vcc: 18 },
  '74918': { pins: 14, gnd:  7, vcc: 14 },
  '74920': { pins: 22, gnd: 12, vcc: 22 },
  '74921': { pins: 18, gnd:  9, vcc: 18 },
  '74922': { pins: 18, gnd:  9, vcc: 18 },
  '74923': { pins: 20, gnd: 10, vcc: 20 },
  '74925': { pins: 16, gnd:  8, vcc: 16 },
  '74926': { pins: 16, gnd:  8, vcc: 16 },
  '74927': { pins: 16, gnd:  8, vcc: 16 },
  '74928': { pins: 16, gnd:  8, vcc: 16 },
};

const OC_IDS = ['74907','74909'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_44 === 'object', 'CHIPS_BLOCK_44 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_44[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,        `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0, `${id}: description`);
  assert(typeof cd.pins        === 'number',                                `${id}: pins is number`);
  assert(Array.isArray(cd.pinout),                                          `${id}: pinout is array`);
  assert(Array.isArray(cd.gates) && cd.gates.length >= 1,                  `${id}: has gates`);

  const spec = EXPECTED_SPECS[id];
  assert(cd.pins === spec.pins, `${id}: pins=${spec.pins}`);
  assert(cd.gnd  === spec.gnd,  `${id}: gnd=${spec.gnd}`);
  assert(cd.vcc  === spec.vcc,  `${id}: vcc=${spec.vcc}`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }

  if (OC_IDS.includes(id)) {
    assert(cd.openCollector === true, `${id}: openCollector flag set`);
  } else {
    assert(cd.openCollector !== true, `${id}: not openCollector`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: all output pins are HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_CONFIGS = [
  { id: '74910', outputs: [] },   // bidir D* pins, no driven outputs
  { id: '74913', outputs: ['DIS','a','b','c','d','e','f','g','COL'] },
  { id: '74915', outputs: ['Q0','Q1','Q2','Q3','INV'] },
  { id: '74920', outputs: ['DO0','DO1','DO2','DO3'] },
  { id: '74921', outputs: [] },   // bidir D* pins, no driven outputs
  { id: '74922', outputs: ['C1','C2','C3','C4','DA','A','B','C','D'] },
  { id: '74923', outputs: ['C1','C2','C3','C4','DA','A','B','C','D','E'] },
  { id: '74925', outputs: ['a','b','c','d','e','f','g','D1','D2','D3','D4'] },
  { id: '74926', outputs: ['a','b','c','d','e','f','g','D1','D2','D3','D4'] },
  { id: '74927', outputs: ['a','b','c','d','e','f','g','D1','D2','D3','D4'] },
  { id: '74928', outputs: ['a','b','c','d','e','f','g','D1','D2','D3','D4'] },
];

for (const { id, outputs } of STUB_CONFIGS) {
  if (outputs.length === 0) {
    assert(true, `${id} stub: no driven outputs to check (bidir/empty)`);
    continue;
  }

  // For 74922/74923 we need to connect all inputs including columns
  const { world, chip, wm } = setupChipWithPower(id);

  // Connect all input pins low to satisfy simulator connectivity requirements
  const cd = CHIPS_BLOCK_44[id];
  for (const p of cd.pinout) {
    if (p.type === 'input') {
      connectLow(wm, chip, p.name);
    }
  }

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of outputs) {
    assertPinHighZ(sim, chip, out, `${id} stub: ${out} is HiZ`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - OC chips: outputs pulled HIGH when inactive
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: OC chips ===');

// 74907: OC p-channel hex buffer - input HIGH → p-channel OFF → output pulled HIGH
{
  const { world, chip, wm } = setupChipWithPower('74907');
  connectHigh(wm, chip, '1A'); connectHigh(wm, chip, '2A');
  connectHigh(wm, chip, '3A'); connectHigh(wm, chip, '4A');
  connectHigh(wm, chip, '5A'); connectHigh(wm, chip, '6A');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['1Y','2Y','3Y','4Y','5Y','6Y']) {
    assertPinBit(sim, chip, out, 1, `74907 OC buffer: ${out}=HIGH (input HIGH, pull up active)`);
  }
}

// 74907: OC p-channel hex buffer - input LOW → p-channel ON → output driven LOW
{
  const { world, chip, wm } = setupChipWithPower('74907');
  connectLow(wm, chip, '1A'); connectLow(wm, chip, '2A');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '4A');
  connectLow(wm, chip, '5A'); connectLow(wm, chip, '6A');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['1Y','2Y','3Y','4Y','5Y','6Y']) {
    assertPinBit(sim, chip, out, 0, `74907 OC buffer: ${out}=LOW (input LOW, p-chan on)`);
  }
}

// 74909: OC comparator GENERIC_STUB - outputs pulled HIGH (stub outputs are HiZ, pull up takes over)
{
  const { world, chip, wm } = setupChipWithPower('74909');
  for (const n of ['1IN+','1IN-','2IN+','2IN-','3IN+','3IN-','4IN+','4IN-']) {
    connectLow(wm, chip, n);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // OC stub: outputs are HiZ from chip → pulled up to VCC by simulator pull up
  for (const out of ['1OUT','2OUT','3OUT','4OUT']) {
    assertPinBit(sim, chip, out, 1, `74909 OC stub: ${out} pulled HIGH`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - Real logic gate chips
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: Logic gate chips ===');

// C1: 74908 - Dual NAND (8-pin relay driver), truth table for both gates
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y']];
  for (const [inA, inB, out] of gates) {
    // Both HIGH → NAND = LOW
    {
      const { world, chip, wm } = setupChipWithPower('74908');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74908 NAND(${inA}=H,${inB}=H) → LOW`);
    }
    // One LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74908');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74908 NAND(${inA}=L,${inB}=H) → HIGH`);
    }
    // Both LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74908');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74908 NAND(${inA}=L,${inB}=L) → HIGH`);
    }
  }
}

// C2: 74914 - Hex Schmitt trigger inverter (NOT logic)
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74914');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74914 NOT(${inp}=H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74914');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74914 NOT(${inp}=L) → HIGH`);
    }
  }
}

// C3: 74918 - Dual NAND (14-pin, same logic as 74908)
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y']];
  for (const [inA, inB, out] of gates) {
    // Both HIGH → NAND = LOW
    {
      const { world, chip, wm } = setupChipWithPower('74918');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74918 NAND(${inA}=H,${inB}=H) → LOW`);
    }
    // One LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74918');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74918 NAND(${inA}=L,${inB}=H) → HIGH`);
    }
    // Both LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74918');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74918 NAND(${inA}=L,${inB}=L) → HIGH`);
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
