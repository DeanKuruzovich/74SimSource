// Chip definitions block 8
// Auto-generated from chips.js
//
// Review notes for this block:
// - This block is mostly medium-complexity AO/AOI combinational TTL, plus two
//   divider parts and one AND gated JK storage device.
// - Parts with exposed expansion pins or expander outputs are modeled for their
//   base Boolean function, but multi package expansion chaining is not solved.
// - 7449 blanking behavior is represented through BI, while invalid BCD codes
//   follow the generic decoder table instead of device-specific lamp nuances.
// - 7456 and 7457 are treated as functional edge-count dividers; exact output
//   phase, duty cycle shape, and startup waveform details are simplified.
// - Open collector and current sensing electrical characteristics are only
//   modeled at logic level, not as analog current or voltage behavior.

export const CHIPS_BLOCK_8 = {
  // ── 74x49: BCD to 7 segment decoder/driver (open collector) ──────────────
  /* Primary source: Texas Instruments, SN74LS49 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls49.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector
     Decoder/demultiplexer concept: https://en.wikipedia.org/wiki/Multiplexer */
  // BCD inputs A-D are decoded into seven active LOW segment outputs intended
  // for a common anode display. Because the outputs are open collector, a HIGH
  // in the simulation means the segment line is released rather than driven up.
  // BI is honored as a whole-digit active LOW blanking request.
  '74x49': {
    name: '74x49',
    simpleName: 'BCD to 7-Seg (OC)',
    description: 'BCD to 7 segment decoder/driver (open collector) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls49.pdf',
    tags: ['7 segment', '7 seg', 'decoder', 'driver', 'bcd', 'display', 'open collector'],
    guideOverview: 'The 74x49 converts a 4 bit BCD input into seven active LOW segment outputs for a common anode display. Its outputs are open collector, so active segments pull low while inactive segments simply release the line, and BI can blank the whole digit at once.',
    guidePinDescriptions: {
      BI: 'Active LOW blanking input. Pull it LOW to blank the display regardless of the BCD code.',
      A: 'Least significant BCD input bit (weight 1).',
      B: 'Second BCD input bit (weight 2).',
      C: 'Third BCD input bit (weight 4).',
      D: 'Most significant BCD input bit (weight 8).',
      a: 'Segment a output (top horizontal bar), open collector, active LOW.',
      b: 'Segment b output (upper right vertical bar), active LOW.',
      c: 'Segment c output (lower right vertical bar), active LOW.',
      d: 'Segment d output (bottom horizontal bar), active LOW.',
      e: 'Segment e output (lower left vertical bar), active LOW.',
      f: 'Segment f output (upper left vertical bar), active LOW.',
      g: 'Segment g output (middle horizontal bar), active LOW.',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'BCD to 7 Segment (Common Anode)',
        paragraphs: [
          'The 74x49 drives a common anode 7 segment LED display. Active LOW open collector outputs sink current through each segment to ground. Drive BI# LOW to blank the display, HIGH for normal BCD decoding. For common cathode displays, use the 74x48 instead, which provides active HIGH push pull outputs.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'B',   type: 'input' },
      { pin: 2,  name: 'C',   type: 'input' },
      { pin: 3,  name: 'BI',  type: 'input' },
      { pin: 4,  name: 'D',   type: 'input' },
      { pin: 5,  name: 'A',   type: 'input' },
      { pin: 6,  name: 'e',   type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: 'd',   type: 'output' },
      { pin: 9,  name: 'c',   type: 'output' },
      { pin: 10, name: 'b',   type: 'output' },
      { pin: 11, name: 'a',   type: 'output' },
      { pin: 12, name: 'g',   type: 'output' },
      { pin: 13, name: 'f',   type: 'output' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'BCD_7SEG', inputs: ['A', 'B', 'C', 'D'], outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
    ],
  },

  // ── 74x50: Dual 2-wide 2 input AND OR Invert (one gate expandable) ───────
  /* Primary source: Texas Instruments, SN7450 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7450.pdf */
  // Each section implements the base AOI function NOT((A&B)|(C&D)). The X pins
  // on the package exist for real world expansion schemes; 74Sim keeps the
  // standalone truth table but does not simulate multi package X-pin chaining.
  '74x50': {
    name: '74x50',
    simpleName: 'Dual AOI 2-wide',
    description: 'Dual 2-wide 2 input AND OR INVERT gate (one gate expandable) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7450.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic', 'dual'],
    guideOverview: 'The 74x50 contains two 2-wide AOI gates, each performing NOT((A&B)|(C&D)). Real parts expose X expansion pins so you can widen one section with external expander parts, but 74Sim models the ordinary 4 input AOI behavior only.',
    guidePinDescriptions: {
      '1X': 'Expansion connection for gate 1 in hardware. It is present in the package but not separately modeled for chained expansion in 74Sim.',
      '2X': 'Expansion connection for gate 2 in hardware. 74Sim keeps the base AOI truth table and does not solve external X-pin expansion.',
      '1A': 'Input A for AND group 1A of gate 1.',
      '1B': 'Input B for AND group 1A of gate 1.',
      '1C': 'Input A for AND group 1B of gate 1.',
      '1D': 'Input B for AND group 1B of gate 1.',
      '1Y': 'AOI output for gate 1: NOT((1A&1B)|(1C&1D)).',
      '2A': 'Input A for AND group 2A of gate 2.',
      '2B': 'Input B for AND group 2A of gate 2.',
      '2C': 'Input A for AND group 2B of gate 2.',
      '2D': 'Input B for AND group 2B of gate 2.',
      '2Y': 'AOI output for gate 2: NOT((2A&2B)|(2C&2D)).',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'AND OR INVERT (2-wide 2 input)',
        paragraphs: ['Each gate output is LOW when any one 2 input AND group is fully asserted. Y = NOT((A&B)|(C&D)).'],
        formulas: ['Y = NOT((1A·1B)|(1C·1D))'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: '1X',  type: 'input' },
      { pin: 4,  name: '1C',  type: 'input' },
      { pin: 5,  name: '1D',  type: 'input' },
      { pin: 6,  name: '1Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '2Y',  type: 'output' },
      { pin: 9,  name: '2C',  type: 'input' },
      { pin: 10, name: '2D',  type: 'input' },
      { pin: 11, name: '2X',  type: 'input' },
      { pin: 12, name: '2A',  type: 'input' },
      { pin: 13, name: '2B',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'AOI_2WIDE', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'AOI_2WIDE', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },

  // ── 74x52: 3-2-2-2 input AND OR gate (expandable with 74x61) ─────────────
  /* Primary source: Texas Instruments, SN74H52 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74h52.pdf */
  // This gate outputs the OR of one 3 input product term and three 2 input
  // product terms. The package also exposes X for expansion in hardware, but
  // the simulator models the direct standalone AO truth table only.
  '74x52': {
    name: '74x52',
    simpleName: '3-2-2-2 AND OR',
    description: '3-2-2-2 input AND OR gate, expandable with 74x61 (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74h52.pdf',
    tags: ['ao', 'and or', 'gate', 'logic', 'expandable'],
    guideOverview: 'The 74x52 forms Y = (A1&A2&A3) OR (B1&B2) OR (C1&C2) OR (D1&D2). In hardware it can be widened with a 74x61-style expander through the X connection; 74Sim models the direct 3-2-2-2 AND OR behavior and documents the expansion feature as a caveat.',
    guidePinDescriptions: {
      X: 'Expansion connection used when widening the part with external expander hardware. It is not separately simulated here.',
      A1: 'Input A1 of the 3 input AND group.',
      A2: 'Input A2 of the 3 input AND group.',
      A3: 'Input A3 of the 3 input AND group.',
      B1: 'Input B1 of the first 2 input AND group.',
      B2: 'Input B2 of the first 2 input AND group.',
      C1: 'Input C1 of the second 2 input AND group.',
      C2: 'Input C2 of the second 2 input AND group.',
      D1: 'Input D1 of the third 2 input AND group.',
      D2: 'Input D2 of the third 2 input AND group.',
      Y: 'AND OR output: HIGH when any AND group is fully asserted.',
      'NC1': 'No connection.',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: '3-2-2-2 AND OR Logic',
        paragraphs: ['Y is HIGH when the 3 input term or any 2 input term is satisfied: Y = (A1·A2·A3)+(B1·B2)+(C1·C2)+(D1·D2).'],
        formulas: ['Y = (A1·A2·A3)|(B1·B2)|(C1·C2)|(D1·D2)'],
      },
    ],
    pinout: [
      { pin: 1,  name: 'A1',  type: 'input' },
      { pin: 2,  name: 'B1',  type: 'input' },
      { pin: 3,  name: 'C1',  type: 'input' },
      { pin: 4,  name: 'D1',  type: 'input' },
      { pin: 5,  name: 'D2',  type: 'input' },
      { pin: 6,  name: 'C2',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: 'Y',   type: 'output' },
      { pin: 9,  name: 'B2',  type: 'input' },
      { pin: 10, name: 'A2',  type: 'input' },
      { pin: 11, name: 'X',   type: 'input' },
      { pin: 12, name: 'A3',  type: 'input' },
      { pin: 13, name: 'NC1', type: 'nc' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    // AO_3222: Y = (A1&A2&A3)|(B1&B2)|(C1&C2)|(D1&D2)
    gates: [
      { type: 'AO_3222', inputs: ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'], output: 'Y' },
    ],
  },

  // ── 74H53: 3-2-2-2 input AND OR Invert gate (expandable) ─────────────────
  /* Primary source: Texas Instruments, SN74H53 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74h53.pdf */
  // Functionally this is the inverted companion to the 7452. Its expansion pin
  // is documented but not solved as a multi package network in the simulator.
  '74x53': {
    name: '74x53',
    simpleName: '3-2-2-2 AOI',
    description: '3-2-2-2 input AND OR INVERT gate, expandable (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74h53.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic', 'expandable'],
    guideOverview: 'The 74x53 produces the inverted form of the 74x52 logic: NOT((A1&A2&A3) OR (B1&B2) OR (C1&C2) OR (D1&D2)). The real package supports expansion through X, but 74Sim keeps the direct AOI behavior and notes external expansion as unsupported.',
    guidePinDescriptions: {
      X: 'Expansion connection for widening the logic function with another package in hardware. 74Sim does not propagate logic through that expansion path.',
      A1: 'Input A1 of the 3 input AND group.',
      A2: 'Input A2 of the 3 input AND group.',
      A3: 'Input A3 of the 3 input AND group.',
      B1: 'Input B1 of the first 2 input AND group.',
      B2: 'Input B2 of the first 2 input AND group.',
      C1: 'Input C1 of the second 2 input AND group.',
      C2: 'Input C2 of the second 2 input AND group.',
      D1: 'Input D1 of the third 2 input AND group.',
      D2: 'Input D2 of the third 2 input AND group.',
      Y: 'AOI output: LOW when any AND group is fully asserted.',
      'NC1': 'No connection.',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: '3-2-2-2 AND OR INVERT Logic',
        paragraphs: ['Y is LOW when the 3 input term or any 2 input term is satisfied. Y = NOT((A1·A2·A3)+(B1·B2)+(C1·C2)+(D1·D2)).'],
        formulas: ['Y = NOT((A1·A2·A3)|(B1·B2)|(C1·C2)|(D1·D2))'],
      },
    ],
    pinout: [
      { pin: 1,  name: 'A1',  type: 'input' },
      { pin: 2,  name: 'B1',  type: 'input' },
      { pin: 3,  name: 'C1',  type: 'input' },
      { pin: 4,  name: 'D1',  type: 'input' },
      { pin: 5,  name: 'D2',  type: 'input' },
      { pin: 6,  name: 'C2',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: 'Y',   type: 'output' },
      { pin: 9,  name: 'B2',  type: 'input' },
      { pin: 10, name: 'A2',  type: 'input' },
      { pin: 11, name: 'X',   type: 'input' },
      { pin: 12, name: 'A3',  type: 'input' },
      { pin: 13, name: 'NC1', type: 'nc' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    // AOI_3222: Y = NOT((A1&A2&A3)|(B1&B2)|(C1&C2)|(D1&D2))
    gates: [
      { type: 'AOI_3222', inputs: ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'], output: 'Y' },
    ],
  },

  // ── 74x55: 2-wide 4 input AND OR INVERT gate ─────────────────────────────
  /* Primary source: Texas Instruments, SN74LS55 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls55.pdf */
  // Two 4 input AND sections feed a NOR to produce a single inverted output.
  // Pins 5, 6, and 9 are not connected (NC).
  '74x55': {
    name: '74x55',
    simpleName: '2-Wide 4 Input AND OR INVERT',
    description: '2-wide 4 input AND OR INVERT gate. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls55.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic'],
    guideOverview: 'The 74x55 is a single 2-wide 4 input AND OR INVERT gate. Two 4 input AND sections (inputs on pins 1-4 and 10-13) feed a NOR to produce output Y at pin 8. Y goes LOW when all four inputs of either AND section are HIGH. Three pins (5, 6, 9) are not connected.',
    guidePinDescriptions: {
      '1A':  'Input A of the first 4 input AND section.',
      '1B':  'Input B of the first 4 input AND section.',
      '1C':  'Input C of the first 4 input AND section.',
      '1D':  'Input D of the first 4 input AND section.',
      NC1:   'Not connected (pin 5). Leave unconnected.',
      NC2:   'Not connected (pin 6). Leave unconnected.',
      GND:   'Ground reference.',
      Y:     'AOI output. LOW when any 4 input AND section is fully HIGH. NOT((1A·1B·1C·1D)+(2A·2B·2C·2D)).',
      NC3:   'Not connected (pin 9). Leave unconnected.',
      '2A':  'Input A of the second 4 input AND section.',
      '2B':  'Input B of the second 4 input AND section.',
      '2C':  'Input C of the second 4 input AND section.',
      '2D':  'Input D of the second 4 input AND section.',
      VCC:   'Positive supply (+5 V TTL).',
    },
    pinout: [
      { pin:  1, name: '1A',  type: 'input',  description: 'First AND section, input A' },
      { pin:  2, name: '1B',  type: 'input',  description: 'First AND section, input B' },
      { pin:  3, name: '1C',  type: 'input',  description: 'First AND section, input C' },
      { pin:  4, name: '1D',  type: 'input',  description: 'First AND section, input D' },
      { pin:  5, name: 'NC1', type: 'nc',     description: 'Not connected' },
      { pin:  6, name: 'NC2', type: 'nc',     description: 'Not connected' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'Y',   type: 'output', description: 'AOI output: LOW when any AND section is all-HIGH' },
      { pin:  9, name: 'NC3', type: 'nc',     description: 'Not connected' },
      { pin: 10, name: '2A',  type: 'input',  description: 'Second AND section, input A' },
      { pin: 11, name: '2B',  type: 'input',  description: 'Second AND section, input B' },
      { pin: 12, name: '2C',  type: 'input',  description: 'Second AND section, input C' },
      { pin: 13, name: '2D',  type: 'input',  description: 'Second AND section, input D' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    // AOI_44: Y = NOT((1A·1B·1C·1D) OR (2A·2B·2C·2D))
    gates: [
      { type: 'AOI_44', inputs: ['1A','1B','1C','1D','2A','2B','2C','2D'], output: 'Y' },
    ],
    guideSections: [
      {
        title: 'AND OR INVERT Logic (4-4)',
        paragraphs: [
          'The 74x55 computes Y = NOT((1A·1B·1C·1D) OR (2A·2B·2C·2D)). Y goes LOW when every input in either 4 input AND section is simultaneously HIGH.',
          'Inputs for the first AND section are on pins 1-4, and inputs for the second AND section are on pins 10-13. Three pins (5, 6, 9) are not connected.',
        ],
        formulas: [
          'Y = NOT((1A·1B·1C·1D) OR (2A·2B·2C·2D))',
        ],
        note: 'Do not confuse with the 74x54, which uses a 2-3-3-2 configuration. The 74x55 has only two AND sections, each with four inputs.',
      },
    ],
  },

  // ── 74x56: 50:1 Frequency Divider ─────────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS56 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls56.pdf
     Counter (digital) concept: https://en.wikipedia.org/wiki/Counter_(digital) */
  // The simulator treats this as a functional divide by-50 stage driven from a
  // single clock input. Exact startup phase and waveform shape are simplified,
  // because the part's primary distinction in hardware is timing behavior.
  '74x56': {
    name: '74x56',
    simpleName: '÷50 Divider',
    description: '50:1 frequency divider (8-pin)',
    pins: 8,
    vcc: 8,
    gnd: 4,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls56.pdf',
    tags: ['frequency divider', 'divider', 'counter', 'sequential', 'divide by 50'],
    guideOverview: 'The 74x56 is a fixed divide by-50 timing element. In 74Sim it behaves like a functional counter-driven divider on CLK, while exact output phase and duty cycle details are simplified rather than modeled as a timing-accurate waveform source.',
    guidePinDescriptions: {
      CLK:  'Clock input. The internal counter advances on each rising edge.',
      Q:    'Divided output. Goes HIGH once per 50 input clocks.',
      NC1:  'No connection.',
      NC2:  'No connection.',
      NC3:  'No connection.',
      NC4:  'No connection.',
      GND:  'Ground reference (pin 4).',
      VCC:  'Positive supply (+5 V) at pin 8.',
    },
    guideSections: [
      {
        title: 'Timing Caveat',
        paragraphs: [
          'This part exists mainly for its timing ratio, not for a rich control interface. 74Sim therefore models the divide function itself and not the analog timing details of a specific silicon family.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'CLK', type: 'input' },
      { pin: 2, name: 'NC1', type: 'nc' },
      { pin: 3, name: 'NC2', type: 'nc' },
      { pin: 4, name: 'GND', type: 'power' },
      { pin: 5, name: 'Q',   type: 'output' },
      { pin: 6, name: 'NC3', type: 'nc' },
      { pin: 7, name: 'NC4', type: 'nc' },
      { pin: 8, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'FREQ_DIV_50', inputs: ['CLK'], outputs: ['Q'] },
    ],
    sequential: true,
  },

  // ── 74x57: 60:1 Frequency Divider ─────────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS57 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls57.pdf
     Counter (digital) concept: https://en.wikipedia.org/wiki/Counter_(digital) */
  // This is the divide by-60 companion to the 7456. As with 7456, the model is
  // intended for functional logic sequencing, not precise phase or pulse shape.
  '74x57': {
    name: '74x57',
    simpleName: '÷60 Divider',
    description: '60:1 frequency divider (8-pin)',
    pins: 8,
    vcc: 8,
    gnd: 4,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls57.pdf',
    tags: ['frequency divider', 'divider', 'counter', 'sequential', 'divide by 60'],
    guideOverview: 'The 74x57 is a fixed divide by-60 timing element. 74Sim counts clock edges to reproduce the overall divide function, but it does not promise exact real-device startup phase or duty cycle timing.',
    guidePinDescriptions: {
      CLK:  'Clock input. The internal counter advances on each rising edge.',
      Q:    'Divided output. Goes HIGH once per 60 input clocks.',
      NC1:  'No connection.',
      NC2:  'No connection.',
      NC3:  'No connection.',
      NC4:  'No connection.',
      GND:  'Ground reference (pin 4).',
      VCC:  'Positive supply (+5 V) at pin 8.',
    },
    guideSections: [
      {
        title: 'Timing Caveat',
        paragraphs: [
          'Use this model when you care that the logic sequence divides the incoming clock, not when you need family-specific pulse width or oscillator timing behavior.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'CLK', type: 'input' },
      { pin: 2, name: 'NC1', type: 'nc' },
      { pin: 3, name: 'NC2', type: 'nc' },
      { pin: 4, name: 'GND', type: 'power' },
      { pin: 5, name: 'Q',   type: 'output' },
      { pin: 6, name: 'NC3', type: 'nc' },
      { pin: 7, name: 'NC4', type: 'nc' },
      { pin: 8, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'FREQ_DIV_60', inputs: ['CLK'], outputs: ['Q'] },
    ],
    sequential: true,
  },

  // ── 74x58: Dual AND OR gate ───────────────────────────────────────────────
  /* Primary source: Texas Instruments, SN74HC58 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74hc58.pdf */
  // Gate 1 is a 2-wide 2 input AND OR: Y1 = (1A&1B)|(1C&1D)
  // Gate 2 is a 2-wide 3 input AND OR: Y2 = (2A&2B&2C)|(2D&2E&2F)
  '74x58': {
    name: '74x58',
    simpleName: 'Dual AND OR',
    description: 'Two non inverting AND OR gates. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc58.pdf',
    tags: ['ao', 'and or', 'gate', 'logic', 'dual', 'sum-of-products'],
    guideOverview: 'The 74x58 combines two different AND OR sections in one package. Gate 1 has two 2 input AND terms; Gate 2 has two 3 input AND terms. Each output goes HIGH when any one of its AND-groups is fully satisfied, making the chip handy for multi-condition detection without extra inverters.',
    guidePinDescriptions: {
      '2A':  'Input A for the first AND group of gate 2.',
      '1A':  'Input A for the first AND group of gate 1.',
      '1B':  'Input B for the first AND group of gate 1.',
      '1C':  'Input A for the second AND group of gate 1.',
      '1D':  'Input B for the second AND group of gate 1.',
      '1Y':  'Gate 1 AND OR output. HIGH when (1A·1B) or (1C·1D).',
      GND:   'Ground reference (pin 7).',
      '2Y':  'Gate 2 AND OR output. HIGH when (2A·2B·2C) or (2D·2E·2F).',
      '2D':  'Input A for the second AND group of gate 2.',
      '2E':  'Input B for the second AND group of gate 2.',
      '2F':  'Input C for the second AND group of gate 2.',
      '2B':  'Input B for the first AND group of gate 2.',
      '2C':  'Input C for the first AND group of gate 2.',
      VCC:   'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Dual AND OR',
        paragraphs: ['Gate 1: Y1=(1A·1B)|(1C·1D). Gate 2: Y2=(2A·2B·2C)|(2D·2E·2F). No inversion outputs go HIGH when any AND term is satisfied.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '2A',  type: 'input',  description: 'Gate 2 first AND group, input A' },
      { pin: 2,  name: '1A',  type: 'input',  description: 'Gate 1 first AND group, input A' },
      { pin: 3,  name: '1B',  type: 'input',  description: 'Gate 1 first AND group, input B' },
      { pin: 4,  name: '1C',  type: 'input',  description: 'Gate 1 second AND group, input A' },
      { pin: 5,  name: '1D',  type: 'input',  description: 'Gate 1 second AND group, input B' },
      { pin: 6,  name: '1Y',  type: 'output', description: 'Gate 1 output: HIGH when (1A AND 1B) OR (1C AND 1D)' },
      { pin: 7,  name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: '2Y',  type: 'output', description: 'Gate 2 output: HIGH when (2A AND 2B AND 2C) OR (2D AND 2E AND 2F)' },
      { pin: 9,  name: '2D',  type: 'input',  description: 'Gate 2 second AND group, input A' },
      { pin: 10, name: '2E',  type: 'input',  description: 'Gate 2 second AND group, input B' },
      { pin: 11, name: '2F',  type: 'input',  description: 'Gate 2 second AND group, input C' },
      { pin: 12, name: '2B',  type: 'input',  description: 'Gate 2 first AND group, input B' },
      { pin: 13, name: '2C',  type: 'input',  description: 'Gate 2 first AND group, input C' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // Gate 1: 2-wide 2 input AND OR Y = (1A&1B)|(1C&1D)
      { type: 'AO_22', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      // Gate 2: 2-wide 3 input AND OR Y = (2A&2B&2C)|(2D&2E&2F)
      { type: 'AO_33', inputs: ['2A', '2B', '2C', '2D', '2E', '2F'], output: '2Y' },
    ],
  },

  // ── 74x59: Dual 3-2 input AND OR Invert gate ─────────────────────────────
  /* Primary source: Texas Instruments, US7459A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/us7459a.pdf */
  // Each section computes NOT((A&B&C)|(D&E)), so the part is convenient for
  // small decode and inhibit terms where one product term is wider than the other.
  '74x59': {
    name: '74x59',
    simpleName: 'Dual 3-2 AOI',
    description: 'Dual 3-2 input AND OR INVERT gate (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/us7459a.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic', 'dual'],
    guideOverview: 'The 74x59 contains two AOI sections, each performing NOT((A&B&C) OR (D&E)). That asymmetry makes it handy for compact sum of products logic with one 3 input term and one 2 input term.',
    guidePinDescriptions: {
      '1A':  'Input A for the 3 input AND group of gate 1.',
      '1B':  'Input B for the 3 input AND group of gate 1.',
      '1C':  'Input C for the 3 input AND group of gate 1.',
      '1D':  'Input A for the 2 input AND group of gate 1.',
      '1E':  'Input B for the 2 input AND group of gate 1.',
      '1Y':  'Gate 1 AOI output: NOT((1A·1B·1C)|(1D·1E)).',
      GND:   'Ground reference (pin 7).',
      '2Y':  'Gate 2 AOI output: NOT((2A·2B·2C)|(2D·2E)).',
      '2A':  'Input A for the 3 input AND group of gate 2.',
      '2B':  'Input B for the 3 input AND group of gate 2.',
      '2C':  'Input C for the 3 input AND group of gate 2.',
      '2D':  'Input A for the 2 input AND group of gate 2.',
      '2E':  'Input B for the 2 input AND group of gate 2.',
      VCC:   'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: '3-2 AOI Logic',
        paragraphs: ['Each gate output is LOW when the 3 input group is all-HIGH, or when the 2 input group is both HIGH.'],
        formulas: ['Y = NOT((A·B·C)|(D·E))'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: '1C',  type: 'input' },
      { pin: 4,  name: '1D',  type: 'input' },
      { pin: 5,  name: '1E',  type: 'input' },
      { pin: 6,  name: '1Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '2Y',  type: 'output' },
      { pin: 9,  name: '2A',  type: 'input' },
      { pin: 10, name: '2B',  type: 'input' },
      { pin: 11, name: '2C',  type: 'input' },
      { pin: 12, name: '2D',  type: 'input' },
      { pin: 13, name: '2E',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    // AOI_32: Y = NOT((A&B&C)|(D&E))
    gates: [
      { type: 'AOI_32', inputs: ['1A', '1B', '1C', '1D', '1E'], output: '1Y' },
      { type: 'AOI_32', inputs: ['2A', '2B', '2C', '2D', '2E'], output: '2Y' },
    ],
  },

  // ── 74x60: Dual 4 input expander ──────────────────────────────────────────
  /* Primary source: Texas Instruments, SN7460 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7460.pdf */
  // Standalone, each section behaves like a 4 input AND whose output is meant
  // to feed another chip's expansion node. 74Sim preserves the AND result but
  // does not simulate the special internal analog behavior of expander chains.
  '74x60': {
    name: '74x60',
    simpleName: 'Dual 4-in AND Expander',
    description: 'Dual 4 input expander for 74x23, 74x50, 74x53, 74x55 (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7460.pdf',
    tags: ['expander', 'and', 'gate', 'logic', 'dual', '4 input'],
    guideOverview: 'The 74x60 is a dual 4 input AND expander. In standalone simulator use, 1X and 2X behave like ordinary AND outputs that can feed surrounding logic, while the original multi package expansion use is documented but not specially solved.',
    guidePinDescriptions: {
      '1X': 'Gate 1 AND result, typically used as an expansion output in hardware.',
      '2X': 'Gate 2 AND result, typically used as an expansion output in hardware.',
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '1C':  'Input C for gate 1.',
      '1D':  'Input D for gate 1.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      '2C':  'Input C for gate 2.',
      '2D':  'Input D for gate 2.',
      'NC1': 'No connection.',
      'NC2': 'No connection.',
      GND:   'Ground reference (pin 7).',
      VCC:   'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Dual 4 Input AND Expander',
        paragraphs: ['Each section computes a 4 input AND. In 74Sim these X outputs behave as ordinary AND gates and can feed directly into other logic.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: 'NC1', type: 'nc' },
      { pin: 4,  name: '1C',  type: 'input' },
      { pin: 5,  name: '1D',  type: 'input' },
      { pin: 6,  name: '1X',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '2X',  type: 'output' },
      { pin: 9,  name: '2A',  type: 'input' },
      { pin: 10, name: '2B',  type: 'input' },
      { pin: 11, name: 'NC2', type: 'nc' },
      { pin: 12, name: '2C',  type: 'input' },
      { pin: 13, name: '2D',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    // Standalone: behaves as dual 4 input AND gate
    gates: [
      { type: 'AND', inputs: ['1A', '1B', '1C', '1D'], output: '1X' },
      { type: 'AND', inputs: ['2A', '2B', '2C', '2D'], output: '2X' },
    ],
  },

  // ── 74x61: Triple 3 input expander for 74x52 ──────────────────────────────
  /* Primary source: Texas Instruments, SN74H61 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74h61.pdf */
  // This part supplies three 3 input AND terms intended to widen an external
  // logic package. The simulator treats those X pins as ordinary AND outputs.
  '74x61': {
    name: '74x61',
    simpleName: 'Triple 3-in AND Expander',
    description: 'Triple 3 input expander for 74x52 (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74h61.pdf',
    tags: ['expander', 'and', 'gate', 'logic', 'triple', '3 input'],
    guideOverview: 'The 74x61 provides three 3 input AND terms for use as expansion signals. In 74Sim those X pins are available as direct logic outputs, while dedicated expansion network behavior is intentionally simplified away.',
    guidePinDescriptions: {
      '1A':  'Input A for AND expander 1.',
      '1B':  'Input B for AND expander 1.',
      '1C':  'Input C for AND expander 1.',
      '1X':  'AND output for expander 1. HIGH when 1A=1B=1C=HIGH.',
      '2A':  'Input A for AND expander 2.',
      '2B':  'Input B for AND expander 2.',
      '2C':  'Input C for AND expander 2.',
      '2X':  'AND output for expander 2.',
      '3A':  'Input A for AND expander 3.',
      '3B':  'Input B for AND expander 3.',
      '3C':  'Input C for AND expander 3.',
      '3X':  'AND output for expander 3.',
      GND:   'Ground reference (pin 7).',
      VCC:   'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Triple 3-Input AND Expander',
        paragraphs: ['Three independent 3 input AND gates. Output X is HIGH only when all three inputs are HIGH. Originally intended as expansion inputs to wider AOI gates.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: '1C',  type: 'input' },
      { pin: 4,  name: '1X',  type: 'output' },
      { pin: 5,  name: '2A',  type: 'input' },
      { pin: 6,  name: '2B',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '2C',  type: 'input' },
      { pin: 9,  name: '2X',  type: 'output' },
      { pin: 10, name: '3A',  type: 'input' },
      { pin: 11, name: '3B',  type: 'input' },
      { pin: 12, name: '3C',  type: 'input' },
      { pin: 13, name: '3X',  type: 'output' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'AND', inputs: ['1A', '1B', '1C'], output: '1X' },
      { type: 'AND', inputs: ['2A', '2B', '2C'], output: '2X' },
      { type: 'AND', inputs: ['3A', '3B', '3C'], output: '3X' },
    ],
  },

  // ── 74x62: 3-3-2-2 input AND OR expander ──────────────────────────────────
  /* Primary source: Texas Instruments, SN74H62 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74h62.pdf */
  // Functionally this part produces one combined AND OR result and is typically
  // used to widen another AO/AOI package. 74Sim models the direct AO behavior.
  '74x62': {
    name: '74x62',
    simpleName: '3-3-2-2 AO Expander',
    description: '3-3-2-2 input AND OR expander for 74x50, 74x53, 74x55 (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74h62.pdf',
    tags: ['expander', 'ao', 'and or', 'gate', 'logic'],
    guideOverview: 'The 74x62 computes X = (A1&A2&A3) OR (B1&B2&B3) OR (C1&C2) OR (D1&D2). It is historically an expander oriented part, but in the simulator it is most useful as a direct 3-3-2-2 AND OR logic element.',
    guidePinDescriptions: {
      A1: 'Input A1 of the first 3 input AND group.',
      A2: 'Input A2 of the first 3 input AND group.',
      A3: 'Input A3 of the first 3 input AND group.',
      B1: 'Input B1 of the second 3 input AND group.',
      B2: 'Input B2 of the second 3 input AND group.',
      B3: 'Input B3 of the second 3 input AND group.',
      C1: 'Input C1 of the first 2 input AND group.',
      C2: 'Input C2 of the first 2 input AND group.',
      D1: 'Input D1 of the second 2 input AND group.',
      D2: 'Input D2 of the second 2 input AND group.',
      X:  'AND OR output: HIGH when any AND group is fully asserted.',
      'NC1': 'No connection.',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: '3-3-2-2 AND OR Expander',
        paragraphs: ['X = (A1·A2·A3)|(B1·B2·B3)|(C1·C2)|(D1·D2). No inversion. Use X directly in logic or feed it to an AOI expander input.'],
      },
    ],
    pinout: [
      { pin: 1,  name: 'A1',  type: 'input' },
      { pin: 2,  name: 'B1',  type: 'input' },
      { pin: 3,  name: 'C1',  type: 'input' },
      { pin: 4,  name: 'D1',  type: 'input' },
      { pin: 5,  name: 'D2',  type: 'input' },
      { pin: 6,  name: 'C2',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: 'X',   type: 'output' },
      { pin: 9,  name: 'B2',  type: 'input' },
      { pin: 10, name: 'A2',  type: 'input' },
      { pin: 11, name: 'NC1', type: 'nc' },
      { pin: 12, name: 'A3',  type: 'input' },
      { pin: 13, name: 'B3',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    // AO_3322: X = (A1&A2&A3)|(B1&B2&B3)|(C1&C2)|(D1&D2)
    gates: [
      { type: 'AO_3322', inputs: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'D2'], output: 'X' },
    ],
  },

  // ── 74x63: Hex Current Sensing Interface Gates ────────────────────────────
  /* Primary source: Texas Instruments, SN74LS63 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls63.pdf */
  // Digital behavior is six open collector inverters. The real part's special
  // value is its interface/current sensing capability, which 74Sim documents
  // as an electrical caveat rather than modeling as analog threshold behavior.
  '74x63': {
    name: '74x63',
    simpleName: 'Hex Interface',
    description: 'Hex current sensing interface gates (inverting, open collector) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls63.pdf',
    tags: ['not', 'inverter', 'buffer', 'interface', 'current', 'open collector', 'hex'],
    guideOverview: 'The 74x63 behaves as six open collector inverters at the logic level. Its real world current sensing and interface-drive characteristics are not separately modeled, so use it in 74Sim when you need the inversion and open collector behavior.',
    guidePinDescriptions: {
      '1A':  'Input for inverter 1.',
      '1Y':  'Open collector inverter output 1. Pulls LOW when 1A=HIGH.',
      '2A':  'Input for inverter 2.',
      '2Y':  'Open collector inverter output 2.',
      '3A':  'Input for inverter 3.',
      '3Y':  'Open collector inverter output 3.',
      GND:   'Ground reference (pin 7).',
      '4Y':  'Open collector inverter output 4.',
      '4A':  'Input for inverter 4.',
      '5Y':  'Open collector inverter output 5.',
      '5A':  'Input for inverter 5.',
      '6Y':  'Open collector inverter output 6.',
      '6A':  'Input for inverter 6.',
      VCC:   'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Hex Inverting Interface Gates',
        paragraphs: ['Each section inverts and provides a sink only (open collector) output for interfacing between logic families or driving inductive loads with external pull ups.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1Y',  type: 'output' },
      { pin: 3,  name: '2A',  type: 'input' },
      { pin: 4,  name: '2Y',  type: 'output' },
      { pin: 5,  name: '3A',  type: 'input' },
      { pin: 6,  name: '3Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '4Y',  type: 'output' },
      { pin: 9,  name: '4A',  type: 'input' },
      { pin: 10, name: '5Y',  type: 'output' },
      { pin: 11, name: '5A',  type: 'input' },
      { pin: 12, name: '6Y',  type: 'output' },
      { pin: 13, name: '6A',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },

  // ── 74x64: 4-3-2-2 input AND OR Invert gate ──────────────────────────────
  /* Primary source: Texas Instruments, SN74S64 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74s64.pdf */
  // This combines one 4 input term, one 3 input term, and two 2 input terms,
  // then inverts the OR result, giving a compact wide AOI decode structure.
  '74x64': {
    name: '74x64',
    simpleName: '4-3-2-2 AOI',
    description: '4-3-2-2 input AND OR INVERT gate (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74s64.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic'],
    guideOverview: 'The 74x64 computes NOT((A1&A2&A3&A4) OR (B1&B2&B3) OR (C1&C2) OR (D1&D2)). It is useful when you need several product-term widths merged into one inverted output.',
    guidePinDescriptions: {
      A1: 'Input A1 of the 4 input AND group.',
      A2: 'Input A2.',
      A3: 'Input A3.',
      A4: 'Input A4.',
      B1: 'Input B1 of the 3 input AND group.',
      B2: 'Input B2.',
      B3: 'Input B3.',
      C1: 'Input C1 of the first 2 input AND group.',
      C2: 'Input C2.',
      D1: 'Input D1 of the second 2 input AND group.',
      D2: 'Input D2.',
      Y:  'AOI output: LOW when any AND group is fully asserted.',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: '4-3-2-2 AND OR INVERT',
        paragraphs: ['Y = NOT((A1·A2·A3·A4)|(B1·B2·B3)|(C1·C2)|(D1·D2)). Y is LOW when the 4 input, 3 input, or either 2 input AND group is all-HIGH.'],
      },
    ],
    pinout: [
      { pin: 1,  name: 'A1',  type: 'input' },
      { pin: 2,  name: 'B1',  type: 'input' },
      { pin: 3,  name: 'C1',  type: 'input' },
      { pin: 4,  name: 'D1',  type: 'input' },
      { pin: 5,  name: 'D2',  type: 'input' },
      { pin: 6,  name: 'C2',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: 'Y',   type: 'output' },
      { pin: 9,  name: 'B2',  type: 'input' },
      { pin: 10, name: 'A2',  type: 'input' },
      { pin: 11, name: 'A3',  type: 'input' },
      { pin: 12, name: 'B3',  type: 'input' },
      { pin: 13, name: 'A4',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    // AOI_4322: Y = NOT((A1&A2&A3&A4)|(B1&B2&B3)|(C1&C2)|(D1&D2))
    gates: [
      { type: 'AOI_4322', inputs: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'D2'], output: 'Y' },
    ],
  },

  // ── 74x65: 4-3-2-2 input AND OR Invert gate (open collector) ─────────────
  /* Primary source: Texas Instruments, SN74S65 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74s65.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  // Logic wise this matches the 7464, but the output is open collector so the
  // HIGH state is a released line rather than an actively driven high level.
  '74x65': {
    name: '74x65',
    simpleName: '4-3-2-2 AOI (OC)',
    description: '4-3-2-2 input AND OR INVERT gate (open collector) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74s65.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic', 'open collector'],
    guideOverview: 'The 74x65 has the same 4-3-2-2 AOI logic as the 74x64, but with an open collector output. That makes it suitable for wired logic style use in hardware, while 74Sim represents the output as LOW or released.',
    guidePinDescriptions: {
      A1: 'Input A1 of the 4 input AND group.',
      A2: 'Input A2.',
      A3: 'Input A3.',
      A4: 'Input A4.',
      B1: 'Input B1 of the 3 input AND group.',
      B2: 'Input B2.',
      B3: 'Input B3.',
      C1: 'Input C1 of the first 2 input AND group.',
      C2: 'Input C2.',
      D1: 'Input D1 of the second 2 input AND group.',
      D2: 'Input D2.',
      Y:  'Open collector AOI output. Pulls LOW when any AND group is fully asserted; high Z otherwise.',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: '4-3-2-2 AOI (Open Collector)',
        paragraphs: [
          'Same logic as 74x64 but with an open collector output. Requires external pull up. Can be wired ANDed with other open collector outputs.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'A1',  type: 'input' },
      { pin: 2,  name: 'B1',  type: 'input' },
      { pin: 3,  name: 'C1',  type: 'input' },
      { pin: 4,  name: 'D1',  type: 'input' },
      { pin: 5,  name: 'D2',  type: 'input' },
      { pin: 6,  name: 'C2',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: 'Y',   type: 'output' },
      { pin: 9,  name: 'B2',  type: 'input' },
      { pin: 10, name: 'A2',  type: 'input' },
      { pin: 11, name: 'A3',  type: 'input' },
      { pin: 12, name: 'B3',  type: 'input' },
      { pin: 13, name: 'A4',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'AOI_4322', inputs: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'D2'], output: 'Y' },
    ],
  },

  // ── 74x67: AND gated JK controller device flip flop (preset & clear) ──────────
  /* Primary source: Texas Instruments, BL54L67Y datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/bl54l67y.pdf
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // J is the AND of J1-J3 and K is the AND of K1-K3, with asynchronous active-
  // LOW preset and clear. The simulator preserves the functional storage logic
  // and control pin priority without trying to model race around or analog timing.
  '74x67': {
    name: '74x67',
    simpleName: 'JK FF (AND gated)',
    description: 'AND-gated JK flip-flop, async preset and clear (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/bl54l67y.pdf',
    tags: ['flip flop', 'flip flop', 'jk', 'controller device', 'sequential', 'preset', 'clear'],
    guideOverview: 'The 74x67 is an AND gated JK controller device flip flop. All three J inputs must be HIGH to request set, all three K inputs must be HIGH to request reset/toggle behavior, and the asynchronous PRE and CLR inputs override the clocked action immediately.',
    guidePinDescriptions: {
      PRE: 'Active LOW asynchronous preset. Pull it LOW to force Q HIGH immediately.',
      CLR: 'Active LOW asynchronous clear. Pull it LOW to force Q LOW immediately.',
      CLK: 'Clock input for the gated JK action when PRE and CLR are inactive.',
      J1:  'J input bit 1 (all three J inputs must be HIGH to set).',
      J2:  'J input bit 2.',
      J3:  'J input bit 3.',
      K1:  'K input bit 1 (all three K inputs must be HIGH to reset/toggle).',
      K2:  'K input bit 2.',
      K3:  'K input bit 3.',
      Q:   'Q output. HIGH after set; LOW after reset.',
      Qn:  'Complementary output. Always opposite of Q.',
      GND: 'Ground reference (pin 8).',
      'NC1': 'No connection.',
      'NC2': 'No connection.',
      'NC3': 'No connection.',
      VCC: 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'AND Gated JK Flip Flop',
        paragraphs: ['J = J1·J2·J3 and K = K1·K2·K3. All three J or K inputs must be HIGH for the respective J or K action to take effect on the clock edge. PRE# and CLR# override clock operation.'],
      },
    ],
    pinout: [
      { pin: 1,  name: 'CLR',  type: 'input' },
      { pin: 2,  name: 'J1',   type: 'input' },
      { pin: 3,  name: 'J2',   type: 'input' },
      { pin: 4,  name: 'J3',   type: 'input' },
      { pin: 5,  name: 'CLK',  type: 'input' },
      { pin: 6,  name: 'K1',   type: 'input' },
      { pin: 7,  name: 'K2',   type: 'input' },
      { pin: 8,  name: 'GND',  type: 'power' },
      { pin: 9,  name: 'K3',   type: 'input' },
      { pin: 10, name: 'PRE',  type: 'input' },
      { pin: 11, name: 'Q',    type: 'output' },
      { pin: 12, name: 'Qn',   type: 'output' },
      { pin: 13, name: 'NC1',  type: 'nc' },
      { pin: 14, name: 'NC2',  type: 'nc' },
      { pin: 15, name: 'NC3',  type: 'nc' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    // JK_FF: inputs=[J1,J2,J3,K1,K2,K3,CLK,PRE,CLR], outputs=[Q,Qn]
    // J=J1&J2&J3, K=K1&K2&K3, PRE and CLR are active LOW
    gates: [
      {
        type: 'JK_FF',
        inputs: ['J1', 'J2', 'J3', 'K1', 'K2', 'K3', 'CLK', 'PRE', 'CLR'],
        outputs: ['Q', 'Qn'],
      },
    ],
    sequential: true,
  },
};
