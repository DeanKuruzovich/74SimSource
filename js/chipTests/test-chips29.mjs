// test-chips29.mjs - Tests for Block 29: 74518-74537
import { CircuitSimulator } from '../simulator.js';
import { CHIPS_BLOCK_29 }  from '../chips/chips29.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; }
  else           { failed++; console.error(`  FAIL: ${msg}`); }
}

// ── Harness helpers ────────────────────────────────────────────────────────────

const SIM = new CircuitSimulator();

SIM._readGateInputs = function(comp, inputNames) {
  return inputNames.map(n => {
    const p = comp.pins[n];
    if (!p) return 0;
    const v = p.voltage;
    if (v === undefined || v === null) return 0;
    if (v >= 2.0) return 1;
    return 0;
  });
};

SIM._drivePinBit = function(comp, name, bit) {
  if (!comp.pins[name]) comp.pins[name] = {};
  const newV = bit ? 5 : 0;
  const changed = comp.pins[name].voltage !== newV;
  comp.pins[name].voltage = newV;
  return changed;
};

SIM._drivePinHighZ = function(comp, name) {
  if (!comp.pins[name]) comp.pins[name] = {};
  const changed = comp.pins[name].voltage !== 2.5;
  comp.pins[name].voltage = 2.5;
  return changed;
};

function makeComp(type) {
  return { id: 'U1', type, pins: {} };
}

function setPin(comp, name, bit) {
  if (!comp.pins[name]) comp.pins[name] = {};
  comp.pins[name].voltage = bit ? 5 : 0;
}

function getPin(comp, name) {
  const v = comp.pins[name]?.voltage;
  if (v === 2.5) return 'Z';
  return v >= 2.0 ? 1 : 0;
}

function evalGate(comp, gateType) {
  const chip = Object.values(CHIPS_BLOCK_29).find(c => c.gates[0].type === gateType);
  if (!chip) throw new Error(`Unknown gate type: ${gateType}`);
  return SIM[{
    CMP_8BIT_OC:         '_evaluateCmp8BitOc',
    CMP_8BIT_INV:        '_evaluateCmp8BitInv',
    CMP_8BIT_INV_OC:     '_evaluateCmp8BitInvOc',
    CMP_8BIT_REG_OC:     '_evaluateCmp8BitRegOc',
    CMP_16BIT_PROG:      '_evaluateCmp16BitProg',
    CMP_12BIT_PROG:      '_evaluateCmp12BitProg',
    CMP_12BIT_OC:        '_evaluateCmp12BitOc',
    LATCH_OCTAL_TRI:     '_evaluateLatchOctalTri',
    REG_OCTAL_TRI:       '_evaluateRegOctalTri',
    LATCH_OCTAL_INV_TRI: '_evaluateLatchOctalInvTri',
    REG_OCTAL_INV_TRI:   '_evaluateRegOctalInvTri',
    BCD_DECIMAL_DEC_TRI: '_evaluateBcdDecimalDecTri',
  }[gateType]](comp, chip.gates[0]);
}

// ── Utility: set 8 bit A/B bus ────────────────────────────────────────────────
function setABus(comp, val) {
  for (let i = 0; i < 8; i++) setPin(comp, `A${i}`, (val >> i) & 1);
}
function setBBus(comp, val) {
  for (let i = 0; i < 8; i++) setPin(comp, `B${i}`, (val >> i) & 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP_8BIT_OC (74518 / 74519)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- CMP_8BIT_OC (74518/74519) ---');
{
  // Test: G1n=1 → HiZ
  const c = makeComp('CMP_8BIT_OC');
  setPin(c, 'G1n', 1);
  setABus(c, 0xAA); setBBus(c, 0xAA);
  evalGate(c, 'CMP_8BIT_OC');
  assert(getPin(c, 'EQn') === 'Z', 'CMP_8BIT_OC: G1n=1 → EQn=HiZ');
}
{
  // Test: A==B → EQn=0
  const c = makeComp('CMP_8BIT_OC');
  setPin(c, 'G1n', 0);
  setABus(c, 0x55); setBBus(c, 0x55);
  evalGate(c, 'CMP_8BIT_OC');
  assert(getPin(c, 'EQn') === 0, 'CMP_8BIT_OC: A==B → EQn=0');
}
{
  // Test: A!=B → EQn=1
  const c = makeComp('CMP_8BIT_OC');
  setPin(c, 'G1n', 0);
  setABus(c, 0x55); setBBus(c, 0xAA);
  evalGate(c, 'CMP_8BIT_OC');
  assert(getPin(c, 'EQn') === 1, 'CMP_8BIT_OC: A!=B → EQn=1');
}
{
  // Test: all zeros equal
  const c = makeComp('CMP_8BIT_OC');
  setPin(c, 'G1n', 0);
  setABus(c, 0x00); setBBus(c, 0x00);
  evalGate(c, 'CMP_8BIT_OC');
  assert(getPin(c, 'EQn') === 0, 'CMP_8BIT_OC: 0x00==0x00 → EQn=0');
}
{
  // Test: all ones equal
  const c = makeComp('CMP_8BIT_OC');
  setPin(c, 'G1n', 0);
  setABus(c, 0xFF); setBBus(c, 0xFF);
  evalGate(c, 'CMP_8BIT_OC');
  assert(getPin(c, 'EQn') === 0, 'CMP_8BIT_OC: 0xFF==0xFF → EQn=0');
}
{
  // Test: 74519 chip entry exists
  assert('74519' in CHIPS_BLOCK_29, '74519 chip entry exists');
  assert(CHIPS_BLOCK_29['74519'].gates[0].type === 'CMP_8BIT_OC', '74519 gate type = CMP_8BIT_OC');
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP_8BIT_INV (74520 / 74521)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- CMP_8BIT_INV (74520/74521) ---');
{
  // G1n=1 → HiZ
  const c = makeComp('CMP_8BIT_INV');
  setPin(c, 'G1n', 1);
  setABus(c, 0xAA); setBBus(c, 0xAA);
  evalGate(c, 'CMP_8BIT_INV');
  assert(getPin(c, 'EQ') === 'Z', 'CMP_8BIT_INV: G1n=1 → EQ=HiZ');
}
{
  // A==B → EQ=1
  const c = makeComp('CMP_8BIT_INV');
  setPin(c, 'G1n', 0);
  setABus(c, 0xAB); setBBus(c, 0xAB);
  evalGate(c, 'CMP_8BIT_INV');
  assert(getPin(c, 'EQ') === 1, 'CMP_8BIT_INV: A==B → EQ=1');
}
{
  // A!=B → EQ=0
  const c = makeComp('CMP_8BIT_INV');
  setPin(c, 'G1n', 0);
  setABus(c, 0x12); setBBus(c, 0x34);
  evalGate(c, 'CMP_8BIT_INV');
  assert(getPin(c, 'EQ') === 0, 'CMP_8BIT_INV: A!=B → EQ=0');
}
{
  // 74521 uses same gate type
  assert(CHIPS_BLOCK_29['74521'].gates[0].type === 'CMP_8BIT_INV', '74521 gate type = CMP_8BIT_INV');
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP_8BIT_INV_OC (74522)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- CMP_8BIT_INV_OC (74522) ---');
{
  // G1n=1 → HiZ
  const c = makeComp('CMP_8BIT_INV_OC');
  setPin(c, 'G1n', 1);
  setABus(c, 0x77); setBBus(c, 0x77);
  evalGate(c, 'CMP_8BIT_INV_OC');
  assert(getPin(c, 'EQ') === 'Z', 'CMP_8BIT_INV_OC: G1n=1 → EQ=HiZ');
}
{
  // A==B → EQ=1
  const c = makeComp('CMP_8BIT_INV_OC');
  setPin(c, 'G1n', 0);
  setABus(c, 0xCC); setBBus(c, 0xCC);
  evalGate(c, 'CMP_8BIT_INV_OC');
  assert(getPin(c, 'EQ') === 1, 'CMP_8BIT_INV_OC: A==B → EQ=1');
}
{
  // A!=B → EQ=0
  const c = makeComp('CMP_8BIT_INV_OC');
  setPin(c, 'G1n', 0);
  setABus(c, 0x01); setBBus(c, 0x02);
  evalGate(c, 'CMP_8BIT_INV_OC');
  assert(getPin(c, 'EQ') === 0, 'CMP_8BIT_INV_OC: A!=B → EQ=0');
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP_8BIT_REG_OC (74524)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- CMP_8BIT_REG_OC (74524) ---');
{
  // Rising CLK: A==B → EQn=0
  const c = makeComp('CMP_8BIT_REG_OC');
  setPin(c, 'CLK', 0);
  setABus(c, 0x5A); setBBus(c, 0x5A);
  evalGate(c, 'CMP_8BIT_REG_OC');
  setPin(c, 'CLK', 1);
  evalGate(c, 'CMP_8BIT_REG_OC');
  assert(getPin(c, 'EQn') === 0, 'CMP_8BIT_REG_OC: A==B at rising CLK → EQn=0');
}
{
  // Rising CLK: A!=B → EQn=1
  const c = makeComp('CMP_8BIT_REG_OC');
  setPin(c, 'CLK', 0);
  setABus(c, 0x12); setBBus(c, 0x34);
  evalGate(c, 'CMP_8BIT_REG_OC');
  setPin(c, 'CLK', 1);
  evalGate(c, 'CMP_8BIT_REG_OC');
  assert(getPin(c, 'EQn') === 1, 'CMP_8BIT_REG_OC: A!=B at rising CLK → EQn=1');
}
{
  // Hold on CLK=1 (no re-trigger): change data, no second clock edge
  const c = makeComp('CMP_8BIT_REG_OC');
  setPin(c, 'CLK', 0);
  setABus(c, 0x55); setBBus(c, 0x55);
  evalGate(c, 'CMP_8BIT_REG_OC');
  setPin(c, 'CLK', 1);
  evalGate(c, 'CMP_8BIT_REG_OC');
  // Now change data but keep CLK=1 (no falling edge→rising edge)
  setABus(c, 0x55); setBBus(c, 0xAA);
  evalGate(c, 'CMP_8BIT_REG_OC');
  assert(getPin(c, 'EQn') === 0, 'CMP_8BIT_REG_OC: hold output when CLK already high');
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP_16BIT_PROG (74526)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- CMP_16BIT_PROG (74526) ---');
{
  // G1n=1 → HiZ
  const c = makeComp('CMP_16BIT_PROG');
  setPin(c, 'G1n', 1);
  evalGate(c, 'CMP_16BIT_PROG');
  assert(getPin(c, 'EQn') === 'Z', 'CMP_16BIT_PROG: G1n=1 → EQn=HiZ');
}
{
  // G1n=0 → EQn=0 (always match, stub)
  const c = makeComp('CMP_16BIT_PROG');
  setPin(c, 'G1n', 0);
  for (let i = 0; i < 16; i++) setPin(c, `A${i}`, (0xABCD >> i) & 1);
  evalGate(c, 'CMP_16BIT_PROG');
  assert(getPin(c, 'EQn') === 0, 'CMP_16BIT_PROG: G1n=0 → EQn=0 (stub match)');
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP_12BIT_PROG (74527)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- CMP_12BIT_PROG (74527) ---');
{
  // G1n=1 → HiZ
  const c = makeComp('CMP_12BIT_PROG');
  setPin(c, 'G1n', 1);
  evalGate(c, 'CMP_12BIT_PROG');
  assert(getPin(c, 'EQn') === 'Z', 'CMP_12BIT_PROG: G1n=1 → EQn=HiZ');
}
{
  // G1n=0 → EQn=0
  const c = makeComp('CMP_12BIT_PROG');
  setPin(c, 'G1n', 0);
  evalGate(c, 'CMP_12BIT_PROG');
  assert(getPin(c, 'EQn') === 0, 'CMP_12BIT_PROG: G1n=0 → EQn=0 (stub match)');
}

// ─────────────────────────────────────────────────────────────────────────────
// CMP_12BIT_OC (74528)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- CMP_12BIT_OC (74528) ---');
{
  // G1n=1 → HiZ
  const c = makeComp('CMP_12BIT_OC');
  setPin(c, 'G1n', 1);
  evalGate(c, 'CMP_12BIT_OC');
  assert(getPin(c, 'EQn') === 'Z', 'CMP_12BIT_OC: G1n=1 → EQn=HiZ');
}
{
  // G1n=0 → EQn=0
  const c = makeComp('CMP_12BIT_OC');
  setPin(c, 'G1n', 0);
  evalGate(c, 'CMP_12BIT_OC');
  assert(getPin(c, 'EQn') === 0, 'CMP_12BIT_OC: G1n=0 → EQn=0 (stub match)');
}
{
  // 74528 has 16 pins
  assert(CHIPS_BLOCK_29['74528'].pins === 16, '74528 has 16 pins');
}

// ─────────────────────────────────────────────────────────────────────────────
// LATCH_OCTAL_TRI (74531)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- LATCH_OCTAL_TRI (74531) ---');
{
  // OEn=1 → all HiZ
  const c = makeComp('LATCH_OCTAL_TRI');
  setPin(c, 'OEn', 1); setPin(c, 'LE', 1);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 1);
  evalGate(c, 'LATCH_OCTAL_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === 'Z', `LATCH_OCTAL_TRI: OEn=1 → Q${i}=HiZ`);
}
{
  // LE=1 transparent: Q=D
  const c = makeComp('LATCH_OCTAL_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'LE', 1);
  const data = 0b10110101;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'LATCH_OCTAL_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data >> i) & 1), `LATCH_OCTAL_TRI: transparent Q${i}`);
}
{
  // LE=0 hold: Q stays
  const c = makeComp('LATCH_OCTAL_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'LE', 1);
  const data = 0b11001010;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'LATCH_OCTAL_TRI');
  setPin(c, 'LE', 0);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, ((~data) >> i) & 1); // change data
  evalGate(c, 'LATCH_OCTAL_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data >> i) & 1), `LATCH_OCTAL_TRI: hold Q${i}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG_OCTAL_TRI (74532)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- REG_OCTAL_TRI (74532) ---');
{
  // OEn=1 → HiZ (even after clocked)
  const c = makeComp('REG_OCTAL_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 1);
  evalGate(c, 'REG_OCTAL_TRI');
  setPin(c, 'CLK', 1);
  evalGate(c, 'REG_OCTAL_TRI');
  setPin(c, 'OEn', 1);
  evalGate(c, 'REG_OCTAL_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === 'Z', `REG_OCTAL_TRI: OEn=1 → Q${i}=HiZ`);
}
{
  // Rising CLK captures D
  const c = makeComp('REG_OCTAL_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  const data = 0b01011010;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'REG_OCTAL_TRI');
  setPin(c, 'CLK', 1);
  evalGate(c, 'REG_OCTAL_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data >> i) & 1), `REG_OCTAL_TRI: Q${i} after clk`);
}
{
  // Hold on high CLK level (no re-trigger)
  const c = makeComp('REG_OCTAL_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  const data = 0b11110000;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'REG_OCTAL_TRI');
  setPin(c, 'CLK', 1);
  evalGate(c, 'REG_OCTAL_TRI');
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 0); // change data, CLK stays 1
  evalGate(c, 'REG_OCTAL_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data >> i) & 1), `REG_OCTAL_TRI: hold Q${i} when CLK=1`);
}

// ─────────────────────────────────────────────────────────────────────────────
// LATCH_OCTAL_INV_TRI (74533 / 74535)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- LATCH_OCTAL_INV_TRI (74533/74535) ---');
{
  // OEn=1 → HiZ
  const c = makeComp('LATCH_OCTAL_INV_TRI');
  setPin(c, 'OEn', 1); setPin(c, 'LE', 1);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 0);
  evalGate(c, 'LATCH_OCTAL_INV_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}n`) === 'Z', `LATCH_OCTAL_INV_TRI: OEn=1 → Q${i}n=HiZ`);
}
{
  // LE=1 transparent: Qn = NOT(D)
  const c = makeComp('LATCH_OCTAL_INV_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'LE', 1);
  const data = 0b10110101;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'LATCH_OCTAL_INV_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}n`) === (((data >> i) & 1) ^ 1), `LATCH_OCTAL_INV_TRI: inv Q${i}n`);
}
{
  // LE=0 hold
  const c = makeComp('LATCH_OCTAL_INV_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'LE', 1);
  const data = 0b11001100;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'LATCH_OCTAL_INV_TRI');
  const expected = [];
  for (let i = 0; i < 8; i++) expected[i] = getPin(c, `Q${i}n`);
  setPin(c, 'LE', 0);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 0);
  evalGate(c, 'LATCH_OCTAL_INV_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}n`) === expected[i], `LATCH_OCTAL_INV_TRI: hold Q${i}n`);
}
{
  // 74535 uses same gate type
  assert(CHIPS_BLOCK_29['74535'].gates[0].type === 'LATCH_OCTAL_INV_TRI', '74535 gate = LATCH_OCTAL_INV_TRI');
}

// ─────────────────────────────────────────────────────────────────────────────
// REG_OCTAL_INV_TRI (74534 / 74536)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- REG_OCTAL_INV_TRI (74534/74536) ---');
{
  // OEn=1 → HiZ
  const c = makeComp('REG_OCTAL_INV_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 0);
  evalGate(c, 'REG_OCTAL_INV_TRI');
  setPin(c, 'CLK', 1);
  evalGate(c, 'REG_OCTAL_INV_TRI');
  setPin(c, 'OEn', 1);
  evalGate(c, 'REG_OCTAL_INV_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}n`) === 'Z', `REG_OCTAL_INV_TRI: OEn=1 → Q${i}n=HiZ`);
}
{
  // Rising CLK captures NOT(D)
  const c = makeComp('REG_OCTAL_INV_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  const data = 0b01100110;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'REG_OCTAL_INV_TRI');
  setPin(c, 'CLK', 1);
  evalGate(c, 'REG_OCTAL_INV_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}n`) === (((data >> i) & 1) ^ 1), `REG_OCTAL_INV_TRI: inv Q${i}n after clk`);
}
{
  // Hold
  const c = makeComp('REG_OCTAL_INV_TRI');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  const data = 0b00001111;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalGate(c, 'REG_OCTAL_INV_TRI');
  setPin(c, 'CLK', 1);
  evalGate(c, 'REG_OCTAL_INV_TRI');
  const expected = [];
  for (let i = 0; i < 8; i++) expected[i] = getPin(c, `Q${i}n`);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 0); // change data
  evalGate(c, 'REG_OCTAL_INV_TRI');
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}n`) === expected[i], `REG_OCTAL_INV_TRI: hold Q${i}n`);
}
{
  // 74536 uses same gate type
  assert(CHIPS_BLOCK_29['74536'].gates[0].type === 'REG_OCTAL_INV_TRI', '74536 gate = REG_OCTAL_INV_TRI');
}

// ─────────────────────────────────────────────────────────────────────────────
// BCD_DECIMAL_DEC_TRI (74537)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- BCD_DECIMAL_DEC_TRI (74537) ---');

function setBCD(comp, val) {
  setPin(comp, 'A', (val >> 0) & 1);
  setPin(comp, 'B', (val >> 1) & 1);
  setPin(comp, 'C', (val >> 2) & 1);
  setPin(comp, 'D', (val >> 3) & 1);
}

{
  // OEn=1 → all HiZ
  const c = makeComp('BCD_DECIMAL_DEC_TRI');
  setPin(c, 'OEn', 1); setBCD(c, 3);
  evalGate(c, 'BCD_DECIMAL_DEC_TRI');
  for (let i = 0; i < 10; i++)
    assert(getPin(c, `Y${i}`) === 'Z', `BCD_DECIMAL_DEC_TRI: OEn=1 → Y${i}=HiZ`);
}
{
  // Decode 0-9
  for (let v = 0; v < 10; v++) {
    const c = makeComp('BCD_DECIMAL_DEC_TRI');
    setPin(c, 'OEn', 0); setBCD(c, v);
    evalGate(c, 'BCD_DECIMAL_DEC_TRI');
    for (let i = 0; i < 10; i++)
      assert(getPin(c, `Y${i}`) === (i === v ? 1 : 0),
        `BCD_DECIMAL_DEC_TRI: val=${v} → Y${i}=${i === v ? 1 : 0}`);
  }
}
{
  // Invalid BCD (e.g. val=10) → all Y=0
  const c = makeComp('BCD_DECIMAL_DEC_TRI');
  setPin(c, 'OEn', 0); setBCD(c, 10);
  evalGate(c, 'BCD_DECIMAL_DEC_TRI');
  for (let i = 0; i < 10; i++)
    assert(getPin(c, `Y${i}`) === 0, `BCD_DECIMAL_DEC_TRI: val=10 (invalid) → Y${i}=0`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
