// chips113.js — Block 113: CMOS 4000 series logic ICs (coverage expansion, Batch 4)
// CMOS 4-bit D-type register with 3-state outputs. Pinout + truth table verified by
// reading the TI datasheet "CD4076B Types — CMOS 4-Bit D-Type Registers", SCHS058C
// (data acquired from Harris Semiconductor; Revised October 2003) directly as PDF
// page images (Read with pages:), NOT via the WebFetch text summarizer which mangles
// these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 4) for the full roadmap.
// Chips: CD4076
export const CHIPS_BLOCK_113 = {

  // ── CD4076: 4-bit D-type register, 3-state outputs (16-pin) ─────────────────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD4076B Types — CMOS 4-Bit D-Type Registers (High-Voltage Types, 20-Volt
     Rating)", SCHS058C (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4076b.pdf
     Pinout taken from the "TERMINAL ASSIGNMENT" (TOP VIEW) on page 1 AND the
     Fig.8 CD4076B logic diagram — both cross-checked and in agreement:
       1=OUTPUT DISABLE M (OE1)   2=OUTPUT DISABLE N (OE2)
       3=Q1  4=Q2  5=Q3  6=Q4     7=CLOCK            8=VSS
       9=G1 (DATA INPUT DISABLE)  10=G2 (DATA INPUT DISABLE)
       11=DATA 4  12=DATA 3  13=DATA 2  14=DATA 1     15=RESET   16=VDD
     Behavior from the CD4076B TRUTH TABLE (page 2) — columns
       Reset | Clock | Data-Input-Disable G1 G2 | Data D | Next-State Q:
         1   |  X    |  X  X   |  X  |  0          (RESET=1 → Q=0, ASYNCHRONOUS:
                                                    Clock is "don't care")
         0   |  _/   |  1  X   |  X  |  Q (NC)     (data disabled if either G HIGH)
         0   |  _/   |  X  1   |  X  |  Q (NC)
         0   |  _/   |  0  0   |  0  |  0          (load on rising edge when both
         0   |  _/   |  0  0   |  1  |  1           G inputs are LOW)
         0   |  X(static)/HIGH | X X | X | Q (NC)  (hold otherwise)
       "When either Output Disable M or N is high, the outputs are disabled (high-
       impedance state); however sequential operation of the flip-flops is not
       affected." (So OE1=OE2=0 → outputs driven; either HIGH → all four Hi-Z.)
     ENGINE PRIMITIVE: maps onto the existing `REG_4BIT_TRI` (74173) primitive —
     same active-LOW dual data-enable (G1/G2 ↔ IE1/IE2), same active-LOW dual
     output-disable (M/N ↔ OE1/OE2), true-Q-only 3-state outputs. The ONE
     divergence is the clear: the CD4076 RESET is ASYNCHRONOUS (the 74173's is
     synchronous in 74Sim), so the entry sets `asyncReset:true` — an opt-in flag
     added to the shared primitive that leaves the 74173 entry unchanged. The
     coverage-plan alt hint `D_FF_QUAD_TRI_COMPL` (74388) does NOT fit: that part
     has complementary Q/Qn outputs and lacks the data-enable + reset of the
     CD4076. Not cloned from a sibling pinout (issues.md C2). */
  'CD4076': {
    name: 'CD4076',
    simpleName: '4 bit D Register',
    description: 'CMOS 4 bit D type register with 3-state outputs (16-pin)',
    guideOverview: 'The CD4076B is a 4-bit register of D-type flip-flops sharing a common clock. Two active-LOW DATA INPUT DISABLE inputs (G1, G2) gate data entry: when both are LOW, the four data inputs (DATA 1 4) are loaded into the flip-flops on the next rising clock edge; if either is HIGH the stored data is held without gating the clock. Two active-LOW OUTPUT DISABLE inputs (M, N) control the 3-state outputs (Q1 Q4): both must be LOW for the outputs to drive the bus, otherwise they present a high impedance. A separate active-HIGH RESET clears all four flip-flops to 0 asynchronously (independent of the clock). It is the CMOS counterpart of the 74x173 and is handy for driving shared data buses.',
    guidePinDescriptions: {
      'OE1': 'Output Disable M, active LOW. Both M and N must be LOW for the Q outputs to drive; if either is HIGH the four outputs go to high impedance (sequential operation is unaffected).',
      'OE2': 'Output Disable N, active LOW. See OE1 (M).',
      'Q1':  'Registered output for bit 1. 3-state: driven only when M and N are both LOW.',
      'Q2':  'Registered output for bit 2.',
      'Q3':  'Registered output for bit 3.',
      'Q4':  'Registered output for bit 4.',
      'CLK': 'Clock input. Data is loaded on the rising edge when G1 and G2 are both LOW.',
      'GND': 'Negative supply / ground reference, VSS (pin 8).',
      'G1':  'Data Input Disable 1, active LOW. Both G1 and G2 must be LOW for new data to be captured on the clock edge.',
      'G2':  'Data Input Disable 2, active LOW. See G1.',
      'D4':  'Data input for bit 4. Captured on the rising clock edge when G1=G2=LOW.',
      'D3':  'Data input for bit 3.',
      'D2':  'Data input for bit 2.',
      'D1':  'Data input for bit 1.',
      'RESET': 'Asynchronous RESET, active HIGH. A HIGH immediately clears all four Q outputs to 0 regardless of the clock.',
      'VCC': 'Positive supply, VDD (+3 to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: '3-State Output Register',
        paragraphs: [
          'Both OUTPUT DISABLE inputs (M and N) must be LOW to enable the Q outputs. Drive either HIGH to float the outputs off a shared bus; this does not disturb the stored data.',
          'Both DATA INPUT DISABLE inputs (G1 and G2) must be LOW on a rising clock edge for new data to be captured; if either is HIGH the register holds its value. RESET is active HIGH and asynchronous — pull it LOW for normal operation.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4076b.pdf',
    tags: ['register', 'd', '4 bit', 'tri state', 'cmos', '4000 series', 'sequential'],
    pinout: [
      { pin: 1,  name: 'OE1',   type: 'input'  },
      { pin: 2,  name: 'OE2',   type: 'input'  },
      { pin: 3,  name: 'Q1',    type: 'output' },
      { pin: 4,  name: 'Q2',    type: 'output' },
      { pin: 5,  name: 'Q3',    type: 'output' },
      { pin: 6,  name: 'Q4',    type: 'output' },
      { pin: 7,  name: 'CLK',   type: 'input'  },
      { pin: 8,  name: 'GND',   type: 'power'  },
      { pin: 9,  name: 'G1',    type: 'input'  },
      { pin: 10, name: 'G2',    type: 'input'  },
      { pin: 11, name: 'D4',    type: 'input'  },
      { pin: 12, name: 'D3',    type: 'input'  },
      { pin: 13, name: 'D2',    type: 'input'  },
      { pin: 14, name: 'D1',    type: 'input'  },
      { pin: 15, name: 'RESET', type: 'input'  },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      {
        type: 'REG_4BIT_TRI',
        // inputs: [1D,2D,3D,4D, CLK, CLR, IE1,IE2, OE1,OE2]
        inputs: ['D1', 'D2', 'D3', 'D4', 'CLK', 'RESET', 'G1', 'G2', 'OE1', 'OE2'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4'],
        asyncReset: true,   // CD4076 RESET is asynchronous (vs the 74173 sync clear)
      },
    ],
    sequential: true,
  },

};
