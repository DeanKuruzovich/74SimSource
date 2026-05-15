// test-chips32.mjs - Tests for chips defined in js/chips/chips32.js
// Chips under test:
//   74589   8 bit shift register with input latch, tri-state output
//   74590   8 bit binary counter with output registers (tri-state)
//   74591   8 bit binary counter with output registers (OC)
//   74592   8 bit binary counter with input registers
//   74593   8 bit binary counter with input registers (tri-state)
//   74594   8 bit SIPO shift register with output latch (buffered)
//   74596   8 bit SIPO shift register with output latch (OC) [reuses SHIFT_REG_LATCH]
//   74597   8 bit PISO shift register with input latches
//   74598   8 bit shift register with selectable PI/PO (tri-state)
//   74599   8 bit SIPO shift register with output latch, OC [reuses SHIFT_REG_8BIT_LATCH_BUF]
//   74600   DRAM refresh controller stub
//   74601   DRAM refresh controller stub
//   74602   DRAM refresh controller stub
//   74603   DRAM refresh controller stub
//   74608   Memory cycle controller stub
//   74614   Octal bus transceiver and register, inverting (OC)

import { CHIPS_BLOCK_32 } from '../chips/chips32.js';
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
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  const ok = expectedBit ? (v !== undefined && v > 2.5) : (v === undefined || v < 2.5);
  assert(ok, `${label}: expected ${expectedBit ? 'HIGH' : 'LOW'}, got ${v}`);
}

function readPinBit(sim, chip, pinName) {
  const v = getPinVoltage(sim, findPin(chip, pinName));
  return (v !== undefined && v > 2.5) ? 1 : 0;
}

function connectPinsHigh(wm, chip, pinNames) {
  return pinNames.map(n => connectPinToVcc(wm, findPin(chip, n)));
}

/** Place chip at col 10, tile (0,0) and wire VCC + GND. */
function setupChipWithPower(chipId) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(chipId);
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  const def = CHIPS_BLOCK_32[chipId];
  // Wire VCC
  const vccPin = findPin(chip, 'VCC');
  connectPinToVcc(wm, vccPin);
  // Wire GND (some chips have GND2)
  const gndPin = findPin(chip, 'GND');
  connectPinToGnd(wm, gndPin);
  return { world, chip, wm };
}

/** Pulse a pin HIGH then LOW (rising-edge trigger). */
function pulseClock(sim, world, chip, wm, pinName = 'CLK') {
  const w = connectPinToVcc(wm, findPin(chip, pinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, w);
  const gw = connectPinToGnd(wm, findPin(chip, pinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, gw);
}

/** Pulse a pin LOW then HIGH (falling-edge trigger, e.g. CCLKn). */
function pulseClockLow(sim, world, chip, wm, pinName) {
  // Pin goes LOW (active edge), then HIGH
  const w = connectPinToGnd(wm, findPin(chip, pinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, w);
  const hw = connectPinToVcc(wm, findPin(chip, pinName));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, hw);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure & Definition Tests
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_CHIP_IDS = [
  '74589', '74590', '74591', '74592', '74593',
  '74594', '74596', '74597', '74598', '74599',
  '74600', '74601', '74602', '74603',
  '74608', '74614',
];

console.log('\nS1: All 16 chip IDs present in CHIPS_BLOCK_32');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_32, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_32).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_32 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_32).length})`);
}

console.log('\nS2: Required fields on every chip definition');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_32)) {
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
    const vccPinDef = def.pinout.find(p => p.name === 'VCC');
    const gndPinDef = def.pinout.find(p => p.name === 'GND');
    assert(vccPinDef?.pin === def.vcc, `${id}: VCC pin number matches pinout`);
    assert(gndPinDef?.pin === def.gnd, `${id}: GND pin number matches pinout`);
  }
}

console.log('\nS3: All gate input/output names exist in pinout');
{
  for (const [id, def] of Object.entries(CHIPS_BLOCK_32)) {
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
  for (const id of EXPECTED_CHIP_IDS) {
    assert(CHIPS_BLOCK_32[id]?.sequential === true, `${id}: sequential flag set`);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────


// ── G1: 74589 - 8 bit Shift Register with Input Latch, Tri-State ─────────────
// D0-D7 transparently captured while RCK=1 (high).
// CKEN=0: shift clock enabled. Rising SRCK shifts SER into bit0, shifts toward bit7.
// OE=0: QH=SR[7] driven; OE=1: QH HiZ.

console.log('\nG1: 74589 - 8 bit Shift Register with Input Latch, Tri-State');

console.log('  G1a: OE=H → QH is HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74589');
  connectPinsHigh(wm, chip, ['OE']); // OE=H → disabled
  connectPinToGnd(wm, findPin(chip, 'CKEN')); // CKEN=0 (enabled)
  connectPinToGnd(wm, findPin(chip, 'SER'));
  connectPinToGnd(wm, findPin(chip, 'SRCK'));
  connectPinToGnd(wm, findPin(chip, 'RCK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QH', 0, '74589 OE=H → QH HiZ (reads as 0)');
}

console.log('  G1b: OE=L, CKEN=0, shift SER=H 8x → QH=1');
{
  // SRCK starts grounded so initial eval doesn't fire spurious edge
  const { world, chip, wm } = setupChipWithPower('74589');
  connectPinToGnd(wm, findPin(chip, 'OE'));   // OE=L → output enabled
  connectPinToGnd(wm, findPin(chip, 'CKEN')); // CKEN=L → shift enabled
  connectPinsHigh(wm, chip, ['SER']);         // SER=H
  connectPinToGnd(wm, findPin(chip, 'RCK'));
  let srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK')); // start LOW
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm); // SRCK=L, no shift yet
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srckGnd);
    pulseClock(sim, world, chip, wm, 'SRCK');
    srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QH', 1, '74589 8 shifts SER=H → QH=1 (SR[7]=1)');
}

console.log('  G1c: CKEN=H inhibits shift clock');
{
  const { world, chip, wm } = setupChipWithPower('74589');
  connectPinToGnd(wm, findPin(chip, 'OE'));
  connectPinsHigh(wm, chip, ['CKEN', 'SER']); // CKEN=H → clock inhibited
  connectPinToGnd(wm, findPin(chip, 'RCK'));
  let srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srckGnd);
    pulseClock(sim, world, chip, wm, 'SRCK');
    srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK'));
    sim.evaluate(world, [chip], wm);
  }
  // No shift occurred: QH should still be 0
  assertPinBit(sim, chip, 'QH', 0, '74589 CKEN=H → shift inhibited → QH=0');
}

console.log('  G1d: Shift one 1 bit: after 8 shifts it reaches QH');
{
  const { world, chip, wm } = setupChipWithPower('74589');
  connectPinToGnd(wm, findPin(chip, 'OE'));
  connectPinToGnd(wm, findPin(chip, 'CKEN'));
  connectPinToGnd(wm, findPin(chip, 'RCK'));
  let srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK'));
  // SER=0 initially
  let serGnd = connectPinToGnd(wm, findPin(chip, 'SER'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm); // SRCK=L, no shift

  // Shift: SER=H for 1 pulse, then SER=L for 7 more
  disconnectWire(wm, serGnd);
  let serVcc = connectPinToVcc(wm, findPin(chip, 'SER')); // SER=H
  disconnectWire(wm, srckGnd);
  pulseClock(sim, world, chip, wm, 'SRCK'); // SR=[1,0,0,0,0,0,0,0]
  srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QH', 0, '74589 1 bit shift step 1: QH=0');

  // Switch SER=L and shift 7 more times
  disconnectWire(wm, serVcc);
  serGnd = connectPinToGnd(wm, findPin(chip, 'SER'));
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 7; i++) {
    disconnectWire(wm, srckGnd);
    pulseClock(sim, world, chip, wm, 'SRCK');
    srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QH', 1, '74589 1 bit shift step 8: QH=1');
}


// ── G2: 74590 - 8 bit Binary Counter with Output Registers (Tri-State) ────────
// CCLKn: count on falling edge. CCLR=0: async clear counter.
// RCLK rising: latch counter→output reg. RCLR=0: async clear output reg.
// OEn=0: drive Q0-Q7. RC=1 when counter==255.

console.log('\nG2: 74590 - 8 bit Binary Counter with Output Registers (TRI)');

console.log('  G2a: CCLR=0 async clear counter → Q0-Q7 show 0 after RCLK');
{
  const { world, chip, wm } = setupChipWithPower('74590');
  // CCLR=0 → async clear counter; RCLR=1 → reg not cleared
  const [cclrGnd] = [connectPinToGnd(wm, findPin(chip, 'CCLR'))];
  connectPinsHigh(wm, chip, ['RCLR']); // RCLR=H (don't clear output reg)
  // CCLKn floats HIGH via TTL pullup → prevCCLKn=1, no spurious falling edge
  connectPinToGnd(wm, findPin(chip, 'OEn'));     // OEn=L (outputs enabled)
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK starts LOW
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Latch counter (=0) into output register via RCLK rising
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinBit(sim, chip, q, 0, `74590 CCLR=0 → ${q}=0`);
  assertPinBit(sim, chip, 'RC', 0, '74590 count=0 → RC=0');
}

console.log('  G2b: Count up on falling CCLKn; latch to output reg via RCLK');
{
  const { world, chip, wm } = setupChipWithPower('74590');
  connectPinsHigh(wm, chip, ['CCLR', 'RCLR']); // enabled; CCLKn floats HIGH
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK starts LOW
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Pulse CCLKn low 3 times (3 counts)
  for (let i = 0; i < 3; i++) pulseClockLow(sim, world, chip, wm, 'CCLKn');
  // Latch count=3 into output reg via rising RCLK
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  assertPinBit(sim, chip, 'Q0', 1, '74590 count=3 → Q0=1');
  assertPinBit(sim, chip, 'Q1', 1, '74590 count=3 → Q1=1');
  assertPinBit(sim, chip, 'Q2', 0, '74590 count=3 → Q2=0');
  assertPinBit(sim, chip, 'RC', 0, '74590 count=3 → RC=0');
}

console.log('  G2c: OEn=H → Q0-Q7 are HiZ; RC still driven');
{
  const { world, chip, wm } = setupChipWithPower('74590');
  connectPinsHigh(wm, chip, ['CCLR', 'RCLR', 'CCLKn', 'OEn']); // OEn=H → HiZ
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinBit(sim, chip, q, 0, `74590 OEn=H → ${q}=HiZ (reads 0)`);
  // RC is always driven (not tri-stated)
  assertPinBit(sim, chip, 'RC', 0, '74590 count=0 → RC=0 always driven');
}

console.log('  G2d: RCLR=0 async clear output register → Q0-Q7=0');
{
  const { world, chip, wm } = setupChipWithPower('74590');
  connectPinsHigh(wm, chip, ['CCLR', 'CCLKn']);
  connectPinToGnd(wm, findPin(chip, 'RCLR')); // RCLR=0 → clear output reg
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinBit(sim, chip, q, 0, `74590 RCLR=0 → ${q}=0`);
}


// ── G3: 74591 - 8 bit Binary Counter with Output Registers (OC) ──────────────
// Identical logic to 74590 (OC modeled same as TRI in simulator)

console.log('\nG3: 74591 - 8 bit Binary Counter with Output Registers (OC)');

console.log('  G3a: CCLR=0 async clear; count=0 latched and driven');
{
  const { world, chip, wm } = setupChipWithPower('74591');
  connectPinToGnd(wm, findPin(chip, 'CCLR'));
  connectPinsHigh(wm, chip, ['RCLR', 'CCLKn']);
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'])
    assertPinBit(sim, chip, q, 0, `74591 count=0 → ${q}=0`);
}

console.log('  G3b: Count 5 then latch');
{
  const { world, chip, wm } = setupChipWithPower('74591');
  connectPinsHigh(wm, chip, ['CCLR', 'RCLR']); // CCLKn floats HIGH via TTL pullup
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK starts LOW
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) pulseClockLow(sim, world, chip, wm, 'CCLKn');
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  assertPinBit(sim, chip, 'Q0', 1, '74591 count=5 → Q0=1');
  assertPinBit(sim, chip, 'Q1', 0, '74591 count=5 → Q1=0');
  assertPinBit(sim, chip, 'Q2', 1, '74591 count=5 → Q2=1');
}


// ── G4: 74592 - 8 bit Binary Counter with Input Registers ─────────────────────
// RCK rising: latch D0-D7 into input register.
// CCK rising + CKEN=0: load from input reg. CCK rising + CKEN=1: count up.
// CCLR=0: async clear. RC=1 at count=255.

console.log('\nG4: 74592 - 8 bit Binary Counter with Input Registers');

console.log('  G4a: CCLR=0 async clear → RC=0');
{
  const { world, chip, wm } = setupChipWithPower('74592');
  connectPinToGnd(wm, findPin(chip, 'CCLR')); // async clear
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'RC', 0, '74592 CCLR=0 → count=0 → RC=0');
}

console.log('  G4b: CKEN=0 on CCK rising → parallel load');
{
  const { world, chip, wm } = setupChipWithPower('74592');
  // Load value 5 via D pins
  connectPinsHigh(wm, chip, ['CCLR']); // CCLR=1 (not cleared)
  // D0=1, D2=1 → value = 5 (binary 00000101)
  connectPinsHigh(wm, chip, ['D0', 'D2']);
  for (const d of ['D1','D3','D4','D5','D6','D7'])
    connectPinToGnd(wm, findPin(chip, d));
  // CKEN=1 for count mode; RCK and CCK start LOW
  connectPinsHigh(wm, chip, ['CKEN']);
  let rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK'));
  let cckGnd = connectPinToGnd(wm, findPin(chip, 'CCK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Latch D inputs on rising RCK
  disconnectWire(wm, rckGnd);
  pulseClock(sim, world, chip, wm, 'RCK');
  rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK'));
  sim.evaluate(world, [chip], wm);
  // Now set CKEN=0: next CCK will load from input register
  const ckenWire = wm.wires.find(w => w.endHoleId === findPin(chip, 'CKEN').holeId);
  disconnectWire(wm, ckenWire);
  connectPinToGnd(wm, findPin(chip, 'CKEN'));
  sim.evaluate(world, [chip], wm);
  // Pulse CCK: CKEN=0 → load count=5
  disconnectWire(wm, cckGnd);
  pulseClock(sim, world, chip, wm, 'CCK');
  // count should now be 5; not 255 so RC=0
  assertPinBit(sim, chip, 'RC', 0, '74592 count=5 → RC=0');
}

console.log('  G4c: Count up from 0 using CKEN=1 repeatedly');
{
  const { world, chip, wm } = setupChipWithPower('74592');
  connectPinsHigh(wm, chip, ['CCLR', 'CKEN']); // CKEN=1 → count mode
  for (const d of ['D0','D1','D2','D3','D4','D5','D6','D7'])
    connectPinToGnd(wm, findPin(chip, d));
  let cckGnd = connectPinToGnd(wm, findPin(chip, 'CCK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Count to 255 (all 1s): 255 CCK pulses
  for (let i = 0; i < 255; i++) {
    disconnectWire(wm, cckGnd);
    pulseClock(sim, world, chip, wm, 'CCK');
    cckGnd = connectPinToGnd(wm, findPin(chip, 'CCK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'RC', 1, '74592 count=255 → RC=1');
  // One more count → wraps to 0
  disconnectWire(wm, cckGnd);
  pulseClock(sim, world, chip, wm, 'CCK');
  assertPinBit(sim, chip, 'RC', 0, '74592 count=256(→0) → RC=0');
}


// ── G5: 74593 - 8 bit Binary Counter with Input Registers, Tri-State ──────────
// Like 74592 but OEn=0 drives D0-D7 with counter value (bidirectional).

console.log('\nG5: 74593 - 8 bit Binary Counter with Input Registers (TRI)');

console.log('  G5a: CCLR=0 async clear → RC=0, D-bus all 0 when OEn=0');
{
  const { world, chip, wm } = setupChipWithPower('74593');
  connectPinToGnd(wm, findPin(chip, 'CCLR'));
  connectPinToGnd(wm, findPin(chip, 'OEn')); // OEn=0: drive D0-D7
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'RC', 0, '74593 CCLR=0 → RC=0');
  for (const d of ['D0','D1','D2','D3','D4','D5','D6','D7'])
    assertPinBit(sim, chip, d, 0, `74593 count=0 OEn=0 → ${d}=0`);
}

console.log('  G5b: OEn=H → D-bus HiZ');
{
  const { world, chip, wm } = setupChipWithPower('74593');
  connectPinToGnd(wm, findPin(chip, 'CCLR'));
  connectPinsHigh(wm, chip, ['OEn']); // OEn=1: HiZ
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const d of ['D0','D1','D2','D3','D4','D5','D6','D7'])
    assertPinBit(sim, chip, d, 0, `74593 OEn=H → ${d}=HiZ(0)`);
  assertPinBit(sim, chip, 'RC', 0, '74593 CCLR=0 → RC=0 (always driven)');
}

console.log('  G5c: CKEN=1 count up; OEn=0 shows counter on D-bus');
{
  const { world, chip, wm } = setupChipWithPower('74593');
  connectPinsHigh(wm, chip, ['CCLR', 'CKEN']); // Count mode
  connectPinsHigh(wm, chip, ['OEn']); // Outputs HiZ while counting
  let cckGnd = connectPinToGnd(wm, findPin(chip, 'CCK'));
  let rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Count 3 times
  for (let i = 0; i < 3; i++) {
    disconnectWire(wm, cckGnd);
    pulseClock(sim, world, chip, wm, 'CCK');
    cckGnd = connectPinToGnd(wm, findPin(chip, 'CCK'));
    sim.evaluate(world, [chip], wm);
  }
  // Enable output: disconnect OEn=H, wire OEn=L
  const oenWire = wm.wires.find(w => w.endHoleId === findPin(chip, 'OEn').holeId);
  disconnectWire(wm, oenWire);
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'D0', 1, '74593 count=3 OEn=0 → D0=1');
  assertPinBit(sim, chip, 'D1', 1, '74593 count=3 OEn=0 → D1=1');
  assertPinBit(sim, chip, 'D2', 0, '74593 count=3 OEn=0 → D2=0');
}


// ── G6: 74594 - 8 bit SIPO Shift Register with Output Latch (Buffered) ─────────
// SRCLR=0: async clear SR. No OE pin - outputs always driven from output register.
// RCLR=0: async clear output register.
// SRCLK rising: shift SER into SR. RCLK rising: copy SR to OR → QA..QH.
// QHs = SR[7] always.

console.log('\nG6: 74594 - 8 bit SIPO Shift Register with Output Latch (Buffered)');

console.log('  G6a: SRCLR=0 clears SR; QHs=0; QA-QH unchanged (OR may differ)');
{
  const { world, chip, wm } = setupChipWithPower('74594');
  connectPinToGnd(wm, findPin(chip, 'SRCLR'));
  connectPinsHigh(wm, chip, ['RCLR']); // RCLR=H (output reg not cleared)
  connectPinToGnd(wm, findPin(chip, 'SER'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QHs', 0, '74594 SRCLR=0 → QHs=0 (SR cleared)');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74594 SRCLR=0 → ${q}=0 (OR=0)`);
}

console.log('  G6b: Shift 8 SER=H into SR; RCLK copies to OR → all Q=1');
{
  const { world, chip, wm } = setupChipWithPower('74594');
  connectPinsHigh(wm, chip, ['SRCLR', 'RCLR', 'SER']); // SER=H
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QHs', 1, '74594 8 shifts SER=H → QHs=1');
  // No RCLK yet → OR still 0
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74594 no RCLK yet → ${q}=0`);
  // Pulse RCLK
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 1, `74594 after RCLK → ${q}=1`);
}

console.log('  G6c: RCLR=0 clears output register → QA-QH=0');
{
  const { world, chip, wm } = setupChipWithPower('74594');
  connectPinsHigh(wm, chip, ['SRCLR', 'SER']);
  connectPinToGnd(wm, findPin(chip, 'RCLR')); // RCLR=0 → clear OR
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Shift 8 ones
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  // RCLK with RCLR=0 → OR stays cleared
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74594 RCLR=0 → ${q}=0`);
  assertPinBit(sim, chip, 'QHs', 1, '74594 RCLR=0 does not clear SR → QHs=1');
}


// ── G7: 74596 - 8 bit SIPO Shift Register with Output Latch (OC) ─────────────
// Reuses SHIFT_REG_LATCH evaluator (same as 74595). OEn=0: drive outputs.

console.log('\nG7: 74596 - 8 bit SIPO Shift Register (OC, reuses SHIFT_REG_LATCH)');

console.log('  G7a: Shift 8 SER=H, RCLK → all QA-QH=1 when OEn=0');
{
  const { world, chip, wm } = setupChipWithPower('74596');
  connectPinsHigh(wm, chip, ['SRCLR', 'SER']); // SRCLR=H (no clear), SER=H
  connectPinToGnd(wm, findPin(chip, 'OEn')); // OEn=L (enabled)
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 1, `74596 after 8 shifts+RCLK → ${q}=1`);
  assertPinBit(sim, chip, 'QHs', 1, '74596 QHs=SR[7]=1');
}

console.log('  G7b: OEn=H → outputs HiZ; QHs always active');
{
  const { world, chip, wm } = setupChipWithPower('74596');
  connectPinsHigh(wm, chip, ['SRCLR', 'SER', 'OEn']); // OEn=H → HiZ
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74596 OEn=H → ${q}=HiZ(0)`);
  assertPinBit(sim, chip, 'QHs', 1, '74596 OEn=H: QHs=1 still active');
}


// ── G8: 74597 - 8 bit PISO Shift Register with Input Latches ─────────────────
// D0-D7 captured on rising RCK into input latch.
// SHLD=0: async parallel load from latch into SR.
// SHLD=1 + rising SRCK: shift right (SER→bit0→bit7=QH).

console.log('\nG8: 74597 - 8 bit PISO Shift Register with Input Latches');

console.log('  G8a: Parallel load via RCK then SHLD=0 → QH=D7 (MSB) immediately');
{
  const { world, chip, wm } = setupChipWithPower('74597');
  // Load D=0xFF (all 1s) via RCK, then async parallel-load
  connectPinsHigh(wm, chip, ['D0','D1','D2','D3','D4','D5','D6','D7']);
  connectPinToGnd(wm, findPin(chip, 'SER'));
  connectPinsHigh(wm, chip, ['SHLD']); // SHLD=1 initially (shift mode)
  let rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK')); // RCK low initially
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Capture D0-D7 into latch on rising RCK
  disconnectWire(wm, rckGnd);
  pulseClock(sim, world, chip, wm, 'RCK');
  rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK'));
  sim.evaluate(world, [chip], wm);
  // SHLD=0: async load from latch → SR=0xFF; QH=SR[7]=1
  const shldWire = wm.wires.find(w => w.endHoleId === findPin(chip, 'SHLD').holeId);
  disconnectWire(wm, shldWire);
  connectPinToGnd(wm, findPin(chip, 'SHLD'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QH', 1, '74597 parallel load D=0xFF → QH=D7=1');
}

console.log('  G8b: Shift out: load D=0x01 (D0=1,rest=0), then shift 8× → QH traces LSB movement');
{
  const { world, chip, wm } = setupChipWithPower('74597');
  connectPinsHigh(wm, chip, ['D0']); // D0=1, rest 0
  for (const d of ['D1','D2','D3','D4','D5','D6','D7'])
    connectPinToGnd(wm, findPin(chip, d));
  connectPinToGnd(wm, findPin(chip, 'SER'));
  connectPinsHigh(wm, chip, ['SHLD']); // SHLD=1
  let rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK')); // RCK low
  let srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK')); // SRCK low
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Latch D on rising RCK
  disconnectWire(wm, rckGnd);
  pulseClock(sim, world, chip, wm, 'RCK');
  rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK'));
  sim.evaluate(world, [chip], wm);
  // Parallel load: SHLD=0
  const shldWire = wm.wires.find(w => w.endHoleId === findPin(chip, 'SHLD').holeId);
  disconnectWire(wm, shldWire);
  connectPinToGnd(wm, findPin(chip, 'SHLD'));
  sim.evaluate(world, [chip], wm);
  // SR = [1,0,0,0,0,0,0,0]; QH=SR[7]=0
  assertPinBit(sim, chip, 'QH', 0, '74597 loaded D=0x01 → QH=SR[7]=0 initially');
  // Switch to shift: SHLD=1
  const shldGndW = wm.wires.find(w => w.endHoleId === findPin(chip, 'SHLD').holeId);
  disconnectWire(wm, shldGndW);
  connectPinsHigh(wm, chip, ['SHLD']);
  sim.evaluate(world, [chip], wm);
  // 7 shifts: LSB moves toward MSB
  for (let i = 0; i < 7; i++) {
    disconnectWire(wm, srckGnd);
    pulseClock(sim, world, chip, wm, 'SRCK');
    srckGnd = connectPinToGnd(wm, findPin(chip, 'SRCK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QH', 1, '74597 after 7 shifts → QH=1 (LSB reached MSB)');
}


// ── G9: 74598 - 8 bit Shift Register with Selectable PI/PO (Tri-State) ────────
// S1/S0 mode on CLK rising: 00=hold, 01=shift right, 10=parallel load, 11=parallel out.
// D0-D7 latched on RCK rising. OEn=0: drive D-bus.

console.log('\nG9: 74598 - 8 bit Shift Register with Selectable PI/PO (TRI)');

console.log('  G9a: S1=0,S0=1 (shift right); OEn=0 → QH reflects SR[7]');
{
  const { world, chip, wm } = setupChipWithPower('74598');
  connectPinsHigh(wm, chip, ['SER', 'S0']); // SER=1; mode=01=shift right
  connectPinToGnd(wm, findPin(chip, 'S1'));
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'RCK'));
  for (const d of ['D0','D1','D2','D3','D4','D5','D6','D7'])
    connectPinToGnd(wm, findPin(chip, d));
  let clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // 8 shifts with SER=1
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, clkGnd);
    pulseClock(sim, world, chip, wm, 'CLK');
    clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QH', 1, '74598 8 shifts SER=H → QH=1 (SR[7]=1)');
}

console.log('  G9b: S1=1,S0=0 (parallel load from latch); then OEn=0 drives D-bus');
{
  const { world, chip, wm } = setupChipWithPower('74598');
  // D5, D7 high → latch value = 0b10100000
  connectPinsHigh(wm, chip, ['D5', 'D7']);
  for (const d of ['D0','D1','D2','D3','D4','D6'])
    connectPinToGnd(wm, findPin(chip, d));
  connectPinToGnd(wm, findPin(chip, 'SER'));
  connectPinsHigh(wm, chip, ['S1']); // S1=1, S0=0 → mode 10 = load
  connectPinToGnd(wm, findPin(chip, 'S0'));
  connectPinsHigh(wm, chip, ['OEn']); // Initially HiZ while loading
  let rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK'));
  let clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Latch D pins on rising RCK
  disconnectWire(wm, rckGnd);
  pulseClock(sim, world, chip, wm, 'RCK');
  rckGnd = connectPinToGnd(wm, findPin(chip, 'RCK'));
  sim.evaluate(world, [chip], wm);
  // CLK rising in mode 10 = parallel load from latch
  disconnectWire(wm, clkGnd);
  pulseClock(sim, world, chip, wm, 'CLK');
  clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  sim.evaluate(world, [chip], wm);
  // Now enable output
  const oenWire = wm.wires.find(w => w.endHoleId === findPin(chip, 'OEn').holeId);
  disconnectWire(wm, oenWire);
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  sim.evaluate(world, [chip], wm);
  // SR loaded from latch; D-bus should reflect SR
  assertPinBit(sim, chip, 'D5', 1, '74598 parallel load D5=1 → D5=1 on bus');
  assertPinBit(sim, chip, 'D7', 1, '74598 parallel load D7=1 → D7=1 on bus (QH)');
  assertPinBit(sim, chip, 'D0', 0, '74598 parallel load D0=0 → D0=0 on bus');
}

console.log('  G9c: S1=0,S0=0 (hold) → SR unchanged after CLK');
{
  const { world, chip, wm } = setupChipWithPower('74598');
  connectPinsHigh(wm, chip, ['SER']); // SER=H
  connectPinToGnd(wm, findPin(chip, 'S0'));
  connectPinToGnd(wm, findPin(chip, 'S1')); // mode 00 = hold
  connectPinToGnd(wm, findPin(chip, 'OEn'));
  connectPinToGnd(wm, findPin(chip, 'RCK'));
  for (const d of ['D0','D1','D2','D3','D4','D5','D6','D7'])
    connectPinToGnd(wm, findPin(chip, d));
  let clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Many CLK pulses in hold mode → SR stays all 0s
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, clkGnd);
    pulseClock(sim, world, chip, wm, 'CLK');
    clkGnd = connectPinToGnd(wm, findPin(chip, 'CLK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QH', 0, '74598 hold mode: no shift → QH=0');
}


// ── G10: 74599 - 8 bit SIPO Shift Register with Output Latch (OC) ────────────
// Same as 74594 (SHIFT_REG_8BIT_LATCH_BUF) - buffered outputs, RCLR.

console.log('\nG10: 74599 - 8 bit SIPO Shift Register with Output Latch (OC)');

console.log('  G10a: Shift 8 SER=H, RCLK → all Q=1');
{
  const { world, chip, wm } = setupChipWithPower('74599');
  connectPinsHigh(wm, chip, ['SRCLR', 'RCLR', 'SER']);
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 1, `74599 8 shifts+RCLK → ${q}=1`);
  assertPinBit(sim, chip, 'QHs', 1, '74599 QHs=1');
}

console.log('  G10b: RCLR=0 clears output register');
{
  const { world, chip, wm } = setupChipWithPower('74599');
  connectPinsHigh(wm, chip, ['SRCLR', 'SER']);
  connectPinToGnd(wm, findPin(chip, 'RCLR')); // RCLR=0
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
  let rclkGnd = connectPinToGnd(wm, findPin(chip, 'RCLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  disconnectWire(wm, rclkGnd);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74599 RCLR=0 → ${q}=0`);
  assertPinBit(sim, chip, 'QHs', 1, '74599 RCLR=0 does not clear SR → QHs=1');
}


// ── G11: 74600/601/602/603 - DRAM Refresh Controller Stubs ───────────────────
// Stub: all outputs HiZ.

console.log('\nG11: 74600/601/602/603 - DRAM Refresh Controller Stubs');

for (const id of ['74600', '74601', '74602', '74603']) {
  console.log(`  G11 ${id}: all outputs HiZ (stub)`);
  const { world, chip, wm } = setupChipWithPower(id);
  connectPinsHigh(wm, chip, ['OSC', 'BURST', 'MR', 'OEn']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const out of ['TC', 'RAS', 'CAS', 'RFSH'])
    assertPinBit(sim, chip, out, 0, `${id} stub: ${out}=HiZ(0)`);
}


// ── G12: 74608 - Memory Cycle Controller Stub ────────────────────────────────
// CS active when EN1=0 AND EN2=0 AND MR=1. OE when CS+RD. WE when CS+WR. WAIT=1.

console.log('\nG12: 74608 - Memory Cycle Controller Stub');

console.log('  G12a: EN1=H → CS inactive (CS=1), OE=1, WE=1, WAIT=1');
{
  const { world, chip, wm } = setupChipWithPower('74608');
  connectPinsHigh(wm, chip, ['EN1', 'EN2', 'MR']); // EN1=H → not enabled
  connectPinToGnd(wm, findPin(chip, 'RD'));
  connectPinToGnd(wm, findPin(chip, 'WR'));
  connectPinToGnd(wm, findPin(chip, 'CLK'));
  for (const a of ['A0','A1','A2','A3']) connectPinToGnd(wm, findPin(chip, a));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'CS',   1, '74608 EN1=H → CS=1 (inactive)');
  assertPinBit(sim, chip, 'OE',   1, '74608 CS inactive → OE=1');
  assertPinBit(sim, chip, 'WE',   1, '74608 CS inactive → WE=1');
  assertPinBit(sim, chip, 'WAIT', 1, '74608 WAIT=1 (inactive)');
}

console.log('  G12b: EN1=0, EN2=0, MR=1, RD=0 → CS=0, OE=0');
{
  const { world, chip, wm } = setupChipWithPower('74608');
  connectPinToGnd(wm, findPin(chip, 'EN1')); // EN1=0
  connectPinToGnd(wm, findPin(chip, 'EN2')); // EN2=0
  connectPinsHigh(wm, chip, ['MR']);          // MR=1
  connectPinToGnd(wm, findPin(chip, 'RD'));   // RD=0 → read
  connectPinsHigh(wm, chip, ['WR']);          // WR=1 → not write
  connectPinToGnd(wm, findPin(chip, 'CLK'));
  for (const a of ['A0','A1','A2','A3']) connectPinToGnd(wm, findPin(chip, a));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'CS', 0, '74608 EN1=0,EN2=0,MR=1 → CS=0 (active)');
  assertPinBit(sim, chip, 'OE', 0, '74608 CS=0,RD=0 → OE=0 (active)');
  assertPinBit(sim, chip, 'WE', 1, '74608 WR=1 → WE=1 (inactive)');
}

console.log('  G12c: MR=0 → CS=1 (controller reset disables chip)');
{
  const { world, chip, wm } = setupChipWithPower('74608');
  connectPinToGnd(wm, findPin(chip, 'EN1'));
  connectPinToGnd(wm, findPin(chip, 'EN2'));
  connectPinToGnd(wm, findPin(chip, 'MR')); // MR=0 → disabled
  connectPinToGnd(wm, findPin(chip, 'RD'));
  connectPinToGnd(wm, findPin(chip, 'WR'));
  connectPinToGnd(wm, findPin(chip, 'CLK'));
  for (const a of ['A0','A1','A2','A3']) connectPinToGnd(wm, findPin(chip, a));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'CS', 1, '74608 MR=0 → CS=1 (inactive)');
}


// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) process.exit(1);
