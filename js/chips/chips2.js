// Chip definitions block 2
// Auto-generated from chips.js

export const CHIPS_BLOCK_2 = {
  // ── 7415: Triple 3 input AND (open collector) ──────────────────────────
  /* Primary source: Texas Instruments, SN74LS15 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls15.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  '74x15': {
    name: '74x15',
    simpleName: 'Triple 3-in AND (OC)',
    description: 'Three independent 3 input AND gates with open collector outputs. (14-pin)',
    guideOverview: 'The 74x15 provides three independent 3 input AND gates with open collector outputs. Like the 74x11 (which has totem pole outputs), the output goes HIGH only when all three inputs are HIGH. The open collector output requires an external pull up resistor and supports wire ANDing and high voltage load driving.',
    guidePinDescriptions: {
      '1A': 'Input A of AND gate 1.',
      '1B': 'Input B of AND gate 1.',
      '2A': 'Input A of AND gate 2.',
      '2B': 'Input B of AND gate 2.',
      '2C': 'Input C of AND gate 2.',
      '2Y': 'Open collector output of gate 2. Conducts (sinks to LOW) when 2A, 2B, and 2C are all HIGH.',
      'GND': 'Ground reference (pin 7).',
      '3Y': 'Open collector output of gate 3. Conducts when 3A, 3B, and 3C are all HIGH.',
      '3A': 'Input A of AND gate 3.',
      '3B': 'Input B of AND gate 3.',
      '3C': 'Input C of AND gate 3.',
      '1Y': 'Open collector output of gate 1. Conducts when 1A, 1B, and 1C are all HIGH.',
      '1C': 'Input C of AND gate 1.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls15.pdf',
    tags: ['and', 'gate', 'logic', 'triple', '3 input', 'open collector'],
    guideSections: [
      {
        title: 'Open Collector 3-Input AND',
        paragraphs: [
          'Logic function is identical to the 74x11: Y = A AND B AND C. The open collector output requires a pull up resistor to produce the HIGH level and supports wire ANDing multiple outputs on a shared bus.',
        ],
        formulas: ['Y = A AND B AND C'],
        note: 'Tie unused inputs to VCC and add a pull up resistor to each used output.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 input B' },
      { pin: 3, name: '2A', type: 'input', description: 'Gate 2 input A' },
      { pin: 4, name: '2B', type: 'input', description: 'Gate 2 input B' },
      { pin: 5, name: '2C', type: 'input', description: 'Gate 2 input C' },
      { pin: 6, name: '2Y', type: 'output', description: 'Gate 2 open collector AND output' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '3Y', type: 'output', description: 'Gate 3 open collector AND output' },
      { pin: 9, name: '3A', type: 'input', description: 'Gate 3 input A' },
      { pin: 10, name: '3B', type: 'input', description: 'Gate 3 input B' },
      { pin: 11, name: '3C', type: 'input', description: 'Gate 3 input C' },
      { pin: 12, name: '1Y', type: 'output', description: 'Gate 1 open collector AND output' },
      { pin: 13, name: '1C', type: 'input', description: 'Gate 1 input C' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'AND', inputs: ['1A', '1B', '1C'], output: '1Y' },
      { type: 'AND', inputs: ['2A', '2B', '2C'], output: '2Y' },
      { type: 'AND', inputs: ['3A', '3B', '3C'], output: '3Y' },
    ],
  },

  // ── 7416: Hex Inverter (open collector, high voltage) ───────────────────
  /* Primary source: Texas Instruments, SN7416 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7416.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  '74x16': {
    name: '74x16',
    simpleName: 'Hex NOT (OC, 15V)',
    description: 'Six open collector inverting buffers/drivers, up to 15V out (14-pin)',
    guideOverview: 'The 74x16 provides six open collector inverting drivers rated for outputs up to 15 V. It fills the gap between standard 5V TTL inverters (74x04/05) and the higher voltage 74x06 (30V). Use it when the load voltage is between 5V and 15V, such as driving 12V indicator LEDs or interfacing to CMOS logic at an intermediate supply.',
    guidePinDescriptions: {
      '1A': 'Input of inverter 1.',
      '1Y': 'Open collector output of inverter 1. Inverts 1A; rated to 15 V.',
      '2A': 'Input of inverter 2.',
      '2Y': 'Open collector output of inverter 2. Inverts 2A.',
      '3A': 'Input of inverter 3.',
      '3Y': 'Open collector output of inverter 3. Inverts 3A.',
      'GND': 'Ground reference (pin 7). Common ground for TTL supply and load.',
      '4Y': 'Open collector output of inverter 4. Inverts 4A.',
      '4A': 'Input of inverter 4.',
      '5Y': 'Open collector output of inverter 5. Inverts 5A.',
      '5A': 'Input of inverter 5.',
      '6Y': 'Open collector output of inverter 6. Inverts 6A.',
      '6A': 'Input of inverter 6.',
      'VCC': 'TTL supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7416.pdf',
    tags: ['not', 'inverter', 'buffer', 'driver', 'gate', 'logic', 'hex', 'open collector', 'high voltage'],
    guideSections: [
      {
        title: 'Inverting 15V Driver',
        paragraphs: [
          'The output inverts the input and can withstand up to 15 V at the output pin. Connect the pull up to the load supply (up to 15 V). The TTL input logic thresholds remain standard 5V.',
        ],
        note: 'Do not exceed 15 V on any output pin. For loads up to 30 V use the 74x06 instead.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Inverter 1 input' },
      { pin: 2, name: '1Y', type: 'output', description: 'Inverter 1 open collector output (NOT 1A)' },
      { pin: 3, name: '2A', type: 'input', description: 'Inverter 2 input' },
      { pin: 4, name: '2Y', type: 'output', description: 'Inverter 2 open collector output (NOT 2A)' },
      { pin: 5, name: '3A', type: 'input', description: 'Inverter 3 input' },
      { pin: 6, name: '3Y', type: 'output', description: 'Inverter 3 open collector output (NOT 3A)' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '4Y', type: 'output', description: 'Inverter 4 open collector output (NOT 4A)' },
      { pin: 9, name: '4A', type: 'input', description: 'Inverter 4 input' },
      { pin: 10, name: '5Y', type: 'output', description: 'Inverter 5 open collector output (NOT 5A)' },
      { pin: 11, name: '5A', type: 'input', description: 'Inverter 5 input' },
      { pin: 12, name: '6Y', type: 'output', description: 'Inverter 6 open collector output (NOT 6A)' },
      { pin: 13, name: '6A', type: 'input', description: 'Inverter 6 input' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },

  // ── 7417: Hex Buffer (open collector, high voltage) ─────────────────────
  /* Primary source: Texas Instruments, SN7417 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7417.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  '74x17': {
    name: '74x17',
    simpleName: 'Hex Buffer (OC, 15V)',
    description: 'Six non inverting open collector buffers/drivers, up to 15V out (14-pin)',
    guideOverview: 'The 74x17 provides six non inverting open collector buffers rated to 15 V. It is the non inverting counterpart to the 74x16. A HIGH input causes the output transistor to conduct, sinking current from the load. Useful for driving active LOW loads at up to 15V while keeping control logic at 5V.',
    guidePinDescriptions: {
      '1A': 'Input of buffer 1.',
      '1Y': 'Open collector output of buffer 1. Conducts when 1A is HIGH.',
      '2A': 'Input of buffer 2.',
      '2Y': 'Open collector output of buffer 2. Conducts when 2A is HIGH.',
      '3A': 'Input of buffer 3.',
      '3Y': 'Open collector output of buffer 3. Conducts when 3A is HIGH.',
      'GND': 'Ground reference (pin 7). Common ground for TTL supply and load.',
      '4Y': 'Open collector output of buffer 4. Conducts when 4A is HIGH.',
      '4A': 'Input of buffer 4.',
      '5Y': 'Open collector output of buffer 5. Conducts when 5A is HIGH.',
      '5A': 'Input of buffer 5.',
      '6Y': 'Open collector output of buffer 6. Conducts when 6A is HIGH.',
      '6A': 'Input of buffer 6.',
      'VCC': 'TTL supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7417.pdf',
    tags: ['buffer', 'driver', 'gate', 'logic', 'hex', 'open collector', 'high voltage', 'non inverting'],
    guideSections: [
      {
        title: 'Non Inverting 15V Buffer',
        paragraphs: [
          'Each output passes the input logic state through without inversion, but using an open collector stage capable of sinking current at up to 15 V. A pull up to the load rail is required.',
        ],
        note: 'Do not exceed 15 V on any output pin. For loads up to 30 V use the 74x07 instead.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Buffer 1 input' },
      { pin: 2, name: '1Y', type: 'output', description: 'Buffer 1 open collector output (= 1A)' },
      { pin: 3, name: '2A', type: 'input', description: 'Buffer 2 input' },
      { pin: 4, name: '2Y', type: 'output', description: 'Buffer 2 open collector output (= 2A)' },
      { pin: 5, name: '3A', type: 'input', description: 'Buffer 3 input' },
      { pin: 6, name: '3Y', type: 'output', description: 'Buffer 3 open collector output (= 3A)' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '4Y', type: 'output', description: 'Buffer 4 open collector output (= 4A)' },
      { pin: 9, name: '4A', type: 'input', description: 'Buffer 4 input' },
      { pin: 10, name: '5Y', type: 'output', description: 'Buffer 5 open collector output (= 5A)' },
      { pin: 11, name: '5A', type: 'input', description: 'Buffer 5 input' },
      { pin: 12, name: '6Y', type: 'output', description: 'Buffer 6 open collector output (= 6A)' },
      { pin: 13, name: '6A', type: 'input', description: 'Buffer 6 input' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'BUFFER', inputs: ['1A'], output: '1Y' },
      { type: 'BUFFER', inputs: ['2A'], output: '2Y' },
      { type: 'BUFFER', inputs: ['3A'], output: '3Y' },
      { type: 'BUFFER', inputs: ['4A'], output: '4Y' },
      { type: 'BUFFER', inputs: ['5A'], output: '5Y' },
      { type: 'BUFFER', inputs: ['6A'], output: '6Y' },
    ],
  },

  // ── 7421: Dual 4 input AND ──────────────────────────────────────────────
  // Source: Texas Instruments, "SN54LS21, SN74LS21 Dual 4-Input Positive-AND
  //   Gates", SDLS139 (Apr. 1985, rev. Mar. 1988). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74ls21.pdf. Verified: terminal
  //   assignment (D/N package, top view), FUNCTION TABLE, and logic diagram,
  //   p. 1, read as PDF page images (not a text summary — issues.md C4).
  //   Pinout (1A,1B,NC,1C,1D,1Y,GND,2Y,2A,2B,NC,2C,2D,VCC) and both 4-input AND
  //   gates confirmed CORRECT against this datasheet; engine left unchanged.
  //   Switching (SN74LS21, p. 3): tPLH 8/15 ns, tPHL 10/20 ns typ/max.
  '74x21': {
    name: '74x21',
    simpleName: 'Dual 4-in AND',
    description: 'Two independent 4 input AND gates. (14-pin)',
    guideOverview: 'The 74x21 holds two separate 4 input AND gates in one 14-pin package. Each gate drives its output HIGH only when all four of its inputs are HIGH at the same time; if even one input is LOW, the output goes LOW. A plain AND is less common in the 74 family than NAND or NOR, so the 74x21 is the part you reach for when you want a true AND that is four inputs wide without adding an inverter. That width suits checking for one exact input pattern or combining several enable/condition signals into one. Pins 3 and 11 are NC (no internal connection); the two gates use the other twelve pins.',
    guidePinDescriptions: {
      '1A': 'Input A of AND gate 1.',
      '1B': 'Input B of AND gate 1.',
      'NC': 'No internal connection (pins 3 and 11). Leave unconnected — these are not spare inputs.',
      '1C': 'Input C of AND gate 1.',
      '1D': 'Input D of AND gate 1.',
      '1Y': 'Output of gate 1. HIGH only when 1A, 1B, 1C, and 1D are all HIGH.',
      'GND': 'Ground reference (pin 7).',
      '2Y': 'Output of gate 2. HIGH only when 2A, 2B, 2C, and 2D are all HIGH.',
      '2A': 'Input A of AND gate 2.',
      '2B': 'Input B of AND gate 2.',
      '2C': 'Input C of AND gate 2.',
      '2D': 'Input D of AND gate 2.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls21.pdf',
    tags: ['and', 'gate', 'logic', 'dual', '4 input'],
    guideSections: [
      {
        title: '4 Input AND Logic',
        paragraphs: [
          'Each gate ANDs its four inputs. The output is HIGH only for the one combination where all four inputs (1A, 1B, 1C, 1D — or 2A, 2B, 2C, 2D) are HIGH at once. Any single input LOW forces the output LOW.',
          'Four inputs give 16 possible combinations, and only one of them (all HIGH) produces a HIGH output. That is why a wide AND is good at recognising one exact pattern: the output stays LOW until every input matches.',
          'The two gates are fully independent. They share only the VCC and GND pins; there is no interaction between gate 1 and gate 2.',
        ],
        formulas: [
          'Y = A AND B AND C AND D',
          'All four inputs HIGH -> Y HIGH  |  any input LOW -> Y LOW',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Pattern detection: the output goes HIGH only when the four inputs read 1111, so it flags one exact 4 bit value.',
          'Address or state decoding: AND together the address or select lines that pick a single device, memory location, or step.',
          'Gating with several enables: use some inputs as data and the rest as enable lines, so a signal only passes when every enable is HIGH.',
          'Widening an AND: feed one gate output into an input of another AND gate to require more than four conditions at once.',
        ],
      },
      {
        title: 'Practical Notes and Gotchas',
        list: [
          'Do not leave inputs floating. Tie any input you are not using to VCC (HIGH) so it cannot pull the AND result LOW. A floating TTL input tends to read HIGH, but relying on that is unreliable — wire it deliberately, ideally through a ~1 kOhm resistor to VCC.',
          'Pins 3 and 11 are NC. They have no internal connection and are not spare inputs; leave them open.',
          'This is a plain AND with a normal (totem-pole) output. It is not open collector, so you cannot tie two outputs together to wire-AND them. For that, use the 74x22 (dual 4 input NAND with open collector outputs).',
          'The simulator treats the gate as instantaneous. A real 74LS21 has a small propagation delay (about 8-10 ns typical) — a simplification that does not change the logic, but matters in fast timing.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 input B' },
      { pin: 3, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 4, name: '1C', type: 'input', description: 'Gate 1 input C' },
      { pin: 5, name: '1D', type: 'input', description: 'Gate 1 input D' },
      { pin: 6, name: '1Y', type: 'output', description: 'Gate 1 AND output' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '2Y', type: 'output', description: 'Gate 2 AND output' },
      { pin: 9, name: '2A', type: 'input', description: 'Gate 2 input A' },
      { pin: 10, name: '2B', type: 'input', description: 'Gate 2 input B' },
      { pin: 11, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 12, name: '2C', type: 'input', description: 'Gate 2 input C' },
      { pin: 13, name: '2D', type: 'input', description: 'Gate 2 input D' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'AND', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'AND', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },

  // ── 7422: Dual 4 input NAND (open collector) ───────────────────────────
  /* Primary source: Texas Instruments, SN74LS22 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls22.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  '74x22': {
    name: '74x22',
    simpleName: 'Dual 4-in NAND (OC)',
    description: 'Two independent 4 input NAND gates with open collector outputs. (14-pin)',
    guideOverview: 'The 74x22 provides two 4 input NAND gates with open collector outputs. The output pulls LOW only when all four inputs are HIGH. External pull up resistors are required. Allows wire ANDing and interfacing to higher voltage loads.',
    guidePinDescriptions: {
      '1A': 'Input A of NAND gate 1.',
      '1B': 'Input B of NAND gate 1.',
      'NC': 'Not connected leave unconnected.',
      '1C': 'Input C of NAND gate 1.',
      '1D': 'Input D of NAND gate 1.',
      '1Y':  'Open collector output of gate 1 (active LOW, open collector). Pulls LOW only when all four inputs are HIGH.',
      'GND': 'Ground reference (pin 7).',
      '2Y':  'Open collector output of gate 2 (active LOW, open collector). Pulls LOW only when all four inputs are HIGH.',
      '2A': 'Input A of NAND gate 2.',
      '2B': 'Input B of NAND gate 2.',
      '2C': 'Input C of NAND gate 2.',
      '2D': 'Input D of NAND gate 2.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls22.pdf',
    tags: ['nand', 'gate', 'logic', 'dual', '4 input', 'open collector'],
    guideSections: [
      {
        title: 'Open Collector 4 Input NAND',
        paragraphs: ['Y = NOT(A AND B AND C AND D). Output pulls LOW only when all four inputs are HIGH. Requires external pull up resistor.'],
        note: 'Tie unused inputs to VCC to prevent spurious LOW outputs.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 input B' },
      { pin: 3, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 4, name: '1C', type: 'input', description: 'Gate 1 input C' },
      { pin: 5, name: '1D', type: 'input', description: 'Gate 1 input D' },
      { pin: 6, name: '1Y', type: 'output', description: 'Gate 1 open collector NAND output' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '2Y', type: 'output', description: 'Gate 2 open collector NAND output' },
      { pin: 9, name: '2A', type: 'input', description: 'Gate 2 input A' },
      { pin: 10, name: '2B', type: 'input', description: 'Gate 2 input B' },
      { pin: 11, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 12, name: '2C', type: 'input', description: 'Gate 2 input C' },
      { pin: 13, name: '2D', type: 'input', description: 'Gate 2 input D' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },

  // ── 7425: Dual 4 input NOR with strobe ─────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS25 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls25.pdf */
  '74x25': {
    name: '74x25',
    simpleName: 'Dual 4-in NOR (strobe)',
    description: 'Two 4-input NOR gates, each with active HIGH strobe/enable (14-pin)',
    guideOverview: 'The 74x25 contains two 4 input NOR gates, each with an active HIGH strobe (enable) input. The function is Y = NOT(G AND (A OR B OR C OR D)): when the strobe (1G or 2G) is HIGH, the gate works as a normal NOR output HIGH only when all four data inputs are LOW. When the strobe is LOW, the output is forced HIGH regardless of the data inputs. A floating strobe reads HIGH (TTL pull up), so the gate behaves as a plain 4 input NOR until the strobe is deliberately pulled LOW.',
    guidePinDescriptions: {
      '1A':  'Input A of NOR gate 1.',
      '1B':  'Input B of NOR gate 1.',
      '1G':  'Strobe (enable) for gate 1 (active HIGH). HIGH (or floating) allows normal NOR operation. LOW forces 1Y HIGH.',
      '1C':  'Input C of NOR gate 1.',
      '1D':  'Input D of NOR gate 1.',
      '1Y':  'NOR output of gate 1. LOW when 1G=HIGH and any data input is HIGH; otherwise HIGH.',
      'GND': 'Ground reference (pin 7).',
      '2Y':  'NOR output of gate 2. LOW when 2G=HIGH and any data input is HIGH; otherwise HIGH.',
      '2A':  'Input A of NOR gate 2.',
      '2B':  'Input B of NOR gate 2.',
      '2G':  'Strobe (enable) for gate 2 (active HIGH). HIGH (or floating) allows normal NOR operation. LOW forces 2Y HIGH.',
      '2C':  'Input C of NOR gate 2.',
      '2D':  'Input D of NOR gate 2.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls25.pdf',
    tags: ['nor', 'gate', 'logic', 'dual', '4 input', 'strobe', 'enable'],
    guideSections: [
      {
        title: 'NOR with Strobe Logic',
        paragraphs: [
          'Per the TI datasheet (SDLS082) the gate computes Y = NOT(G AND (A OR B OR C OR D)). With G HIGH the gate is a normal 4 input NOR. Pulling G LOW blanks the gate: the output is forced HIGH no matter what the data inputs do.',
          'The strobe is useful for selectively blanking one of several NOR sections, or for generating controlled pulses by briefly dropping the strobe.',
        ],
        note: 'Because a floating TTL input reads HIGH, an unconnected strobe leaves the gate operating as a plain 4 input NOR.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 data input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 data input B' },
      { pin: 3, name: '1G', type: 'input', description: 'Gate 1 strobe (HIGH = normal NOR operation, LOW forces output HIGH)' },
      { pin: 4, name: '1C', type: 'input', description: 'Gate 1 data input C' },
      { pin: 5, name: '1D', type: 'input', description: 'Gate 1 data input D' },
      { pin: 6, name: '1Y', type: 'output', description: 'Gate 1 NOR output' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '2Y', type: 'output', description: 'Gate 2 NOR output' },
      { pin: 9, name: '2A', type: 'input', description: 'Gate 2 data input A' },
      { pin: 10, name: '2B', type: 'input', description: 'Gate 2 data input B' },
      { pin: 11, name: '2G', type: 'input', description: 'Gate 2 strobe (HIGH = normal NOR operation, LOW forces output HIGH)' },
      { pin: 12, name: '2C', type: 'input', description: 'Gate 2 data input C' },
      { pin: 13, name: '2D', type: 'input', description: 'Gate 2 data input D' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'NOR_STROBE', inputs: ['1A', '1B', '1C', '1D', '1G'], output: '1Y' },
      { type: 'NOR_STROBE', inputs: ['2A', '2B', '2C', '2D', '2G'], output: '2Y' },
    ],
  },

  // ── 7427: Triple 3 input NOR ────────────────────────────────────────────
  // Source: Texas Instruments, "SN5427, SN54LS27, SN7427, SN74LS27 Triple
  //   3-Input Positive-NOR Gates," SDLS089 (Dec. 1983, rev. Mar. 1988).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls27.pdf.
  //   Verified: D/N (DIP-14) terminal assignment + per-gate function table
  //   (any input H -> Y=L; A=B=C=L -> Y=H) + positive-logic equation
  //   (Y = NOT(A+B+C) = Ā·B̄·C̄) on page 1, read as 300-dpi PDF page images
  //   (not a text summarizer; issues.md C4). Switching characteristics
  //   (7427, VCC=5 V, 25 °C): tPLH 10 ns typ / 15 max, tPHL 7 ns typ /
  //   11 max, page 3. Pinout 1A=1, 1B=2, 2A=3, 2B=4, 2C=5, 2Y=6, GND=7,
  //   3Y=8, 3A=9, 3B=10, 3C=11, 1Y=12, 1C=13, VCC=14 confirms the repo
  //   entry — note gate 1's 1C (pin 13) and 1Y (pin 12) are split away from
  //   1A/1B, unlike gates 2 and 3. Engine (pinout[], three NOR gates[]) left
  //   unchanged — verified correct. Regression:
  //   js/debug/scenarios/74x27-triple-3in-nor.mjs.
  '74x27': {
    name: '74x27',
    simpleName: 'Triple 3 input NOR',
    description: 'Three independent 3 input NOR gates. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls27.pdf',
    tags: ['nor', 'gate', 'logic', 'triple', '3 input'],
    guideOverview: 'The 74x27 packs three independent 3 input NOR gates into one 14-pin chip. Each gate outputs HIGH only when all three of its inputs are LOW; a single HIGH input anywhere drives that gate LOW. That makes each gate an all-inputs-LOW detector, and because NOR is a universal gate any logic function can be built from NOR alone it also serves as general glue logic. Watch the layout: gates 2 and 3 keep their three inputs together, but gate 1 splits its third input (1C) and its output (1Y) across the chip on pins 13 and 12, away from 1A and 1B.',
    guidePinDescriptions: {
      '1A':  'Gate 1 input A (pin 1).',
      '1B':  'Gate 1 input B (pin 2).',
      '2A':  'Gate 2 input A (pin 3).',
      '2B':  'Gate 2 input B (pin 4).',
      '2C':  'Gate 2 input C (pin 5).',
      '2Y':  'Gate 2 output (pin 6). HIGH only when 2A, 2B, and 2C are all LOW.',
      'GND': 'Ground, 0 V (pin 7).',
      '3Y':  'Gate 3 output (pin 8). HIGH only when 3A, 3B, and 3C are all LOW.',
      '3A':  'Gate 3 input A (pin 9).',
      '3B':  'Gate 3 input B (pin 10).',
      '3C':  'Gate 3 input C (pin 11).',
      '1Y':  'Gate 1 output (pin 12). HIGH only when 1A, 1B, and 1C are all LOW. It sits across the chip from 1A and 1B.',
      '1C':  'Gate 1 input C (pin 13). Note the jump: this input is on the far side of the chip from 1A and 1B.',
      'VCC': 'Positive supply, +5 V (pin 14).',
    },
    guideSections: [
      {
        title: 'How the 3-Input NOR Works',
        paragraphs: [
          'A NOR gate is an OR gate followed by an inverter. With three inputs the OR part is HIGH whenever any input is HIGH, so the inverted output is LOW the moment at least one input goes HIGH. The output is HIGH in only one of the eight input combinations: all three inputs LOW.',
          'Read the other way (this is De Morgan), the same gate says the output is HIGH only when input A AND input B AND input C are all LOW. Either way you describe it, it is an all-inputs-LOW detector for its three inputs.',
        ],
        formulas: [
          'Y = NOT(A OR B OR C)',
          'Y = (NOT A) AND (NOT B) AND (NOT C)',
          'A=0,B=0,C=0 → Y=1  |  any input =1 → Y=0',
        ],
      },
      {
        title: 'The Split Gate-1 Pinout',
        paragraphs: [
          'Gates 2 and 3 are easy to wire: each keeps its three inputs and its output on neighbouring pins (2A–2C on 3–5 with 2Y on 6; 3A–3C on 9–11 with 3Y on 8). Gate 1 does not follow suit. Its first two inputs 1A and 1B are on pins 1 and 2, but its third input 1C is on pin 13 and its output 1Y is on pin 12 both on the far side of the package.',
          'Miswiring gate 1 is the most common mistake with this chip. Go by the pin numbers, not by which pins are physically close together.',
        ],
        note: 'This split layout is the real 7427 pinout from the datasheet, not a quirk of this simulator.',
      },
      {
        title: 'Using Fewer Inputs and Handling Unused Ones',
        paragraphs: [
          'You do not have to use all three inputs of a gate. Tie two inputs together to get a 2 input NOR, or tie all three together to make an inverter (a NOT gate).',
          'If you leave an input unused, tie it LOW (to ground) rather than floating. A NOR output goes LOW the instant any input is HIGH, so an input left to drift HIGH would jam the output LOW. This is the opposite of a NAND gate, where spare inputs are tied HIGH. (Real TTL inputs tend to read HIGH when floating, which is exactly the state you do not want here.)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Detecting an all-zero condition on up to three signals: the output is HIGH only when every input is LOW.',
          'Combining status or interrupt lines: the output drops LOW the moment any one of the three inputs goes HIGH.',
          'Making an inverter or a 2 input NOR from a spare gate by tying inputs together.',
          'General glue logic: NOR is a universal gate, so AND, OR, and NOT can all be built from these gates alone.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 input B' },
      { pin: 3, name: '2A', type: 'input', description: 'Gate 2 input A' },
      { pin: 4, name: '2B', type: 'input', description: 'Gate 2 input B' },
      { pin: 5, name: '2C', type: 'input', description: 'Gate 2 input C' },
      { pin: 6, name: '2Y', type: 'output', description: 'Gate 2 output: HIGH only when 2A, 2B, and 2C are all LOW' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0 V)' },
      { pin: 8, name: '3Y', type: 'output', description: 'Gate 3 output: HIGH only when 3A, 3B, and 3C are all LOW' },
      { pin: 9, name: '3A', type: 'input', description: 'Gate 3 input A' },
      { pin: 10, name: '3B', type: 'input', description: 'Gate 3 input B' },
      { pin: 11, name: '3C', type: 'input', description: 'Gate 3 input C' },
      { pin: 12, name: '1Y', type: 'output', description: 'Gate 1 output: HIGH only when 1A, 1B, and 1C are all LOW' },
      { pin: 13, name: '1C', type: 'input', description: 'Gate 1 input C' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A', '1B', '1C'], output: '1Y' },
      { type: 'NOR', inputs: ['2A', '2B', '2C'], output: '2Y' },
      { type: 'NOR', inputs: ['3A', '3B', '3C'], output: '3Y' },
    ],
  },

  // ── 7430: 8-input NAND ─────────────────────────────────────────────────
  // Source: Texas Instruments, "SN5430, SN54LS30, SN54S30, SN7430, SN74LS30,
  //   SN74S30 8-Input Positive-NAND Gates," SDLS099 (Dec. 1983, rev. Mar. 1988).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls30.pdf.
  //   Verified: D/N (DIP-14) terminal assignment, function table, and positive-
  //   logic equation on page 1, read as 300-dpi PDF page images (not a text
  //   summarizer; issues.md C4). Pinout A=1, B=2, C=3, D=4, E=5, F=6, GND=7,
  //   Y=8, NC=9, NC=10, G=11, H=12, NC=13, VCC=14 confirms the repo entry.
  '74x30': {
    name: '74x30',
    simpleName: '8-input NAND',
    description: 'One 8-input NAND gate. (14-pin)',
    guideOverview: 'The 74x30 is a single 8-input NAND gate, and that one gate fills an entire 14-pin package. Its output goes LOW only when all eight inputs (A through H) are HIGH at the same time; if any input is LOW, the output stays HIGH. That makes it an all-ones detector: wire eight signals to the inputs and the output drops for exactly one pattern, the one where every input is HIGH. It shows up most in address decoding and chip-select logic, where one specific 8-bit value needs to pull a single active-low line. Only 11 of the 14 pins carry signal; pins 9, 10, and 13 are not connected.',
    guidePinDescriptions: {
      'A': 'Data input A (pin 1).',
      'B': 'Data input B (pin 2).',
      'C': 'Data input C (pin 3).',
      'D': 'Data input D (pin 4).',
      'E': 'Data input E (pin 5).',
      'F': 'Data input F (pin 6).',
      'GND': 'Ground, 0 V (pin 7).',
      'Y': 'NAND output (pin 8). LOW only when inputs A through H are all HIGH; HIGH otherwise.',
      'NC1': 'No internal connection (pin 9). Leave it open.',
      'NC2': 'No internal connection (pin 10). Leave it open.',
      'G': 'Data input G (pin 11). Note the jump: G and H are not next to A through F.',
      'H': 'Data input H (pin 12).',
      'NC3': 'No internal connection (pin 13). Leave it open.',
      'VCC': 'Positive supply, +5 V (pin 14).',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls30.pdf',
    tags: ['nand', 'gate', 'logic', '8-input'],
    guideSections: [
      {
        title: 'How the 8-Input NAND Works',
        paragraphs: [
          'A NAND gate is an AND gate followed by an inverter. With eight inputs, the AND part is only true when every single input is HIGH, so the inverted output is LOW in that one case and HIGH for every other combination.',
          'Eight inputs give 256 possible combinations. The output is LOW for exactly one of them (all eight HIGH) and HIGH for the other 255. The same gate can be read the other way (this is De Morgan): the output is HIGH as soon as any single input is LOW.',
        ],
        formulas: [
          'Y = NOT(A AND B AND C AND D AND E AND F AND G AND H)',
          'Y = (NOT A) OR (NOT B) OR ... OR (NOT H)',
          'All inputs HIGH -> Y = LOW  |  any input LOW -> Y = HIGH',
        ],
      },
      {
        title: 'One Gate in a 14-Pin Chip',
        paragraphs: [
          'Most 14-pin logic chips pack several small gates; the 74x00, for example, holds four 2-input NANDs. The 74x30 spends the whole package on one gate, because eight inputs plus an output plus two power pins already use 11 of the 14 pins.',
          'Watch the layout when you wire it. Inputs A through F sit on pins 1 to 6, but G and H jump to pins 11 and 12, and the output Y is on pin 8. Pins 9, 10, and 13 are marked NC (no connection) on the datasheet and carry no signal, so do not use them as tie points or to route a wire across the chip.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Detecting an all-ones byte on an 8-bit bus, or the top count of an 8-bit counter.',
          'Address decoding: feed in eight address lines to make a single active-low chip-select that fires on one specific address.',
          'Detecting any chosen 8-bit pattern, not just all-ones, by putting an inverter on each input that should be LOW for a match.',
          'Combining eight active-high enable or status signals into one condition.',
        ],
      },
      {
        title: 'Using Fewer Than 8 Inputs, and Gotchas',
        paragraphs: [
          'To use it as a narrower gate, say a 5-input NAND, tie each unused input HIGH, usually to VCC through a resistor shared by the spare inputs. A HIGH input has no effect on a NAND; a LOW one would jam the output HIGH, and a floating TTL input drifts and picks up noise.',
        ],
        list: [
          'Tie every unused input HIGH; never leave an input floating.',
          'The output is active-LOW on a match: it goes LOW when the condition is met. If you need a HIGH-on-match signal, add an inverter after Y.',
          'It is one gate, not four. If you only need a 2-input NAND, a 74x00 uses fewer pins.',
        ],
        note: 'Real gates take a few nanoseconds to switch (propagation delay). This simulator treats gate outputs as updating instantly, which is a simplification.',
      },
    ],
    pinout: [
      { pin: 1, name: 'A', type: 'input' },
      { pin: 2, name: 'B', type: 'input' },
      { pin: 3, name: 'C', type: 'input' },
      { pin: 4, name: 'D', type: 'input' },
      { pin: 5, name: 'E', type: 'input' },
      { pin: 6, name: 'F', type: 'input' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: 'Y', type: 'output' },
      { pin: 9, name: 'NC1', type: 'nc' },
      { pin: 10, name: 'NC2', type: 'nc' },
      { pin: 11, name: 'G', type: 'input' },
      { pin: 12, name: 'H', type: 'input' },
      { pin: 13, name: 'NC3', type: 'nc' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], output: 'Y' },
    ],
  },

  // ── 7437: Quad 2 input NAND (buffer) ────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS37 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls37.pdf */
  '74x37': {
    name: '74x37',
    simpleName: 'Quad 2 Input NAND Buffer',
    description: 'Quad 2 input NAND gate with buffered outputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls37.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'buffer', 'TTL'],
    guideOverview: 'The 74x37 contains four independent 2 input NAND gates with buffered outputs. The buffered outputs allow it to sink more current than the standard 74x00 the 74x37 can sink up to 8 mA and the 74x37 (original) up to 48 mA per output making it suitable for driving larger loads or multiple inputs without risking output voltage sag.',
    guidePinDescriptions: {
      '1A':  'Input A of gate 1.',
      '1B':  'Input B of gate 1.',
      '1Y':  'Buffered NAND output of gate 1. LOW only when 1A and 1B are both HIGH.',
      '2A':  'Input A of gate 2.',
      '2B':  'Input B of gate 2.',
      '2Y':  'Buffered NAND output of gate 2.',
      GND:   'Ground reference. Connect to 0 V.',
      '3Y':  'Buffered NAND output of gate 3.',
      '3A':  'Input A of gate 3.',
      '3B':  'Input B of gate 3.',
      '4Y':  'Buffered NAND output of gate 4.',
      '4A':  'Input A of gate 4.',
      '4B':  'Input B of gate 4.',
      VCC:   'Positive supply (+5 V TTL).',
    },
    pinout: [
      { pin:  1, name: '1A',  type: 'input',  description: 'Gate 1 input A' },
      { pin:  2, name: '1B',  type: 'input',  description: 'Gate 1 input B' },
      { pin:  3, name: '1Y',  type: 'output', description: 'Gate 1 buffered NAND output: LOW only when 1A and 1B are both HIGH' },
      { pin:  4, name: '2A',  type: 'input',  description: 'Gate 2 input A' },
      { pin:  5, name: '2B',  type: 'input',  description: 'Gate 2 input B' },
      { pin:  6, name: '2Y',  type: 'output', description: 'Gate 2 buffered NAND output' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: '3Y',  type: 'output', description: 'Gate 3 buffered NAND output' },
      { pin:  9, name: '3A',  type: 'input',  description: 'Gate 3 input A' },
      { pin: 10, name: '3B',  type: 'input',  description: 'Gate 3 input B' },
      { pin: 11, name: '4Y',  type: 'output', description: 'Gate 4 buffered NAND output' },
      { pin: 12, name: '4A',  type: 'input',  description: 'Gate 4 input A' },
      { pin: 13, name: '4B',  type: 'input',  description: 'Gate 4 input B' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
    guideSections: [
      {
        title: 'NAND Logic with Buffered Output',
        paragraphs: [
          'A NAND gate outputs LOW only when all inputs are simultaneously HIGH; any LOW input forces the output HIGH.',
          'The 74x37 is pin compatible with the 74x00 but provides higher output current. Use it when driving heavy loads or many gate inputs from a single output. The 74x37 sinks up to 8 mA; the original 74x37 sinks up to 48 mA.',
        ],
        list: [
          'Tie both inputs together to use a gate as an inverter.',
          'Tie one input HIGH to route the other input through as an inverter.',
          'Chain outputs to wire OR logic using the open collector 74x38 instead.',
        ],
        note: 'The 74x37 is a drop-in replacement for the 74x00 in most circuits. Upgrade to it when output loading causes logic level problems.',
      },
    ],
  },

  // ── 7438: Quad 2 input NAND (open collector, buffered) ─────────────────
  /* Primary source: Texas Instruments, SN74LS38 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls38.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  '74x38': {
    name: '74x38',
    simpleName: 'Quad 2 Input NAND (Open Collector)',
    description: 'Quad 2 input NAND gate with buffered open collector outputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls38.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'open collector', 'TTL'],
    guideOverview: 'The 74x38 contains four 2 input NAND gates with open collector buffered outputs. Open collector outputs can only sink current they pull the output LOW when active but rely on an external pull up resistor to reach a HIGH level. This allows multiple outputs to be wire AND connected to a single bus and enables interfacing to circuits with different supply voltages. The 74x38 can sink up to 48 mA per output.',
    guidePinDescriptions: {
      '1A':  'Input A of gate 1.',
      '1B':  'Input B of gate 1.',
      '1Y':  'Open collector NAND output of gate 1. Pulled LOW when 1A and 1B are both HIGH; open otherwise. Requires external pull up resistor.',
      '2A':  'Input A of gate 2.',
      '2B':  'Input B of gate 2.',
      '2Y':  'Open collector NAND output of gate 2.',
      GND:   'Ground reference. Connect to 0 V.',
      '3Y':  'Open collector NAND output of gate 3.',
      '3A':  'Input A of gate 3.',
      '3B':  'Input B of gate 3.',
      '4Y':  'Open collector NAND output of gate 4.',
      '4A':  'Input A of gate 4.',
      '4B':  'Input B of gate 4.',
      VCC:   'Positive supply (+5 V TTL).',
    },
    pinout: [
      { pin:  1, name: '1A',  type: 'input',  description: 'Gate 1 input A' },
      { pin:  2, name: '1B',  type: 'input',  description: 'Gate 1 input B' },
      { pin:  3, name: '1Y',  type: 'output', description: 'Gate 1 open collector NAND output. LOW when 1A and 1B are both HIGH; open otherwise' },
      { pin:  4, name: '2A',  type: 'input',  description: 'Gate 2 input A' },
      { pin:  5, name: '2B',  type: 'input',  description: 'Gate 2 input B' },
      { pin:  6, name: '2Y',  type: 'output', description: 'Gate 2 open collector NAND output' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: '3Y',  type: 'output', description: 'Gate 3 open collector NAND output' },
      { pin:  9, name: '3A',  type: 'input',  description: 'Gate 3 input A' },
      { pin: 10, name: '3B',  type: 'input',  description: 'Gate 3 input B' },
      { pin: 11, name: '4Y',  type: 'output', description: 'Gate 4 open collector NAND output' },
      { pin: 12, name: '4A',  type: 'input',  description: 'Gate 4 input A' },
      { pin: 13, name: '4B',  type: 'input',  description: 'Gate 4 input B' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
    guideSections: [
      {
        title: 'Open Collector NAND Output',
        paragraphs: [
          'Open collector outputs cannot source current they can only pull the line LOW. An external pull up resistor (typically 1-10 kΩ to VCC) is required for each output to achieve a logic HIGH level.',
          'Because the output only actively drives LOW, multiple open collector outputs can be connected to the same wire (wire AND). If any one output is LOW, the shared line goes LOW. This is useful for interrupt buses and I²C-style communication.',
          'The open collector structure also lets you interface to a bus at a different voltage than VCC by pulling up to that higher rail through the resistor, as long as the transistor breakdown voltage is not exceeded.',
        ],
        list: [
          'Always add a pull up resistor outputs will float HIGH without one.',
          'Wire AND: connect multiple 74x38 outputs together with a single shared pull up to create logical AND across the outputs.',
          'Pin compatible with 74x00 and 74x37; use when wire AND or level shifting is needed.',
        ],
        note: '74Sim models open-collector outputs accurately. When the gate result is LOW the output sinks to GND through a finite output impedance; when the result is HIGH the output enters Hi-Z and is held up by an automatically-applied implicit 4.7 kΩ pull-up to VCC, so an undriven net still reads HIGH. Explicit external pull-up resistors stack in parallel via the analog solver, so wire-AND and level shifting behave as expected.',
      },
    ],
  },

  // ── 7440: Dual 4 input NAND (buffer) ───────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS40 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls40.pdf */
  '74x40': {
    name: '74x40',
    simpleName: 'Dual 4 input NAND Buffer',
    description: 'Two 4 input NAND gates with buffered outputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls40.pdf',
    tags: ['nand', 'gate', 'logic', 'dual', '4 input', 'buffer'],
    guideOverview: 'The 74x40 contains two 4 input NAND gates with buffered (high current) outputs. It is functionally identical to the 74x20 but delivers more drive current, making it suitable for directly driving larger loads. Pins 3 and 11 are not connected (NC) and serve no logic function.',
    guidePinDescriptions: {
      '1A':  'Input A of NAND gate 1.',
      '1B':  'Input B of NAND gate 1.',
      'NC1': 'Not connected (pin 3). Leave unconnected.',
      '1C':  'Input C of NAND gate 1.',
      '1D':  'Input D of NAND gate 1.',
      '1Y':  'Buffered NAND output of gate 1. LOW only when all four inputs are HIGH.',
      'GND': 'Ground reference (pin 7).',
      '2Y':  'Buffered NAND output of gate 2.',
      '2A':  'Input A of NAND gate 2.',
      '2B':  'Input B of NAND gate 2.',
      'NC2': 'Not connected (pin 11). Leave unconnected.',
      '2C':  'Input C of NAND gate 2.',
      '2D':  'Input D of NAND gate 2.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Buffered 4 Input NAND',
        paragraphs: ['The 74x40 is pin compatible with the 74x20 but uses a buffered output stage for higher sink/source current. Use it when the NAND output must drive many TTL inputs or heavier loads without voltage level degradation.'],
        formulas: ['Y = NOT(A AND B AND C AND D)'],
        note: 'Tie unused inputs to VCC to keep them from affecting the output.',
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input',  description: 'Gate 1 input A' },
      { pin: 2,  name: '1B',  type: 'input',  description: 'Gate 1 input B' },
      { pin: 3,  name: 'NC1', type: 'nc',     description: 'Not connected leave unconnected' },
      { pin: 4,  name: '1C',  type: 'input',  description: 'Gate 1 input C' },
      { pin: 5,  name: '1D',  type: 'input',  description: 'Gate 1 input D' },
      { pin: 6,  name: '1Y',  type: 'output', description: 'Gate 1 output (buffered): LOW only when 1A, 1B, 1C, and 1D are all HIGH' },
      { pin: 7,  name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: '2Y',  type: 'output', description: 'Gate 2 output (buffered): LOW only when 2A, 2B, 2C, and 2D are all HIGH' },
      { pin: 9,  name: '2A',  type: 'input',  description: 'Gate 2 input A' },
      { pin: 10, name: '2B',  type: 'input',  description: 'Gate 2 input B' },
      { pin: 11, name: 'NC2', type: 'nc',     description: 'Not connected leave unconnected' },
      { pin: 12, name: '2C',  type: 'input',  description: 'Gate 2 input C' },
      { pin: 13, name: '2D',  type: 'input',  description: 'Gate 2 input D' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },

  // ── 7442: BCD to Decimal Decoder ────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN5442A, SN54LS42, SN7442A, SN74LS42
     4-Line BCD to 10-Line Decimal Decoders", SDLS109 (March 1974, rev. March 1988).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls42.pdf.
     Verified: terminal assignment (D/N package, TOP VIEW) + logic symbol + FUNCTION
     TABLE + logic diagram, pages 1-4, read as rendered PDF page images.
     [1] Pinout — outputs 0-6 on pins 1-7, GND=8, outputs 7-9 on pins 9-11, D=12,
         C=13, B=14, A=15 (A=LSB weight 1, D=MSB weight 8), VCC=16: SDLS109 p. 1
         (D/N-package TOP VIEW) and logic symbol A=(15) B=(14) C=(13) D=(12).
     [2] One output LOW per valid BCD code 0-9; all ten outputs HIGH for invalid
         codes 10-15 ("Full decoding of valid input logic ensures that all outputs
         remain off for all invalid input conditions"): SDLS109 FUNCTION TABLE, p. 4.
     [3] Totem-pole TTL outputs, NOT open collector (the 74x45 is the open-collector
         driver variant): SDLS109 "schematics of inputs and outputs", p. 3.
     [4] Listed for use as 3-line-to-8-line and (with a second device) 4-line-to-16-line
         decoders; typical tPHL/tPLH ~17 ns; 'LS42 power ~35 mW: SDLS109 p. 1,
         switching characteristics p. 5.
     Decoder background: Wikipedia contributors, "Binary decoder",
     https://en.wikipedia.org/wiki/Binary_decoder */
  '74x42': {
    name: '74x42',
    simpleName: 'BCD to Decimal Decoder',
    description: 'One-of-ten BCD to decimal decoder with active LOW outputs. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls42.pdf',
    tags: ['decoder', 'bcd', 'decimal', '1-of-10', '1 of 10', 'demultiplexer', 'active low'],
    guideOverview: 'The 74x42 reads a 4 bit BCD code (one decimal digit, 0 through 9) and pulls exactly one of ten outputs LOW to mark which digit it saw. The outputs are active LOW, so the selected line sits at 0 V while the other nine stay HIGH. Feed it a code from 10 to 15 which is not a valid BCD digit and it leaves all ten outputs HIGH, so a bad code does nothing rather than lighting the wrong line. Reach for it to turn a BCD counter into one signal per digit: driving a ring of ten indicators, picking one of ten devices, or scanning ten rows. Hold input D LOW and it also works as a plain 3 line to 8 line decoder.',
    guidePinDescriptions: {
      'Y0': 'Output 0 (pin 1). Goes LOW when the input code is 0 (DCBA = 0000); HIGH otherwise.',
      'Y1': 'Output 1 (pin 2). Goes LOW when the input code is 1 (DCBA = 0001).',
      'Y2': 'Output 2 (pin 3). Goes LOW when the input code is 2 (DCBA = 0010).',
      'Y3': 'Output 3 (pin 4). Goes LOW when the input code is 3 (DCBA = 0011).',
      'Y4': 'Output 4 (pin 5). Goes LOW when the input code is 4 (DCBA = 0100).',
      'Y5': 'Output 5 (pin 6). Goes LOW when the input code is 5 (DCBA = 0101).',
      'Y6': 'Output 6 (pin 7). Goes LOW when the input code is 6 (DCBA = 0110).',
      'GND': 'Ground, 0 V (pin 8).',
      'Y7': 'Output 7 (pin 9). Goes LOW when the input code is 7 (DCBA = 0111).',
      'Y8': 'Output 8 (pin 10). Goes LOW when the input code is 8 (DCBA = 1000).',
      'Y9': 'Output 9 (pin 11). Goes LOW when the input code is 9 (DCBA = 1001).',
      'D': 'BCD input bit 3, the most significant bit, weight 8 (pin 12). Hold it LOW to use the chip as a 3-to-8 decoder on A, B, C.',
      'C': 'BCD input bit 2, weight 4 (pin 13).',
      'B': 'BCD input bit 1, weight 2 (pin 14).',
      'A': 'BCD input bit 0, the least significant bit, weight 1 (pin 15).',
      'VCC': 'Positive supply, +5 V (pin 16).',
    },
    guideSections: [
      {
        title: 'How the decoder works',
        paragraphs: [
          'BCD (binary coded decimal) is how you write a single decimal digit in binary: 0000 for 0, 0001 for 1, up to 1001 for 9. The 74x42 reads that 4 bit code on inputs A, B, C, D. A is the least significant bit (weight 1) and D is the most significant (weight 8), so the value is 8·D + 4·C + 2·B + 1·A.',
          'For each valid code it pulls exactly one output LOW, the one whose number matches, and leaves the other nine HIGH. Only one output is ever active at a time, and the active state is LOW, not HIGH. This is the opposite of what a beginner often expects, so watch the polarity.',
          'Inside, the chip makes both the true and the inverted copy of every input bit, then feeds ten 4 input NAND gates. Each gate watches for one specific pattern of the four bits, so only one gate can fire for any code. Because all four bits are fully decoded, the six codes that are not real BCD digits (10 through 15) match no gate and leave every output HIGH. That is the built in guard against bad codes, not a separate reset input.',
        ],
        formulas: [
          'Input read as D C B A, value = 8·D + 4·C + 2·B + 1·A',
          'value 0 (0000) → output 0 LOW, all others HIGH',
          'value 1 (0001) → output 1 LOW',
          'value 2 (0010) → output 2 LOW',
          'value 3 (0011) → output 3 LOW',
          'value 4 (0100) → output 4 LOW',
          'value 5 (0101) → output 5 LOW',
          'value 6 (0110) → output 6 LOW',
          'value 7 (0111) → output 7 LOW',
          'value 8 (1000) → output 8 LOW',
          'value 9 (1001) → output 9 LOW',
          'value 10-15 (1010-1111) → all ten outputs HIGH (invalid BCD)',
        ],
      },
      {
        title: 'Using it as a 3-to-8 decoder',
        paragraphs: [
          'Hold D LOW and drive only A, B, and C. Now the value can only be 0 through 7, so outputs 0 through 7 give you a clean 1 of 8 decode and outputs 8 and 9 stay HIGH. This is the "3 line to 8 line" use the datasheet lists.',
          'In this mode D behaves like an active HIGH disable for the group: raise D and the code jumps to 8 through 15, so none of outputs 0 through 7 can go LOW. The 74x42 has no dedicated enable or strobe pin, so this D trick is the only built in way to blank the outputs you are using.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Turn a BCD counter (like the 74x90) into ten separate signals, one per count, to step through ten stages or light a ring of ten indicators.',
          'Select one of up to ten devices or memory banks from a BCD address.',
          'Drive the row or column scan of a small keypad or display, one line at a time.',
          'Use as a 1 of 8 decoder by tying D LOW, when you do not need a chip with enable pins like the 74x138.',
        ],
      },
      {
        title: 'Gotchas',
        paragraphs: [
          'The outputs are active LOW. To light an LED on the selected line, tie the LED anode to +5 V through a resistor and its cathode to the output, so it turns on when the output goes LOW. Wiring it the other way lights nine LEDs and dims one.',
          'These are ordinary totem-pole TTL outputs, not open collector. They drive a normal logic load, but not a lamp, relay, or high-current LED. For those, use the 74x45, the open-collector version with the same BCD decode that can sink up to 80 mA at up to 30 V. The 74x43 (excess-3) and 74x44 (Gray code) are the same chip decoding a different input code.',
          'Feed it real BCD. A free-running 4 bit binary counter will pass through 10-15, and on those codes the 74x42 quietly outputs nothing (all HIGH). Pair it with a BCD counter, or accept that only 0-9 decode.',
        ],
        note: 'The propagation delay is roughly 17 ns typical for the LS version, meaning outputs settle a few tens of nanoseconds after the inputs change. The simulator treats the decode as instant, which is fine for learning the logic but hides that real-world settling time.',
      },
    ],
    pinout: [
      { pin: 1,  name: 'Y0',  type: 'output', description: 'Active LOW decoded output for decimal 0 goes LOW when BCD input = 0000' },
      { pin: 2,  name: 'Y1',  type: 'output', description: 'Active LOW decoded output for decimal 1 goes LOW when BCD input = 0001' },
      { pin: 3,  name: 'Y2',  type: 'output', description: 'Active LOW decoded output for decimal 2 goes LOW when BCD input = 0010' },
      { pin: 4,  name: 'Y3',  type: 'output', description: 'Active LOW decoded output for decimal 3 goes LOW when BCD input = 0011' },
      { pin: 5,  name: 'Y4',  type: 'output', description: 'Active LOW decoded output for decimal 4 goes LOW when BCD input = 0100' },
      { pin: 6,  name: 'Y5',  type: 'output', description: 'Active LOW decoded output for decimal 5 goes LOW when BCD input = 0101' },
      { pin: 7,  name: 'Y6',  type: 'output', description: 'Active LOW decoded output for decimal 6 goes LOW when BCD input = 0110' },
      { pin: 8,  name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin: 9,  name: 'Y7',  type: 'output', description: 'Active LOW decoded output for decimal 7 goes LOW when BCD input = 0111' },
      { pin: 10, name: 'Y8',  type: 'output', description: 'Active LOW decoded output for decimal 8 goes LOW when BCD input = 1000' },
      { pin: 11, name: 'Y9',  type: 'output', description: 'Active LOW decoded output for decimal 9 goes LOW when BCD input = 1001' },
      { pin: 12, name: 'D',   type: 'input',  description: 'BCD input bit 3 (MSB). D=1 forces all outputs HIGH (no valid decode) also acts as active HIGH disable for 1-of-8 use.' },
      { pin: 13, name: 'C',   type: 'input',  description: 'BCD input bit 2' },
      { pin: 14, name: 'B',   type: 'input',  description: 'BCD input bit 1' },
      { pin: 15, name: 'A',   type: 'input',  description: 'BCD input bit 0 (LSB)' },
      { pin: 16, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      {
        type: 'BCD_DECIMAL',
        inputs: ['A', 'B', 'C', 'D'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9'],
      },
    ],
  },

  // ── 7445: BCD to Decimal Decoder/Driver (open collector) ───────────────
  /* Primary source: Texas Instruments, SN7445A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7445a.pdf
     Open collector output technology: https://en.wikipedia.org/wiki/Open_collector
     Decoder/demultiplexer concept: https://en.wikipedia.org/wiki/Multiplexer */
  '74x45': {
    name: '74x45',
    simpleName: 'BCD to Decimal (OC)',
    description: 'BCD to decimal decoder/driver (open collector) (16-pin)',
    guideOverview: 'The 74x45 is the open collector version of the 74x42 BCD to decimal decoder. It decodes a 4 bit BCD input into one of ten active LOW outputs, but uses open collector transistor outputs capable of sinking up to 80 mA at up to 30 V. This makes it suitable for directly driving indicator lamps, relays, high current LEDs, or other loads that exceed standard TTL output capabilities.',
    guidePinDescriptions: {
      'Y0':  'Active LOW open collector output for decimal 0. Conducts when DCBA = 0000.',
      'Y1':  'Active LOW open collector output for decimal 1. Conducts when DCBA = 0001.',
      'Y2':  'Active LOW open collector output for decimal 2.',
      'Y3':  'Active LOW open collector output for decimal 3.',
      'Y4':  'Active LOW open collector output for decimal 4.',
      'Y5':  'Active LOW open collector output for decimal 5.',
      'Y6':  'Active LOW open collector output for decimal 6.',
      'GND': 'Ground reference (pin 8). Common ground for TTL supply and output load.',
      'Y7':  'Active LOW open collector output for decimal 7.',
      'Y8':  'Active LOW open collector output for decimal 8.',
      'Y9':  'Active LOW open collector output for decimal 9. Conducts when DCBA = 1001.',
      'D':   'BCD input bit 3 (MSB).',
      'C':   'BCD input bit 2.',
      'B':   'BCD input bit 1.',
      'A':   'BCD input bit 0 (LSB).',
      'VCC': 'TTL supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'High Current BCD Decoder',
        paragraphs: [
          'Identical decoding logic to the 74x42 one of ten active LOW outputs goes LOW for each valid BCD input code 0-9. Invalid codes (10 15) leave all outputs off.',
          'The open collector outputs can sink up to 80 mA and withstand up to 30 V, so they can directly drive lamps, relays, and LEDs without additional driver transistors.',
        ],
        note: 'Add a pull up resistor to VCC (or load voltage) for each output used. Do not exceed 30 V or 80 mA per output.',
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7445a.pdf',
    tags: ['decoder', 'bcd', 'decimal', '1-of-10', 'driver', 'open collector'],
    pinout: [
      { pin: 1, name: 'Y0', type: 'output' },
      { pin: 2, name: 'Y1', type: 'output' },
      { pin: 3, name: 'Y2', type: 'output' },
      { pin: 4, name: 'Y3', type: 'output' },
      { pin: 5, name: 'Y4', type: 'output' },
      { pin: 6, name: 'Y5', type: 'output' },
      { pin: 7, name: 'Y6', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'Y7', type: 'output' },
      { pin: 10, name: 'Y8', type: 'output' },
      { pin: 11, name: 'Y9', type: 'output' },
      { pin: 12, name: 'D', type: 'input' },
      { pin: 13, name: 'C', type: 'input' },
      { pin: 14, name: 'B', type: 'input' },
      { pin: 15, name: 'A', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'BCD_DECIMAL',
        inputs: ['A', 'B', 'C', 'D'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9'],
      },
    ],
  },
};
