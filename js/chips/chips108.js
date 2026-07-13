// ─────────────────────────────────────────────────────────────────────────────
// chips108.js — CMOS 4000-series coverage expansion (Batch 3)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_108.
//
//   CD4503 — hex non-inverting buffer with 3-state outputs (split disable)
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_108 = {
  // ── CD4503: Hex Non-Inverting Buffer, 3-state (split disable) ──────────────
  /* Primary source: Texas Instruments / Harris Semiconductor, CD4503B datasheet
     (SCHS068C, Revised October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4503b.pdf
     Pinout + truth table read directly from the datasheet PDF page images
     (Functional Diagram + Terminal Assignment "TOP VIEW" + Truth Table), not a
     text summarizer — see issues.md C4. NOT cloned from the 74365 hex-buffer
     siblings — the CD4503 has its own pinout AND two SPLIT, active-HIGH disable
     controls (one for four buffers, one for two) rather than a single combined
     active-LOW enable (see issues.md C2). Pin-compatible with MM80C97 / MC14503 /
     340097. Pin map (16-pin DIP): DIS A(1), D1(2), D2(3), D3(4), Q1(5), Q2(6),
     Q3(7), VSS(8), Q4(9), D4(10), Q5(11), D5(12), Q6(13), D6(14), DIS B(15),
     VDD(16). DIS A controls buffers 1-4; DIS B controls buffers 5-6. */
  'CD4503': {
    name: 'CD4503',
    simpleName: 'Hex 3-State Buffer',
    description: 'Hex non-inverting buffer, split output-disable, 3-state outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4503b.pdf',
    tags: ['cmos', '4000', 'hex', 'buffer', 'non-inverting', 'tri-state', '3-state', 'disable', 'bus', 'driver', 'interface'],
    guideOverview: 'The CD4503B is a hex non-inverting buffer with 3-state outputs and high sink/source current capability, designed for interfacing ICs and driving data buses (CMOS-to-TTL). Each of the six channels normally passes its data straight through: Qn = Dn. What makes the CD4503 unusual is that it has TWO independent disable controls, each active HIGH: DISABLE A puts the first four buffers (Q1–Q4) into the high-impedance state, while DISABLE B independently puts the remaining two buffers (Q5–Q6) into high-impedance. This split lets one chip drive two separately enabled bus groups. It is pin-compatible with the MM80C97, MC14503, and 340097.',
    guidePinDescriptions: {
      D1: 'Data input 1 (buffered to Q1; group A).',
      D2: 'Data input 2 (buffered to Q2; group A).',
      D3: 'Data input 3 (buffered to Q3; group A).',
      D4: 'Data input 4 (buffered to Q4; group A).',
      D5: 'Data input 5 (buffered to Q5; group B).',
      D6: 'Data input 6 (buffered to Q6; group B).',
      Q1: 'Non-inverting 3-state output 1 = D1 (disabled by DIS A).',
      Q2: 'Non-inverting 3-state output 2 = D2 (disabled by DIS A).',
      Q3: 'Non-inverting 3-state output 3 = D3 (disabled by DIS A).',
      Q4: 'Non-inverting 3-state output 4 = D4 (disabled by DIS A).',
      Q5: 'Non-inverting 3-state output 5 = D5 (disabled by DIS B).',
      Q6: 'Non-inverting 3-state output 6 = D6 (disabled by DIS B).',
      'DIS A': 'Disable control A (active HIGH). HIGH = buffers 1–4 (Q1–Q4) go to the high-impedance (3-state) condition; LOW = those four outputs are enabled.',
      'DIS B': 'Disable control B (active HIGH). HIGH = buffers 5–6 (Q5–Q6) go to the high-impedance (3-state) condition; LOW = those two outputs are enabled.',
      VSS: 'Ground reference (pin 8).',
      VDD: 'Positive supply (+3 V to +18 V; +5 V in this simulator) at pin 16.',
    },
    guideSections: [
      {
        title: 'Two independently disabled buffer groups',
        paragraphs: [
          'With both disable controls LOW, every channel is a simple non-inverting buffer: Qn = Dn. The high-drive 3-state outputs can directly interface CMOS logic to a TTL or shared data bus.',
          'Driving DISABLE A HIGH releases buffers 1–4 (Q1–Q4) to high-impedance without affecting buffers 5–6. Driving DISABLE B HIGH releases buffers 5–6 (Q5–Q6) to high-impedance without affecting buffers 1–4.',
          'Because the two groups are controlled separately, one CD4503 can service two bus groups that are enabled at different times — e.g. a 4-bit nibble plus a separate 2-bit control field.',
        ],
        formulas: [
          'Qn = Dn                             (governing DISABLE = 0)',
          'Q1..Q4 = high-impedance (Z)         (DIS A = 1)',
          'Q5..Q6 = high-impedance (Z)         (DIS B = 1)',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'DIS A', type: 'input',  description: 'Disable control A (active HIGH → buffers 1-4 Hi-Z)' },
      { pin: 2,  name: 'D1',    type: 'input',  description: 'Data input 1' },
      { pin: 3,  name: 'D2',    type: 'input',  description: 'Data input 2' },
      { pin: 4,  name: 'D3',    type: 'input',  description: 'Data input 3' },
      { pin: 5,  name: 'Q1',    type: 'output', description: 'Non-inverting 3-state output 1 = D1' },
      { pin: 6,  name: 'Q2',    type: 'output', description: 'Non-inverting 3-state output 2 = D2' },
      { pin: 7,  name: 'Q3',    type: 'output', description: 'Non-inverting 3-state output 3 = D3' },
      { pin: 8,  name: 'VSS',   type: 'power',  description: 'Ground (0 V)' },
      { pin: 9,  name: 'Q4',    type: 'output', description: 'Non-inverting 3-state output 4 = D4' },
      { pin: 10, name: 'D4',    type: 'input',  description: 'Data input 4' },
      { pin: 11, name: 'Q5',    type: 'output', description: 'Non-inverting 3-state output 5 = D5' },
      { pin: 12, name: 'D5',    type: 'input',  description: 'Data input 5' },
      { pin: 13, name: 'Q6',    type: 'output', description: 'Non-inverting 3-state output 6 = D6' },
      { pin: 14, name: 'D6',    type: 'input',  description: 'Data input 6' },
      { pin: 15, name: 'DIS B', type: 'input',  description: 'Disable control B (active HIGH → buffers 5-6 Hi-Z)' },
      { pin: 16, name: 'VDD',   type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // BUFFER_HEX_TRI in CD4503 "splitDisable" mode:
      //   inputs [D1..D6, DIS A, DIS B], outputs [Q1..Q6].
      //   DIS A (active HIGH) → Q1..Q4 Hi-Z; DIS B (active HIGH) → Q5..Q6 Hi-Z;
      //   else Qn = Dn (non-inverting).
      {
        type: 'BUFFER_HEX_TRI',
        splitDisable: true,
        inputs:  ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'DIS A', 'DIS B'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
      },
    ],
  },
};
