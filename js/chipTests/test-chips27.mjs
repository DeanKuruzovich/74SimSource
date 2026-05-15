/**
 * test-chips27.mjs -- Tests for CHIPS_BLOCK_27 (74462..74469)
 */
import { CHIPS_BLOCK_27 } from '../chips/chips27.js';
import { CircuitSimulator } from '../simulator.js';

let passed = 0, failed = 0;

function makeComp(chipKey) {
  const spec = CHIPS_BLOCK_27[chipKey];
  if (!spec) throw new Error(`Unknown chip: ${chipKey}`);
  const comp = {
    id: `test_${chipKey}`,
    type: chipKey,
    pins: {},
    state: {},
  };
  for (const p of spec.pinout) {
    comp.pins[p.name] = { name: p.name, type: p.type, voltage: 0, netId: null };
  }
  return { comp, spec };
}

function setPin(comp, name, val) {
  if (!comp.pins[name]) return;
  comp.pins[name].voltage = val ? 5 : 0;
}

function getPin(comp, name) {
  if (!comp.pins[name]) return undefined;
  const v = comp.pins[name].voltage;
  return (v > 2.5) ? 1 : (v < 0.5 ? 0 : 0.5);
}

const SIM = new CircuitSimulator();

SIM._readGateInputs = function(comp, inputNames) {
  return inputNames.map(n => {
    if (!comp.pins[n]) return 0;
    const v = comp.pins[n].voltage;
    return (v > 2.5) ? 1 : 0;
  });
};
SIM._drivePinBit = function(comp, name, bit) {
  if (!comp.pins[name]) return false;
  const newV = bit ? 5 : 0;
  if (comp.pins[name].voltage === newV) return false;
  comp.pins[name].voltage = newV;
  return true;
};
SIM._drivePinHighZ = function(comp, name) {
  if (!comp.pins[name]) return false;
  if (comp.pins[name].voltage === 2.5) return false;
  comp.pins[name].voltage = 2.5;
  return true;
};

function runGate(comp, gate) {
  switch (gate.type) {
    case 'FIBER_OPTIC_TX':         SIM._evaluateFiberOpticTx(comp, gate); break;
    case 'FIBER_OPTIC_RX':         SIM._evaluateFiberOpticRx(comp, gate); break;
    case 'BUFFER_OCTAL_TRI':       SIM._evaluateBufferOctalTri(comp, gate); break;
    case 'BUFFER_OCTAL_INV_TRI':   SIM._evaluateBufferOctalInvTri(comp, gate); break;
    case 'COUNTER_8BIT_UPDOWN_SYNC': SIM._evaluateCounter8BitUpdownSync(comp, gate); break;
    default: throw new Error(`No handler for gate type: ${gate.type}`);
  }
}

function runAllGates(comp, spec) {
  for (const gate of spec.gates) runGate(comp, gate);
}

function expect(label, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL [${label}]: expected ${expected}, got ${actual}`);
  }
}

// --- 74465 -- Octal Buffer (non-inv, 2 enables, tri-state) -------------------
{
  const { comp, spec } = makeComp('74465');
  const gate = spec.gates[0];
  expect('74465 gate type', gate.type, 'BUFFER_OCTAL_TRI');

  // G1n=0, G2n=0 (enabled), all inputs=1 => all outputs=1
  setPin(comp, 'G1n', 0); setPin(comp, 'G2n', 0);
  for (let i = 1; i <= 8; i++) setPin(comp, `A${i}`, 1);
  runGate(comp, gate);
  for (let i = 1; i <= 8; i++) expect(`74465 enabled Y${i}=1`, getPin(comp, `Y${i}`), 1);

  // G1n=0, G2n=0 (enabled), inputs alternating
  setPin(comp, 'A1', 0); setPin(comp, 'A2', 1); setPin(comp, 'A3', 0); setPin(comp, 'A4', 1);
  setPin(comp, 'A5', 0); setPin(comp, 'A6', 1); setPin(comp, 'A7', 0); setPin(comp, 'A8', 1);
  runGate(comp, gate);
  expect('74465 Y1=A1=0', getPin(comp, 'Y1'), 0);
  expect('74465 Y2=A2=1', getPin(comp, 'Y2'), 1);
  expect('74465 Y3=A3=0', getPin(comp, 'Y3'), 0);
  expect('74465 Y4=A4=1', getPin(comp, 'Y4'), 1);

  // G1n=1 => tri-state
  setPin(comp, 'G1n', 1);
  runGate(comp, gate);
  expect('74465 G1n=1 Y1 HiZ', getPin(comp, 'Y1'), 0.5);
  expect('74465 G1n=1 Y8 HiZ', getPin(comp, 'Y8'), 0.5);

  // G1n=0, G2n=1 => tri-state
  setPin(comp, 'G1n', 0); setPin(comp, 'G2n', 1);
  runGate(comp, gate);
  expect('74465 G2n=1 Y1 HiZ', getPin(comp, 'Y1'), 0.5);
}

// --- 74466 -- Octal Buffer (inv, 2 enables, tri-state) -----------------------
{
  const { comp, spec } = makeComp('74466');
  const gate = spec.gates[0];
  expect('74466 gate type', gate.type, 'BUFFER_OCTAL_INV_TRI');

  // G1n=0, G2n=0 (enabled), inputs all 1 => outputs all 0 (inverted)
  setPin(comp, 'G1n', 0); setPin(comp, 'G2n', 0);
  for (let i = 1; i <= 8; i++) setPin(comp, `A${i}`, 1);
  runGate(comp, gate);
  for (let i = 1; i <= 8; i++) expect(`74466 enabled inv Y${i}=0`, getPin(comp, `Y${i}`), 0);

  // inputs=0 => outputs=1
  for (let i = 1; i <= 8; i++) setPin(comp, `A${i}`, 0);
  runGate(comp, gate);
  for (let i = 1; i <= 8; i++) expect(`74466 inv Y${i}=1`, getPin(comp, `Y${i}`), 1);

  // G1n=1 => HiZ
  setPin(comp, 'G1n', 1);
  runGate(comp, gate);
  for (let i = 1; i <= 8; i++) expect(`74466 G1n=1 Y${i} HiZ`, getPin(comp, `Y${i}`), 0.5);
}

// --- 74467 -- same gate type as 74465 ----------------------------------------
{
  const spec = CHIPS_BLOCK_27['74467'];
  expect('74467 uses BUFFER_OCTAL_TRI', spec.gates[0].type, 'BUFFER_OCTAL_TRI');
  const { comp } = makeComp('74467');
  const gate = spec.gates[0];
  setPin(comp, 'G1n', 0); setPin(comp, 'G2n', 0);
  for (let i = 1; i <= 8; i++) setPin(comp, `A${i}`, 1);
  runGate(comp, gate);
  expect('74467 Y4=1 (non-inv)', getPin(comp, 'Y4'), 1);
}

// --- 74468 -- same gate type as 74466 ----------------------------------------
{
  const spec = CHIPS_BLOCK_27['74468'];
  expect('74468 uses BUFFER_OCTAL_INV_TRI', spec.gates[0].type, 'BUFFER_OCTAL_INV_TRI');
  const { comp } = makeComp('74468');
  const gate = spec.gates[0];
  setPin(comp, 'G1n', 0); setPin(comp, 'G2n', 0);
  for (let i = 1; i <= 8; i++) setPin(comp, `A${i}`, 1);
  runGate(comp, gate);
  expect('74468 Y4=0 (inv)', getPin(comp, 'Y4'), 0);
}

// --- 74469 -- 8 bit Synchronous Up/Down Counter ------------------------------
{
  const { comp, spec } = makeComp('74469');
  const gate = spec.gates[0];
  expect('74469 gate type', gate.type, 'COUNTER_8BIT_UPDOWN_SYNC');

  // OEn=0, ENn=0, U_Dn=0 (up), LOADn=1, count up from 0
  setPin(comp, 'OEn', 0); setPin(comp, 'ENn', 0); setPin(comp, 'U_Dn', 0); setPin(comp, 'LOADn', 1);
  // Start reset state (state is clear)
  comp.state = {};

  // Clock 3 times (up)
  for (let tick = 0; tick < 3; tick++) {
    setPin(comp, 'CLK', 0); runGate(comp, gate);
    setPin(comp, 'CLK', 1); runGate(comp, gate);
  }
  // Should be at count 3
  expect('74469 count=3 Q0=1', getPin(comp, 'Q0'), 1);
  expect('74469 count=3 Q1=1', getPin(comp, 'Q1'), 1);
  expect('74469 count=3 Q2=0', getPin(comp, 'Q2'), 0);
  expect('74469 count=3 RCO=0', getPin(comp, 'RCO'), 0);

  // Parallel load: LOADn=0, P=0xA5
  setPin(comp, 'LOADn', 0);
  const val = 0xA5; // 10100101
  for (let i = 0; i < 8; i++) setPin(comp, `P${i}`, (val >> i) & 1);
  runGate(comp, gate);
  setPin(comp, 'LOADn', 1);
  runGate(comp, gate);
  expect('74469 load Q0=1', getPin(comp, 'Q0'), 1);
  expect('74469 load Q1=0', getPin(comp, 'Q1'), 0);
  expect('74469 load Q2=1', getPin(comp, 'Q2'), 1);
  expect('74469 load Q7=1', getPin(comp, 'Q7'), 1);

  // Count down: U_Dn=1
  setPin(comp, 'U_Dn', 1);
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  setPin(comp, 'CLK', 1); runGate(comp, gate);
  // 0xA5 - 1 = 0xA4 = 10100100
  expect('74469 down Q0=0', getPin(comp, 'Q0'), 0);
  expect('74469 down Q1=0', getPin(comp, 'Q1'), 0);
  expect('74469 down Q2=1', getPin(comp, 'Q2'), 1);

  // OEn=1 => HiZ
  setPin(comp, 'OEn', 1);
  runGate(comp, gate);
  expect('74469 OEn=1 Q0 HiZ', getPin(comp, 'Q0'), 0.5);
  expect('74469 OEn=1 RCO HiZ', getPin(comp, 'RCO'), 0.5);

  // ENn=1 => hold count (no clock effect)
  setPin(comp, 'OEn', 0); setPin(comp, 'ENn', 1); setPin(comp, 'U_Dn', 0);
  comp.state.cnt = 0x10;
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  setPin(comp, 'CLK', 1); runGate(comp, gate);
  expect('74469 ENn=1 hold Q4=1', getPin(comp, 'Q4'), 1);
  expect('74469 ENn=1 hold Q0=0', getPin(comp, 'Q0'), 0);

  // RCO up: count=0xFF
  setPin(comp, 'ENn', 0); setPin(comp, 'U_Dn', 0);
  comp.state.cnt = 0xFF; comp.state.clkLast = 0;
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  setPin(comp, 'CLK', 1); runGate(comp, gate);
  // After clock at 0xFF going up: cnt wraps to 0
  expect('74469 up wrap Q0=0', getPin(comp, 'Q0'), 0);
  // At cnt=0xFF, RCO should have been 1 BEFORE the clock
  comp.state.cnt = 0xFF; comp.state.clkLast = 1; runGate(comp, gate);
  expect('74469 up RCO at 0xFF', getPin(comp, 'RCO'), 1);

  // RCO down borrow: count=0x00
  setPin(comp, 'U_Dn', 1);
  comp.state.cnt = 0x00; comp.state.clkLast = 1; runGate(comp, gate);
  expect('74469 down RCO at 0x00', getPin(comp, 'RCO'), 1);
}

// --- Summary -----------------------------------------------------------------
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
