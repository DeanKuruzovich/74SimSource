// Chip definitions block 59
// Chips: 74x4305, 74x4306, 74x4316, 74x4351, 74x4352, 74x4353,
//        74x4374, 74x4510, 74x4511, 74x4514, 74x4515, 74x4516,
//        74x4518, 74x4520, 74x4538, 74x4543, 74x4560

export const CHIPS_BLOCK_59 = {

  // 74x4305: Dual 4 bit inverting buffer, three state (20-pin)
  '74x4305': {
    name: '74x4305',
    simpleName: 'Dual 4 bit Inverting Buffer (TS)',
    description: 'Dual 4 bit inverting buffer with three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/gpn/sn74hc540',
    tags: ['buffer', 'inverting', 'dual', '4 bit', 'tri state'],
    guideOverview: 'The 74x4305 is an octal inverting three state buffer arranged as two 4 bit groups with separate enables. Each channel outputs the inverse of its input when enabled, or disconnects from the bus when disabled. This is useful for bus driving, signal isolation, and active LOW bus systems where eight channels of inverted buffering are needed.',
    guidePinDescriptions: {
      '1OEn': 'Active LOW output enable for buffer group 1. Pull LOW to enable outputs 1Y1 through 1Y4.',
      '1A1': 'Input bit 1 of group 1.',
      '1Y1': 'Inverted output bit 1 of group 1 (three state).',
      '1A2': 'Input bit 2 of group 1.',
      '1Y2': 'Inverted output bit 2 of group 1 (three state).',
      '1A3': 'Input bit 3 of group 1.',
      '1Y3': 'Inverted output bit 3 of group 1 (three state).',
      '1A4': 'Input bit 4 of group 1.',
      '1Y4': 'Inverted output bit 4 of group 1 (three state).',
      'GND': 'Ground reference for the package.',
      '2OEn': 'Active LOW output enable for buffer group 2.',
      '2A1': 'Input bit 1 of group 2.',
      '2Y1': 'Inverted output bit 1 of group 2 (three state).',
      '2A2': 'Input bit 2 of group 2.',
      '2Y2': 'Inverted output bit 2 of group 2 (three state).',
      '2A3': 'Input bit 3 of group 2.',
      '2Y3': 'Inverted output bit 3 of group 2 (three state).',
      '2A4': 'Input bit 4 of group 2.',
      '2Y4': 'Inverted output bit 4 of group 2 (three state).',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Inverting Buffer Groups',
        paragraphs: [
          'Each output drives the opposite logic state of its input. The two separate enable pins let you control the lower and upper four bit groups independently.',
        ],
      },
      {
        title: 'Three State Bus Use',
        paragraphs: [
          'When a group is disabled, its outputs disconnect instead of forcing HIGH or LOW. That makes the chip suitable for shared buses where multiple devices may take turns driving the same lines.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1OEn', type: 'input'  },
      { pin:  2, name: '1A1',  type: 'input'  },
      { pin:  3, name: '1Y1',  type: 'output' },
      { pin:  4, name: '1A2',  type: 'input'  },
      { pin:  5, name: '1Y2',  type: 'output' },
      { pin:  6, name: '1A3',  type: 'input'  },
      { pin:  7, name: '1Y3',  type: 'output' },
      { pin:  8, name: '1A4',  type: 'input'  },
      { pin:  9, name: '1Y4',  type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '2OEn', type: 'input'  },
      { pin: 12, name: '2A1',  type: 'input'  },
      { pin: 13, name: '2Y1',  type: 'output' },
      { pin: 14, name: '2A2',  type: 'input'  },
      { pin: 15, name: '2Y2',  type: 'output' },
      { pin: 16, name: '2A3',  type: 'input'  },
      { pin: 17, name: '2Y3',  type: 'output' },
      { pin: 18, name: '2A4',  type: 'input'  },
      { pin: 19, name: '2Y4',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'TRI_NOT_LO', inputs: ['1A1', '1OEn'], output: '1Y1' },
      { type: 'TRI_NOT_LO', inputs: ['1A2', '1OEn'], output: '1Y2' },
      { type: 'TRI_NOT_LO', inputs: ['1A3', '1OEn'], output: '1Y3' },
      { type: 'TRI_NOT_LO', inputs: ['1A4', '1OEn'], output: '1Y4' },
      { type: 'TRI_NOT_LO', inputs: ['2A1', '2OEn'], output: '2Y1' },
      { type: 'TRI_NOT_LO', inputs: ['2A2', '2OEn'], output: '2Y2' },
      { type: 'TRI_NOT_LO', inputs: ['2A3', '2OEn'], output: '2Y3' },
      { type: 'TRI_NOT_LO', inputs: ['2A4', '2OEn'], output: '2Y4' },
    ],
  },

  // 74x4306: Dual 4 bit non inverting buffer, three state (20-pin)
  '74x4306': {
    name: '74x4306',
    simpleName: 'Dual 4 bit Non Inverting Buffer (TS)',
    description: 'Dual 4 bit non inverting buffer with three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/gpn/sn74hc541',
    tags: ['buffer', 'non inverting', 'dual', '4 bit', 'tri state'],
    guideOverview: 'The 74x4306 is an octal non inverting three state buffer split into two 4 bit groups with separate enables. Each enabled output follows its input directly, while disabled outputs disconnect from the bus. It is useful for isolating logic stages, improving fan out, and steering bus traffic cleanly.',
    guidePinDescriptions: {
      '1OEn': 'Active LOW output enable for buffer group 1. Pull LOW to enable outputs 1Y1 through 1Y4.',
      '1A1': 'Input bit 1 of group 1.',
      '1Y1': 'Output bit 1 of group 1 (three state, non inverting).',
      '1A2': 'Input bit 2 of group 1.',
      '1Y2': 'Output bit 2 of group 1 (three state, non inverting).',
      '1A3': 'Input bit 3 of group 1.',
      '1Y3': 'Output bit 3 of group 1 (three state, non inverting).',
      '1A4': 'Input bit 4 of group 1.',
      '1Y4': 'Output bit 4 of group 1 (three state, non inverting).',
      'GND': 'Ground reference for the package.',
      '2OEn': 'Active LOW output enable for buffer group 2.',
      '2A1': 'Input bit 1 of group 2.',
      '2Y1': 'Output bit 1 of group 2 (three state, non inverting).',
      '2A2': 'Input bit 2 of group 2.',
      '2Y2': 'Output bit 2 of group 2 (three state, non inverting).',
      '2A3': 'Input bit 3 of group 2.',
      '2Y3': 'Output bit 3 of group 2 (three state, non inverting).',
      '2A4': 'Input bit 4 of group 2.',
      '2Y4': 'Output bit 4 of group 2 (three state, non inverting).',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Non Inverting Bus Buffering',
        paragraphs: [
          'Each output reproduces the same logic state seen at its input. This makes the chip useful when you need more drive strength or need to isolate a source from bus loading without changing polarity.',
        ],
      },
      {
        title: 'Independent Enables',
        paragraphs: [
          'The separate 4 bit enable controls make it easy to treat the package like two nibble wide bus sections. That can simplify microprocessor or peripheral bus designs.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1OEn', type: 'input'  },
      { pin:  2, name: '1A1',  type: 'input'  },
      { pin:  3, name: '1Y1',  type: 'output' },
      { pin:  4, name: '1A2',  type: 'input'  },
      { pin:  5, name: '1Y2',  type: 'output' },
      { pin:  6, name: '1A3',  type: 'input'  },
      { pin:  7, name: '1Y3',  type: 'output' },
      { pin:  8, name: '1A4',  type: 'input'  },
      { pin:  9, name: '1Y4',  type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '2OEn', type: 'input'  },
      { pin: 12, name: '2A1',  type: 'input'  },
      { pin: 13, name: '2Y1',  type: 'output' },
      { pin: 14, name: '2A2',  type: 'input'  },
      { pin: 15, name: '2Y2',  type: 'output' },
      { pin: 16, name: '2A3',  type: 'input'  },
      { pin: 17, name: '2Y3',  type: 'output' },
      { pin: 18, name: '2A4',  type: 'input'  },
      { pin: 19, name: '2Y4',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'TRI_BUFFER_LO', inputs: ['1A1', '1OEn'], output: '1Y1' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A2', '1OEn'], output: '1Y2' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A3', '1OEn'], output: '1Y3' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A4', '1OEn'], output: '1Y4' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A1', '2OEn'], output: '2Y1' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A2', '2OEn'], output: '2Y2' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A3', '2OEn'], output: '2Y3' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A4', '2OEn'], output: '2Y4' },
    ],
  },

  // 74x4316: Quad bilateral analog switch with level translation (16-pin)
  // CD74HC4316 four independent SPST switches; VEE at pin 7 for dual supply analog swing; active HIGH enables
  '74x4316': {
    name: '74x4316',
    simpleName: 'Quad Bilateral Analog Switch (Level Translation)',
    description: 'Quad bilateral analog switch with level translation (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    onResistance: 80,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4316.pdf',
    tags: ['analog', 'switch', 'quad', 'bilateral', 'bidir'],
    guideOverview: 'The 74x4316 contains four independent bilateral analog switches with level translation capability. Each channel passes signals in either direction when its active HIGH enable is asserted. The separate VEE supply pin allows the analog signal range to extend below ground, making the device suitable for mixed supply systems where TTL/CMOS logic controls analog paths that swing on a dual rail.',
    guidePinDescriptions: {
      '1Y':  'One bilateral terminal of switch channel 1.',
      '1A':  'Other bilateral terminal of switch channel 1.',
      '1E':  'Active HIGH enable for channel 1. HIGH closes the switch; LOW opens it.',
      '2A':  'One bilateral terminal of switch channel 2.',
      '2Y':  'Other bilateral terminal of switch channel 2.',
      '2E':  'Active HIGH enable for channel 2.',
      'VEE': 'Negative analog supply. Allows analog signals to swing below GND when using a dual supply.',
      'GND': 'Ground reference for the device.',
      '3E':  'Active HIGH enable for channel 3.',
      '3Y':  'One bilateral terminal of switch channel 3.',
      '3A':  'Other bilateral terminal of switch channel 3.',
      '4E':  'Active HIGH enable for channel 4.',
      '4Y':  'One bilateral terminal of switch channel 4.',
      '4A':  'Other bilateral terminal of switch channel 4.',
      'NC':  'No internal connection. Leave unconnected.',
      'VCC': 'Positive supply for the switch control logic.',
    },
    guideSections: [
      {
        title: 'Level Translation',
        paragraphs: [
          'The key difference between the 4316 and the plain 4066 is the addition of a VEE pin. The digital enable inputs are referenced to VCC and GND (TTL/CMOS levels), while the analog switch terminals can swing between VCC and VEE. This lets one supply power the control logic and a separate dual supply govern the analog signal range.',
        ],
      },
      {
        title: 'Bilateral Switching',
        paragraphs: [
          'Each of the four channels acts as a digitally controlled SPST switch. Signals can travel in either direction through the closed switch. All four channels are independent and each has its own enable pin.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Routing analog sensor or audio signals under digital control.',
          'Mixed supply systems where logic runs at 5 V but analog swings ±5 V.',
          'Pin compatible upgrade path from the 4066 when a dual analog rail is needed.',
        ],
        note: '74Sim models each channel as a passive resistive coupling: when E is HIGH, A and Y are connected through the chip\'s on-resistance (~80 Ω for the 4316) and any analog voltage between the rails passes through; when E is LOW, both terminals are isolated. The VEE pin is documented but not used as a separate analog rail (74Sim\'s net voltages are anchored to 0..5 V); distortion and bandwidth are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: '1Y',  type: 'bidir'  },
      { pin:  2, name: '1A',  type: 'bidir'  },
      { pin:  3, name: '1E',  type: 'input'  },
      { pin:  4, name: '2A',  type: 'bidir'  },
      { pin:  5, name: '2Y',  type: 'bidir'  },
      { pin:  6, name: '2E',  type: 'input'  },
      { pin:  7, name: 'VEE', type: 'power'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: '3E',  type: 'input'  },
      { pin: 10, name: '3Y',  type: 'bidir'  },
      { pin: 11, name: '3A',  type: 'bidir'  },
      { pin: 12, name: '4E',  type: 'input'  },
      { pin: 13, name: '4Y',  type: 'bidir'  },
      { pin: 14, name: '4A',  type: 'bidir'  },
      { pin: 15, name: 'NC',  type: 'nc'     },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'BILATERAL_SWITCH', inputs: ['1A','1Y','1E'], outputs: ['1A','1Y'] },
      { type: 'BILATERAL_SWITCH', inputs: ['2A','2Y','2E'], outputs: ['2A','2Y'] },
      { type: 'BILATERAL_SWITCH', inputs: ['3A','3Y','3E'], outputs: ['3A','3Y'] },
      { type: 'BILATERAL_SWITCH', inputs: ['4A','4Y','4E'], outputs: ['4A','4Y'] },
    ],
  },

  // 74x4351: 8-channel analog mux/demux with address latch (20-pin) — simulated
  // via the ANALOG_MUX_8_LATCH primitive (js/specificChipsSim.js).
  // Source: Texas Instruments (data acquired from Harris Semiconductor),
  //   "CD54HC4351, CD74HC4351, CD74HCT4351, CD74HC4352 — High-Speed CMOS Logic
  //   Analog Multiplexers/Demultiplexers with Latch", SCHS213C (Sept. 1998,
  //   rev. July 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4351.pdf. Verified: 20-Ld PDIP
  //   terminal assignment (page 1, "Pinouts"), functional diagram + TRUTH TABLE
  //   for 'HC4351 (page 2) — read as rendered ~300-dpi PDF page images.
  //   Corrected the prior hand-entered stub pinout, which was invented (it used
  //   Y0..Y7 / Z / Zn / INH / A / B / C and did not match the datasheet on any
  //   channel, common, enable, select, or latch pin). Real map (DIP, top view):
  //   A4=1, A6=2, NC=3, COM=4, A7=5, A5=6, E1=7, E2=8, VEE=9, GND=10, LE=11,
  //   S2=12, S1=13, NC=14, S0=15, A3=16, A0=17, A1=18, A2=19, VCC=20.
  '74x4351': {
    name: '74x4351',
    simpleName: '8-Ch Analog Mux with Latch',
    description: '8-channel analog multiplexer/demultiplexer with address latch (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4351.pdf',
    tags: ['analog', 'mux', '8-channel', 'latch'],
    guideOverview: 'The 74x4351 is an 8-channel analog multiplexer/demultiplexer with an address latch. Like a 4051, it connects one of eight channels (A0 to A7) to a single common pin, and the switches pass signal in either direction. What sets it apart is the latch: a three-bit select value (S0, S1, S2) is captured and held inside the chip, so the channel stays put even after the select lines change. It also has two enable pins so it can be turned on or off from either an active-low or an active-high control signal.',
    guidePinDescriptions: {
      'A0': 'Analog channel 0.',
      'A1': 'Analog channel 1.',
      'A2': 'Analog channel 2.',
      'A3': 'Analog channel 3.',
      'A4': 'Analog channel 4.',
      'A5': 'Analog channel 5.',
      'A6': 'Analog channel 6.',
      'A7': 'Analog channel 7.',
      'COM': 'Common pin. Connects to whichever channel is selected. Signal flows either way through the switch.',
      'S0': 'Select input, least significant bit.',
      'S1': 'Select input, middle bit.',
      'S2': 'Select input, most significant bit.',
      'LE': 'Latch enable. HIGH makes the latch follow S0 to S2; LOW freezes the stored channel so the selects can change without moving the switch.',
      'E1': 'Enable, active LOW. Must be LOW for any channel to conduct.',
      'E2': 'Enable, active HIGH. Must be HIGH for any channel to conduct.',
      'GND': 'Ground reference for the chip.',
      'VEE': 'Lower analog supply rail. Lets the channels pass voltages below ground on a real device.',
      'VCC': 'Positive supply for the switch and control logic.',
      'NC': 'No internal connection. Leave unconnected.',
      'NC2': 'No internal connection. Leave unconnected.',
    },
    guideSections: [
      {
        title: 'Latched Address Selection',
        paragraphs: [
          'S0, S1, and S2 form a three-bit number that picks one of the eight channels. While LE is HIGH the latch is transparent: the selected channel follows the select pins directly. Pull LE LOW and the chip remembers the last channel. The select pins can then change freely and the switch will not move until LE goes HIGH again.',
        ],
      },
      {
        title: 'Two Enable Pins',
        paragraphs: [
          'The chip conducts only when E1 is LOW and E2 is HIGH at the same time. If E1 goes HIGH or E2 goes LOW, every channel opens and the common pin is isolated. Having both polarities means the device can be gated by whichever control signal is on hand without an extra inverter.',
        ],
        note: '74Sim models each closed channel as a passive resistive coupling (~125 Ω) between the common pin and the selected channel, so analog voltages between the rails pass through and the switch works in both directions. The separate negative rail (VEE), on-resistance variation, crosstalk, and switching delays are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'A4',   type: 'bidir'  },
      { pin:  2, name: 'A6',   type: 'bidir'  },
      { pin:  3, name: 'NC',   type: 'nc'     },
      { pin:  4, name: 'COM',  type: 'bidir'  },
      { pin:  5, name: 'A7',   type: 'bidir'  },
      { pin:  6, name: 'A5',   type: 'bidir'  },
      { pin:  7, name: 'E1',   type: 'input'  },
      { pin:  8, name: 'E2',   type: 'input'  },
      { pin:  9, name: 'VEE',  type: 'power'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'LE',   type: 'input'  },
      { pin: 12, name: 'S2',   type: 'input'  },
      { pin: 13, name: 'S1',   type: 'input'  },
      { pin: 14, name: 'NC2',  type: 'nc'     },
      { pin: 15, name: 'S0',   type: 'input'  },
      { pin: 16, name: 'A3',   type: 'bidir'  },
      { pin: 17, name: 'A0',   type: 'bidir'  },
      { pin: 18, name: 'A1',   type: 'bidir'  },
      { pin: 19, name: 'A2',   type: 'bidir'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'ANALOG_MUX_8_LATCH', inputs: ['S0','S1','S2','LE','E1','E2'], outputs: [] },
    ],
  },

  // 74x4352: Dual 4-channel analog mux/demux with latch (20-pin).
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD54HC4351, CD74HC4351, CD74HCT4351, CD74HC4352 — High-Speed CMOS Logic
  //   Analog Multiplexers/Demultiplexers with Latch", SCHS213C (Sep. 1998, rev.
  //   Jul. 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4352.pdf. Verified: CD74HC4352
  //   20-Ld PDIP terminal assignment (page 1, "Pinouts"), functional diagram +
  //   TRUTH TABLE for CD74HC4352 (page 3) — read as rendered ~300-dpi PDF page
  //   images (issues.md C4: never trust the text summarizer for TI PDFs).
  //   Corrected the prior hand-entered stub pinout, which was invented (it used
  //   1Y0../2Y0../1Z/1Zn/INH and did not match the datasheet on any channel,
  //   common, enable, select, or latch pin — issues.md C2 class). Real map
  //   (DIP, top view): B0=1, B2=2, NC=3, BCOM=4, B3=5, B1=6, E1=7, E2=8, VEE=9,
  //   GND=10, LE=11, S1=12, S0=13, NC=14, A3=15, A0=16, ACOM=17, A1=18, A2=19,
  //   VCC=20. Enable: switches conduct only when E1=LOW AND E2=HIGH (truth-table
  //   "None" row otherwise). Latch (LE): HIGH = transparent, LOW = hold (note 2:
  //   "When Latch Enable is 'Low' channel-select data is latched"). Same die as
  //   the single-bank CD74HC4351 (74x4351) — reuses the same enable/latch logic.
  '74x4352': {
    name: '74x4352',
    simpleName: 'Dual 4-Ch Analog Mux with Latch',
    description: 'Dual 4-channel analog multiplexer/demultiplexer with address latch (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    sequential: true,
    onResistance: 70,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4352.pdf',
    tags: ['analog', 'mux', '4-channel', 'dual', 'latch'],
    guideOverview: 'The 74x4352 is two 4-channel analog multiplexer/demultiplexers in one package that switch together. Each section connects one of its four channels to a common pin, and the switches pass signal in either direction. Both sections share a single two-bit select, so picking channel 2 ties A2 to the A common and B2 to the B common at the same time. The select value is held in an internal latch, and two enable pins let the part be gated from either an active-low or an active-high control signal.',
    guidePinDescriptions: {
      'A0': 'Section A, analog channel 0.',
      'A1': 'Section A, analog channel 1.',
      'A2': 'Section A, analog channel 2.',
      'A3': 'Section A, analog channel 3.',
      'ACOM': 'Section A common pin. Connects to whichever A channel is selected. Signal flows either way through the switch.',
      'B0': 'Section B, analog channel 0.',
      'B1': 'Section B, analog channel 1.',
      'B2': 'Section B, analog channel 2.',
      'B3': 'Section B, analog channel 3.',
      'BCOM': 'Section B common pin. Connects to the matching B channel at the same time the A section switches. Signal flows either way.',
      'S0': 'Select input, least significant bit. Picks the channel number for both sections.',
      'S1': 'Select input, most significant bit.',
      'LE': 'Latch enable. HIGH makes the latch follow S0 and S1; LOW freezes the stored channel so the selects can change without moving the switches.',
      'E1': 'Enable, active LOW. Must be LOW for any channel to conduct.',
      'E2': 'Enable, active HIGH. Must be HIGH for any channel to conduct.',
      'GND': 'Ground reference for the chip.',
      'VEE': 'Lower analog supply rail. Lets the channels pass voltages below ground on a real device.',
      'VCC': 'Positive supply for the switches and control logic.',
      'NC': 'No internal connection. Leave unconnected.',
      'NC2': 'No internal connection. Leave unconnected.',
    },
    guideSections: [
      {
        title: 'Two Sections, One Shared Address',
        paragraphs: [
          'S0 and S1 form a two-bit number that picks one channel, 0 to 3. That same number is used by both sections at once: select 1 connects A1 to the A common and B1 to the B common, select 3 connects A3 and B3, and so on. This is what makes the part useful for paired signals — a left and right audio channel, or a sensor line and its reference — that should always be routed as a unit.',
        ],
      },
      {
        title: 'Latched Address',
        paragraphs: [
          'While LE is HIGH the latch is transparent: the selected channels follow the select pins directly. Pull LE LOW and the chip remembers the last channel. The select pins can then change freely and the switches will not move until LE goes HIGH again. This lets a controller set the route, lock it, and reuse S0/S1 for something else.',
        ],
      },
      {
        title: 'Two Enable Pins',
        paragraphs: [
          'The chip conducts only when E1 is LOW and E2 is HIGH at the same time. If E1 goes HIGH or E2 goes LOW, every channel in both sections opens and the common pins are isolated. Having both polarities means the device can be gated by whichever control signal is on hand without an extra inverter.',
        ],
        note: '74Sim models each closed channel as a passive resistive coupling (~70 Ω) between a common pin and its selected channel, so analog voltages between the rails pass through and the switches work in both directions. The separate negative rail (VEE), on-resistance variation, crosstalk, and switching delays are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'B0',   type: 'bidir'  },
      { pin:  2, name: 'B2',   type: 'bidir'  },
      { pin:  3, name: 'NC',   type: 'nc'     },
      { pin:  4, name: 'BCOM', type: 'bidir'  },
      { pin:  5, name: 'B3',   type: 'bidir'  },
      { pin:  6, name: 'B1',   type: 'bidir'  },
      { pin:  7, name: 'E1',   type: 'input'  },
      { pin:  8, name: 'E2',   type: 'input'  },
      { pin:  9, name: 'VEE',  type: 'power'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'LE',   type: 'input'  },
      { pin: 12, name: 'S1',   type: 'input'  },
      { pin: 13, name: 'S0',   type: 'input'  },
      { pin: 14, name: 'NC2',  type: 'nc'     },
      { pin: 15, name: 'A3',   type: 'bidir'  },
      { pin: 16, name: 'A0',   type: 'bidir'  },
      { pin: 17, name: 'ACOM', type: 'bidir'  },
      { pin: 18, name: 'A1',   type: 'bidir'  },
      { pin: 19, name: 'A2',   type: 'bidir'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // ANALOG_MUX_DUAL4_LATCH: keys off pin NAMES ACOM/A0..A3 and BCOM/B0..B3;
      // latches sel = (S1<<1)|S0 while LE is HIGH, couples ACOM↔A[sel] and
      // BCOM↔B[sel] through onResistance when enabled (E1 LOW & E2 HIGH), else
      // opens all. (issues.md C5 — name-keyed analog coupling.)
      { type: 'ANALOG_MUX_DUAL4_LATCH', inputs: ['S0','S1','LE','E1','E2'], outputs: [] },
    ],
  },

  // 74x4353: Triple 2-channel analog mux/demux with address latch (20-pin).
  // Pinout, pin descriptions and function table verified against:
  //   SGS-Thomson Microelectronics, "M54/M74HC4351/4352/4353 — Analog
  //   Multiplexer/Demultiplexer with Address Latch: Single 8 Channel, Dual 4
  //   Channel, Triple 2 Channel", Nov. 1993. [Online]. Available:
  //   https://manualmachine.com/sgsthomson/m54hc4351/8396442-handbook/
  //   Verified: HC4353 PIN DESCRIPTION table (page 2) + TRUTH TABLE (page 3),
  //   read as rendered HTML text. The original stub pinout (INH, a single
  //   select A, "nZn" outputs) was hand-entered and wrong (issues.md C2/C5
  //   class); replaced wholesale with the verified map below.
  // Family cross-check (enable/latch polarity, VEE/GND/VCC = 9/10/20, 20-pin
  //   package) against the TI/Harris doc for the 8- and 4-channel siblings:
  //   Texas Instruments, "CD54HC4351, CD74HC4351, CD74HCT4351, CD74HC4352 —
  //   High-Speed CMOS Logic Analog Multiplexers/Demultiplexers with Latch",
  //   SCHS213C, Jul. 2003. [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4351.pdf  Verified: pinouts +
  //   function tables, pages 1-3, read as 300-dpi PDF page images. (That doc
  //   does NOT cover the 4353 itself — SGS-Thomson is the authority for the
  //   triple-2-channel part; TI used only for the shared family conventions.)
  // Per SGS-Thomson HC4353 truth table: select A drives section X, B drives Y,
  //   C drives Z (each: bit 0 -> channel 0, bit 1 -> channel 1). Switches close
  //   only when EN1 (E1) is LOW AND EN2 (E2) is HIGH, else all open. Latch is
  //   transparent while LE is HIGH and holds the captured A/B/C while LE is LOW.
  //   This is exactly the ANALOG_MUX_TRIPLE2_LATCH primitive in
  //   js/specificChipsSim.js (a 4053 with an address latch + dual enable).
  '74x4353': {
    name: '74x4353',
    simpleName: 'Triple 2-Ch Analog Mux with Latch',
    description: 'Triple 2-channel analog mux/demux with address latch (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4351.pdf',
    tags: ['analog', 'mux', '2-channel', 'triple', 'latch'],
    guideOverview: 'The 74x4353 holds three independent two-way analog switches in one package. Each switch connects its own common pin to one of two channels, and all three are bidirectional — signals pass either way, so the same part works as a multiplexer or a demultiplexer. Each switch has its own select pin (A, B, C), so the three routes are set separately. A shared latch can freeze all three selections at once, and two enable pins open every switch together when the chip is turned off.',
    guidePinDescriptions: {
      'Y0': 'Section Y channel 0. Connects to Y common when select B is LOW.',
      'Y1': 'Section Y channel 1. Connects to Y common when select B is HIGH.',
      'YCOM': 'Common pin for section Y, routed to Y0 or Y1 by select B.',
      'Z0': 'Section Z channel 0. Connects to Z common when select C is LOW.',
      'Z1': 'Section Z channel 1. Connects to Z common when select C is HIGH.',
      'ZCOM': 'Common pin for section Z, routed to Z0 or Z1 by select C.',
      'X0': 'Section X channel 0. Connects to X common when select A is LOW.',
      'X1': 'Section X channel 1. Connects to X common when select A is HIGH.',
      'XCOM': 'Common pin for section X, routed to X0 or X1 by select A.',
      'A': 'Select input for section X. LOW picks X0, HIGH picks X1.',
      'B': 'Select input for section Y. LOW picks Y0, HIGH picks Y1.',
      'C': 'Select input for section Z. LOW picks Z0, HIGH picks Z1.',
      'LE': 'Latch enable. HIGH lets the selects pass through; LOW freezes the last A, B and C.',
      'E1': 'Enable, active LOW. Must be LOW for any switch to conduct.',
      'E2': 'Enable, active HIGH. Must be HIGH for any switch to conduct.',
      'VEE': 'Negative analog supply. Lets the switches pass signals that swing below ground.',
      'GND': 'Ground reference for the package.',
      'VCC': 'Positive supply for the package.',
      'NC': 'No connection.',
      'NC2': 'No connection.',
    },
    guideSections: [
      {
        title: 'Three Independent Switches',
        paragraphs: [
          'Unlike a single mux that shares one address across its channels, this part gives each of its three switches its own select pin. Select A routes section X, B routes section Y, and C routes section Z. A switch sends its common pin to channel 0 when its select is LOW and to channel 1 when its select is HIGH. Because the switches are independent, you can route three unrelated signals through one chip at the same time.',
        ],
      },
      {
        title: 'Latched Selects',
        paragraphs: [
          'While LE is HIGH the latch is transparent: each section follows its select pin directly. Pull LE LOW and the chip remembers all three selections at once. A, B and C can then change freely and the switches will not move until LE goes HIGH again. This lets a controller set the three routes, lock them, and reuse the select lines for something else.',
        ],
      },
      {
        title: 'Two Enable Pins',
        paragraphs: [
          'The chip conducts only when E1 is LOW and E2 is HIGH at the same time. If E1 goes HIGH or E2 goes LOW, all six channels open and the three common pins are isolated. Having both polarities means the device can be gated by whichever control signal is on hand without an extra inverter.',
        ],
        note: '74Sim models each closed channel as a passive resistive coupling (~80 Ω) between a common pin and its selected channel, so analog voltages between the rails pass through and the switches work in both directions. The separate negative rail (VEE), on-resistance variation, crosstalk, and switching delays are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Y0',   type: 'bidir'  }, // datasheet "0Y"
      { pin:  2, name: 'Y1',   type: 'bidir'  }, // datasheet "1Y"
      { pin:  3, name: 'NC',   type: 'nc'     },
      { pin:  4, name: 'Z1',   type: 'bidir'  }, // datasheet "1Z"
      { pin:  5, name: 'ZCOM', type: 'bidir'  }, // datasheet "Z COM"
      { pin:  6, name: 'Z0',   type: 'bidir'  }, // datasheet "0Z"
      { pin:  7, name: 'E1',   type: 'input'  }, // datasheet "EN1" active LOW
      { pin:  8, name: 'E2',   type: 'input'  }, // datasheet "EN2" active HIGH
      { pin:  9, name: 'VEE',  type: 'power'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'LE',   type: 'input'  }, // latch enable, HIGH = transparent
      { pin: 12, name: 'C',    type: 'input'  }, // select for section Z
      { pin: 13, name: 'B',    type: 'input'  }, // select for section Y
      { pin: 14, name: 'NC2',  type: 'nc'     },
      { pin: 15, name: 'A',    type: 'input'  }, // select for section X
      { pin: 16, name: 'X0',   type: 'bidir'  }, // datasheet "0X"
      { pin: 17, name: 'X1',   type: 'bidir'  }, // datasheet "1X"
      { pin: 18, name: 'XCOM', type: 'bidir'  }, // datasheet "X COM"
      { pin: 19, name: 'YCOM', type: 'bidir'  }, // datasheet "Y COM"
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // ANALOG_MUX_TRIPLE2_LATCH: keys off pin NAMES X0/X1/XCOM, Y0/Y1/YCOM,
      // Z0/Z1/ZCOM. Latches A->X, B->Y, C->Z while LE is HIGH; couples each
      // common to channel 0 (sel LOW) or channel 1 (sel HIGH) through
      // onResistance when enabled (E1 LOW & E2 HIGH), else opens all.
      { type: 'ANALOG_MUX_TRIPLE2_LATCH', inputs: ['A','B','C','LE','E1','E2'], outputs: [] },
    ],
  },

  // 74x4374: 8 bit dual rank synchronizer (20-pin) complex, stubbed
  '74x4374': {
    name: '74x4374',
    simpleName: '8 bit Dual Rank Synchronizer',
    description: '8 bit dual rank synchronizer with three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['synchronizer', '8 bit', 'dual-rank', 'tri state', 'stub'],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'D3',   type: 'input'  },
      { pin:  5, name: 'D4',   type: 'input'  },
      { pin:  6, name: 'D5',   type: 'input'  },
      { pin:  7, name: 'D6',   type: 'input'  },
      { pin:  8, name: 'D7',   type: 'input'  },
      { pin:  9, name: 'D8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'CLK',  type: 'input'  },
      { pin: 12, name: 'Q8',   type: 'output' },
      { pin: 13, name: 'Q7',   type: 'output' },
      { pin: 14, name: 'Q6',   type: 'output' },
      { pin: 15, name: 'Q5',   type: 'output' },
      { pin: 16, name: 'Q4',   type: 'output' },
      { pin: 17, name: 'Q3',   type: 'output' },
      { pin: 18, name: 'Q2',   type: 'output' },
      { pin: 19, name: 'Q1',   type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['OEn','CLK','D1','D2','D3','D4','D5','D6','D7','D8'], outputs: [] },
    ],
  },

  // 74x4510: BCD decade up/down counter (16-pin)
  '74x4510': {
    name: '74x4510',
    simpleName: 'BCD Decade Up/Down Counter',
    description: 'Presettable synchronous BCD decade up/down counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/gpn/cd4510b',
    tags: ['counter', 'BCD', 'decade', 'up-down', 'presettable'],
    guideOverview: 'The 74x4510 is a presettable synchronous BCD up/down counter. It can count upward or downward through decimal states, load a starting value, and cascade with other counters through its carry connections. This makes it useful for decimal timers, score counters, frequency division, and any project that needs a real decimal sequence rather than a straight binary count.',
    guidePinDescriptions: {
      'PE': 'Preset or parallel load enable control used to load P0 through P3 into the counter.',
      'Q1': 'Counter output bit 1.',
      'Q0': 'Counter output bit 0, the least significant BCD bit.',
      'CI': 'Carry in or cascade input used when chaining counters.',
      'UD': 'Up/down direction control.',
      'Q2': 'Counter output bit 2.',
      'Q3': 'Counter output bit 3, the most significant BCD bit.',
      'GND': 'Ground reference for the package.',
      'P3': 'Preset input bit 3.',
      'P2': 'Preset input bit 2.',
      'MR': 'Master reset. Assert it to return the counter to zero.',
      'CP': 'Clock input for synchronous counting.',
      'COn': 'Active LOW carry output for cascading to the next stage.',
      'P1': 'Preset input bit 1.',
      'P0': 'Preset input bit 0.',
      'VCC': 'Positive supply for the counter.',
    },
    guideSections: [
      {
        title: 'Decimal Up/Down Counting',
        paragraphs: [
          'Unlike a pure binary counter, a BCD decade counter cycles only through decimal states 0 to 9. The UD input chooses whether the sequence moves upward or downward.',
        ],
      },
      {
        title: 'Preset and Cascade',
        paragraphs: [
          'Preset inputs let the count start from a chosen value instead of zero. Carry in and carry out connections let multiple counters be chained into multi digit decimal systems.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'PE',   type: 'input'  },
      { pin:  2, name: 'Q1',   type: 'output' },
      { pin:  3, name: 'Q0',   type: 'output' },
      { pin:  4, name: 'CI',   type: 'input'  },
      { pin:  5, name: 'UD',   type: 'input'  },
      { pin:  6, name: 'Q2',   type: 'output' },
      { pin:  7, name: 'Q3',   type: 'output' },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'P3',   type: 'input'  },
      { pin: 10, name: 'P2',   type: 'input'  },
      { pin: 11, name: 'MR',   type: 'input'  },
      { pin: 12, name: 'CP',   type: 'input'  },
      { pin: 13, name: 'COn',  type: 'output' },
      { pin: 14, name: 'P1',   type: 'input'  },
      { pin: 15, name: 'P0',   type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BCD_UPDOWN_CD', inputs: ['CP','UD','PE','CI','MR','P0','P1','P2','P3'], outputs: ['Q0','Q1','Q2','Q3','COn'] },
    ],
  },

  // 74x4511: BCD to 7 segment latch/decoder/driver (16-pin)
  '74x4511': {
    name: '74x4511',
    simpleName: 'BCD to 7 Segment Decoder',
    description: 'BCD to 7 segment latch/decoder/driver (common cathode) (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4511.pdf',
    tags: ['decoder', 'BCD', '7 segment', 'latch', 'driver'],
    guideOverview: 'The 74x4511 converts a 4 bit BCD input into the seven segment drive signals needed for a common cathode numeric display. It also includes latch and display-control functions, so a displayed digit can be held steady even if the input code changes. This is one of the simplest ways to drive a single decimal digit from logic or a microcontroller.',
    guidePinDescriptions: {
      'B': 'BCD input bit B.',
      'C': 'BCD input bit C.',
      'LTn': 'Active LOW lamp test input. Pull LOW to force the display segments on for test purposes.',
      'BIn': 'Blanking input control used to suppress the display output when required.',
      'LE': 'Latch enable. Use it to hold the displayed digit even if the input code changes.',
      'D': 'Most significant BCD input bit.',
      'A': 'Least significant BCD input bit.',
      'GND': 'Ground reference for the decoder/driver.',
      'e': 'Segment e output.',
      'd': 'Segment d output.',
      'c': 'Segment c output.',
      'b': 'Segment b output.',
      'a': 'Segment a output.',
      'g': 'Segment g output.',
      'f': 'Segment f output.',
      'VCC': 'Positive supply for the chip.',
    },
    guideSections: [
      {
        title: 'BCD To 7 Segment Decoding',
        paragraphs: [
          'A BCD to-7 segment decoder turns the binary coded decimal values 0 through 9 into the correct pattern of segments a through g. That saves a lot of manual logic when driving numeric displays.',
        ],
      },
      {
        title: 'Latch and Display Controls',
        paragraphs: [
          'The latch lets you freeze one digit on the display, while blanking and lamp test make it easier to control and debug the display output. Those extras are why the 4511 is more convenient than a plain decoder.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'B',    type: 'input'  },
      { pin:  2, name: 'C',    type: 'input'  },
      { pin:  3, name: 'LTn',  type: 'input'  },
      { pin:  4, name: 'BIn',  type: 'input'  },
      { pin:  5, name: 'LE',   type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'A',    type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'e',    type: 'output' },
      { pin: 10, name: 'd',    type: 'output' },
      { pin: 11, name: 'c',    type: 'output' },
      { pin: 12, name: 'b',    type: 'output' },
      { pin: 13, name: 'a',    type: 'output' },
      { pin: 14, name: 'g',    type: 'output' },
      { pin: 15, name: 'f',    type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'BCD_7SEG_4511', inputs: ['A','B','C','D','LE','BIn','LTn'], outputs: ['a','b','c','d','e','f','g'] },
    ],
  },

  // 74x4514: 4-to-16 decoder with input latches, active HIGH outputs (24-pin)
  '74x4514': {
    name: '74x4514',
    simpleName: '4-to-16 Decoder (Active HIGH, Latched)',
    description: '4-to-16 decoder/demux, input latches, active HIGH outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4514.pdf',
    tags: ['decoder', '4-to-16', 'latch', 'active high'],
    guideOverview: 'The 74x4514 is a 4-to-16 decoder with latched inputs and active HIGH outputs. A 4 bit input selects exactly one of sixteen outputs, and the latch can hold that selection even after the input lines change. It is useful for one hot control, address decoding, and selecting one of many destinations from a small binary code.',
    guidePinDescriptions: {
      'LE': 'Latch enable for the 4 bit address input.',
      'D': 'Most significant address input bit.',
      'C': 'Address input bit C.',
      'B': 'Address input bit B.',
      'A': 'Least significant address input bit.',
      'Y7': 'Decoded output 7, active HIGH when address 7 is selected.',
      'Y6': 'Decoded output 6.',
      'Y5': 'Decoded output 5.',
      'Y4': 'Decoded output 4.',
      'Y3': 'Decoded output 3.',
      'Y2': 'Decoded output 2.',
      'GND': 'Ground reference for the package.',
      'Y1': 'Decoded output 1.',
      'Y0': 'Decoded output 0.',
      'Y15': 'Decoded output 15.',
      'Y14': 'Decoded output 14.',
      'Y13': 'Decoded output 13.',
      'Y12': 'Decoded output 12.',
      'Y11': 'Decoded output 11.',
      'Y10': 'Decoded output 10.',
      'Y9': 'Decoded output 9.',
      'Y8': 'Decoded output 8.',
      'ENn': 'Active LOW enable. Pull LOW to allow decoding.',
      'VCC': 'Positive supply for the decoder.',
    },
    guideSections: [
      {
        title: 'One Of Sixteen Decoding',
        paragraphs: [
          'The 4 bit input code is expanded into a one hot output pattern. Only one of the sixteen outputs is asserted at a time when the device is enabled.',
        ],
      },
      {
        title: 'Latched Addressing',
        paragraphs: [
          'The latch lets the selected output remain stable even if the input address bus changes afterward. That can be useful in systems where the address bus is shared or only valid briefly.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'LE',   type: 'input'  },
      { pin:  2, name: 'D',    type: 'input'  },
      { pin:  3, name: 'C',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'A',    type: 'input'  },
      { pin:  6, name: 'Y7',   type: 'output' },
      { pin:  7, name: 'Y6',   type: 'output' },
      { pin:  8, name: 'Y5',   type: 'output' },
      { pin:  9, name: 'Y4',   type: 'output' },
      { pin: 10, name: 'Y3',   type: 'output' },
      { pin: 11, name: 'Y2',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'Y1',   type: 'output' },
      { pin: 14, name: 'Y0',   type: 'output' },
      { pin: 15, name: 'Y15',  type: 'output' },
      { pin: 16, name: 'Y14',  type: 'output' },
      { pin: 17, name: 'Y13',  type: 'output' },
      { pin: 18, name: 'Y12',  type: 'output' },
      { pin: 19, name: 'Y11',  type: 'output' },
      { pin: 20, name: 'Y10',  type: 'output' },
      { pin: 21, name: 'Y9',   type: 'output' },
      { pin: 22, name: 'Y8',   type: 'output' },
      { pin: 23, name: 'ENn',  type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'DEC_4TO16_LATCH_HI', inputs: ['A','B','C','D','LE','ENn'], outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10','Y11','Y12','Y13','Y14','Y15'] },
    ],
  },

  // 74x4515: 4-to-16 decoder with input latches, active LOW outputs (24-pin)
  '74x4515': {
    name: '74x4515',
    simpleName: '4-to-16 Decoder (Active LOW, Latched)',
    description: '4-to-16 decoder/demux, input latches, active LOW outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4515.pdf',
    tags: ['decoder', '4-to-16', 'latch', 'active low'],
    guideOverview: 'The 74x4515 is the active LOW companion to the 4514. It decodes a 4 bit input into one of sixteen outputs, but the selected output goes LOW instead of HIGH. This is useful in systems that use active LOW enables, chip-selects, or bus control signals.',
    guidePinDescriptions: {
      'LE': 'Latch enable for the address inputs.',
      'D': 'Most significant address input bit.',
      'C': 'Address input bit C.',
      'B': 'Address input bit B.',
      'A': 'Least significant address input bit.',
      'Y7n': 'Decoded output 7, active LOW when address 7 is selected.',
      'Y6n': 'Decoded output 6, active LOW.',
      'Y5n': 'Decoded output 5, active LOW.',
      'Y4n': 'Decoded output 4, active LOW.',
      'Y3n': 'Decoded output 3, active LOW.',
      'Y2n': 'Decoded output 2, active LOW.',
      'GND': 'Ground reference for the chip.',
      'Y1n': 'Decoded output 1, active LOW.',
      'Y0n': 'Decoded output 0, active LOW.',
      'Y15n': 'Decoded output 15, active LOW.',
      'Y14n': 'Decoded output 14, active LOW.',
      'Y13n': 'Decoded output 13, active LOW.',
      'Y12n': 'Decoded output 12, active LOW.',
      'Y11n': 'Decoded output 11, active LOW.',
      'Y10n': 'Decoded output 10, active LOW.',
      'Y9n': 'Decoded output 9, active LOW.',
      'Y8n': 'Decoded output 8, active LOW.',
      'ENn': 'Active LOW enable input.',
      'VCC': 'Positive supply for the decoder.',
    },
    guideSections: [
      {
        title: 'Active LOW Decoding',
        paragraphs: [
          'The 4515 produces the same one of sixteen selection pattern as the 4514, but with active LOW outputs. That is often more convenient for chip-select and bus enable signals that are already LOW true.',
        ],
      },
      {
        title: 'Latched Selection',
        paragraphs: [
          'As with the 4514, the address can be latched internally so the selected output remains stable after the input bus changes. This is useful in multiplexed and shared bus designs.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'LE',    type: 'input'  },
      { pin:  2, name: 'D',     type: 'input'  },
      { pin:  3, name: 'C',     type: 'input'  },
      { pin:  4, name: 'B',     type: 'input'  },
      { pin:  5, name: 'A',     type: 'input'  },
      { pin:  6, name: 'Y7n',   type: 'output' },
      { pin:  7, name: 'Y6n',   type: 'output' },
      { pin:  8, name: 'Y5n',   type: 'output' },
      { pin:  9, name: 'Y4n',   type: 'output' },
      { pin: 10, name: 'Y3n',   type: 'output' },
      { pin: 11, name: 'Y2n',   type: 'output' },
      { pin: 12, name: 'GND',   type: 'power'  },
      { pin: 13, name: 'Y1n',   type: 'output' },
      { pin: 14, name: 'Y0n',   type: 'output' },
      { pin: 15, name: 'Y15n',  type: 'output' },
      { pin: 16, name: 'Y14n',  type: 'output' },
      { pin: 17, name: 'Y13n',  type: 'output' },
      { pin: 18, name: 'Y12n',  type: 'output' },
      { pin: 19, name: 'Y11n',  type: 'output' },
      { pin: 20, name: 'Y10n',  type: 'output' },
      { pin: 21, name: 'Y9n',   type: 'output' },
      { pin: 22, name: 'Y8n',   type: 'output' },
      { pin: 23, name: 'ENn',   type: 'input'  },
      { pin: 24, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'DEC_4TO16_LATCH_LO', inputs: ['A','B','C','D','LE','ENn'], outputs: ['Y0n','Y1n','Y2n','Y3n','Y4n','Y5n','Y6n','Y7n','Y8n','Y9n','Y10n','Y11n','Y12n','Y13n','Y14n','Y15n'] },
    ],
  },

  // 74x4516: 4 bit binary up/down counter (16-pin)
  '74x4516': {
    name: '74x4516',
    simpleName: '4 bit Binary Up/Down Counter',
    description: 'Presettable synchronous 4 bit binary up/down counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/gpn/cd4516b',
    tags: ['counter', 'binary', '4 bit', 'up-down', 'presettable'],
    guideOverview: 'The 74x4516 is a presettable synchronous 4 bit binary up/down counter. It can count upward or downward, load a starting value, and cascade into larger counters through its carry connections. This is a versatile part for programmable timing, binary state sequencing, and divide by-N designs.',
    guidePinDescriptions: {
      'PE': 'Preset or parallel load enable control used to load P0 through P3 into the counter.',
      'Q1': 'Counter output bit 1.',
      'Q0': 'Counter output bit 0, the least significant bit.',
      'CI': 'Carry in or cascade input used when chaining counters.',
      'UD': 'Up/down direction control.',
      'Q2': 'Counter output bit 2.',
      'Q3': 'Counter output bit 3, the most significant output bit.',
      'GND': 'Ground reference for the device.',
      'P3': 'Preset input bit 3.',
      'P2': 'Preset input bit 2.',
      'MR': 'Master reset. Assert it to clear the count.',
      'CP': 'Clock input for synchronous counting.',
      'COn': 'Active LOW carry output for cascade operation.',
      'P1': 'Preset input bit 1.',
      'P0': 'Preset input bit 0.',
      'VCC': 'Positive supply for the counter.',
    },
    guideSections: [
      {
        title: 'Binary Up/Down Counting',
        paragraphs: [
          'Unlike the 4510, this part counts through all 16 binary states from 0000 to 1111. The UD input selects whether the count moves upward or downward.',
        ],
      },
      {
        title: 'Preset and Cascading',
        paragraphs: [
          'Preset inputs allow the counter to start from an arbitrary binary value, and the carry pins support chaining to build wider counters. That makes the 4516 a flexible general purpose synchronous counter.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'PE',   type: 'input'  },
      { pin:  2, name: 'Q1',   type: 'output' },
      { pin:  3, name: 'Q0',   type: 'output' },
      { pin:  4, name: 'CI',   type: 'input'  },
      { pin:  5, name: 'UD',   type: 'input'  },
      { pin:  6, name: 'Q2',   type: 'output' },
      { pin:  7, name: 'Q3',   type: 'output' },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'P3',   type: 'input'  },
      { pin: 10, name: 'P2',   type: 'input'  },
      { pin: 11, name: 'MR',   type: 'input'  },
      { pin: 12, name: 'CP',   type: 'input'  },
      { pin: 13, name: 'COn',  type: 'output' },
      { pin: 14, name: 'P1',   type: 'input'  },
      { pin: 15, name: 'P0',   type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_UPDOWN_CD', inputs: ['CP','UD','PE','CI','MR','P0','P1','P2','P3'], outputs: ['Q0','Q1','Q2','Q3','COn'] },
    ],
  },

  // 74x4518: Dual synchronous BCD decade counter (16-pin)
  '74x4518': {
    name: '74x4518',
    simpleName: 'Dual Synchronous BCD Counter',
    description: 'Dual synchronous 4 bit BCD decade counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4518.pdf',
    tags: ['counter', 'BCD', 'decade', 'dual', 'synchronous'],
    guideOverview: 'The 74x4518 contains two independent synchronous BCD decade counters in one package. Each section counts from 0 to 9 and then wraps, which makes the chip useful for decimal event counting, timers, and multi digit counters. Having two sections in one IC is convenient when building simple clocks or score displays.',
    guidePinDescriptions: {
      '1CP': 'Clock input for counter section 1.',
      '1EN': 'Enable control for counter section 1.',
      '1Q0': 'Least significant BCD output bit of section 1.',
      '1Q1': 'BCD output bit 1 of section 1.',
      '1Q2': 'BCD output bit 2 of section 1.',
      '1Q3': 'Most significant BCD output bit of section 1.',
      '1MR': 'Master reset for counter section 1.',
      'GND': 'Ground reference for the package.',
      '2MR': 'Master reset for counter section 2.',
      '2Q3': 'Most significant BCD output bit of section 2.',
      '2Q2': 'BCD output bit 2 of section 2.',
      '2Q1': 'BCD output bit 1 of section 2.',
      '2Q0': 'Least significant BCD output bit of section 2.',
      '2EN': 'Enable control for counter section 2.',
      '2CP': 'Clock input for counter section 2.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Two Decade Counters',
        paragraphs: [
          'Each section counts only the decimal values 0 through 9. Because the two counters are independent, one package can handle two digits or two unrelated BCD counting jobs.',
        ],
      },
      {
        title: 'Synchronous Operation',
        paragraphs: [
          'Because the counters are synchronous, the output bits change together in a more controlled way than in a ripple design. That is helpful when the outputs feed other logic directly.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1CP',  type: 'input'  },
      { pin:  2, name: '1EN',  type: 'input'  },
      { pin:  3, name: '1Q0',  type: 'output' },
      { pin:  4, name: '1Q1',  type: 'output' },
      { pin:  5, name: '1Q2',  type: 'output' },
      { pin:  6, name: '1Q3',  type: 'output' },
      { pin:  7, name: '1MR',  type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: '2MR',  type: 'input'  },
      { pin: 10, name: '2Q3',  type: 'output' },
      { pin: 11, name: '2Q2',  type: 'output' },
      { pin: 12, name: '2Q1',  type: 'output' },
      { pin: 13, name: '2Q0',  type: 'output' },
      { pin: 14, name: '2EN',  type: 'input'  },
      { pin: 15, name: '2CP',  type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_GATED_DECADE', inputs: ['1CP','1EN','1MR'], outputs: ['1Q0','1Q1','1Q2','1Q3'] },
      { type: 'COUNTER_GATED_DECADE', inputs: ['2CP','2EN','2MR'], outputs: ['2Q0','2Q1','2Q2','2Q3'] },
    ],
  },

  // 74x4520: Dual synchronous binary counter (16-pin)
  '74x4520': {
    name: '74x4520',
    simpleName: 'Dual Synchronous Binary Counter',
    description: 'Dual synchronous 4 bit binary counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4520.pdf',
    tags: ['counter', 'binary', '4 bit', 'dual', 'synchronous'],
    guideOverview: 'The 74x4520 contains two independent synchronous 4 bit binary counters. Each section counts from 0 to 15 and then wraps, making it useful for compact digital timing and state generation. It is the binary counterpart to the 4518, trading decimal counting for a full 4 bit range.',
    guidePinDescriptions: {
      '1CP': 'Clock input for counter section 1.',
      '1EN': 'Enable control for counter section 1.',
      '1Q0': 'Least significant binary output bit of section 1.',
      '1Q1': 'Binary output bit 1 of section 1.',
      '1Q2': 'Binary output bit 2 of section 1.',
      '1Q3': 'Most significant binary output bit of section 1.',
      '1MR': 'Master reset for counter section 1.',
      'GND': 'Ground reference for the device.',
      '2MR': 'Master reset for counter section 2.',
      '2Q3': 'Most significant binary output bit of section 2.',
      '2Q2': 'Binary output bit 2 of section 2.',
      '2Q1': 'Binary output bit 1 of section 2.',
      '2Q0': 'Least significant binary output bit of section 2.',
      '2EN': 'Enable control for counter section 2.',
      '2CP': 'Clock input for counter section 2.',
      'VCC': 'Positive supply for the package.',
    },
    guideSections: [
      {
        title: 'Dual Binary Counting',
        paragraphs: [
          'Each counter section advances through the sixteen 4 bit binary states. That makes the part useful for binary timing, state generation, and dividing a clock by programmable binary stages.',
        ],
      },
      {
        title: 'Why Synchronous Matters',
        paragraphs: [
          'In a synchronous counter, all bits are updated under one clocked action rather than rippling stage to stage. This reduces transient decode glitches when the outputs are fed into other logic.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1CP',  type: 'input'  },
      { pin:  2, name: '1EN',  type: 'input'  },
      { pin:  3, name: '1Q0',  type: 'output' },
      { pin:  4, name: '1Q1',  type: 'output' },
      { pin:  5, name: '1Q2',  type: 'output' },
      { pin:  6, name: '1Q3',  type: 'output' },
      { pin:  7, name: '1MR',  type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: '2MR',  type: 'input'  },
      { pin: 10, name: '2Q3',  type: 'output' },
      { pin: 11, name: '2Q2',  type: 'output' },
      { pin: 12, name: '2Q1',  type: 'output' },
      { pin: 13, name: '2Q0',  type: 'output' },
      { pin: 14, name: '2EN',  type: 'input'  },
      { pin: 15, name: '2CP',  type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_GATED_BIN', inputs: ['1CP','1EN','1MR'], outputs: ['1Q0','1Q1','1Q2','1Q3'] },
      { type: 'COUNTER_GATED_BIN', inputs: ['2CP','2EN','2MR'], outputs: ['2Q0','2Q1','2Q2','2Q3'] },
    ],
  },

  // 74x4538: Dual precision retriggerable monostable (16-pin)
  // CMOS counterpart to the 74x123: two independent one-shots, each with
  // external R/C timing, an active LOW reset, and complementary Q/Qn outputs.
  '74x4538': {
    name: '74x4538',
    simpleName: 'Dual Precision Monostable',
    description: 'Dual precision retriggerable monostable multivibrator (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4538.pdf',
    tags: ['monostable', 'multivibrator', 'one shot', 'retriggerable', 'dual', 'timer', 'pulse', 'precision', 'CMOS'],
    guideOverview: 'The 74x4538 (CD4538) is a CMOS dual precision monostable. Each section produces one timed pulse on Q when triggered, with the pulse width set by an external R and C. Compared to the 74x123, the 4538 is the precision CMOS option: cleaner timing, wider supply range, lower power. Use it for debounce, pulse stretching, edge-to-pulse conversion, and one-shot delays.',
    guidePinDescriptions: {
      '1CX':    'External timing capacitor connection for section 1.',
      '1RX':    'External timing resistor connection for section 1 (documentation-only in 74Sim).',
      '1CLR':   'Clear for section 1, active LOW. Pull LOW to abort an active pulse.',
      '1A':     'Active LOW trigger for section 1. Falling edge (while 1B=HIGH) triggers the pulse.',
      '1B':     'Active HIGH trigger for section 1. Rising edge (while 1A=LOW) triggers the pulse.',
      '1Q':     'True output of section 1. LOW when idle, HIGH during pulse.',
      '1Qn':    'Inverted output of section 1.',
      'GND':    'Ground reference (pin 8).',
      '2Qn':    'Inverted output of section 2.',
      '2Q':     'True output of section 2.',
      '2B':     'Active HIGH trigger for section 2.',
      '2A':     'Active LOW trigger for section 2.',
      '2CLR':   'Clear for section 2, active LOW.',
      '2RX':    'External timing resistor connection for section 2 (documentation-only in 74Sim).',
      '2CX':    'External timing capacitor connection for section 2.',
      'VCC':    'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Dual Precision One Shot',
        paragraphs: [
          'Each section operates independently. Connect a capacitor between CX and GND, and a resistor between CX and VCC, to set the pulse width: tW ≈ 0.7 × R × C. In 74Sim the RX pin is documentation-only; both R and C attach to the CX side and the pulse timing emerges from the analog cap voltage as it charges through R.',
          'Retriggerable: a new trigger edge during an active pulse extends the timing. CLR=LOW aborts the pulse immediately.',
        ],
        formulas: ['tW ≈ 0.7 × R × C'],
      },
    ],
    pinout: [
      { pin:  1, name: '1CX',   type: 'input',  description: 'External timing capacitor connection for section 1' },
      { pin:  2, name: '1RX',   type: 'input',  description: 'External timing resistor connection for section 1 (documentation-only)' },
      { pin:  3, name: '1CLR',  type: 'input',  description: 'Clear for section 1 (active LOW, aborts pulse)' },
      { pin:  4, name: '1A',    type: 'input',  description: 'Active LOW trigger for section 1' },
      { pin:  5, name: '1B',    type: 'input',  description: 'Active HIGH trigger for section 1' },
      { pin:  6, name: '1Q',    type: 'output', description: 'True output of section 1' },
      { pin:  7, name: '1Qn',   type: 'output', description: 'Inverted output of section 1' },
      { pin:  8, name: 'GND',   type: 'power' },
      { pin:  9, name: '2Qn',   type: 'output', description: 'Inverted output of section 2' },
      { pin: 10, name: '2Q',    type: 'output', description: 'True output of section 2' },
      { pin: 11, name: '2B',    type: 'input',  description: 'Active HIGH trigger for section 2' },
      { pin: 12, name: '2A',    type: 'input',  description: 'Active LOW trigger for section 2' },
      { pin: 13, name: '2CLR',  type: 'input',  description: 'Clear for section 2 (active LOW)' },
      { pin: 14, name: '2RX',   type: 'input',  description: 'External timing resistor connection for section 2 (documentation-only)' },
      { pin: 15, name: '2CX',   type: 'input',  description: 'External timing capacitor connection for section 2' },
      { pin: 16, name: 'VCC',   type: 'power' },
    ],
    gates: [
      { type: 'MONOSTABLE_RC', inputs: ['1A','1B','1CLR','1CX'], outputs: ['1Q','1Qn'] },
      { type: 'MONOSTABLE_RC', inputs: ['2A','2B','2CLR','2CX'], outputs: ['2Q','2Qn'] },
    ],
    sequential: true,
  },

  // 74x4543: BCD-to-7-segment latch/decoder/driver for LCDs (16-pin).
  //
  // The hand-entered stub pinout was WRONG (it had BI/PH/BCD bits and the segment
  // outputs scrambled). Corrected against the datasheet below. Both the HC part and
  // the original CMOS CD4543B share an identical pinout and function table, so the
  // two sources cross-check each other.
  //
  // Source: Texas Instruments (Harris Semiconductor), "CD74HC4543 High-Speed CMOS
  //   Logic BCD-to-7-Segment Latch/Decoder/Driver for LCDs", SCHS217B (Feb 1998,
  //   rev. Jul 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4543.pdf. Verified: terminal
  //   assignment (TOP VIEW, page 1) and FUNCTION TABLE (page 2), read as rendered
  //   PDF page images (issues.md C4): LD pin1; D2 pin2, D1 pin3, D3 pin4, D0 pin5;
  //   PH pin6, BI pin7, GND pin8; a pin9, b 10, c 11, d 12, e 13, g 14, f 15,
  //   VCC 16. LD=H transparent / LD=L hold, BI=H blank, PH=H inverts, codes 10-15
  //   blank.
  // Source: Texas Instruments (Harris Semiconductor), "CD4543B Types — CMOS
  //   BCD-to-Seven-Segment Latch/Decoder/Driver For Liquid-Crystal Displays",
  //   SCHS086D (rev. Apr 2004). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4543b.pdf. Verified: TERMINAL ASSIGNMENT
  //   (page 1) and "TRUTH TABLE FOR CD4543B" (page 5), read as PDF page images —
  //   same pinout (BCD pins labelled by weight: C=2^2 pin2, B=2^1 pin3, D=2^3 pin4,
  //   A=2^0 pin5) and same behaviour as the HC part.
  //
  // Pin names below use the weight labels A(2^0)..D(2^3) and BI; the engine maps
  // them to the BCD_7SEG_4543_HC primitive (defined in js/specificChipsSim.js).
  // Note the LD polarity is the OPPOSITE of the existing BCD_7SEG_4543 primitive
  // used by the chips69 CD4543 entry (which is itself wrong vs the datasheet — see
  // issues.md C37), which is why this part gets its own correctly-polarized type.
  '74x4543': {
    name: '74x4543',
    simpleName: 'BCD to 7 Segment LCD Driver',
    description: 'BCD to 7 segment latch/decoder/driver for LCDs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4543.pdf',
    tags: ['decoder', 'BCD', '7 segment', 'LCD', 'latch', 'driver'],
    guideOverview: 'The 74x4543 turns a 4-bit BCD code (0 through 9) into the seven segment signals that draw that digit. On top of the plain decoder it adds three controls: a latch that freezes the displayed digit so the inputs can change without the display flickering, a blanking input that turns every segment off, and a phase input that flips all seven outputs at once. The phase flip is what makes it work with LCDs, which must be driven by an alternating signal rather than a steady voltage, but it doubles as a way to pick common-cathode or common-anode for an LED display.',
    guidePinDescriptions: {
      'LD': 'Latch disable. HIGH: the latch is transparent, so the displayed digit follows the BCD inputs. LOW: the last digit is held even if the inputs change.',
      'A': 'BCD input bit 0 (weight 1, least significant).',
      'B': 'BCD input bit 1 (weight 2).',
      'C': 'BCD input bit 2 (weight 4).',
      'D': 'BCD input bit 3 (weight 8, most significant).',
      'BI': 'Blanking input. HIGH turns every segment off. Hold it LOW for a normal display.',
      'PH': 'Phase input. LOW gives active-HIGH segments (common-cathode LED). HIGH inverts all seven outputs (common-anode LED). For an LCD, drive PH and the display backplane with the same square wave.',
      'GND': 'Ground reference for the chip.',
      'a': 'Segment a output (top bar).',
      'b': 'Segment b output (upper right bar).',
      'c': 'Segment c output (lower right bar).',
      'd': 'Segment d output (bottom bar).',
      'e': 'Segment e output (lower left bar).',
      'f': 'Segment f output (upper left bar).',
      'g': 'Segment g output (middle bar).',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'The latch',
        paragraphs: [
          'While LD is HIGH the segment outputs follow the BCD inputs directly. Take LD LOW and the chip freezes the digit it was showing; the inputs can then change freely without disturbing the display. This is useful when the BCD code comes from a counter that is still running: you latch the value you want to read, then let the count continue.',
        ],
      },
      {
        title: 'Phase and LCD drive',
        paragraphs: [
          'An LCD segment darkens when there is a voltage across it and clears when there is none, but a steady DC voltage ruins the display over time, so LCDs are driven with an alternating signal instead. The PH input is how the 4543 does that: feed PH and the display backplane with the same square wave. When a segment is meant to be on, the chip drives it opposite to the backplane, so an AC voltage appears across it; when it is off, the segment and backplane move together and the segment stays clear.',
          'For an LED display you tie PH to a fixed level instead. PH LOW gives active-HIGH outputs for a common-cathode display; PH HIGH inverts all seven, suiting a common-anode display. The simulator models PH as a straight inversion of the seven outputs, which matches the function table; it does not generate the LCD waveform itself.',
        ],
      },
      {
        title: 'Blanking and invalid codes',
        paragraphs: [
          'Hold BI HIGH and all seven segments go off regardless of the BCD inputs. The decoder also blanks on its own for input codes 10 through 15, which are not valid BCD digits, so a garbage code shows nothing rather than a meaningless pattern.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'LD',   type: 'input'  },
      { pin:  2, name: 'C',    type: 'input'  },
      { pin:  3, name: 'B',    type: 'input'  },
      { pin:  4, name: 'D',    type: 'input'  },
      { pin:  5, name: 'A',    type: 'input'  },
      { pin:  6, name: 'PH',   type: 'input'  },
      { pin:  7, name: 'BI',   type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'a',    type: 'output' },
      { pin: 10, name: 'b',    type: 'output' },
      { pin: 11, name: 'c',    type: 'output' },
      { pin: 12, name: 'd',    type: 'output' },
      { pin: 13, name: 'e',    type: 'output' },
      { pin: 14, name: 'g',    type: 'output' },
      { pin: 15, name: 'f',    type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'BCD_7SEG_4543_HC', inputs: ['A','B','C','D','LD','BI','PH'], outputs: ['a','b','c','d','e','f','g'] },
    ],
  },

  // 74x4560: NBCD adder (CMOS 4000-series 4560), 16-pin
  // Source: Motorola, "MC14560B NBCD Adder", Motorola CMOS Logic Data (Rev 0, 1/94).
  //   [Online]. Available: https://digsys.upc.edu/csd/chips/classic/MC14560.pdf.
  //   Verified: PIN ASSIGNMENT diagram + partial truth table, page 2, read as
  //   rendered PDF page images (not a text summary, per issues.md C4).
  // The hand-entered stub pinout was wrong (A/B swapped on pins 1-2, wrong bit
  // indices, Cout/S1 transposed on pins 9 & 13 — the issues.md C2 class error).
  // Corrected against the datasheet PIN ASSIGNMENT:
  //   1=A2 2=B2 3=A3 4=B3 5=A4 6=B4 7=Cin 8=VSS
  //   9=Cout 10=S4 11=S3 12=S2 13=S1 14=B1 15=A1 16=VDD
  // The datasheet numbers digits A1..A4 (A1 = LSB); this entry uses the engine's
  // 0-based names A0..A3 with A0 = datasheet A1 = LSB (matches the ADDER_BCD_4BIT
  // primitive contract, same as the 74x583). Behaviour confirmed against the
  // datasheet truth table (e.g. 4+3=7, 7+4=11 -> BCD sum 1 with carry out 1).
  '74x4560': {
    name: '74x4560',
    simpleName: 'NBCD Adder',
    description: '4 bit BCD (natural binary coded decimal) adder (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://digsys.upc.edu/csd/chips/classic/MC14560.pdf',
    tags: ['adder', 'bcd', 'arithmetic'],
    guideOverview: 'The 74x4560 adds two BCD digits (0-9 each) plus a carry in and produces a 4 bit BCD sum and a carry out. BCD keeps each decimal digit in its own 4 bits, so a plain binary adder would give wrong answers once a digit passes 9; this chip applies the +6 correction automatically. Cascade it by feeding Cout into the Cin of the next stage for multi digit decimal addition. It is a CMOS 4000-series part (the Motorola MC14560B), so all inputs and outputs are active high and it runs from 3 to 18 V.',
    guidePinDescriptions: {
      'A0':  'BCD addend A, bit 0 (least significant).',
      'A1':  'BCD addend A, bit 1.',
      'A2':  'BCD addend A, bit 2.',
      'A3':  'BCD addend A, bit 3 (most significant).',
      'B0':  'BCD addend B, bit 0 (least significant).',
      'B1':  'BCD addend B, bit 1.',
      'B2':  'BCD addend B, bit 2.',
      'B3':  'BCD addend B, bit 3 (most significant).',
      'Cin': 'Carry input. Tie low for the least significant digit.',
      'S0':  'BCD sum, bit 0 (least significant).',
      'S1':  'BCD sum, bit 1.',
      'S2':  'BCD sum, bit 2.',
      'S3':  'BCD sum, bit 3 (most significant).',
      'Cout':'Carry output. Drive the next digit’s Cin to cascade.',
      'GND': 'Ground reference (pin 8).',
      'VCC': 'Positive supply (pin 16).',
    },
    guideSections: [
      {
        title: 'BCD Addition',
        paragraphs: [
          'Each input holds one decimal digit as 4 bits, so valid values are 0 through 9. The chip adds A, B and Cin. If the raw total is 9 or less it appears directly on the sum pins with Cout low. If the total exceeds 9 the chip adds 6 to bring the result back into the 0-9 range and sets Cout high, which represents the tens carry into the next digit.',
          'To add multi digit numbers, place one chip per digit and chain Cout to the next chip’s Cin. The least significant digit takes Cin low.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A1',   type: 'input'  },
      { pin:  2, name: 'B1',   type: 'input'  },
      { pin:  3, name: 'A2',   type: 'input'  },
      { pin:  4, name: 'B2',   type: 'input'  },
      { pin:  5, name: 'A3',   type: 'input'  },
      { pin:  6, name: 'B3',   type: 'input'  },
      { pin:  7, name: 'Cin',  type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'Cout', type: 'output' },
      { pin: 10, name: 'S3',   type: 'output' },
      { pin: 11, name: 'S2',   type: 'output' },
      { pin: 12, name: 'S1',   type: 'output' },
      { pin: 13, name: 'S0',   type: 'output' },
      { pin: 14, name: 'B0',   type: 'input'  },
      { pin: 15, name: 'A0',   type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'ADDER_BCD_4BIT',
        inputs:  ['A0','A1','A2','A3','B0','B1','B2','B3','Cin'],
        outputs: ['S0','S1','S2','S3','Cout'] },
    ],
  },

};