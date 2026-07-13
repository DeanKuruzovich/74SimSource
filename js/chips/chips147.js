// chips147.js  Block 147: CMOS 4000-series coverage expansion (Batch 13, Math).
// Single-chip block: CD40181 (4-bit 16-function ALU), authored standalone to
// avoid colliding with other agents editing the shared chip files.
//
// Pinout + behavior verified against the chip's OWN datasheet (issues.md C2:
// never copy a sibling's pin map; issues.md C4: never trust a PDF text summary —
// read the rendered page images):
//
//   Source: RCA Solid State, "CD40181B Types — COS/MOS 4-Bit Arithmetic Logic
//     Unit, High-Voltage Types (20-Volt Rating)", file no. 989, in "1980 RCA
//     COS/MOS Integrated Circuits" databook, p. 419 (1980). [Online]. Available:
//     https://bitsavers.trailing-edge.com/components/rca/_dataBooks/1980_RCA_COS_MOS_Integrated_Circuits.pdf
//     Verified: terminal assignment read from BOTH the "Active-low data" and
//     "Active-high data" FUNCTIONAL DIAGRAMs (page 419), rendered at 400-dpi as
//     PDF page images. Both diagrams give the identical physical pin map:
//     B0=1, A0=2, S3=3, S2=4, S1=5, S0=6, Cn=7, M=8, F0=9, F1=10, F2=11, VSS=12,
//     F3=13, A=B=14, P=15, Cn+4=16, G=17, B3=18, A3=19, B2=20, A2=21, B1=22,
//     A1=23, VDD=24. The datasheet text states "The CD40181 is similar to
//     industry types MC14581 and 74181," and that operation "may be interpreted
//     with either active-low or active-high data ... by using the appropriate
//     truth table."
//
//   Cross-reference (function table / active-high vs active-low convention):
//     Texas Instruments, "SN54181, SN54LS181, SN54S181, SN74181, SN74LS181,
//     SN74S181 — Arithmetic Logic Units/Function Generators", (Dec. 1972, rev.
//     Dec. 1983). [Online]. Available:
//     https://doctor-pasquale.com/wp-content/uploads/2017/05/74181-ALU.pdf
//     Verified: identical 24-pin terminal assignment (J/N package, top view) and
//     Table 2 "ACTIVE-HIGH DATA" function table, read as PDF page images (pp.
//     3-709..3-711). Used to confirm the active-HIGH function set that the
//     74Sim ALU_4BIT engine primitive implements (logic + arithmetic columns).
//
// The 40181 is the CMOS twin of the 74181, so it reuses the existing ALU_4BIT
// engine primitive (js/specificChipsSim.js _evaluateAlu4Bit) with NO engine
// work — already driven by the pre-existing 74x181 entry. The primitive models
// the ACTIVE-HIGH data convention (datasheet Figure 2 / TI Table 2).

export const CHIPS_BLOCK_147 = {

  // ── CD40181: COS/MOS 4-bit ALU / function generator (24-pin) ───────────────
  'CD40181': {
    name: 'CD40181',
    simpleName: '4 bit ALU',
    description: 'CMOS 4-bit ALU / function generator, carry look-ahead (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    datasheet: 'https://bitsavers.trailing-edge.com/components/rca/_dataBooks/1980_RCA_COS_MOS_Integrated_Circuits.pdf',
    tags: ['cmos', '4000 series', 'alu', 'arithmetic', 'logic', '4 bit', 'combinational', 'carry lookahead'],
    guideOverview: 'The CD40181 is the CMOS version of the classic 74181 arithmetic logic unit. It performs 16 arithmetic operations (add, subtract, increment, shift left, and more) and 16 logic operations (AND, OR, XOR, NOT, and more) on two 4 bit operands A and B. The four select pins S0 to S3 pick the operation, and the mode pin M chooses between the arithmetic and logic groups. Carry look ahead outputs P and G let several chips chain into a wider, faster ALU using the CD40182 carry generator. Being CMOS, it runs from 3 V to 18 V and draws almost no current when idle.',
    guidePinDescriptions: {
      'B0':   'Operand B bit 0 (LSB).',
      'A0':   'Operand A bit 0 (LSB).',
      'S3':   'Function select bit 3 (MSB); one of four bits choosing the operation.',
      'S2':   'Function select bit 2.',
      'S1':   'Function select bit 1.',
      'S0':   'Function select bit 0 (LSB).',
      'Cn':   'Carry input; carry in from a less significant 4 bit stage (used in arithmetic mode, ignored in logic mode).',
      'M':    'Mode control. HIGH selects the 16 logic operations (carry ignored); LOW selects the 16 arithmetic operations (carry used).',
      'F0':   'Result output bit 0 (LSB).',
      'F1':   'Result output bit 1.',
      'F2':   'Result output bit 2.',
      'F3':   'Result output bit 3 (MSB).',
      'AeqB': 'Equality output; HIGH when A equals B (decoded from the result in subtract mode).',
      'P':    'Carry propagate output; feeds a CD40182 look ahead carry generator.',
      'Cn4':  'Ripple carry output from bit 3; carry out to the next more significant stage.',
      'G':    'Carry generate output; feeds a CD40182 look ahead carry generator.',
      'B3':   'Operand B bit 3 (MSB).',
      'A3':   'Operand A bit 3 (MSB).',
      'B2':   'Operand B bit 2.',
      'A2':   'Operand A bit 2.',
      'B1':   'Operand B bit 1.',
      'A1':   'Operand A bit 1.',
    },
    guideSections: [
      {
        title: 'Choosing an Operation',
        paragraphs: [
          'The operation is set by the mode pin M and the four select pins S0 to S3. With M HIGH the chip does one of 16 logic functions of A and B (for example AND, OR, XOR, NOT A) and the carry input is ignored. With M LOW it does one of 16 arithmetic functions (for example A plus B, A minus B, A plus 1) and the carry input Cn is added in. S0 to S3 pick which of the 16 functions runs in the selected group.',
        ],
      },
      {
        title: 'Carry Look Ahead',
        paragraphs: [
          'For a single 4 bit slice you can use the ripple carry output Cn4 directly. To build a wider ALU without waiting for the carry to ripple through every stage, the propagate (P) and generate (G) outputs feed a CD40182 look ahead carry generator, which works out all the carries at once. This is how 8, 12, or 16 bit ALUs are built from several CD40181 chips.',
        ],
      },
      {
        title: 'Active-High and Active-Low Data',
        paragraphs: [
          'The datasheet defines the chip for two conventions: active-high data (a HIGH pin means a 1) and active-low data (a LOW pin means a 1), each with its own function table. 74Sim models the active-high convention, so the operation names above match what you see when a HIGH input represents a 1.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'B0',   type: 'input',  description: 'Operand B bit 0 (LSB)' },
      { pin:  2, name: 'A0',   type: 'input',  description: 'Operand A bit 0 (LSB)' },
      { pin:  3, name: 'S3',   type: 'input',  description: 'Function select bit 3 (MSB)' },
      { pin:  4, name: 'S2',   type: 'input',  description: 'Function select bit 2' },
      { pin:  5, name: 'S1',   type: 'input',  description: 'Function select bit 1' },
      { pin:  6, name: 'S0',   type: 'input',  description: 'Function select bit 0 (LSB)' },
      { pin:  7, name: 'Cn',   type: 'input',  description: 'Carry input from less significant stage' },
      { pin:  8, name: 'M',    type: 'input',  description: 'Mode: HIGH = logic, LOW = arithmetic' },
      { pin:  9, name: 'F0',   type: 'output', description: 'Result bit 0 (LSB)' },
      { pin: 10, name: 'F1',   type: 'output', description: 'Result bit 1' },
      { pin: 11, name: 'F2',   type: 'output', description: 'Result bit 2' },
      { pin: 12, name: 'GND',  type: 'power',  description: 'Ground reference (VSS)' },
      { pin: 13, name: 'F3',   type: 'output', description: 'Result bit 3 (MSB)' },
      { pin: 14, name: 'AeqB', type: 'output', description: 'A equals B (HIGH when equal)' },
      { pin: 15, name: 'P',    type: 'output', description: 'Carry propagate (for CD40182)' },
      { pin: 16, name: 'Cn4',  type: 'output', description: 'Ripple carry output from bit 3' },
      { pin: 17, name: 'G',    type: 'output', description: 'Carry generate (for CD40182)' },
      { pin: 18, name: 'B3',   type: 'input',  description: 'Operand B bit 3 (MSB)' },
      { pin: 19, name: 'A3',   type: 'input',  description: 'Operand A bit 3 (MSB)' },
      { pin: 20, name: 'B2',   type: 'input',  description: 'Operand B bit 2' },
      { pin: 21, name: 'A2',   type: 'input',  description: 'Operand A bit 2' },
      { pin: 22, name: 'B1',   type: 'input',  description: 'Operand B bit 1' },
      { pin: 23, name: 'A1',   type: 'input',  description: 'Operand A bit 1' },
      { pin: 24, name: 'VCC',  type: 'power',  description: 'Positive supply (VDD), 3 V to 18 V' },
    ],
    // Reuses the existing ALU_4BIT primitive (active-HIGH data convention,
    // datasheet Fig. 2 / TI Table 2). Same input/output pin-name contract as the
    // 74x181 entry — verified in js/specificChipsSim.js _evaluateAlu4Bit.
    gates: [
      { type: 'ALU_4BIT', inputs: ['A0','A1','A2','A3','B0','B1','B2','B3','S0','S1','S2','S3','M','Cn'], outputs: ['F0','F1','F2','F3','Cn4','P','G','AeqB'] },
    ],
  },

};
