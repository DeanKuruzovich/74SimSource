// chips140.js — CMOS 4000-series coverage expansion
// CD4532: 8-bit priority encoder (binary-coded output).
// Shipped in its own standalone block (CHIPS_BLOCK_140) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_140 = {
  // ── CD4532B: CMOS 8-bit priority encoder, 3-bit binary output (16-pin) ──────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD4532B Types — CMOS 8-Bit Priority Encoder", SCHS082C (revised October
     2003). [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4532b.pdf
     Verified: TERMINAL ASSIGNMENT (TOP VIEW) on page 1 and the Fig. 8 logic
     diagram on page 3 (both carry per-pin numbers and AGREE), plus the page-3
     TRUTH TABLE and the page-1 functional description, all read as rendered PDF
     page images (Read with pages:, NOT the text summarizer — see issues.md C4)
     and NOT cloned from a sibling part (issues.md C2).

     Pinout (DIP-16, TOP VIEW), confirmed identical in the terminal assignment
     and the logic diagram:
       1=D4  2=D5  3=D6  4=D7  5=EI  6=Q2  7=Q1  8=VSS
       9=Q0  10=D0 11=D1 12=D2 13=D3 14=GS 15=EO 16=VDD
     (D7 = highest-priority input; EI = chip enable input;
      Q2Q1Q0 = 3-bit binary code; GS = group select; EO = enable output.)

     Behavior (datasheet TRUTH TABLE — ALL inputs and outputs ACTIVE HIGH):
       EI D7 D6 D5 D4 D3 D2 D1 D0 | GS Q2 Q1 Q0 EO
        0  X  X  X  X  X  X  X  X |  0  0  0  0  0   (disabled: all outputs LOW)
        1  0  0  0  0  0  0  0  0 |  0  0  0  0  1   (enabled, no input asserted)
        1  1  X  X  X  X  X  X  X |  1  1  1  1  0   (D7 highest → code 7)
        1  0  1  X  X  X  X  X  X |  1  1  1  0  0   (D6 → code 6)
        1  0  0  1  X  X  X  X  X |  1  1  0  1  0   (D5 → code 5)
        1  0  0  0  1  X  X  X  X |  1  1  0  0  0   (D4 → code 4)
        1  0  0  0  0  1  X  X  X |  1  0  1  1  0   (D3 → code 3)
        1  0  0  0  0  0  1  X  X |  1  0  1  0  0   (D2 → code 2)
        1  0  0  0  0  0  0  1  X |  1  0  0  1  0   (D1 → code 1)
        1  0  0  0  0  0  0  0  1 |  1  0  0  0  0   (D0 → code 0)
     This is the ACTIVE-HIGH counterpart of the 74x148 (which is fully
     active-LOW with inverted-binary outputs) — neither the hinted
     PRIORITY_ENC_8LINE (74x149, a 1-of-8 active-LOW one-hot output, wrong
     shape) nor PRIORITY_ENC_8TO3 (74x148, inverted polarity) fit, so a new
     PRIORITY_ENC_8TO3_HI primitive was added to specificChipsSim.js. */
  'CD4532': {
    name: 'CD4532',
    simpleName: '8-Bit Priority Encoder',
    description: '8-input priority encoder, 3-bit binary out, CMOS 4000 (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4532b.pdf',
    tags: ['cmos', '4000 series', 'priority encoder', 'encoder', '8 to 3', 'binary', 'cascade'],
    guideOverview: 'The CD4532 looks at eight inputs (D0-D7) and reports which of them is HIGH, as a 3-bit binary number on outputs Q2 Q1 Q0. If more than one input is HIGH at once, it reports the highest-numbered one: D7 wins over D6, D6 over D5, and so on down to D0. This is the job of a priority encoder — turning "which line is active" into a small binary number, the reverse of what a decoder does. A separate Group Select (GS) output goes HIGH whenever at least one input is HIGH, so you can tell the all-zero case (Q = 000 because nothing is active) apart from D0 being active (Q = 000 because input 0 won). The chip-enable input EI must be HIGH for the encoder to work; pulling EI LOW switches everything off and forces all outputs LOW. The Enable Output (EO) and EI together let you chain several CD4532s to encode more than eight inputs.',
    guidePinDescriptions: {
      'D4': 'Priority input 4 (active HIGH), pin 1.',
      'D5': 'Priority input 5 (active HIGH), pin 2.',
      'D6': 'Priority input 6 (active HIGH), pin 3.',
      'D7': 'Priority input 7, the highest priority (active HIGH), pin 4. If D7 is HIGH the output is 111 regardless of the other inputs.',
      'EI': 'Enable Input / chip enable (active HIGH), pin 5. Must be HIGH to run the encoder; LOW forces every output LOW.',
      'Q2': 'Binary output bit 2 (most significant, weight 4), pin 6.',
      'Q1': 'Binary output bit 1 (weight 2), pin 7.',
      'VSS': 'Ground / negative supply (0 V), pin 8.',
      'Q0': 'Binary output bit 0 (least significant, weight 1), pin 9.',
      'D0': 'Priority input 0, the lowest priority (active HIGH), pin 10.',
      'D1': 'Priority input 1 (active HIGH), pin 11.',
      'D2': 'Priority input 2 (active HIGH), pin 12.',
      'D3': 'Priority input 3 (active HIGH), pin 13.',
      'GS': 'Group Select output (active HIGH), pin 14. HIGH when the chip is enabled and at least one input is HIGH; lets you tell "input 0 active" apart from "no input active".',
      'EO': 'Enable Output (active HIGH), pin 15. HIGH only when the chip is enabled and no input is HIGH. Feeds the EI of the next-lower-priority CD4532 when cascading.',
      'VDD': 'Positive supply, pin 16.',
    },
    guideSections: [
      {
        title: 'Reading the output',
        paragraphs: [
          'The encoder scans D7 down to D0 and stops at the first input it finds HIGH. That input number, in binary, is what appears on Q2 Q1 Q0. D7 HIGH gives 111, D4 HIGH (with D5-D7 LOW) gives 100, D0 HIGH (with all others LOW) gives 000.',
          'Because both "D0 is the only active input" and "nothing is active" leave Q at 000, you cannot tell them apart from Q alone. Group Select (GS) solves this: it is HIGH whenever any input is HIGH. So Q = 000 with GS HIGH means D0; Q = 000 with GS LOW means no input is active.',
        ],
      },
      {
        title: 'Enabling and cascading',
        paragraphs: [
          'The Enable Input (EI) must be HIGH for the chip to do anything. Pull EI LOW and all five outputs (Q2, Q1, Q0, GS, EO) go LOW no matter what the data inputs do.',
          'The Enable Output (EO) goes HIGH only when the chip is enabled and finds no active input. To build an encoder for 16 inputs from two CD4532s, feed the EO of the chip handling the high inputs into the EI of the chip handling the low inputs. The low chip is then only allowed to drive the bus when the high chip has nothing active, and the two GS lines plus a few gates combine the codes.',
        ],
        note: 'This is a combinational part: the outputs follow the inputs directly with no clock. 74Sim models it with no propagation delay (issues.md A1), so the settled outputs are exact but the brief glitches a real chip shows while inputs change are not reproduced.',
      },
    ],
    pinout: [
      { pin:  1, name: 'D4',  type: 'input'  },
      { pin:  2, name: 'D5',  type: 'input'  },
      { pin:  3, name: 'D6',  type: 'input'  },
      { pin:  4, name: 'D7',  type: 'input'  },
      { pin:  5, name: 'EI',  type: 'input'  },
      { pin:  6, name: 'Q2',  type: 'output' },
      { pin:  7, name: 'Q1',  type: 'output' },
      { pin:  8, name: 'VSS', type: 'power'  },
      { pin:  9, name: 'Q0',  type: 'output' },
      { pin: 10, name: 'D0',  type: 'input'  },
      { pin: 11, name: 'D1',  type: 'input'  },
      { pin: 12, name: 'D2',  type: 'input'  },
      { pin: 13, name: 'D3',  type: 'input'  },
      { pin: 14, name: 'GS',  type: 'output' },
      { pin: 15, name: 'EO',  type: 'output' },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      // PRIORITY_ENC_8TO3_HI input contract: [D0..D7, EI], output contract:
      // [Q0, Q1, Q2, GS, EO]. All active HIGH. EI=1 enables; EI=0 forces all
      // outputs LOW. See _evaluatePriorityEnc8to3Hi in specificChipsSim.js.
      {
        type: 'PRIORITY_ENC_8TO3_HI',
        inputs: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'EI'],
        outputs: ['Q0', 'Q1', 'Q2', 'GS', 'EO'],
      },
    ],
  },
};
