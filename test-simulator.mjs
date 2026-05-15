// ── Simulator Integration Tests ───────────────────────────────────────────────
// Tests the full pipeline: chip placement → wiring → netlist → simulation → voltages/LEDs
// Matches the user's exact scenario: 7432 OR gate with inputs to VCC, output to LED.

import { BreadboardWorld } from './js/breadboard.js';
import { holeId } from './js/breadboard.js';
import { ChipComponent, LEDComponent, SevenSegComponent, SwitchComponent, ResistorComponent } from './js/components.js';
import { WireManager } from './js/wire.js';
import { CircuitSimulator } from './js/simulator.js';
import { resetWireCounter } from './js/wire.js';

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ ${msg}`); }
}

/** Assert voltage is approximately equal (within tolerance, default 0.1V) */
function assertApprox(actual, expected, msg, tol = 0.1) {
  if (actual !== undefined && Math.abs(actual - expected) < tol) {
    pass++; console.log(`  ✓ ${msg}`);
  } else {
    fail++; console.error(`  ✗ ${msg}`);
  }
}

/** Assert voltage is HIGH (> 2.5V) */
function assertHigh(v, msg) {
  if (v !== undefined && v > 2.5) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ ${msg}`); }
}

/** Assert voltage is LOW (< 2.5V, including 0V or undefined) */
function assertLow(v, msg) {
  if (v === undefined || v < 2.5) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ ${msg}`); }
}

function findPin(comp, name) {
  return typeof comp.getPinByName === 'function'
    ? comp.getPinByName(name)
    : comp.pins.find(pin => pin.name === name);
}

function wirePinToVcc(wm, pin) {
  wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId);
}

function wirePinToGnd(wm, pin) {
  wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId);
}

function wirePins(wm, fromPin, toPin) {
  wm.addWire(fromPin.holeId, toPin.holeId);
}

function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}

/** Helper: place a chip at col 10 on tile (0,0) and wire VCC + GND */
function setupChipWithPower(chipId) {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent(chipId);
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();

  wirePinToVcc(wm, findPin(chip, 'VCC'));
  wirePinToGnd(wm, findPin(chip, 'GND'));

  return { world, chip, wm };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 0: Verify chip pin positions
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 0: Chip pin placement');
{
  const chip = new ChipComponent('7432');
  chip.place(0, 0, 10, 4);

  const pin1 = chip.getPinByName('1A');
  const pin2 = chip.getPinByName('1B');
  const pin3 = chip.getPinByName('1Y');
  const pin7 = chip.getPinByName('GND');
  const pin14 = chip.getPinByName('VCC');

  // New layout: VCC top-left, GND bottom-right, signal pins on bottom row
  assert(pin14.holeId === holeId(0,0,'main',10,4), `VCC at col=10 row=4 (top half, got ${pin14.holeId})`);
  assert(pin1.holeId  === holeId(0,0,'main',10,5), `pin 1A at col=10 row=5 (bottom half, got ${pin1.holeId})`);
  assert(pin2.holeId  === holeId(0,0,'main',11,5), `pin 1B at col=11 row=5 (got ${pin2.holeId})`);
  assert(pin3.holeId  === holeId(0,0,'main',12,5), `pin 1Y at col=12 row=5 (got ${pin3.holeId})`);
  assert(pin7.holeId  === holeId(0,0,'main',16,5), `GND at col=16 row=5 (bottom-right, got ${pin7.holeId})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Netlist connects power pins correctly
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 1: Netlist power pin connectivity');
{
  const { world, chip, wm } = setupChipWithPower('7432');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vccPin = chip.getPinByName('VCC');
  const gndPin = chip.getPinByName('GND');
  const vccNet = sim.netlist.findNetByHole(vccPin.holeId);
  const gndNet = sim.netlist.findNetByHole(gndPin.holeId);

  assert(vccNet !== null, 'VCC pin is on a net');
  assert(gndNet !== null, 'GND pin is on a net');

  if (vccNet) {
    assert(vccNet.isVCC, `VCC net is tagged isVCC (net ${vccNet.id}, holes: ${vccNet.holes.size})`);
    const v = sim.netVoltages.get(vccNet.id);
    assert(v !== undefined && Math.abs(v - 5) < 0.01, `VCC net voltage ≈ 5V (got ${v})`);
  }
  if (gndNet) {
    assert(gndNet.isGND, `GND net is tagged isGND (net ${gndNet.id}, holes: ${gndNet.holes.size})`);
    const v = sim.netVoltages.get(gndNet.id);
    assert(v === 0, `GND net voltage = 0V (got ${v})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: 7432 OR gate - both inputs HIGH → output HIGH (user's exact scenario)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 2: 7432 OR gate - both inputs VCC → output 5V');
{
  const { world, chip, wm } = setupChipWithPower('7432');

  // Wire VCC to pin 1A (col 10, bottom half) and pin 1B (col 11, bottom half)
  wm.addWire(holeId(0,0,'power',12,1), holeId(0,0,'main',10,7)); // VCC → col 10 bottom strip → pin 1A
  wm.addWire(holeId(0,0,'power',13,1), holeId(0,0,'main',11,7)); // VCC → col 11 bottom strip → pin 1B

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  // Check input pin voltages
  const pin1Net = sim.netlist.findNetByHole(chip.getPinByName('1A').holeId);
  const pin2Net = sim.netlist.findNetByHole(chip.getPinByName('1B').holeId);
  const v1 = pin1Net ? sim.netVoltages.get(pin1Net.id) : undefined;
  const v2 = pin2Net ? sim.netVoltages.get(pin2Net.id) : undefined;
  assert(v1 !== undefined && Math.abs(v1 - 5) < 0.01, `Input 1A voltage ≈ 5V (got ${v1})`);
  assert(v2 !== undefined && Math.abs(v2 - 5) < 0.01, `Input 1B voltage ≈ 5V (got ${v2})`);

  // Check output pin voltage (Norton model: ~4.998V, not exact 5)
  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  assertApprox(vOut, 5, `Output 1Y voltage ≈ 5V (got ${vOut}), OR(1,1) = 1`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: 7404 NOT gate - floating input → TTL float=HIGH → NOT(1) = LOW
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 3: 7404 NOT gate - floating input (TTL pull up → HIGH) → LOW output');
{
  const { world, chip, wm } = setupChipWithPower('7404');
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  // Floating TTL input → weak pull up → reads HIGH → NOT(1) = 0
  assertLow(vOut, `NOT(floating=HIGH) output ≈ 0V (got ${vOut})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: 7408 AND gate - both HIGH → HIGH; one LOW → LOW
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 4: 7408 AND gate - both inputs VCC → output 5V');
{
  const { world, chip, wm } = setupChipWithPower('7408');

  // Wire both inputs to VCC (bottom half)
  wm.addWire(holeId(0,0,'power',12,1), holeId(0,0,'main',10,7)); // VCC → 1A
  wm.addWire(holeId(0,0,'power',13,1), holeId(0,0,'main',11,7)); // VCC → 1B

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  assertApprox(vOut, 5, `AND(1,1) output ≈ 5V (got ${vOut})`);
}

console.log('\nTest 4b: 7408 AND gate - one input floating (TTL=HIGH) → output HIGH');
{
  const { world, chip, wm } = setupChipWithPower('7408');

  // Wire only 1A to VCC (bottom half), leave 1B floating (TTL pull up → HIGH)
  wm.addWire(holeId(0,0,'power',12,1), holeId(0,0,'main',10,7));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  // Floating TTL input → weak pull up → HIGH → AND(1,1) = 1
  assertHigh(vOut, `AND(1,floating=HIGH) output ≈ 5V (got ${vOut})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: 7400 NAND gate - all 4 input combos
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 5: 7400 NAND gate - truth table (explicit LOW via GND)');
{
  // NAND(0,0)=1, NAND(0,1)=1, NAND(1,0)=1, NAND(1,1)=0
  // Wire inputs to GND explicitly for LOW (TTL floating=HIGH would change results)
  const cases = [
    { a: false, b: false, expectHigh: true,  label: 'NAND(0,0)=1 → HIGH' },
    { a: false, b: true,  expectHigh: true,  label: 'NAND(0,1)=1 → HIGH' },
    { a: true,  b: false, expectHigh: true,  label: 'NAND(1,0)=1 → HIGH' },
    { a: true,  b: true,  expectHigh: false, label: 'NAND(1,1)=0 → LOW' },
  ];

  for (const tc of cases) {
    const { world, chip, wm } = setupChipWithPower('7400');
    if (tc.a) {
      wm.addWire(holeId(0,0,'power',12,1), holeId(0,0,'main',10,7)); // VCC → 1A
    } else {
      wm.addWire(holeId(0,0,'power',10,0), holeId(0,0,'main',10,7)); // GND → 1A
    }
    if (tc.b) {
      wm.addWire(holeId(0,0,'power',13,1), holeId(0,0,'main',11,7)); // VCC → 1B
    } else {
      wm.addWire(holeId(0,0,'power',11,0), holeId(0,0,'main',11,7)); // GND → 1B
    }

    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);

    const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
    const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
    if (tc.expectHigh) {
      assertHigh(vOut, tc.label + ` (got ${vOut})`);
    } else {
      assertLow(vOut, tc.label + ` (got ${vOut})`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: LED lights from chip output
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 6: OR output drives LED');
{
  const { world, chip, wm } = setupChipWithPower('7432');

  // Wire inputs to VCC (pins on bottom half)
  wm.addWire(holeId(0,0,'power',12,1), holeId(0,0,'main',10,7)); // VCC → 1A
  wm.addWire(holeId(0,0,'power',13,1), holeId(0,0,'main',11,7)); // VCC → 1B

  // LED: anode at (30,7=bottom half), cathode at (32,7=bottom half)
  const led = new LEDComponent();
  led.placeWireLike(holeId(0,0,'main',30,7), holeId(0,0,'main',32,7));

  // Wire chip output (1Y at col 12, bottom half) to LED anode
  wm.addWire(holeId(0,0,'main',12,7), holeId(0,0,'main',30,7)); // output strip → LED anode
  // Wire LED cathode to GND
  wm.addWire(holeId(0,0,'power',32,0), holeId(0,0,'main',32,6)); // GND → cathode strip (bottom half)

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, led], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  // With Norton model, output loaded by LED won't be exactly 5V - check LED lit instead
  assert(vOut !== undefined && vOut > 0, `OR output > 0V (driving LED) (got ${vOut})`);
  assert(led.lit === true, `LED is lit (got ${led.lit})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: Switch toggles chip input
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 7: Switch controls NOT gate input');
{
  const { world, chip, wm } = setupChipWithPower('7404');

  // Switch between VCC rail and chip input 1A (pin 1 now at bottom half col 10)
  const sw = new SwitchComponent();
  sw.placeWireLike(holeId(0,0,'main',5,7), holeId(0,0,'main',10,7));
  // Wire VCC to switch input side (bottom half col 5)
  wm.addWire(holeId(0,0,'power',5,1), holeId(0,0,'main',5,6));

  // Switch OFF → input floating → TTL pull up → HIGH → NOT(1) = LOW
  sw.on = false;
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, sw], wm);

  let outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  let vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  assertLow(vOut, `Switch OFF: NOT(floating=HIGH) ≈ 0V (got ${vOut})`);

  // Switch ON → input HIGH → NOT output = LOW
  sw.on = true;
  sim.evaluate(world, [chip, sw], wm);

  outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  assertLow(vOut, `Switch ON: NOT(1) ≈ 0V (got ${vOut})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 8: Cascaded chips - NOT → NOT = buffer
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 8: Cascaded NOT gates (buffer)');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();

  const chip1 = new ChipComponent('7404');
  chip1.place(0, 0, 5, 4);
  const chip2 = new ChipComponent('7404');
  chip2.place(0, 0, 20, 4);

  const wm = new WireManager();

  // Power chip1: VCC now at top half col=5, GND now at bottom half col=11
  wm.addWire(holeId(0,0,'power',5,1), holeId(0,0,'main',5,1));
  wm.addWire(holeId(0,0,'power',11,0), holeId(0,0,'main',11,7));

  // Power chip2: VCC now at top half col=20, GND now at bottom half col=26
  wm.addWire(holeId(0,0,'power',20,1), holeId(0,0,'main',20,1));
  wm.addWire(holeId(0,0,'power',26,0), holeId(0,0,'main',26,7));

  // chip1 output 1Y (pin 2) is now at bottom half: anchor=5, i=8 → col=6, row=5
  // chip2 input 1A (pin 1) is now at bottom half: anchor=20, i=7 → col=20, row=5
  wm.addWire(holeId(0,0,'main',6,7), holeId(0,0,'main',20,7));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip1, chip2], wm);

  // Chip1 input floating → TTL pull up → HIGH → NOT(1) = LOW
  const out1Net = sim.netlist.findNetByHole(chip1.getPinByName('1Y').holeId);
  const v1 = out1Net ? sim.netVoltages.get(out1Net.id) : undefined;
  assertLow(v1, `Chip1 NOT(floating=HIGH) ≈ 0V (got ${v1})`);

  // Chip2 input = LOW (from chip1) → NOT(0) = HIGH
  const out2Net = sim.netlist.findNetByHole(chip2.getPinByName('1Y').holeId);
  const v2 = out2Net ? sim.netVoltages.get(out2Net.id) : undefined;
  assertHigh(v2, `Chip2 NOT(NOT(floating)) ≈ 5V (got ${v2})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 9: Chip without power doesn't evaluate
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 9: Chip without power pins connected');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const chip = new ChipComponent('7404');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();

  // No power wires - chip should NOT evaluate
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  assert(vOut === undefined, `No power: output is floating (got ${vOut})`);
}

console.log('\nTest 9b: Only VCC, no GND → chip should NOT evaluate');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const chip = new ChipComponent('7404');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();

  // Wire only VCC (no GND) - VCC now at top half col 10
  wm.addWire(holeId(0,0,'power',10,1), holeId(0,0,'main',10,1));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  assert(vOut === undefined, `Only VCC: output is floating (got ${vOut})`);
}

console.log('\nTest 9c: Only GND, no VCC → chip should NOT evaluate');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const chip = new ChipComponent('7404');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();

  // Wire only GND (no VCC) - GND now at bottom half col 16
  wm.addWire(holeId(0,0,'power',16,0), holeId(0,0,'main',16,7));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  // With MNA, floating nodes get ~0V via leak conductance to GND reference
  assert(vOut === undefined || vOut === 0, `Only GND: output is floating/0V (got ${vOut})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 10: addWireSmart wiring (UI code path)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 10: addWireSmart - full OR gate circuit (UI path)');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const chip = new ChipComponent('7432');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();

  // Using addWireSmart (same as UI interaction handler)
  // Wire VCC to chip VCC pin (pin 14 now at top half col 10)
  wm.addWireSmart(holeId(0,0,'power',10,1), holeId(0,0,'main',10,1), world);
  // Wire GND to chip GND pin (pin 7 now at bottom half col 16)
  wm.addWireSmart(holeId(0,0,'power',16,0), holeId(0,0,'main',16,7), world);
  // Wire VCC to both inputs (pin 1A at bottom half col 10, pin 1B at bottom half col 11)
  wm.addWireSmart(holeId(0,0,'power',12,1), holeId(0,0,'main',10,7), world);
  wm.addWireSmart(holeId(0,0,'power',13,1), holeId(0,0,'main',11,7), world);

  // LED: anode at (30,7), cathode at (32,7) - bottom half
  const led = new LEDComponent();
  led.placeWireLike(holeId(0,0,'main',30,7), holeId(0,0,'main',32,7));

  // Wire chip output (pin 1Y at bottom half col 12) to LED anode
  wm.addWireSmart(holeId(0,0,'main',12,7), holeId(0,0,'main',30,7), world);
  // Wire LED cathode to GND
  wm.addWireSmart(holeId(0,0,'power',32,0), holeId(0,0,'main',32,7), world);

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, led], wm);

  const outNet = sim.netlist.findNetByHole(chip.getPinByName('1Y').holeId);
  const vOut = outNet ? sim.netVoltages.get(outNet.id) : undefined;
  assert(vOut !== undefined && vOut > 0, `addWireSmart: OR(1,1) output > 0V (got ${vOut})`);
  assert(led.lit === true, `addWireSmart: LED is lit (got ${led.lit})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 11: MNA - Voltage divider (1kΩ + 1kΩ → midpoint = 2.5V)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 11: MNA voltage divider - 1kΩ + 1kΩ → 2.5V midpoint');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const wm = new WireManager();

  // R1: VCC rail (col 5) → col 20 (top half)
  const r1 = new ResistorComponent(1000);
  r1.placeWireLike(holeId(0,0,'main',5,2), holeId(0,0,'main',20,2));

  // R2: col 20 (top half) → col 40 (top half)
  const r2 = new ResistorComponent(1000);
  r2.placeWireLike(holeId(0,0,'main',20,3), holeId(0,0,'main',40,3));

  // Wire VCC rail to R1 start
  wm.addWire(holeId(0,0,'power',5,1), holeId(0,0,'main',5,1));
  // Wire R2 end to GND rail
  wm.addWire(holeId(0,0,'power',40,0), holeId(0,0,'main',40,1));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [r1, r2], wm);

  // Midpoint net (col 20 strip) should be ~2.5V
  const midNet = sim.netlist.findNetByHole(holeId(0,0,'main',20,2));
  const vMid = midNet ? sim.netVoltages.get(midNet.id) : undefined;
  assert(vMid !== undefined && Math.abs(vMid - 2.5) < 0.01,
    `Voltage divider midpoint = 2.5V (got ${vMid !== undefined ? vMid.toFixed(4) : 'undefined'})`);

  // R1 current = 5V / 2000Ω = 2.5mA
  const i1 = sim.getComponentCurrent(r1.id);
  assert(Math.abs(i1 - 0.0025) < 0.0001,
    `R1 current = 2.5mA (got ${(i1 * 1000).toFixed(4)}mA)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 12: MNA - Unequal divider (1kΩ + 2kΩ → 3.333V midpoint)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 12: MNA voltage divider - 1kΩ + 2kΩ → 3.333V');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const wm = new WireManager();

  const r1 = new ResistorComponent(1000);
  r1.placeWireLike(holeId(0,0,'main',5,2), holeId(0,0,'main',20,2));
  const r2 = new ResistorComponent(2000);
  r2.placeWireLike(holeId(0,0,'main',20,3), holeId(0,0,'main',40,3));

  wm.addWire(holeId(0,0,'power',5,1), holeId(0,0,'main',5,1));
  wm.addWire(holeId(0,0,'power',40,0), holeId(0,0,'main',40,1));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [r1, r2], wm);

  const midNet = sim.netlist.findNetByHole(holeId(0,0,'main',20,2));
  const vMid = midNet ? sim.netVoltages.get(midNet.id) : undefined;
  // V_mid = 5 * 2000/(1000+2000) = 3.333...
  assert(vMid !== undefined && Math.abs(vMid - 10/3) < 0.01,
    `Unequal divider midpoint = 3.333V (got ${vMid !== undefined ? vMid.toFixed(4) : 'undefined'})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 13: MNA - LED as resistor in MNA (VCC → LED → GND)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 13: MNA - LED direct VCC to GND');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const wm = new WireManager();

  const led = new LEDComponent();
  led.placeWireLike(holeId(0,0,'main',10,2), holeId(0,0,'main',30,2));

  // Wire VCC to LED anode
  wm.addWire(holeId(0,0,'power',10,1), holeId(0,0,'main',10,1));
  // Wire LED cathode to GND
  wm.addWire(holeId(0,0,'power',30,0), holeId(0,0,'main',30,1));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [led], wm);

  assert(led.lit === true, `LED is lit when VCC → LED → GND (got ${led.lit})`);
  // LED current with VF model: V_anode = (G_VCC*5 + VF*G_LED)/(G_VCC+G_LED) ≈ 4.79V
  // I_led = (V_anode - VF) / R_LED = (4.79 - 2) / 33 ≈ 84.5mA  (realistic, no series resistor)
  const iLed = sim.getComponentCurrent(led.id);
  assert(Math.abs(iLed - 0.0845) < 0.005,
    `LED current ≈ 84.5mA (got ${(iLed * 1000).toFixed(1)}mA)`);}

// ─────────────────────────────────────────────────────────────────────────────
// Test 14: MNA - VCC → 470Ω → LED → GND
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 14: MNA - VCC → 470Ω → LED → GND');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const wm = new WireManager();

  const r1 = new ResistorComponent(470);
  r1.placeWireLike(holeId(0,0,'main',5,2), holeId(0,0,'main',20,2));
  const led = new LEDComponent();
  led.placeWireLike(holeId(0,0,'main',20,3), holeId(0,0,'main',40,3));

  wm.addWire(holeId(0,0,'power',5,1), holeId(0,0,'main',5,1));
  wm.addWire(holeId(0,0,'power',40,0), holeId(0,0,'main',40,1));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [r1, led], wm);

  // Midpoint voltage with VF model:
  // V_mid = (G_R*5 + VF*G_LED) / (G_R + G_LED)
  //       = (5/470 + 2*(1/33)) / (1/470 + 1/33) ≈ 2.198V  (~6mA, realistic)
  const midNet = sim.netlist.findNetByHole(holeId(0,0,'main',20,2));
  const vMid = midNet ? sim.netVoltages.get(midNet.id) : undefined;
  const G_R_470 = 1 / 470;
  const G_LED_INV = 1 / 33;
  const expected = (G_R_470 * 5 + 2 * G_LED_INV) / (G_R_470 + G_LED_INV);
  assert(vMid !== undefined && Math.abs(vMid - expected) < 0.05,
    `Junction voltage = ${expected.toFixed(4)}V (got ${vMid !== undefined ? vMid.toFixed(4) : 'undefined'})`);
  assert(led.lit === true, `LED is lit (got ${led.lit})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 15: MNA - Switch open disconnects LED
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 15: MNA - Open switch disconnects resistor-LED path');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const wm = new WireManager();

  // VCC → switch → 470Ω → LED → GND
  const sw = new SwitchComponent();
  sw.placeWireLike(holeId(0,0,'main',5,2), holeId(0,0,'main',15,2));
  const r1 = new ResistorComponent(470);
  r1.placeWireLike(holeId(0,0,'main',15,3), holeId(0,0,'main',25,3));
  const led = new LEDComponent();
  led.placeWireLike(holeId(0,0,'main',25,4), holeId(0,0,'main',35,4));

  wm.addWire(holeId(0,0,'power',5,1), holeId(0,0,'main',5,1));
  wm.addWire(holeId(0,0,'power',35,0), holeId(0,0,'main',35,1));

  // Switch OFF
  sw.on = false;
  const sim = new CircuitSimulator();
  sim.evaluate(world, [sw, r1, led], wm);
  assert(led.lit === false, `Switch OFF: LED is off (got ${led.lit})`);

  // Switch ON
  sw.on = true;
  sim.evaluate(world, [sw, r1, led], wm);
  assert(led.lit === true, `Switch ON: LED is on (got ${led.lit})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 16: MNA - Parallel resistors (500Ω || 500Ω = 250Ω)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 16: MNA - Parallel resistors 500Ω || 500Ω');
{
  const world = new BreadboardWorld(1, 1);
  resetWireCounter();
  const wm = new WireManager();

  // Two 500Ω resistors in parallel from VCC to GND
  // They share the same two net endpoints → stamp adds up
  const r1 = new ResistorComponent(500);
  r1.placeWireLike(holeId(0,0,'main',10,0), holeId(0,0,'main',30,0));
  const r2 = new ResistorComponent(500);
  r2.placeWireLike(holeId(0,0,'main',10,2), holeId(0,0,'main',30,2));

  wm.addWire(holeId(0,0,'power',10,1), holeId(0,0,'main',10,1));
  wm.addWire(holeId(0,0,'power',30,0), holeId(0,0,'main',30,1));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [r1, r2], wm);

  // Each carries 5/500 = 10mA
  const i1 = sim.getComponentCurrent(r1.id);
  const i2 = sim.getComponentCurrent(r2.id);
  assert(Math.abs(i1 - 0.01) < 0.001, `R1 current = 10mA (got ${(i1*1000).toFixed(2)}mA)`);
  assert(Math.abs(i2 - 0.01) < 0.001, `R2 current = 10mA (got ${(i2*1000).toFixed(2)}mA)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 17: 7410 - Triple 3 input NAND truth table
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 17: 7410 3 input NAND - truth table');
{
  const cases = [
    { inputs: [0, 0, 0], expectHigh: true,  label: 'NAND(0,0,0)=1' },
    { inputs: [1, 0, 1], expectHigh: true,  label: 'NAND(1,0,1)=1' },
    { inputs: [1, 1, 1], expectHigh: false, label: 'NAND(1,1,1)=0' },
  ];

  for (const tc of cases) {
    const { world, chip, wm } = setupChipWithPower('7410');
    const inputPins = ['1A', '1B', '1C'].map(name => findPin(chip, name));
    tc.inputs.forEach((bit, index) => {
      if (bit) wirePinToVcc(wm, inputPins[index]);
      else wirePinToGnd(wm, inputPins[index]);
    });

    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);

    const vOut = getPinVoltage(sim, findPin(chip, '1Y'));
    if (tc.expectHigh) {
      assertHigh(vOut, `${tc.label} (got ${vOut})`);
    } else {
      assertLow(vOut, `${tc.label} (got ${vOut})`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 18: 7420 - Dual 4 input NAND truth table
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 18: 7420 4 input NAND - truth table');
{
  const cases = [
    { inputs: [0, 0, 0, 0], expectHigh: true,  label: 'NAND(0,0,0,0)=1' },
    { inputs: [1, 1, 1, 0], expectHigh: true,  label: 'NAND(1,1,1,0)=1' },
    { inputs: [1, 1, 1, 1], expectHigh: false, label: 'NAND(1,1,1,1)=0' },
  ];

  for (const tc of cases) {
    const { world, chip, wm } = setupChipWithPower('7420');
    const inputPins = ['1A', '1B', '1C', '1D'].map(name => findPin(chip, name));
    tc.inputs.forEach((bit, index) => {
      if (bit) wirePinToVcc(wm, inputPins[index]);
      else wirePinToGnd(wm, inputPins[index]);
    });

    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);

    const vOut = getPinVoltage(sim, findPin(chip, '1Y'));
    if (tc.expectHigh) {
      assertHigh(vOut, `${tc.label} (got ${vOut})`);
    } else {
      assertLow(vOut, `${tc.label} (got ${vOut})`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 19: 7448 - BCD to 7-seg decoder drives common-cathode display
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 19: 7448 drives common-cathode 7-segment display');
{
  const digitCases = [
    { value: 2, on: ['a', 'b', 'd', 'e', 'g'], off: ['c', 'f'] },
    { value: 8, on: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], off: [] },
  ];

  for (const tc of digitCases) {
    const { world, chip, wm } = setupChipWithPower('7448');
    const display = new SevenSegComponent(false, 'CC-7SEG');
    display.place(0, 0, 30, 2);

    wirePinToGnd(wm, findPin(display, 'COM1'));
    wirePinToGnd(wm, findPin(display, 'COM2'));

    ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(seg => {
      wirePins(wm, findPin(chip, seg), findPin(display, seg));
    });

    if (tc.value & 1) wirePinToVcc(wm, findPin(chip, 'A'));
    else wirePinToGnd(wm, findPin(chip, 'A'));
    if (tc.value & 2) wirePinToVcc(wm, findPin(chip, 'B'));
    else wirePinToGnd(wm, findPin(chip, 'B'));
    if (tc.value & 4) wirePinToVcc(wm, findPin(chip, 'C'));
    else wirePinToGnd(wm, findPin(chip, 'C'));
    if (tc.value & 8) wirePinToVcc(wm, findPin(chip, 'D'));
    else wirePinToGnd(wm, findPin(chip, 'D'));

    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip, display], wm);

    for (const seg of tc.on) {
      assert(display.segments[seg] === 1, `7448 digit ${tc.value}: segment ${seg} is on`);
    }
    for (const seg of tc.off) {
      assert(display.segments[seg] === 0, `7448 digit ${tc.value}: segment ${seg} is off`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 20: 74138 - Active low 3-to-8 decoder
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 20: 74138 active low decoder outputs');
{
  const { world, chip, wm } = setupChipWithPower('74138');

  wirePinToVcc(wm, findPin(chip, 'G1'));
  wirePinToGnd(wm, findPin(chip, 'G2A'));
  wirePinToGnd(wm, findPin(chip, 'G2B'));
  wirePinToVcc(wm, findPin(chip, 'A'));
  wirePinToGnd(wm, findPin(chip, 'B'));
  wirePinToVcc(wm, findPin(chip, 'C'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 8; i++) {
    const pin = findPin(chip, `Y${i}`);
    const vOut = getPinVoltage(sim, pin);
    if (i === 5) {
      assertLow(vOut, `74138 enabled select 5: Y${i} ≈ 0V (got ${vOut})`);
    } else {
      assertHigh(vOut, `74138 enabled select 5: Y${i} ≈ 5V (got ${vOut})`);
    }
  }
}

console.log('\nTest 20b: 74138 disabled → all outputs HIGH');
{
  const { world, chip, wm } = setupChipWithPower('74138');

  // G1=LOW → disabled
  wirePinToGnd(wm, findPin(chip, 'G1'));
  wirePinToVcc(wm, findPin(chip, 'A'));
  wirePinToVcc(wm, findPin(chip, 'B'));
  wirePinToVcc(wm, findPin(chip, 'C'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  for (let i = 0; i < 8; i++) {
    const vOut = getPinVoltage(sim, findPin(chip, `Y${i}`));
    assertHigh(vOut, `74138 disabled: Y${i} ≈ 5V (got ${vOut})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 21: Common-cathode 7-seg with floating COM pins → all segments OFF
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 21: CC 7-seg with unconnected COM pins stays off');
{
  const world = new BreadboardWorld(1, 1);
  const display = new SevenSegComponent(false, 'CC-7SEG');
  display.place(0, 0, 30, 4);
  const wm = new WireManager();
  resetWireCounter();

  // Drive all segment pins HIGH but leave COM1/COM2 completely unconnected
  for (const seg of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp']) {
    wirePinToVcc(wm, findPin(display, seg));
  }

  const sim = new CircuitSimulator();
  sim.evaluate(world, [display], wm);

  for (const seg of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp']) {
    assert(display.segments[seg] === 0, `CC floating COM: segment ${seg} is off`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 22: Common-anode 7-seg with floating COM pins → all segments OFF
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 22: CA 7-seg with unconnected COM pins stays off');
{
  const world = new BreadboardWorld(1, 1);
  const display = new SevenSegComponent(true, 'CA-7SEG');
  display.place(0, 0, 30, 4);
  const wm = new WireManager();
  resetWireCounter();

  // Drive all segment pins LOW but leave COM1/COM2 completely unconnected
  for (const seg of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp']) {
    wirePinToGnd(wm, findPin(display, seg));
  }

  const sim = new CircuitSimulator();
  sim.evaluate(world, [display], wm);

  for (const seg of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp']) {
    assert(display.segments[seg] === 0, `CA floating COM: segment ${seg} is off`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 23: CC 7-seg with COM wired to GND + one floating segment → that seg OFF
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 23: CC 7-seg with one floating segment pin');
{
  const world = new BreadboardWorld(1, 1);
  const display = new SevenSegComponent(false, 'CC-7SEG');
  display.place(0, 0, 30, 4);
  const wm = new WireManager();
  resetWireCounter();

  wirePinToGnd(wm, findPin(display, 'COM1'));
  wirePinToGnd(wm, findPin(display, 'COM2'));

  // Wire all segments to VCC EXCEPT 'c' (leave floating)
  for (const seg of ['a', 'b', 'd', 'e', 'f', 'g']) {
    wirePinToVcc(wm, findPin(display, seg));
  }

  const sim = new CircuitSimulator();
  sim.evaluate(world, [display], wm);

  for (const seg of ['a', 'b', 'd', 'e', 'f', 'g']) {
    assert(display.segments[seg] === 1, `CC with GND COM: segment ${seg} is on`);
  }
  assert(display.segments['c'] === 0, 'CC with GND COM: floating segment c is off');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 24: CA 7-seg with COM wired to VCC + segments driven (regression)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nTest 24: CA 7-seg with VCC COM + driven segments (regression)');
{
  const world = new BreadboardWorld(1, 1);
  const display = new SevenSegComponent(true, 'CA-7SEG');
  display.place(0, 0, 30, 4);
  const wm = new WireManager();
  resetWireCounter();

  wirePinToVcc(wm, findPin(display, 'COM1'));
  wirePinToVcc(wm, findPin(display, 'COM2'));

  // Drive segments a, b, c to GND (should light), leave d HIGH (should not light)
  for (const seg of ['a', 'b', 'c']) {
    wirePinToGnd(wm, findPin(display, seg));
  }
  wirePinToVcc(wm, findPin(display, 'd'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [display], wm);

  for (const seg of ['a', 'b', 'c']) {
    assert(display.segments[seg] === 1, `CA with VCC COM: segment ${seg} is on`);
  }
  assert(display.segments['d'] === 0, 'CA with VCC COM: HIGH segment d is off');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error('SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED');
}
