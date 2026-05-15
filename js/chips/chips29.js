// chips29.js - Chips Block 29: 74518-74537
export const CHIPS_BLOCK_29 = {

  // ── 74518: 8 bit Comparator (OC, pull up), 20-pin ──────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  '74518': {
    name: '74x518', simpleName: '8 bit Comparator (OC, pull up)',
    description: '8 bit identity comparator with 20 kohm pull up inputs and open-collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true,
    tags: ['comparator', '8 bit', 'open-collector'],    guideOverview: 'The 74x518 is an 8 bit identity comparator with on-chip 20 kΩ pull up resistors on all data inputs and an open-collector EQ (active LOW) output. EQ is asserted LOW when A[7:0] equals B[7:0] and G1 (active LOW) is asserted. The built in pull ups simplify interfacing with passive bus holders or CMOS devices.',
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
      'EQn': '<span style="text-decoration:overline">EQ</span> — Equal output (active LOW, open-collector). Asserted when A=B and G1 (active LOW) is asserted.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Open Collector Wired AND',
        paragraphs: [
          'With open-collector outputs, multiple 74x518 outputs can be tied together. The combined output is LOW only when ALL comparators agree on equality useful for comparing 16- or 32 bit buses by chaining chips.',
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
  '74519': {
    name: '74x519', simpleName: '8 bit Comparator (OC)',
    description: '8 bit identity comparator with open-collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true,
    tags: ['comparator', '8 bit', 'open-collector'],
    guideOverview: 'The 74x519 is an 8 bit identity comparator with an open-collector EQ (active LOW) output, identical in function to the 74x518 but without the internal 20 kΩ pull up resistors. Use when the bus pull ups are provided externally or bus drive levels are different.',
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
      'EQn': '<span style="text-decoration:overline">EQ</span> — Equal output (active LOW, open-collector).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x518 vs 74x519',
        paragraphs: [
          '74x518 includes on-chip 20 kΩ pull ups on A and B inputs; 74x519 does not. Both have identical open-collector EQn outputs. Choose based on whether the bus already has pull ups in place.',
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
  '74520': {
    name: '74x520', simpleName: '8 bit Comparator Inverting (pull up)',
    description: '8 bit inverting comparator with 20 kohm pull up inputs, three-state output (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    tags: ['comparator', '8 bit', 'inverting'],    guideOverview: 'The 74x520 is an 8 bit identity comparator with inverted (active HIGH) EQ output and on-chip 20 kΩ pull up inputs. EQ goes HIGH when A equals B and G1 (active LOW) is asserted. Use when downstream logic expects a positive (active HIGH) equality signal.',
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
      'EQ':  'Equal output (active HIGH, tri-state). HIGH when A=B and G1 (active LOW) is asserted.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Inverting Output Comparator',
        paragraphs: [
          'The 74x520 and 74x521 both produce active HIGH (non-inverting sense) EQ outputs unlike the 74x518/519 which produce active LOW EQn. The tri-state output allows bus sharing.',
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

  // ── 74521: 8 bit Comparator Inverting, 20-pin ──────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74521': {
    name: '74x521', simpleName: '8 bit Comparator Inverting',
    description: '8 bit inverting identity comparator with three-state output (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    tags: ['comparator', '8 bit', 'inverting'],
    guideOverview: 'The 74x521 is identical in function to the 74x520 but without on-chip pull up resistors. It compares two 8 bit buses and drives EQ HIGH when A=B and G1 (active LOW) is asserted, with a tri-state output for shared bus applications.',
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
      'EQ':  'Equal output (active HIGH, tri-state).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '8 bit Equality Detection',
        paragraphs: [
          'Common use: cache tag matching, memory address decode, or any situation where a hardware value must equal a stored reference. Connect A to the address bus and B to a programmed reference to detect a specific address.',
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
    gates: [{ type: 'CMP_8BIT_INV',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','B0','B1','B2','B3','B4','B5','B6','B7'],
      outputs: ['EQ'] }],
  },

  // ── 74522: 8 bit Comparator Inverting (OC, pull up), 20-pin ────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  '74522': {
    name: '74x522', simpleName: '8 bit Comparator Inverting (OC, pull up)',
    description: '8 bit inverting comparator with 20 kohm pull up inputs and open-collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true,
    tags: ['comparator', '8 bit', 'inverting', 'open-collector'],
    guideOverview: 'The 74x522 combines the inverting (active HIGH EQ) output style, on-chip 20 kΩ input pull ups, and an open-collector output. With open-collector, multiple 74x522s can be wired together: EQ is HIGH on the wired OR bus only when any one comparator sees equality (when G1 is asserted and A equals B).',
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
      'EQ':  'Equal output (active HIGH, open-collector). HIGH (via pull up) when A=B and G1 (active LOW) is asserted.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'OC Wired OR Match',
        paragraphs: [
          'Connect multiple 74x522 EQ outputs together with a single pull up resistor to form a priority or multi-source match detector any comparator asserting equality pulls the bus HIGH.',
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
  '74524': {
    name: '74x524', simpleName: '8 bit Registered Comparator (OC)',
    description: '8 bit registered identity comparator with open-collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10, openCollector: true, sequential: true,
    tags: ['comparator', '8 bit', 'registered', 'open-collector'],
    guideOverview: 'The 74x524 is an 8 bit registered identity comparator: the A inputs are clocked into internal flip-flops on the rising CLK edge, then continuously compared with the live B inputs. EQ (active LOW) is asserted when the stored A value matches B and G1 (active LOW) is asserted. This allows comparing a stored reference value against a changing bus without external registers.',
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
      'EQn': '<span style="text-decoration:overline">EQ</span> — Equal output (active LOW, open-collector).',
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

  // ── 74526: 16 bit Identity Comparator (prog), 20-pin ───────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator */
  '74526': {
    name: '74x526', simpleName: '16 bit Identity Comparator (prog)',
    description: '16 bit fuse-programmable identity comparator (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    tags: ['comparator', '16 bit', 'programmable'],
    guideOverview: 'The 74x526 is a 16 bit fuse-programmable identity comparator. Internal fusible links allow each of the 16 input bits to be permanently programmed to compare against a fixed reference (0 or 1). Only A inputs are required; the B reference is burned in at manufacturing time. EQ (active LOW) is asserted when all unprogrammed bits match.',
    guidePinDescriptions: {
      'G1n': 'Enable (active LOW).',
      'A0':  'Address/data input bit 0.',
      'A1':  'Address/data input bit 1.',
      'A2':  'Address/data input bit 2.',
      'A3':  'Address/data input bit 3.',
      'A4':  'Address/data input bit 4.',
      'A5':  'Address/data input bit 5.',
      'A6':  'Address/data input bit 6.',
      'A7':  'Address/data input bit 7.',
      'GND': 'Ground reference (pin 10).',
      'A8':  'Address/data input bit 8.',
      'A9':  'Address/data input bit 9.',
      'A10': 'Address/data input bit 10.',
      'A11': 'Address/data input bit 11.',
      'A12': 'Address/data input bit 12.',
      'A13': 'Address/data input bit 13.',
      'A14': 'Address/data input bit 14.',
      'A15': 'Address/data input bit 15.',
      'EQn': '<span style="text-decoration:overline">EQ</span> — Equal output (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Fuse-Programmable Address Decode',
        paragraphs: [
          'Program the chip at production time to decode a specific 16 bit address. When the address bus matches the programmed pattern and G1n is LOW, EQn pulses LOW to assert chip-select. No external decode logic needed.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'A6',  type: 'input'  },
      { pin:  9, name: 'A7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'A8',  type: 'input'  }, { pin: 12, name: 'A9',  type: 'input'  },
      { pin: 13, name: 'A10', type: 'input'  }, { pin: 14, name: 'A11', type: 'input'  },
      { pin: 15, name: 'A12', type: 'input'  }, { pin: 16, name: 'A13', type: 'input'  },
      { pin: 17, name: 'A14', type: 'input'  }, { pin: 18, name: 'A15', type: 'input'  },
      { pin: 19, name: 'EQn', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_16BIT_PROG',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12','A13','A14','A15'],
      outputs: ['EQn'] }],
  },

  // ── 74527: 8+4 bit Identity Comparator (prog), 20-pin ──────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator */
  '74527': {
    name: '74x527', simpleName: '8+4 bit Identity Comparator (prog)',
    description: '8 bit programmable + 4 bit conventional fuse-programmable identity comparator (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    tags: ['comparator', '12 bit', 'programmable'],    guideOverview: 'The 74x527 is a hybrid 12 bit comparator: 8 bits are fuse-programmable (A0-A7 compared against burned-in reference), while 4 bits are conventional live-compare (A8-A11 compared against live B8-B11 inputs). EQ (active LOW) is asserted when both halves match and G1 (active LOW) is asserted. This allows a fixed upper byte address decode combined with a variable lower nibble.',
    guidePinDescriptions: {
      'G1n': 'Enable (active LOW).',
      'A0':  'Programmable bit 0 (compared vs burned-in reference).',
      'A1':  'Programmable bit 1.',
      'A2':  'Programmable bit 2.',
      'A3':  'Programmable bit 3.',
      'A4':  'Programmable bit 4.',
      'A5':  'Programmable bit 5.',
      'A6':  'Programmable bit 6.',
      'A7':  'Programmable bit 7.',
      'GND': 'Ground reference (pin 10).',
      'B8':  'Live compare input for bit 8.',
      'B9':  'Live compare input for bit 9.',
      'B10': 'Live compare input for bit 10.',
      'B11': 'Live compare input for bit 11.',
      'A8':  'Conventional bit 8 (compared vs B8).',
      'A9':  'Conventional bit 9 (compared vs B9).',
      'A10': 'Conventional bit 10.',
      'A11': 'Conventional bit 11.',
      'EQn': '<span style="text-decoration:overline">EQ</span> — Equal output (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Hybrid Programmable/Conventional Compare',
        paragraphs: [
          'Burn the upper 8 bits to match a page address; connect the lower 4 bits (B8-B11 vs A8-A11) for flexible sub-page selection. EQn is only LOW when both the programmed and live portions match simultaneously.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'A6',  type: 'input'  },
      { pin:  9, name: 'A7',  type: 'input'  }, { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'B8',  type: 'input'  }, { pin: 12, name: 'B9',  type: 'input'  },
      { pin: 13, name: 'B10', type: 'input'  }, { pin: 14, name: 'B11', type: 'input'  },
      { pin: 15, name: 'A8',  type: 'input'  }, { pin: 16, name: 'A9',  type: 'input'  },
      { pin: 17, name: 'A10', type: 'input'  }, { pin: 18, name: 'A11', type: 'input'  },
      { pin: 19, name: 'EQn', type: 'output' }, { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_12BIT_PROG',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','B8','B9','B10','B11'],
      outputs: ['EQn'] }],
  },

  // ── 74528: 12 bit Identity Comparator (prog), 16-pin ───────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Digital_comparator */
  '74528': {
    name: '74x528', simpleName: '12 bit Identity Comparator (prog)',
    description: '12 bit fuse-programmable identity comparator (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    tags: ['comparator', '12 bit', 'programmable'],    guideOverview: 'The 74x528 is a 12 bit fuse-programmable identity comparator in a 16-pin package. All 12 comparison bits are fuse-programmable against fixed burned-in references; no B inputs are brought out to pins. EQ (active LOW) is asserted when A[11:0] matches the programmed pattern and G1 (active LOW) is asserted.',
    guidePinDescriptions: {
      'G1n': 'Enable (active LOW).',
      'A0':  'Input bit 0.',
      'A1':  'Input bit 1.',
      'A2':  'Input bit 2.',
      'A3':  'Input bit 3.',
      'A4':  'Input bit 4.',
      'A5':  'Input bit 5.',
      'GND': 'Ground reference (pin 8).',
      'A6':  'Input bit 6.',
      'A7':  'Input bit 7.',
      'A8':  'Input bit 8.',
      'A9':  'Input bit 9.',
      'A10': 'Input bit 10.',
      'A11': 'Input bit 11.',
      'EQn': '<span style="text-decoration:overline">EQ</span> — Equal output (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Compact 12 bit Address Match',
        paragraphs: [
          'The 16-pin form factor fits a 12 bit address decoder into minimal board space. Program the device during PCB fabrication to match a specific address range.',
        ],
      },
    ],    pinout: [
      { pin:  1, name: 'G1n', type: 'input'  }, { pin:  2, name: 'A0',  type: 'input'  },
      { pin:  3, name: 'A1',  type: 'input'  }, { pin:  4, name: 'A2',  type: 'input'  },
      { pin:  5, name: 'A3',  type: 'input'  }, { pin:  6, name: 'A4',  type: 'input'  },
      { pin:  7, name: 'A5',  type: 'input'  }, { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'A6',  type: 'input'  }, { pin: 10, name: 'A7',  type: 'input'  },
      { pin: 11, name: 'A8',  type: 'input'  }, { pin: 12, name: 'A9',  type: 'input'  },
      { pin: 13, name: 'A10', type: 'input'  }, { pin: 14, name: 'A11', type: 'input'  },
      { pin: 15, name: 'EQn', type: 'output' }, { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [{ type: 'CMP_12BIT_OC',
      inputs:  ['G1n','A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11'],
      outputs: ['EQn'] }],
  },

  // ── 74531: Octal Transparent Latch (3-state), 20-pin ───────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74531': {
    name: '74x531', simpleName: 'Octal Transparent Latch (3-state)',
    description: 'Octal transparent latch with three-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['latch', 'octal', 'transparent', 'tri-state'],
    guideOverview: 'The 74x531 is an octal transparent latch with tri-state outputs. When LE (Latch Enable) is HIGH, outputs follow inputs (transparent mode). When LE goes LOW, inputs are captured and held. OEn independently controls output drive. This is the non-inverting variant of the 74x533/535 family.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW). When HIGH, Q0-Q7 are tri-stated.',
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
        title: 'Transparent Latch vs Edge-Triggered Register',
        paragraphs: [
          'A transparent latch is level-sensitive: while LE is HIGH, data passes through. An edge-triggered register (74x532/536) captures data only on the clock edge. Latches are more susceptible to glitches during the enable phase.',
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
  '74532': {
    name: '74x532', simpleName: 'Octal Register (3-state)',
    description: 'Octal D-type register (edge-triggered FF) with three-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['register', 'octal', 'flip-flop', 'tri-state'],
    guideOverview: 'The 74x532 is an octal D-type edge-triggered register (8 flip-flops) with tri-state outputs. All 8 data inputs are clocked on the shared CLK rising edge. OEn tri-states the outputs for bus sharing. This is the non-inverting counterpart to 74x534.',
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

  // ── 74533: Octal D-type Latch Inverting (3-state), 20-pin ──────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74533': {
    name: '74x533', simpleName: 'Octal D-type Latch Inverting (3-state)',
    description: 'Octal D-type transparent latch with inverting outputs and three-state output enable (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['latch', 'octal', 'transparent', 'inverting', 'tri-state'],    guideOverview: 'The 74x533 is an octal transparent latch with inverting (active LOW) outputs. When LE is HIGH outputs follow inverted inputs; when LE goes LOW data is held. OEn tri-states all outputs. Equivalent to 74x531 with a built in inversion stage on each output.',
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
          'Both are inverting octal latches with tri-state outputs. They are functionally identical choose based on package or availability.',
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

  // ── 74534: Octal D-type FF Inverting (3-state), 20-pin ─────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74534': {
    name: '74x534', simpleName: 'Octal D-type FF Inverting (3-state)',
    description: 'Octal D-type edge-triggered flip-flop with inverting outputs, shared clock and OE (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['register', 'octal', 'flip-flop', 'inverting', 'tri-state'],    guideOverview: 'The 74x534 is an octal D-type edge-triggered register with inverting outputs. Data is captured on the rising CLK edge; each Q output presents the complement of the captured D input. OEn tri-states all outputs. The inverting output is useful when subsequent logic needs an active LOW data bus.',
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
          '74x532 has non-inverting outputs (Q = captured D); 74x534 has inverting outputs (Q = complement of captured D). Same clock and OE structure.',
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
  '74535': {
    name: '74x535', simpleName: 'Octal Transparent Latch Inverting (3-state)',
    description: 'Octal transparent latch with inverting three-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['latch', 'octal', 'transparent', 'inverting', 'tri-state'],    guideOverview: 'The 74x535 is an octal transparent latch with inverting tri-state outputs, functionally equivalent to the 74x533. LE HIGH = transparent (outputs = /D); LE LOW = hold. OEn tri-states the outputs.',
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
  '74536': {
    name: '74x536', simpleName: 'Octal Register Inverting (3-state)',
    description: 'Octal D-type register with inverting three-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10, sequential: true,
    tags: ['register', 'octal', 'flip-flop', 'inverting', 'tri-state'],    guideOverview: 'The 74x536 is an octal D-type edge-triggered register with inverting outputs, functionally equivalent to the 74x534. Data captured on CLK rising edge is presented inverted at Q0n-Q7n. OEn tri-states all outputs.',
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
  '74537': {
    name: '74x537', simpleName: 'BCD to Decimal Decoder (3-state)',
    description: '4-to-10 line BCD to decimal decoder with three-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    tags: ['decoder', 'bcd', 'decimal', 'tri-state'],
    guideOverview: 'The 74x537 is a 4-to-10 BCD-to-decimal decoder with tri-state outputs. For each valid BCD input (0-9), exactly one of Y0-Y9 is driven HIGH; invalid codes (10-15) produce all outputs LOW. OEn tri-states all outputs. Unlike most decoders in this family, the outputs are active HIGH.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW). When HIGH, all Y outputs are tri-stated.',
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
        title: 'BCD to One-of-Ten Decode',
        paragraphs: [
          'Drive 10 individual LEDs or relay drivers directly one per decimal digit. The tri-state outputs allow multiple decoders to share an output bus, enabled by OEn.',
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
