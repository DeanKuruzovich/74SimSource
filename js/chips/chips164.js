// chips164.js — Block 164: CMOS 4000-series coverage expansion (Batch 9, shift
// registers). CD4031B — CMOS 64-stage static serial-in / serial-out shift
// register, with a 2:1 input data-source select (MODE CONTROL), a delayed clock
// output for cascading, and a half-stage delayed data output for slow-edge clocks.
//
// Shipped in its own standalone block (CHIPS_BLOCK_164) so it does not collide
// with the other agents adding chips in this same working tree.
//
// ── Source (IEEE-style) ──────────────────────────────────────────────────────
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4031B Types — CMOS 64-Stage Static Shift Register", doc SCHS036B
//   (Revised July 2003). [Online]. Available:
//   https://www.ti.com/lit/ds/symlink/cd4031b.pdf. Verified: TERMINAL ASSIGNMENT
//   (TOP VIEW), FUNCTIONAL DIAGRAM, INPUT CONTROL CIRCUIT TRUTH TABLE, TYPICAL
//   STAGE TRUTH TABLE, and the Q'/Terminal-5 truth table, all read from the saved
//   PDF rendered to 400-dpi page images (NOT a text summarizer — see issues.md
//   C4), and confirmed from the CD4031B's own datasheet rather than cloned from a
//   sibling shift register (see issues.md C2 / the CD4082 lesson).
//
// ── Verified pinout (16-pin DIP, TOP VIEW) ───────────────────────────────────
//   1  DATA IN 2 (RECIRCULATE)   16  VDD
//   2  CL IN (clock)             15  DATA IN 1
//   3  NC                        14  NC
//   4  NC                        13  NC
//   5  Q'  (half-stage out)      12  NC
//   6  Q   (data out)            11  NC
//   7  Q-bar (complement of Q)   10  MODE CONTROL
//   8  VSS                        9  CL_D (delayed clock out)
//   The functional-diagram footnote (NC = 3,4,11,12,13,14; VDD = 16; VSS = 8)
//   corroborates the terminal diagram. Pin 5 = Q' from the 1/2 stage; pin 6 = Q
//   and pin 7 = Q-bar are the true/complement outputs of stage 64.
//
// ── Behavior (from the datasheet) ────────────────────────────────────────────
//   * 64 D-type master/slave stages plus one extra master-only "1/2 stage".
//   * Data at the selected DATA input loads stage 1 and shifts one stage on each
//     POSITIVE (rising) CL edge (TYPICAL STAGE TRUTH TABLE). Fully static — a
//     stopped clock holds the pattern indefinitely (DC to 12 MHz typ @ 15 V).
//   * MODE CONTROL selects the bit entering stage 1 (INPUT CONTROL CIRCUIT TRUTH
//     TABLE): MODE = 0 -> DATA IN 1 (pin 15, "new data"); MODE = 1 -> DATA IN 2
//     (pin 1, the RECIRCULATE input). Tie an output back to DATA IN 2 and hold
//     MODE high to recirculate.
//   * Q (pin 6) = stage-64 output; Q-bar (pin 7) = its complement; Q' (pin 5) =
//     the same data one half clock later (from the 1/2 stage, captured on the
//     FALLING edge — Q'/Terminal-5 truth table), for clocks with slow rise/fall
//     times. CL_D (pin 9) is a delayed copy of the clock used to cascade packages
//     with reduced clock-drive requirements.
//
// ── 74Sim model ──────────────────────────────────────────────────────────────
// Driven by the new SHIFT_REG_64BIT_4031 engine primitive (js/specificChipsSim.js)
// — a genuine 64-deep serial register, not the inert SHIFT_REG_16BIT_STUB the
// coverage-plan hint pointed at. Divergences are limited to the engine-wide
// idealizations: zero propagation delay (issues.md A1), so CL_D is a same-level
// copy of CL IN and Q' is the exact half-clock-delayed Q with no edge skew.
// Chips: CD4031

export const CHIPS_BLOCK_164 = {
  // ── CD4031: CMOS 64-stage static shift register ──────────────────────────
  'CD4031': {
    name: 'CD4031',
    simpleName: '64-Stage Static Shift Register',
    description: '64-stage static serial-in/out shift register (16-pin CMOS)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4031b.pdf',
    tags: ['shift register', 'siso', 'serial', '64-stage', 'delay line', 'recirculate', 'cmos', '4000 series'],
    sequential: true,
    guideOverview: 'The CD4031B is a 64-stage static shift register. A bit placed on the data input is copied into the first stage and then moves one stage further along the chain on each rising edge of the clock, so a bit takes 64 clocks to travel from the input to the Q output (pin 6). "Static" means the clock can stop at any speed, even down to DC, and the stored pattern is held until you clock again. A MODE CONTROL pin picks which of two data inputs feeds the chain: low selects DATA IN 1 (fresh data), high selects DATA IN 2, the recirculate input — wire an output back to DATA IN 2 and hold MODE high and the pattern loops around forever. Besides the main Q output the chip also gives Q-bar (the inverse, pin 7), Q′ (the same data delayed by half a clock, pin 5, meant for clocks with slow edges) and a delayed clock output CL_D (pin 9) that lets several of these registers be chained without overloading the clock driver.',
    guidePinDescriptions: {
      'DI2':  'DATA IN 2 / RECIRCULATE (pin 1). Second data source for stage 1, selected when MODE CONTROL is high. Tie an output back here to recirculate the stored pattern.',
      'CLK':  'CL IN (pin 2). Clock input. Data shifts one stage on each low-to-high (rising) edge.',
      'NC3':  'No connection (pin 3).',
      'NC4':  'No connection (pin 4).',
      'QP':   'Q′ (pin 5). Data output from the extra half-stage — the same bit as Q but delayed by half a clock. Used when the clock has slow rise/fall times.',
      'Q':    'Q (pin 6). Main data output — the bit that has shifted through all 64 stages.',
      'QBAR': 'Q-bar (pin 7). Complement of the Q output.',
      'VSS':  'Negative supply / ground (pin 8).',
      'CLD':  'CL_D (pin 9). Delayed clock output. Drives the clock of the next register when several are cascaded, reducing the load on the clock source.',
      'MODE': 'MODE CONTROL (pin 10). Low selects DATA IN 1 (new data); high selects DATA IN 2 (recirculate mode).',
      'NC11': 'No connection (pin 11).',
      'NC12': 'No connection (pin 12).',
      'NC13': 'No connection (pin 13).',
      'NC14': 'No connection (pin 14).',
      'DI1':  'DATA IN 1 (pin 15). Primary data source for stage 1, selected when MODE CONTROL is low.',
      'VDD':  'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'What the CD4031B is',
        paragraphs: [
          'A shift register is a row of memory cells where each cell hands its bit to the next one every clock tick. The CD4031B has 64 such cells in a single line, plus one extra half-cell at the end. Put a bit on the data input, clock 64 times, and that bit appears at the Q output (pin 6); the bits in between are whatever you fed in on the previous 63 clocks. This makes the chip a 64-clock delay line or a place to store 64 bits of serial data.',
          'It is a "static" register, which means the storage does not leak away if the clock slows down or stops. You can run it from DC up to about 12 MHz (at 15 V) and the data is safe at any speed in between, so the pattern can be parked indefinitely with the clock held still.',
        ],
      },
      {
        title: 'Picking the data source — MODE CONTROL',
        paragraphs: [
          'Stage 1 can take its data from one of two pins, chosen by MODE CONTROL (pin 10). With MODE low the register loads DATA IN 1 (pin 15) — normal "shift in new data" operation. With MODE high it loads DATA IN 2 (pin 1), labelled RECIRCULATE.',
          'To make the stored pattern loop around forever, wire an output (Q, or Q′ for slow clocks) back to DATA IN 2 and hold MODE high. Each bit that leaves the end re-enters the front, so the 64-bit pattern circulates. MODE can also simply act as a 2-to-1 selector between two unrelated data streams.',
        ],
      },
      {
        title: 'The three outputs and the delayed clock',
        paragraphs: [
          'Q (pin 6) is the main output and Q-bar (pin 7) is its inverse. Q′ (pin 5) carries the same data as Q but half a clock later; it comes from the extra half-stage and exists so the register can be cascaded with clocks that have slow rise and fall times without losing a bit at the hand-off.',
          'CL_D (pin 9) is a cleaned-up, delayed copy of the input clock. When you chain several CD4031Bs end to end, feeding the next chip’s clock from CL_D instead of the raw clock spreads out the clock load, so one clock driver can run a long chain. The datasheet shows three cascading styles: direct clocking for top speed, delayed clocking via CL_D for reduced clock drive, and the half-clock-delayed Q′ output for slow-edged clocks.',
        ],
      },
      {
        title: 'How 74Sim models it',
        paragraphs: [
          '74Sim runs all 64 stages for real: each rising clock edge shifts the chain one place, MODE picks the input, and Q / Q-bar / Q′ / CL_D follow exactly as on the datasheet. Because the simulator has no propagation delay, CL_D carries the same level as the clock input and Q′ is the precise half-clock-delayed copy of Q rather than a separately skewed edge.',
          'Watching a single bit crawl through 64 stages one clock at a time is slow on a breadboard, but the register, the recirculate loop, and the delay-line behavior all work — the linked datasheet is the authority if you are building one for real.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'DI2',  type: 'input',  description: 'DATA IN 2 / RECIRCULATE — second data source, selected when MODE CONTROL is high.' },
      { pin: 2,  name: 'CLK',  type: 'input',  description: 'CL IN — clock input; data shifts one stage on each rising edge.' },
      { pin: 3,  name: 'NC',   type: 'nc'     },
      { pin: 4,  name: 'NC',   type: 'nc'     },
      { pin: 5,  name: 'QP',   type: 'output', description: 'Q′ — half-stage output; same data as Q delayed half a clock (for slow-edge clocks).' },
      { pin: 6,  name: 'Q',    type: 'output', description: 'Q — main data output (bit shifted through all 64 stages).' },
      { pin: 7,  name: 'QBAR', type: 'output', description: 'Q-bar — complement of the Q output.' },
      { pin: 8,  name: 'VSS',  type: 'power',  description: 'Negative supply / ground.' },
      { pin: 9,  name: 'CLD',  type: 'output', description: 'CL_D — delayed clock output for cascading registers with reduced clock drive.' },
      { pin: 10, name: 'MODE', type: 'input',  description: 'MODE CONTROL — low = DATA IN 1 (new data); high = DATA IN 2 (recirculate).' },
      { pin: 11, name: 'NC',   type: 'nc'     },
      { pin: 12, name: 'NC',   type: 'nc'     },
      { pin: 13, name: 'NC',   type: 'nc'     },
      { pin: 14, name: 'NC',   type: 'nc'     },
      { pin: 15, name: 'DI1',  type: 'input',  description: 'DATA IN 1 — primary data source, selected when MODE CONTROL is low.' },
      { pin: 16, name: 'VDD',  type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // SHIFT_REG_64BIT_4031 contract (js/specificChipsSim.js):
    //   inputs:  [DI1, DI2, CLK, MODE]   outputs: [Q, QBAR, QP, CLD]
    //   Rising CL edge shifts the 64-stage chain one place; stage 1 takes
    //   MODE? DI2 : DI1. Q = stage 64, QBAR = ~Q. Falling edge copies stage 64
    //   into the 1/2 stage → QP (Q' = half-clock-delayed Q). CLD follows CL IN.
    gates: [
      {
        type: 'SHIFT_REG_64BIT_4031',
        inputs:  ['DI1', 'DI2', 'CLK', 'MODE'],
        outputs: ['Q', 'QBAR', 'QP', 'CLD'],
      },
    ],
    note: 'Behavior: a bit at the selected DATA input shifts one of 64 stages per rising clock edge; MODE CONTROL low = DATA IN 1, high = DATA IN 2 (recirculate). Q (pin 6) and Q-bar (pin 7) are the stage-64 true/complement outputs, Q′ (pin 5) is the same data half a clock later, CL_D (pin 9) is a delayed copy of the clock for cascading. 74Sim models all 64 stages; the only divergence is the engine-wide zero propagation delay (issues.md A1), so CL_D matches the clock level and Q′ is the exact half-clock-delayed Q. Pinout + behavior verified vs TI/Harris CD4031B SCHS036B (Rev. July 2003), read as 400-dpi PDF page images. See issues.md C4 (read PDFs as images) and C2 (never clone a sibling pinout).',
  },
};
