// chips95.js — CMOS 4000-series coverage expansion (Batch 8)
// CD4033: decade counter + decoded 7-segment driver with RIPPLE BLANKING
// (leading-zero suppression) and LAMP TEST. Shipped in its own standalone block
// (CHIPS_BLOCK_95) to avoid collisions with the other concurrent chip-add agents
// sharing this working directory.

export const CHIPS_BLOCK_95 = {
  // ── CD4033: decade counter / 7-seg decoder, ripple blanking + lamp test (16-pin) ─
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4026B, CD4033B Types — CMOS Decade Counters/Dividers
     with Decoded 7-Segment Display Outputs", SCHS031B (revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4033b.pdf
     Pinout verified against the CD4033B Terminal Diagram (TOP VIEW) read directly
     from the rendered PDF page — NOT cloned from the 74x143/74x144 (which bring a
     BCD bus + STROBE latch + ENP/ENT enables out and have no ripple-blanking) and
     NOT cloned from the CD4026 sibling (which has DISPLAY ENABLE IN/OUT + ungated
     "C" on pins 3/4/14 where the CD4033 has RBI/RBO/LAMP TEST). See issues.md C2.
     CD4033B map: 1 CLOCK, 2 CLOCK INHIBIT, 3 RIPPLE-BLANKING IN, 4 RIPPLE-BLANKING
     OUT, 5 CARRY OUT, 6 f, 7 g, 8 VSS, 9 d, 10 a, 11 e, 12 b, 13 c, 14 LAMP TEST,
     15 RESET, 16 VDD. Behaviour (incl. CARRY/10 HIGH for counts 0-4) confirmed
     against Fig. 4 (CD4033B timing diagram) and the device description text. */
  'CD4033': {
    name: 'CD4033',
    simpleName: 'Decade Counter + 7-Seg (Ripple Blank)',
    description: 'Decade counter/divider, 7-seg, ripple blanking + lamp test, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4033b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'decade', 'divider', '7 segment', 'decoder', 'display driver', 'ripple blanking', 'lamp test', 'sequential'],
    guideOverview: 'The CD4033 is a 5-stage Johnson decade counter with a built-in BCD-to-7-segment decoder/driver. It counts 0-9 and drives the seven segment outputs (a-g, active HIGH for common-cathode displays) directly no external decoder needed. The counter advances one count on each positive CLOCK edge while CLOCK INHIBIT is LOW; RESET (active HIGH) clears it to zero. A CARRY OUT (CLOCK divided by 10) lets you cascade decades. Its distinctive feature versus the CD4026 sibling is RIPPLE BLANKING: tie the most-significant digit\'s RBI LOW and chain each RBO to the next stage\'s RBI to automatically blank leading zeros in a multi-digit display (e.g. show "50.07" instead of "0050.0700"). A LAMP TEST input lights every segment to check the display.',
    guidePinDescriptions: {
      'CLOCK': 'Clock input (pin 1). The decade counter advances one count on each LOW-to-HIGH (positive) transition while CLOCK INHIBIT is LOW. Schmitt-triggered.',
      'CLOCK INHIBIT': 'Clock inhibit (pin 2). When HIGH the CLOCK input is ignored and the count is frozen. Counter advancement happens on the positive CLOCK edge only while this pin is LOW.',
      'RBI': 'Ripple-Blanking Input (pin 3). Active LOW. When LOW and the displayed digit is 0, the segment outputs are blanked (leading-zero suppression). Tie HIGH on a stage that should always display its zero.',
      'RBO': 'Ripple-Blanking Output (pin 4). Goes LOW when this digit is a blanked leading zero (RBI LOW and count 0), otherwise HIGH. Connect to the RBI of the next less-significant digit to extend zero-suppression down the display.',
      'CARRY OUT': 'Carry out (pin 5), CLOCK divided by 10. HIGH for counts 0-4 and LOW for counts 5-9, so it completes one cycle every ten clocks; its rising edge at the 9->0 rollover clocks the next decade in a counting chain.',
      'a': 'Segment a output (pin 10). Active HIGH; drives the top bar of a common-cathode 7-segment display.',
      'b': 'Segment b output (pin 12). Active HIGH (top-right).',
      'c': 'Segment c output (pin 13). Active HIGH (bottom-right).',
      'd': 'Segment d output (pin 9). Active HIGH (bottom bar).',
      'e': 'Segment e output (pin 11). Active HIGH (bottom-left).',
      'f': 'Segment f output (pin 6). Active HIGH (top-left).',
      'g': 'Segment g output (pin 7). Active HIGH (middle bar).',
      'LAMP TEST': 'Lamp test input (pin 14). When HIGH, overrides the decoder and turns all seven segments ON (display "8") to check the display; normal when LOW.',
      'RESET': 'Reset input (pin 15). Active HIGH and asynchronous; a HIGH level clears the counter to zero count immediately.',
      'GND': 'Ground (VSS, 0 V), pin 8. Connect to the negative supply rail.',
      'VDD': 'Positive supply (pin 16). Accepts 3 V to 18 V (20 V abs max).',
    },
    pinout: [
      { pin:  1, name: 'CLOCK',         type: 'input'  },
      { pin:  2, name: 'CLOCK INHIBIT', type: 'input'  },
      { pin:  3, name: 'RBI',           type: 'input'  },
      { pin:  4, name: 'RBO',           type: 'output' },
      { pin:  5, name: 'CARRY OUT',     type: 'output' },
      { pin:  6, name: 'f',             type: 'output' },
      { pin:  7, name: 'g',             type: 'output' },
      { pin:  8, name: 'GND',           type: 'power'  },
      { pin:  9, name: 'd',             type: 'output' },
      { pin: 10, name: 'a',             type: 'output' },
      { pin: 11, name: 'e',             type: 'output' },
      { pin: 12, name: 'b',             type: 'output' },
      { pin: 13, name: 'c',             type: 'output' },
      { pin: 14, name: 'LAMP TEST',     type: 'input'  },
      { pin: 15, name: 'RESET',         type: 'input'  },
      { pin: 16, name: 'VDD',           type: 'power'  },
    ],
    gates: [
      // COUNTER_7SEG_RB: decade counter + 7-seg decoder with ripple blanking +
      // lamp test. inputs [CLK, CLOCK INHIBIT, RESET, RBI, LAMP TEST];
      // outputs [a,b,c,d,e,f,g, CARRY, RBO]. Rising-edge clock gated by active-HIGH
      // CLOCK INHIBIT, active-HIGH async RESET, CARRY HIGH for counts 0-4, active-HIGH
      // segments, LAMP TEST forces all segments on, RBI/RBO leading-zero suppression.
      { type: 'COUNTER_7SEG_RB',
        inputs: ['CLOCK', 'CLOCK INHIBIT', 'RESET', 'RBI', 'LAMP TEST'],
        outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'CARRY OUT', 'RBO'] },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Counting and Cascading',
        paragraphs: [
          'The internal 5-stage Johnson counter counts 0 through 9 and rolls over to 0 on the tenth clock. Each count is decoded on the fly into the seven segment-driver outputs, so the display always shows the current digit no latch or strobe is involved (unlike the 74x143/144 counter-latch-driver parts).',
          'Counting happens on the positive (LOW-to-HIGH) edge of CLOCK while CLOCK INHIBIT is LOW. Holding CLOCK INHIBIT HIGH freezes the count. RESET is asynchronous and active HIGH: a HIGH level clears the counter to 0 regardless of the clock.',
          'To build a multi-digit counter, connect each stage\'s CARRY OUT to the next stage\'s CLOCK. CARRY OUT is CLOCK divided by ten (HIGH for counts 0-4, LOW for 5-9), so it produces one rising edge per ten input clocks exactly when this digit rolls from 9 back to 0.',
        ],
        note: 'CLOCK INHIBIT can alternately serve as a negative-edge clock input (clock the digit on its HIGH-to-LOW edge while CLOCK is held HIGH); 74Sim models the common case rising CLOCK edge with CLOCK INHIBIT LOW.',
      },
      {
        title: 'Ripple Blanking (Leading-Zero Suppression)',
        paragraphs: [
          'Ripple blanking turns off the segments of unwanted leading zeros so a number reads naturally. On the most-significant digit, tie RBI LOW. If that digit is 0 it blanks itself and drives RBO LOW; wire that RBO to the next digit\'s RBI. The blanking ripples down the chain until a non-zero digit appears that digit displays normally and drives its RBO HIGH, so every digit to its right shows its zeros.',
          'A digit whose RBI is HIGH always shows its value, including 0 use this to keep the zero just before a decimal point (e.g. the "0" in "0.5"). Lamp test, when HIGH, overrides the decoder and lights all seven segments to verify the display.',
        ],
        list: [
          'Blank rule: segments OFF when count = 0 AND RBI = LOW (and LAMP TEST LOW).',
          'RBO = LOW only when this digit is a blanked leading zero; otherwise HIGH.',
          'LAMP TEST HIGH lights all seven segments (display "8").',
          'Multi-decade counter/display: chain CARRY OUT -> CLOCK and RBO -> RBI.',
        ],
        formulas: [
          'Segment outputs a-g = standard 7-seg decode of the count (active HIGH)',
          'CARRY OUT = HIGH for counts 0-4, LOW for counts 5-9 (CLOCK / 10)',
          'Blank = (count == 0) AND (RBI == LOW) AND (LAMP TEST == LOW)',
        ],
      },
    ],
  },
};
