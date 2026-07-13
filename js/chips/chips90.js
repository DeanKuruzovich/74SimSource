// chips90.js — CMOS 4000-series coverage expansion (Batch 10)
// CD4028: BCD-to-decimal / binary-to-octal decoder (1-of-10, active-HIGH out).
// Shipped in its own standalone block (CHIPS_BLOCK_90) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_90 = {
  // ── CD4028: BCD-to-decimal / binary-to-octal decoder (16-pin) ────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4028B Types — BCD-to-Decimal Decoder", SCHS033C
     (revised October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4028b.pdf
     Pinout verified against the CD4028B Terminal Diagram (TOP VIEW) AND the
     Functional Diagram, both read directly from the rendered PDF pages — not
     cloned from the active-LOW 7442 sibling (see issues.md C2). Outputs are
     ACTIVE HIGH (Table I: selected output = HIGH "I", all others LOW). */
  'CD4028': {
    name: 'CD4028',
    simpleName: 'BCD-to-Decimal Decoder',
    description: 'BCD-to-decimal/binary-to-octal decoder, active-HIGH, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4028b.pdf',
    tags: ['cmos', '4000 series', 'decoder', 'bcd to decimal', 'binary to octal', '1 of 10', '1 of 8', 'demultiplexer'],
    guideOverview: 'The CD4028 is a BCD-to-decimal decoder: apply a 4-bit BCD code to inputs A (LSB) through D (MSB) and exactly one of the ten outputs (0-9) goes HIGH while the rest stay LOW. Unlike the 7442 (active-LOW) family, the CD4028 drives its selected output HIGH. Invalid BCD codes (10-15) leave every output LOW. The same part doubles as a binary-to-octal (3-to-8) decoder: drive A/B/C with a 3-bit binary code and tie D LOW, and outputs 0-7 become the octal decode. Typical uses are 1-of-N selection, decimal/keypad decoding, memory/address selection, and code conversion.',
    guidePinDescriptions: {
      'A': 'BCD input bit A (least significant, weight 1). Pin 10.',
      'B': 'BCD input bit B (weight 2). Pin 13.',
      'C': 'BCD input bit C (weight 4). Pin 12.',
      'D': 'BCD input bit D (most significant, weight 8). Pin 11. Hold LOW for 3-to-8 binary-to-octal operation.',
      '0': 'Decoded output 0. HIGH when the input code = 0 (D C B A = 0000).',
      '1': 'Decoded output 1. HIGH when the input code = 1.',
      '2': 'Decoded output 2.',
      '3': 'Decoded output 3.',
      '4': 'Decoded output 4.',
      '5': 'Decoded output 5.',
      '6': 'Decoded output 6.',
      '7': 'Decoded output 7. Highest output used in 3-to-8 octal mode.',
      '8': 'Decoded output 8. HIGH when code = 8.',
      '9': 'Decoded output 9. HIGH when code = 9.',
      'GND': 'Ground (VSS, 0 V). Connect to negative supply rail.',
      'VDD': 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: '4',   type: 'output' },
      { pin:  2, name: '2',   type: 'output' },
      { pin:  3, name: '0',   type: 'output' },
      { pin:  4, name: '7',   type: 'output' },
      { pin:  5, name: '9',   type: 'output' },
      { pin:  6, name: '5',   type: 'output' },
      { pin:  7, name: '6',   type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: '8',   type: 'output' },
      { pin: 10, name: 'A',   type: 'input'  },
      { pin: 11, name: 'D',   type: 'input'  },
      { pin: 12, name: 'C',   type: 'input'  },
      { pin: 13, name: 'B',   type: 'input'  },
      { pin: 14, name: '1',   type: 'output' },
      { pin: 15, name: '3',   type: 'output' },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      // BCD_DECIMAL_HI: active-HIGH 1-of-10 decoder. inputs [A,B,C,D] in weight
      // order (A=LSB), outputs [Y0..Y9]. Selected output HIGH, others LOW;
      // codes 10-15 → all LOW.
      { type: 'BCD_DECIMAL_HI', inputs: ['A','B','C','D'], outputs: ['0','1','2','3','4','5','6','7','8','9'] },
    ],
    guideSections: [
      {
        title: 'BCD-to-Decimal & Binary-to-Octal Decoding',
        paragraphs: [
          'Apply a binary-coded-decimal value on A (LSB) through D (MSB). The output whose number equals that value goes HIGH; all nine other outputs stay LOW. This is the opposite polarity of the 7442 / 74145 family, whose selected output goes LOW.',
          'Input codes 10 through 15 are not valid BCD digits. For these the CD4028 holds every output LOW (no output is selected), which is convenient for detecting an out-of-range code.',
          'For binary-to-octal (1-of-8) operation, use only the three inputs A, B, C and tie D to GND. Outputs 0 through 7 then form a 3-to-8 decoder; outputs 8 and 9 remain LOW.',
        ],
        list: [
          '1-of-10 selection: light one of ten LEDs, or enable one of ten downstream blocks, from a BCD count (e.g. driven by a CD4510 BCD counter).',
          'Binary-to-octal (3-to-8) decoder: A/B/C in, D=0, outputs 0-7 — one-hot address/line selection.',
          'Memory / address decoding: select one of up to ten banks or rows.',
          'Code conversion front end: feed BCD/binary in, read the decoded decimal/octal line out.',
        ],
        formulas: [
          'Selected output N is HIGH where N = A + 2·B + 4·C + 8·D (N = 0..9)',
          'Input code 10-15 → all outputs LOW',
        ],
      },
    ],
  },
};
