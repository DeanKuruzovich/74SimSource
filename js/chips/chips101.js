// chips101.js — Block 101: CMOS 4000 series logic IC (coverage expansion, Batch 2)
// Standalone single-chip block (parallel-agent run) to avoid colliding with the
// other agents editing the shared chip files. Primitive-backed combinational part.
// Pinout verified against a primary datasheet, read by rasterizing the scanned
// TI/Harris PDF (pdftoppm at 200–400 DPI) and cropping the Terminal Diagram +
// Truth Table — the low-res page render and the WebFetch text summarizer are both
// unreliable for these scans (issues.md C4). Not cloned from any sibling (C2).
// See CMOS-4000-Coverage-Plan.md for the full roadmap.
// Chips: CD4019
export const CHIPS_BLOCK_101 = {

  // ── CD4019: Quad AND/OR select gate (16-pin) ───────────────────────────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     CD4019B datasheet, SCHS029C (rev. October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4019b.pdf
     Terminal Diagram (Top View) + Truth Table read as rasterized PDF page images. */
  'CD4019': {
    name: 'CD4019',
    simpleName: 'Quad AND/OR Select Gate',
    description: 'Quad AND/OR select gate, merges two 4-bit words, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4019b.pdf',
    tags: ['cmos', '4000 series', 'and-or select', 'multiplexer', 'true/complement', '4 bit'],
    guideOverview: 'The CD4019 contains four identical AND/OR select sections. Each section n has two data inputs An and Bn and produces Dn = (An AND Ka) OR (Bn AND Kb). The two control lines Ka (pin 9) and Kb (pin 14) are shared by all four sections. Drive Ka HIGH / Kb LOW to pass the A word to the outputs; drive Ka LOW / Kb HIGH to pass the B word; drive BOTH HIGH to OR the two words bit-by-bit (Dn = An OR Bn); drive both LOW to force all outputs LOW. This makes it a 4-bit 2-to-1 word selector, a true/complement selector (feed a word and its inverse), or an AND/OR/Exclusive-OR building block. Supply voltage 3-15 V. Note the inputs are interleaved on the package: A1/B1…A4/B4 are NOT in a tidy run — verify the pin map below.',
    guidePinDescriptions: {
      B4: 'Section 4 data input B.',
      A3: 'Section 3 data input A.',
      B3: 'Section 3 data input B.',
      A2: 'Section 2 data input A.',
      B2: 'Section 2 data input B.',
      A1: 'Section 1 data input A.',
      B1: 'Section 1 data input B.',
      GND: 'Ground reference (VSS). Connect to 0 V.',
      Ka: 'Select line for the A inputs (shared by all four sections). HIGH enables the An·Ka term.',
      D1: 'Section 1 output: D1 = (A1·Ka) + (B1·Kb).',
      D2: 'Section 2 output: D2 = (A2·Ka) + (B2·Kb).',
      D3: 'Section 3 output: D3 = (A3·Ka) + (B3·Kb).',
      D4: 'Section 4 output: D4 = (A4·Ka) + (B4·Kb).',
      Kb: 'Select line for the B inputs (shared by all four sections). HIGH enables the Bn·Kb term.',
      A4: 'Section 4 data input A.',
      VDD: 'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: 'B4',  type: 'input',  description: 'Section 4 data input B' },
      { pin:  2, name: 'A3',  type: 'input',  description: 'Section 3 data input A' },
      { pin:  3, name: 'B3',  type: 'input',  description: 'Section 3 data input B' },
      { pin:  4, name: 'A2',  type: 'input',  description: 'Section 2 data input A' },
      { pin:  5, name: 'B2',  type: 'input',  description: 'Section 2 data input B' },
      { pin:  6, name: 'A1',  type: 'input',  description: 'Section 1 data input A' },
      { pin:  7, name: 'B1',  type: 'input',  description: 'Section 1 data input B' },
      { pin:  8, name: 'GND', type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin:  9, name: 'Ka',  type: 'input',  description: 'Select line for A inputs (HIGH enables An·Ka term)' },
      { pin: 10, name: 'D1',  type: 'output', description: 'Section 1 output: D1 = (A1·Ka) + (B1·Kb)' },
      { pin: 11, name: 'D2',  type: 'output', description: 'Section 2 output: D2 = (A2·Ka) + (B2·Kb)' },
      { pin: 12, name: 'D3',  type: 'output', description: 'Section 3 output: D3 = (A3·Ka) + (B3·Kb)' },
      { pin: 13, name: 'D4',  type: 'output', description: 'Section 4 output: D4 = (A4·Ka) + (B4·Kb)' },
      { pin: 14, name: 'Kb',  type: 'input',  description: 'Select line for B inputs (HIGH enables Bn·Kb term)' },
      { pin: 15, name: 'A4',  type: 'input',  description: 'Section 4 data input A' },
      { pin: 16, name: 'VDD', type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'AO_22', inputs: ['A1', 'Ka', 'B1', 'Kb'], output: 'D1' },
      { type: 'AO_22', inputs: ['A2', 'Ka', 'B2', 'Kb'], output: 'D2' },
      { type: 'AO_22', inputs: ['A3', 'Ka', 'B3', 'Kb'], output: 'D3' },
      { type: 'AO_22', inputs: ['A4', 'Ka', 'B4', 'Kb'], output: 'D4' },
    ],
    guideSections: [
      {
        title: 'Selecting, Merging, or ORing Two 4-Bit Words',
        paragraphs: [
          'Each of the four sections computes Dn = (An AND Ka) OR (Bn AND Kb). The two control lines Ka and Kb are common to all four bits, so they set the mode for the whole word at once.',
          'With Ka HIGH and Kb LOW the A inputs appear at the outputs (D = A); with Ka LOW and Kb HIGH the B inputs appear (D = B) — that is a 4-bit 2-to-1 word multiplexer. With both Ka and Kb HIGH each output is An OR Bn (bit-wise OR of the two words); with both LOW every output is forced LOW. Feeding a word into the A inputs and its complement into the B inputs turns the chip into a true/complement selector.',
        ],
        list: [
          'Select between two 4-bit words (Ka/Kb act as the address).',
          'True/complement selection: pass a word or its inverse.',
          'Bit-wise OR of two words (both selects HIGH); building block for AND/OR/XOR steering.',
          'Steer serial data for shift-right / shift-left register control.',
        ],
        note: '74Sim evaluates each section combinationally as Dn = (An·Ka) + (Bn·Kb), exactly matching the datasheet truth table for static inputs. As with all parts there is no propagation delay (issues.md A1), so the settled output is exact but ns-scale switching skew is not modeled.',
      },
    ],
  },

};
