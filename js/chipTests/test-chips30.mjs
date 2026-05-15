// test-chips30.mjs - Tests for Block 30: 74538-74563
import { CircuitSimulator } from '../simulator.js';
import { CHIPS_BLOCK_30 }  from '../chips/chips30.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; }
  else           { failed++; console.error(`  FAIL: ${msg}`); }
}

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

function makeComp(chipKey) {
  const chip = CHIPS_BLOCK_30[chipKey];
  return { id: 'U1', type: chip.gates[0].type, pins: {}, _chipKey: chipKey };
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

const gateMethodMap = {
  DECODER_3TO8_TRI:         '_evaluateDecoder3to8Tri',
  DECODER_2TO4_TRI:         '_evaluateDecoder2to4Tri',
  BUF_OCTAL_INV_TRI:        '_evaluateBufOctalInvTri',
  TRANSCEIVER_OCTAL_REG:    '_evaluateTransceiverOctalReg',
  TRANSCEIVER_OCTAL_REG_INV:'_evaluateTransceiverOctalRegInv',
  TRANSCEIVER_OCTAL_LATCH:  '_evaluateTransceiverOctalLatch',
  DECODER_3TO8_LATCH_ACK:   '_evaluateDecoder3to8LatchAck',
  REG_8BIT_PIPELINE:        '_evaluateReg8BitPipeline',
  DECODER_3TO8_ACK:         '_evaluateDecoder3to8Ack',
  LATCH_8BIT_PIPELINE:      '_evaluateLatch8BitPipeline',
  MULTIPLIER_8BIT_TC:       '_evaluateMultiplier8BitTc',
  COUNTER_SYNC_DECADE_TRI:  '_evaluateCounterSyncDecadeTri',
  COUNTER_SYNC_BIN_TRI:     '_evaluateCounterSyncBinTri',
  LATCH_OCTAL_INV_TRI:      '_evaluateLatchOctalInvTri',
  TRANSCEIVER_8BIT:         '_evaluateTransceiver8Bit',
};

function evalComp(comp) {
  const chip = CHIPS_BLOCK_30[comp._chipKey];
  for (const gate of chip.gates) {
    const method = gateMethodMap[gate.type];
    if (method && SIM[method]) SIM[method](comp, gate);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DECODER_3TO8_TRI (74538)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- DECODER_3TO8_TRI (74538) ---');
{
  // OEn=1 → all Y=HiZ
  const c = makeComp('74538');
  setPin(c, 'A', 0); setPin(c, 'B', 0); setPin(c, 'C', 0);
  setPin(c, 'G1', 1); setPin(c, 'G2An', 0); setPin(c, 'G2Bn', 0); setPin(c, 'OEn', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Y${i}`) === 'Z', `74538 OEn=1 → Y${i}=HiZ`);
}
{
  // Not enabled (G1=0) → all Y=0
  const c = makeComp('74538');
  setPin(c, 'A', 0); setPin(c, 'B', 0); setPin(c, 'C', 0);
  setPin(c, 'G1', 0); setPin(c, 'G2An', 0); setPin(c, 'G2Bn', 0); setPin(c, 'OEn', 0);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Y${i}`) === 0, `74538 G1=0 → Y${i}=0`);
}
{
  // Decode each of 0-7
  for (let sel = 0; sel < 8; sel++) {
    const c = makeComp('74538');
    setPin(c, 'A', (sel >> 0) & 1); setPin(c, 'B', (sel >> 1) & 1); setPin(c, 'C', (sel >> 2) & 1);
    setPin(c, 'G1', 1); setPin(c, 'G2An', 0); setPin(c, 'G2Bn', 0); setPin(c, 'OEn', 0);
    evalComp(c);
    for (let i = 0; i < 8; i++)
      assert(getPin(c, `Y${i}`) === (i === sel ? 1 : 0), `74538 sel=${sel} → Y${i}=${i === sel ? 1 : 0}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DECODER_2TO4_TRI (74539)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- DECODER_2TO4_TRI (74539) ---');
{
  // OEn=1 → all HiZ
  const c = makeComp('74539');
  setPin(c, '1OEn', 1); setPin(c, '1G', 1); setPin(c, '1A0', 0); setPin(c, '1A1', 0);
  setPin(c, '2OEn', 1); setPin(c, '2G', 1); setPin(c, '2A0', 0); setPin(c, '2A1', 0);
  evalComp(c);
  for (let i = 0; i < 4; i++) {
    assert(getPin(c, `1Y${i}`) === 'Z', `74539 1: OEn=1 → 1Y${i}=HiZ`);
    assert(getPin(c, `2Y${i}`) === 'Z', `74539 2: OEn=1 → 2Y${i}=HiZ`);
  }
}
{
  // Decode 0-3 for both halves
  for (let sel = 0; sel < 4; sel++) {
    const c = makeComp('74539');
    setPin(c, '1OEn', 0); setPin(c, '1G', 1);
    setPin(c, '1A0', sel & 1); setPin(c, '1A1', (sel >> 1) & 1);
    setPin(c, '2OEn', 0); setPin(c, '2G', 1);
    setPin(c, '2A0', sel & 1); setPin(c, '2A1', (sel >> 1) & 1);
    evalComp(c);
    for (let i = 0; i < 4; i++) {
      assert(getPin(c, `1Y${i}`) === (i === sel ? 1 : 0), `74539 1 sel=${sel} → 1Y${i}`);
      assert(getPin(c, `2Y${i}`) === (i === sel ? 1 : 0), `74539 2 sel=${sel} → 2Y${i}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUF_OCTAL_INV_TRI (74540)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- BUF_OCTAL_INV_TRI (74540) ---');
{
  // OEn=1 → HiZ
  const c = makeComp('74540');
  setPin(c, 'OEn', 1);
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Y${i}`) === 'Z', `74540 OEn=1 → Y${i}=HiZ`);
}
{
  // Invert: A=0 → Y=1, A=1 → Y=0
  const c = makeComp('74540');
  setPin(c, 'OEn', 0);
  const data = 0b10110101;
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, (data >> i) & 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Y${i}`) === (((data >> i) & 1) ^ 1), `74540 Y${i} inverted`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCEIVER_OCTAL_REG (74543)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TRANSCEIVER_OCTAL_REG (74543) ---');
{
  // DIR=1 (A→B): rising CLK captures A; OEABn=0 → B output driven
  const c = makeComp('74543');
  setPin(c, 'DIR', 1); setPin(c, 'OEABn', 0); setPin(c, 'OEBAn', 1);
  setPin(c, 'CLK', 0); setPin(c, 'LEAB', 0); setPin(c, 'LEBA', 0);
  const data = 0b10110101;
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, (data >> i) & 1);
  evalComp(c);
  setPin(c, 'CLK', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `B${i}`) === ((data >> i) & 1), `74543 A→B: B${i} after CLK`);
}
{
  // DIR=1 (A→B): OEABn=1 → B=HiZ
  const c = makeComp('74543');
  setPin(c, 'DIR', 1); setPin(c, 'OEABn', 1); setPin(c, 'OEBAn', 1);
  setPin(c, 'CLK', 0); setPin(c, 'LEAB', 0); setPin(c, 'LEBA', 0);
  for (let i = 0; i < 8; i++) { setPin(c, `A${i}`, 1); setPin(c, `B${i}`, 0); }
  evalComp(c);
  setPin(c, 'CLK', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `B${i}`) === 'Z', `74543 OEABn=1 → B${i}=HiZ`);
}
{
  // DIR=0 (B→A): rising CLK captures B; OEBAn=0 → A output driven
  const c = makeComp('74543');
  setPin(c, 'DIR', 0); setPin(c, 'OEABn', 1); setPin(c, 'OEBAn', 0);
  setPin(c, 'CLK', 0); setPin(c, 'LEAB', 0); setPin(c, 'LEBA', 0);
  const data = 0b01001011;
  for (let i = 0; i < 8; i++) setPin(c, `B${i}`, (data >> i) & 1);
  evalComp(c);
  setPin(c, 'CLK', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `A${i}`) === ((data >> i) & 1), `74543 B→A: A${i} after CLK`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCEIVER_OCTAL_REG_INV (74544)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TRANSCEIVER_OCTAL_REG_INV (74544) ---');
{
  // DIR=1 (A→B inverted): rising CLK latch A; B=NOT(A)
  const c = makeComp('74544');
  setPin(c, 'DIR', 1); setPin(c, 'OEABn', 0); setPin(c, 'OEBAn', 1);
  setPin(c, 'CLK', 0); setPin(c, 'LEAB', 0); setPin(c, 'LEBA', 0);
  const data = 0b11001100;
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, (data >> i) & 1);
  evalComp(c);
  setPin(c, 'CLK', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `B${i}`) === (((data >> i) & 1) ^ 1), `74544 A→B inv: B${i} = NOT(A)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCEIVER_8BIT reuse (74545)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TRANSCEIVER_8BIT reuse (74545) ---');
{
  assert(CHIPS_BLOCK_30['74545'].gates[0].type === 'TRANSCEIVER_8BIT', '74545 uses TRANSCEIVER_8BIT');
  assert(CHIPS_BLOCK_30['74545'].pins === 20, '74545 has 20 pins');
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCEIVER_OCTAL_LATCH (74547)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TRANSCEIVER_OCTAL_LATCH (74547) ---');
{
  // DIR=1 (A→B): LEAB=1 latches A; OEABn=0 → B=latch
  const c = makeComp('74547');
  setPin(c, 'DIR', 1); setPin(c, 'OEABn', 0); setPin(c, 'OEBAn', 1);
  setPin(c, 'LEAB', 1); setPin(c, 'LEBA', 0);
  const data = 0b01100110;
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, (data >> i) & 1);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `B${i}`) === ((data >> i) & 1), `74547 A→B: B${i} transparent`);
}
{
  // LEAB=0 → hold
  const c = makeComp('74547');
  setPin(c, 'DIR', 1); setPin(c, 'OEABn', 0); setPin(c, 'OEBAn', 1);
  setPin(c, 'LEAB', 1); setPin(c, 'LEBA', 0);
  const data = 0b10100101;
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, (data >> i) & 1);
  evalComp(c);
  const expected = [];
  for (let i = 0; i < 8; i++) expected[i] = getPin(c, `B${i}`);
  setPin(c, 'LEAB', 0);
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, 0); // change A
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `B${i}`) === expected[i], `74547 LEAB=0 hold B${i}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DECODER_3TO8_LATCH_ACK (74547F)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- DECODER_3TO8_LATCH_ACK (74547F) ---');
{
  // STB=1 latches; G=1 enables; ACK=1
  const c = makeComp('74547F');
  setPin(c, 'A0', 1); setPin(c, 'A1', 0); setPin(c, 'A2', 1); // sel=5
  setPin(c, 'STB', 1); setPin(c, 'G', 1);
  evalComp(c);
  assert(getPin(c, 'Y5') === 1, '74547F: Y5=1 for sel=5');
  assert(getPin(c, 'Y0') === 0, '74547F: Y0=0 for sel=5');
  assert(getPin(c, 'ACK') === 1, '74547F: ACK=1 when G=1');
}
{
  // G=0 → all Y=0, ACK=0
  const c = makeComp('74547F');
  setPin(c, 'A0', 0); setPin(c, 'A1', 0); setPin(c, 'A2', 0);
  setPin(c, 'STB', 1); setPin(c, 'G', 0);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Y${i}`) === 0, `74547F G=0 → Y${i}=0`);
  assert(getPin(c, 'ACK') === 0, '74547F: ACK=0 when G=0');
}
{
  // Latch: STB=0 holds address
  const c = makeComp('74547F');
  setPin(c, 'A0', 0); setPin(c, 'A1', 1); setPin(c, 'A2', 0); // sel=2
  setPin(c, 'STB', 1); setPin(c, 'G', 1);
  evalComp(c);
  assert(getPin(c, 'Y2') === 1, '74547F: Y2=1 initially');
  setPin(c, 'STB', 0);
  setPin(c, 'A0', 1); setPin(c, 'A1', 1); setPin(c, 'A2', 1); // change address
  evalComp(c);
  assert(getPin(c, 'Y2') === 1, '74547F: Y2=1 still (latched)');
}

// ─────────────────────────────────────────────────────────────────────────────
// REG_8BIT_PIPELINE (74548)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- REG_8BIT_PIPELINE (74548) ---');
{
  // Two CLK edges needed to get data through pipeline
  const c = makeComp('74548');
  setPin(c, 'OEn', 0); setPin(c, 'CLK1', 0); setPin(c, 'CLK2', 0);
  const data = 0b10110011;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalComp(c);
  // CLK1 rising: capture into stage1
  setPin(c, 'CLK1', 1); evalComp(c);
  // CLK2 rising: move stage1→stage2
  setPin(c, 'CLK2', 1); evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data >> i) & 1), `74548 pipeline Q${i}`);
}
{
  // OEn=1 → HiZ
  const c = makeComp('74548');
  setPin(c, 'OEn', 1); setPin(c, 'CLK1', 0); setPin(c, 'CLK2', 0);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Q${i}`) === 'Z', `74548 OEn=1 → Q${i}=HiZ`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DECODER_3TO8_ACK (74548F)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- DECODER_3TO8_ACK (74548F) ---');
{
  // G=1: decode sel=3 → Y3=1, others=0, ACK=1
  const c = makeComp('74548F');
  setPin(c, 'A0', 1); setPin(c, 'A1', 1); setPin(c, 'A2', 0); // sel=3
  setPin(c, 'G', 1);
  evalComp(c);
  assert(getPin(c, 'Y3') === 1, '74548F: Y3=1 for sel=3');
  assert(getPin(c, 'Y0') === 0, '74548F: Y0=0 for sel=3');
  assert(getPin(c, 'ACK') === 1, '74548F: ACK=1 when G=1');
}
{
  // G=0: all Y=0, ACK=0
  const c = makeComp('74548F');
  setPin(c, 'A0', 0); setPin(c, 'A1', 0); setPin(c, 'A2', 0);
  setPin(c, 'G', 0);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Y${i}`) === 0, `74548F G=0 → Y${i}=0`);
  assert(getPin(c, 'ACK') === 0, '74548F: ACK=0 when G=0');
}

// ─────────────────────────────────────────────────────────────────────────────
// LATCH_8BIT_PIPELINE (74549)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- LATCH_8BIT_PIPELINE (74549) ---');
{
  // LE1=1 transparent to stage1; LE2=1 transparent to stage2
  const c = makeComp('74549');
  setPin(c, 'OEn', 0); setPin(c, 'LE1', 1); setPin(c, 'LE2', 1);
  const data = 0b11010110;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data >> i) & 1), `74549 LE1=LE2=1 Q${i}`);
}
{
  // LE1=1, LE2=0: stage2 holds
  const c = makeComp('74549');
  setPin(c, 'OEn', 0); setPin(c, 'LE1', 1); setPin(c, 'LE2', 1);
  const data1 = 0b10101010;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data1 >> i) & 1);
  evalComp(c);
  setPin(c, 'LE2', 0);
  const data2 = 0b01010101;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data2 >> i) & 1);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data1 >> i) & 1), `74549 LE2=0 holds stage2 Q${i}`);
}
{
  // OEn=1 → HiZ
  const c = makeComp('74549');
  setPin(c, 'OEn', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `Q${i}`) === 'Z', `74549 OEn=1 → Q${i}=HiZ`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTIPLIER_8BIT_TC (74559) - stub
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- MULTIPLIER_8BIT_TC (74559) stub ---');
{
  // OEn=0: P=0, TCp=1
  const c = makeComp('74559');
  setPin(c, 'OEn', 0); setPin(c, 'TCn', 1);
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, 1);
  for (let i = 0; i < 3; i++) setPin(c, `B${i}`, 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `P${i}`) === 0, `74559 stub: P${i}=0`);
  assert(getPin(c, 'TCp') === 1, '74559 stub: TCp=1');
}
{
  // OEn=1 → P=HiZ
  const c = makeComp('74559');
  setPin(c, 'OEn', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `P${i}`) === 'Z', `74559 OEn=1 → P${i}=HiZ`);
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTER_SYNC_DECADE_TRI (74560)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- COUNTER_SYNC_DECADE_TRI (74560) ---');
{
  // Count 0→9→0 with tri-state off
  const c = makeComp('74560');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0); setPin(c, 'ENP', 1);
  setPin(c, 'LOAD', 1); setPin(c, 'ENT', 1); setPin(c, 'OEn', 0);
  setPin(c, 'A', 0); setPin(c, 'B', 0); setPin(c, 'C', 0); setPin(c, 'D', 0);
  // first tick from 0
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 1, '74560 count 1: QA=1');
  assert(getPin(c, 'QB') === 0, '74560 count 1: QB=0');
  // count to 9
  for (let i = 1; i < 9; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  assert(getPin(c, 'QA') === 1, '74560 count 9: QA=1');
  assert(getPin(c, 'QB') === 0, '74560 count 9: QB=0');
  assert(getPin(c, 'QC') === 0, '74560 count 9: QC=0');
  assert(getPin(c, 'QD') === 1, '74560 count 9: QD=1');
  assert(getPin(c, 'RCO') === 1, '74560 at 9: RCO=1');
  // wrap to 0
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QD') === 0, '74560 wrapped to 0');
}
{
  // OEn=1 → Q=HiZ (RCO still driven)
  const c = makeComp('74560');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0); setPin(c, 'ENP', 1);
  setPin(c, 'LOAD', 1); setPin(c, 'ENT', 1); setPin(c, 'OEn', 1);
  evalComp(c);
  for (const q of ['QA','QB','QC','QD'])
    assert(getPin(c, q) === 'Z', `74560 OEn=1 → ${q}=HiZ`);
}
{
  // CLRn=0 → synchronous clear
  const c = makeComp('74560');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0); setPin(c, 'ENP', 1);
  setPin(c, 'LOAD', 1); setPin(c, 'ENT', 1); setPin(c, 'OEn', 0);
  setPin(c, 'A', 0); setPin(c, 'B', 0); setPin(c, 'C', 0); setPin(c, 'D', 0);
  // count a few
  for (let i = 0; i < 3; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  setPin(c, 'CLRn', 0);
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QD') === 0, '74560 CLRn=0 → count=0');
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTER_SYNC_BIN_TRI (74561)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- COUNTER_SYNC_BIN_TRI (74561) ---');
{
  // Count 0→15→0
  const c = makeComp('74561');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0); setPin(c, 'ENP', 1);
  setPin(c, 'LOAD', 1); setPin(c, 'ENT', 1); setPin(c, 'OEn', 0);
  setPin(c, 'A', 0); setPin(c, 'B', 0); setPin(c, 'C', 0); setPin(c, 'D', 0);
  for (let i = 0; i < 15; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  assert(getPin(c, 'QA') === 1 && getPin(c, 'QB') === 1 && getPin(c, 'QC') === 1 && getPin(c, 'QD') === 1, '74561 count 15: all Q=1');
  assert(getPin(c, 'RCO') === 1, '74561 at 15: RCO=1');
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QD') === 0, '74561 wrapped to 0');
}
{
  // Load: LOAD=0 → load data
  const c = makeComp('74561');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0); setPin(c, 'ENP', 1);
  setPin(c, 'LOAD', 0); setPin(c, 'ENT', 1); setPin(c, 'OEn', 0);
  setPin(c, 'A', 1); setPin(c, 'B', 0); setPin(c, 'C', 1); setPin(c, 'D', 0); // load 5
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 1 && getPin(c, 'QB') === 0 && getPin(c, 'QC') === 1 && getPin(c, 'QD') === 0, '74561 LOAD: q=5');
}

// ─────────────────────────────────────────────────────────────────────────────
// LATCH_OCTAL_INV_TRI reuse (74563)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- LATCH_OCTAL_INV_TRI reuse (74563) ---');
{
  assert(CHIPS_BLOCK_30['74563'].gates[0].type === 'LATCH_OCTAL_INV_TRI', '74563 uses LATCH_OCTAL_INV_TRI');
  // Quick functional check
  const chip = CHIPS_BLOCK_30['74563'];
  const c = { id: 'U1', type: 'LATCH_OCTAL_INV_TRI', pins: {} };
  setPin(c, 'OEn', 0); setPin(c, 'LE', 1);
  const data = 0b10101010;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  SIM._evaluateLatchOctalInvTri(c, chip.gates[0]);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}n`) === (((data >> i) & 1) ^ 1), `74563 inv Q${i}n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
