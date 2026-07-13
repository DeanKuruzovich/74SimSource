
// Chip definitions block 6
// Auto-generated from chips.js
//
// Review notes for this block:
// - These parts are mostly storage, counter, and bus interface TTL devices.
// - The simulator models their logic level behavior, control pin polarity,
//   edge-sensitive storage, and tri state output behavior.
// - Propagation delay, setup/hold violations, and metastable analog effects are
//   intentionally not modeled, but the functional truth-table behavior matches
//   the intended breadboard use for these parts.

export const CHIPS_BLOCK_6 = {
  // ── 74175: Quad D flip flop with clear ─────────────────────────────────
  // Source: Texas Instruments, "SN54174, SN54175, SN54LS174, SN54LS175, SN54S174,
  //   SN54S175, SN74174, SN74175, SN74LS174, SN74LS175, SN74S174, SN74S175
  //   Hex/Quadruple D-Type Flip-Flops With Clear", SDLS068A (Dec. 1972, rev.
  //   Oct. 2001). [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls175.pdf.
  //   Verified: the '175 terminal assignment for the D/N package, the per-flip-flop
  //   FUNCTION TABLE, and the '175 logic diagram, pages 1-2, read as rendered PDF
  //   page images (NOT a text summarizer, per issues.md C4).
  // Concept reference: "Flip-flop (electronics)",
  //   https://en.wikipedia.org/wiki/Flip-flop_(electronics).
  // Pinout VERIFIED correct against the datasheet terminal diagram (16-pin DIP), so
  //   pinout[]/gates[] are left untouched: 1=CLR 2=1Q 3=1Qn 4=1D 5=2D 6=2Qn 7=2Q
  //   8=GND 9=CLK 10=3Q 11=3Qn 12=3D 13=4D 14=4Qn 15=4Q 16=VCC.
  // Behavior (datasheet function table): CLEAR is direct (asynchronous) and active
  //   LOW — CLEAR=L forces every Q LOW and every Qn HIGH regardless of the clock.
  //   With CLEAR HIGH, each LOW-to-HIGH CLK edge copies that section's D onto Q and
  //   its complement onto Qn; between edges the outputs hold. Matches the shared
  //   D_FF_QUAD primitive in js/specificChipsSim.js (also used by the CD40175B) —
  //   engine left untouched. The '175 has double-rail (Q + Qn) outputs; the '174
  //   sibling is the hex (six FF) version with single-rail (Q only) outputs.
  '74x175': {
    name: '74x175',
    simpleName: 'Quad D FF',
    description: 'Quad pos-edge D flip-flop, async active-LOW clear, Q+Qn outputs. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls175.pdf',
    tags: ['flip flop', 'flip flop', 'd', 'quad', 'sequential', 'register'],
    guideOverview: 'The 74x175 is four D flip flops in one 16 pin chip, wired to work together as a 4 bit register. All four share a single clock (CLK) and a single clear (CLR), so they capture and reset as a group. On each rising edge of CLK, every section copies its own D input to its output; between edges the outputs hold their value, which is what makes this a storage register rather than a latch that passes signals straight through. Each section also brings out a complementary output Qn, the exact inverse of Q, so both polarities of every bit are available without adding inverters. CLR is a direct, active LOW clear: pull it LOW and all four outputs reset at once, without waiting for a clock edge. Reach for it to grab and hold a 4 bit value on a clock edge. The sibling 74x174 is the same idea with six flip flops, but only the true output on each.',
    guidePinDescriptions: {
      CLR: 'Direct clear, active LOW and asynchronous. Pull LOW to force all four Q outputs LOW and all Qn outputs HIGH immediately, with no clock edge. Tie HIGH for normal clocked operation.',
      '1Q': 'True output of flip flop 1. Holds the last value captured from 1D.',
      '1Qn': 'Complementary output of flip flop 1, always the inverse of 1Q.',
      '1D': 'Data input for flip flop 1. Its level is sampled only on the CLK rising edge.',
      '2D': 'Data input for flip flop 2. Sampled only on the CLK rising edge.',
      '2Qn': 'Complementary output of flip flop 2, always the inverse of 2Q.',
      '2Q': 'True output of flip flop 2. Holds the last value captured from 2D.',
      GND: 'Ground reference (pin 8).',
      CLK: 'Shared clock. All four flip flops capture their D inputs together on the LOW-to-HIGH (rising) edge.',
      '3Q': 'True output of flip flop 3. Holds the last value captured from 3D.',
      '3Qn': 'Complementary output of flip flop 3, always the inverse of 3Q.',
      '3D': 'Data input for flip flop 3. Sampled only on the CLK rising edge.',
      '4D': 'Data input for flip flop 4. Sampled only on the CLK rising edge.',
      '4Qn': 'Complementary output of flip flop 4, always the inverse of 4Q.',
      '4Q': 'True output of flip flop 4. Holds the last value captured from 4D.',
      VCC: 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How It Works',
        paragraphs: [
          'Each of the four sections is a D (data) flip flop: it copies the level on its D input to its Q output at one instant, the moment CLK goes from LOW to HIGH. Between those edges D can change freely and the output ignores it. That is what makes this a storage register and not a latch: the captured value is held until the next rising edge.',
          'All four sections share the same CLK pin and the same CLR pin, so they behave as one 4 bit register. Put a 4 bit value on 1D through 4D, give CLK one rising edge, and all four bits land on the outputs at the same time. Each section also drives a complementary output Qn, the exact inverse of Q, so both polarities of every stored bit are available at the pins.',
        ],
        note: 'CLR overrides the clock. It is asynchronous and active LOW: the instant CLR goes LOW every Q is forced to 0 (and every Qn to 1), whether or not a clock edge is happening. Tie CLR HIGH for normal clocked operation.',
      },
      {
        title: 'Function Table',
        paragraphs: [
          'From the datasheet function table, for one flip flop. H = HIGH, L = LOW, X = don\'t care, and the up arrow marks a rising clock edge. Q0 is the value the output already held (no change).',
        ],
        formulas: [
          'CLR#  CLK  D  |   Q   Qn',
          '  L    X   X  |   L   H     clear forces Q low, any time',
          '  H    ↑   H  |   H   L     rising edge captures D=1',
          '  H    ↑   L  |   L   H     rising edge captures D=0',
          '  H    L   X  |   Q0  Qn0   no edge: output holds',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Buffer or storage register: grab a 4 bit value on a clock edge and hold it steady for the rest of the circuit to read.',
          'Pipeline or retiming stage: pass data forward one clock at a time to line it up with other clocked logic.',
          'Pattern generator or small state register: feed the Qn (or Q) outputs back into the D inputs so the chip steps through a repeating sequence on each clock.',
          'Wider registers: two chips with a shared CLK and CLR give an 8 bit register.',
          'Anywhere a downstream gate needs both a signal and its inverse, since Q and Qn come out side by side.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'It is edge triggered, not level triggered. A HIGH sitting on CLK does nothing; the clock has to actually transition LOW to HIGH for the outputs to update.',
          'There is only one clock and one clear for the whole chip. You cannot update or reset one bit while holding the others; all four move together. Use a 74x74 (two fully independent flip flops) if you need separate control.',
          'CLR is active LOW. Leaving it floating or LOW keeps the register stuck at 0; tie it HIGH whenever you are not clearing.',
          'Tie unused D inputs to a defined level. On TTL a floating input tends to read HIGH but is unreliable and noise sensitive.',
          'For a reliable capture, D must be steady for a short setup-and-hold window around the clock edge. Clocking in a signal that is not synchronised to CLK can cause metastability, where Q briefly hangs between LOW and HIGH before settling to a random value. (Simplified: this simulator samples the D level at the edge and does not model setup/hold timing or metastability.)',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input', description: 'Direct clear, active LOW and asynchronous: forces all Q LOW / all Qn HIGH regardless of clock' },
      { pin: 2, name: '1Q', type: 'output', description: 'Flip flop 1 true output' },
      { pin: 3, name: '1Qn', type: 'output', description: 'Flip flop 1 complementary output (inverse of 1Q)' },
      { pin: 4, name: '1D', type: 'input', description: 'Flip flop 1 data input, captured on the CLK rising edge' },
      { pin: 5, name: '2D', type: 'input', description: 'Flip flop 2 data input, captured on the CLK rising edge' },
      { pin: 6, name: '2Qn', type: 'output', description: 'Flip flop 2 complementary output (inverse of 2Q)' },
      { pin: 7, name: '2Q', type: 'output', description: 'Flip flop 2 true output' },
      { pin: 8, name: 'GND', type: 'power', description: 'Ground (0 V)' },
      { pin: 9, name: 'CLK', type: 'input', description: 'Shared clock; all four flip flops capture D on the LOW-to-HIGH edge' },
      { pin: 10, name: '3Q', type: 'output', description: 'Flip flop 3 true output' },
      { pin: 11, name: '3Qn', type: 'output', description: 'Flip flop 3 complementary output (inverse of 3Q)' },
      { pin: 12, name: '3D', type: 'input', description: 'Flip flop 3 data input, captured on the CLK rising edge' },
      { pin: 13, name: '4D', type: 'input', description: 'Flip flop 4 data input, captured on the CLK rising edge' },
      { pin: 14, name: '4Qn', type: 'output', description: 'Flip flop 4 complementary output (inverse of 4Q)' },
      { pin: 15, name: '4Q', type: 'output', description: 'Flip flop 4 true output' },
      { pin: 16, name: 'VCC', type: 'power', description: 'Positive supply (+5 V)' },
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

  // ── 74191: Synchronous 4 bit Up/Down Binary Counter ────────────────────
  // Source: Texas Instruments, "SN54190, SN54191, SN54LS190, SN54LS191, SN74190,
  //   SN74191, SN74LS190, SN74LS191 Synchronous Up/Down Counters With Down/Up Mode
  //   Control", SDLS072 (Dec. 1972, rev. Mar. 1988). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74ls191.pdf. Verified: terminal (pin)
  //   assignment for the N package, the "description" text, and the '191 CTRDIV16
  //   logic symbol, pages 1-2, read as rendered PDF page images (not a text
  //   summarizer, per issues.md C4).
  // Concept reference: "Counter (digital)", https://en.wikipedia.org/wiki/Counter_(digital).
  // Pinout VERIFIED correct against the datasheet terminal diagram (16-pin DIP), so
  //   pinout[]/gates[] are left as-is: 1=B 2=QB 3=QA 4=/CTEN 5=D//U 6=QC 7=QD 8=GND
  //   9=D 10=C 11=/LOAD 12=MAX/MIN 13=/RCO 14=CLK 15=A 16=VCC.
  // Behavior (datasheet description + logic symbol): all four master-slave flip-flops
  //   advance together on the LOW-to-HIGH CLK edge when /CTEN is LOW; D/U picks the
  //   direction (LOW=up, HIGH=down); MAX/MIN is HIGH at terminal count and /RCO is
  //   LOW at terminal count, both used to cascade stages. LOAD is active LOW and
  //   ASYNCHRONOUS ("Asynchronously Presettable with Load Control" — the outputs
  //   "change to agree with the data inputs independently of the level of the clock
  //   input"): a LOW on /LOAD copies A-D onto the outputs with no clock edge. The
  //   COUNTER_UPDOWN primitive was corrected to model this async load (issues.md
  //   C105); it previously loaded only on the rising clock edge.
  '74x191': {
    name: '74x191',
    simpleName: 'Up/Down Counter',
    description: 'Presettable sync 4-bit binary up/down counter, clock + dir pin. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls191.pdf',
    tags: ['counter', 'up/down', 'binary', '4 bit', 'synchronous', 'sequential'],
    guideOverview: 'The 74x191 is a presettable 4 bit binary counter that counts up or down. It holds a number from 0 to 15 and wraps around at either end. One pin sets the direction: hold D/U LOW to count up, HIGH to count down. It is synchronous, meaning all four flip-flops are clocked together on the same rising edge, so the outputs change in one clean step instead of rippling one bit at a time. The part that catches people out is the parallel load: pulling LOAD LOW copies the A-D data inputs straight onto the outputs immediately, with no clock edge needed. Two status pins, MAX/MIN and RCO, flag when the count reaches its top or bottom so several chips can be chained into a wider counter. The 74x190 is the same part counting in decade steps (0 to 9) instead of full binary.',
    guidePinDescriptions: {
      A: 'Parallel-load data input, bit 0 (LSB). Copied to QA when LOAD is LOW.',
      B: 'Parallel-load data input, bit 1. Copied to QB when LOAD is LOW.',
      C: 'Parallel-load data input, bit 2. Copied to QC when LOAD is LOW.',
      D: 'Parallel-load data input, bit 3 (MSB). Copied to QD when LOAD is LOW.',
      QA: 'Count output, bit 0 (LSB).',
      QB: 'Count output, bit 1.',
      QC: 'Count output, bit 2.',
      QD: 'Count output, bit 3 (MSB).',
      CLK: 'Clock input. The count changes on the LOW-to-HIGH (rising) edge.',
      CTEN: 'Count enable, active LOW. LOW lets the counter run; HIGH freezes the count at its current value. Loading still works while CTEN is HIGH.',
      'D/U': 'Direction control. LOW counts up toward 15, HIGH counts down toward 0.',
      LOAD: 'Parallel load: active LOW and asynchronous. LOW copies A-D onto the outputs right away, with no clock edge needed.',
      'MAX/MIN': 'Terminal-count status output. Goes HIGH when the count reaches 15 (counting up) or 0 (counting down) while the counter is enabled.',
      RCO: 'Ripple clock output, active LOW. Pulses LOW at terminal count so it can clock the next stage when cascading.',
      GND: 'Ground reference (pin 8).',
      VCC: 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How It Counts',
        paragraphs: [
          'Inside are four flip-flops holding a 4 bit number on the outputs QD QC QB QA, where QA is the least significant bit. Read as binary the value runs from 0 (0000) to 15 (1111). Counting up past 15 wraps to 0; counting down past 0 wraps to 15.',
          'A single pin sets the direction. Hold D/U LOW and each rising clock edge adds one; hold it HIGH and each edge subtracts one. Because the part is synchronous, all four flip-flops are clocked together on the same edge, so the outputs step in one clean move instead of rippling one bit at a time the way a chain of separate flip-flops would.',
        ],
        note: 'The 74x191 counts full binary (0 to 15). Its sibling the 74x190 shares this exact pinout but counts in decade steps (0 to 9).',
      },
      {
        title: 'Loading and Pausing',
        paragraphs: [
          'Pull LOAD LOW and the counter stops counting and copies whatever is on the data inputs A, B, C, and D straight onto the outputs. This load is asynchronous: it happens the instant LOAD goes LOW, with no clock edge required. That is different from synchronous-load counters like the 74x161, where the load waits for the next clock edge.',
          'CTEN is the count enable, and it is active LOW. Hold it LOW to let the counter run. Take it HIGH to freeze the count at its current value without losing it. Loading still works while CTEN is HIGH, because load overrides both counting and the enable.',
        ],
        formulas: [
          'LOAD=L                              -> Q = D C B A  (async load, any time)',
          'LOAD=H, CTEN=L, D/U=L, CLK rising   -> count up by 1',
          'LOAD=H, CTEN=L, D/U=H, CLK rising   -> count down by 1',
          'LOAD=H, CTEN=H                      -> hold',
        ],
      },
      {
        title: 'Terminal Count and Cascading',
        paragraphs: [
          'Two outputs report when the count reaches an end, so you can build counters wider than 4 bits. MAX/MIN goes HIGH when the count hits its terminal value: 15 while counting up, or 0 while counting down. RCO (ripple clock output) is active LOW and goes LOW at that same terminal count.',
          'There are two ways to chain chips. The simple way feeds the RCO of one stage into the CLK of the next, so the upper stage advances each time the lower one rolls over. The faster way feeds MAX/MIN into the CTEN of the next stage, which runs all stages off one common clock (fully synchronous) and avoids the small delays that stack up in a ripple chain.',
        ],
        note: 'Simplification: this simulator drives RCO as a steady LOW level at terminal count while the counter is enabled, rather than the narrow pulse gated by the clock LOW phase that the real part produces. Ripple cascading still works; only the exact pulse shape is simplified.',
      },
      {
        title: 'Common Uses',
        list: [
          'Up/down counting where a single line, not a second clock, picks the direction.',
          'Presettable dividers: load a start value, count to terminal count, reload (modulo-N division).',
          'Position or event counters that must count both ways (encoder tallies, up/down totals).',
          'Wider counters built by cascading several stages through RCO or MAX/MIN.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'B', type: 'input' },
      { pin: 2, name: 'QB', type: 'output' },
      { pin: 3, name: 'QA', type: 'output' },
      { pin: 4, name: 'CTEN', type: 'input' },
      { pin: 5, name: 'D/U', type: 'input' },
      { pin: 6, name: 'QC', type: 'output' },
      { pin: 7, name: 'QD', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'D', type: 'input' },
      { pin: 10, name: 'C', type: 'input' },
      { pin: 11, name: 'LOAD', type: 'input' },
      { pin: 12, name: 'MAX/MIN', type: 'output' },
      { pin: 13, name: 'RCO', type: 'output' },
      { pin: 14, name: 'CLK', type: 'input' },
      { pin: 15, name: 'A', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_UPDOWN',
        inputs: ['A', 'B', 'C', 'D', 'CLK', 'CTEN', 'D/U', 'LOAD'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'MAX/MIN', 'RCO'],
      },
    ],
    sequential: true,
  },

  // ── 74193: Synchronous 4-bit binary up/down counter (dual clock, with clear) ──
  // Source: Texas Instruments, "SN54192, SN54193, SN54LS192, SN54LS193, SN74192,
  //   SN74193, SN74LS192, SN74LS193 Synchronous 4-Bit Up/Down Counters (Dual Clock
  //   With Clear)", SDLS074 (Dec. 1972, rev. Mar. 1988). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74ls193.pdf. Verified: terminal (pin)
  //   assignment for the N package, the description text, and the '193 CTRDIV-16
  //   logic symbol (ICT=15 -> /CO pin 12, 2CT=0 -> /BO pin 13), pages 1 and 4, read
  //   as rendered PDF page images (not a text summarizer, per issues.md C4).
  // Concept reference: "Counter (digital)", https://en.wikipedia.org/wiki/Counter_(digital).
  // Pinout VERIFIED correct against the datasheet terminal diagram (16-pin DIP), so
  //   the pinout[]/gates[] and the COUNTER_UPDOWN_DC evaluator are left untouched:
  //   1=B 2=QB 3=QA 4=DOWN 5=UP 6=QC 7=QD 8=GND 9=D 10=C 11=/LOAD 12=/CO 13=/BO
  //   14=CLR 15=A 16=VCC.
  // Behavior (datasheet description + logic symbol): CLR is asynchronous and active
  //   HIGH and overrides load and count; /LOAD is asynchronous and active LOW; the
  //   four master-slave flip-flops advance on the LOW-to-HIGH edge of whichever count
  //   input is pulsed while the other count input is held HIGH; /CO and /BO are the
  //   active-LOW carry and borrow outputs used to cascade stages.
  '74x193': {
    name: '74x193',
    simpleName: 'Up/Down Counter (dual clk)',
    description: 'Presettable 4-bit binary up/down counter, split up/down clocks. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls193.pdf',
    tags: ['counter', 'up/down', 'binary', '4 bit', 'synchronous', 'sequential', 'dual clock'],
    guideOverview: 'The 74x193 is a presettable 4 bit binary counter that counts both up and down. What makes it unusual is that up and down each get their own clock pin: pulse the UP input to count up, pulse the DOWN input to count down. There is no direction control pin. The count runs from 0 to 15 and wraps around. You can force it to 0 at any time with the active HIGH clear, or jam any starting value into it with the active LOW parallel load, and both act immediately without waiting for a clock. Two active LOW outputs, carry (CO) and borrow (BO), let you chain several 74x193s into a wider up/down counter. It is the binary version of the 74x192, which counts in decade steps (0 to 9) instead.',
    guidePinDescriptions: {
      A: 'Parallel-load data input, bit 0 (LSB). Copied into QA when LOAD is LOW.',
      B: 'Parallel-load data input, bit 1. Copied into QB when LOAD is LOW.',
      C: 'Parallel-load data input, bit 2. Copied into QC when LOAD is LOW.',
      D: 'Parallel-load data input, bit 3 (MSB). Copied into QD when LOAD is LOW.',
      UP: 'Count-up clock. A LOW-to-HIGH edge adds 1 to the count. Hold DOWN HIGH while pulsing it.',
      DOWN: 'Count-down clock. A LOW-to-HIGH edge subtracts 1 from the count. Hold UP HIGH while pulsing it.',
      LOAD: 'Parallel load: active LOW and asynchronous. LOW copies A-D into the counter right away, with no clock edge needed.',
      CLR: 'Clear: active HIGH and asynchronous. HIGH forces the count to 0 immediately and overrides both load and counting.',
      CO: 'Carry out, active LOW. Goes LOW when the count reaches 15 and the UP clock is LOW. Feed it to the UP input of the next stage to cascade.',
      BO: 'Borrow out, active LOW. Goes LOW when the count reaches 0 and the DOWN clock is LOW. Feed it to the DOWN input of the next stage to cascade.',
      QA: 'Count output, bit 0 (LSB).',
      QB: 'Count output, bit 1.',
      QC: 'Count output, bit 2.',
      QD: 'Count output, bit 3 (MSB).',
      GND: 'Ground reference (pin 8).',
      VCC: 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How It Counts',
        paragraphs: [
          'Inside are four flip-flops holding a 4 bit number on the outputs QD QC QB QA, where QA is the least significant bit. Read as binary, the value runs from 0 (0000) up to 15 (1111) and then wraps back to 0.',
          'Counting is edge triggered. Each LOW-to-HIGH transition on the UP clock adds one; each LOW-to-HIGH transition on the DOWN clock subtracts one. Pulse only one clock at a time and keep the other one HIGH. All four flip-flops switch together on the edge, so the outputs step cleanly in one move instead of rippling one bit at a time.',
        ],
        note: 'Pulsing UP and DOWN at the same instant is not a defined operation on the real part, so avoid it.',
      },
      {
        title: 'Clear, Load, and Count Priority',
        paragraphs: [
          'Two control pins override normal counting, and both are asynchronous: they act the moment you assert them instead of on a clock edge.',
          'CLR is active HIGH. Drive it HIGH and the count jumps to 0 and stays there until CLR goes LOW again. LOAD is active LOW. Drive it LOW and the counter copies whatever is on the A-D data inputs, so you can start from any value. Clear wins over load, and both win over the count clocks.',
        ],
        formulas: [
          'CLR=H                              -> Q = 0000  (clear wins over everything)',
          'CLR=L, LOAD=L                      -> Q = D C B A  (parallel load)',
          'CLR=L, LOAD=H, UP rising, DOWN=H   -> count up by 1',
          'CLR=L, LOAD=H, DOWN rising, UP=H   -> count down by 1',
          'CLR=L, LOAD=H, both clocks steady  -> hold',
        ],
      },
      {
        title: 'Carry, Borrow, and Cascading',
        paragraphs: [
          'The carry (CO) and borrow (BO) outputs exist so you can build counters wider than 4 bits. Both idle HIGH and pulse LOW at the ends of the count. CO goes LOW when the count is at 15 while the UP clock is LOW, flagging an about-to-overflow. BO goes LOW when the count is at 0 while the DOWN clock is LOW, flagging an about-to-underflow.',
          'To chain two chips into an 8 bit up/down counter, wire the CO of the low nibble to the UP input of the high nibble, and the BO of the low nibble to the DOWN input of the high nibble. Each time the low chip rolls past 15 going up, its carry clocks the high chip up by one; each time it rolls past 0 going down, its borrow clocks the high chip down.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Presettable divide-by-N: load a start value, count down to 0, and take BO as an output that repeats every N pulses.',
          'Up/down position or event counters, where separate sources increment and decrement the count.',
          'Wider counters (8, 12, 16 bits) by cascading through CO and BO.',
          'Simple manual counters on a breadboard, with two push buttons feeding the UP and DOWN clocks.',
        ],
      },
      {
        title: 'Gotchas and What Is Simplified',
        list: [
          'The clear is active HIGH here. That is unusual for 74-series parts, where clear is normally active LOW, so it is easy to wire backwards.',
          'The load is active LOW, the opposite polarity from clear. Keep LOAD HIGH during normal counting or the counter will keep reloading the data inputs.',
          'Always hold the clock you are not using HIGH. A stray LOW-to-HIGH edge on the idle clock will miscount.',
          'This model treats CO and BO as steady levels that track the count and clock. The real part emits a timed LOW pulse the same width as the count pulse; for cascading in the simulator the result is the same, but exact pulse widths and propagation delay are not modeled.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'B', type: 'input' },
      { pin: 2, name: 'QB', type: 'output' },
      { pin: 3, name: 'QA', type: 'output' },
      { pin: 4, name: 'DOWN', type: 'input' },
      { pin: 5, name: 'UP', type: 'input' },
      { pin: 6, name: 'QC', type: 'output' },
      { pin: 7, name: 'QD', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'D', type: 'input' },
      { pin: 10, name: 'C', type: 'input' },
      { pin: 11, name: 'LOAD', type: 'input' },
      { pin: 12, name: 'CO', type: 'output' },
      { pin: 13, name: 'BO', type: 'output' },
      { pin: 14, name: 'CLR', type: 'input' },
      { pin: 15, name: 'A', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_UPDOWN_DC',
        inputs: ['A', 'B', 'C', 'D', 'UP', 'DOWN', 'CLR', 'LOAD'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'CO', 'BO'],
      },
    ],
    sequential: true,
  },

  // ── 74240: Octal Buffer/Line Driver (inverting, 3-state) ───────────────
  /* Source: Texas Instruments, "SNx4LS24x, SNx4S24x Octal Buffers and Line
       Drivers With 3-State Outputs", SDLS144D (Apr. 1985, rev. Oct. 2016).
       [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls240.pdf.
       Verified: terminal assignment (§5 Pin Configuration and Functions, 20-pin
       DB/DW/J/N/NS/W top view + Pin Functions table), '240 Function Table
       (Table 1), '240 Logic Diagram (Figure 16 — inverters, output bubbles),
       Overview (§8.1), Feature Description (§8.3), and Features (§1), pages
       1/3/11/12, read as rendered PDF page images (issues.md C4 — never via a
       text summarizer).
     Source: Wikipedia contributors, "Three-state logic". [Online]. Available:
       https://en.wikipedia.org/wiki/Three-state_logic. Verified: the high-
       impedance (Hi-Z) state a 3-state output uses to release a shared bus. */
  // Pinout & logic VERIFIED CORRECT against the datasheet — pinout[]/gates[] unchanged.
  //   1G#=1, 1A1/1A2/1A3/1A4=2/4/6/8, 2Y4/2Y3/2Y2/2Y1=3/5/7/9, GND=10,
  //   2A1/2A2/2A3/2A4=11/13/15/17, 1Y4/1Y3/1Y2/1Y1=12/14/16/18, 2G#=19, VCC=20.
  //   Table 1 ('240): G#=L & A=L -> Y=H; G#=L & A=H -> Y=L; G#=H -> Y=Z (Hi-Z) —
  //   INVERTING, and BOTH enables active-LOW. Contrast the '244 (non-inverting,
  //   both enables active-LOW) and the '241 (non-inverting, 2G active-HIGH per
  //   the Pin Functions footnote). Each channel modeled with TRI_NOT_LO
  //   (OE=L -> Y=NOT A; OE=H -> Hi-Z). Simulator models ideal logic only — no
  //   ~15 ns tpd (§1), no bus-input hysteresis (§8.3.3), no PNP-input low DC
  //   loading (§8.3.2), no power-up Hi-Z pull-up on G# (§8.1).
  '74x240': {
    name: '74x240',
    simpleName: 'Octal Inverting Buffer (3-state)',
    description: 'Octal inverting buffer/line driver with tri state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls240.pdf',
    tags: ['buffer', 'driver', 'octal', 'tri state', 'inverting'],
    guideOverview: 'The 74x240 is an octal (eight channel) inverting buffer, also called a line driver. It re-drives eight input signals at its outputs with more current, and flips each one on the way through: a HIGH going in comes out LOW, and a LOW going in comes out HIGH. That inversion is the one thing that sets it apart from the otherwise identical 74x244. The eight channels are split into two independent 4 bit groups, each with its own active LOW output enable (1OE and 2OE). Pull an enable LOW and that group of four outputs drives the inverse of its inputs; pull it HIGH and those four outputs go to high impedance (Hi Z), which effectively disconnects them so another device can drive the same wires. That Hi Z ability is what lets the 240 gate signals onto a shared bus. People reach for it to strengthen a signal that has to drive a heavy load (a long trace, many inputs, a bank of LEDs) and to buffer a one way bus such as a processor address bus, in the cases where an inverted copy is fine or actually wanted. It is the inverting counterpart of the 74x244; the related 74x241 is non inverting and pairs one active LOW enable with one active HIGH enable, so check which part you actually have.',
    guidePinDescriptions: {
      '1OE': 'Output enable for group 1, active LOW. LOW makes outputs 1Y1–1Y4 drive the inverse of inputs 1A1–1A4; HIGH forces all four to high impedance (Hi Z). The bar over 1G on the datasheet marks it active LOW.',
      '2OE': 'Output enable for group 2, active LOW. LOW makes outputs 2Y1–2Y4 drive the inverse of inputs 2A1–2A4; HIGH forces all four to Hi Z. Tie 1OE and 2OE together to switch all eight channels at once.',
      '1A1': 'Data input, group 1 channel 1. When 1OE is LOW, output 1Y1 = NOT(1A1). Inputs 1A2–1A4 work the same for their own outputs.',
      '1Y1': 'Data output, group 1 channel 1. Equals NOT(1A1) when 1OE is LOW; Hi Z when 1OE is HIGH. Outputs 1Y2–1Y4 behave identically.',
      '2A1': 'Data input, group 2 channel 1. When 2OE is LOW, output 2Y1 = NOT(2A1). Inputs 2A2–2A4 work the same.',
      '2Y1': 'Data output, group 2 channel 1. Equals NOT(2A1) when 2OE is LOW; Hi Z when 2OE is HIGH. Outputs 2Y2–2Y4 behave identically.',
      'GND': 'Ground reference (pin 10).',
      'VCC': 'Positive supply, +5 V (pin 20).',
    },
    guideSections: [
      {
        title: 'How It Works',
        paragraphs: [
          'Each of the eight channels is one inverting tri state buffer: an input pin A feeds the output pin Y of the same number, and the output is the logical inverse of the input. When the buffer is enabled, a HIGH at A gives a LOW at Y and a LOW at A gives a HIGH at Y. The buffer also adds drive strength, so a weak signal that could only reach a load or two can now drive a long trace or a whole row of inputs, it just arrives inverted.',
          'A tri state (three state) output has a third state on top of HIGH and LOW: high impedance, or Hi Z. In Hi Z the pin is effectively disconnected, so it neither pulls the wire high nor low, and another device can drive that same wire without a fight. That is what lets several chips take turns on one shared bus.',
          'The eight buffers are split into two groups of four. Group 1 (inputs 1A1–1A4, outputs 1Y1–1Y4) is controlled by 1OE; group 2 (inputs 2A1–2A4, outputs 2Y1–2Y4) by 2OE. Both enables are active LOW: pull an enable LOW to turn its four buffers on, HIGH to send those four outputs to Hi Z. The two groups are independent, so you can enable one and float the other, or tie 1OE and 2OE together and use the whole chip as a single 8 bit inverting buffer.',
        ],
        formulas: [
          'Y = NOT(A)  when OE is LOW  (enabled, inverting)',
          'OE=L, A=L → Y=H | OE=L, A=H → Y=L | OE=H, A=X → Y=Z (Hi-Z)',
        ],
        note: 'The inputs and outputs are interleaved down the two sides of the package (each group’s inputs on one side, its outputs on the other) so a bus can flow straight through the chip for clean board routing, a layout convenience rather than a logic feature. The simulator models ideal logic only: it does not reproduce the roughly 15 ns propagation delay, the built-in input hysteresis, or the low DC loading of the PNP inputs on the real part.',
      },
      {
        title: 'Common Uses',
        list: [
          'Inverting bus driver: gating an inverted byte of data or a set of address lines onto a shared bus, then releasing it (Hi Z) so another device can drive those same lines. Handy when the receiving side expects the inverted signal or when you want the inversion anyway.',
          'Driving heavy loads: re-driving a clock or control line that must reach many inputs or a long PCB trace when the original source is too weak. Passing a signal through two 240s in series inverts it twice, so it comes back to its original sense with the extra drive.',
          'LED banks and indicators: an inverting output sinks current when it goes LOW, so a HIGH at the input can light an LED wired from +5 V through a resistor. The strong LOW-side drive suits common-anode displays.',
          'Splitting into two 4 bit buffers enabled separately, or joining them into one 8 bit inverting buffer by tying both enables together.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'It inverts. This is the trap: if you only want to strengthen a signal without flipping it, reach for the 74x244 (non inverting), not the 240. Grabbing the wrong one is the most common mistake with this family.',
          'The enables are active LOW. LOW turns a group on; HIGH turns it off (Hi Z). Both groups must be enabled (both pins LOW) to pass all eight channels.',
          'Hi Z is not logic LOW. A disabled output is disconnected, not driven to 0. If nothing else is driving that wire it floats, so a bus normally needs a pull-up or pull-down resistor (or one always-active driver) to hold a defined level when every buffer is off.',
          'Never let two enabled outputs fight on the same bus wire. Only one device should drive a shared line at a time; everything else must be in Hi Z. Two active outputs pushing opposite levels is a bus conflict that wastes current and can damage parts.',
          'It is a buffer, not a latch or a transceiver. It has no memory (each output just follows its input) and it drives one direction only, A to Y. For a bus that must move data both ways, use the 74x245 transceiver instead.',
          'On real hardware, if you need the bus released the instant power comes up, tie each enable to +5 V through a pull-up resistor so it starts HIGH (outputs Hi Z). The datasheet calls this out for power up and power down; the simulator does not model power sequencing.',
        ],
        note: 'Pick the family member by polarity: 74x240 inverts and has two active LOW enables; 74x244 does not invert and has two active LOW enables; 74x241 does not invert but pairs one active LOW enable with one active HIGH enable.',
      },
    ],
    pinout: [
      { pin:  1, name: '1OE', type: 'input',  description: 'Output enable for group 1 (active LOW). LOW enables 1Y1 1Y4 as inverting buffers; HIGH = Hi Z.' },
      { pin:  2, name: '1A1', type: 'input',  description: 'Input to inverting buffer 1A (group 1).' },
      { pin:  3, name: '2Y4', type: 'output', description: 'Inverted output 4 from group 2. Active when 2OE=LOW.' },
      { pin:  4, name: '1A2', type: 'input',  description: 'Input to inverting buffer 1B (group 1).' },
      { pin:  5, name: '2Y3', type: 'output', description: 'Inverted output 3 from group 2. Active when 2OE=LOW.' },
      { pin:  6, name: '1A3', type: 'input',  description: 'Input to inverting buffer 1C (group 1).' },
      { pin:  7, name: '2Y2', type: 'output', description: 'Inverted output 2 from group 2. Active when 2OE=LOW.' },
      { pin:  8, name: '1A4', type: 'input',  description: 'Input to inverting buffer 1D (group 1).' },
      { pin:  9, name: '2Y1', type: 'output', description: 'Inverted output 1 from group 2. Active when 2OE=LOW.' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: '2A1', type: 'input',  description: 'Input to inverting buffer 2A (group 2).' },
      { pin: 12, name: '1Y4', type: 'output', description: 'Inverted output 4 from group 1. Active when 1OE=LOW.' },
      { pin: 13, name: '2A2', type: 'input',  description: 'Input to inverting buffer 2B (group 2).' },
      { pin: 14, name: '1Y3', type: 'output', description: 'Inverted output 3 from group 1. Active when 1OE=LOW.' },
      { pin: 15, name: '2A3', type: 'input',  description: 'Input to inverting buffer 2C (group 2).' },
      { pin: 16, name: '1Y2', type: 'output', description: 'Inverted output 2 from group 1. Active when 1OE=LOW.' },
      { pin: 17, name: '2A4', type: 'input',  description: 'Input to inverting buffer 2D (group 2).' },
      { pin: 18, name: '1Y1', type: 'output', description: 'Inverted output 1 from group 1. Active when 1OE=LOW.' },
      { pin: 19, name: '2OE', type: 'input',  description: 'Output enable for group 2 (active LOW). LOW enables 2Y1 2Y4 as inverting buffers; HIGH = Hi Z.' },
      { pin: 20, name: 'VCC', type: 'power' },
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

  // ── 74244: Octal Buffer/Line Driver (non-inverting, 3-state) ───────────
  /* Source: Texas Instruments, "SNx4LS24x, SNx4S24x Octal Buffers and Line
       Drivers With 3-State Outputs", SDLS144D (Apr. 1985, rev. Oct. 2016).
       [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls244.pdf.
       Verified: terminal assignment (§5 Pin Configuration and Functions, 20-pin
       DB/DW/J/N/NS/W top view + Pin Functions table), '244 Function Table
       (Table 3), Logic Diagram (Figure 18), and Overview (§8.1), pages
       1/3/11/12, read as rendered PDF page images (issues.md C4 — never via a
       text summarizer).
     Source: Wikipedia contributors, "Three-state logic". [Online]. Available:
       https://en.wikipedia.org/wiki/Three-state_logic. Verified: the high-
       impedance (Hi-Z) state a 3-state output uses to release a shared bus. */
  // Pinout & logic VERIFIED CORRECT against the datasheet — pinout[]/gates[] unchanged.
  //   1G#=1, 1A1/1A2/1A3/1A4=2/4/6/8, 2Y4/2Y3/2Y2/2Y1=3/5/7/9, GND=10,
  //   2A1/2A2/2A3/2A4=11/13/15/17, 1Y4/1Y3/1Y2/1Y1=12/14/16/18, 2G#=19, VCC=20.
  //   Table 3 ('244): G#=L & A=L -> Y=L; G#=L & A=H -> Y=H; G#=H -> Y=Z (Hi-Z).
  //   Non-inverting (Figure 18, no output bubbles) and BOTH enables active-LOW —
  //   unlike the '241, whose 2G is active-HIGH (Pin Functions footnote), and
  //   unlike the inverting '240. Each channel modeled with TRI_BUFFER_LO
  //   (OE=L -> Y=A; OE=H -> Hi-Z). Simulator models ideal logic only — no 15 ns
  //   tpd, no input hysteresis, no PNP-input low-loading, no power-up pull-up.
  '74x244': {
    name: '74x244',
    simpleName: 'Octal Buffer (non inv, 3-state)',
    description: 'Octal non inverting buffer/line driver with tri state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls244.pdf',
    tags: ['buffer', 'driver', 'octal', 'tri state', 'non inverting'],
    guideOverview: 'The 74x244 is an octal (eight channel) non inverting buffer, also called a line driver. It re-drives eight input signals at its outputs with more current, without changing their logic levels: a HIGH stays HIGH and a LOW stays LOW. The eight channels are split into two independent 4 bit groups, each with its own active LOW output enable (1OE and 2OE). Pull an enable LOW and that group of four outputs follows its inputs; pull it HIGH and those outputs go to high impedance (Hi Z), which effectively disconnects them so another device can drive the same wires. That Hi Z ability is what lets the 244 gate signals onto a shared bus. Its two everyday jobs are strengthening a signal that has to drive a heavy load (a long trace, many inputs, LEDs) and buffering a one way bus such as a processor address bus or an input port. It is the non inverting counterpart of the inverting 74x240; the related 74x241 is also non inverting but has one active HIGH enable instead of two active LOW, so check which part you actually have.',
    guidePinDescriptions: {
      '1OE': 'Output enable for group 1, active LOW. LOW makes outputs 1Y1–1Y4 follow inputs 1A1–1A4; HIGH forces all four to high impedance (Hi Z). The bar over 1G on the datasheet marks it active LOW.',
      '2OE': 'Output enable for group 2, active LOW. LOW makes outputs 2Y1–2Y4 follow inputs 2A1–2A4; HIGH forces all four to Hi Z. Tie 1OE and 2OE together to switch all eight channels at once.',
      '1A1': 'Data input, group 1 channel 1. When 1OE is LOW, output 1Y1 = 1A1. Inputs 1A2–1A4 work the same for their own outputs.',
      '1Y1': 'Data output, group 1 channel 1. Equals 1A1 when 1OE is LOW; Hi Z when 1OE is HIGH. Outputs 1Y2–1Y4 behave identically.',
      '2A1': 'Data input, group 2 channel 1. When 2OE is LOW, output 2Y1 = 2A1. Inputs 2A2–2A4 work the same.',
      '2Y1': 'Data output, group 2 channel 1. Equals 2A1 when 2OE is LOW; Hi Z when 2OE is HIGH. Outputs 2Y2–2Y4 behave identically.',
      'GND': 'Ground reference (pin 10).',
      'VCC': 'Positive supply, +5 V (pin 20).',
    },
    guideSections: [
      {
        title: 'How It Works',
        paragraphs: [
          'Each of the eight channels is one non inverting tri state buffer: an input pin A feeds the output pin Y of the same number. When the buffer is enabled the output copies the input, with no inversion (that is the difference from the 74x240). The buffer adds drive strength, so a weak signal that could only reach one or two inputs can now drive a long trace or a whole row of loads.',
          'A tri state (three state) output has a third state on top of HIGH and LOW: high impedance, or Hi Z. In Hi Z the pin is effectively disconnected, so it neither pulls the wire high nor low and another device can drive that same wire without a fight. That is what lets several chips take turns on one shared bus.',
          'The eight buffers are split into two groups of four. Group 1 (inputs 1A1–1A4, outputs 1Y1–1Y4) is controlled by 1OE; group 2 (inputs 2A1–2A4, outputs 2Y1–2Y4) by 2OE. Both enables are active LOW: pull an enable LOW to turn its four buffers on, HIGH to send those four outputs to Hi Z. The two groups are independent, so you can enable one and float the other, or tie 1OE and 2OE together and use the whole chip as a single 8 bit buffer.',
        ],
        formulas: [
          'Y = A  when OE is LOW  (enabled, non inverting)',
          'OE=L, A=L → Y=L | OE=L, A=H → Y=H | OE=H, A=X → Y=Z (Hi-Z)',
        ],
        note: 'The inputs and outputs are interleaved down the two sides of the package (each group’s inputs on one side, its outputs on the other) so a bus can flow straight through the chip for clean board routing. That is a layout convenience, not a logic feature.',
      },
      {
        title: 'Common Uses',
        list: [
          'Buffering a one way bus: gating a byte of data or a set of address lines onto a shared bus, then releasing it (Hi Z) so another device can drive those same lines.',
          'Input ports: reading eight switches, buttons, or sensor lines onto a data bus only when the processor selects that port (enable LOW), Hi Z the rest of the time.',
          'Driving heavy loads: re-driving a clock or control signal that has to reach many inputs or a long PCB trace when the original source is too weak.',
          'Splitting into two 4 bit buffers enabled separately, or joining them into one 8 bit buffer by tying both enables together.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'The enables are active LOW. It is easy to wire one expecting HIGH = on; here LOW turns a group on and HIGH turns it off (Hi Z). Both groups must be enabled (both pins LOW) to pass all eight channels.',
          'It is a buffer, not a latch or a transceiver. It has no memory (the output just follows the input) and it only drives one direction, A to Y. For a bus that must move data both ways, use the 74x245 transceiver instead.',
          'Never let two enabled outputs fight on the same bus wire. Only one device should drive a shared line at a time; everything else must be in Hi Z. Two active outputs pushing opposite levels is a bus conflict that wastes current and can damage parts.',
          'On real hardware, if you need the bus released the instant power comes up, tie the enable to +5 V through a pull-up resistor so it starts HIGH (outputs Hi Z). The datasheet calls this out for power up and power down; the simulator does not model power sequencing.',
        ],
        note: 'Pick the family member by polarity: 74x240 inverts and has two active LOW enables; 74x244 does not invert and has two active LOW enables; 74x241 does not invert but pairs one active LOW enable with one active HIGH enable.',
      },
    ],
    pinout: [
      { pin:  1, name: '1OE', type: 'input',  description: 'Output enable for group 1 (active LOW). LOW enables 1Y1 1Y4 as non inverting buffers; HIGH = Hi Z.' },
      { pin:  2, name: '1A1', type: 'input',  description: 'Input to non inverting buffer 1A (group 1).' },
      { pin:  3, name: '2Y4', type: 'output', description: 'Non inverting output 4 from group 2. Active when 2OE=LOW.' },
      { pin:  4, name: '1A2', type: 'input',  description: 'Input to non inverting buffer 1B (group 1).' },
      { pin:  5, name: '2Y3', type: 'output', description: 'Non inverting output 3 from group 2. Active when 2OE=LOW.' },
      { pin:  6, name: '1A3', type: 'input',  description: 'Input to non inverting buffer 1C (group 1).' },
      { pin:  7, name: '2Y2', type: 'output', description: 'Non inverting output 2 from group 2. Active when 2OE=LOW.' },
      { pin:  8, name: '1A4', type: 'input',  description: 'Input to non inverting buffer 1D (group 1).' },
      { pin:  9, name: '2Y1', type: 'output', description: 'Non inverting output 1 from group 2. Active when 2OE=LOW.' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: '2A1', type: 'input',  description: 'Input to non inverting buffer 2A (group 2).' },
      { pin: 12, name: '1Y4', type: 'output', description: 'Non inverting output 4 from group 1. Active when 1OE=LOW.' },
      { pin: 13, name: '2A2', type: 'input',  description: 'Input to non inverting buffer 2B (group 2).' },
      { pin: 14, name: '1Y3', type: 'output', description: 'Non inverting output 3 from group 1. Active when 1OE=LOW.' },
      { pin: 15, name: '2A3', type: 'input',  description: 'Input to non inverting buffer 2C (group 2).' },
      { pin: 16, name: '1Y2', type: 'output', description: 'Non inverting output 2 from group 1. Active when 1OE=LOW.' },
      { pin: 17, name: '2A4', type: 'input',  description: 'Input to non inverting buffer 2D (group 2).' },
      { pin: 18, name: '1Y1', type: 'output', description: 'Non inverting output 1 from group 1. Active when 1OE=LOW.' },
      { pin: 19, name: '2OE', type: 'input',  description: 'Output enable for group 2 (active LOW). LOW enables 2Y1 2Y4 as non inverting buffers; HIGH = Hi Z.' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'TRI_BUFFER_LO', inputs: ['1A1', '1OE'], output: '1Y1' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A2', '1OE'], output: '1Y2' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A3', '1OE'], output: '1Y3' },
      { type: 'TRI_BUFFER_LO', inputs: ['1A4', '1OE'], output: '1Y4' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A1', '2OE'], output: '2Y1' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A2', '2OE'], output: '2Y2' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A3', '2OE'], output: '2Y3' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A4', '2OE'], output: '2Y4' },
    ],
  },

  // ── 74245: Octal Bus Transceiver (tri state) ──────────────────────────
  /* Source: Texas Instruments, "SN54LS245, SN74LS245 Octal Bus Transceivers With
       3-State Outputs", SDLS146B (Oct. 1976, rev. Sep. 2016). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls245.pdf. Verified: terminal assignment
       (§6 Pin Configuration, 20-pin J/W/DB/DW/N/NS top view) + Pin Functions table +
       Device Functional Modes (§9.4) + Feature Description (§9.3), pages 1/3/8, read
       as rendered PDF page images (issues.md C4 — never via a text summarizer).
     Source: Wikipedia contributors, "Three-state logic". [Online]. Available:
       https://en.wikipedia.org/wiki/Three-state_logic. Verified: the high-impedance
       (Hi-Z) output state a chip uses to release a shared bus. */
  // Pinout & logic VERIFIED CORRECT against the datasheet — pinout[]/gates[] unchanged.
  //   DIR=1, A1..A8=2..9, GND=10, B8..B1=11..18, OE#=19, VCC=20.
  //   Function table (§6 Pin Functions / §9.4): OE#=H -> both buses Hi-Z (isolated);
  //   OE#=L & DIR=H -> A->B; OE#=L & DIR=L -> B->A. Notable, per §9.3: bus inputs have
  //   built-in hysteresis (noise margin), PNP inputs cut DC bus loading, and the
  //   3-state outputs drive bus lines directly (24 mA sink on the 74LS245, §5).
  //   Simulator models ideal logic only — no ~8 ns propagation delay, no hysteresis.
  '74x245': {
    name: '74x245',
    simpleName: 'Octal Bus Transceiver',
    description: 'Octal bidirectional bus transceiver with tri state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls245.pdf',
    tags: ['transceiver', 'bus', 'octal', 'tri state', 'bidirectional'],
    guideOverview: 'The 74x245 is an 8 bit bidirectional bus transceiver: eight buffers wired back to back so a whole byte can pass either way between two buses, called the A side and the B side. Two pins control all eight channels at once. DIR sets the direction: HIGH sends A to B, LOW sends B to A. OE is an active LOW output enable: LOW turns the transceiver on, HIGH forces every channel to high impedance so both buses let go and something else can drive them. There is only one DIR pin, so the whole byte always moves the same way; you cannot send some bits one direction and the rest the other. It is the standard part for buffering and isolating a shared data bus, such as the link between a processor and its memory.',
    guidePinDescriptions: {
      DIR: 'Direction control. HIGH sends A→B (A side drives B side); LOW sends B→A. This one pin sets the direction for all eight channels at once.',
      OE: 'Output enable, active LOW. LOW turns the transceiver on; HIGH forces all eight channels to high impedance, releasing both buses. The bar over OE on the datasheet marks it active LOW.',
      A1: 'Channel 1, A side. A bus line: an input when DIR=HIGH, an output when DIR=LOW (with OE LOW). High impedance whenever OE is HIGH.',
      A8: 'Channel 8, A side. Same behaviour as A1; A2–A7 are identical.',
      B1: 'Channel 1, B side. A bus line: an output when DIR=HIGH, an input when DIR=LOW (with OE LOW). High impedance whenever OE is HIGH.',
      B8: 'Channel 8, B side. Same behaviour as B1; B2–B7 are identical.',
      GND: 'Ground reference (pin 10).',
      VCC: 'Positive supply, +5 V (pin 20).',
    },
    guideSections: [
      {
        title: 'How It Works',
        paragraphs: [
          'Each of the eight channels is a pair of tri state buffers wired in opposite directions between an A pin and its matching B pin: A1 to B1, A2 to B2, and so on. DIR and OE decide which buffer of each pair, if any, is driving.',
          'A tri state (three state) output has a third state on top of HIGH and LOW: high impedance, or Hi Z. In Hi Z the pin is effectively disconnected, so it neither pulls the line high nor low and another device can drive that same wire without a fight. That is what lets several chips share one bus.',
          'When OE is LOW, DIR picks the direction: HIGH reads the A pins and drives the B pins, LOW reads the B pins and drives the A pins. The side being driven acts as an output; the other side acts as an input. When OE is HIGH, every buffer goes Hi Z and the chip lets go of both buses.',
        ],
        formulas: [
          'OE=H, DIR=X → both buses Hi-Z (isolated)',
          'OE=L, DIR=H → A → B  (A inputs, B outputs)',
          'OE=L, DIR=L → B → A  (B inputs, A outputs)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Buffering a shared data bus so a weak source does not have to drive the whole bus. The 74x245 drives the bus lines directly, with more current than a typical logic output.',
          'Switching a bidirectional data bus between read and write: tie DIR to the read/write line and OE to the chip select, and the same eight wires carry data both ways.',
          'Isolating a card or subsystem from the main bus. Pull OE HIGH and the whole byte disconnects, so the rest of the system keeps running.',
          'Boosting fan-out: one driver feeds many inputs through the transceiver instead of loading the original source.',
        ],
      },
      {
        title: 'Gotchas',
        paragraphs: [
          'OE is active LOW: LOW is on, HIGH is off. Leave it HIGH and the chip stays isolated and does nothing, which is a common wiring mistake.',
          'Never enable the 74x245 onto a line that another device is already driving. Two outputs fighting over one wire is bus contention; it corrupts the data and can overheat the parts. DIR and OE are almost always driven by address-decode or read/write logic, not left floating.',
          'There is only one DIR for all eight bits, so every channel moves the same direction. If you need some lines going one way and others the other way at the same time, this is the wrong chip.',
          'Simplification: the real part adds a small propagation delay (about 8 ns typical, port to port on the 74LS245) and gives its bus inputs built-in hysteresis for noise immunity. The simulator treats each channel as ideal logic that switches instantly, with no delay and no hysteresis.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'DIR', type: 'input',  description: 'Direction select. HIGH = A→B (A side drives B side); LOW = B→A (B side drives A side).' },
      { pin:  2, name: 'A1',  type: 'input',  description: 'Bidirectional bus line A1. Drives B1 when DIR=HIGH; receives from B1 when DIR=LOW.' },
      { pin:  3, name: 'A2',  type: 'input',  description: 'Bidirectional bus line A2.' },
      { pin:  4, name: 'A3',  type: 'input',  description: 'Bidirectional bus line A3.' },
      { pin:  5, name: 'A4',  type: 'input',  description: 'Bidirectional bus line A4.' },
      { pin:  6, name: 'A5',  type: 'input',  description: 'Bidirectional bus line A5.' },
      { pin:  7, name: 'A6',  type: 'input',  description: 'Bidirectional bus line A6.' },
      { pin:  8, name: 'A7',  type: 'input',  description: 'Bidirectional bus line A7.' },
      { pin:  9, name: 'A8',  type: 'input',  description: 'Bidirectional bus line A8.' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'B8',  type: 'input',  description: 'Bidirectional bus line B8. Drives A8 when DIR=LOW; receives from A8 when DIR=HIGH.' },
      { pin: 12, name: 'B7',  type: 'input',  description: 'Bidirectional bus line B7.' },
      { pin: 13, name: 'B6',  type: 'input',  description: 'Bidirectional bus line B6.' },
      { pin: 14, name: 'B5',  type: 'input',  description: 'Bidirectional bus line B5.' },
      { pin: 15, name: 'B4',  type: 'input',  description: 'Bidirectional bus line B4.' },
      { pin: 16, name: 'B3',  type: 'input',  description: 'Bidirectional bus line B3.' },
      { pin: 17, name: 'B2',  type: 'input',  description: 'Bidirectional bus line B2.' },
      { pin: 18, name: 'B1',  type: 'input',  description: 'Bidirectional bus line B1. Drives A1 when DIR=LOW; receives from A1 when DIR=HIGH.' },
      { pin: 19, name: 'OE',  type: 'input',  description: 'Output enable, active LOW. LOW = transceiver operational; HIGH = all 8 channels Hi Z.' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'TRANSCEIVER_8BIT',
        inputs: ['A1','A2','A3','A4','A5','A6','A7','A8','B1','B2','B3','B4','B5','B6','B7','B8','DIR','OE'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8','B1','B2','B3','B4','B5','B6','B7','B8'],
      },
    ],
  },

  // ── 74257: Quad 2-to-1 data selector/multiplexer, 3-state ─────────────────
  /* Primary source: Texas Instruments, "SN54LS257B, SN54LS258B, SN54S257,
     SN54S258, SN74LS257B, SN74LS258B, SN74S257, SN74S258 Quadruple 2-Line to
     1-Line Data Selectors/Multiplexers," SDLS148 (orig. Oct. 1976, rev. Mar.
     1988). [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls257b.pdf.
     Verified: 16-pin terminal assignment (J/W and D/N packages, TOP VIEW, p. 1),
     the FUNCTION TABLE for the non-inverting '257/'LS257B column (p. 1), and the
     positive-logic logic diagram with explicit pin numbers ('257B, p. 2) — all
     read as rendered 300-dpi PDF page images per issues.md C4, NOT the text
     summarizer. pinout[] and the four MUX_2TO1_TRI gates[] confirmed against this;
     engine (js/specificChipsSim.js _evaluateMux2to1Tri) left unchanged.
       Pin numbers: SEL=1 1A=2 1B=3 1Y=4 2A=5 2B=6 2Y=7 GND=8 3Y=9 3B=10 3A=11
       4Y=12 4B=13 4A=14 OE=15 VCC=16. The datasheet labels the select pin "A̅/B"
       (pin 1) and the output control "G̅" (pin 15); this entry uses the clearer
       names SEL and OE, matching the CD40257 sibling and the MUX_2TO1_TRI
       primitive. Function table ('257 column): OE(G̅)=H → all four outputs Z;
       OE=L, SEL(A̅/B)=L → Y=A; OE=L, SEL=H → Y=B; non-inverting.
     3-state contrast (for the "bus sharing" teaching point): the non-3-state
     sibling SN74LS157 forces its outputs LOW when disabled and cannot be bused —
     see the 74x157 entry (chips5.js) / TI SDLS058. The inverting version is the
     '258 (same pinout, Y = complement). Per the datasheet feature list (p. 1)
     the '257 shares the '157/'158 pin assignments. Trusted this datasheet for
     every pin and behavioral claim above.
     Multiplexer concept: https://en.wikipedia.org/wiki/Multiplexer
     Three-state (tri-state) logic: https://en.wikipedia.org/wiki/Three-state_logic
     Average propagation delay from a data input ('LS257B 9 ns typ, 'S257 4.8 ns
     typ, p. 1) is modeled as zero (LIVE mode): issues.md A1. */
  '74x257': {
    name: '74x257',
    simpleName: 'Quad 2-to-1 Mux (TS)',
    description: 'Quad 2-to-1 mux, shared select, 3-state outputs. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls257b.pdf',
    tags: ['multiplexer', 'mux', '2-to-1', 'data selector', 'quad', 'tri state'],
    guideOverview: 'The 74x257 is four 2-to-1 multiplexers in one 16-pin chip. A multiplexer (mux) is a controlled switch: each section has two data inputs, A and B, and one output, and a select line picks which input reaches the output. All four sections share the one SEL pin, so a single line routes a whole 4-bit word from either the A source or the B source. The outputs are non-inverting, so the chosen input passes through unchanged. What sets the 74x257 apart from the plain 74x157 mux is its three-state outputs: a separate active-LOW output-enable pin (OE) can release all four outputs into a high-impedance state, electrically disconnecting them from the wire instead of driving a level. That is what lets several of these share one bus. Reach for the 74x257 when a mux output has to join a shared bus; use the 74x258 if you want the inverted result.',
    guidePinDescriptions: {
      SEL: 'Shared select input (pin 1; the datasheet calls it A̅/B). LOW routes every A input to its output; HIGH routes every B input.',
      '1A': 'A data input of multiplexer 1.',
      '1B': 'B data input of multiplexer 1.',
      '1Y': 'Output of multiplexer 1. Follows 1A when SEL is LOW, 1B when SEL is HIGH; high-impedance when OE is HIGH.',
      '2A': 'A data input of multiplexer 2.',
      '2B': 'B data input of multiplexer 2.',
      '2Y': 'Output of multiplexer 2. Follows 2A when SEL is LOW, 2B when SEL is HIGH; high-impedance when OE is HIGH.',
      GND: 'Ground reference (pin 8).',
      '3Y': 'Output of multiplexer 3. Follows 3A when SEL is LOW, 3B when SEL is HIGH; high-impedance when OE is HIGH.',
      '3B': 'B data input of multiplexer 3.',
      '3A': 'A data input of multiplexer 3.',
      '4Y': 'Output of multiplexer 4. Follows 4A when SEL is LOW, 4B when SEL is HIGH; high-impedance when OE is HIGH.',
      '4B': 'B data input of multiplexer 4.',
      '4A': 'A data input of multiplexer 4.',
      OE: 'Active-LOW output enable (pin 15; the datasheet calls it G̅). LOW lets all four outputs drive; HIGH puts them all into high-impedance, disconnected from the bus.',
      VCC: 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How a 2-to-1 Multiplexer Works',
        paragraphs: [
          'A multiplexer, or mux, is an electrically controlled switch. Each of the four sections has two data inputs, A and B, and one output Y. The single select pin, SEL, decides which input reaches the output: SEL LOW connects A, SEL HIGH connects B. All four sections share that one SEL pin, so they switch together, one line steering a whole 4-bit word from either the A source or the B source.',
          'The outputs are non-inverting: the level on the chosen input appears at the output unchanged. If you want the complement instead, the 74x258 is the same part with inverting outputs.',
        ],
        formulas: [
          'Y = A when SEL = 0,   Y = B when SEL = 1   (outputs enabled)',
          'SEL=0 → Y = A  |  SEL=1 → Y = B',
        ],
      },
      {
        title: 'Three-State Outputs (the OE pin)',
        paragraphs: [
          'Besides SEL there is a second control, OE (output enable). It is active LOW: a LOW on OE turns the outputs on, a HIGH turns them off. "Off" does not mean logic 0 here. It means high-impedance, often written Z: the output drivers both switch off and the pin effectively disconnects from the wire, driving neither HIGH nor LOW.',
          'High-impedance is what lets several chips share one set of wires (a bus). Tie the outputs of several 74x257s together, enable just one at a time with its OE, and only that chip drives the bus while the rest let go. This is the difference behind the part number: the plain 74x157 mux forces its outputs LOW when disabled instead of releasing them, so 157 outputs cannot be bused together, but 257 outputs can.',
        ],
        formulas: [
          'OE = 1 → Y = Z (high-impedance, all four sections)',
          'OE = 0, SEL = 0 → Y = A    |    OE = 0, SEL = 1 → Y = B',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Source select for a bus: pick a 4-bit word from one of two sources (say a counter versus a fixed value, or two registers) and pass it on. Two 74x257s cover an 8-bit word.',
          'Address multiplexing for dynamic RAM: older DRAM takes a row address and then a column address on the same pins, so SEL is toggled to send first one half of the address, then the other.',
          'Shared-bus driver: several 74x257s feeding a common bus, each switched on by its OE in turn, so exactly one stage drives the wires at a time.',
          'Mode or channel switch: route between two sets of data or control signals under a single select bit.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'SEL and OE are shared by all four sections; there is no per-section control. Flip SEL and all four outputs switch source at once; raise OE and all four go high-impedance. If sections must switch independently, use separate mux chips.',
          'OE is active LOW. A LOW enables the outputs; a HIGH disables them. Tie OE LOW if you always want the outputs live, leaving it floating or HIGH leaves the whole chip disconnected from its outputs.',
          'Disabled means high-impedance, not 0. A disabled output is released, not a logic LOW. That is exactly what lets it share a bus, but it also means something else must drive the wire (another chip, or a pull-up/pull-down resistor) when every 74x257 on it is disabled, otherwise the level is undefined.',
          'It is non-inverting. Y matches the selected input. If you expected the complement, that is the 74x258.',
          'Do not leave data inputs floating. Tie unused A/B inputs to a defined HIGH or LOW so the routed value is predictable.',
        ],
        note: 'Real outputs are not instant, and switching the enable is not instant either. The common 74LS257B takes about 9 ns typ from a data input to the output; the faster 74S257 about 4.8 ns. The simulator treats these delays as zero, a simplification: it settles to the correct final logic levels but does not reproduce the brief timing glitches that real propagation and enable/disable delays can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: 'SEL', type: 'input' },
      { pin: 2, name: '1A', type: 'input' },
      { pin: 3, name: '1B', type: 'input' },
      { pin: 4, name: '1Y', type: 'output' },
      { pin: 5, name: '2A', type: 'input' },
      { pin: 6, name: '2B', type: 'input' },
      { pin: 7, name: '2Y', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: '3Y', type: 'output' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '3A', type: 'input' },
      { pin: 12, name: '4Y', type: 'output' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: '4A', type: 'input' },
      { pin: 15, name: 'OE', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'MUX_2TO1_TRI', inputs: ['1A', '1B', 'SEL', 'OE'], output: '1Y' },
      { type: 'MUX_2TO1_TRI', inputs: ['2A', '2B', 'SEL', 'OE'], output: '2Y' },
      { type: 'MUX_2TO1_TRI', inputs: ['3A', '3B', 'SEL', 'OE'], output: '3Y' },
      { type: 'MUX_2TO1_TRI', inputs: ['4A', '4B', 'SEL', 'OE'], output: '4Y' },
    ],
  },

  // ── 74259: 8-Bit Addressable Latch ─────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN54259, SN54LS259B, SN74259, SN74LS259B
     8-Bit Addressable Latches," SDLS086 (Dec. 1983, rev. Mar. 1988). [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls259b.pdf. Verified: the
     N/J/W-package terminal assignment (TOP VIEW, p. 1), the FUNCTION TABLE +
     LATCH SELECTION TABLE (p. 2), and the switching characteristics (p. 3), all
     read as rendered ~300-dpi PDF page images per issues.md C4 — NOT the text
     summarizer. Confirms pins S0=1, S1=2, S2=3, Q0=4, Q1=5, Q2=6, Q3=7, GND=8,
     Q4=9, Q5=10, Q6=11, Q7=12, D=13, G(active LOW)=14, CLR(active LOW)=15,
     VCC=16, and the four modes below (CLR,G both active LOW): H,L = addressable
     latch; H,H = memory; L,L = 8-line demultiplexer; L,H = clear. Address =
     4·S2 + 2·S1 + S0. tPLH/tPHL ~11-17 ns typ (25-28 ns max) at VCC=5 V.
     CMOS second source (same pinout, same four modes — confirms the family map):
     Texas Instruments, "SNx4HC259 8-Bit Addressable Latches," SCLS134F (Dec.
     1982, rev. Mar. 2022). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74hc259.pdf. Verified: functional block
     diagram with explicit pin numbers (p. 1) — same S0-S2 / D=13 / G=14 / CLR=15
     map, typ tpd 14 ns; read as PDF page images.
     PIN LABELS: both TI datasheets label the three address inputs S0-S2 and put
     bars over G and CLR (active LOW). 74Sim keeps the A0-A2 labels used by its
     sibling addressable-latch entries (74x4724, CD4099, CD4724) for consistency
     — same pins 1/2/3, same function. The pinout[] pin NUMBERS are verified
     against the TI datasheets above.
     ENGINE FIX (issues.md C116): the shared ADDRESSABLE_LATCH default path
     modeled only 3 of the 4 modes — CLR=L forced ALL outputs to 0, so the
     datasheet's 8-line demultiplexer mode (CLR=L, G=L: addressed output = D,
     others = 0) was wrong (the addressed output never went HIGH even with D=1).
     Fixed in js/specificChipsSim.js; regression:
     js/debug/scenarios/74x259-addressable-latch.mjs. The same fix corrects the
     identical bug in the 74x4724 (74HC259) sibling, which shares this path.
     Latch concept: Wikipedia contributors, "Flip-flop (electronics)." [Online].
     Available: https://en.wikipedia.org/wiki/Flip-flop_(electronics).
     Propagation delay and setup/hold windows modeled as zero (LIVE mode): A1. */
  '74x259': {
    name: '74x259',
    simpleName: '8 bit Addr Latch',
    description: '8-bit addressable latch with async clear and demux mode. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls259b.pdf',
    tags: ['latch', 'addressable', 'demultiplexer', '8 bit', 'sequential'],
    guideOverview: 'The 74x259 is an 8 bit register you write one bit at a time. Instead of eight data pins it has a single D input and a 3 bit address (A0-A2) that picks which one of the eight outputs (Q0-Q7) you are writing; the other seven hold whatever they had. That turns a small interface, three address lines, one data line, and one strobe, into eight output bits you can set or clear individually, which is handy when a microcontroller needs a few separate control lines without spending a whole port. Two control pins shape it. G is an active LOW write strobe: LOW writes the addressed bit, HIGH freezes all eight. CLR is an active LOW asynchronous clear that forces every output to 0 the moment it goes LOW, with no strobe needed. Together they give four modes, including a demultiplexer mode: with CLR LOW and G LOW the addressed output follows D while the other seven stay at 0, steering one data line to one of eight destinations. The outputs are ordinary push-pull and always driven, so you cannot wire two of them together or park them on a shared bus.',
    guidePinDescriptions: {
      A0: 'Address bit 0 (LSB). With A1 and A2 it picks which one of the eight latches (Q0-Q7) the next write targets.',
      A1: 'Address bit 1.',
      A2: 'Address bit 2 (MSB). The address value is A2×4 + A1×2 + A0, so 000 picks Q0 and 111 picks Q7.',
      D: 'Data input. Its value is written into the addressed latch while G is LOW.',
      G: 'Write strobe, active LOW. LOW lets the addressed latch follow D; HIGH makes all eight latches hold their value.',
      CLR: 'Clear, active LOW and asynchronous. LOW forces all eight outputs to 0 immediately, with no strobe; must be HIGH for normal latch operation.',
      Q0: 'Stored output bit 0. Holds its value until it is addressed and rewritten, or CLR clears it. Always driven.',
      Q1: 'Stored output bit 1. Always driven.',
      Q2: 'Stored output bit 2. Always driven.',
      Q3: 'Stored output bit 3. Always driven.',
      Q4: 'Stored output bit 4. Always driven.',
      Q5: 'Stored output bit 5. Always driven.',
      Q6: 'Stored output bit 6. Always driven.',
      Q7: 'Stored output bit 7. Always driven.',
      GND: 'Ground reference (pin 8).',
      VCC: 'Positive supply, +5 V (pin 16).',
    },
    guideSections: [
      {
        title: 'Writing One Bit At A Time',
        paragraphs: [
          'Inside are eight single-bit latches, Q0 through Q7. The three address pins A0-A2 form a 3 bit number that points at exactly one of them. While G is LOW the value on D is copied into that one addressed latch; the other seven ignore D and keep their old values. To build up a pattern you set the address, put the bit on D, pulse G LOW, then move on to the next bit.',
          'This is what "addressable" means here: you never rewrite the whole byte, only the one bit you name. Change the address with G held HIGH and nothing moves, the outputs just sit there holding the last pattern you wrote.',
        ],
        formulas: [
          'A2 A1 A0  ->  latch written        (address = A2×4 + A1×2 + A0)',
          ' 0  0  0  ->  Q0',
          ' 0  0  1  ->  Q1',
          ' 0  1  0  ->  Q2      ...      1  1  0  ->  Q6',
          ' 1  1  1  ->  Q7',
        ],
      },
      {
        title: 'The Four Modes',
        paragraphs: [
          'The two control pins, CLR and G, together pick one of four behaviors. Both are active LOW, so a floating or HIGH control pin is the "do nothing" state.',
          'The demultiplexer mode is worth a second look. With CLR held LOW the seven unaddressed outputs are pinned at 0, and with G LOW the addressed one follows D. Move the address around and you steer the single D input to whichever output you point at, exactly what a 1-of-8 demultiplexer does, with the data active HIGH.',
        ],
        formulas: [
          'CLR  G  ->  mode',
          ' H   L  ->  addressable latch: addressed output = D, other seven hold',
          ' H   H  ->  memory: all eight outputs hold',
          ' L   L  ->  demultiplexer: addressed output = D, other seven forced to 0',
          ' L   H  ->  clear: all eight outputs forced to 0 (no strobe needed)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Expanding an output port: drive eight independent control lines (LEDs, relays, chip selects) from just three address lines, one data line, and one strobe.',
          'Setting or clearing one control bit without disturbing the other seven, because you address just that bit.',
          '1-of-8 demultiplexer: in demux mode, route one data line to one of eight outputs chosen by the address.',
          'Serial-to-parallel storage: TI lists it as a serial-holding register, clock bits in one at a time and read all eight out in parallel.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'G is a level, not an edge. While G is LOW the addressed latch is transparent, it follows D live, so whatever is on D when G returns HIGH is what gets stored. Keep D steady around the G edge.',
          'CLR is asynchronous. Pull it LOW and every output drops to 0 right away, ignoring G, the address, and D. Hold it HIGH for normal operation.',
          'The outputs are push-pull and always driven, there is no output enable and no high-Z state. Never wire two Q outputs together, and do not park them on a shared bus. If you need bus-friendly outputs, use an octal latch like the 74x373 instead.',
          'Naming: TI\'s SN74LS259B and SN74HC259 datasheets label the three address pins S0-S2 and put bars over G and CLR to mark them active LOW. Other makers and this simulator call the address pins A0-A2. Same pins, same function.',
        ],
        note: 'Real timing is not instant. On a 74LS259B a change takes roughly 12 to 17 ns typ to reach an output, and the datasheet wants D steady about 15 ns before the G edge (5 ns for the address) with the clear pulse held at least 15 ns. The simulator treats all of this as zero: it settles to the correct final logic levels but does not reproduce the brief glitches that real propagation and setup/hold limits can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: 'A0', type: 'input' },
      { pin: 2, name: 'A1', type: 'input' },
      { pin: 3, name: 'A2', type: 'input' },
      { pin: 4, name: 'Q0', type: 'output' },
      { pin: 5, name: 'Q1', type: 'output' },
      { pin: 6, name: 'Q2', type: 'output' },
      { pin: 7, name: 'Q3', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'Q4', type: 'output' },
      { pin: 10, name: 'Q5', type: 'output' },
      { pin: 11, name: 'Q6', type: 'output' },
      { pin: 12, name: 'Q7', type: 'output' },
      { pin: 13, name: 'D', type: 'input' },
      { pin: 14, name: 'G', type: 'input' },
      { pin: 15, name: 'CLR', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'ADDRESSABLE_LATCH',
        inputs: ['A0', 'A1', 'A2', 'D', 'G', 'CLR'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
      },
    ],
    sequential: true,
  },

  // ── 74273: Octal D flip-flop with clear ───────────────────────────────────
  /* Primary source: Texas Instruments, "SN54273, SN54LS273, SN74273, SN74LS273
     Octal D-Type Flip-Flop With Clear," SDLS090 (orig. Oct. 1976, rev. Mar. 1988).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls273.pdf. Verified:
     terminal diagram (J/W/N/DW package, TOP VIEW, p. 1), function table (each
     flip-flop, p. 1), and logic diagram with explicit pin numbers (p. 2), read as
     PDF page images per issues.md C4 — NOT the text summarizer.
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  // PINOUT FIX (issues.md C97): the hand-entered map had 3D/3Q swapped on pins
  // 6/7 and 7D/7Q swapped on pins 16/17 — the same bug the siblings 74x374 (C94)
  // and 74x373 (C96) carried, and which both notes predicted for this part. The
  // datasheet terminal diagram AND the page-2 logic diagram both put 3Q=6, 3D=7,
  // 7Q=16, 7D=17 — each side of the package runs Q,D,D,Q,Q,D,D,Q. Corrected below.
  // Logic is unaffected: D_FF_OCTAL keys off pin NAMES, not pin numbers, so 3D
  // still feeds 3Q and 7D still feeds 7Q — only the physical placement moved.
  // Eight positive-edge-triggered D flip-flops share one clock (pin 11) and one
  // direct (asynchronous), active-LOW clear (CLR, pin 1). Single-rail outputs
  // (Q only, no Q-bar) that are always driven — there is no output enable, so
  // unlike the tri-state 74x374 a 273 cannot be disconnected from a shared bus.
  '74x273': {
    name: '74x273',
    simpleName: 'Octal D FF',
    description: 'Octal edge-triggered D flip-flop, shared clock, async clear. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls273.pdf',
    tags: ['flip flop', 'd', 'octal', 'sequential', 'register', 'clear'],
    guideOverview: 'The 74x273 is an 8 bit register: eight D flip flops that all share one clock and one clear line. On each rising clock edge it captures all eight D inputs at the same instant and holds them on the Q outputs until the next edge. Its defining feature is a direct (asynchronous) active LOW clear pull CLR LOW and every output drops to 0 immediately, without waiting for a clock, which makes it easy to reset a whole byte from a single master reset line. The outputs are single rail (Q only, no inverted Q) and always driven: there is no tri state output enable, so unlike the 74x374 a 273 cannot take turns on a shared bus. Reach for it when you want a plain, clearable byte wide register or buffer. If you need three state outputs use the 74x374; if you want a clock enable that lets you skip clock edges instead of a clear, use the 74x377.',
    guidePinDescriptions: {
      CLR: 'Direct clear, active LOW and asynchronous. Hold it LOW to force all eight outputs to 0 right away, with or without a clock; must be HIGH for the register to store or hold data.',
      CLK: 'Clock, shared by all eight flip flops. The rising edge (LOW to HIGH) samples 1D..8D at the same instant; the level between edges is ignored.',
      '1D': 'Data input for bit 1. Sampled on the rising clock edge when CLR is HIGH.',
      '2D': 'Data input for bit 2. Sampled on the rising clock edge when CLR is HIGH.',
      '3D': 'Data input for bit 3. Sampled on the rising clock edge when CLR is HIGH.',
      '4D': 'Data input for bit 4. Sampled on the rising clock edge when CLR is HIGH.',
      '5D': 'Data input for bit 5. Sampled on the rising clock edge when CLR is HIGH.',
      '6D': 'Data input for bit 6. Sampled on the rising clock edge when CLR is HIGH.',
      '7D': 'Data input for bit 7. Sampled on the rising clock edge when CLR is HIGH.',
      '8D': 'Data input for bit 8. Sampled on the rising clock edge when CLR is HIGH.',
      '1Q': 'Output for bit 1. Takes the value 1D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      '2Q': 'Output for bit 2. Takes the value 2D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      '3Q': 'Output for bit 3. Takes the value 3D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      '4Q': 'Output for bit 4. Takes the value 4D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      '5Q': 'Output for bit 5. Takes the value 5D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      '6Q': 'Output for bit 6. Takes the value 6D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      '7Q': 'Output for bit 7. Takes the value 7D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      '8Q': 'Output for bit 8. Takes the value 8D had at the last rising clock edge; forced LOW while CLR is LOW. Always driven.',
      GND: 'Ground reference (pin 10).',
      VCC: 'Positive supply, +5 V (pin 20).',
    },
    guideSections: [
      {
        title: 'Edge Triggered Register With Clear',
        paragraphs: [
          'Each of the eight bits is a positive edge triggered D flip flop. On the rising edge of CLK, every flip flop copies its D input to its Q output at the same instant, so the eight bits move together as one 8 bit word. Between edges the outputs hold their value and ignore the D inputs entirely a steady clock, or a falling edge, does nothing.',
          'The clear works differently from the clock. CLR is asynchronous (the datasheet calls it a direct clear): whenever CLR is LOW, all eight outputs are forced to 0 immediately, with no clock edge needed, and they stay at 0 for as long as CLR is held LOW. For normal operation keep CLR HIGH. This clear is the main thing that sets the 273 apart from the otherwise similar 74x374, which has a three state output enable in that spot instead.',
          'The outputs are single rail: you get Q only, there is no inverted Q, and there is no output enable to disconnect them. A 273 always drives its outputs, so two of them must never share a wire. If you need to put the outputs on a shared bus, use the 74x374 (edge triggered, tri state); if you want to hold the old value on some clock edges rather than clear everything, the 74x377 swaps the clear for a clock enable.',
        ],
        formulas: [
          'CLR  CLK  D  ->  Q',
          ' L    X   X  ->  L    (clear: every output forced LOW, no clock needed)',
          ' H    ^   H  ->  H    (rising edge loads D)',
          ' H    ^   L  ->  L',
          ' H    L   X  ->  Q0   (no rising edge: hold last value)',
        ],
        note: 'Simplified timing: a real 273 needs each D input steady for a short setup time (about 20 ns) before the clock edge and briefly after it, and CLR must be released about 25 ns before an edge. The simulator treats the edge as instant and ignores these windows.',
      },
      {
        title: 'Common Uses',
        list: [
          'An 8 bit storage or buffer register: present a byte, pulse the clock, and it holds steady while the rest of the circuit changes.',
          'A CPU or state machine output port, with CLR tied to a master reset line so the whole port clears to 0 at power up.',
          'Pattern generators and simple pipelines: clock data through stage by stage, with one line to zero everything at once.',
          'Any place you want a clearable byte wide register and do not need three state outputs.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'CLR is active LOW. Left floating or LOW it keeps the outputs stuck at 0; tie it HIGH (driven, or through a pull-up resistor to VCC) for normal use.',
          'The clear is asynchronous it fires the instant CLR goes LOW, not on a clock edge. Do not treat it as a synchronous reset.',
          'There is no output enable. The outputs are always driven, so two 273s cannot drive the same wire.',
          'Data is captured only on the LOW to HIGH clock edge. Changing a D input while the clock sits HIGH or LOW has no effect until the next rising edge.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'CLR', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1D', type: 'input' },
      { pin: 4, name: '2D', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '3Q', type: 'output' },
      { pin: 7, name: '3D', type: 'input' },
      { pin: 8, name: '4D', type: 'input' },
      { pin: 9, name: '4Q', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: '5Q', type: 'output' },
      { pin: 13, name: '5D', type: 'input' },
      { pin: 14, name: '6D', type: 'input' },
      { pin: 15, name: '6Q', type: 'output' },
      { pin: 16, name: '7Q', type: 'output' },
      { pin: 17, name: '7D', type: 'input' },
      { pin: 18, name: '8D', type: 'input' },
      { pin: 19, name: '8Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_OCTAL',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'CLK', 'CLR'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74373: Octal D Latch (transparent, tri state) ─────────────────────────
  /* Primary source: Texas Instruments, "SN54LS373/'S373, SN54LS374/'S374 ...
     Octal D-Type Transparent Latches and Edge-Triggered Flip-Flops," SDLS165B
     (orig. Oct. 1975, rev. Aug. 2002). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls373.pdf. Verified: terminal diagram
     (J/W/DW/N/NS package, TOP VIEW, p. 1) and 'LS373/'S373 function table (p. 3),
     read as PDF page images per issues.md C4 — NOT the text summarizer.
     Latch concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three state (tri state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // PINOUT FIX (issues.md C96): the hand-entered map had 3D/3Q swapped on pins
  // 6/7 and 7D/7Q swapped on pins 16/17 — the same bug the sibling 74x374 carried
  // (C94), and predicted there. The datasheet terminal diagram puts 3Q=6, 3D=7,
  // 7Q=16, 7D=17 — each side runs Q,D,D,Q,Q,D,D,Q. Corrected below. Logic is
  // unaffected: D_LATCH_OCTAL_TRI keys off pin NAMES, not pin numbers, so 3D still
  // feeds 3Q and 7D still feeds 7Q — only the physical placement moved.
  // LE (called C on the datasheet) controls whether the storage nodes are
  // transparent (LE HIGH → Q follows D) or holding their last value (LE LOW). OE
  // (called OC on the datasheet) is independent and active LOW, so the chip can
  // keep data internally even while its outputs are tri stated. Transparent
  // (level-sensitive) counterpart to the edge-triggered 74374.
  '74x373': {
    name: '74x373',
    simpleName: 'Octal D Latch',
    description: 'Octal transparent D latch, shared enable, 3-state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls373.pdf',
    tags: ['latch', 'd', 'octal', 'tri state', 'transparent', 'register'],
    guideOverview: 'The 74x373 packs eight transparent D latches that all share one enable. While the enable (LE) is HIGH the latches are transparent: each Q output follows its D input directly. When LE goes LOW, each latch freezes and holds whatever value D had at that instant. A separate active LOW output enable puts all eight outputs into a high impedance (disconnected) state without disturbing the stored data, so several 373s can take turns driving the same bus. Its classic job is an address latch on a multiplexed bus: a processor puts an address on shared address/data lines, pulses LE, and the 373 holds that address while those same lines go on to carry data. The closely related 74x374 does the same byte wide storage job but captures on a clock edge (edge triggered) instead of being transparent.',
    guidePinDescriptions: {
      OE: 'Output enable, active LOW (printed as OC on the datasheet). LOW drives the stored byte onto 1Q..8Q; HIGH puts all eight outputs in high impedance. It never changes the stored data.',
      LE: 'Latch enable, active HIGH (printed as C on the datasheet), shared by all eight latches. HIGH makes the latches transparent so each Q follows its D; LOW freezes the value each D held at that instant.',
      '1D': 'Data input for bit 1. Passes to 1Q while LE is HIGH; the value present when LE falls is the one held.',
      '2D': 'Data input for bit 2. Passes to 2Q while LE is HIGH; the value present when LE falls is the one held.',
      '3D': 'Data input for bit 3. Passes to 3Q while LE is HIGH; the value present when LE falls is the one held.',
      '4D': 'Data input for bit 4. Passes to 4Q while LE is HIGH; the value present when LE falls is the one held.',
      '5D': 'Data input for bit 5. Passes to 5Q while LE is HIGH; the value present when LE falls is the one held.',
      '6D': 'Data input for bit 6. Passes to 6Q while LE is HIGH; the value present when LE falls is the one held.',
      '7D': 'Data input for bit 7. Passes to 7Q while LE is HIGH; the value present when LE falls is the one held.',
      '8D': 'Data input for bit 8. Passes to 8Q while LE is HIGH; the value present when LE falls is the one held.',
      '1Q': 'Output for bit 1. Follows 1D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      '2Q': 'Output for bit 2. Follows 2D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      '3Q': 'Output for bit 3. Follows 3D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      '4Q': 'Output for bit 4. Follows 4D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      '5Q': 'Output for bit 5. Follows 5D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      '6Q': 'Output for bit 6. Follows 6D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      '7Q': 'Output for bit 7. Follows 7D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      '8Q': 'Output for bit 8. Follows 8D while LE is HIGH, holds the latched value while LE is LOW; high impedance when OE is HIGH.',
      GND: 'Ground reference (pin 10).',
      VCC: 'Positive supply, +5 V (pin 20).',
    },
    guideSections: [
      {
        title: 'Transparent Vs Latched',
        paragraphs: [
          'Each of the eight bits is a D latch. While LE is HIGH the latch is transparent: Q simply follows D, so whatever you put on a D input appears on its Q output right away (as long as OE is LOW). This is level sensitive, not edge triggered the outputs keep tracking D the entire time LE is HIGH.',
          'When LE goes LOW, each latch grabs the value D had at that instant and holds it. D can move around afterward and the outputs do not follow. That hold mode is how the 373 is used as a register: present a byte, drop LE, and it is stored. It is the difference from the 74x374, which ignores its inputs except at the rising edge of a clock.',
          'The output enable (OE, marked OC on the datasheet) is separate from storage. When OE is HIGH the eight outputs go to a third state, high impedance, that neither drives nor loads the wire. The stored byte is untouched you can even latch new data (with LE) while the outputs are disconnected, and it appears the moment OE returns LOW.',
        ],
        formulas: [
          'OE  LE  D   ->  Q',
          ' L   H  H   ->  H    (transparent: Q follows D)',
          ' L   H  L   ->  L',
          ' L   L  X   ->  Q0   (latched: hold last value)',
          ' H   X  X   ->  Z    (outputs off; stored data kept)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Address latch on a multiplexed bus: an 8085/8088-style processor shares its address and data lines, pulses LE to capture the address byte, and the 373 holds it while those same lines carry data. This is the part\'s signature application.',
          'A byte wide storage register: capture a value and hold it steady while the rest of the circuit changes.',
          'An output port for a CPU or state machine, where the tri state outputs feed a shared data bus.',
          'Letting several devices share one bus: give each its own 373 and enable only one set of outputs at a time.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'It is transparent, not edge triggered. While LE is HIGH the outputs follow every change on D, glitches included. To capture a value at one exact instant, reach for the edge triggered 74x374 instead.',
          'OE only disconnects the outputs; it does not clear or freeze the latch. Data still passes through (while LE is HIGH) even when the outputs are in high impedance.',
          'There is no reset pin. To start from a known value you have to latch one in.',
          'When the outputs are in high impedance the bus floats unless something else drives it. Real designs add a pull resistor or another driver so the line is never left undefined.',
          'The pinout interleaves D and Q pins in a mirror pattern (each side runs Q, D, D, Q, Q, D, D, Q), so check pin numbers against the diagram it is easy to wire a D to the wrong bit.',
          'This is a simplification: the simulator treats the latch as ideal. A real 373 needs D steady for a short setup time before LE falls and a hold time after it; break that and the latched bit can settle to an unpredictable value (metastability). That timing is not modeled here. The 74S373 also adds Schmitt trigger hysteresis (about 400 mV) on the enable input for noise immunity; the LS and HC versions do not.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1D', type: 'input' },
      { pin: 4, name: '2D', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '3Q', type: 'output' },
      { pin: 7, name: '3D', type: 'input' },
      { pin: 8, name: '4D', type: 'input' },
      { pin: 9, name: '4Q', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'LE', type: 'input' },
      { pin: 12, name: '5Q', type: 'output' },
      { pin: 13, name: '5D', type: 'input' },
      { pin: 14, name: '6D', type: 'input' },
      { pin: 15, name: '6Q', type: 'output' },
      { pin: 16, name: '7Q', type: 'output' },
      { pin: 17, name: '7D', type: 'input' },
      { pin: 18, name: '8D', type: 'input' },
      { pin: 19, name: '8Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_LATCH_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'LE', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74374: Octal D flip flop (tri state) ──────────────────────────────
  /* Primary source: Texas Instruments, "SN54LS373/'S373, SN54LS374/'S374 ...
     Octal D-Type Transparent Latches and Edge-Triggered Flip-Flops," SDLS165B
     (orig. Oct. 1975, rev. Aug. 2002). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls374.pdf. Verified: terminal diagram
     (J/W/DW/N/NS package, TOP VIEW, p. 1) and 'LS374/'S374 function table (p. 3),
     read as PDF page images per issues.md C4 — NOT the text summarizer.
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three state (tri state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // PINOUT FIX (issues.md C94): the hand-entered map had 3D/3Q swapped on pins
  // 6/7 and 7D/7Q swapped on pins 16/17. The datasheet terminal diagram puts
  // 3Q=6, 3D=7, 7Q=16, 7D=17 — each side runs Q,D,D,Q,Q,D,D,Q. Corrected below.
  // Logic is unaffected: D_FF_OCTAL_TRI keys off pin NAMES, not pin numbers, so
  // 3D still feeds 3Q and 7D still feeds 7Q — only the physical placement moved.
  // Edge-triggered counterpart to the 74373. CLK captures the 8-bit input word on
  // a rising edge; OE (called OC on the datasheet) can disconnect the outputs
  // while the internal register keeps its stored byte.
  '74x374': {
    name: '74x374',
    simpleName: 'Octal D FF (TS)',
    description: 'Octal edge-triggered D flip-flop, shared clock, 3-state outputs. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls374.pdf',
    tags: ['flip flop', 'd', 'octal', 'tri state', 'sequential', 'register'],
    guideOverview: 'The 74x374 packs eight D flip flops that all share one clock. On each rising clock edge it captures an 8 bit word from the D inputs and holds it until the next edge. A separate active LOW output enable puts all eight outputs into a high impedance (disconnected) state without disturbing the stored data, so several 374s can take turns driving the same bus. It is a common choice for a byte wide register or an output port: latch a value on a clock edge, then hand it to a shared bus only when this chip is selected. The closely related 74x373 does the same job but as a transparent latch (level sensitive) instead of edge triggered.',
    guidePinDescriptions: {
      OE: 'Output enable, active LOW (printed as OC on the datasheet). LOW drives the stored byte onto 1Q..8Q; HIGH puts all eight outputs in high impedance. It never changes the stored data.',
      CLK: 'Clock, shared by all eight flip flops. The rising edge (LOW to HIGH) captures 1D..8D at the same instant. Levels between edges are ignored.',
      '1D': 'Data input for bit 1. Sampled on the rising clock edge.',
      '2D': 'Data input for bit 2. Sampled on the rising clock edge.',
      '3D': 'Data input for bit 3. Sampled on the rising clock edge.',
      '4D': 'Data input for bit 4. Sampled on the rising clock edge.',
      '5D': 'Data input for bit 5. Sampled on the rising clock edge.',
      '6D': 'Data input for bit 6. Sampled on the rising clock edge.',
      '7D': 'Data input for bit 7. Sampled on the rising clock edge.',
      '8D': 'Data input for bit 8. Sampled on the rising clock edge.',
      '1Q': 'Output for bit 1. Holds 1D from the last clock edge; high impedance when OE is HIGH.',
      '2Q': 'Output for bit 2. Holds 2D from the last clock edge; high impedance when OE is HIGH.',
      '3Q': 'Output for bit 3. Holds 3D from the last clock edge; high impedance when OE is HIGH.',
      '4Q': 'Output for bit 4. Holds 4D from the last clock edge; high impedance when OE is HIGH.',
      '5Q': 'Output for bit 5. Holds 5D from the last clock edge; high impedance when OE is HIGH.',
      '6Q': 'Output for bit 6. Holds 6D from the last clock edge; high impedance when OE is HIGH.',
      '7Q': 'Output for bit 7. Holds 7D from the last clock edge; high impedance when OE is HIGH.',
      '8Q': 'Output for bit 8. Holds 8D from the last clock edge; high impedance when OE is HIGH.',
      GND: 'Ground reference (pin 10).',
      VCC: 'Positive supply, +5 V (pin 20).',
    },
    guideSections: [
      {
        title: 'Edge Triggered, Not Transparent',
        paragraphs: [
          'Each of the eight bits is a D flip flop. On the rising edge of CLK, output Q takes whatever value is at input D at that instant, then holds it. Between edges the D inputs can move around and the outputs do not follow. That is the difference from the 74x373 latch, whose outputs track D the whole time its enable is HIGH.',
          'All eight flip flops share one clock, so the chip captures a whole byte in a single step. Present a value on 1D..8D, pulse the clock, and it is stored.',
          'The output enable (OE, marked OC on the datasheet) is separate from storage. When OE is HIGH the outputs go to a third state, high impedance, that neither drives nor loads the wire. The stored byte is untouched you can even clock in new data while the outputs are disconnected, and it appears the moment OE returns LOW.',
        ],
        formulas: [
          'OE  CLK  D   ->  Q',
          ' H   X   X   ->  Z    (outputs off; stored data kept)',
          ' L   rise H  ->  H    (rising edge loads D)',
          ' L   rise L  ->  L',
          ' L   low  X  ->  Q0   (no rising edge, so hold last value)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'A byte wide storage register: capture a result on a clock edge and hold it.',
          'An output port for a CPU or state machine, where the tri state outputs feed a shared data bus.',
          'Pipeline or holding registers between stages of a larger circuit.',
          'Letting several devices share one bus: give each its own 374 and enable only one set of outputs at a time.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'OE only disconnects the outputs; it does not clear or freeze the register. Data is still clocked in while the outputs are in high impedance.',
          'Capture happens only on the LOW to HIGH edge. Holding CLK HIGH does not keep the outputs tracking D the way the 74x373 latch does.',
          'There is no reset pin. To start from a known value you have to clock one in.',
          'When the outputs are in high impedance the bus floats unless something else drives it. Real designs add a pull resistor or another driver so the line is never left undefined.',
          'The pinout interleaves D and Q pins in a mirror pattern (each side runs Q, D, D, Q, Q, D, D, Q), so check pin numbers against the diagram it is easy to wire a D to the wrong bit.',
          'This is a simplification: the simulator captures on an ideal, instantaneous clock edge. A real 374 needs D steady for a short setup time before the edge and a hold time after it; break that and the output can settle to an unpredictable value (metastability). That timing is not modeled here. The 74S374 also adds a Schmitt trigger on the clock for noise immunity; the LS and HC versions do not.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1Q', type: 'output' },
      { pin: 3, name: '1D', type: 'input' },
      { pin: 4, name: '2D', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '3Q', type: 'output' },
      { pin: 7, name: '3D', type: 'input' },
      { pin: 8, name: '4D', type: 'input' },
      { pin: 9, name: '4Q', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: '5Q', type: 'output' },
      { pin: 13, name: '5D', type: 'input' },
      { pin: 14, name: '6D', type: 'input' },
      { pin: 15, name: '6Q', type: 'output' },
      { pin: 16, name: '7Q', type: 'output' },
      { pin: 17, name: '7D', type: 'input' },
      { pin: 18, name: '8D', type: 'input' },
      { pin: 19, name: '8Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'CLK', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74541: Octal Buffer/Line Driver (non-inverting, 3-state), 20-pin ──────
  /* Primary source: Texas Instruments, "SN54LS540, SN54LS541, SN74LS540,
     SN74LS541 Octal Buffers and Line Drivers With 3-State Outputs," SDLS180
     (Aug. 1979, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls541.pdf. Verified as rendered
     300-dpi PDF page images (issues.md C4, NOT the WebFetch summarizer):
     SN74LS541 DW/N-package terminal assignment (TOP VIEW, p.1) — G1(/OE1)=1,
     A1..A8=2-9, GND=10, Y8..Y1=11-18, G2(/OE2)=19, VCC=20 — matches pinout[]
     exactly. The line "The 'LS540 offers inverting data and the 'LS541 offers
     true data at the outputs" (p.1) → the 541 is NON-inverting (Y = A). The
     "three-state control gate is a 2-input NOR such that if either G1 or G2 are
     high, all eight outputs are in the high-impedance state" (p.1) → both
     active-LOW enables must be LOW to drive; either HIGH → Hi-Z. That matches
     gates[] (8x TRI_BUFFER_DUAL_OE, non-inverting) and the engine's
     _evaluateTriBufferDualOE (both OE=0 → Y=A, else Hi-Z). Logic diagram + logic
     symbol (p.2) confirm the A_n → Y_n mapping and the enable NOR. Pinout[],
     gates[], and the engine were all verified correct and left unchanged.
     Notable features (p.1): "Data Flow-thru Pinout (All Inputs on Opposite Side
     from Outputs)", "P-N-P Inputs Reduce D-C Loading", "Hysteresis at Inputs
     Improves Noise Margins" (electrical table p.3 lists VT+ - VT- = 0.2-0.4 V
     typ). Drive strength (SN74LS' table, p.1): IOL = 24 mA, IOH = -15 mA.
     Family caveat (reconciles with the 74x540 entry + issues.md C108): the input
     hysteresis is an LS-family trait. Second source, the bipolar-ALS variant —
     Texas Instruments, "SN54ALS541, SN74ALS540, SN74ALS541 Octal Buffers and
     Line Drivers With 3-State Outputs," SDAS025D (Apr. 1982, rev. Mar. 2002).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als540.pdf —
     lists "pnp inputs" for low dc loading but NO input hysteresis. Trusted the
     LS datasheet (linked in this entry) as authoritative for the generic
     74x541; the hysteresis note in the docs is scoped to the LS family.
     Inverting twin (same pinout, Y = NOT A): 74x540 (chips30.js), issues.md
     C108. Interleaved-pinout equivalents, cited only for the flow-through
     contrast: 74x244 (non-inverting) / 74x240 (inverting) octal buffers.
     Three-state (tri-state) logic background:
     https://en.wikipedia.org/wiki/Three-state_logic
     Propagation and output enable/disable delay are modeled as zero (LIVE
     mode): issues.md A1. Input hysteresis is not modeled — inputs switch at a
     single ideal threshold: issues.md A2. */
  '74x541': {
    name: '74x541',
    simpleName: 'Octal Buffer',
    description: 'Octal non-inverting 3-state buffer, two active-low enables. (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls541.pdf',
    tags: ['buffer', 'driver', 'octal', 'tri state', 'line driver'],
    guideOverview: 'The 74x541 is an octal (8-bit) non-inverting buffer and line driver with 3-state outputs. Each output Y copies its matching A input unchanged, and all eight outputs share two active-low enables, OE1 and OE2. Both must be LOW for the chip to drive; take either one HIGH and all eight outputs go to high impedance. Its defining feature is the pinout: every input is on one side of the package and every output on the other, so a byte-wide bus runs straight across a board. It does the same job as the 74x244 but with this layout-friendly arrangement, and it is the plain-data twin of the 74x540, which inverts every bit.',
    guidePinDescriptions: {
      'OE1': 'Output Enable 1 (active LOW). Must be LOW, together with OE2, for the outputs to drive. HIGH forces all eight outputs to high impedance.',
      'OE2': 'Output Enable 2 (active LOW). Same effect as OE1: HIGH forces all eight outputs to high impedance.',
      'A1':  'Data input 1. Drives output Y1.',
      'A2':  'Data input 2. Drives output Y2.',
      'A3':  'Data input 3. Drives output Y3.',
      'A4':  'Data input 4. Drives output Y4.',
      'A5':  'Data input 5. Drives output Y5.',
      'A6':  'Data input 6. Drives output Y6.',
      'A7':  'Data input 7. Drives output Y7.',
      'A8':  'Data input 8. Drives output Y8.',
      'GND': 'Ground reference (pin 10).',
      'Y1':  '3-state output 1: copies A1 when enabled, else high impedance.',
      'Y2':  '3-state output 2: copies A2 when enabled, else high impedance.',
      'Y3':  '3-state output 3: copies A3 when enabled, else high impedance.',
      'Y4':  '3-state output 4: copies A4 when enabled, else high impedance.',
      'Y5':  '3-state output 5: copies A5 when enabled, else high impedance.',
      'Y6':  '3-state output 6: copies A6 when enabled, else high impedance.',
      'Y7':  '3-state output 7: copies A7 when enabled, else high impedance.',
      'Y8':  '3-state output 8: copies A8 when enabled, else high impedance.',
      'VCC': 'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Non-Inverting Buffer With Two Enables',
        paragraphs: [
          'A buffer copies its input straight to its output: Y1 follows A1, Y2 follows A2, and so on, at the same logic level. It does not change the logic, it redraws the signal. The output is a fresh, strong copy that can drive a heavily loaded bus without loading down or slowing the original, which is why the datasheet also calls it a line driver.',
          'The outputs are 3-state. On top of HIGH and LOW, each output has a third state, high impedance, in which it is effectively disconnected so another chip can drive the same wire. Two pins set this, OE1 and OE2, and both are active LOW. Inside the chip they feed a NOR gate, so the outputs drive only when OE1 and OE2 are both LOW. Raise either one HIGH and all eight outputs release the bus at once.',
          'Simplification: the simulator switches the outputs instantly. A real 74x541 needs a few nanoseconds for an output to follow its input, or to enter and leave high impedance.',
        ],
        formulas: [
          'Y = A       when OE1 = 0 and OE2 = 0',
          'Y = Hi-Z    when OE1 = 1 or OE2 = 1',
          'A=0 → Y=0 | A=1 → Y=1   (outputs enabled)',
        ],
      },
      {
        title: 'Flow-Through Pinout',
        paragraphs: [
          'The 74x541 does the same job as the 74x244 octal buffer, but the pins sit in a different order. All eight inputs (A1 to A8) run down pins 2 to 9 on one side, and all eight outputs (Y1 to Y8) run down pins 11 to 18 on the other. On a circuit board this lets a byte-wide bus pass straight through the chip, in one edge and out the other, with no traces crossing over. The datasheet calls this a data flow-through pinout, and it is the main reason to pick a 540 or 541 over a 240 or 244.',
          'The enables are arranged differently too. The 74x244 splits its eight outputs into two banks of four, each with its own enable. The 541 instead gives you two enables that both act on all eight outputs together. That is handy when two conditions, say a chip-select and a read strobe, must both be true before the byte is allowed onto the bus, with no external AND gate needed.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Driving an 8-bit address or data bus, refreshing the signal so it can fan out to many inputs without weakening.',
          'Sharing one bus among several devices: each 541 stays in high impedance until its turn, then both enables go LOW and it drives.',
          'Gating a byte onto a bus only when two separate control signals agree, using OE1 and OE2 as the two conditions.',
          'Buffering a processor\'s outputs from the rest of a board, keeping the processor pins lightly loaded while a stronger driver feeds everything downstream.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'Both enables must be LOW to drive. If you only need one, tie the unused enable to ground; leaving it HIGH keeps the whole chip in high impedance and nothing reaches the outputs.',
          'It does not invert. Every bit comes out exactly as it went in. If you want the byte flipped, reach for the 74x540, which is identical apart from the inversion.',
          'Only one driver on a shared bus at a time. When enabled the outputs are push-pull (strong HIGH and strong LOW), so two chips driving the same wire to opposite levels fight each other. Make sure just one buffer has both enables LOW at any moment.',
        ],
        note: 'The LS-family 74LS541 (the datasheet linked here) has input hysteresis to clean up slow or noisy edges; the bipolar-ALS 74ALS541 leaves it out. The simulator treats all inputs as ideal single-threshold, so it does not reproduce hysteresis either way.',
      },
    ],
    pinout: [
      { pin: 1, name: 'OE1', type: 'input' },
      { pin: 2, name: 'A1', type: 'input' },
      { pin: 3, name: 'A2', type: 'input' },
      { pin: 4, name: 'A3', type: 'input' },
      { pin: 5, name: 'A4', type: 'input' },
      { pin: 6, name: 'A5', type: 'input' },
      { pin: 7, name: 'A6', type: 'input' },
      { pin: 8, name: 'A7', type: 'input' },
      { pin: 9, name: 'A8', type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'Y8', type: 'output' },
      { pin: 12, name: 'Y7', type: 'output' },
      { pin: 13, name: 'Y6', type: 'output' },
      { pin: 14, name: 'Y5', type: 'output' },
      { pin: 15, name: 'Y4', type: 'output' },
      { pin: 16, name: 'Y3', type: 'output' },
      { pin: 17, name: 'Y2', type: 'output' },
      { pin: 18, name: 'Y1', type: 'output' },
      { pin: 19, name: 'OE2', type: 'input' },
      { pin: 20, name: 'VCC', type: 'power' },
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

  // ── 74573: Octal D Latch (tri state) ──────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS573 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls573.pdf
     Latch/flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three state (tri state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // Logic behavior matches the 74373, but the pins are arranged for easier bus
  // routing: D inputs are grouped on one side and Q outputs on the other. LE is
  // transparent-high and OE is active LOW.
  '74x573': {
    name: '74x573',
    simpleName: 'Octal D Latch',
    description: 'Octal D type transparent latch with tri state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls573.pdf',
    tags: ['latch', 'd', 'octal', 'tri state', 'transparent'],
    guideOverview: 'The 74x573 is functionally an octal transparent latch with tri state outputs, similar to the 74x373 but with a bus friendly pin order. It is useful when you want all data inputs together and all outputs together on opposite sides of the package.',
    guidePinDescriptions: {
      LE: 'Latch enable. HIGH makes the latch transparent; LOW holds the most recent byte.',
      OE: 'Active LOW output enable. HIGH disconnects the outputs without clearing the stored byte.',
    },
    guideSections: [
      {
        title: 'Bus Friendly Transparent Latch',
        paragraphs: [
          'Same logic as 74x373 but with all D inputs grouped on one side and all Q outputs on the other for easier PCB and breadboard routing. LE HIGH = transparent; LE LOW = hold.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1D', type: 'input' },
      { pin: 3, name: '2D', type: 'input' },
      { pin: 4, name: '3D', type: 'input' },
      { pin: 5, name: '4D', type: 'input' },
      { pin: 6, name: '5D', type: 'input' },
      { pin: 7, name: '6D', type: 'input' },
      { pin: 8, name: '7D', type: 'input' },
      { pin: 9, name: '8D', type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'LE', type: 'input' },
      { pin: 12, name: '8Q', type: 'output' },
      { pin: 13, name: '7Q', type: 'output' },
      { pin: 14, name: '6Q', type: 'output' },
      { pin: 15, name: '5Q', type: 'output' },
      { pin: 16, name: '4Q', type: 'output' },
      { pin: 17, name: '3Q', type: 'output' },
      { pin: 18, name: '2Q', type: 'output' },
      { pin: 19, name: '1Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_LATCH_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'LE', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74574: Octal D flip flop (tri state, edge triggered) ──────────────
  /* Primary source: Texas Instruments, SN74LS574 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls574.pdf
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics)
     Three state (tri state) logic: https://en.wikipedia.org/wiki/Three-state_logic */
  // This is the bus oriented pinout version of the 74374. Inputs are grouped,
  // outputs are grouped, capture occurs on a rising clock edge, and OE can
  // disconnect the outputs while the internal register keeps its stored state.
  '74x574': {
    name: '74x574',
    simpleName: 'Octal D FF (TS)',
    description: 'Octal D type edge triggered flip flop with tri state outputs (20-pin)',
    pins: 20,
    vcc: 20,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls574.pdf',
    tags: ['flip flop', 'flip flop', 'd', 'octal', 'tri state', 'edge triggered', 'sequential'],
    guideOverview: 'The 74x574 is an 8 bit rising edge register with tri state outputs and a bus oriented pinout. It fills the same role as the 74x374 when PCB or breadboard routing benefits from having all inputs together and all outputs together.',
    guidePinDescriptions: {
      CLK: 'Shared rising edge clock input for the whole byte.',
      OE: 'Active LOW output enable. HIGH disconnects the outputs while leaving the stored register contents intact.',
    },
    guideSections: [
      {
        title: 'Bus Friendly Octal Register',
        paragraphs: [
          'Same logic as 74x374 but with all D inputs grouped together and all Q outputs together on the opposite side ideal when routing a full data bus across a breadboard.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'OE', type: 'input' },
      { pin: 2, name: '1D', type: 'input' },
      { pin: 3, name: '2D', type: 'input' },
      { pin: 4, name: '3D', type: 'input' },
      { pin: 5, name: '4D', type: 'input' },
      { pin: 6, name: '5D', type: 'input' },
      { pin: 7, name: '6D', type: 'input' },
      { pin: 8, name: '7D', type: 'input' },
      { pin: 9, name: '8D', type: 'input' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'CLK', type: 'input' },
      { pin: 12, name: '8Q', type: 'output' },
      { pin: 13, name: '7Q', type: 'output' },
      { pin: 14, name: '6Q', type: 'output' },
      { pin: 15, name: '5Q', type: 'output' },
      { pin: 16, name: '4Q', type: 'output' },
      { pin: 17, name: '3Q', type: 'output' },
      { pin: 18, name: '2Q', type: 'output' },
      { pin: 19, name: '1Q', type: 'output' },
      { pin: 20, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'D_FF_OCTAL_TRI',
        inputs: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', 'CLK', 'OE'],
        outputs: ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'],
      },
    ],
    sequential: true,
  },

  // ── 74595: 8 bit Shift Register with Output Latch ─────────────────────
  /* Source (pin names + function table used by this entry): Texas Instruments,
     "SNx4HC595 8-Bit Shift Registers With 3-State Output Registers," SCLS041J
     (Dec. 1982, rev. Oct. 2021). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74hc595.pdf. Verified: 16-pin terminal
     assignment (Section 5 / Table 5-1 "Pin Functions", D/N/... top view) and the
     Table 8-1 Function Table (Section 8.4), plus the Section 8.1 note that tying
     SRCLK and RCLK together leaves the shift register one clock ahead of the
     storage register -- all read as rendered PDF page images (issues.md C4), NOT
     via a text summarizer. pinout[] and the SHIFT_REG_LATCH gate confirmed
     against this; engine (js/specificChipsSim.js _evaluateShiftRegLatch) left
     unchanged. The entry uses the HC595 signal names (SER/SRCLK/RCLK/OE/SRCLR/QHs);
     QHs is TI's QH'.
     Cross-check (bipolar family, same pinout, different labels): Texas Instruments,
     "SN54LS595, SN54LS596, SN74LS595, SN74LS596 8-Bit Shift Registers With Output
     Latches," SDLS006 (Jan. 1981, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls595.pdf. Verified page 1 (PDF image):
     identical 16-pin DIP map with TI's LS labels SRCK(11)/RCK(12)/G-bar(13)/QH'(9);
     '595 has 3-state outputs (the part 74Sim models), the sibling '596 is
     open-collector; "DC to 20 MHz" shift frequency. Trusted for the LS speed figure
     and the 3-state-vs-open-collector contrast.
     Shift register concept: https://en.wikipedia.org/wiki/Shift_register
     Timing figures (HC595 ~25 MHz, ~30 ns RCLK->output at 5 V; LS595 to 20 MHz) are
     from the datasheet switching tables; the simulator models propagation delay as
     zero (issues.md A1). Consequence of A1, verified empirically against the engine:
     if SRCLK and RCLK are tied to one net, the real part latches the shift register's
     PRE-edge value (outputs run one clock behind, per SCLS041J Section 8.1), but the
     zero-delay model shifts-then-latches in the same tick, so the outputs track the
     shift register with no lag. Documented as a simplification in the guide gotchas;
     not a pinout/logic bug, so no new issues.md entry (A1 already covers it).
     Regression: js/debug/scenarios/74x595-shift-latch.mjs (separate-clock behavior:
     shift/latch split, SER->QA walk to QH/QHs, async SRCLR clears shift reg only,
     active-LOW OE tri-states QA-QH but not QHs). */
  '74x595': {
    name: '74x595',
    simpleName: '8 bit Shift Reg + Output Latch',
    description: '8-bit SIPO shift register with separate output latch. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc595.pdf',
    tags: ['shift register', 'latch', 'serial', 'parallel', '8 bit', 'sequential', 'sipo'],
    guideOverview: 'The 74x595 turns a stream of serial bits into eight parallel outputs, and it is the usual way to add output pins to a microcontroller that has run out of them: three signal wires go in, eight outputs come out, and you can chain several chips off those same three wires. Inside are two separate 8 bit registers. The shift register takes one bit at a time from SER on each rising edge of SRCLK, sliding the earlier bits along. The storage register (the output latch) sits between the shift register and the output pins QA-QH; on a rising edge of RCLK it copies the whole shift register at once. Because the two registers have their own clocks, you can shift eight new bits in without the outputs moving, then update all eight together with a single RCLK pulse, so the pins never show the half-finished patterns that scroll through while you shift. Two control pins finish it off. SRCLR (active LOW) clears the shift register immediately, without waiting for a clock, and leaves the output latch alone. OE (active LOW) disconnects QA-QH from whatever they drive, putting them in high impedance, without erasing either register. QHs is a separate output that always shows the last bit of the shift register; wire it to the SER pin of the next 595 to make a longer chain.',
    guidePinDescriptions: {
      'SER': 'Serial data input. The bit held here is read into the first stage of the shift register (the QA end) on each SRCLK rising edge.',
      'SRCLK': 'Shift register clock. A rising edge reads SER into the first stage and slides every earlier bit one place toward QH.',
      'RCLK': 'Storage register (latch) clock. A rising edge copies all eight shift register bits into the output latch at once, so QA-QH change together.',
      'SRCLR': 'Shift register clear (active LOW). Drive LOW to reset every shift register bit to 0 at once, with no clock needed. Does not touch the output latch.',
      'OE': 'Output enable (active LOW). LOW drives QA-QH; HIGH puts them in high impedance. Neither register is changed, and QHs is never affected.',
      'QHs': 'Serial output from the last stage of the shift register (TI calls it QH prime). Always active, even when OE is HIGH. Wire it to SER of the next 595 to cascade.',
      'QA': 'Parallel output bit 0 (LSB), from the output latch. Driven when OE is LOW.',
      'QB': 'Parallel output bit 1, from the output latch. Driven when OE is LOW.',
      'QC': 'Parallel output bit 2, from the output latch. Driven when OE is LOW.',
      'QD': 'Parallel output bit 3, from the output latch. Driven when OE is LOW.',
      'QE': 'Parallel output bit 4, from the output latch. Driven when OE is LOW.',
      'QF': 'Parallel output bit 5, from the output latch. Driven when OE is LOW.',
      'QG': 'Parallel output bit 6, from the output latch. Driven when OE is LOW.',
      'QH': 'Parallel output bit 7 (MSB), from the output latch. Driven when OE is LOW.',
      'GND': 'Ground reference (pin 8).',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Two Registers, Two Clocks',
        paragraphs: [
          'The chip holds two 8 bit registers in a row. The shift register is fed by SER and clocked by SRCLK. The storage register (the output latch) is fed by the shift register and clocked by RCLK. Only the storage register reaches the output pins QA-QH, so nothing you do with SRCLK shows up on the outputs until an RCLK edge moves it across.',
          'To send a byte, put each bit on SER and pulse SRCLK once per bit. Every SRCLK rising edge reads SER into the first stage (the QA end) and pushes each earlier bit one place toward QH; the bit that was in the last stage drops off the end. After eight pulses the shift register holds your byte, but the outputs still have not moved. Pulse RCLK once and the storage register copies all eight bits at the same instant, so QA-QH switch together.',
        ],
        list: [
          'Whichever bit you shift in first ends up at QH, so shift the most significant bit first if you want normal bit order across QA (LSB) to QH (MSB).',
          'Keep OE LOW for live outputs. Drive it HIGH to park QA-QH in high impedance without disturbing the stored byte.',
        ],
        note: 'That split is the whole point of the part: the shift register is a scratchpad you fill out of sight, and RCLK is the "show it now" command. Outputs driven this way never flicker through the intermediate patterns.',
      },
      {
        title: 'Function Table',
        paragraphs: [
          'H = HIGH, L = LOW, X = don\'t care, and the up arrow is a rising (LOW to HIGH) edge. SER and SRCLK act on the shift register, RCLK copies the shift register into the output latch, SRCLR clears the shift register, and OE only gates the parallel outputs.',
        ],
        formulas: [
          'OE=H  →  QA-QH go to high impedance (stored byte kept)',
          'OE=L  →  QA-QH show the stored latch byte',
          'SRCLR=L  →  shift register cleared to all 0 (latch unchanged)',
          'SER=x, SRCLK↑  →  x enters the first stage, every other stage shifts one step',
          'RCLK↑  →  shift register is copied into the output latch',
        ],
        note: 'SRCLR clears only the shift register, and it does so immediately with no clock. To blank the visible outputs you must clear with SRCLR and then pulse RCLK to push the zeros into the latch. QHs follows the shift register, so it goes to 0 with SRCLR and is never affected by OE.',
      },
      {
        title: 'Common Uses',
        list: [
          'Driving LEDs, seven-segment digits, or small relays: one 595 gives eight outputs from three signal pins, and each output can source or sink a few milliamps, enough for an LED with a series resistor.',
          'Adding output pins: when a small microcontroller runs out of GPIO, a 595 (or a string of them) is the cheap way to get more outputs. It is the output-side mirror of the 74x165, which reads switches in the other direction (parallel in, serial out).',
          'Cascading for wide outputs: tie QHs of one chip to SER of the next and share SRCLK and RCLK across all of them, so 16, 24, or more outputs update from the same three control lines.',
          'Setting fixed configuration: shift in one byte at power-up to hold mode or select bits for other chips, then leave it in place.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Two clocks, not one. Shifting bits in with SRCLK does nothing to the outputs until you pulse RCLK. Forgetting the RCLK pulse is the most common "my 595 does nothing" mistake.',
          'SRCLR does not clear the outputs on its own. It empties the shift register only; the latch keeps its old byte until the next RCLK. Clear, then pulse RCLK, to blank the outputs.',
          'OE only affects QA-QH. HIGH puts them in high impedance (floating), which is not the same as LOW, and it leaves QHs and both registers alone, so a cascade keeps shifting even while the outputs are parked.',
          'Tying SRCLK and RCLK together to save a pin is a known gotcha. On a real 595 the shared edge makes the latch grab the shift register\'s old value, so the outputs run exactly one clock behind the data you shifted. (74Sim models zero propagation delay, so here the outputs instead track the shift register with no lag, a simplification.) Keeping the two clocks on separate pins sidesteps the whole question.',
          'This is a SIPO part (serial in, parallel out). To read switches into a microcontroller you want the opposite, parallel in, serial out, which is the 74x165.',
        ],
        note: 'Real 595s take time to respond. A common 74HC595 shifts at up to about 25 MHz and takes roughly 30 ns from an RCLK edge to a settled output at 5 V; the older bipolar 74LS595 runs to about 20 MHz. The simulator treats these delays as zero, which is a simplification: it does not reproduce the brief timing glitches that real delay can cause.',
      },
    ],
    pinout: [
      { pin:  1, name: 'QB',    type: 'output', description: 'Parallel output bit 1 from the output latch. Active when OE=LOW.' },
      { pin:  2, name: 'QC',    type: 'output', description: 'Parallel output bit 2 from the output latch. Active when OE=LOW.' },
      { pin:  3, name: 'QD',    type: 'output', description: 'Parallel output bit 3 from the output latch. Active when OE=LOW.' },
      { pin:  4, name: 'QE',    type: 'output', description: 'Parallel output bit 4 from the output latch. Active when OE=LOW.' },
      { pin:  5, name: 'QF',    type: 'output', description: 'Parallel output bit 5 from the output latch. Active when OE=LOW.' },
      { pin:  6, name: 'QG',    type: 'output', description: 'Parallel output bit 6 from the output latch. Active when OE=LOW.' },
      { pin:  7, name: 'QH',    type: 'output', description: 'Parallel output bit 7 (MSB) from the output latch. Active when OE=LOW.' },
      { pin:  8, name: 'GND',   type: 'power' },
      { pin:  9, name: 'QHs',   type: 'output', description: 'Serial cascade output from the last stage of the shift register. Connect to SER of the next 74595 in a chain.' },
      { pin: 10, name: 'SRCLR', type: 'input',  description: 'Shift register clear (active LOW). Drive LOW to reset the shift register to all zeros. Does not affect the output latch.' },
      { pin: 11, name: 'SRCLK', type: 'input',  description: 'Shift register clock. Rising edge shifts data: SER enters bit 0, each bit moves to the next stage.' },
      { pin: 12, name: 'RCLK',  type: 'input',  description: 'Storage register (latch) clock. Rising edge transfers current shift register contents to QA-QH outputs.' },
      { pin: 13, name: 'OE',    type: 'input',  description: 'Output enable (active LOW). HIGH tri states QA-QH without affecting stored data. QHs remains unaffected.' },
      { pin: 14, name: 'SER',   type: 'input',  description: 'Serial data input. The bit present here is sampled into the shift register on each SRCLK rising edge.' },
      { pin: 15, name: 'QA',    type: 'output', description: 'Parallel output bit 0 (LSB) from the output latch. Active when OE=LOW.' },
      { pin: 16, name: 'VCC',   type: 'power' },
    ],
    gates: [
      {
        type: 'SHIFT_REG_LATCH',
        inputs: ['SER', 'SRCLK', 'RCLK', 'SRCLR', 'OE'],
        outputs: ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH', 'QHs'],
      },
    ],
    sequential: true,
  },
};
