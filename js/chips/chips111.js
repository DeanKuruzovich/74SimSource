// chips111.js — Block 111: CMOS 4000 series logic ICs (coverage expansion, Batch 4)
// Quad cross-coupled 3-STATE NOR R/S latch. Pinout + behavior verified by reading
// the TI datasheet "CD4043B, CD4044B Types — CMOS Quad 3-State R/S Latches",
// SCHS041D (Revised October 2003), directly as PDF page images (Read with pages:),
// NOT via the WebFetch text summarizer which mangles these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 4) for the full roadmap.
// Chips: CD4043
export const CHIPS_BLOCK_111 = {

  // ── CD4043: quad 3-state NOR R/S latch (16-pin) ─────────────────────────────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD4043B, CD4044B Types — CMOS Quad 3-State R/S Latches (High-Voltage Types,
     20-Volt Rating)", SCHS041D (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4043b.pdf
     Pinout taken from the "CD4043B" Terminal Assignment (TOP VIEW) AND the
     CD4043B Functional Diagram on page 1 — both cross-checked and in agreement:
       1=Q4 2=Q1 3=R1 4=S1 5=ENABLE 6=S2 7=R2 8=VSS
       9=Q2 10=Q3 11=R3 12=S3 13=NC 14=S4 15=R4 16=VDD.
     Behavior from the page-1 "Equivalent NOR Latch" logic diagram + the CD4043B
     TRUTH TABLE:
         S  R  E | Q
         X  X  0 | open circuit (3-state, no connection on Q outputs)
         0  0  1 | NC  (no change / hold)
         0  1  1 | 0   (reset)
         1  0  1 | 1   (set)
         1  1  1 | 1   (Δ "DOMINATED BY S=1 INPUT" — SET dominates for the NOR latch)
       The four latches share one common active-HIGH ENABLE: ENABLE HIGH connects
       the stored states to the Q outputs; ENABLE LOW disconnects them, leaving the
       Q outputs in an open-circuit (3-state) condition while the latch contents are
       retained.
     NOTE on the engine primitive: the pre-existing single-cell SR latch primitives
     do not fit — `SR_LATCH` (74x118) is a single latch with an active-LOW async
     clear and no 3-state output, and `SR_LATCH_NOR_NAND` (74279) is a single
     active-LOW cell with no enable. A dedicated `SR_LATCH_QUAD_TRI` primitive was
     added to specificChipsSim.js: four active-HIGH NOR R/S cells (set-dominant) with
     one common active-HIGH 3-state ENABLE. */
  'CD4043': {
    name: 'CD4043',
    simpleName: 'Quad 3-State NOR R/S Latch',
    description: 'Quad NOR R/S latch, common 3-state ENABLE, CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4043b.pdf',
    tags: ['cmos', '4000 series', 'latch', 'rs latch', 'sr latch', 'nor', 'quad', 'tri-state', '3-state', 'sequential'],
    guideOverview: 'The CD4043 contains four independent cross-coupled NOR R/S (set/reset) latches. Each latch has its own SET and RESET input and a single Q output. Taking SET HIGH stores a 1; taking RESET HIGH stores a 0; holding both LOW leaves the latch unchanged. Because these are NOR-type latches, if SET and RESET are HIGH at the same time the SET input wins and Q goes HIGH. All four Q outputs share one common ENABLE pin: with ENABLE HIGH the latched values appear on the Q pins, and with ENABLE LOW the Q pins are disconnected (high-impedance / 3-state) while the latches keep their stored data. This makes the part handy for multi-register buses where several devices share output lines, for holding a few bits of independent storage, and as a classic switch-bounce eliminator.',
    guidePinDescriptions: {
      S1: 'SET input for latch 1. HIGH sets Q1 = 1.',
      R1: 'RESET input for latch 1. HIGH (with SET LOW) resets Q1 = 0.',
      S2: 'SET input for latch 2.',
      R2: 'RESET input for latch 2.',
      S3: 'SET input for latch 3.',
      R3: 'RESET input for latch 3.',
      S4: 'SET input for latch 4.',
      R4: 'RESET input for latch 4.',
      Q1: 'Latch 1 output (3-state, gated by the common ENABLE).',
      Q2: 'Latch 2 output (3-state, gated by the common ENABLE).',
      Q3: 'Latch 3 output (3-state, gated by the common ENABLE).',
      Q4: 'Latch 4 output (3-state, gated by the common ENABLE).',
      ENABLE: 'Common 3-state output enable. HIGH connects the latched states to Q1–Q4; LOW puts all four Q outputs in a high-impedance (open-circuit) state while the latch contents are retained.',
      NC: 'No internal connection.',
      VSS: 'Negative supply / ground (0 V).',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q4',     type: 'output' },
      { pin:  2, name: 'Q1',     type: 'output' },
      { pin:  3, name: 'R1',     type: 'input'  },
      { pin:  4, name: 'S1',     type: 'input'  },
      { pin:  5, name: 'ENABLE', type: 'input'  },
      { pin:  6, name: 'S2',     type: 'input'  },
      { pin:  7, name: 'R2',     type: 'input'  },
      { pin:  8, name: 'VSS',    type: 'power'  },
      { pin:  9, name: 'Q2',     type: 'output' },
      { pin: 10, name: 'Q3',     type: 'output' },
      { pin: 11, name: 'R3',     type: 'input'  },
      { pin: 12, name: 'S3',     type: 'input'  },
      { pin: 13, name: 'NC',     type: 'nc'     },
      { pin: 14, name: 'S4',     type: 'input'  },
      { pin: 15, name: 'R4',     type: 'input'  },
      { pin: 16, name: 'VDD',    type: 'power'  },
    ],
    gates: [
      {
        type: 'SR_LATCH_QUAD_TRI',
        inputs: ['S1', 'R1', 'S2', 'R2', 'S3', 'R3', 'S4', 'R4', 'ENABLE'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4'],
      },
    ],
    guideSections: [
      {
        title: 'Set, Reset, Hold — and Who Wins a Tie',
        paragraphs: [
          'Each of the four cells is a cross-coupled NOR R/S latch. Drive SET HIGH to store a 1 on that latch\'s Q output; drive RESET HIGH (with SET LOW) to store a 0. Hold both inputs LOW and the latch simply keeps whatever it had — that is the memory behaviour that makes it a latch.',
          'The one case that needs care is SET and RESET both HIGH at the same time. On a NOR-type R/S latch the SET input dominates, so Q goes HIGH. (Its NAND-based sibling, the CD4044, resolves the same conflict the opposite way — RESET wins — which is the main functional difference between the two parts.)',
        ],
        list: [
          'S=1, R=0 → Q = 1 (set).',
          'S=0, R=1 → Q = 0 (reset).',
          'S=0, R=0 → Q holds its previous value.',
          'S=1, R=1 → Q = 1 (SET dominates on this NOR latch).',
        ],
      },
      {
        title: 'The Common 3-State ENABLE',
        paragraphs: [
          'All four Q outputs are gated by a single ENABLE pin. With ENABLE HIGH the four latch states are presented on Q1–Q4 normally. With ENABLE LOW the Q outputs are placed in a high-impedance (open-circuit) state — they neither drive HIGH nor LOW — which lets several CD4043s share a common output bus, with only the selected device driving it.',
          'Disabling the outputs does not disturb the stored data: the latches continue to track their SET/RESET inputs internally, so when ENABLE returns HIGH the current latched values reappear immediately.',
        ],
        note: '74Sim models this as an idealized digital latch with no propagation delay (see issues.md A1): set/reset/hold follow the datasheet truth table exactly for static inputs, and ENABLE LOW drives the Q pins to a true high-impedance state (distinct from a driven LOW). The dedicated SR_LATCH_QUAD_TRI primitive backs this entry — the single-cell SR_LATCH (74x118) and SR_LATCH_NOR_NAND (74279) primitives lack both the quad structure and the common 3-state enable.',
      },
    ],
  },

};
