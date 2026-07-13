// chips142.js — Block 142: CMOS 4000 series (coverage expansion)
// Single-chip block (parallel-agent run) to avoid colliding with sibling
// chip blocks being authored concurrently in this same working directory.
// Chips: CD4097
//
// Pinout + behavior verified against the PRIMARY datasheet, read as rendered
// 400-dpi PDF page images (NOT a WebFetch text summary — see issues.md C4):
//   Source: Texas Instruments, "CD4067B, CD4097B CMOS Analog Multiplexers or
//     Demultiplexers", SCHS052D (Jun. 2003, rev. Aug. 2024).
//     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4067b.pdf.
//     Verified: control + supply pins from the "CD4097 Logic Diagram" (page 2)
//       — A=10, B=11, C=14, INHIBIT=13, VSS=12, VDD=24, COMMON X OUT/IN=1,
//       COMMON Y OUT/IN=17; the 16 channel pins from the same logic diagram's
//       "CHANNEL IN/OUT Y" / "CHANNEL IN/OUT X" header rows (cropped + zoomed):
//       X7..X0 = pins 2,3,4,5,6,7,8,9 and Y7..Y0 = pins 15,16,18,19,20,21,22,23;
//       function (channel = (C<<2)|(B<<1)|A; inh=1 -> all open) from Table 4-2
//       "CD4097 TRUTH TABLE" (page 4) listing 0X/0Y..7X/7Y vs A,B,C,inh.
//   NOTE: TI's Figure 4-1 terminal-assignment diagram on page 4 is the CD4067B
//     (16-channel) part ONLY; the CD4097B has no separate terminal-assignment
//     drawing in this datasheet, so its pin map was read off the CD4097 logic
//     diagram, not cloned from the CD4067 (issues.md C2/C6 lesson). The two
//     differ: CD4067 has a 4th address bit D on pin 13 with INHIBIT on 15,
//     whereas the CD4097 puts INHIBIT on 13 and has only A/B/C.
//   Like the CD4067B, the CD4097B references its signal path between VDD and
//   VSS — there is no separate VEE pin (unlike the 4051/4052/4053).
export const CHIPS_BLOCK_142 = {

  // ── CD4097: differential (dual) 8-channel analog mux/demux (24-pin) ──────
  'CD4097': {
    name: 'CD4097',
    simpleName: 'Differential 8-Channel Analog Mux/Demux',
    description: 'Differential (dual) 8-channel analog mux/demux, CMOS 4000 (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4097b.pdf',
    tags: ['cmos', '4000 series', 'analog switch', 'multiplexer', 'demultiplexer', 'mux', 'differential', '8 channel', 'dual', 'bidirectional'],
    guideOverview: 'The CD4097 is two 8-position analog switches in one package that always move together. A 3-bit binary address on A (LSB), B, and C (MSB) selects channel 0-7. The X common pin connects to the selected X channel and the Y common pin connects to the selected Y channel at the same instant: address 000 ties XZ to X0 and YZ to Y0, 001 ties them to X1/Y1, and so on through 111 for X7/Y7. Because each switch is a real bidirectional CMOS transmission gate, signals flow either way — drive a common and read the channel (demultiplexer) or drive a channel and read the common (multiplexer). The selected switches have a low ON resistance (125 ohm typical at VDD=15 V); all other channels are open. Pulling INHIBIT HIGH disconnects all sixteen channels at once. The "differential" name comes from this paired switching: it routes a two-wire signal (such as a sensor and its reference) as one unit. Like the 16-channel CD4067, the CD4097 has no separate VEE pin — the signal path is referenced between VDD and VSS.',
    guidePinDescriptions: {
      XZ: 'X-section common out/in (pin 1) — connects to the addressed X channel.',
      X0: 'X-channel 0 in/out (selected when CBA = 000).',
      X1: 'X-channel 1 in/out (selected when CBA = 001).',
      X2: 'X-channel 2 in/out (selected when CBA = 010).',
      X3: 'X-channel 3 in/out (selected when CBA = 011).',
      X4: 'X-channel 4 in/out (selected when CBA = 100).',
      X5: 'X-channel 5 in/out (selected when CBA = 101).',
      X6: 'X-channel 6 in/out (selected when CBA = 110).',
      X7: 'X-channel 7 in/out (selected when CBA = 111).',
      YZ: 'Y-section common out/in (pin 17) — connects to the addressed Y channel.',
      Y0: 'Y-channel 0 in/out (selected when CBA = 000).',
      Y1: 'Y-channel 1 in/out (selected when CBA = 001).',
      Y2: 'Y-channel 2 in/out (selected when CBA = 010).',
      Y3: 'Y-channel 3 in/out (selected when CBA = 011).',
      Y4: 'Y-channel 4 in/out (selected when CBA = 100).',
      Y5: 'Y-channel 5 in/out (selected when CBA = 101).',
      Y6: 'Y-channel 6 in/out (selected when CBA = 110).',
      Y7: 'Y-channel 7 in/out (selected when CBA = 111).',
      A: 'Channel-select bit A (LSB).',
      B: 'Channel-select bit B.',
      C: 'Channel-select bit C (MSB).',
      INH: 'Inhibit. HIGH opens all channels in both sections; LOW enables normal operation.',
      VSS: 'Ground / digital reference (0 V); also the lower reference of the analog signal path.',
      VDD: 'Positive supply. 3 V to 20 V.',
    },
    pinout: [
      { pin:  1, name: 'XZ',  type: 'bidir', description: 'X common out/in (couples to selected X channel)' },
      { pin:  2, name: 'X7',  type: 'bidir', description: 'X-channel 7 in/out' },
      { pin:  3, name: 'X6',  type: 'bidir', description: 'X-channel 6 in/out' },
      { pin:  4, name: 'X5',  type: 'bidir', description: 'X-channel 5 in/out' },
      { pin:  5, name: 'X4',  type: 'bidir', description: 'X-channel 4 in/out' },
      { pin:  6, name: 'X3',  type: 'bidir', description: 'X-channel 3 in/out' },
      { pin:  7, name: 'X2',  type: 'bidir', description: 'X-channel 2 in/out' },
      { pin:  8, name: 'X1',  type: 'bidir', description: 'X-channel 1 in/out' },
      { pin:  9, name: 'X0',  type: 'bidir', description: 'X-channel 0 in/out' },
      { pin: 10, name: 'A',   type: 'input', description: 'Channel-select bit A (LSB)' },
      { pin: 11, name: 'B',   type: 'input', description: 'Channel-select bit B' },
      { pin: 12, name: 'VSS', type: 'power', description: 'Ground / digital reference (0 V)' },
      { pin: 13, name: 'INH', type: 'input', description: 'Inhibit: HIGH disables all channels' },
      { pin: 14, name: 'C',   type: 'input', description: 'Channel-select bit C (MSB)' },
      { pin: 15, name: 'Y7',  type: 'bidir', description: 'Y-channel 7 in/out' },
      { pin: 16, name: 'Y6',  type: 'bidir', description: 'Y-channel 6 in/out' },
      { pin: 17, name: 'YZ',  type: 'bidir', description: 'Y common out/in (couples to selected Y channel)' },
      { pin: 18, name: 'Y5',  type: 'bidir', description: 'Y-channel 5 in/out' },
      { pin: 19, name: 'Y4',  type: 'bidir', description: 'Y-channel 4 in/out' },
      { pin: 20, name: 'Y3',  type: 'bidir', description: 'Y-channel 3 in/out' },
      { pin: 21, name: 'Y2',  type: 'bidir', description: 'Y-channel 2 in/out' },
      { pin: 22, name: 'Y1',  type: 'bidir', description: 'Y-channel 1 in/out' },
      { pin: 23, name: 'Y0',  type: 'bidir', description: 'Y-channel 0 in/out' },
      { pin: 24, name: 'VDD', type: 'power', description: 'Positive supply (3-20 V)' },
    ],
    gates: [
      // ANALOG_MUX_DUAL8: keys off pin NAMES XZ/X0..X7 and YZ/Y0..Y7; selects
      // channel n = (C<<2)|(B<<1)|A and couples XZ↔Xn and YZ↔Yn through
      // onResistance, or opens all when INH is HIGH. (issues.md C5 — name-keyed.)
      { type: 'ANALOG_MUX_DUAL8', inputs: ['A', 'B', 'C', 'INH'], outputs: [] },
    ],
    guideSections: [
      {
        title: 'Selecting a Channel Pair',
        paragraphs: [
          'Put a 3-bit address on A (LSB), B, and C (MSB). The chip connects the X common pin XZ to one X channel and, with the same code, the Y common pin YZ to the matching Y channel: CBA = 000 picks X0 and Y0, 001 picks X1 and Y1, … 111 picks X7 and Y7. Both connections are real bidirectional switches, so it does not matter which side you drive — the addressed channel and its common are simply tied together through the ON resistance (about 125 ohm).',
          'The two sections are independent switch banks that always share the same address. That is what "differential" means here: you route a two-wire signal — for example a sensor output and its own reference, or the two halves of a balanced line — as a single unit, keeping both wires in step. As a multiplexer, wire eight signal pairs to X0-X7/Y0-Y7 and read the chosen pair at XZ/YZ; as a demultiplexer, drive XZ/YZ and the pair appears on whichever channel you address.',
        ],
        list: [
          'Differential / two-wire 8-to-1 multiplexer.',
          'Demultiplexer: one pair fanned to eight channel pairs.',
          'Scanning front end for balanced sensors or a stereo signal pair.',
        ],
      },
      {
        title: 'Inhibit and Supplies',
        paragraphs: [
          'Hold INHIBIT LOW for normal operation. Pull it HIGH to open all sixteen switches at once — both commons then float, regardless of the address. This is handy for paralleling several CD4097s onto one bus pair: enable just one package at a time.',
          'The control inputs (A, B, C, INH) swing between VDD and VSS like ordinary logic. Note that, unlike the CD4051/4052/4053, the CD4097B does not bring out a separate VEE pin — the analog signal path is referenced between VDD and VSS.',
        ],
        note: '74Sim models each selected channel as a resistive coupling (ON resistance, default 125 ohm) between a common and its addressed channel, switching the X and Y sections together, and opens all channels when INHIBIT is HIGH — matching the real bidirectional transmission-gate behavior. Analog distortion, bandwidth and below-VSS swing are not modeled (see issues.md A6).',
      },
    ],
  },

};
