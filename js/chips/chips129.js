// chips129.js — Block 129: CMOS 4000 series logic ICs (coverage expansion).
// CD40102 presettable 2-decade BCD synchronous down counter. Pinout + behavior
// verified by reading the TI/Harris datasheet directly as 300-dpi PDF page images
// (Read with pages:), NOT via a text-summarizer fetch which mangles these scans
// (see issues.md C4). NOTE: this part lives alone in its own block file to avoid
// edit collisions with the other concurrent chip-add agents in this same tree.
// See CMOS-4000-Coverage-Plan.md (row "40102") for the roadmap.
// Chips: CD40102
export const CHIPS_BLOCK_129 = {

  // ── CD40102: presettable 2-decade BCD synchronous down counter (16-pin) ────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD40102B, CD40103B Types — CMOS 8-Stage Presettable
     Synchronous Down Counters", SCHS095B (Revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40102b.pdf
     TERMINAL ASSIGNMENT (page 6 / sheet 3-381) read as a rendered PDF page image:
        1  CLOCK                       16 VDD
        2  CLEAR (CLR)                 15 SYNCHRONOUS PRESET ENABLE (SPE)
        3  CARRY IN/COUNTER ENABLE     14 CARRY OUT/ZERO DETECT (CO/ZD)
           (CI/CE)
        4  J0                          13 J7
        5  J1                          12 J6
        6  J2                          11 J5
        7  J3                          10 J4
        8  VSS                          9 ASYNCHRONOUS PRESET ENABLE (APE)
     JAM grouping (datasheet TRUTH TABLE note 4): CD40102B is BCD, with
        LSD (units) = J3 J2 J1 J0  (J3 MSB),  MSD (tens) = J7 J6 J5 J4  (J7 MSB).
     This is the REAL CD40102B assignment, verified against its OWN datasheet and
     NOT cloned from a sibling (issues.md C2). Data-quality note: the pre-existing
     `74x4102` (chips58.js) and `74x40102` (chips65.js) entries both use DIFFERENT,
     mutually-inconsistent pinouts and a 2-output TC/TCdec model that this part
     does not have — see issues.md for the discrepancy writeup.

     Behavior (page-1 functional description + page-5 TRUTH TABLE, read as PDF
     images): an 8-stage synchronous down counter, configured here as two cascaded
     4-bit BCD decades, with a SINGLE output CO/ZD that is active (LOW) when the
     internal count is zero. The count is decremented by one on each positive
     CLOCK edge; counting is enabled only while CI/CE is LOW. CO/ZD goes LOW when
     the count reaches zero AND CI/CE is LOW, and (because the count jumps back to
     the maximum on the next clock edge) stays LOW for exactly one clock period —
     this is what enables cascading by feeding CO/ZD into the next stage's CI/CE.
     Control-input precedence (TRUTH TABLE, page 5):
        CLR=0  → asynchronously clear to MAXIMUM count (99)   [dominates all]
        APE=0  → asynchronously jam-load J0..J7
        SPE=0  → synchronously jam-load J0..J7 on the next positive CLOCK edge
        else, CI/CE=0 → count down on the next positive CLOCK edge
     The engine hint `BCD_DOWN_2DEC` does NOT fit: that primitive models a
     fictional 2-output (TC + TCdec) device with only a synchronous preset and no
     CLR/APE. A faithful BCD_DOWN_2DEC_CD40102 primitive was added instead
     (see specificChipsSim.js). */
  'CD40102': {
    name: 'CD40102',
    simpleName: '2-Decade BCD Presettable Synchronous Down Counter',
    description: 'Presettable 2-decade BCD down counter, sync/async preset, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40102b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'bcd counter', 'down counter', 'presettable', 'synchronous', 'decade'],
    guideOverview: 'The CD40102 counts down in BCD across two decimal digits, so it covers 00 through 99. You load a starting value on the jam inputs J0–J7 (J0–J3 are the units digit, J4–J7 the tens digit), and from there it steps down one count on each rising clock edge. The single output, CARRY OUT/ZERO DETECT, goes LOW when the count reaches zero, and because the count then jumps back to 99 on the next clock, that LOW lasts exactly one clock period. You can load the counter two ways: SYNCHRONOUS PRESET ENABLE loads the jam inputs on the next rising clock edge, while ASYNCHRONOUS PRESET ENABLE loads them immediately, with no clock needed. CLEAR forces the counter to its maximum count (99) right away and overrides everything else. Counting only happens while CARRY IN/COUNTER ENABLE is held LOW. All four control inputs — CLEAR, the two preset enables, and CARRY IN/COUNTER ENABLE — are active LOW. Feeding one chip\'s CARRY OUT/ZERO DETECT into the next chip\'s CARRY IN/COUNTER ENABLE lets you cascade several into a longer down counter, which is how it is used for programmable timers and divide-by-N dividers.',
    guidePinDescriptions: {
      CLOCK: 'Clock input. The count steps down one on each rising edge, and synchronous loads happen here too.',
      CLR:   'Clear (active LOW). A LOW asynchronously forces the counter to its maximum count, 99. Overrides every other input. Hold HIGH for normal operation.',
      'CI/CE': 'Carry In / Counter Enable (active LOW). Counting is enabled only while this is LOW; a HIGH freezes the count. When cascading, drive this from a less-significant chip\'s CARRY OUT/ZERO DETECT.',
      J0: 'Jam (preset) input bit 0 — units digit, weight 1 (LSB of the units decade).',
      J1: 'Jam (preset) input bit 1 — units digit, weight 2.',
      J2: 'Jam (preset) input bit 2 — units digit, weight 4.',
      J3: 'Jam (preset) input bit 3 — units digit, weight 8 (MSB of the units decade).',
      VSS: 'Negative supply / ground (0 V).',
      APE: 'Asynchronous Preset Enable (active LOW). A LOW immediately loads J0–J7 into the counter, with no clock edge required. Overrides the synchronous load. Hold HIGH for normal operation.',
      J4: 'Jam (preset) input bit 4 — tens digit, weight 1 (LSB of the tens decade).',
      J5: 'Jam (preset) input bit 5 — tens digit, weight 2.',
      J6: 'Jam (preset) input bit 6 — tens digit, weight 4.',
      J7: 'Jam (preset) input bit 7 — tens digit, weight 8 (MSB of the tens decade).',
      'CO/ZD': 'Carry Out / Zero Detect (active LOW). Goes LOW when the count reaches zero while CARRY IN/COUNTER ENABLE is LOW, and stays LOW for one clock period. Feed this into the next stage\'s CARRY IN/COUNTER ENABLE to cascade.',
      SPE: 'Synchronous Preset Enable (active LOW). Hold LOW and the jam inputs J0–J7 are loaded on the next rising clock edge.',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'CLOCK', type: 'input'  },
      { pin:  2, name: 'CLR',   type: 'input'  },
      { pin:  3, name: 'CI/CE', type: 'input'  },
      { pin:  4, name: 'J0',    type: 'input'  },
      { pin:  5, name: 'J1',    type: 'input'  },
      { pin:  6, name: 'J2',    type: 'input'  },
      { pin:  7, name: 'J3',    type: 'input'  },
      { pin:  8, name: 'VSS',   type: 'power'  },
      { pin:  9, name: 'APE',   type: 'input'  },
      { pin: 10, name: 'J4',    type: 'input'  },
      { pin: 11, name: 'J5',    type: 'input'  },
      { pin: 12, name: 'J6',    type: 'input'  },
      { pin: 13, name: 'J7',    type: 'input'  },
      { pin: 14, name: 'CO/ZD', type: 'output' },
      { pin: 15, name: 'SPE',   type: 'input'  },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    gates: [
      // BCD_DOWN_2DEC_CD40102 input order:
      //   [CLK, CLR, CICE, APE, SPE, J0, J1, J2, J3, J4, J5, J6, J7]
      // output:  [COZD]   (J0/J3 = units LSB/MSB, J4/J7 = tens LSB/MSB).
      { type: 'BCD_DOWN_2DEC_CD40102',
        inputs:  ['CLOCK', 'CLR', 'CI/CE', 'APE', 'SPE',
                  'J0', 'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'],
        outputs: ['CO/ZD'] },
    ],
    guideSections: [
      {
        title: '2-Decade BCD Down Counting',
        paragraphs: [
          'BCD means each decimal digit is stored as its own 4-bit binary number. The CD40102 holds two of these digits — a units digit and a tens digit — so it counts down through the decimal numbers 99, 98, 97, all the way to 00, instead of running through a plain 0–255 binary sequence. That makes it a natural fit for clocks, timers, and anything that drives decimal displays.',
          'Each rising clock edge takes the count down by one, but only while CARRY IN/COUNTER ENABLE is held LOW. When the units digit passes zero it wraps from 0 back to 9 and borrows one from the tens digit, exactly like decimal subtraction.',
          'When the whole count reaches 00, the CARRY OUT/ZERO DETECT output goes LOW. On the very next clock the counter jumps back up to its maximum, 99, so that LOW pulse is one clock period wide.',
        ],
        formulas: [
          'Counting edge = CLOCK rising AND CARRY IN/COUNTER ENABLE = 0 AND CLEAR = 1 AND both preset enables = 1',
          'Units = J3 J2 J1 J0 (weights 8 4 2 1)   Tens = J7 J6 J5 J4 (weights 8 4 2 1)',
          'Counts DOWN: …→02→01→00→99→98… (two BCD decades, modulus 100)',
          'CARRY OUT/ZERO DETECT = LOW when count = 00 AND CARRY IN/COUNTER ENABLE = 0',
        ],
        list: [
          'Programmable timers and interrupt timers.',
          'Divide-by-N dividers and cycle/program counters.',
          'Cascade for more digits: feed CARRY OUT/ZERO DETECT into the next chip\'s CARRY IN/COUNTER ENABLE.',
        ],
        note: '74Sim models the CD40102 as an ideal 2-decade BCD down counter: positive-edge clock gated by active-LOW CARRY IN/COUNTER ENABLE, with active-LOW synchronous preset (loads on the clock edge), active-LOW asynchronous preset (loads immediately), and active-LOW clear that forces the maximum count (99) and dominates every other input. Jam values outside 0–9 on a decade are clamped to 9 to keep the count valid BCD. As with all 74Sim sequential parts there is no propagation delay, so the settled count is correct but the brief switching transients of real silicon are not reproduced (see issues.md A1).',
      },
      {
        title: 'Loading and Clearing',
        paragraphs: [
          'There are three ways to force a value into the counter, and they take priority in this order. CLEAR (active LOW) wins over everything: a LOW on it immediately sets the count to its maximum, 99. Next is ASYNCHRONOUS PRESET ENABLE (active LOW), which loads whatever is on the jam inputs J0–J7 right away, without waiting for a clock. Last is SYNCHRONOUS PRESET ENABLE (active LOW), which loads the jam inputs on the next rising clock edge.',
          'For normal counting, hold CLEAR, both preset enables HIGH, and CARRY IN/COUNTER ENABLE LOW. To build a divide-by-N counter, preset the value N, let it count down to zero, and use the CARRY OUT/ZERO DETECT pulse to reload N (through a preset enable) so the cycle repeats — one output pulse for every N clocks.',
        ],
      },
    ],
  },

};
