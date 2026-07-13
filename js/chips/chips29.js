// chips29.js - Chips Block 29: 74518-74537
export const CHIPS_BLOCK_29 = {

  // ── 74518: 8 bit Comparator (OC, pull up), 20-pin ──────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  '74x518': {
    name: '74x518', simpleName: '8 bit Comparator (OC, pull up)',
    description: '8 bit identity comparator, 20k pull-ups, open collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true,
    tags: ['comparator', '8 bit', 'open collector'],    guideOverview: 'The 74x518 is an 8 bit identity comparator with on chip 20 kΩ pull up resistors on all data inputs and an open collector EQ (active LOW) output. EQ is asserted LOW when A[7:0] equals B[7:0] and G1 (active LOW) is asserted. The built in pull ups simplify interfacing with passive bus holders or CMOS devices.',
    guidePinDescriptions: {
      'G1n': 'Enable (active LOW). Assertion required for comparison output to respond; when negated, EQ (active LOW) is forced HIGH.',
      'A0':  'Data bus A, bit 0.',
      'A1':  'Data bus A, bit 1.',
      'A2':  'Data bus A, bit 2.',
      'A3':  'Data bus A, bit 3.',
      'A4':  'Data bus A, bit 4.',
      'A5':  'Data bus A, bit 5.',
      'A6':  'Data bus A, bit 6.',
      'A7':  'Data bus A, bit 7.',
      'GND': 'Ground reference (pin 10).',
      'B0':  'Data bus B, bit 0.',
      'B1':  'Data bus B, bit 1.',
      'B2':  'Data bus B, bit 2.',
      'B3':  'Data bus B, bit 3.',
      'B4':  'Data bus B, bit 4.',
      'B5':  'Data bus B, bit 5.',
      'B6':  'Data bus B, bit 6.',
      'B7':  'Data bus B, bit 7.',
      'EQn': '<span style="text-decoration:overline">EQ</span> Equal output (active LOW, open collector). Asserted when A=B and G1 (active LOW) is asserted.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Open Collector Wired AND',
        paragraphs: [
          'With open collector outputs, multiple 74x518 outputs can be tied together. The combined output is LOW only when ALL comparators agree on equality useful for comparing 16- or 32 bit buses by chaining chips.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'A6',  type: 'input'  },
      { pin:  9, name: 'A7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'B0',  type: 'input'  }, { pin: 12, name: 'B1',  type: 'input'  },
      { pin: 13, name: 'B2',  type: 'input'  }, { pin: 14, name: 'B3',  type: 'input'  },
      { pin: 15, name: 'B4',  type: 'input'  }, { pin: 16, name: 'B5',  type: 'input'  },
      { pin: 17, name: 'B6',  type: 'input'  }, { pin: 18, name: 'B7',  type: 'input'  },
      { pin: 19, name: 'EQn', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_8BIT_OC',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','B0','B1','B2','B3','B4','B5','B6','B7'],
      outputs: ['EQn'] }],
  },

  // ── 74519: 8 bit Comparator (OC), 20-pin ───────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  '74x519': {
    name: '74x519', simpleName: '8 bit Comparator (OC)',
    description: '8 bit identity comparator with open collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true,
    tags: ['comparator', '8 bit', 'open collector'],
    guideOverview: 'The 74x519 is an 8 bit identity comparator with an open collector EQ (active LOW) output, identical in function to the 74x518 but without the internal 20 kΩ pull up resistors. Use when the bus pull ups are provided externally or bus drive levels are different.',
    guidePinDescriptions: {
      'G1n': 'Enable (active LOW).',
      'A0':  'Data bus A, bit 0.',
      'A1':  'Data bus A, bit 1.',
      'A2':  'Data bus A, bit 2.',
      'A3':  'Data bus A, bit 3.',
      'A4':  'Data bus A, bit 4.',
      'A5':  'Data bus A, bit 5.',
      'A6':  'Data bus A, bit 6.',
      'A7':  'Data bus A, bit 7.',
      'GND': 'Ground reference (pin 10).',
      'B0':  'Data bus B, bit 0.',
      'B1':  'Data bus B, bit 1.',
      'B2':  'Data bus B, bit 2.',
      'B3':  'Data bus B, bit 3.',
      'B4':  'Data bus B, bit 4.',
      'B5':  'Data bus B, bit 5.',
      'B6':  'Data bus B, bit 6.',
      'B7':  'Data bus B, bit 7.',
      'EQn': '<span style="text-decoration:overline">EQ</span> Equal output (active LOW, open collector).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x518 vs 74x519',
        paragraphs: [
          '74x518 includes on chip 20 kΩ pull ups on A and B inputs; 74x519 does not. Both have identical open collector EQn outputs. Choose based on whether the bus already has pull ups in place.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'A6',  type: 'input'  },
      { pin:  9, name: 'A7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'B0',  type: 'input'  }, { pin: 12, name: 'B1',  type: 'input'  },
      { pin: 13, name: 'B2',  type: 'input'  }, { pin: 14, name: 'B3',  type: 'input'  },
      { pin: 15, name: 'B4',  type: 'input'  }, { pin: 16, name: 'B5',  type: 'input'  },
      { pin: 17, name: 'B6',  type: 'input'  }, { pin: 18, name: 'B7',  type: 'input'  },
      { pin: 19, name: 'EQn', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_8BIT_OC',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','B0','B1','B2','B3','B4','B5','B6','B7'],
      outputs: ['EQn'] }],
  },

  // ── 74520: 8 bit Comparator Inverting (pull up), 20-pin ────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x520': {
    name: '74x520', simpleName: '8 bit Comparator Inverting (pull up)',
    description: '8 bit inverting comparator, 20k pull-ups, 3-state output (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    tags: ['comparator', '8 bit', 'inverting'],    guideOverview: 'The 74x520 is an 8 bit identity comparator with inverted (active HIGH) EQ output and on chip 20 kΩ pull up inputs. EQ goes HIGH when A equals B and G1 (active LOW) is asserted. Use when downstream logic expects a positive (active HIGH) equality signal.',
    guidePinDescriptions: {
      'G1n': 'Enable (active LOW).',
      'A0':  'Data bus A, bit 0.',
      'A1':  'Data bus A, bit 1.',
      'A2':  'Data bus A, bit 2.',
      'A3':  'Data bus A, bit 3.',
      'A4':  'Data bus A, bit 4.',
      'A5':  'Data bus A, bit 5.',
      'A6':  'Data bus A, bit 6.',
      'A7':  'Data bus A, bit 7.',
      'GND': 'Ground reference (pin 10).',
      'B0':  'Data bus B, bit 0.',
      'B1':  'Data bus B, bit 1.',
      'B2':  'Data bus B, bit 2.',
      'B3':  'Data bus B, bit 3.',
      'B4':  'Data bus B, bit 4.',
      'B5':  'Data bus B, bit 5.',
      'B6':  'Data bus B, bit 6.',
      'B7':  'Data bus B, bit 7.',
      'EQ':  'Equal output (active HIGH, tri state). HIGH when A=B and G1 (active LOW) is asserted.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Inverting Output Comparator',
        paragraphs: [
          'The 74x520 and 74x521 both produce active HIGH (non inverting sense) EQ outputs unlike the 74x518/519 which produce active LOW EQn. The tri state output allows bus sharing.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'A6',  type: 'input'  },
      { pin:  9, name: 'A7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'B0',  type: 'input'  }, { pin: 12, name: 'B1',  type: 'input'  },
      { pin: 13, name: 'B2',  type: 'input'  }, { pin: 14, name: 'B3',  type: 'input'  },
      { pin: 15, name: 'B4',  type: 'input'  }, { pin: 16, name: 'B5',  type: 'input'  },
      { pin: 17, name: 'B6',  type: 'input'  }, { pin: 18, name: 'B7',  type: 'input'  },
      { pin: 19, name: 'EQ',  type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_8BIT_INV',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','B0','B1','B2','B3','B4','B5','B6','B7'],
      outputs: ['EQ'] }],
  },

  // ── 74521: 8 bit Identity Comparator, 20-pin ───────────────────────────────
  /* Sources (verified against datasheet PAGE IMAGES per issues.md C4 — NOT a text summarizer):
     [1] Texas Instruments, "SN54ALS520, SN74ALS518, SN74ALS520, SN74ALS521
         8-Bit Identity Comparators," SDAS224B (orig. Jun. 1982, rev. Nov. 1995).
         [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als521.pdf.
         Verified: terminal diagram (DW/N package, top view) + logic symbol +
         FUNCTION TABLE, pages 1-2, read as 300-dpi rendered PDF page images.
         Confirms the SN74ALS521: INTERLEAVED P/Q inputs (P0,Q0,P1,Q1,... not two
         grouped runs); the INVERTING /(P=Q) output (LOW when equal); TOTEM-POLE
         output (disabled -> HIGH, not high-Z); NO input pull-up resistors (unlike
         the 'ALS520, which has 20k pull-ups); "SN74ALS521 is identical to 'ALS688."
     [2] Fairchild Semiconductor, "74F521 8-Bit Identity Comparator," DS009545
         (orig. Apr. 1988, rev. Oct. 2000). [Online]. Available:
         https://media.digikey.com/pdf/data%20sheets/fairchild%20pdfs/74f521.pdf.
         Verified: connection diagram + truth table + unit-loading table, pages
         1-2, as PDF page images. Second-source cross-check using A/B naming:
         identical interleaved DIP-20 map, active-LOW output, active-LOW enable /
         expansion input, totem-pole drive (I_OH/I_OL = -1 mA / 20 mA -> push-pull,
         not open-collector).
     The prior entry (Wikipedia-only, hand-entered) had the pinout GROUPED (A on
     2-9, B on 11-18), the output polarity backwards (active HIGH), and the output
     type wrong (tri-state); all three were corrected. Gate re-pointed to the
     verified COMPARATOR_8BIT_EQ primitive shared with the identical 74x688. See
     issues.md C102. */
  '74x521': {
    name: '74x521', simpleName: '8 bit Identity Comparator',
    description: '8-bit identity comparator, active-LOW enable, totem-pole out (20-pin)',/* [1][2] */
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als521.pdf',
    tags: ['comparator', '8 bit', 'identity', 'equality'],
    guideOverview: 'The 74x521 compares two 8 bit words, A (A0-A7) and B (B0-B7), and tells you one thing: whether they are exactly equal. Its single output goes LOW when every bit of A matches the matching bit of B and the enable is LOW; any mismatch, or a disabled chip, leaves it HIGH. It tests equality only there is no greater-than or less-than output, which is what makes it an identity comparator rather than a full magnitude comparator. The output is totem-pole, so it drives the line both ways and needs no pull-up resistor, and the chip has no built-in input pull-ups (that is the one thing separating it from the otherwise identical 74x520). The classic job is address decoding: put the address bus on A, fix B to a chosen address, and the output drops LOW to select a device the moment the bus lands on that address. Two things catch people out both the output and the enable are active LOW, and the A and B pins are interleaved down the package (A0, B0, A1, B1, and so on) rather than grouped, so check the pinout before wiring.',/* [1][2] */
    guidePinDescriptions: {
      'G1n': 'Enable, active LOW (pin 1). The output only responds while this pin is LOW; hold it HIGH and the output is forced HIGH no matter what A and B are. It doubles as an expansion input for chaining chips (see below).',
      'A0':  'Word A input, bit 0 (pin 2).',
      'B0':  'Word B input, bit 0 (pin 3).',
      'A1':  'Word A input, bit 1 (pin 4).',
      'B1':  'Word B input, bit 1 (pin 5).',
      'A2':  'Word A input, bit 2 (pin 6).',
      'B2':  'Word B input, bit 2 (pin 7).',
      'A3':  'Word A input, bit 3 (pin 8).',
      'B3':  'Word B input, bit 3 (pin 9).',
      'GND': 'Ground reference (pin 10).',
      'A4':  'Word A input, bit 4 (pin 11).',
      'B4':  'Word B input, bit 4 (pin 12).',
      'A5':  'Word A input, bit 5 (pin 13).',
      'B5':  'Word B input, bit 5 (pin 14).',
      'A6':  'Word A input, bit 6 (pin 15).',
      'B6':  'Word B input, bit 6 (pin 16).',
      'A7':  'Word A input, bit 7 (pin 17).',
      'B7':  'Word B input, bit 7 (pin 18).',
      'EQn': '<span style="text-decoration:overline">A=B</span> output, active LOW (pin 19). Goes LOW only when A equals B and the enable is LOW; HIGH otherwise. Totem-pole output, so it needs no pull-up resistor.',
      'VCC': 'Positive supply (+5 V) at pin 20.',
    },
    guideSections: [
      {
        title: 'How the comparison works',
        paragraphs: [
          'Inside, the chip compares A and B one bit at a time: A0 against B0, A1 against B1, and so on up to A7 against B7. A pair "agrees" when both bits are the same, both HIGH or both LOW. Only when all eight pairs agree does the chip call the two words equal.',
          'The result appears on a single output, and it is active LOW: a match pulls the output down to LOW (0 V), while any mismatch leaves it HIGH. This is the opposite of what many people expect, so it is worth saying twice: LOW means equal.',
          'The enable gates the whole thing. While the enable is LOW the output reflects the comparison. Take the enable HIGH and the output is forced HIGH regardless of A and B, which lets you switch a comparator off or chain several of them (more on that below).',
        ],
        formulas: [
          'output is LOW  only when  enable = LOW  AND  A0..A7 equals B0..B7',
          'enable=LOW,  A equals B     -> output = LOW',
          'enable=LOW,  A not equal B  -> output = HIGH',
          'enable=HIGH, anything       -> output = HIGH',
        ],
      },
      {
        title: 'Address decoding and cascading',
        paragraphs: [
          'The most common job for a 74x521 is spotting when an address bus points at one particular device. Wire the address lines to A0-A7, set B0-B7 to the address you want to catch (with pull-up and pull-down resistors or a DIP switch), and when the bus matches your fixed pattern the output goes LOW. That LOW can drive a chip-select input directly, since chip-selects are almost always active LOW too.',
          'The enable doubles as an expansion input, which is how you compare words wider than 8 bits. Chain chips by feeding one chip’s output into the next chip’s enable: the second chip only reports a match when its own eight bits agree AND the first chip already saw its eight bits agree. Two 74x521s in a row compare 16 bits, three compare 24, and so on. Tie the first chip’s enable LOW to start the chain.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Address decoding and chip-select generation in CPU and memory systems.',
          'Matching an address or data bus against a value set on a DIP switch.',
          'Checking whether two 8 bit buses are carrying the same value.',
          'Comparing words wider than 8 bits by chaining chips through the enable/expansion input.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'The output is active LOW. A match gives you LOW, not HIGH the opposite of what most people expect.',
          'The enable is active LOW too. Tie it to ground to keep the comparison live; leave it HIGH and the output sits HIGH forever.',
          'The A and B pins interleave down the package: A0=2, B0=3, A1=4, B1=5, and after GND, A4=11, B4=12, and so on. They are not two tidy groups, and this is the easiest place to miswire the chip.',
          'It reports equality only there is no greater-than or less-than output. For magnitude comparison use a full comparator such as the 4 bit 74x85, or the 74x682/74x684 family (which add a P>Q output).',
          'The 74x521 has NO input pull-up resistors; the otherwise identical 74x520 adds 20 kOhm pull-ups on the inputs. It is also functionally identical to the 74x688.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'B0',  type: 'input'  }, { pin:  4, name: 'A1',  type: 'input'  },
      { pin:  5, name: 'B1',  type: 'input'  }, { pin:  6, name: 'A2',  type: 'input'  },
      { pin:  7, name: 'B2',  type: 'input'  }, { pin:  8, name: 'A3',  type: 'input'  },
      { pin:  9, name: 'B3',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'A4',  type: 'input'  }, { pin: 12, name: 'B4',  type: 'input'  },
      { pin: 13, name: 'A5',  type: 'input'  }, { pin: 14, name: 'B5',  type: 'input'  },
      { pin: 15, name: 'A6',  type: 'input'  }, { pin: 16, name: 'B6',  type: 'input'  },
      { pin: 17, name: 'A7',  type: 'input'  }, { pin: 18, name: 'B7',  type: 'input'  },
      { pin: 19, name: 'EQn', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'COMPARATOR_8BIT_EQ',
      inputs:  ['A0','A1','A2','A3','A4','A5','A6','A7','B0','B1','B2','B3','B4','B5','B6','B7','G1n'],
      outputs: ['EQn'] }],
  },

  // ── 74522: 8 bit Comparator Inverting (OC, pull up), 20-pin ────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  '74x522': {
    name: '74x522', simpleName: '8 bit Comparator Inverting (OC, pull up)',
    description: '8 bit inverting comparator, 20k pull-ups, open collector out (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true,
    tags: ['comparator', '8 bit', 'inverting', 'open collector'],
    guideOverview: 'The 74x522 combines the inverting (active HIGH EQ) output style, on chip 20 kΩ input pull ups, and an open collector output. With open collector, multiple 74x522s can be wired together: EQ is HIGH on the wired OR bus only when any one comparator sees equality (when G1 is asserted and A equals B).',
    guidePinDescriptions: {
      'G1n': 'Enable (active LOW).',
      'A0':  'Data bus A, bit 0.',
      'A1':  'Data bus A, bit 1.',
      'A2':  'Data bus A, bit 2.',
      'A3':  'Data bus A, bit 3.',
      'A4':  'Data bus A, bit 4.',
      'A5':  'Data bus A, bit 5.',
      'A6':  'Data bus A, bit 6.',
      'A7':  'Data bus A, bit 7.',
      'GND': 'Ground reference (pin 10).',
      'B0':  'Data bus B, bit 0.',
      'B1':  'Data bus B, bit 1.',
      'B2':  'Data bus B, bit 2.',
      'B3':  'Data bus B, bit 3.',
      'B4':  'Data bus B, bit 4.',
      'B5':  'Data bus B, bit 5.',
      'B6':  'Data bus B, bit 6.',
      'B7':  'Data bus B, bit 7.',
      'EQ':  'Equal output (active HIGH, open collector). HIGH (via pull up) when A=B and G1 (active LOW) is asserted.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'OC Wired OR Match',
        paragraphs: [
          'Connect multiple 74x522 EQ outputs together with a single pull up resistor to form a priority or multi source match detector any comparator asserting equality pulls the bus HIGH.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'A6',  type: 'input'  },
      { pin:  9, name: 'A7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'B0',  type: 'input'  }, { pin: 12, name: 'B1',  type: 'input'  },
      { pin: 13, name: 'B2',  type: 'input'  }, { pin: 14, name: 'B3',  type: 'input'  },
      { pin: 15, name: 'B4',  type: 'input'  }, { pin: 16, name: 'B5',  type: 'input'  },
      { pin: 17, name: 'B6',  type: 'input'  }, { pin: 18, name: 'B7',  type: 'input'  },
      { pin: 19, name: 'EQ',  type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_8BIT_INV_OC',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','B0','B1','B2','B3','B4','B5','B6','B7'],
      outputs: ['EQ'] }],
  },

  // ── 74524: 8 bit Registered Comparator (OC), 20-pin ────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  '74x524': {
    name: '74x524', simpleName: '8 bit Registered Comparator (OC)',
    description: '8 bit registered identity comparator with open collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true, sequential: true,
    tags: ['comparator', '8 bit', 'registered', 'open collector'],
    guideOverview: 'The 74x524 is an 8 bit registered identity comparator: the A inputs are clocked into internal flip flops on the rising CLK edge, then continuously compared with the live B inputs. EQ (active LOW) is asserted when the stored A value matches B and G1 (active LOW) is asserted. This allows comparing a stored reference value against a changing bus without external registers.',
    guidePinDescriptions: {
      'CLK': 'Clock (rising edge). Latches A[7:0] into internal register.',
      'A0':  'Data bus A, bit 0 (registered on CLK).',
      'A1':  'Data bus A, bit 1.',
      'A2':  'Data bus A, bit 2.',
      'A3':  'Data bus A, bit 3.',
      'A4':  'Data bus A, bit 4.',
      'A5':  'Data bus A, bit 5.',
      'A6':  'Data bus A, bit 6.',
      'A7':  'Data bus A, bit 7.',
      'GND': 'Ground reference (pin 10).',
      'B0':  'Data bus B, bit 0 (live comparison input).',
      'B1':  'Data bus B, bit 1.',
      'B2':  'Data bus B, bit 2.',
      'B3':  'Data bus B, bit 3.',
      'B4':  'Data bus B, bit 4.',
      'B5':  'Data bus B, bit 5.',
      'B6':  'Data bus B, bit 6.',
      'B7':  'Data bus B, bit 7.',
      'EQn': '<span style="text-decoration:overline">EQ</span> Equal output (active LOW, open collector).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Registered Reference Comparator',
        paragraphs: [
          'Load a reference value onto the A bus and clock it in once. Then the chip continuously reports whether the B bus equals that stored reference without needing an external register chip.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'A6',  type: 'input'  },
      { pin:  9, name: 'A7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'B0',  type: 'input'  }, { pin: 12, name: 'B1',  type: 'input'  },
      { pin: 13, name: 'B2',  type: 'input'  }, { pin: 14, name: 'B3',  type: 'input'  },
      { pin: 15, name: 'B4',  type: 'input'  }, { pin: 16, name: 'B5',  type: 'input'  },
      { pin: 17, name: 'B6',  type: 'input'  }, { pin: 18, name: 'B7',  type: 'input'  },
      { pin: 19, name: 'EQn', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_8BIT_REG_OC',
      inputs:  ['CLK','A0','A1','A2','A3','A4','A5','A6','A7','B0','B1','B2','B3','B4','B5','B6','B7'],
      outputs: ['EQn'] }],
  },

  // ── 74531: Octal Transparent Latch (3-state), 20-pin ───────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x531': {
    name: '74x531', simpleName: 'Octal Transparent Latch (3-state)',
    description: 'Octal transparent latch with three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['latch', 'octal', 'transparent', 'tri state'],
    guideOverview: 'The 74x531 is an octal transparent latch with tri state outputs. When LE (Latch Enable) is HIGH, outputs follow inputs (transparent mode). When LE goes LOW, inputs are captured and held. OEn independently controls output drive. This is the non inverting variant of the 74x533/535 family.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW). When HIGH, Q0-Q7 are tri stated.',
      'D0':  'Data input 0.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'D7':  'Data input 7.',
      'GND': 'Ground reference (pin 10).',
      'LE':  'Latch Enable. HIGH = transparent; LOW = latch (hold).',
      'Q0':  'Output 0.',
      'Q1':  'Output 1.',
      'Q2':  'Output 2.',
      'Q3':  'Output 3.',
      'Q4':  'Output 4.',
      'Q5':  'Output 5.',
      'Q6':  'Output 6.',
      'Q7':  'Output 7.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Transparent Latch vs Edge Triggered Register',
        paragraphs: [
          'A transparent latch is level sensitive: while LE is HIGH, data passes through. An edge triggered register (74x532/536) captures data only on the clock edge. Latches are more susceptible to glitches during the enable phase.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  }, { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  }, { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  }, { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  }, { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'LE',  type: 'input'  }, { pin: 12, name: 'Q0',  type: 'output' },
      { pin: 13, name: 'Q1',  type: 'output' }, { pin: 14, name: 'Q2',  type: 'output' },
      { pin: 15, name: 'Q3',  type: 'output' }, { pin: 16, name: 'Q4',  type: 'output' },
      { pin: 17, name: 'Q5',  type: 'output' }, { pin: 18, name: 'Q6',  type: 'output' },
      { pin: 19, name: 'Q7',  type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'LATCH_OCTAL_TRI',
      inputs:  ['OEn','LE','D0','D1','D2','D3','D4','D5','D6','D7'],
      outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] }],
  },

  // ── 74532: Octal Register (3-state), 20-pin ────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x532': {
    name: '74x532', simpleName: 'Octal Register (3-state)',
    description: 'Octal D type register (edge triggered FF) with three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['register', 'octal', 'flip flop', 'tri state'],
    guideOverview: 'The 74x532 is an octal D type edge triggered register (8 flip flops) with tri state outputs. All 8 data inputs are clocked on the shared CLK rising edge. OEn tri states the outputs for bus sharing. This is the non inverting counterpart to 74x534.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW).',
      'D0':  'Data input 0.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'D7':  'Data input 7.',
      'GND': 'Ground reference (pin 10).',
      'CLK': 'Clock (rising edge). Captures D0-D7.',
      'Q0':  'Output 0.',
      'Q1':  'Output 1.',
      'Q2':  'Output 2.',
      'Q3':  'Output 3.',
      'Q4':  'Output 4.',
      'Q5':  'Output 5.',
      'Q6':  'Output 6.',
      'Q7':  'Output 7.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Octal Bus Register',
        paragraphs: [
          'The 74x532 captures an 8 bit bus snapshot on each clock edge. It is commonly used as a pipeline register, address latch, or I/O port latch in microprocessor bus interfaces.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  }, { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  }, { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  }, { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  }, { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'CLK', type: 'input'  }, { pin: 12, name: 'Q0',  type: 'output' },
      { pin: 13, name: 'Q1',  type: 'output' }, { pin: 14, name: 'Q2',  type: 'output' },
      { pin: 15, name: 'Q3',  type: 'output' }, { pin: 16, name: 'Q4',  type: 'output' },
      { pin: 17, name: 'Q5',  type: 'output' }, { pin: 18, name: 'Q6',  type: 'output' },
      { pin: 19, name: 'Q7',  type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'REG_OCTAL_TRI',
      inputs:  ['OEn','CLK','D0','D1','D2','D3','D4','D5','D6','D7'],
      outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] }],
  },

  // ── 74533: Octal D type Latch Inverting (3-state), 20-pin ──────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x533': {
    name: '74x533', simpleName: 'Octal D type Latch Inverting (3-state)',
    description: 'Octal D type transparent latch, inverting outputs, 3-state (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['latch', 'octal', 'transparent', 'inverting', 'tri state'],    guideOverview: 'The 74x533 is an octal transparent latch with inverting (active LOW) outputs. When LE is HIGH outputs follow inverted inputs; when LE goes LOW data is held. OEn tri states all outputs. Equivalent to 74x531 with a built in inversion stage on each output.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW).',
      'D0':  'Data input 0.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'D7':  'Data input 7.',
      'GND': 'Ground reference (pin 10).',
      'LE':  'Latch Enable. HIGH = transparent; LOW = hold.',
      'Q0n': 'Inverted output 0.',
      'Q1n': 'Inverted output 1.',
      'Q2n': 'Inverted output 2.',
      'Q3n': 'Inverted output 3.',
      'Q4n': 'Inverted output 4.',
      'Q5n': 'Inverted output 5.',
      'Q6n': 'Inverted output 6.',
      'Q7n': 'Inverted output 7.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x533 vs 74x535',
        paragraphs: [
          'Both are inverting octal latches with tri state outputs. They are functionally identical choose based on package or availability.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  }, { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  }, { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  }, { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  }, { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'LE',  type: 'input'  }, { pin: 12, name: 'Q0n', type: 'output' },
      { pin: 13, name: 'Q1n', type: 'output' }, { pin: 14, name: 'Q2n', type: 'output' },
      { pin: 15, name: 'Q3n', type: 'output' }, { pin: 16, name: 'Q4n', type: 'output' },
      { pin: 17, name: 'Q5n', type: 'output' }, { pin: 18, name: 'Q6n', type: 'output' },
      { pin: 19, name: 'Q7n', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'LATCH_OCTAL_INV_TRI',
      inputs:  ['OEn','LE','D0','D1','D2','D3','D4','D5','D6','D7'],
      outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n'] }],
  },

  // ── 74534: Octal D type FF Inverting (3-state), 20-pin ─────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x534': {
    name: '74x534', simpleName: 'Octal D type FF Inverting (3-state)',
    description: 'Octal D type edge triggered FF, inverting outputs, 3-state (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['register', 'octal', 'flip flop', 'inverting', 'tri state'],    guideOverview: 'The 74x534 is an octal D type edge triggered register with inverting outputs. Data is captured on the rising CLK edge; each Q output presents the complement of the captured D input. OEn tri states all outputs. The inverting output is useful when subsequent logic needs an active LOW data bus.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW).',
      'D0':  'Data input 0.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'D7':  'Data input 7.',
      'GND': 'Ground reference (pin 10).',
      'CLK': 'Clock (rising edge).',
      'Q0n': 'Inverted output 0.',
      'Q1n': 'Inverted output 1.',
      'Q2n': 'Inverted output 2.',
      'Q3n': 'Inverted output 3.',
      'Q4n': 'Inverted output 4.',
      'Q5n': 'Inverted output 5.',
      'Q6n': 'Inverted output 6.',
      'Q7n': 'Inverted output 7.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x532 vs 74x534',
        paragraphs: [
          '74x532 has non inverting outputs (Q = captured D); 74x534 has inverting outputs (Q = complement of captured D). Same clock and OE structure.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  }, { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  }, { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  }, { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  }, { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'CLK', type: 'input'  }, { pin: 12, name: 'Q0n', type: 'output' },
      { pin: 13, name: 'Q1n', type: 'output' }, { pin: 14, name: 'Q2n', type: 'output' },
      { pin: 15, name: 'Q3n', type: 'output' }, { pin: 16, name: 'Q4n', type: 'output' },
      { pin: 17, name: 'Q5n', type: 'output' }, { pin: 18, name: 'Q6n', type: 'output' },
      { pin: 19, name: 'Q7n', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'REG_OCTAL_INV_TRI',
      inputs:  ['OEn','CLK','D0','D1','D2','D3','D4','D5','D6','D7'],
      outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n'] }],
  },

  // ── 74535: Octal Transparent Latch Inverting (3-state), 20-pin ─────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x535': {
    name: '74x535', simpleName: 'Octal Transparent Latch Inverting (3-state)',
    description: 'Octal transparent latch with inverting three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['latch', 'octal', 'transparent', 'inverting', 'tri state'],    guideOverview: 'The 74x535 is an octal transparent latch with inverting tri state outputs, functionally equivalent to the 74x533. LE HIGH = transparent (outputs = /D); LE LOW = hold. OEn tri states the outputs.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW).',
      'D0':  'Data input 0.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'D7':  'Data input 7.',
      'GND': 'Ground reference (pin 10).',
      'LE':  'Latch Enable. HIGH = transparent; LOW = hold.',
      'Q0n': 'Inverted output 0.',
      'Q1n': 'Inverted output 1.',
      'Q2n': 'Inverted output 2.',
      'Q3n': 'Inverted output 3.',
      'Q4n': 'Inverted output 4.',
      'Q5n': 'Inverted output 5.',
      'Q6n': 'Inverted output 6.',
      'Q7n': 'Inverted output 7.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Inverting Transparent Latch',
        paragraphs: [
          'Use for bus inversion with hold capability. When LE is HIGH, outputs are continuously /D; pulling LE LOW freezes the inverted data regardless of subsequent D input changes.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  }, { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  }, { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  }, { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  }, { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'LE',  type: 'input'  }, { pin: 12, name: 'Q0n', type: 'output' },
      { pin: 13, name: 'Q1n', type: 'output' }, { pin: 14, name: 'Q2n', type: 'output' },
      { pin: 15, name: 'Q3n', type: 'output' }, { pin: 16, name: 'Q4n', type: 'output' },
      { pin: 17, name: 'Q5n', type: 'output' }, { pin: 18, name: 'Q6n', type: 'output' },
      { pin: 19, name: 'Q7n', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'LATCH_OCTAL_INV_TRI',
      inputs:  ['OEn','LE','D0','D1','D2','D3','D4','D5','D6','D7'],
      outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n'] }],
  },

  // ── 74536: Octal Register Inverting (3-state), 20-pin ──────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x536': {
    name: '74x536', simpleName: 'Octal Register Inverting (3-state)',
    description: 'Octal D type register with inverting three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['register', 'octal', 'flip flop', 'inverting', 'tri state'],    guideOverview: 'The 74x536 is an octal D type edge triggered register with inverting outputs, functionally equivalent to the 74x534. Data captured on CLK rising edge is presented inverted at Q0n-Q7n. OEn tri states all outputs.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW).',
      'D0':  'Data input 0.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'D7':  'Data input 7.',
      'GND': 'Ground reference (pin 10).',
      'CLK': 'Clock (rising edge).',
      'Q0n': 'Inverted output 0.',
      'Q1n': 'Inverted output 1.',
      'Q2n': 'Inverted output 2.',
      'Q3n': 'Inverted output 3.',
      'Q4n': 'Inverted output 4.',
      'Q5n': 'Inverted output 5.',
      'Q6n': 'Inverted output 6.',
      'Q7n': 'Inverted output 7.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Inverting Octal Register',
        paragraphs: [
          'Select 74x536 over 74x534 when the downstream bus uses the same polarity convention and no separate inverter stage is desired in the signal path.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  }, { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  }, { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  }, { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  }, { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'CLK', type: 'input'  }, { pin: 12, name: 'Q0n', type: 'output' },
      { pin: 13, name: 'Q1n', type: 'output' }, { pin: 14, name: 'Q2n', type: 'output' },
      { pin: 15, name: 'Q3n', type: 'output' }, { pin: 16, name: 'Q4n', type: 'output' },
      { pin: 17, name: 'Q5n', type: 'output' }, { pin: 18, name: 'Q6n', type: 'output' },
      { pin: 19, name: 'Q7n', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'REG_OCTAL_INV_TRI',
      inputs:  ['OEn','CLK','D0','D1','D2','D3','D4','D5','D6','D7'],
      outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n'] }],
  },

  // ── 74537: BCD to Decimal Decoder (3-state), 20-pin ────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x537': {
    name: '74x537', simpleName: 'BCD to Decimal Decoder (3-state)',
    description: '4-to-10 line BCD to decimal decoder with three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    tags: ['decoder', 'bcd', 'decimal', 'tri state'],
    guideOverview: 'The 74x537 is a 4-to-10 BCD to decimal decoder with tri state outputs. For each valid BCD input (0-9), exactly one of Y0-Y9 is driven HIGH; invalid codes (10-15) produce all outputs LOW. OEn tri states all outputs. Unlike most decoders in this family, the outputs are active HIGH.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW). When HIGH, all Y outputs are tri stated.',
      'A':   'BCD input bit A (weight 1, LSB).',
      'B':   'BCD input bit B (weight 2).',
      'C':   'BCD input bit C (weight 4).',
      'D':   'BCD input bit D (weight 8, MSB).',
      'Y0':  'Output 0 (active HIGH). HIGH when BCD input = 0.',
      'Y1':  'Output 1. HIGH when BCD = 1.',
      'Y2':  'Output 2. HIGH when BCD = 2.',
      'Y3':  'Output 3. HIGH when BCD = 3.',
      'GND': 'Ground reference (pin 10).',
      'Y4':  'Output 4. HIGH when BCD = 4.',
      'Y5':  'Output 5. HIGH when BCD = 5.',
      'Y6':  'Output 6. HIGH when BCD = 6.',
      'Y7':  'Output 7. HIGH when BCD = 7.',
      'Y8':  'Output 8. HIGH when BCD = 8.',
      'Y9':  'Output 9. HIGH when BCD = 9.',
      'NC1': 'No connect.',
      'NC2': 'No connect.',
      'NC3': 'No connect.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'BCD to One of Ten Decode',
        paragraphs: [
          'Drive 10 individual LEDs or relay drivers directly one per decimal digit. The tri state outputs allow multiple decoders to share an output bus, enabled by OEn.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  }, { pin:  2, name: 'A',   type: 'input'  },
      { pin:  3, name: 'B',   type: 'input'  }, { pin:  4, name: 'C',   type: 'input'  },
      { pin:  5, name: 'D',   type: 'input'  }, { pin:  6, name: 'Y0',  type: 'output' },
      { pin:  7, name: 'Y1',  type: 'output' }, { pin:  8, name: 'Y2',  type: 'output' },
      { pin:  9, name: 'Y3',  type: 'output' }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'Y4',  type: 'output' }, { pin: 12, name: 'Y5',  type: 'output' },
      { pin: 13, name: 'Y6',  type: 'output' }, { pin: 14, name: 'Y7',  type: 'output' },
      { pin: 15, name: 'Y8',  type: 'output' }, { pin: 16, name: 'Y9',  type: 'output' },
      { pin: 17, name: 'NC1', type: 'nc'    }, { pin: 18, name: 'NC2', type: 'nc'    },
      { pin: 19, name: 'NC3', type: 'nc'    }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'BCD_DECIMAL_DEC_TRI',
      inputs:  ['OEn','A','B','C','D'],
      outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9'] }],
  },

};
// end of CHIPS_BLOCK_29
