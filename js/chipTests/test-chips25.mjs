/**
 * Tests for Chips Block 25: 74414, 74416, 74417, 74424, 74425, 74426,
 *                           74432, 74433, 74436, 74437, 74440, 74441,
 *                           74442, 74443, 74444, 74445
 */
import { CHIPS_BLOCK_25 } from '../chips/chips25.js';
import { CircuitSimulator } from '../simulator.js';

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; }
  catch (e) { failed++; console.error(`FAIL: ${name}\n  ${e.message}`); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(`${msg || ''}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

const SIM = new CircuitSimulator();

function makeComp(chipId) {
  const spec = CHIPS_BLOCK_25[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_25`);
  const comp = { id: `test_${chipId}`, chipId, spec, pins: {}, state: {} };
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
SIM._drivePinOC = function(comp, name, bit) {
  // OC stub: bit=0 sinks to GND; bit=1 is HiZ but the implicit 4.7kΩ pull-up
  // in production resolves to ~5V, so model the resolved value here.
  const newV = bit ? 5.0 : 0.0;
  const old = comp.pins[name]?.voltage;
  if (!comp.pins[name]) comp.pins[name] = { voltage: newV };
  else comp.pins[name].voltage = newV;
  return old !== newV;
};
SIM._drivePinBitsOC = function(comp, names, bits) {
  let changed = false;
  for (let i = 0; i < names.length; i++) {
    if (SIM._drivePinOC(comp, names[i], bits[i])) changed = true;
  }
  return changed;
};

function evalGate(comp, gateIdx = 0) {
  const gate = comp.spec.gates[gateIdx];
  switch (gate.type) {
    case 'INTR_PRIORITY_CTRL':    SIM._evaluateIntrPriorityCtrl(comp, gate); break;
    case 'BUS_XCVR_4BIT_TRI':    SIM._evaluateBusXcvr4BitTri(comp, gate); break;
    case 'COUNTER_MOD2_MOD5':    SIM._evaluateCounterMod2Mod5(comp, gate); break;
    case 'CLK_GEN_TWOPHASE':     SIM._evaluateClkGenTwophase(comp, gate); break;
    case 'BUFFER_QUAD_TRI_NLOW': SIM._evaluateBufferQuadTriNlow(comp, gate); break;
    case 'BUFFER_QUAD_TRI_NHIGH':SIM._evaluateBufferQuadTriNhigh(comp, gate); break;
    case 'MULTIMODE_LATCH_8BIT': SIM._evaluateMultimodeLatch8Bit(comp, gate); break;
    case 'FIFO_64X4_TRI':        SIM._evaluateFifo64x4Tri(comp, gate); break;
    case 'LINE_DRIVER_6X':       SIM._evaluateLineDriver6x(comp, gate); break;
    case 'BUS_XCVR_QUAD_TRI_OC': SIM._evaluateBusXcvrQuadTriOc(comp, gate); break;
    case 'BUS_XCVR_QUAD_INV_OC': SIM._evaluateBusXcvrQuadInvOc(comp, gate); break;
    case 'BUS_XCVR_QUAD_TRI':    SIM._evaluateBusXcvrQuadTri(comp, gate); break;
    case 'BUS_XCVR_QUAD_INV_TRI':SIM._evaluateBusXcvrQuadInvTri(comp, gate); break;
    case 'BUS_XCVR_QUAD_MIX_TRI':SIM._evaluateBusXcvrQuadMixTri(comp, gate); break;
    case 'BCD_DECIMAL':          SIM._evaluateBCDDecimal(comp, gate); break;
    default: throw new Error(`Unknown gate type: ${gate.type}`);
  }
}

// ─────────────────────────────────────────────────────
// 74414: Interrupt Priority Controller (stub)
// ─────────────────────────────────────────────────────
test('74414 exists in CHIPS_BLOCK_25', () => {
  assert(CHIPS_BLOCK_25['74x414'], 'chip missing');
});
test('74414 stub outputs all LOW', () => {
  const comp = makeComp('74x414');
  setPins(comp, { R0:0,R1:0,R2:0,R3:0,R4:0,R5:0,R6:0,R7:0,EI:0,CLK:0,SGS:0,ENLG:0,S0:0,S1:0,S2:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B0'), 0, 'B0');
  assertEqual(getPin(comp,'B1'), 0, 'B1');
  assertEqual(getPin(comp,'B2'), 0, 'B2');
  assertEqual(getPin(comp,'INT'), 0, 'INT');
  assertEqual(getPin(comp,'OINT'), 0, 'OINT');
  assertEqual(getPin(comp,'PINT'), 0, 'PINT');
  assertEqual(getPin(comp,'INTB'), 0, 'INTB');
});
test('74414 stub outputs LOW with all inputs HIGH', () => {
  const comp = makeComp('74x414');
  setPins(comp, { R0:1,R1:1,R2:1,R3:1,R4:1,R5:1,R6:1,R7:1,EI:1,CLK:1,SGS:1,ENLG:1,S0:1,S1:1,S2:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'B0'), 0, 'B0 still LOW');
  assertEqual(getPin(comp,'INT'), 0, 'INT still LOW');
});

// ─────────────────────────────────────────────────────
// 74416: 4 bit Bidirectional Bus Transceiver
// ─────────────────────────────────────────────────────
test('74416 exists', () => {
  assert(CHIPS_BLOCK_25['74x416'], 'chip missing');
});
test('74416 OEn=1 → all HiZ', () => {
  const comp = makeComp('74x416');
  setPins(comp, { OEn:1, DIR:0, A1:1,A2:0,A3:1,A4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), null, 'B1 HiZ');
  assertEqual(getPin(comp,'B2'), null, 'B2 HiZ');
  assertEqual(getPin(comp,'B3'), null, 'B3 HiZ');
  assertEqual(getPin(comp,'B4'), null, 'B4 HiZ');
});
test('74416 OEn=0,DIR=0 → A→B pass-through', () => {
  const comp = makeComp('74x416');
  setPins(comp, { OEn:0, DIR:0, A1:1,A2:0,A3:1,A4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), 1, 'B1=A1');
  assertEqual(getPin(comp,'B2'), 0, 'B2=A2');
  assertEqual(getPin(comp,'B3'), 1, 'B3=A3');
  assertEqual(getPin(comp,'B4'), 0, 'B4=A4');
});
test('74416 OEn=0,DIR=1 → HiZ (B→A direction, stub)', () => {
  const comp = makeComp('74x416');
  setPins(comp, { OEn:0, DIR:1, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), null, 'B1 HiZ');
  assertEqual(getPin(comp,'B4'), null, 'B4 HiZ');
});

// ─────────────────────────────────────────────────────
// 74417: Modulo-2 / Modulo-5 Counter
// ─────────────────────────────────────────────────────
test('74417 exists', () => {
  assert(CHIPS_BLOCK_25['74x417'], 'chip missing');
});
test('74417 CLRn=0 → Q=0', () => {
  const comp = makeComp('74x417');
  setPins(comp, { CLK2:0,CLK5:0,P0:1,P1:1,P2:1,LD:0,CLRn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q0'), 0, 'Q0=0');
  assertEqual(getPin(comp,'Q1'), 0, 'Q1=0');
  assertEqual(getPin(comp,'Q2'), 0, 'Q2=0');
});
test('74417 LD=1 loads P values', () => {
  const comp = makeComp('74x417');
  setPins(comp, { CLK2:0,CLK5:0,P0:1,P1:0,P2:1,LD:1,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q0'), 1, 'Q0=P0=1');
  assertEqual(getPin(comp,'Q1'), 0, 'Q1=P1=0');
  assertEqual(getPin(comp,'Q2'), 1, 'Q2=P2=1');
});
test('74417 CLK2 falling edge toggles Q0', () => {
  const comp = makeComp('74x417');
  // Clear first
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:0 });
  evalGate(comp);
  // CLRn=1, CLK2 high→low: toggle Q0
  setPins(comp, { CLK2:1,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q0'), 1, 'Q0 toggled to 1');
  // Toggle again
  setPins(comp, { CLK2:1,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q0'), 0, 'Q0 back to 0');
});
test('74417 CLK5 falling edge advances mod-5 counter', () => {
  const comp = makeComp('74x417');
  // Clear
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:0 });
  evalGate(comp);
  // div5 starts at 0: Q1=0,Q2=0
  assertEqual(getPin(comp,'Q1'), 0, 'initial Q1=0');
  assertEqual(getPin(comp,'Q2'), 0, 'initial Q2=0');
  // 1st tick: div5→1: Q1=(1>>0)&1=1, Q2=(1>>1)&1=0
  setPins(comp, { CLK2:0,CLK5:1,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'tick1 Q1=1');
  assertEqual(getPin(comp,'Q2'), 0, 'tick1 Q2=0');
  // 2nd tick: div5→2: Q1=0, Q2=1
  setPins(comp, { CLK2:0,CLK5:1,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 0, 'tick2 Q1=0');
  assertEqual(getPin(comp,'Q2'), 1, 'tick2 Q2=1');
  // 3rd tick: div5→3: Q1=1, Q2=1
  setPins(comp, { CLK2:0,CLK5:1,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'tick3 Q1=1');
  assertEqual(getPin(comp,'Q2'), 1, 'tick3 Q2=1');
  // 4th tick: div5→4: Q1=(4>>0)&1=0, Q2=(4>>1)&1=0
  setPins(comp, { CLK2:0,CLK5:1,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 0, 'tick4 Q1=0');
  assertEqual(getPin(comp,'Q2'), 0, 'tick4 Q2=0');
  // 5th tick: div5 wraps to 0: Q1=0,Q2=0
  setPins(comp, { CLK2:0,CLK5:1,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  setPins(comp, { CLK2:0,CLK5:0,P0:0,P1:0,P2:0,LD:0,CLRn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 0, 'tick5 Q1=0 (wrapped)');
  assertEqual(getPin(comp,'Q2'), 0, 'tick5 Q2=0 (wrapped)');
});

// ─────────────────────────────────────────────────────
// 74424: Two-Phase Clock Gen (stub)
// ─────────────────────────────────────────────────────
test('74424 exists', () => {
  assert(CHIPS_BLOCK_25['74x424'], 'chip missing');
});
test('74424 stub outputs all HiZ', () => {
  const comp = makeComp('74x424');
  setPins(comp, { XTAL1:0,XTAL2:0,RESn:1,RDYn:1,SYNCn:0,TANK:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'PHI1'), null, 'PHI1 HiZ');
  assertEqual(getPin(comp,'PHI2'), null, 'PHI2 HiZ');
  assertEqual(getPin(comp,'OSC'), null, 'OSC HiZ');
  assertEqual(getPin(comp,'OSCn'), null, 'OSCn HiZ');
  assertEqual(getPin(comp,'RESETn'), null, 'RESETn HiZ');
  assertEqual(getPin(comp,'RDYIN'), null, 'RDYIN HiZ');
});

// ─────────────────────────────────────────────────────
// 74425: Quad Buffer, active LOW enables
// ─────────────────────────────────────────────────────
test('74425 exists', () => {
  assert(CHIPS_BLOCK_25['74x425'], 'chip missing');
});
test('74425 En=0 → pass-through', () => {
  const comp = makeComp('74x425');
  setPins(comp, { A1:1,E1n:0, A2:0,E2n:0, A3:1,E3n:0, A4:0,E4n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 1, 'Y1=A1');
  assertEqual(getPin(comp,'Y2'), 0, 'Y2=A2');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3=A3');
  assertEqual(getPin(comp,'Y4'), 0, 'Y4=A4');
});
test('74425 En=1 → HiZ', () => {
  const comp = makeComp('74x425');
  setPins(comp, { A1:1,E1n:1, A2:1,E2n:1, A3:1,E3n:1, A4:1,E4n:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), null, 'Y1 HiZ');
  assertEqual(getPin(comp,'Y2'), null, 'Y2 HiZ');
  assertEqual(getPin(comp,'Y3'), null, 'Y3 HiZ');
  assertEqual(getPin(comp,'Y4'), null, 'Y4 HiZ');
});
test('74425 mixed enables', () => {
  const comp = makeComp('74x425');
  setPins(comp, { A1:1,E1n:0, A2:0,E2n:1, A3:1,E3n:0, A4:0,E4n:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 1, 'Y1 enabled');
  assertEqual(getPin(comp,'Y2'), null, 'Y2 HiZ');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3 enabled');
  assertEqual(getPin(comp,'Y4'), null, 'Y4 HiZ');
});

// ─────────────────────────────────────────────────────
// 74426: Quad Buffer, active HIGH enables
// ─────────────────────────────────────────────────────
test('74426 exists', () => {
  assert(CHIPS_BLOCK_25['74x426'], 'chip missing');
});
test('74426 En=1 → pass-through', () => {
  const comp = makeComp('74x426');
  setPins(comp, { A1:1,E1:1, A2:0,E2:1, A3:1,E3:1, A4:0,E4:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 1, 'Y1=A1');
  assertEqual(getPin(comp,'Y2'), 0, 'Y2=A2');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3=A3');
  assertEqual(getPin(comp,'Y4'), 0, 'Y4=A4');
});
test('74426 En=0 → HiZ', () => {
  const comp = makeComp('74x426');
  setPins(comp, { A1:1,E1:0, A2:1,E2:0, A3:1,E3:0, A4:1,E4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), null, 'Y1 HiZ');
  assertEqual(getPin(comp,'Y2'), null, 'Y2 HiZ');
  assertEqual(getPin(comp,'Y3'), null, 'Y3 HiZ');
  assertEqual(getPin(comp,'Y4'), null, 'Y4 HiZ');
});
test('74426 mixed enables', () => {
  const comp = makeComp('74x426');
  setPins(comp, { A1:1,E1:1, A2:0,E2:0, A3:1,E3:1, A4:0,E4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 1, 'Y1 enabled');
  assertEqual(getPin(comp,'Y2'), null, 'Y2 HiZ');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3 enabled');
  assertEqual(getPin(comp,'Y4'), null, 'Y4 HiZ');
});

// ─────────────────────────────────────────────────────
// 74432: 8 bit Multi-Mode Latch (same as 74412)
// ─────────────────────────────────────────────────────
test('74432 exists', () => {
  assert(CHIPS_BLOCK_25['74x432'], 'chip missing');
});
test('74432 gate type is MULTIMODE_LATCH_8BIT', () => {
  const spec = CHIPS_BLOCK_25['74x432'];
  assertEqual(spec.gates[0].type, 'MULTIMODE_LATCH_8BIT', 'gate type');
});
test('74432 OEn=1 → HiZ', () => {
  const comp = makeComp('74x432');
  setPins(comp, { DS1:1,DI0:1,DI1:1,DI2:1,DI3:1,DI4:1,DI5:1,DI6:1,DI7:1,
                  STB:0,MD:0,OEn:1,DS2n:0 });
  evalGate(comp);
  // Outputs tri stated
  assertEqual(getPin(comp,'DO0'), null, 'DO0 HiZ');
  assertEqual(getPin(comp,'DO7'), null, 'DO7 HiZ');
});

// ─────────────────────────────────────────────────────
// 74433: 64×4 FIFO with tri state outputs
// ─────────────────────────────────────────────────────
test('74433 exists', () => {
  assert(CHIPS_BLOCK_25['74x433'], 'chip missing');
});
test('74433 starts empty (EF=1, FF=0)', () => {
  const comp = makeComp('74x433');
  setPins(comp, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0,RD_CLK:0,WR_EN:0,RD_EN:0,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'EF'), 1, 'EF=1 (empty)');
  assertEqual(getPin(comp,'FF'), 0, 'FF=0 (not full)');
});
test('74433 OEn=1 → DOUT HiZ, EF/FF still driven', () => {
  const comp = makeComp('74x433');
  setPins(comp, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0,RD_CLK:0,WR_EN:0,RD_EN:0,OEn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'DOUT0'), null, 'DOUT0 HiZ');
  assertEqual(getPin(comp,'DOUT3'), null, 'DOUT3 HiZ');
  assertEqual(getPin(comp,'EF'), 1, 'EF still driven');
});
test('74433 write then read', () => {
  const comp = makeComp('74x433');
  // Write 0b1010 = 10
  setPins(comp, { DIN0:0,DIN1:1,DIN2:0,DIN3:1, WR_CLK:0,RD_CLK:0,WR_EN:1,RD_EN:0,OEn:0 });
  evalGate(comp);
  setPins(comp, { DIN0:0,DIN1:1,DIN2:0,DIN3:1, WR_CLK:1,RD_CLK:0,WR_EN:1,RD_EN:0,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'EF'), 0, 'not empty after write');
  // Read
  setPins(comp, { DIN0:0,DIN1:0,DIN2:0,DIN3:0, WR_CLK:0,RD_CLK:1,WR_EN:0,RD_EN:1,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'DOUT0'), 0, 'DOUT0=0');
  assertEqual(getPin(comp,'DOUT1'), 1, 'DOUT1=1');
  assertEqual(getPin(comp,'DOUT2'), 0, 'DOUT2=0');
  assertEqual(getPin(comp,'DOUT3'), 1, 'DOUT3=1');
});

// ─────────────────────────────────────────────────────
// 74436: Line Driver
// ─────────────────────────────────────────────────────
test('74436 exists', () => {
  assert(CHIPS_BLOCK_25['74x436'], 'chip missing');
});
test('74436 OEn=0,EN=1 → Y=A', () => {
  const comp = makeComp('74x436');
  setPins(comp, { A1:1,A2:0,A3:1,A4:0,A5:1,A6:0, OEn:0,EN:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 1, 'Y1=A1');
  assertEqual(getPin(comp,'Y2'), 0, 'Y2=A2');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3=A3');
  assertEqual(getPin(comp,'Y4'), 0, 'Y4=A4');
  assertEqual(getPin(comp,'Y5'), 1, 'Y5=A5');
  assertEqual(getPin(comp,'Y6'), 0, 'Y6=A6');
});
test('74436 OEn=1 → HiZ', () => {
  const comp = makeComp('74x436');
  setPins(comp, { A1:1,A2:1,A3:1,A4:1,A5:1,A6:1, OEn:1,EN:1 });
  evalGate(comp);
  for (let i = 1; i <= 6; i++) assertEqual(getPin(comp,'Y'+i), null, `Y${i} HiZ`);
});
test('74436 EN=0 → HiZ', () => {
  const comp = makeComp('74x436');
  setPins(comp, { A1:1,A2:1,A3:1,A4:1,A5:1,A6:1, OEn:0,EN:0 });
  evalGate(comp);
  for (let i = 1; i <= 6; i++) assertEqual(getPin(comp,'Y'+i), null, `Y${i} HiZ`);
});

// ─────────────────────────────────────────────────────
// 74437: Line Driver (same type as 74436)
// ─────────────────────────────────────────────────────
test('74437 exists', () => {
  assert(CHIPS_BLOCK_25['74x437'], 'chip missing');
});
test('74437 gate type is LINE_DRIVER_6X', () => {
  assertEqual(CHIPS_BLOCK_25['74x437'].gates[0].type, 'LINE_DRIVER_6X', 'gate type');
});
test('74437 OEn=0,EN=1 → Y=A', () => {
  const comp = makeComp('74x437');
  setPins(comp, { A1:0,A2:1,A3:0,A4:1,A5:0,A6:1, OEn:0,EN:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 0, 'Y1');
  assertEqual(getPin(comp,'Y2'), 1, 'Y2');
  assertEqual(getPin(comp,'Y6'), 1, 'Y6');
});

// ─────────────────────────────────────────────────────
// 74440: Quad Tridirectional Bus Transceiver (OC)
// ─────────────────────────────────────────────────────
test('74440 exists', () => {
  assert(CHIPS_BLOCK_25['74x440'], 'chip missing');
});
test('74440 OE1n=0,OE2n=0,DIR=0 → A→B', () => {
  const comp = makeComp('74x440');
  setPins(comp, { OE1n:0,OE2n:0,DIR:0, A1:1,A2:0,A3:1,A4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), 1, 'B1=A1');
  assertEqual(getPin(comp,'B2'), 0, 'B2=A2');
  assertEqual(getPin(comp,'B3'), 1, 'B3=A3');
  assertEqual(getPin(comp,'B4'), 0, 'B4=A4');
});
test('74440 OE1n=1 → HiZ', () => {
  const comp = makeComp('74x440');
  setPins(comp, { OE1n:1,OE2n:0,DIR:0, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});
test('74440 OE2n=1 → HiZ', () => {
  const comp = makeComp('74x440');
  setPins(comp, { OE1n:0,OE2n:1,DIR:0, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});
test('74440 DIR=1 → HiZ (stub)', () => {
  const comp = makeComp('74x440');
  setPins(comp, { OE1n:0,OE2n:0,DIR:1, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});

// ─────────────────────────────────────────────────────
// 74441: Quad Inverting Bus Transceiver (OC)
// ─────────────────────────────────────────────────────
test('74441 exists', () => {
  assert(CHIPS_BLOCK_25['74x441'], 'chip missing');
});
test('74441 OE1n=0,OE2n=0,DIR=0 → B=!A', () => {
  const comp = makeComp('74x441');
  setPins(comp, { OE1n:0,OE2n:0,DIR:0, A1:1,A2:0,A3:1,A4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), 0, 'B1=!A1');
  assertEqual(getPin(comp,'B2'), 1, 'B2=!A2');
  assertEqual(getPin(comp,'B3'), 0, 'B3=!A3');
  assertEqual(getPin(comp,'B4'), 1, 'B4=!A4');
});
test('74441 disabled → HiZ', () => {
  const comp = makeComp('74x441');
  setPins(comp, { OE1n:1,OE2n:0,DIR:0, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});

// ─────────────────────────────────────────────────────
// 74442: Quad Tridirectional Bus Transceiver (tri state)
// ─────────────────────────────────────────────────────
test('74442 exists', () => {
  assert(CHIPS_BLOCK_25['74x442'], 'chip missing');
});
test('74442 OE1n=0,OE2n=0,DIR=0 → A→B', () => {
  const comp = makeComp('74x442');
  setPins(comp, { OE1n:0,OE2n:0,DIR:0, A1:1,A2:0,A3:1,A4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), 1, 'B1=A1');
  assertEqual(getPin(comp,'B2'), 0, 'B2=A2');
  assertEqual(getPin(comp,'B3'), 1, 'B3=A3');
  assertEqual(getPin(comp,'B4'), 0, 'B4=A4');
});
test('74442 disabled → HiZ', () => {
  const comp = makeComp('74x442');
  setPins(comp, { OE1n:0,OE2n:1,DIR:0, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});

// ─────────────────────────────────────────────────────
// 74443: Quad Inverting Bus Transceiver (tri state)
// ─────────────────────────────────────────────────────
test('74443 exists', () => {
  assert(CHIPS_BLOCK_25['74x443'], 'chip missing');
});
test('74443 OE1n=0,OE2n=0,DIR=0 → B=!A', () => {
  const comp = makeComp('74x443');
  setPins(comp, { OE1n:0,OE2n:0,DIR:0, A1:1,A2:0,A3:1,A4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), 0, 'B1=!A1');
  assertEqual(getPin(comp,'B2'), 1, 'B2=!A2');
  assertEqual(getPin(comp,'B3'), 0, 'B3=!A3');
  assertEqual(getPin(comp,'B4'), 1, 'B4=!A4');
});
test('74443 disabled → HiZ', () => {
  const comp = makeComp('74x443');
  setPins(comp, { OE1n:1,OE2n:0,DIR:0, A1:0,A2:0,A3:0,A4:0 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});

// ─────────────────────────────────────────────────────
// 74444: Quad Mixed Bus Transceiver (tri state)
// ─────────────────────────────────────────────────────
test('74444 exists', () => {
  assert(CHIPS_BLOCK_25['74x444'], 'chip missing');
});
test('74444 OE1n=0,OE2n=0,DIR=0 → A→B non-inv', () => {
  const comp = makeComp('74x444');
  setPins(comp, { OE1n:0,OE2n:0,DIR:0, A1:1,A2:0,A3:1,A4:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'B1'), 1, 'B1=A1');
  assertEqual(getPin(comp,'B2'), 0, 'B2=A2');
  assertEqual(getPin(comp,'B3'), 1, 'B3=A3');
  assertEqual(getPin(comp,'B4'), 0, 'B4=A4');
});
test('74444 DIR=1 → HiZ stub', () => {
  const comp = makeComp('74x444');
  setPins(comp, { OE1n:0,OE2n:0,DIR:1, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});
test('74444 disabled → HiZ', () => {
  const comp = makeComp('74x444');
  setPins(comp, { OE1n:1,OE2n:0,DIR:0, A1:1,A2:1,A3:1,A4:1 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) assertEqual(getPin(comp,'B'+i), null, `B${i} HiZ`);
});

// ─────────────────────────────────────────────────────
// 74445: BCD to Decimal Decoder
// ─────────────────────────────────────────────────────
test('74445 exists', () => {
  assert(CHIPS_BLOCK_25['74x445'], 'chip missing');
});
test('74445 gate type is BCD_DECIMAL', () => {
  assertEqual(CHIPS_BLOCK_25['74x445'].gates[0].type, 'BCD_DECIMAL', 'gate type');
});
test('74445 0000 → Y0 LOW (active LOW output)', () => {
  const comp = makeComp('74x445');
  setPins(comp, { A:0,B:0,C:0,D:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y0'), 0, 'Y0=0 (active LOW selected)');
  for (let i = 1; i <= 9; i++) assertEqual(getPin(comp,'Y'+i), 1, `Y${i}=1 (inactive)`);
});
test('74445 0001 → Y1 LOW', () => {
  const comp = makeComp('74x445');
  setPins(comp, { A:1,B:0,C:0,D:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 0, 'Y1=0 (selected)');
  assertEqual(getPin(comp,'Y0'), 1, 'Y0=1 (inactive)');
});
test('74445 1001 → Y9 LOW', () => {
  const comp = makeComp('74x445');
  setPins(comp, { A:1,B:0,C:0,D:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y9'), 0, 'Y9=0 (selected)');
  assertEqual(getPin(comp,'Y0'), 1, 'Y0=1 (inactive)');
});
test('74445 invalid (>9) → all HIGH', () => {
  const comp = makeComp('74x445');
  setPins(comp, { A:0,B:1,C:1,D:1 }); // 0b1110 = 14
  evalGate(comp);
  for (let i = 0; i <= 9; i++) assertEqual(getPin(comp,'Y'+i), 1, `Y${i}=1`);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
