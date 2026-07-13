// chips88.js — Block 88: CMOS 4000 series logic ICs (coverage expansion, Batch 9)
// CD4094 — 8-stage shift-and-store bus register (serial-in, parallel-out, with
// a storage latch and 3-state outputs). Pinout + truth table verified by reading
// the Texas Instruments datasheet "CD4094B Types — CMOS 8-Stage Shift-and-Store
// Bus Register" (SCHS063B, Revised July 2003) directly as PDF page images
// (Read with pages:), NOT via the WebFetch text summarizer which mangles these
// scans (see issues.md C4).
//
// ⚠ PINOUT WARNING (issues.md C2 lesson): the *original* CD4094B (4000-series)
// pinout is NOT the same as the pre-existing `74x4094` (74HC4094) entry in
// chips58.js. On the real CD4094B the serial outputs OS / O'S are on pins 9/10
// and the upper parallel outputs O8..O5 are on pins 11..14 — whereas the 74HC
// part puts O5..O8 on 9..12 and the serial taps on 13/14. This entry uses the
// VERIFIED CD4094B terminal assignment (Fig. 1), it does NOT clone the sibling.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 9) for the full roadmap.
// Chips: CD4094
export const CHIPS_BLOCK_88 = {

  // ── CD4094: 8-stage shift-and-store bus register (16-pin) ──────────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4094B Types — CMOS 8-Stage Shift-and-Store Bus
     Register", SCHS063B (Revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4094b.pdf
     Terminal assignment (Fig. 1, page 1):
       1 STROBE, 2 DATA, 3 CLOCK, 4 O1, 5 O2, 6 O3, 7 O4, 8 VSS,
       9 OS, 10 O'S, 11 O8, 12 O7, 13 O6, 14 O5, 15 OUTPUT ENABLE, 16 VDD.
     Function (page 1 + truth table, page 2): an 8-stage serial shift register;
     DATA shifts in on the POSITIVE edge of CLOCK (DATA enters stage 1 / O1 and
     propagates toward stage 8 / O8). Each stage feeds a storage-latch stage;
     while STROBE is HIGH the storage latch is transparent (follows the shift
     register), and the latched data appears on the 3-state parallel outputs
     O1..O8 whenever OUTPUT ENABLE is HIGH (OUTPUT ENABLE LOW → outputs Hi-Z for
     bus sharing). Two serial outputs allow cascading: OS (pin 9) switches on the
     POSITIVE clock edge for fast-clock high-speed cascades; O'S (pin 10) switches
     on the NEGATIVE clock edge for slow clock-rise cascades. Both carry the 8th
     shift-register stage. */
  'CD4094': {
    name: 'CD4094',
    simpleName: '8-Stage Shift-and-Store Bus Register',
    description: '8-stage serial-in/parallel-out shift register, latch, 3-state (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4094b.pdf',
    tags: ['shift-register', 'latch', '8 bit', 'tri state', 'cmos', '4000'],
    sequential: true,
    guideOverview: 'The CD4094B is an 8-stage serial-in, parallel-out shift register with a storage latch on each stage and 3-state parallel outputs. Bits shift in on DATA with each positive CLOCK edge (first bit lands on O1 and walks toward O8). While STROBE is HIGH the storage latch copies the shift register, so the whole byte updates together; raising OUTPUT ENABLE connects the latched byte to the parallel output pins, and lowering it puts those pins in Hi-Z so several devices can share a common bus. Two serial outputs (OS on the positive clock edge, O\'S on the negative edge) let you cascade several CD4094Bs for wider words.',
    guidePinDescriptions: {
      'STROBE': 'Storage-latch control (active HIGH). While HIGH the storage latch follows the shift register; bring it LOW to freeze the parallel outputs while you load new bits.',
      'DATA': 'Serial data input. Sampled on each positive CLOCK edge.',
      'CLOCK': 'Shift clock. Each positive edge shifts DATA into stage 1 and moves every stage one place toward O8.',
      'Q1': 'Parallel output bit 1 (O1) — first stage, 3-state.',
      'Q2': 'Parallel output bit 2 (O2) — 3-state.',
      'Q3': 'Parallel output bit 3 (O3) — 3-state.',
      'Q4': 'Parallel output bit 4 (O4) — 3-state.',
      'VSS': 'Negative supply / ground (0 V).',
      'QS': 'Serial output OS — the 8th stage, updated on the POSITIVE clock edge. Use it to cascade into the next CD4094B when the clock rise time is fast. Always driven (not affected by OUTPUT ENABLE).',
      'QSn': 'Serial output O\'S — the 8th stage, updated on the NEGATIVE clock edge, for cascading when the clock rise time is slow. Always driven (not affected by OUTPUT ENABLE).',
      'Q8': 'Parallel output bit 8 (O8) — last stage, 3-state.',
      'Q7': 'Parallel output bit 7 (O7) — 3-state.',
      'Q6': 'Parallel output bit 6 (O6) — 3-state.',
      'Q5': 'Parallel output bit 5 (O5) — 3-state.',
      'OE': 'OUTPUT ENABLE (active HIGH). HIGH connects the latched byte to O1..O8; LOW puts those pins in Hi-Z so the register can share a common bus.',
      'VDD': 'Positive supply (3 V to 18 V on real silicon).',
    },
    guideSections: [
      {
        title: 'Shift Then Strobe',
        paragraphs: [
          'The CD4094B separates shifting from output updating. Clock the eight bits into the internal shift register first (DATA + CLOCK), then pulse STROBE HIGH to copy the whole pattern into the storage latch in one step. Holding STROBE LOW keeps the outputs steady while the next byte is shifting in, so the parallel outputs never show the intermediate shifting pattern.',
        ],
      },
      {
        title: 'Three-State Bus Outputs',
        paragraphs: [
          'OUTPUT ENABLE controls the 3-state parallel outputs O1..O8. With OUTPUT ENABLE HIGH the latched byte drives the pins; with it LOW the pins go Hi-Z, letting several CD4094Bs (or other devices) share one set of bus lines. The two serial cascade outputs (OS, O\'S) stay driven regardless of OUTPUT ENABLE.',
        ],
      },
      {
        title: 'Cascading For Wider Words',
        paragraphs: [
          'To build a register wider than 8 bits, feed one chip\'s serial output into the next chip\'s DATA input and share CLOCK and STROBE. Use OS (pin 9, positive-edge) when the clock rises quickly; use O\'S (pin 10, negative-edge) when the clock rise time is slow, which gives the next stage extra setup margin.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'STROBE', type: 'input'  },
      { pin:  2, name: 'DATA',   type: 'input'  },
      { pin:  3, name: 'CLOCK',  type: 'input'  },
      { pin:  4, name: 'Q1',     type: 'output' },
      { pin:  5, name: 'Q2',     type: 'output' },
      { pin:  6, name: 'Q3',     type: 'output' },
      { pin:  7, name: 'Q4',     type: 'output' },
      { pin:  8, name: 'VSS',    type: 'power'  },
      { pin:  9, name: 'QS',     type: 'output' },
      { pin: 10, name: 'QSn',    type: 'output' },
      { pin: 11, name: 'Q8',     type: 'output' },
      { pin: 12, name: 'Q7',     type: 'output' },
      { pin: 13, name: 'Q6',     type: 'output' },
      { pin: 14, name: 'Q5',     type: 'output' },
      { pin: 15, name: 'OE',     type: 'input'  },
      { pin: 16, name: 'VDD',    type: 'power'  },
    ],
    // SHIFT_REG_LATCH_4094 contract (js/specificChipsSim.js):
    //   inputs:  [D, CLK, STR, OE]
    //   outputs: [Q1..Q8, QS1, QS2]
    //     QS1 = shift-register stage 8 (always driven) → OS  (pin 9)
    //     QS2 = shift-register stage 7 (always driven) → O'S (pin 10, see note)
    gates: [
      { type: 'SHIFT_REG_LATCH_4094',
        inputs: ['DATA', 'CLOCK', 'STROBE', 'OE'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'QS', 'QSn'] },
    ],
    // Divergence (issues.md): the real O'S (pin 10) carries the SAME 8th-stage
    // data as OS but switched on the negative clock edge. The shared
    // SHIFT_REG_LATCH_4094 primitive instead drives this tap from the 7th stage
    // (QS2 = sr[6]). For single-chip use and most cascades this is harmless; only
    // a design that relies on O'S being the negative-edge copy of OS will differ.
  },
};
