// chips86.js — CMOS 4000-series coverage expansion (Batch 6)
// CD4022: octal (divide-by-8) Johnson counter with 8 decoded outputs.
// Shipped in its own standalone block (CHIPS_BLOCK_86) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_86 = {
  // ── CD4022: Octal (divide-by-8) Johnson counter, decoded (16-pin) ────────
  /* Primary source: Texas Instruments / Harris, CD4017B, CD4022B Types
     datasheet SCHS027C (rev. Feb 2004). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4022b.pdf
     Pinout verified against the CD4022B Terminal Diagram (TOP VIEW) and the
     Fig. 3 logic diagram, read directly from the rendered PDF pages — never
     cloned from the CD4017 sibling (the pin maps differ; see issues.md C2). */
  'CD4022': {
    name: 'CD4022',
    simpleName: 'Octal Counter / Divider',
    description: 'Johnson octal (divide-by-8) counter, 8 decoded outputs, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4022b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'octal counter', 'johnson counter', 'ring counter', 'decoded', 'sequencer', 'divide by 8'],
    guideOverview: 'The CD4022 is a 4-stage Johnson counter that divides by 8 and provides 8 fully decoded outputs (Q0-Q7). Exactly one output is HIGH at a time, advancing on each rising clock edge with CLOCK INHIBIT held LOW. After Q7 the counter rolls back to Q0. It is the octal sibling of the CD4017 decade counter — same control pins and CARRY OUT cascade scheme, just 8 states instead of 10. Classic uses are 8-step LED chasers / sequencers, divide-by-8 frequency division, and octal event timing. A 555 timer in astable mode is a natural clock source.',
    guidePinDescriptions: {
      'Q0': 'Decoded output 0. HIGH at reset and when the counter value equals 0.',
      'Q1': 'Decoded output 1. HIGH only when the counter value equals 1.',
      'Q2': 'Decoded output 2.',
      'Q3': 'Decoded output 3.',
      'Q4': 'Decoded output 4.',
      'Q5': 'Decoded output 5.',
      'Q6': 'Decoded output 6.',
      'Q7': 'Decoded output 7.',
      'CO': 'Carry output. HIGH for counts 0-3, LOW for counts 4-7. Completes one cycle every 8 clocks; feed it to the CLK of a second CD4022 to count to 64.',
      'CI': 'Clock Inhibit (active HIGH). LOW=counting enabled; HIGH=clock ignored and counter frozen.',
      'CLK': 'Clock input. Counter advances by one on the rising edge (Schmitt-triggered on the real part).',
      'MR': 'Reset (Master Reset). Active HIGH: immediately resets count to 0 (Q0 HIGH), asynchronously.',
      'NC': 'No connection.',
      'GND': 'Ground (VSS, 0 V). Connect to negative supply rail.',
      'VDD': 'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q1',  type: 'output' },
      { pin:  2, name: 'Q0',  type: 'output' },
      { pin:  3, name: 'Q2',  type: 'output' },
      { pin:  4, name: 'Q5',  type: 'output' },
      { pin:  5, name: 'Q6',  type: 'output' },
      { pin:  6, name: 'NC',  type: 'nc'     },
      { pin:  7, name: 'Q3',  type: 'output' },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'NC',  type: 'nc'     },
      { pin: 10, name: 'Q7',  type: 'output' },
      { pin: 11, name: 'Q4',  type: 'output' },
      { pin: 12, name: 'CO',  type: 'output' },
      { pin: 13, name: 'CI',  type: 'input'  },
      { pin: 14, name: 'CLK', type: 'input'  },
      { pin: 15, name: 'MR',  type: 'input'  },
      { pin: 16, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_OCTAL_DECODED', inputs: ['CLK','MR','CI'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','CO'] },
    ],
    guideSections: [
      {
        title: 'Decoded Octal Counting',
        paragraphs: [
          'The counter steps from Q0 through Q7 sequentially only one output is HIGH at any moment. After Q7, the next clock pulse returns it to Q0 (divide-by-8).',
          'CI (Clock Inhibit) must be LOW for the rising clock edge to advance the count. Tie CI to GND for free-running operation.',
          'MR (Reset) overrides everything taking MR HIGH immediately forces Q0 HIGH and all others LOW, regardless of the clock state.',
          'CO (Carry Out) is HIGH during counts 0-3 and LOW during counts 4-7, completing one full cycle every 8 clock pulses. Connecting CO to the CLK of a second CD4022 lets you count to 64.',
        ],
        list: [
          '8-step LED chaser / running light: connect Q0-Q7 to 8 LEDs through resistors and feed a 555 astable clock into CLK.',
          'Divide by N (2-8): connect QN back to MR to reset when the counter reaches N, dividing the clock by N.',
          'Octal sequencer: use the decoded outputs to fire 8 sequential events (timing, address stepping, state machines).',
          'Cascade: chain CO → CLK of additional CD4022 stages to divide by 8, 64, 512, ...',
        ],
        formulas: [
          'CO = HIGH for counts 0-3, LOW for counts 4-7',
          'Frequency at CO = CLK frequency / 8',
        ],
      },
    ],
  },
};
