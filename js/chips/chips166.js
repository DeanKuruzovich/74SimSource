// CMOS 4000-series coverage — CD4062A (COS/MOS 200-stage dynamic shift register).
//
// Shipped in its own standalone block (CHIPS_BLOCK_166) to avoid colliding with
// the other agents adding chips in the same working tree.
//
// ── What the part is ─────────────────────────────────────────────────────────
// The CD4062A is a 200-stage DYNAMIC serial shift register. A bit applied at the
// data input ripples one stage per clock toward the Q output, 200 stages later.
// It can be clocked one of two ways, chosen by the CLOCK-MODE (CM) pin:
//   • CM LOW  → single-phase clocking on CL (pin 1), for low-power / low
//     clock-line-capacitance use (specified to ~1 MHz, supply 3–10 V).
//   • CM HIGH → two-phase clocking on CL1/CL2 (pins 9/5), for high-speed use
//     (to ~5 MHz, supply 3–15 V). The single-phase CL input has an internal
//     pull-down that is activated when CM is high, so it may be left open then.
// A recirculate path (RECIRC. CONTROL + RECIRC. inputs) lets the 200-bit pattern
// feed back on itself for use as a long serial memory / CRT-refresh memory, and
// delayed two-phase clock outputs (CL1D, CL2D) are brought out so registers can
// be cascaded into longer words.
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ──────
// "Dynamic" is the operative word: each stage stores its bit as CHARGE on an
// internal node, not in a static latch. The register must therefore be clocked
// CONTINUOUSLY above a minimum rate (≈10 kHz typical, down to ~1 kHz at room
// temperature) or the charge leaks away and the stored bits are lost. 74Sim is a
// functional digital-logic simulator that models storage as ideal/static
// (issues.md A5 — no charge decay, no minimum-clock-rate concept) and uses
// idealized clocks (issues.md A3). Beyond that, 200 stages is far more than the
// engine's shift-register primitives can hold — they pack a register's stages
// into a single 31-bit integer (issues.md D6, the reason the 32/64-stage CD40100/
// CD4031/CD4517 also ship as stubs) — and no existing primitive models the dual
// single/two-phase clock mode, the recirculate input gating, or the delayed-clock
// cascade outputs. The CMOS-4000 coverage plan already designated this part for
// the "info sheet only" tail (CMOS-4000-Coverage-Plan.md §D3, hint GENERIC_STUB).
// Shipping a half-working 200-bit register that ignores the charge-decay that
// defines a dynamic part would be misleading, so it is added as a documentation
// entry: the page documents the real part (verified pinout, function, modes,
// design notes) but the chip is hidden from the picker and drives no outputs.
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: RCA Solid State Division, "COS/MOS 200-Stage Dynamic Shift Register —
//   CD4062AK, CD4062AT, CD4062AH", File No. 816, in "RCA COS/MOS Integrated
//   Circuits" databook SSD-203A (1975), pp. 305–311. [Online]. Available:
//   https://www.bitsavers.org/components/rca/_dataBooks/1975_RCA_COS_MOS_Integrated_Circuits.pdf
//   Verified: Fig. 1 "CD4062A logic block diagram" + Fig. 2 "Clock circuit logic
//   diagram" (the only pin-numbered drawings in this edition; signal pins carry
//   both the 16-lead-flat-pack number and, in parentheses, the 12-lead TO-5
//   number), and the device description / Special Features, read as rendered
//   300-dpi PDF page images — NOT a text summarizer (issues.md C4), and NOT
//   cloned from a sibling part (issues.md C2).
// Source: RCA Solid State Division, "COS/MOS 200-Stage Dynamic Shift Register —
//   CD4062A Types", File No. 816, in "RCA COS/MOS Integrated Circuits" databook
//   (1980), pp. 577–580. [Online]. Available:
//   https://www.bitsavers.org/components/rca/_dataBooks/1980_RCA_COS_MOS_Integrated_Circuits.pdf
//   Verified: the explicit "CD4062AT TERMINAL DIAGRAM (TOP VIEW)" (drawing
//   92CS-22693, 12-lead TO-5), read as a 300-dpi rendered PDF page-image crop —
//   this is the clean, complete terminal drawing the 1975 edition lacks, and it
//   cross-checks pin-for-pin against the 1975 logic-diagram TO-5 numbers.
//
// Reconciliation: the CD4062A was made ONLY in a 12-lead TO-5 can (T), a 16-lead
// flat package (K), and chip form (H) — there is no DIP. This entry models the
// 12-lead TO-5 (CD4062AT), because that is the package with a complete, clean,
// independently verified TERMINAL DIAGRAM (1980 databook) that agrees with the
// 1975 logic-diagram pin numbers. Verified TO-5 map (TOP VIEW):
//   1=CL (single-phase clock), 2=D (data in), 3=RC (recirc. control),
//   4=REC (recirc. in), 5=CL2 (two-phase clock 2), 6=CL2D (delayed clock out 2),
//   7=VSS, 8=CL1D (delayed clock out 1), 9=CL1 (two-phase clock 1), 10=Q (out),
//   11=CM (clock mode), 12=VDD.
// (For reference, the 1975 logic diagram gives the 16-lead-flat-pack numbers as
//  CL=1, D=2, RC=3, REC=4, CL2=5, CL2D=7, CL1D=10, CL1=11, Q=12, CM=13, with VDD/
//  VSS and the spare pins unlabeled in that edition — which is the second reason
//  the cleanly-drawn TO-5 package is the one modeled here.)

export const CHIPS_BLOCK_166 = {
  // ── CD4062: 200-Stage Dynamic Shift Register (12-lead TO-5, CD4062AT) ─────────
  'CD4062': {
    name: 'CD4062',
    simpleName: '200-stage dynamic shift register',
    description: '200-stage dynamic shift register (12-lead TO-5 CMOS) — info sheet only',
    guideOverview: 'The CD4062A is a 200-stage dynamic serial shift register. A bit applied at the data input (D) moves one stage closer to the output (Q) on every clock edge, so a bit takes 200 clocks to travel from input to output — it behaves like a 200-step delay line for serial data. It can be clocked two ways, picked by the clock-mode pin (CM): with CM low it uses a single clock on the CL pin (lower power); with CM high it uses a two-phase clock on CL1 and CL2 (higher speed). A recirculate path (the RC and REC pins) can feed the output back to the input so the 200-bit pattern circulates forever, which is how it was used as a small serial memory or CRT-refresh memory. Delayed copies of the two-phase clock (CL1D, CL2D) are brought out so several registers can be chained into a longer one. NOTE: this is a "dynamic" register — each bit is held as a tiny charge that leaks away unless the chip is clocked continuously above a minimum rate, so data is lost if the clock stops. 74Sim models storage as ideal and static and does not simulate that charge decay, the minimum clock rate, the dual clock modes, or a register this long, so this part is provided as a documentation / info-sheet entry only. Its outputs are not driven in the simulator.',
    guidePinDescriptions: {
      'CL':   'Single-phase clock input (pin 1). Used when CM is LOW. Data shifts one stage on each rising edge. When CM is HIGH this input is pulled down internally and can be left open.',
      'D':    'Serial data input (pin 2). The logic level here is shifted into the first stage on the next clock edge.',
      'RC':   'Recirculate control (pin 3). Selects whether the first stage takes the external data input (D) or the recirculate input (REC).',
      'REC':  'Recirculate input (pin 4). Usually tied to the Q output so the 200-bit pattern feeds back on itself and circulates, for use as a long serial memory.',
      'CL2':  'Two-phase clock input, phase 2 (pin 5). Used together with CL1 when CM is HIGH.',
      'CL2D': 'Delayed phase-2 clock output (pin 6). A delayed copy of the internal phase-2 clock, brought out so registers can be cascaded.',
      'VSS':  'Negative supply / ground (pin 7).',
      'CL1D': 'Delayed phase-1 clock output (pin 8). A delayed copy of the internal phase-1 clock, brought out so registers can be cascaded.',
      'CL1':  'Two-phase clock input, phase 1 (pin 9). Used when CM is HIGH; data shifts on its rising edge.',
      'Q':    'Serial data output (pin 10). The bit that entered 200 clocks earlier appears here, through an output buffer that can drive a TTL load.',
      'CM':   'Clock-mode select (pin 11). LOW = single-phase clocking on CL (pin 1); HIGH = two-phase clocking on CL1/CL2 (pins 9/5).',
      'VDD':  'Positive supply (+3 V to +15 V; modeled at +5 V) at pin 12.',
    },
    guideSections: [
      {
        title: 'What the CD4062A is',
        paragraphs: [
          'A shift register is a chain of one-bit storage cells. Each clock edge, every bit hands its value to the next cell down the line. The CD4062A is a very long chain — 200 cells — with a single serial input (D) at one end and a single serial output (Q) at the other.',
          'Because there are 200 cells, a bit you put in at D does not come out at Q until 200 clock edges later. That makes the chip a programmable-length delay line for a stream of bits, which is exactly what it was used for: serial memory, time-delay circuits, and refreshing the picture on an early CRT display.',
        ],
      },
      {
        title: 'Two ways to clock it',
        paragraphs: [
          'The clock-mode pin (CM) picks how the register is clocked. With CM LOW, a single clock on the CL pin (pin 1) drives the whole register — simple wiring and low power, intended for speeds up to about 1 MHz.',
          'With CM HIGH, the register expects a two-phase clock: two clocks, CL1 and CL2, that are HIGH at different times. Two-phase clocking lets the part run faster (to about 5 MHz) and relaxes how sharp the clock edges have to be. The chip also brings out delayed copies of these clocks (CL1D, CL2D) so a second CD4062A can be chained on the end to make an even longer register.',
        ],
      },
      {
        title: 'Recirculating the data',
        paragraphs: [
          'The RC (recirculate control) and REC (recirculate) pins let the register feed its own output back to its input. Tie REC to Q and use RC to select that path, and the 200-bit pattern keeps circling around the loop, reappearing every 200 clocks. That turns the shift register into a small, continuously-refreshed serial memory.',
          'When RC selects the external data path instead, new bits from D enter the register as usual.',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          'The word "dynamic" is the catch. Each of the 200 cells holds its bit as a small electric charge, not in a static latch. That charge slowly leaks away, so the register must be clocked continuously — above roughly 10 kHz at room temperature — or the stored bits fade and are lost. Stop the clock and the data disappears. That charge-decay-versus-clock-rate behavior is the defining feature of the part.',
          '74Sim resolves logic to ideal, static storage (see issues.md A5) and uses idealized clocks (A3): it has no notion of charge that leaks or of a minimum clock rate, so it cannot reproduce the one behavior that makes this a dynamic register. On top of that, the simulator engine packs a shift register’s cells into a single 31-bit number, so a 200-stage register simply does not fit (the same limit that left the 32- and 64-stage CD40100/CD4031/CD4517 as stubs), and nothing in the engine models the dual single/two-phase clock modes, the recirculate gating, or the delayed-clock cascade outputs.',
          'Rather than ship a 200-bit register that quietly ignores the charge decay that defines the part, this entry documents the real CD4062A — pinout, clock modes, recirculate path, and design notes — but is hidden from the breadboard picker and drives no outputs. The datasheet linked here is the authority.',
        ],
      },
    ],
    pins: 12,
    vcc: 12,
    gnd: 7,
    datasheet: 'https://www.bitsavers.org/components/rca/_dataBooks/1980_RCA_COS_MOS_Integrated_Circuits.pdf',
    tags: ['shift register', 'dynamic shift register', 'serial memory', 'delay line', 'cmos', '4000', 'stub'],
    // Verified terminal assignment — RCA CD4062AT TERMINAL DIAGRAM (TOP VIEW),
    // drawing 92CS-22693, 1980 COS/MOS databook p.580, read as a PDF page image
    // (issues.md C4); cross-checked vs the 1975 File No. 816 logic diagram. The
    // CD4062A has no DIP package; this is the 12-lead TO-5 (CD4062AT) map.
    pinout: [
      { pin: 1,  name: 'CL',   type: 'input',  description: 'Single-phase clock input. Used when CM is LOW; data shifts on each rising edge. Internally pulled down when CM is HIGH.' },
      { pin: 2,  name: 'D',    type: 'input',  description: 'Serial data input. Shifted into the first stage on the next clock edge.' },
      { pin: 3,  name: 'RC',   type: 'input',  description: 'Recirculate control. Selects the external data input (D) or the recirculate input (REC) for the first stage.' },
      { pin: 4,  name: 'REC',  type: 'input',  description: 'Recirculate input. Usually tied to Q so the 200-bit pattern circulates.' },
      { pin: 5,  name: 'CL2',  type: 'input',  description: 'Two-phase clock input, phase 2. Used with CL1 when CM is HIGH.' },
      { pin: 6,  name: 'CL2D', type: 'output', description: 'Delayed phase-2 clock output, for cascading registers.' },
      { pin: 7,  name: 'VSS',  type: 'power',  description: 'Negative supply / ground.' },
      { pin: 8,  name: 'CL1D', type: 'output', description: 'Delayed phase-1 clock output, for cascading registers.' },
      { pin: 9,  name: 'CL1',  type: 'input',  description: 'Two-phase clock input, phase 1. Used when CM is HIGH; data shifts on its rising edge.' },
      { pin: 10, name: 'Q',    type: 'output', description: 'Serial data output (after 200 stages), through a TTL-compatible output buffer.' },
      { pin: 11, name: 'CM',   type: 'input',  description: 'Clock-mode select. LOW = single-phase clock on CL; HIGH = two-phase clock on CL1/CL2.' },
      { pin: 12, name: 'VDD',  type: 'power',  description: 'Positive supply (+3 V to +15 V; modeled at +5 V).' },
    ],
    // Documentation stub: the dynamic charge-storage (with its minimum clock
    // rate), the dual single/two-phase clock modes, the recirculate gating, the
    // delayed-clock cascade outputs, and a 200-stage register are all beyond the
    // engine (issues.md A3/A5/D6; Coverage-Plan §D3). GENERIC_STUB drives the
    // output pins Hi-Z; the chip is hidden from the picker by the 'stub' tag.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['Q', 'CL1D', 'CL2D'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD4062A. It is a 200-stage DYNAMIC shift register whose bits are held as charge and must be clocked continuously or they leak away (no charge-decay / minimum-clock-rate model — issues.md A5/A3); 200 stages also exceeds the engine’s 31-bit shift-register packing (issues.md D6), and nothing models its dual single/two-phase clock modes, recirculate path, or delayed-clock cascade outputs. Pinout verified vs the RCA CD4062AT TERMINAL DIAGRAM (1980 COS/MOS databook) cross-checked against the 1975 File No. 816 logic diagram. See Coverage-Plan §D3.',
  },
};
