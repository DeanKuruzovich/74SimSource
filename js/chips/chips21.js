export const CHIPS_BLOCK_21 = {

  // ── 74322 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Shift_register
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8 bit shift register with sign extend, tri-state outputs.
  // S=0: hold, S=1: shift right (sign extend MSB).
  // OEn: output enable (active low).
  // pins: CLK, S, SER, OEn, D0-D7, Q0-Q7 (20-pin)
  '74322': {
    name: '74x322',
    description: '8 bit shift register, sign extend, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x322 is an 8 bit parallel-in/parallel-out shift register with a sign-extend mode and 3-state outputs. When S=1 the register shifts right, replicating (sign-extending) the MSB (D7) into the vacated position. This is useful for arithmetic right shifts of signed 2s-complement numbers.',
    guidePinDescriptions: {
      'S':   'Mode select. HIGH = shift right with sign extension; LOW = hold.',
      'D0':  'Parallel data input bit 0.',
      'D1':  'Parallel data input bit 1.',
      'D2':  'Parallel data input bit 2.',
      'D3':  'Parallel data input bit 3.',
      'D4':  'Parallel data input bit 4.',
      'D5':  'Parallel data input bit 5.',
      'D6':  'Parallel data input bit 6.',
      'D7':  'Parallel data input bit 7 (MSB, sign bit).',
      'GND': 'Ground reference (pin 10).',
      'CLK': 'Clock input. Operations occur on rising edge.',
      'SER': 'Serial input for non-sign-extend mode. Enters at Q0 when shifting.',
      'OEn': 'Output Enable (active LOW). When asserted (LOW), drives Q outputs; when HIGH, tri-states them.',
      'Q7':  'Output bit 7 (MSB of the shifted register).',
      'Q6':  'Output bit 6.',
      'Q5':  'Output bit 5.',
      'Q4':  'Output bit 4.',
      'Q3':  'Output bit 3.',
      'Q2':  'Output bit 2 (LSB, serial output).',
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
  // OEAn, OEBn: tri-state output enables.
  '74323': {
    name: '74x323',
    description: '8 bit bidirectional universal shift/storage register, sync clear, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x323 is an 8 bit bidirectional universal shift/storage register with synchronous clear (CLRn) and 3-state outputs. Modes (S0, S1): 00=hold, 01=shift right (SR), 10=shift left (SL), 11=parallel load. CLRn (active LOW) synchronously clears all bits to 0 on the clock edge. OEAn and OEBn independently enable the two output halves.',
    guidePinDescriptions: {
      'S0':   'Mode select bit 0. S1:S0 = 00 hold, 01 shift-right, 10 shift-left, 11 parallel load.',
      'S1':   'Mode select bit 1.',
      'SR':   'Serial input for shift-right. Enters at QA.',
      'QA':   'Bit A output (LSB, affected by shift-right mode).',
      'QB':   'Bit B output.',
      'QC':   'Bit C output.',
      'QD':   'Bit D output.',
      'OEAn': 'Output Enable A (active LOW). When asserted (LOW), drives QA-QD; when HIGH, tri-states them.',
      'OEBn': 'Output Enable B (active LOW). When asserted (LOW), drives QE-QH; when HIGH, tri-states them.',
      'GND':  'Ground reference (pin 10).',
      'CLK':  'Clock. All operations on rising edge.',
      'CLRn': 'Synchronous Clear (active LOW). Clears register to 0000 0000 on rising CLK.',
      'SL':   'Serial input for shift-left. Enters at QH.',
      'QH':   'Bit H output (MSB, affected by shift-left mode).',
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
          'Unlike asynchronous clear (which resets immediately), synchronous clear waits for the rising clock edge. This avoids partial-cycle glitches and ensures the register transitions cleanly. Pull CLRn HIGH when clear is not needed.',
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
  // Voltage-controlled oscillator (analog), enable input, complementary outputs.
  // Stub: OUT = EN (passthrough), /OUT = !EN.
  '74324': {
    name: '74x324',
    description: 'voltage-controlled oscillator, enable, complementary outputs (14-pin)',
    pins: 14,
    guideOverview: 'The 74x324 is a single voltage-controlled oscillator (VCO). The output frequency is set by an external timing capacitor (C_EXT), resistor (R_EXT), and a control voltage on VIN. RNG (range) adjusts the frequency range. EN (active LOW) gates the output when asserted. OUT and OUT (inverted) provide complementary clock outputs.',
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
        title: 'Voltage-Controlled Oscillator',
        paragraphs: [
          'A VCO produces a frequency proportional to its control voltage. In a PLL loop the VCO output is divided and phase-compared with a reference; the phase error adjusts VIN to bring the output into lock. Standalone, the 74x324 generates a variable-frequency clock.',
        ],
        formulas: [
          'f_out proportional to V_IN (exact formula in datasheet)',
        ],
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
      inputs:  ['EN'],
      outputs: ['OUT','OUTn']
    }]
  },

  // ── 74325 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Dual VCO, complementary outputs.
  // Stub: each OUT follows its own enable line (always-on: OUT1=VIN1, OUT2=VIN2).
  '74325': {
    name: '74x325',
    description: 'dual voltage-controlled oscillator, complementary outputs (16-pin)',
    pins: 16,
    guideOverview: 'The 74x325 contains two independent VCO circuits. Each VCO has its own control voltage (VIN1, VIN2), frequency-setting components (C_EXT, RNG), and complementary outputs. There are no enable pins; both oscillators run freely. Useful for generating two independent variable-frequency clocks.',
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
      inputs:  ['VIN1','VIN2'],
      outputs: ['OUT1','OUT1n','OUT2','OUT2n']
    }]
  },

  // ── 74326 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Dual VCO with enable inputs, complementary outputs.
  '74326': {
    name: '74x326',
    description: 'dual voltage-controlled oscillator, enable, complementary outputs (16-pin)',
    pins: 16,
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
          'Enable pins allow power management or glitch-free gating of each VCO independently. Compare to the 74x325 which always runs both oscillators.',
        ],
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
      inputs:  ['EN1','VIN1','EN2','VIN2'],
      outputs: ['OUT1','OUT1n','OUT2','OUT2n']
    }]
  },

  // ── 74327 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Dual VCO, no enable, complementary outputs.
  '74327': {
    name: '74x327',
    description: 'dual voltage-controlled oscillator, complementary outputs (14-pin)',
    pins: 14,
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
      inputs:  ['VIN1','VIN2'],
      outputs: ['OUT1','OUT1n','OUT2','OUT2n']
    }]
  },

  // ── 74330 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // PLA: 12 inputs, 50 product terms, 6 outputs, tri-state.
  // Stub: all outputs = 0 (programmable by mask ROM).
  '74330': {
    name: '74x330',
    description: 'PLA (12 inputs, 50 terms, 6 outputs), tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x330 is a field-programmable logic array (PLA) with 12 inputs, 50 product terms, and 6 outputs with 3-state control. A PLA implements arbitrary combinational logic by mask-programming an AND plane (product terms) and an OR plane (sum of products). The 74x330 is a read-only device whose logic is fixed at manufacture.',
    guidePinDescriptions: {
      'I0':  'Logic input 0.',
      'I1':  'Logic input 1.',
      'I2':  'Logic input 2.',
      'I3':  'Logic input 3.',
      'I4':  'Logic input 4.',
      'I5':  'Logic input 5.',
      'OEn': 'Output Enable (active LOW). When HIGH, all outputs are tri-stated.',
      'F0':  'Logic output 0.',
      'F1':  'Logic output 1.',
      'GND': 'Ground reference (pin 10).',
      'F2':  'Logic output 2.',
      'F3':  'Logic output 3.',
      'F4':  'Logic output 4.',
      'F5':  'Logic output 5.',
      'I6':  'Logic input 6.',
      'I7':  'Logic input 7.',
      'I8':  'Logic input 8.',
      'I9':  'Logic input 9.',
      'I10': 'Logic input 10.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Programmable Logic Array (PLA)',
        paragraphs: [
          'A PLA implements sum-of-products Boolean logic. The AND plane generates product terms from the inputs and their complements; the OR plane combines selected product terms into each output. With 50 product terms and 6 outputs, the 74x330 can realize complex multi-output combinational functions in a single chip.',
        ],
        note: 'The 74x330 is mask-programmed at manufacture (not field-programmable by the user). Use it when a fixed logic function is needed in volume production.',
      },
    ],
    pinout: [
      { pin:1,  name:'I0',  type:'input'  },
      { pin:2,  name:'I1',  type:'input'  },
      { pin:3,  name:'I2',  type:'input'  },
      { pin:4,  name:'I3',  type:'input'  },
      { pin:5,  name:'I4',  type:'input'  },
      { pin:6,  name:'I5',  type:'input'  },
      { pin:7,  name:'OEn', type:'input'  },
      { pin:8,  name:'F0',  type:'output' },
      { pin:9,  name:'F1',  type:'output' },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'F2',  type:'output' },
      { pin:12, name:'F3',  type:'output' },
      { pin:13, name:'F4',  type:'output' },
      { pin:14, name:'F5',  type:'output' },
      { pin:15, name:'I6',  type:'input'  },
      { pin:16, name:'I7',  type:'input'  },
      { pin:17, name:'I8',  type:'input'  },
      { pin:18, name:'I9',  type:'input'  },
      { pin:19, name:'I10', type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'PLA_12IN_6OUT_TRI',
      inputs:  ['OEn','I0','I1','I2','I3','I4','I5','I6','I7','I8','I9','I10'],
      outputs: ['F0','F1','F2','F3','F4','F5']
    }]
  },

  // ── 74331 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  // PLA: 12 inputs, 50 product terms, 6 outputs, OC with pull up.
  '74331': {
    name: '74x331',
    description: 'PLA (12 inputs, 50 terms, 6 outputs), open-collector (20-pin)',
    pins: 20,
    guideOverview: 'The 74x331 is identical to the 74x330 PLA (12 inputs, 50 product terms, 6 outputs) except that the outputs are open-collector rather than tri-state. Open-collector outputs allow wired AND connections on the output bus, useful for bus arbitration or shared logic lines.',
    guidePinDescriptions: {
      'I0':  'Logic input 0.',
      'I1':  'Logic input 1.',
      'I2':  'Logic input 2.',
      'I3':  'Logic input 3.',
      'I4':  'Logic input 4.',
      'I5':  'Logic input 5.',
      'OEn': 'Output Enable (active LOW).',
      'F0':  'Logic output 0 (open-collector).',
      'F1':  'Logic output 1.',
      'GND': 'Ground reference (pin 10).',
      'F2':  'Logic output 2.',
      'F3':  'Logic output 3.',
      'F4':  'Logic output 4.',
      'F5':  'Logic output 5.',
      'I6':  'Logic input 6.',
      'I7':  'Logic input 7.',
      'I8':  'Logic input 8.',
      'I9':  'Logic input 9.',
      'I10': 'Logic input 10.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'OC vs Tri-State PLA',
        paragraphs: [
          'With open-collector outputs, add pull up resistors on each F pin. Multiple 74x331s can drive the same F-bus lines (wired AND). Choose the 74x330 when you need standard tri-state bus driving.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'I0',  type:'input'  },
      { pin:2,  name:'I1',  type:'input'  },
      { pin:3,  name:'I2',  type:'input'  },
      { pin:4,  name:'I3',  type:'input'  },
      { pin:5,  name:'I4',  type:'input'  },
      { pin:6,  name:'I5',  type:'input'  },
      { pin:7,  name:'OEn', type:'input'  },
      { pin:8,  name:'F0',  type:'output' },
      { pin:9,  name:'F1',  type:'output' },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'F2',  type:'output' },
      { pin:12, name:'F3',  type:'output' },
      { pin:13, name:'F4',  type:'output' },
      { pin:14, name:'F5',  type:'output' },
      { pin:15, name:'I6',  type:'input'  },
      { pin:16, name:'I7',  type:'input'  },
      { pin:17, name:'I8',  type:'input'  },
      { pin:18, name:'I9',  type:'input'  },
      { pin:19, name:'I10', type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'PLA_12IN_6OUT_OC',
      inputs:  ['OEn','I0','I1','I2','I3','I4','I5','I6','I7','I8','I9','I10'],
      outputs: ['F0','F1','F2','F3','F4','F5']
    }]
  },

  // ── 74333 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // PLA: 12 inputs, 32 product terms, 6 outputs, 4 state registers, tri-state.
  '74333': {
    name: '74x333',
    description: 'PLA (12 inputs, 32 terms, 6 outputs, 4 state regs), tri-state (24-pin)',
    pins: 24,
    guideOverview: 'The 74x333 is a registered PLA with 12 inputs, 32 product terms, 6 combinational outputs, and 4 clocked state registers. The state registers (D flip-flops) allow the PLA to implement sequential logic (state machines): the current state feeds back into the input plane, and the next state is computed each clock cycle.',
    guidePinDescriptions: {
      'I0':  'Logic/state input 0.',
      'I1':  'Logic/state input 1.',
      'I2':  'Logic/state input 2.',
      'I3':  'Logic/state input 3.',
      'I4':  'Logic/state input 4.',
      'I5':  'Logic/state input 5.',
      'CLK': 'Clock for the state registers.',
      'OEn': 'Output Enable (active LOW).',
      'F0':  'Logic output 0.',
      'F1':  'Logic output 1.',
      'F2':  'Logic output 2.',
      'GND': 'Ground reference (pin 12).',
      'F3':  'Logic output 3.',
      'F4':  'Logic output 4.',
      'F5':  'Logic output 5.',
      'I6':  'Logic/state input 6.',
      'I7':  'Logic/state input 7.',
      'I8':  'Logic/state input 8.',
      'I9':  'Logic/state input 9.',
      'I10': 'Logic/state input 10.',
      'I11': 'Logic/state input 11.',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Registered PLA for State Machines',
        paragraphs: [
          'The 4 state registers form the state memory of a finite state machine. On each clock edge the state registers capture their next-state inputs (computed by the AND/OR planes). The current state bits feed back into the input plane for the next cycle. This lets a single 74x333 implement a Moore or Mealy state machine with up to 16 states.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'I0',  type:'input'  },
      { pin:2,  name:'I1',  type:'input'  },
      { pin:3,  name:'I2',  type:'input'  },
      { pin:4,  name:'I3',  type:'input'  },
      { pin:5,  name:'I4',  type:'input'  },
      { pin:6,  name:'I5',  type:'input'  },
      { pin:7,  name:'CLK', type:'input'  },
      { pin:8,  name:'OEn', type:'input'  },
      { pin:9,  name:'F0',  type:'output' },
      { pin:10, name:'F1',  type:'output' },
      { pin:11, name:'F2',  type:'output' },
      { pin:12, name:'GND', type:'power'  },
      { pin:13, name:'F3',  type:'output' },
      { pin:14, name:'F4',  type:'output' },
      { pin:15, name:'F5',  type:'output' },
      { pin:16, name:'I6',  type:'input'  },
      { pin:17, name:'I7',  type:'input'  },
      { pin:18, name:'I8',  type:'input'  },
      { pin:19, name:'I9',  type:'input'  },
      { pin:20, name:'I10', type:'input'  },
      { pin:21, name:'I11', type:'input'  },
      { pin:22, name:'NC',  type:'input'  },
      { pin:23, name:'NC2', type:'input'  },
      { pin:24, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'PLA_12IN_6OUT_SREG_TRI',
      inputs:  ['OEn','CLK','I0','I1','I2','I3','I4','I5','I6','I7','I8','I9','I10','I11'],
      outputs: ['F0','F1','F2','F3','F4','F5']
    }]
  },

  // ── 74334 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // PLA: 12 inputs, 32 product terms, 6 outputs, tri-state (no state regs).
  '74334': {
    name: '74x334',
    description: 'PLA (12 inputs, 32 terms, 6 outputs), tri-state (24-pin)',
    pins: 24,
    guideOverview: 'The 74x334 is a combinational PLA with 12 inputs, 32 product terms, and 6 tri-state outputs. Like the 74x330 but with 32 product terms instead of 50, and in a 24-pin package. Implements sum-of-products logic; mask-programmed at manufacture.',
    guidePinDescriptions: {
      'I0':  'Logic input 0.',
      'I1':  'Logic input 1.',
      'I2':  'Logic input 2.',
      'I3':  'Logic input 3.',
      'I4':  'Logic input 4.',
      'I5':  'Logic input 5.',
      'OEn': 'Output Enable (active LOW).',
      'F0':  'Logic output 0.',
      'F1':  'Logic output 1.',
      'F2':  'Logic output 2.',
      'F3':  'Logic output 3.',
      'GND': 'Ground reference (pin 12).',
      'F4':  'Logic output 4.',
      'F5':  'Logic output 5.',
      'I6':  'Logic input 6.',
      'I7':  'Logic input 7.',
      'I8':  'Logic input 8.',
      'I9':  'Logic input 9.',
      'I10': 'Logic input 10.',
      'I11': 'Logic input 11.',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'NC3': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: '32-Term Combinational PLA',
        paragraphs: [
          'Thirty-two product terms shared across 6 outputs. Use when the logic function requires more inputs (12 vs typical 10) but fewer product terms than the 74x330.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'I0',  type:'input'  },
      { pin:2,  name:'I1',  type:'input'  },
      { pin:3,  name:'I2',  type:'input'  },
      { pin:4,  name:'I3',  type:'input'  },
      { pin:5,  name:'I4',  type:'input'  },
      { pin:6,  name:'I5',  type:'input'  },
      { pin:7,  name:'OEn', type:'input'  },
      { pin:8,  name:'F0',  type:'output' },
      { pin:9,  name:'F1',  type:'output' },
      { pin:10, name:'F2',  type:'output' },
      { pin:11, name:'F3',  type:'output' },
      { pin:12, name:'GND', type:'power'  },
      { pin:13, name:'F4',  type:'output' },
      { pin:14, name:'F5',  type:'output' },
      { pin:15, name:'I6',  type:'input'  },
      { pin:16, name:'I7',  type:'input'  },
      { pin:17, name:'I8',  type:'input'  },
      { pin:18, name:'I9',  type:'input'  },
      { pin:19, name:'I10', type:'input'  },
      { pin:20, name:'I11', type:'input'  },
      { pin:21, name:'NC',  type:'input'  },
      { pin:22, name:'NC2', type:'input'  },
      { pin:23, name:'NC3', type:'input'  },
      { pin:24, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'PLA_12IN_6OUT_TRI',
      inputs:  ['OEn','I0','I1','I2','I3','I4','I5','I6','I7','I8','I9','I10','I11'],
      outputs: ['F0','F1','F2','F3','F4','F5']
    }]
  },

  // ── 74335 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  // PLA: 12 inputs, 32 product terms, 6 outputs, 4 state registers, OC.
  '74335': {
    name: '74x335',
    description: 'PLA (12 inputs, 32 terms, 6 outputs, 4 state regs), open-collector (24-pin)',
    pins: 24,
    guideOverview: 'The 74x335 is a registered PLA identical to the 74x333 but with open-collector outputs instead of tri-state. It has 12 inputs, 32 product terms, 6 OC outputs, and 4 state registers for sequential logic.',
    guidePinDescriptions: {
      'I0':  'Logic/state input 0.',
      'I1':  'Logic/state input 1.',
      'I2':  'Logic/state input 2.',
      'I3':  'Logic/state input 3.',
      'I4':  'Logic/state input 4.',
      'I5':  'Logic/state input 5.',
      'CLK': 'Clock for state registers.',
      'OEn': 'Output Enable (active LOW).',
      'F0':  'Logic output 0 (open-collector).',
      'F1':  'Logic output 1.',
      'F2':  'Logic output 2.',
      'GND': 'Ground reference (pin 12).',
      'F3':  'Logic output 3.',
      'F4':  'Logic output 4.',
      'F5':  'Logic output 5.',
      'I6':  'Logic/state input 6.',
      'I7':  'Logic/state input 7.',
      'I8':  'Logic/state input 8.',
      'I9':  'Logic/state input 9.',
      'I10': 'Logic/state input 10.',
      'I11': 'Logic/state input 11.',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Registered PLA, OC Outputs',
        paragraphs: [
          'Combines state machine capability with open-collector outputs for wired AND bus driving. Add pull up resistors on F0-F5. See the 74x333 guide for state machine wiring details.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'I0',  type:'input'  },
      { pin:2,  name:'I1',  type:'input'  },
      { pin:3,  name:'I2',  type:'input'  },
      { pin:4,  name:'I3',  type:'input'  },
      { pin:5,  name:'I4',  type:'input'  },
      { pin:6,  name:'I5',  type:'input'  },
      { pin:7,  name:'CLK', type:'input'  },
      { pin:8,  name:'OEn', type:'input'  },
      { pin:9,  name:'F0',  type:'output' },
      { pin:10, name:'F1',  type:'output' },
      { pin:11, name:'F2',  type:'output' },
      { pin:12, name:'GND', type:'power'  },
      { pin:13, name:'F3',  type:'output' },
      { pin:14, name:'F4',  type:'output' },
      { pin:15, name:'F5',  type:'output' },
      { pin:16, name:'I6',  type:'input'  },
      { pin:17, name:'I7',  type:'input'  },
      { pin:18, name:'I8',  type:'input'  },
      { pin:19, name:'I9',  type:'input'  },
      { pin:20, name:'I10', type:'input'  },
      { pin:21, name:'I11', type:'input'  },
      { pin:22, name:'NC',  type:'input'  },
      { pin:23, name:'NC2', type:'input'  },
      { pin:24, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'PLA_12IN_6OUT_SREG_OC',
      inputs:  ['OEn','CLK','I0','I1','I2','I3','I4','I5','I6','I7','I8','I9','I10','I11'],
      outputs: ['F0','F1','F2','F3','F4','F5']
    }]
  },

  // ── 74336 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  // PLA: 12 inputs, 32 product terms, 6 outputs, OC.
  '74336': {
    name: '74x336',
    description: 'PLA (12 inputs, 32 terms, 6 outputs), open-collector (24-pin)',
    pins: 24,
    guideOverview: 'The 74x336 is a combinational PLA with 12 inputs, 32 product terms, and 6 open-collector outputs. OC version of the 74x334. Add pull up resistors on all outputs.',
    guidePinDescriptions: {
      'I0':  'Logic input 0.',
      'I1':  'Logic input 1.',
      'I2':  'Logic input 2.',
      'I3':  'Logic input 3.',
      'I4':  'Logic input 4.',
      'I5':  'Logic input 5.',
      'OEn': 'Output Enable (active LOW).',
      'F0':  'Logic output 0 (open-collector).',
      'F1':  'Logic output 1.',
      'F2':  'Logic output 2.',
      'F3':  'Logic output 3.',
      'GND': 'Ground reference (pin 12).',
      'F4':  'Logic output 4.',
      'F5':  'Logic output 5.',
      'I6':  'Logic input 6.',
      'I7':  'Logic input 7.',
      'I8':  'Logic input 8.',
      'I9':  'Logic input 9.',
      'I10': 'Logic input 10.',
      'I11': 'Logic input 11.',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'NC3': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: '32-Term PLA, OC Outputs',
        paragraphs: [
          'Open-collector version of the 74x334. Add pull up resistors on F0-F5. Allows wired AND connections on output lines.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'I0',  type:'input'  },
      { pin:2,  name:'I1',  type:'input'  },
      { pin:3,  name:'I2',  type:'input'  },
      { pin:4,  name:'I3',  type:'input'  },
      { pin:5,  name:'I4',  type:'input'  },
      { pin:6,  name:'I5',  type:'input'  },
      { pin:7,  name:'OEn', type:'input'  },
      { pin:8,  name:'F0',  type:'output' },
      { pin:9,  name:'F1',  type:'output' },
      { pin:10, name:'F2',  type:'output' },
      { pin:11, name:'F3',  type:'output' },
      { pin:12, name:'GND', type:'power'  },
      { pin:13, name:'F4',  type:'output' },
      { pin:14, name:'F5',  type:'output' },
      { pin:15, name:'I6',  type:'input'  },
      { pin:16, name:'I7',  type:'input'  },
      { pin:17, name:'I8',  type:'input'  },
      { pin:18, name:'I9',  type:'input'  },
      { pin:19, name:'I10', type:'input'  },
      { pin:20, name:'I11', type:'input'  },
      { pin:21, name:'NC',  type:'input'  },
      { pin:22, name:'NC2', type:'input'  },
      { pin:23, name:'NC3', type:'input'  },
      { pin:24, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'PLA_12IN_6OUT_OC',
      inputs:  ['OEn','I0','I1','I2','I3','I4','I5','I6','I7','I8','I9','I10','I11'],
      outputs: ['F0','F1','F2','F3','F4','F5']
    }]
  },

  // ── 74337 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Clock driver, tri-state.
  // 4 independent clock drivers with individual output enables.
  // Each driver: OE_n → pass CLK to OUT when OE_n=0, else HiZ.
  '74337': {
    name: '74x337',
    description: 'clock driver, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x337 is a quad clock driver with 3-state outputs. Each of four independent channels has its own clock input (CLK1-CLK4), output enable (OE1n-OE4n), true output, and complementary output. Designed to distribute clock signals with matched propagation delay.',
    guidePinDescriptions: {
      'OE1n': 'Output Enable channel 1 (active LOW). HIGH = HiZ.',
      'CLK1': 'Clock input channel 1.',
      'OUT1': 'Clock output channel 1 (non-inverting).',
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
  // Octal buffer, inverting, Schmitt trigger, tri-state.
  // OE1n controls Y1-Y4, OE2n controls Y5-Y8.
  '74340': {
    name: '74x340',
    description: 'octal buffer, inverting, Schmitt trigger, tri-state (20-pin)',
    pins: 20,
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
          'The Schmitt trigger adds hysteresis: the threshold for a LOW-to-HIGH transition is higher than for a HIGH-to-LOW transition. This prevents multiple output toggles from a single slow input edge and rejects noise around the switching threshold.',
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
  // Octal buffer, non-inverting, Schmitt trigger, tri-state.
  '74341': {
    name: '74x341',
    description: 'octal buffer, non-inverting, Schmitt trigger, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x341 is an octal non-inverting buffer with Schmitt trigger inputs and 3-state outputs. Like the 74x340 but the outputs follow the inputs rather than invert them. Useful for noise-immune bus driving.',
    guidePinDescriptions: {
      'OE1n': 'Output Enable for Y1-Y4 (active LOW). HIGH = HiZ.',
      'A1':   'Input 1.',
      'Y1':   'Non-inverting output 1.',
      'A2':   'Input 2.',
      'Y2':   'Non-inverting output 2.',
      'A3':   'Input 3.',
      'Y3':   'Non-inverting output 3.',
      'A4':   'Input 4.',
      'Y4':   'Non-inverting output 4.',
      'GND':  'Ground reference (pin 10).',
      'Y5':   'Non-inverting output 5.',
      'A5':   'Input 5.',
      'Y6':   'Non-inverting output 6.',
      'A6':   'Input 6.',
      'Y7':   'Non-inverting output 7.',
      'A7':   'Input 7.',
      'Y8':   'Non-inverting output 8.',
      'A8':   'Input 8.',
      'OE2n': 'Output Enable for Y5-Y8 (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Non-Inverting Schmitt Buffer',
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
  // Octal buffer, non-inverting, Schmitt trigger, tri-state (bus interface version).
  '74344': {
    name: '74x344',
    description: 'octal buffer, non-inverting, Schmitt trigger, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x344 is a bus-interface version of the 74x341 octal non-inverting Schmitt buffer. Functionally equivalent to the 74x341 but optimized for bus interface applications.',
    guidePinDescriptions: {
      'OE1n': 'Output Enable for Y1-Y4 (active LOW).',
      'A1':   'Input 1.',
      'Y1':   'Non-inverting output 1.',
      'A2':   'Input 2.',
      'Y2':   'Non-inverting output 2.',
      'A3':   'Input 3.',
      'Y3':   'Non-inverting output 3.',
      'A4':   'Input 4.',
      'Y4':   'Non-inverting output 4.',
      'GND':  'Ground reference (pin 10).',
      'Y5':   'Non-inverting output 5.',
      'A5':   'Input 5.',
      'Y6':   'Non-inverting output 6.',
      'A6':   'Input 6.',
      'Y7':   'Non-inverting output 7.',
      'A7':   'Input 7.',
      'Y8':   'Non-inverting output 8.',
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
