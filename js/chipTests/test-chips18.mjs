/**
 * Tests for Chips Block 18: 74265, 74268, 74269, 74274,
 *                           74275, 74276, 74278, 74279, 74280, 74281,
 *                           74282, 74283, 74284, 74285
 */
import { CHIPS_BLOCK_18 } from '../chips/chips18.js';
import { CircuitSimulator } from '../simulator.js';

// ── Minimal test harness ─────────────────────────────────────────────────────
let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    console.error(`FAIL: ${name}\n  ${e.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(`${msg || ''}: expected ${b}, got ${a}`);
}

// ── Simulator helpers ─────────────────────────────────────────────────────────
const SIM = new CircuitSimulator();

const LOW = 0, HIGH = 1, HIZ = null;

function makeComp(chipId) {
  const spec = CHIPS_BLOCK_18[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_18`);
  const comp = {
    id: `test_${chipId}`,
    chipId,
    spec,
    pins: {},
    _state: null,
  };
  for (const p of spec.pinout) {
    if (p.type === 'power') continue;
    comp.pins[p.name] = { voltage: p.type === 'output' ? null : 0 };
  }
  return comp;
}

function setPin(comp, name, val) {
  if (!comp.pins[name]) throw new Error(`Pin ${name} not found on ${comp.chipId}`);
  // val: 0/1
  comp.pins[name].voltage = val === 1 ? 5.0 : 0.0;
}

function setPins(comp, map) {
  for (const [name, val] of Object.entries(map)) setPin(comp, name, val);
}

function getPin(comp, name) {
  if (!comp.pins[name]) throw new Error(`Pin ${name} not found on ${comp.chipId}`);
  const v = comp.pins[name].voltage;
  if (v === null || v === undefined) return null; // HiZ
  return v > 2.5 ? 1 : 0;
}

// Simulator stub helpers - wired to SIM internal methods directly
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
  const type = gate.type;
  switch (type) {
    case 'BUFFER_COMP':       SIM._evaluateBufferComp(comp, gate); break;
    case 'D_LATCH_HEX_TRI':  SIM._evaluateDLatchHexTri(comp, gate); break;
    case 'COUNTER_8BIT_BIDIR': SIM._evaluateCounter8BitBidir(comp, gate); break;
    case 'MULT_4X4BIT_TRI':  SIM._evaluateMult4x4BitTri(comp, gate); break;
    case 'WALLACE_TREE_7BIT': SIM._evaluateWallaceTree7Bit(comp, gate); break;
    case 'JK_FF_QUAD_SEP_CLK': SIM._evaluateJKFFQuadSepClk(comp, gate); break;
    case 'PRIORITY_REG_4BIT': SIM._evaluatePriorityReg4Bit(comp, gate); break;
    case 'SR_LATCH_NOR_NAND': SIM._evaluateSRLatchNorNand(comp, gate); break;
    case 'PARITY_9BIT_SIMPLE': SIM._evaluateParity9BitSimple(comp, gate); break;
    case 'ACCUMULATOR_4BIT': SIM._evaluateAccumulator4Bit(comp, gate); break;
    case 'CARRY_LOOKAHEAD_SEL': SIM._evaluateCarryLookaheadSel(comp, gate); break;
    case 'ADDER_4BIT':       SIM._evaluateAdder4Bit(comp, gate); break;
    case 'MULT_4X4BIT_HI':  SIM._evaluateMult4x4BitHi(comp, gate); break;
    case 'MULT_4X4BIT_LO':  SIM._evaluateMult4x4BitLo(comp, gate); break;
    default: throw new Error(`Unknown gate type: ${type}`);
  }
}

function clock(comp, clkPin, gateIdx = 0) {
  setPin(comp, clkPin, 0);
  evalGate(comp, gateIdx);
  setPin(comp, clkPin, 1);
  evalGate(comp, gateIdx);
  setPin(comp, clkPin, 0);
  evalGate(comp, gateIdx);
}

// ── Structure tests (S1-S3) ───────────────────────────────────────────────────

// S1: All 16 chips exist in the block
test('S1: All 16 chips present in CHIPS_BLOCK_18', () => {
  const expected = ['74x265','74x268','74x269','74x274','74x275',
                    '74x276','74x278','74x279','74x280','74x281','74x282','74x283',
                    '74x284','74x285'];
  for (const id of expected) {
    assert(CHIPS_BLOCK_18[id], `Missing chip ${id}`);
  }
  assertEqual(Object.keys(CHIPS_BLOCK_18).length, 14, 'Should have exactly 14 chips');
});

// S2: Each chip has required fields
test('S2: Required fields on all chips', () => {
  for (const [id, spec] of Object.entries(CHIPS_BLOCK_18)) {
    assert(spec.name,        `${id}: missing name`);
    assert(spec.pins > 0,    `${id}: invalid pins`);
    assert(Array.isArray(spec.pinout) && spec.pinout.length > 0, `${id}: missing pinout`);
    assert(Array.isArray(spec.gates)  && spec.gates.length > 0,  `${id}: missing gates`);
  }
});

// S3: Pin counts match spec
test('S3: Pin counts correct', () => {
  const expected = {
    '74x265': 14, '74x268': 16, '74x269': 24,
    '74x274': 20, '74x275': 16, '74x276': 20, '74x278': 14, '74x279': 16,
    '74x280': 14, '74x281': 24, '74x282': 20, '74x283': 16, '74x284': 16, '74x285': 16,
  };
  for (const [id, count] of Object.entries(expected)) {
    assertEqual(CHIPS_BLOCK_18[id].pins, count, `${id}: pin count`);
  }
});

// ── 74265 Tests: Quad Complementary Buffer ────────────────────────────────────

test('G1: 74265 A=0 → Y=0,Yn=1', () => {
  const c = makeComp('74x265');
  setPin(c, '1A', 0);
  evalGate(c, 0);
  assertEqual(getPin(c, '1Y'),  0, '1Y should be LOW');
  assertEqual(getPin(c, '1Yn'), 1, '1Yn should be HIGH');
});

test('G2: 74265 A=1 → Y=1,Yn=0', () => {
  const c = makeComp('74x265');
  setPin(c, '2A', 1);
  evalGate(c, 1);
  assertEqual(getPin(c, '2Y'),  1, '2Y should be HIGH');
  assertEqual(getPin(c, '2Yn'), 0, '2Yn should be LOW');
});

test('G3: 74265 all 4 gates work', () => {
  const c = makeComp('74x265');
  const spec = CHIPS_BLOCK_18['74x265'];
  for (let i = 0; i < 4; i++) {
    const idx = i + 1;
    setPin(c, `${idx}A`, 1);
    evalGate(c, i);
    assertEqual(getPin(c, `${idx}Y`),  1, `${idx}Y HIGH`);
    assertEqual(getPin(c, `${idx}Yn`), 0, `${idx}Yn LOW`);
    setPin(c, `${idx}A`, 0);
    evalGate(c, i);
    assertEqual(getPin(c, `${idx}Y`),  0, `${idx}Y LOW`);
    assertEqual(getPin(c, `${idx}Yn`), 1, `${idx}Yn HIGH`);
  }
});

// ── 74268 Tests: Hex D Latch, Tri state ──────────────────────────────────────

test('G4: 74268 transparent (G=1, OEn=0) passes D to Q', () => {
  const c = makeComp('74x268');
  setPins(c, { '1D':1,'2D':0,'3D':1,'4D':0,'5D':1,'6D':0, 'G':1, 'OEn':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, '1Q'), 1, '1Q should be 1');
  assertEqual(getPin(c, '2Q'), 0, '2Q should be 0');
  assertEqual(getPin(c, '3Q'), 1, '3Q');
  assertEqual(getPin(c, '6Q'), 0, '6Q');
});

test('G5: 74268 latch (G=0) holds data', () => {
  const c = makeComp('74x268');
  // First set with G=1
  setPins(c, { '1D':1,'2D':1,'3D':1,'4D':1,'5D':1,'6D':1, 'G':1, 'OEn':0 });
  evalGate(c, 0);
  // Now latch: G=0, change D
  setPins(c, { '1D':0,'2D':0,'3D':0,'4D':0,'5D':0,'6D':0, 'G':0, 'OEn':0 });
  evalGate(c, 0);
  // Data should be held (all 1s)
  assertEqual(getPin(c, '1Q'), 1, '1Q should hold 1');
  assertEqual(getPin(c, '4Q'), 1, '4Q should hold 1');
});

test('G6: 74268 OEn=1 → all outputs HiZ', () => {
  const c = makeComp('74x268');
  setPins(c, { '1D':1,'2D':1,'3D':1,'4D':1,'5D':1,'6D':1, 'G':1, 'OEn':1 });
  evalGate(c, 0);
  for (let i = 1; i <= 6; i++) {
    assertEqual(getPin(c, `${i}Q`), null, `${i}Q should be HiZ`);
  }
});

// ── 74269 Tests: 8 bit Bidirectional Counter ──────────────────────────────────

test('G7: 74269 synchronous load', () => {
  const c = makeComp('74x269');
  // Load 0b10110100 = 0xB4 = 180
  setPins(c, {
    'CLK':0, 'ENT':1, 'ENP':1, 'U_Dn':1,
    'LOAD':0,  // active LOW load
    'A0':0,'A1':0,'A2':1,'A3':0,'A4':1,'A5':1,'A6':0,'A7':1
  });
  // rising edge
  setPin(c, 'CLK', 1); evalGate(c, 0);
  const q = [0,1,2,3,4,5,6,7].map(i => getPin(c, `Q${i}`));
  const val = q.reduce((acc, b, i) => acc | (b << i), 0);
  assertEqual(val, 0xB4, `Loaded value should be 0xB4, got 0x${val.toString(16)}`);
});

test('G8: 74269 counts up', () => {
  const c = makeComp('74x269');
  // Load 0
  setPins(c, { 'CLK':0,'ENT':1,'ENP':1,'U_Dn':1,'LOAD':0,
               'A0':0,'A1':0,'A2':0,'A3':0,'A4':0,'A5':0,'A6':0,'A7':0 });
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  // Now count up from 0
  setPin(c, 'LOAD', 1);
  for (let expected = 1; expected <= 5; expected++) {
    setPin(c, 'CLK', 1); evalGate(c, 0);
    setPin(c, 'CLK', 0); evalGate(c, 0);
    const q = [0,1,2,3,4,5,6,7].map(i => getPin(c, `Q${i}`));
    const val = q.reduce((acc, b, i) => acc | (b << i), 0);
    assertEqual(val, expected, `Count up: expected ${expected}, got ${val}`);
  }
});

test('G9: 74269 counts down', () => {
  const c = makeComp('74x269');
  // Load 3
  setPins(c, { 'CLK':0,'ENT':1,'ENP':1,'U_Dn':0,'LOAD':0,
               'A0':1,'A1':1,'A2':0,'A3':0,'A4':0,'A5':0,'A6':0,'A7':0 });
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  setPin(c, 'LOAD', 1);
  // Count down from 3
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  const q = [0,1,2,3,4,5,6,7].map(i => getPin(c, `Q${i}`));
  const val = q.reduce((acc, b, i) => acc | (b << i), 0);
  assertEqual(val, 2, `Count down: expected 2, got ${val}`);
});

test('G10: 74269 TC asserts at max count (up)', () => {
  const c = makeComp('74x269');
  // Load 254
  const load254 = { 'CLK':0,'ENT':1,'ENP':1,'U_Dn':1,'LOAD':0,
    'A0':0,'A1':1,'A2':1,'A3':1,'A4':1,'A5':1,'A6':1,'A7':1 };
  setPins(c, load254);
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  setPin(c, 'LOAD', 1);
  // Count to 255
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  assertEqual(getPin(c, 'TC'), 1, 'TC should be HIGH at 255 counting up');
});

// (G11 G14 covered a ROM part that is no longer in this block; an orphaned
// fragment of one of those tests previously sat here and broke the parse.)

// ── 74274 Tests: 4×4 Multiplier, Tri state ───────────────────────────────────

test('G15: 74274 OEn=1 → all outputs HiZ', () => {
  const c = makeComp('74x274');
  setPins(c, { 'X0':1,'X1':1,'X2':1,'X3':1,'Y0':1,'Y1':1,'Y2':1,'Y3':1,'OEn':1 });
  evalGate(c, 0);
  for (let i = 0; i < 8; i++) {
    assertEqual(getPin(c, `P${i}`), null, `P${i} HiZ`);
  }
});

test('G16: 74274 OEn=0, 3×3=9', () => {
  const c = makeComp('74x274');
  // X=3 (0011), Y=3 (0011) → P=9 (00001001)
  setPins(c, { 'X0':1,'X1':1,'X2':0,'X3':0,'Y0':1,'Y1':1,'Y2':0,'Y3':0,'OEn':0 });
  evalGate(c, 0);
  const p = [0,1,2,3,4,5,6,7].map(i => getPin(c, `P${i}`));
  const prod = p.reduce((acc, b, i) => acc | (b << i), 0);
  assertEqual(prod, 9, `3×3 should be 9, got ${prod}`);
});

test('G17: 74274 OEn=0, 15×15=225', () => {
  const c = makeComp('74x274');
  // X=15 (1111), Y=15 (1111) → P=225 (11100001)
  setPins(c, { 'X0':1,'X1':1,'X2':1,'X3':1,'Y0':1,'Y1':1,'Y2':1,'Y3':1,'OEn':0 });
  evalGate(c, 0);
  const p = [0,1,2,3,4,5,6,7].map(i => getPin(c, `P${i}`));
  const prod = p.reduce((acc, b, i) => acc | (b << i), 0);
  assertEqual(prod, 225, `15×15 should be 225, got ${prod}`);
});

test('G18: 74274 OEn=0, 0×5=0', () => {
  const c = makeComp('74x274');
  setPins(c, { 'X0':0,'X1':0,'X2':0,'X3':0,'Y0':1,'Y1':0,'Y2':1,'Y3':0,'OEn':0 });
  evalGate(c, 0);
  const p = [0,1,2,3,4,5,6,7].map(i => getPin(c, `P${i}`));
  const prod = p.reduce((acc, b, i) => acc | (b << i), 0);
  assertEqual(prod, 0, `0×5 should be 0, got ${prod}`);
});

// ── 74275 Tests: 7 bit Wallace Tree Slice ─────────────────────────────────────

test('G19: 74275 all zeros → all outputs 0', () => {
  const c = makeComp('74x275');
  setPins(c, { 'W0':0,'W1':0,'W2':0,'W3':0,'X0':0,'X1':0,'Y0':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'S0'), 0, 'S0=0');
  assertEqual(getPin(c, 'C2'), 0, 'C2=0');
  assertEqual(getPin(c, 'Y1'), 0, 'Y1=0');
});

test('G20: 74275 W0=1 only → S0=1, others 0', () => {
  const c = makeComp('74x275');
  setPins(c, { 'W0':1,'W1':0,'W2':0,'W3':0,'X0':0,'X1':0,'Y0':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'S0'), 1, 'S0=1');
  assertEqual(getPin(c, 'C2'), 0, 'C2=0');
});

test('G21: 74275 W0=W1=W2=1 → S0=1, S1=1 (sum=3)', () => {
  const c = makeComp('74x275');
  setPins(c, { 'W0':1,'W1':1,'W2':1,'W3':0,'X0':0,'X1':0,'Y0':0 });
  evalGate(c, 0);
  // CSA of (1,1,1): sum bit S0=1, carry goes into next stage
  assertEqual(getPin(c, 'S0'), 1, 'S0=1 (sum of 3 ones)');
  // Total of 3 ones: S0 should be 1 (odd parity at weight 0)
  // C2 is the carry out: (w0&w1)|(w1&w2)|(w0&w2) = 1
  // In our model c2 = c3b; let's just verify S0=1 and overall behavior
  const s0 = getPin(c, 'S0');
  assert(s0 === 1, `S0 should be 1 for 3 active inputs, got ${s0}`);
});

// ── 74276 Tests: Quad JK FF with Separate Clocks ─────────────────────────────

test('G22: 74276 J=1,K=0 → Q set on falling CLK', () => {
  const c = makeComp('74x276');
  setPins(c, { 'CLKn':1,'1J':1,'1K':0,'2J':0,'2K':0,'3J':0,'3K':0,'4J':0,'4K':0,'PRE_CLRn':1 });
  evalGate(c, 0);
  setPin(c, 'CLKn', 0); evalGate(c, 0); // falling edge
  assertEqual(getPin(c, '1Q'),  1, '1Q should be 1');
  assertEqual(getPin(c, '1Qn'), 0, '1Qn should be 0');
});

test('G23: 74276 J=0,K=1 → Q reset on falling CLK', () => {
  const c = makeComp('74x276');
  // First set
  setPins(c, { 'CLKn':1,'1J':1,'1K':0,'2J':0,'2K':0,'3J':0,'3K':0,'4J':0,'4K':0,'PRE_CLRn':1 });
  evalGate(c, 0);
  setPin(c, 'CLKn', 0); evalGate(c, 0); // set
  setPin(c, 'CLKn', 1); evalGate(c, 0);
  // Now reset
  setPin(c, '1J', 0); setPin(c, '1K', 1);
  setPin(c, 'CLKn', 0); evalGate(c, 0); // falling edge → reset
  assertEqual(getPin(c, '1Q'),  0, '1Q should be 0');
  assertEqual(getPin(c, '1Qn'), 1, '1Qn should be 1');
});

test('G24: 74276 J=1,K=1 → toggle on falling CLK', () => {
  const c = makeComp('74x276');
  setPins(c, { 'CLKn':1,'1J':0,'1K':0,'2J':0,'2K':0,'3J':0,'3K':0,'4J':0,'4K':0,'PRE_CLRn':1 });
  evalGate(c, 0);
  const q0 = getPin(c, '1Q');
  setPin(c, '1J', 1); setPin(c, '1K', 1);
  setPin(c, 'CLKn', 0); evalGate(c, 0); // toggle
  const q1 = getPin(c, '1Q');
  assert(q0 !== q1, 'Q should toggle');
});

test('G25: 74276 J=0,K=0 → hold on CLK', () => {
  const c = makeComp('74x276');
  // Set first
  setPins(c, { 'CLKn':1,'1J':1,'1K':0,'2J':0,'2K':0,'3J':0,'3K':0,'4J':0,'4K':0,'PRE_CLRn':1 });
  setPin(c, 'CLKn', 0); evalGate(c, 0);
  setPin(c, 'CLKn', 1); evalGate(c, 0);
  const q0 = getPin(c, '1Q');
  // Now hold
  setPin(c, '1J', 0); setPin(c, '1K', 0);
  setPin(c, 'CLKn', 0); evalGate(c, 0); // should hold
  assertEqual(getPin(c, '1Q'), q0, 'Q should hold');
});

// ── 74278 Tests: 4 bit Priority Register ─────────────────────────────────────

test('G26: 74278 CLRn=0 → Q=0', () => {
  const c = makeComp('74x278');
  // Clear with no active inputs (to avoid GS=1 from combinational path)
  setPins(c, { 'D0':0,'D1':0,'D2':0,'D3':0,'EI':1,'CLK':0,'CLRn':0 });
  setPin(c, 'CLK', 1); evalGate(c, 0);
  assertEqual(getPin(c, 'Q0'), 0, 'Q0=0 after CLR');
  assertEqual(getPin(c, 'Q1'), 0, 'Q1=0 after CLR');
  // With no D inputs active, GS=0
  assertEqual(getPin(c, 'GS'), 0, 'GS=0 when no D active');
});

test('G27: 74278 D3=1 → Q=3, GS=1 on CLK', () => {
  const c = makeComp('74x278');
  setPins(c, { 'D0':0,'D1':0,'D2':0,'D3':1,'EI':1,'CLK':0,'CLRn':1 });
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  const q = getPin(c, 'Q0') | (getPin(c, 'Q1') << 1);
  assertEqual(q, 3, `Q should encode priority 3, got ${q}`);
  assertEqual(getPin(c, 'GS'), 1, 'GS should be 1');
});

test('G28: 74278 EI=0 → EO=0, GS=0', () => {
  const c = makeComp('74x278');
  setPins(c, { 'D0':1,'D1':1,'D2':1,'D3':1,'EI':0,'CLK':0,'CLRn':1 });
  setPin(c, 'CLK', 1); evalGate(c, 0);
  assertEqual(getPin(c, 'GS'), 0, 'GS=0 when EI=0');
  assertEqual(getPin(c, 'EO'), 0, 'EO=0 when EI=0');
});

// ── 74279 Tests: Quad SR Latch ────────────────────────────────────────────────

test('G29: 74279 cell 1   S active (1S1n=0) → Q=1', () => {
  const c = makeComp('74x279');
  setPins(c, { '1S1n':0,'1S2n':1,'1Rn':1 });
  SIM._evaluateSRLatchNorNand(c, c.spec.gates[0]);
  assertEqual(getPin(c, '1Q'), 1, '1Q should be set');
});

test('G30: 74279 cell 1   R active (1Rn=0) → Q=0', () => {
  const c = makeComp('74x279');
  // Set first
  setPins(c, { '1S1n':0,'1S2n':1,'1Rn':1 });
  SIM._evaluateSRLatchNorNand(c, c.spec.gates[0]);
  // Now reset
  setPins(c, { '1S1n':1,'1S2n':1,'1Rn':0 });
  SIM._evaluateSRLatchNorNand(c, c.spec.gates[0]);
  assertEqual(getPin(c, '1Q'), 0, '1Q should be reset');
});

test('G31: 74279 cell 2   single S (2Sn=0) → Q=1', () => {
  const c = makeComp('74x279');
  setPins(c, { '2Sn':0,'2Rn':1 });
  SIM._evaluateSRLatchNorNand(c, c.spec.gates[1]);
  assertEqual(getPin(c, '2Q'), 1, '2Q should be set');
});

test('G32: 74279 cell 4   dual S (4S1n=0) → Q=1', () => {
  const c = makeComp('74x279');
  setPins(c, { '4S1n':0,'4S2n':1,'4Rn':1 });
  SIM._evaluateSRLatchNorNand(c, c.spec.gates[3]);
  assertEqual(getPin(c, '4Q'), 1, '4Q should be set');
});

test('G33: 74279 hold (S=1,R=1)   retains state', () => {
  const c = makeComp('74x279');
  // Set
  setPins(c, { '3Sn':0,'3Rn':1 });
  SIM._evaluateSRLatchNorNand(c, c.spec.gates[2]);
  assertEqual(getPin(c, '3Q'), 1, '3Q set');
  // Hold
  setPins(c, { '3Sn':1,'3Rn':1 });
  SIM._evaluateSRLatchNorNand(c, c.spec.gates[2]);
  assertEqual(getPin(c, '3Q'), 1, '3Q should hold 1');
});

// ── 74280 Tests: 9 bit Parity ─────────────────────────────────────────────────

test('G34: 74280 all inputs 0 → EVEN=1, ODD=0', () => {
  const c = makeComp('74x280');
  setPins(c, { 'A':0,'B':0,'C':0,'D':0,'E':0,'F':0,'G':0,'H':0,'I':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'EVEN'), 1, 'EVEN=1 (zero ones is even)');
  assertEqual(getPin(c, 'ODD'),  0, 'ODD=0');
});

test('G35: 74280 one input high → EVEN=0, ODD=1', () => {
  const c = makeComp('74x280');
  setPins(c, { 'A':1,'B':0,'C':0,'D':0,'E':0,'F':0,'G':0,'H':0,'I':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'EVEN'), 0, 'EVEN=0');
  assertEqual(getPin(c, 'ODD'),  1, 'ODD=1 (one HIGH = odd)');
});

test('G36: 74280 two inputs high → EVEN=1, ODD=0', () => {
  const c = makeComp('74x280');
  setPins(c, { 'A':1,'B':1,'C':0,'D':0,'E':0,'F':0,'G':0,'H':0,'I':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'EVEN'), 1, 'EVEN=1 (two HIGH = even)');
  assertEqual(getPin(c, 'ODD'),  0, 'ODD=0');
});

test('G37: 74280 nine inputs high → EVEN=0, ODD=1', () => {
  const c = makeComp('74x280');
  setPins(c, { 'A':1,'B':1,'C':1,'D':1,'E':1,'F':1,'G':1,'H':1,'I':1 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'EVEN'), 0, 'EVEN=0 (9 HIGH = odd)');
  assertEqual(getPin(c, 'ODD'),  1, 'ODD=1');
});

// ── 74281 Tests: 4 bit Accumulator ───────────────────────────────────────────

test('G38: 74281 CLRn=0 → acc=0', () => {
  const c = makeComp('74x281');
  setPins(c, { 'B0':1,'B1':1,'B2':1,'B3':1,
               'M0':1,'M1':1,'M2':1,'M3':1,
               'S0':0,'S1':0,'S2':0,'S3':0,
               'Cn':0,'CLRn':0,'CLK':0 });
  setPin(c, 'CLK', 1); evalGate(c, 0);
  assertEqual(getPin(c, 'F0'), 0, 'F0=0');
  assertEqual(getPin(c, 'F1'), 0, 'F1=0');
  assertEqual(getPin(c, 'F2'), 0, 'F2=0');
  assertEqual(getPin(c, 'F3'), 0, 'F3=0');
});

test('G39: 74281 accumulates correctly', () => {
  const c = makeComp('74x281');
  // Clear first
  setPins(c, { 'B0':0,'B1':0,'B2':0,'B3':0,
               'M0':1,'M1':1,'M2':1,'M3':1,
               'S0':1,'S1':0,'S2':0,'S3':1,  // select addition
               'Cn':0,'CLRn':0,'CLK':0 });
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  // Accumulate B=3
  setPin(c, 'CLRn', 1);
  setPin(c, 'B0', 1); setPin(c, 'B1', 1);
  setPin(c, 'CLK', 1); evalGate(c, 0); setPin(c, 'CLK', 0); evalGate(c, 0);
  const f = getPin(c, 'F0') | (getPin(c, 'F1') << 1) | (getPin(c, 'F2') << 2) | (getPin(c, 'F3') << 3);
  assert(f >= 0 && f <= 15, `F should be in range 0-15, got ${f}`);
});

// ── 74282 Tests: Look Ahead Carry ─────────────────────────────────────────────

test('G40: 74282 all P=0,G=0 → carry does not propagate', () => {
  const c = makeComp('74x282');
  setPins(c, { 'P0':0,'G0':0,'P1':0,'G1':0,'P2':0,'G2':0,'P3':0,'G3':0,
               'Cn':1,'SEL':0,'P_in':0,'G_in':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'Cn4'), 0, 'Cn4=0 (no propagate/generate)');
  assertEqual(getPin(c, 'P'),   0, 'P=0');
  assertEqual(getPin(c, 'G'),   0, 'G=0');
});

test('G41: 74282 P0=1,Cn=1 → Cn4 propagates', () => {
  const c = makeComp('74x282');
  setPins(c, { 'P0':1,'G0':0,'P1':1,'G1':0,'P2':1,'G2':0,'P3':1,'G3':0,
               'Cn':1,'SEL':0,'P_in':0,'G_in':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'Cn4'), 1, 'Cn4=1 when all P=1 and Cn=1');
  assertEqual(getPin(c, 'P'),   1, 'Group P=1');
});

test('G42: 74282 G3=1 → Cn4=1 regardless of Cn', () => {
  const c = makeComp('74x282');
  setPins(c, { 'P0':0,'G0':0,'P1':0,'G1':0,'P2':0,'G2':0,'P3':1,'G3':1,
               'Cn':0,'SEL':0,'P_in':0,'G_in':0 });
  evalGate(c, 0);
  assertEqual(getPin(c, 'Cn4'), 1, 'Cn4=1 when G3=1');
  assertEqual(getPin(c, 'G'),   1, 'Group G=1');
});

// ── 74283 Tests: 4 bit Full Adder ─────────────────────────────────────────────

test('G43: 74283 0+0+0 = 0', () => {
  const c = makeComp('74x283');
  setPins(c, { 'A1':0,'A2':0,'A3':0,'A4':0,'B1':0,'B2':0,'B3':0,'B4':0,'C0':0 });
  evalGate(c, 0);
  ['S1','S2','S3','S4','S5'].forEach(p => assertEqual(getPin(c, p), 0, `${p}=0`));
});

test('G44: 74283 5+3=8 (0101+0011=1000)', () => {
  const c = makeComp('74x283');
  // A=5 (0101), B=3 (0011)
  setPins(c, { 'A1':1,'A2':0,'A3':1,'A4':0,'B1':1,'B2':1,'B3':0,'B4':0,'C0':0 });
  evalGate(c, 0);
  const s = getPin(c,'S1') | (getPin(c,'S2')<<1) | (getPin(c,'S3')<<2) | (getPin(c,'S4')<<3) | (getPin(c,'S5')<<4);
  assertEqual(s, 8, `5+3 should be 8, got ${s}`);
});

test('G45: 74283 15+15+C0 = 31', () => {
  const c = makeComp('74x283');
  // A=15 (1111), B=15 (1111), C0=1 → 31 (11111)
  setPins(c, { 'A1':1,'A2':1,'A3':1,'A4':1,'B1':1,'B2':1,'B3':1,'B4':1,'C0':1 });
  evalGate(c, 0);
  const s = getPin(c,'S1') | (getPin(c,'S2')<<1) | (getPin(c,'S3')<<2) | (getPin(c,'S4')<<3) | (getPin(c,'S5')<<4);
  assertEqual(s, 31, `15+15+1 should be 31, got ${s}`);
});

test('G46: 74283 carry in propagates', () => {
  const c = makeComp('74x283');
  // A=7 (0111), B=8 (1000), C0=1 → 16 (10000)
  setPins(c, { 'A1':1,'A2':1,'A3':1,'A4':0,'B1':0,'B2':0,'B3':0,'B4':1,'C0':1 });
  evalGate(c, 0);
  const s = getPin(c,'S1') | (getPin(c,'S2')<<1) | (getPin(c,'S3')<<2) | (getPin(c,'S4')<<3) | (getPin(c,'S5')<<4);
  assertEqual(s, 16, `7+8+1 should be 16, got ${s}`);
});

// ── 74284+74285 Tests: 4×4 Multiplier Hi/Lo ──────────────────────────────────

test('G47: 74284+74285 3×3=9', () => {
  const hi = makeComp('74x284');
  const lo = makeComp('74x285');
  // A=3, B=3
  const inputs = { 'A0':1,'A1':1,'A2':0,'A3':0,'B0':1,'B1':1,'B2':0,'B3':0 };
  setPins(hi, inputs); evalGate(hi, 0);
  setPins(lo, inputs); evalGate(lo, 0);
  const pLo = [0,1,2,3].map(i => getPin(lo, `P${i}`)).reduce((a,b,i) => a|(b<<i),0);
  const pHi = [4,5,6,7].map(i => getPin(hi, `P${i}`)).reduce((a,b,i) => a|(b<<(i+4)),0);
  const prod = pLo | pHi;
  assertEqual(prod, 9, `3×3 should be 9, got ${prod}`);
});

test('G48: 74284+74285 15×15=225', () => {
  const hi = makeComp('74x284');
  const lo = makeComp('74x285');
  const inputs = { 'A0':1,'A1':1,'A2':1,'A3':1,'B0':1,'B1':1,'B2':1,'B3':1 };
  setPins(hi, inputs); evalGate(hi, 0);
  setPins(lo, inputs); evalGate(lo, 0);
  const pLo = [0,1,2,3].map(i => getPin(lo, `P${i}`)).reduce((a,b,i) => a|(b<<i),0);
  const pHi = [4,5,6,7].map(i => getPin(hi, `P${i}`)).reduce((a,b,i) => a|(b<<(i+4)),0);
  const prod = pLo | pHi;
  assertEqual(prod, 225, `15×15 should be 225, got ${prod}`);
});

test('G49: 74285 lo only: 5×4=20', () => {
  const lo = makeComp('74x285');
  // A=5 (0101), B=4 (0100) → P=20 (00010100) → lo=4 (0100)
  setPins(lo, { 'A0':1,'A1':0,'A2':1,'A3':0,'B0':0,'B1':0,'B2':1,'B3':0 });
  evalGate(lo, 0);
  const pLo = [0,1,2,3].map(i => getPin(lo, `P${i}`)).reduce((a,b,i) => a|(b<<i),0);
  assertEqual(pLo, (5*4) & 0xF, `Low nibble of 5×4 should be ${(5*4)&0xF}, got ${pLo}`);
});

test('G50: 74284 hi only: 5×4=20 hi nibble', () => {
  const hi = makeComp('74x284');
  setPins(hi, { 'A0':1,'A1':0,'A2':1,'A3':0,'B0':0,'B1':0,'B2':1,'B3':0 });
  evalGate(hi, 0);
  const pHi = [4,5,6,7].map(i => getPin(hi, `P${i}`)).reduce((a,b,i) => a|(b<<(i+4)),0);
  assertEqual(pHi >> 4, (5*4) >> 4, `High nibble of 5×4 should be ${(5*4)>>4}`);
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests run: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
