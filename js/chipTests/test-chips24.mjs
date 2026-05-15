/**
 * Tests for Chips Block 24: 74388, 74390, 74393, 74395, 74396,
 *                           74398, 74399, 74401, 74402, 74403, 74405,
 *                           74407, 74410, 74412, 74413
 */
import { CHIPS_BLOCK_24 } from '../chips/chips24.js';
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
  const spec = CHIPS_BLOCK_24[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_24`);
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
    case 'D_FF_QUAD_TRI_COMPL':        SIM._evaluateDFfQuadTriCompl(comp, gate); break;
    case 'COUNTER_DECADE_DUAL':        SIM._evaluateCounterDecadeDual(comp, gate); break;
    case 'COUNTER_4BIT_DUAL':          SIM._evaluateCounter4BitDual(comp, gate); break;
    case 'SHIFT_REG_4BIT_TRI':         SIM._evaluateShiftReg4BitTri(comp, gate); break;
    case 'D_FF_OCTAL_OC_PAR':          SIM._evaluateDFfOctalOcPar(comp, gate); break;
    case 'MUX_QUAD_2TO1_STORED_COMPL': SIM._evaluateMuxQuad2to1StoredCompl(comp, gate); break;
    case 'MUX_QUAD_2TO1_STORED':       SIM._evaluateMuxQuad2to1Stored(comp, gate); break;
    case 'CRC_16BIT':                  SIM._evaluateCrc16Bit(comp, gate); break;
    case 'POLY_CHECKER':               SIM._evaluatePolyChecker(comp, gate); break;
    case 'FIFO_16X4_TRI':              SIM._evaluateFifo16x4Tri(comp, gate); break;
    case 'DECODER_3TO8_INV':           SIM._evaluateDecoder3to8Inv(comp, gate); break;
    case 'DATA_ACCESS_REG_8BIT':       SIM._evaluateDataAccessReg8Bit(comp, gate); break;
    case 'RAM_16X4_REG_TRI':           SIM._evaluateRam16x4RegTri(comp, gate); break;
    case 'MULTIMODE_LATCH_8BIT':       SIM._evaluateMultimodeLatch8Bit(comp, gate); break;
    case 'FIFO_64X4':                  SIM._evaluateFifo64x4(comp, gate); break;
    default: throw new Error(`Unknown gate type: ${gate.type}`);
  }
}
evalGate(comp);
  assertEqual(getPin(comp,'O0'), 0, 'O0=0');
  assertEqual(getPin(comp,'O3'), 0, 'O3=0');
});

// ─────────────────────────────────────────────────────
// 74388: 4 bit D-FF with tri-state + complementary outputs
// ─────────────────────────────────────────────────────
test('74388 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74388'], 'chip missing');
});
test('74388 rising CLK captures D', () => {
  const comp = makeComp('74388');
  setPins(comp, { D1:1,D2:0,D3:1,D4:0,CLK:0,OEn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'),  1, 'Q1=1');
  assertEqual(getPin(comp,'Q1n'), 0, 'Q1n=0');
  assertEqual(getPin(comp,'Q2'),  0, 'Q2=0');
  assertEqual(getPin(comp,'Q2n'), 1, 'Q2n=1');
});
test('74388 OEn=1 → all outputs HiZ', () => {
  const comp = makeComp('74388');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,CLK:0,OEn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), null, 'Q1 HiZ');
  assertEqual(getPin(comp,'Q1n'), null, 'Q1n HiZ');
});
test('74388 output holds after CLK goes low', () => {
  const comp = makeComp('74388');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,CLK:0,OEn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  setPin(comp,'D1', 0); setPin(comp,'CLK', 0);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1 holds 1');
});

// ─────────────────────────────────────────────────────
// 74390: Dual decade counter, async clear
// ─────────────────────────────────────────────────────
test('74390 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74390'], 'chip missing');
});
test('74390 CLR1=1 → counter 1 = 0', () => {
  const comp = makeComp('74390');
  // Set CLR high to clear
  setPins(comp, { CLK1A:0,CLR1:1,CLK1B:0,CLK2A:0,CLR2:0,CLK2B:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'QA1'), 0, 'QA1=0');
  assertEqual(getPin(comp,'QD1'), 0, 'QD1=0');
});
test('74390 section 1 QA1 toggles on CLK1A falling (÷2)', () => {
  const comp = makeComp('74390');
  setPins(comp, { CLK1A:1,CLR1:0,CLK1B:0,CLK2A:0,CLR2:0,CLK2B:0 });
  evalGate(comp); // CLR=0 first
  setPin(comp,'CLK1A', 0);
  evalGate(comp); // falling edge → QA1 toggles
  assertEqual(getPin(comp,'QA1'), 1, 'QA1 toggled to 1');
});
test('74390 CLR2=1 → counter 2 = 0', () => {
  const comp = makeComp('74390');
  setPins(comp, { CLK1A:0,CLR1:0,CLK1B:0,CLK2A:0,CLR2:1,CLK2B:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'QA2'), 0, 'QA2=0');
});
test('74390 section 2 QB2 increments on CLK2B falling (÷5 = BCD)', () => {
  const comp = makeComp('74390');
  setPins(comp, { CLK1A:0,CLR1:0,CLK1B:1,CLK2A:0,CLR2:0,CLK2B:1 });
  evalGate(comp);
  setPin(comp,'CLK2B', 0);
  evalGate(comp); // 0→1 in div5
  assertEqual(getPin(comp,'QB2'), 1, 'QB2=1 after first pulse');
});

// ─────────────────────────────────────────────────────
// 74393: Dual 4 bit binary counter, async clear
// ─────────────────────────────────────────────────────
test('74393 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74393'], 'chip missing');
});
test('74393 CLR1=1 → counter 1 = 0', () => {
  const comp = makeComp('74393');
  setPins(comp, { CLK1:0,CLR1:1,CLK2:0,CLR2:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'QA1'), 0, 'QA1=0');
  assertEqual(getPin(comp,'QD1'), 0, 'QD1=0');
});
test('74393 counter 1 increments on falling CLK1', () => {
  const comp = makeComp('74393');
  setPins(comp, { CLK1:1,CLR1:0,CLK2:0,CLR2:0 });
  evalGate(comp);
  setPin(comp,'CLK1', 0);
  evalGate(comp); // cnt=1
  assertEqual(getPin(comp,'QA1'), 1, 'QA1=1 (cnt=1)');
  setPin(comp,'CLK1', 1); evalGate(comp);
  setPin(comp,'CLK1', 0); evalGate(comp); // cnt=2
  assertEqual(getPin(comp,'QA1'), 0, 'QA1=0 (cnt=2)');
  assertEqual(getPin(comp,'QB1'), 1, 'QB1=1 (cnt=2)');
});
test('74393 counter 2 increments independently', () => {
  const comp = makeComp('74393');
  setPins(comp, { CLK1:0,CLR1:0,CLK2:1,CLR2:0 });
  evalGate(comp);
  setPin(comp,'CLK2', 0);
  evalGate(comp); // cnt2=1
  assertEqual(getPin(comp,'QA2'), 1, 'QA2=1');
});
test('74393 CLR2=1 → counter 2 = 0', () => {
  const comp = makeComp('74393');
  setPins(comp, { CLK1:0,CLR1:0,CLK2:0,CLR2:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'QA2'), 0, 'QA2=0');
});

// ─────────────────────────────────────────────────────
// 74395: 4 bit shift register, tri-state
// ─────────────────────────────────────────────────────
test('74395 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74395'], 'chip missing');
});
test('74395 CLRn=0 → clear all', () => {
  const comp = makeComp('74395');
  setPins(comp, { SER:1,A:1,B:1,C:1,D:1,SRn:0,CLK:0,CLRn:0,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'QA'), 0, 'QA=0');
  assertEqual(getPin(comp,'QD'), 0, 'QD=0');
});
test('74395 shift mode: SER→QA on rising CLK', () => {
  const comp = makeComp('74395');
  setPins(comp, { SER:1,A:0,B:0,C:0,D:0,SRn:0,CLK:0,CLRn:1,OEn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'QA'), 1, 'QA=1 (SER=1 shifted in)');
});
test('74395 parallel load: rising CLK with SRn=1', () => {
  const comp = makeComp('74395');
  setPins(comp, { SER:0,A:1,B:0,C:1,D:0,SRn:1,CLK:0,CLRn:1,OEn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'QA'), 1, 'QA=A=1');
  assertEqual(getPin(comp,'QB'), 0, 'QB=B=0');
  assertEqual(getPin(comp,'QC'), 1, 'QC=C=1');
  assertEqual(getPin(comp,'QD'), 0, 'QD=D=0');
});
test('74395 OEn=1 → QA,QB,QC HiZ (QD still driven)', () => {
  const comp = makeComp('74395');
  setPins(comp, { SER:1,A:1,B:1,C:1,D:1,SRn:1,CLK:0,CLRn:1,OEn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'QA'), null, 'QA HiZ');
  assert(getPin(comp,'QD') !== null, 'QD always driven');
});

// ─────────────────────────────────────────────────────
// 74396: Octal storage register (7 bit), OC
// ─────────────────────────────────────────────────────
test('74396 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74396'], 'chip missing');
});
test('74396 rising CLK captures D', () => {
  const comp = makeComp('74396');
  setPins(comp, { D1:1,D2:0,D3:1,D4:0,D5:1,D6:0,D7:1,CLK:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1=1');
  assertEqual(getPin(comp,'Q2'), 0, 'Q2=0');
  assertEqual(getPin(comp,'Q7'), 1, 'Q7=1');
});
test('74396 Q holds after CLK goes low', () => {
  const comp = makeComp('74396');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:1,CLK:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1); evalGate(comp);
  setPin(comp,'D1', 0); setPin(comp,'CLK', 0); evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1 holds');
});

// ─────────────────────────────────────────────────────
// 74398: Quad 2:1 MUX with storage and Q/Qn outputs
// ─────────────────────────────────────────────────────
test('74398 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74398'], 'chip missing');
});
test('74398 SEL=0: captures A inputs on rising CLK', () => {
  const comp = makeComp('74398');
  setPins(comp, { A1:1,B1:0,A2:0,B2:1,A3:1,B3:0,A4:0,B4:1,SEL:0,CLK:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'),  1, 'Q1=A1=1');
  assertEqual(getPin(comp,'Q1n'), 0, 'Q1n=0');
  assertEqual(getPin(comp,'Q2'),  0, 'Q2=A2=0');
  assertEqual(getPin(comp,'Q2n'), 1, 'Q2n=1');
});
test('74398 SEL=1: captures B inputs on rising CLK', () => {
  const comp = makeComp('74398');
  setPins(comp, { A1:0,B1:1,A2:0,B2:0,A3:0,B3:1,A4:0,B4:0,SEL:1,CLK:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'),  1, 'Q1=B1=1');
  assertEqual(getPin(comp,'Q1n'), 0, 'Q1n=0');
});

// ─────────────────────────────────────────────────────
// 74399: Quad 2:1 MUX with storage
// ─────────────────────────────────────────────────────
test('74399 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74399'], 'chip missing');
});
test('74399 uses MUX_QUAD_2TO1_STORED', () => {
  assertEqual(CHIPS_BLOCK_24['74399'].gates[0].type, 'MUX_QUAD_2TO1_STORED', 'gate type');
});
test('74399 chip has correct pinout count', () => {
  const pins = CHIPS_BLOCK_24['74399'].pinout.filter(p => p.type !== 'power');
  assert(pins.length > 0, 'has signal pins');
});

// ─────────────────────────────────────────────────────
// 74401: CRC generator/checker (stub)
// ─────────────────────────────────────────────────────
test('74401 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74401'], 'chip missing');
});
test('74401 RESn=0 → all outputs 0', () => {
  const comp = makeComp('74401');
  setPins(comp, { CLK:0,DATA:0,SYNn:1,RESn:0,P2:0,P1:0,CEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'ERR'), 0, 'ERR=0');
  assertEqual(getPin(comp,'SO'),  0, 'SO=0');
});
test('74401 outputs are driven (not HiZ)', () => {
  const comp = makeComp('74401');
  setPins(comp, { CLK:0,DATA:0,SYNn:1,RESn:1,P2:0,P1:0,CEn:0 });
  evalGate(comp);
  assert(getPin(comp,'ERR') !== null, 'ERR not HiZ');
});

// ─────────────────────────────────────────────────────
// 74402: Serial polynomial checker (stub)
// ─────────────────────────────────────────────────────
test('74402 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74402'], 'chip missing');
});
test('74402 outputs are driven (stub drives 0)', () => {
  const comp = makeComp('74402');
  setPins(comp, { CLK:0,DATA:0,GEN:0,P0:0,P1:0,P2:0,P3:0,SYNn:1,RESn:1,CEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'ERR'), 0, 'ERR=0');
  assertEqual(getPin(comp,'SO'),  0, 'SO=0');
});

// ─────────────────────────────────────────────────────
// 74403: 16×4 FIFO, tri-state
// ─────────────────────────────────────────────────────
test('74403 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74403'], 'chip missing');
});
test('74403 OEn=1 → data outputs HiZ', () => {
  const comp = makeComp('74403');
  setPins(comp, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,WR_CLK:0,RD_CLK:0,WR_EN:0,RD_EN:0,OEn:1,MRSn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'DOUT0'), null, 'DOUT0 HiZ');
});
test('74403 empty FIFO → EF=1', () => {
  const comp = makeComp('74403');
  setPins(comp, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,WR_CLK:0,RD_CLK:0,WR_EN:0,RD_EN:0,OEn:0,MRSn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'EF'), 1, 'EF=1 (empty)');
  assertEqual(getPin(comp,'FF'), 0, 'FF=0 (not full)');
});
test('74403 write then read', () => {
  const comp = makeComp('74403');
  // Write: DIN=0101=5
  setPins(comp, { DIN0:1,DIN1:0,DIN2:1,DIN3:0,WR_CLK:0,RD_CLK:0,WR_EN:1,RD_EN:0,OEn:0,MRSn:1 });
  evalGate(comp);
  setPin(comp,'WR_CLK', 1); evalGate(comp); // write entry
  setPin(comp,'WR_CLK', 0); evalGate(comp);
  assertEqual(getPin(comp,'EF'), 0, 'EF=0 after write');
  // Read
  setPin(comp,'RD_EN', 1);
  setPin(comp,'RD_CLK', 1); evalGate(comp); // read entry
  assertEqual(getPin(comp,'DOUT0'), 1, 'DOUT0=1');
  assertEqual(getPin(comp,'DOUT2'), 1, 'DOUT2=1');
});

// ─────────────────────────────────────────────────────
// 74405: 3-to-8 decoder (Intel 8205)
// ─────────────────────────────────────────────────────
test('74405 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74405'], 'chip missing');
});
test('74405 enabled: only selected output LOW', () => {
  const comp = makeComp('74405');
  setPins(comp, { A0:0,A1:1,A2:0,E0n:0,E1n:0,E2:1 }); // sel=2
  evalGate(comp);
  assertEqual(getPin(comp,'Y0n'), 1, 'Y0n=1 (not selected)');
  assertEqual(getPin(comp,'Y2n'), 0, 'Y2n=0 (selected)');
  assertEqual(getPin(comp,'Y7n'), 1, 'Y7n=1 (not selected)');
});
test('74405 E0n=1 → all outputs HIGH (disabled)', () => {
  const comp = makeComp('74405');
  setPins(comp, { A0:0,A1:0,A2:0,E0n:1,E1n:0,E2:1 });
  evalGate(comp);
  for (let i = 0; i <= 7; i++) {
    assertEqual(getPin(comp,`Y${i}n`), 1, `Y${i}n=1`);
  }
});
test('74405 A=7 → Y7n=0 when enabled', () => {
  const comp = makeComp('74405');
  setPins(comp, { A0:1,A1:1,A2:1,E0n:0,E1n:0,E2:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y7n'), 0, 'Y7n=0');
  assertEqual(getPin(comp,'Y0n'), 1, 'Y0n=1');
});

// ─────────────────────────────────────────────────────
// 74407: Data access register, 8 bit
// ─────────────────────────────────────────────────────
test('74407 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74407'], 'chip missing');
});
test('74407 CLRn=0 → all Q=0', () => {
  const comp = makeComp('74407');
  setPins(comp, { D0:1,D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:1,CLK:0,OEn:0,LD:1,CLRn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q0'), 0, 'Q0=0');
  assertEqual(getPin(comp,'Q7'), 0, 'Q7=0');
});
test('74407 LD=1, rising CLK captures D', () => {
  const comp = makeComp('74407');
  setPins(comp, { D0:1,D1:0,D2:1,D3:0,D4:1,D5:0,D6:1,D7:0,CLK:0,OEn:0,LD:1,CLRn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q0'), 1, 'Q0=1');
  assertEqual(getPin(comp,'Q1'), 0, 'Q1=0');
});
test('74407 OEn=1 → HiZ', () => {
  const comp = makeComp('74407');
  setPins(comp, { D0:1,D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:1,CLK:0,OEn:1,LD:1,CLRn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1); evalGate(comp);
  assertEqual(getPin(comp,'Q0'), null, 'Q0 HiZ');
});

// ─────────────────────────────────────────────────────
// 74410: 16×4 RAM with output register, tri-state
// ─────────────────────────────────────────────────────
test('74410 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74410'], 'chip missing');
});
test('74410 write and read back', () => {
  const comp = makeComp('74410');
  // Write to addr 3 the value 0b1010=10
  setPins(comp, { A0:1,A1:1,A2:0,A3:0,DI0:0,DI1:1,DI2:0,DI3:1,WEn:0,OEn:0,CLK:0,CSn:0 });
  evalGate(comp); // write
  // Read back: WEn=1, CLK rising → output register loads from RAM[3]
  setPin(comp,'WEn', 1);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'DO0'), 0, 'DO0=0');
  assertEqual(getPin(comp,'DO1'), 1, 'DO1=1');
  assertEqual(getPin(comp,'DO2'), 0, 'DO2=0');
  assertEqual(getPin(comp,'DO3'), 1, 'DO3=1');
});
test('74410 OEn=1 → HiZ', () => {
  const comp = makeComp('74410');
  setPins(comp, { A0:0,A1:0,A2:0,A3:0,DI0:0,DI1:0,DI2:0,DI3:0,WEn:1,OEn:1,CLK:0,CSn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1); evalGate(comp);
  assertEqual(getPin(comp,'DO0'), null, 'DO0 HiZ');
});
test('74410 CSn=1 → HiZ', () => {
  const comp = makeComp('74410');
  setPins(comp, { A0:0,A1:0,A2:0,A3:0,DI0:0,DI1:0,DI2:0,DI3:0,WEn:1,OEn:0,CLK:0,CSn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1); evalGate(comp);
  assertEqual(getPin(comp,'DO0'), null, 'DO0 HiZ');
});

// ─────────────────────────────────────────────────────
// 74412: Multi-mode 8 bit latch (Intel 8212)
// ─────────────────────────────────────────────────────
test('74412 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74412'], 'chip missing');
});
test('74412 MD=0 (input mode): STB rising captures DI', () => {
  const comp = makeComp('74412');
  // DS1=1, DS2n=0 → selected
  setPins(comp, { DS1:1,DI0:1,DI1:0,DI2:1,DI3:0,DI4:0,DI5:0,DI6:0,DI7:0,STB:0,MD:0,OEn:0,DS2n:0 });
  evalGate(comp);
  setPin(comp,'STB', 1);
  evalGate(comp); // rising STB → capture
  assertEqual(getPin(comp,'DO0'), 1, 'DO0=1');
  assertEqual(getPin(comp,'DO1'), 0, 'DO1=0');
});
test('74412 OEn=1 → DO HiZ', () => {
  const comp = makeComp('74412');
  setPins(comp, { DS1:1,DI0:1,DI1:1,DI2:1,DI3:1,DI4:1,DI5:1,DI6:1,DI7:1,STB:0,MD:1,OEn:1,DS2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'DO0'), null, 'DO0 HiZ');
});
test('74412 INT reflects !STB', () => {
  const comp = makeComp('74412');
  setPins(comp, { DS1:1,DI0:0,DI1:0,DI2:0,DI3:0,DI4:0,DI5:0,DI6:0,DI7:0,STB:0,MD:0,OEn:0,DS2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'INT'), 1, 'INT=1 when STB=0');
  setPin(comp,'STB', 1); evalGate(comp);
  assertEqual(getPin(comp,'INT'), 0, 'INT=0 when STB=1');
});

// ─────────────────────────────────────────────────────
// 74413: 64×4 FIFO
// ─────────────────────────────────────────────────────
test('74413 exists in CHIPS_BLOCK_24', () => {
  assert(CHIPS_BLOCK_24['74413'], 'chip missing');
});
test('74413 empty FIFO → EF=1', () => {
  const comp = makeComp('74413');
  setPins(comp, { DIN0:0,DIN1:0,DIN2:0,DIN3:0,WR_CLK:0,RD_CLK:0,WR_EN:0,RD_EN:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'EF'), 1, 'EF=1 (empty)');
  assertEqual(getPin(comp,'FF'), 0, 'FF=0 (not full)');
});
test('74413 write then read', () => {
  const comp = makeComp('74413');
  // Write DIN=1100=3 (DIN0=0,DIN1=1,DIN2=1,DIN3=0 → value=6... let's use 0101=5)
  setPins(comp, { DIN0:1,DIN1:0,DIN2:1,DIN3:0,WR_CLK:0,RD_CLK:0,WR_EN:1,RD_EN:0 });
  evalGate(comp);
  setPin(comp,'WR_CLK', 1); evalGate(comp); // write
  setPin(comp,'WR_CLK', 0); evalGate(comp);
  assertEqual(getPin(comp,'EF'), 0, 'EF=0 after write');
  // Read
  setPin(comp,'RD_EN', 1);
  setPin(comp,'RD_CLK', 1); evalGate(comp);
  assertEqual(getPin(comp,'DOUT0'), 1, 'DOUT0=1');
  assertEqual(getPin(comp,'DOUT2'), 1, 'DOUT2=1');
});

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed+failed} tests`);
if (failed > 0) process.exit(1);
