// chips137.js — CMOS 4000-series coverage expansion
// CD4555: dual binary 1-of-4 decoder / demultiplexer, active-HIGH outputs.
// Shipped in its own standalone block (CHIPS_BLOCK_137) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_137 = {
  // ── CD4555: dual 1-of-4 decoder/demux, outputs HIGH on select (16-pin) ──────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD4555B, CD4556B Types — CMOS Dual Binary to 1-of-4 Decoder/Demultiplexers",
     SCHS087D (revised October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4555b.pdf
     Verified: terminal assignment + functional diagram (page 1) and TRUTH TABLE
     (page 3, Fig. 6 logic diagram), read as 300-dpi rendered PDF page images
     (Read with pages:, NOT the text summarizer — see issues.md C4) and NOT cloned
     from the active-LOW 74139/74155 siblings (issues.md C2).

     Pinout (TOP VIEW), confirmed by both the functional diagram and the terminal
     assignment, which agree — two independent sections sharing nothing:
       Section A: Ē=1, A=2, B=3, Q0=4, Q1=5, Q2=6, Q3=7
       VSS=8
       Section B: Q3=9, Q2=10, Q1=11, Q0=12, B=13, A=14, Ē=15
       VDD=16
     Behavior (datasheet TRUTH TABLE, CD4555B columns): with Ē LOW the section is
     enabled and the one output selected by the 2-bit code (A=LSB, B=MSB,
     sel = A + 2·B) goes HIGH while the other three stay LOW; with Ē HIGH the
     section is disabled and ALL four outputs stay LOW regardless of A/B.
       Ē B A → Q3 Q2 Q1 Q0
       0 0 0 →  0  0  0  1   (Q0)
       0 0 1 →  0  0  1  0   (Q1)
       0 1 0 →  0  1  0  0   (Q2)
       0 1 1 →  1  0  0  0   (Q3)
       1 X X →  0  0  0  0   (all LOW)
     The CD4556B is the identical part with active-LOW outputs (LOW on select);
     it would reuse this same primitive WITHOUT gate.activeHigh. */
  'CD4555': {
    name: 'CD4555',
    simpleName: 'Dual 1-of-4 Decoder (Active HIGH)',
    description: 'Dual 1-of-4 decoder/demux, active-HIGH outputs, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4555b.pdf',
    tags: ['cmos', '4000 series', 'decoder', 'demultiplexer', '1 of 4', '2 to 4', 'dual', 'active high'],
    guideOverview: 'The CD4555 holds two independent 1-of-4 decoders in one 16-pin package. Each section takes a 2-bit address on its A (least significant) and B (most significant) inputs and drives one of its four outputs Q0-Q3 HIGH while the other three stay LOW. Each section also has its own active-LOW Enable (Ē): when Ē is HIGH the whole section is switched off and all four of its outputs are LOW, no matter what the address inputs do. The two sections share no pins, so the chip can decode two separate 2-bit codes at once, or one section can act as a 1-to-4 demultiplexer by feeding the data stream into its Enable pin. The active-LOW sibling, the CD4556, is identical but drives the selected output LOW instead.',
    guidePinDescriptions: {
      'E1':  'Section 1 Enable (active LOW), pin 1. LOW enables the section; HIGH forces all four Section 1 outputs LOW.',
      'A1':  'Section 1 address bit A (least significant, weight 1), pin 2.',
      'B1':  'Section 1 address bit B (most significant, weight 2), pin 3.',
      'Q1_0': 'Section 1 output 0 (pin 4). HIGH when Section 1 is enabled and B1A1 = 00.',
      'Q1_1': 'Section 1 output 1 (pin 5). HIGH when B1A1 = 01.',
      'Q1_2': 'Section 1 output 2 (pin 6). HIGH when B1A1 = 10.',
      'Q1_3': 'Section 1 output 3 (pin 7). HIGH when B1A1 = 11.',
      'VSS': 'Ground / negative supply (pin 8).',
      'Q2_3': 'Section 2 output 3 (pin 9). HIGH when B2A2 = 11.',
      'Q2_2': 'Section 2 output 2 (pin 10). HIGH when B2A2 = 10.',
      'Q2_1': 'Section 2 output 1 (pin 11). HIGH when B2A2 = 01.',
      'Q2_0': 'Section 2 output 0 (pin 12). HIGH when Section 2 is enabled and B2A2 = 00.',
      'B2':  'Section 2 address bit B (most significant, weight 2), pin 13.',
      'A2':  'Section 2 address bit A (least significant, weight 1), pin 14.',
      'E2':  'Section 2 Enable (active LOW), pin 15. LOW enables the section; HIGH forces all four Section 2 outputs LOW.',
      'VDD': 'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: 'One-of-Four Decoding',
        paragraphs: [
          'Each section turns a 2-bit address into a one-hot output. The address value is B·2 + A, so A=0 B=0 selects Q0, A=1 B=0 selects Q1, A=0 B=1 selects Q2, and A=1 B=1 selects Q3. The selected output goes HIGH and the other three are LOW. Because the two sections are fully separate, you get two of these decoders in one chip.',
        ],
      },
      {
        title: 'Enable and Demultiplexing',
        paragraphs: [
          'Taking a section\'s Enable (Ē) HIGH switches that whole section off: all four of its outputs go LOW regardless of the address. With Ē LOW the section decodes normally. To use a section as a 1-to-4 demultiplexer, hold A and B at the destination address and feed the serial data into the Enable pin: the data then appears on the selected output (active-HIGH version, so a HIGH on the data line drives the selected output HIGH).',
        ],
        note: 'The CD4556 is the same part with active-LOW outputs (the selected output goes LOW and the rest stay HIGH).',
      },
    ],
    pinout: [
      { pin:  1, name: 'E1',   type: 'input'  },
      { pin:  2, name: 'A1',   type: 'input'  },
      { pin:  3, name: 'B1',   type: 'input'  },
      { pin:  4, name: 'Q1_0', type: 'output' },
      { pin:  5, name: 'Q1_1', type: 'output' },
      { pin:  6, name: 'Q1_2', type: 'output' },
      { pin:  7, name: 'Q1_3', type: 'output' },
      { pin:  8, name: 'VSS',  type: 'power'  },
      { pin:  9, name: 'Q2_3', type: 'output' },
      { pin: 10, name: 'Q2_2', type: 'output' },
      { pin: 11, name: 'Q2_1', type: 'output' },
      { pin: 12, name: 'Q2_0', type: 'output' },
      { pin: 13, name: 'B2',   type: 'input'  },
      { pin: 14, name: 'A2',   type: 'input'  },
      { pin: 15, name: 'E2',   type: 'input'  },
      { pin: 16, name: 'VDD',  type: 'power'  },
    ],
    gates: [
      // DEMUX_2TO4 input contract: [A, B, G, C] — G = active-LOW enable, C = data
      // (both must be LOW to enable; a name ending 'n' would auto-invert).
      // The CD4555 has only the single active-LOW Enable Ē per section, so Ē is
      // wired into both the G and C slots: enabled ⇔ Ē=0. activeHigh:true selects
      // the "outputs HIGH on select" polarity (selected output HIGH, rest LOW;
      // disabled → all LOW). sel = A | (B<<1), A=LSB.
      {
        type: 'DEMUX_2TO4',
        activeHigh: true,
        inputs: ['A1', 'B1', 'E1', 'E1'],
        outputs: ['Q1_0', 'Q1_1', 'Q1_2', 'Q1_3'],
      },
      {
        type: 'DEMUX_2TO4',
        activeHigh: true,
        inputs: ['A2', 'B2', 'E2', 'E2'],
        outputs: ['Q2_0', 'Q2_1', 'Q2_2', 'Q2_3'],
      },
    ],
  },
};
