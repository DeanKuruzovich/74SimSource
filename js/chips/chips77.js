// chips77.js — Block 77: CMOS 4000 series logic ICs (coverage expansion, Batch 11)
// Analog switches / muxes. Pinout verified by reading the TI CD4051B/CD4052B/
// CD4053B datasheet (SCHS047O) directly as PDF page images (Read with pages:),
// not via the WebFetch text summarizer which mangles these scans.
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 11) for the full roadmap.
// Chips: CD4052
export const CHIPS_BLOCK_77 = {

  // ── CD4052: Dual 4-channel analog multiplexer/demultiplexer (16-pin) ──────
  /* Primary source: Texas Instruments, "CD4051B, CD4052B, CD4053B CMOS Single
     8-Channel Analog Multiplexer/Demultiplexer With Logic-Level Conversion",
     SCHS047O. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4052b.pdf
     Pinout taken from Figure 4-2 (CD4052B); select code from Table 7-1. */
  'CD4052': {
    name: 'CD4052',
    simpleName: 'Dual 4-Channel Analog Multiplexer/Demultiplexer',
    description: 'CMOS dual 4-channel analog multiplexer / demultiplexer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4052b.pdf',
    tags: ['cmos', '4000', 'analog', 'mux', 'demux', 'dual', '4-channel', 'bidir'],
    guideOverview: 'The CD4052 is a CMOS dual 4-channel analog multiplexer/demultiplexer. It contains two independent 4-channel switch sections (X and Y) that share one 2-bit binary select code (A, B) and a common inhibit input. Setting A and B routes the X common node to one of X0–X3 and the Y common node to the matching Y0–Y3 at the same time. The paths are bidirectional bilateral switches, so the part works as a mux (many inputs → one common) or a demux (one common → many outputs) for analog or digital signals between its supply rails. The separate VEE pin lets the analog signals swing below VSS on real hardware. Typical uses are stereo/paired-channel audio routing, two related sensor channels, and 2-bit data-path steering.',
    guidePinDescriptions: {
      'Y0': 'Channel 0 of the Y multiplexer section.',
      'Y1': 'Channel 1 of the Y multiplexer section.',
      'Y2': 'Channel 2 of the Y multiplexer section.',
      'Y3': 'Channel 3 of the Y multiplexer section.',
      'YZ': 'Common in/out node for the Y section.',
      'X0': 'Channel 0 of the X multiplexer section.',
      'X1': 'Channel 1 of the X multiplexer section.',
      'X2': 'Channel 2 of the X multiplexer section.',
      'X3': 'Channel 3 of the X multiplexer section.',
      'XZ': 'Common in/out node for the X section.',
      'A': 'Least-significant select input (shared by both sections).',
      'B': 'Most-significant select input (shared by both sections).',
      'INH': 'Inhibit: when HIGH, all channels of both sections are disconnected.',
      'VEE': 'Negative analog supply (sets the lower analog signal rail).',
      'VSS': 'Ground / digital and analog 0 V reference.',
      'VDD': 'Positive supply for the control logic.',
    },
    guideSections: [
      {
        title: 'Two Sections, One Address',
        paragraphs: [
          'Both the X and Y sections decode the same A/B select inputs, so they always switch corresponding channels together. With select code n = (B<<1)|A, the X common node XZ connects to Xn and the Y common node YZ connects to Yn simultaneously. This is convenient when two related signals must be routed in parallel — for example the left and right channels of a stereo pair.',
        ],
      },
      {
        title: 'Inhibit and Analog Operation',
        paragraphs: [
          'Driving INH HIGH opens every channel in both sections, isolating the common nodes. Because the switches are bilateral, signal flow is symmetric: the same pin can be a source or a load, so the chip serves equally as a multiplexer or a demultiplexer. The VEE pin allows analog signals to extend below VSS on real silicon.',
        ],
        note: '74Sim models both sections as passive resistive couplings: when INH is LOW, XZ↔X(n) and YZ↔Y(n) for n = (B,A) are each connected through the chip\'s on-resistance (~125 Ω); all other channels are isolated. Analog voltages between the rails pass through. VEE-driven below-ground operation, on-resistance modulation, charge injection, distortion, and bandwidth are not modelled (see issues.md A6).',
      },
    ],
    pinout: [
      { pin:  1, name: 'Y0',  type: 'bidir' },
      { pin:  2, name: 'Y2',  type: 'bidir' },
      { pin:  3, name: 'YZ',  type: 'bidir' },
      { pin:  4, name: 'Y3',  type: 'bidir' },
      { pin:  5, name: 'Y1',  type: 'bidir' },
      { pin:  6, name: 'INH', type: 'input' },
      { pin:  7, name: 'VEE', type: 'power' },
      { pin:  8, name: 'VSS', type: 'power' },
      { pin:  9, name: 'B',   type: 'input' },
      { pin: 10, name: 'A',   type: 'input' },
      { pin: 11, name: 'X1',  type: 'bidir' },
      { pin: 12, name: 'X3',  type: 'bidir' },
      { pin: 13, name: 'XZ',  type: 'bidir' },
      { pin: 14, name: 'X2',  type: 'bidir' },
      { pin: 15, name: 'X0',  type: 'bidir' },
      { pin: 16, name: 'VDD', type: 'power' },
    ],
    gates: [
      { type: 'ANALOG_MUX_DUAL4', inputs: ['A','B','INH'], outputs: [] },
    ],
  },

};
