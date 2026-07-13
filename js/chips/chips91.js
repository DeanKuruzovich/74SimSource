// chips91.js — Block 91: CMOS 4000 series logic ICs (coverage expansion, Batch 4)
// Quad clocked "D" latch with complementary outputs. Pinout + behavior verified by
// reading the TI datasheet "CD4042B Types — CMOS Quad Clocked 'D' Latch", SCHS040D
// (Revised October 2003) directly as PDF page images (Read with pages: + rendered
// crops), NOT via the WebFetch text summarizer which mangles these scans (see
// issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 4) for the full roadmap.
// Chips: CD4042
export const CHIPS_BLOCK_91 = {

  // ── CD4042: quad clocked "D" latch, complementary outputs (16-pin) ─────────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD4042B Types — CMOS Quad Clocked 'D' Latch (High-Voltage Types, 20-Volt
     Rating)", SCHS040D (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4042b.pdf
     Pinout taken from the "CD4042B Terminal Assignment" (TOP VIEW) AND the
     Functional Diagram on page 1 — both cross-checked and in agreement:
       1=Q4 2=Q1 3=Q1(bar) 4=D1 5=CLOCK 6=POLARITY 7=D2 8=VSS
       9=Q2(bar) 10=Q2 11=Q3 12=Q3(bar) 13=D3 14=D4 15=Q4(bar) 16=VDD.
     Behavior from the page-1 description + truth table (Fig. 1):
       - The four latches share one common CLOCK whose active level is set by the
         POLARITY input. For POLARITY=0 the latches are transparent (Q follows D)
         while CLOCK is LOW and capture/hold on the LOW→HIGH clock transition.
         For POLARITY=1 they are transparent while CLOCK is HIGH and hold on the
         HIGH→LOW transition. Net effect: transparent when CLOCK == POLARITY,
         otherwise the stored data is held at the outputs.
       - Each latch provides both Q and its complement Q(bar); the n-/p-channel
         outputs are balanced and electrically identical.
     NOTE on the engine primitive: the hinted 74375 `D_LATCH_QUAD_COMPL` does not
     fit — that part has two direct active-HIGH enable pins (C12/C34) whereas the
     CD4042 derives one common transparent-enable from CLOCK and POLARITY and has
     no per-latch enable pin. A dedicated `D_LATCH_QUAD_4042` primitive was added
     to specificChipsSim.js (see issues.md). */
  'CD4042': {
    name: 'CD4042',
    simpleName: 'Quad Clocked D Latch',
    description: 'Quad clocked "D" latch, complementary outputs, polarity, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4042b.pdf',
    tags: ['cmos', '4000 series', 'latch', 'd latch', 'quad', 'transparent', 'complementary', 'sequential'],
    guideOverview: 'The CD4042 contains four "D" latches that all share one common CLOCK, gated by a single POLARITY input. The POLARITY pin picks which clock level makes the latches transparent: with POLARITY LOW the latches follow their D inputs while CLOCK is LOW and capture/hold the data on the rising clock edge; with POLARITY HIGH they follow D while CLOCK is HIGH and hold on the falling edge. Put simply, the latches are transparent whenever CLOCK and POLARITY are at the same level and hold their stored data otherwise. Each latch presents both a true output Q and its complement Q̄, which are electrically identical balanced CMOS outputs. Typical uses are buffer storage, holding registers, and general digital latching where you want the clock edge polarity to be program-selectable.',
    guidePinDescriptions: {
      D1: 'Data input for latch 1. Captured to Q1 while the latches are transparent (CLOCK level equals POLARITY).',
      D2: 'Data input for latch 2.',
      D3: 'Data input for latch 3.',
      D4: 'Data input for latch 4.',
      CLOCK: 'Common clock for all four latches. Together with POLARITY it sets when the latches are transparent vs. holding.',
      POLARITY: 'Clock-polarity select. LOW = transparent while CLOCK is LOW (latch on rising edge); HIGH = transparent while CLOCK is HIGH (latch on falling edge).',
      Q1: 'True output of latch 1.',
      'Q1n': 'Complementary (inverted) output of latch 1.',
      Q2: 'True output of latch 2.',
      'Q2n': 'Complementary (inverted) output of latch 2.',
      Q3: 'True output of latch 3.',
      'Q3n': 'Complementary (inverted) output of latch 3.',
      Q4: 'True output of latch 4.',
      'Q4n': 'Complementary (inverted) output of latch 4.',
      VSS: 'Negative supply / ground (0 V).',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q4',       type: 'output' },
      { pin:  2, name: 'Q1',       type: 'output' },
      { pin:  3, name: 'Q1n',      type: 'output' },
      { pin:  4, name: 'D1',       type: 'input'  },
      { pin:  5, name: 'CLOCK',    type: 'input'  },
      { pin:  6, name: 'POLARITY', type: 'input'  },
      { pin:  7, name: 'D2',       type: 'input'  },
      { pin:  8, name: 'VSS',      type: 'power'  },
      { pin:  9, name: 'Q2n',      type: 'output' },
      { pin: 10, name: 'Q2',       type: 'output' },
      { pin: 11, name: 'Q3',       type: 'output' },
      { pin: 12, name: 'Q3n',      type: 'output' },
      { pin: 13, name: 'D3',       type: 'input'  },
      { pin: 14, name: 'D4',       type: 'input'  },
      { pin: 15, name: 'Q4n',      type: 'output' },
      { pin: 16, name: 'VDD',      type: 'power'  },
    ],
    gates: [
      {
        type: 'D_LATCH_QUAD_4042',
        inputs: ['D1', 'D2', 'D3', 'D4', 'CLOCK', 'POLARITY'],
        outputs: ['Q1', 'Q1n', 'Q2', 'Q2n', 'Q3', 'Q3n', 'Q4', 'Q4n'],
      },
    ],
    guideSections: [
      {
        title: 'Latching With Selectable Clock Polarity',
        paragraphs: [
          'All four latches share a single CLOCK pin, and the POLARITY pin decides which clock level opens them. The simplest way to think about it: the latches are transparent (each Q tracks its D) whenever CLOCK and POLARITY are at the same logic level, and they freeze the last value whenever the two differ.',
          'With POLARITY LOW you get a rising-edge-latching, active-LOW-transparent latch: Q follows D while CLOCK is LOW, and the value present at the LOW→HIGH transition is held. With POLARITY HIGH the sense flips: Q follows D while CLOCK is HIGH, and data is held on the HIGH→LOW transition.',
          'Every latch brings out both its true output Q and its complement Q̄, so you can read either polarity without an external inverter.',
        ],
        list: [
          'POLARITY=0, CLOCK=0 → transparent (Q = D).',
          'POLARITY=0, CLOCK=1 → hold (data latched on the rising edge).',
          'POLARITY=1, CLOCK=1 → transparent (Q = D).',
          'POLARITY=1, CLOCK=0 → hold (data latched on the falling edge).',
        ],
        note: '74Sim models this as an idealized level-sensitive (transparent) latch with no propagation delay (see issues.md A1): the latches are transparent exactly when CLOCK equals POLARITY and otherwise hold the stored data, which reproduces the datasheet truth table. The hinted 74375 D_LATCH_QUAD_COMPL primitive was not reused because that part exposes two direct enable pins rather than the CD4042\'s single CLOCK + POLARITY scheme; a dedicated D_LATCH_QUAD_4042 primitive backs this entry.',
      },
    ],
  },

};
