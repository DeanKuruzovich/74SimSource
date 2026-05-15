/**
 * Tests for Chips Block 19: 74286, 74289, 74290, 74292, 74293,
 *                           74294, 74295, 74297, 74298, 74299, 74300, 74301,
 *                           74302, 74303
 */
import { CHIPS_BLOCK_19 } from '../chips/chips19.js';
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

function makeComp(chipId) {
  const spec = CHIPS_BLOCK_19[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_19`);
  const comp = {
    id: `test_${chipId}`,
    chipId,
    spec,
    pins: {},
    state: null,
  };
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

function setPins(comp, map) {
  for (const [name, val] of Object.entries(map)) setPin(comp, name, val);
}

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
  const type = gate.type;
  switch (type) {
    case 'PARITY_9BIT_PE':         SIM._evaluateParity9BitPE(comp, gate); break;
    case 'RAM_16X4_OC_INV':        SIM._evaluateRam16x4OcInv(comp, gate); break;
    case 'COUNTER_DECADE_DIV':     SIM._evaluateCounterDecadeDiv(comp, gate); break;
    case 'FREQ_DIV_PROG':          SIM._evaluateFreqDivProg(comp, gate); break;
    case 'COUNTER_4BIT_DIV':       SIM._evaluateCounter4BitDiv(comp, gate); break;
    case 'SHIFT_REG_4BIT_BIDIR_TRI': SIM._evaluateShiftReg4BitBidirTri(comp, gate); break;
    case 'PLL_FILTER':             SIM._evaluatePllFilter(comp, gate); break;
    case 'MUX_QUAD_2TO1_STORED':   SIM._evaluateMuxQuad2to1Stored(comp, gate); break;
    case 'SHIFT_REG_8BIT_UNIV_TRI': SIM._evaluateShiftReg8BitUnivTri(comp, gate); break;
    case 'RAM_256X1_OC':           SIM._evaluateRam256x1OC(comp, gate); break;
    case 'CLK_DIV2_OCT':           SIM._evaluateClkDiv2Oct(comp, gate); break;
    default: throw new Error(`Unknown gate type: ${type}`);
  }
}

function fallingEdge(comp, clkPin, gateIdx = 0) {
  setPin(comp, clkPin, 1);
  evalGate(comp, gateIdx);
  setPin(comp, clkPin, 0);
  evalGate(comp, gateIdx);
}

function risingEdge(comp, clkPin, gateIdx = 0) {
  setPin(comp, clkPin, 0);
  evalGate(comp, gateIdx);
  setPin(comp, clkPin, 1);
  evalGate(comp, gateIdx);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 74286 - 9 bit Parity PE
// ═══════════════════════════════════════════════════════════════════════════════
test('74286 exists', () => assert(CHIPS_BLOCK_19['74286']));

test('74286 even parity: 0 inputs, PE=0 → EVEN=1 ODD=0', () => {
  const c = makeComp('74286');
  setPins(c, {A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0,I:0,PE:0});
  evalGate(c);
  assertEqual(getPin(c,'EVEN'), 1, 'EVEN');
  assertEqual(getPin(c,'ODD'),  0, 'ODD');
});

test('74286 odd parity: 1 input, PE=0 → EVEN=0 ODD=1', () => {
  const c = makeComp('74286');
  setPins(c, {A:1,B:0,C:0,D:0,E:0,F:0,G:0,H:0,I:0,PE:0});
  evalGate(c);
  assertEqual(getPin(c,'EVEN'), 0, 'EVEN');
  assertEqual(getPin(c,'ODD'),  1, 'ODD');
});

test('74286 4 inputs (even), PE=0 → EVEN=1', () => {
  const c = makeComp('74286');
  setPins(c, {A:1,B:1,C:1,D:1,E:0,F:0,G:0,H:0,I:0,PE:0});
  evalGate(c);
  assertEqual(getPin(c,'EVEN'), 1, 'EVEN');
});

test('74286 PE=1 flips parity: 0 inputs, PE=1 → EVEN=0 ODD=1', () => {
  const c = makeComp('74286');
  setPins(c, {A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0,I:0,PE:1});
  evalGate(c);
  assertEqual(getPin(c,'EVEN'), 0, 'EVEN');
  assertEqual(getPin(c,'ODD'),  1, 'ODD');
});

test('74286 9 inputs all 1 (odd), PE=0 → EVEN=0 ODD=1', () => {
  const c = makeComp('74286');
  setPins(c, {A:1,B:1,C:1,D:1,E:1,F:1,G:1,H:1,I:1,PE:0});
  evalGate(c);
  assertEqual(getPin(c,'EVEN'), 0, 'EVEN');
  assertEqual(getPin(c,'ODD'),  1, 'ODD');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74287 - PROM 256×4 Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74287 exists', () => assert(CHIPS_BLOCK_19['74287']));

test('74287 OEn=1 → HiZ outputs', () => {
  const c = makeComp('74287');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,OEn:1,CSn:0});
  evalGate(c);
  assertEqual(getPin(c,'D0'), null, 'D0 HiZ');
  assertEqual(getPin(c,'D3'), null, 'D3 HiZ');
});

test('74287 CSn=1 → HiZ outputs', () => {
  const c = makeComp('74287');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,OEn:0,CSn:1});
  evalGate(c);
  assertEqual(getPin(c,'D0'), null, 'D0 HiZ');
});

test('74287 enabled blank ROM → all 0', () => {
  const c = makeComp('74287');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,OEn:0,CSn:0});
  evalGate(c);
  assertEqual(getPin(c,'D0'), 0, 'D0');
  assertEqual(getPin(c,'D1'), 0, 'D1');
  assertEqual(getPin(c,'D2'), 0, 'D2');
  assertEqual(getPin(c,'D3'), 0, 'D3');
});

test('74287 programmed ROM returns stored value', () => {
  const c = makeComp('74287');
  if (!c.state) c.state = {};
  c.state.rom = new Uint8Array(256);
  c.state.rom[5] = 0xA; // addr 5 = 0b1010
  setPins(c, {A0:1,A1:0,A2:1,A3:0,A4:0,A5:0,A6:0,A7:0,OEn:0,CSn:0}); // addr=5
  evalGate(c);
  assertEqual(getPin(c,'D0'), 0, 'D0');
  assertEqual(getPin(c,'D1'), 1, 'D1');
  assertEqual(getPin(c,'D2'), 0, 'D2');
  assertEqual(getPin(c,'D3'), 1, 'D3');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74288 - PROM 32×8 Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74288 exists', () => assert(CHIPS_BLOCK_19['74288']));

test('74288 OEn=1 → HiZ', () => {
  const c = makeComp('74288');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,OEn:1,CSn:0});
  evalGate(c);
  assertEqual(getPin(c,'D0'), null, 'D0 HiZ');
});

test('74288 enabled blank ROM → 0', () => {
  const c = makeComp('74288');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,OEn:0,CSn:0});
  evalGate(c);
  assertEqual(getPin(c,'D0'), 0, 'D0');
  assertEqual(getPin(c,'D6'), 0, 'D6');
});

test('74288 programmed value', () => {
  const c = makeComp('74288');
  if (!c.state) c.state = {};
  c.state.rom = new Uint8Array(32);
  c.state.rom[3] = 0b1010101;
  setPins(c, {A0:1,A1:1,A2:0,A3:0,A4:0,OEn:0,CSn:0}); // addr=3
  evalGate(c);
  assertEqual(getPin(c,'D0'), 1, 'D0');
  assertEqual(getPin(c,'D1'), 0, 'D1');
  assertEqual(getPin(c,'D2'), 1, 'D2');
  assertEqual(getPin(c,'D6'), 1, 'D6');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74289 - RAM 16×4 OC Inverted
// ═══════════════════════════════════════════════════════════════════════════════
test('74289 exists', () => assert(CHIPS_BLOCK_19['74289']));

test('74289 CSn=1 → HiZ', () => {
  const c = makeComp('74289');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,CSn:1,WEn:1,D0:0,D1:0,D2:0,D3:0});
  evalGate(c);
  assertEqual(getPin(c,'Q0n'), null, 'Q0n HiZ');
});

test('74289 write then read back (inverted)', () => {
  const c = makeComp('74289');
  // Write 0b1010 to addr 0: D0=0,D1=1,D2=0,D3=1
  setPins(c, {A0:0,A1:0,A2:0,A3:0, CSn:0, WEn:0, D0:0,D1:1,D2:0,D3:1});
  evalGate(c);
  // Read addr 0 (WEn=1)
  setPins(c, {CSn:0, WEn:1});
  evalGate(c);
  // Outputs are inverted: Q0n = !D0 = 1, Q1n = !D1 = 0, Q2n = !D2 = 1, Q3n = !D3 = 0
  assertEqual(getPin(c,'Q0n'), 1, 'Q0n');
  assertEqual(getPin(c,'Q1n'), 0, 'Q1n');
  assertEqual(getPin(c,'Q2n'), 1, 'Q2n');
  assertEqual(getPin(c,'Q3n'), 0, 'Q3n');
});

test('74289 fresh RAM reads all-inverted-0 (all 1)', () => {
  const c = makeComp('74289');
  setPins(c, {A0:0,A1:0,A2:0,A3:0, CSn:0, WEn:1, D0:0,D1:0,D2:0,D3:0});
  evalGate(c);
  // Unwritten → stored 0 → inverted outputs all 1
  assertEqual(getPin(c,'Q0n'), 1, 'Q0n');
  assertEqual(getPin(c,'Q3n'), 1, 'Q3n');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74290 - Decade Counter (÷2 + ÷5)
// ═══════════════════════════════════════════════════════════════════════════════
test('74290 exists', () => assert(CHIPS_BLOCK_19['74290']));

test('74290 R01+R02 reset → QA=QB=QC=QD=0', () => {
  const c = makeComp('74290');
  setPins(c, {CLK_A:0,CLK_B:0,R01:1,R02:1,R91:0,R92:0});
  evalGate(c);
  assertEqual(getPin(c,'QA'), 0, 'QA');
  assertEqual(getPin(c,'QB'), 0, 'QB');
  assertEqual(getPin(c,'QC'), 0, 'QC');
  assertEqual(getPin(c,'QD'), 0, 'QD');
});

test('74290 R91+R92 set to 9 → QA=1 QD=1 QB=QC=0', () => {
  const c = makeComp('74290');
  setPins(c, {CLK_A:0,CLK_B:0,R01:0,R02:0,R91:1,R92:1});
  evalGate(c);
  assertEqual(getPin(c,'QA'), 1, 'QA');
  assertEqual(getPin(c,'QB'), 0, 'QB');
  assertEqual(getPin(c,'QC'), 0, 'QC');
  assertEqual(getPin(c,'QD'), 1, 'QD');
});

test('74290 ÷2: CLK_A toggles QA', () => {
  const c = makeComp('74290');
  // Reset first
  setPins(c, {CLK_A:0,CLK_B:0,R01:1,R02:1,R91:0,R92:0});
  evalGate(c);
  setPins(c, {R01:0,R02:0});
  // QA=0, toggle on falling edge of CLK_A
  setPin(c, 'CLK_A', 1); evalGate(c);
  assertEqual(getPin(c,'QA'), 0, 'QA before fall');
  fallingEdge(c, 'CLK_A');
  assertEqual(getPin(c,'QA'), 1, 'QA after 1 fall');
  fallingEdge(c, 'CLK_A');
  assertEqual(getPin(c,'QA'), 0, 'QA after 2 falls');
});

test('74290 ÷5: CLK_B cycles QB,QC,QD through 0..4', () => {
  const c = makeComp('74290');
  setPins(c, {CLK_A:0,CLK_B:0,R01:1,R02:1,R91:0,R92:0});
  evalGate(c);
  setPins(c, {R01:0,R02:0});
  // Cycle CLK_B 5 times, should wrap back to 0
  setPin(c, 'CLK_B', 1); evalGate(c);
  for (let i = 0; i < 5; i++) {
    fallingEdge(c, 'CLK_B');
  }
  assertEqual(getPin(c,'QB'), 0, 'QB after 5 clocks');
  assertEqual(getPin(c,'QC'), 0, 'QC after 5 clocks');
  assertEqual(getPin(c,'QD'), 0, 'QD after 5 clocks');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74292 - Programmable Frequency Divider
// ═══════════════════════════════════════════════════════════════════════════════
test('74292 exists', () => assert(CHIPS_BLOCK_19['74292']));

test('74292 ÷2: S0=1 rest 0 → OUT toggles every 2 CLK edges', () => {
  const c = makeComp('74292');
  // S=1 → divisor=2, OUT toggles after 2 CLK falling edges
  setPins(c, {CLK:0,S0:1,S1:0,S2:0,S3:0,S4:0,S5:0,S6:0,S7:0,S8:0,S9:0});
  evalGate(c);
  const init = getPin(c,'OUT');
  fallingEdge(c, 'CLK');
  assertEqual(getPin(c,'OUT'), init, 'no toggle after 1');
  fallingEdge(c, 'CLK');
  assertEqual(getPin(c,'OUT'), init ^ 1, 'toggle after 2');
});

test('74292 ÷1: S0=0 → OUT toggles every CLK edge', () => {
  const c = makeComp('74292');
  setPins(c, {CLK:0,S0:0,S1:0,S2:0,S3:0,S4:0,S5:0,S6:0,S7:0,S8:0,S9:0});
  evalGate(c);
  const init = getPin(c,'OUT');
  fallingEdge(c, 'CLK');
  assertEqual(getPin(c,'OUT'), init ^ 1, 'toggle after 1');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74293 - 4 bit Binary Counter (÷2 + ÷8)
// ═══════════════════════════════════════════════════════════════════════════════
test('74293 exists', () => assert(CHIPS_BLOCK_19['74293']));

test('74293 reset → all 0', () => {
  const c = makeComp('74293');
  setPins(c, {CLK_A:0,CLK_B:0,R01:1,R02:1});
  evalGate(c);
  assertEqual(getPin(c,'QA'), 0, 'QA');
  assertEqual(getPin(c,'QB'), 0, 'QB');
  assertEqual(getPin(c,'QC'), 0, 'QC');
  assertEqual(getPin(c,'QD'), 0, 'QD');
});

test('74293 ÷2: QA toggles on CLK_A falling edge', () => {
  const c = makeComp('74293');
  setPins(c, {CLK_A:0,CLK_B:0,R01:1,R02:1});
  evalGate(c);
  setPins(c, {R01:0,R02:0});
  setPin(c, 'CLK_A', 1); evalGate(c);
  fallingEdge(c, 'CLK_A');
  assertEqual(getPin(c,'QA'), 1, 'QA after 1 fall');
  fallingEdge(c, 'CLK_A');
  assertEqual(getPin(c,'QA'), 0, 'QA after 2 falls');
});

test('74293 ÷8: QB,QC,QD count 0-7 on CLK_B', () => {
  const c = makeComp('74293');
  setPins(c, {CLK_A:0,CLK_B:0,R01:1,R02:1});
  evalGate(c);
  setPins(c, {R01:0,R02:0});
  setPin(c, 'CLK_B', 1); evalGate(c);
  // After 4 falling edges QB=0,QC=0,QD=1 (count=4 → binary 100)
  for (let i = 0; i < 4; i++) fallingEdge(c, 'CLK_B');
  assertEqual(getPin(c,'QB'), 0, 'QB=0');
  assertEqual(getPin(c,'QC'), 0, 'QC=0');
  assertEqual(getPin(c,'QD'), 1, 'QD=1');
  // After 4 more → wrap to 0
  for (let i = 0; i < 4; i++) fallingEdge(c, 'CLK_B');
  assertEqual(getPin(c,'QB'), 0, 'QB=0 after 8');
  assertEqual(getPin(c,'QD'), 0, 'QD=0 after 8');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74294 - Programmable Frequency Divider (same gate type as 74292)
// ═══════════════════════════════════════════════════════════════════════════════
test('74294 exists', () => assert(CHIPS_BLOCK_19['74294']));

test('74294 ÷2: OUT toggles every 2 CLK edges', () => {
  const c = makeComp('74294');
  setPins(c, {CLK:0,S0:1,S1:0,S2:0,S3:0,S4:0,S5:0,S6:0,S7:0,S8:0,S9:0});
  evalGate(c);
  const init = getPin(c,'OUT');
  fallingEdge(c, 'CLK');
  assertEqual(getPin(c,'OUT'), init, 'no toggle after 1');
  fallingEdge(c, 'CLK');
  assertEqual(getPin(c,'OUT'), init ^ 1, 'toggle after 2');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74295 - 4 bit Bidirectional Shift Register, Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74295 exists', () => assert(CHIPS_BLOCK_19['74295']));

test('74295 OEn=1 → HiZ', () => {
  const c = makeComp('74295');
  setPins(c, {SER:0,A:0,B:0,C:0,D:0,MODE:0,CLK:0,OEn:1});
  evalGate(c);
  assertEqual(getPin(c,'QA'), null, 'QA HiZ');
  assertEqual(getPin(c,'QD'), null, 'QD HiZ');
});

test('74295 parallel load MODE=1', () => {
  const c = makeComp('74295');
  setPins(c, {SER:0,A:1,B:0,C:1,D:0,MODE:1,CLK:0,OEn:0});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'QA'), 1, 'QA');
  assertEqual(getPin(c,'QB'), 0, 'QB');
  assertEqual(getPin(c,'QC'), 1, 'QC');
  assertEqual(getPin(c,'QD'), 0, 'QD');
});

test('74295 shift right MODE=0: SER enters MSB', () => {
  const c = makeComp('74295');
  // Load 0b1010
  setPins(c, {SER:0,A:0,B:1,C:0,D:1,MODE:1,CLK:0,OEn:0});
  risingEdge(c, 'CLK');
  // Now shift right with SER=1
  setPin(c, 'MODE', 0);
  setPin(c, 'SER', 1);
  risingEdge(c, 'CLK');
  // After shift right: reg = (0b1010 >> 1) | (1<<3) = 0b1101
  assertEqual(getPin(c,'QA'), 1, 'QA');
  assertEqual(getPin(c,'QB'), 0, 'QB');
  assertEqual(getPin(c,'QC'), 1, 'QC');
  assertEqual(getPin(c,'QD'), 1, 'QD');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74297 - Digital PLL Filter (stub)
// ═══════════════════════════════════════════════════════════════════════════════
test('74297 exists', () => assert(CHIPS_BLOCK_19['74297']));

test('74297 outputs reachable (no crash)', () => {
  const c = makeComp('74297');
  setPins(c, {CLK_IN:0,REF:0,K1:0,K2:0,K3:0,K4:0,N1:0,N2:0,N3:0,N4:0,V_IN:0});
  evalGate(c);
  // Just verify outputs are defined (stub)
  const out = getPin(c,'CLK_OUT');
  assert(out === 0 || out === 1, 'CLK_OUT should be digital');
});

test('74297 ÷2 by K: CLK_OUT toggles after 2 CLK_IN falling edges', () => {
  const c = makeComp('74297');
  // K=1 (K1=1, rest 0) → divisor = 1+1 = 2
  setPins(c, {CLK_IN:0,REF:0,K1:1,K2:0,K3:0,K4:0,N1:0,N2:0,N3:0,N4:0,V_IN:0});
  evalGate(c);
  const init = getPin(c,'CLK_OUT');
  fallingEdge(c, 'CLK_IN');
  assertEqual(getPin(c,'CLK_OUT'), init, 'no change after 1');
  fallingEdge(c, 'CLK_IN');
  assertEqual(getPin(c,'CLK_OUT'), init ^ 1, 'toggle after 2');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74298 - Quad 2:1 MUX with Storage
// ═══════════════════════════════════════════════════════════════════════════════
test('74298 exists', () => assert(CHIPS_BLOCK_19['74298']));

test('74298 SEL=0: selects A inputs on rising CLK', () => {
  const c = makeComp('74298');
  setPins(c, {A1:1,B1:0, A2:0,B2:1, A3:1,B3:0, A4:0,B4:1, SEL:0, CLK:0});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'Q1'), 1, 'Q1=A1=1');
  assertEqual(getPin(c,'Q2'), 0, 'Q2=A2=0');
  assertEqual(getPin(c,'Q3'), 1, 'Q3=A3=1');
  assertEqual(getPin(c,'Q4'), 0, 'Q4=A4=0');
});

test('74298 SEL=1: selects B inputs on rising CLK', () => {
  const c = makeComp('74298');
  setPins(c, {A1:1,B1:0, A2:0,B2:1, A3:1,B3:0, A4:0,B4:1, SEL:1, CLK:0});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'Q1'), 0, 'Q1=B1=0');
  assertEqual(getPin(c,'Q2'), 1, 'Q2=B2=1');
  assertEqual(getPin(c,'Q3'), 0, 'Q3=B3=0');
  assertEqual(getPin(c,'Q4'), 1, 'Q4=B4=1');
});

test('74298 holds output between clocks', () => {
  const c = makeComp('74298');
  setPins(c, {A1:1,B1:0,A2:0,B2:0,A3:0,B3:0,A4:0,B4:0,SEL:0,CLK:0});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'Q1'), 1, 'Q1 stored');
  // Change input but don't clock
  setPin(c, 'A1', 0);
  evalGate(c);
  assertEqual(getPin(c,'Q1'), 1, 'Q1 still held');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74299 - 8 bit Universal Shift/Storage, Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74299 exists', () => assert(CHIPS_BLOCK_19['74299']));

test('74299 OEAn=1 → HiZ', () => {
  const c = makeComp('74299');
  setPins(c, {S0:0,S1:0,SR:0,SL:0,OEAn:1,OEBn:0,
    QA:0,QB:0,QC:0,QD:0,QE:0,QF:0,QG:0,QH:0,CLK:0});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'QA'), null, 'QA HiZ');
});

test('74299 parallel load S0=1,S1=1', () => {
  const c = makeComp('74299');
  // Load 0b10110011 = 179
  setPins(c, {S0:1,S1:1,SR:0,SL:0,OEAn:0,OEBn:0,
    QA:1,QB:1,QC:0,QD:0,QE:1,QF:1,QG:0,QH:1,CLK:0});
  risingEdge(c, 'CLK');
  // Switch to hold mode to read outputs (load mode tri-states I/O pins)
  setPins(c, {S0:0,S1:0});
  evalGate(c);
  assertEqual(getPin(c,'QA'), 1, 'QA');
  assertEqual(getPin(c,'QB'), 1, 'QB');
  assertEqual(getPin(c,'QC'), 0, 'QC');
  assertEqual(getPin(c,'QD'), 0, 'QD');
  assertEqual(getPin(c,'QE'), 1, 'QE');
  assertEqual(getPin(c,'QH'), 1, 'QH');
});

test('74299 hold S0=0,S1=0: outputs unchanged', () => {
  const c = makeComp('74299');
  // Load all 1s, then switch to hold to read outputs
  setPins(c, {S0:1,S1:1,SR:0,SL:0,OEAn:0,OEBn:0,
    QA:1,QB:1,QC:1,QD:1,QE:1,QF:1,QG:1,QH:1,CLK:0});
  risingEdge(c, 'CLK');
  // Switch to hold: outputs become driveable
  setPins(c, {S0:0,S1:0});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'QA'), 1, 'QA holds');
  assertEqual(getPin(c,'QH'), 1, 'QH holds');
});

test('74299 shift right S0=1,S1=0: SR enters QH', () => {
  const c = makeComp('74299');
  // Load 0b00000000
  setPins(c, {S0:1,S1:1,SR:1,SL:0,OEAn:0,OEBn:0,
    QA:0,QB:0,QC:0,QD:0,QE:0,QF:0,QG:0,QH:0,CLK:0});
  risingEdge(c, 'CLK');
  // Shift right: SR=1 enters QH, all shift toward QA
  setPins(c, {S0:1,S1:0,SR:1});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'QH'), 1, 'QH=SR=1 after shift right');
  assertEqual(getPin(c,'QA'), 0, 'QA=shifted out=0');
});

test('74299 shift left S0=0,S1=1: SL enters QA', () => {
  const c = makeComp('74299');
  // Load all 0
  setPins(c, {S0:1,S1:1,SR:0,SL:0,OEAn:0,OEBn:0,
    QA:0,QB:0,QC:0,QD:0,QE:0,QF:0,QG:0,QH:0,CLK:0});
  risingEdge(c, 'CLK');
  // Shift left: SL=1 enters QA
  setPins(c, {S0:0,S1:1,SL:1});
  risingEdge(c, 'CLK');
  assertEqual(getPin(c,'QA'), 1, 'QA=SL=1 after shift left');
  assertEqual(getPin(c,'QH'), 0, 'QH=shifted=0');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74300 - RAM 256×1 OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74300 exists', () => assert(CHIPS_BLOCK_19['74300']));

test('74300 CSn=1 → HiZ', () => {
  const c = makeComp('74300');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,WEn:1,CSn:1,DI:0});
  evalGate(c);
  assertEqual(getPin(c,'DO'), null, 'DO HiZ');
});

test('74300 write then read', () => {
  const c = makeComp('74300');
  // Write 1 to addr 0
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,WEn:0,CSn:0,DI:1});
  evalGate(c);
  // Read addr 0
  setPin(c,'WEn',1);
  evalGate(c);
  assertEqual(getPin(c,'DO'), 1, 'DO=1');
});

test('74300 fresh address reads 0', () => {
  const c = makeComp('74300');
  setPins(c, {A0:1,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,WEn:1,CSn:0,DI:0});
  evalGate(c);
  assertEqual(getPin(c,'DO'), 0, 'DO=0');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74301 - RAM 256×1 OC (same behavior as 74300)
// ═══════════════════════════════════════════════════════════════════════════════
test('74301 exists', () => assert(CHIPS_BLOCK_19['74301']));

test('74301 write then read', () => {
  const c = makeComp('74301');
  setPins(c, {A0:1,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,WEn:0,CSn:0,DI:1});
  evalGate(c);
  setPin(c,'WEn',1);
  evalGate(c);
  assertEqual(getPin(c,'DO'), 1, 'DO=1 at addr 1');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74302 - RAM 256×1 OC (same behavior)
// ═══════════════════════════════════════════════════════════════════════════════
test('74302 exists', () => assert(CHIPS_BLOCK_19['74302']));

test('74302 write then read', () => {
  const c = makeComp('74302');
  setPins(c, {A0:0,A1:1,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,WEn:0,CSn:0,DI:1});
  evalGate(c);
  setPin(c,'WEn',1);
  evalGate(c);
  assertEqual(getPin(c,'DO'), 1, 'DO=1 at addr 2');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74303 - Octal ÷2 Clock Driver
// ═══════════════════════════════════════════════════════════════════════════════
test('74303 exists', () => assert(CHIPS_BLOCK_19['74303']));

test('74303 Q3 toggles on CLK3 falling edge', () => {
  const c = makeComp('74303');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const init = getPin(c,'Q3');
  fallingEdge(c, 'CLK3');
  assertEqual(getPin(c,'Q3'), init ^ 1, 'Q3 toggled');
  fallingEdge(c, 'CLK3');
  assertEqual(getPin(c,'Q3'), init, 'Q3 back');
});

test('74303 Q7n is inverted: toggles on CLK7 falling edge', () => {
  const c = makeComp('74303');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const init = getPin(c,'Q7n');
  // Q7 internal starts at 0, so Q7n starts at 1
  fallingEdge(c, 'CLK7');
  assertEqual(getPin(c,'Q7n'), init ^ 1, 'Q7n toggled');
});

test('74303 channels independent', () => {
  const c = makeComp('74303');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const q3_0 = getPin(c,'Q3');
  const q4_0 = getPin(c,'Q4');
  // Only toggle CLK3
  fallingEdge(c, 'CLK3');
  assertEqual(getPin(c,'Q3'), q3_0 ^ 1, 'Q3 toggled');
  assertEqual(getPin(c,'Q4'), q4_0, 'Q4 unchanged');
});

test('74303 Q8 toggles on CLK8', () => {
  const c = makeComp('74303');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const init = getPin(c,'Q8');
  fallingEdge(c, 'CLK8');
  assertEqual(getPin(c,'Q8'), init ^ 1, 'Q8 toggled');
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed+failed} tests`);
if (failed > 0) process.exit(1);
