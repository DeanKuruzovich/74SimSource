// test-chips31.mjs - Tests for Block 31: 74564-74588
import { CircuitSimulator } from '../simulator.js';
import { CHIPS_BLOCK_31 }  from '../chips/chips31.js';

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
  const chip = CHIPS_BLOCK_31[chipKey];
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
  REG_OCTAL_INV_TRI:               '_evaluateRegOctalInvTri',
  TRANSCEIVER_OCTAL_REG_INV:       '_evaluateTransceiverOctalRegInv',
  TRANSCEIVER_OCTAL_LATCH_INV:     '_evaluateTransceiverOctalLatchInv',
  COUNTER_SYNC_DECADE_UPDOWN_TRI:  '_evaluateCounterSyncDecadeUpdownTri',
  COUNTER_SYNC_BIN_UPDOWN_TRI:     '_evaluateCounterSyncBinUpdownTri',
  REG_OCTAL_SYNCLR_TRI:            '_evaluateRegOctalSynclrTri',
  REG_OCTAL_SYNCLR_INV_TRI:        '_evaluateRegOctalSynclrInvTri',
  COUNTER_8BIT_BIDIR_TRI:          '_evaluateCounter8BitBidirTri',
  LATCH_OCTAL_INV_TRI:             '_evaluateLatchOctalInvTri',
  ALU_BCD_4BIT:                    '_evaluateAluBcd4Bit',
  ADDER_BCD_4BIT:                  '_evaluateAdderBcd4Bit',
  TRANSCEIVER_8BIT:                '_evaluateTransceiver8Bit',
};

function evalComp(comp) {
  const chip = CHIPS_BLOCK_31[comp._chipKey];
  for (const gate of chip.gates) {
    const method = gateMethodMap[gate.type];
    if (method && SIM[method]) SIM[method](comp, gate);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REG_OCTAL_INV_TRI reuse (74564, 74576)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- REG_OCTAL_INV_TRI (74564 / 74576) ---');
{
  // Gate type reuse: on rising CLK, Qn = NOT(D)
  const c = makeComp('74x564');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  const data = 0b10110011;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalComp(c); // CLK=0, no capture yet
  setPin(c, 'CLK', 1); evalComp(c); // rising edge, capture
  for (let i = 0; i < 8; i++) {
    const expected = (((data >> i) & 1) ^ 1);
    assert(getPin(c, `Qn${i}`) === expected, `74564 Qn${i} = NOT(D${i})`);
  }
  // OEn=1 → all HiZ
  setPin(c, 'OEn', 1); evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Qn${i}`) === 'Z', `74564 OEn=1 → Qn${i}=HiZ`);
}
{
  // 74576 same gate type
  const c = makeComp('74x576');
  setPin(c, 'OEn', 0); setPin(c, 'CLK', 0);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 1);
  evalComp(c);
  setPin(c, 'CLK', 1); evalComp(c);
  // D=1 → Qn=0
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Qn${i}`) === 0, `74576 Qn${i}=0 when D=1`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCEIVER_OCTAL_REG_INV reuse (74566)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TRANSCEIVER_OCTAL_REG_INV (74566) ---');
{
  // Gate type reuse: DIR=1 A→B inverted, on CLK rising
  const c = makeComp('74x566');
  setPin(c, 'OEABn', 0); setPin(c, 'OEBAn', 1);
  setPin(c, 'LEAB', 0); setPin(c, 'LEBA', 0);
  setPin(c, 'CLK', 0); setPin(c, 'DIR', 1);
  const data = 0b10101010;
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, (data >> i) & 1);
  evalComp(c); // CLK=0, read A
  setPin(c, 'CLK', 1); evalComp(c); // capture A→regAB on rising edge
  setPin(c, 'CLK', 0); evalComp(c);
  // B should be inverted A
  for (let i = 0; i < 8; i++) {
    const expected = (((data >> i) & 1) ^ 1);
    assert(getPin(c, `B${i}`) === expected, `74566 B${i} = NOT(A${i})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCEIVER_OCTAL_LATCH_INV (74567)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TRANSCEIVER_OCTAL_LATCH_INV (74567) ---');
{
  // DIR=1: LEAB=1 → latch A, drive B inverted
  const c = makeComp('74x567');
  setPin(c, 'OEABn', 0); setPin(c, 'OEBAn', 1);
  setPin(c, 'LEAB', 1); setPin(c, 'LEBA', 0);
  setPin(c, 'DIR', 1);
  const data = 0b11001100;
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, (data >> i) & 1);
  evalComp(c); // latch A
  for (let i = 0; i < 8; i++) {
    const expected = (((data >> i) & 1) ^ 1);
    assert(getPin(c, `B${i}`) === expected, `74567 B${i} = NOT(A${i})`);
  }
  // OEABn=1 → B=HiZ
  setPin(c, 'OEABn', 1); evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `B${i}`) === 'Z', `74567 OEABn=1 → B${i}=HiZ`);
}
{
  // DIR=0: LEBA=1 → latch B, drive A inverted
  const c = makeComp('74x567');
  setPin(c, 'OEABn', 1); setPin(c, 'OEBAn', 0);
  setPin(c, 'LEAB', 0); setPin(c, 'LEBA', 1);
  setPin(c, 'DIR', 0);
  const data = 0b01010101;
  for (let i = 0; i < 8; i++) setPin(c, `B${i}`, (data >> i) & 1);
  evalComp(c);
  for (let i = 0; i < 8; i++) {
    const expected = (((data >> i) & 1) ^ 1);
    assert(getPin(c, `A${i}`) === expected, `74567 A${i} = NOT(B${i})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTER_SYNC_DECADE_UPDOWN_TRI (74568)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- COUNTER_SYNC_DECADE_UPDOWN_TRI (74568) ---');
{
  // Count up 0→9→0
  const c = makeComp('74x568');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  setPin(c, 'U_Dn', 1); setPin(c, 'ENP', 1); setPin(c, 'ENT', 1);
  setPin(c, 'LOAD', 1); setPin(c, 'OEn', 0);
  setPin(c, 'A', 0); setPin(c, 'B', 0); setPin(c, 'C', 0); setPin(c, 'D', 0);
  evalComp(c);
  // 9 ticks → count reaches 9
  for (let i = 0; i < 9; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  assert(getPin(c, 'QA') === 1, '74568 count 9: QA=1');
  assert(getPin(c, 'QB') === 0, '74568 count 9: QB=0');
  assert(getPin(c, 'QC') === 0, '74568 count 9: QC=0');
  assert(getPin(c, 'QD') === 1, '74568 count 9: QD=1');
  assert(getPin(c, 'RCO') === 1, '74568 at 9: RCO=1');
  // One more tick → wrap to 0
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QD') === 0, '74568 wrapped to 0');
}
{
  // Count down: load=5, then count down to 0 → RCO
  const c = makeComp('74x568');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  setPin(c, 'U_Dn', 0); setPin(c, 'ENP', 1); setPin(c, 'ENT', 1);
  setPin(c, 'LOAD', 0); setPin(c, 'OEn', 0);
  setPin(c, 'A', 1); setPin(c, 'B', 0); setPin(c, 'C', 1); setPin(c, 'D', 0); // 5
  evalComp(c);
  // Load 5
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 1 && getPin(c, 'QB') === 0 && getPin(c, 'QC') === 1, '74568 loaded 5');
  // Enable counting (LOAD=1), count down
  setPin(c, 'LOAD', 1);
  for (let i = 0; i < 5; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QB') === 0 && getPin(c, 'QC') === 0 && getPin(c, 'QD') === 0, '74568 count-down=0');
  assert(getPin(c, 'RCO') === 1, '74568 down at 0: RCO=1');
}
{
  // OEn=1 → Q=HiZ
  const c = makeComp('74x568');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  setPin(c, 'ENP', 1); setPin(c, 'ENT', 1); setPin(c, 'LOAD', 1); setPin(c, 'OEn', 1);
  evalComp(c);
  for (const q of ['QA','QB','QC','QD'])
    assert(getPin(c, q) === 'Z', `74568 OEn=1 → ${q}=HiZ`);
}
{
  // CLRn=0 → synchronous clear
  const c = makeComp('74x568');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  setPin(c, 'U_Dn', 1); setPin(c, 'ENP', 1); setPin(c, 'ENT', 1);
  setPin(c, 'LOAD', 1); setPin(c, 'OEn', 0);
  evalComp(c);
  for (let i = 0; i < 5; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  setPin(c, 'CLRn', 0);
  setPin(c, 'CLK', 1); evalComp(c);
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QD') === 0, '74568 CLRn=0 → clear');
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTER_SYNC_BIN_UPDOWN_TRI (74569)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- COUNTER_SYNC_BIN_UPDOWN_TRI (74569) ---');
{
  // Count up 0→15→0
  const c = makeComp('74x569');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  setPin(c, 'U_Dn', 1); setPin(c, 'ENP', 1); setPin(c, 'ENT', 1);
  setPin(c, 'LOAD', 1); setPin(c, 'OEn', 0);
  setPin(c, 'A', 0); setPin(c, 'B', 0); setPin(c, 'C', 0); setPin(c, 'D', 0);
  evalComp(c);
  for (let i = 0; i < 15; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  assert(getPin(c, 'QA') === 1 && getPin(c, 'QB') === 1 && getPin(c, 'QC') === 1 && getPin(c, 'QD') === 1, '74569 count 15: all Q=1');
  assert(getPin(c, 'RCO') === 1, '74569 at 15: RCO=1');
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QD') === 0, '74569 wrapped to 0');
}
{
  // Count down from 15
  const c = makeComp('74x569');
  setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  setPin(c, 'U_Dn', 0); setPin(c, 'ENP', 1); setPin(c, 'ENT', 1);
  setPin(c, 'LOAD', 0); setPin(c, 'OEn', 0);
  setPin(c, 'A', 1); setPin(c, 'B', 1); setPin(c, 'C', 1); setPin(c, 'D', 1); // 15
  evalComp(c);
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); // load
  setPin(c, 'LOAD', 1);
  for (let i = 0; i < 15; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  assert(getPin(c, 'QA') === 0 && getPin(c, 'QB') === 0 && getPin(c, 'QC') === 0 && getPin(c, 'QD') === 0, '74569 count-down reached 0');
  assert(getPin(c, 'RCO') === 1, '74569 down at 0: RCO=1');
}
// ─────────────────────────────────────────────────────────────────────────────
// REG_OCTAL_SYNCLR_TRI (74575)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- REG_OCTAL_SYNCLR_TRI (74575) ---');
{
  // Normal capture on rising CLK
  const c = makeComp('74x575');
  setPin(c, 'OEn', 0); setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  const data = 0b11001010;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalComp(c);
  setPin(c, 'CLK', 1); evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === ((data >> i) & 1), `74575 Q${i} captured`);
}
{
  // Synchronous clear: CLRn=0 on rising CLK → Q=0
  const c = makeComp('74x575');
  setPin(c, 'OEn', 0); setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 1);
  evalComp(c);
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  setPin(c, 'CLRn', 0);
  setPin(c, 'CLK', 1); evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === 0, `74575 CLRn=0 → Q${i}=0`);
}
{
  // OEn=1 → Q=HiZ
  const c = makeComp('74x575');
  setPin(c, 'OEn', 1); setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Q${i}`) === 'Z', `74575 OEn=1 → Q${i}=HiZ`);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG_OCTAL_SYNCLR_INV_TRI (74577)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- REG_OCTAL_SYNCLR_INV_TRI (74577) ---');
{
  // Normal: capture NOT(D) on rising CLK
  const c = makeComp('74x577');
  setPin(c, 'OEn', 0); setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  const data = 0b10101100;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  evalComp(c);
  setPin(c, 'CLK', 1); evalComp(c);
  for (let i = 0; i < 8; i++) {
    const expected = (((data >> i) & 1) ^ 1);
    assert(getPin(c, `Qn${i}`) === expected, `74577 Qn${i} = NOT(D${i})`);
  }
}
{
  // Sync clear: Q=0 → Qn=1
  const c = makeComp('74x577');
  setPin(c, 'OEn', 0); setPin(c, 'CLRn', 1); setPin(c, 'CLK', 0);
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, 0); // D=0 → Qn=1
  evalComp(c);
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  setPin(c, 'CLRn', 0);
  setPin(c, 'CLK', 1); evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Qn${i}`) === 1, `74577 CLRn=0 → Qn${i}=1`);
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTER_8BIT_BIDIR_TRI (74579)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- COUNTER_8BIT_BIDIR_TRI (74579) ---');
{
  // Count up 0→255→0
  const c = makeComp('74x579');
  setPin(c, 'CLK', 0); setPin(c, 'ENT', 1); setPin(c, 'ENP', 1);
  setPin(c, 'U_Dn', 1); setPin(c, 'LOAD', 1); setPin(c, 'OEn', 0);
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, 0);
  evalComp(c);
  // Count to 5
  for (let i = 0; i < 5; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  assert(getPin(c, 'A0') === 1 && getPin(c, 'A1') === 0 && getPin(c, 'A2') === 1, '74579 count=5: A0=1,A1=0,A2=1');
  assert(getPin(c, 'TC') === 0, '74579 TC=0 at 5');
  // Count to 255
  for (let i = 5; i < 255; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  for (let i = 0; i < 8; i++) assert(getPin(c, `A${i}`) === 1, `74579 count=255: A${i}=1`);
  assert(getPin(c, 'TC') === 1, '74579 TC=1 at 255');
  // Wrap
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  for (let i = 0; i < 8; i++) assert(getPin(c, `A${i}`) === 0, `74579 wrapped to 0: A${i}=0`);
}
{
  // Count down
  const c = makeComp('74x579');
  setPin(c, 'ENT', 1); setPin(c, 'ENP', 1);
  setPin(c, 'U_Dn', 0); setPin(c, 'LOAD', 0); setPin(c, 'OEn', 0);
  for (let i = 0; i < 8; i++) setPin(c, `A${i}`, 1); // data=0xFF
  // Load 0xFF on first rising CLK (no preceding evalComp so A-pins are untouched)
  setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c);
  setPin(c, 'LOAD', 1);
  for (let i = 0; i < 255; i++) { setPin(c, 'CLK', 1); evalComp(c); setPin(c, 'CLK', 0); evalComp(c); }
  for (let i = 0; i < 8; i++) assert(getPin(c, `A${i}`) === 0, `74579 count-down to 0: A${i}=0`);
  assert(getPin(c, 'TC') === 1, '74579 TC=1 when down at 0');
}
{
  // OEn=1 → A0-A7=HiZ (TC always driven)
  const c = makeComp('74x579');
  setPin(c, 'CLK', 0); setPin(c, 'OEn', 1);
  setPin(c, 'ENT', 1); setPin(c, 'U_Dn', 1); setPin(c, 'LOAD', 1);
  evalComp(c);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `A${i}`) === 'Z', `74579 OEn=1 → A${i}=HiZ`);
}

// ─────────────────────────────────────────────────────────────────────────────
// LATCH_OCTAL_INV_TRI reuse (74580)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- LATCH_OCTAL_INV_TRI reuse (74580) ---');
{
  assert(CHIPS_BLOCK_31['74x580'].gates[0].type === 'LATCH_OCTAL_INV_TRI', '74580 uses LATCH_OCTAL_INV_TRI');
  const chip = CHIPS_BLOCK_31['74x580'];
  const c = { id: 'U1', type: 'LATCH_OCTAL_INV_TRI', pins: {}, _chipKey: '74x580' };
  setPin(c, 'OEn', 0); setPin(c, 'LE', 1);
  const data = 0b10110101;
  for (let i = 0; i < 8; i++) setPin(c, `D${i}`, (data >> i) & 1);
  SIM._evaluateLatchOctalInvTri(c, chip.gates[0]);
  for (let i = 0; i < 8; i++)
    assert(getPin(c, `Qn${i}`) === (((data >> i) & 1) ^ 1), `74580 Qn${i}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ADDER_BCD_4BIT (74583)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- ADDER_BCD_4BIT (74583) ---');
{
  const chip = CHIPS_BLOCK_31['74x583'];
  const c = { id: 'U1', type: 'ADDER_BCD_4BIT', pins: {}, _chipKey: '74x583' };
  // 3 + 4 = 7, no carry
  const a = 3, b = 4;
  for (let i = 0; i < 4; i++) setPin(c, `A${i}`, (a >> i) & 1);
  for (let i = 0; i < 4; i++) setPin(c, `B${i}`, (b >> i) & 1);
  setPin(c, 'Cin', 0);
  SIM._evaluateAdderBcd4Bit(c, chip.gates[0]);
  assert(getPin(c, 'S0') === 1 && getPin(c, 'S1') === 1 && getPin(c, 'S2') === 1 && getPin(c, 'S3') === 0, '74583 3+4=7: S=0111');
  assert(getPin(c, 'Cout') === 0, '74583 3+4 no carry');
}
{
  const chip = CHIPS_BLOCK_31['74x583'];
  const c = { id: 'U1', type: 'ADDER_BCD_4BIT', pins: {}, _chipKey: '74x583' };
  // 5 + 8 = 13 → BCD: result=3, carry=1  (13-10=3, since 13>9: (13+6)&0xF=3, carry=1 ✓)
  const a = 5, b = 8;
  for (let i = 0; i < 4; i++) setPin(c, `A${i}`, (a >> i) & 1);
  for (let i = 0; i < 4; i++) setPin(c, `B${i}`, (b >> i) & 1);
  setPin(c, 'Cin', 0);
  SIM._evaluateAdderBcd4Bit(c, chip.gates[0]);
  // 5+8=13 → BCD: carry=1, result=3 (0011)
  assert(getPin(c, 'S0') === 1 && getPin(c, 'S1') === 1 && getPin(c, 'S2') === 0 && getPin(c, 'S3') === 0, '74583 5+8=BCD 13: S=0011');
  assert(getPin(c, 'Cout') === 1, '74583 5+8 carry=1');
}
{
  const chip = CHIPS_BLOCK_31['74x583'];
  const c = { id: 'U1', type: 'ADDER_BCD_4BIT', pins: {}, _chipKey: '74x583' };
  // With carry in: 9 + 0 + 1 = 10 → BCD: result=0, carry=1
  const a = 9, b = 0;
  for (let i = 0; i < 4; i++) setPin(c, `A${i}`, (a >> i) & 1);
  for (let i = 0; i < 4; i++) setPin(c, `B${i}`, (b >> i) & 1);
  setPin(c, 'Cin', 1);
  SIM._evaluateAdderBcd4Bit(c, chip.gates[0]);
  assert(getPin(c, 'S0') === 0 && getPin(c, 'S1') === 0 && getPin(c, 'S2') === 0 && getPin(c, 'S3') === 0, '74583 9+0+Cin=BCD 10: S=0000');
  assert(getPin(c, 'Cout') === 1, '74583 9+0+Cin carry=1');
}

// ─────────────────────────────────────────────────────────────────────────────
// ALU_BCD_4BIT (74582) - basic stub test
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- ALU_BCD_4BIT (74582) ---');
{
  const chip = CHIPS_BLOCK_31['74x582'];
  const c = { id: 'U1', type: 'ALU_BCD_4BIT', pins: {}, _chipKey: '74x582' };
  // BCD add: A=3, B=4, Cn=0, M=0, S=1001 (add)
  const a = 3, b = 4;
  for (let i = 0; i < 4; i++) setPin(c, `A${i}`, (a >> i) & 1);
  for (let i = 0; i < 4; i++) setPin(c, `B${i}`, (b >> i) & 1);
  setPin(c, 'Cn', 0); setPin(c, 'M', 0);
  // S=1001 → S0=1,S1=0,S2=0,S3=1
  setPin(c, 'S0', 1); setPin(c, 'S1', 0); setPin(c, 'S2', 0); setPin(c, 'S3', 1);
  SIM._evaluateAluBcd4Bit(c, chip.gates[0]);
  // 3+4=7 in BCD: F=0111
  assert(getPin(c, 'F0') === 1 && getPin(c, 'F1') === 1 && getPin(c, 'F2') === 1 && getPin(c, 'F3') === 0, '74582 BCD add 3+4=7');
  assert(getPin(c, 'Cn4') === 0, '74582 3+4 no carry');
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCEIVER_8BIT reuse (74588)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- TRANSCEIVER_8BIT reuse (74588) ---');
{
  assert(CHIPS_BLOCK_31['74x588'].gates[0].type === 'TRANSCEIVER_8BIT', '74588 uses TRANSCEIVER_8BIT');
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
