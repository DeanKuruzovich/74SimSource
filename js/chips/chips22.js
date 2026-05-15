export const CHIPS_BLOCK_22 = {

  // ── 74347 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  // BCD to 7-segment decoder/driver, low-voltage version of 7447.
  // Open-collector outputs, active low.
  '74347': {
    name: '74x347',
    description: 'BCD to 7-segment decoder/driver (OC, low voltage) (16-pin)',
    pins: 16,
    guideOverview: 'The 74x347 is a BCD-to-7-segment decoder/driver, functionally identical to the 7447 but rated for lower supply voltages. Open-collector outputs drive common-anode LED or incandescent displays. Supports lamp test (LT), ripple-blanking input (RBI), and blanking/ripple-blanking output (BI/RBO).',
    guidePinDescriptions: {
      'B':    'BCD input bit 1 (2s place).',
      'C':    'BCD input bit 2 (4s place).',
      'LT':   'Lamp Test (active LOW). Pull LOW to force all segments ON to test the display.',
      'BI_n': 'Blanking Input / Ripple-Blanking Output (active LOW). Pull LOW to blank all segments.',
      'RBI':  'Ripple-Blanking Input (active LOW). Pull LOW to blank leading zeros.',
      'D':    'BCD input bit 3 (8s place).',
      'A':    'BCD input bit 0 (1s place, LSB).',
      'GND':  'Ground reference (pin 8).',
      'e':    'Segment e output (open-collector, active LOW).',
      'd':    'Segment d output (open-collector, active LOW).',
      'c':    'Segment c output (open-collector, active LOW).',
      'b':    'Segment b output (open-collector, active LOW).',
      'a':    'Segment a output (open-collector, active LOW).',
      'g':    'Segment g output (open-collector, active LOW).',
      'f':    'Segment f output (open-collector, active LOW)',
      'VCC':  'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: '7-Segment Decoding',
        paragraphs: [
          'The 74x347 decodes BCD (0-9) to the seven segments of a common-anode display. Segments a-g are driven LOW (OC) to illuminate. Input values 10-15 produce defined non-numeric patterns.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'B',     type:'input'  },
      { pin:2,  name:'C',     type:'input'  },
      { pin:3,  name:'LT',    type:'input'  },
      { pin:4,  name:'BI_n',  type:'input'  },
      { pin:5,  name:'RBI',   type:'input'  },
      { pin:6,  name:'D',     type:'input'  },
      { pin:7,  name:'A',     type:'input'  },
      { pin:8,  name:'GND',   type:'power'  },
      { pin:9,  name:'e',     type:'output' },
      { pin:10, name:'d',     type:'output' },
      { pin:11, name:'c',     type:'output' },
      { pin:12, name:'b',     type:'output' },
      { pin:13, name:'a',     type:'output' },
      { pin:14, name:'g',     type:'output' },
      { pin:15, name:'f',     type:'output' },
      { pin:16, name:'VCC',   type:'power'  }
    ],
    gates: [{
      type: 'BCD_7SEG',
      inputs:  ['A','B','C','D'],
      outputs: ['a','b','c','d','e','f','g']
    }]
  },

  // ── 74348 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Priority_encoder
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8-to-3 priority encoder, tri-state.
  // Like 74148 but with tri-state outputs controlled by OEn.
  // Inputs I0-I7 active low, A0-A2 active low encoded output.
  // EO: enable output (active low, for cascading). GS: group select (active low).
  '74348': {
    name: '74x348',
    description: '8-to-3 priority encoder, tri-state (16-pin)',
    pins: 16,
    guideOverview: 'The 74x348 is an 8-input to 3 bit priority encoder with 3-state outputs. When multiple active LOW inputs are asserted simultaneously, only the highest-priority (highest-numbered) is encoded. EIn enables the chip; EO cascades to the next chip; GS indicates at least one input is active. Outputs A0n-A2n are active LOW encoded binary.',
    guidePinDescriptions: {
      'I4':  'Data input 4 (active LOW).',
      'I5':  'Data input 5 (active LOW).',
      'I6':  'Data input 6 (active LOW).',
      'I7':  'Data input 7 highest priority (active LOW).',
      'EIn': 'Enable Input (active LOW). Pull LOW to enable.',
      'A2n': 'Encoded output bit 2, MSB (active LOW, tri-state).',
      'A1n': 'Encoded output bit 1 (active LOW, tri-state).',
      'GND': 'Ground reference (pin 8).',
      'A0n': 'Encoded output bit 0, LSB (active LOW, tri-state).',
      'GS':  'Group Select output (active LOW). Goes LOW when any input is active.',
      'EO':  'Enable Output (active LOW). Connect to EIn of lower-priority chip for cascading.',
      'I3':  'Data input 3 (active LOW).',
      'I2':  'Data input 2 (active LOW).',
      'I1':  'Data input 1 (active LOW).',
      'I0':  'Data input 0 lowest priority (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Priority Encoding',
        paragraphs: [
          'A priority encoder resolves contention when multiple interrupt or request lines are active simultaneously. Only the highest-active input number is encoded onto A0-A2. Cascade multiple 74x348s via EO→EIn to handle more than 8 inputs.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'I4',  type:'input'  },
      { pin:2,  name:'I5',  type:'input'  },
      { pin:3,  name:'I6',  type:'input'  },
      { pin:4,  name:'I7',  type:'input'  },
      { pin:5,  name:'EIn', type:'input'  },
      { pin:6,  name:'A2n', type:'output' },
      { pin:7,  name:'A1n', type:'output' },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'A0n', type:'output' },
      { pin:10, name:'GS',  type:'output' },
      { pin:11, name:'EO',  type:'output' },
      { pin:12, name:'I3',  type:'input'  },
      { pin:13, name:'I2',  type:'input'  },
      { pin:14, name:'I1',  type:'input'  },
      { pin:15, name:'I0',  type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'PRIORITY_ENC_8TO3_TRI',
      inputs:  ['I0','I1','I2','I3','I4','I5','I6','I7','EIn'],
      outputs: ['A0n','A1n','A2n','GS','EO']
    }]
  },

  // ── 74350 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 4 bit shifter with tri-state outputs.
  // S0,S1: select shift amount (0-3 bits).
  // DIR: 0=right-shift, 1=left-shift.
  // OEn: output enable (active low).
  // D0-D3: data inputs.
  '74350': {
    name: '74x350',
    description: '4 bit shifter, tri-state (16-pin)',
    pins: 16,
    guideOverview: 'The 74x350 is a 4 bit barrel shifter with tri-state outputs. S0-S1 select the shift amount (0-3 bits); DIR selects shift direction (0=right, 1=left). It produces the shifted result combinationally no clock required. OEn disables the outputs.',
    guidePinDescriptions: {
      'S0':  'Shift amount select bit 0 (LSB). S1:S0 = 00→shift 0, 01→shift 1, 10→shift 2, 11→shift 3.',
      'S1':  'Shift amount select bit 1 (MSB).',
      'DIR': 'Direction: LOW = right-shift, HIGH = left-shift.',
      'D0':  'Data input bit 0.',
      'D1':  'Data input bit 1.',
      'D2':  'Data input bit 2.',
      'D3':  'Data input bit 3.',
      'GND': 'Ground reference (pin 8).',
      'OEn': 'Output Enable (active LOW). When HIGH, Y0-Y3 are tri-stated.',
      'Y3':  'Shifted output bit 3.',
      'Y2':  'Shifted output bit 2.',
      'Y1':  'Shifted output bit 1.',
      'Y0':  'Shifted output bit 0.',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Barrel Shifter',
        paragraphs: [
          'A barrel shifter moves data bits by an arbitrary amount in a single gate delay, unlike shift registers which need N clocks for N bits. The 74x350 shifts a 4 bit word by 0-3 positions in one combinational step.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'S0',  type:'input'  },
      { pin:2,  name:'S1',  type:'input'  },
      { pin:3,  name:'DIR', type:'input'  },
      { pin:4,  name:'D0',  type:'input'  },
      { pin:5,  name:'D1',  type:'input'  },
      { pin:6,  name:'D2',  type:'input'  },
      { pin:7,  name:'D3',  type:'input'  },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'OEn', type:'input'  },
      { pin:10, name:'Y3',  type:'output' },
      { pin:11, name:'Y2',  type:'output' },
      { pin:12, name:'Y1',  type:'output' },
      { pin:13, name:'Y0',  type:'output' },
      { pin:14, name:'NC',  type:'input'  },
      { pin:15, name:'NC2', type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'SHIFTER_4BIT_TRI',
      inputs:  ['S0','S1','DIR','D0','D1','D2','D3','OEn'],
      outputs: ['Y0','Y1','Y2','Y3']
    }]
  },

  // ── 74351 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Dual 8→1 mux with 4 common data inputs, tri-state.
  // S0,S1,S2: select from 8 inputs (common). Two independent sections (1G/2G).
  // D0-D3: common data inputs; D4-D7 accessed via same routing on each section.
  // For simplicity: each section has its own G (enable active low) & selects common data.
  '74351': {
    name: '74x351',
    description: 'dual 8-to-1 data selector/multiplexer, 4 common inputs, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x351 contains two independent 8-to-1 multiplexers that share the same 8 data inputs (D0-D7) and 3 select lines (S0-S2). Each section has its own enable (1Gn/2Gn) and provides true and complementary outputs. Sharing inputs saves I/O pins compared to two separate 74x151s.',
    guidePinDescriptions: {
      'D0':  'Shared data input 0.',
      'D1':  'Shared data input 1.',
      'D2':  'Shared data input 2.',
      'D3':  'Shared data input 3.',
      'D4':  'Shared data input 4.',
      'D5':  'Shared data input 5.',
      'D6':  'Shared data input 6.',
      'D7':  'Shared data input 7.',
      'S0':  'Select bit 0 (shared by both sections).',
      'GND': 'Ground reference (pin 10).',
      'S1':  'Select bit 1.',
      'S2':  'Select bit 2 (MSB).',
      '1Gn': 'Enable section 1 (active LOW). When HIGH, 1W and 1Wn are tri-stated.',
      '1W':  'MUX output of section 1 (selected input, true).',
      '1Wn': 'MUX output of section 1 (selected input, complemented).',
      '2Gn': 'Enable section 2 (active LOW).',
      '2W':  'MUX output of section 2 (selected input, true).',
      '2Wn': 'MUX output of section 2 (selected input, complemented)',
      'NC':  'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Dual MUX with Common Inputs',
        paragraphs: [
          'When both sections select the same address, they observe the same data but can enable/disable their outputs independently. This is useful in bus systems where two different output nodes need to be driven from the same data word.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'D0',  type:'input'  },
      { pin:2,  name:'D1',  type:'input'  },
      { pin:3,  name:'D2',  type:'input'  },
      { pin:4,  name:'D3',  type:'input'  },
      { pin:5,  name:'D4',  type:'input'  },
      { pin:6,  name:'D5',  type:'input'  },
      { pin:7,  name:'D6',  type:'input'  },
      { pin:8,  name:'D7',  type:'input'  },
      { pin:9,  name:'S0',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'S1',  type:'input'  },
      { pin:12, name:'S2',  type:'input'  },
      { pin:13, name:'1Gn', type:'input'  },
      { pin:14, name:'1W',  type:'output' },
      { pin:15, name:'1Wn', type:'output' },
      { pin:16, name:'2Gn', type:'input'  },
      { pin:17, name:'2W',  type:'output' },
      { pin:18, name:'2Wn', type:'output' },
      { pin:19, name:'NC',  type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [
      {
        type: 'MUX_8TO1_COMPL_TRI',
        inputs:  ['D0','D1','D2','D3','D4','D5','D6','D7','S0','S1','S2','1Gn'],
        outputs: ['1W','1Wn']
      },
      {
        type: 'MUX_8TO1_COMPL_TRI',
        inputs:  ['D0','D1','D2','D3','D4','D5','D6','D7','S0','S1','S2','2Gn'],
        outputs: ['2W','2Wn']
      }
    ]
  },

  // ── 74352 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer */
  // Dual 4→1 mux, inverting outputs.
  // S0,S1: common select inputs. Each section has its own G (enable active low).
  '74352': {
    name: '74x352',
    description: 'dual 4-to-1 data selector/multiplexer, inverting (16-pin)',
    pins: 16,
    guideOverview: 'The 74x352 contains two independent 4-to-1 multiplexers with inverting outputs and a common pair of select lines (A, B). Each section has its own active LOW enable (1Gn, 2Gn). The output is the complement of the selected input, useful when downstream logic requires active LOW data.',
    guidePinDescriptions: {
      '1Gn': 'Enable section 1 (active LOW). When HIGH, 1Y is forced HIGH.',
      'B':   'Select bit 1 (MSB, shared).',
      '1C3': 'Data input 3 of section 1. Selected when A=1, B=1.',
      '1C2': 'Data input 2 of section 1. Selected when A=0, B=1.',
      '1C1': 'Data input 1 of section 1. Selected when A=1, B=0.',
      '1C0': 'Data input 0 of section 1. Selected when A=0, B=0.',
      '1Y':  'Inverted output of section 1.',
      'GND': 'Ground reference (pin 8).',
      '2Y':  'Inverted output of section 2.',
      '2C0': 'Data input 0 of section 2.',
      '2C1': 'Data input 1 of section 2.',
      '2C2': 'Data input 2 of section 2.',
      '2C3': 'Data input 3 of section 2.',
      'A':   'Select bit 0 (LSB, shared).',
      '2Gn': 'Enable section 2 (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Inverting Dual 4-to-1 MUX',
        paragraphs: [
          'The inverted output means 1Y = NOT(selected Cx). Compare to the 74x153 which has true outputs. Use the 74x352 when the next stage requires active LOW logic or when you want a NAND-based function with address-selected data.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'1Gn', type:'input'  },
      { pin:2,  name:'B',   type:'input'  },
      { pin:3,  name:'1C3', type:'input'  },
      { pin:4,  name:'1C2', type:'input'  },
      { pin:5,  name:'1C1', type:'input'  },
      { pin:6,  name:'1C0', type:'input'  },
      { pin:7,  name:'1Y',  type:'output' },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'2Y',  type:'output' },
      { pin:10, name:'2C0', type:'input'  },
      { pin:11, name:'2C1', type:'input'  },
      { pin:12, name:'2C2', type:'input'  },
      { pin:13, name:'2C3', type:'input'  },
      { pin:14, name:'A',   type:'input'  },
      { pin:15, name:'2Gn', type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [
      {
        type: 'MUX_4TO1_INV',
        inputs:  ['1C0','1C1','1C2','1C3','A','B','1Gn'],
        output:  '1Y'
      },
      {
        type: 'MUX_4TO1_INV',
        inputs:  ['2C0','2C1','2C2','2C3','A','B','2Gn'],
        output:  '2Y'
      }
    ]
  },

  // ── 74353 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Dual 4→1 mux, inverting, tri-state.
  '74353': {
    name: '74x353',
    description: 'dual 4-to-1 data selector/multiplexer, inverting, tri-state (16-pin)',
    pins: 16,
    guideOverview: 'The 74x353 is identical to the 74x352 (dual 4-to-1 inverting MUX with common select) but with tri-state outputs instead of always-driven. When Gn is HIGH the output floats, allowing multiple 74x353s to share a bus.',
    guidePinDescriptions: {
      '1Gn': 'Enable section 1 (active LOW). When HIGH, 1Y is tri-stated.',
      'B':   'Select bit 1 (MSB, shared).',
      '1C3': 'Data input 3 of section 1.',
      '1C2': 'Data input 2 of section 1.',
      '1C1': 'Data input 1 of section 1.',
      '1C0': 'Data input 0 of section 1.',
      '1Y':  'Inverted tri-state output of section 1.',
      'GND': 'Ground reference (pin 8).',
      '2Y':  'Inverted tri-state output of section 2.',
      '2C0': 'Data input 0 of section 2.',
      '2C1': 'Data input 1 of section 2.',
      '2C2': 'Data input 2 of section 2.',
      '2C3': 'Data input 3 of section 2.',
      'A':   'Select bit 0 (LSB, shared).',
      '2Gn': 'Enable section 2 (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Tri-State vs Standard Enable',
        paragraphs: [
          'The tri-state enable lets the 74x353 drive a shared data bus. When disabled, the output is high-impedance. Use the 74x352 when only one device drives the line; use the 74x353 when multiple devices share the same wire.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'1Gn', type:'input'  },
      { pin:2,  name:'B',   type:'input'  },
      { pin:3,  name:'1C3', type:'input'  },
      { pin:4,  name:'1C2', type:'input'  },
      { pin:5,  name:'1C1', type:'input'  },
      { pin:6,  name:'1C0', type:'input'  },
      { pin:7,  name:'1Y',  type:'output' },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'2Y',  type:'output' },
      { pin:10, name:'2C0', type:'input'  },
      { pin:11, name:'2C1', type:'input'  },
      { pin:12, name:'2C2', type:'input'  },
      { pin:13, name:'2C3', type:'input'  },
      { pin:14, name:'A',   type:'input'  },
      { pin:15, name:'2Gn', type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [
      {
        type: 'MUX_4TO1_TRI_INV',
        inputs:  ['1C0','1C1','1C2','1C3','A','B','1Gn'],
        output:  '1Y'
      },
      {
        type: 'MUX_4TO1_TRI_INV',
        inputs:  ['2C0','2C1','2C2','2C3','A','B','2Gn'],
        output:  '2Y'
      }
    ]
  },

  // ── 74354 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8→1 mux with transparent (latch) output register, tri-state.
  // LE: latch enable (1=transparent/active latch, 0=hold).
  // SEL=S0,S1,S2; OEn: output enable.
  '74354': {
    name: '74x354',
    description: '8-to-1 data selector/multiplexer with transparent latch, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x354 combines an 8-to-1 multiplexer with a transparent D-latch on the output. When LE is HIGH (latch transparent), the output follows the selected input. When LE goes LOW, the last value is held. OEn controls the tri-state outputs. This is useful for sample-and-hold applications or reducing glitches during select-line changes.',
    guidePinDescriptions: {
      'I0':  'Data input 0.',
      'I1':  'Data input 1.',
      'I2':  'Data input 2.',
      'I3':  'Data input 3.',
      'I4':  'Data input 4.',
      'I5':  'Data input 5.',
      'I6':  'Data input 6.',
      'I7':  'Data input 7.',
      'S0':  'Select bit 0.',
      'GND': 'Ground reference (pin 10).',
      'S1':  'Select bit 1.',
      'S2':  'Select bit 2 (MSB).',
      'LE':  'Latch Enable. HIGH = transparent; LOW = hold last value.',
      'OEn': 'Output Enable (active LOW). When HIGH, W and Wn are tri-stated.',
      'W':   'MUX output (true, tri-state).',
      'Wn':  'MUX output (complemented, tri-state).',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'NC3': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'MUX with Output Latch',
        paragraphs: [
          'The output latch prevents glitches when the select address changes. Pull LE LOW while changing S0-S2; the output holds the old value. Raise LE after S0-S2 settle to update the output cleanly.',
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
      { pin:7,  name:'I6',  type:'input'  },
      { pin:8,  name:'I7',  type:'input'  },
      { pin:9,  name:'S0',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'S1',  type:'input'  },
      { pin:12, name:'S2',  type:'input'  },
      { pin:13, name:'LE',  type:'input'  },
      { pin:14, name:'OEn', type:'input'  },
      { pin:15, name:'W',   type:'output' },
      { pin:16, name:'Wn',  type:'output' },
      { pin:17, name:'NC',  type:'input'  },
      { pin:18, name:'NC2', type:'input'  },
      { pin:19, name:'NC3', type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'MUX_8TO1_LATCH_TRI',
      inputs:  ['I0','I1','I2','I3','I4','I5','I6','I7','S0','S1','S2','LE','OEn'],
      outputs: ['W','Wn']
    }]
  },

  // ── 74355 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  // 8→1 mux with transparent latch, OC.
  '74355': {
    name: '74x355',
    description: '8-to-1 data selector/multiplexer with transparent latch, OC (20-pin)',
    pins: 20,
    guideOverview: 'The 74x355 is identical to the 74x354 (8-to-1 MUX with transparent latch) but with open-collector outputs. Add external pull up resistors on W and Wn. Suitable for wired AND bus connections.',
    guidePinDescriptions: {
      'I0':  'Data input 0.',
      'I1':  'Data input 1.',
      'I2':  'Data input 2.',
      'I3':  'Data input 3.',
      'I4':  'Data input 4.',
      'I5':  'Data input 5.',
      'I6':  'Data input 6.',
      'I7':  'Data input 7.',
      'S0':  'Select bit 0.',
      'GND': 'Ground reference (pin 10).',
      'S1':  'Select bit 1.',
      'S2':  'Select bit 2 (MSB).',
      'LE':  'Latch Enable. HIGH = transparent; LOW = hold.',
      'OEn': 'Output Enable (active LOW).',
      'W':   'MUX output, true (open-collector).',
      'Wn':  'MUX output, complemented (open-collector).',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'NC3': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'OC vs Tri-State MUX Latch',
        paragraphs: [
          'Use the 74x355 when multiple MUX chips share a single wire (wired AND). Use 74x354 for standard tri-state bus driving. Both require pull up or bus-termination resistors for clean signal levels.',
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
      { pin:7,  name:'I6',  type:'input'  },
      { pin:8,  name:'I7',  type:'input'  },
      { pin:9,  name:'S0',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'S1',  type:'input'  },
      { pin:12, name:'S2',  type:'input'  },
      { pin:13, name:'LE',  type:'input'  },
      { pin:14, name:'OEn', type:'input'  },
      { pin:15, name:'W',   type:'output' },
      { pin:16, name:'Wn',  type:'output' },
      { pin:17, name:'NC',  type:'input'  },
      { pin:18, name:'NC2', type:'input'  },
      { pin:19, name:'NC3', type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'MUX_8TO1_LATCH_TRI',
      inputs:  ['I0','I1','I2','I3','I4','I5','I6','I7','S0','S1','S2','LE','OEn'],
      outputs: ['W','Wn']
    }]
  },

  // ── 74356 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8→1 mux with edge-triggered register, tri-state.
  // CLK: captures selected I on rising edge. OEn: output enable.
  '74356': {
    name: '74x356',
    description: '8-to-1 data selector/multiplexer with edge-triggered register, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x356 combines an 8-to-1 multiplexer with an edge-triggered D flip-flop on the output. Unlike the transparent latch in the 74x354, the output captures the selected input only on the rising clock edge. This eliminates glitches and provides a clean registered output.',
    guidePinDescriptions: {
      'I0':  'Data input 0.',
      'I1':  'Data input 1.',
      'I2':  'Data input 2.',
      'I3':  'Data input 3.',
      'I4':  'Data input 4.',
      'I5':  'Data input 5.',
      'I6':  'Data input 6.',
      'I7':  'Data input 7.',
      'S0':  'Select bit 0.',
      'GND': 'Ground reference (pin 10).',
      'S1':  'Select bit 1.',
      'S2':  'Select bit 2 (MSB).',
      'CLK': 'Clock. Rising edge captures the selected input into the register.',
      'OEn': 'Output Enable (active LOW).',
      'W':   'Registered MUX output (true, tri-state).',
      'Wn':  'Registered MUX output (complemented, tri-state).',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'NC3': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Registered vs Latched MUX Output',
        paragraphs: [
          'The edge-triggered register (74x356) guarantees the output changes only at clock edges, regardless of select-line changes. The transparent latch (74x354) responds immediately when LE=HIGH. Use the 74x356 in synchronous systems where output timing must match the system clock.',
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
      { pin:7,  name:'I6',  type:'input'  },
      { pin:8,  name:'I7',  type:'input'  },
      { pin:9,  name:'S0',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'S1',  type:'input'  },
      { pin:12, name:'S2',  type:'input'  },
      { pin:13, name:'CLK', type:'input'  },
      { pin:14, name:'OEn', type:'input'  },
      { pin:15, name:'W',   type:'output' },
      { pin:16, name:'Wn',  type:'output' },
      { pin:17, name:'NC',  type:'input'  },
      { pin:18, name:'NC2', type:'input'  },
      { pin:19, name:'NC3', type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'MUX_8TO1_REG_TRI',
      inputs:  ['I0','I1','I2','I3','I4','I5','I6','I7','S0','S1','S2','CLK','OEn'],
      outputs: ['W','Wn']
    }]
  },

  // ── 74357 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Multiplexer
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  // 8→1 mux with edge-triggered register, OC.
  '74357': {
    name: '74x357',
    description: '8-to-1 data selector/multiplexer with edge-triggered register, OC (20-pin)',
    pins: 20,
    guideOverview: 'The 74x357 is the open-collector version of the 74x356 (8-to-1 MUX with edge-triggered register). Add external pull up resistors on W and Wn for proper output levels.',
    guidePinDescriptions: {
      'I0':  'Data input 0.',
      'I1':  'Data input 1.',
      'I2':  'Data input 2.',
      'I3':  'Data input 3.',
      'I4':  'Data input 4.',
      'I5':  'Data input 5.',
      'I6':  'Data input 6.',
      'I7':  'Data input 7.',
      'S0':  'Select bit 0.',
      'GND': 'Ground reference (pin 10).',
      'S1':  'Select bit 1.',
      'S2':  'Select bit 2 (MSB).',
      'CLK': 'Clock. Rising edge captures selected input.',
      'OEn': 'Output Enable (active LOW).',
      'W':   'Registered MUX output, true (open-collector).',
      'Wn':  'Registered MUX output, complemented (open-collector).',
      'NC':  'Not connected.',
      'NC2': 'Not connected.',
      'NC3': 'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Open Collector Registered MUX',
        paragraphs: [
          'Functionally identical to 74x356. Outputs are open-collector; add pull up resistors. See the 74x356 guide for detailed timing explanation.',
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
      { pin:7,  name:'I6',  type:'input'  },
      { pin:8,  name:'I7',  type:'input'  },
      { pin:9,  name:'S0',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'S1',  type:'input'  },
      { pin:12, name:'S2',  type:'input'  },
      { pin:13, name:'CLK', type:'input'  },
      { pin:14, name:'OEn', type:'input'  },
      { pin:15, name:'W',   type:'output' },
      { pin:16, name:'Wn',  type:'output' },
      { pin:17, name:'NC',  type:'input'  },
      { pin:18, name:'NC2', type:'input'  },
      { pin:19, name:'NC3', type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'MUX_8TO1_REG_TRI',
      inputs:  ['I0','I1','I2','I3','I4','I5','I6','I7','S0','S1','S2','CLK','OEn'],
      outputs: ['W','Wn']
    }]
  },


  // ── 74362 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Four-phase clock gen/driver for TMS9900. Stub.
  '74362': {
    name: '74x362',
    description: 'four-phase clock generator/driver for TMS9900 (20-pin)',
    pins: 20,
    guideOverview: 'The 74x362 is a four-phase clock generator and driver designed specifically for the TMS9900 16 bit microprocessor. It converts a single clock input into four non-overlapping phase signals (Ph1-Ph4). HOLD and IDLE inputs gate the clock for bus hold and idle states.',
    guidePinDescriptions: {
      'CLK':  'Master clock input.',
      'RST':  'Reset input. Initializes the phase sequence.',
      'HOLD': 'Hold input. Suspends clock phases for bus hold operations.',
      'IDLE': 'Idle input. Stops clock generation during idle states.',
      'Ph1':  'Phase 1 output.',
      'Ph2':  'Phase 2 output.',
      'Ph3':  'Phase 3 output.',
      'Ph4':  'Phase 4 output.',
      'NC':   'Not connected.',
      'GND':  'Ground reference (pin 10).',
      'NC2':  'Not connected.',
      'NC3':  'Not connected.',
      'NC4':  'Not connected.',
      'NC5':  'Not connected.',
      'NC6':  'Not connected.',
      'NC7':  'Not connected.',
      'NC8':  'Not connected.',
      'NC9':  'Not connected.',
      'NC10': 'Not connected.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'TMS9900 Clock System',
        paragraphs: [
          'The TMS9900 requires four non-overlapping clock phases for its pipeline timing. The 74x362 handles this generation so the CPU sees clean, properly-phased clock signals. RST initializes the phase counter to a known state at power-up.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'CLK',  type:'input'  },
      { pin:2,  name:'RST',  type:'input'  },
      { pin:3,  name:'HOLD', type:'input'  },
      { pin:4,  name:'IDLE', type:'input'  },
      { pin:5,  name:'Ph1',  type:'output' },
      { pin:6,  name:'Ph2',  type:'output' },
      { pin:7,  name:'Ph3',  type:'output' },
      { pin:8,  name:'Ph4',  type:'output' },
      { pin:9,  name:'NC',   type:'input'  },
      { pin:10, name:'GND',  type:'power'  },
      { pin:11, name:'NC2',  type:'input'  },
      { pin:12, name:'NC3',  type:'input'  },
      { pin:13, name:'NC4',  type:'input'  },
      { pin:14, name:'NC5',  type:'input'  },
      { pin:15, name:'NC6',  type:'input'  },
      { pin:16, name:'NC7',  type:'input'  },
      { pin:17, name:'NC8',  type:'input'  },
      { pin:18, name:'NC9',  type:'input'  },
      { pin:19, name:'NC10', type:'input'  },
      { pin:20, name:'VCC',  type:'power'  }
    ],
    gates: [{
      type: 'CLK_4PHASE_GEN',
      inputs:  ['CLK','RST','HOLD','IDLE'],
      outputs: ['Ph1','Ph2','Ph3','Ph4']
    }]
  },

  // ── 74363 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Octal transparent latch, tri-state.
  // Same function as 74373. LE: latch enable; OEn: output enable.
  '74363': {
    name: '74x363',
    description: 'octal transparent latch, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x363 is an 8 bit transparent D-latch with tri-state outputs, equivalent to the 74x373. When LE (Latch Enable) is HIGH, outputs follow inputs. When LE goes LOW, outputs are frozen. OEn controls the tri-state outputs independently.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW). When HIGH, all Q outputs are tri-stated.',
      'D1':  'Data input 1.',
      'Q1':  'Latch output 1.',
      'D2':  'Data input 2.',
      'Q2':  'Latch output 2.',
      'D3':  'Data input 3.',
      'Q3':  'Latch output 3.',
      'D4':  'Data input 4.',
      'Q4':  'Latch output 4.',
      'GND': 'Ground reference (pin 10).',
      'LE':  'Latch Enable. HIGH = transparent (Q follows D); LOW = latch (Q holds).',
      'Q5':  'Latch output 5.',
      'D5':  'Data input 5.',
      'Q6':  'Latch output 6.',
      'D6':  'Data input 6.',
      'Q7':  'Latch output 7.',
      'D7':  'Data input 7.',
      'Q8':  'Latch output 8.',
      'D8':  'Data input 8.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Transparent Latch',
        paragraphs: [
          'With LE HIGH the latch is transparent output follows input with propagation delay only. Pulling LE LOW freezes the output. This is useful for address demultiplexing on address/data buses where the address must be captured before data appears.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'OEn', type:'input'  },
      { pin:2,  name:'D1',  type:'input'  },
      { pin:3,  name:'Q1',  type:'output' },
      { pin:4,  name:'D2',  type:'input'  },
      { pin:5,  name:'Q2',  type:'output' },
      { pin:6,  name:'D3',  type:'input'  },
      { pin:7,  name:'Q3',  type:'output' },
      { pin:8,  name:'D4',  type:'input'  },
      { pin:9,  name:'Q4',  type:'output' },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'LE',  type:'input'  },
      { pin:12, name:'Q5',  type:'output' },
      { pin:13, name:'D5',  type:'input'  },
      { pin:14, name:'Q6',  type:'output' },
      { pin:15, name:'D6',  type:'input'  },
      { pin:16, name:'Q7',  type:'output' },
      { pin:17, name:'D7',  type:'input'  },
      { pin:18, name:'Q8',  type:'output' },
      { pin:19, name:'D8',  type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'D_LATCH_OCTAL_TRI',
      inputs:  ['D1','D2','D3','D4','D5','D6','D7','D8','OEn','LE'],
      outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8']
    }]
  },

  // ── 74364 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Octal edge-triggered D-type register, tri-state.
  // Same function as 74374. CLK: rising edge capture; OEn: output enable.
  '74364': {
    name: '74x364',
    description: 'octal edge-triggered D-type register, tri-state (20-pin)',
    pins: 20,
    guideOverview: 'The 74x364 is an 8 bit edge-triggered D-type register with tri-state outputs, functionally equivalent to the 74x374. All eight flip-flops share a common clock (CLK). Data is captured on the rising edge. OEn controls the 3-state outputs.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW). When HIGH, all Q outputs are tri-stated.',
      'D1':  'Data input 1.',
      'Q1':  'Registered output 1.',
      'D2':  'Data input 2.',
      'Q2':  'Registered output 2.',
      'D3':  'Data input 3.',
      'Q3':  'Registered output 3.',
      'D4':  'Data input 4.',
      'Q4':  'Registered output 4.',
      'GND': 'Ground reference (pin 10).',
      'CLK': 'Clock. Captures all D inputs on rising edge.',
      'Q5':  'Registered output 5.',
      'D5':  'Data input 5.',
      'Q6':  'Registered output 6.',
      'D6':  'Data input 6.',
      'Q7':  'Registered output 7.',
      'D7':  'Data input 7.',
      'Q8':  'Registered output 8.',
      'D8':  'Data input 8.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Latch vs Register',
        paragraphs: [
          'The 74x363 is a latch (level-sensitive); the 74x364 is a register (edge-triggered). Use the register in synchronous systems for predictable timing. Use the latch in address-bus demultiplexing where a level signal controls the capture window.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'OEn', type:'input'  },
      { pin:2,  name:'D1',  type:'input'  },
      { pin:3,  name:'Q1',  type:'output' },
      { pin:4,  name:'D2',  type:'input'  },
      { pin:5,  name:'Q2',  type:'output' },
      { pin:6,  name:'D3',  type:'input'  },
      { pin:7,  name:'Q3',  type:'output' },
      { pin:8,  name:'D4',  type:'input'  },
      { pin:9,  name:'Q4',  type:'output' },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'CLK', type:'input'  },
      { pin:12, name:'Q5',  type:'output' },
      { pin:13, name:'D5',  type:'input'  },
      { pin:14, name:'Q6',  type:'output' },
      { pin:15, name:'D6',  type:'input'  },
      { pin:16, name:'Q7',  type:'output' },
      { pin:17, name:'D7',  type:'input'  },
      { pin:18, name:'Q8',  type:'output' },
      { pin:19, name:'D8',  type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'D_FF_OCTAL_TRI',
      inputs:  ['D1','D2','D3','D4','D5','D6','D7','D8','OEn','CLK'],
      outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8']
    }]
  },

  // ── 74365 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Hex buffer, non-inverting, tri-state.
  // G1n, G2n: enable (active low, both must be 0 to output).
  '74365': {
    name: '74x365',
    description: 'hex buffer, non-inverting, tri-state (16-pin)',
    pins: 16,
    guideOverview: 'The 74x365 is a 6-channel non-inverting buffer with tri-state outputs. Both enable pins (G1n AND G2n) must be LOW for any output to be active. Either HIGH disables all six outputs. Used for bus driving, level restoration, and isolation.',
    guidePinDescriptions: {
      'G1n': 'Enable 1 (active LOW). Both G1n and G2n must be LOW to enable outputs.',
      'A1':  'Input 1.',
      'Y1':  'Non-inverting output 1.',
      'A2':  'Input 2.',
      'Y2':  'Non-inverting output 2.',
      'A3':  'Input 3.',
      'Y3':  'Non-inverting output 3.',
      'GND': 'Ground reference (pin 8).',
      'Y4':  'Non-inverting output 4.',
      'A4':  'Input 4.',
      'Y5':  'Non-inverting output 5.',
      'A5':  'Input 5.',
      'Y6':  'Non-inverting output 6.',
      'A6':  'Input 6.',
      'G2n': 'Enable 2 (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Dual-Enable Hex Buffer',
        paragraphs: [
          'The two enable pins allow the 74x365 to be controlled by both a chip select and a direction signal simultaneously. This is common in bidirectional bus transceiver designs.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'G1n', type:'input'  },
      { pin:2,  name:'A1',  type:'input'  },
      { pin:3,  name:'Y1',  type:'output' },
      { pin:4,  name:'A2',  type:'input'  },
      { pin:5,  name:'Y2',  type:'output' },
      { pin:6,  name:'A3',  type:'input'  },
      { pin:7,  name:'Y3',  type:'output' },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'Y4',  type:'output' },
      { pin:10, name:'A4',  type:'input'  },
      { pin:11, name:'Y5',  type:'output' },
      { pin:12, name:'A5',  type:'input'  },
      { pin:13, name:'Y6',  type:'output' },
      { pin:14, name:'A6',  type:'input'  },
      { pin:15, name:'G2n', type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'BUFFER_HEX_TRI',
      inputs:  ['A1','A2','A3','A4','A5','A6','G1n','G2n'],
      outputs: ['Y1','Y2','Y3','Y4','Y5','Y6']
    }]
  },

  // ── 74366 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Hex buffer, inverting, tri-state.
  '74366': {
    name: '74x366',
    description: 'hex buffer, inverting, tri-state (16-pin)',
    pins: 16,
    guideOverview: 'The 74x366 is a 6-channel inverting buffer with tri-state outputs. Identical to the 74x365 but outputs are inverted. Both G1n and G2n must be LOW to enable outputs.',
    guidePinDescriptions: {
      'G1n': 'Enable 1 (active LOW). Both enables must be LOW to activate outputs.',
      'A1':  'Input 1.',
      'Y1':  'Inverted output 1.',
      'A2':  'Input 2.',
      'Y2':  'Inverted output 2.',
      'A3':  'Input 3.',
      'Y3':  'Inverted output 3.',
      'GND': 'Ground reference (pin 8).',
      'Y4':  'Inverted output 4.',
      'A4':  'Input 4.',
      'Y5':  'Inverted output 5.',
      'A5':  'Input 5.',
      'Y6':  'Inverted output 6.',
      'A6':  'Input 6.',
      'G2n': 'Enable 2 (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Inverting Hex Buffer',
        paragraphs: [
          'Same dual-enable structure as 74x365, outputs inverted. Used where active LOW bus levels are needed or to implement bus isolation with inversion.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'G1n', type:'input'  },
      { pin:2,  name:'A1',  type:'input'  },
      { pin:3,  name:'Y1',  type:'output' },
      { pin:4,  name:'A2',  type:'input'  },
      { pin:5,  name:'Y2',  type:'output' },
      { pin:6,  name:'A3',  type:'input'  },
      { pin:7,  name:'Y3',  type:'output' },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'Y4',  type:'output' },
      { pin:10, name:'A4',  type:'input'  },
      { pin:11, name:'Y5',  type:'output' },
      { pin:12, name:'A5',  type:'input'  },
      { pin:13, name:'Y6',  type:'output' },
      { pin:14, name:'A6',  type:'input'  },
      { pin:15, name:'G2n', type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'BUFFER_HEX_INV_TRI',
      inputs:  ['A1','A2','A3','A4','A5','A6','G1n','G2n'],
      outputs: ['Y1','Y2','Y3','Y4','Y5','Y6']
    }]
  }

};
