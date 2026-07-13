// CMOS 4000-series coverage — CD40117 (programmable dual 4-bit terminator).
//
// Shipped in its own standalone block (CHIPS_BLOCK_153) to avoid colliding with
// other agents adding chips in the same working tree.
//
// ── What the part is ─────────────────────────────────────────────────────────
// The CD40117B is a dual 4-bit BUS TERMINATOR. Each of its two sections has four
// I/O terminal lines plus a STROBE and a DATA control bit. Programmed by STROBE
// and DATA, each section becomes either (a) a bank of weak pull-UP resistors,
// (b) a bank of weak pull-DOWN resistors, or (c) a bus-hold LATCH that keeps the
// last logic state the bus carried. It replaces discrete pull-up/pull-down
// resistor packs and adds bus-hold ("anti-bounce") behavior, drawing current
// only while a line is changing.
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ──────
// This is fundamentally an ANALOG / weak-driver part. Its terminal lines are
// WEAK resistive sources (and a weak bus-hold keeper) that ANY real driver on
// the bus is meant to override — the whole point is the strength comparison
// between the terminator and whatever else drives the net. 74Sim is a functional
// digital-logic simulator and explicitly does NOT model bus-hold / weak-keeper
// strength (issues.md A12) or analog resistive drive strength, and the CMOS-4000
// coverage plan already designated this part for the "info sheet only" tail
// (CMOS-4000-Coverage-Plan.md §D3, Section 3 Batch 3 row, hint `GENERIC_STUB`).
// Shipping a "working" terminator would mean modeling a weak source that loses to
// a strong one — exactly the strength comparison the engine lacks — so a faithful
// model would be misleading. It is therefore added as a documentation entry: the
// page documents the real part (verified pinout, function, truth table, design
// notes), but the chip is hidden from the picker and drives no outputs.
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD40117B Types — Programmable Dual 4-Bit Terminator, High-Voltage Types
//   (20-Volt Rating)", SCHS101C (Revised September 2003). [Online]. Available:
//   https://www.ti.com/lit/ds/symlink/cd40117b.pdf. Verified: TERMINAL DIAGRAM
//   (TOP VIEW), TRUTH TABLE, FUNCTIONAL BLOCK DIAGRAM and Fig. 1 logic diagram,
//   page 1–2, read as rendered PDF page images (not a text summarizer — see
//   issues.md C4), and NOT cloned from any sibling part (see issues.md C2).
//   Verified 14-pin DIP map: STROBE A=1, STROBE B=2, 1A=3, 2A=4, 3A=5, 4A=6,
//   VSS=7, 4B=8, 3B=9, 2B=10, 1B=11, DATA B=12, DATA A=13, VDD=14.
//   Verified truth table (per section): STROBE=1,DATA=0 → all four terminals
//   pull-DOWN (≈logic 0 via resistor); STROBE=1,DATA=1 → all four terminals
//   pull-UP (≈logic 1 via resistor); STROBE=0 → all four terminals act as a
//   LATCH (bus-hold of the prior state). The datasheet is marked "NOT
//   RECOMMENDED FOR NEW DESIGNS".

export const CHIPS_BLOCK_153 = {
  // ── CD40117: Programmable Dual 4-Bit Terminator ──────────────────────────────
  'CD40117': {
    name: 'CD40117',
    simpleName: 'Dual 4-bit terminator',
    description: 'Programmable dual 4-bit bus terminator (14-pin CMOS) — info sheet only',
    guideOverview: 'The CD40117B is a programmable dual 4-bit bus terminator. It has two independent sections; each section has four terminal lines plus a STROBE and a DATA control input. Depending on the control bits, each section can act as four weak pull-up resistors, four weak pull-down resistors, or a bus-hold latch that keeps the last logic level a bus line carried. It is used to replace discrete pull-up/pull-down resistor packs on a bus, to add anti-bounce (bus-hold) behavior, and to flag floating inputs — and it draws current only while a line is actually changing. NOTE: 74Sim is a functional digital-logic simulator and does not model the weak-keeper / weak-resistor drive strength this part depends on (a terminator is meant to be a weak source that any real bus driver overrides), so this part is provided as a documentation / info-sheet entry only. Its terminal lines are not driven in the simulator.',
    guidePinDescriptions: {
      'STRA': 'STROBE A (pin 1). Control bit for section A. HIGH = section A acts as a resistor bank (pull-up or pull-down per DATA A); LOW = section A acts as a bus-hold latch.',
      'STRB': 'STROBE B (pin 2). Control bit for section B (same meaning as STROBE A, for section B).',
      '1A':   'Terminal 1 of section A (pin 3). Bus I/O line. Terminated to VDD, VSS, or held, per the STROBE A / DATA A controls.',
      '2A':   'Terminal 2 of section A (pin 4). Bus I/O line.',
      '3A':   'Terminal 3 of section A (pin 5). Bus I/O line.',
      '4A':   'Terminal 4 of section A (pin 6). Bus I/O line.',
      'VSS':  'Negative supply / ground (pin 7).',
      '4B':   'Terminal 4 of section B (pin 8). Bus I/O line.',
      '3B':   'Terminal 3 of section B (pin 9). Bus I/O line.',
      '2B':   'Terminal 2 of section B (pin 10). Bus I/O line.',
      '1B':   'Terminal 1 of section B (pin 11). Bus I/O line. Terminated to VDD, VSS, or held, per the STROBE B / DATA B controls.',
      'DATB': 'DATA B (pin 12). When STROBE B is HIGH, selects the resistor polarity for section B: DATA B = 1 → pull-up, DATA B = 0 → pull-down.',
      'DATA': 'DATA A (pin 13). When STROBE A is HIGH, selects the resistor polarity for section A: DATA A = 1 → pull-up, DATA A = 0 → pull-down.',
      'VDD':  'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'What the CD40117B is',
        paragraphs: [
          'A bus needs something to hold its lines at a known level when nothing is driving them. Normally that job is done by a pack of pull-up or pull-down resistors. The CD40117B replaces that resistor pack with two programmable 4-bit sections, and adds a third trick: bus-hold.',
          'Each section has four terminal lines and two control inputs, STROBE and DATA. The two sections (A and B) are independent, so one chip terminates eight bus lines total. An unused terminal line can be left open with no effect on the rest of the chip, and a terminal needs only one connection to the bus.',
        ],
      },
      {
        title: 'The three modes',
        paragraphs: [
          'STROBE = 1, DATA = 0: all four terminals of that section act as pull-DOWN resistors — they gently pull their bus lines toward ground (logic 0).',
          'STROBE = 1, DATA = 1: all four terminals act as pull-UP resistors — they gently pull their bus lines toward VDD (logic 1).',
          'STROBE = 0: all four terminals act as a LATCH (bus-hold). Each line keeps whatever logic level it last had. If a real driver then changes the line, the driver wins and the latch follows the new level; once the driver releases, the latched level is preserved. This is what gives the part its anti-bounce behavior. Because the terminator is a weak source, any normal bus driver overrides it.',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          'A terminator only makes sense if it is weaker than the things driving the bus: a pull-up resistor must lose to a driver pulling LOW, and the bus-hold latch must lose to any active driver. That is a comparison of drive strengths.',
          '74Sim resolves nets to digital logic levels and does not model weak-versus-strong drive strength or the bus-hold keeper (see issues.md A12). A simulated terminator would either fight real drivers (wrong) or do nothing (also wrong). Rather than ship something misleading, this entry documents the real part — pinout, modes, truth table, and design notes — but is hidden from the breadboard picker and drives no outputs. The datasheet linked here is the authority.',
        ],
      },
    ],
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40117b.pdf',
    tags: ['terminator', 'bus terminator', 'pull-up', 'pull-down', 'bus hold', 'keeper', 'cmos', '4000', 'stub'],
    // Verified terminal assignment — TI/Harris CD40117B SCHS101C, TERMINAL
    // DIAGRAM (TOP VIEW), page 1, read as a PDF page image (issues.md C4).
    pinout: [
      { pin: 1,  name: 'STRA', type: 'input', description: 'STROBE A — HIGH = resistor mode, LOW = latch mode, for section A.' },
      { pin: 2,  name: 'STRB', type: 'input', description: 'STROBE B — HIGH = resistor mode, LOW = latch mode, for section B.' },
      { pin: 3,  name: '1A',   type: 'bidir', description: 'Section A terminal line 1 (bus I/O).' },
      { pin: 4,  name: '2A',   type: 'bidir', description: 'Section A terminal line 2 (bus I/O).' },
      { pin: 5,  name: '3A',   type: 'bidir', description: 'Section A terminal line 3 (bus I/O).' },
      { pin: 6,  name: '4A',   type: 'bidir', description: 'Section A terminal line 4 (bus I/O).' },
      { pin: 7,  name: 'VSS',  type: 'power', description: 'Negative supply / ground.' },
      { pin: 8,  name: '4B',   type: 'bidir', description: 'Section B terminal line 4 (bus I/O).' },
      { pin: 9,  name: '3B',   type: 'bidir', description: 'Section B terminal line 3 (bus I/O).' },
      { pin: 10, name: '2B',   type: 'bidir', description: 'Section B terminal line 2 (bus I/O).' },
      { pin: 11, name: '1B',   type: 'bidir', description: 'Section B terminal line 1 (bus I/O).' },
      { pin: 12, name: 'DATB', type: 'input', description: 'DATA B — with STROBE B HIGH: 1 = pull-up, 0 = pull-down (section B).' },
      { pin: 13, name: 'DATA', type: 'input', description: 'DATA A — with STROBE A HIGH: 1 = pull-up, 0 = pull-down (section A).' },
      { pin: 14, name: 'VDD',  type: 'power', description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Documentation stub: the weak resistive pull-up/pull-down and bus-hold
    // keeper behavior is not modeled (see issues.md A12 / Coverage-Plan §D3).
    // GENERIC_STUB drives all terminal I/O lines Hi-Z; the chip is hidden from
    // the picker by the 'stub' tag.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['1A', '2A', '3A', '4A', '1B', '2B', '3B', '4B'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD40117B terminator (weak resistive pull-up/pull-down + bus-hold keeper need drive-strength comparison the engine lacks — see issues.md A12). Pinout + truth table verified vs TI/Harris CD40117B SCHS101C. See Coverage-Plan §D3.',
  },
};
