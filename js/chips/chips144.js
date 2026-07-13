// chips144.js — CMOS 4000-series coverage expansion
// CD4032: triple serial adder (three 1-bit serial full adders, common clock).
// Shipped in its own standalone block (CHIPS_BLOCK_144) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_144 = {
  // ── CD4032: triple serial adder (16-pin) ──────────────────────────────────
  /* Primary source: SGS-Thomson Microelectronics, "HCC/HCF4032B HCC/HCF4038B
     Triple Serial Adders", doc 5-2677 (June 1989). [Online]. Available:
     https://www.sm0vpo.com/_pdf/CD/CD_4032.pdf
     Verified: PIN CONNECTIONS (page 1), FUNCTIONAL DIAGRAM (page 2) and the
     LOGIC AND TIMING DIAGRAM (page 3), all read as rendered PDF page images —
     NOT a text summariser (issues.md C4) and NOT cloned from the 74385 quad
     serial adder, whose pin map and INVERT semantics differ (issues.md C2).

     The TI cd4032b.pdf / cd4038b.pdf symlinks 404 (legacy RCA-origin part, same
     situation as the CD4000/CD4531/CD4095). The SGS-Thomson HCC/HCF4032B is the
     pin-compatible industry second source; the CD4032B and HCF4032B share the
     identical DIP-16 terminal assignment and function.

     Verified pinout (page 1 PIN CONNECTIONS, cross-checked vs page 2 FUNCTIONAL
     DIAGRAM pin numbers): 1=SUM3, 2=INVERT3, 3=CLOCK, 4=SUM2, 5=INVERT2,
     6=CARRY RESET, 7=INVERT1, 8=VSS, 9=SUM1, 10=A1, 11=B1, 12=B2, 13=A2,
     14=B3, 15=A3, 16=VDD. (Adder1: A1=10,B1=11,INV1=7,SUM1=9; Adder2:
     A2=13,B2=12,INV2=5,SUM2=4; Adder3: A3=15,B3=14,INV3=2,SUM3=1.)

     Behaviour (page 1 DESCRIPTION + page 3 timing): three serial adders share
     one CLOCK and one CARRY-RESET. Data words enter LSB first. Each output is
     the mod-2 sum of the two input bits plus the carry stored from the previous
     bit position. "When the [INVERT] command signal is a logical 1, the sum is
     complemented." The carry is added only on the POSITIVE-going clock edge for
     the 4032B (the 4038B uses the negative edge). CARRY-RESET driven HIGH one
     bit-position before the first bit of the next word clears the stored carry
     to 0. The page-3 worked example confirms the INVERT = complemented-sum
     semantics: WORD3+WORD4 = -37 + -50 produces the complemented-sum -87. */
  'CD4032': {
    name: 'CD4032',
    simpleName: 'Triple Serial Adder',
    sequential: true,
    description: 'triple serial adder: three 1-bit full adders, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.sm0vpo.com/_pdf/CD/CD_4032.pdf',
    tags: ['cmos', '4000 series', 'serial adder', 'adder', 'arithmetic', 'triple', 'serial arithmetic'],
    guideOverview: 'The CD4032 holds three separate serial adders that share one clock and one carry-reset line. A serial adder adds two numbers one bit at a time, lowest bit first, instead of all bits at once. Each adder takes two data inputs (A and B), adds the two bits plus the carry left over from the previous bit, and produces one sum bit. The leftover carry is stored in a flip-flop and used on the next clock. Each adder also has an INVERT input: hold it HIGH and that adder\'s sum output comes out flipped, which is how you build subtraction. Three adders in one package let you run three separate bit-by-bit additions at the same time.',
    guidePinDescriptions: {
      'A1': 'Serial data input A for adder 1. Feed the first number one bit per clock, least significant bit first. Pin 10.',
      'B1': 'Serial data input B for adder 1. Feed the second number, lined up bit-for-bit with A1. Pin 11.',
      'INV1': 'Invert command for adder 1. LOW = true sum. HIGH = the sum output is complemented (each output bit flipped). Pin 7.',
      'SUM1': 'Serial sum output for adder 1. The running bit-by-bit sum, least significant bit first. Pin 9.',
      'A2': 'Serial data input A for adder 2. Pin 13.',
      'B2': 'Serial data input B for adder 2. Pin 12.',
      'INV2': 'Invert command for adder 2. Pin 5.',
      'SUM2': 'Serial sum output for adder 2. Pin 4.',
      'A3': 'Serial data input A for adder 3. Pin 15.',
      'B3': 'Serial data input B for adder 3. Pin 14.',
      'INV3': 'Invert command for adder 3. Pin 2.',
      'SUM3': 'Serial sum output for adder 3. Pin 1.',
      'CLK': 'Common clock for all three adders. The stored carry is updated on the rising edge. Pin 3.',
      'CR': 'Common carry-reset. Drive HIGH for one bit-time before a new pair of words to clear all three stored carries to 0. Pin 6.',
      'GND': 'Ground (VSS, 0 V). Connect to the negative supply rail. Pin 8.',
      'VDD': 'Positive supply. Accepts 3 V to 18 V. Pin 16.',
    },
    pinout: [
      { pin:  1, name: 'SUM3', type: 'output' },
      { pin:  2, name: 'INV3', type: 'input'  },
      { pin:  3, name: 'CLK',  type: 'input'  },
      { pin:  4, name: 'SUM2', type: 'output' },
      { pin:  5, name: 'INV2', type: 'input'  },
      { pin:  6, name: 'CR',   type: 'input'  },
      { pin:  7, name: 'INV1', type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'SUM1', type: 'output' },
      { pin: 10, name: 'A1',   type: 'input'  },
      { pin: 11, name: 'B1',   type: 'input'  },
      { pin: 12, name: 'B2',   type: 'input'  },
      { pin: 13, name: 'A2',   type: 'input'  },
      { pin: 14, name: 'B3',   type: 'input'  },
      { pin: 15, name: 'A3',   type: 'input'  },
      { pin: 16, name: 'VDD',  type: 'power'  },
    ],
    gates: [
      // SERIAL_ADDER_TRIPLE_4032 (js/specificChipsSim.js). Three serial full
      // adders sharing CLOCK + CARRY-RESET. inputs grouped per adder:
      // [A1,B1,INV1, A2,B2,INV2, A3,B3,INV3, CARRY_RESET, CLOCK];
      // outputs [SUM1,SUM2,SUM3]. SUM is combinational (A^B^carry then ^INVERT);
      // each carry flip-flop captures the carry-out on the rising CLOCK edge,
      // and CARRY-RESET HIGH clears it. Distinct from the 74385
      // SERIAL_ADDER_QUAD primitive (which inverts the B input for subtract and
      // has no carry-reset) — see issues.md.
      {
        type: 'SERIAL_ADDER_TRIPLE_4032',
        inputs:  ['A1','B1','INV1', 'A2','B2','INV2', 'A3','B3','INV3', 'CR', 'CLK'],
        outputs: ['SUM1','SUM2','SUM3'],
      },
    ],
    guideSections: [
      {
        title: 'How serial addition works',
        paragraphs: [
          'A normal (parallel) adder takes all the bits of both numbers at once and produces the whole answer. A serial adder instead works one bit per clock, starting from the least significant bit, the same way you add by hand from the right-hand column. It needs only a single 1-bit adder plus a flip-flop to remember the carry, so it is small at the cost of taking one clock per bit.',
          'On each clock the adder adds the current A bit, the current B bit, and the carry left over from the previous bit. It outputs the sum bit and stores the new carry for next time. Send in your two numbers as bit streams, lowest bit first, and read the answer off the SUM output as a bit stream in the same order.',
          'Before adding a fresh pair of numbers, pulse CARRY-RESET HIGH for one bit-time so a leftover carry from the previous sum does not corrupt the new one. The clock and carry-reset are shared by all three adders.',
        ],
        list: [
          'Three independent adders: run three separate bit-serial additions in parallel off one clock.',
          'INVERT input: hold it HIGH to flip an adder\'s sum output, the building block for serial subtraction (add one number to the complement of the other).',
          'Trade-off: a serial adder uses far fewer gates than a parallel adder but needs one clock cycle per bit.',
        ],
        formulas: [
          'SUM bit = A XOR B XOR carry_in, then complemented if INVERT = 1',
          'next carry = majority(A, B, carry_in) = (A·B) + (A·carry_in) + (B·carry_in)',
          'CARRY-RESET = 1 → stored carry cleared to 0',
        ],
      },
    ],
  },
};
