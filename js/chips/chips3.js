// Chip definitions block 3
// Auto-generated from chips.js

export const CHIPS_BLOCK_3 = {
  // ── 7446: BCD to 7 segment decoder (common anode, open collector, 30V) ─
  /* Primary source: Texas Instruments, SN7446A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7446a.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector
     Decoder/demultiplexer concept: https://en.wikipedia.org/wiki/Multiplexer */
  '74x46': {
    name: '74x46',
    simpleName: 'BCD to 7-Seg (OC)',
    description: 'BCD to 7 segment decoder/driver (open collector, 30V) (16-pin)',
    guideOverview: 'The 74x46 decodes a 4 bit BCD input into seven segment drive signals (a g) for a common anode 7 segment display. Outputs are open collector rated to 30 V, allowing direct lamp driving. Three special function pins Lamp Test (LT#), Blanking Input/Ripple Blanking Output (BI/RBO#), and Ripple Blanking Input (RBI#) control display blanking and lamp test. Functionally identical to the 74x47 but with higher voltage outputs.',
    guidePinDescriptions: {
      B:        'BCD input bit 1 (second least significant).',
      C:        'BCD input bit 2.',
      'LT':     'Lamp Test input (active LOW). Pull LOW to turn on all segments simultaneously for testing.',
      'BI/RBO': 'Blanking Input / Ripple Blanking Output (active LOW). As an input (BI): pulling LOW blanks the display. As an output (RBO): goes LOW when RBI is LOW and BCD input is 0.',
      'RBI':    'Ripple Blanking Input (active LOW). Pull LOW to suppress leading/trailing zeros.',
      D:        'BCD input bit 3 (MSB).',
      A:        'BCD input bit 0 (LSB).',
      GND:      'Ground reference (pin 8).',
      e:        'Segment e driver output (active LOW, open collector). LOW activates segment.',
      d:        'Segment d driver output (active LOW, open collector). LOW activates segment.',
      c:        'Segment c driver output (active LOW, open collector). LOW activates segment.',
      b:        'Segment b driver output (active LOW, open collector). LOW activates segment.',
      a:        'Segment a driver output (active LOW, open collector). LOW activates segment.',
      g:        'Segment g driver output (active LOW, open collector). LOW activates segment.',
      f:        'Segment f driver output (active LOW, open collector). LOW activates segment.',
      VCC:      'TTL supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'BCD to 7 Segment Decoding',
        paragraphs: [
          'The chip maps BCD values-0-9 to the correct segment combination. BCD values 10-15 produce non standard patterns. Outputs are active LOW: a LOW on any output lights the corresponding segment.',
          'Connect each output through a current limiting resistor to the segment anode, then connect all common anodes to VCC (common anode display). The open collector outputs can drive displays at voltages up to 30 V.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7446a.pdf',
    tags: ['7 segment', '7 seg', 'decoder', 'driver', 'bcd', 'display', 'open collector'],
    pinout: [
      { pin: 1, name: 'B', type: 'input' },
      { pin: 2, name: 'C', type: 'input' },
      { pin: 3, name: 'LT', type: 'input' },
      { pin: 4, name: 'BI/RBO', type: 'input' },
      { pin: 5, name: 'RBI', type: 'input' },
      { pin: 6, name: 'D', type: 'input' },
      { pin: 7, name: 'A', type: 'input' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'e', type: 'output' },
      { pin: 10, name: 'd', type: 'output' },
      { pin: 11, name: 'c', type: 'output' },
      { pin: 12, name: 'b', type: 'output' },
      { pin: 13, name: 'a', type: 'output' },
      { pin: 14, name: 'g', type: 'output' },
      { pin: 15, name: 'f', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'BCD_7SEG', inputs: ['A', 'B', 'C', 'D'], outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
    ],
  },

  // ── 7451: 2-wide 2 input / 2-wide 3 input AND OR INVERT ───────────────
  /* Primary source: Texas Instruments, SN74LS51 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls51.pdf */
  '74x51': {
    name: '74x51',
    simpleName: 'Dual AND OR INVERT',
    description: 'Two AND OR INVERT gates: 2-wide 2-input and 2-wide 3-input. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls51.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic', 'dual', '2-wide'],
    guideOverview: 'The 74x51 provides two AND OR INVERT gates. Gate 1 is 2-wide 2 input: Y=LOW when (1A·1B) or (1C·1D). Gate 2 is 2-wide 3 input: Y=LOW when (2A·2B·2C) or (2D·2E·2F). Commonly used in compact sum of products logic, decoders, and state machines.',
    guidePinDescriptions: {
      '1A':  'Gate 1 (2-wide 2 input AOI): AND group A, input 1.',
      '1B':  'Gate 1: AND group A, input 2.',
      '2A':  'Gate 2 (2-wide 3 input AOI): AND group A, input 1.',
      '2B':  'Gate 2: AND group A, input 2.',
      '2C':  'Gate 2: AND group A, input 3.',
      '2Y':  'Gate 2 output. LOW when (2A AND 2B AND 2C) OR (2D AND 2E AND 2F).',
      'GND': 'Ground reference (pin 7).',
      '1Y':  'Gate 1 output. LOW when (1A AND 1B) OR (1C AND 1D).',
      '1C':  'Gate 1: AND group B, input 1.',
      '1D':  'Gate 1: AND group B, input 2.',
      '2D':  'Gate 2: AND group B, input 1.',
      '2E':  'Gate 2: AND group B, input 2.',
      '2F':  'Gate 2: AND group B, input 3.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'AND OR INVERT (AOI) Logic',
        paragraphs: [
          'An AOI gate implements the complement of a sum of products (SOP) expression in a single gate, which is more efficient than separate AND and OR gates. The output goes LOW when any AND group has all inputs HIGH.',
          'Gate 1: NOT((1A AND 1B) OR (1C AND 1D)). Gate 2: NOT((2A AND 2B AND 2C) OR (2D AND 2E AND 2F)).',
        ],
        list: [
          'Tie unused inputs of an AND group to VCC to keep it from inadvertently asserting the output.',
          'Pair with a 74x00 NAND to build arbitrary SOP logic efficiently.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input',  description: 'Gate 1 (2-wide 2 input) AND group A, input 1' },
      { pin: 2,  name: '1B',  type: 'input',  description: 'Gate 1 (2-wide 2 input) AND group A, input 2' },
      { pin: 3,  name: '2A',  type: 'input',  description: 'Gate 2 (2-wide 3 input) AND group A, input 1' },
      { pin: 4,  name: '2B',  type: 'input',  description: 'Gate 2 (2-wide 3 input) AND group A, input 2' },
      { pin: 5,  name: '2C',  type: 'input',  description: 'Gate 2 (2-wide 3 input) AND group A, input 3' },
      { pin: 6,  name: '2Y',  type: 'output', description: 'Gate 2 output: LOW when (2A·2B·2C) OR (2D·2E·2F)' },
      { pin: 7,  name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: '1Y',  type: 'output', description: 'Gate 1 output: LOW when (1A·1B) OR (1C·1D)' },
      { pin: 9,  name: '1C',  type: 'input',  description: 'Gate 1 (2-wide 2 input) AND group B, input 1' },
      { pin: 10, name: '1D',  type: 'input',  description: 'Gate 1 (2-wide 2 input) AND group B, input 2' },
      { pin: 11, name: '2D',  type: 'input',  description: 'Gate 2 (2-wide 3 input) AND group B, input 1' },
      { pin: 12, name: '2E',  type: 'input',  description: 'Gate 2 (2-wide 3 input) AND group B, input 2' },
      { pin: 13, name: '2F',  type: 'input',  description: 'Gate 2 (2-wide 3 input) AND group B, input 3' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // Gate 1: NOT((1A&1B)|(1C&1D))  2-wide 2 input AOI
      { type: 'AOI_2WIDE', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      // Gate 2: NOT((2A&2B&2C)|(2D&2E&2F))  2-wide 3 input AOI
      { type: 'AOI_33', inputs: ['2A', '2B', '2C', '2D', '2E', '2F'], output: '2Y' },
    ],
  },

  // ── 7454: 4-wide AND OR INVERT, 2-3-3-2 configuration ─────────────────
  /* Primary source: Texas Instruments, SN74LS54 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls54.pdf */
  '74x54': {
    name: '74x54',
    simpleName: '4-Wide AND OR INVERT (2-3-3-2)',
    description: 'Single 4-wide AND OR INVERT gate with 2-3-3-2 input configuration. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls54.pdf',
    tags: ['aoi', 'and or invert', 'gate', 'logic', 'complex gate'],
    guideOverview: 'The 74x54 is a single 4-wide AND OR INVERT (AOI) gate. Four AND sections (sized 2-3-3-2) feed a common NOR to produce output Y. Y goes LOW when any AND section has all its inputs HIGH. Pin 8 is not connected; the output Y is at pin 6.',
    guidePinDescriptions: {
      '1A':  'Input A of the first AND section (2 input).',
      '1B':  'Input B of the first AND section (2 input).',
      '2A':  'Input A of the second AND section (3 input).',
      '2B':  'Input B of the second AND section (3 input).',
      '2C':  'Input C of the second AND section (3 input).',
      Y:     'AOI output. LOW when any AND section is fully HIGH. NOT((1A·1B)+(2A·2B·2C)+(3A·3B·3C)+(4A·4B)).',
      GND:   'Ground reference.',
      NC:    'Not connected. Leave unconnected.',
      '3A':  'Input A of the third AND section (3 input).',
      '3B':  'Input B of the third AND section (3 input).',
      '3C':  'Input C of the third AND section (3 input).',
      '4A':  'Input A of the fourth AND section (2 input).',
      '4B':  'Input B of the fourth AND section (2 input).',
      VCC:   'Positive supply (+5 V TTL).',
    },
    pinout: [
      { pin:  1, name: '1A',  type: 'input',  description: 'First AND section (2 input): input A' },
      { pin:  2, name: '1B',  type: 'input',  description: 'First AND section (2 input): input B' },
      { pin:  3, name: '2A',  type: 'input',  description: 'Second AND section (3 input): input A' },
      { pin:  4, name: '2B',  type: 'input',  description: 'Second AND section (3 input): input B' },
      { pin:  5, name: '2C',  type: 'input',  description: 'Second AND section (3 input): input C' },
      { pin:  6, name: 'Y',   type: 'output', description: 'AOI output: LOW when any AND section is all-HIGH' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'NC',  type: 'nc',     description: 'Not connected' },
      { pin:  9, name: '3A',  type: 'input',  description: 'Third AND section (3 input): input A' },
      { pin: 10, name: '3B',  type: 'input',  description: 'Third AND section (3 input): input B' },
      { pin: 11, name: '3C',  type: 'input',  description: 'Third AND section (3 input): input C' },
      { pin: 12, name: '4A',  type: 'input',  description: 'Fourth AND section (2 input): input A' },
      { pin: 13, name: '4B',  type: 'input',  description: 'Fourth AND section (2 input): input B' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    // AOI_2332: Y = NOT((1A·1B) OR (2A·2B·2C) OR (3A·3B·3C) OR (4A·4B))
    gates: [
      { type: 'AOI_2332', inputs: ['1A','1B','2A','2B','2C','3A','3B','3C','4A','4B'], output: 'Y' },
    ],
    guideSections: [
      {
        title: 'AND OR INVERT Logic (2-3-3-2)',
        paragraphs: [
          'The 74x54 has four AND sections with 2, 3, 3, and 2 inputs respectively. All four AND outputs feed a common NOR gate to produce the single active LOW output Y.',
          'Y is LOW when any one AND section has all its inputs HIGH. Y is HIGH only when every AND section has at least one LOW input.',
        ],
        formulas: [
          'Y = NOT((1A·1B) OR (2A·2B·2C) OR (3A·3B·3C) OR (4A·4B))',
        ],
        note: 'The output Y is at pin 6. Pin 8 is not connected (NC). Do not confuse with the 74x55, which uses a 4-4 (two 4 input AND) configuration.',
      },
    ],
  },

  // ── 7470: AND gated JK positive edge triggered flip flop with preset and clear ─
  /* Primary source: Texas Instruments, SN7470 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7470.pdf
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x70': {
    name: '74x70',
    simpleName: 'JK Flip Flop (AND)',
    description: 'AND gated JK edge triggered flip flop with preset and clear (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7470.pdf',
    tags: ['flip flop', 'flip flop', 'jk', 'sequential', 'edge triggered'],
    guideOverview: 'The 74x70 is a single positive edge triggered JK flip flop with AND gated J and K inputs. Both J and K are ANDs of two inputs (1J AND 2J for J; 1K AND 2K for K), giving an extra enable or gating capability without external logic. Active LOW asynchronous preset (PRE#) and clear (CLR#) override the clock.',
    guidePinDescriptions: {
      'NC1':  'Not connected (pin 1). Leave unconnected.',
      '1J':   'J input, bit 1 internally ANDed with 2J to form the effective J input.',
      '2J':   'J input, bit 2 internally ANDed with 1J.',
      'PRE':  'Asynchronous preset, active LOW. Pull LOW to force Q HIGH immediately, overriding clock.',
      'Q':    'True output. Reflects stored state.',
      'Qn':   'Inverted output (complement of Q).',
      'GND':  'Ground reference (pin 7).',
      '1K':   'K input, bit 1 internally ANDed with 2K.',
      '2K':   'K input, bit 2 internally ANDed with 1K.',
      'NC2':  'Not connected (pin 10). Leave unconnected.',
      'CLK':  'Clock input. Flip flop updates on the rising edge.',
      'NC3':  'Not connected (pin 12). Leave unconnected.',
      'CLR':  'Asynchronous clear, active LOW. Pull LOW to force Q LOW immediately.',
      'VCC':  'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'JK Flip Flop Operation',
        paragraphs: [
          'The JK flip flop is the universal flip flop: J=0,K=0 holds state; J=1,K=0 sets Q HIGH; J=0,K=1 resets Q LOW; J=1,K=1 toggles Q. Updates happen on the active clock edge.',
          'The AND gated inputs let you use the second input of each pair as an enable. Tie 1J=2J=HIGH to use J as a single input; tie 1K=2K=HIGH for K.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'NC1', type: 'nc' },
      { pin: 2, name: '1J', type: 'input' },
      { pin: 3, name: '2J', type: 'input' },
      { pin: 4, name: 'PRE', type: 'input' },
      { pin: 5, name: 'Q', type: 'output' },
      { pin: 6, name: 'Qn', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '1K', type: 'input' },
      { pin: 9, name: '2K', type: 'input' },
      { pin: 10, name: 'NC2', type: 'nc' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: 'NC3', type: 'nc' },
      { pin: 13, name: 'CLR', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'JK_FF', inputs: ['1J', '2J', '1K', '2K', 'CLK', 'PRE', 'CLR'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },

  // ── 7472: AND gated JK controller device flip flop with preset and clear ───
  /* Primary source: Texas Instruments, SN7472 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7472.pdf
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x72': {
    name: '74x72',
    simpleName: 'JK MS Flip Flop',
    description: 'AND gated JK controller device flip flop with preset and clear (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7472.pdf',
    tags: ['flip flop', 'flip flop', 'jk', 'controller device', 'sequential'],
    guideOverview: 'The 74x72 is an AND gated JK controller device flip flop with three J and three K inputs plus active LOW preset and clear. The three inputs on each side are internally ANDed, providing gating without extra logic. Being a controller device device, it captures on the rising clock edge and transfers to the output on the falling clock edge note this differs from the edge triggered 74x70.',
    guidePinDescriptions: {
      'NC':   'Not connected (pin 1). Leave unconnected.',
      '1J':   'J input, bit 1 ANDed with 2J and 3J.',
      '2J':   'J input, bit 2.',
      'PRE':  'Asynchronous preset, active LOW. Forces Q HIGH immediately.',
      'Q':    'True output.',
      'Qn':   'Inverted output.',
      'GND':  'Ground reference (pin 7).',
      '1K':   'K input, bit 1 ANDed with 2K and 3K.',
      '2K':   'K input, bit 2.',
      '3K':   'K input, bit 3.',
      'CLK':  'Clock. Data captured on rising edge, transferred on falling edge.',
      '3J':   'J input, bit 3.',
      'CLR':  'Asynchronous clear, active LOW. Forces Q LOW immediately.',
      'VCC':  'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Controller Device JK Operation',
        paragraphs: [
          'The controller device architecture means the stored value is captured while the clock is HIGH and transferred to the outputs when the clock falls. Tie unused J/K inputs HIGH so they do not block the gate.',
        ],
        note: 'This is NOT a true edge triggered flip flop it is sensitive to input changes throughout the HIGH clock phase. Use the 74x70 or 74x73 for clean edge triggered behavior.',
      },
    ],
    pinout: [
      { pin: 1, name: 'NC', type: 'nc' },
      { pin: 2, name: '1J', type: 'input' },
      { pin: 3, name: '2J', type: 'input' },
      { pin: 4, name: 'PRE', type: 'input' },
      { pin: 5, name: 'Q', type: 'output' },
      { pin: 6, name: 'Qn', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '1K', type: 'input' },
      { pin: 9, name: '2K', type: 'input' },
      { pin: 10, name: '3K', type: 'input' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: '3J', type: 'input' },
      { pin: 13, name: 'CLR', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'JK_FF', inputs: ['1J', '2J', '3J', '1K', '2K', '3K', 'CLK', 'PRE', 'CLR'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },

  // ── 7473: Dual JK flip flop with clear ────────────────────────────────
  // Source: Texas Instruments, "SN5473, SN54LS73A, SN7473, SN74LS73A Dual J-K
  //   Flip-Flops With Clear", SDLS118 (Dec. 1983, rev. Mar. 1988). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn74ls73a.pdf. Verified:
  //   terminal assignment (D/N package, TOP VIEW) + both function tables ('73
  //   and 'LS73A), page 1, read as PDF page images. Pin map: 1CLK=1, 1CLR=2,
  //   1K=3, VCC=4, 2CLK=5, 2CLR=6, 2J=7, 2Qn=8, 2Q=9, 2K=10, GND=11, 1Q=12,
  //   1Qn=13, 1J=14 — VCC=4/GND=11 are non-standard (not the usual corners).
  //   The 'LS73A is negative-edge-triggered; the original '73/'H73 are positive
  //   pulse-triggered (master-slave). Simulator models the LS/HC negative-edge
  //   behavior (JK_FF_FULL_NEG); the preset input is tied to VCC so it never
  //   asserts, giving the clear-only part.
  // JK flip flop concept: Wikipedia contributors, "Flip-flop (electronics)."
  //   https://en.wikipedia.org/wiki/Flip-flop_(electronics)
  '74x73': {
    name: '74x73',
    simpleName: 'Dual JK FF (neg edge, CLR)',
    description: 'Dual JK flip flop, neg-edge, LOW clear, no preset; VCC=4 GND=11 (14-pin)',
    pins: 14,
    vcc: 4,
    gnd: 11,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls73a.pdf',
    tags: ['flip flop', 'jk', 'sequential', 'dual', 'negative edge', 'clear', 'toggle', 'counter'],
    guideOverview: 'The 74x73 is two independent JK flip flops in one 14 pin chip. A JK flip flop is a one bit memory: on each clock edge it holds its bit, loads a 1, loads a 0, or flips, depending on the J and K inputs. This part acts on the falling edge, when the clock goes from HIGH to LOW. Each flip flop also has one override input: an active LOW clear (CLR#) that forces the output to 0 immediately, ignoring the clock. There is no preset, so the chip can force an output to 0 but not to 1 — if you also need a preset, reach for the 74x76 instead. Two things catch people out. The power pins are not in the corners: VCC is pin 4 and GND is pin 11. And the original 1970s 7473 was a master-slave part with fussier timing, whereas the LS and HC versions this simulator models are plain negative-edge-triggered flip flops.',
    guidePinDescriptions: {
      '1CLK': 'Clock for flip flop 1. Data is captured on the falling edge (HIGH→LOW).',
      '1CLR': 'Asynchronous clear for FF1, active LOW. Pull LOW to force Q1=0 now, ignoring the clock. Tie HIGH during normal clocked use.',
      '1K':   'K input of flip flop 1. With 1J, picks what happens on the next falling clock edge.',
      'VCC':  'Positive supply (+5 V). Non-standard position: pin 4, not a corner.',
      '2CLK': 'Clock for flip flop 2. Data is captured on the falling edge (HIGH→LOW).',
      '2CLR': 'Asynchronous clear for FF2, active LOW. Pull LOW to force Q2=0 immediately. Tie HIGH during normal clocked use.',
      '2J':   'J input of flip flop 2. With 2K, picks what happens on the next falling clock edge.',
      '2Qn':  'Inverted output of flip flop 2 (/Q2), always the opposite of 2Q.',
      '2Q':   'True output of flip flop 2, the stored bit.',
      '2K':   'K input of flip flop 2.',
      'GND':  'Ground reference (0 V). Non-standard position: pin 11, not a corner.',
      '1Q':   'True output of flip flop 1, the stored bit.',
      '1Qn':  'Inverted output of flip flop 1 (/Q1), always the opposite of 1Q.',
      '1J':   'J input of flip flop 1. With 1K, picks what happens on the next falling clock edge.',
    },
    guideSections: [
      {
        title: 'JK Flip Flop Truth Table',
        paragraphs: ['Updates occur on the falling clock edge. J=0,K=0 → hold; J=1,K=0 → set Q=1; J=0,K=1 → reset Q=0; J=1,K=1 → toggle Q. Async CLR# overrides the clock.'],
        note: 'No preset input: to initialize Q=1 on power up, use the 74x76 which adds a preset.',
      },
    ],
    pinout: [
      { pin: 1,  name: '1CLK',  type: 'input',  description: 'Flip flop 1 clock triggers on falling edge (HIGH→LOW transition)' },
      { pin: 2,  name: '1CLR',  type: 'input',  description: 'Flip flop 1 asynchronous clear, active LOW: when LOW, Q1 is forced LOW immediately' },
      { pin: 3,  name: '1K',    type: 'input',  description: 'Flip flop 1 K input' },
      { pin: 4,  name: 'VCC',   type: 'power',  description: 'Positive supply (+5 V)' },
      { pin: 5,  name: '2CLK',  type: 'input',  description: 'Flip flop 2 clock triggers on falling edge (HIGH→LOW transition)' },
      { pin: 6,  name: '2CLR',  type: 'input',  description: 'Flip flop 2 asynchronous clear, active LOW: when LOW, Q2 is forced LOW immediately' },
      { pin: 7,  name: '2J',    type: 'input',  description: 'Flip flop 2 J input' },
      { pin: 8,  name: '2Qn',   type: 'output', description: 'Flip flop 2 inverted output (/Q2)' },
      { pin: 9,  name: '2Q',    type: 'output', description: 'Flip flop 2 true output (Q2)' },
      { pin: 10, name: '2K',    type: 'input',  description: 'Flip flop 2 K input' },
      { pin: 11, name: 'GND',   type: 'power',  description: 'Ground (0 V)' },
      { pin: 12, name: '1Q',    type: 'output', description: 'Flip flop 1 true output (Q1)' },
      { pin: 13, name: '1Qn',   type: 'output', description: 'Flip flop 1 inverted output (/Q1)' },
      { pin: 14, name: '1J',    type: 'input',  description: 'Flip flop 1 J input' },
    ],
    // JK_FF_FULL_NEG: negative edge triggered, active LOW CLR, no preset (VCC holds PRE inactive)
    gates: [
      { type: 'JK_FF_FULL_NEG', inputs: ['1J', '1K', '1CLK', 'VCC', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_FULL_NEG', inputs: ['2J', '2K', '2CLK', 'VCC', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 7475: 4 bit bistable latch ─────────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS75 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls75.pdf
     Latch/flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x75': {
    name: '74x75',
    simpleName: '4 bit Bistable Latch',
    description: 'Four D-latches with complementary Q and /Q outputs. (16-pin)',
    pins: 16,
    vcc: 5,
    gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls75.pdf',
    tags: ['latch', 'bistable', '4 bit', 'sequential', 'register', 'd-latch'],
    guideOverview: 'The 74x75 contains four transparent D-latches in a 16-pin package. Each latch follows its D input while its enable is HIGH and freezes on the falling enable edge. The paired enable structure (LE12 for latches 1-2, LE34 for latches 3-4) lets you latch two bits at a time, making it handy as a data bus register or nibble wide storage.',
    guidePinDescriptions: {
      '1Qn':  'Inverted output of latch 1.',
      '1D':   'Data input of latch 1.',
      '2D':   'Data input of latch 2.',
      'LE34': 'Latch enable for latches 3 and 4. HIGH = transparent (Q follows D); LOW = hold last value.',
      'VCC':  'Positive supply (+5 V) at pin 5.',
      '3D':   'Data input of latch 3.',
      '4D':   'Data input of latch 4.',
      '4Qn':  'Inverted output of latch 4.',
      '4Q':   'True output of latch 4.',
      '3Q':   'True output of latch 3.',
      '3Qn':  'Inverted output of latch 3.',
      'GND':  'Ground reference (pin 12).',
      'LE12': 'Latch enable for latches 1 and 2. HIGH = transparent; LOW = hold.',
      '2Qn':  'Inverted output of latch 2.',
      '2Q':   'True output of latch 2.',
      '1Q':   'True output of latch 1.',
    },
    guideSections: [
      {
        title: 'Transparent Latch Operation',
        paragraphs: [
          'When enable is HIGH, the latch is transparent: the Q output tracks D continuously. When enable goes LOW, Q freezes at whatever D was at the moment enable fell.',
          'Pairs LE12 and LE34 allow independent half word latching. This is useful for multiplexed bus interfaces where you capture the lower nibble and upper nibble at different times.',
        ],
        note: 'Both Q and Q-bar outputs are available. VCC is at pin 5 and GND at pin 12 non standard positions.',
      },
    ],
    pinout: [
      { pin: 1,  name: '1Qn',  type: 'output', description: 'Latch 1 inverted output (/Q1)' },
      { pin: 2,  name: '1D',   type: 'input',  description: 'Latch 1 data input' },
      { pin: 3,  name: '2D',   type: 'input',  description: 'Latch 2 data input' },
      { pin: 4,  name: 'LE34', type: 'input',  description: 'Latch enable for latches 3 and 4: HIGH = transparent (Q follows D), LOW = hold' },
      { pin: 5,  name: 'VCC',  type: 'power',  description: 'Positive supply (+5 V)' },
      { pin: 6,  name: '3D',   type: 'input',  description: 'Latch 3 data input' },
      { pin: 7,  name: '4D',   type: 'input',  description: 'Latch 4 data input' },
      { pin: 8,  name: '4Qn',  type: 'output', description: 'Latch 4 inverted output (/Q4)' },
      { pin: 9,  name: '4Q',   type: 'output', description: 'Latch 4 true output (Q4)' },
      { pin: 10, name: '3Q',   type: 'output', description: 'Latch 3 true output (Q3)' },
      { pin: 11, name: '3Qn',  type: 'output', description: 'Latch 3 inverted output (/Q3)' },
      { pin: 12, name: 'GND',  type: 'power',  description: 'Ground (0 V)' },
      { pin: 13, name: 'LE12', type: 'input',  description: 'Latch enable for latches 1 and 2: HIGH = transparent (Q follows D), LOW = hold' },
      { pin: 14, name: '2Qn',  type: 'output', description: 'Latch 2 inverted output (/Q2)' },
      { pin: 15, name: '2Q',   type: 'output', description: 'Latch 2 true output (Q2)' },
      { pin: 16, name: '1Q',   type: 'output', description: 'Latch 1 true output (Q1)' },
    ],
    gates: [
      { type: 'D_LATCH', inputs: ['1D', 'LE12'], outputs: ['1Q', '1Qn'] },
      { type: 'D_LATCH', inputs: ['2D', 'LE12'], outputs: ['2Q', '2Qn'] },
      { type: 'D_LATCH', inputs: ['3D', 'LE34'], outputs: ['3Q', '3Qn'] },
      { type: 'D_LATCH', inputs: ['4D', 'LE34'], outputs: ['4Q', '4Qn'] },
    ],
    sequential: true,
  },

  // ── 7476: Dual JK flip flop with preset and clear ─────────────────────
  /* Sources:
     [1] Texas Instruments, "SN5476, SN54LS76A, SN7476, SN74LS76A Dual J-K
         Flip-Flops With Preset and Clear", SDLS121 (Dec. 1983, rev. Mar. 1988).
         [Online]. Available: https://www.ti.com/lit/ds/symlink/sn5476.pdf.
         Verified: terminal (connection) diagram, both the '76 and 'LS76A
         function tables, and the ANSI/IEEE logic symbols, pages 1-3, read as
         rendered PDF page images (issues.md C4, NOT the text summarizer).
         Pinout CONFIRMED CORRECT as entered — 1CLK=1, 1PRE=2, 1CLR=3, 1J=4,
         VCC=5, 2CLK=6, 2PRE=7, 2CLR=8, 2J=9, 2Qn=10, 2Q=11, 2K=12, GND=13,
         1Qn=14, 1Q=15, 1K=16 (VCC/GND on non-corner pins 5/13) — so
         pinout[]/gates[] and js/specificChipsSim.js were left untouched.
     [2] Fairchild Semiconductor, "DM7476 Dual Master-Slave J-K Flip-Flops with
         Clear, Preset, and Complementary Outputs", DS006528 (Mar. 1998).
         [Online]. Available: http://szetszedtem.hu/295ketsugarasito/doc/7476.pdf.
         Read as PDF page images to cross-check: its connection diagram and
         function table agree exactly on all 16 terminals and on VCC=5 / GND=13.
     Behavior note: the original bipolar '76 (and this Fairchild DM7476) is a
     master-slave, pulse-triggered part — J/K are read while CLK is HIGH and the
     output changes on the HIGH→LOW edge. The 'LS76A (and the 74HC76) is a plain
     negative-edge-triggered flip-flop. This entry models the LS/HC negative-edge
     behavior (JK_FF_FULL_NEG), which matches the parts sold today; the
     master-slave history is explained in the guide prose, not the engine.
     The datasheet field was repointed from the sn74ls76a.pdf symlink (now
     redirects to a product-selection page, no longer a direct PDF) to the live
     combined sn5476.pdf [1].
     Flip-flop background: Wikipedia contributors, "Flip-flop (electronics),"
     https://en.wikipedia.org/wiki/Flip-flop_(electronics). */
  '74x76': {
    name: '74x76',
    simpleName: 'Dual JK FF (neg edge, PRE/CLR)',
    description: 'Dual JK flip flop, neg-edge, LOW preset & clear; VCC=5 GND=13 (16-pin)',
    pins: 16,
    vcc: 5,
    gnd: 13,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn5476.pdf',
    tags: ['flip flop', 'jk', 'sequential', 'dual', 'preset', 'clear', 'negative edge', 'toggle', 'counter'],
    guideOverview: 'The 74x76 is two independent JK flip flops in one 16 pin chip. A JK flip flop is a one bit memory: on each clock edge it holds its bit, loads a 1, loads a 0, or flips, depending on the J and K inputs. This part acts on the falling edge, when the clock goes from HIGH to LOW. On top of that clocked behavior, each flip flop has two override inputs that ignore the clock: an active LOW preset (PRE#) that forces the output to 1, and an active LOW clear (CLR#) that forces it to 0. The 74x73 is the same idea with clear only, so reach for the 74x76 when you also need to force an output to 1 — for example to preload a known value into a counter. Two things catch people out. The power pins are not in the corners: VCC is pin 5 and GND is pin 13. And the original 1970s 7476 was a master-slave part with fussier timing, whereas the LS and HC versions this simulator models are plain negative-edge-triggered flip flops.',
    guidePinDescriptions: {
      '1CLK': 'Clock for flip flop 1. Data is captured on the falling edge (HIGH→LOW).',
      '1PRE': 'Asynchronous preset for FF1, active LOW. Pull LOW to force Q1=1 now, ignoring the clock. Tie HIGH during normal clocked use.',
      '1CLR': 'Asynchronous clear for FF1, active LOW. Pull LOW to force Q1=0 now, ignoring the clock. Tie HIGH during normal clocked use.',
      '1J':   'J input of flip flop 1. With 1K, picks what happens on the next falling clock edge.',
      'VCC':  'Positive supply (+5 V). Non-standard position: pin 5, not a corner.',
      '2CLK': 'Clock for flip flop 2. Data is captured on the falling edge (HIGH→LOW).',
      '2PRE': 'Asynchronous preset for FF2, active LOW. Pull LOW to force Q2=1 immediately. Tie HIGH during normal clocked use.',
      '2CLR': 'Asynchronous clear for FF2, active LOW. Pull LOW to force Q2=0 immediately. Tie HIGH during normal clocked use.',
      '2J':   'J input of flip flop 2. With 2K, picks what happens on the next falling clock edge.',
      '2Qn':  'Inverted output of flip flop 2 (/Q2), always the opposite of 2Q.',
      '2Q':   'True output of flip flop 2, the stored bit.',
      '2K':   'K input of flip flop 2.',
      'GND':  'Ground reference (0 V). Non-standard position: pin 13, not a corner.',
      '1Qn':  'Inverted output of flip flop 1 (/Q1), always the opposite of 1Q.',
      '1Q':   'True output of flip flop 1, the stored bit.',
      '1K':   'K input of flip flop 1.',
    },
    guideSections: [
      {
        title: 'How a JK flip flop works',
        paragraphs: [
          'A JK flip flop stores one bit. The J and K inputs decide what happens to that bit on the next active clock edge; on the 74x76 that edge is the falling edge, when the clock drops from HIGH to LOW. Between edges the output just holds whatever it last settled to.',
          'The four J/K combinations cover everything a one bit memory can do: leave it alone, load a 1, load a 0, or flip it. Tie J and K both HIGH and the chip toggles on every falling edge, so its output runs at half the clock frequency — that divide-by-two is the building block of a binary counter.',
        ],
        formulas: [
          'J=0, K=0 → hold (Q unchanged)',
          'J=1, K=0 → set (Q → 1)',
          'J=0, K=1 → reset (Q → 0)',
          'J=1, K=1 → toggle (Q flips on each falling edge)',
        ],
      },
      {
        title: 'Preset and clear override the clock',
        paragraphs: [
          'PRE# and CLR# are asynchronous: they act the instant you assert them, without waiting for a clock edge, and while asserted they pin the output no matter what J, K, and the clock are doing. Both are active LOW — the # here and the overbar on the datasheet mean LOW is the active state — so LOW is "do it" and HIGH is "stay out of the way." Leave both HIGH for normal clocked operation.',
          'Use them to force a flip flop into a known state: hold CLR# LOW at power-up so a counter starts at zero, or pulse PRE# LOW to preload a 1. Do not pull PRE# and CLR# LOW at the same time. The chip would drive both Q and Q# HIGH, which breaks the rule that they are always opposites, and the state it lands in when you release them is unpredictable.',
        ],
        note: 'VCC is on pin 5 and GND on pin 13 — unusual, since 16 pin logic chips normally put power in the corners. Check this before wiring.',
      },
      {
        title: 'Old vs new: master-slave',
        paragraphs: [
          'The original 7476 from the 1970s is a master-slave flip flop: it reads J and K the whole time the clock is HIGH and only updates the output on the falling edge, so those inputs must stay steady for the entire HIGH half of the clock. The later 74LS76A and 74HC76 are simple negative-edge-triggered flip flops that only look at J and K right at the falling edge. This simulator models the newer negative-edge behavior. That is a small simplification, but it matches the parts you can actually buy today.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Binary counter: chain toggling stages (J=K=1) so each flip flop halves the rate of the one before it.',
          'Frequency divider: one J=K=1 stage divides an incoming clock by two.',
          'Toggle (T) flip flop: tie J and K together to make a single divide-by-two stage.',
          'Preloading: use PRE#/CLR# to set a known start value before clocking begins.',
          'Storing or delaying a single bit under clock control.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: '1CLK',  type: 'input',  description: 'Flip flop 1 clock triggers on falling edge (HIGH→LOW transition)' },
      { pin: 2,  name: '1PRE',  type: 'input',  description: 'Flip flop 1 asynchronous preset, active LOW: forces Q1=1 immediately' },
      { pin: 3,  name: '1CLR',  type: 'input',  description: 'Flip flop 1 asynchronous clear, active LOW: forces Q1=0 immediately' },
      { pin: 4,  name: '1J',    type: 'input',  description: 'Flip flop 1 J input' },
      { pin: 5,  name: 'VCC',   type: 'power',  description: 'Positive supply (+5 V)' },
      { pin: 6,  name: '2CLK',  type: 'input',  description: 'Flip flop 2 clock triggers on falling edge (HIGH→LOW transition)' },
      { pin: 7,  name: '2PRE',  type: 'input',  description: 'Flip flop 2 asynchronous preset, active LOW: forces Q2=1 immediately' },
      { pin: 8,  name: '2CLR',  type: 'input',  description: 'Flip flop 2 asynchronous clear, active LOW: forces Q2=0 immediately' },
      { pin: 9,  name: '2J',    type: 'input',  description: 'Flip flop 2 J input' },
      { pin: 10, name: '2Qn',   type: 'output', description: 'Flip flop 2 inverted output (/Q2)' },
      { pin: 11, name: '2Q',    type: 'output', description: 'Flip flop 2 true output (Q2)' },
      { pin: 12, name: '2K',    type: 'input',  description: 'Flip flop 2 K input' },
      { pin: 13, name: 'GND',   type: 'power',  description: 'Ground (0 V)' },
      { pin: 14, name: '1Qn',   type: 'output', description: 'Flip flop 1 inverted output (/Q1)' },
      { pin: 15, name: '1Q',    type: 'output', description: 'Flip flop 1 true output (Q1)' },
      { pin: 16, name: '1K',    type: 'input',  description: 'Flip flop 1 K input' },
    ],
    // JK_FF_FULL_NEG: negative edge triggered, active LOW preset and clear
    gates: [
      { type: 'JK_FF_FULL_NEG', inputs: ['1J', '1K', '1CLK', '1PRE', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_FULL_NEG', inputs: ['2J', '2K', '2CLK', '2PRE', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 7483: 4 bit Binary Full Adder ──────────────────────────────────────
  /* Sources:
     [1] Motorola, "SN54/74LS83A 4-Bit Binary Full Adder With Fast Carry",
         FAST and LS TTL Data, pp. 5-1 to 5-2. [Online]. Available:
         https://www.datasheethub.com/wp-content/uploads/2022/03/83.pdf.
         Verified: connection diagram (DIP top view), pin-name table, functional
         description with the weighting formula, worked example, and functional
         truth table, pages 1-2, read as rendered PDF page images (issues.md C4,
         NOT the text summarizer). Every pin number and behavioral claim below is
         traceable to these two pages. Pinout CONFIRMED CORRECT as entered —
         A4=1, S3=2, A3=3, B3=4, VCC=5, S2=6, B2=7, A2=8, S1=9, A1=10, B1=11,
         GND=12, C0=13, C4=14, S4=15, B4=16 (A1/S1 = LSB) — so pinout[]/gates[]
         and js/specificChipsSim.js were left untouched.
     [2] Second-source TTL data book, "54/7483A, 54LS/74LS83A 4-Bit Binary Full
         Adder (With Fast Carry)", p. 4-98. [Online]. Available:
         https://eelabs.faculty.unlv.edu/docs/datasheets/7483.pdf. Read as PDF
         page images to cross-check the pinout. Agrees exactly on the physical
         terminals and on "VCC = Pin 5, GND = Pin 12" and the '283 recommendation;
         it labels the bits 0-indexed (A0..A3), whereas this entry uses the TI /
         Motorola 1-indexed convention (A1..A4). Used only to corroborate [1].
     [3] Wikipedia contributors, "Adder (electronics)." [Online]. Available:
         https://en.wikipedia.org/wiki/Adder_(electronics). General full-adder
         and carry-look-ahead background only.
     Note: the TI symlink previously in the datasheet field
     (ti.com/lit/ds/symlink/sn74ls83a.pdf) returns HTTP 404 — the LS83A is
     obsolete and TI removed it (the '283 is its recommended replacement, and its
     TI datasheet is live). The datasheet link was repointed to the verified
     Motorola scan [1]. */
  '74x83': {
    name: '74x83',
    simpleName: '4 bit Binary Full Adder',
    description: '4-bit binary adder, fast carry; VCC=5 GND=12 (16-pin)',
    pins: 16,
    vcc: 5,
    gnd: 12,
    datasheet: 'https://www.datasheethub.com/wp-content/uploads/2022/03/83.pdf',
    tags: ['adder', 'arithmetic', 'math', '4 bit', 'binary', 'full adder', 'carry', 'fast carry'],
    guideOverview: 'The 74x83 adds two 4 bit binary numbers plus a carry in, producing a 4 bit sum (S1 to S4) and a carry out (C4). It is purely combinational: there is no clock, so the outputs settle once the inputs are stable. It uses fast carry, meaning an internal look-ahead network works out all four carries at once instead of letting each carry ripple up one bit at a time, so the top sum bit does not have to wait for the lower ones. The thing that trips people up is the power pins: unlike almost every other 16 pin logic chip, VCC is on pin 5 and GND on pin 12, not the corners. The newer 74x283 does the exact same job with power moved to the corner pins, and is the one to pick for a new design; the 74x83 mostly turns up in older boards and textbooks. To add numbers wider than four bits, chain chips by wiring C4 of one stage into C0 of the next.',
    guidePinDescriptions: {
      A4:   'Bit 4 (MSB) of input number A.',
      S3:   'Bit 3 of the sum output.',
      A3:   'Bit 3 of input number A.',
      B3:   'Bit 3 of input number B.',
      VCC:  'Positive supply, +5 V. Non-standard position: pin 5, not a corner.',
      S2:   'Bit 2 of the sum output.',
      B2:   'Bit 2 of input number B.',
      A2:   'Bit 2 of input number A.',
      S1:   'Bit 1 (LSB) of the sum output.',
      A1:   'Bit 1 (LSB) of input number A.',
      B1:   'Bit 1 (LSB) of input number B.',
      GND:  'Ground reference. Non-standard position: pin 12, not a corner.',
      C0:   'Carry in. Tie to GND for a standalone adder or the lowest stage; drive it from C4 of the stage below when cascading. Do not leave it floating.',
      C4:   'Carry out of the top bit. Wire to C0 of the next stage when cascading; it is effectively the fifth, most significant bit of the sum.',
      S4:   'Bit 4 (MSB) of the sum output.',
      B4:   'Bit 4 (MSB) of input number B.',
    },
    pinout: [
      { pin: 1, name: 'A4', type: 'input' },
      { pin: 2, name: 'S3', type: 'output' },
      { pin: 3, name: 'A3', type: 'input' },
      { pin: 4, name: 'B3', type: 'input' },
      { pin: 5, name: 'VCC', type: 'power' },
      { pin: 6, name: 'S2', type: 'output' },
      { pin: 7, name: 'B2', type: 'input' },
      { pin: 8, name: 'A2', type: 'input' },
      { pin: 9, name: 'S1', type: 'output' },
      { pin: 10, name: 'A1', type: 'input' },
      { pin: 11, name: 'B1', type: 'input' },
      { pin: 12, name: 'GND', type: 'power' },
      { pin: 13, name: 'C0', type: 'input' },
      { pin: 14, name: 'C4', type: 'output' },
      { pin: 15, name: 'S4', type: 'output' },
      { pin: 16, name: 'B4', type: 'input' },
    ],
    gates: [
      {
        type: 'ADDER_4BIT',
        inputs: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C0'],
        outputs: ['S1', 'S2', 'S3', 'S4', 'C4'],
      },
    ],
    guideSections: [
      {
        title: 'How a full adder works',
        paragraphs: [
          'Binary addition goes column by column, the same way you add decimal numbers by hand. In each column you add the two digits, and if the result is too big to fit in one digit you carry a 1 into the next column. A full adder is the circuit for one binary column: it takes the two bits being added plus the carry coming in from the column below, and produces a sum bit and a carry going out to the column above.',
          'The 74x83 lines up four of these, one per bit, and links their carries. What makes it fast is that it does not wait for each carry to travel up the chain in turn. A look-ahead network computes all four carries directly from the inputs, so the whole answer appears after one propagation delay (roughly 10 to 25 ns depending on logic family, temperature, and load this is a simplification) instead of a delay that grows with each bit.',
        ],
        formulas: [
          'One column:  S = A XOR B XOR Cin;   Cout = 1 when two or more of A, B, Cin are 1',
          'A B Cin -> S Cout:  000 -> 0 0 | 001 -> 1 0 | 010 -> 1 0 | 011 -> 0 1 | 100 -> 1 0 | 101 -> 0 1 | 110 -> 0 1 | 111 -> 1 1',
        ],
      },
      {
        title: 'A worked example',
        paragraphs: [
          'Put A = 1010 (10) on A4 A3 A2 A1 and B = 1001 (9) on B4 B3 B2 B1, with C0 = 0. The chip adds 10 + 9 = 19. That does not fit in four bits, so the low four bits show up on the sum pins as S4 S3 S2 S1 = 0011 (3) and the carry out C4 goes to 1. Read together, (C4, S4, S3, S2, S1) = 10011 = 19. This is the example the datasheet uses.',
        ],
        formulas: [
          '(C4, S4, S3, S2, S1) = A + B + C0     — five output bits from two 4 bit inputs plus the carry in',
        ],
      },
      {
        title: 'Cascading and gotchas',
        paragraphs: [
          'To add numbers wider than four bits, stack chips: wire C4 of the low stage into C0 of the next stage, and so on up. Two 74x83s make an 8 bit adder, and the C4 of the top chip is the final carry out. The carry is passed straight through (not inverted), so you can cascade directly with no gates in between.',
        ],
        list: [
          'Power sits on pins 5 (VCC) and 12 (GND), not on the corners like most 16 pin logic. This is the single most common wiring mistake with this chip check it before applying power.',
          'Tie C0 of the lowest stage to GND, not floating. The datasheet says to hold the carry in LOW when no carry is intended; a floating input gives wrong sums.',
          'The pins are interleaved (A4, S3, A3, B3 across the top; A1, B1 lower down), not grouped by signal name. Read the pinout instead of guessing.',
          'The chip also works with active-LOW signals: drive the inputs and read the outputs with LOW = 1 and it still adds correctly (the datasheet calls this negative logic). The simulator models the ordinary active-HIGH case. This is a simplification, but the everyday one.',
          'For a new design, reach for the 74x283 instead: same logic, but with power on the corner pins. The 74x83 is functionally identical and mainly shows up in older boards and coursework.',
        ],
        note: 'VCC is on pin 5 and GND on pin 12 both non-standard for a 16 pin DIP. Verify power before powering up.',
      },
    ],
  },

  // ── 7485: 4 bit Magnitude Comparator ───────────────────────────────────
  /* Source: Texas Instruments, "SN5485, SN54LS85, SN54S85, SN7485, SN74LS85,
       SN74S85 4-Bit Magnitude Comparators", SDLS123 (Mar. 1974, rev. Mar. 1988).
       [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls85.pdf.
       Verified: terminal assignment (N-package TOP VIEW) + FUNCTION TABLE,
       page 1, read as 300-dpi PDF page images (issues.md C4, NOT the text
       summarizer). Every pin number and output row below is traceable to that
       page. Pinout CONFIRMED CORRECT as entered — B3=1, A<Bin=2, A=Bin=3,
       A>Bin=4, A>Bout=5, A=Bout=6, A<Bout=7, GND=8, B0=9, A0=10, B1=11, A1=12,
       A2=13, B2=14, A3=15, VCC=16 — so pinout[]/gates[] left untouched.
     Concept + MSB-first algorithm: Wikipedia contributors, "Digital comparator".
       [Online]. Available: https://en.wikipedia.org/wiki/Digital_comparator.
     Simplification (COMPARATOR_4BIT primitive, shared with CD4063 + CD4585, in
       js/specificChipsSim.js): for every VALID input combination the model
       reproduces the datasheet function table exactly. It idealizes only the two
       INVALID cascade-input rows the datasheet lists: with A>Bin AND A<Bin both
       HIGH the silicon forces all three outputs LOW, and with all three cascade
       inputs LOW it drives A>Bout and A<Bout HIGH together — the model instead
       keeps its A>Bin-priority order. A correctly wired stage never presents
       those states (a lower stage always asserts exactly one cascade line, and a
       standalone chip ties A=Bin HIGH), so nothing reachable by following the
       docs diverges. Recorded in issues.md C93; guard:
       js/debug/scenarios/74x85-magnitude-comparator.mjs. */
  '74x85': {
    name: '74x85',
    simpleName: '4 bit Magnitude Comparator',
    description: '4-bit magnitude comparator: A>B, A=B, A<B; cascadable. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls85.pdf',
    tags: ['comparator', 'magnitude', '4 bit', 'arithmetic', 'cascade'],
    guideOverview: 'The 74x85 compares two 4 bit numbers, A (A0-A3) and B (B0-B3), and tells you which is bigger. It raises exactly one of three outputs: AGTB (A > B), AEQB (A = B), or ALTB (A < B). The inputs read as plain unsigned binary (0-15) or as a single BCD digit (0-9). Three cascade inputs let you chain chips to compare numbers wider than 4 bits, the low chip feeding the high chip. The comparison is combinational, so the outputs follow the inputs with no clock. One catch: the cascade inputs must always be tied off. On a single chip, tie the A=B input HIGH and the A>B and A<B inputs LOW.',
    guidePinDescriptions: {
      B3:     'Word B, most significant bit (bit 3).',
      ALTBIN: 'Cascade input: the A<B result from the lower (less significant) stage. Tie LOW on a single chip.',
      AEQBIN: 'Cascade input: the A=B result from the lower stage. Tie HIGH on a single chip so equal inputs give A=B.',
      AGTBIN: 'Cascade input: the A>B result from the lower stage. Tie LOW on a single chip.',
      AGTB:   'Output: HIGH when A is greater than B.',
      AEQB:   'Output: HIGH when A equals B.',
      ALTB:   'Output: HIGH when A is less than B.',
      GND:    'Ground reference (pin 8).',
      B0:     'Word B, least significant bit (bit 0).',
      A0:     'Word A, least significant bit (bit 0).',
      B1:     'Word B, bit 1.',
      A1:     'Word A, bit 1.',
      A2:     'Word A, bit 2.',
      B2:     'Word B, bit 2.',
      A3:     'Word A, most significant bit (bit 3).',
      VCC:    'Positive supply, +5 V (pin 16).',
    },
    pinout: [
      { pin: 1, name: 'B3', type: 'input' },
      { pin: 2, name: 'ALTBIN', type: 'input' },
      { pin: 3, name: 'AEQBIN', type: 'input' },
      { pin: 4, name: 'AGTBIN', type: 'input' },
      { pin: 5, name: 'AGTB', type: 'output' },
      { pin: 6, name: 'AEQB', type: 'output' },
      { pin: 7, name: 'ALTB', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'B0', type: 'input' },
      { pin: 10, name: 'A0', type: 'input' },
      { pin: 11, name: 'B1', type: 'input' },
      { pin: 12, name: 'A1', type: 'input' },
      { pin: 13, name: 'A2', type: 'input' },
      { pin: 14, name: 'B2', type: 'input' },
      { pin: 15, name: 'A3', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COMPARATOR_4BIT',
        inputs: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3', 'AGTBIN', 'AEQBIN', 'ALTBIN'],
        outputs: ['AGTB', 'AEQB', 'ALTB'],
      },
    ],
    guideSections: [
      {
        title: 'How the comparison works',
        paragraphs: [
          'Put one 4 bit number on A0-A3 and the other on B0-B3. A3 and B3 are the most significant bits; A0 and B0 the least. The chip drives exactly one of AGTB, AEQB, or ALTB HIGH and holds the other two LOW.',
          'It compares from the top bit down, the same way you check two numbers by hand. If A3 and B3 differ, that settles it. If they are equal, it moves to A2 vs B2, then A1 vs B1, then A0 vs B0. The numbers are equal only when all four bit pairs match. Inputs read as plain unsigned binary (0-15), or as one BCD digit (0-9), since BCD is just 8-4-2-1 weighted binary.',
          'The result is combinational: there is no clock, and no memory. Change an input and the matching output settles almost immediately (a few gate delays on the real part; treated as instant here).',
        ],
        formulas: [
          'A > B  →  AGTB=1, AEQB=0, ALTB=0',
          'A = B  →  AGTB=0, AEQB=1, ALTB=0',
          'A < B  →  AGTB=0, AEQB=0, ALTB=1',
          'Example: A=1010 (10), B=0110 (6) → A>B, so AGTB=1',
        ],
      },
      {
        title: 'Cascading for wider numbers',
        paragraphs: [
          'One chip compares 4 bits. For wider numbers, stack chips: wire the low chip\'s three outputs (AGTB, AEQB, ALTB) into the next chip\'s three cascade inputs (AGTBIN, AEQBIN, ALTBIN). The higher chip decides on its own bits first and only falls back to the cascade inputs when its bits are equal. So 8 bits is two chips, 12 bits is three, 16 bits is four.',
          'The cascade inputs also decide what a single chip does on a tie, so they must be tied off even when you are not chaining. For a lone chip, tie AEQBIN HIGH and both AGTBIN and ALTBIN LOW. Then, when A equals B, AEQB is the output that goes HIGH.',
        ],
        note: 'Never leave the cascade inputs floating, and do not drive more than one of them HIGH at once. Feed them only from a lower stage\'s outputs (which are always one at a time) or the fixed single-chip tie-off above. The real chip has defined but unhelpful behavior for contradictory cascade inputs; 74Sim idealizes those corner cases, so don\'t rely on them either way.',
      },
      {
        title: 'Common uses',
        list: [
          'Compare two numbers for >, =, or < in a datapath or a controller.',
          'Threshold and window detection: flag when a reading crosses a fixed limit.',
          'Equality / match detection (address decoding, key compare) using just the AEQB output.',
          'Min/max and simple sorting logic built from several comparators.',
          'Cascade chips to compare 8, 12, 16 bits or wider.',
        ],
      },
      {
        title: 'Getting >= and <=',
        paragraphs: [
          'The chip gives you strictly greater, equal, and strictly less. To test "A is at least B" (A >= B), OR the AGTB and AEQB outputs together. For "A is at most B" (A <= B), OR ALTB and AEQB. A single spare OR gate (for example a 74x32) does the job.',
        ],
      },
    ],
  },

  // ── 7489: 64 bit RAM (16x4) ────────────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS89 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls89.pdf */
  '74x89': {
    name: '74x89',
    simpleName: '64 bit RAM',
    description: '64 bit read/write memory (16 words × 4 bits) (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls89.pdf',
    tags: ['ram', 'memory', '64 bit', '16x4', 'read', 'write'],
    guideOverview: 'The 74x89 is a 64 bit static RAM organized as 16 words of 4 bits each (16×4). Four address bits (A0 A3) select one of 16 locations. A Memory Enable (ME#, active LOW) and Write Enable (WE#, active LOW) control access. Data is written on D1-D4 when ME# and WE# are both LOW. When ME# is LOW and WE# is HIGH, the complemented data is read from O1 O4.',
    guidePinDescriptions: {
      'A0':  'Address bit 0 (LSB). Selects one of 16 memory locations.',
      'ME':  'Memory Enable, active LOW. Pull LOW to select the chip for read or write. HIGH disables all outputs.',
      'WE':  'Write Enable, active LOW. Pull LOW to write data inputs to the selected address. Pull HIGH to read.',
      'D1':  'Data input bit 1. Valid during write operations.',
      'O1':  'Data output bit 1. Outputs the complement of the stored bit during read. Hi Z when ME# is HIGH.',
      'D2':  'Data input bit 2.',
      'O2':  'Data output bit 2 (complement).',
      'GND': 'Ground reference (pin 8).',
      'O3':  'Data output bit 3 (complement).',
      'D3':  'Data input bit 3.',
      'O4':  'Data output bit 4 (complement).',
      'D4':  'Data input bit 4.',
      'A3':  'Address bit 3 (MSB).',
      'A2':  'Address bit 2.',
      'A1':  'Address bit 1.',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Reading and Writing',
        paragraphs: [
          'To write: apply address to A0 A3, put data on D1-D4, then assert ME# LOW and WE# LOW. To read: apply address, set WE# HIGH, then assert ME# LOW data appears on O1 O4.',
          'Note that the outputs give the COMPLEMENT of the stored data. To read the true data, invert the outputs or account for the inversion in your design.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'A0', type: 'input' },
      { pin: 2, name: 'ME', type: 'input' },
      { pin: 3, name: 'WE', type: 'input' },
      { pin: 4, name: 'D1', type: 'input' },
      { pin: 5, name: 'O1', type: 'output' },
      { pin: 6, name: 'D2', type: 'input' },
      { pin: 7, name: 'O2', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'O3', type: 'output' },
      { pin: 10, name: 'D3', type: 'input' },
      { pin: 11, name: 'O4', type: 'output' },
      { pin: 12, name: 'D4', type: 'input' },
      { pin: 13, name: 'A3', type: 'input' },
      { pin: 14, name: 'A2', type: 'input' },
      { pin: 15, name: 'A1', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'RAM_16X4_INV',
        inputs: ['A0', 'A1', 'A2', 'A3', 'D1', 'D2', 'D3', 'D4', 'ME', 'WE'],
        outputs: ['O1', 'O2', 'O3', 'O4'],
      },
    ],
    sequential: true,
  },
};
