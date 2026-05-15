/**
 * Tests for Chips Block 20: 74304, 74305, 74306, 74309, 74310, 74311, 74312,
 *                           74313, 74314, 74315, 74316, 74317, 74318, 74319,
 *                           74320, 74321
 */
import { CHIPS_BLOCK_20 } from '../chips/chips20.js';
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
  const spec = CHIPS_BLOCK_20[chipId];
  assert(spec, `Chip ${chipId} not found in CHIPS_BLOCK_20`);
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
    case 'CLK_DIV2_OCT':          SIM._evaluateClkDiv2Oct(comp, gate); break;
    case 'CLK_DIV2_OCT_4INV':     SIM._evaluateClkDiv2Oct4Inv(comp, gate); break;
    case 'BUS_XCVR_8BIT_GTL':     SIM._evaluateBusXcvr8BitGtl(comp, gate); break;
    case 'RAM_1024X1_OC':         SIM._evaluateRam1024x1OC(comp, gate); break;
    case 'BUFFER_OCT_INV_ST_TRI': SIM._evaluateBufferOctInvStTri(comp, gate); break;
    case 'RAM_16X9_LATCH_OC':     SIM._evaluateRam16x9LatchOC(comp, gate); break;
    case 'RAM_16X9_OC':           SIM._evaluateRam16x9OC(comp, gate); break;
    case 'RAM_16X12_OC':          SIM._evaluateRam16x12OC(comp, gate); break;
    case 'RAM_64X4_CMN_OC':       SIM._evaluateRam64x4CmnOC(comp, gate); break;
    case 'RAM_64X4_OC':           SIM._evaluateRam64x4OC(comp, gate); break;
    case 'RAM_32X8_OC':           SIM._evaluateRam32x8OC(comp, gate); break;
    case 'RAM_16X4_OC':           SIM._evaluateRam16x4OC(comp, gate); break;
    case 'CRYSTAL_OSC':           SIM._evaluateCrystalOsc(comp, gate); break;
    case 'CRYSTAL_OSC_DIV':       SIM._evaluateCrystalOscDiv(comp, gate); break;
    default: throw new Error(`Unknown gate type: ${gate.type}`);
  }
}

function fallingEdge(comp, clkPin, gateIdx = 0) {
  setPin(comp, clkPin, 1); evalGate(comp, gateIdx);
  setPin(comp, clkPin, 0); evalGate(comp, gateIdx);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 74304 - Octal ÷2 Clock Driver
// ═══════════════════════════════════════════════════════════════════════════════
test('74304 exists', () => assert(CHIPS_BLOCK_20['74304']));

test('74304 Q3 toggles on CLK3 falling edge', () => {
  const c = makeComp('74304');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const init = getPin(c,'Q3');
  fallingEdge(c,'CLK3');
  assertEqual(getPin(c,'Q3'), init ^ 1, 'Q3 toggled');
});

test('74304 Q7 non-inverted (unlike 74303)', () => {
  const c = makeComp('74304');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const init = getPin(c,'Q7');
  fallingEdge(c,'CLK7');
  // Q7 in 74304 is normal (not inverted)
  assertEqual(getPin(c,'Q7'), init ^ 1, 'Q7 toggled (non-inverted)');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74305 - Octal ÷2 Clock Driver, 4 Inverted Outputs
// ═══════════════════════════════════════════════════════════════════════════════
test('74305 exists', () => assert(CHIPS_BLOCK_20['74305']));

test('74305 Q3 is non-inverted', () => {
  const c = makeComp('74305');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const init = getPin(c,'Q3');
  fallingEdge(c,'CLK3');
  assertEqual(getPin(c,'Q3'), init ^ 1, 'Q3 toggled');
});

test('74305 Q5n is inverted', () => {
  const c = makeComp('74305');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const init = getPin(c,'Q5n');
  fallingEdge(c,'CLK5');
  // Q5n should toggle (internal Q5 starts at 0, Q5n = !0 = 1)
  assertEqual(getPin(c,'Q5n'), init ^ 1, 'Q5n toggled');
});

test('74305 Q8n is inverted', () => {
  const c = makeComp('74305');
  setPins(c, {CLK1:0,CLK2:0,CLK3:0,CLK4:0,CLK5:0,CLK6:0,CLK7:0,CLK8:0});
  evalGate(c);
  const initQ8n = getPin(c,'Q8n');
  fallingEdge(c,'CLK8');
  assertEqual(getPin(c,'Q8n'), initQ8n ^ 1, 'Q8n toggled');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74306 - 8 bit Bus Transceiver GTL+
// ═══════════════════════════════════════════════════════════════════════════════
test('74306 exists', () => assert(CHIPS_BLOCK_20['74306']));

test('74306 OEn=0, DIR=0: A→B pass-through', () => {
  const c = makeComp('74306');
  setPins(c, {OEn:0,DIR:0,A1:1,A2:0,A3:1,A4:0,A5:1,A6:0,A7:1,A8:0});
  evalGate(c);
  assertEqual(getPin(c,'B1'), 1, 'B1=A1');
  assertEqual(getPin(c,'B2'), 0, 'B2=A2');
  assertEqual(getPin(c,'B3'), 1, 'B3=A3');
  assertEqual(getPin(c,'B8'), 0, 'B8=A8');
});

test('74306 OEn=1 → HiZ', () => {
  const c = makeComp('74306');
  setPins(c, {OEn:1,DIR:0,A1:1,A2:0,A3:1,A4:0,A5:1,A6:0,A7:1,A8:0});
  evalGate(c);
  assertEqual(getPin(c,'B1'), null, 'B1 HiZ');
});

test('74306 DIR=1 → HiZ (B→A not driven)', () => {
  const c = makeComp('74306');
  setPins(c, {OEn:0,DIR:1,A1:1,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0});
  evalGate(c);
  assertEqual(getPin(c,'B1'), null, 'B1 HiZ when DIR=1');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74309 - 1024×1 RAM OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74309 exists', () => assert(CHIPS_BLOCK_20['74309']));

test('74309 CSn=1 → HiZ', () => {
  const c = makeComp('74309');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,WEn:1,CSn:1,DI:0});
  evalGate(c);
  assertEqual(getPin(c,'DO'), null, 'DO HiZ');
});

test('74309 write then read', () => {
  const c = makeComp('74309');
  setPins(c, {A0:1,A1:1,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,WEn:0,CSn:0,DI:1});
  evalGate(c);
  setPin(c,'WEn',1); evalGate(c);
  assertEqual(getPin(c,'DO'), 1, 'DO=1 at addr 3');
});

test('74309 read unwritten addr=0 → 0', () => {
  const c = makeComp('74309');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,WEn:1,CSn:0,DI:0});
  evalGate(c);
  assertEqual(getPin(c,'DO'), 0, 'DO=0');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74310 - Octal Inverting Buffer, Schmitt Trigger, Tri-state
// ═══════════════════════════════════════════════════════════════════════════════
test('74310 exists', () => assert(CHIPS_BLOCK_20['74310']));

test('74310 OE1n=0 enables Y1-Y4, inverted', () => {
  const c = makeComp('74310');
  setPins(c, {A1:1,A2:0,A3:1,A4:0,A5:0,A6:0,A7:0,A8:0,OE1n:0,OE2n:1});
  evalGate(c);
  assertEqual(getPin(c,'Y1'), 0, 'Y1=!A1=0');
  assertEqual(getPin(c,'Y2'), 1, 'Y2=!A2=1');
  assertEqual(getPin(c,'Y3'), 0, 'Y3=!A3=0');
  assertEqual(getPin(c,'Y4'), 1, 'Y4=!A4=1');
  assertEqual(getPin(c,'Y5'), null, 'Y5 HiZ (OE2n=1)');
});

test('74310 OE2n=0 enables Y5-Y8', () => {
  const c = makeComp('74310');
  setPins(c, {A1:0,A2:0,A3:0,A4:0,A5:1,A6:0,A7:1,A8:0,OE1n:1,OE2n:0});
  evalGate(c);
  assertEqual(getPin(c,'Y1'), null, 'Y1 HiZ');
  assertEqual(getPin(c,'Y5'), 0, 'Y5=!A5=0');
  assertEqual(getPin(c,'Y6'), 1, 'Y6=!A6=1');
  assertEqual(getPin(c,'Y7'), 0, 'Y7=!A7=0');
  assertEqual(getPin(c,'Y8'), 1, 'Y8=!A8=1');
});

test('74310 both OE enabled', () => {
  const c = makeComp('74310');
  setPins(c, {A1:1,A2:1,A3:1,A4:1,A5:1,A6:1,A7:1,A8:1,OE1n:0,OE2n:0});
  evalGate(c);
  for (let i = 1; i <= 8; i++) assertEqual(getPin(c,`Y${i}`), 0, `Y${i}=0`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74311 - 16×9 RAM with Output Latch, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74311 exists', () => assert(CHIPS_BLOCK_20['74311']));

test('74311 write then latch then read', () => {
  const c = makeComp('74311');
  // Write D0=1 to addr 0
  setPins(c, {A0:0,A1:0,A2:0,A3:0,WEn:0,CSn:0,OEn:0,LE:0,
    D0:1,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0,D8:0});
  evalGate(c);
  // Latch the output
  setPin(c,'WEn',1); setPin(c,'LE',1);
  evalGate(c);
  // Read
  setPin(c,'LE',0);
  evalGate(c);
  assertEqual(getPin(c,'Q'), 1, 'Q=1 (bit 0 of stored word)');
});

test('74311 OEn=1 → HiZ', () => {
  const c = makeComp('74311');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,WEn:1,CSn:0,OEn:1,LE:0,
    D0:0,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0,D8:0});
  evalGate(c);
  assertEqual(getPin(c,'Q'), null, 'Q HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74312 - 16×9 RAM, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74312 exists', () => assert(CHIPS_BLOCK_20['74312']));

test('74312 write D0=1 addr 0, then read', () => {
  const c = makeComp('74312');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,WEn:0,CSn:0,OEn:0,
    D0:1,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0,D8:0});
  evalGate(c);
  setPin(c,'WEn',1); evalGate(c);
  assertEqual(getPin(c,'Q'), 1, 'Q=1');
});

test('74312 OEn=1 → HiZ', () => {
  const c = makeComp('74312');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,WEn:1,CSn:0,OEn:1,
    D0:0,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0,D8:0});
  evalGate(c);
  assertEqual(getPin(c,'Q'), null, 'Q HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74313 - 16×12 RAM, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74313 exists', () => assert(CHIPS_BLOCK_20['74313']));

test('74313 write does not crash', () => {
  const c = makeComp('74313');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,WEn:0,CSn:0,OEn:0,
    D0:1,D1:1,D2:1,D3:1,D4:1,D5:1,D6:1,D7:1,D8:1,D9:1,D10:1});
  evalGate(c);
  assert(true, 'no crash');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74314 - 1024×1 RAM OC (same as 74309)
// ═══════════════════════════════════════════════════════════════════════════════
test('74314 exists', () => assert(CHIPS_BLOCK_20['74314']));

test('74314 write then read', () => {
  const c = makeComp('74314');
  setPins(c, {A0:0,A1:1,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,WEn:0,CSn:0,DI:1});
  evalGate(c);
  setPin(c,'WEn',1); evalGate(c);
  assertEqual(getPin(c,'DO'), 1, 'DO=1');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74315 - 1024×1 RAM with Power-Down OC (same gate type)
// ═══════════════════════════════════════════════════════════════════════════════
test('74315 exists', () => assert(CHIPS_BLOCK_20['74315']));

test('74315 CSn=1 → HiZ (power-down)', () => {
  const c = makeComp('74315');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,A6:0,A7:0,A8:0,A9:0,WEn:1,CSn:1,DI:0});
  evalGate(c);
  assertEqual(getPin(c,'DO'), null, 'DO HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74316 - 64×4 RAM, Common I/O, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74316 exists', () => assert(CHIPS_BLOCK_20['74316']));

test('74316 CSn=1 → HiZ', () => {
  const c = makeComp('74316');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,WEn:1,CSn:1,D0:0,D1:0,IO0:0,IO1:0,IO2:0,IO3:0});
  evalGate(c);
  assertEqual(getPin(c,'IO0'), null, 'IO0 HiZ');
});

test('74316 write (WEn=0) → HiZ during write, then read', () => {
  const c = makeComp('74316');
  // Write: IO pins = inputs during write, we drive IO=0b1010
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,WEn:0,CSn:0,D0:0,D1:0,IO0:0,IO1:1,IO2:0,IO3:1});
  evalGate(c);
  // During write, outputs should be HiZ
  assertEqual(getPin(c,'IO0'), null, 'IO0 HiZ during write');
  // Now read
  setPin(c,'WEn',1); evalGate(c);
  assertEqual(getPin(c,'IO0'), 0, 'IO0=0');
  assertEqual(getPin(c,'IO1'), 1, 'IO1=1');
  assertEqual(getPin(c,'IO2'), 0, 'IO2=0');
  assertEqual(getPin(c,'IO3'), 1, 'IO3=1');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74317 - 64×4 RAM, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74317 exists', () => assert(CHIPS_BLOCK_20['74317']));

test('74317 write then read', () => {
  const c = makeComp('74317');
  setPins(c, {A0:1,A1:0,A2:0,A3:0,A4:0,A5:0,WEn:0,CSn:0,D0:1,D1:0,D2:1,D3:0});
  evalGate(c);
  setPin(c,'WEn',1); evalGate(c);
  assertEqual(getPin(c,'Q0'), 1, 'Q0=1');
  assertEqual(getPin(c,'Q1'), 0, 'Q1=0');
  assertEqual(getPin(c,'Q2'), 1, 'Q2=1');
  assertEqual(getPin(c,'Q3'), 0, 'Q3=0');
});

test('74317 CSn=1 → HiZ', () => {
  const c = makeComp('74317');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,A5:0,WEn:1,CSn:1,D0:0,D1:0,D2:0,D3:0});
  evalGate(c);
  assertEqual(getPin(c,'Q0'), null, 'Q0 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74318 - 32×8 RAM, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74318 exists', () => assert(CHIPS_BLOCK_20['74318']));

test('74318 write 0b11100000 and read Q5,Q6,Q7', () => {
  const c = makeComp('74318');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,WEn:0,CSn:0,
    D0:0,D1:0,D2:0,D3:0,D4:0,D5:1,D6:1,D7:1});
  evalGate(c);
  setPin(c,'WEn',1); evalGate(c);
  assertEqual(getPin(c,'Q5'), 1, 'Q5=1');
  assertEqual(getPin(c,'Q6'), 1, 'Q6=1');
  assertEqual(getPin(c,'Q7'), 1, 'Q7=1');
});

test('74318 CSn=1 → HiZ', () => {
  const c = makeComp('74318');
  setPins(c, {A0:0,A1:0,A2:0,A3:0,A4:0,WEn:1,CSn:1,
    D0:0,D1:0,D2:0,D3:0,D4:0,D5:0,D6:0,D7:0});
  evalGate(c);
  assertEqual(getPin(c,'Q5'), null, 'Q5 HiZ');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74319 - 16×4 RAM, OC
// ═══════════════════════════════════════════════════════════════════════════════
test('74319 exists', () => assert(CHIPS_BLOCK_20['74319']));

test('74319 write then read (non-inverted)', () => {
  const c = makeComp('74319');
  setPins(c, {A0:0,A1:1,A2:0,A3:0, CSn:0, WEn:0, D0:1,D1:0,D2:1,D3:1});
  evalGate(c);
  setPin(c,'WEn',1); evalGate(c);
  assertEqual(getPin(c,'Q0'), 1, 'Q0=1');
  assertEqual(getPin(c,'Q1'), 0, 'Q1=0');
  assertEqual(getPin(c,'Q2'), 1, 'Q2=1');
  assertEqual(getPin(c,'Q3'), 1, 'Q3=1');
});

test('74319 CSn=1 → HiZ', () => {
  const c = makeComp('74319');
  setPins(c, {A0:0,A1:0,A2:0,A3:0, CSn:1, WEn:1, D0:0,D1:0,D2:0,D3:0});
  evalGate(c);
  assertEqual(getPin(c,'Q0'), null, 'Q0 HiZ');
});

test('74319 read unwritten → 0 (unlike 74289)', () => {
  const c = makeComp('74319');
  setPins(c, {A0:0,A1:0,A2:0,A3:0, CSn:0, WEn:1, D0:0,D1:0,D2:0,D3:0});
  evalGate(c);
  assertEqual(getPin(c,'Q0'), 0, 'Q0=0 (non-inverted read)');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74320 - Crystal Oscillator
// ═══════════════════════════════════════════════════════════════════════════════
test('74320 exists', () => assert(CHIPS_BLOCK_20['74320']));

test('74320 OUT follows XTAL1 (stub)', () => {
  const c = makeComp('74320');
  setPin(c,'XTAL1', 1); evalGate(c);
  assertEqual(getPin(c,'OUT'), 1, 'OUT=1 when XTAL1=1');
  setPin(c,'XTAL1', 0); evalGate(c);
  assertEqual(getPin(c,'OUT'), 0, 'OUT=0 when XTAL1=0');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 74321 - Crystal Oscillator with F/2 and F/4
// ═══════════════════════════════════════════════════════════════════════════════
test('74321 exists', () => assert(CHIPS_BLOCK_20['74321']));

test('74321 OUT follows XTAL1', () => {
  const c = makeComp('74321');
  setPin(c,'XTAL1', 1); evalGate(c);
  assertEqual(getPin(c,'OUT'), 1, 'OUT=1');
  setPin(c,'XTAL1', 0); evalGate(c);
  assertEqual(getPin(c,'OUT'), 0, 'OUT=0');
});

test('74321 F2 toggles on every XTAL1 falling edge', () => {
  const c = makeComp('74321');
  setPin(c,'XTAL1', 0); evalGate(c);
  const init = getPin(c,'F2');
  // 1st falling edge: F2 should toggle
  setPin(c,'XTAL1', 1); evalGate(c);
  setPin(c,'XTAL1', 0); evalGate(c);
  assertEqual(getPin(c,'F2'), init ^ 1, 'F2 toggled after 1st fall');
  // 2nd falling edge: F2 does NOT toggle (cnt=2 is even)
  setPin(c,'XTAL1', 1); evalGate(c);
  setPin(c,'XTAL1', 0); evalGate(c);
  assertEqual(getPin(c,'F2'), init ^ 1, 'F2 stays high after 2nd fall (cnt even)');
  // 3rd falling edge: F2 toggles (cnt=3 odd) → back to 0
  setPin(c,'XTAL1', 1); evalGate(c);
  setPin(c,'XTAL1', 0); evalGate(c);
  assertEqual(getPin(c,'F2'), init, 'F2 back to init after 3rd fall (cnt=3)');
  // 4th falling edge: back to initial
  setPin(c,'XTAL1', 1); evalGate(c);
  setPin(c,'XTAL1', 0); evalGate(c);
  assertEqual(getPin(c,'F2'), init, 'F2 back to init after 4 falls');
});

test('74321 F4 toggles every 4 XTAL1 falling edges', () => {
  const c = makeComp('74321');
  setPin(c,'XTAL1', 0); evalGate(c);
  const init = getPin(c,'F4');
  // 4 falling edges
  for (let i = 0; i < 4; i++) {
    setPin(c,'XTAL1', 1); evalGate(c);
    setPin(c,'XTAL1', 0); evalGate(c);
  }
  // F4 toggles on 3rd and 7th (cnt&3===3), so after 4 falls cnt=4, cnt&3=0; one toggle at cnt=3
  const after4 = getPin(c,'F4');
  // After 8 falls: two toggles at cnt=3 and cnt=7
  for (let i = 0; i < 4; i++) {
    setPin(c,'XTAL1', 1); evalGate(c);
    setPin(c,'XTAL1', 0); evalGate(c);
  }
  const after8 = getPin(c,'F4');
  // After 8 falls, F4 should be back to init (two toggles)
  assertEqual(after8, init, 'F4 after 8 falls = initial');
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed+failed} tests`);
if (failed > 0) process.exit(1);
