// test-chips43.mjs - Tests for all chips defined in js/chips/chips43.js
// Chips under test:
//   74877        : 8 bit univ transceiver port controller      (GENERIC_STUB, bidir, 24-pin)
//   74878        : Dual 4 bit D-FF, sync CLR, non-inv, TRI    (GENERIC_STUB, 24-pin)
//   74879        : Dual 4 bit D-FF, sync CLR, inv, TRI        (GENERIC_STUB, 24-pin)
//   74880        : Dual 4 bit latch, CLR, inv, TRI            (GENERIC_STUB, 24-pin)
//   74881        : 4 bit ALU                                   (ALU_4BIT, 24-pin)
//   74882        : 32 bit lookahead carry generator            (GENERIC_STUB, 24-pin)
//   74885        : 8 bit magnitude comparator                  (GENERIC_STUB, 24-pin)
//   74900        : Quad 2 input NAND driver                    (NAND, 14-pin)
//   74901        : Hex inverting TTL buffer                    (NOT, 14-pin)
//   74C902       : Hex non-inverting TTL buffer                (BUFFER, 14-pin)
//   74ALS902     : Quad 2 input NOR driver                    (NOR, 14-pin)
//   74C903       : Hex inverting PMOS buffer                  (NOT, 14-pin)
//   74ALS903     : Quad 2 input NAND OC driver                (NAND+OC, 14-pin)
//   74904        : Hex non-inverting PMOS buffer               (BUFFER, 14-pin)
//   74905        : 12 bit successive approximation register    (GENERIC_STUB, 24-pin)
//   74906        : Hex open drain n-channel buffer             (BUFFER+OC, 14-pin)

import { CHIPS_BLOCK_43 } from '../chips/chips43.js';
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
  '74877','74878','74879','74880','74881','74882','74885',
  '74900','74901','74C902','74ALS902','74C903','74ALS903',
  '74904','74905','74906',
];

const EXPECTED_SPECS = {
  '74877':   { pins: 24, gnd: 12, vcc: 24 },
  '74878':   { pins: 24, gnd: 12, vcc: 24 },
  '74879':   { pins: 24, gnd: 12, vcc: 24 },
  '74880':   { pins: 24, gnd: 12, vcc: 24 },
  '74881':   { pins: 24, gnd: 12, vcc: 24 },
  '74882':   { pins: 24, gnd: 12, vcc: 24 },
  '74885':   { pins: 24, gnd: 12, vcc: 24 },
  '74900':   { pins: 14, gnd:  7, vcc: 14 },
  '74901':   { pins: 14, gnd:  7, vcc: 14 },
  '74C902':  { pins: 14, gnd:  7, vcc: 14 },
  '74ALS902':{ pins: 14, gnd:  7, vcc: 14 },
  '74C903':  { pins: 14, gnd:  7, vcc: 14 },
  '74ALS903':{ pins: 14, gnd:  7, vcc: 14 },
  '74904':   { pins: 14, gnd:  7, vcc: 14 },
  '74905':   { pins: 24, gnd: 12, vcc: 24 },
  '74906':   { pins: 14, gnd:  7, vcc: 14 },
};

const OC_IDS = ['74ALS903','74906'];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_43 === 'object', 'CHIPS_BLOCK_43 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_43[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,         `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0,  `${id}: description`);
  assert(typeof cd.pins        === 'number',                                 `${id}: pins is number`);
  assert(Array.isArray(cd.pinout),                                           `${id}: pinout is array`);
  assert(Array.isArray(cd.gates) && cd.gates.length >= 1,                   `${id}: has gates`);

  const spec = EXPECTED_SPECS[id];
  assert(cd.pins === spec.pins, `${id}: pins=${spec.pins}`);
  assert(cd.gnd  === spec.gnd,  `${id}: gnd=${spec.gnd}`);
  assert(cd.vcc  === spec.vcc,  `${id}: vcc=${spec.vcc}`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }

  if (OC_IDS.includes(id)) {
    assert(cd.openCollector === true, `${id}: openCollector flag set at chip level`);
  } else {
    assert(cd.openCollector !== true, `${id}: not openCollector`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: all outputs HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_CONFIGS = [
  { id: '74878', outputs: ['Q10','Q11','Q12','Q13','Q20','Q21','Q22','Q23'] },
  { id: '74879', outputs: ['Q10n','Q11n','Q12n','Q13n','Q20n','Q21n','Q22n','Q23n'] },
  { id: '74880', outputs: ['Q10n','Q11n','Q12n','Q13n','Q20n','Q21n','Q22n','Q23n'] },
  { id: '74882', outputs: ['Cn8','Cn16','Cn24','Cn32','GG'] },
  { id: '74885', outputs: ['AGEB','ALTB','AEQB','AGTB'] },
  { id: '74905', outputs: ['SC','D0','D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','EOC'] },
];

for (const { id, outputs } of STUB_CONFIGS) {
  const { world, chip, wm } = setupChipWithPower(id);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of outputs) {
    assertPinHighZ(sim, chip, out, `${id} stub: ${out} is HiZ`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - OC chips: outputs pulled HIGH via pull up
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: OC chips (outputs pulled HIGH) ===');

// 74ALS903: OC NAND - all inputs LOW → NAND output would be HIGH (pulled up)
{
  const { world, chip, wm } = setupChipWithPower('74ALS903');
  connectLow(wm, chip, '1A'); connectLow(wm, chip, '1B');
  connectLow(wm, chip, '2A'); connectLow(wm, chip, '2B');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '3B');
  connectLow(wm, chip, '4A'); connectLow(wm, chip, '4B');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['1Y','2Y','3Y','4Y']) {
    assertPinBit(sim, chip, out, 1, `74ALS903 OC: ${out} pulled HIGH (inputs LOW)`);
  }
}

// 74906: OC buffer - all inputs LOW → buffer outputs LOW (open drain active)
{
  const { world, chip, wm } = setupChipWithPower('74906');
  connectLow(wm, chip, '1A'); connectLow(wm, chip, '2A');
  connectLow(wm, chip, '3A'); connectLow(wm, chip, '4A');
  connectLow(wm, chip, '5A'); connectLow(wm, chip, '6A');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['1Y','2Y','3Y','4Y','5Y','6Y']) {
    assertPinBit(sim, chip, out, 0, `74906 OC buffer: ${out}=LOW (input LOW)`);
  }
}

// 74906: OC buffer - all inputs HIGH → outputs pulled HIGH (OC output inactive)
{
  const { world, chip, wm } = setupChipWithPower('74906');
  connectHigh(wm, chip, '1A'); connectHigh(wm, chip, '2A');
  connectHigh(wm, chip, '3A'); connectHigh(wm, chip, '4A');
  connectHigh(wm, chip, '5A'); connectHigh(wm, chip, '6A');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['1Y','2Y','3Y','4Y','5Y','6Y']) {
    assertPinBit(sim, chip, out, 1, `74906 OC buffer: ${out}=HIGH (input HIGH, pullup)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - Real logic gate chips
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: Logic gate chips ===');

// C1: 74900 - Quad NAND (each gate: truth table both-HIGH→LOW, else→HIGH)
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    // Both HIGH → NAND = LOW
    {
      const { world, chip, wm } = setupChipWithPower('74900');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74900 NAND(${inA}=H,${inB}=H) → LOW`);
    }
    // One LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74900');
      connectLow(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74900 NAND(${inA}=L,${inB}=H) → HIGH`);
    }
    // Both LOW → NAND = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74900');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74900 NAND(${inA}=L,${inB}=L) → HIGH`);
    }
  }
}

// C2: 74901 - Hex inverting buffer (NOT)
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74901');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74901 NOT(${inp}=H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74901');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74901 NOT(${inp}=L) → HIGH`);
    }
  }
}

// C3: 74C902 - Hex non-inverting buffer (BUFFER)
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74C902');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74C902 BUFFER(${inp}=H) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74C902');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74C902 BUFFER(${inp}=L) → LOW`);
    }
  }
}

// C4: 74ALS902 - Quad NOR driver
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    // Both LOW → NOR = HIGH
    {
      const { world, chip, wm } = setupChipWithPower('74ALS902');
      connectLow(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74ALS902 NOR(${inA}=L,${inB}=L) → HIGH`);
    }
    // One HIGH → NOR = LOW
    {
      const { world, chip, wm } = setupChipWithPower('74ALS902');
      connectHigh(wm, chip, inA); connectLow(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74ALS902 NOR(${inA}=H,${inB}=L) → LOW`);
    }
    // Both HIGH → NOR = LOW
    {
      const { world, chip, wm } = setupChipWithPower('74ALS902');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74ALS902 NOR(${inA}=H,${inB}=H) → LOW`);
    }
  }
}

// C5: 74C903 - Hex inverting PMOS buffer (NOT)
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74C903');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74C903 NOT(${inp}=H) → LOW`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74C903');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74C903 NOT(${inp}=L) → HIGH`);
    }
  }
}

// C6: 74904 - Hex non-inverting PMOS buffer (BUFFER)
{
  const gates = [['1A','1Y'],['2A','2Y'],['3A','3Y'],['4A','4Y'],['5A','5Y'],['6A','6Y']];
  for (const [inp, out] of gates) {
    {
      const { world, chip, wm } = setupChipWithPower('74904');
      connectHigh(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 1, `74904 BUFFER(${inp}=H) → HIGH`);
    }
    {
      const { world, chip, wm } = setupChipWithPower('74904');
      connectLow(wm, chip, inp);
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74904 BUFFER(${inp}=L) → LOW`);
    }
  }
}

// C7: 74ALS903 OC NAND - verify logic (both HIGH → LOW output driven before pull up)
{
  const gates = [['1A','1B','1Y'],['2A','2B','2Y'],['3A','3B','3Y'],['4A','4B','4Y']];
  for (const [inA, inB, out] of gates) {
    // Both HIGH → NAND=LOW → OC output driven LOW
    {
      const { world, chip, wm } = setupChipWithPower('74ALS903');
      connectHigh(wm, chip, inA); connectHigh(wm, chip, inB);
      // connect other gates to avoid floating
      const otherGates = gates.filter(g => g[0] !== inA);
      for (const [a,b] of otherGates) { connectLow(wm, chip, a); connectLow(wm, chip, b); }
      const sim = new CircuitSimulator(); sim.evaluate(world, [chip], wm);
      assertPinBit(sim, chip, out, 0, `74ALS903 OC NAND(${inA}=H,${inB}=H) → LOW`);
    }
  }
}

// C8: 74877 bidir transceiver - instantiation check
{
  const { world, chip, wm } = setupChipWithPower('74877');
  let threw = false;
  try { new CircuitSimulator().evaluate(world, [chip], wm); } catch(e) { threw = true; }
  assert(!threw, `74877: evaluate() does not throw`);
  assert(chip.pins.length > 0, `74877: has pins after placement`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - 74881 ALU basic checks
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74881 ALU ===');

// D1: Logic mode (M=1), S=0b1010 (XNOR→A XNOR B), Cn=1
//   S3=1,S2=0,S1=1,S0=0 ; M=1 ; A=0b0101=5, B=0b0000=0
//   F = A XNOR B with M=1 => F = NOT(A XOR B) - depends on implementaton
//   Just test that evaluate doesn't throw and F pins are driven
{
  const { world, chip, wm } = setupChipWithPower('74881');
  // Set M=1 (logic mode), Cn=1, S=0000 (A AND B logic function), A=1111, B=0000
  connectHigh(wm, chip, 'M');
  connectHigh(wm, chip, 'Cn');
  connectLow(wm, chip, 'S0'); connectLow(wm, chip, 'S1');
  connectLow(wm, chip, 'S2'); connectLow(wm, chip, 'S3');
  connectHigh(wm, chip, 'A0'); connectHigh(wm, chip, 'A1');
  connectHigh(wm, chip, 'A2'); connectHigh(wm, chip, 'A3');
  connectLow(wm, chip, 'B0'); connectLow(wm, chip, 'B1');
  connectLow(wm, chip, 'B2'); connectLow(wm, chip, 'B3');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // S=0000, M=1: F = NOT A (per 74181 table)
  // A=1111 → F=0000 = all LOW
  assertPinBit(sim, chip, 'F0', 0, '74881 NOT(A): F0=0 (A0=1)');
  assertPinBit(sim, chip, 'F1', 0, '74881 NOT(A): F1=0 (A1=1)');
  assertPinBit(sim, chip, 'F2', 0, '74881 NOT(A): F2=0 (A2=1)');
  assertPinBit(sim, chip, 'F3', 0, '74881 NOT(A): F3=0 (A3=1)');
}

// D2: Logic mode M=1, S=1111 (A): A=0b1010=A2,A0 high; F should equal A
{
  const { world, chip, wm } = setupChipWithPower('74881');
  connectHigh(wm, chip, 'M');
  connectHigh(wm, chip, 'Cn');
  connectHigh(wm, chip, 'S0'); connectHigh(wm, chip, 'S1');
  connectHigh(wm, chip, 'S2'); connectHigh(wm, chip, 'S3');
  connectHigh(wm, chip, 'A0'); connectLow(wm, chip, 'A1');
  connectHigh(wm, chip, 'A2'); connectLow(wm, chip, 'A3');
  connectLow(wm, chip, 'B0'); connectLow(wm, chip, 'B1');
  connectLow(wm, chip, 'B2'); connectLow(wm, chip, 'B3');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // S=1111, M=1: F = A (pass-through per 74181 table)
  assertPinBit(sim, chip, 'F0', 1, '74881 F=A: F0=1 (A0=1)');
  assertPinBit(sim, chip, 'F1', 0, '74881 F=A: F1=0 (A1=0)');
  assertPinBit(sim, chip, 'F2', 1, '74881 F=A: F2=1 (A2=1)');
  assertPinBit(sim, chip, 'F3', 0, '74881 F=A: F3=0 (A3=0)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${pass} passed, ${fail} failed ===\n`);
if (fail > 0) process.exit(1);
