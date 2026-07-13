// Chip definitions block 119
// Chips: CD4018 (presettable divide-by-N counter)
//
// Standalone block authored for the CMOS 4000-series coverage effort. Kept on
// its own (instead of batching ~10-15 chips per file) to avoid collisions with
// other agents editing shared chip files in the same working tree.

export const CHIPS_BLOCK_119 = {

  // ── CD4018: presettable divide-by-N counter (16-pin) ──────────────────────
  /* Primary source: Texas Instruments / Harris, "CD4018B Types — CMOS
     Presettable Divide-By-'N' Counter", datasheet SCHS028B (rev. Oct 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4018b.pdf
     Verified: TERMINAL DIAGRAM (Top View) + FUNCTIONAL DIAGRAM (page 1) +
     Fig.1 Logic diagram (page 2) + Description (page 1), read as rendered PDF
     page images (issues.md C4) — NOT cloned from the 7490 the coverage-plan
     hint COUNTER_DECADE_DIV actually models (a ÷2/÷5 decade counter with
     R01/R02/R91/R92), nor from any sibling (issues.md C2).
     Verified terminal assignment: DATA=1, JAM1=2, JAM2=3, Q2=4, Q1=5, Q3=6,
     JAM3=7, VSS=8, JAM4=9, PRESET ENABLE=10, Q4=11, JAM5=12, Q5=13, CLOCK=14,
     RESET=15, VDD=16. */
  'CD4018': {
    name: 'CD4018',
    simpleName: 'Divide-by-N Counter',
    description: 'CMOS presettable divide-by-N counter — five Johnson-counter stages (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4018b.pdf',
    tags: ['counter', 'divide by n', 'johnson', 'frequency divider', 'sequential', 'CMOS', '4000 series'],
    guideOverview: 'The CD4018 is a chain of five flip-flops wired as a Johnson counter. On each rising clock edge the data on the DATA pin shifts into the first stage, and every stage passes its value to the next, so a bit ripples Q1 → Q2 → Q3 → Q4 → Q5. On its own that is just a 5-bit shift register; it becomes a divide-by-N counter when you wire one of the outputs back to DATA. Feed the inverted Q5 back to DATA for divide-by-10, inverted Q4 for divide-by-8, Q3 for 6, Q2 for 4, Q1 for 2. Odd divisors (9, 7, 5, 3) need one external gate (a CD4011) in the feedback path. A HIGH on RESET clears all five stages to 0; a HIGH on PRESET ENABLE jams the five JAM inputs straight into the stages so you can start the count from any value.',
    guidePinDescriptions: {
      'DATA': 'Serial data input. On each rising clock edge this value is shifted into the first stage (Q1).',
      'JAM1': 'Preset value for stage 1. Loaded into Q1 while PRESET ENABLE is HIGH.',
      'JAM2': 'Preset value for stage 2. Loaded into Q2 while PRESET ENABLE is HIGH.',
      'Q2': 'Stage 2 output.',
      'Q1': 'Stage 1 output (Johnson LSB). Drives the divide-by-2 feedback.',
      'Q3': 'Stage 3 output.',
      'JAM3': 'Preset value for stage 3. Loaded into Q3 while PRESET ENABLE is HIGH.',
      'VSS': 'Ground reference (pin 8).',
      'JAM4': 'Preset value for stage 4. Loaded into Q4 while PRESET ENABLE is HIGH.',
      'PE': 'PRESET ENABLE (active HIGH). While HIGH, the five JAM inputs are jammed into the stages with no clock edge needed.',
      'Q4': 'Stage 4 output.',
      'JAM5': 'Preset value for stage 5. Loaded into Q5 while PRESET ENABLE is HIGH.',
      'Q5': 'Stage 5 output. Invert and feed back to DATA for divide-by-10.',
      'CLOCK': 'Clock input. The counter advances one step on each rising (positive-going) edge.',
      'RESET': 'RESET (active HIGH). A HIGH clears all five stages to 0.',
      'VDD': 'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: 'How The Counter Works',
        paragraphs: [
          'The five stages form a shift chain. Each rising clock edge does the same thing: stage 1 takes whatever is on DATA, and stages 2 through 5 each take the value of the stage before them. Nothing decodes or adds — it just shifts.',
          'By itself that gives you a 5-bit shift register. The trick that turns it into a counter is the feedback wire from an output back to DATA, which sets up the repeating Johnson-counter pattern.',
        ],
      },
      {
        title: 'Choosing The Divide Ratio',
        list: [
          'Divide-by-10: connect inverted Q5 to DATA.',
          'Divide-by-8: connect inverted Q4 to DATA.',
          'Divide-by-6: connect inverted Q3 to DATA.',
          'Divide-by-4: connect inverted Q2 to DATA.',
          'Divide-by-2: connect inverted Q1 to DATA.',
          'Odd ratios (9, 7, 5, 3): gate the feedback with an external CD4011.',
          'Ratios above 10: cascade more than one CD4018.',
        ],
      },
      {
        title: 'RESET And PRESET ENABLE',
        list: [
          'RESET HIGH clears all five stages to 0 immediately (no clock needed).',
          'PRESET ENABLE HIGH copies the five JAM inputs into the stages immediately (no clock needed) — use it to start the count from a chosen value.',
          'If both are HIGH, RESET wins and the stages clear to 0.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'DATA',  type: 'input'  },
      { pin:  2, name: 'JAM1',  type: 'input'  },
      { pin:  3, name: 'JAM2',  type: 'input'  },
      { pin:  4, name: 'Q2',    type: 'output' },
      { pin:  5, name: 'Q1',    type: 'output' },
      { pin:  6, name: 'Q3',    type: 'output' },
      { pin:  7, name: 'JAM3',  type: 'input'  },
      { pin:  8, name: 'VSS',   type: 'power'  },
      { pin:  9, name: 'JAM4',  type: 'input'  },
      { pin: 10, name: 'PE',    type: 'input'  },
      { pin: 11, name: 'Q4',    type: 'output' },
      { pin: 12, name: 'JAM5',  type: 'input'  },
      { pin: 13, name: 'Q5',    type: 'output' },
      { pin: 14, name: 'CLOCK', type: 'input'  },
      { pin: 15, name: 'RESET', type: 'input'  },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    gates: [
      {
        // 5-stage Johnson shift chain: Q1<-DATA, Q2<-Q1, ... Q5<-Q4 on rising CLOCK.
        // RESET (active HIGH, async) clears; PE (active HIGH, async) jam-loads JAM1..JAM5.
        type: 'COUNTER_JOHNSON_4018',
        inputs: ['CLOCK', 'RESET', 'DATA', 'PE', 'JAM1', 'JAM2', 'JAM3', 'JAM4', 'JAM5'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
      },
    ],
  },

};
