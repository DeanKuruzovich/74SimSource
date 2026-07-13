// chips84.js — Block 84: CMOS 4000 series logic ICs (coverage expansion, Batch 5)
// Ripple counters. Pinout + behavior verified by reading the TI datasheet
// "CD4020B, CD4024B, CD4040B Types" (SCHS030D) directly as PDF page images
// (Read with pages:), NOT via the WebFetch text summarizer which mangles these
// scans (see issues.md C4). The CD4024B Terminal Assignments + Functional
// Diagram were read from the rendered datasheet page (footer 3-66): NC pins are
// 8, 10 and 13, so the seven stage outputs sit on Q1=12, Q2=11, Q3=9, Q4=6,
// Q5=5, Q6=4, Q7=3 — the well-known CD4024/HEF4024 pin map (cross-checked, NOT
// cloned from the sibling CD4020 whose own NC layout differs).
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 5) for the full roadmap.
// Chips: CD4024
export const CHIPS_BLOCK_84 = {

  // ── CD4024: 7-stage binary ripple counter (14-pin) ───────────────────────
  /* Primary source: Texas Instruments, "CD4020B, CD4024B, CD4040B Types — CMOS
     Ripple-Carry Binary Counter/Dividers", SCHS030D (Rev. December 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4024b.pdf
     Pinout from the CD4024B Terminal Assignments + Functional Diagram (page
     3-66); behavior from "the state of a counter advances one count on the
     negative transition of each input pulse; a high level on the RESET line
     resets the counter to its all-zeros state." All seven stages (Q1–Q7) are
     brought out to package pins (unlike the CD4020, which omits Q2/Q3). NC pins
     are 8, 10 and 13. */
  'CD4024': {
    name: 'CD4024',
    simpleName: '7-stage Binary Ripple Counter',
    description: '7-stage ripple-carry binary counter/divider CMOS 4000 series (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4024b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary counter', 'ripple counter', 'divider', 'frequency divider', 'timer'],
    guideOverview: 'The CD4024 is a 7-stage ripple-carry binary counter. Each internal flip-flop stage divides the clock frequency by 2, and the counter advances one count on the falling (negative-going) edge of every clock pulse on CLK. A HIGH level on RESET asynchronously clears all stages to zero. All seven stages are brought out: Q1 (divide-by-2) through Q7 (divide-by-128). All inputs and outputs are buffered, and the clock input is Schmitt-triggered, so rise and fall times on CLK can be arbitrarily slow. Typical uses are frequency division, programmable timers, and time-delay generators.',
    guidePinDescriptions: {
      Q1:    'Counter bit 1 output. First stage — toggles every clock pulse (divide-by-2).',
      Q2:    'Counter bit 2 output (divide-by-4).',
      Q3:    'Counter bit 3 output (divide-by-8).',
      Q4:    'Counter bit 4 output (divide-by-16).',
      Q5:    'Counter bit 5 output (divide-by-32).',
      Q6:    'Counter bit 6 output (divide-by-64).',
      Q7:    'Counter bit 7 output (divide-by-128). Last stage.',
      CLK:   'Clock input (input pulses). The counter advances one count on each falling edge. Schmitt-triggered, so rise/fall times are unrestricted.',
      RESET: 'Master Reset. Active HIGH: asynchronously clears all stages to zero. Hold LOW for normal counting.',
      VSS:   'Negative supply / ground (0 V).',
      VDD:   'Positive supply. Accepts 3 V to 18 V.',
      NC:    'No internal connection.',
    },
    pinout: [
      { pin:  1, name: 'CLK',   type: 'input'  },
      { pin:  2, name: 'RESET', type: 'input'  },
      { pin:  3, name: 'Q7',    type: 'output' },
      { pin:  4, name: 'Q6',    type: 'output' },
      { pin:  5, name: 'Q5',    type: 'output' },
      { pin:  6, name: 'Q4',    type: 'output' },
      { pin:  7, name: 'VSS',   type: 'power'  },
      { pin:  8, name: 'NC',    type: 'nc'     },
      { pin:  9, name: 'Q3',    type: 'output' },
      { pin: 10, name: 'NC',    type: 'nc'     },
      { pin: 11, name: 'Q2',    type: 'output' },
      { pin: 12, name: 'Q1',    type: 'output' },
      { pin: 13, name: 'NC',    type: 'nc'     },
      { pin: 14, name: 'VDD',   type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_RIPPLE',
        inputs: ['CLK', 'RESET'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'] },
    ],
    guideSections: [
      {
        title: 'Ripple Binary Counter / Frequency Divider',
        paragraphs: [
          'The 7 internal flip-flop stages are chained so each stage divides the previous one by 2. The whole counter advances on the falling edge of CLK.',
          'All seven stages Q1–Q7 are pinned out (the CD4024 brings out every stage, unlike the larger CD4020/CD4040 which leave some stages internal).',
          'RESET must be LOW for counting. Taking RESET HIGH immediately (asynchronously) clears every stage to zero, regardless of the clock.',
          'After 2^7 = 128 falling edges the counter rolls over to zero and repeats.',
        ],
        formulas: [
          'Q1 = divide-by-2 (2¹)',
          'Q2 = divide-by-4 (2²)',
          'Q3 = divide-by-8 (2³)',
          'Q4 = divide-by-16 (2⁴)',
          'Q5 = divide-by-32 (2⁵)',
          'Q6 = divide-by-64 (2⁶)',
          'Q7 = divide-by-128 (2⁷)',
        ],
        list: [
          'Frequency division: feed a clock into CLK and pick any Q output for a divided-down frequency.',
          'Long time delays: with a slow clock, Q7 produces a single transition after 64 input pulses.',
          'Timebase generation: combine with a fixed oscillator to derive multiple sub-frequencies at once.',
        ],
        note: 'The CD4024 has no internal oscillator (unlike the CD4060) — drive CLK from an external clock source. The counter advances on the falling edge and RESET is active HIGH. 74Sim updates all 7 stages together in one solve, so the real chip\'s stage-to-stage ripple propagation delay (and the brief invalid intermediate counts it causes right after a clock edge) is not reproduced — the settled count is correct (see issues.md A1/D6).',
      },
    ],
  },

};
