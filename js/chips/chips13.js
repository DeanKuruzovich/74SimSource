// Chip definitions block 13
// Chips: 74x166-74x184

export const CHIPS_BLOCK_13 = {

  // ── 74166: 8 bit PISO Shift Register, 16-pin ───────────────────────────────
  /* Primary source: Texas Instruments, SN74LS166A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls166a.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Shift_register */
  '74x166': {
    name: '74x166',
    simpleName: '8 bit PISO Shift Register',
    description: 'Parallel-in serial-out 8-bit shift register, sync load, CLK enable (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls166a.pdf',
    tags: ['shift register', '8 bit', 'piso', 'parallel load', 'sequential'],
    guideOverview: 'The 74x166 is an 8 bit parallel in serial out (PISO) shift register that loads data from eight parallel inputs (A H) when SHLD is LOW, then shifts it out serially on each rising clock edge. A clock enable input (CLK_EN) can halt shifting without losing data. An asynchronous active LOW clear (CLR) forces all outputs LOW immediately.',
    guidePinDescriptions: {
      SER:    'Serial input data shifted in from the left on each rising CLK edge when in shift mode.',
      A:      'Parallel data input bit A (LSB); loaded into the first stage when SHLD is LOW.',
      B:      'Parallel data input bit B; loaded into the second stage when SHLD is LOW.',
      C:      'Parallel data input bit C; loaded into the third stage when SHLD is LOW.',
      D:      'Parallel data input bit D; loaded into the fourth stage when SHLD is LOW.',
      CLK_EN: 'Clock Enable (active LOW). When HIGH, clock is inhibited and shifting stops.',
      CLK:    'Clock input; rising edge shifts data one position toward QH.',
      CLR:    'Clear (active LOW). When LOW, forces all internal stages to 0 regardless of clock.',
      E:      'Parallel data input bit E; loaded into the fifth stage when SHLD is LOW.',
      F:      'Parallel data input bit F; loaded into the sixth stage when SHLD is LOW.',
      G:      'Parallel data input bit G; loaded into the seventh stage when SHLD is LOW.',
      H:      'Parallel data input bit H (MSB); loaded into the eighth stage when SHLD is LOW.',
      SHLD:   'Shift/load control; LOW selects parallel load, HIGH selects serial shift.',
      QH:     'Serial output; reflects the bit shifted out of the last (8th) stage.',
    },
    guideSections: [
      {
        title: 'Operation',
        paragraphs: [
          'When SHLD is LOW, the eight parallel data inputs A H are loaded into the register on the rising clock edge. When SHLD is HIGH, each rising edge shifts the register contents one position toward QH, and the SER input enters stage 1. CLK_EN LOW inhibits the clock, freezing all stages.',
          'An asynchronous CLR overrides all other inputs and resets the entire register to zero, useful for system initialization.',
        ],
      },
      {
        title: 'Cascading',
        paragraphs: [
          'Multiple 74x166 devices can be cascaded by connecting QH of one stage to SER of the next and tying CLK and control signals together, forming 16 bit or longer PISO chains.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'SER',    type: 'input' },
      { pin:  2, name: 'A',      type: 'input' },
      { pin:  3, name: 'B',      type: 'input' },
      { pin:  4, name: 'C',      type: 'input' },
      { pin:  5, name: 'D',      type: 'input' },
      { pin:  6, name: 'CLK_EN', type: 'input' },
      { pin:  7, name: 'CLK',    type: 'input' },
      { pin:  8, name: 'GND',    type: 'power' },
      { pin:  9, name: 'CLR',    type: 'input' },
      { pin: 10, name: 'E',      type: 'input' },
      { pin: 11, name: 'F',      type: 'input' },
      { pin: 12, name: 'G',      type: 'input' },
      { pin: 13, name: 'H',      type: 'input' },
      { pin: 14, name: 'SHLD',   type: 'input' },
      { pin: 15, name: 'QH',     type: 'output' },
      { pin: 16, name: 'VCC',    type: 'power' },
    ],
    gates: [
      { type: 'SHIFT_REG_8BIT_PAR', inputs: ['CLK', 'CLR', 'SHLD', 'SER', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'CLK_EN'], outputs: ['QH'] },
    ],
    sequential: true,
  },

  // ── 74167: Decade Rate Multiplier, 16-pin ──────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x167': {
    name: '74x167',
    simpleName: 'Decade Rate Multiplier',
    description: 'Sync decade rate multiplier, Z pulse rate N/10 of CLK (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['rate multiplier', 'decade', 'counter', 'sequential'],
    guideOverview: 'The 74x167 is a synchronous decade rate multiplier that generates output pulses at a rate of N/10 of the input clock frequency, where N is the BCD value on inputs A D. It supports cascading through the RCO output and enable signals ENP/ENT.',
    guidePinDescriptions: {
      CLR:  'Active HIGH asynchronous clear; resets the internal decade counter to zero.',
      A:    'BCD rate input bit A (weight 1); one of four inputs that set the multiplication ratio N.',
      B:    'BCD rate input bit B (weight 2); one of four inputs that set the multiplication ratio N.',
      C:    'BCD rate input bit C (weight 4); one of four inputs that set the multiplication ratio N.',
      D:    'BCD rate input bit D (weight 8); one of four inputs that set the multiplication ratio N.',
      ENT:  'Active LOW enable input T; must be LOW to allow Z output pulses.',
      ENP:  'Active LOW enable input P; must be LOW together with ENT to allow normal counting.',
      RCO:  'Ripple carry output; goes LOW during the last clock cycle of each decade, used for cascading.',
      Z:    'Rate multiplied output; produces N pulses for every 10 input clock cycles.',
      Y:    'Complementary output providing the complement of Z for certain cascade configurations.',
      LOAD: 'Active LOW synchronous load; when LOW, loads A D into the counter on the rising clock edge.',
      CLK:  'Clock input; rising edge advances the internal decade counter.',
    },
    guideSections: [
      {
        title: 'Rate Multiplication',
        paragraphs: [
          'For an N-of-10 rate, set inputs A D to the desired BCD value N (0 9). The Z output will be HIGH for exactly N out of every 10 clock periods, producing a pulse rate of N times f_CLK divided by 10. This makes the chip useful in frequency synthesis and pulse width division applications.',
        ],
        formulas: ['f_Z = (N / 10) x f_CLK'],
      },
      {
        title: 'Cascading',
        paragraphs: [
          'Connect the RCO output of a less significant stage to the ENT or ENP of the next stage to multiply frequencies by powers of 10, enabling ratios like N/100 or N/1000.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLR',  type: 'input' },
      { pin:  2, name: 'A',    type: 'input' },
      { pin:  3, name: 'B',    type: 'input' },
      { pin:  4, name: 'C',    type: 'input' },
      { pin:  5, name: 'D',    type: 'input' },
      { pin:  6, name: 'ENT',  type: 'input' },
      { pin:  7, name: 'ENP',  type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'RCO',  type: 'output' },
      { pin: 10, name: 'Z',    type: 'output' },
      { pin: 11, name: 'Y',    type: 'output' },
      { pin: 12, name: 'LOAD', type: 'input' },
      { pin: 13, name: 'CLK',  type: 'input' },
      { pin: 14, name: 'NC1',  type: 'nc' },
      { pin: 15, name: 'NC2',  type: 'nc' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RATE_MULT_DECADE', inputs: ['CLK', 'CLR', 'LOAD', 'ENP', 'ENT', 'A', 'B', 'C', 'D'], outputs: ['Z', 'Y', 'RCO'] },
    ],
    sequential: true,
  },

  // ── 74168: Sync Up/Down Decade Counter, 16-pin ─────────────────────────────
  /* Primary source: Texas Instruments, SN74LS168 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls168.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x168': {
    name: '74x168',
    simpleName: 'Sync Up/Down Decade Counter',
    description: 'Sync presettable 4-bit up/down decade counter, active-LOW RCO (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls168.pdf',
    tags: ['counter', 'bcd', 'decade', 'up/down', 'synchronous', 'preset', 'sequential'],
    guideOverview: 'The 74x168 is a synchronous presettable 4 bit up/down decade BCD counter. Direction is controlled by the UD pin, and the synchronous LOAD allows preset to any BCD value on the rising clock edge. The active LOW RCO output goes LOW when the terminal count is reached and both enables are asserted.',
    guidePinDescriptions: {
      CLK:  'Clock input; all state changes occur on the rising edge.',
      UD:   'Up/down direction control; HIGH counts up, LOW counts down.',
      A:    'Preset data input bit A (weight 1); loaded when LOAD is asserted on a clock edge.',
      B:    'Preset data input bit B (weight 2); loaded when LOAD is asserted on a clock edge.',
      C:    'Preset data input bit C (weight 4); loaded when LOAD is asserted on a clock edge.',
      D:    'Preset data input bit D (weight 8); loaded when LOAD is asserted on a clock edge.',
      ENP:  'Active LOW count enable P; both ENP and ENT must be LOW for counting to occur.',
      RCO:  'Active LOW ripple carry output; asserts during terminal count (9 up or 0 down) when both enables are active.',
      QD:   'Bit D output of the counter (weight 8).',
      QC:   'Bit C output of the counter (weight 4).',
      QB:   'Bit B output of the counter (weight 2).',
      QA:   'Bit A output of the counter (weight 1).',
      ENT:  'Active LOW count enable T; participates in terminal count detection for RCO.',
      LOAD: 'Active LOW synchronous load; on the rising clock edge when LOW, A D are loaded into the counter.',
    },
    guideSections: [
      {
        title: 'Counting and Loading',
        paragraphs: [
          'The counter advances on each rising CLK edge when ENP and ENT are both LOW. With UD HIGH the count increments (0 to 9); with UD LOW it decrements (9 to 0), wrapping at the decade boundaries. Asserting LOAD synchronously transfers A D into the register on the next rising edge.',
        ],
      },
      {
        title: 'Cascading',
        paragraphs: [
          'Connect RCO of the less significant stage to ENT of the next stage (while sharing ENP and CLK) to create multi decade synchronous counters. The ripple carry propagates in a single clock cycle, enabling high speed cascaded operation.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input' },
      { pin:  2, name: 'UD',   type: 'input' },
      { pin:  3, name: 'A',    type: 'input' },
      { pin:  4, name: 'B',    type: 'input' },
      { pin:  5, name: 'C',    type: 'input' },
      { pin:  6, name: 'D',    type: 'input' },
      { pin:  7, name: 'ENP',  type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'RCO',  type: 'output' },
      { pin: 10, name: 'QD',   type: 'output' },
      { pin: 11, name: 'QC',   type: 'output' },
      { pin: 12, name: 'QB',   type: 'output' },
      { pin: 13, name: 'QA',   type: 'output' },
      { pin: 14, name: 'ENT',  type: 'input' },
      { pin: 15, name: 'LOAD', type: 'input' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'COUNTER_UPDOWN_DECADE', inputs: ['CLK', 'UD', 'LOAD', 'ENP', 'ENT', 'A', 'B', 'C', 'D'], outputs: ['QA', 'QB', 'QC', 'QD', 'RCO'] },
    ],
    sequential: true,
  },

  // ── 74169: Sync Up/Down Binary Counter, 16-pin ─────────────────────────────
  /* Primary source: Texas Instruments, SN74LS169B datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls169b.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x169': {
    name: '74x169',
    simpleName: 'Sync Up/Down Binary Counter',
    description: 'Sync presettable 4-bit up/down binary counter, active-LOW RCO (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls169b.pdf',
    tags: ['counter', 'binary', '4 bit', 'up/down', 'synchronous', 'preset', 'sequential'],
    guideOverview: 'The 74x169 is a synchronous presettable 4 bit up/down binary counter, functionally identical to the 74x168 but counting in natural binary (0 15) rather than BCD. It features synchronous load, two active LOW enables, and an active LOW ripple carry output for cascading.',
    guidePinDescriptions: {
      CLK:  'Clock input; all state changes occur on the rising edge.',
      UD:   'Up/down direction control; HIGH counts up (toward 15), LOW counts down (toward 0).',
      A:    'Preset data input bit A (weight 1); loaded when LOAD is asserted on a clock edge.',
      B:    'Preset data input bit B (weight 2); loaded when LOAD is asserted on a clock edge.',
      C:    'Preset data input bit C (weight 4); loaded when LOAD is asserted on a clock edge.',
      D:    'Preset data input bit D (weight 8); loaded when LOAD is asserted on a clock edge.',
      ENP:  'Active LOW count enable P; both ENP and ENT must be LOW for counting to occur.',
      RCO:  'Active LOW ripple carry output; asserts at terminal count (15 up or 0 down) when both enables are active.',
      QD:   'Bit D output (weight 8).',
      QC:   'Bit C output (weight 4).',
      QB:   'Bit B output (weight 2).',
      QA:   'Bit A output (weight 1).',
      ENT:  'Active LOW count enable T; also gates the terminal count detection for RCO.',
      LOAD: 'Active LOW synchronous load; transfers A D to the counter on the next rising clock edge.',
    },
    guideSections: [
      {
        title: 'Binary Counting',
        paragraphs: [
          'When ENP and ENT are both LOW, the counter increments or decrements in binary on each rising CLK edge, depending on UD. Counts wrap from 15 to 0 (counting up) or 0 to 15 (counting down). Asserting LOAD loads the preset value synchronously.',
        ],
      },
      {
        title: 'Cascading',
        paragraphs: [
          'Wire RCO of each stage to ENT of the next stage to form 8 bit or wider synchronous binary counters. The synchronous load and bidirectional feature allow the chain to be preloaded to any value and counted in either direction.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input' },
      { pin:  2, name: 'UD',   type: 'input' },
      { pin:  3, name: 'A',    type: 'input' },
      { pin:  4, name: 'B',    type: 'input' },
      { pin:  5, name: 'C',    type: 'input' },
      { pin:  6, name: 'D',    type: 'input' },
      { pin:  7, name: 'ENP',  type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'RCO',  type: 'output' },
      { pin: 10, name: 'QD',   type: 'output' },
      { pin: 11, name: 'QC',   type: 'output' },
      { pin: 12, name: 'QB',   type: 'output' },
      { pin: 13, name: 'QA',   type: 'output' },
      { pin: 14, name: 'ENT',  type: 'input' },
      { pin: 15, name: 'LOAD', type: 'input' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'COUNTER_UPDOWN_BIN', inputs: ['CLK', 'UD', 'LOAD', 'ENP', 'ENT', 'A', 'B', 'C', 'D'], outputs: ['QA', 'QB', 'QC', 'QD', 'RCO'] },
    ],
    sequential: true,
  },

  // ── 74170: 4x4 Register File (OC), 16-pin ──────────────────────────────────
  /* Primary source: Texas Instruments, SN74170 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74170.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x170': {
    name: '74x170',
    simpleName: '4x4 Register File (OC)',
    description: '4-word x 4-bit register file, open-collector, simultaneous R/W (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74170.pdf',
    tags: ['register file', 'memory', 'storage', 'open collector', 'sequential'],
    guideOverview: 'The 74x170 is a 4 word x 4 bit register file with open collector outputs, supporting simultaneous independent read and write operations. The write address (WA1, WA2) and write enable (WE) select which of four registers receives data inputs D1-D4, while the read address (RA1, RA2) and read enable (RE) select which register drives the open collector Q outputs.',
    guidePinDescriptions: {
      'D1': 'Data input bit 1; written to the register selected by WA1/WA2 when WE is asserted.',
      'D2': 'Data input bit 2; written to the register selected by WA1/WA2 when WE is asserted.',
      'D3': 'Data input bit 3; written to the register selected by WA1/WA2 when WE is asserted.',
      'D4': 'Data input bit 4; written to the register selected by WA1/WA2 when WE is asserted.',
      'WA1': 'Write address bit 1 (LSB); together with WA2 selects one of four registers for writing.',
      'WA2': 'Write address bit 2 (MSB); together with WA1 selects one of four registers for writing.',
      'WE': 'Active LOW write enable; when LOW, data D1-D4 is written to the addressed register.',
      'RA2': 'Read address bit 2 (MSB); together with RA1 selects one of four registers for reading.',
      'RA1': 'Read address bit 1 (LSB); together with RA2 selects one of four registers for reading.',
      'RE': 'Active LOW read enable; when LOW, the addressed register drives the open collector outputs Q1-Q4.',
      'Q4': 'Open collector output bit 4 of the read-selected register.',
      'Q3': 'Open collector output bit 3 of the read-selected register.',
      'Q2': 'Open collector output bit 2 of the read-selected register.',
      'Q1': 'Open collector output bit 1 of the read-selected register.',
    },
    guideSections: [
      {
        title: 'Read and Write Operations',
        paragraphs: [
          'The write port and read port operate independently and simultaneously. A write occurs whenever WE is LOW and stable write address and data are present. A read occurs whenever RE is LOW; the selected word appears at the open collector Q outputs, which require external pull up resistors.',
          'Because reads and writes are asynchronous and independent, the chip can perform a write to one register while reading from another in the same clock cycle, making it suitable as a small scratchpad memory.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'D1',  type: 'input' },
      { pin:  2, name: 'D2',  type: 'input' },
      { pin:  3, name: 'D3',  type: 'input' },
      { pin:  4, name: 'D4',  type: 'input' },
      { pin:  5, name: 'WA1', type: 'input' },
      { pin:  6, name: 'WA2', type: 'input' },
      { pin:  7, name: 'WE',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'RA2', type: 'input' },
      { pin: 10, name: 'RA1', type: 'input' },
      { pin: 11, name: 'RE',  type: 'input' },
      { pin: 12, name: 'Q4',  type: 'output' },
      { pin: 13, name: 'Q3',  type: 'output' },
      { pin: 14, name: 'Q2',  type: 'output' },
      { pin: 15, name: 'Q1',  type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'REG_FILE_4X4', inputs: ['D1', 'D2', 'D3', 'D4', 'WA1', 'WA2', 'WE', 'RA1', 'RA2', 'RE'], outputs: ['Q1', 'Q2', 'Q3', 'Q4'] },
    ],
    sequential: true,
  },

  // ── 74171: Quad D Flip Flop (CLR), 16-pin ──────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x171': {
    name: '74x171',
    simpleName: 'Quad D Flip Flop (CLR)',
    description: 'Quad D flip-flops, complementary out, shared clock, active-low CLR (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip flop', 'D type', 'quad', 'sequential', 'register'],
    guideOverview: 'The 74x171 contains four independent D type flip flops sharing a common clock and an active LOW asynchronous clear. Each flip flop captures its D input on the rising clock edge and provides both true and complement outputs. Asserting CLR immediately resets all four flip flops regardless of clock.',
    guidePinDescriptions: {
      CLR:  'Active LOW asynchronous clear; when LOW, all four Q outputs are forced to 0 immediately, independent of CLK.',
      '1Q':  'True output of flip flop 1; follows 1D after a rising CLK edge.',
      '1Qn': 'Complement output of flip flop 1; inverse of 1Q.',
      '1D':  'Data input of flip flop 1; captured on the rising CLK edge.',
      '2D':  'Data input of flip flop 2; captured on the rising CLK edge.',
      '2Qn': 'Complement output of flip flop 2; inverse of 2Q.',
      '2Q':  'True output of flip flop 2; follows 2D after a rising CLK edge.',
      CLK:  'Shared clock input; rising edge transfers all four D inputs to their respective Q outputs.',
      '3Q':  'True output of flip flop 3; follows 3D after a rising CLK edge.',
      '3Qn': 'Complement output of flip flop 3; inverse of 3Q.',
      '3D':  'Data input of flip flop 3; captured on the rising CLK edge.',
      '4D':  'Data input of flip flop 4; captured on the rising CLK edge.',
      '4Qn': 'Complement output of flip flop 4; inverse of 4Q.',
      '4Q':  'True output of flip flop 4; follows 4D after a rising CLK edge.',
    },
    guideSections: [
      {
        title: 'D Flip Flop Behavior',
        paragraphs: [
          'Each of the four flip flops captures the logic level on its D input at the rising edge of the shared CLK. The true output Q follows D after the edge; Qn is its complement. All four flip flops update simultaneously, making this chip suitable as a 4 bit parallel register.',
        ],
      },
      {
        title: 'Async Clear',
        paragraphs: [
          'Pulling CLR LOW immediately forces all four Q outputs to 0 and all four Qn outputs to 1, independent of the clock. This is useful for system reset routines. CLR must be HIGH for normal clocked operation.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLR', type: 'input' },
      { pin:  2, name: '1Q',  type: 'output' },
      { pin:  3, name: '1Qn', type: 'output' },
      { pin:  4, name: '1D',  type: 'input' },
      { pin:  5, name: '2D',  type: 'input' },
      { pin:  6, name: '2Qn', type: 'output' },
      { pin:  7, name: '2Q',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'CLK', type: 'input' },
      { pin: 10, name: '3Q',  type: 'output' },
      { pin: 11, name: '3Qn', type: 'output' },
      { pin: 12, name: '3D',  type: 'input' },
      { pin: 13, name: '4D',  type: 'input' },
      { pin: 14, name: '4Qn', type: 'output' },
      { pin: 15, name: '4Q',  type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'D_FF_QUAD', inputs: ['1D', '2D', '3D', '4D', 'CLK', 'CLR'], outputs: ['1Q', '1Qn', '2Q', '2Qn', '3Q', '3Qn', '4Q', '4Qn'] },
    ],
    sequential: true,
  },

  // ── 74172: 8x2 Multi Port Register File, 24-pin ────────────────────────────
  /* Primary source: Texas Instruments, SN74172 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74172.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x172': {
    name: '74x172',
    simpleName: '8x2 Multi Port Register File',
    description: '16-bit (8 word x 2 bit) multiport register file, 3-state outputs (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74172.pdf',
    tags: ['register file', 'memory', 'storage', 'tri state', 'sequential'],
    guideOverview: 'The 74x172 is a 16 bit (8 word x 2 bit) multiple port register file with 3-state outputs. Three bit write address inputs (WA1 WA3) and a write enable (WE) select which of eight 2 bit registers is written, while three bit read address inputs (RA1 RA3) and output enable (OE) select which register is driven onto the Y1 Y2 three state outputs.',
    guidePinDescriptions: {
      'D1': 'Data input bit 1; written to the addressed register when WE is active.',
      'D2': 'Data input bit 2; written to the addressed register when WE is active.',
      'WA1': 'Write address bit 1 (LSB); one of three bits selecting the destination register (0 7).',
      'WA2': 'Write address bit 2; one of three bits selecting the destination register (0 7).',
      'WA3': 'Write address bit 3 (MSB); one of three bits selecting the destination register (0 7).',
      'WE': 'Active LOW write enable; when LOW, data D1-D2 is clocked into the addressed register.',
      'RA1': 'Read address bit 1 (LSB); one of three bits selecting the source register (0 7).',
      'RA2': 'Read address bit 2; one of three bits selecting the source register (0 7).',
      'RA3': 'Read address bit 3 (MSB); one of three bits selecting the source register (0 7).',
      'OE': 'Active LOW output enable; when LOW, Y1 Y2 drive the selected register contents; when HIGH, Y1 Y2 are high impedance.',
      'Y1': 'Three state output bit 1 of the read-selected register.',
      'Y2': 'Three state output bit 2 of the read-selected register.',
    },
    guideSections: [
      {
        title: 'Multi Port Operation',
        paragraphs: [
          'The 74x172 implements an 8-deep x 2-wide register array. A write occurs synchronously when WE is LOW; data on D1-D2 is stored at the address given by WA1 WA3. A read occurs asynchronously: asserting OE LOW drives the contents of the register at RA1 RA3 onto Y1 Y2.',
          'Because the read address and write address are independent, the chip supports simultaneous read and write to different locations, enabling efficient pipeline register architectures.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'D1',   type: 'input' },
      { pin:  2, name: 'D2',   type: 'input' },
      { pin:  3, name: 'WA1',  type: 'input' },
      { pin:  4, name: 'WA2',  type: 'input' },
      { pin:  5, name: 'WA3',  type: 'input' },
      { pin:  6, name: 'WE',   type: 'input' },
      { pin:  7, name: 'RA1',  type: 'input' },
      { pin:  8, name: 'RA2',  type: 'input' },
      { pin:  9, name: 'RA3',  type: 'input' },
      { pin: 10, name: 'OE',   type: 'input' },
      { pin: 11, name: 'Y1',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power' },
      { pin: 13, name: 'Y2',   type: 'output' },
      { pin: 14, name: 'NC1',  type: 'nc' },
      { pin: 15, name: 'NC2',  type: 'nc' },
      { pin: 16, name: 'NC3',  type: 'nc' },
      { pin: 17, name: 'NC4',  type: 'nc' },
      { pin: 18, name: 'NC5',  type: 'nc' },
      { pin: 19, name: 'NC6',  type: 'nc' },
      { pin: 20, name: 'NC7',  type: 'nc' },
      { pin: 21, name: 'NC8',  type: 'nc' },
      { pin: 22, name: 'NC9',  type: 'nc' },
      { pin: 23, name: 'NC10', type: 'nc' },
      { pin: 24, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'REG_FILE_8X2_TRI', inputs: ['D1', 'D2', 'WA1', 'WA2', 'WA3', 'WE', 'RA1', 'RA2', 'RA3', 'OE'], outputs: ['Y1', 'Y2'] },
    ],
    sequential: true,
  },

  // ── 74176: Presettable Decade Counter, 14-pin ──────────────────────────────
  /* Primary source: Texas Instruments, SN74176 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74176.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Counter_(digital)
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x176': {
    name: '74x176',
    simpleName: 'Presettable Decade Counter',
    description: 'Presettable bi-quinary decade counter/latch, async clear/preset (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74176.pdf',
    tags: ['counter', 'decade', 'bi quinary', 'preset', 'sequential'],
    guideOverview: 'The 74x176 is a presettable bi quinary (BCD) decade counter with asynchronous active LOW clear and active LOW preset. It uses two separate clock inputs CLK1 for the divide by-2 stage (QA) and CLK2 for the divide by-5 stage (QB-QD) to form a BCD decade count when cascaded internally.',
    guidePinDescriptions: {
      CLK2: 'Clock input 2; drives the divide by-5 (QB, QC, QD) portion of the counter.',
      D:    'Parallel preset data input D (weight 8); loaded into QD when LOAD is asserted.',
      C:    'Parallel preset data input C (weight 4); loaded into QC when LOAD is asserted.',
      B:    'Parallel preset data input B (weight 2); loaded into QB when LOAD is asserted.',
      A:    'Parallel preset data input A (weight 1); loaded into QA when LOAD is asserted.',
      LOAD: 'Active LOW asynchronous preset; when LOW, A D are loaded into the counter immediately.',
      CLK1: 'Clock input 1; drives the divide by-2 (QA) portion of the counter.',
      QA:   'Bit A output (weight 1) of the bi quinary counter.',
      QB:   'Bit B output (weight 2) of the bi quinary counter.',
      QC:   'Bit C output (weight 4) of the bi quinary counter.',
      QD:   'Bit D output (weight 8) of the bi quinary counter.',
      CLR:  'Active LOW asynchronous clear; when LOW, all outputs (QA-QD) are forced to 0 immediately.',
    },
    guideSections: [
      {
        title: 'Bi Quinary Counting',
        paragraphs: [
          'The 74x176 is split into a div-2 section (CLK1 → QA) and a div-5 section (CLK2 → QB, QC, QD). For BCD operation, connect QA to CLK2 so the overall sequence counts 0-9 in BCD. The two clocks can also be driven independently for non BCD applications.',
        ],
      },
      {
        title: 'Preset and Clear',
        paragraphs: [
          'Both LOAD and CLR are asynchronous and active LOW. Asserting LOAD loads A D into the counter immediately without waiting for a clock edge. Asserting CLR overrides LOAD and resets all outputs to 0, useful for initialization.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK2', type: 'input' },
      { pin:  2, name: 'D',    type: 'input' },
      { pin:  3, name: 'C',    type: 'input' },
      { pin:  4, name: 'B',    type: 'input' },
      { pin:  5, name: 'A',    type: 'input' },
      { pin:  6, name: 'LOAD', type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'CLK1', type: 'input' },
      { pin:  9, name: 'QA',   type: 'output' },
      { pin: 10, name: 'QB',   type: 'output' },
      { pin: 11, name: 'QC',   type: 'output' },
      { pin: 12, name: 'QD',   type: 'output' },
      { pin: 13, name: 'CLR',  type: 'input' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'COUNTER_BIQ_PRESET', inputs: ['CLK1', 'CLK2', 'CLR', 'LOAD', 'A', 'B', 'C', 'D'], outputs: ['QA', 'QB', 'QC', 'QD'] },
    ],
    sequential: true,
  },

  // ── 74177: Presettable Binary Counter, 14-pin ──────────────────────────────
  /* Primary source: Texas Instruments, SN74177 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74177.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Counter_(digital)
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x177': {
    name: '74x177',
    simpleName: 'Presettable Binary Counter',
    description: 'Presettable 4-bit binary counter/latch, async clear and preset (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74177.pdf',
    tags: ['counter', 'binary', '4 bit', 'preset', 'sequential'],
    guideOverview: 'The 74x177 is a presettable 4 bit binary ripple counter with asynchronous clear and preset. Like the 74x176, it uses two clock inputs: CLK1 for the divide by-2 stage (QA) and CLK2 for the divide by-8 stage (QB-QD). For normal 4 bit binary counting, connect QA to CLK2.',
    guidePinDescriptions: {
      CLK2: 'Clock input 2; drives the divide by-8 ripple counter stages (QB, QC, QD).',
      D:    'Parallel preset data input D (weight 8); loaded into QD when LOAD is asserted.',
      C:    'Parallel preset data input C (weight 4); loaded into QC when LOAD is asserted.',
      B:    'Parallel preset data input B (weight 2); loaded into QB when LOAD is asserted.',
      A:    'Parallel preset data input A (weight 1); loaded into QA when LOAD is asserted.',
      LOAD: 'Active LOW asynchronous preset; when LOW, A D are loaded into the counter immediately.',
      CLK1: 'Clock input 1; drives the divide by-2 first stage (QA).',
      QA:   'Bit A output (weight 1) of the binary counter.',
      QB:   'Bit B output (weight 2) of the binary counter.',
      QC:   'Bit C output (weight 4) of the binary counter.',
      QD:   'Bit D output (weight 8) of the binary counter.',
      CLR:  'Active LOW asynchronous clear; when LOW, all outputs are immediately reset to 0.',
    },
    guideSections: [
      {
        title: '4 bit Binary Counting',
        paragraphs: [
          'For full 4 bit binary operation, connect QA to CLK2; CLK1 then drives the entire chain for a 0 15 count sequence. The CLK2 input can remain separate for divide by-2 (QA only) and divide by-8 (QB-QD) independent operation.',
        ],
      },
      {
        title: 'Preset and Clear',
        paragraphs: [
          'LOAD is active LOW and asynchronous: pulling it LOW immediately transfers A D into the counter. CLR takes priority over LOAD and resets all outputs to zero asynchronously. Both controls are useful in synchronization and initialization circuits.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK2', type: 'input' },
      { pin:  2, name: 'D',    type: 'input' },
      { pin:  3, name: 'C',    type: 'input' },
      { pin:  4, name: 'B',    type: 'input' },
      { pin:  5, name: 'A',    type: 'input' },
      { pin:  6, name: 'LOAD', type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'CLK1', type: 'input' },
      { pin:  9, name: 'QA',   type: 'output' },
      { pin: 10, name: 'QB',   type: 'output' },
      { pin: 11, name: 'QC',   type: 'output' },
      { pin: 12, name: 'QD',   type: 'output' },
      { pin: 13, name: 'CLR',  type: 'input' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'COUNTER_BIN_PRESET', inputs: ['CLK1', 'CLK2', 'CLR', 'LOAD', 'A', 'B', 'C', 'D'], outputs: ['QA', 'QB', 'QC', 'QD'] },
    ],
    sequential: true,
  },

  // ── 74178: 4 bit Parallel Access Shift Register, 14-pin ────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Shift_register */
  '74x178': {
    name: '74x178',
    simpleName: '4 bit Parallel Access Shift Register',
    description: '4-bit universal shift register, parallel load or serial shift (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['shift register', '4 bit', 'parallel load', 'sequential'],
    guideOverview: 'The 74x178 is a 4 bit parallel access shift register with a single clock, a parallel enable (PE), and a serial input (SER). When PE is HIGH, the four parallel inputs A D are loaded on the rising clock edge. When PE is LOW, the register shifts right, admitting SER at the input stage and shifting all bits one position toward QD.',
    guidePinDescriptions: {
      SER: 'Serial data input; shifted into stage A on each rising CLK edge when PE is LOW.',
      CLK: 'Clock input; rising edge triggers either a parallel load (PE HIGH) or a right shift (PE LOW).',
      PE:  'Parallel enable; HIGH selects parallel load mode, LOW selects serial shift mode.',
      A:   'Parallel data input A (LSB); loaded into stage A when PE is HIGH on a rising clock edge.',
      B:   'Parallel data input B; loaded into stage B when PE is HIGH on a rising clock edge.',
      C:   'Parallel data input C; loaded into stage C when PE is HIGH on a rising clock edge.',
      D:   'Parallel data input D (MSB); loaded into stage D when PE is HIGH on a rising clock edge.',
      QD:  'Output of stage D (MSB); the last bit in the shift chain.',
      QC:  'Output of stage C.',
      QB:  'Output of stage B.',
      QA:  'Output of stage A (LSB).',
    },
    guideSections: [
      {
        title: 'Shift and Load Modes',
        paragraphs: [
          'With PE HIGH, rising CLK edges load A D into the corresponding flip flop stages simultaneously. With PE LOW, each rising edge shifts the contents one position: SER goes to QA, QA goes to QB, QB goes to QC, and QC goes to QD. All four outputs are available in parallel at any time.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'SER', type: 'input' },
      { pin:  2, name: 'CLK', type: 'input' },
      { pin:  3, name: 'PE',  type: 'input' },
      { pin:  4, name: 'A',   type: 'input' },
      { pin:  5, name: 'B',   type: 'input' },
      { pin:  6, name: 'C',   type: 'input' },
      { pin:  7, name: 'GND', type: 'power' },
      { pin:  8, name: 'D',   type: 'input' },
      { pin:  9, name: 'QD',  type: 'output' },
      { pin: 10, name: 'QC',  type: 'output' },
      { pin: 11, name: 'QB',  type: 'output' },
      { pin: 12, name: 'QA',  type: 'output' },
      { pin: 13, name: 'NC1', type: 'nc' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'SHIFT_REG_4BIT', inputs: ['SER', 'A', 'B', 'C', 'D', 'PE', 'CLK', 'CLK'], outputs: ['QA', 'QB', 'QC', 'QD'] },
    ],
    sequential: true,
  },

  // ── 74179: 4 bit Shift Register (CLR, QDn), 16-pin ─────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Shift_register */
  '74x179': {
    name: '74x179',
    simpleName: '4 bit Shift Register (CLR, QDn)',
    description: '4-bit parallel-access shift register, async CLR, complementary QD (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['shift register', '4 bit', 'parallel load', 'complementary output', 'sequential'],
    guideOverview: 'The 74x179 is a 4 bit parallel access shift register with asynchronous active LOW clear, a serial input, and complementary QD/QDn outputs. It operates like the 74x178 but adds CLR for asynchronous reset and the QDn output for convenient cascade or complement applications.',
    guidePinDescriptions: {
      CLR: 'Active LOW asynchronous clear; when LOW, all four stages are immediately reset to 0 (QD goes LOW, QDn goes HIGH), independent of CLK.',
      SER: 'Serial data input; shifted into stage A on each rising CLK edge when PE is LOW.',
      CLK: 'Clock input; rising edge triggers parallel load (PE HIGH) or serial shift (PE LOW).',
      PE:  'Parallel enable; HIGH selects parallel load mode, LOW selects serial shift mode.',
      A:   'Parallel data input A (LSB); loaded into stage A when PE is HIGH on a rising clock edge.',
      B:   'Parallel data input B; loaded into stage B when PE is HIGH on a rising clock edge.',
      C:   'Parallel data input C; loaded into stage C when PE is HIGH on a rising clock edge.',
      D:   'Parallel data input D (MSB); loaded into stage D when PE is HIGH on a rising clock edge.',
      QD:  'True output of stage D (MSB).',
      QDn: 'Complement output of stage D; inverse of QD, useful for cascading or inverted logic.',
      QC:  'Output of stage C.',
      QB:  'Output of stage B.',
      QA:  'Output of stage A (LSB).',
    },
    guideSections: [
      {
        title: 'Shift Register Operation',
        paragraphs: [
          'PE HIGH causes all four parallel inputs A D to be loaded on the rising clock edge. PE LOW enables right-shift mode: each clock shifts SER into QA, QA into QB, QB into QC, and QC into QD. The complementary QDn output is the inversion of QD at all times, including during clear.',
        ],
      },
      {
        title: 'Asynchronous Clear',
        paragraphs: [
          'Asserting CLR LOW resets all internal stages to 0 immediately, without waiting for a clock edge. This overrides both parallel load and serial shift operations, ensuring a clean known state during power up or system reset.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLR', type: 'input' },
      { pin:  2, name: 'SER', type: 'input' },
      { pin:  3, name: 'CLK', type: 'input' },
      { pin:  4, name: 'PE',  type: 'input' },
      { pin:  5, name: 'A',   type: 'input' },
      { pin:  6, name: 'B',   type: 'input' },
      { pin:  7, name: 'C',   type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'D',   type: 'input' },
      { pin: 10, name: 'QD',  type: 'output' },
      { pin: 11, name: 'QDn', type: 'output' },
      { pin: 12, name: 'QC',  type: 'output' },
      { pin: 13, name: 'QB',  type: 'output' },
      { pin: 14, name: 'QA',  type: 'output' },
      { pin: 15, name: 'NC1', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'SHIFT_REG_4BIT_CLR', inputs: ['SER', 'A', 'B', 'C', 'D', 'PE', 'CLK', 'CLR'], outputs: ['QA', 'QB', 'QC', 'QD', 'QDn'] },
    ],
    sequential: true,
  },

  // ── 74180: 9 bit Parity Generator/Checker, 14-pin ──────────────────────────
  /* Primary source: Texas Instruments, SN74180 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74180.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Parity_bit */
  '74x180': {
    name: '74x180',
    simpleName: '9 bit Parity Generator/Checker',
    description: '9-bit odd/even parity generator/checker, cascadable even/odd in (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74180.pdf',
    tags: ['parity', '9 bit', 'xor', 'combinational', 'checker'],
    guideOverview: 'The 74x180 is a 9 bit odd/even parity generator and checker. It XORs eight data inputs (A H) with the cascadable EVEN_IN input to produce EVEN_OUT and ODD_OUT, indicating whether the total count of HIGH bits across all nine inputs is even or odd. Multiple chips can be chained by connecting EVEN_OUT to EVEN_IN of the next stage.',
    guidePinDescriptions: {
      'G': 'Data input bit G; one of eight bits contributing to the parity computation.',
      'F': 'Data input bit F; one of eight bits contributing to the parity computation.',
      'E': 'Data input bit E; one of eight bits contributing to the parity computation.',
      'D': 'Data input bit D; one of eight bits contributing to the parity computation.',
      'C': 'Data input bit C; one of eight bits contributing to the parity computation.',
      'B': 'Data input bit B; one of eight bits contributing to the parity computation.',
      'A': 'Data input bit A; one of eight bits contributing to the parity computation.',
      'EVEN_IN': 'Cascade even parity input; added to the XOR of A H to allow daisy chaining multiple 74x180 chips.',
      'ODD_IN': 'Cascade odd parity input; complement of EVEN_IN for cascade configurations (should be the inverse of EVEN_IN).',
      'EVEN_OUT': 'Even parity output; HIGH when the total number of HIGH bits across A H and EVEN_IN is even.',
      'ODD_OUT': 'Odd parity output; HIGH when the total number of HIGH bits across A H and EVEN_IN is odd.',
      'H': 'Data input bit H; one of eight bits contributing to the parity computation.',
    },
    guideSections: [
      {
        title: 'Parity Generation and Checking',
        paragraphs: [
          'The chip computes the XOR of all nine inputs (A H plus EVEN_IN). If the result is 0 (even parity), EVEN_OUT is HIGH and ODD_OUT is LOW. If the result is 1 (odd parity), ODD_OUT is HIGH and EVEN_OUT is LOW.',
          'For simple 8 bit even parity generation, tie EVEN_IN LOW and use EVEN_OUT as the parity bit. For odd parity, use ODD_OUT.',
        ],
        note: 'EVEN_IN and ODD_IN are complementary; always drive one HIGH and the other LOW.',
      },
      {
        title: 'Cascading',
        paragraphs: [
          'To check parity over more than 8 bits, connect EVEN_OUT of the first chip to EVEN_IN of the second chip (and ODD_OUT to ODD_IN). Each stage adds 8 more bits to the parity computation.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G',        type: 'input' },
      { pin:  2, name: 'F',        type: 'input' },
      { pin:  3, name: 'E',        type: 'input' },
      { pin:  4, name: 'D',        type: 'input' },
      { pin:  5, name: 'C',        type: 'input' },
      { pin:  6, name: 'B',        type: 'input' },
      { pin:  7, name: 'GND',      type: 'power' },
      { pin:  8, name: 'A',        type: 'input' },
      { pin:  9, name: 'EVEN_IN',  type: 'input' },
      { pin: 10, name: 'ODD_IN',   type: 'input' },
      { pin: 11, name: 'EVEN_OUT', type: 'output' },
      { pin: 12, name: 'ODD_OUT',  type: 'output' },
      { pin: 13, name: 'H',        type: 'input' },
      { pin: 14, name: 'VCC',      type: 'power' },
    ],
    gates: [
      { type: 'PARITY_9BIT', inputs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'EVEN_IN', 'ODD_IN'], outputs: ['EVEN_OUT', 'ODD_OUT'] },
    ],
  },

  // ── 74181: 4 bit ALU / function generator, 24-pin ──────────────────────────
  // Source: Texas Instruments, "SN54LS181, SN54S181, SN74LS181, SN74S181
  //   Arithmetic Logic Units / Function Generators", SDLS136 (Dec. 1972, rev.
  //   Mar. 1988). [Online]. Available: https://www.ti.com/lit/ds/symlink/sn54s181.pdf.
  //   Verified: terminal assignment (J/W/DW/N package, TOP VIEW, page 1) and both
  //   function tables (Table 1 active-low, page 3; Table 2 active-high, page 4),
  //   read as rendered PDF page images (issues.md C4). Pins 1-24 confirmed:
  //   B0,A0,S3,S2,S1,S0,Cn,M,F0,F1,F2,GND,F3,A=B,P,Cn4,G,B3,A3,B2,A2,B1,A1,VCC
  //   (pin 15 = P/carry-propagate, pin 17 = G/carry-generate, pin 14 = A=B). All
  //   16 logic (M=H) + 16 arithmetic (M=L) rows of Table 2 checked bit-for-bit
  //   against _evaluateAlu4Bit (js/specificChipsSim.js); all match. This one
  //   SDLS136 document also covers the LS181 (same pinout + function table); the
  //   sn74ls181.pdf symlink currently serves an HTML shim to a non-browser fetch,
  //   so the sibling S181 PDF (identical document) was read instead.
  // Source: Wikipedia contributors, "74181". [Online]. Available:
  //   https://en.wikipedia.org/wiki/74181. Used only for the historical note
  //   (an early complete single-chip ALU used in 1970s minicomputers).
  // Modeled simplifications (engine ALU_4BIT, shared with CD40181 and 74x1181;
  //   do NOT "fix" here without touching the shared primitive — issues.md C16):
  //   (1) carry is modeled ACTIVE-HIGH (Cn=H adds 1, Cn4=H on overflow) for learner
  //       clarity, whereas the real part's Cn/Cn4 are active-LOW in both data
  //       conventions; the flip is applied on both ends so cascaded engine stages
  //       still ripple correctly. (2) P/G are simplified, not the exact group
  //       propagate/generate. (3) A=B is only meaningful in subtract mode, and the
  //       real A=B pin is open-collector (the sim drives it as a normal output).
  //   Guard: js/debug/scenarios/74x181-alu.mjs.
  '74x181': {
    name: '74x181',
    simpleName: '4 bit ALU',
    description: '4-bit ALU and function generator with carry look-ahead (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn54s181.pdf',
    tags: ['alu', 'arithmetic', 'logic', '4 bit', 'combinational', 'carry lookahead'],
    guideOverview: 'The 74x181 is a 4 bit arithmetic logic unit (ALU): the calculating core of a small CPU on a single chip. It takes two 4 bit numbers, A and B, and produces a 4 bit result F. The mode pin M chooses the kind of operation and the four select pins S0 to S3 pick which one, giving 16 logic functions (AND, OR, XOR, NOT, and more) or 16 arithmetic functions (add, subtract, increment, decrement, shift). It was one of the first complete ALUs to fit on one chip and sat at the heart of many 1970s minicomputers. For wider, faster arithmetic it exposes carry look ahead outputs P and G that drive a 74x182, plus a dedicated A = B pin for comparing numbers.',
    guidePinDescriptions: {
      'B0': 'Operand B, bit 0 (LSB).',
      'A0': 'Operand A, bit 0 (LSB).',
      'S3': 'Function select bit 3 (MSB). S0 to S3 together pick 1 of 16 operations.',
      'S2': 'Function select bit 2.',
      'S1': 'Function select bit 1.',
      'S0': 'Function select bit 0 (LSB).',
      'Cn': 'Carry in from a less significant stage. As modeled, HIGH adds one to the arithmetic result; ignored in logic mode. (On the real chip this pin is active LOW — see the guide.)',
      'M': 'Mode select. HIGH runs the 16 logic operations (carry ignored); LOW runs the 16 arithmetic operations (carry used).',
      'F0': 'Result output, bit 0 (LSB).',
      'F1': 'Result output, bit 1.',
      'F2': 'Result output, bit 2.',
      'F3': 'Result output, bit 3 (MSB).',
      'AeqB': 'Equality output. HIGH when the result is all ones, which in subtract mode means A equals B. On the real chip this pin is open collector and needs a pull up resistor.',
      'P': 'Carry propagate output, for a 74x182 look ahead carry generator.',
      'Cn4': 'Carry out of bit 3 to the next more significant stage. As modeled, HIGH means the operation overflowed. (Active LOW on the real chip.)',
      'G': 'Carry generate output, for a 74x182 look ahead carry generator.',
      'B3': 'Operand B, bit 3 (MSB).',
      'A3': 'Operand A, bit 3 (MSB).',
      'B2': 'Operand B, bit 2.',
      'A2': 'Operand A, bit 2.',
      'B1': 'Operand B, bit 1.',
      'A1': 'Operand A, bit 1.',
    },
    guideSections: [
      {
        title: 'Picking an operation',
        paragraphs: [
          'Two controls decide what the chip does. M sets the family: M HIGH gives logic (each output bit depends only on the matching A and B bits, with no carry between bits), M LOW gives arithmetic (carries ripple from bit 0 up to bit 3). The four select pins S0 to S3 then choose one of the 16 functions in that family.',
          'For example, with M LOW and S3 S2 S1 S0 = 1001 the chip computes A plus B, with the carry out on Cn4. Drive Cn HIGH to add an incoming carry, turning it into A plus B plus 1. The same trick increments: select A (S3 S2 S1 S0 = 0000) and set Cn HIGH to get A plus 1.',
        ],
      },
      {
        title: 'A sample of the function table',
        paragraphs: [
          'There are 32 operations in all. These are the ones you reach for most; the full 16 + 16 table is in the datasheet.',
        ],
        list: [
          'Logic (M HIGH), by S3 S2 S1 S0: 0000 = NOT A, 0110 = A XOR B, 1001 = A XNOR B, 1011 = A AND B, 1110 = A OR B.',
          'Arithmetic (M LOW), by S3 S2 S1 S0: 0000 = A, 1001 = A PLUS B, 0110 = A MINUS B MINUS 1, 1111 = A MINUS 1, 1100 = A PLUS A (shift left).',
        ],
      },
      {
        title: 'Comparing two numbers',
        paragraphs: [
          'Put the chip in subtract mode (M LOW, S3 S2 S1 S0 = 0110) and the A = B output tells you whether the inputs are equal: it goes HIGH exactly when A equals B. To subtract properly rather than compute A minus B minus 1, also drive the carry in (Cn) HIGH.',
          'On the real chip A = B is an open collector output: it can only pull LOW, so it needs a pull up resistor. That lets you wire the A = B pins of several 74x181s together to compare numbers wider than four bits — the shared line stays HIGH only if every chip reports equal. In this simulator A = B is driven as an ordinary output, so you get the equality result without adding a pull up.',
        ],
      },
      {
        title: 'Ripple carry versus look ahead',
        paragraphs: [
          'For a few bits you can just chain chips: wire one chip\'s Cn4 (carry out) into the next chip\'s Cn (carry in). Simple, but each stage waits for the one below it, so a wide adder gets slow. This is called ripple carry.',
          'To go faster, the 74x181 also produces two look ahead signals, P (propagate) and G (generate). Feed the P and G from several chips into a 74x182 look ahead carry generator and it works out all the carries at once, so an 8, 16, or 32 bit ALU runs at nearly the speed of a single stage.',
        ],
      },
      {
        title: 'How this model simplifies the carry',
        paragraphs: [
          'One deliberate simplification: on a real 74x181 the carry pins are active LOW, so a LOW on Cn is what adds the carry and Cn4 goes LOW on overflow. This simulator models them active HIGH instead — Cn HIGH adds one, Cn4 HIGH signals overflow — because "HIGH means add the carry" is easier to read while you are learning. The data and result pins still match the datasheet\'s active high function table exactly. Because the flip is applied to both the carry in and the carry out, chaining Cn4 into the next chip\'s Cn still ripples correctly.',
          'Two smaller notes: the P and G outputs here are a simplified stand in — enough to drive the 74x182 model in this simulator, but not the exact group propagate and generate the real silicon emits — and the A = B output only means anything in subtract mode.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'B0',   type: 'input' },
      { pin:  2, name: 'A0',   type: 'input' },
      { pin:  3, name: 'S3',   type: 'input' },
      { pin:  4, name: 'S2',   type: 'input' },
      { pin:  5, name: 'S1',   type: 'input' },
      { pin:  6, name: 'S0',   type: 'input' },
      { pin:  7, name: 'Cn',   type: 'input' },
      { pin:  8, name: 'M',    type: 'input' },
      { pin:  9, name: 'F0',   type: 'output' },
      { pin: 10, name: 'F1',   type: 'output' },
      { pin: 11, name: 'F2',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power' },
      { pin: 13, name: 'F3',   type: 'output' },
      { pin: 14, name: 'AeqB', type: 'output' },
      { pin: 15, name: 'P',    type: 'output' },
      { pin: 16, name: 'Cn4',  type: 'output' },
      { pin: 17, name: 'G',    type: 'output' },
      { pin: 18, name: 'B3',   type: 'input' },
      { pin: 19, name: 'A3',   type: 'input' },
      { pin: 20, name: 'B2',   type: 'input' },
      { pin: 21, name: 'A2',   type: 'input' },
      { pin: 22, name: 'B1',   type: 'input' },
      { pin: 23, name: 'A1',   type: 'input' },
      { pin: 24, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'ALU_4BIT', inputs: ['A0','A1','A2','A3','B0','B1','B2','B3','S0','S1','S2','S3','M','Cn'], outputs: ['F0','F1','F2','F3','Cn4','P','G','AeqB'] },
    ],
  },

  // ── 74182: Look-Ahead Carry Generator, 16-pin ──────────────────────────────
  // Source: Texas Instruments, "SN54S182, SN74S182 Look-Ahead Carry Generators",
  //   SDLS206 (Dec. 1972, rev. Mar. 1988). [Online]. Available:
  //   https://www.ti.com/lit/ds/sdls206/sdls206.pdf. Verified: TOP-VIEW terminal
  //   diagram + PIN DESIGNATIONS table + all five output function tables (G, P,
  //   Cn+x, Cn+y, Cn+z), pages 1-2, read as rendered PDF page images (300 dpi).
  // Source: Fairchild Semiconductor, "DM74S182 Look-Ahead Carry Generator",
  //   DS006474 (Aug. 1986, rev. Mar. 2000). [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/DM74S182.pdf.
  //   Verified: Connection Diagram + Pin Designations (Active-LOW G/P in and out,
  //   Active-HIGH Cn and carry outputs) + logic equations, page 1, PDF page images.
  // Concept references (general look-ahead / adder theory, not pin data):
  //   Wikipedia, "Carry-lookahead adder", https://en.wikipedia.org/wiki/Carry-lookahead_adder
  // PINOUT CORRECTED (2026-07-05): the prior hand-entered map (P0=1, G0=2, P1=3,
  //   G1=4, P2=5, G2=6, Cn=7, GND=8, G3=9, P3=10, Cn_z=11, Cn_y=12, Cn_x=13, G=14,
  //   P=15, VCC=16) matched NEITHER datasheet — it was authored without the part
  //   (issues.md C18; same failure mode as the C2 CD4082 lesson). Replaced with the
  //   JEDEC-standard map below (identical across TI SDLS206, Fairchild DS006474 and
  //   the CMOS CD40182). The prior entry also mislabeled Cn as "active LOW"; the real
  //   Cn and all three carry outputs are ACTIVE-HIGH (true form) — only G/P are
  //   active-low. The CARRY_LOOKAHEAD primitive keys off pin NAMES, so simulated
  //   behavior was already correct under either pin map; only the physical pinout,
  //   the polarity notes and the docs changed. Guard added:
  //   js/debug/scenarios/74x182-carry-lookahead.mjs (pin-map assertion + 512-vector sweep).
  '74x182': {
    name: '74x182',
    simpleName: 'Look-ahead carry generator',
    description: 'Look-ahead carry generator for four 4-bit ALU slices, Schottky TTL (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/sdls206/sdls206.pdf',
    tags: ['carry', 'lookahead', 'alu', 'combinational', 'arithmetic', 'ttl'],
    guideOverview: 'The 74x182 is a look-ahead carry generator, the carry-handling partner to the 74181 ALU. When you chain several 74181 slices to add or subtract wide numbers, the carry normally has to ripple from the lowest slice up to the highest, and every stage adds delay. The 74x182 reads the carry propagate (P) and carry generate (G) signals from up to four slices and works out all of their carries at once, so a 16 bit group settles in about one gate delay instead of four. It also produces its own group P and G outputs, so several 74x182 chips can be stacked to look ahead across even wider words. This is the original bipolar Schottky-TTL part; the CD40182 is the pin-for-pin CMOS equivalent. Two things catch people out: on the real chip the P and G signals are active-low, and the pin order is not the tidy P0, G0, P1, G1 you might sketch from memory.',
    guidePinDescriptions: {
      G1:   'Carry generate from ALU slice 1.',
      P1:   'Carry propagate from ALU slice 1.',
      G0:   'Carry generate from ALU slice 0. A slice asserts generate when it makes a carry on its own, whatever the carry coming in.',
      P0:   'Carry propagate from ALU slice 0. A slice asserts propagate when it would pass an incoming carry straight through.',
      G3:   'Carry generate from ALU slice 3.',
      P3:   'Carry propagate from ALU slice 3.',
      P:    'Group carry propagate output. Asserted when all four slices would propagate, so a carry entering the group would pass all the way through.',
      GND:  'Ground reference (pin 8).',
      Cn_z: 'Carry into slice 3 (the carry out of slice 2). Cn_z = G2 or (P2 and Cn_y).',
      G:    'Group carry generate output. Asserted when the group makes a carry of its own, independent of the group carry in.',
      Cn_y: 'Carry into slice 2 (the carry out of slice 1). Cn_y = G1 or (P1 and Cn_x).',
      Cn_x: 'Carry into slice 1 (the carry out of slice 0). Cn_x = G0 or (P0 and Cn).',
      Cn:   'Carry into the whole group; the carry coming into the least significant slice (slice 0). Active-high.',
      G2:   'Carry generate from ALU slice 2.',
      P2:   'Carry propagate from ALU slice 2.',
      VCC:  'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Why look-ahead beats ripple carry',
        paragraphs: [
          'When you add two numbers, the carry out of each bit can depend on the carry into it. If every stage waits for the one below it to settle, the delay piles up: a 16 bit add can wait on 16 carries in a row. Look-ahead breaks that chain. Each ALU slice reports two facts that do not depend on the incoming carry: generate (G), meaning the slice makes a carry no matter what, and propagate (P), meaning the slice would pass an incoming carry straight through. From just the P and G bits the 74x182 computes every carry in the group directly.',
          'The carry into slice 1 is Cn_x = G0 or (P0 and Cn): slice 0 either makes its own carry, or it passes the group carry in. The next two carries follow the same idea with more terms, and all three appear together in about one gate delay instead of rippling stage by stage. The chip also reports whether the whole group of four would generate (G) or propagate (P) a carry, which is what lets several 74x182 chips stack.',
        ],
        formulas: [
          'Cn_x = G0 + P0*Cn',
          'Cn_y = G1 + P1*G0 + P1*P0*Cn',
          'Cn_z = G2 + P2*G1 + P2*P1*G0 + P2*P1*P0*Cn',
          'P = P3*P2*P1*P0',
          'G = G3 + P3*G2 + P3*P2*G1 + P3*P2*P1*G0',
        ],
      },
      {
        title: 'Building wider adders',
        paragraphs: [
          'One 74x182 handles a group of four ALU slices, which is up to 16 bits when each slice is a 4 bit 74181. Its own group P and G outputs describe that whole group the same way a single slice describes itself, so a second 74x182 can look ahead across four such groups, and a third across those. The datasheet shows a 64 bit adder built as three levels of look-ahead this way. This tree of look-ahead chips is how fast 32 and 64 bit adders were built before whole adders moved inside single chips.',
        ],
      },
      {
        title: 'Active-low signals on the real chip',
        paragraphs: [
          'On real 74x182 silicon the propagate and generate lines are active-low: a LOW pin means the signal is true. That holds for both the P and G inputs and the group P and G outputs. Only the carry input Cn and the three carry outputs stay active-high. The reason is that the 74181 ALU hands out its own P and G already in that active-low form, so the two parts wire straight together with no inverters between them. 74Sim takes a shortcut and runs the whole 181/182 family in ordinary active-high logic, where a HIGH on P or G means true. The carry values that come out are identical; what differs from the datasheet is only the bar over the P and G pin names.',
        ],
      },
      {
        title: 'Common uses and gotchas',
        list: [
          'Pairing four 74181 (or 74S181 / 74LS181) ALU slices into a fast 16 bit adder or ALU with no ripple-carry delay.',
          'Stacking a second level of 74x182 to reach 32, 48 or 64 bits.',
          'The pin order is not P0, G0, P1, G1 in sequence: pin 1 is G1, pin 2 is P1, pin 3 is G0, pin 4 is P0. Check the pinout before wiring.',
          'The three carry outputs Cn_x, Cn_y, Cn_z are the carries into slices 1, 2 and 3. Slice 0 takes the chip\'s own Cn as its carry in; the carry out of slice 3 comes from the next level up, not from this chip.',
          'On real hardware P and G are active-low; in 74Sim they are active-high (see the note above). The Boolean result is the same either way.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1',   type: 'input',  description: 'Carry generate from slice 1 (active-low on real silicon)' },
      { pin:  2, name: 'P1',   type: 'input',  description: 'Carry propagate from slice 1 (active-low on real silicon)' },
      { pin:  3, name: 'G0',   type: 'input',  description: 'Carry generate from slice 0 (active-low on real silicon)' },
      { pin:  4, name: 'P0',   type: 'input',  description: 'Carry propagate from slice 0 (active-low on real silicon)' },
      { pin:  5, name: 'G3',   type: 'input',  description: 'Carry generate from slice 3 (active-low on real silicon)' },
      { pin:  6, name: 'P3',   type: 'input',  description: 'Carry propagate from slice 3 (active-low on real silicon)' },
      { pin:  7, name: 'P',    type: 'output', description: 'Group carry propagate (active-low on real silicon)' },
      { pin:  8, name: 'GND',  type: 'power',  description: 'Ground (0 V)' },
      { pin:  9, name: 'Cn_z', type: 'output', description: 'Carry into slice 3 (active-high)' },
      { pin: 10, name: 'G',    type: 'output', description: 'Group carry generate (active-low on real silicon)' },
      { pin: 11, name: 'Cn_y', type: 'output', description: 'Carry into slice 2 (active-high)' },
      { pin: 12, name: 'Cn_x', type: 'output', description: 'Carry into slice 1 (active-high)' },
      { pin: 13, name: 'Cn',   type: 'input',  description: 'Carry into the group (active-high)' },
      { pin: 14, name: 'G2',   type: 'input',  description: 'Carry generate from slice 2 (active-low on real silicon)' },
      { pin: 15, name: 'P2',   type: 'input',  description: 'Carry propagate from slice 2 (active-low on real silicon)' },
      { pin: 16, name: 'VCC',  type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    // Reuses the CARRY_LOOKAHEAD primitive (js/specificChipsSim.js
    // _evaluateCarryLookahead). It keys off pin NAMES, so the corrected pin
    // numbers above do not change simulated behavior:
    //   inputs:  [P0, G0, P1, G1, P2, G2, P3, G3, Cn]
    //   outputs: [Cn_x, Cn_y, Cn_z, P, G]
    gates: [
      { type: 'CARRY_LOOKAHEAD', inputs: ['P0', 'G0', 'P1', 'G1', 'P2', 'G2', 'P3', 'G3', 'Cn'], outputs: ['Cn_x', 'Cn_y', 'Cn_z', 'P', 'G'] },
    ],
  },

  // ── 74183: Dual Full Adder, 14-pin ─────────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS183 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls183.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Adder_(electronics) */
  '74x183': {
    name: '74x183',
    simpleName: 'Dual Full Adder',
    description: 'Dual carry save full adder (two independent 1 bit full adders) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls183.pdf',
    tags: ['adder', 'full adder', 'combinational', 'arithmetic'],
    guideOverview: 'The 74x183 contains two independent carry save full adders, each accepting two data inputs and a carry in and producing a sum and carry out. Both adders are fully independent with no shared signals, and the chip is useful for accumulating partial products in carry save adder trees.',
    guidePinDescriptions: {
      A1:    'Input A of adder 1.',
      B1:    'Input B of adder 1.',
      C1in:  'Carry in of adder 1.',
      S1:    'Sum output of adder 1; S1 = A1 XOR B1 XOR C1in.',
      C1out: 'Carry out of adder 1; HIGH when two or more of A1, B1, C1in are HIGH.',
      C2out: 'Carry out of adder 2; HIGH when two or more of A2, B2, C2in are HIGH.',
      S2:    'Sum output of adder 2; S2 = A2 XOR B2 XOR C2in.',
      C2in:  'Carry in of adder 2.',
      B2:    'Input B of adder 2.',
      A2:    'Input A of adder 2.',
    },
    guideSections: [
      {
        title: 'Full Adder Operation',
        paragraphs: [
          'Each adder computes the 1 bit sum S = A XOR B XOR Cin and carry out Cout = (A AND B) OR (B AND Cin) OR (A AND Cin). The two adders are independent; cascading them or chaining their carries is the designer responsibility.',
        ],
        formulas: ['S = A XOR B XOR Cin', 'Cout = (A AND B) OR (B AND Cin) OR (A AND Cin)'],
      },
    ],
    pinout: [
      { pin:  1, name: 'A1',    type: 'input' },
      { pin:  2, name: 'B1',    type: 'input' },
      { pin:  3, name: 'C1in',  type: 'input' },
      { pin:  4, name: 'S1',    type: 'output' },
      { pin:  5, name: 'C1out', type: 'output' },
      { pin:  6, name: 'C2out', type: 'output' },
      { pin:  7, name: 'GND',   type: 'power' },
      { pin:  8, name: 'S2',    type: 'output' },
      { pin:  9, name: 'C2in',  type: 'input' },
      { pin: 10, name: 'B2',    type: 'input' },
      { pin: 11, name: 'A2',    type: 'input' },
      { pin: 12, name: 'NC1',   type: 'nc' },
      { pin: 13, name: 'NC2',   type: 'nc' },
      { pin: 14, name: 'VCC',   type: 'power' },
    ],
    gates: [
      { type: 'FULL_ADDER_DUAL', inputs: ['A1', 'B1', 'C1in', 'A2', 'B2', 'C2in'], outputs: ['S1', 'C1out', 'S2', 'C2out'] },
    ],
  },

  // ── 74184: BCD to Binary Converter (OC), 16-pin ────────────────────────────
  /* Primary source: Texas Instruments, SN74184 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74184.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector
     Wikipedia: https://en.wikipedia.org/wiki/Read-only_memory */
  '74x184': {
    name: '74x184',
    simpleName: 'BCD to Binary Converter (OC)',
    description: 'BCD-to-binary converter, ROM-based, open-collector, 5-input (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74184.pdf',
    tags: ['converter', 'bcd', 'binary', 'code converter', 'open collector'],
    guideOverview: 'The 74x184 is a ROM based BCD to binary code converter with open collector outputs. It accepts up to a 5 bit BCD encoded input (B1 B5) and produces the equivalent binary outputs Y2 Y8 under control of the active LOW output enable G. It is typically paired with the 74x185 for larger multi digit conversions.',
    guidePinDescriptions: {
      Y8:  'Open collector binary output bit 8 (weight 128); MSB of the binary result.',
      Y7:  'Open collector binary output bit 7 (weight 64).',
      Y6:  'Open collector binary output bit 6 (weight 32).',
      Y5:  'Open collector binary output bit 5 (weight 16).',
      Y4:  'Open collector binary output bit 4 (weight 8).',
      Y3:  'Open collector binary output bit 3 (weight 4).',
      Y2:  'Open collector binary output bit 2 (weight 2); LSB of the converted binary result.',
      B5:  'BCD input bit 5 (MSB of the 5 bit input, representing the tens multiplier).',
      B4:  'BCD input bit 4.',
      B3:  'BCD input bit 3.',
      B2:  'BCD input bit 2.',
      B1:  'BCD input bit 1 (LSB of the 5 bit input).',
      G:   'Active LOW output enable; when LOW, Y outputs reflect the converted binary value; when HIGH, all outputs are open collector high impedance.',
    },
    guideSections: [
      {
        title: 'BCD to Binary Conversion',
        paragraphs: [
          'The chip implements a ROM look up table that maps a 5 bit BCD encoded input (B1 B5) to a 7 bit binary result on Y2 Y8. The G input gates all outputs simultaneously, enabling bus sharing via open collector wired AND connections.',
        ],
      },
      {
        title: 'Cascading with 74x185',
        paragraphs: [
          'For full 2-digit (00 99) BCD to binary conversion, the 74x184 is paired with a 74x185. Connect the BCD digit inputs to B1 B5 and use the active LOW G to control when the converted binary result drives the shared output bus.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Y8',  type: 'output' },
      { pin:  2, name: 'Y7',  type: 'output' },
      { pin:  3, name: 'Y6',  type: 'output' },
      { pin:  4, name: 'Y5',  type: 'output' },
      { pin:  5, name: 'Y4',  type: 'output' },
      { pin:  6, name: 'Y3',  type: 'output' },
      { pin:  7, name: 'Y2',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'B5',  type: 'input' },
      { pin: 10, name: 'B4',  type: 'input' },
      { pin: 11, name: 'B3',  type: 'input' },
      { pin: 12, name: 'B2',  type: 'input' },
      { pin: 13, name: 'B1',  type: 'input' },
      { pin: 14, name: 'G',   type: 'input' },
      { pin: 15, name: 'NC1', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'BCD_TO_BIN_5', inputs: ['B1', 'B2', 'B3', 'B4', 'B5', 'G'], outputs: ['Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8'] },
    ],
  },
};
