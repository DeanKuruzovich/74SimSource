// chips68.js Block 68: CMOS 4000 series and miscellaneous logic ICs
export const CHIPS_BLOCK_68 = {

  // ── CD4001: Quad 2 input NOR — CMOS 4000 series (14-pin) ────────────────
  /* [1] Texas Instruments, "CD4001B, CD4002B, CD4025B Types — CMOS NOR Gates,
         High-Voltage Types (20-Volt Rating)", SCHS015C (Rev. Aug. 2003). [Online].
         Available: https://www.ti.com/lit/ds/symlink/cd4001b.pdf. Verified: CD4001B
         terminal assignment and NOR function from the Functional Diagram, plus the
         3–18 V supply range, ~60 ns (10 V) propagation delay and noise-margin specs,
         page 1, read as 400-dpi rendered PDF page images (NOT a text summary — see
         issues.md C4). Outputs confirmed on pins 3, 4, 10, 11 (the 4001/4011 layout),
         which is NOT the 74x02 pinout — so the existing pinout[]/gates[] are correct
         and were left unchanged.
     [2] M. M. Mano and C. R. Kime, Logic and Computer Design Fundamentals, 3rd ed.
         Prentice Hall, 2004, p. 73 — NOR is functionally complete (a universal gate).
     [3] Wikipedia contributors, "NOR gate," https://en.wikipedia.org/wiki/NOR_gate;
         and "Flip-flop (electronics)," https://en.wikipedia.org/wiki/Flip-flop_(electronics)
         — SR latch from two cross-coupled NOR gates. */
  'CD4001': {
    name: 'CD4001',
    simpleName: 'Quad 2 Input NOR',
    description: 'Quad 2-input NOR gate, CMOS 4000; not 74x02 pin-compatible. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4001b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NOR', 'quad'],
    guideOverview: 'The CD4001 packs four independent 2 input NOR gates built in CMOS. Each output is HIGH only when both of its inputs are LOW; any HIGH input drives the output LOW. Being CMOS, it runs on any supply from 3 to 18 V and draws almost no current while its inputs are held still, so it shows up in low power and battery circuits where a 74 series NOR would waste power. One thing to watch: its pinout is not the same as the 74x02/74HC02 NOR. The CD4001 puts its outputs on pins 3, 4, 10 and 11 (the same layout as the CD4011 NAND), so you cannot drop it into a 74x02 socket without rewiring.',
    guidePinDescriptions: {
      A1:  'Gate 1 input A (pin 1).',
      B1:  'Gate 1 input B (pin 2).',
      Q1:  'Gate 1 NOR output (pin 3). HIGH only when A1 and B1 are both LOW.',
      Q2:  'Gate 2 NOR output (pin 4). HIGH only when A2 and B2 are both LOW.',
      A2:  'Gate 2 input A (pin 5).',
      B2:  'Gate 2 input B (pin 6).',
      GND: 'Ground / VSS (pin 7). Connect to 0 V.',
      A3:  'Gate 3 input A (pin 8).',
      B3:  'Gate 3 input B (pin 9).',
      Q3:  'Gate 3 NOR output (pin 10). HIGH only when A3 and B3 are both LOW.',
      Q4:  'Gate 4 NOR output (pin 11). HIGH only when A4 and B4 are both LOW.',
      A4:  'Gate 4 input A (pin 12).',
      B4:  'Gate 4 input B (pin 13).',
      VDD: 'Positive supply / VDD (pin 14). Any voltage from 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input',  description: 'Gate 1 input A' },
      { pin:  2, name: 'B1',  type: 'input',  description: 'Gate 1 input B' },
      { pin:  3, name: 'Q1',  type: 'output', description: 'Gate 1 NOR output: HIGH only when A1 and B1 are both LOW' },
      { pin:  4, name: 'Q2',  type: 'output', description: 'Gate 2 NOR output: HIGH only when A2 and B2 are both LOW' },
      { pin:  5, name: 'A2',  type: 'input',  description: 'Gate 2 input A' },
      { pin:  6, name: 'B2',  type: 'input',  description: 'Gate 2 input B' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'A3',  type: 'input',  description: 'Gate 3 input A' },
      { pin:  9, name: 'B3',  type: 'input',  description: 'Gate 3 input B' },
      { pin: 10, name: 'Q3',  type: 'output', description: 'Gate 3 NOR output' },
      { pin: 11, name: 'Q4',  type: 'output', description: 'Gate 4 NOR output' },
      { pin: 12, name: 'A4',  type: 'input',  description: 'Gate 4 input A' },
      { pin: 13, name: 'B4',  type: 'input',  description: 'Gate 4 input B' },
      { pin: 14, name: 'VDD', type: 'power',  description: 'Positive supply (3 18 V)' },
    ],
    gates: [
      { type: 'NOR', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'NOR', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'NOR', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'NOR', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'NOR gate logic',
        paragraphs: [
          'A NOR gate is an OR gate followed by an inverter. The output is HIGH only when both inputs are LOW; the moment either input goes HIGH, the output goes LOW.',
          'NOR is a universal gate: any logic function — AND, OR, NOT, and everything built from them — can be made out of NOR gates alone. That, plus four gates in one package, is why the CD4001 turns up so often as glue logic.',
        ],
        formulas: [
          'Q = NOT(A OR B)',
          'A=0,B=0 → Q=1 | A=0,B=1 → Q=0 | A=1,B=0 → Q=0 | A=1,B=1 → Q=0',
        ],
      },
      {
        title: 'Watch the pinout — it is not the 74x02',
        paragraphs: [
          'The CD4001 and the 74x02 are both quad 2 input NOR chips, but their pins are laid out differently, so they are not interchangeable. The CD4001 places its four outputs on pins 3, 4, 10 and 11; the 74x02 places them on pins 1, 4, 10 and 13. Swapping one for the other without rewiring will not work.',
          'The CD4001 uses the exact same pin layout as the CD4011 quad NAND. If a NOR circuit misbehaves, it is worth checking you did not grab a 4011 by mistake — the two chips look identical on the bench.',
        ],
        note: "Each gate's two inputs sit right next to its output: inputs 1,2 → output 3; inputs 5,6 → output 4; inputs 8,9 → output 10; inputs 12,13 → output 11.",
      },
      {
        title: 'Common uses',
        list: [
          'SR latch: cross-couple two gates (feed each output back into an input of the other). The two free inputs become Set and Reset — the basic 1-bit memory cell.',
          'Inverter: tie a gate\'s two inputs together and it outputs the opposite of that one signal.',
          'Build any logic: AND, OR, NAND and more, all from NOR gates, to cut the number of chips on a board.',
          'Glue logic: combine a few control or enable signals into a single output.',
        ],
        note: 'The SR latch has one forbidden input: Set and Reset both HIGH forces both outputs LOW, and the state is undefined when they return to LOW together.',
      },
      {
        title: 'CMOS notes for beginners',
        paragraphs: [
          'As a CMOS part the CD4001 runs on any supply from 3 to 18 V, and its switching threshold scales with the supply — near half of VDD — rather than sitting at fixed 5 V TTL levels. Held still, it draws almost no current, which is why 4000 series parts suit battery and low power designs.',
          'The rule beginners trip on: never leave an input floating. An unconnected CMOS input can drift to mid voltage, which makes the gate draw current, heat up, and produce a random or oscillating output. Tie every unused input directly to VDD or GND.',
        ],
        note: 'The real chip has a propagation delay of about 60 ns at a 10 V supply (250 ns worst case at 5 V). The simulator treats gates as instant in LIVE mode, so timing here is a simplification.',
      },
    ],
  },

  // ── CD4030: Quad 2 input XOR (14-pin) ──────────────────────────────────
  /* Primary source: Texas Instruments, CD4030 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4030b.pdf */
  'CD4030': {
    name: 'CD4030',
    simpleName: 'Quad 2 input XOR',
    description: 'Quad 2-input XOR gate, CMOS 4000 (pin-compatible w/ CD4070) (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4030b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'XOR', 'exclusive OR'],
    guideOverview: 'The CD4030 contains four independent 2 input XOR (exclusive OR) gates. The output is HIGH only when exactly one input is HIGH if both inputs match (both HIGH or both LOW) the output is LOW. Functionally identical to the CD4070 and pin compatible with the 74x86.',
    guidePinDescriptions: {
      A1:  'Input A of gate 1.',
      B1:  'Input B of gate 1.',
      Q1:  'Output of gate 1. HIGH when A1 and B1 differ.',
      Q2:  'Output of gate 2. HIGH when A2 and B2 differ.',
      A2:  'Input A of gate 2.',
      B2:  'Input B of gate 2.',
      GND: 'Ground (0 V). Connect to negative supply rail.',
      A3:  'Input A of gate 3.',
      B3:  'Input B of gate 3.',
      Q3:  'Output of gate 3. HIGH when A3 and B3 differ.',
      Q4:  'Output of gate 4. HIGH when A4 and B4 differ.',
      A4:  'Input A of gate 4.',
      B4:  'Input B of gate 4.',
      VDD: 'Positive supply. Accepts 3 V to 15 V (some versions to 20 V).',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'Q1',  type: 'output' },
      { pin:  4, name: 'Q2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'B2',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'input'  },
      { pin:  9, name: 'B3',  type: 'input'  },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'A4',  type: 'input'  },
      { pin: 13, name: 'B4',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'XOR', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'XOR', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'XOR', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'XOR', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'XOR Logic',
        paragraphs: [
          'XOR output is HIGH when exactly one input is HIGH. If both inputs are LOW (00) or both HIGH (11), the output is LOW.',
          'Tying one input permanently HIGH makes the gate act as an inverter. Tying it permanently LOW makes the gate a buffer (passes the other input unchanged).',
          'Cascading two XOR gates in series produces XNOR logic (output HIGH when inputs are equal).',
        ],
        list: [
          'Parity generators and checkers for error detection in data transmission.',
          'Binary adder half sum logic (sum bit in a 1 bit adder).',
          'Programmable inverter: use one input as the data line and the other as a polarity select control.',
          'Toggle flip flop: connect one input to Q of a D flip flop, feed output back to D Q toggles on each rising edge when the other input is HIGH.',
        ],
      },
    ],
  },

  // ── CD4070: Quad 2 input XOR (14-pin) ──────────────────────────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4070B, CD4077B -- CMOS Quad Exclusive-OR and
     Exclusive-NOR Gate," SCHS055E (Jan. 1998, rev. Sep. 2003). [Online].
     Available: https://www.ti.com/lit/ds/symlink/cd4070b.pdf. Verified as
     300-dpi PDF page images (issues.md C4): CD4070B Pinouts (TOP VIEW) and
     Functional Diagram, page 2 -- A=1, B=2, J=A(+)B=3, K=C(+)D=4, C=5, D=6,
     VSS=7, E=8, F=9, L=E(+)F=10, M=G(+)H=11, G=12, H=13, VDD=14; four
     positive-logic 2-input XOR gates with outputs on pins 3,4,10,11. The
     schematic note (Fig. 1, page 3) confirms the grouping A=1(6,8,13),
     B=2(5,9,12), out J=3(4,10,11). CD4070B TRUTH TABLE (page 3): 00->0,
     10->1, 01->1, 11->0, i.e. J = A XOR B. pinout[] and gates[] confirmed
     against this -- engine left unchanged.
     Also read (pages 1, 4-5, PDF images): supply range 3-18 V typ (Operating
     Conditions, page 4) with abs-max VDD -0.5 to 20 V (page 4); quiescent
     current IDD 0.01 uA typ at 5 V, 0.02 uA typ at 20 V (page 4); typical
     propagation delay tPHL/tPLH 140 ns @5 V, 65 ns @10 V, 50 ns @15 V at
     CL=50 pF (AC table, page 5); output drive IOL/IOH ~0.5 mA min @5 V,
     ~1.3 mA @10 V (page 4); input capacitance 5 pF typ (page 5). Datasheet
     Applications (page 1): logical comparators, adders/subtractors, parity
     generators and checkers.
     Pinout contrast -- the 4000-series quad 2-input gate family (CD4001 NOR,
     CD4011 NAND, CD4081 AND, CD4030/CD4070 XOR, CD4071 OR, CD4077 XNOR)
     shares outputs on pins 3,4,10,11, but the 74-series 7486/74HC86 TTL XOR
     does NOT: Texas Instruments, "SN5486, SN54LS86A, SN7486, SN74LS86A,
     SN74S86 Quadruple 2-Input Exclusive-OR Gates," SDLS067. [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls86a.pdf. Verified
     in-repo against the 74x86 entry (chips1.js): 7486 outputs land on pins
     3,6,8,11 -- a different terminal map. Trusted for the "same logic,
     different pinout than the 74x86" claim; CD4070 is a true drop-in only for
     the CD4030 (identical map) and the CD4077 (same map, XNOR).
     XOR as a 1-bit inequality detector, its use in the half-adder sum bit /
     parity / controlled inversion, and the fact that XOR is NOT functionally
     complete (not a universal gate) unlike NAND/NOR: Wikipedia contributors,
     "XOR gate." [Online]. Available: https://en.wikipedia.org/wiki/XOR_gate.
     The prior overview's "RC oscillator ~2 MHz at 1 kOhm/0.01 uF" claim was
     dropped as unsupported: 1 kOhm x 0.01 uF ~ 100 kHz, not 2 MHz, and a
     plain XOR gate has no hysteresis, so it is not the natural relaxation-
     oscillator gate (that is the Schmitt-trigger 40106/4093).
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  'CD4070': {
    name: 'CD4070',
    simpleName: 'Quad 2 input XOR',
    description: 'Quad 2-input XOR gate, CMOS 4000 (pin-for-pin the CD4030). (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4070b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'XOR', 'exclusive OR'],
    guideOverview: 'The CD4070 packs four independent 2 input XOR (exclusive OR) gates into one 14-pin chip. Each output is HIGH only when its two inputs are different, and LOW when they match, so one gate is really a 1-bit "are these two signals the same or not?" detector. That single behavior is why XOR turns up all over digital design: it produces the sum bit in binary addition, it checks parity, it compares two bits for equality, and it inverts a signal only when you tell it to. The CD4070 is a 4000 series CMOS part, so it runs on a wide 3 V to 18 V supply, draws about a microamp sitting still, and switches noticeably slower than TTL (roughly 65 ns at 10 V). Its four outputs sit on pins 3, 4, 10 and 11 the layout shared by the whole 4000 series quad gate family (the 4001 NOR, 4011 NAND, 4081 AND, 4071 OR). That makes it a drop-in for the CD4030, its pin-for-pin twin, and pin-matched to the CD4077 if you want the inverted (XNOR) version but it is not the 74x86 TTL XOR, which does the same logic on a different pinout (outputs on 3, 6, 8 and 11). As with any CMOS gate, never leave an input floating: tie every unused input to VDD or ground.',
    guidePinDescriptions: {
      A1:  'First input of gate 1 (labelled A on the datasheet).',
      B1:  'Second input of gate 1 (labelled B on the datasheet).',
      Q1:  'Output of gate 1. HIGH when A1 and B1 differ, LOW when they match.',
      Q2:  'Output of gate 2. HIGH when A2 and B2 differ, LOW when they match.',
      A2:  'First input of gate 2 (labelled C on the datasheet).',
      B2:  'Second input of gate 2 (labelled D on the datasheet).',
      GND: 'Ground, VSS (0 V). The negative supply rail and the 0 reference for every input and output.',
      A3:  'First input of gate 3 (labelled E on the datasheet).',
      B3:  'Second input of gate 3 (labelled F on the datasheet).',
      Q3:  'Output of gate 3. HIGH when A3 and B3 differ, LOW when they match.',
      Q4:  'Output of gate 4. HIGH when A4 and B4 differ, LOW when they match.',
      A4:  'First input of gate 4 (labelled G on the datasheet).',
      B4:  'Second input of gate 4 (labelled H on the datasheet).',
      VDD: 'Positive supply, 3 V to 18 V (20 V absolute maximum). All four gates share it.',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'Q1',  type: 'output' },
      { pin:  4, name: 'Q2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'B2',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'input'  },
      { pin:  9, name: 'B3',  type: 'input'  },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'A4',  type: 'input'  },
      { pin: 13, name: 'B4',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'XOR', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'XOR', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'XOR', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'XOR', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'XOR Gate Logic',
        paragraphs: [
          'An XOR (exclusive OR) gate outputs HIGH when its two inputs are different and LOW when they are the same. Read it as "one or the other, but not both." A plain OR gate also goes HIGH when both inputs are HIGH; XOR is the version that leaves that case out, which is where the "exclusive" comes from. With two inputs that is two HIGH rows and two LOW rows, as the table below shows.',
          'Because the output is HIGH only when the inputs disagree, one gate is a 1-bit difference detector: feed it two signals and it tells you whether they match. Holding one input LOW makes the gate pass the other input straight through; holding that input HIGH makes it invert the other input. So one XOR input acts as a "flip it or not" control that is the programmable-inverter trick further down. The four gates are fully independent and share only the two power pins.',
        ],
        formulas: [
          'Q = A XOR B = (A AND NOT B) OR (NOT A AND B)',
          'A=0,B=0 → Q=0 | A=0,B=1 → Q=1 | A=1,B=0 → Q=1 | A=1,B=1 → Q=0',
        ],
      },
      {
        title: 'CMOS, not TTL what changes',
        paragraphs: [
          'The CD4070 is a 4000 series CMOS chip, so it behaves differently from the 74x86, the common TTL quad XOR, in ways worth knowing before you build.',
          'Supply: it runs on anything from 3 V to 18 V (20 V is the absolute maximum), and its HIGH and LOW levels scale with whatever supply you pick, instead of sitting near a fixed 5 V like TTL. Power: with its inputs held at solid HIGH or LOW levels it draws only about a microamp, so its power use is set almost entirely by how fast you switch it, not by sitting idle. Speed: that low power costs speed a change takes roughly 140 ns to cross the gate at 5 V, about 65 ns at 10 V, and about 50 ns at 15 V, so a higher supply makes it faster. A 74LS86 does the same trip about ten times quicker. Drive: the outputs source or sink only about a milliamp, far less than TTL, so do not expect one to drive a heavy load or a bright LED on its own.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Equality / comparator: XOR two bits and the output is HIGH when they differ. Run several bit-pairs through separate gates and OR the results to flag "these two numbers are not equal" the front end of a comparator.',
          'Adder sum bit: the sum output of a 1-bit half-adder is A XOR B (the carry is A AND B). Chain XORs and you build the full adders inside every ALU.',
          'Parity generator and checker: XOR a string of bits together and the result is 1 when an odd number of them are HIGH. That one parity bit lets a receiver catch a single-bit error the datasheet lists this as a headline use.',
          'Controlled (programmable) inverter: put data on one input and a control line on the other. Control LOW passes the data through; control HIGH inverts it. Handy for switching a signal\'s polarity, or for two\'s-complement subtraction (invert one operand, then add 1).',
          'XNOR from XOR: follow a gate with an inverter, or hold one input HIGH, to get the opposite sense (HIGH when the inputs match). If you need a whole chip of that, the pin-compatible CD4077 is the quad XNOR.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Do not leave a CMOS input floating. An unconnected input can drift to mid-voltage, which makes the gate draw current, warm up, and put out a random or oscillating level. Tie every unused input directly to VDD or ground even the inputs of gates you are not using.',
          'XOR is not OR. Both go HIGH when exactly one input is HIGH, but they split when both inputs are HIGH: OR stays HIGH, XOR goes LOW. Mixing the two up is the classic beginner slip.',
          'It is not the 74x86\'s pinout. The TTL 74x86 does the same XOR logic but puts its outputs on pins 3, 6, 8 and 11; the CD4070 uses the 4000 series layout (outputs on 3, 4, 10 and 11). The only true drop-in is the CD4030, the identical CMOS part.',
          'Weak drive, no snap-action. Each output pushes only about a milliamp, and the input switches at a single threshold near half the supply with no hysteresis, so a slow or noisy input can make the output chatter as it crosses. For clean switching on slow edges, or to build an oscillator, reach for a Schmitt-trigger part (the 40106 or 4093), not a plain XOR.',
        ],
        note: 'Real gates are not instant. A change takes time to travel from input to output roughly 140 ns at 5 V, 65 ns at 10 V, and 50 ns at 15 V on the CD4070B (a higher supply is faster). The simulator treats this delay as zero in LIVE mode, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
  },

  // ── CD4071: Quad 2 input OR (14-pin) ───────────────────────────────────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD4071B, CD4072B, CD4075B Types -- CMOS OR Gates, High-Voltage Types
     (20-Volt Rating)," SCHS056D (rev. Aug. 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4071b.pdf. Verified as 300-dpi PDF page
     images (issues.md C4): CD4071B TERMINAL ASSIGNMENTS (TOP VIEW, p. 4) and the
     top-right FUNCTIONAL DIAGRAM (p. 1) -- A=1, B=2, J=A+B=3, K=C+D=4, C=5, D=6,
     VSS=7, E=8, F=9, L=E+F=10, M=G+H=11, G=12, H=13, VDD=14; four positive-logic
     2-input OR gates with outputs on pins 3,4,10,11 (Fig. 5 logic diagram, p. 2).
     pinout[] and gates[] confirmed against this -- engine left unchanged.
     Also read (p. 1-2, PDF images): recommended supply range 3-18 V and abs-max
     20 V DC; quiescent current 1 uA typ at 18 V; typical propagation delay
     tPHL/tPLH 125 ns @5 V, 60 ns @10 V, 45 ns @15 V; input capacitance 5 pF; and
     the "connect all unused inputs to VDD or VSS" note (Fig. 16, p. 4).
     Pinout contrast -- the 4000-series quad-2-input gate family (CD4001 NOR,
     CD4011 NAND, CD4081 AND, CD4070 XOR, CD4071 OR) shares outputs on 3,4,10,11,
     but the 74-series 7432/74HC32 OR does NOT: Texas Instruments, "Quadruple
     2-Input Positive-OR Gates (SN5432/SN54LS32/SN7432/SN74LS32...)," SDLS100
     (Dec. 1983, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls32.pdf. Verified in-repo against the
     74x32 entry: 7432 outputs land on pins 3,6,8,11 -- a different terminal map.
     Trusted for the "not pin-compatible with the 74x32" claim.
     OR is not functionally complete (not a universal gate), unlike NAND/NOR:
     Wikipedia contributors, "OR gate." [Online]. Available:
     https://en.wikipedia.org/wiki/OR_gate.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  'CD4071': {
    name: 'CD4071',
    simpleName: 'Quad 2 Input OR',
    description: 'Quad 2 input OR gate CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4071b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'OR', 'quad'],
    guideOverview: 'The CD4071 packs four independent 2 input OR gates into one 14-pin chip. Each output is HIGH when at least one of its two inputs is HIGH, and LOW only when both inputs are LOW the plain "if either condition is true, act on it" gate. It does the same logic as the 74x32 TTL OR chip, but it is a 4000 series CMOS part, and that changes three things. It runs on a wide 3 V to 18 V supply instead of a fixed 5 V, it draws almost no current sitting still (about a microamp), and it switches noticeably slower than TTL (roughly 60 ns at 10 V, versus about 14 ns for a 74LS32). It is also not pin compatible with the 74x32: the CD4071 puts its four outputs on pins 3, 4, 10 and 11 the layout shared by the whole 4000 series quad gate family (the 4001 NOR, 4011 NAND, 4081 AND, 4070 XOR) while the 74x32 spreads its outputs across pins 3, 6, 8 and 11. The one habit that saves beginners the most grief: a CMOS input must never be left floating, so tie every unused input to VDD or ground.',
    guidePinDescriptions: {
      A1:  'Input A of gate 1.',
      B1:  'Input B of gate 1.',
      Q1:  'Output of gate 1. HIGH when A1 or B1 (or both) is HIGH.',
      Q2:  'Output of gate 2. HIGH when A2 or B2 (or both) is HIGH.',
      A2:  'Input A of gate 2.',
      B2:  'Input B of gate 2.',
      GND: 'Ground, VSS (0 V). This is the negative supply rail and the 0 reference for every input and output.',
      A3:  'Input A of gate 3.',
      B3:  'Input B of gate 3.',
      Q3:  'Output of gate 3. HIGH when A3 or B3 (or both) is HIGH.',
      Q4:  'Output of gate 4. HIGH when A4 or B4 (or both) is HIGH.',
      A4:  'Input A of gate 4.',
      B4:  'Input B of gate 4.',
      VDD: 'Positive supply, 3 V to 18 V (20 V absolute maximum). All four gates share it.',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'Q1',  type: 'output' },
      { pin:  4, name: 'Q2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'B2',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'input'  },
      { pin:  9, name: 'B3',  type: 'input'  },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'A4',  type: 'input'  },
      { pin: 13, name: 'B4',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'OR', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'OR', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'OR', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'OR', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'OR Gate Logic',
        paragraphs: [
          'An OR gate output is HIGH if either input is HIGH, or if both are. It is LOW only when both inputs are LOW at the same time. With two inputs that is one LOW row (both inputs LOW) and three HIGH rows, as the table below shows.',
          'A handy picture: OR is two switches wired in parallel between the supply and the output. Close either switch and the output goes HIGH. Because of that, holding one input HIGH forces the output HIGH no matter what the other input does hold an input LOW instead and the output simply follows the other input. The four gates are fully independent and share only the two power pins, so you can use one, two, or all four in unrelated parts of a circuit.',
        ],
        formulas: [
          'Q = A OR B',
          'A=0,B=0 → Q=0 | A=0,B=1 → Q=1 | A=1,B=0 → Q=1 | A=1,B=1 → Q=1',
        ],
      },
      {
        title: 'CMOS, not TTL what changes',
        paragraphs: [
          'The CD4071 is a 4000 series CMOS chip, which behaves differently from a 74LS32 or other TTL OR gate in ways worth knowing before you build.',
          'Supply: it runs on anything from 3 V to 18 V (20 V is the absolute maximum), so its HIGH and LOW levels scale with whatever supply you pick, unlike TTL which is pinned near 5 V. Power: with the inputs held at solid HIGH or LOW levels it draws only about a microamp, so its power use is set almost entirely by how fast you switch it, not by sitting idle. Speed: that low power costs speed a signal takes roughly 125 ns to cross the gate at 5 V, about 60 ns at 10 V, and about 45 ns at 15 V, so a higher supply makes it faster. A 74LS32 does the same trip in about 14 ns. Drive: the outputs push only a milliamp or so, far less than TTL, so do not expect one to drive a heavy load or an LED at full brightness on its own.',
        ],
      },
      {
        title: 'The pinout is not the 74x32’s',
        paragraphs: [
          'The CD4071 and the 74x32 are both quad 2 input OR gates, but they are not pin-for-pin swaps. The CD4071 groups two gates on each side of the chip and lands its four outputs on pins 3, 4, 10 and 11. The 74x32 (and its CMOS cousin the 74HC32) uses the older 7432 arrangement, with outputs on pins 3, 6, 8 and 11.',
          'The upside: every 4000 series quad 2 input gate uses this same pinout the 4001 NOR, 4011 NAND, 4081 AND, and 4070 XOR all sit their outputs on 3, 4, 10 and 11. So once you know where the pins are on one of them, you know it for the whole family, and you can drop a different logic function into the same board wiring. Just do not drop a CD4071 into a socket wired for a 74LS32; trace the gate you actually want first.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Combining alarm, interrupt, or trigger sources: drive the output HIGH if any one source goes HIGH.',
          'Merging reset conditions a power-on reset, a manual button, and a watchdog can all feed one OR gate so any of them clears the circuit.',
          'Gating a signal: hold one input LOW and the output follows the other input; drive that held input HIGH and the output is forced HIGH regardless.',
          'Making a NOR: follow a gate with a CMOS inverter (the CD4069) to invert its output, since NOR is just OR with the result flipped.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Never leave a CMOS input floating. Unlike a TTL input (which drifts toward HIGH), an unconnected 4000 series input can settle near the middle of the supply, which turns both output transistors partly on the chip then draws extra current, warms up, and the output can chatter or oscillate. Tie every unused input to VDD or ground; for a gate you are not using at all, tie both its inputs to ground.',
          'The outputs are push-pull (complementary CMOS), not open-collector. Do not wire two outputs together it makes one gate fight the other.',
          'It is still static-sensitive. The inputs have on-chip protection diodes, but 4000 series CMOS is easy to damage with static handle it with the usual anti-static care.',
          'Do not confuse OR with XOR (the CD4070). OR is HIGH when either or both inputs are HIGH; XOR is HIGH only when the two inputs differ, so both-HIGH gives LOW.',
        ],
        note: 'The simulator treats each gate as instant and its inputs as clean digital levels. Two real-world effects are simplified away: the propagation delay above (a change actually takes tens of nanoseconds, and slower at lower supply voltages), and the floating-input misbehavior a real CMOS input shows drive every input to a defined level on real hardware.',
      },
    ],
  },

  // ── CD4077: Quad 2 input XNOR (14-pin) ─────────────────────────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4070B, CD4077B — CMOS Quad Exclusive-OR and
     Exclusive-NOR Gate," SCHS055E (Jan. 1998, rev. Sept. 2003). [Online].
     Available: https://www.ti.com/lit/ds/symlink/cd4077b.pdf. Verified as
     rendered 300-dpi PDF page images (issues.md C4): CD4077B Pinouts (TOP
     VIEW, p. 2) — A=1, B=2, J(out)=3, K(out)=4, C=5, D=6, VSS=7, E=8, F=9,
     L(out)=10, M(out)=11, G=12, H=13, VDD=14, so the four outputs sit on
     pins 3,4,10,11; CD4077B Truth Table (p. 3): A=0/B=0→1, A=1/B=0→0,
     A=0/B=1→0, A=1/B=1→1 = XNOR (output HIGH only when the two inputs are
     equal); Functional Diagram (p. 2) confirms four independent 2-input
     gates. pinout[] and gates[] checked against this diagram, NOT cloned
     from a sibling (issues.md C2); found CORRECT — engine (pinout[], gates[],
     specificChipsSim.js) left untouched.
     Also read (p. 1-6, PDF images): recommended supply range 3-18 V typ,
     20 V absolute max ("High-Voltage 20 V Rating"); quiescent current
     ~0.01 uA typ at 5 V; propagation delay tPHL/tPLH typ 140 ns @5 V /
     65 ns @10 V / 50 ns @15 V (CL=50 pF); input capacitance 5 pF typ; output
     stage is complementary CMOS push-pull (Fig. 2 schematic, p. 3); listed
     applications — logical comparators, adders/subtractors, parity generators
     and checkers (p. 1). Trusted for every spec above.
     Open-collector 74-series contrast (the 74x266 quad XNOR needs external
     pull-ups and uses a different pinout): verified in-repo against the
     74x266 entry (chips1.js).
     XNOR as the complement of XOR / equality-gate behavior: Wikipedia
     contributors, "XNOR gate." [Online]. Available:
     https://en.wikipedia.org/wiki/XNOR_gate. Used only for the plain-logic
     description, not for any pin or spec claim.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  'CD4077': {
    name: 'CD4077',
    simpleName: 'Quad 2 Input XNOR',
    description: 'Quad 2-input XNOR (exclusive-NOR) gate, CMOS 4000. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4077b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'XNOR', 'quad', 'equality'],
    guideOverview: 'The CD4077 packs four independent 2 input XNOR (exclusive-NOR) gates into one 14-pin chip. Each output is HIGH when its two inputs are equal both HIGH or both LOW and LOW when they differ, so it is the plain "are these two the same?" gate. It is the exact complement of the CD4070 XOR; the two parts even share one datasheet and the same pinout. Being a 4000 series CMOS chip sets it apart from a TTL part in three ways: it runs on a wide 3 V to 18 V supply instead of a fixed 5 V, it draws almost nothing sitting still (about a hundredth of a microamp), and it switches slowly (roughly 65 ns at 10 V). Its four outputs sit on pins 3, 4, 10 and 11 the layout shared by the whole 4000 series quad gate family (the 4001 NOR, 4011 NAND, 4070 XOR, 4071 OR, 4081 AND) so it is not pin compatible with the 74 series quad XNOR, the open-collector 74x266. Two habits keep beginners out of trouble: never leave a CMOS input floating (tie every unused one to VDD or ground), and remember the outputs are ordinary push-pull, so you cannot wire two of them together.',
    guidePinDescriptions: {
      A1:  'Input A of gate 1.',
      B1:  'Input B of gate 1.',
      Q1:  'Output of gate 1. HIGH when A1 equals B1; LOW when they differ.',
      Q2:  'Output of gate 2. HIGH when A2 equals B2; LOW when they differ.',
      A2:  'Input A of gate 2.',
      B2:  'Input B of gate 2.',
      GND: 'Ground, VSS (0 V). The negative supply rail and the 0 reference for every input and output.',
      A3:  'Input A of gate 3.',
      B3:  'Input B of gate 3.',
      Q3:  'Output of gate 3. HIGH when A3 equals B3; LOW when they differ.',
      Q4:  'Output of gate 4. HIGH when A4 equals B4; LOW when they differ.',
      A4:  'Input A of gate 4.',
      B4:  'Input B of gate 4.',
      VDD: 'Positive supply, 3 V to 18 V (20 V absolute maximum). All four gates share it.',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'Q1',  type: 'output' },
      { pin:  4, name: 'Q2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'B2',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'input'  },
      { pin:  9, name: 'B3',  type: 'input'  },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'A4',  type: 'input'  },
      { pin: 13, name: 'B4',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'XNOR', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'XNOR', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'XNOR', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'XNOR', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'XNOR Gate Logic',
        paragraphs: [
          'An XNOR gate (exclusive-NOR) output is HIGH when its two inputs are equal both HIGH or both LOW and LOW when they differ. That is the exact opposite of XOR, which is why it is also written NOT(A XOR B). The simplest way to hold it in your head: XNOR is an equality detector, and a HIGH output means "these two inputs match".',
          'The four gates are completely independent. They share only the two power pins (VDD and GND), so you can use one, two, or all four in unrelated parts of a circuit.',
        ],
        formulas: [
          'Q = NOT(A XOR B)',
          'A=0,B=0 → Q=1 | A=0,B=1 → Q=0 | A=1,B=0 → Q=0 | A=1,B=1 → Q=1',
        ],
      },
      {
        title: 'CMOS, not TTL what changes',
        paragraphs: [
          'The CD4077 is a 4000 series CMOS chip, so it behaves differently from a 74 series TTL XNOR in ways worth knowing before you build.',
          'Supply: it runs on anything from 3 V to 18 V (20 V is the absolute maximum), and its HIGH and LOW levels scale with whatever supply you pick, unlike TTL which is pinned near 5 V. Power: with its inputs held at solid HIGH or LOW levels it draws only about a hundredth of a microamp, so its power use is set almost entirely by how fast you switch it, not by sitting idle. Speed: that low power costs speed a signal takes roughly 140 ns to cross the gate at 5 V, about 65 ns at 10 V, and about 50 ns at 15 V, so a higher supply makes it faster. Drive: the outputs push only about a milliamp, far less than TTL, so do not expect one to drive a heavy load or a bright LED on its own.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Equality check / comparator: feed one bit from each of two numbers into a gate a HIGH output means those two bits match. Line up all four gates across a 4-bit bus and AND their outputs together (for example with a CD4081) to get a single "the two numbers are identical" signal. This is the job XNOR is made for.',
          'Controlled inverter: use one input as data and the other as a control line. Hold the control LOW and the gate inverts the data; hold it HIGH and the data passes straight through the mirror image of how an XOR gate behaves.',
          'Edge detector: tie the signal straight to one input and a slightly delayed copy (through a small RC) to the other. The two inputs match at rest, so the output sits HIGH and dips briefly LOW on every edge, rising or falling. (For a brief HIGH pulse instead, use the CD4070 XOR.)',
          'Parity and error checking: chaining exclusive gates across a data word compares it against an expected pattern the datasheet lists parity generators and checkers among this family\'s main uses.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Never leave a CMOS input floating. Unlike a TTL input (which drifts toward HIGH), an unconnected 4000 series input can settle near the middle of the supply, which turns both output transistors partly on the gate then draws extra current, warms up, and the output can chatter or oscillate. Tie every unused input to VDD or ground; for a gate you are not using at all, tie both its inputs to the same level.',
          'The outputs are push-pull (complementary CMOS), not open-collector. Do not wire two outputs together it makes one gate fight the other. The 74 series quad XNOR (the 74x266) is the open-collector part you tie together with a pull-up resistor; the CD4077 is not, and it does not share the 74x266 pinout either.',
          'Do not confuse XNOR with XOR (the CD4070). The two chips share this pinout and even this datasheet, but XNOR is HIGH when the inputs match while XOR is HIGH when they differ exactly opposite outputs.',
          'It is still static-sensitive. The inputs have on-chip protection diodes, but 4000 series CMOS is easy to damage with static handle it with the usual anti-static care.',
        ],
        note: 'The simulator treats each gate as instant and its inputs as clean digital levels. Two real-world effects are simplified away: the propagation delay above (a change actually takes tens to a couple hundred nanoseconds, and slower at lower supply voltage), and the floating-input misbehavior a real CMOS input must be driven to a defined level on real hardware.',
      },
    ],
  },

  // ── CD4081: Quad 2 input AND (14-pin) ──────────────────────────────────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD4073B, CD4081B, CD4082B Types — CMOS AND Gates", SCHS057C (Sept. 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4081b.pdf. Verified:
     terminal/functional diagram + logic diagram (Fig. 2 — input pin groups
     1(6,8,13) and 2(5,9,12), output pin group 3(4,10,11)), confirming gates on
     pins 1,2->3  5,6->4  8,9->10  12,13->11 with VDD=14 and VSS/GND=7; recommended
     operating conditions (3-18 V, 20 V absolute max) and static/dynamic electrical
     characteristics (output drive current ~0.5 mA at 5 V; tPHL/tPLH typ 125/60/45 ns
     at 5/10/15 V) — pages 1-2, read as rendered PDF page images, per issues.md C4.
     Pinout and gates[] checked against this diagram, not cloned from a sibling
     (issues.md C2); found CORRECT, engine left untouched.
     [1] AND as logical product / general gate behavior: Wikipedia contributors,
     "AND gate," https://en.wikipedia.org/wiki/AND_gate. */
  'CD4081': {
    name: 'CD4081',
    simpleName: 'Quad 2 Input AND',
    description: 'Four independent 2 input AND gates, CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4081b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'AND', 'quad'],
    /* [1] AND gate general behavior: Wikipedia contributors, "AND gate," https://en.wikipedia.org/wiki/AND_gate. */
    guideOverview: 'The CD4081 packages four independent 2 input AND gates. Each output is HIGH only when both of its inputs are HIGH; if either input is LOW, the output is LOW. It belongs to the CMOS 4000 series, so it runs on a wide supply of 3 V to 18 V and draws almost no current when idle, but it switches more slowly and drives far less current than a 74 series TTL part. It does the same logic as the 74x08 quad AND, but the pins are arranged differently: its outputs sit on pins 3, 4, 10, and 11, so it is not a drop in replacement for a 74x08. As with any CMOS gate, every input must be tied to a HIGH or LOW level, because a floating input can make the output flicker and waste supply current.',/* [1] */
    guidePinDescriptions: {
      A1:  'Input A of gate 1.',
      B1:  'Input B of gate 1.',
      Q1:  'Output of gate 1. HIGH only when both A1 and B1 are HIGH.',
      Q2:  'Output of gate 2. HIGH only when both A2 and B2 are HIGH.',
      A2:  'Input A of gate 2.',
      B2:  'Input B of gate 2.',
      GND: 'Ground, 0 V (pin 7). The datasheet calls this pin VSS.',
      A3:  'Input A of gate 3.',
      B3:  'Input B of gate 3.',
      Q3:  'Output of gate 3. HIGH only when both A3 and B3 are HIGH.',
      Q4:  'Output of gate 4. HIGH only when both A4 and B4 are HIGH.',
      A4:  'Input A of gate 4.',
      B4:  'Input B of gate 4.',
      VDD: 'Positive supply (pin 14). Recommended 3 V to 18 V; 20 V absolute maximum.',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'Q1',  type: 'output' },
      { pin:  4, name: 'Q2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'B2',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'input'  },
      { pin:  9, name: 'B3',  type: 'input'  },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'A4',  type: 'input'  },
      { pin: 13, name: 'B4',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'AND', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'AND', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'AND', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'AND', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'AND Gate Logic',
        paragraphs: [
          'An AND gate outputs HIGH only when every input is HIGH. If either input is LOW, the output is LOW. With two inputs there is exactly one HIGH row out of four, shown in the table below.',
          'AND is the logical product of its inputs, written A·B or just AB, the same way you write multiplication. A handy way to use it is as an enable: tie one input HIGH and the output follows the other input; tie that same input LOW and the output is forced LOW no matter what the other input does.',
        ],
        formulas: [
          'Q = A AND B',
          'A=0,B=0 → Q=0 | A=0,B=1 → Q=0 | A=1,B=0 → Q=0 | A=1,B=1 → Q=1',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Enable or block a signal path: feed the signal into one input and an enable line into the other. The output follows the signal only while enable is HIGH.',
          'Combine two active HIGH conditions that must both be true at once, such as two ready or select lines.',
          'Masking: AND a data bit with a mask bit to keep the bit where the mask is 1 and force it to 0 where the mask is 0.',
          'Glue logic on a board that already runs on a higher CMOS supply, where a 4000 series gate matches the rail better than a 5 V TTL part.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Never leave a CMOS input floating. Unlike TTL, a floating 4000 series input does not settle at a HIGH level; it drifts, which makes the output flicker and can draw large supply current. Tie every unused input, including both inputs of any gate you are not using, straight to VDD or GND.',
          'The drive is weak, especially at 5 V. A gate can source or sink only about half a milliamp at a 5 V supply, so it cannot light most LEDs or drive heavy loads directly. The available output current grows as you raise the supply toward 15 V.',
          'It is not pin-compatible with the 74x08. Both are quad 2 input AND gates, but the CD4081 puts its outputs on pins 3, 4, 10, and 11, while the 74x08 uses pins 3, 6, 8, and 11. Check the pinout before swapping one for the other.',
        ],
        note: 'Real gates are not instant, and this CMOS part is on the slow side. A change takes roughly 125 ns to travel from input to output at a 5 V supply, dropping to about 60 ns at 10 V and 45 ns at 15 V, so it runs faster at a higher supply. The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
  },

  // ── CD4093: Quad 2 input NAND with Schmitt trigger inputs (14-pin) ─────
  /* Primary source: Texas Instruments, CD4093 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4093b.pdf */
  'CD4093': {
    name: 'CD4093',
    simpleName: 'Quad 2 Input NAND (Schmitt Trigger)',
    description: 'Quad 2-input NAND gate, Schmitt-trigger inputs, CMOS 4000. (14-pin)',
    schmittInputs: true,
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4093b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NAND', 'Schmitt trigger', 'oscillator', 'quad'],
    guideOverview: 'The CD4093 contains four 2 input NAND gates with Schmitt trigger inputs. The Schmitt trigger adds hysteresis: the threshold for switching LOW to HIGH is higher than the threshold for switching HIGH to LOW. This prevents false toggling on slow or noisy signals. The CMOS equivalent of the 74x132. Supply voltage 3-15 V.',
    guidePinDescriptions: {
      A1:  'Schmitt trigger input A of gate 1.',
      B1:  'Schmitt trigger input B of gate 1.',
      Q1:  'Output of gate 1. LOW only when both A1 and B1 are HIGH.',
      Q2:  'Output of gate 2. LOW only when both A2 and B2 are HIGH.',
      A2:  'Schmitt trigger input A of gate 2.',
      B2:  'Schmitt trigger input B of gate 2.',
      GND: 'Ground (0 V). Connect to negative supply rail.',
      A3:  'Schmitt trigger input A of gate 3.',
      B3:  'Schmitt trigger input B of gate 3.',
      Q3:  'Output of gate 3. LOW only when both A3 and B3 are HIGH.',
      Q4:  'Output of gate 4. LOW only when both A4 and B4 are HIGH.',
      A4:  'Schmitt trigger input A of gate 4.',
      B4:  'Schmitt trigger input B of gate 4.',
      VDD: 'Positive supply. Accepts 3 V to 15 V (some versions to 20 V).',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'Q1',  type: 'output' },
      { pin:  4, name: 'Q2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'B2',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'input'  },
      { pin:  9, name: 'B3',  type: 'input'  },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'A4',  type: 'input'  },
      { pin: 13, name: 'B4',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['A1','B1'], output: 'Q1' },
      { type: 'NAND', inputs: ['A2','B2'], output: 'Q2' },
      { type: 'NAND', inputs: ['A3','B3'], output: 'Q3' },
      { type: 'NAND', inputs: ['A4','B4'], output: 'Q4' },
    ],
    guideSections: [
      {
        title: 'NAND with Schmitt Trigger',
        paragraphs: [
          'The Schmitt trigger inputs add hysteresis: the gate requires the input to rise above a higher threshold to switch from LOW to HIGH output, and the input must drop below a lower threshold to switch back. This gap prevents false toggling caused by noise or slow signal edges.',
          'Tie both inputs of a single gate together to turn it into a Schmitt trigger inverter. Then connect the output back to the input through an RC network (resistor to input, capacitor to GND) to form a simple relaxation oscillator classic for producing square wave tones or clock signals without a dedicated oscillator chip.',
        ],
        list: [
          'RC relaxation oscillator: four chained oscillators with different RC values create an old school synthesizer sound.',
          'Signal conditioning: clean up slow or noisy sensor signals before feeding into a counter or flip flop.',
          'Debouncing: use a gate with an RC on the input to suppress switch bounce glitches.',
        ],
        note: '74Sim models the Schmitt-trigger inputs with real hysteresis (VT+/VT- per the chip family). The classic RC relaxation oscillator (output → R → input, C from input to GND) oscillates as expected.',
      },
    ],
  },

  // ── CD4023: Triple 3-input NAND (14-pin) ───────────────────────────────
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4011B, CD4012B, CD4023B Types — CMOS NAND Gates," SCHS021D
  //   (rev. Sept. 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4023b.pdf. Verified: CD4023B terminal
  //   assignment + Fig. 9 logic/schematic diagram — gate 1 in {1,2,8} -> out 9;
  //   gate 2 in {3,4,5} -> out 6; gate 3 in {11,12,13} -> out 10; VSS(GND)=7,
  //   VDD=14 — plus recommended supply range (3–18 V, 20 V abs max), buffered
  //   inputs/outputs, tPHL/tPLH (60 ns typ @ VDD=10 V, CL=50 pF; 125 ns typ
  //   @ 5 V), and max input current (1 µA @ 18 V). Read as rendered ~300-dpi PDF
  //   page images, pp. 1–3 (issues.md C4, NOT via a text summarizer). pinout[]
  //   and the three 3-input NAND gates[] confirmed against this; engine left
  //   unchanged (docs-only pass).
  //   NOTE: same truth table as the TTL 74x10, but NOT pin-compatible — the
  //   74x10 puts gate 1 on {1,2,13}->12 and gate 3 on {8,9,10}->11, a different
  //   map (cross-checked against this repo's 74x10 entry, which cites TI
  //   SN74LS10, https://www.ti.com/lit/ds/symlink/sn74ls10.pdf). The map here is
  //   the real CD4023B one, deliberately NOT copied from the 74x10 (issues.md C2).
  //   Regression: js/debug/scenarios/cd4023-triple-3in-nand.mjs (structural pin
  //   map + full 8-row 3-input NAND truth table on all 3 gates).
  'CD4023': {
    name: 'CD4023',
    simpleName: 'Triple 3 input NAND',
    description: 'Three independent 3 input NAND gates, CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4023b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NAND', '3 input', 'triple'],
    guideOverview: 'The CD4023 packs three independent 3 input NAND gates into one 14-pin chip. Each gate drives its output LOW only when all three of its inputs are HIGH at the same time; any single LOW input forces the output back HIGH. It is the CMOS 4000-series cousin of the TTL 74x10: same logic, same 14-pin package, but a wider supply and near-zero input current. One thing to watch is that it is not a drop-in for a 7410 the two chips share the truth table, not the pinout. Being CMOS, it runs on anything from 3 V to 18 V (20 V absolute maximum) instead of a fixed 5 V, and its inputs draw almost no current, so one output can drive many inputs. The outputs are ordinary push-pull, so you cannot wire two of them together. Reach for it when you need an all-inputs-true condition reported as an active-LOW signal, or a wide NAND for combining three control or safety lines.',
    guidePinDescriptions: {
      A1:  'Input A of gate 1 (pin 1).',
      B1:  'Input B of gate 1 (pin 2).',
      A2:  'Input A of gate 2 (pin 3).',
      B2:  'Input B of gate 2 (pin 4).',
      C2:  'Input C of gate 2 (pin 5).',
      Q2:  'Output of gate 2 (pin 6). LOW only when A2, B2, and C2 are all HIGH.',
      GND: 'Ground, 0 V (pin 7). The negative supply rail, labelled VSS on the datasheet.',
      C1:  'Input C of gate 1 (pin 8).',
      Q1:  'Output of gate 1 (pin 9). LOW only when A1, B1, and C1 are all HIGH.',
      Q3:  'Output of gate 3 (pin 10). LOW only when A3, B3, and C3 are all HIGH.',
      A3:  'Input A of gate 3 (pin 11).',
      B3:  'Input B of gate 3 (pin 12).',
      C3:  'Input C of gate 3 (pin 13).',
      VDD: 'Positive supply (pin 14). Accepts 3 V to 18 V (20 V absolute maximum).',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'B2',  type: 'input'  },
      { pin:  5, name: 'C2',  type: 'input'  },
      { pin:  6, name: 'Q2',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'C1',  type: 'input'  },
      { pin:  9, name: 'Q1',  type: 'output' },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'A3',  type: 'input'  },
      { pin: 12, name: 'B3',  type: 'input'  },
      { pin: 13, name: 'C3',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['A1','B1','C1'], output: 'Q1' },
      { type: 'NAND', inputs: ['A2','B2','C2'], output: 'Q2' },
      { type: 'NAND', inputs: ['A3','B3','C3'], output: 'Q3' },
    ],
    guideSections: [
      {
        title: '3-Input NAND Logic',
        paragraphs: [
          'A NAND gate is an AND gate with its output inverted (NAND is short for NOT-AND). With three inputs, the output is LOW only when A, B, and C are all HIGH at once. Every other case any input LOW gives a HIGH output. That is a single LOW row out of the eight in the table below.',
          'The three gates are completely independent. They share only the power pins (VDD and GND), so you can use one, two, or all three in unrelated parts of a circuit.',
        ],
        formulas: [
          'Q = NOT(A AND B AND C)',
          'A B C -> Q',
          '0 0 0 -> 1   0 0 1 -> 1   0 1 0 -> 1   0 1 1 -> 1',
          '1 0 0 -> 1   1 0 1 -> 1   1 1 0 -> 1   1 1 1 -> 0',
        ],
      },
      {
        title: 'CMOS, Not TTL',
        paragraphs: [
          'The CD4023 is a 4000-series CMOS part, not a bipolar TTL chip like the 74x10, and that changes how you use it. It works across a wide supply, from 3 V to 18 V (20 V absolute maximum), so the same chip can run 5 V, 9 V, or 12 V logic. Pick one supply for the whole circuit: the HIGH and LOW thresholds scale with it, and the switching point sits near half the supply.',
          'CMOS inputs are the gates of tiny transistors, so they draw almost no current about a microamp of leakage at worst. One output can therefore drive a large number of inputs. The trade-off is speed: the gate has to charge and discharge that input capacitance, so it is slower than TTL and slower still at low supply. Figure roughly 60 ns from input to output at a 10 V supply, and about 125 ns at 5 V, before any load is added.',
        ],
        note: 'All inputs and outputs are buffered (the "B" in CD4023B), which gives clean, symmetric output drive and sharp thresholds regardless of which gate input changes.',
      },
      {
        title: 'Common Uses',
        list: [
          'All-conditions check: use the three inputs as conditions that must all be true; the output drops LOW to signal "all met." The everyday job for interlock and enable logic.',
          'Active-LOW AND: when you need an AND of three signals reported as an active-LOW line (LOW means true), one gate does it directly no separate inverter.',
          'Pattern / address detect: feed three address or data bits in (invert the ones that should read 0 first) so the output goes LOW for exactly one 3-bit code.',
          'Inverter or spare gate: tie a gate\'s unused inputs HIGH and it becomes a plain inverter. Like any NAND, this chip can also stand in for an AND, OR, or NOR you are short of, since NAND is a universal gate.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Never leave a CMOS input floating. Unlike TTL, a floating CMOS input does not settle HIGH it drifts, can make the output chatter, and can pull large current through the chip. Tie every unused input to a defined level: for a spare input on a gate you ARE using, tie it HIGH (to VDD) so it does not affect the result; for a gate you are not using at all, tie all its inputs to VDD or GND.',
          'Not a pin-compatible 7410. The CD4023 has the same truth table as the TTL 74x10 but a different pinout its gate outputs and third inputs sit on different pins. You can reuse the logic, not the wiring.',
          'Push-pull outputs do not tie them together. Each output actively drives both HIGH and LOW, so wiring two outputs to one node makes the drivers fight. Combine signals through another gate instead.',
        ],
        note: 'Real gates are not instant. A CD4023B takes roughly 60 ns from input to output at a 10 V supply (about 125 ns at 5 V, faster at 15 V), and slows further as load capacitance rises. The simulator treats this delay as zero a simplification that does not reproduce the brief timing glitches (hazards) real propagation delay can cause.',
      },
    ],
  },

  // ── CD4025: Triple 3-input NOR (14-pin) ────────────────────────────────
  // Source: Texas Instruments, "CD4001B, CD4002B, CD4025B Types — CMOS NOR
  //   Gates," SCHS015C (data sheet acquired from Harris Semiconductor; rev.
  //   Aug. 2003). [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4025b.pdf.
  //   Verified: CD4025B FUNCTIONAL DIAGRAM (page 1, drawing 92CS-24760) read as
  //   300-dpi PDF page images (issues.md C4), NOT via a text summarizer. It gives
  //   the DIP-14 map — gate J: in {1(A),2(B),8(C)} -> out 9, J = NOR(A,B,C);
  //   gate K: in {3(D),4(E),5(F)} -> out 6, K = NOR(D,E,F); gate L: in
  //   {13(G),12(H),11(I)} -> out 10, L = NOR(G,H,I); VSS(GND)=7, VDD=14. Supply
  //   and timing from page 2: recommended VDD 3–18 V, 20 V absolute max
  //   (−0.5 to +20 V); tPHL/tPLH 125 ns typ @5 V, 60 ns @10 V, 45 ns @15 V
  //   (CL=50 pF, all buffered). PINOUT VERIFIED CORRECT — the batch entry already
  //   matched the datasheet, so pinout[]/gates[] were left untouched; this was a
  //   docs-only pass (no issues.md divergence line needed). The A3/B3/C3 labels on
  //   pins 13/12/11 are arbitrary within a symmetric gate (NOR is commutative);
  //   what matters — inputs {13,12,11} feeding output 10 — is correct.
  //   TTL counterpart (same triple-3-input-NOR function, NOT pin-compatible): the
  //   74x27 puts gate 1's output on pin 12 and 1C on pin 13, and gate 3's output
  //   on pin 8 — a different map — cross-checked against this repo's 74x27 entry
  //   (cites TI SN74LS27, sn74ls27.pdf). Propagation delay modeled as zero (LIVE
  //   mode): issues.md A1. Guard: js/debug/scenarios/cd4025-triple-3in-nor.mjs.
  'CD4025': {
    name: 'CD4025',
    simpleName: 'Triple 3 input NOR',
    description: 'Three independent 3 input NOR gates, CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4025b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NOR', '3 input', 'triple'],
    guideOverview: 'The CD4025 packs three independent 3 input NOR gates into one 14-pin chip. Each gate drives its output HIGH only when all three of its inputs are LOW at the same time; a single HIGH input anywhere forces that gate LOW. That makes each gate an all-inputs-LOW detector. It is the CMOS 4000-series cousin of the TTL 74x27: same logic, same 14-pin package, but a wider supply and near-zero input current. Being CMOS, it runs on anything from 3 V to 18 V (20 V absolute maximum) instead of a fixed 5 V, and its inputs draw almost no current, so one output can drive many inputs. The outputs are ordinary push-pull, so you cannot wire two of them together. Two things to watch: it is not a drop-in for a 74x27 (same truth table, different pinout), and its layout is interleaved, so a gate output does not sit next to its own inputs — gate 1 reads pins 1, 2, and 8 but its output is pin 9. Reach for it when you need an all-inputs-LOW condition, an active-LOW OR of three signals, or — because NOR is a universal gate — general glue logic when you are short a gate.',
    guidePinDescriptions: {
      A1:  'Input A of gate 1 (pin 1).',
      B1:  'Input B of gate 1 (pin 2).',
      A2:  'Input A of gate 2 (pin 3).',
      B2:  'Input B of gate 2 (pin 4).',
      C2:  'Input C of gate 2 (pin 5).',
      Q2:  'Output of gate 2 (pin 6). HIGH only when A2, B2, and C2 are all LOW.',
      GND: 'Ground, 0 V (pin 7). The negative supply rail, labelled VSS on the datasheet.',
      C1:  'Input C of gate 1 (pin 8). Note the jump: gate 1\'s third input is across the chip from A1 and B1.',
      Q1:  'Output of gate 1 (pin 9). HIGH only when A1, B1, and C1 are all LOW.',
      Q3:  'Output of gate 3 (pin 10). HIGH only when A3, B3, and C3 are all LOW.',
      C3:  'Input C of gate 3 (pin 11).',
      B3:  'Input B of gate 3 (pin 12).',
      A3:  'Input A of gate 3 (pin 13).',
      VDD: 'Positive supply (pin 14). Accepts 3 V to 18 V (20 V absolute maximum).',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'B2',  type: 'input'  },
      { pin:  5, name: 'C2',  type: 'input'  },
      { pin:  6, name: 'Q2',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'C1',  type: 'input'  },
      { pin:  9, name: 'Q1',  type: 'output' },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'C3',  type: 'input'  },
      { pin: 12, name: 'B3',  type: 'input'  },
      { pin: 13, name: 'A3',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'NOR', inputs: ['A1','B1','C1'], output: 'Q1' },
      { type: 'NOR', inputs: ['A2','B2','C2'], output: 'Q2' },
      { type: 'NOR', inputs: ['A3','B3','C3'], output: 'Q3' },
    ],
    guideSections: [
      {
        title: '3-Input NOR Logic',
        paragraphs: [
          'A NOR gate is an OR gate with its output inverted (NOR is short for NOT-OR). With three inputs, the OR part is HIGH whenever any input is HIGH, so the inverted output is LOW the moment at least one input goes HIGH. The output is HIGH in only one of the eight input combinations: all three inputs LOW. That single row is why each gate works as an all-inputs-LOW detector.',
          'Read the other way (this is De Morgan\'s law), the same gate says the output is HIGH only when input A AND input B AND input C are all LOW. Either description fits the one HIGH row in the table below.',
          'The three gates are completely independent. They share only the power pins (VDD and GND), so you can use one, two, or all three in unrelated parts of a circuit.',
        ],
        formulas: [
          'Q = NOT(A OR B OR C)',
          'Q = (NOT A) AND (NOT B) AND (NOT C)',
          'A B C -> Q',
          '0 0 0 -> 1   0 0 1 -> 0   0 1 0 -> 0   0 1 1 -> 0',
          '1 0 0 -> 0   1 0 1 -> 0   1 1 0 -> 0   1 1 1 -> 0',
        ],
      },
      {
        title: 'CMOS, Not TTL',
        paragraphs: [
          'The CD4025 is a 4000-series CMOS part, not a bipolar TTL chip like the 74x27, and that changes how you use it. It works across a wide supply, from 3 V to 18 V (20 V absolute maximum), so the same chip can run 5 V, 9 V, or 12 V logic. Pick one supply for the whole circuit: the HIGH and LOW thresholds scale with it, and the switching point sits near half the supply.',
          'CMOS inputs are the gates of tiny transistors, so they draw almost no current — about a microamp of leakage at worst. One output can therefore drive a large number of inputs. The trade-off is speed: the gate has to charge and discharge that input capacitance, so it is slower than TTL and slower still at low supply. Figure roughly 60 ns from input to output at a 10 V supply, about 125 ns at 5 V, and around 45 ns at 15 V, before any load is added.',
        ],
        note: 'All inputs and outputs are buffered (the "B" in CD4025B), which gives clean, symmetric output drive and sharp thresholds regardless of which gate input changes.',
      },
      {
        title: 'Common Uses',
        list: [
          'All-inputs-off detector: tie three "active-HIGH" signals to one gate and its output goes HIGH only when all three are inactive (LOW) at once — a simple "everything is quiet" flag.',
          'Active-LOW OR: a NOR gate already computes NOT(A OR B OR C), so if you want an OR of three signals reported as an active-LOW line (LOW means "at least one is true"), one gate does it with no separate inverter.',
          'SR latch / simple memory: cross-couple two NOR gates (each gate\'s output feeds one input of the other) to build a set-reset latch, the simplest 1-bit memory. Tie the spare third inputs LOW so they do not interfere.',
          'Inverter or spare gate: tie a gate\'s unused inputs LOW and it becomes a plain inverter on the remaining input. Because NOR is a universal gate, this chip can also stand in for a NOT, AND, OR, or NAND you are short of.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Tie unused NOR inputs LOW, not HIGH. This is the opposite of a NAND gate. A HIGH on any NOR input forces the output LOW, so a spare input left HIGH would jam the output LOW permanently; tying it LOW (to GND) lets the other inputs decide. Never leave a CMOS input floating either — unlike TTL it does not settle HIGH, it drifts, can make the output chatter, and can pull large current through the chip. For a gate you are not using at all, tie all three inputs to a defined level (GND or VDD).',
          'Not a pin-compatible 74x27. The CD4025 has the same truth table as the TTL 74x27 but a different pinout — its gate outputs and third inputs sit on different pins. You can reuse the logic, not the wiring.',
          'Push-pull outputs — do not tie them together. Each output actively drives both HIGH and LOW, so wiring two outputs to one node makes the drivers fight. Combine signals through another gate instead.',
        ],
        note: 'Real gates are not instant. A CD4025B takes roughly 60 ns from input to output at a 10 V supply (about 125 ns at 5 V, faster at 15 V), and slows further as load capacitance rises. The simulator treats this delay as zero — a simplification that does not reproduce the brief timing glitches (hazards) real propagation delay can cause.',
      },
    ],
  },

  // ── CD4073: Triple 3-input AND (14-pin) ────────────────────────────────
  // Source: Texas Instruments, "CD4073B, CD4081B, CD4082B Types — CMOS AND
  //   Gates," SCHS057C (data sheet acquired from Harris Semiconductor; rev.
  //   Sep. 2003). [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4073b.pdf.
  //   Verified: CD4073B functional (terminal) diagram (page 1) and Fig. 13 logic
  //   diagram (page 3), recommended supply-voltage range (3–18 V, 20 V abs max),
  //   and tPHL/tPLH propagation delay — all read as 400-dpi PDF page images
  //   (issues.md C4), NOT via a text summarizer. The two figures agree on the
  //   interleaved DIP-14 map: gate 1 inputs 1,2,8 → output 9 (J); gate 2 inputs
  //   3,4,5 → output 6 (K); gate 3 inputs 11,12,13 → output 10 (L); VSS=7, VDD=14.
  //   Cross-checked against the CD4075B functional diagram (SCHS056D, same page
  //   images) — the AND (4073) and OR (4075) parts share this exact pinout.
  //   CORRECTED here (issues.md C114): the batch entry had gate 1 and gate 2's
  //   outputs AND their third inputs transposed — it drove inputs 1,2,5 into the
  //   pin-6 output and inputs 3,4,8 into the pin-9 output, so probing pin 9 read
  //   the wrong gate. pin 8 = gate 1's third input (C1), pin 5 = gate 2's third
  //   input (C2), Q1 = pin 9, Q2 = pin 6. Guard:
  //   js/debug/scenarios/cd4073-triple-3in-and.mjs.
  //   TTL counterpart (same function, NOT pin-compatible): the 74x11 is also a
  //   triple 3-input AND but arranges its pins differently (gate-1 output on
  //   pin 12, not pin 9) — verified against its own SN74LS11 datasheet in the
  //   74x11 entry. Propagation delay modeled as zero (LIVE mode): issues.md A1.
  'CD4073': {
    name: 'CD4073',
    simpleName: 'Triple 3-Input AND',
    description: 'Triple 3-input AND gate, CMOS 4000B, buffered outputs. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4073b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'AND', '3 input', 'triple'],
    guideOverview: 'The CD4073 holds three independent 3 input AND gates in one 14-pin CMOS chip. Each gate drives its output HIGH only when all three of its inputs are HIGH at the same time; any single LOW input forces the output LOW. Reach for it when you need a signal that means "all three of these are true together" — three enables that must all agree, a 3 bit all-ones detector, or a clock gated by two conditions. Being CMOS, it runs on any supply from 3 V to 18 V (not the fixed 5 V of the TTL 74x11) and draws almost no current when idle, but its inputs must never be left floating. Two things to watch: the pinout is interleaved, so a gate\'s output is not next to its inputs (gate 1 reads pins 1, 2, and 8 but its output is pin 9), and although it does the same job as the 74x11, the two are not pin-compatible.',
    guidePinDescriptions: {
      A1:  'Gate 1 input (pin 1).',
      B1:  'Gate 1 input (pin 2).',
      A2:  'Gate 2 input (pin 3).',
      B2:  'Gate 2 input (pin 4).',
      C2:  'Gate 2 input (pin 5).',
      Q2:  'Gate 2 output (pin 6). HIGH only when A2, B2, and C2 are all HIGH.',
      GND: 'Ground / negative supply, 0 V. The datasheet labels this pin VSS.',
      C1:  'Gate 1 input (pin 8). Gate 1\'s output is on pin 9, not next to this pin.',
      Q1:  'Gate 1 output (pin 9). HIGH only when A1, B1, and C1 are all HIGH.',
      Q3:  'Gate 3 output (pin 10). HIGH only when A3, B3, and C3 are all HIGH.',
      A3:  'Gate 3 input (pin 11).',
      B3:  'Gate 3 input (pin 12).',
      C3:  'Gate 3 input (pin 13).',
      VDD: 'Positive supply, 3 V to 18 V (20 V absolute maximum). The datasheet labels this pin VDD.',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'B2',  type: 'input'  },
      { pin:  5, name: 'C2',  type: 'input'  },
      { pin:  6, name: 'Q2',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'C1',  type: 'input'  },
      { pin:  9, name: 'Q1',  type: 'output' },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'A3',  type: 'input'  },
      { pin: 12, name: 'B3',  type: 'input'  },
      { pin: 13, name: 'C3',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'AND', inputs: ['A1','B1','C1'], output: 'Q1' },
      { type: 'AND', inputs: ['A2','B2','C2'], output: 'Q2' },
      { type: 'AND', inputs: ['A3','B3','C3'], output: 'Q3' },
    ],
    guideSections: [
      {
        title: '3-Input AND Logic',
        paragraphs: [
          'Each gate has three inputs and one output. The output is HIGH only when all three inputs are HIGH at once. If even one input is LOW, the output is LOW, no matter what the other two do. That "one LOW wins" behavior is the mirror of an OR gate, where one HIGH input is enough to force the output HIGH.',
          'The three gates are completely independent. They share only the two power pins (VDD and GND), so you can use one, two, or all three in unrelated parts of a circuit.',
        ],
        formulas: [
          'Q = A AND B AND C',
          'Q is HIGH only for A=1, B=1, C=1 — one row out of the eight input combinations. Every other row is LOW.',
        ],
      },
      {
        title: 'Reading the Pinout',
        paragraphs: [
          'The three gates are interleaved across the package, so a gate\'s pins are not grouped together. Gate 1 is the one to watch: two of its inputs are on pins 1 and 2, but its third input is on pin 8 and its output is on pin 9, on the far side of the chip. Trace each gate before you wire it.',
        ],
        list: [
          'Gate 1: inputs on pins 1, 2, 8 → output on pin 9.',
          'Gate 2: inputs on pins 3, 4, 5 → output on pin 6.',
          'Gate 3: inputs on pins 11, 12, 13 → output on pin 10.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'All-conditions gate: feed three enable or status lines into one gate so the output goes HIGH only when all three are active at once — for example key present AND power good AND run enabled.',
          '3-bit pattern detector: a gate\'s output is HIGH only for the single input code 1-1-1. Put inverters (a CD4069) on the bits you want to be 0 and one gate then flags any specific 3-bit pattern.',
          'Wider AND: chain gates to AND more than three signals. Feed three inputs into one gate, then its output plus two more signals into a second gate, to AND five inputs.',
          'Gated clock or strobe: AND a clock with two enable levels so pulses only pass through while both enables are HIGH.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Do not leave inputs floating. A CMOS input is very high impedance, so an unconnected input drifts to a random level and can make the gate draw extra current. Tie every unused input to VDD or GND. For a gate you are not using at all, tie all three of its inputs to one rail so its output sits at a known state.',
          'The pinout is interleaved. Gate 1\'s third input (pin 8) and output (pin 9) are not next to its other two inputs (pins 1 and 2). Follow the map in "Reading the Pinout" rather than assuming inputs-then-output like the 74x08.',
          'It is not a drop-in for the 74x11. The TTL 74x11 is also a triple 3-input AND, but its pins are arranged differently (its gate 1 output is on pin 12, not pin 9), so you cannot swap one for the other without rewiring. What the CD4073 gives you instead is the wide 3–18 V CMOS supply and near-zero standby current.',
          'The outputs are push-pull, not open-collector. Do not wire two outputs together — that pits one output driver against another. To combine outputs, feed them into a further gate.',
        ],
        note: 'Real CMOS gates are not instant, and the 4000B family is on the slow side. A change takes roughly 125 ns to reach the output on a 5 V supply, dropping to about 60 ns at 10 V and 45 ns at 15 V (a higher supply switches the internal transistors faster). The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches that real propagation delay can cause.',
      },
    ],
  },

  // ── CD4075: Triple 3-input OR (14-pin) ─────────────────────────────────
  // Source: Texas Instruments, "CD4071B, CD4072B, CD4075B Types — CMOS OR Gates,"
  //   SCHS056D (Harris Semiconductor data sheet, rev. Aug. 2003). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/cd4075b.pdf. Verified:
  //   CD4075B functional (terminal) diagram, recommended supply-voltage range, and
  //   tPHL/tPLH propagation delay — page 1 (3-186) and page 2 (3-187), read as
  //   300-dpi PDF page images (issues.md C4), NOT via a text summarizer.
  //   The diagram gives the interleaved gate map: inputs 1,2,5 → output 9 (J);
  //   inputs 3,4,8 → output 6 (K); inputs 11,12,13 → output 10 (L); VSS=7, VDD=14.
  //   CORRECTED here — the batch entry had the pin-6 and pin-9 outputs swapped, so
  //   the gate on pins 1/2/5 wrongly drove pin 6 and the gate on 3/4/8 wrongly
  //   drove pin 9 (issues.md C109). Guard: js/debug/scenarios/cd4075-triple-3in-or.mjs.
  'CD4075': {
    name: 'CD4075',
    simpleName: 'Triple 3-Input OR',
    description: 'Three independent 3 input OR gates. CMOS 4000 series. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4075b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'OR', '3 input', 'triple'],
    guideOverview: 'The CD4075 packs three independent 3 input OR gates into one 14-pin chip. Each gate drives its output HIGH when any one of its three inputs is HIGH, and LOW only when all three inputs are LOW. Reach for it to combine several active HIGH signals "assert if any of these is true" without wiring up discrete gates. Watch the pinout: the three gates are interleaved, so a gate\'s output is not next to its own inputs (gate 1 reads pins 1, 2, 5 but its output is pin 9). It runs on a wide 3 V to 18 V supply and shares its datasheet with the CD4071 (quad 2 input OR) and CD4072 (dual 4 input OR).',
    guidePinDescriptions: {
      A1:  'Gate 1 input (pin 1).',
      B1:  'Gate 1 input (pin 2).',
      A2:  'Gate 2 input (pin 3).',
      B2:  'Gate 2 input (pin 4).',
      C1:  'Gate 1 input (pin 5). Gate 1\'s output is on pin 9, not next to this pin.',
      Q2:  'Gate 2 output (pin 6). HIGH when any of A2, B2, or C2 is HIGH.',
      GND: 'Ground / negative supply, 0 V. The datasheet labels this pin VSS.',
      C2:  'Gate 2 input (pin 8).',
      Q1:  'Gate 1 output (pin 9). HIGH when any of A1, B1, or C1 is HIGH.',
      Q3:  'Gate 3 output (pin 10). HIGH when any of A3, B3, or C3 is HIGH.',
      C3:  'Gate 3 input (pin 11).',
      B3:  'Gate 3 input (pin 12).',
      A3:  'Gate 3 input (pin 13).',
      VDD: 'Positive supply. Anywhere from 3 V to 18 V (20 V absolute maximum).',
    },
    pinout: [
      { pin:  1, name: 'A1',  type: 'input'  },
      { pin:  2, name: 'B1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'B2',  type: 'input'  },
      { pin:  5, name: 'C1',  type: 'input'  },
      { pin:  6, name: 'Q2',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'C2',  type: 'input'  },
      { pin:  9, name: 'Q1',  type: 'output' },
      { pin: 10, name: 'Q3',  type: 'output' },
      { pin: 11, name: 'C3',  type: 'input'  },
      { pin: 12, name: 'B3',  type: 'input'  },
      { pin: 13, name: 'A3',  type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'OR', inputs: ['A1','B1','C1'], output: 'Q1' },
      { type: 'OR', inputs: ['A2','B2','C2'], output: 'Q2' },
      { type: 'OR', inputs: ['A3','B3','C3'], output: 'Q3' },
    ],
    guideSections: [
      {
        title: '3-Input OR Logic',
        paragraphs: [
          'Each gate ORs its three inputs together. The output is HIGH if any single input is HIGH, and LOW only when all three inputs are LOW at the same time. One HIGH input is enough this is the mirror image of an AND gate, where one LOW input is enough to pull the output LOW.',
        ],
        formulas: [
          'Q = A OR B OR C',
          'A=0,B=0,C=0 → Q=0 | any input HIGH → Q=1',
        ],
      },
      {
        title: 'Reading the Pinout',
        paragraphs: [
          'The three gates are interleaved across the package, so you cannot assume a gate\'s pins sit together. The outputs land on pins 6, 9, and 10, and each gate\'s inputs are scattered. Trace each gate before wiring it is an easy pinout to get wrong.',
        ],
        list: [
          'Gate 1: inputs on pins 1, 2, 5 → output on pin 9.',
          'Gate 2: inputs on pins 3, 4, 8 → output on pin 6.',
          'Gate 3: inputs on pins 11, 12, 13 → output on pin 10.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Combine alarms or interrupts: one output goes HIGH if any of three sensors or buttons is triggered.',
          'Bus-activity flag: the output is HIGH when at least one of three data lines is asserted.',
          'Build a wider OR: feed one gate\'s output into an input of the next gate to make a 4- or 5-input OR from the two gates.',
          'Pair with a CD4073 (triple 3-input AND) to build sum-of-products logic ANDs feeding an OR.',
        ],
      },
      {
        title: 'Wiring Notes',
        paragraphs: [
          'Tie every unused input to a rail never leave one floating. A floating CMOS input drifts and can read as HIGH, which on an OR gate would jam the output HIGH. Tie the unused inputs of a gate you are using to GND (LOW) so they do not affect the result; if a whole gate is unused, tie all of its inputs to GND as well so it does not draw current or oscillate.',
          'Being CMOS, the part runs from 3 V to 18 V, and the input switching threshold moves with the supply (roughly half of VDD). This is a simplification: the simulator treats the gates as ideal and instantaneous, while a real CD4075B adds a propagation delay of about 60 ns at a 10 V supply (longer at lower voltages).',
        ],
      },
    ],
  },

  // ── CD4049: Hex inverting buffer (16-pin, VDD=1, GND=8) ────────────────
  /* Primary source: Texas Instruments, CD4049 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4049ub.pdf */
  'CD4049': {
    name: 'CD4049',
    simpleName: 'Hex Inverting Buffer',
    description: 'Hex inverting buffer/CMOS-TTL shifter, CMOS 4000 (VDD pin 1) (16-pin)',
    pins: 16,
    vcc: 1,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4049ub.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NOT', 'hex inverter', 'level shifter', 'buffer'],
    guideOverview: 'The CD4049 is a hex inverting buffer/converter with six independent NOT gates. Its inputs can tolerate voltages higher than its own VDD supply, making it ideal for shifting a higher voltage logic signal (e.g. 10 V or 15 V) down to a lower CMOS level. It can also sink significantly more current than ordinary logic gates (up to ~48 mA). VDD is at pin 1 an unusual, non standard location.',
    guidePinDescriptions: {
      VDD: 'Positive supply at pin 1. Non standard position verify wiring carefully. Accepts 3 V to 18 V.',
      Y1:  'Output of inverter 1. HIGH when A1 is LOW, LOW when A1 is HIGH.',
      A1:  'Input of inverter 1.',
      Y2:  'Output of inverter 2. HIGH when A2 is LOW.',
      A2:  'Input of inverter 2.',
      Y3:  'Output of inverter 3. HIGH when A3 is LOW.',
      A3:  'Input of inverter 3.',
      GND: 'Ground reference at pin 8.',
      Y4:  'Output of inverter 4. HIGH when A4 is LOW.',
      A4:  'Input of inverter 4.',
      Y5:  'Output of inverter 5. HIGH when A5 is LOW.',
      A5:  'Input of inverter 5.',
      NC:  'Not connected (pins 13 and 16). Leave these pins unconnected.',
      A6:  'Input of inverter 6.',
      Y6:  'Output of inverter 6. HIGH when A6 is LOW.',
    },
    pinout: [
      { pin:  1, name: 'VDD', type: 'power'  },
      { pin:  2, name: 'Y1',  type: 'output' },
      { pin:  3, name: 'A1',  type: 'input'  },
      { pin:  4, name: 'Y2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'Y3',  type: 'output' },
      { pin:  7, name: 'A3',  type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Y4',  type: 'output' },
      { pin: 10, name: 'A4',  type: 'input'  },
      { pin: 11, name: 'Y5',  type: 'output' },
      { pin: 12, name: 'A5',  type: 'input'  },
      { pin: 13, name: 'NC',  type: 'nc'     },
      { pin: 14, name: 'A6',  type: 'input'  },
      { pin: 15, name: 'Y6',  type: 'output' },
      { pin: 16, name: 'NC',  type: 'nc'     },
    ],
    gates: [
      { type: 'NOT', inputs: ['A1'], output: 'Y1' },
      { type: 'NOT', inputs: ['A2'], output: 'Y2' },
      { type: 'NOT', inputs: ['A3'], output: 'Y3' },
      { type: 'NOT', inputs: ['A4'], output: 'Y4' },
      { type: 'NOT', inputs: ['A5'], output: 'Y5' },
      { type: 'NOT', inputs: ['A6'], output: 'Y6' },
    ],
    guideSections: [
      {
        title: 'Hex Inverting Buffer / Level Shifter',
        paragraphs: [
          'Each gate inverts its input: a LOW input produces a HIGH output, and a HIGH input produces a LOW output.',
          'The CD4049 can accept input voltages up to 15 V even when running at a lower VDD (e.g. 5 V), allowing it to shift a high voltage signal down to the VDD level. This makes it a practical high to low level shifter.',
          'If inversion is undesirable, pass the signal through two inverters in series the double inversion restores the original polarity at the translated voltage.',
        ],
        list: [
          'High to low level shifter: convert 10 V or 15 V CMOS logic down to 5 V for microcontrollers like Arduino.',
          'High current output driver: can sink ~48 mA per output, useful for driving LEDs or TTL loads directly.',
          'Unused inputs should be tied to VDD or GND floating inputs waste power and cause erratic switching.',
        ],
        note: 'VDD is at pin 1, not the usual pin 14 or 16. This non standard placement is a frequent wiring mistake double check before applying power.',
      },
    ],
  },

  // ── CD4050: Hex non inverting buffer (16-pin, VDD=1, GND=8) ───────────
  /* Primary source: Texas Instruments, CD4050 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4050b.pdf */
  'CD4050': {
    name: 'CD4050',
    simpleName: 'Hex Non Inverting Buffer',
    description: 'Hex non-inverting buffer/CMOS-TTL shifter, CMOS 4000 (VDD pin 1) (16-pin)',
    pins: 16,
    vcc: 1,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4050b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'buffer', 'level shifter', 'non inverting'],
    guideOverview: 'The CD4050 is a hex non inverting buffer/converter with six independent buffers. Pin for pin identical to the CD4049 but without inversion output follows the input. Like the CD4049 it can accept input voltages higher than its VDD supply for high to low level shifting, and can sink significantly more current than ordinary CMOS gates (up to ~48 mA). VDD is at pin 1 an unusual, non standard location.',
    guidePinDescriptions: {
      VDD: 'Positive supply at pin 1. Non standard position verify wiring carefully. Accepts 3 V to 18 V.',
      Y1:  'Output of buffer 1. Follows A1 HIGH when A1 is HIGH.',
      A1:  'Input of buffer 1.',
      Y2:  'Output of buffer 2. Follows A2.',
      A2:  'Input of buffer 2.',
      Y3:  'Output of buffer 3. Follows A3.',
      A3:  'Input of buffer 3.',
      GND: 'Ground reference at pin 8.',
      Y4:  'Output of buffer 4. Follows A4.',
      A4:  'Input of buffer 4.',
      Y5:  'Output of buffer 5. Follows A5.',
      A5:  'Input of buffer 5.',
      NC:  'Not connected (pins 13 and 16). Leave these pins unconnected.',
      A6:  'Input of buffer 6.',
      Y6:  'Output of buffer 6. Follows A6.',
    },
    pinout: [
      { pin:  1, name: 'VDD', type: 'power'  },
      { pin:  2, name: 'Y1',  type: 'output' },
      { pin:  3, name: 'A1',  type: 'input'  },
      { pin:  4, name: 'Y2',  type: 'output' },
      { pin:  5, name: 'A2',  type: 'input'  },
      { pin:  6, name: 'Y3',  type: 'output' },
      { pin:  7, name: 'A3',  type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Y4',  type: 'output' },
      { pin: 10, name: 'A4',  type: 'input'  },
      { pin: 11, name: 'Y5',  type: 'output' },
      { pin: 12, name: 'A5',  type: 'input'  },
      { pin: 13, name: 'NC',  type: 'nc'     },
      { pin: 14, name: 'A6',  type: 'input'  },
      { pin: 15, name: 'Y6',  type: 'output' },
      { pin: 16, name: 'NC',  type: 'nc'     },
    ],
    gates: [
      { type: 'BUFFER', inputs: ['A1'], output: 'Y1' },
      { type: 'BUFFER', inputs: ['A2'], output: 'Y2' },
      { type: 'BUFFER', inputs: ['A3'], output: 'Y3' },
      { type: 'BUFFER', inputs: ['A4'], output: 'Y4' },
      { type: 'BUFFER', inputs: ['A5'], output: 'Y5' },
      { type: 'BUFFER', inputs: ['A6'], output: 'Y6' },
    ],
    guideSections: [
      {
        title: 'Hex Non Inverting Buffer / Level Shifter',
        paragraphs: [
          'Each gate passes its input to the output unchanged HIGH in gives HIGH out, LOW in gives LOW out. No inversion occurs.',
          'The CD4050 can accept input voltages up to 15 V even when its VDD is lower (e.g. 5 V), making it a direct high to low level translator without the polarity flip of the CD4049.',
          'It can drive two TTL/RTL loads or four 74x loads and can sink up to ~48 mA per output, making it suitable for direct LED driving or interfacing with TTL logic.',
        ],
        list: [
          'High to low level shifter: translate 10 V or 15 V CMOS signals down to 5 V for microcontrollers, without changing polarity.',
          'Fan out buffer: one weak CMOS output drives multiple loads through the six buffered outputs.',
          'Tie unused inputs to VDD or GND to prevent floating input oscillation and excess power draw.',
        ],
        note: 'VDD is at pin 1, not the usual pin 14 or 16. This non standard placement is a common wiring mistake double check before applying power.',
      },
    ],
  },

  // ── CD40106: Hex Schmitt trigger inverter (14-pin) ──────────────────────
  /* Source: Texas Instruments, "CD40106B CMOS Hex Schmitt-Trigger Inverters,"
     SCHS097F (Nov. 1998, rev. Mar. 2017). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd40106b.pdf. Verified: Pin Configuration
     and Functions table (§5, p.3), recommended supply 3-18 V (§6.3, p.4), and
     typical positive/negative trigger thresholds V_P/V_N at 25 degC (§6.5, pp.5-6)
     -- read as rendered PDF page images per issues.md C4, NOT via a text
     summarizer. Terminal diagram confirms 1=A, 2=Y_A, 3=B, 4=Y_B, 5=C, 6=Y_C,
     7=V_SS, 8=Y_D, 9=D, 10=Y_E, 11=E, 12=Y_F, 13=F, 14=V_DD and the six
     A..F -> Y_A..Y_F inversions (datasheet labels the outputs G..L = complements).
     Existing pinout[]/gates[] matched the datasheet exactly -- engine untouched.
     Schmitt-trigger hysteresis theory: Wikipedia contributors, "Schmitt trigger."
     Available: https://en.wikipedia.org/wiki/Schmitt_trigger */
  'CD40106': {
    name: 'CD40106',
    simpleName: 'Hex Schmitt Trigger Inverter',
    description: 'Hex Schmitt-trigger inverter, CMOS 4000 (3-18 V supply). (14-pin)',
    schmittInputs: true,
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40106b.pdf',
    tags: ['cmos', '4000 series', 'logic gate', 'NOT', 'inverter', 'Schmitt trigger', 'hex inverter', 'hysteresis', 'oscillator', '40106'],
    guideOverview: 'The CD40106 packs six independent NOT gates, each with a Schmitt trigger input. A Schmitt trigger has two switching thresholds instead of one: the input must climb past an upper level before the output flips LOW, then drop below a lower level before it flips back HIGH. That gap between the two levels (the hysteresis) lets the chip take a slow or noisy signal and turn it into one clean, sharp edge instead of a burst of chatter. It is the CMOS counterpart to the bipolar 74x14 and shares that chip\'s pinout, but its thresholds scale with the supply, so it runs anywhere from 3 to 18 V. The classic use is a one-gate RC square-wave oscillator.',
    guidePinDescriptions: {
      A:   'Schmitt trigger input of inverter 1 (pin 1).',
      YA:  'Output of inverter 1 the complement of A. HIGH when A is LOW.',
      B:   'Schmitt trigger input of inverter 2.',
      YB:  'Output of inverter 2 (complement of B).',
      C:   'Schmitt trigger input of inverter 3.',
      YC:  'Output of inverter 3 (complement of C).',
      GND: 'Ground reference, called VSS on this part (pin 7). Connect to 0 V.',
      YD:  'Output of inverter 4 (complement of D).',
      D:   'Schmitt trigger input of inverter 4.',
      YE:  'Output of inverter 5 (complement of E).',
      E:   'Schmitt trigger input of inverter 5.',
      YF:  'Output of inverter 6 (complement of F).',
      F:   'Schmitt trigger input of inverter 6.',
      VDD: 'Positive supply (pin 14). Accepts 3 V to 18 V; thresholds scale with it.',
    },
    pinout: [
      { pin:  1, name: 'A',   type: 'input',  description: 'Inverter 1 input' },
      { pin:  2, name: 'YA',  type: 'output', description: 'Inverter 1 output (inverted, Schmitt trigger)' },
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
      { pin: 14, name: 'VDD', type: 'power',  description: 'Positive supply (3 18 V)' },
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
        title: 'Hysteresis: two thresholds, not one',
        paragraphs: [
          'A plain inverter has a single switch point. Feed it a slow or noisy input that lingers near that point and the output flips back and forth many times. The CD40106 fixes this with two thresholds. The output only goes LOW after the input climbs above the upper (positive-going) threshold V_P, and only returns HIGH after the input falls below the lower (negative-going) threshold V_N. Between those two levels the output ignores the input and holds its last state.',
          'The thresholds move with the supply voltage. These are typical values at 25 °C; the datasheet lists guaranteed limits over the full temperature range.',
        ],
        formulas: [
          'V_DD = 5 V:  V_P ≈ 2.9 V, V_N ≈ 1.9 V  (≈ 1.0 V hysteresis band)',
          'V_DD = 10 V: V_P ≈ 5.9 V, V_N ≈ 3.9 V  (≈ 2.0 V)',
          'V_DD = 15 V: V_P ≈ 8.8 V, V_N ≈ 5.8 V  (≈ 3.0 V)',
        ],
        note: 'Because the output waits for a full threshold crossing, there is no limit on how slowly the input may rise or fall. A ramp that takes seconds still produces one clean edge, which is exactly what a plain gate cannot do.',
      },
      {
        title: 'RC relaxation oscillator',
        paragraphs: [
          'The signature circuit: tie one gate\'s output back to its own input through a resistor R, and add a capacitor C from that input to ground. C charges through R until the input reaches V_P, so the output snaps LOW; C then discharges back through R until the input drops to V_N, so the output snaps HIGH; and the cycle repeats. You get a square wave and have spent only one of the six gates.',
        ],
        formulas: [
          'f ≈ 1 / (1.2 × R × C)',
        ],
        note: 'The 1.2 factor comes from the ratio of the two thresholds, so the real frequency shifts if the supply (and therefore V_P and V_N) changes. Treat it as a starting point and trim R.',
      },
      {
        title: 'Design notes and gotchas',
        list: [
          'Never leave an input floating. An unconnected CMOS input drifts toward mid-supply, where the gate self-oscillates and draws excess current. Tie every unused input directly to V_DD or V_SS.',
          'Power is V_DD on pin 14 and V_SS (ground) on pin 7 the 4000-series names, not the VCC/GND labels of the TTL parts.',
          'Same pinout as the 74x14, but not an electrical drop-in: the 74x14 is a fixed-5 V bipolar part with lower thresholds, while the CD40106 thresholds track its supply from 3 to 18 V.',
          'The outputs are CMOS fine for driving other CMOS or a light load, but weaker than a dedicated TTL buffer, so plan ahead when driving long lines or many inputs.',
        ],
        note: '74Sim models the two-threshold hysteresis, so a slow or noisy input switches cleanly and the RC oscillator runs. Internal timing is idealized (no propagation delay modeled), so a simulated oscillator follows the ideal formula rather than a measured part this is a simplification.',
      },
    ],
  },

  // ── CD4013: Dual D flip flop with active-HIGH set/reset (14-pin) ─────────
  /* Source: Texas Instruments, "CD4013B CMOS Dual D-Type Flip-Flop," doc. SCHS023E
       (Nov. 1998, rev. Sep. 2016). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/cd4013b.pdf. Verified: Pin Configuration
       and Functions (14-pin D/J/N/NS/PW package, TOP VIEW, pins 1-14) + Table 1
       Function Table (CLOCK/SET/RESET/D -> Q/Q#) + Recommended Operating Conditions
       (setup / clock-pulse / set-reset-pulse widths, 3-18 V supply), pages 1, 3, 4,
       10, read as rendered 300-dpi PDF page images (per issues.md C4, not a text
       summarizer). pinout[] and the two D_FF_ACTHI gates match the datasheet exactly;
       engine left untouched. NOTE: Table 1's SET=RESET=HIGH row drives BOTH outputs
       HIGH (Q=1, Q#=1) on the real part; 74Sim's D_FF_ACTHI primitive simplifies this
       illegal input to RESET-wins (Q=0), the same simplification the shared D_FF
       primitive already uses for the 74x74's PRE#=CLR#=LOW clash.
     D flip flop theory (setup/hold, metastability, toggle divider): Wikipedia
       contributors, "Flip-flop (electronics)." [Online]. Available:
       https://en.wikipedia.org/wiki/Flip-flop_(electronics). */
  'CD4013': {
    name: 'CD4013',
    simpleName: 'Dual D Flip Flop (Active HIGH S/R)',
    description: 'Dual pos-edge D flip-flop, active-HIGH async S/R, CMOS 4000. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4013b.pdf',
    tags: ['cmos', '4000 series', 'flip flop', 'D flip flop', 'register', 'sequential'],
    guideOverview: 'The CD4013 packs two independent D flip flops into one 14 pin CMOS chip. Each one copies the level on its D input to its Q output at a single instant: the moment CLK rises from LOW to HIGH. It then holds that value until the next rising edge, so a D flip flop is really a 1 bit memory that only listens on a clock edge. <span style="text-decoration:overline">Q</span> carries the opposite level. Each flip flop also has a SET and a RESET that force the output HIGH or LOW right away, ignoring the clock. The catch that trips people up: on the CD4013 both are active HIGH, the opposite of the 74x74 (whose preset and clear are active LOW), so you idle them LOW, not HIGH. Being a 4000 series part, it runs on anything from 3 V to 18 V (power is VDD on pin 14, VSS on pin 7), trading TTL speed for a wide supply range. Reach for it to grab a signal on a clock edge, hold a bit, divide a clock by two, toggle on a button press, or build the basic cell of a counter or shift register. The two halves share only power and ground; their clocks are separate.',
    guidePinDescriptions: {
      Q1:   'Flip flop 1 true output. Holds the last value captured from D1.',
      Qn1:  '<span style="text-decoration:overline">Q1</span> flip flop 1 inverted output. Normally the complement of Q1 (both go HIGH only in the illegal SET1=RESET1 state).',
      CLK1: 'Flip flop 1 clock. D1 is captured on the rising (LOW to HIGH) edge; nothing happens on the falling edge or a steady level.',
      RST1: 'Flip flop 1 asynchronous reset, active HIGH: forces Q1 LOW immediately when HIGH, ignoring CLK1. Idle it LOW.',
      D1:   'Flip flop 1 data input. Captured by Q1 on each rising CLK1 edge.',
      SET1: 'Flip flop 1 asynchronous set, active HIGH: forces Q1 HIGH immediately when HIGH, ignoring CLK1. Idle it LOW.',
      GND:  'Ground reference (VSS, pin 7). Connect to 0 V.',
      SET2: 'Flip flop 2 asynchronous set, active HIGH: forces Q2 HIGH. Idle it LOW.',
      D2:   'Flip flop 2 data input. Captured by Q2 on each rising CLK2 edge.',
      RST2: 'Flip flop 2 asynchronous reset, active HIGH: forces Q2 LOW. Idle it LOW.',
      CLK2: 'Flip flop 2 clock. D2 is captured on the rising edge.',
      Qn2:  '<span style="text-decoration:overline">Q2</span> flip flop 2 inverted output. Normally the complement of Q2.',
      Q2:   'Flip flop 2 true output. Holds the last value captured from D2.',
      VDD:  'Positive supply (pin 14). Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q1',   type: 'output', description: 'Flip flop 1 non inverting output' },
      { pin:  2, name: 'Qn1',  type: 'output', description: 'Flip flop 1 inverting output (<span style="text-decoration:overline">Q1</span>)' },
      { pin:  3, name: 'CLK1', type: 'input',  description: 'Flip flop 1 clock rising edge captures D1' },
      { pin:  4, name: 'RST1', type: 'input',  description: 'Flip flop 1 asynchronous reset, active HIGH: forces Q1 LOW' },
      { pin:  5, name: 'D1',   type: 'input',  description: 'Flip flop 1 data input captured on rising CLK1 edge' },
      { pin:  6, name: 'SET1', type: 'input',  description: 'Flip flop 1 asynchronous set, active HIGH: forces Q1 HIGH' },
      { pin:  7, name: 'GND',  type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'SET2', type: 'input',  description: 'Flip flop 2 asynchronous set, active HIGH' },
      { pin:  9, name: 'D2',   type: 'input',  description: 'Flip flop 2 data input' },
      { pin: 10, name: 'RST2', type: 'input',  description: 'Flip flop 2 asynchronous reset, active HIGH: forces Q2 LOW' },
      { pin: 11, name: 'CLK2', type: 'input',  description: 'Flip flop 2 clock rising edge captures D2' },
      { pin: 12, name: 'Qn2',  type: 'output', description: 'Flip flop 2 inverting output (<span style="text-decoration:overline">Q2</span>)' },
      { pin: 13, name: 'Q2',   type: 'output', description: 'Flip flop 2 non inverting output' },
      { pin: 14, name: 'VDD',  type: 'power',  description: 'Positive supply (3 18 V)' },
    ],
    gates: [
      { type: 'D_FF_ACTHI', inputs: ['D1','CLK1','SET1','RST1'], outputs: ['Q1','Qn1'] },
      { type: 'D_FF_ACTHI', inputs: ['D2','CLK2','SET2','RST2'], outputs: ['Q2','Qn2'] },
    ],
    guideSections: [
      {
        title: 'How the D Flip Flop Works',
        paragraphs: [
          'A D (data) flip flop copies whatever level is on its D input to its Q output at one instant: the moment CLK goes from LOW to HIGH (the rising edge). Between edges D can change all it wants and Q ignores it. Q holds the captured value until the next rising edge, and <span style="text-decoration:overline">Q</span> carries the opposite level. That is the whole idea: it is edge triggered, and it acts only on the rising edge. A falling edge or a steady clock level does nothing.',
          'For a clean capture, D has to be steady for a short window around the edge: a setup time just before it and a hold time just after. At a 5 V supply the CD4013B wants D settled about 40 ns before the edge; that window shrinks at higher voltage and stretches at lower voltage (from the datasheet recommended operating conditions). Change D outside that window and the flip flop does not care.',
          'SET and RESET ignore the clock completely. Drive SET HIGH and Q jumps to 1 right away; drive RESET HIGH and Q drops to 0 right away. That is what asynchronous means here: no clock edge needed. Both are active HIGH, so for normal clocked operation you hold them LOW (tied to VSS) and leave them there. This is the opposite of the 74x74, whose preset and clear are active LOW.',
        ],
        note: 'Mind the supply pins and the naming. This is a 4000 series CMOS part: power is VDD on pin 14 and VSS (ground) on pin 7, and it runs on 3 V to 18 V, not a fixed 5 V. It is slower than a TTL flip flop (about 16 MHz maximum toggle rate at 10 V, and only a few MHz at 5 V), but far more flexible on supply voltage.',
      },
      {
        title: 'Function Table',
        paragraphs: [
          'Straight from the datasheet. H = HIGH, L = LOW, X = don\'t care, an up arrow marks a rising clock edge and a down arrow a falling edge. Q0 means "the value Q already held" (no change).',
        ],
        formulas: [
          'SET  RESET  CLK  D  |   Q    /Q',
          '  L    L     ↑   1  |   1     0    rising edge captures D=1',
          '  L    L     ↑   0  |   0     1    rising edge captures D=0',
          '  L    L     ↓   X  |   Q0   /Q0   falling edge: output holds',
          '  H    L     X   X  |   1     0    SET forces Q high',
          '  L    H     X   X  |   0     1    RESET forces Q low',
          '  H    H     X   X  |   1     1    both high: invalid, avoid',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Divide-by-2 / toggle: wire <span style="text-decoration:overline">Q</span> back to D. Q then flips state on every rising clock edge, so its output runs at half the clock frequency. Feed that into the second flip flop to divide by 4.',
          'Push-button toggle (soft power switch): clock the flip flop from a debounced momentary button with <span style="text-decoration:overline">Q</span> fed back to D. Each press flips Q: press once for on, again for off. This is the exact circuit TI shows in the datasheet.',
          'Shift register: feed Q of one flip flop into D of the next and share a common clock; a bit marches one stage per rising edge.',
          '1 bit memory / register cell, or a synchroniser to re-time an outside signal onto your own clock.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'SET and RESET are active HIGH, the opposite of the 74x74. Idle them LOW (tie to VSS), not HIGH, or the flip flop sits stuck set or cleared. Never leave them floating.',
          'It triggers only on the rising edge (LOW to HIGH). A HIGH level sitting on the clock does nothing, and neither does the falling edge; the clock has to actually transition upward.',
          'Do not drive SET and RESET HIGH at the same time. The datasheet shows both Q and <span style="text-decoration:overline">Q</span> going HIGH in that case, which is invalid for outputs meant to be opposites, and the state collapses to an unpredictable value the instant you release one. (74Sim simplifies this: it resolves the clash to RESET-wins, Q=0, rather than driving both outputs HIGH the same simplification it uses for the 74x74.)',
          'Never leave any CMOS input floating. An unconnected input drifts toward mid-supply, where the gate draws excess current and can self-oscillate. Tie every unused D, CLK, SET, and RESET to a defined level.',
          'The two flip flops are fully independent, with separate D, CLK, SET, and RESET pins and no shared clock or reset. They share only VDD (pin 14) and VSS (pin 7).',
          'Setup/hold violations cause metastability: clock D right at the edge and Q can hang at an in-between voltage before settling to a random 0 or 1. This mostly bites when you clock in a signal not synchronised to your clock. (Simplified: real metastability is a probability that shrinks with time, not a guaranteed hard failure.)',
        ],
      },
    ],
  },

  // ── CD4008: 4 bit binary full adder (16-pin) ───────────────────────────
  /* Primary source: ON Semiconductor, CD4008 datasheet. [Online]. Available: https://www.onsemi.com/download/data-sheet/pdf/mc14008b-d.pdf
     https://en.wikipedia.org/wiki/Adder_(electronics) */
  'CD4008': {
    name: 'CD4008',
    simpleName: '4 bit Binary Full Adder',
    description: '4-bit binary full adder, carry-in/out, CMOS 4000. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.onsemi.com/download/data-sheet/pdf/mc14008b-d.pdf',
    tags: ['cmos', '4000 series', 'adder', 'arithmetic', 'full adder'],
    guideOverview: 'The CD4008 is a CMOS 4 bit binary full adder. It adds two 4 bit numbers A[3:0] and B[3:0] plus a carry in (CIN) to produce a 4 bit sum S[3:0] and a carry out (COUT). COUT goes HIGH when the sum exceeds 15. Multiple chips can be chained connect COUT of a lower stage to CIN of the next to build wider adders. Set CIN LOW when carry in is not used.',
    guidePinDescriptions: {
      A3:   'Most significant bit (bit 3) of input A.',
      B3:   'Most significant bit (bit 3) of input B.',
      A2:   'Bit 2 of input A.',
      B2:   'Bit 2 of input B.',
      A1:   'Bit 1 of input A.',
      B1:   'Bit 1 of input B.',
      A0:   'Least significant bit (bit 0) of input A.',
      GND:  'Ground reference (VSS). Connect to 0 V.',
      CIN:  'Carry input. Connect to COUT of a lower stage, or tie LOW for no carry in.',
      S0:   'Sum bit 0 (LSB) of the result.',
      S1:   'Sum bit 1 of the result.',
      S2:   'Sum bit 2 of the result.',
      S3:   'Sum bit 3 (MSB) of the result.',
      COUT: 'Carry output. HIGH when A + B + CIN > 15 (result overflows 4 bits).',
      B0:   'Least significant bit (bit 0) of input B.',
      VDD:  'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'A3',   type: 'input',  description: 'Input A bit 3 (MSB)' },
      { pin:  2, name: 'B3',   type: 'input',  description: 'Input B bit 3 (MSB)' },
      { pin:  3, name: 'A2',   type: 'input',  description: 'Input A bit 2' },
      { pin:  4, name: 'B2',   type: 'input',  description: 'Input B bit 2' },
      { pin:  5, name: 'A1',   type: 'input',  description: 'Input A bit 1' },
      { pin:  6, name: 'B1',   type: 'input',  description: 'Input B bit 1' },
      { pin:  7, name: 'A0',   type: 'input',  description: 'Input A bit 0 (LSB)' },
      { pin:  8, name: 'GND',  type: 'power',  description: 'Ground (0 V)' },
      { pin:  9, name: 'CIN',  type: 'input',  description: 'Carry input tie LOW when not cascading' },
      { pin: 10, name: 'S0',   type: 'output', description: 'Sum bit 0 (LSB)' },
      { pin: 11, name: 'S1',   type: 'output', description: 'Sum bit 1' },
      { pin: 12, name: 'S2',   type: 'output', description: 'Sum bit 2' },
      { pin: 13, name: 'S3',   type: 'output', description: 'Sum bit 3 (MSB)' },
      { pin: 14, name: 'COUT', type: 'output', description: 'Carry output: HIGH when sum exceeds 15' },
      { pin: 15, name: 'B0',   type: 'input',  description: 'Input B bit 0 (LSB)' },
      { pin: 16, name: 'VDD',  type: 'power',  description: 'Positive supply (3 18 V)' },
    ],
    gates: [
      { type: 'ADDER_4BIT', inputs: ['A0','A1','A2','A3','B0','B1','B2','B3','CIN'], outputs: ['S0','S1','S2','S3','COUT'] },
    ],
    guideSections: [
      {
        title: '4 bit Binary Addition',
        paragraphs: [
          'The adder computes A + B + CIN combinationally and presents results immediately on the sum outputs. COUT goes HIGH when the full result exceeds 15 (4 bit overflow).',
          'Chain multiple CD4008s by connecting each COUT to the CIN of the next higher stage to build 8 bit, 12 bit, or wider adders.',
          'The input bit ordering runs MSB (A3/B3) at the low numbered pins and LSB (A0/B0) at higher numbered pins note that B0 is at pin 15, not adjacent to A0 at pin 7.',
        ],
        formulas: [
          'S[3:0] = A[3:0] + B[3:0] + CIN',
          'COUT = 1 when result > 15',
        ],
        note: 'Tie CIN LOW when no carry in is needed. Leaving CIN floating is not reliable in CMOS circuits.',
      },
    ],
  },

  // ── CD4014: 8 bit synchronous PISO shift register (16-pin) ─────────────
  /* Primary source: Texas Instruments, CD4014 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4014b.pdf
     https://en.wikipedia.org/wiki/Shift_register */
  'CD4014': {
    name: 'CD4014',
    simpleName: '8 bit PISO Shift Register',
    description: '8-stage sync PISO shift register, CMOS 4000. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4014b.pdf',
    tags: ['cmos', '4000 series', 'shift register', 'PISO', 'serial', 'parallel', 'sequential'],
    guideOverview: 'The CD4014 is an 8 stage synchronous PISO (Parallel In Serial Out) shift register. When PE (Parallel Enable) is HIGH, the eight parallel inputs P1-P8 are loaded into the register on the next rising CLK edge. When PE is LOW, each rising CLK edge shifts data one position toward the output, entering a new serial bit from DS. Only stages Q5, Q6, and Q7 are brought out as pins; Q7 is the main serial output (last stage out). Used for parallel to serial conversion, for example reading 8 switches with just 3 microcontroller pins.',
    guidePinDescriptions: {
      P1:  'Parallel input for stage 1 (first to load). Loaded when PE is HIGH on rising CLK.',
      Q6:  'Output of stage 6. Available during serial shifting.',
      Q7:  'Output of stage 7 (last stage, main serial output). P8 appears here first after parallel load.',
      P2:  'Parallel input for stage 2.',
      P3:  'Parallel input for stage 3.',
      P4:  'Parallel input for stage 4.',
      P5:  'Parallel input for stage 5.',
      GND: 'Ground reference (VSS). Connect to 0 V.',
      PE:  'Parallel Enable. HIGH=load P1 P8 on rising CLK edge. LOW=shift mode, serial input from DS.',
      CLK: 'Clock input. Rising edge either loads parallel data (PE HIGH) or shifts data (PE LOW).',
      DS:  'Serial data input. Clocked into stage 1 on each rising CLK when PE is LOW.',
      Q5:  'Output of stage 5. Available during serial shifting.',
      P6:  'Parallel input for stage 6.',
      P7:  'Parallel input for stage 7.',
      P8:  'Parallel input for stage 8 (last stage). Appears at Q7 immediately after parallel load.',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'P1',  type: 'input',  description: 'Parallel input stage 1' },
      { pin:  2, name: 'Q6',  type: 'output', description: 'Stage 6 serial output' },
      { pin:  3, name: 'Q7',  type: 'output', description: 'Stage 7 serial output (main serial out P8 first after load)' },
      { pin:  4, name: 'P2',  type: 'input',  description: 'Parallel input stage 2' },
      { pin:  5, name: 'P3',  type: 'input',  description: 'Parallel input stage 3' },
      { pin:  6, name: 'P4',  type: 'input',  description: 'Parallel input stage 4' },
      { pin:  7, name: 'P5',  type: 'input',  description: 'Parallel input stage 5' },
      { pin:  8, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  9, name: 'PE',  type: 'input',  description: 'Parallel Enable HIGH: parallel load on rising CLK; LOW: serial shift' },
      { pin: 10, name: 'CLK', type: 'input',  description: 'Clock rising edge clocks all operations' },
      { pin: 11, name: 'DS',  type: 'input',  description: 'Serial data input (used when PE is LOW)' },
      { pin: 12, name: 'Q5',  type: 'output', description: 'Stage 5 serial output' },
      { pin: 13, name: 'P6',  type: 'input',  description: 'Parallel input stage 6' },
      { pin: 14, name: 'P7',  type: 'input',  description: 'Parallel input stage 7' },
      { pin: 15, name: 'P8',  type: 'input',  description: 'Parallel input stage 8 (MSB first to appear at Q7)' },
      { pin: 16, name: 'VDD', type: 'power',  description: 'Positive supply (3 18 V)' },
    ],
    gates: [
      { type: 'SHIFT_REG_8BIT_PISO_CD', inputs: ['CLK','PE','DS','P1','P2','P3','P4','P5','P6','P7','P8'], outputs: ['Q5','Q6','Q7'] },
    ],
    guideSections: [
      {
        title: 'Parallel Load and Serial Shift Operation',
        paragraphs: [
          'Set PE HIGH and drive the desired data on P1 P8. On the next rising CLK edge all eight bits are loaded simultaneously into the register. P8 appears immediately at Q7, P7 at Q6, P6 at Q5.',
          'After loading, pull PE LOW. Each subsequent rising CLK edge shifts the contents one stage toward Q7, entering new data from DS at stage 1. After 8 clock pulses the entire parallel word has been shifted out.',
          'Only Q5, Q6, and Q7 are pinned out; internal stages-1-4 are only accessible when they ripple out to Q5.',
        ],
        list: [
          'Parallel to serial converter: load switches or bus data and clock out serially.',
          'Microcontroller interface: read 8 inputs using just 3 I/O pins (CLK, PE, and Q7).',
          'Chain two CD4014s by connecting Q7 of the first to DS of the second with a shared CLK and PE to create a 16 bit PISO register.',
          'Shifting order after a parallel load: P8 exits Q7 first, then P7, P6 ... P1 last. DS enters at stage 1 in serial mode.',
        ],
      },
    ],
  },

  // ── CD4015: Dual 4 bit SIPO shift register (16-pin) ────────────────────
  /* Primary source: Texas Instruments, CD4015 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4015b.pdf
     https://en.wikipedia.org/wiki/Shift_register */
  'CD4015': {
    name: 'CD4015',
    simpleName: 'Dual 4 bit SIPO Shift Register',
    description: 'Dual 4-stage SIPO shift register, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4015b.pdf',
    tags: ['cmos', '4000 series', 'shift register', 'SIPO', 'serial to parallel'],
    guideOverview: 'The CD4015 contains two independent 4 stage serial in, parallel out (SIPO) shift registers. Each register accepts bits one at a time on a serial data input (D) and makes all four stored bits available in parallel on Q0-Q3. A practical use is expanding output pins on a microcontroller loading 8 bits into both registers with just two MCU pins gives you 8 parallel outputs.',
    guidePinDescriptions: {
      CLKB: 'Clock input for shift register B. Bits shift on the rising edge.',
      QB3:  'Stage 3 output of register B the oldest (first entered) bit in the shift chain.',
      QB2:  'Stage 2 output of register B.',
      QB1:  'Stage 1 output of register B.',
      QB0:  'Stage 0 output of register B the most recently entered bit.',
      RSTA: 'Asynchronous reset for register A. Active HIGH: all Q outputs go LOW immediately, regardless of clock.',
      DA:   'Serial data input for register A. Value is sampled on the rising edge of CLKA.',
      GND:  'Ground (0 V). Connect to negative supply rail.',
      CLKA: 'Clock input for shift register A. Bits shift on the rising edge.',
      QA0:  'Stage 0 output of register A the most recently entered bit.',
      QA1:  'Stage 1 output of register A.',
      QA2:  'Stage 2 output of register A.',
      QA3:  'Stage 3 output of register A the oldest (first entered) bit in the shift chain.',
      RSTB: 'Asynchronous reset for register B. Active HIGH: all Q outputs go LOW.',
      DB:   'Serial data input for register B. Value is sampled on the rising edge of CLKB.',
      VDD:  'Positive supply. Accepts 3 V to 15 V (some versions to 20 V).',
    },
    pinout: [
      { pin:  1, name: 'CLKB', type: 'input'  },
      { pin:  2, name: 'QB3',  type: 'output' },
      { pin:  3, name: 'QB2',  type: 'output' },
      { pin:  4, name: 'QB1',  type: 'output' },
      { pin:  5, name: 'QB0',  type: 'output' },
      { pin:  6, name: 'RSTA', type: 'input'  },
      { pin:  7, name: 'DA',   type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'CLKA', type: 'input'  },
      { pin: 10, name: 'QA0',  type: 'output' },
      { pin: 11, name: 'QA1',  type: 'output' },
      { pin: 12, name: 'QA2',  type: 'output' },
      { pin: 13, name: 'QA3',  type: 'output' },
      { pin: 14, name: 'RSTB', type: 'input'  },
      { pin: 15, name: 'DB',   type: 'input'  },
      { pin: 16, name: 'VDD',  type: 'power'  },
    ],
    gates: [
      { type: 'SHIFT_REG_4BIT_SIPO', inputs: ['DA','CLKA','RSTA'], outputs: ['QA0','QA1','QA2','QA3'] },
      { type: 'SHIFT_REG_4BIT_SIPO', inputs: ['DB','CLKB','RSTB'], outputs: ['QB0','QB1','QB2','QB3'] },
    ],
    guideSections: [
      {
        title: 'Serial In, Parallel Out Shift Operation',
        paragraphs: [
          'On each rising clock edge, the bit present on the D input enters Q0. The previous Q0 moves to Q1, Q1 to Q2, and Q2 to Q3. Q3 is overwritten and lost.',
          'After four clock cycles a complete 4 bit word is available simultaneously on Q0-Q3.',
          'Setting RST HIGH immediately clears all four stages to 0 without waiting for a clock edge (asynchronous reset). Keep RST LOW during normal operation.',
        ],
        list: [
          'Output expansion: use both registers together with a shared clock to give a microcontroller 8 parallel outputs using just two I/O pins (data and clock).',
          '8 bit chain: connect QA3 (or QB3) of one register to the D input of the next to cascade into an 8 bit shift register.',
          'Serial to parallel conversion: receive a bit stream from a single wire and decode it into a parallel nibble for further processing.',
        ],
      },
    ],
  },

  // ── CD4016: Quad bilateral switch (14-pin) ──────────────────────────────
  /* Primary source: Texas Instruments, CD4016 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4016b.pdf */
  'CD4016': {
    name: 'CD4016',
    simpleName: 'Quad Bilateral Switch',
    description: 'Quad bilateral CMOS analog/digital switch CMOS 4000 series (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    onResistance: 400,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4016b.pdf',
    tags: ['cmos', '4000 series', 'analog switch', 'bilateral switch', 'transmission gate', 'multiplexer'],
    guideOverview: 'The CD4016 contains four independently controlled bilateral (bidirectional) CMOS analog switches. Each switch is controlled by an enable pin (EN): HIGH closes the switch so current can flow between X and Y in either direction; LOW opens it (Hi Z). Because the switch is bidirectional, either X or Y can be the signal source. It handles both analog and digital signals.',
    guidePinDescriptions: {
      X1:  'First terminal of switch 1. Bidirectional can be input or output.',
      Y1:  'Second terminal of switch 1. Bidirectional can be input or output.',
      X2:  'First terminal of switch 2.',
      Y2:  'Second terminal of switch 2.',
      EN1: 'Enable for switch 1. HIGH=switch closed (X↔Y connected); LOW=switch open (Hi Z).',
      EN2: 'Enable for switch 2. HIGH=closed, LOW=open.',
      GND: 'Ground (0 V). Connect to negative supply rail.',
      Y3:  'Second terminal of switch 3.',
      X3:  'First terminal of switch 3.',
      Y4:  'Second terminal of switch 4.',
      X4:  'First terminal of switch 4.',
      EN3: 'Enable for switch 3. HIGH=closed, LOW=open.',
      EN4: 'Enable for switch 4. HIGH=closed, LOW=open.',
      VDD: 'Positive supply. Accepts 3 V to 15 V (some versions to 20 V).',
    },
    pinout: [
      { pin:  1, name: 'X1',  type: 'input'  },
      { pin:  2, name: 'Y1',  type: 'output' },
      { pin:  3, name: 'X2',  type: 'input'  },
      { pin:  4, name: 'Y2',  type: 'output' },
      { pin:  5, name: 'EN1', type: 'input'  },
      { pin:  6, name: 'EN2', type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'Y3',  type: 'output' },
      { pin:  9, name: 'X3',  type: 'input'  },
      { pin: 10, name: 'Y4',  type: 'output' },
      { pin: 11, name: 'X4',  type: 'input'  },
      { pin: 12, name: 'EN3', type: 'input'  },
      { pin: 13, name: 'EN4', type: 'input'  },
      { pin: 14, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'BILATERAL_SWITCH', inputs: ['X1','Y1','EN1'], outputs: ['X1','Y1'] },
      { type: 'BILATERAL_SWITCH', inputs: ['X2','Y2','EN2'], outputs: ['X2','Y2'] },
      { type: 'BILATERAL_SWITCH', inputs: ['X3','Y3','EN3'], outputs: ['X3','Y3'] },
      { type: 'BILATERAL_SWITCH', inputs: ['X4','Y4','EN4'], outputs: ['X4','Y4'] },
    ],
    guideSections: [
      {
        title: 'Bilateral Switch Operation',
        paragraphs: [
          'When EN is HIGH, the X and Y terminals are connected through a low resistance channel (typical on resistance ~400 Ω for the CD4016). Signal can flow in either direction.',
          'When EN is LOW, the channel presents a very high impedance (open circuit) no current flows between X and Y.',
          'Because the switch is bidirectional, you choose which end is the source and which is the destination in your circuit. This makes it useful as a signal router or analog multiplexer.',
        ],
        list: [
          'Analog multiplexer: connect multiple signal sources to one line; enable only the desired switch.',
          'Signal gating: pass or block an analog audio or sensor signal under digital control.',
          'LED test circuit: with EN tied to a push button, the switch connects or disconnects an LED.',
          'CD4066 is a pin compatible alternative with lower on resistance (~80 Ω).',
        ],
        note: '74Sim models the switch as a passive resistive coupling: when EN=HIGH, X and Y are connected through the chip\'s on-resistance (~400 Ω for the CD4016) and any analog voltage between the rails passes through; when EN=LOW the terminals are isolated. Distortion, bandwidth, and leakage are not modelled.',
      },
    ],
  },

  // ── CD4017: Johnson decade counter, 10 decoded one-at-a-time outputs (16-pin) ─
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4017B, CD4022B Types — CMOS Counter/Dividers," SCHS027C (Rev. Feb. 2004).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4017b.pdf.
  //   Verified: read as 300-dpi PDF page images (issues.md C4 — NOT the WebFetch
  //   text summarizer). CD4017B TERMINAL DIAGRAM + Functional Diagram (p.1) and the
  //   Fig. 2 logic + timing diagram (p.2, pin numbers in circles) confirm the full
  //   pin map — decoded outputs 0..9 on pins 3,2,4,7,10,1,5,6,9,11; CARRY OUT 12;
  //   CLOCK 14; CLOCK INHIBIT 13; RESET 15; VDD 16; VSS 8 — plus rising-edge advance,
  //   active-HIGH asynchronous RESET, active-HIGH CLOCK INHIBIT, anti-lock gating,
  //   and CARRY OUT HIGH for counts 0-4 / LOW for 5-9. Supply 3-18 V (20 V abs. max)
  //   from Recommended Operating Conditions / Maximum Ratings (p.1). Pin map and
  //   behaviour match the pre-existing entry — pinout[]/gates[]/engine left untouched.
  // Johnson / twisted-ring counter background only (no pin or timing claim taken
  //   from it): Wikipedia contributors, "Ring counter." [Online]. Available:
  //   https://en.wikipedia.org/wiki/Ring_counter.
  'CD4017': {
    name: 'CD4017',
    simpleName: 'Decade Counter / Divider',
    description: 'Decade Johnson counter, 10 decoded outputs (one HIGH), CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4017b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'decade counter', 'ring counter', 'decoded', 'sequencer'],
    guideOverview: 'The CD4017 counts clock pulses from 0 to 9 and shows the count as a single HIGH output. It has ten output pins, Q0 through Q9, and exactly one of them is HIGH at any moment while the other nine stay LOW. Each rising clock edge moves that HIGH along to the next output; after Q9 it wraps back to Q0. Inside it is a five-stage Johnson counter with decoding logic, but you can treat it as a 1-of-10 sequencer and ignore the internals. It is a favourite for LED chasers and running-light displays, for dividing a clock frequency, and for stepping through up to ten stages of a sequence. A 555 timer in astable mode makes an easy clock source.',
    guidePinDescriptions: {
      'Q5': 'Decoded output 5. HIGH only when the count equals 5.',
      'Q1': 'Decoded output 1. HIGH only when the count equals 1.',
      'Q0': 'Decoded output 0. HIGH when the count is 0, which is also the state right after a reset. As with every Q pin, HIGH means "this is the current count" and only one Q is HIGH at a time.',
      'Q2': 'Decoded output 2. HIGH only when the count equals 2.',
      'Q6': 'Decoded output 6. HIGH only when the count equals 6.',
      'Q7': 'Decoded output 7. HIGH only when the count equals 7.',
      'Q3': 'Decoded output 3. HIGH only when the count equals 3.',
      'GND': 'Ground / negative supply (0 V). Labelled VSS on the datasheet.',
      'Q8': 'Decoded output 8. HIGH only when the count equals 8.',
      'Q4': 'Decoded output 4. HIGH only when the count equals 4.',
      'Q9': 'Decoded output 9. HIGH only when the count equals 9.',
      'CO': 'Carry out. HIGH for counts 0-4 and LOW for counts 5-9, so it makes one full cycle for every ten clock pulses. Feed it to the CLK of a second CD4017 to count past 9.',
      'CI': 'Clock inhibit (active HIGH). Tie LOW to count normally; take HIGH to freeze the count and ignore the clock. Do not leave it floating: a stray HIGH will stop the counter.',
      'CLK': 'Clock input. The count advances by one on each rising (LOW-to-HIGH) edge, as long as CI is LOW.',
      'MR': 'Master reset (active HIGH). Take HIGH to force the count to 0 (Q0 HIGH) immediately, no clock edge needed. Tie LOW for normal counting; do not leave it floating.',
      'VDD': 'Positive supply, 3 V to 18 V (20 V absolute maximum).',
    },
    pinout: [
      { pin:  1, name: 'Q5',  type: 'output' },
      { pin:  2, name: 'Q1',  type: 'output' },
      { pin:  3, name: 'Q0',  type: 'output' },
      { pin:  4, name: 'Q2',  type: 'output' },
      { pin:  5, name: 'Q6',  type: 'output' },
      { pin:  6, name: 'Q7',  type: 'output' },
      { pin:  7, name: 'Q3',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'Q8',  type: 'output' },
      { pin: 10, name: 'Q4',  type: 'output' },
      { pin: 11, name: 'Q9',  type: 'output' },
      { pin: 12, name: 'CO',  type: 'output' },
      { pin: 13, name: 'CI',  type: 'input'  },
      { pin: 14, name: 'CLK', type: 'input'  },
      { pin: 15, name: 'MR',  type: 'input'  },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_DECADE_DECODED', inputs: ['CLK','MR','CI'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','CO'] },
    ],
    guideSections: [
      {
        title: 'How it counts',
        paragraphs: [
          'The chip holds a count from 0 to 9. That count is decoded onto ten output pins: the pin matching the current count is HIGH, and the other nine are LOW. So the outputs act like a single lit position that walks along the row (a "1-of-10" or "one-hot" pattern), not like a binary number spread across several pins.',
          'Each rising (LOW-to-HIGH) edge on CLK adds one to the count, moving the HIGH to the next output. Counting 0, 1, 2 ... 9, the next edge after 9 wraps the count back to 0 and lights Q0 again. The count only changes on the edge, so between clock pulses the same output stays HIGH.',
          'Internally the count is not stored as plain binary but as a five-stage Johnson (twisted-ring) counter, and small decoding gates turn its pattern into the ten outputs. A Johnson counter has some states it should never land in; the chip includes "anti-lock" gating that quietly pulls it back into the correct sequence if noise ever knocks it into one. You do not have to design any of this it is why a single chip gives you clean 1-of-10 outputs.',
        ],
        formulas: [
          'Count 0 → Q0 HIGH,  1 → Q1,  2 → Q2, ...  9 → Q9,  then back to 0',
          'Exactly one Q output is HIGH at a time; the other nine are LOW',
        ],
      },
      {
        title: 'Reset, clock inhibit, and carry out',
        paragraphs: [
          'MR (master reset) is active HIGH and asynchronous: while MR is HIGH the count is forced to 0 (Q0 HIGH) straight away, with no clock edge needed, and it overrides everything else. For normal counting, tie MR LOW. Left floating, a CMOS input can drift HIGH and hold the counter stuck at 0.',
          'CI (clock inhibit) is active HIGH: when CI is HIGH the clock is ignored and the count freezes wherever it is. Tie CI LOW for free-running counting. This is the pin to use if you want to pause the counter without stopping the clock.',
          'CO (carry out) is HIGH for counts 0-4 and LOW for counts 5-9, so it completes one full cycle for every ten clock pulses. Its LOW-to-HIGH edge happens as the count rolls from 9 back to 0. That makes it a divide-by-10 clock: wire CO to the CLK of a second CD4017 and the pair counts to 100 (the first chip is the units digit, the second the tens).',
        ],
        formulas: [
          'MR = HIGH → count forced to 0 immediately (overrides CLK and CI)',
          'MR = LOW, CI = HIGH → count frozen, clock ignored',
          'MR = LOW, CI = LOW, CLK rising edge → count advances by 1',
          'CO = HIGH for counts 0-4, LOW for counts 5-9',
          'CO frequency = CLK frequency / 10',
        ],
      },
      {
        title: 'Common uses and gotchas',
        list: [
          'LED chaser / running light: wire Q0-Q9 to ten LEDs (each through its own resistor) and clock CLK from a 555 timer in astable mode. The lit LED walks down the row at the clock rate.',
          'Divide-by-N (2 to 10): feed the output for count N back to MR, so the counter resets the instant it reaches N. This shortens the cycle to N steps and divides the clock frequency by N.',
          'Sequencer with fewer than 10 steps: same trick pick the first output you do not want (say Q6 for a 6-step sequence, counts 0-5) and tie it back to MR.',
          'Frequency divider: use CO alone for a clean divide-by-10 output, ignoring Q0-Q9.',
          'Gotcha: this is not a binary counter. You get one active line per count, not a 0-9 binary value. If you need binary or BCD, use a part like the CD4510 or 74x90 instead.',
          'Gotcha: always tie MR and CI to a defined level (usually GND). Floating CMOS inputs pick up noise and can reset or freeze the count at random.',
        ],
        note: '74Sim treats the clock as a clean HIGH/LOW edge and models no propagation delay. Two real-part details this hides: (1) The real CD4017 shapes its clock input so it tolerates unlimited clock rise and fall times you can feed it a slow ramp or a sloppy edge; the model just assumes a clean edge. (2) The divide-by-N reset trick (feeding an output back to MR) produces a very short runt pulse on that output in real hardware, because the output briefly goes HIGH before the reset clears it. With no delay in the model, the counter jumps straight past that count and you never see the spike. Output drive current and the internal anti-lock recovery are also idealized.',
      },
    ],
  },

  // ── CD4060: CMOS 14-stage ripple-carry binary counter/divider + oscillator (16-pin)
  // FIXED 2026-07-04 (issues.md C104): pins 13 & 15 had Q9/Q10 swapped in the
  //   hand-entered map. The TI functional diagram puts Q9 on pin 13 and Q10 on
  //   pin 15 (a C2-class copy error). The oscillator terminals on pins 9/10 were
  //   also mislabelled CEXT/REXT ("external capacitor/resistor pin") — they are
  //   the datasheet's φ0/φ̄0 BUFFERED OSCILLATOR OUTPUTS, so they are renamed
  //   CLKO/CLKOn and the gate is moved to the verified COUNTER_BIN_OSC_14_CLKO
  //   primitive (the same counter core the 74x4060 sibling uses) so that a HIGH
  //   RESET also parks the oscillator, per the datasheet. The counter behaviour
  //   itself (14 stages, falling-edge advance, asynchronous active-HIGH reset)
  //   was already correct and is unchanged.
  // Source: Texas Instruments, "CD4060B Types — CMOS 14-Stage Ripple-Carry
  //   Binary Counter/Divider and Oscillator", SCHS049C (data acquired from Harris
  //   Semiconductor; revised October 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4060b.pdf. Verified: functional/terminal
  //   diagram + Features list (p.1), Fig.1 logic diagram, and Fig.12 typical RC
  //   circuit (p.3), read as 300-dpi rendered PDF page images (issues.md C4 — the
  //   text summarizer hallucinates these pinouts). Terminal map: 1=Q12, 2=Q13,
  //   3=Q14, 4=Q6, 5=Q5, 6=Q7, 7=Q4, 8=VSS/GND, 9=φ0/CLKO, 10=φ̄0/CLKOn,
  //   11=φ1/CLK, 12=RESET/MR, 13=Q9, 14=Q8, 15=Q10, 16=VDD. Behavioural facts
  //   used: "the state of the counter is advanced one step ... on the negative
  //   transition of φ1"; "a RESET input ... resets the counter to the all-0's
  //   state AND disables the oscillator" (active HIGH, asynchronous); "Schmitt-
  //   trigger action in the input-pulse line permits unlimited input-pulse rise
  //   and fall times"; 12-MHz max clock at 15 V; recommended supply 3–18 V;
  //   RC period T ≈ 2.2·R·C with a series resistor Rs ≈ 2R–10R (Fig.12 note).
  'CD4060': {
    name: 'CD4060',
    simpleName: '14-Stage Binary Counter with Oscillator',
    description: '14-stage binary ripple counter, on-chip RC/xtal osc, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4060b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary counter', 'oscillator', 'divider', 'timer', 'frequency divider'],
    guideOverview: 'The CD4060 packs a 14-stage binary ripple counter and an oscillator into one chip. Hang a resistor and capacitor (or a crystal) across CLK, CLKO, and CLKOn and it clocks itself, then divides that clock down into much slower signals — no separate oscillator chip needed. Ten of the fourteen stages reach a pin: Q4 through Q10 and Q12 through Q14 (stages 1-3 and stage 11 stay internal). Each output is half the frequency of the one below it, so one fast oscillator gives you a whole ladder of slower clocks and long delays at once. It is a staple for timers, blinkers, and slow clocks. Two things to know up front: the clock input has a Schmitt trigger, so it accepts slow or sloppy edges, and RESET is active HIGH — taking it HIGH clears the count and stops the oscillator.',
    guidePinDescriptions: {
      Q12:   'Counter stage 12 output (divide by 4096).',
      Q13:   'Counter stage 13 output (divide by 8192).',
      Q14:   'Counter stage 14 output (divide by 16384). Slowest available output.',
      Q6:    'Counter stage 6 output (divide by 64).',
      Q5:    'Counter stage 5 output (divide by 32).',
      Q7:    'Counter stage 7 output (divide by 128).',
      Q4:    'Counter stage 4 output (divide by 16). Fastest available output.',
      GND:   'Ground (0 V), the VSS pin. Connect to the negative supply rail.',
      CLKO:  'Oscillator output (datasheet φ0). With an external RC network or crystal it closes the timing loop. Held HIGH while RESET is HIGH.',
      CLKOn: 'Inverted oscillator output (datasheet φ̄0), the complement of CLKO. Held LOW while RESET is HIGH.',
      CLK:   'Clock input (datasheet φ1). The counter advances on each HIGH-to-LOW (falling) edge. A Schmitt trigger here lets it accept slow or noisy edges.',
      MR:    'Master reset (the datasheet RESET pin), active HIGH. A HIGH clears every counter stage to zero at once and disables the oscillator; tie LOW to count.',
      Q10:   'Counter stage 10 output (divide by 1024).',
      Q8:    'Counter stage 8 output (divide by 256).',
      Q9:    'Counter stage 9 output (divide by 512).',
      VDD:   'Positive supply, 3 V to 18 V. Connect to the positive rail.',
    },
    pinout: [
      { pin:  1, name: 'Q12',   type: 'output' },
      { pin:  2, name: 'Q13',   type: 'output' },
      { pin:  3, name: 'Q14',   type: 'output' },
      { pin:  4, name: 'Q6',    type: 'output' },
      { pin:  5, name: 'Q5',    type: 'output' },
      { pin:  6, name: 'Q7',    type: 'output' },
      { pin:  7, name: 'Q4',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'CLKO',  type: 'output' },
      { pin: 10, name: 'CLKOn', type: 'output' },
      { pin: 11, name: 'CLK',   type: 'input'  },
      { pin: 12, name: 'MR',    type: 'input'  },
      { pin: 13, name: 'Q9',    type: 'output' },
      { pin: 14, name: 'Q8',    type: 'output' },
      { pin: 15, name: 'Q10',   type: 'output' },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_OSC_14_CLKO', inputs: ['CLK','MR'], outputs: ['Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q12','Q13','Q14','CLKO','CLKOn'] },
    ],
    guideSections: [
      {
        title: 'Counter and frequency divider',
        paragraphs: [
          'Inside are 14 flip-flops in a chain. The clock drives the first one; each flip-flop then clocks the next. Every stage flips once for every two flips of the stage before it, so the frequency is halved stage by stage. Stage 4 divides the clock by 2⁴ = 16, and stage 14 by 2¹⁴ = 16384.',
          'Only ten of the fourteen stages reach a pin: Q4 through Q10 and Q12 through Q14. Stages 1-3 and stage 11 are internal only, which is why there is no Q1, Q2, Q3, or Q11 on the package. Read Q4 as the least significant of the available bits — the outputs count in plain binary.',
          'This is a ripple counter, so the stages do not all switch at the same instant: a clock edge ripples down the chain and each higher output changes a moment after the one below it. For slow timing that never matters, but if you decode several outputs at once you can briefly catch a wrong combination while the ripple settles. 74Sim settles all stages in one solve and does not reproduce that ripple delay — the final count is correct, the momentary glitch is not shown (a simplification).',
        ],
        formulas: [
          'Qn output frequency = clock frequency / 2ⁿ',
          'Q4 ÷16   Q5 ÷32   Q6 ÷64   Q7 ÷128   Q8 ÷256   Q9 ÷512   Q10 ÷1024',
          'Q12 ÷4096   Q13 ÷8192   Q14 ÷16384',
        ],
      },
      {
        title: 'The on-chip oscillator',
        paragraphs: [
          'The three pins CLK, CLKO, and CLKOn form an oscillator you finish with a few external parts. For an RC oscillator you hang a resistor and capacitor across them; for a crystal oscillator you fit a crystal and two small capacitors. Either way the chip makes its own clock and the counter divides it down — that is the whole appeal: one chip is both the clock source and the divider.',
          'With an RC network the frequency is set by the resistor and capacitor. The datasheet gives the period as roughly 2.2 × R × C, plus a second resistor (about 2 to 10 times R) in series to keep it stable. So 100 kΩ and 0.22 µF give about 20 Hz; Q4 then goes HIGH after roughly 0.4 s and Q14 after about 7 minutes. Real oscillator frequency also shifts with supply voltage and part tolerance, so treat these as ballpark numbers.',
        ],
        formulas: [
          'RC oscillator period: T ≈ 2.2 × R × C   (series resistor Rs ≈ 2R to 10R)',
          'Example: R = 100 kΩ, C = 0.22 µF → f ≈ 20 Hz',
        ],
        note: 'In 74Sim the analog oscillator is not modeled. Drive the CLK pin with an external clock and watch the Q outputs divide it down. CLKO and CLKOn still show the buffered clock (they are complementary), and both park — CLKO HIGH, CLKOn LOW — while RESET is HIGH, exactly as a stopped oscillator would.',
      },
      {
        title: 'Common uses and gotchas',
        list: [
          'Long-delay timer: run a slow RC oscillator and pick a high output such as Q14 for a single slow tick — delays of seconds to many minutes from one small capacitor.',
          'Multi-rate clock source: take several outputs at once to get a family of related clocks, each half the rate of the last, from one oscillator.',
          'Crystal timebase: with a 32.768 kHz watch crystal, Q14 divides it down to 2 Hz — the basis of a simple real-time clock.',
          'Frequency divider: feed an outside clock into CLK and read any Q output for that clock divided by a power of two.',
          'Gotcha: RESET is active HIGH. Left floating, CMOS input leakage can pull it HIGH and hold the count stuck at zero — tie it to GND when you are not using it.',
          'Gotcha: you cannot tap every division. Only Q4-Q10 and Q12-Q14 exist; there is no Q1, Q2, Q3, or Q11, so no divide-by-2 through divide-by-8 and no divide-by-2048 output.',
          'Gotcha: the outputs ripple rather than switch together, so avoid using raw combinations of several outputs where a momentary wrong value would cause trouble.',
        ],
      },
    ],
  },

  // ── CD4510: BCD up/down counter with preset (16-pin) ───────────────────
  /* Primary source: Texas Instruments, CD4510 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4510b.pdf
     https://en.wikipedia.org/wiki/Counter_(digital) */
  'CD4510': {
    name: 'CD4510',
    simpleName: 'BCD Up/Down Counter',
    description: 'Presettable BCD up/down counter CMOS 4000 series. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4510b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'BCD counter', 'up/down counter', 'presettable'],
    guideOverview: 'The CD4510 is a presettable BCD (0-9) up/down counter. UD selects up (HIGH) or down (LOW) counting direction. PRE (active HIGH) loads the parallel preset inputs P1-P4 synchronously on the next rising CLK edge. RST (active HIGH) resets the count to zero asynchronously, overriding everything else. CI (Carry In) is the clock enable counting only occurs when CI is LOW. CO (Carry Out) goes LOW at the terminal count: at 9 when counting up, or at 0 when counting down.',
    guidePinDescriptions: {
      PRE: 'Preset enable. Active HIGH: loads P1-P4 into the counter on the next rising CLK edge.',
      Q4:  'BCD output bit 3 (MSB, weight 8).',
      P4:  'Parallel preset input bit 3 (MSB, weight 8).',
      P1:  'Parallel preset input bit 0 (LSB, weight 1).',
      CI:  'Carry In / Clock Enable. Active LOW: counting advances on the rising CLK edge only when CI is LOW. Tie LOW for standalone operation.',
      Q1:  'BCD output bit 0 (LSB, weight 1).',
      CO:  'Carry Out / Borrow output. Active LOW: goes LOW at terminal count (9 when counting up, 0 when counting down).',
      GND: 'Ground (0 V). Connect to negative supply rail.',
      RST: 'Asynchronous master reset. Active HIGH: forces all Q outputs LOW immediately, overrides clock and preset.',
      UD:  'Up/Down select. HIGH = count up; LOW = count down.',
      Q2:  'BCD output bit 1 (weight 2).',
      P2:  'Parallel preset input bit 1 (weight 2).',
      P3:  'Parallel preset input bit 2 (weight 4).',
      Q3:  'BCD output bit 2 (weight 4).',
      CLK: 'Clock input. Count advances on the rising edge when CI=LOW and RST=LOW.',
      VDD: 'Positive supply. Accepts 3 V to 15 V (some versions to 20 V).',
    },
    pinout: [
      { pin:  1, name: 'PRE', type: 'input'  },
      { pin:  2, name: 'Q4',  type: 'output' },
      { pin:  3, name: 'P4',  type: 'input'  },
      { pin:  4, name: 'P1',  type: 'input'  },
      { pin:  5, name: 'CI',  type: 'input'  },
      { pin:  6, name: 'Q1',  type: 'output' },
      { pin:  7, name: 'CO',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'RST', type: 'input'  },
      { pin: 10, name: 'UD',  type: 'input'  },
      { pin: 11, name: 'Q2',  type: 'output' },
      { pin: 12, name: 'P2',  type: 'input'  },
      { pin: 13, name: 'P3',  type: 'input'  },
      { pin: 14, name: 'Q3',  type: 'output' },
      { pin: 15, name: 'CLK', type: 'input'  },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BCD_UPDOWN_CD', inputs: ['CLK','UD','PRE','CI','RST','P1','P2','P3','P4'], outputs: ['Q1','Q2','Q3','Q4','CO'] },
    ],
    guideSections: [
      {
        title: 'BCD Up/Down Counting',
        paragraphs: [
          'The counter counts in BCD (0 9) on each rising CLK edge. UD=HIGH counts up; UD=LOW counts down. After 9 the count rolls to 0 (counting up), or from 0 to 9 (counting down).',
          'CI (Carry In) is the clock enable and is active LOW tie CI LOW for normal standalone operation so counting is always enabled. When cascading multiple stages, connect CO of the lower stage to CI of the next stage.',
          'PRE HIGH on a rising clock edge loads P1 P4 into the counter, allowing a preset start value. RST HIGH immediately forces all outputs to 0, asynchronous to the clock.',
        ],
        formulas: [
          'CO (active LOW) goes LOW when counting up reaches 9, or when counting down reaches 0',
        ],
        list: [
          'Digital scoreboard: connect CLK to a pushbutton and Q1-Q4 to a CD4511 BCD to-7 segment decoder to display the score on a 7 segment LED display.',
          'Cascade two chips for a two decade (0-99) counter: connect CO of the units digit counter to CI of the tens digit counter.',
          'Countdown timer: set UD=LOW and PRE the starting value; CO going LOW signals that the count has reached 0.',
        ],
      },
    ],
  },

  // ── CD4511: BCD-to-7-segment latch/decoder/driver (16-pin) ─────────────
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4511B Types — CMOS BCD-to-7-Segment Latch/Decoder Drivers, High-Voltage
  //   Types (20-Volt Rating)", SCHS072B (Rev. July 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4511b.pdf. Verified: TERMINAL
  //   ASSIGNMENT diagram + FUNCTIONAL DIAGRAM (p.1) and TRUTH TABLE (p.4), read
  //   as 400-dpi PDF page images (issues.md C4 — never trust a text summary of a
  //   TI PDF). 25 mA sourcing / lamp-test / blanking / latch features: same
  //   datasheet, "Features" and "Applications", p.1.
  // Pinout FIX (2026-07-04): the segment outputs were hand-entered a..g in
  //   sequence on pins 9..15. The real CD4511B orders them e(9) d(10) c(11)
  //   b(12) a(13) g(14) f(15) — segment a is pin 13, not pin 9; only c (pin 11)
  //   happened to land right. Corrected in pinout[] below. See issues.md.
  // Font FIX (2026-07-04): the '6' and '9' glyphs were the modern "tailed" font.
  //   Per the CD4511B truth table the part draws a tail-less 6 (segment a OFF)
  //   and a tail-less 9 (segment d OFF). Corrected in js/specificChipsSim.js
  //   _evaluateBcd7seg4511_fn. (The sibling CD4543 keeps the tailed font — the two
  //   parts genuinely differ; see js/debug/scenarios/74x4543-bcd-7seg-latch.mjs.)
  // Regression: js/debug/scenarios/cd4511-bcd-7seg-decoder.mjs.
  'CD4511': {
    name: 'CD4511',
    simpleName: 'BCD to 7 Segment Decoder/Driver',
    description: 'BCD-to-7-seg latch/decoder/driver, common-cathode, CMOS 4000. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4511b.pdf',
    tags: ['cmos', '4000 series', 'decoder', '7 segment', 'BCD decoder', 'display driver', 'latch'],
    guideOverview: 'The CD4511 turns a 4 bit BCD number (0 9) into the seven signals that light a common cathode 7 segment LED display. Put the digit on inputs D0 D3 (D0 is the least significant bit) and the a g outputs spell it out. Those outputs are active HIGH and each has a built in transistor that sources up to about 25 mA, so it lights the LEDs directly you only add one current limiting resistor per segment, not a driver transistor. Three control pins sit on top of the decode: LE latches the current digit so the display holds still while the input changes, BL (active LOW) blanks every segment, and LT (active LOW) lights all seven for a lamp test. Two quirks worth knowing: the segment outputs are not in pin order, and this part draws a 6 with no top bar and a 9 with no bottom bar.',
    guidePinDescriptions: {
      D1:  'BCD input bit 1 (weight 2). Labelled B on the datasheet.',
      D2:  'BCD input bit 2 (weight 4). Labelled C on the datasheet.',
      LT:  'Lamp Test (active LOW). Pull LOW to force all seven segments ON regardless of the BCD input a quick check for a dead segment. Highest priority: overrides blanking and the latch. Hold HIGH for normal use.',
      BL:  'Blanking (active LOW). Pull LOW to turn all segments OFF regardless of the BCD input. Feed it a fast on/off (PWM) signal to dim the display. Hold HIGH for normal use.',
      LE:  'Latch Enable / Store. LOW = transparent: the segments follow the BCD inputs live. HIGH = hold: the digit showing at that moment is frozen and stays put even as D0 D3 change.',
      D3:  'BCD input bit 3 (weight 8, most significant bit). Labelled D on the datasheet.',
      D0:  'BCD input bit 0 (weight 1, least significant bit). Labelled A on the datasheet.',
      GND: 'Ground, 0 V (VSS on the datasheet).',
      a:   'Segment a top horizontal bar. Active HIGH (segment on = output HIGH).',
      b:   'Segment b upper right vertical bar. Active HIGH.',
      c:   'Segment c lower right vertical bar. Active HIGH.',
      d:   'Segment d bottom horizontal bar. Active HIGH.',
      e:   'Segment e lower left vertical bar. Active HIGH.',
      f:   'Segment f upper left vertical bar. Active HIGH.',
      g:   'Segment g middle horizontal bar. Active HIGH.',
      VDD: 'Positive supply (VCC). 3 V to 15 V (20 V rating on the high-voltage grade).',
    },
    pinout: [
      { pin:  1, name: 'D1',  type: 'input'  },
      { pin:  2, name: 'D2',  type: 'input'  },
      { pin:  3, name: 'LT',  type: 'input'  },
      { pin:  4, name: 'BL',  type: 'input'  },
      { pin:  5, name: 'LE',  type: 'input'  },
      { pin:  6, name: 'D3',  type: 'input'  },
      { pin:  7, name: 'D0',  type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'e',   type: 'output' },
      { pin: 10, name: 'd',   type: 'output' },
      { pin: 11, name: 'c',   type: 'output' },
      { pin: 12, name: 'b',   type: 'output' },
      { pin: 13, name: 'a',   type: 'output' },
      { pin: 14, name: 'g',   type: 'output' },
      { pin: 15, name: 'f',   type: 'output' },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'BCD_7SEG_4511', inputs: ['D0','D1','D2','D3','LE','BL','LT'], outputs: ['a','b','c','d','e','f','g'] },
    ],
    guideSections: [
      {
        title: 'BCD in, seven segments out',
        paragraphs: [
          'A 7 segment display is seven LED bars, labelled a through g, arranged in a figure 8. Light the right combination and you read a digit. The CD4511 does that lookup for you: put a 4 bit BCD number on inputs D0 D3 (D0 is the least significant bit) and it drives the seven outputs to spell the matching digit.',
          'The outputs are active HIGH, and the chip is built for a common cathode display the kind where every LED cathode shares one pin tied to ground, so a segment lights when its anode is driven HIGH. Each output has a built in transistor that sources up to about 25 mA, enough to light the LED directly. You still put one current limiting resistor in series with each segment, but you do not need a separate driver transistor per segment.',
          'One thing to watch when wiring: the segment outputs are not in pin order. Going up the right hand side, pins 9 15 carry e, d, c, b, a, g, f not a, b, c, d... Follow the segment names, not the pin numbers.',
        ],
        note: 'A common anode display (anodes tied to +V, segments light when pulled LOW) is the wrong polarity for the CD4511. Use a common cathode display, add an inverter to each output, or reach for a part like the CD4543 whose output polarity can be flipped.',
      },
      {
        title: 'Blank, store, and lamp test',
        paragraphs: [
          'Three control pins sit on top of the decoder. They have a strict priority order: LT beats BL, and BL beats the latch and the decode. So if LT is LOW you get all segments on, no matter what BL, LE, or the BCD inputs are doing.',
        ],
        list: [
          'LT (Lamp Test), active LOW, highest priority. Pull it LOW and all seven segments turn on, ignoring everything else handy for spotting a dead segment.',
          'BL (Blanking), active LOW, next priority. Pull it LOW and the whole display goes dark. Drive it with a fast on/off (PWM) signal and the display dims a simple brightness control with no extra parts.',
          'LE (Latch Enable), lowest priority. LOW is transparent: the display follows the input live. Take it HIGH and the digit showing at that moment is frozen, so it holds even while the BCD inputs change underneath.',
        ],
      },
      {
        title: 'What each code shows',
        paragraphs: [
          'BCD only uses codes 0 through 9. The six left over codes (10 15) are not valid BCD, and the CD4511 blanks the display for all of them all segments off rather than showing garbage.',
          'Two digits are worth a close look. The CD4511 draws a 6 with no top bar (segment a stays off) and a 9 with no bottom bar (segment d stays off). That is how the original part was designed some newer decoders add those bars. If your 6 looks like it is missing its top, the chip is working correctly.',
        ],
        formulas: [
          '0 → a b c d e f     | 1 → b c         | 2 → a b d e g   | 3 → a b c d g',
          '4 → b c f g         | 5 → a c d f g   | 6 → c d e f g   | 7 → a b c',
          '8 → a b c d e f g   | 9 → a b c f g   | 10-15 → blank (all segments off)',
        ],
        list: [
          'Counter readout: wire a BCD counter such as the CD4510 straight to D0 D3 and watch it count on the display.',
          'Multi digit displays: use one CD4511 per digit, or multiplex several digits and steer the data with LE and BL.',
          'Freeze a reading: pull LE HIGH to hold a value on screen while the source keeps changing (for example during a measurement window).',
          'Dim the display: drive BL with a PWM signal, no extra circuitry.',
        ],
        note: 'This is the classic "tail-less" font. The CD4543 in this simulator draws 6 and 9 with the extra bars use that part instead if you want the modern look, or if you need to drive a common-anode or LCD display.',
      },
    ],
  },


  // ── 74x31: Delay elements (16-pin) ────────────────────────────────────
  /* Primary source: Texas Instruments, 74x31 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls31.pdf */
  '74x31': {
    name: '74x31',
    simpleName: 'Hex Delay Elements',
    description: 'Six delay elements: 2× inverting, 2× buffer, 2× 2-input NAND. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls31.pdf',
    tags: ['TTL', 'delay', 'logic gate', 'buffer', 'inverter', 'NAND'],
    guideOverview: 'The 74x31 contains six delay elements with three distinct propagation delays. Elements 1 and 6 are inverters (~27.5 ns). Elements 2 and 5 are non inverting buffers (~46.5 ns). Elements 3 and 4 are 2 input NAND gates (~6 ns). The delays are intentional and used for precise timing control in digital circuits.',
    guidePinDescriptions: {
      '1A':  'Input to inverter element 1 (~27.5 ns propagation delay).',
      '1Yn': 'Inverted output of element 1.',
      '2A':  'Input to buffer element 2 (~46.5 ns propagation delay).',
      '2Y':  'Non inverted output of element 2.',
      '3A':  'Input A to NAND element 3 (~6 ns propagation delay).',
      '3B':  'Input B to NAND element 3.',
      '3Yn': 'NAND output of element 3 (inverted).',
      GND:   'Ground reference. Connect to 0 V.',
      '4Yn': 'NAND output of element 4 (inverted).',
      '4A':  'Input A to NAND element 4 (~6 ns propagation delay).',
      '4B':  'Input B to NAND element 4.',
      '5Y':  'Non inverted output of element 5.',
      '5A':  'Input to buffer element 5 (~46.5 ns propagation delay).',
      '6Yn': 'Inverted output of element 6.',
      '6A':  'Input to inverter element 6 (~27.5 ns propagation delay).',
      VCC:   'Positive supply (5 V TTL).',
    },
    pinout: [
      { pin:  1, name: '1A',  type: 'input',  description: 'Inverter 1 input (~27.5 ns delay)' },
      { pin:  2, name: '1Yn', type: 'output', description: 'Inverter 1 output (inverted)' },
      { pin:  3, name: '2A',  type: 'input',  description: 'Buffer 2 input (~46.5 ns delay)' },
      { pin:  4, name: '2Y',  type: 'output', description: 'Buffer 2 output (non inverted)' },
      { pin:  5, name: '3A',  type: 'input',  description: 'NAND 3 input A (~6 ns delay)' },
      { pin:  6, name: '3B',  type: 'input',  description: 'NAND 3 input B' },
      { pin:  7, name: '3Yn', type: 'output', description: 'NAND 3 output (inverted)' },
      { pin:  8, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin:  9, name: '4Yn', type: 'output', description: 'NAND 4 output (inverted)' },
      { pin: 10, name: '4A',  type: 'input',  description: 'NAND 4 input A (~6 ns delay)' },
      { pin: 11, name: '4B',  type: 'input',  description: 'NAND 4 input B' },
      { pin: 12, name: '5Y',  type: 'output', description: 'Buffer 5 output (non inverted)' },
      { pin: 13, name: '5A',  type: 'input',  description: 'Buffer 5 input (~46.5 ns delay)' },
      { pin: 14, name: '6Yn', type: 'output', description: 'Inverter 6 output (inverted)' },
      { pin: 15, name: '6A',  type: 'input',  description: 'Inverter 6 input (~27.5 ns delay)' },
      { pin: 16, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'NOT',    inputs: ['1A'],      output: '1Yn' },
      { type: 'BUFFER', inputs: ['2A'],      output: '2Y'  },
      { type: 'NAND',   inputs: ['3A','3B'], output: '3Yn' },
      { type: 'NAND',   inputs: ['4A','4B'], output: '4Yn' },
      { type: 'BUFFER', inputs: ['5A'],      output: '5Y'  },
      { type: 'NOT',    inputs: ['6A'],      output: '6Yn' },
    ],
    guideSections: [
      {
        title: 'Delay Element Types and Propagation Times',
        paragraphs: [
          'Elements 1 and 6 are inverters with a typical propagation delay of 27.5 ns (range 23 32 ns). Elements 2 and 5 are non inverting buffers with a typical delay of 46.5 ns (range-45-48 ns). Elements 3 and 4 are 2 input NAND gates with a typical delay of only 6 ns.',
          'The chip is designed for precision timing: each element type provides a specific, controlled delay that can be used to sequence digital events or compensate for propagation skew in logic circuits.',
        ],
        list: [
          'Use the NAND gates (3/4) for the shortest delay (~6 ns) with gating control.',
          'Use the inverters (1/6) for medium delay (~27.5 ns) with signal inversion.',
          'Use the buffers (2/5) for the longest delay (~46.5 ns) with no inversion.',
        ],
        note: '74Sim does not model propagation delay all gates switch instantaneously. The functional logic (invert, buffer, NAND) is simulated correctly, but delay timing is not.',
      },
    ],
  },

};
