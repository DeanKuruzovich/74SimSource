// chips99.js — Block 99: CMOS 4000 series logic ICs (coverage expansion, Batch 6)
// CD4516 presettable 4-bit binary up/down counter. Pinout + behavior verified by
// reading the TI datasheet "CD4510B, CD4516B Types — CMOS Presettable Up/Down
// Counters" (SCHS071B, data sheet acquired from Harris Semiconductor, Revised
// July 2003) directly as PDF page images (Read with pages: / rendered crops), NOT
// via the WebFetch text summarizer which mangles these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 6) for the full roadmap.
// Chips: CD4516
export const CHIPS_BLOCK_99 = {

  // ── CD4516: presettable 4-bit binary up/down counter (16-pin) ─────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4510B, CD4516B Types — CMOS Presettable Up/Down
     Counters", SCHS071B (Revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4516b.pdf
     Terminal assignment (TOP VIEW, page 1) + Functional Diagram (page 1),
     both read and cross-checked as rendered PDF page images:
       1  PRESET ENABLE     16 VDD
       2  Q4                15 CLOCK
       3  P4                14 Q3
       4  P1                13 P3
       5  CARRY IN (¯)      12 P2
       6  Q1                11 Q2
       7  CARRY OUT (¯)     10 UP/DOWN
       8  VSS                9 RESET
     This pin map is the REAL CD4516B (CD4510B-family) assignment and is NOT the
     same as the pre-existing `74x4516` entry in chips59.js (whose pinout was
     authored without the datasheet — see issues.md). Cloning that sibling would
     have placed every pin wrong, so it was verified independently (issues.md C2).

     Behavior (datasheet text, page 1): the four synchronously-clocked D-type
     flip-flops advance UP or DOWN by one on each POSITIVE-going CLOCK edge while
     CARRY IN is LOW; binary modulus 16 (0000…1111). A HIGH on RESET
     asynchronously clears the count to 0000. A HIGH on PRESET ENABLE
     asynchronously jam-loads P1–P4 into the counter. UP/DOWN HIGH = count up,
     LOW = count down. CARRY IN and CARRY OUT are ACTIVE LOW: CARRY OUT goes LOW
     for synchronous cascading when the counter is at its terminal count (1111
     counting up, 0000 counting down) AND CARRY IN is LOW. Q1 is the LSB, Q4 the
     MSB; P1 is the LSB jam input, P4 the MSB. */
  'CD4516': {
    name: 'CD4516',
    simpleName: 'Presettable 4-bit Binary Up/Down Counter',
    description: 'Presettable sync 4-bit binary up/down counter, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4516b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary counter', 'up-down counter', 'presettable', 'synchronous'],
    guideOverview: 'The CD4516 is a presettable synchronous 4-bit BINARY up/down counter (the binary sibling of the BCD CD4510). It is built from four synchronously-clocked D-type flip-flops with internal gating so the carry between stages is synchronous and the Q1–Q4 outputs settle together as a clean 8-4-2-1 weighted binary count. The counter runs the full 0000→1111 range (modulus 16). The UP/DOWN input chooses the direction: HIGH counts up, LOW counts down. A HIGH on PRESET ENABLE asynchronously jam-loads the value on P1–P4 into the counter, and a HIGH on RESET asynchronously clears it to zero. CARRY IN and CARRY OUT (both active LOW) make it easy to chain stages: counting is enabled while CARRY IN is LOW, and CARRY OUT pulses LOW at the terminal count (1111 up / 0000 down) so several CD4516s can be cascaded — synchronously by gating the carry into the next stage\'s CARRY IN, or in ripple mode by driving the next stage\'s CLOCK. Typical uses are programmable timing, divide-by-N dividers, binary state sequencing, and address generation.',
    guidePinDescriptions: {
      PE:   'Preset Enable. Active HIGH and asynchronous: while HIGH it jam-loads P1–P4 into the counter. Hold LOW for normal counting.',
      Q4:   'Counter output bit 4 (MSB, weight 8).',
      P4:   'Jam / preset input bit 4 (MSB, weight 8). Loaded when PRESET ENABLE is HIGH.',
      P1:   'Jam / preset input bit 1 (LSB, weight 1). Loaded when PRESET ENABLE is HIGH.',
      CIn:  'Carry In, ACTIVE LOW. Counting is enabled while this is LOW; hold it HIGH to inhibit the count. Used as the cascade input from a less significant stage.',
      Q1:   'Counter output bit 1 (LSB, weight 1).',
      COn:  'Carry Out, ACTIVE LOW. Goes LOW at the terminal count (1111 when counting up, 0000 when counting down) while CARRY IN is LOW. Drives the next stage when cascading.',
      RST:  'Master Reset. Active HIGH and asynchronous: forces the count to 0000. Hold LOW for normal counting.',
      UD:   'Up/Down direction control. HIGH = count up, LOW = count down.',
      Q2:   'Counter output bit 2 (weight 2).',
      P2:   'Jam / preset input bit 2 (weight 2). Loaded when PRESET ENABLE is HIGH.',
      P3:   'Jam / preset input bit 3 (weight 4). Loaded when PRESET ENABLE is HIGH.',
      Q3:   'Counter output bit 3 (weight 4).',
      CLK:  'Clock input. The counter advances one count on each rising (positive-going) edge while CARRY IN is LOW and PRESET ENABLE / RESET are LOW.',
      VSS:  'Negative supply / ground (0 V).',
      VDD:  'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'PE',  type: 'input'  },
      { pin:  2, name: 'Q4',  type: 'output' },
      { pin:  3, name: 'P4',  type: 'input'  },
      { pin:  4, name: 'P1',  type: 'input'  },
      { pin:  5, name: 'CIn', type: 'input'  },
      { pin:  6, name: 'Q1',  type: 'output' },
      { pin:  7, name: 'COn', type: 'output' },
      { pin:  8, name: 'VSS', type: 'power'  },
      { pin:  9, name: 'RST', type: 'input'  },
      { pin: 10, name: 'UD',  type: 'input'  },
      { pin: 11, name: 'Q2',  type: 'output' },
      { pin: 12, name: 'P2',  type: 'input'  },
      { pin: 13, name: 'P3',  type: 'input'  },
      { pin: 14, name: 'Q3',  type: 'output' },
      { pin: 15, name: 'CLK', type: 'input'  },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      // COUNTER_BIN_UPDOWN_CD input order: [CP, UD, PE, CI, MR, P0, P1, P2, P3]
      // with P0/Q0 = LSB. carryActiveLow:true selects the real CD4516B
      // active-LOW CARRY IN / CARRY OUT semantics (see issues.md).
      { type: 'COUNTER_BIN_UPDOWN_CD', carryActiveLow: true,
        inputs:  ['CLK', 'UD', 'PE', 'CIn', 'RST', 'P1', 'P2', 'P3', 'P4'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'COn'] },
    ],
    guideSections: [
      {
        title: 'Presettable 4-bit Binary Up/Down Counter',
        paragraphs: [
          'Unlike the BCD CD4510, the CD4516 counts through all sixteen binary states 0000→1111 (modulus 16). All four stages share one clock, so the carry between stages is synchronous and the Q1–Q4 outputs change together — there are no ripple-decode glitches between stages.',
          'The counter advances one count on each rising (positive-going) edge of CLOCK while CARRY IN is held LOW. The UP/DOWN input selects direction: HIGH counts up (…→1110→1111→0000…), LOW counts down (…→0001→0000→1111…).',
          'PRESET ENABLE is active HIGH and asynchronous: while it is HIGH the value on the jam inputs P1–P4 is loaded straight into the counter (no clock edge needed). RESET is also active HIGH and asynchronous, and dominates — taking it HIGH immediately forces the count to 0000.',
          'CARRY IN and CARRY OUT are both ACTIVE LOW. Counting is enabled only while CARRY IN is LOW; pull it HIGH to freeze the count. CARRY OUT goes LOW at the terminal count — 1111 when counting up, 0000 when counting down — while CARRY IN is LOW, providing the cascade signal to the next stage.',
        ],
        formulas: [
          'Counting edge = CLOCK rising  AND  CARRY IN = 0  AND  PRESET ENABLE = 0  AND  RESET = 0',
          'Q1 = weight 1 (2⁰)   Q2 = weight 2 (2¹)',
          'Q3 = weight 4 (2²)   Q4 = weight 8 (2³)',
          'Modulus = 16 (binary): count runs 0…15 then wraps',
          'CARRY OUT = LOW  when  (count = 1111 and UP)  or  (count = 0000 and DOWN),  with CARRY IN = 0',
        ],
        list: [
          'Up/down difference counting and binary state sequencing.',
          'Multistage synchronous counting (gate CARRY OUT into the next stage\'s CARRY IN).',
          'Multistage ripple counting (CARRY OUT → next stage CLOCK).',
          'Programmable divide-by-N: preset a start value via P1–P4, then count.',
        ],
        note: '74Sim models the CD4516 as an ideal synchronous binary up/down counter: rising-edge clock gated by active-LOW CARRY IN, active-HIGH asynchronous PRESET ENABLE jam-load and active-HIGH asynchronous RESET (RESET dominates). CARRY IN / CARRY OUT use the real active-LOW polarity (the shared COUNTER_BIN_UPDOWN_CD primitive\'s carryActiveLow flag) — this differs from the pre-existing 74x4516 entry, whose carry pins are modeled active-HIGH (see issues.md). As with all 74Sim sequential parts there is no propagation delay, so the brief stage-to-stage settling transients of real silicon are not reproduced — the settled binary count is correct (see issues.md A1).',
      },
      {
        title: 'Preset and Cascading',
        paragraphs: [
          'To start from an arbitrary value, place it on P1 (LSB) … P4 (MSB) and pulse PRESET ENABLE HIGH; the counter jumps to that value immediately. This makes the CD4516 a flexible divide-by-N building block.',
          'For wider counters, chain stages. Synchronous cascade: drive every stage from the same clock and feed each stage\'s CARRY OUT into the next stage\'s CARRY IN so only the enabled stage advances. Ripple cascade: connect CARRY OUT of one stage to the CLOCK of the next. If the UP/DOWN line changes during a terminal count, the CARRY OUT must be gated to keep the cascade clean (per the datasheet).',
        ],
      },
    ],
  },

};
