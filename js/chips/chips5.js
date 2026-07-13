// Chip definitions block 5
// Auto-generated from chips.js

export const CHIPS_BLOCK_5 = {
  // ── 74148: 8-to-3 Priority Encoder ─────────────────────────────────────
  /* Source: Texas Instruments, "SN54147, SN54148, SN54LS147, SN54LS148, SN74147,
     SN74148 (TIM9907), SN74LS147, SN74LS148 10-Line to 4-Line and 8-Line to
     3-Line Priority Encoders," SDLS053B (Oct. 1976, rev. May 2004). [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls148.pdf. Verified:
     '148/'LS148 terminal assignment (J/N/NS 16-pin package, TOP VIEW, page 1) +
     FUNCTION TABLE '148/'LS148 (page 3), read as rendered PDF page images
     (issues.md C4), NOT via a text summarizer. Confirmed all 16 pins
     (I4=1, I5=2, I6=3, I7=4, EI=5, A2=6, A1=7, GND=8, A0=9, I0=10, I1=11, I2=12,
     I3=13, GS=14, EO=15, VCC=16), the fully active-LOW convention, I7-highest
     priority, inverted-binary A2/A1/A0, GS LOW when any input is active, and EO
     LOW only when the chip is enabled with no input active. pinout[], gates[] and
     the PRIORITY_ENC_8TO3 evaluator matched the datasheet and were left unchanged.
     Regression guard: js/debug/scenarios/74x148-priority-encoder.mjs.
     Active-HIGH sibling named only for the "if you want normal-polarity pins"
     contrast (not the modeled part): TI, "CD4532B CMOS 8-Bit Priority Encoder,"
     SCHS082C. [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4532b.pdf.
     Priority-encoder concept: Wikipedia contributors, "Priority encoder."
     [Online]. Available: https://en.wikipedia.org/wiki/Priority_encoder.
     Propagation delay modeled as zero (issues.md A1). */
  '74x148': {
    name: '74x148',
    simpleName: '8-to-3 Priority Encoder',
    description: '8-to-3 line priority encoder with active-LOW I/O and cascade pins. (16-pin)',
    guideOverview: 'The 74x148 takes eight input lines and reports, as a 3-bit binary number, which one is active. It is the reverse of a 3-to-8 decoder: a decoder turns a number into one active line, this encoder turns one active line back into its number. What makes it a priority encoder is how it handles more than one input being active at once. Instead of getting confused, it ignores the lower ones and reports only the highest-numbered active input, so input 7 outranks input 5, which outranks input 0. That is exactly what you want when several devices can ask for service at the same moment and you must handle the most urgent first, which is why parts like this sit inside interrupt controllers and keypad scanners. One thing to keep straight: every pin is active LOW. An input counts as active when it is pulled LOW, not HIGH, and the 3-bit output is inverted binary, so when input 5 wins the A2 A1 A0 pins read the complement of 101, not 101 itself. Two status outputs, GS and EO, tell you whether any input is active and let you chain several 74x148s to encode more than eight lines. If you would rather have plain active-HIGH pins, the CMOS 4532 does the same job the other way up.',
    guidePinDescriptions: {
      'I4': 'Data input 4, active LOW. Priority 4: outranks I0 to I3, loses to I5 to I7.',
      'I5': 'Data input 5, active LOW. Priority 5: outranks I0 to I4.',
      'I6': 'Data input 6, active LOW. Priority 6: outranks I0 to I5.',
      'I7': 'Data input 7, active LOW. The highest priority: if I7 is LOW, nothing else matters.',
      'EI': 'Enable Input, active LOW. Hold LOW to run the chip. HIGH switches it off, forcing every output HIGH and ignoring the data inputs. In a cascade this pin is driven by the EO of the next-higher chip.',
      'A2': 'Output bit 2, the most significant, active LOW. A2 A1 A0 together form the inverted-binary number of the highest active input.',
      'A1': 'Output bit 1, active LOW.',
      'GND': 'Ground reference (pin 8).',
      'A0': 'Output bit 0, the least significant, active LOW.',
      'I0': 'Data input 0, active LOW. The lowest priority: encoded only when no higher input is active.',
      'I1': 'Data input 1, active LOW. Priority 1.',
      'I2': 'Data input 2, active LOW. Priority 2.',
      'I3': 'Data input 3, active LOW. Priority 3.',
      'GS': 'Group Select output, active LOW. Goes LOW when the chip is enabled and at least one input is active. It flags that the number on A2 A1 A0 is valid.',
      'EO': 'Enable Output, active LOW. Goes LOW only when the chip is enabled but no input is active. Wire it to the EI of the next-lower chip so the two never encode at the same time.',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Encoding, and why priority matters',
        paragraphs: [
          'An encoder is the opposite of a decoder. A 3-to-8 decoder takes a 3-bit number and makes one of eight output lines active; this encoder takes eight input lines and produces the 3-bit number of whichever one is active. Eight possibilities need exactly three bits to name them, because 2 to the power 3 is 8.',
          'A plain encoder falls apart if two inputs are active at once: it would try to output two different numbers on the same three pins and produce garbage. A priority encoder fixes that by ranking the inputs. When several are active it reports only the highest-numbered one and ignores the rest. Here input 7 has the highest priority and input 0 the lowest.',
        ],
      },
      {
        title: 'Function table (active LOW)',
        paragraphs: [
          'Every pin is active LOW, so read L as active or true and H as off or false. The enable EI must be LOW for the chip to do anything. The three-bit result on A2 A1 A0 comes out inverted: it is the complement of the input number, so input 5 (binary 101) shows up as L H L.',
          'Watch the last two rows: A2 A1 A0 reading HHH means either input 0 is active or nothing is active at all. GS is what tells them apart, so always check GS before you trust the code.',
        ],
        formulas: [
          'EI HIGH  →  every output HIGH; the chip is off and ignores its inputs',
          'EI LOW, no input active  →  A2 A1 A0 read HHH, GS HIGH, EO LOW',
          'EI LOW, input 7 active  →  A2 A1 A0 read LLL, GS LOW, EO HIGH',
          'EI LOW, input 6 active  →  A2 A1 A0 read LLH, GS LOW, EO HIGH',
          'EI LOW, input 5 active  →  A2 A1 A0 read LHL, GS LOW, EO HIGH',
          'EI LOW, input 4 active  →  A2 A1 A0 read LHH, GS LOW, EO HIGH',
          'EI LOW, input 3 active  →  A2 A1 A0 read HLL, GS LOW, EO HIGH',
          'EI LOW, input 2 active  →  A2 A1 A0 read HLH, GS LOW, EO HIGH',
          'EI LOW, input 1 active  →  A2 A1 A0 read HHL, GS LOW, EO HIGH',
          'EI LOW, input 0 active  →  A2 A1 A0 read HHH, GS LOW, EO HIGH',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Ranking interrupts: eight devices that can each request attention feed I0 to I7, and the CPU reads A2 A1 A0 to jump straight to the highest-priority request. This is the classic job priority encoders were built for.',
          'Reading a keypad or switch bank: turn "which of these 8 keys is pressed" into a 3-bit code, using far fewer wires than one line per key.',
          'Finding the most significant set bit: feed an 8-bit value in and the output gives the position of its highest 1, handy for normalizing a number or a rough log base 2.',
          'Wider encoders: chain two chips with EO into EI to encode 16 lines (see the note below).',
        ],
      },
      {
        title: 'Things that trip people up',
        list: [
          'Everything is active LOW. Tie unused inputs HIGH, not LOW, or the chip treats them as permanently active. Pull an input LOW to assert it.',
          'The output is inverted binary. If you want a normal active-HIGH count, invert A0 to A2 with three inverters, or use the active-HIGH CMOS 4532 instead.',
          'All-HIGH outputs are ambiguous. A2 A1 A0 reading HHH means either input 0 is active or no input is active at all. GS tells them apart: GS LOW means a real input is active, GS HIGH means nothing is.',
          'EI must be LOW. Leave the enable HIGH (or floating, which reads HIGH on TTL) and every output sits HIGH no matter what the inputs do, the usual cause of an encoder that seems dead.',
          'GS and EO are not the same. GS goes LOW when something is active; EO goes LOW only when the chip is enabled and nothing is active. EO is the one you pass down a cascade.',
        ],
        note: 'To build a 16-to-4 encoder, give the high chip inputs 8 to 15 and the low chip inputs 0 to 7, tie the high chip EI LOW, and run its EO into the low chip EI. Only one chip is ever active, so you combine the two sets of A outputs with AND gates and take the fourth (most significant) output bit from the high chip GS. Real chips also have a small propagation delay, about 10 ns on the original bipolar 74148 and 15 ns on the common 74LS148, which the simulator treats as zero. That is a simplification: it does not reproduce the brief glitches real delay can cause.',
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls148.pdf',
    tags: ['encoder', 'priority', '8 to 3', 'logic'],
    pinout: [
      { pin: 1,  name: 'I4',  displayName: 'I\u03054\u0305', type: 'input' },
      { pin: 2,  name: 'I5',  displayName: 'I\u03055\u0305', type: 'input' },
      { pin: 3,  name: 'I6',  displayName: 'I\u03056\u0305', type: 'input' },
      { pin: 4,  name: 'I7',  displayName: 'I\u03057\u0305', type: 'input' },
      { pin: 5,  name: 'EI',  displayName: 'E\u0305I\u0305', type: 'input' },
      { pin: 6,  name: 'A2',  type: 'output' },
      { pin: 7,  name: 'A1',  type: 'output' },
      { pin: 8,  name: 'GND', type: 'power' },
      { pin: 9,  name: 'A0',  type: 'output' },
      { pin: 10, name: 'I0',  displayName: 'I\u03050\u0305', type: 'input' },
      { pin: 11, name: 'I1',  displayName: 'I\u03051\u0305', type: 'input' },
      { pin: 12, name: 'I2',  displayName: 'I\u03052\u0305', type: 'input' },
      { pin: 13, name: 'I3',  displayName: 'I\u03053\u0305', type: 'input' },
      { pin: 14, name: 'GS',  type: 'output' },
      { pin: 15, name: 'EO',  type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'PRIORITY_ENC_8TO3',
        inputs: ['I0', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'EI'],
        outputs: ['A0', 'A1', 'A2', 'GS', 'EO'],
      },
    ],
  },

  // ── 74150: 16-to-1 Multiplexer ─────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN54150, SN54151A, SN54LS151,
     SN54S151, SN74150, SN74151A, SN74LS151, SN74S151 Data
     Selectors/Multiplexers," SDLS054 (Dec. 1972, rev. Mar. 1988). [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls151.pdf. Verified:
     24-pin SN74150 J/N/W-package terminal assignment (top view), the '150
     FUNCTION TABLE, and the '150 logic symbol on pages 1-2, read as rendered
     PDF page images (issues.md C4 — not a text summarizer). Confirmed every
     pin: E7..E0 on 1-8, strobe G# on 9, output W on 10, select D=11 (MSB),
     GND=12, C=13, B=14, A=15 (LSB), E15..E8 on 16-23, VCC=24. The '150 function
     table confirms the select order D C B A (A=LSB), the active-LOW strobe (G#
     HIGH forces W HIGH; G# LOW enables), and that W = the complement of the
     selected E input. Notable, stated verbatim on page 1: "The '150 has only an
     inverted W output" — no true Y output, unlike the '151. pinout[], the
     MUX_16TO1 gates[], and the _evaluateMux16to1 evaluator matched the
     datasheet and were left unchanged (engine correct — no hardware divergence).
     NOTE on the datasheet URL: TI's dedicated sn74150.pdf link now redirects to
     an HTML product-selector page (the discrete '150 is obsolete), so the
     'datasheet' field points at SDLS054 (sn74ls151.pdf), the combined datasheet
     whose title and page 1 cover the SN74150. Confirmed a real PDF, HTTP 200,
     on 2026-07-05.
     Multiplexer / data-selector + Boolean-function-generator concept: Wikipedia
     contributors, "Multiplexer." [Online]. Available:
     https://en.wikipedia.org/wiki/Multiplexer.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. Datasheet
     (SDLS054 page 1) typ '150 data-input-to-W delay 13 ns, typ 200 mW. */
  '74x150': {
    name: '74x150',
    simpleName: '16-to-1 Multiplexer',
    description: '16-to-1 data selector/multiplexer with a single inverted output. (24-pin)',
    guideOverview: 'The 74x150 is a 16-to-1 multiplexer, also called a data selector. It is the widest single-package multiplexer in the 74 series: sixteen data inputs (E0-E15) go in, and a 4-bit address (A, B, C, D) picks exactly one of them to send to the output. Think of it as a 16-position rotary switch whose knob is set by a binary number instead of by hand. One quirk sets this chip apart from its smaller relatives: its only output, W, is inverted. W carries the complement of the selected input, and there is no true (non-inverted) output pin — the 8-to-1 74x151 hands you both polarities, but the 74x150 gives you just the inverted one. A strobe pin, G, enables the chip: hold it LOW to run, take it HIGH to switch it off, which forces W HIGH no matter what the data inputs do. Address bit A is the least significant and D the most significant, so the address counts 0 through 15 to reach E0 through E15.',
    guidePinDescriptions: {
      'E7':  'Data input 7. Reaches W (inverted) when the address D,C,B,A = 0111.',
      'E6':  'Data input 6. Reaches W (inverted) when the address D,C,B,A = 0110.',
      'E5':  'Data input 5. Reaches W (inverted) when the address D,C,B,A = 0101.',
      'E4':  'Data input 4. Reaches W (inverted) when the address D,C,B,A = 0100.',
      'E3':  'Data input 3. Reaches W (inverted) when the address D,C,B,A = 0011.',
      'E2':  'Data input 2. Reaches W (inverted) when the address D,C,B,A = 0010.',
      'E1':  'Data input 1. Reaches W (inverted) when the address D,C,B,A = 0001.',
      'E0':  'Data input 0. Reaches W (inverted) when the address D,C,B,A = 0000.',
      'G':   'Strobe/enable, active LOW. LOW runs the chip; HIGH forces W HIGH and ignores the data inputs.',
      'W':   'Output, inverted. Carries the complement of the selected data input while G is LOW. This is the chip’s only output.',
      'D':   'Address bit 3 (most significant). Picks the upper or lower eight inputs.',
      'GND': 'Ground reference (pin 12).',
      'C':   'Address bit 2.',
      'B':   'Address bit 1.',
      'A':   'Address bit 0 (least significant).',
      'E15': 'Data input 15. Reaches W (inverted) when the address D,C,B,A = 1111.',
      'E14': 'Data input 14. Reaches W (inverted) when the address D,C,B,A = 1110.',
      'E13': 'Data input 13. Reaches W (inverted) when the address D,C,B,A = 1101.',
      'E12': 'Data input 12. Reaches W (inverted) when the address D,C,B,A = 1100.',
      'E11': 'Data input 11. Reaches W (inverted) when the address D,C,B,A = 1011.',
      'E10': 'Data input 10. Reaches W (inverted) when the address D,C,B,A = 1010.',
      'E9':  'Data input 9. Reaches W (inverted) when the address D,C,B,A = 1001.',
      'E8':  'Data input 8. Reaches W (inverted) when the address D,C,B,A = 1000.',
      'VCC': 'Positive supply (+5 V) at pin 24.',
    },
    guideSections: [
      {
        title: 'How it selects an input',
        paragraphs: [
          'The four address pins form a binary number, D,C,B,A, with A as the ones place and D as the eights place. That number, 0 through 15, decides which of the sixteen data inputs (E0-E15) is connected to the output. Only one input is passed at a time; the other fifteen are ignored.',
          'The strobe G must be LOW for any of this to happen. While G is LOW the chip follows the selected input continuously, so if that input changes, the output changes with it. Take G HIGH and the chip stops looking at the data and forces its output HIGH.',
        ],
        formulas: [
          'G=1 → W=1 (chip disabled, data ignored)',
          'G=0, D,C,B,A=0000 → W=NOT(E0)',
          'G=0, D,C,B,A=0101 → W=NOT(E5)',
          'G=0, D,C,B,A=1111 → W=NOT(E15)',
          'In general, while G=0:  W = NOT(E[address])',
        ],
      },
      {
        title: 'Only an inverted output',
        paragraphs: [
          'Unlike most multiplexers, the 74x150 gives you the complement of the selected input, not the input itself, and it has no second, non-inverted pin. If E5 is HIGH and the address points at it, W goes LOW.',
          'When you need the true signal, put an inverter (for example one gate of a 74x04) after W. If you are using the chip to build a logic function, you can often just account for the inversion in how you wire the data inputs instead of adding a part.',
        ],
      },
      {
        title: 'As a Boolean function generator',
        paragraphs: [
          'A 16-to-1 multiplexer can produce any logic function of four variables with no extra gates. Wire the four variables to A, B, C, and D. Then set each of the sixteen data inputs to the output value you want for that row of the truth table. As the address steps through all sixteen combinations, the output shows the value you wired for the matching row.',
          'Because W is inverted, the pattern you tie onto the data pins comes out complemented. Either wire each data pin to the opposite of the value you want, or take W as the complemented function — whichever is easier. A single 74x150 replaces the pile of gates a four-variable function would otherwise need.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Routing one of sixteen signal sources onto a single line (data selection).',
          'Parallel-to-serial conversion: load sixteen bits onto E0-E15, then sweep the address 0 to 15 with a counter and the output sends them out one at a time.',
          'Implementing any four-variable Boolean function from a single package.',
          'Reading one of sixteen switches or sensors under the control of a 4-bit address.',
        ],
      },
      {
        title: 'Things that trip people up',
        list: [
          'The output is inverted and there is no true output pin. If you need the real signal, add an inverter after W.',
          'G is active LOW. Leave it floating or HIGH and the output sits stuck HIGH, which looks like a dead chip.',
          'A is the least significant address bit and D the most significant. Swap them and you select the wrong input.',
          'Tie unused data inputs to a fixed level (usually ground) rather than leaving them floating.',
          'This is a big 24-pin chip. If eight inputs are enough, the 16-pin 74x151 is smaller and also gives you a true output.',
        ],
        note: 'Real parts are not instant: the original bipolar 74x150 takes about 13 ns from a data input to the W output. The simulator treats this delay as zero, a simplification that skips the brief timing glitches (hazards) real propagation delay can cause.',
      },
    ],
    pins: 24,
    vcc: 24,
    gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls151.pdf',
    tags: ['multiplexer', 'mux', '16-to-1', 'data selector'],
    pinout: [
      { pin: 1, name: 'E7', type: 'input' },
      { pin: 2, name: 'E6', type: 'input' },
      { pin: 3, name: 'E5', type: 'input' },
      { pin: 4, name: 'E4', type: 'input' },
      { pin: 5, name: 'E3', type: 'input' },
      { pin: 6, name: 'E2', type: 'input' },
      { pin: 7, name: 'E1', type: 'input' },
      { pin: 8, name: 'E0', type: 'input' },
      { pin: 9, name: 'G', type: 'input' },
      { pin: 10, name: 'W', type: 'output' },
      { pin: 11, name: 'D', type: 'input' },
      { pin: 12, name: 'GND', type: 'power' },
      { pin: 13, name: 'C', type: 'input' },
      { pin: 14, name: 'B', type: 'input' },
      { pin: 15, name: 'A', type: 'input' },
      { pin: 16, name: 'E15', type: 'input' },
      { pin: 17, name: 'E14', type: 'input' },
      { pin: 18, name: 'E13', type: 'input' },
      { pin: 19, name: 'E12', type: 'input' },
      { pin: 20, name: 'E11', type: 'input' },
      { pin: 21, name: 'E10', type: 'input' },
      { pin: 22, name: 'E9', type: 'input' },
      { pin: 23, name: 'E8', type: 'input' },
      { pin: 24, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'MUX_16TO1',
        inputs: ['E0','E1','E2','E3','E4','E5','E6','E7','E8','E9','E10','E11','E12','E13','E14','E15','A','B','C','D','G'],
        outputs: ['W'],
      },
    ],
  },

  // ── 74151: 8-to-1 Multiplexer ──────────────────────────────────────────
  /* Source: Texas Instruments, "SN54150, SN54151A, SN54LS151, SN54S151, SN74150,
     SN74151A, SN74LS151, SN74S151 Data Selectors/Multiplexers", SDLS054
     (Dec. 1972, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls151.pdf. Verified: terminal
     assignment (D/N 16-pin package, top view) + function table, pages 1-2, read
     as rendered PDF page images (issues.md C4). All 16 pins, the A=LSB..C=MSB
     select order, Y=true / W=complement, and the active-LOW strobe G# (HIGH
     forces Y=LOW, W=HIGH) were confirmed against the datasheet; pinout[], gates[]
     and the MUX_8TO1 evaluator matched it and were left unchanged.
     Multiplexer / data-selector concept: Wikipedia contributors, "Multiplexer".
     [Online]. Available: https://en.wikipedia.org/wiki/Multiplexer */
  '74x151': {
    name: '74x151',
    simpleName: '8-to-1 Multiplexer',
    description: '8-to-1 data selector/multiplexer with complementary outputs. (16-pin)',
    guideOverview: 'The 74x151 is an 8-to-1 multiplexer, also called a data selector. Eight data inputs (D0-D7) go in, and a 3-bit address (A, B, C) picks exactly one of them to pass to the output. It behaves like an 8-position rotary switch whose knob is set by a binary number instead of by hand. The selected input shows up on Y, and W always carries the inverse of Y, so you get both polarities at once. A strobe pin, G#, enables the chip: hold it LOW to run, take it HIGH to switch the chip off, which forces Y LOW and W HIGH no matter what the data inputs do. Address bit A is the least significant and C the most significant, so the address counts 0 through 7 to reach D0 through D7.',
    guidePinDescriptions: {
      'D0':  'Data input 0. Reaches the output when the address C,B,A = 0,0,0.',
      'D1':  'Data input 1. Selected when C,B,A = 0,0,1.',
      'D2':  'Data input 2. Selected when C,B,A = 0,1,0.',
      'D3':  'Data input 3. Selected when C,B,A = 0,1,1.',
      'D4':  'Data input 4. Selected when C,B,A = 1,0,0.',
      'D5':  'Data input 5. Selected when C,B,A = 1,0,1.',
      'D6':  'Data input 6. Selected when C,B,A = 1,1,0.',
      'D7':  'Data input 7. Selected when C,B,A = 1,1,1.',
      'A':   'Address bit 0 (least significant).',
      'B':   'Address bit 1.',
      'C':   'Address bit 2 (most significant).',
      'Y':   'True output. Equals the selected data input while G# is LOW.',
      'W':   'Complementary output, always the inverse of Y.',
      'G':   'Strobe/enable, active LOW. LOW runs the chip; HIGH forces Y LOW and W HIGH.',
      'GND': 'Ground reference (pin 8).',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How the selection works',
        paragraphs: [
          'The three address pins form a binary number, C,B,A, with A as the ones place. That number, 0 through 7, decides which data input is connected to the output. Only one input is passed through at a time; the other seven are ignored.',
          'The strobe G# has to be LOW for any of this to happen. While G# is LOW the chip watches the selected input continuously, so if that input changes, Y changes with it. Take G# HIGH and the chip stops looking at the data: Y is held LOW and W is held HIGH regardless of the inputs.',
        ],
        formulas: [
          'G#=1 → Y=0, W=1 (chip disabled)',
          'C,B,A=000 → Y=D0 | 001 → Y=D1 | 010 → Y=D2 | 011 → Y=D3',
          'C,B,A=100 → Y=D4 | 101 → Y=D5 | 110 → Y=D6 | 111 → Y=D7',
          'W = NOT(Y) in every enabled case',
        ],
      },
      {
        title: 'As a Boolean function generator',
        paragraphs: [
          'Any logic function of three variables can be built with one 74x151 and no extra gates. Wire the three variables to A, B, and C. Then, for each of the eight address combinations, tie the matching data pin to 1 or 0 to match the truth table you want. As the address steps through all eight rows, Y outputs the value you wired for that row.',
          'This turns a truth table straight into hardware. And because W is the inverse of Y for free, you get the complemented function at the same time.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Routing one of several signal sources onto a single line (data selection).',
          'Parallel-to-serial conversion: put eight bits on D0-D7, then sweep the address 0 to 7 with a counter and Y sends them out one at a time.',
          'Implementing any 3-variable Boolean function from a single package.',
          'Reading one of eight switches or sensors under the control of a 3-bit address.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'G# is active LOW. Leave it floating or HIGH and the outputs sit stuck (Y LOW, W HIGH), which looks like a dead chip.',
          'A is the least significant address bit and C the most significant. Swap them and you select the wrong input.',
          'Y is the true output; W is its inverse. Pick the pin whose polarity you need instead of assuming.',
          'Tie unused data inputs to a fixed level (usually ground) rather than leaving them floating.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls151.pdf',
    tags: ['multiplexer', 'mux', '8-to-1', 'data selector', 'complementary output'],
    pinout: [
      { pin: 1,  name: 'D3',  type: 'input',  description: 'Data input 3' },
      { pin: 2,  name: 'D2',  type: 'input',  description: 'Data input 2' },
      { pin: 3,  name: 'D1',  type: 'input',  description: 'Data input 1' },
      { pin: 4,  name: 'D0',  type: 'input',  description: 'Data input 0' },
      { pin: 5,  name: 'Y',   type: 'output', description: 'True output equals selected data input when enabled' },
      { pin: 6,  name: 'W',   type: 'output', description: 'Complementary output W = NOT(Y)' },
      { pin: 7,  name: 'G',   type: 'input',  description: 'Enable (active LOW); HIGH forces Y=0, W=1' },
      { pin: 8,  name: 'GND', type: 'power',  description: 'Ground (0V)' },
      { pin: 9,  name: 'C',   type: 'input',  description: 'Address select bit 2 (MSB)' },
      { pin: 10, name: 'B',   type: 'input',  description: 'Address select bit 1' },
      { pin: 11, name: 'A',   type: 'input',  description: 'Address select bit 0 (LSB)' },
      { pin: 12, name: 'D7',  type: 'input',  description: 'Data input 7' },
      { pin: 13, name: 'D6',  type: 'input',  description: 'Data input 6' },
      { pin: 14, name: 'D5',  type: 'input',  description: 'Data input 5' },
      { pin: 15, name: 'D4',  type: 'input',  description: 'Data input 4' },
      { pin: 16, name: 'VCC', type: 'power',  description: 'Positive supply (+5V)' },
    ],
    gates: [
      {
        type: 'MUX_8TO1',
        inputs: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'A', 'B', 'C', 'G'],
        outputs: ['Y', 'W'],
      },
    ],
  },

  // ── 74153: Dual 4-to-1 Multiplexer ─────────────────────────────────────
  /* Primary source: Texas Instruments, "SN54153, SN54LS153, SN54S153, SN74153,
     SN74LS153, SN74S153 Dual 4-Line to 1-Line Data Selectors/Multiplexers",
     SDLS055A (Dec. 1972, rev. May 2007). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls153.pdf. Verified: terminal
     assignment (top-view pinout), function table, and positive-logic diagram on
     page 1, read as rendered PDF page images (issues.md C4 — not a text
     summarizer). Confirmed pin map, select order (B=MSB, A=LSB), active-LOW
     strobes (1G/2G), and non-inverting totem-pole outputs against the function
     table. Datasheet states A and B are common to both sections and each section
     has a separate strobe "provided for cascading".
     Multiplexer / Boolean-function-generator concept: Wikipedia contributors,
     "Multiplexer," https://en.wikipedia.org/wiki/Multiplexer */
  '74x153': {
    name: '74x153',
    simpleName: 'Dual 4-to-1 Mux',
    description: 'Dual 4-to-1 mux sharing one pair of select lines. (16-pin)',
    guideOverview: 'The 74x153 puts two separate 4-to-1 multiplexers in one 16-pin chip. A multiplexer is a digital switch: it picks one of several inputs and copies it to a single output. Each section here chooses one of its four data inputs (C0-C3) and passes it to its output (1Y or 2Y). Both sections share the same two select lines, A and B, so they always point at the same numbered input at once — handy for switching a signal that is two bits wide in a single move. Each section keeps its own active-LOW strobe (1G# and 2G#) to force its output LOW, so you can enable one half, park the other, or gang several chips into a bigger multiplexer. The output follows the selected input directly (non-inverting); the 74x253 is the three-state version and the 74x352/74x353 give the inverted output.',
    guidePinDescriptions: {
      '1G':  'Strobe (enable) for section 1, active LOW. LOW lets section 1 pass data; HIGH forces 1Y LOW no matter what.',
      'B':   'Select bit B, the high bit of the 2-bit address. Shared by both sections.',
      '1C3': 'Section 1 data input 3. Reaches 1Y when B,A = 1,1.',
      '1C2': 'Section 1 data input 2. Reaches 1Y when B,A = 1,0.',
      '1C1': 'Section 1 data input 1. Reaches 1Y when B,A = 0,1.',
      '1C0': 'Section 1 data input 0. Reaches 1Y when B,A = 0,0.',
      '1Y':  'Section 1 output. Copies the selected section-1 data input while 1G# is LOW.',
      'GND': 'Ground, 0 V (pin 8).',
      '2Y':  'Section 2 output. Copies the selected section-2 data input while 2G# is LOW.',
      '2C0': 'Section 2 data input 0. Reaches 2Y when B,A = 0,0.',
      '2C1': 'Section 2 data input 1. Reaches 2Y when B,A = 0,1.',
      '2C2': 'Section 2 data input 2. Reaches 2Y when B,A = 1,0.',
      '2C3': 'Section 2 data input 3. Reaches 2Y when B,A = 1,1.',
      'A':   'Select bit A, the low bit of the 2-bit address. Shared by both sections.',
      '2G':  'Strobe (enable) for section 2, active LOW. LOW lets section 2 pass data; HIGH forces 2Y LOW.',
      'VCC': 'Positive supply, +5 V (pin 16).',
    },
    guideSections: [
      {
        title: 'Two 4-to-1 muxes in one package',
        paragraphs: [
          'Each half of the 74x153 is a 4-to-1 multiplexer: it reads a 2-bit address on the select lines and connects exactly one of its four data inputs (C0-C3) to its output. Address 0 picks C0, address 1 picks C1, and so on. B is the high bit of the address and A is the low bit.',
          'The output is non-inverting: whatever logic level sits on the selected input appears on the output. There is no separate inverted-output pin on this part. When a section is disabled by its strobe, its output goes LOW.',
        ],
        formulas: [
          'B=0, A=0 → Y = C0',
          'B=0, A=1 → Y = C1',
          'B=1, A=0 → Y = C2',
          'B=1, A=1 → Y = C3',
          'Strobe G# = HIGH → Y = 0 (section disabled)',
        ],
      },
      {
        title: 'Shared select, separate strobes',
        paragraphs: [
          'The two sections do not have their own address pins — they share A and B. Change the address and both outputs jump to their matching input at the same time. That is exactly what you want for switching a signal that is two bits wide, such as routing one of two 2-bit buses through the chip with a single select bit.',
          'What each section keeps separate is its strobe. 1G# controls section 1 and 2G# controls section 2, both active LOW. Pull a strobe HIGH and that section holds its output LOW no matter what the address or data does; pull it LOW and the section passes data normally. Independent strobes let you enable one section while parking the other, or wire several 153s together so their outputs feed a wider multiplexer.',
        ],
      },
      {
        title: 'As a Boolean function generator',
        paragraphs: [
          'Because a mux outputs whatever you wired to the selected input, one section can compute any logic function of two variables. Feed the two variables into A and B, then tie each of the four data inputs (C0-C3) to the 0 or 1 you want for that row of the truth table. As A and B step through all four combinations, the output plays back the function you wired.',
          'With two sections sharing the same A and B, you get two independent 2-variable functions of the same inputs at once — for example, the sum and carry of a 1-bit add built from the same two variables.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Switching a 2-bit-wide signal: route one of two 2-bit sources to a 2-bit destination using one select bit.',
          'Selecting one of four sources on each of two lines that share the same address.',
          'Building any two 2-variable Boolean functions from a single package.',
          'Cascading through the strobe inputs to form wider multiplexers (8-to-1 and up).',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'The strobes are active LOW. Leave 1G# or 2G# floating or HIGH and that output sits stuck at LOW, which looks like a dead chip. Tie a strobe you are not switching to ground.',
          'A is the low address bit and B is the high bit. Swap them and you select the wrong input (C1 and C2 trade places).',
          'Both sections share A and B — you cannot address them separately. If you need two muxes with independent selects, use two single 4-to-1 parts.',
          'The outputs are ordinary totem-pole (push-pull) outputs, not open-collector and not three-state, so do not tie two outputs together to share a bus. For a three-state version meant for bus sharing, use the 74x253.',
          'Tie unused data inputs to a fixed level (usually ground) instead of leaving them floating.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls153.pdf',
    tags: ['multiplexer', 'mux', '4-to-1', 'data selector', 'dual'],
    pinout: [
      { pin: 1, name: '1G', type: 'input' },
      { pin: 2, name: 'B', type: 'input' },
      { pin: 3, name: '1C3', type: 'input' },
      { pin: 4, name: '1C2', type: 'input' },
      { pin: 5, name: '1C1', type: 'input' },
      { pin: 6, name: '1C0', type: 'input' },
      { pin: 7, name: '1Y', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: '2Y', type: 'output' },
      { pin: 10, name: '2C0', type: 'input' },
      { pin: 11, name: '2C1', type: 'input' },
      { pin: 12, name: '2C2', type: 'input' },
      { pin: 13, name: '2C3', type: 'input' },
      { pin: 14, name: 'A', type: 'input' },
      { pin: 15, name: '2G', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'MUX_4TO1', inputs: ['1C0', '1C1', '1C2', '1C3', 'A', 'B', '1G'], output: '1Y' },
      { type: 'MUX_4TO1', inputs: ['2C0', '2C1', '2C2', '2C3', 'A', 'B', '2G'], output: '2Y' },
    ],
  },

  // ── 74154: 4-to-16 Decoder / Demultiplexer ─────────────────────────────
  /* Source: Texas Instruments, "SN54154, SN74154 4-Line to 16-Line
       Decoders/Demultiplexers," SDLS056 (Dec. 1972, rev. Mar. 1988). [Online].
       Available: https://www.ti.com/lit/ds/symlink/sn74154.pdf. Verified: terminal
       assignment (N package, DIP-24, top view) + FUNCTION TABLE, pages 1-2, read as
       rendered PDF page images (issues.md C4). The function table confirms A is the LSB
       and D the MSB, outputs Y0..Y15 are ACTIVE LOW, and the part decodes ONLY when BOTH
       strobes G1# and G2# are LOW (either one HIGH forces every output HIGH). Outputs are
       totem-pole (push-pull), high fan-out -- schematic "TYPICAL OF ALL OUTPUTS," page 2 --
       not open-collector or 3-state. Every pin number and behavioral claim below traces to
       this source. Engine (pinout[], gates[], DECODER_4TO16 in js/specificChipsSim.js)
       verified correct against the function table; unchanged.
     URL note (issues.md C4-adjacent): the entry originally linked TI's
       'symlink/sn74ls154.pdf', which now hard-404s (TI purged the discontinued 'LS154).
       The plain 'sn74154.pdf' above is the same SDLS056 family document and still resolves
       in a browser; ti.com serves an anti-bot interstitial to non-browser fetches, so
       SDLS056 was actually read from a public mirror (https://susta.cz/fel/74/pdf/sn_74154.pdf).
     Corroborating second source (identical pinout + function, CMOS variant):
       STMicroelectronics, "M74HC154 4 to 16 Line Decoder/Demultiplexer" (Apr. 2003).
       [Online]. Available (mirror): https://www.calstatela.edu/sites/default/files/74154.pdf.
       Verified page 1 (PDF image): same map A(23) B(22) C(21) D(20) G1#(18) G2#(19), same
       active-LOW-select behavior with both strobes LOW.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x154': {
    name: '74x154',
    simpleName: '4-to-16 Decoder',
    description: '4-to-16 decoder/demux, active-LOW outputs, two strobes. (24-pin)',
    guideOverview: 'The 74x154 turns a 4 bit binary code into sixteen separate output lines. The four address inputs A (LSB), B, C, and D (MSB) name a number from 0 to 15, and the matching output (Y0 to Y15) goes LOW while the other fifteen stay HIGH. The outputs are active LOW, which trips up anyone expecting the selected line to go HIGH. Two enable inputs, called strobes and both active LOW, gate the whole chip: G1 and G2 must both be LOW before any output can turn on, and if either is HIGH every output stays HIGH. Those two strobes are also what make the part flexible, feed a data signal into one of them and the chip becomes a 1 line to 16 line demultiplexer, routing that data to whichever output the address picks. In a wide 24-pin package it is the bigger cousin of the 3 to 8 line 74x138, and the usual job is the same: address decoding, producing one chip-select or strobe line per code for memory or peripherals, but with a full 4 bit address.',
    guidePinDescriptions: {
      'Y0':  'Active LOW output for code 0 (DCBA=0000). LOW only when selected and both strobes are LOW.',
      'Y1':  'Active LOW output for code 1 (DCBA=0001).',
      'Y2':  'Active LOW output for code 2 (DCBA=0010).',
      'Y3':  'Active LOW output for code 3 (DCBA=0011).',
      'Y4':  'Active LOW output for code 4 (DCBA=0100).',
      'Y5':  'Active LOW output for code 5 (DCBA=0101).',
      'Y6':  'Active LOW output for code 6 (DCBA=0110).',
      'Y7':  'Active LOW output for code 7 (DCBA=0111).',
      'Y8':  'Active LOW output for code 8 (DCBA=1000).',
      'Y9':  'Active LOW output for code 9 (DCBA=1001).',
      'Y10': 'Active LOW output for code 10 (DCBA=1010).',
      'GND': 'Ground reference (pin 12).',
      'Y11': 'Active LOW output for code 11 (DCBA=1011).',
      'Y12': 'Active LOW output for code 12 (DCBA=1100).',
      'Y13': 'Active LOW output for code 13 (DCBA=1101).',
      'Y14': 'Active LOW output for code 14 (DCBA=1110).',
      'Y15': 'Active LOW output for code 15 (DCBA=1111).',
      'G1':  'Strobe 1, active LOW. Both G1 and G2 must be LOW to enable the outputs; if either is HIGH all outputs stay HIGH. Doubles as a data input when the chip is used as a demultiplexer.',
      'G2':  'Strobe 2, active LOW. Both G1 and G2 must be LOW to enable the outputs; if either is HIGH all outputs stay HIGH.',
      'D':   'Address input, most significant bit (weight 8).',
      'C':   'Address input (weight 4).',
      'B':   'Address input (weight 2).',
      'A':   'Address input, least significant bit (weight 1).',
      'VCC': 'Positive supply (+5 V) at pin 24.',
    },
    guideSections: [
      {
        title: 'How 4 to 16 Decoding Works',
        paragraphs: [
          'The four address inputs A, B, C, and D form a 4 bit binary number, with A as the least significant bit and D as the most significant. That number, 0 through 15, picks which one of the sixteen outputs (Y0 through Y15) turns on. The chip decodes a 4 bit code into sixteen separate lines, one line per code.',
          'The outputs are active LOW: the chosen line goes LOW while the other fifteen stay HIGH. This is the opposite of what many people first expect. It is convenient because most memory and peripheral chips are switched on by a LOW, so a 74x154 output can drive one of those chip-select pins directly, with no inverter.',
        ],
        formulas: [
          'selected output index = A + 2*B + 4*C + 8*D',
        ],
      },
      {
        title: 'The Two Active LOW Strobes',
        paragraphs: [
          'Before any output can go LOW, both strobe inputs G1 and G2 must be LOW at the same time. If either one is HIGH, every output stays HIGH no matter what the address says. The datasheet calls these the strobe inputs; treat them as a master enable split across two pins.',
          'For a decoder that is always on, tie both G1 and G2 to GND. A floating or HIGH strobe is the most common reason a 74x154 looks dead: all sixteen outputs sit HIGH and nothing responds to the address. Note both strobes are active LOW, so unlike the 74x138 there is no active-HIGH enable to worry about here.',
        ],
      },
      {
        title: 'Function Table',
        paragraphs: [
          'The chip is enabled only when both strobes are LOW. Once enabled, the 4 bit code DCBA picks the single output that goes LOW. All sixteen codes work the same way, so only the pattern is shown.',
        ],
        formulas: [
          'G1=1 or G2=1        -> all outputs HIGH (disabled)',
          'enabled, DCBA=0000  -> Y0 LOW, rest HIGH',
          'enabled, DCBA=0001  -> Y1 LOW, rest HIGH',
          'enabled, DCBA=0010  -> Y2 LOW, rest HIGH',
          '   ... one output LOW per code, counting up in order ...',
          'enabled, DCBA=1110  -> Y14 LOW, rest HIGH',
          'enabled, DCBA=1111  -> Y15 LOW, rest HIGH',
        ],
        note: '"Enabled" means G1=LOW and G2=LOW at the same time. Exactly one output is LOW when enabled; they are never all LOW at once.',
      },
      {
        title: 'Using It as a Demultiplexer',
        paragraphs: [
          'A decoder becomes a demultiplexer (demux) when you feed a data signal into a strobe pin instead of a fixed level. The address inputs then steer that data to one output while the rest stay HIGH.',
          'Put your data on G1 and hold G2 LOW. When the data is LOW the addressed output follows it and goes LOW; when the data is HIGH all outputs are HIGH. A, B, C, and D choose which of the sixteen lines the data comes out on. That gives a 1 line to 16 line demux from a single chip, with the data appearing active LOW to match the outputs.',
        ],
      },
      {
        title: 'Cascading for Bigger Decoders',
        paragraphs: [
          'You can stack 74x154s to decode more address bits. Two of them make a 5 to 32 line decoder: feed the low four address bits (A to D) to both chips, then use the fifth bit to enable exactly one chip at a time.',
          'Because both strobes are active LOW, the fifth bit cannot enable one chip and disable the other on its own. You need one inverter, driving one chip\'s strobe from the bit and the other chip\'s strobe from its inverse. The 74x138 avoids that by also having an active-HIGH enable; the 74x154 does not.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Address decoding: turning four address bits into individual chip-select lines for memory banks or I/O devices.',
          '1 of 16 demultiplexing: routing a single data or clock line to one of sixteen destinations.',
          'Scanning one line at a time: driving the rows or columns of a 16-way LED display or keypad, since only one output is ever LOW.',
          'Generating up to sixteen mutually exclusive control or strobe signals from a 4 bit code.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'Outputs are active LOW: the selected line is the one that goes LOW, not HIGH.',
          'Both strobes must be LOW or the whole chip is off and every output stays HIGH. Tie unused strobes to GND rather than leaving them floating.',
          'Only one output is ever active, and only while the chip is enabled. The outputs are never all LOW at once.',
          'The output pins are split around GND: Y0 to Y10 run down pins 1 to 11, then Y11 to Y15 continue on pins 13 to 17 after GND at pin 12. It is easy to miswire if you assume the outputs run straight through.',
          'This is a 24-pin chip, wider than most 74-series parts. The address inputs sit at the VCC end (A at pin 23 down to D at pin 20), not next to the outputs.',
        ],
        note: 'Real gates are not instant: a change takes a short time to travel from input to output, very roughly 20 to 25 ns on the original bipolar 74154 and around 16 ns on the CMOS 74HC154. The simulator treats this delay as zero, a simplification that does not reproduce the brief timing glitches real propagation delay can cause.',
      },
    ],
    pins: 24,
    vcc: 24,
    gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74154.pdf',
    tags: ['decoder', 'demultiplexer', 'demux', '4-to-16', '1-of-16', 'active low', 'address decode', '74154', '74hc154', '74ls154'],
    pinout: [
      { pin: 1, name: 'Y0', type: 'output' },
      { pin: 2, name: 'Y1', type: 'output' },
      { pin: 3, name: 'Y2', type: 'output' },
      { pin: 4, name: 'Y3', type: 'output' },
      { pin: 5, name: 'Y4', type: 'output' },
      { pin: 6, name: 'Y5', type: 'output' },
      { pin: 7, name: 'Y6', type: 'output' },
      { pin: 8, name: 'Y7', type: 'output' },
      { pin: 9, name: 'Y8', type: 'output' },
      { pin: 10, name: 'Y9', type: 'output' },
      { pin: 11, name: 'Y10', type: 'output' },
      { pin: 12, name: 'GND', type: 'power' },
      { pin: 13, name: 'Y11', type: 'output' },
      { pin: 14, name: 'Y12', type: 'output' },
      { pin: 15, name: 'Y13', type: 'output' },
      { pin: 16, name: 'Y14', type: 'output' },
      { pin: 17, name: 'Y15', type: 'output' },
      { pin: 18, name: 'G1', type: 'input' },
      { pin: 19, name: 'G2', type: 'input' },
      { pin: 20, name: 'D', type: 'input' },
      { pin: 21, name: 'C', type: 'input' },
      { pin: 22, name: 'B', type: 'input' },
      { pin: 23, name: 'A', type: 'input' },
      { pin: 24, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'DECODER_4TO16',
        inputs: ['A', 'B', 'C', 'D', 'G1', 'G2'],
        outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10','Y11','Y12','Y13','Y14','Y15'],
      },
    ],
  },

  // ── 74157: Quadruple 2-line-to-1-line Data Selector/Multiplexer ─────────
  /* Source: Texas Instruments, "SN54157, SN54LS157, ... SN74157, SN74LS157, SN74S157
       Quadruple 2-Line to 1-Line Data Selectors/Multiplexers," SDLS058 (March 1974,
       rev. March 1988). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls157.pdf. Verified: terminal assignment
       (N package, DIP-16) + function table, page 1, read as rendered PDF page images
       (issues.md C4). The non-inverting '157 has true totem-pole (push-pull) outputs,
       not open-collector or 3-state — schematic "TYPICAL OF ALL OUTPUTS," page 2. All
       pin numbers and the SELECT/STROBE polarity below trace to this source. Engine
       (pinout, gates, MUX_2TO1) verified correct against the function table; unchanged.
     Multiplexer concept: Wikipedia contributors, "Multiplexer,"
       https://en.wikipedia.org/wiki/Multiplexer. */
  '74x157': {
    name: '74x157',
    simpleName: 'Quad 2-to-1 Multiplexer',
    description: 'Quad 2-to-1 non-inverting mux, one select, active-LOW enable. (16-pin)',
    guideOverview: 'The 74x157 contains four 2-to-1 multiplexers in one 16-pin chip. Each section has two data inputs (A and B) and one output (Y). A single select input (S) is shared by all four sections: when S is LOW every output follows its A input, when S is HIGH every output follows its B input. A shared active LOW enable (En#) forces all four outputs LOW while it is HIGH. Because one select line moves all four sections together, the usual job is choosing between two 4 bit sources and passing the winner on a classic use is multiplexing the row and column address of a memory chip onto one set of pins.',
    guidePinDescriptions: {
      'S':   'Select input, shared by all four sections (the datasheet marks this pin A/B, or SELECT). LOW routes the A inputs to the outputs; HIGH routes the B inputs.',
      '1A':  'Section 1 data input A. Reaches 1Y when S is LOW.',
      '1B':  'Section 1 data input B. Reaches 1Y when S is HIGH.',
      '1Y':  'Section 1 output. Equals 1A when S is LOW, 1B when S is HIGH, and LOW whenever En# is HIGH.',
      '2A':  'Section 2 data input A.',
      '2B':  'Section 2 data input B.',
      '2Y':  'Section 2 output. Same rule as 1Y, applied to section 2.',
      'GND': 'Ground, 0 V (pin 8).',
      '3Y':  'Section 3 output. Same rule as 1Y, applied to section 3.',
      '3B':  'Section 3 data input B.',
      '3A':  'Section 3 data input A.',
      '4Y':  'Section 4 output. Same rule as 1Y, applied to section 4.',
      '4B':  'Section 4 data input B.',
      '4A':  'Section 4 data input A.',
      'En':  'Output enable, active LOW (the datasheet calls it STROBE). LOW lets the outputs pass data; HIGH forces all four outputs LOW.',
      'VCC': 'Positive supply, +5 V (pin 16).',
    },
    guideSections: [
      {
        title: 'How the four muxes share one control',
        paragraphs: [
          'A multiplexer is a switch that picks one of several inputs and copies it to a single output. This chip has four of those switches, but they do not each get their own select line: all four obey one shared select (S) and one shared enable (En#). You cannot send A through section 1 while sending B through section 2 whatever S and En# say applies to all four sections at once.',
          'With En# LOW (enabled), S chooses the source for every section: S=0 picks the A inputs, S=1 picks the B inputs. With En# HIGH (disabled), every output is driven LOW no matter what the data or select lines are doing. Note that disabled here means a solid LOW, not a floating or high impedance output.',
        ],
        formulas: [
          'En#=1 → 1Y=2Y=3Y=4Y=0  (disabled, outputs forced LOW)',
          'En#=0, S=0 → 1Y=1A, 2Y=2A, 3Y=3A, 4Y=4A',
          'En#=0, S=1 → 1Y=1B, 2Y=2B, 3Y=3B, 4Y=4B',
        ],
        note: 'The 157 passes data through uninverted (a true output). The simulator switches instantly; a real LS157 takes about 9 ns from a select change to a settled output.',
      },
      {
        title: 'Common Uses',
        list: [
          'Choosing between two 4 bit sources such as two registers or two buses and passing the selected one downstream.',
          'Multiplexing the row and column address of a memory chip onto one set of pins (a common DRAM trick), with S toggling between the two halves.',
          'Switching a data path between normal and test inputs under a single control line.',
          'Generating four Boolean functions of two variables where one variable (S) is shared by all four sections.',
        ],
      },
      {
        title: 'Gotchas and close relatives',
        list: [
          'Select polarity is easy to flip: S LOW selects the A inputs, S HIGH selects the B inputs.',
          'A disabled output goes LOW, not high impedance, so you cannot tie two 157 outputs together on a shared bus. For that, use the 74x257 same function, but with 3-state outputs.',
          'All four sections share S and En# there is no per-section control.',
          'The 74x158 is the inverting version (output is the complement of the selected input). The 3-state versions are the 74x257 (non inverting) and 74x258 (inverting).',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls157.pdf',
    tags: ['multiplexer', 'mux', '2-to-1', 'data selector', 'quad', 'non inverting'],
    pinout: [
      { pin: 1,  name: 'S',   type: 'input',  description: 'Select input: S=0 → Y=A; S=1 → Y=B' },
      { pin: 2,  name: '1A',  type: 'input',  description: 'Section 1 data input A' },
      { pin: 3,  name: '1B',  type: 'input',  description: 'Section 1 data input B' },
      { pin: 4,  name: '1Y',  type: 'output', description: 'Section 1 output' },
      { pin: 5,  name: '2A',  type: 'input',  description: 'Section 2 data input A' },
      { pin: 6,  name: '2B',  type: 'input',  description: 'Section 2 data input B' },
      { pin: 7,  name: '2Y',  type: 'output', description: 'Section 2 output' },
      { pin: 8,  name: 'GND', type: 'power',  description: 'Ground (0V)' },
      { pin: 9,  name: '3Y',  type: 'output', description: 'Section 3 output' },
      { pin: 10, name: '3B',  type: 'input',  description: 'Section 3 data input B' },
      { pin: 11, name: '3A',  type: 'input',  description: 'Section 3 data input A' },
      { pin: 12, name: '4Y',  type: 'output', description: 'Section 4 output' },
      { pin: 13, name: '4B',  type: 'input',  description: 'Section 4 data input B' },
      { pin: 14, name: '4A',  type: 'input',  description: 'Section 4 data input A' },
      { pin: 15, name: 'En',  type: 'input',  description: 'Output enable (active LOW); HIGH forces all outputs LOW' },
      { pin: 16, name: 'VCC', type: 'power',  description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'MUX_2TO1', inputs: ['1A', '1B', 'S', 'En'], output: '1Y' },
      { type: 'MUX_2TO1', inputs: ['2A', '2B', 'S', 'En'], output: '2Y' },
      { type: 'MUX_2TO1', inputs: ['3A', '3B', 'S', 'En'], output: '3Y' },
      { type: 'MUX_2TO1', inputs: ['4A', '4B', 'S', 'En'], output: '4Y' },
    ],
  },

  // ── 74160: Synchronous 4 bit Decade (BCD) Counter, asynchronous clear ──────
  /* Source: Texas Instruments, "SN54160 thru SN54163, SN54LS160A thru SN54LS163A,
       SN54S162, SN54S163, SN74160 thru SN74163, SN74LS160A thru SN74LS163A,
       SN74S162, SN74S163 Synchronous 4-Bit Counters", doc. SDLS060, Oct. 1976
       (rev. Mar. 1988). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls161a.pdf
       Verified: 16-pin DIP terminal assignment (p.1, TOP VIEW, D/N package —
       CLR=1, CLK=2, A=3, B=4, C=5, D=6, ENP=7, GND=8, LOAD=9, ENT=10, QD=11,
       QC=12, QB=13, QA=14, RCO=15, VCC=16) and the '160 function description +
       ANSI/IEEE logic symbol (CTRDIV10, 3CT=9 → RCO; direct/asynchronous clear;
       synchronous load), pp.1-3, read as 300-dpi PDF page images (not a text
       summary — cf. issues.md C4).
     Note: the dedicated sn74ls160a.pdf symlink 404s (the part is folded into this
       combined family datasheet); the '161 entry cites the same SDLS060 doc.
     Notable, per the datasheet: the '160 is a DECADE counter (divide-by-10, BCD
       0-9), so RCO fires at count 9, not 15; its clear is ASYNCHRONOUS (immediate,
       ignores the clock), unlike the synchronous clear on the '162; load is
       synchronous; both ENP and ENT must be HIGH to count and only ENT gates RCO;
       counting spikes may appear on RCO (p.1), so RCO is meant to drive an enable
       input, not a clock.
     Concept reference: Wikipedia, "Counter (digital)". [Online]. Available:
       https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x160': {
    name: '74x160',
    simpleName: 'Sync Decade Counter',
    description: 'Synchronous 4 bit decade (BCD) counter with asynchronous clear (16-pin)',
    guideOverview: 'The 74x160 is a 4 bit decade counter: it counts in BCD, 0 through 9, then rolls straight back to 0 instead of carrying on to 15. On each rising clock edge, if both count enables (ENP and ENT) are HIGH, the count goes up by one. All four flip flops share one clock, so the outputs change together (synchronous) rather than rippling one after another. You can preset it: hold LOAD LOW and the value on A D is copied in on the next clock edge. Its clear is asynchronous: it forces every output to 0 the instant CLR goes LOW, without waiting for the clock. Reach for the 160 when you want one decimal digit per chip: BCD clocks and timers, divide by 10 frequency dividers, or any counter you read out in base 10. Pick the 74x161 instead for a full 0 to 15 binary count, or the 74x162 if you need the clear to wait for the clock edge.',
    guidePinDescriptions: {
      'CLR':  'Clear, active LOW. Asynchronous: drive it LOW and all four outputs go to 0 immediately, without waiting for the clock.',
      'CLK':  'Clock input. Counting, loading, and holding all happen on the rising (LOW to HIGH) edge.',
      'A':    'Parallel data input, bit 0 (LSB). Copied to QA when LOAD is LOW on a rising clock edge.',
      'B':    'Parallel data input, bit 1. Copied to QB on a synchronous load.',
      'C':    'Parallel data input, bit 2. Copied to QC on a synchronous load.',
      'D':    'Parallel data input, bit 3 (MSB). Copied to QD on a synchronous load.',
      'ENP':  'Count enable P. Both ENP and ENT must be HIGH to count; LOW here freezes the count.',
      'GND':  'Ground reference (pin 8).',
      'LOAD': 'Load, active LOW. Synchronous: with LOAD LOW, the A D inputs are loaded on the next rising clock edge (this overrides counting).',
      'ENT':  'Count enable T. Must be HIGH (with ENP) to count. Also gates RCO the carry output only goes HIGH when ENT is HIGH.',
      'QD':   'Count output, bit 3 (MSB, weight 8).',
      'QC':   'Count output, bit 2 (weight 4).',
      'QB':   'Count output, bit 1 (weight 2).',
      'QA':   'Count output, bit 0 (LSB, weight 1).',
      'RCO':  'Ripple carry output. HIGH for one count when the count reaches 9 (the top of the decade) and ENT is HIGH. Feed it to the enables of the next stage to cascade in decades.',
      'VCC':  'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Synchronous decade counting (0 to 9)',
        paragraphs: [
          'All four flip flops share one clock, so every output settles on the same edge. That is what synchronous means, and it avoids the staggered, rippling output changes you get from a chain of divide by two stages. On each rising clock edge the count goes up by one, from 0 (0000) up to 9 (1001), then wraps back to 0. The counts 10 through 15 are skipped, and that is what makes this a decade (base 10) counter rather than a full 4 bit binary one.',
          'Read the four outputs together as one BCD digit: QA is the least significant bit (weight 1) and QD is the most significant (weight 8). Because the count never passes 9, the outputs are always a valid BCD code, which you can feed straight into a BCD to 7 segment decoder like the 74x47 to show a decimal digit.',
        ],
        formulas: [
          'Count: 0 → 1 → 2 → ... → 8 → 9 → 0   (wraps after 9, skips 10-15)',
          'QA=1, QB=2, QC=4, QD=8   (output bit weights, read as one BCD digit)',
        ],
      },
      {
        title: 'The control inputs, and what overrides what',
        paragraphs: [
          'Four inputs decide what happens on each clock edge, and they follow a priority order. CLR is asynchronous: drive it LOW and all outputs go to 0 right away, without waiting for a clock edge, so it overrides everything else. When CLR is HIGH, the chip checks LOAD on the next rising edge: LOAD LOW copies the A D inputs into the counter (a synchronous parallel load). With LOAD HIGH, the counter counts only if both ENP and ENT are HIGH; if either is LOW it simply holds its value.',
        ],
        formulas: [
          'CLR=0                                → Q = 0000 now (async, ignores clock)',
          'CLR=1, LOAD=0, rising CLK            → Q = D C B A (parallel load)',
          'CLR=1, LOAD=1, ENP=ENT=1, rising CLK → count up by 1 (wraps 9 → 0)',
          'CLR=1, LOAD=1, ENP or ENT = 0        → hold (outputs unchanged)',
        ],
        note: 'CLR and LOAD are both active LOW: the bar drawn over CLR and LOAD on the datasheet means they act when the pin is driven LOW.',
      },
      {
        title: 'RCO and cascading to count in decades',
        paragraphs: [
          'One 160 counts to 9. To count higher in decimal, chain several, one chip per digit. RCO (ripple carry output) goes HIGH only when the count reaches 9 and ENT is HIGH; it is a one count wide pulse that marks the rollover from 9 back to 0. Tie all the clocks together and feed the RCO of the units digit into the ENP and ENT of the tens digit. The tens stage then advances one step each time the units stage rolls over from 9 to 0, so two chips count 0 to 99, three count 0 to 999, and so on, all in decimal.',
          'There are two enables because only ENT feeds RCO. In a fast, look ahead cascade ENT carries the carry between stages while ENP acts as a single count enable for the whole chain. For learning, wiring RCO to both enables of the next stage works fine.',
        ],
        note: 'The Q outputs are glitch free, but a brief spike can appear on RCO while counting, which is why RCO is meant to drive an enable input, not a clock.',
      },
      {
        title: 'Common uses',
        list: [
          'Decimal (BCD) counting: one digit per chip, cascaded for tens, hundreds, and beyond.',
          'Digital clocks and timers, where each 0 to 9 digit drives a 7 segment display through a BCD decoder.',
          'Divide by 10 frequency division: RCO produces one pulse for every ten clock pulses.',
          'Presettable decade timers: load a starting digit, count up, and act when RCO fires.',
          'Modulo N counters below 10: decode a chosen count and feed it back to LOAD or CLR to restart the digit early.',
        ],
      },
      {
        title: 'Gotchas for beginners',
        list: [
          'It counts to 9, not 15. Wire it expecting a full 0 to 15 binary range and it will surprise you; the 160 skips 10 through 15. For a binary count use the 74x161.',
          'The clear is asynchronous. Because it does not wait for the clock, releasing CLR right at a clock edge can give an unclean count. If you need the clear aligned to the clock, use the 74x162 (the synchronous clear decade version) instead.',
          'Both ENP and ENT must be HIGH to count. Leaving one LOW quietly freezes the counter, a common wiring mistake.',
          'LOAD is synchronous: after you pull it LOW, the load happens on the next rising edge, not the instant you assert it.',
          'Preset with a valid BCD value (0 to 9). Loading a code of 10 to 15 puts the counter outside its decade; the exact recovery sequence from those illegal states is a simplification in this model, so stick to 0 to 9 when you preset.',
          'A floating input is not a defined LOW. Tie unused enables HIGH and any unused clear or load to its inactive (HIGH) level.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls161a.pdf',
    tags: ['counter', 'decade', 'synchronous', '4 bit', 'sequential'],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input' },
      { pin: 2, name: 'CLK', type: 'input' },
      { pin: 3, name: 'A', type: 'input' },
      { pin: 4, name: 'B', type: 'input' },
      { pin: 5, name: 'C', type: 'input' },
      { pin: 6, name: 'D', type: 'input' },
      { pin: 7, name: 'ENP', type: 'input' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'LOAD', type: 'input' },
      { pin: 10, name: 'ENT', type: 'input' },
      { pin: 11, name: 'QD', type: 'output' },
      { pin: 12, name: 'QC', type: 'output' },
      { pin: 13, name: 'QB', type: 'output' },
      { pin: 14, name: 'QA', type: 'output' },
      { pin: 15, name: 'RCO', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_SYNC_DECADE',
        inputs: ['CLK', 'CLR', 'LOAD', 'ENP', 'ENT', 'A', 'B', 'C', 'D'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'RCO'],
      },
    ],
    sequential: true,
  },

  // ── 74161: Synchronous 4 bit Binary Counter (asynchronous clear)──────────────
  /* Source: Texas Instruments, "SN54160 thru SN54163, SN54LS160A thru SN54LS163A,
       SN54S162, SN54S163, SN74160 thru SN74163, SN74LS160A thru SN74LS163A,
       SN74S162, SN74S163 Synchronous 4-Bit Counters", doc. SDLS060, Oct. 1976
       (rev. Mar. 1988). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls161a.pdf
       Verified: 16-pin DIP terminal assignment (p.1, TOP VIEW, N/D package) and the
       '161 logic diagram + asynchronous-clear / RCO description (pp.1,5), read as
       300-dpi PDF page images (not a text summary — cf. issues.md C4).
     Notable, per the datasheet: on the '161 the clear is ASYNCHRONOUS (immediate,
       ignores the clock), unlike the synchronous clear on the '163; both ENP and ENT
       must be HIGH to count and only ENT gates RCO; counting spikes may appear on RCO
       (p.1), so RCO is meant to drive an enable input, not a clock.
     Concept reference: Wikipedia, "Counter (digital)". [Online]. Available:
       https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x161': {
    name: '74x161',
    simpleName: 'Sync Binary Counter',
    description: 'Synchronous 4 bit binary counter with asynchronous clear (16-pin)',
    guideOverview: 'The 74x161 is a 4 bit binary counter. On each rising clock edge, if both count enables (ENP and ENT) are HIGH, it counts up by one, running 0 through 15 and then wrapping back to 0. All four flip flops share one clock, so the outputs change together (synchronous) instead of rippling one after another. You can also preset it: hold LOAD LOW and the value on A D is copied in on the next clock edge. Its clear is asynchronous: it forces every output to 0 the instant CLR goes LOW, without waiting for the clock. Reach for the 161 when you need a small presettable up counter or a clock divider; pick the 74x163 instead when you want the clear to wait for the clock edge.',
    guidePinDescriptions: {
      'CLR':  'Clear, active LOW. Asynchronous: drive it LOW and all four outputs go to 0 immediately, without waiting for the clock.',
      'CLK':  'Clock input. Counting, loading, and holding all happen on the rising (LOW to HIGH) edge.',
      'A':    'Parallel data input, bit 0 (LSB). Copied to QA when LOAD is LOW on a rising clock edge.',
      'B':    'Parallel data input, bit 1. Copied to QB on a synchronous load.',
      'C':    'Parallel data input, bit 2. Copied to QC on a synchronous load.',
      'D':    'Parallel data input, bit 3 (MSB). Copied to QD on a synchronous load.',
      'ENP':  'Count enable P. Both ENP and ENT must be HIGH to count; LOW here freezes the count.',
      'GND':  'Ground reference (pin 8).',
      'LOAD': 'Load, active LOW. Synchronous: with LOAD LOW, the A D inputs are loaded on the next rising clock edge (this overrides counting).',
      'ENT':  'Count enable T. Must be HIGH (with ENP) to count. Also gates RCO the carry output only goes HIGH when ENT is HIGH.',
      'QD':   'Count output, bit 3 (MSB, weight 8).',
      'QC':   'Count output, bit 2 (weight 4).',
      'QB':   'Count output, bit 1 (weight 2).',
      'QA':   'Count output, bit 0 (LSB, weight 1).',
      'RCO':  'Ripple carry output. HIGH for one count when the count reaches 15 and ENT is HIGH. Feed it to the enables of the next stage to cascade.',
      'VCC':  'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Synchronous binary counting (0 to 15)',
        paragraphs: [
          'All four flip flops share one clock, so every output settles on the same edge. That is what synchronous means, and it avoids the staggered, rippling output changes you get from a chain of divide by two stages. On each rising clock edge the count goes up by one, from 0 (0000) up to 15 (1111), then wraps back to 0.',
          'Read the four outputs together as a 4 bit number: QA is the least significant bit (weight 1) and QD is the most significant (weight 8).',
        ],
        formulas: [
          'Count: 0 → 1 → 2 → ... → 14 → 15 → 0  (wraps after 15)',
          'QA=1, QB=2, QC=4, QD=8   (output bit weights)',
        ],
      },
      {
        title: 'The control inputs, and what overrides what',
        paragraphs: [
          'Four inputs decide what happens on each clock edge, and they follow a priority order. CLR is asynchronous: drive it LOW and all outputs go to 0 right away, without waiting for a clock edge, so it overrides everything else. When CLR is HIGH, the chip checks LOAD on the next rising edge: LOAD LOW copies the A D inputs into the counter (a synchronous parallel load). With LOAD HIGH, the counter counts only if both ENP and ENT are HIGH; if either is LOW it simply holds its value.',
        ],
        formulas: [
          'CLR=0                                → Q = 0000 now (async, ignores clock)',
          'CLR=1, LOAD=0, rising CLK            → Q = D C B A (parallel load)',
          'CLR=1, LOAD=1, ENP=ENT=1, rising CLK → count up by 1',
          'CLR=1, LOAD=1, ENP or ENT = 0        → hold (outputs unchanged)',
        ],
        note: 'CLR and LOAD are both active LOW: the bar drawn over CLR and LOAD on the datasheet means they act when the pin is driven LOW.',
      },
      {
        title: 'RCO and cascading to count higher',
        paragraphs: [
          'One 161 counts to 15. To count higher, chain several. RCO (ripple carry output) goes HIGH only when the count reaches 15 and ENT is HIGH; it is a one count wide pulse that marks the rollover. Tie all the clocks together and feed the RCO of one stage into the ENP and ENT of the next stage. The upper stage then advances one step each time the lower stage rolls over from 15 to 0, giving 8, 12, or 16 bit counters.',
          'There are two enables because only ENT feeds RCO. In a fast, look ahead cascade ENT carries the carry between stages while ENP acts as a single count enable for the whole chain. For learning, wiring RCO to both enables of the next stage works fine.',
        ],
        note: 'The Q outputs are glitch free, but a brief spike can appear on RCO while counting, which is why RCO is meant to drive an enable input, not a clock.',
      },
      {
        title: 'Common uses',
        list: [
          'Counting events or clock pulses, 0 to 15 per chip and more when cascaded.',
          'Frequency division: QA divides the clock by 2, QB by 4, QC by 8, QD by 16.',
          'Address or sequence generators that step through a fixed range.',
          'Presettable timers: load a start value, count up, and act when RCO fires.',
          'Modulo N counters: decode a chosen count and feed it back to LOAD or CLR to restart early.',
        ],
      },
      {
        title: 'Gotchas for beginners',
        list: [
          'The clear is asynchronous. Because it does not wait for the clock, releasing CLR right at a clock edge can give an unclean count. If you need the clear aligned to the clock, use the 74x163 instead.',
          'Both ENP and ENT must be HIGH to count. Leaving one LOW quietly freezes the counter, a common wiring mistake.',
          'LOAD is synchronous: after you pull it LOW, the load happens on the next rising edge, not the instant you assert it.',
          'A floating input is not a defined LOW. Tie unused enables HIGH and any unused clear or load to its inactive (HIGH) level.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls161a.pdf',
    tags: ['counter', 'binary', 'synchronous', '4 bit', 'sequential'],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input' },
      { pin: 2, name: 'CLK', type: 'input' },
      { pin: 3, name: 'A', type: 'input' },
      { pin: 4, name: 'B', type: 'input' },
      { pin: 5, name: 'C', type: 'input' },
      { pin: 6, name: 'D', type: 'input' },
      { pin: 7, name: 'ENP', type: 'input' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'LOAD', type: 'input' },
      { pin: 10, name: 'ENT', type: 'input' },
      { pin: 11, name: 'QD', type: 'output' },
      { pin: 12, name: 'QC', type: 'output' },
      { pin: 13, name: 'QB', type: 'output' },
      { pin: 14, name: 'QA', type: 'output' },
      { pin: 15, name: 'RCO', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_SYNC_BIN',
        inputs: ['CLK', 'CLR', 'LOAD', 'ENP', 'ENT', 'A', 'B', 'C', 'D'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'RCO'],
      },
    ],
    sequential: true,
  },

  // ── 74163: Synchronous 4 bit Binary Counter (synchronous clear)──────────────
  /* Source: Texas Instruments, "SN54160 thru SN54163, SN54LS160A thru SN54LS163A,
       SN54S162, SN54S163, SN74160 thru SN74163, SN74LS160A thru SN74LS163A,
       SN74S162, SN74S163 Synchronous 4-Bit Counters", doc. SDLS060, Oct. 1976
       (rev. Mar. 1988). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls163a.pdf
       Verified: 16-pin DIP terminal assignment (p.1, TOP VIEW, N/D package) and the
       '163 CTRDIV16 logic symbol with RCO at 3CT=15 (p.2), read as 300-dpi PDF page
       images (not a text summary — cf. issues.md C4).
     Notable, per the datasheet (p.1): on the '163 the clear is SYNCHRONOUS — "a low
       level at the clear input sets all four of the flip-flop outputs low after the
       next clock pulse, regardless of the levels of the enable inputs" — so the
       count length can be set "with one external NAND gate"; the load is likewise
       synchronous; both ENP and ENT must be HIGH to count and only ENT gates RCO;
       counting spikes may appear on RCO, so RCO is meant to drive an enable input,
       not a clock. The '163/'S163/'LS163A are the 4-bit BINARY members of the family
       (the '160/'162 are the decade versions on the same pinout).
     Concept reference: Wikipedia, "Counter (digital)". [Online]. Available:
       https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x163': {
    name: '74x163',
    simpleName: 'Sync Binary Counter (sync clear)',
    description: 'Synchronous 4 bit binary counter with synchronous clear (16-pin)',
    guideOverview: 'The 74x163 is a 4 bit binary counter. On each rising clock edge, if both count enables (ENP and ENT) are HIGH, it counts up by one, running 0 through 15 and then wrapping back to 0. All four flip flops share one clock, so the outputs change together (synchronous) instead of rippling one after another. You can preset it too: hold LOAD LOW and the value on A D is copied in on the next clock edge. What sets the 163 apart from the near identical 74x161 is its clear. On the 163 the clear is synchronous: pulling CLR LOW does not reset the outputs right away, it waits for the next rising clock edge, so the reset lands cleanly on the clock like everything else the chip does. That makes the 163 the part to reach for when you want a glitch free counter that repeats over a range shorter than 0 15 (a modulo N counter). Pick the 74x161 instead when you actually want the clear to act the instant it is asserted.',
    guidePinDescriptions: {
      'CLR':  'Clear, active LOW. Synchronous: drive it LOW and all four outputs go to 0 on the NEXT rising clock edge, not immediately. It overrides load and count.',
      'CLK':  'Clock input. Counting, loading, and clearing all happen on the rising (LOW to HIGH) edge.',
      'A':    'Parallel data input, bit 0 (LSB). Copied to QA when LOAD is LOW on a rising clock edge.',
      'B':    'Parallel data input, bit 1. Copied to QB on a synchronous load.',
      'C':    'Parallel data input, bit 2. Copied to QC on a synchronous load.',
      'D':    'Parallel data input, bit 3 (MSB). Copied to QD on a synchronous load.',
      'ENP':  'Count enable P. Both ENP and ENT must be HIGH to count; LOW here freezes the count.',
      'GND':  'Ground reference (pin 8).',
      'LOAD': 'Load, active LOW. Synchronous: with LOAD LOW, the A D inputs are copied in on the next rising clock edge (this overrides counting).',
      'ENT':  'Count enable T. Must be HIGH (with ENP) to count. Also gates RCO the carry output only goes HIGH when ENT is HIGH.',
      'QD':   'Count output, bit 3 (MSB, weight 8).',
      'QC':   'Count output, bit 2 (weight 4).',
      'QB':   'Count output, bit 1 (weight 2).',
      'QA':   'Count output, bit 0 (LSB, weight 1).',
      'RCO':  'Ripple carry output. HIGH for one count when the count reaches 15 and ENT is HIGH. Feed it to the enables of the next stage to cascade.',
      'VCC':  'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Synchronous binary counting (0 to 15)',
        paragraphs: [
          'All four flip flops share one clock, so every output settles on the same edge. That is what synchronous means, and it avoids the staggered, one after another output changes you get from a chain of divide by two stages. On each rising clock edge the count goes up by one, from 0 (0000) up to 15 (1111), then wraps back to 0.',
          'Read the four outputs together as a 4 bit number: QA is the least significant bit (weight 1) and QD is the most significant (weight 8).',
        ],
        formulas: [
          'Count: 0 → 1 → 2 → ... → 14 → 15 → 0  (wraps after 15)',
          'QA=1, QB=2, QC=4, QD=8   (output bit weights)',
        ],
      },
      {
        title: 'The control inputs, and what wins on each edge',
        paragraphs: [
          'Four inputs decide what happens on each rising clock edge, and on the 163 all four act only on that edge nothing takes effect between clocks. They follow a fixed priority: CLR beats LOAD, and LOAD beats counting. So on the edge the chip checks CLR first: if CLR is LOW the outputs go to 0. If CLR is HIGH it checks LOAD: LOW copies the A D inputs into the counter (a synchronous parallel load). If both CLR and LOAD are HIGH, the counter counts only when ENP and ENT are both HIGH; if either enable is LOW it holds its value.',
        ],
        formulas: [
          'CLR=0, rising CLK                    → Q = 0000 (synchronous clear)',
          'CLR=1, LOAD=0, rising CLK            → Q = D C B A (parallel load)',
          'CLR=1, LOAD=1, ENP=ENT=1, rising CLK → count up by 1',
          'CLR=1, LOAD=1, ENP or ENT = 0        → hold (outputs unchanged)',
        ],
        note: 'CLR and LOAD are both active LOW: the bar drawn over them on the datasheet means they act when the pin is driven LOW.',
      },
      {
        title: 'Why a synchronous clear? Clean modulo N counters',
        paragraphs: [
          'Because the clear waits for the clock, it is exactly what you want when building a counter that repeats over a range shorter than 0 15. The trick: decode the last count you want to see, and feed that decode back to CLR so the chip clears on the following edge instead of counting past it.',
          'Take a decade counter (0 through 9). In the 0 9 sequence the only count where both QA and QD are HIGH is 9 (1001), so a single 2 input NAND on QA and QD goes LOW exactly at 9. Wire that to CLR. The counter then runs 0,1,...,9 and the next edge clears it straight to 0 there is never a stray 10 on the outputs, because the clear happens on the same edge that would otherwise have produced 10. The datasheet points this out: the synchronous clear lets you set the count length "with one external NAND gate."',
          'Do the same thing on a 74x161 and its clear fires the instant the decode goes true, partway through the cycle, so the count 10 flickers onto the outputs for a moment before the reset a runt glitch that can fool whatever is watching. Avoiding that glitch is the whole reason the 163 exists.',
        ],
        note: 'You can restart early with LOAD instead of CLR: feed the decode into LOAD to jump back to a preset start value rather than 0. Both are synchronous, so both land cleanly on the clock edge.',
      },
      {
        title: 'RCO and cascading to count higher',
        paragraphs: [
          'One 163 counts to 15. To count higher, chain several. RCO (ripple carry output) goes HIGH only when the count reaches 15 and ENT is HIGH; it is a one count wide pulse that marks the rollover. Tie all the clocks together and feed the RCO of one stage into the ENP and ENT of the next stage. The upper stage then advances one step each time the lower stage rolls over from 15 to 0, giving 8, 12, or 16 bit counters.',
          'There are two enables because only ENT feeds RCO. In a fast, look ahead cascade ENT carries the carry between stages while ENP acts as a single count enable for the whole chain. For learning, wiring RCO to both enables of the next stage works fine.',
        ],
        note: 'The Q outputs settle together on the clock edge, but a brief spike can appear on RCO while counting, which is why RCO is meant to drive an enable input, not a clock. The simulator models clean logic levels and ideal edges, so it does not reproduce that RCO spike or any propagation delay.',
      },
      {
        title: 'Common uses',
        list: [
          'Counting events or clock pulses, 0 to 15 per chip and more when cascaded.',
          'Frequency division: QA divides the clock by 2, QB by 4, QC by 8, QD by 16.',
          'Glitch free modulo N counters: decode a count into CLR (or LOAD) to restart the sequence exactly on a clock edge this is the 163’s strong suit.',
          'Address or sequence generators that step through a fixed range.',
          'Presettable timers: load a start value, count up, and act when RCO fires.',
        ],
      },
      {
        title: 'Gotchas for beginners',
        list: [
          'The clear is synchronous. Pulsing CLR LOW does nothing until the next rising clock edge; if you assert and release it between clocks with no edge in between, the counter never clears. This trips up people used to the 74x161’s immediate clear.',
          'Both ENP and ENT must be HIGH to count. Leaving one LOW quietly freezes the counter, a common wiring mistake.',
          'LOAD is synchronous too: after you pull it LOW, the load happens on the next rising edge, not the instant you assert it.',
          'Priority on each edge is CLR, then LOAD, then count. If CLR and LOAD are both LOW you get 0, not the loaded value CLR wins.',
          'A floating input is not a defined LOW. Tie unused enables HIGH and any unused clear or load to its inactive (HIGH) level.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls163a.pdf',
    tags: ['counter', 'binary', 'synchronous', '4 bit', 'sequential'],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input' },
      { pin: 2, name: 'CLK', type: 'input' },
      { pin: 3, name: 'A', type: 'input' },
      { pin: 4, name: 'B', type: 'input' },
      { pin: 5, name: 'C', type: 'input' },
      { pin: 6, name: 'D', type: 'input' },
      { pin: 7, name: 'ENP', type: 'input' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'LOAD', type: 'input' },
      { pin: 10, name: 'ENT', type: 'input' },
      { pin: 11, name: 'QD', type: 'output' },
      { pin: 12, name: 'QC', type: 'output' },
      { pin: 13, name: 'QB', type: 'output' },
      { pin: 14, name: 'QA', type: 'output' },
      { pin: 15, name: 'RCO', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_SYNC_BIN_SC',
        inputs: ['CLK', 'CLR', 'LOAD', 'ENP', 'ENT', 'A', 'B', 'C', 'D'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'RCO'],
      },
    ],
    sequential: true,
  },

  // ── 74164: 8-bit Serial-In Parallel-Out (SIPO) Shift Register ──────────
  /* Source: Texas Instruments, "SN54164, SN54LS164, SN74164, SN74LS164 8-Bit
       Parallel-Out Serial Shift Registers" (March 1974, revised March 1988;
       TI databook p. 2-515). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls164.pdf. Verified: terminal
       assignment (D/N package, top view), FUNCTION TABLE, positive-logic logic
       diagram, and the "typical clear, shift, and clear sequences" timing chart
       — read as rendered PDF page images, pages 1-3 (issues.md C4, never the
       text summarizer). Confirms A=1, B=2, QA=3, QB=4, QC=5, QD=6, GND=7,
       CLK=8, CLR (active LOW)=9, QE=10, QF=11, QG=12, QH=13, VCC=14; serial data
       in = A AND B; shift toward QH on the rising clock edge; asynchronous
       active-LOW clear. Pinout and behavior MATCH the pre-existing entry, so the
       engine (pinout[], gates[], SHIFT_REG_SIPO) was left untouched.
       Regression: js/debug/scenarios/74x164-sipo-shift.mjs.
     Shift-register background: Wikipedia contributors, "Shift register".
       [Online]. Available: https://en.wikipedia.org/wiki/Shift_register. */
  '74x164': {
    name: '74x164',
    simpleName: '8 bit SIPO Shift Register',
    description: '8 bit serial in, parallel out shift register. (14-pin)',
    guideOverview: 'The 74x164 turns a one-wire serial bit stream into eight parallel outputs, QA through QH. On every rising clock edge each stored bit moves one place toward QH and a new bit drops into QA, so after eight clocks the last eight bits you sent sit on the eight output pins at once. The new bit is not a single pin: it is A AND B of the two serial inputs, so both must be HIGH to shift in a 1 and a LOW on either shifts in a 0. Tie one serial input HIGH and the other becomes a plain serial-data pin. A separate clear input, active LOW and asynchronous, forces all eight outputs to 0 the instant it goes LOW, with no clock needed. There is no output latch and no output-enable, so the outputs change as you clock data in.',
    guidePinDescriptions: {
      'A': 'Serial data input A. The bit shifted in is A AND B, so a LOW here always shifts in a 0. Commonly used as the data pin with B tied HIGH.',
      'B': 'Serial data input B, ANDed with A to form the shift input. Tie HIGH to use A alone, or drive LOW to gate off (block) incoming data.',
      'QA': 'Output of the first stage. Holds the bit most recently shifted in.',
      'QB': 'Output of the second stage.',
      'QC': 'Output of the third stage.',
      'QD': 'Output of the fourth stage.',
      'GND': 'Ground reference (pin 7).',
      'CLK': 'Clock input. On each LOW-to-HIGH (rising) edge every bit shifts one place toward QH and a new bit enters at QA.',
      'CLR': 'Clear, active LOW and asynchronous. A LOW forces QA through QH to 0 immediately, with no clock edge needed. Hold HIGH to run.',
      'QE': 'Output of the fifth stage.',
      'QF': 'Output of the sixth stage.',
      'QG': 'Output of the seventh stage.',
      'QH': 'Output of the eighth (last) stage. Doubles as the serial output for cascading: wire it to a serial input of the next 164.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'How it works',
        paragraphs: [
          'Inside are eight D flip-flops in a chain. Each one feeds the next, and they all share the clock. On every rising clock edge the whole chain shifts one step: the bit in stage 1 (QA) moves to stage 2 (QB), QB moves to QC, and so on out to QH, while a fresh bit drops into QA.',
          'That fresh bit comes from an AND gate, not a single pin. The two serial inputs A and B feed the gate, and its output is what enters QA. So a 1 shifts in only when A and B are both HIGH; if either is LOW, a 0 goes in. In practice you use one input as the data line and tie the other HIGH. The spare input then works as a gate: pull it LOW for one clock and that clock loads a 0 no matter what the data line is doing.',
          'Clocking is edge-triggered on the LOW-to-HIGH transition, so the inputs only need to be steady around that edge and you can change them freely while the clock is idle. The clear input is different: it is asynchronous, meaning a LOW on it wipes all eight outputs to 0 the instant it arrives, without waiting for a clock.',
        ],
      },
      {
        title: 'Function table',
        paragraphs: [
          'CLR is active LOW. "CLK rising" means a LOW-to-HIGH edge on the clock; "X" means the input does not matter.',
        ],
        formulas: [
          'CLR=0                          → QA..QH = 0      (asynchronous clear)',
          'CLR=1, CLK steady              → outputs hold',
          'CLR=1, CLK rising, A=1 B=1     → shift toward QH, new QA = 1',
          'CLR=1, CLK rising, A=0 or B=0  → shift toward QH, new QA = 0',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Adding output pins to a microcontroller: clock a byte in over two wires (data and clock) and get eight outputs for LEDs, relays, or logic — trading pins for time.',
          'Serial-to-parallel conversion: rebuild a parallel byte from a one-wire data stream.',
          'Cascading for wider registers: wire QH of one 164 to a serial input of the next and share the clock to make 16, 24, or more bits.',
          'Sequencers and pattern generators: feed an output back to a serial input to circulate a moving 1 or a repeating bit pattern.',
        ],
      },
      {
        title: 'Gotchas for beginners',
        list: [
          'The outputs have no latch. They change on every clock while you load, so anything wired straight to QA..QH sees the bits march past. If the outputs must stay still until a full byte is in, use a part with a storage register such as the 74x595.',
          'A 1 shifts in only when A AND B are both HIGH. Leaving the unused serial input floating instead of tied HIGH lets the AND block your data, and the register just fills with zeros.',
          'CLR is active LOW, so tie it HIGH for normal operation. Floating it invites a clear on noise.',
          'The clear is asynchronous but the shift is not: data does not load just because the inputs are HIGH. Nothing moves until a rising clock edge.',
          'Watch the bit order. The first bit you clock in travels furthest and ends up at QH after eight clocks; the most recent bit sits at QA.',
        ],
      },
    ],
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls164.pdf',
    tags: ['shift register', 'serial', 'parallel', '8 bit', 'sequential', 'sipo'],
    pinout: [
      { pin: 1,  name: 'A',   type: 'input',  description: 'Serial data input A (ANDed with B; a LOW here shifts in a 0)' },
      { pin: 2,  name: 'B',   type: 'input',  description: 'Serial data input B (ANDed with A; tie HIGH to use A alone)' },
      { pin: 3,  name: 'QA',  type: 'output', description: 'First-stage output; holds the most recently shifted-in bit' },
      { pin: 4,  name: 'QB',  type: 'output', description: 'Second-stage output' },
      { pin: 5,  name: 'QC',  type: 'output', description: 'Third-stage output' },
      { pin: 6,  name: 'QD',  type: 'output', description: 'Fourth-stage output' },
      { pin: 7,  name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: 'CLK', type: 'input',  description: 'Clock input; shifts one place toward QH on the rising edge' },
      { pin: 9,  name: 'CLR', type: 'input',  description: 'Asynchronous clear (active LOW); a LOW resets all outputs to 0 immediately' },
      { pin: 10, name: 'QE',  type: 'output', description: 'Fifth-stage output' },
      { pin: 11, name: 'QF',  type: 'output', description: 'Sixth-stage output' },
      { pin: 12, name: 'QG',  type: 'output', description: 'Seventh-stage output' },
      { pin: 13, name: 'QH',  type: 'output', description: 'Eighth (last) stage output; also the serial output when cascading' },
      { pin: 14, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      {
        type: 'SHIFT_REG_SIPO',
        inputs: ['A', 'B', 'CLK', 'CLR'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH'],
      },
    ],
    sequential: true,
  },

  // ── 74165: 8 bit Parallel in Serial out Shift Register ─────────────────
  /* Source: Texas Instruments, "SN54165, SN54LS165A, SN74165, SN74LS165A
       Parallel-Load 8-Bit Shift Registers," SDLS062D (Oct. 1976, rev. Feb.
       2002). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls165a.pdf. Verified: N-package
       TERMINAL ASSIGNMENT (top view, page 1), FUNCTION TABLE (page 2), and the
       positive-logic LOGIC DIAGRAM + typical shift/load/inhibit timing (page 4),
       all read as rendered 300-dpi PDF page images (issues.md C4), NOT a WebFetch
       summary.
     Verified DIP-16 map: 1 = SH/LD-bar (shift/load, active-LOW load), 2 = CLK,
       3-6 = E F G H (parallel inputs), 7 = QH-bar (complementary output), 8 = GND,
       9 = QH (serial output), 10 = SER (serial input), 11-14 = A B C D (parallel
       inputs), 15 = CLK INH (clock inhibit), 16 = VCC. Matches the existing
       pinout[] exactly -- engine (pinout[], gates[], SHIFT_REG_PISO evaluator in
       js/specificChipsSim.js) left unchanged.
     Behavior confirmed against the function table + logic diagram: parallel load
       is ASYNCHRONOUS (data enters directly while SH/LD-bar is LOW, independent of
       CLK / CLK INH / SER); shifting is toward QH (A -> B -> ... -> H) on the
       rising CLK edge when SH/LD-bar is HIGH and CLK INH is LOW; SER enters the
       first (A-end) stage; only QH and QH-bar are brought out. The gated-clock
       detail (CLK and CLK INH share a two-input NOR, so either one can inhibit) is
       modeled as a plain CLK-INH-HIGH freeze -- noted as a simplification in the
       guide "Gotchas" (issues.md A3). Propagation delay modeled as zero in LIVE
       mode (issues.md A1): datasheet fmax 20 MHz min / 26 MHz typ ('165), 35 MHz
       typ ('LS165A), CLK->QH tPLH/tPHL ~16 / 21 ns typ ('165), page 1 + page 6.
     NOTE: the previous datasheet URL (sn74ls165.pdf) 404s on ti.com; corrected to
       the live sn74ls165a.pdf symlink. The SN54165/SN74165 bipolar parts are
       obsolete, so the 'A / LS165A sheet is the maintained document for this pinout.
     Shift-register concept: https://en.wikipedia.org/wiki/Shift_register */
  '74x165': {
    name: '74x165',
    simpleName: '8 bit PISO Shift Register',
    description: '8-bit PISO shift register with complementary outputs. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls165a.pdf',
    tags: ['shift register', 'parallel', 'serial', '8 bit', 'sequential', 'piso'],
    guideOverview: 'The 74x165 turns 8 parallel bits into a serial stream on a single wire. Pull SH/LD LOW and the eight parallel inputs (A through H) load straight into the register. That load is asynchronous: while SH/LD is LOW the register simply follows whatever is on A H, no clock needed. Drive SH/LD HIGH and each rising clock edge shifts the stored bits one step toward the output, so they leave in order on QH H comes out first, A comes out last after eight clocks. Only QH and its complement QH-bar are brought out to pins; the six inner stages are not, so you read the byte by clocking it past QH rather than reading all eight at once (reading all eight in parallel is the job of a SIPO part like the 74x164). CLK INH is a second gate on the clock: hold it HIGH to freeze the register without losing its contents. SER feeds bits in at the far end, so you can chain several 74x165s QH of one into SER of the next for 16, 24, or more bits in one stream. The usual reason to reach for this part is pin count: it reads eight switches, buttons, or sensor lines and hands them to a microcontroller over just three wires.',
    guidePinDescriptions: {
      'SH/LD': 'Shift/Load control, active LOW load. Hold LOW to load the parallel inputs A H straight into the register (asynchronous the register follows A H the whole time SH/LD is LOW). Drive HIGH to switch to shift mode so the clock can move data out.',
      'CLK': 'Clock. With SH/LD HIGH and CLK INH LOW, each LOW-to-HIGH edge shifts the stored bits one step toward QH.',
      'E': 'Parallel data input E. Loaded into its stage while SH/LD is LOW.',
      'F': 'Parallel data input F. Loaded while SH/LD is LOW.',
      'G': 'Parallel data input G. Loaded while SH/LD is LOW.',
      'H': 'Parallel data input H the stage that sits at the output, so H is the first bit to appear on QH after a load. Loaded while SH/LD is LOW.',
      'QHn': 'Complementary serial output: always the opposite of QH. Handy when the next stage or line wants the inverted signal.',
      'GND': 'Ground reference (pin 8).',
      'QH': 'Serial output the value held in the last stage. Read the byte here, one bit per clock; connect to SER of the next chip to cascade.',
      'SER': 'Serial data input. On each shift it enters the first (A-end) stage and works its way toward QH. Tie it to QH of the previous chip when chaining; hold LOW if unused.',
      'A': 'Parallel data input A the far end from the output, so A is the last bit out, after eight clocks. Loaded while SH/LD is LOW.',
      'B': 'Parallel data input B. Loaded while SH/LD is LOW.',
      'C': 'Parallel data input C. Loaded while SH/LD is LOW.',
      'D': 'Parallel data input D. Loaded while SH/LD is LOW.',
      'CLKINH': 'Clock inhibit, active HIGH. HIGH blocks the clock so the register holds its contents; LOW lets CLK through. Change it only while CLK is HIGH, or you can create a false clock edge.',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How it works',
        paragraphs: [
          'Inside are eight D-type flip flops wired in a chain, stage A at one end and stage H at the other. Only the last stage (H) is brought out to pins, on QH and its inverse QH-bar; the seven stages behind it have no pins of their own.',
          'A LOW on SH/LD loads the chain: each parallel input (A H) is forced straight into its own stage. This load is asynchronous it does not wait for a clock edge, and while SH/LD stays LOW the stages keep tracking whatever is on A H. Raise SH/LD HIGH to stop loading and allow shifting.',
          'With SH/LD HIGH, every rising clock edge moves each stage\'s bit into the next stage, toward H. So the bit loaded into H leaves on QH first; one clock later the bit that was in G is at QH, and so on, with A\'s bit arriving last after eight clocks. The SER input feeds the empty A-end stage, so whatever sits on SER becomes the new bit at the far end on each clock that is how you chain chips together.',
          'CLK and CLK INH both feed a single NOR gate inside the chip, which is why either one can stop the clock. In normal use you hold CLK INH LOW and clock with CLK, or freeze the register by taking CLK INH HIGH. The simulator treats CLK INH HIGH as a plain freeze; it does not model the rarer trick of holding CLK steady and using CLK INH itself as the active clock.',
        ],
      },
      {
        title: 'Function table',
        paragraphs: [
          'X means "don\'t care". "CLK rises" is a LOW-to-HIGH edge. a...h are the levels sitting on the parallel inputs; Q0 means a stage keeps its previous value (hold).',
        ],
        formulas: [
          'SH/LD=0                          -> load: every stage = its A..H input (async, ignores CLK)',
          'SH/LD=1, CLK INH=1               -> hold (clock blocked)',
          'SH/LD=1, CLK INH=0, CLK rises    -> shift toward QH; SER enters the A-end stage',
          'SH/LD=1, CLK INH=0, CLK steady   -> hold',
        ],
      },
      {
        title: 'Reading a byte out',
        list: [
          'Pulse SH/LD LOW, then back HIGH. The eight inputs are now captured, and QH already shows the H bit.',
          'Read QH that is your first bit.',
          'Pulse CLK once. QH now shows the G bit. Read it.',
          'Keep clocking and reading until you have all eight bits. They arrive in the order H, G, F, E, D, C, B, A one read plus seven clocks.',
        ],
        note: 'Wire a byte so its most significant bit goes to H and its least significant to A, and the chip sends it most-significant-bit first that is the common convention the A=LSB / H=MSB labels follow. If your bits come out reversed for your wiring, just read them in the opposite order in software.',
      },
      {
        title: 'Common uses',
        list: [
          'Input expander: read eight switches, buttons, or a DIP block using only three microcontroller pins SH/LD, CLK, and the line that reads QH.',
          'Parallel-to-serial conversion: send a whole byte down a single wire instead of eight.',
          'Cascading: connect QH of one chip to SER of the next and share SH/LD and CLK to read 16, 24, or more inputs as one long stream.',
          'Snapshotting: the asynchronous load grabs all eight lines at the same instant, then you clock them out at your own pace useful for catching several signals together.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'The load is asynchronous and level-triggered, not edge-triggered. While SH/LD is LOW the register keeps following A H, so you must return SH/LD HIGH before clocking otherwise the "stored" data just tracks the inputs.',
          'Change CLK INH only while CLK is HIGH. Switching it while CLK is LOW can look like an extra clock edge and shift the data one step too far. The datasheet calls this out directly.',
          'Only QH and QH-bar exist as outputs. You cannot tap the middle of the register you have to clock a bit all the way to QH to see it.',
          'H comes out first, A last. Get the order wrong and your byte arrives bit-reversed.',
          'SER matters only when chaining. Leave it LOW (or tied to the previous chip\'s QH) so it does not inject stray bits.',
        ],
        note: 'Real gates take time. On the LS165A the clock-to-QH delay is about 16 21 ns typical and the part runs to roughly 35 MHz (about 26 MHz on the original bipolar 165). The simulator treats these delays as zero a simplification, so it does not reproduce timing hazards or a maximum clock speed.',
      },
    ],
    pinout: [
      { pin: 1,  name: 'SH/LD',  type: 'input',  description: 'Shift/Load select (active LOW load). LOW latches parallel inputs A H; HIGH enables shifting on clock.' },
      { pin: 2,  name: 'CLK',    type: 'input',  description: 'Clock input. Rising edge advances the shift register when SH/LD#=HIGH and CLKINH=LOW.' },
      { pin: 3,  name: 'E',      type: 'input',  description: 'Parallel data input bit E (bit 4 of 8). Loaded when SH/LD# goes LOW.' },
      { pin: 4,  name: 'F',      type: 'input',  description: 'Parallel data input bit F (bit 5 of 8). Loaded when SH/LD# goes LOW.' },
      { pin: 5,  name: 'G',      type: 'input',  description: 'Parallel data input bit G (bit 6 of 8). Loaded when SH/LD# goes LOW.' },
      { pin: 6,  name: 'H',      type: 'input',  description: 'Parallel data input bit H (bit 7 of 8, MSB). Loaded when SH/LD# goes LOW.' },
      { pin: 7,  name: 'QHn',    type: 'output', description: 'Complementary (inverted) serial output of the last shift stage.' },
      { pin: 8,  name: 'GND',    type: 'power' },
      { pin: 9,  name: 'QH',     type: 'output', description: 'True serial output from the last shift stage. Connect to SER of next chip when cascading.' },
      { pin: 10, name: 'SER',    type: 'input',  description: 'Serial data input. Shifted into the register on each rising clock edge during shift mode.' },
      { pin: 11, name: 'A',      type: 'input',  description: 'Parallel data input bit A (bit 0 of 8, LSB). Loaded when SH/LD# goes LOW.' },
      { pin: 12, name: 'B',      type: 'input',  description: 'Parallel data input bit B (bit 1 of 8). Loaded when SH/LD# goes LOW.' },
      { pin: 13, name: 'C',      type: 'input',  description: 'Parallel data input bit C (bit 2 of 8). Loaded when SH/LD# goes LOW.' },
      { pin: 14, name: 'D',      type: 'input',  description: 'Parallel data input bit D (bit 3 of 8). Loaded when SH/LD# goes LOW.' },
      { pin: 15, name: 'CLKINH', type: 'input',  description: 'Clock inhibit. Drive HIGH to freeze the shift register without losing its contents.' },
      { pin: 16, name: 'VCC',    type: 'power' },
    ],
    gates: [
      {
        type: 'SHIFT_REG_PISO',
        inputs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'SER', 'CLK', 'CLKINH', 'SH/LD'],
        outputs: ['QH', 'QHn'],
      },
    ],
    sequential: true,
  },

  // ── 74173: 4 bit D Register (tri state) ────────────────────────────────
  /* Primary source: Texas Instruments, "SN54173, SN54LS173A, SN74173, SN74LS173A
       4-Bit D-Type Registers With 3-State Outputs", SDLS067A (Oct. 1976, rev. June
       1999). [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls173a.pdf.
       Verified: TERMINAL ASSIGNMENT (J/N/W/D package, TOP VIEW, page 1), FUNCTION
       TABLE (page 2) and the positive-logic LOGIC DIAGRAM (page 3), read as PDF page
       images per issues.md C4 (never the WebFetch summarizer).
     Verified DIP-16 map: pin 1 = M (output control 1), 2 = N (output control 2),
       3-6 = 1Q-4Q, 7 = CLK, 8 = GND, 9 = G1-bar / 10 = G2-bar (data enable, active
       LOW), 11-14 = 4D-1D, 15 = CLR, 16 = VCC. Positions match the datasheet; this
       entry keeps the descriptive pin names OE1/OE2 (= M/N) and IE1/IE2 (= G1-bar/
       G2-bar) instead of the datasheet's single letters.
     CLEAR polarity + timing FIX: the FUNCTION TABLE (CLR = H, CLK = X -> Q = L) and
       the LOGIC DIAGRAM (CLR drives the direct R input of all four flip-flops, not
       gated by the clock) show CLR is ACTIVE HIGH and ASYNCHRONOUS. The fast-batch
       entry documented it as active-LOW, and the shared REG_4BIT_TRI primitive
       defaulted to a SYNCHRONOUS clear; both corrected here (the gate now sets
       asyncReset:true, the same opt-in flag CD4076 uses). See issues.md C99.
     Three-state (tri state) logic: https://en.wikipedia.org/wiki/Three-state_logic
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x173': {
    name: '74x173',
    simpleName: '4 bit D Register',
    description: '4 bit D type register with 3-state (tri state) outputs (16-pin)',
    guideOverview: 'The 74x173 is a 4 bit register: four D-type flip flops that share one clock, with 3-state outputs so the chip can be switched off a shared data bus. On a rising clock edge, if both data-enable inputs (IE1 and IE2) are LOW, the four data inputs (1D 4D) are captured; if either enable is HIGH the register ignores the clock and holds what it already has. The four outputs (1Q 4Q) drive their pins only when both output-enable inputs (OE1 and OE2) are LOW otherwise they go to high impedance and let something else drive the bus. Two things about this part catch people out: its clear is active HIGH, not active LOW like most 74-series parts, and it is asynchronous a HIGH on CLR forces all four bits to 0 immediately, without waiting for a clock edge.',
    guidePinDescriptions: {
      'OE1': 'Output enable 1, active LOW (the datasheet calls it M). Both OE1 and OE2 must be LOW for the outputs to drive; if either is HIGH all four outputs go to high impedance.',
      'OE2': 'Output enable 2, active LOW (datasheet N). See OE1 both must be LOW to drive the bus.',
      '1Q': 'Registered output for bit 1 (LSB). Driven only when OE1 and OE2 are both LOW; otherwise high impedance.',
      '2Q': 'Registered output for bit 2.',
      '3Q': 'Registered output for bit 3.',
      '4Q': 'Registered output for bit 4 (MSB).',
      'CLK': 'Clock input. On its rising edge the register captures 1D 4D, but only when IE1 and IE2 are both LOW.',
      'GND': 'Ground reference (pin 8).',
      'IE1': 'Input (data) enable 1, active LOW (datasheet G1). Both IE1 and IE2 must be LOW for a clock edge to load new data; if either is HIGH the register holds.',
      'IE2': 'Input (data) enable 2, active LOW (datasheet G2). See IE1.',
      '4D': 'Data input for bit 4 (MSB). Captured on the rising clock edge when IE1 and IE2 are both LOW.',
      '3D': 'Data input for bit 3.',
      '2D': 'Data input for bit 2.',
      '1D': 'Data input for bit 1 (LSB).',
      'CLR': 'Clear, active HIGH and asynchronous. A HIGH forces all four outputs to 0 right away, no clock edge needed. Hold it LOW for normal operation.',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How it works',
        paragraphs: [
          'Inside are four D-type flip flops on a shared clock. Each stores one bit. On a rising edge of CLK the flip flops load the values on 1D 4D but only when both data-enable inputs (IE1 and IE2) are LOW. If either enable is HIGH, the clock edge is ignored and the register keeps its current contents. That "do nothing / hold" mode lets you leave the clock free-running and only load when you actually want to.',
          'The outputs are 3-state. When both output enables (OE1 and OE2) are LOW, 1Q 4Q drive their real logic levels. Drive either enable HIGH and all four outputs go to high impedance electrically disconnected, so another chip can drive the same bus wires. Turning the outputs off does not disturb the stored bits; the flip flops keep clocking normally behind the scenes.',
          'The datasheet labels the output enables M and N, and the data enables G1 and G2 (drawn with a bar over them, meaning active LOW). This entry uses the plainer names OE1/OE2 and IE1/IE2 for the same pins.',
        ],
      },
      {
        title: 'Function table',
        paragraphs: [
          'X means "don\'t care". "CLK rises" means a LOW-to-HIGH edge on the clock. Q0 means each output keeps its previous value (hold).',
        ],
        formulas: [
          'CLR=1                        -> Q = 0       (async clear, ignores the clock)',
          'CLR=0, no CLK edge           -> Q = Q0      (hold)',
          'CLR=0, CLK rises, IE1 or IE2 =1 -> Q = Q0   (data disabled, hold)',
          'CLR=0, CLK rises, IE1=IE2=0  -> Q = D       (load the data inputs)',
          'OE1=1 or OE2=1               -> outputs Hi-Z (stored data is unchanged)',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'A small register hung directly on a shared data bus load it, then tri-state it off so other devices can use the bus.',
          'Holding a 4 bit value (a nibble) between stages of a circuit.',
          'Gating when data is captured: leave the clock running and pull the enables LOW only on the cycle you want to latch.',
          'Cascade two for an 8 bit bus register by sharing CLK, CLR, and the enable lines.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'The clear is active HIGH the opposite of most 74-series parts, whose clears are active LOW. Tie CLR to ground for normal running; a stray HIGH wipes the register.',
          'The clear is asynchronous: it acts the moment CLR goes HIGH, not on a clock edge.',
          'BOTH data enables must be LOW to load. One HIGH enable quietly blocks the capture and the register just holds it can look like a dead clock.',
          'BOTH output enables must be LOW to see the outputs. If the pins read as high impedance, check OE1 and OE2 first.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls173a.pdf',
    tags: ['register', 'd', '4 bit', 'tri state', 'sequential'],
    pinout: [
      { pin: 1, name: 'OE1', type: 'input' },
      { pin: 2, name: 'OE2', type: 'input' },
      { pin: 3, name: '1Q', type: 'output' },
      { pin: 4, name: '2Q', type: 'output' },
      { pin: 5, name: '3Q', type: 'output' },
      { pin: 6, name: '4Q', type: 'output' },
      { pin: 7, name: 'CLK', type: 'input' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'IE1', type: 'input' },
      { pin: 10, name: 'IE2', type: 'input' },
      { pin: 11, name: '4D', type: 'input' },
      { pin: 12, name: '3D', type: 'input' },
      { pin: 13, name: '2D', type: 'input' },
      { pin: 14, name: '1D', type: 'input' },
      { pin: 15, name: 'CLR', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'REG_4BIT_TRI',
        inputs: ['1D', '2D', '3D', '4D', 'CLK', 'CLR', 'IE1', 'IE2', 'OE1', 'OE2'],
        outputs: ['1Q', '2Q', '3Q', '4Q'],
        asyncReset: true,   // 74173 CLR is asynchronous + active HIGH (SDLS067A function table + logic diagram); see issues.md C99
      },
    ],
    sequential: true,
  },

  // ── 74174: Hex D flip flop with clear ──────────────────────────────────
  /* Primary source: Texas Instruments, "SN54174, SN54175, SN54LS174, SN54LS175,
     SN54S174, SN54S175, SN74174, SN74175, SN74LS174, SN74LS175, SN74S174, SN74S175
     Hex/Quadruple D-Type Flip-Flops With Clear," SDLS068A (Dec. 1972, rev. Oct. 2001).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls174.pdf.
     Verified: SN74174 standard-DIP terminal assignment (N/D package, top view) —
     CLR#=1, 1Q=2, 1D=3, 2D=4, 2Q=5, 3D=6, 3Q=7, GND=8, CLK=9, 4Q=10, 4D=11, 5Q=12,
     5D=13, 6D=14, 6Q=15, VCC=16 — plus the per-flip-flop FUNCTION TABLE (CLEAR=L,
     CLK=X, D=X -> Q=L, i.e. asynchronous active-LOW "direct" clear; CLEAR=H with a
     LOW->HIGH clock edge captures D; CLK steady -> Q holds) and the positive-logic
     logic diagram (six 1D/C1/R flip-flops, one buffered CLOCK on pin 9 and one buffered
     CLEAR on pin 1 fanning to all six, single-rail Q outputs, NO Q-bar) on pages 1-2,
     read as rendered 300-dpi PDF page images (issues.md C4). The function-table Q-bar
     column is footnoted "'175, 'LS175, 'S175 only," confirming the '174 hex part has no
     complementary outputs. AC data (pages 4-6, same images): setup time tsu ~20 ns
     ('174/'LS174) / 5 ns ('S174), hold th ~5 ns / 3 ns, clock-to-Q propagation ~20-35 ns
     ('174/'LS174) / ~8-17 ns ('S174), typ fmax 35/40/110 MHz. pinout[] and the single
     D_FF_HEX gate confirmed against this; engine left unchanged (js/specificChipsSim.js
     _evaluateDFFHex already models active-LOW async clear + positive-edge capture).
     Quad dual-rail sibling contrast (74x175 = four flip-flops each with Q and Q-bar):
     same SDLS068A datasheet, '175 terminal diagram + logic diagram, pages 1-2.
     D flip-flop concept, setup/hold time and metastability (simplification note):
     Wikipedia contributors, "Flip-flop (electronics)." [Online]. Available:
     https://en.wikipedia.org/wiki/Flip-flop_(electronics). */
  '74x174': {
    name: '74x174',
    simpleName: 'Hex D FF',
    description: 'Six D flip-flops, one clock + active-LOW clear; 6-bit register. (16-pin)',
    guideOverview: 'The 74x174 is six D flip flops in one 16-pin package. A D flip flop copies whatever is on its D input to its Q output at the instant the clock rises, then holds that value until the next rising edge. All six here share one clock, so a single clock edge samples all six D inputs at once and latches them   that makes the chip a 6 bit register: put six bits on the D pins, pulse the clock, and the six outputs snap to that value and hold it while the source keeps changing. A separate clear pin (CLR, active LOW) forces every output to 0 immediately, with no clock edge needed   an asynchronous, or "direct," clear. Unlike its close sibling the 74x175, which packs four flip flops but gives each one both Q and its inverse Q-bar, the 174 spends those pins on two more flip flops instead: you get six Q outputs and no Q-bar.',
    guidePinDescriptions: {
      'CLR':  'Clear, active LOW and asynchronous. Hold HIGH to run normally; pull LOW and all six outputs go to 0 at once, no clock edge needed (pin 1).',
      '1Q':   'Output of flip flop 1. Holds the last captured bit until the next rising clock edge.',
      '1D':   'Data input for flip flop 1. Sampled on the rising clock edge.',
      '2D':   'Data input for flip flop 2. Sampled on the rising clock edge.',
      '2Q':   'Output of flip flop 2.',
      '3D':   'Data input for flip flop 3. Sampled on the rising clock edge.',
      '3Q':   'Output of flip flop 3.',
      'GND':  'Ground, 0 V reference (pin 8).',
      'CLK':  'Clock, shared by all six flip flops. Every D input is captured on its LOW-to-HIGH edge (pin 9).',
      '4Q':   'Output of flip flop 4.',
      '4D':   'Data input for flip flop 4. Sampled on the rising clock edge.',
      '5Q':   'Output of flip flop 5.',
      '5D':   'Data input for flip flop 5. Sampled on the rising clock edge.',
      '6D':   'Data input for flip flop 6. Sampled on the rising clock edge.',
      '6Q':   'Output of flip flop 6.',
      'VCC':  'Positive supply, +5 V (pin 16).',
    },
    guideSections: [
      {
        title: 'How the Hex Register Works',
        paragraphs: [
          'A D ("data") flip flop has one job: on the rising edge of the clock, copy the level on D to the output Q, then hold it. Between edges the D input can wiggle all it likes   the output ignores it and stays put until the next rising edge. The 74x174 puts six of these flip flops in one package and ties their clocks together, so one clock edge loads all six at the same moment.',
          'That shared clock is what makes it a register: drive a 6 bit value onto 1D through 6D, pulse the clock once, and the six Q outputs snap to that value and hold it while the rest of your circuit changes. The clock is edge triggered, not level triggered   the outputs move only on the LOW-to-HIGH transition, not the whole time the clock sits HIGH.',
          'The clear input (CLR) overrides everything. It is active LOW and asynchronous: pull it LOW and all six outputs go to 0 right away, no clock edge required. Hold it HIGH for normal operation. "Direct clear" on the datasheet means the same thing   the reset does not wait for the clock.',
        ],
        formulas: [
          'Per flip flop   CLR, CLK, D → Q',
          'CLR=0, any CLK, any D      → Q=0  (clear wins, any time)',
          'CLR=1, CLK rising edge, D=1 → Q=1',
          'CLR=1, CLK rising edge, D=0 → Q=0',
          'CLR=1, CLK steady (H or L)  → Q holds its last value',
        ],
      },
      {
        title: 'Single-Rail Outputs: No Q-bar',
        paragraphs: [
          'Many D flip flops give you both Q and its logical opposite, Q-bar. The 74x174 does not   each section brings out only Q. With sixteen pins to spend, the designers chose six flip flops with one output each over four flip flops with two.',
          'If you need the inverted output, you have two easy options: add an inverter (a spare 74x04 gate) on the Q you care about, or reach for the 74x175 instead. The 175 is the same-family part in the same 16-pin package, but with four flip flops that each expose Q and Q-bar. It has the same shared clock and the same active LOW clear   you are just trading two flip flops away to get the complementary outputs.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          '6 bit register: latch a whole 6 bit bus value on one clock edge and hold it steady while the source keeps changing. This is the everyday use.',
          'Pipeline or buffer stage: park the output of one block of logic on the Q pins so the next block sees a clean, stable copy that only updates on the clock.',
          'Wider registers: chain two 74x174s on a shared clock and clear for a 12 bit register, or pair one with a 74x175 to hit an odd width.',
          'Shift register or pattern generator: wire each Q into the next flip flop\'s D (and feed a bit or some feedback into 1D). Each clock edge marches the pattern along one step   the datasheet lists shift registers and pattern generators as intended uses.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Clear is active LOW. A LOW on CLR pins every output to 0, so tie CLR HIGH (to VCC) whenever you are not deliberately resetting. Leaving it floating is asking for random resets.',
          'No Q-bar outputs. If your design expects a complementary output from this chip, it is not there   use the 74x175 or add an inverter.',
          'Edge, not level. The outputs update only on the clock\'s rising edge. Holding the clock HIGH does not keep reloading D; you have to bring the clock back LOW and then HIGH again for the next capture.',
          'The pinout is interleaved. D and Q pins alternate around the package rather than sitting in neat groups (1Q is pin 2 but 1D is pin 3, and CLK lands at pin 9 in the middle). Count pins carefully when wiring.',
        ],
        note: 'Two real-world timing details the simulator idealizes. First, D must be steady for a short setup time before the clock edge   about 20 ns on the common 74LS174   and briefly after it (hold time, about 5 ns); if D changes right at the edge, a real flip flop can hang in a half-way state for a moment (metastability). Second, the output does not appear the instant the clock rises: there is a clock-to-output propagation delay, roughly 20 to 35 ns on the standard and LS parts, about 8 to 17 ns on the faster S part. 74Sim captures D exactly on the edge with zero setup, hold, and delay, so it never shows metastability or timing glitches   that is a simplification.',
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls174.pdf',
    tags: ['flip flop', 'd', 'hex', 'sequential', 'register'],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1D', type: 'input' },
      { pin: 4, name: '2D', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '3D', type: 'input' },
      { pin: 7, name: '3Q', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'CLK', type: 'input' },
      { pin: 10, name: '4Q', type: 'output' },
      { pin: 11, name: '4D', type: 'input' },
      { pin: 12, name: '5Q', type: 'output' },
      { pin: 13, name: '5D', type: 'input' },
      { pin: 14, name: '6D', type: 'input' },
      { pin: 15, name: '6Q', type: 'output' },
      { pin: 16, name: 'VCC', type: 'power' },
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
