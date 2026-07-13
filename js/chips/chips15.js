// Chip definitions block 15
// Chips: 74x206-74x224

export const CHIPS_BLOCK_15 = {

  // ── 74206: 256 bit RAM (256x1, OC), 16-pin ─────────────────────────────────
  /* Primary source: Texas Instruments, SN74S206 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74s206.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Open_collector
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x206': {
    name: '74x206',
    simpleName: '256 bit RAM (256x1, OC)',
    description: '256-bit static RAM, 256x1, open-collector output (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74s206.pdf',
    tags: ['ram', 'memory', 'storage', '256x1', 'open collector'],
    guideOverview: 'The 74x206 is a 256 word × 1 bit static RAM with an open collector output. Eight address bits (A0 A7) select one of 256 storage locations. Chip Select (CS, active LOW) enables the device. When WE is LOW and CS is LOW, the bit on DIN is written to the selected address. When WE is HIGH and CS is LOW, the stored bit is driven onto DOUT through an open collector transistor, requiring an external pull up resistor to VCC. The open collector output allows several chips to share a single data bus line with one pull up.',
    pinout: [
      { pin:  1, name: 'A6',   type: 'input' },
      { pin:  2, name: 'A5',   type: 'input' },
      { pin:  3, name: 'A4',   type: 'input' },
      { pin:  4, name: 'A3',   type: 'input' },
      { pin:  5, name: 'A2',   type: 'input' },
      { pin:  6, name: 'A1',   type: 'input' },
      { pin:  7, name: 'A0',   type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'DIN',  type: 'input' },
      { pin: 10, name: 'WE',   type: 'input' },
      { pin: 11, name: 'CS',   type: 'input' },
      { pin: 12, name: 'DOUT', type: 'output' },
      { pin: 13, name: 'A7',   type: 'input' },
      { pin: 14, name: 'NC1',  type: 'nc' },
      { pin: 15, name: 'NC2',  type: 'nc' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM_256X1_OC', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','DIN','CS','WE'], outputs: ['DOUT'] },
    ],
    sequential: true,
  },

  // ── 74207: 256 bit RAM (256x4, Common I/O), 16-pin ─────────────────────────
  /* Primary source: Texas Instruments, SN74LS207 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls207.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x207': {
    name: '74x207',
    simpleName: '256 bit RAM (256x4, Common I/O)',
    description: '1024-bit static RAM, 256x4, common I/O, 3-state outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls207.pdf',
    tags: ['ram', 'memory', 'storage', '256x4', 'tri state', 'common-io'],
    guideOverview: 'The 74x207 is a 256 word × 4 bit static RAM with common (shared) I/O pins and 3-state outputs. Eight address bits select one of 256 nibble wide locations. When CS is LOW and WE is LOW, the nibble on IO0 IO3 is written. When CS is LOW and WE is HIGH, the stored nibble is driven onto IO0 IO3. The 3-state outputs let multiple chips share the same 4 bit data bus, with only the selected chip driving the bus at any moment.',
    pinout: [
      { pin:  1, name: 'A6',  type: 'input' },
      { pin:  2, name: 'A5',  type: 'input' },
      { pin:  3, name: 'A4',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'A2',  type: 'input' },
      { pin:  6, name: 'A1',  type: 'input' },
      { pin:  7, name: 'A0',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'IO0', type: 'output' },
      { pin: 10, name: 'IO1', type: 'output' },
      { pin: 11, name: 'IO2', type: 'output' },
      { pin: 12, name: 'IO3', type: 'output' },
      { pin: 13, name: 'A7',  type: 'input' },
      { pin: 14, name: 'WE',  type: 'input' },
      { pin: 15, name: 'CS',  type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_256X4_COMMON', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','IO0','IO1','IO2','IO3','WE','CS'], outputs: ['IO0','IO1','IO2','IO3'] },
    ],
    sequential: true,
  },

  // ── 74208: 256 bit RAM (256x4, Sep I/O), 20-pin ────────────────────────────
  /* Primary source: Texas Instruments, SN74LS208 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls208.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x208': {
    name: '74x208',
    simpleName: '256 bit RAM (256x4, Sep I/O)',
    description: '1024-bit static RAM, 256x4, separate I/O, 3-state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls208.pdf',
    tags: ['ram', 'memory', 'storage', '256x4', 'tri state'],
    guideOverview: 'The 74x208 is a 256 word × 4 bit static RAM with separate data input and output ports and 3-state outputs. Eight address bits (A0 A7) select one of 256 locations. DIN0-DIN3 are dedicated write only inputs; DOUT0-DOUT3 are separate 3-state read outputs. CS (Chip Select) enables the device, and WE (Write Enable) determines whether a write or read operation occurs. The separate I/O ports simplify bus wiring in systems where input and output paths are distinct.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'A2',   type: 'input' },
      { pin:  4, name: 'A3',   type: 'input' },
      { pin:  5, name: 'A4',   type: 'input' },
      { pin:  6, name: 'A5',   type: 'input' },
      { pin:  7, name: 'A6',   type: 'input' },
      { pin:  8, name: 'A7',   type: 'input' },
      { pin:  9, name: 'DIN0', type: 'input' },
      { pin: 10, name: 'GND',  type: 'power' },
      { pin: 11, name: 'DIN1', type: 'input' },
      { pin: 12, name: 'DIN2', type: 'input' },
      { pin: 13, name: 'DIN3', type: 'input' },
      { pin: 14, name: 'CS',   type: 'input' },
      { pin: 15, name: 'WE',   type: 'input' },
      { pin: 16, name: 'DOUT0',type: 'output' },
      { pin: 17, name: 'DOUT1',type: 'output' },
      { pin: 18, name: 'DOUT2',type: 'output' },
      { pin: 19, name: 'DOUT3',type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM_256X4', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','DIN0','DIN1','DIN2','DIN3','CS','WE'], outputs: ['DOUT0','DOUT1','DOUT2','DOUT3'] },
    ],
    sequential: true,
  },

  // ── 74209: 1024 bit RAM (1024x1), 16-pin ───────────────────────────────────
  /* Primary source: Texas Instruments, SN74S209 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74s209.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x209': {
    name: '74x209',
    simpleName: '1024 bit RAM (1024x1)',
    description: '1024-bit static RAM, 1024x1, 3-state output (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74s209.pdf',
    tags: ['ram', 'memory', 'storage', '1024x1', 'tri state'],
    guideOverview: 'The 74x209 is a 1024 word × 1 bit static RAM with a 3-state output. Ten address bits (A0 A9) select one of 1024 storage locations. CS (Chip Select, active LOW) enables the device; WE (Write Enable, active LOW) selects a write operation. When writing, the bit on DIN is stored at the selected address. When reading (CS LOW, WE HIGH), the stored bit appears on DOUT. The 3-state output goes high impedance when CS is HIGH, allowing bus sharing.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'A2',   type: 'input' },
      { pin:  4, name: 'A3',   type: 'input' },
      { pin:  5, name: 'A4',   type: 'input' },
      { pin:  6, name: 'A5',   type: 'input' },
      { pin:  7, name: 'A6',   type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'A7',   type: 'input' },
      { pin: 10, name: 'A8',   type: 'input' },
      { pin: 11, name: 'A9',   type: 'input' },
      { pin: 12, name: 'DIN',  type: 'input' },
      { pin: 13, name: 'WE',   type: 'input' },
      { pin: 14, name: 'CS',   type: 'input' },
      { pin: 15, name: 'DOUT', type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM_1024X1', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','DIN','CS','WE'], outputs: ['DOUT'] },
    ],
    sequential: true,
  },

  // ── 74210: Octal Inv Buffer (3-state), 20-pin ──────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic */
  '74x210': {
    name: '74x210',
    simpleName: 'Octal Inv Buffer (3-state)',
    description: 'Octal inverting buffer/line driver with 3-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['buffer', 'driver', 'octal', 'tri state', 'inverting'],
    guideOverview: 'The 74x210 is an octal inverting 3-state buffer/line driver split into two independent banks of four. Bank 1 uses output-enable 1OE and handles 1A1 1A4 → 1Y1 1Y4; bank 2 uses 2OE for 2A1 2A4 → 2Y1 2Y4. When OE is LOW, each output is the logical complement of its input. When OE is HIGH, all four outputs in that bank go high impedance, disconnecting them from the bus. The 3-state capability allows this chip to drive a shared data bus with other bus drivers.',
    pinout: [
      { pin:  1, name: '1OE',  type: 'input' },
      { pin:  2, name: '1A1',  type: 'input' },
      { pin:  3, name: '2Y4',  type: 'output' },
      { pin:  4, name: '1A2',  type: 'input' },
      { pin:  5, name: '2Y3',  type: 'output' },
      { pin:  6, name: '1A3',  type: 'input' },
      { pin:  7, name: '2Y2',  type: 'output' },
      { pin:  8, name: '1A4',  type: 'input' },
      { pin:  9, name: '2Y1',  type: 'output' },
      { pin: 10, name: 'GND',  type: 'power' },
      { pin: 11, name: '2A1',  type: 'input' },
      { pin: 12, name: '1Y4',  type: 'output' },
      { pin: 13, name: '2A2',  type: 'input' },
      { pin: 14, name: '1Y3',  type: 'output' },
      { pin: 15, name: '2A3',  type: 'input' },
      { pin: 16, name: '1Y2',  type: 'output' },
      { pin: 17, name: '2A4',  type: 'input' },
      { pin: 18, name: '1Y1',  type: 'output' },
      { pin: 19, name: '2OE',  type: 'input' },
      { pin: 20, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'TRI_NOT_LO', inputs: ['1A1', '1OE'], output: '1Y1' },
      { type: 'TRI_NOT_LO', inputs: ['1A2', '1OE'], output: '1Y2' },
      { type: 'TRI_NOT_LO', inputs: ['1A3', '1OE'], output: '1Y3' },
      { type: 'TRI_NOT_LO', inputs: ['1A4', '1OE'], output: '1Y4' },
      { type: 'TRI_NOT_LO', inputs: ['2A1', '2OE'], output: '2Y1' },
      { type: 'TRI_NOT_LO', inputs: ['2A2', '2OE'], output: '2Y2' },
      { type: 'TRI_NOT_LO', inputs: ['2A3', '2OE'], output: '2Y3' },
      { type: 'TRI_NOT_LO', inputs: ['2A4', '2OE'], output: '2Y4' },
    ],
  },

  // ── 74211: 144 bit RAM (16x9) with Latch, 20-pin ───────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x211': {
    name: '74x211',
    simpleName: '144 bit RAM (16x9) with Latch',
    description: '16 word x 9 bit static RAM with output latch and 3-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['ram', 'memory', 'storage', '16x9', 'tri state', 'latch', 'register-file'],
    guideOverview: 'The 74x211 is a 16 word × 9 bit static RAM with an output latch and 3-state outputs. Four address bits (A0 A3) select one of 16 locations. CE (Chip Enable, active LOW) enables the array; WE (Write Enable, active LOW) triggers a write. OE (Output Enable, active LOW) drives the IO bus. The extra LE (Latch Enable) control freezes the last read data in an output register when pulsed, letting downstream logic sample a stable value even if the address changes or the bus is later driven by a different device.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'WE',  type: 'input' },
      { pin:  6, name: 'CE',  type: 'input' },
      { pin:  7, name: 'OE',  type: 'input' },
      { pin:  8, name: 'LE',  type: 'input' },
      { pin:  9, name: 'NC1', type: 'nc' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'NC2', type: 'nc' },
      { pin: 12, name: 'IO0', type: 'output' },
      { pin: 13, name: 'IO1', type: 'output' },
      { pin: 14, name: 'IO2', type: 'output' },
      { pin: 15, name: 'IO3', type: 'output' },
      { pin: 16, name: 'IO4', type: 'output' },
      { pin: 17, name: 'IO5', type: 'output' },
      { pin: 18, name: 'IO6', type: 'output' },
      { pin: 19, name: 'IO7', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_16X9_LATCH', inputs: ['A0','A1','A2','A3','IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7','WE','CE','OE','LE'], outputs: ['IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7'] },
    ],
    sequential: true,
  },

  // ── 74212: 144 bit RAM (16x9), 20-pin ──────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x212': {
    name: '74x212',
    simpleName: '144 bit RAM (16x9)',
    description: '16 word x 9 bit static RAM with 3-state outputs (no output latch) (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['ram', 'memory', 'storage', '16x9', 'tri state', 'register-file'],
    guideOverview: 'The 74x212 is a 16 word × 9 bit static RAM with 3-state outputs but without the output latch of the 74x211. Four address bits select one of 16 locations; CE, WE, and OE control enable, write, and output. The 9 IO pins directly reflect the stored data when reading. Use when transparent read-through behavior is acceptable and no output-latching is needed.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input' },
      { pin:  2, name: 'A1',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A3',  type: 'input' },
      { pin:  5, name: 'WE',  type: 'input' },
      { pin:  6, name: 'CE',  type: 'input' },
      { pin:  7, name: 'OE',  type: 'input' },
      { pin:  8, name: 'NC1', type: 'nc' },
      { pin:  9, name: 'NC2', type: 'nc' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'NC3', type: 'nc' },
      { pin: 12, name: 'IO0', type: 'output' },
      { pin: 13, name: 'IO1', type: 'output' },
      { pin: 14, name: 'IO2', type: 'output' },
      { pin: 15, name: 'IO3', type: 'output' },
      { pin: 16, name: 'IO4', type: 'output' },
      { pin: 17, name: 'IO5', type: 'output' },
      { pin: 18, name: 'IO6', type: 'output' },
      { pin: 19, name: 'IO7', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_16X9', inputs: ['A0','A1','A2','A3','IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7','WE','CE','OE'], outputs: ['IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7'] },
    ],
    sequential: true,
  },

  // ── 74213: 192 bit RAM (16x12), 20-pin ─────────────────────────────────────
  /* Primary source: Wikipedia contributors, "7400-series integrated circuits." [Online]. Available: https://en.wikipedia.org/wiki/7400-series_integrated_circuits
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x213': {
    name: '74x213',
    simpleName: '192 bit RAM (16x12)',
    description: '16 word x 12 bit static RAM with 3-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://en.wikipedia.org/wiki/7400-series_integrated_circuits',
    tags: ['ram', 'memory', 'storage', '16x12', 'tri state', 'register-file'],
    guideOverview: 'The 74x213 is a 16 word × 12 bit static RAM with 3-state bidirectional I/O. Four address bits (A0 A3) select one of 16 twelve bit locations. CE (active LOW) enables the chip and WE (active LOW) controls write/read. On a write, the 12 bit word on IO0 IO11 is stored; on a read, the stored word is driven onto the shared IO bus. The 12 bit width is useful for storing 12 bit data words such as an address or control word without external concatenation.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'A2',   type: 'input' },
      { pin:  4, name: 'A3',   type: 'input' },
      { pin:  5, name: 'WE',   type: 'input' },
      { pin:  6, name: 'CE',   type: 'input' },
      { pin:  7, name: 'IO0',  type: 'output' },
      { pin:  8, name: 'IO1',  type: 'output' },
      { pin:  9, name: 'IO2',  type: 'output' },
      { pin: 10, name: 'GND',  type: 'power' },
      { pin: 11, name: 'IO3',  type: 'output' },
      { pin: 12, name: 'IO4',  type: 'output' },
      { pin: 13, name: 'IO5',  type: 'output' },
      { pin: 14, name: 'IO6',  type: 'output' },
      { pin: 15, name: 'IO7',  type: 'output' },
      { pin: 16, name: 'IO8',  type: 'output' },
      { pin: 17, name: 'IO9',  type: 'output' },
      { pin: 18, name: 'IO10', type: 'output' },
      { pin: 19, name: 'IO11', type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM_16X12', inputs: ['A0','A1','A2','A3','IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7','IO8','IO9','IO10','IO11','WE','CE'], outputs: ['IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7','IO8','IO9','IO10','IO11'] },
    ],
    sequential: true,
  },

  // ── 74214: 1024 bit RAM (1024x1), 16-pin ───────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS214 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls214.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x214': {
    name: '74x214',
    simpleName: '1024 bit RAM (1024x1)',
    description: '1024-bit static RAM, 1024x1, 3-state output (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls214.pdf',
    tags: ['ram', 'memory', 'storage', '1024x1', 'tri state'],
    guideOverview: 'The 74x214 is a 1024 word × 1 bit static RAM with a 3-state output made in the low power Schottky (LS) family. Function is the same as the 74x209: ten address bits select one of 1024 locations, CS (active LOW) enables the chip, WE (active LOW) triggers a write, and DOUT is a 3-state output that goes high impedance when CS is HIGH. The LS process reduces power compared to the S-family 74x209 with comparable speed.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'A2',   type: 'input' },
      { pin:  4, name: 'A3',   type: 'input' },
      { pin:  5, name: 'A4',   type: 'input' },
      { pin:  6, name: 'A5',   type: 'input' },
      { pin:  7, name: 'A6',   type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'A7',   type: 'input' },
      { pin: 10, name: 'A8',   type: 'input' },
      { pin: 11, name: 'A9',   type: 'input' },
      { pin: 12, name: 'DIN',  type: 'input' },
      { pin: 13, name: 'WE',   type: 'input' },
      { pin: 14, name: 'CS',   type: 'input' },
      { pin: 15, name: 'DOUT', type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM_1024X1', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','DIN','CS','WE'], outputs: ['DOUT'] },
    ],
    sequential: true,
  },

  // ── 74215: 1024 bit RAM (1024x1) w/ Power Down, 16-pin ─────────────────────
  /* Primary source: Texas Instruments, SN74LS215 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls215.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x215': {
    name: '74x215',
    simpleName: '1024 bit RAM (1024x1) w/ Power Down',
    description: '1024-bit static RAM, 1024x1, 3-state output, power-down (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls215.pdf',
    tags: ['ram', 'memory', 'storage', '1024x1', 'tri state', 'power-down'],
    guideOverview: 'The 74x215 is a 1024 word × 1 bit static RAM like the 74x214 but with an additional Power Down (PD) control pin. When PD is asserted (active HIGH), the chip enters a low power standby state: the internal array is powered down and DOUT is high impedance, but stored data is retained. Driving PD LOW returns the chip to normal operation. Useful in battery backed systems or anywhere quiescent current must be minimised between accesses.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'A2',   type: 'input' },
      { pin:  4, name: 'A3',   type: 'input' },
      { pin:  5, name: 'A4',   type: 'input' },
      { pin:  6, name: 'A5',   type: 'input' },
      { pin:  7, name: 'A6',   type: 'input' },
      { pin:  8, name: 'GND',  type: 'power' },
      { pin:  9, name: 'A7',   type: 'input' },
      { pin: 10, name: 'A8',   type: 'input' },
      { pin: 11, name: 'A9',   type: 'input' },
      { pin: 12, name: 'DIN',  type: 'input' },
      { pin: 13, name: 'WE',   type: 'input' },
      { pin: 14, name: 'PD',   type: 'input' },
      { pin: 15, name: 'DOUT', type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM_1024X1_PD', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','DIN','PD','WE'], outputs: ['DOUT'] },
    ],
    sequential: true,
  },

  // ── 74216: 256 bit RAM (64x4, Common I/O), 16-pin ──────────────────────────
  /* Primary source: Texas Instruments, SN74LS216 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls216.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x216': {
    name: '74x216',
    simpleName: '256 bit RAM (64x4, Common I/O)',
    description: '256-bit static RAM, 64x4, common I/O, 3-state outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls216.pdf',
    tags: ['ram', 'memory', 'storage', '64x4', 'tri state', 'common-io'],
    guideOverview: 'The 74x216 is a 64 word × 4 bit static RAM with common I/O and 3-state outputs. Six address bits (A0 A5) select one of 64 locations. CS (active LOW) enables the chip; WE (active LOW) selects write mode; OE (active LOW) enables the output drivers. On a write (CS LOW, WE LOW), the nibble on IO0 IO3 is stored. On a read (CS LOW, WE HIGH, OE LOW), the stored nibble is driven onto the shared IO pins.',
    pinout: [
      { pin:  1, name: 'A5',  type: 'input' },
      { pin:  2, name: 'A4',  type: 'input' },
      { pin:  3, name: 'A3',  type: 'input' },
      { pin:  4, name: 'A2',  type: 'input' },
      { pin:  5, name: 'A1',  type: 'input' },
      { pin:  6, name: 'A0',  type: 'input' },
      { pin:  7, name: 'WE',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'CS',  type: 'input' },
      { pin: 10, name: 'OE',  type: 'input' },
      { pin: 11, name: 'IO0', type: 'output' },
      { pin: 12, name: 'IO1', type: 'output' },
      { pin: 13, name: 'IO2', type: 'output' },
      { pin: 14, name: 'IO3', type: 'output' },
      { pin: 15, name: 'NC1', type: 'nc' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_64X4_COMMON', inputs: ['A0','A1','A2','A3','A4','A5','IO0','IO1','IO2','IO3','WE','CS','OE'], outputs: ['IO0','IO1','IO2','IO3'] },
    ],
    sequential: true,
  },

  // ── 74217: 256 bit RAM (64x4, Sep I/O), 20-pin ─────────────────────────────
  /* Primary source: Texas Instruments, SN74ALS217 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als217.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x217': {
    name: '74x217',
    simpleName: '256 bit RAM (64x4, Sep I/O)',
    description: '256-bit static RAM, 64x4, separate I/O, 3-state (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als217.pdf',
    tags: ['ram', 'memory', 'storage', '64x4', 'tri state'],
    guideOverview: 'The 74x217 is a 64 word × 4 bit static RAM with separate dedicated input and output ports and 3-state outputs. Six address bits (A0 A5) select one of 64 locations. DIN0-DIN3 are write only data inputs; DOUT0-DOUT3 are separate 3-state read outputs. CS (active LOW), WE (active LOW), and OE (active LOW) control access. The separate ports allow simultaneous bus wiring for input and output paths.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input' },
      { pin:  2, name: 'A1',   type: 'input' },
      { pin:  3, name: 'A2',   type: 'input' },
      { pin:  4, name: 'A3',   type: 'input' },
      { pin:  5, name: 'A4',   type: 'input' },
      { pin:  6, name: 'A5',   type: 'input' },
      { pin:  7, name: 'DIN0', type: 'input' },
      { pin:  8, name: 'DIN1', type: 'input' },
      { pin:  9, name: 'DIN2', type: 'input' },
      { pin: 10, name: 'GND',  type: 'power' },
      { pin: 11, name: 'DIN3', type: 'input' },
      { pin: 12, name: 'WE',   type: 'input' },
      { pin: 13, name: 'CS',   type: 'input' },
      { pin: 14, name: 'OE',   type: 'input' },
      { pin: 15, name: 'NC1',  type: 'nc' },
      { pin: 16, name: 'DOUT3',type: 'output' },
      { pin: 17, name: 'DOUT2',type: 'output' },
      { pin: 18, name: 'DOUT1',type: 'output' },
      { pin: 19, name: 'DOUT0',type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'RAM_64X4', inputs: ['A0','A1','A2','A3','A4','A5','DIN0','DIN1','DIN2','DIN3','WE','CS','OE'], outputs: ['DOUT0','DOUT1','DOUT2','DOUT3'] },
    ],
    sequential: true,
  },

  // ── 74218: 256 bit RAM (32x8, Common I/O), 20-pin ──────────────────────────
  /* Primary source: Texas Instruments, SN74ALS218 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als218.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x218': {
    name: '74x218',
    simpleName: '256 bit RAM (32x8, Common I/O)',
    description: '256-bit static RAM, 32x8, common I/O, 3-state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als218.pdf',
    tags: ['ram', 'memory', 'storage', '32x8', 'tri state', 'common-io'],
    guideOverview: 'The 74x218 is a 32 word × 8 bit (byte wide) static RAM with common I/O and 3-state outputs. Five address bits (A0 A4) select one of 32 byte locations. IO0 IO7 serve as both input and output on a shared 8 bit bus. CS (active LOW) enables the device; WE (active LOW) controls write vs read; OE (active LOW) enables the output drivers. This byte wide organisation makes it convenient for 8 bit microprocessor designs.',
    pinout: [
      { pin:  1, name: 'A4',  type: 'input' },
      { pin:  2, name: 'A3',  type: 'input' },
      { pin:  3, name: 'A2',  type: 'input' },
      { pin:  4, name: 'A1',  type: 'input' },
      { pin:  5, name: 'A0',  type: 'input' },
      { pin:  6, name: 'WE',  type: 'input' },
      { pin:  7, name: 'CS',  type: 'input' },
      { pin:  8, name: 'OE',  type: 'input' },
      { pin:  9, name: 'NC1', type: 'nc' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'NC2', type: 'nc' },
      { pin: 12, name: 'IO0', type: 'output' },
      { pin: 13, name: 'IO1', type: 'output' },
      { pin: 14, name: 'IO2', type: 'output' },
      { pin: 15, name: 'IO3', type: 'output' },
      { pin: 16, name: 'IO4', type: 'output' },
      { pin: 17, name: 'IO5', type: 'output' },
      { pin: 18, name: 'IO6', type: 'output' },
      { pin: 19, name: 'IO7', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_32X8_COMMON', inputs: ['A0','A1','A2','A3','A4','IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7','WE','CS','OE'], outputs: ['IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7'] },
    ],
    sequential: true,
  },

  // ── 74219: 64 bit RAM (16x4, Non Inv Out), 16-pin ──────────────────────────
  /* Primary source: Texas Instruments, SN74LS219 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls219.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Three-state_logic
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x219': {
    name: '74x219',
    simpleName: '64 bit RAM (16x4, Non Inv Out)',
    description: '64-bit static RAM, 16x4, non-inverting 3-state outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls219.pdf',
    tags: ['ram', 'memory', 'storage', '16x4', 'tri state'],
    guideOverview: 'The 74x219 is a 16 word × 4 bit static RAM with non inverting 3-state outputs and separate input/output pins. Four address bits (A0 A3) select one of 16 locations. D1-D4 are dedicated write inputs; Q1-Q4 are separate 3-state outputs that reflect the stored data in true (non inverted) form. CS (active LOW) enables the chip; WE (active LOW) triggers a write.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input' },
      { pin:  2, name: 'Q1',  type: 'output' },
      { pin:  3, name: 'D1',  type: 'input' },
      { pin:  4, name: 'A1',  type: 'input' },
      { pin:  5, name: 'Q2',  type: 'output' },
      { pin:  6, name: 'D2',  type: 'input' },
      { pin:  7, name: 'CS',  type: 'input' },
      { pin:  8, name: 'GND', type: 'power' },
      { pin:  9, name: 'WE',  type: 'input' },
      { pin: 10, name: 'D3',  type: 'input' },
      { pin: 11, name: 'Q3',  type: 'output' },
      { pin: 12, name: 'A2',  type: 'input' },
      { pin: 13, name: 'D4',  type: 'input' },
      { pin: 14, name: 'Q4',  type: 'output' },
      { pin: 15, name: 'A3',  type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'RAM_16X4_NI', inputs: ['A0','A1','A2','A3','D1','D2','D3','D4','CS','WE'], outputs: ['Q1','Q2','Q3','Q4'] },
    ],
    sequential: true,
  },

  // ── 74222: 64 bit FIFO (16x4) Sync, 20-pin ─────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS222 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls222.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x222': {
    name: '74x222',
    simpleName: '64 bit FIFO (16x4) Sync',
    description: '64-bit sync FIFO, 16x4, with I/O ready signals (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls222.pdf',
    tags: ['fifo', 'memory', 'storage', '16x4', 'synchronous', 'sequential'],
    guideOverview: 'The 74x222 is a 16 word × 4 bit synchronous FIFO (first in, first out) memory with independent write and read clocks. Data is written on the rising edge of WR_CLK when WR_EN is active and the Input Ready (IR) flag is HIGH (buffer not full). Data is read on the rising edge of RD_CLK when RD_EN is active and the Output Ready (OR) flag is HIGH (buffer not empty). The Empty Flag (EF) goes HIGH when the FIFO is empty; the Full Flag (FF) goes HIGH when full. Separate handshake signals make it straightforward to connect devices running at different data rates.',
    pinout: [
      { pin:  1, name: 'DIN0',  type: 'input' },
      { pin:  2, name: 'DIN1',  type: 'input' },
      { pin:  3, name: 'DIN2',  type: 'input' },
      { pin:  4, name: 'DIN3',  type: 'input' },
      { pin:  5, name: 'WR_CLK',type: 'input' },
      { pin:  6, name: 'RD_CLK',type: 'input' },
      { pin:  7, name: 'WR_EN', type: 'input' },
      { pin:  8, name: 'RD_EN', type: 'input' },
      { pin:  9, name: 'IR',    type: 'output' },
      { pin: 10, name: 'GND',   type: 'power' },
      { pin: 11, name: 'OR',    type: 'output' },
      { pin: 12, name: 'EF',    type: 'output' },
      { pin: 13, name: 'FF',    type: 'output' },
      { pin: 14, name: 'DOUT0', type: 'output' },
      { pin: 15, name: 'DOUT1', type: 'output' },
      { pin: 16, name: 'DOUT2', type: 'output' },
      { pin: 17, name: 'DOUT3', type: 'output' },
      { pin: 18, name: 'NC1',   type: 'nc' },
      { pin: 19, name: 'NC2',   type: 'nc' },
      { pin: 20, name: 'VCC',   type: 'power' },
    ],
    gates: [
      { type: 'FIFO_16X4_SYNC', inputs: ['DIN0','DIN1','DIN2','DIN3','WR_CLK','RD_CLK','WR_EN','RD_EN'], outputs: ['DOUT0','DOUT1','DOUT2','DOUT3','EF','FF','IR','OR'] },
    ],
    sequential: true,
  },

  // ── 74224: 64 bit FIFO (16x4), 16-pin ──────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS224 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls224.pdf
     Wikipedia: https://en.wikipedia.org/wiki/Random-access_memory */
  '74x224': {
    name: '74x224',
    simpleName: '64 bit FIFO (16x4)',
    description: '64-bit sync FIFO, 16x4, with empty/full flags (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls224.pdf',
    tags: ['fifo', 'memory', 'storage', '16x4', 'synchronous', 'sequential'],
    guideOverview: 'The 74x224 is a 16 word × 4 bit synchronous FIFO in a compact 16-pin package. Write and read operations are independently clocked by WR_CLK and RD_CLK, gated by WR_EN and RD_EN respectively. EF (Empty Flag) is HIGH when the FIFO contains no data; FF (Full Flag) is HIGH when all 16 locations are occupied. Data is pushed in through DIN0-DIN3 and popped out through DOUT0-DOUT3 in first in first out order. Use to buffer data between subsystems running at different speeds or interrupt rates.',
    pinout: [
      { pin:  1, name: 'DIN0',  type: 'input' },
      { pin:  2, name: 'DIN1',  type: 'input' },
      { pin:  3, name: 'DIN2',  type: 'input' },
      { pin:  4, name: 'DIN3',  type: 'input' },
      { pin:  5, name: 'WR_CLK',type: 'input' },
      { pin:  6, name: 'RD_CLK',type: 'input' },
      { pin:  7, name: 'WR_EN', type: 'input' },
      { pin:  8, name: 'GND',   type: 'power' },
      { pin:  9, name: 'RD_EN', type: 'input' },
      { pin: 10, name: 'EF',    type: 'output' },
      { pin: 11, name: 'FF',    type: 'output' },
      { pin: 12, name: 'DOUT0', type: 'output' },
      { pin: 13, name: 'DOUT1', type: 'output' },
      { pin: 14, name: 'DOUT2', type: 'output' },
      { pin: 15, name: 'DOUT3', type: 'output' },
      { pin: 16, name: 'VCC',   type: 'power' },
    ],
    gates: [
      { type: 'FIFO_16X4', inputs: ['DIN0','DIN1','DIN2','DIN3','WR_CLK','RD_CLK','WR_EN','RD_EN'], outputs: ['DOUT0','DOUT1','DOUT2','DOUT3','EF','FF'] },
    ],
    sequential: true,
  },
};
