// ─────────────────────────────────────────────────────────────────────────────
// chips103.js — CMOS 4000-series coverage expansion (Batch 2)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_103.
//
//   CD4086 — expandable 4-wide 2-input AND-OR-INVERT gate
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_103 = {
  // ── CD4086: expandable 4-wide 2-input AND-OR-INVERT ────────────────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), CD4086B datasheet (SCHS061C, Rev. September 2003). [Online].
     Available: https://www.ti.com/lit/ds/symlink/cd4086b.pdf
     Pinout + function read directly from the datasheet PDF page images (Terminal
     Assignment TOP VIEW + Functional Diagram + Fig. 9 schematic + Fig. 10 cascade
     example), not a text summarizer — see issues.md C4. NOT cloned from the
     74x54 AOI sibling — see issues.md C2. Verified map: A=1, B=2, J=3, NC=4,
     E=5, F=6, VSS=7, G=8, H=9, INHIBIT/EXP=10, ENABLE/EXP=11, C=12, D=13, VDD=14. */
  'CD4086': {
    name: 'CD4086',
    simpleName: 'Expandable 4-Wide AOI',
    description: 'Expandable 4-wide 2-input AND-OR-INVERT gate, inhibit/enable in (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4086b.pdf',
    tags: ['cmos', '4000', 'aoi', 'and or invert', 'gate', 'logic', '4-wide', 'expandable', 'inhibit', 'enable'],
    guideOverview: 'The CD4086B is one 4-wide, 2-input AND-OR-INVERT gate. Four 2-input AND groups (A·B, C·D, E·F, G·H) feed a NOR, so the single output J is LOW whenever ANY pair is fully asserted and HIGH only when all four pairs are unasserted. Two extra control inputs make it expandable: INHIBIT/EXP (active HIGH) ORs straight into the NOR — driving it HIGH (or feeding it an external AND-gate output) forces J LOW and lets you OR-expand beyond 4 wide; ENABLE/EXP (active HIGH) gates the output — a LOW forces J LOW, which is how you cascade chips. For an ordinary stand-alone 4-wide AOI, tie INHIBIT/EXP to VSS and ENABLE/EXP to VDD. To build an 8-wide AOI, feed the J output of one CD4086 into the ENABLE/EXP input of a second.',
    guidePinDescriptions: {
      A: 'AND group 1 input A (A·B).',
      B: 'AND group 1 input B (A·B).',
      C: 'AND group 2 input C (C·D).',
      D: 'AND group 2 input D (C·D).',
      E: 'AND group 3 input E (E·F).',
      F: 'AND group 3 input F (E·F).',
      G: 'AND group 4 input G (G·H).',
      H: 'AND group 4 input H (G·H).',
      'INHIBIT/EXP': 'Inhibit / OR-expand input (active HIGH). HIGH forces J LOW; ORs into the NOR alongside the four AND pairs. Tie to VSS for a stand-alone 4-wide gate, or feed an external AND-gate output here to expand the width.',
      'ENABLE/EXP': 'Enable / AND-expand input (active HIGH). A LOW forces J LOW. Tie to VDD for a stand-alone 4-wide gate, or feed a preceding CD4086\'s J output here to cascade into a wider AOI.',
      J: 'AND-OR-INVERT output: J = NOT(INHIBIT/EXP + NOT(ENABLE/EXP) + A·B + C·D + E·F + G·H).',
      NC: 'No internal connection (pin 4).',
      VSS: 'Ground reference (pin 7).',
      VDD: 'Positive supply (+3 V to +18 V; +5 V in this simulator) at pin 14.',
    },
    guideSections: [
      {
        title: '4-wide AND-OR-INVERT',
        paragraphs: [
          'The four 2-input AND groups are OR-combined and inverted: with INHIBIT/EXP LOW and ENABLE/EXP HIGH, J = NOT((A·B)+(C·D)+(E·F)+(G·H)). The output is LOW if any one pair is HIGH·HIGH and HIGH only when every pair has at least one LOW input.',
        ],
        formulas: [
          'J = NOT( (A·B) + (C·D) + (E·F) + (G·H) )   (INHIBIT/EXP=0, ENABLE/EXP=1)',
        ],
      },
      {
        title: 'Inhibit, enable and expansion',
        paragraphs: [
          'INHIBIT/EXP is an extra active-HIGH term ORed into the NOR, so a HIGH there forces J LOW. ENABLE/EXP gates the result: a LOW forces J LOW. The full function is J = NOT( INHIBIT/EXP + NOT(ENABLE/EXP) + A·B + C·D + E·F + G·H ).',
          'These two inputs make the gate expandable. Feed the J output of one CD4086 into the ENABLE/EXP input of a second to build an 8-wide 2-input AOI (J2 = NOT of all eight pairs). An external AND-gate output fed into INHIBIT/EXP adds another OR term with the same result. For a plain stand-alone 4-wide gate, tie INHIBIT/EXP to VSS and ENABLE/EXP to VDD.',
        ],
        formulas: [
          'J = NOT( INHIBIT/EXP + NOT(ENABLE/EXP) + A·B + C·D + E·F + G·H )',
          '8-wide: J2 = NOT( Σpairs(chip1) + Σpairs(chip2) )   when J1 → ENABLE/EXP2',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'A',           type: 'input',  description: 'AND group 1 input A (A·B)' },
      { pin: 2,  name: 'B',           type: 'input',  description: 'AND group 1 input B (A·B)' },
      { pin: 3,  name: 'J',           type: 'output', description: 'AOI output = NOT(INHIBIT/EXP + NOT(ENABLE/EXP) + A·B + C·D + E·F + G·H)' },
      { pin: 4,  name: 'NC',          type: 'nc',     description: 'No internal connection' },
      { pin: 5,  name: 'E',           type: 'input',  description: 'AND group 3 input E (E·F)' },
      { pin: 6,  name: 'F',           type: 'input',  description: 'AND group 3 input F (E·F)' },
      { pin: 7,  name: 'VSS',         type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: 'G',           type: 'input',  description: 'AND group 4 input G (G·H)' },
      { pin: 9,  name: 'H',           type: 'input',  description: 'AND group 4 input H (G·H)' },
      { pin: 10, name: 'INHIBIT/EXP', type: 'input',  description: 'Inhibit / OR-expand (active HIGH forces J LOW)' },
      { pin: 11, name: 'ENABLE/EXP',  type: 'input',  description: 'Enable / AND-expand (active HIGH; LOW forces J LOW)' },
      { pin: 12, name: 'C',           type: 'input',  description: 'AND group 2 input C (C·D)' },
      { pin: 13, name: 'D',           type: 'input',  description: 'AND group 2 input D (C·D)' },
      { pin: 14, name: 'VDD',         type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // AOI_4WIDE: NOT((A·B)|(C·D)|(E·F)|(G·H) | INH | !ENABLE). The 9th input is
      // the active-HIGH INHIBIT/EXP (ORed in); the 10th is the active-HIGH
      // ENABLE/EXP (a LOW forces the output LOW). See specificChipsSim.js.
      { type: 'AOI_4WIDE', inputs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'INHIBIT/EXP', 'ENABLE/EXP'], output: 'J' },
    ],
  },
};
