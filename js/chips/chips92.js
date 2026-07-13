// CMOS 4000-series coverage — Batch 4 (flip-flops / latches / registers).
// CD40174: hex D-type flip-flop with common clock and common asynchronous
// active-LOW clear. Shipped in its own standalone block (CHIPS_BLOCK_92) to
// avoid colliding with other agents adding chips in the same working tree.

export const CHIPS_BLOCK_92 = {
  // ── CD40174: Hex D flip-flop, common clock + common async clear ──────────
  /* Primary source: Texas Instruments / RCA, CD40174B datasheet (Terminal
     Assignment + Functional description), read directly from the PDF pages —
     not via a text summarizer (see issues.md C4). The CD40174B uses the
     standard 174 terminal map; verified against its own datasheet rather than
     cloned from the existing 74x174 entry (see issues.md C2 lesson). */
  'CD40174': {
    name: 'CD40174',
    simpleName: 'Hex D FF',
    description: 'Hex D flip-flop, common clock + clear (16-pin CMOS)',
    guideOverview: 'The CD40174B contains six positive-edge-triggered D flip-flops sharing one common clock and one common active-LOW asynchronous master reset (CLEAR). All six D inputs are captured simultaneously on every rising clock edge. No Q-bar outputs are provided. It is the CMOS 4000-series equivalent of the 74174 and behaves as a 6-bit synchronous parallel storage register.',
    guidePinDescriptions: {
      'CLR':  'Common asynchronous clear (master reset), active LOW. Holds all six Q outputs at 0 regardless of clock.',
      '1Q':   'Output of flip-flop 1.',
      '1D':   'Data input for flip-flop 1. Captured on the rising clock edge.',
      '2D':   'Data input for flip-flop 2.',
      '2Q':   'Output of flip-flop 2.',
      '3D':   'Data input for flip-flop 3.',
      '3Q':   'Output of flip-flop 3.',
      'VSS':  'Negative supply / ground (pin 8).',
      'CLK':  'Common clock input. All six flip-flops capture their D inputs on its rising edge.',
      '4Q':   'Output of flip-flop 4.',
      '4D':   'Data input for flip-flop 4.',
      '5D':   'Data input for flip-flop 5.',
      '5Q':   'Output of flip-flop 5.',
      '6D':   'Data input for flip-flop 6.',
      '6Q':   'Output of flip-flop 6.',
      'VDD':  'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Hex Synchronous Register',
        paragraphs: [
          'The CD40174B works as a 6-bit parallel storage register. All six D inputs are sampled at once on the rising edge of the common clock and held until the next edge.',
          'CLEAR (pin 1) is asynchronous and active LOW: pulling it LOW forces all six outputs to 0 immediately, independent of the clock. Tie it HIGH for normal operation.',
          'No Q-bar outputs are provided. For wider storage, cascade two CD40174B parts on a shared clock and clear. The companion CD40175B is the quad version that does bring out both Q and Q-bar.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40174b.pdf',
    tags: ['flip flop', 'd', 'hex', 'sequential', 'register', 'cmos', '4000'],
    pinout: [
      { pin: 1,  name: 'CLR', type: 'input' },
      { pin: 2,  name: '1Q',  type: 'output' },
      { pin: 3,  name: '1D',  type: 'input' },
      { pin: 4,  name: '2D',  type: 'input' },
      { pin: 5,  name: '2Q',  type: 'output' },
      { pin: 6,  name: '3D',  type: 'input' },
      { pin: 7,  name: '3Q',  type: 'output' },
      { pin: 8,  name: 'VSS', type: 'power' },
      { pin: 9,  name: 'CLK', type: 'input' },
      { pin: 10, name: '4Q',  type: 'output' },
      { pin: 11, name: '4D',  type: 'input' },
      { pin: 12, name: '5Q',  type: 'output' },
      { pin: 13, name: '5D',  type: 'input' },
      { pin: 14, name: '6D',  type: 'input' },
      { pin: 15, name: '6Q',  type: 'output' },
      { pin: 16, name: 'VDD', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_HEX',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', 'CLK', 'CLR'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q'],
      },
    ],
    sequential: true,
  },
};
