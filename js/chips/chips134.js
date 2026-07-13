// chips134.js — Block 134: CMOS 4000 series logic ICs (coverage expansion, Batch 9)
// CD40104 — 4-bit BIDIRECTIONAL UNIVERSAL shift register with THREE-STATE outputs.
// Pinout + behavior verified by reading the SGS-Thomson (ST) combined datasheet
// "HCC/HCF40104B  HCC/HCF40194B — 4-BIT BIDIRECTIONAL UNIVERSAL SHIFT REGISTER"
// (June 1989) directly as PDF page images (Read with pages:), NOT via the WebFetch
// text summarizer which mangles these scans (see issues.md C4). Pin connections
// (page 1), functional diagram (page 2), and the page-1/2 DESCRIPTION text were
// all read from the rendered pages.
//
// ⚠ PINOUT (issues.md C2 lesson — verified, not cloned from a sibling shift
// register): DIP-16 terminal assignment for the 40104B (its OWN pinout, which
// DIFFERS from the 40194B sibling on pin 1 — OUTPUT ENABLE vs RESET):
//   1 OUTPUT ENABLE, 2 SHIFT RIGHT IN, 3 D0, 4 D1, 5 D2, 6 D3,
//   7 SHIFT LEFT IN, 8 VSS, 9 S0, 10 S1, 11 CLOCK,
//   12 Q3, 13 Q2, 14 Q1, 15 Q0, 16 VDD.
//
// ⚠ PRIMITIVE: the coverage-plan hint `SHIFT_REG_4BIT_BIDIR_TRI` is the 74295
// model — only ONE shift direction + parallel load, selected by a single MODE
// pin, with NO shift-left and NO clear. It does NOT fit the 40104B, which is a
// genuine UNIVERSAL register: S1/S0 select four modes (00 = synchronous clear,
// 01 = shift right, 10 = shift left, 11 = parallel load). The near-twin
// `SHIFT_REG_4BIT_BIDIR` (74194-style) does the four modes but its mode 00 is
// HOLD and it has no tri-state output. So a new engine primitive
// `SHIFT_REG_4BIT_UNIV_TRI` was added to js/specificChipsSim.js (the 40194-style
// universal register, but with mode-00 SYNCHRONOUS CLEAR and active-HIGH OUTPUT
// ENABLE three-state outputs) rather than cloning the wrong behavior. See
// issues.md for the recorded divergence.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 9) for the full roadmap.
// Chips: CD40104
export const CHIPS_BLOCK_134 = {

  // ── CD40104: 4-bit bidirectional universal shift register, TRI (16-pin) ─────
  /* Primary source: SGS-Thomson Microelectronics, "HCC/HCF40104B
     HCC/HCF40194B — 4-BIT BIDIRECTIONAL UNIVERSAL SHIFT REGISTER", June 1989.
     [Online]. Available:
     http://www.frankshospitalworkshop.com/electronics/data_sheets/4000/40194.pdf
     Verified: PIN CONNECTIONS (page 1) + FUNCTIONAL DIAGRAM (page 2) +
     DESCRIPTION (pages 1-2), read as rendered PDF page images (issues.md C4).
     40104B DIP-16 terminal assignment:
       1 OUTPUT ENABLE, 2 SHIFT RIGHT IN, 3 D0, 4 D1, 5 D2, 6 D3,
       7 SHIFT LEFT IN, 8 VSS, 9 S0, 10 S1, 11 CLOCK,
       12 Q3, 13 Q2, 14 Q1, 15 Q0, 16 VDD.
     Function (DESCRIPTION): "a universal shift register featuring parallel
     inputs, parallel outputs, SHIFT RIGHT and SHIFT LEFT serial inputs, and a
     high-impedance third output state. In the parallel-load mode (S0 and S1 are
     high), data is loaded into the associated flip-flop and appears at the output
     after the positive transition of the CLOCK input. During loading, serial
     data flow is inhibited. Shift-right and shift-left are accomplished
     synchronously on the positive clock edge with serial data entered at the
     SHIFT RIGHT and SHIFT LEFT serial inputs, respectively. Clearing the
     register is accomplished by setting both mode controls low and clocking the
     register. When the output enable input is low, all outputs assume the high
     impedance state." → Mode (S1,S0): 00 = synchronous clear, 01 = shift right
     (SR → first stage Q0), 10 = shift left (SL → last stage Q3), 11 = parallel
     load. OUTPUT ENABLE is ACTIVE HIGH (LOW → outputs Hi-Z). The 40104B has NO
     reset pin — the dedicated RESET pin belongs to the 40194B sibling (which
     puts HOLD on mode 00 and has no three-state output).
     Secondary cross-check: Intersil/Renesas CD40104BMS datasheet (File 2376),
     same 4-bit bidirectional universal shift register with 3-state outputs. */
  'CD40104': {
    name: 'CD40104',
    simpleName: '4-Bit Bidir Universal Shift Register (tri-state)',
    description: '4-bit bidirectional universal shift register, 3-state outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'http://www.frankshospitalworkshop.com/electronics/data_sheets/4000/40194.pdf',
    tags: ['shift-register', 'bidirectional', 'universal', '4 bit', 'tri state', 'cmos', '4000'],
    sequential: true,
    guideOverview: 'The CD40104B is a 4-bit universal shift register: it can hold a word, shift it left, shift it right, or load four bits in parallel, all under two mode-select pins. S1 and S0 pick the mode on each rising clock edge — 00 clears the register, 01 shifts right (a new bit enters at SHIFT RIGHT IN and moves toward Q3), 10 shifts left (a new bit enters at SHIFT LEFT IN and moves toward Q0), and 11 loads D0-D3 in parallel. The four outputs are three-state: OUTPUT ENABLE HIGH drives Q0-Q3, OUTPUT ENABLE LOW disconnects them so the register can share a bus with other devices. Unlike the closely related CD40194B, this part has no separate reset pin — you clear it by selecting mode 00 and clocking.',
    guidePinDescriptions: {
      'OE': 'OUTPUT ENABLE (pin 1), active HIGH. HIGH drives Q0-Q3; LOW puts all four outputs in the high-impedance (disconnected) state so they can share a bus.',
      'SR': 'SHIFT RIGHT serial input (pin 2). In shift-right mode (S1=0, S0=1) this bit is loaded into the first stage (Q0) on the clock edge.',
      'D0': 'Parallel data input bit 0 (pin 3). Loaded into Q0 in parallel-load mode (S1=S0=1).',
      'D1': 'Parallel data input bit 1 (pin 4). Loaded into Q1 in parallel-load mode.',
      'D2': 'Parallel data input bit 2 (pin 5). Loaded into Q2 in parallel-load mode.',
      'D3': 'Parallel data input bit 3 (pin 6). Loaded into Q3 in parallel-load mode.',
      'SL': 'SHIFT LEFT serial input (pin 7). In shift-left mode (S1=1, S0=0) this bit is loaded into the last stage (Q3) on the clock edge.',
      'VSS': 'Negative supply / ground (pin 8, 0 V).',
      'S0': 'Mode-select bit 0 (pin 9). With S1, picks hold/shift/load on the clock edge.',
      'S1': 'Mode-select bit 1 (pin 10). With S0: 00 clear, 01 shift right, 10 shift left, 11 parallel load.',
      'CLOCK': 'Shift clock (pin 11). All actions (clear, shift, load) happen on the POSITIVE edge.',
      'Q3': 'Register output bit 3 (pin 12), three-state.',
      'Q2': 'Register output bit 2 (pin 13), three-state.',
      'Q1': 'Register output bit 1 (pin 14), three-state.',
      'Q0': 'Register output bit 0 (pin 15), three-state. First stage of the shift chain.',
      'VDD': 'Positive supply (pin 16, 3 V to 18 V on real silicon).',
    },
    guideSections: [
      {
        title: 'Choosing A Mode With S1 And S0',
        paragraphs: [
          'The two mode pins decide what the next rising clock edge does. S1=0, S0=0 clears the register to all zeros. S1=0, S0=1 shifts right: each stage copies the one before it and SHIFT RIGHT IN enters at Q0. S1=1, S0=0 shifts left: each stage copies the one after it and SHIFT LEFT IN enters at Q3. S1=1, S0=1 loads D0-D3 in parallel. Because every action is synchronous, you change the mode pins while the clock is low and the chosen operation takes effect cleanly on the next edge.',
        ],
      },
      {
        title: 'Three-State Outputs For Bus Sharing',
        paragraphs: [
          'OUTPUT ENABLE controls whether the outputs are connected. Hold it HIGH and Q0-Q3 drive their values normally. Pull it LOW and the four outputs go high-impedance — electrically disconnected — so several registers can take turns driving the same set of wires. OUTPUT ENABLE only affects the output pins; it does not change the stored data or stop the register from shifting.',
        ],
      },
      {
        title: 'Clearing Without A Reset Pin',
        paragraphs: [
          'This part has no dedicated reset input. To clear it, select mode 00 (both S1 and S0 LOW) and apply a clock edge — the register loads all zeros. That is the main difference from the CD40194B, which trades the three-state outputs and the mode-00 clear for a direct overriding RESET pin and a mode-00 hold.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OE',    type: 'input'  },
      { pin:  2, name: 'SR',    type: 'input'  },
      { pin:  3, name: 'D0',    type: 'input'  },
      { pin:  4, name: 'D1',    type: 'input'  },
      { pin:  5, name: 'D2',    type: 'input'  },
      { pin:  6, name: 'D3',    type: 'input'  },
      { pin:  7, name: 'SL',    type: 'input'  },
      { pin:  8, name: 'VSS',   type: 'power'  },
      { pin:  9, name: 'S0',    type: 'input'  },
      { pin: 10, name: 'S1',    type: 'input'  },
      { pin: 11, name: 'CLOCK', type: 'input'  },
      { pin: 12, name: 'Q3',    type: 'output' },
      { pin: 13, name: 'Q2',    type: 'output' },
      { pin: 14, name: 'Q1',    type: 'output' },
      { pin: 15, name: 'Q0',    type: 'output' },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    // SHIFT_REG_4BIT_UNIV_TRI contract (js/specificChipsSim.js):
    //   inputs:  [SR, SL, D0, D1, D2, D3, S0, S1, CLK, OE]
    //   outputs: [Q0, Q1, Q2, Q3]
    //   mode (S1,S0): 00 clear, 01 shift right (SR→Q0), 10 shift left (SL→Q3),
    //                 11 parallel load. OE active HIGH (LOW → Hi-Z).
    gates: [
      { type: 'SHIFT_REG_4BIT_UNIV_TRI',
        inputs: ['SR', 'SL', 'D0', 'D1', 'D2', 'D3', 'S0', 'S1', 'CLOCK', 'OE'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3'] },
    ],
  },
};
