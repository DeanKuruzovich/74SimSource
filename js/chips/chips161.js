// chips161.js — CMOS 4000-series coverage expansion
// CD4554: 2-bit by 2-bit parallel binary multiplier (with add/cascade inputs).
// Shipped in its own standalone block (CHIPS_BLOCK_161) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_161 = {
  // ── CD4554: 2x2 parallel binary multiplier (16-pin) ─────────────────────────
  /* Source: Motorola, "MC14554B — 2-Bit by 2-Bit Parallel Binary Multiplier",
     document MC14554B/D, Rev 3 (1/94). [Online]. Available (rendered page images):
     https://www.alldatasheet.com/datasheet-pdf/pdf/3687/MOTOROLA/MC14554B.html
     Verified: PIN ASSIGNMENT, EQUATIONS block + worked example (page 1) and the
     gate-level LOGIC DIAGRAM with the MULTIPLIER CELL detail (page 3), read as
     rendered PDF page images with the Read tool (NOT the text summarizer — see
     issues.md C4), and NOT cloned from the 74261 MULT_2X4BIT primitive (issues.md
     C2) — the CD4554 is a different size (2x2) with a different pin/IO contract.

     "CD4554" is the generic catalog name for this 2x2 multiplier; the surviving
     primary datasheet is the Motorola/onsemi MC14554B (the onsemi-hosted PDF is
     Akamai bot-blocked to curl, same as issues.md C9/C10, so the verified read
     came from the alldatasheet page-image mirror of the original Motorola sheet).

     Pinout (TOP VIEW), DIP-16, from the page-1 PIN ASSIGNMENT:
        1 Y1     16 VDD
        2 M0     15 Y0
        3 M1     14 X0
        4 C0     13 X1
        5 M2     12 K0
        6 C1(S3) 11 S0
        7 S2     10 K1
        8 VSS     9 S1
     Operands: X = X1X0, Y = Y1Y0 (each 2-bit). Add/cascade inputs: K = K1K0,
     M = M2 M1 M0. Outputs: the 4-bit product/sum S3 S2 S1 S0 (pin 6 is the MSB
     S3, also labelled C1) plus the expansion carry C0 (pin 4).

     Behavior (page-1 EQUATIONS + page-3 logic diagram): S = (X x Y) + K + M.
     Each MULTIPLIER CELL is a full adder of {Xi*Yj, M, K}: S=(Xi*Yj)^M^K,
     C=majority(Xi*Yj,M,K). Cell partial-product weights are TR=X0Y0:1,
     TL=X0Y1:2, BR=X1Y0:2, BL=X1Y1:4; the carry chain is TR.C->TL.K,
     TL.C->C0(out), BR.C->BL.K, BL.C->S3. C0 is the top weight-4 carry brought
     out for expansion; the datasheet note "C0 connected to M2 for this size
     multiplier" is an EXTERNAL wire the user adds for a standalone 2x2, so the
     part itself keeps C0 and M2 as independent pins (the model is therefore pure
     combinational, no internal loop). Worked-example check (datasheet): X=2,Y=3,
     K=1,M=2 -> S=1001 (=9). Only divergence vs silicon is the engine-wide
     A1 no-propagation-delay idealization; settled outputs are exact. */
  'CD4554': {
    name: 'CD4554',
    simpleName: '2x2 Binary Multiplier',
    description: '2x2-bit parallel binary multiplier, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.alldatasheet.com/datasheet-pdf/pdf/3687/MOTOROLA/MC14554B.html',
    tags: ['cmos', '4000 series', 'multiplier', 'arithmetic', '2x2', 'binary multiplier'],
    guideOverview: 'The CD4554 multiplies two 2-bit numbers and adds two more numbers to the result, all at once with no clock. You give it X (the two bits X1 X0) and Y (the two bits Y1 Y0); it works out X times Y. It also has two extra input groups, K (K1 K0) and M (M2 M1 M0), that get added on top, so the full job it does is S = X*Y + K + M. The answer comes out as the four bits S3 S2 S1 S0, with a separate carry bit C0 for building bigger multipliers. The K and M inputs let you chain several of these chips together to multiply wider numbers. To use one chip on its own, tie the C0 output to the M2 input as the datasheet shows.',
    guidePinDescriptions: {
      'X0': 'Multiplicand bit 0 (least significant of X), pin 14.',
      'X1': 'Multiplicand bit 1 (most significant of X), pin 13.',
      'Y0': 'Multiplier bit 0 (least significant of Y), pin 15.',
      'Y1': 'Multiplier bit 1 (most significant of Y), pin 1.',
      'K0': 'Add/cascade input bit 0 (weight 1), pin 12. Part of K = K1 K0.',
      'K1': 'Add/cascade input bit 1 (weight 2), pin 10.',
      'M0': 'Add/cascade input bit 0 (weight 1), pin 2. Part of M = M2 M1 M0.',
      'M1': 'Add/cascade input bit 1 (weight 2), pin 3.',
      'M2': 'Add/cascade input bit 2 (weight 4), pin 5. For a standalone 2x2 multiply, wire this to the C0 output (pin 4).',
      'S0': 'Result bit 0 (least significant), pin 11.',
      'S1': 'Result bit 1, pin 9.',
      'S2': 'Result bit 2, pin 7.',
      'S3': 'Result bit 3 (most significant), pin 6. Also labelled C1 on the datasheet.',
      'C0': 'Expansion carry out, pin 4. Tie to M2 for a single-chip 2x2 multiply, or feed it to the next stage when cascading.',
      'VSS': 'Ground / negative supply (pin 8).',
      'VDD': 'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: 'What it computes',
        paragraphs: [
          'The chip forms S = X*Y + K + M in one step. X and Y are each 2-bit numbers (so X*Y can be 0 to 9). K is the 2-bit number K1 K0 and M is the 3-bit number M2 M1 M0; both are simply added to the product. The result appears on S3 S2 S1 S0 (S0 is the least significant bit) with C0 as the carry beyond bit 3.',
          'For example, with X = 2 (10), Y = 3 (11), K = 1 (01) and M = 2 (010), the output is S = 6 + 1 + 2 = 9, which reads 1001 on S3 S2 S1 S0.',
        ],
      },
      {
        title: 'Using it alone vs. cascading',
        paragraphs: [
          'The K and M inputs exist so several chips can be wired into a larger multiplier: the carry and partial-sum lines of one stage drive the K and M inputs of the next. For a single chip doing a plain 2-bit by 2-bit multiply, connect the C0 output (pin 4) to the M2 input (pin 5) as the datasheet specifies, and drive the other K and M pins as needed (or hold them LOW to get just X*Y).',
        ],
        note: 'Like every part here, switching is treated as instantaneous — real propagation delay through the multiplier array is not modeled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Y1',  type: 'input'  },
      { pin:  2, name: 'M0',  type: 'input'  },
      { pin:  3, name: 'M1',  type: 'input'  },
      { pin:  4, name: 'C0',  type: 'output' },
      { pin:  5, name: 'M2',  type: 'input'  },
      { pin:  6, name: 'S3',  type: 'output' },
      { pin:  7, name: 'S2',  type: 'output' },
      { pin:  8, name: 'VSS', type: 'power'  },
      { pin:  9, name: 'S1',  type: 'output' },
      { pin: 10, name: 'K1',  type: 'input'  },
      { pin: 11, name: 'S0',  type: 'output' },
      { pin: 12, name: 'K0',  type: 'input'  },
      { pin: 13, name: 'X1',  type: 'input'  },
      { pin: 14, name: 'X0',  type: 'input'  },
      { pin: 15, name: 'Y0',  type: 'input'  },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      // MULT_2X2_4554 input contract: [X0, X1, Y0, Y1, K0, K1, M0, M1, M2]
      // output contract:             [S0, S1, S2, S3, C0]
      // Computes S = X*Y + K + M as the page-3 carry-save cell array (see the
      // evaluator + header comment for the full per-cell derivation).
      {
        type: 'MULT_2X2_4554',
        inputs: ['X0', 'X1', 'Y0', 'Y1', 'K0', 'K1', 'M0', 'M1', 'M2'],
        outputs: ['S0', 'S1', 'S2', 'S3', 'C0'],
      },
    ],
  },
};
