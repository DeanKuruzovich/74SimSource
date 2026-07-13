// chips145.js — Block 145: CMOS 4000 series logic ICs (coverage expansion)
// CD4038B — TRIPLE SERIAL ADDER. Three independent 1-bit-at-a-time full adders
// that share one CLOCK and one CARRY-RESET. Pinout + behavior verified by
// reading the SGS-Thomson (ST) datasheet "HCC/HCF4032B HCC/HCF4038B Triple
// Serial Adders" (June 1989) directly as rendered PDF page images (Read with
// pages:), NOT via the WebFetch text summarizer which mangles these scans (see
// issues.md C4). The TI cdXXXXb.pdf symlinks for this obsolete part return an
// HTML landing page rather than the PDF, so the ST/SGS-Thomson second-source
// datasheet (the industry-standard pin-compatible HCC/HCF4038B) was used; the
// part numbers, pinout and function are identical (CD4038B == HCF4038B).
//
// ⚠ PINOUT (issues.md C2 lesson — verified from the PIN CONNECTIONS drawing and
// cross-checked against the FUNCTIONAL DIAGRAM pin numbers, NOT cloned from the
// 74385 quad serial adder or the CD4032 sibling): DIP-16 terminal assignment is
//   1 SUM3, 2 INVERT3, 3 CLOCK, 4 SUM2, 5 INVERT2, 6 CARRY RESET, 7 INVERT1,
//   8 VSS, 9 SUM1, 10 A1, 11 B1, 12 B2, 13 A2, 14 B3, 15 A3, 16 VDD.
//
// ⚠ PRIMITIVE: the coverage-plan hint `SERIAL_ADDER_QUAD` is the 74385 model. It
// does NOT fit: (1) it is QUAD, the 4038 is TRIPLE; (2) it models subtract by
// inverting the B *input*, whereas the 4038's INVERT command complements the SUM
// *output* (which does not corrupt the carry chain); (3) it has no CARRY-RESET;
// (4) it latches on the rising edge, but the 4038B latches the carry on the
// FALLING clock edge. A dedicated primitive `SERIAL_ADDER_TRIPLE_4038` was added
// to js/specificChipsSim.js (the rising-edge `SERIAL_ADDER_TRIPLE_4032` is the
// CD4032 sibling). See issues.md for the divergence note.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// Chips: CD4038
export const CHIPS_BLOCK_145 = {

  // ── CD4038: triple serial adder, negative-edge clock (16-pin) ───────────────
  /* Primary source: SGS-Thomson Microelectronics, "HCC/HCF4032B HCC/HCF4038B
     Triple Serial Adders" (June 1989), drawing s-2677.
     [Online]. Available: https://www.sm0vpo.com/_pdf/CD/CD_4032.pdf
     Verified as rendered PDF page images (issues.md C4):
       PIN CONNECTIONS (page 1, TOP VIEW): 1 SUM3, 2 INVERT3, 3 CLOCK, 4 SUM2,
         5 INVERT2, 6 CARRY RESET, 7 INVERT1, 8 VSS, 9 SUM1, 10 A1, 11 B1,
         12 B2, 13 A2, 14 B3, 15 A3, 16 VDD.
       FUNCTIONAL DIAGRAM (page 2) confirms the per-adder pin numbers:
         Adder1 A1=10 B1=11 INVERT1=7 SUM1=9; Adder2 A2=13 B2=12 INVERT2=5
         SUM2=4; Adder3 A3=15 B3=14 INVERT3=2 SUM3=1; CLOCK=3, CARRY RESET=6,
         VSS=8, VDD=16.
     Function (DESCRIPTION page 1 + 4038B LOGIC/TIMING DIAGRAM page 4): three
     serial full adders sharing a common CLOCK and CARRY-RESET. Each adder takes
     two serial DATA INPUTS (A, B) entered LSB first and an INVERT command. The
     SUM output is the mod-2 sum of the two input bits plus the carry from the
     previous bit position (S = A XOR B XOR carry_in). When INVERT = 1 the sum is
     complemented (S = NOT(A XOR B XOR carry_in)) — used to form a complemented /
     two's-complement subtract result. The carry is latched on the NEGATIVE-going
     clock transition (this is the 4038B; the 4032B uses the positive edge). The
     CARRY is reset to 0 at the end of each word by applying a logical 1 to
     CARRY-RESET one bit position before the first bit of the next word. */
  'CD4038': {
    name: 'CD4038',
    simpleName: 'Triple Serial Adder (negative-edge clock)',
    description: 'three bit-serial full adders, shared clock, carry-reset (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.sm0vpo.com/_pdf/CD/CD_4032.pdf',
    tags: ['adder', 'serial', 'arithmetic', 'cmos', '4000'],
    sequential: true,
    guideOverview: 'The CD4038B holds three separate serial adders that share one CLOCK and one CARRY RESET line. A serial adder adds two numbers one bit at a time, least significant bit first. Each clock it takes the current bit of A, the current bit of B, and the carry it saved from the previous bit, and produces one SUM bit (SUM = A XOR B XOR carry). The carry that bit generates is stored in an internal flip-flop and used on the next bit. Feed both numbers in LSB-first over several clocks and the SUM line gives you their sum, one bit per clock. The INVERT input complements that adder\'s SUM output, which lets you build a subtractor using two\'s-complement arithmetic. Before starting a new pair of numbers, pulse CARRY RESET HIGH for one bit time to clear the stored carry. On the CD4038 the carry is captured on the falling (HIGH-to-LOW) clock edge; the otherwise-identical CD4032 captures it on the rising edge.',
    guidePinDescriptions: {
      'SUM1': 'Serial sum output of adder 1 (pin 9). One sum bit per clock, LSB first.',
      'A1':   'Serial data input A of adder 1 (pin 10). Feed bits LSB first.',
      'B1':   'Serial data input B of adder 1 (pin 11). Feed bits LSB first.',
      'INVERT1': 'Invert command for adder 1 (pin 7). LOW → SUM1 is the true sum; HIGH → SUM1 is complemented (for two\'s-complement subtraction).',
      'SUM2': 'Serial sum output of adder 2 (pin 4).',
      'A2':   'Serial data input A of adder 2 (pin 13).',
      'B2':   'Serial data input B of adder 2 (pin 12).',
      'INVERT2': 'Invert command for adder 2 (pin 5). HIGH complements SUM2.',
      'SUM3': 'Serial sum output of adder 3 (pin 1).',
      'A3':   'Serial data input A of adder 3 (pin 15).',
      'B3':   'Serial data input B of adder 3 (pin 14).',
      'INVERT3': 'Invert command for adder 3 (pin 2). HIGH complements SUM3.',
      'CLOCK': 'Common clock for all three adders (pin 3). The carry is captured on the falling (HIGH-to-LOW) edge.',
      'CARRYRST': 'Common carry reset (pin 6). A HIGH for one bit position clears every adder\'s stored carry, so the next word starts from carry = 0.',
      'VDD': 'Positive supply (pin 16).',
      'VSS': 'Ground / negative supply (pin 8).',
    },
    guideSections: [
      {
        title: 'How serial addition works',
        paragraphs: [
          'A normal (parallel) adder has a separate wire for every bit of each number. A serial adder uses just one wire per number and adds one bit per clock instead, starting from the least significant bit. It is slower — an 8-bit add takes 8 clocks — but it needs far fewer pins and gates, which is why bit-serial arithmetic was common in early CMOS systems.',
          'Each clock the adder computes SUM = A XOR B XOR carry for the current bit, where carry is what it saved from the previous bit. It also works out the new carry (HIGH when at least two of A, B, and the old carry are HIGH) and stores it for the next bit. Shift both numbers in LSB-first and read SUM out one bit per clock to get the full result.',
        ],
      },
      {
        title: 'Carry reset and the INVERT command',
        paragraphs: [
          'The stored carry has to start at 0 for each new pair of numbers, otherwise leftover carry from the previous sum corrupts the first bit. Pulse CARRY RESET HIGH for one bit position just before the first bit of the new word to clear it.',
          'INVERT complements that adder\'s SUM output. Combined with two\'s-complement encoding (invert a number and add 1) this turns the adder into a subtractor without extra chips. The three adders each have their own INVERT line, so they can run in different modes at the same time.',
        ],
      },
      {
        title: 'What this simulation does and does not capture',
        paragraphs: [
          'The three adders, the per-bit SUM, the stored carry, the falling-edge clocking, CARRY RESET, and the INVERT complement are all modeled. The settled SUM and carry after each clock edge are exact.',
          'Like every part in 74Sim there is no propagation delay, so the brief gate-by-gate settling real silicon shows after a clock edge is not reproduced. Drive the clock and data from external sources one bit per clock, LSB first.',
        ],
      },
    ],
    pinout: [
      { pin:1,  name:'SUM3',     type:'output' },
      { pin:2,  name:'INVERT3',  type:'input'  },
      { pin:3,  name:'CLOCK',    type:'input'  },
      { pin:4,  name:'SUM2',     type:'output' },
      { pin:5,  name:'INVERT2',  type:'input'  },
      { pin:6,  name:'CARRYRST', type:'input'  },
      { pin:7,  name:'INVERT1',  type:'input'  },
      { pin:8,  name:'VSS',      type:'power'  },
      { pin:9,  name:'SUM1',     type:'output' },
      { pin:10, name:'A1',       type:'input'  },
      { pin:11, name:'B1',       type:'input'  },
      { pin:12, name:'B2',       type:'input'  },
      { pin:13, name:'A2',       type:'input'  },
      { pin:14, name:'B3',       type:'input'  },
      { pin:15, name:'A3',       type:'input'  },
      { pin:16, name:'VDD',      type:'power'  },
    ],
    gates: [{
      type: 'SERIAL_ADDER_TRIPLE_4038',
      inputs:  ['A1','B1','INVERT1','A2','B2','INVERT2','A3','B3','INVERT3','CARRYRST','CLOCK'],
      outputs: ['SUM1','SUM2','SUM3'],
    }],
  },

};
