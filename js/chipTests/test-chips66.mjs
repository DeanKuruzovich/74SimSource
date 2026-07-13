// test-chips66.mjs - Tests for all chips defined in js/chips/chips66.js
// ALL STUBS - obscure Motorola MC74xxx parts with unverified pinouts
// SKIPPED: 74131 (conflict), 74416 (conflict), 74424 (conflict)

import { CHIPS_BLOCK_66 } from '../chips/chips66.js';
import { BreadboardWorld, holeId } from '../breadboard.js';
import { ChipComponent } from '../components.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { CircuitSimulator } from '../simulator.js';

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { pass++; }
  else      { fail++; console.error(`  ✗ ${msg}`); }
}

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
function assertPinHigh(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v >= 2.5, `${label}: expected HIGH, got ${v}`);
}
function assertPinLow(sim, chip, pinName, label) {
  const pin = findPin(chip, pinName);
  if (!pin) { fail++; console.error(`  ✗ ${label}: pin '${pinName}' not found`); return; }
  const v = getPinVoltage(sim, pin);
  assert(v !== undefined && v !== null && v < 2.5, `${label}: expected LOW, got ${v}`);
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
function connectHigh(wm, chip, name) { return connectPinToVcc(wm, findPin(chip, name)); }
function connectLow(wm, chip, name)  { return connectPinToGnd(wm, findPin(chip, name)); }
function disconnectPin(wm, chip, name) {
  const pin = findPin(chip, name);
  const wires = wm.getWiresAtHole(pin.holeId);
  for (const w of wires) wm.removeWire(w.id);
}
function reconnectHigh(wm, chip, name) { disconnectPin(wm, chip, name); return connectHigh(wm, chip, name); }
function reconnectLow(wm, chip, name)  { disconnectPin(wm, chip, name); return connectLow(wm, chip, name); }
function simulate(world, wm, chips) {
  const sim = new CircuitSimulator();
  sim.evaluate(world, Array.isArray(chips) ? chips : [chips], wm);
  return sim;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION S - Structure
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_IDS = [
  '74x406', '74x408', '74x418', '74x419', '74x450',
  '74x453', '74x455', '74x456', '74x460', '74x934',
];

const EXPECTED_SPECS = {
  '74x406': { pins: 14, gnd:  7, vcc: 14 },
  '74x408': { pins: 14, gnd:  7, vcc: 14 },
  '74x418': { pins: 16, gnd:  8, vcc: 16 },
  '74x419': { pins: 16, gnd:  8, vcc: 16 },
  '74x450': { pins: 16, gnd:  8, vcc: 16 },
  '74x453': { pins: 16, gnd:  8, vcc: 16 },
  '74x455': { pins: 24, gnd: 12, vcc: 24 },
  '74x456': { pins: 16, gnd:  8, vcc: 16 },
  '74x460': { pins: 16, gnd:  8, vcc: 16 },
  '74x934': { pins: 28, gnd: 14, vcc: 28 },
};

console.log('── S: Structure ─────────────');
{
  const ids = Object.keys(CHIPS_BLOCK_66);
  assert(ids.length === EXPECTED_IDS.length,
    `S.count: expected ${EXPECTED_IDS.length} chips, got ${ids.length}`);
  for (const id of EXPECTED_IDS) {
    assert(CHIPS_BLOCK_66[id] !== undefined, `S.exists: ${id} present`);
    const c = CHIPS_BLOCK_66[id];
    if (!c) continue;
    assert(c.name === id, `S.name: ${id}`);
    assert(typeof c.description === 'string' && c.description.length > 0, `S.desc: ${id}`);
    assert(Array.isArray(c.pinout) && c.pinout.length === c.pins, `S.pinout.len: ${id}`);
    assert(Array.isArray(c.gates) && c.gates.length >= 1, `S.gates: ${id}`);
    assert(Array.isArray(c.tags) && c.tags.length >= 1, `S.tags: ${id}`);
  }
  // Verify skipped chips are NOT present
  for (const skipped of ['74x131', '74x416', '74x424']) {
    assert(CHIPS_BLOCK_66[skipped] === undefined, `S.skip: ${skipped} should NOT be present`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION P - Pin/spec validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('── P: Pin/spec validation ──');
{
  for (const id of EXPECTED_IDS) {
    const c = CHIPS_BLOCK_66[id];
    if (!c) continue;
    const spec = EXPECTED_SPECS[id];
    assert(c.pins === spec.pins, `P.pins: ${id} expected ${spec.pins}, got ${c.pins}`);
    assert(c.gnd === spec.gnd, `P.gnd: ${id} expected ${spec.gnd}, got ${c.gnd}`);
    assert(c.vcc === spec.vcc, `P.vcc: ${id} expected ${spec.vcc}, got ${c.vcc}`);

    // Verify VCC and GND pin entries exist
    const vccPin = c.pinout.find(p => p.name === 'VCC');
    const gndPin = c.pinout.find(p => p.name === 'GND');
    assert(vccPin && vccPin.pin === c.vcc, `P.vcc_pin: ${id}`);
    assert(gndPin && gndPin.pin === c.gnd, `P.gnd_pin: ${id}`);
    assert(vccPin && vccPin.type === 'power', `P.vcc_type: ${id}`);
    assert(gndPin && gndPin.type === 'power', `P.gnd_type: ${id}`);

    // Verify pin numbers are sequential 1..N
    const pinNums = c.pinout.map(p => p.pin).sort((a, b) => a - b);
    for (let i = 0; i < pinNums.length; i++) {
      assert(pinNums[i] === i + 1, `P.seq: ${id} pin ${i + 1} expected, got ${pinNums[i]}`);
    }

    // Verify all pin names are unique
    const names = new Set(c.pinout.map(p => p.name));
    assert(names.size === c.pinout.length, `P.unique_names: ${id} has duplicate pin names`);

    // Verify each pin has a valid type
    for (const p of c.pinout) {
      assert(['input', 'output', 'power', 'nc'].includes(p.type),
        `P.pin_type: ${id} pin ${p.pin} (${p.name}) invalid type '${p.type}'`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION PL - Placement
// ─────────────────────────────────────────────────────────────────────────────
console.log('── PL: Placement ───────────');
{
  for (const id of EXPECTED_IDS) {
    const chip = new ChipComponent(id);
    chip.place(0, 0, 10, 4);
    assert(chip.pins.length === EXPECTED_SPECS[id].pins,
      `PL.pins: ${id} expected ${EXPECTED_SPECS[id].pins}, got ${chip.pins.length}`);
    const vccP = findPin(chip, 'VCC');
    const gndP = findPin(chip, 'GND');
    assert(vccP !== undefined, `PL.vcc: ${id}`);
    assert(gndP !== undefined, `PL.gnd: ${id}`);
    assert(typeof vccP.holeId === 'string', `PL.vcc_hole: ${id}`);
    assert(typeof gndP.holeId === 'string', `PL.gnd_hole: ${id}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SIM - Stub simulation (all stubs should run without error)
// ─────────────────────────────────────────────────────────────────────────────
console.log('── SIM: Stub simulation ────');
{
  for (const id of EXPECTED_IDS) {
    const { world, chip, wm } = setupChipWithPower(id);
    let threw = false;
    try {
      const sim = simulate(world, wm, chip);
      assert(sim !== undefined, `SIM.eval: ${id} completed`);
    } catch (e) {
      threw = true;
      fail++;
      console.error(`  ✗ SIM.eval: ${id} threw: ${e.message}`);
    }
    if (!threw) {
      assert(true, `SIM.nothrow: ${id}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G - Gate definitions
// ─────────────────────────────────────────────────────────────────────────────
console.log('── G: Gate definitions ─────');
{
  for (const id of EXPECTED_IDS) {
    const c = CHIPS_BLOCK_66[id];
    if (!c) continue;

    // All chips in block 66 use GENERIC_STUB
    assert(c.gates.length === 1, `G.single_gate: ${id}`);
    assert(c.gates[0].type === 'GENERIC_STUB', `G.stub_type: ${id} expected GENERIC_STUB, got ${c.gates[0].type}`);
    assert(Array.isArray(c.gates[0].inputs), `G.inputs_array: ${id}`);
    assert(Array.isArray(c.gates[0].outputs), `G.outputs_array: ${id}`);
    assert(c.gates[0].inputs.length > 0, `G.inputs_nonempty: ${id}`);
    assert(c.gates[0].outputs.length > 0, `G.outputs_nonempty: ${id}`);

    // Verify stub gate input/output pin names match pinout
    const signalPins = new Set(c.pinout.filter(p => p.type !== 'power' && p.type !== 'nc').map(p => p.name));
    for (const inp of c.gates[0].inputs) {
      assert(signalPins.has(inp), `G.input_valid: ${id} input '${inp}' matches a signal pin`);
    }
    for (const out of c.gates[0].outputs) {
      assert(signalPins.has(out), `G.output_valid: ${id} output '${out}' matches a signal pin`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION T - Tags
// ─────────────────────────────────────────────────────────────────────────────
console.log('── T: Tags ─────────────────');
{
  for (const id of EXPECTED_IDS) {
    const c = CHIPS_BLOCK_66[id];
    if (!c) continue;
    assert(c.tags.includes('stub'), `T.stub_tag: ${id} should have 'stub' tag`);
    assert(c.tags.includes('Motorola') || c.tags.includes('NSC'),
      `T.mfg_tag: ${id} should have manufacturer tag`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SEQ - Sequential flag
// ─────────────────────────────────────────────────────────────────────────────
console.log('── SEQ: Sequential flags ───');
{
  const SEQUENTIAL_IDS = ['74x418', '74x419', '74x450', '74x453', '74x455'];
  const COMBINATIONAL_IDS = ['74x406', '74x408', '74x456', '74x460', '74x934'];

  for (const id of SEQUENTIAL_IDS) {
    const c = CHIPS_BLOCK_66[id];
    assert(c && c.sequential === true, `SEQ.seq: ${id} should have sequential=true`);
  }
  for (const id of COMBINATIONAL_IDS) {
    const c = CHIPS_BLOCK_66[id];
    // Combinational stubs should NOT have sequential=true
    assert(c && c.sequential !== true, `SEQ.comb: ${id} should NOT have sequential=true`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION OC - Open collector flag
// ─────────────────────────────────────────────────────────────────────────────
console.log('── OC: Open collector flags ');
{
  // Only 74450 has openCollector
  assert(CHIPS_BLOCK_66['74x450'].openCollector === true, 'OC.74450: should have openCollector=true');
  for (const id of EXPECTED_IDS.filter(i => i !== '74x450')) {
    const c = CHIPS_BLOCK_66[id];
    assert(!c.openCollector, `OC.${id}: should NOT have openCollector`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DYN - Dynamic input tests (all stubs, connect/disconnect)
// ─────────────────────────────────────────────────────────────────────────────
console.log('── DYN: Dynamic input tests ');
{
  for (const id of EXPECTED_IDS) {
    const { world, chip, wm } = setupChipWithPower(id);
    const c = CHIPS_BLOCK_66[id];
    const inputPins = c.pinout.filter(p => p.type === 'input');

    // Connect all inputs LOW, simulate
    for (const ip of inputPins) connectLow(wm, chip, ip.name);
    let sim = simulate(world, wm, chip);
    assert(sim !== undefined, `DYN.allLow: ${id}`);

    // Connect all inputs HIGH, simulate
    for (const ip of inputPins) reconnectHigh(wm, chip, ip.name);
    sim = simulate(world, wm, chip);
    assert(sim !== undefined, `DYN.allHigh: ${id}`);

    // Disconnect all inputs, simulate (should not crash)
    for (const ip of inputPins) disconnectPin(wm, chip, ip.name);
    sim = simulate(world, wm, chip);
    assert(sim !== undefined, `DYN.disconn: ${id}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DS - Datasheet references
// ─────────────────────────────────────────────────────────────────────────────
console.log('── DS: Datasheet refs ──────');
{
  for (const id of EXPECTED_IDS) {
    const c = CHIPS_BLOCK_66[id];
    assert(typeof c.datasheet === 'string' && c.datasheet.length > 0,
      `DS.ref: ${id} has datasheet reference`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SN - SimpleName
// ─────────────────────────────────────────────────────────────────────────────
console.log('── SN: SimpleName ──────────');
{
  for (const id of EXPECTED_IDS) {
    const c = CHIPS_BLOCK_66[id];
    assert(typeof c.simpleName === 'string' && c.simpleName.length > 0,
      `SN.name: ${id} has simpleName`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION MC - Multi-chip simulation
// ─────────────────────────────────────────────────────────────────────────────
console.log('── MC: Multi-chip sim ──────');
{
  const world = new BreadboardWorld(1, 1);
  const chips = [];
  const wm = new WireManager();
  resetWireCounter();

  let col = 10;
  for (const id of EXPECTED_IDS) {
    const chip = new ChipComponent(id);
    chip.place(0, 0, col, 4);
    col += CHIPS_BLOCK_66[id].pins / 2 + 2;
    connectPinToVcc(wm, findPin(chip, 'VCC'));
    connectPinToGnd(wm, findPin(chip, 'GND'));
    chips.push(chip);
  }

  const sim = simulate(world, wm, chips);
  assert(sim !== undefined, 'MC.eval: all 10 chips together');
  for (let i = 0; i < chips.length; i++) {
    assert(chips[i].pins.length > 0, `MC.chip[${i}]: has pins`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION PI - Pinout integrity (deeper checks per chip)
// ─────────────────────────────────────────────────────────────────────────────
console.log('── PI: Pinout integrity ────');
{
  // 74406: 3 to 8 decoder
  {
    const c = CHIPS_BLOCK_66['74x406'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 4, 'PI.74406: 4 inputs (A0,A1,A2,EN)');
    assert(outPins.length === 8, 'PI.74406: 8 outputs (Y0-Y7)');
  }

  // 74408: 8 bit parity tree
  {
    const c = CHIPS_BLOCK_66['74x408'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 8, 'PI.74408: 8 inputs (D0-D7)');
    assert(outPins.length === 2, 'PI.74408: 2 outputs (EVEN,ODD)');
  }

  // 74418: Mod-16 counter
  {
    const c = CHIPS_BLOCK_66['74x418'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 7, 'PI.74418: 7 inputs (CLK,PL,CLR,P0-P3)');
    assert(outPins.length === 5, 'PI.74418: 5 outputs (Q0-Q3,CO)');
  }

  // 74419: Dual mod-4 counter
  {
    const c = CHIPS_BLOCK_66['74x419'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 8, 'PI.74419: 8 inputs');
    assert(outPins.length === 6, 'PI.74419: 6 outputs (Q1A,Q1B,CO1,Q2A,Q2B,CO2)');
  }

  // 74450: Counter/7-seg OC
  {
    const c = CHIPS_BLOCK_66['74x450'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 3, 'PI.74450: 3 inputs (CLK,LE,RST)');
    assert(outPins.length === 8, 'PI.74450: 8 outputs (Sa-Sg,CO)');
  }

  // 74453: Dual binary counter
  {
    const c = CHIPS_BLOCK_66['74x453'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 4, 'PI.74453: 4 inputs (CLK1,CLR1,CLK2,CLR2)');
    assert(outPins.length === 10, 'PI.74453: 10 outputs');
  }

  // 74455: Dual up/down counter
  {
    const c = CHIPS_BLOCK_66['74x455'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 12, 'PI.74455: 12 inputs');
    assert(outPins.length === 10, 'PI.74455: 10 outputs');
  }

  // 74456: 4 bit NBCD adder
  {
    const c = CHIPS_BLOCK_66['74x456'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 9, 'PI.74456: 9 inputs (A0-A3,B0-B3,CIN)');
    assert(outPins.length === 5, 'PI.74456: 5 outputs (S0-S3,COUT)');
  }

  // 74460: 4 bit bus switch
  {
    const c = CHIPS_BLOCK_66['74x460'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    // All signal pins are 'input' since bus switch is bidirectional
    assert(inPins.length === 10, 'PI.74460: 10 input pins');
    assert(outPins.length === 0, 'PI.74460: 0 dedicated outputs (bidirectional)');
  }

  // 74934: ADC
  {
    const c = CHIPS_BLOCK_66['74x934'];
    const inPins = c.pinout.filter(p => p.type === 'input');
    const outPins = c.pinout.filter(p => p.type === 'output');
    assert(inPins.length === 17, 'PI.74934: 17 inputs');
    assert(outPins.length === 9, 'PI.74934: 9 outputs (INT,D0-D7)');
    assert(c.pins === 28, 'PI.74934: 28 pin package');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RP - Re-placement tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('── RP: Re-placement ────────');
{
  for (const id of EXPECTED_IDS) {
    const chip1 = new ChipComponent(id);
    chip1.place(0, 0, 10, 4);
    const chip2 = new ChipComponent(id);
    chip2.place(0, 0, 20, 4);
    assert(chip1.pins.length === chip2.pins.length, `RP.eq: ${id}`);
    // Pin hole IDs should differ between instances
    const vcc1 = findPin(chip1, 'VCC');
    const vcc2 = findPin(chip2, 'VCC');
    assert(vcc1.holeId !== vcc2.holeId, `RP.diff: ${id} VCC holeIds differ`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n── Results: ${pass} passed, ${fail} failed ──`);
process.exit(fail > 0 ? 1 : 0);
