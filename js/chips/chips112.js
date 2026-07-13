// chips112.js — Block 112: CMOS 4000 series logic ICs (coverage expansion, Batch 4)
// Quad NAND R/S latch with 3-state outputs. Pinout + truth table verified by reading
// the TI datasheet "CD4043B, CD4044B Types — CMOS Quad 3-State R/S Latches", SCHS041D
// (Revised October 2003) directly as PDF page images (Read with pages: + 300-dpi
// rendered crops), NOT via the WebFetch text summarizer which mangles these scans
// (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 4) for the full roadmap.
// Chips: CD4044
export const CHIPS_BLOCK_112 = {

  // ── CD4044: quad NAND R/S latch, 3-state outputs (16-pin) ───────────────────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD4043B, CD4044B Types — CMOS Quad 3-State R/S Latches (High-Voltage Types,
     20-Volt Rating)", SCHS041D (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4044b.pdf
     Pinout taken from the "CD4044B" Terminal Assignment (TOP VIEW) AND the CD4044B
     Functional Diagram on page 1 — both cross-checked and in agreement:
       1=Q4 2=NC 3=S1 4=R1 5=ENABLE 6=R2 7=S2 8=VSS
       9=Q2 10=Q3 11=S3 12=R3 13=Q1 14=R4 15=S4 16=VDD.
     Per-latch wiring (from the Functional Diagram):
       Latch 1: S1=3, R1=4  → Q1=13
       Latch 2: S2=7, R2=6  → Q2=9
       Latch 3: S3=11,R3=12 → Q3=10
       Latch 4: S4=15,R4=14 → Q4=1
     Behavior from the CD4044B TRUTH TABLE (page 1), columns S R E | Q:
       X X 0 | OC   (ENABLE=0 → outputs open-circuit / 3-state)
       1 1 1 | NC   (hold — NAND latch inputs are active LOW, both inactive)
       0 1 1 | 1    (set:   S taken LOW)
       1 0 1 | 0    (reset: R taken LOW)
       0 0 1 | 0    ("DOMINATED BY R=0 INPUT" → reset wins when both are active)
     NOTE on the engine primitive: the coverage-plan hint `SR_LATCH_NOR_NAND`
     (the 74279) does NOT fit — that primitive is a single-output cell with TWO
     S inputs NANDed together, it *holds* when both S and R are active (it does
     NOT implement the CD4044's reset-dominance), and it has no 3-state ENABLE.
     A dedicated `SR_LATCH_QUAD_TRI` primitive was added to specificChipsSim.js:
     four latches, one common active-HIGH 3-state ENABLE, with a `gate.activeLow`
     flag that selects the NAND (active-LOW, reset-dominant — this CD4044) vs the
     NOR (active-HIGH, set-dominant — the sibling CD4043) variant. See issues.md. */
  'CD4044': {
    name: 'CD4044',
    simpleName: 'Quad NAND R/S Latch (3-State)',
    description: 'Quad NAND R/S latch, active-LOW S/R, 3-state ENABLE, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4044b.pdf',
    tags: ['cmos', '4000 series', 'latch', 'rs latch', 'sr latch', 'nand latch', 'quad', 'three-state', 'tri-state', 'sequential'],
    guideOverview: 'The CD4044 contains four independent cross-coupled NAND R/S latches whose outputs all share one common ENABLE pin. Because the latches are built from NAND gates, the SET and RESET inputs are active LOW: pull a latch\'s S input LOW (with R HIGH) to set its Q output HIGH, or pull R LOW (with S HIGH) to reset Q LOW. With both S and R HIGH the latch holds its last value. If both S and R are taken LOW at once the RESET wins — Q goes LOW (the datasheet notes the output is "dominated by the R=0 input"). The four Q outputs are 3-state: a common ENABLE input connects the stored latch states to the Q pins when HIGH, and disconnects them to an open-circuit (high-impedance) condition when LOW, which lets several CD4044 devices share a common output bus. The stored data is retained while the outputs are disabled. The companion CD4043 is the NOR version, with active-HIGH inputs and set-dominance instead.',
    guidePinDescriptions: {
      S1: 'Active-LOW SET input for latch 1. Pull LOW (with R1 HIGH) to drive Q1 HIGH.',
      R1: 'Active-LOW RESET input for latch 1. Pull LOW to drive Q1 LOW (reset dominates set).',
      S2: 'Active-LOW SET input for latch 2.',
      R2: 'Active-LOW RESET input for latch 2.',
      S3: 'Active-LOW SET input for latch 3.',
      R3: 'Active-LOW RESET input for latch 3.',
      S4: 'Active-LOW SET input for latch 4.',
      R4: 'Active-LOW RESET input for latch 4.',
      Q1: 'Three-state output of latch 1. Driven when ENABLE is HIGH, open-circuit (Hi-Z) when ENABLE is LOW.',
      Q2: 'Three-state output of latch 2.',
      Q3: 'Three-state output of latch 3.',
      Q4: 'Three-state output of latch 4.',
      ENABLE: 'Common active-HIGH output enable. HIGH connects all four latch states to the Q pins; LOW puts all four Q outputs in the high-impedance (open-circuit) state. Stored data is retained either way.',
      NC: 'No internal connection.',
      VSS: 'Negative supply / ground (0 V).',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q4',     type: 'output' },
      { pin:  2, name: 'NC',     type: 'nc'     },
      { pin:  3, name: 'S1',     type: 'input'  },
      { pin:  4, name: 'R1',     type: 'input'  },
      { pin:  5, name: 'ENABLE', type: 'input'  },
      { pin:  6, name: 'R2',     type: 'input'  },
      { pin:  7, name: 'S2',     type: 'input'  },
      { pin:  8, name: 'VSS',    type: 'power'  },
      { pin:  9, name: 'Q2',     type: 'output' },
      { pin: 10, name: 'Q3',     type: 'output' },
      { pin: 11, name: 'S3',     type: 'input'  },
      { pin: 12, name: 'R3',     type: 'input'  },
      { pin: 13, name: 'Q1',     type: 'output' },
      { pin: 14, name: 'R4',     type: 'input'  },
      { pin: 15, name: 'S4',     type: 'input'  },
      { pin: 16, name: 'VDD',    type: 'power'  },
    ],
    gates: [
      {
        type: 'SR_LATCH_QUAD_TRI',
        activeLow: true,
        inputs: ['S1', 'R1', 'S2', 'R2', 'S3', 'R3', 'S4', 'R4', 'ENABLE'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4'],
      },
    ],
    guideSections: [
      {
        title: 'Active-LOW NAND Latches With Reset Dominance',
        paragraphs: [
          'Each of the four latches is a cross-coupled pair of NAND gates, which makes the SET and RESET inputs active LOW. To set a latch, take its S input LOW while R stays HIGH — its Q output goes HIGH. To reset it, take R LOW while S stays HIGH — Q goes LOW. With both S and R held HIGH the latch simply remembers its last state.',
          'If you take both S and R LOW at the same time, the RESET wins: Q goes LOW. The datasheet calls this "dominated by the R=0 input." This is the opposite tie-break from the NOR-based CD4043, where SET dominates instead.',
        ],
        list: [
          'S=1, R=1 → hold (no change).',
          'S=0, R=1 → set (Q = 1).',
          'S=1, R=0 → reset (Q = 0).',
          'S=0, R=0 → Q = 0 (reset dominates).',
        ],
      },
      {
        title: 'Common 3-State Output Enable',
        paragraphs: [
          'All four Q outputs are gated by a single ENABLE pin. When ENABLE is HIGH the latch states appear on the Q pins as normal driven outputs. When ENABLE is LOW the Q pins are disconnected into a high-impedance (open-circuit) state, so the chip can share a common data bus with other 3-state devices. Disabling the outputs does not disturb the stored data — taking ENABLE HIGH again presents the same latched values.',
        ],
        note: '74Sim models the latches as idealized digital storage with no propagation delay (see issues.md A1): the datasheet truth table is reproduced exactly for static inputs, including the reset-dominant tie-break and the open-circuit (Hi-Z) outputs when ENABLE is LOW. The hinted SR_LATCH_NOR_NAND (74279) primitive was not reused because it has two NANDed S inputs per cell, holds instead of resetting when both inputs are active, and has no 3-state enable; a dedicated SR_LATCH_QUAD_TRI primitive backs this entry (shared with the CD4043 via a gate.activeLow flag).',
      },
    ],
  },

};
