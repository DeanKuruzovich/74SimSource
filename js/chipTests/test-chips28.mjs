// test-chips28.mjs -- Tests for CHIPS_BLOCK_28 (74480..74516)
import { CHIPS_BLOCK_28 } from '../chips/chips28.js';
import { CircuitSimulator } from '../simulator.js';

let passed = 0, failed = 0;

function makeComp(chipKey) {
  const spec = CHIPS_BLOCK_28[chipKey];
  if (!spec) throw new Error(`Unknown chip: ${chipKey}`);
  const comp = {
    id: `test_${chipKey}`,
    type: chipKey,
    pins: {},
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
  if (v === 2.5) return 'Z';
  return (v > 2.5) ? 1 : 0;
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
    case 'BURST_ERR_RECOVERY':  SIM._evaluateBurstErrRecovery(comp, gate); break;
    case 'CONTROL_SLICE_4BIT':  SIM._evaluateControlSlice4Bit(comp, gate); break;
    case 'BCD_TO_BIN':          SIM._evaluateBcdToBin(comp, gate); break;
    case 'BIN_TO_BCD':          SIM._evaluateBinToBcd(comp, gate); break;
    case 'COUNTER_DECADE_DUAL': SIM._evaluateCounterDecadeDual(comp, gate); break;
    case 'COUNTER_10BIT_UPDOWN':SIM._evaluateCounter10BitUpdown(comp, gate); break;
    case 'SHIFT_REG_8BIT_BIDI': SIM._evaluateShiftReg8BitBidi(comp, gate); break;
    case 'ADC_6BIT_FLASH':      SIM._evaluateAdc6BitFlash(comp, gate); break;
    case 'SAR_8BIT':            SIM._evaluateSar8Bit(comp, gate); break;
    case 'SAR_8BIT_EXP':        SIM._evaluateSar8BitExp(comp, gate); break;
    case 'SAR_12BIT_EXP':       SIM._evaluateSar12BitExp(comp, gate); break;
    case 'ADC_8BIT_SAR':        SIM._evaluateAdc8BitSar(comp, gate); break;
    case 'MULTIPLIER_8BIT':     SIM._evaluateMultiplier8Bit(comp, gate); break;
    case 'DECODER_PROG_2TO4':   SIM._evaluateDecoderProg2to4(comp, gate); break;
    case 'MULTIPLIER_16BIT':    SIM._evaluateMultiplier16Bit(comp, gate); break;
    default: throw new Error(`No handler for gate type: ${gate.type}`);
  }
}

function expect(label, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL [${label}]: expected ${expected}, got ${actual}`);
  }
}

// ── 74480: BURST_ERR_RECOVERY (stub) ────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74480'];
  const gate = spec.gates[0];
  expect('74480 gate type', gate.type, 'BURST_ERR_RECOVERY');
  const { comp } = makeComp('74480');
  for (const p of ['D0','D1','D2','D3','D4','D5','D6','D7','CLK','LOADn','OEn']) setPin(comp, p, 0);
  runGate(comp, gate);
  expect('74480 stub ERR=0', getPin(comp, 'ERR'), 0);
  expect('74480 stub Q0=0', getPin(comp, 'Q0'), 0);
  expect('74480 stub Q7=0', getPin(comp, 'Q7'), 0);
}

// ── 74482: CONTROL_SLICE_4BIT (stub) ────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74482'];
  const gate = spec.gates[0];
  expect('74482 gate type', gate.type, 'CONTROL_SLICE_4BIT');
  const { comp } = makeComp('74482');
  for (const p of ['I0','I1','I2','I3','I4','I5','I6','I7','I8']) setPin(comp, p, 0);
  runGate(comp, gate);
  expect('74482 stub Y0=0', getPin(comp, 'Y0'), 0);
  expect('74482 stub Y4=0', getPin(comp, 'Y4'), 0);
  expect('74482 stub Y8=0', getPin(comp, 'Y8'), 0);
}

// ── 74484: BCD_TO_BIN ───────────────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74484'];
  const gate = spec.gates[0];
  expect('74484 gate type', gate.type, 'BCD_TO_BIN');
  const { comp } = makeComp('74484');

  function setBCD484(ones, tens) {
    setPin(comp, 'A1', (ones >> 0) & 1);
    setPin(comp, 'B1', (ones >> 1) & 1);
    setPin(comp, 'C1', (ones >> 2) & 1);
    setPin(comp, 'D1', (ones >> 3) & 1);
    setPin(comp, 'A2', (tens >> 0) & 1);
    setPin(comp, 'B2', (tens >> 1) & 1);
    setPin(comp, 'C2', (tens >> 2) & 1);
    setPin(comp, 'D2', (tens >> 3) & 1);
  }

  function readBin484() {
    let v = 0;
    for (let i = 0; i < 7; i++) v |= (getPin(comp, `Y${i}`) << i);
    return v;
  }

  setBCD484(0, 0); setPin(comp, 'OEn', 1);
  runGate(comp, gate);
  expect('74484 OEn=1: Y0 HiZ', getPin(comp, 'Y0'), 'Z');

  setBCD484(0, 0); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74484 BCD 00->0', readBin484(), 0);

  setBCD484(9, 0); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74484 BCD 09->9', readBin484(), 9);

  setBCD484(0, 1); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74484 BCD 10->10', readBin484(), 10);

  setBCD484(9, 9); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74484 BCD 99->99', readBin484(), 99);

  setBCD484(2, 4); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74484 BCD 42->42', readBin484(), 42);

  setBCD484(5, 5); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74484 BCD 55->55', readBin484(), 55);

  setBCD484(7, 3); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74484 BCD 37->37', readBin484(), 37);
}

// ── 74485: BIN_TO_BCD ───────────────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74485'];
  const gate = spec.gates[0];
  expect('74485 gate type', gate.type, 'BIN_TO_BCD');
  const { comp } = makeComp('74485');

  function setBin485(val) {
    for (let i = 0; i < 7; i++) setPin(comp, `I${i}`, (val >> i) & 1);
  }

  function readBCD485() {
    const a1 = getPin(comp, 'A1'), b1 = getPin(comp, 'B1');
    const c1 = getPin(comp, 'C1'), d1 = getPin(comp, 'D1');
    const a2 = getPin(comp, 'A2'), b2 = getPin(comp, 'B2');
    const c2 = getPin(comp, 'C2'), d2 = getPin(comp, 'D2');
    const ones = (d1 << 3) | (c1 << 2) | (b1 << 1) | a1;
    const tens = (d2 << 3) | (c2 << 2) | (b2 << 1) | a2;
    return tens * 10 + ones;
  }

  setBin485(0); setPin(comp, 'OEn', 1); runGate(comp, gate);
  expect('74485 OEn=1: A1 HiZ', getPin(comp, 'A1'), 'Z');

  setBin485(0); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74485 0->BCD 00', readBCD485(), 0);

  setBin485(9); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74485 9->BCD 09', readBCD485(), 9);

  setBin485(10); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74485 10->BCD 10', readBCD485(), 10);

  setBin485(99); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74485 99->BCD 99', readBCD485(), 99);

  setBin485(42); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74485 42->BCD 42', readBCD485(), 42);

  setBin485(55); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74485 55->BCD 55', readBCD485(), 55);

  setBin485(37); setPin(comp, 'OEn', 0); runGate(comp, gate);
  expect('74485 37->BCD 37', readBCD485(), 37);
}

// ── 74490: COUNTER_DECADE_DUAL ──────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74490'];
  const gate = spec.gates[0];
  expect('74490 gate type', gate.type, 'COUNTER_DECADE_DUAL');
  const { comp } = makeComp('74490');

  setPin(comp, 'CLR1', 1); setPin(comp, 'CLR2', 0);
  setPin(comp, 'CKA1', 0); setPin(comp, 'CKB1', 0);
  setPin(comp, 'CKA2', 0); setPin(comp, 'CKB2', 0);
  runGate(comp, gate);
  expect('74490 CLR1: QA1=0', getPin(comp, 'QA1'), 0);
  expect('74490 CLR1: QB1=0', getPin(comp, 'QB1'), 0);

  setPin(comp, 'CLR1', 0);
  setPin(comp, 'CKA1', 1); runGate(comp, gate);
  setPin(comp, 'CKA1', 0); runGate(comp, gate);
  expect('74490 sec1 count 1: QA1=1', getPin(comp, 'QA1'), 1);

  setPin(comp, 'CLR2', 1); runGate(comp, gate);
  expect('74490 CLR2: QA2=0', getPin(comp, 'QA2'), 0);
}

// ── 74491: COUNTER_10BIT_UPDOWN ─────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74491'];
  const gate = spec.gates[0];
  expect('74491 gate type', gate.type, 'COUNTER_10BIT_UPDOWN');
  const { comp } = makeComp('74491');

  for (let i = 0; i < 10; i++) setPin(comp, `P${i}`, 0);
  setPin(comp, 'OEn', 0); setPin(comp, 'ENn', 0); setPin(comp, 'U_Dn', 0);
  setPin(comp, 'CLRn', 0); setPin(comp, 'LOADn', 1); setPin(comp, 'CLK', 0);
  runGate(comp, gate);
  expect('74491 CLR: Q0=0', getPin(comp, 'Q0'), 0);
  setPin(comp, 'CLRn', 1);

  setPin(comp, 'CLK', 1); runGate(comp, gate);
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  expect('74491 up 1: Q0=1', getPin(comp, 'Q0'), 1);
  expect('74491 up 1: Q1=0', getPin(comp, 'Q1'), 0);

  setPin(comp, 'CLK', 1); runGate(comp, gate);
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  expect('74491 up 2: Q0=0', getPin(comp, 'Q0'), 0);
  expect('74491 up 2: Q1=1', getPin(comp, 'Q1'), 1);

  // Load 100 = 0b01100100
  for (let i = 0; i < 10; i++) setPin(comp, `P${i}`, (100 >> i) & 1);
  setPin(comp, 'LOADn', 0); runGate(comp, gate); setPin(comp, 'LOADn', 1);
  expect('74491 load 100: Q2=1', getPin(comp, 'Q2'), 1);
  expect('74491 load 100: Q5=1', getPin(comp, 'Q5'), 1);

  // OEn=1 -> HiZ
  setPin(comp, 'OEn', 1); runGate(comp, gate);
  expect('74491 OEn=1: Q0 HiZ', getPin(comp, 'Q0'), 'Z');

  // ENn=1 -> hold after CLR
  setPin(comp, 'OEn', 0); setPin(comp, 'CLRn', 0); runGate(comp, gate); setPin(comp, 'CLRn', 1);
  setPin(comp, 'ENn', 1);
  setPin(comp, 'CLK', 1); runGate(comp, gate);
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  expect('74491 ENn=1: Q0 held=0', getPin(comp, 'Q0'), 0);

  // Down: CLR, load 5, count down once
  setPin(comp, 'ENn', 0); setPin(comp, 'CLRn', 0); runGate(comp, gate); setPin(comp, 'CLRn', 1);
  for (let i = 0; i < 10; i++) setPin(comp, `P${i}`, (5 >> i) & 1);
  setPin(comp, 'LOADn', 0); runGate(comp, gate); setPin(comp, 'LOADn', 1);
  setPin(comp, 'U_Dn', 1);
  setPin(comp, 'CLK', 1); runGate(comp, gate);
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  // 5-1=4 = 0b000100 -> Q0=0, Q2=1
  expect('74491 count down 5->4: Q0=0', getPin(comp, 'Q0'), 0);
  expect('74491 count down 5->4: Q2=1', getPin(comp, 'Q2'), 1);
}

// ── 74498: SHIFT_REG_8BIT_BIDI ──────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74498'];
  const gate = spec.gates[0];
  expect('74498 gate type', gate.type, 'SHIFT_REG_8BIT_BIDI');
  const { comp } = makeComp('74498');

  function readReg498() {
    let v = 0;
    for (let i = 0; i < 8; i++) v |= (getPin(comp, `Q${i}`) << i);
    return v;
  }

  setPin(comp, 'CLK', 0); setPin(comp, 'OEn', 0);
  setPin(comp, 'SRL', 0); setPin(comp, 'SRR', 0);
  for (let i = 0; i < 8; i++) setPin(comp, `P${i}`, (181 >> i) & 1);
  setPin(comp, 'S0', 1); setPin(comp, 'S1', 1);

  // Load 181
  setPin(comp, 'CLK', 1); runGate(comp, gate); setPin(comp, 'CLK', 0); runGate(comp, gate);
  expect('74498 load 181', readReg498(), 181);

  // Hold
  setPin(comp, 'S0', 0); setPin(comp, 'S1', 0);
  setPin(comp, 'CLK', 1); runGate(comp, gate); setPin(comp, 'CLK', 0); runGate(comp, gate);
  expect('74498 hold: unchanged=181', readReg498(), 181);

  // Reload 181
  setPin(comp, 'S0', 1); setPin(comp, 'S1', 1);
  for (let i = 0; i < 8; i++) setPin(comp, `P${i}`, (181 >> i) & 1);
  setPin(comp, 'CLK', 1); runGate(comp, gate); setPin(comp, 'CLK', 0); runGate(comp, gate);

  // Shift right (mode 01): SRR=1 => (181<<1|1)&255=107
  setPin(comp, 'S0', 1); setPin(comp, 'S1', 0); setPin(comp, 'SRR', 1);
  setPin(comp, 'CLK', 1); runGate(comp, gate); setPin(comp, 'CLK', 0); runGate(comp, gate);
  expect('74498 shift right: 107', readReg498(), 107);

  // Reload 181, shift left (mode 10): SRL=1 => (181>>1)|(1<<7)=218
  setPin(comp, 'S0', 1); setPin(comp, 'S1', 1);
  for (let i = 0; i < 8; i++) setPin(comp, `P${i}`, (181 >> i) & 1);
  setPin(comp, 'CLK', 1); runGate(comp, gate); setPin(comp, 'CLK', 0); runGate(comp, gate);

  setPin(comp, 'S0', 0); setPin(comp, 'S1', 1); setPin(comp, 'SRL', 1); setPin(comp, 'SRR', 0);
  setPin(comp, 'CLK', 1); runGate(comp, gate); setPin(comp, 'CLK', 0); runGate(comp, gate);
  expect('74498 shift left: 218', readReg498(), 218);

  // OEn=1 -> HiZ
  setPin(comp, 'OEn', 1); runGate(comp, gate);
  expect('74498 OEn=1: Q0 HiZ', getPin(comp, 'Q0'), 'Z');
}

// ── 74500: ADC_6BIT_FLASH (stub) ────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74500'];
  const gate = spec.gates[0];
  expect('74500 gate type', gate.type, 'ADC_6BIT_FLASH');
  const { comp } = makeComp('74500');
  setPin(comp, 'VIN', 0); setPin(comp, 'VREF', 0); setPin(comp, 'OEn', 0); setPin(comp, 'CLK', 0);
  runGate(comp, gate);
  expect('74500 stub D0=0', getPin(comp, 'D0'), 0);
  expect('74500 stub CC=0', getPin(comp, 'CC'), 0);
}

// ── 74502: SAR_8BIT (stub) ──────────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74502'];
  const gate = spec.gates[0];
  expect('74502 gate type', gate.type, 'SAR_8BIT');
  const { comp } = makeComp('74502');
  setPin(comp, 'CLK', 0); setPin(comp, 'EOCn', 1); setPin(comp, 'STARTn', 1); setPin(comp, 'COMP', 0);
  runGate(comp, gate);
  expect('74502 stub Q0=0', getPin(comp, 'Q0'), 0);
  expect('74502 stub EOC=1', getPin(comp, 'EOC'), 1);
  expect('74502 stub SC=1', getPin(comp, 'SC'), 1);
}

// ── 74503: SAR_8BIT_EXP (stub) ──────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74503'];
  const gate = spec.gates[0];
  expect('74503 gate type', gate.type, 'SAR_8BIT_EXP');
  const { comp } = makeComp('74503');
  setPin(comp, 'CLK', 0); setPin(comp, 'EOCn', 1); setPin(comp, 'STARTn', 1); setPin(comp, 'COMP', 0);
  runGate(comp, gate);
  expect('74503 stub Q0=0', getPin(comp, 'Q0'), 0);
  expect('74503 stub EOC=1', getPin(comp, 'EOC'), 1);
  expect('74503 stub EXP=1', getPin(comp, 'EXP'), 1);
}

// ── 74504: SAR_12BIT_EXP (stub) ─────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74504'];
  const gate = spec.gates[0];
  expect('74504 gate type', gate.type, 'SAR_12BIT_EXP');
  const { comp } = makeComp('74504');
  setPin(comp, 'CLK', 0); setPin(comp, 'EOCn', 1); setPin(comp, 'STARTn', 1); setPin(comp, 'COMP', 0);
  runGate(comp, gate);
  expect('74504 stub Q0=0', getPin(comp, 'Q0'), 0);
  expect('74504 stub Q11=0', getPin(comp, 'Q11'), 0);
  expect('74504 stub EOC=1', getPin(comp, 'EOC'), 1);
  expect('74504 stub EXP=1', getPin(comp, 'EXP'), 1);
}

// ── 74505: ADC_8BIT_SAR (stub) ──────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74505'];
  const gate = spec.gates[0];
  expect('74505 gate type', gate.type, 'ADC_8BIT_SAR');
  const { comp } = makeComp('74505');
  setPin(comp, 'VIN', 0); setPin(comp, 'VREF', 0); setPin(comp, 'OEn', 0);
  setPin(comp, 'CLK', 0); setPin(comp, 'STARTn', 1);
  runGate(comp, gate);
  expect('74505 stub D0=0', getPin(comp, 'D0'), 0);
  expect('74505 stub EOC=1', getPin(comp, 'EOC'), 1);
}

// ── 74508: MULTIPLIER_8BIT ──────────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74508'];
  const gate = spec.gates[0];
  expect('74508 gate type', gate.type, 'MULTIPLIER_8BIT');
  const { comp } = makeComp('74508');

  function setMul508(a, b) {
    const aVal = (a < 0) ? (a + 256) : a;
    const bVal = (b < 0) ? (b + 256) : b;
    for (let i = 0; i < 8; i++) setPin(comp, `A${i}`, (aVal >> i) & 1);
    for (let i = 0; i < 8; i++) setPin(comp, `B${i}`, (bVal >> i) & 1);
  }

  function readProd508() {
    let v = 0;
    for (let i = 0; i < 6; i++) v |= (getPin(comp, `P${i}`) << i);
    return v;
  }

  setMul508(3, 4); runGate(comp, gate);
  expect('74508 3*4=12', readProd508(), 12);

  setMul508(7, 7); runGate(comp, gate);
  expect('74508 7*7=49', readProd508(), 49);

  setMul508(0, 127); runGate(comp, gate);
  expect('74508 0*127=0', readProd508(), 0);

  setMul508(1, 1); runGate(comp, gate);
  expect('74508 1*1=1', readProd508(), 1);

  setMul508(2, 2); runGate(comp, gate);
  expect('74508 2*2=4', readProd508(), 4);

  // -1 * 1 = -1; lower 6 bits of (-1 in 16 bit) = 63
  setMul508(-1, 1); runGate(comp, gate);
  expect('74508 -1*1 lower6=63', readProd508(), 63);
}

// ── 74515: DECODER_PROG_2TO4 ────────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74515'];
  const gate = spec.gates[0];
  expect('74515 gate type', gate.type, 'DECODER_PROG_2TO4');
  const { comp } = makeComp('74515');

  function setEnables515(val) {
    for (let i = 0; i < 9; i++) setPin(comp, `E${i}`, val);
  }
  function setAddr515(a) {
    setPin(comp, 'A0', a & 1);
    setPin(comp, 'A1', (a >> 1) & 1);
  }

  setEnables515(0); setAddr515(0); runGate(comp, gate);
  expect('74515 no enable: Y0n=1', getPin(comp, 'Y0n'), 1);
  expect('74515 no enable: Y3n=1', getPin(comp, 'Y3n'), 1);

  setEnables515(1); setAddr515(0); runGate(comp, gate);
  expect('74515 E=all1, A=0: Y0n=0', getPin(comp, 'Y0n'), 0);
  expect('74515 E=all1, A=0: Y1n=1', getPin(comp, 'Y1n'), 1);
  expect('74515 E=all1, A=0: Y2n=1', getPin(comp, 'Y2n'), 1);
  expect('74515 E=all1, A=0: Y3n=1', getPin(comp, 'Y3n'), 1);

  setAddr515(1); runGate(comp, gate);
  expect('74515 E=all1, A=1: Y0n=1', getPin(comp, 'Y0n'), 1);
  expect('74515 E=all1, A=1: Y1n=0', getPin(comp, 'Y1n'), 0);

  setAddr515(2); runGate(comp, gate);
  expect('74515 E=all1, A=2: Y2n=0', getPin(comp, 'Y2n'), 0);

  setAddr515(3); runGate(comp, gate);
  expect('74515 E=all1, A=3: Y3n=0', getPin(comp, 'Y3n'), 0);

  setEnables515(1); setPin(comp, 'E4', 0); setAddr515(0); runGate(comp, gate);
  expect('74515 one E=0: Y0n=1 (disabled)', getPin(comp, 'Y0n'), 1);
}

// ── 74516: MULTIPLIER_16BIT ─────────────────────────────────────────────────
{
  const spec = CHIPS_BLOCK_28['74516'];
  const gate = spec.gates[0];
  expect('74516 gate type', gate.type, 'MULTIPLIER_16BIT');
  const { comp } = makeComp('74516');

  function setMul516(a, b) {
    const aVal = (a < 0) ? (a + 16) : a;
    const bVal = (b < 0) ? (b + 16) : b;
    for (let i = 0; i < 4; i++) setPin(comp, `A${i}`, (aVal >> i) & 1);
    for (let i = 0; i < 4; i++) setPin(comp, `B${i}`, (bVal >> i) & 1);
  }

  function readProd516() {
    let v = 0;
    for (let i = 0; i < 8; i++) v |= (getPin(comp, `P${i}`) << i);
    return v;
  }

  function signed8(v) { return (v & 0x80) ? v - 256 : v; }

  setMul516(3, 4); runGate(comp, gate);
  expect('74516 3*4=12', readProd516(), 12);

  setMul516(7, 7); runGate(comp, gate);
  expect('74516 7*7=49', readProd516(), 49);

  setMul516(0, 7); runGate(comp, gate);
  expect('74516 0*7=0', readProd516(), 0);

  setMul516(1, 1); runGate(comp, gate);
  expect('74516 1*1=1', readProd516(), 1);

  setMul516(-1, 1); runGate(comp, gate);
  expect('74516 -1*1=-1 signed', signed8(readProd516()), -1);

  setMul516(-4, -3); runGate(comp, gate);
  expect('74516 -4*-3=12 signed', signed8(readProd516()), 12);

  setMul516(-1, -1); runGate(comp, gate);
  expect('74516 -1*-1=1 signed', signed8(readProd516()), 1);
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
