// test-chips70.mjs — Tests for js/chips/chips70.js
// Chips under test:
//   28C16: 2K × 8 EEPROM (24-pin)

import { CHIPS_BLOCK_70 } from '../chips/chips70.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else       { fail++; console.error(`  FAIL: ${msg}`); }
}

function findPin(comp, name) {
  return typeof comp.getPinByName === 'function'
    ? comp.getPinByName(name)
    : comp.pins.find(p => p.name === name);
}

function connectToVcc(wm, pin) { return wm.addWire(holeId(0, 0, 'power', pin.col, 1), pin.holeId); }
function connectToGnd(wm, pin) { return wm.addWire(holeId(0, 0, 'power', pin.col, 0), pin.holeId); }
function connectHigh(wm, chip, name) { return connectToVcc(wm, findPin(chip, name)); }
function connectLow(wm, chip, name)  { return connectToGnd(wm, findPin(chip, name)); }

function disconnectPin(wm, chip, name) {
  const pin = findPin(chip, name);
  const wires = wm.getWiresAtHole(pin.holeId);
  for (const w of wires) wm.removeWire(w.id);
}

function reconnectHigh(wm, chip, name) { disconnectPin(wm, chip, name); connectHigh(wm, chip, name); }
function reconnectLow(wm, chip, name)  { disconnectPin(wm, chip, name); connectLow(wm, chip, name); }

function getPinVoltage(sim, pin) {
  const net = sim.netlist.findNetByHole(pin.holeId);
  return net ? sim.netVoltages.get(net.id) : undefined;
}

function assertHigh(sim, chip, name, label) {
  const pin = findPin(chip, name);
  if (!pin) { fail++; console.error(`  FAIL: ${label}: pin '${name}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v >= 2.5, `${label} [got ${v}]`);
}

function assertLow(sim, chip, name, label) {
  const pin = findPin(chip, name);
  if (!pin) { fail++; console.error(`  FAIL: ${label}: pin '${name}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v < 2.5, `${label} [got ${v}]`);
}

// Hi-Z test: connect a VCC pullup to the IO pin first.
// A chip in Hi-Z lets the external VCC win → pin reads HIGH.
// A chip actively driving LOW would pull the net down → pin reads LOW.
function assertHiZ(sim, chip, name, label) {
  const pin = findPin(chip, name);
  if (!pin) { fail++; console.error(`  FAIL: ${label}: pin '${name}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v >= 2.5,
    `${label} (VCC pullup should win when chip is Hi-Z) [got ${v}]`);
}

function setupChip() {
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('28C16');
  chip.place(0, 0, 10, 4);
  const wm = new WireManager();
  resetWireCounter();
  connectToVcc(wm, findPin(chip, 'VCC'));
  connectToGnd(wm, findPin(chip, 'GND'));
  return { world, chip, wm };
}

function setAddress(wm, chip, addr) {
  for (let i = 0; i <= 10; i++) {
    disconnectPin(wm, chip, `A${i}`);
    if ((addr >> i) & 1) connectHigh(wm, chip, `A${i}`);
    else                 connectLow(wm, chip, `A${i}`);
  }
}

function setDataIn(wm, chip, byte) {
  for (let i = 0; i < 8; i++) {
    disconnectPin(wm, chip, `IO${i}`);
    if ((byte >> i) & 1) connectHigh(wm, chip, `IO${i}`);
    else                 connectLow(wm, chip, `IO${i}`);
  }
}

// Connect IO pins to VCC pullup — used to probe Hi-Z state.
// If chip is Hi-Z, pullup wins → HIGH. If chip drives LOW, LOW wins.
function pullupIO(wm, chip) {
  for (let i = 0; i < 8; i++) {
    disconnectPin(wm, chip, `IO${i}`);
    connectHigh(wm, chip, `IO${i}`);
  }
}

function disconnectIO(wm, chip) {
  for (let i = 0; i < 8; i++) disconnectPin(wm, chip, `IO${i}`);
}

function runSim(world, chip, wm) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  return sim;
}

// ── Section S: Structure ─────────────────────────────────────────────────────
console.log('\n=== S: Structure ===');

assert(typeof CHIPS_BLOCK_70 === 'object', 'CHIPS_BLOCK_70 exported');
const def = CHIPS_BLOCK_70['28C16'];
assert(!!def, '28C16 defined');

if (def) {
  assert(def.pins  === 24, '24 pins');
  assert(def.vcc   === 24, 'VCC = pin 24');
  assert(def.gnd   === 12, 'GND = pin 12');
  assert(Array.isArray(def.pinout) && def.pinout.length === 24, 'pinout has 24 entries');
  assert(Array.isArray(def.gates)  && def.gates.length  === 1,  '1 gate');
  assert(def.gates[0].type === 'EEPROM_2KX8', 'gate type EEPROM_2KX8');
  assert(def.sequential === true, 'sequential: true');
  assert(!!def.datasheet,     'has datasheet');
  assert(!!def.guideOverview, 'has guideOverview');

  for (let i = 1; i <= 24; i++) {
    assert(def.pinout.some(p => p.pin === i), `pinout has pin ${i}`);
  }

  const pm = {};
  for (const p of def.pinout) pm[p.name] = p.pin;
  assert(pm['A0']  === 8,  'A0 → pin 8');
  assert(pm['A7']  === 1,  'A7 → pin 1');
  assert(pm['A8']  === 22, 'A8 → pin 22');
  assert(pm['A9']  === 21, 'A9 → pin 21');
  assert(pm['A10'] === 19, 'A10 → pin 19');
  assert(pm['CE']  === 18, 'CE → pin 18');
  assert(pm['OE']  === 20, 'OE → pin 20');
  assert(pm['WE']  === 23, 'WE → pin 23');
  assert(pm['IO0'] === 9,  'IO0 → pin 9');
  assert(pm['IO7'] === 17, 'IO7 → pin 17');
  assert(pm['VCC'] === 24 && def.pinout.find(p=>p.pin===24).type === 'power', 'pin 24 = VCC power');
  assert(pm['GND'] === 12 && def.pinout.find(p=>p.pin===12).type === 'power', 'pin 12 = GND power');

  const g = def.gates[0];
  for (let i = 0; i <= 10; i++) assert(g.inputs.includes(`A${i}`),  `gate inputs: A${i}`);
  for (let i = 0; i < 8;  i++) {
    assert(g.inputs.includes(`IO${i}`),  `gate inputs: IO${i}`);
    assert(g.outputs.includes(`IO${i}`), `gate outputs: IO${i}`);
  }
  assert(g.inputs.includes('CE') && g.inputs.includes('OE') && g.inputs.includes('WE'),
    'gate inputs: CE, OE, WE');
  assert(g.inputs.length === 22, '22 gate inputs');
  assert(g.outputs.length === 8, '8 gate outputs');
}

// ── Section A: Standby (CE=HIGH) — chip must not drive IO LOW ────────────────
// Strategy: pull IO lines HIGH via VCC wire. If chip is Hi-Z they read HIGH.
// If chip were actively driving LOW, the net would read LOW.
console.log('\n=== A: Standby (CE=HIGH) ===');
{
  const { world, chip, wm } = setupChip();
  connectHigh(wm, chip, 'CE');
  connectLow(wm, chip,  'OE');
  connectHigh(wm, chip, 'WE');
  setAddress(wm, chip, 0x000);
  pullupIO(wm, chip);  // VCC wins if chip is Hi-Z
  const sim = runSim(world, chip, wm);
  for (let i = 0; i < 8; i++) assertHiZ(sim, chip, `IO${i}`, `Standby: IO${i} Hi-Z`);
}

// ── Section B: Output Disable (CE=L, OE=H, WE=H) — must not drive IO ─────────
console.log('\n=== B: Output Disable (CE=L, OE=H, WE=H) ===');
{
  const { world, chip, wm } = setupChip();
  connectLow(wm, chip,  'CE');
  connectHigh(wm, chip, 'OE');
  connectHigh(wm, chip, 'WE');
  setAddress(wm, chip, 0x000);
  pullupIO(wm, chip);
  const sim = runSim(world, chip, wm);
  for (let i = 0; i < 8; i++) assertHiZ(sim, chip, `IO${i}`, `OutputDisable: IO${i} Hi-Z`);
}

// ── Section C: Read uninitialised memory → 0x00 ──────────────────────────────
console.log('\n=== C: Read uninitialised → 0x00 ===');
{
  const { world, chip, wm } = setupChip();
  connectLow(wm, chip, 'CE');
  connectLow(wm, chip, 'OE');
  connectHigh(wm, chip, 'WE');
  setAddress(wm, chip, 0x100);
  const sim = runSim(world, chip, wm);
  for (let i = 0; i < 8; i++) assertLow(sim, chip, `IO${i}`, `Uninit read: IO${i}=0`);
}

// ── Section D: Write / read round-trip ───────────────────────────────────────
console.log('\n=== D: Write/read round-trip ===');
{
  const { world, chip, wm } = setupChip();
  const sim = new CircuitSimulator();

  // Write 0xA5 to addr 0x000
  connectLow(wm, chip,  'CE');
  connectHigh(wm, chip, 'OE');
  connectLow(wm, chip,  'WE');
  setAddress(wm, chip, 0x000);
  setDataIn(wm, chip, 0xA5);
  sim.evaluate(world, [chip], wm);

  // Read back: switch to read mode, remove external IO drivers
  reconnectHigh(wm, chip, 'WE');
  reconnectLow(wm, chip,  'OE');
  disconnectIO(wm, chip);
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    const bit = (0xA5 >> i) & 1;
    if (bit) assertHigh(sim, chip, `IO${i}`, `Read 0xA5 bit${i}=1`);
    else     assertLow(sim,  chip, `IO${i}`, `Read 0xA5 bit${i}=0`);
  }

  // Write 0xFF to addr 0x7FF (all address bits HIGH)
  reconnectHigh(wm, chip, 'OE');
  reconnectLow(wm, chip,  'WE');
  setAddress(wm, chip, 0x7FF);
  setDataIn(wm, chip, 0xFF);
  sim.evaluate(world, [chip], wm);

  reconnectHigh(wm, chip, 'WE');
  reconnectLow(wm, chip,  'OE');
  disconnectIO(wm, chip);
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) assertHigh(sim, chip, `IO${i}`, `Read 0xFF addr 0x7FF bit${i}=1`);
}

// ── Section E: Address independence ──────────────────────────────────────────
console.log('\n=== E: Address independence ===');
{
  const { world, chip, wm } = setupChip();
  const sim = new CircuitSimulator();

  connectLow(wm, chip,  'CE');
  connectHigh(wm, chip, 'OE');
  connectLow(wm, chip,  'WE');

  setAddress(wm, chip, 0x001); setDataIn(wm, chip, 0x55); sim.evaluate(world, [chip], wm);
  setAddress(wm, chip, 0x002); setDataIn(wm, chip, 0xAA); sim.evaluate(world, [chip], wm);

  reconnectHigh(wm, chip, 'WE');
  reconnectLow(wm, chip,  'OE');
  disconnectIO(wm, chip);

  setAddress(wm, chip, 0x001); sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    if ((0x55 >> i) & 1) assertHigh(sim, chip, `IO${i}`, `Addr 0x001 (0x55) bit${i}=1`);
    else                 assertLow(sim,  chip, `IO${i}`, `Addr 0x001 (0x55) bit${i}=0`);
  }

  setAddress(wm, chip, 0x002); sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    if ((0xAA >> i) & 1) assertHigh(sim, chip, `IO${i}`, `Addr 0x002 (0xAA) bit${i}=1`);
    else                 assertLow(sim,  chip, `IO${i}`, `Addr 0x002 (0xAA) bit${i}=0`);
  }

  setAddress(wm, chip, 0x000); sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) assertLow(sim, chip, `IO${i}`, `Addr 0x000 uninit=0 bit${i}`);
}

// ── Section F: Overwrite (last write wins) ────────────────────────────────────
console.log('\n=== F: Overwrite ===');
{
  const { world, chip, wm } = setupChip();
  const sim = new CircuitSimulator();

  connectLow(wm, chip,  'CE');
  connectHigh(wm, chip, 'OE');
  connectLow(wm, chip,  'WE');
  setAddress(wm, chip, 0x010);

  setDataIn(wm, chip, 0x12); sim.evaluate(world, [chip], wm);
  setDataIn(wm, chip, 0x34); sim.evaluate(world, [chip], wm);

  reconnectHigh(wm, chip, 'WE');
  reconnectLow(wm, chip,  'OE');
  disconnectIO(wm, chip);
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) {
    if ((0x34 >> i) & 1) assertHigh(sim, chip, `IO${i}`, `Overwrite 0x34 bit${i}=1`);
    else                 assertLow(sim,  chip, `IO${i}`, `Overwrite 0x34 bit${i}=0`);
  }
}

// ── Section G: CE=HIGH overrides OE=LOW (standby wins) ───────────────────────
console.log('\n=== G: CE priority over OE ===');
{
  const { world, chip, wm } = setupChip();
  const sim = new CircuitSimulator();

  // Write 0xFF to addr 0
  connectLow(wm, chip,  'CE');
  connectHigh(wm, chip, 'OE');
  connectLow(wm, chip,  'WE');
  setAddress(wm, chip, 0x000);
  setDataIn(wm, chip, 0xFF);
  sim.evaluate(world, [chip], wm);

  // Deselect: CE=HIGH, OE=LOW (looks like read but CE overrides)
  // Apply VCC pullup — if chip stays Hi-Z, IO reads HIGH
  reconnectHigh(wm, chip, 'CE');
  reconnectHigh(wm, chip, 'WE');
  reconnectLow(wm, chip,  'OE');
  pullupIO(wm, chip);
  sim.evaluate(world, [chip], wm);
  // CE=HIGH must force Hi-Z; if it instead drove 0xFF data, IO would still be HIGH here
  // (because 0xFF = all 1s). So verify by also checking that stored 0x00 data is NOT driven:
  // Write 0x00 to addr 1, then try reading addr 0 with CE=HIGH — if chip ignores CE, we'd
  // get 0xFF driven (HIGH) which looks like Hi-Z. Instead write 0x00 there first.
  // Simpler: just verify pullup wins (chip doesn't pull down):
  for (let i = 0; i < 8; i++) assertHiZ(sim, chip, `IO${i}`, `CE=H overrides OE=L: IO${i} Hi-Z`);
}

// Complementary CE priority test with stored 0x00: verify chip doesn't drive IO LOW
// when CE=HIGH (a stored 0x00 read would actively pull IO LOW, exposing a CE bug)
{
  const { world, chip, wm } = setupChip();
  const sim = new CircuitSimulator();

  // Write 0x00 explicitly to addr 0
  connectLow(wm, chip,  'CE');
  connectHigh(wm, chip, 'OE');
  connectLow(wm, chip,  'WE');
  setAddress(wm, chip, 0x000);
  setDataIn(wm, chip, 0x00);
  sim.evaluate(world, [chip], wm);

  // Verify 0x00 was written (CE=LOW, read)
  reconnectHigh(wm, chip, 'WE');
  reconnectLow(wm, chip,  'OE');
  disconnectIO(wm, chip);
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) assertLow(sim, chip, `IO${i}`, `Stored 0x00 read: IO${i}=0`);

  // Now go to standby (CE=HIGH) — pullup should win over stored 0x00
  reconnectHigh(wm, chip, 'CE');
  pullupIO(wm, chip);
  sim.evaluate(world, [chip], wm);
  for (let i = 0; i < 8; i++) assertHiZ(sim, chip, `IO${i}`, `CE=H with stored 0x00: IO${i} Hi-Z (pullup wins)`);
}

// ── Results ───────────────────────────────────────────────────────────────────
console.log(`\n${pass + fail} tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
