// chips160.js — CMOS 4000-series coverage expansion
// CD4527: BCD (decade) rate multiplier.
// Shipped in its own standalone block (CHIPS_BLOCK_160) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_160 = {
  // ── CD4527: low-power BCD (decade) rate multiplier (16-pin) ──────────────────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
       "CD4527B Types — CMOS BCD Rate Multiplier", SCHS080C (revised July 2003).
       [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4527b.pdf
       Verified: TOP-VIEW Terminal Assignment (page 1, read from a 300-dpi PDF
       page-image crop), the TRUTH TABLE (page 6), the Logic Diagram Fig. 13 and
       Timing Diagram Fig. 14 (page 5), and the device description (page 1) — all
       read as rendered PDF page images (Read with pages:, NOT the text summarizer,
       see issues.md C4), and NOT cloned from the binary CD4089 sibling or the TTL
       74167 (issues.md C2). The page-1 terminal drawing and the Fig. 13 logic
       diagram agree on the map (TOP VIEW):
         1  "9" OUT             16  VDD
         2  C                   15  B
         3  D                   14  A
         4  SET TO "9"          13  CLEAR
         5  OUT-bar (OUT)       12  CASCADE
         6  OUT                 11  INHIBIT IN (CARRY)
         7  INHIBIT OUT (CARRY) 10  STROBE
         8  VSS                  9  CLOCK
       Rate-select weights (from the truth-table column order D C B A and Fig. 14):
       A = pin 14 (LSB, weight 1), B = pin 15 (weight 2), C = pin 2 (weight 4),
       D = pin 3 (MSB, weight 8). Function (page-1 description): "when the BCD input
       is 8, there will be 8 out of every 10 input pulses" — OUT delivers N pulses
       per 10 clock pulses, N = BCD(D,C,B,A), N = 0…9.

       Engine: drives the dedicated RATE_MULT_BCD_4527 primitive (added to
       js/specificChipsSim.js for this part). The hinted RATE_MULT_DECADE is the
       74167 (CLR/LOAD/ENP/ENT pin contract, single-pulse Z model) and does NOT fit
       the CD4527 — its pin set (STROBE / CASCADE / INHIBIT IN-OUT / SET-TO-"9" /
       "9" OUT) and its N-pulses-per-10 behavior are different. The new primitive
       reproduces the datasheet TRUTH TABLE for ALL 16 input codes (valid BCD 0-9 →
       N pulses; invalid 10-15 → 8 or 9 exactly as the table shows). The exact
       intra-cycle pulse phase is not reproduced (74Sim has no sub-clock timing,
       issues.md A1); the pulse COUNT per 10 clocks and the truth-table logic levels
       are. See issues.md (CD4527 entry). */
  'CD4527': {
    name: 'CD4527',
    simpleName: 'BCD Rate Multiplier',
    description: 'BCD (decade) rate multiplier, CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4527b.pdf',
    tags: ['cmos', '4000 series', 'rate multiplier', 'bcd', 'decade', 'sequential'],
    sequential: true,
    guideOverview: 'The CD4527 is a BCD rate multiplier: it takes a steady clock and passes through a chosen fraction of the pulses. The fraction is set by a decimal number from 0 to 9 placed on the four BCD inputs A, B, C, D. With that number set to N, the chip lets through N pulses for every 10 clock pulses, so the average output rate is N/10 of the input rate. Inside is a small decade counter that counts the clock from 0 to 9; the rate-select bits pick which of those ten counts produce an output pulse, so the pulses come out spread across each group of ten rather than bunched together. Extra pins — STROBE, CASCADE, INHIBIT IN/OUT, the "9" output — let you chain two chips for a two-digit fraction such as N/100. It is used wherever you need a clock that is a precise decimal fraction of another: numerical control, frequency synthesis, digital filtering, and simple arithmetic (multiply, divide, raise to a power).',
    guidePinDescriptions: {
      'A':       'BCD rate-select bit A (least significant, weight 1), pin 14.',
      'B':       'BCD rate-select bit B (weight 2), pin 15.',
      'C':       'BCD rate-select bit C (weight 4), pin 2.',
      'D':       'BCD rate-select bit D (most significant, weight 8), pin 3.',
      'CLOCK':   'Input clock (pin 9). The output pulse train is derived from it; the internal decade counter advances on each rising edge.',
      'STROBE':  'Output strobe (pin 10). HIGH blanks the output (OUT forced LOW); hold it LOW for normal operation.',
      'CASCADE': 'Cascade input (pin 12). HIGH forces OUT HIGH; used when chaining two chips. Tie LOW for a single device.',
      'INHIBIT': 'Inhibit / carry input (pin 11). HIGH inhibits the output; it is the carry path from the next device when cascading. Tie LOW for a single device.',
      'CLEAR':   'Clear (pin 13). HIGH clears the internal decade counter to 0. Do not hold CLEAR and SET HIGH together.',
      'SET9':    'Set to "9" (pin 4). HIGH presets the internal counter to 9.',
      'OUT':     'Rate output (pin 6). Delivers N pulses for every 10 clock pulses, where N is the BCD value on A–D.',
      'OUTn':    'Complementary rate output (pin 5), the inverse of OUT.',
      'NINE':    '"9" output (pin 1). HIGH when the internal counter reaches 9; used for cascading.',
      'CARRYOUT':'Inhibit / carry output (pin 7). Goes LOW at the count-9 terminal state to carry into the next device when cascading.',
      'VSS':     'Ground / negative supply (pin 8).',
      'VDD':     'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: 'Setting the output rate',
        paragraphs: [
          'Put a decimal digit N (0–9) on the BCD inputs A, B, C, D, where A is the least significant bit. The chip then passes N out of every 10 input clock pulses to OUT, so the average output rate is N/10 of the clock. N = 0 gives no output pulses; N = 9 passes all but one. The pulses are spread across the ten-clock window rather than bunched together, which is what makes a rate multiplier useful for generating smooth fractional frequencies.',
        ],
        formulas: ['f_OUT = (N / 10) × f_CLOCK'],
      },
      {
        title: 'Cascading two chips',
        paragraphs: [
          'For two-digit fractions, two CD4527s chain together using STROBE, CASCADE, the "9" output, and the INHIBIT (carry) in/out pins — the more-significant chip handles the tens digit and the less-significant chip the units digit, giving a fraction such as N/100. For a single chip on its own, hold STROBE, CASCADE, INHIBIT IN, CLEAR, and SET TO "9" inactive (LOW) and feed the clock.',
        ],
        note: '74Sim models OUT as exactly N pulses per 10 clock pulses (N = BCD value on A–D), with STROBE/INHIBIT/CLEAR/SET blanking the output and CASCADE forcing it HIGH, matching the datasheet truth table for every input code. The exact position of the pulses within each ten-clock window, and the timing of the two-chip cascade, are not reproduced (the simulator has no sub-clock timing).',
      },
    ],
    pinout: [
      { pin:  1, name: 'NINE',     type: 'output' },
      { pin:  2, name: 'C',        type: 'input'  },
      { pin:  3, name: 'D',        type: 'input'  },
      { pin:  4, name: 'SET9',     type: 'input'  },
      { pin:  5, name: 'OUTn',     type: 'output' },
      { pin:  6, name: 'OUT',      type: 'output' },
      { pin:  7, name: 'CARRYOUT', type: 'output' },
      { pin:  8, name: 'VSS',      type: 'power'  },
      { pin:  9, name: 'CLOCK',    type: 'input'  },
      { pin: 10, name: 'STROBE',   type: 'input'  },
      { pin: 11, name: 'INHIBIT',  type: 'input'  },
      { pin: 12, name: 'CASCADE',  type: 'input'  },
      { pin: 13, name: 'CLEAR',    type: 'input'  },
      { pin: 14, name: 'A',        type: 'input'  },
      { pin: 15, name: 'B',        type: 'input'  },
      { pin: 16, name: 'VDD',      type: 'power'  },
    ],
    gates: [
      // RATE_MULT_BCD_4527 contract:
      //   inputs:  [CLK, CLR, SET9, STR, INH, CAS, A, B, C, D]
      //   outputs: [OUT, OUTn, NINE, CARRY]
      {
        type: 'RATE_MULT_BCD_4527',
        inputs: ['CLOCK', 'CLEAR', 'SET9', 'STROBE', 'INHIBIT', 'CASCADE', 'A', 'B', 'C', 'D'],
        outputs: ['OUT', 'OUTn', 'NINE', 'CARRYOUT'],
      },
    ],
  },
};
