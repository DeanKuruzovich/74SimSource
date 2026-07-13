// chips83.js — Block 83: CMOS 4000 series logic ICs (coverage expansion, Batch 5)
// Ripple counters. Pinout + behavior verified by reading the TI datasheet
// "CD4020B, CD4024B, CD4040B Types" (SCHS030D) directly as PDF page images
// (Read with pages:, rendered + cropped with pdftoppm/magick), NOT via the
// WebFetch text summarizer which mangles these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 5) for the full roadmap.
// Chips: CD4040
export const CHIPS_BLOCK_83 = {

  // ── CD4040: 12-stage binary ripple counter (16-pin) ──────────────────────
  /* Source: Texas Instruments, "CD4020B, CD4024B, CD4040B Types — CMOS
     Ripple-Carry Binary Counter/Dividers", SCHS030D (Rev. December 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4040b.pdf
     Verified by reading the saved PDF as 300-dpi page images with pdftoppm +
     magick (NOT the WebFetch text summarizer, which mangles TI scans — see
     issues.md C4):
       - Terminal assignment, CD4040B TOP VIEW (drawing 92CS-20747R2), p. 1 —
         confirms every pin: 1=Q12, 2=Q6, 3=Q5, 4=Q7, 5=Q4, 6=Q3, 7=Q2, 8=VSS,
         9=Q1, 10=CLK(ø), 11=RESET(R), 12=Q9, 13=Q8, 14=Q10, 15=Q11, 16=VDD.
         All 12 stages Q1–Q12 are pinned out. This pin map is NOT the CD4020's —
         verified per-pin, not cloned from a sibling (issues.md C2 lesson).
       - Description, p. 1 — "the state of a counter advances one count on the
         negative transition of each input pulse; a high level on the RESET line
         resets the counter to its all-zeros state" → falling-edge clock,
         active-HIGH asynchronous reset, master-slave stages, buffered I/O.
       - Recommended operating conditions, p. 2 — input pulse rise/fall time
         listed "Unlimited" (Schmitt-triggered clock input).
       - guideOverview's CD4020 comparison checked against the CD4020B TOP VIEW
         (92CS-24462R1) on the same page: the 14-stage CD4020 brings out Q1 and
         Q4–Q14, omitting the Q2/Q3 taps.
     Engine (pinout[], gates[], COUNTER_BIN_RIPPLE in specificChipsSim.js) found
     correct on this pass — left untouched; only the docs were expanded. */
  'CD4040': {
    name: 'CD4040',
    simpleName: '12-stage Binary Ripple Counter',
    description: '12-stage ripple-carry binary counter/divider CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4040b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary counter', 'ripple counter', 'divider', 'frequency divider', 'timer'],
    guideOverview: 'The CD4040 is a 12-stage ripple-carry binary counter. Each internal flip-flop stage divides the clock frequency by 2, and the counter advances one count on the falling (negative-going) edge of every clock pulse on CLK. A HIGH level on RESET asynchronously clears all stages to zero. All twelve stages are brought out: Q1 (divide-by-2) through Q12 (divide-by-4096), so every binary tap is accessible at a pin — this is the chief difference from the 14-stage CD4020, which omits its Q2/Q3 taps. All inputs and outputs are buffered, and the clock input is Schmitt-triggered, so rise and fall times on CLK can be arbitrarily slow. Typical uses are frequency division, programmable timers, and time-delay generators.',
    guidePinDescriptions: {
      Q1:    'Counter bit 1 output. First stage — toggles every clock pulse (divide-by-2).',
      Q2:    'Counter bit 2 output (divide-by-4).',
      Q3:    'Counter bit 3 output (divide-by-8).',
      Q4:    'Counter bit 4 output (divide-by-16).',
      Q5:    'Counter bit 5 output (divide-by-32).',
      Q6:    'Counter bit 6 output (divide-by-64).',
      Q7:    'Counter bit 7 output (divide-by-128).',
      Q8:    'Counter bit 8 output (divide-by-256).',
      Q9:    'Counter bit 9 output (divide-by-512).',
      Q10:   'Counter bit 10 output (divide-by-1024).',
      Q11:   'Counter bit 11 output (divide-by-2048).',
      Q12:   'Counter bit 12 output (divide-by-4096). Last stage.',
      CLK:   'Clock input (input pulses). The counter advances one count on each falling edge. Schmitt-triggered, so rise/fall times are unrestricted.',
      RESET: 'Master Reset. Active HIGH: asynchronously clears all stages to zero. Hold LOW for normal counting.',
      VSS:   'Negative supply / ground (0 V).',
      VDD:   'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q12',   type: 'output' },
      { pin:  2, name: 'Q6',    type: 'output' },
      { pin:  3, name: 'Q5',    type: 'output' },
      { pin:  4, name: 'Q7',    type: 'output' },
      { pin:  5, name: 'Q4',    type: 'output' },
      { pin:  6, name: 'Q3',    type: 'output' },
      { pin:  7, name: 'Q2',    type: 'output' },
      { pin:  8, name: 'VSS',   type: 'power'  },
      { pin:  9, name: 'Q1',    type: 'output' },
      { pin: 10, name: 'CLK',   type: 'input'  },
      { pin: 11, name: 'RESET', type: 'input'  },
      { pin: 12, name: 'Q9',    type: 'output' },
      { pin: 13, name: 'Q8',    type: 'output' },
      { pin: 14, name: 'Q10',   type: 'output' },
      { pin: 15, name: 'Q11',   type: 'output' },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_RIPPLE',
        inputs: ['CLK', 'RESET'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12'] },
    ],
    guideSections: [
      {
        title: 'How a ripple counter works',
        paragraphs: [
          'Inside are twelve toggle flip-flops in a chain. A toggle flip-flop flips its output every time it is clocked, so its output swings at half the frequency of its own clock. Wire twelve in a row and each stage halves the one before it.',
          'Only the first flip-flop is driven by the CLK pin. Its output clocks the second stage, the second clocks the third, and so on down the line. A change therefore "ripples" through the chain one stage at a time, like a row of dominoes — that is where the name comes from. A synchronous counter, by contrast, clocks every flip-flop at the same instant.',
          'The counter steps on the falling edge of CLK (HIGH going to LOW). Read the twelve outputs together as a binary number — Q12 the most significant bit, Q1 the least — and they count 0, 1, 2, … up to 4095, then roll over to 0 and start again. That is 2^12 = 4096 steps per full cycle.',
          'RESET is separate from the clock. A HIGH on RESET forces all twelve outputs to 0 straight away, with or without a clock edge — this is called an asynchronous reset. Hold RESET LOW to let the chip count.',
        ],
        formulas: [
          'Q1  = divide-by-2 (2¹)',
          'Q2  = divide-by-4 (2²)',
          'Q3  = divide-by-8 (2³)',
          'Q4  = divide-by-16 (2⁴)',
          'Q5  = divide-by-32 (2⁵)',
          'Q6  = divide-by-64 (2⁶)',
          'Q7  = divide-by-128 (2⁷)',
          'Q8  = divide-by-256 (2⁸)',
          'Q9  = divide-by-512 (2⁹)',
          'Q10 = divide-by-1024 (2¹⁰)',
          'Q11 = divide-by-2048 (2¹¹)',
          'Q12 = divide-by-4096 (2¹²)',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Frequency division: feed a clock into CLK and tap any Qn to get that clock divided by 2ⁿ.',
          'Long time delays: with a slow clock, a high tap such as Q12 changes state only once every few thousand input pulses.',
          'Timebase generation: one oscillator into CLK gives a whole set of sub-frequencies at once, one at each output.',
          'Pulse counting: count edges on CLK and read the running total as a 12-bit binary number across Q1–Q12.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'RESET is active HIGH. Many counters clear on a LOW, so this one is easy to get backwards, and a floating RESET pin can clear the chip at random. Tie RESET to ground (through a reset circuit or a pull-down) whenever you want it to count.',
          'The output pins are not in numeric order. Q1 is pin 9, Q12 is pin 1, Q6 is pin 2 — check the pinout for every wire instead of assuming Qn sits next to Qn+1.',
          'A ripple counter glitches for an instant on each step. Because each stage clocks the next in turn, the outputs do not all change at the same moment; just after a clock edge the chip can briefly show a wrong in-between number. If you decode the count with a gate — say, to detect one specific value — you can catch a false hit. The real settling time is roughly the sum of the per-stage delays.',
          'There is no built-in oscillator. The CD4060 is the same idea — a ripple counter — with an on-chip oscillator added; the CD4040 has none, so you must drive CLK from an external clock.',
        ],
        note: '74Sim updates all 12 stages together in one solve, so the brief ripple glitch above is not reproduced — the settled count is always correct (see issues.md A1/D6).',
      },
    ],
  },

};
