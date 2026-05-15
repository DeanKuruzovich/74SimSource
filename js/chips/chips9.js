// Chip definitions block 9
// Chips: 74L68, 74x68, 74L69, 74x69, 74H71, 74L71,
//        74x77, 74H78, 74L78, 74x78, 74x79,
//        74x80, 74x81, 74x82, 74x84, 74x87
//
// Review notes for this block:
// - Most devices here are early sequential, arithmetic, or small-memory TTL
//   parts whose public pin behavior matters more than their internal transistor
//   topology for breadboard use.
// - Family-specific L/H/LS electrical differences are not modeled; only the
//   logic-level behavior and active-level conventions are represented.
// - 74x78 is handled as a falling-edge device, while the H/L78 variants remain
//   on the positive edge as described by their definitions.
// - 7480, 7481, and 7484 use functional models that preserve normal logic use,
//   but omit some complementary-input and bus-drive details of the originals.
// - Controller-device internals, race-around limits, and other analog timing nuances
//   are intentionally simplified to ideal digital storage behavior.

export const CHIPS_BLOCK_9 = {

  // ── 74L68: dual JK FF, async clear (improved 74L73), 18-pin ───────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Each section is a J-K storage element with its own clock and active LOW
  // asynchronous clear. The simulator models the logical J/K state changes and
  // clear priority, while omitting internal controller-device analog timing details.
  '74L68': {
    name: '74x68',
    simpleName: 'Dual JK FF (CLR)',
    description: 'Dual J-K controller-device flip-flop with asynchronous clear (no preset) (18-pin)',
    pins: 18,
    vcc: 18,
    gnd: 9,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip-flop', 'jk', 'sequential', 'dual', 'clear'],
    guideOverview: 'The 74L68 contains two independent J-K flip-flops with asynchronous clear. Each section responds to its own clock input, stores one bit of state, and exposes both Q and Qn so you can use either polarity directly.',
    guidePinDescriptions: {
      '1CLR': 'Active LOW asynchronous clear for FF1. Forces 1Q LOW immediately.',
      '1CLK': 'Clock input for FF1.',
      '1J':   'J input for FF1.',
      '1K':   'K input for FF1.',
      '1Q':   'Non-inverting output of FF1.',
      '1Qn':  'Complementary output of FF1.',
      '2CLR': 'Active LOW asynchronous clear for FF2. Forces 2Q LOW immediately.',
      '2CLK': 'Clock input for FF2.',
      '2J':   'J input for FF2.',
      '2K':   'K input for FF2.',
      '2Q':   'Non-inverting output of FF2.',
      '2Qn':  'Complementary output of FF2.',
      GND:    'Ground reference (pin 9).',
      VCC:    'Positive supply (+5 V) at pin 18.',
      NC1: 'No connection.', NC2: 'No connection.', NC3: 'No connection.', NC4: 'No connection.',
    },
    guideSections: [
      {
        title: 'JK Flip-Flop Operation',
        paragraphs: ['J=0,K=0: hold; J=1,K=0: set; J=0,K=1: reset; J=1,K=1: toggle. CLR (active LOW) clears asynchronously.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1CLR', type: 'input' },
      { pin:  2, name: '1CLK', type: 'input' },
      { pin:  3, name: '1J',   type: 'input' },
      { pin:  4, name: '1K',   type: 'input' },
      { pin:  5, name: 'NC1',  type: 'nc' },
      { pin:  6, name: '1Q',   type: 'output' },
      { pin:  7, name: '1Qn',  type: 'output' },
      { pin:  8, name: 'NC2',  type: 'nc' },
      { pin:  9, name: 'GND',  type: 'power' },
      { pin: 10, name: '2CLR', type: 'input' },
      { pin: 11, name: '2CLK', type: 'input' },
      { pin: 12, name: '2J',   type: 'input' },
      { pin: 13, name: '2K',   type: 'input' },
      { pin: 14, name: 'NC3',  type: 'nc' },
      { pin: 15, name: '2Q',   type: 'output' },
      { pin: 16, name: '2Qn',  type: 'output' },
      { pin: 17, name: 'NC4',  type: 'nc' },
      { pin: 18, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_SIMPLE', inputs: ['1J', '1K', '1CLK', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_SIMPLE', inputs: ['2J', '2K', '2CLK', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74x68: dual 4 bit decade counters, 16-pin ──────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Counter (digital) concept: https://en.wikipedia.org/wiki/Counter_(digital) */
  // This model treats each half as an independent decade counter with rising-
  // edge clocking and active LOW clear, which matches ordinary breadboard use.
  '74x68': {
    name: '74x68',
    simpleName: 'Dual Decade Counter',
    description: 'Dual 4 bit decade counter with asynchronous clear (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['counter', 'decade', 'bcd', 'sequential', 'dual', '4 bit'],
    guideOverview: 'The 74x68 packages two separate 4 bit decade counters. Each half advances through 0 to 9 on clock pulses and resets immediately when its CLR input is pulled LOW.',
    guidePinDescriptions: {
      '1CLR': 'Active LOW asynchronous clear for counter 1. Forces 1QA-1QD LOW immediately.',
      '1CLK': 'Clock for counter 1. Advances count on rising edge.',
      '1QA':  'Counter 1 bit 0 (LSB).',
      '1QB':  'Counter 1 bit 1.',
      '1QC':  'Counter 1 bit 2.',
      '1QD':  'Counter 1 bit 3 (MSB). Goes HIGH at count 8 or 9.',
      '2CLR': 'Active LOW asynchronous clear for counter 2.',
      '2CLK': 'Clock for counter 2.',
      '2QA':  'Counter 2 bit 0 (LSB).',
      '2QB':  'Counter 2 bit 1.',
      '2QC':  'Counter 2 bit 2.',
      '2QD':  'Counter 2 bit 3.',
      NC1:    'No connection.', NC2: 'No connection.',
      GND:    'Ground reference (pin 7).',
      VCC:    'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Dual Decade Counter',
        paragraphs: ['Each counter counts 0-9 in BCD and resets to 0 when CLR (active LOW) is asserted. Cascade two chips by connecting 1QD to 2CLK to create a 0-99 counter.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1CLK', type: 'input' },
      { pin:  2, name: '1CLR', type: 'input' },
      { pin:  3, name: '1QD',  type: 'output' },
      { pin:  4, name: '1QC',  type: 'output' },
      { pin:  5, name: '1QB',  type: 'output' },
      { pin:  6, name: '1QA',  type: 'output' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: '2QA',  type: 'output' },
      { pin:  9, name: '2QB',  type: 'output' },
      { pin: 10, name: '2QC',  type: 'output' },
      { pin: 11, name: '2QD',  type: 'output' },
      { pin: 12, name: '2CLR', type: 'input' },
      { pin: 13, name: '2CLK', type: 'input' },
      { pin: 14, name: 'NC1',  type: 'nc' },
      { pin: 15, name: 'NC2',  type: 'nc' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'COUNTER_DECADE_SIMPLE', inputs: ['1CLK', '1CLR'], outputs: ['1QA', '1QB', '1QC', '1QD'] },
      { type: 'COUNTER_DECADE_SIMPLE', inputs: ['2CLK', '2CLR'], outputs: ['2QA', '2QB', '2QC', '2QD'] },
    ],
    sequential: true,
  },

  // ── 74L69: dual JK FF, preset, shared clock and clear, 18-pin ─────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Both sections share the same clock and clear but have separate preset and
  // J/K data pins. The simulator keeps that shared-control behavior intact.
  '74L69': {
    name: '74x69',
    simpleName: 'Dual JK FF (shared CLK/CLR)',
    description: 'Dual J-K controller-device flip-flop with asynchronous preset, shared clock and clear (18-pin)',
    pins: 18,
    vcc: 18,
    gnd: 9,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip-flop', 'jk', 'sequential', 'dual', 'preset', 'clear'],
    guideOverview: 'The 74L69 is a dual J-K flip-flop where both sections share CLK and CLR, but each section has its own preset and J/K inputs. That makes it useful when two bits must be clocked together but initialized independently.',
    guidePinDescriptions: {
      '1PRE': 'Active LOW asynchronous preset for FF1. Forces 1Q HIGH immediately.',
      '1J':   'J input for FF1.',
      '1K':   'K input for FF1.',
      '1Q':   'Non-inverting output of FF1.',
      '1Qn':  'Complementary output of FF1.',
      CLK:    'Shared clock for both flip-flops.',
      CLR:    'Shared active LOW clear. Forces both Q outputs LOW asynchronously.',
      '2PRE': 'Active LOW asynchronous preset for FF2.',
      '2J':   'J input for FF2.',
      '2K':   'K input for FF2.',
      '2Q':   'Non-inverting output of FF2.',
      '2Qn':  'Complementary output of FF2.',
      GND:    'Ground reference (pin 9).',
      VCC:    'Positive supply (+5 V) at pin 18.',
      NC1: 'No connection.', NC2: 'No connection.', NC3: 'No connection.', NC4: 'No connection.',
    },
    guideSections: [
      {
        title: 'Shared-Clock JK Pair',
        paragraphs: ['Both flip-flops respond to the same clock edge. Use individual PRE (active LOW) inputs to initialize each bit independently at power-on or between clocked events.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1PRE', type: 'input' },
      { pin:  2, name: '1J',   type: 'input' },
      { pin:  3, name: '1K',   type: 'input' },
      { pin:  4, name: 'NC1',  type: 'nc' },
      { pin:  5, name: '1Q',   type: 'output' },
      { pin:  6, name: '1Qn',  type: 'output' },
      { pin:  7, name: 'NC2',  type: 'nc' },
      { pin:  8, name: 'NC3',  type: 'nc' },
      { pin:  9, name: 'GND',  type: 'power' },
      { pin: 10, name: 'NC4',  type: 'nc' },
      { pin: 11, name: '2Q',   type: 'output' },
      { pin: 12, name: '2Qn',  type: 'output' },
      { pin: 13, name: '2J',   type: 'input' },
      { pin: 14, name: '2K',   type: 'input' },
      { pin: 15, name: '2PRE', type: 'input' },
      { pin: 16, name: 'CLK',  type: 'input' },
      { pin: 17, name: 'CLR',  type: 'input' },
      { pin: 18, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_FULL', inputs: ['1J', '1K', 'CLK', '1PRE', 'CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_FULL', inputs: ['2J', '2K', 'CLK', '2PRE', 'CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74x69: dual 4 bit binary counters, 16-pin ──────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Counter (digital) concept: https://en.wikipedia.org/wiki/Counter_(digital) */
  // Functionally this is the binary companion to the 74x68: two independent
  // 4 bit counters with active LOW clears and no extra gating pins.
  '74x69': {
    name: '74x69',
    simpleName: 'Dual Binary Counter',
    description: 'Dual 4 bit binary counter with asynchronous clear (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['counter', 'binary', 'sequential', 'dual', '4 bit'],
    guideOverview: 'The 74x69 provides two independent 4 bit binary counters in one package. Each counter increments through 0 to 15 on its clock input and clears asynchronously when CLR goes LOW.',
    guidePinDescriptions: {
      '1CLK': 'Clock for counter 1. Advances on rising edge.',
      '1CLR': 'Active LOW clear for counter 1.',
      '1QA':  'Counter 1 bit 0.',
      '1QB':  'Counter 1 bit 1.',
      '1QC':  'Counter 1 bit 2.',
      '1QD':  'Counter 1 bit 3 (MSB). Carry ripple point for cascading.',
      '2CLK': 'Clock for counter 2.',
      '2CLR': 'Active LOW clear for counter 2.',
      '2QA':  'Counter 2 bit 0.',
      '2QB':  'Counter 2 bit 1.',
      '2QC':  'Counter 2 bit 2.',
      '2QD':  'Counter 2 bit 3.',
      NC1: 'No connection.', NC2: 'No connection.',
      GND:    'Ground reference (pin 7).',
      VCC:    'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Dual 4 bit Binary Counter',
        paragraphs: ['Each counter counts 0-15 binary. Connect 1QD to 2CLK for a 0-255 8 bit counter.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1CLK', type: 'input' },
      { pin:  2, name: '1CLR', type: 'input' },
      { pin:  3, name: '1QD',  type: 'output' },
      { pin:  4, name: '1QC',  type: 'output' },
      { pin:  5, name: '1QB',  type: 'output' },
      { pin:  6, name: '1QA',  type: 'output' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: '2QA',  type: 'output' },
      { pin:  9, name: '2QB',  type: 'output' },
      { pin: 10, name: '2QC',  type: 'output' },
      { pin: 11, name: '2QD',  type: 'output' },
      { pin: 12, name: '2CLR', type: 'input' },
      { pin: 13, name: '2CLK', type: 'input' },
      { pin: 14, name: 'NC1',  type: 'nc' },
      { pin: 15, name: 'NC2',  type: 'nc' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'COUNTER_BIN_SIMPLE', inputs: ['1CLK', '1CLR'], outputs: ['1QA', '1QB', '1QC', '1QD'] },
      { type: 'COUNTER_BIN_SIMPLE', inputs: ['2CLK', '2CLR'], outputs: ['2QA', '2QB', '2QC', '2QD'] },
    ],
    sequential: true,
  },

  // ── 74H71: AND-OR-gated JK MS FF, preset, 14-pin ──────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // J is formed by ANDing J1-J3, K is formed by ANDing K1-K3, and PRE forces a
  // set asynchronously. The simulator focuses on that logical behavior only.
  '74H71': {
    name: '74x71',
    simpleName: 'JK FF (AND-OR, PRE)',
    description: 'AND-OR-gated J-K controller-device flip-flop with preset only (no clear) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip-flop', 'jk', 'sequential', 'preset', 'controller-device'],
    guideOverview: 'The 74H71 is a single J-K flip-flop with three J inputs, three K inputs, and an asynchronous preset. All J inputs must be HIGH together to request set behavior, all K inputs must be HIGH together to request reset/toggle behavior, and PRE overrides the clocked action.',
    guidePinDescriptions: {
      PRE:  'Active LOW asynchronous preset. Forces Q HIGH immediately when LOW.',
      J1:   'J input bit 1. All three must be HIGH for J to be asserted.',
      J2:   'J input bit 2.',
      J3:   'J input bit 3.',
      K1:   'K input bit 1. All three must be HIGH for K to be asserted.',
      K2:   'K input bit 2.',
      K3:   'K input bit 3.',
      CLK:  'Clock input.',
      Q:    'Non-inverting output.',
      Qn:   'Complementary output.',
      GND:  'Ground reference (pin 7).',
      VCC:  'Positive supply (+5 V) at pin 14.',
      NC1: 'No connection.', NC2: 'No connection.',
    },
    guideSections: [
      {
        title: 'AND-gated JK (no clear)',
        paragraphs: ['J=J1·J2·J3, K=K1·K2·K3. Use this part when you want gating on J and K inputs without an asynchronous clear. Tie unused J/K inputs HIGH to maintain normal JK operation.'],
      },
    ],
    pinout: [
      { pin:  1, name: 'PRE',  type: 'input' },
      { pin:  2, name: 'J1',   type: 'input' },
      { pin:  3, name: 'J2',   type: 'input' },
      { pin:  4, name: 'J3',   type: 'input' },
      { pin:  5, name: 'K1',   type: 'input' },
      { pin:  6, name: 'K2',   type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'K3',   type: 'input' },
      { pin:  9, name: 'CLK',  type: 'input' },
      { pin: 10, name: 'Qn',   type: 'output' },
      { pin: 11, name: 'Q',    type: 'output' },
      { pin: 12, name: 'NC1',  type: 'nc' },
      { pin: 13, name: 'NC2',  type: 'nc' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_PRESET', inputs: ['J1', 'J2', 'J3', 'K1', 'K2', 'K3', 'CLK', 'PRE'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },

  // ── 74L71: AND-gated RS MS FF, preset and clear, 14-pin ───────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // This is an R-S style storage part, but 74Sim maps its set and reset groups
  // through the shared J-K evaluator because the breadboard-visible behavior is
  // equivalent for ordinary valid inputs. Invalid simultaneous assertions are a caveat.
  '74L71': {
    name: '74x71',
    simpleName: 'RS FF (AND-gated)',
    description: 'AND-gated R-S controller-device flip-flop with preset and clear (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip-flop', 'rs', 'sr', 'sequential', 'preset', 'clear', 'controller-device'],
    guideOverview: 'The 74L71 is an AND-gated R-S controller-device flip-flop with asynchronous preset and clear. In 74Sim it behaves like the expected set/reset storage element for valid inputs, while simultaneous contradictory control assertions are treated as a documented realism limit.',
    guidePinDescriptions: {
      CLR:  'Active LOW asynchronous clear. Forces Q LOW immediately.',
      S1:   'Set input bit 1. All three S inputs must be HIGH to set Q.',
      S2:   'Set input bit 2.',
      S3:   'Set input bit 3.',
      PRE:  'Active LOW asynchronous preset. Forces Q HIGH immediately.',
      R3:   'Reset input bit 3.',
      R1:   'Reset input bit 1. All three R inputs must be HIGH to reset Q.',
      R2:   'Reset input bit 2.',
      CLK:  'Clock input.',
      Q:    'Non-inverting output.',
      Qn:   'Complementary output.',
      GND:  'Ground reference (pin 7).',
      VCC:  'Positive supply (+5 V) at pin 14.',
      NC1:  'No connection.',
    },
    guideSections: [
      {
        title: 'AND-gated RS Flip-Flop',
        paragraphs: ['Maps S inputs to J and R inputs to K. S=S1·S2·S3, R=R1·R2·R3. Do not assert S and R simultaneously.'],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLR',  type: 'input' },
      { pin:  2, name: 'S1',   type: 'input' },
      { pin:  3, name: 'S2',   type: 'input' },
      { pin:  4, name: 'S3',   type: 'input' },
      { pin:  5, name: 'PRE',  type: 'input' },
      { pin:  6, name: 'R3',   type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'Q',    type: 'output' },
      { pin:  9, name: 'Qn',   type: 'output' },
      { pin: 10, name: 'R1',   type: 'input' },
      { pin: 11, name: 'R2',   type: 'input' },
      { pin: 12, name: 'CLK',  type: 'input' },
      { pin: 13, name: 'NC1',  type: 'nc' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    // S (set) maps to J, R (reset) maps to K functionally equivalent for simulation
    gates: [
      { type: 'JK_FF', inputs: ['S1', 'S2', 'S3', 'R1', 'R2', 'R3', 'CLK', 'PRE', 'CLR'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },

  // ── 74x77: 4 bit bistable latch, 14-pin ────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Latch/flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Four D latches share one active HIGH enable. When E is HIGH the outputs are
  // transparent to the D inputs; when E is LOW they hold their last stored value.
  '7477': {
    name: '74x77',
    simpleName: '4 bit Latch',
    description: '4 bit bistable latch with shared enable (no Qn outputs) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['latch', 'bistable', '4 bit', 'sequential', 'register'],
    guideOverview: 'The 7477 is a 4 bit transparent latch with one shared enable input. Pull E HIGH to let each Q follow its D input, then return E LOW to freeze the current 4 bit state.',
    guidePinDescriptions: {
      E:    'Shared latch enable (active HIGH transparent). HIGH = transparent; LOW = latched.',
      '1D': 'Data input for bit 1.',
      '2D': 'Data input for bit 2.',
      '3D': 'Data input for bit 3.',
      '4D': 'Data input for bit 4.',
      '1Q': 'Latched output for bit 1.',
      '2Q': 'Latched output for bit 2.',
      '3Q': 'Latched output for bit 3.',
      '4Q': 'Latched output for bit 4.',
      GND:  'Ground reference (pin 7).',
      VCC:  'Positive supply (+5 V) at pin 14.',
      NC1: 'No connection.', NC2: 'No connection.', NC3: 'No connection.',
    },
    guideSections: [
      {
        title: '4 bit Transparent Latch',
        paragraphs: ['While E is HIGH, outputs Q track inputs D. When E goes LOW, outputs freeze at their last value. No individual preset or clear use CLR on surrounding logic if you need to reset state.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1D',  type: 'input' },
      { pin:  2, name: '2D',  type: 'input' },
      { pin:  3, name: 'E',   type: 'input' },
      { pin:  4, name: '1Q',  type: 'output' },
      { pin:  5, name: '2Q',  type: 'output' },
      { pin:  6, name: '3Q',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power' },
      { pin:  8, name: '4Q',  type: 'output' },
      { pin:  9, name: '3D',  type: 'input' },
      { pin: 10, name: '4D',  type: 'input' },
      { pin: 11, name: 'NC1', type: 'nc' },
      { pin: 12, name: 'NC2', type: 'nc' },
      { pin: 13, name: 'NC3', type: 'nc' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'D_LATCH_Q', inputs: ['1D', 'E'], outputs: ['1Q'] },
      { type: 'D_LATCH_Q', inputs: ['2D', 'E'], outputs: ['2Q'] },
      { type: 'D_LATCH_Q', inputs: ['3D', 'E'], outputs: ['3Q'] },
      { type: 'D_LATCH_Q', inputs: ['4D', 'E'], outputs: ['4Q'] },
    ],
    sequential: true,
  },

  // ── 74H78: dual JK FF, preset, shared clock and clear, 14-pin ─────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Both sections share CLK and CLR and respond on the positive clock edge in
  // this model, matching the device description used by the block definition.
  '74H78': {
    name: '74x78',
    simpleName: 'Dual JK FF (shared CLK/CLR)',
    description: 'Dual positive pulse triggered J-K flip-flop with preset, shared clock and clear (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip-flop', 'jk', 'sequential', 'dual', 'preset', 'clear'],
    guideOverview: 'The 74H78 contains two J-K flip-flops with a shared clock and shared clear, plus individual preset inputs. In this block it is modeled as a positive-edge-triggered family member.',
    guidePinDescriptions: {
      CLK:    'Shared clock. Both FFs update on the rising edge.',
      CLR:    'Shared active LOW clear. Forces both Q outputs LOW asynchronously.',
      '1J':   'J input for FF1.',
      '1K':   'K input for FF1.',
      '1PRE': 'Active LOW preset for FF1.',
      '1Q':   'Output of FF1.',
      '1Qn':  'Complementary output of FF1.',
      '2J':   'J input for FF2.',
      '2K':   'K input for FF2.',
      '2PRE': 'Active LOW preset for FF2.',
      '2Q':   'Output of FF2.',
      '2Qn':  'Complementary output of FF2.',
      GND:    'Ground reference (pin 7).',
      VCC:    'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Shared-Clock JK Pair (Positive Edge)',
        paragraphs: ['Both flip-flops share one clock and one CLR. Individual PRE# lets you set each bit independently without clocking.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1J',   type: 'input' },
      { pin:  2, name: '1PRE', type: 'input' },
      { pin:  3, name: '1K',   type: 'input' },
      { pin:  4, name: '1Q',   type: 'output' },
      { pin:  5, name: '1Qn',  type: 'output' },
      { pin:  6, name: 'CLK',  type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: '2Qn',  type: 'output' },
      { pin:  9, name: '2Q',   type: 'output' },
      { pin: 10, name: '2K',   type: 'input' },
      { pin: 11, name: '2PRE', type: 'input' },
      { pin: 12, name: '2J',   type: 'input' },
      { pin: 13, name: 'CLR',  type: 'input' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_FULL', inputs: ['1J', '1K', 'CLK', '1PRE', 'CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_FULL', inputs: ['2J', '2K', 'CLK', '2PRE', 'CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74L78: dual JK FF, preset, shared clock and clear, 14-pin ─────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // This L-family variant uses the same functional model as the H-family part:
  // shared clock and clear, independent preset pins, and positive-edge capture.
  '74L78': {
    name: '74x78',
    simpleName: 'Dual JK FF (shared CLK/CLR)',
    description: 'Dual positive pulse triggered J-K flip-flop with preset, shared clock and clear (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip-flop', 'jk', 'sequential', 'dual', 'preset', 'clear'],
    guideOverview: 'The 74L78 is the L-family dual J-K flip-flop with shared CLK and CLR. Each section has its own preset, and the modeled clocked action occurs on the positive clock edge.',
    guidePinDescriptions: {
      CLK:    'Shared clock. Both FFs update on the rising edge.',
      CLR:    'Shared active LOW clear.',
      '1J':   'J input for FF1.',
      '1K':   'K input for FF1.',
      '1PRE': 'Active LOW preset for FF1.',
      '1Q':   'Output of FF1.',
      '1Qn':  'Complementary output of FF1.',
      '2J':   'J input for FF2.',
      '2K':   'K input for FF2.',
      '2PRE': 'Active LOW preset for FF2.',
      '2Q':   'Output of FF2.',
      '2Qn':  'Complementary output of FF2.',
      GND:    'Ground reference (pin 7).',
      VCC:    'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Shared-Clock JK Pair (L-family)',
        paragraphs: ['L-family low power variant of the 78-style JK flip-flop. Function is identical to 74H78 but with lower power dissipation and slower speed.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1J',   type: 'input' },
      { pin:  2, name: '1PRE', type: 'input' },
      { pin:  3, name: '1K',   type: 'input' },
      { pin:  4, name: '1Q',   type: 'output' },
      { pin:  5, name: '1Qn',  type: 'output' },
      { pin:  6, name: 'CLK',  type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: '2Qn',  type: 'output' },
      { pin:  9, name: '2Q',   type: 'output' },
      { pin: 10, name: '2K',   type: 'input' },
      { pin: 11, name: '2PRE', type: 'input' },
      { pin: 12, name: '2J',   type: 'input' },
      { pin: 13, name: 'CLR',  type: 'input' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_FULL', inputs: ['1J', '1K', 'CLK', '1PRE', 'CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_FULL', inputs: ['2J', '2K', 'CLK', '2PRE', 'CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74x78: dual neg-edge triggered JK FF, preset, shared clock+clear, 14-pin
  /* Primary source: Texas Instruments, SN74LS78A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls78a.pdf
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // This LS-family member is the negative-edge version of the 78-style device.
  // It now uses a falling-edge JK primitive so the modeled clocking matches the
  // published part description instead of the positive-edge H/L variants.
  '74x78': {
    name: '74x78',
    simpleName: 'Dual JK FF (Neg-Edge, Shared CLK/CLR)',
    description: 'Dual negative-edge-triggered JK flip-flop with shared clock, shared active LOW clear, and individual active LOW preset inputs (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls78a.pdf',
    tags: ['flip-flop', 'jk', 'sequential', 'dual', 'preset', 'clear', 'negative-edge'],
    guideOverview: 'The 74x78 gives you two negative-edge-triggered JK flip-flops that share a common clock and a common active LOW clear. Each flip-flop has its own active LOW preset input. The JK inputs let you set, reset, or toggle the output on each falling clock edge.',
    guidePinDescriptions: {
      '1J':   'J input for flip-flop 1. Controls set/toggle behavior on falling clock edge.',
      '1PRE': 'Active LOW asynchronous preset for FF1. When LOW, forces 1Q HIGH immediately.',
      '1K':   'K input for flip-flop 1. Controls reset/toggle behavior on falling clock edge.',
      '1Q':   'Non-inverting output of flip-flop 1.',
      '1Qn':  'Inverting (complement) output of flip-flop 1.',
      CLK:    'Common clock for both flip-flops. State updates on the falling (negative) edge.',
      GND:    'Ground reference (pin 7).',
      '2Qn':  'Inverting (complement) output of flip-flop 2.',
      '2Q':   'Non-inverting output of flip-flop 2.',
      '2K':   'K input for flip-flop 2.',
      '2PRE': 'Active LOW asynchronous preset for FF2. When LOW, forces 2Q HIGH immediately.',
      '2J':   'J input for flip-flop 2.',
      CLR:    'Common active LOW asynchronous clear. When LOW, forces both Q outputs LOW.',
      VCC:    'Positive supply (5V). Standard position at pin 14.',
    },
    pinout: [
      { pin:  1, name: '1J',   type: 'input' },
      { pin:  2, name: '1PRE', type: 'input' },
      { pin:  3, name: '1K',   type: 'input' },
      { pin:  4, name: '1Q',   type: 'output' },
      { pin:  5, name: '1Qn',  type: 'output' },
      { pin:  6, name: 'CLK',  type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: '2Qn',  type: 'output' },
      { pin:  9, name: '2Q',   type: 'output' },
      { pin: 10, name: '2K',   type: 'input' },
      { pin: 11, name: '2PRE', type: 'input' },
      { pin: 12, name: '2J',   type: 'input' },
      { pin: 13, name: 'CLR',  type: 'input' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_FULL_NEG', inputs: ['1J', '1K', 'CLK', '1PRE', 'CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_FULL_NEG', inputs: ['2J', '2K', 'CLK', '2PRE', 'CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'JK Flip-Flop Operation',
        paragraphs: [
          'On the falling edge of CLK: J=0,K=0 → hold; J=1,K=0 → set Q=1; J=0,K=1 → reset Q=0; J=1,K=1 → toggle Q.',
          'The shared CLR is active LOW: pulling it LOW clears both flip-flops asynchronously regardless of CLK. Individual PRE inputs are also active LOW and take priority over CLR when both are asserted set Q HIGH regardless of clock.',
        ],
        note: 'Connect CLR HIGH and both PRE inputs HIGH during normal clocked operation so the async overrides are inactive.',
      },
    ],
  },

  // ── 74x79: dual D positive edge triggered FF, async PRE and CLR, 14-pin ──
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Each section is a straightforward D flip-flop with active LOW asynchronous
  // preset and clear. That makes it one of the more literal models in the block.
  '7479': {
    name: '74x79',
    simpleName: 'Dual D FF',
    description: 'Dual D positive edge triggered flip-flop with asynchronous preset and clear (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['flip-flop', 'd-type', 'sequential', 'dual', 'preset', 'clear'],
    guideOverview: 'The 7479 provides two positive-edge-triggered D flip-flops with asynchronous preset and clear. Each section captures D on its clock edge and also supplies the complementary output Qn.',
    guidePinDescriptions: {
      '1CLR': 'Active LOW asynchronous clear for FF1. Forces 1Q LOW immediately.',
      '1D':   'Data input for FF1.',
      '1CLK': 'Clock for FF1. Captures D on rising edge.',
      '1PRE': 'Active LOW preset for FF1. Forces 1Q HIGH immediately.',
      '1Q':   'Output of FF1.',
      '1Qn':  'Complementary output of FF1.',
      '2CLR': 'Active LOW clear for FF2.',
      '2D':   'Data input for FF2.',
      '2CLK': 'Clock for FF2.',
      '2PRE': 'Active LOW preset for FF2.',
      '2Q':   'Output of FF2.',
      '2Qn':  'Complementary output of FF2.',
      GND:    'Ground reference (pin 7).',
      VCC:    'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Dual D Flip-Flop',
        paragraphs: ['Each section captures D on the rising clock edge. PRE# and CLR# override the clock asynchronously. Tie unused PRE# and CLR# to VCC for normal clocked operation.'],
      },
    ],
    pinout: [
      { pin:  1, name: '1CLR', type: 'input' },
      { pin:  2, name: '1D',   type: 'input' },
      { pin:  3, name: '1CLK', type: 'input' },
      { pin:  4, name: '1PRE', type: 'input' },
      { pin:  5, name: '1Q',   type: 'output' },
      { pin:  6, name: '1Qn',  type: 'output' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: '2Qn',  type: 'output' },
      { pin:  9, name: '2Q',   type: 'output' },
      { pin: 10, name: '2PRE', type: 'input' },
      { pin: 11, name: '2CLK', type: 'input' },
      { pin: 12, name: '2D',   type: 'input' },
      { pin: 13, name: '2CLR', type: 'input' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'D_FF', inputs: ['1D', '1CLK', '1PRE', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'D_FF', inputs: ['2D', '2CLK', '2PRE', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74x80: gated full adder, 14-pin ────────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Binary adder concept: https://en.wikipedia.org/wiki/Adder_(electronics) */
  // The real package includes complementary A/B inputs, carry gating pins, and
  // both true and complemented carry outputs. 74Sim preserves ordinary 1 bit
  // addition through A, B, and CIN, and documents the extra package signals as a caveat.
  '7480': {
    name: '74x80',
    simpleName: 'Gated Full Adder',
    description: 'Gated full adder (complementary inputs, carry gating) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['adder', 'arithmetic', 'combinational'],
    guideOverview: 'The 7480 is modeled as a 1 bit full adder using A, B, and CIN, producing SUM and COUT. The package also contains complementary and gating pins in real hardware, but 74Sim keeps the common logic-design use case rather than emulating every internal gating path.',
    guidePinDescriptions: {
      A:     'First operand bit.',
      An:    'Complement of A (ignored in simulation).',
      B:     'Second operand bit.',
      Bn:    'Complement of B (ignored in simulation).',
      CIN:   'Carry-in from a previous stage.',
      SUM:   'Sum output: A XOR B XOR CIN.',
      COUT:  'Carry-out: HIGH when two or more inputs are HIGH.',
      COUTn: 'Complement carry-out (present on package, not used by simulator).',
      G1:    'Gate-select input 1 (package gating, not used in simulator).',
      G2:    'Gate-select input 2.',
      GND:   'Ground reference (pin 7).',
      VCC:   'Positive supply (+5 V) at pin 14.',
      NC1: 'No connection.', NC2: 'No connection.',
    },
    guideSections: [
      {
        title: 'Modeling Caveat',
        paragraphs: [
          'Pins such as An, Bn, G1, G2, and COUTn exist on the real device because it is a gated adder implementation. The simulator currently ignores those extra control/complement pins and treats the part as a conventional full adder around A, B, and CIN.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Bn',    type: 'input' },
      { pin:  2, name: 'A',     type: 'input' },
      { pin:  3, name: 'An',    type: 'input' },
      { pin:  4, name: 'NC1',   type: 'nc' },
      { pin:  5, name: 'CIN',   type: 'input' },
      { pin:  6, name: 'B',     type: 'input' },
      { pin:  7, name: 'GND',   type: 'power' },
      { pin:  8, name: 'COUTn', type: 'output' },
      { pin:  9, name: 'COUT',  type: 'output' },
      { pin: 10, name: 'G1',    type: 'input' },
      { pin: 11, name: 'G2',    type: 'input' },
      { pin: 12, name: 'SUM',   type: 'output' },
      { pin: 13, name: 'NC2',   type: 'nc' },
      { pin: 14, name: 'VCC',   type: 'power' },
    ],
    // Simplified: treat as full adder using A, B, CIN. G1, G2, An, Bn, COUTn unused in gate.
    gates: [
      { type: 'ADDER_1BIT', inputs: ['A', 'B', 'CIN'], outputs: ['SUM', 'COUT'] },
    ],
  },

  // ── 74x81: 16 bit RAM (16×1), 14-pin ───────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // Functionally this is a 16-word by 1 bit RAM with CE and WE controls plus Q
  // and Qn outputs. The simulator keeps the storage behavior but does not make
  // separate use of DINn or model real disabled-output bus nuances.
  '7481': {
    name: '74x81',
    simpleName: '16 bit RAM (16×1)',
    description: '16 bit random-access memory organized as 16 words × 1 bit (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['ram', 'memory', 'sequential', '16 bit'],
    guideOverview: 'The 7481 stores 16 single-bit words selected by A0-A3. With CE active and WE asserted, the addressed bit is written from DIN; with CE active and WE inactive, the addressed bit appears on Q and Qn.',
    guidePinDescriptions: {
      A0:   'Address bit 0 (LSB).',
      A1:   'Address bit 1.',
      A2:   'Address bit 2.',
      A3:   'Address bit 3 (MSB). Selects 1 of 16 words.',
      DIN:  'Data input for write operations.',
      DINn: 'Complement data input (present on package, not used in simulation).',
      CE:   'Chip enable. Must be asserted to read or write.',
      WE:   'Write enable. HIGH = write DIN to addressed location.',
      Q:    'Data output for the addressed cell.',
      Qn:   'Complement data output.',
      GND:  'Ground reference (pin 7).',
      VCC:  'Positive supply (+5 V) at pin 14.',
      NC1: 'No connection.', NC2: 'No connection.',
    },
    guideSections: [
      {
        title: 'Modeling Caveat',
        paragraphs: [
          'The package includes DINn and historical bus-interface details. 74Sim uses DIN as the stored value source and models disabled behavior in a simplified digital way rather than reproducing all real output-drive states.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'WE',   type: 'input' },
      { pin:  4, name: 'DIN',  type: 'input' },
      { pin:  5, name: 'DINn', type: 'input' },
      { pin:  6, name: 'CE',   type: 'input' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'Q',    type: 'output' },
      { pin:  9, name: 'Qn',   type: 'output' },
      { pin: 10, name: 'A2',   type: 'input' },
      { pin: 11, name: 'A3',   type: 'input' },
      { pin: 12, name: 'NC1',  type: 'nc' },
      { pin: 13, name: 'NC2',  type: 'nc' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM16x1', inputs: ['A0', 'A1', 'A2', 'A3', 'DIN', 'CE', 'WE'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },

  // ── 74x82: 2 bit binary full adder, 14-pin ─────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Binary adder concept: https://en.wikipedia.org/wiki/Adder_(electronics) */
  // This is a direct arithmetic element: two 2 bit words plus carry-in produce
  // two sum bits and a carry-out with no notable control-pin caveats.
  '7482': {
    name: '74x82',
    simpleName: '2 bit Full Adder',
    description: '2 bit binary full adder (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['adder', 'arithmetic', 'combinational', '2 bit'],
    guideOverview: 'The 7482 adds two 2 bit binary values plus CIN and produces SUM1, SUM2, and COUT. It is useful as a compact arithmetic block when you need only the low two bits of addition.',
    guidePinDescriptions: {
      A1:   'Bit 0 of operand A.',
      A2:   'Bit 1 of operand A.',
      B1:   'Bit 0 of operand B.',
      B2:   'Bit 1 of operand B.',
      CIN:  'Carry-in from a lower-order stage.',
      SUM1: 'Sum bit 0.',
      SUM2: 'Sum bit 1.',
      COUT: 'Carry-out to a higher-order stage.',
      GND:  'Ground reference (pin 7).',
      VCC:  'Positive supply (+5 V) at pin 14.',
      NC1: 'No connection.', NC2: 'No connection.', NC3: 'No connection.', NC4: 'No connection.',
    },
    guideSections: [
      {
        title: '2 bit Full Adder',
        paragraphs: ['Cascade two 7482s to form a 4 bit adder: connect COUT of the lower chip to CIN of the upper chip. Pair four chips with the 74283 for a carry-lookahead 4 bit adder.'],
      },
    ],
    pinout: [
      { pin:  1, name: 'B1',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'CIN',  type: 'input' },
      { pin:  4, name: 'SUM1', type: 'output' },
      { pin:  5, name: 'SUM2', type: 'output' },
      { pin:  6, name: 'NC1',  type: 'nc' },
      { pin:  7, name: 'GND',  type: 'power' },
      { pin:  8, name: 'COUT', type: 'output' },
      { pin:  9, name: 'NC2',  type: 'nc' },
      { pin: 10, name: 'A2',   type: 'input' },
      { pin: 11, name: 'B2',   type: 'input' },
      { pin: 12, name: 'NC3',  type: 'nc' },
      { pin: 13, name: 'NC4',  type: 'nc' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'ADDER_2BIT', inputs: ['A1', 'A2', 'B1', 'B2', 'CIN'], outputs: ['SUM1', 'SUM2', 'COUT'] },
    ],
  },

  // ── 74x84: 16 bit RAM (16×1), 16-pin ───────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // This is the 16-pin package variant of the same 16x1 RAM concept used by the
  // 7481, so the same functional storage model and caveats apply here.
  '7484': {
    name: '74x84',
    simpleName: '16 bit RAM (16×1)',
    description: '16 bit random-access memory organized as 16 words × 1 bit (16-pin package) (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['ram', 'memory', 'sequential', '16 bit'],
    guideOverview: 'The 7484 is another 16-word by 1 bit RAM, packaged with a few extra pins but used the same way logically: address the cell with A0-A3, write through DIN under CE/WE control, and read the stored bit on Q/Qn.',
    guidePinDescriptions: {
      A0:   'Address bit 0 (LSB).',
      A1:   'Address bit 1.',
      A2:   'Address bit 2.',
      A3:   'Address bit 3 (MSB).',
      DIN:  'Data input for write.',
      DINn: 'Complement data input (not used by simulation).',
      CE:   'Chip enable.',
      WE:   'Write enable.',
      Q:    'Data output.',
      Qn:   'Complement data output.',
      GND:  'Ground reference (pin 8).',
      VCC:  'Positive supply (+5 V) at pin 16.',
      NC1: 'No connection.', NC2: 'No connection.', NC3: 'No connection.', NC4: 'No connection.',
    },
    guideSections: [
      {
        title: 'Modeling Caveat',
        paragraphs: [
          'As with the 7481, DINn and real disabled-output electrical behavior are simplified. The simulator focuses on readable and writable 16x1 storage rather than bus-electrical fidelity.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'WE',   type: 'input' },
      { pin:  4, name: 'DIN',  type: 'input' },
      { pin:  5, name: 'DINn', type: 'input' },
      { pin:  6, name: 'CE',   type: 'input' },
      { pin:  7, name: 'NC1',  type: 'nc' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'Q',    type: 'output' },
      { pin: 10, name: 'Qn',   type: 'output' },
      { pin: 11, name: 'A2',   type: 'input' },
      { pin: 12, name: 'A3',   type: 'input' },
      { pin: 13, name: 'NC2',  type: 'nc' },
      { pin: 14, name: 'NC3',  type: 'nc' },
      { pin: 15, name: 'NC4',  type: 'nc' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM16x1', inputs: ['A0', 'A1', 'A2', 'A3', 'DIN', 'CE', 'WE'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },

  // ── 74x87: 4 bit true/complement/zero/one element, 14-pin ─────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits */
  // The select inputs choose whether each data bit passes through unchanged,
  // inverted, forced to 0, or forced to 1. That makes the part useful around
  // arithmetic units where you need controlled inversion or constants.
  '7487': {
    name: '74x87',
    simpleName: '4 bit TRUE/COMP/Z/ONE',
    description: '4 bit true/complement/zero/one element (bit-by-bit programmable inverter) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['programmable', 'combinational', 'complement', 'arithmetic'],
    guideOverview: 'The 7487 applies one of four modes bit-by-bit to inputs A through D: force 0, pass true, pass complement, or force 1. In arithmetic designs that makes it useful for controlled inversion, constant generation, and operand conditioning.',
    guidePinDescriptions: {
      S0:  'Mode-select bit 0. See truth table.',
      S1:  'Mode-select bit 1. Together with S0 selects mode: 00=zero, 01=true, 10=complement, 11=one.',
      A:   'Data input A.',
      B:   'Data input B.',
      C:   'Data input C.',
      D:   'Data input D.',
      QA:  'Processed output for bit A.',
      QB:  'Processed output for bit B.',
      QC:  'Processed output for bit C.',
      QD:  'Processed output for bit D.',
      GND: 'Ground reference (pin 7).',
      VCC: 'Positive supply (+5 V) at pin 14.',
      NC1: 'No connection.', NC2: 'No connection.',
    },
    guideSections: [
      {
        title: 'True/Complement/Zero/One Mode',
        paragraphs: ['S1,S0=00: all outputs 0; S1,S0=01: output = input (true); S1,S0=10: output = NOT input; S1,S0=11: all outputs 1. Useful for two’s complement arithmetic (pass complement, then add 1) or clearing a bus in a single step.'],
      },
    ],
    pinout: [
      { pin:  1, name: 'B',   type: 'input' },
      { pin:  2, name: 'A',   type: 'input' },
      { pin:  3, name: 'S0',  type: 'input' },
      { pin:  4, name: 'S1',  type: 'input' },
      { pin:  5, name: 'C',   type: 'input' },
      { pin:  6, name: 'D',   type: 'input' },
      { pin:  7, name: 'GND', type: 'power' },
      { pin:  8, name: 'QD',  type: 'output' },
      { pin:  9, name: 'QC',  type: 'output' },
      { pin: 10, name: 'QB',  type: 'output' },
      { pin: 11, name: 'QA',  type: 'output' },
      { pin: 12, name: 'NC1', type: 'nc' },
      { pin: 13, name: 'NC2', type: 'nc' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'TC01', inputs: ['S0', 'S1', 'A', 'B', 'C', 'D'], outputs: ['QA', 'QB', 'QC', 'QD'] },
    ],
  },
};
