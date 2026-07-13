// chips87.js — Block 87: CMOS 4000 series logic ICs (coverage expansion, Batch 6)
// CD4518 dual BCD up-counter. Pinout + truth table verified by reading the TI
// datasheet "CD4518B, CD4520B Types — CMOS Dual Up-Counters" (SCHS076D, Rev.
// March 2004) directly as PDF page images (Read with pages:), NOT via the
// WebFetch text summarizer which mangles these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 6) for the full roadmap.
// Chips: CD4518
export const CHIPS_BLOCK_87 = {

  // ── CD4518: dual BCD (decade) up counter (16-pin) ─────────────────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4518B, CD4520B Types — CMOS Dual Up-Counters",
     SCHS076D (Revised March 2004).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4518b.pdf
     Terminal assignment (page 1): CLOCK A(1), ENABLE A(2), Q1A(3), Q2A(4),
     Q3A(5), Q4A(6), RESET A(7), VSS(8), CLOCK B(9), ENABLE B(10), Q1B(11),
     Q2B(12), Q3B(13), Q4B(14), RESET B(15), VDD(16).
     Truth table (page 1): the counter advances on the POSITIVE edge of CLOCK
     while ENABLE is HIGH, OR on the NEGATIVE edge of ENABLE while CLOCK is LOW;
     all other CLOCK/ENABLE transitions hold. A HIGH on RESET asynchronously
     clears Q1–Q4 to zero. The two 4-stage counters are identical, internally
     synchronous (synchronous internal carry), and fully independent. */
  'CD4518': {
    name: 'CD4518',
    simpleName: 'Dual BCD Up Counter',
    description: 'Dual synchronous BCD (decade) up counter, CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4518b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'bcd counter', 'decade counter', 'up counter', 'dual', 'synchronous'],
    guideOverview: 'The CD4518 contains two identical, independent synchronous BCD (decade) up counters. Each counter is a 4-stage D-type ripple-blocked design with interchangeable CLOCK and ENABLE inputs: a section advances one count either on the rising (positive-going) edge of its CLOCK input while ENABLE is held HIGH, or on the falling (negative-going) edge of its ENABLE input while CLOCK is held LOW. Because the internal carry is synchronous, the four outputs Q1–Q4 present a clean 8-4-2-1 weighted BCD count that runs 0→9 and then rolls over to 0. A HIGH level on a section\'s RESET input asynchronously clears that section\'s outputs to zero. Counters can be cascaded in ripple mode by connecting Q4 of one counter to the CLOCK input of the next (with the next ENABLE held HIGH). Typical uses are multistage synchronous counting, frequency division, and BCD time/event counting.',
    guidePinDescriptions: {
      CLKA: 'Counter A clock input. With ENABLE A HIGH, counter A advances on each rising edge here.',
      ENA:  'Counter A enable input. Hold HIGH to clock on CLOCK A; alternatively, with CLOCK A held LOW, counter A advances on each falling edge here.',
      Q1A:  'Counter A output bit 1 (LSB, weight 1).',
      Q2A:  'Counter A output bit 2 (weight 2).',
      Q3A:  'Counter A output bit 3 (weight 4).',
      Q4A:  'Counter A output bit 4 (MSB, weight 8). Use as the ripple-carry output when cascading.',
      RSTA: 'Counter A master reset. Active HIGH: asynchronously clears Q1A–Q4A to zero. Hold LOW for normal counting.',
      CLKB: 'Counter B clock input. With ENABLE B HIGH, counter B advances on each rising edge here.',
      ENB:  'Counter B enable input. Hold HIGH to clock on CLOCK B; alternatively, with CLOCK B held LOW, counter B advances on each falling edge here.',
      Q1B:  'Counter B output bit 1 (LSB, weight 1).',
      Q2B:  'Counter B output bit 2 (weight 2).',
      Q3B:  'Counter B output bit 3 (weight 4).',
      Q4B:  'Counter B output bit 4 (MSB, weight 8). Use as the ripple-carry output when cascading.',
      RSTB: 'Counter B master reset. Active HIGH: asynchronously clears Q1B–Q4B to zero. Hold LOW for normal counting.',
      VSS:  'Negative supply / ground (0 V).',
      VDD:  'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'CLKA', type: 'input'  },
      { pin:  2, name: 'ENA',  type: 'input'  },
      { pin:  3, name: 'Q1A',  type: 'output' },
      { pin:  4, name: 'Q2A',  type: 'output' },
      { pin:  5, name: 'Q3A',  type: 'output' },
      { pin:  6, name: 'Q4A',  type: 'output' },
      { pin:  7, name: 'RSTA', type: 'input'  },
      { pin:  8, name: 'VSS',  type: 'power'  },
      { pin:  9, name: 'CLKB', type: 'input'  },
      { pin: 10, name: 'ENB',  type: 'input'  },
      { pin: 11, name: 'Q1B',  type: 'output' },
      { pin: 12, name: 'Q2B',  type: 'output' },
      { pin: 13, name: 'Q3B',  type: 'output' },
      { pin: 14, name: 'Q4B',  type: 'output' },
      { pin: 15, name: 'RSTB', type: 'input'  },
      { pin: 16, name: 'VDD',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BCD_DUAL_4518',
        inputs:  ['CLKA', 'ENA', 'RSTA', 'CLKB', 'ENB', 'RSTB'],
        outputs: ['Q1A', 'Q2A', 'Q3A', 'Q4A', 'Q1B', 'Q2B', 'Q3B', 'Q4B'] },
    ],
    guideSections: [
      {
        title: 'Dual Synchronous BCD (Decade) Up Counter',
        paragraphs: [
          'Each of the two sections is a 4-stage synchronous decade counter. Internally the stages share a common clock so the carry between stages is synchronous — the Q1–Q4 outputs settle together to a clean 8-4-2-1 BCD value with no ripple-decode glitches between stages.',
          'CLOCK and ENABLE are interchangeable triggering inputs. Mode 1: hold ENABLE HIGH and clock the counter on the rising edge of CLOCK. Mode 2: hold CLOCK LOW and clock the counter on the falling edge of ENABLE. Either way the count advances by one. All other CLOCK/ENABLE transitions leave the count unchanged.',
          'RESET is active HIGH and asynchronous: taking it HIGH immediately forces that section to 0000, regardless of the clock. Hold RESET LOW to count.',
          'The count sequence is 0→1→2→…→9→0. After the ninth count, the next trigger rolls the section back to zero.',
          'To build a multi-decade counter, run in ripple mode: feed Q4 of one section into the CLOCK input of the next (holding the next ENABLE HIGH). Counter A and counter B are otherwise completely independent.',
        ],
        formulas: [
          'Counting edge  = (CLOCK rising AND ENABLE = 1)  OR  (ENABLE falling AND CLOCK = 0)',
          'Q1 = weight 1 (2⁰)   Q2 = weight 2 (2¹)',
          'Q3 = weight 4 (2²)   Q4 = weight 8 (2³)',
          'Modulus = 10 (BCD): count runs 0…9 then wraps',
        ],
        list: [
          'Multistage synchronous BCD counting (cascade Q4 → next CLOCK).',
          'Frequency division by 10 per section (or by 100 with both cascaded).',
          'BCD time / event counting feeding a 7-segment decoder (e.g. CD4511).',
        ],
        note: 'The CD4518 is the BCD (÷10) member; its sibling CD4520 is the binary (÷16) version with the same pinout and triggering. 74Sim models both counter sections as ideal synchronous decade counters with the real dual-edge CLOCK/ENABLE trigger and active-HIGH async RESET. As with all 74Sim sequential parts there is no propagation delay, so the brief stage-to-stage settling transients of real silicon are not reproduced — the settled BCD count is correct (see issues.md A1).',
      },
    ],
  },

};
