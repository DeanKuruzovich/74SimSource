// chips79.js — Block 79: CMOS 4000 series logic ICs (coverage expansion, Batch 11)
// Analog switches / muxes. Pinout verified by reading the TI CD4051B/CD4052B/
// CD4053B datasheet (SCHS047O) directly as PDF page images (Read with pages:),
// not via the WebFetch text summarizer which mangles these scans.
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 11) for the full roadmap.
// Chips: CD4053
export const CHIPS_BLOCK_79 = {

  // ── CD4053: Triple 2-channel analog multiplexer/demultiplexer (16-pin) ──────
  /* Primary source: Texas Instruments, "CD4051B, CD4052B, CD4053B CMOS Single
     8-Channel Analog Multiplexer/Demultiplexer With Logic-Level Conversion",
     SCHS047O. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4053b.pdf
     Pinout taken from Figure 4-3 (CD4053B), read directly as a rendered PDF page
     image. DIP map: 1=by 2=bx 3=cy 4=Zc(OUT/IN cx|cy) 5=cx 6=INH 7=VEE 8=VSS
     9=C 10=B 11=A 12=ax 13=ay 14=Za(OUT/IN ax|ay) 15=Zb(OUT/IN bx|by) 16=VDD.
     Each section is an SPDT switch: select=0 routes the common to the "x"
     channel, select=1 routes it to the "y" channel. The ANALOG_MUX_TRIPLE2
     primitive keys off pin NAMES (ZA/Y0A/Y1A, ZB/Y0B/Y1B, ZC/Y0C/Y1C, A/B/C,
     INH), with Y0=x channel (select 0) and Y1=y channel (select 1). */
  'CD4053': {
    name: 'CD4053',
    simpleName: 'Triple 2-Channel Analog Multiplexer/Demultiplexer',
    description: 'CMOS triple 2-channel (SPDT) analog multiplexer / demultiplexer (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4053b.pdf',
    tags: ['cmos', '4000', 'analog', 'mux', 'demux', 'triple', 'spdt', '2-channel', 'bidir', 'switch'],
    guideOverview: 'The CD4053 is a CMOS triple 2-channel (single-pole double-throw) analog multiplexer/demultiplexer. It contains three independent SPDT switch sections (A, B, C), each with its own select input and its own common node. For section A, select input A routes common Za to channel ax (A LOW) or ay (A HIGH); sections B and C work the same way off select inputs B and C. A single inhibit input opens all three sections at once. Because the switches are bidirectional bilateral pairs, each section works as a 2-to-1 multiplexer (two inputs → one common) or a 1-to-2 demultiplexer (one common → two outputs) for analog or digital signals between its supply rails. The separate VEE pin lets the analog signals swing below VSS on real hardware. Typical uses are 3-bit independent signal steering, swapping stereo channels, and selecting between two sensor or reference sources on three lines at once.',
    guidePinDescriptions: {
      'Y1B': 'Section B "y" channel (by, pin 1): connected to common Zb when select B is HIGH.',
      'Y0B': 'Section B "x" channel (bx, pin 2): connected to common Zb when select B is LOW.',
      'Y1C': 'Section C "y" channel (cy, pin 3): connected to common Zc when select C is HIGH.',
      'ZC':  'Section C common in/out node (OUT/IN cx or cy, pin 4).',
      'Y0C': 'Section C "x" channel (cx, pin 5): connected to common Zc when select C is LOW.',
      'INH': 'Inhibit: when HIGH, all channels of all three sections are disconnected.',
      'VEE': 'Negative analog supply (sets the lower analog signal rail).',
      'VSS': 'Ground / digital and analog 0 V reference.',
      'C':   'Select input for section C (LOW → cx, HIGH → cy).',
      'B':   'Select input for section B (LOW → bx, HIGH → by).',
      'A':   'Select input for section A (LOW → ax, HIGH → ay).',
      'Y0A': 'Section A "x" channel (ax, pin 12): connected to common Za when select A is LOW.',
      'Y1A': 'Section A "y" channel (ay, pin 13): connected to common Za when select A is HIGH.',
      'ZA':  'Section A common in/out node (OUT/IN ax or ay, pin 14).',
      'ZB':  'Section B common in/out node (OUT/IN bx or by, pin 15).',
      'VDD': 'Positive supply for the control logic.',
    },
    guideSections: [
      {
        title: 'Three Independent SPDT Switches',
        paragraphs: [
          'Unlike the 4051 (one 8-channel) and 4052 (dual 4-channel) muxes, the 4053 is three completely separate single-pole double-throw switches that happen to share a package, supplies, and one common inhibit line. Each section has its own select input: A controls section A, B controls section B, C controls section C. With select LOW the common node connects to that section\'s "x" channel; with select HIGH it connects to the "y" channel. The three sections never interact, so you can route three unrelated signals at the same time.',
        ],
      },
      {
        title: 'Inhibit and Analog Operation',
        paragraphs: [
          'Driving INH HIGH opens every channel in all three sections, isolating all three common nodes. Because the switches are bilateral, signal flow is symmetric: the same pin can be a source or a load, so each section serves equally as a multiplexer or a demultiplexer. The VEE pin allows analog signals to extend below VSS on real silicon.',
        ],
        note: '74Sim models each section as a passive resistive coupling: when INH is LOW, Za↔ax/ay (per select A), Zb↔bx/by (per select B), and Zc↔cx/cy (per select C) are each connected through the chip\'s on-resistance (~125 Ω); the unselected channel in each section is isolated. Analog voltages between the rails pass through. VEE-driven below-ground operation, on-resistance modulation, charge injection, distortion, and bandwidth are not modelled (see issues.md A6/D5).',
      },
    ],
    pinout: [
      { pin:  1, name: 'Y1B', type: 'bidir' }, // by
      { pin:  2, name: 'Y0B', type: 'bidir' }, // bx
      { pin:  3, name: 'Y1C', type: 'bidir' }, // cy
      { pin:  4, name: 'ZC',  type: 'bidir' }, // common C (OUT/IN cx or cy)
      { pin:  5, name: 'Y0C', type: 'bidir' }, // cx
      { pin:  6, name: 'INH', type: 'input' },
      { pin:  7, name: 'VEE', type: 'power' },
      { pin:  8, name: 'VSS', type: 'power' },
      { pin:  9, name: 'C',   type: 'input' },
      { pin: 10, name: 'B',   type: 'input' },
      { pin: 11, name: 'A',   type: 'input' },
      { pin: 12, name: 'Y0A', type: 'bidir' }, // ax
      { pin: 13, name: 'Y1A', type: 'bidir' }, // ay
      { pin: 14, name: 'ZA',  type: 'bidir' }, // common A (OUT/IN ax or ay)
      { pin: 15, name: 'ZB',  type: 'bidir' }, // common B (OUT/IN bx or by)
      { pin: 16, name: 'VDD', type: 'power' },
    ],
    gates: [
      { type: 'ANALOG_MUX_TRIPLE2', inputs: ['A','B','C','INH'], outputs: [] },
    ],
  },

};
