/**
 * Tests for Chips Block 23: 74367, 74368, 74375, 74376,
 *                           74377, 74378, 74379, 74380, 74381, 74382,
 *                           74383, 74384, 74385, 74386
 */
import { CHIPS_BLOCK_23 } from '../chips/chips23.js';
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
  const spec = CHIPS_BLOCK_23[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_23`);
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
    case 'BUFFER_HEX_TRI':        SIM._evaluateBufferHexTri(comp, gate); break;
    case 'BUFFER_HEX_INV_TRI':    SIM._evaluateBufferHexInvTri(comp, gate); break;
    case 'D_LATCH_QUAD_COMPL':    SIM._evaluateDLatchQuadCompl(comp, gate); break;
    case 'JK_NOT_FF_QUAD':        SIM._evaluateJkNotFfQuad(comp, gate); break;
    case 'D_FF_OCTAL_CE':         SIM._evaluateDFfOctalCe(comp, gate); break;
    case 'D_FF_HEX_CE':           SIM._evaluateDFfHexCe(comp, gate); break;
    case 'D_FF_QUAD_CE_COMPL':    SIM._evaluateDFfQuadCeCompl(comp, gate); break;
    case 'MULTI_FUNC_REG_8BIT':   SIM._evaluateMultiFuncReg8Bit(comp, gate); break;
    case 'ALU_4BIT_381':          SIM._evaluateAlu4Bit381(comp, gate); break;
    case 'ALU_4BIT_382':          SIM._evaluateAlu4Bit382(comp, gate); break;
    case 'D_FF_OCTAL_OC':         SIM._evaluateDFfOctalOc(comp, gate); break;
    case 'MULTIPLIER_8X1':        SIM._evaluateMultiplier8x1(comp, gate); break;
    case 'SERIAL_ADDER_QUAD':     SIM._evaluateSerialAdderQuad(comp, gate); break;
    case 'XOR':
      // Standard simple gate: Y = A XOR B
      { const [a,b] = SIM._readGateInputs(comp, gate.inputs);
        SIM._drivePinBit(comp, gate.output, a ^ b); }
      break;
    default: throw new Error(`Unknown gate type: ${gate.type}`);
  }
}

// ─────────────────────────────────────────────────────
// 74367: Hex buffer, non inverting, tri state (like 74365)
// ─────────────────────────────────────────────────────
test('74367 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x367'], 'chip missing');
});
test('74367 uses BUFFER_HEX_TRI', () => {
  assertEqual(CHIPS_BLOCK_23['74x367'].gates[0].type, 'BUFFER_HEX_TRI');
});
test('74367 G1n=0,G2n=0: Y follows A', () => {
  const comp = makeComp('74x367');
  setPins(comp, { A1:1,A2:0,A3:1,A4:0,A5:1,A6:0,G1n:0,G2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 1, 'Y1=1');
  assertEqual(getPin(comp,'Y2'), 0, 'Y2=0');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3=1');
});
test('74367 G1n=1 → HiZ', () => {
  const comp = makeComp('74x367');
  setPins(comp, { A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,G1n:1,G2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), null, 'Y1 HiZ');
});

// ─────────────────────────────────────────────────────
// 74368: Hex buffer, inverting, tri state (like 74366)
// ─────────────────────────────────────────────────────
test('74368 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x368'], 'chip missing');
});
test('74368 uses BUFFER_HEX_INV_TRI', () => {
  assertEqual(CHIPS_BLOCK_23['74x368'].gates[0].type, 'BUFFER_HEX_INV_TRI');
});
test('74368 G1n=0,G2n=0: Y inverts A', () => {
  const comp = makeComp('74x368');
  setPins(comp, { A1:1,A2:0,A3:1,A4:0,A5:1,A6:0,G1n:0,G2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 0, 'Y1=!1=0');
  assertEqual(getPin(comp,'Y2'), 1, 'Y2=!0=1');
  assertEqual(getPin(comp,'Y3'), 0, 'Y3=0');
});
test('74368 G2n=1 → HiZ', () => {
  const comp = makeComp('74x368');
  setPins(comp, { A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,G1n:0,G2n:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), null, 'Y1 HiZ');
});

// (Two orphaned test fragments referencing O0-O7 outputs sat here — tails of
// tests for a ROM part that is not in this block; they broke the file's parse.)

// ─────────────────────────────────────────────────────
// 74375: Quad bistable latch
// ─────────────────────────────────────────────────────
test('74375 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x375'], 'chip missing');
});
test('74375 C12=1: latches 1&2 follow D (transparent)', () => {
  const comp = makeComp('74x375');
  setPins(comp, { '1D':1,'2D':0,'3D':0,'4D':0,C12:1,C34:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'1Q'),  1, '1Q=1');
  assertEqual(getPin(comp,'1Qn'), 0, '1Qn=0');
  assertEqual(getPin(comp,'2Q'),  0, '2Q=0');
  assertEqual(getPin(comp,'2Qn'), 1, '2Qn=1');
});
test('74375 C12=0: latches 1&2 hold', () => {
  const comp = makeComp('74x375');
  setPins(comp, { '1D':1,'2D':1,'3D':0,'4D':0,C12:1,C34:0 });
  evalGate(comp); // capture D1=1,D2=1
  setPin(comp,'1D', 0);
  setPin(comp,'C12', 0);
  evalGate(comp);
  assertEqual(getPin(comp,'1Q'),  1, '1Q holds 1');
  assertEqual(getPin(comp,'1Qn'), 0, '1Qn holds 0');
});
test('74375 C34=1: latches 3&4 follow D', () => {
  const comp = makeComp('74x375');
  setPins(comp, { '1D':0,'2D':0,'3D':1,'4D':1,C12:0,C34:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'3Q'),  1, '3Q=1');
  assertEqual(getPin(comp,'3Qn'), 0, '3Qn=0');
  assertEqual(getPin(comp,'4Q'),  1, '4Q=1');
});

// ─────────────────────────────────────────────────────
// 74376: Quad J-NOT-K flip flop, shared CLK/CLRn
// ─────────────────────────────────────────────────────
test('74376 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x376'], 'chip missing');
});
test('74376 CLRn=0 → all Q=0', () => {
  const comp = makeComp('74x376');
  setPins(comp, { '1J':1,'2J':1,'3J':1,'4J':1,CLK:0,CLRn:0 });
  evalGate(comp);
  for (let i = 1; i <= 4; i++) {
    assertEqual(getPin(comp,`${i}Q`),  0, `${i}Q=0`);
    assertEqual(getPin(comp,`${i}Qn`), 1, `${i}Qn=1`);
  }
});
test('74376 rising CLK with J=1 → Q=1', () => {
  const comp = makeComp('74x376');
  setPins(comp, { '1J':1,'2J':0,'3J':1,'4J':0,CLK:0,CLRn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'1Q'),  1, '1Q=1');
  assertEqual(getPin(comp,'1Qn'), 0, '1Qn=0');
  assertEqual(getPin(comp,'2Q'),  0, '2Q=0 (J=0)');
});
test('74376 rising CLK with J=0 → Q=0 (reset)', () => {
  const comp = makeComp('74x376');
  setPins(comp, { '1J':1,'2J':1,'3J':1,'4J':1,CLK:0,CLRn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp); // all Q=1
  setPin(comp,'CLK', 0);
  setPin(comp,'1J', 0);
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp); // 1J=0 → 1Q=0
  assertEqual(getPin(comp,'1Q'), 0, '1Q reset to 0');
});

// ─────────────────────────────────────────────────────
// 74377: 8 bit register with clock enable
// ─────────────────────────────────────────────────────
test('74377 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x377'], 'chip missing');
});
test('74377 En=1 (disabled): rising CLK does not capture', () => {
  const comp = makeComp('74x377');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:1,D8:1,CLK:0,En:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  // All Q should stay 0 (initial) since En=1 blocks capture
  assertEqual(getPin(comp,'Q1'), 0, 'Q1 not captured');
});
test('74377 En=0: rising CLK captures D', () => {
  const comp = makeComp('74x377');
  setPins(comp, { D1:1,D2:0,D3:1,D4:0,D5:1,D6:0,D7:1,D8:0,CLK:0,En:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1=D1=1');
  assertEqual(getPin(comp,'Q2'), 0, 'Q2=D2=0');
  assertEqual(getPin(comp,'Q3'), 1, 'Q3=D3=1');
});
test('74377 Q holds after CLK goes low', () => {
  const comp = makeComp('74x377');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:1,D8:1,CLK:0,En:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  setPin(comp,'D1', 0); setPin(comp,'CLK', 0);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1 holds 1');
});

// ─────────────────────────────────────────────────────
// 74378: 6 bit register with clock enable
// ─────────────────────────────────────────────────────
test('74378 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x378'], 'chip missing');
});
test('74378 En=0: rising CLK captures all 6 bits', () => {
  const comp = makeComp('74x378');
  setPins(comp, { D1:1,D2:0,D3:1,D4:0,D5:1,D6:0,CLK:0,En:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1=1');
  assertEqual(getPin(comp,'Q2'), 0, 'Q2=0');
  assertEqual(getPin(comp,'Q6'), 0, 'Q6=0');
});
test('74378 En=1: clock blocked', () => {
  const comp = makeComp('74x378');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,CLK:0,En:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 0, 'Q1=0 (blocked)');
});

// ─────────────────────────────────────────────────────
// 74379: 4 bit register with CE and complementary outputs
// ─────────────────────────────────────────────────────
test('74379 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x379'], 'chip missing');
});
test('74379 En=0: captures D and drives Q/Qn', () => {
  const comp = makeComp('74x379');
  setPins(comp, { D1:1,D2:0,D3:1,D4:0,CLK:0,En:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'),  1, 'Q1=1');
  assertEqual(getPin(comp,'Q1n'), 0, 'Q1n=0');
  assertEqual(getPin(comp,'Q2'),  0, 'Q2=0');
  assertEqual(getPin(comp,'Q2n'), 1, 'Q2n=1');
});
test('74379 En=1: Q does not capture', () => {
  const comp = makeComp('74x379');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,CLK:0,En:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 0, 'Q1=0 (blocked)');
});

// ─────────────────────────────────────────────────────
// 74380: 8 bit multifunction register, tri state
// ─────────────────────────────────────────────────────
test('74380 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x380'], 'chip missing');
});
test('74380 OEn=1 → HiZ', () => {
  const comp = makeComp('74x380');
  setPins(comp, { D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0,D8:0,CLK:0,S0:0,S1:0,S2:0,OEn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), null, 'Q1 HiZ');
});
test('74380 OEn=0: rising CLK captures D', () => {
  const comp = makeComp('74x380');
  setPins(comp, { D1:1,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0,D8:0,CLK:0,S0:0,S1:0,S2:0,OEn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1=1');
  assertEqual(getPin(comp,'Q2'), 0, 'Q2=0');
});

// ─────────────────────────────────────────────────────
// 74381: 4 bit ALU with G/P outputs
// ─────────────────────────────────────────────────────
test('74381 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x381'], 'chip missing');
});
test('74381 s=0 (clear): F=0', () => {
  const comp = makeComp('74x381');
  setPins(comp, { A0:1,A1:1,A2:1,A3:1,B0:1,B1:1,B2:1,B3:1,Cn:0,S0:0,S1:0,S2:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'F0'), 0, 'F0=0');
  assertEqual(getPin(comp,'F1'), 0, 'F1=0');
  assertEqual(getPin(comp,'F2'), 0, 'F2=0');
  assertEqual(getPin(comp,'F3'), 0, 'F3=0');
});
test('74381 s=3 (A+B+Cn): 3+4+0=7', () => {
  const comp = makeComp('74x381');
  // A=3 (0011), B=4 (0100), Cn=0, S=011=3
  setPins(comp, { A0:1,A1:1,A2:0,A3:0,B0:0,B1:0,B2:1,B3:0,Cn:0,S0:1,S1:1,S2:0 });
  evalGate(comp);
  // 3+4+0 = 7 = 0111
  assertEqual(getPin(comp,'F0'), 1, 'F0=1');
  assertEqual(getPin(comp,'F1'), 1, 'F1=1');
  assertEqual(getPin(comp,'F2'), 1, 'F2=1');
  assertEqual(getPin(comp,'F3'), 0, 'F3=0');
});
test('74381 s=4 (A XOR B): 5 XOR 3 = 6', () => {
  const comp = makeComp('74x381');
  // A=5(0101), B=3(0011), S=100=4
  setPins(comp, { A0:1,A1:0,A2:1,A3:0,B0:1,B1:1,B2:0,B3:0,Cn:0,S0:0,S1:0,S2:1 });
  evalGate(comp);
  // 5 XOR 3 = 6 = 0110
  assertEqual(getPin(comp,'F0'), 0, 'F0=0');
  assertEqual(getPin(comp,'F1'), 1, 'F1=1');
  assertEqual(getPin(comp,'F2'), 1, 'F2=1');
  assertEqual(getPin(comp,'F3'), 0, 'F3=0');
});
test('74381 s=7 (preset): F=1111', () => {
  const comp = makeComp('74x381');
  setPins(comp, { A0:0,A1:0,A2:0,A3:0,B0:0,B1:0,B2:0,B3:0,Cn:0,S0:1,S1:1,S2:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'F0'), 1, 'F0=1');
  assertEqual(getPin(comp,'F1'), 1, 'F1=1');
  assertEqual(getPin(comp,'F2'), 1, 'F2=1');
  assertEqual(getPin(comp,'F3'), 1, 'F3=1');
});

// ─────────────────────────────────────────────────────
// 74382: 4 bit ALU with Cn4 and OVR
// ─────────────────────────────────────────────────────
test('74382 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x382'], 'chip missing');
});
test('74382 s=3 (A+B+Cn): 7+7+0=14 → Cn4=0,OVR=0', () => {
  const comp = makeComp('74x382');
  // A=7(0111), B=7(0111), S=011=3, Cn=0 → 7+7=14=01110
  setPins(comp, { A0:1,A1:1,A2:1,A3:0,B0:1,B1:1,B2:1,B3:0,Cn:0,S0:1,S1:1,S2:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'F0'), 0, 'F0=0 (14=1110)');
  assertEqual(getPin(comp,'F1'), 1, 'F1=1');
  assertEqual(getPin(comp,'F2'), 1, 'F2=1');
  assertEqual(getPin(comp,'F3'), 1, 'F3=1');
  assertEqual(getPin(comp,'Cn4'), 0, 'Cn4=0 (no carry out from 4 bit)');
});
test('74382 s=3 (add): 8+8=16 → Cn4=1', () => {
  const comp = makeComp('74x382');
  // A=8(1000), B=8(1000), S=011=3, Cn=0 → 16=10000(5 bit), Cn4=1, F=0
  setPins(comp, { A0:0,A1:0,A2:0,A3:1,B0:0,B1:0,B2:0,B3:1,Cn:0,S0:1,S1:1,S2:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'F0'), 0, 'F0=0');
  assertEqual(getPin(comp,'Cn4'), 1, 'Cn4=1 (carry)');
});

// ─────────────────────────────────────────────────────
// 74383: 8 bit register, OC
// ─────────────────────────────────────────────────────
test('74383 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x383'], 'chip missing');
});
test('74383 CLRn=0 → all Q=0', () => {
  const comp = makeComp('74x383');
  setPins(comp, { D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:1,D8:1,CLK:0,CLRn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 0, 'Q1=0');
  assertEqual(getPin(comp,'Q8'), 0, 'Q8=0');
});
test('74383 rising CLK captures D', () => {
  const comp = makeComp('74x383');
  setPins(comp, { D1:1,D2:0,D3:1,D4:0,D5:1,D6:0,D7:1,D8:0,CLK:0,CLRn:1 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'Q1'), 1, 'Q1=1');
  assertEqual(getPin(comp,'Q2'), 0, 'Q2=0');
  assertEqual(getPin(comp,'Q7'), 1, 'Q7=1');
});

// ─────────────────────────────────────────────────────
// 74384: 8×1 two's complement multiplier
// ─────────────────────────────────────────────────────
test('74384 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x384'], 'chip missing');
});
test('74384 X=0 → product=0', () => {
  const comp = makeComp('74x384');
  setPins(comp, { Y0:1,Y1:1,Y2:1,Y3:0,Y4:0,Y5:0,Y6:0,Y7:0,X:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'P0'), 0, 'P0=0');
  assertEqual(getPin(comp,'P4'), 0, 'P4=0');
});
test('74384 X=1, Y=7 (0000_0111) → P=7', () => {
  const comp = makeComp('74x384');
  setPins(comp, { Y0:1,Y1:1,Y2:1,Y3:0,Y4:0,Y5:0,Y6:0,Y7:0,X:1 });
  evalGate(comp);
  // 7×1=7 (5 bit result: 00111)
  assertEqual(getPin(comp,'P0'), 1, 'P0=1');
  assertEqual(getPin(comp,'P1'), 1, 'P1=1');
  assertEqual(getPin(comp,'P2'), 1, 'P2=1');
  assertEqual(getPin(comp,'P3'), 0, 'P3=0');
  assertEqual(getPin(comp,'P4'), 0, 'P4=0');
});
test('74384 X=1, Y=255(-1 two-s complement) → P=-1(low 5 bits 11111)', () => {
  const comp = makeComp('74x384');
  setPins(comp, { Y0:1,Y1:1,Y2:1,Y3:1,Y4:1,Y5:1,Y6:1,Y7:1,X:1 });
  evalGate(comp);
  // -1 × 1 = -1; lower 5 bits of -1 signed = 11111
  assertEqual(getPin(comp,'P0'), 1, 'P0=1');
  assertEqual(getPin(comp,'P4'), 1, 'P4=1');
});

// ─────────────────────────────────────────────────────
// 74385: Quad serial adder/subtractor
// ─────────────────────────────────────────────────────
test('74385 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x385'], 'chip missing');
});
test('74385 rising CLK: serial add A+B (first bit)', () => {
  const comp = makeComp('74x385');
  // '1A'=1, '1B'=1, '1AS'=0 (add), carry_in=0 → sum=0, carry=1
  setPins(comp, { '1A':1,'1B':1,'1AS':0,
                  '2A':0,'2B':0,'2AS':0,
                  '3A':0,'3B':0,'3AS':0,
                  '4A':0,'4B':0,'4AS':0, CLK:0 });
  evalGate(comp); // initialize
  setPin(comp,'CLK', 1);
  evalGate(comp); // first bit: 1+1+0 = 2 → S=0, carry=1
  assertEqual(getPin(comp,'1S'), 0, '1S=0 (1+1=10 binary)');
});
test('74385 AS=1: subtract mode (A-B) using adder with inverted B', () => {
  const comp = makeComp('74x385');
  // '2A'=1, '2B'=0, '2AS'=1 (subtract: B inverted → 1), carry_in=0
  // Effectively: 1 + 1(inverted 0) = 10 → S=0, carry=1 (borrow chain for subtraction)
  setPins(comp, { '1A':0,'1B':0,'1AS':0,
                  '2A':1,'2B':0,'2AS':1,
                  '3A':0,'3B':0,'3AS':0,
                  '4A':0,'4B':0,'4AS':0, CLK:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  // 2S: A=1, B_eff=1 (invert 0), carry_in=0 → sum=2 → S=0
  assertEqual(getPin(comp,'2S'), 0, '2S=0');
});

// ─────────────────────────────────────────────────────
// 74386: Quad XOR gate
// ─────────────────────────────────────────────────────
test('74386 exists in CHIPS_BLOCK_23', () => {
  assert(CHIPS_BLOCK_23['74x386'], 'chip missing');
});
test('74386 gate 0: 0 XOR 0 = 0', () => {
  const comp = makeComp('74x386');
  setPins(comp, { '1A':0,'1B':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 0, '1Y=0');
});
test('74386 gate 0: 1 XOR 0 = 1', () => {
  const comp = makeComp('74x386');
  setPins(comp, { '1A':1,'1B':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 1, '1Y=1');
});
test('74386 gate 0: 1 XOR 1 = 0', () => {
  const comp = makeComp('74x386');
  setPins(comp, { '1A':1,'1B':1 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 0, '1Y=0');
});
test('74386 gate 3: 4A XOR 4B', () => {
  const comp = makeComp('74x386');
  setPins(comp, { '4A':1,'4B':0 });
  evalGate(comp, 3);
  assertEqual(getPin(comp,'4Y'), 1, '4Y=1');
});

// ─────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed+failed} tests`);
if (failed > 0) process.exit(1);
