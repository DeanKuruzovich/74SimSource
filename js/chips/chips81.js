// chips81.js — Block 81: CMOS 4000 series (coverage expansion, Batch 11)
// Single-chip block (parallel-agent run) to avoid colliding with sibling
// chip blocks being authored concurrently in this same working directory.
// Pinout verified against the primary TI datasheet (CD4067B/CD4097B,
// SCHS052D, Figure 4-1 "CD4067B 24 Pins (Top View)" + Table 4-1 truth
// table — read directly from the rendered PDF page image, NOT a WebFetch
// summary). See CMOS-4000-Coverage-Plan.md, Batch 11.
// Chips: CD4067
export const CHIPS_BLOCK_81 = {

  // ── CD4067: 16-channel analog multiplexer / demultiplexer (24-pin) ──────
  /* Primary source: Texas Instruments, CD4067B/CD4097B datasheet, SCHS052D.
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4067b.pdf
     (Figure 4-1 terminal assignment + Table 4-1 CD4067 truth table).
     NOTE: the verified CD4067B has NO VEE pin — only VSS (12) and VDD (24);
     COMMON OUT/IN is pin 1. The pre-existing '74x4067' stub entry in
     chips58.js has a different (incorrect) pin map and is NOT the source. */
  'CD4067': {
    name: 'CD4067',
    simpleName: '16-Channel Analog Mux/Demux',
    description: 'Single 16-channel analog mux/demux, CMOS 4000 series (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4067b.pdf',
    tags: ['cmos', '4000 series', 'analog switch', 'multiplexer', 'demultiplexer', 'mux', '16 channel', 'bidirectional'],
    guideOverview: 'The CD4067 is a single-pole, 16-position analog switch. A 4-bit binary address on pins A (LSB), B, C, and D (MSB) selects which of the sixteen channels Y0-Y15 is connected to the common pin Z. Because the switch is a real bidirectional CMOS transmission gate, signals flow either way: drive Z and read the selected channel (demultiplexer), or drive a channel and read Z (multiplexer). The selected switch has a low ON resistance (125 ohm typical at VDD=15 V); every other channel is open. Pulling INHIBIT HIGH disconnects all sixteen channels at once. Unlike the 8-channel CD4051, the CD4067 has no separate VEE pin — the signal path is referenced between VDD and VSS.',
    guidePinDescriptions: {
      Z: 'Common out/in — connected to the addressed channel (pin 1, labeled COMMON OUT/IN).',
      Y0: 'Channel 0 in/out (selected when DCBA = 0000).',
      Y1: 'Channel 1 in/out (selected when DCBA = 0001).',
      Y2: 'Channel 2 in/out (selected when DCBA = 0010).',
      Y3: 'Channel 3 in/out (selected when DCBA = 0011).',
      Y4: 'Channel 4 in/out (selected when DCBA = 0100).',
      Y5: 'Channel 5 in/out (selected when DCBA = 0101).',
      Y6: 'Channel 6 in/out (selected when DCBA = 0110).',
      Y7: 'Channel 7 in/out (selected when DCBA = 0111).',
      Y8: 'Channel 8 in/out (selected when DCBA = 1000).',
      Y9: 'Channel 9 in/out (selected when DCBA = 1001).',
      Y10: 'Channel 10 in/out (selected when DCBA = 1010).',
      Y11: 'Channel 11 in/out (selected when DCBA = 1011).',
      Y12: 'Channel 12 in/out (selected when DCBA = 1100).',
      Y13: 'Channel 13 in/out (selected when DCBA = 1101).',
      Y14: 'Channel 14 in/out (selected when DCBA = 1110).',
      Y15: 'Channel 15 in/out (selected when DCBA = 1111).',
      A: 'Channel-select bit A (LSB).',
      B: 'Channel-select bit B.',
      C: 'Channel-select bit C.',
      D: 'Channel-select bit D (MSB).',
      INH: 'Inhibit. HIGH opens all channels (Z floats); LOW enables normal mux/demux operation.',
      VSS: 'Ground / digital reference (0 V); also the lower reference of the analog signal path.',
      VDD: 'Positive supply. 3 V to 20 V.',
    },
    pinout: [
      { pin:  1, name: 'Z',   type: 'bidir', description: 'Common out/in (couples to selected channel)' },
      { pin:  2, name: 'Y7',  type: 'bidir', description: 'Channel 7 in/out' },
      { pin:  3, name: 'Y6',  type: 'bidir', description: 'Channel 6 in/out' },
      { pin:  4, name: 'Y5',  type: 'bidir', description: 'Channel 5 in/out' },
      { pin:  5, name: 'Y4',  type: 'bidir', description: 'Channel 4 in/out' },
      { pin:  6, name: 'Y3',  type: 'bidir', description: 'Channel 3 in/out' },
      { pin:  7, name: 'Y2',  type: 'bidir', description: 'Channel 2 in/out' },
      { pin:  8, name: 'Y1',  type: 'bidir', description: 'Channel 1 in/out' },
      { pin:  9, name: 'Y0',  type: 'bidir', description: 'Channel 0 in/out' },
      { pin: 10, name: 'A',   type: 'input', description: 'Channel-select bit A (LSB)' },
      { pin: 11, name: 'B',   type: 'input', description: 'Channel-select bit B' },
      { pin: 12, name: 'VSS', type: 'power', description: 'Ground / digital reference (0 V)' },
      { pin: 13, name: 'D',   type: 'input', description: 'Channel-select bit D (MSB)' },
      { pin: 14, name: 'C',   type: 'input', description: 'Channel-select bit C' },
      { pin: 15, name: 'INH', type: 'input', description: 'Inhibit: HIGH disables all channels' },
      { pin: 16, name: 'Y15', type: 'bidir', description: 'Channel 15 in/out' },
      { pin: 17, name: 'Y14', type: 'bidir', description: 'Channel 14 in/out' },
      { pin: 18, name: 'Y13', type: 'bidir', description: 'Channel 13 in/out' },
      { pin: 19, name: 'Y12', type: 'bidir', description: 'Channel 12 in/out' },
      { pin: 20, name: 'Y11', type: 'bidir', description: 'Channel 11 in/out' },
      { pin: 21, name: 'Y10', type: 'bidir', description: 'Channel 10 in/out' },
      { pin: 22, name: 'Y9',  type: 'bidir', description: 'Channel 9 in/out' },
      { pin: 23, name: 'Y8',  type: 'bidir', description: 'Channel 8 in/out' },
      { pin: 24, name: 'VDD', type: 'power', description: 'Positive supply (3-20 V)' },
    ],
    gates: [
      { type: 'ANALOG_MUX_16',
        inputs: ['A', 'B', 'C', 'D', 'INH'] },
    ],
    guideSections: [
      {
        title: 'Selecting a Channel',
        paragraphs: [
          'Put a 4-bit address on A (LSB), B, C, and D (MSB). The chip connects the common pin Z to exactly one channel: DCBA = 0000 picks Y0, 0001 picks Y1, … 1111 picks Y15. The connection is a real bidirectional switch, so it does not matter which side you drive — the addressed channel and Z are simply tied together through the ON resistance (about 125 ohm).',
          'As a multiplexer, wire sixteen signals to Y0-Y15, drive the address, and read the chosen one at Z. As a demultiplexer, drive Z and the signal appears on whichever channel you address. Sweeping the address scans all sixteen channels in turn — useful for expanding the number of inputs a microcontroller can read through a single ADC pin.',
        ],
        list: [
          'Analog/digital multiplexer: 16 inputs to 1 common output.',
          'Demultiplexer: 1 common input fanned to 16 outputs.',
          'Large sensor-array / keypad scanning front end.',
        ],
      },
      {
        title: 'Inhibit and Supplies',
        paragraphs: [
          'Hold INHIBIT LOW for normal operation. Pull it HIGH to open all sixteen switches at once — Z then floats, regardless of the address. This is handy for paralleling several CD4067s onto one bus: enable just one package at a time.',
          'The control inputs (A, B, C, D, INH) swing between VDD and VSS like ordinary logic. Note that, unlike the CD4051/4052/4053, the CD4067B does not bring out a separate VEE pin — the analog signal path is referenced between VDD and VSS.',
        ],
        note: '74Sim models the selected channel as a resistive coupling (ON resistance, default 125 ohm) between Z and the addressed channel, and opens all channels when INHIBIT is HIGH — matching the real bidirectional transmission-gate behavior. Analog distortion, bandwidth and below-VSS swing are not modeled (see issues.md A6).',
      },
    ],
  },

};
