// chips120.js — Block 120: CMOS 4000 series logic ICs (coverage expansion, Batch 6)
// CD4520 dual 4-bit binary up-counter — the binary (÷16) sibling of the CD4518
// (÷10 BCD). Identical pinout and triggering; only the count modulus differs.
//
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4518B, CD4520B Types — CMOS Dual Up-Counters", SCHS076D (Revised March
//   2004). [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4520b.pdf.
//   Verified: terminal assignment, function/truth table, and the
//   CD4520B = "Dual Binary Up-Counter" description, page 1, read as a 300-dpi
//   rendered PDF page image (Read tool with pages:) — NOT via the WebFetch text
//   summarizer, which mangles these TI scans (see issues.md C4). The single
//   datasheet covers BOTH the CD4518B and CD4520B; the page-1 TERMINAL ASSIGNMENT
//   (TOP VIEW) is labelled "CD4518B, CD4520B" and reads pin-for-pin:
//     1 CLOCK A · 2 ENABLE A · 3 Q1A · 4 Q2A · 5 Q3A · 6 Q4A · 7 RESET A · 8 VSS ·
//     9 CLOCK B · 10 ENABLE B · 11 Q1B · 12 Q2B · 13 Q3B · 14 Q4B · 15 RESET B ·
//     16 VDD.
//   The pinout was confirmed from the CD4520B datasheet itself, not cloned from
//   the CD4518 sibling entry (issues.md C2 lesson).
//   Truth table (page 1): a section advances on the POSITIVE edge of CLOCK while
//   ENABLE is HIGH, OR on the NEGATIVE edge of ENABLE while CLOCK is LOW; all
//   other CLOCK/ENABLE transitions hold. RESET HIGH asynchronously forces
//   Q1–Q4 = 0. Carry within a section is synchronous. The only difference from
//   the CD4518 is the modulus: each CD4520 section is a 4-bit BINARY counter that
//   runs 0→15 and wraps, vs the CD4518's BCD 0→9.
//
// Engine mapping: reuses the existing `COUNTER_BCD_DUAL_4518` primitive in
// js/specificChipsSim.js with `gate.mod: 16`. The chips-to-add.md hint named a
// `COUNTER_4BIT_DUAL` primitive, but no such evaluator exists; the CD4518
// primitive was purpose-built with a `gate.mod` selector (default 10) precisely
// so the binary CD4520 (÷16) could reuse it — no engine work needed. See
// CMOS-4000-Coverage-Plan.md §D8.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// Chips: CD4520
export const CHIPS_BLOCK_120 = {

  // ── CD4520: dual 4-bit binary up counter (16-pin) ─────────────────────────
  'CD4520': {
    name: 'CD4520',
    simpleName: 'Dual Binary Up Counter',
    description: 'Dual synchronous 4-bit binary up counter, CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4520b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary counter', 'up counter', 'dual', 'synchronous'],
    guideOverview: 'The CD4520 contains two identical, independent synchronous 4-bit binary up counters. Each counter is a 4-stage D-type design with interchangeable CLOCK and ENABLE inputs: a section advances one count either on the rising (positive-going) edge of its CLOCK input while ENABLE is held HIGH, or on the falling (negative-going) edge of its ENABLE input while CLOCK is held LOW. Because the internal carry is synchronous, the four outputs Q1–Q4 present a clean 8-4-2-1 weighted binary count that runs 0→15 and then rolls over to 0. A HIGH level on a section\'s RESET input asynchronously clears that section\'s outputs to zero. Counters can be cascaded in ripple mode by connecting Q4 of one counter to the CLOCK input of the next (with the next ENABLE held HIGH). The CD4520 is the binary (÷16) version of the CD4518, which is the BCD (÷10) version; the two are pin-for-pin identical and triggered the same way.',
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
    // Pinout verified vs TI SCHS076D CD4518B/CD4520B TERMINAL ASSIGNMENT (page 1).
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
      // mod: 16 selects the binary (÷16) modulus — the one difference from the
      // CD4518 (mod 10). See _evaluateCounterBcdDual4518 in specificChipsSim.js.
      { type: 'COUNTER_BCD_DUAL_4518', mod: 16,
        inputs:  ['CLKA', 'ENA', 'RSTA', 'CLKB', 'ENB', 'RSTB'],
        outputs: ['Q1A', 'Q2A', 'Q3A', 'Q4A', 'Q1B', 'Q2B', 'Q3B', 'Q4B'] },
    ],
    guideSections: [
      {
        title: 'Dual Synchronous 4-Bit Binary Up Counter',
        paragraphs: [
          'Each of the two sections is a 4-stage synchronous binary counter. Internally the stages share a common clock so the carry between stages is synchronous — the Q1–Q4 outputs settle together to a clean 8-4-2-1 binary value with no ripple-decode glitches between stages.',
          'CLOCK and ENABLE are interchangeable triggering inputs. Mode 1: hold ENABLE HIGH and clock the counter on the rising edge of CLOCK. Mode 2: hold CLOCK LOW and clock the counter on the falling edge of ENABLE. Either way the count advances by one. All other CLOCK/ENABLE transitions leave the count unchanged.',
          'RESET is active HIGH and asynchronous: taking it HIGH immediately forces that section to 0000, regardless of the clock. Hold RESET LOW to count.',
          'The count sequence is 0→1→2→…→15→0. After the fifteenth count, the next trigger rolls the section back to zero.',
          'To build a wider counter, run in ripple mode: feed Q4 of one section into the CLOCK input of the next (holding the next ENABLE HIGH). Counter A and counter B are otherwise completely independent.',
        ],
        formulas: [
          'Counting edge  = (CLOCK rising AND ENABLE = 1)  OR  (ENABLE falling AND CLOCK = 0)',
          'Q1 = weight 1 (2⁰)   Q2 = weight 2 (2¹)',
          'Q3 = weight 4 (2²)   Q4 = weight 8 (2³)',
          'Modulus = 16 (binary): count runs 0…15 then wraps',
        ],
        list: [
          'Multistage synchronous binary counting (cascade Q4 → next CLOCK).',
          'Frequency division by 16 per section (or by 256 with both cascaded).',
          'Binary event counting and address generation.',
        ],
        note: 'The CD4520 is the binary (÷16) member; its sibling CD4518 is the BCD (÷10) version with the same pinout and triggering. 74Sim models both counter sections as ideal synchronous binary counters with the real dual-edge CLOCK/ENABLE trigger and active-HIGH async RESET. As with all 74Sim sequential parts there is no propagation delay, so the brief stage-to-stage settling transients of real silicon are not reproduced — the settled binary count is correct (see issues.md A1).',
      },
    ],
  },

};
