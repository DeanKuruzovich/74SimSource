// chips100.js — Block 100: CMOS 4000 series logic ICs (coverage expansion, Batch 9)
// CD4035 — 4-stage clocked PARALLEL-IN / PARALLEL-OUT shift register with
// J-K(bar) serial inputs and TRUE/COMPLEMENT outputs. Pinout + behavior verified
// by reading the Texas Instruments datasheet "CD4035B Types — CMOS 4-Stage
// Parallel In/Parallel Out Shift Register with J-K Serial Inputs and True/
// Complement Outputs" (SCHS038C, Revised October 2003) directly as PDF page
// images (Read with pages:), NOT via the WebFetch text summarizer which mangles
// these scans (see issues.md C4). Functional diagram + first-stage truth table
// read from page 1 at 300 dpi.
//
// ⚠ PINOUT (issues.md C2 lesson — verified, not cloned from a sibling shift
// register): from the FUNCTIONAL DIAGRAM, DIP-16 terminal assignment is
//   1 Q1, 2 T/C, 3 K-BAR, 4 J, 5 RESET, 6 CLOCK, 7 P/S, 8 VSS,
//   9 I1, 10 I2, 11 I3, 12 I4, 13 Q4, 14 Q3, 15 Q2, 16 VDD.
//
// ⚠ PRIMITIVE: the coverage-plan hint `SHIFT_REG_4BIT` is the 7495 model
// (MODE select + two separate clocks CLK1/CLK2, plain D stages, no reset). It
// does NOT fit the CD4035, which has a single clock, a P/S level control, a
// J-K(bar) first stage, an async active-HIGH RESET, and a true/complement
// output control. A new engine primitive `SHIFT_REG_4BIT_PIPO_4035` was added
// to js/specificChipsSim.js instead of cloning the wrong behavior.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 9) for the full roadmap.
// Chips: CD4035
export const CHIPS_BLOCK_100 = {

  // ── CD4035: 4-stage PIPO shift register, J-K serial in, T/C out (16-pin) ────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4035B Types — CMOS 4-Stage Parallel In/Parallel Out
     Shift Register with J-K Serial Inputs and True/Complement Outputs",
     SCHS038C (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4035b.pdf
     Terminal assignment (FUNCTIONAL DIAGRAM, page 1):
       1 Q1/Q1', 2 T/C, 3 K (bar), 4 J, 5 RESET, 6 CLOCK, 7 P/S, 8 VSS,
       9 I1, 10 I2, 11 I3, 12 I4, 13 Q4/Q4', 14 Q3/Q3', 15 Q2/Q2', 16 VDD.
     Function (page 1 + FIRST STAGE TRUTH TABLE): a 4-stage clocked shift
     register. Information is transferred on the POSITIVE clock edge. Serial
     data enters stage 1 through J-K logic — the second serial input is K-BAR
     (the complement of K), so Q1next = J·(~Q1) + K_BAR·Q1 (tie J and K-BAR
     together and stage 1 becomes a D flip-flop). Stages 2-4 are serial D
     flip-flops. PARALLEL/SERIAL CONTROL (P/S) HIGH permits SYNCHRONOUS parallel
     entry of I1..I4 on the clock edge; LOW selects serial-shift mode. RESET is
     ASYNCHRONOUS and ACTIVE HIGH (clears all stages). The TRUE/COMPLEMENT (T/C)
     control sets output polarity asynchronously: HIGH → true register contents
     at the outputs, LOW → their complements. */
  'CD4035': {
    name: 'CD4035',
    simpleName: '4-Stage PIPO Shift Register (J-K in, True/Complement out)',
    description: '4-stage PIPO shift register, JK serial in, sync load, async reset (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4035b.pdf',
    tags: ['shift-register', 'pipo', '4 bit', 'jk', 'cmos', '4000'],
    sequential: true,
    guideOverview: 'The CD4035B is a 4-stage clocked shift register with parallel access to every stage. Serial data enters the first stage through J-K logic, where the second serial input is K-BAR (the complement of K); connect J and K-BAR together and the first stage behaves like a plain D flip-flop. Stages 2, 3 and 4 are serial D stages, so each positive CLOCK edge walks the data Q1→Q2→Q3→Q4. Raising PARALLEL/SERIAL CONTROL (P/S) loads I1..I4 into the four stages on the next clock edge instead of shifting. RESET is asynchronous and active HIGH (it clears all four stages immediately). The TRUE/COMPLEMENT (T/C) control picks the output polarity without needing a clock: HIGH shows the true register contents, LOW shows their complements.',
    guidePinDescriptions: {
      'Q1': 'Stage-1 output (pin 1). Shows the true or complemented stage-1 bit depending on T/C.',
      'TC': 'TRUE/COMPLEMENT control (pin 2). HIGH → outputs show the true register contents; LOW → outputs show the complement. Acts asynchronously (no clock needed).',
      'KBAR': 'Serial input K-BAR (pin 3) — the COMPLEMENT of the J-K K input. Stage 1 computes Q1next = J·(~Q1) + K_BAR·Q1. Tie this to J for D-flip-flop (shift-register) operation.',
      'J': 'Serial input J (pin 4) of the first-stage J-K flip-flop.',
      'RESET': 'Asynchronous reset (pin 5), ACTIVE HIGH. HIGH forces all four stages to 0 regardless of the clock.',
      'CLOCK': 'Shift clock (pin 6). Data transfers (serial shift or parallel load) on each POSITIVE edge.',
      'PS': 'PARALLEL/SERIAL CONTROL (pin 7). HIGH → synchronous parallel load of I1..I4 on the clock edge; LOW → serial-shift mode.',
      'VSS': 'Negative supply / ground (pin 8, 0 V).',
      'I1': 'Parallel data input to stage 1 (pin 9). Loaded when P/S is HIGH.',
      'I2': 'Parallel data input to stage 2 (pin 10).',
      'I3': 'Parallel data input to stage 3 (pin 11).',
      'I4': 'Parallel data input to stage 4 (pin 12).',
      'Q4': 'Stage-4 output (pin 13) — true or complemented per T/C.',
      'Q3': 'Stage-3 output (pin 14) — true or complemented per T/C.',
      'Q2': 'Stage-2 output (pin 15) — true or complemented per T/C.',
      'VDD': 'Positive supply (pin 16, 3 V to 18 V on real silicon).',
    },
    guideSections: [
      {
        title: 'Serial Shifting With J-K Inputs',
        paragraphs: [
          'With P/S LOW, each positive CLOCK edge shifts the register one place: the first stage takes a new bit decided by its J and K-BAR inputs, and stages 2-4 copy the stage in front of them. Because the second serial input is K-BAR (already inverted on the chip), tying J and K-BAR together makes the first stage act as a D flip-flop — the simplest way to use the part as an ordinary serial-in shift register. Leaving J and K-BAR independent gives the full J-K set/reset/toggle behavior on the input stage, useful for counting and sequence generation.',
        ],
      },
      {
        title: 'Synchronous Parallel Load',
        paragraphs: [
          'Raise PARALLEL/SERIAL CONTROL (P/S) HIGH and the next positive CLOCK edge jams I1..I4 into the four stages at once instead of shifting. The load is synchronous — it waits for the clock — so you can switch cleanly between loading a word and shifting it out. This makes the CD4035 handy for parallel-to-serial and serial-to-parallel conversion.',
        ],
      },
      {
        title: 'Reset And True/Complement Outputs',
        paragraphs: [
          'RESET is asynchronous and active HIGH: assert it and all four stages clear immediately, independent of the clock. The TRUE/COMPLEMENT (T/C) control selects what the output pins show, also without a clock — HIGH presents the true register contents and LOW presents their bit-by-bit complement. Toggling T/C therefore inverts all four outputs together while leaving the stored data untouched.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Q1',    type: 'output' },
      { pin:  2, name: 'TC',    type: 'input'  },
      { pin:  3, name: 'KBAR',  type: 'input'  },
      { pin:  4, name: 'J',     type: 'input'  },
      { pin:  5, name: 'RESET', type: 'input'  },
      { pin:  6, name: 'CLOCK', type: 'input'  },
      { pin:  7, name: 'PS',    type: 'input'  },
      { pin:  8, name: 'VSS',   type: 'power'  },
      { pin:  9, name: 'I1',    type: 'input'  },
      { pin: 10, name: 'I2',    type: 'input'  },
      { pin: 11, name: 'I3',    type: 'input'  },
      { pin: 12, name: 'I4',    type: 'input'  },
      { pin: 13, name: 'Q4',    type: 'output' },
      { pin: 14, name: 'Q3',    type: 'output' },
      { pin: 15, name: 'Q2',    type: 'output' },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    // SHIFT_REG_4BIT_PIPO_4035 contract (js/specificChipsSim.js):
    //   inputs:  [J, KBAR, CLK, PS, TC, RESET, I1, I2, I3, I4]
    //   outputs: [Q1, Q2, Q3, Q4]
    gates: [
      { type: 'SHIFT_REG_4BIT_PIPO_4035',
        inputs: ['J', 'KBAR', 'CLOCK', 'PS', 'TC', 'RESET', 'I1', 'I2', 'I3', 'I4'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4'] },
    ],
  },
};
