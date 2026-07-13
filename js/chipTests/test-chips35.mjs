// test-chips35.mjs - Tests for all chips defined in js/chips/chips35.js
// Chips under test:
//   74658/659/664/665 - Octal XCVR+parity (stub)
//   74666/667         - 8 bit transparent latch TRI (non-inv / inv)
//   74668/669         - Sync 4 bit up/down counter (decade / binary)
//   74670             - 4x4 Register File TRI
//   74671/672         - 4 bit bidirectional SR/latch stub
//   74673/674/675/676 - 16 bit shift register stub
//   74677             - 16 bit address comparator stub

import { CHIPS_BLOCK_35 } from '../chips/chips35.js';
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x658','74x659','74x664','74x665',
  '74x666','74x667',
  '74x668','74x669','74x670',
  '74x671','74x672',
  '74x673','74x674','74x675','74x676',
  '74x677',
];

const SEQUENTIAL_IDS = [
  '74x666','74x667','74x668','74x669','74x670',
  '74x671','74x672','74x673','74x674','74x675','74x676','74x677',
];

console.log('\nS1: All 16 chip IDs present in CHIPS_BLOCK_35');
{
  for (const id of EXPECTED_IDS) {
    assert(id in CHIPS_BLOCK_35, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_35).length === EXPECTED_IDS.length,
    `CHIPS_BLOCK_35 has exactly ${EXPECTED_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_35).length})`);
}

console.log('\nS2: Required fields present on every chip');
{
  const REQUIRED = ['name','simpleName','description','pins','vcc','gnd','pinout','gates','tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_35)) {
    for (const f of REQUIRED) {
      assert(f in def, `${id}: has '${f}'`);
    }
    assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
      `${id}: pinout length === pins (${def.pins})`);
    assert(Array.isArray(def.gates) && def.gates.length > 0,
      `${id}: has at least one gate`);
    assert(def.vcc >= 1 && def.vcc <= def.pins, `${id}: vcc pin in range`);
    assert(def.gnd >= 1 && def.gnd <= def.pins, `${id}: gnd pin in range`);
    assert(def.vcc !== def.gnd, `${id}: vcc != gnd`);
    const vccPin = def.pinout.find(p => p.name === 'VCC');
    const gndPin = def.pinout.find(p => p.name === 'GND');
    assert(vccPin?.pin === def.vcc, `${id}: VCC pin number matches`);
    assert(gndPin?.pin === def.gnd, `${id}: GND pin number matches`);
  }
}

console.log('\nS3: All gate input/output names exist in pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_35)) {
    const pinNames = new Set(def.pinout.map(p => p.name));
    for (const gate of def.gates) {
      const inputs  = Array.isArray(gate.inputs)  ? gate.inputs  : [];
      const outputs = Array.isArray(gate.outputs) ? gate.outputs
                    : gate.output                 ? [gate.output] : [];
      for (const name of [...inputs, ...outputs]) {
        assert(pinNames.has(name), `${id}: gate references '${name}' in pinout`);
      }
    }
  }
}

console.log('\nS4: Sequential chips are flagged sequential');
{
  for (const id of SEQUENTIAL_IDS) {
    assert(CHIPS_BLOCK_35[id]?.sequential === true, `${id}: sequential flag set`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate logic tests
// ─────────────────────────────────────────────────────────────────────────────

// ── G1: 74658 - XCVR+parity stub → all outputs HiZ ──────────────────────────
console.log('\nG1: 74658 - parity stub outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x658');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const p of ['B0','B1','B2','B3','B4','B5','B6','B7','PAR'])
    assertPinHighZ(sim, chip, p, `74658: ${p} HiZ`);
}

// ── G2: 74659 - same stub ─────────────────────────────────────────────────────
console.log('\nG2: 74659 - parity stub outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x659');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinHighZ(sim, chip, 'PAR', '74659: PAR HiZ');
}

// ── G3: 74664 / 74665 - same stub ────────────────────────────────────────────
console.log('\nG3: 74664/665 - parity stub outputs HiZ');
{
  for (const id of ['74x664','74x665']) {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinHighZ(sim, chip, 'PAR', `${id}: PAR HiZ`);
    assertPinHighZ(sim, chip, 'B0',  `${id}: B0 HiZ`);
  }
}

// ── G4: 74666 - 8 bit transparent latch (non inverting) ─────────────────────
console.log('\nG4: 74666 - 8 bit transparent latch (non-inv)');

console.log('  G4a: OEn=H → outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x666');
  connectPinsHigh(wm, chip, ['OEn','LE','CLR']);
  connectPinsHigh(wm, chip, ['D0','D1','D2','D3','D4','D5','D6','D7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinHighZ(sim, chip, q, `74666 OEn=H: ${q} HiZ`);
}

console.log('  G4b: CLR=L → Q all LOW (async clear), OEn=L');
{
  const { world, chip, wm } = setupChipWithPower('74x666');
  connectPinsLow(wm, chip, ['OEn','CLR']);
  connectPinsHigh(wm, chip, ['LE','D0','D1','D2','D3','D4','D5','D6','D7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinBit(sim, chip, q, 0, `74666 CLR=L: ${q}=0`);
}

console.log('  G4c: LE=H transparent → Q follows D');
{
  const { world, chip, wm } = setupChipWithPower('74x666');
  connectPinsLow(wm, chip, ['OEn']);
  connectPinsHigh(wm, chip, ['CLR','LE']);
  // D0,D2,D4,D6 = HIGH; D1,D3,D5,D7 = LOW
  connectPinsHigh(wm, chip, ['D0','D2','D4','D6']);
  connectPinsLow(wm, chip,  ['D1','D3','D5','D7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q0', 1, '74666 LE=H: Q0=D0=1');
  assertPinBit(sim, chip, 'Q1', 0, '74666 LE=H: Q1=D1=0');
  assertPinBit(sim, chip, 'Q2', 1, '74666 LE=H: Q2=D2=1');
  assertPinBit(sim, chip, 'Q3', 0, '74666 LE=H: Q3=D3=0');
}

// ── G5: 74667 - 8 bit transparent latch (inverting) ─────────────────────────
console.log('\nG5: 74667 - 8 bit transparent latch (inv)');

console.log('  G5a: LE=H transparent → Q = NOT D');
{
  const { world, chip, wm } = setupChipWithPower('74x667');
  connectPinsLow(wm, chip, ['OEn']);
  connectPinsHigh(wm, chip, ['CLR','LE']);
  connectPinsHigh(wm, chip, ['D0','D1','D2','D3','D4','D5','D6','D7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinBit(sim, chip, q, 0, `74667 LE=H: ${q}=NOT D(1)=0`);
}

console.log('  G5b: CLR=L → Q all HIGH (inverting clear)');
{
  const { world, chip, wm } = setupChipWithPower('74x667');
  connectPinsLow(wm, chip, ['OEn','CLR']);
  connectPinsHigh(wm, chip, ['LE']);
  connectPinsLow(wm, chip,  ['D0','D1','D2','D3','D4','D5','D6','D7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinBit(sim, chip, q, 1, `74667 CLR=L: ${q}=1`);
}

// ── G6: 74668 - Sync BCD up/down counter ─────────────────────────────────────
console.log('\nG6: 74668 - Sync BCD up/down counter');
console.log('  G6a: Count up from 0: CLK rising edges advance QA..QD');
{
  const { world, chip, wm } = setupChipWithPower('74x668');
  connectPinsHigh(wm, chip, ['UD','LOAD','ENP','ENT']); // UP=1, LOAD=1(no load), ENP=1, ENT=1
  connectPinsLow(wm, chip,  ['A','B','C','D']);
  const clkLo = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Counter starts at 0 (no preset, LOAD=H keeps current)
  // Q should be 0 initially
  assertPinBit(sim, chip, 'QA', 0, '74668 init: QA=0');
  assertPinBit(sim, chip, 'QB', 0, '74668 init: QB=0');
  // Pulse CLK
  disconnectWire(wm, clkLo);
  const clkHi = connectPinToVcc(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  // Count should be 1 now
  assertPinBit(sim, chip, 'QA', 1, '74668 after CLK↑: QA=1 (count=1)');
  assertPinBit(sim, chip, 'QB', 0, '74668 after CLK↑: QB=0');
  disconnectWire(wm, clkHi);
}

// ── G7: 74669 - Sync binary up/down counter ──────────────────────────────────
console.log('\nG7: 74669 - Sync binary up/down counter');
console.log('  G7a: Load 0b1010 (=10), read outputs');
{
  const { world, chip, wm } = setupChipWithPower('74x669');
  connectPinsHigh(wm, chip, ['UD','ENP','ENT']); // keep UP
  connectPinsLow(wm, chip,  ['LOAD']); // LOAD=L → load preset on CLK
  connectPinsHigh(wm, chip, ['B','D']); // B=1,D=1 → 0b1010 = 10
  connectPinsLow(wm, chip,  ['A','C']); // A=0,C=0
  const clkLo = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkLo);
  const clkHi = connectPinToVcc(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  // After load: QA=A=0, QB=B=1, QC=C=0, QD=D=1
  assertPinBit(sim, chip, 'QA', 0, '74669 load: QA=A=0');
  assertPinBit(sim, chip, 'QB', 1, '74669 load: QB=B=1');
  assertPinBit(sim, chip, 'QC', 0, '74669 load: QC=C=0');
  assertPinBit(sim, chip, 'QD', 1, '74669 load: QD=D=1');
  disconnectWire(wm, clkHi);
}

// ── G8: 74670 - 4x4 Register File TRI ────────────────────────────────────────
console.log('\nG8: 74670 - 4x4 Register File (TRI)');
console.log('  G8a: Write then read word 0 = 0b1010');
{
  const { world, chip, wm } = setupChipWithPower('74x670');
  // Write addr 0 (WA1=0, WA2=0), data: D1=0(Q1),D2=1(Q2),D3=0(Q3),D4=1(Q4), WE=L
  connectPinsLow(wm,  chip, ['WE','WA1','WA2','D1','D3']);
  connectPinsHigh(wm, chip, ['D2','D4']);
  // Read addr 0 (RA1=0, RA2=0), RE=L (output enabled)
  connectPinsLow(wm, chip, ['RA1','RA2','RE']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q1', 0, '74670: Q1=D1=0');
  assertPinBit(sim, chip, 'Q2', 1, '74670: Q2=D2=1');
  assertPinBit(sim, chip, 'Q3', 0, '74670: Q3=D3=0');
  assertPinBit(sim, chip, 'Q4', 1, '74670: Q4=D4=1');
}

console.log('  G8b: RE=H → outputs HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74x670');
  connectPinsLow(wm, chip, ['WE','WA1','WA2','RA1','RA2']);
  connectPinsHigh(wm, chip, ['RE','D1','D2','D3','D4']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['Q1','Q2','Q3','Q4'])
    assertPinHighZ(sim, chip, q, `74670 RE=H: ${q} HiZ`);
}

// ── G9: 74671 / 74672 - 4 bit bidirectional SR stub ──────────────────────────
console.log('\nG9: 74671/672 - 4 bit SR/latch stubs');
{
  for (const id of ['74x671','74x672']) {
    const { world, chip, wm } = setupChipWithPower(id);
    // OEn=L to enable outputs, CLK=L, CLR=H
    connectPinsLow(wm, chip, ['OEn']);
    connectPinsHigh(wm, chip, ['CLR']);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    // Outputs should be valid (not erroring); basic check: pins exist
    assert(findPin(chip, 'QA') !== undefined, `${id}: QA pin exists`);
    assert(findPin(chip, 'SO') !== undefined, `${id}: SO pin exists`);
  }
}

// ── G10: 74673/674/675/676 - 16 bit shift register stubs ─────────────────────
console.log('\nG10: 74673/674/675/676 - 16 bit shift reg stubs (HiZ outputs)');
{
  for (const id of ['74x673','74x675']) {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinHighZ(sim, chip, 'SOUT', `${id}: SOUT HiZ`);
    assertPinHighZ(sim, chip, 'Q0',   `${id}: Q0 HiZ`);
  }
  for (const id of ['74x674','74x676']) {
    const { world, chip, wm } = setupChipWithPower(id);
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    assertPinHighZ(sim, chip, 'SOUT', `${id}: SOUT HiZ`);
  }
}

// ── G11: 74677 - 16 bit address comparator (behavioral) ──────────────────────
// The 74677 has a real evaluator (ADDR_COMP_CASCADE). With every input
// floating (TTL pull-ups), A = B = 0xFF and all three enables read HIGH
// (inactive), so it actively drives the inactive levels: GEn HIGH, EQout LOW.
// Pulling EQn LOW with A = B then asserts EQout HIGH.
console.log('\nG11: 74677 - 16 bit address comparator (behavioral)');
{
  const { world, chip, wm } = setupChipWithPower('74x677');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const vGen = getPinVoltage(sim, findPin(chip, 'GEn'));
  const vEq  = getPinVoltage(sim, findPin(chip, 'EQout'));
  assert(vGen !== undefined && vGen > 2.5, `74677 idle: GEn driven HIGH (got ${vGen})`);
  assert(vEq === undefined || vEq < 2.5,   `74677 idle: EQout LOW (got ${vEq})`);
}
{
  const { world, chip, wm } = setupChipWithPower('74x677');
  connectPinToGnd(wm, findPin(chip, 'EQn'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const vEq = getPinVoltage(sim, findPin(chip, 'EQout'));
  assert(vEq !== undefined && vEq > 2.5, `74677 EQn=0, A=B: EQout HIGH (got ${vEq})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\nResults: ${pass} passed, ${fail} failed, ${pass + fail} total`);
process.exit(fail > 0 ? 1 : 0);
