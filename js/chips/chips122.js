// chips122.js — Block 122: CMOS 4000 series logic ICs (coverage expansion).
// CD4522 programmable BCD divide-by-N down counter. Pinout + behavior verified by
// reading the TI/Harris datasheet "CD4522B Types — CMOS Programmable BCD
// Divide-by-'N' Counter" (SCHS079C, data sheet acquired from Harris Semiconductor,
// Revised October 2003) directly as 300-dpi PDF page images (Read with pages:),
// NOT via the WebFetch text summarizer which mangles these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (row "4522") for the roadmap.
// Chips: CD4522
export const CHIPS_BLOCK_122 = {

  // ── CD4522: programmable BCD divide-by-N down counter (16-pin) ─────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4522B Types — CMOS Programmable BCD Divide-by-'N' Counter",
     SCHS079C (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4522b.pdf
     TERMINAL ASSIGNMENT (TOP VIEW, page 5) + FUNCTIONAL DIAGRAM (page 1), both
     read and cross-checked as rendered PDF page images:
        1  Q3                16 VDD
        2  P3                15 Q2
        3  PE (Preset En.)   14 P2
        4  CI (Clock Inhib.) 13 CF (Cascade Feedback)
        5  P0                12 "0" (decoded-zero output)
        6  CL (Clock)        11 P1
        7  Q0                10 MR (Master Reset)
        8  VSS                9 Q1
     Q0 is the LSB, Q3 the MSB; P0 is the LSB jam input, P3 the MSB.
     This is the REAL CD4522B assignment, verified against its own datasheet and
     NOT cloned from any sibling (issues.md C2). The coverage-plan hint
     FREQ_DIV_PROG is the 74292 (a single toggling OUT, divide-by-(N+1), with no
     BCD outputs / preset / clock-inhibit / cascade / reset) and does not fit, so a
     dedicated BCD_DIVN_DOWN_4522 engine primitive was added (see specificChipsSim.js).

     Behavior (datasheet TRUTH TABLES + Description, page 1, read as PDF images):
       The four flip-flops form an internally synchronous BCD (0–9) DOWN counter.
       MR (Master Reset) HIGH asynchronously resets the count to 0 (top priority).
       PE (Preset Enable) HIGH asynchronously jam-loads P0–P3 (a BCD digit) into the
       counter. With MR=0 and PE=0, the count steps DOWN by one on each POSITIVE
       CLOCK transition while CLOCK INHIBIT is LOW, OR on each NEGATIVE CLOCK INHIBIT
       transition while CLOCK is HIGH (the datasheet's edge-clocked design). A HIGH
       on CLOCK INHIBIT disables counting. The "0" output (pin 12) is the decoded
       zero state: it goes HIGH when the count is 0. The Cascade Feedback (CF) input
       gates both counting and the "0" decode — CF HIGH enables them — which lets
       stages chain "without the need for external gating": feed a lower stage's "0"
       output into a higher stage's CF so the higher stage steps only when the lower
       one is at zero. For SINGLE-STAGE divide-by-N: tie CF HIGH and tie "0" to PE,
       so reaching zero reloads the preset N and the "0" pin pulses once per N clocks.
       OUTPUTS table (count→Q3Q2Q1Q0, page 1): straight 8-4-2-1 BCD, Q0 = LSB. */
  'CD4522': {
    name: 'CD4522',
    simpleName: 'Programmable BCD Divide-by-N Down Counter',
    description: 'Presettable sync BCD divide-by-N down counter, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4522b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'bcd counter', 'down counter', 'divide-by-n', 'presettable', 'synchronous'],
    guideOverview: 'The CD4522 is a presettable BCD down counter built for divide-by-N work. You load a BCD digit (0–9) into it on the P0–P3 jam inputs, and from there it counts down one step per clock. When it reaches zero, the decoded "0" output (pin 12) goes HIGH. Tie that "0" output back to PRESET ENABLE and the chip reloads your preset value and starts again, so the "0" pin emits one pulse for every N clock pulses — a programmable frequency divider. The count appears on Q0–Q3 as ordinary 8-4-2-1 BCD, with Q0 the least significant bit. PRESET ENABLE and MASTER RESET are both asynchronous and active HIGH: PRESET ENABLE jam-loads P0–P3, MASTER RESET clears the count to zero and dominates. CLOCK INHIBIT (active HIGH) freezes the count. The CASCADE FEEDBACK input lets you chain several CD4522s into a multi-digit divider without extra glue logic; for a single chip you tie it HIGH. Typical uses are frequency synthesizers, phase-locked loops, and programmable timers and dividers.',
    guidePinDescriptions: {
      Q3:  'Counter output bit 3 (MSB, BCD weight 8).',
      P3:  'Jam / preset input bit 3 (MSB, BCD weight 8). Loaded when PRESET ENABLE is HIGH.',
      PE:  'Preset Enable. Active HIGH and asynchronous: while HIGH it jam-loads P0–P3 into the counter. Hold LOW for normal counting. Tie the "0" output here for single-chip divide-by-N.',
      CI:  'Clock Inhibit. Active HIGH: a HIGH disables counting (the count freezes). Hold LOW to count.',
      P0:  'Jam / preset input bit 0 (LSB, BCD weight 1). Loaded when PRESET ENABLE is HIGH.',
      CLK: 'Clock input. The count steps down one on each rising (positive-going) edge while CLOCK INHIBIT is LOW and PRESET ENABLE / MASTER RESET are LOW.',
      Q0:  'Counter output bit 0 (LSB, BCD weight 1).',
      VSS: 'Negative supply / ground (0 V).',
      Q1:  'Counter output bit 1 (BCD weight 2).',
      MR:  'Master Reset. Active HIGH and asynchronous: forces the count to 0. Dominates PRESET ENABLE. Hold LOW for normal counting.',
      P1:  'Jam / preset input bit 1 (BCD weight 2). Loaded when PRESET ENABLE is HIGH.',
      ZERO:'Decoded "0" output (datasheet pin "0"). Goes HIGH when the count reaches zero (and CASCADE FEEDBACK is HIGH). Tie it to PRESET ENABLE for single-chip divide-by-N, or to the next stage\'s CASCADE FEEDBACK when cascading.',
      CF:  'Cascade Feedback. Active HIGH: enables counting and the "0" decode. Tie HIGH (to VDD) for a single chip; when cascading, drive it from a less-significant stage\'s "0" output so this stage steps only when the lower one is at zero.',
      P2:  'Jam / preset input bit 2 (BCD weight 4). Loaded when PRESET ENABLE is HIGH.',
      Q2:  'Counter output bit 2 (BCD weight 4).',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q3',   type: 'output' },
      { pin:  2, name: 'P3',   type: 'input'  },
      { pin:  3, name: 'PE',   type: 'input'  },
      { pin:  4, name: 'CI',   type: 'input'  },
      { pin:  5, name: 'P0',   type: 'input'  },
      { pin:  6, name: 'CLK',  type: 'input'  },
      { pin:  7, name: 'Q0',   type: 'output' },
      { pin:  8, name: 'VSS',  type: 'power'  },
      { pin:  9, name: 'Q1',   type: 'output' },
      { pin: 10, name: 'MR',   type: 'input'  },
      { pin: 11, name: 'P1',   type: 'input'  },
      { pin: 12, name: 'ZERO', type: 'output' },
      { pin: 13, name: 'CF',   type: 'input'  },
      { pin: 14, name: 'P2',   type: 'input'  },
      { pin: 15, name: 'Q2',   type: 'output' },
      { pin: 16, name: 'VDD',  type: 'power'  },
    ],
    gates: [
      // BCD_DIVN_DOWN_4522 input order:  [CL, CI, PE, MR, CF, P0, P1, P2, P3]
      // output order:                    [Q0, Q1, Q2, Q3, ZERO]   (P0/Q0 = LSB).
      { type: 'BCD_DIVN_DOWN_4522',
        inputs:  ['CLK', 'CI', 'PE', 'MR', 'CF', 'P0', 'P1', 'P2', 'P3'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3', 'ZERO'] },
    ],
    guideSections: [
      {
        title: 'Programmable BCD Divide-by-N Down Counter',
        paragraphs: [
          'The CD4522 is a four-stage BCD counter that counts DOWN. Its main job is dividing a clock frequency by a number you choose. You put a BCD digit 0–9 on the jam inputs P0 (LSB) to P3 (MSB), and the counter walks down toward zero one step per clock.',
          'All four stages share one clock and are internally synchronous, so the Q0–Q3 outputs settle together as a clean 8-4-2-1 BCD count — Q0 is the least significant bit. Counting down from 0 wraps back to 9.',
          'A step happens on each rising (positive-going) edge of CLOCK while CLOCK INHIBIT is LOW. The same step can instead be driven from CLOCK INHIBIT: a falling (negative-going) edge on CLOCK INHIBIT while CLOCK is held HIGH also advances the count. Either way, a HIGH on CLOCK INHIBIT freezes the count.',
          'PRESET ENABLE and MASTER RESET are both active HIGH and asynchronous (no clock edge needed). A HIGH on PRESET ENABLE jam-loads P0–P3 into the counter. A HIGH on MASTER RESET clears the count to zero and dominates PRESET ENABLE.',
        ],
        formulas: [
          'Counting edge = CLOCK rising AND CLOCK INHIBIT = 0 AND PRESET ENABLE = 0 AND MASTER RESET = 0 AND CASCADE FEEDBACK = 1',
          '(or) CLOCK INHIBIT falling while CLOCK = 1 — same effect',
          'Q0 = weight 1   Q1 = weight 2   Q2 = weight 4   Q3 = weight 8',
          'Counts DOWN: …→2→1→0→9→8… (BCD modulus 10)',
          '"0" output = HIGH when count = 0 AND CASCADE FEEDBACK = 1',
        ],
        list: [
          'Programmable frequency divider: tie "0" to PRESET ENABLE, preset N, divide a clock by N.',
          'Frequency synthesizers and phase-locked loop dividers.',
          'Programmable down counters and timers.',
        ],
        note: '74Sim models the CD4522 as an ideal internally-synchronous BCD down counter: positive-edge clock (or negative clock-inhibit edge) gated by active-HIGH CLOCK INHIBIT and active-HIGH CASCADE FEEDBACK, with active-HIGH asynchronous PRESET ENABLE jam-load and active-HIGH asynchronous MASTER RESET (MASTER RESET dominates). A single chip needs CASCADE FEEDBACK tied HIGH or it will not count — that matches the hardware. As with all 74Sim sequential parts there is no propagation delay, so the brief stage-to-stage settling transients of real silicon are not reproduced; the settled BCD count is correct (see issues.md A1).',
      },
      {
        title: 'Divide-by-N and Cascading',
        paragraphs: [
          'For a single-chip divide-by-N: tie CASCADE FEEDBACK HIGH and wire the "0" output back to PRESET ENABLE. Load your divisor N on P0–P3. The counter steps down to zero, the "0" output goes HIGH, that pulse reloads N through PRESET ENABLE, and the cycle repeats — so the "0" pin produces one pulse for every N clock pulses.',
          'For divisors larger than nine, chain several CD4522s — one per BCD digit. Drive every stage from the same clock. The CASCADE FEEDBACK input gates both counting and the "0" decode, so feeding a less-significant stage\'s "0" output into the next stage\'s CASCADE FEEDBACK makes that stage step down only when the lower digit is at zero. The most significant stage\'s "0" output is the whole chain\'s divide-by-N output and is fed back to every PRESET ENABLE. This is what the datasheet means by cascading "without the need for external gating".',
        ],
      },
    ],
  },

};
