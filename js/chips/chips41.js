// Chip definitions block 41
// Chips: 74826 74828, 74832 74835, 74839 74840, 74841 74846, 74848

export const CHIPS_BLOCK_41 = {

  // ── 74826: 8 bit bus-interface D flip-flop, CLRn + CLKENn, inverting, 3xOEn, TRI (24-pin) ──
  // Source: Integrated Device Technology, "IDT54/74FCT821AT/BT/CT, 823AT/BT/CT/DT,
  //   825AT/BT/CT High-Performance CMOS Bus Interface Registers", DSC-2567/7 (Sept 1996).
  //   [Online]. Available (mirror): https://www.renesas.com/ (IDT74FCT825 datasheet);
  //   verified copy read at e-nexty product_file_id 696370. Verified: FCT825 8-bit DIP
  //   terminal assignment, pin-description table, and family function table, pages 1-3,
  //   read as rendered ~300-dpi PDF page images (issues.md C4 — not via the text
  //   summarizer). The FCT825 is the pin/function-compatible CMOS second source of the
  //   TI SN74AS825A / AMD Am29825; the '826 is the inverting-data twin of the '825,
  //   exactly as the repo's already-verified '824 is the inverting twin of the '823.
  //
  //   Pinout corrected from the hand-entered stub (issues.md C2 — do not trust the stub):
  //   the stub put a single OEn on pin 1, CLRn on 2, CEN on 3, D0-D7 on 4-11, and NC on
  //   pins 14 and 23. The real '825/'826 has THREE active-LOW output enables and no NC
  //   pins. Verified DIP map (top view): OE1n=1, OE2n=2, D0-D7=3-10, CLRn=11, GND=12,
  //   CP(CLK)=13, EN(CLKENn)=14, Q7-Q0=15-22, OE3n=23, VCC=24. (Datasheet labels the
  //   3-state outputs Yi and the internal FF Qi; this entry keeps the Q0-Q7 output names
  //   used across the repo's '821-'825 family for consistency.)
  //
  //   Behavior (family function table): CLRn LOW forces every Q LOW asynchronously and
  //   dominates the clock. CLKENn (datasheet EN) LOW arms the clock, so on the CLK
  //   low-to-high edge the byte is loaded; CLKENn HIGH holds. The '826 is the
  //   inverting-data member, so a loaded bit is stored as Q = NOT D (the repo's '822/'824
  //   convention — inversion sits on the data path, clear still forces Q LOW; see
  //   issues.md). Outputs reach the bus only when all three OEn are LOW; any OEn HIGH ->
  //   Hi-Z, stored data untouched. Uses the BUS_FF_8BIT_3OE_TRI primitive
  //   (js/specificChipsSim.js) with invert:true; the '825 is the same primitive, invert:false.
  '74x826': {
    name: '74x826',
    simpleName: '8 bit D-FF w/ CLRn+CEN, Inv In (TRI)',
    description: '8-bit inverting D reg: async clear, clock enable, 3-state, 3 OEs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74as825a.pdf',
    tags: ['flip flop', 'D type', '8 bit', 'inverting', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x826 is an 8 bit bus register: eight D type flip flops sharing one clock, an asynchronous clear, and a clock enable. It is the inverting version of the 74x825, so each stored bit comes out as the complement of the data present at its D input on the clock edge. The outputs are three state and are gated by three separate active LOW output enables, so several bus masters can each hold one enable and the byte only drives the bus when all three agree.',
    guidePinDescriptions: {
      'OE1n': 'Output enable 1, active LOW. All three output enables must be LOW for the outputs to drive the bus.',
      'OE2n': 'Output enable 2, active LOW.',
      'OE3n': 'Output enable 3, active LOW.',
      'CLRn': 'Asynchronous clear, active LOW. Forces all eight outputs LOW immediately, without waiting for a clock edge.',
      'CLKENn': 'Clock enable, active LOW. LOW lets the next rising clock edge load data; HIGH holds the stored byte even while the clock runs.',
      'CLK':  'Clock input. Data is captured on the LOW to HIGH edge.',
      'D0':   'Data input bit 0. The stored bit is its complement.',
      'D1':   'Data input bit 1. The stored bit is its complement.',
      'D2':   'Data input bit 2. The stored bit is its complement.',
      'D3':   'Data input bit 3. The stored bit is its complement.',
      'D4':   'Data input bit 4. The stored bit is its complement.',
      'D5':   'Data input bit 5. The stored bit is its complement.',
      'D6':   'Data input bit 6. The stored bit is its complement.',
      'D7':   'Data input bit 7. The stored bit is its complement.',
      'GND':  'Ground reference (pin 12).',
      'Q7':   'Registered output bit 7.',
      'Q6':   'Registered output bit 6.',
      'Q5':   'Registered output bit 5.',
      'Q4':   'Registered output bit 4.',
      'Q3':   'Registered output bit 3.',
      'Q2':   'Registered output bit 2.',
      'Q1':   'Registered output bit 1.',
      'Q0':   'Registered output bit 0.',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Clear, clock enable, and hold',
        paragraphs: [
          'CLRn LOW clears all eight outputs at once, without a clock edge. CLKENn LOW arms the register so the next rising clock edge loads new data; CLKENn HIGH freezes the outputs even while the clock keeps running. The output enables only affect the pins: with any of them HIGH the outputs float, but the stored byte stays put and reappears when all three go LOW again.',
        ],
      },
      {
        title: '74x825 vs 74x826',
        paragraphs: [
          'The two parts share the same pinout and controls. The difference is the data path: the 825 stores each D input as is, while the 826 stores its complement. Pick the 826 when the surrounding logic already carries data in active LOW form, so the inversion happens inside the register instead of costing a separate rank of inverters.',
        ],
      },
      {
        title: 'Three output enables',
        paragraphs: [
          'Unlike a plain register with one enable, this part has three, and all three must be LOW before the byte reaches the bus. That lets independent conditions gate the same driver: a chip select, a read strobe, and a direction signal can each own one enable, and none can drive the bus without the others agreeing.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OE1n',   type: 'input'  },
      { pin:  2, name: 'OE2n',   type: 'input'  },
      { pin:  3, name: 'D0',     type: 'input'  },
      { pin:  4, name: 'D1',     type: 'input'  },
      { pin:  5, name: 'D2',     type: 'input'  },
      { pin:  6, name: 'D3',     type: 'input'  },
      { pin:  7, name: 'D4',     type: 'input'  },
      { pin:  8, name: 'D5',     type: 'input'  },
      { pin:  9, name: 'D6',     type: 'input'  },
      { pin: 10, name: 'D7',     type: 'input'  },
      { pin: 11, name: 'CLRn',   type: 'input'  },
      { pin: 12, name: 'GND',    type: 'power'  },
      { pin: 13, name: 'CLK',    type: 'input'  },
      { pin: 14, name: 'CLKENn', type: 'input'  },
      { pin: 15, name: 'Q7',     type: 'output' },
      { pin: 16, name: 'Q6',     type: 'output' },
      { pin: 17, name: 'Q5',     type: 'output' },
      { pin: 18, name: 'Q4',     type: 'output' },
      { pin: 19, name: 'Q3',     type: 'output' },
      { pin: 20, name: 'Q2',     type: 'output' },
      { pin: 21, name: 'Q1',     type: 'output' },
      { pin: 22, name: 'Q0',     type: 'output' },
      { pin: 23, name: 'OE3n',   type: 'input'  },
      { pin: 24, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      { type: 'BUS_FF_8BIT_3OE_TRI', invert: true,
        inputs: ['OE1n','OE2n','OE3n','CLRn','CLKENn','CLK','D0','D1','D2','D3','D4','D5','D6','D7'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
    ],
  },

  // ── 74827: 10 bit buffer, non inverting, TRI (24-pin) ────────────────────
  // Source: NXP (Philips) Semiconductors, "74F827 10-bit buffer/line driver,
  //   non-inverting (3-State)", Rev. 2004 Jan 21 (2004). [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/NXP%20PDFs/74F827_Rev2004.pdf.
  //   Verified: PIN CONFIGURATION + FUNCTION TABLE + LOGIC DIAGRAM, pages 2-3,
  //   read as 400-dpi rendered PDF page images (issues.md C4). Corrected the
  //   hand-entered stub pinout (issues.md C2/C31 lesson): the real part has TWO
  //   active-LOW output enables OE0 (pin 1) and OE1 (pin 13), NOR-combined so the
  //   outputs drive only when both are LOW; data inputs D0-D9 (pins 2-11);
  //   outputs Q0-Q9 (pins 23..14). The stub had a single OEn, mis-numbered
  //   outputs Y9..Y0 starting at pin 13, and an invented NC on pin 23 -- none of
  //   which exist on silicon. (The TI mc74f827.pdf symlink now serves HTML, not a
  //   PDF, so the NXP data sheet is the source.)
  '74x827': {
    name: '74x827',
    simpleName: '10 bit Buffer (Non Inv, TRI)',
    description: '10 bit buffer with non inverting three state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://media.digikey.com/pdf/Data%20Sheets/NXP%20PDFs/74F827_Rev2004.pdf',
    tags: ['buffer', '10 bit', 'non inverting', 'tri state'],
    guideOverview: 'The 74x827 is a 10 bit non inverting tri state buffer for wide bus interfaces. It passes each input straight through to its output while enabled, and releases all ten outputs to high impedance when told to let go of the bus. It is used to isolate processor, memory, and peripheral buses while preserving logic polarity.',
    guidePinDescriptions: {
      'OE0': 'Output enable 0 (active LOW). Both OE0 and OE1 must be LOW to drive the outputs.',
      'OE1': 'Output enable 1 (active LOW). Both OE0 and OE1 must be LOW to drive the outputs.',
      'D0':  'Input bit 0.',
      'D1':  'Input bit 1.',
      'D2':  'Input bit 2.',
      'D3':  'Input bit 3.',
      'D4':  'Input bit 4.',
      'D5':  'Input bit 5.',
      'D6':  'Input bit 6.',
      'D7':  'Input bit 7.',
      'D8':  'Input bit 8.',
      'D9':  'Input bit 9.',
      'GND': 'Ground reference (pin 12).',
      'Q9':  'Buffered output bit 9.',
      'Q8':  'Buffered output bit 8.',
      'Q7':  'Buffered output bit 7.',
      'Q6':  'Buffered output bit 6.',
      'Q5':  'Buffered output bit 5.',
      'Q4':  'Buffered output bit 4.',
      'Q3':  'Buffered output bit 3.',
      'Q2':  'Buffered output bit 2.',
      'Q1':  'Buffered output bit 1.',
      'Q0':  'Buffered output bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: '10 bit Bus Width',
        paragraphs: [
          'Ten bit paths are useful for 8 bit data plus parity/status lines, or for segmented control/address bundles. One package buffers the whole group.',
        ],
      },
      {
        title: 'Two Output Enables',
        paragraphs: [
          'The outputs turn on only when both OE0 and OE1 are LOW. Raise either one and all ten outputs go to high impedance. Two enables let two different control signals each veto the bus without extra gates: one can be a chip select, the other a bus grant or direction line.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OE0', type: 'input'  },
      { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  },
      { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  },
      { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  },
      { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  },
      { pin: 10, name: 'D8',  type: 'input'  },
      { pin: 11, name: 'D9',  type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'OE1', type: 'input'  },
      { pin: 14, name: 'Q9',  type: 'output' },
      { pin: 15, name: 'Q8',  type: 'output' },
      { pin: 16, name: 'Q7',  type: 'output' },
      { pin: 17, name: 'Q6',  type: 'output' },
      { pin: 18, name: 'Q5',  type: 'output' },
      { pin: 19, name: 'Q4',  type: 'output' },
      { pin: 20, name: 'Q3',  type: 'output' },
      { pin: 21, name: 'Q2',  type: 'output' },
      { pin: 22, name: 'Q1',  type: 'output' },
      { pin: 23, name: 'Q0',  type: 'output' },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    // 74541-style non-inverting tri-state buffer, one bit per gate, both active-LOW
    // enables shared: Qn = Dn only when OE0=0 AND OE1=0, else Hi-Z (NOR enable).
    gates: [
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D0', 'OE0', 'OE1'], output: 'Q0' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D1', 'OE0', 'OE1'], output: 'Q1' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D2', 'OE0', 'OE1'], output: 'Q2' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D3', 'OE0', 'OE1'], output: 'Q3' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D4', 'OE0', 'OE1'], output: 'Q4' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D5', 'OE0', 'OE1'], output: 'Q5' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D6', 'OE0', 'OE1'], output: 'Q6' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D7', 'OE0', 'OE1'], output: 'Q7' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D8', 'OE0', 'OE1'], output: 'Q8' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['D9', 'OE0', 'OE1'], output: 'Q9' },
    ],
  },

  // ── 74828: 10 bit buffer, inverting, TRI (24-pin) ────────────────────────
  // Source: Philips Semiconductors, "74F827 10-bit buffer/line driver,
  //   non-inverting (3-State)", Product data (2004 Jan 21), which states it
  //   "Replaces Product specification 74F827/74F828 of 1994 Dec 5" — i.e. the
  //   828 shares this package/pinout. [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/NXP%20PDFs/74F827_Rev2004.pdf.
  //   Verified: PIN CONFIGURATION (24-pin DIP) + FUNCTION TABLE, page 2–3, read
  //   as PDF page images. Pin 1 = OE0 (active LOW), pin 13 = OE1 (active LOW),
  //   NOR-combined ("NOR Output Enables"); D0..D9 = pins 2..11; Q0..Q9 = pins
  //   23,22,21,20,19,18,17,16,15,14; GND = 12, VCC = 24. There is NO NC pin.
  // Inverting polarity confirmed: Fairchild Semiconductor, "74F828" datasheet,
  //   description "The 74F828 is an inverting version of the 74F827".
  //   [Online]. Available:
  //   https://www.alldatasheet.com/datasheet-pdf/pdf/50387/FAIRCHILD/74F828.html.
  // NOTE: the previous stub cited a TI "mc74f828.pdf" symlink that 404s (TI never
  //   made this part) and had a fabricated pinout (single OEn, output Y9 on pin
  //   13, NC on pin 23) — all corrected here against the datasheet above (C2/C4).
  // Engine: TRI_BUFFER_DUAL_OE with invert:true — one gate per bit. The two OEs
  //   NOR together (both must be LOW to enable), matching the datasheet.
  '74x828': {
    name: '74x828',
    simpleName: '10 bit Buffer (Inv, TRI)',
    description: '10 bit inverting buffer/line driver with three state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://media.digikey.com/pdf/Data%20Sheets/NXP%20PDFs/74F827_Rev2004.pdf',
    tags: ['buffer', '10 bit', 'inverting', 'tri state'],
    guideOverview: 'The 74x828 is the inverting counterpart to the 74x827. It buffers ten bits from one bus to another, flipping each bit on the way, and can drop all ten outputs to high impedance to release the bus. It suits active LOW bus conventions and wide data or address paths.',
    guidePinDescriptions: {
      'OE0': 'Output enable, active LOW. Both OE0 and OE1 must be LOW to drive the outputs.',
      'OE1': 'Output enable, active LOW. If either OE0 or OE1 is HIGH, all outputs go high impedance.',
      'D0':  'Input bit 0.',
      'D1':  'Input bit 1.',
      'D2':  'Input bit 2.',
      'D3':  'Input bit 3.',
      'D4':  'Input bit 4.',
      'D5':  'Input bit 5.',
      'D6':  'Input bit 6.',
      'D7':  'Input bit 7.',
      'D8':  'Input bit 8.',
      'D9':  'Input bit 9.',
      'GND': 'Ground reference (pin 12).',
      'Q0':  'Inverted output bit 0.',
      'Q1':  'Inverted output bit 1.',
      'Q2':  'Inverted output bit 2.',
      'Q3':  'Inverted output bit 3.',
      'Q4':  'Inverted output bit 4.',
      'Q5':  'Inverted output bit 5.',
      'Q6':  'Inverted output bit 6.',
      'Q7':  'Inverted output bit 7.',
      'Q8':  'Inverted output bit 8.',
      'Q9':  'Inverted output bit 9.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: '74x827 vs 74x828',
        paragraphs: [
          'Both are 10 bit tri state buffers with the same pinout. The 74x827 passes each bit through unchanged; the 74x828 inverts each bit. Pick the 828 when the bus you are driving uses active LOW signalling, so the buffer does the polarity flip for you.',
        ],
      },
      {
        title: 'Two output enables',
        paragraphs: [
          'The outputs turn on only when both OE0 (pin 1) and OE1 (pin 13) are LOW. If either goes HIGH, all ten outputs go to high impedance and stop driving the bus. Two separate enables let two different control signals each veto the buffer without extra glue logic.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OE0', type: 'input'  },
      { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  },
      { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  },
      { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  },
      { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  },
      { pin: 10, name: 'D8',  type: 'input'  },
      { pin: 11, name: 'D9',  type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'OE1', type: 'input'  },
      { pin: 14, name: 'Q9',  type: 'output' },
      { pin: 15, name: 'Q8',  type: 'output' },
      { pin: 16, name: 'Q7',  type: 'output' },
      { pin: 17, name: 'Q6',  type: 'output' },
      { pin: 18, name: 'Q5',  type: 'output' },
      { pin: 19, name: 'Q4',  type: 'output' },
      { pin: 20, name: 'Q3',  type: 'output' },
      { pin: 21, name: 'Q2',  type: 'output' },
      { pin: 22, name: 'Q1',  type: 'output' },
      { pin: 23, name: 'Q0',  type: 'output' },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D0','OE0','OE1'], output: 'Q0' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D1','OE0','OE1'], output: 'Q1' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D2','OE0','OE1'], output: 'Q2' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D3','OE0','OE1'], output: 'Q3' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D4','OE0','OE1'], output: 'Q4' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D5','OE0','OE1'], output: 'Q5' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D6','OE0','OE1'], output: 'Q6' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D7','OE0','OE1'], output: 'Q7' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D8','OE0','OE1'], output: 'Q8' },
      { type: 'TRI_BUFFER_DUAL_OE', invert: true, inputs: ['D9','OE0','OE1'], output: 'Q9' },
    ],
  },

  // ── 74832: Hex 2 input OR drivers (20-pin) ───────────────────────────────
  // Source: Texas Instruments, "SN54ALS832A, SN54AS832B, SN74ALS832A, SN74AS832B
  //   HEX 2-INPUT OR DRIVERS", SDAS017C (Dec 1982, rev. Jan 1995).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als832a.pdf.
  //   Verified: DW/N package terminal assignment (TOP VIEW), function table
  //   (Y = A + B per driver) and positive-logic logic diagram, page 1, read as
  //   300-dpi PDF images. Datasheet pins: 1A=1,1B=2,1Y=3,2A=4,2B=5,2Y=6,3A=7,
  //   3B=8,3Y=9,GND=10,4Y=11,4A=12,4B=13,5Y=14,5A=15,5B=16,6Y=17,6A=18,6B=19,
  //   VCC=20. Six independent 2-input OR gates (high drive); modeled with the
  //   built-in OR primitive — drive capability has no digital-logic effect.
  //   Note: original stub had the A/B input labels swapped on gates 4/5/6
  //   (pins 12/13, 15/16, 18/19); corrected here to match the datasheet (OR is
  //   commutative, so this was harmless to the sim but wrong on the pin map).
  '74x832': {
    name: '74x832',
    simpleName: 'Hex 2 Input OR Driver',
    description: 'Hex 2 input OR drivers (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als832a.pdf',
    tags: ['OR', 'gate', 'driver', 'hex'],
    guideOverview: 'The 74x832 contains six independent 2 input OR driver gates. It is a general purpose glue logic part for combining enables, status conditions, and control strobes.',
    guidePinDescriptions: {
      'A0':  'Input A for gate 0.',
      'B0':  'Input B for gate 0.',
      'Y0':  'OR output for gate 0.',
      'A1':  'Input A for gate 1.',
      'B1':  'Input B for gate 1.',
      'Y1':  'OR output for gate 1.',
      'A2':  'Input A for gate 2.',
      'B2':  'Input B for gate 2.',
      'Y2':  'OR output for gate 2.',
      'GND': 'Ground reference (pin 10).',
      'Y3':  'OR output for gate 3.',
      'B3':  'Input B for gate 3.',
      'A3':  'Input A for gate 3.',
      'Y4':  'OR output for gate 4.',
      'B4':  'Input B for gate 4.',
      'A4':  'Input A for gate 4.',
      'Y5':  'OR output for gate 5.',
      'B5':  'Input B for gate 5.',
      'A5':  'Input A for gate 5.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Hex OR Logic',
        formulas: [
          'Y = A + B',
        ],
        paragraphs: [
          'Each output goes HIGH when either input is HIGH, and only goes LOW when both inputs are LOW. OR gates are used to merge several request or enable conditions into one control signal.',
          'The "driver" in the name means the outputs are built to push more current than an ordinary OR gate, so they can drive heavier loads or longer traces without an extra buffer. That higher drive does not change the logic, so in the simulator it behaves exactly like six 2-input OR gates.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'B0',  type: 'input'  },
      { pin:  3, name: 'Y0',  type: 'output' },
      { pin:  4, name: 'A1',  type: 'input'  },
      { pin:  5, name: 'B1',  type: 'input'  },
      { pin:  6, name: 'Y1',  type: 'output' },
      { pin:  7, name: 'A2',  type: 'input'  },
      { pin:  8, name: 'B2',  type: 'input'  },
      { pin:  9, name: 'Y2',  type: 'output' },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'Y3',  type: 'output' },
      { pin: 12, name: 'A3',  type: 'input'  },
      { pin: 13, name: 'B3',  type: 'input'  },
      { pin: 14, name: 'Y4',  type: 'output' },
      { pin: 15, name: 'A4',  type: 'input'  },
      { pin: 16, name: 'B4',  type: 'input'  },
      { pin: 17, name: 'Y5',  type: 'output' },
      { pin: 18, name: 'A5',  type: 'input'  },
      { pin: 19, name: 'B5',  type: 'input'  },
      { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'OR', inputs: ['A0','B0'], output: 'Y0' },
      { type: 'OR', inputs: ['A1','B1'], output: 'Y1' },
      { type: 'OR', inputs: ['A2','B2'], output: 'Y2' },
      { type: 'OR', inputs: ['A3','B3'], output: 'Y3' },
      { type: 'OR', inputs: ['A4','B4'], output: 'Y4' },
      { type: 'OR', inputs: ['A5','B5'], output: 'Y5' },
    ],
  },

  // ── 74833: 8-bit-to-9-bit parity bus transceiver, non-inverting, TRI (24-pin)
  // Source: Texas Instruments, "SN54ABT833, SN74ABT833 8-Bit to 9-Bit Parity Bus
  //   Transceivers", SCBS195C (Feb 1991, rev. Jan 1997). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74abt833.pdf. Verified: terminal
  //   assignment (DW/NT/JT 24-pin package), description, FUNCTION TABLE,
  //   ERROR-FLAG FUNCTION TABLE, and logic diagram, pages 1-3, read as rendered
  //   300-dpi PDF page images (issues.md C4 — the text summarizer is not trusted).
  // Pinout FIX (issues.md C2): the prior hand-entered stub map (DIR/LE/A0-A7/
  //   AP/BP) did NOT match the datasheet and has been replaced. Real map, TOP
  //   VIEW: OEAn(1), A1-A8(2-9), ERRn(10), CLRn(11), GND(12), CLK(13), OEBn(14),
  //   PARITY(15), B8-B1(16-23), VCC(24). There is no DIR or LE pin — direction is
  //   set by the OEAn/OEBn pair — and the 9th bit is a single shared PARITY I/O,
  //   not separate AP/BP lines.
  // Behavior (see the XCVR_PARITY_REG evaluator in js/specificChipsSim.js): odd
  //   parity generator/checker over 9 bits, with a sticky open-collector error
  //   flag (ERRn) clocked into an on-chip register by CLK and cleared by CLRn.
  '74x833': {
    name: '74x833',
    simpleName: '8-to-9 bit Transceiver w/ Parity (TRI)',
    description: '8-to-9-bit parity transceiver: non-inverting, 3-state, error flag (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74abt833.pdf',
    tags: ['transceiver', 'parity', '8 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x833 moves a byte between an A bus and a B bus and carries a ninth bit for parity. Sending A to B, it generates a parity bit so the whole 9 bit word has an odd number of 1s. Receiving B to A, it re-checks that parity and stores the result in an error flag. Two active LOW enables set what it does: OEBn LOW alone sends A to B; OEAn LOW alone sends B to A; both HIGH isolates the buses; both LOW sends A to B with the parity bit flipped, which forces an error for testing. The error flag ERRn is open collector and sticky: a rising edge on CLK latches a bad word LOW, and it stays LOW until a LOW pulse on CLRn clears it.',
    guidePinDescriptions: {
      'OEAn': 'Output enable for the A bus, active LOW. LOW (with OEBn HIGH) drives A from B.',
      'OEBn': 'Output enable for the B bus, active LOW. LOW (with OEAn HIGH) drives B from A.',
      'A1':  'Bus A bit 1.',
      'A2':  'Bus A bit 2.',
      'A3':  'Bus A bit 3.',
      'A4':  'Bus A bit 4.',
      'A5':  'Bus A bit 5.',
      'A6':  'Bus A bit 6.',
      'A7':  'Bus A bit 7.',
      'A8':  'Bus A bit 8.',
      'B1':  'Bus B bit 1.',
      'B2':  'Bus B bit 2.',
      'B3':  'Bus B bit 3.',
      'B4':  'Bus B bit 4.',
      'B5':  'Bus B bit 5.',
      'B6':  'Bus B bit 6.',
      'B7':  'Bus B bit 7.',
      'B8':  'Bus B bit 8.',
      'PARITY': 'The ninth bit. An output when sending A to B (the generated parity bit); an input when receiving B to A (the parity bit to check).',
      'ERRn': 'Parity error flag, open collector and active LOW. LOW means a received word failed its parity check. It latches and holds until cleared.',
      'CLK': 'Clock. A rising edge samples the parity check into the error flag.',
      'CLRn': 'Clear the error flag, active LOW. A LOW pulse forces ERRn back HIGH.',
      'GND': 'Ground reference (pin 12).',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Odd parity',
        paragraphs: [
          'Parity is a one bit check on a group of bits. This chip uses odd parity: the parity bit is set so the total number of 1s across all nine bits (eight data plus parity) is odd. If the eight data bits already have an odd number of 1s, the parity bit is 0; if even, the parity bit is 1.',
          'When the chip sends A to B it computes that parity bit and drives it on the PARITY pin. When it receives B to A it adds up the nine incoming bits: an odd total is a good word, an even total means a bit flipped somewhere on the bus.',
        ],
      },
      {
        title: 'The stored error flag',
        paragraphs: [
          'The result of each received-word check goes into a flip flop on a rising edge of CLK. The flag is sticky: once a bad word pulls ERRn LOW it stays LOW even if good words follow, so a brief glitch on the bus is not missed. A LOW pulse on CLRn resets it to HIGH.',
          'ERRn is open collector, so it only pulls LOW. Tie it to a pull-up (or wire several chips together) and any one of them can flag an error. Driving both buses at once with both enables LOW sends A to B with the parity bit inverted, which is a deliberate way to inject a bad word and confirm the checking path works.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEAn',   type: 'input'  },
      { pin:  2, name: 'A1',     type: 'bidir'  },
      { pin:  3, name: 'A2',     type: 'bidir'  },
      { pin:  4, name: 'A3',     type: 'bidir'  },
      { pin:  5, name: 'A4',     type: 'bidir'  },
      { pin:  6, name: 'A5',     type: 'bidir'  },
      { pin:  7, name: 'A6',     type: 'bidir'  },
      { pin:  8, name: 'A7',     type: 'bidir'  },
      { pin:  9, name: 'A8',     type: 'bidir'  },
      { pin: 10, name: 'ERRn',   type: 'output' },
      { pin: 11, name: 'CLRn',   type: 'input'  },
      { pin: 12, name: 'GND',    type: 'power'  },
      { pin: 13, name: 'CLK',    type: 'input'  },
      { pin: 14, name: 'OEBn',   type: 'input'  },
      { pin: 15, name: 'PARITY', type: 'bidir'  },
      { pin: 16, name: 'B8',     type: 'bidir'  },
      { pin: 17, name: 'B7',     type: 'bidir'  },
      { pin: 18, name: 'B6',     type: 'bidir'  },
      { pin: 19, name: 'B5',     type: 'bidir'  },
      { pin: 20, name: 'B4',     type: 'bidir'  },
      { pin: 21, name: 'B3',     type: 'bidir'  },
      { pin: 22, name: 'B2',     type: 'bidir'  },
      { pin: 23, name: 'B1',     type: 'bidir'  },
      { pin: 24, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      // inputs:  [OEAn, OEBn, CLRn, CLK, A1..A8, B1..B8, PARITY]
      // outputs: [A1..A8, B1..B8, PARITY, ERRn]   (A/B/PARITY are bidirectional)
      { type: 'XCVR_PARITY_REG',
        inputs:  ['OEAn','OEBn','CLRn','CLK',
                  'A1','A2','A3','A4','A5','A6','A7','A8',
                  'B1','B2','B3','B4','B5','B6','B7','B8','PARITY'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8',
                  'B1','B2','B3','B4','B5','B6','B7','B8','PARITY','ERRn'] },
    ],
  },

  // ── 74834: 8-to-9 bit parity bus transceiver, inverting, sticky error, TRI (24-pin)
  // Source: Signetics (Philips Semiconductors), "Octal inverting transceiver with
  //   parity generator/checker (3-State), 74ABT834", Objective specification, in
  //   the "IC23 ABT/MULTIBYTE Advanced BiCMOS Bus Interface Logic" data book
  //   (Apr 25, 1991), pp. 224-225. [Online]. Available:
  //   https://www.bitsavers.org/components/signetics/_dataBooks/1991_Signetics_IC23_ABT_MULTIBYTE_Advanced_BiCMOS_Bus_Interface_Logic.pdf
  //   Verified: PIN CONFIGURATION + PIN DESCRIPTION + FUNCTION TABLE + ERROR-FLAG
  //   FUNCTION TABLE, read as 400-dpi rendered PDF page images. The book is an OCR
  //   scan whose text layer garbles ("COOT", "vee", "Anto Bn"...) — issues.md C4 —
  //   so pin numbers and the B=A̅ / A=B̅ data columns were read from the images.
  // Cross-check: Texas Instruments, "SN54ABT833, SN74ABT833 8-Bit to 9-Bit Parity
  //   Bus Transceivers", SCBS195C (Feb 1991, rev. Jan 1997). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74abt833.pdf. Verified: identical 24-pin
  //   terminal assignment on the non-inverting 833 sibling (front pinout image +
  //   logic-symbol pin numbers, native-text PDF). The 834 differs only in that both
  //   data buses invert (B=A̅ transmit, A=B̅ receive); PARITY and ERROR logic match.
  // TI names the data bits A1-A8/B1-B8; Signetics names them A0-A7/B0-B7 — same
  //   physical pins. This entry uses the Signetics 0-indexed names.
  // Pinout differs entirely from the original stub, which had invented names
  //   (OEn/DIR on 1-2, AP/BP on 11/13, CLK/LE on 22-23) and a dead ti.com/idt
  //   URL — both hand-entered and both wrong (issues.md C2, the CD4082 lesson).
  //   Real map: OEAn=1, A0-A7=2-9, ERRn=10, CLRn=11, GND=12, CP=13, OEBn=14,
  //   PARITY=15, B7-B0=16-23, VCC=24.
  '74x834': {
    name: '74x834',
    simpleName: '8-to-9 bit Transceiver w/ Parity, Inv (TRI)',
    description: '8-to-9-bit inverting parity transceiver: 3-state, error flag (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.bitsavers.org/components/signetics/_dataBooks/1991_Signetics_IC23_ABT_MULTIBYTE_Advanced_BiCMOS_Bus_Interface_Logic.pdf',
    tags: ['transceiver', 'parity', '8 bit', 'inverting', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x834 moves a byte between two buses and inverts it on the way through: send eight bits into the A side and the B side shows their complement, and the same happens B to A. Alongside the byte it carries a ninth bit for parity, a simple error check. When sending A to B the chip generates that parity bit; when receiving B to A it re-checks the parity of the incoming nine bits and, on a clock edge, latches an error flag if the count is wrong. The flag stays set until you clear it, so a single bad transfer is not missed. Two active-LOW output enables pick the direction. Pulling both LOW at once forces a wrong parity bit on purpose, which lets a designer test that the error path actually works. The 74x834 is the inverting version of the 74x833; the 833 passes data straight through instead.',
    guidePinDescriptions: {
      'OEAn': 'Output enable for the A bus, active LOW. LOW drives the A pins (receiving from B); HIGH leaves them as inputs or high-impedance.',
      'A0':  'A bus bit 0. Input when sending A to B, driven output (inverted B) when receiving.',
      'A1':  'A bus bit 1.',
      'A2':  'A bus bit 2.',
      'A3':  'A bus bit 3.',
      'A4':  'A bus bit 4.',
      'A5':  'A bus bit 5.',
      'A6':  'A bus bit 6.',
      'A7':  'A bus bit 7.',
      'ERRn': 'Parity error flag, active LOW, open-collector. Stays HIGH while received words check out; latches LOW on a clocked bad-parity word and holds until CLRn is pulsed.',
      'CLRn': 'Clear the error flag, active LOW. A LOW pulse forces ERRn back HIGH.',
      'GND': 'Ground reference (pin 12).',
      'CP':  'Clock. The parity check result is captured into the error flag on the rising edge.',
      'OEBn': 'Output enable for the B bus, active LOW. LOW drives the B pins (sending from A); HIGH leaves them as inputs or high-impedance.',
      'PARITY': 'The ninth bit. Driven as an output (generated odd parity) when sending A to B; read as an input (the received parity bit) when receiving B to A.',
      'B7':  'B bus bit 7. Driven output (inverted A) when sending A to B, input when receiving.',
      'B6':  'B bus bit 6.',
      'B5':  'B bus bit 5.',
      'B4':  'B bus bit 4.',
      'B3':  'B bus bit 3.',
      'B2':  'B bus bit 2.',
      'B1':  'B bus bit 1.',
      'B0':  'B bus bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Odd parity, in one line',
        paragraphs: [
          'Parity is the cheapest error check there is: count the 1s in the data and add one more bit to make the total come out a fixed way. This part uses odd parity, so the nine bits together (the byte plus the parity bit) always hold an odd number of 1s. When sending, the chip picks the parity bit that makes that true. When receiving, it counts the nine incoming bits; an even count means a bit flipped somewhere, and the error flag fires.',
          'Because the byte is inverted on its way across, you might expect the parity to change — but flipping all eight data bits does not change whether the count of 1s is odd or even, so the same parity bit still works.',
        ],
      },
      {
        title: 'The stored error flag',
        paragraphs: [
          'The error output is not momentary. On each clock edge while receiving, the chip samples the parity check; the first time it sees a bad word the flag latches LOW and stays there, even if later words are fine. That way a brief glitch on the bus is not lost between the times software happens to look. Pulsing CLRn LOW resets the flag to HIGH so a new run can start clean.',
          'The output is open-collector, so it can only pull LOW — it needs a pull-up resistor to reach HIGH, which lets several of these flags share one wire (any one erroring pulls the shared line LOW).',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEAn',   type: 'input'  },
      { pin:  2, name: 'A0',     type: 'bidir'  },
      { pin:  3, name: 'A1',     type: 'bidir'  },
      { pin:  4, name: 'A2',     type: 'bidir'  },
      { pin:  5, name: 'A3',     type: 'bidir'  },
      { pin:  6, name: 'A4',     type: 'bidir'  },
      { pin:  7, name: 'A5',     type: 'bidir'  },
      { pin:  8, name: 'A6',     type: 'bidir'  },
      { pin:  9, name: 'A7',     type: 'bidir'  },
      { pin: 10, name: 'ERRn',   type: 'output' },
      { pin: 11, name: 'CLRn',   type: 'input'  },
      { pin: 12, name: 'GND',    type: 'power'  },
      { pin: 13, name: 'CP',     type: 'input'  },
      { pin: 14, name: 'OEBn',   type: 'input'  },
      { pin: 15, name: 'PARITY', type: 'bidir'  },
      { pin: 16, name: 'B7',     type: 'bidir'  },
      { pin: 17, name: 'B6',     type: 'bidir'  },
      { pin: 18, name: 'B5',     type: 'bidir'  },
      { pin: 19, name: 'B4',     type: 'bidir'  },
      { pin: 20, name: 'B3',     type: 'bidir'  },
      { pin: 21, name: 'B2',     type: 'bidir'  },
      { pin: 22, name: 'B1',     type: 'bidir'  },
      { pin: 23, name: 'B0',     type: 'bidir'  },
      { pin: 24, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      { type: 'XCVR_PARITY_REG_INV',
        inputs:  ['OEAn','OEBn','CLRn','CP',
                  'A0','A1','A2','A3','A4','A5','A6','A7',
                  'B0','B1','B2','B3','B4','B5','B6','B7','PARITY'],
        outputs: ['A0','A1','A2','A3','A4','A5','A6','A7',
                  'B0','B1','B2','B3','B4','B5','B6','B7','PARITY','ERRn'] },
    ],
  },

  // ── 74835: 8 bit shift register w/ 2:1 MUX, latched "B" inputs, serial out (24-pin)
  // Source: Philips Components-Signetics, "8-Bit Shift Register with 2:1 Mux-In,
  //   Latched 'B' Inputs, and Serial Out" (74F835), Product Specification, doc no.
  //   853-0615 (Jan 8, 1990). Reproduced in the 1990 Signetics FAST Supplement,
  //   pp. 174-176. [Online]. Available:
  //   http://www.bitsavers.org/components/signetics/_dataBooks/1990_Signetics_FAST_Supplement.pdf
  //   Verified: pin configuration (top view) + pin/loading table + DESCRIPTION,
  //   read as 200-dpi rendered PDF page images (issues.md C4 — text summaries of
  //   these scans hallucinate). The TI link sn74f835.pdf 404s (no TI second source);
  //   the prior stub's TI URL and hand-entered pinout were both wrong (issues.md C2).
  // Pinout per the datasheet differs entirely from the original stub, which had
  //   invented names (A0/B0..., QSER on 22, NC on 23) and omitted the PE pin.
  //   Real map: PEn=1, CP=2, D4A=3, D4B=4, D5A=5, D5B=6, D6A=7, D6B=8, D7A=9,
  //   D7B=10, Q7=11, GND=12, LE=13, SEL(SA̅/B)=14, SER(Ds)=15, D0A=16, D0B=17,
  //   D1A=18, D1B=19, D2A=20, D2B=21, D3A=22, D3B=23, VCC=24.
  // Behavior: no separate truth table is printed; the datasheet defines the part as
  //   "Combines the 'F373, two 'F157s, and the 'F166 functions." Polarities taken
  //   from those parts (74F373 latch: LE HIGH = transparent; 74F157 mux: SEL LOW = A,
  //   HIGH = B; 74F166 PISO: PE LOW = synchronous parallel load, HIGH = shift on the
  //   rising CP edge with SER entering stage 0, Q7 = serial output / last stage).
  '74x835': {
    name: '74x835',
    simpleName: '8 bit Shift Reg w/ 2:1 MUX',
    description: '8-bit serial-out shift register, 2:1 mux per input, B-bank latch (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'http://www.bitsavers.org/components/signetics/_dataBooks/1990_Signetics_FAST_Supplement.pdf',
    tags: ['shift register', 'mux', '8 bit', 'sequential'],
    sequential: true,
    guideOverview: 'The 74x835 packs three stages into one part: a transparent latch on the eight B inputs, a 2:1 multiplexer on every bit, and an 8-bit shift register. Each bit picks between its A input and its latched B input, SEL choosing the whole bank at once. On a rising clock edge the chip either loads those eight selected bits in parallel (when PE is LOW) or shifts the register one place toward Q7, pulling a new bit in from SER. Q7 is the only register output, so the part shifts out serially and chains into the SER of the next 835 to build wider registers.',
    guidePinDescriptions: {
      'PEn':  'Parallel Enable, active LOW. On the rising clock edge: LOW loads the eight multiplexed bits in parallel; HIGH shifts instead.',
      'CP':   'Clock. The register loads or shifts on the rising edge.',
      'D0A':  'A-bank parallel input, bit 0. Selected when SEL is LOW.',
      'D1A':  'A-bank parallel input, bit 1.',
      'D2A':  'A-bank parallel input, bit 2.',
      'D3A':  'A-bank parallel input, bit 3.',
      'D4A':  'A-bank parallel input, bit 4.',
      'D5A':  'A-bank parallel input, bit 5.',
      'D6A':  'A-bank parallel input, bit 6.',
      'D7A':  'A-bank parallel input, bit 7.',
      'D0B':  'B-bank parallel input, bit 0. Passes through the latch; selected when SEL is HIGH.',
      'D1B':  'B-bank parallel input, bit 1.',
      'D2B':  'B-bank parallel input, bit 2.',
      'D3B':  'B-bank parallel input, bit 3.',
      'D4B':  'B-bank parallel input, bit 4.',
      'D5B':  'B-bank parallel input, bit 5.',
      'D6B':  'B-bank parallel input, bit 6.',
      'D7B':  'B-bank parallel input, bit 7.',
      'SER':  'Serial data input. Enters the first stage when the part shifts.',
      'SEL':  'Bank select. LOW routes the A inputs through the muxes, HIGH routes the latched B inputs.',
      'LE':   'Latch Enable for the B bank. HIGH makes the latch transparent (it follows the B inputs); LOW holds the last B values.',
      'Q7':   'Serial output: the last register stage. Chain it into the SER of the next 835 to extend the register.',
      'GND':  'Ground reference (pin 12).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Why latch one input bank',
        paragraphs: [
          'The part was built for video, where you want to interleave two streams of data into one shift register without extra glue chips. One stream feeds the A inputs, the other feeds the B inputs. SEL picks which stream loads next.',
          'The B inputs run through a transparent latch first. While LE is HIGH the latch is see-through, so the B muxes track the live B inputs. Drop LE LOW and the latch freezes the current B values, so you can capture one stream and hold it while the A stream keeps changing, then switch SEL to load the held copy whenever you need it.',
        ],
      },
      {
        title: 'Load or shift',
        paragraphs: [
          'Everything happens on the rising clock edge. With PE LOW the chip loads: the eight selected bits drop straight into stages 0 through 7. With PE HIGH it shifts: stage 0 takes whatever is on SER, every other stage copies its neighbor, and the bit in stage 7 leaves on Q7.',
          'Only Q7 is brought out, so reading the register means clocking it and watching the bits march out one per edge. To build a 16-bit (or wider) register, wire Q7 of the first chip into SER of the second.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'PEn',  type: 'input'  },
      { pin:  2, name: 'CP',   type: 'input'  },
      { pin:  3, name: 'D4A',  type: 'input'  },
      { pin:  4, name: 'D4B',  type: 'input'  },
      { pin:  5, name: 'D5A',  type: 'input'  },
      { pin:  6, name: 'D5B',  type: 'input'  },
      { pin:  7, name: 'D6A',  type: 'input'  },
      { pin:  8, name: 'D6B',  type: 'input'  },
      { pin:  9, name: 'D7A',  type: 'input'  },
      { pin: 10, name: 'D7B',  type: 'input'  },
      { pin: 11, name: 'Q7',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'SEL',  type: 'input'  },
      { pin: 15, name: 'SER',  type: 'input'  },
      { pin: 16, name: 'D0A',  type: 'input'  },
      { pin: 17, name: 'D0B',  type: 'input'  },
      { pin: 18, name: 'D1A',  type: 'input'  },
      { pin: 19, name: 'D1B',  type: 'input'  },
      { pin: 20, name: 'D2A',  type: 'input'  },
      { pin: 21, name: 'D2B',  type: 'input'  },
      { pin: 22, name: 'D3A',  type: 'input'  },
      { pin: 23, name: 'D3B',  type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'SHIFT_REG_MUX_LATCH_835',
        inputs: ['PEn','CP','SEL','LE','SER',
                 'D0A','D1A','D2A','D3A','D4A','D5A','D6A','D7A',
                 'D0B','D1B','D2B','D3B','D4B','D5B','D6B','D7B'],
        outputs: ['Q7'] },
    ],
  },

  // ── 74841: 10 bit bus-interface D-type latch, TRI (24-pin) ───────────────
  // The '841 is a TRANSPARENT LATCH, not an edge-triggered flip-flop: the
  // control pin (13) is Latch Enable (LE), level-controlled, not a clock. The
  // stub had it mislabeled CLK and described as edge-triggered; corrected here.
  // The 10-bit pin map (bit i on D(pin 2+i) / Q(pin 23-i)) was confirmed
  // correct against the datasheet; only pin 13's name/function was wrong.
  // Source: Texas Instruments, "SN74ALS841, SN74AS841A, SN74ALS842 10-Bit
  //   Bus-Interface D-Type Latches With 3-State Outputs", SDAS059C
  //   (Dec. 1983, rev. Jan. 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als841.pdf. Verified: TOP-VIEW
  //   terminal diagram (OE#=1, 1D..10D=2-11, GND=12, LE=13, 10Q..1Q=14-23,
  //   VCC=24) + SN74ALS841 Function Table (OE#=L,LE=H -> Q=D transparent;
  //   OE#=L,LE=L -> Q holds; OE#=H -> Z) + logic diagram, pages 1-3, read as
  //   rendered PDF page images (issues.md C4), not a text summary.
  //   Engine: width-agnostic D_LATCH_REG_TRI (js/specificChipsSim.js), the
  //   latch twin of the 74x821's D_FF_REG_TRI. Regression:
  //   js/debug/scenarios/74x841-bus-latch.mjs.
  '74x841': {
    name: '74x841',
    simpleName: '10 bit D Latch (TRI)',
    description: '10 bit transparent D type latch with three state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als841.pdf',
    tags: ['latch', 'D type', '10 bit', 'transparent', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x841 is a 10 bit transparent D type latch with tri state outputs. While Latch Enable (LE) is HIGH the outputs follow the D inputs; when LE goes LOW the current bits are held. A separate active LOW output enable puts all ten outputs into high impedance so the chip can share a bus. Disabling the outputs does not disturb the stored bits.',
    guidePinDescriptions: {
      'OEn': 'Output enable (active LOW). LOW drives the bus, HIGH sets all outputs to high impedance. Does not affect stored data.',
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
      'GND': 'Ground reference (pin 12).',
      'LE':  'Latch enable. HIGH makes the latches transparent (Q follows D); a HIGH to LOW transition captures and holds the current data.',
      'Q9':  'Latched output bit 9.',
      'Q8':  'Latched output bit 8.',
      'Q7':  'Latched output bit 7.',
      'Q6':  'Latched output bit 6.',
      'Q5':  'Latched output bit 5.',
      'Q4':  'Latched output bit 4.',
      'Q3':  'Latched output bit 3.',
      'Q2':  'Latched output bit 2.',
      'Q1':  'Latched output bit 1.',
      'Q0':  'Latched output bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Transparent latch vs flip flop',
        paragraphs: [
          'A transparent latch is level controlled, not edge triggered. While LE is HIGH the outputs track the inputs directly. The bits you keep are whatever was present at the instant LE fell to LOW. A flip flop, by contrast, samples only on a clock edge. Use the latch when you want to freeze a bus at a moment in time rather than on a repeating clock.',
        ],
      },
      {
        title: '10 bit bus paths',
        paragraphs: [
          'Ten bits is a common width for a byte plus parity, or for split address and control fields that need two extra bits beyond a byte. The tri state outputs let many such latches share one backplane, each driving it only when its output enable is LOW.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  },
      { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  },
      { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  },
      { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  },
      { pin: 10, name: 'D8',  type: 'input'  },
      { pin: 11, name: 'D9',  type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'LE',  type: 'input'  },
      { pin: 14, name: 'Q9',  type: 'output' },
      { pin: 15, name: 'Q8',  type: 'output' },
      { pin: 16, name: 'Q7',  type: 'output' },
      { pin: 17, name: 'Q6',  type: 'output' },
      { pin: 18, name: 'Q5',  type: 'output' },
      { pin: 19, name: 'Q4',  type: 'output' },
      { pin: 20, name: 'Q3',  type: 'output' },
      { pin: 21, name: 'Q2',  type: 'output' },
      { pin: 22, name: 'Q1',  type: 'output' },
      { pin: 23, name: 'Q0',  type: 'output' },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'D_LATCH_REG_TRI', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','D9','LE','OEn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
    ],
  },

  // ── 74842: 10 bit transparent D-type latch, inverting inputs, TRI (24-pin) ─
  // NOTE: the hand-entered stub called this a "D flip-flop" clocked on pin 13
  // ("CLK"). The datasheet shows it is NOT edge-triggered — it is a 10-bit
  // TRANSPARENT D LATCH whose control pin 13 is LE (Latch Enable), level-
  // sensitive. Fixed here (issues.md C2, the CD4082 pinout lesson: verify, don't
  // trust the stub). The '842 differs from the non-inverting '841 only in that
  // its D inputs are inverting: while LE is HIGH, Q = NOT D (transparent);
  // when LE goes LOW the word is held. OEn (active LOW) gates the 3-state
  // outputs without disturbing the stored data.
  //
  // Source: Texas Instruments, "SN74ALS841, SN74AS841A, SN74ALS842 10-Bit
  //   Bus-Interface D-Type Latches With 3-State Outputs", SDAS059C (Dec 1983,
  //   revised Jan 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als841.pdf. Verified: DW/NT 24-pin
  //   DIP terminal assignment (top view) for BOTH the '841 and the '842, the
  //   SN74ALS842 function table, the logic symbol and the positive-logic logic
  //   diagram, pages 1-3, read as rendered ~300-dpi PDF page images (NOT the
  //   WebFetch text summary, per issues.md C4). '842 pinout (identical to the
  //   '841): OE=1, 1D..10D=2..11, GND=12, LE=13, 10Q..1Q=14..23, VCC=24 — so
  //   D0(1D)=2..D9(10D)=11, Q9(10Q)=14..Q0(1Q)=23. The standalone SN74ALS842
  //   sheet is withdrawn from ti.com (the sn74als842.pdf symlink 404s); this
  //   combined 841/842-family sheet is the authoritative source and documents
  //   the '842 in full (function table + logic diagram show its inverting D).
  //   SN74ALS842 function table (per datasheet): OE=L,LE=H,D=H → Q=L;
  //   OE=L,LE=H,D=L → Q=H; OE=L,LE=L → Q holds; OE=H → Q=Z. i.e. Q = NOT D
  //   while transparent (gate.invert:true on the shared D_LATCH_REG_TRI).
  '74x842': {
    name: '74x842',
    simpleName: '10 bit D-Latch, Inv In (TRI)',
    description: '10-bit inverting transparent D latch, 3-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als841.pdf',
    tags: ['latch', 'D type', '10 bit', 'inverting', 'tri state', 'bus'],
    sequential: true,
    guideOverview: 'The 74x842 is a 10 bit transparent D latch with inverting inputs and three state outputs. It is the inverting version of the 74x841. While the latch enable (LE) is HIGH the outputs follow the inputs, but inverted: each Q is the opposite of its D input. When LE goes LOW the ten bits are held. The output enable (OEn, active LOW) switches the outputs between driving the bus and a high impedance state; it does not change the stored bits, so data can be captured while the outputs are off.',
    guidePinDescriptions: {
      'OEn': 'Output enable (active LOW). LOW drives the outputs; HIGH sets them to high impedance without changing the stored bits.',
      'D0':  'Data input bit 0 (inverting).',
      'D1':  'Data input bit 1 (inverting).',
      'D2':  'Data input bit 2 (inverting).',
      'D3':  'Data input bit 3 (inverting).',
      'D4':  'Data input bit 4 (inverting).',
      'D5':  'Data input bit 5 (inverting).',
      'D6':  'Data input bit 6 (inverting).',
      'D7':  'Data input bit 7 (inverting).',
      'D8':  'Data input bit 8 (inverting).',
      'D9':  'Data input bit 9 (inverting).',
      'GND': 'Ground reference (pin 12).',
      'LE':  'Latch enable. HIGH makes the latches transparent (each Q follows the opposite of its D input); LOW holds the stored bits.',
      'Q9':  'Latched output bit 9.',
      'Q8':  'Latched output bit 8.',
      'Q7':  'Latched output bit 7.',
      'Q6':  'Latched output bit 6.',
      'Q5':  'Latched output bit 5.',
      'Q4':  'Latched output bit 4.',
      'Q3':  'Latched output bit 3.',
      'Q2':  'Latched output bit 2.',
      'Q1':  'Latched output bit 1.',
      'Q0':  'Latched output bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Transparent latch vs. flip-flop',
        paragraphs: [
          'A transparent latch is not edge-triggered. While LE is HIGH the outputs track the inputs continuously, so a change on a D input passes straight through (inverted, on this part). Only when LE goes LOW does the chip freeze the current word. A D flip-flop, by contrast, samples its inputs only on the clock edge and ignores them the rest of the time.',
        ],
      },
      {
        title: 'Why an inverting variant',
        paragraphs: [
          'The 74x842 stores the complement of its inputs, which matches the active-LOW signalling common on control and address buses. Using it there can save a separate inverter chip. It is otherwise identical to the non-inverting 74x841.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'D0',  type: 'input'  },
      { pin:  3, name: 'D1',  type: 'input'  },
      { pin:  4, name: 'D2',  type: 'input'  },
      { pin:  5, name: 'D3',  type: 'input'  },
      { pin:  6, name: 'D4',  type: 'input'  },
      { pin:  7, name: 'D5',  type: 'input'  },
      { pin:  8, name: 'D6',  type: 'input'  },
      { pin:  9, name: 'D7',  type: 'input'  },
      { pin: 10, name: 'D8',  type: 'input'  },
      { pin: 11, name: 'D9',  type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'LE',  type: 'input'  },
      { pin: 14, name: 'Q9',  type: 'output' },
      { pin: 15, name: 'Q8',  type: 'output' },
      { pin: 16, name: 'Q7',  type: 'output' },
      { pin: 17, name: 'Q6',  type: 'output' },
      { pin: 18, name: 'Q5',  type: 'output' },
      { pin: 19, name: 'Q4',  type: 'output' },
      { pin: 20, name: 'Q3',  type: 'output' },
      { pin: 21, name: 'Q2',  type: 'output' },
      { pin: 22, name: 'Q1',  type: 'output' },
      { pin: 23, name: 'Q0',  type: 'output' },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      // Shares the width-agnostic transparent-latch D_LATCH_REG_TRI engine with
      // the non-inverting 74x841; invert:true makes each stored bit Q = NOT D
      // (the '842). Input order the primitive expects: [D0..D9, LE, OEn].
      { type: 'D_LATCH_REG_TRI', invert: true, inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','D9','LE','OEn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9'] },
    ],
  },

  // ── 74843: 9-bit transparent D latch, CLRn + PREn, TRI (24-pin) ─────────
  // Source: Texas Instruments, "SN74ALS843 9-Bit Bus-Interface D-Type Latch
  //   With 3-State Outputs", SDAS232A (Dec 1983, rev Jan 1995).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als843.pdf.
  //   Verified: DW/NT terminal assignment, function table, and logic diagram,
  //   pages 1-2, read as PDF page images. The part is a level-sensitive
  //   transparent latch (LE, not a clock edge), NOT a flip-flop; controls are
  //   OE/PRE/CLR all active LOW. The hand-entered stub was wrong (it named a
  //   CLK, an active-HIGH SET, and the wrong pin order) — pinout corrected here.
  '74x843': {
    name: '74x843',
    simpleName: '9-bit D latch, CLRn+PREn (TRI)',
    description: '9-bit transparent D latch, async clear + preset, 3-state out (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als843.pdf',
    tags: ['latch', 'D type', '9 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x843 is a bank of nine transparent D latches with three-state outputs, meant for driving buses directly. While LE is HIGH the outputs follow the D inputs; when LE goes LOW each bit holds whatever it last saw. Two asynchronous overrides ignore LE: PREn LOW forces all outputs HIGH, and CLRn LOW forces them LOW. OEn controls only the output buffers — HIGH puts the outputs in high impedance without disturbing the stored bits.',
    guidePinDescriptions: {
      'OEn':  'Output enable, active LOW. HIGH puts all Q outputs in high impedance; the stored data is unaffected.',
      'CLRn': 'Asynchronous clear, active LOW. Forces all outputs LOW regardless of LE.',
      'PREn': 'Asynchronous preset, active LOW. Forces all outputs HIGH; overrides CLRn.',
      'LE':   'Latch enable. HIGH makes the latches transparent (Q follows D); LOW holds the last data.',
      'D0':   'Data input bit 0.',
      'D1':   'Data input bit 1.',
      'D2':   'Data input bit 2.',
      'D3':   'Data input bit 3.',
      'D4':   'Data input bit 4.',
      'D5':   'Data input bit 5.',
      'D6':   'Data input bit 6.',
      'D7':   'Data input bit 7.',
      'D8':   'Data input bit 8.',
      'GND':  'Ground reference (pin 12).',
      'Q8':   'Latched output bit 8.',
      'Q7':   'Latched output bit 7.',
      'Q6':   'Latched output bit 6.',
      'Q5':   'Latched output bit 5.',
      'Q4':   'Latched output bit 4.',
      'Q3':   'Latched output bit 3.',
      'Q2':   'Latched output bit 2.',
      'Q1':   'Latched output bit 1.',
      'Q0':   'Latched output bit 0.',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Transparent latch, not a flip-flop',
        paragraphs: [
          'Because LE is a level, not an edge, the outputs track D the whole time LE is HIGH. Data is captured at the moment LE falls. This differs from an edge-triggered register, which samples only on a clock transition and ignores D the rest of the time.',
        ],
      },
      {
        title: 'Preset and clear override the latch',
        paragraphs: [
          'PREn and CLRn act immediately and do not wait for LE. Pull CLRn LOW to zero every bit, or PREn LOW to set every bit HIGH. If both are LOW at once, preset wins and the outputs go HIGH.',
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
      { type: 'LATCH_9BIT_PRE_CLR_TRI', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','LE','OEn','CLRn','PREn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

  // ── 74844: 9-bit transparent D latch, CLRn + PREn, inverting, TRI (24-pin) ─
  // Source: Texas Instruments, "SN74ABT843 9-Bit Bus-Interface D-Type Latches
  //   With 3-State Outputs", SCBS197D (Feb 1991, revised May 1997). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn74abt843.pdf. Verified:
  //   DW/JT/N/NT 24-pin terminal assignment and the function table, pages 1-2,
  //   read as rendered ~300-dpi PDF page images (NOT the WebFetch text summary,
  //   per issues.md C4). The '843/'844 are the 9-bit members of the 841-848
  //   bus-interface latch family and share one pinout: OE=1, 1D..9D=2..10,
  //   CLR=11, GND=12, LE=13, PRE=14, 9Q..1Q=15..23, VCC=24. So D0(1D)=2..
  //   D8(9D)=10 and Q8(9Q)=15..Q0(1Q)=23. All of OE, CLR, PRE are active LOW;
  //   LE is level-sensitive (HIGH = transparent), NOT an edge clock.
  //   The '844 is the inverting-output member: TI's family naming pairs a
  //   non-inverting part with an inverting one (841 non-inv / 842 inv; 843 non-
  //   inv / 844 inv), confirmed against the 7400-series family list
  //   (en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits) and the
  //   NXP/Philips 74F841-846 family sheet. The standalone SN74ALS844 sheet is
  //   withdrawn from ti.com (sn74als844.pdf 404s), so the '843 sheet is the
  //   authoritative source for the shared latch core and pinout; the '844
  //   differs only by an inverting output buffer, so its function table is the
  //   '843 table with the Q column inverted: PRE=L → Q=L, CLR=L → Q=H,
  //   transparent Q = NOT D, OE=H → Z. Modeled as gate.invert:true on the shared
  //   LATCH_9BIT_PRE_CLR_TRI primitive. The hand-entered stub was wrong (it named
  //   a CLK, an active-HIGH SET, and the wrong pin order) — pinout corrected here.
  '74x844': {
    name: '74x844',
    simpleName: '9-bit D latch, CLRn+PREn, inverting (TRI)',
    description: '9-bit transparent D latch, async clear/preset, inverting 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74abt843.pdf',
    tags: ['latch', 'D type', '9 bit', 'inverting', 'tri state', 'bus'],
    sequential: true,
    guideOverview: 'The 74x844 is a bank of nine transparent D latches with inverting three-state outputs — the inverting version of the 74x843. While LE is HIGH the outputs follow the D inputs but inverted: each Q is the opposite of its D. When LE goes LOW each bit holds its last value. Two asynchronous overrides ignore LE: CLRn LOW forces all outputs HIGH, and PREn LOW forces them LOW (preset overrides clear). OEn controls only the output buffers — HIGH puts the outputs in high impedance without disturbing the stored bits.',
    guidePinDescriptions: {
      'OEn':  'Output enable, active LOW. HIGH puts all Q outputs in high impedance; the stored data is unaffected.',
      'CLRn': 'Asynchronous clear, active LOW. Forces all outputs HIGH regardless of LE (the outputs invert, so a cleared internal bit reads HIGH).',
      'PREn': 'Asynchronous preset, active LOW. Forces all outputs LOW; overrides CLRn.',
      'LE':   'Latch enable. HIGH makes the latches transparent (Q follows the inverse of D); LOW holds the last data.',
      'D0':   'Data input bit 0.',
      'D1':   'Data input bit 1.',
      'D2':   'Data input bit 2.',
      'D3':   'Data input bit 3.',
      'D4':   'Data input bit 4.',
      'D5':   'Data input bit 5.',
      'D6':   'Data input bit 6.',
      'D7':   'Data input bit 7.',
      'D8':   'Data input bit 8.',
      'GND':  'Ground reference (pin 12).',
      'Q8':   'Latched inverting output bit 8.',
      'Q7':   'Latched inverting output bit 7.',
      'Q6':   'Latched inverting output bit 6.',
      'Q5':   'Latched inverting output bit 5.',
      'Q4':   'Latched inverting output bit 4.',
      'Q3':   'Latched inverting output bit 3.',
      'Q2':   'Latched inverting output bit 2.',
      'Q1':   'Latched inverting output bit 1.',
      'Q0':   'Latched inverting output bit 0.',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Transparent latch, not a flip-flop',
        paragraphs: [
          'Because LE is a level, not an edge, the outputs track D the whole time LE is HIGH. Data is captured at the moment LE falls. This differs from an edge-triggered register, which samples only on a clock transition and ignores D the rest of the time.',
        ],
      },
      {
        title: '74x843 vs 74x844',
        paragraphs: [
          'Same latch, same controls, opposite output polarity. On the 843 a stored 1 reads HIGH; on the 844 it reads LOW, because the output stage inverts. This also flips the async overrides: on the 844, CLRn drives the outputs HIGH and PREn drives them LOW. Pick the variant that matches the active level of the logic around it and you save an inverter.',
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
      { type: 'LATCH_9BIT_PRE_CLR_TRI', invert: true, inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','LE','OEn','CLRn','PREn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

  // ── 74845: 8-bit bus-interface transparent D latch, CLR+PRE, 3 output ───
  //           controls, 3-state (24-pin) ───────────────────────────────────
  // NOTE: the original stub was wrong. It described this part as an edge-
  // triggered "D flip-flop" with a single OE and a CLK on pin 13, and put the
  // control pins at 2/3. The real part is a level-sensitive TRANSPARENT LATCH
  // (like its 9-bit sibling '843), pin 13 is the latch-enable C (not a clock),
  // and it has THREE output-control pins OC1/OC2/OC3 (pins 1, 2, 23). Pinout,
  // pin names, and behavior below were all re-derived from the datasheet.
  // Source: Texas Instruments, "SN54ALS845/AS845/ALS846/AS846, SN74ALS845/
  //   AS845/ALS846/AS846 — 8-Bit Bus-Interface D-Type Latches With 3-State
  //   Outputs", doc D2825 (Dec 1983, rev Apr 1986), in "The TTL Data Book,
  //   Volume 3: Advanced Low-Power Schottky, Advanced Schottky" (1986).
  //   Verified: terminal assignment (DW/JT/NT 24-pin package, from the logic
  //   symbol/diagram pin numbers) + function table, pages 2-671/2-672, read as
  //   300-dpi PDF text extraction (pdftotext -layout). The standalone TI
  //   symlink datasheet (sn74als845.pdf) is 404 / withdrawn, so the databook
  //   is the authority here.
  // Cross-checked against the still-published 9-bit sibling for the identical
  //   latch core / control polarities: Texas Instruments, "SN74ALS843 — 9-Bit
  //   Bus-Interface D-Type Latch With 3-State Outputs", SDAS232A (Dec 1983,
  //   rev Jan 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als843.pdf. Verified: pinout +
  //   function table, page 1, read as PDF page images.
  '74x845': {
    name: '74x845',
    simpleName: '8-bit D latch w/ CLR+PRE (TRI)',
    description: '8-bit transparent D latch: async clear/preset, 3 OC pins, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als843.pdf',
    tags: ['latch', 'D type', '8 bit', 'transparent', 'tri state', 'bus interface'],
    sequential: true,
    guideOverview: 'The 74x845 is a byte-wide transparent D latch built to drive a bus directly. When the enable LE is HIGH the eight outputs follow the eight D inputs; when LE goes LOW the last values are held. Two asynchronous overrides ignore LE entirely: CLRn LOW forces every output to 0, PREn LOW forces every output to 1, and if both are LOW at once preset wins. Three separate output-control pins (OC1, OC2, OC3) put the outputs in high-impedance; all three must be LOW to drive the bus.',
    guidePinDescriptions: {
      'OC1':  'Output control 1 (active LOW). Outputs drive only when OC1, OC2 and OC3 are all LOW.',
      'OC2':  'Output control 2 (active LOW). Any output control HIGH forces all outputs to high-impedance.',
      'OC3':  'Output control 3 (active LOW). The three controls are independent, so three sources can each hold the bus off.',
      'CLRn': 'Asynchronous clear (active LOW). LOW forces all outputs to 0 regardless of LE.',
      'PREn': 'Asynchronous preset (active LOW). LOW forces all outputs to 1. If CLRn is also LOW, preset wins.',
      'LE':   'Latch enable (level-sensitive). HIGH: outputs follow D (transparent). LOW: outputs hold. This is not an edge clock.',
      'D0':   'Data input bit 0 (pin 3).',
      'D1':   'Data input bit 1.',
      'D2':   'Data input bit 2.',
      'D3':   'Data input bit 3.',
      'D4':   'Data input bit 4.',
      'D5':   'Data input bit 5.',
      'D6':   'Data input bit 6.',
      'D7':   'Data input bit 7 (pin 10).',
      'GND':  'Ground reference (pin 12).',
      'Q7':   'Latched output bit 7 (pin 15).',
      'Q6':   'Latched output bit 6.',
      'Q5':   'Latched output bit 5.',
      'Q4':   'Latched output bit 4.',
      'Q3':   'Latched output bit 3.',
      'Q2':   'Latched output bit 2.',
      'Q1':   'Latched output bit 1.',
      'Q0':   'Latched output bit 0 (pin 22).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Latch, not a flip-flop',
        paragraphs: [
          'LE is a level, not an edge. While LE is HIGH the latch is transparent: whatever is on D shows up on Q, and Q keeps tracking D as it changes. The moment LE drops LOW, Q freezes at the value D held right then. A true flip-flop only samples D on the clock edge; this part samples the whole time LE is HIGH. That difference matters if D is still settling when you close the latch.',
        ],
      },
      {
        title: 'Clear, preset, and the bus controls',
        paragraphs: [
          'CLRn and PREn are asynchronous: they act the instant they go LOW, no matter what LE or D are doing, which is what makes them useful for putting a bus register into a known state at power-up. Preset outranks clear, so pulling both LOW gives all-1s.',
          'The three output controls (OC1, OC2, OC3) only gate the output buffers, never the stored data. Take any one HIGH and the outputs go high-impedance while the latch quietly keeps its value; drop all three LOW and the held value drives the bus again. Wiring three different enable sources to the three pins lets any of them park the chip off the bus without an external AND gate.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OC1',  type: 'input'  },
      { pin:  2, name: 'OC2',  type: 'input'  },
      { pin:  3, name: 'D0',   type: 'input'  },
      { pin:  4, name: 'D1',   type: 'input'  },
      { pin:  5, name: 'D2',   type: 'input'  },
      { pin:  6, name: 'D3',   type: 'input'  },
      { pin:  7, name: 'D4',   type: 'input'  },
      { pin:  8, name: 'D5',   type: 'input'  },
      { pin:  9, name: 'D6',   type: 'input'  },
      { pin: 10, name: 'D7',   type: 'input'  },
      { pin: 11, name: 'CLRn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'PREn', type: 'input'  },
      { pin: 15, name: 'Q7',   type: 'output' },
      { pin: 16, name: 'Q6',   type: 'output' },
      { pin: 17, name: 'Q5',   type: 'output' },
      { pin: 18, name: 'Q4',   type: 'output' },
      { pin: 19, name: 'Q3',   type: 'output' },
      { pin: 20, name: 'Q2',   type: 'output' },
      { pin: 21, name: 'Q1',   type: 'output' },
      { pin: 22, name: 'Q0',   type: 'output' },
      { pin: 23, name: 'OC3',  type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'LATCH_8BIT_PRE_CLR_OC3_TRI', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','LE','OC1','OC2','OC3','CLRn','PREn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
    ],
  },

  // ── 74846: 8-bit inverting bus-interface transparent D latch, CLR+PRE, 3 OC, TRI (24-pin)
  // Stub correction: the old stub described this as an edge-triggered "D flip-flop"
  // with a single OE and a CLK on pin 13, control pins at 2/3, and NC on 14/23.
  // That is wrong on every count. The real '846 is the INVERTING twin of the '845:
  // a level-sensitive TRANSPARENT LATCH. Pin 13 is the latch-enable C (a level, not
  // a clock); it has THREE output-control pins OC1/OC2/OC3 (pins 1, 2, 23); CLR is on
  // pin 11 and PRE on pin 14 — there are no NC pins. "Inverting" means the output
  // buffer inverts the stored bit (Q = NOT D when transparent); the asynchronous
  // controls are NOT inverted — CLR still forces the outputs LOW and PRE still forces
  // them HIGH, exactly as on the non-inverting '845. Pinout, pin names, and behavior
  // below were re-derived from the datasheet.
  // Source: Advanced Micro Devices, "Am29841 through Am29846 — High Performance Bus
  //   Interface Latches", in "1985 AMD Bipolar Microprocessor Logic and Interface Data
  //   Book". [Online]. Available: http://www.bitsavers.org/components/amd/_dataBooks/
  //   1985_AMD_Bipolar_Microprocessor_Logic_and_Interface.pdf. Verified: Am29845/
  //   Am29846 8-bit connection diagram (24-pin DIP pin numbers from the metallization/
  //   pad layout), pin descriptions, and both function tables (non-inverting 41/43/45
  //   and inverting 42/44/46), pages 8-49 to 8-52, read as extracted PDF text. AMD is
  //   the JEDEC-standard originator of this family and its book covers the inverting
  //   '846 explicitly, so it is the authority here; the standalone TI symlink
  //   sn74als846.pdf is 404 / withdrawn.
  // Cross-checked for the latch core / control polarities against the still-published
  //   9-bit sibling: Texas Instruments, "SN74ALS843 — 9-Bit Bus-Interface D-Type Latch
  //   With 3-State Outputs", SDAS232A (Dec 1983, rev Jan 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als843.pdf. Verified: pinout + function
  //   table, page 1, read as PDF page images. Also cross-checked against the Philips/
  //   NXP 74F846 description (inverted-output version, three output enables, MR/PRE).
  '74x846': {
    name: '74x846',
    simpleName: '8-bit inverting D latch w/ CLR+PRE (TRI)',
    description: '8-bit inverting transparent D latch: clear/preset, 3-state, 3 OCs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als843.pdf',
    tags: ['latch', 'D type', '8 bit', 'inverting', 'transparent', 'tri state', 'bus interface'],
    sequential: true,
    guideOverview: 'The 74x846 is the inverting version of the 74x845: a byte-wide transparent D latch that drives a bus directly, with the outputs flipped. When the enable LE is HIGH the eight outputs follow the inverse of the eight D inputs (D LOW gives Q HIGH); when LE goes LOW the last values are held. Two asynchronous overrides ignore LE entirely: CLRn LOW forces every output to 0, PREn LOW forces every output to 1, and if both are LOW at once preset wins. Note that only the data path is inverted here — CLRn and PREn drive the outputs the same direction as on the non-inverting part. Three separate output-control pins (OC1, OC2, OC3) put the outputs in high-impedance; all three must be LOW to drive the bus.',
    guidePinDescriptions: {
      'OC1':  'Output control 1 (active LOW). Outputs drive only when OC1, OC2 and OC3 are all LOW.',
      'OC2':  'Output control 2 (active LOW). Any output control HIGH forces all outputs to high-impedance.',
      'OC3':  'Output control 3 (active LOW). The three controls are independent, so three sources can each hold the bus off.',
      'CLRn': 'Asynchronous clear (active LOW). LOW forces all outputs to 0 regardless of LE or D.',
      'PREn': 'Asynchronous preset (active LOW). LOW forces all outputs to 1. If CLRn is also LOW, preset wins.',
      'LE':   'Latch enable (level-sensitive). HIGH: outputs follow the inverse of D (transparent). LOW: outputs hold. This is not an edge clock.',
      'D0':   'Data input bit 0 (pin 3).',
      'D1':   'Data input bit 1.',
      'D2':   'Data input bit 2.',
      'D3':   'Data input bit 3.',
      'D4':   'Data input bit 4.',
      'D5':   'Data input bit 5.',
      'D6':   'Data input bit 6.',
      'D7':   'Data input bit 7 (pin 10).',
      'GND':  'Ground reference (pin 12).',
      'Q7':   'Inverted latched output bit 7 (pin 15).',
      'Q6':   'Inverted latched output bit 6.',
      'Q5':   'Inverted latched output bit 5.',
      'Q4':   'Inverted latched output bit 4.',
      'Q3':   'Inverted latched output bit 3.',
      'Q2':   'Inverted latched output bit 2.',
      'Q1':   'Inverted latched output bit 1.',
      'Q0':   'Inverted latched output bit 0 (pin 22).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Latch, not a flip-flop',
        paragraphs: [
          'LE is a level, not an edge. While LE is HIGH the latch is transparent: whatever is on D shows up inverted on Q, and Q keeps tracking D as it changes. The moment LE drops LOW, Q freezes at the value it held right then. A true flip-flop only samples D on the clock edge; this part samples the whole time LE is HIGH.',
        ],
      },
      {
        title: 'What "inverting" does and does not touch',
        paragraphs: [
          'Only the data path is inverted. When the latch is transparent, Q is the complement of D, so a byte of 0x00 on the inputs reads back as 0xFF on the outputs. This saves an external inverter bank on an active-LOW bus.',
          'The asynchronous controls are not inverted. CLRn LOW still pulls every output to 0 and PREn LOW still drives every output to 1, the same directions as on the non-inverting 74x845, and preset still outranks clear. Both act the instant they go LOW regardless of LE or D, which is what makes them useful for forcing a bus register to a known state at power-up.',
        ],
      },
      {
        title: 'The three bus controls',
        paragraphs: [
          'OC1, OC2 and OC3 only gate the output buffers, never the stored data. Take any one HIGH and the outputs go high-impedance while the latch quietly keeps its value; drop all three LOW and the held value drives the bus again. Wiring three different enable sources to the three pins lets any of them park the chip off the bus without an external AND gate.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OC1',  type: 'input'  },
      { pin:  2, name: 'OC2',  type: 'input'  },
      { pin:  3, name: 'D0',   type: 'input'  },
      { pin:  4, name: 'D1',   type: 'input'  },
      { pin:  5, name: 'D2',   type: 'input'  },
      { pin:  6, name: 'D3',   type: 'input'  },
      { pin:  7, name: 'D4',   type: 'input'  },
      { pin:  8, name: 'D5',   type: 'input'  },
      { pin:  9, name: 'D6',   type: 'input'  },
      { pin: 10, name: 'D7',   type: 'input'  },
      { pin: 11, name: 'CLRn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'PREn', type: 'input'  },
      { pin: 15, name: 'Q7',   type: 'output' },
      { pin: 16, name: 'Q6',   type: 'output' },
      { pin: 17, name: 'Q5',   type: 'output' },
      { pin: 18, name: 'Q4',   type: 'output' },
      { pin: 19, name: 'Q3',   type: 'output' },
      { pin: 20, name: 'Q2',   type: 'output' },
      { pin: 21, name: 'Q1',   type: 'output' },
      { pin: 22, name: 'Q0',   type: 'output' },
      { pin: 23, name: 'OC3',  type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'LATCH_8BIT_PRE_CLR_OC3_TRI', invert: true, inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','LE','OC1','OC2','OC3','CLRn','PREn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
    ],
  },

  // ── 74848: 8 to 3 priority encoder (glitch less), TRI (16-pin) ───────────
  /* Primary source: Texas Instruments, 74848 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls848.pdf
     https://en.wikipedia.org/wiki/Priority_encoder */
  // Same pinout and behavior as 74348 reuses PRIORITY_ENC_8TO3_TRI gate type.
  '74x848': {
    name: '74x848',
    simpleName: '8 to 3 Priority Encoder (Glitch Less, TRI)',
    description: '8-to-3 priority encoder, glitchless, 3-state outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls848.pdf',
    tags: ['encoder', 'priority', '8 to 3', 'tri state'],
    guideOverview: 'The 74x848 is an 8 to 3 priority encoder with active LOW encoded outputs and cascade pins. It chooses the highest priority active input and reports its binary index on A2n, A1n, and A0n. GS and EO support expansion to wider request sets.',
    guidePinDescriptions: {
      'I4':  'Priority input 4.',
      'I5':  'Priority input 5.',
      'I6':  'Priority input 6.',
      'I7':  'Priority input 7 (highest priority).',
      'EIn': 'Enable input (active LOW).',
      'A2n': 'Encoded output bit 2 (active LOW).',
      'A1n': 'Encoded output bit 1 (active LOW).',
      'GND': 'Ground reference (pin 8).',
      'A0n': 'Encoded output bit 0 (active LOW).',
      'GS':  'Group select status output.',
      'EO':  'Enable output for cascading priority stages.',
      'I3':  'Priority input 3.',
      'I2':  'Priority input 2.',
      'I1':  'Priority input 1.',
      'I0':  'Priority input 0 (lowest priority).',
      'VCC': 'Positive supply (+5 V, pin 16).',
    },
    guideSections: [
      {
        title: 'Priority Encoding and Cascading',
        paragraphs: [
          'Priority encoders resolve simultaneous requests by rank, not by first arrival timing. Cascading outputs allow multiple chips to build larger arbitration trees.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Interrupt request ranking',
          'Bus arbitration request compression',
          'Keyboard and event matrix encoding',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'I4',  type: 'input'  },
      { pin:  2, name: 'I5',  type: 'input'  },
      { pin:  3, name: 'I6',  type: 'input'  },
      { pin:  4, name: 'I7',  type: 'input'  },
      { pin:  5, name: 'EIn', type: 'input'  },
      { pin:  6, name: 'A2n', type: 'output' },
      { pin:  7, name: 'A1n', type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'A0n', type: 'output' },
      { pin: 10, name: 'GS',  type: 'output' },
      { pin: 11, name: 'EO',  type: 'output' },
      { pin: 12, name: 'I3',  type: 'input'  },
      { pin: 13, name: 'I2',  type: 'input'  },
      { pin: 14, name: 'I1',  type: 'input'  },
      { pin: 15, name: 'I0',  type: 'input'  },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [{
      type: 'PRIORITY_ENC_8TO3_TRI',
      inputs:  ['I0','I1','I2','I3','I4','I5','I6','I7','EIn'],
      outputs: ['A0n','A1n','A2n','GS','EO'],
    }],
  },

};