// chips159.js — CMOS 4000-series coverage expansion
// CD4089: 4-bit binary rate multiplier.
// Shipped in its own standalone block (CHIPS_BLOCK_159) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_159 = {
  // ── CD4089: low-power 4-bit binary rate multiplier (16-pin) ──────────────────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
       "CD4089B Types — CMOS Binary Rate Multiplier", SCHS062B (revised July 2003).
       [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4089b.pdf
       Verified: TOP-VIEW Terminal Assignment (page 3), Functional Diagram (page 1),
       Logic Diagram Fig. 4 (page 2), and the TRUTH TABLE (page 5), all read as
       rendered PDF page images (Read with pages:, NOT the text summarizer — see
       issues.md C4), and NOT cloned from the TTL 74x97 sibling (issues.md C2).

     The three views agree on the pinout (TOP VIEW):
       1  "15" OUT            16  VDD
       2  C                   15  B
       3  D                   14  A
       4  SET TO "15"         13  CLEAR
       5  OUT-bar (OUT)       12  CASCADE
       6  OUT                 11  INHIBIT IN (CARRY)
       7  INHIBIT OUT (CARRY) 10  STROBE
       8  VSS                  9  CLOCK
     The four binary-rate-select inputs are A (pin 14, LSB / weight 1), B (15,
     weight 2), C (2, weight 4), D (3, MSB / weight 8) — confirmed by the timing
     diagram (Fig. 15) labelling "(LSB) INPUT A" and "(MSB) INPUT D" and by the
     truth-table column order D C B A. The part is 4-bit (÷16): with control inputs
     inactive, OUT delivers N pulses for every 16 clock pulses, where N is the
     binary value on A..D (datasheet: "when the binary input number is 13, there
     will be 13 output pulses for every 16 input pulses"). Two devices cascade for
     8-bit resolution via STROBE / CASCADE / the INHIBIT-IN (carry) chain.

     Truth-table facts the model relies on (page 5):
       • INH IN=0, STR=0, CAS=0, CLR=0, SET=0 → OUT = the N-pulse train (normal).
       • STR (STROBE) = 1 → OUT = L  (output blanked).            <- used as enable
       • INH IN = 1 → output inhibited, INHIBIT OUT goes HIGH.
       • CAS (CASCADE) = 1 → OUT = H.
       • CLEAR = 1 → counter cleared;  SET TO "15" = 1 → counter preset to 15.

     SIMULATION SCOPE (behavioral approximation, issues.md B4 — same class as the
     74x97 RATE_MULT_6BIT model): OUT is modeled as CLOCK gated by STROBE
     (OUT = CLOCK AND NOT STROBE, the engine's enableActiveLow path). The actual
     N/16 pulse-rate division, two-chip cascade, the OUT-bar complement (pin 5),
     the "15" detect (pin 1), the INHIBIT/CARRY chain (pins 7/11), CASCADE (12),
     and CLEAR/SET (13/4) are NOT modeled — those pins are informational. The
     rate-select inputs A..D are wired for documentation but do not change OUT.
     Recorded in issues.md (CD4089 entry). */
  'CD4089': {
    name: 'CD4089',
    simpleName: '4-bit Binary Rate Multiplier',
    description: '4-bit binary rate multiplier, CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4089b.pdf',
    tags: ['cmos', '4000 series', 'rate multiplier', '4 bit', 'sequential'],
    sequential: true,
    guideOverview: 'The CD4089 is a binary rate multiplier: it takes a steady input clock and passes through a chosen fraction of the pulses. The fraction is set by a 4-bit number on inputs A, B, C, D. With that number set to N, the chip lets through N pulses for every 16 clock pulses, so the output rate is N/16 of the input rate (N can be 0 through 15). Inside is a small 4-bit counter; the rate-select bits pick which of the counter\'s states produce an output pulse. Extra pins (STROBE, CASCADE, INHIBIT IN/OUT, the "15" output) let you chain two chips together for finer control — an 8-bit fraction (N/256) across two devices. It is used where you need a clock frequency that is a precise fraction of another: numerical control, frequency synthesis, and simple digital filtering.',
    guidePinDescriptions: {
      'A':       'Rate-select bit A (least significant, weight 1), pin 14.',
      'B':       'Rate-select bit B (weight 2), pin 15.',
      'C':       'Rate-select bit C (weight 4), pin 2.',
      'D':       'Rate-select bit D (most significant, weight 8), pin 3.',
      'CLOCK':   'Input clock (pin 9). The output pulse train is derived from this.',
      'STROBE':  'Output strobe (pin 10). HIGH blanks the output (OUT forced LOW); hold it LOW for normal operation. Used together with CASCADE when chaining two chips.',
      'CASCADE': 'Cascade input (pin 12). Used when two chips are chained; HIGH forces OUT HIGH. Tie LOW for a single device.',
      'INHIBIT': 'Inhibit / carry input (pin 11). HIGH inhibits the output; it is the carry path from the more-significant device when cascading. Tie LOW for a single device.',
      'CLEAR':   'Clear (pin 13). HIGH clears the internal 4-bit counter.',
      'SET15':   'Set to "15" (pin 4). HIGH presets the internal counter to 15.',
      'OUT':     'Rate output (pin 6). Delivers N pulses for every 16 clock pulses.',
      'OUTn':    'Complementary rate output (pin 5), the inverse of OUT.',
      'O15':     '"15" output (pin 1). HIGH when the internal counter reaches 15; used for cascading.',
      'CARRYOUT':'Inhibit / carry output (pin 7). Drives the inhibit/carry input of the next device when cascading.',
      'VSS':     'Ground / negative supply (pin 8).',
      'VDD':     'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: 'Setting the output rate',
        paragraphs: [
          'Put a 4-bit number N on A, B, C, D (A is the least significant bit). The chip then passes N out of every 16 input clock pulses to OUT, so the average output rate is N/16 of the clock. N = 0 gives no output pulses; N = 15 passes all but one. The pulses are spread out across the 16-clock window rather than bunched together, which is what makes a rate multiplier useful for generating smooth fractional frequencies.',
        ],
        formulas: ['f_OUT = (N / 16) × f_CLOCK'],
      },
      {
        title: 'Cascading two chips',
        paragraphs: [
          'For finer fractions, two CD4089s chain together using STROBE, CASCADE, the "15" output, and the INHIBIT (carry) in/out pins. The more-significant chip handles the high 4 bits and the less-significant chip the low 4 bits, giving an 8-bit fraction N/256. STROBE held HIGH blanks a chip\'s output; for a single chip on its own, hold STROBE, CASCADE, INHIBIT IN, CLEAR, and SET TO "15" inactive (LOW) and feed the clock.',
        ],
        note: '74Sim models OUT as the clock gated by STROBE (output passes when STROBE is LOW). The N/16 pulse-rate division, the two-chip cascade, the complementary OUT pin, the "15" detect, and the inhibit/carry chain are not simulated — those pins are informational.',
      },
    ],
    pinout: [
      { pin:  1, name: 'O15',      type: 'output' },
      { pin:  2, name: 'C',        type: 'input'  },
      { pin:  3, name: 'D',        type: 'input'  },
      { pin:  4, name: 'SET15',    type: 'input'  },
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
      // RATE_MULT_6BIT input contract: [CLK, ENP, A, B, C, D, E, F]; only CLK and
      // ENP drive the output in this behavioral approximation (issues.md B4). The
      // CD4089's STROBE is the enable: STR=1 blanks OUT (truth table), so it is
      // wired as the active-LOW enable via gate.enableActiveLow → OUT = CLOCK AND
      // NOT STROBE. The rate bits A..D are passed for documentation but ignored by
      // the model. Only OUT (pin 6) is driven; OUTn/O15/CARRYOUT stay informational.
      {
        type: 'RATE_MULT_6BIT',
        enableActiveLow: true,
        inputs: ['CLOCK', 'STROBE', 'A', 'B', 'C', 'D'],
        outputs: ['OUT'],
      },
    ],
  },
};
