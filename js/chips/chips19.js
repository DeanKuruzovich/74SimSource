// Chip definitions block 19
// Chips: 74x286-74x303

export const CHIPS_BLOCK_19 = {

  // ── 74286: 9 bit Parity Generator/Checker, Bus Driver ─────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Parity_bit */
  '74x286': {
    name: '74x286',
    simpleName: '9 bit Parity Bus Driver',
    description: '9 bit parity generator/checker with parity I/O port (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    tags: ['parity', '9 bit', 'bus driver', 'generator', 'checker'],
    guideOverview: 'The 74x286 is a 9 bit parity generator/checker for bus systems. It adds a PE (Parity Enable) input to the 9 data bits (A-I), which is XORed with the rest. Presenting 8 data bits plus a received parity bit through A-I lets EVEN/ODD indicate a correct or incorrect parity check.',
    guidePinDescriptions: {
      'A':    'Parity input A.',
      'B':    'Parity input B.',
      'C':    'Parity input C.',
      'D':    'Parity input D.',
      'E':    'Parity input E.',
      'F':    'Parity input F.',
      'GND':  'Ground reference (pin 7).',
      'G':    'Parity input G.',
      'H':    'Parity input H.',
      'I':    'Parity input I.',
      'PE':   'Parity Enable / External parity input. XORed with A-I. Tie LOW when not used.',
      'EVEN': 'Even parity output. HIGH when an even number of inputs are HIGH.',
      'ODD':  'Odd parity output. Complement of EVEN.',
      'VCC':  'Positive supply (+5 V, pin 14).',
    },
    pinout: [
      { pin:  1, name: 'A',    type: 'input' },
      { pin:  2, name: 'B',    type: 'input' },
      { pin:  3, name: 'C',    type: 'input' },
      { pin:  4, name: 'D',    type: 'input' },
      { pin:  5, name: 'E',    type: 'input' },
      { pin:  6, name: 'F',    type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'G',    type: 'input' },
      { pin:  9, name: 'H',    type: 'input' },
      { pin: 10, name: 'I',    type: 'input' },
      { pin: 11, name: 'PE',   type: 'input' },
      { pin: 12, name: 'EVEN', type: 'output' },
      { pin: 13, name: 'ODD',  type: 'output' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'PARITY_9BIT_PE', inputs: ['A','B','C','D','E','F','G','H','I','PE'], outputs: ['EVEN','ODD'] },
    ],
    guideSections: [
      {
        title: 'Bus Parity with PE Input',
        paragraphs: [
          'For generation: drive A-H with data, tie I and PE to 0. Append EVEN or ODD output as the parity bit. For checking: drive A-H with data, I with received parity, PE=0. EVEN=HIGH confirms even parity.',
        ],
      },
    ],
  },

  // -- 74289: 64 bit RAM (16×4), OC, Inverted Outputs ───────────────────────
  // ── 74289: RAM 16×4 (OC, inv), 16-pin ──────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x289': {
    name: '74x289',
    simpleName: 'RAM 16×4 (OC, inv)',
    description: '64 bit static RAM (16×4), open collector inverted outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    openCollector: true, sequential: true,
    tags: ['ram', 'memory', '16x4', 'open collector', 'static'],
    guideOverview: 'The 74x289 is a 64 bit static RAM organized as 16 words by 4 bits with open collector, inverted outputs. A0-A3 address 16 locations. CS (active LOW) and WE (active LOW) control access. During write, D0-D3 are stored. During read, Q0-Q3 provide inverted stored data via open collector outputs requiring external pull ups.',
    guidePinDescriptions: {
      'A0':  'Address bit 0 (LSB).',
      'A1':  'Address bit 1.',
      'A2':  'Address bit 2.',
      'A3':  'Address bit 3 (MSB).',
      'CSn': 'Chip Select (active LOW). When HIGH, outputs and write are disabled.',
      'WEn': 'Write Enable (active LOW). When LOW with CSn=LOW, writes D0-D3.',
      'D0':  'Data input bit 0.',
      'GND': 'Ground reference (pin 8).',
      'D1':  'Data input bit 1.',
      'D2':  'Data input bit 2.',
      'D3':  'Data input bit 3.',
      'Q3n': 'Inverted data output bit 3 (open collector).',
      'Q2n': 'Inverted data output bit 2.',
      'Q1n': 'Inverted data output bit 1.',
      'Q0n': 'Inverted data output bit 0. LOW = stored 1; HIGH = stored 0.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'A0',  type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'CSn', type: 'input' },
      { pin:  6, name: 'WEn', type: 'input' },
      { pin:  7, name: 'D0',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'D1',  type: 'input' },
      { pin: 10, name: 'D2',  type: 'input' },
      { pin: 11, name: 'D3',  type: 'input' },
      { pin: 12, name: 'Q3n', type: 'output' },
      { pin: 13, name: 'Q2n', type: 'output' },
      { pin: 14, name: 'Q1n', type: 'output' },
      { pin: 15, name: 'Q0n', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_16X4_OC_INV', inputs: ['A0','A1','A2','A3','CSn','WEn','D0','D1','D2','D3'], outputs: ['Q0n','Q1n','Q2n','Q3n'] },
    ],
    guideSections: [
      {
        title: 'Reading Inverted OC Outputs',
        paragraphs: [
          'Add external pull up resistors to VCC on each Qn line. Multiple 74x289s can share a wired AND bus by enabling only one chip at a time via CSn.',
        ],
      },
    ],
  },

  // -- 74290: Decade Counter (÷2 and ÷5 sections) ────────────────────────────
  // ── 74290: Decade Counter (÷2+÷5), 14-pin ──────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x290': {
    name: '74x290',
    simpleName: 'Decade Counter (÷2+÷5)',
    description: 'Decade counter with separate divide by-2 and divide by-5 sections (14-pin)',
    pins: 14, vcc: 5, gnd: 10,
    sequential: true,
    tags: ['counter', 'decade', 'bcd', 'divide by-2', 'divide by-5'],
    guideOverview: 'The 74x290 is a decade counter built from a divide by-2 section (CLK_A to QA) and a divide by-5 section (CLK_B to QB-QD). Connect QA to CLK_B for a 0-9 BCD counter. R01 and R02 both HIGH asynchronously reset to 0000; R91 and R92 both HIGH asynchronously set to 1001 (decimal 9).',
    guidePinDescriptions: {
      'CLK_A': 'Clock for the divide by-2 section. Falling edge triggered.',
      'R01':   'Reset input 1. R01 and R02 both HIGH clears all outputs.',
      'R02':   'Reset input 2.',
      'NC1':   'Not connected.',
      'VCC':   'Positive supply (pin 5).',
      'R91':   'Set-to-9 input 1. Both HIGH sets outputs to 1001.',
      'R92':   'Set-to-9 input 2.',
      'QD':    'Divide by-5 bit 3 (MSB of BCD).',
      'QC':    'Divide by-5 bit 2.',
      'GND':   'Ground reference (pin 10).',
      'QB':    'Divide by-5 bit 1.',
      'QA':    'Divide by-2 output (LSB). Connect to CLK_B for decade mode.',
      'NC2':   'Not connected.',
      'CLK_B': 'Clock for the divide by-5 section. Falling edge triggered.',
    },
    pinout: [
      { pin:  1, name: 'CLK_A', type: 'input' },
      { pin:  2, name: 'R01',   type: 'input' },
      { pin:  3, name: 'R02',   type: 'input' },
      { pin:  4, name: 'NC1',   type: 'nc' },
      { pin:  5, name: 'VCC',   type: 'power' },
      { pin:  6, name: 'R91',   type: 'input' },
      { pin:  7, name: 'R92',   type: 'input' },
      { pin:  8, name: 'QD',    type: 'output' },
      { pin:  9, name: 'QC',    type: 'output' },
      { pin: 10, name: 'GND',   type: 'power' },
      { pin: 11, name: 'QB',    type: 'output' },
      { pin: 12, name: 'QA',    type: 'output' },
      { pin: 13, name: 'NC2',   type: 'nc' },
      { pin: 14, name: 'CLK_B', type: 'input' },
    ],
    gates: [
      { type: 'COUNTER_DECADE_DIV', inputs: ['CLK_A','CLK_B','R01','R02','R91','R92'], outputs: ['QA','QB','QC','QD'] },
    ],
    guideSections: [
      {
        title: 'BCD Decade Wiring',
        paragraphs: [
          'Connect QA to CLK_B. Tie R01/R02 LOW unless reset is needed. QDQCQBQA counts 0000-1001 (0-9) then wraps.',
        ],
      },
    ],
  },

  // -- 74292: Programmable Frequency Divider/Digital Timer ───────────────────
  // ── 74292: Prog. Freq Divider, 16-pin ──────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  '74x292': {
    name: '74x292',
    simpleName: 'Prog. Freq Divider',
    description: 'Programmable frequency divider and digital timer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    tags: ['timer', 'frequency divider', 'programmable'],
    guideOverview: 'The 74x292 is a programmable frequency divider. Ten select inputs (S0-S9) configure the division ratio N; the output frequency equals the CLK frequency divided by N. Achieves ratios from 1 to 1024 depending on the S0-S9 pattern. Useful for baud rate generation or display timing.',
    guidePinDescriptions: {
      'CLK': 'Clock input.',
      'S0':  'Division select bit 0 (LSB).',
      'S1':  'Division select bit 1.',
      'S2':  'Division select bit 2.',
      'S3':  'Division select bit 3.',
      'S4':  'Division select bit 4.',
      'S5':  'Division select bit 5.',
      'GND': 'Ground reference (pin 8).',
      'S6':  'Division select bit 6.',
      'S7':  'Division select bit 7.',
      'S8':  'Division select bit 8.',
      'S9':  'Division select bit 9 (MSB).',
      'OUT': 'Divided clock output.',
      'NC1': 'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'CLK', type: 'input' },
      { pin:  2, name: 'S0',  type: 'input' },
      { pin:  3, name: 'S1',  type: 'input' },
      { pin:  4, name: 'S2',  type: 'input' },
      { pin:  5, name: 'S3',  type: 'input' },
      { pin:  6, name: 'S4',  type: 'input' },
      { pin:  7, name: 'S5',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'S6',  type: 'input' },
      { pin: 10, name: 'S7',  type: 'input' },
      { pin: 11, name: 'S8',  type: 'input' },
      { pin: 12, name: 'S9',  type: 'input' },
      { pin: 13, name: 'OUT', type: 'output' },
      { pin: 14, name: 'NC1', type: 'nc' },
      { pin: 15, name: 'NC2', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'FREQ_DIV_PROG', inputs: ['CLK','S0','S1','S2','S3','S4','S5','S6','S7','S8','S9'], outputs: ['OUT'] },
    ],
    guideSections: [
      {
        title: 'Programmable Division Ratio',
        paragraphs: [
          'Set S0-S9 to hard wire a division ratio N. f_out = f_clk / N.',
        ],
        formulas: [
          'f_out = f_clk / N',
        ],
      },
    ],
  },

  // -- 74293: 4 bit Binary Counter (÷2 and ÷8 sections) ─────────────────────
  // ── 74293: 4 bit Counter (÷2+÷8), 14-pin ───────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x293': {
    name: '74x293',
    simpleName: '4 bit Counter (÷2+÷8)',
    description: '4 bit binary counter, separate divide-by-2 and divide-by-8 (14-pin)',
    pins: 14, vcc: 5, gnd: 10,
    sequential: true,
    tags: ['counter', '4 bit', 'binary', 'divide by-2', 'divide by-8'],
    guideOverview: 'The 74x293 is a 4 bit binary counter with a divide by-2 section (CLK_A to QA) and a divide by-8 section (CLK_B to QB-QD). Connect QA to CLK_B for a 4 bit 0-15 binary counter. R01 and R02 both HIGH reset all outputs. No set-to-9 like the 74x290.',
    guidePinDescriptions: {
      'CLK_A': 'Clock for divide by-2 section. Falling edge triggered.',
      'R01':   'Reset input 1. Both HIGH clears all outputs.',
      'R02':   'Reset input 2.',
      'NC1':   'Not connected.',
      'VCC':   'Positive supply (pin 5).',
      'NC2':   'Not connected.',
      'NC3':   'Not connected.',
      'QD':    'Divide by-8 bit 3 (MSB).',
      'QC':    'Divide by-8 bit 2.',
      'GND':   'Ground reference (pin 10).',
      'QB':    'Divide by-8 bit 1.',
      'QA':    'Divide by-2 output (LSB). Connect to CLK_B for 4 bit binary count.',
      'NC4':   'Not connected.',
      'CLK_B': 'Clock for divide by-8 section.',
    },
    pinout: [
      { pin:  1, name: 'CLK_A', type: 'input' },
      { pin:  2, name: 'R01',   type: 'input' },
      { pin:  3, name: 'R02',   type: 'input' },
      { pin:  4, name: 'NC1',   type: 'nc' },
      { pin:  5, name: 'VCC',   type: 'power' },
      { pin:  6, name: 'NC2',   type: 'nc' },
      { pin:  7, name: 'NC3',   type: 'nc' },
      { pin:  8, name: 'QD',    type: 'output' },
      { pin:  9, name: 'QC',    type: 'output' },
      { pin: 10, name: 'GND',   type: 'power' },
      { pin: 11, name: 'QB',    type: 'output' },
      { pin: 12, name: 'QA',    type: 'output' },
      { pin: 13, name: 'NC4',   type: 'nc' },
      { pin: 14, name: 'CLK_B', type: 'input' },
    ],
    gates: [
      { type: 'COUNTER_4BIT_DIV', inputs: ['CLK_A','CLK_B','R01','R02'], outputs: ['QA','QB','QC','QD'] },
    ],
    guideSections: [
      {
        title: '4 bit Binary Counter',
        paragraphs: [
          'Connect QA to CLK_B for a 0-15 count on QDQCQBQA. Tie R01/R02 LOW unless asynchronous reset is needed.',
        ],
      },
    ],
  },

  // -- 74294: Programmable Frequency Divider/Digital Timer (variant B) ────────
  // ── 74294: Prog. Freq Divider (B), 16-pin ──────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  '74x294': {
    name: '74x294',
    simpleName: 'Prog. Freq Divider (B)',
    description: 'Programmable frequency divider and digital timer (variant) (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    tags: ['timer', 'frequency divider', 'programmable'],
    guideOverview: 'The 74x294 is functionally equivalent to the 74x292 but uses a different process variant. Ten select inputs (S0-S9) set the division ratio N and f_out = f_clk / N. Refer to the 74x292 guide for usage details.',
    guidePinDescriptions: {
      'CLK': 'Clock input.',
      'S0':  'Division select bit 0.',
      'S1':  'Division select bit 1.',
      'S2':  'Division select bit 2.',
      'S3':  'Division select bit 3.',
      'S4':  'Division select bit 4.',
      'S5':  'Division select bit 5.',
      'GND': 'Ground reference (pin 8).',
      'S6':  'Division select bit 6.',
      'S7':  'Division select bit 7.',
      'S8':  'Division select bit 8.',
      'S9':  'Division select bit 9.',
      'OUT': 'Divided clock output.',
      'NC1': 'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'CLK', type: 'input' },
      { pin:  2, name: 'S0',  type: 'input' },
      { pin:  3, name: 'S1',  type: 'input' },
      { pin:  4, name: 'S2',  type: 'input' },
      { pin:  5, name: 'S3',  type: 'input' },
      { pin:  6, name: 'S4',  type: 'input' },
      { pin:  7, name: 'S5',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'S6',  type: 'input' },
      { pin: 10, name: 'S7',  type: 'input' },
      { pin: 11, name: 'S8',  type: 'input' },
      { pin: 12, name: 'S9',  type: 'input' },
      { pin: 13, name: 'OUT', type: 'output' },
      { pin: 14, name: 'NC1', type: 'nc' },
      { pin: 15, name: 'NC2', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'FREQ_DIV_PROG', inputs: ['CLK','S0','S1','S2','S3','S4','S5','S6','S7','S8','S9'], outputs: ['OUT'] },
    ],
    guideSections: [
      {
        title: 'Variant B',
        paragraphs: [
          'The 74x294 is identical in function to the 74x292; the variant designation indicates a different technology process (speed/power trade off).',
        ],
      },
    ],
  },

  // -- 74295: 4 bit Bidirectional Shift Register, Tri state ──────────────────
  // ── 74295: 4 bit Bidir Shift Reg (3-state), 14-pin ─────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Shift_register
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x295': {
    name: '74x295',
    simpleName: '4 bit Bidir Shift Reg (3-state)',
    description: '4 bit bidirectional shift register with tri state outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    sequential: true,
    tags: ['shift register', '4 bit', 'bidirectional', 'tri state'],
    guideOverview: 'The 74x295 is a 4 bit bidirectional shift register with 3-state outputs. MODE HIGH = serial shift (data enters at SER); MODE LOW = parallel load from A-D on the clock edge. Output Enable (active LOW): when asserted (LOW), drives Q outputs; when HIGH, tri states them for bus connection.',
    guidePinDescriptions: {
      'SER':  'Serial input. Data enters at QA on each clock when MODE=HIGH.',
      'A':    'Parallel data input A. Loaded when MODE=LOW on CLK edge.',
      'B':    'Parallel data input B.',
      'C':    'Parallel data input C.',
      'D':    'Parallel data input D.',
      'MODE': 'Mode select. HIGH = serial shift; LOW = parallel load.',
      'GND':  'Ground reference (pin 7).',
      'CLK':  'Clock input. Rising edge triggered.',
      'OEn':  'Output Enable (active LOW). When asserted (LOW), drives QA-QD; when HIGH, tri states them.',
      'QD':   'Output bit D (MSB / serial out end).',
      'QC':   'Output bit C.',
      'QB':   'Output bit B.',
      'QA':   'Output bit A (LSB / serial in end).',
      'VCC':  'Positive supply (+5 V, pin 14).',
    },
    pinout: [
      { pin:  1, name: 'SER',  type: 'input' },
      { pin:  2, name: 'A',    type: 'input' },
      { pin:  3, name: 'B',    type: 'input' },
      { pin:  4, name: 'C',    type: 'input' },
      { pin:  5, name: 'D',    type: 'input' },
      { pin:  6, name: 'MODE', type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'CLK',  type: 'input' },
      { pin:  9, name: 'OEn',  type: 'input' },
      { pin: 10, name: 'QD',   type: 'output' },
      { pin: 11, name: 'QC',   type: 'output' },
      { pin: 12, name: 'QB',   type: 'output' },
      { pin: 13, name: 'QA',   type: 'output' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'SHIFT_REG_4BIT_BIDIR_TRI', inputs: ['SER','A','B','C','D','MODE','CLK','OEn'], outputs: ['QA','QB','QC','QD'] },
    ],
    guideSections: [
      {
        title: 'Serial/Parallel Conversion',
        paragraphs: [
          'Set MODE=LOW and clock once to parallel load A-D. Then set MODE=HIGH and clock four times; bits shift out QD while SER feeds new bits at QA.',
        ],
      },
    ],
  },

  // -- 74298: Quad 2 Input Multiplexer with Storage ──────────────────────────
  // ── 74298: Quad 2:1 Mux/Storage, 16-pin ────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer */
  '74x298': {
    name: '74x298',
    simpleName: 'Quad 2:1 Mux/Storage',
    description: 'Quad 2 input multiplexer with clocked storage (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    tags: ['mux', 'multiplexer', 'storage', 'quad'],
    guideOverview: 'The 74x298 is a quad 2-to-1 multiplexer with clocked storage. SEL chooses between A or B inputs for all four sections simultaneously; the selected value is latched on the rising CLK edge. Unlike the combinational 74x157, outputs are glitch free and update only on the clock.',
    guidePinDescriptions: {
      'A1':  'Section 1 input A.',
      'B1':  'Section 1 input B.',
      'A2':  'Section 2 input A.',
      'B2':  'Section 2 input B.',
      'Q2':  'Section 2 registered output.',
      'Q1':  'Section 1 registered output.',
      'SEL': 'Select input for all sections. LOW selects A; HIGH selects B.',
      'GND': 'Ground reference (pin 8).',
      'CLK': 'Clock input. Selected input is latched on rising edge.',
      'Q4':  'Section 4 registered output.',
      'Q3':  'Section 3 registered output.',
      'A4':  'Section 4 input A.',
      'B4':  'Section 4 input B.',
      'A3':  'Section 3 input A.',
      'B3':  'Section 3 input B.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input' },
      { pin:  2, name: 'B1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'B2',  type: 'input' },
      { pin:  5, name: 'Q2',  type: 'output' },
      { pin:  6, name: 'Q1',  type: 'output' },
      { pin:  7, name: 'SEL', type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'CLK', type: 'input' },
      { pin: 10, name: 'Q4',  type: 'output' },
      { pin: 11, name: 'Q3',  type: 'output' },
      { pin: 12, name: 'A4',  type: 'input' },
      { pin: 13, name: 'B4',  type: 'input' },
      { pin: 14, name: 'A3',  type: 'input' },
      { pin: 15, name: 'B3',  type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'MUX_QUAD_2TO1_STORED', inputs: ['A1','B1','A2','B2','A3','B3','A4','B4','SEL','CLK'], outputs: ['Q1','Q2','Q3','Q4'] },
    ],
    guideSections: [
      {
        title: 'Clocked Selection',
        paragraphs: [
          'Setting SEL before the clock edge ensures glitch free output. Compare to the 74x157 where any SEL change immediately propagates. Typical use: select between two 4 bit data sources synchronously.',
        ],
      },
    ],
  },

  // ── 74x299: 8-bit universal shift/storage register, 3-state I/O, 20-pin ──────
  // Notable: the eight A/QA..H/QH pins are multiplexed (each is both a data input
  // and a 3-state output); two active-LOW output enables that BOTH must be LOW to
  // drive the bus; two dedicated always-driven cascade outputs QA'/QH'; and a
  // direct (asynchronous) overriding clear.
  //
  // Source: Texas Instruments, "SN54LS299, SN54S299, SN74LS299, SN74S299 8-Bit
  //   Universal Shift/Storage Registers", SDLS156 (Mar. 1974, rev. Mar. 1988).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls299.pdf.
  //   Verified: terminal assignment (DW/N package top view) + FUNCTION TABLE +
  //   positive-logic logic diagram, pages 1-3, read as PDF page images (NOT a text
  //   summarizer — see issues.md C4). Cross-checks the ALS299 map in issues.md C52.
  // PINOUT FIX (issues.md C105): the previous hand-entered pinout was wrong — it
  //   invented separate QA-QH outputs + IO_F/G/H inputs, dropped CLR and QA'/QH',
  //   and its old SHIFT_REG_8BIT_UNIV_TRI primitive entered SR at the QH end. Same
  //   C2-class hazard flagged for this entry in C52. Corrected to the datasheet map
  //   and re-pointed at the shared SHIFT_REG_8BIT_UNIV_CLR_TRI primitive.
  '74x299': {
    name: '74x299',
    simpleName: '8 bit Univ Shift Reg (3-state)',
    description: '8 bit universal shift register, muxed 3-state I/O, async clear (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls299.pdf',
    tags: ['shift register', '8 bit', 'bidirectional', 'universal', 'tri state'],
    guideOverview: 'The 74x299 is an 8 bit universal shift/storage register. "Universal" means it does all four register jobs in one part: on each rising clock edge the two mode pins S1:S0 pick hold (00), shift right (01), shift left (10), or load all eight bits at once (11). To fit eight bits of parallel data into a 20 pin package it multiplexes its data pins — each of the eight A/QA through H/QH pins is a 3-state output when the register drives the bus and an input when you parallel-load it. Two active-LOW output enables gate all eight of those pins together: both must be LOW to drive, either one HIGH releases them to high impedance. Two extra pins, QA\' and QH\', are always-driven copies of the first and last bits, so you can chain several 299s into a wider register even while the shared bus pins are floating. A separate clear pin zeros the register the instant you pull it LOW, with no clock edge.',
    guidePinDescriptions: {
      'S0':   'Mode select bit 0. With S1 it picks the action on the next clock edge: 00 hold, 01 shift right, 10 shift left, 11 parallel load.',
      'S1':   'Mode select bit 1. See S0 for the four combinations.',
      'OE1n': 'Output Enable 1 (active LOW). Both OE1n and OE2n must be LOW for the A/QA-H/QH pins to drive the bus; either one HIGH puts all eight in high impedance.',
      'OE2n': 'Output Enable 2 (active LOW). Works with OE1n; the two together gate the same eight I/O pins.',
      'SR':   'Serial input for shift right. Its level is clocked into the QA stage on a shift-right edge.',
      'SL':   'Serial input for shift left. Its level is clocked into the QH stage on a shift-left edge.',
      'CLK':  'Clock. Hold, both shifts, and parallel load all take effect on the rising edge.',
      'CLRn': 'Clear (active LOW). Forces all eight bits to 0 at once, ignoring the clock and the mode pins.',
      "QA'":  'Dedicated copy of the QA (first) stage. Always driven, even when the I/O pins are in high impedance — serves as the shift-left serial output when chaining.',
      "QH'":  'Dedicated copy of the QH (last) stage. Always driven — serves as the shift-right serial output when chaining.',
      'A/QA': 'Bit A I/O (first stage). Drives the stored bit when the outputs are enabled; reads as load data during parallel load.',
      'B/QB': 'Bit B I/O.',
      'C/QC': 'Bit C I/O.',
      'D/QD': 'Bit D I/O.',
      'E/QE': 'Bit E I/O.',
      'F/QF': 'Bit F I/O.',
      'G/QG': 'Bit G I/O.',
      'H/QH': 'Bit H I/O (last stage).',
      'GND':  'Ground reference (pin 10).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    pinout: [
      { pin:  1, name: 'S0',   type: 'input'  },
      { pin:  2, name: 'OE1n', type: 'input'  },
      { pin:  3, name: 'OE2n', type: 'input'  },
      { pin:  4, name: 'G/QG', type: 'bidir'  },
      { pin:  5, name: 'E/QE', type: 'bidir'  },
      { pin:  6, name: 'C/QC', type: 'bidir'  },
      { pin:  7, name: 'A/QA', type: 'bidir'  },
      { pin:  8, name: "QA'",  type: 'output' },
      { pin:  9, name: 'CLRn', type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'SR',   type: 'input'  },
      { pin: 12, name: 'CLK',  type: 'input'  },
      { pin: 13, name: 'B/QB', type: 'bidir'  },
      { pin: 14, name: 'D/QD', type: 'bidir'  },
      { pin: 15, name: 'F/QF', type: 'bidir'  },
      { pin: 16, name: 'H/QH', type: 'bidir'  },
      { pin: 17, name: "QH'",  type: 'output' },
      { pin: 18, name: 'SL',   type: 'input'  },
      { pin: 19, name: 'S1',   type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'SHIFT_REG_8BIT_UNIV_CLR_TRI',
        inputs:  ['S0','S1','SR','SL','OE1n','OE2n','CLRn','CLK',
                  'A/QA','B/QB','C/QC','D/QD','E/QE','F/QF','G/QG','H/QH'],
        outputs: ['A/QA','B/QB','C/QC','D/QD','E/QE','F/QF','G/QG','H/QH',"QA'","QH'"] },
    ],
    guideSections: [
      {
        title: 'The four modes',
        paragraphs: [
          'S1 and S0 choose what the register does on the next rising clock edge. There is no separate load or shift-enable pin — the two mode pins are the whole control interface, and nothing happens until a clock edge arrives (clear is the one exception; it is immediate).',
          'Shift right moves every bit one stage toward QH and pulls the new QA bit from the SR pin. Shift left moves toward QA and pulls the new QH bit from SL. Parallel load ignores SR and SL and captures all eight I/O pins at once.',
        ],
        formulas: [
          'S1 S0 = 0 0  ->  hold (keep the stored byte)',
          'S1 S0 = 0 1  ->  shift right (SR -> QA, bits move toward QH)',
          'S1 S0 = 1 0  ->  shift left (SL -> QH, bits move toward QA)',
          'S1 S0 = 1 1  ->  parallel load (I/O pins -> register)',
        ],
      },
      {
        title: 'Multiplexed I/O and the cascade outputs',
        paragraphs: [
          'A full 8 bit register with separate inputs and outputs would need 16 data pins. The 299 uses eight by making each A/QA-H/QH pin do double duty: a 3-state output while the register drives the bus, an input during parallel load. In load mode the chip releases those pins to high impedance on its own so an outside source can drive them, then captures them on the clock edge.',
          'Both output enables, OE1n and OE2n, gate all eight I/O pins together. The pins drive only when both are LOW and the register is not loading; either enable HIGH floats all eight. This is one on/off switch for the whole byte, not a per-bit or per-nibble control.',
          'QA\' and QH\' are separate pins wired straight to the first and last stages. They stay driven no matter what the output enables do, so you can wire several 299s in a row — QH\' of one into the SR input of the next — to build a 16, 24, or 32 bit register that still shifts while the shared I/O bus sits in high impedance.',
        ],
      },
      {
        title: 'Asynchronous clear, and a layout gotcha',
        paragraphs: [
          'CLRn is a direct clear: pull it LOW and all eight bits go to 0 right away, with no clock edge and regardless of the mode pins. The closely related 74x323 is the same register but with a synchronous clear that only acts on a clock edge — worth checking which one a design calls for before you substitute.',
          'Watch the pin order: the bits are not laid out in sequence around the package. A/QA through H/QH sit on pins 7, 13, 6, 14, 5, 15, 4, 16 — the odd bits count down one side while the even bits count up the other. Wire the bus by pin name, not by pin number.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Bidirectional parallel-to-serial and serial-to-parallel conversion on a shared data bus.',
          'Buffer or accumulator storage that can also shift a byte out one bit at a time.',
          'Stacked or push-down registers, several 299s cascaded through QH\'/SR.',
          'An 8 bit register that can load, hold, and shift both directions without external steering logic.',
        ],
      },
    ],
  },

  // -- 74300: 256 bit RAM (256x1), Open Collector ────────────────────────────
  // ── 74300: RAM 256×1 (OC), 16-pin ──────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x300': {
    name: '74x300',
    simpleName: 'RAM 256×1 (OC)',
    description: '256 bit static RAM (256 words × 1 bit), open collector output (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    openCollector: true, sequential: true,
    tags: ['ram', 'memory', '256x1', 'open collector', 'static'],
    guideOverview: 'The 74x300 is a 256x1 bit static RAM: 256 individually addressable 1 bit locations. An 8 bit address (A0-A7) selects one of 256 cells. WE (active LOW) writes DI to the selected cell when CS (active LOW) is asserted. DO is an open collector output; add a pull up resistor to VCC.',
    guidePinDescriptions: {
      'A0':  'Address bit 0 (LSB).',
      'A1':  'Address bit 1.',
      'A2':  'Address bit 2.',
      'A3':  'Address bit 3.',
      'A4':  'Address bit 4.',
      'A5':  'Address bit 5.',
      'A6':  'Address bit 6.',
      'GND': 'Ground reference (pin 8).',
      'A7':  'Address bit 7 (MSB).',
      'WEn': 'Write Enable (active LOW). With CSn=LOW writes DI to addressed cell.',
      'CSn': 'Chip Select (active LOW). When HIGH, DO is disabled and writes inhibited.',
      'DI':  'Data input.',
      'DO':  'Data output (open collector). Add pull up to VCC.',
      'NC1': 'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'A0',  type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'A4',  type: 'input' },
      { pin:  6, name: 'A5',  type: 'input' },
      { pin:  7, name: 'A6',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'A7',  type: 'input' },
      { pin: 10, name: 'WEn', type: 'input' },
      { pin: 11, name: 'CSn', type: 'input' },
      { pin: 12, name: 'DI',  type: 'input' },
      { pin: 13, name: 'DO',  type: 'output' },
      { pin: 14, name: 'NC1', type: 'nc' },
      { pin: 15, name: 'NC2', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_256X1_OC_N', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','WEn','CSn','DI'], outputs: ['DO'] },
    ],
    guideSections: [
      {
        title: '256x1 Static RAM Operation',
        paragraphs: [
          'Write: CSn=LOW, WEn=LOW, set address, put data on DI. Read: CSn=LOW, WEn=HIGH, set address; DO reflects stored bit. Multiple chips can share a bus using separate CSn lines.',
        ],
      },
    ],
  },

  // -- 74301: 256 bit RAM (256x1), Open Collector (S variant) ───────────────
  // ── 74301: RAM 256×1 (OC) v2, 16-pin ───────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x301': {
    name: '74x301',
    simpleName: 'RAM 256×1 (OC) v2',
    description: '256 bit static RAM (256 words × 1 bit), open collector output (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    openCollector: true, sequential: true,
    tags: ['ram', 'memory', '256x1', 'open collector', 'static'],
    guideOverview: 'The 74x301 is the Schottky (S) process variant of the 74x300. Functionally identical: 256x1 bit static RAM with open collector output. Schottky technology gives faster access times. Pinout and usage are the same as the 74x300.',
    guidePinDescriptions: {
      'A0':  'Address bit 0 (LSB).',
      'A1':  'Address bit 1.',
      'A2':  'Address bit 2.',
      'A3':  'Address bit 3.',
      'A4':  'Address bit 4.',
      'A5':  'Address bit 5.',
      'A6':  'Address bit 6.',
      'GND': 'Ground reference (pin 8).',
      'A7':  'Address bit 7 (MSB).',
      'WEn': 'Write Enable (active LOW).',
      'CSn': 'Chip Select (active LOW).',
      'DI':  'Data input.',
      'DO':  'Data output (open collector).',
      'NC1': 'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'A0',  type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'A4',  type: 'input' },
      { pin:  6, name: 'A5',  type: 'input' },
      { pin:  7, name: 'A6',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'A7',  type: 'input' },
      { pin: 10, name: 'WEn', type: 'input' },
      { pin: 11, name: 'CSn', type: 'input' },
      { pin: 12, name: 'DI',  type: 'input' },
      { pin: 13, name: 'DO',  type: 'output' },
      { pin: 14, name: 'NC1', type: 'nc' },
      { pin: 15, name: 'NC2', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_256X1_OC_N', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','WEn','CSn','DI'], outputs: ['DO'] },
    ],
    guideSections: [
      {
        title: 'S-Process Variant',
        paragraphs: [
          'Schottky technology reduces propagation delay. Use the 74x301 when access time is the priority. Otherwise identical to the 74x300.',
        ],
      },
    ],
  },

  // -- 74302: 256 bit RAM (256x1), Open Collector (LS variant) ──────────────
  // ── 74302: RAM 256×1 (OC) v3, 16-pin ───────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x302': {
    name: '74x302',
    simpleName: 'RAM 256×1 (OC) v3',
    description: '256 bit static RAM (256 words × 1 bit), open collector output (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    openCollector: true, sequential: true,
    tags: ['ram', 'memory', '256x1', 'open collector', 'static'],
    guideOverview: 'The 74x302 is the Low power Schottky (LS) variant of the 74x300. Functionally identical: 256x1 bit static RAM with open collector output. LS technology reduces power consumption at the cost of slightly slower access times versus the 74x301.',
    guidePinDescriptions: {
      'A0':  'Address bit 0 (LSB).',
      'A1':  'Address bit 1.',
      'A2':  'Address bit 2.',
      'A3':  'Address bit 3.',
      'A4':  'Address bit 4.',
      'A5':  'Address bit 5.',
      'A6':  'Address bit 6.',
      'GND': 'Ground reference (pin 8).',
      'A7':  'Address bit 7 (MSB).',
      'WEn': 'Write Enable (active LOW).',
      'CSn': 'Chip Select (active LOW).',
      'DI':  'Data input.',
      'DO':  'Data output (open collector).',
      'NC1': 'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'A0',  type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'A4',  type: 'input' },
      { pin:  6, name: 'A5',  type: 'input' },
      { pin:  7, name: 'A6',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'A7',  type: 'input' },
      { pin: 10, name: 'WEn', type: 'input' },
      { pin: 11, name: 'CSn', type: 'input' },
      { pin: 12, name: 'DI',  type: 'input' },
      { pin: 13, name: 'DO',  type: 'output' },
      { pin: 14, name: 'NC1', type: 'nc' },
      { pin: 15, name: 'NC2', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_256X1_OC_N', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','WEn','CSn','DI'], outputs: ['DO'] },
    ],
    guideSections: [
      {
        title: 'LS Process Variant',
        paragraphs: [
          'Low power Schottky consumes less current than the 74x300 or 74x301 at the cost of slightly higher access time. Prefer in battery or low power TTL systems.',
        ],
      },
    ],
  },

  // -- 74303: Octal Divide by-2 Clock Driver ─────────────────────────────────
  // ── 74303: Octal ÷2 Clock Driver, 16-pin ───────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x303': {
    name: '74x303',
    simpleName: 'Octal ÷2 Clock Driver',
    description: 'Octal divide by-2 clock driver; outputs Q7 and Q8 are inverted (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    tags: ['clock', 'divider', 'buffer', 'driver'],
    guideOverview: 'The 74x303 is an octal divide by-2 clock driver with eight independent toggle flip flop channels. Each CLK input drives a dedicated D-FF in toggle mode, producing a half frequency output. Q3-Q6 and Q8 are non inverting; Q7n is inverted. Used for clock tree distribution at half the master clock rate.',
    guidePinDescriptions: {
      'CLK1': 'Clock input for channel 1.',
      'CLK2': 'Clock input for channel 2.',
      'CLK3': 'Clock input for channel 3.',
      'CLK4': 'Clock input for channel 4.',
      'CLK5': 'Clock input for channel 5.',
      'CLK6': 'Clock input for channel 6.',
      'CLK7': 'Clock input for channel 7.',
      'GND':  'Ground reference (pin 8).',
      'CLK8': 'Clock input for channel 8.',
      'Q8':   'Divide by-2 output for channel 8.',
      'Q7n':  'Divide by-2 output for channel 7 (inverted).',
      'Q6':   'Divide by-2 output for channel 6.',
      'Q5':   'Divide by-2 output for channel 5.',
      'Q4':   'Divide by-2 output for channel 4.',
      'Q3':   'Divide by-2 output for channel 3.',
      'VCC':  'Positive supply (+5 V, pin 16).',
    },
    pinout: [
      { pin:  1, name: 'CLK1', type: 'input' },
      { pin:  2, name: 'CLK2', type: 'input' },
      { pin:  3, name: 'CLK3', type: 'input' },
      { pin:  4, name: 'CLK4', type: 'input' },
      { pin:  5, name: 'CLK5', type: 'input' },
      { pin:  6, name: 'CLK6', type: 'input' },
      { pin:  7, name: 'CLK7', type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'CLK8', type: 'input' },
      { pin: 10, name: 'Q8',   type: 'output' },
      { pin: 11, name: 'Q7n',  type: 'output' },
      { pin: 12, name: 'Q6',   type: 'output' },
      { pin: 13, name: 'Q5',   type: 'output' },
      { pin: 14, name: 'Q4',   type: 'output' },
      { pin: 15, name: 'Q3',   type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'CLK_DIV2_OCT', inputs: ['CLK1','CLK2','CLK3','CLK4','CLK5','CLK6','CLK7','CLK8'], outputs: ['Q3','Q4','Q5','Q6','Q7n','Q8'] },
    ],
    guideSections: [
      {
        title: 'Half Rate Clock Distribution',
        paragraphs: [
          'Each channel is a toggle flip flop (D-FF with Q fed back to D). Rising CLK edges toggle the output, producing a 50% duty cycle signal at half the input frequency. All eight channels are independent, so you can clock them from different sources.',
          'Q7n is inverted; if phase alignment with other outputs is needed, account for this inversion.',
        ],
      },
    ],
  },

};
