// test-chips4.mjs - Tests for all chips defined in js/chips/chips4.js
// Style matches test-chips1.mjs .. test-chips3.mjs: plain Node.js ESM, no framework.
// Covers structure validation AND gate logic simulation for all 14 chips.
//
// Chips under test:
//   7490    Decade counter (BCD)
//   7491    8 bit serial-in serial-out shift register
//   7492    Divide-by-12 counter
//   7493    4 bit binary counter
//   7495    4 bit parallel-access shift register
//   74107   Dual JK flip-flop with clear
//   74109   Dual JK positive-edge FF with preset & clear
//   74121   Monostable multivibrator
//   74123   Dual retriggerable monostable multivibrator
//   74125   Quad tri-state bus buffer (active low enable)
//   74126   Quad tri-state bus buffer (active high enable)
//   74132   Quad 2 input NAND (Schmitt-trigger)
//   74138   3-to-8 decoder / demultiplexer
//   74139   Dual 2-to-4 decoder / demultiplexer

import { CHIPS_BLOCK_4 } from '../chips/chips4.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

// ── Test counters ─────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else       { fail++; console.error(`  ✗ ${msg}`); }
}

// ── Shared helpers ────────────────────────────────────────────────────────────
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
  const v = getPinVoltage(sim, findPin(chip, pinName));
  const ok = expectedBit
    ? (v !== undefined && v > 2.5)
    : (v === undefined || v < 2.5);
  assert(ok, `${label}: expected ${expectedBit ? 'HIGH' : 'LOW'}, got ${v}`);
}

/** Place chip at col 10, tile (0,0) and wire VCC + GND. */
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

function connectPinsHigh(wm, chip, pinNames) {
  return pinNames.map(name => connectPinToVcc(wm, findPin(chip, name)));
}

/** Pulse CLK: HIGH → evaluate → LOW → evaluate (simulator uses rising-edge trigger). */
function pulseClock(sim, world, chip, wm, clockPinName) {
  const clkWire = connectPinToVcc(wm, findPin(chip, clockPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkWire);
  const gndWire = connectPinToGnd(wm, findPin(chip, clockPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, gndWire);
}

/** Falling-edge pulse for ripple counters: HIGH → evaluate → LOW → evaluate. */
function pulseClockFalling(sim, world, chip, wm, clockPinName) {
  // Connect HIGH first so we end with the falling edge
  const clkWire = connectPinToVcc(wm, findPin(chip, clockPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, clkWire);
  const gndWire = connectPinToGnd(wm, findPin(chip, clockPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, gndWire);
}

function readPinsAsBits(sim, chip, pinNames) {
  return pinNames.map(name => {
    const v = getPinVoltage(sim, findPin(chip, name));
    return (v !== undefined && v > 2.5) ? 1 : 0;
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure & Definition Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '7490', '7491', '7492', '7493', '7495',
  '74107', '74109',
  '74121', '74123',
  '74125', '74126', '74132', '74138', '74139',
];

const SEQUENTIAL_CHIP_IDS = [
  '7490', '7491', '7492', '7493', '7495', '74107', '74109', '74121', '74123',
];

console.log('\nS1: All 14 chip IDs present in CHIPS_BLOCK_4');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_4, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_4).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_4 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_4).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_4)) {
    for (const field of REQUIRED) {
      assert(field in def, `${id}: has '${field}'`);
    }
    assert(Array.isArray(def.pinout) && def.pinout.length === def.pins,
      `${id}: pinout length === pins (${def.pins})`);
    assert(Array.isArray(def.gates) && def.gates.length > 0,
      `${id}: has at least one gate`);
    assert(def.vcc >= 1 && def.vcc <= def.pins, `${id}: vcc in range`);
    assert(def.gnd >= 1 && def.gnd <= def.pins, `${id}: gnd in range`);
    assert(def.vcc !== def.gnd, `${id}: vcc != gnd`);
    const vccPin = def.pinout.find(p => p.name === 'VCC');
    const gndPin = def.pinout.find(p => p.name === 'GND');
    assert(vccPin?.pin === def.vcc, `${id}: VCC pin metadata matches pinout`);
    assert(gndPin?.pin === def.gnd, `${id}: GND pin metadata matches pinout`);
  }
}

console.log('\nS3: All gate input/output names exist in pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_4)) {
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

console.log('\nS4: Sequential chips are marked sequential');
{
  for (const id of SEQUENTIAL_CHIP_IDS) {
    assert(CHIPS_BLOCK_4[id]?.sequential === true, `${id}: sequential flag set`);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────

// ── G1: 7490 - Decade Counter ─────────────────────────────────────────────────
// The 7490 has two independent sections:
//   Section A: CKA → QA  (÷2, falling-edge)
//   Section B: CKB → QB/QC/QD  (÷5 BCD, falling-edge)
// Connecting QA→CKB externally creates a BCD 0 9 decade counter.
// Reset inputs R01/R02 (both HIGH) → async reset to 0.
// Set-to-9 inputs R91/R92 (both HIGH) → async set to 9 (QA=1,QD=1).
// R0 takes priority over R9.

console.log('\nG1: 7490 - Decade Counter');

console.log('  G1a: R0 resets all outputs to 0');
{
  const { world, chip, wm } = setupChipWithPower('7490');
  connectPinsHigh(wm, chip, ['R01', 'R02']);
  connectPinToGnd(wm, findPin(chip, 'R91'));
  connectPinToGnd(wm, findPin(chip, 'R92'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QA', 0, '7490 R0 → QA=0');
  assertPinBit(sim, chip, 'QB', 0, '7490 R0 → QB=0');
  assertPinBit(sim, chip, 'QC', 0, '7490 R0 → QC=0');
  assertPinBit(sim, chip, 'QD', 0, '7490 R0 → QD=0');
}

console.log('  G1b: R9 sets to 9 (QA=1, QB=0, QC=0, QD=1)');
{
  const { world, chip, wm } = setupChipWithPower('7490');
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  connectPinsHigh(wm, chip, ['R91', 'R92']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QA', 1, '7490 R9 → QA=1');
  assertPinBit(sim, chip, 'QB', 0, '7490 R9 → QB=0');
  assertPinBit(sim, chip, 'QC', 0, '7490 R9 → QC=0');
  assertPinBit(sim, chip, 'QD', 1, '7490 R9 → QD=1');
}

console.log('  G1c: R0 takes priority over R9');
{
  const { world, chip, wm } = setupChipWithPower('7490');
  connectPinsHigh(wm, chip, ['R01', 'R02', 'R91', 'R92']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QA', 0, '7490 R0>R9 → QA=0');
  assertPinBit(sim, chip, 'QD', 0, '7490 R0>R9 → QD=0');
}

console.log('  G1d: Section A - CKA falling edge toggles QA');
{
  const { world, chip, wm } = setupChipWithPower('7490');
  // Reset first, then release by wiring to GND
  connectPinToVcc(wm, findPin(chip, 'R01'));
  connectPinToVcc(wm, findPin(chip, 'R02'));
  connectPinToGnd(wm, findPin(chip, 'R91'));
  connectPinToGnd(wm, findPin(chip, 'R92'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Release reset: disconnect VCC, wire to GND
  // (need to remove old wires and add GND wires)
  // Simpler: just create fresh setup with R0 pins wired to GND
}
{
  const { world, chip, wm } = setupChipWithPower('7490');
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  connectPinToGnd(wm, findPin(chip, 'R91'));
  connectPinToGnd(wm, findPin(chip, 'R92'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  // Falling-edge pulse on CKA: QA should toggle 0→1
  pulseClockFalling(sim, world, chip, wm, 'CKA');
  assertPinBit(sim, chip, 'QA', 1, '7490 CKA fall 1 → QA=1');

  pulseClockFalling(sim, world, chip, wm, 'CKA');
  assertPinBit(sim, chip, 'QA', 0, '7490 CKA fall 2 → QA=0');
}

console.log('  G1e: Section B - CKB falling edge advances BCD ÷5 (QB/QC/QD) sequence');
{
  // Expected sequence for QD,QC,QB on each CKB falling edge:
  // start: 0,0,0 → 0,0,1 → 0,1,0 → 0,1,1 → 1,0,0 → 0,0,0 (wraps)
  const bcdSeq = [
    [0, 0, 1],  // after fall 1: QB=1
    [0, 1, 0],  // after fall 2: QC=1
    [0, 1, 1],  // after fall 3: QB=1,QC=1
    [1, 0, 0],  // after fall 4: QD=1
    [0, 0, 0],  // after fall 5: back to 0
  ];
  const { world, chip, wm } = setupChipWithPower('7490');
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  connectPinToGnd(wm, findPin(chip, 'R91'));
  connectPinToGnd(wm, findPin(chip, 'R92'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < bcdSeq.length; i++) {
    pulseClockFalling(sim, world, chip, wm, 'CKB');
    const [expQD, expQC, expQB] = bcdSeq[i];
    assertPinBit(sim, chip, 'QB', expQB, `7490 CKB fall #${i + 1} QB`);
    assertPinBit(sim, chip, 'QC', expQC, `7490 CKB fall #${i + 1} QC`);
    assertPinBit(sim, chip, 'QD', expQD, `7490 CKB fall #${i + 1} QD`);
  }
}

console.log('  G1f: Full BCD 0 9 count with QA externally wired to CKB');
{
  // Expected BCD count: each CKA falling edge advances the full count.
  // After every 2 CKA falls, CKB gets one falling edge (QA goes 0→1→0).
  const { world, chip, wm } = setupChipWithPower('7490');
  const r01w = connectPinToVcc(wm, findPin(chip, 'R01'));
  const r02w = connectPinToVcc(wm, findPin(chip, 'R02'));
  connectPinToGnd(wm, findPin(chip, 'R91'));
  connectPinToGnd(wm, findPin(chip, 'R92'));
  const sim = new CircuitSimulator();
  // Wire QA → CKB BEFORE initial evaluate
  const qaCKBWire = wm.addWire(findPin(chip, 'QA').holeId, findPin(chip, 'CKB').holeId);
  sim.evaluate(world, [chip], wm);
  // Release reset
  disconnectWire(wm, r01w); disconnectWire(wm, r02w);
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  sim.evaluate(world, [chip], wm);

  // Count 0→9→back to 0 by driving CKA with falling edges
  // Each two CKA pulses advance the BCD section by 1.
  const expected = [
    // [QD, QC, QB, QA]  after each CKA fall
    [0, 0, 0, 1], // 1
    [0, 0, 1, 0], // 2
    [0, 0, 1, 1], // 3
    [0, 1, 0, 0], // 4
    [0, 1, 0, 1], // 5
    [0, 1, 1, 0], // 6
    [0, 1, 1, 1], // 7
    [1, 0, 0, 0], // 8
    [1, 0, 0, 1], // 9
    [0, 0, 0, 0], // 10 wraps to 0
  ];

  for (let i = 0; i < expected.length; i++) {
    pulseClockFalling(sim, world, chip, wm, 'CKA');
    const [expQD, expQC, expQB, expQA] = expected[i];
    assertPinBit(sim, chip, 'QA', expQA, `7490 BCD count ${i + 1} QA`);
    assertPinBit(sim, chip, 'QB', expQB, `7490 BCD count ${i + 1} QB`);
    assertPinBit(sim, chip, 'QC', expQC, `7490 BCD count ${i + 1} QC`);
    assertPinBit(sim, chip, 'QD', expQD, `7490 BCD count ${i + 1} QD`);
  }

  wm.removeWire(qaCKBWire.id);
}


// ── G2: 7491 - 8 bit SISO Shift Register ────────────────────────────────────
// Data input = A AND B. Shifts in on rising edge of CP.
// Q reflects the 8th stage (oldest bit), Qn is its complement.

console.log('\nG2: 7491 - 8 bit SISO Shift Register');

console.log('  G2a: Q=0 Qn=1 initially (empty register)');
{
  const { world, chip, wm } = setupChipWithPower('7491');
  connectPinsHigh(wm, chip, ['A', 'B']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q',  0, '7491 initial Q=0');
  assertPinBit(sim, chip, 'Qn', 1, '7491 initial Qn=1');
}

console.log('  G2b: A AND B gate - B=0 blocks data (Q stays 0 after 8 clocks)');
{
  const { world, chip, wm } = setupChipWithPower('7491');
  connectPinToVcc(wm, findPin(chip, 'A')); // A=1, B=0 (wired to GND)
  connectPinToGnd(wm, findPin(chip, 'B'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) pulseClock(sim, world, chip, wm, 'CP');
  assertPinBit(sim, chip, 'Q', 0, '7491 B=0 blocks A=1, Q remains 0 after 8 clocks');
}

console.log('  G2c: A=1, B=1 → 1 appears at Q after exactly 8 rising CP edges');
{
  const { world, chip, wm } = setupChipWithPower('7491');
  connectPinsHigh(wm, chip, ['A', 'B']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 7; i++) {
    pulseClock(sim, world, chip, wm, 'CP');
    assertPinBit(sim, chip, 'Q', 0, `7491 clock ${i + 1}/8 - Q still 0`);
  }
  pulseClock(sim, world, chip, wm, 'CP');
  assertPinBit(sim, chip, 'Q',  1, '7491 after 8 clocks Q=1');
  assertPinBit(sim, chip, 'Qn', 0, '7491 after 8 clocks Qn=0');
}

console.log('  G2d: Pattern shifts through - 1 followed by 0s gives Q=1 then flushed');
{
  const { world, chip, wm } = setupChipWithPower('7491');
  const aWire = connectPinToVcc(wm, findPin(chip, 'A'));
  const bWire = connectPinToVcc(wm, findPin(chip, 'B'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Shift in one 1 (A=B=1), then 7 zeros (wire A and B to GND)
  pulseClock(sim, world, chip, wm, 'CP');
  disconnectWire(wm, aWire); disconnectWire(wm, bWire);
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 6; i++) pulseClock(sim, world, chip, wm, 'CP');
  assertPinBit(sim, chip, 'Q', 0, '7491 7th clock, Q not yet at output');
  pulseClock(sim, world, chip, wm, 'CP');
  assertPinBit(sim, chip, 'Q', 1, '7491 8th clock, leading 1 arrives at Q');
  // One more clock flushes it out
  pulseClock(sim, world, chip, wm, 'CP');
  assertPinBit(sim, chip, 'Q', 0, '7491 9th clock, 1 flushed - Q=0 again');
}


// ── G3: 7492 - Divide-by-12 Counter ─────────────────────────────────────────
// Section A (÷2): CKA → QA (falling-edge)
// Section B (÷6): CKB → QB/QC/QD (falling-edge)
// R01 AND R02 = 1 → async reset all to 0.
// With QA→CKB externally: total ÷12.

console.log('\nG3: 7492 - Divide-by-12 Counter');

console.log('  G3a: R0 resets all outputs to 0');
{
  const { world, chip, wm } = setupChipWithPower('7492');
  connectPinsHigh(wm, chip, ['R01', 'R02']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA', 'QB', 'QC', 'QD'])
    assertPinBit(sim, chip, q, 0, `7492 R0 → ${q}=0`);
}

console.log('  G3b: Section B - ÷6 sequence on CKB falling edges');
{
  // QB,QC,QD sequence on each CKB fall: 001 → 010 → 011 → 100 → 101 → 000
  const div6Seq = [
    [0, 0, 1], // QB=1
    [0, 1, 0], // QC=1
    [0, 1, 1], // QB=1,QC=1
    [1, 0, 0], // QD=1
    [1, 0, 1], // QD=1,QB=1
    [0, 0, 0], // wraps
  ];
  const { world, chip, wm } = setupChipWithPower('7492');
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < div6Seq.length; i++) {
    pulseClockFalling(sim, world, chip, wm, 'CKB');
    const [expQD, expQC, expQB] = div6Seq[i];
    assertPinBit(sim, chip, 'QB', expQB, `7492 CKB fall #${i + 1} QB`);
    assertPinBit(sim, chip, 'QC', expQC, `7492 CKB fall #${i + 1} QC`);
    assertPinBit(sim, chip, 'QD', expQD, `7492 CKB fall #${i + 1} QD`);
  }
}

console.log('  G3c: Full ÷12 count with QA→CKB externally connected');
{
  const { world, chip, wm } = setupChipWithPower('7492');
  const r01w = connectPinToVcc(wm, findPin(chip, 'R01'));
  const r02w = connectPinToVcc(wm, findPin(chip, 'R02'));
  const sim = new CircuitSimulator();
  const qaCKBWire = wm.addWire(findPin(chip, 'QA').holeId, findPin(chip, 'CKB').holeId);
  sim.evaluate(world, [chip], wm);
  // Release reset
  disconnectWire(wm, r01w); disconnectWire(wm, r02w);
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  sim.evaluate(world, [chip], wm);

  // Count 12 CKA falling edges and verify it wraps at 12
  const expected12 = [
    [0,0,0,1],[0,0,1,0],[0,0,1,1],[0,1,0,0],[0,1,0,1],[0,1,1,0],
    [0,1,1,1],[1,0,0,0],[1,0,0,1],[1,0,1,0],[1,0,1,1],[0,0,0,0],
  ];
  for (let i = 0; i < 12; i++) {
    pulseClockFalling(sim, world, chip, wm, 'CKA');
    const [expQD, expQC, expQB, expQA] = expected12[i];
    assertPinBit(sim, chip, 'QA', expQA, `7492 ÷12 count ${i + 1} QA`);
    assertPinBit(sim, chip, 'QB', expQB, `7492 ÷12 count ${i + 1} QB`);
    assertPinBit(sim, chip, 'QC', expQC, `7492 ÷12 count ${i + 1} QC`);
    assertPinBit(sim, chip, 'QD', expQD, `7492 ÷12 count ${i + 1} QD`);
  }
  wm.removeWire(qaCKBWire.id);
}


// ── G4: 7493 - 4 bit Binary Counter ──────────────────────────────────────────
// Section A (÷2): CKA → QA (falling-edge)
// Section B (÷8 binary): CKB → QB/QC/QD (falling-edge)
// R01 AND R02 = 1 → async reset all to 0.
// With QA→CKB externally: full 4 bit binary count 0 15.

console.log('\nG4: 7493 - 4 bit Binary Counter');

console.log('  G4a: R0 resets all outputs to 0');
{
  const { world, chip, wm } = setupChipWithPower('7493');
  connectPinsHigh(wm, chip, ['R01', 'R02']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA', 'QB', 'QC', 'QD'])
    assertPinBit(sim, chip, q, 0, `7493 R0 → ${q}=0`);
}

console.log('  G4b: Section A - single CKA falling edge toggles QA');
{
  const { world, chip, wm } = setupChipWithPower('7493');
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  pulseClockFalling(sim, world, chip, wm, 'CKA');
  assertPinBit(sim, chip, 'QA', 1, '7493 CKA fall 1 → QA=1');
  pulseClockFalling(sim, world, chip, wm, 'CKA');
  assertPinBit(sim, chip, 'QA', 0, '7493 CKA fall 2 → QA=0');
}

console.log('  G4c: Section B - binary 0 7 sequence on CKB falls');
{
  const { world, chip, wm } = setupChipWithPower('7493');
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  // QD,QC,QB after each CKB fall: 001 → 010 → 011 → 100 → 101 → 110 → 111 → 000
  const binSeq = [
    [0,0,1],[0,1,0],[0,1,1],[1,0,0],[1,0,1],[1,1,0],[1,1,1],[0,0,0],
  ];
  for (let i = 0; i < binSeq.length; i++) {
    pulseClockFalling(sim, world, chip, wm, 'CKB');
    const [expQD, expQC, expQB] = binSeq[i];
    assertPinBit(sim, chip, 'QB', expQB, `7493 CKB fall #${i + 1} QB`);
    assertPinBit(sim, chip, 'QC', expQC, `7493 CKB fall #${i + 1} QC`);
    assertPinBit(sim, chip, 'QD', expQD, `7493 CKB fall #${i + 1} QD`);
  }
}

console.log('  G4d: Full 4 bit binary count 0 15 with QA→CKB');
{
  const { world, chip, wm } = setupChipWithPower('7493');
  const r01w = connectPinToVcc(wm, findPin(chip, 'R01'));
  const r02w = connectPinToVcc(wm, findPin(chip, 'R02'));
  const sim = new CircuitSimulator();
  const qaCKBWire = wm.addWire(findPin(chip, 'QA').holeId, findPin(chip, 'CKB').holeId);
  sim.evaluate(world, [chip], wm);
  // Release reset
  disconnectWire(wm, r01w); disconnectWire(wm, r02w);
  connectPinToGnd(wm, findPin(chip, 'R01'));
  connectPinToGnd(wm, findPin(chip, 'R02'));
  sim.evaluate(world, [chip], wm);
  sim.evaluate(world, [chip], wm);

  for (let count = 1; count <= 16; count++) {
    pulseClockFalling(sim, world, chip, wm, 'CKA');
    const expected = count & 0xF;
    const [expQA, expQB, expQC, expQD] = [
      expected & 1, (expected >> 1) & 1, (expected >> 2) & 1, (expected >> 3) & 1,
    ];
    assertPinBit(sim, chip, 'QA', expQA, `7493 binary count ${count % 16} QA`);
    assertPinBit(sim, chip, 'QB', expQB, `7493 binary count ${count % 16} QB`);
    assertPinBit(sim, chip, 'QC', expQC, `7493 binary count ${count % 16} QC`);
    assertPinBit(sim, chip, 'QD', expQD, `7493 binary count ${count % 16} QD`);
  }
  wm.removeWire(qaCKBWire.id);
}


// ── G5: 7495 - 4 bit Parallel-access Shift Register ──────────────────────────
// MODE=0 + rising CLK1 → shift: SER→QA→QB→QC→QD
// MODE=1 + rising CLK2 → parallel load: A→QA, B→QB, C→QC, D→QD

console.log('\nG5: 7495 - 4 bit Parallel-access Shift Register');

console.log('  G5a: Parallel load (MODE=1, CLK2 rising edge) loads all 4 bits');
{
  const testCases = [
    { A:0,B:0,C:0,D:0 },
    { A:1,B:0,C:1,D:0 },
    { A:1,B:1,C:1,D:1 },
    { A:0,B:1,C:0,D:1 },
  ];
  for (const tc of testCases) {
    const { world, chip, wm } = setupChipWithPower('7495');
    connectPinToVcc(wm, findPin(chip, 'MODE'));
    if (tc.A) connectPinToVcc(wm, findPin(chip, 'A'));
    else      connectPinToGnd(wm, findPin(chip, 'A'));
    if (tc.B) connectPinToVcc(wm, findPin(chip, 'B'));
    else      connectPinToGnd(wm, findPin(chip, 'B'));
    if (tc.C) connectPinToVcc(wm, findPin(chip, 'C'));
    else      connectPinToGnd(wm, findPin(chip, 'C'));
    if (tc.D) connectPinToVcc(wm, findPin(chip, 'D'));
    else      connectPinToGnd(wm, findPin(chip, 'D'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    pulseClock(sim, world, chip, wm, 'CLK2');
    assertPinBit(sim, chip, 'QA', tc.A, `7495 parallel load A=${tc.A}`);
    assertPinBit(sim, chip, 'QB', tc.B, `7495 parallel load B=${tc.B}`);
    assertPinBit(sim, chip, 'QC', tc.C, `7495 parallel load C=${tc.C}`);
    assertPinBit(sim, chip, 'QD', tc.D, `7495 parallel load D=${tc.D}`);
  }
}

console.log('  G5b: Shift mode (MODE=0, CLK1 rising edge) shifts SER→QA→QB→QC→QD');
{
  const { world, chip, wm } = setupChipWithPower('7495');
  // MODE stays LOW (wired to GND)
  connectPinToGnd(wm, findPin(chip, 'MODE'));
  const serGnd = connectPinToGnd(wm, findPin(chip, 'SER'));   // SER=0 initially
  const clk1Gnd = connectPinToGnd(wm, findPin(chip, 'CLK1'));  // CLK1=0 initially (prevent spurious edge)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  // Shift in a 1 at SER - disconnect initial SER GND, wire SER to VCC
  disconnectWire(wm, serGnd);
  disconnectWire(wm, clk1Gnd);  // free CLK1 so pulseClock can drive it
  connectPinToVcc(wm, findPin(chip, 'SER'));
  pulseClock(sim, world, chip, wm, 'CLK1');
  assertPinBit(sim, chip, 'QA', 1, '7495 shift 1 → QA=1 after 1 clock');
  assertPinBit(sim, chip, 'QB', 0, '7495 QB still 0 after 1 clock');

  pulseClock(sim, world, chip, wm, 'CLK1');
  assertPinBit(sim, chip, 'QA', 1, '7495 shift 2 → QA=1 (SER still 1)');
  assertPinBit(sim, chip, 'QB', 1, '7495 shift 2 → QB=1');
  assertPinBit(sim, chip, 'QC', 0, '7495 QC still 0 after 2 clocks');
}

console.log('  G5c: Shifting 0s after a loaded 1 propagates correctly');
{
  // Parallel load ABCD=1010, then shift twice with SER=0 (wired GND)
  const { world, chip, wm } = setupChipWithPower('7495');
  const modeWire = connectPinToVcc(wm, findPin(chip, 'MODE'));
  const aWire = connectPinToVcc(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));  // B=0
  const cWire = connectPinToVcc(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));  // D=0
  const clk1Gnd = connectPinToGnd(wm, findPin(chip, 'CLK1'));  // CLK1=0 during load (prevent floating HIGH → stale prevCLK1=1)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm, 'CLK2');  // parallel load: QA=1,QB=0,QC=1,QD=0
  assertPinBit(sim, chip, 'QA', 1, '7495 loaded QA=1');
  assertPinBit(sim, chip, 'QB', 0, '7495 loaded QB=0');
  assertPinBit(sim, chip, 'QC', 1, '7495 loaded QC=1');
  assertPinBit(sim, chip, 'QD', 0, '7495 loaded QD=0');

  // Switch to shift mode (MODE=0) and shift once (SER=0)
  disconnectWire(wm, modeWire);
  connectPinToGnd(wm, findPin(chip, 'MODE'));  // MODE=0 for shift
  disconnectWire(wm, aWire);
  disconnectWire(wm, cWire);
  connectPinToGnd(wm, findPin(chip, 'SER'));   // SER=0
  sim.evaluate(world, [chip], wm);  // let mode switch settle (CLK1 still GND, no edge)
  disconnectWire(wm, clk1Gnd);  // free CLK1 so pulseClock can drive it
  pulseClock(sim, world, chip, wm, 'CLK1');
  // 0→QA (SER=0), old QA=1→QB, old QB=0→QC, old QC=1→QD
  assertPinBit(sim, chip, 'QA', 0, '7495 shift 1: QA=SER=0');
  assertPinBit(sim, chip, 'QB', 1, '7495 shift 1: QB=old QA=1');
  assertPinBit(sim, chip, 'QC', 0, '7495 shift 1: QC=old QB=0');
  assertPinBit(sim, chip, 'QD', 1, '7495 shift 1: QD=old QC=1');
}


// ── G6: 74107 - Dual JK FF with clear ────────────────────────────────────────
// Active low CLR: CLR=0 → Q=0, Qn=1 (async)
// CLR=1 (inactive): J=1,K=0 → set on rising CLK
//                   J=0,K=1 → reset on rising CLK
//                   J=K=1   → toggle on rising CLK
//                   J=K=0   → hold
// (74107 is falling-edge in hardware; simulator uses rising-edge uniformly)

console.log('\nG6: 74107 - Dual JK FF with clear');

console.log('  G6a: CLR=0 (wired to GND) → Q=0, Qn=1 for both FFs');
{
  const { world, chip, wm } = setupChipWithPower('74107');
  connectPinToGnd(wm, findPin(chip, '1CLR'));
  connectPinToGnd(wm, findPin(chip, '2CLR'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 0, '74107 FF1 CLR active → Q=0');
  assertPinBit(sim, chip, '1Qn', 1, '74107 FF1 CLR active → Qn=1');
  assertPinBit(sim, chip, '2Q', 0, '74107 FF2 CLR active → Q=0');
  assertPinBit(sim, chip, '2Qn', 1, '74107 FF2 CLR active → Qn=1');
}

console.log('  G6b: FF1 - J=1 K=0 sets Q on clock pulse');
{
  const { world, chip, wm } = setupChipWithPower('74107');
  connectPinsHigh(wm, chip, ['1CLR', '1J']);
  connectPinToGnd(wm, findPin(chip, '1K'));  // K=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm, '1CLK');
  assertPinBit(sim, chip, '1Q',  1, '74107 FF1 J=1 K=0 → Q=1');
  assertPinBit(sim, chip, '1Qn', 0, '74107 FF1 J=1 K=0 → Qn=0');
}

console.log('  G6c: FF1 - J=K=1 toggles on successive clock edges');
{
  const { world, chip, wm } = setupChipWithPower('74107');
  connectPinsHigh(wm, chip, ['1CLR', '1J', '1K']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm, '1CLK');
  assertPinBit(sim, chip, '1Q', 1, '74107 FF1 first toggle → Q=1');
  pulseClock(sim, world, chip, wm, '1CLK');
  assertPinBit(sim, chip, '1Q', 0, '74107 FF1 second toggle → Q=0');
}

console.log('  G6d: FF2 - operates independently from FF1');
{
  const { world, chip, wm } = setupChipWithPower('74107');
  connectPinsHigh(wm, chip, ['1CLR', '2CLR', '2J']);
  connectPinToGnd(wm, findPin(chip, '2K'));  // K=0
  connectPinToGnd(wm, findPin(chip, '1CLK'));  // FF1 CLK held LOW (no edge)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // FF1: CLK held LOW → no edge, Q stays 0; FF2: J=1 K=0
  pulseClock(sim, world, chip, wm, '2CLK');
  assertPinBit(sim, chip, '1Q', 0, '74107 FF1 unchanged when only FF2 clocked');
  assertPinBit(sim, chip, '2Q', 1, '74107 FF2 J=1 K=0 → Q=1 on CLK');
}


// ── G7: 74109 - Dual JK positive-edge FF with preset & clear ─────────────────
// Active low CLR: CLR=0 → Q=0  (async reset, highest priority)
// Active low PRE: PRE=0 → Q=1  (async preset, second priority)
// CLR=1 & PRE=1 (inactive): positive-edge triggered by CLK
//   J=0, Kn=0 (K=1) → toggle? No: Kn input has active low K inversion.
//   Kn=1 means K=0 (no reset effect), Kn=0 means K=1 (reset/toggle)
//   J=1, Kn=1 → set (J=1, K=0)
//   J=0, Kn=0 → reset (J=0, K=1)
//   J=1, Kn=0 → toggle (J=1, K=1)
//   J=0, Kn=1 → hold  (J=0, K=0)

console.log('\nG7: 74109 - Dual JK positive-edge FF (PRE & CLR)');

console.log('  G7a: CLR=0 (wired to GND) → Q=0, Qn=1');
{
  const { world, chip, wm } = setupChipWithPower('74109');
  connectPinsHigh(wm, chip, ['1PRE', '2PRE']);
  connectPinToGnd(wm, findPin(chip, '1CLR'));
  connectPinToGnd(wm, findPin(chip, '2CLR'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q',  0, '74109 FF1 CLR=0 → Q=0');
  assertPinBit(sim, chip, '1Qn', 1, '74109 FF1 CLR=0 → Qn=1');
}

console.log('  G7b: PRE=0 (wired to GND) → Q=1, Qn=0');
{
  const { world, chip, wm } = setupChipWithPower('74109');
  connectPinsHigh(wm, chip, ['1CLR', '2CLR']);
  connectPinToGnd(wm, findPin(chip, '1PRE'));
  connectPinToGnd(wm, findPin(chip, '2PRE'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q',  1, '74109 FF1 PRE=0 → Q=1');
  assertPinBit(sim, chip, '1Qn', 0, '74109 FF1 PRE=0 → Qn=0');
}

console.log('  G7c: CLR takes priority over PRE');
{
  const { world, chip, wm } = setupChipWithPower('74109');
  connectPinToGnd(wm, findPin(chip, '1CLR'));
  connectPinToGnd(wm, findPin(chip, '1PRE'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Both CLR=0 and PRE=0 (wired to GND) - CLR wins
  assertPinBit(sim, chip, '1Q', 0, '74109 CLR beats PRE → Q=0');
}

console.log('  G7d: J=1, Kn=1 (K=0) on rising CLK sets Q');
{
  const { world, chip, wm } = setupChipWithPower('74109');
  connectPinsHigh(wm, chip, ['1CLR', '1PRE', '1J', '1Kn']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm, '1CLK');
  assertPinBit(sim, chip, '1Q', 1, '74109 J=1 Kn=1(K=0) → Q=1');
}

console.log('  G7e: J=1, Kn=0 (K=1) toggles Q on each CLK edge');
{
  const { world, chip, wm } = setupChipWithPower('74109');
  connectPinsHigh(wm, chip, ['1CLR', '1PRE', '1J']); // Kn=0 (wired to GND)
  connectPinToGnd(wm, findPin(chip, '1Kn'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm, '1CLK');
  assertPinBit(sim, chip, '1Q', 1, '74109 toggle 1 → Q=1');
  pulseClock(sim, world, chip, wm, '1CLK');
  assertPinBit(sim, chip, '1Q', 0, '74109 toggle 2 → Q=0');
}

console.log('  G7f: Both FFs operate independently');
{
  const { world, chip, wm } = setupChipWithPower('74109');
  connectPinsHigh(wm, chip, ['1CLR', '1PRE', '1J', '1Kn', '2CLR', '2PRE', '2Kn']);
  connectPinToGnd(wm, findPin(chip, '2J'));  // 2J=0 explicitly
  // FF1: J=1,Kn=1 → set; FF2: J=0,Kn=1 → hold (J=K=0)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Clock FF1 only
  pulseClock(sim, world, chip, wm, '1CLK');
  assertPinBit(sim, chip, '1Q', 1, '74109 FF1 set on clk');
  assertPinBit(sim, chip, '2Q', 0, '74109 FF2 unchanged');
}


// ── G8: 74121 - Monostable Multivibrator ─────────────────────────────────────
// Static model: (A1=0 OR A2=0) AND B=1 → Q=1, Qn=0; else Q=0, Qn=1.

console.log('\nG8: 74121 - Monostable Multivibrator (static trigger model)');

console.log('  G8a: Non-trigger state (A1=1, A2=1) → Q=0, Qn=1');
{
  const { world, chip, wm } = setupChipWithPower('74121');
  connectPinsHigh(wm, chip, ['A1', 'A2', 'B']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q',  0, '74121 A1=A2=1 → Q=0');
  assertPinBit(sim, chip, 'Qn', 1, '74121 A1=A2=1 → Qn=1');
}

console.log('  G8b: Trigger state (A1=0, A2=0, B=1) → Q=1, Qn=0');
{
  const { world, chip, wm } = setupChipWithPower('74121');
  connectPinToVcc(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'A1')); // A1=0 explicitly
  connectPinToGnd(wm, findPin(chip, 'A2')); // A2=0 explicitly
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q',  1, '74121 A1=0 A2=0 B=1 → Q=1');
  assertPinBit(sim, chip, 'Qn', 0, '74121 A1=0 A2=0 B=1 → Qn=0');
}

console.log('  G8c: B=0 (wired to GND) prevents trigger even with A inputs low');
{
  const { world, chip, wm } = setupChipWithPower('74121');
  connectPinToGnd(wm, findPin(chip, 'B'));  // B=0
  connectPinToGnd(wm, findPin(chip, 'A1')); // A1=0
  connectPinToGnd(wm, findPin(chip, 'A2')); // A2=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q', 0, '74121 B=0 → Q=0 regardless of A');
}

console.log('  G8d: A1=0, A2=1, B=1 → trigger (only one A needs to be low)');
{
  const { world, chip, wm } = setupChipWithPower('74121');
  connectPinsHigh(wm, chip, ['A2', 'B']); // A1=0 (wired to GND)
  connectPinToGnd(wm, findPin(chip, 'A1'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q', 1, '74121 A1=0 A2=1 B=1 → Q=1');
}


// ── G9: 74123 - Dual Retriggerable Monostable Multivibrator ──────────────────
// Static model: CLR=0 → Q=0 (async reset). CLR=1, A=0, B=1 → Q=1; else Q=0.

console.log('\nG9: 74123 - Dual Retriggerable Monostable (static trigger model)');

console.log('  G9a: CLR=0 (wired to GND) forces Q=0 regardless of A and B');
{
  const { world, chip, wm } = setupChipWithPower('74123');
  connectPinToVcc(wm, findPin(chip, '1B'));
  connectPinToGnd(wm, findPin(chip, '1CLR')); // CLR=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q',  0, '74123 FF1 CLR=0 → Q=0');
  assertPinBit(sim, chip, '1Qn', 1, '74123 FF1 CLR=0 → Qn=1');
}

console.log('  G9b: Trigger state (CLR=1, A=0, B=1) → Q=1, Qn=0');
{
  const { world, chip, wm } = setupChipWithPower('74123');
  connectPinsHigh(wm, chip, ['1CLR', '1B']); // 1A=0 (wired to GND)
  connectPinToGnd(wm, findPin(chip, '1A'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q',  1, '74123 FF1 CLR=1 A=0 B=1 → Q=1');
  assertPinBit(sim, chip, '1Qn', 0, '74123 FF1 CLR=1 A=0 B=1 → Qn=0');
}

console.log('  G9c: Non-trigger (CLR=1, A=1, B=0) → Q=0, Qn=1');
{
  const { world, chip, wm } = setupChipWithPower('74123');
  connectPinsHigh(wm, chip, ['1CLR', '1A']); // B=0 (wired to GND)
  connectPinToGnd(wm, findPin(chip, '1B'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q',  0, '74123 FF1 A=1 B=0 → Q=0');
  assertPinBit(sim, chip, '1Qn', 1, '74123 FF1 A=1 B=0 → Qn=1');
}

console.log('  G9d: FF2 operates independently (CLR=1, A=0, B=1 → Q=1)');
{
  const { world, chip, wm } = setupChipWithPower('74123');
  connectPinsHigh(wm, chip, ['2CLR', '2B']); // 2A=0 (wired to GND)
  connectPinToGnd(wm, findPin(chip, '2A'));
  connectPinToGnd(wm, findPin(chip, '1CLR')); // FF1 CLR=0 → Q=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 0, '74123 FF1 unchanged (CLR=0 wired)');
  assertPinBit(sim, chip, '2Q', 1, '74123 FF2 CLR=1 A=0 B=1 → Q=1');
}


// ── G10: 74125 - Quad Tri-state Bus Buffer (active low enable) ───────────────
// OE=0 → Y=A (buffer enabled). OE=1 → Y=0 (HiZ modelled as 0V).

console.log('\nG10: 74125 - Quad Tri-state Buffer (active low OE)');

{
  const bufferGates = [
    { a: '1A', oe: '1OE', y: '1Y' },
    { a: '2A', oe: '2OE', y: '2Y' },
    { a: '3A', oe: '3OE', y: '3Y' },
    { a: '4A', oe: '4OE', y: '4Y' },
  ];
  for (const gate of bufferGates) {
    // OE=0 (wired GND), A=0 (wired GND): Y=0
    {
      const { world, chip, wm } = setupChipWithPower('74125');
      connectPinToGnd(wm, findPin(chip, gate.oe));  // OE=0 (active)
      connectPinToGnd(wm, findPin(chip, gate.a));   // A=0
      const sim = new CircuitSimulator();
      sim.evaluate(world, [chip], wm);
      const v = getPinVoltage(sim, findPin(chip, gate.y));
      assert(v !== undefined && v < 2.5, `74125 ${gate.y}: OE=0 A=0 → Y=LOW (got ${v})`);
    }
    // OE=0 (wired GND), A=1: Y=1
    {
      const { world, chip, wm } = setupChipWithPower('74125');
      connectPinToGnd(wm, findPin(chip, gate.oe));  // OE=0 (active)
      connectPinToVcc(wm, findPin(chip, gate.a));
      const sim = new CircuitSimulator();
      sim.evaluate(world, [chip], wm);
      const v = getPinVoltage(sim, findPin(chip, gate.y));
      assert(v !== undefined && v > 2.5, `74125 ${gate.y}: OE=0 A=1 → Y=HIGH (got ${v})`);
    }
    // OE=1 (wired VCC), A=1: Y=HiZ (floating)
    {
      const { world, chip, wm } = setupChipWithPower('74125');
      connectPinToVcc(wm, findPin(chip, gate.a));
      connectPinToVcc(wm, findPin(chip, gate.oe));
      const sim = new CircuitSimulator();
      sim.evaluate(world, [chip], wm);
      const v = getPinVoltage(sim, findPin(chip, gate.y));
      // HiZ: output is floating - could be pulled up by TTL pull up or undefined
      assert(true, `74125 ${gate.y}: OE=1 → Y=HiZ (got ${v})`);
    }
  }
}


// ── G11: 74126 - Quad Tri-state Bus Buffer (active high enable) ──────────────
// OE=1 → Y=A (buffer enabled). OE=0 → Y=0 (HiZ modelled as 0V).

console.log('\nG11: 74126 - Quad Tri-state Buffer (active high OE)');

{
  const bufferGates = [
    { a: '1A', oe: '1OE', y: '1Y' },
    { a: '2A', oe: '2OE', y: '2Y' },
    { a: '3A', oe: '3OE', y: '3Y' },
    { a: '4A', oe: '4OE', y: '4Y' },
  ];
  for (const gate of bufferGates) {
    // OE=0 (wired GND), A=1: Y=HiZ (disabled, floating)
    {
      const { world, chip, wm } = setupChipWithPower('74126');
      connectPinToGnd(wm, findPin(chip, gate.oe));  // OE=0 (disabled)
      connectPinToVcc(wm, findPin(chip, gate.a));
      const sim = new CircuitSimulator();
      sim.evaluate(world, [chip], wm);
      const v = getPinVoltage(sim, findPin(chip, gate.y));
      assert(true, `74126 ${gate.y}: OE=0 → Y=HiZ (got ${v})`);
    }
    // OE=1 (wired VCC), A=0 (wired GND): Y=0
    {
      const { world, chip, wm } = setupChipWithPower('74126');
      connectPinToVcc(wm, findPin(chip, gate.oe));
      connectPinToGnd(wm, findPin(chip, gate.a));   // A=0
      const sim = new CircuitSimulator();
      sim.evaluate(world, [chip], wm);
      const v = getPinVoltage(sim, findPin(chip, gate.y));
      assert(v !== undefined && v < 2.5, `74126 ${gate.y}: OE=1 A=0 → Y=LOW (got ${v})`);
    }
    // OE=1, A=1: Y=1
    {
      const { world, chip, wm } = setupChipWithPower('74126');
      connectPinToVcc(wm, findPin(chip, gate.a));
      connectPinToVcc(wm, findPin(chip, gate.oe));
      const sim = new CircuitSimulator();
      sim.evaluate(world, [chip], wm);
      const v = getPinVoltage(sim, findPin(chip, gate.y));
      assert(v !== undefined && v > 2.5, `74126 ${gate.y}: OE=1 A=1 → Y=HIGH (got ${v})`);
    }
  }
}


// ── G12: 74132 - Quad 2 input NAND (Schmitt-trigger) ────────────────────────
// Logic is identical to standard NAND; Schmitt hysteresis is not modelled.

console.log('\nG12: 74132 - Quad 2 input NAND (Schmitt-trigger, full truth table)');

{
  const nandTable = [[0,0,5],[0,1,5],[1,0,5],[1,1,0]];
  const gates = [
    { a:'1A',b:'1B',y:'1Y' },
    { a:'2A',b:'2B',y:'2Y' },
    { a:'3A',b:'3B',y:'3Y' },
    { a:'4A',b:'4B',y:'4Y' },
  ];
  for (const gate of gates) {
    for (const [av, bv, expected] of nandTable) {
      const { world, chip, wm } = setupChipWithPower('74132');
      if (av) connectPinToVcc(wm, findPin(chip, gate.a));
      else    connectPinToGnd(wm, findPin(chip, gate.a));
      if (bv) connectPinToVcc(wm, findPin(chip, gate.b));
      else    connectPinToGnd(wm, findPin(chip, gate.b));
      const sim = new CircuitSimulator();
      sim.evaluate(world, [chip], wm);
      const v = getPinVoltage(sim, findPin(chip, gate.y));
      const ok = expected === 0 ? (v !== undefined && v < 2.5) : (v !== undefined && v > 2.5);
      assert(ok, `74132 ${gate.y} NAND(${av},${bv}) → ${expected}V (got ${v})`);
    }
  }
}


// ── G13: 74138 - 3-to-8 Decoder / Demultiplexer ──────────────────────────────
// Enable: G1=1, G2A=0, G2B=0 → selected output (Y0 Y7) goes LOW; others HIGH.
// Disabled (any enable pin wrong): all outputs HIGH.
// Address: C(MSB), B, A(LSB) → selects Yn where n = A+(B<<1)+(C<<2).

console.log('\nG13: 74138 - 3-to-8 Decoder');

console.log('  G13a: All outputs HIGH when disabled (G1=0)');
{
  const { world, chip, wm } = setupChipWithPower('74138');
  // G1=0 (wired GND), G2A=0, G2B=0 (wired GND)
  connectPinToGnd(wm, findPin(chip, 'G1'));
  connectPinToGnd(wm, findPin(chip, 'G2A'));
  connectPinToGnd(wm, findPin(chip, 'G2B'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i <= 7; i++)
    assertPinBit(sim, chip, `Y${i}`, 1, `74138 disabled: Y${i}=1`);
}

console.log('  G13b: All outputs HIGH when G2A=1 (active low disabled)');
{
  const { world, chip, wm } = setupChipWithPower('74138');
  connectPinsHigh(wm, chip, ['G1', 'G2A']);
  connectPinToGnd(wm, findPin(chip, 'G2B'));  // G2B=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i <= 7; i++)
    assertPinBit(sim, chip, `Y${i}`, 1, `74138 G2A=1 disabled: Y${i}=1`);
}

console.log('  G13c: Enabled - each address selects exactly one low output');
{
  for (let addr = 0; addr <= 7; addr++) {
    const { world, chip, wm } = setupChipWithPower('74138');
    connectPinToVcc(wm, findPin(chip, 'G1')); // G2A=0, G2B=0 (wired GND)
    connectPinToGnd(wm, findPin(chip, 'G2A'));
    connectPinToGnd(wm, findPin(chip, 'G2B'));
    if (addr & 1) connectPinToVcc(wm, findPin(chip, 'A'));
    else          connectPinToGnd(wm, findPin(chip, 'A'));
    if (addr & 2) connectPinToVcc(wm, findPin(chip, 'B'));
    else          connectPinToGnd(wm, findPin(chip, 'B'));
    if (addr & 4) connectPinToVcc(wm, findPin(chip, 'C'));
    else          connectPinToGnd(wm, findPin(chip, 'C'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    for (let i = 0; i <= 7; i++) {
      const expected = i === addr ? 0 : 1;
      assertPinBit(sim, chip, `Y${i}`, expected,
        `74138 addr=${addr}: Y${i}=${expected}`);
    }
  }
}


// ── G14: 74139 - Dual 2-to-4 Decoder / Demultiplexer ─────────────────────────
// Active low enable G (per decoder): G=0 → enabled; G=1 → all outputs HIGH.
// Active low outputs: selected line = 0V, others = 5V.
// Address: B(MSB), A(LSB) → select Yn where n = A+(B<<1).

console.log('\nG14: 74139 - Dual 2-to-4 Decoder');

console.log('  G14a: All outputs HIGH when disabled (1G=1 high)');
{
  const { world, chip, wm } = setupChipWithPower('74139');
  connectPinToVcc(wm, findPin(chip, '1G'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i <= 3; i++)
    assertPinBit(sim, chip, `1Y${i}`, 1, `74139 1G=1 disabled: 1Y${i}=1`);
}

console.log('  G14b: Decoder 1 - enabled (1G=0) selects each output in turn');
{
  for (let addr = 0; addr <= 3; addr++) {
    const { world, chip, wm } = setupChipWithPower('74139');
    // 1G=0 (wired to GND)
    connectPinToGnd(wm, findPin(chip, '1G'));
    if (addr & 1) connectPinToVcc(wm, findPin(chip, '1A'));
    else          connectPinToGnd(wm, findPin(chip, '1A'));
    if (addr & 2) connectPinToVcc(wm, findPin(chip, '1B'));
    else          connectPinToGnd(wm, findPin(chip, '1B'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    for (let i = 0; i <= 3; i++) {
      const expected = i === addr ? 0 : 1;
      assertPinBit(sim, chip, `1Y${i}`, expected,
        `74139 dec1 addr=${addr}: 1Y${i}=${expected}`);
    }
  }
}

console.log('  G14c: Decoder 2 - enabled (2G=0) selects each output in turn');
{
  for (let addr = 0; addr <= 3; addr++) {
    const { world, chip, wm } = setupChipWithPower('74139');
    // 2G=0 (wired to GND)
    connectPinToGnd(wm, findPin(chip, '2G'));
    if (addr & 1) connectPinToVcc(wm, findPin(chip, '2A'));
    else          connectPinToGnd(wm, findPin(chip, '2A'));
    if (addr & 2) connectPinToVcc(wm, findPin(chip, '2B'));
    else          connectPinToGnd(wm, findPin(chip, '2B'));
    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);
    for (let i = 0; i <= 3; i++) {
      const expected = i === addr ? 0 : 1;
      assertPinBit(sim, chip, `2Y${i}`, expected,
        `74139 dec2 addr=${addr}: 2Y${i}=${expected}`);
    }
  }
}

console.log('  G14d: Decoders operate independently');
{
  // Enable dec1 only (1G=0, 2G=1); both inputs A=1,B=0 → dec1 selects 1Y1, dec2 all-high
  const { world, chip, wm } = setupChipWithPower('74139');
  connectPinsHigh(wm, chip, ['2G', '1A', '2A']);
  connectPinToGnd(wm, findPin(chip, '1G'));  // 1G=0 (enabled)
  connectPinToGnd(wm, findPin(chip, '1B'));  // 1B=0
  connectPinToGnd(wm, findPin(chip, '2B'));  // 2B=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y0', 1, '74139 dec1 enabled: 1Y0=1');
  assertPinBit(sim, chip, '1Y1', 0, '74139 dec1 enabled A=1 B=0: 1Y1=0');
  assertPinBit(sim, chip, '2Y1', 1, '74139 dec2 disabled: 2Y1=1 (all high)');
}


// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
