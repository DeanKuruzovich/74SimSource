// Chip definitions block 48
// Chips: 74x1073, 74x1074, 74x1181, 74x1240-1245, 74x1280, 74x1284,
//        74x1394, 74x1395, 74x1404, 74x1620, 74x1621

export const CHIPS_BLOCK_48 = {

  // 74x1073: 16 bit bus termination array with bus hold function (20-pin)
  '74x1073': {
    name: '74x1073',
    simpleName: '16 bit Bus Termination with Bus Hold',
    description: '16 bit bus termination array with bus hold function (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74act1073.pdf',
    tags: ['termination', 'bus-hold', 'passive', 'bus', 'stub'],
    guideOverview: 'The 74x1073 is a sixteen line bus hold device for shared digital buses. Each channel contains a weak keeper circuit that remembers the last valid HIGH or LOW level on the line after the active driver releases it, which prevents the trace from floating unpredictably. This kind of part is useful on wide bidirectional buses where you want quiet idle behavior without adding strong pull up or pull down resistors to every signal.',
    guidePinDescriptions: {
      'I0': 'Bus hold channel 0. Connect a shared signal line here so its last logic level is weakly maintained when undriven.',
      'I1': 'Bus hold channel 1. It behaves like I0 for another line on the bus.',
      'I2': 'Bus hold channel 2. Use it for another shared or occasionally floating signal.',
      'I3': 'Bus hold channel 3. This line gets the same keeper action as the others.',
      'I4': 'Bus hold channel 4. It helps keep this line from drifting between active drivers.',
      'I5': 'Bus hold channel 5. Use it on another bidirectional or released control line.',
      'I6': 'Bus hold channel 6. The weak keeper remembers the last valid state on this pin.',
      'I7': 'Bus hold channel 7. This is the eighth lower half bus hold channel.',
      'NC': 'No internal connection. Leave this pin unconnected.',
      'GND': 'Ground reference for the keeper circuitry.',
      'I8': 'Bus hold channel 8. It behaves the same as the lower numbered channels.',
      'I9': 'Bus hold channel 9. Use it to keep another bus line from floating.',
      'I10': 'Bus hold channel 10. This channel weakly maintains the last logic state when the line is released.',
      'I11': 'Bus hold channel 11. Another independent keeper channel.',
      'I12': 'Bus hold channel 12. Use it on a signal that is otherwise left high impedance at times.',
      'I13': 'Bus hold channel 13. This line receives the same weak feedback behavior as the others.',
      'I14': 'Bus hold channel 14. It helps define the idle level of another shared trace.',
      'I15': 'Bus hold channel 15. This is the final keeper channel in the package.',
      'NC2': 'No internal connection. Leave this pin unconnected.',
      'VCC': 'Positive supply for the bus hold circuits.',
    },
    guideSections: [
      {
        title: 'What a Bus Hold Circuit Does',
        paragraphs: [
          'A bus hold circuit is a deliberately weak feedback path that keeps an undriven signal near its previous valid state. It is strong enough to stop a floating line from wandering, but weak enough that the next real driver can override it easily.',
          'That makes it a good fit for data buses, expansion connectors, and multiplexed control lines where ownership changes often and no one wants to burn board space on a resistor network for every bit.',
        ],
      },
      {
        title: 'Why a 16 bit Version Matters',
        paragraphs: [
          'Wide buses benefit from a packaged keeper array because every bit gets consistent behavior. One IC can stabilize an entire 16 bit path, which is cleaner and more repeatable than scattering discrete pull resistors around the board.',
        ],
        note: 'The simulator models this device as a placeholder/documentation part. It records the pinout and role, but it does not emulate the analog strength of the keeper network.',
      },
    ],
    pinout: [
      { pin:  1, name: 'I0',   type: 'bidir' },
      { pin:  2, name: 'I1',   type: 'bidir' },
      { pin:  3, name: 'I2',   type: 'bidir' },
      { pin:  4, name: 'I3',   type: 'bidir' },
      { pin:  5, name: 'I4',   type: 'bidir' },
      { pin:  6, name: 'I5',   type: 'bidir' },
      { pin:  7, name: 'I6',   type: 'bidir' },
      { pin:  8, name: 'I7',   type: 'bidir' },
      { pin:  9, name: 'NC',   type: 'nc'    },
      { pin: 10, name: 'GND',  type: 'power' },
      { pin: 11, name: 'I8',   type: 'bidir' },
      { pin: 12, name: 'I9',   type: 'bidir' },
      { pin: 13, name: 'I10',  type: 'bidir' },
      { pin: 14, name: 'I11',  type: 'bidir' },
      { pin: 15, name: 'I12',  type: 'bidir' },
      { pin: 16, name: 'I13',  type: 'bidir' },
      { pin: 17, name: 'I14',  type: 'bidir' },
      { pin: 18, name: 'I15',  type: 'bidir' },
      { pin: 19, name: 'NC2',  type: 'nc'    },
      { pin: 20, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: [], outputs: [] },
    ],
  },

  // 74x1074: Dual D negative edge triggered FF, async preset and clear (14-pin)
  //
  // Sources:
  // No dedicated public datasheet exists for a "74x1074" dual D flip flop: the
  // part number is absent from the Wikipedia master 7400-series list, and the
  // only real "74F10xx" silicon (e.g. 74F1071) are bus undershoot/overshoot
  // clamps, not logic. The 74x1074 is the negative-edge-triggered member of the
  // standard 7474 dual D flip flop family, which shares one fixed JEDEC DIP-14
  // terminal assignment across every manufacturer and edge-polarity variant.
  // The pinout, function table and active-LOW preset/clear behavior are therefore
  // taken from that family datasheet; only the active clock edge differs.
  // Source: Texas Instruments, "SN54LS74A, SN74LS74A Dual D-Type Positive-Edge-
  //   Triggered Flip-Flops With Preset and Clear", SDLS119 (rev. Mar. 1988).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls74a.pdf.
  //   Verified: DIP-14 terminal assignment (pin 1 = 1CLR, 2 = 1D, 3 = 1CLK,
  //   4 = 1PRE, 5 = 1Q, 6 = 1Qbar, 7 = GND, 8 = 2Qbar, 9 = 2Q, 10 = 2PRE,
  //   11 = 2CLK, 12 = 2D, 13 = 2CLR, 14 = VCC) and function table (active-LOW
  //   async preset/clear override the clock; D captured on the active edge),
  //   page 1, read as PDF.
  // Source: ON Semiconductor, "MM74HC112 Dual J-K Flip-Flop ... Negative-Edge",
  //   used only to confirm the falling-edge sampling convention modeled here.
  //   [Online]. Available: https://www.onsemi.com/.
  // NOTE: the hand-entered stub had PRESET on pin 1 and CLEAR on pin 4 — swapped
  // relative to the universal 7474-family pinout (CLR on 1, PRE on 4, confirmed
  // against the repo's own 74x74 and 74x5074 entries). Corrected here.
  '74x1074': {
    name: '74x1074',
    simpleName: 'Dual D Negative Edge Triggered FF w/ Preset & Clear',
    description: 'Dual D negative-edge flip-flop, async preset and clear (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls74a.pdf',
    tags: ['flip flop', 'd type', 'dual', 'preset', 'clear', 'sequential', 'negative edge'],
    guideOverview: 'The 74x1074 packages two D flip flops that capture their D input on the falling clock edge (HIGH→LOW). This is the negative-edge counterpart of the common 74x74, which clocks on the rising edge. Asynchronous active LOW preset and clear force the output HIGH or LOW at any time without waiting for a clock edge. Typical uses are the same as any dual D flip flop: clock division, shift registers, and edge triggered storage.',
    guidePinDescriptions: {
      '1CLn': 'Flip flop 1 asynchronous clear, active LOW. Pull LOW to force 1Q=0 at any time. Tie HIGH for normal clocked operation.',
      '1D':   'Flip flop 1 data input. Captured by 1Q on the falling edge of 1CLK.',
      '1CLK': 'Flip flop 1 clock. 1Q updates to 1D on the HIGH→LOW transition.',
      '1PRn': 'Flip flop 1 asynchronous preset, active LOW. Pull LOW to force 1Q=1 at any time. Tie HIGH for normal clocked operation.',
      '1Q':   'Flip flop 1 true output.',
      '1Qn':  'Flip flop 1 complementary output (inverse of 1Q during normal operation).',
      'GND':  'Ground reference (pin 7).',
      '2Qn':  'Flip flop 2 complementary output.',
      '2Q':   'Flip flop 2 true output.',
      '2PRn': 'Flip flop 2 asynchronous preset, active LOW. Pull LOW to force 2Q=1.',
      '2CLK': 'Flip flop 2 clock. 2Q updates to 2D on the HIGH→LOW transition.',
      '2D':   'Flip flop 2 data input. Captured by 2Q on the falling edge of 2CLK.',
      '2CLn': 'Flip flop 2 asynchronous clear, active LOW. Pull LOW to force 2Q=0.',
      'VCC':  'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Rising vs Falling Edge',
        paragraphs: [
          'A D flip flop samples its D input at one clock transition and holds that value until the next. The 74x1074 samples on the falling edge (HIGH→LOW); the more common 74x74 samples on the rising edge (LOW→HIGH). The choice matters when you mix the two in one circuit, because they update at opposite points in the clock cycle.',
          'Preset and clear are asynchronous and active LOW: they act the moment they go LOW, regardless of the clock. Pull PRn LOW to force Q=1, or CLn LOW to force Q=0. Both must be HIGH for normal clocked operation.',
        ],
        note: 'Do not assert PRn and CLn LOW at the same time both Q and Q would go HIGH, which is invalid for complementary outputs.',
      },
      {
        title: 'Common Uses',
        list: [
          'Frequency divider: tie Q back to D so the output toggles every clock, dividing the frequency by 2.',
          'Shift register: chain Q of one flip flop to D of the next.',
          'Edge detect and synchronisation, but updating on the falling clock edge.',
          'Simple 1 bit memory element.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1CLn', type: 'input',  description: 'Flip flop 1 asynchronous clear, active LOW: forces 1Q=0 regardless of clock' },
      { pin:  2, name: '1D',   type: 'input',  description: 'Flip flop 1 data input captured on falling clock edge' },
      { pin:  3, name: '1CLK', type: 'input',  description: 'Flip flop 1 clock 1Q updates to 1D on falling edge (HIGH→LOW)' },
      { pin:  4, name: '1PRn', type: 'input',  description: 'Flip flop 1 asynchronous preset, active LOW: forces 1Q=1 regardless of clock' },
      { pin:  5, name: '1Q',   type: 'output', description: 'Flip flop 1 true output' },
      { pin:  6, name: '1Qn',  type: 'output', description: 'Flip flop 1 inverted output' },
      { pin:  7, name: 'GND',  type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: '2Qn',  type: 'output', description: 'Flip flop 2 inverted output' },
      { pin:  9, name: '2Q',   type: 'output', description: 'Flip flop 2 true output' },
      { pin: 10, name: '2PRn', type: 'input',  description: 'Flip flop 2 asynchronous preset, active LOW: forces 2Q=1 regardless of clock' },
      { pin: 11, name: '2CLK', type: 'input',  description: 'Flip flop 2 clock 2Q updates to 2D on falling edge (HIGH→LOW)' },
      { pin: 12, name: '2D',   type: 'input',  description: 'Flip flop 2 data input captured on falling clock edge' },
      { pin: 13, name: '2CLn', type: 'input',  description: 'Flip flop 2 asynchronous clear, active LOW: forces 2Q=0 regardless of clock' },
      { pin: 14, name: 'VCC',  type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'D_FF_NEG', inputs: ['1D', '1CLK', '1PRn', '1CLn'], outputs: ['1Q', '1Qn'] },
      { type: 'D_FF_NEG', inputs: ['2D', '2CLK', '2PRn', '2CLn'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // 74x1181: 4 bit arithmetic logic unit / function generator (24-pin).
  // Same part family and pinout as the 74181; "1181" is just this list's number
  // for it. Reuses the existing ALU_4BIT engine primitive (_evaluateAlu4Bit,
  // js/specificChipsSim.js), which models the datasheet's ACTIVE-HIGH data
  // convention (Table 2) — identical wiring to the shipped 74x181 entry.
  // Pinout VERIFIED, not cloned from a sibling (issues.md C2):
  // Source: Texas Instruments, "SN54LS181, SN54S181, SN74LS181, SN74S181
  //   Arithmetic Logic Units/Function Generators", SDLS136 (Dec 1972, rev. Mar 1988).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn54s181.pdf.
  //   Verified: terminal assignment (J/W/DW/N package TOP VIEW, page 1) +
  //   active-high data pin table (page 2) + Table 1 active-low function table
  //   (page 3) + Table 2 active-high function table (page 4), read as rendered
  //   PDF page images (issues.md C4). Every one of the 16 logic (M=H) and 16
  //   arithmetic (M=L, "no carry" column) rows was checked bit-for-bit against
  //   _evaluateAlu4Bit; all match. Pins 1-24: B0,A0,S3,S2,S1,S0,Cn,M,F0,F1,F2,
  //   GND,F3,A=B,P,Cn4,G,B3,A3,B2,A2,B1,A1,VCC.
  //   Two modeled divergences from the silicon, both documented in issues.md C16
  //   (shared ALU_4BIT caveat): (1) P/G/A=B are simplified, not the exact group
  //   propagate/generate; (2) carry is modeled ACTIVE-HIGH (Cn=H adds 1, Cn4=H
  //   on overflow) for learner clarity, whereas the datasheet's active-high data
  //   table uses an active-LOW carry (C̄n=L adds 1, C̄n+4). The polarity choice is
  //   internally consistent for cascading engine 74x181 stages.
  '74x1181': {
    name: '74x1181',
    simpleName: '4 bit ALU',
    description: '4-bit ALU and function generator with carry look-ahead (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn54s181.pdf',
    tags: ['alu', 'arithmetic', 'logic', '4 bit', 'combinational', 'carry lookahead'],
    guideOverview: 'The 74x1181 is a 4 bit arithmetic logic unit (ALU) and function generator. It performs 16 arithmetic and 16 logic operations on two 4 bit operands A and B. The four select pins S0 S3 pick the operation and the mode pin M chooses between the two groups. Carry look ahead outputs P and G let it work with a 74x182 to build wider ALUs without slow ripple carry.',
    guidePinDescriptions: {
      'B0': 'Operand B bit 0 (LSB).',
      'A0': 'Operand A bit 0 (LSB).',
      'S3': 'Function select bit 3; one of four bits choosing the operation.',
      'S2': 'Function select bit 2; one of four bits choosing the operation.',
      'S1': 'Function select bit 1; one of four bits choosing the operation.',
      'S0': 'Function select bit 0; one of four bits choosing the operation.',
      'Cn': 'Carry input from a less significant stage. As modeled, HIGH adds one to the arithmetic result; ignored in logic mode.',
      'M': 'Mode select. HIGH selects the 16 logic operations (carry ignored); LOW selects the 16 arithmetic operations (carry used).',
      'F0': 'Result output bit 0 (LSB).',
      'F1': 'Result output bit 1.',
      'F2': 'Result output bit 2.',
      'F3': 'Result output bit 3 (MSB).',
      'AeqB': 'Equality output. HIGH when all four F outputs are HIGH, which happens in subtract mode when A equals B.',
      'P': 'Carry propagate output for the 74x182 look ahead carry generator.',
      'Cn4': 'Ripple carry output from bit 3 to the next more significant stage.',
      'G': 'Carry generate output for the 74x182 look ahead carry generator.',
      'B3': 'Operand B bit 3 (MSB).',
      'A3': 'Operand A bit 3 (MSB).',
      'B2': 'Operand B bit 2.',
      'A2': 'Operand A bit 2.',
      'B1': 'Operand B bit 1.',
      'A1': 'Operand A bit 1.',
    },
    guideSections: [
      {
        title: 'Choosing an operation',
        paragraphs: [
          'M sets the mode. With M HIGH the chip does logic: AND, OR, XOR, NOT, and twelve more, one bit at a time with no carry between bits. With M LOW it does arithmetic: add, subtract, increment, decrement, and shift, with carry rippling from bit 0 up to bit 3. The four select pins S0 S3 then pick which of the 16 functions in that group runs.',
          'For example, in arithmetic mode S3 S0 = 1001 gives A plus B. Drive Cn HIGH to add an incoming carry, so the same select gives A plus B plus 1.',
        ],
      },
      {
        title: 'Comparing two numbers',
        paragraphs: [
          'Put the chip in subtract mode (M LOW, S3 S0 = 0110, Cn LOW) and AeqB goes HIGH exactly when A equals B. That is how a row of these chips is chained into a magnitude comparator.',
        ],
      },
      {
        title: 'Carry look ahead',
        paragraphs: [
          'The P and G outputs feed a 74x182 look ahead carry generator. Instead of waiting for the carry to ripple through every chip, the 74x182 computes the carries for several 74x1181 stages at once, so an 8, 16, or larger ALU runs much faster.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'B0',   type: 'input'  },
      { pin:  2, name: 'A0',   type: 'input'  },
      { pin:  3, name: 'S3',   type: 'input'  },
      { pin:  4, name: 'S2',   type: 'input'  },
      { pin:  5, name: 'S1',   type: 'input'  },
      { pin:  6, name: 'S0',   type: 'input'  },
      { pin:  7, name: 'Cn',   type: 'input'  },
      { pin:  8, name: 'M',    type: 'input'  },
      { pin:  9, name: 'F0',   type: 'output' },
      { pin: 10, name: 'F1',   type: 'output' },
      { pin: 11, name: 'F2',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'F3',   type: 'output' },
      { pin: 14, name: 'AeqB', type: 'output' },
      { pin: 15, name: 'P',    type: 'output' },
      { pin: 16, name: 'Cn4',  type: 'output' },
      { pin: 17, name: 'G',    type: 'output' },
      { pin: 18, name: 'B3',   type: 'input'  },
      { pin: 19, name: 'A3',   type: 'input'  },
      { pin: 20, name: 'B2',   type: 'input'  },
      { pin: 21, name: 'A2',   type: 'input'  },
      { pin: 22, name: 'B1',   type: 'input'  },
      { pin: 23, name: 'A1',   type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'ALU_4BIT', inputs: ['A0','A1','A2','A3','B0','B1','B2','B3','S0','S1','S2','S3','M','Cn'], outputs: ['F0','F1','F2','F3','Cn4','P','G','AeqB'] },
    ],
  },

  // 74x1240: Octal buffer/line driver, inverting, TRI STATE (20-pin)
  '74x1240': {
    name: '74x1240',
    simpleName: 'Octal Buffer/Line Driver Inverting (low power)',
    description: 'Octal buffer / line driver, inverting, TRI STATE, low-power (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['buffer', 'octal', 'inverting', 'tri state', 'stub'],
    pinout: [
      { pin:  1, name: '1OEn', type: 'input'  },
      { pin:  2, name: '1A0',  type: 'input'  },
      { pin:  3, name: '1Y0',  type: 'output' },
      { pin:  4, name: '1A1',  type: 'input'  },
      { pin:  5, name: '1Y1',  type: 'output' },
      { pin:  6, name: '1A2',  type: 'input'  },
      { pin:  7, name: '1Y2',  type: 'output' },
      { pin:  8, name: '1A3',  type: 'input'  },
      { pin:  9, name: '1Y3',  type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '2Y3',  type: 'output' },
      { pin: 12, name: '2A3',  type: 'input'  },
      { pin: 13, name: '2Y2',  type: 'output' },
      { pin: 14, name: '2A2',  type: 'input'  },
      { pin: 15, name: '2Y1',  type: 'output' },
      { pin: 16, name: '2A1',  type: 'input'  },
      { pin: 17, name: '2Y0',  type: 'output' },
      { pin: 18, name: '2A0',  type: 'input'  },
      { pin: 19, name: '2OEn', type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1OEn','1A0','1A1','1A2','1A3','2OEn','2A0','2A1','2A2','2A3'], outputs: [] },
    ],
  },

  // 74x1241: Octal buffer/line driver, non inverting, TRI STATE (20-pin)
  '74x1241': {
    name: '74x1241',
    simpleName: 'Octal Buffer/Line Driver Non Inverting (low power)',
    description: 'Octal buffer / line driver, non-inverting, TRI STATE, low-power (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['buffer', 'octal', 'non inverting', 'tri state', 'stub'],
    pinout: [
      { pin:  1, name: '1OEn', type: 'input'  },
      { pin:  2, name: '1A0',  type: 'input'  },
      { pin:  3, name: '1Y0',  type: 'output' },
      { pin:  4, name: '1A1',  type: 'input'  },
      { pin:  5, name: '1Y1',  type: 'output' },
      { pin:  6, name: '1A2',  type: 'input'  },
      { pin:  7, name: '1Y2',  type: 'output' },
      { pin:  8, name: '1A3',  type: 'input'  },
      { pin:  9, name: '1Y3',  type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '2Y3',  type: 'output' },
      { pin: 12, name: '2A3',  type: 'input'  },
      { pin: 13, name: '2Y2',  type: 'output' },
      { pin: 14, name: '2A2',  type: 'input'  },
      { pin: 15, name: '2Y1',  type: 'output' },
      { pin: 16, name: '2A1',  type: 'input'  },
      { pin: 17, name: '2Y0',  type: 'output' },
      { pin: 18, name: '2A0',  type: 'input'  },
      { pin: 19, name: '2OEn', type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1OEn','1A0','1A1','1A2','1A3','2OEn','2A0','2A1','2A2','2A3'], outputs: [] },
    ],
  },

  // 74x1242: Quad bus transceiver, inverting, TRI STATE (14-pin)
  '74x1242': {
    name: '74x1242',
    simpleName: 'Quad Bus Transceiver Inverting (low power)',
    description: 'Quad bus transceiver, inverting, TRI STATE, low-power (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['transceiver', 'quad', 'inverting', 'tri state', 'bidir', 'stub'],
    pinout: [
      { pin:  1, name: 'GABn', type: 'input'  },
      { pin:  2, name: 'GBAn', type: 'input'  },
      { pin:  3, name: 'A0',   type: 'bidir'  },
      { pin:  4, name: 'B0',   type: 'bidir'  },
      { pin:  5, name: 'A1',   type: 'bidir'  },
      { pin:  6, name: 'B1',   type: 'bidir'  },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: 'B2',   type: 'bidir'  },
      { pin:  9, name: 'A2',   type: 'bidir'  },
      { pin: 10, name: 'B3',   type: 'bidir'  },
      { pin: 11, name: 'A3',   type: 'bidir'  },
      { pin: 12, name: 'NC',   type: 'nc'     },
      { pin: 13, name: 'NC2',  type: 'nc'     },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['GABn','GBAn'], outputs: [] },
    ],
  },

  // 74x1243: Quad bus transceiver, non inverting, TRI STATE (14-pin)
  '74x1243': {
    name: '74x1243',
    simpleName: 'Quad Bus Transceiver Non Inverting (low power)',
    description: 'Quad bus transceiver, non-inverting, TRI STATE, low-power (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['transceiver', 'quad', 'non inverting', 'tri state', 'bidir', 'stub'],
    pinout: [
      { pin:  1, name: 'GABn', type: 'input'  },
      { pin:  2, name: 'GBAn', type: 'input'  },
      { pin:  3, name: 'A0',   type: 'bidir'  },
      { pin:  4, name: 'B0',   type: 'bidir'  },
      { pin:  5, name: 'A1',   type: 'bidir'  },
      { pin:  6, name: 'B1',   type: 'bidir'  },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: 'B2',   type: 'bidir'  },
      { pin:  9, name: 'A2',   type: 'bidir'  },
      { pin: 10, name: 'B3',   type: 'bidir'  },
      { pin: 11, name: 'A3',   type: 'bidir'  },
      { pin: 12, name: 'NC',   type: 'nc'     },
      { pin: 13, name: 'NC2',  type: 'nc'     },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['GABn','GBAn'], outputs: [] },
    ],
  },

  // 74x1244: Octal buffer/driver, non inverting, TRI STATE (20-pin)
  '74x1244': {
    name: '74x1244',
    simpleName: 'Octal Buffer/Driver Non Inverting (low power)',
    description: 'Octal buffer / driver, non-inverting, TRI STATE, low-power (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['buffer', 'octal', 'non inverting', 'tri state', 'stub'],
    pinout: [
      { pin:  1, name: '1OEn', type: 'input'  },
      { pin:  2, name: '1A0',  type: 'input'  },
      { pin:  3, name: '1Y0',  type: 'output' },
      { pin:  4, name: '1A1',  type: 'input'  },
      { pin:  5, name: '1Y1',  type: 'output' },
      { pin:  6, name: '1A2',  type: 'input'  },
      { pin:  7, name: '1Y2',  type: 'output' },
      { pin:  8, name: '1A3',  type: 'input'  },
      { pin:  9, name: '1Y3',  type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '2Y3',  type: 'output' },
      { pin: 12, name: '2A3',  type: 'input'  },
      { pin: 13, name: '2Y2',  type: 'output' },
      { pin: 14, name: '2A2',  type: 'input'  },
      { pin: 15, name: '2Y1',  type: 'output' },
      { pin: 16, name: '2A1',  type: 'input'  },
      { pin: 17, name: '2Y0',  type: 'output' },
      { pin: 18, name: '2A0',  type: 'input'  },
      { pin: 19, name: '2OEn', type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1OEn','1A0','1A1','1A2','1A3','2OEn','2A0','2A1','2A2','2A3'], outputs: [] },
    ],
  },

  // 74x1245: Octal bus transceiver, TRI STATE (20-pin)
  '74x1245': {
    name: '74x1245',
    simpleName: 'Octal Bus Transceiver (low power)',
    description: 'Octal bus transceiver, TRI STATE (lower power version of 74x245) (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als1245a.pdf',
    tags: ['transceiver', 'octal', 'tri state', 'bidir'],
    guideOverview: 'The 74x1245 is an octal bidirectional bus transceiver in the same general role as the familiar 74x245. It connects two 8 bit buses through a controlled driver stage, using one pin to choose the data direction and an active LOW enable pin to disconnect both sides when the bus should be idle. Breadboard builders use devices like this whenever two subsystems need to share an 8 bit path without fighting each other electrically.',
    guidePinDescriptions: {
      'DIR': 'Direction control input. Set it for the A-to B or B-to A data path selected by the datasheet truth table.',
      'A0': 'Bus line A0. This pin becomes an input or output depending on DIR and OEn.',
      'A1': 'Bus line A1. Use it like the other A-side transceiver channels.',
      'A2': 'Bus line A2. This line is one bit of the A-side bus.',
      'A3': 'Bus line A3. It participates in the bidirectional transfer path.',
      'A4': 'Bus line A4. Another A-side data bit.',
      'A5': 'Bus line A5. It is switched through the transceiver according to DIR.',
      'A6': 'Bus line A6. Use it for another A-side data bit.',
      'A7': 'Bus line A7. This is the highest numbered A-side bus channel.',
      'GND': 'Ground reference for the transceiver.',
      'B7': 'Bus line B7. This is the highest numbered B-side data bit.',
      'B6': 'Bus line B6. Use it as the B-side partner of A6.',
      'B5': 'Bus line B5. Another B-side transceiver channel.',
      'B4': 'Bus line B4. It is connected through the controlled driver when enabled.',
      'B3': 'Bus line B3. Use it as the B-side mate for A3.',
      'B2': 'Bus line B2. Another B-side data line.',
      'B1': 'Bus line B1. It switches direction with the rest of the bus.',
      'B0': 'Bus line B0. This is the lowest numbered B-side data bit.',
      'OEn': 'Output enable, active LOW. Pull LOW to enable the transceiver; drive HIGH to place the bus interface in high impedance.',
      'VCC': 'Positive supply, typically +5 V for TTL logic.',
    },
    guideSections: [
      {
        title: 'Direction and Enable',
        paragraphs: [
          'A bus transceiver is basically a controlled bridge between two buses. DIR selects which side is currently the source and which side is currently the destination, while the output enable (OE, active LOW) controls whether the bridge is connected at all.',
          'That combination is what keeps multiple devices from driving the same line at once. Only the transceiver that is both enabled and set to the correct direction should be active on a shared bus.',
        ],
      },
      {
        title: 'Why Use a 245-Style Part',
        paragraphs: [
          'Eight bit processors, latches, and peripheral devices often need a shared data path. A part like the 74x1245 makes that practical by buffering the bus, isolating loading, and giving system logic explicit control over when and where data moves.',
        ],
        note: 'Functionally equivalent to the 74x245 in the simulator: DIR selects direction, OEn (active LOW) enables, and both A and B sides become Hi-Z when disabled.',
      },
      {
        title: 'Common Uses',
        list: [
          'CPU or microcontroller data-bus buffering.',
          'Isolating two boards that take turns owning an 8 bit bus.',
          'Reducing loading when one source must feed many downstream inputs.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'DIR',  type: 'input'  },
      { pin:  2, name: 'A0',   type: 'bidir'  },
      { pin:  3, name: 'A1',   type: 'bidir'  },
      { pin:  4, name: 'A2',   type: 'bidir'  },
      { pin:  5, name: 'A3',   type: 'bidir'  },
      { pin:  6, name: 'A4',   type: 'bidir'  },
      { pin:  7, name: 'A5',   type: 'bidir'  },
      { pin:  8, name: 'A6',   type: 'bidir'  },
      { pin:  9, name: 'A7',   type: 'bidir'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'B7',   type: 'bidir'  },
      { pin: 12, name: 'B6',   type: 'bidir'  },
      { pin: 13, name: 'B5',   type: 'bidir'  },
      { pin: 14, name: 'B4',   type: 'bidir'  },
      { pin: 15, name: 'B3',   type: 'bidir'  },
      { pin: 16, name: 'B2',   type: 'bidir'  },
      { pin: 17, name: 'B1',   type: 'bidir'  },
      { pin: 18, name: 'B0',   type: 'bidir'  },
      { pin: 19, name: 'OEn',  type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'TRANSCEIVER_8BIT',
        inputs:  ['A0','A1','A2','A3','A4','A5','A6','A7',
                  'B0','B1','B2','B3','B4','B5','B6','B7','DIR','OEn'],
        outputs: ['A0','A1','A2','A3','A4','A5','A6','A7',
                  'B0','B1','B2','B3','B4','B5','B6','B7'] },
    ],
  },

  // 74x1280: 9 bit parity generator/checker with registered outputs, TRI STATE (20-pin)
  //
  // LEFT AS STUB (deliberate). The core function (9-input XOR parity tree, latched
  // on a clock edge, with a tri-state output enable) is trivially simulatable, but
  // no datasheet for a part numbered "74x1280" with this function could be located,
  // and the hand-entered 20-pin pinout below (6 NC pins; CLK on 12, OEn on 11,
  // SUM/EVEN on 13/14) is therefore UNVERIFIABLE. Per the project's verification
  // discipline (issues.md C2 / the CD4082 lesson: never trust a hand-entered or
  // sibling pinout), shipping a placeable chip on an invented pinout that a student
  // might wire on a real breadboard is worse than a clearly-labelled info-sheet stub.
  //
  // What was searched (June 2026), all negative for a registered/tri-state/20-pin
  // "1280" parity part:
  //   - TI catalog + "9-Bit Parity Generators/Checkers", SN74AS280 (Rev. C).
  //     [Online]. Available: https://www.ti.com/lit/gpn/sn74as280
  //   - Fairchild, "74F280 9-Bit Parity Generator/Checker", DS009469.
  //     [Online]. Available: https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74F280.pdf
  //   - Nexperia/Philips "74HC/HCT280 9-bit odd/even parity generator/checker".
  //   - Wikipedia, "List of 7400-series integrated circuits" (no 1280 row).
  //   The only real 9-bit parity silicon is the 74x280 family: 14-pin, purely
  //   COMBINATIONAL (no clock, no register, no tri-state), with separate Sigma-EVEN
  //   and Sigma-ODD outputs. That does not match this entry's described function,
  //   so the 74x280 datasheet cannot be used to back this pinout either.
  // Conclusion: no trustworthy source -> remains GENERIC_STUB / tags:['stub'].
  // See issues.md (74x1280 stub note).
  '74x1280': {
    name: '74x1280',
    simpleName: '9 bit Parity Generator/Checker w/ Registered Outputs',
    description: '9 bit parity generator/checker with registered outputs, TRI STATE (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['parity', '9 bit', 'registered', 'tri state', 'stub'],
    pinout: [
      { pin:  1, name: 'I0',   type: 'input'  },
      { pin:  2, name: 'I1',   type: 'input'  },
      { pin:  3, name: 'I2',   type: 'input'  },
      { pin:  4, name: 'I3',   type: 'input'  },
      { pin:  5, name: 'I4',   type: 'input'  },
      { pin:  6, name: 'I5',   type: 'input'  },
      { pin:  7, name: 'I6',   type: 'input'  },
      { pin:  8, name: 'I7',   type: 'input'  },
      { pin:  9, name: 'I8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'OEn',  type: 'input'  },
      { pin: 12, name: 'CLK',  type: 'input'  },
      { pin: 13, name: 'SUM',  type: 'output' },
      { pin: 14, name: 'EVEN', type: 'output' },
      { pin: 15, name: 'NC',   type: 'nc'     },
      { pin: 16, name: 'NC2',  type: 'nc'     },
      { pin: 17, name: 'NC3',  type: 'nc'     },
      { pin: 18, name: 'NC4',  type: 'nc'     },
      { pin: 19, name: 'NC5',  type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['I0','I1','I2','I3','I4','I5','I6','I7','I8','OEn','CLK'], outputs: [] },
    ],
  },

  // 74x1284: Parallel printer interface transceiver/buffer (IEEE 1284), (20-pin)
  '74x1284': {
    name: '74x1284',
    simpleName: 'Parallel Printer Interface Transceiver/Buffer (IEEE 1284)',
    description: 'Parallel printer interface transceiver / buffer (IEEE 1284) (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['transceiver', 'parallel', 'printer', 'ieee1284', 'bidir', 'stub'],
    pinout: [
      { pin:  1, name: 'P0',   type: 'bidir'  },
      { pin:  2, name: 'P1',   type: 'bidir'  },
      { pin:  3, name: 'P2',   type: 'bidir'  },
      { pin:  4, name: 'P3',   type: 'bidir'  },
      { pin:  5, name: 'P4',   type: 'bidir'  },
      { pin:  6, name: 'P5',   type: 'bidir'  },
      { pin:  7, name: 'P6',   type: 'bidir'  },
      { pin:  8, name: 'P7',   type: 'bidir'  },
      { pin:  9, name: 'DIR',  type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'OEn',  type: 'input'  },
      { pin: 12, name: 'B7',   type: 'bidir'  },
      { pin: 13, name: 'B6',   type: 'bidir'  },
      { pin: 14, name: 'B5',   type: 'bidir'  },
      { pin: 15, name: 'B4',   type: 'bidir'  },
      { pin: 16, name: 'B3',   type: 'bidir'  },
      { pin: 17, name: 'B2',   type: 'bidir'  },
      { pin: 18, name: 'B1',   type: 'bidir'  },
      { pin: 19, name: 'B0',   type: 'bidir'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['DIR','OEn'], outputs: [] },
    ],
  },

  // 74x1394: 2 bit GTLP transceiver with split LV TTL port (16-pin)
  '74x1394': {
    name: '74x1394',
    simpleName: '2 bit GTLP Transceiver with Split LV TTL Port',
    description: '2-bit GTLP transceiver, LVTTL port, 3-state, open collector (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74gtlp1394.pdf',
    tags: ['transceiver', 'gtlp', 'bidir', 'stub'],
    guideOverview: 'The 74x1394 is a small GTLP transceiver intended to bridge between a low voltage backplane style bus and a local LV TTL logic interface. GTLP, or Gunning transceiver logic plus, uses reduced voltage swing and a reference threshold to move data quickly on heavily loaded buses. Parts like this show up when ordinary TTL style point to point drivers are no longer a good fit for a multi drop backplane.',
    guidePinDescriptions: {
      'OEAn': 'Output-enable control for one side of the transceiver, active LOW. Pull LOW to enable the associated path; drive HIGH to disable it.',
      'OEBn': 'Output-enable control for the opposite side, active LOW. It helps isolate the bus when that direction should be inactive.',
      'A0': 'Signal line A0. This is one channel of the split LV TTL/GTLP interface.',
      'A1': 'Signal line A1. Use it as the second A-side channel.',
      'B0': 'Signal line B0. It pairs with A0 through the transceiver function.',
      'B1': 'Signal line B1. It pairs with A1 through the transceiver function.',
      'NC': 'No internal connection. Leave this pin unconnected.',
      'GND': 'Ground reference for the device.',
      'NC2': 'No internal connection. Leave this pin unconnected.',
      'VREF': 'Reference voltage input used by the GTLP receiver thresholds. Tie it to the level specified by the datasheet for proper bus switching.',
      'NC3': 'No internal connection. Leave this pin unconnected.',
      'NC4': 'No internal connection. Leave this pin unconnected.',
      'NC5': 'No internal connection. Leave this pin unconnected.',
      'NC6': 'No internal connection. Leave this pin unconnected.',
      'NC7': 'No internal connection. Leave this pin unconnected.',
      'VCC': 'Positive supply for the transceiver logic.',
    },
    guideSections: [
      {
        title: 'What GTLP Is',
        paragraphs: [
          'GTLP is designed for heavily loaded, multi drop buses where many devices share the same set of traces. Instead of using large full swing TTL transitions everywhere, it relies on lower signal swing and a defined reference threshold so edges can move faster with less switching noise.',
          'That makes GTLP attractive for backplanes and high fanout communication paths that would be awkward to drive with ordinary logic families.',
        ],
      },
      {
        title: 'Why There Is a VREF Pin',
        paragraphs: [
          'Because GTLP signaling uses a smaller swing, the receiver needs a stable comparison point. VREF provides that reference so the input circuitry can decide whether the bus is logically HIGH or LOW.',
        ],
        note: 'This entry is modeled as a documented stub in the simulator. The guide captures the interface role and pins, but the simulator does not emulate GTLP analog levels.',
      },
    ],
    pinout: [
      { pin:  1, name: 'OEAn', type: 'input'  },
      { pin:  2, name: 'OEBn', type: 'input'  },
      { pin:  3, name: 'A0',   type: 'bidir'  },
      { pin:  4, name: 'A1',   type: 'bidir'  },
      { pin:  5, name: 'B0',   type: 'bidir'  },
      { pin:  6, name: 'B1',   type: 'bidir'  },
      { pin:  7, name: 'NC',   type: 'nc'     },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'NC2',  type: 'nc'     },
      { pin: 10, name: 'VREF', type: 'input'  },
      { pin: 11, name: 'NC3',  type: 'nc'     },
      { pin: 12, name: 'NC4',  type: 'nc'     },
      { pin: 13, name: 'NC5',  type: 'nc'     },
      { pin: 14, name: 'NC6',  type: 'nc'     },
      { pin: 15, name: 'NC7',  type: 'nc'     },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['OEAn','OEBn','VREF'], outputs: [] },
    ],
  },

  // 74x1395: Dual 1 bit GTLP transceiver with split LV TTL port (20-pin)
  '74x1395': {
    name: '74x1395',
    simpleName: 'Dual 1 bit GTLP Transceiver with Split LV TTL Port',
    description: 'Dual 1-bit GTLP transceiver, LVTTL port, 3-state, open collector (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74gtlp1395.pdf',
    tags: ['transceiver', 'gtlp', 'bidir', 'stub'],
    guideOverview: 'The 74x1395 applies the same GTLP bridging idea as the 74x1394, but in two independent single bit channels with separate reference pins. That split arrangement is useful when each signal path needs to be routed or biased independently. On real backplane designs, devices like this let local TTL logic talk to a lower swing GTLP bus without using a full multi bit transceiver package.',
    guidePinDescriptions: {
      '1OEAn': 'Active LOW enable control for one side of channel 1. Drive LOW to enable the associated path.',
      '1OEBn': 'Active LOW enable control for the opposite side of channel 1. It helps isolate channel 1 when disabled.',
      '1A': 'Signal line A for channel 1. This is one side of the first GTLP/LV TTL bridge.',
      '1B': 'Signal line B for channel 1. It pairs with 1A through the transceiver function.',
      'VREF1': 'Reference voltage input for channel 1. Tie it to the threshold level required for the first GTLP path.',
      'NC': 'No internal connection. Leave this pin unconnected.',
      'NC2': 'No internal connection. Leave this pin unconnected.',
      'NC3': 'No internal connection. Leave this pin unconnected.',
      'NC4': 'No internal connection. Leave this pin unconnected.',
      'GND': 'Ground reference for the device.',
      'NC5': 'No internal connection. Leave this pin unconnected.',
      'NC6': 'No internal connection. Leave this pin unconnected.',
      'NC7': 'No internal connection. Leave this pin unconnected.',
      'NC8': 'No internal connection. Leave this pin unconnected.',
      'VREF2': 'Reference voltage input for channel 2. It sets the comparison threshold for the second GTLP path.',
      '2B': 'Signal line B for channel 2. This is one side of the second transceiver channel.',
      '2A': 'Signal line A for channel 2. It pairs with 2B through the bridge circuitry.',
      '2OEBn': 'Active LOW enable control for one side of channel 2. Use it to disconnect channel 2 when needed.',
      '2OEAn': 'Active LOW enable control for the opposite side of channel 2. Together with 2OEBn it controls channel-2 activity.',
      'VCC': 'Positive supply for the transceiver logic.',
    },
    guideSections: [
      {
        title: 'Independent Single Bit Channels',
        paragraphs: [
          'Unlike a fixed multi bit transceiver, the 74x1395 gives you two fully separate channels. That is convenient when only one or two control lines need GTLP translation, or when the two lines belong to different parts of the system and should not share one reference arrangement.',
        ],
      },
      {
        title: 'Reference and Enable Control',
        paragraphs: [
          'Each channel uses its own VREF input so the receiver threshold can be set appropriately for that bus segment. The active LOW enable controls let the designer disconnect either transfer path to avoid bus contention or reduce loading when the channel is idle.',
        ],
        note: 'The simulator keeps this part as a placeholder/documentation model rather than a full GTLP electrical simulation.',
      },
    ],
    pinout: [
      { pin:  1, name: '1OEAn', type: 'input'  },
      { pin:  2, name: '1OEBn', type: 'input'  },
      { pin:  3, name: '1A',    type: 'bidir'  },
      { pin:  4, name: '1B',    type: 'bidir'  },
      { pin:  5, name: 'VREF1', type: 'input'  },
      { pin:  6, name: 'NC',    type: 'nc'     },
      { pin:  7, name: 'NC2',   type: 'nc'     },
      { pin:  8, name: 'NC3',   type: 'nc'     },
      { pin:  9, name: 'NC4',   type: 'nc'     },
      { pin: 10, name: 'GND',   type: 'power'  },
      { pin: 11, name: 'NC5',   type: 'nc'     },
      { pin: 12, name: 'NC6',   type: 'nc'     },
      { pin: 13, name: 'NC7',   type: 'nc'     },
      { pin: 14, name: 'NC8',   type: 'nc'     },
      { pin: 15, name: 'VREF2', type: 'input'  },
      { pin: 16, name: '2B',    type: 'bidir'  },
      { pin: 17, name: '2A',    type: 'bidir'  },
      { pin: 18, name: '2OEBn', type: 'input'  },
      { pin: 19, name: '2OEAn', type: 'input'  },
      { pin: 20, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1OEAn','1OEBn','VREF1','2OEAn','2OEBn','VREF2'], outputs: [] },
    ],
  },

  // 74x1404: Oscillator driver with Schmitt trigger input (8-pin)
  '74x1404': {
    name: '74x1404',
    simpleName: 'Oscillator Driver (Schmitt Trigger Input)',
    description: 'Oscillator driver with Schmitt trigger input (8-pin)',
    pins: 8, vcc: 8, gnd: 4,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74lvc1404.pdf',
    tags: ['oscillator', 'schmitt', 'driver', 'stub'],
    guideOverview: 'The 74x1404 is a small clock/oscillator interface device built around a Schmitt trigger input stage. A Schmitt trigger adds hysteresis, so noisy or slowly changing inputs switch cleanly instead of chattering around the threshold. That makes the part useful as an oscillator driver, a crystal interface helper, or a clean-up stage between an analog ish timing signal and the digital logic that follows.',
    guidePinDescriptions: {
      'IN': 'Primary logic input to the driver. The Schmitt trigger action helps this input reject slow edges and noise.',
      'OUT': 'Buffered logic output corresponding to the IN path.',
      'XIN': 'Oscillator/crystal input node. Use it with the recommended external timing network when building an oscillator stage.',
      'GND': 'Ground reference for the device.',
      'XOUT': 'Oscillator/crystal output node. It pairs with XIN in the timing network.',
      'OE': 'Output enable control. Set it to the active state defined by the datasheet when you want the driver/oscillator output available.',
      'NC': 'No internal connection. Leave this pin unconnected.',
      'VCC': 'Positive supply for the oscillator driver.',
    },
    guideSections: [
      {
        title: 'Why Use a Schmitt Trigger',
        paragraphs: [
          'A Schmitt trigger input has two switching thresholds instead of one: one for a rising signal and another for a falling signal. That hysteresis prevents noise near the threshold from producing multiple unwanted transitions.',
          'It is especially valuable when the source is an RC oscillator, a crystal network, or a slow external waveform that would look sloppy to a normal digital input.',
        ],
      },
      {
        title: 'Oscillator and Buffer Roles',
        paragraphs: [
          'Some designs use a part like this to sustain an external resonator or timing network, while others use it simply to square up an existing clock like signal. In both cases, the goal is to hand the rest of the digital system a cleaner, more decisive transition.',
        ],
        note: 'This entry is documented as a stub in the simulator. The pin functions are preserved, but crystal startup and analog oscillator behavior are not fully modeled.',
      },
    ],
    pinout: [
      { pin: 1, name: 'IN',   type: 'input'  },
      { pin: 2, name: 'OUT',  type: 'output' },
      { pin: 3, name: 'XIN',  type: 'input'  },
      { pin: 4, name: 'GND',  type: 'power'  },
      { pin: 5, name: 'XOUT', type: 'output' },
      { pin: 6, name: 'OE',   type: 'input'  },
      { pin: 7, name: 'NC',   type: 'nc'     },
      { pin: 8, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['IN','XIN','OE'], outputs: [] },
    ],
  },

  // 74x1620: Octal bus transceiver, inverting, TRI STATE (20-pin)
  '74x1620': {
    name: '74x1620',
    simpleName: 'Octal Bus Transceiver Inverting',
    description: 'Octal bus transceiver, inverting, TRI STATE (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['transceiver', 'octal', 'inverting', 'tri state', 'bidir', 'stub'],
    pinout: [
      { pin:  1, name: 'GABn', type: 'input'  },
      { pin:  2, name: 'GBAn', type: 'input'  },
      { pin:  3, name: 'A0',   type: 'bidir'  },
      { pin:  4, name: 'B0',   type: 'bidir'  },
      { pin:  5, name: 'A1',   type: 'bidir'  },
      { pin:  6, name: 'B1',   type: 'bidir'  },
      { pin:  7, name: 'A2',   type: 'bidir'  },
      { pin:  8, name: 'B2',   type: 'bidir'  },
      { pin:  9, name: 'A3',   type: 'bidir'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'B3',   type: 'bidir'  },
      { pin: 12, name: 'A4',   type: 'bidir'  },
      { pin: 13, name: 'B4',   type: 'bidir'  },
      { pin: 14, name: 'A5',   type: 'bidir'  },
      { pin: 15, name: 'B5',   type: 'bidir'  },
      { pin: 16, name: 'A6',   type: 'bidir'  },
      { pin: 17, name: 'B6',   type: 'bidir'  },
      { pin: 18, name: 'A7',   type: 'bidir'  },
      { pin: 19, name: 'B7',   type: 'bidir'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['GABn','GBAn'], outputs: [] },
    ],
  },

  // 74x1621: Octal bus transceiver, non inverting, open collector (20-pin)
  '74x1621': {
    name: '74x1621',
    simpleName: 'Octal Bus Transceiver Non Inverting (OC)',
    description: 'Octal bus transceiver, non inverting, open collector (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['transceiver', 'octal', 'non inverting', 'open collector', 'bidir', 'stub'],
    pinout: [
      { pin:  1, name: 'GABn', type: 'input'  },
      { pin:  2, name: 'GBAn', type: 'input'  },
      { pin:  3, name: 'A0',   type: 'bidir'  },
      { pin:  4, name: 'B0',   type: 'bidir'  },
      { pin:  5, name: 'A1',   type: 'bidir'  },
      { pin:  6, name: 'B1',   type: 'bidir'  },
      { pin:  7, name: 'A2',   type: 'bidir'  },
      { pin:  8, name: 'B2',   type: 'bidir'  },
      { pin:  9, name: 'A3',   type: 'bidir'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'B3',   type: 'bidir'  },
      { pin: 12, name: 'A4',   type: 'bidir'  },
      { pin: 13, name: 'B4',   type: 'bidir'  },
      { pin: 14, name: 'A5',   type: 'bidir'  },
      { pin: 15, name: 'B5',   type: 'bidir'  },
      { pin: 16, name: 'A6',   type: 'bidir'  },
      { pin: 17, name: 'B6',   type: 'bidir'  },
      { pin: 18, name: 'A7',   type: 'bidir'  },
      { pin: 19, name: 'B7',   type: 'bidir'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['GABn','GBAn'], outputs: [] },
    ],
  },
};