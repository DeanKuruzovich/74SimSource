// chips128.js — Block 128: CMOS 4000/4500 series logic ICs (coverage expansion).
// CD40193 — presettable BINARY (mod-16) up/down counter with DUAL clocks. Pinout +
// behavior verified by reading the original Harris/TI datasheet directly as
// rendered PDF page images (Read on 300/400/600-dpi pdftoppm crops), NOT via a text
// summarizer that mangles these scans (see issues.md C4).
//
// NOTE: this part lives ALONE in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
//
// IMPORTANT divergence from CMOS-4000-Coverage-Plan.md's hint: the plan maps
// CD40193 to the `COUNTER_BIN_UPDOWN_CD` primitive, but that primitive models the
// CD4516 — a SINGLE-clock counter with an UP/DOWN direction line, a CARRY IN
// count-enable and a PRESET ENABLE. The real CD40193B is the 74193-family part:
// it has TWO clocks (CLOCK UP / CLOCK DOWN), no direction pin, no carry-in, and
// separate active-LOW CARRY and BORROW outputs. Using the hinted primitive would
// have produced the wrong device entirely (issues.md C2 lesson — exactly the same
// trap that the CD40192 sibling hit with COUNTER_BCD_UPDOWN_CD). The correct engine
// primitive is `COUNTER_UPDOWN_DC`, which already models exactly this dual-clock
// binary up/down counter (it backs the 74x193). No engine work needed.
//
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD40192B, CD40193B Types — CMOS Presettable Up/Down Counters (Dual Clock
//   With Reset)", SCHS046 (Revised July 2003).
//   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40193b.pdf
//   Verified: TERMINAL ASSIGNMENT (TOP VIEW, page 1, read as a 600-dpi rendered
//   PDF page-image crop), Fig. 2 "CD40193B logic diagram (binary)" + Fig. 3 timing
//   diagram (page 2, 400-dpi crops), and the page-1 functional description text
//   (issues.md C4). The CD40192B (BCD) and CD40193B (binary) share ONE terminal
//   assignment in this datasheet — the only behavioral difference is the modulus
//   (CD40192 = decade 0..9, CD40193 = binary 0..15). The pin map was read off the
//   CD40193B's own datasheet diagram, NOT cloned from the 74x193 sibling (issues.md
//   C2), though it does coincide with the standard 74193 pin map.
//
// Terminal assignment (TOP VIEW, page 1), read off the dual-in-line diagram:
//    1  J2                16  VDD
//    2  Q2                15  J1
//    3  Q1                14  RESET
//    4  CLOCK DOWN        13  BORROW         (active LOW — datasheet bar)
//    5  CLOCK UP          12  CARRY          (active LOW — datasheet bar)
//    6  Q3                11  PRESET ENABLE  (active LOW — datasheet bar)
//    7  Q4                10  J3
//    8  VSS                9  J4
// The bars printed over BORROW (13), CARRY (12) and PRESET ENABLE (11) confirm
// those three are active LOW; RESET (14) is printed without a bar = active HIGH.
//
// Behavior (datasheet text page 1 + Fig. 2 binary logic diagram + Fig. 3 timing):
// four JAM inputs J1–J4, a PRESET ENABLE, individual CLOCK UP / CLOCK DOWN inputs,
// and CARRY / BORROW cascade outputs. The count advances on the POSITIVE edge of
// CLOCK UP while CLOCK DOWN is held HIGH, and decrements on the POSITIVE edge of
// CLOCK DOWN while CLOCK UP is held HIGH; BINARY modulus 16 (0…15). RESET HIGH
// asynchronously clears all outputs to 0 and dominates. PRESET ENABLE LOW
// asynchronously jam-loads J1–J4. CARRY and BORROW are normally HIGH; CARRY pulses
// LOW when the counter is at 15 and CLOCK UP is LOW (the 15→0 up roll-over),
// BORROW pulses LOW when the counter is at 0 and CLOCK DOWN is LOW (the 0→15 down
// roll-under). These feed the next stage's CLOCK UP / CLOCK DOWN for ripple
// cascading. J1/Q1 = LSB (weight 1), J4/Q4 = MSB (weight 8).
export const CHIPS_BLOCK_128 = {

  // ── CD40193: presettable binary up/down counter, dual clock (16-pin) ─────────
  'CD40193': {
    name: 'CD40193',
    simpleName: 'Presettable Binary Up/Down Counter (Dual Clock)',
    description: 'Presettable 4-bit binary up/down counter, dual clocks, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40193b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary', '4 bit', 'up-down counter', 'presettable', 'dual clock', 'synchronous'],
    guideOverview: 'The CD40193 is a presettable synchronous 4-bit binary up/down counter. Unlike a single-clock counter with a direction pin, it has two separate clock inputs: pulse CLOCK UP to count up and CLOCK DOWN to count down, holding the unused clock HIGH. The count runs 0 through 15 and wraps. Four JAM inputs J1–J4 let you preload any value: take PRESET ENABLE LOW and the counter jumps to J1–J4 immediately, with no clock edge needed. A HIGH on RESET asynchronously clears the count to zero and overrides everything else. Two cascade outputs, CARRY and BORROW (both active LOW and normally HIGH), make it easy to chain digits: CARRY pulses LOW as the counter rolls 15→0 counting up, and BORROW pulses LOW as it rolls 0→15 counting down. Connect CARRY of one stage to the CLOCK UP of the next, and BORROW to its CLOCK DOWN, to build wider up/down counters. The BCD (decade) sibling is the CD40192.',
    guidePinDescriptions: {
      J2:          'Jam / preset input bit 2 (weight 2). Loaded into the counter when PRESET ENABLE is LOW.',
      Q2:          'Binary count output bit 2 (weight 2).',
      Q1:          'Binary count output bit 1 (LSB, weight 1).',
      CLK_DOWN:    'Clock Down input. Rising (positive-going) edges decrement the counter while CLOCK UP is held HIGH.',
      CLK_UP:      'Clock Up input. Rising (positive-going) edges increment the counter while CLOCK DOWN is held HIGH.',
      Q3:          'Binary count output bit 3 (weight 4).',
      Q4:          'Binary count output bit 4 (MSB, weight 8).',
      VSS:         'Negative supply / ground (0 V).',
      J4:          'Jam / preset input bit 4 (MSB, weight 8). Loaded when PRESET ENABLE is LOW.',
      J3:          'Jam / preset input bit 3 (weight 4). Loaded when PRESET ENABLE is LOW.',
      PE:          'Preset Enable, ACTIVE LOW and asynchronous. Take LOW to jam-load J1–J4 into the counter. Hold HIGH for normal counting.',
      CARRY:       'Carry output, ACTIVE LOW (normally HIGH). Pulses LOW when the counter is at 15 and CLOCK UP is LOW — the 15→0 roll-over while counting up. Drives the next stage\'s CLOCK UP.',
      BORROW:      'Borrow output, ACTIVE LOW (normally HIGH). Pulses LOW when the counter is at 0 and CLOCK DOWN is LOW — the 0→15 roll-under while counting down. Drives the next stage\'s CLOCK DOWN.',
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
      // Reuse COUNTER_UPDOWN_DC (the dual-clock 74x193 binary up/down model).
      // Its contract — inputs: [A,B,C,D, UP, DOWN, CLR, LOAD],
      //                outputs: [QA,QB,QC,QD, CO, BO] — maps to the CD40193 as:
      //   A..D    = J1..J4 (LSB..MSB jam inputs)
      //   UP      = CLK_UP, DOWN = CLK_DOWN (rising-edge count up / down)
      //   CLR     = RESET   (active HIGH, async clear — primitive clears on CLR=1,
      //             and CLR is tested first so RESET dominates PRESET, matching the
      //             datasheet)
      //   LOAD    = PE      (active LOW, async jam — primitive loads on LOAD=0)
      //   CO/BO   = CARRY/BORROW (both active LOW: LOW at count 15 with CLK_UP LOW /
      //             count 0 with CLK_DOWN LOW — the binary terminal counts).
      { type: 'COUNTER_UPDOWN_DC',
        inputs:  ['J1', 'J2', 'J3', 'J4', 'CLK_UP', 'CLK_DOWN', 'RESET', 'PE'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'CARRY', 'BORROW'] },
    ],
    guideSections: [
      {
        title: 'Dual-Clock Up/Down Counting',
        paragraphs: [
          'The CD40193 has two clock inputs instead of one clock plus a direction pin. To count up, feed your clock into CLOCK UP and hold CLOCK DOWN HIGH. To count down, feed the clock into CLOCK DOWN and hold CLOCK UP HIGH. The counter changes on the rising (positive-going) edge of whichever clock is active. Never pulse both clocks at once.',
          'It counts in binary: the value runs 0, 1, 2, … 15 and then wraps back to 0 (counting up) or from 0 back to 15 (counting down). The outputs Q1–Q4 are a standard 8-4-2-1 weighted code, so Q1 is the least-significant bit and Q4 the most-significant.',
        ],
        formulas: [
          'Count up   = CLOCK UP rising,  CLOCK DOWN held HIGH',
          'Count down = CLOCK DOWN rising,  CLOCK UP held HIGH',
          'Q1 = weight 1   Q2 = weight 2   Q3 = weight 4   Q4 = weight 8',
          'Modulus = 16 (binary): count runs 0…15 then wraps',
        ],
        note: '74Sim models the CD40193 as an ideal dual-clock binary up/down counter: rising-edge CLOCK UP / CLOCK DOWN, asynchronous active-LOW PRESET ENABLE jam-load and asynchronous active-HIGH RESET (RESET dominates), with active-LOW CARRY and BORROW. It shares the engine model used by the 74x193. As with all 74Sim sequential parts there is no propagation delay, so the brief carry/borrow output glitches of real silicon are not reproduced — the settled binary count and the steady carry/borrow levels are correct (see issues.md A1).',
      },
      {
        title: 'Preset, Reset and Cascading',
        paragraphs: [
          'To start from an arbitrary value, place it on J1 (LSB) … J4 (MSB) and take PRESET ENABLE LOW; the counter jumps to that value immediately, no clock edge required. This makes the CD40193 an easy programmable divide-by-N stage. Taking RESET HIGH forces the count to 0 at once and overrides the preset and the clocks.',
          'CARRY and BORROW are both active LOW and sit HIGH during normal counting. CARRY pulses LOW as the counter rolls over from 15 to 0 while counting up; BORROW pulses LOW as it rolls under from 0 to 15 while counting down. To build a wider counter, wire CARRY of the low stage to CLOCK UP of the next stage, and BORROW of the low stage to CLOCK DOWN of the next stage. Each roll-over then clocks the next stage in the right direction.',
        ],
        list: [
          'Multi-stage binary up/down counters.',
          'Programmable divide-by-N: jam a start value on J1–J4, then count.',
          'Up/down difference counting from two independent clock sources.',
        ],
      },
    ],
  },

};
