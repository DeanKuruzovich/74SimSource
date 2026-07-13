// ─────────────────────────────────────────────────────────────────────────────
// chips136.js — CMOS 4000-series coverage expansion
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_136.
//
//   CD4512 — 8-channel data selector (8-to-1 mux) with 3-state output
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_136 = {
  // ── CD4512: 8-Channel Data Selector, 3-state output ───────────────────────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD4512B Types — CMOS 8-Channel Data Selector", SCHS073C (Revised October
     2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4512b.pdf
     Verified: terminal assignment (TOP VIEW), functional diagram, and truth
     table on page 1, read as 300-dpi rendered PDF page images (NOT a text
     summarizer — see issues.md C4) and NOT cloned from a sibling 8-to-1 mux
     (see issues.md C2 — the 74251-family MUX_8TO1_TRI has complementary Y/W
     outputs and a single enable, which the CD4512 does not).

     Pin map (16-pin DIP), left column 1-8 then right column 9-16:
       D0(1) D1(2) D2(3) D3(4) D4(5) D5(6) D6(7) VSS(8)
       D7(9) INHIBIT(10) A(11) B(12) C(13) SEL OUTPUT(14)
       3-STATE DISABLE(15) VDD(16)
     Select is A=LSB, B, C=MSB. Truth table (verified): with 3-STATE DISABLE=0
     and INHIBIT=0, SEL OUTPUT = D[ A + 2B + 4C ] (non-inverting). INHIBIT=1
     (DISABLE still 0) forces SEL OUTPUT to logic 0, actively DRIVEN. 3-STATE
     DISABLE=1 puts SEL OUTPUT in high-impedance and dominates INHIBIT. */
  'CD4512': {
    name: 'CD4512',
    simpleName: '8-Channel Data Selector',
    description: '8-channel data selector (8-to-1 mux), inhibit, 3-state output (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4512b.pdf',
    sequential: false,
    tags: ['cmos', '4000', 'multiplexer', 'mux', 'data-selector', '8-to-1', 'tri-state', '3-state', 'inhibit', 'bus'],
    guideOverview: 'The CD4512B picks one of eight data inputs (D0 through D7) and sends it to a single output. Three select pins A, B, and C form a 3-bit address: A is the least significant bit, so address 000 selects D0 and 111 selects D7. The output is non-inverting — it copies the selected input directly. Two control pins shape the output. INHIBIT (active HIGH) forces the output to logic 0 while still driving it. The 3-STATE DISABLE pin (active HIGH) releases the output to the high-impedance state so several devices can share one bus line; it overrides INHIBIT. With both controls LOW the chip is a plain 8-to-1 multiplexer.',
    guidePinDescriptions: {
      D0: 'Data input 0 (selected when C,B,A = 000).',
      D1: 'Data input 1 (selected when C,B,A = 001).',
      D2: 'Data input 2 (selected when C,B,A = 010).',
      D3: 'Data input 3 (selected when C,B,A = 011).',
      D4: 'Data input 4 (selected when C,B,A = 100).',
      D5: 'Data input 5 (selected when C,B,A = 101).',
      D6: 'Data input 6 (selected when C,B,A = 110).',
      D7: 'Data input 7 (selected when C,B,A = 111).',
      A: 'Select input A — least significant address bit (weight 1).',
      B: 'Select input B — middle address bit (weight 2).',
      C: 'Select input C — most significant address bit (weight 4).',
      INHIBIT: 'Inhibit (active HIGH). HIGH forces SEL OUTPUT to logic 0 (actively driven); LOW = normal multiplexer operation. Overridden by 3-STATE DISABLE.',
      'SEL OUTPUT': 'Selected-data output (non-inverting 3-state). Equals the addressed input when enabled.',
      '3-STATE DISABLE': 'Output disable (active HIGH). HIGH = SEL OUTPUT goes to the high-impedance state; LOW = output enabled. Dominates INHIBIT.',
      VSS: 'Ground reference (pin 8).',
      VDD: 'Positive supply (+3 V to +18 V; +5 V in this simulator) at pin 16.',
    },
    guideSections: [
      {
        title: '8-to-1 select with inhibit and bus disable',
        paragraphs: [
          'Set the 3-bit address on A (LSB), B, and C (MSB) to choose which of the eight data inputs reaches the output. With 3-STATE DISABLE and INHIBIT both LOW, SEL OUTPUT copies the selected input directly.',
          'Driving INHIBIT HIGH forces SEL OUTPUT to logic 0. The output is still actively driven LOW — this blanks the data without releasing the line.',
          'Driving 3-STATE DISABLE HIGH releases SEL OUTPUT to high-impedance, so the chip can share a wired bus with other 3-state drivers. 3-STATE DISABLE dominates INHIBIT.',
        ],
        formulas: [
          'SEL OUTPUT = D[A + 2·B + 4·C]      (DISABLE = 0, INHIBIT = 0)',
          'SEL OUTPUT = 0                     (DISABLE = 0, INHIBIT = 1)',
          'SEL OUTPUT = high-impedance (Z)    (DISABLE = 1)',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'D0',              type: 'input',  description: 'Data input 0' },
      { pin: 2,  name: 'D1',              type: 'input',  description: 'Data input 1' },
      { pin: 3,  name: 'D2',              type: 'input',  description: 'Data input 2' },
      { pin: 4,  name: 'D3',              type: 'input',  description: 'Data input 3' },
      { pin: 5,  name: 'D4',              type: 'input',  description: 'Data input 4' },
      { pin: 6,  name: 'D5',              type: 'input',  description: 'Data input 5' },
      { pin: 7,  name: 'D6',              type: 'input',  description: 'Data input 6' },
      { pin: 8,  name: 'VSS',            type: 'power',  description: 'Ground (0 V)' },
      { pin: 9,  name: 'D7',              type: 'input',  description: 'Data input 7' },
      { pin: 10, name: 'INHIBIT',         type: 'input',  description: 'Inhibit (active HIGH → SEL OUTPUT forced LOW)' },
      { pin: 11, name: 'A',               type: 'input',  description: 'Select input A (LSB, weight 1)' },
      { pin: 12, name: 'B',               type: 'input',  description: 'Select input B (weight 2)' },
      { pin: 13, name: 'C',               type: 'input',  description: 'Select input C (MSB, weight 4)' },
      { pin: 14, name: 'SEL OUTPUT',      type: 'output', description: 'Selected-data 3-state output (non-inverting)' },
      { pin: 15, name: '3-STATE DISABLE', type: 'input',  description: 'Output disable (active HIGH → SEL OUTPUT Hi-Z)' },
      { pin: 16, name: 'VDD',            type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // MUX_8TO1_TRI_INH (CD4512):
      //   inputs  [D0..D7, A, B, C, INHIBIT, 3-STATE DISABLE]  (A = LSB)
      //   output  SEL OUTPUT (single non-inverting 3-state output)
      //   DISABLE=1 → Hi-Z (dominant); INHIBIT=1 (DISABLE=0) → driven LOW;
      //   else SEL OUTPUT = D[A | B<<1 | C<<2].
      {
        type: 'MUX_8TO1_TRI_INH',
        inputs:  ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'A', 'B', 'C', 'INHIBIT', '3-STATE DISABLE'],
        output:  'SEL OUTPUT',
      },
    ],
  },
};
