// chips131.js — CMOS 4000-series coverage expansion (Batch 8)
// CD40110: dual-clocked decade up/down counter with output latch, 7-segment
// decoder/driver, and CARRY/BORROW cascade outputs. Shipped in its own
// standalone block (CHIPS_BLOCK_131) to avoid collisions with the other
// concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_131 = {
  // ── CD40110: decade up/down counter + latch + 7-seg decoder/driver (16-pin) ──
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD40110B Types — CMOS Decade Up/Down Counter/Latch/Display
     Driver, High-Voltage Type (20-V Rating)", SCHS100.
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40110b.pdf
     Verified: terminal assignment (TOP VIEW) + Functional Diagram + the device
     TRUTH TABLE, read directly from the rendered PDF pages (pages 1, 3, 6) as
     300-dpi page images — NOT the WebFetch text summarizer (issues.md C4) and
     NOT cloned from the 74x143/144 COUNTER_7SEG sibling, which has a BCD bus
     (QA-QD), ENP/ENT enables, a single clock and an RCO@9 the CD40110 lacks
     (issues.md C2).
     CD40110B map (TOP VIEW): 1 a, 2 g, 3 f, 4 TOGGLE ENABLE, 5 RESET,
     6 LATCH ENABLE, 7 CLOCK DOWN, 8 VSS, 9 CLOCK UP, 10 CARRY, 11 BORROW,
     12 e, 13 d, 14 c, 15 b, 16 VDD.
     Behaviour from the TRUTH TABLE: CLOCK UP / CLOCK DOWN are separate
     positive-edge clocks (increment / decrement); RESET active-HIGH async →
     count 0; TOGGLE ENABLE column is the active-LOW count enable (pin HIGH
     inhibits); LATCH ENABLE LOW = display follows counter, HIGH = display held;
     CARRY/BORROW normally HIGH, pulse LOW briefly at the 9->0 / 0->9 rollovers
     (description, page 1). 7-seg outputs source up to 25 mA (common-cathode). */
  'CD40110': {
    name: 'CD40110',
    simpleName: 'Decade Up/Down Counter + 7-Seg + Latch',
    description: 'Dual-clock decade up/down counter, latch, 7-seg driver, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40110b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'decade', 'up down', 'up/down', 'latch', '7 segment', 'decoder', 'display driver', 'led driver', 'sequential'],
    guideOverview: 'The CD40110 is a decade (0-9) counter that can count both up and down, with a built-in 7-segment decoder and a display driver strong enough to light a common-cathode LED digit directly no external decoder chip needed. It has two separate clock inputs: a pulse on CLOCK UP adds one, a pulse on CLOCK DOWN subtracts one. An output latch sits between the counter and the display: with LATCH ENABLE low the display follows the count live; raise LATCH ENABLE and the display freezes on the current digit while the counter keeps running behind it. RESET (active high) clears the count to 0. The CARRY and BORROW outputs make multi-digit counters easy: they sit high and emit a short low pulse when the digit rolls 9->0 (CARRY) or 0->9 (BORROW), so you tie CARRY to the next chip\'s CLOCK UP and BORROW to its CLOCK DOWN to chain decades.',
    guidePinDescriptions: {
      'CLOCK UP': 'Count-up clock (pin 9). Each LOW-to-HIGH (positive) transition adds one to the count, unless TOGGLE ENABLE is HIGH or RESET is HIGH.',
      'CLOCK DOWN': 'Count-down clock (pin 7). Each LOW-to-HIGH transition subtracts one from the count. Counts 0 then wraps to 9.',
      'RESET': 'Reset input (pin 5). Active HIGH and asynchronous: a HIGH level clears the counter to 0 immediately, regardless of the clocks.',
      'TOGGLE ENABLE': 'Count enable (pin 4), active LOW. Hold LOW to allow counting; a HIGH level inhibits both clocks so the count holds. (The datasheet truth-table column is drawn over-barred to show this active-LOW sense.)',
      'LATCH ENABLE': 'Latch enable (pin 6). LOW = latch transparent, so the display follows the counter live. HIGH = latch holds, freezing the displayed digit while the counter keeps running underneath.',
      'a': 'Segment a output (pin 1). Active HIGH; drives the top bar of a common-cathode 7-segment display (sources up to 25 mA).',
      'b': 'Segment b output (pin 15). Active HIGH (top-right).',
      'c': 'Segment c output (pin 14). Active HIGH (bottom-right).',
      'd': 'Segment d output (pin 13). Active HIGH (bottom bar).',
      'e': 'Segment e output (pin 12). Active HIGH (bottom-left).',
      'f': 'Segment f output (pin 3). Active HIGH (top-left).',
      'g': 'Segment g output (pin 2). Active HIGH (middle bar).',
      'CARRY': 'Carry out (pin 10). Normally HIGH; emits a short LOW pulse when the count rolls over from 9 to 0 (counting up). Tie to the CLOCK UP of the next decade to cascade.',
      'BORROW': 'Borrow out (pin 11). Normally HIGH; emits a short LOW pulse when the count rolls under from 0 to 9 (counting down). Tie to the CLOCK DOWN of the next decade to cascade.',
      'GND': 'Ground (VSS, 0 V), pin 8. Connect to the negative supply rail.',
      'VDD': 'Positive supply (pin 16). Accepts 3 V to 18 V (20 V abs max).',
    },
    pinout: [
      { pin:  1, name: 'a',             type: 'output' },
      { pin:  2, name: 'g',             type: 'output' },
      { pin:  3, name: 'f',             type: 'output' },
      { pin:  4, name: 'TOGGLE ENABLE', type: 'input'  },
      { pin:  5, name: 'RESET',         type: 'input'  },
      { pin:  6, name: 'LATCH ENABLE',  type: 'input'  },
      { pin:  7, name: 'CLOCK DOWN',    type: 'input'  },
      { pin:  8, name: 'GND',           type: 'power'  },
      { pin:  9, name: 'CLOCK UP',      type: 'input'  },
      { pin: 10, name: 'CARRY',         type: 'output' },
      { pin: 11, name: 'BORROW',        type: 'output' },
      { pin: 12, name: 'e',             type: 'output' },
      { pin: 13, name: 'd',             type: 'output' },
      { pin: 14, name: 'c',             type: 'output' },
      { pin: 15, name: 'b',             type: 'output' },
      { pin: 16, name: 'VDD',           type: 'power'  },
    ],
    gates: [
      // COUNTER_7SEG_40110: dual-clocked decade up/down counter + output latch +
      // 7-seg decoder/driver + CARRY/BORROW. inputs
      // [CLK_UP, CLK_DOWN, LATCH_ENABLE, TOGGLE_ENABLE, RESET];
      // outputs [a,b,c,d,e,f,g, CARRY, BORROW]. CLOCK UP/DOWN are separate
      // positive-edge clocks (increment/decrement, mod-10); RESET active-HIGH
      // async; TOGGLE ENABLE HIGH inhibits; LATCH ENABLE LOW transparent /
      // HIGH holds; segments active-HIGH; CARRY/BORROW normally HIGH, pulse LOW
      // at the 9->0 / 0->9 rollovers (74x192-style cascade convention).
      { type: 'COUNTER_7SEG_40110',
        inputs: ['CLOCK UP', 'CLOCK DOWN', 'LATCH ENABLE', 'TOGGLE ENABLE', 'RESET'],
        outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'CARRY', 'BORROW'] },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Counting up and down',
        paragraphs: [
          'The CD40110 has two clock inputs instead of one. A positive (LOW-to-HIGH) edge on CLOCK UP adds one to the count; a positive edge on CLOCK DOWN subtracts one. The count is a single decade: counting up past 9 wraps to 0, counting down past 0 wraps to 9.',
          'TOGGLE ENABLE gates the counting. Held LOW, the chip counts normally. Driven HIGH, both clocks are ignored and the count holds its current value useful for pausing a counter without stopping the clock source. RESET is separate: a HIGH on RESET clears the count to 0 right away, no clock edge needed.',
        ],
        note: 'On real silicon the two clock edges must be separated by about 100 ns to count reliably. 74Sim has no propagation delay (every gate settles instantly), so that timing requirement is not enforced here only the final settled count is shown.',
      },
      {
        title: 'The display latch',
        paragraphs: [
          'Between the counter and the seven-segment outputs is a latch controlled by LATCH ENABLE. With LATCH ENABLE LOW the latch is transparent the display shows the live count as it changes. Raise LATCH ENABLE and the latch holds: the display freezes on whatever digit it was showing, while the counter underneath keeps responding to the clocks.',
          'This lets you sample and display a reading while continuing to count for example, snapshot a frequency measurement onto the display, then go back to counting the next gate interval. The segment outputs are active HIGH and drive a common-cathode display directly, sourcing up to 25 mA per segment.',
        ],
        list: [
          'LATCH ENABLE LOW: display follows the counter live (transparent).',
          'LATCH ENABLE HIGH: display holds; counter keeps running underneath.',
          'Segments a-g are active HIGH (common-cathode), standard 7-seg decode.',
        ],
      },
      {
        title: 'Cascading with CARRY and BORROW',
        paragraphs: [
          'To build a multi-digit up/down counter, use the CARRY and BORROW outputs. Both sit HIGH normally. CARRY emits a short LOW pulse when this digit rolls over from 9 to 0 while counting up; BORROW emits a short LOW pulse when it rolls under from 0 to 9 while counting down. The rising edge at the end of each pulse is what advances the next stage.',
          'Wire each digit\'s CARRY to the next more-significant digit\'s CLOCK UP, and its BORROW to that digit\'s CLOCK DOWN. The next decade then counts up or down in step, so the whole chain behaves like one larger up/down counter no external glue logic required.',
        ],
        formulas: [
          'Segment outputs a-g = standard 7-seg decode of the latched count (active HIGH)',
          'CARRY = LOW only at count 9 while CLOCK UP is LOW (else HIGH)',
          'BORROW = LOW only at count 0 while CLOCK DOWN is LOW (else HIGH)',
        ],
      },
    ],
  },
};
