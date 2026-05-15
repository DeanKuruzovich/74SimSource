/**
 * Tests for Chips Block 21: 74322, 74323, 74324, 74325, 74326, 74327,
 *                           74330, 74331, 74333, 74334, 74335, 74336,
 *                           74337, 74340, 74341, 74344
 */
import { CHIPS_BLOCK_21 } from '../chips/chips21.js';
import { CircuitSimulator } from '../simulator.js';

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; }
  catch (e) { failed++; console.error(`FAIL: ${name}\n  ${e.message}`); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(`${msg || ''}: expected ${b}, got ${a}`);
}

const SIM = new CircuitSimulator();

function makeComp(chipId) {
  const spec = CHIPS_BLOCK_21[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_21`);
  const comp = { id: `test_${chipId}`, chipId, spec, pins: {}, state: null };
  for (const p of spec.pinout) {
    if (p.type === 'power') continue;
    comp.pins[p.name] = { voltage: p.type === 'output' ? null : 0 };
  }
  return comp;
}
function setPin(comp, name, val) {
  if (!comp.pins[name]) throw new Error(`Pin ${name} not found on ${comp.chipId}`);
  comp.pins[name].voltage = val === 1 ? 5.0 : 0.0;
}
function setPins(comp, map) { for (const [n,v] of Object.entries(map)) setPin(comp, n, v); }
function getPin(comp, name) {
  if (!comp.pins[name]) throw new Error(`Pin ${name} not found on ${comp.chipId}`);
  const v = comp.pins[name].voltage;
  if (v === null || v === undefined) return null;
  return v > 2.5 ? 1 : 0;
}

SIM._readGateInputs = function(comp, inputs) {
  return inputs.map(name => {
    const v = comp.pins[name]?.voltage;
    if (v === null || v === undefined) return 0;
    return v > 2.5 ? 1 : 0;
  });
};
SIM._drivePinBit = function(comp, name, bit) {
  const newV = bit ? 5.0 : 0.0;
  const old = comp.pins[name]?.voltage;
  if (!comp.pins[name]) comp.pins[name] = { voltage: newV };
  else comp.pins[name].voltage = newV;
  return old !== newV;
};
SIM._drivePinHighZ = function(comp, name) {
  const old = comp.pins[name]?.voltage;
  if (!comp.pins[name]) comp.pins[name] = { voltage: null };
  else comp.pins[name].voltage = null;
  return old !== null;
};

function evalGate(comp, gateIdx = 0) {
  const gate = comp.spec.gates[gateIdx];
  switch (gate.type) {
    case 'SHIFT_REG_8BIT_SIGN_EXT':       SIM._evaluateShiftReg8BitSignExt(comp, gate); break;
    case 'SHIFT_REG_8BIT_BIDIR_CLR_TRI':  SIM._evaluateShiftReg8BitBidirClrTri(comp, gate); break;
    case 'VCO_SINGLE_EN':                 SIM._evaluateVcoSingleEn(comp, gate); break;
    case 'VCO_DUAL':                      SIM._evaluateVcoDual(comp, gate); break;
    case 'VCO_DUAL_EN':                   SIM._evaluateVcoDualEn(comp, gate); break;
    case 'PLA_12IN_6OUT_TRI':             SIM._evaluatePla12in6outTri(comp, gate); break;
    case 'PLA_12IN_6OUT_OC':              SIM._evaluatePla12in6outOC(comp, gate); break;
    case 'PLA_12IN_6OUT_SREG_TRI':        SIM._evaluatePla12in6outSregTri(comp, gate); break;
    case 'PLA_12IN_6OUT_SREG_OC':         SIM._evaluatePla12in6outSregOC(comp, gate); break;
    case 'CLK_DRIVER_QUAD_TRI':           SIM._evaluateClkDriverQuadTri(comp, gate); break;
    case 'BUFFER_OCT_INV_ST_TRI':         SIM._evaluateBufferOctInvStTri(comp, gate); break;
    case 'BUFFER_OCT_ST_TRI':             SIM._evaluateBufferOctStTri(comp, gate); break;
    default: throw new Error(`Unknown gate type: ${gate.type}`);
  }
}

function risingEdge(comp, clkPin, gateIdx = 0) {
  setPin(comp, clkPin, 0); evalGate(comp, gateIdx);
  setPin(comp, clkPin, 1); evalGate(comp, gateIdx);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 74322 - 8 bit Shift Register, Sign Extend
// ═══════════════════════════════════════════════════════════════════════════════
test('74322 exists', () => assert(CHIPS_BLOCK_21['74322']));

test('74322 parallel load S=0', () => {
  const c = makeComp('74322');
  setPins(c, {S:0, D0:1,D1:0,D2:1,D3:1,D4:0,D5:1,D6:0,D7:1, SER:0, OEn:0, CLK:0});
  risingEdge(c,'CLK');
  assertEqual(getPin(c,'Q0'), 1, 'Q0=1');
  assertEqual(getPin(c,'Q1'), 0, 'Q1=0');
  assertEqual(getPin(c,'Q7'), 1, 'Q7=1');
});

test('74322 sign extend S=1: MSB=1 shifts in 1s', () => {
  const c = makeComp('74322');
  // Load 0x80 (MSB=1)
  setPins(c, {S:0, D0:0,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:1, SER:0, OEn:0, CLK:0});
  risingEdge(c,'CLK');
  assertEqual(getPin(c,'Q7'), 1, 'Q7=1 after load');
  // Shift right: MSB (1) extends
  setPin(c,'S',1);
  risingEdge(c,'CLK');
  assertEqual(getPin(c,'Q7'), 1, 'Q7 still 1 (sign extend)');
  assertEqual(getPin(c,'Q6'), 1, 'Q6=1 (extends into Q6)');
});

test('74322 sign extend S=1: MSB=0 shifts in 0s', () => {
  const c = makeComp('74322');
  // Load 0x7F (MSB=0)
  setPins(c, {S:0, D0:1,D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:0, SER:0, OEn:0, CLK:0});
  risingEdge(c,'CLK');
  assertEqual(getPin(c,'Q7'), 0, 'Q7=0');
  setPin(c,'S',1);
  risingEdge(c,'CLK');
  assertEqual(getPin(c,'Q7'), 0, 'Q7=0 (sign extend preserves 0)');
});

test('74322 OEn=1 → HiZ', () => {
  const c = makeComp('74322');
  setPins(c, {S:0, D0:1,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0, SER:0, OEn:1, CLK:0});
  risingEdge(c,'CLK');
  assertEqual(getPin(c,'Q0'), null, 'Q0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74323 - 8 bit Bidirectional Universal Shift Reg, Sync Clear
// ═══════════════════════════════════════════════════════════════════════════════
test('74323 exists', () => assert(CHIPS_BLOCK_21['74323']));

test('74323 synchronous clear CLRn=0', () => {
  const c = makeComp('74323');
  // First load all 1s via parallel load (S0=1,S1=1)
  setPins(c, {S0:1,S1:1,SR:0,SL:0,OEAn:0,OEBn:0,CLRn:1,
    QA:1,QB:1,QC:1,QD:1,QE:1,QF:1,QG:1,QH:1,CLK:0});
  // The parallel load mode uses QA..QH inputs; but we need QD_I/QC_I for input pins
  // Use the actual pin names from spec
  const c2 = makeComp('74323');
  setPins(c2, {S0:1,S1:1,SR:0,SL:0,OEAn:0,OEBn:0,CLRn:1,CLK:0,QD_I:1,QC_I:1});
  // QA..QH are output pins, so set them externally
  c2.pins['QA'].voltage = 5.0;
  c2.pins['QB'].voltage = 5.0;
  c2.pins['QC'].voltage = 5.0;
  c2.pins['QD'].voltage = 5.0;
  c2.pins['QE'].voltage = 5.0;
  c2.pins['QF'].voltage = 5.0;
  c2.pins['QG'].voltage = 5.0;
  c2.pins['QH'].voltage = 5.0;
  risingEdge(c2,'CLK');
  // Now clear
  setPin(c2,'S0',0); setPin(c2,'S1',0); setPin(c2,'CLRn',0);
  risingEdge(c2,'CLK');
  setPin(c2,'CLRn',1);
  evalGate(c2);
  assertEqual(getPin(c2,'QA'), 0, 'QA=0 after clear');
  assertEqual(getPin(c2,'QH'), 0, 'QH=0 after clear');
});

test('74323 shift right (S0=1,S1=0) with SR=1', () => {
  const c = makeComp('74323');
  setPins(c, {S0:1,S1:0,SR:1,SL:0,OEAn:0,OEBn:0,CLRn:1,CLK:0,QD_I:0,QC_I:0});
  c.pins['QA'].voltage = 0;
  c.pins['QB'].voltage = 0;
  c.pins['QC'].voltage = 0;
  c.pins['QD'].voltage = 0;
  c.pins['QE'].voltage = 0;
  c.pins['QF'].voltage = 0;
  c.pins['QG'].voltage = 0;
  c.pins['QH'].voltage = 0;
  risingEdge(c,'CLK');
  // MSB should be SR=1
  assertEqual(getPin(c,'QH'), 1, 'QH=SR=1 after right shift');
  assertEqual(getPin(c,'QA'), 0, 'QA=0 (shifted away)');
});

test('74323 OEAn=1 → QA-QD HiZ', () => {
  const c = makeComp('74323');
  setPins(c, {S0:0,S1:0,SR:0,SL:0,OEAn:1,OEBn:0,CLRn:1,CLK:0,QD_I:0,QC_I:0});
  evalGate(c);
  assertEqual(getPin(c,'QA'), null, 'QA HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74324 - VCO Single, Enable
// ═══════════════════════════════════════════════════════════════════════════════
test('74324 exists', () => assert(CHIPS_BLOCK_21['74324']));

test('74324 EN=1 → OUT=1, OUTn=0', () => {
  const c = makeComp('74324');
  setPin(c,'EN',1); evalGate(c);
  assertEqual(getPin(c,'OUT'), 1, 'OUT=1');
  assertEqual(getPin(c,'OUTn'), 0, 'OUTn=0');
});

test('74324 EN=0 → OUT=0, OUTn=1', () => {
  const c = makeComp('74324');
  setPin(c,'EN',0); evalGate(c);
  assertEqual(getPin(c,'OUT'), 0, 'OUT=0');
  assertEqual(getPin(c,'OUTn'), 1, 'OUTn=1');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74325 - Dual VCO
// ═══════════════════════════════════════════════════════════════════════════════
test('74325 exists', () => assert(CHIPS_BLOCK_21['74325']));

test('74325 VIN1=1 → OUT1=1, OUT1n=0', () => {
  const c = makeComp('74325');
  setPins(c, {VIN1:1, VIN2:0}); evalGate(c);
  assertEqual(getPin(c,'OUT1'), 1, 'OUT1=1');
  assertEqual(getPin(c,'OUT1n'), 0, 'OUT1n=0');
  assertEqual(getPin(c,'OUT2'), 0, 'OUT2=0');
  assertEqual(getPin(c,'OUT2n'), 1, 'OUT2n=1');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74326 - Dual VCO, Enable
// ═══════════════════════════════════════════════════════════════════════════════
test('74326 exists', () => assert(CHIPS_BLOCK_21['74326']));

test('74326 EN1=1 → OUT1=VIN1, EN1=0 → OUT1=0', () => {
  const c = makeComp('74326');
  setPins(c, {EN1:1,VIN1:1,EN2:0,VIN2:1}); evalGate(c);
  assertEqual(getPin(c,'OUT1'), 1, 'OUT1=1 (EN=1,VIN=1)');
  assertEqual(getPin(c,'OUT2'), 0, 'OUT2=0 (EN=0)');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74327 - Dual VCO (no enable)
// ═══════════════════════════════════════════════════════════════════════════════
test('74327 exists', () => assert(CHIPS_BLOCK_21['74327']));

test('74327 dual outputs follow VIN', () => {
  const c = makeComp('74327');
  setPins(c, {VIN1:0, VIN2:1}); evalGate(c);
  assertEqual(getPin(c,'OUT1'), 0, 'OUT1=0');
  assertEqual(getPin(c,'OUT1n'), 1, 'OUT1n=1');
  assertEqual(getPin(c,'OUT2'), 1, 'OUT2=1');
  assertEqual(getPin(c,'OUT2n'), 0, 'OUT2n=0');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74330 - PLA, 12in, 6out, Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74330 exists', () => assert(CHIPS_BLOCK_21['74330']));

test('74330 OEn=0 → all outputs 0 (stub)', () => {
  const c = makeComp('74330');
  setPins(c, {OEn:0,I0:1,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0}); evalGate(c);
  assertEqual(getPin(c,'F0'), 0, 'F0=0');
  assertEqual(getPin(c,'F5'), 0, 'F5=0');
});

test('74330 OEn=1 → HiZ', () => {
  const c = makeComp('74330');
  setPins(c, {OEn:1,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0}); evalGate(c);
  assertEqual(getPin(c,'F0'), null, 'F0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74331 - PLA, 12in, 6out, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74331 exists', () => assert(CHIPS_BLOCK_21['74331']));

test('74331 OEn=0 → outputs 0', () => {
  const c = makeComp('74331');
  setPins(c, {OEn:0,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0}); evalGate(c);
  assertEqual(getPin(c,'F0'), 0, 'F0=0');
});

test('74331 OEn=1 → HiZ', () => {
  const c = makeComp('74331');
  setPins(c, {OEn:1,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0}); evalGate(c);
  assertEqual(getPin(c,'F0'), null, 'F0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74333 - PLA with state regs, tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74333 exists', () => assert(CHIPS_BLOCK_21['74333']));

test('74333 OEn=0 → outputs 0', () => {
  const c = makeComp('74333');
  setPins(c, {OEn:0,CLK:0,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), 0, 'F0=0');
  assertEqual(getPin(c,'F5'), 0, 'F5=0');
});

test('74333 OEn=1 → HiZ', () => {
  const c = makeComp('74333');
  setPins(c, {OEn:1,CLK:0,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), null, 'F0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74334 - PLA, 12in, 6out, tri-state (no state regs)
// ═══════════════════════════════════════════════════════════════════════════════
test('74334 exists', () => assert(CHIPS_BLOCK_21['74334']));

test('74334 OEn=0 → outputs 0', () => {
  const c = makeComp('74334');
  setPins(c, {OEn:0,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), 0, 'F0=0');
});

test('74334 OEn=1 → HiZ', () => {
  const c = makeComp('74334');
  setPins(c, {OEn:1,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), null, 'F0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74335 - PLA with state regs, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74335 exists', () => assert(CHIPS_BLOCK_21['74335']));

test('74335 OEn=0 → outputs 0', () => {
  const c = makeComp('74335');
  setPins(c, {OEn:0,CLK:0,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), 0, 'F0=0');
});

test('74335 OEn=1 → HiZ', () => {
  const c = makeComp('74335');
  setPins(c, {OEn:1,CLK:0,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), null, 'F0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74336 - PLA, 12in, 6out, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74336 exists', () => assert(CHIPS_BLOCK_21['74336']));

test('74336 OEn=0 → outputs 0', () => {
  const c = makeComp('74336');
  setPins(c, {OEn:0,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), 0, 'F0=0');
});

test('74336 OEn=1 → HiZ', () => {
  const c = makeComp('74336');
  setPins(c, {OEn:1,I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,I8:0,I9:0,I10:0,I11:0});
  evalGate(c);
  assertEqual(getPin(c,'F0'), null, 'F0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74337 - Quad Clock Driver, Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74337 exists', () => assert(CHIPS_BLOCK_21['74337']));

test('74337 OE1n=0: OUT1=CLK1, OUT1n=!CLK1', () => {
  const c = makeComp('74337');
  setPins(c, {OE1n:0,CLK1:1,OE2n:1,CLK2:0,OE3n:1,CLK3:0,OE4n:1,CLK4:0});
  evalGate(c);
  assertEqual(getPin(c,'OUT1'), 1, 'OUT1=1');
  assertEqual(getPin(c,'OUT1n'), 0, 'OUT1n=0');
  assertEqual(getPin(c,'OUT2'), null, 'OUT2 HiZ');
});

test('74337 all channels test', () => {
  const c = makeComp('74337');
  setPins(c, {OE1n:0,CLK1:0,OE2n:0,CLK2:1,OE3n:0,CLK3:0,OE4n:0,CLK4:1});
  evalGate(c);
  assertEqual(getPin(c,'OUT1'), 0, 'OUT1=0');
  assertEqual(getPin(c,'OUT1n'), 1, 'OUT1n=1');
  assertEqual(getPin(c,'OUT2'), 1, 'OUT2=1');
  assertEqual(getPin(c,'OUT2n'), 0, 'OUT2n=0');
  assertEqual(getPin(c,'OUT3'), 0, 'OUT3=0');
  assertEqual(getPin(c,'OUT4'), 1, 'OUT4=1');
});

test('74337 OE disabled → HiZ', () => {
  const c = makeComp('74337');
  setPins(c, {OE1n:1,CLK1:1,OE2n:1,CLK2:1,OE3n:1,CLK3:1,OE4n:1,CLK4:1});
  evalGate(c);
  assertEqual(getPin(c,'OUT1'), null, 'OUT1 HiZ');
  assertEqual(getPin(c,'OUT4'), null, 'OUT4 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74340 - Octal Buffer, Inverting, Schmitt, Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74340 exists', () => assert(CHIPS_BLOCK_21['74340']));

test('74340 OE1n=0 → Y1-Y4 inverted', () => {
  const c = makeComp('74340');
  setPins(c, {A1:1,A2:0,A3:1,A4:0,A5:0,A6:0,A7:0,A8:0,OE1n:0,OE2n:1});
  evalGate(c);
  assertEqual(getPin(c,'Y1'), 0, 'Y1=!A1=0');
  assertEqual(getPin(c,'Y2'), 1, 'Y2=!A2=1');
  assertEqual(getPin(c,'Y3'), 0, 'Y3=!A3=0');
  assertEqual(getPin(c,'Y4'), 1, 'Y4=!A4=1');
  assertEqual(getPin(c,'Y5'), null, 'Y5 HiZ');
});

test('74340 OE2n=0 → Y5-Y8 inverted', () => {
  const c = makeComp('74340');
  setPins(c, {A1:0,A2:0,A3:0,A4:0,A5:1,A6:0,A7:1,A8:0,OE1n:1,OE2n:0});
  evalGate(c);
  assertEqual(getPin(c,'Y1'), null, 'Y1 HiZ');
  assertEqual(getPin(c,'Y5'), 0, 'Y5=!A5=0');
  assertEqual(getPin(c,'Y6'), 1, 'Y6=!A6=1');
  assertEqual(getPin(c,'Y7'), 0, 'Y7=!A7=0');
  assertEqual(getPin(c,'Y8'), 1, 'Y8=!A8=1');
});

test('74340 both OE active, all A=1 → all Y=0', () => {
  const c = makeComp('74340');
  setPins(c, {A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,A7:1,A8:1,OE1n:0,OE2n:0});
  evalGate(c);
  for (let i = 1; i <= 8; i++) assertEqual(getPin(c,`Y${i}`), 0, `Y${i}=0`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74341 - Octal Buffer, Non-Inverting, Schmitt, Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74341 exists', () => assert(CHIPS_BLOCK_21['74341']));

test('74341 OE1n=0 → Y1-Y4 = A (non-inverting)', () => {
  const c = makeComp('74341');
  setPins(c, {A1:1,A2:0,A3:1,A4:0,A5:0,A6:0,A7:0,A8:0,OE1n:0,OE2n:1});
  evalGate(c);
  assertEqual(getPin(c,'Y1'), 1, 'Y1=A1=1');
  assertEqual(getPin(c,'Y2'), 0, 'Y2=A2=0');
  assertEqual(getPin(c,'Y3'), 1, 'Y3=A3=1');
  assertEqual(getPin(c,'Y4'), 0, 'Y4=A4=0');
  assertEqual(getPin(c,'Y5'), null, 'Y5 HiZ');
});

test('74341 OE1n=1 → Y1-Y4 HiZ', () => {
  const c = makeComp('74341');
  setPins(c, {A1:1,A2:1,A3:1,A4:1,A5:0,A6:0,A7:0,A8:0,OE1n:1,OE2n:0});
  evalGate(c);
  assertEqual(getPin(c,'Y1'), null, 'Y1 HiZ');
  assertEqual(getPin(c,'Y5'), 0, 'Y5=A5=0');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74344 - Octal Buffer, Non-Inverting, Schmitt, Tri-state (same type as 74341)
// ═══════════════════════════════════════════════════════════════════════════════
test('74344 exists', () => assert(CHIPS_BLOCK_21['74344']));

test('74344 OE2n=0 → Y5-Y8 = A', () => {
  const c = makeComp('74344');
  setPins(c, {A1:0,A2:0,A3:0,A4:0,A5:1,A6:1,A7:0,A8:1,OE1n:1,OE2n:0});
  evalGate(c);
  assertEqual(getPin(c,'Y5'), 1, 'Y5=1');
  assertEqual(getPin(c,'Y6'), 1, 'Y6=1');
  assertEqual(getPin(c,'Y7'), 0, 'Y7=0');
  assertEqual(getPin(c,'Y8'), 1, 'Y8=1');
  assertEqual(getPin(c,'Y1'), null, 'Y1 HiZ');
});

test('74344 both OE active → all pass through', () => {
  const c = makeComp('74344');
  setPins(c, {A1:1,A2:0,A3:1,A4:0,A5:1,A6:0,A7:1,A8:0,OE1n:0,OE2n:0});
  evalGate(c);
  assertEqual(getPin(c,'Y1'), 1, 'Y1=1');
  assertEqual(getPin(c,'Y2'), 0, 'Y2=0');
  assertEqual(getPin(c,'Y5'), 1, 'Y5=1');
  assertEqual(getPin(c,'Y6'), 0, 'Y6=0');
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed+failed} tests`);
if (failed > 0) process.exit(1);
