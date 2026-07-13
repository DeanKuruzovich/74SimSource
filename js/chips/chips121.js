// Chip definitions block 121
// Chips: CD4059 (programmable divide-by-N counter)
//
// Standalone block authored for the CMOS 4000-series coverage effort. Kept on
// its own (instead of batching ~10-15 chips per file) to avoid collisions with
// other agents editing shared chip files in the same working tree.

export const CHIPS_BLOCK_121 = {

  // ── CD4059: CMOS programmable divide-by-"N" counter (24-pin) ───────────────
  /* Primary source: Texas Instruments / Harris, "CD4059A Types — CMOS
     Programmable Divide-by-'N' Counter", datasheet SCHS109B (rev. June 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4059a.pdf
     Verified: Terminal Diagram (TOP VIEW, page 1), Table I (Mode Select), the
     "HOW TO PRESET THE CD4059A" equations (1)/(2) with worked examples A/B/C,
     Fig.1 (total count of 3) and Fig.5 (functional block diagram), all read as
     300-dpi PDF page images (issues.md C4) — NOT cloned from a sibling
     (issues.md C2).

     Pinout (24-pin DIP): CLOCK=1, LATCH ENABLE=2, J1=3, J2=4, J3=5, J4=6,
     J16=7, J15=8, J14=9, J13=10, Kc=11, VSS=12, Kb=13, Ka=14, J12=15, J11=16,
     J10=17, J9=18, J8=19, J7=20, J6=21, J5=22, OUT=23, VDD=24.

     Divisor: N = M*(1000*D5 + 100*D4 + 10*D3 + D2) + D1, where M (the first
     counting section's modulus) and the jam-input groups that carry decades
     D1/D5 are chosen by Ka/Kb/Kc per Table I. See FREQ_DIV_PROG_4059 in
     js/specificChipsSim.js for the full mode/jam decode. */
  'CD4059': {
    name: 'CD4059',
    simpleName: 'Prog. ÷N Counter',
    description: 'CMOS programmable divide-by-N down-counter, N = 3 to 15999 (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4059a.pdf',
    tags: ['counter', 'divider', 'frequency divider', 'programmable', 'sequential', 'CMOS', '4000 series'],
    sequential: true,
    guideOverview: 'The CD4059 divides an input frequency by any whole number N from 3 up to 15999. It is a down-counter: it loads a preset value, counts the clock down to zero, then puts out one pulse (one clock period wide) and reloads. So the output frequency is the clock divided by N. You set N two ways together: three Mode-Select pins (Ka, Kb, Kc) pick how the first counting stage divides (by 2, 4, 5, 8, or 10), and 16 jam inputs (J1-J16) hold the rest of the number as four decimal digits. The number is read as N = M*(1000*D5 + 100*D4 + 10*D3 + D2) + D1, where M is the first-stage divider and D1-D5 are the digits taken from the jam inputs. A Latch Enable pin can stretch the output pulse so it stays high until you release it. The part was built for radio frequency synthesizers (the N in a phase-locked loop), but it works anywhere you need a programmable clock divider.',
    guidePinDescriptions: {
      'CLK': 'Clock input. The frequency to be divided; the counter advances on each rising edge.',
      'LE': 'Latch Enable. High makes the output stay high once a pulse occurs, until LE returns low. Low gives a normal one-clock-wide output pulse.',
      'J1': 'Jam (program) input, bit 1. Part of the units digit / first counting section.',
      'J2': 'Jam input, bit 2.',
      'J3': 'Jam input, bit 3.',
      'J4': 'Jam input, bit 4.',
      'J5': 'Jam input, bit 5. Low digit of the three ÷10 decades (D2).',
      'J6': 'Jam input, bit 6.',
      'J7': 'Jam input, bit 7.',
      'J8': 'Jam input, bit 8.',
      'J9': 'Jam input, bit 9. Middle ÷10 decade (D3).',
      'J10': 'Jam input, bit 10.',
      'J11': 'Jam input, bit 11.',
      'J12': 'Jam input, bit 12.',
      'J13': 'Jam input, bit 13. High ÷10 decade (D4).',
      'J14': 'Jam input, bit 14.',
      'J15': 'Jam input, bit 15.',
      'J16': 'Jam input, bit 16.',
      'Ka': 'Mode-Select input. With Kb and Kc, picks the first stage divider (2/4/5/8/10).',
      'Kb': 'Mode-Select input. Kb low with Kc low puts the counter in Master Preset (held loaded, not counting).',
      'Kc': 'Mode-Select input. Part of the divider/Master-Preset selection.',
      'OUT': 'Divided output. One clock-wide pulse every N input clocks (or held high while LE is high).',
      'VSS': 'Ground / negative supply.',
      'VDD': 'Positive supply.',
    },
    guideSections: [
      {
        title: 'What It Does',
        paragraphs: [
          'Feed a clock into CLK and the OUT pin pulses once for every N clock pulses you choose. That makes OUT a clock at 1/N of the input frequency. N can be any whole number from 3 to 15999.',
          'Inside, it is a down-counter: it loads the preset number, counts down on each clock, and when it hits the end it emits one pulse and reloads. There is no propagation delay in this simulator, so the settled output is exact but the brief internal ripple of the real chip is not shown.',
        ],
      },
      {
        title: 'Setting The Divisor N',
        paragraphs: [
          'N is built from two parts. The Mode-Select pins Ka, Kb, Kc set how the first counting stage divides — by 2, 4, 5, 8, or 10. Call that number M. The 16 jam inputs hold the rest of the number as decimal digits.',
          'The full formula is N = M*(1000*D5 + 100*D4 + 10*D3 + D2) + D1. To program a target N, divide it by M: the quotient is the value to load into the upper four decades (D5 down to D2 as a 4-digit number) and the remainder is D1.',
        ],
        list: [
          'Ka=1 Kb=1 Kc=1: first stage divides by 2.',
          'Ka=0 Kb=1 Kc=1: first stage divides by 4.',
          'Ka=1 Kb=0 Kc=1: first stage divides by 5.',
          'Ka=0 Kb=0 Kc=1: first stage divides by 8.',
          'Ka=1 Kb=1 Kc=0: first stage divides by 10.',
          'Kb=0 Kc=0 (Ka either): Master Preset — the counter holds its loaded value and does not count.',
        ],
      },
      {
        title: 'The Latch Enable Pin',
        paragraphs: [
          'With Latch Enable low, OUT is a short pulse: high for one clock period each time the count completes, then low again.',
          'With Latch Enable high, the first output pulse latches OUT high and keeps it there until you bring Latch Enable back low. That is handy when a slow circuit downstream needs to catch the output without watching for a narrow pulse.',
        ],
      },
      {
        title: 'Where It Is Used',
        list: [
          'The programmable divider in a phase-locked-loop frequency synthesizer (VHF/UHF/FM/AM radio tuning).',
          'A general programmable clock divider for timing and "time-out" timers.',
          'Totalizers and production counters that need an odd or large division ratio.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK', type: 'input'  },
      { pin:  2, name: 'LE',  type: 'input'  },
      { pin:  3, name: 'J1',  type: 'input'  },
      { pin:  4, name: 'J2',  type: 'input'  },
      { pin:  5, name: 'J3',  type: 'input'  },
      { pin:  6, name: 'J4',  type: 'input'  },
      { pin:  7, name: 'J16', type: 'input'  },
      { pin:  8, name: 'J15', type: 'input'  },
      { pin:  9, name: 'J14', type: 'input'  },
      { pin: 10, name: 'J13', type: 'input'  },
      { pin: 11, name: 'Kc',  type: 'input'  },
      { pin: 12, name: 'VSS', type: 'power'  },
      { pin: 13, name: 'Kb',  type: 'input'  },
      { pin: 14, name: 'Ka',  type: 'input'  },
      { pin: 15, name: 'J12', type: 'input'  },
      { pin: 16, name: 'J11', type: 'input'  },
      { pin: 17, name: 'J10', type: 'input'  },
      { pin: 18, name: 'J9',  type: 'input'  },
      { pin: 19, name: 'J8',  type: 'input'  },
      { pin: 20, name: 'J7',  type: 'input'  },
      { pin: 21, name: 'J6',  type: 'input'  },
      { pin: 22, name: 'J5',  type: 'input'  },
      { pin: 23, name: 'OUT', type: 'output' },
      { pin: 24, name: 'VDD', type: 'power'  },
    ],
    gates: [
      {
        // Divide-by-N: N = M*(1000*D5 + 100*D4 + 10*D3 + D2) + D1, M and the
        // D1/D5 jam-group split chosen by Ka/Kb/Kc (Table I). See
        // FREQ_DIV_PROG_4059 in js/specificChipsSim.js.
        type: 'FREQ_DIV_PROG_4059',
        inputs: ['CLK', 'LE', 'Ka', 'Kb', 'Kc',
                 'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8',
                 'J9', 'J10', 'J11', 'J12', 'J13', 'J14', 'J15', 'J16'],
        outputs: ['OUT'],
      },
    ],
  },

};
