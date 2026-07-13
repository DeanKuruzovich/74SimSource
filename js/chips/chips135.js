// chips135.js — Block 135: CMOS 4000 series logic ICs (coverage expansion)
// CD40194B — CMOS 4-bit BIDIRECTIONAL universal shift register with four
// operating modes (hold / shift right / shift left / parallel load) and an
// asynchronous active-LOW RESET. The CMOS-family equivalent of the 74194.
//
// Pinout + behavior verified by reading the Texas Instruments datasheet
// "CD40194B Types — CMOS 4-Bit Bidirectional Universal Shift Register"
// (SCHS197B, Revised July 2003) directly as rendered PDF page images (pdftoppm
// → Read), NOT via the WebFetch text summarizer which mangles these scans (see
// issues.md C4). FUNCTIONAL DIAGRAM read from page 1 at 450 dpi; CONTROL TRUTH
// TABLE read from page 2.
//
// ⚠ PINOUT (issues.md C2 lesson — verified, not cloned from the 74194 sibling,
// even though the two terminal assignments coincide). From the FUNCTIONAL
// DIAGRAM, DIP-16 terminal assignment is:
//   1 RESET (active LOW), 2 SHIFT-RIGHT IN, 3 D0, 4 D1, 5 D2, 6 D3,
//   7 SHIFT-LEFT IN, 8 VSS, 9 S0, 10 S1, 11 CLOCK,
//   12 Q3, 13 Q2, 14 Q1, 15 Q0, 16 VDD.
// (The CD40194B datasheet labels the parallel inputs D0–D3 and the outputs
// Q0–Q3, where the bipolar 74194 labels them A–D / QA–QD; same positions.)
//
// ⚠ PRIMITIVE: reuses the existing `SHIFT_REG_4BIT_BIDIR_CLR` engine primitive
// (js/specificChipsSim.js) that already drives the 74194 — same function: four
// modes selected by S1/S0, async active-LOW clear. No engine work; this was
// purely authoring the DB entry. CONTROL TRUTH TABLE confirms the polarity
// match: RESET=0 → all Q=0 (async); RESET=1 with rising CLOCK →
//   S0=0,S1=0 → No Change (hold); S0=1,S1=0 → Shift Right (Q0→Q3, SR-IN→Q0);
//   S0=0,S1=1 → Shift Left (Q3→Q0, SL-IN→Q3); S0=1,S1=1 → Parallel Load.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md for the full roadmap.
// Chips: CD40194
export const CHIPS_BLOCK_135 = {

  // ── CD40194: 4-bit bidirectional universal shift register (16-pin) ──────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD40194B Types — CMOS 4-Bit Bidirectional Universal Shift
     Register", SCHS197B (Revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40194b.pdf
     Verified: terminal assignment from the FUNCTIONAL DIAGRAM (page 1) and the
     CONTROL TRUTH TABLE (page 2), read as 450-dpi PDF page images (issues.md
     C4 — the text summarizer is unreliable for these scans).
     Terminal assignment (FUNCTIONAL DIAGRAM, page 1):
       1 RESET, 2 SHIFT-RIGHT IN, 3 D0, 4 D1, 5 D2, 6 D3, 7 SHIFT-LEFT IN,
       8 VSS, 9 S0, 10 S1, 11 CLOCK, 12 Q3, 13 Q2, 14 Q1, 15 Q0, 16 VDD. */
  'CD40194': {
    name: 'CD40194',
    simpleName: '4-bit Bidirectional Shift Register',
    description: 'CMOS 4-bit universal shift register, async active-LOW reset (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40194b.pdf',
    tags: ['shift register', '4 bit', 'bidirectional', 'parallel load', 'CMOS', '4000 series', 'sequential'],
    guideOverview: 'The CD40194 is a 4-bit universal bidirectional shift register, the CMOS version of the 74194. Two mode select pins (S0, S1) choose one of four operations applied on each rising clock edge: hold the current state (S1S0=00), shift right with the SHIFT-RIGHT IN bit entering at Q0 (S1S0=01), shift left with the SHIFT-LEFT IN bit entering at Q3 (S1S0=10), or load all four bits in parallel from D0 to D3 (S1S0=11). An asynchronous active-LOW RESET forces all outputs LOW immediately, independent of the clock or mode. It is the standard part for serial/parallel data conversion and ring counters.',
    guidePinDescriptions: {
      'RESET':  'Asynchronous reset, active LOW. Immediately forces all Q outputs to 0, independent of clock or mode select.',
      'SR_IN':  'Shift-right serial input. This bit is loaded into Q0 on the rising clock edge when S1S0=01 (shift right). Data then moves Q0→Q1→Q2→Q3.',
      'D0':     'Parallel data input for Q0. Loaded into Q0 when S1S0=11 (parallel load) on the rising clock edge.',
      'D1':     'Parallel data input for Q1.',
      'D2':     'Parallel data input for Q2.',
      'D3':     'Parallel data input for Q3.',
      'SL_IN':  'Shift-left serial input. This bit is loaded into Q3 on the rising clock edge when S1S0=10 (shift left). Data then moves Q3→Q2→Q1→Q0.',
      'VSS':    'Ground reference / negative supply (pin 8).',
      'S0':     'Mode select bit 0. See mode table below.',
      'S1':     'Mode select bit 1. See mode table below.',
      'CLOCK':  'Clock input. All shift and load operations occur on the rising (LOW to HIGH) edge.',
      'Q3':     'Bit 3 output. Serial output for right-shift cascading (connect to SHIFT-RIGHT IN of the next chip).',
      'Q2':     'Bit 2 output.',
      'Q1':     'Bit 1 output.',
      'Q0':     'Bit 0 output. Serial output for left-shift cascading (connect to SHIFT-LEFT IN of the previous chip).',
      'VDD':    'Positive supply (pin 16).',
    },
    pinout: [
      { pin:  1, name: 'RESET', type: 'input'  },
      { pin:  2, name: 'SR_IN', type: 'input'  },
      { pin:  3, name: 'D0',    type: 'input'  },
      { pin:  4, name: 'D1',    type: 'input'  },
      { pin:  5, name: 'D2',    type: 'input'  },
      { pin:  6, name: 'D3',    type: 'input'  },
      { pin:  7, name: 'SL_IN', type: 'input'  },
      { pin:  8, name: 'VSS',   type: 'power'  },
      { pin:  9, name: 'S0',    type: 'input'  },
      { pin: 10, name: 'S1',    type: 'input'  },
      { pin: 11, name: 'CLOCK', type: 'input'  },
      { pin: 12, name: 'Q3',    type: 'output' },
      { pin: 13, name: 'Q2',    type: 'output' },
      { pin: 14, name: 'Q1',    type: 'output' },
      { pin: 15, name: 'Q0',    type: 'output' },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    // SHIFT_REG_4BIT_BIDIR_CLR contract (js/specificChipsSim.js):
    //   inputs:  [CLR, CLK, S0, S1, SER_R, SER_L, A, B, C, D]
    //   outputs: [QA, QB, QC, QD]   (QA = shift-right entry / LSB end)
    // CLR is active-LOW (clr===0 clears), matching the CD40194B RESET pin.
    gates: [
      { type: 'SHIFT_REG_4BIT_BIDIR_CLR',
        inputs: ['RESET', 'CLOCK', 'S0', 'S1', 'SR_IN', 'SL_IN', 'D0', 'D1', 'D2', 'D3'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3'] },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Mode Select Table',
        paragraphs: [
          'S1 and S0 together select one of four operations, applied on every rising clock edge (RESET must be HIGH):',
        ],
        formulas: [
          'S1=0, S0=0 → Hold (all outputs unchanged)',
          'S1=0, S0=1 → Shift right: Q0←SHIFT-RIGHT IN, Q1←Q0, Q2←Q1, Q3←Q2',
          'S1=1, S0=0 → Shift left:  Q3←SHIFT-LEFT IN, Q2←Q3, Q1←Q2, Q0←Q1',
          'S1=1, S0=1 → Parallel load: Q0←D0, Q1←D1, Q2←D2, Q3←D3',
        ],
      },
      {
        title: 'Cascading to Wider Shift Registers',
        paragraphs: [
          'For an 8-bit right shift register, connect Q3 of the first CD40194 to the SHIFT-RIGHT IN of the second; share the CLOCK and mode lines. For left shift, connect Q0 of the second chip to the SHIFT-LEFT IN of the first.',
          'For a ring counter, feed Q3 back to SHIFT-RIGHT IN in shift-right mode. The bit pattern circulates indefinitely.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Serial-to-parallel conversion: hold S1S0=01 (shift right), clock in bits via SHIFT-RIGHT IN, then switch to hold (S1S0=00) to read the parallel output.',
          'Parallel-to-serial conversion: parallel load with S1S0=11, then shift right with S1S0=01, reading Q3 serially.',
          'Johnson counter: feed the complement of Q3 back to SHIFT-RIGHT IN (via an inverter) for a self-decoding 8-state counter.',
        ],
      },
    ],
  },
};
