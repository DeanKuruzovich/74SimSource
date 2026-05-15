// test-chips67.mjs - Tests for the NE555 Timer IC (chips67.js)
// Validates the analog comparator model: THRESH vs 2/3 VCC, TRIG vs 1/3 VCC,
// internal SR flip-flop, DISCH open-collector, RESETn, and CTRL override.

import { CHIPS_BLOCK_67 } from '../chips/chips67.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent, ResistorComponent, CapacitorComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';
import { DRIVE } from '../constants.js';

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

function wirePinToVcc(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId);
}

function wirePinToGnd(wm, pin) {
  return wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId);
}

function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}

function getPinDrive(sim, comp, pinName) {
  const key = comp.id + ':' + pinName;
  return sim.pinDriveStates.get(key);
}

/** Place 555 at col 10, tile (0,0) and wire VCC + GND. */
function setup555WithPower() {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('555');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  wirePinToVcc(wm, findPin(chip, 'VCC'));
  wirePinToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

/**
 * Create a voltage divider to produce a specific voltage on a target hole.
 * Uses two resistors: VCC → R1 → midpoint → R2 → GND.
 * V_mid = VCC * R2 / (R1 + R2)
 */
function createVoltageDivider(wm, targetHoleId, targetVoltage) {
  const vcc = 5;
  // R2 / (R1 + R2) = targetVoltage / VCC
  // Choose R1 + R2 = 10000 for reasonable values
  const rTotal = 10000;
  const r2Val = (targetVoltage / vcc) * rTotal;
  const r1Val = rTotal - r2Val;

  // R1: VCC rail (col 2) → col 6 (top half, row 2)
  const r1 = new ResistorComponent(r1Val);
  r1.placeWireLike(holeId(0, 0, 'main', 2, 2), holeId(0, 0, 'main', 6, 2));

  // R2: col 6 (row 3) → col 9 (row 3)
  const r2 = new ResistorComponent(r2Val);
  r2.placeWireLike(holeId(0, 0, 'main', 6, 3), holeId(0, 0, 'main', 9, 3));

  // Wire VCC to R1 start
  wm.addWire(holeId(0, 0, 'power', 2, 0), holeId(0, 0, 'main', 2, 1));
  // Wire R2 end to GND
  wm.addWire(holeId(0, 0, 'power', 9, 1), holeId(0, 0, 'main', 9, 1));
  // Wire midpoint to target
  wm.addWire(holeId(0, 0, 'main', 6, 0), targetHoleId);

  return [r1, r2];
}

// ═════════════════════════════════════════════════════════════════════════════
// STRUCTURAL TESTS
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n═══ 555 Timer - Structural Tests ═══');

console.log('\n── Chip definition ──');
{
  const def = CHIPS_BLOCK_67['555'];
  assert(def !== undefined, '555 chip definition exists');
  assert(def.pins === 8, '555 is 8-pin DIP');
  assert(def.vcc === 8, 'VCC is pin 8');
  assert(def.gnd === 1, 'GND is pin 1');
  assert(def.gates.length === 1, 'One gate entry (TIMER_555)');
  assert(def.gates[0].type === 'TIMER_555', 'Gate type is TIMER_555');

  const pinNames = def.pinout.map(p => p.name);
  assert(pinNames.includes('TRIG'), 'Has TRIG pin');
  assert(pinNames.includes('OUT'), 'Has OUT pin');
  assert(pinNames.includes('RESETn'), 'Has RESETn pin');
  assert(pinNames.includes('CTRL'), 'Has CTRL pin');
  assert(pinNames.includes('THRESH'), 'Has THRESH pin');
  assert(pinNames.includes('DISCH'), 'Has DISCH pin');

  // Standard 555 pinout order
  assert(def.pinout[0].pin === 1 && def.pinout[0].name === 'GND', 'Pin 1 = GND');
  assert(def.pinout[1].pin === 2 && def.pinout[1].name === 'TRIG', 'Pin 2 = TRIG');
  assert(def.pinout[2].pin === 3 && def.pinout[2].name === 'OUT', 'Pin 3 = OUT');
  assert(def.pinout[3].pin === 4 && def.pinout[3].name === 'RESETn', 'Pin 4 = RESETn');
  assert(def.pinout[4].pin === 5 && def.pinout[4].name === 'CTRL', 'Pin 5 = CTRL');
  assert(def.pinout[5].pin === 6 && def.pinout[5].name === 'THRESH', 'Pin 6 = THRESH');
  assert(def.pinout[6].pin === 7 && def.pinout[6].name === 'DISCH', 'Pin 7 = DISCH');
  assert(def.pinout[7].pin === 8 && def.pinout[7].name === 'VCC', 'Pin 8 = VCC');
}

// ═════════════════════════════════════════════════════════════════════════════
// FUNCTIONAL TESTS - Static Logic
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n═══ 555 Timer - Functional Tests ═══');

// ── Test 1: RESETn = LOW forces output LOW ───────────────────────────────
console.log('\n── Test 1: RESETn = LOW → OUT = LOW ──');
{
  const { world, chip, wm } = setup555WithPower();
  // Wire TRIG to GND (would normally trigger SET, but reset overrides)
  wirePinToGnd(wm, findPin(chip, 'TRIG'));
  // Wire THRESH to GND (below upper threshold)
  wirePinToGnd(wm, findPin(chip, 'THRESH'));
  // Wire RESETn to GND (active reset)
  wirePinToGnd(wm, findPin(chip, 'RESETn'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  assert(vOut !== undefined && vOut < 0.5, `RESETn LOW → OUT LOW (got ${vOut?.toFixed(3)}V)`);

  // DISCH should be sinking (active, pulling to GND)
  const disch = getPinDrive(sim, chip, 'DISCH');
  assert(disch && disch.type === DRIVE.SINK_ONLY, `RESETn LOW → DISCH sinking`);
}

// ── Test 2: RESETn = HIGH, TRIG < 1/3 VCC → SET (OUT = HIGH) ────────────
console.log('\n── Test 2: TRIG < 1/3 VCC → OUT = HIGH ──');
{
  const { world, chip, wm } = setup555WithPower();
  // TRIG = GND (0V < 1.667V) → triggers SET
  wirePinToGnd(wm, findPin(chip, 'TRIG'));
  // THRESH = GND (0V < 3.333V) → no RESET
  wirePinToGnd(wm, findPin(chip, 'THRESH'));
  // RESETn = VCC (inactive)
  wirePinToVcc(wm, findPin(chip, 'RESETn'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  assert(vOut !== undefined && vOut > 4.5, `TRIG LOW → OUT HIGH (got ${vOut?.toFixed(3)}V)`);

  // DISCH should be High-Z (open, capacitor can charge)
  const disch = getPinDrive(sim, chip, 'DISCH');
  assert(disch && disch.type === DRIVE.HIGH_Z, `TRIG LOW → DISCH High-Z`);
}

// ── Test 3: THRESH > 2/3 VCC → RESET (OUT = LOW) ────────────────────────
console.log('\n── Test 3: THRESH > 2/3 VCC → OUT = LOW ──');
{
  const { world, chip, wm } = setup555WithPower();
  // TRIG = VCC (5V > 1.667V) → no SET
  wirePinToVcc(wm, findPin(chip, 'TRIG'));
  // THRESH = VCC (5V > 3.333V) → RESET
  wirePinToVcc(wm, findPin(chip, 'THRESH'));
  // RESETn = VCC (inactive)
  wirePinToVcc(wm, findPin(chip, 'RESETn'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  assert(vOut !== undefined && vOut < 0.5, `THRESH HIGH → OUT LOW (got ${vOut?.toFixed(3)}V)`);

  // DISCH should be sinking
  const disch = getPinDrive(sim, chip, 'DISCH');
  assert(disch && disch.type === DRIVE.SINK_ONLY, `THRESH HIGH → DISCH sinking`);
}

// ── Test 4: Both TRIG and THRESH inactive → state holds ─────────────────
console.log('\n── Test 4: Neither comparator active → state holds from initial (LOW) ──');
{
  const { world, chip, wm } = setup555WithPower();
  // TRIG at ~2.5V (above 1.667V → no SET) - use voltage divider
  const divComponents = createVoltageDivider(wm, findPin(chip, 'TRIG').holeId, 2.5);
  // THRESH = GND (below 3.333V → no RESET)
  wirePinToGnd(wm, findPin(chip, 'THRESH'));
  // RESETn = VCC
  wirePinToVcc(wm, findPin(chip, 'RESETn'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, ...divComponents], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  // Initial state q=0 → output LOW; neither comparator changes it
  assert(vOut !== undefined && vOut < 0.5,
    `No trigger/threshold → output holds LOW (got ${vOut?.toFixed(3)}V)`);
}

// ── Test 5: SET then hold - state persists across evaluations ────────────
console.log('\n── Test 5: SET then hold → output stays HIGH ──');
{
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('555');
  chip.place(0, 0, 10, 4);

  // First evaluation: TRIG LOW → SET
  {
    const wm = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm, findPin(chip, 'VCC'));
    wirePinToGnd(wm, findPin(chip, 'GND'));
    wirePinToGnd(wm, findPin(chip, 'TRIG'));   // SET
    wirePinToGnd(wm, findPin(chip, 'THRESH')); // no RESET
    wirePinToVcc(wm, findPin(chip, 'RESETn'));

    const sim = new CircuitSimulator();
    sim.evaluate(world, [chip], wm);

    const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
    assert(vOut !== undefined && vOut > 4.5, `First eval: TRIG LOW → SET → OUT HIGH (got ${vOut?.toFixed(3)}V)`);

    // Now change TRIG to VCC (no longer triggering) and re-evaluate
    // with same chip (ffState persisted)
    const wm2 = new WireManager();
    resetWireCounter();
    wirePinToVcc(wm2, findPin(chip, 'VCC'));
    wirePinToGnd(wm2, findPin(chip, 'GND'));
    wirePinToVcc(wm2, findPin(chip, 'TRIG'));  // Above threshold
    wirePinToGnd(wm2, findPin(chip, 'THRESH')); // Below threshold
    wirePinToVcc(wm2, findPin(chip, 'RESETn'));

    const sim2 = new CircuitSimulator();
    // Copy the ffState so the state is retained
    sim2.pinDriveStates = sim.pinDriveStates;
    sim2.evaluate(world, [chip], wm2);

    const vOut2 = getPinVoltage(sim2, findPin(chip, 'OUT'));
    assert(vOut2 !== undefined && vOut2 > 4.5,
      `Second eval: neither active → state holds HIGH (got ${vOut2?.toFixed(3)}V)`);
  }
}

// ── Test 6: RESETn overrides TRIG ────────────────────────────────────────
console.log('\n── Test 6: RESETn overrides TRIG ──');
{
  const { world, chip, wm } = setup555WithPower();
  // TRIG = GND → would SET
  wirePinToGnd(wm, findPin(chip, 'TRIG'));
  wirePinToGnd(wm, findPin(chip, 'THRESH'));
  // But RESETn = GND → forced LOW
  wirePinToGnd(wm, findPin(chip, 'RESETn'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  assert(vOut !== undefined && vOut < 0.5,
    `RESETn overrides TRIG → OUT LOW (got ${vOut?.toFixed(3)}V)`);
}

// ── Test 7: SET priority - TRIG and THRESH both active → SET wins ────────
console.log('\n── Test 7: Both TRIG < 1/3 VCC and THRESH > 2/3 VCC → SET wins ──');
{
  const { world, chip, wm } = setup555WithPower();
  // TRIG = GND (0V < 1.667V) → SET
  wirePinToGnd(wm, findPin(chip, 'TRIG'));
  // THRESH = VCC (5V > 3.333V) → RESET
  wirePinToVcc(wm, findPin(chip, 'THRESH'));
  // RESETn = VCC (inactive)
  wirePinToVcc(wm, findPin(chip, 'RESETn'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  // Per 555 datasheet: when both comparators active simultaneously, SET takes priority
  assert(vOut !== undefined && vOut > 4.5,
    `Both active → SET wins → OUT HIGH (got ${vOut?.toFixed(3)}V)`);
}

// ── Test 8: CTRL pin overrides threshold voltages ────────────────────────
console.log('\n── Test 8: CTRL pin overrides upper threshold ──');
{
  const { world, chip, wm } = setup555WithPower();
  // CTRL = 2.0V (overrides upper threshold from 3.333V down to 2.0V)
  // lower threshold becomes 2.0 / 2 = 1.0V
  const divComps = createVoltageDivider(wm, findPin(chip, 'CTRL').holeId, 2.0);

  // THRESH at 2.5V - normally below 3.333V (no RESET), but with CTRL=2.0V, 2.5V > 2.0V → RESET
  const divComps2 = [];
  // Use another voltage divider for THRESH. Place at different cols to avoid net conflicts.
  const rThA = new ResistorComponent(5000);
  rThA.placeWireLike(holeId(0, 0, 'main', 30, 2), holeId(0, 0, 'main', 35, 2));
  const rThB = new ResistorComponent(5000);
  rThB.placeWireLike(holeId(0, 0, 'main', 35, 3), holeId(0, 0, 'main', 40, 3));
  wm.addWire(holeId(0, 0, 'power', 30, 0), holeId(0, 0, 'main', 30, 1));
  wm.addWire(holeId(0, 0, 'power', 40, 1), holeId(0, 0, 'main', 40, 1));
  wm.addWire(holeId(0, 0, 'main', 35, 0), findPin(chip, 'THRESH').holeId);

  // TRIG = VCC (above any threshold)
  wirePinToVcc(wm, findPin(chip, 'TRIG'));
  // RESETn = VCC
  wirePinToVcc(wm, findPin(chip, 'RESETn'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, ...divComps, rThA, rThB], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  assert(vOut !== undefined && vOut < 0.5,
    `CTRL=2V, THRESH=2.5V > 2V → RESET → OUT LOW (got ${vOut?.toFixed(3)}V)`);
}

// ── Test 9: No power → no output ────────────────────────────────────────
console.log('\n── Test 9: No power → chip does not evaluate ──');
{
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('555');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  // No VCC or GND wired
  wirePinToGnd(wm, findPin(chip, 'TRIG'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const disch = getPinDrive(sim, chip, 'DISCH');
  assert(!disch, 'No power → no drive states');
}

// ── Test 10: DISCH is high-Z when output HIGH, SINK when output LOW ─────
console.log('\n── Test 10: DISCH drive state matches output ──');
{
  // Output HIGH (TRIG LOW, THRESH LOW)
  const { world: w1, chip: c1, wm: wm1 } = setup555WithPower();
  wirePinToGnd(wm1, findPin(c1, 'TRIG'));
  wirePinToGnd(wm1, findPin(c1, 'THRESH'));
  wirePinToVcc(wm1, findPin(c1, 'RESETn'));
  const sim1 = new CircuitSimulator();
  sim1.evaluate(w1, [c1], wm1);
  const d1 = getPinDrive(sim1, c1, 'DISCH');
  assert(d1 && d1.type === DRIVE.HIGH_Z, 'OUT HIGH → DISCH = High-Z');

  // Output LOW (TRIG HIGH, THRESH HIGH → RESET)
  const { world: w2, chip: c2, wm: wm2 } = setup555WithPower();
  wirePinToVcc(wm2, findPin(c2, 'TRIG'));
  wirePinToVcc(wm2, findPin(c2, 'THRESH'));
  wirePinToVcc(wm2, findPin(c2, 'RESETn'));
  const sim2 = new CircuitSimulator();
  sim2.evaluate(w2, [c2], wm2);
  const d2 = getPinDrive(sim2, c2, 'DISCH');
  assert(d2 && d2.type === DRIVE.SINK_ONLY, 'OUT LOW → DISCH = SINK_ONLY');
}

// ── Test 11: CTRL defaults to 2/3 VCC when floating ─────────────────────
console.log('\n── Test 11: CTRL floating → defaults 2/3 VCC threshold ──');
{
  // With CTRL unconnected, thresholds should be 1/3 VCC and 2/3 VCC
  // THRESH at 3.0V (< 3.333V) → should NOT reset
  const { world, chip, wm } = setup555WithPower();
  // Use divider for THRESH = 3.0V
  const rA = new ResistorComponent(4000);
  rA.placeWireLike(holeId(0, 0, 'main', 30, 2), holeId(0, 0, 'main', 35, 2));
  const rB = new ResistorComponent(6000);
  rB.placeWireLike(holeId(0, 0, 'main', 35, 3), holeId(0, 0, 'main', 40, 3));
  wm.addWire(holeId(0, 0, 'power', 30, 0), holeId(0, 0, 'main', 30, 1));
  wm.addWire(holeId(0, 0, 'power', 40, 1), holeId(0, 0, 'main', 40, 1));
  wm.addWire(holeId(0, 0, 'main', 35, 0), findPin(chip, 'THRESH').holeId);

  // TRIG = GND (SET)
  wirePinToGnd(wm, findPin(chip, 'TRIG'));
  wirePinToVcc(wm, findPin(chip, 'RESETn'));
  // CTRL left floating (not connected)

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip, rA, rB], wm);

  const vOut = getPinVoltage(sim, findPin(chip, 'OUT'));
  // TRIG=0V < 1.667V → SET.  THRESH=3V < 3.333V → no RESET. → OUT HIGH.
  assert(vOut !== undefined && vOut > 4.5,
    `CTRL floating, THRESH=3V < 2/3 VCC → SET wins → OUT HIGH (got ${vOut?.toFixed(3)}V)`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 556 DUAL TIMER - Structural & Functional Tests
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n═══ 556 Dual Timer - Structural Tests ═══');

console.log('\n── 556 chip definition ──');
{
  const def = CHIPS_BLOCK_67['556'];
  assert(def !== undefined, '556 chip definition exists');
  assert(def.pins === 14, '556 is 14-pin DIP');
  assert(def.vcc === 14, '556 VCC is pin 14');
  assert(def.gnd === 7, '556 GND is pin 7');
  assert(def.gates.length === 2, '556 has two gate entries');
  assert(def.gates[0].type === 'TIMER_555', 'Gate A type is TIMER_555');
  assert(def.gates[1].type === 'TIMER_555', 'Gate B type is TIMER_555');

  const pinNames = def.pinout.map(p => p.name);
  ['TRIG_A','THRESH_A','CTRL_A','RESETn_A','OUT_A','DISCH_A',
   'TRIG_B','THRESH_B','CTRL_B','RESETn_B','OUT_B','DISCH_B'].forEach(n =>
    assert(pinNames.includes(n), `556 has pin ${n}`)
  );

  assert(def.pinout[0].pin === 1  && def.pinout[0].name === 'DISCH_A',  '556 pin 1 = DISCH_A');
  assert(def.pinout[6].pin === 7  && def.pinout[6].name === 'GND',      '556 pin 7 = GND');
  assert(def.pinout[13].pin === 14 && def.pinout[13].name === 'VCC',    '556 pin 14 = VCC');

  // Gate A inputs/outputs
  const gA = def.gates[0];
  assert(gA.inputs[0]  === 'TRIG_A',    '556 gate A input[0] = TRIG_A');
  assert(gA.inputs[1]  === 'THRESH_A',  '556 gate A input[1] = THRESH_A');
  assert(gA.inputs[2]  === 'RESETn_A',  '556 gate A input[2] = RESETn_A');
  assert(gA.inputs[3]  === 'CTRL_A',    '556 gate A input[3] = CTRL_A');
  assert(gA.outputs[0] === 'OUT_A',     '556 gate A output[0] = OUT_A');
  assert(gA.outputs[1] === 'DISCH_A',   '556 gate A output[1] = DISCH_A');

  // Gate B inputs/outputs
  const gB = def.gates[1];
  assert(gB.inputs[0]  === 'TRIG_B',    '556 gate B input[0] = TRIG_B');
  assert(gB.inputs[1]  === 'THRESH_B',  '556 gate B input[1] = THRESH_B');
  assert(gB.inputs[2]  === 'RESETn_B',  '556 gate B input[2] = RESETn_B');
  assert(gB.inputs[3]  === 'CTRL_B',    '556 gate B input[3] = CTRL_B');
  assert(gB.outputs[0] === 'OUT_B',     '556 gate B output[0] = OUT_B');
  assert(gB.outputs[1] === 'DISCH_B',   '556 gate B output[1] = DISCH_B');
}

console.log('\n═══ 556 Dual Timer - Functional Tests ═══');

/** Place 556 at col 5, wire VCC + GND. */
function setup556WithPower() {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('556');
  chip.place(0, 0, 5, 4);
  const wm = new WireManager();
  resetWireCounter();
  wirePinToVcc(wm, findPin(chip, 'VCC'));
  wirePinToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

// ── 556 Test 1: Timer A - TRIG_A low → OUT_A HIGH ──────────────────────
console.log('\n── 556 Test 1: Timer A TRIG_A < 1/3 VCC → OUT_A HIGH ──');
{
  const { world, chip, wm } = setup556WithPower();
  wirePinToGnd(wm, findPin(chip, 'TRIG_A'));
  wirePinToGnd(wm, findPin(chip, 'THRESH_A'));
  wirePinToVcc(wm, findPin(chip, 'RESETn_A'));
  // Timer B: idle (TRIG_B high, THRESH_B high → out LOW)
  wirePinToVcc(wm, findPin(chip, 'TRIG_B'));
  wirePinToVcc(wm, findPin(chip, 'THRESH_B'));
  wirePinToVcc(wm, findPin(chip, 'RESETn_B'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOutA = getPinVoltage(sim, findPin(chip, 'OUT_A'));
  const vOutB = getPinVoltage(sim, findPin(chip, 'OUT_B'));
  assert(vOutA !== undefined && vOutA > 4.5, `556 Timer A: TRIG_A LOW → OUT_A HIGH (got ${vOutA?.toFixed(3)}V)`);
  assert(vOutB !== undefined && vOutB < 0.5, `556 Timer A fired; Timer B stays LOW (got ${vOutB?.toFixed(3)}V)`);
}

// ── 556 Test 2: Timer B - TRIG_B low → OUT_B HIGH ──────────────────────
console.log('\n── 556 Test 2: Timer B TRIG_B < 1/3 VCC → OUT_B HIGH ──');
{
  const { world, chip, wm } = setup556WithPower();
  // Timer A: idle
  wirePinToVcc(wm, findPin(chip, 'TRIG_A'));
  wirePinToVcc(wm, findPin(chip, 'THRESH_A'));
  wirePinToVcc(wm, findPin(chip, 'RESETn_A'));
  // Timer B: triggered
  wirePinToGnd(wm, findPin(chip, 'TRIG_B'));
  wirePinToGnd(wm, findPin(chip, 'THRESH_B'));
  wirePinToVcc(wm, findPin(chip, 'RESETn_B'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOutA = getPinVoltage(sim, findPin(chip, 'OUT_A'));
  const vOutB = getPinVoltage(sim, findPin(chip, 'OUT_B'));
  assert(vOutA !== undefined && vOutA < 0.5, `556 Timer A stays LOW (got ${vOutA?.toFixed(3)}V)`);
  assert(vOutB !== undefined && vOutB > 4.5, `556 Timer B: TRIG_B LOW → OUT_B HIGH (got ${vOutB?.toFixed(3)}V)`);
}

// ── 556 Test 3: RESETn_A overrides Timer A ──────────────────────────────
console.log('\n── 556 Test 3: RESETn_A LOW overrides Timer A ──');
{
  const { world, chip, wm } = setup556WithPower();
  wirePinToGnd(wm, findPin(chip, 'TRIG_A'));   // would SET
  wirePinToGnd(wm, findPin(chip, 'THRESH_A'));
  wirePinToGnd(wm, findPin(chip, 'RESETn_A')); // forced reset
  wirePinToVcc(wm, findPin(chip, 'TRIG_B'));
  wirePinToGnd(wm, findPin(chip, 'THRESH_B'));
  wirePinToVcc(wm, findPin(chip, 'RESETn_B'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOutA = getPinVoltage(sim, findPin(chip, 'OUT_A'));
  assert(vOutA !== undefined && vOutA < 0.5, `556 RESETn_A LOW → OUT_A LOW (got ${vOutA?.toFixed(3)}V)`);
}

// ── 556 Test 4: Both timers independent - each has own DISCH drive ──────
console.log('\n── 556 Test 4: Both timers simultaneously - independent DISCH states ──');
{
  const { world, chip, wm } = setup556WithPower();
  // Timer A: SET (TRIG_A LOW)
  wirePinToGnd(wm, findPin(chip, 'TRIG_A'));
  wirePinToGnd(wm, findPin(chip, 'THRESH_A'));
  wirePinToVcc(wm, findPin(chip, 'RESETn_A'));
  // Timer B: RESET (THRESH_B HIGH)
  wirePinToVcc(wm, findPin(chip, 'TRIG_B'));
  wirePinToVcc(wm, findPin(chip, 'THRESH_B'));
  wirePinToVcc(wm, findPin(chip, 'RESETn_B'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const dA = getPinDrive(sim, chip, 'DISCH_A');
  const dB = getPinDrive(sim, chip, 'DISCH_B');
  assert(dA && dA.type === DRIVE.HIGH_Z,    '556 Timer A SET → DISCH_A High-Z');
  assert(dB && dB.type === DRIVE.SINK_ONLY, '556 Timer B RESET → DISCH_B Sinking');
}

// ═════════════════════════════════════════════════════════════════════════════
// 558 QUAD TIMER - Structural & Functional Tests
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n═══ 558 Quad Timer - Structural Tests ═══');

console.log('\n── 558 chip definition ──');
{
  const def = CHIPS_BLOCK_67['558'];
  assert(def !== undefined, '558 chip definition exists');
  assert(def.pins === 16, '558 is 16-pin DIP');
  assert(def.vcc === 15, '558 VCC is pin 15');
  assert(def.gnd === 8,  '558 GND is pin 8');
  assert(def.gates.length === 4, '558 has four gate entries');
  def.gates.forEach((g, i) =>
    assert(g.type === 'TIMER_558_SECTION', `558 gate ${i} type is TIMER_558_SECTION`)
  );

  const pinNames = def.pinout.map(p => p.name);
  ['RESETn','CTRL',
   'TRIG_A','OUT_A','DISCH_A',
   'TRIG_B','OUT_B','DISCH_B',
   'TRIG_C','OUT_C','DISCH_C',
   'TRIG_D','OUT_D','DISCH_D'].forEach(n =>
    assert(pinNames.includes(n), `558 has pin ${n}`)
  );

  assert(def.pinout[0].pin  === 1  && def.pinout[0].name  === 'RESETn', '558 pin 1 = RESETn');
  assert(def.pinout[7].pin  === 8  && def.pinout[7].name  === 'GND',    '558 pin 8 = GND');
  assert(def.pinout[14].pin === 15 && def.pinout[14].name === 'VCC',    '558 pin 15 = VCC');
  assert(def.pinout[15].pin === 16 && def.pinout[15].name === 'CTRL',   '558 pin 16 = CTRL');

  // Each section: DISCH is both threshold-input and discharge-output
  const gA = def.gates[0];
  assert(gA.inputs[0]  === 'TRIG_A',  '558 gate A input[0] = TRIG_A');
  assert(gA.inputs[1]  === 'DISCH_A', '558 gate A input[1] = DISCH_A (threshold)');
  assert(gA.inputs[2]  === 'RESETn',  '558 gate A input[2] = RESETn (shared)');
  assert(gA.inputs[3]  === 'CTRL',    '558 gate A input[3] = CTRL (shared)');
  assert(gA.outputs[0] === 'OUT_A',   '558 gate A output[0] = OUT_A');
  assert(gA.outputs[1] === 'DISCH_A', '558 gate A output[1] = DISCH_A (discharge)');
}

console.log('\n═══ 558 Quad Timer - Functional Tests ═══');

/** Place 558 at col 5, wire VCC + GND. */
function setup558WithPower() {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('558');
  chip.place(0, 0, 5, 4);
  const wm = new WireManager();
  resetWireCounter();
  wirePinToVcc(wm, findPin(chip, 'VCC'));
  wirePinToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

// ── 558 Test 1: Timer A - TRIG_A low → OUT_A HIGH, DISCH_A High-Z ───────
console.log('\n── 558 Test 1: Timer A TRIG_A < 1/3 VCC → OUT_A HIGH ──');
{
  const { world, chip, wm } = setup558WithPower();
  // Shared pins
  wirePinToVcc(wm, findPin(chip, 'RESETn'));
  // Timer A: trigger LOW, DISCH_A floating (cap at 0V → below 2/3 VCC, no reset)
  wirePinToGnd(wm, findPin(chip, 'TRIG_A'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_A')); // cap discharged (0V)
  // Timers B/C/D: idle
  wirePinToVcc(wm, findPin(chip, 'TRIG_B'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_B'));
  wirePinToVcc(wm, findPin(chip, 'TRIG_C'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_C'));
  wirePinToVcc(wm, findPin(chip, 'TRIG_D'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_D'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOutA = getPinVoltage(sim, findPin(chip, 'OUT_A'));
  assert(vOutA !== undefined && vOutA > 4.5,
    `558 Timer A: TRIG_A LOW → OUT_A HIGH (got ${vOutA?.toFixed(3)}V)`);
  const dA = getPinDrive(sim, chip, 'DISCH_A');
  assert(dA && dA.type === DRIVE.HIGH_Z, '558 Timer A SET → DISCH_A High-Z');
}

// ── 558 Test 2: DISCH_A high → cap charged → RESET (OUT_A LOW) ──────────
console.log('\n── 558 Test 2: DISCH_A at VCC (cap charged) → OUT_A LOW ──');
{
  const { world, chip, wm } = setup558WithPower();
  wirePinToVcc(wm, findPin(chip, 'RESETn'));
  // Timer A: TRIG above trigger threshold, DISCH_A at VCC (>2/3 VCC → reset)
  wirePinToVcc(wm, findPin(chip, 'TRIG_A'));
  wirePinToVcc(wm, findPin(chip, 'DISCH_A')); // cap at 5V > 3.333V → RESET
  wirePinToVcc(wm, findPin(chip, 'TRIG_B'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_B'));
  wirePinToVcc(wm, findPin(chip, 'TRIG_C'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_C'));
  wirePinToVcc(wm, findPin(chip, 'TRIG_D'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_D'));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vOutA = getPinVoltage(sim, findPin(chip, 'OUT_A'));
  assert(vOutA !== undefined && vOutA < 0.5,
    `558 Timer A: DISCH_A=VCC > 2/3 VCC → OUT_A LOW (got ${vOutA?.toFixed(3)}V)`);
  const dA = getPinDrive(sim, chip, 'DISCH_A');
  assert(dA && dA.type === DRIVE.SINK_ONLY, '558 Timer A RESET → DISCH_A sinking');
}

// ── 558 Test 3: Shared RESETn forces all outputs LOW ────────────────────
console.log('\n── 558 Test 3: Shared RESETn LOW → all OUT pins LOW ──');
{
  const { world, chip, wm } = setup558WithPower();
  wirePinToGnd(wm, findPin(chip, 'RESETn'));  // shared reset active
  // All timers: trigger active (would SET without reset)
  ['TRIG_A','TRIG_B','TRIG_C','TRIG_D'].forEach(n => wirePinToGnd(wm, findPin(chip, n)));
  ['DISCH_A','DISCH_B','DISCH_C','DISCH_D'].forEach(n => wirePinToGnd(wm, findPin(chip, n)));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  ['OUT_A','OUT_B','OUT_C','OUT_D'].forEach(n => {
    const v = getPinVoltage(sim, findPin(chip, n));
    assert(v !== undefined && v < 0.5, `558 RESETn LOW → ${n} LOW (got ${v?.toFixed(3)}V)`);
  });
}

// ── 558 Test 4: Independent timers - each fires separately ───────────────
console.log('\n── 558 Test 4: Only Timer C triggered → only OUT_C HIGH ──');
{
  const { world, chip, wm } = setup558WithPower();
  wirePinToVcc(wm, findPin(chip, 'RESETn'));
  // Timer C: TRIG_C LOW, DISCH_C at 0V
  wirePinToGnd(wm, findPin(chip, 'TRIG_C'));
  wirePinToGnd(wm, findPin(chip, 'DISCH_C'));
  // All others: idle (TRIG HIGH, DISCH at VCC → RESET → LOW)
  ['TRIG_A','TRIG_B','TRIG_D'].forEach(n => wirePinToVcc(wm, findPin(chip, n)));
  ['DISCH_A','DISCH_B','DISCH_D'].forEach(n => wirePinToVcc(wm, findPin(chip, n)));

  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);

  const vC = getPinVoltage(sim, findPin(chip, 'OUT_C'));
  assert(vC !== undefined && vC > 4.5, `558 Timer C: TRIG_C LOW → OUT_C HIGH (got ${vC?.toFixed(3)}V)`);

  ['OUT_A','OUT_B','OUT_D'].forEach(n => {
    const v = getPinVoltage(sim, findPin(chip, n));
    assert(v !== undefined && v < 0.5, `558 ${n} stays LOW (got ${v?.toFixed(3)}V)`);
  });
}


console.log(`\n════════════════════════════════════════`);
console.log(`  555/556/558 Timer tests: ${pass} passed, ${fail} failed`);
console.log(`════════════════════════════════════════`);
if (fail > 0) process.exit(1);
