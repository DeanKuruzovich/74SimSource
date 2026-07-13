// Chip definitions block 40
// Chips: 74802 74803, 74804 74805, 74807 74808, 74810 74811,
//        74817 74819, 74821 74825

export const CHIPS_BLOCK_40 = {

  // ── 74802: Triple 4-input OR/NOR line drivers (20-pin) ───────────────────
  //
  // Brought to life: three independent 4-input sections. Each section n drives a
  // true OR output nY = An+Bn+Cn+Dn and a complementary NOR output
  // nZ = ~(An+Bn+Cn+Dn). The part's analog selling points (true/complement skew
  // < 0.5 ns, 48 mA drive, clock-generator/line-driver use) have no effect on
  // digital logic, so each section is modelled with the engine's built-in
  // 4-input OR + NOR gate types — no new primitive in specificChipsSim.js.
  //
  // PINOUT CORRECTED (issues.md C2 lesson). The original stub used a clean
  // sequential A0..D0,Y0n,Y0,A1.. map that does NOT match the silicon. The real
  // TI map interleaves the three sections and is identical to the verified
  // 74x800 sibling (its AND/NAND counterpart): 1A=1, 2A=2, 2B=3, 2C=4, 2D=5,
  // 3A=6, 3B=7, 3C=8, 3D=9, GND=10, 3Z=11, 3Y=12, 2Y=13, 2Z=14, 1Z=15, 1Y=16,
  // 1B=17, 1C=18, 1D=19, VCC=20. Signal names also corrected to the datasheet's
  // section-numbered form (nY = OR/true, nZ = NOR/complement).
  //
  // Source: Texas Instruments, "Types SN54AS802, SN74AS802 — Triple 4-Input
  //   OR/NOR Line Drivers," doc. D2662, in The TTL Data Book, Vol. 3, p. 2-509
  //   (Dec. 1982, rev. Dec. 1983). [Online]. Available:
  //   https://www.bitsavers.org/components/ti/_dataBooks/1984_TI_The_TTL_Data_Book_Vol_3.pdf
  //   Verified: N-package terminal assignment (TOP VIEW) + logic symbol +
  //   positive-logic equations Y=A+B+C+D, Z=~(A+B+C+D), read from the data-book
  //   page as extracted text (PDF p. 2-509). TI's own per-part sn74as802b.pdf /
  //   /product/SN74AS802B both 404 (part purged); this 1984 data book is the
  //   primary source. Function/pin-count cross-checked against Wikipedia,
  //   "List of 7400-series integrated circuits," 74x802 row (3 gates, 20 pins).
  '74x802': {
    name: '74x802',
    simpleName: 'Triple 4 Input OR/NOR Driver',
    description: 'Triple 4 input OR/NOR line drivers (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.bitsavers.org/components/ti/_dataBooks/1984_TI_The_TTL_Data_Book_Vol_3.pdf',
    tags: ['OR', 'NOR', 'gate', 'driver', 'quad-input'],
    guideOverview: 'The 74x802 contains three 4 input logic sections, each providing both an OR output (nY) and its NOR complement (nZ). Having both polarities on the chip lets you route either an active HIGH or an active LOW form of the same signal without adding inverters, which is handy in decoders, code converters, and complementary line drivers.',
    guidePinDescriptions: {
      '1A':  'Input A for section 1.',
      '1B':  'Input B for section 1.',
      '1C':  'Input C for section 1.',
      '1D':  'Input D for section 1.',
      '1Y':  'OR output for section 1 (HIGH if any of 1A-1D is HIGH).',
      '1Z':  'NOR output for section 1 (complement of 1Y).',
      '2A':  'Input A for section 2.',
      '2B':  'Input B for section 2.',
      '2C':  'Input C for section 2.',
      '2D':  'Input D for section 2.',
      '2Y':  'OR output for section 2.',
      '2Z':  'NOR output for section 2 (complement of 2Y).',
      '3A':  'Input A for section 3.',
      '3B':  'Input B for section 3.',
      '3C':  'Input C for section 3.',
      '3D':  'Input D for section 3.',
      '3Y':  'OR output for section 3.',
      '3Z':  'NOR output for section 3 (complement of 3Y).',
      'GND': 'Ground reference (pin 10).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'OR and NOR from one section',
        formulas: [
          'nY = A + B + C + D',
          'nZ = ~(A + B + C + D)',
        ],
        paragraphs: [
          'Each section drives both polarities from the same internal logic, so nZ is always the exact inverse of nY. The two outputs are designed to switch within half a nanosecond of each other, which is why the part is sold as a line driver for differential and complementary-clock signals.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '2A',  type: 'input'  },
      { pin:  3, name: '2B',  type: 'input'  },
      { pin:  4, name: '2C',  type: 'input'  },
      { pin:  5, name: '2D',  type: 'input'  },
      { pin:  6, name: '3A',  type: 'input'  },
      { pin:  7, name: '3B',  type: 'input'  },
      { pin:  8, name: '3C',  type: 'input'  },
      { pin:  9, name: '3D',  type: 'input'  },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: '3Z',  type: 'output' },
      { pin: 12, name: '3Y',  type: 'output' },
      { pin: 13, name: '2Y',  type: 'output' },
      { pin: 14, name: '2Z',  type: 'output' },
      { pin: 15, name: '1Z',  type: 'output' },
      { pin: 16, name: '1Y',  type: 'output' },
      { pin: 17, name: '1B',  type: 'input'  },
      { pin: 18, name: '1C',  type: 'input'  },
      { pin: 19, name: '1D',  type: 'input'  },
      { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'OR',  inputs: ['1A','1B','1C','1D'], output: '1Y' },
      { type: 'NOR', inputs: ['1A','1B','1C','1D'], output: '1Z' },
      { type: 'OR',  inputs: ['2A','2B','2C','2D'], output: '2Y' },
      { type: 'NOR', inputs: ['2A','2B','2C','2D'], output: '2Z' },
      { type: 'OR',  inputs: ['3A','3B','3C','3D'], output: '3Y' },
      { type: 'NOR', inputs: ['3A','3B','3C','3D'], output: '3Z' },
    ],
  },


  // ── 74803: listed as "Quad D flip flop" (14-pin) — LEFT AS STUB ──────────
  //
  // No datasheet exists for a 74x803, from any manufacturer. The "803" slot is a
  // genuine gap in TI's Advanced Schottky 800 line-driver family: the family runs
  // 800, 802, 804/804A, 805/805A, 808, 810, 811, ... with no 801 and no 803.
  // This was confirmed two ways before giving up:
  //   1. The primary source below (TI's own 1984 data book that documents the
  //      AS800 family) was downloaded and its full text searched — "803" appears
  //      nowhere in it; the family index jumps 800 → 802 → 804 → 805.
  //   2. Cross-manufacturer web searches (Jun 2026) for 74803 / 74AS803 /
  //      74ALS803 / 74F803 / 74HC803 return no part and no datasheet.
  // The stub's "quad D flip flop with common clock + async clear" function was
  // hand-entered on speculation; it is also out of place, since every other
  // number in this block is a gate or line driver, not a flip-flop. A real quad
  // D flip-flop would be trivial to simulate (the engine already has D-FF
  // primitives), so the blocker is NOT modelability — it is that with no
  // datasheet the pinout and behaviour cannot be verified to this project's
  // standard (every pin number + behavioural claim traceable to a citation,
  // never cloned from a sibling — issues.md C2). Rather than simulate against an
  // unverifiable, probably-fictional pinout, the entry is kept as GENERIC_STUB
  // and tagged 'stub' (hidden from the picker). See issues.md, "74x803" entry.
  //
  // Sources consulted (neither documents a 74803):
  // Source: Texas Instruments, "The TTL Data Book, Volume 3", (1984), AS800
  //   line-driver family, types index pp. 2-505..2-521. [Online]. Available:
  //   https://www.bitsavers.org/components/ti/_dataBooks/1984_TI_The_TTL_Data_Book_Vol_3.pdf
  //   Verified: downloaded the PDF, extracted full text (pdftotext), searched the
  //   types index and body for "803" — absent; family is 800, 802, 804/804A,
  //   805/805A (issues.md C4: read the file, don't trust a summary).
  // Source: web search (Jun 2026) for 74803 / 74AS803 / 74ALS803 / 74F803 /
  //   74HC803 across TI, Wikipedia's 7400-series list, and datasheet aggregators
  //   — no manufacturer documents a 74803.
  '74x803': {
    name: '74x803',
    simpleName: 'Quad D Flip Flop',
    description: 'Quad D type flip flops with common clock and asynchronous clear (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: null,
    tags: ['flip flop', 'D type', 'quad', 'stub'],
    sequential: true,
    guideOverview: 'The 74x803 contains four independent D type flip flops sharing a common clock (CLK) and asynchronous clear (CLRn). On each rising clock edge, each D input is sampled and its value transferred to the corresponding Q output. CLRn immediately resets all four Q outputs to LOW regardless of the clock state.',
    guidePinDescriptions: {
      'CLRn': 'Asynchronous clear (active LOW). Drives all Q outputs LOW immediately.',
      'D0':   'Data input for flip flop 0.',
      'Q0':   'Output of flip flop 0.',
      'D1':   'Data input for flip flop 1.',
      'Q1':   'Output of flip flop 1.',
      'D2':   'Data input for flip flop 2.',
      'GND':  'Ground reference (pin 7).',
      'Q2':   'Output of flip flop 2.',
      'CLK':  'Common clock input (rising edge triggered).',
      'Q3':   'Output of flip flop 3.',
      'D3':   'Data input for flip flop 3.',
      'NC1':  'No connect.',
      'NC2':  'No connect.',
      'VCC':  'Positive supply (+5 V, pin 14).',
    },
    guideSections: [
      {
        title: 'Common Clock Quad D FF',
        paragraphs: [
          'All four flip flops share a single CLK and CLRn to minimize pin count. Common clock operation ensures all four outputs update on the same edge, making this useful for capturing 4 bit nibble data or controlling four independent state outputs synchronously.',
        ],
        note: 'Functional behavior is represented as a generic stub in simulation.',
      },
    ],
    pinout: [
      { pin:  1, name: 'CLRn', type: 'input'  },
      { pin:  2, name: 'D0',   type: 'input'  },
      { pin:  3, name: 'Q0',   type: 'output' },
      { pin:  4, name: 'D1',   type: 'input'  },
      { pin:  5, name: 'Q1',   type: 'output' },
      { pin:  6, name: 'D2',   type: 'input'  },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: 'Q2',   type: 'output' },
      { pin:  9, name: 'CLK',  type: 'input'  },
      { pin: 10, name: 'Q3',   type: 'output' },
      { pin: 11, name: 'D3',   type: 'input'  },
      { pin: 12, name: 'NC1',  type: 'nc'     },
      { pin: 13, name: 'NC2',  type: 'nc'     },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CLRn','CLK','D0','D1','D2','D3'], outputs: ['Q0','Q1','Q2','Q3'] },
    ],
  },

  // ── 74804: Hex 2 input NAND drivers (20-pin) ─────────────────────────────
  // Source: Texas Instruments, "SN54ALS804A, SN54AS804B, SN74ALS804A,
  //   SN74AS804B Hex 2-Input NAND Drivers", SDAS022C (Dec 1982, rev Jan 1995).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als804a.pdf.
  //   Verified: terminal assignment (DW/N package top view) + function table,
  //   page 1, read as rendered PDF page images (issues.md C4).
  // Pinout corrected from the original stub: the right-hand side had A/B swapped
  // (stub put B before A on pins 12/13, 15/16, 18/19). Datasheet order per gate
  // is Y,A,B on pins 11-13, 14-16, 17-19. NAND inputs are symmetric so the swap
  // was behavior-neutral, but the labels are now datasheet-correct (issues.md C2
  // — verify, don't clone). Function table: Y = NAND(A,B) — Y is LOW only when
  // both inputs are HIGH; any LOW input gives Y = HIGH.
  '74x804': {
    name: '74x804',
    simpleName: 'Hex 2 Input NAND Driver',
    description: 'Hex 2 input NAND drivers (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als804a.pdf',
    tags: ['NAND', 'gate', 'driver', 'hex'],
    guideOverview: 'The 74x804 is a hex 2 input NAND driver: six independent 2 input NAND gates in one 20-pin package. Each gate computes Y = !(A and B). The "driver" part means the outputs can source and sink more current than an ordinary gate, so one output can feed a heavier load. NAND is a universal gate — any combinational logic can be built from NANDs alone.',
    guidePinDescriptions: {
      '1A':  'Input A of gate 1.',
      '1B':  'Input B of gate 1.',
      '1Y':  'NAND output of gate 1.',
      '2A':  'Input A of gate 2.',
      '2B':  'Input B of gate 2.',
      '2Y':  'NAND output of gate 2.',
      '3A':  'Input A of gate 3.',
      '3B':  'Input B of gate 3.',
      '3Y':  'NAND output of gate 3.',
      'GND': 'Ground reference (pin 10).',
      '4Y':  'NAND output of gate 4.',
      '4A':  'Input A of gate 4.',
      '4B':  'Input B of gate 4.',
      '5Y':  'NAND output of gate 5.',
      '5A':  'Input A of gate 5.',
      '5B':  'Input B of gate 5.',
      '6Y':  'NAND output of gate 6.',
      '6A':  'Input A of gate 6.',
      '6B':  'Input B of gate 6.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Logic Function',
        paragraphs: [
          'Each of the six gates computes a 2 input NAND: Y = !(A · B). The output is LOW only when both inputs are HIGH; every other input combination gives a HIGH output.',
        ],
        formulas: [
          'A=0, B=0 -> Y=1',
          'A=0, B=1 -> Y=1',
          'A=1, B=0 -> Y=1',
          'A=1, B=1 -> Y=0',
        ],
      },
      {
        title: 'Why a Driver',
        paragraphs: [
          'A driver version of a gate is built to handle more output current than the minimal logic stage. That makes the 74x804 a good fit when one gate has to drive several inputs at once or a heavier load on a bus.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1Y',  type: 'output' },
      { pin:  4, name: '2A',  type: 'input'  },
      { pin:  5, name: '2B',  type: 'input'  },
      { pin:  6, name: '2Y',  type: 'output' },
      { pin:  7, name: '3A',  type: 'input'  },
      { pin:  8, name: '3B',  type: 'input'  },
      { pin:  9, name: '3Y',  type: 'output' },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input'  },
      { pin: 13, name: '4B',  type: 'input'  },
      { pin: 14, name: '5Y',  type: 'output' },
      { pin: 15, name: '5A',  type: 'input'  },
      { pin: 16, name: '5B',  type: 'input'  },
      { pin: 17, name: '6Y',  type: 'output' },
      { pin: 18, name: '6A',  type: 'input'  },
      { pin: 19, name: '6B',  type: 'input'  },
      { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A','1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A','2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A','3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A','4B'], output: '4Y' },
      { type: 'NAND', inputs: ['5A','5B'], output: '5Y' },
      { type: 'NAND', inputs: ['6A','6B'], output: '6Y' },
    ],
  },

  // ── 74805: Hex 2 input NOR drivers (20-pin) ──────────────────────────────
  // Source: Texas Instruments, "SN54ALS805A, SN54AS805B, SN74ALS805A, SN74AS805B
  //   Hex 2-Input NOR Drivers", SDAS023C (Dec. 1982, rev. Jan. 1995). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn54as805b.pdf. Verified:
  //   terminal assignment (DW/N TOP VIEW) + logic diagram (positive logic) +
  //   FUNCTION TABLE, page 1, read as rendered PDF page images. Six independent
  //   2-input NOR drivers, Y = NOT(A OR B); the "drivers" name is high
  //   capacitive-drive output buffering (analog drive strength — not modeled here;
  //   logically identical to a hex 2-input NOR). Pin map: 1A=1 1B=2 1Y=3 2A=4 2B=5
  //   2Y=6 3A=7 3B=8 3Y=9 GND=10 4Y=11 4A=12 4B=13 5Y=14 5A=15 5B=16 6Y=17 6A=18
  //   6B=19 VCC=20. NOTE: the hand-entered stub had A/B swapped on drivers 4-6
  //   (pin 12 was "B3", 13 "A3", etc.); corrected to datasheet labels here. The
  //   ALS805A symlink (sn74als805a.pdf) now redirects to a TI selection page, so
  //   the still-served SN54AS805B symlink of the same SDAS023C document is cited.
  '74x805': {
    name: '74x805',
    simpleName: 'Hex 2 Input NOR Driver',
    description: 'Hex 2 input NOR drivers (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn54as805b.pdf',
    tags: ['NOR', 'gate', 'driver', 'hex'],
    guideOverview: 'The 74x805 is the NOR gate counterpart to the 74x804, providing six 2 input NOR drivers. NOR is also universal logic and is common in active LOW control networks where OR then invert behavior appears naturally.',
    guidePinDescriptions: {
      '1A':  'Input A for driver 1.',
      '1B':  'Input B for driver 1.',
      '1Y':  'NOR output for driver 1.',
      '2A':  'Input A for driver 2.',
      '2B':  'Input B for driver 2.',
      '2Y':  'NOR output for driver 2.',
      '3A':  'Input A for driver 3.',
      '3B':  'Input B for driver 3.',
      '3Y':  'NOR output for driver 3.',
      'GND': 'Ground reference (pin 10).',
      '4Y':  'NOR output for driver 4.',
      '4A':  'Input A for driver 4.',
      '4B':  'Input B for driver 4.',
      '5Y':  'NOR output for driver 5.',
      '5A':  'Input A for driver 5.',
      '5B':  'Input B for driver 5.',
      '6Y':  'NOR output for driver 6.',
      '6A':  'Input A for driver 6.',
      '6B':  'Input B for driver 6.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Hex NOR Driver',
        paragraphs: [
          'NOR heavy logic is common in asynchronous control and active LOW decode trees. A six gate package can collapse many small logic equations into one IC.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1Y',  type: 'output' },
      { pin:  4, name: '2A',  type: 'input'  },
      { pin:  5, name: '2B',  type: 'input'  },
      { pin:  6, name: '2Y',  type: 'output' },
      { pin:  7, name: '3A',  type: 'input'  },
      { pin:  8, name: '3B',  type: 'input'  },
      { pin:  9, name: '3Y',  type: 'output' },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input'  },
      { pin: 13, name: '4B',  type: 'input'  },
      { pin: 14, name: '5Y',  type: 'output' },
      { pin: 15, name: '5A',  type: 'input'  },
      { pin: 16, name: '5B',  type: 'input'  },
      { pin: 17, name: '6Y',  type: 'output' },
      { pin: 18, name: '6A',  type: 'input'  },
      { pin: 19, name: '6B',  type: 'input'  },
      { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A','1B'], output: '1Y' },
      { type: 'NOR', inputs: ['2A','2B'], output: '2Y' },
      { type: 'NOR', inputs: ['3A','3B'], output: '3Y' },
      { type: 'NOR', inputs: ['4A','4B'], output: '4Y' },
      { type: 'NOR', inputs: ['5A','5B'], output: '5Y' },
      { type: 'NOR', inputs: ['6A','6B'], output: '6Y' },
    ],
  },

  // ── 74807: 1-to-10 clock driver (20-pin) ─────────────────────────────────
  /* Primary source: Texas Instruments, 74807 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/idt74fct807.pdf */
  '74x807': {
    name: '74x807',
    simpleName: '1-to-10 Clock Driver',
    description: '1-to-10 clock driver (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/idt74fct807.pdf',
    tags: ['clock', 'driver', 'fanout', 'stub'],
    guideOverview: 'The 74x807 is a 1-to-10 clock fanout driver. A single clock input is buffered and distributed to ten outputs with matched timing intent. This is used to distribute one timing source across many loads while minimizing skew and loading on the source oscillator.',
    guidePinDescriptions: {
      'OEn': 'Output-enable control. Disable all fanout outputs when inactive.',
      'CLK': 'Clock input source to be distributed.',
      'Y0':  'Clock output channel 0.',
      'Y1':  'Clock output channel 1.',
      'Y2':  'Clock output channel 2.',
      'Y3':  'Clock output channel 3.',
      'Y4':  'Clock output channel 4.',
      'Y5':  'Clock output channel 5.',
      'Y6':  'Clock output channel 6.',
      'GND': 'Ground reference (pin 10).',
      'Y7':  'Clock output channel 7.',
      'Y8':  'Clock output channel 8.',
      'Y9':  'Clock output channel 9.',
      'NC':  'No connect.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Clock Distribution',
        paragraphs: [
          'Clock fanout buffers isolate the oscillator from heavy capacitive loading and deliver cleaner edges to each destination. This improves timing reliability in multi device synchronous systems.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'CLK', type: 'input'  },
      { pin:  3, name: 'Y0',  type: 'output' },
      { pin:  4, name: 'Y1',  type: 'output' },
      { pin:  5, name: 'Y2',  type: 'output' },
      { pin:  6, name: 'Y3',  type: 'output' },
      { pin:  7, name: 'Y4',  type: 'output' },
      { pin:  8, name: 'Y5',  type: 'output' },
      { pin:  9, name: 'Y6',  type: 'output' },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'Y7',  type: 'output' },
      { pin: 12, name: 'Y8',  type: 'output' },
      { pin: 13, name: 'Y9',  type: 'output' },
      { pin: 14, name: 'NC',  type: 'nc'     },
      { pin: 15, name: 'NC',  type: 'nc'     },
      { pin: 16, name: 'NC',  type: 'nc'     },
      { pin: 17, name: 'NC',  type: 'nc'     },
      { pin: 18, name: 'NC',  type: 'nc'     },
      { pin: 19, name: 'NC',  type: 'nc'     },
      { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['OEn','CLK'], outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9'] },
    ],
  },

  // ── 74808: Hex 2 input AND drivers (20-pin) ──────────────────────────────
  // Six independent 2-input AND drivers. Y = A · B, push-pull (totem-pole) output.
  // Source: Texas Instruments, "SN54AS808B, SN74AS808B Hex 2-Input AND Drivers",
  //   SDAS019C (Dec. 1982, rev. Jan. 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74as808b.pdf. Verified: DW/N (20-pin
  //   DIP) terminal assignment + per-driver function table, page 1, read as
  //   300-dpi rendered PDF page images.
  // Pinout note: the hand-entered stub had A/B swapped on pins 12/13, 15/16,
  //   18/19 (gates 3-5). AND is commutative so outputs were unaffected, but the
  //   labels disagreed with the datasheet; corrected here to match SDAS019C
  //   (12=4A, 13=4B, 15=5A, 16=5B, 18=6A, 19=6B).
  '74x808': {
    name: '74x808',
    simpleName: 'Hex 2 Input AND Driver',
    description: 'Hex 2 input AND drivers (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74as808b.pdf',
    tags: ['AND', 'gate', 'driver', 'hex'],
    guideOverview: 'The 74x808 holds six separate 2 input AND gates. Each output goes HIGH only when both of its inputs are HIGH. These are the driver version, so the outputs are built to push more current than a plain logic gate, which is handy when one gate has to feed several others.',
    guidePinDescriptions: {
      'A0':  'Input A for gate 0.',
      'B0':  'Input B for gate 0.',
      'Y0':  'AND output for gate 0.',
      'A1':  'Input A for gate 1.',
      'B1':  'Input B for gate 1.',
      'Y1':  'AND output for gate 1.',
      'A2':  'Input A for gate 2.',
      'B2':  'Input B for gate 2.',
      'Y2':  'AND output for gate 2.',
      'GND': 'Ground reference (pin 10).',
      'Y3':  'AND output for gate 3.',
      'B3':  'Input B for gate 3.',
      'A3':  'Input A for gate 3.',
      'Y4':  'AND output for gate 4.',
      'B4':  'Input B for gate 4.',
      'A4':  'Input A for gate 4.',
      'Y5':  'AND output for gate 5.',
      'B5':  'Input B for gate 5.',
      'A5':  'Input A for gate 5.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Hex AND Functions',
        formulas: [
          'Y = A * B',
        ],
        paragraphs: [
          'A common use is to let a signal through only when an enable line is also HIGH: tie the signal to one input and the enable to the other, and the output follows the signal only while enabled.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'B0',  type: 'input'  },
      { pin:  3, name: 'Y0',  type: 'output' },
      { pin:  4, name: 'A1',  type: 'input'  },
      { pin:  5, name: 'B1',  type: 'input'  },
      { pin:  6, name: 'Y1',  type: 'output' },
      { pin:  7, name: 'A2',  type: 'input'  },
      { pin:  8, name: 'B2',  type: 'input'  },
      { pin:  9, name: 'Y2',  type: 'output' },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'Y3',  type: 'output' },
      { pin: 12, name: 'A3',  type: 'input'  },
      { pin: 13, name: 'B3',  type: 'input'  },
      { pin: 14, name: 'Y4',  type: 'output' },
      { pin: 15, name: 'A4',  type: 'input'  },
      { pin: 16, name: 'B4',  type: 'input'  },
      { pin: 17, name: 'Y5',  type: 'output' },
      { pin: 18, name: 'A5',  type: 'input'  },
      { pin: 19, name: 'B5',  type: 'input'  },
      { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'AND', inputs: ['A0','B0'], output: 'Y0' },
      { type: 'AND', inputs: ['A1','B1'], output: 'Y1' },
      { type: 'AND', inputs: ['A2','B2'], output: 'Y2' },
      { type: 'AND', inputs: ['A3','B3'], output: 'Y3' },
      { type: 'AND', inputs: ['A4','B4'], output: 'Y4' },
      { type: 'AND', inputs: ['A5','B5'], output: 'Y5' },
    ],
  },

  // ── 74810: Quad 2 input XNOR gates (14-pin) ──────────────────────────────
  // SN74ALS810 = quadruple 2-input exclusive-NOR gates, totem-pole (push-pull)
  // outputs, PDIP-14. Per-gate function Y = NOT(A XOR B): HIGH when the two
  // inputs are equal. The open-collector counterpart is the 74x811 sibling
  // entry below.
  //
  // SOURCE RECONCILIATION (TI purged the obsolete SN74ALS810/811 PDFs from its
  // lit server — every ti.com/lit symlink for these part numbers now 404s, so a
  // pin-level diagram of the 810 itself could not be retrieved):
  // [1] Function/part identity: distributor + archive metadata. SN74ALS810N is
  //     cataloged by TI as an exclusive-NOR (XNOR) gate (Octopart PN 3499779,
  //     Ultra Librarian "XNOR (exclusive NOR) gate" category). The OC sibling
  //     header is verbatim "QUADRUPLE 2-INPUT EXCLUSIVE NOR GATES WITH OPEN
  //     COLLECTOR OUTPUTS ... PDIP14" — Datasheet Archive, "74ALS811", [Online].
  //     Available: https://www.datasheetarchive.com/74ALS811-datasheet.html.
  //     Verified: part function + 14-pin package confirmed; pin diagram absent.
  // [2] Pinout: trusted by corroboration, not a direct 810 diagram. The ALS8xx
  //     "driver gate" family uses a strictly sequential per-gate pin order, read
  //     directly from a primary TI PDF as a 300-dpi page image (not a text
  //     scrape — issues.md C4): Texas Instruments, "SN54ALS804A/AS804B,
  //     SN74ALS804A/AS804B Hex 2-Input NAND Drivers", SDAS022C (Dec 1982, rev.
  //     Jan 1995). [Online]. Available:
  //     https://www.ti.com/lit/ds/symlink/sn74als804a.pdf. Verified: page-1
  //     terminal assignment 1A,1B,1Y,2A,2B,2Y,3A,3B,3Y,GND,... + function table.
  //     Collapsing that sequential convention onto 14 pins yields the standard
  //     quad-2-input DIP-14 footprint (A0,B0,Y0,A1,B1,Y1,GND,Y2,B2,A2,Y3,B3,A3,
  //     VCC) — identical to every quad 2-input XNOR ever made (74266/CD4077),
  //     and matching the hand-entered stub map, which is therefore kept as-is.
  '74x810': {
    name: '74x810',
    simpleName: 'Quad 2 Input XNOR',
    description: 'Quad 2 input XNOR gates (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.datasheetarchive.com/74ALS810-datasheet.html',
    tags: ['XNOR', 'gate', 'quad'],
    guideOverview: 'The 74x810 contains four 2 input XNOR gates. Each output goes HIGH when its two inputs are equal and LOW when they differ, which is the basic test used in equality comparators and parity circuits.',
    guidePinDescriptions: {
      'A0':  'Input A for gate 0.',
      'B0':  'Input B for gate 0.',
      'Y0':  'XNOR output for gate 0.',
      'A1':  'Input A for gate 1.',
      'B1':  'Input B for gate 1.',
      'Y1':  'XNOR output for gate 1.',
      'GND': 'Ground reference (pin 7).',
      'Y2':  'XNOR output for gate 2.',
      'B2':  'Input B for gate 2.',
      'A2':  'Input A for gate 2.',
      'Y3':  'XNOR output for gate 3.',
      'B3':  'Input B for gate 3.',
      'A3':  'Input A for gate 3.',
      'VCC': 'Positive supply (+5 V, pin 14).',
    },
    guideSections: [
      {
        title: 'Equality Logic',
        formulas: [
          'Y = A XNOR B = ~(A XOR B)',
        ],
        paragraphs: [
          'Cascading XNOR stages and ANDing their outputs forms an n-bit equality comparator.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'B0',  type: 'input'  },
      { pin:  3, name: 'Y0',  type: 'output' },
      { pin:  4, name: 'A1',  type: 'input'  },
      { pin:  5, name: 'B1',  type: 'input'  },
      { pin:  6, name: 'Y1',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'Y2',  type: 'output' },
      { pin:  9, name: 'B2',  type: 'input'  },
      { pin: 10, name: 'A2',  type: 'input'  },
      { pin: 11, name: 'Y3',  type: 'output' },
      { pin: 12, name: 'B3',  type: 'input'  },
      { pin: 13, name: 'A3',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'XNOR', inputs: ['A0','B0'], output: 'Y0' },
      { type: 'XNOR', inputs: ['A1','B1'], output: 'Y1' },
      { type: 'XNOR', inputs: ['A2','B2'], output: 'Y2' },
      { type: 'XNOR', inputs: ['A3','B3'], output: 'Y3' },
    ],
  },

  // ── 74811: Quad 2 input XNOR gates, OC (14-pin) ──────────────────────────
  // Open-collector sibling of the 74x810; same DIP-14 footprint, outputs are
  // open collector (wired-AND / external pull-up). Engine: four built-in XNOR
  // gates + the entry-level openCollector flag — identical treatment to the
  // canonical real part 74x266 (chips1.js), the LS/HC quad-XNOR-OC. XNOR is
  // commutative so the stub's A/B-swapped order on gates 2/3 is harmless.
  // Sources:
  // [1] Part function + package: header reads verbatim "QUADRUPLE 2-INPUT
  //     EXCLUSIVE NOR GATES WITH OPEN COLLECTOR OUTPUTS ... PDIP14" — Datasheet
  //     Archive, "74ALS811". [Online]. Available:
  //     https://www.datasheetarchive.com/74ALS811-datasheet.html. Verified:
  //     function (quad 2-input XNOR), open-collector outputs, and 14-pin
  //     package confirmed; pin diagram absent. (TI symlink dm74als811.pdf 404s.)
  // [2] Pinout: corroborated, not from a direct 811 diagram. The ALS8xx "driver
  //     gate" family uses a strictly sequential per-gate pin order, read from a
  //     primary TI PDF as a 300-dpi page image (not a text scrape — issues.md
  //     C4): Texas Instruments, "SN54ALS804A/AS804B, SN74ALS804A/AS804B Hex
  //     2-Input NAND Drivers", SDAS022C (Dec 1982, rev. Jan 1995). [Online].
  //     Available: https://www.ti.com/lit/ds/symlink/sn74als804a.pdf. Verified:
  //     page-1 terminal assignment 1A,1B,1Y,2A,2B,2Y,3A,3B,3Y,GND,... Collapsing
  //     that convention onto 14 pins yields the standard quad-2-input DIP-14
  //     footprint (A0,B0,Y0,A1,B1,Y1,GND,Y2,B2,A2,Y3,B3,A3,VCC) — identical to
  //     the verified 74x810 sibling and to every quad 2-input XNOR (74266/
  //     CD4077). Stub map agrees and is kept as-is.
  '74x811': {
    name: '74x811',
    simpleName: 'Quad 2 Input XNOR (OC)',
    description: 'Quad 2 input XNOR gates with open collector outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    openCollector: true,
    datasheet: 'https://www.datasheetarchive.com/74ALS811-datasheet.html',
    tags: ['XNOR', 'gate', 'quad', 'open collector'],
    guideOverview: 'The 74x811 is the open collector version of the quad 2 input XNOR. Each gate drives its output LOW when its two inputs differ and otherwise lets the output float, so every output needs an external pull up resistor to VCC to read HIGH. Because the outputs only pull LOW, several can share one line through a single pull up to form a wired AND: the line stays HIGH only while every gate sees equal inputs.',
    guidePinDescriptions: {
      'A0':  'Input A for gate 0.',
      'B0':  'Input B for gate 0.',
      'Y0':  'Open collector XNOR output for gate 0.',
      'A1':  'Input A for gate 1.',
      'B1':  'Input B for gate 1.',
      'Y1':  'Open collector XNOR output for gate 1.',
      'GND': 'Ground reference (pin 7).',
      'Y2':  'Open collector XNOR output for gate 2.',
      'B2':  'Input B for gate 2.',
      'A2':  'Input A for gate 2.',
      'Y3':  'Open collector XNOR output for gate 3.',
      'B3':  'Input B for gate 3.',
      'A3':  'Input A for gate 3.',
      'VCC': 'Positive supply (+5 V, pin 14).',
    },
    guideSections: [
      {
        title: 'OC Equality Networks',
        formulas: [
          'Y = A XNOR B = ~(A XOR B)',
        ],
        paragraphs: [
          'Tie several open collector XNOR outputs to one pull up to build a wide equality check. Each output pulls the shared line LOW when its inputs differ, so the line sits HIGH only when every gate sees matching inputs. This compares many bits across one or more chips without any extra gates.',
        ],
        note: 'Open collector outputs need an external pull up resistor (typically 1-10 kOhm) to VCC. Without one the output floats and the logic level is unreliable.',
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'B0',  type: 'input'  },
      { pin:  3, name: 'Y0',  type: 'output' },
      { pin:  4, name: 'A1',  type: 'input'  },
      { pin:  5, name: 'B1',  type: 'input'  },
      { pin:  6, name: 'Y1',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'Y2',  type: 'output' },
      { pin:  9, name: 'B2',  type: 'input'  },
      { pin: 10, name: 'A2',  type: 'input'  },
      { pin: 11, name: 'Y3',  type: 'output' },
      { pin: 12, name: 'B3',  type: 'input'  },
      { pin: 13, name: 'A3',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'XNOR', inputs: ['A0','B0'], output: 'Y0' },
      { type: 'XNOR', inputs: ['A1','B1'], output: 'Y1' },
      { type: 'XNOR', inputs: ['A2','B2'], output: 'Y2' },
      { type: 'XNOR', inputs: ['A3','B3'], output: 'Y3' },
    ],
  },

  // ── 74817: GTL+↔LV TTL fanout driver, TRI+OC (24-pin) ───────────────────
  /* Primary source: Texas Instruments, 74817 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74gtlp817.pdf */
  '74x817': {
    name: '74x817',
    simpleName: 'GTL+/LV TTL Fanout Driver',
    description: 'GTL+ to LV TTL 1-to-6 fanout / LV TTL to GTL+ 1-to-2 fanout driver (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74gtlp817.pdf',
    tags: ['driver', 'fanout', 'GTL', 'LV-TTL', 'stub'],
    guideOverview: 'The 74x817 is a mixed standard fanout driver for GTL+ and LV TTL style buses. It supports one to many distribution in one direction and reduced fanout in the other, helping interface low voltage terminated buses with TTL like logic domains.',
    guidePinDescriptions: {
      'OEn': 'Output-enable control for driver stages.',
      'IN':  'Main input signal to be fanned out.',
      'Y0':  'Fanout output 0.',
      'Y1':  'Fanout output 1.',
      'Y2':  'Fanout output 2.',
      'Y3':  'Fanout output 3.',
      'Y4':  'Fanout output 4.',
      'Y5':  'Fanout output 5.',
      'NC':  'No connect.',
      'GND': 'Ground reference (pin 12).',
      'B0':  'Secondary fanout/bus output 0.',
      'B1':  'Secondary fanout/bus output 1.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Bus Level Translation and Fanout',
        paragraphs: [
          'GTL and TTL families have different threshold and termination assumptions. Dedicated fanout translators like this reduce signal integrity issues when one source must drive many loads across mixed standards.',
        ],
        note: 'Detailed analog bus behavior is abstracted by a stub model.',
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'IN',   type: 'input'  },
      { pin:  3, name: 'Y0',   type: 'output' },
      { pin:  4, name: 'Y1',   type: 'output' },
      { pin:  5, name: 'Y2',   type: 'output' },
      { pin:  6, name: 'Y3',   type: 'output' },
      { pin:  7, name: 'Y4',   type: 'output' },
      { pin:  8, name: 'Y5',   type: 'output' },
      { pin:  9, name: 'NC',   type: 'nc'     },
      { pin: 10, name: 'NC',   type: 'nc'     },
      { pin: 11, name: 'NC',   type: 'nc'     },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'NC',   type: 'nc'     },
      { pin: 14, name: 'B0',   type: 'output' },
      { pin: 15, name: 'B1',   type: 'output' },
      { pin: 16, name: 'NC',   type: 'nc'     },
      { pin: 17, name: 'NC',   type: 'nc'     },
      { pin: 18, name: 'NC',   type: 'nc'     },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'NC',   type: 'nc'     },
      { pin: 21, name: 'NC',   type: 'nc'     },
      { pin: 22, name: 'NC',   type: 'nc'     },
      { pin: 23, name: 'NC',   type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['OEn','IN'], outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','B0','B1'] },
    ],
  },

  // ── 74818: 8 bit diagnostic scan register, TRI (24-pin) ──────────────────
  // Source: Texas Instruments, "CY29FCT818T Diagnostic Scan Register With
  //   3-State Outputs", SCCS012B (May 1994, rev. Nov 2001). [Online]. Available:
  //   https://datasheet.ciiva.com/4237/cy29fct818t-4237177.pdf. Verified:
  //   terminal assignment (pinout, page 1), function table (page 2), and logic
  //   diagram (page 3), read as PDF images. Function/pinout/drive compatible
  //   with F logic and AMD Am29818 per the datasheet header.
  // Note: the original stub pinout (CLK/LE + Q0..Q7 on pins 13-20 + NC on 21-23)
  //   was wrong. Corrected here to the datasheet: DCLK/PCLK/MODE/SDI/SDO and
  //   Y0..Y7 on pins 15-22. The TI URL for the plain "74act818" 404s; the
  //   CY29FCT818T (TI/Cypress, same die family) is the surviving datasheet.
  '74x818': {
    name: '74x818',
    simpleName: '8 bit Diagnostic Scan Register (TRI)',
    description: '8-bit diagnostic scan reg: pipeline + serial-scan shadow (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://datasheet.ciiva.com/4237/cy29fct818t-4237177.pdf',
    tags: ['register', '8 bit', 'diagnostic', 'scan', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x818 sits in a data path like a normal 8 bit register, but carries a second register beside it for testing. The pipeline register (Y0..Y7) does the everyday work. The shadow register runs in a serial scan chain: bits shift in on SDI and out on SDO one at a time. MODE swaps data between the two so you can force a known value into the path, or capture what the path is holding and shift it out to inspect it.',
    guidePinDescriptions: {
      'OEn':  'Output enable for Y0..Y7 (active LOW). HIGH puts the Y outputs in high impedance.',
      'DCLK': 'Shadow register clock. Rising edge shifts or loads the shadow register.',
      'PCLK': 'Pipeline register clock. Rising edge loads the pipeline register.',
      'MODE': 'Selects the data paths. LOW: normal (pipeline from D, shadow shifts). HIGH: diagnostic (pipeline from shadow, shadow captures Y).',
      'SDI':  'Serial data into the shadow chain. When MODE is HIGH it also picks shadow capture (LOW) versus hold (HIGH).',
      'SDO':  'Serial data out of the shadow chain (the shadow MSB, S7).',
      'D0':   'Pipeline data input bit 0.',
      'D1':   'Pipeline data input bit 1.',
      'D2':   'Pipeline data input bit 2.',
      'D3':   'Pipeline data input bit 3.',
      'D4':   'Pipeline data input bit 4.',
      'D5':   'Pipeline data input bit 5.',
      'D6':   'Pipeline data input bit 6.',
      'D7':   'Pipeline data input bit 7.',
      'GND':  'Ground reference (pin 12).',
      'Y0':   'Pipeline output bit 0 (tri state).',
      'Y1':   'Pipeline output bit 1 (tri state).',
      'Y2':   'Pipeline output bit 2 (tri state).',
      'Y3':   'Pipeline output bit 3 (tri state).',
      'Y4':   'Pipeline output bit 4 (tri state).',
      'Y5':   'Pipeline output bit 5 (tri state).',
      'Y6':   'Pipeline output bit 6 (tri state).',
      'Y7':   'Pipeline output bit 7 (tri state).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Two registers, one part',
        paragraphs: [
          'The pipeline register is the working register. In normal use a rising edge on PCLK loads it from D0..D7 and it drives Y0..Y7, exactly like a 74374.',
          'The shadow register is the test register. It is wired as a shift register: a rising edge on DCLK moves every bit up one place, a new bit enters at SDI, and the top bit leaves at SDO. Chain several parts SDO to SDI and you have one long scan path a test controller can read and write serially.',
        ],
      },
      {
        title: 'Moving data between them',
        paragraphs: [
          'MODE decides which register feeds which. With MODE LOW the two work independently: PCLK loads the pipeline from D, DCLK shifts the shadow chain.',
          'With MODE HIGH they trade. A PCLK edge now loads the pipeline from the shadow register, so a value you shifted in serially becomes the live output. A DCLK edge (with SDI LOW) copies the Y outputs into the shadow register, so you can capture whatever the data path is holding and shift it out to compare against what you expected. With SDI HIGH the shadow register holds instead.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'DCLK', type: 'input'  },
      { pin:  3, name: 'D0',   type: 'input'  },
      { pin:  4, name: 'D1',   type: 'input'  },
      { pin:  5, name: 'D2',   type: 'input'  },
      { pin:  6, name: 'D3',   type: 'input'  },
      { pin:  7, name: 'D4',   type: 'input'  },
      { pin:  8, name: 'D5',   type: 'input'  },
      { pin:  9, name: 'D6',   type: 'input'  },
      { pin: 10, name: 'D7',   type: 'input'  },
      { pin: 11, name: 'SDI',  type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'PCLK', type: 'input'  },
      { pin: 14, name: 'SDO',  type: 'output' },
      { pin: 15, name: 'Y7',   type: 'output' },
      { pin: 16, name: 'Y6',   type: 'output' },
      { pin: 17, name: 'Y5',   type: 'output' },
      { pin: 18, name: 'Y4',   type: 'output' },
      { pin: 19, name: 'Y3',   type: 'output' },
      { pin: 20, name: 'Y2',   type: 'output' },
      { pin: 21, name: 'Y1',   type: 'output' },
      { pin: 22, name: 'Y0',   type: 'output' },
      { pin: 23, name: 'MODE', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'DIAG_SCAN_REG_818',
        inputs:  ['OEn','DCLK','PCLK','MODE','SDI','D0','D1','D2','D3','D4','D5','D6','D7'],
        outputs: ['SDO','Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
    ],
  },

  // ── 74819: 8 bit diagnostics/pipeline register, TRI (24-pin) ─────────────
  // The '819 is a Serial Shadow Register (SSR) diagnostics/pipeline register:
  // one 8-bit pipeline register in the data path plus an 8-bit shadow register
  // on a serial scan chain, exactly the Am29818 architecture. Same die family
  // and pinout as the 74x818 above; the two are wired to the shared
  // DIAG_SCAN_REG_818 primitive.
  // Source: Advanced Micro Devices, "Am29818 SSR Diagnostics/WCS Pipeline
  //   Register", in 1985 AMD Bipolar Microprocessor Logic and Interface Data
  //   Book, order no. 03425C, pp. 8-13..8-15 (1985). [Online]. Available:
  //   http://www.bitsavers.org/components/amd/_dataBooks/1985_AMD_Bipolar_Microprocessor_Logic_and_Interface.pdf.
  //   Verified: connection diagram (24-pin D-24-SLIM, top view) + pin
  //   description table + function table, read as 500-dpi rendered PDF page
  //   images (issues.md C4), not from OCR text. Terminal assignment: 1 OEY,
  //   2 DCLK, 3-10 D0-D7, 11 SDI, 12 GND, 13 PCLK, 14 SDO, 15-22 Y7-Y0,
  //   23 MODE, 24 VCC. Function table: PCLK rising loads pipeline (MODE=L from
  //   D, MODE=H from shadow); DCLK rising drives the shadow (MODE=L serial
  //   right-shift S0<-SDI/SDO=S7, MODE=H+SDI=L capture Y, MODE=H+SDI=H hold).
  // Source: Texas Instruments, 1986 TI ALS/AS Logic Data Book. [Online].
  //   Available:
  //   http://www.bitsavers.org/components/ti/_dataBooks/1986_TI_ALS_AS_Logic_Data_Book.pdf.
  //   Verified: device selection guide lists '29818 and '819 together under
  //   "Pipeline Registers (serial-in serial-out)", i.e. TI's '819 is the
  //   Am29818-equivalent SSR register. The TI symlink sn74als819.pdf (below)
  //   404s, so the AMD Am29818 was used for the terminal/function detail
  //   (issues.md C4).
  // Model note: the real D0-D7 port is bidirectional (it can also drive out the
  //   shadow register for WCS writing). That output direction is omitted;
  //   D0-D7 are modelled as inputs only, which is the whole data-path function.
  '74x819': {
    name: '74x819',
    simpleName: '8 bit Diagnostic/Pipeline Reg (TRI)',
    description: '8-bit diagnostic/pipeline reg plus serial-scan shadow reg (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als819.pdf',
    tags: ['register', '8 bit', 'diagnostic', 'pipeline', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x819 is a pipeline register with a built-in test register. The pipeline register (Y0..Y7) carries data along a path the way a plain 8 bit register would. Next to it sits a shadow register on a serial scan chain: bits shift in one at a time on SDI and out on SDO. MODE moves data between the two, so a test controller can push a known value into the path or grab what the path is holding and shift it out to check it.',
    guidePinDescriptions: {
      'OEn':  'Output enable for Y0..Y7 (active LOW). HIGH puts the Y outputs in high impedance.',
      'DCLK': 'Shadow register clock. A rising edge shifts or loads the shadow register.',
      'PCLK': 'Pipeline register clock. A rising edge loads the pipeline register.',
      'MODE': 'Selects the data paths. LOW: normal (pipeline from D, shadow shifts). HIGH: diagnostic (pipeline from shadow, shadow captures Y).',
      'SDI':  'Serial data into the shadow chain. When MODE is HIGH it also picks shadow capture (LOW) versus hold (HIGH).',
      'SDO':  'Serial data out of the shadow chain (the shadow top bit, S7).',
      'D0':   'Pipeline data input bit 0.',
      'D1':   'Pipeline data input bit 1.',
      'D2':   'Pipeline data input bit 2.',
      'D3':   'Pipeline data input bit 3.',
      'D4':   'Pipeline data input bit 4.',
      'D5':   'Pipeline data input bit 5.',
      'D6':   'Pipeline data input bit 6.',
      'D7':   'Pipeline data input bit 7.',
      'GND':  'Ground reference (pin 12).',
      'Y0':   'Pipeline output bit 0 (tri state).',
      'Y1':   'Pipeline output bit 1 (tri state).',
      'Y2':   'Pipeline output bit 2 (tri state).',
      'Y3':   'Pipeline output bit 3 (tri state).',
      'Y4':   'Pipeline output bit 4 (tri state).',
      'Y5':   'Pipeline output bit 5 (tri state).',
      'Y6':   'Pipeline output bit 6 (tri state).',
      'Y7':   'Pipeline output bit 7 (tri state).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'The pipeline register',
        paragraphs: [
          'The pipeline register is the working register. With MODE LOW a rising edge on PCLK loads it from D0..D7 and it drives Y0..Y7, the same job a 74374 does. Splitting a long logic path with a register like this lets the parts on each side settle in their own clock cycle, so the whole path can run at a higher clock rate.',
        ],
      },
      {
        title: 'The shadow register and scan chain',
        paragraphs: [
          'The shadow register is the test register, wired as a shift register. With MODE LOW a rising edge on DCLK moves every bit up one place, a new bit enters at SDI, and the top bit leaves at SDO. Wire SDO to the next chip\'s SDI and a string of these parts forms one long scan path a test controller reads and writes serially.',
          'MODE HIGH connects the two registers. A PCLK edge then loads the pipeline from the shadow register, so a value shifted in serially becomes the live output. A DCLK edge with SDI LOW copies the Y outputs into the shadow register, capturing whatever the data path holds so it can be shifted out and compared against the expected result. With SDI HIGH the shadow register holds.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'DCLK', type: 'input'  },
      { pin:  3, name: 'D0',   type: 'input'  },
      { pin:  4, name: 'D1',   type: 'input'  },
      { pin:  5, name: 'D2',   type: 'input'  },
      { pin:  6, name: 'D3',   type: 'input'  },
      { pin:  7, name: 'D4',   type: 'input'  },
      { pin:  8, name: 'D5',   type: 'input'  },
      { pin:  9, name: 'D6',   type: 'input'  },
      { pin: 10, name: 'D7',   type: 'input'  },
      { pin: 11, name: 'SDI',  type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'PCLK', type: 'input'  },
      { pin: 14, name: 'SDO',  type: 'output' },
      { pin: 15, name: 'Y7',   type: 'output' },
      { pin: 16, name: 'Y6',   type: 'output' },
      { pin: 17, name: 'Y5',   type: 'output' },
      { pin: 18, name: 'Y4',   type: 'output' },
      { pin: 19, name: 'Y3',   type: 'output' },
      { pin: 20, name: 'Y2',   type: 'output' },
      { pin: 21, name: 'Y1',   type: 'output' },
      { pin: 22, name: 'Y0',   type: 'output' },
      { pin: 23, name: 'MODE', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'DIAG_SCAN_REG_818',
        inputs:  ['OEn','DCLK','PCLK','MODE','SDI','D0','D1','D2','D3','D4','D5','D6','D7'],
        outputs: ['SDO','Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
    ],
  },

  // ── 74821: 10 bit bus interface flip flop, TRI (24-pin) ──────────────────
  // Source: Fairchild Semiconductor, "74F821 10-Bit D-Type Flip-Flop", DS009595
  //   (rev. Oct. 2000). [Online]. Available:
  //   https://media.digikey.com/pdf/Data Sheets/Fairchild PDFs/74F821.pdf
  //   Verified: Connection Diagram (pin 1 OE, 2-11 D0-D9, 12 GND, 13 CP,
  //   14-23 O9..O0, 24 VCC) + Function Table + Logic Diagram, pages 1-2, read
  //   as rendered PDF page images (issues.md C4). Non-inverting true outputs;
  //   OE HIGH -> HiZ, OE does not affect stored state; rising CP loads D.
  //   TI's symlink (sn74as821a.pdf) now 404s/redirects to a product-selection
  //   page, so the equivalent Fairchild/National 74F821 (same pinout/function)
  //   was used as the verified source.
  //   Engine: width-agnostic D_FF_REG_TRI (js/specificChipsSim.js). Regression:
  //   js/debug/scenarios/74x821-bus-ff.mjs.
  '74x821': {
    name: '74x821',
    simpleName: '10 bit Bus Interface FF (TRI)',
    description: '10 bit bus interface flip flop with three state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74F821.pdf',
    tags: ['flip flop', 'D type', '10 bit', 'bus', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x821 is a 10 bit D type bus interface flip flop with tri state outputs. It captures D0-D9 on clock events and presents Q0-Q9 to the bus when enabled. This width is useful for address/control groupings wider than a byte.',
    guidePinDescriptions: {
      'OEn': 'Output enable (active LOW) for bus drive.',
      'D0':  'Data input bit 0.',
      'D1':  'Data input bit 1.',
      'D2':  'Data input bit 2.',
      'D3':  'Data input bit 3.',
      'D4':  'Data input bit 4.',
      'D5':  'Data input bit 5.',
      'D6':  'Data input bit 6.',
      'D7':  'Data input bit 7.',
      'D8':  'Data input bit 8.',
      'D9':  'Data input bit 9.',
      'GND': 'Ground reference (pin 12).',
      'CLK': 'Clock input for sampling D inputs.',
      'Q9':  'Registered output bit 9.',
      'Q8':  'Registered output bit 8.',
      'Q7':  'Registered output bit 7.',
      'Q6':  'Registered output bit 6.',
      'Q5':  'Registered output bit 5.',
      'Q4':  'Registered output bit 4.',
      'Q3':  'Registered output bit 3.',
      'Q2':  'Registered output bit 2.',
      'Q1':  'Registered output bit 1.',
      'Q0':  'Registered output bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Wide Bus Interface Registers',
        paragraphs: [
          '10 bit registers are often used when a bus carries 8 data bits plus parity/status bits or split address/control fields. Tri state outputs let many such devices share a common backplane.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  },
      { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  },
      { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  },
      { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  },
      { pin: 10, name: 'D8',  type: 'input'  },
      { pin: 11, name: 'D9',  type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'CLK', type: 'input'  },
      { pin: 14, name: 'Q9',  type: 'output' },
      { pin: 15, name: 'Q8',  type: 'output' },
      { pin: 16, name: 'Q7',  type: 'output' },
      { pin: 17, name: 'Q6',  type: 'output' },
      { pin: 18, name: 'Q5',  type: 'output' },
      { pin: 19, name: 'Q4',  type: 'output' },
      { pin: 20, name: 'Q3',  type: 'output' },
      { pin: 21, name: 'Q2',  type: 'output' },
      { pin: 22, name: 'Q1',  type: 'output' },
      { pin: 23, name: 'Q0',  type: 'output' },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'D_FF_REG_TRI', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','D9','CLK','OEn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
    ],
  },

  // ── 74822: 10 bit bus interface flip flop, inverting, TRI (24-pin) ────────
  // The '822 is the inverting member of the SN74AS821/822 10-bit bus-interface
  // flip-flop family (AMD Am29821/Am29822 second source): on the rising clock
  // edge each stored bit becomes the complement of its D input; OE (active LOW)
  // gates the 3-state outputs without disturbing the stored word.
  //
  // Sources:
  // 1. Texas Instruments, "SN54AS821A, SN74AS821A 10-Bit Bus-Interface
  //    Flip-Flops With 3-State Outputs", SDAS230A (Dec 1983, rev. Aug 1995).
  //    [Online]. Available: https://www.ti.com/lit/ds/symlink/sn54as821a.pdf.
  //    Verified: DW/NT 24-pin DIP terminal assignment (top view) and the
  //    function table, page 1, read as a 200-dpi PDF page image (NOT the WebFetch
  //    text summary, per issues.md C4). The '822 shares this pinout exactly
  //    (OE=1, 1D..10D=2..11, GND=12, CLK=13, 10Q..1Q=14..23, VCC=24); it differs
  //    only in that the registered output is inverted (Q = NOT D). TI's own
  //    standalone SN74AS822 sheet (SDAS230, SN74AS821/822) is withdrawn from
  //    ti.com, so the live 821A family sheet is the authoritative pinout source.
  // 2. Wikipedia, "List of AMD Am2900 and Am29000 families". [Online]. Available:
  //    https://en.wikipedia.org/wiki/List_of_AMD_Am2900_and_Am29000_families.
  //    Verified: Am29821 = non-inverting 10-bit registered, Am29822 = inverting
  //    10-bit registered — corroborates the odd=true / even=inverting family
  //    convention already used in this repo for the '823 (true) / '824 (inv).
  // Pinout checked, not cloned (issues.md C2, the CD4082 lesson): it matches the
  //   hand-entered stub, so the stub pinout was correct and was left in place.
  '74x822': {
    name: '74x822',
    simpleName: '10 bit Bus Interface FF (Inverting, TRI)',
    description: '10 bit inverting bus interface flip flop with three state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn54as821a.pdf',
    tags: ['flip flop', 'D type', '10 bit', 'bus', 'inverting', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x822 is the inverting version of the 74x821: ten D-type flip-flops with one shared clock and one active-LOW output enable. On each rising clock edge it captures D0-D9, but each output holds the complement of the bit it captured, so a stored 1 reads back as 0. The active-LOW OE puts all ten outputs in the high-impedance state for sharing a bus, without changing the stored word.',
    guidePinDescriptions: {
      'OEn': 'Output enable (active LOW).',
      'D0':  'Data input bit 0.',
      'D1':  'Data input bit 1.',
      'D2':  'Data input bit 2.',
      'D3':  'Data input bit 3.',
      'D4':  'Data input bit 4.',
      'D5':  'Data input bit 5.',
      'D6':  'Data input bit 6.',
      'D7':  'Data input bit 7.',
      'D8':  'Data input bit 8.',
      'D9':  'Data input bit 9.',
      'GND': 'Ground reference (pin 12).',
      'CLK': 'Clock input.',
      'Q9':  'Registered output bit 9.',
      'Q8':  'Registered output bit 8.',
      'Q7':  'Registered output bit 7.',
      'Q6':  'Registered output bit 6.',
      'Q5':  'Registered output bit 5.',
      'Q4':  'Registered output bit 4.',
      'Q3':  'Registered output bit 3.',
      'Q2':  'Registered output bit 2.',
      'Q1':  'Registered output bit 1.',
      'Q0':  'Registered output bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Why an inverting register',
        paragraphs: [
          'The 74x821 and 74x822 are the same chip except for output polarity. If your logic already needs the inverted form of a captured word, the 74x822 gives it to you in one clock, so you skip a separate rank of inverters. That saves board space and keeps all ten bits inverting at the same instant, instead of picking up the small timing spread ten discrete inverters would add.',
          'Only the stored output is inverted. The clock still captures on the rising edge and the active-LOW OE still just enables or floats the outputs, exactly as on the 74x821.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  },
      { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  },
      { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  },
      { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  },
      { pin: 10, name: 'D8',  type: 'input'  },
      { pin: 11, name: 'D9',  type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'CLK', type: 'input'  },
      { pin: 14, name: 'Q9',  type: 'output' },
      { pin: 15, name: 'Q8',  type: 'output' },
      { pin: 16, name: 'Q7',  type: 'output' },
      { pin: 17, name: 'Q6',  type: 'output' },
      { pin: 18, name: 'Q5',  type: 'output' },
      { pin: 19, name: 'Q4',  type: 'output' },
      { pin: 20, name: 'Q3',  type: 'output' },
      { pin: 21, name: 'Q2',  type: 'output' },
      { pin: 22, name: 'Q1',  type: 'output' },
      { pin: 23, name: 'Q0',  type: 'output' },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      // Shares the width-agnostic D_FF_REG_TRI engine with the 74x821; invert:true
      // makes each stored bit Q = NOT D (the '822). Input order the primitive
      // expects: [D0..D9, CLK, OEn].
      { type: 'D_FF_REG_TRI', invert: true, inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','D9','CLK','OEn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
    ],
  },

  // ── 74823: 9 bit bus-interface D flip-flop, CLRn + CLKENn, TRI (24-pin) ──
  // Source: Texas Instruments, "SN54AS823A, SN74AS823A, SN74AS824A 9-Bit Bus-Interface
  //   Flip-Flops With 3-State Outputs", SDAS231A (June 1984, revised August 1995).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn54as823a.pdf. Verified:
  //   SN74AS823A terminal assignment (DW/JT/NT package, top view), the '823 function
  //   table, and the '823 logic symbol, pages 1-2, read as rendered ~300-dpi PDF page
  //   images (issues.md C4 — not via the text summarizer).
  //   Behavior of the '823 (each flip-flop, all controls active LOW): CLKENn LOW enables
  //   the clock, so the nine D edge-triggered FFs load data on the rising CLK edge
  //   (non-inverting: Q = D); CLKENn HIGH disables the clock buffer and holds the
  //   outputs; CLRn LOW forces all Q LOW asynchronously (dominates the clock); OEn HIGH
  //   puts the outputs in Hi-Z without disturbing stored data.
  //   Pinout corrected from the hand-entered stub (issues.md C2): the stub put CLRn on
  //   pin 2, CEN on pin 3, D0-D7 on 4-11 and D8 on 14, with no clock-enable pin. Real
  //   map: OEn=1, 1D-9D=2-10, CLRn=11, GND=12, CLK=13, CLKENn=14, 9Q-1Q=15-23, VCC=24.
  //   Reuses the existing D_FF_9BIT_CLR_CE_TRI engine primitive (js/specificChipsSim.js),
  //   contract inputs [OEn, CLRn, CEN, CLK, D0..D8] / outputs [Q0..Q8]; its function
  //   table matches the datasheet (CEN here is the datasheet's active-LOW CLKENn).
  '74x823': {
    name: '74x823',
    simpleName: '9 bit D-FF w/ CLRn + CEN (TRI)',
    description: '9-bit D flip-flops, clear + clock enable, 3-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74as823a.pdf',
    tags: ['flip flop', 'D type', '9 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x823 is a 9 bit D type register with asynchronous clear (CLRn), clock enable (CEN), and tri state outputs. The 9 bit width carries a parity or control bit alongside an 8 bit data field on a bus.',
    guidePinDescriptions: {
      'OEn':  'Output enable (active LOW).',
      'CLRn': 'Asynchronous clear, active LOW. Clears stored outputs regardless of clock.',
      'CEN':  'Clock enable, active LOW. LOW lets the clock load new data; HIGH holds the stored value.',
      'D0':   'Data input bit 0.',
      'D1':   'Data input bit 1.',
      'D2':   'Data input bit 2.',
      'D3':   'Data input bit 3.',
      'D4':   'Data input bit 4.',
      'D5':   'Data input bit 5.',
      'D6':   'Data input bit 6.',
      'D7':   'Data input bit 7.',
      'D8':   'Data input bit 8.',
      'GND':  'Ground reference (pin 12).',
      'CLK':  'Clock input. Data is captured on the rising edge.',
      'Q8':   'Registered output bit 8.',
      'Q7':   'Registered output bit 7.',
      'Q6':   'Registered output bit 6.',
      'Q5':   'Registered output bit 5.',
      'Q4':   'Registered output bit 4.',
      'Q3':   'Registered output bit 3.',
      'Q2':   'Registered output bit 2.',
      'Q1':   'Registered output bit 1.',
      'Q0':   'Registered output bit 0.',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Clear and Clock Enable Controls',
        paragraphs: [
          'CLRn provides fast global reset, while CEN allows selective state hold without stopping the system clock. Together these controls are common in pipelined bus interfaces.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  },
      { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  },
      { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  },
      { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  },
      { pin: 10, name: 'D8',  type: 'input'  },
      { pin: 11, name: 'CLRn',type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'CLK', type: 'input'  },
      { pin: 14, name: 'CEN', type: 'input'  },
      { pin: 15, name: 'Q8',  type: 'output' },
      { pin: 16, name: 'Q7',  type: 'output' },
      { pin: 17, name: 'Q6',  type: 'output' },
      { pin: 18, name: 'Q5',  type: 'output' },
      { pin: 19, name: 'Q4',  type: 'output' },
      { pin: 20, name: 'Q3',  type: 'output' },
      { pin: 21, name: 'Q2',  type: 'output' },
      { pin: 22, name: 'Q1',  type: 'output' },
      { pin: 23, name: 'Q0',  type: 'output' },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      // Reuses the D_FF_9BIT_CLR_CE_TRI engine primitive (js/specificChipsSim.js):
      // inputs [OEn, CLRn, CEN, CLK, D0..D8], outputs [Q0..Q8]. CEN is the datasheet's
      // active-LOW CLKENn (LOW = clock enabled/load on rising edge, HIGH = hold).
      { type: 'D_FF_9BIT_CLR_CE_TRI', inputs: ['OEn','CLRn','CEN','CLK','D0','D1','D2','D3','D4','D5','D6','D7','D8'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

  // ── 74824: 9 bit bus-interface D flip-flop, inverting inputs, CLRn + CLKENn, TRI (24-pin) ──
  // Source: Texas Instruments, "SN54AS823A, SN74AS823A, SN74AS824A 9-Bit Bus-Interface
  //   Flip-Flops With 3-State Outputs", SDAS231A (June 1984, revised August 1995).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn54as823a.pdf. Verified:
  //   SN74AS824A terminal assignment (DW/NT package, top view), the '824 function table
  //   (each flip-flop), and the '824 logic diagram, pages 1-3, read as rendered ~300-dpi
  //   PDF page images (issues.md C4 — not via the text summarizer).
  //   Behavior of the '824: inverting (D-bar) data inputs, so a stored bit is the
  //   complement of its D pin (Q = NOT D on the CLK low-to-high edge); CLRn LOW forces
  //   all Q LOW asynchronously (independent of the clock); CLKENn HIGH inhibits the clock
  //   (hold Q0); OEn HIGH puts the outputs in Hi-Z without disturbing stored data.
  //   Simulated by the BUS_FF_9BIT_TRI engine primitive with gate.invert:true (the '824
  //   variant); the '823 is the same primitive without invert.
  //   The stub's URL sn74as824.pdf 404s; this combined family sheet is the live TI doc.
  //   Pinout corrected from the hand-entered stub (issues.md C2): the stub put CLRn on
  //   pin 2 and CEN on pin 3, had no CLKEN pin, and mis-placed D8 on pin 14. Real map:
  //   OEn=1, 1D-9D(=D0-D8)=2-10, CLRn=11, GND=12, CLK=13, CLKENn=14, 9Q-1Q(=Q8-Q0)=15-23,
  //   VCC=24.
  '74x824': {
    name: '74x824',
    simpleName: '9 bit D-FF w/ CLRn + CEN, Inv In (TRI)',
    description: '9-bit inverting D flip-flops, clear + clock enable, 3-state out (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn54as823a.pdf',
    tags: ['flip flop', 'D type', '9 bit', 'inverting', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x824 stores 9 bits on the rising clock edge, like the 74x823, but its data inputs are inverting: each stored output is the complement of the level on its D pin at the clock edge. Same controls as the 823 — asynchronous clear (CLRn), clock enable (CLKENn), and three state outputs — just an inverted data path.',
    guidePinDescriptions: {
      'OEn':  'Output enable, active LOW. HIGH puts all nine outputs in the high impedance state without changing the stored bits.',
      'CLRn': 'Asynchronous clear, active LOW. Forces all nine outputs LOW regardless of the clock.',
      'CLKENn':'Clock enable, active LOW. LOW lets the clock edge load data; HIGH holds the current outputs.',
      'D0':   'Data input bit 0 (inverting): the stored bit is its complement.',
      'D1':   'Data input bit 1 (inverting): the stored bit is its complement.',
      'D2':   'Data input bit 2 (inverting): the stored bit is its complement.',
      'D3':   'Data input bit 3 (inverting): the stored bit is its complement.',
      'D4':   'Data input bit 4 (inverting): the stored bit is its complement.',
      'D5':   'Data input bit 5 (inverting): the stored bit is its complement.',
      'D6':   'Data input bit 6 (inverting): the stored bit is its complement.',
      'D7':   'Data input bit 7 (inverting): the stored bit is its complement.',
      'GND':  'Ground reference (pin 12).',
      'CLK':  'Clock input. Data is captured on the LOW to HIGH edge.',
      'D8':   'Data input bit 8 (inverting): the stored bit is its complement.',
      'Q8':   'Registered output bit 8.',
      'Q7':   'Registered output bit 7.',
      'Q6':   'Registered output bit 6.',
      'Q5':   'Registered output bit 5.',
      'Q4':   'Registered output bit 4.',
      'Q3':   'Registered output bit 3.',
      'Q2':   'Registered output bit 2.',
      'Q1':   'Registered output bit 1.',
      'Q0':   'Registered output bit 0.',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: '74x823 vs 74x824',
        paragraphs: [
          'The two parts share the same pinout, width, and controls. The only difference is the data path: the 823 stores each D input as-is, while the 824 stores its complement. Pick the 824 when the surrounding logic already carries data in active-LOW form, so the inversion happens inside the register instead of costing an extra gate.',
        ],
      },
      {
        title: 'Clear, clock enable, and hold',
        paragraphs: [
          'CLRn LOW clears all nine outputs immediately, without waiting for a clock edge. CLKENn LOW arms the register so the next rising clock edge loads new data; CLKENn HIGH freezes the outputs even while the clock keeps running. OEn only affects the pins: HIGH releases the outputs to high impedance, but the stored bits stay put and reappear when OEn goes LOW again.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',    type: 'input'  },
      { pin:  2, name: 'D0',     type: 'input'  },
      { pin:  3, name: 'D1',     type: 'input'  },
      { pin:  4, name: 'D2',     type: 'input'  },
      { pin:  5, name: 'D3',     type: 'input'  },
      { pin:  6, name: 'D4',     type: 'input'  },
      { pin:  7, name: 'D5',     type: 'input'  },
      { pin:  8, name: 'D6',     type: 'input'  },
      { pin:  9, name: 'D7',     type: 'input'  },
      { pin: 10, name: 'D8',     type: 'input'  },
      { pin: 11, name: 'CLRn',   type: 'input'  },
      { pin: 12, name: 'GND',    type: 'power'  },
      { pin: 13, name: 'CLK',    type: 'input'  },
      { pin: 14, name: 'CLKENn', type: 'input'  },
      { pin: 15, name: 'Q8',     type: 'output' },
      { pin: 16, name: 'Q7',     type: 'output' },
      { pin: 17, name: 'Q6',     type: 'output' },
      { pin: 18, name: 'Q5',     type: 'output' },
      { pin: 19, name: 'Q4',     type: 'output' },
      { pin: 20, name: 'Q3',     type: 'output' },
      { pin: 21, name: 'Q2',     type: 'output' },
      { pin: 22, name: 'Q1',     type: 'output' },
      { pin: 23, name: 'Q0',     type: 'output' },
      { pin: 24, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      { type: 'BUS_FF_9BIT_TRI', invert: true,
        inputs: ['OEn','CLRn','CLKENn','CLK','D0','D1','D2','D3','D4','D5','D6','D7','D8'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

  // ── 74825: 8 bit D flip flop, CLRn + clock-enable, 3-state (24-pin) ──────
  // Source: Fairchild Semiconductor, "74ACT825 8-Bit D-Type Flip-Flop",
  //   DS009895 (Jul. 1988, rev. Sep. 2000). [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74ACT825.pdf
  //   Verified: 24-pin PDIP connection diagram + pin descriptions + function
  //   table, pages 1-2, read as PDF page images (not a text summary).
  // Note: the TI SN74AS825A URL previously cited here 404s; the Fairchild/
  //   National ACT825 is the same JEDEC part (8-bit register, CLRn, ENn clock
  //   enable, three active-LOW output enables OE1/OE2/OE3, non-inverting).
  //   The original stub pinout was wrong (single OEn on pin 1, CLRn on pin 2,
  //   CEN on pin 3, NC on 14/23); corrected to the datasheet assignment below.
  '74x825': {
    name: '74x825',
    simpleName: '8 bit D-FF w/ CLRn + CEN (TRI)',
    description: '8-bit D flip-flops, async clear, clock enable, 3-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74ACT825.pdf',
    tags: ['flip flop', 'D type', '8 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x825 is an 8 bit register: eight D flip flops that share one clock. On each rising clock edge it captures a byte, holds it, and drives it onto a bus through three state outputs. A clock enable lets you skip edges without disturbing the stored byte, and an asynchronous clear forces all bits to 0 immediately.',
    guidePinDescriptions: {
      'OE1n': 'Output enable 1, active LOW. All three enables must be LOW for the outputs to drive; if any is HIGH the outputs go high impedance.',
      'OE2n': 'Output enable 2, active LOW. See OE1n.',
      'OE3n': 'Output enable 3, active LOW. See OE1n.',
      'CLRn': 'Asynchronous clear, active LOW. Forces all eight stored bits to 0 immediately, regardless of the clock.',
      'ENn':  'Clock enable, active LOW. When LOW, a rising clock edge loads the data inputs. When HIGH, clock edges are ignored and the byte is held.',
      'CP':   'Clock input. Data is captured on the LOW to HIGH transition.',
      'D0':   'Data input bit 0.',
      'D1':   'Data input bit 1.',
      'D2':   'Data input bit 2.',
      'D3':   'Data input bit 3.',
      'D4':   'Data input bit 4.',
      'D5':   'Data input bit 5.',
      'D6':   'Data input bit 6.',
      'D7':   'Data input bit 7.',
      'GND':  'Ground reference (pin 12).',
      'O7':   'Registered output bit 7.',
      'O6':   'Registered output bit 6.',
      'O5':   'Registered output bit 5.',
      'O4':   'Registered output bit 4.',
      'O3':   'Registered output bit 3.',
      'O2':   'Registered output bit 2.',
      'O1':   'Registered output bit 1.',
      'O0':   'Registered output bit 0.',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Byte Wide Bus Register',
        paragraphs: [
          'Put one of these between two stages of a bus and it captures a byte on each clock edge, breaking a long combinational path into two shorter ones so the whole thing can run faster.',
          'The clear and clock enable give you control the plain 374 does not. Pull CLRn low and the stored byte drops to 0 right away, without waiting for a clock. Hold ENn high and the register ignores the clock, keeping its byte until you are ready to load a new one.',
          'The three output enables are AND-ed: the outputs only drive the bus when OE1n, OE2n, and OE3n are all low. Any one of them high parks the outputs at high impedance, so several devices can share the same bus lines and separate control signals can each veto the drive.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OE1n', type: 'input'  },
      { pin:  2, name: 'OE2n', type: 'input'  },
      { pin:  3, name: 'D0',   type: 'input'  },
      { pin:  4, name: 'D1',   type: 'input'  },
      { pin:  5, name: 'D2',   type: 'input'  },
      { pin:  6, name: 'D3',   type: 'input'  },
      { pin:  7, name: 'D4',   type: 'input'  },
      { pin:  8, name: 'D5',   type: 'input'  },
      { pin:  9, name: 'D6',   type: 'input'  },
      { pin: 10, name: 'D7',   type: 'input'  },
      { pin: 11, name: 'CLRn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'CP',   type: 'input'  },
      { pin: 14, name: 'ENn',  type: 'input'  },
      { pin: 15, name: 'O7',   type: 'output' },
      { pin: 16, name: 'O6',   type: 'output' },
      { pin: 17, name: 'O5',   type: 'output' },
      { pin: 18, name: 'O4',   type: 'output' },
      { pin: 19, name: 'O3',   type: 'output' },
      { pin: 20, name: 'O2',   type: 'output' },
      { pin: 21, name: 'O1',   type: 'output' },
      { pin: 22, name: 'O0',   type: 'output' },
      { pin: 23, name: 'OE3n', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    // Width-agnostic register: inputs = [D0..D7, CP, CLRn, ENn, OE1n, OE2n, OE3n].
    // Outputs drive only when all three OEn are LOW (see _evaluateDFFRegTriClrEn).
    gates: [
      { type: 'D_FF_REG_TRI_CLR_EN',
        inputs:  ['D0','D1','D2','D3','D4','D5','D6','D7','CP','CLRn','ENn','OE1n','OE2n','OE3n'],
        outputs: ['O0','O1','O2','O3','O4','O5','O6','O7'] },
    ],
  },

};