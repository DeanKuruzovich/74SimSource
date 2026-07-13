// test-chips36.mjs - Tests for all chips defined in js/chips/chips36.js
// Chips under test:
//   74678/679/680       - Address comparator stubs
//   74681               - 4 bit accumulator stub
//   74682/683/684/685   - 8 bit magnitude comparator (P>Q), 20 pin
//   74686/687           - 8 bit magnitude comparator (P>Q + P==Q), 24 pin with dual enable
//   74688/689           - 8 bit identity comparator (P==Q), 20 pin
//   74690/691/692/693   - 4 bit counter/latch/mux stubs

import { CHIPS_BLOCK_36 } from '../chips/chips36.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
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

function disconnectWire(wm, wire) {
  if (wire) wm.removeWire(wire.id);
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

function connectPinsHigh(wm, chip, names) {
  return names.map(n => connectPinToVcc(wm, findPin(chip, n)));
}

function connectPinsLow(wm, chip, names) {
  return names.map(n => connectPinToGnd(wm, findPin(chip, n)));
}

// Helper: connect a value byte to P or Q pins (P0..P7 or Q0..Q7)
function connectByteToPins(wm, chip, prefix, value) {
  const wires = [];
  for (let i = 0; i < 8; i++) {
    const bit = (value >> i) & 1;
    const pin = findPin(chip, `${prefix}${i}`);
    if (bit) wires.push(connectPinToVcc(wm, pin));
    else     wires.push(connectPinToGnd(wm, pin));
  }
  return wires;
}

function disconnectAll(wm, wires) {
  wires.forEach(w => disconnectWire(wm, w));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x678','74x679','74x680','74x681',
  '74x682','74x683','74x684','74x685',
  '74x686','74x687',
  '74x688','74x689',
  '74x690','74x691','74x692','74x693',
];

const SEQUENTIAL_IDS = [
  '74x678','74x679','74x680','74x681',
  '74x690','74x691','74x692','74x693',
];

console.log('\n=== SECTION S: Structure ===');

assert(typeof CHIPS_BLOCK_36 === 'object', 'CHIPS_BLOCK_36 is exported object');

for (const id of EXPECTED_IDS) {
  const cd = CHIPS_BLOCK_36[id];
  assert(!!cd, `${id}: chip definition exists`);
  if (!cd) continue;
  assert(typeof cd.name        === 'string' && cd.name.length > 0,   `${id}: name`);
  assert(typeof cd.description === 'string' && cd.description.length > 0, `${id}: description`);
  assert(typeof cd.pins        === 'number', `${id}: pins is number`);
  assert(Array.isArray(cd.pinout), `${id}: pinout is array`);
  assert(Array.isArray(cd.gates),  `${id}: gates is array`);
  assert(cd.gates.length >= 1,     `${id}: at least one gate`);

  const pinNums = cd.pinout.map(p => p.pin);
  for (let n = 1; n <= cd.pins; n++) {
    assert(pinNums.includes(n), `${id}: pin ${n} defined`);
  }

  const vccPin = cd.pinout.find(p => p.name === 'VCC');
  const gndPin = cd.pinout.find(p => p.name === 'GND');
  assert(!!vccPin, `${id}: has VCC pin`);
  assert(!!gndPin, `${id}: has GND pin`);

  if (SEQUENTIAL_IDS.includes(id)) {
    assert(cd.sequential === true, `${id}: sequential flag`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A - Stub chips: all outputs HiZ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION A: Stub chips (HiZ outputs) ===');

const STUB_CHIPS = [
  { id: '74x678', outputs: ['GEn','EQout'] },
  { id: '74x679', outputs: ['GEn','EQout'] },
  { id: '74x681', outputs: ['F0','F1','F2','F3','COUT'] },
  { id: '74x690', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  { id: '74x691', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  { id: '74x692', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
  { id: '74x693', outputs: ['Q0','Q1','Q2','Q3','RCO'] },
];

for (const { id, outputs } of STUB_CHIPS) {
  const { world, chip, wm } = setupChipWithPower(id);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of outputs) {
    assertPinHighZ(sim, chip, out, `${id} stub: ${out} is HiZ`);
  }
}

// 74x680 has a behavioral evaluator (fixed-reference comparator): with G
// floating (TTL pull-up HIGH = disabled) it actively drives the inactive
// levels — GEn HIGH, EQout LOW — rather than going HiZ.
{
  const { world, chip, wm } = setupChipWithPower('74x680');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const vGen = getPinVoltage(sim, findPin(chip, 'GEn'));
  const vEq  = getPinVoltage(sim, findPin(chip, 'EQout'));
  assert(vGen !== undefined && vGen > 2.5, `74x680 idle: GEn driven HIGH (got ${vGen})`);
  assert(vEq === undefined || vEq < 2.5,   `74x680 idle: EQout LOW (got ${vEq})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B - 74682/684: 8 bit comparator P>Q (TRI, 20 pin)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION B: 74682/74684 - 8 bit comparator P>Q ===');

for (const id of ['74x682', '74x684']) {
  // Test 1: G=1 (disabled) → PGQ HiZ
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectPinsLow(wm, chip, ['P0','P1','P2','P3','P4','P5','P6','P7']);
    connectPinsLow(wm, chip, ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7']);
    connectPinToVcc(wm, findPin(chip, 'G')); // G=1 → disabled
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinHighZ(sim, chip, 'PGQ', `${id} G=1(disabled): PGQ HiZ`);
  }

  // Test 2: G=0, P=0xFF > Q=0x00 → PGQ LOW (active LOW: P>Q)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xFF); // P = 255
    connectByteToPins(wm, chip, 'Q', 0x00); // Q = 0
    connectPinToGnd(wm, findPin(chip, 'G')); // G=0 → enabled
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PGQ', 0, `${id} P=0xFF>Q=0x00: PGQ LOW (P>Q)`);
  }

  // Test 3: G=0, P=0x00 < Q=0xFF → PGQ HIGH (not P>Q)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0x00);
    connectByteToPins(wm, chip, 'Q', 0xFF);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PGQ', 1, `${id} P=0x00<Q=0xFF: PGQ HIGH (not P>Q)`);
  }

  // Test 4: G=0, P=Q=0xAA → PGQ HIGH (P==Q, not P>Q)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xAA);
    connectByteToPins(wm, chip, 'Q', 0xAA);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PGQ', 1, `${id} P=Q=0xAA: PGQ HIGH (equal, not P>Q)`);
  }

  // Test 5: G=0, P=0x80 > Q=0x7F → PGQ LOW
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0x80);
    connectByteToPins(wm, chip, 'Q', 0x7F);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PGQ', 0, `${id} P=0x80>Q=0x7F: PGQ LOW`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C - 74683/685: 8 bit comparator P>Q, open collector (20 pin)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION C: 74683/74685 - 8 bit comparator P>Q OC ===');

for (const id of ['74x683', '74x685']) {
  const cd = CHIPS_BLOCK_36[id];
  assert(cd.openCollector === true, `${id}: openCollector flag set`);

  // Test: G=0, P > Q → PGQ LOW (OC sinks to GND)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xF0);
    connectByteToPins(wm, chip, 'Q', 0x0F);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PGQ', 0, `${id} P=0xF0>Q=0x0F: PGQ LOW (OC sinks)`);
  }

  // Test: G=0, P < Q → PGQ HIGH (OC releases → pulled HIGH via internal pull up)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0x0F);
    connectByteToPins(wm, chip, 'Q', 0xF0);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    // OC HIGH = pulled up by implicit 4.7kΩ pull up → HIGH
    assertPinBit(sim, chip, 'PGQ', 1, `${id} P=0x0F<Q=0xF0: PGQ HIGH (OC released, pulled up)`);
  }

  // Test: G=1 (disabled) → PGQ HIGH (OC released → pulled up)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xFF);
    connectByteToPins(wm, chip, 'Q', 0x00);
    connectPinToVcc(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PGQ', 1, `${id} G=1: PGQ HIGH (OC released, pulled up)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D - 74686/687: 8 bit comparator P>Q+P==Q, dual enable (24 pin)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION D: 74686/74687 - dual enable, PGQ+PEQQ ===');

for (const id of ['74x686', '74x687']) {
  const isOC = id === '74x687';
  const cd = CHIPS_BLOCK_36[id];
  if (isOC) assert(cd.openCollector === true, `${id}: openCollector flag set`);

  // Test 1: G1=1 (one enable high) → both outputs HIGH (OC released → pulled up)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xFF);
    connectByteToPins(wm, chip, 'Q', 0x00);
    connectPinToVcc(wm, findPin(chip, 'G1')); // G1=1 → disabled
    connectPinToGnd(wm, findPin(chip, 'G2'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    if (isOC) {
      assertPinBit(sim, chip, 'PGQ',  1, `${id} G1=1: PGQ HIGH (OC released, pulled up)`);
      assertPinBit(sim, chip, 'PEQQ', 1, `${id} G1=1: PEQQ HIGH (OC released, pulled up)`);
    } else {
      assertPinHighZ(sim, chip, 'PGQ',  `${id} G1=1: PGQ HiZ`);
      assertPinHighZ(sim, chip, 'PEQQ', `${id} G1=1: PEQQ HiZ`);
    }
  }

  // Test 2: G2=1 (other enable high) → both outputs HIGH (OC released → pulled up)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xFF);
    connectByteToPins(wm, chip, 'Q', 0x00);
    connectPinToGnd(wm, findPin(chip, 'G1'));
    connectPinToVcc(wm, findPin(chip, 'G2')); // G2=1 → disabled
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    if (isOC) {
      assertPinBit(sim, chip, 'PGQ',  1, `${id} G2=1: PGQ HIGH (OC released, pulled up)`);
      assertPinBit(sim, chip, 'PEQQ', 1, `${id} G2=1: PEQQ HIGH (OC released, pulled up)`);
    } else {
      assertPinHighZ(sim, chip, 'PGQ',  `${id} G2=1: PGQ HiZ`);
      assertPinHighZ(sim, chip, 'PEQQ', `${id} G2=1: PEQQ HiZ`);
    }
  }

  // Test 3: G1=G2=0, P > Q: PGQ LOW, PEQQ HIGH (OC released when not equal)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xAB);
    connectByteToPins(wm, chip, 'Q', 0x12);
    connectPinToGnd(wm, findPin(chip, 'G1'));
    connectPinToGnd(wm, findPin(chip, 'G2'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    if (isOC) {
      assertPinBit(sim, chip, 'PGQ',  0, `${id} P>Q: PGQ LOW`);
      assertPinBit(sim, chip, 'PEQQ', 1, `${id} P>Q: PEQQ HIGH (OC released, pulled up, P!=Q)`);
    } else {
      assertPinBit(sim, chip, 'PGQ',  0, `${id} P>Q: PGQ LOW`);
      assertPinBit(sim, chip, 'PEQQ', 1, `${id} P>Q: PEQQ HIGH`);
    }
  }

  // Test 4: G1=G2=0, P == Q: PGQ HIGH, PEQQ LOW
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0x55);
    connectByteToPins(wm, chip, 'Q', 0x55);
    connectPinToGnd(wm, findPin(chip, 'G1'));
    connectPinToGnd(wm, findPin(chip, 'G2'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    if (isOC) {
      assertPinBit(sim, chip, 'PGQ',  1, `${id} P==Q: PGQ HIGH (OC released, pulled up, P not >Q)`);
      assertPinBit(sim, chip, 'PEQQ', 0, `${id} P==Q: PEQQ LOW`);
    } else {
      assertPinBit(sim, chip, 'PGQ',  1, `${id} P==Q: PGQ HIGH`);
      assertPinBit(sim, chip, 'PEQQ', 0, `${id} P==Q: PEQQ LOW`);
    }
  }

  // Test 5: G1=G2=0, P < Q: PGQ HIGH, PEQQ HIGH (both released)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0x01);
    connectByteToPins(wm, chip, 'Q', 0xFF);
    connectPinToGnd(wm, findPin(chip, 'G1'));
    connectPinToGnd(wm, findPin(chip, 'G2'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    if (isOC) {
      assertPinBit(sim, chip, 'PGQ',  1, `${id} P<Q: PGQ HIGH (OC released, pulled up, P not >Q)`);
      assertPinBit(sim, chip, 'PEQQ', 1, `${id} P<Q: PEQQ HIGH (OC released, pulled up, P!=Q)`);
    } else {
      assertPinBit(sim, chip, 'PGQ',  1, `${id} P<Q: PGQ HIGH`);
      assertPinBit(sim, chip, 'PEQQ', 1, `${id} P<Q: PEQQ HIGH`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E - 74688/689: 8 bit identity comparator (P==Q, with enable)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION E: 74688/74689 - 8 bit identity comparator (P==Q) ===');

for (const id of ['74x688', '74x689']) {
  const isOC = id === '74x689';
  const cd = CHIPS_BLOCK_36[id];
  if (isOC) assert(cd.openCollector === true, `${id}: openCollector flag set`);

  // Test 1: G=1 (disabled) → PEQQ HIGH (OC released → pulled up)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xFF);
    connectByteToPins(wm, chip, 'Q', 0xFF);
    connectPinToVcc(wm, findPin(chip, 'G')); // G=1 → disabled
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    if (isOC) {
      assertPinBit(sim, chip, 'PEQQ', 1, `${id} G=1: PEQQ HIGH (OC released, pulled up)`);
    } else {
      assertPinHighZ(sim, chip, 'PEQQ', `${id} G=1: PEQQ HiZ/released`);
    }
  }

  // Test 2: G=0, P == Q → PEQQ LOW (active LOW: equal)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xA5);
    connectByteToPins(wm, chip, 'Q', 0xA5);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PEQQ', 0, `${id} P=Q=0xA5: PEQQ LOW (equal)`);
  }

  // Test 3: G=0, P != Q → PEQQ HIGH (not equal) [OC: released → pulled up]
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xA5);
    connectByteToPins(wm, chip, 'Q', 0x5A);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    // OC chip: when not sinking (not equal output = 1 means OC releases → pulled up)
    assertPinBit(sim, chip, 'PEQQ', 1, `${id} P!=Q(0xA5,0x5A): PEQQ HIGH (not equal)`);
  }

  // Test 4: G=0, P=0x00, Q=0x00 → PEQQ LOW (equal)
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0x00);
    connectByteToPins(wm, chip, 'Q', 0x00);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PEQQ', 0, `${id} P=Q=0x00: PEQQ LOW (equal)`);
  }

  // Test 5: G=0, P=0xFF, Q=0xFE → PEQQ HIGH (not equal due to bit 0) [OC: released → pulled up]
  {
    const { world, chip, wm } = setupChipWithPower(id);
    connectByteToPins(wm, chip, 'P', 0xFF);
    connectByteToPins(wm, chip, 'Q', 0xFE);
    connectPinToGnd(wm, findPin(chip, 'G'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinBit(sim, chip, 'PEQQ', 1, `${id} P=0xFF,Q=0xFE: PEQQ HIGH (not equal)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F - Instantiation tests (ChipComponent)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n=== SECTION F: ChipComponent instantiation ===');

for (const id of EXPECTED_IDS) {
  const { world, chip, wm } = setupChipWithPower(id);
  assert(!!chip, `${id}: ChipComponent created`);
  const vccPin = findPin(chip, 'VCC');
  assert(!!vccPin, `${id}: VCC pin accessible`);
  const gndPin = findPin(chip, 'GND');
  assert(!!gndPin, `${id}: GND pin accessible`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(60)}`);
console.log(`CHIPS36 TEST RESULTS: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
