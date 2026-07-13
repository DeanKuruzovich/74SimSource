// chips85.js — Block 85: CMOS 4000 series logic ICs (coverage expansion, Batch 6)
// Presettable up/down counter. Pinout + behavior verified by reading the TI/Harris
// datasheet "CD4029B Types — CMOS Presettable Up/Down Counter", SCHS034C
// (Rev. October 2003) directly as PDF page images (Read with pages:), NOT via the
// WebFetch text summarizer which mangles these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 6) for the full roadmap.
// Chips: CD4029
export const CHIPS_BLOCK_85 = {

  // ── CD4029: presettable up/down binary or BCD-decade counter (16-pin) ─────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD4029B Types — CMOS Presettable Up/Down Counter (Binary or BCD-Decade)",
     SCHS034C (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4029b.pdf
     Pinout from the "CD4029B Terminal Diagram" + Functional Diagram (page 1) and
     the Logic Diagram (Fig. 9). Behavior from the datasheet text and the binary /
     decade timing diagrams (Fig. 10 / Fig. 12):
       - A HIGH PRESET ENABLE asynchronously jam-loads J1–J4 into Q1–Q4.
       - With PRESET ENABLE and CARRY IN both LOW, the counter advances one count
         on the POSITIVE clock edge; advance is inhibited when either is HIGH.
       - UP/DOWN HIGH = count up, LOW = count down.
       - BINARY/DECADE HIGH = binary (0–15), LOW = BCD decade (0–9).
       - CARRY OUT is normally HIGH and goes LOW at terminal count (max in UP mode,
         0 in DOWN mode) while CARRY IN is LOW — so it can act as a clock-enable for
         the next stage in either ripple- or parallel-clocked cascades. */
  'CD4029': {
    name: 'CD4029',
    simpleName: 'Presettable Up/Down Counter',
    description: 'Presettable 4-bit sync up/down counter, binary/BCD, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4029b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'up/down', 'presettable', 'binary', 'bcd', 'decade', 'synchronous', 'sequential'],
    guideOverview: 'The CD4029 is a presettable 4-bit up/down counter that counts in either binary (0–15) or BCD-decade (0–9), selected by the BINARY/DECADE pin. UP/DOWN chooses count direction (HIGH = up, LOW = down). A HIGH on PRESET ENABLE asynchronously jam-loads the four JAM inputs (J1–J4) into the counter regardless of the clock, so you can preset any starting state. With PRESET ENABLE LOW and CARRY IN (which doubles as a clock enable) LOW, the counter advances one count on each positive clock edge; advance is inhibited whenever CARRY IN or PRESET ENABLE is HIGH. CARRY OUT is normally HIGH and pulses LOW at terminal count (15 or 9 when counting up, 0 when counting down) while CARRY IN is LOW, letting you cascade stages in either parallel-clocked (synchronous) or ripple-clocked arrangements. Typical uses are programmable binary/decade frequency synthesizers, magnitude/difference counting, and A-to-D / D-to-A conversion.',
    guidePinDescriptions: {
      'PRESET ENABLE': 'Asynchronous parallel-load control, active HIGH. While HIGH, the JAM inputs J1–J4 are loaded into Q1–Q4 immediately, independent of the clock. Hold LOW for normal counting.',
      J1: 'Jam (preset) input for bit 1. Loaded into Q1 while PRESET ENABLE is HIGH.',
      J2: 'Jam (preset) input for bit 2. Loaded into Q2 while PRESET ENABLE is HIGH.',
      J3: 'Jam (preset) input for bit 3. Loaded into Q3 while PRESET ENABLE is HIGH.',
      J4: 'Jam (preset) input for bit 4. Loaded into Q4 while PRESET ENABLE is HIGH.',
      'CARRY IN': 'Carry-in / clock-enable, active LOW. LOW enables the counter to advance on the clock; HIGH inhibits counting. Used to chain stages by connecting it to the previous stage\'s CARRY OUT.',
      'CARRY OUT': 'Ripple carry-out, active LOW. Normally HIGH; goes LOW at terminal count (15 or 9 counting up, 0 counting down) while CARRY IN is LOW.',
      CLOCK: 'Clock input. The counter advances one count on the positive (rising) edge when enabled.',
      'UP/DOWN': 'Direction control. HIGH = count up, LOW = count down.',
      'BINARY/DECADE': 'Count-mode select. HIGH = binary count (0–15), LOW = BCD-decade count (0–9).',
      Q1: 'Counter bit 1 output (LSB).',
      Q2: 'Counter bit 2 output.',
      Q3: 'Counter bit 3 output.',
      Q4: 'Counter bit 4 output (MSB).',
      VSS: 'Negative supply / ground (0 V).',
      VDD: 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'PRESET ENABLE', type: 'input'  },
      { pin:  2, name: 'Q4',            type: 'output' },
      { pin:  3, name: 'J4',            type: 'input'  },
      { pin:  4, name: 'J1',            type: 'input'  },
      { pin:  5, name: 'CARRY IN',      type: 'input'  },
      { pin:  6, name: 'Q1',            type: 'output' },
      { pin:  7, name: 'CARRY OUT',     type: 'output' },
      { pin:  8, name: 'VSS',           type: 'power'  },
      { pin:  9, name: 'BINARY/DECADE', type: 'input'  },
      { pin: 10, name: 'UP/DOWN',       type: 'input'  },
      { pin: 11, name: 'Q2',            type: 'output' },
      { pin: 12, name: 'J2',            type: 'input'  },
      { pin: 13, name: 'J3',            type: 'input'  },
      { pin: 14, name: 'Q3',            type: 'output' },
      { pin: 15, name: 'CLOCK',         type: 'input'  },
      { pin: 16, name: 'VDD',           type: 'power'  },
    ],
    gates: [
      {
        type: 'COUNTER_UPDOWN_4029',
        inputs: ['J1', 'J2', 'J3', 'J4', 'CLOCK', 'CARRY IN', 'UP/DOWN', 'PRESET ENABLE', 'BINARY/DECADE'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'CARRY OUT'],
      },
    ],
    guideSections: [
      {
        title: 'Presetting And Counting',
        paragraphs: [
          'Drive PRESET ENABLE HIGH to jam-load a starting value: whatever is on J1–J4 is copied into Q1–Q4 immediately, without waiting for a clock edge. To preset zero, hold all JAM inputs LOW while PRESET ENABLE is HIGH.',
          'With PRESET ENABLE LOW and CARRY IN LOW, each positive clock edge advances the count by one. The UP/DOWN pin sets the direction and the BINARY/DECADE pin sets the modulus (16 in binary, 10 in decade).',
          'CARRY IN doubles as a clock enable: taking it HIGH freezes the count. This is the input you drive from the previous stage\'s CARRY OUT when cascading.',
        ],
        list: [
          'PRESET ENABLE HIGH → asynchronous jam load (Q = J), clock ignored.',
          'UP/DOWN HIGH → count up; LOW → count down.',
          'BINARY/DECADE HIGH → binary 0–15; LOW → BCD decade 0–9.',
          'CARRY IN LOW → counting enabled; HIGH → counting inhibited.',
        ],
        note: 'CARRY OUT is active LOW: it sits HIGH and drops LOW at terminal count (15 in up-binary, 9 in up-decade, 0 in down) only while CARRY IN is LOW. 74Sim models the counter as an idealized synchronous element with no propagation delay (see issues.md A1); the asynchronous PRESET ENABLE jam-load and the active-LOW direction/enable polarities are modeled per the datasheet — note these differ from the 74x191 (whose LOAD is synchronous and active LOW and whose direction polarity is inverted).',
      },
    ],
  },

};
