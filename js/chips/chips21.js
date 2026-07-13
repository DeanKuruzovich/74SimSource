export const CHIPS_BLOCK_21 = {

  // ── 74322 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Shift_register
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8 bit shift register with sign extend, tri state outputs.
  // S=0: hold, S=1: shift right (sign extend MSB).
  // OEn: output enable (active low).
  // pins: CLK, S, SER, OEn, D0-D7, Q0-Q7 (20-pin)
  '74x322': {
    name: '74x322',
    description: '8 bit shift register, sign extend, tri state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    guideOverview: 'The 74x322 is an 8 bit parallel in/parallel out shift register with a sign extend mode and 3-state outputs. When S=1 the register shifts right, replicating (sign extending) the MSB (D7) into the vacated position. This is useful for arithmetic right shifts of signed 2s-complement numbers.',
    guidePinDescriptions: {
      'S': 'Mode select. HIGH = shift right with sign extension; LOW = hold.',
      'D0': 'Parallel data input bit 0.',
      'D1': 'Parallel data input bit 1.',
      'D2': 'Parallel data input bit 2.',
      'D3': 'Parallel data input bit 3.',
      'D4': 'Parallel data input bit 4.',
      'D5': 'Parallel data input bit 5.',
      'D6': 'Parallel data input bit 6.',
      'D7': 'Parallel data input bit 7 (MSB, sign bit).',
      'GND': 'Ground reference (pin 10).',
      'CLK': 'Clock input. Operations occur on rising edge.',
      'SER': 'Serial input for non sign extend mode. Enters at Q0 when shifting.',
      'OEn': 'Output Enable (active LOW). When asserted (LOW), drives Q outputs; when HIGH, tri states them.',
      'Q7': 'Output bit 7 (MSB of the shifted register).',
      'Q6': 'Output bit 6.',
      'Q5': 'Output bit 5.',
      'Q4': 'Output bit 4.',
      'Q3': 'Output bit 3.',
      'Q2': 'Output bit 2 (LSB, serial output).',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Sign Extension',
        paragraphs: [
          'Arithmetic right shift preserves the sign of a 2s-complement number. Each right shift by 1 divides by 2 (rounding toward negative infinity). The 74x322 automates this by feeding D7 back into the MSB position during every shift, eliminating the need for external logic.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'S',   type:'input'  },
      { pin:2,  name:'D0',  type:'input'  },
      { pin:3,  name:'D1',  type:'input'  },
      { pin:4,  name:'D2',  type:'input'  },
      { pin:5,  name:'D3',  type:'input'  },
      { pin:6,  name:'D4',  type:'input'  },
      { pin:7,  name:'D5',  type:'input'  },
      { pin:8,  name:'D6',  type:'input'  },
      { pin:9,  name:'D7',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'CLK', type:'input'  },
      { pin:12, name:'SER', type:'input'  },
      { pin:13, name:'OEn', type:'input'  },
      { pin:14, name:'Q7',  type:'output' },
      { pin:15, name:'Q6',  type:'output' },
      { pin:16, name:'Q5',  type:'output' },
      { pin:17, name:'Q4',  type:'output' },
      { pin:18, name:'Q3',  type:'output' },
      { pin:19, name:'Q2',  type:'output' },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'SHIFT_REG_8BIT_SIGN_EXT',
      inputs:  ['S','D0','D1','D2','D3','D4','D5','D6','D7','SER','OEn','CLK'],
      outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7']
    }]
  },

  // ── 74323 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8 bit bidirectional universal shift/storage register with synchronous clear.
  // Modes (S0,S1): 00=hold, 01=shift right, 10=shift left, 11=parallel load.
  // CLR_n: synchronous clear (active low).
  // OEAn, OEBn: tri state output enables.
  '74x323': {
    name: '74x323',
    description: '8-bit bidir universal shift/storage register, sync clear, 3-state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    guideOverview: 'The 74x323 is an 8 bit bidirectional universal shift/storage register with synchronous clear (CLRn) and 3-state outputs. Modes (S0, S1): 00=hold, 01=shift right (SR), 10=shift left (SL), 11=parallel load. CLRn (active LOW) synchronously clears all bits to 0 on the clock edge. OEAn and OEBn independently enable the two output halves.',
    guidePinDescriptions: {
      'S0':   'Mode select bit 0. S1:S0 = 00 hold, 01 shift right, 10 shift left, 11 parallel load.',
      'S1':   'Mode select bit 1.',
      'SR':   'Serial input for shift right. Enters at QA.',
      'QA':   'Bit A output (LSB, affected by shift right mode).',
      'QB':   'Bit B output.',
      'QC':   'Bit C output.',
      'QD':   'Bit D output.',
      'OEAn': 'Output Enable A (active LOW). When asserted (LOW), drives QA-QD; when HIGH, tri states them.',
      'OEBn': 'Output Enable B (active LOW). When asserted (LOW), drives QE-QH; when HIGH, tri states them.',
      'GND':  'Ground reference (pin 10).',
      'CLK':  'Clock. All operations on rising edge.',
      'CLRn': 'Synchronous Clear (active LOW). Clears register to 0000 0000 on rising CLK.',
      'SL':   'Serial input for shift left. Enters at QH.',
      'QH':   'Bit H output (MSB, affected by shift left mode).',
      'QG':   'Bit G output.',
      'QF':   'Bit F output.',
      'QE':   'Bit E output.',
      'QD_I': 'Parallel load input for bit D (used in mode 11).',
      'QC_I': 'Parallel load input for bit C.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Synchronous Clear',
        paragraphs: [
          'Unlike asynchronous clear (which resets immediately), synchronous clear waits for the rising clock edge. This avoids partial cycle glitches and ensures the register transitions cleanly. Pull CLRn HIGH when clear is not needed.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'S0',   type:'input'  },
      { pin:2,  name:'S1',   type:'input'  },
      { pin:3,  name:'SR',   type:'input'  },
      { pin:4,  name:'QA',   type:'output' },
      { pin:5,  name:'QB',   type:'output' },
      { pin:6,  name:'QC',   type:'output' },
      { pin:7,  name:'QD',   type:'output' },
      { pin:8,  name:'OEAn', type:'input'  },
      { pin:9,  name:'OEBn', type:'input'  },
      { pin:10, name:'GND',  type:'power'  },
      { pin:11, name:'CLK',  type:'input'  },
      { pin:12, name:'CLRn', type:'input'  },
      { pin:13, name:'SL',   type:'input'  },
      { pin:14, name:'QH',   type:'output' },
      { pin:15, name:'QG',   type:'output' },
      { pin:16, name:'QF',   type:'output' },
      { pin:17, name:'QE',   type:'output' },
      { pin:18, name:'QD_I', type:'input'  },
      { pin:19, name:'QC_I', type:'input'  },
      { pin:20, name:'VCC',  type:'power'  }
    ],
    gates: [{
      type: 'SHIFT_REG_8BIT_BIDIR_CLR_TRI',
      inputs:  ['S0','S1','SR','SL','OEAn','OEBn','CLRn',
                'QA','QB','QC','QD','QE','QF','QG','QH','CLK'],
      outputs: ['QA','QB','QC','QD','QE','QF','QG','QH']
    }]
  },

  // ── 74324 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Voltage controlled oscillator (analog), enable input, complementary outputs.
  // Stub: OUT = EN (passthrough), /OUT = !EN.
  '74x324': {
    name: '74x324',
    description: 'voltage controlled oscillator, enable, complementary outputs (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    guideOverview: 'The 74x324 is a single voltage controlled oscillator (VCO). The output frequency is set by an external timing capacitor (C_EXT), resistor (R_EXT), and a control voltage on VIN. RNG (range) adjusts the frequency range. EN (active LOW) gates the output when asserted. OUT and OUT (inverted) provide complementary clock outputs.',
    guidePinDescriptions: {
      'RNG':   'Range input. Sets the frequency range of the VCO.',
      'C_EXT': 'External capacitor pin. Timing capacitor connected here.',
      'R_EXT': 'External resistor pin. Timing resistor connected here.',
      'EN':    'Enable input. When LOW, oscillation is stopped.',
      'VIN':   'Voltage control input. Higher voltage = higher frequency.',
      'OUT':   'Oscillator output.',
      'GND':   'Ground reference (pin 7).',
      'OUTn':  'Complementary oscillator output (inverted).',
      'NC':    'Not connected.',
      'NC2':   'Not connected.',
      'NC3':   'Not connected.',
      'NC4':   'Not connected.',
      'NC5':   'Not connected.',
      'VCC':   'Positive supply (+5 V, pin 14).',
    },
    guideSections: [
      {
        title: 'Voltage Controlled Oscillator',
        paragraphs: [
          'A VCO produces a frequency proportional to its control voltage. In a PLL loop the VCO output is divided and phase compared with a reference; the phase error adjusts VIN to bring the output into lock. Standalone, the 74x324 generates a variable frequency clock.',
        ],
        formulas: [
          'f_out proportional to V_IN (exact formula in datasheet)',
        ],
        note: 'OUT is a square wave whose frequency tracks VIN (analog) linearly from ~10 Hz at 0 V to ~1 kHz at VCC. RNG=1 multiplies the frequency by 10. EN=HIGH enables the oscillator; EN=LOW holds OUT LOW and freezes the phase. C_EXT and R_EXT are documentation-only — the simulator does not solve the external RC timing network.',
      },
    ],
    pinout: [
      { pin:1,  name:'RNG',  type:'input'  },
      { pin:2,  name:'C_EXT',type:'input'  },
      { pin:3,  name:'R_EXT',type:'input'  },
      { pin:4,  name:'EN',   type:'input'  },
      { pin:5,  name:'VIN',  type:'input'  },
      { pin:6,  name:'OUT',  type:'output' },
      { pin:7,  name:'GND',  type:'power'  },
      { pin:8,  name:'OUTn', type:'output' },
      { pin:9,  name:'NC',   type:'input'  },
      { pin:10, name:'NC2',  type:'input'  },
      { pin:11, name:'NC3',  type:'input'  },
      { pin:12, name:'NC4',  type:'input'  },
      { pin:13, name:'NC5',  type:'input'  },
      { pin:14, name:'VCC',  type:'power'  }
    ],
    gates: [{
      type: 'VCO_SINGLE_EN',
      inputs:  ['EN','VIN','RNG'],
      outputs: ['OUT','OUTn']
    }]
  },

  // ── 74325 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Dual VCO, complementary outputs.
  // Stub: each OUT follows its own enable line (always-on: OUT1=VIN1, OUT2=VIN2).
  '74x325': {
    name: '74x325',
    description: 'dual voltage controlled oscillator, complementary outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    guideOverview: 'The 74x325 contains two independent VCO circuits. Each VCO has its own control voltage (VIN1, VIN2), frequency setting components (C_EXT, RNG), and complementary outputs. There are no enable pins; both oscillators run freely. Useful for generating two independent variable frequency clocks.',
    guidePinDescriptions: {
      'RNG1':  'Range input for VCO 1.',
      'C_EXT1':'External capacitor for VCO 1.',
      'VIN1':  'Voltage control input for VCO 1.',
      'OUT1':  'VCO 1 output.',
      'OUT1n': 'VCO 1 complementary output.',
      'OUT2':  'VCO 2 output.',
      'OUT2n': 'VCO 2 complementary output.',
      'GND':   'Ground reference (pin 8).',
      'VIN2':  'Voltage control input for VCO 2.',
      'C_EXT2':'External capacitor for VCO 2.',
      'RNG2':  'Range input for VCO 2.',
      'NC':    'Not connected.',
      'NC2':   'Not connected.',
      'NC3':   'Not connected.',
      'NC4':   'Not connected.',
      'VCC':   'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Dual Independent VCO',
        paragraphs: [
          'Both oscillators run simultaneously and independently. Their frequency ranges are set by RNG1/RNG2 and timing capacitors. Each can be used in a separate PLL or as a standalone variable clock.',
        ],
        note: 'OUT1/OUT2 are square waves whose frequencies track VIN1/VIN2 (analog) linearly from ~10 Hz at 0 V to ~1 kHz at VCC; RNG=1 multiplies the frequency by 10. Both VCOs run continuously (no enable pins). C_EXT timing-capacitor connections are documentation-only.',
      },
    ],
    pinout: [
      { pin:1,  name:'RNG1',  type:'input'  },
      { pin:2,  name:'C_EXT1',type:'input'  },
      { pin:3,  name:'VIN1',  type:'input'  },
      { pin:4,  name:'OUT1',  type:'output' },
      { pin:5,  name:'OUT1n', type:'output' },
      { pin:6,  name:'OUT2',  type:'output' },
      { pin:7,  name:'OUT2n', type:'output' },
      { pin:8,  name:'GND',   type:'power'  },
      { pin:9,  name:'VIN2',  type:'input'  },
      { pin:10, name:'C_EXT2',type:'input'  },
      { pin:11, name:'RNG2',  type:'input'  },
      { pin:12, name:'NC',    type:'input'  },
      { pin:13, name:'NC2',   type:'input'  },
      { pin:14, name:'NC3',   type:'input'  },
      { pin:15, name:'NC4',   type:'input'  },
      { pin:16, name:'VCC',   type:'power'  }
    ],
    gates: [{
      type: 'VCO_DUAL',
      inputs:  ['VIN1','RNG1','VIN2','RNG2'],
      outputs: ['OUT1','OUT1n','OUT2','OUT2n']
    }]
  },

  // ── 74326 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Dual VCO with enable inputs, complementary outputs.
  '74x326': {
    name: '74x326',
    description: 'dual voltage controlled oscillator, enable, complementary outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    guideOverview: 'The 74x326 is a dual VCO with individual enable inputs (EN1, EN2). Each oscillator can be independently gated on or off. When disabled the output stops. Otherwise identical to the 74x325.',
    guidePinDescriptions: {
      'RNG1':  'Range input for VCO 1.',
      'C_EXT1':'External capacitor for VCO 1.',
      'EN1':   'Enable for VCO 1. When LOW, oscillation stops.',
      'VIN1':  'Voltage control input for VCO 1.',
      'OUT1':  'VCO 1 output.',
      'OUT1n': 'VCO 1 complementary output.',
      'OUT2n': 'VCO 2 complementary output.',
      'GND':   'Ground reference (pin 8).',
      'OUT2':  'VCO 2 output.',
      'VIN2':  'Voltage control input for VCO 2.',
      'EN2':   'Enable for VCO 2.',
      'C_EXT2':'External capacitor for VCO 2.',
      'RNG2':  'Range input for VCO 2.',
      'NC':    'Not connected.',
      'NC2':   'Not connected.',
      'VCC':   'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Dual VCO with Enable',
        paragraphs: [
          'Enable pins allow power management or glitch free gating of each VCO independently. Compare to the 74x325 which always runs both oscillators.',
        ],
        note: 'Same frequency model as 74x325 (VIN voltage ~10 Hz at 0 V to ~1 kHz at VCC, RNG=1 multiplies by 10). EN1/EN2=HIGH enables the corresponding VCO; EN=LOW holds its output LOW and freezes the phase. Timing-capacitor pins are documentation-only.',
      },
    ],
    pinout: [
      { pin:1,  name:'RNG1',  type:'input'  },
      { pin:2,  name:'C_EXT1',type:'input'  },
      { pin:3,  name:'EN1',   type:'input'  },
      { pin:4,  name:'VIN1',  type:'input'  },
      { pin:5,  name:'OUT1',  type:'output' },
      { pin:6,  name:'OUT1n', type:'output' },
      { pin:7,  name:'OUT2n', type:'output' },
      { pin:8,  name:'GND',   type:'power'  },
      { pin:9,  name:'OUT2',  type:'output' },
      { pin:10, name:'VIN2',  type:'input'  },
      { pin:11, name:'EN2',   type:'input'  },
      { pin:12, name:'C_EXT2',type:'input'  },
      { pin:13, name:'RNG2',  type:'input'  },
      { pin:14, name:'NC',    type:'input'  },
      { pin:15, name:'NC2',   type:'input'  },
      { pin:16, name:'VCC',   type:'power'  }
    ],
    gates: [{
      type: 'VCO_DUAL_EN',
      inputs:  ['EN1','VIN1','RNG1','EN2','VIN2','RNG2'],
      outputs: ['OUT1','OUT1n','OUT2','OUT2n']
    }]
  },

  // ── 74327 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Dual VCO, no enable, complementary outputs.
  '74x327': {
    name: '74x327',
    description: 'dual voltage controlled oscillator, complementary outputs (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    guideOverview: 'The 74x327 is a dual VCO in a 14-pin package without enable inputs. Each oscillator has independent frequency control. Functionally similar to the 74x325 but in a smaller package.',
    guidePinDescriptions: {
      'RNG1':  'Range input for VCO 1.',
      'C_EXT1':'External capacitor for VCO 1.',
      'VIN1':  'Voltage control input for VCO 1.',
      'OUT1':  'VCO 1 output.',
      'OUT1n': 'VCO 1 complementary output.',
      'OUT2':  'VCO 2 output.',
      'GND':   'Ground reference (pin 7).',
      'OUT2n': 'VCO 2 complementary output.',
      'VIN2':  'Voltage control input for VCO 2.',
      'C_EXT2':'External capacitor for VCO 2.',
      'RNG2':  'Range input for VCO 2.',
      'NC':    'Not connected.',
      'NC3':   'Not connected.',
      'VCC':   'Positive supply (+5 V, pin 14).',
    },
    guideSections: [
      {
        title: 'Compact Dual VCO',
        paragraphs: [
          'Same function as 74x325 in a 14-pin DIP. Use when space is limited and no enable gating is needed.',
        ],
        note: 'Same frequency model as 74x325 (VIN voltage ~10 Hz at 0 V to ~1 kHz at VCC, RNG=1 multiplies by 10). No enable pins — both VCOs run continuously. Timing-capacitor pins are documentation-only.',
      },
    ],
    pinout: [
      { pin:1,  name:'RNG1',  type:'input'  },
      { pin:2,  name:'C_EXT1',type:'input'  },
      { pin:3,  name:'VIN1',  type:'input'  },
      { pin:4,  name:'OUT1',  type:'output' },
      { pin:5,  name:'OUT1n', type:'output' },
      { pin:6,  name:'OUT2',  type:'output' },
      { pin:7,  name:'GND',   type:'power'  },
      { pin:8,  name:'OUT2n', type:'output' },
      { pin:9,  name:'VIN2',  type:'input'  },
      { pin:10, name:'C_EXT2',type:'input'  },
      { pin:11, name:'RNG2',  type:'input'  },
      { pin:12, name:'NC',    type:'input'  },
      { pin:13, name:'NC3',   type:'input'  },
      { pin:14, name:'VCC',   type:'power'  }
    ],
    gates: [{
      type: 'VCO_DUAL',
      inputs:  ['VIN1','RNG1','VIN2','RNG2'],
      outputs: ['OUT1','OUT1n','OUT2','OUT2n']
    }]
  },

  // ── 74337 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Clock driver, tri state.
  // 4 independent clock drivers with individual output enables.
  // Each driver: OE_n → pass CLK to OUT when OE_n=0, else HiZ.
  '74x337': {
    name: '74x337',
    description: 'clock driver, tri state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    guideOverview: 'The 74x337 is a quad clock driver with 3-state outputs. Each of four independent channels has its own clock input (CLK1-CLK4), output enable (OE1n-OE4n), true output, and complementary output. Designed to distribute clock signals with matched propagation delay.',
    guidePinDescriptions: {
      'OE1n': 'Output Enable channel 1 (active LOW). HIGH = HiZ.',
      'CLK1': 'Clock input channel 1.',
      'OUT1': 'Clock output channel 1 (non inverting).',
      'OUT1n':'Clock output channel 1 (inverted).',
      'OE2n': 'Output Enable channel 2 (active LOW).',
      'CLK2': 'Clock input channel 2.',
      'OUT2': 'Clock output channel 2.',
      'OUT2n':'Clock output channel 2 (inverted).',
      'OUT3': 'Clock output channel 3.',
      'GND':  'Ground reference (pin 10).',
      'OUT3n':'Clock output channel 3 (inverted).',
      'CLK3': 'Clock input channel 3.',
      'OE3n': 'Output Enable channel 3 (active LOW).',
      'OUT4': 'Clock output channel 4.',
      'OUT4n':'Clock output channel 4 (inverted).',
      'CLK4': 'Clock input channel 4.',
      'OE4n': 'Output Enable channel 4 (active LOW).',
      'NC':   'Not connected.',
      'NC2':  'Not connected.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Clock Distribution',
        paragraphs: [
          'Clock distribution circuits must minimize skew (arrival time differences between loads). The 74x337 provides four matched drivers so that each load sees the same propagation delay. OE pins allow individual channels to be disabled useful when a clock region is powered down.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'OE1n', type:'input'  },
      { pin:2,  name:'CLK1', type:'input'  },
      { pin:3,  name:'OUT1', type:'output' },
      { pin:4,  name:'OUT1n',type:'output' },
      { pin:5,  name:'OE2n', type:'input'  },
      { pin:6,  name:'CLK2', type:'input'  },
      { pin:7,  name:'OUT2', type:'output' },
      { pin:8,  name:'OUT2n',type:'output' },
      { pin:9,  name:'OUT3', type:'output' },
      { pin:10, name:'GND',  type:'power'  },
      { pin:11, name:'OUT3n',type:'output' },
      { pin:12, name:'CLK3', type:'input'  },
      { pin:13, name:'OE3n', type:'input'  },
      { pin:14, name:'OUT4', type:'output' },
      { pin:15, name:'OUT4n',type:'output' },
      { pin:16, name:'CLK4', type:'input'  },
      { pin:17, name:'OE4n', type:'input'  },
      { pin:18, name:'NC',   type:'input'  },
      { pin:19, name:'NC2',  type:'input'  },
      { pin:20, name:'VCC',  type:'power'  }
    ],
    gates: [{
      type: 'CLK_DRIVER_QUAD_TRI',
      inputs:  ['OE1n','CLK1','OE2n','CLK2','OE3n','CLK3','OE4n','CLK4'],
      outputs: ['OUT1','OUT1n','OUT2','OUT2n','OUT3','OUT3n','OUT4','OUT4n']
    }]
  },

  // ── 74340 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Octal buffer, inverting, Schmitt trigger, tri state.
  // OE1n controls Y1-Y4, OE2n controls Y5-Y8.
  '74x340': {
    name: '74x340',
    description: 'octal buffer, inverting, Schmitt trigger, tri state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    guideOverview: 'The 74x340 is an octal inverting buffer with Schmitt trigger inputs and 3-state outputs. The Schmitt trigger provides hysteresis, making the chip useful for conditioning slow or noisy input signals. OE1n controls Y1-Y4 and OE2n controls Y5-Y8.',
    guidePinDescriptions: {
      'OE1n': 'Output Enable for Y1-Y4 (active LOW). HIGH = HiZ.',
      'A1':   'Input 1.',
      'Y1':   'Inverted output 1.',
      'A2':   'Input 2.',
      'Y2':   'Inverted output 2.',
      'A3':   'Input 3.',
      'Y3':   'Inverted output 3.',
      'A4':   'Input 4.',
      'Y4':   'Inverted output 4.',
      'GND':  'Ground reference (pin 10).',
      'Y5':   'Inverted output 5.',
      'A5':   'Input 5.',
      'Y6':   'Inverted output 6.',
      'A6':   'Input 6.',
      'Y7':   'Inverted output 7.',
      'A7':   'Input 7.',
      'Y8':   'Inverted output 8.',
      'A8':   'Input 8.',
      'OE2n': 'Output Enable for Y5-Y8 (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Schmitt Trigger Inputs',
        paragraphs: [
          'The Schmitt trigger adds hysteresis: the threshold for a LOW to HIGH transition is higher than for a HIGH to LOW transition. This prevents multiple output toggles from a single slow input edge and rejects noise around the switching threshold.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'OE1n', type:'input'  },
      { pin:2,  name:'A1',   type:'input'  },
      { pin:3,  name:'Y1',   type:'output' },
      { pin:4,  name:'A2',   type:'input'  },
      { pin:5,  name:'Y2',   type:'output' },
      { pin:6,  name:'A3',   type:'input'  },
      { pin:7,  name:'Y3',   type:'output' },
      { pin:8,  name:'A4',   type:'input'  },
      { pin:9,  name:'Y4',   type:'output' },
      { pin:10, name:'GND',  type:'power'  },
      { pin:11, name:'Y5',   type:'output' },
      { pin:12, name:'A5',   type:'input'  },
      { pin:13, name:'Y6',   type:'output' },
      { pin:14, name:'A6',   type:'input'  },
      { pin:15, name:'Y7',   type:'output' },
      { pin:16, name:'A7',   type:'input'  },
      { pin:17, name:'Y8',   type:'output' },
      { pin:18, name:'A8',   type:'input'  },
      { pin:19, name:'OE2n', type:'input'  },
      { pin:20, name:'VCC',  type:'power'  }
    ],
    gates: [{
      type: 'BUFFER_OCT_INV_ST_TRI',
      inputs:  ['A1','A2','A3','A4','A5','A6','A7','A8','OE1n','OE2n'],
      outputs: ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8']
    }]
  },

  // ── 74341 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Octal buffer, non inverting, Schmitt trigger, tri state.
  '74x341': {
    name: '74x341',
    description: 'octal buffer, non inverting, Schmitt trigger, tri state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    guideOverview: 'The 74x341 is an octal non inverting buffer with Schmitt trigger inputs and 3-state outputs. Like the 74x340 but the outputs follow the inputs rather than invert them. Useful for noise immune bus driving.',
    guidePinDescriptions: {
      'OE1n': 'Output Enable for Y1-Y4 (active LOW). HIGH = HiZ.',
      'A1':   'Input 1.',
      'Y1':   'Non inverting output 1.',
      'A2':   'Input 2.',
      'Y2':   'Non inverting output 2.',
      'A3':   'Input 3.',
      'Y3':   'Non inverting output 3.',
      'A4':   'Input 4.',
      'Y4':   'Non inverting output 4.',
      'GND':  'Ground reference (pin 10).',
      'Y5':   'Non inverting output 5.',
      'A5':   'Input 5.',
      'Y6':   'Non inverting output 6.',
      'A6':   'Input 6.',
      'Y7':   'Non inverting output 7.',
      'A7':   'Input 7.',
      'Y8':   'Non inverting output 8.',
      'A8':   'Input 8.',
      'OE2n': 'Output Enable for Y5-Y8 (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Non Inverting Schmitt Buffer',
        paragraphs: [
          'Identical function to 74x340 except outputs are true (not inverted). Use when you need signal conditioning without polarity inversion.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'OE1n', type:'input'  },
      { pin:2,  name:'A1',   type:'input'  },
      { pin:3,  name:'Y1',   type:'output' },
      { pin:4,  name:'A2',   type:'input'  },
      { pin:5,  name:'Y2',   type:'output' },
      { pin:6,  name:'A3',   type:'input'  },
      { pin:7,  name:'Y3',   type:'output' },
      { pin:8,  name:'A4',   type:'input'  },
      { pin:9,  name:'Y4',   type:'output' },
      { pin:10, name:'GND',  type:'power'  },
      { pin:11, name:'Y5',   type:'output' },
      { pin:12, name:'A5',   type:'input'  },
      { pin:13, name:'Y6',   type:'output' },
      { pin:14, name:'A6',   type:'input'  },
      { pin:15, name:'Y7',   type:'output' },
      { pin:16, name:'A7',   type:'input'  },
      { pin:17, name:'Y8',   type:'output' },
      { pin:18, name:'A8',   type:'input'  },
      { pin:19, name:'OE2n', type:'input'  },
      { pin:20, name:'VCC',  type:'power'  }
    ],
    gates: [{
      type: 'BUFFER_OCT_ST_TRI',
      inputs:  ['A1','A2','A3','A4','A5','A6','A7','A8','OE1n','OE2n'],
      outputs: ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8']
    }]
  },

  // ── 74344 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Octal buffer, non inverting, Schmitt trigger, tri state (bus interface version).
  '74x344': {
    name: '74x344',
    description: 'octal buffer, non inverting, Schmitt trigger, tri state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    guideOverview: 'The 74x344 is a bus interface version of the 74x341 octal non inverting Schmitt buffer. Functionally equivalent to the 74x341 but optimized for bus interface applications.',
    guidePinDescriptions: {
      'OE1n': 'Output Enable for Y1-Y4 (active LOW).',
      'A1':   'Input 1.',
      'Y1':   'Non inverting output 1.',
      'A2':   'Input 2.',
      'Y2':   'Non inverting output 2.',
      'A3':   'Input 3.',
      'Y3':   'Non inverting output 3.',
      'A4':   'Input 4.',
      'Y4':   'Non inverting output 4.',
      'GND':  'Ground reference (pin 10).',
      'Y5':   'Non inverting output 5.',
      'A5':   'Input 5.',
      'Y6':   'Non inverting output 6.',
      'A6':   'Input 6.',
      'Y7':   'Non inverting output 7.',
      'A7':   'Input 7.',
      'Y8':   'Non inverting output 8.',
      'A8':   'Input 8.',
      'OE2n': 'Output Enable for Y5-Y8 (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Bus Interface Variant',
        paragraphs: [
          'The 74x344 targets bus receiver applications where the Schmitt inputs reject reflections and noise common on PCB bus traces. Electrically interchangeable with the 74x341.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'OE1n', type:'input'  },
      { pin:2,  name:'A1',   type:'input'  },
      { pin:3,  name:'Y1',   type:'output' },
      { pin:4,  name:'A2',   type:'input'  },
      { pin:5,  name:'Y2',   type:'output' },
      { pin:6,  name:'A3',   type:'input'  },
      { pin:7,  name:'Y3',   type:'output' },
      { pin:8,  name:'A4',   type:'input'  },
      { pin:9,  name:'Y4',   type:'output' },
      { pin:10, name:'GND',  type:'power'  },
      { pin:11, name:'Y5',   type:'output' },
      { pin:12, name:'A5',   type:'input'  },
      { pin:13, name:'Y6',   type:'output' },
      { pin:14, name:'A6',   type:'input'  },
      { pin:15, name:'Y7',   type:'output' },
      { pin:16, name:'A7',   type:'input'  },
      { pin:17, name:'Y8',   type:'output' },
      { pin:18, name:'A8',   type:'input'  },
      { pin:19, name:'OE2n', type:'input'  },
      { pin:20, name:'VCC',  type:'power'  }
    ],
    gates: [{
      type: 'BUFFER_OCT_ST_TRI',
      inputs:  ['A1','A2','A3','A4','A5','A6','A7','A8','OE1n','OE2n'],
      outputs: ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8']
    }]
  }

};
