// Chip definitions block 50
// Chips: 74x1808, 74x1811, 74x1821, 74x1823, 74x1832, 74x1841, 74x1843,
//        74x2003, 74x2010, 74x2014, 74x2125, 74x2150,
//        74x2151, 74x2153, 74x2157, 74x2161

export const CHIPS_BLOCK_50 = {

  // 74x1808: Hex 2 input AND driver (20-pin)
  '74x1808': {
    name: '74x1808',
    simpleName: 'Hex 2 Input AND Driver',
    description: 'Hex 2 input AND gate with high drive outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['and', 'hex', 'driver', 'stub'],
    pinout: [
      { pin:  1, name: '1A',   type: 'input'  },
      { pin:  2, name: '1B',   type: 'input'  },
      { pin:  3, name: '1Y',   type: 'output' },
      { pin:  4, name: '2A',   type: 'input'  },
      { pin:  5, name: '2B',   type: 'input'  },
      { pin:  6, name: '2Y',   type: 'output' },
      { pin:  7, name: '3A',   type: 'input'  },
      { pin:  8, name: '3B',   type: 'input'  },
      { pin:  9, name: '3Y',   type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '4Y',   type: 'output' },
      { pin: 12, name: '4A',   type: 'input'  },
      { pin: 13, name: '4B',   type: 'input'  },
      { pin: 14, name: '5Y',   type: 'output' },
      { pin: 15, name: '5A',   type: 'input'  },
      { pin: 16, name: '5B',   type: 'input'  },
      { pin: 17, name: '6Y',   type: 'output' },
      { pin: 18, name: '6A',   type: 'input'  },
      { pin: 19, name: '6B',   type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'], outputs: [] },
    ],
  },

  // 74x1811: FM/MFM/DM encoder/decoder, data rates up to 20 MHz (24-pin)
  '74x1811': {
    name: '74x1811',
    simpleName: 'FM/MFM/DM Encoder/Decoder (20 MHz)',
    description: 'FM, MFM, and DM encoder / decoder, data rates up to 20 MHz (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['encoder', 'decoder', 'FM', 'MFM', 'data', 'stub'],
    pinout: [
      { pin:  1, name: 'RD',   type: 'input'  },
      { pin:  2, name: 'CD',   type: 'input'  },
      { pin:  3, name: 'LD',   type: 'input'  },
      { pin:  4, name: 'WD',   type: 'input'  },
      { pin:  5, name: 'RC',   type: 'input'  },
      { pin:  6, name: 'WC',   type: 'input'  },
      { pin:  7, name: 'S0',   type: 'input'  },
      { pin:  8, name: 'S1',   type: 'input'  },
      { pin:  9, name: 'RST',  type: 'input'  },
      { pin: 10, name: 'NC',   type: 'nc'     },
      { pin: 11, name: 'NC2',  type: 'nc'     },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'NC3',  type: 'nc'     },
      { pin: 14, name: 'NC4',  type: 'nc'     },
      { pin: 15, name: 'DD',   type: 'output' },
      { pin: 16, name: 'SC',   type: 'output' },
      { pin: 17, name: 'WG',   type: 'output' },
      { pin: 18, name: 'LBn',  type: 'output' },
      { pin: 19, name: 'NC5',  type: 'nc'     },
      { pin: 20, name: 'NC6',  type: 'nc'     },
      { pin: 21, name: 'NC7',  type: 'nc'     },
      { pin: 22, name: 'NC8',  type: 'nc'     },
      { pin: 23, name: 'NC9',  type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['RD','CD','LD','WD','RC','WC','S0','S1','RST'], outputs: [] },
    ],
  },

  // 74x1821: 10 bit bus interface flip flops, TRI STATE (24-pin)
  // Source: Fairchild Semiconductor, "74F821 10-Bit D-Type Flip-Flop", DS009595
  //   (Apr. 1988, rev. Oct. 2000). [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74F821.pdf.
  //   Verified: connection diagram (24-lead PDIP, top view) + function table +
  //   functional description, pages 1-2, read as rendered ~300-dpi PDF page images
  //   (issues.md C4 — not via the text summarizer).
  //   The 74F1821 is the National/Fairchild F-series bus-interface designation for
  //   this same 10-bit D flip-flop; no standalone '1821 datasheet is archived online
  //   (searched Fairchild/National/onsemi/bitsavers, June 2026), so the pin-for-pin
  //   functional equivalent 74F821 is the authoritative source. Both share the
  //   "broadside" flow-through pinout (D inputs down one side, Q outputs the other).
  //   Behavior: ten D flip-flops on a common buffered clock (CP); data captured on
  //   the CP LOW-to-HIGH edge; OEn HIGH floats the true 3-state outputs (Hi-Z)
  //   without disturbing stored data; no clear, no clock enable.
  //   Simulated by the BUS_FF_10BIT_TRI engine primitive (non-inverting; the family's
  //   inverting sibling would use gate.invert:true).
  //   Pinout CORRECTED from the hand-entered stub (issues.md C2 — the CD4082 lesson):
  //   the stub placed CLK on pin 2 and shifted D0-D9 to pins 3-11/13, putting a data
  //   bit (D9) on pin 13. The real map has D0 on pin 2, D0-D9 on pins 2-11, and the
  //   CLOCK (CP) on pin 13. Verified map: OEn=1, D0-D9=2-11, GND=12, CP(CLK)=13,
  //   Q9-Q0=14-23, VCC=24.
  '74x1821': {
    name: '74x1821',
    simpleName: '10 bit Bus Interface Flip Flops',
    description: '10 bit bus interface flip flops, TRI STATE (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74F821.pdf',
    tags: ['flip flop', 'D type', '10 bit', 'bus', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x1821 is a 10 bit register: ten D flip-flops sharing one clock and one output enable. On each rising clock edge all ten outputs load whatever is on the D inputs at that moment; between edges they hold. The outputs are three state, so pulling OEn HIGH releases them to high impedance and lets other devices drive the same bus without changing the stored bits. Inputs run down one side of the package and outputs down the other (a "broadside" pinout) to make bus wiring straightforward.',
    guidePinDescriptions: {
      'OEn': 'Output enable, active LOW. LOW drives the stored bits onto Q0-Q9; HIGH puts all ten outputs in the high impedance state without changing what is stored.',
      'D0':  'Data input bit 0. Captured on the rising clock edge.',
      'D1':  'Data input bit 1. Captured on the rising clock edge.',
      'D2':  'Data input bit 2. Captured on the rising clock edge.',
      'D3':  'Data input bit 3. Captured on the rising clock edge.',
      'D4':  'Data input bit 4. Captured on the rising clock edge.',
      'D5':  'Data input bit 5. Captured on the rising clock edge.',
      'D6':  'Data input bit 6. Captured on the rising clock edge.',
      'D7':  'Data input bit 7. Captured on the rising clock edge.',
      'D8':  'Data input bit 8. Captured on the rising clock edge.',
      'D9':  'Data input bit 9. Captured on the rising clock edge.',
      'GND': 'Ground reference (pin 12).',
      'CLK': 'Clock input. All ten flip-flops load their D inputs on the LOW to HIGH edge.',
      'Q9':  'Registered output bit 9.',
      'Q8':  'Registered output bit 8.',
      'Q7':  'Registered output bit 7.',
      'Q6':  'Registered output bit 6.',
      'Q5':  'Registered output bit 5.',
      'Q4':  'Registered output bit 4.',
      'Q3':  'Registered output bit 3.',
      'Q2':  'Registered output bit 2.',
      'Q1':  'Registered output bit 1.',
      'Q0':  'Registered output bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Clock and output enable are independent',
        paragraphs: [
          'The clock and the output enable do different jobs. The clock decides when the register captures new data: nothing changes inside the chip until a rising edge, and at that edge all ten bits update together. OEn only decides whether the stored bits reach the pins. Setting OEn HIGH disconnects the outputs (high impedance) but leaves the stored value untouched, so when OEn goes LOW again the same bits reappear. That split is what makes the part useful on a shared bus: several registers can hold their own data and take turns driving the wires.',
        ],
      },
      {
        title: 'No clear, no clock enable',
        paragraphs: [
          'Unlike the 74x1823 (which adds an asynchronous clear) or the parts with a clock-enable pin, the 1821 is the plain version: the only way to change the stored bits is a clock edge, and every edge loads new data. If you need to hold across a clock edge, gate the clock externally or use a part that has a clock-enable input.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D0',   type: 'input'  },
      { pin:  3, name: 'D1',   type: 'input'  },
      { pin:  4, name: 'D2',   type: 'input'  },
      { pin:  5, name: 'D3',   type: 'input'  },
      { pin:  6, name: 'D4',   type: 'input'  },
      { pin:  7, name: 'D5',   type: 'input'  },
      { pin:  8, name: 'D6',   type: 'input'  },
      { pin:  9, name: 'D7',   type: 'input'  },
      { pin: 10, name: 'D8',   type: 'input'  },
      { pin: 11, name: 'D9',   type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'CLK',  type: 'input'  },
      { pin: 14, name: 'Q9',   type: 'output' },
      { pin: 15, name: 'Q8',   type: 'output' },
      { pin: 16, name: 'Q7',   type: 'output' },
      { pin: 17, name: 'Q6',   type: 'output' },
      { pin: 18, name: 'Q5',   type: 'output' },
      { pin: 19, name: 'Q4',   type: 'output' },
      { pin: 20, name: 'Q3',   type: 'output' },
      { pin: 21, name: 'Q2',   type: 'output' },
      { pin: 22, name: 'Q1',   type: 'output' },
      { pin: 23, name: 'Q0',   type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'BUS_FF_10BIT_TRI',
        inputs: ['OEn','CLK','D0','D1','D2','D3','D4','D5','D6','D7','D8','D9'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
    ],
  },

  // ── 74x1823: 9 bit bus-interface D flip-flops, async clear + clock enable, 3-state (24-pin) ──
  // Source: Texas Instruments, "SN54ABTH16823, SN74ABTH16823 18-Bit Bus-Interface
  //   Flip-Flops With 3-State Outputs", SCBS664B (April 1996, revised May 1997).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74abth16823.pdf.
  //   Verified: the per-9-bit-flip-flop FUNCTION TABLE, the device description, and
  //   the ANSI/IEEE logic symbol, pages 1-3, read as rendered ~300-dpi PDF page
  //   images (issues.md C4 — not via the text summarizer).
  //   The '1823 is the '16823 Widebus family: 18 bits = "two 9-bit flip-flops or one
  //   18-bit flip-flop". Each 9-bit bank has exactly the controls modeled here, and
  //   the function table (each 9-bit flip-flop) is: OEn LOW + CLRn LOW -> Q=L (async
  //   clear, dominates); OEn LOW + CLRn HIGH + CLKENn LOW + CLK rising -> Q=D (load);
  //   CLKENn HIGH or CLK low -> Q holds; OEn HIGH -> outputs Hi-Z (stored data kept).
  //   This is byte-for-byte the '823 function (already modeled by D_FF_9BIT_CLR_CE_TRI),
  //   so that primitive is reused: inputs [OEn, CLRn, CLKENn, CLK, D0..D8], out [Q0..Q8].
  //   No standalone single-width 24-pin '1823 datasheet exists (the family part is the
  //   56-pin 18-bit '16823); the single-width 24-pin map here is the canonical member
  //   of this exact function — identical to the datasheet-verified 74x823 pinout in
  //   chips40.js. Pinout CORRECTED from the hand-entered stub (issues.md C2, the CD4082
  //   lesson): the stub omitted the CLKENn pin entirely, put CLK on 2 / CLRn on 3, laid
  //   D0..D8 and Q8..Q0 in the wrong slots, and invented an NC on 23. Real map below.
  '74x1823': {
    name: '74x1823',
    simpleName: '9 bit Bus Interface Flip Flops w/ CLRn + CLKENn (TRI)',
    description: '9-bit bus interface D flip-flops, async clear+clk en, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74abth16823.pdf',
    tags: ['flip flop', 'D type', '9 bit', 'bus', 'tri state', 'clear'],
    sequential: true,
    guideOverview: 'The 74x1823 stores 9 bits on the rising clock edge and drives them onto a bus through three state outputs. It carries the controls of the 823 family: an asynchronous clear that forces all outputs LOW without waiting for the clock, a clock enable that lets the register hold its value while the system clock keeps running, and an output enable that releases the pins to high impedance without disturbing the stored bits. The extra ninth bit rides a parity or control flag alongside an 8 bit data field.',
    guidePinDescriptions: {
      'OEn':    'Output enable, active LOW. HIGH puts all nine outputs in high impedance; the stored bits are untouched and reappear when OEn goes LOW.',
      'CLRn':   'Asynchronous clear, active LOW. Forces all nine outputs LOW immediately, regardless of the clock. Dominates the clock enable.',
      'CLKENn': 'Clock enable, active LOW. LOW arms the register so the next rising clock edge loads new data; HIGH freezes the outputs while the clock keeps running.',
      'CLK':    'Clock input. Data is captured on the LOW to HIGH edge.',
      'D0':     'Data input bit 0.',
      'D1':     'Data input bit 1.',
      'D2':     'Data input bit 2.',
      'D3':     'Data input bit 3.',
      'D4':     'Data input bit 4.',
      'D5':     'Data input bit 5.',
      'D6':     'Data input bit 6.',
      'D7':     'Data input bit 7.',
      'D8':     'Data input bit 8.',
      'Q0':     'Registered output bit 0.',
      'Q1':     'Registered output bit 1.',
      'Q2':     'Registered output bit 2.',
      'Q3':     'Registered output bit 3.',
      'Q4':     'Registered output bit 4.',
      'Q5':     'Registered output bit 5.',
      'Q6':     'Registered output bit 6.',
      'Q7':     'Registered output bit 7.',
      'Q8':     'Registered output bit 8.',
      'GND':    'Ground reference (pin 12).',
      'VCC':    'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Clear, clock enable, and hold',
        paragraphs: [
          'The three controls stack in a fixed order. CLRn LOW wins over everything: it clears all nine outputs the moment it goes low, without a clock edge. If CLRn is HIGH, the register looks at CLKENn: LOW means the next rising clock edge loads the D inputs, HIGH means the edge is ignored and the outputs hold. OEn sits outside all of that. It only gates the pins, so raising it hides the outputs in high impedance while the flip-flops keep clocking and holding data behind them.',
        ],
      },
      {
        title: 'Where the ninth bit goes',
        paragraphs: [
          'Buses are often a byte wide plus a parity bit. A 9 bit register lets one chip latch the whole word, data plus flag, on a single clock. This part is the single width member of the 823 family; the wider 16823 is two of these banks in one package for a 16 or 18 bit bus.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',    type: 'input'  },
      { pin:  2, name: 'D0',     type: 'input'  },
      { pin:  3, name: 'D1',     type: 'input'  },
      { pin:  4, name: 'D2',     type: 'input'  },
      { pin:  5, name: 'D3',     type: 'input'  },
      { pin:  6, name: 'D4',     type: 'input'  },
      { pin:  7, name: 'D5',     type: 'input'  },
      { pin:  8, name: 'D6',     type: 'input'  },
      { pin:  9, name: 'D7',     type: 'input'  },
      { pin: 10, name: 'D8',     type: 'input'  },
      { pin: 11, name: 'CLRn',   type: 'input'  },
      { pin: 12, name: 'GND',    type: 'power'  },
      { pin: 13, name: 'CLK',    type: 'input'  },
      { pin: 14, name: 'CLKENn', type: 'input'  },
      { pin: 15, name: 'Q8',     type: 'output' },
      { pin: 16, name: 'Q7',     type: 'output' },
      { pin: 17, name: 'Q6',     type: 'output' },
      { pin: 18, name: 'Q5',     type: 'output' },
      { pin: 19, name: 'Q4',     type: 'output' },
      { pin: 20, name: 'Q3',     type: 'output' },
      { pin: 21, name: 'Q2',     type: 'output' },
      { pin: 22, name: 'Q1',     type: 'output' },
      { pin: 23, name: 'Q0',     type: 'output' },
      { pin: 24, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      // Reuses the D_FF_9BIT_CLR_CE_TRI engine primitive (js/specificChipsSim.js):
      // inputs [OEn, CLRn, CLKENn, CLK, D0..D8], outputs [Q0..Q8]. CLKENn is the
      // datasheet's active-LOW clock enable (LOW = load on rising edge, HIGH = hold).
      { type: 'D_FF_9BIT_CLR_CE_TRI', inputs: ['OEn','CLRn','CLKENn','CLK','D0','D1','D2','D3','D4','D5','D6','D7','D8'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

  // 74x1832: Hex 2 input OR driver (20-pin)
  '74x1832': {
    name: '74x1832',
    simpleName: 'Hex 2 Input OR Driver',
    description: 'Hex 2 input OR gate with high drive outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: '',
    tags: ['or', 'hex', 'driver', 'stub'],
    pinout: [
      { pin:  1, name: '1A',   type: 'input'  },
      { pin:  2, name: '1B',   type: 'input'  },
      { pin:  3, name: '1Y',   type: 'output' },
      { pin:  4, name: '2A',   type: 'input'  },
      { pin:  5, name: '2B',   type: 'input'  },
      { pin:  6, name: '2Y',   type: 'output' },
      { pin:  7, name: '3A',   type: 'input'  },
      { pin:  8, name: '3B',   type: 'input'  },
      { pin:  9, name: '3Y',   type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: '4Y',   type: 'output' },
      { pin: 12, name: '4A',   type: 'input'  },
      { pin: 13, name: '4B',   type: 'input'  },
      { pin: 14, name: '5Y',   type: 'output' },
      { pin: 15, name: '5A',   type: 'input'  },
      { pin: 16, name: '5B',   type: 'input'  },
      { pin: 17, name: '6Y',   type: 'output' },
      { pin: 18, name: '6A',   type: 'input'  },
      { pin: 19, name: '6B',   type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'], outputs: [] },
    ],
  },

  // 74x1841: 10 bit bus interface transparent latches, TRI STATE (24-pin)
  //
  // Source: Texas Instruments, "SN74ALS841, SN74AS841A, SN74ALS842 10-Bit
  //   Bus-Interface D-Type Latches With 3-State Outputs", SDAS059C (Dec 1983,
  //   rev Jan 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als841.pdf. Verified: terminal
  //   assignment (DW/NT 24-pin, page 1) and function table (page 2), read as
  //   rendered PDF page images (issues.md C4), not from a text summary.
  //   The '841 is the base 10-bit non-inverting latch; the '1841 is the same
  //   function with on-chip series-damping output resistors (Fairchild/National
  //   FAST 18xx bus-driver variant) — electrically damped, logically identical,
  //   so the '841 datasheet is authoritative for pinout and truth table.
  // Pinout CORRECTED from the hand-entered stub (issues.md C2, the CD4082
  //   lesson): the stub put LE on pin 2 and pushed D0..D9 down to pins 3-11+13.
  //   The datasheet has 1D (D0) on pin 2, D0..D9 on pins 2-11, and LE on pin 13.
  '74x1841': {
    name: '74x1841',
    simpleName: '10 bit Bus Interface Transparent Latches',
    description: '10 bit bus interface transparent latches, TRI STATE (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als841.pdf',
    tags: ['latch', '10 bit', 'bus', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x1841 holds ten bits and drives them onto a bus through three state outputs. It is a transparent latch: while the latch enable is HIGH the outputs follow the data inputs directly, and when it goes LOW the last values are frozen and held. A separate output enable releases the ten pins to high impedance without disturbing the stored bits, so several of these can share one bus and take turns driving it. The ten bit width suits an address or data path plus a parity or control bit, and the outputs are built to drive heavy bus loads directly.',
    guidePinDescriptions: {
      'OEn': 'Output enable, active LOW. LOW drives the stored word onto Q0..Q9; HIGH puts all ten outputs in high impedance. It does not change what the latches hold.',
      'LE':  'Latch enable, active HIGH. HIGH makes the latch transparent so the outputs track the D inputs; LOW freezes the current values and holds them.',
      'D0':  'Data input bit 0.',
      'D1':  'Data input bit 1.',
      'D2':  'Data input bit 2.',
      'D3':  'Data input bit 3.',
      'D4':  'Data input bit 4.',
      'D5':  'Data input bit 5.',
      'D6':  'Data input bit 6.',
      'D7':  'Data input bit 7.',
      'D8':  'Data input bit 8.',
      'D9':  'Data input bit 9.',
      'Q0':  'Latched output bit 0.',
      'Q1':  'Latched output bit 1.',
      'Q2':  'Latched output bit 2.',
      'Q3':  'Latched output bit 3.',
      'Q4':  'Latched output bit 4.',
      'Q5':  'Latched output bit 5.',
      'Q6':  'Latched output bit 6.',
      'Q7':  'Latched output bit 7.',
      'Q8':  'Latched output bit 8.',
      'Q9':  'Latched output bit 9.',
      'GND': 'Ground reference (pin 12).',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Transparent versus latched',
        paragraphs: [
          'With LE HIGH the chip is a wire with delay: each output copies its D input as it changes. Drop LE LOW and the outputs stop tracking and hold whatever value was present at that moment. This is the difference between a transparent latch and an edge triggered register. A register only samples on a clock edge, but this latch is open the whole time LE is HIGH, so the last value it keeps is the one present at the instant LE falls.',
        ],
      },
      {
        title: 'Sharing a bus',
        paragraphs: [
          'OEn controls the pins, not the memory. Raising it hides the outputs in high impedance so another device can drive the same bus lines, while the ten stored bits stay put. Lower OEn again and the same word reappears. That split, holding data on one control and gating the pins on another, is what makes this part useful as a buffer register or bus driver rather than a plain latch.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D0',   type: 'input'  },
      { pin:  3, name: 'D1',   type: 'input'  },
      { pin:  4, name: 'D2',   type: 'input'  },
      { pin:  5, name: 'D3',   type: 'input'  },
      { pin:  6, name: 'D4',   type: 'input'  },
      { pin:  7, name: 'D5',   type: 'input'  },
      { pin:  8, name: 'D6',   type: 'input'  },
      { pin:  9, name: 'D7',   type: 'input'  },
      { pin: 10, name: 'D8',   type: 'input'  },
      { pin: 11, name: 'D9',   type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'Q9',   type: 'output' },
      { pin: 15, name: 'Q8',   type: 'output' },
      { pin: 16, name: 'Q7',   type: 'output' },
      { pin: 17, name: 'Q6',   type: 'output' },
      { pin: 18, name: 'Q5',   type: 'output' },
      { pin: 19, name: 'Q4',   type: 'output' },
      { pin: 20, name: 'Q3',   type: 'output' },
      { pin: 21, name: 'Q2',   type: 'output' },
      { pin: 22, name: 'Q1',   type: 'output' },
      { pin: 23, name: 'Q0',   type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // LATCH_TRANS_TRI (js/specificChipsSim.js): width-agnostic non-inverting
      // transparent latch, 3-state, no clear. inputs [OEn, LE, D0..D9],
      // outputs [Q0..Q9]. LE HIGH = transparent, LE LOW = hold, OEn HIGH = Hi-Z.
      { type: 'LATCH_TRANS_TRI', inputs: ['OEn','LE','D0','D1','D2','D3','D4','D5','D6','D7','D8','D9'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
    ],
  },

  // 74x1843: 9-bit bus interface transparent latch with async clear + preset, TRI-STATE (24-pin)
  // Source: Fairchild Semiconductor, "74ACT843 9-Bit Transparent Latch",
  //   DS009800 (July 1988, rev. Sept 2000). [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74ACT843.pdf
  //   Verified: connection diagram + function table + logic diagram, pages 1-2,
  //   read as 300-dpi PDF images. Terminal assignment (OE=1, D0..D8=2..10,
  //   CLR=11, GND=12, LE=13, PRE=14, O8..O0=15..23, VCC=24) and the full
  //   function table (async PRE overrides async CLR; LE HIGH transparent, LE LOW
  //   latched; CLR/PRE act on the internal latch even while OE=HIGH).
  // The leading "1" of 1843 denotes the balanced / series-damped output variant
  //   (IDT/Cypress FCT1843) of the JEDEC-standard 841/843/845 latch family; it is
  //   functionally identical to the 843 with the same pinout, so the ACT843
  //   datasheet is authoritative for the logic behaviour modelled here.
  // NOTE: the pre-existing hand-entered stub pinout was WRONG (it put LE=2,
  //   CLR=3, D0..D8=4..13, omitted PRE, and marked pin 23 as NC). Corrected
  //   against the datasheet terminal diagram above (the CD4082 lesson, issues.md C2).
  '74x1843': {
    name: '74x1843',
    simpleName: '9-bit Bus Interface Transparent Latch with Clear and Preset',
    description: '9-bit bus transparent latch, async clear+preset, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    sequential: true,
    datasheet: 'https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/74ACT843.pdf',
    tags: ['latch', '9 bit', 'bus', 'tri state', 'clear', 'preset'],
    guideOverview: 'The 74x1843 holds nine bits behind a transparent latch. While LE is HIGH each output follows its D input directly, so the chip acts like nine wires with a small delay. When LE goes LOW the outputs freeze at whatever value was present at that instant and hold it. Two extra control pins force the stored word regardless of D or LE: a LOW on CLRn clears all nine bits to 0, and a LOW on PREn sets all nine to 1. If both are LOW at once, preset wins. OEn (active LOW) gates the output pins onto a bus: LOW drives the stored word, HIGH releases the pins to high impedance. OEn only affects the pins, not the stored bits, and clear and preset still update the latch even while the pins are floating. The ninth bit lets a byte travel with its parity bit or a flag through one package.',
    guidePinDescriptions: {
      'OEn':  'Output enable, active LOW. LOW drives the stored word onto Q0-Q8; HIGH puts all nine outputs in high impedance. It does not change the stored bits.',
      'LE':   'Latch enable. HIGH makes the latch transparent (Q follows D); LOW freezes the stored word.',
      'CLRn': 'Clear, active LOW. A LOW forces all nine stored bits to 0. Asynchronous — it ignores LE. Preset overrides it if both are LOW.',
      'PREn': 'Preset, active LOW. A LOW forces all nine stored bits to 1. Asynchronous, and it overrides clear.',
      'D0':   'Data input bit 0.',
      'D1':   'Data input bit 1.',
      'D2':   'Data input bit 2.',
      'D3':   'Data input bit 3.',
      'D4':   'Data input bit 4.',
      'D5':   'Data input bit 5.',
      'D6':   'Data input bit 6.',
      'D7':   'Data input bit 7.',
      'D8':   'Data input bit 8 (the ninth bit).',
      'Q0':   'Latched output bit 0. TRI-STATE.',
      'Q1':   'Latched output bit 1. TRI-STATE.',
      'Q2':   'Latched output bit 2. TRI-STATE.',
      'Q3':   'Latched output bit 3. TRI-STATE.',
      'Q4':   'Latched output bit 4. TRI-STATE.',
      'Q5':   'Latched output bit 5. TRI-STATE.',
      'Q6':   'Latched output bit 6. TRI-STATE.',
      'Q7':   'Latched output bit 7. TRI-STATE.',
      'Q8':   'Latched output bit 8 (the ninth bit). TRI-STATE.',
      'GND':  'Ground reference (pin 12).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Transparent versus latched',
        paragraphs: [
          'With LE HIGH the chip is a wire with delay: each output copies its D input as it changes. Drop LE LOW and the outputs stop tracking and hold whatever value was present at that moment. This is the difference between a transparent latch and an edge triggered register. A register only samples on a clock edge, but this latch is open the whole time LE is HIGH, so the last value it keeps is the one present at the instant LE falls.',
        ],
      },
      {
        title: 'Clear and preset',
        paragraphs: [
          'CLRn and PREn override the latch. A LOW on CLRn wipes all nine bits to 0; a LOW on PREn sets all nine to 1. Both are asynchronous, meaning they act immediately and do not wait for LE. If CLRn and PREn are LOW at the same time, preset wins and the word becomes all 1s.',
          'These act on the stored bits, not just the pins, so they still take effect while OEn is HIGH and the outputs are floating. Release OEn afterward and the cleared or preset word appears.',
        ],
      },
      {
        title: 'Sharing a bus',
        paragraphs: [
          'OEn controls the pins, not the memory. Raising it hides the outputs in high impedance so another device can drive the same bus lines, while the nine stored bits stay put. Lower OEn again and the same word reappears. That split, holding data on one control and gating the pins on another, is what makes this part useful as a buffer register or bus driver rather than a plain latch.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D0',   type: 'input'  },
      { pin:  3, name: 'D1',   type: 'input'  },
      { pin:  4, name: 'D2',   type: 'input'  },
      { pin:  5, name: 'D3',   type: 'input'  },
      { pin:  6, name: 'D4',   type: 'input'  },
      { pin:  7, name: 'D5',   type: 'input'  },
      { pin:  8, name: 'D6',   type: 'input'  },
      { pin:  9, name: 'D7',   type: 'input'  },
      { pin: 10, name: 'D8',   type: 'input'  },
      { pin: 11, name: 'CLRn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'PREn', type: 'input'  },
      { pin: 15, name: 'Q8',   type: 'output' },
      { pin: 16, name: 'Q7',   type: 'output' },
      { pin: 17, name: 'Q6',   type: 'output' },
      { pin: 18, name: 'Q5',   type: 'output' },
      { pin: 19, name: 'Q4',   type: 'output' },
      { pin: 20, name: 'Q3',   type: 'output' },
      { pin: 21, name: 'Q2',   type: 'output' },
      { pin: 22, name: 'Q1',   type: 'output' },
      { pin: 23, name: 'Q0',   type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // Reuses the existing LATCH_9BIT_PRE_CLR_TRI primitive (the same one the
      // 74x843 uses): identical function and pin contract — a 9-bit transparent
      // D latch with async preset (dominates), async clear, and 3-state outputs.
      // inputs: [D0..D8, LE, OEn, CLRn, PREn], outputs: [Q0..Q8]
      { type: 'LATCH_9BIT_PRE_CLR_TRI',
        inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','LE','OEn','CLRn','PREn'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

  // 74x2003: 8 bit level translator (GTL to TTL) (20-pin)
  '74x2003': {
    name: '74x2003',
    simpleName: '8 bit Level Translator',
    description: '8 bit level translator (GTL to TTL) (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74gtl2003.pdf',
    tags: ['level translator', '8 bit', 'GTL', 'stub'],
    guideOverview: 'The 74x2003 is an eight bit interface device that translates between a low voltage GTL-style bus and ordinary TTL compatible logic levels. GTL signaling uses reduced swing and a reference threshold so a heavily loaded bus can switch quickly without the full noise of standard TTL swings. A part like this sits at the edge of that bus and converts the signaling into levels that conventional logic can understand more easily.',
    guidePinDescriptions: {
      'A0': 'Signal channel A0. Connect one side of the translator path here.',
      'A1': 'Signal channel A1. This is another translated bus line.',
      'A2': 'Signal channel A2. Use it for a third signal path through the translator.',
      'A3': 'Signal channel A3. Another A-side channel in the 8 bit group.',
      'A4': 'Signal channel A4. It participates in the same translation network as the other channels.',
      'A5': 'Signal channel A5. Use it for another translated line.',
      'A6': 'Signal channel A6. This is the seventh A-side channel.',
      'A7': 'Signal channel A7. This is the final A-side signal line.',
      'VREF': 'Reference voltage input for the GTL receiver thresholds. Tie it to the level recommended by the datasheet so the translator recognizes GTL HIGH and LOW correctly.',
      'GND': 'Ground reference for the device.',
      'B7': 'Signal channel B7. This is the B-side partner for A7.',
      'B6': 'Signal channel B6. Another B-side translated line.',
      'B5': 'Signal channel B5. It pairs with A5 through the translation circuitry.',
      'B4': 'Signal channel B4. Use it as another B-side interface node.',
      'B3': 'Signal channel B3. This is one of the lower numbered B-side channels.',
      'B2': 'Signal channel B2. Another translated connection on the B side.',
      'B1': 'Signal channel B1. It pairs with A1 through the device.',
      'B0': 'Signal channel B0. This is the B-side partner for A0.',
      'NC': 'No internal connection. Leave this pin unconnected.',
      'VCC': 'Positive supply for the translator logic.',
    },
    guideSections: [
      {
        title: 'Why GTL Needs Translation',
        paragraphs: [
          'GTL uses a smaller signal swing than ordinary TTL, which helps heavily loaded buses switch faster and with less noise. The tradeoff is that ordinary TTL inputs are not always the right place to terminate or interpret those signals directly.',
          'A translator like the 74x2003 sits between the two worlds. It uses a reference threshold to interpret the GTL side and presents a cleaner, more TTL friendly interface on the local logic side.',
        ],
      },
      {
        title: 'Role of VREF',
        paragraphs: [
          'Because GTL is a low swing signaling scheme, the receiver cannot simply compare the input against a generic TTL threshold. VREF supplies the comparison level that tells the device where the switching boundary should be.',
        ],
        note: 'This simulator entry is a documentation oriented stub. It records the part role and pins, but it does not emulate analog GTL threshold behavior.',
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',   type: 'bidir'  },
      { pin:  2, name: 'A1',   type: 'bidir'  },
      { pin:  3, name: 'A2',   type: 'bidir'  },
      { pin:  4, name: 'A3',   type: 'bidir'  },
      { pin:  5, name: 'A4',   type: 'bidir'  },
      { pin:  6, name: 'A5',   type: 'bidir'  },
      { pin:  7, name: 'A6',   type: 'bidir'  },
      { pin:  8, name: 'A7',   type: 'bidir'  },
      { pin:  9, name: 'VREF', type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'B7',   type: 'bidir'  },
      { pin: 12, name: 'B6',   type: 'bidir'  },
      { pin: 13, name: 'B5',   type: 'bidir'  },
      { pin: 14, name: 'B4',   type: 'bidir'  },
      { pin: 15, name: 'B3',   type: 'bidir'  },
      { pin: 16, name: 'B2',   type: 'bidir'  },
      { pin: 17, name: 'B1',   type: 'bidir'  },
      { pin: 18, name: 'B0',   type: 'bidir'  },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['VREF'], outputs: [] },
    ],
  },

  // 74x2010: 10 bit level translator (GTL to TTL) (24-pin)
  '74x2010': {
    name: '74x2010',
    simpleName: '10 bit Level Translator',
    description: '10 bit level translator (GTL to TTL) (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74gtl2010.pdf',
    tags: ['level translator', '10 bit', 'GTL', 'stub'],
    guideOverview: 'The 74x2010 is the 10 bit version of the GTL to TTL translation idea. It is intended for wider control or data groups where ten low swing GTL lines must be interfaced to standard logic in one package. For designers working with backplanes or processor buses, this kind of part keeps the signaling scheme on the shared bus separate from the logic family used locally on the card.',
    guidePinDescriptions: {
      'A0': 'Signal channel A0. Connect one side of the first translated line here.',
      'A1': 'Signal channel A1. Another A-side bus connection.',
      'A2': 'Signal channel A2. Use it for the third translated signal.',
      'A3': 'Signal channel A3. Another A-side channel in the package.',
      'A4': 'Signal channel A4. It participates in the 10 bit translation group.',
      'A5': 'Signal channel A5. Use it for another line through the translator.',
      'A6': 'Signal channel A6. Another translated A-side signal.',
      'A7': 'Signal channel A7. This is the eighth A-side line.',
      'A8': 'Signal channel A8. This is the ninth A-side line.',
      'A9': 'Signal channel A9. This is the tenth and final A-side line.',
      'VREF': 'Reference voltage input for the GTL receiver threshold. Use the datasheet recommended bias level here.',
      'GND': 'Ground reference for the translator.',
      'B9': 'Signal channel B9. This is the B-side partner for A9.',
      'B8': 'Signal channel B8. Another B-side translated node.',
      'B7': 'Signal channel B7. Use it as the B-side mate for A7.',
      'B6': 'Signal channel B6. Another B-side interface line.',
      'B5': 'Signal channel B5. It belongs to the same translation bank as the rest.',
      'B4': 'Signal channel B4. Another B-side channel.',
      'B3': 'Signal channel B3. This is one of the lower numbered B-side lines.',
      'B2': 'Signal channel B2. It pairs with A2 through the translator.',
      'B1': 'Signal channel B1. Another translated B-side line.',
      'B0': 'Signal channel B0. This is the B-side partner for A0.',
      'NC': 'No internal connection. Leave this pin unconnected.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Wide Bus Translation',
        paragraphs: [
          'A 10 bit translator is useful when a bus is wider than a simple byte but still needs uniform threshold handling across every line. One package gives the whole bus the same biasing and translation behavior.',
        ],
      },
      {
        title: 'Signal Integrity Context',
        paragraphs: [
          'Parts like this existed because high speed multi drop buses place different demands on interconnects than point to point TTL links do. GTL was optimized for the shared bus; the translator makes that bus practical to interface with ordinary digital logic around it.',
        ],
        note: 'The simulator keeps this device as a stub/documentation model rather than a full analog GTL interface simulation.',
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',   type: 'bidir'  },
      { pin:  2, name: 'A1',   type: 'bidir'  },
      { pin:  3, name: 'A2',   type: 'bidir'  },
      { pin:  4, name: 'A3',   type: 'bidir'  },
      { pin:  5, name: 'A4',   type: 'bidir'  },
      { pin:  6, name: 'A5',   type: 'bidir'  },
      { pin:  7, name: 'A6',   type: 'bidir'  },
      { pin:  8, name: 'A7',   type: 'bidir'  },
      { pin:  9, name: 'A8',   type: 'bidir'  },
      { pin: 10, name: 'A9',   type: 'bidir'  },
      { pin: 11, name: 'VREF', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'B9',   type: 'bidir'  },
      { pin: 14, name: 'B8',   type: 'bidir'  },
      { pin: 15, name: 'B7',   type: 'bidir'  },
      { pin: 16, name: 'B6',   type: 'bidir'  },
      { pin: 17, name: 'B5',   type: 'bidir'  },
      { pin: 18, name: 'B4',   type: 'bidir'  },
      { pin: 19, name: 'B3',   type: 'bidir'  },
      { pin: 20, name: 'B2',   type: 'bidir'  },
      { pin: 21, name: 'B1',   type: 'bidir'  },
      { pin: 22, name: 'B0',   type: 'bidir'  },
      { pin: 23, name: 'NC',   type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['VREF'], outputs: [] },
    ],
  },

  // 74x2014: 4 bit GTL to TTL transceiver, TRI STATE and OC (14-pin)
  '74x2014': {
    name: '74x2014',
    simpleName: '4 bit GTL to TTL Transceiver',
    description: '4 bit GTL to TTL transceiver, TRI STATE and open collector (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74gtl2014.pdf',
    tags: ['transceiver', 'GTL', 'TTL', '4 bit', 'bidir', 'stub'],
    guideOverview: 'The 74x2014 is a four bit GTL to TTL interface/transceiver with control over when the translated outputs are active. It is meant for smaller groups of lines where a full 8 bit or 10 bit translator would waste channels. The part combines GTL threshold handling, a reference input, and controlled bus connection so a local TTL circuit can safely interact with a lower swing shared bus.',
    guidePinDescriptions: {
      'OEn': 'Output enable (active LOW). Pull LOW to activate the translated interface; drive HIGH to disconnect the controlled outputs.',
      'VREF': 'Reference voltage input for the GTL thresholds. This bias level determines how the device interprets the low swing bus signals.',
      'A0': 'Channel-0 A-side input. Use it as the local logic side signal for the first translated path.',
      'B0': 'Channel-0 B-side bus node. This pin interfaces with the GTL/translated side of channel 0.',
      'A1': 'Channel-1 A-side input. Another local logic side signal into the translator.',
      'B1': 'Channel-1 B-side bus node. It pairs with A1 through the device.',
      'GND': 'Ground reference for the package.',
      'B2': 'Channel-2 B-side bus node. This is the translated/bus facing side of the third channel.',
      'A2': 'Channel-2 A-side input. Use it as the local side source for channel 2.',
      'B3': 'Channel-3 B-side bus node. This is the final translated bus facing line.',
      'A3': 'Channel-3 A-side input. It controls the fourth translation channel.',
      'NC': 'No internal connection. Leave this pin unconnected.',
      'NC2': 'No internal connection. Leave this pin unconnected.',
      'VCC': 'Positive supply for the interface logic.',
    },
    guideSections: [
      {
        title: 'Small-Bus Translation',
        paragraphs: [
          'Not every bus needs a full byte wide interface. A 4 bit translator is a better fit for status groups, nibbles, or narrow control bundles that still use GTL-style signaling on the shared side.',
        ],
      },
      {
        title: 'Enable and Threshold Control',
        paragraphs: [
          'OEn controls when the translated outputs are allowed to participate, while VREF sets the comparison point for the GTL receivers. Together they let the designer manage both the bus loading and the logic threshold behavior.',
        ],
        note: 'As with the other GTL parts in this file, the simulator documents the package and controls but does not emulate the full analog bus physics.',
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'VREF', type: 'input'  },
      { pin:  3, name: 'A0',   type: 'input'  },
      { pin:  4, name: 'B0',   type: 'bidir'  },
      { pin:  5, name: 'A1',   type: 'input'  },
      { pin:  6, name: 'B1',   type: 'bidir'  },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: 'B2',   type: 'bidir'  },
      { pin:  9, name: 'A2',   type: 'input'  },
      { pin: 10, name: 'B3',   type: 'bidir'  },
      { pin: 11, name: 'A3',   type: 'input'  },
      { pin: 12, name: 'NC',   type: 'nc'     },
      { pin: 13, name: 'NC2',  type: 'nc'     },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['OEn','VREF','A0','A1','A2','A3'], outputs: [] },
    ],
  },

  // 74x2125: Quad bus buffer, TRI STATE, 25Ω series resistor (14-pin)
  '74x2125': {
    name: '74x2125',
    simpleName: 'Quad Bus Buffer (25Ω Series)',
    description: 'Quad bus buffer, TRI STATE with 25 Ω series resistors (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['buffer', 'quad', 'tri state', 'stub'],
    pinout: [
      { pin:  1, name: '1OEn', type: 'input'  },
      { pin:  2, name: '1A',   type: 'input'  },
      { pin:  3, name: '1Y',   type: 'output' },
      { pin:  4, name: '2OEn', type: 'input'  },
      { pin:  5, name: '2A',   type: 'input'  },
      { pin:  6, name: '2Y',   type: 'output' },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: '3Y',   type: 'output' },
      { pin:  9, name: '3A',   type: 'input'  },
      { pin: 10, name: '3OEn', type: 'input'  },
      { pin: 11, name: '4Y',   type: 'output' },
      { pin: 12, name: '4A',   type: 'input'  },
      { pin: 13, name: '4OEn', type: 'input'  },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1OEn','1A','2OEn','2A','3OEn','3A','4OEn','4A'], outputs: [] },
    ],
  },

  // 74x2150: 512 x 8 cache address comparator (24-pin)
  '74x2150': {
    name: '74x2150',
    simpleName: '512 x 8 Cache Address Comparator',
    description: '512 x 8 cache address comparator (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['comparator', 'cache', 'address', 'stub'],
    pinout: [
      { pin:  1, name: 'A0',   type: 'input'  },
      { pin:  2, name: 'A1',   type: 'input'  },
      { pin:  3, name: 'A2',   type: 'input'  },
      { pin:  4, name: 'A3',   type: 'input'  },
      { pin:  5, name: 'A4',   type: 'input'  },
      { pin:  6, name: 'A5',   type: 'input'  },
      { pin:  7, name: 'A6',   type: 'input'  },
      { pin:  8, name: 'A7',   type: 'input'  },
      { pin:  9, name: 'WEn',  type: 'input'  },
      { pin: 10, name: 'RESn', type: 'input'  },
      { pin: 11, name: 'HIT',  type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'HITn', type: 'output' },
      { pin: 14, name: 'D0',   type: 'input'  },
      { pin: 15, name: 'D1',   type: 'input'  },
      { pin: 16, name: 'D2',   type: 'input'  },
      { pin: 17, name: 'D3',   type: 'input'  },
      { pin: 18, name: 'D4',   type: 'input'  },
      { pin: 19, name: 'D5',   type: 'input'  },
      { pin: 20, name: 'D6',   type: 'input'  },
      { pin: 21, name: 'D7',   type: 'input'  },
      { pin: 22, name: 'CLK',  type: 'input'  },
      { pin: 23, name: 'RA78', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','WEn','RESn','D0','D1','D2','D3','D4','D5','D6','D7','CLK','RA78'], outputs: [] },
    ],
  },

  // 74x2151: 8 line to 1 line multiplexer, 25Ω series resistor (16-pin)
  '74x2151': {
    name: '74x2151',
    simpleName: '8 Line to 1 Line Multiplexer (25Ω Series)',
    description: '8 line to 1 line multiplexer with 25 Ω series resistor (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['multiplexer', '8:1', 'mux', 'stub'],
    pinout: [
      { pin:  1, name: 'D3',   type: 'input'  },
      { pin:  2, name: 'D2',   type: 'input'  },
      { pin:  3, name: 'D1',   type: 'input'  },
      { pin:  4, name: 'D0',   type: 'input'  },
      { pin:  5, name: 'Y',    type: 'output' },
      { pin:  6, name: 'Wn',   type: 'output' },
      { pin:  7, name: 'STRn', type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'C',    type: 'input'  },
      { pin: 10, name: 'B',    type: 'input'  },
      { pin: 11, name: 'A',    type: 'input'  },
      { pin: 12, name: 'D7',   type: 'input'  },
      { pin: 13, name: 'D6',   type: 'input'  },
      { pin: 14, name: 'D5',   type: 'input'  },
      { pin: 15, name: 'D4',   type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','A','B','C','STRn'], outputs: [] },
    ],
  },

  // 74x2153: Dual 4 line to 1 line multiplexer, 25Ω series resistor (16-pin)
  '74x2153': {
    name: '74x2153',
    simpleName: 'Dual 4 Line to 1 Line Multiplexer (25Ω Series)',
    description: 'Dual 4 line to 1 line multiplexer with 25 Ω series resistor (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['multiplexer', '4:1', 'dual', 'mux', 'stub'],
    pinout: [
      { pin:  1, name: '1STRn', type: 'input'  },
      { pin:  2, name: 'B',     type: 'input'  },
      { pin:  3, name: 'A',     type: 'input'  },
      { pin:  4, name: '1D0',   type: 'input'  },
      { pin:  5, name: '1D1',   type: 'input'  },
      { pin:  6, name: '1D2',   type: 'input'  },
      { pin:  7, name: '1D3',   type: 'input'  },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: '2D3',   type: 'input'  },
      { pin: 10, name: '2D2',   type: 'input'  },
      { pin: 11, name: '2D1',   type: 'input'  },
      { pin: 12, name: '2D0',   type: 'input'  },
      { pin: 13, name: '2Y',    type: 'output' },
      { pin: 14, name: '1Y',    type: 'output' },
      { pin: 15, name: '2STRn', type: 'input'  },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1STRn','B','A','1D0','1D1','1D2','1D3','2D0','2D1','2D2','2D3','2STRn'], outputs: [] },
    ],
  },

  // 74x2157: Quad 2 line to 1 line multiplexer, 25Ω series resistor (16-pin)
  '74x2157': {
    name: '74x2157',
    simpleName: 'Quad 2 Line to 1 Line Multiplexer (25Ω Series)',
    description: 'Quad 2 line to 1 line multiplexer with 25 Ω series resistor (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['multiplexer', '2:1', 'quad', 'mux', 'stub'],
    pinout: [
      { pin:  1, name: 'SEL',  type: 'input'  },
      { pin:  2, name: '1A',   type: 'input'  },
      { pin:  3, name: '1B',   type: 'input'  },
      { pin:  4, name: '1Y',   type: 'output' },
      { pin:  5, name: '2A',   type: 'input'  },
      { pin:  6, name: '2B',   type: 'input'  },
      { pin:  7, name: '2Y',   type: 'output' },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: '3Y',   type: 'output' },
      { pin: 10, name: '3A',   type: 'input'  },
      { pin: 11, name: '3B',   type: 'input'  },
      { pin: 12, name: '4Y',   type: 'output' },
      { pin: 13, name: '4A',   type: 'input'  },
      { pin: 14, name: '4B',   type: 'input'  },
      { pin: 15, name: 'STRn', type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['SEL','1A','1B','2A','2B','3A','3B','4A','4B','STRn'], outputs: [] },
    ],
  },

  // 74x2161: Synchronous presettable 4 bit binary counter, async clear, 25Ω (16-pin)
  '74x2161': {
    name: '74x2161',
    simpleName: 'Sync Presettable 4 bit Binary Counter (25Ω)',
    description: 'Sync presettable 4-bit binary counter, async clear, 25Ω series R (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['counter', '4 bit', 'synchronous', 'preset', 'clear', 'stub'],
    pinout: [
      { pin:  1, name: 'CLRn', type: 'input'  },
      { pin:  2, name: 'CLK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'LDn',  type: 'input'  },
      { pin: 10, name: 'ENT',  type: 'input'  },
      { pin: 11, name: 'QD',   type: 'output' },
      { pin: 12, name: 'QC',   type: 'output' },
      { pin: 13, name: 'QB',   type: 'output' },
      { pin: 14, name: 'QA',   type: 'output' },
      { pin: 15, name: 'RCO',  type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CLRn','CLK','A','B','C','D','ENP','LDn','ENT'], outputs: [] },
    ],
  },
};