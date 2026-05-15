/**
 * test-chips26.mjs - Tests for CHIPS_BLOCK_26 (74446‥74461)
 */
import { CHIPS_BLOCK_26 } from '../chips/chips26.js';
import { CircuitSimulator } from '../simulator.js';

let passed = 0, failed = 0;

function makeComp(chipKey) {
  const spec = CHIPS_BLOCK_26[chipKey];
  if (!spec) throw new Error(`Unknown chip: ${chipKey}`);
  const comp = {
    id: `test_${chipKey}`,
    type: chipKey,
    pins: {},
    state: {},
  };
  for (const p of spec.pinout) {
    comp.pins[p.name] = { name: p.name, type: p.type, voltage: 0, netId: null };
  }
  return { comp, spec };
}

function setPin(comp, name, val) {
  if (!comp.pins[name]) return; // ignore missing NC pins
  comp.pins[name].voltage = val ? 5 : 0;
}

function getPin(comp, name) {
  if (!comp.pins[name]) return undefined;
  const v = comp.pins[name].voltage;
  return (v > 2.5) ? 1 : (v < 0.5 ? 0 : 0.5);
}

const SIM = new CircuitSimulator();

// Wire _readGateInputs / _drivePinBit / _drivePinHighZ to use comp.pins directly
SIM._readGateInputs = function(comp, inputNames) {
  return inputNames.map(n => {
    if (!comp.pins[n]) return 0; // floating → treat as 0
    const v = comp.pins[n].voltage;
    return (v > 2.5) ? 1 : 0;
  });
};
SIM._drivePinBit = function(comp, name, bit) {
  if (!comp.pins[name]) return false;
  const newV = bit ? 5 : 0;
  if (comp.pins[name].voltage === newV) return false;
  comp.pins[name].voltage = newV;
  return true;
};
SIM._drivePinHighZ = function(comp, name) {
  if (!comp.pins[name]) return false;
  if (comp.pins[name].voltage === 2.5) return false;
  comp.pins[name].voltage = 2.5;
  return true;
};

function runGate(comp, gate) {
  switch (gate.type) {
    case 'BUS_XCVR_QUAD_INV_TRI':   SIM._evaluateBusXcvrQuadInvTri(comp, gate); break;
    // BCD_7SEG requires full simulator netlist; tested via spec check only
    case 'BUS_XCVR_QUAD_INV_OC':    SIM._evaluateBusXcvrQuadInvOc(comp, gate); break;
    case 'BUS_XCVR_QUAD_TRI':       SIM._evaluateBusXcvrQuadTri(comp, gate); break;
    case 'MUX_16TO1_COMPL':         SIM._evaluateMux16to1Compl(comp, gate); break;
    case 'MUX_8TO1_COMPL_TRI':      SIM._evaluateMux8to1ComplTri(comp, gate); break;
    case 'COUNTER_DECADE_DUAL_SYNC':SIM._evaluateCounterDecadeDualSync(comp, gate); break;
    case 'MUX_QUAD_4TO1':           SIM._evaluateMuxQuad4to1(comp, gate); break;
    case 'COUNTER_DECADE_UPDOWN_DUAL': SIM._evaluateCounterDecadeUpdownDual(comp, gate); break;
    case 'BUFFER_OCTAL_PARITY_INV': SIM._evaluateBufferOctalParityInv(comp, gate); break;
    case 'BUFFER_OCTAL_PARITY':     SIM._evaluateBufferOctalParity(comp, gate); break;
    case 'NINES_COMPLEMENT':        SIM._evaluateNinesComplement(comp, gate); break;
    case 'COMPARATOR_10BIT':        SIM._evaluateComparator10Bit(comp, gate); break;
    case 'COUNTER_8BIT_PRESET':     SIM._evaluateCounter8BitPreset(comp, gate); break;
    default: throw new Error(`No handler for gate type: ${gate.type}`);
  }
}

function runAllGates(comp, spec) {
  for (const gate of spec.gates) runGate(comp, gate);
}

function expect(label, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL [${label}]: expected ${expected}, got ${actual}`);
  }
}

// ─── 74446 - Quad Inv Bus Xcvr (tri-state) ────────────────────────────────
{
  const { comp, spec } = makeComp('74446');
  const gate = spec.gates[0]; // BUS_XCVR_QUAD_INV_TRI

  // OEn=0, OE2n=0, DIR=0: A→B inverted
  setPin(comp, 'OE1n', 0); setPin(comp, 'OE2n', 0); setPin(comp, 'DIR', 0);
  setPin(comp, 'A1', 1); setPin(comp, 'A2', 0); setPin(comp, 'A3', 1); setPin(comp, 'A4', 0);
  runGate(comp, gate);
  expect('74446 DIR=0 B1=NOT(A1)', getPin(comp, 'B1'), 0);
  expect('74446 DIR=0 B2=NOT(A2)', getPin(comp, 'B2'), 1);
  expect('74446 DIR=0 B3=NOT(A3)', getPin(comp, 'B3'), 0);
  expect('74446 DIR=0 B4=NOT(A4)', getPin(comp, 'B4'), 1);

  // OEn=1: tri-state
  setPin(comp, 'OE1n', 1);
  runGate(comp, gate);
  expect('74446 OE1n=1 B1 HiZ', getPin(comp, 'B1'), 0.5);
}

// ─── 74447 - BCD to 7-seg (low-voltage OC) ────────────────────────────────
// Note: BCD_7SEG evaluator requires full simulator netlist context,
//       so we verify chip spec structure only.
{
  const spec = CHIPS_BLOCK_26['74447'];
  const gate = spec.gates[0];

  expect('74447 gate type is BCD_7SEG', gate.type === 'BCD_7SEG' ? 1 : 0, 1);
  expect('74447 has input A', gate.inputs.includes('A') ? 1 : 0, 1);
  expect('74447 has input B', gate.inputs.includes('B') ? 1 : 0, 1);
  expect('74447 has input C', gate.inputs.includes('C') ? 1 : 0, 1);
  expect('74447 has input D', gate.inputs.includes('D') ? 1 : 0, 1);
  expect('74447 has output a', gate.outputs.includes('a') ? 1 : 0, 1);
  expect('74447 has output g', gate.outputs.includes('g') ? 1 : 0, 1);
  expect('74447 is open-collector', spec.openCollector ? 1 : 0, 1);
}

// ─── 74448 - Quad Inv OC bus xcvr ─────────────────────────────────────────
{
  const { comp, spec } = makeComp('74448');
  const gate = spec.gates[0];

  // OE1n=0, OE2n=0, DIR=0: A→B inverted
  setPin(comp, 'OE1n', 0); setPin(comp, 'OE2n', 0); setPin(comp, 'DIR', 0);
  setPin(comp, 'A1', 1); setPin(comp, 'A2', 1); setPin(comp, 'A3', 0); setPin(comp, 'A4', 0);
  runGate(comp, gate);
  expect('74448 DIR=0 B1=NOT(A1)', getPin(comp, 'B1'), 0);
  expect('74448 DIR=0 B2=NOT(A2)', getPin(comp, 'B2'), 0);
  expect('74448 DIR=0 B3=NOT(A3)', getPin(comp, 'B3'), 1);
  expect('74448 DIR=0 B4=NOT(A4)', getPin(comp, 'B4'), 1);
}

// ─── 74449 - Quad Non-Inv Bus Xcvr (tri-state) ────────────────────────────
{
  const { comp, spec } = makeComp('74449');
  const gate = spec.gates[0];

  // OE1n=0, OE2n=0, DIR=0: A→B non-inverted
  setPin(comp, 'OE1n', 0); setPin(comp, 'OE2n', 0); setPin(comp, 'DIR', 0);
  setPin(comp, 'A1', 1); setPin(comp, 'A2', 0); setPin(comp, 'A3', 1); setPin(comp, 'A4', 0);
  runGate(comp, gate);
  expect('74449 DIR=0 B1=A1', getPin(comp, 'B1'), 1);
  expect('74449 DIR=0 B2=A2', getPin(comp, 'B2'), 0);
  expect('74449 DIR=0 B3=A3', getPin(comp, 'B3'), 1);
  expect('74449 DIR=0 B4=A4', getPin(comp, 'B4'), 0);

  // OE1n=1: tri-state
  setPin(comp, 'OE1n', 1);
  runGate(comp, gate);
  expect('74449 OE1n=1 B1 HiZ', getPin(comp, 'B1'), 0.5);
}

= makeComp('74S450');
  const gate = spec.gates[0];

  // Write value 0xA5 to address 3 via state
  setPin(comp, 'OEn', 0); setPin(comp, 'CSn', 0);
  // Set address = 3: A0=1, A1=1, rest=0
  for (let i = 0; i < 10; i++) setPin(comp, `A${i}`, 0);
  setPin(comp, 'A0', 1); setPin(comp, 'A1', 1);
  runGate(comp, gate);
  // PROM blank = all zeros
  expect('74S450 blank addr=3 D0=0', getPin(comp, 'D0'), 0);
  expect('74S450 blank addr=3 D7=0', getPin(comp, 'D7'), 0);

  // Write data
  comp.state.rom = new Uint8Array(1024);
  comp.state.rom[3] = 0xA5; // 10100101
  runGate(comp, gate);
  expect('74S450 addr=3 D0=1', getPin(comp, 'D0'), 1);
  expect('74S450 addr=3 D1=0', getPin(comp, 'D1'), 0);
  expect('74S450 addr=3 D2=1', getPin(comp, 'D2'), 1);
  expect('74S450 addr=3 D5=1', getPin(comp, 'D5'), 1);
  expect('74S450 addr=3 D7=1', getPin(comp, 'D7'), 1);

  // CSn=1 → HiZ
  setPin(comp, 'CSn', 1);
  runGate(comp, gate);
  expect('74S450 CSn=1 D0 HiZ', getPin(comp, 'D0'), 0.5);

  // OEn=1 → HiZ
  setPin(comp, 'CSn', 0); setPin(comp, 'OEn', 1);
  runGate(comp, gate);
  expect('74S450 OEn=1 D3 HiZ', getPin(comp, 'D3'), 0.5);
}

// ─── 74LS450 - 16-to-1 Mux (complementary output) ────────────────────────
{
  const { comp, spec } = makeComp('74LS450');
  const gate = spec.gates[0];

  const dataNames = ['E0','E1','E2','E3','E4','E5','E6','E7','E8','E9','E10','E11','E12','E13','E14','E15'];

  // All data=0, Gn=0, sel=0 → W = NOT(E0) = 1
  for (const d of dataNames) setPin(comp, d, 0);
  setPin(comp, 'A', 0); setPin(comp, 'B', 0); setPin(comp, 'C', 0); setPin(comp, 'D', 0);
  setPin(comp, 'Gn', 0);
  runGate(comp, gate);
  expect('74LS450 E0=0 W=1', getPin(comp, 'W'), 1);

  // E5=1, sel=5 → W = NOT(E5) = 0
  setPin(comp, 'E5', 1);
  setPin(comp, 'A', 1); setPin(comp, 'B', 0); setPin(comp, 'C', 1); setPin(comp, 'D', 0); // sel=5
  runGate(comp, gate);
  expect('74LS450 E5=1 sel=5 W=0', getPin(comp, 'W'), 0);

  // Gn=1 → W=1 (disabled)
  setPin(comp, 'Gn', 1);
  runGate(comp, gate);
  expect('74LS450 Gn=1 W=1', getPin(comp, 'W'), 1);
}

= makeComp('74S451');
  const gate = spec.gates[0];

  setPin(comp, 'OEn', 0); setPin(comp, 'CSn', 0);
  for (let i = 0; i < 10; i++) setPin(comp, `A${i}`, 0);
  // Addr=0, blank PROM
  runGate(comp, gate);
  expect('74S451 blank D0=0', getPin(comp, 'D0'), 0);

  // Write to state.rom
  comp.state.rom = new Uint8Array(1024);
  comp.state.rom[0] = 0xFF;
  runGate(comp, gate);
  expect('74S451 addr=0 D0=1', getPin(comp, 'D0'), 1);
  expect('74S451 addr=0 D7=1', getPin(comp, 'D7'), 1);

  // OEn=1 → HiZ
  setPin(comp, 'OEn', 1);
  runGate(comp, gate);
  expect('74S451 OEn=1 D0 HiZ', getPin(comp, 'D0'), 0.5);
}

// ─── 74LS451 - Dual 8-to-1 Mux ───────────────────────────────────────────
{
  const { comp, spec } = makeComp('74LS451');

  // Section 1: sel=2, 1D2=1 → 1W=1, 1Wn=0
  const gate1 = spec.gates[0];
  setPin(comp, 'S0', 0); setPin(comp, 'S1', 1); setPin(comp, 'S2', 0); // sel=2
  setPin(comp, '1Gn', 0);
  for (const n of ['D0','D1','D2','D3','1D4','1D5','1D6','1D7']) setPin(comp, n, 0);
  setPin(comp, 'D2', 1); // 1D2=1
  runGate(comp, gate1);
  expect('74LS451 sec1 sel=2 1D2=1 1W=1',  getPin(comp, '1W'),  1);
  expect('74LS451 sec1 sel=2 1D2=1 1Wn=0', getPin(comp, '1Wn'), 0);

  // Section 1: 1Gn=1 → HiZ
  setPin(comp, '1Gn', 1);
  runGate(comp, gate1);
  expect('74LS451 sec1 1Gn=1 1W HiZ', getPin(comp, '1W'), 0.5);

  // Section 2: sel=0, D0=1 → 2W=1, 2Wn=0
  const gate2 = spec.gates[1];
  setPin(comp, 'S0', 0); setPin(comp, 'S1', 0); setPin(comp, 'S2', 0);
  setPin(comp, '2Gn', 0);
  for (const n of ['D0','D1','D2','D3','2D4','2D5','2D6','2D7']) setPin(comp, n, 0);
  setPin(comp, 'D0', 1);
  runGate(comp, gate2);
  expect('74LS451 sec2 sel=0 D0=1 2W=1',  getPin(comp, '2W'),  1);
  expect('74LS451 sec2 sel=0 D0=1 2Wn=0', getPin(comp, '2Wn'), 0);
}

// ─── 74452 - Dual Decade Counter (sync) ────────────────────────────────────
{
  const { comp, spec } = makeComp('74452');
  const gate = spec.gates[0];

  // Reset both sections
  setPin(comp, 'CLRn1', 0); setPin(comp, 'CLRn2', 0);
  setPin(comp, 'CLK1', 0); setPin(comp, 'CLK2', 0);
  runGate(comp, gate);
  expect('74452 reset QA1=0', getPin(comp, 'QA1'), 0);
  expect('74452 reset QA2=0', getPin(comp, 'QA2'), 0);

  // Remove clear, count section 1 to 3
  setPin(comp, 'CLRn1', 1);
  for (let i = 0; i < 3; i++) {
    setPin(comp, 'CLK1', 1); runGate(comp, gate);
    setPin(comp, 'CLK1', 0); runGate(comp, gate);
  }
  // Count=3: QA1=1, QB1=1, QC1=0, QD1=0
  expect('74452 cnt1=3 QA1=1', getPin(comp, 'QA1'), 1);
  expect('74452 cnt1=3 QB1=1', getPin(comp, 'QB1'), 1);
  expect('74452 cnt1=3 QC1=0', getPin(comp, 'QC1'), 0);
  expect('74452 cnt1=3 TC1=0', getPin(comp, 'TC1'), 0);

  // Count section 2 to 9 and check TC2
  setPin(comp, 'CLRn2', 1);
  for (let i = 0; i < 9; i++) {
    setPin(comp, 'CLK2', 1); runGate(comp, gate);
    setPin(comp, 'CLK2', 0); runGate(comp, gate);
  }
  expect('74452 cnt2=9 TC2=1', getPin(comp, 'TC2'), 1);
  expect('74452 cnt2=9 QA2=1', getPin(comp, 'QA2'), 1);
  expect('74452 cnt2=9 QD2=1', getPin(comp, 'QD2'), 1);

  // Count one more → wraps to 0
  setPin(comp, 'CLK2', 1); runGate(comp, gate);
  setPin(comp, 'CLK2', 0); runGate(comp, gate);
  expect('74452 cnt2 wraps TC2=0', getPin(comp, 'TC2'), 0);
  expect('74452 cnt2 wraps QA2=0', getPin(comp, 'QA2'), 0);
}

// ─── 74LS453 - Quad 4-to-1 Mux ───────────────────────────────────────────
{
  const { comp, spec } = makeComp('74LS453');
  const gate = spec.gates[0];

  // sel=1: C1_1, C2_1, C3_1, C4_1 selected
  setPin(comp, 'S0', 1); setPin(comp, 'S1', 0); // sel=1
  for (const n of ['C1_0','C1_1','C1_2','C1_3','C2_0','C2_1','C2_2','C2_3',
                   'C3_0','C3_1','C3_2','C3_3','C4_0','C4_1','C4_2','C4_3']) setPin(comp, n, 0);
  setPin(comp, 'C1_1', 1);
  setPin(comp, 'C3_1', 1);
  runGate(comp, gate);
  expect('74LS453 sel=1 Y1=C1_1=1', getPin(comp, 'Y1'), 1);
  expect('74LS453 sel=1 Y2=C2_1=0', getPin(comp, 'Y2'), 0);
  expect('74LS453 sel=1 Y3=C3_1=1', getPin(comp, 'Y3'), 1);
  expect('74LS453 sel=1 Y4=C4_1=0', getPin(comp, 'Y4'), 0);

  // sel=3
  setPin(comp, 'S0', 1); setPin(comp, 'S1', 1); // sel=3
  setPin(comp, 'C2_3', 1);
  runGate(comp, gate);
  expect('74LS453 sel=3 Y2=C2_3=1', getPin(comp, 'Y2'), 1);
  expect('74LS453 sel=3 Y1=C1_3=0', getPin(comp, 'Y1'), 0);
}

// ─── 74454 - Dual Decade Up/Down Counter ─────────────────────────────────
{
  const { comp, spec } = makeComp('74454');
  const gate = spec.gates[0];

  // Reset
  setPin(comp, 'CLRn', 0); setPin(comp, 'LOADn', 1);
  setPin(comp, 'CLK', 0); setPin(comp, 'CLK2', 0);
  setPin(comp, 'U_Dn', 0); // up
  setPin(comp, 'ENP', 1); setPin(comp, 'ENT', 1); setPin(comp, 'ENP2', 1);
  for (let i = 0; i < 8; i++) setPin(comp, `P${i}`, 0);
  runGate(comp, gate);
  expect('74454 reset Q0=0', getPin(comp, 'Q0'), 0);

  // Count up to 5
  setPin(comp, 'CLRn', 1); setPin(comp, 'ENP', 0); // ENP=0 means disabled (active HIGH)
  // Actually: ENP and ENT are enable inputs; count if ENP=1 AND ENT=1
  setPin(comp, 'ENP', 1); setPin(comp, 'ENT', 1);
  for (let i = 0; i < 5; i++) {
    setPin(comp, 'CLK', 1); runGate(comp, gate);
    setPin(comp, 'CLK', 0); runGate(comp, gate);
  }
  // Count = 5: Q0=1, Q1=0, Q2=1, Q3=0
  expect('74454 cnt=5 Q0=1', getPin(comp, 'Q0'), 1);
  expect('74454 cnt=5 Q2=1', getPin(comp, 'Q2'), 1);
  expect('74454 cnt=5 TCU=0', getPin(comp, 'TCU'), 0);

  // Load value 7
  setPin(comp, 'P0', 1); setPin(comp, 'P1', 1); setPin(comp, 'P2', 1); setPin(comp, 'P3', 0);
  setPin(comp, 'LOADn', 0); runGate(comp, gate);
  setPin(comp, 'LOADn', 1);
  expect('74454 load=7 Q0=1', getPin(comp, 'Q0'), 1);
  expect('74454 load=7 Q1=1', getPin(comp, 'Q1'), 1);
  expect('74454 load=7 Q2=1', getPin(comp, 'Q2'), 1);
  expect('74454 load=7 Q3=0', getPin(comp, 'Q3'), 0);
}

// ─── 74F455 - Octal Buffer w/ Parity (inverting) ─────────────────────────
{
  const { comp, spec } = makeComp('74F455');
  const gate = spec.gates[0];

  // OEn=0, all A=0 → Y outputs all 1 (inverted), 0 ones → even parity → EP=0 no error
  setPin(comp, 'OEn', 0); setPin(comp, 'EP', 0);
  for (let i = 0; i < 8; i++) setPin(comp, `A${i}`, 0);
  runGate(comp, gate);
  expect('74F455 all-0 Y0=1', getPin(comp, 'Y0'), 1);
  expect('74F455 all-0 Y7=1', getPin(comp, 'Y7'), 1);
  expect('74F455 all-0 PERR=0', getPin(comp, 'PERR'), 0);

  // A0=1: 1 one → odd count → EP=0(even expected) → PERR=1
  setPin(comp, 'A0', 1);
  runGate(comp, gate);
  expect('74F455 A0=1 Y0=0 (inverted)', getPin(comp, 'Y0'), 0);
  expect('74F455 A0=1 PERR=1', getPin(comp, 'PERR'), 1);

  // A0=1,A1=1: 2 ones → even → PERR=0
  setPin(comp, 'A1', 1);
  runGate(comp, gate);
  expect('74F455 A0=A1=1 PERR=0', getPin(comp, 'PERR'), 0);

  // OEn=1 → HiZ
  setPin(comp, 'OEn', 1);
  runGate(comp, gate);
  expect('74F455 OEn=1 Y0 HiZ', getPin(comp, 'Y0'), 0.5);
  expect('74F455 OEn=1 PERR HiZ', getPin(comp, 'PERR'), 0.5);
}

// ─── 74F456 - Octal Buffer w/ Parity (non-inverting) ─────────────────────
{
  const { comp, spec } = makeComp('74F456');
  const gate = spec.gates[0];

  // OEn=0, A0=1, rest 0 → Y0=1, odd → EP=0 → PERR=1
  setPin(comp, 'OEn', 0); setPin(comp, 'EP', 0);
  for (let i = 0; i < 8; i++) setPin(comp, `A${i}`, 0);
  setPin(comp, 'A0', 1);
  runGate(comp, gate);
  expect('74F456 A0=1 Y0=1',    getPin(comp, 'Y0'), 1);
  expect('74F456 A0=1 PERR=1',  getPin(comp, 'PERR'), 1);

  // EP=1 (odd parity expected): 1 one → correct → PERR=0
  setPin(comp, 'EP', 1);
  runGate(comp, gate);
  expect('74F456 EP=1 A0=1 PERR=0', getPin(comp, 'PERR'), 0);

  // OEn=1 → HiZ
  setPin(comp, 'OEn', 1);
  runGate(comp, gate);
  expect('74F456 OEn=1 Y0 HiZ', getPin(comp, 'Y0'), 0.5);
}

// ─── 74458 - Nines Complement ────────────────────────────────────────────
{
  const { comp, spec } = makeComp('74458');
  const gate = spec.gates[0];

  // ZEn=1, A=3 → Y = 9-3 = 6 = 0110
  setPin(comp, 'ZEn', 1);
  setPin(comp, 'A0', 1); setPin(comp, 'A1', 1); setPin(comp, 'A2', 0); setPin(comp, 'A3', 0);
  runGate(comp, gate);
  expect('74458 9s-compl(3)=6 Y0=0', getPin(comp, 'Y0'), 0);
  expect('74458 9s-compl(3)=6 Y1=1', getPin(comp, 'Y1'), 1);
  expect('74458 9s-compl(3)=6 Y2=1', getPin(comp, 'Y2'), 1);
  expect('74458 9s-compl(3)=6 Y3=0', getPin(comp, 'Y3'), 0);

  // ZEn=0 → Y=0
  setPin(comp, 'ZEn', 0);
  runGate(comp, gate);
  expect('74458 ZEn=0 Y0=0', getPin(comp, 'Y0'), 0);
  expect('74458 ZEn=0 Y1=0', getPin(comp, 'Y1'), 0);

  // A=9, ZEn=1 → 9-9=0
  setPin(comp, 'ZEn', 1);
  setPin(comp, 'A0', 1); setPin(comp, 'A1', 0); setPin(comp, 'A2', 0); setPin(comp, 'A3', 1);
  runGate(comp, gate);
  expect('74458 9s-compl(9)=0 Y0=0', getPin(comp, 'Y0'), 0);
  expect('74458 9s-compl(9)=0 Y3=0', getPin(comp, 'Y3'), 0);
}

// ─── 74LS460 - 10 bit Comparator ─────────────────────────────────────────
{
  const { comp, spec } = makeComp('74LS460');
  const gate = spec.gates[0];

  // A=B=0b1010101010, OEn=0 → AEQB=1
  setPin(comp, 'OEn', 0);
  for (let i = 0; i < 10; i++) {
    const bit = (i % 2); // alternating
    setPin(comp, `A${i}`, bit);
    setPin(comp, `B${i}`, bit);
  }
  runGate(comp, gate);
  expect('74LS460 A==B AEQB=1', getPin(comp, 'AEQB'), 1);

  // Change A1 to differ
  setPin(comp, 'A1', 0);
  runGate(comp, gate);
  expect('74LS460 A!=B AEQB=0', getPin(comp, 'AEQB'), 0);

  // OEn=1 → HiZ
  setPin(comp, 'OEn', 1);
  runGate(comp, gate);
  expect('74LS460 OEn=1 AEQB HiZ', getPin(comp, 'AEQB'), 0.5);
}

// ─── 74461 - 8 bit Presettable Counter ───────────────────────────────────
{
  const { comp, spec } = makeComp('74461');
  const gate = spec.gates[0];

  // Clear: CLRn=0
  setPin(comp, 'CLRn', 0); setPin(comp, 'LOADn', 1);
  setPin(comp, 'CLK', 0); setPin(comp, 'ENP', 1); setPin(comp, 'ENT', 1); setPin(comp, 'OEn', 0);
  for (let i = 0; i < 8; i++) setPin(comp, `P${i}`, 0);
  runGate(comp, gate);
  expect('74461 clear Q1=0', getPin(comp, 'Q1'), 0);
  expect('74461 clear Q7=0', getPin(comp, 'Q7'), 0);

  // Count to 10
  setPin(comp, 'CLRn', 1);
  for (let i = 0; i < 10; i++) {
    setPin(comp, 'CLK', 1); runGate(comp, gate);
    setPin(comp, 'CLK', 0); runGate(comp, gate);
  }
  // count=10 = 0b00001010; Q1=bit1=1, Q2=bit2=0, Q3=bit3=1
  expect('74461 cnt=10 Q1=1', getPin(comp, 'Q1'), 1);
  expect('74461 cnt=10 Q2=0', getPin(comp, 'Q2'), 0);
  expect('74461 cnt=10 Q3=1', getPin(comp, 'Q3'), 1);

  // Load value 0xA0 = 10100000
  for (let i = 0; i < 8; i++) setPin(comp, `P${i}`, (0xA0 >> i) & 1);
  setPin(comp, 'LOADn', 0); runGate(comp, gate);
  setPin(comp, 'LOADn', 1);
  // 0xA0 = bit5=1,bit7=1; Q1=bit1=0, Q5=bit5=1
  expect('74461 load=0xA0 Q5=1', getPin(comp, 'Q5'), 1);
  expect('74461 load=0xA0 Q1=0', getPin(comp, 'Q1'), 0);

  // OEn=1 → HiZ
  setPin(comp, 'OEn', 1); runGate(comp, gate);
  expect('74461 OEn=1 Q1 HiZ', getPin(comp, 'Q1'), 0.5);

  // Count to 0xFF and check RCO
  setPin(comp, 'OEn', 0); setPin(comp, 'CLRn', 0); runGate(comp, gate); setPin(comp, 'CLRn', 1);
  // Set cnt=0xFE (254) via state
  comp.state.cnt = 254;
  setPin(comp, 'CLK', 1); runGate(comp, gate);
  setPin(comp, 'CLK', 0); runGate(comp, gate);
  // cnt should be 255 = 0xFF → RCO=1
  expect('74461 cnt=255 RCO=1', getPin(comp, 'RCO'), 1);
}

// ─── Summary ──────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
