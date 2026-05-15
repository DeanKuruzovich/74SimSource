// Chip definitions block 7
// Auto-generated from chips.js
//
// Review notes for this block:
// - Most parts here are straightforward combinational TTL devices.
// - Schmitt-trigger variants are modeled with the correct Boolean function, but
//   input hysteresis itself is not simulated.
// - Open-collector parts behave as sinking outputs in the simulator, but their
//   higher voltage/current ratings are not separately enforced.
// - 7431 delay differentiation is not timed; it is documented as a buffer-style
//   functional model rather than as a nanosecond-accurate delay line.

export const CHIPS_BLOCK_7 = {
  // ── 74x18: Dual 4 input NAND (Schmitt trigger) ──────────────────────────
  /* Primary source: Texas Instruments, SN74LS18 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls18.pdf */
  // Functionally this is two independent 4 input NAND gates.
  // The simulator models the NAND truth table directly; Schmitt-trigger input
  // hysteresis is noted in the guide but not represented as analog thresholds.
  '7418': {
    name: '74x18',
    simpleName: 'Dual 4-in NAND (Schmitt)',
    description: 'Two independent 4 input NAND gates with Schmitt-trigger inputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls18.pdf',
    tags: ['nand', 'gate', 'logic', 'dual', '4 input', 'schmitt', 'schmitt trigger'],
    guideOverview: 'The 7418 contains two 4 input NAND gates with Schmitt-trigger inputs. In 74Sim the logic function is correct for ordinary digital use, but the analog hysteresis behavior that real Schmitt inputs use for noise cleanup is not separately modeled.',
    guidePinDescriptions: {
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      'NC1': 'No connection.',
      '1C':  'Input C for gate 1.',
      '1D':  'Input D for gate 1.',
      '1Y':  'NAND output for gate 1. LOW only when all four inputs are HIGH.',
      'GND': 'Ground reference (pin 7).',
      '2Y':  'NAND output for gate 2. LOW only when all four inputs are HIGH.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      'NC2': 'No connection.',
      '2C':  'Input C for gate 2.',
      '2D':  'Input D for gate 2.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: '4 Input NAND',
        paragraphs: ['Output is LOW only when ALL four inputs are simultaneously HIGH. This makes it useful for AND-like decoding of 4 bit conditions without needing an inverter.'],
        note: 'Schmitt inputs improve noise immunity on slow or noisy input signals but are not analog-simulated in 74Sim.',
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: 'NC1', type: 'nc' },
      { pin: 4,  name: '1C',  type: 'input' },
      { pin: 5,  name: '1D',  type: 'input' },
      { pin: 6,  name: '1Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '2Y',  type: 'output' },
      { pin: 9,  name: '2A',  type: 'input' },
      { pin: 10, name: '2B',  type: 'input' },
      { pin: 11, name: 'NC2', type: 'nc' },
      { pin: 12, name: '2C',  type: 'input' },
      { pin: 13, name: '2D',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },

  // ── 74x19: Hex Inverter (Schmitt trigger) ────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS19 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls19.pdf */
  // Six independent inverters share power and ground only.
  // The simulated behavior is the normal NOT function; the real part's extra
  // value is input hysteresis, which is documented but not analog-modeled here.
  '7419': {
    name: '74x19',
    simpleName: 'Hex Inverter (ST)',
    description: 'Six independent inverters (NOT gates) with Schmitt-trigger inputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls19.pdf',
    tags: ['not', 'inverter', 'gate', 'logic', 'hex', 'schmitt', 'schmitt trigger'],
    guideOverview: 'The 7419 is six independent inverters with Schmitt-trigger inputs. In the simulator each channel inverts correctly, while the Schmitt hysteresis itself is treated as a documentation caveat rather than a separate analog effect.',
    guidePinDescriptions: {
      '1A':  'Input for inverter 1.',
      '1Y':  'Output of inverter 1. HIGH when 1A is LOW.',
      '2A':  'Input for inverter 2.',
      '2Y':  'Output of inverter 2. HIGH when 2A is LOW.',
      '3A':  'Input for inverter 3.',
      '3Y':  'Output of inverter 3. HIGH when 3A is LOW.',
      'GND': 'Ground reference (pin 7).',
      '4Y':  'Output of inverter 4. HIGH when 4A is LOW.',
      '4A':  'Input for inverter 4.',
      '5Y':  'Output of inverter 5. HIGH when 5A is LOW.',
      '5A':  'Input for inverter 5.',
      '6Y':  'Output of inverter 6. HIGH when 6A is LOW.',
      '6A':  'Input for inverter 6.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Hex Inverter with Schmitt Inputs',
        paragraphs: ['Each gate inverts its input. Schmitt-trigger inputs allow the chip to clean up slowly-rising or noisy signals.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1Y',  type: 'output' },
      { pin: 3,  name: '2A',  type: 'input' },
      { pin: 4,  name: '2Y',  type: 'output' },
      { pin: 5,  name: '3A',  type: 'input' },
      { pin: 6,  name: '3Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '4Y',  type: 'output' },
      { pin: 9,  name: '4A',  type: 'input' },
      { pin: 10, name: '5Y',  type: 'output' },
      { pin: 11, name: '5A',  type: 'input' },
      { pin: 12, name: '6Y',  type: 'output' },
      { pin: 13, name: '6A',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
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

  // ── 74x23: Dual 4 input NOR with strobe ──────────────────────────────────
  /* Primary source: Texas Instruments, SN7423 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7423.pdf */
  // Each section behaves like a 4 input NOR gated by a strobe input.
  // G is an active HIGH inhibit: when G is high, the output is forced high;
  // when G is low, the output is the NOR of the four data inputs.
  '7423': {
    name: '74x23',
    simpleName: 'Dual 4-in NOR+Strobe',
    description: 'Dual 4 input NOR gate with strobe (one gate expandable) (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7423.pdf',
    tags: ['nor', 'gate', 'logic', 'dual', '4 input', 'strobe', 'enable'],
    guideOverview: 'The 7423 is a dual 4 input NOR where each gate also has a strobe input. The strobe acts like an active HIGH disable that forces the output HIGH regardless of the other four inputs.',
    guidePinDescriptions: {
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      'NC1': 'No connection.',
      '1Y':  'NOR+strobe output for gate 1. HIGH only when 1G=LOW and all data inputs are LOW.',
      '1C':  'Input C for gate 1.',
      '1D':  'Input D for gate 1.',
      '1G':  'Gate 1 strobe or inhibit input (active HIGH). HIGH forces 1Y HIGH; LOW enables normal NOR operation.',
      'GND': 'Ground reference (pin 8).',
      '2G':  'Gate 2 strobe or inhibit input (active HIGH). HIGH forces 2Y HIGH; LOW enables normal NOR operation.',
      '2D':  'Input D for gate 2.',
      '2C':  'Input C for gate 2.',
      '2Y':  'NOR+strobe output for gate 2. HIGH only when 2G=LOW and all data inputs are LOW.',
      'NC2': 'No connection.',
      '2B':  'Input B for gate 2.',
      '2A':  'Input A for gate 2.',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: '4 Input NOR with Strobe',
        paragraphs: ['The strobe G acts as an active HIGH disable overriding all other inputs. With G=LOW, the gate outputs the NOR of all four data inputs.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: 'NC1', type: 'nc' },
      { pin: 4,  name: '1Y',  type: 'output' },
      { pin: 5,  name: '1C',  type: 'input' },
      { pin: 6,  name: '1D',  type: 'input' },
      { pin: 7,  name: '1G',  type: 'input' },
      { pin: 8,  name: 'GND', type: 'power' },
      { pin: 9,  name: '2G',  type: 'input' },
      { pin: 10, name: '2D',  type: 'input' },
      { pin: 11, name: '2C',  type: 'input' },
      { pin: 12, name: '2Y',  type: 'output' },
      { pin: 13, name: 'NC2', type: 'nc' },
      { pin: 14, name: '2B',  type: 'input' },
      { pin: 15, name: '2A',  type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOR_STROBE', inputs: ['1A', '1B', '1C', '1D', '1G'], output: '1Y' },
      { type: 'NOR_STROBE', inputs: ['2A', '2B', '2C', '2D', '2G'], output: '2Y' },
    ],
  },

  // ── 74x24: Quad 2 input NAND (Schmitt trigger) ───────────────────────────
  /* Primary source: Texas Instruments, SN74LS24 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls24.pdf */
  // Four standard 2 input NAND channels are present.
  // As with the other Schmitt-marked devices in this block, the logic function
  // is simulated directly while hysteresis is only documented as a caveat.
  '7424': {
    name: '74x24',
    simpleName: 'Quad NAND (Schmitt)',
    description: 'Four 2 input NAND gates with Schmitt-trigger inputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls24.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'schmitt', 'schmitt trigger'],
    guideOverview: 'The 7424 is four 2 input NAND gates with Schmitt-trigger inputs. It is useful for logic cleanup and gating, though 74Sim models it as an ordinary digital NAND with the hysteresis behavior noted but not analog-simulated.',
    guidePinDescriptions: {
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '1Y':  'NAND output for gate 1. LOW only when both inputs are HIGH.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      '2Y':  'NAND output for gate 2. LOW only when both inputs are HIGH.',
      'GND': 'Ground reference (pin 7).',
      '3Y':  'NAND output for gate 3. LOW only when both inputs are HIGH.',
      '3A':  'Input A for gate 3.',
      '3B':  'Input B for gate 3.',
      '4Y':  'NAND output for gate 4. LOW only when both inputs are HIGH.',
      '4A':  'Input A for gate 4.',
      '4B':  'Input B for gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Quad NAND with Schmitt Inputs',
        paragraphs: ['Each gate outputs LOW only when both inputs are HIGH. Schmitt inputs clean up slow or noisy signals before the gate logic.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: '1Y',  type: 'output' },
      { pin: 4,  name: '2A',  type: 'input' },
      { pin: 5,  name: '2B',  type: 'input' },
      { pin: 6,  name: '2Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3Y',  type: 'output' },
      { pin: 9,  name: '3A',  type: 'input' },
      { pin: 10, name: '3B',  type: 'input' },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input' },
      { pin: 13, name: '4B',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 74x26: Quad 2 input NAND (open-collector 15V) ────────────────────────
  /* Primary source: Texas Instruments, SN74LS26 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls26.pdf
     Open-collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  // Each NAND output is open-collector, so it actively pulls low but relies on
  // pull up behavior for the high state. The simulator models the sink-only
  // behavior but not the external 15 V rating that some real uses exploit.
  '7426': {
    name: '74x26',
    simpleName: 'Quad NAND (OC 15V)',
    description: 'Four 2 input NAND gates with open-collector outputs rated up to 15 V. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls26.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'open collector'],
    guideOverview: 'The 7426 is a quad 2 input NAND with open-collector outputs. That means each output can pull low strongly, but its HIGH state depends on pull up action instead of an internal push-pull driver.',
    guidePinDescriptions: {
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '1Y':  'Open-collector NAND output 1. Pulls LOW when 1A=HIGH and 1B=HIGH; high-Z otherwise.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      '2Y':  'Open-collector NAND output 2. Pulls LOW when 2A=HIGH and 2B=HIGH; high-Z otherwise.',
      'GND': 'Ground reference (pin 7).',
      '3Y':  'Open-collector NAND output 3. Pulls LOW when 3A=HIGH and 3B=HIGH; high-Z otherwise.',
      '3A':  'Input A for gate 3.',
      '3B':  'Input B for gate 3.',
      '4Y':  'Open-collector NAND output 4. Pulls LOW when 4A=HIGH and 4B=HIGH; high-Z otherwise.',
      '4A':  'Input A for gate 4.',
      '4B':  'Input B for gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Open Collector NAND',
        paragraphs: ['Output pulls LOW when both inputs are HIGH. For the output to reach HIGH, an external pull up resistor is required. This allows wired AND configurations and level-shifting to voltages up to 15 V.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: '1Y',  type: 'output' },
      { pin: 4,  name: '2A',  type: 'input' },
      { pin: 5,  name: '2B',  type: 'input' },
      { pin: 6,  name: '2Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3Y',  type: 'output' },
      { pin: 9,  name: '3A',  type: 'input' },
      { pin: 10, name: '3B',  type: 'input' },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input' },
      { pin: 13, name: '4B',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 74x28: Quad 2 input NOR (driver) ─────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS28 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls28.pdf */
  // This is a quad NOR family member intended for stronger line-driving use.
  // 74Sim models the correct NOR logic behavior; any special drive-strength
  // advantage over simpler NOR parts is treated as outside the digital model.
  '7428': {
    name: '74x28',
    simpleName: 'Quad NOR (buffered)',
    description: 'Four 2 input NOR gates with buffered outputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls28.pdf',
    tags: ['nor', 'gate', 'logic', 'quad', 'driver'],
    guideOverview: 'The 7428 is four 2 input NOR gates sold as a driver-oriented variant. In 74Sim it behaves as a normal quad NOR gate, which is the important functional behavior for logic design.',
    guidePinDescriptions: {
      '1Y':  'NOR output for gate 1. HIGH only when both 1A and 1B are LOW.',
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '2Y':  'NOR output for gate 2. HIGH only when both inputs are LOW.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      'GND': 'Ground reference (pin 7).',
      '3A':  'Input A for gate 3.',
      '3B':  'Input B for gate 3.',
      '3Y':  'NOR output for gate 3. HIGH only when both inputs are LOW.',
      '4A':  'Input A for gate 4.',
      '4B':  'Input B for gate 4.',
      '4Y':  'NOR output for gate 4. HIGH only when both inputs are LOW.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Buffered Quad NOR',
        paragraphs: ['Outputs HIGH only when both inputs are LOW. The buffered driver stage allows this chip to drive heavier loads than standard logic gates.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1Y',  type: 'output' },
      { pin: 2,  name: '1A',  type: 'input' },
      { pin: 3,  name: '1B',  type: 'input' },
      { pin: 4,  name: '2Y',  type: 'output' },
      { pin: 5,  name: '2A',  type: 'input' },
      { pin: 6,  name: '2B',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3A',  type: 'input' },
      { pin: 9,  name: '3B',  type: 'input' },
      { pin: 10, name: '3Y',  type: 'output' },
      { pin: 11, name: '4A',  type: 'input' },
      { pin: 12, name: '4B',  type: 'input' },
      { pin: 13, name: '4Y',  type: 'output' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NOR', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NOR', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NOR', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 74x29: Dual 4 input NOR ───────────────────────────────────────────────
  /* Primary source: Texas Instruments, US7429A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/us7429a.pdf */
  // Two independent 4 input NOR gates are provided.
  // The NC pins are real no-connect positions in the package and are not part
  // of the simulated logic network.
  '7429': {
    name: '74x29',
    simpleName: 'Dual 4-in NOR',
    description: 'Dual 4 input NOR gate (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/us7429a.pdf',
    tags: ['nor', 'gate', 'logic', 'dual', '4 input'],
    guideOverview: 'The 7429 is a straightforward dual 4 input NOR. It is most useful when a design needs wider NOR terms without building them from smaller gates.',
    guidePinDescriptions: {
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '1C':  'Input C for gate 1.',
      '1D':  'Input D for gate 1.',
      'NC1': 'No connection.',
      '1Y':  'NOR output for gate 1. HIGH only when all four inputs are LOW.',
      'GND': 'Ground reference (pin 7).',
      '2Y':  'NOR output for gate 2. HIGH only when all four inputs are LOW.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      '2C':  'Input C for gate 2.',
      '2D':  'Input D for gate 2.',
      'NC2': 'No connection.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Dual 4 Input NOR',
        paragraphs: ['Output is HIGH only when all four inputs are LOW. Use this to detect an all-zero condition across four signals without needing multiple cascaded gates.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: '1C',  type: 'input' },
      { pin: 4,  name: '1D',  type: 'input' },
      { pin: 5,  name: 'NC1', type: 'nc' },
      { pin: 6,  name: '1Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '2Y',  type: 'output' },
      { pin: 9,  name: '2A',  type: 'input' },
      { pin: 10, name: '2B',  type: 'input' },
      { pin: 11, name: '2C',  type: 'input' },
      { pin: 12, name: '2D',  type: 'input' },
      { pin: 13, name: 'NC2', type: 'nc' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'NOR', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },


  // ── 74x33: Quad 2 input NOR (open-collector) ──────────────────────────────
  /* Primary source: Texas Instruments, SN74LS33 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls33.pdf
     Open-collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  // Each output uses an open-collector pull down stage rather than a push-pull
  // driver, so wired OR style behavior and pull up dependence apply.
  '7433': {
    name: '74x33',
    simpleName: 'Quad 2 input NOR (OC)',
    description: 'Four 2 input NOR gates with open-collector outputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls33.pdf',
    tags: ['nor', 'gate', 'logic', 'quad', 'open collector', 'open-collector', '2 input'],
    guideOverview: 'The 74x33 is a quad 2 input NOR with open-collector outputs. Because it can only sink current (not source it), you must add an external pull up resistor to each output. This also lets you tie multiple outputs together for a wired AND configuration, or level-shift to a different voltage by choosing the pull up supply.',
    guidePinDescriptions: {
      '1Y':  'Open-collector NOR output 1. Pulls LOW when 1A or 1B is HIGH; high-Z otherwise requires external pull up.',
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '2Y':  'Open-collector NOR output 2.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      'GND': 'Ground reference (pin 7).',
      '3A':  'Input A for gate 3.',
      '3B':  'Input B for gate 3.',
      '3Y':  'Open-collector NOR output 3.',
      '4A':  'Input A for gate 4.',
      '4B':  'Input B for gate 4.',
      '4Y':  'Open-collector NOR output 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Open Collector NOR',
        paragraphs: ['Output pulls LOW when either input is HIGH. Outputs float (high-Z) when the NOR result would be HIGH, requiring an external pull up resistor to actually reach HIGH.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1Y',  type: 'output', description: 'Gate 1 open-collector output (LOW when 1A or 1B is HIGH; high-Z otherwise needs external pull up)' },
      { pin: 2,  name: '1A',  type: 'input',  description: 'Gate 1 input A' },
      { pin: 3,  name: '1B',  type: 'input',  description: 'Gate 1 input B' },
      { pin: 4,  name: '2Y',  type: 'output', description: 'Gate 2 open-collector output (LOW when 2A or 2B is HIGH; high-Z otherwise needs external pull up)' },
      { pin: 5,  name: '2A',  type: 'input',  description: 'Gate 2 input A' },
      { pin: 6,  name: '2B',  type: 'input',  description: 'Gate 2 input B' },
      { pin: 7,  name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: '3A',  type: 'input',  description: 'Gate 3 input A' },
      { pin: 9,  name: '3B',  type: 'input',  description: 'Gate 3 input B' },
      { pin: 10, name: '3Y',  type: 'output', description: 'Gate 3 open-collector output (LOW when 3A or 3B is HIGH; high-Z otherwise needs external pull up)' },
      { pin: 11, name: '4A',  type: 'input',  description: 'Gate 4 input A' },
      { pin: 12, name: '4B',  type: 'input',  description: 'Gate 4 input B' },
      { pin: 13, name: '4Y',  type: 'output', description: 'Gate 4 open-collector output (LOW when 4A or 4B is HIGH; high-Z otherwise needs external pull up)' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NOR', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NOR', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NOR', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 74x34: Hex Buffer ─────────────────────────────────────────────────────
  /* Primary source: Texas Instruments, MM74HC34 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/mm74hc34.pdf */
  // Six independent non-inverting buffers are present.
  // There are no enables or storage elements here: each output simply follows
  // its corresponding input.
  '7434': {
    name: '74x34',
    simpleName: 'Hex Buffer',
    description: 'Hex buffer gate (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/mm74hc34.pdf',
    tags: ['buffer', 'gate', 'logic', 'hex'],
    guideOverview: 'The 7434 is a plain hex non-inverting buffer. Use it for fan-out, signal cleanup, or to occupy a real package footprint when a simple buffer stage is required.',
    guidePinDescriptions: {
      '1A':  'Input for buffer 1.',
      '1Y':  'Non-inverting output for buffer 1. Equals 1A.',
      '2A':  'Input for buffer 2.',
      '2Y':  'Output for buffer 2.',
      '3A':  'Input for buffer 3.',
      '3Y':  'Output for buffer 3.',
      'GND': 'Ground reference (pin 7).',
      '4Y':  'Output for buffer 4.',
      '4A':  'Input for buffer 4.',
      '5Y':  'Output for buffer 5.',
      '5A':  'Input for buffer 5.',
      '6Y':  'Output for buffer 6.',
      '6A':  'Input for buffer 6.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Hex Non-Inverting Buffer',
        paragraphs: ['Each output follows its input exactly. Use for fan-out expansion or driving longer wire runs.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1Y',  type: 'output' },
      { pin: 3,  name: '2A',  type: 'input' },
      { pin: 4,  name: '2Y',  type: 'output' },
      { pin: 5,  name: '3A',  type: 'input' },
      { pin: 6,  name: '3Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '4Y',  type: 'output' },
      { pin: 9,  name: '4A',  type: 'input' },
      { pin: 10, name: '5Y',  type: 'output' },
      { pin: 11, name: '5A',  type: 'input' },
      { pin: 12, name: '6Y',  type: 'output' },
      { pin: 13, name: '6A',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
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

  // ── 74x35: Hex Buffer (open-collector) ───────────────────────────────────
  /* Primary source: Texas Instruments, SN74ALS35 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als35.pdf
     Open-collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  // This is the open-collector version of a hex buffer.
  // Outputs actively pull low and otherwise rely on pull up behavior, making
  // them appropriate for sink-only or shared-line applications.
  '7435': {
    name: '74x35',
    simpleName: 'Hex Buffer (OC)',
    description: 'Hex buffer gate (open-collector) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als35.pdf',
    tags: ['buffer', 'gate', 'logic', 'hex', 'open collector'],
    guideOverview: 'The 7435 is a hex non-inverting buffer with open-collector outputs. It is useful when you want buffer logic but need the output stage to sink only instead of driving both HIGH and LOW.',
    guidePinDescriptions: {
      '1A':  'Input for buffer 1.',
      '1Y':  'Open-collector output for buffer 1. Follows input when LOW; high-Z when HIGH requires external pull up.',
      '2A':  'Input for buffer 2.',
      '2Y':  'Open-collector output for buffer 2.',
      '3A':  'Input for buffer 3.',
      '3Y':  'Open-collector output for buffer 3.',
      'GND': 'Ground reference (pin 7).',
      '4Y':  'Open-collector output for buffer 4.',
      '4A':  'Input for buffer 4.',
      '5Y':  'Open-collector output for buffer 5.',
      '5A':  'Input for buffer 5.',
      '6Y':  'Open-collector output for buffer 6.',
      '6A':  'Input for buffer 6.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Open Collector Hex Buffer',
        paragraphs: ['Each output passes the input level through but with an open-collector output stage. An external pull up is required for HIGH output.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1Y',  type: 'output' },
      { pin: 3,  name: '2A',  type: 'input' },
      { pin: 4,  name: '2Y',  type: 'output' },
      { pin: 5,  name: '3A',  type: 'input' },
      { pin: 6,  name: '3Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '4Y',  type: 'output' },
      { pin: 9,  name: '4A',  type: 'input' },
      { pin: 10, name: '5Y',  type: 'output' },
      { pin: 11, name: '5A',  type: 'input' },
      { pin: 12, name: '6Y',  type: 'output' },
      { pin: 13, name: '6A',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
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

  // ── 74x36: Quad 2 input NOR (different pinout from 7402) ─────────────────
  /* Primary source: Texas Instruments, SN74HC36 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74hc36.pdf */
  // Logic behavior matches other quad 2 input NOR parts; the main distinction
  // is package pin arrangement rather than function.
  '7436': {
    name: '74x36',
    simpleName: 'Quad 2-in NOR',
    description: 'Quad 2 input NOR gate (different pinout than 7402) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc36.pdf',
    tags: ['nor', 'gate', 'logic', 'quad'],
    guideOverview: 'The 7436 is a quad 2 input NOR with a package layout different from the familiar 7402 family. In functional terms it behaves as an ordinary quad NOR.',
    guidePinDescriptions: {
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '1Y':  'NOR output for gate 1. HIGH only when both 1A and 1B are LOW.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      '2Y':  'NOR output for gate 2.',
      'GND': 'Ground reference (pin 7).',
      '3Y':  'NOR output for gate 3.',
      '3A':  'Input A for gate 3.',
      '3B':  'Input B for gate 3.',
      '4Y':  'NOR output for gate 4.',
      '4A':  'Input A for gate 4.',
      '4B':  'Input B for gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Quad NOR (Alternate Pinout)',
        paragraphs: ['Identical NOR logic to the 7402 but with a different pin layout that may suit certain PCB routing configurations.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input' },
      { pin: 2,  name: '1B',  type: 'input' },
      { pin: 3,  name: '1Y',  type: 'output' },
      { pin: 4,  name: '2A',  type: 'input' },
      { pin: 5,  name: '2B',  type: 'input' },
      { pin: 6,  name: '2Y',  type: 'output' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3Y',  type: 'output' },
      { pin: 9,  name: '3A',  type: 'input' },
      { pin: 10, name: '3B',  type: 'input' },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input' },
      { pin: 13, name: '4B',  type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NOR', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NOR', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NOR', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 74x39: Quad 2 input NAND (open-collector, 60mA) ──────────────────────
  /* Primary source: Texas Instruments, SN7439 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7439.pdf
     Open-collector output technology: https://en.wikipedia.org/wiki/Open_collector */
  // Each gate is a 2 input NAND with an open-collector output stage.
  // The simulator honors the sink-only logic behavior but does not separately
  // enforce the higher current rating advertised for the physical device.
  '7439': {
    name: '74x39',
    simpleName: 'Quad 2-in NAND (OC)',
    description: 'Quad 2 input NAND gate (open-collector, 60mA; different pinout than 7438) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7439.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'open collector'],
    guideOverview: 'The 7439 is a quad 2 input NAND with open-collector outputs and a different pin order than some related parts. In 74Sim its important behavior is the NAND function plus sink-only output style.',
    guidePinDescriptions: {
      '1Y':  'Open-collector NAND output 1. Pulls LOW when 1A=HIGH and 1B=HIGH; high-Z otherwise.',
      '1A':  'Input A for gate 1.',
      '1B':  'Input B for gate 1.',
      '2Y':  'Open-collector NAND output 2.',
      '2A':  'Input A for gate 2.',
      '2B':  'Input B for gate 2.',
      'GND': 'Ground reference (pin 7).',
      '3A':  'Input A for gate 3.',
      '3B':  'Input B for gate 3.',
      '3Y':  'Open-collector NAND output 3.',
      '4A':  'Input A for gate 4.',
      '4B':  'Input B for gate 4.',
      '4Y':  'Open-collector NAND output 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Open Collector NAND (60 mA)',
        paragraphs: ['NAND logic with a sink-only output stage rated for 60 mA sink current. External pull up required. Can drive higher-current loads like LEDs or relays.'],
      },
    ],
    pinout: [
      { pin: 1,  name: '1Y',  type: 'output' },
      { pin: 2,  name: '1A',  type: 'input' },
      { pin: 3,  name: '1B',  type: 'input' },
      { pin: 4,  name: '2Y',  type: 'output' },
      { pin: 5,  name: '2A',  type: 'input' },
      { pin: 6,  name: '2B',  type: 'input' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3A',  type: 'input' },
      { pin: 9,  name: '3B',  type: 'input' },
      { pin: 10, name: '3Y',  type: 'output' },
      { pin: 11, name: '4A',  type: 'input' },
      { pin: 12, name: '4B',  type: 'input' },
      { pin: 13, name: '4Y',  type: 'output' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },


  // ── 74x43: Excess-3 to Decimal Decoder ───────────────────────────────────
  /* Primary source: Texas Instruments, SN7443A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7443a.pdf
     Decoder/demultiplexer concept: https://en.wikipedia.org/wiki/Multiplexer */
  // This decoder expects the input word to represent decimal digits encoded in
  // excess-3 form, meaning binary 0011 corresponds to 0 and 1100 corresponds
  // to 9. Valid codes activate one decimal output low.
  '7443': {
    name: '74x43',
    simpleName: 'XS3 to Decimal',
    description: 'Excess-3 to decimal decoder (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7443a.pdf',
    tags: ['decoder', 'excess-3', 'xs3', 'decimal', '10-line'],
    guideOverview: 'The 7443 converts a 4 bit excess-3 code into one of ten decimal outputs. It is useful when a preceding arithmetic or display stage already represents digits in XS-3 instead of ordinary BCD.',
    guidePinDescriptions: {
      'Y0':  'Decimal output 0, active LOW. Asserted when input is XS-3 code 0011.',
      'Y1':  'Decimal output 1.',
      'Y2':  'Decimal output 2.',
      'Y3':  'Decimal output 3.',
      'Y4':  'Decimal output 4.',
      'Y5':  'Decimal output 5.',
      'Y6':  'Decimal output 6.',
      'Y7':  'Decimal output 7.',
      'GND': 'Ground reference (pin 8).',
      'Y8':  'Decimal output 8.',
      'Y9':  'Decimal output 9.',
      'D':   'Address bit 3 (MSB) of the XS-3 input code.',
      'C':   'Address bit 2.',
      'B':   'Address bit 1.',
      'A':   'Address bit 0 (LSB).',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Excess-3 Coding',
        paragraphs: [
          'Excess-3 means the binary input value is three greater than the decimal digit you intend to represent. For example, decimal 0 is encoded as 0011 and decimal 5 is encoded as 1000.',
          'Only the valid excess-3 range for digits 0 through 9 produces an asserted decimal output. Other input codes are treated as inactive states.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'Y0',  type: 'output' },
      { pin: 2,  name: 'Y1',  type: 'output' },
      { pin: 3,  name: 'Y2',  type: 'output' },
      { pin: 4,  name: 'Y3',  type: 'output' },
      { pin: 5,  name: 'Y4',  type: 'output' },
      { pin: 6,  name: 'Y5',  type: 'output' },
      { pin: 7,  name: 'Y6',  type: 'output' },
      { pin: 8,  name: 'GND', type: 'power' },
      { pin: 9,  name: 'Y7',  type: 'output' },
      { pin: 10, name: 'Y8',  type: 'output' },
      { pin: 11, name: 'Y9',  type: 'output' },
      { pin: 12, name: 'D',   type: 'input' },
      { pin: 13, name: 'C',   type: 'input' },
      { pin: 14, name: 'B',   type: 'input' },
      { pin: 15, name: 'A',   type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'XS3_DECIMAL',
        inputs: ['A', 'B', 'C', 'D'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9'],
      },
    ],
  },

  // ── 74x44: Gray Code to Decimal Decoder ──────────────────────────────────
  /* Primary source: Texas Instruments, SN7444A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn7444a.pdf
     Decoder/demultiplexer concept: https://en.wikipedia.org/wiki/Multiplexer */
  // Inputs are interpreted as 4 bit reflected Gray code, then decoded to one
  // active decimal output. The value of this part is not Boolean gating but the
  // code conversion from a Gray-encoded source into decimal selection.
  '7444': {
    name: '74x44',
    simpleName: 'Gray to Decimal',
    description: 'Gray code to decimal decoder (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7444a.pdf',
    tags: ['decoder', 'gray code', 'gray', 'decimal', '10-line'],
    guideOverview: 'The 7444 converts a 4 bit Gray code input into one of ten decimal outputs. It is intended for systems where only one input bit changes between adjacent values and a decimal indicator or selector still needs to be driven.',
    guidePinDescriptions: {
      'Y0':  'Decimal output 0, active LOW.',
      'Y1':  'Decimal output 1.',
      'Y2':  'Decimal output 2.',
      'Y3':  'Decimal output 3.',
      'Y4':  'Decimal output 4.',
      'Y5':  'Decimal output 5.',
      'Y6':  'Decimal output 6.',
      'Y7':  'Decimal output 7.',
      'GND': 'Ground reference (pin 8).',
      'Y8':  'Decimal output 8.',
      'Y9':  'Decimal output 9.',
      'D':   'Address bit 3 (MSB) of the Gray code input.',
      'C':   'Address bit 2.',
      'B':   'Address bit 1.',
      'A':   'Address bit 0 (LSB).',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Gray Code Inputs',
        paragraphs: [
          'Gray code changes only one bit at a time between neighboring values, which reduces transient ambiguity in mechanical or sequential position encoding systems.',
          'The 7444 accepts that Gray-coded word and activates the corresponding decimal output, leaving invalid patterns inactive.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'Y0',  type: 'output' },
      { pin: 2,  name: 'Y1',  type: 'output' },
      { pin: 3,  name: 'Y2',  type: 'output' },
      { pin: 4,  name: 'Y3',  type: 'output' },
      { pin: 5,  name: 'Y4',  type: 'output' },
      { pin: 6,  name: 'Y5',  type: 'output' },
      { pin: 7,  name: 'Y6',  type: 'output' },
      { pin: 8,  name: 'GND', type: 'power' },
      { pin: 9,  name: 'Y7',  type: 'output' },
      { pin: 10, name: 'Y8',  type: 'output' },
      { pin: 11, name: 'Y9',  type: 'output' },
      { pin: 12, name: 'D',   type: 'input' },
      { pin: 13, name: 'C',   type: 'input' },
      { pin: 14, name: 'B',   type: 'input' },
      { pin: 15, name: 'A',   type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'GRAY_DECIMAL',
        inputs: ['A', 'B', 'C', 'D'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9'],
      },
    ],
  },
};
