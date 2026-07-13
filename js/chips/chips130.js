// chips130.js — Block 130: CMOS 4000 series logic ICs (coverage expansion).
// CD40103 presettable synchronous 8-bit binary DOWN counter. Pinout + behavior
// verified by reading the TI datasheet "CD40102B, CD40103B Types — CMOS 8-Stage
// Presettable Synchronous Down Counters" (SCHS104B, Data sheet acquired from
// Harris Semiconductor, Revised July 2003) directly as 300-/600-dpi PDF page
// images (Read with pages:), NOT via the WebFetch text summarizer which mangles
// these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (row "40103") for the roadmap.
// Chips: CD40103
export const CHIPS_BLOCK_130 = {

  // ── CD40103: presettable synchronous 8-bit binary down counter (16-pin) ────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD40102B, CD40103B Types — CMOS 8-Stage Presettable
     Synchronous Down Counters", SCHS104B (Revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40103b.pdf
     Verified: terminal assignment read off the Fig. 12/Fig. 13 LOGIC DIAGRAMs
     (the pin numbers are boxed next to each signal — page 4 "Fig. 12 Logic
     diagram for CD40102B" and page 5 "Fig. 13 Logic diagram for CD40103B", both
     identical pinout) and the page-5 TRUTH TABLE, read as 300-/600-dpi rendered
     PDF page images. NOT cloned from a sibling (issues.md C2).
     CD40103B DIP-16 terminal assignment:
        1  CLOCK             16 VDD
        2  CLR  (clear, /MR) 15 SPE (sync preset en.)
        3  CI/CE (count en.) 14 CO/ZD (carry out / zero detect)
        4  J0  (LSB)         13 J7 (MSB)
        5  J1                12 J6
        6  J2                11 J5
        7  J3                10 J4
        8  VSS                9 APE (async preset en.)
     ALL control inputs (CLR, APE, SPE, CI/CE) and the CO/ZD output are ACTIVE
     LOW. JAM inputs J0..J7 are the 8-bit preset word, J0 = LSB, J7 = MSB.
     ⚠ The pre-existing 74x4103 (chips58.js) and 74x40103 (chips65.js) entries
     both carry a FABRICATED, incorrect pinout (PEn=1, P5=2, …, NC=15) that
     matches no real silicon — left untouched here, flagged in issues.md C13.

     TRUTH TABLE (SCHS104B, Fig. 13), priority high→low — 0=LOW, 1=HIGH, X=don't care:
        CLR APE SPE CI/CE | action
         1   1   1    1    | inhibit (hold)
         1   1   1    0    | count down (rising CLK); at 0 wraps to 255
         1   1   0    X    | synchronous preset (load JAM on next rising CLK)
         1   0   X    X    | asynchronous preset (load JAM immediately)
         0   X   X    X    | asynchronous clear to MAXIMUM count (255)
     CO/ZD goes LOW when the count is 0 AND CI/CE is LOW (so cascades chain). */
  'CD40103': {
    name: 'CD40103',
    simpleName: '8-bit Presettable Synchronous Down Counter',
    description: 'Presettable sync 8-bit binary down counter, sync/async preset (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40103b.pdf',
    tags: ['counter', 'binary', '8-bit', 'down', 'presettable', 'synchronous', 'cmos', '4000-series'],
    sequential: true,
    guideOverview: 'The CD40103 is an 8-bit binary down counter you can preset to any starting value. After loading a number, each rising clock edge subtracts one. When the count reaches zero the carry/zero-detect output (CO/ZD) goes LOW for one clock, which makes it easy to chain several chips for long delays or to divide a clock by a chosen number. It has two ways to load: synchronous preset (the value loads on the next clock edge) and asynchronous preset (the value loads immediately, no clock needed). A separate clear input forces the counter to its maximum value, 255.',
    guidePinDescriptions: {
      'CLOCK': 'Clock input. The counter acts on the rising (LOW-to-HIGH) edge.',
      'CLR': 'Clear (active LOW). Pull LOW to immediately set the count to its maximum, 255. Overrides every other input.',
      'CI/CE': 'Carry-in / count-enable (active LOW). Must be LOW for the counter to count down. Tie the CO/ZD of an earlier stage here to cascade.',
      'J0': 'Preset (jam) data bit 0, the LSB.',
      'J1': 'Preset (jam) data bit 1.',
      'J2': 'Preset (jam) data bit 2.',
      'J3': 'Preset (jam) data bit 3.',
      'J4': 'Preset (jam) data bit 4.',
      'J5': 'Preset (jam) data bit 5.',
      'J6': 'Preset (jam) data bit 6.',
      'J7': 'Preset (jam) data bit 7, the MSB.',
      'APE': 'Asynchronous preset enable (active LOW). Pull LOW to load the J0-J7 value immediately, without a clock edge.',
      'SPE': 'Synchronous preset enable (active LOW). Hold LOW and the J0-J7 value loads on the next rising clock edge.',
      'CO/ZD': 'Carry-out / zero-detect (active LOW). Goes LOW when the count is zero and CI/CE is LOW.',
      'VDD': 'Positive supply (3-18 V).',
      'VSS': 'Ground (0 V).',
    },
    guideSections: [
      {
        title: 'Presetting the counter',
        paragraphs: [
          'A down counter starts at a number you choose and steps toward zero. The CD40103 has two ways to set that number, both using the eight jam inputs J0-J7 (J0 is the least significant bit).',
          'Asynchronous preset (APE LOW) loads the jam value the instant you apply it, ignoring the clock. Synchronous preset (SPE LOW) waits for the next rising clock edge to load. Use synchronous loading when you need the load to line up with the rest of a clocked design.',
        ],
        list: [
          'CLR LOW always wins: it forces the count to 255 (the maximum), regardless of the other inputs.',
          'Priority is CLR, then APE, then SPE, then counting.',
        ],
      },
      {
        title: 'Counting and the carry output',
        paragraphs: [
          'With CLR, APE, and SPE all HIGH, the counter subtracts one on each rising clock edge as long as CI/CE is LOW. If CI/CE is HIGH, counting is inhibited and the count holds.',
          'CO/ZD (carry out / zero detect) goes LOW when the count reaches zero and CI/CE is LOW. The next clock edge wraps the count from 0 back to 255.',
        ],
        list: [
          'To build a wider counter, connect CO/ZD of one chip to the CI/CE of the next so the upper stage only counts when the lower stage hits zero.',
          'For a divide-by-N: preset N-1, feed CO/ZD back to SPE so the chip reloads each time it reaches zero.',
        ],
      },
    ],
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
    // BIN_DOWN_8BIT extended 14-input contract (see js/specificChipsSim.js):
    //   [CLK, PEn(=SPE sync preset), J0..J7, CEn(=CI/CE), spe-slot, APE, CLR].
    // The legacy 12th "spe" slot is a count-enable duplicate the real chip does
    // not have; in the extended (full) model it is ignored, so CI/CE is wired
    // there too. PEn carries the real synchronous preset enable (SPE, pin 15);
    // CEn carries CI/CE (pin 3); the new APE/CLR slots carry pins 9/2.
    gates: [
      { type: 'BIN_DOWN_8BIT',
        inputs: ['CLOCK','SPE','J0','J1','J2','J3','J4','J5','J6','J7','CI/CE','CI/CE','APE','CLR'],
        outputs: ['CO/ZD'] },
    ],
  },

};
