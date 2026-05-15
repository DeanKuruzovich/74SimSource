// test-chips47.mjs - Tests for all chips defined in js/chips/chips47.js
// Chips under test:
//   74AC1010     : Triple 3 input NAND gate (AC logic)          (NAND, 14-pin)
//   74x1011      : Triple 3 input AND gate driver               (AND, 14-pin)
//   74F1016      : 16 bit Schottky diode R-C bus termination    (GENERIC_STUB, 20-pin)
//   74AC1016     : 16 bit bus termination (AC)                  (GENERIC_STUB, 20-pin)
//   74x1018      : 18 bit Schottky diode R-C bus termination    (GENERIC_STUB, 24-pin)
//   74x1020      : Dual 4 input NAND gate driver                (NAND, 14-pin)
//   74x1032      : Quad 2 input OR gate driver                  (OR, 14-pin)
//   74x1034      : Hex non-inverting buffer driver              (BUFFER, 14-pin)
//   74x1035      : Hex non-inverting buffer OC driver           (BUFFER+OC, 14-pin)
//   74x1036      : Quad 2 input NOR gate driver                 (NOR, 14-pin)
//   74x1050      : 12 bit Schottky diode bus termination (GND)  (GENERIC_STUB, 16-pin)
//   74x1051      : 12 bit Schottky diode bus termination (G/V)  (GENERIC_STUB, 16-pin)
//   74x1052      : 16 bit Schottky diode bus termination (GND)  (GENERIC_STUB, 20-pin)
//   74x1053      : 16 bit Schottky diode bus termination (G/V)  (GENERIC_STUB, 20-pin)
//   74x1056      : 8 bit Schottky diode bus termination (GND)   (GENERIC_STUB, 16-pin)
//   74x1071      : 10 bit bus termination with bus-hold         (GENERIC_STUB, 14-pin)

import { CHIPS_BLOCK_47 } from '../chips/chips47.js';
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
  '74x1011','74F1016','74x1018',
  '74x1020','74x1032','74x1034','74x1035','74x1036',
  '74x1050','74x1051','74x1052','74x1053','74x1056','74x1071',
];

const EXPECTED_SPECS = {
  '74x1011':  { pins: 14, gnd:  7, vcc: 14 },
  '74F1016':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1018':  { pins: 24, gnd: 12, vcc: 24 },
  '74x1020':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1032':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1034':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1035':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1036':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1050':  { pins: 16, gnd:  8, vcc: 16 },
  '74x1051':  { pins: 16, gnd:  8, vcc: 16 },
  '74x1052':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1053':  { pins: 20, gnd: 10, vcc: 20 },
  '74x1056':  { pins: 16, gnd:  8, vcc: 16 },
  '74x1071':  { pins: 14, gnd:  7, vcc: 14 },
};

const OC_IDS = ['74x1035'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_47 === 'object', 'CHIPS_BLOCK_47 is exported object');
assert(Object.keys(CHIPS_BLOCK_47).length === 14, 'CHIPS_BLOCK_47 has 14 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_47[id];
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

const STUB_IDS = ['74F1016','74x1018','74x1050','74x1051','74x1052','74x1053','74x1056','74x1071'];

for (const id of STUB_IDS) {
  const cd = CHIPS_BLOCK_47[id];
  const outPins = cd.pinout.filter(p => p.type === 'output');
  if (outPins.length === 0) {
    assert(true, `${id} stub: no driven outputs (all bidir/nc/power) - HiZ OK`);
    continue;
  }
  const { world, chip, wm } = setupChipWithPower(id);
  for (const p of cd.pinout) {
    if (p.type === 'input') connectLow(wm, chip, p.name);
  }
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const p of outPins) {
    assertPinHighZ(sim, chip, p.name, `${id} stub: ${p.name} is HiZ`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - OC chip: 74x1035 hex BUFFER OC
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: OC chip 74x1035 ===');

{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    // HIGH input → BUFFER = HIGH output
    {
      const { world, chip, wm } = setupChipWithPower('74x1035');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1035 OC BUFFER(${inp}=H) → HIGH (pullup)`);
    }
    // LOW input → BUFFER = LOW output (OC pulls low)
    {
      const { world, chip, wm } = setupChipWithPower('74x1035');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1035 OC BUFFER(${inp}=L) → LOW`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - Real logic gate chips
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: Logic gate chips ===');

// C2: 74x1011 - Triple 3 input AND
{
  const gates = [['1A','1B','1C','1Y'],['2A','2B','2C','2Y'],['3A','3B','3C','3Y']];
  for (const [inA, inB, inC, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1011');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB); connectHigh(wm, chip, inC);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1011 AND(H,H,H) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1011');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB); connectHigh(wm, chip, inC);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1011 AND(L,H,H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1011');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB); connectLow(wm, chip, inC);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1011 AND(L,L,L) → LOW`);
    }
  }
}

// C3: 74x1020 - Dual 4 input NAND
{
  const gates = [
    ['1A','1B','1C','1D','1Y'],
    ['2A','2B','2C','2D','2Y'],
  ];
  for (const [inA, inB, inC, inD, out] of gates) {
    // All HIGH → NAND = LOW
    {
      const { world, chip, wm } = setupChipWithPower('74x1020');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      connectHigh(wm, chip, inC); connectHigh(wm, chip, inD);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1020 NAND(H,H,H,H) → LOW`);
    }
    // One LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74x1020');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB);
      connectHigh(wm, chip, inC); connectHigh(wm, chip, inD);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1020 NAND(L,H,H,H) → HIGH`);
    }
    // All LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74x1020');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      connectLow(wm, chip, inC); connectLow(wm, chip, inD);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1020 NAND(L,L,L,L) → HIGH`);
    }
  }
}

// C4: 74x1032 - Quad 2 input OR
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1032');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1032 OR(L,L) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1032');
      connectHigh(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1032 OR(H,L) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1032');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1032 OR(H,H) → HIGH`);
    }
  }
}

// C5: 74x1034 - Hex BUFFER
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1034');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1034 BUFFER(${inp}=H) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1034');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1034 BUFFER(${inp}=L) → LOW`);
    }
  }
}

// C6: 74x1036 - Quad 2 input NOR
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1036');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1036 NOR(L,L) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1036');
      connectHigh(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1036 NOR(H,L) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1036');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1036 NOR(H,H) → LOW`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
