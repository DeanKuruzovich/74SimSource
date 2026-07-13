// test-chips6.mjs - Tests for all chips defined in js/chips/chips6.js
// Style matches test-chips1.mjs .. test-chips5.mjs: plain Node.js ESM, no framework.
// Covers structure validation AND gate logic simulation for all 15 chips.
//
// Chips under test:
//   74175   Quad D flip flop with clear
//   74191   Synchronous 4 bit up/down binary counter (single clock)
//   74193   Synchronous 4 bit up/down binary counter (dual clock)
//   74240   Octal inverting buffer/line driver (tri state, active LOW OE)
//   74244   Octal non inverting buffer/line driver (tri state, active LOW OE)
//   74245   Octal bus transceiver (tri state, bidirectional)
//   74257   Quad 2-to-1 multiplexer (tri state outputs)
//   74259   8 bit addressable latch
//   74273   Octal D flip flop with clear
//   74373   Octal D transparent latch (tri state)
//   74374   Octal D flip flop (tri state)
//   74541   Octal buffer/line driver (tri state, dual active LOW OE)
//   74573   Octal D transparent latch (tri state, alternate pinout)
//   74574   Octal D flip flop (tri state, alternate pinout)
//   74595   8 bit shift register with output latch (SIPO)

import { CHIPS_BLOCK_6 } from '../chips/chips6.js';
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
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
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

/** Pulse a clock pin HIGH then LOW (rising edge trigger). */
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
  '74x175', '74x191', '74x193',
  '74x240', '74x244', '74x245',
  '74x257', '74x259',
  '74x273', '74x373', '74x374',
  '74x541', '74x573', '74x574',
  '74x595',
];

const SEQUENTIAL_IDS = [
  '74x175', '74x191', '74x193',
  '74x259', '74x273', '74x373', '74x374',
  '74x573', '74x574', '74x595',
];

console.log('\nS1: All 15 chip IDs present in CHIPS_BLOCK_6');
{
  for (const id of EXPECTED_CHIP_IDS) {
    assert(id in CHIPS_BLOCK_6, `Chip ${id} exists`);
  }
  assert(Object.keys(CHIPS_BLOCK_6).length === EXPECTED_CHIP_IDS.length,
    `CHIPS_BLOCK_6 has exactly ${EXPECTED_CHIP_IDS.length} chips (got ${Object.keys(CHIPS_BLOCK_6).length})`);
}

console.log('\nS2: Required fields present on every chip definition');
{
  const REQUIRED = ['name', 'simpleName', 'description', 'pins', 'vcc', 'gnd', 'pinout', 'gates', 'tags'];
  for (const [id, def] of Object.entries(CHIPS_BLOCK_6)) {
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
  for (const [id, def] of Object.entries(CHIPS_BLOCK_6)) {
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
    assert(CHIPS_BLOCK_6[id]?.sequential === true, `${id}: sequential flag set`);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate Logic Tests
// ─────────────────────────────────────────────────────────────────────────────


// ── G1: 74175 - Quad D Flip Flop with Clear ──────────────────────────────────
// Async CLR (active LOW). Rising CLK latches all four D inputs simultaneously.
// Each FF has true (Q) and complemented (Qn) output.

console.log('\nG1: 74175 - Quad D Flip Flop with Clear');

console.log('  G1a: Async CLR=L - all Q=0, all Qn=1 (no clock needed)');
{
  const { world, chip, wm } = setupChipWithPower('74x175');
  connectPinToGnd(wm, findPin(chip, 'CLR')); // CLR=L (active clear)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['1Q','2Q','3Q','4Q'])
    assertPinBit(sim, chip, q,  0, `74175 CLR=L → ${q}=0`);
  for (const qn of ['1Qn','2Qn','3Qn','4Qn'])
    assertPinBit(sim, chip, qn, 1, `74175 CLR=L → ${qn}=1`);
}

console.log('  G1b: Rising CLK captures D inputs (CLR=H)');
{
  const { world, chip, wm } = setupChipWithPower('74x175');
  // CLR=H, 1D=H, 3D=H; 2D=L, 4D=L
  connectPinsHigh(wm, chip, ['CLR','1D','3D']);
  connectPinToGnd(wm, findPin(chip, '2D'));
  connectPinToGnd(wm, findPin(chip, '4D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, '1Q',  1, '74175 1D=H → 1Q=1');
  assertPinBit(sim, chip, '1Qn', 0, '74175 1D=H → 1Qn=0');
  assertPinBit(sim, chip, '2Q',  0, '74175 2D=L → 2Q=0');
  assertPinBit(sim, chip, '2Qn', 1, '74175 2D=L → 2Qn=1');
  assertPinBit(sim, chip, '3Q',  1, '74175 3D=H → 3Q=1');
  assertPinBit(sim, chip, '3Qn', 0, '74175 3D=H → 3Qn=0');
  assertPinBit(sim, chip, '4Q',  0, '74175 4D=L → 4Q=0');
  assertPinBit(sim, chip, '4Qn', 1, '74175 4D=L → 4Qn=1');
}

console.log('  G1c: Q holds between clock edges (no extra capture without CLK↑)');
{
  const { world, chip, wm } = setupChipWithPower('74x175');
  connectPinsHigh(wm, chip, ['CLR','1D','2D','3D','4D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch all 1s
  // Now change D inputs; evaluate without clock → outputs should hold
  sim.evaluate(world, [chip], wm);
  for (const q of ['1Q','2Q','3Q','4Q'])
    assertPinBit(sim, chip, q, 1, `74175 hold: ${q}=1 without extra CLK`);
}

console.log('  G1d: Async CLR=L overrides latched data immediately');
{
  const { world, chip, wm } = setupChipWithPower('74x175');
  connectPinsHigh(wm, chip, ['CLR','1D','2D','3D','4D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch all 1s
  assertPinBit(sim, chip, '1Q', 1, '74175 before CLR: 1Q=1');
  // Rebuild with CLR=L (not connected = floating = 0)
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x175');
  connectPinToGnd(wm2, findPin(c2, 'CLR')); // CLR=L (active clear)
  connectPinsHigh(wm2, c2, ['1D','2D','3D','4D']);
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  for (const q of ['1Q','2Q','3Q','4Q'])
    assertPinBit(sim2, c2, q, 0, `74175 CLR=L async clear → ${q}=0`);
}

console.log('  G1e: All four FFs latch independently on the same CLK edge');
{
  const { world, chip, wm } = setupChipWithPower('74x175');
  connectPinsHigh(wm, chip, ['CLR','2D','4D']); // 1D=3D=0, 2D=4D=1
  connectPinToGnd(wm, findPin(chip, '1D'));
  connectPinToGnd(wm, findPin(chip, '3D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, '1Q', 0, '74175 1D=0 → 1Q=0');
  assertPinBit(sim, chip, '2Q', 1, '74175 2D=1 → 2Q=1');
  assertPinBit(sim, chip, '3Q', 0, '74175 3D=0 → 3Q=0');
  assertPinBit(sim, chip, '4Q', 1, '74175 4D=1 → 4Q=1');
}


// ── G2: 74191 - 4 bit Up/Down Binary Counter (single clock) ──────────────────
// CTEN=0 (active LOW): count enabled. D/U=0: count up; D/U=1: count down.
// LOAD=0 (active LOW, synchronous): loads A,B,C,D on rising CLK.
// MAX/MIN=1 and RCO=0 at terminal count while CTEN=0.
// Terminal count: 15 when counting up (D/U=0), 0 when counting down (D/U=1).

console.log('\nG2: 74191 - 4 bit Up/Down Binary Counter');

console.log('  G2a: Default state - count=0, MAX/MIN=0, RCO=1');
{
  // CTEN=L(enabled), D/U=L(up), LOAD=H(not loading)
  const { world, chip, wm } = setupChipWithPower('74x191');
  connectPinsHigh(wm, chip, ['LOAD']);
  connectPinToGnd(wm, findPin(chip, 'CTEN'));
  connectPinToGnd(wm, findPin(chip, 'D/U'));
  connectPinToGnd(wm, findPin(chip, 'CLK'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA','QB','QC','QD'])
    assertPinBit(sim, chip, q, 0, `74191 init → ${q}=0`);
  assertPinBit(sim, chip, 'MAX/MIN', 0, '74191 count=0, D/U=0(up): not at terminal → MAX/MIN=0');
  assertPinBit(sim, chip, 'RCO',     1, '74191 count=0, not at terminal → RCO=1');
}

console.log('  G2b: Count up 0→15: verify each step');
{
  const { world, chip, wm } = setupChipWithPower('74x191');
  // CTEN=L(enabled), D/U=L(up), LOAD=H(count mode)
  connectPinsHigh(wm, chip, ['LOAD']);
  connectPinToGnd(wm, findPin(chip, 'CTEN'));
  connectPinToGnd(wm, findPin(chip, 'D/U'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let n = 1; n <= 15; n++) {
    pulseClock(sim, world, chip, wm);
    const [a,b,c,d] = [n&1,(n>>1)&1,(n>>2)&1,(n>>3)&1];
    assertPinBit(sim, chip, 'QA', a, `74191 count=${n} → QA=${a}`);
    assertPinBit(sim, chip, 'QB', b, `74191 count=${n} → QB=${b}`);
    assertPinBit(sim, chip, 'QC', c, `74191 count=${n} → QC=${c}`);
    assertPinBit(sim, chip, 'QD', d, `74191 count=${n} → QD=${d}`);
  }
}

console.log('  G2c: MAX/MIN=1 and RCO=0 at count=15 while counting up (D/U=0, CTEN=0)');
{
  const { world, chip, wm } = setupChipWithPower('74x191');
  connectPinsHigh(wm, chip, ['LOAD']);
  connectPinToGnd(wm, findPin(chip, 'CTEN'));
  connectPinToGnd(wm, findPin(chip, 'D/U'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 15; i++) pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, 'MAX/MIN', 1, '74191 count=15, D/U=0 → MAX/MIN=1');
  assertPinBit(sim, chip, 'RCO',     0, '74191 count=15, D/U=0 → RCO=0');
  // Count wraps from 15 back to 0
  pulseClock(sim, world, chip, wm);
  assertPinBit(sim, chip, 'QA', 0, '74191 count wraps 15→0 → QA=0');
  assertPinBit(sim, chip, 'QB', 0, '74191 count wraps 15→0 → QB=0');
  assertPinBit(sim, chip, 'QC', 0, '74191 count wraps 15→0 → QC=0');
  assertPinBit(sim, chip, 'QD', 0, '74191 count wraps 15→0 → QD=0');
}

console.log('  G2d: Count down (D/U=H): 0→15, then toward 0');
{
  const { world, chip, wm } = setupChipWithPower('74x191');
  connectPinsHigh(wm, chip, ['LOAD','D/U']); // LOAD=H(count), D/U=H(down)
  connectPinToGnd(wm, findPin(chip, 'CTEN')); // CTEN=L(enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // 0→15
  assertPinBit(sim, chip, 'QA', 1, '74191 down: 0→15 → QA=1');
  assertPinBit(sim, chip, 'QB', 1, '74191 down: 0→15 → QB=1');
  assertPinBit(sim, chip, 'QC', 1, '74191 down: 0→15 → QC=1');
  assertPinBit(sim, chip, 'QD', 1, '74191 down: 0→15 → QD=1');
}

console.log('  G2e: MAX/MIN=1 and RCO=0 at count=0 when counting down (D/U=1, CTEN=0)');
{
  // D/U=1: terminal count for down direction is 0.
  // Load count=1 synchronously (LOAD=0, clock pulse), then count down one step to 0.
  const { world, chip, wm } = setupChipWithPower('74x191');
  // CTEN=L(enabled), D/U=L(up), LOAD=L(active-sync)
  // A=H → load count=1 on rising CLK edge
  connectPinsHigh(wm, chip, ['A']);
  connectPinToGnd(wm, findPin(chip, 'CTEN'));
  const duWire = connectPinToGnd(wm, findPin(chip, 'D/U'));
  const loadWire = connectPinToGnd(wm, findPin(chip, 'LOAD'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);    // CLK↑: LOAD=0 → synchronously loads count=1
  assertPinBit(sim, chip, 'QA', 1, '74191 setup: loaded count=1 → QA=1');
  // Switch to count-down mode: LOAD=H (stop loading), D/U=H (down), CTEN stays 0
  disconnectWire(wm, loadWire);
  disconnectWire(wm, duWire);
  connectPinsHigh(wm, chip, ['LOAD','D/U']);
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);    // CLK↑: count 1→0 (down)
  assertPinBit(sim, chip, 'QA', 0, '74191 down count=0 → QA=0');
  assertPinBit(sim, chip, 'MAX/MIN', 1, '74191 count=0, D/U=1 → MAX/MIN=1');
  assertPinBit(sim, chip, 'RCO',     0, '74191 count=0, D/U=1 → RCO=0');
}

console.log('  G2f: CTEN=H disables counting (count stays frozen)');
{
  const { world, chip, wm } = setupChipWithPower('74x191');
  connectPinsHigh(wm, chip, ['LOAD','CTEN']); // CTEN=H → disabled
  connectPinToGnd(wm, findPin(chip, 'D/U'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  pulseClock(sim, world, chip, wm);
  for (const q of ['QA','QB','QC','QD'])
    assertPinBit(sim, chip, q, 0, `74191 CTEN=H inhibits counting → ${q} stays 0`);
  assertPinBit(sim, chip, 'MAX/MIN', 0, '74191 CTEN=H → MAX/MIN=0 (not enabled)');
}

console.log('  G2g: Synchronous parallel load (LOAD=0) on rising CLK');
{
  const { world, chip, wm } = setupChipWithPower('74x191');
  // LOAD=L(active), A=H, C=H → load 0b0101=5; CTEN=L(enabled)
  connectPinsHigh(wm, chip, ['A','C']);
  connectPinToGnd(wm, findPin(chip, 'LOAD'));
  connectPinToGnd(wm, findPin(chip, 'CTEN'));
  connectPinToGnd(wm, findPin(chip, 'D/U'));
  connectPinToGnd(wm, findPin(chip, 'B'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // load 5
  assertPinBit(sim, chip, 'QA', 1, '74191 load 5 → QA=1');
  assertPinBit(sim, chip, 'QB', 0, '74191 load 5 → QB=0');
  assertPinBit(sim, chip, 'QC', 1, '74191 load 5 → QC=1');
  assertPinBit(sim, chip, 'QD', 0, '74191 load 5 → QD=0');
}


// ── G3: 74193 - 4 bit Up/Down Counter (dual clock) ────────────────────────────
// CLR=1 (active HIGH, async): clears count to 0.
// LOAD=0 (active LOW, async): immediately loads A,B,C,D.
// UP: rising edge → count up. DOWN: rising edge → count down.
// CO: LOW when count=15 AND UP=0 (carry ripple). BO: LOW when count=0 AND DOWN=0 (borrow).

console.log('\nG3: 74193 - 4 bit Up/Down Counter (dual clock)');

console.log('  G3a: CLR=H async clear → count=0 immediately');
{
  const { world, chip, wm } = setupChipWithPower('74x193');
  connectPinsHigh(wm, chip, ['CLR','LOAD']); // CLR=H→clear; LOAD=H→count kept
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA','QB','QC','QD'])
    assertPinBit(sim, chip, q, 0, `74193 CLR=H → ${q}=0`);
}

console.log('  G3b: Async parallel load (LOAD=0): count = A,B,C,D without clock');
{
  const { world, chip, wm } = setupChipWithPower('74x193');
  // LOAD=L(active), B=H, D=H → load 0b1010=10
  connectPinsHigh(wm, chip, ['B','D']);
  connectPinToGnd(wm, findPin(chip, 'LOAD'));
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'A'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QA', 0, '74193 async load 10 → QA=0');
  assertPinBit(sim, chip, 'QB', 1, '74193 async load 10 → QB=1');
  assertPinBit(sim, chip, 'QC', 0, '74193 async load 10 → QC=0');
  assertPinBit(sim, chip, 'QD', 1, '74193 async load 10 → QD=1');
}

console.log('  G3c: Count up from 0: 5 UP pulses → count=5');
{
  const { world, chip, wm } = setupChipWithPower('74x193');
  connectPinsHigh(wm, chip, ['LOAD']); // LOAD=H (not loading)
  connectPinToGnd(wm, findPin(chip, 'CLR')); // CLR=L (inactive)
  let upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
  connectPinToGnd(wm, findPin(chip, 'DOWN'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 5; i++) {
    disconnectWire(wm, upGnd);
    pulseClock(sim, world, chip, wm, 'UP');
    upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QA', 1, '74193 up×5 → QA=1 (count=5=0b0101)');
  assertPinBit(sim, chip, 'QB', 0, '74193 up×5 → QB=0');
  assertPinBit(sim, chip, 'QC', 1, '74193 up×5 → QC=1');
  assertPinBit(sim, chip, 'QD', 0, '74193 up×5 → QD=0');
}

console.log('  G3d: Count down: load 3, then 3 DOWN pulses → count=0');
{
  const { world, chip, wm } = setupChipWithPower('74x193');
  // Async load 3: A=H, B=H, LOAD=L(active)
  connectPinsHigh(wm, chip, ['A','B']);
  const loadWire3d = connectPinToGnd(wm, findPin(chip, 'LOAD'));
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'C'));
  connectPinToGnd(wm, findPin(chip, 'D'));
  connectPinToGnd(wm, findPin(chip, 'UP'));
  let downGnd = connectPinToGnd(wm, findPin(chip, 'DOWN'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QA', 1, '74193 loaded 3 → QA=1');
  // Switch to count mode: LOAD=H
  disconnectWire(wm, loadWire3d);
  connectPinsHigh(wm, chip, ['LOAD']);
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 3; i++) {
    disconnectWire(wm, downGnd);
    pulseClock(sim, world, chip, wm, 'DOWN');
    downGnd = connectPinToGnd(wm, findPin(chip, 'DOWN'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QA', 0, '74193 down×3 from 3 → QA=0');
  assertPinBit(sim, chip, 'QB', 0, '74193 down×3 from 3 → QB=0');
  assertPinBit(sim, chip, 'QC', 0, '74193 down×3 from 3 → QC=0');
  assertPinBit(sim, chip, 'QD', 0, '74193 down×3 from 3 → QD=0');
}

console.log('  G3e: CO=L when count=15 and UP=L (carry)');
{
  const { world, chip, wm } = setupChipWithPower('74x193');
  connectPinsHigh(wm, chip, ['LOAD']); // count mode
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  let upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
  connectPinToGnd(wm, findPin(chip, 'DOWN'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 15; i++) {
    disconnectWire(wm, upGnd);
    pulseClock(sim, world, chip, wm, 'UP');
    upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
    sim.evaluate(world, [chip], wm);
  }
  // count=15, UP already GND for CO check
  assertPinBit(sim, chip, 'CO', 0, '74193 count=15, UP=L → CO=L (carry)');
  // One more UP pulse: count wraps 15→0; then UP=L, count=0, CO=1
  disconnectWire(wm, upGnd);
  pulseClock(sim, world, chip, wm, 'UP');
  upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'CO', 1, '74193 count=0, UP=L → CO=H (no carry)');
}

console.log('  G3f: BO=L when count=0 and DOWN=L (borrow at start)');
{
  const { world, chip, wm } = setupChipWithPower('74x193');
  connectPinsHigh(wm, chip, ['LOAD']); // count mode; count=0 (default)
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinToGnd(wm, findPin(chip, 'UP'));
  let downGnd = connectPinToGnd(wm, findPin(chip, 'DOWN')); // DOWN=L for BO check
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // count=0, DOWN=0 → BO=LOW
  assertPinBit(sim, chip, 'BO', 0, '74193 count=0, DOWN=L → BO=L (borrow)');
  // DOWN pulse: 0→15; then DOWN=L, count=15 → BO=H (no borrow)
  disconnectWire(wm, downGnd);
  pulseClock(sim, world, chip, wm, 'DOWN');
  downGnd = connectPinToGnd(wm, findPin(chip, 'DOWN'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'BO', 1, '74193 count=15, DOWN=L → BO=H (no borrow)');
}

console.log('  G3g: UP and DOWN are independent; count increments and decrements correctly');
{
  const { world, chip, wm } = setupChipWithPower('74x193');
  connectPinsHigh(wm, chip, ['LOAD']);
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  let upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
  let downGnd = connectPinToGnd(wm, findPin(chip, 'DOWN'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // UP pulse × 2
  disconnectWire(wm, upGnd);
  pulseClock(sim, world, chip, wm, 'UP');   // 0→1
  upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, upGnd);
  pulseClock(sim, world, chip, wm, 'UP');   // 1→2
  upGnd = connectPinToGnd(wm, findPin(chip, 'UP'));
  sim.evaluate(world, [chip], wm);
  // DOWN pulse × 1
  disconnectWire(wm, downGnd);
  pulseClock(sim, world, chip, wm, 'DOWN'); // 2→1
  downGnd = connectPinToGnd(wm, findPin(chip, 'DOWN'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QA', 1, '74193 up×2, down×1 → count=1, QA=1');
  assertPinBit(sim, chip, 'QB', 0, '74193 up×2, down×1 → QB=0');
  assertPinBit(sim, chip, 'QC', 0, '74193 up×2, down×1 → QC=0');
  assertPinBit(sim, chip, 'QD', 0, '74193 up×2, down×1 → QD=0');
}


// ── G4: 74240 - Octal Inverting Buffer (tri state, active LOW OE) ─────────────
// Two groups of 4 inverting buffers. Each group has its own OE (active LOW).
// OE=0: Y = NOT(A). OE=1: HiZ (modelled as 0).

console.log('\nG4: 74240 - Octal Inverting Buffer (tri state)');

console.log('  G4a: 1OE=H - group 1 outputs are 0 (HiZ)');
{
  const { world, chip, wm } = setupChipWithPower('74x240');
  connectPinsHigh(wm, chip, ['1OE','1A1','1A2','1A3','1A4']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const y of ['1Y1','1Y2','1Y3','1Y4'])
    assertPinBit(sim, chip, y, 0, `74240 1OE=H → ${y}=0 (HiZ)`);
}

console.log('  G4b: 1OE=L, A=H → Y=L (inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x240');
  connectPinToGnd(wm, findPin(chip, '1OE')); // 1OE=L (enabled)
  connectPinsHigh(wm, chip, ['1A1']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y1', 0, '74240 OE=L, A=H → Y=L (inverted)');
}

console.log('  G4c: 1OE=L, A=L → Y=H (inverted)');
{
  const { world, chip, wm } = setupChipWithPower('74x240');
  connectPinToGnd(wm, findPin(chip, '1OE')); // 1OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, '1A1')); // 1A1=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y1', 1, '74240 OE=L, A=L → Y=H (inverted)');
}

console.log('  G4d: 2OE=L, group 2 inverting: 2A3=H → 2Y3=L; 2A4=L → 2Y4=H');
{
  const { world, chip, wm } = setupChipWithPower('74x240');
  connectPinsHigh(wm, chip, ['2A3']);
  connectPinToGnd(wm, findPin(chip, '2OE')); // 2OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, '2A4')); // 2A4=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '2Y3', 0, '74240 2OE=L, 2A3=H → 2Y3=L');
  assertPinBit(sim, chip, '2Y4', 1, '74240 2OE=L, 2A4=L → 2Y4=H');
}

console.log('  G4e: 2OE=H - group 2 outputs are 0 (HiZ), group 1 still active');
{
  const { world, chip, wm } = setupChipWithPower('74x240');
  connectPinsHigh(wm, chip, ['2OE']);
  connectPinToGnd(wm, findPin(chip, '1OE')); // 1OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, '1A1')); // 1A1=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '2Y1', 0, '74240 2OE=H → 2Y1=0 (HiZ)');
  // Group 1 enabled: 1A1 floating=0 → 1Y1=H
  assertPinBit(sim, chip, '1Y1', 1, '74240 1OE=L, 1A1=L → 1Y1=H (active)');
}


// ── G5: 74244 - Octal Non Inverting Buffer (tri state, active LOW OE) ─────────
// Two groups of 4 non inverting buffers. Each group has its own OE (active LOW).
// OE=0: Y=A. OE=1: HiZ (0).

console.log('\nG5: 74244 - Octal Non Inverting Buffer (tri state)');

console.log('  G5a: 1OE=H - group 1 outputs are 0 (HiZ)');
{
  const { world, chip, wm } = setupChipWithPower('74x244');
  connectPinsHigh(wm, chip, ['1OE','1A1','1A2','1A3','1A4']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const y of ['1Y1','1Y2','1Y3','1Y4'])
    assertPinBit(sim, chip, y, 0, `74244 1OE=H → ${y}=0 (HiZ)`);
}

console.log('  G5b: 1OE=L, A=H → Y=H (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x244');
  connectPinsHigh(wm, chip, ['1A1']);
  connectPinToGnd(wm, findPin(chip, '1OE')); // 1OE=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y1', 1, '74244 OE=L, A=H → Y=H');
}

console.log('  G5c: 1OE=L, A=L → Y=L (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x244');
  connectPinToGnd(wm, findPin(chip, '1OE')); // 1OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, '1A1')); // 1A1=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y1', 0, '74244 OE=L, A=L → Y=L');
}

console.log('  G5d: Group 2 independent: 2OE=L, all group-2 outputs follow inputs');
{
  const { world, chip, wm } = setupChipWithPower('74x244');
  connectPinsHigh(wm, chip, ['2A1','2A3']);
  connectPinToGnd(wm, findPin(chip, '2OE')); // 2OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, '2A2'));
  connectPinToGnd(wm, findPin(chip, '2A4'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '2Y1', 1, '74244 2A1=H → 2Y1=H');
  assertPinBit(sim, chip, '2Y2', 0, '74244 2A2=L → 2Y2=L');
  assertPinBit(sim, chip, '2Y3', 1, '74244 2A3=H → 2Y3=H');
  assertPinBit(sim, chip, '2Y4', 0, '74244 2A4=L → 2Y4=L');
}


// ── G6: 74245 - Octal Bus Transceiver (tri state, bidirectional) ──────────────
// OE=0 (active LOW): enabled. OE=1: all outputs HiZ (0).
// DIR=1: A→B (A inputs, B outputs). DIR=0: B→A (B inputs, A outputs).

console.log('\nG6: 74245 - Octal Bus Transceiver');

console.log('  G6a: OE=H - all outputs 0 (HiZ, modelled as 0)');
{
  // With OE=H the chip drives all A/B nodes to 0 in our HiZ model.
  // Do NOT externally connect A/B to VCC or there is a voltage-source conflict.
  const { world, chip, wm } = setupChipWithPower('74x245');
  connectPinsHigh(wm, chip, ['OE','DIR']); // OE=H(disabled), DIR=H(A→B direction)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `B${i}`, 0, `74245 OE=H → B${i}=0 (HiZ)`);
}

console.log('  G6b: OE=L, DIR=H (A→B): A1=H → B1=H');
{
  const { world, chip, wm } = setupChipWithPower('74x245');
  connectPinsHigh(wm, chip, ['DIR','A1']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'B1', 1, '74245 DIR=H, A1=H → B1=H');
}

console.log('  G6c: OE=L, DIR=H (A→B): A=L → B outputs all 0');
{
  const { world, chip, wm } = setupChipWithPower('74x245');
  connectPinsHigh(wm, chip, ['DIR']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  for (let i = 1; i <= 8; i++) connectPinToGnd(wm, findPin(chip, `A${i}`)); // A inputs = L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `B${i}`, 0, `74245 DIR=H, A${i}=L → B${i}=0`);
}

console.log('  G6d: OE=L, DIR=L (B→A): B3=H → A3=H');
{
  const { world, chip, wm } = setupChipWithPower('74x245');
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'DIR')); // DIR=L (B→A)
  connectPinsHigh(wm, chip, ['B3']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'A3', 1, '74245 DIR=L, B3=H → A3=H');
}

console.log('  G6e: OE=L, DIR=L: all B=L → all A=L');
{
  const { world, chip, wm } = setupChipWithPower('74x245');
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'DIR')); // DIR=L (B→A)
  for (let i = 1; i <= 8; i++) connectPinToGnd(wm, findPin(chip, `B${i}`)); // B inputs = L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `A${i}`, 0, `74245 DIR=L, B${i}=L → A${i}=0`);
}


// ── G7: 74257 - Quad 2-to-1 Multiplexer (tri state) ──────────────────────────
// OE=0 (active LOW): outputs enabled. OE=1: HiZ (0).
// SEL=0: Y=A. SEL=1: Y=B.

console.log('\nG7: 74257 - Quad 2-to-1 Multiplexer (tri state)');

console.log('  G7a: OE=H - all outputs 0 (HiZ)');
{
  const { world, chip, wm } = setupChipWithPower('74x257');
  connectPinsHigh(wm, chip, ['OE','1A','1B','2A','2B','3A','3B','4A','4B']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const y of ['1Y','2Y','3Y','4Y'])
    assertPinBit(sim, chip, y, 0, `74257 OE=H → ${y}=0 (HiZ)`);
}

console.log('  G7b: OE=L, SEL=L, 1A=H → 1Y=H (select A)');
{
  const { world, chip, wm } = setupChipWithPower('74x257');
  connectPinsHigh(wm, chip, ['1A']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'SEL')); // SEL=L (select A)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 1, '74257 SEL=L, 1A=H → 1Y=H');
}

console.log('  G7c: OE=L, SEL=L, 1B=H, 1A=L → 1Y=L (B ignored when SEL=0)');
{
  const { world, chip, wm } = setupChipWithPower('74x257');
  connectPinsHigh(wm, chip, ['1B']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L
  connectPinToGnd(wm, findPin(chip, 'SEL')); // SEL=L (select A)
  connectPinToGnd(wm, findPin(chip, '1A')); // 1A=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 0, '74257 SEL=L, 1B=H, 1A=L → 1Y=L');
}

console.log('  G7d: OE=L, SEL=H, 1B=H → 1Y=H (select B)');
{
  const { world, chip, wm } = setupChipWithPower('74x257');
  connectPinsHigh(wm, chip, ['SEL','1B']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Y', 1, '74257 SEL=H, 1B=H → 1Y=H');
}

console.log('  G7e: OE=L, SEL=H, all four B=H → all four Y=H');
{
  const { world, chip, wm } = setupChipWithPower('74x257');
  connectPinsHigh(wm, chip, ['SEL','1B','2B','3B','4B']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const y of ['1Y','2Y','3Y','4Y'])
    assertPinBit(sim, chip, y, 1, `74257 SEL=H, B=H → ${y}=H`);
}


// ── G8: 74259 - 8 bit Addressable Latch ────────────────────────────────────
// CLR=0 (active LOW): async clear all Q to 0.
// CLR=1, G=0 (active LOW enable): addressed latch follows D; others hold.
// CLR=1, G=1: all latches hold.

console.log('\nG8: 74259 - 8 bit Addressable Latch');

console.log('  G8a: CLR=L - all Q=0');
{
  const { world, chip, wm } = setupChipWithPower('74x259');
  // CLR=L(active clear), G floating doesn't matter
  connectPinToGnd(wm, findPin(chip, 'CLR'));
  connectPinsHigh(wm, chip, ['D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++)
    assertPinBit(sim, chip, `Q${i}`, 0, `74259 CLR=L → Q${i}=0`);
}

console.log('  G8b: CLR=H, G=L, addr=3 (A1=H,A0=H,A2=L), D=H → Q3=H; others=0');
{
  const { world, chip, wm } = setupChipWithPower('74x259');
  // CLR=H; addr=3=0b011 → A0=H, A1=H, A2=L; G=L(active/enable); D=H
  connectPinsHigh(wm, chip, ['CLR','A0','A1','D']);
  connectPinToGnd(wm, findPin(chip, 'G')); // G=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'A2')); // A2=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q3', 1, '74259 addr=3, D=H → Q3=H');
  assertPinBit(sim, chip, 'Q0', 0, '74259 addr=3 → Q0=0');
  assertPinBit(sim, chip, 'Q7', 0, '74259 addr=3 → Q7=0');
}

console.log('  G8c: CLR=H, G=L, addr=7 (A0=A1=A2=H), D=H → Q7=H');
{
  const { world, chip, wm } = setupChipWithPower('74x259');
  connectPinsHigh(wm, chip, ['CLR','A0','A1','A2','D']);
  connectPinToGnd(wm, findPin(chip, 'G')); // G=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q7', 1, '74259 addr=7, D=H → Q7=H');
  assertPinBit(sim, chip, 'Q0', 0, '74259 addr=7 → Q0=0');
}

console.log('  G8d: G=H - all latches hold; D change does not propagate');
{
  // First write Q5=1, then assert G=H and try to write a different Q
  const { world, chip, wm } = setupChipWithPower('74x259');
  // Write Q5: addr=5=0b101 → A0=H, A2=H, A1=L; D=H; CLR=H
  connectPinsHigh(wm, chip, ['CLR','A0','A2','D']);
  const gWireInit = connectPinToGnd(wm, findPin(chip, 'G')); // G=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'A1')); // A1=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q5', 1, '74259 wrote Q5=1');
  // Now assert G=H (disable) and try to write Q0 with different address
  disconnectWire(wm, gWireInit);
  const gWire = connectPinToVcc(wm, findPin(chip, 'G'));
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q5', 1, '74259 G=H: Q5 holds =1');
  assertPinBit(sim, chip, 'Q0', 0, '74259 G=H: Q0 stays 0 (no write)');
}

console.log('  G8e: CLR=L overrides G=H (async clear wins)');
{
  const { world, chip, wm } = setupChipWithPower('74x259');
  connectPinsHigh(wm, chip, ['CLR','A0','A1','A2','D']);
  connectPinToGnd(wm, findPin(chip, 'G')); // G=L (enabled) to write Q7=1
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'Q7', 1, '74259 before CLR: Q7=1');
  // Async clear: rebuild without CLR connected
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x259');
  connectPinToGnd(wm2, findPin(c2, 'CLR')); // CLR=L (active clear)
  connectPinsHigh(wm2, c2, ['A0','A1','A2','D']);
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  assertPinBit(sim2, c2, 'Q7', 0, '74259 CLR=L clears Q7=0');
}


// ── G9: 74273 - Octal D Flip Flop with Clear ─────────────────────────────────
// Async CLR (active LOW). Rising CLK latches 1D..8D → 1Q..8Q (no Qn outputs).

console.log('\nG9: 74273 - Octal D Flip Flop with Clear');

console.log('  G9a: CLR=L - all Q=0 (async, no clock needed)');
{
  const { world, chip, wm } = setupChipWithPower('74x273');
  connectPinToGnd(wm, findPin(chip, 'CLR')); // CLR=L (active clear)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 0, `74273 CLR=L → ${i}Q=0`);
}

console.log('  G9b: Rising CLK, CLR=H: Q captures D');
{
  const { world, chip, wm } = setupChipWithPower('74x273');
  connectPinsHigh(wm, chip, ['CLR','1D','3D','5D','7D']); // odd D=H
  connectPinToGnd(wm, findPin(chip, '2D'));
  connectPinToGnd(wm, findPin(chip, '4D'));
  connectPinToGnd(wm, findPin(chip, '6D'));
  connectPinToGnd(wm, findPin(chip, '8D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  for (let i = 1; i <= 8; i++) {
    const expected = (i % 2 === 1) ? 1 : 0;
    assertPinBit(sim, chip, `${i}Q`, expected, `74273 latch: ${i}Q=${expected}`);
  }
}

console.log('  G9c: Q holds between clock edges');
{
  const { world, chip, wm } = setupChipWithPower('74x273');
  connectPinsHigh(wm, chip, ['CLR','1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch all 1s
  sim.evaluate(world, [chip], wm);  // no extra edge
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 1, `74273 hold: ${i}Q=1`);
}

console.log('  G9d: Async CLR overrides latched data');
{
  const { world, chip, wm } = setupChipWithPower('74x273');
  connectPinsHigh(wm, chip, ['CLR','1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch all 1s
  assertPinBit(sim, chip, '1Q', 1, '74273 before CLR: 1Q=1');
  // Async clear: floating CLR=0 → need explicit GND wire
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x273');
  connectPinToGnd(wm2, findPin(c2, 'CLR')); // CLR=L (active clear)
  connectPinsHigh(wm2, c2, ['1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim2, c2, `${i}Q`, 0, `74273 CLR=L clears ${i}Q=0`);
}


// ── G10: 74373 - Octal D Transparent Latch (tri state) ───────────────────────
// LE=1: transparent (Q follows D). LE=0: hold.
// OE=0 (active LOW): outputs enabled. OE=1: HiZ (0).

console.log('\nG10: 74373 - Octal D Transparent Latch (tri state)');

console.log('  G10a: OE=H - all Q=0 (HiZ), internal state unaffected');
{
  const { world, chip, wm } = setupChipWithPower('74x373');
  connectPinsHigh(wm, chip, ['OE','LE','1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 0, `74373 OE=H → ${i}Q=0 (HiZ)`);
}

console.log('  G10b: OE=L, LE=H: Q follows D (transparent)');
{
  const { world, chip, wm } = setupChipWithPower('74x373');
  connectPinsHigh(wm, chip, ['LE','1D','3D','5D','7D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, '2D'));
  connectPinToGnd(wm, findPin(chip, '4D'));
  connectPinToGnd(wm, findPin(chip, '6D'));
  connectPinToGnd(wm, findPin(chip, '8D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    const expected = (i % 2 === 1) ? 1 : 0;
    assertPinBit(sim, chip, `${i}Q`, expected, `74373 LE=H: ${i}Q=${expected}`);
  }
}

console.log('  G10c: OE=L, LE=L: Q holds after latch');
{
  const { world, chip, wm } = setupChipWithPower('74x373');
  connectPinsHigh(wm, chip, ['LE','1D','2D','3D','4D','5D','6D','7D','8D']); // OE=0(enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm); // transparent: Q=D=1
  // Now assert LE=L (hold) - disconnect LE wire (it goes floating=0=LE=L=hold)
  // Rebuild with LE not connected and D inputs disconnected
  const { world: w2, chip: c2, wm: wm2 } = setupChipWithPower('74x373');
  connectPinsHigh(wm2, c2, ['LE','1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2); // latch: Q=1 while LE=H
  // Now LE goes low (disconnect it)
  const { world: w3, chip: c3, wm: wm3 } = setupChipWithPower('74x373');
  connectPinsHigh(wm3, c3, ['1D','2D','3D','4D','5D','6D','7D','8D']); // LE=float=0=hold
  const sim3 = new CircuitSimulator();
  // Pre-seed state by first latching with LE=H
  connectPinsHigh(wm3, c3, ['LE']);
  sim3.evaluate(w3, [c3], wm3); // transparent → Q=D=H
  // Remove LE wire (LE→0): hold state; D still connected to VCC, but latch holds
  // Since we can't easily remove a wire, just verify with LE low from start:
  const { world: w4, chip: c4, wm: wm4 } = setupChipWithPower('74x373');
  // LE=L: hold; D all H but Q should stay 0 (never latched)
  connectPinsHigh(wm4, c4, ['1D','2D','3D','4D','5D','6D','7D','8D']);
  connectPinToGnd(wm4, findPin(c4, 'OE')); // OE=L (enabled)
  connectPinToGnd(wm4, findPin(c4, 'LE')); // LE=L (hold)
  const sim4 = new CircuitSimulator();
  sim4.evaluate(w4, [c4], wm4);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim4, c4, `${i}Q`, 0, `74373 LE=L, D=H: ${i}Q=0 (held at 0)`);
}

console.log('  G10d: OE=L, LE=H→L: latched value holds when LE goes low');
{
  const { world, chip, wm } = setupChipWithPower('74x373');
  const leWire = connectPinToVcc(wm, findPin(chip, 'LE'));
  connectPinsHigh(wm, chip, ['1D','3D','5D','7D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, '2D'));
  connectPinToGnd(wm, findPin(chip, '4D'));
  connectPinToGnd(wm, findPin(chip, '6D'));
  connectPinToGnd(wm, findPin(chip, '8D'));
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm); // LE=H: transparent, Q[1,3,5,7]=1
  disconnectWire(wm, leWire);      // LE floats HIGH → need to wire to GND
  connectPinToGnd(wm, findPin(chip, 'LE')); // LE=L: hold
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 1, '74373 LE=H→L: latched 1Q=1 holds');
  assertPinBit(sim, chip, '2Q', 0, '74373 LE=H→L: latched 2Q=0 holds');
  assertPinBit(sim, chip, '3Q', 1, '74373 LE=H→L: latched 3Q=1 holds');
}


// ── G11: 74374 - Octal D Flip Flop (tri state) ───────────────────────────────
// Rising CLK: Q latches D. OE=0 (active LOW): outputs enabled. OE=1: HiZ (0).
// No asynchronous clear.

console.log('\nG11: 74374 - Octal D Flip Flop (tri state)');

console.log('  G11a: OE=H - all Q=0 (HiZ)');
{
  const { world, chip, wm } = setupChipWithPower('74x374');
  connectPinsHigh(wm, chip, ['OE','1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 0, `74374 OE=H → ${i}Q=0 (HiZ)`);
}

console.log('  G11b: OE=L, rising CLK: Q latches D');
{
  const { world, chip, wm } = setupChipWithPower('74x374');
  connectPinsHigh(wm, chip, ['2D','4D','6D','8D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  for (const d of ['1D','3D','5D','7D']) connectPinToGnd(wm, findPin(chip, d)); // odd D=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  for (let i = 1; i <= 8; i++) {
    const expected = (i % 2 === 0) ? 1 : 0; // even D=H
    assertPinBit(sim, chip, `${i}Q`, expected, `74374 latch: ${i}Q=${expected}`);
  }
}

console.log('  G11c: Q holds between clock edges (no change without CLK↑)');
{
  const { world, chip, wm } = setupChipWithPower('74x374');
  connectPinsHigh(wm, chip, ['1D','2D','3D','4D','5D','6D','7D','8D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch all 1s
  sim.evaluate(world, [chip], wm);  // no edge
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 1, `74374 hold: ${i}Q=1`);
}

console.log('  G11d: OE=L then OE=H: outputs go HiZ after latch');
{
  const { world, chip, wm } = setupChipWithPower('74x374');
  connectPinsHigh(wm, chip, ['1D','2D','3D','4D','5D','6D','7D','8D']);
  const oeGnd = connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm); // latch all 1s
  assertPinBit(sim, chip, '1Q', 1, '74374 before OE=H: 1Q=1');
  disconnectWire(wm, oeGnd);
  connectPinsHigh(wm, chip, ['OE']); // disable output
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 0, `74374 OE=H after latch: ${i}Q=0 (HiZ)`);
}


// ── G12: 74541 - Octal Buffer/Line Driver (dual OE, non inverting, tri state)
// OE1=0 AND OE2=0 (both active LOW): Y=A. Any OE HIGH: HiZ (0).

console.log('\nG12: 74541 - Octal Buffer (dual OE)');

console.log('  G12a: OE1=H - all Y=0 (HiZ regardless of OE2)');
{
  const { world, chip, wm } = setupChipWithPower('74x541');
  connectPinsHigh(wm, chip, ['OE1','A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `Y${i}`, 0, `74541 OE1=H → Y${i}=0 (HiZ)`);
}

console.log('  G12b: OE2=H - all Y=0 (HiZ regardless of OE1)');
{
  const { world, chip, wm } = setupChipWithPower('74x541');
  connectPinsHigh(wm, chip, ['OE2','A1','A2','A3','A4','A5','A6','A7','A8']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `Y${i}`, 0, `74541 OE2=H → Y${i}=0 (HiZ)`);
}

console.log('  G12c: OE1=L, OE2=L: Y=A (non inverting)');
{
  const { world, chip, wm } = setupChipWithPower('74x541');
  connectPinsHigh(wm, chip, ['A1','A3','A5','A7']);
  connectPinToGnd(wm, findPin(chip, 'OE1')); // OE1=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'OE2')); // OE2=L (enabled)
  for (const a of ['A2','A4','A6','A8']) connectPinToGnd(wm, findPin(chip, a)); // even A=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    const expected = (i % 2 === 1) ? 1 : 0; // odd A=H
    assertPinBit(sim, chip, `Y${i}`, expected, `74541 Y${i}=${expected}`);
  }
}

console.log('  G12d: OE1=L, OE2=L, all A=L → all Y=L');
{
  const { world, chip, wm } = setupChipWithPower('74x541');
  connectPinToGnd(wm, findPin(chip, 'OE1')); // OE1=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'OE2')); // OE2=L (enabled)
  for (let i = 1; i <= 8; i++) connectPinToGnd(wm, findPin(chip, `A${i}`)); // all A=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `Y${i}`, 0, `74541 A${i}=L → Y${i}=L`);
}


// ── G13: 74573 - Octal D Transparent Latch (tri state, alternate pinout) ──────
// Same logic as 74373 (D_LATCH_OCTAL_TRI); different DIP pin positions.

console.log('\nG13: 74573 - Octal D Transparent Latch (tri state)');

console.log('  G13a: OE=H - all Q=0 (HiZ)');
{
  const { world, chip, wm } = setupChipWithPower('74x573');
  connectPinsHigh(wm, chip, ['OE','LE','1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 0, `74573 OE=H → ${i}Q=0 (HiZ)`);
}

console.log('  G13b: OE=L, LE=H: Q follows D (transparent)');
{
  const { world, chip, wm } = setupChipWithPower('74x573');
  connectPinsHigh(wm, chip, ['LE','2D','4D','6D','8D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  for (const d of ['1D','3D','5D','7D']) connectPinToGnd(wm, findPin(chip, d)); // odd D=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++) {
    const expected = (i % 2 === 0) ? 1 : 0;
    assertPinBit(sim, chip, `${i}Q`, expected, `74573 LE=H: ${i}Q=${expected}`);
  }
}

console.log('  G13c: OE=L, LE=H→L: latched value holds');
{
  const { world, chip, wm } = setupChipWithPower('74x573');
  const leWire = connectPinToVcc(wm, findPin(chip, 'LE'));
  connectPinsHigh(wm, chip, ['1D','3D','5D','7D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  for (const d of ['2D','4D','6D','8D']) connectPinToGnd(wm, findPin(chip, d)); // even D=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm); // LE=H: transparent, Q[1,3,5,7]=1
  disconnectWire(wm, leWire);      // LE floats HIGH → need to wire to GND
  connectPinToGnd(wm, findPin(chip, 'LE')); // LE=L: hold
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, '1Q', 1, '74573 LE→L: 1Q=1 holds');
  assertPinBit(sim, chip, '2Q', 0, '74573 LE→L: 2Q=0 holds');
}


// ── G14: 74574 - Octal D Flip Flop (tri state, alternate pinout) ──────────────
// Same logic as 74374 (D_FF_OCTAL_TRI); different DIP pin positions.

console.log('\nG14: 74574 - Octal D Flip Flop (tri state)');

console.log('  G14a: OE=H - all Q=0 (HiZ), even after latch');
{
  const { world, chip, wm } = setupChipWithPower('74x574');
  connectPinsHigh(wm, chip, ['OE','1D','2D','3D','4D','5D','6D','7D','8D']);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 0, `74574 OE=H → ${i}Q=0 (HiZ)`);
}

console.log('  G14b: OE=L, rising CLK: Q latches D');
{
  const { world, chip, wm } = setupChipWithPower('74x574');
  connectPinsHigh(wm, chip, ['1D','3D','5D','7D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  for (const d of ['2D','4D','6D','8D']) connectPinToGnd(wm, findPin(chip, d)); // even D=L
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  for (let i = 1; i <= 8; i++) {
    const expected = (i % 2 === 1) ? 1 : 0;
    assertPinBit(sim, chip, `${i}Q`, expected, `74574 latch: ${i}Q=${expected}`);
  }
}

console.log('  G14c: Q holds between clock edges');
{
  const { world, chip, wm } = setupChipWithPower('74x574');
  connectPinsHigh(wm, chip, ['1D','2D','3D','4D','5D','6D','7D','8D']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  pulseClock(sim, world, chip, wm);
  sim.evaluate(world, [chip], wm);
  for (let i = 1; i <= 8; i++)
    assertPinBit(sim, chip, `${i}Q`, 1, `74574 hold: ${i}Q=1`);
}


// ── G15: 74595 - 8 bit Shift Register with Output Latch ──────────────────────
// SR: 8 bit internal shift register. OR: output register (drives QA..QH).
// SRCLR=0 (active LOW): async clears SR only.
// SRCLK rising: shifts SER into SR[0] (QA-side); SR shifts toward QH.
// RCLK rising: copies SR to OR (visible on QA..QH).
// OE=0 (active LOW): QA..QH driven from OR. OE=1: HiZ (0).
// QHs always reflects SR[7] (last shift stage, not tri stated).

console.log('\nG15: 74595 - 8 bit Shift Register with Output Latch');

console.log('  G15a: SRCLR=L - SR cleared; QHs=0; QA-QH=0 (OR unchanged=0)');
{
  const { world, chip, wm } = setupChipWithPower('74x595');
  connectPinToGnd(wm, findPin(chip, 'SRCLR')); // SRCLR=L (active clear)
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (outputs enabled)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q,   0, `74595 SRCLR=L → ${q}=0`);
  assertPinBit(sim, chip, 'QHs', 0, '74595 SRCLR=L → QHs=0');
}

console.log('  G15b: SRCLK rising shifts SER=H into SR; QHs reflects SR[7]');
{
  const { world, chip, wm } = setupChipWithPower('74x595');
  connectPinsHigh(wm, chip, ['SRCLR','SER']); // SRCLR=H(no clear), SER=H
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK=L (no output update)
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // After 8 SRCLK pulses: SR is all 1s; QHs=SR[7]=1 (last shifted in bit)
  for (let i = 0; i < 8; i++) pulseClock(sim, world, chip, wm, 'SRCLK');
  assertPinBit(sim, chip, 'QHs', 1, '74595 8 shifts SER=H: SR[7]=QHs=1');
  // QA-QH still reflect OR (which hasn't been updated via RCLK) → still 0
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74595 no RCLK: ${q}=0 (OR=0)`);
}

console.log('  G15c: RCLK rising copies SR to OR (makes QA-QH visible)');
{
  const { world, chip, wm } = setupChipWithPower('74x595');
  connectPinsHigh(wm, chip, ['SRCLR','SER']); // SER=H
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const rclkGnd15c = connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK=L initially
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) pulseClock(sim, world, chip, wm, 'SRCLK');
  disconnectWire(wm, rclkGnd15c); // free RCLK before pulsing
  pulseClock(sim, world, chip, wm, 'RCLK'); // copy SR (all 1s) → OR
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 1, `74595 after RCLK: ${q}=1`);
}

console.log('  G15d: OE=H - QA-QH are HiZ (0); QHs still reflects SR');
{
  const { world, chip, wm } = setupChipWithPower('74x595');
  connectPinsHigh(wm, chip, ['SRCLR','SER','OE']); // OE=H(disabled)
  const rclkGnd15d = connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK=L initially
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) pulseClock(sim, world, chip, wm, 'SRCLK');
  disconnectWire(wm, rclkGnd15d);
  pulseClock(sim, world, chip, wm, 'RCLK');
  for (const q of ['QA','QB','QC','QD','QE','QF','QG','QH'])
    assertPinBit(sim, chip, q, 0, `74595 OE=H → ${q}=0 (HiZ)`);
  // QHs is not tri stated: still reflects SR[7]=1
  assertPinBit(sim, chip, 'QHs', 1, '74595 OE=H: QHs=1 (SR[7] always active)');
}

console.log('  G15e: Shift one 1 through: after n SRCLK QHs becomes 1 after 8 clocks');
{
  const { world, chip, wm } = setupChipWithPower('74x595');
  connectPinsHigh(wm, chip, ['SRCLR']); // SRCLR=H
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const serGnd = connectPinToGnd(wm, findPin(chip, 'SER')); // SER=L initially
  connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK=L
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK')); // SRCLK=L initially
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // Shift in one 1 bit: connect SER=H, pulse SRCLK once, then disconnect SER
  disconnectWire(wm, serGnd); // remove GND before VCC
  const serWire = connectPinToVcc(wm, findPin(chip, 'SER'));
  disconnectWire(wm, srclkGnd);
  pulseClock(sim, world, chip, wm, 'SRCLK'); // SR=[1,0,0,0,0,0,0,0]
  srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
  sim.evaluate(world, [chip], wm);
  disconnectWire(wm, serWire); // SER→floating
  connectPinToGnd(wm, findPin(chip, 'SER')); // SER=L for subsequent clocks
  sim.evaluate(world, [chip], wm);
  // SR[0]=newest, SR[7]=oldest. After 1st pulse: SR=[1,0,0,0,0,0,0,0], QHs=SR[7]=0
  assertPinBit(sim, chip, 'QHs', 0, '74595 after 1 shift: QHs=SR[7]=0');
  // 7 more shifts with SER=0: the 1 propagates to SR[7]
  for (let i = 0; i < 7; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  assertPinBit(sim, chip, 'QHs', 1, '74595 after 8 shifts: QHs=1 (1 reached SR[7])');
}

console.log('  G15f: SRCLR clears SR but not OR; old OR value persists until RCLK');
{
  const { world, chip, wm } = setupChipWithPower('74x595');
  // Capture the SRCLR wire so we can release it later to simulate SRCLR going LOW
  const [srclrWire, serWire] = connectPinsHigh(wm, chip, ['SRCLR','SER']);
  connectPinToGnd(wm, findPin(chip, 'OE')); // OE=L (enabled)
  const rclkGnd15f = connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK=L initially
  let srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK')); // SRCLK=L initially
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    disconnectWire(wm, srclkGnd);
    pulseClock(sim, world, chip, wm, 'SRCLK');
    srclkGnd = connectPinToGnd(wm, findPin(chip, 'SRCLK'));
    sim.evaluate(world, [chip], wm);
  }
  disconnectWire(wm, rclkGnd15f);
  pulseClock(sim, world, chip, wm, 'RCLK'); // OR=all 1s
  connectPinToGnd(wm, findPin(chip, 'RCLK')); // RCLK back to GND
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QA', 1, '74595 OR latched with 1s');
  // Clear SR by releasing SRCLR and wiring to GND
  disconnectWire(wm, srclrWire);
  connectPinToGnd(wm, findPin(chip, 'SRCLR')); // SRCLR=L (active clear)
  sim.evaluate(world, [chip], wm);
  assertPinBit(sim, chip, 'QHs', 0, '74595 SRCLR=L: SR cleared → QHs=SR[7]=0');
  assertPinBit(sim, chip, 'QA',  1, '74595 SRCLR=L: OR unchanged → QA=1');
}


// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) process.exit(1);
