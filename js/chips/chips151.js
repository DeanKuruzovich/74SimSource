// CMOS 4000-series coverage — Batch 2 (combinational, multifunction gate).
// CD4048B: Multifunction expandable 8-input gate with a 3-state output.
//
// Shipped in its own standalone block (CHIPS_BLOCK_151) to avoid colliding
// with other agents adding chips in the same working tree.
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ──
// The CD4048 is not a fixed-function gate: three binary "function control"
// inputs Ka/Kb/Kc select one of EIGHT different logic functions of the eight
// data inputs (NOR, OR, OR/AND, OR/NAND, AND, NAND, AND/NOR, AND/OR), a fourth
// control input Kd puts the output into a high-impedance 3-state, and an EXPAND
// input lets two packages be cascaded into a 16-input gate. 74Sim's engine has
// no "function-select multiplexed gate" primitive (the Coverage-Plan marks this
// part 🔴 "function-select too complex"), so per the CD4046 / CD4553 precedent
// (issues.md D13) it ships as an "info sheet only" documentation entry: the page
// documents the real part (verified pinout + full function table) but the chip
// is hidden from the picker and drives no behavior in the simulator.
//
// ── Sources (IEEE-style; every pinout pin and behavioral claim traces here) ──
// Source: Texas Instruments (data acquired from Harris Semiconductor),
//   "CD4048B Types — CMOS Multifunction Expandable 8-Input Gate, High-Voltage
//   Types (20-Volt Rating)", SCHS045C (Revised October 2003). [Online].
//   Available: https://www.ti.com/lit/ds/symlink/cd4048b.pdf. Verified:
//   TERMINAL ASSIGNMENT (TOP VIEW) on page 1 + Functional Diagram (page 1) +
//   Fig. 2 Logic Diagram (page 2) + Fig. 3 Actual-Circuit Logic Configurations
//   with their Ka-Kb-Kc select codes (page 2) + the "IMPLEMENTATION OF EXPAND
//   INPUT FOR 9 OR MORE INPUTS" Boolean-expression table (page 3), all read as
//   300/350-dpi rendered PDF page images (NOT a text summarizer — issues.md C4),
//   and NOT cloned from any sibling part (issues.md C2 lesson).
//
//   Verified pin map (TOP VIEW): 1=J(OUTPUT) 2=Kd 3=H 4=G 5=F 6=E 7=Kb 8=VSS
//   9=Kc 10=Ka 11=D 12=C 13=B 14=A 15=EXPAND 16=VDD. The three function-select
//   lines do NOT sit together: Ka=10, Kb=7, Kc=9, with the 3-state control Kd=2.
//
//   Verified function table — Fig. 3 select codes (Ka-Kb-Kc):
//     000 NOR · 001 OR · 010 OR/AND · 011 OR/NAND ·
//     100 AND · 101 NAND · 110 AND/NOR · 111 AND/OR.
//   Compound functions split the 8 inputs into two groups of four,
//   {A,B,C,D} and {E,F,G,H}, e.g. OR/AND = (A+B+C+D)·(E+F+G+H),
//   AND/OR = (A·B·C·D)+(E·F·G·H). (Boolean-expression table, page 3.)
//   3-state: Kd HIGH → output driven (logic 0 or 1); Kd LOW → high impedance
//   (open), letting the part share a common bus line (page 1 description).
//   EXPAND: tie to VSS when unused; otherwise it is OR'd/AND'd into the first
//   stage so two CD4048Bs cascade to a 16-input gate (page 1 description,
//   Figs. 4/5, page-3 expand table).

export const CHIPS_BLOCK_151 = {
  // ── CD4048B: Multifunction expandable 8-input gate, 3-state output ─────────
  'CD4048': {
    name: 'CD4048',
    simpleName: '8-in multifunction gate',
    description: 'Multifunction 8-input gate, 3-state out (16-pin CMOS) — info sheet only',
    guideOverview: 'The CD4048B is one chip that can be wired up as eight different logic gates. It has eight data inputs (A–H) and three "function control" inputs (Ka, Kb, Kc). The 3-bit code on Ka/Kb/Kc picks which function the eight inputs feed: NOR, OR, OR/AND, OR/NAND, AND, NAND, AND/NOR, or AND/OR. A fourth control input, Kd, controls a 3-state output: when Kd is high the single output J drives a normal logic 0 or 1; when Kd is low the output goes to high impedance (an open circuit) so the chip can share a common bus with other devices. An EXPAND input lets two CD4048Bs be chained into a 16-input gate. NOTE: 74Sim is a functional logic simulator and has no "function-select" gate primitive to model a part whose logic function is chosen at runtime by control pins, so this part is provided as a documentation / info-sheet entry only. Its output is not driven in the simulator.',
    guidePinDescriptions: {
      'J':      'OUTPUT (pin 1). The single gate output. Its logic function is chosen by Ka/Kb/Kc; it is driven only when Kd is high, and is high-impedance (open) when Kd is low.',
      'Kd':     'FUNCTION CONTROL / 3-STATE CONTROL (pin 2). High = output J is enabled and drives logic 0 or 1. Low = output J is at high impedance, so the chip can be tied to a common bus.',
      'H':      'Data input H (pin 3).',
      'G':      'Data input G (pin 4).',
      'F':      'Data input F (pin 5).',
      'E':      'Data input E (pin 6).',
      'Kb':     'FUNCTION CONTROL Kb (pin 7). One of the three binary select bits that choose the logic function.',
      'VSS':    'Negative supply / ground (pin 8).',
      'Kc':     'FUNCTION CONTROL Kc (pin 9). One of the three binary select bits that choose the logic function.',
      'Ka':     'FUNCTION CONTROL Ka (pin 10). The most-significant select bit: low picks an OR-based function group, high picks an AND-based group.',
      'D':      'Data input D (pin 11).',
      'C':      'Data input C (pin 12).',
      'B':      'Data input B (pin 13).',
      'A':      'Data input A (pin 14).',
      'EXPAND': 'EXPAND input (pin 15). Lets two CD4048Bs be cascaded into a 16-input gate. Tie to VSS (logic 0) when it is not used.',
      'VDD':    'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'What the CD4048B is',
        paragraphs: [
          'The CD4048B is a single 8-input gate whose logic function is not fixed — you choose it with three control pins. The eight data inputs are A, B, C, D (pins 14, 13, 12, 11) and E, F, G, H (pins 6, 5, 4, 3). The one output is J (pin 1).',
          'Three "function control" inputs Ka (pin 10), Kb (pin 7) and Kc (pin 9) form a 3-bit code that selects one of eight functions. A fourth control input Kd (pin 2) is separate: it switches the output between a normal driven state and a high-impedance 3-state.',
        ],
      },
      {
        title: 'The eight selectable functions',
        paragraphs: [
          'The code on Ka-Kb-Kc picks the function. With the EXPAND input tied to ground (the normal single-package case):',
          '000 → NOR: J = NOT(A+B+C+D+E+F+G+H). 001 → OR: J = A+B+…+H. 100 → AND: J = A·B·…·H. 101 → NAND: J = NOT(A·B·…·H).',
          'The other four are compound functions that first split the eight inputs into two groups of four — {A,B,C,D} and {E,F,G,H}: 010 → OR/AND: J = (A+B+C+D)·(E+F+G+H). 011 → OR/NAND: J = NOT[(A+B+C+D)·(E+F+G+H)]. 111 → AND/OR: J = (A·B·C·D)+(E·F·G·H). 110 → AND/NOR: J = NOT[(A·B·C·D)+(E·F·G·H)].',
          'The pattern: Ka chooses whether the first stage groups inputs with OR (Ka=0) or AND (Ka=1); Kb and Kc choose the second-stage combine and whether the final output is inverted.',
        ],
      },
      {
        title: 'The 3-state output and the EXPAND input',
        paragraphs: [
          'Kd (pin 2) controls a 3-state output. When Kd is high the output J drives a real logic 0 or 1. When Kd is low the output is at high impedance — effectively an open circuit — so several CD4048Bs (or other 3-state parts) can share one common bus line and take turns driving it.',
          'EXPAND (pin 15) lets two packages be chained into a 16-input gate: the output stage of one chip is OR-ed or AND-ed in through the EXPAND input of the next, depending on the selected function. When you are not expanding, tie EXPAND to VSS (logic 0) so it has no effect.',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          '74Sim builds circuits from fixed-function primitives. The CD4048B is unusual because its logic function is chosen at runtime by the Ka/Kb/Kc control pins, and the engine has no "pick-a-function" gate to represent that, plus a 3-state output and a cascade input on top. Rather than fake one of the eight modes and mislead, this entry documents the real part — verified pinout and full function table — but is hidden from the breadboard picker and drives no output in the sim.',
          'If you need this on the bench, the datasheet linked here is the authority. Note the control pins are not adjacent on the package: Ka=10, Kb=7, Kc=9, and the 3-state control Kd=2.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4048b.pdf',
    tags: ['gate', 'multifunction', 'configurable', '8-input', 'tri-state', '3-state', 'expandable', 'cmos', '4000', 'stub'],
    pinout: [
      { pin: 1,  name: 'J',      type: 'output', description: 'OUTPUT — the single gate output (3-state, controlled by Kd).' },
      { pin: 2,  name: 'Kd',     type: 'input',  description: 'FUNCTION CONTROL Kd — 3-state control: high = output driven, low = high-impedance.' },
      { pin: 3,  name: 'H',      type: 'input',  description: 'Data input H.' },
      { pin: 4,  name: 'G',      type: 'input',  description: 'Data input G.' },
      { pin: 5,  name: 'F',      type: 'input',  description: 'Data input F.' },
      { pin: 6,  name: 'E',      type: 'input',  description: 'Data input E.' },
      { pin: 7,  name: 'Kb',     type: 'input',  description: 'FUNCTION CONTROL Kb — binary function-select bit.' },
      { pin: 8,  name: 'VSS',    type: 'power',  description: 'Negative supply / ground.' },
      { pin: 9,  name: 'Kc',     type: 'input',  description: 'FUNCTION CONTROL Kc — binary function-select bit.' },
      { pin: 10, name: 'Ka',     type: 'input',  description: 'FUNCTION CONTROL Ka — binary function-select bit (low = OR group, high = AND group).' },
      { pin: 11, name: 'D',      type: 'input',  description: 'Data input D.' },
      { pin: 12, name: 'C',      type: 'input',  description: 'Data input C.' },
      { pin: 13, name: 'B',      type: 'input',  description: 'Data input B.' },
      { pin: 14, name: 'A',      type: 'input',  description: 'Data input A.' },
      { pin: 15, name: 'EXPAND', type: 'input',  description: 'EXPAND — cascade input for a 16-input gate; tie to VSS when unused.' },
      { pin: 16, name: 'VDD',    type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Documentation stub: the runtime function-select (Ka/Kb/Kc choose 1 of 8
    // logic functions), the 3-state output (Kd) and the EXPAND cascade are not
    // modeled (Coverage-Plan §Batch 2 marks this 🔴 "function-select too
    // complex"). GENERIC_STUB drives the output Hi-Z; the chip is hidden from
    // the picker by the 'stub' tag. See issues.md C2/C4 for the verification
    // process and the no-cloning lesson.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['J'],
      },
    ],
    note: 'Info sheet only: 74Sim has no function-select gate primitive to model the CD4048B (Ka/Kb/Kc pick 1 of 8 logic functions; Kd is a 3-state control; EXPAND cascades two packages to 16 inputs). Pinout + function table verified vs TI CD4048B SCHS045C, read as PDF page images. See Coverage-Plan Batch 2 / issues.md C2/C4.',
  },
};
