// ─────────────────────────────────────────────────────────────────────────────
// chips102.js — CMOS 4000-series coverage expansion (Batch 2)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_102.
//
//   CD4085 — dual 2-wide 2-input AND-OR-INVERT gate, with per-gate inhibit
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_102 = {
  // ── CD4085: dual 2-wide 2-input AND-OR-INVERT, individual inhibit ──────────
  /* Primary source: Texas Instruments / Harris Semiconductor, CD4085B datasheet
     (SCHS060C, Rev. September 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4085b.pdf
     Pinout + function read directly from the datasheet PDF page images
     (Terminal Assignment + Functional Diagram), not a text summarizer — see
     issues.md C4. NOT cloned from the 74x50/74x51 siblings — see issues.md C2. */
  'CD4085': {
    name: 'CD4085',
    simpleName: 'Dual 2-Wide AOI',
    description: 'Dual 2-wide 2-input AND-OR-INVERT gate with inhibit inputs (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4085b.pdf',
    tags: ['cmos', '4000', 'aoi', 'and or invert', 'gate', 'logic', 'dual', '2-wide', 'inhibit'],
    guideOverview: 'The CD4085B contains two independent AND-OR-INVERT gates. Each gate is two 2-input AND groups (A·B and C·D) driving a 3-input NOR gate whose third input is an active-HIGH INHIBIT. So E = NOT(INHIBIT + A·B + C·D): the output is LOW whenever either AND group is fully asserted OR the inhibit is HIGH, and HIGH only when both AND groups are unasserted AND inhibit is LOW. Holding INHIBIT HIGH forces that gate\'s output LOW regardless of the data inputs. Useful for compact sum-of-products logic, decoders, and state machines.',
    guidePinDescriptions: {
      A1: 'Gate 1: input A of the first 2-input AND group (A1·B1).',
      B1: 'Gate 1: input B of the first 2-input AND group (A1·B1).',
      C1: 'Gate 1: input A of the second 2-input AND group (C1·D1).',
      D1: 'Gate 1: input B of the second 2-input AND group (C1·D1).',
      'INHIBIT 1': 'Gate 1 inhibit (active HIGH). When HIGH it forces E1 LOW regardless of the data inputs; when LOW the gate operates normally.',
      E1: 'Gate 1 AND-OR-INVERT output: E1 = NOT(INHIBIT1 + A1·B1 + C1·D1).',
      A2: 'Gate 2: input A of the first 2-input AND group (A2·B2).',
      B2: 'Gate 2: input B of the first 2-input AND group (A2·B2).',
      C2: 'Gate 2: input A of the second 2-input AND group (C2·D2).',
      D2: 'Gate 2: input B of the second 2-input AND group (C2·D2).',
      'INHIBIT 2': 'Gate 2 inhibit (active HIGH). When HIGH it forces E2 LOW regardless of the data inputs; when LOW the gate operates normally.',
      E2: 'Gate 2 AND-OR-INVERT output: E2 = NOT(INHIBIT2 + A2·B2 + C2·D2).',
      VSS: 'Ground reference (pin 7).',
      VDD: 'Positive supply (+3 V to +18 V; +5 V in this simulator) at pin 14.',
    },
    guideSections: [
      {
        title: 'AND-OR-INVERT with inhibit',
        paragraphs: [
          'Each of the two gates ANDs two pairs of inputs and ORs the two products together with the inhibit input, then inverts the result. With INHIBIT LOW, the gate is an ordinary 2-wide 2-input AOI: E = NOT((A·B)+(C·D)).',
          'Driving INHIBIT HIGH adds a third HIGH term to the internal NOR, which forces the output LOW — a convenient per-gate output disable.',
        ],
        formulas: [
          'E1 = NOT(INHIBIT1 + (A1·B1) + (C1·D1))',
          'E2 = NOT(INHIBIT2 + (A2·B2) + (C2·D2))',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'A1',          type: 'input',  description: 'Gate 1 AND group A·B, input A' },
      { pin: 2,  name: 'B1',          type: 'input',  description: 'Gate 1 AND group A·B, input B' },
      { pin: 3,  name: 'E1',          type: 'output', description: 'Gate 1 AOI output = NOT(INHIBIT1 + A1·B1 + C1·D1)' },
      { pin: 4,  name: 'E2',          type: 'output', description: 'Gate 2 AOI output = NOT(INHIBIT2 + A2·B2 + C2·D2)' },
      { pin: 5,  name: 'A2',          type: 'input',  description: 'Gate 2 AND group A·B, input A' },
      { pin: 6,  name: 'B2',          type: 'input',  description: 'Gate 2 AND group A·B, input B' },
      { pin: 7,  name: 'VSS',         type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: 'C2',          type: 'input',  description: 'Gate 2 AND group C·D, input C' },
      { pin: 9,  name: 'D2',          type: 'input',  description: 'Gate 2 AND group C·D, input D' },
      { pin: 10, name: 'INHIBIT 1',   type: 'input',  description: 'Gate 1 inhibit (active HIGH forces E1 LOW)' },
      { pin: 11, name: 'INHIBIT 2',   type: 'input',  description: 'Gate 2 inhibit (active HIGH forces E2 LOW)' },
      { pin: 12, name: 'C1',          type: 'input',  description: 'Gate 1 AND group C·D, input C' },
      { pin: 13, name: 'D1',          type: 'input',  description: 'Gate 1 AND group C·D, input D' },
      { pin: 14, name: 'VDD',         type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // AOI_2WIDE: NOT((A&B)|(C&D)|INH). 5th input is the active-HIGH inhibit.
      { type: 'AOI_2WIDE', inputs: ['A1', 'B1', 'C1', 'D1', 'INHIBIT 1'], output: 'E1' },
      { type: 'AOI_2WIDE', inputs: ['A2', 'B2', 'C2', 'D2', 'INHIBIT 2'], output: 'E2' },
    ],
  },
};
