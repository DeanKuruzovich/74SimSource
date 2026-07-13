// Chip definitions block 45
// Chips: 74929, 74930, 74932, 74933, 74936-74938, 74940-74943, 74952, 74x956, 74962-74964

export const CHIPS_BLOCK_45 = {

  // 74929: 1024 bit RAM (1024x1), single chip select, three-state (16-pin)
  '74x929': {
    name: '74x929',
    simpleName: '1024 bit RAM 1024x1 (TRI)',
    description: '1024-bit RAM, 1024 words x 1 bit, 3-state out, 1 chip select (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['ram', 'memory', '1024 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x929 is a 1024 bit static RAM organized as 1024 words by 1 bit with a single chip select. Ten address inputs A0 A9 select one of 1024 locations. WEn (active LOW) writes the value on DIN into the selected location; CSn (chip select, active LOW) enables the device; DOUT is the 3-state output. Build wider memories by paralleling multiple chips each chip holds one bit plane of the data word.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'A6',  type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'A7',  type: 'input'  },
      { pin: 10, name: 'A8',  type: 'input'  },
      { pin: 11, name: 'A9',  type: 'input'  },
      { pin: 12, name: 'WEn', type: 'input'  },
      { pin: 13, name: 'CSn', type: 'input'  },
      { pin: 14, name: 'DIN', type: 'input'  },
      { pin: 15, name: 'DOUT',type: 'output' },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','WEn','CSn','DIN'], outputs: ['DOUT'] },
    ],
  },

  // 74930: 1024 bit RAM (1024x1), three chip selects, three-state (18-pin)
  '74x930': {
    name: '74x930',
    simpleName: '1024 bit RAM 1024x1 (TRI, 3 CS)',
    description: '1024-bit RAM, 1024 words x 1 bit, 3-state out, 3 chip selects (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: '',
    tags: ['ram', 'memory', '1024 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x930 is a 1024 bit static RAM organized as 1024 words by 1 bit with three chip selects for flexible address decoding. Ten address inputs A0 A9 select one of 1024 locations. The device is active only when CS1n (active LOW), CS2n (active LOW), and CS3 (active HIGH) are all satisfied simultaneously, enabling memory map control without external gates. WEn writes DIN; DOUT is the 3-state output. Like the 74x929 but with three chip selects.',
    pinout: [
      { pin: 10, name: 'A8',  type: 'input'  },
      { pin: 11, name: 'A9',  type: 'input'  },
      { pin: 12, name: 'WEn', type: 'input'  },
      { pin: 13, name: 'CS1n',type: 'input'  },
      { pin: 14, name: 'CS2n',type: 'input'  },
      { pin: 15, name: 'CS3', type: 'input'  },
      { pin: 16, name: 'DIN', type: 'input'  },
      { pin: 17, name: 'DOUT',type: 'output' },
      { pin: 18, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','WEn','CS1n','CS2n','CS3','DIN'], outputs: ['DOUT'] },
    ],
  },

  // 74932: Phase comparator (8-pin)
  '74x932': {
    name: '74x932',
    simpleName: 'Phase Comparator',
    description: 'Phase comparator (8-pin)',
    pins: 8, vcc: 8, gnd: 4,
    datasheet: '',
    tags: ['phase comparator', 'analog', 'stub'],
    guideOverview: 'The 74x932 is a phase comparator. It compares the phase of two digital signals: a signal input (SIG) and a reference (REF). The UP output goes HIGH when SIG is lagging REF (the signal is slow relative to the reference); the DN output goes HIGH when SIG is leading REF (the signal is fast). Together UP and DN drive the charge pump or VCO control in a phase locked loop (PLL) system.',
    pinout: [
      { pin: 1, name: 'SIG',  type: 'input'  },
      { pin: 2, name: 'REF',  type: 'input'  },
      { pin: 3, name: 'UP',   type: 'output' },
      { pin: 4, name: 'GND',  type: 'power'  },
      { pin: 5, name: 'DN',   type: 'output' },
      { pin: 6, name: 'NC',   type: 'nc'     },
      { pin: 7, name: 'NC2',  type: 'nc'     },
      { pin: 8, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['SIG','REF'], outputs: ['UP','DN'] },
    ],
  },

  // 74933: 7 bit address bus comparator (20-pin)
  '74x933': {
    name: '74x933',
    simpleName: '7 bit Address Bus Comparator',
    description: '7 bit address bus comparator (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['comparator', 'bus', '7 bit', 'stub'],
    guideOverview: 'The 74x933 is a 7 bit address bus comparator. It compares two 7 bit words A0 A6 and B0 B6 bit by bit, and asserts the EQ output HIGH when all seven bit pairs match. Use for address decoding where matching the seven least significant bits of an address to a fixed base value is sufficient, or where comparing a 7 bit tag or index between two buses is needed.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input'  },
      { pin:  2, name: 'B0',   type: 'input'  },
      { pin:  3, name: 'A1',   type: 'input'  },
      { pin:  4, name: 'B1',   type: 'input'  },
      { pin:  5, name: 'A2',   type: 'input'  },
      { pin:  6, name: 'B2',   type: 'input'  },
      { pin:  7, name: 'A3',   type: 'input'  },
      { pin:  8, name: 'B3',   type: 'input'  },
      { pin:  9, name: 'A4',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'B4',   type: 'input'  },
      { pin: 12, name: 'A5',   type: 'input'  },
      { pin: 13, name: 'B5',   type: 'input'  },
      { pin: 14, name: 'A6',   type: 'input'  },
      { pin: 15, name: 'B6',   type: 'input'  },
      { pin: 16, name: 'EQ',   type: 'output' },
      { pin: 17, name: 'NC',   type: 'nc'     },
      { pin: 18, name: 'NC2',  type: 'nc'     },
      { pin: 19, name: 'NC3',  type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','B0','A1','B1','A2','B2','A3','B3','A4','B4','A5','B5','A6','B6'], outputs: ['EQ'] },
    ],
  },

  // 74936: ADC for 3.75-digit digital voltmeter with multiplexed 7 segment display outputs (28-pin)
  '74x936': {
    name: '74x936',
    simpleName: 'ADC 3.75-Digit DVM (7-Seg)',
    description: 'ADC for 3.75-digit DVMs, multiplexed 7-seg display outputs (28-pin)',
    pins: 28, vcc: 28, gnd: 14,
    datasheet: '',
    tags: ['adc', 'analog', 'voltmeter', '7 segment', 'stub'],
    guideOverview: 'The 74x936 is an ADC designed for 3.75-digit digital voltmeter (DVM) applications with multiplexed 7 segment display outputs. An internal dual slope integrator converts the differential analog input (IN+ minus IN−) referenced to REF+/REF−. The chip drives 7 segment outputs a g and digit select lines D1-D4 directly. POL indicates measurement polarity; HV signals over range. C1/C2 are integrator capacitor pins; OSC sets conversion timing; TEST initiates a self-test; STB synchronizes the display latch.',
    pinout: [
      { pin:  1, name: 'IN+',  type: 'input'  },
      { pin:  2, name: 'IN-',  type: 'input'  },
      { pin:  3, name: 'REF+', type: 'input'  },
      { pin:  4, name: 'REF-', type: 'input'  },
      { pin:  5, name: 'C1',   type: 'input'  },
      { pin:  6, name: 'C2',   type: 'input'  },
      { pin:  7, name: 'OSC',  type: 'input'  },
      { pin:  8, name: 'TEST', type: 'input'  },
      { pin:  9, name: 'STB',  type: 'output' },
      { pin: 10, name: 'a',    type: 'output' },
      { pin: 11, name: 'b',    type: 'output' },
      { pin: 12, name: 'c',    type: 'output' },
      { pin: 13, name: 'd',    type: 'output' },
      { pin: 14, name: 'GND',  type: 'power'  },
      { pin: 15, name: 'e',    type: 'output' },
      { pin: 16, name: 'f',    type: 'output' },
      { pin: 17, name: 'g',    type: 'output' },
      { pin: 18, name: 'POL',  type: 'output' },
      { pin: 19, name: 'D1',   type: 'output' },
      { pin: 20, name: 'D2',   type: 'output' },
      { pin: 21, name: 'D3',   type: 'output' },
      { pin: 22, name: 'D4',   type: 'output' },
      { pin: 23, name: 'HV',   type: 'output' },
      { pin: 24, name: 'NC',   type: 'nc'     },
      { pin: 25, name: 'NC2',  type: 'nc'     },
      { pin: 26, name: 'NC3',  type: 'nc'     },
      { pin: 27, name: 'NC4',  type: 'nc'     },
      { pin: 28, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['IN+','IN-','REF+','REF-','C1','C2','OSC','TEST'], outputs: ['STB','a','b','c','d','e','f','g','POL','D1','D2','D3','D4','HV'] },
    ],
  },

  // 74937: ADC for 3.5-digit digital voltmeter with multiplexed BCD outputs (24-pin)
  '74x937': {
    name: '74x937',
    simpleName: 'ADC 3.5-Digit DVM (BCD)',
    description: 'ADC for 3.5-digit digital voltmeters with multiplexed BCD outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['adc', 'analog', 'voltmeter', 'bcd', 'stub'],
    guideOverview: 'The 74x937 is an ADC for 3.5-digit digital voltmeter applications with multiplexed BCD outputs. Like the 74x936 it uses a dual slope integrator for conversion, but outputs the digit values as 4 bit BCD codes (Q0-Q3) instead of 7 segment patterns. Digit select lines D1-D4 cycle through up to four digit positions; POL indicates polarity; HV indicates over range. An external BCD to-7 segment decoder then drives the display. Maximum reading is 1999 (3.5 digits).',
    pinout: [
      { pin:  1, name: 'IN+',  type: 'input'  },
      { pin:  2, name: 'IN-',  type: 'input'  },
      { pin:  3, name: 'REF+', type: 'input'  },
      { pin:  4, name: 'REF-', type: 'input'  },
      { pin:  5, name: 'C1',   type: 'input'  },
      { pin:  6, name: 'C2',   type: 'input'  },
      { pin:  7, name: 'OSC',  type: 'input'  },
      { pin:  8, name: 'TEST', type: 'input'  },
      { pin:  9, name: 'STB',  type: 'output' },
      { pin: 10, name: 'Q0',   type: 'output' },
      { pin: 11, name: 'Q1',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'Q2',   type: 'output' },
      { pin: 14, name: 'Q3',   type: 'output' },
      { pin: 15, name: 'POL',  type: 'output' },
      { pin: 16, name: 'D1',   type: 'output' },
      { pin: 17, name: 'D2',   type: 'output' },
      { pin: 18, name: 'D3',   type: 'output' },
      { pin: 19, name: 'D4',   type: 'output' },
      { pin: 20, name: 'HV',   type: 'output' },
      { pin: 21, name: 'NC',   type: 'nc'     },
      { pin: 22, name: 'NC2',  type: 'nc'     },
      { pin: 23, name: 'NC3',  type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['IN+','IN-','REF+','REF-','C1','C2','OSC','TEST'], outputs: ['STB','Q0','Q1','Q2','Q3','POL','D1','D2','D3','D4','HV'] },
    ],
  },

  // 74938: ADC for 3.75-digit digital voltmeter with multiplexed BCD outputs (24-pin)
  '74x938': {
    name: '74x938',
    simpleName: 'ADC 3.75-Digit DVM (BCD)',
    description: 'ADC for 3.75-digit digital voltmeters with multiplexed BCD outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['adc', 'analog', 'voltmeter', 'bcd', 'stub'],
    guideOverview: 'The 74x938 is an ADC for 3.75-digit digital voltmeter applications with multiplexed BCD outputs. Like the 74x937 it outputs BCD digit data (Q0-Q3) and uses dual slope integration, but provides 3.75-digit resolution (maximum reading 3999) rather than 3.5 digits. Digit select lines D1-D4, polarity (POL), and over range (HV) operate identically to the 74x937. Use when a higher full scale range is required while keeping BCD data outputs for external decoding.',
    pinout: [
      { pin:  1, name: 'IN+',  type: 'input'  },
      { pin:  2, name: 'IN-',  type: 'input'  },
      { pin:  3, name: 'REF+', type: 'input'  },
      { pin:  4, name: 'REF-', type: 'input'  },
      { pin:  5, name: 'C1',   type: 'input'  },
      { pin:  6, name: 'C2',   type: 'input'  },
      { pin:  7, name: 'OSC',  type: 'input'  },
      { pin:  8, name: 'TEST', type: 'input'  },
      { pin:  9, name: 'STB',  type: 'output' },
      { pin: 10, name: 'Q0',   type: 'output' },
      { pin: 11, name: 'Q1',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'Q2',   type: 'output' },
      { pin: 14, name: 'Q3',   type: 'output' },
      { pin: 15, name: 'POL',  type: 'output' },
      { pin: 16, name: 'D1',   type: 'output' },
      { pin: 17, name: 'D2',   type: 'output' },
      { pin: 18, name: 'D3',   type: 'output' },
      { pin: 19, name: 'D4',   type: 'output' },
      { pin: 20, name: 'HV',   type: 'output' },
      { pin: 21, name: 'NC',   type: 'nc'     },
      { pin: 22, name: 'NC2',  type: 'nc'     },
      { pin: 23, name: 'NC3',  type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['IN+','IN-','REF+','REF-','C1','C2','OSC','TEST'], outputs: ['STB','Q0','Q1','Q2','Q3','POL','D1','D2','D3','D4','HV'] },
    ],
  },

  // 74940: Octal bus/line driver/receiver, Schmitt trigger, three-state (20-pin)
  '74x940': {
    name: '74x940',
    simpleName: 'Octal Bus/Line Driver (TRI)',
    description: 'Octal bus/line driver, Schmitt inputs, 3-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['bus driver', 'line receiver', 'octal', 'schmitt trigger', 'tri state', 'stub'],
    guideOverview: 'The 74x940 is an octal non inverting bus/line driver with Schmitt trigger inputs and 3-state outputs. Eight channels buffer their nA inputs to the nY outputs with hysteresis on each input to reject noise and slow slewing signals. OEn (active LOW) places all eight 3-state outputs into high impedance for bus sharing. Use when driving a noisy or long bus line and clean digital transitions are required on the output.',
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: '1A',   type: 'input'  },
      { pin:  3, name: '2A',   type: 'input'  },
      { pin:  4, name: '3A',   type: 'input'  },
      { pin:  5, name: '4A',   type: 'input'  },
      { pin:  6, name: '5A',   type: 'input'  },
      { pin:  7, name: '6A',   type: 'input'  },
      { pin:  8, name: '7A',   type: 'input'  },
      { pin:  9, name: '8A',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '8Y',   type: 'output' },
      { pin: 12, name: '7Y',   type: 'output' },
      { pin: 13, name: '6Y',   type: 'output' },
      { pin: 14, name: '5Y',   type: 'output' },
      { pin: 15, name: '4Y',   type: 'output' },
      { pin: 16, name: '3Y',   type: 'output' },
      { pin: 17, name: '2Y',   type: 'output' },
      { pin: 18, name: '1Y',   type: 'output' },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['OEn','1A','2A','3A','4A','5A','6A','7A','8A'], outputs: ['1Y','2Y','3Y','4Y','5Y','6Y','7Y','8Y'] },
    ],
  },

  // 74941: Octal bus/line driver/receiver, Schmitt trigger, three-state (20-pin)
  '74x941': {
    name: '74x941',
    simpleName: 'Octal Bus/Line Driver (TRI, Inv)',
    description: 'Octal bus/line driver, Schmitt inputs, inverting 3-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['bus driver', 'line receiver', 'octal', 'schmitt trigger', 'tri state', 'stub'],
    guideOverview: 'The 74x941 is the inverting version of the 74x940 an octal bus/line driver with Schmitt trigger inputs and inverting 3-state outputs. Each of the eight channels produces a logic inverted output relative to its nA input, with hysteresis on the input threshold for noise rejection. OEn (active LOW) enables the 3-state outputs. Use when the receiving bus requires inverted polarity and input noise immunity is needed.',
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: '1A',   type: 'input'  },
      { pin:  3, name: '2A',   type: 'input'  },
      { pin:  4, name: '3A',   type: 'input'  },
      { pin:  5, name: '4A',   type: 'input'  },
      { pin:  6, name: '5A',   type: 'input'  },
      { pin:  7, name: '6A',   type: 'input'  },
      { pin:  8, name: '7A',   type: 'input'  },
      { pin:  9, name: '8A',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '8Y',   type: 'output' },
      { pin: 12, name: '7Y',   type: 'output' },
      { pin: 13, name: '6Y',   type: 'output' },
      { pin: 14, name: '5Y',   type: 'output' },
      { pin: 15, name: '4Y',   type: 'output' },
      { pin: 16, name: '3Y',   type: 'output' },
      { pin: 17, name: '2Y',   type: 'output' },
      { pin: 18, name: '1Y',   type: 'output' },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['OEn','1A','2A','3A','4A','5A','6A','7A','8A'], outputs: ['1Y','2Y','3Y','4Y','5Y','6Y','7Y','8Y'] },
    ],
  },

  // 74952: Dual rank 8-bit TRI-STATE I/O shift register, synchronous clear (18-pin)
  //
  // Source: National Semiconductor, "DM74LS952 Dual Rank 8-Bit TRI-STATE Shift
  //   Registers", in "National Semiconductor LS/S TTL Logic Databook" (1989),
  //   p. 2-505..2-508 (doc TL/F/6437). [Online]. Available:
  //   http://bitsavers.org/components/national/_dataBooks/1989_National_LS_S_TTL_Logic_Databook.pdf
  //   Verified: Connection Diagram terminal assignment (p. 2-505) + Function
  //   Table I (p. 2-508), read as a 300-dpi PDF page image (issues.md C4). The
  //   original stub pinout/guide (invented SER/CLK/CLRn/OEn/Q0-Q7) was WRONG and
  //   was replaced from the datasheet, not cloned from a sibling (issues.md C2).
  //   Behaviour drives SHIFT_REG_8BIT_DUALRANK_952 in specificChipsSim.js.
  '74x952': {
    name: '74x952',
    simpleName: 'Dual Rank 8-Bit Shift Register (Sync CLR, TRI)',
    description: 'Dual-rank 8-bit 3-state I/O shift register, sync clear (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: 'http://bitsavers.org/components/national/_dataBooks/1989_National_LS_S_TTL_Logic_Databook.pdf',
    tags: ['shift register', '8 bit', 'dual rank', 'tri state', 'bidirectional', 'bus'],
    sequential: true,
    guideOverview: 'The 74x952 holds two 8-bit registers stacked one above the other and moves data between them. The upper register "A" connects to the eight bidirectional I/O pins: it can be driven out onto those pins, or loaded from whatever is on them. The lower register "B" is the serial shift register, with a serial input (Is) and a serial output (Os). Five control inputs pick what happens on each rising clock edge, and all five are active LOW (a job runs when its control pin is held LOW). DISo LOW drives register A out onto the I/O pins; DISi LOW instead reads the I/O pins into register A, and input wins if both are asserted. DISTU LOW transfers register B up into register A; DISTD LOW transfers register A down into register B; DISs LOW shifts register B one place, with Is entering the first stage and the last stage appearing on Os. Asserting DISTU and DISTD together synchronously clears both registers to zero. Because the two registers are separate, a byte can be held stable on the I/O pins from register A while a new byte is shifted into register B underneath it. The control pins are read independently of the clock level, so the mode can be set up before the edge arrives.',
    guidePinDescriptions: {
      DISo:  'Output disable (active LOW). LOW drives register A onto the I/O pins. HIGH leaves the pins high-impedance unless another mode uses them.',
      Is:    'Serial input. In shift mode (DISs LOW) the level here enters the first stage of register B on the rising clock edge.',
      DISi:  'Input disable (active LOW). LOW loads the levels on the I/O pins into register A on the rising clock edge. Input dominates over output: if DISi and DISo are both LOW, the pins act as inputs.',
      DISTU: 'Transfer-up disable (active LOW). LOW copies register B up into register A on the rising clock edge. LOW together with DISTD synchronously clears both registers.',
      DISTD: 'Transfer-down disable (active LOW). LOW copies register A down into register B on the rising clock edge. LOW together with DISTU synchronously clears both registers.',
      DISs:  'Shift disable (active LOW). LOW shifts register B one place on the rising clock edge: Is enters the first stage, each stage moves toward the last, and the last stage is dropped.',
      Os:    'Serial output. Always driven; shows the last stage of register B, so it is the bit that falls off the end as data shifts through.',
      CLK:   'Clock. All loads, transfers, shifts, and the synchronous clear happen on the rising (LOW-to-HIGH) edge.',
      GND:   'Ground (0 V), pin 9.',
      'I/O1': 'Bidirectional data pin for bit 1 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      'I/O2': 'Bidirectional data pin for bit 2 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      'I/O3': 'Bidirectional data pin for bit 3 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      'I/O4': 'Bidirectional data pin for bit 4 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      'I/O5': 'Bidirectional data pin for bit 5 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      'I/O6': 'Bidirectional data pin for bit 6 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      'I/O7': 'Bidirectional data pin for bit 7 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      'I/O8': 'Bidirectional data pin for bit 8 of register A. Driven out when DISo is LOW; read in when DISi is LOW; otherwise high-impedance.',
      VCC:   'Positive supply, +5 V, pin 18.',
    },
    pinout: [
      { pin:  1, name: 'DISo',  type: 'input'  },
      { pin:  2, name: 'Is',    type: 'input'  },
      { pin:  3, name: 'DISi',  type: 'input'  },
      { pin:  4, name: 'DISTU', type: 'input'  },
      { pin:  5, name: 'DISTD', type: 'input'  },
      { pin:  6, name: 'DISs',  type: 'input'  },
      { pin:  7, name: 'Os',    type: 'output' },
      { pin:  8, name: 'CLK',   type: 'input'  },
      { pin:  9, name: 'GND',   type: 'power'  },
      { pin: 10, name: 'I/O8',  type: 'bidir'  },
      { pin: 11, name: 'I/O7',  type: 'bidir'  },
      { pin: 12, name: 'I/O6',  type: 'bidir'  },
      { pin: 13, name: 'I/O5',  type: 'bidir'  },
      { pin: 14, name: 'I/O4',  type: 'bidir'  },
      { pin: 15, name: 'I/O3',  type: 'bidir'  },
      { pin: 16, name: 'I/O2',  type: 'bidir'  },
      { pin: 17, name: 'I/O1',  type: 'bidir'  },
      { pin: 18, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      // SHIFT_REG_8BIT_DUALRANK_952 — see specificChipsSim.js for the contract.
      //   inputs:  [CLK, Is, DISo, DISi, DISTU, DISTD, DISs, I/O1..I/O8]
      //   outputs: [Os, I/O1..I/O8]   (the I/O pins are bidirectional: listed in
      //                                both inputs (read) and outputs (drive))
      { type: 'SHIFT_REG_8BIT_DUALRANK_952',
        inputs:  ['CLK','Is','DISo','DISi','DISTU','DISTD','DISs',
                  'I/O1','I/O2','I/O3','I/O4','I/O5','I/O6','I/O7','I/O8'],
        outputs: ['Os','I/O1','I/O2','I/O3','I/O4','I/O5','I/O6','I/O7','I/O8'] },
    ],
  },

  // 74x956: Octal bus transceiver and latch with 3-state outputs (24-pin)
  // Source: Texas Instruments, "SN74BCT956 Octal Bus Transceiver and Latch With
  //   3-State Outputs", SCBS088A (Nov 1991, rev. Nov 1993). [Online]. Available:
  //   https://pdf.dzsc.com/88889/16355.pdf. Verified: DW/NT terminal assignment
  //   (top view), FUNCTION TABLE, and Figure 1 bus-management diagrams, pages 1-3,
  //   read as PDF page images (issues.md C4).
  //   The hand-entered stub pinout was WRONG (invented separate OEAn/OEBn enables,
  //   two NC pins, and A0-A7/B0-B7 numbering). Corrected here to the real 24-pin
  //   map: LEAB=1, SAB=2, DIR=3, A1..A8=4..11, GND=12, B8..B1=13..20, OE=21,
  //   SBA=22, LEBA=23, VCC=24 (issues.md C2 — never trust a hand-entered pinout).
  //   Behaviour: the '956 is the LATCH version of the 'BCT646 registered
  //   transceiver. Single active-LOW OE plus DIR select which bus is driven;
  //   each direction has its own transparent latch (LEAB / LEBA, HIGH=transparent,
  //   LOW=hold) and its own real-time/stored select (SAB / SBA, LOW=live bus data,
  //   HIGH=latched data). No existing primitive fit: the 74x547
  //   TRANSCEIVER_OCTAL_LATCH has dual output enables and always outputs the latch
  //   (no select mux); the 74x646 TRANSCEIVER_OCTAL_REG is edge-clocked and also
  //   has no select mux. Added a new TRANSCEIVER_OCTAL_LATCH_SEL primitive.
  '74x956': {
    name: '74x956',
    simpleName: 'Octal Bus Transceiver and Latch (TRI)',
    description: 'Octal bus transceiver, 2 transparent latches, 3-state out (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['transceiver', 'latch', 'octal', 'bus', 'tri state'],
    guideOverview: 'The 74x956 moves eight bits of data in either direction between an A bus and a B bus, and can hold a copy of what crossed. DIR picks the direction and OE (active LOW) turns the outputs on; when OE is HIGH both sides go to high impedance and the chip lets go of the bus. Each direction has its own transparent latch. A latch-enable pin held HIGH lets data pass straight through; dropped LOW it freezes the last value. LEAB controls the A-to-B latch, LEBA the B-to-A latch. A select pin then chooses what that direction actually drives: LOW passes the live bus, HIGH passes the stored value. SAB selects for A-to-B, SBA for B-to-A. That lets you capture a word and keep presenting it while the source bus moves on. It is the latch version of the 74x646 registered transceiver.',
    pinout: [
      { pin:  1, name: 'LEAB', type: 'input'  },
      { pin:  2, name: 'SAB',  type: 'input'  },
      { pin:  3, name: 'DIR',  type: 'input'  },
      { pin:  4, name: 'A1',   type: 'bidir'  },
      { pin:  5, name: 'A2',   type: 'bidir'  },
      { pin:  6, name: 'A3',   type: 'bidir'  },
      { pin:  7, name: 'A4',   type: 'bidir'  },
      { pin:  8, name: 'A5',   type: 'bidir'  },
      { pin:  9, name: 'A6',   type: 'bidir'  },
      { pin: 10, name: 'A7',   type: 'bidir'  },
      { pin: 11, name: 'A8',   type: 'bidir'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'B8',   type: 'bidir'  },
      { pin: 14, name: 'B7',   type: 'bidir'  },
      { pin: 15, name: 'B6',   type: 'bidir'  },
      { pin: 16, name: 'B5',   type: 'bidir'  },
      { pin: 17, name: 'B4',   type: 'bidir'  },
      { pin: 18, name: 'B3',   type: 'bidir'  },
      { pin: 19, name: 'B2',   type: 'bidir'  },
      { pin: 20, name: 'B1',   type: 'bidir'  },
      { pin: 21, name: 'OEn',  type: 'input'  },
      { pin: 22, name: 'SBA',  type: 'input'  },
      { pin: 23, name: 'LEBA', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'TRANSCEIVER_OCTAL_LATCH_SEL',
        inputs: ['OEn','DIR','LEAB','LEBA','SAB','SBA',
                 'A1','A2','A3','A4','A5','A6','A7','A8',
                 'B1','B2','B3','B4','B5','B6','B7','B8'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8',
                  'B1','B2','B3','B4','B5','B6','B7','B8'] },
    ],
  },

  // 74962: Dual rank 8 bit TRI-STATE shift register (18-pin)
  // Source: National Semiconductor, "DM54LS962/DM74LS962 Dual Rank 8-Bit
  //   TRI-STATE Shift Registers," 1987 National LS/S/TTL Logic Databook,
  //   pp. 2-264..2-267. [Online]. Available:
  //   https://www.bitsavers.org/components/national/_dataBooks/1987_National_LS_S_TTL_Logic_Databook.pdf
  //   Verified: general description, connection diagram (18-pin terminal
  //   assignment) and Function Table (Table I) read as 300-dpi PDF page images.
  //   Part identity cross-checked against the Datasheet Archive listing
  //   (https://www.datasheetarchive.com/74ls962-datasheet.html).
  // The pre-existing stub pinout (CLK/SER/XCHG/OEn + Q0-Q7 + four NC pins) was
  // hand-entered and did NOT match the datasheet; it has been replaced in full.
  // Verified pins: DISO(1) IS(2) DISI(3) DISTU(4) DISTD(5) DISS(6) OS(7) CLK(8)
  //   GND(9) I/O8(10) I/O7(11) I/O6(12) I/O5(13) I/O4(14) I/O3(15) I/O2(16)
  //   I/O1(17) VCC(18). All six DIS* control inputs are active LOW; the 8 I/O
  //   pins are bidirectional TRI-STATE (declared 'input', listed in both the
  //   gate inputs and outputs, per the TRANSCEIVER_8BIT convention).
  '74x962': {
    name: '74x962',
    simpleName: 'Dual Rank 8 bit Shift Register (Exchange, TRI)',
    description: 'Dual-rank 8-bit 3-state shift register, parallel + serial (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: 'https://www.bitsavers.org/components/national/_dataBooks/1987_National_LS_S_TTL_Logic_Databook.pdf',
    tags: ['shift register', '8 bit', 'dual rank', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x962 holds two 8 bit ranks that share one clock: register A is a parallel register wired to eight bidirectional I/O pins, and register B is a serial shift register with its own serial input and output. Six control inputs, all active LOW, decide what happens to each rank on the rising clock edge: load A from the I/O pins, copy B up into A, copy A down into B, or shift B one bit. Asserting the up and down transfers together exchanges the two ranks in a single edge. A separate output-enable puts register A onto the I/O pins as a three-state bus driver. The parts cascade through the serial input and output to build wider registers.',
    guidePinDescriptions: {
      'DISO':  'Output disable (active LOW). LOW drives register A onto the I/O pins; HIGH leaves them high-impedance.',
      'IS':    'Serial input. Data entering the shift register (register B) during a shift.',
      'DISI':  'Input disable (active LOW). LOW loads register A from the I/O pins on the clock edge. Overrides the output enable.',
      'DISTU': 'Transfer up disable (active LOW). LOW copies register B into register A on the clock edge.',
      'DISTD': 'Transfer down disable (active LOW). LOW copies register A into register B on the clock edge.',
      'DISS':  'Shift disable (active LOW). LOW shifts register B one bit toward the serial output on the clock edge.',
      'OS':    'Serial output. The last stage of the shift register (register B, bit 8). Always driven.',
      'CLK':   'Clock. Everything happens on the LOW-to-HIGH transition.',
      'IO1':   'Bidirectional I/O bit 1 (register A). Input when loading A, three-state output when driving the bus.',
      'IO2':   'Bidirectional I/O bit 2 (register A).',
      'IO3':   'Bidirectional I/O bit 3 (register A).',
      'IO4':   'Bidirectional I/O bit 4 (register A).',
      'IO5':   'Bidirectional I/O bit 5 (register A).',
      'IO6':   'Bidirectional I/O bit 6 (register A).',
      'IO7':   'Bidirectional I/O bit 7 (register A).',
      'IO8':   'Bidirectional I/O bit 8 (register A).',
      'GND':   'Ground (pin 9).',
      'VCC':   'Positive supply, +5 V (pin 18).',
    },
    pinout: [
      { pin:  1, name: 'DISO',  type: 'input'  },
      { pin:  2, name: 'IS',    type: 'input'  },
      { pin:  3, name: 'DISI',  type: 'input'  },
      { pin:  4, name: 'DISTU', type: 'input'  },
      { pin:  5, name: 'DISTD', type: 'input'  },
      { pin:  6, name: 'DISS',  type: 'input'  },
      { pin:  7, name: 'OS',    type: 'output' },
      { pin:  8, name: 'CLK',   type: 'input'  },
      { pin:  9, name: 'GND',   type: 'power'  },
      { pin: 10, name: 'IO8',   type: 'input'  },
      { pin: 11, name: 'IO7',   type: 'input'  },
      { pin: 12, name: 'IO6',   type: 'input'  },
      { pin: 13, name: 'IO5',   type: 'input'  },
      { pin: 14, name: 'IO4',   type: 'input'  },
      { pin: 15, name: 'IO3',   type: 'input'  },
      { pin: 16, name: 'IO2',   type: 'input'  },
      { pin: 17, name: 'IO1',   type: 'input'  },
      { pin: 18, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'DUAL_RANK_SHIFT_962',
        inputs:  ['CLK','IS','DISO','DISI','DISTU','DISTD','DISS',
                  'IO1','IO2','IO3','IO4','IO5','IO6','IO7','IO8'],
        outputs: ['OS','IO1','IO2','IO3','IO4','IO5','IO6','IO7','IO8'] },
    ],
  },

  // 74963: Dual-rank 8-bit shift register, synchronous clear, 3-state I/O bus (20-pin)
  // Source: Texas Instruments, "SN54ALS963, SN54ALS964, SN74ALS963, SN74ALS964
  //   Dual-Rank 8-Bit Shift Registers With 3-State Outputs", document D2881
  //   (Nov 1985, rev May 1986), in "The TTL Data Book, ALS/AS Logic" (1986),
  //   pp. 2-783..2-790. [Online]. Available (scanned): http://bitsavers.org/
  //   components/ti/_dataBooks/1986_TI_ALS_AS_Logic_Data_Book.pdf. Verified:
  //   terminal assignment (DW/NT 20-pin DIP, p.2-783), function table (p.2-786),
  //   and "typical sequence" timing waveform (p.2-790), read as PDF page images.
  //   Pinout, control-gate polarities and shift direction (toward A/MSB, SERIN in
  //   at H, SEROUT from A) all taken from those pages; the hand-entered stub
  //   pinout (Q0..Q7/QA0..QA3) was wrong and has been replaced.
  '74x963': {
    name: '74x963',
    simpleName: 'Dual Rank 8 bit Shift Register (Sync CLR, TRI, 20-pin)',
    description: 'Dual-rank 8-bit 3-state shift register, serial/parallel I/O (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'http://bitsavers.org/components/ti/_dataBooks/1986_TI_ALS_AS_Logic_Data_Book.pdf',
    tags: ['shift register', '8 bit', 'dual rank', 'tri state', 'bidirectional'],
    sequential: true,
    guideOverview: 'The 74x963 holds two 8-bit registers side by side and moves data between them. One is a parallel I/O register (Reg 1) wired to eight bidirectional pins, A through H; the other is a shift register (Reg 2) with a serial input (SERIN) and serial output (SEROUT). Each register has its own clock: Reg 1 updates on a rising edge of CLK1, Reg 2 on a rising edge of CLK2. Active-low gate inputs pick what happens on each edge   load Reg 1 from the A-H pins (GIN), copy Reg 2 into Reg 1 (G21), copy Reg 1 into Reg 2 (G12), or shift Reg 2 one place toward A (GSH). Opening both copy gates on both clocks at once swaps the two registers in a single step. SCLR is an active-high synchronous clear. OE (active low) enables the three-state drivers so Reg 1 shows on the A-H pins; with OE high those pins go high-impedance and act as inputs. Together this gives serial-to-parallel and parallel-to-serial conversion plus register-to-register exchange without any external wiring.',
    guidePinDescriptions: {
      'OEn':   'Output enable, active low. LOW drives Reg 1 onto the A-H pins; HIGH leaves them high-impedance so they can be used as inputs.',
      'SERIN': 'Serial data into the shift register (Reg 2). Sampled on a rising CLK2 edge when shifting.',
      'GINn':  'Input gate, active low. When LOW, a rising CLK1 edge loads Reg 1 from the A-H pins.',
      'G21n':  'Reg 2 to Reg 1 gate, active low. When LOW, a rising CLK1 edge copies Reg 2 into Reg 1 (ORed with the pins if GIN is also low).',
      'SCLR':  'Synchronous clear, active high. Clears Reg 1 on a CLK1 edge and Reg 2 on a CLK2 edge.',
      'G12n':  'Reg 1 to Reg 2 gate, active low. When LOW, a rising CLK2 edge copies Reg 1 into Reg 2.',
      'GSHn':  'Shift gate, active low. When LOW (and G12 high), a rising CLK2 edge shifts Reg 2 one place toward A.',
      'SEROUT':'Serial output: the A-end (MSB) bit of the shift register (Reg 2).',
      'CLK2':  'Clock for the shift register (Reg 2). Rising-edge triggered.',
      'CLK1':  'Clock for the parallel I/O register (Reg 1). Rising-edge triggered.',
      'IOA':   'Bidirectional bit A (MSB) of the I/O register. Output when OE low, input when OE high.',
      'IOB':   'Bidirectional bit B of the I/O register.',
      'IOC':   'Bidirectional bit C of the I/O register.',
      'IOD':   'Bidirectional bit D of the I/O register.',
      'IOE':   'Bidirectional bit E of the I/O register.',
      'IOF':   'Bidirectional bit F of the I/O register.',
      'IOG':   'Bidirectional bit G of the I/O register.',
      'IOH':   'Bidirectional bit H (LSB) of the I/O register.',
      'GND':   'Ground (pin 10).',
      'VCC':   'Supply, +5 V (pin 20).',
    },
    pinout: [
      { pin:  1, name: 'OEn',    type: 'input'  },
      { pin:  2, name: 'SERIN',  type: 'input'  },
      { pin:  3, name: 'GINn',   type: 'input'  },
      { pin:  4, name: 'G21n',   type: 'input'  },
      { pin:  5, name: 'SCLR',   type: 'input'  },
      { pin:  6, name: 'G12n',   type: 'input'  },
      { pin:  7, name: 'GSHn',   type: 'input'  },
      { pin:  8, name: 'SEROUT', type: 'output' },
      { pin:  9, name: 'CLK2',   type: 'input'  },
      { pin: 10, name: 'GND',    type: 'power'  },
      { pin: 11, name: 'CLK1',   type: 'input'  },
      { pin: 12, name: 'IOH',    type: 'io'     },
      { pin: 13, name: 'IOG',    type: 'io'     },
      { pin: 14, name: 'IOF',    type: 'io'     },
      { pin: 15, name: 'IOE',    type: 'io'     },
      { pin: 16, name: 'IOD',    type: 'io'     },
      { pin: 17, name: 'IOC',    type: 'io'     },
      { pin: 18, name: 'IOB',    type: 'io'     },
      { pin: 19, name: 'IOA',    type: 'io'     },
      { pin: 20, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      { type: 'SHIFT_REG_DUAL_RANK_963',
        inputs:  ['OEn','SERIN','GINn','G21n','SCLR','G12n','GSHn','CLK2','CLK1',
                  'IOA','IOB','IOC','IOD','IOE','IOF','IOG','IOH'],
        outputs: ['SEROUT','IOA','IOB','IOC','IOD','IOE','IOF','IOG','IOH'] },
    ],
  },

  // 74964: Dual-rank 8-bit shift register, synchronous + asynchronous clear, 3-state I/O bus (20-pin)
  // Real part: TI SN74ALS964 (SN54ALS964). Pinout + function table verified against
  // the 1986 TI ALS/AS Logic Data Book, pp. 2-783..2-791 (see the primitive
  // _evaluateShiftReg8BitDualRank964 in js/specificChipsSim.js for the full IEEE
  // citation). The original stub pinout was wrong (missing pins 1-4, invented
  // QA0..QA3) and has been corrected to the datasheet terminal assignment.
  '74x964': {
    name: '74x964',
    simpleName: 'Dual Rank 8 bit Shift Register (Sync+Async CLR, TRI)',
    description: 'Dual-rank 8-bit 3-state shift register: sync/async clear (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'http://bitsavers.org/components/ti/_dataBooks/1986_TI_ALS_AS_Logic_Data_Book.pdf',
    tags: ['shift register', '8 bit', 'dual rank', 'bidirectional', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x964 holds two separate 8-bit registers that share one clock. Register 1 is the I/O register: it connects to eight two-way pins (A/QA through H/QH) and can either drive them with its stored byte or read a byte in from them. Register 2 is a plain shift register — a bit enters at SERIN, moves one place along on each rising clock edge, and leaves at SEROUT. Five active-low control lines pick what happens on the clock edge: load Register 1 from the pins (GIN), copy Register 2 into Register 1 (G2-1), copy Register 1 into Register 2 (G1-2), or shift Register 2 (GSH). Pulling both copy lines low at once swaps the two registers in a single clock. SCLR clears both registers on the next clock edge; ACLR clears them the instant it goes high. OE is the output enable for the eight I/O pins: hold it low to drive them, high to leave them high-impedance so something else can share the bus.',
    guidePinDescriptions: {
      OE:     'Output enable for the eight I/O pins, active low. Low drives A/QA–H/QH from Register 1; high leaves them high-impedance. It does nothing while the pins are used as inputs (GIN low), and never affects SEROUT.',
      SERIN:  'Serial data input. With GSH low, the level here enters the first stage of Register 2 (the A end) on the rising clock edge.',
      GIN:    'Input enable, active low. Low turns the eight I/O pins into inputs and loads their byte into Register 1 on the rising clock edge.',
      'G2-1': 'Register-2-to-1 transfer, active low. Low copies Register 2 into Register 1 on the rising clock edge. With GIN also low, Register 1 loads the bit-by-bit OR of the pins and Register 2.',
      SCLR:   'Synchronous clear, active high. High clears both registers on the next rising clock edge. A pin load into Register 1 (GIN low) still happens while Register 2 is cleared.',
      'G1-2': 'Register-1-to-2 transfer, active low. Low copies Register 1 into Register 2 on the rising clock edge. It overrides GSH, so copy beats shift.',
      GSH:    'Shift enable for Register 2, active low. Low shifts Register 2 one place toward the H end on the rising clock edge (SERIN in at A, SEROUT out at H).',
      SEROUT: 'Serial data output. Always shows the last stage of Register 2 (the H end). Not affected by OE.',
      CLK:    'Clock input. Every transfer, shift, load, and the synchronous clear happens on the rising (low-to-high) edge.',
      GND:    'Ground, 0 V.',
      ACLR:   'Asynchronous clear, active high. High clears both registers immediately, with no clock needed, and overrides everything else.',
      'A/QA': 'Two-way data pin for bit A — the first shift stage, where SERIN enters Register 2. Driven from Register 1 (bit A) when OE is low; read into Register 1 when GIN is low.',
      'B/QB': 'Two-way data pin for bit B. Driven from Register 1 when OE is low; read into Register 1 when GIN is low.',
      'C/QC': 'Two-way data pin for bit C. Driven from Register 1 when OE is low; read into Register 1 when GIN is low.',
      'D/QD': 'Two-way data pin for bit D. Driven from Register 1 when OE is low; read into Register 1 when GIN is low.',
      'E/QE': 'Two-way data pin for bit E. Driven from Register 1 when OE is low; read into Register 1 when GIN is low.',
      'F/QF': 'Two-way data pin for bit F. Driven from Register 1 when OE is low; read into Register 1 when GIN is low.',
      'G/QG': 'Two-way data pin for bit G. Driven from Register 1 when OE is low; read into Register 1 when GIN is low.',
      'H/QH': 'Two-way data pin for bit H — the last shift stage, the one SEROUT taps. Driven from Register 1 (bit H) when OE is low; read into Register 1 when GIN is low.',
      VCC:    'Positive supply, 5 V.',
    },
    pinout: [
      { pin:  1, name: 'OE',     type: 'input'  },
      { pin:  2, name: 'SERIN',  type: 'input'  },
      { pin:  3, name: 'GIN',    type: 'input'  },
      { pin:  4, name: 'G2-1',   type: 'input'  },
      { pin:  5, name: 'SCLR',   type: 'input'  },
      { pin:  6, name: 'G1-2',   type: 'input'  },
      { pin:  7, name: 'GSH',    type: 'input'  },
      { pin:  8, name: 'SEROUT', type: 'output' },
      { pin:  9, name: 'CLK',    type: 'input'  },
      { pin: 10, name: 'GND',    type: 'power'  },
      { pin: 11, name: 'ACLR',   type: 'input'  },
      { pin: 12, name: 'H/QH',   type: 'output' },
      { pin: 13, name: 'G/QG',   type: 'output' },
      { pin: 14, name: 'F/QF',   type: 'output' },
      { pin: 15, name: 'E/QE',   type: 'output' },
      { pin: 16, name: 'D/QD',   type: 'output' },
      { pin: 17, name: 'C/QC',   type: 'output' },
      { pin: 18, name: 'B/QB',   type: 'output' },
      { pin: 19, name: 'A/QA',   type: 'output' },
      { pin: 20, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      // SHIFT_REG_8BIT_DUALRANK_964 — see specificChipsSim.js for the contract.
      // The eight I/O ports A/QA..H/QH are bidirectional, so each appears in BOTH
      // inputs (read the bus when released) and outputs (drive it from Reg 1).
      { type: 'SHIFT_REG_8BIT_DUALRANK_964',
        inputs:  ['OE', 'GIN', 'G2-1', 'G1-2', 'GSH', 'CLK', 'ACLR', 'SCLR', 'SERIN',
                  'A/QA', 'B/QB', 'C/QC', 'D/QD', 'E/QE', 'F/QF', 'G/QG', 'H/QH'],
        outputs: ['SEROUT',
                  'A/QA', 'B/QB', 'C/QC', 'D/QD', 'E/QE', 'F/QF', 'G/QG', 'H/QH'] },
    ],
    guideSections: [
      {
        title: 'Two registers, one clock',
        paragraphs: [
          'Inside the 74x964 are two 8-bit registers side by side. Register 1 is the I/O register — its eight bits reach the outside on the two-way pins A/QA through H/QH. Register 2 is a shift register: bits march through it from the A end to the H end, one place per clock. Both registers run off the single CLK pin, and everything happens on its rising edge.',
          'The eight bit positions line up across the two registers, so a single clock can move a whole byte between them. That is what "dual rank" means here: two full-width ranks that can hand a byte back and forth.',
        ],
        formulas: [
          'Register 1 (I/O register) ↔ pins A/QA … H/QH',
          'Register 2 (shift register): SERIN → A → B → … → H → SEROUT',
        ],
      },
      {
        title: 'Moving data around',
        paragraphs: [
          'Four active-low control lines each switch on one path on the rising clock edge. GIN low reads the byte on the pins into Register 1. G2-1 low copies Register 2 into Register 1. G1-2 low copies Register 1 into Register 2. GSH low shifts Register 2 one place (a new bit in from SERIN, the old H bit out to SEROUT). If none of them is active, both registers just hold their data through the clock.',
          'Because each path is separate, they combine. GIN and G2-1 together load Register 1 with the OR of the pins and Register 2. G1-2 and G2-1 together exchange the registers — both are read before either is written, so the two bytes swap in one clock. And G1-2 overrides GSH, so asking to both copy into and shift Register 2 gives the copy.',
        ],
        formulas: [
          'GIN = 0            → Register 1 ← pins',
          'G2-1 = 0           → Register 1 ← Register 2',
          'GIN = 0 and G2-1 = 0 → Register 1 ← pins OR Register 2',
          'G1-2 = 0           → Register 2 ← Register 1',
          'GSH = 0            → Register 2 shifts (SERIN → A … H → SEROUT)',
          'G1-2 = 0 and G2-1 = 0 → the two registers swap',
        ],
      },
      {
        title: 'Clearing and the 3-state bus',
        paragraphs: [
          'There are two ways to zero the chip. ACLR is asynchronous: the moment it goes high both registers clear, no clock required, and it beats every other input. SCLR is synchronous: it waits for the next rising clock edge, then clears. One useful detail — SCLR only forces the Register 2 side of each path to zero, so if GIN is low at the same time, Register 1 still loads the pins while Register 2 is cleared.',
          'OE controls the eight I/O pins as a group. Low, and Register 1 drives them. High, and they go high-impedance so another device can drive the bus. OE does not touch SEROUT, which always shows the H end of Register 2. And whenever GIN is low the pins are inputs regardless of OE.',
        ],
        formulas: [
          'ACLR = 1 → clear both registers now (overrides all)',
          'SCLR = 1 → clear both on next rising CLK edge',
          'OE = 0 → pins driven from Register 1;  OE = 1 → pins high-impedance',
          'GIN = 0 → pins are inputs (overrides OE)',
        ],
        note: '74Sim models the 74x964 as an ideal dual-rank register: one rising-edge clock for all transfers, shifts, and loads; a level-sensitive asynchronous clear; and the 3-state I/O bus released to high-impedance whenever it is an input or output-disabled. As with all 74Sim sequential parts there is no propagation delay, so the brief master/slave settling of the real two-rank silicon is not reproduced — the settled data is correct (see issues.md A1). The original TI datasheet is a Product Preview, so a few AC timing limits were never finalized; only the logic behavior is modeled.',
      },
    ],
  },
};