// ─────────────────────────────────────────────────────────────────────────────
// chips105.js — CMOS 4000-series coverage expansion (Batch 2)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_105.
//
//   CD40101 — CMOS 9-bit parity generator/checker, with INHIBIT
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_105 = {
  // ── CD40101: CMOS 9-bit parity generator/checker with inhibit ──────────────
  /* Primary source: RCA / Harris / Intersil, CD40101BMS datasheet (File Number
     3350, December 1992; © Intersil 1999) — "CMOS 9-Bit Parity
     Generator/Checker". [Online]. Available:
     https://www.alldatasheet.com/datasheet-pdf/pdf/66390/INTERSIL/CD40101BMS.html
     Pinout + Functional Diagram + Description read directly from the datasheet
     page images (not a text summarizer — see issues.md C4).

     NOT cloned from the 74x180 (issues.md C2). The coverage-plan twin 74x180 is
     a *different* device: the 74x180 is 8 data inputs (A–H) plus cascade
     EVEN_IN/ODD_IN controls (no inhibit). The CD40101 has NINE plain data
     inputs (D1–D9) plus an active-HIGH INHIBIT that forces both outputs LOW.
     It is therefore the 74280-style "sum-of-nine-bits" parity device (same as
     the engine's PARITY_9BIT_SIMPLE) with the addition of the inhibit control,
     so it rides a dedicated PARITY_9BIT_INH primitive rather than PARITY_9BIT. */
  'CD40101': {
    name: 'CD40101',
    simpleName: '9-Bit Parity Gen/Checker',
    description: 'CMOS 9-bit odd/even parity generator/checker with inhibit (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.alldatasheet.com/datasheet-pdf/pdf/66390/INTERSIL/CD40101BMS.html',
    tags: ['cmos', '4000', 'parity', '9 bit', 'xor', 'combinational', 'checker', 'generator', 'inhibit'],
    guideOverview: 'The CD40101 is a CMOS 9-bit (8 data bits plus 1 parity bit) parity generator/checker. It computes the parity of nine data inputs D1–D9 and reports it on two complementary outputs: EVEN OUT is HIGH when an even number of the nine inputs are HIGH, and ODD OUT is HIGH when an odd number are HIGH. As a generator, feed eight data bits plus a LOW ninth bit and take the parity bit from EVEN OUT (for even parity) or ODD OUT (for odd parity). As a checker, feed the eight received data bits plus the received parity bit and watch the outputs flag an error. Word length is expandable by cascading, and an active-HIGH INHIBIT input forces both outputs LOW when set to logical 1.',
    guidePinDescriptions: {
      D1: 'Parity data input 1; one of nine bits contributing to the parity computation.',
      D2: 'Parity data input 2; one of nine bits contributing to the parity computation.',
      D3: 'Parity data input 3; one of nine bits contributing to the parity computation.',
      D4: 'Parity data input 4; one of nine bits contributing to the parity computation.',
      D5: 'Parity data input 5; one of nine bits contributing to the parity computation.',
      D6: 'Parity data input 6; one of nine bits contributing to the parity computation.',
      D7: 'Parity data input 7; one of nine bits contributing to the parity computation.',
      D8: 'Parity data input 8; one of nine bits contributing to the parity computation.',
      D9: 'Parity data input 9; one of nine bits contributing to the parity computation (often the parity bit when checking, or tied LOW when generating an 8-bit parity bit).',
      INHIBIT: 'Active-HIGH inhibit. When set to logical 1, both EVEN OUT and ODD OUT are forced to logical 0; when LOW the outputs report parity normally.',
      'EVEN OUT': 'Even parity output; HIGH when an even number of the nine data inputs are HIGH (and INHIBIT is LOW).',
      'ODD OUT': 'Odd parity output; HIGH when an odd number of the nine data inputs are HIGH (and INHIBIT is LOW).',
      VSS: 'Ground reference (pin 7).',
      VDD: 'Positive supply (+3 V to +18 V; +5 V in this simulator) at pin 14.',
    },
    guideSections: [
      {
        title: 'Parity generation and checking',
        paragraphs: [
          'The chip counts the number of HIGH levels across the nine data inputs D1–D9. If that count is even, EVEN OUT is HIGH and ODD OUT is LOW; if it is odd, ODD OUT is HIGH and EVEN OUT is LOW. With nine inputs the two outputs are always complementary (unless inhibited).',
          'To generate an 8-bit parity bit, drive eight bits onto D1–D8, tie D9 LOW, and take EVEN OUT for an even-parity bit or ODD OUT for an odd-parity bit. To check a 9-bit word (8 data + 1 received parity), drive all nine inputs and read the error from the outputs.',
        ],
        note: 'EVEN OUT and ODD OUT are complementary while INHIBIT is LOW.',
      },
      {
        title: 'Inhibit and cascading',
        paragraphs: [
          'Setting INHIBIT to logical 1 forces both outputs LOW regardless of the data inputs — useful for gating the result or wired bussing of multiple checkers.',
          'Word length is expandable by cascading: feed an upstream parity result into one of the data inputs of the next stage so each device adds its bits to the running parity.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'D1',       type: 'input',  description: 'Parity data input 1' },
      { pin: 2,  name: 'D2',       type: 'input',  description: 'Parity data input 2' },
      { pin: 3,  name: 'D3',       type: 'input',  description: 'Parity data input 3' },
      { pin: 4,  name: 'D4',       type: 'input',  description: 'Parity data input 4' },
      { pin: 5,  name: 'D9',       type: 'input',  description: 'Parity data input 9' },
      { pin: 6,  name: 'ODD OUT',  type: 'output', description: 'Odd parity output (HIGH when odd # of inputs HIGH)' },
      { pin: 7,  name: 'VSS',      type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: 'INHIBIT',  type: 'input',  description: 'Active-HIGH inhibit (forces both outputs LOW)' },
      { pin: 9,  name: 'EVEN OUT', type: 'output', description: 'Even parity output (HIGH when even # of inputs HIGH)' },
      { pin: 10, name: 'D5',       type: 'input',  description: 'Parity data input 5' },
      { pin: 11, name: 'D6',       type: 'input',  description: 'Parity data input 6' },
      { pin: 12, name: 'D7',       type: 'input',  description: 'Parity data input 7' },
      { pin: 13, name: 'D8',       type: 'input',  description: 'Parity data input 8' },
      { pin: 14, name: 'VDD',      type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // PARITY_9BIT_INH: EVEN/ODD from the parity of 9 data bits, with active-HIGH
      // INHIBIT forcing both outputs LOW. inputs: [D1..D9, INHIBIT]; outputs: [EVEN, ODD].
      { type: 'PARITY_9BIT_INH',
        inputs: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'INHIBIT'],
        outputs: ['EVEN OUT', 'ODD OUT'] },
    ],
  },
};
