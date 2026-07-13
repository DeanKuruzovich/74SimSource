// Chip definitions block 60
// Chips: 74x4724, 74x4799, 74x4851, 74x4852, 74x5074, 74x5245,
//        74x5300, 74x5302, 74x5555, 74x5620, 74x6000, 74x6001,
//        74x6010, 74x6011, 74x6300, 74x6310

export const CHIPS_BLOCK_60 = {

  // ── 74x4724: 8 bit addressable latch (16-pin) ─────────────────────────
  /* Primary source: Texas Instruments, 74x4724 datasheet. [Online]. Available: https://www.ti.com/lit/gpn/sn74hc259
     https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // SN74x4724 functionally equivalent to 74x259
  '74x4724': {
    name: '74x4724',
    simpleName: '8 bit Addr Latch',
    description: '8 bit addressable latch (CMOS equivalent of 74x259) (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/gpn/sn74hc259',
    tags: ['latch', 'addressable', '8 bit', 'sequential', 'CMOS'],
    guideOverview: 'The 74x4724 is an 8 bit addressable latch, functionally similar to the well known 74x259. Instead of loading a whole byte at once, it uses a 3 bit address to select exactly one latch bit, then stores the input value into that addressed output. This is useful when software or simple logic needs to set or clear individual control lines without affecting the other stored bits.',
    guidePinDescriptions: {
      'A0': 'Least significant address input bit.',
      'A1': 'Address input bit 1.',
      'A2': 'Most significant address input bit.',
      'Q0': 'Stored output bit 0.',
      'Q1': 'Stored output bit 1.',
      'Q2': 'Stored output bit 2.',
      'Q3': 'Stored output bit 3.',
      'GND': 'Ground reference for the device.',
      'Q4': 'Stored output bit 4.',
      'Q5': 'Stored output bit 5.',
      'Q6': 'Stored output bit 6.',
      'Q7': 'Stored output bit 7.',
      'D': 'Data input. Its value is written into the addressed latch position when enabled.',
      'G': 'Gate or write enable control for the addressable latch operation.',
      'CLR': 'Clear input that resets the stored outputs.',
      'VCC': 'Positive supply for the latch.',
    },
    guideSections: [
      {
        title: 'How An Addressable Latch Works',
        paragraphs: [
          'Three address inputs choose which one of the eight stored bits is targeted. The D input then sets or clears only that selected bit, leaving the other outputs unchanged.',
        ],
      },
      {
        title: 'Why It Is Useful',
        list: [
          'Creating software controlled output bits from a small address/data interface.',
          'Setting or clearing individual control lines without rewriting a whole register.',
          'Holding one hot or sparse control states in simple systems.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'Q0',  type: 'output' },
      { pin:  5, name: 'Q1',  type: 'output' },
      { pin:  6, name: 'Q2',  type: 'output' },
      { pin:  7, name: 'Q3',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Q4',  type: 'output' },
      { pin: 10, name: 'Q5',  type: 'output' },
      { pin: 11, name: 'Q6',  type: 'output' },
      { pin: 12, name: 'Q7',  type: 'output' },
      { pin: 13, name: 'D',   type: 'input'  },
      { pin: 14, name: 'G',   type: 'input'  },
      { pin: 15, name: 'CLR', type: 'input'  },
      { pin: 16, name: 'VCC', type: 'power'  },
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

  // ── 74x4799: Timer for NiCd and NiMH chargers (16-pin) ────────────────
  /* Primary source: 74x4799 datasheet   URL not yet verified. */
  // 74LV4799 complex analog/timer chip GENERIC_STUB
  '74x4799': {
    name: '74x4799',
    simpleName: 'NiCd/NiMH Charge Timer',
    description: 'Timer for NiCd and NiMH battery chargers (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['timer', 'charger', 'analog', 'stub'],
    pinout: [
      { pin:  1, name: 'CT1',   type: 'input'  },
      { pin:  2, name: 'CT2',   type: 'input'  },
      { pin:  3, name: 'RES',   type: 'input'  },
      { pin:  4, name: 'BATIN', type: 'input'  },
      { pin:  5, name: 'VIN',   type: 'input'  },
      { pin:  6, name: 'OUTOC', type: 'output' },
      { pin:  7, name: 'OUTTS', type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'S1',    type: 'input'  },
      { pin: 10, name: 'S2',    type: 'input'  },
      { pin: 11, name: 'S3',    type: 'input'  },
      { pin: 12, name: 'S4',    type: 'input'  },
      { pin: 13, name: 'OSC1',  type: 'input'  },
      { pin: 14, name: 'OSC2',  type: 'input'  },
      { pin: 15, name: 'NC',    type: 'nc'     },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CT1','CT2','RES','BATIN','VIN','S1','S2','S3','S4','OSC1','OSC2'], outputs: [] },
    ],
  },

  // ── 74x4851: 8-channel analog mux/demux (16-pin) ──────────────────────
  // Source: Texas Instruments, "SN74HC4851 8-Channel Analog Multiplexer/
  //   Demultiplexer With Injection-Current Effect Control", SCLS542C
  //   (Sep. 2003, rev. Jun. 2024). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74hc4851.pdf. Verified: pin
  //   configuration (Figure 4-1, 16-pin TSSOP top view) + Table 4-1 Function
  //   Table, page 2, read as rendered PDF page images.
  //   Pin map (verified, NOT cloned from the 74x4051 sibling — issues.md C2):
  //     1=Y4 2=Y6 3=COM 4=Y7 5=Y5 6=INH 7=NC 8=GND 9=C 10=B 11=A 12=Y3
  //     13=Y0 14=Y1 15=Y2 16=VCC. A=LSB, C=MSB; INH high opens all channels.
  //   Differs from the CD4051 family in two ways the datasheet confirms:
  //     pin 7 is NC, not VEE (single-supply HC part), and the common node is
  //     labelled COM, not Z. Engine: ANALOG_MUX_8 with gate.common:'COM'.
  '74x4851': {
    name: '74x4851',
    simpleName: '8-Ch Analog Mux',
    description: '8-channel analog multiplexer/demultiplexer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    onResistance: 100,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc4851.pdf',
    tags: ['mux', 'analog', 'demux', 'multiplexer', '8-channel', 'bidir'],
    guideOverview: 'The 74x4851 is an 8-channel analog multiplexer/demultiplexer. A 3 bit select code (A, B, C) connects one of eight channel pins to the common COM node, and because the switch path is bilateral it can route signals in either direction: one source to eight destinations, or eight sources to one. It is pin-for-pin a 4051 with one difference. The 4051 has a VEE pin for handling signals below ground; the 4851 runs from a single supply and instead adds injection-current control, which keeps a disabled channel that swings outside the supply rails from disturbing the channel that is switched on.',
    guidePinDescriptions: {
      'Y0': 'Channel 0 analog I/O node.',
      'Y1': 'Channel 1 analog I/O node.',
      'Y2': 'Channel 2 analog I/O node.',
      'Y3': 'Channel 3 analog I/O node.',
      'Y4': 'Channel 4 analog I/O node.',
      'Y5': 'Channel 5 analog I/O node.',
      'Y6': 'Channel 6 analog I/O node.',
      'Y7': 'Channel 7 analog I/O node.',
      'COM': 'Common analog node. It connects to the one selected Y channel when INH is LOW.',
      'A': 'Least significant select input bit.',
      'B': 'Middle select input bit.',
      'C': 'Most significant select input bit.',
      'INH': 'Inhibit control. Drive it HIGH to disconnect all eight channels from COM.',
      'NC': 'No internal connection. Leave unconnected.',
      'GND': 'Ground reference for the logic and the switches.',
      'VCC': 'Positive supply for the switch control circuitry.',
    },
    guideSections: [
      {
        title: 'Select Logic',
        paragraphs: [
          'The A, B, and C inputs form a 3 bit address that chooses which one of the eight channels connects to COM, with A as the least significant bit. Only one channel is connected at a time. Driving INH HIGH disconnects all of them, so COM floats.',
        ],
      },
      {
        title: 'Analog Routing',
        paragraphs: [
          'Unlike an ordinary digital multiplexer, the 4851 passes analog voltages as well as logic levels, and the connection works in both directions. The injection-current control lets a disabled channel sit at a voltage past the supply rails without corrupting the active channel, which is why this part shows up in automotive and metering circuits.',
        ],
        note: '74Sim models the channel as a passive resistive coupling: when INH is LOW, the channel selected by (C,B,A) is connected to COM through the chip\'s on-resistance (~100 Ω); all other channels are isolated. Analog voltages between the rails pass through realistically (with a small divider drop set by the on-resistance and the surrounding load). Injection-current behaviour, distortion, and bandwidth are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Y4',  type: 'bidir' },
      { pin:  2, name: 'Y6',  type: 'bidir' },
      { pin:  3, name: 'COM', type: 'bidir' },
      { pin:  4, name: 'Y7',  type: 'bidir' },
      { pin:  5, name: 'Y5',  type: 'bidir' },
      { pin:  6, name: 'INH', type: 'input' },
      { pin:  7, name: 'NC',  type: 'nc'    },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'C',   type: 'input' },
      { pin: 10, name: 'B',   type: 'input' },
      { pin: 11, name: 'A',   type: 'input' },
      { pin: 12, name: 'Y3',  type: 'bidir' },
      { pin: 13, name: 'Y0',  type: 'bidir' },
      { pin: 14, name: 'Y1',  type: 'bidir' },
      { pin: 15, name: 'Y2',  type: 'bidir' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'ANALOG_MUX_8', inputs: ['A','B','C','INH'], common: 'COM', outputs: [] },
    ],
  },

  // ── 74x4852: Dual 4-channel analog mux/demux (16-pin) ─────────────────
  // Source: Texas Instruments, "SN74HC4852 Dual 4-to-1 Channel Analog
  //   Multiplexer/Demultiplexer With Injection-Current Effect Control",
  //   SCLS573A (Mar 2004, rev. Jun 2024). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74hc4852.pdf. Verified: terminal
  //   assignment (Figure 4-1, 16-pin TSSOP top view) and function table
  //   (Table 4-1), page 2, read as PDF page images (per issues.md C4 — do not
  //   trust a text summary of TI PDFs).
  // Pinout corrected here from the prior hand-entered stub, which had the wrong
  // pin map (it placed 1Z/1Y0.. on pins 1-5 and S0/S1/En as the select pins).
  // The real part is pin-compatible with the 4052: A=10, B=9, INH=6, NC=7,
  // GND=8, VCC=16; section-2 channels/common on pins 1-5; section-1 on 11-15.
  // Function (Table 4-1): select n = (B<<1)|A connects 1Yn↔1-COM and 2Yn↔2-COM
  // together; INH HIGH opens all channels. A=LSB, B=MSB.
  '74x4852': {
    name: '74x4852',
    simpleName: 'Dual 4-Ch Analog Mux',
    description: 'Dual 4-channel analog multiplexer/demultiplexer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc4852.pdf',
    tags: ['mux', 'analog', 'multiplexer', 'dual', '4-channel'],
    guideOverview: 'The 74x4852 is a dual 4-channel analog multiplexer/demultiplexer. It holds two independent 4-channel switch sections that share one 2-bit select code (A, B) and a common inhibit (INH). The select code chooses the same channel number in both sections at once: section 1 connects its common 1-COM to one of 1Y0–1Y3, and section 2 connects 2-COM to the matching 2Y0–2Y3. The switches are bidirectional, so each section works as a multiplexer (many channels into one common) or a demultiplexer (one common out to many channels). Setting INH HIGH opens every channel. It is the same function as the 4052, useful for routing two related analog signals such as a stereo pair or two matched sensor lines.',
    guidePinDescriptions: {
      '2Y0': 'Section 2 analog channel 0.',
      '2Y2': 'Section 2 analog channel 2.',
      '2Z': 'Section 2 common. Connects to the selected 2Yn channel.',
      '2Y3': 'Section 2 analog channel 3.',
      '2Y1': 'Section 2 analog channel 1.',
      'INH': 'Inhibit. LOW enables switching; HIGH opens every channel in both sections.',
      'NC': 'No internal connection. Leave unconnected.',
      'GND': 'Ground / 0 V reference.',
      'B': 'Select address bit B (most significant).',
      'A': 'Select address bit A (least significant).',
      '1Y3': 'Section 1 analog channel 3.',
      '1Y0': 'Section 1 analog channel 0.',
      '1Z': 'Section 1 common. Connects to the selected 1Yn channel.',
      '1Y1': 'Section 1 analog channel 1.',
      '1Y2': 'Section 1 analog channel 2.',
      'VCC': 'Positive supply for the switch control logic.',
    },
    guideSections: [
      {
        title: 'Two Sections, One Address',
        paragraphs: [
          'Both sections decode the same A/B code, so they always switch the same channel number together. With n = (B<<1)|A, the section 1 common 1-COM connects to 1Yn and the section 2 common 2-COM connects to 2Yn at the same time. That is what makes it handy for routing two related signals in parallel — for example the left and right channels of a stereo pair.',
        ],
      },
      {
        title: 'Inhibit and Analog Operation',
        paragraphs: [
          'Driving INH HIGH opens every channel in both sections, isolating the commons. Because the switches are bidirectional, signal flow is symmetric: the same pin can be a source or a load, so each section serves equally as a multiplexer or a demultiplexer.',
        ],
        note: '74Sim models each section as a passive resistive coupling: when INH is LOW, 1Z↔1Y(n) and 2Z↔2Y(n) for n = (B,A) are each connected through the chip\'s on-resistance (~125 Ω); all other channels are isolated. Analog voltages between the rails pass through. The injection-current effect control that lets disabled channels exceed VCC on real silicon, plus on-resistance modulation, charge injection, distortion, and bandwidth, are not modelled (see issues.md A6).',
      },
    ],
    pinout: [
      { pin:  1, name: '2Y0', type: 'bidir' },
      { pin:  2, name: '2Y2', type: 'bidir' },
      { pin:  3, name: '2Z',  type: 'bidir' },
      { pin:  4, name: '2Y3', type: 'bidir' },
      { pin:  5, name: '2Y1', type: 'bidir' },
      { pin:  6, name: 'INH', type: 'input' },
      { pin:  7, name: 'NC',  type: 'nc'    },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'B',   type: 'input' },
      { pin: 10, name: 'A',   type: 'input' },
      { pin: 11, name: '1Y3', type: 'bidir' },
      { pin: 12, name: '1Y0', type: 'bidir' },
      { pin: 13, name: '1Z',  type: 'bidir' },
      { pin: 14, name: '1Y1', type: 'bidir' },
      { pin: 15, name: '1Y2', type: 'bidir' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'ANALOG_MUX_DUAL4_4852', inputs: ['A','B','INH'], outputs: [] },
    ],
  },

  // ── 74x5074: Dual D flip flop, metastable immune (14-pin) ─────────────
  /* Primary source: Texas Instruments, 74x5074 datasheet. [Online]. Available: https://www.ti.com/lit/gpn/sn74ls74a
     https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // 74ABT5074 same pinout as 74x74, metastable hardened
  '74x5074': {
    name: '74x5074',
    simpleName: 'Dual D FF (MS Immune)',
    description: 'Dual positive edge triggered D type flip flop (metastable immune) (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/gpn/sn74ls74a',
    tags: ['flip flop', 'D', 'dual', 'metastable', 'sequential'],
    guideOverview: 'The 74x5074 is a dual edge triggered D flip flop in the familiar 74x74 pinout family. The historical 5074 variants were designed for improved metastability performance, but at the logic function level they behave like ordinary dual D flip flops with preset and clear. On a breadboard, you would reach for this type of part to synchronize signals, divide clocks, or store one bit of state per section.',
    guidePinDescriptions: {
      '1CLR': 'Asynchronous clear for flip flop 1. In the standard 74x74 family this forces reset independently of the clock.',
      '1D': 'Data input for flip flop 1.',
      '1CLK': 'Clock input for flip flop 1. The D input is captured on the active clock edge.',
      '1PRE': 'Asynchronous preset for flip flop 1. In the standard 74x74 family it forces the set state independently of the clock.',
      '1Q': 'Main output of flip flop 1.',
      '1Qn': 'Inverted output of flip flop 1.',
      'GND': 'Ground reference for the package.',
      '2Qn': 'Inverted output of flip flop 2.',
      '2Q': 'Main output of flip flop 2.',
      '2PRE': 'Asynchronous preset for flip flop 2.',
      '2CLK': 'Clock input for flip flop 2.',
      '2D': 'Data input for flip flop 2.',
      '2CLR': 'Asynchronous clear for flip flop 2.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Edge Triggered Storage',
        paragraphs: [
          'A D flip flop samples its D input on the active clock edge and holds that state until the next clock edge. This makes it the standard building block for synchronous state machines and data synchronization.',
        ],
      },
      {
        title: 'Metastability Note',
        paragraphs: [
          'The special value of a 5074-family part is in its timing and synchronization characteristics, not in a different logic truth table. For simulator purposes, ordinary 74x74 functional behavior is the correct logical model.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1CLR', type: 'input'  },
      { pin:  2, name: '1D',   type: 'input'  },
      { pin:  3, name: '1CLK', type: 'input'  },
      { pin:  4, name: '1PRE', type: 'input'  },
      { pin:  5, name: '1Q',   type: 'output' },
      { pin:  6, name: '1Qn',  type: 'output' },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: '2Qn',  type: 'output' },
      { pin:  9, name: '2Q',   type: 'output' },
      { pin: 10, name: '2PRE', type: 'input'  },
      { pin: 11, name: '2CLK', type: 'input'  },
      { pin: 12, name: '2D',   type: 'input'  },
      { pin: 13, name: '2CLR', type: 'input'  },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'D_FF', inputs: ['1D', '1CLK', '1PRE', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'D_FF', inputs: ['2D', '2CLK', '2PRE', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74x5245: Octal bidirectional transceiver (20-pin) ──────────────────
  /* Primary source: Texas Instruments, 74x5245 datasheet. [Online]. Available: https://www.ti.com/lit/gpn/sn74hc245
     https://en.wikipedia.org/wiki/Bus_transceiver */
  // DM74ALS5245 same as 74x245, Schmitt trigger inputs
  '74x5245': {
    name: '74x5245',
    simpleName: 'Octal Transceiver (ST)',
    description: 'Octal bidirectional transceiver with Schmitt trigger inputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/gpn/sn74hc245',
    tags: ['transceiver', 'bus', 'octal', 'tri state', 'bidirectional', 'schmitt'],
    guideOverview: 'The 74x5245 is an octal bidirectional bus transceiver in the 245 family. It can move eight bits in either direction between two buses, with a direction pin selecting the data flow and an enable pin disconnecting the device when needed. The Schmitt trigger detail is an input-conditioning improvement, but the logic role is still that of a standard 8 bit transceiver.',
    guidePinDescriptions: {
      'DIR': 'Direction control. It selects whether data flows from the A bus to the B bus or the reverse.',
      'A1': 'Bit 1 on the A-side bus.',
      'A2': 'Bit 2 on the A-side bus.',
      'A3': 'Bit 3 on the A-side bus.',
      'A4': 'Bit 4 on the A-side bus.',
      'A5': 'Bit 5 on the A-side bus.',
      'A6': 'Bit 6 on the A-side bus.',
      'A7': 'Bit 7 on the A-side bus.',
      'A8': 'Bit 8 on the A-side bus.',
      'GND': 'Ground reference for the package.',
      'B8': 'Bit 8 on the B-side bus.',
      'B7': 'Bit 7 on the B-side bus.',
      'B6': 'Bit 6 on the B-side bus.',
      'B5': 'Bit 5 on the B-side bus.',
      'B4': 'Bit 4 on the B-side bus.',
      'B3': 'Bit 3 on the B-side bus.',
      'B2': 'Bit 2 on the B-side bus.',
      'B1': 'Bit 1 on the B-side bus.',
      'OE': 'Output enable for the transceiver. Disable it when the buses should be disconnected.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Bus Transceiver Basics',
        paragraphs: [
          'A bus transceiver is a reversible buffer for a multi bit data path. One side can drive the other, and the direction pin decides which bus is currently the source.',
        ],
      },
      {
        title: 'Schmitt Trigger Detail',
        paragraphs: [
          'Schmitt trigger inputs help reject slow or noisy signal transitions, but they do not change the logical function of the part. That is why a standard 245-style model is a good simulator representation here.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'DIR', type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'A4',  type: 'input' },
      { pin:  6, name: 'A5',  type: 'input' },
      { pin:  7, name: 'A6',  type: 'input' },
      { pin:  8, name: 'A7',  type: 'input' },
      { pin:  9, name: 'A8',  type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'B8',  type: 'input' },
      { pin: 12, name: 'B7',  type: 'input' },
      { pin: 13, name: 'B6',  type: 'input' },
      { pin: 14, name: 'B5',  type: 'input' },
      { pin: 15, name: 'B4',  type: 'input' },
      { pin: 16, name: 'B3',  type: 'input' },
      { pin: 17, name: 'B2',  type: 'input' },
      { pin: 18, name: 'B1',  type: 'input' },
      { pin: 19, name: 'OE',  type: 'input' },
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



  // ── 74x5555: Programmable delay timer with oscillator (16-pin) ─────────
  /* Primary source: 74x5555 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Electronic_oscillator */
  // 74x5555 analog/timer GENERIC_STUB
  '74x5555': {
    name: '74x5555',
    simpleName: 'Prog Delay Timer',
    description: 'Programmable delay timer with oscillator (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['timer', 'oscillator', 'programmable', 'stub'],
    pinout: [
      { pin:  1, name: 'D0',    type: 'input'  },
      { pin:  2, name: 'D1',    type: 'input'  },
      { pin:  3, name: 'D2',    type: 'input'  },
      { pin:  4, name: 'D3',    type: 'input'  },
      { pin:  5, name: 'D4',    type: 'input'  },
      { pin:  6, name: 'D5',    type: 'input'  },
      { pin:  7, name: 'D6',    type: 'input'  },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'D7',    type: 'input'  },
      { pin: 10, name: 'TRIGn', type: 'input'  },
      { pin: 11, name: 'CLKIN', type: 'input'  },
      { pin: 12, name: 'RESn',  type: 'input'  },
      { pin: 13, name: 'MODE',  type: 'input'  },
      { pin: 14, name: 'OUT',   type: 'output' },
      { pin: 15, name: 'NC',    type: 'nc'     },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','TRIGn','CLKIN','RESn','MODE'], outputs: [] },
    ],
  },

  // ── 74x5620: Octal bidirectional transceiver (20-pin) ──────────────────
  /* Primary source: 74x5620 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Bus_transceiver */
  // DM74ALS5620 same as 74x245, Schmitt trigger inputs
  '74x5620': {
    name: '74x5620',
    simpleName: 'Octal Transceiver (ST)',
    description: 'Octal bidirectional transceiver with Schmitt trigger inputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['transceiver', 'bus', 'octal', 'tri state', 'bidirectional', 'schmitt'],
    pinout: [
      { pin:  1, name: 'DIR', type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'A4',  type: 'input' },
      { pin:  6, name: 'A5',  type: 'input' },
      { pin:  7, name: 'A6',  type: 'input' },
      { pin:  8, name: 'A7',  type: 'input' },
      { pin:  9, name: 'A8',  type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'B8',  type: 'input' },
      { pin: 12, name: 'B7',  type: 'input' },
      { pin: 13, name: 'B6',  type: 'input' },
      { pin: 14, name: 'B5',  type: 'input' },
      { pin: 15, name: 'B4',  type: 'input' },
      { pin: 16, name: 'B3',  type: 'input' },
      { pin: 17, name: 'B2',  type: 'input' },
      { pin: 18, name: 'B1',  type: 'input' },
      { pin: 19, name: 'OE',  type: 'input' },
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

  // ── 74x6000: Logic to logic optocoupler, non inverting (6-pin) ─────────
  /* Primary source: 74x6000 datasheet   URL not yet verified. */
  // 74OL6000 models as BUFFER (input→output through optical isolation)
  '74x6000': {
    name: '74x6000',
    simpleName: 'Optocoupler (Non Inv)',
    description: 'Logic to logic optocoupler, non inverting (6-pin)',
    pins: 6, vcc: 6, gnd: 4,
    datasheet: '',
    tags: ['optocoupler', 'isolation', 'non inverting', 'buffer'],
    pinout: [
      { pin: 1, name: 'A',    type: 'input'  },
      { pin: 2, name: 'K',    type: 'input'  },
      { pin: 3, name: 'NC',   type: 'nc'     },
      { pin: 4, name: 'GND',  type: 'power'  },
      { pin: 5, name: 'Y',    type: 'output' },
      { pin: 6, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'BUFFER', inputs: ['A'], output: 'Y' },
    ],
  },

  // ── 74x6001: Logic to logic optocoupler, inverting (6-pin) ─────────────
  /* Primary source: 74x6001 datasheet   URL not yet verified. */
  // 74OL6001 models as NOT (input→inverted output through optical isolation)
  '74x6001': {
    name: '74x6001',
    simpleName: 'Optocoupler (Inv)',
    description: 'Logic to logic optocoupler, inverting (6-pin)',
    pins: 6, vcc: 6, gnd: 4,
    datasheet: '',
    tags: ['optocoupler', 'isolation', 'inverting'],
    pinout: [
      { pin: 1, name: 'A',    type: 'input'  },
      { pin: 2, name: 'K',    type: 'input'  },
      { pin: 3, name: 'NC',   type: 'nc'     },
      { pin: 4, name: 'GND',  type: 'power'  },
      { pin: 5, name: 'Y',    type: 'output' },
      { pin: 6, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'NOT', inputs: ['A'], output: 'Y' },
    ],
  },

  // ── 74x6010: Logic to logic optocoupler, non inverting, OC (6-pin) ─────
  /* Primary source: 74x6010 datasheet   URL not yet verified. */
  // 74OL6010 open collector 15V output, models as BUFFER
  '74x6010': {
    name: '74x6010',
    simpleName: 'Optocoupler (Non Inv OC)',
    description: 'Logic to logic optocoupler, non inverting, open collector 15V (6-pin)',
    pins: 6, vcc: 6, gnd: 4,
    datasheet: '',
    tags: ['optocoupler', 'isolation', 'non inverting', 'open collector'],
    pinout: [
      { pin: 1, name: 'A',    type: 'input'  },
      { pin: 2, name: 'K',    type: 'input'  },
      { pin: 3, name: 'NC',   type: 'nc'     },
      { pin: 4, name: 'GND',  type: 'power'  },
      { pin: 5, name: 'Y',    type: 'output' },
      { pin: 6, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'BUFFER', inputs: ['A'], output: 'Y' },
    ],
  },

  // ── 74x6011: Logic to logic optocoupler, inverting, OC (6-pin) ─────────
  /* Primary source: 74x6011 datasheet   URL not yet verified. */
  // 74OL6011 open collector 15V output, models as NOT
  '74x6011': {
    name: '74x6011',
    simpleName: 'Optocoupler (Inv OC)',
    description: 'Logic to logic optocoupler, inverting, open collector 15V (6-pin)',
    pins: 6, vcc: 6, gnd: 4,
    datasheet: '',
    tags: ['optocoupler', 'isolation', 'inverting', 'open collector'],
    pinout: [
      { pin: 1, name: 'A',    type: 'input'  },
      { pin: 2, name: 'K',    type: 'input'  },
      { pin: 3, name: 'NC',   type: 'nc'     },
      { pin: 4, name: 'GND',  type: 'power'  },
      { pin: 5, name: 'Y',    type: 'output' },
      { pin: 6, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'NOT', inputs: ['A'], output: 'Y' },
    ],
  },

  // ── 74x6300: Programmable dRAM refresh timer (16-pin) ──────────────────
  /* Primary source: 74x6300 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Random-access_memory */
  // SN74ALS6300 DRAM controller GENERIC_STUB
  '74x6300': {
    name: '74x6300',
    simpleName: 'DRAM Refresh Timer',
    description: 'Programmable dynamic memory refresh timer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['DRAM', 'refresh', 'timer', 'memory', 'stub'],
    pinout: [
      { pin:  1, name: 'S0',    type: 'input'  },
      { pin:  2, name: 'S1',    type: 'input'  },
      { pin:  3, name: 'S2',    type: 'input'  },
      { pin:  4, name: 'RREQ',  type: 'output' },
      { pin:  5, name: 'RACK',  type: 'input'  },
      { pin:  6, name: 'RFRn',  type: 'output' },
      { pin:  7, name: 'RASn',  type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'CASn',  type: 'output' },
      { pin: 10, name: 'WEn',   type: 'output' },
      { pin: 11, name: 'OSC1',  type: 'input'  },
      { pin: 12, name: 'OSC2',  type: 'input'  },
      { pin: 13, name: 'RH',    type: 'input'  },
      { pin: 14, name: 'CK',    type: 'input'  },
      { pin: 15, name: 'SYNCn', type: 'input'  },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['S0','S1','S2','RACK','OSC1','OSC2','RH','CK','SYNCn'], outputs: [] },
    ],
  },

  // ── 74x6310: Static column/page mode access detector for dRAM (20-pin) ─
  /* Primary source: 74x6310 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Random-access_memory */
  // SN74ALS6310A DRAM controller GENERIC_STUB
  '74x6310': {
    name: '74x6310',
    simpleName: 'DRAM Access Detector',
    description: 'Static column and page mode access detector for dRAM (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['DRAM', 'access', 'detector', 'memory', 'stub'],
    pinout: [
      { pin:  1, name: 'MA0',  type: 'input'  },
      { pin:  2, name: 'MA1',  type: 'input'  },
      { pin:  3, name: 'MA2',  type: 'input'  },
      { pin:  4, name: 'MA3',  type: 'input'  },
      { pin:  5, name: 'MA4',  type: 'input'  },
      { pin:  6, name: 'MA5',  type: 'input'  },
      { pin:  7, name: 'MA6',  type: 'input'  },
      { pin:  8, name: 'MA7',  type: 'input'  },
      { pin:  9, name: 'MA8',  type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'MA9',  type: 'input'  },
      { pin: 12, name: 'RASn', type: 'input'  },
      { pin: 13, name: 'CASn', type: 'input'  },
      { pin: 14, name: 'MODE', type: 'input'  },
      { pin: 15, name: 'PGn',  type: 'output' },
      { pin: 16, name: 'SCn',  type: 'output' },
      { pin: 17, name: 'HIT',  type: 'output' },
      { pin: 18, name: 'MXA',  type: 'output' },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['MA0','MA1','MA2','MA3','MA4','MA5','MA6','MA7','MA8','MA9','RASn','CASn','MODE'], outputs: [] },
    ],
  },

};