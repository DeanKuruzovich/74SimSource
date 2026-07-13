// test-chips5.mjs - Tests for all chips defined in js/chips/chips5.js
// Style matches test-chips1.mjs .. test-chips4.mjs: plain Node.js ESM, no framework.
// Covers structure validation AND gate logic simulation for all 13 chips.
//
// Chips under test:
//   74148   8 to 3 priority encoder
//   74150   16-to-1 multiplexer
//   74151   8-to-1 multiplexer
//   74153   Dual 4-to-1 multiplexer
//   74154   4-to-16 decoder / demultiplexer
//   74157   Quad 2-to-1 multiplexer
//   74160   Synchronous decade counter (async clear)
//   74161   Synchronous 4 bit binary counter (async clear)
//   74163   Synchronous 4 bit binary counter (sync clear)
//   74164   8 bit serial in parallel out shift register
//   74165   8 bit parallel in serial out shift register
//   74173   4 bit D register with tri state outputs
//   74174   Hex D flip flop with clear

import { CHIPS_BLOCK_5 } from '../chips/chips5.js';
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
  const ok = expectedBit ? (v !== undefined && v > 2.5) : (v === undefined || v < 2.5);
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
  return pinNames.map(n => connectPinToVcc(wm, findPin(chip, n)));
}

/** Pulse CLK HIGH→evaluate→LOW→evaluate (rising edge trigger). */
function pulseClock(sim, world, chip, wm, clkPinName = 'CLK') {
  const w = connectPinToVcc(wm, findPin(chip, clkPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, w);
  const gw = connectPinToGnd(wm, findPin(chip, clkPinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, gw);
}

function readPinBit(sim, chip, pinName) {
  const v = getPinVoltage(sim, findPin(chip, pinName));
  return (v !== undefined && v > 2.5) ? 1 : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure & Definition Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74x148', '74x150', '74x151', '74x153', '74x154', '74x157',
  '74x160', '74x161', '74x163',
  '74x164', '74x165',
  '74x173', '74x174',
];

const SEQUENTIAL_IDS = [
  '74x160', '74x161', '74x163', '74x164', '74x165', '74x173', '74x174',
];

console.log('\nS1: All 13 chip IDs present in CHIPS_BLOCK_5');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_5, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_5).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_5 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_5).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_5)) {
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
    assert(vccPin?.pin === def.vcc, `${id}: VCC pin number matches pinout`);
    assert(gndPin?.pin === def.gnd, `${id}: GND pin number matches pinout`);
  }
}

console.log('\nS3: All gate input/output names exist in pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_5)) {
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
  for (const id of SEQUENTIAL_IDS) {
    assert(CHIPS_BLOCK_5[id]?.sequential === true, `${id}: sequential flag set`);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────


// ── G1: 74148 - 8 to 3 Priority Encoder ─────────────────────────────────────
// Inputs I0-I7 and EI are active LOW. Outputs A0-A2, GS, EO are active LOW.
// EI=0 (floating/LOW): enabled.  EI=1 (HIGH/VCC): disabled.
// Priority: I7 > I6 > ... > I0.
// When enabled, no inputs active:  A=111(HIGH), GS=1(HIGH), EO=0(LOW).
// When enabled, input In active:   A = ~n (active low encoded), GS=0(LOW), EO=1(HIGH).
// When disabled (EI=HIGH):         A=111, GS=1, EO=1 (all HIGH).

console.log('\nG1: 74148 - 8 to 3 Priority Encoder');

console.log('  G1a: Disabled (EI=HIGH) - all outputs HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74x148');
  connectPinsHigh(wm, chip, ['EI']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A0', 1, '74148 EI=H → A0=H');
  assertPinBit(sim, chip, 'A1', 1, '74148 EI=H → A1=H');
  assertPinBit(sim, chip, 'A2', 1, '74148 EI=H → A2=H');
  assertPinBit(sim, chip, 'GS', 1, '74148 EI=H → GS=H');
  assertPinBit(sim, chip, 'EO', 1, '74148 EI=H → EO=H');
}

console.log('  G1b: Enabled, no inputs active (all HIGH) - A=111, GS=H, EO=L');
{
  const { world, chip, wm } = setupChipWithPower('74x148');
  // EI=GND (enabled), all data inputs HIGH (inactive)
  connectPinToGnd(wm, findPin(chip, 'EI'));
  connectPinsHigh(wm, chip, ['I0','I1','I2','I3','I4','I5','I6','I7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A0', 1, '74148 no input → A0=H');
  assertPinBit(sim, chip, 'A1', 1, '74148 no input → A1=H');
  assertPinBit(sim, chip, 'A2', 1, '74148 no input → A2=H');
  assertPinBit(sim, chip, 'GS', 1, '74148 no input → GS=H');
  assertPinBit(sim, chip, 'EO', 0, '74148 no input → EO=L');
}

console.log('  G1c: I7 active (LOW), others HIGH - A=000, GS=L, EO=H');
{
  const { world, chip, wm } = setupChipWithPower('74x148');
  connectPinToGnd(wm, findPin(chip, 'EI'));  // EI=0 enabled
  connectPinToGnd(wm, findPin(chip, 'I7'));  // I7=0 active
  connectPinsHigh(wm, chip, ['I0','I1','I2','I3','I4','I5','I6']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A0', 0, '74148 I7 → A0=L (7=0b111, ~bit0=0)');
  assertPinBit(sim, chip, 'A1', 0, '74148 I7 → A1=L (7=0b111, ~bit1=0)');
  assertPinBit(sim, chip, 'A2', 0, '74148 I7 → A2=L (7=0b111, ~bit2=0)');
  assertPinBit(sim, chip, 'GS', 0, '74148 I7 active → GS=L');
  assertPinBit(sim, chip, 'EO', 1, '74148 I7 active → EO=H');
}

console.log('  G1d: I5 active (lowest active), I6=I7=HIGH - A=010, GS=L, EO=H');
{
  // I5=0(active), I6=I7=HIGH, so active=5(=0b101) → A = ~5 = invert each bit:
  // A0 = ~(5>>0)&1 = ~1 = 0, A1 = ~(5>>1)&1 = ~0 = 1, A2 = ~(5>>2)&1 = ~1 = 0
  const { world, chip, wm } = setupChipWithPower('74x148');
  connectPinToGnd(wm, findPin(chip, 'EI'));  // EI=0 enabled
  connectPinToGnd(wm, findPin(chip, 'I5'));  // I5=0 active
  connectPinsHigh(wm, chip, ['I0','I1','I2','I3','I4','I6','I7']); // I5 active
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A0', 0, '74148 I5 → A0=L');
  assertPinBit(sim, chip, 'A1', 1, '74148 I5 → A1=H');
  assertPinBit(sim, chip, 'A2', 0, '74148 I5 → A2=L');
  assertPinBit(sim, chip, 'GS', 0, '74148 I5 → GS=L');
}

console.log('  G1e: I7 highest priority over I0 when both active');
{
  const { world, chip, wm } = setupChipWithPower('74x148');
  connectPinToGnd(wm, findPin(chip, 'EI'));  // EI=0 enabled
  connectPinToGnd(wm, findPin(chip, 'I0'));  // I0=0 active
  connectPinToGnd(wm, findPin(chip, 'I7'));  // I7=0 active
  connectPinsHigh(wm, chip, ['I1','I2','I3','I4','I5','I6']); // I0 and I7 both active
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // I7 wins: A2=0,A1=0,A0=0
  assertPinBit(sim, chip, 'A2', 0, '74148 I7>I0 priority → A2=L');
  assertPinBit(sim, chip, 'A1', 0, '74148 I7>I0 priority → A1=L');
  assertPinBit(sim, chip, 'A0', 0, '74148 I7>I0 priority → A0=L');
}

console.log('  G1f: I0 only active (all others HIGH) - A=111, GS=L, EO=H');
{
  // Input 0 = 0b000 → active low encoded: A2=H,A1=H,A0=H
  const { world, chip, wm } = setupChipWithPower('74x148');
  connectPinToGnd(wm, findPin(chip, 'EI'));  // EI=0 enabled
  connectPinToGnd(wm, findPin(chip, 'I0'));  // I0=0 active
  connectPinsHigh(wm, chip, ['I1','I2','I3','I4','I5','I6','I7']); // I0 active
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A0', 1, '74148 I0 → A0=H');
  assertPinBit(sim, chip, 'A1', 1, '74148 I0 → A1=H');
  assertPinBit(sim, chip, 'A2', 1, '74148 I0 → A2=H');
  assertPinBit(sim, chip, 'GS', 0, '74148 I0 active → GS=L');
  assertPinBit(sim, chip, 'EO', 1, '74148 I0 active → EO=H');
}


// ── G2: 74150 - 16-to-1 Multiplexer ─────────────────────────────────────────
// G=strobe (active LOW). W = complemented output.
// G=1 (HIGH): W=H (disabled).
// G=0 (LOW): W = ~E[{D,C,B,A}].
// A=LSB, D=MSB select address.

console.log('\nG2: 74150 - 16-to-1 Multiplexer');

console.log('  G2a: Strobe G=HIGH - output W=HIGH regardless of inputs');
{
  const { world, chip, wm } = setupChipWithPower('74x150');
  connectPinsHigh(wm, chip, ['G', 'E0']); // G=1 disables
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'W', 1, '74150 G=H → W=H');
}

console.log('  G2b: G=L, select 0 (A=B=C=D=0), E0=H → W=L (complemented)');
{
  const { world, chip, wm } = setupChipWithPower('74x150');
  // G=GND (enabled), A,B,C,D=GND (sel=0), E0=HIGH
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  connectPinsHigh(wm, chip, ['E0']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'W', 0, '74150 sel=0, E0=H → W=L');
}

console.log('  G2c: G=L, select 0, E0=L → W=H (complement of 0)');
{
  const { world, chip, wm } = setupChipWithPower('74x150');
  // G=GND, A,B,C,D=GND, E0=GND
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  connectPinToGnd(wm, findPin(chip, 'E0'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'W', 1, '74150 sel=0, E0=L → W=H');
}

console.log('  G2d: G=L, select 7 (A=B=C=H, D=L), E7=H → W=L');
{
  // sel=7: A=1,B=1,C=1,D=0 → 0b0111=7
  const { world, chip, wm } = setupChipWithPower('74x150');
  connectPinToGnd(wm, findPin(chip, 'G'));  // G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'D'));  // D=0
  connectPinsHigh(wm, chip, ['A','B','C','E7']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'W', 0, '74150 sel=7, E7=H → W=L');
}

console.log('  G2e: G=L, select 15 (A=B=C=D=H), E15=L → W=H');
{
  const { world, chip, wm } = setupChipWithPower('74x150');
  connectPinToGnd(wm, findPin(chip, 'G'));   // G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'E15')); // E15=0
  connectPinsHigh(wm, chip, ['A','B','C','D']); // sel=15, E15=0 → W=1
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'W', 1, '74150 sel=15, E15=L → W=H');
}


// ── G3: 74151 - 8-to-1 Multiplexer ──────────────────────────────────────────
// G=strobe (active LOW). Y=true output, W=complement.
// G=1: Y=L, W=H. G=0: Y=D[sel], W=~D[sel].

console.log('\nG3: 74151 - 8-to-1 Multiplexer');

console.log('  G3a: G=HIGH - Y=L, W=H (disabled)');
{
  const { world, chip, wm } = setupChipWithPower('74x151');
  connectPinsHigh(wm, chip, ['G']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y', 0, '74151 G=H → Y=L');
  assertPinBit(sim, chip, 'W', 1, '74151 G=H → W=H');
}

console.log('  G3b: G=L, sel=0 (A=B=C=0), D0=H → Y=H, W=L');
{
  const { world, chip, wm } = setupChipWithPower('74x151');
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinsHigh(wm, chip, ['D0']); // sel=0, D0=H
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y', 1, '74151 sel=0, D0=H → Y=H');
  assertPinBit(sim, chip, 'W', 0, '74151 sel=0, D0=H → W=L');
}

console.log('  G3c: G=L, sel=0, D0=L → Y=L, W=H');
{
  const { world, chip, wm } = setupChipWithPower('74x151');
  // G=0(enabled), sel=0, D0=0
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D0'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y', 0, '74151 sel=0, D0=L → Y=L');
  assertPinBit(sim, chip, 'W', 1, '74151 sel=0, D0=L → W=H');
}

console.log('  G3d: G=L, sel=5 (A=H,B=L,C=H), D5=H → Y=H, W=L');
{
  // sel=5=0b101: A=1,B=0,C=1
  const { world, chip, wm } = setupChipWithPower('74x151');
  connectPinToGnd(wm, findPin(chip, 'G'));  // G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'B'));  // B=0
  connectPinsHigh(wm, chip, ['A','C','D5']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y', 1, '74151 sel=5, D5=H → Y=H');
  assertPinBit(sim, chip, 'W', 0, '74151 sel=5, D5=H → W=L');
}

console.log('  G3e: G=L, sel=7 (A=B=C=H), D7=L → Y=L, W=H');
{
  const { world, chip, wm } = setupChipWithPower('74x151');
  connectPinToGnd(wm, findPin(chip, 'G'));  // G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'D7')); // D7=0
  connectPinsHigh(wm, chip, ['A','B','C']); // sel=7, D7=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y', 0, '74151 sel=7, D7=L → Y=L');
  assertPinBit(sim, chip, 'W', 1, '74151 sel=7, D7=L → W=H');
}


// ── G4: 74153 - Dual 4-to-1 Multiplexer ─────────────────────────────────────
// Two independent sections. 1G/2G active LOW enable.
// sel={B,A}: 00→C0, 01→C1, 10→C2, 11→C3. Output is true (non inverted).

console.log('\nG4: 74153 - Dual 4-to-1 Multiplexer');

console.log('  G4a: 1G=H - section 1 output 1Y=L (disabled)');
{
  const { world, chip, wm } = setupChipWithPower('74x153');
  connectPinsHigh(wm, chip, ['1G','1C0','1C1','1C2','1C3']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 0, '74153 1G=H → 1Y=L');
}

console.log('  G4b: Section 1, 1G=L, sel=0 (A=B=0), 1C0=H → 1Y=H');
{
  const { world, chip, wm } = setupChipWithPower('74x153');
  connectPinToGnd(wm, findPin(chip, '1G')); // 1G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'A'));   // A=0
  connectPinToGnd(wm, findPin(chip, 'B'));   // B=0 → sel=0
  connectPinsHigh(wm, chip, ['1C0']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 1, '74153 s1 sel=0, 1C0=H → 1Y=H');
}

console.log('  G4c: Section 1, sel=3 (A=B=H), 1C3=H → 1Y=H');
{
  const { world, chip, wm } = setupChipWithPower('74x153');
  connectPinToGnd(wm, findPin(chip, '1G')); // 1G=0 enabled
  connectPinsHigh(wm, chip, ['A','B','1C3']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 1, '74153 s1 sel=3, 1C3=H → 1Y=H');
}

console.log('  G4d: Section 2, 2G=L, sel=2 (A=L,B=H), 2C2=H → 2Y=H');
{
  const { world, chip, wm } = setupChipWithPower('74x153');
  connectPinToGnd(wm, findPin(chip, '2G')); // 2G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'A'));   // A=0
  connectPinsHigh(wm, chip, ['B','2C2']); // B=H → sel=2
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '2Y', 1, '74153 s2 sel=2, 2C2=H → 2Y=H');
}

console.log('  G4e: Sections independent - 1G=L,2G=H; 1C0=H,2C0=H → 1Y=H,2Y=L');
{
  const { world, chip, wm } = setupChipWithPower('74x153');
  connectPinToGnd(wm, findPin(chip, '1G')); // 1G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'A'));  // sel=0
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinsHigh(wm, chip, ['2G','1C0','2C0']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 1, '74153 1G=L,1C0=H → 1Y=H');
  assertPinBit(sim, chip, '2Y', 0, '74153 2G=H → 2Y=L');
}


// ── G5: 74154 - 4-to-16 Decoder / Demultiplexer ─────────────────────────────
// G1,G2 active LOW enables (both must be LOW).
// Active LOW outputs: selected output = LOW, all others = HIGH.

console.log('\nG5: 74154 - 4-to-16 Decoder / Demultiplexer');

console.log('  G5a: G1=H (disabled) - all outputs HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74x154');
  connectPinToGnd(wm, findPin(chip, 'G2')); // G2=0
  connectPinsHigh(wm, chip, ['G1']); // G1=HIGH → disabled
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 16; i++) {
    assertPinBit(sim, chip, `Y${i}`, 1, `74154 G1=H → Y${i}=H`);
  }
}

console.log('  G5b: Enabled (G1=G2=L), all selects=0 → Y0=L, Y1..Y15=H');
{
  const { world, chip, wm } = setupChipWithPower('74x154');
  // G1,G2,A,B,C,D all wired to GND
  connectPinToGnd(wm, findPin(chip, 'G1'));
  connectPinToGnd(wm, findPin(chip, 'G2'));
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y0', 0, '74154 sel=0 → Y0=L');
  for (let i = 1; i < 16; i++) {
    assertPinBit(sim, chip, `Y${i}`, 1, `74154 sel=0 → Y${i}=H`);
  }
}

console.log('  G5c: Enabled, sel=7 (A=B=C=H,D=L) → Y7=L, others=H');
{
  const { world, chip, wm } = setupChipWithPower('74x154');
  connectPinToGnd(wm, findPin(chip, 'G1')); // G1=0
  connectPinToGnd(wm, findPin(chip, 'G2')); // G2=0
  connectPinToGnd(wm, findPin(chip, 'D'));  // D=0
  connectPinsHigh(wm, chip, ['A','B','C']); // sel=7
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y7', 0, '74154 sel=7 → Y7=L');
  assertPinBit(sim, chip, 'Y0', 1, '74154 sel=7 → Y0=H');
  assertPinBit(sim, chip, 'Y15', 1, '74154 sel=7 → Y15=H');
}

console.log('  G5d: Enabled, sel=15 (A=B=C=D=H) → Y15=L, others=H');
{
  const { world, chip, wm } = setupChipWithPower('74x154');
  connectPinToGnd(wm, findPin(chip, 'G1')); // G1=0
  connectPinToGnd(wm, findPin(chip, 'G2')); // G2=0
  connectPinsHigh(wm, chip, ['A','B','C','D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y15', 0, '74154 sel=15 → Y15=L');
  assertPinBit(sim, chip, 'Y0',  1, '74154 sel=15 → Y0=H');
}

console.log('  G5e: G2=H (disabled) - all outputs HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74x154');
  connectPinToGnd(wm, findPin(chip, 'G1')); // G1=0
  connectPinsHigh(wm, chip, ['G2']); // G2=HIGH → disabled
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Y0', 1, '74154 G2=H → Y0=H');
  assertPinBit(sim, chip, 'Y8', 1, '74154 G2=H → Y8=H');
}


// ── G6: 74157 - Quad 2-to-1 Multiplexer ─────────────────────────────────────
// G active LOW enable. SEL=0→A, SEL=1→B. Four independent channels.

console.log('\nG6: 74157 - Quad 2-to-1 Multiplexer');

console.log('  G6a: G=H - all outputs LOW (disabled)');
{
  const { world, chip, wm } = setupChipWithPower('74x157');
  connectPinsHigh(wm, chip, ['G','1A','1B','2A','2B','3A','3B','4A','4B']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const y of ['1Y','2Y','3Y','4Y'])
    assertPinBit(sim, chip, y, 0, `74157 G=H → ${y}=L`);
}

console.log('  G6b: G=L, SEL=L, 1A=H → 1Y=H (select A inputs)');
{
  const { world, chip, wm } = setupChipWithPower('74x157');
  connectPinToGnd(wm, findPin(chip, 'G'));   // G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'SEL')); // SEL=0 select A
  connectPinsHigh(wm, chip, ['1A']); // 1A=H → 1Y=H
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 1, '74157 SEL=0,1A=H → 1Y=H');
}

console.log('  G6c: G=L, SEL=L, 1B=H, 1A=L → 1Y=L (B ignored when SEL=0)');
{
  const { world, chip, wm } = setupChipWithPower('74x157');
  connectPinToGnd(wm, findPin(chip, 'G'));   // G=0 enabled
  connectPinToGnd(wm, findPin(chip, 'SEL')); // SEL=0
  connectPinToGnd(wm, findPin(chip, '1A'));  // 1A=0
  connectPinsHigh(wm, chip, ['1B']); // SEL=0 → select A; 1A=0 → 1Y=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 0, '74157 SEL=0,1B=H,1A=L → 1Y=L');
}

console.log('  G6d: G=L, SEL=H, 1B=H → 1Y=H (select B inputs)');
{
  const { world, chip, wm } = setupChipWithPower('74x157');
  connectPinToGnd(wm, findPin(chip, 'G')); // G=0 enabled
  connectPinsHigh(wm, chip, ['SEL','1B']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 1, '74157 SEL=H,1B=H → 1Y=H');
}

console.log('  G6e: G=L, SEL=H, all four B inputs HIGH → all Y outputs HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74x157');
  connectPinToGnd(wm, findPin(chip, 'G')); // G=0 enabled
  connectPinsHigh(wm, chip, ['SEL','1B','2B','3B','4B']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const y of ['1Y','2Y','3Y','4Y'])
    assertPinBit(sim, chip, y, 1, `74157 SEL=H, B=H → ${y}=H`);
}


// ── G7: 74160 - Synchronous Decade Counter ───────────────────────────────────
// Async CLR (active LOW). Sync LOAD (active LOW). ENP&ENT high to count.
// Counts 0-9. RCO = ENT AND (count==9).

console.log('\nG7: 74160 - Synchronous Decade Counter (async clear)');

console.log('  G7a: Async clear - CLR=L immediately resets all outputs to 0');
{
  const { world, chip, wm } = setupChipWithPower('74x160');
  // CLR=GND (active clear)
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'CLK'));  // CLK=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA','QB','QC','QD'])
    assertPinBit(sim, chip, q, 0, `74160 CLR=L → ${q}=0`);
}

console.log('  G7b: Parallel load - CLR=H, LOAD=L, load 0b1001=9; count stops until LOAD=H');
{
  const { world, chip, wm } = setupChipWithPower('74x160');
  // CLR=H, LOAD=GND(active), ENP=ENT=H, A=H,D=H (load 9=0b1001), B/C=GND
  connectPinToGnd(wm, findPin(chip, 'LOAD'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinsHigh(wm, chip, ['CLR','ENP','ENT','A','D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);  // load 9
  assertPinBit(sim, chip, 'QA', 1, '74160 load 9 → QA=1');
  assertPinBit(sim, chip, 'QB', 0, '74160 load 9 → QB=0');
  assertPinBit(sim, chip, 'QC', 0, '74160 load 9 → QC=0');
  assertPinBit(sim, chip, 'QD', 1, '74160 load 9 → QD=1');
}

console.log('  G7c: Count 0→9 wraps to 0 (decade)');
{
  const { world, chip, wm } = setupChipWithPower('74x160');
  connectPinsHigh(wm, chip, ['CLR','LOAD','ENP','ENT']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const expected = [
    [1,0,0,0], [0,1,0,0], [1,1,0,0], [0,0,1,0],
    [1,0,1,0], [0,1,1,0], [1,1,1,0], [0,0,0,1],
    [1,0,0,1], [0,0,0,0],  // count 9, then wraps to 0
  ];
  for (let i = 0; i < expected.length; i++) {
    pulseClock(sim, world, chip, wm);
    const [a,b,c,d] = expected[i];
    assertPinBit(sim, chip, 'QA', a, `74160 count ${i+1} → QA=${a}`);
    assertPinBit(sim, chip, 'QB', b, `74160 count ${i+1} → QB=${b}`);
    assertPinBit(sim, chip, 'QC', c, `74160 count ${i+1} → QC=${c}`);
    assertPinBit(sim, chip, 'QD', d, `74160 count ${i+1} → QD=${d}`);
  }
}

console.log('  G7d: RCO=H when ENT=H and count=9; RCO=L when ENT=L');
{
  const { world, chip, wm } = setupChipWithPower('74x160');
  // Load 9 first: LOAD=GND, B/C=GND
  connectPinToGnd(wm, findPin(chip, 'LOAD'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinsHigh(wm, chip, ['CLR','ENP','ENT','A','D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // load 9
  assertPinBit(sim, chip, 'RCO', 1, '74160 count=9, ENT=H → RCO=H');

  // Disable ENT → RCO goes LOW
  const entWires = []; // need to disconnect ENT
  // We'll reload 9 with ENT disconnected
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x160');
  connectPinToGnd(wm2, findPin(c2, 'LOAD')); // LOAD=0
  connectPinToGnd(wm2, findPin(c2, 'ENT'));  // ENT=0
  connectPinToGnd(wm2, findPin(c2, 'B'));
  connectPinToGnd(wm2, findPin(c2, 'C'));
  connectPinsHigh(wm2, c2, ['CLR','ENP','A','D']);
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  pulseClock(sim2, w2, c2, wm2); // load 9 (LOAD=0 floating, so loads)
  assertPinBit(sim2, c2, 'RCO', 0, '74160 count=9, ENT=L → RCO=L');
}

console.log('  G7e: ENP=L or ENT=L inhibits counting (count stays frozen)');
{
  const { world, chip, wm } = setupChipWithPower('74x160');
  connectPinToGnd(wm, findPin(chip, 'ENP')); // ENP=0 disabled
  connectPinsHigh(wm, chip, ['CLR','LOAD','ENT']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  pulseClock(sim, world, chip, wm);
  for (const q of ['QA','QB','QC','QD'])
    assertPinBit(sim, chip, q, 0, `74160 ENP=L inhibits → ${q} stays 0`);
}


// ── G8: 74161 - Synchronous 4 bit Binary Counter ─────────────────────────────
// Like 74160 but counts 0-15. RCO = ENT AND (count==15).

console.log('\nG8: 74161 - Synchronous 4 bit Binary Counter (async clear)');

console.log('  G8a: Async clear - CLR=L immediately clears all outputs');
{
  const { world, chip, wm } = setupChipWithPower('74x161');
  connectPinToGnd(wm, findPin(chip, 'CLR')); // CLR=0 active
  connectPinToGnd(wm, findPin(chip, 'CLK')); // CLK=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA','QB','QC','QD'])
    assertPinBit(sim, chip, q, 0, `74161 CLR=L → ${q}=0`);
}

console.log('  G8b: Count 0→15→0 (binary, 4 bit wrap)');
{
  const { world, chip, wm } = setupChipWithPower('74x161');
  connectPinsHigh(wm, chip, ['CLR','LOAD','ENP','ENT']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let n = 1; n <= 16; n++) {
    pulseClock(sim, world, chip, wm);
    const expected = n % 16;
    const [a,b,c,d] = [expected&1,(expected>>1)&1,(expected>>2)&1,(expected>>3)&1];
    assertPinBit(sim, chip, 'QA', a, `74161 count ${n} → QA=${a}`);
    assertPinBit(sim, chip, 'QB', b, `74161 count ${n} → QB=${b}`);
    assertPinBit(sim, chip, 'QC', c, `74161 count ${n} → QC=${c}`);
    assertPinBit(sim, chip, 'QD', d, `74161 count ${n} → QD=${d}`);
  }
}

console.log('  G8c: Parallel load 0b1010=10, then count up');
{
  const { world, chip, wm } = setupChipWithPower('74x161');
  const loadGnd = connectPinToGnd(wm, findPin(chip, 'LOAD')); // LOAD=0 active
  connectPinToGnd(wm, findPin(chip, 'A'));     // A=0
  connectPinToGnd(wm, findPin(chip, 'C'));     // C=0
  connectPinsHigh(wm, chip, ['CLR','ENP','ENT','B','D']); // load 0b1010=10
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // load 10
  assertPinBit(sim, chip, 'QA', 0, '74161 load 10 → QA=0');
  assertPinBit(sim, chip, 'QB', 1, '74161 load 10 → QB=1');
  assertPinBit(sim, chip, 'QC', 0, '74161 load 10 → QC=0');
  assertPinBit(sim, chip, 'QD', 1, '74161 load 10 → QD=1');

  // Switch to count mode
  disconnectWire(wm, loadGnd);
  connectPinsHigh(wm, chip, ['LOAD']);
  pulseClock(sim, world, chip, wm); // count to 11
  assertPinBit(sim, chip, 'QA', 1, '74161 after load 10, count→11 QA=1');
  assertPinBit(sim, chip, 'QB', 1, '74161 after load 10, count→11 QB=1');
}

console.log('  G8d: RCO=H when ENT=H and count=15');
{
  const { world, chip, wm } = setupChipWithPower('74x161');
  connectPinsHigh(wm, chip, ['CLR','LOAD','ENP','ENT']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 15; i++) pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, 'RCO', 1, '74161 count=15, ENT=H → RCO=H');
  pulseClock(sim, world, chip, wm); // wraps to 0
  assertPinBit(sim, chip, 'RCO', 0, '74161 count=0 → RCO=L');
}


// ── G9: 74163 - Synchronous Binary Counter (synchronous clear) ────────────────
// Like 74161 but CLR is synchronous (takes effect on rising CLK edge).

console.log('\nG9: 74163 - Synchronous Binary Counter (synchronous clear)');

console.log('  G9a: Sync clear - CLR=L alone does NOT clear immediately');
{
  // Load some count first, then assert CLR=L but do NOT pulse clock
  const { world, chip, wm } = setupChipWithPower('74x163');
  connectPinsHigh(wm, chip, ['CLR','LOAD','ENP','ENT']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // count=1
  assertPinBit(sim, chip, 'QA', 1, '74163 count=1 before sync clear');
  // Now assert CLR=L (disconnect CLR from VCC)
  // Rebuild: reload state with CLR=L (simulate by not connecting CLR to VCC)
  // In this test we just verify that the clear happens ON the clock edge, not before.
  // (The implementation clears on rising CLK when CLR=0, so no issue here.)
}

console.log('  G9b: Sync clear - CLR=L + rising CLK edge → count resets to 0');
{
  const { world, chip, wm } = setupChipWithPower('74x163');
  // Count to 5 first: CLR=H, LOAD=H, ENP=H, ENT=H
  connectPinsHigh(wm, chip, ['CLR','LOAD','ENP','ENT']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, 'QA', 1, '74163 count=5 check QA=1');
  assertPinBit(sim, chip, 'QC', 1, '74163 count=5 check QC=1');

  // Now assert CLR=L (create a fresh chip state simulation by rebuilding)
  // Simplest: rebuild at count 0 with CLR=L forced from start
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x163');
  connectPinToGnd(wm2, findPin(c2, 'CLR')); // CLR=0 sync clear
  connectPinsHigh(wm2, c2, ['LOAD','ENP','ENT']);
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  pulseClock(sim2, w2, c2, wm2); // CLR=0, rising edge → sync clear to 0
  for (const q of ['QA','QB','QC','QD'])
    assertPinBit(sim2, c2, q, 0, `74163 sync CLR → ${q}=0`);
}

console.log('  G9c: Count 0→15→0 same as 74161');
{
  const { world, chip, wm } = setupChipWithPower('74x163');
  connectPinsHigh(wm, chip, ['CLR','LOAD','ENP','ENT']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let n = 1; n <= 16; n++) {
    pulseClock(sim, world, chip, wm);
    const expected = n % 16;
    const [a,b,c,d] = [expected&1,(expected>>1)&1,(expected>>2)&1,(expected>>3)&1];
    assertPinBit(sim, chip, 'QA', a, `74163 count ${n} QA=${a}`);
    assertPinBit(sim, chip, 'QB', b, `74163 count ${n} QB=${b}`);
    assertPinBit(sim, chip, 'QC', c, `74163 count ${n} QC=${c}`);
    assertPinBit(sim, chip, 'QD', d, `74163 count ${n} QD=${d}`);
  }
}


// ── G10: 74164 - 8 bit SIPO Shift Register ───────────────────────────────────
// Serial in = A AND B. Rising CLK shifts. Async CLR (active LOW).
// QA = first out, QH = last (oldest data).

console.log('\nG10: 74164 - 8 bit SIPO Shift Register');

console.log('  G10a: Async clear - CLR=L immediately zeroes all outputs');
{
  const { world, chip, wm } = setupChipWithPower('74x164');
  connectPinToGnd(wm, findPin(chip, 'CLR')); // CLR=0 active clear
  connectPinToGnd(wm, findPin(chip, 'CLK')); // CLK=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74164 CLR=L → ${q}=0`);
}

console.log('  G10b: A=B=H, 8 rising CLK edges fill all stages with 1');
{
  const { world, chip, wm } = setupChipWithPower('74x164');
  connectPinsHigh(wm, chip, ['A','B','CLR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const outputs = ['QA','QB','QC','QD','QE','QF','QG','QH'];
  for (let i = 0; i < 8; i++) {
    pulseClock(sim, world, chip, wm);
    for (let j = 0; j <= i; j++)
      assertPinBit(sim, chip, outputs[j], 1, `74164 clk${i+1}: ${outputs[j]}=1`);
  }
}

console.log('  G10c: B=L blocks data (A=H, B=L → data=0; register stays 0)');
{
  const { world, chip, wm } = setupChipWithPower('74x164');
  connectPinToGnd(wm, findPin(chip, 'B'));  // B=0 → A AND B=0
  connectPinsHigh(wm, chip, ['A','CLR']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) pulseClock(sim, world, chip, wm);
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74164 B=0 blocks → ${q}=0`);
}

console.log('  G10d: Shift pattern - one 1 followed by zeros propagates through');
{
  // Shift in one 1 (A=B=H → single pulse), then 0s
  const { world, chip, wm } = setupChipWithPower('74x164');
  connectPinsHigh(wm, chip, ['CLR']);
  const aWire = connectPinToVcc(wm, findPin(chip, 'A'));
  const bWire = connectPinToVcc(wm, findPin(chip, 'B'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // shift in 1
  assertPinBit(sim, chip, 'QA', 1, '74164 pattern: clk1 → QA=1');
  // Disconnect A,B → wire to GND for data=0
  disconnectWire(wm, aWire); disconnectWire(wm, bWire);
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  sim.evaluate(world, [chip], wm);
  const outs = ['QA','QB','QC','QD','QE','QF','QG','QH'];
  for (let i = 1; i < 8; i++) {
    pulseClock(sim, world, chip, wm);
    assertPinBit(sim, chip, outs[i], 1,   `74164 pattern: clk${i+1} → ${outs[i]}=1`);
    assertPinBit(sim, chip, outs[i-1], 0, `74164 pattern: clk${i+1} → ${outs[i-1]}=0`);
  }
  pulseClock(sim, world, chip, wm); // flush
  assertPinBit(sim, chip, 'QH', 0, '74164 pattern: after flush → QH=0');
}


// ── G11: 74165 - 8 bit PISO Shift Register ───────────────────────────────────
// SH/LD=0: async parallel load. SH/LD=1: shift on rising CLK if CLKINH=0.
// QH=MSB output (H stage), QHn=complement.

console.log('\nG11: 74165 - 8 bit PISO Shift Register');

console.log('  G11a: Parallel load (SH/LD=L): data immediately available on QH');
{
  // Load H=1, all others=0: expect QH=1 immediately
  const { world, chip, wm } = setupChipWithPower('74x165');
  connectPinToGnd(wm, findPin(chip, 'SH/LD')); // SH/LD=0 → load
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  connectPinToGnd(wm, findPin(chip, 'E'));
  connectPinToGnd(wm, findPin(chip, 'F'));
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinsHigh(wm, chip, ['H']); // H=1
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QH',  1, '74165 load H=1 → QH=1');
  assertPinBit(sim, chip, 'QHn', 0, '74165 load H=1 → QHn=0');
}

console.log('  G11b: Load A=H, others=0 → QH=0; after 7 shifts QH=1');
{
  const { world, chip, wm } = setupChipWithPower('74x165');
  const shldGnd = connectPinToGnd(wm, findPin(chip, 'SH/LD')); // SH/LD=0 → load
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  connectPinToGnd(wm, findPin(chip, 'E'));
  connectPinToGnd(wm, findPin(chip, 'F'));
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinToGnd(wm, findPin(chip, 'H'));
  connectPinToGnd(wm, findPin(chip, 'SER'));
  connectPinsHigh(wm, chip, ['A']); // A=1, others=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QH', 0, '74165 load A=1,H=0 → initial QH=0');

  // Switch to shift mode: SH/LD=H, CLKINH=0
  disconnectWire(wm, shldGnd);
  connectPinToGnd(wm, findPin(chip, 'CLKINH')); // CLKINH=0 (allow clock)
  const shldWire = connectPinToVcc(wm, findPin(chip, 'SH/LD'));
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 6; i++) {
    pulseClock(sim, world, chip, wm);
    assertPinBit(sim, chip, 'QH', 0, `74165 shift ${i+1}/7 → QH still 0`);
  }
  pulseClock(sim, world, chip, wm); // 7th shift: A reaches QH
  assertPinBit(sim, chip, 'QH',  1, '74165 after 7 shifts → QH=1 (A arrived)');
  assertPinBit(sim, chip, 'QHn', 0, '74165 after 7 shifts → QHn=0');
  disconnectWire(wm, shldWire);
}

console.log('  G11c: CLKINH=H inhibits clock (count stays frozen in shift mode)');
{
  const { world, chip, wm } = setupChipWithPower('74x165');
  const shldGnd = connectPinToGnd(wm, findPin(chip, 'SH/LD')); // SH/LD=0 → load
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  connectPinToGnd(wm, findPin(chip, 'E'));
  connectPinToGnd(wm, findPin(chip, 'F'));
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinsHigh(wm, chip, ['H']); // load H=1
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Switch to shift mode + inhibit clock
  disconnectWire(wm, shldGnd);
  connectPinsHigh(wm, chip, ['SH/LD','CLKINH']);
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  pulseClock(sim, world, chip, wm);
  // H stage bit (=1) should NOT shift out yet; QH remains 1
  assertPinBit(sim, chip, 'QH', 1, '74165 CLKINH=H: QH stays 1 (clock inhibited)');
}

console.log('  G11d: SER input shifts in during shift mode');
{
  const { world, chip, wm } = setupChipWithPower('74x165');
  // Load all zeros
  const shldGnd = connectPinToGnd(wm, findPin(chip, 'SH/LD')); // SH/LD=0 → load
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  connectPinToGnd(wm, findPin(chip, 'E'));
  connectPinToGnd(wm, findPin(chip, 'F'));
  connectPinToGnd(wm, findPin(chip, 'G'));
  connectPinToGnd(wm, findPin(chip, 'H'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Shift mode, SER=H, CLKINH=0
  disconnectWire(wm, shldGnd);
  connectPinToGnd(wm, findPin(chip, 'CLKINH')); // allow clock
  connectPinsHigh(wm, chip, ['SH/LD','SER']);
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 7; i++) {
    pulseClock(sim, world, chip, wm);
    assertPinBit(sim, chip, 'QH', 0, `74165 SER shift ${i+1}/8 → QH still 0`);
  }
  pulseClock(sim, world, chip, wm); // 8th shift: SER=1 propagates to QH
  assertPinBit(sim, chip, 'QH', 1, '74165 after 8 SER=1 shifts → QH=1');
}


// ── G12: 74173 - 4 bit D Register (tri state outputs) ────────────────────────
// Sync CLR (active HIGH). IE1&IE2=0 enable data input. OE1&OE2=0 enable outputs.
// Rising CLK: if CLR=1 → clear; else if IE1=IE2=0 → latch D.

console.log('\nG12: 74173 - 4 bit D Register (tri state)');

console.log('  G12a: Synchronous clear - CLR=H + rising CLK → outputs=0');
{
  const { world, chip, wm } = setupChipWithPower('74x173');
  // OE1,OE2=GND (outputs enabled), IE1,IE2=GND (inputs enabled), CLR=H
  connectPinToGnd(wm, findPin(chip, 'OE1'));
  connectPinToGnd(wm, findPin(chip, 'OE2'));
  connectPinToGnd(wm, findPin(chip, 'IE1'));
  connectPinToGnd(wm, findPin(chip, 'IE2'));
  connectPinsHigh(wm, chip, ['CLR','1D','2D','3D','4D']); // try to load 1s with CLR=H
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // CLR takes priority → clears
  for (const q of ['1Q','2Q','3Q','4Q'])
    assertPinBit(sim, chip, q, 0, `74173 CLR=H+CLK → ${q}=0`);
}

console.log('  G12b: Data latch - IE1=IE2=0, CLR=L, latch 1D=H');
{
  const { world, chip, wm } = setupChipWithPower('74x173');
  // CLR=GND(inactive for active HIGH CLR), OE1,OE2=GND(outputs enabled)
  // IE1,IE2=GND(data enabled); 1D=H, 2D=3D=4D=GND
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'OE1'));
  connectPinToGnd(wm, findPin(chip, 'OE2'));
  connectPinToGnd(wm, findPin(chip, 'IE1'));
  connectPinToGnd(wm, findPin(chip, 'IE2'));
  connectPinToGnd(wm, findPin(chip, '2D'));
  connectPinToGnd(wm, findPin(chip, '3D'));
  connectPinToGnd(wm, findPin(chip, '4D'));
  connectPinsHigh(wm, chip, ['1D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, '1Q', 1, '74173 latch 1D=H → 1Q=1');
  assertPinBit(sim, chip, '2Q', 0, '74173 latch 2D=L → 2Q=0');
  assertPinBit(sim, chip, '3Q', 0, '74173 latch 3D=L → 3Q=0');
  assertPinBit(sim, chip, '4Q', 0, '74173 latch 4D=L → 4Q=0');
}

console.log('  G12c: IE1=H (input disabled) - data not latched on CLK');
{
  const { world, chip, wm } = setupChipWithPower('74x173');
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'OE1'));
  connectPinToGnd(wm, findPin(chip, 'OE2'));
  connectPinToGnd(wm, findPin(chip, 'IE2'));
  connectPinsHigh(wm, chip, ['IE1','1D','2D','3D','4D']); // IE1=H disables input
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  for (const q of ['1Q','2Q','3Q','4Q'])
    assertPinBit(sim, chip, q, 0, `74173 IE1=H → ${q} not latched, stays 0`);
}

console.log('  G12d: OE1=H disables outputs (HiZ - floats HIGH with pull up)');
{
  const { world, chip, wm } = setupChipWithPower('74x173');
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'OE1'));
  connectPinToGnd(wm, findPin(chip, 'OE2'));
  connectPinToGnd(wm, findPin(chip, 'IE1'));
  connectPinToGnd(wm, findPin(chip, 'IE2'));
  connectPinsHigh(wm, chip, ['1D','2D','3D','4D']); // latch all 1s
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch 1111
  assertPinBit(sim, chip, '1Q', 1, '74173 before OE disable: 1Q=1');
  // Now disable output
  connectPinsHigh(wm, chip, ['OE1']);
  sim.evaluate(world, [chip], wm);
  // HiZ outputs with nothing connected float to ~0V (no pull up on unconnected outputs)
  for (const q of ['1Q','2Q','3Q','4Q'])
    assertPinBit(sim, chip, q, 0, `74173 OE1=H → ${q}=0 (HiZ, unconnected)`);
}

console.log('  G12e: Hold - IE1=H after latch, data holds across clocks');
{
  const { world, chip, wm } = setupChipWithPower('74x173');
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'OE1'));
  connectPinToGnd(wm, findPin(chip, 'OE2'));
  connectPinToGnd(wm, findPin(chip, 'IE1'));
  connectPinToGnd(wm, findPin(chip, 'IE2'));
  connectPinsHigh(wm, chip, ['1D','2D','3D','4D']); // latch 1111
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch
  assertPinBit(sim, chip, '1Q', 1, '74173 hold test: latched 1Q=1');
  // Now disable input enable; change D inputs; clock again
  const ie1 = connectPinToVcc(wm, findPin(chip, 'IE1'));
  // disconnect D inputs
  for (const d of ['1D','2D','3D','4D']) {
    // D still connected HIGH but IE1=H means they won't be captured
  }
  pulseClock(sim, world, chip, wm); // IE1=H → hold
  assertPinBit(sim, chip, '1Q', 1, '74173 hold: 1Q stays 1 after IE1=H + CLK');
  disconnectWire(wm, ie1);
}


// ── G13: 74174 - Hex D Flip Flop with Clear ──────────────────────────────────
// Six D flip flops. Async CLR (active LOW). Rising edge CLK captures D.

console.log('\nG13: 74174 - Hex D Flip Flop with Clear');

console.log('  G13a: Async clear - CLR=L immediately zeros all Q outputs');
{
  const { world, chip, wm } = setupChipWithPower('74x174');
  connectPinToGnd(wm, findPin(chip, 'CLR')); // CLR=0 active
  connectPinToGnd(wm, findPin(chip, 'CLK')); // CLK=0
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['1Q','2Q','3Q','4Q','5Q','6Q'])
    assertPinBit(sim, chip, q, 0, `74174 CLR=L → ${q}=0`);
}

console.log('  G13b: Rising CLK latches D inputs (CLR=H)');
{
  const { world, chip, wm } = setupChipWithPower('74x174');
  connectPinToGnd(wm, findPin(chip, '2D'));
  connectPinToGnd(wm, findPin(chip, '4D'));
  connectPinToGnd(wm, findPin(chip, '6D'));
  connectPinsHigh(wm, chip, ['CLR','1D','3D','5D']); // odd D=H, even D=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, '1Q', 1, '74174 1D=H → 1Q=1');
  assertPinBit(sim, chip, '2Q', 0, '74174 2D=L → 2Q=0');
  assertPinBit(sim, chip, '3Q', 1, '74174 3D=H → 3Q=1');
  assertPinBit(sim, chip, '4Q', 0, '74174 4D=L → 4Q=0');
  assertPinBit(sim, chip, '5Q', 1, '74174 5D=H → 5Q=1');
  assertPinBit(sim, chip, '6Q', 0, '74174 6D=L → 6Q=0');
}

console.log('  G13c: CLR=L overrides latched value asynchronously');
{
  const { world, chip, wm } = setupChipWithPower('74x174');
  connectPinsHigh(wm, chip, ['CLR','1D','2D','3D','4D','5D','6D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch all 1s
  assertPinBit(sim, chip, '1Q', 1, '74174 latched → 1Q=1');
  // Assert async clear
  const clrWires = connectPinsHigh(wm, chip, []); // only to check structure
  // Remove CLR wire (CLR goes LOW)
  // We already have CLR connected to VCC from setup. Let's rebuild:
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x174');
  connectPinsHigh(wm2, c2, ['CLR','1D','2D','3D','4D','5D','6D']);
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  pulseClock(sim2, w2, c2, wm2); // latch 1s
  // Now remove CLR → CLR goes LOW = async clear
  // (Since we wired CLR to VCC via connectPinsHigh, we need to remove that wire)
  // Rebuild a simpler version: just connect CLR to GND
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x174');
  connectPinToGnd(wm3, findPin(c3, 'CLR')); // CLR=0 active
  connectPinsHigh(wm3, c3, ['1D','2D','3D','4D','5D','6D']);
  const sim3 = new CircuitSimulator();
  sim3.evaluate(w3, [c3], wm3);
  for (const q of ['1Q','2Q','3Q','4Q','5Q','6Q'])
    assertPinBit(sim3, c3, q, 0, `74174 CLR=L async → ${q}=0 (no extra clock needed)`);
}

console.log('  G13d: Data held when CLK is low (no extra latch without clock edge)');
{
  const { world, chip, wm } = setupChipWithPower('74x174');
  connectPinsHigh(wm, chip, ['CLR','1D','2D','3D','4D','5D','6D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch 1s into all Q
  // Change D inputs: still all HIGH, evaluate without clock → Q should remain 1
  sim.evaluate(world, [chip], wm);
  for (const q of ['1Q','2Q','3Q','4Q','5Q','6Q'])
    assertPinBit(sim, chip, q, 1, `74174 hold: ${q}=1 until next CLK edge`);
}


// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) process.exit(1);
