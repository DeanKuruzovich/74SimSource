// test-chips46.mjs - Tests for all chips defined in js/chips/chips46.js
// Chips under test:
//   74978        : Octal FF with serial scanner                 (GENERIC_STUB, 24-pin)
//   74989        : 64 bit RAM 16x4 inv TRI                      (GENERIC_STUB, 16-pin)
//   74990        : 8 bit transparent latch read-back TRI        (GENERIC_STUB, 20-pin)
//   74991        : 8 bit transparent latch read-back inv TRI     (GENERIC_STUB, 20-pin)
//   74992        : 9 bit transparent latch read-back TRI        (GENERIC_STUB, 24-pin)
//   74993        : 9 bit transparent latch read-back inv TRI     (GENERIC_STUB, 24-pin)
//   74994        : 10 bit transparent latch read-back TRI       (GENERIC_STUB, 24-pin)
//   74995        : 10 bit transparent latch read-back inv TRI    (GENERIC_STUB, 24-pin)
//   74996        : 8 bit edge-triggered latch read-back TRI      (GENERIC_STUB, 24-pin)
//   74x1000      : Quad 2 input NAND gate driver                (NAND, 14-pin)
//   74x1002      : Quad 2 input NOR gate driver                 (NOR, 14-pin)
//   74x1003      : Quad 2 input NAND OC driver                  (NAND+OC, 14-pin)
//   74x1004      : Hex inverting buffer driver                  (NOT, 14-pin)
//   74x1005      : Hex inverting buffer OC driver               (NOT+OC, 14-pin)
//   74x1008      : Quad 2 input AND gate driver                 (AND, 14-pin)
//   74ALS1010    : Triple 3 input NAND gate driver              (NAND, 14-pin)

import { CHIPS_BLOCK_46 } from '../chips/chips46.js';
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
  '74978','74989','74990','74991','74992','74993','74994','74995','74996',
  '74x1000','74x1002','74x1003','74x1004','74x1005','74x1008','74ALS1010',
];

const EXPECTED_SPECS = {
  '74978':    { pins: 24, gnd: 12, vcc: 24 },
  '74989':    { pins: 16, gnd:  8, vcc: 16 },
  '74990':    { pins: 20, gnd: 10, vcc: 20 },
  '74991':    { pins: 20, gnd: 10, vcc: 20 },
  '74992':    { pins: 24, gnd: 12, vcc: 24 },
  '74993':    { pins: 24, gnd: 12, vcc: 24 },
  '74994':    { pins: 24, gnd: 12, vcc: 24 },
  '74995':    { pins: 24, gnd: 12, vcc: 24 },
  '74996':    { pins: 24, gnd: 12, vcc: 24 },
  '74x1000':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1002':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1003':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1004':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1005':  { pins: 14, gnd:  7, vcc: 14 },
  '74x1008':  { pins: 14, gnd:  7, vcc: 14 },
  '74ALS1010':{ pins: 14, gnd:  7, vcc: 14 },
};

const OC_IDS = ['74x1003','74x1005'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_46 === 'object', 'CHIPS_BLOCK_46 is exported object');
assert(Object.keys(CHIPS_BLOCK_46).length === 16, 'CHIPS_BLOCK_46 has 16 chips');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_46[id];
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
  { id: '74978', outputs: ['SO','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74989', outputs: [] },  // bidir data pins, no driven outputs
  { id: '74990', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
  { id: '74991', outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n'] },
  { id: '74992', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
  { id: '74993', outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n','Q8n'] },
  { id: '74994', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
  { id: '74995', outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n','Q8n','Q9n'] },
  { id: '74996', outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
];

for (const { id, outputs } of STUB_CONFIGS) {
  if (outputs.length === 0) {
    assert(true, `${id} stub: no driven outputs to check (bidir/empty)`);
    continue;
  }

  const { world, chip, wm } = setupChipWithPower(id);
  const cd = CHIPS_BLOCK_46[id];
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
// SECTION B - OC chips: outputs
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: OC chips ===');

// 74x1003: NAND OC - both inputs HIGH → NAND = LOW output driven
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1003');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1003 OC NAND(${inA}=H,${inB}=H) → LOW`);
    }
    // One LOW → NAND = HIGH (pulled up by OC pull up)
    {
      const { world, chip, wm } = setupChipWithPower('74x1003');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1003 OC NAND(${inA}=L,${inB}=H) → HIGH (pullup)`);
    }
  }
}

// 74x1005: NOT OC - input HIGH → output LOW driven; input LOW → output pulled HIGH
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1005');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1005 OC NOT(${inp}=H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1005');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1005 OC NOT(${inp}=L) → HIGH (pullup)`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - Real logic gate chips
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: Logic gate chips ===');

// C1: 74x1000 - Quad NAND
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1000');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1000 NAND(H,H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1000');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1000 NAND(L,H) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1000');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1000 NAND(L,L) → HIGH`);
    }
  }
}

// C2: 74x1002 - Quad NOR
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1002');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1002 NOR(L,L) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1002');
      connectHigh(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1002 NOR(H,L) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1002');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1002 NOR(H,H) → LOW`);
    }
  }
}

// C3: 74x1004 - Hex NOT
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1004');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1004 NOT(H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1004');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1004 NOT(L) → HIGH`);
    }
  }
}

// C4: 74x1008 - Quad AND
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74x1008');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74x1008 AND(H,H) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1008');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1008 AND(L,H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74x1008');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74x1008 AND(L,L) → LOW`);
    }
  }
}

// C5: 74ALS1010 - Triple 3 input NAND
{
  const gates = [['1A','1B','1C','1Y'],['2A','2B','2C','2Y'],['3A','3B','3C','3Y']];
  for (const [inA, inB, inC, out] of gates) {
    // All HIGH → NAND = LOW
    {
      const { world, chip, wm } = setupChipWithPower('74ALS1010');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB); connectHigh(wm, chip, inC);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74ALS1010 NAND(H,H,H) → LOW`);
    }
    // One LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74ALS1010');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB); connectHigh(wm, chip, inC);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74ALS1010 NAND(L,H,H) → HIGH`);
    }
    // All LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74ALS1010');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB); connectLow(wm, chip, inC);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74ALS1010 NAND(L,L,L) → HIGH`);
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
