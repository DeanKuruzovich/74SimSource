// chips76.js — Block 76: CMOS 4000 series (coverage expansion, Batch 11)
// Single-chip block (parallel-agent run) to avoid colliding with sibling
// chip blocks being authored concurrently in this same working directory.
// Chips: CD4051
//
// Source: Texas Instruments, "CD4051B, CD4052B, CD4053B CMOS Single 8-Channel
//   Analog Multiplexer or Demultiplexer With Logic-Level Conversion", SCHS047O
//   (Aug. 1998, rev. May 2026). [Online]. Available:
//   https://www.ti.com/lit/ds/symlink/cd4051b.pdf. Verified: terminal
//   assignment (Table 4-1, p. 3), truth table (Table 7-1, p. 17), and
//   functional block diagram (Fig. 7-1, p. 15) — all read as rendered 300-dpi
//   PDF page images, NOT the WebFetch/text-layer summary (issues.md C4). ON
//   resistance 125 Ohm typ. (VDD=15 V) and the 3-20 V supply range from
//   Features / Sec. 7.3 Feature Description (pp. 1, 16). Every pin number and
//   behavioral claim below is traceable to these pages.
export const CHIPS_BLOCK_76 = {

  // ── CD4051: 8-channel analog multiplexer / demultiplexer (16-pin) ───────
  // Pinout (Table 4-1, p. 3), channel-select truth table (Table 7-1, p. 17),
  // and functional block diagram (Fig. 7-1, p. 15) verified against the TI
  // SCHS047O page images; see the block header above for the full reference.
  'CD4051': {
    name: 'CD4051',
    simpleName: '8-Channel Analog Mux/Demux',
    description: 'Single 8-channel analog mux/demux, CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4051b.pdf',
    tags: ['cmos', '4000 series', 'analog switch', 'multiplexer', 'demultiplexer', 'mux', '8 channel', 'bidirectional'],
    guideOverview: 'The CD4051 is a single-pole, 8-position analog switch. A 3-bit binary address on A (LSB), B, and C (MSB) connects the common pin Z to exactly one of the eight channels Y0-Y7; pulling INHIBIT HIGH opens all eight at once and Z floats. The switch is a real bidirectional CMOS transmission gate, so signals pass either way: use it as a multiplexer (pick 1 of 8 channels onto Z) or a demultiplexer (route Z out to 1 of 8 channels). It carries analog or digital signals, and the selected channel is a low-resistance connection (about 125 ohm at 15 V), not a buffered logic output. Two details set it apart from a logic mux: switching is break-before-make, so channels are never briefly joined during an address change, and a separate negative supply VEE lets the signal path swing below ground while the address pins stay at ordinary VDD/VSS logic levels — the "logic-level conversion" named in the datasheet title.',
    guidePinDescriptions: {
      Y0: 'Channel 0 in/out (selected when CBA = 000).',
      Y1: 'Channel 1 in/out (selected when CBA = 001).',
      Y2: 'Channel 2 in/out (selected when CBA = 010).',
      Y3: 'Channel 3 in/out (selected when CBA = 011).',
      Y4: 'Channel 4 in/out (selected when CBA = 100).',
      Y5: 'Channel 5 in/out (selected when CBA = 101).',
      Y6: 'Channel 6 in/out (selected when CBA = 110).',
      Y7: 'Channel 7 in/out (selected when CBA = 111).',
      Z: 'Common out/in — connected to the addressed channel.',
      A: 'Channel-select bit A (LSB).',
      B: 'Channel-select bit B.',
      C: 'Channel-select bit C (MSB).',
      INH: 'Inhibit. HIGH opens all channels (Z floats); LOW enables normal mux/demux operation.',
      VEE: 'Negative supply for the analog signal path. Tie to VSS for unipolar (0..VDD) signals, or below VSS to pass bipolar analog signals.',
      VSS: 'Ground / digital reference (0 V).',
      VDD: 'Positive supply. 3 V to 20 V.',
    },
    pinout: [
      { pin:  1, name: 'Y4',  type: 'bidir', description: 'Channel 4 in/out' },
      { pin:  2, name: 'Y6',  type: 'bidir', description: 'Channel 6 in/out' },
      { pin:  3, name: 'Z',   type: 'bidir', description: 'Common out/in (couples to selected channel)' },
      { pin:  4, name: 'Y7',  type: 'bidir', description: 'Channel 7 in/out' },
      { pin:  5, name: 'Y5',  type: 'bidir', description: 'Channel 5 in/out' },
      { pin:  6, name: 'INH', type: 'input', description: 'Inhibit: HIGH disables all channels' },
      { pin:  7, name: 'VEE', type: 'power', description: 'Negative analog supply (tie to VSS for unipolar)' },
      { pin:  8, name: 'VSS', type: 'power', description: 'Ground / digital reference (0 V)' },
      { pin:  9, name: 'C',   type: 'input', description: 'Channel-select bit C (MSB)' },
      { pin: 10, name: 'B',   type: 'input', description: 'Channel-select bit B' },
      { pin: 11, name: 'A',   type: 'input', description: 'Channel-select bit A (LSB)' },
      { pin: 12, name: 'Y3',  type: 'bidir', description: 'Channel 3 in/out' },
      { pin: 13, name: 'Y0',  type: 'bidir', description: 'Channel 0 in/out' },
      { pin: 14, name: 'Y1',  type: 'bidir', description: 'Channel 1 in/out' },
      { pin: 15, name: 'Y2',  type: 'bidir', description: 'Channel 2 in/out' },
      { pin: 16, name: 'VDD', type: 'power', description: 'Positive supply (3-20 V)' },
    ],
    gates: [
      { type: 'ANALOG_MUX_8',
        inputs: ['A', 'B', 'C', 'INH'] },
    ],
    guideSections: [
      {
        title: 'Selecting a Channel',
        paragraphs: [
          'Put a 3-bit address on A (LSB), B, and C (MSB) and read the three bits as a binary number: that value is the channel tied to the common pin Z. The connection is a plain bidirectional switch, so it does not matter which side you drive — the addressed channel and Z sit at the same voltage, joined through the ON resistance (about 125 ohm).',
          'As a multiplexer, wire eight signals to Y0-Y7, set the address, and read the chosen one at Z. As a demultiplexer, drive Z and the signal appears on whichever channel you address. Step the address 0 to 7 and it scans the channels in turn.',
        ],
        formulas: [
          'INH  C B A  →  ON channel',
          '0  0 0 0 → Y0   |   0  0 0 1 → Y1   |   0  0 1 0 → Y2   |   0  0 1 1 → Y3',
          '0  1 0 0 → Y4   |   0  1 0 1 → Y5   |   0  1 1 0 → Y6   |   0  1 1 1 → Y7',
          '1  X X X → none — all channels open, Z floats  (X is do-not-care)',
        ],
        list: [
          'Analog or digital multiplexer: pick 1 of 8 sources onto a shared line.',
          'Demultiplexer: route one signal out to 1 of 8 destinations.',
          'Sensor- or reference-scanning front end for a single ADC input.',
          'Software-controlled signal routing, with the address driven by a microcontroller.',
        ],
      },
      {
        title: 'Inhibit and Supplies',
        paragraphs: [
          'Hold INHIBIT LOW for normal operation. Pull it HIGH and all eight switches open at once — Z floats no matter what the address says. That lets you park several CD4051s on one shared line and enable just one package at a time.',
          'The control pins (A, B, C, INH) are ordinary logic, swinging between VDD and VSS. The signal path is separate: tie VEE below VSS and a channel can carry a signal that swings below ground, down to VEE, while the address still runs at plain logic levels. For simple 0-to-VDD signals, just tie VEE to VSS.',
        ],
        note: '74Sim models the ON path as a resistor (default 125 ohm) between Z and the addressed channel, and opens every channel when INHIBIT is HIGH — the real bidirectional transmission-gate behavior. It does not model VEE clamping or how ON resistance changes with signal voltage; those are simplified away.',
      },
      {
        title: 'Watch Out For',
        paragraphs: [
          'It is a switch, not a buffer. The signal is not regenerated — the ON resistance (about 125 ohm) sits in series with whatever load hangs on the line, forming a voltage divider. Into a low-impedance load the signal sags; for clean levels, follow Z with a high-impedance input or a buffer.',
          'Every signal must stay inside the supply rails, between VEE and VDD. A channel voltage outside that range turns on the chip internal protection diodes and can latch up or damage the part.',
          'Switching is break-before-make: during an address change the old channel opens before the new one closes, so two channels are never shorted together. The brief gap where nothing is connected is normal.',
          'Do not leave INHIBIT or the address pins floating. Like all CMOS inputs they must be driven HIGH or LOW; a floating pin can select a random channel or draw excess current.',
        ],
      },
    ],
  },

};
