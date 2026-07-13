// Chip definitions block 57
// Chips: 74x3893, 74x4002, 74x4015, 74x4016, 74x4017, 74x4020, 74x4022,
//        74x4024, 74x4028, 74x4040, 74x4049, 74x4050, 74x4051,
//        74x4052, 74x4053

export const CHIPS_BLOCK_57 = {

  // 74x3893: Quad Futurebus backplane transceiver, TS+OC (20-pin)
  // MC74F3893A complex transceiver with both TS drivers and OC outputs; treat as GENERIC_STUB
  '74x3893': {
    name: '74x3893',
    simpleName: 'Quad Futurebus Backplane Transceiver',
    description: 'Quad Futurebus backplane transceiver, 3-state + open-collector (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['transceiver', 'futurebus', 'backplane', 'quad', 'stub'],
    pinout: [
      { pin:  1, name: 'DIR',  type: 'input'  },
      { pin:  2, name: 'OEn',  type: 'input'  },
      { pin:  3, name: 'A1',   type: 'bidir'  },
      { pin:  4, name: 'B1',   type: 'bidir'  },
      { pin:  5, name: 'A2',   type: 'bidir'  },
      { pin:  6, name: 'B2',   type: 'bidir'  },
      { pin:  7, name: 'A3',   type: 'bidir'  },
      { pin:  8, name: 'B3',   type: 'bidir'  },
      { pin:  9, name: 'A4',   type: 'bidir'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'B4',   type: 'bidir'  },
      { pin: 12, name: 'LE',   type: 'input'  },
      { pin: 13, name: 'CEn',  type: 'input'  },
      { pin: 14, name: 'NC',   type: 'nc'     },
      { pin: 15, name: 'NC2',  type: 'nc'     },
      { pin: 16, name: 'NC3',  type: 'nc'     },
      { pin: 17, name: 'NC4',  type: 'nc'     },
      { pin: 18, name: 'NC5',  type: 'nc'     },
      { pin: 19, name: 'NC6',  type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['DIR','OEn','LE','CEn'], outputs: [] },
    ],
  },

  // 74x4002: Dual 4 input NOR gate (14-pin)
  // CD74x4002 two independent 4 input NOR gates
  '74x4002': {
    name: '74x4002',
    simpleName: 'Dual 4 Input NOR Gate',
    description: 'Dual 4 input NOR gate (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4002.pdf',
    tags: ['NOR', 'dual', '4 input', 'gate'],
    guideOverview: 'The 74x4002 contains two independent 4 input NOR gates. A NOR gate outputs HIGH only when all of its inputs are LOW, so it is effectively an OR gate followed by inversion. Four input NOR gates are handy when several conditions must all be false before an output can turn on, or when you need to combine many signals without building a tree of smaller gates.',
    guidePinDescriptions: {
      '1Y': 'Output of gate 1. It goes HIGH only when 1A, 1B, 1C, and 1D are all LOW.',
      '1A': 'Input A of gate 1.',
      '1B': 'Input B of gate 1.',
      '1C': 'Input C of gate 1.',
      '1D': 'Input D of gate 1.',
      'NC': 'No internal connection. Leave unconnected.',
      'GND': 'Ground reference for the package.',
      'NC2': 'No internal connection. Leave unconnected.',
      '2D': 'Input D of gate 2.',
      '2C': 'Input C of gate 2.',
      '2B': 'Input B of gate 2.',
      '2A': 'Input A of gate 2.',
      '2Y': 'Output of gate 2. It goes HIGH only when all four inputs of gate 2 are LOW.',
      'VCC': 'Positive supply for the logic gates.',
    },
    guideSections: [
      {
        title: 'Logic Function',
        paragraphs: [
          'A NOR gate is the inverse of OR. If any input is HIGH, the output goes LOW. Only the all-LOW input condition produces a HIGH output.',
        ],
        formulas: [
          'Y = not (A + B + C + D)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Combining several active HIGH conditions into one active LOW result.',
          'Building simple state detect or inhibit logic.',
          'Implementing other logic functions through De Morgan transformations.',
        ],
      },
    ],
    // Standard CD4002/74HC4002 DIP: NC on pins 1 & 13, outputs on pins 6 & 8.
    pinout: [
      { pin:  1, name: 'NC',  type: 'nc'     },
      { pin:  2, name: '1A',  type: 'input'  },
      { pin:  3, name: '1B',  type: 'input'  },
      { pin:  4, name: '1C',  type: 'input'  },
      { pin:  5, name: '1D',  type: 'input'  },
      { pin:  6, name: '1Y',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '2Y',  type: 'output' },
      { pin:  9, name: '2D',  type: 'input'  },
      { pin: 10, name: '2C',  type: 'input'  },
      { pin: 11, name: '2B',  type: 'input'  },
      { pin: 12, name: '2A',  type: 'input'  },
      { pin: 13, name: 'NC2', type: 'nc'     },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A','1B','1C','1D'], output: '1Y' },
      { type: 'NOR', inputs: ['2A','2B','2C','2D'], output: '2Y' },
    ],
  },

  // 74x4015: Dual 4-stage serial-in / parallel-out static shift register (16-pin).
  // Two independent registers, each with its own clock (CP), serial data (D), and
  // active-HIGH asynchronous Master Reset (MR). No NC pins, no common clock/reset.
  //
  // Source: Texas Instruments (data acquired from Harris Semiconductor),
  //   "CD54HC4015, CD74HC4015 High Speed CMOS Logic Dual 4-Stage Static Shift
  //   Register", SCHS198C (Nov. 1997, rev. May 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4015.pdf. Verified: terminal
  //   assignment (Pinout, p.1), functional diagram + TRUTH TABLE (p.2), read as
  //   PDF page images per issues.md C4. Pin map: 1=2CP, 2=2Q3, 3=1Q2, 4=1Q1,
  //   5=1Q0, 6=1MR, 7=1D, 8=GND, 9=1CP, 10=1Q3, 11=2Q2, 12=2Q1, 13=2Q0, 14=2MR,
  //   15=2D, 16=VCC. The pre-existing stub pinout was wrong (invented NC pins,
  //   omitted both MR resets, scrambled the outputs) — classic issues.md C2
  //   hazard; corrected against the datasheet here.
  '74x4015': {
    name: '74x4015',
    simpleName: 'Dual 4 bit Serial In/Parallel Out Shift Register',
    description: 'Dual 4 bit serial in / parallel out shift register (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4015.pdf',
    tags: ['shift-register', 'dual', '4 bit', 'serial in', 'parallel out'],
    guideOverview: 'The 74x4015 contains two separate 4 bit serial in, parallel out shift registers. Each section has its own clock, serial data input, and reset. On every rising clock edge it loads the data bit into the first stage and moves the stored bits along one stage. It is useful for serial to parallel conversion, simple delay lines, and stepping patterns through a small set of outputs.',
    guidePinDescriptions: {
      '2CP': 'Clock for section 2. On each rising edge a new bit enters Q0 and the stored bits shift one stage along.',
      '2Q3': 'Stage 3 (last) output of section 2.',
      '1Q2': 'Stage 2 output of section 1.',
      '1Q1': 'Stage 1 output of section 1.',
      '1Q0': 'Stage 0 (first) output of section 1.',
      '1MR': 'Master reset for section 1. A HIGH level forces all four section 1 outputs LOW, overriding the clock.',
      '1D': 'Serial data input for section 1. Its level is loaded into 1Q0 on the next rising clock edge.',
      'GND': 'Ground reference for the device.',
      '1CP': 'Clock for section 1. On each rising edge a new bit enters Q0 and the stored bits shift one stage along.',
      '1Q3': 'Stage 3 (last) output of section 1.',
      '2Q2': 'Stage 2 output of section 2.',
      '2Q1': 'Stage 1 output of section 2.',
      '2Q0': 'Stage 0 (first) output of section 2.',
      '2MR': 'Master reset for section 2. A HIGH level forces all four section 2 outputs LOW, overriding the clock.',
      '2D': 'Serial data input for section 2. Its level is loaded into 2Q0 on the next rising clock edge.',
      'VCC': 'Positive supply for the shift registers.',
    },
    guideSections: [
      {
        title: 'How Shifting Works',
        paragraphs: [
          'On each rising clock edge, the level on the serial data input enters the first stage (Q0) and the old contents move one stage farther along: Q0 to Q1, Q1 to Q2, Q2 to Q3. The bit in Q3 falls off the end. After four clocks a four bit serial stream is laid out across the parallel Q outputs.',
        ],
      },
      {
        title: 'Reset',
        paragraphs: [
          'Each section has its own master reset. Taking it HIGH forces all four of that section\'s outputs LOW straight away, without waiting for a clock edge. The other section is unaffected.',
        ],
      },
      {
        title: 'Two Independent Registers',
        paragraphs: [
          'The two 4 bit sections do not have to run together. Each has its own clock, data input, and reset, so they can be used for unrelated tasks or cascaded into a longer shift path by feeding one section\'s last output into the next section\'s data input.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '2CP', type: 'input'  },
      { pin:  2, name: '2Q3', type: 'output' },
      { pin:  3, name: '1Q2', type: 'output' },
      { pin:  4, name: '1Q1', type: 'output' },
      { pin:  5, name: '1Q0', type: 'output' },
      { pin:  6, name: '1MR', type: 'input'  },
      { pin:  7, name: '1D',  type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: '1CP', type: 'input'  },
      { pin: 10, name: '1Q3', type: 'output' },
      { pin: 11, name: '2Q2', type: 'output' },
      { pin: 12, name: '2Q1', type: 'output' },
      { pin: 13, name: '2Q0', type: 'output' },
      { pin: 14, name: '2MR', type: 'input'  },
      { pin: 15, name: '2D',  type: 'input'  },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'SHIFT_REG_DUAL4_SIPO_4015',
        inputs:  ['1CP','1D','1MR','2CP','2D','2MR'],
        outputs: ['1Q0','1Q1','1Q2','1Q3','2Q0','2Q1','2Q2','2Q3'] },
    ],
  },

  // 74x4016: Quad bilateral switch, analog (14-pin)
  // CD74x4016 four independent SPST analog switches; each has two I/O pins and a control input
  '74x4016': {
    name: '74x4016',
    simpleName: 'Quad Bilateral Analog Switch',
    description: 'Quad bilateral switch with analog signal capability (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    onResistance: 400,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4016.pdf',
    tags: ['analog', 'switch', 'bilateral', 'quad', 'bidir'],
    guideOverview: 'The 74x4016 contains four independent bilateral analog switches. Each channel behaves like an electronically controlled SPST switch, so it can pass signals in either direction when enabled and isolate them when disabled. This makes it useful for routing analog signals, gating digital lines, or building simple multiplexing functions without directional buffers.',
    guidePinDescriptions: {
      'A1': 'One side of switch channel 1.',
      'B1': 'Other side of switch channel 1.',
      'E1': 'Control input for channel 1. In the 4016 family, a HIGH control level usually closes the switch.',
      'E2': 'Control input for channel 2.',
      'B2': 'Other side of switch channel 2.',
      'A2': 'One side of switch channel 2.',
      'GND': 'Ground reference for the package.',
      'A3': 'One side of switch channel 3.',
      'B3': 'Other side of switch channel 3.',
      'E3': 'Control input for channel 3.',
      'E4': 'Control input for channel 4.',
      'B4': 'Other side of switch channel 4.',
      'A4': 'One side of switch channel 4.',
      'VCC': 'Positive supply for the control circuitry.',
    },
    guideSections: [
      {
        title: 'Bilateral Analog Switching',
        paragraphs: [
          'Because each switch channel is bilateral, the chip does not care which side is the source and which side is the destination. That is different from a buffer, which has a fixed input side and output side.',
        ],
      },
      {
        title: 'Where It Is Useful',
        list: [
          'Selecting among analog sensor signals.',
          'Connecting or disconnecting audio or control lines.',
          'Making simple digitally controlled routing networks.',
        ],
        note: '74Sim models each channel as a passive resistive coupling: when E is HIGH, A and B are connected through the chip\'s on-resistance (~400 Ω for the 4016) and any analog voltage between the rails passes through; when E is LOW, both terminals are isolated. Distortion, bandwidth, and leakage are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'A1',  type: 'bidir'  },
      { pin:  2, name: 'B1',  type: 'bidir'  },
      { pin:  3, name: 'E1',  type: 'input'  },
      { pin:  4, name: 'E2',  type: 'input'  },
      { pin:  5, name: 'B2',  type: 'bidir'  },
      { pin:  6, name: 'A2',  type: 'bidir'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'bidir'  },
      { pin:  9, name: 'B3',  type: 'bidir'  },
      { pin: 10, name: 'E3',  type: 'input'  },
      { pin: 11, name: 'E4',  type: 'input'  },
      { pin: 12, name: 'B4',  type: 'bidir'  },
      { pin: 13, name: 'A4',  type: 'bidir'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'BILATERAL_SWITCH', inputs: ['A1','B1','E1'], outputs: ['A1','B1'] },
      { type: 'BILATERAL_SWITCH', inputs: ['A2','B2','E2'], outputs: ['A2','B2'] },
      { type: 'BILATERAL_SWITCH', inputs: ['A3','B3','E3'], outputs: ['A3','B3'] },
      { type: 'BILATERAL_SWITCH', inputs: ['A4','B4','E4'], outputs: ['A4','B4'] },
    ],
  },

  // 74x4017: 5-stage ÷10 Johnson decade counter (16-pin)
  // CD74x4017 10 decoded outputs (Q0-Q9), ripple carry out, clock, clock enable, controller reset
  '74x4017': {
    name: '74x4017',
    simpleName: '5-Stage Divide by-10 Johnson Counter',
    description: '5-stage divide-by-10 Johnson decade counter, 10 decoded outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4017.pdf',
    tags: ['counter', 'johnson', 'decade', 'divide by-10'],
    guideOverview: 'The 74x4017 is a Johnson decade counter with ten decoded outputs. Instead of presenting a binary count, it turns on one output at a time in sequence, making it very popular for LED chasers, step sequencing, and divide by-10 timing. It is easy to use on a breadboard because the decoded outputs eliminate the need for a separate binary to decimal decoder.',
    guidePinDescriptions: {
      'Q5': 'Decoded output 5. Goes HIGH during count state 5.',
      'Q1': 'Decoded output 1. Goes HIGH during count state 1.',
      'Q0': 'Decoded output 0. This is the first active output after reset.',
      'Q2': 'Decoded output 2. Goes HIGH during count state 2.',
      'Q6': 'Decoded output 6. Goes HIGH during count state 6.',
      'Q7': 'Decoded output 7. Goes HIGH during count state 7.',
      'Q3': 'Decoded output 3. Goes HIGH during count state 3.',
      'GND': 'Ground reference for the counter.',
      'Q8': 'Decoded output 8. Goes HIGH during count state 8.',
      'Q4': 'Decoded output 4. Goes HIGH during count state 4.',
      'Q9': 'Decoded output 9. Goes HIGH during count state 9.',
      'COUT': 'Carry output used for cascading multiple counters or divide by logic.',
      'CLKEn': 'Clock enable (active LOW). Pull LOW to allow clock pulses; hold HIGH to freeze the sequence.',
      'CLK': 'Clock input. Each valid clock edge advances the active output to the next decoded state.',
      'MR': 'Master reset. Assert HIGH to reset the counter to state 0.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Decoded Counting',
        paragraphs: [
          'Only one Q output is active at a time. Each clock pulse moves that active state to the next output, so the chip directly produces a one of ten sequence.',
        ],
      },
      {
        title: 'Why Johnson Counters Are Handy',
        paragraphs: [
          'A Johnson counter saves logic because the decoding is built in. That makes it a convenient building block for step sequencers, scanners, and simple time base division.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Q5',    type: 'output' },
      { pin:  2, name: 'Q1',    type: 'output' },
      { pin:  3, name: 'Q0',    type: 'output' },
      { pin:  4, name: 'Q2',    type: 'output' },
      { pin:  5, name: 'Q6',    type: 'output' },
      { pin:  6, name: 'Q7',    type: 'output' },
      { pin:  7, name: 'Q3',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'Q8',    type: 'output' },
      { pin: 10, name: 'Q4',    type: 'output' },
      { pin: 11, name: 'Q9',    type: 'output' },
      { pin: 12, name: 'COUT',  type: 'output' },
      { pin: 13, name: 'CLKEn', type: 'input'  },
      { pin: 14, name: 'CLK',   type: 'input'  },
      { pin: 15, name: 'MR',    type: 'input'  },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_DECADE_DECODED',
        inputs:  ['CLK','MR','CLKEn'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','COUT'] },
    ],
    sequential: true,
  },

  // 74x4020: 14-stage binary ripple counter (16-pin)
  // SN74x4020 14 flip flop chain; not all Q outputs brought out; Q2/Q3 not accessible
  // Source: Texas Instruments, "SNx4HC4020 14-Bit Asynchronous Binary Counters",
  //   SCLS158F (Dec. 1982, rev. Feb. 2022). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74hc4020.pdf. Verified: Pin Configuration
  //   (16-pin DIP, page 3) + Functional Block Diagram + Description (page 1), read as
  //   rendered PDF page images per issues.md C4. The datasheet labels the brought-out
  //   stages QA, QD–QN (letters skip the two internal stages B/C): QA=Q1 (stage 1),
  //   QD=Q4 … QN=Q14. DIP map: Q12=1, Q13=2, Q14=3, Q6=4, Q5=5, Q7=6, Q4=7, GND=8,
  //   Q1=9, CLK=10, CLR=11, Q9=12, Q8=13, Q10=14, Q11=15, VCC=16. Behavior (Description,
  //   page 1): counters "advance on the negative-going edge of the clock pulse … reset
  //   to zero (all outputs low) independently of the clock when the clear (CLR) input
  //   goes high" → falling-edge advance, active-HIGH asynchronous reset. The hand-entered
  //   stub's pinout was WRONG (it brought out nonexistent Q2/Q3 and swapped CLK/CLR) and
  //   was corrected against this datasheet, NOT cloned from the CD4020 sibling (issues.md
  //   C2). Identical terminal map + behavior to the verified CD4020 (chips82.js); both
  //   ride the shared COUNTER_BIN_RIPPLE primitive (CLK=φ, MR active HIGH).
  '74x4020': {
    name: '74x4020',
    simpleName: '14-Stage Binary Ripple Counter',
    description: '14-stage binary ripple counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc4020.pdf',
    tags: ['counter', 'binary', '14-stage', 'ripple'],
    guideOverview: 'The 74x4020 is a 14-stage binary ripple counter. Each internal stage divides the previous one by 2, so one clock fed into CLK produces a whole set of slower square waves at the outputs. The counter advances on the falling edge of CLK, and a HIGH on MR clears every stage to zero. Only twelve of the fourteen stages are pinned out: Q1 (divide-by-2) and Q4 through Q14 (divide-by-16 up to divide-by-16384). Stages 2 and 3 are internal, so there are no Q2 or Q3 pins. It is used for frequency division, long delays, and simple timing chains.',
    guidePinDescriptions: {
      'Q12': 'Counter bit 12 output (divide-by-4096).',
      'Q13': 'Counter bit 13 output (divide-by-8192).',
      'Q14': 'Counter bit 14 output (divide-by-16384). Last and slowest stage.',
      'Q6': 'Counter bit 6 output (divide-by-64).',
      'Q5': 'Counter bit 5 output (divide-by-32).',
      'Q7': 'Counter bit 7 output (divide-by-128).',
      'Q4': 'Counter bit 4 output (divide-by-16).',
      'GND': 'Ground reference for the counter.',
      'Q1': 'Counter bit 1 output (divide-by-2). Fastest available output, toggles every clock pulse.',
      'MR': 'Master reset. Hold LOW for normal counting; take HIGH to clear all stages to zero immediately, regardless of the clock.',
      'CLK': 'Clock input. The counter advances one count on each falling edge.',
      'Q11': 'Counter bit 11 output (divide-by-2048).',
      'Q10': 'Counter bit 10 output (divide-by-1024).',
      'Q9': 'Counter bit 9 output (divide-by-512).',
      'Q8': 'Counter bit 8 output (divide-by-256).',
      'VCC': 'Positive supply for the chip.',
    },
    guideSections: [
      {
        title: 'Ripple Counting and Division',
        paragraphs: [
          'A ripple counter is built from cascaded flip flops. Each stage divides the frequency of the previous stage by 2, so the outputs naturally provide many divided clock rates.',
        ],
        formulas: [
          'Qn frequency = clock frequency / 2^n',
        ],
        note: 'Only Q1 and Q4–Q14 are brought out. Stages 2 and 3 are internal, so the divide-by-4 and divide-by-8 outputs are not accessible. After 2^14 = 16384 falling edges the counter rolls over to zero and repeats.',
      },
      {
        title: 'Common Uses',
        list: [
          'Generating slower timing pulses from a crystal or oscillator source.',
          'Creating long delays with simple logic.',
          'Providing binary count states to other logic.',
        ],
        note: '74Sim updates all stages together in one solve, so the real chip\'s stage-to-stage ripple delay (and the brief invalid intermediate counts it causes just after a clock edge) is not reproduced — the settled count is correct (see issues.md A1/D6).',
      },
    ],
    pinout: [
      { pin:  1, name: 'Q12', type: 'output' },
      { pin:  2, name: 'Q13', type: 'output' },
      { pin:  3, name: 'Q14', type: 'output' },
      { pin:  4, name: 'Q6',  type: 'output' },
      { pin:  5, name: 'Q5',  type: 'output' },
      { pin:  6, name: 'Q7',  type: 'output' },
      { pin:  7, name: 'Q4',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Q1',  type: 'output' },
      { pin: 10, name: 'CLK', type: 'input'  },
      { pin: 11, name: 'MR',  type: 'input'  },
      { pin: 12, name: 'Q9',  type: 'output' },
      { pin: 13, name: 'Q8',  type: 'output' },
      { pin: 14, name: 'Q10', type: 'output' },
      { pin: 15, name: 'Q11', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_RIPPLE',
        inputs: ['CLK', 'MR'],
        outputs: ['Q1', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14'] },
    ],
    sequential: true,
  },

  // 74x4022: 4-stage divide-by-8 Johnson counter with 8 decoded outputs (16-pin).
  // Functionally identical to the CD4022B (chips86.js) — same primitive
  // (COUNTER_OCTAL_DECODED): rising-edge CLOCK gated by active-HIGH CLOCK INHIBIT,
  // active-HIGH asynchronous RESET, mod-8 one-hot decoded outputs Q0..Q7, and
  // CARRY OUT HIGH for counts 0-3 / LOW for counts 4-7 (one carry per 8 clocks).
  //
  // NOTE: the prior stub was hand-entered as a 14-pin part with the wrong pin map
  // (GND@7, CARRY@8, VCC@14, "clock enable" active-LOW). That is wrong — the part
  // is a 16-pin DIP and CLOCK INHIBIT is active-HIGH. Pinout below re-verified
  // from the datasheet terminal diagram, NOT cloned from a sibling (issues.md C2).
  //
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4017B, CD4022B Types — CMOS Counter/Dividers", SCHS027C (Feb. 2004).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4022b.pdf.
  //   Verified: CD4022B Terminal Diagram (top view) + Functional Diagram, page 1,
  //   read as rendered PDF page images (issues.md C4): Q1=1, Q0=2, Q2=3, Q5=4,
  //   Q6=5, NC=6, Q3=7, VSS=8, NC=9, Q7=10, Q4=11, CARRY OUT=12, CLOCK INHIBIT=13,
  //   CLOCK=14, RESET=15, VDD=16. Function/timing (Fig. 3 & Fig. 4, page 2):
  //   advance on positive CLOCK transition while CLOCK INHIBIT is LOW; HIGH RESET
  //   clears to count 0 asynchronously; CARRY OUT completes one cycle per 8 clocks.
  '74x4022': {
    name: '74x4022',
    simpleName: '4-Stage Divide-by-8 Johnson Counter',
    description: 'Johnson octal (divide-by-8) counter with 8 decoded outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4022b.pdf',
    tags: ['counter', 'johnson', 'octal counter', 'divide by 8', 'decoded', 'sequencer'],
    guideOverview: 'The 74x4022 is the 8-output relative of the 4017 Johnson counter. One output is HIGH at a time, advancing through eight decoded positions on each rising clock edge while CLOCK INHIBIT is held LOW. After Q7 it rolls back to Q0 (divide-by-8). Because the outputs are already decoded, you can wire them straight to LEDs or control stages without a separate decoder. A 555 timer in astable mode makes a natural clock source.',
    guidePinDescriptions: {
      'Q0': 'Decoded output 0. HIGH after reset and whenever the count equals 0.',
      'Q1': 'Decoded output 1. HIGH only when the count equals 1.',
      'Q2': 'Decoded output 2. HIGH only when the count equals 2.',
      'Q3': 'Decoded output 3. HIGH only when the count equals 3.',
      'Q4': 'Decoded output 4. HIGH only when the count equals 4.',
      'Q5': 'Decoded output 5. HIGH only when the count equals 5.',
      'Q6': 'Decoded output 6. HIGH only when the count equals 6.',
      'Q7': 'Decoded output 7. HIGH only when the count equals 7.',
      'CO': 'Carry out. HIGH for counts 0-3, LOW for counts 4-7, so it completes one cycle every 8 clocks. Feed it to the CLK of a second 74x4022 to count to 64.',
      'CI': 'Clock inhibit (active HIGH). Hold LOW to count; take HIGH to ignore the clock and freeze the count.',
      'CLK': 'Clock input. The counter advances one step on each rising edge while CI is LOW.',
      'MR': 'Reset (active HIGH). Take it HIGH to force Q0 HIGH and all other outputs LOW immediately, regardless of the clock.',
      'NC': 'No connection. Leave unconnected.',
      'GND': 'Ground (0 V). Connect to the negative supply rail.',
      'VDD': 'Positive supply. Accepts 3 V to 18 V.',
    },
    guideSections: [
      {
        title: 'One of Eight Sequence',
        paragraphs: [
          'The chip cycles a single active state through eight decoded outputs instead of producing a binary number. That makes its outputs directly useful without a separate decoder.',
          'CI (Clock Inhibit) must be LOW for a rising clock edge to advance the count. Tie CI to GND for free-running operation.',
          'MR (Reset) overrides everything: taking MR HIGH forces Q0 HIGH and all others LOW at once, regardless of the clock.',
        ],
      },
      {
        title: 'Sequencing Applications',
        list: [
          'LED or lamp chasers: drive eight LEDs from Q0-Q7 and feed a 555 astable into CLK.',
          'Step-by-step control logic.',
          'Divide-by-8 timing: CARRY OUT runs at one eighth of the clock.',
          'Cascade: chain CO into the CLK of another stage to divide by 64, 512, and so on.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Q1',  type: 'output' },
      { pin:  2, name: 'Q0',  type: 'output' },
      { pin:  3, name: 'Q2',  type: 'output' },
      { pin:  4, name: 'Q5',  type: 'output' },
      { pin:  5, name: 'Q6',  type: 'output' },
      { pin:  6, name: 'NC',  type: 'nc'     },
      { pin:  7, name: 'Q3',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'NC',  type: 'nc'     },
      { pin: 10, name: 'Q7',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'CO',  type: 'output' },
      { pin: 13, name: 'CI',  type: 'input'  },
      { pin: 14, name: 'CLK', type: 'input'  },
      { pin: 15, name: 'MR',  type: 'input'  },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_OCTAL_DECODED', inputs: ['CLK','MR','CI'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','CO'] },
    ],
  },

  // 74x4024: 7-stage binary ripple counter (14-pin)
  // CD4024 / CD74HC4024 — 7 flip-flop chain. CLK (CP) advances the count on the
  // HIGH→LOW (falling) edge; MR HIGH asynchronously clears all 7 stages. Outputs
  // Q1 (stage 1, ÷2) … Q7 (stage 7, ÷128) are brought out; pins 8/10/13 are NC.
  //
  // Source: Texas Instruments, "CD54HC4024, CD74HC4024, CD54HCT4024, CD74HCT4024
  //   High-Speed CMOS Logic 7-Stage Binary Ripple Counter", SCHS202D (Nov 1997,
  //   rev. Mar 2022). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4024.pdf. Verified: §2 Description
  //   ("7-stage ripple-carry binary counters … state of the stage advances one
  //   count on the negative transition of each input pulse; a high voltage level
  //   on the MR line resets all counters to their zero state") + §4 Pin
  //   Configuration (Top View, page 3, read as a rendered ~300-dpi PDF image):
  //   1=CP, 2=MR, 3=Q7, 4=Q6, 5=Q5, 6=Q4, 7=GND, 8=NC, 9=Q3, 10=NC, 11=Q2,
  //   12=Q1, 13=NC, 14=VCC.
  // Cross-checked against the higher-voltage original: Texas Instruments (Harris),
  //   "CD4020B, CD4024B, CD4040B Types CMOS Ripple-Carry Binary Counter/Dividers",
  //   SCHS030D (rev. Dec 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4024b.pdf. Verified: CD4024B TERMINAL
  //   ASSIGNMENTS + Functional Diagram (page 1; diagram notes "NC = 8,10,13") —
  //   identical pin map, confirming the stub's hand-entered pinout was scrambled
  //   (it had MR on pin 13, Q7 on pin 2, Q1/Q2 on 8/9). Pin map verified directly,
  //   NOT cloned from the sibling 4020/4040 stubs (issues.md C2, CD4082 lesson).
  // Engine: reuses the generic COUNTER_BIN_RIPPLE primitive (already serving the
  //   CD4020/4040/4045 family). It parses the stage number from each Qn name
  //   (Q1→bit 0 … Q7→bit 6), counts on the falling clock edge, resets on MR HIGH,
  //   and wraps at 2^7 = 128 — exactly the CD4024 function. No new primitive.
  '74x4024': {
    name: '74x4024',
    simpleName: '7-Stage Binary Ripple Counter',
    description: '7-stage binary ripple carry counter (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4024.pdf',
    tags: ['counter', 'binary', '7-stage', 'ripple'],
    guideOverview: 'The 74x4024 is a compact binary ripple counter that provides seven divided outputs. Each stage divides the clock rate by 2, so the device is useful whenever one oscillator must be slowed down into several lower frequency timing signals. It is a classic choice for simple counters, blinkers, and timing chains.',
    guidePinDescriptions: {
      'CLK': 'Clock input. The count advances by one on each falling (high-to-low) edge.',
      'Q7': 'Stage 7 output, the slowest. Toggles once every 128 clock edges (divide-by-128).',
      'Q6': 'Stage 6 output. Toggles once every 64 clock edges (divide-by-64).',
      'Q5': 'Stage 5 output. Toggles once every 32 clock edges (divide-by-32).',
      'Q4': 'Stage 4 output. Toggles once every 16 clock edges (divide-by-16).',
      'Q3': 'Stage 3 output. Toggles once every 8 clock edges (divide-by-8).',
      'GND': 'Ground reference for the chip.',
      'Q2': 'Stage 2 output. Toggles once every 4 clock edges (divide-by-4).',
      'Q1': 'Stage 1 output, the fastest. Toggles once every 2 clock edges (divide-by-2).',
      'NC': 'No internal connection. Leave unconnected.',
      'NC2': 'No internal connection. Leave unconnected.',
      'NC3': 'No internal connection. Leave unconnected.',
      'MR': 'Master reset. Hold it high to clear the count to zero. Reset happens immediately and does not need the clock.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Binary Division',
        paragraphs: [
          'Each output is a divided version of the clock. The farther down the chain the output comes from, the slower it toggles. Q1 is half the clock rate, Q2 a quarter, and so on up to Q7 at one-128th.',
          'The seven outputs together read out as a 7-bit binary number that increases by one on every falling clock edge, from 0 up to 127 and then back to 0.',
        ],
        formulas: [
          'Qn output frequency = clock frequency ÷ 2ⁿ',
          'count range = 0 to 127, then wraps to 0',
        ],
      },
      {
        title: 'Why Use a Ripple Counter',
        paragraphs: [
          'In a ripple counter each stage clocks the next, so the count "ripples" down the chain instead of every stage switching at once. That keeps it simple and low-power, but the later outputs change slightly after the earlier ones rather than all together.',
          'Ripple counters are a good fit when exact edge alignment between outputs is not required — frequency division, slow timing signals, and blinkers on a breadboard.',
        ],
        note: 'Real silicon counts on the falling clock edge and the stages settle one after another; the simulator updates all seven outputs together, so the brief ripple delay between stages is not shown.',
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK', type: 'input'  },
      { pin:  2, name: 'MR',  type: 'input'  },
      { pin:  3, name: 'Q7',  type: 'output' },
      { pin:  4, name: 'Q6',  type: 'output' },
      { pin:  5, name: 'Q5',  type: 'output' },
      { pin:  6, name: 'Q4',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'NC',  type: 'nc'     },
      { pin:  9, name: 'Q3',  type: 'output' },
      { pin: 10, name: 'NC2', type: 'nc'     },
      { pin: 11, name: 'Q2',  type: 'output' },
      { pin: 12, name: 'Q1',  type: 'output' },
      { pin: 13, name: 'NC3', type: 'nc'     },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_RIPPLE', inputs: ['CLK','MR'],
        outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
    ],
  },

  // 74x4028: BCD to decimal decoder (16-pin)
  // 4 bit BCD input A-D (A=LSB, D=MSB), 10 decoded active-HIGH outputs Q0-Q9.
  // Selected output HIGH, all others LOW; invalid codes 10-15 hold every output
  // LOW. Sim reuses the BCD_DECIMAL_HI primitive (shared with the CD4028 entry).
  // Source: Texas Instruments (data acquired from Harris/RCA), "CD4028B Types
  //   BCD-to-Decimal Decoder", SCHS033C (Oct. 2003).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4028b.pdf.
  //   Verified: functional/terminal diagram (pin map) + Table I truth table,
  //   page 1, read as 300-dpi PDF images. The stub's original pinout was wrong
  //   (a made-up sequential Q0-Q9 layout); corrected to the datasheet:
  //   A=10, B=13, C=12, D=11; Q0=3, Q1=14, Q2=2, Q3=15, Q4=1, Q5=6, Q6=7,
  //   Q7=4, Q8=9, Q9=5; VSS/GND=8, VDD/VCC=16. Independently cross-checked
  //   against the existing CD4028 entry's pinout, which agrees.
  '74x4028': {
    name: '74x4028',
    simpleName: 'BCD to Decimal Decoder',
    description: 'BCD to decimal decoder with 4 bit BCD input and 10 decoded outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4028b.pdf',
    tags: ['decoder', 'BCD', 'decimal', '4-to-10'],
    guideOverview: 'The 74x4028 converts a 4 bit input code into one active decimal output. In its BCD use, valid input codes 0 through 9 each select one matching output line, which is useful for numeric displays, step selection, and address decoding. It is the opposite of an encoder: one binary coded input becomes one of many decoded outputs.',
    guidePinDescriptions: {
      'Q7': 'Decoded output 7.',
      'Q6': 'Decoded output 6.',
      'Q5': 'Decoded output 5.',
      'Q4': 'Decoded output 4.',
      'Q3': 'Decoded output 3.',
      'Q2': 'Decoded output 2.',
      'Q1': 'Decoded output 1.',
      'GND': 'Ground reference for the decoder.',
      'Q0': 'Decoded output 0.',
      'D': 'Most significant input bit in the 4 bit input code.',
      'C': 'Input bit C.',
      'B': 'Input bit B.',
      'A': 'Least significant input bit in the 4 bit input code.',
      'Q9': 'Decoded output 9.',
      'Q8': 'Decoded output 8.',
      'VCC': 'Positive supply for the logic.',
    },
    guideSections: [
      {
        title: 'Decoding BCD',
        paragraphs: [
          'A decoder turns a binary code into one of many outputs. Apply a value on A (the least significant bit) through D (the most significant bit). The codes 0 through 9 drive Q0 through Q9 respectively: the matching output goes HIGH and the other nine stay LOW.',
          'Codes 10 through 15 are not valid BCD digits. For these the chip holds every output LOW, so no output is selected. That makes an out of range code easy to detect.',
        ],
      },
      {
        title: 'Where It Helps',
        list: [
          'Selecting one of ten lines from a 4 bit control value.',
          'Driving digit selection or indicator logic.',
          'Turning a binary coded state into simple one hot control signals.',
        ],
        note: 'For binary to octal use, drive A, B and C and tie D LOW: outputs Q0 through Q7 form a 3 to 8 decoder, while Q8 and Q9 stay LOW.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Q4',  type: 'output' },
      { pin:  2, name: 'Q2',  type: 'output' },
      { pin:  3, name: 'Q0',  type: 'output' },
      { pin:  4, name: 'Q7',  type: 'output' },
      { pin:  5, name: 'Q9',  type: 'output' },
      { pin:  6, name: 'Q5',  type: 'output' },
      { pin:  7, name: 'Q6',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Q8',  type: 'output' },
      { pin: 10, name: 'A',   type: 'input'  },
      { pin: 11, name: 'D',   type: 'input'  },
      { pin: 12, name: 'C',   type: 'input'  },
      { pin: 13, name: 'B',   type: 'input'  },
      { pin: 14, name: 'Q1',  type: 'output' },
      { pin: 15, name: 'Q3',  type: 'output' },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      // BCD_DECIMAL_HI: active-HIGH 1-of-10 decoder. inputs [A,B,C,D] in weight
      // order (A=LSB, D=MSB), outputs [Q0..Q9]. Selected output HIGH, others
      // LOW; codes 10-15 -> all LOW. (js/specificChipsSim.js _evaluateBCDDecimalHi)
      { type: 'BCD_DECIMAL_HI', inputs: ['A','B','C','D'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
    ],
  },

  // 74x4040: 12-stage binary ripple counter (16-pin)
  // Twelve flip-flop chain; all stages Q1–Q12 brought out; counts on the
  // FALLING (high-to-low) clock edge; active-HIGH async clear (CLR/MR).
  // Reuses the generic COUNTER_BIN_RIPPLE engine primitive (shared with the
  // CD4020/CD4024/CD4040), inputs [CLK, MR], wrap at 2^12 = 4096.
  //
  // Source: Texas Instruments, "SNx4HC4040 12-Bit Asynchronous Binary
  //   Counters", SCLS160E (Dec. 1982, rev. March 2022).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74hc4040.pdf.
  //   Verified: pin configuration (16-pin DIP top view, p.3) + functional block
  //   diagram mapping stage letters QA..QL to pin numbers (p.1) + Description
  //   ("count advanced on a high-to-low transition at CLK"; "high level at CLR
  //   asynchronously clears the counter and resets all outputs low"), read as
  //   rendered PDF page images (per issues.md C4, not the text summarizer).
  // The hand-entered stub pinout was WRONG on pins 10-15 (CLK/MR swapped and
  // Q8-Q11 scrambled); corrected per the datasheet (issues.md C2 / CD4082
  // lesson). Verified map: 1=Q12(QL) 2=Q6(QF) 3=Q5(QE) 4=Q7(QG) 5=Q4(QD)
  // 6=Q3(QC) 7=Q2(QB) 8=GND 9=Q1(QA) 10=CLK 11=CLR(MR) 12=Q9(QI) 13=Q8(QH)
  // 14=Q10(QJ) 15=Q11(QK) 16=VCC. (This coincides with the CD4040B map, but was
  // confirmed against the 'HC4040's own datasheet, not cloned.)
  '74x4040': {
    name: '74x4040',
    simpleName: '12-Stage Binary Ripple Counter',
    description: '12-stage binary ripple counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc4040.pdf',
    tags: ['counter', 'binary', '12-stage', 'ripple'],
    guideOverview: 'The 74x4040 is a 12 stage binary ripple counter that divides a clock by successive powers of two. Each internal flip-flop toggles at half the rate of the one before it, and the counter advances one count on the falling (high-to-low) edge of each clock pulse. A HIGH level on MR clears every stage to zero asynchronously. All twelve stages Q1 (divide-by-2) through Q12 (divide-by-4096) are brought out, so one input clock can produce many slower timing signals at once. It is a practical building block for time delays, clock division, and simple event counting.',
    guidePinDescriptions: {
      'Q12': 'Counter output stage 12, one of the slowest divided outputs.',
      'Q6': 'Counter output stage 6.',
      'Q5': 'Counter output stage 5.',
      'Q7': 'Counter output stage 7.',
      'Q4': 'Counter output stage 4.',
      'Q3': 'Counter output stage 3.',
      'Q2': 'Counter output stage 2.',
      'GND': 'Ground reference for the counter.',
      'Q1': 'Counter output stage 1, one of the fastest divided outputs.',
      'MR': 'Master reset. A HIGH level clears the entire counter to zero immediately, regardless of the clock. Hold LOW for normal counting.',
      'CLK': 'Clock input. The counter advances one count on each falling (high-to-low) edge.',
      'Q11': 'Counter output stage 11.',
      'Q10': 'Counter output stage 10.',
      'Q9': 'Counter output stage 9.',
      'Q8': 'Counter output stage 8.',
      'VCC': 'Positive supply for the chip.',
    },
    guideSections: [
      {
        title: 'Frequency Division',
        paragraphs: [
          'Each counter stage toggles at half the frequency of the stage before it. That means the outputs naturally provide a family of divided clocks derived from one input source.',
        ],
        formulas: [
          'Qn frequency = clock frequency / 2^n',
        ],
      },
      {
        title: 'When Ripple Counters Fit Best',
        paragraphs: [
          'Ripple counters are simple and compact, which makes them attractive for timing and division work. They are best used where small propagation differences between stages are acceptable.',
        ],
        note: '74Sim updates all 12 stages together in one solve, so the real chip\'s stage-to-stage ripple delay (and the brief invalid intermediate counts right after a clock edge) is not reproduced — the settled count is correct (see issues.md A1/D6).',
      },
    ],
    pinout: [
      { pin:  1, name: 'Q12', type: 'output' },
      { pin:  2, name: 'Q6',  type: 'output' },
      { pin:  3, name: 'Q5',  type: 'output' },
      { pin:  4, name: 'Q7',  type: 'output' },
      { pin:  5, name: 'Q4',  type: 'output' },
      { pin:  6, name: 'Q3',  type: 'output' },
      { pin:  7, name: 'Q2',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Q1',  type: 'output' },
      { pin: 10, name: 'CLK', type: 'input'  },
      { pin: 11, name: 'MR',  type: 'input'  },
      { pin: 12, name: 'Q9',  type: 'output' },
      { pin: 13, name: 'Q8',  type: 'output' },
      { pin: 14, name: 'Q10', type: 'output' },
      { pin: 15, name: 'Q11', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_RIPPLE',
        inputs: ['CLK', 'MR'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12'] },
    ],
  },

  // 74x4049: Hex inverting buffer/converter (16-pin, NON STANDARD power pins)
  // CD74x4049 VCC at pin 1 (not 16!), GND at pin 8; 6 independent NOT gates
  // Note: pins 14 and 16 are NC in the standard DIP package
  '74x4049': {
    name: '74x4049',
    simpleName: 'Hex Inverting Buffer',
    description: 'Hex inverting buffer/converter (non standard: VCC=pin1, GND=pin8) (16-pin)',
    pins: 16, vcc: 1, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4049.pdf',
    tags: ['NOT', 'hex', 'inverter', 'buffer'],
    guideOverview: 'The 74x4049 contains six independent inverting buffers. Each section outputs the opposite logic level of its input, and the family is often used both for inversion and for buffering weak signals. This part is also notable because its DIP power pins are not in the usual 14-or-16-pin logic locations, so the pinout deserves extra care when breadboarding.',
    guidePinDescriptions: {
      'VCC': 'Positive supply. This device uses the unusual 4049/4050 power arrangement with VCC on pin 1.',
      'A1': 'Input of inverter 1.',
      'Y1': 'Output of inverter 1. It is the logical inverse of A1.',
      'A2': 'Input of inverter 2.',
      'Y2': 'Output of inverter 2.',
      'A3': 'Input of inverter 3.',
      'Y3': 'Output of inverter 3.',
      'GND': 'Ground reference on pin 8, also part of the unusual 4049/4050 pinout.',
      'Y4': 'Output of inverter 4.',
      'A4': 'Input of inverter 4.',
      'Y5': 'Output of inverter 5.',
      'A5': 'Input of inverter 5.',
      'Y6': 'Output of inverter 6.',
      'NC': 'No internal connection. Leave unconnected.',
      'A6': 'Input of inverter 6.',
      'NC2': 'No internal connection. Leave unconnected.',
    },
    guideSections: [
      {
        title: 'Inversion and Buffering',
        paragraphs: [
          'Each section acts like a NOT gate with some buffering ability. That makes the chip useful for logic inversion, waveform cleanup, or creating complementary control signals.',
        ],
      },
      {
        title: 'Non Standard Power Pins',
        paragraphs: [
          'Unlike many 16-pin logic chips, this family puts VCC on pin 1 and GND on pin 8. That is an easy source of wiring mistakes if you assume the usual VCC at-the-end convention.',
        ],
      },
    ],
    // Standard CD4049 DIP: inputs on 3,5,7,9,11,14; outputs on 2,4,6,10,12,15;
    // NC on 13 & 16. VCC=pin1, GND=pin8 (the unusual 4049/4050 power pins).
    pinout: [
      { pin:  1, name: 'VCC', type: 'power'  },
      { pin:  2, name: 'Y1',  type: 'output' },
      { pin:  3, name: 'A1',  type: 'input'  },
      { pin:  4, name: 'Y2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'Y3',  type: 'output' },
      { pin:  7, name: 'A3',  type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'A4',  type: 'input'  },
      { pin: 10, name: 'Y4',  type: 'output' },
      { pin: 11, name: 'A5',  type: 'input'  },
      { pin: 12, name: 'Y5',  type: 'output' },
      { pin: 13, name: 'NC',  type: 'nc'     },
      { pin: 14, name: 'A6',  type: 'input'  },
      { pin: 15, name: 'Y6',  type: 'output' },
      { pin: 16, name: 'NC2', type: 'nc'     },
    ],
    gates: [
      { type: 'NOT', inputs: ['A1'], output: 'Y1' },
      { type: 'NOT', inputs: ['A2'], output: 'Y2' },
      { type: 'NOT', inputs: ['A3'], output: 'Y3' },
      { type: 'NOT', inputs: ['A4'], output: 'Y4' },
      { type: 'NOT', inputs: ['A5'], output: 'Y5' },
      { type: 'NOT', inputs: ['A6'], output: 'Y6' },
    ],
  },

  // 74x4050: Hex non inverting buffer/converter (16-pin, NON STANDARD power pins)
  // CD74x4050 VCC at pin 1 (not 16!), GND at pin 8; 6 independent BUFFER gates
  // Same pinout as 74x4049 but non inverting
  '74x4050': {
    name: '74x4050',
    simpleName: 'Hex Non Inverting Buffer',
    description: 'Hex buffer/converter, non-inverting (non std: VCC=pin1, GND=pin8) (16-pin)',
    pins: 16, vcc: 1, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4050.pdf',
    tags: ['BUFFER', 'hex', 'non inverting', 'buffer'],
    guideOverview: 'The 74x4050 provides six independent non inverting buffer stages. Each output follows its input, but with the buffering benefits of a dedicated driver stage. It is often used to isolate one logic stage from another, improve fan out, or adapt signals in systems that need the unusual 4049/4050 pinout family.',
    guidePinDescriptions: {
      'VCC': 'Positive supply on pin 1. This is the non standard 4049/4050 family power arrangement.',
      'A1': 'Input of buffer 1.',
      'Y1': 'Output of buffer 1. It follows A1 without inversion.',
      'A2': 'Input of buffer 2.',
      'Y2': 'Output of buffer 2.',
      'A3': 'Input of buffer 3.',
      'Y3': 'Output of buffer 3.',
      'GND': 'Ground reference on pin 8.',
      'Y4': 'Output of buffer 4.',
      'A4': 'Input of buffer 4.',
      'Y5': 'Output of buffer 5.',
      'A5': 'Input of buffer 5.',
      'Y6': 'Output of buffer 6.',
      'NC': 'No internal connection. Leave unconnected.',
      'A6': 'Input of buffer 6.',
      'NC2': 'No internal connection. Leave unconnected.',
    },
    guideSections: [
      {
        title: 'Why Use a Buffer',
        paragraphs: [
          'A buffer reproduces the same logic state at its output, but it can isolate loading and provide cleaner drive to the next stage. This is helpful when one source must feed several destinations.',
        ],
      },
      {
        title: 'Pinout Reminder',
        paragraphs: [
          'Like the 4049, the 4050 does not use the common VCC at-the-last pin layout. Double check power wiring before inserting the chip into a breadboard design.',
        ],
      },
    ],
    // Standard CD4050 DIP (pin-compatible with the 4049): inputs on 3,5,7,9,11,14;
    // outputs on 2,4,6,10,12,15; NC on 13 & 16. VCC=pin1, GND=pin8.
    pinout: [
      { pin:  1, name: 'VCC', type: 'power'  },
      { pin:  2, name: 'Y1',  type: 'output' },
      { pin:  3, name: 'A1',  type: 'input'  },
      { pin:  4, name: 'Y2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'Y3',  type: 'output' },
      { pin:  7, name: 'A3',  type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'A4',  type: 'input'  },
      { pin: 10, name: 'Y4',  type: 'output' },
      { pin: 11, name: 'A5',  type: 'input'  },
      { pin: 12, name: 'Y5',  type: 'output' },
      { pin: 13, name: 'NC',  type: 'nc'     },
      { pin: 14, name: 'A6',  type: 'input'  },
      { pin: 15, name: 'Y6',  type: 'output' },
      { pin: 16, name: 'NC2', type: 'nc'     },
    ],
    gates: [
      { type: 'BUFFER', inputs: ['A1'], output: 'Y1' },
      { type: 'BUFFER', inputs: ['A2'], output: 'Y2' },
      { type: 'BUFFER', inputs: ['A3'], output: 'Y3' },
      { type: 'BUFFER', inputs: ['A4'], output: 'Y4' },
      { type: 'BUFFER', inputs: ['A5'], output: 'Y5' },
      { type: 'BUFFER', inputs: ['A6'], output: 'Y6' },
    ],
  },

  // 74x4051: Single 8-channel analog multiplexer/demultiplexer (16-pin)
  // CD74x4051 analog mux; VEE (neg supply) at pin 7; Y0-Y7 are bidirectional analog I/O pins
  '74x4051': {
    name: '74x4051',
    simpleName: '8-Channel Analog Multiplexer/Demultiplexer',
    description: 'High speed 8-channel analog multiplexer / demultiplexer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4051.pdf',
    tags: ['analog', 'mux', 'demux', '8-channel', 'bidir'],
    guideOverview: 'The 74x4051 is an 8-channel analog multiplexer/demultiplexer. It connects one common node to one of eight channel pins based on a 3 bit select code, and because the switch path is bilateral it can route analog or digital signals in either direction. This makes it useful for sensor selection, audio switching, and simple data acquisition experiments.',
    guidePinDescriptions: {
      'Z': 'Common analog switch node. It connects to one selected Y channel when the part is enabled.',
      'Y1': 'Channel 1 analog I/O node.',
      'Y6': 'Channel 6 analog I/O node.',
      'Y2': 'Channel 2 analog I/O node.',
      'Y5': 'Channel 5 analog I/O node.',
      'Y3': 'Channel 3 analog I/O node.',
      'VEE': 'Negative analog supply or analog lower rail reference. This allows the part to handle signals below ground in suitable configurations.',
      'GND': 'Ground reference for the logic and analog supply scheme.',
      'Y4': 'Channel 4 analog I/O node.',
      'Y7': 'Channel 7 analog I/O node.',
      'Y0': 'Channel 0 analog I/O node.',
      'C': 'Most significant select input bit.',
      'B': 'Middle select input bit.',
      'A': 'Least significant select input bit.',
      'INH': 'Inhibit control. Use it to disconnect all channels from Z when the mux should be off.',
      'VCC': 'Positive supply for the switch control circuitry.',
    },
    guideSections: [
      {
        title: 'Select Logic',
        paragraphs: [
          'The A, B, and C inputs form a 3 bit address that chooses which one of the eight channels connects to Z. Only one channel is selected at a time.',
        ],
      },
      {
        title: 'Analog Routing',
        paragraphs: [
          'Unlike ordinary digital multiplexers, the 4051 is designed to pass analog voltages as well as digital logic. The VEE pin extends the allowed signal range in circuits that need a negative analog rail.',
        ],
        note: '74Sim models the channel as a passive resistive coupling: when INH is LOW, the channel selected by (C,B,A) is connected to Z through the chip\'s on-resistance (~125 Ω); all other channels are isolated. Analog voltages between the rails pass through realistically (with a small divider drop set by the on-resistance and the surrounding load). VEE-driven below-ground operation, distortion, and bandwidth are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Z',   type: 'bidir'  },
      { pin:  2, name: 'Y1',  type: 'bidir'  },
      { pin:  3, name: 'Y6',  type: 'bidir'  },
      { pin:  4, name: 'Y2',  type: 'bidir'  },
      { pin:  5, name: 'Y5',  type: 'bidir'  },
      { pin:  6, name: 'Y3',  type: 'bidir'  },
      { pin:  7, name: 'VEE', type: 'power'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Y4',  type: 'bidir'  },
      { pin: 10, name: 'Y7',  type: 'bidir'  },
      { pin: 11, name: 'Y0',  type: 'bidir'  },
      { pin: 12, name: 'C',   type: 'input'  },
      { pin: 13, name: 'B',   type: 'input'  },
      { pin: 14, name: 'A',   type: 'input'  },
      { pin: 15, name: 'INH', type: 'input'  },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'ANALOG_MUX_8', inputs: ['A','B','C','INH'], outputs: [] },
    ],
  },

  // 74x4052: Dual 4-channel analog multiplexer/demultiplexer (16-pin)
  // CD74x4052 dual analog mux; VEE at pin 7; each mux has 4 I/O channels + common Z
  '74x4052': {
    name: '74x4052',
    simpleName: 'Dual 4-Channel Analog Multiplexer/Demultiplexer',
    description: 'Dual 4-channel analog multiplexer / demultiplexer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4052.pdf',
    tags: ['analog', 'mux', 'demux', 'dual', '4-channel', 'bidir'],
    guideOverview: 'The 74x4052 is a dual 4-channel analog multiplexer/demultiplexer. It contains two separate 4-channel switch sections that share the same 2 bit select code and inhibit input, so two related signals can be routed together. That makes it useful for stereo audio switching, paired sensor channels, or two bit data paths.',
    guidePinDescriptions: {
      'XZ': 'Common node for the X-channel multiplexer section.',
      'X3': 'Channel 3 of the X section.',
      'X1': 'Channel 1 of the X section.',
      'X0': 'Channel 0 of the X section.',
      'X2': 'Channel 2 of the X section.',
      'YZ': 'Common node for the Y-channel multiplexer section.',
      'VEE': 'Negative analog supply or analog lower rail reference.',
      'GND': 'Ground reference for the chip.',
      'Y2': 'Channel 2 of the Y section.',
      'Y0': 'Channel 0 of the Y section.',
      'Y1': 'Channel 1 of the Y section.',
      'Y3': 'Channel 3 of the Y section.',
      'B': 'Most significant select input bit shared by both sections.',
      'A': 'Least significant select input bit shared by both sections.',
      'INH': 'Inhibit control that disconnects both sections when asserted.',
      'VCC': 'Positive supply for the control circuitry.',
    },
    guideSections: [
      {
        title: 'Two Sections, One Address',
        paragraphs: [
          'Both the X and Y sections use the same select inputs, so they switch corresponding channels together. That is useful when two related signals should always be routed in parallel.',
        ],
      },
      {
        title: 'Analog Multiplexing',
        paragraphs: [
          'Because the paths are bilateral analog switches, the part can be used with analog or digital signals within the allowed voltage rails. The VEE pin allows more flexible analog signal ranges than a single supply logic mux.',
        ],
        note: '74Sim models both sections as passive resistive couplings: when INH is LOW, XZ↔X(n) and YZ↔Y(n) where n = (B,A) are each connected through the chip\'s on-resistance (~125 Ω); all other channels are isolated. Analog voltages between the rails pass through realistically. VEE-driven below-ground operation, distortion, and bandwidth are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'XZ',  type: 'bidir'  },
      { pin:  2, name: 'X3',  type: 'bidir'  },
      { pin:  3, name: 'X1',  type: 'bidir'  },
      { pin:  4, name: 'X0',  type: 'bidir'  },
      { pin:  5, name: 'X2',  type: 'bidir'  },
      { pin:  6, name: 'YZ',  type: 'bidir'  },
      { pin:  7, name: 'VEE', type: 'power'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Y2',  type: 'bidir'  },
      { pin: 10, name: 'Y0',  type: 'bidir'  },
      { pin: 11, name: 'Y1',  type: 'bidir'  },
      { pin: 12, name: 'Y3',  type: 'bidir'  },
      { pin: 13, name: 'B',   type: 'input'  },
      { pin: 14, name: 'A',   type: 'input'  },
      { pin: 15, name: 'INH', type: 'input'  },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'ANALOG_MUX_DUAL4', inputs: ['A','B','INH'], outputs: [] },
    ],
  },

  // 74x4053: Triple 2-channel analog multiplexer/demultiplexer (16-pin)
  // CD74x4053 three independent SPDT analog switches; VEE at pin 7
  '74x4053': {
    name: '74x4053',
    simpleName: 'Triple 2-Channel Analog Multiplexer/Demultiplexer',
    description: 'Triple 2-channel analog multiplexer / demultiplexer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4053.pdf',
    tags: ['analog', 'mux', 'demux', 'triple', '2-channel', 'bidir'],
    guideOverview: 'The 74x4053 contains three independent 2-channel analog switch sections. Each section behaves like a digitally controlled SPDT switch, and the three select lines let each section choose between its 0 and 1 path independently. It is a versatile part for audio routing, sensor selection, and control circuits that need multiple analog channels switched at once.',
    guidePinDescriptions: {
      'ZB': 'Common node for section B.',
      'ZA': 'Common node for section A.',
      'ZC': 'Common node for section C.',
      'Y0A': 'Channel 0 node for section A.',
      'Y0B': 'Channel 0 node for section B.',
      'Y0C': 'Channel 0 node for section C.',
      'VEE': 'Negative analog supply or analog lower rail reference.',
      'GND': 'Ground reference for the device.',
      'Y1C': 'Channel 1 node for section C.',
      'Y1B': 'Channel 1 node for section B.',
      'Y1A': 'Channel 1 node for section A.',
      'C': 'Select control for section C.',
      'B': 'Select control for section B.',
      'A': 'Select control for section A.',
      'INH': 'Global inhibit control that disconnects all three sections when asserted.',
      'VCC': 'Positive supply for the control circuitry.',
    },
    guideSections: [
      {
        title: 'Three SPDT Switches',
        paragraphs: [
          'Each section connects its common Z node to either the 0 channel or the 1 channel. Unlike the 4051 or 4052, the three sections do not share one address; each has its own select input.',
        ],
      },
      {
        title: 'Flexible Analog Routing',
        paragraphs: [
          'This device is useful when several analog or low frequency digital paths need independent switching under one global enable. It can replace small relay arrangements in many low power designs.',
        ],
        note: '74Sim models each section as a passive resistive coupling: when INH is LOW, each section connects its common Z to Y0 (select=0) or Y1 (select=1) through the chip\'s on-resistance (~125 Ω). The three sections switch independently. Analog voltages between the rails pass through realistically. VEE-driven below-ground operation, distortion, and bandwidth are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'ZB',  type: 'bidir'  },
      { pin:  2, name: 'ZA',  type: 'bidir'  },
      { pin:  3, name: 'ZC',  type: 'bidir'  },
      { pin:  4, name: 'Y0A', type: 'bidir'  },
      { pin:  5, name: 'Y0B', type: 'bidir'  },
      { pin:  6, name: 'Y0C', type: 'bidir'  },
      { pin:  7, name: 'VEE', type: 'power'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Y1C', type: 'bidir'  },
      { pin: 10, name: 'Y1B', type: 'bidir'  },
      { pin: 11, name: 'Y1A', type: 'bidir'  },
      { pin: 12, name: 'C',   type: 'input'  },
      { pin: 13, name: 'B',   type: 'input'  },
      { pin: 14, name: 'A',   type: 'input'  },
      { pin: 15, name: 'INH', type: 'input'  },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'ANALOG_MUX_TRIPLE2', inputs: ['A','B','C','INH'], outputs: [] },
    ],
  },

};
