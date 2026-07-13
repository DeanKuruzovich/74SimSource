// chips65.js Block 65: 74x9135 .. 74120 (15 chips)
// Implementable: 74x9135 (nine-wide buffer OC), 74x9240 (9 bit inv tri state),
//   74x9244 (9 bit non-inv tri state), 74x9541 (8 bit dual-OE buffer)
// Stubs: 74x9164, 74x9245, 74x9323, 74x9595, 74x40102, 74x40103,
//   74x40104, 74x40105, 74116, 74119, 74120
// NOTE: 7453 omitted already implemented in chips8.js

export const CHIPS_BLOCK_65 = {

  // ═══════════════════════════════════════════════════════════════════════
  // IMPLEMENTABLE
  // ═══════════════════════════════════════════════════════════════════════

  // ── 74x9135: Nine-wide buffer, non inverting, open collector (20-pin) ─
  /* Primary source: 74x9135 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Open_collector */
  '74x9135': {
    name: '74x9135',
    simpleName: 'Nine-Wide Buffer OC',
    description: 'Nine-wide non inverting buffer with open collector outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    openCollector: true,
    datasheet: '',
    tags: ['buffer', 'nine-wide', 'open collector'],
    guideOverview: 'The 74x9135 is a nine wide non inverting buffer with open collector outputs, useful when you need to buffer a wide control word while retaining the ability to share pull up lines or create wired AND logic. Each of the nine inputs passes through to its corresponding open collector output, which can only pull LOW actively; an external pull up resistor is required to produce a HIGH level. The nine bit width conveniently handles a data byte plus a parity or control bit in one package.',
    pinout: [
      { pin:  1, name: 'A1', type: 'input'  },
      { pin:  2, name: 'A2', type: 'input'  },
      { pin:  3, name: 'A3', type: 'input'  },
      { pin:  4, name: 'A4', type: 'input'  },
      { pin:  5, name: 'A5', type: 'input'  },
      { pin:  6, name: 'A6', type: 'input'  },
      { pin:  7, name: 'A7', type: 'input'  },
      { pin:  8, name: 'A8', type: 'input'  },
      { pin:  9, name: 'A9', type: 'input'  },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'Y9', type: 'output' },
      { pin: 12, name: 'Y8', type: 'output' },
      { pin: 13, name: 'Y7', type: 'output' },
      { pin: 14, name: 'Y6', type: 'output' },
      { pin: 15, name: 'Y5', type: 'output' },
      { pin: 16, name: 'Y4', type: 'output' },
      { pin: 17, name: 'Y3', type: 'output' },
      { pin: 18, name: 'Y2', type: 'output' },
      { pin: 19, name: 'Y1', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'BUFFER', inputs: ['A1'], output: 'Y1' },
      { type: 'BUFFER', inputs: ['A2'], output: 'Y2' },
      { type: 'BUFFER', inputs: ['A3'], output: 'Y3' },
      { type: 'BUFFER', inputs: ['A4'], output: 'Y4' },
      { type: 'BUFFER', inputs: ['A5'], output: 'Y5' },
      { type: 'BUFFER', inputs: ['A6'], output: 'Y6' },
      { type: 'BUFFER', inputs: ['A7'], output: 'Y7' },
      { type: 'BUFFER', inputs: ['A8'], output: 'Y8' },
      { type: 'BUFFER', inputs: ['A9'], output: 'Y9' },
    ],
  },

  // ── 74x9240: 9 bit inverting buffer / line driver, tri state (24-pin) ─
  /* Primary source: 74x9240 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Three-state_logic */
  '74x9240': {
    name: '74x9240',
    simpleName: '9 bit Inv Buffer (TRI)',
    description: '9 bit inverting buffer / line driver with three-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['buffer', 'driver', '9 bit', 'inverting', 'tri state'],
    guideOverview: 'The 74x9240 is a 9 bit inverting buffer and line driver with 3-state outputs. Each input is logically inverted on its way to the corresponding output. Output enable (active LOW) places all nine outputs in high Z simultaneously. The nine bit width covers a full byte plus a parity bit in one package, which is convenient for backplane bus drivers where stronger drive current and defined propagation delay matter.',
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'A6',  type: 'input'  },
      { pin:  8, name: 'A7',  type: 'input'  },
      { pin:  9, name: 'A8',  type: 'input'  },
      { pin: 10, name: 'A9',  type: 'input'  },
      { pin: 11, name: 'NC1', type: 'nc'     },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'Y9',  type: 'output' },
      { pin: 14, name: 'Y8',  type: 'output' },
      { pin: 15, name: 'Y7',  type: 'output' },
      { pin: 16, name: 'Y6',  type: 'output' },
      { pin: 17, name: 'Y5',  type: 'output' },
      { pin: 18, name: 'Y4',  type: 'output' },
      { pin: 19, name: 'Y3',  type: 'output' },
      { pin: 20, name: 'Y2',  type: 'output' },
      { pin: 21, name: 'Y1',  type: 'output' },
      { pin: 22, name: 'NC2', type: 'nc'     },
      { pin: 23, name: 'NC3', type: 'nc'     },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'TRI_NOT_LO', inputs: ['A1', 'OEn'], output: 'Y1' },
      { type: 'TRI_NOT_LO', inputs: ['A2', 'OEn'], output: 'Y2' },
      { type: 'TRI_NOT_LO', inputs: ['A3', 'OEn'], output: 'Y3' },
      { type: 'TRI_NOT_LO', inputs: ['A4', 'OEn'], output: 'Y4' },
      { type: 'TRI_NOT_LO', inputs: ['A5', 'OEn'], output: 'Y5' },
      { type: 'TRI_NOT_LO', inputs: ['A6', 'OEn'], output: 'Y6' },
      { type: 'TRI_NOT_LO', inputs: ['A7', 'OEn'], output: 'Y7' },
      { type: 'TRI_NOT_LO', inputs: ['A8', 'OEn'], output: 'Y8' },
      { type: 'TRI_NOT_LO', inputs: ['A9', 'OEn'], output: 'Y9' },
    ],
  },

  // ── 74x9244: 9 bit non inverting buffer / line driver, tri state (24-pin)
  /* Primary source: 74x9244 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Three-state_logic */
  '74x9244': {
    name: '74x9244',
    simpleName: '9 bit Buffer (TRI)',
    description: '9 bit non inverting buffer / line driver with three-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['buffer', 'driver', '9 bit', 'non inverting', 'tri state'],
    guideOverview: 'The 74x9244 is a 9 bit non inverting buffer and line driver with 3-state outputs. Each input passes through to the corresponding output without inversion. Output enable (active LOW) places all nine outputs in high Z simultaneously. The nine bit width carries a byte plus an extra parity or status bit in one package, making it a natural fit for byte wide bus buffers that also need to pass parity information on a shared backplane.',
    pinout: [
      { pin:  1, name: 'OEn', type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'A6',  type: 'input'  },
      { pin:  8, name: 'A7',  type: 'input'  },
      { pin:  9, name: 'A8',  type: 'input'  },
      { pin: 10, name: 'A9',  type: 'input'  },
      { pin: 11, name: 'NC1', type: 'nc'     },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'Y9',  type: 'output' },
      { pin: 14, name: 'Y8',  type: 'output' },
      { pin: 15, name: 'Y7',  type: 'output' },
      { pin: 16, name: 'Y6',  type: 'output' },
      { pin: 17, name: 'Y5',  type: 'output' },
      { pin: 18, name: 'Y4',  type: 'output' },
      { pin: 19, name: 'Y3',  type: 'output' },
      { pin: 20, name: 'Y2',  type: 'output' },
      { pin: 21, name: 'Y1',  type: 'output' },
      { pin: 22, name: 'NC2', type: 'nc'     },
      { pin: 23, name: 'NC3', type: 'nc'     },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'TRI_BUFFER_LO', inputs: ['A1', 'OEn'], output: 'Y1' },
      { type: 'TRI_BUFFER_LO', inputs: ['A2', 'OEn'], output: 'Y2' },
      { type: 'TRI_BUFFER_LO', inputs: ['A3', 'OEn'], output: 'Y3' },
      { type: 'TRI_BUFFER_LO', inputs: ['A4', 'OEn'], output: 'Y4' },
      { type: 'TRI_BUFFER_LO', inputs: ['A5', 'OEn'], output: 'Y5' },
      { type: 'TRI_BUFFER_LO', inputs: ['A6', 'OEn'], output: 'Y6' },
      { type: 'TRI_BUFFER_LO', inputs: ['A7', 'OEn'], output: 'Y7' },
      { type: 'TRI_BUFFER_LO', inputs: ['A8', 'OEn'], output: 'Y8' },
      { type: 'TRI_BUFFER_LO', inputs: ['A9', 'OEn'], output: 'Y9' },
    ],
  },

  // ── 74x9541: 8 bit buffer / line driver, selectable inv/non-inv, Schmitt, dual OE (20-pin)
  /* Primary source: Texas Instruments, 74x9541 datasheet. [Online]. Available: https://www.ti.com/product/SN74AHC541
     https://en.wikipedia.org/wiki/Three-state_logic */
  '74x9541': {
    name: '74x9541',
    simpleName: '8 bit Dual-OE Buffer (ST)',
    description: '8 bit non-inv buffer/line driver, Schmitt in, dual active-LOW OE (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/product/SN74AHC541',
    tags: ['buffer', 'driver', 'octal', 'tri state', 'Schmitt trigger', 'dual-OE'],
    guideOverview: 'The 74x9541 is an 8 bit non inverting buffer and line driver with Schmitt trigger inputs and two independent active LOW output-enable pins (OE1 and OE2). Outputs are driven when both OE1 and OE2 are LOW; if either is HIGH the outputs go to high impedance. The closest live manufacturer reference is TI\'s SN74AHC541, which implements the same dual active LOW enable, non inverting, 20-pin topology.',
    guidePinDescriptions: {
      'OE1': 'Active LOW output enable 1 (pin 1). Outputs are driven only when both OE1 and OE2 are LOW.',
      'A1': 'Input channel 1.',
      'A2': 'Input channel 2.',
      'A3': 'Input channel 3.',
      'A4': 'Input channel 4.',
      'A5': 'Input channel 5.',
      'A6': 'Input channel 6.',
      'A7': 'Input channel 7.',
      'A8': 'Input channel 8.',
      'GND': 'Ground reference for the device.',
      'Y8': 'Output channel 8.',
      'Y7': 'Output channel 7.',
      'Y6': 'Output channel 6.',
      'Y5': 'Output channel 5.',
      'Y4': 'Output channel 4.',
      'Y3': 'Output channel 3.',
      'Y2': 'Output channel 2.',
      'Y1': 'Output channel 1.',
      'OE2': 'Active LOW output enable 2 (pin 19). Outputs are driven only when both OE1 and OE2 are LOW.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Output Enable Logic',
        paragraphs: [
          'Both OE1 (pin 1) and OE2 (pin 19) must be LOW for outputs to be active. If either enable is HIGH, all eight outputs enter high impedance state. This allows two independent control sources to gate the bus driver.',
        ],
      },
      {
        title: 'Live Family Reference',
        paragraphs: [
          'The TI SN74AHC541 (https://www.ti.com/product/SN74AHC541) implements the same dual active LOW OE, non inverting, 20-pin octal buffer topology and serves as the authoritative datasheet reference for this entry.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OE1', type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'A6',  type: 'input'  },
      { pin:  8, name: 'A7',  type: 'input'  },
      { pin:  9, name: 'A8',  type: 'input'  },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'Y8',  type: 'output' },
      { pin: 12, name: 'Y7',  type: 'output' },
      { pin: 13, name: 'Y6',  type: 'output' },
      { pin: 14, name: 'Y5',  type: 'output' },
      { pin: 15, name: 'Y4',  type: 'output' },
      { pin: 16, name: 'Y3',  type: 'output' },
      { pin: 17, name: 'Y2',  type: 'output' },
      { pin: 18, name: 'Y1',  type: 'output' },
      { pin: 19, name: 'OE2', type: 'input'  },
      { pin: 20, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A1', 'OE1', 'OE2'], output: 'Y1' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A2', 'OE1', 'OE2'], output: 'Y2' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A3', 'OE1', 'OE2'], output: 'Y3' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A4', 'OE1', 'OE2'], output: 'Y4' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A5', 'OE1', 'OE2'], output: 'Y5' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A6', 'OE1', 'OE2'], output: 'Y6' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A7', 'OE1', 'OE2'], output: 'Y7' },
      { type: 'TRI_BUFFER_DUAL_OE', inputs: ['A8', 'OE1', 'OE2'], output: 'Y8' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STUBS
  // ═══════════════════════════════════════════════════════════════════════

  // ── 74x9164: 8 bit shift register, serial/parallel I/O, ST, TRI (16-pin)
  // LEFT AS A STUB on purpose — no datasheet with a verifiable pinout exists.
  // The core function (an 8-bit universal serial/parallel shift register with
  // 3-state outputs) is easy to model; modelability is NOT the blocker. The
  // blocker is that no trustworthy source for a "9164" shift register could be
  // found, so there is no pin assignment to stand behind (the C2 / CD4082
  // lesson: never ship a hand-entered or sibling pinout a student might wire up).
  // Searched without success (2026-06-29):
  //   - Wikipedia, "List of 7400-series integrated circuits" — has NO 9164 row
  //     (unlike the 74x419 case, Wikipedia does not even attest this number).
  //     [Online]. https://en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits
  //   - Web search across 74F/54F/74S/74HC/74AC/F prefixes and the Fairchild,
  //     National, Signetics/Philips, and IDT FAST/FCT lines — no "9164" shift
  //     register datasheet anywhere. (The sibling 74x9323 DID resolve, to NXP/
  //     Philips 74HC9323A; 9164 has no such equivalent.)
  //   - West Florida Components 7400 IC guide — no 9164 row.
  // The hand-entered stub map is also internally IMPOSSIBLE: a 16-pin package
  // cannot bring out separate 8-bit parallel-IN and 8-bit parallel-OUT ports,
  // and the map only lists D0-D3 / Q0-Q4 (5 of the 8 bits). It is kept only so
  // the entry loads; the stub-guard scenario does NOT assert these pin names.
  // See issues.md "74x9164". Same situation/resolution as C45 (74x419).
  '74x9164': {
    name: '74x9164',
    simpleName: '8 bit Shift Reg (S/P I/O)',
    description: '8 bit shift reg, serial/parallel I/O, Schmitt in, 3-state out (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['shift-register', '8 bit', 'serial', 'parallel', 'Schmitt trigger', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x9164 is an 8 bit shift register with serial and parallel data paths, Schmitt trigger inputs, and 3-state parallel outputs. A MODE pin selects between serial shift and parallel load operations on each rising clock edge. The serial output (QSER) follows the last stage for cascading. Output enable (active LOW) places the parallel outputs in high Z without affecting the shift register contents. Schmitt trigger inputs give the part better noise immunity than standard TTL, useful when clock or data lines have slow edges or noise. It is an obscure part: the simulator lists it for reference but does not model its behavior, because no datasheet with a confirmed pinout could be found.',
    pinout: [
      { pin:  1, name: 'SER',  type: 'input'  },
      { pin:  2, name: 'D0',   type: 'input'  },
      { pin:  3, name: 'D1',   type: 'input'  },
      { pin:  4, name: 'D2',   type: 'input'  },
      { pin:  5, name: 'D3',   type: 'input'  },
      { pin:  6, name: 'CLK',  type: 'input'  },
      { pin:  7, name: 'MODE', type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'OEn',  type: 'input'  },
      { pin: 10, name: 'Q0',   type: 'output' },
      { pin: 11, name: 'Q1',   type: 'output' },
      { pin: 12, name: 'Q2',   type: 'output' },
      { pin: 13, name: 'Q3',   type: 'output' },
      { pin: 14, name: 'Q4',   type: 'output' },
      { pin: 15, name: 'QSER', type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['SER','D0','D1','D2','D3','CLK','MODE','OEn'], outputs: ['Q0','Q1','Q2','Q3','Q4','QSER'] },
    ],
  },

  // ── 74x9245: 9 bit bidirectional transceiver, non inverting, TRI (24-pin)
  /* Primary source: 74x9245 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Bus_transceiver */
  '74x9245': {
    name: '74x9245',
    simpleName: '9 bit Transceiver',
    description: '9 bit bidirectional bus transceiver with three-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['transceiver', 'bus', '9 bit', 'tri state', 'bidirectional', 'stub'],
    guideOverview: 'The 74x9245 is a 9 bit bidirectional bus transceiver with 3-state outputs. A direction (DIR) pin selects whether data flows from the A port to the B port or vice versa, and output enable (active LOW) disconnects all nine lines simultaneously. The ninth bit is typically used for bus parity. On a breadboard it is the nine bit equivalent of the popular 74x245 and allows two buses to be loosely coupled with parity included. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'DIR', type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'A6',  type: 'input'  },
      { pin:  8, name: 'A7',  type: 'input'  },
      { pin:  9, name: 'A8',  type: 'input'  },
      { pin: 10, name: 'A9',  type: 'input'  },
      { pin: 11, name: 'NC1', type: 'nc'     },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'OEn', type: 'input'  },
      { pin: 14, name: 'B9',  type: 'input'  },
      { pin: 15, name: 'B8',  type: 'input'  },
      { pin: 16, name: 'B7',  type: 'input'  },
      { pin: 17, name: 'B6',  type: 'input'  },
      { pin: 18, name: 'B5',  type: 'input'  },
      { pin: 19, name: 'B4',  type: 'input'  },
      { pin: 20, name: 'B3',  type: 'input'  },
      { pin: 21, name: 'B2',  type: 'input'  },
      { pin: 22, name: 'B1',  type: 'input'  },
      { pin: 23, name: 'NC2', type: 'nc'     },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['DIR','OEn','A1','A2','A3','A4','A5','A6','A7','A8','A9','B1','B2','B3','B4','B5','B6','B7','B8','B9'], outputs: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','B1','B2','B3','B4','B5','B6','B7','B8','B9'] },
    ],
  },

  // ── 74x9323: Programmable ripple counter with oscillator, 3-state (8-pin) ──
  // Source: Nexperia, "74HC6323A; 74HCT6323A Programmable ripple counter with
  //   oscillator; 3-state", Rev. 4 (9 July 2018). [Online]. Available:
  //   https://assets.nexperia.com/documents/data-sheet/74HC_HCT6323A.pdf
  //   Verified: pin configuration (Fig. 4 / Table 2), logic diagram (Fig. 3),
  //   and divide-mode function table (Table 3), read as 300-dpi PDF page images
  //   (issues.md C4). The 74HC6323A is Nexperia's drop-in successor to the
  //   original Philips/NXP 74HC9323A and carries the identical 8-pin pinout and
  //   function table.
  // Source (corroboration of the original part): NXP/Philips, "74HC9323A
  //   Programmable ripple counter with oscillator 3-State". [Online]. Available:
  //   https://www.alldatasheet.com/datasheet-pdf/pdf/15674/PHILIPS/74HC9323A.html
  //   Verified: 8-pin package, 3-state output, X1/X2 crystal pins (read as HTML
  //   product summary, used only to confirm the 9323A matches the 6323A; the
  //   6323A PDF above was trusted for the exact pin numbers and function table).
  // Stub correction: the hand-entered stub had the wrong pinout entirely
  //   (OSCin/S0/Qout/OSCout/OEn). The datasheet map is OUT=1, S2=2, S1=3,
  //   GND=4, MR=5, X2=6, X1=7, VCC=8. Fixed in place (issues.md C2 lesson).
  '74x9323': {
    name: '74x9323',
    simpleName: 'Prog Ripple Counter',
    description: 'Programmable ripple counter with oscillator, three-state output (8-pin)',
    pins: 8, vcc: 8, gnd: 4,
    datasheet: 'https://assets.nexperia.com/documents/data-sheet/74HC_HCT6323A.pdf',
    tags: ['counter', 'oscillator', 'programmable', 'ripple', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x9323 is a 3-stage binary ripple counter with a built in oscillator in an 8-pin package. An external crystal across X1 and X2 (or an external clock driven into X1) sets the base frequency, and the two select inputs S1 and S2 pick how far that frequency is divided down before it reaches OUT: by 1, 2, 4, or 8. OUT is a three-state buffer. Master reset (active LOW) clears the counter, stops the oscillator, and puts OUT into high impedance; it has an internal pull-up, so leaving it unconnected holds it inactive. Both select pins also have pull-ups, so leaving them open gives divide-by-8. The small package and self contained oscillator make this a compact frequency reference or timeout generator when you need a slower periodic signal without a separate clock chip.',
    guidePinDescriptions: {
      'OUT': 'Counter output (three-state). Carries the oscillator frequency divided by the ratio S1/S2 select. Goes high impedance when master reset is LOW.',
      'S2': 'Mode select. With S1, picks the divide ratio: 1, 2, 4, or 8. Has an internal pull-up, so open reads HIGH.',
      'S1': 'Mode select. With S2, picks the divide ratio: 1, 2, 4, or 8. Has an internal pull-up, so open reads HIGH.',
      'GND': 'Ground reference for the device.',
      'MR': 'Master reset (active LOW). LOW clears the counter, stops the oscillator, and forces OUT to high impedance. Has an internal pull-up, so open holds it inactive (HIGH).',
      'X2': 'Oscillator pin. With a crystal, this is the second oscillator terminal. With an external clock on X1, leave X2 open; in the simulator X2 shows the buffered oscillator signal.',
      'X1': 'Clock input / oscillator pin. Drive an external clock here, or connect a crystal across X1 and X2. The counter advances on each falling edge of X1.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Picking the divide ratio',
        paragraphs: [
          'S1 and S2 select one of four taps off the internal 3-stage counter. The output frequency is the X1 frequency divided by the chosen number.',
        ],
        list: [
          'S1=0, S2=0: divide by 1 (OUT follows the clock).',
          'S1=0, S2=1: divide by 2.',
          'S1=1, S2=0: divide by 4.',
          'S1=1, S2=1: divide by 8 (also the default if the pins are left open).',
        ],
        note: 'Master reset is active LOW. Drive it LOW to clear the counter and tri-state OUT; leave it open or HIGH for normal counting.',
      },
    ],
    pinout: [
      { pin: 1, name: 'OUT', type: 'output' },
      { pin: 2, name: 'S2',  type: 'input'  },
      { pin: 3, name: 'S1',  type: 'input'  },
      { pin: 4, name: 'GND', type: 'power'  },
      { pin: 5, name: 'MR',  type: 'input'  },
      { pin: 6, name: 'X2',  type: 'output' },
      { pin: 7, name: 'X1',  type: 'input'  },
      { pin: 8, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_PROG_RIPPLE_OSC', inputs: ['X1','MR','S1','S2'], outputs: ['OUT','X2'] },
    ],
  },

  // ── 74x9595: 8 bit shift register with latch, serial in / parallel out, ST (16-pin)
  /* Primary source: Nexperia, 74HC595 datasheet. [Online]. Available: https://www.nexperia.com/products/analog-logic-ics/logic/flip-flops-latches-registers-counters-dividers/shift-registers/series/74HC595-74HCT595.html
     https://en.wikipedia.org/wiki/Shift_register */
  '74x9595': {
    name: '74x9595',
    simpleName: '8 bit Shift Reg/Latch',
    description: '8 bit shift register + latch, serial-in/parallel-out, Schmitt in (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.nexperia.com/products/analog-logic-ics/logic/flip-flops-latches-registers-counters-dividers/shift-registers/series/74HC595-74HCT595.html',
    tags: ['shift-register', 'latch', '8 bit', 'serial in', 'parallel out', 'Schmitt trigger'],
    sequential: true,
    guideOverview: 'The 74x9595 is a serial in, parallel out shift register with a separate output latch and Schmitt trigger inputs, functionally equivalent to the 74HC595 family. Bits enter one at a time on SER, shift forward on each rising SRCLK edge, and are copied to the visible outputs on a rising RCLK edge. Shift register clear (active LOW) asynchronously clears the shift register without disturbing the output latch. Output enable (active LOW) tri states QA-QH without affecting stored data. QHs always reflects the last shift register stage for cascading.',
    guidePinDescriptions: {
      'QB': 'Parallel output B from the storage register.',
      'QC': 'Parallel output C from the storage register.',
      'QD': 'Parallel output D from the storage register.',
      'QE': 'Parallel output E from the storage register.',
      'QF': 'Parallel output F from the storage register.',
      'QG': 'Parallel output G from the storage register.',
      'QH': 'Parallel output H from the storage register.',
      'GND': 'Ground reference for the device.',
      'QHs': 'Serial output from the last shift register stage. Connect to SER of the next chip to cascade.',
      'SRCLRn': 'Shift register clear (active LOW). Drive LOW to reset all shift register bits to 0. Does not affect the output latch.',
      'SRCLK': 'Shift register clock. Rising edge shifts data: SER enters first stage, each bit moves to the next.',
      'RCLK': 'Storage register (latch) clock. Rising edge copies current shift register contents to QA-QH outputs.',
      'OEn': 'Output enable (active LOW). HIGH tri states QA-QH without affecting stored data. QHs remains active.',
      'SER': 'Serial data input. Sampled on each rising SRCLK edge and shifted into the first stage.',
      'QA': 'Parallel output A (LSB) from the storage register.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Shift Then Latch',
        paragraphs: [
          'SRCLK and RCLK perform different jobs. SRCLK moves bits through the internal shift register one step per rising edge while RCLK publishes the current 8 bit word to QA-QH all at once.',
          'The Schmitt trigger inputs improve noise immunity compared to standard 74HC595, making this variant suitable for noisier environments.',
        ],
        list: [
          'Keep the output enable pin (active LOW) LOW for active parallel outputs, or drive HIGH to disconnect QA-QH from the bus without losing data.',
          'Connect QHs to SER of the next chip to daisy chain registers the SRCLK and RCLK lines are shared.',
        ],
        note: 'The shift register clear pin (active LOW) clears the shift register only. To clear the visible outputs you must also pulse RCLK after clearing.',
      },
    ],
    pinout: [
      { pin:  1, name: 'QB',    type: 'output' },
      { pin:  2, name: 'QC',    type: 'output' },
      { pin:  3, name: 'QD',    type: 'output' },
      { pin:  4, name: 'QE',    type: 'output' },
      { pin:  5, name: 'QF',    type: 'output' },
      { pin:  6, name: 'QG',    type: 'output' },
      { pin:  7, name: 'QH',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'QHs',   type: 'output' },
      { pin: 10, name: 'SRCLRn',type: 'input'  },
      { pin: 11, name: 'SRCLK', type: 'input'  },
      { pin: 12, name: 'RCLK',  type: 'input'  },
      { pin: 13, name: 'OEn',   type: 'input'  },
      { pin: 14, name: 'SER',   type: 'input'  },
      { pin: 15, name: 'QA',    type: 'output' },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'SHIFT_REG_LATCH', inputs: ['SER','SRCLK','RCLK','SRCLRn','OEn'], outputs: ['QA','QB','QC','QD','QE','QF','QG','QH','QHs'] },
    ],
  },

  // ── 74x40102: Presettable synchronous 2-decade BCD down counter (16-pin)
  /* Primary source: Texas Instruments, 74x40102 datasheet. [Online]. Available: https://www.ti.com/product/CD40102B
     https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x40102': {
    name: '74x40102',
    simpleName: '2-Decade BCD Down Counter',
    description: 'Presettable synchronous 2-decade BCD down counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/product/CD40102B',
    tags: ['counter', 'BCD', 'decade', 'down', 'presettable', 'synchronous'],
    sequential: true,
    guideOverview: 'The 74x40102 is a presettable synchronous 2-decade BCD down counter (CD40102B). Both BCD digits count downward together on each rising CLK edge when count enable (active LOW) and single phase enable (active LOW) are LOW. Drive preset enable (active LOW) LOW on a rising CLK edge to synchronously load the preset values (P0 P3 for units, P4 P7 for tens). TCdec goes LOW when the units decade reaches zero; TC goes LOW when both decades reach zero, making cascading straightforward.',
    guidePinDescriptions: {
      'CLK': 'Clock input. Rising edge advances the counter or loads preset.',
      'PEn': 'Synchronous preset enable (active LOW). Hold LOW on a rising CLK edge to load P0 P7.',
      'P0': 'Preset data bit 0 (units decade LSB).',
      'P1': 'Preset data bit 1 (units decade).',
      'P2': 'Preset data bit 2 (units decade).',
      'P3': 'Preset data bit 3 (units decade MSB).',
      'CEn': 'Count enable (active LOW). Both CEn and SPE must be LOW to count.',
      'GND': 'Ground reference for the counter.',
      'TC': 'Terminal count (active LOW). Goes LOW when both BCD decades reach 0.',
      'P4': 'Preset data bit 4 (tens decade LSB).',
      'P5': 'Preset data bit 5 (tens decade).',
      'P6': 'Preset data bit 6 (tens decade).',
      'P7': 'Preset data bit 7 (tens decade MSB).',
      'SPE': 'Single phase enable (active LOW). Both CEn and SPE must be LOW to count.',
      'TCdec': 'Decoded terminal count (active LOW). Goes LOW when units decade reaches 0.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'BCD Down Counting',
        paragraphs: [
          'A BCD down counter works with decimal digits encoded in binary form. Instead of rolling through all 256 binary values it follows decade boundaries units counts 9→8→...→0 and then borrows into the tens digit which is useful for clocks, timers, and numeric displays.',
          'Both count enable (active LOW) and single phase enable (active LOW) must be LOW for the counter to advance. Pull preset enable (active LOW) LOW on a rising CLK edge to synchronously reload the preset value at any time.',
        ],
        list: [
          'TCdec (pin 15) goes LOW when the units decade reaches 0 use this to enable a cascaded counter.',
          'TC (pin 9) goes LOW only when both decades reach 0 this is the overall borrow output.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input'  },
      { pin:  2, name: 'PEn',  type: 'input'  },
      { pin:  3, name: 'P0',   type: 'input'  },
      { pin:  4, name: 'P1',   type: 'input'  },
      { pin:  5, name: 'P2',   type: 'input'  },
      { pin:  6, name: 'P3',   type: 'input'  },
      { pin:  7, name: 'CEn',  type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'TC',   type: 'output' },
      { pin: 10, name: 'P4',   type: 'input'  },
      { pin: 11, name: 'P5',   type: 'input'  },
      { pin: 12, name: 'P6',   type: 'input'  },
      { pin: 13, name: 'P7',   type: 'input'  },
      { pin: 14, name: 'SPE',  type: 'input'  },
      { pin: 15, name: 'TCdec',type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'BCD_DOWN_2DEC', inputs: ['CLK','PEn','P0','P1','P2','P3','P4','P5','P6','P7','CEn','SPE'], outputs: ['TC','TCdec'] },
    ],
  },

  // ── 74x40103: Presettable 8 bit synchronous down counter (16-pin) ─────
  /* Primary source: Texas Instruments, 74x40103 datasheet. [Online]. Available: https://www.ti.com/product/CD74HC40103
     https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x40103': {
    name: '74x40103',
    simpleName: '8 bit Down Counter',
    description: 'Presettable 8 bit synchronous down counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/product/CD74HC40103',
    tags: ['counter', 'binary', '8 bit', 'down', 'presettable', 'synchronous'],
    sequential: true,
    guideOverview: 'The 74x40103 is a presettable synchronous 8 bit binary down counter (CD74HC40103). Load a starting value by holding preset enable (active LOW) LOW on a rising CLK edge; the counter then decrements by 1 on each rising CLK edge when both count enable (active LOW) and single phase enable (active LOW) are LOW. TC goes active LOW when the counter reaches zero, making it easy to cascade multiple stages for longer delays or divide by-N functions.',
    guidePinDescriptions: {
      'PEn': 'Synchronous preset enable (active LOW). Hold LOW on a rising CLK edge to load P0 P7.',
      'P5': 'Preset data bit 5.',
      'P4': 'Preset data bit 4.',
      'P3': 'Preset data bit 3.',
      'P6': 'Preset data bit 6.',
      'P7': 'Preset data bit 7 (MSB).',
      'CEn': 'Count enable (active LOW). Both CEn and SPE must be LOW to count.',
      'GND': 'Ground reference for the counter.',
      'TC': 'Terminal count (active LOW). Goes LOW when counter reaches 0.',
      'P0': 'Preset data bit 0 (LSB).',
      'P1': 'Preset data bit 1.',
      'P2': 'Preset data bit 2.',
      'SPE': 'Single phase enable (active LOW). Both CEn and SPE must be LOW to count.',
      'CLK': 'Clock input. Rising edge decrements the counter or loads preset.',
      'NC': 'No internal connection. Leave unconnected.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Presettable Binary Down Counter',
        paragraphs: [
          'A presettable down counter lets you choose the starting number rather than always beginning at 255. Set preset enable (active LOW) LOW on a rising CLK edge to load any 8 bit value, then the counter steps toward zero one per clock.',
          'Both count enable (active LOW) and single phase enable (active LOW) must be LOW to enable counting. TC goes LOW when the count reaches 0, at which point the next clock edge wraps the counter back to 255.',
        ],
        list: [
          'To cascade two counters for a 16 bit delay, connect TC of the lower byte to SPE of the upper byte.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'PEn', type: 'input'  },
      { pin:  2, name: 'P5',  type: 'input'  },
      { pin:  3, name: 'P4',  type: 'input'  },
      { pin:  4, name: 'P3',  type: 'input'  },
      { pin:  5, name: 'P6',  type: 'input'  },
      { pin:  6, name: 'P7',  type: 'input'  },
      { pin:  7, name: 'CEn', type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'TC',  type: 'output' },
      { pin: 10, name: 'P0',  type: 'input'  },
      { pin: 11, name: 'P1',  type: 'input'  },
      { pin: 12, name: 'P2',  type: 'input'  },
      { pin: 13, name: 'SPE', type: 'input'  },
      { pin: 14, name: 'CLK', type: 'input'  },
      { pin: 15, name: 'NC',  type: 'nc'     },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'BIN_DOWN_8BIT', inputs: ['CLK','PEn','P0','P1','P2','P3','P4','P5','P6','P7','CEn','SPE'], outputs: ['TC'] },
    ],
  },

  // ── 74x40104: 4 bit bidirectional universal shift register, TRI (16-pin)
  // Source: SGS-Thomson Microelectronics, "HCC/HCF40104B  HCC/HCF40194B —
  //   4-BIT BIDIRECTIONAL UNIVERSAL SHIFT REGISTER", June 1989. [Online].
  //   Available:
  //   http://www.frankshospitalworkshop.com/electronics/data_sheets/4000/40194.pdf
  //   Verified: PIN CONNECTIONS (page 1) + FUNCTIONAL/LOGIC DIAGRAMS (pages 2-3) +
  //   the page-1/2 DESCRIPTION text + DYNAMIC CHARACTERISTICS labels (page 6),
  //   read as rendered PDF page images (issues.md C4, not the WebFetch text
  //   summarizer which mangles these scans).
  // ⚠ PINOUT (issues.md C2 lesson): the original hand-entered stub pinout was
  //   WRONG — it scrambled pins 1-11 (it had SR/P0/P1/P2/P3/SL/S0/.../CLK/OEn).
  //   The datasheet 40104B DIP-16 terminal assignment is its OWN map (it differs
  //   from the 40194B sibling on pin 1 — OUTPUT ENABLE vs RESET):
  //     1 OUTPUT ENABLE, 2 SHIFT RIGHT IN, 3 D0, 4 D1, 5 D2, 6 D3,
  //     7 SHIFT LEFT IN, 8 VSS, 9 S0, 10 S1, 11 CLOCK,
  //     12 Q3, 13 Q2, 14 Q1, 15 Q0, 16 VDD. Pinout corrected to match.
  // Function (DESCRIPTION text): parallel-load mode (S0,S1 both HIGH) loads D0-D3
  //   into the flip-flops, appearing at the outputs after the positive CLOCK edge;
  //   shift right and shift left occur synchronously on the positive edge with
  //   serial data entered at SHIFT RIGHT / SHIFT LEFT respectively; "Clearing the
  //   register is accomplished by setting both mode controls low and clocking the
  //   register"; "When the output enable input is low, all outputs assume the high
  //   impedance state" → OUTPUT ENABLE is ACTIVE HIGH. Mode (S1,S0): 00 synchronous
  //   clear, 01 shift right (SR → first stage Q0), 10 shift left (SL → last stage
  //   Q3), 11 parallel load. The 40104B has NO reset pin — the dedicated RESET pin
  //   belongs to the 40194B sibling (which puts HOLD on mode 00 and is not 3-state).
  // ⚠ PRIMITIVE: reuses the existing `SHIFT_REG_4BIT_UNIV_TRI` engine primitive
  //   (js/specificChipsSim.js), which was added for the CMOS sibling CD40104
  //   (chips134.js) and models exactly this part: four modes with mode-00
  //   SYNCHRONOUS CLEAR + active-HIGH 3-state OUTPUT ENABLE. NOT the 74194-style
  //   `SHIFT_REG_4BIT_BIDIR` (mode 00 = HOLD, no tri-state) and NOT the 74295
  //   `SHIFT_REG_4BIT_BIDIR_TRI` (one shift direction only). The 74x40104 and the
  //   CMOS CD40104 are the same functional device under two naming schemes.
  '74x40104': {
    name: '74x40104',
    simpleName: '4 bit Bidir Shift Reg',
    description: '4 bit bidir universal shift register, parallel I/O, 3-state out (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'http://www.frankshospitalworkshop.com/electronics/data_sheets/4000/40194.pdf',
    tags: ['shift-register', '4 bit', 'bidirectional', 'universal', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x40104 is a 4-bit universal shift register: it can clear itself, shift its contents left, shift them right, or load four bits in parallel, all chosen by two mode-select pins. S1 and S0 pick the mode on each rising clock edge — 00 clears the register, 01 shifts right (a new bit enters at SHIFT RIGHT IN and moves toward Q3), 10 shifts left (a new bit enters at SHIFT LEFT IN and moves toward Q0), and 11 loads D0-D3 in parallel. The four outputs are three-state: OUTPUT ENABLE HIGH drives Q0-Q3, OUTPUT ENABLE LOW disconnects them so the register can share a bus with other devices. Unlike the closely related 40194, this part has no separate reset pin — you clear it by selecting mode 00 and clocking.',
    guidePinDescriptions: {
      'OE': 'OUTPUT ENABLE (pin 1), active HIGH. HIGH drives Q0-Q3; LOW puts all four outputs in the high-impedance (disconnected) state so they can share a bus.',
      'SR': 'SHIFT RIGHT serial input (pin 2). In shift-right mode (S1=0, S0=1) this bit is loaded into the first stage (Q0) on the clock edge.',
      'D0': 'Parallel data input bit 0 (pin 3). Loaded into Q0 in parallel-load mode (S1=S0=1).',
      'D1': 'Parallel data input bit 1 (pin 4). Loaded into Q1 in parallel-load mode.',
      'D2': 'Parallel data input bit 2 (pin 5). Loaded into Q2 in parallel-load mode.',
      'D3': 'Parallel data input bit 3 (pin 6). Loaded into Q3 in parallel-load mode.',
      'SL': 'SHIFT LEFT serial input (pin 7). In shift-left mode (S1=1, S0=0) this bit is loaded into the last stage (Q3) on the clock edge.',
      'GND': 'Negative supply / ground (pin 8, 0 V).',
      'S0': 'Mode-select bit 0 (pin 9). With S1, picks clear/shift/load on the clock edge.',
      'S1': 'Mode-select bit 1 (pin 10). With S0: 00 clear, 01 shift right, 10 shift left, 11 parallel load.',
      'CLK': 'Shift clock (pin 11). All actions (clear, shift, load) happen on the POSITIVE edge.',
      'Q3': 'Register output bit 3 (pin 12), three-state.',
      'Q2': 'Register output bit 2 (pin 13), three-state.',
      'Q1': 'Register output bit 1 (pin 14), three-state.',
      'Q0': 'Register output bit 0 (pin 15), three-state. First stage of the shift chain.',
      'VCC': 'Positive supply (pin 16, 3 V to 18 V on real silicon).',
    },
    guideSections: [
      {
        title: 'Choosing A Mode With S1 And S0',
        paragraphs: [
          'The two mode pins decide what the next rising clock edge does. S1=0, S0=0 clears the register to all zeros. S1=0, S0=1 shifts right: each stage copies the one before it and SHIFT RIGHT IN enters at Q0. S1=1, S0=0 shifts left: each stage copies the one after it and SHIFT LEFT IN enters at Q3. S1=1, S0=1 loads D0-D3 in parallel. Because every action is synchronous, you set the mode pins while the clock is low and the chosen operation takes effect on the next edge.',
        ],
      },
      {
        title: 'Three-State Outputs For Bus Sharing',
        paragraphs: [
          'OUTPUT ENABLE controls whether the outputs are connected. Hold it HIGH and Q0-Q3 drive their values normally. Pull it LOW and the four outputs go high-impedance — electrically disconnected — so several registers can take turns driving the same set of wires. OUTPUT ENABLE only affects the output pins; it does not change the stored data or stop the register from shifting.',
        ],
      },
      {
        title: 'Clearing Without A Reset Pin',
        paragraphs: [
          'This part has no dedicated reset input. To clear it, select mode 00 (both S1 and S0 LOW) and apply a clock edge — the register loads all zeros. That is the main difference from the 40194, which trades the three-state outputs and the mode-00 clear for a direct overriding RESET pin and a mode-00 hold.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OE',   type: 'input'  },
      { pin:  2, name: 'SR',   type: 'input'  },
      { pin:  3, name: 'D0',   type: 'input'  },
      { pin:  4, name: 'D1',   type: 'input'  },
      { pin:  5, name: 'D2',   type: 'input'  },
      { pin:  6, name: 'D3',   type: 'input'  },
      { pin:  7, name: 'SL',   type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'S0',   type: 'input'  },
      { pin: 10, name: 'S1',   type: 'input'  },
      { pin: 11, name: 'CLK',  type: 'input'  },
      { pin: 12, name: 'Q3',   type: 'output' },
      { pin: 13, name: 'Q2',   type: 'output' },
      { pin: 14, name: 'Q1',   type: 'output' },
      { pin: 15, name: 'Q0',   type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    // SHIFT_REG_4BIT_UNIV_TRI contract (js/specificChipsSim.js):
    //   inputs:  [SR, SL, D0, D1, D2, D3, S0, S1, CLK, OE]
    //   outputs: [Q0, Q1, Q2, Q3]
    //   mode (S1,S0): 00 clear, 01 shift right (SR→Q0), 10 shift left (SL→Q3),
    //                 11 parallel load. OE active HIGH (LOW → Hi-Z).
    gates: [
      { type: 'SHIFT_REG_4BIT_UNIV_TRI',
        inputs: ['SR','SL','D0','D1','D2','D3','S0','S1','CLK','OE'],
        outputs: ['Q0','Q1','Q2','Q3'] },
    ],
  },

  // ── 74x40105: 64 bit FIFO memory (16x4), TRI (16-pin) ─────────────────
  /* Primary source: Texas Instruments, 74x40105 datasheet. [Online]. Available: https://www.ti.com/product/CD74HC40105
     https://en.wikipedia.org/wiki/Queue_(abstract_data_type) */
  '74x40105': {
    name: '74x40105',
    simpleName: '64 bit FIFO (16x4)',
    description: '64 bit FIFO memory (16 words × 4 bits) with three-state outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/product/CD74HC40105',
    tags: ['FIFO', 'memory', '16x4', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x40105 is a 16 word by 4 bit first in, first out memory (CD74HC40105). Unlike a shift register, a FIFO stores words in arrival order and delivers them in that same order, making it ideal for buffering between circuits that run at different rates. A rising edge on WR pushes the current D0-D3 word into the queue (if not full); a rising edge on RD pops the front word to Q0-Q3. Reset (active LOW) clears the queue asynchronously when pulled LOW. The FF and EF status flags are active LOW: FF goes LOW when the 16 word queue is full, EF goes LOW when it is empty. Output enable (active LOW) disables the data outputs when HIGH.',
    guidePinDescriptions: {
      'D0': 'Data input bit 0 for the word being written into the FIFO.',
      'D1': 'Data input bit 1.',
      'D2': 'Data input bit 2.',
      'D3': 'Data input bit 3.',
      'WR': 'Write control. Pulse it to push a new word into the FIFO when space is available.',
      'RD': 'Read control. Pulse it to pop the next stored word from the FIFO.',
      'RSTn': 'Active LOW reset. Pull LOW to clear the FIFO state.',
      'GND': 'Ground reference for the device.',
      'FF': 'Full flag output. It indicates that no more words can be written until data is read out.',
      'EF': 'Empty flag output. It indicates that no stored words are currently available to read.',
      'OEn': 'Active LOW output enable. Pull LOW to drive Q0 through Q3; pull HIGH to disable the outputs.',
      'Q3': 'Data output bit 3 for the next word available at the FIFO output.',
      'Q2': 'Data output bit 2.',
      'Q1': 'Data output bit 1.',
      'Q0': 'Data output bit 0.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'How A FIFO Differs From A Shift Register',
        paragraphs: [
          'A FIFO stores complete words and preserves their arrival order. That makes it useful for buffering bursts of data or crossing between circuits that do not read and write at exactly the same rate.',
        ],
      },
      {
        title: 'Operation Summary',
        paragraphs: [
          'Pulse WR HIGH to push D0-D3 into the queue (ignored when full). Pulse RD HIGH to pop the front word to Q0-Q3. Pull RSTn LOW at any time to clear the queue asynchronously. FF goes LOW when all 16 slots are occupied; EF goes LOW when the queue is empty. Pull OEn LOW to drive the data outputs; pull it HIGH to place Q0-Q3 in high Z.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'D0',  type: 'input'  },
      { pin:  2, name: 'D1',  type: 'input'  },
      { pin:  3, name: 'D2',  type: 'input'  },
      { pin:  4, name: 'D3',  type: 'input'  },
      { pin:  5, name: 'WR',  type: 'input'  },
      { pin:  6, name: 'RD',  type: 'input'  },
      { pin:  7, name: 'RSTn',type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'FF',  type: 'output' },
      { pin: 10, name: 'EF',  type: 'output' },
      { pin: 11, name: 'OEn', type: 'input'  },
      { pin: 12, name: 'Q3',  type: 'output' },
      { pin: 13, name: 'Q2',  type: 'output' },
      { pin: 14, name: 'Q1',  type: 'output' },
      { pin: 15, name: 'Q0',  type: 'output' },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'FIFO_16X4_RST_TRI', inputs: ['D0','D1','D2','D3','WR','RD','RSTn','OEn'], outputs: ['Q0','Q1','Q2','Q3','FF','EF'] },
    ],
  },
};