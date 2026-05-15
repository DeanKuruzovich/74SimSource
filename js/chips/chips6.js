
// Chip definitions block 6
// Auto-generated from chips.js
//
// Review notes for this block:
// - These parts are mostly storage, counter, and bus-interface TTL devices.
// - The simulator models their logic-level behavior, control-pin polarity,
//   edge-sensitive storage, and tri-state output behavior.
// - Propagation delay, setup/hold violations, and metastable analog effects are
//   intentionally not modeled, but the functional truth-table behavior matches
//   the intended breadboard use for these parts.

export const CHIPS_BLOCK_6 = {
  // ── 74175: Quad D flip-flop with clear ─────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS175 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls175.pdf
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Four edge-triggered D storage elements share one rising-edge clock.
  // CLR is asynchronous and active LOW: forcing CLR low immediately clears all
  // Q outputs and drives all complementary Qn outputs high without waiting for
  // a clock edge.
  '74175': {
    name: '74x175',
    simpleName: 'Quad D FF',
    description: 'Quad D-type flip-flop with clear (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls175.pdf',
    tags: ['flip-flop', 'flip flop', 'd', 'quad', 'sequential', 'register'],
    guideOverview: 'The 74175 is four D flip-flops in one package with a shared rising-edge clock and a shared active LOW asynchronous clear. Each section stores one bit on the CLK rising edge, then presents both the true output Q and the inverted output Qn until the next clock or clear event.',
    guidePinDescriptions: {
      CLR: 'Active LOW asynchronous clear. Pull it LOW to force all Q outputs LOW and all Qn outputs HIGH immediately.',
      CLK: 'Shared clock input. All four flip-flops capture their D inputs together on the rising edge.',
      '1D': 'Data input for flip-flop 1. Its level is sampled only on CLK rising edges.',
      '2D': 'Data input for flip-flop 2. Its level is sampled only on CLK rising edges.',
      '3D': 'Data input for flip-flop 3. Its level is sampled only on CLK rising edges.',
      '4D': 'Data input for flip-flop 4. Its level is sampled only on CLK rising edges.',
    },
    guideSections: [
      {
        title: 'How It Works',
        paragraphs: [
          'When CLR is HIGH, each section waits for the next rising edge on CLK and then copies its D input into the internal state.',
          'Q is the stored bit and Qn is its complement, so the part is useful when you need both polarities without adding extra inverters.',
        ],
        note: 'This is a storage element, not a transparent latch: changing D between clock edges does not change the outputs.',
      },
    ],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1Qn', type: 'output' },
      { pin: 4, name: '1D', type: 'input' },
      { pin: 5, name: '2D', type: 'input' },
      { pin: 6, name: '2Qn', type: 'output' },
      { pin: 7, name: '2Q', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'CLK', type: 'input' },
      { pin: 10, name: '3Q', type: 'output' },
      { pin: 11, name: '3Qn', type: 'output' },
      { pin: 12, name: '3D', type: 'input' },
      { pin: 13, name: '4D', type: 'input' },
      { pin: 14, name: '4Qn', type: 'output' },
      { pin: 15, name: '4Q', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_QUAD',
        inputs: ['1D', '2D', '3D', '4D', 'CLK', 'CLR'],
        outputs: ['1Q', '1Qn', '2Q', '2Qn', '3Q', '3Qn', '4Q', '4Qn'],
      },
    ],
    sequential: true,
  },

  // ── 74191: Synchronous 4 bit Up/Down Binary Counter ────────────────────
  /* Primary source: Texas Instruments, SN74LS191 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls191.pdf
     Counter (digital) concept: https://en.wikipedia.org/wiki/Counter_(digital) */
  // This counter advances on the shared clock edge when CTEN is LOW.
  // D/U selects direction (LOW=up, HIGH=down) and LOAD is a synchronous,
  // active LOW parallel load that takes effect on the next rising clock edge.
  '74191': {
    name: '74x191',
    simpleName: 'Up/Down Counter',
    description: 'Synchronous 4 bit up/down binary counter (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls191.pdf',
    tags: ['counter', 'up/down', 'binary', '4 bit', 'synchronous', 'sequential'],
    guideOverview: 'The 74191 is a presettable 4 bit synchronous up/down counter. It counts on CLK edges when CTEN is active, loads A-D synchronously when LOAD is LOW, and exposes terminal-count status through MAX/MIN and RCO so counters can be chained.',
    guidePinDescriptions: {
      CTEN: 'Count enable, active LOW. LOW lets the next rising CLK edge change the count; HIGH freezes the count.',
      'D/U': 'Direction control. LOW counts up toward 15, HIGH counts down toward 0.',
      LOAD: 'Active LOW synchronous parallel load. When LOW, the next rising CLK edge loads A-D instead of counting.',
      CLK: 'Clock input. Count or load action happens on the rising edge.',
      'MAX/MIN': 'Terminal-count status output. It goes HIGH when the counter is enabled and has reached the end of the selected count direction.',
      RCO: 'Ripple-carry output for cascading. It is active LOW at terminal count when counting is enabled.',
    },
    guideSections: [
      {
        title: 'Count And Load Behavior',
        paragraphs: [
          'With LOAD held HIGH, the part counts on each rising CLK edge as long as CTEN is LOW. The D/U pin decides whether the count moves upward or downward.',
          'With LOAD pulled LOW, the next rising CLK edge copies A, B, C, and D into the counter instead of incrementing or decrementing.',
        ],
        list: [
          'Use CTEN to pause the counter without losing its current count.',
          'Use MAX/MIN and RCO when you want to detect terminal count or build wider counters.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'B', type: 'input' },
      { pin: 2, name: 'QB', type: 'output' },
      { pin: 3, name: 'QA', type: 'output' },
      { pin: 4, name: 'CTEN', type: 'input' },
      { pin: 5, name: 'D/U', type: 'input' },
      { pin: 6, name: 'QC', type: 'output' },
      { pin: 7, name: 'QD', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'D', type: 'input' },
      { pin: 10, name: 'C', type: 'input' },
      { pin: 11, name: 'LOAD', type: 'input' },
      { pin: 12, name: 'MAX/MIN', type: 'output' },
      { pin: 13, name: 'RCO', type: 'output' },
      { pin: 14, name: 'CLK', type: 'input' },
      { pin: 15, name: 'A', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_UPDOWN',
        inputs: ['A', 'B', 'C', 'D', 'CLK', 'CTEN', 'D/U', 'LOAD'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'MAX/MIN', 'RCO'],
      },
    ],
    sequential: true,
  },

  // ── 74193: Synchronous 4 bit Up/Down Binary Counter (dual clock) ───────
  /* Primary source: Texas Instruments, SN74LS193 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls193.pdf
     Counter (digital) concept: https://en.wikipedia.org/wiki/Counter_(digital) */
  // The 74193 splits count-up and count-down into separate clock inputs.
  // CLR is asynchronous active HIGH, LOAD is asynchronous active LOW, and the
  // CO/BO outputs indicate terminal carry/borrow conditions for cascading.
  '74193': {
    name: '74x193',
    simpleName: 'Up/Down Counter (DC)',
    description: 'Synchronous 4 bit up/down binary counter with dual clock (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls193.pdf',
    tags: ['counter', 'up/down', 'binary', '4 bit', 'synchronous', 'sequential', 'dual clock'],
    guideOverview: 'The 74193 is a presettable 4 bit up/down counter with separate UP and DOWN clock inputs. It can be cleared asynchronously with CLR, loaded asynchronously with LOAD, and cascaded using the active LOW CO and BO outputs.',
    guidePinDescriptions: {
      UP: 'Count-up clock input. A pulse here increments the counter when LOAD is HIGH and CLR is inactive.',
      DOWN: 'Count-down clock input. A pulse here decrements the counter when LOAD is HIGH and CLR is inactive.',
      CLR: 'Active HIGH asynchronous clear. Driving it HIGH forces the count to 0 immediately.',
      LOAD: 'Active LOW asynchronous parallel load. Driving it LOW copies A-D into the counter immediately.',
      CO: 'Carry output for the up-count path. It becomes active LOW at terminal count in the up direction.',
      BO: 'Borrow output for the down-count path. It becomes active LOW at terminal count in the down direction.',
    },
    guideSections: [
      {
        title: 'Using The Dual Clocks',
        paragraphs: [
          'Unlike the 74191, this part has separate UP and DOWN clock inputs, so direction is chosen by which clock you pulse instead of by a direction-control pin.',
          'LOAD and CLR do not wait for a clock edge. That makes the 74193 convenient when you need immediate preset or reset behavior.',
        ],
        note: 'If UP and DOWN are pulsed at the same time, real hardware behavior is not guaranteed. 74Sim is intended for ordinary one-clock-at-a-time breadboard use.',
      },
    ],
    pinout: [
      { pin: 1, name: 'B', type: 'input' },
      { pin: 2, name: 'QB', type: 'output' },
      { pin: 3, name: 'QA', type: 'output' },
      { pin: 4, name: 'DOWN', type: 'input' },
      { pin: 5, name: 'UP', type: 'input' },
      { pin: 6, name: 'QC', type: 'output' },
      { pin: 7, name: 'QD', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'D', type: 'input' },
      { pin: 10, name: 'C', type: 'input' },
      { pin: 11, name: 'LOAD', type: 'input' },
      { pin: 12, name: 'CO', type: 'output' },
      { pin: 13, name: 'BO', type: 'output' },
      { pin: 14, name: 'CLR', type: 'input' },
      { pin: 15, name: 'A', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_UPDOWN_DC',
        inputs: ['A', 'B', 'C', 'D', 'UP', 'DOWN', 'CLR', 'LOAD'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'CO', 'BO'],
      },
    ],
    sequential: true,
  },

  // ── 74240: Octal Buffer/Line Driver (inverting, tri-state) ─────────────
  /* Primary source: Texas Instruments, SN74LS240 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls240.pdf
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // Two independent 4 bit sections share the same package but have separate
  // active LOW enable pins. Each enabled output is the inverted logic state of
  // its input; disabled outputs float in high impedance. The cross-interleaved
  // pinout (1A inputs paired with 2Y outputs on one side) lets two 74240s face
  // each other for easy bidirectional bus buffering with inversion.
  '74240': {
    name: '74x240',
    simpleName: 'Octal Inverting Buffer (3-state)',
    description: 'Octal inverting buffer/line driver with tri-state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls240.pdf',
    tags: ['buffer', 'driver', 'octal', 'tri-state', 'inverting'],
    guideOverview: 'The 74240 is an octal inverting buffer/line driver split into two 4 bit groups. Each group has its own active LOW output-enable input, so you can independently drive or disconnect two separate buses. When an enable is LOW the output is the logical inverse of the input; when HIGH the outputs enter high impedance. The cross-interleaved pinout pairs the 1A inputs with 2Y outputs on the same side of the package, which allows two 74240s to be wired face-to-face for bidirectional bus driving.',
    guidePinDescriptions: {
      '1OE': 'Active LOW output enable for the 1A→1Y group. LOW = inverting buffers active; HIGH = 1Y1 1Y4 all Hi-Z.',
      '2OE': 'Active LOW output enable for the 2A→2Y group. LOW = inverting buffers active; HIGH = 2Y1 2Y4 all Hi-Z.',
      '1A1': 'Data input to inverting buffer 1 (group 1). Output 1Y1 = NOT(1A1) when 1OE is LOW.',
      '1A2': 'Data input to inverting buffer 2 (group 1).',
      '1A3': 'Data input to inverting buffer 3 (group 1).',
      '1A4': 'Data input to inverting buffer 4 (group 1).',
      '2A1': 'Data input to inverting buffer 1 (group 2). Output 2Y1 = NOT(2A1) when 2OE is LOW.',
      '2A2': 'Data input to inverting buffer 2 (group 2).',
      '2A3': 'Data input to inverting buffer 3 (group 2).',
      '2A4': 'Data input to inverting buffer 4 (group 2).',
    },
    guideSections: [
      {
        title: 'Octal Inverting Bus Driver',
        paragraphs: ['Each output is the logical inverse of its input when enabled. Pull either OE# LOW to enable that 4 bit group. HIGH-impedance mode lets you share a bus between multiple drivers safely.'],
        note: 'Use the 74244 for non-inverting operation. The cross-interleaved pinout enables bidirectional bus buffering with two 74240 chips.',
      },
    ],
    pinout: [
      { pin:  1, name: '1OE', type: 'input',  description: 'Output enable for group 1 (active LOW). LOW enables 1Y1 1Y4 as inverting buffers; HIGH = Hi-Z.' },
      { pin:  2, name: '1A1', type: 'input',  description: 'Input to inverting buffer 1A (group 1).' },
      { pin:  3, name: '2Y4', type: 'output', description: 'Inverted output 4 from group 2. Active when 2OE=LOW.' },
      { pin:  4, name: '1A2', type: 'input',  description: 'Input to inverting buffer 1B (group 1).' },
      { pin:  5, name: '2Y3', type: 'output', description: 'Inverted output 3 from group 2. Active when 2OE=LOW.' },
      { pin:  6, name: '1A3', type: 'input',  description: 'Input to inverting buffer 1C (group 1).' },
      { pin:  7, name: '2Y2', type: 'output', description: 'Inverted output 2 from group 2. Active when 2OE=LOW.' },
      { pin:  8, name: '1A4', type: 'input',  description: 'Input to inverting buffer 1D (group 1).' },
      { pin:  9, name: '2Y1', type: 'output', description: 'Inverted output 1 from group 2. Active when 2OE=LOW.' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: '2A1', type: 'input',  description: 'Input to inverting buffer 2A (group 2).' },
      { pin: 12, name: '1Y4', type: 'output', description: 'Inverted output 4 from group 1. Active when 1OE=LOW.' },
      { pin: 13, name: '2A2', type: 'input',  description: 'Input to inverting buffer 2B (group 2).' },
      { pin: 14, name: '1Y3', type: 'output', description: 'Inverted output 3 from group 1. Active when 1OE=LOW.' },
      { pin: 15, name: '2A3', type: 'input',  description: 'Input to inverting buffer 2C (group 2).' },
      { pin: 16, name: '1Y2', type: 'output', description: 'Inverted output 2 from group 1. Active when 1OE=LOW.' },
      { pin: 17, name: '2A4', type: 'input',  description: 'Input to inverting buffer 2D (group 2).' },
      { pin: 18, name: '1Y1', type: 'output', description: 'Inverted output 1 from group 1. Active when 1OE=LOW.' },
      { pin: 19, name: '2OE', type: 'input',  description: 'Output enable for group 2 (active LOW). LOW enables 2Y1 2Y4 as inverting buffers; HIGH = Hi-Z.' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'TRI_NOT_LO', inputs: ['1A1', '1OE'], output: '1Y1' },
      { type: 'TRI_NOT_LO', inputs: ['1A2', '1OE'], output: '1Y2' },
      { type: 'TRI_NOT_LO', inputs: ['1A3', '1OE'], output: '1Y3' },
      { type: 'TRI_NOT_LO', inputs: ['1A4', '1OE'], output: '1Y4' },
      { type: 'TRI_NOT_LO', inputs: ['2A1', '2OE'], output: '2Y1' },
      { type: 'TRI_NOT_LO', inputs: ['2A2', '2OE'], output: '2Y2' },
      { type: 'TRI_NOT_LO', inputs: ['2A3', '2OE'], output: '2Y3' },
      { type: 'TRI_NOT_LO', inputs: ['2A4', '2OE'], output: '2Y4' },
    ],
  },

  // ── 74244: Octal Buffer/Line Driver (non-inverting, tri-state) ─────────
  /* Primary source: Texas Instruments, SN74LS244 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls244.pdf
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // This is the non-inverting companion to the 74240. Each enabled output
  // reproduces its input level, and each 4 bit half can be enabled or floated
  // independently through its active LOW enable input.
  '74244': {
    name: '74x244',
    simpleName: 'Octal Buffer (non-inv, 3-state)',
    description: 'Octal non-inverting buffer/line driver with tri-state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls244.pdf',
    tags: ['buffer', 'driver', 'octal', 'tri-state', 'non-inverting'],
    guideOverview: 'The 74244 is an octal non-inverting buffer split into two 4 bit sections with separate active LOW enables. It is commonly used to strengthen signals or isolate logic from a shared data bus. Unlike the 74240, there is no inversion the output level matches the input. Both groups have active LOW enables, so both must be driven LOW to be active. The cross-interleaved pinout allows two chips to be wired face-to-face for bidirectional bus isolation.',
    guidePinDescriptions: {
      '1OE': 'Active LOW output enable for group 1 (1A→1Y). LOW = buffers active; HIGH = 1Y1 1Y4 all Hi-Z.',
      '2OE': 'Active LOW output enable for group 2 (2A→2Y). LOW = buffers active; HIGH = 2Y1 2Y4 all Hi-Z.',
      '1A1': 'Data input to non-inverting buffer 1A (group 1). Output 1Y1 = 1A1 when 1OE=LOW.',
      '1A2': 'Data input to non-inverting buffer 1B (group 1).',
      '1A3': 'Data input to non-inverting buffer 1C (group 1).',
      '1A4': 'Data input to non-inverting buffer 1D (group 1).',
      '2A1': 'Data input to non-inverting buffer 2A (group 2). Output 2Y1 = 2A1 when 2OE=LOW.',
      '2A2': 'Data input to non-inverting buffer 2B (group 2).',
      '2A3': 'Data input to non-inverting buffer 2C (group 2).',
      '2A4': 'Data input to non-inverting buffer 2D (group 2).',
    },
    guideSections: [
      {
        title: 'Octal Non-Inverting Bus Driver',
        paragraphs: ['Outputs reproduce inputs without inversion when enabled. Use OE1# and OE2# to independently enable each 4 bit half. High-impedance mode allows bus sharing.'],
        note: 'Use the 74240 for inverting operation. The 74244 is the most common chip for unidirectional bus buffering.',
      },
    ],
    pinout: [
      { pin:  1, name: '1OE', type: 'input',  description: 'Output enable for group 1 (active LOW). LOW enables 1Y1 1Y4 as non-inverting buffers; HIGH = Hi-Z.' },
      { pin:  2, name: '1A1', type: 'input',  description: 'Input to non-inverting buffer 1A (group 1).' },
      { pin:  3, name: '2Y4', type: 'output', description: 'Non-inverting output 4 from group 2. Active when 2OE=LOW.' },
      { pin:  4, name: '1A2', type: 'input',  description: 'Input to non-inverting buffer 1B (group 1).' },
      { pin:  5, name: '2Y3', type: 'output', description: 'Non-inverting output 3 from group 2. Active when 2OE=LOW.' },
      { pin:  6, name: '1A3', type: 'input',  description: 'Input to non-inverting buffer 1C (group 1).' },
      { pin:  7, name: '2Y2', type: 'output', description: 'Non-inverting output 2 from group 2. Active when 2OE=LOW.' },
      { pin:  8, name: '1A4', type: 'input',  description: 'Input to non-inverting buffer 1D (group 1).' },
      { pin:  9, name: '2Y1', type: 'output', description: 'Non-inverting output 1 from group 2. Active when 2OE=LOW.' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: '2A1', type: 'input',  description: 'Input to non-inverting buffer 2A (group 2).' },
      { pin: 12, name: '1Y4', type: 'output', description: 'Non-inverting output 4 from group 1. Active when 1OE=LOW.' },
      { pin: 13, name: '2A2', type: 'input',  description: 'Input to non-inverting buffer 2B (group 2).' },
      { pin: 14, name: '1Y3', type: 'output', description: 'Non-inverting output 3 from group 1. Active when 1OE=LOW.' },
      { pin: 15, name: '2A3', type: 'input',  description: 'Input to non-inverting buffer 2C (group 2).' },
      { pin: 16, name: '1Y2', type: 'output', description: 'Non-inverting output 2 from group 1. Active when 1OE=LOW.' },
      { pin: 17, name: '2A4', type: 'input',  description: 'Input to non-inverting buffer 2D (group 2).' },
      { pin: 18, name: '1Y1', type: 'output', description: 'Non-inverting output 1 from group 1. Active when 1OE=LOW.' },
      { pin: 19, name: '2OE', type: 'input',  description: 'Output enable for group 2 (active LOW). LOW enables 2Y1 2Y4 as non-inverting buffers; HIGH = Hi-Z.' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'TRI_BUFFER_LO', inputs: ['1A1', '1OE'], output: '1Y1' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A2', '1OE'], output: '1Y2' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A3', '1OE'], output: '1Y3' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A4', '1OE'], output: '1Y4' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A1', '2OE'], output: '2Y1' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A2', '2OE'], output: '2Y2' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A3', '2OE'], output: '2Y3' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A4', '2OE'], output: '2Y4' },
    ],
  },

  // ── 74245: Octal Bus Transceiver (tri-state) ──────────────────────────
  /* Primary source: Texas Instruments, SN74LS245 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls245.pdf
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // The 74245 is a bidirectional bus interface. DIR chooses which side drives
  // the other, and OE disables all eight channels at once so both buses can be
  // released into high impedance.
  '74245': {
    name: '74x245',
    simpleName: 'Octal Bus Transceiver',
    description: 'Octal bidirectional bus transceiver with tri-state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls245.pdf',
    tags: ['transceiver', 'bus', 'octal', 'tri-state', 'bidirectional'],
    guideOverview: 'The 74245 is an 8 bit bidirectional bus transceiver. When OE is LOW, one side drives the other based on the DIR pin: DIR=HIGH sends data from the A side to the B side, and DIR=LOW sends data from the B side to the A side. When OE is HIGH, all 8 channels go high impedance so both buses are fully released. This makes it ideal for safely interfacing two buses that may be independently driven.',
    guidePinDescriptions: {
      DIR: 'Direction control. HIGH = A-to-B (A drives B); LOW = B-to-A (B drives A).',
      OE: 'Output enable (active LOW). LOW = transceiver active; HIGH = all channels Hi-Z (both buses disconnected).',
      A1: 'Bidirectional bus line A1. Input when DIR=HIGH; output when DIR=LOW (and OE=LOW).',
      A8: 'Bidirectional bus line A8. Input when DIR=HIGH; output when DIR=LOW (and OE=LOW).',
      B1: 'Bidirectional bus line B1. Output when DIR=HIGH; input when DIR=LOW (and OE=LOW).',
      B8: 'Bidirectional bus line B8. Output when DIR=HIGH; input when DIR=LOW (and OE=LOW).',
    },
    guideSections: [
      {
        title: 'Bus Direction Control',
        paragraphs: [
          'Use this chip to pass a full byte between two buses without wiring each line individually. Set DIR for the direction you want, then pull OE LOW to let that side drive the other.',
          'When OE goes HIGH, all channels become high impedance, releasing both buses so another device can take control without conflict.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'DIR', type: 'input',  description: 'Direction select. HIGH = A→B (A side drives B side); LOW = B→A (B side drives A side).' },
      { pin:  2, name: 'A1',  type: 'input',  description: 'Bidirectional bus line A1. Drives B1 when DIR=HIGH; receives from B1 when DIR=LOW.' },
      { pin:  3, name: 'A2',  type: 'input',  description: 'Bidirectional bus line A2.' },
      { pin:  4, name: 'A3',  type: 'input',  description: 'Bidirectional bus line A3.' },
      { pin:  5, name: 'A4',  type: 'input',  description: 'Bidirectional bus line A4.' },
      { pin:  6, name: 'A5',  type: 'input',  description: 'Bidirectional bus line A5.' },
      { pin:  7, name: 'A6',  type: 'input',  description: 'Bidirectional bus line A6.' },
      { pin:  8, name: 'A7',  type: 'input',  description: 'Bidirectional bus line A7.' },
      { pin:  9, name: 'A8',  type: 'input',  description: 'Bidirectional bus line A8.' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'B8',  type: 'input',  description: 'Bidirectional bus line B8. Drives A8 when DIR=LOW; receives from A8 when DIR=HIGH.' },
      { pin: 12, name: 'B7',  type: 'input',  description: 'Bidirectional bus line B7.' },
      { pin: 13, name: 'B6',  type: 'input',  description: 'Bidirectional bus line B6.' },
      { pin: 14, name: 'B5',  type: 'input',  description: 'Bidirectional bus line B5.' },
      { pin: 15, name: 'B4',  type: 'input',  description: 'Bidirectional bus line B4.' },
      { pin: 16, name: 'B3',  type: 'input',  description: 'Bidirectional bus line B3.' },
      { pin: 17, name: 'B2',  type: 'input',  description: 'Bidirectional bus line B2.' },
      { pin: 18, name: 'B1',  type: 'input',  description: 'Bidirectional bus line B1. Drives A1 when DIR=LOW; receives from A1 when DIR=HIGH.' },
      { pin: 19, name: 'OE',  type: 'input',  description: 'Output enable, active LOW. LOW = transceiver operational; HIGH = all 8 channels Hi-Z.' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'TRANSCEIVER_8BIT',
        inputs: ['A1','A2','A3','A4','A5','A6','A7','A8','B1','B2','B3','B4','B5','B6','B7','B8','DIR','OE'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8','B1','B2','B3','B4','B5','B6','B7','B8'],
      },
    ],
  },

  // ── 74257: Quad 2-to-1 Multiplexer (tri-state) ────────────────────────
  /* Primary source: Texas Instruments, SN74LS257B datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls257b.pdf
     Multiplexer concept: https://en.wikipedia.org/wiki/Multiplexer
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // A shared select line chooses either the A or B input for all four channels.
  // OE is active LOW; when disabled, the outputs release the downstream bus
  // rather than forcing a logic 0 or 1.
  '74257': {
    name: '74x257',
    simpleName: 'Quad 2-to-1 Mux (TS)',
    description: 'Quad 2-to-1 data selector/multiplexer with tri-state outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls257b.pdf',
    tags: ['multiplexer', 'mux', '2-to-1', 'data selector', 'quad', 'tri-state'],
    guideOverview: 'The 74257 is four non-inverting 2-to-1 multiplexers that share one select line and one active LOW output enable. It is useful when an entire 4 bit word must be chosen from one of two sources and optionally disconnected from the next stage.',
    guidePinDescriptions: {
      SEL: 'Shared select input. LOW selects all A inputs, HIGH selects all B inputs.',
      OE: 'Active LOW output enable. HIGH tri-states all four outputs.',
    },
    guideSections: [
      {
        title: 'Quad Tri-State Multiplexer',
        paragraphs: ['SEL picks A or B for all four sections simultaneously. OE# independently disconnects the outputs from the bus useful for wired OR or bus-sharing arrangements.'],
      },
    ],
    pinout: [
      { pin: 1, name: 'SEL', type: 'input' },
      { pin: 2, name: '1A', type: 'input' },
      { pin: 3, name: '1B', type: 'input' },
      { pin: 4, name: '1Y', type: 'output' },
      { pin: 5, name: '2A', type: 'input' },
      { pin: 6, name: '2B', type: 'input' },
      { pin: 7, name: '2Y', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: '3Y', type: 'output' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '3A', type: 'input' },
      { pin: 12, name: '4Y', type: 'output' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: '4A', type: 'input' },
      { pin: 15, name: 'OE', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'MUX_2TO1_TRI', inputs: ['1A', '1B', 'SEL', 'OE'], output: '1Y' },
      { type: 'MUX_2TO1_TRI', inputs: ['2A', '2B', 'SEL', 'OE'], output: '2Y' },
      { type: 'MUX_2TO1_TRI', inputs: ['3A', '3B', 'SEL', 'OE'], output: '3Y' },
      { type: 'MUX_2TO1_TRI', inputs: ['4A', '4B', 'SEL', 'OE'], output: '4Y' },
    ],
  },

  // ── 74259: 8 bit Addressable Latch ─────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS259B datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls259b.pdf
     Latch/flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // The three address pins choose one of eight internal latches. With G LOW,
  // the selected latch is written with D while the other seven retain their
  // state; CLR LOW asynchronously resets every stored bit.
  '74259': {
    name: '74x259',
    simpleName: '8 bit Addr Latch',
    description: '8 bit addressable latch (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls259b.pdf',
    tags: ['latch', 'addressable', '8 bit', 'sequential'],
    guideOverview: 'The 74259 stores eight output bits, but you write them one at a time. A0-A2 choose which output bit you are addressing, D is the bit value to store, G enables the write, and CLR clears the whole latch bank asynchronously.',
    guidePinDescriptions: {
      D: 'Data bit to be written into the selected latch position.',
      G: 'Write enable or strobe. LOW allows the addressed latch to take the D value; HIGH makes all latches hold.',
      CLR: 'Active LOW asynchronous clear. LOW resets all eight stored bits immediately.',
    },
    guideSections: [
      {
        title: 'Addressed Storage',
        paragraphs: [
          'This device is helpful when you want a small output register but do not want to provide eight separate data inputs. Instead, you pick one latch with A0-A2 and write one bit at a time through D.',
          'Outputs that are not currently addressed keep their previous values, so you can build up an 8 bit pattern across several write operations.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'A0', type: 'input' },
      { pin: 2, name: 'A1', type: 'input' },
      { pin: 3, name: 'A2', type: 'input' },
      { pin: 4, name: 'Q0', type: 'output' },
      { pin: 5, name: 'Q1', type: 'output' },
      { pin: 6, name: 'Q2', type: 'output' },
      { pin: 7, name: 'Q3', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'Q4', type: 'output' },
      { pin: 10, name: 'Q5', type: 'output' },
      { pin: 11, name: 'Q6', type: 'output' },
      { pin: 12, name: 'Q7', type: 'output' },
      { pin: 13, name: 'D', type: 'input' },
      { pin: 14, name: 'G', type: 'input' },
      { pin: 15, name: 'CLR', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'ADDRESSABLE_LATCH',
        inputs: ['A0', 'A1', 'A2', 'D', 'G', 'CLR'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
      },
    ],
    sequential: true,
  },

  // ── 74273: Octal D flip-flop with clear ────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS273 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls273.pdf
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // Eight edge-triggered D flip-flops share one clock and one asynchronous,
  // active LOW clear input. It acts like an 8 bit register with direct,
  // non-inverted outputs only.
  '74273': {
    name: '74x273',
    simpleName: 'Octal D FF',
    description: 'Octal D-type flip-flop with clear (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls273.pdf',
    tags: ['flip-flop', 'flip flop', 'd', 'octal', 'sequential', 'register'],
    guideOverview: 'The 74273 is an 8 bit edge-triggered register with a shared rising-edge clock and an active LOW asynchronous clear. It captures eight input bits together and holds them stable until the next clock or clear event.',
    guidePinDescriptions: {
      CLR: 'Active LOW asynchronous clear. LOW forces all outputs LOW immediately.',
      CLK: 'Shared clock input. The register copies all eight D inputs on the rising edge.',
    },
    guideSections: [
      {
        title: 'Octal Parallel Register',
        paragraphs: ['The 74273 stores an 8 bit word on the rising clock edge and holds it until cleared or overwritten. CLR# immediately resets all outputs to 0 without waiting for a clock.'],
        note: 'No Q-bar outputs and no tri-state. For tri-state outputs use the 74374 or 74574.',
      },
    ],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1D', type: 'input' },
      { pin: 4, name: '2D', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '3D', type: 'input' },
      { pin: 7, name: '3Q', type: 'output' },
      { pin: 8, name: '4D', type: 'input' },
      { pin: 9, name: '4Q', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: '5Q', type: 'output' },
      { pin: 13, name: '5D', type: 'input' },
      { pin: 14, name: '6D', type: 'input' },
      { pin: 15, name: '6Q', type: 'output' },
      { pin: 16, name: '7D', type: 'input' },
      { pin: 17, name: '7Q', type: 'output' },
      { pin: 18, name: '8D', type: 'input' },
      { pin: 19, name: '8Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_OCTAL',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'CLK', 'CLR'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74373: Octal D Latch (tri-state) ───────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS373 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls373.pdf
     Latch/flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // LE controls whether the storage nodes are transparent (LE HIGH) or holding
  // their last value (LE LOW). OE is independent and active LOW, so the chip
  // can remember data internally even while its outputs are tri-stated.
  '74373': {
    name: '74x373',
    simpleName: 'Octal D Latch',
    description: 'Octal D-type transparent latch with tri-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls373.pdf',
    tags: ['latch', 'd', 'octal', 'tri-state', 'transparent', 'register'],
    guideOverview: 'The 74373 is an 8 bit transparent latch with tri-state outputs. LE controls whether data flows through into storage, while OE independently decides whether the stored data is actually driven onto the output pins.',
    guidePinDescriptions: {
      LE: 'Latch enable. HIGH makes the latch transparent so Q follows D; LOW freezes the last value.',
      OE: 'Active LOW output enable. HIGH disconnects the outputs without erasing the stored data.',
    },
    guideSections: [
      {
        title: 'Transparent Vs Latched',
        paragraphs: [
          'With LE HIGH, the part behaves like eight buffers feeding an internal storage node, so changing any D input immediately changes the stored value and the outputs if OE is LOW.',
          'When LE goes LOW, the last values are held. That is the usual operating mode when the latch is being used as a small bus register.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1D', type: 'input' },
      { pin: 4, name: '2D', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '3D', type: 'input' },
      { pin: 7, name: '3Q', type: 'output' },
      { pin: 8, name: '4D', type: 'input' },
      { pin: 9, name: '4Q', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'LE', type: 'input' },
      { pin: 12, name: '5Q', type: 'output' },
      { pin: 13, name: '5D', type: 'input' },
      { pin: 14, name: '6D', type: 'input' },
      { pin: 15, name: '6Q', type: 'output' },
      { pin: 16, name: '7D', type: 'input' },
      { pin: 17, name: '7Q', type: 'output' },
      { pin: 18, name: '8D', type: 'input' },
      { pin: 19, name: '8Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_LATCH_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'LE', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74374: Octal D flip-flop (tri-state) ──────────────────────────────
  /* Primary source: Texas Instruments, SN74LS374 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls374.pdf
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // This part is the edge-triggered counterpart to the 74373. CLK captures the
  // 8 bit input word on a rising edge, and OE can disconnect the outputs while
  // leaving the stored state unchanged internally.
  '74374': {
    name: '74x374',
    simpleName: 'Octal D FF (TS)',
    description: 'Octal D-type flip-flop with tri-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls374.pdf',
    tags: ['flip-flop', 'flip flop', 'd', 'octal', 'tri-state', 'sequential', 'register'],
    guideOverview: 'The 74374 is an 8 bit edge-triggered register with tri-state outputs. It captures input data only on CLK rising edges, then keeps the stored byte until another clock arrives.',
    guidePinDescriptions: {
      CLK: 'Shared rising-edge clock for all eight storage bits.',
      OE: 'Active LOW output enable. HIGH disconnects the outputs while the internal register keeps its stored byte.',
    },
    guideSections: [
      {
        title: 'Edge-Triggered Octal Register with Tri-State',
        paragraphs: ['Data is captured on the rising CLK edge. The OE# pin disconnects all outputs without erasing the internal register ideal for bus-sharing applications.'],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1D', type: 'input' },
      { pin: 4, name: '2D', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '3D', type: 'input' },
      { pin: 7, name: '3Q', type: 'output' },
      { pin: 8, name: '4D', type: 'input' },
      { pin: 9, name: '4Q', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: '5Q', type: 'output' },
      { pin: 13, name: '5D', type: 'input' },
      { pin: 14, name: '6D', type: 'input' },
      { pin: 15, name: '6Q', type: 'output' },
      { pin: 16, name: '7D', type: 'input' },
      { pin: 17, name: '7Q', type: 'output' },
      { pin: 18, name: '8D', type: 'input' },
      { pin: 19, name: '8Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'CLK', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74541: Octal Buffer/Line Driver (non-inverting, tri-state) ─────────
  /* Primary source: Texas Instruments, SN74LS541 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls541.pdf
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // Functionally this is a strong non-inverting bus driver with two active LOW
  // enable inputs that must both be asserted before any output drives. That
  // dual-enable arrangement is the main distinction from simpler octal buffers.
  '74541': {
    name: '74x541',
    simpleName: 'Octal Buffer',
    description: 'Octal buffer/line driver with dual independent output-enable (tri-state) (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls541.pdf',
    tags: ['buffer', 'driver', 'octal', 'tri-state'],
    guideOverview: 'The 74541 is an octal non-inverting line driver that only drives when both output-enable inputs are active. It is commonly used where one extra gating condition is needed before a full byte is allowed onto a bus.',
    guidePinDescriptions: {
      OE1: 'First active LOW output-enable input. HIGH disables every output.',
      OE2: 'Second active LOW output-enable input. HIGH also disables every output.',
    },
    guideSections: [
      {
        title: 'Dual-Enable Octal Buffer',
        paragraphs: ['Both OE1# and OE2# must be LOW before any output drives. This extra gate allows simple chip-select logic to control the buffer without external AND gates.'],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE1', type: 'input' },
      { pin: 2, name: 'A1', type: 'input' },
      { pin: 3, name: 'A2', type: 'input' },
      { pin: 4, name: 'A3', type: 'input' },
      { pin: 5, name: 'A4', type: 'input' },
      { pin: 6, name: 'A5', type: 'input' },
      { pin: 7, name: 'A6', type: 'input' },
      { pin: 8, name: 'A7', type: 'input' },
      { pin: 9, name: 'A8', type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'Y8', type: 'output' },
      { pin: 12, name: 'Y7', type: 'output' },
      { pin: 13, name: 'Y6', type: 'output' },
      { pin: 14, name: 'Y5', type: 'output' },
      { pin: 15, name: 'Y4', type: 'output' },
      { pin: 16, name: 'Y3', type: 'output' },
      { pin: 17, name: 'Y2', type: 'output' },
      { pin: 18, name: 'Y1', type: 'output' },
      { pin: 19, name: 'OE2', type: 'input' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A1', 'OE1', 'OE2'], output: 'Y1' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A2', 'OE1', 'OE2'], output: 'Y2' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A3', 'OE1', 'OE2'], output: 'Y3' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A4', 'OE1', 'OE2'], output: 'Y4' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A5', 'OE1', 'OE2'], output: 'Y5' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A6', 'OE1', 'OE2'], output: 'Y6' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A7', 'OE1', 'OE2'], output: 'Y7' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A8', 'OE1', 'OE2'], output: 'Y8' },
    ],
  },

  // ── 74573: Octal D Latch (tri-state) ──────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS573 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls573.pdf
     Latch/flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // Logic behavior matches the 74373, but the pins are arranged for easier bus
  // routing: D inputs are grouped on one side and Q outputs on the other. LE is
  // transparent-high and OE is active LOW.
  '74573': {
    name: '74x573',
    simpleName: 'Octal D Latch',
    description: 'Octal D-type transparent latch with tri-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls573.pdf',
    tags: ['latch', 'd', 'octal', 'tri-state', 'transparent'],
    guideOverview: 'The 74573 is functionally an octal transparent latch with tri-state outputs, similar to the 74373 but with a bus-friendly pin order. It is useful when you want all data inputs together and all outputs together on opposite sides of the package.',
    guidePinDescriptions: {
      LE: 'Latch enable. HIGH makes the latch transparent; LOW holds the most recent byte.',
      OE: 'Active LOW output enable. HIGH disconnects the outputs without clearing the stored byte.',
    },
    guideSections: [
      {
        title: 'Bus-Friendly Transparent Latch',
        paragraphs: ['Same logic as 74373 but with all D inputs grouped on one side and all Q outputs on the other for easier PCB and breadboard routing. LE HIGH = transparent; LE LOW = hold.'],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1D', type: 'input' },
      { pin: 3, name: '2D', type: 'input' },
      { pin: 4, name: '3D', type: 'input' },
      { pin: 5, name: '4D', type: 'input' },
      { pin: 6, name: '5D', type: 'input' },
      { pin: 7, name: '6D', type: 'input' },
      { pin: 8, name: '7D', type: 'input' },
      { pin: 9, name: '8D', type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'LE', type: 'input' },
      { pin: 12, name: '8Q', type: 'output' },
      { pin: 13, name: '7Q', type: 'output' },
      { pin: 14, name: '6Q', type: 'output' },
      { pin: 15, name: '5Q', type: 'output' },
      { pin: 16, name: '4Q', type: 'output' },
      { pin: 17, name: '3Q', type: 'output' },
      { pin: 18, name: '2Q', type: 'output' },
      { pin: 19, name: '1Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_LATCH_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'LE', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74574: Octal D flip-flop (tri-state, edge-triggered) ──────────────
  /* Primary source: Texas Instruments, SN74LS574 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls574.pdf
     Flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // This is the bus-oriented pinout version of the 74374. Inputs are grouped,
  // outputs are grouped, capture occurs on a rising clock edge, and OE can
  // disconnect the outputs while the internal register keeps its stored state.
  '74574': {
    name: '74x574',
    simpleName: 'Octal D FF (TS)',
    description: 'Octal D-type edge-triggered flip-flop with tri-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls574.pdf',
    tags: ['flip-flop', 'flip flop', 'd', 'octal', 'tri-state', 'edge-triggered', 'sequential'],
    guideOverview: 'The 74574 is an 8 bit rising-edge register with tri-state outputs and a bus-oriented pinout. It fills the same role as the 74374 when PCB or breadboard routing benefits from having all inputs together and all outputs together.',
    guidePinDescriptions: {
      CLK: 'Shared rising-edge clock input for the whole byte.',
      OE: 'Active LOW output enable. HIGH disconnects the outputs while leaving the stored register contents intact.',
    },
    guideSections: [
      {
        title: 'Bus-Friendly Octal Register',
        paragraphs: ['Same logic as 74374 but with all D inputs grouped together and all Q outputs together on the opposite side ideal when routing a full data bus across a breadboard.'],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1D', type: 'input' },
      { pin: 3, name: '2D', type: 'input' },
      { pin: 4, name: '3D', type: 'input' },
      { pin: 5, name: '4D', type: 'input' },
      { pin: 6, name: '5D', type: 'input' },
      { pin: 7, name: '6D', type: 'input' },
      { pin: 8, name: '7D', type: 'input' },
      { pin: 9, name: '8D', type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: '8Q', type: 'output' },
      { pin: 13, name: '7Q', type: 'output' },
      { pin: 14, name: '6Q', type: 'output' },
      { pin: 15, name: '5Q', type: 'output' },
      { pin: 16, name: '4Q', type: 'output' },
      { pin: 17, name: '3Q', type: 'output' },
      { pin: 18, name: '2Q', type: 'output' },
      { pin: 19, name: '1Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'CLK', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74595: 8 bit Shift Register with Output Latch ─────────────────────
  /* Primary source: Texas Instruments, SN74LS595 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls595.pdf
     Shift register concept: https://en.wikipedia.org/wiki/Shift_register
     Latch/flip-flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // The device contains two 8 bit registers: a shift register clocked by SRCLK
  // and a storage/output register clocked by RCLK. SRCLR clears only the shift
  // register, OE tri-states QA-QH, and QHs remains the cascade output from the
  // shift chain even when the parallel outputs are disabled.
  '74595': {
    name: '74x595',
    simpleName: '8 bit Shift Reg + Output Latch',
    description: '8 bit serial-in, parallel-out (SIPO) shift register with a separate output latch. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls595.pdf',
    tags: ['shift register', 'latch', 'serial', 'parallel', '8 bit', 'sequential', 'sipo'],
    guideOverview: 'The 74595 is a serial-in, parallel-out shift register with a separate output latch. It has two internal registers: a shift register controlled by SRCLK, and a storage register controlled by RCLK. You clock serial bits into the shift register on SRCLK rising edges; the parallel outputs (QA QH) only update when you give RCLK a rising edge, copying the shift register contents to the output latch all at once. This two-stage design lets you prepare the next byte invisibly while the previous byte stays displayed. SRCLR# (active LOW) resets the shift register without affecting the output latch. OE# (active LOW) tri-states QA QH without clearing either register. QHs is always the last stage of the shift register ideal for cascading multiple 74595 chips.',
    guidePinDescriptions: {
      SER:   'Serial data input. Sampled on each SRCLK rising edge and shifted into bit 0 of the shift register.',
      SRCLK: 'Shift-register clock. Rising edge shifts all bits up by one and samples SER into the first stage.',
      RCLK:  'Storage/latch clock. Rising edge copies the current shift-register contents to QA QH output register.',
      SRCLR: 'Shift-register clear (active LOW). Drive LOW to reset all shift register bits to 0. Does not affect the output latch.',
      OE:    'Output enable (active LOW). HIGH tri-states QA QH but does not disturb the output latch or shift register. QHs always stays active.',
      QHs:   'Serial cascade output from the last shift-register stage. Connect to SER of the next 74595 to chain multiple chips.',
      QA:    'Parallel output bit 0 (LSB). Reflects the stored latch contents when OE=LOW.',
      QH:    'Parallel output bit 7 (MSB). Reflects the stored latch contents when OE=LOW.',
    },
    guideSections: [
      {
        title: 'Shift Then Latch',
        paragraphs: [
          'SRCLK and RCLK perform different jobs. SRCLK moves bits through the internal shift register one step per rising edge while RCLK publishes the current 8 bit word to QA QH all at once.',
          'That separation makes the 74595 ideal for LED driving and microcontroller output expansion: you can prepare the next output byte in the hidden shift register and then update every output simultaneously with a single RCLK pulse.',
        ],
        list: [
          'Keep OE LOW for active parallel outputs, or drive HIGH to disconnect QA QH from the bus without losing data.',
          'Connect QHs to SER of the next 74595 to daisy-chain as many chips as needed the SRCLK and RCLK lines are shared.',
        ],
        note: 'SRCLR clears the shift register only. To clear the visible outputs you must also pulse RCLK after clearing.',
      },
    ],
    pinout: [
      { pin:  1, name: 'QB',    type: 'output', description: 'Parallel output bit 1 from the output latch. Active when OE=LOW.' },
      { pin:  2, name: 'QC',    type: 'output', description: 'Parallel output bit 2 from the output latch. Active when OE=LOW.' },
      { pin:  3, name: 'QD',    type: 'output', description: 'Parallel output bit 3 from the output latch. Active when OE=LOW.' },
      { pin:  4, name: 'QE',    type: 'output', description: 'Parallel output bit 4 from the output latch. Active when OE=LOW.' },
      { pin:  5, name: 'QF',    type: 'output', description: 'Parallel output bit 5 from the output latch. Active when OE=LOW.' },
      { pin:  6, name: 'QG',    type: 'output', description: 'Parallel output bit 6 from the output latch. Active when OE=LOW.' },
      { pin:  7, name: 'QH',    type: 'output', description: 'Parallel output bit 7 (MSB) from the output latch. Active when OE=LOW.' },
      { pin:  8, name: 'GND',   type: 'power' },
      { pin:  9, name: 'QHs',   type: 'output', description: 'Serial cascade output from the last stage of the shift register. Connect to SER of the next 74595 in a chain.' },
      { pin: 10, name: 'SRCLR', type: 'input',  description: 'Shift-register clear (active LOW). Drive LOW to reset the shift register to all zeros. Does not affect the output latch.' },
      { pin: 11, name: 'SRCLK', type: 'input',  description: 'Shift-register clock. Rising edge shifts data: SER enters bit 0, each bit moves to the next stage.' },
      { pin: 12, name: 'RCLK',  type: 'input',  description: 'Storage register (latch) clock. Rising edge transfers current shift register contents to QA QH outputs.' },
      { pin: 13, name: 'OE',    type: 'input',  description: 'Output enable (active LOW). HIGH tri-states QA QH without affecting stored data. QHs remains unaffected.' },
      { pin: 14, name: 'SER',   type: 'input',  description: 'Serial data input. The bit present here is sampled into the shift register on each SRCLK rising edge.' },
      { pin: 15, name: 'QA',    type: 'output', description: 'Parallel output bit 0 (LSB) from the output latch. Active when OE=LOW.' },
      { pin: 16, name: 'VCC',   type: 'power' },
    ],
    gates: [
      {
        type: 'SHIFT_REG_LATCH',
        inputs: ['SER', 'SRCLK', 'RCLK', 'SRCLR', 'OE'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH', 'QHs'],
      },
    ],
    sequential: true,
  },
};
