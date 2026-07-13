// chips141.js — CMOS 4000-series coverage expansion
// CD40147B: 10-line to 4-line BCD priority encoder, all inputs and outputs
// active LOW. Shipped in its own standalone block (CHIPS_BLOCK_141) to avoid
// collisions with the other concurrent chip-add agents sharing this working
// directory.

export const CHIPS_BLOCK_141 = {
  // ── CD40147B: 10-to-4 BCD priority encoder, active-LOW in/out (16-pin) ──────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD40147B Types — 10-Line to 4-Line BCD Priority Encoder", SCHS102C
     (revised October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd40147b.pdf
     Verified: terminal assignment (page 3, "CD40147B TERMINAL ASSIGNMENT,
     TOP VIEW"), the Fig. 1 logic diagram + FUNCTIONAL GATING pin callouts
     (page 1), the negative-logic TRUTH TABLE (page 1), and the Features /
     part description (page 1), all read as rendered PDF page images (Read with
     pages:, NOT the text summarizer — see issues.md C4), and NOT cloned from
     the TTL 74x147 sibling (issues.md C2).

     Verified pinout (TOP VIEW), confirmed by BOTH the terminal-assignment
     diagram and the Fig. 1 functional-gating pin numbers, which agree:
       pin  1 = 4   (data input, decimal 4, active LOW)
       pin  2 = 5   (data input, decimal 5)
       pin  3 = 6   (data input, decimal 6)
       pin  4 = 7   (data input, decimal 7)
       pin  5 = 8   (data input, decimal 8)
       pin  6 = C   (BCD output, weight 4, active LOW)
       pin  7 = B   (BCD output, weight 2, active LOW)
       pin  8 = VSS (ground / negative supply)
       pin  9 = A   (BCD output, weight 1 / LSB, active LOW)
       pin 10 = 9   (data input, decimal 9, HIGHEST priority)
       pin 11 = 1   (data input, decimal 1, lowest of 1-9)
       pin 12 = 2   (data input, decimal 2)
       pin 13 = 3   (data input, decimal 3)
       pin 14 = D   (BCD output, weight 8 / MSB, active LOW)
       pin 15 = 0   (data input, decimal 0, lowest priority)
       pin 16 = VDD (positive supply)

     KEY DIFFERENCE vs the TTL 74x147 (which is why this is NOT a clone): the
     74147 has NO input-0 pin and pin 15 is N/C. The CD40147B brings out a real
     decimal-0 input on pin 15. The TI description states the part "is
     functionally similar to the TTL 54/74147 if pin 15 is tied low." See the
     ENGINE-CONTRACT note on gates[] below for why input 0 is electrically a
     no-op for the BCD output, so the shared PRIORITY_ENC_10TO4 primitive (which
     only takes I1..I9) reproduces the truth table exactly. Logged as issues.md
     C-series divergence.

     Behavior (datasheet TRUTH TABLE, negative logic where the table prints
     0 = High level, 1 = Low level — i.e. an input is ASSERTED when LOW): the
     highest-numbered asserted data line wins; its decimal value 0-9 appears on
     D C B A as active-LOW (inverted) BCD. With no line 1-9 asserted the output
     is decimal 0 (D C B A = HIGH HIGH HIGH HIGH), exactly as when only line 0
     is asserted — so line 0 never changes the output. Output weights: A=1 (LSB),
     B=2, C=4, D=8 (MSB). */
  'CD40147': {
    name: 'CD40147',
    simpleName: '10-to-4 Priority Encoder (BCD)',
    description: '10-to-4 (decimal-BCD) priority encoder, active-LOW I/O, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40147b.pdf',
    tags: ['cmos', '4000 series', 'encoder', 'priority', 'bcd', '10-to-4', 'active low', 'decimal'],
    guideOverview: 'The CD40147 takes ten request lines, numbered 0 through 9, and outputs the BCD code of the highest-numbered line that is asserted. Every input and every output is active LOW: a line is "asserted" when you pull it LOW, and the four-bit output is the complement of the normal BCD value. Line 9 has the highest priority and line 0 the lowest, so if lines 3 and 7 are both LOW the chip ignores line 3 and encodes 7. When none of lines 1 through 9 is asserted the output reads decimal 0. This is the CMOS version of the older TTL 74147; the one real difference is that the CD40147 brings out an actual line-0 input pin (the 74147 left it implicit), though that pin never changes the output. There is no enable pin, so to build a wider encoder you add external gates.',
    guidePinDescriptions: {
      I0: 'Data input for decimal 0 (active LOW, lowest priority), pin 15. Asserting it does not change the output, because "only line 0" and "no line" both encode decimal 0.',
      I1: 'Data input for decimal 1 (active LOW), pin 11. Lowest priority of lines 1-9.',
      I2: 'Data input for decimal 2 (active LOW), pin 12.',
      I3: 'Data input for decimal 3 (active LOW), pin 13.',
      I4: 'Data input for decimal 4 (active LOW), pin 1.',
      I5: 'Data input for decimal 5 (active LOW), pin 2.',
      I6: 'Data input for decimal 6 (active LOW), pin 3.',
      I7: 'Data input for decimal 7 (active LOW), pin 4.',
      I8: 'Data input for decimal 8 (active LOW), pin 5.',
      I9: 'Data input for decimal 9 (active LOW, highest priority), pin 10.',
      A0n: 'BCD output bit A (LSB, weight 1), active LOW, pin 9.',
      A1n: 'BCD output bit B (weight 2), active LOW, pin 7.',
      A2n: 'BCD output bit C (weight 4), active LOW, pin 6.',
      A3n: 'BCD output bit D (MSB, weight 8), active LOW, pin 14.',
      VSS: 'Ground / negative supply (0 V), pin 8.',
      VDD: 'Positive supply, pin 16.',
    },
    guideSections: [
      {
        title: 'Priority encoding',
        paragraphs: [
          'All inputs are active LOW, so pull a line LOW to request it. When several lines are LOW at once, the highest-numbered one wins and the others are ignored. The four outputs carry that winner\'s decimal value as BCD, but in active-LOW form, meaning each output bit is the inverse of the normal BCD bit. Invert all four outputs to read standard positive-logic BCD.',
        ],
        list: [
          'Line 9 LOW (any others) -> D C B A = LOW HIGH HIGH LOW (decimal 9)',
          'Line 8 LOW, line 9 HIGH -> D C B A = LOW HIGH HIGH HIGH (decimal 8)',
          'No line 1-9 LOW -> D C B A = HIGH HIGH HIGH HIGH (decimal 0)',
        ],
        note: 'There is no enable input. Cascading to more than ten lines needs external logic.',
      },
      {
        title: 'The line-0 input',
        paragraphs: [
          'Unlike the TTL 74147, this part has a real input pin for line 0. It is the lowest priority line, and because both "only line 0 asserted" and "nothing asserted" encode to decimal 0, asserting line 0 never changes the output. The pin exists so all ten decimal lines have a physical connection. The datasheet notes the chip behaves like a 74147 if this pin is tied LOW.',
        ],
      },
      {
        title: 'Active-LOW output convention',
        paragraphs: [
          'The outputs A, B, C, D (weights 1, 2, 4, 8) are the complement of the encoded value. Feed them to inverters, or to a device that expects active-LOW BCD, to recover the normal code.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'I4',  type: 'input',  description: 'Data input decimal 4 (active LOW)' },
      { pin:  2, name: 'I5',  type: 'input',  description: 'Data input decimal 5 (active LOW)' },
      { pin:  3, name: 'I6',  type: 'input',  description: 'Data input decimal 6 (active LOW)' },
      { pin:  4, name: 'I7',  type: 'input',  description: 'Data input decimal 7 (active LOW)' },
      { pin:  5, name: 'I8',  type: 'input',  description: 'Data input decimal 8 (active LOW)' },
      { pin:  6, name: 'A2n', type: 'output', description: 'BCD output C (weight 4, active LOW)' },
      { pin:  7, name: 'A1n', type: 'output', description: 'BCD output B (weight 2, active LOW)' },
      { pin:  8, name: 'VSS', type: 'power',  description: 'Ground / negative supply (0 V)' },
      { pin:  9, name: 'A0n', type: 'output', description: 'BCD output A (LSB, weight 1, active LOW)' },
      { pin: 10, name: 'I9',  type: 'input',  description: 'Data input decimal 9 (active LOW, highest priority)' },
      { pin: 11, name: 'I1',  type: 'input',  description: 'Data input decimal 1 (active LOW)' },
      { pin: 12, name: 'I2',  type: 'input',  description: 'Data input decimal 2 (active LOW)' },
      { pin: 13, name: 'I3',  type: 'input',  description: 'Data input decimal 3 (active LOW)' },
      { pin: 14, name: 'A3n', type: 'output', description: 'BCD output D (MSB, weight 8, active LOW)' },
      { pin: 15, name: 'I0',  type: 'input',  description: 'Data input decimal 0 (active LOW, lowest priority; does not affect output)' },
      { pin: 16, name: 'VDD', type: 'power',  description: 'Positive supply' },
    ],
    gates: [
      // ENGINE CONTRACT — PRIORITY_ENC_10TO4 (js/specificChipsSim.js
      // _evaluatePriorityEnc10to4): inputs are [I1..I9], all active LOW, with I9
      // the highest priority; outputs are [A0n,A1n,A2n,A3n], active-LOW inverted
      // BCD (A0n=LSB weight1 ... A3n=MSB weight8). The primitive treats decimal 0
      // as implicit (no I0 input).
      //
      // The CD40147B's physical line-0 pin (pin 15, I0) is intentionally NOT
      // wired to the gate: line 0 is the lowest priority, and decimal 0 is the
      // output both when only line 0 is asserted AND when nothing is asserted, so
      // I0 can never change the four output bits. Omitting it reproduces the
      // datasheet truth table exactly. (See header note + issues.md.)
      { type: 'PRIORITY_ENC_10TO4', inputs: ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9'], outputs: ['A0n', 'A1n', 'A2n', 'A3n'] },
    ],
  },
};
