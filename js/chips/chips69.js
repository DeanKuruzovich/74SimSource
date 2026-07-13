// chips69.js Block 69: CMOS 4000 series logic ICs
// Chips: CD4011, CD4012, CD4069, CD4082, CD4543, CD4027
export const CHIPS_BLOCK_69 = {

  // ── CD4011: Quad 2 input NAND (14-pin) ─────────────────────────────────
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4011B, CD4012B, CD4023B Types: CMOS NAND Gates", SCHS021D
  //   (rev. September 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4011b.pdf. Verified: CD4011B TERMINAL
  //   ASSIGNMENT (TOP VIEW) + FUNCTIONAL DIAGRAM with gate equations J=NAND(A,B),
  //   K=NAND(C,D), L=NAND(E,F), M=NAND(G,H), page 1 (sheet 3-26), and the DYNAMIC
  //   CHARACTERISTICS table, page 3 (sheet 3-28), read as 400-dpi rendered PDF
  //   page images (issues.md C4 — NOT the WebFetch text summarizer). Pin map
  //   A1=1,B1=2,Q1=3,Q2=4,A2=5,B2=6,GND(VSS)=7,A3=8,B3=9,Q3=10,Q4=11,A4=12,
  //   B4=13,VDD=14 and the four-NAND gate list confirmed CORRECT as already
  //   entered; engine (pinout[], gates[], specificChipsSim.js) left untouched.
  //   Note the outputs sit on pins 3/4/10/11, which is NOT the 7400 pinout
  //   (3/6/8/11) despite identical logic. Supply range 3 V to 18 V (recommended
  //   operating), 20 V abs-max; buffered inputs and outputs (the "B" suffix).
  // Universal-gate / functional-completeness claim: M. M. Mano and C. R. Kime,
  //   Logic and Computer Design Fundamentals, 3rd ed. Prentice Hall, 2004, p. 73.
  //   Also: Wikipedia contributors, "NAND gate," https://en.wikipedia.org/wiki/NAND_gate
  // CD4093 pin-compatibility (Schmitt-trigger sibling): Texas Instruments,
  //   "CD4093B Types: CMOS Quad 2-Input NAND Schmitt Triggers", SCHS020.
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4093b.pdf
  'CD4011': {
    name: 'CD4011',
    simpleName: 'Quad 2 Input NAND',
    description: 'Four independent 2 input NAND gates, CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4011b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NAND', 'quad'],
    guideOverview: 'The CD4011 holds four independent 2 input NAND gates. Each output is LOW only when both of its inputs are HIGH; if either input is LOW the output is HIGH. The logic is identical to the 74x00, but this is a CMOS 4000 series part: it runs on any supply from 3 V to 18 V, draws almost no current while its inputs sit still, and is much slower than the TTL 74x00, tens of nanoseconds per gate instead of a few. NAND is a universal gate, meaning any digital function can be built from NAND alone, which makes this one of the most reached for chips for glue logic, latches, and simple oscillators. One catch: despite the matching logic, the CD4011 does not use the same pinout as the 74x00, so the two are not drop in replacements.',
    guidePinDescriptions: {
      A1:  'Gate 1 input A (pin 1).',
      B1:  'Gate 1 input B (pin 2).',
      Q1:  'Gate 1 output (pin 3). LOW only when A1 and B1 are both HIGH.',
      Q2:  'Gate 2 output (pin 4). LOW only when A2 and B2 are both HIGH. The two left hand outputs sit side by side on pins 3 and 4, unlike the 74x00.',
      A2:  'Gate 2 input A (pin 5).',
      B2:  'Gate 2 input B (pin 6).',
      GND: 'Ground / negative supply (VSS, pin 7). Connect to 0 V.',
      A3:  'Gate 3 input A (pin 8).',
      B3:  'Gate 3 input B (pin 9).',
      Q3:  'Gate 3 output (pin 10). LOW only when A3 and B3 are both HIGH.',
      Q4:  'Gate 4 output (pin 11). LOW only when A4 and B4 are both HIGH.',
      A4:  'Gate 4 input A (pin 12).',
      B4:  'Gate 4 input B (pin 13).',
      VDD: 'Positive supply (pin 14). Any voltage from 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input',  description: 'Gate 1 input A' },
      { pin:  2, name: 'B1',  type: 'input',  description: 'Gate 1 input B' },
      { pin:  3, name: 'Q1',  type: 'output', description: 'Gate 1 NAND output: LOW only when A1 and B1 are both HIGH' },
      { pin:  4, name: 'Q2',  type: 'output', description: 'Gate 2 NAND output: LOW only when A2 and B2 are both HIGH' },
      { pin:  5, name: 'A2',  type: 'input',  description: 'Gate 2 input A' },
      { pin:  6, name: 'B2',  type: 'input',  description: 'Gate 2 input B' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'A3',  type: 'input',  description: 'Gate 3 input A' },
      { pin:  9, name: 'B3',  type: 'input',  description: 'Gate 3 input B' },
      { pin: 10, name: 'Q3',  type: 'output', description: 'Gate 3 NAND output' },
      { pin: 11, name: 'Q4',  type: 'output', description: 'Gate 4 NAND output' },
      { pin: 12, name: 'A4',  type: 'input',  description: 'Gate 4 input A' },
      { pin: 13, name: 'B4',  type: 'input',  description: 'Gate 4 input B' },
      { pin: 14, name: 'VDD', type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'NAND', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'NAND', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'NAND', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'How a NAND gate behaves',
        paragraphs: [
          'A NAND gate is an AND gate with its output inverted. The output stays HIGH for every input combination except one: it goes LOW only when both inputs are HIGH at the same time. A single LOW on either input is enough to force the output HIGH.',
          'The four gates are completely independent. They share only the two supply pins (VDD at pin 14, GND at pin 7), so you can use one gate, or all four, in unrelated parts of a circuit.',
        ],
        formulas: [
          'Y = NOT(A AND B)',
          'A=0,B=0 → Y=1 | A=0,B=1 → Y=1 | A=1,B=0 → Y=1 | A=1,B=1 → Y=0',
        ],
      },
      {
        title: 'One gate, any logic function',
        paragraphs: [
          'NAND is a universal gate: wire enough of them together and you can build any logic function, so a handful of CD4011s can stand in for AND, OR, NOT, and anything else.',
          'Cross couple two gates, each output feeding an input of the other, and you get an SR latch, the simplest one bit memory. Because these are NAND gates the latch is active LOW: you pull an input LOW to set or reset it, the opposite of the NOR latch built from a 74x02.',
        ],
        list: [
          'Inverter (NOT): tie the two inputs of a gate together, or hold one input HIGH and drive the other.',
          'SR latch: cross couple two gates; the two free inputs become active LOW Set and Reset.',
          'AND gate: follow one NAND with a second NAND wired as an inverter.',
          'Enable / gating: hold one input as an enable (LOW blocks the signal and forces the output HIGH) and feed data to the other.',
          'Simple RC oscillators and monostable (one shot) pulse timers.',
        ],
      },
      {
        title: 'Gotchas, and how it differs from the 74x00',
        paragraphs: [
          'The CD4011 has the same logic as the 74x00 but not the same pinout. Its outputs sit on pins 3, 4, 10, and 11, while the 74x00 puts them on pins 3, 6, 8, and 11. The chips are not interchangeable in a socket, so check pin numbers before wiring.',
          'As a CMOS part the CD4011 runs on anything from 3 V to 18 V and draws almost no current while idle, but it is slow next to TTL: roughly 60 ns per gate at a 10 V supply, and slower at 5 V, versus a few nanoseconds for a 74x00. That is fine for slow logic and hobby circuits, not for fast buses. (Propagation delay is simplified here to a single typical figure; the datasheet gives it per supply voltage and load.)',
        ],
        list: [
          'Never leave an unused input floating. A floating CMOS input drifts to an undefined level, wastes power, and picks up noise. Tie every unused input directly to VDD or GND.',
          'The B in CD4011B means the outputs are buffered by three internal stages for clean, sharp edges. The unbuffered CD4011UB uses a single stage; it switches slightly faster but has lower gain, and it is the version to use for linear or oscillator circuits where a buffered gate can misbehave. (Rule of thumb, simplified.)',
        ],
        note: 'To clean up a noisy or slowly rising input, reach for the CD4093 instead: it is pin compatible with the CD4011 but adds Schmitt trigger inputs (built in hysteresis) on every gate.',
      },
    ],
  },

  // ── CD4012: Dual 4 input NAND (14-pin) ─────────────────────────────────
  /* Primary source: Texas Instruments, CD4012 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4012b.pdf */
  'CD4012': {
    name: 'CD4012',
    simpleName: 'Dual 4 Input NAND',
    description: 'Dual 4 input NAND gate CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4012b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NAND', 'dual', '4 input'],
    guideOverview: 'The CD4012 contains two independent 4 input NAND gates. Output is LOW only when all four inputs are simultaneously HIGH; any single LOW input forces the output HIGH. Pins 6 and 8 are no connect. The chip provides the function of four cascaded AND gates in a single package. Supply voltage 3-15 V.',
    guidePinDescriptions: {
      '1Y':  'Output of gate 1. LOW only when 1A, 1B, 1C, and 1D are all HIGH.',
      '1A':  'Input A of gate 1.',
      '1B':  'Input B of gate 1.',
      '1C':  'Input C of gate 1.',
      '1D':  'Input D of gate 1.',
      'NC':  'No internal connection. Leave unconnected.',
      'GND': 'Ground reference (VSS). Connect to 0 V.',
      'NC2': 'No internal connection. Leave unconnected.',
      '2D':  'Input D of gate 2.',
      '2C':  'Input C of gate 2.',
      '2B':  'Input B of gate 2.',
      '2A':  'Input A of gate 2.',
      '2Y':  'Output of gate 2. LOW only when 2A, 2B, 2C, and 2D are all HIGH.',
      'VDD': 'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: '1Y',  type: 'output', description: 'Gate 1 NAND output: LOW when all inputs HIGH' },
      { pin:  2, name: '1A',  type: 'input',  description: 'Gate 1 input A' },
      { pin:  3, name: '1B',  type: 'input',  description: 'Gate 1 input B' },
      { pin:  4, name: '1C',  type: 'input',  description: 'Gate 1 input C' },
      { pin:  5, name: '1D',  type: 'input',  description: 'Gate 1 input D' },
      { pin:  6, name: 'NC',  type: 'nc',     description: 'No connection' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'NC2', type: 'nc',     description: 'No connection' },
      { pin:  9, name: '2D',  type: 'input',  description: 'Gate 2 input D' },
      { pin: 10, name: '2C',  type: 'input',  description: 'Gate 2 input C' },
      { pin: 11, name: '2B',  type: 'input',  description: 'Gate 2 input B' },
      { pin: 12, name: '2A',  type: 'input',  description: 'Gate 2 input A' },
      { pin: 13, name: '2Y',  type: 'output', description: 'Gate 2 NAND output: LOW when all inputs HIGH' },
      { pin: 14, name: 'VDD', type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A','1B','1C','1D'], output: '1Y' },
      { type: 'NAND', inputs: ['2A','2B','2C','2D'], output: '2Y' },
    ],
    guideSections: [
      {
        title: 'Logic Function',
        paragraphs: [
          'NAND logic: output is LOW only when every input is simultaneously HIGH. One LOW input is sufficient to hold the output HIGH.',
          'The 4 input version allows combining more conditions in a single gate, reducing chip count compared to cascading 2 input NAND gates.',
        ],
        formulas: [
          'Y = NOT(A · B · C · D)',
        ],
      },
      {
        title: 'Typical Uses',
        list: [
          'Detect when all four conditions are true (all inputs HIGH)   output goes LOW as an active LOW flag.',
          'Enable control: any one of four inputs can block the output (keep it HIGH) by going LOW.',
          'Reduce gate count versus cascading two 2-input NAND gates for a 4-input function.',
        ],
        
      },
    ],
  },

  // ── CD4069: Hex inverter (14-pin) ──────────────────────────────────────
  /* Primary source: Texas Instruments, CD4069 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4069ub.pdf */
  'CD4069': {
    name: 'CD4069',
    simpleName: 'Hex Inverter',
    description: 'Six unbuffered CMOS inverters. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4069ub.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NOT', 'inverter', 'hex inverter'],
    guideOverview: 'The CD4069 contains six independent unbuffered CMOS inverter gates. Each gate outputs the complement of its input: HIGH when input is LOW, LOW when input is HIGH. Unlike the CD4049 or CD40106, the CD4069UB is unbuffered, meaning its output is a single CMOS inverting stage. This gives a more linear voltage transfer characteristic, making it useful as a linear amplifier in oscillator and analog signal conditioning circuits. Supply voltage 3-15 V.',
    guidePinDescriptions: {
      A:   'Input of inverter 1.',
      YA:  'Output of inverter 1. HIGH when A is LOW.',
      B:   'Input of inverter 2.',
      YB:  'Output of inverter 2. HIGH when B is LOW.',
      C:   'Input of inverter 3.',
      YC:  'Output of inverter 3. HIGH when C is LOW.',
      GND: 'Ground reference (VSS). Connect to 0 V.',
      YD:  'Output of inverter 4. HIGH when D is LOW.',
      D:   'Input of inverter 4.',
      YE:  'Output of inverter 5. HIGH when E is LOW.',
      E:   'Input of inverter 5.',
      YF:  'Output of inverter 6. HIGH when F is LOW.',
      F:   'Input of inverter 6.',
      VDD: 'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: 'A',   type: 'input',  description: 'Inverter 1 input' },
      { pin:  2, name: 'YA',  type: 'output', description: 'Inverter 1 output (inverted)' },
      { pin:  3, name: 'B',   type: 'input',  description: 'Inverter 2 input' },
      { pin:  4, name: 'YB',  type: 'output', description: 'Inverter 2 output' },
      { pin:  5, name: 'C',   type: 'input',  description: 'Inverter 3 input' },
      { pin:  6, name: 'YC',  type: 'output', description: 'Inverter 3 output' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'YD',  type: 'output', description: 'Inverter 4 output' },
      { pin:  9, name: 'D',   type: 'input',  description: 'Inverter 4 input' },
      { pin: 10, name: 'YE',  type: 'output', description: 'Inverter 5 output' },
      { pin: 11, name: 'E',   type: 'input',  description: 'Inverter 5 input' },
      { pin: 12, name: 'YF',  type: 'output', description: 'Inverter 6 output' },
      { pin: 13, name: 'F',   type: 'input',  description: 'Inverter 6 input' },
      { pin: 14, name: 'VDD', type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'NOT', inputs: ['A'], output: 'YA' },
      { type: 'NOT', inputs: ['B'], output: 'YB' },
      { type: 'NOT', inputs: ['C'], output: 'YC' },
      { type: 'NOT', inputs: ['D'], output: 'YD' },
      { type: 'NOT', inputs: ['E'], output: 'YE' },
      { type: 'NOT', inputs: ['F'], output: 'YF' },
    ],
    guideSections: [
      {
        title: 'Inverter Basics',
        paragraphs: [
          'Each gate inverts its input: a HIGH becomes LOW and a LOW becomes HIGH. Six separate gates on one package allow independent signal inversion on six channels.',
          'The CD4069UB is unbuffered, providing a more analog like voltage transfer curve than the buffered CD40106. This makes it suitable for biasing into the linear region as a simple CMOS amplifier or crystal oscillator driver.',
          'For digital only use where hysteresis and noise immunity are important, prefer the CD40106 (Schmitt trigger version) instead.',
        ],
        list: [
          'Signal inversion: complement any logic signal.',
          'Ring oscillator: chain an odd number of gates in a loop for a raw oscillation (frequency depends on gate propagation delay).',
          'Linear amplifier/oscillator: bias input near the switching threshold using a feedback resistor.',
        ],
        note: '74Sim models each gate as a digital inverter. Analog biasing and linear amplifier behavior are not simulated.',
      },
    ],
  },

  // ── CD4082: Dual 4 input AND (14-pin) ──────────────────────────────────
  /* Primary source: Texas Instruments, CD4082 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4082b.pdf */
  'CD4082': {
    name: 'CD4082',
    simpleName: 'Dual 4 Input AND',
    description: 'Dual 4 input AND gate CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4082b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'AND', 'dual', '4 input'],
    guideOverview: 'The CD4082 contains two independent 4 input AND gates. Output is HIGH only when all four inputs are simultaneously HIGH; any single LOW input forces the output LOW. Pins 6 and 8 are no connect. It is the 4 input AND counterpart to the CD4012 NAND. Supply voltage 3-15 V.',
    guidePinDescriptions: {
      '1Y':  'Output of gate 1. HIGH only when 1A, 1B, 1C, and 1D are all HIGH.',
      '1A':  'Input A of gate 1.',
      '1B':  'Input B of gate 1.',
      '1C':  'Input C of gate 1.',
      '1D':  'Input D of gate 1.',
      'NC':  'No internal connection. Leave unconnected.',
      'GND': 'Ground reference (VSS). Connect to 0 V.',
      'NC2': 'No internal connection. Leave unconnected.',
      '2D':  'Input D of gate 2.',
      '2C':  'Input C of gate 2.',
      '2B':  'Input B of gate 2.',
      '2A':  'Input A of gate 2.',
      '2Y':  'Output of gate 2. HIGH only when 2A, 2B, 2C, and 2D are all HIGH.',
      'VDD': 'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: '1Y',  type: 'output', description: 'Gate 1 AND output: HIGH when all inputs HIGH' },
      { pin:  2, name: '1A',  type: 'input',  description: 'Gate 1 input A' },
      { pin:  3, name: '1B',  type: 'input',  description: 'Gate 1 input B' },
      { pin:  4, name: '1C',  type: 'input',  description: 'Gate 1 input C' },
      { pin:  5, name: '1D',  type: 'input',  description: 'Gate 1 input D' },
      { pin:  6, name: 'NC',  type: 'nc',     description: 'No connection' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'NC2', type: 'nc',     description: 'No connection' },
      { pin:  9, name: '2D',  type: 'input',  description: 'Gate 2 input D' },
      { pin: 10, name: '2C',  type: 'input',  description: 'Gate 2 input C' },
      { pin: 11, name: '2B',  type: 'input',  description: 'Gate 2 input B' },
      { pin: 12, name: '2A',  type: 'input',  description: 'Gate 2 input A' },
      { pin: 13, name: '2Y',  type: 'output', description: 'Gate 2 AND output: HIGH when all inputs HIGH' },
      { pin: 14, name: 'VDD', type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'AND', inputs: ['1A','1B','1C','1D'], output: '1Y' },
      { type: 'AND', inputs: ['2A','2B','2C','2D'], output: '2Y' },
    ],
    guideSections: [
      {
        title: 'Logic Function',
        paragraphs: [
          'AND logic: output is HIGH only when every input is simultaneously HIGH. One LOW input immediately forces the output LOW.',
          'The 4 input version lets you gate a signal with three enable conditions simultaneously, or combine four parallel sensor inputs into a single all-conditions met flag.',
        ],
        formulas: [
          'Y = A · B · C · D',
        ],
      },
      {
        title: 'Typical Uses',
        list: [
          'All or nothing enable: output is HIGH only when all four enabling conditions are met.',
          'Multi input coincidence detector: output goes HIGH only when all four inputs agree.',
          'Reduce chip count versus cascading two 2-input AND gates for a 4-input function.',
        ],
        
      },
    ],
  },

  // ── CD4543: BCD to 7 segment latch/decoder/driver (16-pin) ─────────────
  /* Primary source: Texas Instruments, CD4543 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4543b.pdf
     https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  'CD4543': {
    name: 'CD4543',
    simpleName: 'BCD to 7 Segment Decoder/Driver (CA/CC)',
    description: 'BCD to 7-seg latch/decoder/driver, common anode/cathode, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4543b.pdf',
    tags: ['cmos', '4000 series', 'decoder', '7 segment', 'BCD decoder', 'display driver', 'latch', 'LCD', 'common anode', 'common cathode'],
    guideOverview: 'The CD4543 converts a 4 bit BCD input (A D) into seven segment drive signals (a g) for either common cathode or common anode 7 segment LED/LCD displays. The Ph (Phase) pin selects output polarity: Ph=LOW gives active HIGH outputs for common cathode displays; Ph=HIGH inverts all outputs for common anode displays. A transparent latch (LE) holds the displayed digit when HIGH. BL (active HIGH) blanks all segments. BCD values-10-15 produce a blank output. Unlike the CD4511, there is no lamp test pin, and blanking is active HIGH.',
    guidePinDescriptions: {
      Ph:  'Phase / polarity select. LOW = active HIGH outputs (common cathode). HIGH = active LOW outputs (common anode).',
      D:   'BCD input bit 3 (weight 8, MSB).',
      A:   'BCD input bit 0 (weight 1, LSB).',
      B:   'BCD input bit 1 (weight 2).',
      C:   'BCD input bit 2 (weight 4).',
      BL:  'Blanking input. Active HIGH: all segments OFF when HIGH. Set LOW for normal operation.',
      LE:  'Latch Enable. Transparent when LOW: segment outputs follow BCD inputs in real time. When HIGH: latches the current BCD value so the display holds even if inputs change.',
      GND: 'Ground (0 V). Connect to negative supply rail.',
      f:   'Segment f output (upper left vertical bar).',
      g:   'Segment g output (middle horizontal bar).',
      a:   'Segment a output (top horizontal bar).',
      b:   'Segment b output (upper right vertical bar).',
      c:   'Segment c output (lower right vertical bar).',
      d:   'Segment d output (bottom horizontal bar).',
      e:   'Segment e output (lower left vertical bar).',
      VDD: 'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: 'Ph',  type: 'input',  description: 'Phase select: LOW=active HIGH (CC), HIGH=active LOW (CA)' },
      { pin:  2, name: 'D',   type: 'input',  description: 'BCD input bit 3 (weight 8)' },
      { pin:  3, name: 'A',   type: 'input',  description: 'BCD input bit 0 (weight 1)' },
      { pin:  4, name: 'B',   type: 'input',  description: 'BCD input bit 1 (weight 2)' },
      { pin:  5, name: 'C',   type: 'input',  description: 'BCD input bit 2 (weight 4)' },
      { pin:  6, name: 'BL',  type: 'input',  description: 'Blanking (active HIGH)' },
      { pin:  7, name: 'LE',  type: 'input',  description: 'Latch Enable (HIGH=latch)' },
      { pin:  8, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  9, name: 'f',   type: 'output', description: 'Segment f (upper left vertical)' },
      { pin: 10, name: 'g',   type: 'output', description: 'Segment g (middle horizontal)' },
      { pin: 11, name: 'a',   type: 'output', description: 'Segment a (top horizontal)' },
      { pin: 12, name: 'b',   type: 'output', description: 'Segment b (upper right vertical)' },
      { pin: 13, name: 'c',   type: 'output', description: 'Segment c (lower right vertical)' },
      { pin: 14, name: 'd',   type: 'output', description: 'Segment d (bottom horizontal)' },
      { pin: 15, name: 'e',   type: 'output', description: 'Segment e (lower left vertical)' },
      { pin: 16, name: 'VDD', type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'BCD_7SEG_4543', inputs: ['A','B','C','D','LE','BL','Ph'], outputs: ['a','b','c','d','e','f','g'] },
    ],
    guideSections: [
      {
        title: 'BCD to 7 Segment Decoding',
        paragraphs: [
          'In transparent mode (LE=LOW), segment outputs track the BCD input in real time. When LE goes HIGH the current digit is latched and held, even if A D change. This is useful for freezing a displayed value during a calculation or input update cycle.',
          'BL=HIGH blanks all segments regardless of BCD input. BCD values 10-15 (invalid) also produce a blank display.',
          'The Ph pin makes this chip work with either display type without external inverters: Ph=LOW drives common cathode displays (active HIGH segment outputs), Ph=HIGH drives common anode displays (active LOW outputs).',
        ],
        list: [
          'Common cathode display: connect Ph to GND. Segment outputs drive LED anodes directly through current limiting resistors.',
          'Common anode display: connect Ph to VDD. Segment outputs drive LED cathodes (active LOW).',
          'Latch mode: toggle LE HIGH to hold the displayed digit while BCD input changes, then return LE LOW to update.',
          'Blanking: drive BL HIGH to turn off the display (e.g., suppress leading zeros).',
        ],
        note: 'Unlike the CD4511, the CD4543 has no lamp test pin. Blanking is active HIGH (HIGH=blank), the opposite polarity from the CD4511 BL/BIn pin.',
      },
    ],
  },

  // ── CD4027: Dual JK Master Slave Flip Flop (16-pin) ────────────────────
  /* Primary source: Texas Instruments, CD4027 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/CD4027.pdf */
  'CD4027': {
    name: 'CD4027',
    simpleName: 'Dual JK Master Slave FF',
    description: 'Dual JK master-slave FF, active-HIGH set/reset, pos-edge, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/CD4027.pdf',
    tags: ['cmos', '4000 series', 'flip flop', 'jk', 'sequential', 'dual', 'set', 'reset', 'positive edge'],
    guideOverview: 'The CD4027 contains two independent positive edge triggered JK master slave flip flops. Each flip flop has active HIGH set (S) and reset (R) inputs that asynchronously force the output regardless of the clock. On the rising edge of the clock: J=0,K=0 holds state; J=1,K=0 sets Q; J=0,K=1 resets Q; J=1,K=1 toggles Q. The wide supply range (3-15 V) and near zero static current make it well suited for battery-powered designs.',
    guidePinDescriptions: {
      '1Q':  'True output of flip flop 1.',
      '1Qn': 'Inverted output of flip flop 1.',
      '1C':  'Clock input of FF1. Triggers on rising edge (LOW→HIGH transition).',
      '1R':  'Asynchronous reset for FF1, active HIGH. Pull HIGH to force Q1=0 immediately, overriding the clock.',
      '1S':  'Asynchronous set for FF1, active HIGH. Pull HIGH to force Q1=1 immediately, overriding the clock.',
      '1J':  'J input of flip flop 1.',
      '1K':  'K input of flip flop 1.',
      'GND': 'Ground reference (VSS). Connect to 0 V.',
      '2K':  'K input of flip flop 2.',
      '2J':  'J input of flip flop 2.',
      '2S':  'Asynchronous set for FF2, active HIGH. Pull HIGH to force Q2=1 immediately, overriding the clock.',
      '2R':  'Asynchronous reset for FF2, active HIGH. Pull HIGH to force Q2=0 immediately, overriding the clock.',
      '2C':  'Clock input of FF2. Triggers on rising edge (LOW→HIGH transition).',
      '2Qn': 'Inverted output of flip flop 2.',
      '2Q':  'True output of flip flop 2.',
      'VDD': 'Positive supply (3-15 V).',
    },
    guideSections: [
      {
        title: 'JK Logic with Active HIGH Set and Reset',
        paragraphs: [
          'Unlike 74 series JK flip flops which use active LOW preset and clear, the CD4027 uses active HIGH S (set) and R (reset). Pull S HIGH to immediately force Q=1; pull R HIGH to force Q=0. Both should not be HIGH simultaneously the result is undefined.',
          'With S and R both LOW, the clock rising edge determines the next state: J=0,K=0 holds; J=1,K=0 sets; J=0,K=1 resets; J=1,K=1 toggles.',
        ],
        note: 'Positive edge triggering is opposite to most 74 series JK flip flops (e.g. 74x76, 74x73) which trigger on the falling edge. Supply 3-15 V (some versions to 18 V).',
      },
    ],
    pinout: [
      { pin: 1,  name: '1Q',  type: 'output', description: 'Flip flop 1 true output (Q1)' },
      { pin: 2,  name: '1Qn', type: 'output', description: 'Flip flop 1 inverted output (/Q1)' },
      { pin: 3,  name: '1C',  type: 'input',  description: 'Flip flop 1 clock, rising edge triggered' },
      { pin: 4,  name: '1R',  type: 'input',  description: 'Flip flop 1 asynchronous reset, active HIGH: forces Q1=0' },
      { pin: 5,  name: '1S',  type: 'input',  description: 'Flip flop 1 asynchronous set, active HIGH: forces Q1=1' },
      { pin: 6,  name: '1J',  type: 'input',  description: 'Flip flop 1 J input' },
      { pin: 7,  name: '1K',  type: 'input',  description: 'Flip flop 1 K input' },
      { pin: 8,  name: 'GND', type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin: 9,  name: '2K',  type: 'input',  description: 'Flip flop 2 K input' },
      { pin: 10, name: '2J',  type: 'input',  description: 'Flip flop 2 J input' },
      { pin: 11, name: '2S',  type: 'input',  description: 'Flip flop 2 asynchronous set, active HIGH: forces Q2=1' },
      { pin: 12, name: '2R',  type: 'input',  description: 'Flip flop 2 asynchronous reset, active HIGH: forces Q2=0' },
      { pin: 13, name: '2C',  type: 'input',  description: 'Flip flop 2 clock, rising edge triggered' },
      { pin: 14, name: '2Qn', type: 'output', description: 'Flip flop 2 inverted output (/Q2)' },
      { pin: 15, name: '2Q',  type: 'output', description: 'Flip flop 2 true output (Q2)' },
      { pin: 16, name: 'VDD', type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'JK_FF_CMOS', inputs: ['1J', '1K', '1C', '1S', '1R'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_CMOS', inputs: ['2J', '2K', '2C', '2S', '2R'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

};
