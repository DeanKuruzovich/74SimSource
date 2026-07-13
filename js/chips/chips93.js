// CMOS 4000-series coverage — Batch 4 (flip-flops / latches / registers).
// CD40175: quad D-type flip-flop with common clock and common asynchronous
// active-LOW clear, bringing out both Q and Q-bar. Shipped in its own
// standalone block (CHIPS_BLOCK_93) to avoid colliding with other agents
// adding chips in the same working tree.

export const CHIPS_BLOCK_93 = {
  // ── CD40175: Quad D flip-flop, common clock + common async clear ─────────
  /* Primary source: Texas Instruments / RCA, CD40175B datasheet (SCHS049C —
     "CMOS Quad 'D'-Type Flip-Flop"), Function Diagram + Terminal Assignment,
     read directly from the rendered PDF pages — not via a text summarizer
     (see issues.md C4). The datasheet states the part is "Functionally
     equivalent to TTL 74175"; the terminal map was nonetheless verified
     against the CD40175B's own datasheet rather than cloned from the existing
     74x175 entry (see issues.md C2 lesson). It does coincide with the 74175
     pin map: CLEAR=1, Q1=2, Q1n=3, D1=4, D2=5, Q2n=6, Q2=7, VSS=8, CLOCK=9,
     Q3=10, Q3n=11, D3=12, D4=13, Q4n=14, Q4=15, VDD=16. Reuses the existing
     D_FF_QUAD engine primitive (shared with the 74x175). */
  'CD40175': {
    name: 'CD40175',
    simpleName: 'Quad D FF',
    description: 'Quad D flip-flop, common clock + clear, Q & Q-bar (16-pin CMOS)',
    guideOverview: 'The CD40175B contains four positive-edge-triggered D flip-flops sharing one common clock and one common active-LOW asynchronous master reset (CLEAR). All four D inputs are captured simultaneously on every rising clock edge, and each flip-flop brings out both its true output Q and its complementary output Q-bar. It is the CMOS 4000-series equivalent of the 74175 and behaves as a 4-bit synchronous parallel storage register. The companion CD40174B is the hex version (six flip-flops, true outputs only).',
    guidePinDescriptions: {
      'CLR':  'Common asynchronous clear (master reset), active LOW. Holds all four Q outputs at 0 (and all Q-bar outputs at 1) regardless of clock. Tie HIGH for normal operation.',
      '1Q':   'True output of flip-flop 1.',
      '1Qn':  'Complementary (inverted) output of flip-flop 1.',
      '1D':   'Data input for flip-flop 1. Captured on the rising clock edge.',
      '2D':   'Data input for flip-flop 2. Captured on the rising clock edge.',
      '2Qn':  'Complementary (inverted) output of flip-flop 2.',
      '2Q':   'True output of flip-flop 2.',
      'VSS':  'Negative supply / ground (pin 8).',
      'CLK':  'Common clock input. All four flip-flops capture their D inputs on its rising edge.',
      '3Q':   'True output of flip-flop 3.',
      '3Qn':  'Complementary (inverted) output of flip-flop 3.',
      '3D':   'Data input for flip-flop 3. Captured on the rising clock edge.',
      '4D':   'Data input for flip-flop 4. Captured on the rising clock edge.',
      '4Qn':  'Complementary (inverted) output of flip-flop 4.',
      '4Q':   'True output of flip-flop 4.',
      'VDD':  'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Quad Synchronous Register (with complementary outputs)',
        paragraphs: [
          'The CD40175B works as a 4-bit parallel storage register. All four D inputs are sampled at once on the rising edge of the common clock and held until the next edge.',
          'Each section presents both the stored bit Q and its complement Q-bar, so you get both polarities without adding inverters.',
          'CLEAR (pin 1) is asynchronous and active LOW: pulling it LOW forces all four Q outputs to 0 and all Q-bar outputs to 1 immediately, independent of the clock. Tie it HIGH for normal operation.',
        ],
        note: 'This is a storage element, not a transparent latch: changing a D input between clock edges does not change the outputs.',
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40175b.pdf',
    tags: ['flip flop', 'd', 'quad', 'sequential', 'register', 'cmos', '4000'],
    pinout: [
      { pin: 1,  name: 'CLR', type: 'input' },
      { pin: 2,  name: '1Q',  type: 'output' },
      { pin: 3,  name: '1Qn', type: 'output' },
      { pin: 4,  name: '1D',  type: 'input' },
      { pin: 5,  name: '2D',  type: 'input' },
      { pin: 6,  name: '2Qn', type: 'output' },
      { pin: 7,  name: '2Q',  type: 'output' },
      { pin: 8,  name: 'VSS', type: 'power' },
      { pin: 9,  name: 'CLK', type: 'input' },
      { pin: 10, name: '3Q',  type: 'output' },
      { pin: 11, name: '3Qn', type: 'output' },
      { pin: 12, name: '3D',  type: 'input' },
      { pin: 13, name: '4D',  type: 'input' },
      { pin: 14, name: '4Qn', type: 'output' },
      { pin: 15, name: '4Q',  type: 'output' },
      { pin: 16, name: 'VDD', type: 'power' },
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
};
