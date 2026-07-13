// Chip definitions block 117
// Chips: CD4724 (8-bit addressable latch)
//
// Standalone block authored for the CMOS 4000-series coverage effort. Kept on
// its own (instead of batching ~10-15 chips per file) to avoid collisions with
// other agents editing shared chip files in the same working tree.

export const CHIPS_BLOCK_117 = {

  // ── CD4724: 8-bit addressable latch (16-pin) ──────────────────────────────
  /* Primary source: Texas Instruments / Harris, "CD4724B Types — CMOS 8-Bit
     Addressable Latch", datasheet SCHS092C (rev. July 2003). [Online].
     Available: https://www.ti.com/lit/ds/symlink/cd4724b.pdf
     Pinout + MODE SELECTION table read directly from the rendered PDF pages
     (issues.md C4) — NOT cloned from the 74x259 / 74HC 74x4724 sibling
     (issues.md C2): unlike those active-LOW-control parts, the CD4724B uses an
     active-HIGH WRITE DISABLE and an active-HIGH RESET, and the RESET is gated
     by WRITE DISABLE to give a true active-high 8-channel demultiplexer mode. */
  'CD4724': {
    name: 'CD4724',
    simpleName: '8-bit Addr Latch',
    description: 'CMOS 8-bit addressable latch, active-high write-disable/reset (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4724b.pdf',
    tags: ['latch', 'addressable', 'demultiplexer', '8 bit', 'sequential', 'CMOS', '4000 series'],
    guideOverview: 'The CD4724B is a CMOS 8-bit addressable latch. A 3-bit address (A0-A2) selects one of eight internal storage cells; the DATA input is written into that one addressed cell while the other seven hold their values. Two active-HIGH controls shape the behavior: WRITE DISABLE inhibits writing (the part just holds), and RESET clears the unaddressed cells to 0. With WRITE DISABLE low and RESET high, the addressed bit follows DATA while every other output is forced to 0 — a true active-high 1-of-8 demultiplexer. With both high, every output resets to 0. This makes it handy for multi-line decoders and as the storage register inside simple A/D converters.',
    guidePinDescriptions: {
      'A0': 'Least significant address-select input.',
      'A1': 'Middle address-select input.',
      'A2': 'Most significant address-select input.',
      'Q0': 'Stored output bit 0.',
      'Q1': 'Stored output bit 1.',
      'Q2': 'Stored output bit 2.',
      'Q3': 'Stored output bit 3.',
      'GND': 'Ground reference (VSS) for the device.',
      'Q4': 'Stored output bit 4.',
      'Q5': 'Stored output bit 5.',
      'Q6': 'Stored output bit 6.',
      'Q7': 'Stored output bit 7.',
      'DATA': 'Serial data input. Written into the addressed latch when WRITE DISABLE is low.',
      'WD': 'WRITE DISABLE (active HIGH). High inhibits writing so all bits hold; low lets the addressed bit follow DATA.',
      'RESET': 'RESET (active HIGH). High clears the unaddressed bits to 0; combined with WRITE DISABLE high it clears all bits.',
      'VCC': 'Positive supply (VDD) for the latch.',
    },
    guideSections: [
      {
        title: 'How The Addressable Latch Works',
        paragraphs: [
          'Three address inputs (A0-A2) point at exactly one of the eight stored bits. When WRITE DISABLE is low, the value on DATA is written into that single addressed bit; the other seven outputs are unaffected and keep whatever they held before.',
          'Because only the addressed bit can change, you can set or clear individual control lines one at a time from a small address-plus-data interface, instead of rewriting a whole byte at once.',
        ],
      },
      {
        title: 'The Four Operating Modes',
        list: [
          'WRITE DISABLE = 0, RESET = 0: the addressed bit follows DATA; the other bits hold (normal addressable-latch write).',
          'WRITE DISABLE = 0, RESET = 1: the addressed bit follows DATA while every other bit is forced to 0 — an active-high 8-channel demultiplexer.',
          'WRITE DISABLE = 1, RESET = 0: all bits hold their previous state (storage register).',
          'WRITE DISABLE = 1, RESET = 1: master clear — all eight outputs reset to 0.',
        ],
      },
      {
        title: 'Why It Is Useful',
        list: [
          'Multi-line decoders and software-controlled output bits.',
          'The storage register / 1-of-8 demultiplexer inside simple A/D converters.',
          'Setting or clearing individual control lines without disturbing the others.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',    type: 'input'  },
      { pin:  2, name: 'A1',    type: 'input'  },
      { pin:  3, name: 'A2',    type: 'input'  },
      { pin:  4, name: 'Q0',    type: 'output' },
      { pin:  5, name: 'Q1',    type: 'output' },
      { pin:  6, name: 'Q2',    type: 'output' },
      { pin:  7, name: 'Q3',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'Q4',    type: 'output' },
      { pin: 10, name: 'Q5',    type: 'output' },
      { pin: 11, name: 'Q6',    type: 'output' },
      { pin: 12, name: 'Q7',    type: 'output' },
      { pin: 13, name: 'DATA',  type: 'input'  },
      { pin: 14, name: 'WD',    type: 'input'  },
      { pin: 15, name: 'RESET', type: 'input'  },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      {
        type: 'ADDRESSABLE_LATCH',
        resetActiveHigh: true,            // CD4724B: active-HIGH WD + gated active-HIGH RESET (demux mode)
        inputs: ['A0', 'A1', 'A2', 'DATA', 'WD', 'RESET'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
      },
    ],
    sequential: true,
  },

};
