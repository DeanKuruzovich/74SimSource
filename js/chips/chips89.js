// chips89.js — Block 89: CMOS 4000 series logic ICs (coverage expansion, Batch 9)
// Shift registers. Pinout + behavior verified by reading the TI/Harris datasheet
// "CD4014B, CD4021B Types — CMOS 8-Stage Static Shift Registers" (SCHS024C,
// Revised October 2003) directly as PDF page images (Read with pages:), NOT via
// the WebFetch text summarizer which mangles these scans (see issues.md C4).
// The CD4021B Terminal Diagram + Fig. 2 logic diagram (datasheet pages 3-37 /
// 3-38) were read from the rendered datasheet pages.
//
// Two facts that matter and were NOT cloned from the sibling CD4014 (chips68.js):
//   1. The three brought-out stages are Q6 (pin 2), Q7 (pin 12) and Q8 (pin 3) —
//      Q8 is the last stage / main serial output. (The existing CD4014 entry
//      mislabels its outputs Q5/Q6/Q7; see issues.md.)
//   2. The CD4021 parallel load is ASYNCHRONOUS — a HIGH on PARALLEL/SERIAL
//      CONTROL jams the parallel data straight in, no clock edge required. The
//      CD4014's load is synchronous. A dedicated SHIFT_REG_8BIT_PISO_CD4021
//      engine primitive models this (the hinted SHIFT_REG_8BIT_PISO_CD is the
//      synchronous CD4014 variant and brings out the wrong stages).
//
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 9) for the full roadmap.
// Chips: CD4021
export const CHIPS_BLOCK_89 = {

  // ── CD4021: 8-stage PISO shift register, asynchronous parallel load (16-pin) ─
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4014B, CD4021B Types — CMOS 8-Stage Static Shift
     Registers", SCHS024C (Revised October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4021b.pdf
     Pinout from the CD4014B/CD4021B Terminal Diagram (TOP VIEW, page 3-37);
     behavior from the device description + Fig. 2 logic diagram + CD4021B
     truth table (page 3-38): "In the CD4021B serial entry is synchronous with
     the clock but parallel entry is asynchronous. In both types, entry is
     controlled by the PARALLEL/SERIAL CONTROL input. When the
     PARALLEL/SERIAL CONTROL input is low, data is serially shifted ... on the
     positive transition of the clock line. When ... high, data is jammed into
     the 8-stage register via the parallel input lines ... the CLOCK input of
     the internal stage is 'forced' when asynchronous parallel entry is made." */
  'CD4021': {
    name: 'CD4021',
    simpleName: '8 bit PISO Shift Register (async load)',
    description: '8-stage PISO shift register, async parallel load, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4021b.pdf',
    tags: ['cmos', '4000 series', 'shift register', 'PISO', 'serial', 'parallel', 'asynchronous load', 'sequential'],
    guideOverview: 'The CD4021 is an 8-stage static PISO (Parallel In, Serial Out) shift register. It loads parallel data ASYNCHRONOUSLY: while the PARALLEL/SERIAL CONTROL pin (P/S C) is HIGH, the eight parallel inputs P1–P8 are jammed straight into the register immediately, no clock edge needed. When P/S C is LOW, each rising CLOCK edge shifts the contents one stage toward the output, entering a new serial bit from SERIAL IN at stage 1. Only stages Q6, Q7 and Q8 are brought out as pins; Q8 is the last stage / main serial output. This asynchronous parallel load is the one difference from the otherwise-identical CD4014 (which loads synchronously). Used for parallel-to-serial conversion — for example reading 8 switches with just 3 microcontroller pins.',
    guidePinDescriptions: {
      P1:    'Parallel input for stage 1 (first stage). Jammed in while P/S CONTROL is HIGH.',
      P2:    'Parallel input for stage 2.',
      P3:    'Parallel input for stage 3.',
      P4:    'Parallel input for stage 4.',
      P5:    'Parallel input for stage 5.',
      P6:    'Parallel input for stage 6.',
      P7:    'Parallel input for stage 7.',
      P8:    'Parallel input for stage 8 (last stage). Appears at Q8 immediately after a parallel load.',
      Q6:    'Output of stage 6. Available during serial shifting.',
      Q7:    'Output of stage 7. Available during serial shifting.',
      Q8:    'Output of stage 8 (last stage, main serial output). P8 appears here first after a parallel load.',
      CLK:   'Clock input. When P/S CONTROL is LOW, the rising edge shifts data one stage toward Q8.',
      SER:   'Serial data input. Clocked into stage 1 on each rising CLK while P/S CONTROL is LOW.',
      'P/S C': 'PARALLEL/SERIAL CONTROL. HIGH = asynchronous parallel load of P1–P8 (no clock needed). LOW = serial shift mode, data entered from SER on rising CLK.',
      VSS:   'Negative supply / ground (0 V).',
      VDD:   'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'P8',    type: 'input',  description: 'Parallel input stage 8 (MSB, first to appear at Q8 after load)' },
      { pin:  2, name: 'Q6',    type: 'output', description: 'Stage 6 serial output' },
      { pin:  3, name: 'Q8',    type: 'output', description: 'Stage 8 serial output (last stage, main serial out)' },
      { pin:  4, name: 'P4',    type: 'input',  description: 'Parallel input stage 4' },
      { pin:  5, name: 'P3',    type: 'input',  description: 'Parallel input stage 3' },
      { pin:  6, name: 'P2',    type: 'input',  description: 'Parallel input stage 2' },
      { pin:  7, name: 'P1',    type: 'input',  description: 'Parallel input stage 1' },
      { pin:  8, name: 'VSS',   type: 'power',  description: 'Ground (0 V)' },
      { pin:  9, name: 'P/S C', type: 'input',  description: 'PARALLEL/SERIAL CONTROL. HIGH: async parallel load; LOW: serial shift' },
      { pin: 10, name: 'CLK',   type: 'input',  description: 'Clock — rising edge shifts in serial mode (P/S CONTROL LOW)' },
      { pin: 11, name: 'SER',   type: 'input',  description: 'Serial data input (used when P/S CONTROL is LOW)' },
      { pin: 12, name: 'Q7',    type: 'output', description: 'Stage 7 serial output' },
      { pin: 13, name: 'P5',    type: 'input',  description: 'Parallel input stage 5' },
      { pin: 14, name: 'P6',    type: 'input',  description: 'Parallel input stage 6' },
      { pin: 15, name: 'P7',    type: 'input',  description: 'Parallel input stage 7' },
      { pin: 16, name: 'VDD',   type: 'power',  description: 'Positive supply (3–18 V)' },
    ],
    gates: [
      { type: 'SHIFT_REG_8BIT_PISO_CD4021',
        inputs: ['CLK', 'P/S C', 'SER', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'],
        outputs: ['Q6', 'Q7', 'Q8'] },
    ],
    guideSections: [
      {
        title: 'Asynchronous Parallel Load and Serial Shift Operation',
        paragraphs: [
          'Drive the desired data on P1–P8 and take P/S CONTROL HIGH. The eight bits are jammed into the register immediately — asynchronously — with no clock pulse required. P8 appears at Q8, P7 at Q7, P6 at Q6 right away. This is the key difference from the CD4014, whose parallel load needs a clock edge.',
          'To shift the word out, take P/S CONTROL LOW. Each rising CLOCK edge then moves the contents one stage toward Q8, entering a new serial bit from SERIAL IN at stage 1. P8 exits Q8 first, then P7, P6 … P1 last.',
          'Only Q6, Q7 and Q8 are pinned out; internal stages 1–5 are only observed as they ripple out to Q6.',
        ],
        list: [
          'Parallel-to-serial converter: latch switches or bus data asynchronously, then clock it out serially.',
          'Microcontroller interface: read 8 inputs using just 3 I/O pins (CLK, P/S CONTROL, and Q8).',
          'Chain two CD4021s by wiring Q8 of the first to SERIAL IN of the second with a shared CLK and P/S CONTROL for a 16-bit PISO register.',
          'Shifting order after a parallel load: P8 exits Q8 first, then P7 … down to P1; SER enters at stage 1 in serial mode.',
        ],
        note: 'The CD4021 parallel load is asynchronous (level-controlled by P/S CONTROL), unlike the synchronous CD4014. 74Sim models this with the dedicated SHIFT_REG_8BIT_PISO_CD4021 primitive: while P/S CONTROL is HIGH the register continuously tracks P1–P8 (jam-load); while it is LOW the register shifts on the rising clock edge. As with all 74Sim sequential parts there is no propagation delay (see issues.md A1), so the brief stage-to-stage settling of real silicon is not reproduced — the settled data is correct.',
      },
    ],
  },

};
