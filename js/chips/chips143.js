// chips143.js — Block 143: CMOS 4000 series (coverage expansion, Batch 12).
// Single chip: CD4536 (CMOS Programmable Timer). Lives alone in its own block
// file to avoid edit collisions with the other concurrent chip-add agents in
// this same working tree.
//
// Pinout + behavior verified by reading the datasheet directly as PDF page
// images (Read with pages:), NOT via the WebFetch text summarizer which mangles
// these scans (see issues.md C4).
//
// Source: Intersil/Harris, "CD4536BMS — CMOS Programmable Timer", File No. 3345
//   (December 1992). [Online]. Available (mirror, the TI/Renesas symlinks 404 to
//   curl): http://kontel.hu/shop_ordered/67768/pic/pdf/cd4536.pdf
//   Verified: Pinout (CD4536BMS TOP VIEW) + Functional Diagram (page 1),
//   Description (page 1), and the Logic Diagram Fig.1 (pages 6-7) showing the 24
//   ripple-binary stages FF1..FF24, the 1-of-16 transmission-gate decoder on the
//   last 16 stages driven by BCD inputs A/B/C/D, the 8-BYPASS path, and the MONO
//   IN one-shot. Read as 300-dpi PDF page images.
//   The commercial CD4536B (TI CD4536B / onsemi) is pin- and function-identical
//   to this CD4536BMS mil-spec part; the BMS PDF was the live source available.
//
// SIMULATION SCOPE: 74Sim models the externally-clocked programmable frequency
// divider (the heart of the part). The on-chip RC oscillator (IN1/OUT1/OUT2 with
// external RS/CT/RT) and the variable-pulse-width monostable (MONO IN to VDD via
// RT/CT) are NOT simulated — 74Sim has no free-running RC-oscillator timebase
// (issues.md A3/A9). DECODE OUT therefore behaves as in the datasheet's "MONO IN
// grounded through 10kOhm" mode, where the one-shot is disabled and the decoder
// drives DECODE OUT directly. Drive IN1 from an external clock. This mirrors how
// the CD4047 was added (monostable-only; astable/OSC OUT not simulated).
export const CHIPS_BLOCK_143 = {

  // ── CD4536: CMOS programmable timer (16-pin) ─────────────────────────────
  'CD4536': {
    name: 'CD4536',
    simpleName: 'Programmable Timer',
    description: 'CMOS programmable timer: 24-stage ripple counter, BCD tap (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/product/CD4536B',
    tags: ['cmos', '4000 series', 'counter', 'divider', 'frequency divider', 'timer', 'programmable timer'],
    guideOverview: 'The CD4536 is a programmable timer built around a 24-stage binary ripple counter. Each stage divides the clock by 2, so the chain divides by 2 up to 2^24. A 1-of-16 decoder, programmed by the 4-bit BCD code on A/B/C/D, picks which one of the last 16 stages (stage 9 through stage 24) appears at DECODE OUT. A HIGH on 8-BYPASS bypasses the first 8 stages, so stage 9 becomes the first counter stage and the same BCD codes then select much shorter divisions. CLOCK INHIBIT freezes the count; RESET clears it and SET fills it. The real chip can run from its own on-chip RC oscillator (IN1/OUT1/OUT2) and stretch DECODE OUT into a variable-width pulse using a one-shot on MONO IN — neither of those RC-timed features is simulated here, so feed IN1 from an external clock and read DECODE OUT as the raw divided clock (the same as grounding MONO IN to disable the one-shot).',
    guidePinDescriptions: {
      SET:    'Set input. Active HIGH: asynchronously sets all counter stages (forces DECODE OUT HIGH). Hold LOW for normal operation.',
      RESET:  'Reset input. Active HIGH: asynchronously clears all counter stages to zero. Dominates SET. Hold LOW for normal operation.',
      IN1:    'Clock / oscillator input. Drive with an external clock; the counter advances on each falling edge. (On the real chip this is also the RC-oscillator input — that oscillator is not simulated.)',
      OUT1:   'On-chip RC-oscillator connection terminal (external resistor/capacitor). Not used in simulation — the RC oscillator is not modeled.',
      OUT2:   'On-chip RC-oscillator connection terminal (external resistor). Not used in simulation — the RC oscillator is not modeled.',
      BYP8:   '8-BYPASS. HIGH bypasses the first 8 counter stages, making stage 9 the first stage so the A/B/C/D code selects divisions of 2 up to 2^16. LOW selects divisions of 2^9 up to 2^24.',
      CLKINH: 'Clock Inhibit. HIGH freezes the counter (no counting). LOW allows counting.',
      VSS:    'Negative supply / ground (0 V).',
      A:      'BCD select, bit 0 (LSB). Chooses which of the last 16 stages is routed to DECODE OUT.',
      B:      'BCD select, bit 1.',
      C:      'BCD select, bit 2.',
      D:      'BCD select, bit 3 (MSB).',
      DEC:    'Decode Out. The selected counter stage, i.e. the divided-down clock. (On the real chip this passes through the MONO IN one-shot; that one-shot is not simulated, matching the MONO-IN-grounded mode.)',
      OSCINH: 'Oscillator Inhibit. Disables the on-chip RC oscillator. Not used in simulation — the oscillator is not modeled.',
      MONOIN: 'Monostable timing input. An R-to-VDD and C-to-ground here set a variable DECODE OUT pulse width; grounding it disables the one-shot. The one-shot is not simulated, so this pin has no effect here.',
      VDD:    'Positive supply. Accepts 3 V to 18 V (20 V rating).',
    },
    pinout: [
      { pin:  1, name: 'SET',    type: 'input'  },
      { pin:  2, name: 'RESET',  type: 'input'  },
      { pin:  3, name: 'IN1',    type: 'input'  },
      { pin:  4, name: 'OUT1',   type: 'bidir'  },
      { pin:  5, name: 'OUT2',   type: 'bidir'  },
      { pin:  6, name: 'BYP8',   type: 'input'  },
      { pin:  7, name: 'CLKINH', type: 'input'  },
      { pin:  8, name: 'VSS',    type: 'power'  },
      { pin:  9, name: 'A',      type: 'input'  },
      { pin: 10, name: 'B',      type: 'input'  },
      { pin: 11, name: 'C',      type: 'input'  },
      { pin: 12, name: 'D',      type: 'input'  },
      { pin: 13, name: 'DEC',    type: 'output' },
      { pin: 14, name: 'OSCINH', type: 'input'  },
      { pin: 15, name: 'MONOIN', type: 'input'  },
      { pin: 16, name: 'VDD',    type: 'power'  },
    ],
    gates: [
      { type: 'FREQ_DIV_PROG_4536',
        inputs: ['IN1', 'CLKINH', 'BYP8', 'RESET', 'SET', 'A', 'B', 'C', 'D'],
        outputs: ['DEC'] },
    ],
    guideSections: [
      {
        title: 'Programmable Binary Divider',
        paragraphs: [
          'Inside is a chain of 24 flip-flop stages. Each stage divides the clock from the stage before it by 2, so the whole chain divides by 2 up to 2 to the 24th power. The counter advances on the falling edge of IN1.',
          'A decoder picks one stage to send to DECODE OUT. The 4-bit code on A (LSB) through D (MSB) selects one of the last 16 stages — stage 9 through stage 24.',
          'With 8-BYPASS LOW, code 0 selects stage 9 (divide-by-512) and code 15 selects stage 24 (divide-by-16,777,216). With 8-BYPASS HIGH, the first 8 stages are skipped, so code 0 selects divide-by-2 and code 15 selects divide-by-65,536.',
          'CLOCK INHIBIT HIGH stops the count. RESET HIGH clears every stage; SET HIGH fills every stage. RESET wins if both are HIGH.',
        ],
        formulas: [
          '8-BYPASS = 0:  divide ratio = 2^(9 + n),  n = A + 2B + 4C + 8D',
          '8-BYPASS = 1:  divide ratio = 2^(1 + n),  n = A + 2B + 4C + 8D',
          'n = 0  -> DECODE OUT = IN1 / 512   (bypass off)  or  IN1 / 2     (bypass on)',
          'n = 15 -> DECODE OUT = IN1 / 2^24  (bypass off)  or  IN1 / 65536 (bypass on)',
        ],
        list: [
          'Long time delays: a slow clock plus a high divide ratio gives one DECODE OUT transition after a programmed number of clocks.',
          'Programmable frequency division: change A/B/C/D to retune the output frequency without rewiring.',
          'Bypass for short ratios: set 8-BYPASS HIGH when you need divisions in the range 2 to 65,536.',
        ],
        note: 'Not simulated: the on-chip RC oscillator (IN1/OUT1/OUT2 + RS/CT/RT) and the variable-pulse-width monostable on MONO IN. 74Sim has no free-running RC-oscillator timebase (issues.md A3/A9). Drive IN1 from an external clock; DECODE OUT is the raw divided clock, matching the datasheet mode where MONO IN is grounded to disable the one-shot. The 24 stages update together in one solve, so stage-to-stage ripple delay is not reproduced (issues.md A1).',
      },
    ],
  },

};
