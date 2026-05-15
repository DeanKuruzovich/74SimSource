/**
 * Tests for Chips Block 22: 74347, 74348, 74350, 74351, 74352, 74353,
 *                           74354, 74355, 74356, 74357, 74361, 74362,
 *                           74363, 74364, 74365, 74366
 */
import { CHIPS_BLOCK_22 } from '../chips/chips22.js';
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
  const spec = CHIPS_BLOCK_22[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_22`);
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
    case 'BCD_7SEG':               SIM._evaluateBCD7Seg(comp, gate); break;
    case 'PRIORITY_ENC_8TO3_TRI':  SIM._evaluatePriorityEnc8to3Tri(comp, gate); break;
    case 'SHIFTER_4BIT_TRI':       SIM._evaluateShifter4BitTri(comp, gate); break;
    case 'MUX_8TO1_COMPL_TRI':     SIM._evaluateMux8to1ComplTri(comp, gate); break;
    case 'MUX_4TO1_INV':           SIM._evaluateMux4to1Inv(comp, gate); break;
    case 'MUX_4TO1_TRI_INV':       SIM._evaluateMux4to1TriInv(comp, gate); break;
    case 'MUX_4TO1_TRI':           SIM._evaluateMux4to1Tri(comp, gate); break;
    case 'MUX_8TO1_LATCH_TRI':     SIM._evaluateMux8to1LatchTri(comp, gate); break;
    case 'MUX_8TO1_REG_TRI':       SIM._evaluateMux8to1RegTri(comp, gate); break;
    case 'BUBBLE_MEM_TIMING':       SIM._evaluateBubbleMemTiming(comp, gate); break;
    case 'CLK_4PHASE_GEN':          SIM._evaluateClk4PhaseGen(comp, gate); break;
    case 'D_LATCH_OCTAL_TRI':      SIM._evaluateDLatchOctalTri(comp, gate); break;
    case 'D_FF_OCTAL_TRI':         SIM._evaluateDFFOctalTri(comp, gate); break;
    case 'BUFFER_HEX_TRI':         SIM._evaluateBufferHexTri(comp, gate); break;
    case 'BUFFER_HEX_INV_TRI':     SIM._evaluateBufferHexInvTri(comp, gate); break;
    default: throw new Error(`Unknown gate type: ${gate.type}`);
  }
}

// ─────────────────────────────────────────────────────
// 74347: BCD → 7-segment decoder (same as 7447)
// ─────────────────────────────────────────────────────
test('74347 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74347'], 'chip missing');
});
test('74347 has BCD_7SEG gate', () => {
  assertEqual(CHIPS_BLOCK_22['74347'].gates[0].type, 'BCD_7SEG');
});
test('74347 has correct inputs A,B,C,D', () => {
  const inputs = CHIPS_BLOCK_22['74347'].gates[0].inputs;
  assert(inputs.includes('A'), 'has A');
  assert(inputs.includes('B'), 'has B');
  assert(inputs.includes('C'), 'has C');
  assert(inputs.includes('D'), 'has D');
});
test('74347 has correct 7-segment outputs', () => {
  const outputs = CHIPS_BLOCK_22['74347'].gates[0].outputs;
  for (const seg of ['a','b','c','d','e','f','g']) {
    assert(outputs.includes(seg), `has ${seg}`);
  }
});

// ─────────────────────────────────────────────────────
// 74348: 8-to-3 priority encoder, tri-state
// ─────────────────────────────────────────────────────
test('74348 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74348'], 'chip missing');
});
test('74348 EIn=1 → all outputs HiZ', () => {
  const comp = makeComp('74348');
  setPins(comp, { I0:0,I1:1,I2:1,I3:1,I4:1,I5:1,I6:1,I7:1, EIn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'A0n'), null, 'A0n should be HiZ');
  assertEqual(getPin(comp,'A1n'), null, 'A1n should be HiZ');
  assertEqual(getPin(comp,'A2n'), null, 'A2n should be HiZ');
  assertEqual(getPin(comp,'GS'),  null, 'GS should be HiZ');
  assertEqual(getPin(comp,'EO'),  null, 'EO should be HiZ');
});
test('74348 EIn=0, all inputs inactive (all high) → EO=0, GS=1', () => {
  const comp = makeComp('74348');
  setPins(comp, { I0:1,I1:1,I2:1,I3:1,I4:1,I5:1,I6:1,I7:1, EIn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'GS'), 1, 'GS=1 when no input');
  assertEqual(getPin(comp,'EO'), 0, 'EO=0 when no input (enable output)');
});
test('74348 EIn=0, I0=0 (lowest priority) → A=000, GS=0', () => {
  const comp = makeComp('74348');
  setPins(comp, { I0:0,I1:1,I2:1,I3:1,I4:1,I5:1,I6:1,I7:1, EIn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'A0n'), 1, 'A0n=1 (000 inverted → 111)');
  assertEqual(getPin(comp,'A1n'), 1, 'A1n=1');
  assertEqual(getPin(comp,'A2n'), 1, 'A2n=1');
  assertEqual(getPin(comp,'GS'),  0, 'GS=0');
  assertEqual(getPin(comp,'EO'),  1, 'EO=1');
});
test('74348 EIn=0, I7=0 (highest priority) → A=111 inverted', () => {
  const comp = makeComp('74348');
  setPins(comp, { I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0, EIn:0 });
  evalGate(comp);
  // Priority: I7=0 → encode 7=111, outputs active low: A0n=0,A1n=0,A2n=0
  assertEqual(getPin(comp,'A0n'), 0, 'A0n=0 (bit0 of 7 is 1, inverted=0)');
  assertEqual(getPin(comp,'A1n'), 0, 'A1n=0 (bit1 of 7 is 1, inverted=0)');
  assertEqual(getPin(comp,'A2n'), 0, 'A2n=0 (bit2 of 7 is 1, inverted=0)');
  assertEqual(getPin(comp,'GS'),  0, 'GS=0');
});
test('74348 priority: I3=0 (higher than I0) takes precedence', () => {
  const comp = makeComp('74348');
  setPins(comp, { I0:0,I1:1,I2:1,I3:0,I4:1,I5:1,I6:1,I7:1, EIn:0 });
  evalGate(comp);
  // I3=0 (pri=3=011): A0n = !(3&1)=0 → 0, A1n = !(3>>1&1)=0 → 0, A2n = !(3>>2)=1 → 1
  assertEqual(getPin(comp,'A0n'), 0, 'A0n=0');
  assertEqual(getPin(comp,'A1n'), 0, 'A1n=0');
  assertEqual(getPin(comp,'A2n'), 1, 'A2n=1');
});

// ─────────────────────────────────────────────────────
// 74350: 4 bit shifter, tri-state
// ─────────────────────────────────────────────────────
test('74350 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74350'], 'chip missing');
});
test('74350 OEn=1 → all outputs HiZ', () => {
  const comp = makeComp('74350');
  setPins(comp, { S0:0,S1:0,DIR:0,D0:1,D1:1,D2:1,D3:1,OEn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y0'), null, 'Y0 HiZ');
  assertEqual(getPin(comp,'Y1'), null, 'Y1 HiZ');
  assertEqual(getPin(comp,'Y2'), null, 'Y2 HiZ');
  assertEqual(getPin(comp,'Y3'), null, 'Y3 HiZ');
});
test('74350 OEn=0, shift=0, DIR=0 → Y=D unchanged', () => {
  const comp = makeComp('74350');
  // S0=0,S1=0 → shift=0; data=1010
  setPins(comp, { S0:0,S1:0,DIR:0,D0:0,D1:1,D2:0,D3:1,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y0'), 0, 'Y0=0');
  assertEqual(getPin(comp,'Y1'), 1, 'Y1=1');
  assertEqual(getPin(comp,'Y2'), 0, 'Y2=0');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3=1');
});
test('74350 right shift by 1 (DIR=0,S0=1,S1=0): 1111 >> 1 → 0111', () => {
  const comp = makeComp('74350');
  setPins(comp, { S0:1,S1:0,DIR:0,D0:1,D1:1,D2:1,D3:1,OEn:0 });
  evalGate(comp);
  // 1111=0xF >> 1 = 0x7 (0111)
  assertEqual(getPin(comp,'Y0'), 1, 'Y0=1');
  assertEqual(getPin(comp,'Y1'), 1, 'Y1=1');
  assertEqual(getPin(comp,'Y2'), 1, 'Y2=1');
  assertEqual(getPin(comp,'Y3'), 0, 'Y3=0');
});
test('74350 left shift by 2 (DIR=1,S0=0,S1=1): 0001 << 2 → 0100', () => {
  const comp = makeComp('74350');
  setPins(comp, { S0:0,S1:1,DIR:1,D0:1,D1:0,D2:0,D3:0,OEn:0 });
  evalGate(comp);
  // 0001=1 << 2 = 4 & 0xF = 0100
  assertEqual(getPin(comp,'Y0'), 0, 'Y0=0');
  assertEqual(getPin(comp,'Y1'), 0, 'Y1=0');
  assertEqual(getPin(comp,'Y2'), 1, 'Y2=1');
  assertEqual(getPin(comp,'Y3'), 0, 'Y3=0');
});

// ─────────────────────────────────────────────────────
// 74351: dual 8-to-1 mux, complementary tri-state
// ─────────────────────────────────────────────────────
test('74351 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74351'], 'chip missing');
});
test('74351 1Gn=1 → gate 0 HiZ', () => {
  const comp = makeComp('74351');
  setPins(comp, { D0:0,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0,S0:0,S1:0,S2:0,'1Gn':1,'2Gn':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1W'),  null, '1W HiZ');
  assertEqual(getPin(comp,'1Wn'), null, '1Wn HiZ');
});
test('74351 gate 0 enabled: sel=3,D3=1 → 1W=1,1Wn=0', () => {
  const comp = makeComp('74351');
  setPins(comp, { D0:0,D1:0,D2:0,D3:1,D4:0,D5:0,D6:0,D7:0,S0:1,S1:1,S2:0,'1Gn':0,'2Gn':1 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1W'),  1, '1W=1');
  assertEqual(getPin(comp,'1Wn'), 0, '1Wn=0');
});
test('74351 gate 1 enabled: sel=5,D5=1 → 2W=1,2Wn=0', () => {
  const comp = makeComp('74351');
  setPins(comp, { D0:0,D1:0,D2:0,D3:0,D4:0,D5:1,D6:0,D7:0,S0:1,S1:0,S2:1,'1Gn':1,'2Gn':0 });
  evalGate(comp, 1);
  assertEqual(getPin(comp,'2W'),  1, '2W=1');
  assertEqual(getPin(comp,'2Wn'), 0, '2Wn=0');
});

// ─────────────────────────────────────────────────────
// 74352: dual 4-to-1 mux, inverting
// ─────────────────────────────────────────────────────
test('74352 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74352'], 'chip missing');
});
test('74352 1Gn=1 → 1Y=1 (disabled, pullup)', () => {
  const comp = makeComp('74352');
  setPins(comp, { '1Gn':1, A:0, B:0, '1C0':0,'1C1':0,'1C2':0,'1C3':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 1, '1Y=1 when disabled');
});
test('74352 gate0: Gn=0,A=0,B=0,C0=1 → 1Y=0 (inverted)', () => {
  const comp = makeComp('74352');
  setPins(comp, { '1Gn':0, A:0, B:0, '1C0':1,'1C1':0,'1C2':0,'1C3':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 0, '1Y=0 (inverted C0=1)');
});
test('74352 gate0: Gn=0,A=1,B=0,C1=1 → 1Y=0', () => {
  const comp = makeComp('74352');
  setPins(comp, { '1Gn':0, A:1, B:0, '1C0':0,'1C1':1,'1C2':0,'1C3':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 0, '1Y=0 (inverted C1=1)');
});
test('74352 gate0: Gn=0,A=0,B=0,C0=0 → 1Y=1 (inverted C0=0)', () => {
  const comp = makeComp('74352');
  setPins(comp, { '1Gn':0, A:0, B:0, '1C0':0,'1C1':0,'1C2':0,'1C3':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 1, '1Y=1 (inverted C0=0)');
});
test('74352 gate1: Gn=0,A=0,B=1 → 2C2 selected', () => {
  const comp = makeComp('74352');
  setPins(comp, { '2Gn':0, A:0, B:1, '2C0':0,'2C1':0,'2C2':1,'2C3':0 });
  evalGate(comp, 1);
  // sel = A|(B<<1) = 0|(1<<1)=2 → C2=1, inverted → 2Y=0
  assertEqual(getPin(comp,'2Y'), 0, '2Y=0');
});

// ─────────────────────────────────────────────────────
// 74353: dual 4-to-1 mux, inverting, tri-state
// ─────────────────────────────────────────────────────
test('74353 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74353'], 'chip missing');
});
test('74353 uses MUX_4TO1_TRI_INV gate type', () => {
  assertEqual(CHIPS_BLOCK_22['74353'].gates[0].type, 'MUX_4TO1_TRI_INV');
});
test('74353 1Gn=1 → 1Y=HiZ', () => {
  const comp = makeComp('74353');
  setPins(comp, { '1Gn':1, A:0, B:0, '1C0':1,'1C1':1,'1C2':1,'1C3':1 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), null, '1Y HiZ');
});
test('74353 gate0: Gn=0,A=0,B=0,C0=1 → 1Y=0 (inverted)', () => {
  const comp = makeComp('74353');
  setPins(comp, { '1Gn':0, A:0, B:0, '1C0':1,'1C1':0,'1C2':0,'1C3':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 0, '1Y=0 (inverted C0=1)');
});
test('74353 gate0: Gn=0,A=1,B=0,C1=0 → 1Y=1', () => {
  const comp = makeComp('74353');
  setPins(comp, { '1Gn':0, A:1, B:0, '1C0':0,'1C1':0,'1C2':0,'1C3':0 });
  evalGate(comp, 0);
  assertEqual(getPin(comp,'1Y'), 1, '1Y=1 (inverted C1=0)');
});

// ─────────────────────────────────────────────────────
// 74354: 8→1 mux with transparent latch, tri-state
// ─────────────────────────────────────────────────────
test('74354 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74354'], 'chip missing');
});
test('74354 OEn=1 → W and Wn HiZ', () => {
  const comp = makeComp('74354');
  setPins(comp, { I0:1,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,S0:0,S1:0,S2:0,LE:1,OEn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'W'),  null, 'W HiZ');
  assertEqual(getPin(comp,'Wn'), null, 'Wn HiZ');
});
test('74354 LE=1 (transparent): sel=0,I0=1 → W=1,Wn=0', () => {
  const comp = makeComp('74354');
  setPins(comp, { I0:1,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,S0:0,S1:0,S2:0,LE:1,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'W'),  1, 'W=1');
  assertEqual(getPin(comp,'Wn'), 0, 'Wn=0');
});
test('74354 latch hold: LE=1 captures, LE=0 holds', () => {
  const comp = makeComp('74354');
  // Capture I2=1 at sel=2
  setPins(comp, { I0:0,I1:0,I2:1,I3:0,I4:0,I5:0,I6:0,I7:0,S0:0,S1:1,S2:0,LE:1,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'W'), 1, 'W=1 (captured)');
  // Now LE=0: change inputs but hold
  setPin(comp,'I2', 0);
  setPin(comp,'LE', 0);
  evalGate(comp);
  assertEqual(getPin(comp,'W'), 1, 'W=1 (held)');
});

// ─────────────────────────────────────────────────────
// 74355: 8→1 mux with transparent latch, OC (same logic)
// ─────────────────────────────────────────────────────
test('74355 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74355'], 'chip missing');
});
test('74355 LE=1: sel=5,I5=1 → W=1,Wn=0', () => {
  const comp = makeComp('74355');
  setPins(comp, { I0:0,I1:0,I2:0,I3:0,I4:0,I5:1,I6:0,I7:0,S0:1,S1:0,S2:1,LE:1,OEn:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'W'),  1, 'W=1');
  assertEqual(getPin(comp,'Wn'), 0, 'Wn=0');
});

// ─────────────────────────────────────────────────────
// 74356: 8→1 mux with edge-triggered register, tri-state
// ─────────────────────────────────────────────────────
test('74356 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74356'], 'chip missing');
});
test('74356 OEn=1 → HiZ', () => {
  const comp = makeComp('74356');
  setPins(comp, { I0:1,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,S0:0,S1:0,S2:0,CLK:0,OEn:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'W'),  null, 'W HiZ');
  assertEqual(getPin(comp,'Wn'), null, 'Wn HiZ');
});
test('74356 rising CLK captures sel=0,I0=1 → W=1', () => {
  const comp = makeComp('74356');
  setPins(comp, { I0:1,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,S0:0,S1:0,S2:0,CLK:0,OEn:0 });
  evalGate(comp); // CLK=0, state initialized
  setPin(comp,'CLK', 1);
  evalGate(comp); // rising edge
  assertEqual(getPin(comp,'W'),  1, 'W=1');
  assertEqual(getPin(comp,'Wn'), 0, 'Wn=0');
});
test('74356 register holds after CLK goes low again', () => {
  const comp = makeComp('74356');
  setPins(comp, { I0:1,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,S0:0,S1:0,S2:0,CLK:0,OEn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp); // capture I0=1
  // Now change I0 and lower CLK
  setPin(comp,'I0', 0);
  setPin(comp,'CLK', 0);
  evalGate(comp);
  assertEqual(getPin(comp,'W'), 1, 'W still 1 (held)');
});

// ─────────────────────────────────────────────────────
// 74357: 8→1 mux with edge-triggered register, OC
// ─────────────────────────────────────────────────────
test('74357 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74357'], 'chip missing');
});
test('74357 rising CLK captures sel=7,I7=0 → W=0,Wn=1', () => {
  const comp = makeComp('74357');
  setPins(comp, { I0:0,I1:0,I2:0,I3:0,I4:0,I5:0,I6:0,I7:0,S0:1,S1:1,S2:1,CLK:0,OEn:0 });
  evalGate(comp);
  setPin(comp,'CLK', 1);
  evalGate(comp);
  assertEqual(getPin(comp,'W'),  0, 'W=0');
  assertEqual(getPin(comp,'Wn'), 1, 'Wn=1');
});

// ─────────────────────────────────────────────────────
// 74362: four-phase clock generator (stub)
// ─────────────────────────────────────────────────────
test('74362 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74362'], 'chip missing');
});
test('74362 RST=1 → phase=0 → only Ph1=1', () => {
  const comp = makeComp('74362');
  setPins(comp, { CLK:0,RST:1,HOLD:0,IDLE:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Ph1'), 1, 'Ph1=1 at phase 0');
  assertEqual(getPin(comp,'Ph2'), 0, 'Ph2=0');
  assertEqual(getPin(comp,'Ph3'), 0, 'Ph3=0');
  assertEqual(getPin(comp,'Ph4'), 0, 'Ph4=0');
});
test('74362 rising edge advances phase', () => {
  const comp = makeComp('74362');
  setPins(comp, { CLK:0,RST:1,HOLD:0,IDLE:0 });
  evalGate(comp); // phase=0 (RST)
  setPin(comp,'RST', 0);
  setPin(comp,'CLK', 1);
  evalGate(comp); // phase advances to 1
  assertEqual(getPin(comp,'Ph1'), 0, 'Ph1=0');
  assertEqual(getPin(comp,'Ph2'), 1, 'Ph2=1 at phase 1');
});

// ─────────────────────────────────────────────────────
// 74363: octal transparent latch, tri-state
// (Same function as 74373; uses D_LATCH_OCTAL_TRI gate type)
// ─────────────────────────────────────────────────────
test('74363 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74363'], 'chip missing');
});
test('74363 uses D_LATCH_OCTAL_TRI gate', () => {
  assertEqual(CHIPS_BLOCK_22['74363'].gates[0].type, 'D_LATCH_OCTAL_TRI');
});
test('74363 has 8 D inputs and 8 Q outputs', () => {
  const gate = CHIPS_BLOCK_22['74363'].gates[0];
  // 8 data inputs + OEn + LE = 10 inputs
  assertEqual(gate.inputs.length, 10, 'inputs count');
  assertEqual(gate.outputs.length, 8, 'outputs count');
});
test('74363 inputs include OEn and LE', () => {
  const inputs = CHIPS_BLOCK_22['74363'].gates[0].inputs;
  assert(inputs.includes('OEn'), 'OEn present');
  assert(inputs.includes('LE'),  'LE present');
});

// ─────────────────────────────────────────────────────
// 74364: octal edge-triggered D flip-flop, tri-state
// (Same function as 74374; uses D_FF_OCTAL_TRI gate type)
// ─────────────────────────────────────────────────────
test('74364 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74364'], 'chip missing');
});
test('74364 uses D_FF_OCTAL_TRI gate', () => {
  assertEqual(CHIPS_BLOCK_22['74364'].gates[0].type, 'D_FF_OCTAL_TRI');
});
test('74364 has 8 D inputs, CLK and OEn', () => {
  const gate = CHIPS_BLOCK_22['74364'].gates[0];
  assertEqual(gate.inputs.length, 10, 'inputs count');
  assert(gate.inputs.includes('CLK'), 'CLK present');
  assert(gate.inputs.includes('OEn'), 'OEn present');
  assertEqual(gate.outputs.length, 8, 'outputs count');
});

// ─────────────────────────────────────────────────────
// 74365: hex buffer, non-inverting, tri-state
// ─────────────────────────────────────────────────────
test('74365 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74365'], 'chip missing');
});
test('74365 G1n=1 → all Y HiZ', () => {
  const comp = makeComp('74365');
  setPins(comp, { A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,G1n:1,G2n:0 });
  evalGate(comp);
  for (let i = 1; i <= 6; i++) {
    assertEqual(getPin(comp,`Y${i}`), null, `Y${i} HiZ`);
  }
});
test('74365 G2n=1 → all Y HiZ', () => {
  const comp = makeComp('74365');
  setPins(comp, { A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,G1n:0,G2n:1 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), null, 'Y1 HiZ');
});
test('74365 G1n=0,G2n=0: Y follows A', () => {
  const comp = makeComp('74365');
  setPins(comp, { A1:1,A2:0,A3:1,A4:0,A5:1,A6:0,G1n:0,G2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 1, 'Y1=A1=1');
  assertEqual(getPin(comp,'Y2'), 0, 'Y2=A2=0');
  assertEqual(getPin(comp,'Y3'), 1, 'Y3=A3=1');
  assertEqual(getPin(comp,'Y4'), 0, 'Y4=A4=0');
  assertEqual(getPin(comp,'Y5'), 1, 'Y5=A5=1');
  assertEqual(getPin(comp,'Y6'), 0, 'Y6=A6=0');
});

// ─────────────────────────────────────────────────────
// 74366: hex buffer, inverting, tri-state
// ─────────────────────────────────────────────────────
test('74366 exists in CHIPS_BLOCK_22', () => {
  assert(CHIPS_BLOCK_22['74366'], 'chip missing');
});
test('74366 G1n=1 → all Y HiZ', () => {
  const comp = makeComp('74366');
  setPins(comp, { A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,G1n:1,G2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), null, 'Y1 HiZ');
});
test('74366 G1n=0,G2n=0: Y inverts A', () => {
  const comp = makeComp('74366');
  setPins(comp, { A1:1,A2:0,A3:1,A4:0,A5:1,A6:0,G1n:0,G2n:0 });
  evalGate(comp);
  assertEqual(getPin(comp,'Y1'), 0, 'Y1=!A1=0');
  assertEqual(getPin(comp,'Y2'), 1, 'Y2=!A2=1');
  assertEqual(getPin(comp,'Y3'), 0, 'Y3=!A3=0');
  assertEqual(getPin(comp,'Y4'), 1, 'Y4=!A4=1');
  assertEqual(getPin(comp,'Y5'), 0, 'Y5=!A5=0');
  assertEqual(getPin(comp,'Y6'), 1, 'Y6=!A6=1');
});

// ─────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed+failed} tests`);
if (failed > 0) process.exit(1);
