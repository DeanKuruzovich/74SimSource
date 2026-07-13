// chips127.js — Block 127: CMOS 4000/4500 series logic ICs (coverage expansion).
// CD40192 — presettable BCD (decade) up/down counter with DUAL clocks. Pinout +
// behavior verified by reading the original Harris/TI datasheet directly as
// rendered PDF page images (Read on 300/400-dpi pdftoppm crops), NOT via a text
// summarizer that mangles these scans (see issues.md C4).
//
// NOTE: this part lives ALONE in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
//
// IMPORTANT divergence from CMOS-4000-Coverage-Plan.md's hint: the plan maps
// CD40192 to the `COUNTER_BCD_UPDOWN_CD` primitive, but that primitive models the
// CD4510 — a SINGLE-clock counter with an UP/DOWN direction line, a CARRY IN
// count-enable and a PRESET ENABLE. The real CD40192B is the 74192-family part:
// it has TWO clocks (CLOCK UP / CLOCK DOWN), no direction pin, no carry-in, and
// separate active-LOW CARRY and BORROW outputs. Using the hinted primitive would
// have produced the wrong device entirely (issues.md C2 lesson). The correct
// engine primitive is `COUNTER_DECADE_DC`, which already models exactly this
// dual-clock decade up/down counter (it backs the 74x192). No engine work needed.
// See issues.md for the divergence note.
export const CHIPS_BLOCK_127 = {

  // ── CD40192: presettable BCD up/down counter, dual clock (16-pin) ───────────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD40192B, CD40193B Types — CMOS Presettable Up/Down Counters (Dual Clock
     With Reset)", SCHS046 (Revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40192b.pdf
     Verified: TERMINAL ASSIGNMENT (TOP VIEW) + FUNCTIONAL DIAGRAM + TRUTH TABLE,
     read as 200/400-dpi rendered PDF page images (issues.md C4).

     Terminal assignment (TOP VIEW, page 1), read off the datasheet dual-in-line
     diagram — NOT cloned from the 74x192 sibling (issues.md C2), though it does
     coincide with the standard 74192 pin map:
        1  J2                16  VDD
        2  Q2                15  J1
        3  Q1                14  RESET
        4  CLOCK DOWN        13  BORROW  (active LOW)
        5  CLOCK UP          12  CARRY   (active LOW)
        6  Q3                11  PRESET ENABLE (active LOW)
        7  Q4                10  J3
        8  VSS                9  J4
     The bars printed over BORROW (13), CARRY (12) and PRESET ENABLE (11) confirm
     those three are active LOW; RESET (14) is printed without a bar = active HIGH.

     Behavior (datasheet text page 1 + TRUTH TABLE page 2): four JAM inputs
     J1–J4, a PRESET ENABLE, individual CLOCK UP / CLOCK DOWN inputs, and CARRY /
     BORROW cascade outputs. The count advances on the POSITIVE edge of CLOCK UP
     while CLOCK DOWN is held HIGH, and decrements on the POSITIVE edge of CLOCK
     DOWN while CLOCK UP is held HIGH; BCD modulus 10 (0…9). RESET HIGH
     asynchronously clears all outputs to 0 (and dominates — TRUTH TABLE bottom
     row: RESET=1 → RESET regardless of the clocks/PE). PRESET ENABLE LOW
     asynchronously jam-loads J1–J4 into the counter (TRUTH TABLE: clocks=X,
     PE=0, RESET=0 → PRESET). CARRY and BORROW are normally HIGH; CARRY pulses
     LOW when the counter is at 9 and CLOCK UP is LOW (i.e. on the 9→0 up
     transition), BORROW pulses LOW when the counter is at 0 and CLOCK DOWN is
     LOW (the 0→9 down transition). These feed the next stage's CLOCK UP / CLOCK
     DOWN for ripple cascading. J1/Q1 = LSB (weight 1), J4/Q4 = MSB (weight 8). */
  'CD40192': {
    name: 'CD40192',
    simpleName: 'Presettable BCD Up/Down Counter (Dual Clock)',
    description: 'Presettable BCD decade up/down counter, dual clocks, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40192b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'bcd', 'decade', 'up-down counter', 'presettable', 'dual clock', 'synchronous'],
    guideOverview: 'The CD40192 is a presettable synchronous BCD (decade) up/down counter. Unlike a single-clock counter with a direction pin, it has two separate clock inputs: pulse CLOCK UP to count up and CLOCK DOWN to count down, holding the unused clock HIGH. The count runs 0 through 9 and wraps. Four JAM inputs J1–J4 let you preload any value: take PRESET ENABLE LOW and the counter jumps to J1–J4 immediately, with no clock edge needed. A HIGH on RESET asynchronously clears the count to zero and overrides everything else. Two cascade outputs, CARRY and BORROW (both active LOW and normally HIGH), make it easy to chain digits: CARRY pulses LOW as the counter rolls 9→0 counting up, and BORROW pulses LOW as it rolls 0→9 counting down. Connect CARRY of one digit to the CLOCK UP of the next, and BORROW to its CLOCK DOWN, to build multi-digit up/down counters and BCD displays. The binary sibling is the CD40193.',
    guidePinDescriptions: {
      J2:          'Jam / preset input bit 2 (weight 2). Loaded into the counter when PRESET ENABLE is LOW.',
      Q2:          'BCD count output bit 2 (weight 2).',
      Q1:          'BCD count output bit 1 (LSB, weight 1).',
      CLK_DOWN:    'Clock Down input. Rising (positive-going) edges decrement the counter while CLOCK UP is held HIGH.',
      CLK_UP:      'Clock Up input. Rising (positive-going) edges increment the counter while CLOCK DOWN is held HIGH.',
      Q3:          'BCD count output bit 3 (weight 4).',
      Q4:          'BCD count output bit 4 (MSB, weight 8).',
      VSS:         'Negative supply / ground (0 V).',
      J4:          'Jam / preset input bit 4 (MSB, weight 8). Loaded when PRESET ENABLE is LOW.',
      J3:          'Jam / preset input bit 3 (weight 4). Loaded when PRESET ENABLE is LOW.',
      PE:          'Preset Enable, ACTIVE LOW and asynchronous. Take LOW to jam-load J1–J4 into the counter. Hold HIGH for normal counting.',
      CARRY:       'Carry output, ACTIVE LOW (normally HIGH). Pulses LOW when the counter is at 9 and CLOCK UP is LOW — the 9→0 roll-over while counting up. Drives the next digit\'s CLOCK UP.',
      BORROW:      'Borrow output, ACTIVE LOW (normally HIGH). Pulses LOW when the counter is at 0 and CLOCK DOWN is LOW — the 0→9 roll-under while counting down. Drives the next digit\'s CLOCK DOWN.',
      RESET:       'Master Reset, ACTIVE HIGH and asynchronous. Take HIGH to force the count to 0. Overrides PRESET ENABLE and the clocks.',
      J1:          'Jam / preset input bit 1 (LSB, weight 1). Loaded when PRESET ENABLE is LOW.',
      VDD:         'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'J2',       type: 'input'  },
      { pin:  2, name: 'Q2',       type: 'output' },
      { pin:  3, name: 'Q1',       type: 'output' },
      { pin:  4, name: 'CLK_DOWN', type: 'input'  },
      { pin:  5, name: 'CLK_UP',   type: 'input'  },
      { pin:  6, name: 'Q3',       type: 'output' },
      { pin:  7, name: 'Q4',       type: 'output' },
      { pin:  8, name: 'VSS',      type: 'power'  },
      { pin:  9, name: 'J4',       type: 'input'  },
      { pin: 10, name: 'J3',       type: 'input'  },
      { pin: 11, name: 'PE',       type: 'input'  },
      { pin: 12, name: 'CARRY',    type: 'output' },
      { pin: 13, name: 'BORROW',   type: 'output' },
      { pin: 14, name: 'RESET',    type: 'input'  },
      { pin: 15, name: 'J1',       type: 'input'  },
      { pin: 16, name: 'VDD',      type: 'power'  },
    ],
    gates: [
      // Reuse COUNTER_DECADE_DC (the dual-clock 74x192 decade up/down model).
      // Its contract — inputs: [A,B,C,D, CLK_UP, CLK_DOWN, CLR, LOAD],
      //                outputs: [QA,QB,QC,QD, CO, BO] — maps to the CD40192 as:
      //   A..D    = J1..J4 (LSB..MSB jam inputs)
      //   CLR     = RESET   (active HIGH, async clear — primitive clears on CLR=1)
      //   LOAD    = PE      (active LOW, async jam — primitive loads on LOAD=0)
      //   CO/BO   = CARRY/BORROW (both active LOW: LOW at count 9 with CLK_UP LOW /
      //             count 0 with CLK_DOWN LOW). RESET dominates LOAD, matching the
      //             datasheet TRUTH TABLE.
      { type: 'COUNTER_DECADE_DC',
        inputs:  ['J1', 'J2', 'J3', 'J4', 'CLK_UP', 'CLK_DOWN', 'RESET', 'PE'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'CARRY', 'BORROW'] },
    ],
    guideSections: [
      {
        title: 'Dual-Clock Up/Down Counting',
        paragraphs: [
          'The CD40192 has two clock inputs instead of one clock plus a direction pin. To count up, feed your clock into CLOCK UP and hold CLOCK DOWN HIGH. To count down, feed the clock into CLOCK DOWN and hold CLOCK UP HIGH. The counter changes on the rising (positive-going) edge of whichever clock is active. Never pulse both clocks at once.',
          'It counts in BCD: the value runs 0, 1, 2, … 9 and then wraps back to 0 (counting up) or from 0 back to 9 (counting down). The outputs Q1–Q4 are a standard 8-4-2-1 weighted code, so Q1 is the least-significant bit and Q4 the most-significant.',
        ],
        formulas: [
          'Count up   = CLOCK UP rising,  CLOCK DOWN held HIGH',
          'Count down = CLOCK DOWN rising,  CLOCK UP held HIGH',
          'Q1 = weight 1   Q2 = weight 2   Q3 = weight 4   Q4 = weight 8',
          'Modulus = 10 (BCD): count runs 0…9 then wraps',
        ],
        note: '74Sim models the CD40192 as an ideal dual-clock BCD up/down counter: rising-edge CLOCK UP / CLOCK DOWN, asynchronous active-LOW PRESET ENABLE jam-load and asynchronous active-HIGH RESET (RESET dominates), with active-LOW CARRY and BORROW. It shares the engine model used by the 74x192. As with all 74Sim sequential parts there is no propagation delay, so the brief carry/borrow output glitches of real silicon are not reproduced — the settled BCD count and the steady carry/borrow levels are correct (see issues.md A1).',
      },
      {
        title: 'Preset, Reset and Cascading',
        paragraphs: [
          'To start from an arbitrary digit, place its BCD value on J1 (LSB) … J4 (MSB) and take PRESET ENABLE LOW; the counter jumps to that value immediately, no clock edge required. This makes the CD40192 an easy programmable divide-by-N stage. Taking RESET HIGH forces the count to 0 at once and overrides the preset and the clocks.',
          'CARRY and BORROW are both active LOW and sit HIGH during normal counting. CARRY pulses LOW as the counter rolls over from 9 to 0 while counting up; BORROW pulses LOW as it rolls under from 0 to 9 while counting down. To build a multi-digit counter, wire CARRY of the ones digit to CLOCK UP of the tens digit, and BORROW of the ones digit to CLOCK DOWN of the tens digit. Each roll-over then clocks the next digit in the right direction.',
        ],
        list: [
          'Multi-digit BCD up/down counters and clock/timer displays.',
          'Programmable divide-by-N: jam a start value on J1–J4, then count.',
          'Up/down difference counting from two independent clock sources.',
        ],
      },
    ],
  },

};
