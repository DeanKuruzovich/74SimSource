export const CHIPS_BLOCK_23 = {

  // ── 74367 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Hex buffer, non-inverting, tri-state. Same logic as 74365.
  // G1n (pins 1): enables A1-A3. G2n (pin 15): enables A4-A6.
  // Both enables together for all 6 buffers. For simplicity use single gate.
  '74367': {
    name: '74x367',
    description: 'hex buffer, non-inverting, tri-state (16-pin)',
    pins: 16,
    guideOverview: 'The 74x367 is a 6-channel non-inverting tri-state buffer with split enables. G1n controls A1-A3 (pins 1-7) and G2n controls A4-A6 (pins 9-15). Either enable pin being HIGH tri-states its group of three channels. Similar to the 74x365 but with independent half-enable groups.',
    guidePinDescriptions: {
      'G1n': 'Enable for channels 1-3 (active LOW). When HIGH, Y1-Y3 are tri-stated.',
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
      'G2n': 'Enable for channels 4-6 (active LOW). When HIGH, Y4-Y6 are tri-stated.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Split Enable vs Dual Enable',
        paragraphs: [
          'Unlike the 74x365 (both G1n and G2n must be LOW to enable all outputs), the 74x367 uses G1n and G2n to independently gate the lower and upper three channels. This allows a single chip to drive two separate 3 bit buses.',
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

  // ── 74368 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // Hex buffer, inverting, tri-state. Same logic as 74366.
  '74368': {
    name: '74x368',
    description: 'hex buffer, inverting, tri-state (16-pin)',
    pins: 16,
    guideOverview: 'The 74x368 is a 6-channel inverting tri-state buffer with split enables. G1n controls channels 1-3 and G2n controls channels 4-6. Inverted version of the 74x367.',
    guidePinDescriptions: {
      'G1n': 'Enable for channels 1-3 (active LOW). When HIGH, Y1-Y3 are tri-stated.',
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
      'G2n': 'Enable for channels 4-6 (active LOW).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Inverting Split-Enable Buffer',
        paragraphs: [
          'Inverted version of the 74x367. Use when the downstream logic requires active LOW signals or when polarity inversion is needed in the bus path.',
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
  },

  // ── 74375 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Quad bistable latch (4 D-latches with Q and Qn outputs).
  // Pins 1-2: C for latches 1&2. Pins 13: C for latches 3&4.
  // When C=1 (active HIGH): Q follows D. When C=0: Q holds.
  '74375': {
    name: '74x375',
    description: 'quad bistable latch (16-pin)',
    pins: 16,
    guideOverview: 'The 74x375 contains four D-latches, each with complementary Q and Qn outputs. Latches 1 and 2 share clock C12; latches 3 and 4 share C34. When a C input is HIGH (transparent), the latch output follows D. When C goes LOW, the output is held.',
    guidePinDescriptions: {
      '1D':  'Data input for latch 1.',
      'C12': 'Clock for latches 1 and 2. HIGH = transparent.',
      '2D':  'Data input for latch 2.',
      '2Q':  'Output Q of latch 2.',
      '2Qn': 'Complementary output of latch 2.',
      '3Qn': 'Complementary output of latch 3.',
      '3Q':  'Output Q of latch 3.',
      'GND': 'Ground reference (pin 8).',
      '3D':  'Data input for latch 3.',
      'C34': 'Clock for latches 3 and 4. HIGH = transparent.',
      '4D':  'Data input for latch 4.',
      '4Q':  'Output Q of latch 4.',
      '4Qn': 'Complementary output of latch 4.',
      '1Qn': 'Complementary output of latch 1.',
      '1Q':  'Output Q of latch 1.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Paired Latch Clocking',
        paragraphs: [
          'The paired clock structure (C12, C34) allows two independent groups of two latches to be controlled separately. This is useful in nibble-wide bus interfaces where two nibbles must be latched at different times.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'1D',  type:'input'  },
      { pin:2,  name:'C12', type:'input'  },
      { pin:3,  name:'2D',  type:'input'  },
      { pin:4,  name:'2Q',  type:'output' },
      { pin:5,  name:'2Qn', type:'output' },
      { pin:6,  name:'3Qn', type:'output' },
      { pin:7,  name:'3Q',  type:'output' },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'3D',  type:'input'  },
      { pin:10, name:'C34', type:'input'  },
      { pin:11, name:'4D',  type:'input'  },
      { pin:12, name:'4Q',  type:'output' },
      { pin:13, name:'4Qn', type:'output' },
      { pin:14, name:'1Qn', type:'output' },
      { pin:15, name:'1Q',  type:'output' },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'D_LATCH_QUAD_COMPL',
      inputs:  ['1D','2D','3D','4D','C12','C34'],
      outputs: ['1Q','1Qn','2Q','2Qn','3Q','3Qn','4Q','4Qn']
    }]
  },

  // ── 74376 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Quad J-NOT-K flip-flop, shared CLK and CLRn.
  // Each FF: J and K=~J internally. Rising CLK edge:
  //   J=1 → Q=1 (set). J=0 → Q=0 (reset). CLRn=0: async clear.
  '74376': {
    name: '74x376',
    description: 'quad J-NOT-K flip-flop, shared clock and clear (16-pin)',
    pins: 16,
    guideOverview: 'The 74x376 contains four J-NOT-K flip-flops sharing a common clock and common active LOW asynchronous clear (CLRn). J-NOT-K means K is always the complement of J. When J=1 the flip-flop is set; when J=0 it is reset on the rising clock edge. This simplifies single-control set/reset applications.',
    guidePinDescriptions: {
      '1J':  'J input for flip-flop 1. K is implicitly the complement of J.',
      '1Qn': 'Complementary output of flip-flop 1.',
      '1Q':  'Output Q of flip-flop 1.',
      '2J':  'J input for flip-flop 2.',
      '2Qn': 'Complementary output of flip-flop 2.',
      '2Q':  'Output Q of flip-flop 2.',
      'CLK': 'Common rising-edge clock for all four flip-flops.',
      'GND': 'Ground reference (pin 8).',
      'CLRn':'Asynchronous clear (active LOW). When LOW, all Q outputs go to 0 immediately.',
      '3Q':  'Output Q of flip-flop 3.',
      '3Qn': 'Complementary output of flip-flop 3.',
      '3J':  'J input for flip-flop 3.',
      '4Q':  'Output Q of flip-flop 4.',
      '4Qn': 'Complementary output of flip-flop 4.',
      '4J':  'J input for flip-flop 4.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'J-NOT-K Operation',
        paragraphs: [
          'A standard JK flip-flop toggles when J=K=1. The J-NOT-K eliminates the toggle state by tying K to NOT-J. The result is a D-like flip-flop: J=1 sets Q=1 and J=0 clears Q=0 on the rising edge, without any hold-previous-state mode.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'1J',  type:'input'  },
      { pin:2,  name:'1Qn', type:'output' },
      { pin:3,  name:'1Q',  type:'output' },
      { pin:4,  name:'2J',  type:'input'  },
      { pin:5,  name:'2Qn', type:'output' },
      { pin:6,  name:'2Q',  type:'output' },
      { pin:7,  name:'CLK', type:'input'  },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'CLRn',type:'input'  },
      { pin:10, name:'3Q',  type:'output' },
      { pin:11, name:'3Qn', type:'output' },
      { pin:12, name:'3J',  type:'input'  },
      { pin:13, name:'4Q',  type:'output' },
      { pin:14, name:'4Qn', type:'output' },
      { pin:15, name:'4J',  type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'JK_NOT_FF_QUAD',
      inputs:  ['1J','2J','3J','4J','CLK','CLRn'],
      outputs: ['1Q','1Qn','2Q','2Qn','3Q','3Qn','4Q','4Qn']
    }]
  },

  // ── 74377 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8 bit register with clock enable.
  // En (active LOW): when 0, data is clocked in on rising CLK edge.
  '74377': {
    name: '74x377',
    description: '8 bit register, clock enable (20-pin)',
    pins: 20,
    guideOverview: 'The 74x377 is an 8 bit D-type register with a clock enable (En, active LOW). When En is LOW, data on D1-D8 is clocked into the register on the rising edge of CLK. When En is HIGH, the register holds and ignores CLK. Unlike the 74x373/374, there are no tri-state outputs.',
    guidePinDescriptions: {
      'En':  'Clock Enable (active LOW). Pull LOW to allow clocking; HIGH freezes the register.',
      'Q1':  'Registered output 1.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'Q2':  'Registered output 2.',
      'Q3':  'Registered output 3.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'Q4':  'Registered output 4.',
      'GND': 'Ground reference (pin 10).',
      'CLK': 'Clock. Rising edge captures D1-D8 when En is LOW.',
      'Q5':  'Registered output 5.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'Q6':  'Registered output 6.',
      'Q7':  'Registered output 7.',
      'D7':  'Data input 7.',
      'D8':  'Data input 8.',
      'Q8':  'Registered output 8.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Register with Clock Enable',
        paragraphs: [
          'The clock enable allows the register to selectively update. This is useful in CPUs and controllers where a register bank must hold its value until an explicit write signal. Compare to the 74x374 (no clock enable, always clocks) and 74x373 (transparent latch).',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'En',  type:'input'  },
      { pin:2,  name:'Q1',  type:'output' },
      { pin:3,  name:'D1',  type:'input'  },
      { pin:4,  name:'D2',  type:'input'  },
      { pin:5,  name:'Q2',  type:'output' },
      { pin:6,  name:'Q3',  type:'output' },
      { pin:7,  name:'D3',  type:'input'  },
      { pin:8,  name:'D4',  type:'input'  },
      { pin:9,  name:'Q4',  type:'output' },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'CLK', type:'input'  },
      { pin:12, name:'Q5',  type:'output' },
      { pin:13, name:'D5',  type:'input'  },
      { pin:14, name:'D6',  type:'input'  },
      { pin:15, name:'Q6',  type:'output' },
      { pin:16, name:'Q7',  type:'output' },
      { pin:17, name:'D7',  type:'input'  },
      { pin:18, name:'D8',  type:'input'  },
      { pin:19, name:'Q8',  type:'output' },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'D_FF_OCTAL_CE',
      inputs:  ['D1','D2','D3','D4','D5','D6','D7','D8','CLK','En'],
      outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8']
    }]
  },

  // ── 74378 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // 6 bit register, clock enable.
  // En (active LOW): when 0, data is clocked in on rising CLK edge.
  '74378': {
    name: '74x378',
    description: '6 bit register, clock enable (16-pin)',
    pins: 16,
    guideOverview: 'The 74x378 is a 6 bit version of the 74x377 clock-enabled register, in a 16-pin package. En (active LOW) gates the clock to allow selective updating.',
    guidePinDescriptions: {
      'En':  'Clock Enable (active LOW). Pull LOW to allow clocking.',
      'Q1':  'Registered output 1.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'Q2':  'Registered output 2.',
      'Q3':  'Registered output 3.',
      'D3':  'Data input 3.',
      'GND': 'Ground reference (pin 8).',
      'CLK': 'Clock. Rising edge captures D1-D6 when En is LOW.',
      'Q4':  'Registered output 4.',
      'D4':  'Data input 4.',
      'D5':  'Data input 5.',
      'Q5':  'Registered output 5.',
      'Q6':  'Registered output 6.',
      'D6':  'Data input 6.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: '6 bit Register',
        paragraphs: [
          '6 bit width is useful for 6 bit bus addresses, opcode registers, or any application requiring fewer than 8 bits. Same clock-enable concept as 74x377.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'En',  type:'input'  },
      { pin:2,  name:'Q1',  type:'output' },
      { pin:3,  name:'D1',  type:'input'  },
      { pin:4,  name:'D2',  type:'input'  },
      { pin:5,  name:'Q2',  type:'output' },
      { pin:6,  name:'Q3',  type:'output' },
      { pin:7,  name:'D3',  type:'input'  },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'CLK', type:'input'  },
      { pin:10, name:'Q4',  type:'output' },
      { pin:11, name:'D4',  type:'input'  },
      { pin:12, name:'D5',  type:'input'  },
      { pin:13, name:'Q5',  type:'output' },
      { pin:14, name:'Q6',  type:'output' },
      { pin:15, name:'D6',  type:'input'  },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'D_FF_HEX_CE',
      inputs:  ['D1','D2','D3','D4','D5','D6','CLK','En'],
      outputs: ['Q1','Q2','Q3','Q4','Q5','Q6']
    }]
  },

  // ── 74379 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // 4 bit register, clock enable and complementary outputs.
  // En (active LOW): when 0, data clocked on rising CLK. Each Q has Q and Qn.
  '74379': {
    name: '74x379',
    description: '4 bit register, clock enable and complementary outputs (16-pin)',
    pins: 16,
    guideOverview: 'The 74x379 is a 4 bit clock-enabled register with both Q and Qn outputs for each bit. This provides complementary signals useful in bus drivers and balanced transmission lines. En (active LOW) gates the clock.',
    guidePinDescriptions: {
      'En':  'Clock Enable (active LOW). Pull LOW to enable clocking.',
      'Q1':  'Output Q of bit 1.',
      'Q1n': 'Complementary output of bit 1.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'Q2':  'Output Q of bit 2.',
      'Q2n': 'Complementary output of bit 2.',
      'GND': 'Ground reference (pin 8).',
      'CLK': 'Clock. Rising edge captures D1-D4 when En is LOW.',
      'Q3n': 'Complementary output of bit 3.',
      'Q3':  'Output Q of bit 3.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'Q4n': 'Complementary output of bit 4.',
      'Q4':  'Output Q of bit 4.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Complementary Outputs',
        paragraphs: [
          'Having both Q and Qn available eliminates external inverters in differential-drive or balanced push-pull bus applications. The 74x379 also reduces component count when both true and inverted control signals are needed.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'En',  type:'input'  },
      { pin:2,  name:'Q1',  type:'output' },
      { pin:3,  name:'Q1n', type:'output' },
      { pin:4,  name:'D1',  type:'input'  },
      { pin:5,  name:'D2',  type:'input'  },
      { pin:6,  name:'Q2',  type:'output' },
      { pin:7,  name:'Q2n', type:'output' },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'CLK', type:'input'  },
      { pin:10, name:'Q3n', type:'output' },
      { pin:11, name:'Q3',  type:'output' },
      { pin:12, name:'D3',  type:'input'  },
      { pin:13, name:'D4',  type:'input'  },
      { pin:14, name:'Q4n', type:'output' },
      { pin:15, name:'Q4',  type:'output' },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'D_FF_QUAD_CE_COMPL',
      inputs:  ['D1','D2','D3','D4','CLK','En'],
      outputs: ['Q1','Q1n','Q2','Q2n','Q3','Q3n','Q4','Q4n']
    }]
  },

  // ── 74380 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  // 8 bit multifunction register, tri-state.
  // Modes (S0,S1,S2): 000=hold, 001=D latch, 010=D FF, 011=D FF+OC,
  //                   100=SR shift, 101=SL shift, 110=load, 111=clear.
  // OEn: tri-state output enable. Stub: acts as D FF with tri-state.
  '74380': {
    name: '74x380',
    description: '8 bit multifunction register, tri-state (24-pin)',
    pins: 24,
    guideOverview: 'The 74x380 is an 8 bit register with eight selectable operating modes (S0, S1, S2), tri-state outputs (OEn), and a common clock. Modes include: hold, transparent latch, edge-triggered register, shift-right, shift-left, parallel load, and clear. This single chip can replace several separate components in a data path.',
    guidePinDescriptions: {
      'OEn': 'Output Enable (active LOW). When HIGH, Q outputs are tri-stated.',
      'Q1':  'Registered/latched output 1.',
      'D1':  'Data input 1.',
      'D2':  'Data input 2.',
      'Q2':  'Output 2.',
      'Q3':  'Output 3.',
      'D3':  'Data input 3.',
      'D4':  'Data input 4.',
      'Q4':  'Output 4.',
      'S0':  'Mode select bit 0.',
      'S1':  'Mode select bit 1.',
      'GND': 'Ground reference (pin 12).',
      'S2':  'Mode select bit 2.',
      'CLK': 'Clock. Clocked operations use rising edge.',
      'Q5':  'Output 5.',
      'D5':  'Data input 5.',
      'D6':  'Data input 6.',
      'Q6':  'Output 6.',
      'Q7':  'Output 7.',
      'D7':  'Data input 7.',
      'D8':  'Data input 8.',
      'Q8':  'Output 8.',
      'NC':  'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Mode Selection',
        paragraphs: [
          'Three mode bits select among 8 functions: 000=hold, 001=transparent latch, 010=D flip-flop, 011=D FF with OC, 100=shift right, 101=shift left, 110=parallel load, 111=synchronous clear. This flexibility makes the 74x380 suitable as a programmable data-path element.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'OEn', type:'input'  },
      { pin:2,  name:'Q1',  type:'output' },
      { pin:3,  name:'D1',  type:'input'  },
      { pin:4,  name:'D2',  type:'input'  },
      { pin:5,  name:'Q2',  type:'output' },
      { pin:6,  name:'Q3',  type:'output' },
      { pin:7,  name:'D3',  type:'input'  },
      { pin:8,  name:'D4',  type:'input'  },
      { pin:9,  name:'Q4',  type:'output' },
      { pin:10, name:'S0',  type:'input'  },
      { pin:11, name:'S1',  type:'input'  },
      { pin:12, name:'GND', type:'power'  },
      { pin:13, name:'S2',  type:'input'  },
      { pin:14, name:'CLK', type:'input'  },
      { pin:15, name:'Q5',  type:'output' },
      { pin:16, name:'D5',  type:'input'  },
      { pin:17, name:'D6',  type:'input'  },
      { pin:18, name:'Q6',  type:'output' },
      { pin:19, name:'Q7',  type:'output' },
      { pin:20, name:'D7',  type:'input'  },
      { pin:21, name:'D8',  type:'input'  },
      { pin:22, name:'Q8',  type:'output' },
      { pin:23, name:'NC',  type:'input'  },
      { pin:24, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'MULTI_FUNC_REG_8BIT',
      inputs:  ['D1','D2','D3','D4','D5','D6','D7','D8','CLK','S0','S1','S2','OEn'],
      outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8']
    }]
  },

  // ── 74381 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Arithmetic_logic_unit */
  // 4 bit ALU/function generator with generate (G) and propagate (P).
  // S0,S1,S2: select one of 8 functions. Cn: carry in.
  // Functions: 000=A-B-Cn', 001=A+B+Cn, 010=A XOR B+Cn, 011=A XOR B,
  //            100=A AND B, 101=A OR B, 110=A-1+Cn (A decrement), 111=A+A+Cn
  // G: generate, P: propagate, Cn+4: carry out, F0-F3: result.
  '74381': {
    name: '74x381',
    description: '4 bit ALU/function generator with G/P (20-pin)',
    pins: 20,
    guideOverview: 'The 74x381 is a 4 bit arithmetic logic unit (ALU) that implements 8 arithmetic and logic functions selected by S0-S2. It also generates carry lookahead signals G (generate) and P (propagate) for use with a carry lookahead unit (74x182) to build fast ripple-free adders.',
    guidePinDescriptions: {
      'S1':  'Function select bit 1.',
      'S0':  'Function select bit 0.',
      'B0':  'B operand bit 0.',
      'A0':  'A operand bit 0.',
      'F0':  'Result bit 0.',
      'F1':  'Result bit 1.',
      'A1':  'A operand bit 1.',
      'B1':  'B operand bit 1.',
      'A2':  'A operand bit 2.',
      'GND': 'Ground reference (pin 10).',
      'B2':  'B operand bit 2.',
      'F2':  'Result bit 2.',
      'F3':  'Result bit 3.',
      'A3':  'A operand bit 3.',
      'B3':  'B operand bit 3.',
      'Cn':  'Carry input.',
      'G':   'Generate output for carry lookahead.',
      'P':   'Propagate output for carry lookahead.',
      'S2':  'Function select bit 2.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'ALU Functions',
        paragraphs: [
          'S2:S1:S0 selects the function: 000=A minus B minus NOT(Cn), 001=A plus B plus Cn, 010=A XOR B plus Cn, 011=A XOR B, 100=A AND B, 101=A OR B, 110=A minus 1 plus Cn, 111=A plus A plus Cn.',
        ],
      },
      {
        title: 'Carry Lookahead (G/P)',
        paragraphs: [
          'G and P outputs enable a 74x182 carry lookahead unit to compute carries for all bits simultaneously instead of rippling through each stage. Connect G and P to the 74x182 to build a fast 16 bit or wider adder without carry propagation delay.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'S1',  type:'input'  },
      { pin:2,  name:'S0',  type:'input'  },
      { pin:3,  name:'B0',  type:'input'  },
      { pin:4,  name:'A0',  type:'input'  },
      { pin:5,  name:'F0',  type:'output' },
      { pin:6,  name:'F1',  type:'output' },
      { pin:7,  name:'A1',  type:'input'  },
      { pin:8,  name:'B1',  type:'input'  },
      { pin:9,  name:'A2',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'B2',  type:'input'  },
      { pin:12, name:'F2',  type:'output' },
      { pin:13, name:'F3',  type:'output' },
      { pin:14, name:'A3',  type:'input'  },
      { pin:15, name:'B3',  type:'input'  },
      { pin:16, name:'Cn',  type:'input'  },
      { pin:17, name:'G',   type:'output' },
      { pin:18, name:'P',   type:'output' },
      { pin:19, name:'S2',  type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'ALU_4BIT_381',
      inputs:  ['A0','A1','A2','A3','B0','B1','B2','B3','Cn','S0','S1','S2'],
      outputs: ['F0','F1','F2','F3','G','P']
    }]
  },

  // ── 74382 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Adder_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Arithmetic_logic_unit */
  // 4 bit ALU/function generator with ripple carry and overflow.
  // Same functions as 74381 but outputs: Cn+4 (carry), OVR (overflow) instead of G/P.
  '74382': {
    name: '74x382',
    description: '4 bit ALU/function generator with carry and overflow (20-pin)',
    pins: 20,
    guideOverview: 'The 74x382 is a 4 bit ALU identical in function to the 74x381 but replaces the G/P carry lookahead outputs with Cn+4 (carry out) and OVR (signed overflow detect). Use the 74x382 when you need a simple ripple-carry chain and overflow detection rather than lookahead carry.',
    guidePinDescriptions: {
      'S1':  'Function select bit 1.',
      'S0':  'Function select bit 0.',
      'B0':  'B operand bit 0.',
      'A0':  'A operand bit 0.',
      'F0':  'Result bit 0.',
      'F1':  'Result bit 1.',
      'A1':  'A operand bit 1.',
      'B1':  'B operand bit 1.',
      'A2':  'A operand bit 2.',
      'GND': 'Ground reference (pin 10).',
      'B2':  'B operand bit 2.',
      'F2':  'Result bit 2.',
      'F3':  'Result bit 3.',
      'A3':  'A operand bit 3.',
      'B3':  'B operand bit 3.',
      'Cn':  'Carry input.',
      'Cn4': 'Carry output (Cn+4). Connect to Cn of the next 74x382 slice for ripple-carry.',
      'OVR': 'Overflow output. HIGH when a signed arithmetic operation overflows.',
      'S2':  'Function select bit 2.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Ripple Carry and Overflow',
        paragraphs: [
          'Connect Cn4 of the low-order slice to Cn of the next slice for ripple-carry addition. OVR detects 2s-complement signed overflow: if two positive numbers sum to a negative result (or vice versa), OVR goes HIGH. Cascade multiple 74x382s for wider arithmetic.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'S1',  type:'input'  },
      { pin:2,  name:'S0',  type:'input'  },
      { pin:3,  name:'B0',  type:'input'  },
      { pin:4,  name:'A0',  type:'input'  },
      { pin:5,  name:'F0',  type:'output' },
      { pin:6,  name:'F1',  type:'output' },
      { pin:7,  name:'A1',  type:'input'  },
      { pin:8,  name:'B1',  type:'input'  },
      { pin:9,  name:'A2',  type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'B2',  type:'input'  },
      { pin:12, name:'F2',  type:'output' },
      { pin:13, name:'F3',  type:'output' },
      { pin:14, name:'A3',  type:'input'  },
      { pin:15, name:'B3',  type:'input'  },
      { pin:16, name:'Cn',  type:'input'  },
      { pin:17, name:'Cn4', type:'output' },
      { pin:18, name:'OVR', type:'output' },
      { pin:19, name:'S2',  type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'ALU_4BIT_382',
      inputs:  ['A0','A1','A2','A3','B0','B1','B2','B3','Cn','S0','S1','S2'],
      outputs: ['F0','F1','F2','F3','Cn4','OVR']
    }]
  },

  // ── 74383 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector */
  // 8 bit register, OC. Same as 74273 but open-collector outputs.
  '74383': {
    name: '74x383',
    description: '8 bit register, open-collector (20-pin)',
    pins: 20,
    guideOverview: 'The 74x383 is an 8 bit D-type register with open-collector outputs and an asynchronous clear (CLRn). It is functionally equivalent to the 74x273 but with OC outputs. Add external pull up resistors on all Q outputs.',
    guidePinDescriptions: {
      'CLRn': 'Asynchronous Clear (active LOW). Immediately clears all Q outputs to 0.',
      'Q8':   'Output 8 (open-collector).',
      'D8':   'Data input 8.',
      'D7':   'Data input 7.',
      'Q7':   'Output 7.',
      'Q6':   'Output 6.',
      'D6':   'Data input 6.',
      'D5':   'Data input 5.',
      'Q5':   'Output 5.',
      'GND':  'Ground reference (pin 10).',
      'CLK':  'Clock. Rising edge captures D1-D8.',
      'Q4':   'Output 4.',
      'D4':   'Data input 4.',
      'D3':   'Data input 3.',
      'Q3':   'Output 3.',
      'Q2':   'Output 2.',
      'D2':   'Data input 2.',
      'D1':   'Data input 1.',
      'Q1':   'Output 1.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'OC Register',
        paragraphs: [
          'Open-collector outputs allow wired AND bus connections. Multiple 74x383s can share the same output bus line. Add a pull up resistor on each Q output line. The clear pin is asynchronous it operates independently of the clock.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'CLRn',type:'input'  },
      { pin:2,  name:'Q8',  type:'output' },
      { pin:3,  name:'D8',  type:'input'  },
      { pin:4,  name:'D7',  type:'input'  },
      { pin:5,  name:'Q7',  type:'output' },
      { pin:6,  name:'Q6',  type:'output' },
      { pin:7,  name:'D6',  type:'input'  },
      { pin:8,  name:'D5',  type:'input'  },
      { pin:9,  name:'Q5',  type:'output' },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'CLK', type:'input'  },
      { pin:12, name:'Q4',  type:'output' },
      { pin:13, name:'D4',  type:'input'  },
      { pin:14, name:'D3',  type:'input'  },
      { pin:15, name:'Q3',  type:'output' },
      { pin:16, name:'Q2',  type:'output' },
      { pin:17, name:'D2',  type:'input'  },
      { pin:18, name:'D1',  type:'input'  },
      { pin:19, name:'Q1',  type:'output' },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'D_FF_OCTAL_OC',
      inputs:  ['D1','D2','D3','D4','D5','D6','D7','D8','CLK','CLRn'],
      outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8']
    }]
  },

  // ── 74384 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // 8×1 two's complement multiplier. Multiplies 8 bit signed input Y
  // by 1 bit multiplicand X: produces 9 bit result (P0..P8).
  '74384': {
    name: '74x384',
    description: '8 bit by 1 bit two\'s complement multiplier (16-pin)',
    pins: 16,
    guideOverview: 'The 74x384 is an 8×1 bit two’s complement multiplier. It multiplies an 8 bit signed operand Y by a 1 bit multiplier X. When X=1 the 8 bit value passes through; when X=0 the result is 0. Because both operands are in two’s complement, negative Y values produce a correct negative result.',
    guidePinDescriptions: {
      'Y7':  'Operand bit 7 (MSB/sign bit).',
      'Y6':  'Operand bit 6.',
      'Y5':  'Operand bit 5.',
      'Y4':  'Operand bit 4.',
      'Y3':  'Operand bit 3.',
      'Y2':  'Operand bit 2.',
      'Y1':  'Operand bit 1.',
      'GND': 'Ground reference (pin 8).',
      'Y0':  'Operand bit 0 (LSB).',
      'X':   '1 bit multiplier input.',
      'P0':  'Product bit 0.',
      'P1':  'Product bit 1.',
      'P2':  'Product bit 2.',
      'P3':  'Product bit 3.',
      'P4':  'Product bit 4.',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: '8×1 Multiplier',
        paragraphs: [
          'Multiplying by a single bit simplifies to a conditional pass: if X=1 output P = Y; if X=0 output P = 0. This is the simplest building block of a shift-and-add serial multiplier. Cascade multiple 74x384s to build wider multipliers by summing shifted partial products.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'Y7',  type:'input'  },
      { pin:2,  name:'Y6',  type:'input'  },
      { pin:3,  name:'Y5',  type:'input'  },
      { pin:4,  name:'Y4',  type:'input'  },
      { pin:5,  name:'Y3',  type:'input'  },
      { pin:6,  name:'Y2',  type:'input'  },
      { pin:7,  name:'Y1',  type:'input'  },
      { pin:8,  name:'GND', type:'power'  },
      { pin:9,  name:'Y0',  type:'input'  },
      { pin:10, name:'X',   type:'input'  },
      { pin:11, name:'P0',  type:'output' },
      { pin:12, name:'P1',  type:'output' },
      { pin:13, name:'P2',  type:'output' },
      { pin:14, name:'P3',  type:'output' },
      { pin:15, name:'P4',  type:'output' },
      { pin:16, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'MULTIPLIER_8X1',
      inputs:  ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','X'],
      outputs: ['P0','P1','P2','P3','P4']
    }]
  },

  // ── 74385 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Adder_(electronics) */
  // Quad serial adder/subtractor. 4 independent serial add/sub units.
  // Each unit: A, B, ADD/SUBn → SUM/DIFF, CARRY.
  // Has shift-register feedback for cascading. Stub implementation.
  '74385': {
    name: '74x385',
    description: 'quad serial adder/subtractor (20-pin)',
    pins: 20,
    guideOverview: 'The 74x385 contains four independent serial full-adder/subtractor units. Each unit accepts two 1 bit inputs (A, B), an add/subtract select (AS), and a clock. It produces a serial sum/difference output (S) with an internal carry flip-flop chained to the next clock cycle. Useful for building bit-serial arithmetic pipelines.',
    guidePinDescriptions: {
      '1A':  'Input A for unit 1.',
      '1B':  'Input B for unit 1.',
      '1AS': 'Add/Subtract select for unit 1. LOW = add, HIGH = subtract.',
      '1S':  'Sum/difference output for unit 1.',
      '2A':  'Input A for unit 2.',
      '2B':  'Input B for unit 2.',
      '2AS': 'Add/Subtract select for unit 2.',
      '2S':  'Sum/difference output for unit 2.',
      'CLK': 'Common clock for all four units.',
      'GND': 'Ground reference (pin 10).',
      '3S':  'Sum/difference output for unit 3.',
      '3AS': 'Add/Subtract select for unit 3.',
      '3B':  'Input B for unit 3.',
      '3A':  'Input A for unit 3.',
      '4S':  'Sum/difference output for unit 4.',
      '4AS': 'Add/Subtract select for unit 4.',
      '4B':  'Input B for unit 4.',
      '4A':  'Input A for unit 4.',
      'NC':  'Not connected.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Serial Arithmetic',
        paragraphs: [
          'Serial arithmetic processes one bit per clock cycle, LSB first. The carry or borrow is stored in an internal flip-flop and used in the next cycle. Four independent units allow four separate serial arithmetic streams to run in parallel.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'1A',  type:'input'  },
      { pin:2,  name:'1B',  type:'input'  },
      { pin:3,  name:'1AS', type:'input'  },
      { pin:4,  name:'1S',  type:'output' },
      { pin:5,  name:'2A',  type:'input'  },
      { pin:6,  name:'2B',  type:'input'  },
      { pin:7,  name:'2AS', type:'input'  },
      { pin:8,  name:'2S',  type:'output' },
      { pin:9,  name:'CLK', type:'input'  },
      { pin:10, name:'GND', type:'power'  },
      { pin:11, name:'3S',  type:'output' },
      { pin:12, name:'3AS', type:'input'  },
      { pin:13, name:'3B',  type:'input'  },
      { pin:14, name:'3A',  type:'input'  },
      { pin:15, name:'4S',  type:'output' },
      { pin:16, name:'4AS', type:'input'  },
      { pin:17, name:'4B',  type:'input'  },
      { pin:18, name:'4A',  type:'input'  },
      { pin:19, name:'NC',  type:'input'  },
      { pin:20, name:'VCC', type:'power'  }
    ],
    gates: [{
      type: 'SERIAL_ADDER_QUAD',
      inputs:  ['1A','1B','1AS','2A','2B','2AS','3A','3B','3AS','4A','4B','4AS','CLK'],
      outputs: ['1S','2S','3S','4S']
    }]
  },

  // ── 74386 ─────────────────────────────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Parity_bit */
  // Quad 2 input XOR gate. Same as 74136/74266 family but with different body.
  '74386': {
    name: '74x386',
    description: 'quad 2 input XOR gate (14-pin)',
    pins: 14,
    guideOverview: 'The 74x386 contains four independent 2 input XOR (exclusive-OR) gates. Output is HIGH when exactly one input is HIGH. It is functionally identical to the 74x86 and can be used interchangeably for parity generation, controlled inversion, and error detection.',
    guidePinDescriptions: {
      '1A':  'Input A of gate 1.',
      '1B':  'Input B of gate 1.',
      '1Y':  'XOR output of gate 1.',
      '2A':  'Input A of gate 2.',
      '2B':  'Input B of gate 2.',
      '2Y':  'XOR output of gate 2.',
      'GND': 'Ground reference (pin 7).',
      '3Y':  'XOR output of gate 3.',
      '3A':  'Input A of gate 3.',
      '3B':  'Input B of gate 3.',
      '4Y':  'XOR output of gate 4.',
      '4A':  'Input A of gate 4.',
      '4B':  'Input B of gate 4.',
      'VCC': 'Positive supply (+5 V, pin 14).',
    },
    guideSections: [
      {
        title: 'XOR Gate Applications',
        paragraphs: [
          'XOR is true when inputs differ. Common uses: parity generation (chain multiple XOR gates to count odd/even 1s), controlled inversion (A XOR control output equals A when control=0, or NOT A when control=1), and comparators (XOR of two bits is 1 when they differ).',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'1A',  type:'input'  },
      { pin:2,  name:'1B',  type:'input'  },
      { pin:3,  name:'1Y',  type:'output' },
      { pin:4,  name:'2A',  type:'input'  },
      { pin:5,  name:'2B',  type:'input'  },
      { pin:6,  name:'2Y',  type:'output' },
      { pin:7,  name:'GND', type:'power'  },
      { pin:8,  name:'3Y',  type:'output' },
      { pin:9,  name:'3A',  type:'input'  },
      { pin:10, name:'3B',  type:'input'  },
      { pin:11, name:'4Y',  type:'output' },
      { pin:12, name:'4A',  type:'input'  },
      { pin:13, name:'4B',  type:'input'  },
      { pin:14, name:'VCC', type:'power'  }
    ],
    gates: [
      { type: 'XOR', inputs: ['1A','1B'], output: '1Y' },
      { type: 'XOR', inputs: ['2A','2B'], output: '2Y' },
      { type: 'XOR', inputs: ['3A','3B'], output: '3Y' },
      { type: 'XOR', inputs: ['4A','4B'], output: '4Y' }
    ]
  }

};
