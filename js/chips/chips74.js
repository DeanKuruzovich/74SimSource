// chips74.js Block 74: CMOS 4000 series logic ICs (coverage expansion, Batch 2)
// Primitive-backed combinational parts (comparators, AOI, parity, …).
// Every pinout verified against a primary datasheet, read by rasterizing the
// scanned TI/Harris PDF at 300 DPI (pdftoppm) and cropping the functional /
// terminal-assignment diagram — the low-res page render and the WebFetch text
// summarizer are both unreliable for these scans.
// See CMOS-4000-Coverage-Plan.md for the full roadmap.
// Chips: CD4063, CD4585
export const CHIPS_BLOCK_74 = {

  // ── CD4063: 4-bit magnitude comparator (16-pin) ────────────────────────
  /* Primary source: Texas Instruments (Harris), CD4063B datasheet, SCHS057. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4063b.pdf */
  'CD4063': {
    name: 'CD4063',
    simpleName: '4-Bit Magnitude Comparator',
    description: '4 bit magnitude comparator, CMOS 4000 series, cascadable (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4063b.pdf',
    tags: ['cmos', '4000 series', 'comparator', 'magnitude comparator', '4 bit', 'cascadable'],
    guideOverview: 'The CD4063 compares two 4 bit binary words A (A0-A3) and B (B0-B3) and drives exactly one of three outputs HIGH to report whether A>B, A=B, or A<B. Three cascade inputs (A>B in, A=B in, A<B in) let you chain packages to compare words wider than 4 bits — the low-order stage feeds the next stage up. It shares the classic 74x85 pinout (B3 on pin 1, cascade inputs on 2-4, outputs on 5-7). For a single 4 bit comparison, tie the A=B input HIGH and the A>B / A<B inputs LOW. Supply voltage 3-15 V.',
    guidePinDescriptions: {
      B3: 'Word B bit 3 (MSB).',
      ALTBIN: 'Cascade input "A<B from lower stage". For a single chip tie LOW.',
      AEQBIN: 'Cascade input "A=B from lower stage". For a single chip tie HIGH.',
      AGTBIN: 'Cascade input "A>B from lower stage". For a single chip tie LOW.',
      AGTB: 'Output: HIGH when A > B.',
      AEQB: 'Output: HIGH when A = B.',
      ALTB: 'Output: HIGH when A < B.',
      GND: 'Ground reference (VSS). Connect to 0 V.',
      B0: 'Word B bit 0 (LSB).',
      A0: 'Word A bit 0 (LSB).',
      B1: 'Word B bit 1.',
      A1: 'Word A bit 1.',
      A2: 'Word A bit 2.',
      B2: 'Word B bit 2.',
      A3: 'Word A bit 3 (MSB).',
      VDD: 'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: 'B3',     type: 'input',  description: 'Word B bit 3 (MSB)' },
      { pin:  2, name: 'ALTBIN', type: 'input',  description: 'Cascade input A<B (tie LOW for single chip)' },
      { pin:  3, name: 'AEQBIN', type: 'input',  description: 'Cascade input A=B (tie HIGH for single chip)' },
      { pin:  4, name: 'AGTBIN', type: 'input',  description: 'Cascade input A>B (tie LOW for single chip)' },
      { pin:  5, name: 'AGTB',   type: 'output', description: 'Output: HIGH when A > B' },
      { pin:  6, name: 'AEQB',   type: 'output', description: 'Output: HIGH when A = B' },
      { pin:  7, name: 'ALTB',   type: 'output', description: 'Output: HIGH when A < B' },
      { pin:  8, name: 'GND',    type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin:  9, name: 'B0',     type: 'input',  description: 'Word B bit 0 (LSB)' },
      { pin: 10, name: 'A0',     type: 'input',  description: 'Word A bit 0 (LSB)' },
      { pin: 11, name: 'B1',     type: 'input',  description: 'Word B bit 1' },
      { pin: 12, name: 'A1',     type: 'input',  description: 'Word A bit 1' },
      { pin: 13, name: 'A2',     type: 'input',  description: 'Word A bit 2' },
      { pin: 14, name: 'B2',     type: 'input',  description: 'Word B bit 2' },
      { pin: 15, name: 'A3',     type: 'input',  description: 'Word A bit 3 (MSB)' },
      { pin: 16, name: 'VDD',    type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'COMPARATOR_4BIT',
        inputs: ['A0','A1','A2','A3','B0','B1','B2','B3','AGTBIN','AEQBIN','ALTBIN'],
        outputs: ['AGTB','AEQB','ALTB'] },
    ],
    guideSections: [
      {
        title: 'Comparing Two 4-Bit Numbers',
        paragraphs: [
          'Put one number on A0-A3 and the other on B0-B3. The chip drives exactly one of AGTB / AEQB / ALTB HIGH to tell you the relationship. The comparison is purely combinational — change an input and the result follows immediately.',
          'To compare wider words, cascade packages: route the AGTB, AEQB, ALTB outputs of the lower-order chip into the AGTBIN, AEQBIN, ALTBIN inputs of the next chip up. For a single 4 bit comparison with no chip below it, tie A=B-in HIGH and A>B-in / A<B-in LOW.',
        ],
        list: [
          'Compare two 4 bit numbers (or BCD digits) for >, =, <.',
          'Cascade for 8, 12, 16-bit (or wider) magnitude comparison.',
          'Window/limit detection: flag when a value crosses a fixed threshold.',
        ],
      },
    ],
  },

  // ── CD4585: 4-bit magnitude comparator (16-pin) ────────────────────────
  /* Primary source: Texas Instruments (Harris), CD4585B datasheet, SCHS091B (rev. July 2003). [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4585b.pdf */
  'CD4585': {
    name: 'CD4585',
    simpleName: '4-Bit Magnitude Comparator',
    description: '4 bit magnitude comparator, CMOS 4000; pinout differs from 74x85 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4585b.pdf',
    tags: ['cmos', '4000 series', 'comparator', 'magnitude comparator', '4 bit', 'cascadable'],
    guideOverview: 'The CD4585 compares two 4 bit binary words A (A0-A3) and B (B0-B3) and drives one of three outputs (A>B, A=B, A<B) HIGH to report the result. It is functionally the same comparison as the CD4063, but its PINOUT is rearranged (for example A2/B2 land on pins 2/1, and the A=B output is on pin 3) — verify the pin map before swapping the two parts. Three cascade inputs allow chaining to compare longer words. For a single 4 bit comparison, tie the A=B input HIGH and the A>B / A<B inputs LOW. Supply voltage 3-15 V.',
    guidePinDescriptions: {
      B2: 'Word B bit 2.',
      A2: 'Word A bit 2.',
      AEQB: 'Output: HIGH when A = B.',
      AGTBIN: 'Cascade input "A>B from lower stage". For a single chip tie LOW.',
      ALTBIN: 'Cascade input "A<B from lower stage". For a single chip tie LOW.',
      AEQBIN: 'Cascade input "A=B from lower stage". For a single chip tie HIGH.',
      A1: 'Word A bit 1.',
      GND: 'Ground reference (VSS). Connect to 0 V.',
      B1: 'Word B bit 1.',
      A0: 'Word A bit 0 (LSB).',
      B0: 'Word B bit 0 (LSB).',
      ALTB: 'Output: HIGH when A < B.',
      AGTB: 'Output: HIGH when A > B.',
      B3: 'Word B bit 3 (MSB).',
      A3: 'Word A bit 3 (MSB).',
      VDD: 'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: 'B2',     type: 'input',  description: 'Word B bit 2' },
      { pin:  2, name: 'A2',     type: 'input',  description: 'Word A bit 2' },
      { pin:  3, name: 'AEQB',   type: 'output', description: 'Output: HIGH when A = B' },
      { pin:  4, name: 'AGTBIN', type: 'input',  description: 'Cascade input A>B (tie LOW for single chip)' },
      { pin:  5, name: 'ALTBIN', type: 'input',  description: 'Cascade input A<B (tie LOW for single chip)' },
      { pin:  6, name: 'AEQBIN', type: 'input',  description: 'Cascade input A=B (tie HIGH for single chip)' },
      { pin:  7, name: 'A1',     type: 'input',  description: 'Word A bit 1' },
      { pin:  8, name: 'GND',    type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin:  9, name: 'B1',     type: 'input',  description: 'Word B bit 1' },
      { pin: 10, name: 'A0',     type: 'input',  description: 'Word A bit 0 (LSB)' },
      { pin: 11, name: 'B0',     type: 'input',  description: 'Word B bit 0 (LSB)' },
      { pin: 12, name: 'ALTB',   type: 'output', description: 'Output: HIGH when A < B' },
      { pin: 13, name: 'AGTB',   type: 'output', description: 'Output: HIGH when A > B' },
      { pin: 14, name: 'B3',     type: 'input',  description: 'Word B bit 3 (MSB)' },
      { pin: 15, name: 'A3',     type: 'input',  description: 'Word A bit 3 (MSB)' },
      { pin: 16, name: 'VDD',    type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'COMPARATOR_4BIT',
        inputs: ['A0','A1','A2','A3','B0','B1','B2','B3','AGTBIN','AEQBIN','ALTBIN'],
        outputs: ['AGTB','AEQB','ALTB'] },
    ],
    guideSections: [
      {
        title: 'Comparing Two 4-Bit Numbers',
        paragraphs: [
          'Drive one number on A0-A3 and the other on B0-B3; the chip raises exactly one of AGTB / AEQB / ALTB. The result is combinational and follows the inputs immediately.',
          'The CD4585 does the same job as the CD4063 but with a different physical pinout, so do not assume the two are drop-in pin compatible. To cascade, feed the lower stage\'s three outputs into this stage\'s three cascade inputs; for a standalone chip tie A=B-in HIGH and A>B-in / A<B-in LOW.',
        ],
        list: [
          'Compare two 4 bit numbers (or BCD digits) for >, =, <.',
          'Cascade for wider-word magnitude comparison.',
          'Threshold / limit detection against a fixed reference.',
        ],
        note: '74Sim evaluates the comparison directly from the A and B bits, so the A>B / A=B / A<B result for a single chip is exact. The three cascade inputs follow the 74x85 priority model (A>B-in, then A<B-in, then A=B-in); the real CD4585\'s native cascade convention differs slightly, so for standalone use tie A=B-in HIGH and the other two LOW to get the correct equal-case output.',
      },
    ],
  },

};
