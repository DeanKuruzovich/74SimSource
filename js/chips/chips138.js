// chips138.js — CMOS 4000-series coverage expansion
// CD4556: dual binary 1-of-4 decoder / demultiplexer, active-LOW outputs.
// Shipped in its own standalone block (CHIPS_BLOCK_138) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_138 = {
  // ── CD4556: dual 1-of-4 decoder/demux, outputs LOW on select (16-pin) ───────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD4555B, CD4556B Types — CMOS Dual Binary to 1-of-4 Decoder/Demultiplexers",
     SCHS087D (revised October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4556b.pdf
     Verified: terminal assignment + functional diagram (page 1, "CD4556B
     FUNCTIONAL DIAGRAM" + "TERMINAL ASSIGNMENTS" CD4556B TOP VIEW) and the
     shared TRUTH TABLE (page 3, "OUTPUTS CD4556B" columns Q̄3 Q̄2 Q̄1 Q̄0, plus
     Fig. 5 "CD4556B logic diagram"), read as 300-dpi rendered PDF page images
     (Read with pages:, NOT the text summarizer — see issues.md C4) and NOT
     cloned from the active-LOW 74139/74155 siblings (issues.md C2).

     Pinout (TOP VIEW), confirmed by the page-1 CD4556B terminal assignment AND
     functional diagram, which agree — two independent sections sharing nothing.
     It is identical to the CD4555B map (same package; the two parts differ only
     in output polarity), but was confirmed against the CD4556B's own diagram:
       Section A: Ē=1, A=2, B=3, Q0=4, Q1=5, Q2=6, Q3=7
       VSS=8
       Section B: Q3=9, Q2=10, Q1=11, Q0=12, B=13, A=14, Ē=15
       VDD=16
     Behavior (datasheet TRUTH TABLE, CD4556B columns): with Ē LOW the section is
     enabled and the one output selected by the 2-bit code (A=LSB, B=MSB,
     sel = A + 2·B) goes LOW while the other three stay HIGH; with Ē HIGH the
     section is disabled and ALL four outputs go HIGH regardless of A/B. (Page 1
     prose: "When the Enable input is high ... the outputs of the CD4556B remain
     high regardless of the state of the select inputs A and B.")
       Ē B A → Q3 Q2 Q1 Q0
       0 0 0 →  1  1  1  0   (Q0 LOW)
       0 0 1 →  1  1  0  1   (Q1 LOW)
       0 1 0 →  1  0  1  1   (Q2 LOW)
       0 1 1 →  0  1  1  1   (Q3 LOW)
       1 X X →  1  1  1  1   (all HIGH)
     This is exactly the DEMUX_2TO4 primitive's active-LOW default (selected
     Y=0, others=1; disabled → all=1), so the CD4556 reuses that primitive
     WITHOUT gate.activeHigh — the opposite of its active-HIGH twin CD4555
     (chips137.js, which sets gate.activeHigh:true). */
  'CD4556': {
    name: 'CD4556',
    simpleName: 'Dual 1-of-4 Decoder (Active LOW)',
    description: 'Dual 1-of-4 decoder/demux, active-LOW outputs, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4556b.pdf',
    tags: ['cmos', '4000 series', 'decoder', 'demultiplexer', '1 of 4', '2 to 4', 'dual', 'active low'],
    guideOverview: 'The CD4556 holds two independent 1-of-4 decoders in one 16-pin package. Each section takes a 2-bit address on its A (least significant) and B (most significant) inputs and pulls one of its four outputs Q0-Q3 LOW while the other three stay HIGH. Each section also has its own active-LOW Enable (Ē): when Ē is HIGH the whole section is switched off and all four of its outputs are HIGH, no matter what the address inputs do. The two sections share no pins, so the chip can decode two separate 2-bit codes at once, or one section can act as a 1-to-4 demultiplexer by feeding the data stream into its Enable pin. The active-HIGH sibling, the CD4555, is identical but drives the selected output HIGH instead.',
    guidePinDescriptions: {
      'E1':  'Section 1 Enable (active LOW), pin 1. LOW enables the section; HIGH forces all four Section 1 outputs HIGH.',
      'A1':  'Section 1 address bit A (least significant, weight 1), pin 2.',
      'B1':  'Section 1 address bit B (most significant, weight 2), pin 3.',
      'Q1_0': 'Section 1 output 0 (pin 4). LOW when Section 1 is enabled and B1A1 = 00.',
      'Q1_1': 'Section 1 output 1 (pin 5). LOW when B1A1 = 01.',
      'Q1_2': 'Section 1 output 2 (pin 6). LOW when B1A1 = 10.',
      'Q1_3': 'Section 1 output 3 (pin 7). LOW when B1A1 = 11.',
      'VSS': 'Ground / negative supply (pin 8).',
      'Q2_3': 'Section 2 output 3 (pin 9). LOW when B2A2 = 11.',
      'Q2_2': 'Section 2 output 2 (pin 10). LOW when B2A2 = 10.',
      'Q2_1': 'Section 2 output 1 (pin 11). LOW when B2A2 = 01.',
      'Q2_0': 'Section 2 output 0 (pin 12). LOW when Section 2 is enabled and B2A2 = 00.',
      'B2':  'Section 2 address bit B (most significant, weight 2), pin 13.',
      'A2':  'Section 2 address bit A (least significant, weight 1), pin 14.',
      'E2':  'Section 2 Enable (active LOW), pin 15. LOW enables the section; HIGH forces all four Section 2 outputs HIGH.',
      'VDD': 'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: 'One-of-Four Decoding',
        paragraphs: [
          'Each section turns a 2-bit address into a one-cold output. The address value is B·2 + A, so A=0 B=0 selects Q0, A=1 B=0 selects Q1, A=0 B=1 selects Q2, and A=1 B=1 selects Q3. The selected output goes LOW and the other three stay HIGH. Because the two sections are fully separate, you get two of these decoders in one chip.',
        ],
      },
      {
        title: 'Enable and Demultiplexing',
        paragraphs: [
          'Taking a section\'s Enable (Ē) HIGH switches that whole section off: all four of its outputs go HIGH regardless of the address. With Ē LOW the section decodes normally. To use a section as a 1-to-4 demultiplexer, hold A and B at the destination address and feed the serial data into the Enable pin: the data then appears on the selected output (active-LOW version, so a HIGH on the data line lets the selected output rise back HIGH, and a LOW on the data line pulls it LOW).',
        ],
        note: 'The CD4555 is the same part with active-HIGH outputs (the selected output goes HIGH and the rest stay LOW).',
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
      // The CD4556 has only the single active-LOW Enable Ē per section, so Ē is
      // wired into both the G and C slots: enabled ⇔ Ē=0. NO activeHigh flag →
      // the primitive's active-LOW default: selected output LOW, the other three
      // HIGH; disabled (Ē=1) → all four HIGH. sel = A | (B<<1), A=LSB.
      {
        type: 'DEMUX_2TO4',
        inputs: ['A1', 'B1', 'E1', 'E1'],
        outputs: ['Q1_0', 'Q1_1', 'Q1_2', 'Q1_3'],
      },
      {
        type: 'DEMUX_2TO4',
        inputs: ['A2', 'B2', 'E2', 'E2'],
        outputs: ['Q2_0', 'Q2_1', 'Q2_2', 'Q2_3'],
      },
    ],
  },
};
