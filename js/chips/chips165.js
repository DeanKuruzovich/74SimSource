// CMOS 4000-series coverage — CD40100B (32-stage static left/right shift register).
//
// Shipped in its own standalone block (CHIPS_BLOCK_165) so this parallel-agent run
// does not collide with other agents adding chips in the same working tree.
//
// ── Why this is a documentation stub (tags: ['stub'], gate SHIFT_REG_16BIT_STUB) ─
// The CD40100B is a 32-stage BIDIRECTIONAL, RECIRCULATING shift register: a chain
// of 32 D-type master-slave flip-flops that can shift in either direction and feed
// its own end back into its front. Per the RCA datasheet CONTROL TRUTH TABLE the
// behaviour is set by three control lines each clock:
//   • LEFT/RIGHT CONTROL (pin 13) picks the direction:
//       0 → SHIFT RIGHT (data marches from stage 1 toward stage 32),
//       1 → SHIFT LEFT  (data marches from stage 32 toward stage 1).
//   • RECIRCULATE CONTROL (pin 9) picks where the entering stage gets its bit:
//       1 → from the external serial input (SHIFT RIGHT IN pin 11 in right mode,
//            SHIFT LEFT IN pin 6 in left mode),
//       0 → recirculate (the far end is fed back: stage 32 → stage 1 in right mode,
//            stage 1 → stage 32 in left mode) — gives LIFO/FIFO and time-delay use.
//   • CLOCK INHIBIT (pin 2) HIGH → no shift occurs on the positive clock edge.
// Shifting is synchronous with the POSITIVE (low-to-high) CLOCK edge (pin 3). The
// two serial outputs reflect the two ends: SHIFT LEFT OUT (pin 4) presents stage 1
// (Q1) and SHIFT RIGHT OUT (pin 12) presents stage 32 (Q32); a bit clocked into a
// stage appears at its corresponding output on the NEXT NEGATIVE clock transition
// (a half-clock delay — see the datasheet DATA TRANSFER TABLE). The control inputs
// should not be changed while CLOCK is high.
//
// 74Sim's engine has no primitive for a run-time-reversible, recirculating
// 32-stage shift register (direction, recirculate path and the half-clock output
// delay are all selected live), and the shared simulation file js/specificChipsSim.js
// cannot be edited during this concurrent run. This is exactly the situation of the
// sibling large serial shift registers already shipped as info-sheet stubs — the
// 64-stage CD4031 and the dual 64-stage CD4517 (both on SHIFT_REG_16BIT_STUB), plus
// the 74673/674/675/676 family. Per the project's stub policy (issues.md B1/B2,
// CMOS-4000-Coverage-Plan.md §6) an honest info sheet beats a half-driven sim, so
// the CD40100B ships "info sheet only": the page documents the real part (verified
// pinout, function, design notes) but the chip is hidden from the breadboard picker
// and drives no outputs in the sim. The gate type is the coverage-plan-mapped,
// banner-registered SHIFT_REG_16BIT_STUB (drives every listed output Hi-Z; see
// issues.md B2 and the registry in js/docs-page.js).
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: RCA Corporation, "CD40100B Types — COS/MOS 32-Stage Static Left/Right
//   Shift Register", in RCA Solid State Databook SSD-250C "COS/MOS Integrated
//   Circuits" (1980), pp. 357–361. [Online]. Available (scanned databook):
//   archived RCA 1980 COS/MOS databook PDF. Verified: the TERMINAL ASSIGNMENT
//   top-view DIP drawing (drawing 92CS-27568), the FUNCTIONAL DIAGRAM (drawing
//   92CS-27567), the descriptive text, the CONTROL TRUTH TABLE and the DATA
//   TRANSFER TABLE — all read as 200-dpi rendered PDF page images (NOT a text
//   summarizer — see issues.md C4), the terminal-assignment and functional-diagram
//   blocks cropped/zoomed to confirm every pin number. NOT cloned from a sibling
//   shift-register part (see issues.md C2).
// Corroborating source: Datasheet Hub, "CD40100 — 32-stage left/right shift
//   register" terminal-assignment table. [Online]. Available:
//   https://www.datasheethub.com/cd40100-32-stage-left-right-shift-register/
//   Verified: the 16-pin assignment agrees pin-for-pin with the RCA drawings above
//   (used only as a cross-check; the RCA page images are the authority per C4).
//
// Verified DIP-16 pinout (RCA 92CS-27568 TERMINAL ASSIGNMENT, TOP VIEW):
//   1=NC               16=VDD
//   2=CLOCK INHIBIT    15=NC
//   3=CLOCK            14=NC
//   4=SHIFT LEFT OUT   13=LEFT/RIGHT CONTROL
//   5=NC               12=SHIFT RIGHT OUT
//   6=SHIFT LEFT IN    11=SHIFT RIGHT IN
//   7=NC               10=NC
//   8=VSS               9=RECIRCULATE CONTROL
//   (NC = no connection on pins 1, 5, 7, 10, 14, 15.)

export const CHIPS_BLOCK_165 = {
  // ── CD40100: 32-stage static left/right shift register ─────────────────────
  'CD40100': {
    name: 'CD40100',
    simpleName: '32-stage L/R SR',
    description: '32-stage bidirectional shift register (16-pin CMOS) — info sheet only',
    sequential: true,
    guideOverview: 'The CD40100B is a 32-stage shift register — a chain of 32 one-bit memory cells wired so that each clock pulse moves the stored bit from one cell to the next. Two things make it more than a plain shift register. First, it works in both directions: the LEFT/RIGHT CONTROL pin chooses whether bits march one way down the chain (shift right, from stage 1 toward stage 32) or the other way (shift left). Second, it can feed its own output back to its input: with the RECIRCULATE CONTROL pin low, the bit leaving the far end is loaded back into the entering end instead of taking in new data, so a pattern can circle around the 32 stages indefinitely. That makes it useful as a time delay, a serial memory, or a last-in/first-out stack. Shifting happens on the rising clock edge, and a CLOCK INHIBIT pin freezes the register when held high. NOTE: this part is provided as a documentation / info-sheet entry only — 74Sim does not have a simulation model for a shift register whose direction and recirculate path are chosen at run time, so its outputs are not driven in the simulator.',
    guidePinDescriptions: {
      'CLKINH':  'CLOCK INHIBIT (pin 2). HIGH freezes the register — no shift happens on the clock edge. Hold it LOW to allow normal shifting.',
      'CLK':     'CLOCK (pin 3). The register shifts one stage on each LOW-to-HIGH (rising) edge. The control pins should not be changed while CLOCK is high.',
      'SLOUT':   'SHIFT LEFT OUT (pin 4). Serial output presenting stage 1 (Q1); used as the output end when shifting left and for cascading to another chip.',
      'SLIN':    'SHIFT LEFT IN (pin 6). Serial data input loaded into stage 32 when LEFT/RIGHT CONTROL is HIGH (shift-left) and RECIRCULATE CONTROL is HIGH.',
      'VSS':     'Negative supply / ground (pin 8).',
      'RECIRC':  'RECIRCULATE CONTROL (pin 9). HIGH accepts the external serial input; LOW recirculates (feeds the far end back into the entering end) for stack / delay / loop use.',
      'SRIN':    'SHIFT RIGHT IN (pin 11). Serial data input loaded into stage 1 when LEFT/RIGHT CONTROL is LOW (shift-right) and RECIRCULATE CONTROL is HIGH.',
      'SROUT':   'SHIFT RIGHT OUT (pin 12). Serial output presenting stage 32 (Q32); used as the output end when shifting right and for cascading to another chip.',
      'LRCTRL':  'LEFT/RIGHT CONTROL (pin 13). LOW = shift right (stage 1 → stage 32). HIGH = shift left (stage 32 → stage 1).',
      'VDD':     'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
      'NC1':     'No connection (pin 1).',
      'NC5':     'No connection (pin 5).',
      'NC7':     'No connection (pin 7).',
      'NC10':    'No connection (pin 10).',
      'NC14':    'No connection (pin 14).',
      'NC15':    'No connection (pin 15).',
    },
    guideSections: [
      {
        title: 'What the CD40100B is',
        paragraphs: [
          'A shift register is a row of one-bit memory cells (stages) connected so that on each clock pulse the bit in every cell copies into the next cell along the row. The CD40100B is one such row, 32 stages long. Feed a bit into the input and, clock by clock, it walks down the chain.',
          'Two features set this part apart from a basic shift register. It can shift in either direction, and it can route its own output back to its input so a pattern keeps circling around the 32 stages. Those are what make it useful as a serial memory, a digital delay line, or a stack.',
        ],
      },
      {
        title: 'Choosing the direction',
        paragraphs: [
          'The LEFT/RIGHT CONTROL pin sets which way bits move. Low means shift right: data enters at the SHIFT RIGHT IN pin into stage 1 and walks toward stage 32. High means shift left: data enters at the SHIFT LEFT IN pin into stage 32 and walks toward stage 1.',
          'Each end of the chain has its own output. SHIFT LEFT OUT shows what is in stage 1; SHIFT RIGHT OUT shows what is in stage 32. A bit clocked into a stage shows up at that end\'s output half a clock later, on the next falling clock edge — the datasheet states this so two chips can be chained without the timing fighting.',
        ],
      },
      {
        title: 'Recirculating, and why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          'With RECIRCULATE CONTROL high, the entering stage takes its bit from the external serial input — normal shifting. With it low, the entering stage instead takes the bit coming off the far end, so the 32-bit pattern loops around itself forever (until you change the control). That loop is what lets the chip act as a fixed delay or a circular serial store. The CLOCK INHIBIT pin, when high, stops all shifting so you can hold the contents still.',
          '74Sim models a chip pin as a fixed input or output and runs each gate to a steady state with no propagation delay. The CD40100B needs more than that: its shift direction and its recirculate path are both chosen live by control pins, and its outputs lag the stored bits by half a clock. None of the simulator\'s shift-register building blocks reproduce a register that reverses direction and reroutes its feedback at run time. Rather than ship a version that would shift the wrong way in half its modes, this entry documents the real part — verified pinout, function and notes — but is hidden from the breadboard picker and drives no outputs in the sim. Build it on the bench if you need the real behavior.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.datasheethub.com/cd40100-32-stage-left-right-shift-register/',
    tags: ['shift register', '32-stage', 'left/right', 'bidirectional', 'recirculate', 'cmos', '4000', 'sequential', 'stub'],
    pinout: [
      { pin: 1,  name: 'NC1',    type: 'nc',     description: 'No connection.' },
      { pin: 2,  name: 'CLKINH', type: 'input',  description: 'CLOCK INHIBIT. HIGH freezes the register (no shift on the clock edge); LOW allows shifting.' },
      { pin: 3,  name: 'CLK',    type: 'input',  description: 'CLOCK — shifts one stage on each LOW-to-HIGH (rising) edge.' },
      { pin: 4,  name: 'SLOUT',  type: 'output', description: 'SHIFT LEFT OUT — serial output presenting stage 1 (Q1); output end when shifting left.' },
      { pin: 5,  name: 'NC5',    type: 'nc',     description: 'No connection.' },
      { pin: 6,  name: 'SLIN',   type: 'input',  description: 'SHIFT LEFT IN — serial data loaded into stage 32 in shift-left mode (LEFT/RIGHT CONTROL HIGH, RECIRCULATE CONTROL HIGH).' },
      { pin: 7,  name: 'NC7',    type: 'nc',     description: 'No connection.' },
      { pin: 8,  name: 'VSS',    type: 'power',  description: 'Negative supply / ground.' },
      { pin: 9,  name: 'RECIRC', type: 'input',  description: 'RECIRCULATE CONTROL. HIGH accepts the external serial input; LOW recirculates the far end back to the entering end.' },
      { pin: 10, name: 'NC10',   type: 'nc',     description: 'No connection.' },
      { pin: 11, name: 'SRIN',   type: 'input',  description: 'SHIFT RIGHT IN — serial data loaded into stage 1 in shift-right mode (LEFT/RIGHT CONTROL LOW, RECIRCULATE CONTROL HIGH).' },
      { pin: 12, name: 'SROUT',  type: 'output', description: 'SHIFT RIGHT OUT — serial output presenting stage 32 (Q32); output end when shifting right.' },
      { pin: 13, name: 'LRCTRL', type: 'input',  description: 'LEFT/RIGHT CONTROL. LOW = shift right (stage 1 → 32); HIGH = shift left (stage 32 → 1).' },
      { pin: 14, name: 'NC14',   type: 'nc',     description: 'No connection.' },
      { pin: 15, name: 'NC15',   type: 'nc',     description: 'No connection.' },
      { pin: 16, name: 'VDD',    type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Documentation stub: the CD40100B is a 32-stage register whose shift direction
    // (LEFT/RIGHT CONTROL) and recirculate feedback path (RECIRCULATE CONTROL) are
    // both chosen at run time, with a half-clock output delay — none of which any
    // engine shift-register primitive models, and the shared engine file cannot be
    // edited during this parallel run (issues.md B2; coverage-plan hint
    // SHIFT_REG_16BIT_STUB). SHIFT_REG_16BIT_STUB drives all listed outputs Hi-Z;
    // the 'stub' tag hides the chip from the picker (info sheet only).
    gates: [
      {
        type: 'SHIFT_REG_16BIT_STUB',
        inputs: ['SRIN', 'SLIN', 'CLK', 'CLKINH', 'RECIRC', 'LRCTRL'],
        outputs: ['SLOUT', 'SROUT'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD40100B\'s run-time-selectable shift direction (LEFT/RIGHT CONTROL) and recirculate feedback (RECIRCULATE CONTROL), nor the half-clock delay from a stage to its serial output, so its outputs are not driven. Pinout verified vs the RCA CD40100B terminal assignment + functional diagram (RCA 1980 COS/MOS databook) read as rendered PDF page images, cross-checked against the Datasheet Hub pin table. See issues.md B2 and C4.',
  },
};
