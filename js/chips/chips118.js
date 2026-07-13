// chips118.js — Block 118: CMOS 4000 series logic ICs (coverage expansion).
// Dual 4-bit latch with 3-state outputs (CD4508). Pinout + behavior verified by
// reading the primary datasheet directly as rendered PDF page images (Read with
// pages:), NOT via the WebFetch text summarizer which mangles these scans (see
// issues.md C4). NOTE: this part lives alone in its own block file to avoid edit
// collisions with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md for the full roadmap. Chips: CD4508
export const CHIPS_BLOCK_118 = {

  // ── CD4508: dual 4-bit latch, 3-state outputs (24-pin) ──────────────────────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
       "CD4508B Types — CMOS Dual 4-Bit Latch (High-Voltage Types, 20-Volt
       Rating)", SCHS070B (Revised June 2003).
       [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4508b.pdf
       Verified: full DIP-24 terminal assignment read from the "TERMINAL
       ASSIGNMENT (TOP VIEW)" diagram on page 4 (fig. 92CS-27904), cross-checked
       against the A-section pin numbers in the Fig. 7 logic diagram (page 2) and
       the Functional Diagram (page 1); function/truth table read from the Fig. 7
       TRUTH TABLE (page 2) and the page-1 device description — all read as
       300-dpi PDF page images (issues.md C4), not the text summarizer.

     Verified DIP-24 pinout (TOP VIEW):
        1 = RESET A            13 = RESET B
        2 = STROBE A           14 = STROBE B
        3 = OUTPUT DISABLE A   15 = OUTPUT DISABLE B
        4 = D0 A               16 = D0 B
        5 = Q0 A               17 = Q0 B
        6 = D1 A               18 = D1 B
        7 = Q1 A               19 = Q1 B
        8 = D2 A               20 = D2 B
        9 = Q2 A               21 = Q2 B
       10 = D3 A               22 = D3 B
       11 = Q3 A               23 = Q3 B
       12 = VSS                24 = VDD
     (The B section is the 180-degree point-mirror of the A section — read off the
     terminal-assignment diagram, NOT assumed by cloning a sibling; issues.md C2.)

     Verified behavior (Fig. 7 truth table — columns RESET, DISABLE, STROBE,
     D INPUT -> Q OUTPUT; all controls active HIGH):
       RESET=0 DISABLE=0 STROBE=1 D=1 -> Q=1   } transparent: Q follows D while
       RESET=0 DISABLE=0 STROBE=1 D=0 -> Q=0   }   STROBE is HIGH
       RESET=0 DISABLE=0 STROBE=0 D=X -> LATCHED (hold last value)
       RESET=1 DISABLE=0 STROBE=X D=X -> Q=0    (reset forces outputs low)
       RESET=X DISABLE=1 STROBE=X D=X -> Q=Z    (3-state; DISABLE dominates)
     Page-1 text: "With the STROBE line in the high state, the data on the 'D'
     inputs appear at the corresponding 'Q' outputs provided the DISABLE line is
     in the low state. Changing the STROBE to the low state locks the data into
     the latch. A high on the reset line forces the outputs to a low state
     regardless of the state of the STROBE input. The outputs are forced to the
     high-impedance state ... by a high level on the DISABLE input."

     Engine primitive: neither coverage-plan hint fit. `LATCH_TRANS_4BIT` is the
     74226 bidirectional bus *transceiver* (DIR/OEA/OEB controls, A<->B data
     direction) — wrong device. `D_LATCH` is a single-bit latch with no 3-state
     output and no reset. A dedicated `LATCH_4BIT_TRI_RST` primitive was added to
     specificChipsSim.js (active-HIGH STROBE / RESET / OUTPUT DISABLE), and the
     two independent latches are instantiated as two gates. */
  'CD4508': {
    name: 'CD4508',
    simpleName: 'Dual 4-Bit Latch',
    description: 'Dual 4-bit transparent latch, 3-state out, CMOS 4000 series (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4508b.pdf',
    tags: ['cmos', '4000 series', 'latch', 'd latch', 'transparent', 'dual', 'tri-state', '3-state', 'bus', 'sequential'],
    guideOverview: 'The CD4508 holds two completely independent 4-bit latches in one 24-pin package, each with its own STROBE, RESET, and OUTPUT DISABLE control. Each latch is "transparent": while its STROBE input is HIGH the four Q outputs simply follow the four D inputs. Take STROBE LOW and whatever was on the D inputs at that moment is frozen (latched) on the outputs, ignoring further changes on D. A HIGH on the RESET line clears that latch, forcing its outputs LOW regardless of STROBE. The outputs are 3-state: a HIGH on the OUTPUT DISABLE line floats all four outputs to a high-impedance state so several devices can share a common bus, and OUTPUT DISABLE overrides everything else. Typical uses are buffer storage, holding registers, and data multiplexing onto a shared bus.',
    guidePinDescriptions: {
      'D0A': 'Latch A data input, bit 0. Appears at Q0A while STROBE A is HIGH.',
      'D1A': 'Latch A data input, bit 1.',
      'D2A': 'Latch A data input, bit 2.',
      'D3A': 'Latch A data input, bit 3.',
      'Q0A': 'Latch A output, bit 0. 3-state (floats when OUTPUT DISABLE A is HIGH).',
      'Q1A': 'Latch A output, bit 1.',
      'Q2A': 'Latch A output, bit 2.',
      'Q3A': 'Latch A output, bit 3.',
      'STROBE A': 'Latch A strobe (transparent enable), active HIGH. HIGH = outputs follow data; LOW = data locked/held.',
      'RESET A': 'Latch A reset, active HIGH. HIGH forces the four A outputs LOW (clears the latch) regardless of STROBE.',
      'OUTPUT DISABLE A': 'Latch A 3-state control, active HIGH. HIGH floats the four A outputs to high impedance; overrides STROBE and RESET.',
      'D0B': 'Latch B data input, bit 0.',
      'D1B': 'Latch B data input, bit 1.',
      'D2B': 'Latch B data input, bit 2.',
      'D3B': 'Latch B data input, bit 3.',
      'Q0B': 'Latch B output, bit 0. 3-state.',
      'Q1B': 'Latch B output, bit 1.',
      'Q2B': 'Latch B output, bit 2.',
      'Q3B': 'Latch B output, bit 3.',
      'STROBE B': 'Latch B strobe (transparent enable), active HIGH.',
      'RESET B': 'Latch B reset, active HIGH. HIGH forces the four B outputs LOW.',
      'OUTPUT DISABLE B': 'Latch B 3-state control, active HIGH. HIGH floats the four B outputs to high impedance.',
      VSS: 'Negative supply / ground (0 V).',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'RESET A',          type: 'input'  },
      { pin:  2, name: 'STROBE A',         type: 'input'  },
      { pin:  3, name: 'OUTPUT DISABLE A', type: 'input'  },
      { pin:  4, name: 'D0A',              type: 'input'  },
      { pin:  5, name: 'Q0A',              type: 'output' },
      { pin:  6, name: 'D1A',              type: 'input'  },
      { pin:  7, name: 'Q1A',              type: 'output' },
      { pin:  8, name: 'D2A',              type: 'input'  },
      { pin:  9, name: 'Q2A',              type: 'output' },
      { pin: 10, name: 'D3A',              type: 'input'  },
      { pin: 11, name: 'Q3A',              type: 'output' },
      { pin: 12, name: 'VSS',              type: 'power'  },
      { pin: 13, name: 'RESET B',          type: 'input'  },
      { pin: 14, name: 'STROBE B',         type: 'input'  },
      { pin: 15, name: 'OUTPUT DISABLE B', type: 'input'  },
      { pin: 16, name: 'D0B',              type: 'input'  },
      { pin: 17, name: 'Q0B',              type: 'output' },
      { pin: 18, name: 'D1B',              type: 'input'  },
      { pin: 19, name: 'Q1B',              type: 'output' },
      { pin: 20, name: 'D2B',              type: 'input'  },
      { pin: 21, name: 'Q2B',              type: 'output' },
      { pin: 22, name: 'D3B',              type: 'input'  },
      { pin: 23, name: 'Q3B',              type: 'output' },
      { pin: 24, name: 'VDD',              type: 'power'  },
    ],
    gates: [
      {
        // Latch A
        type: 'LATCH_4BIT_TRI_RST',
        inputs: ['D0A', 'D1A', 'D2A', 'D3A', 'STROBE A', 'OUTPUT DISABLE A', 'RESET A'],
        outputs: ['Q0A', 'Q1A', 'Q2A', 'Q3A'],
      },
      {
        // Latch B
        type: 'LATCH_4BIT_TRI_RST',
        inputs: ['D0B', 'D1B', 'D2B', 'D3B', 'STROBE B', 'OUTPUT DISABLE B', 'RESET B'],
        outputs: ['Q0B', 'Q1B', 'Q2B', 'Q3B'],
      },
    ],
    guideSections: [
      {
        title: 'Two Independent Transparent Latches',
        paragraphs: [
          'Each half of the CD4508 is a 4-bit transparent latch. "Transparent" means there is no clock edge to wait for: while STROBE is HIGH the outputs are a live copy of the data inputs. The moment STROBE goes LOW, the current data is captured and held, and the outputs stop responding to the D inputs until STROBE goes HIGH again.',
          'RESET is a hard clear: a HIGH on RESET forces that latch\'s four outputs LOW no matter what STROBE or the data inputs are doing. The two latches are fully separate, so latch A and latch B can be strobed, reset, and disabled at different times.',
        ],
        list: [
          'OUTPUT DISABLE=1 → all four outputs float (high-impedance); overrides everything else.',
          'OUTPUT DISABLE=0, RESET=1 → outputs forced LOW (latch cleared).',
          'OUTPUT DISABLE=0, RESET=0, STROBE=1 → transparent: Q follows D.',
          'OUTPUT DISABLE=0, RESET=0, STROBE=0 → hold the last latched value.',
        ],
      },
      {
        title: '3-State Outputs for Bus Sharing',
        paragraphs: [
          'The Q outputs are 3-state. A HIGH on OUTPUT DISABLE disconnects all four outputs of that latch from the wire (high impedance), so multiple CD4508 latches can drive the same bus lines and you simply enable one at a time. OUTPUT DISABLE has priority over STROBE and RESET, so a disabled latch never fights the bus even while it is being loaded or cleared internally.',
        ],
        note: '74Sim models this as an idealized level-sensitive (transparent) latch with no propagation delay (see issues.md A1): the reproduced truth table is exact for static inputs, but real setup/hold timing around the STROBE edge is not enforced. The coverage-plan hints did not fit — LATCH_TRANS_4BIT is the 74226 bus transceiver and D_LATCH is a single-bit latch with no 3-state/reset — so a dedicated LATCH_4BIT_TRI_RST primitive backs this entry.',
      },
    ],
  },

};
