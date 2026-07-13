// Chip definitions block 58
// Chips: 74x4059, 74x4060, 74x4061, 74x4066, 74x4067, 74x4072, 74x4075,
//        74x4078, 74x4094, 74x4102, 74x4103, 74x4245, 74x4301, 74x4302,
//        74x4303, 74x4304

export const CHIPS_BLOCK_58 = {

  // 74x4059: Programmable divide by-N counter (24-pin)
  // CD74x4059 programmable counter with 4 bit data inputs (JK or P inputs), mode pins, clock, enable
  // Complex chip treat as GENERIC_STUB
  '74x4059': {
    name: '74x4059',
    simpleName: 'Programmable Divide by-N Counter',
    description: 'Programmable divide by-N counter (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4059.pdf',
    tags: ['counter', 'programmable', 'divide by-N', 'stub'],
    guideOverview: 'The 74x4059 is a programmable divide by-N counter. Instead of always dividing a clock by a fixed power of two or ten, it lets you load programmable values and mode settings so the output frequency can be tailored to the job. It is useful in frequency synthesis, programmable timers, and control circuits where one clock source must be divided by a chosen number.',
    guidePinDescriptions: {
      'P10': 'Program input bit 0 for the first digit or preset group.',
      'P11': 'Program input bit 1 for the first preset group.',
      'P12': 'Program input bit 2 for the first preset group.',
      'P13': 'Program input bit 3 for the first preset group.',
      'PL': 'Program load control. Use it to load the programmed divide value into the device.',
      'P20': 'Program input bit 0 for the second preset group.',
      'P21': 'Program input bit 1 for the second preset group.',
      'P22': 'Program input bit 2 for the second preset group.',
      'P23': 'Program input bit 3 for the second preset group.',
      'Ka': 'Mode control input A used to choose the counter operating mode.',
      'Kb': 'Mode control input B.',
      'GND': 'Ground reference for the package.',
      'Kc': 'Mode control input C.',
      'P30': 'Program input bit 0 for the third preset group.',
      'P31': 'Program input bit 1 for the third preset group.',
      'P32': 'Program input bit 2 for the third preset group.',
      'P33': 'Program input bit 3 for the third preset group.',
      'LE': 'Latch enable control for the program inputs.',
      'CLK': 'Clock input that is divided by the programmed ratio.',
      'MR': 'Master reset. Assert it to clear the counter state.',
      'ENn': 'Active LOW enable. Pull LOW to let the counter run.',
      'EOn': 'Active LOW end of count or related cascade output, used when chaining counters.',
      'NC': 'No internal connection. Leave unconnected.',
      'VCC': 'Positive supply for the chip.',
    },
    guideSections: [
      {
        title: 'Programmable Division',
        paragraphs: [
          'A divide by-N counter outputs one pulse for every N input pulses. By loading different programmed values, the same chip can generate many different output rates from one clock source.',
        ],
      },
      {
        title: 'Why It Is More Complex',
        paragraphs: [
          'Unlike a plain ripple counter, this part has program inputs, mode controls, and load timing. That flexibility is the reason it is treated as a documented stub in the simulator.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'P10',  type: 'input'  },
      { pin:  2, name: 'P11',  type: 'input'  },
      { pin:  3, name: 'P12',  type: 'input'  },
      { pin:  4, name: 'P13',  type: 'input'  },
      { pin:  5, name: 'PL',   type: 'input'  },
      { pin:  6, name: 'P20',  type: 'input'  },
      { pin:  7, name: 'P21',  type: 'input'  },
      { pin:  8, name: 'P22',  type: 'input'  },
      { pin:  9, name: 'P23',  type: 'input'  },
      { pin: 10, name: 'Ka',   type: 'input'  },
      { pin: 11, name: 'Kb',   type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'Kc',   type: 'input'  },
      { pin: 14, name: 'P30',  type: 'input'  },
      { pin: 15, name: 'P31',  type: 'input'  },
      { pin: 16, name: 'P32',  type: 'input'  },
      { pin: 17, name: 'P33',  type: 'input'  },
      { pin: 18, name: 'LE',   type: 'input'  },
      { pin: 19, name: 'CLK',  type: 'input'  },
      { pin: 20, name: 'MR',   type: 'input'  },
      { pin: 21, name: 'ENn',  type: 'input'  },
      { pin: 22, name: 'EOn',  type: 'output' },
      { pin: 23, name: 'NC',   type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['P10','P11','P12','P13','PL','P20','P21','P22','P23','Ka','Kb','Kc','P30','P31','P32','P33','LE','CLK','MR','ENn'], outputs: [] },
    ],
  },

  // 74x4060: 14-stage binary ripple counter with oscillator (16-pin)
  // Counter advances on the high-to-low (falling) edge of CLKI; CLR is active
  // HIGH and forces all Q outputs LOW while also parking the oscillator
  // (CLKO HIGH, CLKOn LOW). Stages 1-3 and stage 11 are internal only, so the
  // accessible outputs are Q4-Q10 and Q12-Q14.
  // The hand-entered stub pinout that this entry replaced was wrong (it listed
  // OSCIN/OSCOUT/RS and Q1-Q3/Q11 on the wrong pins). Verified against the TI
  // package drawing AND logic diagram below — see issues.md C2.
  // Source: Texas Instruments, "SN54HC4060, SN74HC4060 14-Stage Asynchronous
  //   Binary Counters and Oscillators", SCLS161D (Dec 1982, rev. Sep 2003).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74hc4060.pdf.
  //   Verified: terminal assignment (J/N package, p.1), function table +
  //   positive-logic diagram with TI letter naming QD=stage4 … QN=stage14
  //   (p.2), read as rendered PDF page images (issues.md C4). Letter→pin map:
  //   1=QL=Q12, 2=QM=Q13, 3=QN=Q14, 4=QF=Q6, 5=QE=Q5, 6=QG=Q7, 7=QD=Q4,
  //   8=GND, 9=CLKO, 10=CLKOn, 11=CLKI, 12=CLR, 13=QI=Q9, 14=QH=Q8, 15=QJ=Q10,
  //   16=VCC. Function table: CLKI falling + CLR LOW advances; CLR HIGH clears.
  '74x4060': {
    name: '74x4060',
    simpleName: '14-Stage Binary Counter with Oscillator',
    description: '14-stage binary ripple counter with internal oscillator (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc4060.pdf',
    tags: ['counter', 'binary', '14-stage', 'oscillator', 'divider', 'timer'],
    guideOverview: 'The 74x4060 combines a 14-stage binary ripple counter with an on chip oscillator. Add an external resistor and capacitor (or a crystal) across CLKI, CLKO, and CLKOn and the chip clocks itself, then divides that clock down into much slower outputs. The accessible outputs are Q4 through Q14, with stages 1-3 and stage 11 internal only. It is a classic part for timers, blinkers, low frequency clocks, and long delay generators.',
    guidePinDescriptions: {
      'Q12': 'Counter stage 12 output. Toggles once per 4096 clock pulses (divide by 4096).',
      'Q13': 'Counter stage 13 output (divide by 8192).',
      'Q14': 'Counter stage 14 output (divide by 16384). Slowest available output.',
      'Q6': 'Counter stage 6 output (divide by 64).',
      'Q5': 'Counter stage 5 output (divide by 32).',
      'Q7': 'Counter stage 7 output (divide by 128).',
      'Q4': 'Counter stage 4 output (divide by 16). Fastest available output.',
      'GND': 'Ground reference for the device.',
      'CLKO': 'Oscillator output. With an external RC or crystal it forms the timing loop. Forced HIGH while CLR is HIGH.',
      'CLKOn': 'Inverted oscillator output, the complement of CLKO. Forced LOW while CLR is HIGH.',
      'CLKI': 'Clock input. The counter advances on each high-to-low (falling) edge.',
      'CLR': 'Master reset, active HIGH. A HIGH clears every counter stage to zero and stops the oscillator.',
      'Q9': 'Counter stage 9 output (divide by 512).',
      'Q8': 'Counter stage 8 output (divide by 256).',
      'Q10': 'Counter stage 10 output (divide by 1024).',
      'VCC': 'Positive supply for the oscillator and counter logic.',
    },
    guideSections: [
      {
        title: 'Oscillator Plus Divider',
        paragraphs: [
          'The oscillator section makes a clock from external resistor and capacitor parts (or a crystal), then the ripple counter divides that clock by successive powers of two. This saves parts compared with building an oscillator and divider separately. In the simulator you can also just drive CLKI directly with a clock instead of wiring the RC loop.',
        ],
      },
      {
        title: 'Reading the Outputs',
        paragraphs: [
          'Stages 1-3 and stage 11 are internal, so they never reach a pin. The available taps are Q4 (divide by 16) up to Q14 (divide by 16384). Each higher output is half the frequency of the one before it.',
        ],
        formulas: [
          'Qn frequency = clock frequency / 2^n',
        ],
        list: [
          'Long delay timers.',
          'LED blink generators.',
          'Slow control clocks derived from one fast clock.',
        ],
        note: 'The counter advances on the falling edge of CLKI. A HIGH on CLR clears all outputs to zero. The simulator drives CLKI as a normal clock and does not model the analog RC oscillator timing.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Q12',   type: 'output' },
      { pin:  2, name: 'Q13',   type: 'output' },
      { pin:  3, name: 'Q14',   type: 'output' },
      { pin:  4, name: 'Q6',    type: 'output' },
      { pin:  5, name: 'Q5',    type: 'output' },
      { pin:  6, name: 'Q7',    type: 'output' },
      { pin:  7, name: 'Q4',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'CLKO',  type: 'output' },
      { pin: 10, name: 'CLKOn', type: 'output' },
      { pin: 11, name: 'CLKI',  type: 'input'  },
      { pin: 12, name: 'CLR',   type: 'input'  },
      { pin: 13, name: 'Q9',    type: 'output' },
      { pin: 14, name: 'Q8',    type: 'output' },
      { pin: 15, name: 'Q10',   type: 'output' },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_OSC_14_CLKO', inputs: ['CLKI','CLR'], outputs: ['Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q12','Q13','Q14','CLKO','CLKOn'] },
    ],
  },

  // 74x4061: 14-stage asynchronous (ripple) binary counter with oscillator (16-pin)
  // Functionally the asynchronous 14-stage counter+oscillator. No standalone TI
  // "SN74HC4061" datasheet is published (ti.com/lit 404s for sn74hc4061, and TI,
  // NXP, onsemi and ST host only the '4060). The "74HC4061" listed by distributors
  // and datasheet aggregators is the SAME part TI documents as the SN74HC4060
  // family doc, whose own title is "14-Stage ASYNCHRONOUS Binary Counters and
  // Oscillators" — so that doc is the authoritative source for this entry. The
  // hand-entered stub pinout that this replaced was wrong (it cloned a bad '4060
  // map: OSCIN/OSCOUT/RS and Q1-Q3/Q11 on the wrong pins). Re-verified against the
  // TI package drawing AND logic diagram — see issues.md C2.
  // Behaviour: counter advances on the high-to-low (falling) edge of CLKI; CLR is
  // active HIGH and forces all Q LOW while parking the oscillator (CLKO HIGH,
  // CLKOn LOW). Stages 1-3 and 11 are internal only; accessible taps are Q4-Q10,
  // Q12-Q14. Reuses the COUNTER_BIN_OSC_14_CLKO primitive (the '4060 core).
  // Source: Texas Instruments, "SN54HC4060, SN74HC4060 14-Stage Asynchronous
  //   Binary Counters and Oscillators", SCLS161D (Dec 1982, rev. Sep 2003).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74hc4060.pdf.
  //   Verified: terminal assignment (J/N package, p.1) + function table and
  //   positive-logic diagram with TI letter naming QD=stage4 … QN=stage14 (p.2),
  //   read as rendered PDF page images (issues.md C4). Letter→pin map:
  //   1=QL=Q12, 2=QM=Q13, 3=QN=Q14, 4=QF=Q6, 5=QE=Q5, 6=QG=Q7, 7=QD=Q4, 8=GND,
  //   9=CLKO, 10=CLKOn, 11=CLKI, 12=CLR, 13=QI=Q9, 14=QH=Q8, 15=QJ=Q10, 16=VCC.
  // Source (existence/identity of the "74HC4061" listing, reconciled, not trusted
  //   for pinout): "74HC4061 — Asynchronous 14-Stage Binary Counters and
  //   Oscillators (Texas Instruments)", alldatasheet.com. [Online]. Available:
  //   https://www.alldatasheet.com/view.jsp?Searchword=74HC4061. Verified: it
  //   resolves to the SN74HC4060 family document above.
  '74x4061': {
    name: '74x4061',
    simpleName: '14-Stage Asynchronous Binary Counter with Oscillator',
    description: '14-stage async (ripple) binary counter, internal oscillator (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc4060.pdf',
    tags: ['counter', 'binary', '14-stage', 'async', 'oscillator', 'divider', 'timer'],
    guideOverview: 'The 74x4061 is a 14-stage binary ripple counter with an on chip oscillator. "Asynchronous" here means it is a ripple counter: each stage clocks the next, so the bits do not all change at exactly the same instant. Wire an external resistor and capacitor (or a crystal) across CLKI, CLKO, and CLKOn and the chip clocks itself, then divides that clock down into much slower outputs. The accessible taps are Q4 through Q14; stages 1-3 and stage 11 are internal only.',
    guidePinDescriptions: {
      'Q12': 'Counter stage 12 output. Toggles once per 4096 clock pulses (divide by 4096).',
      'Q13': 'Counter stage 13 output (divide by 8192).',
      'Q14': 'Counter stage 14 output (divide by 16384). Slowest available output.',
      'Q6': 'Counter stage 6 output (divide by 64).',
      'Q5': 'Counter stage 5 output (divide by 32).',
      'Q7': 'Counter stage 7 output (divide by 128).',
      'Q4': 'Counter stage 4 output (divide by 16). Fastest available output.',
      'GND': 'Ground reference for the device.',
      'CLKO': 'Oscillator output. With an external RC or crystal it forms the timing loop. Forced HIGH while CLR is HIGH.',
      'CLKOn': 'Inverted oscillator output, the complement of CLKO. Forced LOW while CLR is HIGH.',
      'CLKI': 'Clock input. The counter advances on each high-to-low (falling) edge.',
      'CLR': 'Master reset, active HIGH. A HIGH clears every counter stage to zero and stops the oscillator.',
      'Q9': 'Counter stage 9 output (divide by 512).',
      'Q8': 'Counter stage 8 output (divide by 256).',
      'Q10': 'Counter stage 10 output (divide by 1024).',
      'VCC': 'Positive supply for the oscillator and counter logic.',
    },
    guideSections: [
      {
        title: 'Ripple Counter, Not Synchronous',
        paragraphs: [
          'In a ripple counter the first flip-flop is clocked by CLKI, and each later stage is clocked by the one before it. The change rolls down the chain like a wave, so the higher outputs switch a tiny moment after the lower ones. That is the meaning of "asynchronous". It costs nothing in parts but means the outputs are not all valid on the same edge, which matters if you decode several of them at once.',
        ],
      },
      {
        title: 'Oscillator Plus Divider',
        paragraphs: [
          'The oscillator section makes a clock from external resistor and capacitor parts (or a crystal), then the counter divides that clock by successive powers of two. In the simulator you can skip the RC loop and drive CLKI directly with a clock; each higher output is half the frequency of the one before it.',
        ],
        formulas: [
          'Qn frequency = clock frequency / 2^n',
        ],
        list: [
          'Long delay timers.',
          'LED blink generators.',
          'Slow control clocks derived from one fast clock.',
        ],
        note: 'The counter advances on the falling edge of CLKI. A HIGH on CLR clears all outputs to zero. The simulator drives CLKI as a normal clock and does not model the analog RC oscillator timing.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Q12',   type: 'output' },
      { pin:  2, name: 'Q13',   type: 'output' },
      { pin:  3, name: 'Q14',   type: 'output' },
      { pin:  4, name: 'Q6',    type: 'output' },
      { pin:  5, name: 'Q5',    type: 'output' },
      { pin:  6, name: 'Q7',    type: 'output' },
      { pin:  7, name: 'Q4',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'CLKO',  type: 'output' },
      { pin: 10, name: 'CLKOn', type: 'output' },
      { pin: 11, name: 'CLKI',  type: 'input'  },
      { pin: 12, name: 'CLR',   type: 'input'  },
      { pin: 13, name: 'Q9',    type: 'output' },
      { pin: 14, name: 'Q8',    type: 'output' },
      { pin: 15, name: 'Q10',   type: 'output' },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_OSC_14_CLKO',
        inputs: ['CLKI','CLR'],
        outputs: ['Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q12','Q13','Q14','CLKO','CLKOn'] },
    ],
  },

  // 74x4066: Quad single pole single throw analog switch (14-pin)
  // SN74x4066 four independent SPST analog switches; same pinout as 4016 but improved Ron
  '74x4066': {
    name: '74x4066',
    simpleName: 'Quad Bilateral Analog Switch',
    description: 'Quad single pole single throw analog switch (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    onResistance: 80,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc4066.pdf',
    tags: ['analog', 'switch', 'bilateral', 'quad', 'bidir'],
    guideOverview: 'The 74x4066 contains four independent bilateral analog switches. Each channel acts like an electronically controlled SPST switch that can pass signals in either direction when enabled. It is useful for routing analog voltages, gating audio, or switching low speed digital lines without committing to a one way buffer.',
    guidePinDescriptions: {
      'A1': 'One side of switch channel 1.',
      'B1': 'Other side of switch channel 1.',
      'E1': 'Control input for channel 1. A HIGH control level typically closes the switch.',
      'E2': 'Control input for channel 2.',
      'B2': 'Other side of switch channel 2.',
      'A2': 'One side of switch channel 2.',
      'GND': 'Ground reference for the package.',
      'A3': 'One side of switch channel 3.',
      'B3': 'Other side of switch channel 3.',
      'E3': 'Control input for channel 3.',
      'E4': 'Control input for channel 4.',
      'B4': 'Other side of switch channel 4.',
      'A4': 'One side of switch channel 4.',
      'VCC': 'Positive supply for the switch control logic.',
    },
    guideSections: [
      {
        title: 'Bilateral Switching',
        paragraphs: [
          'Unlike a logic buffer, each channel can pass a signal in either direction. That is why the pins are treated as bidirectional analog nodes rather than fixed input and output pins.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Audio or sensor signal routing.',
          'Digitally controlled signal gating.',
          'Simple low frequency multiplexing.',
        ],
        note: '74Sim models each channel as a passive resistive coupling: when E is HIGH, A and B are connected through the chip\'s on-resistance (~80 Ω for the 4066) and any analog voltage between the rails passes through; when E is LOW, both terminals are isolated. Distortion, bandwidth, and leakage are not modelled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'A1',  type: 'bidir'  },
      { pin:  2, name: 'B1',  type: 'bidir'  },
      { pin:  3, name: 'E1',  type: 'input'  },
      { pin:  4, name: 'E2',  type: 'input'  },
      { pin:  5, name: 'B2',  type: 'bidir'  },
      { pin:  6, name: 'A2',  type: 'bidir'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'A3',  type: 'bidir'  },
      { pin:  9, name: 'B3',  type: 'bidir'  },
      { pin: 10, name: 'E3',  type: 'input'  },
      { pin: 11, name: 'E4',  type: 'input'  },
      { pin: 12, name: 'B4',  type: 'bidir'  },
      { pin: 13, name: 'A4',  type: 'bidir'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'BILATERAL_SWITCH', inputs: ['A1','B1','E1'], outputs: ['A1','B1'] },
      { type: 'BILATERAL_SWITCH', inputs: ['A2','B2','E2'], outputs: ['A2','B2'] },
      { type: 'BILATERAL_SWITCH', inputs: ['A3','B3','E3'], outputs: ['A3','B3'] },
      { type: 'BILATERAL_SWITCH', inputs: ['A4','B4','E4'], outputs: ['A4','B4'] },
    ],
  },

  // 74x4067: 16-channel analog multiplexer/demultiplexer (24-pin)
  // Single-chip 16:1 bidirectional analog mux/demux. Common I/O = Z (pin 1);
  // 4-bit select A(LSB)/B/C/D(MSB); E (inhibit) opens all channels. No VEE pin.
  // Source: Texas Instruments, "CD74HC4067, CD74HCT4067 High-Speed CMOS Logic
  //   16-Channel Analog Multiplexer and Demultiplexer", SCHS209D (Nov 1998,
  //   rev. Dec 2024). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4067.pdf. Verified: Figure 4-1
  //   terminal assignment + Table 4-1 truth table, pages 2 & 4-5, read as
  //   rendered PDF page images (issues.md C4 — never a WebFetch text summary).
  //   Pin map: COMMON I/O(1), I7..I0 on 2-9, S0(10), S1(11), GND(12), S3(13),
  //   S2(14), E inhibit(15), I15..I8 on 16-23, VCC(24). NO VEE pin — the signal
  //   path is referenced between VCC and GND (unlike the 4051/4052/4053).
  //   This corrects the original hand-entered stub (issues.md C6), which put the
  //   common on pin 9 and invented a VEE on pin 13.
  //   Channel/select names mapped to the engine's ANALOG_MUX_16 convention:
  //   Z=COMMON, Y0..Y15=I0..I15, A/B/C/D = S0/S1/S2/S3, INH = E.
  //   ON resistance from §1 Features (HC: 70 ohm typ at VCC=4.5 V).
  '74x4067': {
    name: '74x4067',
    simpleName: '16-Channel Analog Multiplexer/Demultiplexer',
    description: '16-channel analog mux/demux, bidirectional, INHIBIT disable (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    onResistance: 70,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4067.pdf',
    tags: ['analog', 'mux', 'demux', '16-channel', 'bidir'],
    guideOverview: 'The 74x4067 is a 16-channel analog multiplexer/demultiplexer. It uses a 4 bit select code on A (LSB), B, C, and D (MSB) to connect one of sixteen channels Y0-Y15 to a shared common node Z, and the switch path is bilateral so analog or digital signals can travel either way. Pulling INHIBIT HIGH opens all sixteen channels at once. This makes it a practical part for sensor arrays, audio switching, and expanding the number of signals a small microcontroller can inspect through a single pin.',
    guidePinDescriptions: {
      'Z': 'Common node. It connects to the addressed channel when the chip is enabled.',
      'Y0': 'Channel 0 in/out (selected when DCBA = 0000).',
      'Y1': 'Channel 1 in/out (selected when DCBA = 0001).',
      'Y2': 'Channel 2 in/out (selected when DCBA = 0010).',
      'Y3': 'Channel 3 in/out (selected when DCBA = 0011).',
      'Y4': 'Channel 4 in/out (selected when DCBA = 0100).',
      'Y5': 'Channel 5 in/out (selected when DCBA = 0101).',
      'Y6': 'Channel 6 in/out (selected when DCBA = 0110).',
      'Y7': 'Channel 7 in/out (selected when DCBA = 0111).',
      'Y8': 'Channel 8 in/out (selected when DCBA = 1000).',
      'Y9': 'Channel 9 in/out (selected when DCBA = 1001).',
      'Y10': 'Channel 10 in/out (selected when DCBA = 1010).',
      'Y11': 'Channel 11 in/out (selected when DCBA = 1011).',
      'Y12': 'Channel 12 in/out (selected when DCBA = 1100).',
      'Y13': 'Channel 13 in/out (selected when DCBA = 1101).',
      'Y14': 'Channel 14 in/out (selected when DCBA = 1110).',
      'Y15': 'Channel 15 in/out (selected when DCBA = 1111).',
      'A': 'Channel-select bit A (least significant).',
      'B': 'Channel-select bit B.',
      'C': 'Channel-select bit C.',
      'D': 'Channel-select bit D (most significant).',
      'INH': 'Inhibit. HIGH opens all channels so Z floats; LOW enables normal mux/demux operation.',
      'GND': 'Ground reference (0 V); also the lower reference of the signal path.',
      'VCC': 'Positive supply for the switches and select logic.',
    },
    guideSections: [
      {
        title: '4 bit Selection',
        paragraphs: [
          'The A (LSB), B, C, and D (MSB) inputs form a 4 bit address that selects one of the sixteen Y channels: DCBA = 0000 picks Y0, 0001 picks Y1, and so on up to 1111 for Y15. Only the addressed channel connects to the common Z pin, and only while INHIBIT is LOW. A HIGH on INHIBIT opens all sixteen channels regardless of the address.',
        ],
      },
      {
        title: 'Bidirectional Switch',
        paragraphs: [
          'Each channel is a real bidirectional switch, not a one-way logic gate, so it does not matter which side you drive. As a multiplexer, wire sixteen signals to Y0-Y15 and read the chosen one at Z. As a demultiplexer, drive Z and the signal appears on whichever channel you address. The connection has a low ON resistance (about 70 ohm), so the addressed channel and Z are effectively tied together.',
        ],
        note: 'Unlike the 4051/4052/4053, this part has no separate VEE pin — the signal path is referenced between VCC and GND.',
      },
    ],
    pinout: [
      { pin:  1, name: 'Z',   type: 'bidir', description: 'Common in/out (couples to selected channel)' },
      { pin:  2, name: 'Y7',  type: 'bidir', description: 'Channel 7 in/out' },
      { pin:  3, name: 'Y6',  type: 'bidir', description: 'Channel 6 in/out' },
      { pin:  4, name: 'Y5',  type: 'bidir', description: 'Channel 5 in/out' },
      { pin:  5, name: 'Y4',  type: 'bidir', description: 'Channel 4 in/out' },
      { pin:  6, name: 'Y3',  type: 'bidir', description: 'Channel 3 in/out' },
      { pin:  7, name: 'Y2',  type: 'bidir', description: 'Channel 2 in/out' },
      { pin:  8, name: 'Y1',  type: 'bidir', description: 'Channel 1 in/out' },
      { pin:  9, name: 'Y0',  type: 'bidir', description: 'Channel 0 in/out' },
      { pin: 10, name: 'A',   type: 'input', description: 'Channel-select bit A (LSB, S0)' },
      { pin: 11, name: 'B',   type: 'input', description: 'Channel-select bit B (S1)' },
      { pin: 12, name: 'GND', type: 'power', description: 'Ground / signal reference (0 V)' },
      { pin: 13, name: 'D',   type: 'input', description: 'Channel-select bit D (MSB, S3)' },
      { pin: 14, name: 'C',   type: 'input', description: 'Channel-select bit C (S2)' },
      { pin: 15, name: 'INH', type: 'input', description: 'Inhibit (E): HIGH opens all channels' },
      { pin: 16, name: 'Y15', type: 'bidir', description: 'Channel 15 in/out' },
      { pin: 17, name: 'Y14', type: 'bidir', description: 'Channel 14 in/out' },
      { pin: 18, name: 'Y13', type: 'bidir', description: 'Channel 13 in/out' },
      { pin: 19, name: 'Y12', type: 'bidir', description: 'Channel 12 in/out' },
      { pin: 20, name: 'Y11', type: 'bidir', description: 'Channel 11 in/out' },
      { pin: 21, name: 'Y10', type: 'bidir', description: 'Channel 10 in/out' },
      { pin: 22, name: 'Y9',  type: 'bidir', description: 'Channel 9 in/out' },
      { pin: 23, name: 'Y8',  type: 'bidir', description: 'Channel 8 in/out' },
      { pin: 24, name: 'VCC', type: 'power', description: 'Positive supply' },
    ],
    gates: [
      { type: 'ANALOG_MUX_16', inputs: ['A','B','C','D','INH'] },
    ],
  },

  // 74x4072: Dual 4 input OR gate (14-pin)
  // TC74x4072 two independent 4 input OR gates; same pinout as 74x4002 but OR instead of NOR
  '74x4072': {
    name: '74x4072',
    simpleName: 'Dual 4 Input OR Gate',
    description: 'Dual 4 input OR gate (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4072b.pdf',
    tags: ['OR', 'dual', '4 input', 'gate'],
    guideOverview: 'The 74x4072 contains two independent 4 input OR gates. An OR gate outputs HIGH when any input is HIGH, so this chip is useful when several possible conditions should all be able to trigger the same result. Four input OR gates save space when you need to combine many signals without cascading smaller gates.',
    guidePinDescriptions: {
      '1Y': 'Output of gate 1. It goes HIGH if any of 1A, 1B, 1C, or 1D is HIGH.',
      '1A': 'Input A of gate 1.',
      '1B': 'Input B of gate 1.',
      '1C': 'Input C of gate 1.',
      '1D': 'Input D of gate 1.',
      'NC': 'No internal connection. Leave unconnected.',
      'GND': 'Ground reference for the package.',
      'NC2': 'No internal connection. Leave unconnected.',
      '2D': 'Input D of gate 2.',
      '2C': 'Input C of gate 2.',
      '2B': 'Input B of gate 2.',
      '2A': 'Input A of gate 2.',
      '2Y': 'Output of gate 2. It goes HIGH if any input of gate 2 is HIGH.',
      'VCC': 'Positive supply for the logic.',
    },
    guideSections: [
      {
        title: 'Logic Function',
        paragraphs: [
          'OR logic answers the question: is at least one condition true? If any input is HIGH, the output is HIGH.',
        ],
        formulas: [
          'Y = A + B + C + D',
        ],
      },
      {
        title: 'Typical Uses',
        list: [
          'Combining several control or alarm sources into one line.',
          'Creating set or trigger conditions from multiple inputs.',
          'Reducing gate count when four way logic combining is needed.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1Y',  type: 'output' },
      { pin:  2, name: '1A',  type: 'input'  },
      { pin:  3, name: '1B',  type: 'input'  },
      { pin:  4, name: '1C',  type: 'input'  },
      { pin:  5, name: '1D',  type: 'input'  },
      { pin:  6, name: 'NC',  type: 'nc'     },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'NC2', type: 'nc'     },
      { pin:  9, name: '2D',  type: 'input'  },
      { pin: 10, name: '2C',  type: 'input'  },
      { pin: 11, name: '2B',  type: 'input'  },
      { pin: 12, name: '2A',  type: 'input'  },
      { pin: 13, name: '2Y',  type: 'output' },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'OR', inputs: ['1A','1B','1C','1D'], output: '1Y' },
      { type: 'OR', inputs: ['2A','2B','2C','2D'], output: '2Y' },
    ],
  },

  // 74x4075: Triple 3 input OR gate (14-pin)
  // CD74x4075 three independent 3 input OR gates
  '74x4075': {
    name: '74x4075',
    simpleName: 'Triple 3-Input OR Gate',
    description: 'Triple 3 input OR gate (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4075.pdf',
    tags: ['OR', 'triple', '3 input', 'gate'],
    guideOverview: 'The 74x4075 contains three independent 3 input OR gates. It is useful when several related trigger conditions need to be merged, but a 2 input gate would force extra packages or extra logic levels. Breadboard designs often use parts like this to collapse multiple sensor or button signals into a simpler control path.',
    guidePinDescriptions: {
      '1A': 'Input A of gate 1.',
      '1B': 'Input B of gate 1.',
      '1C': 'Input C of gate 1.',
      '1Y': 'Output of gate 1. It goes HIGH if any of 1A, 1B, or 1C is HIGH.',
      '2Y': 'Output of gate 2.',
      '2A': 'Input A of gate 2.',
      'GND': 'Ground reference for the package.',
      '2B': 'Input B of gate 2.',
      '2C': 'Input C of gate 2.',
      '3C': 'Input C of gate 3.',
      '3B': 'Input B of gate 3.',
      '3A': 'Input A of gate 3.',
      '3Y': 'Output of gate 3.',
      'VCC': 'Positive supply for the logic.',
    },
    guideSections: [
      {
        title: 'Three Way OR Logic',
        paragraphs: [
          'Each section outputs HIGH when at least one of its three inputs is HIGH. That makes the chip convenient for medium fan in control logic without cascading multiple 2 input gates.',
        ],
      },
      {
        title: 'Where It Fits',
        list: [
          'Combining multiple button or sensor sources.',
          'Merging status flags into a shared request line.',
          'Building compact combinational logic networks.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1C',  type: 'input'  },
      { pin:  4, name: '1Y',  type: 'output' },
      { pin:  5, name: '2Y',  type: 'output' },
      { pin:  6, name: '2A',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '2B',  type: 'input'  },
      { pin:  9, name: '2C',  type: 'input'  },
      { pin: 10, name: '3C',  type: 'input'  },
      { pin: 11, name: '3B',  type: 'input'  },
      { pin: 12, name: '3A',  type: 'input'  },
      { pin: 13, name: '3Y',  type: 'output' },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'OR', inputs: ['1A','1B','1C'], output: '1Y' },
      { type: 'OR', inputs: ['2A','2B','2C'], output: '2Y' },
      { type: 'OR', inputs: ['3A','3B','3C'], output: '3Y' },
    ],
  },

  // 74x4078: Single 8-input OR/NOR gate (14-pin)
  // MM74x4078 one 8-input gate with both OR output (Y) and NOR output (Yn active low)
  // Pins: 1=Yn(NOR output), 2-5=inputs A-D, 6=NC, 7=GND, 8=NC, 9-12=inputs E-H, 13=Y(OR output), 14=VCC
  '74x4078': {
    name: '74x4078',
    simpleName: 'Single 8-Input OR/NOR Gate',
    description: 'Single 8-input OR gate with complementary OR and NOR outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4078b.pdf',
    tags: ['OR', 'NOR', 'single', '8-input', 'gate'],
    guideOverview: 'The 74x4078 is a wide 8-input logic combining gate with both OR and NOR outputs. It can answer either “is any input active?” or “are all inputs inactive?” without needing a separate inverter. This is useful in system monitoring logic, group enables, and any design where many conditions must be merged into one result.',
    guidePinDescriptions: {
      'Yn': 'NOR output, active HIGH only when all eight inputs are LOW.',
      'A': 'Input A of the 8-input gate.',
      'B': 'Input B of the 8-input gate.',
      'C': 'Input C of the 8-input gate.',
      'D': 'Input D of the 8-input gate.',
      'NC': 'No internal connection. Leave unconnected.',
      'GND': 'Ground reference for the package.',
      'NC2': 'No internal connection. Leave unconnected.',
      'E': 'Input E of the 8-input gate.',
      'F': 'Input F of the 8-input gate.',
      'G': 'Input G of the 8-input gate.',
      'H': 'Input H of the 8-input gate.',
      'Y': 'OR output. It goes HIGH if any input A through H is HIGH.',
      'VCC': 'Positive supply for the logic.',
    },
    guideSections: [
      {
        title: 'Wide Fan In Logic',
        paragraphs: [
          'An 8-input gate saves board space when many signals need to be examined together. Instead of building a tree of smaller gates, one package can combine all eight inputs directly.',
        ],
      },
      {
        title: 'Complementary Outputs',
        paragraphs: [
          'The OR and NOR outputs present the same logic result in both polarities. That can save one more inverter elsewhere in the design.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Yn',  type: 'output' },
      { pin:  2, name: 'A',   type: 'input'  },
      { pin:  3, name: 'B',   type: 'input'  },
      { pin:  4, name: 'C',   type: 'input'  },
      { pin:  5, name: 'D',   type: 'input'  },
      { pin:  6, name: 'NC',  type: 'nc'     },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'NC2', type: 'nc'     },
      { pin:  9, name: 'E',   type: 'input'  },
      { pin: 10, name: 'F',   type: 'input'  },
      { pin: 11, name: 'G',   type: 'input'  },
      { pin: 12, name: 'H',   type: 'input'  },
      { pin: 13, name: 'Y',   type: 'output' },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'OR',  inputs: ['A','B','C','D','E','F','G','H'], output: 'Y'  },
      { type: 'NOR', inputs: ['A','B','C','D','E','F','G','H'], output: 'Yn' },
    ],
  },

  // 74x4094: 8 bit three state shift register / latch (16-pin)
  // CD74x4094 serial in, parallel out with output enable; STR (strobe latch), CLK, D, Q1-Q8, QS1/QS2 serial outputs
  '74x4094': {
    name: '74x4094',
    simpleName: '8 bit Three State Shift Register / Latch',
    description: '8 bit three state shift register / latch with serial output (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd74hc4094.pdf',
    tags: ['shift-register', 'latch', '8 bit', 'tri state'],
    guideOverview: 'The 74x4094 is an 8 bit serial in, parallel out shift register with an output latch and three state outputs. Data bits shift in serially on the clock, then the strobe input transfers the stored pattern to the output latch so the outputs can all update together. It is a useful part for LED driving, output expansion, and bus connected serial to parallel conversion.',
    guidePinDescriptions: {
      'STR': 'Strobe or latch control. Use it to transfer the internal shift register contents to the output latch.',
      'D': 'Serial data input.',
      'CLK': 'Shift clock input. Each active edge shifts a new bit into the register.',
      'Q1': 'Parallel output bit 1.',
      'Q2': 'Parallel output bit 2.',
      'Q3': 'Parallel output bit 3.',
      'Q4': 'Parallel output bit 4.',
      'GND': 'Ground reference for the device.',
      'Q5': 'Parallel output bit 5.',
      'Q6': 'Parallel output bit 6.',
      'Q7': 'Parallel output bit 7.',
      'Q8': 'Parallel output bit 8.',
      'QS1': 'Serial output tap used for cascading into another shift register.',
      'QS2': 'Second serial output or cascade output as defined in the datasheet.',
      'OE': 'Output enable for the three state outputs. Disable it when the outputs should disconnect from a shared bus.',
      'VCC': 'Positive supply for the shift register and output latch.',
    },
    guideSections: [
      {
        title: 'Shift Then Latch',
        paragraphs: [
          'The 4094 separates shifting from output updating. You clock bits into the internal register first, then use STR to copy the whole byte to the output latch in one step.',
        ],
      },
      {
        title: 'Why Three State Helps',
        paragraphs: [
          'With OE control, the outputs can disconnect from a shared bus instead of always driving it. That makes the part easier to combine with other devices on common signal lines.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'STR',  type: 'input'  },
      { pin:  2, name: 'D',    type: 'input'  },
      { pin:  3, name: 'CLK',  type: 'input'  },
      { pin:  4, name: 'Q1',   type: 'output' },
      { pin:  5, name: 'Q2',   type: 'output' },
      { pin:  6, name: 'Q3',   type: 'output' },
      { pin:  7, name: 'Q4',   type: 'output' },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'Q5',   type: 'output' },
      { pin: 10, name: 'Q6',   type: 'output' },
      { pin: 11, name: 'Q7',   type: 'output' },
      { pin: 12, name: 'Q8',   type: 'output' },
      { pin: 13, name: 'QS1',  type: 'output' },
      { pin: 14, name: 'QS2',  type: 'output' },
      { pin: 15, name: 'OE',   type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'SHIFT_REG_LATCH_4094', inputs: ['D','CLK','STR','OE'], outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','QS1','QS2'] },
    ],
  },

  // 74x4102: 2-digit BCD presettable synchronous down counter (16-pin)
  // CD40102B two 4 bit BCD decades with preset, borrow/load/clock
  '74x4102': {
    name: '74x4102',
    simpleName: '2-Digit BCD Presettable Synchronous Down Counter',
    description: '2-digit BCD presettable synchronous down counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/gpn/cd40102b',
    tags: ['counter', 'BCD', 'down', 'preset', 'synchronous'],
    sequential: true,
    guideOverview: 'The 74x4102 is a presettable synchronous 2-decade BCD down counter (CD40102B). Both BCD digits count downward together on each rising CP edge when CEn and SPE are LOW. Drive PL LOW on a rising CP edge to synchronously load the preset values (P20 P23 for units, P10 P13 for tens). BOun goes LOW when the units decade reaches zero; TC goes LOW when both decades reach zero.',
    guidePinDescriptions: {
      'CP': 'Clock input. Rising edge advances the counter or loads preset.',
      'PL': 'Synchronous parallel load enable (active LOW). Hold LOW on a rising CP edge to load P10 P13 and P20 P23.',
      'P10': 'Preset data bit 0 for the tens decade (LSB).',
      'P11': 'Preset data bit 1 for the tens decade.',
      'P12': 'Preset data bit 2 for the tens decade.',
      'P13': 'Preset data bit 3 for the tens decade (MSB).',
      'BOun': 'Borrow output (active LOW). Goes LOW when the units decade reaches 0, enabling a cascaded tens counter.',
      'GND': 'Ground reference for the device.',
      'P23': 'Preset data bit 3 for the units decade (MSB).',
      'P22': 'Preset data bit 2 for the units decade.',
      'P21': 'Preset data bit 1 for the units decade.',
      'P20': 'Preset data bit 0 for the units decade (LSB).',
      'CEn': 'Count enable (active LOW). Both CEn and SPE must be LOW to count.',
      'SPE': 'Single phase enable (active LOW). Both CEn and SPE must be LOW to count.',
      'TC': 'Terminal count (active LOW). Goes LOW when both BCD decades reach 0.',
      'VCC': 'Positive supply for the logic.',
    },
    guideSections: [
      {
        title: 'BCD Down Counting',
        paragraphs: [
          'A BCD down counter works with decimal digits encoded in binary form. Units counts 9→8→...→0 and then borrows into the tens digit useful for clocks, timers, and numeric displays.',
          'Both CEn and SPE must be LOW for the counter to advance. Pull PL LOW on a rising CP edge to synchronously reload the preset values at any time.',
        ],
        list: [
          'BOun (pin 7) goes LOW when the units decade reaches 0 use this to enable a cascaded counter.',
          'TC (pin 15) goes LOW only when both decades reach 0 this is the overall terminal count.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CP',   type: 'input'  },
      { pin:  2, name: 'PL',   type: 'input'  },
      { pin:  3, name: 'P10',  type: 'input'  },
      { pin:  4, name: 'P11',  type: 'input'  },
      { pin:  5, name: 'P12',  type: 'input'  },
      { pin:  6, name: 'P13',  type: 'input'  },
      { pin:  7, name: 'BOun', type: 'output' },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'P23',  type: 'input'  },
      { pin: 10, name: 'P22',  type: 'input'  },
      { pin: 11, name: 'P21',  type: 'input'  },
      { pin: 12, name: 'P20',  type: 'input'  },
      { pin: 13, name: 'CEn',  type: 'input'  },
      { pin: 14, name: 'SPE',  type: 'input'  },
      { pin: 15, name: 'TC',   type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'BCD_DOWN_2DEC', inputs: ['CP','PL','P20','P21','P22','P23','P10','P11','P12','P13','CEn','SPE'], outputs: ['TC','BOun'] },
    ],
  },

  // 74x4103: 8 bit binary presettable synchronous down counter (16-pin)
  // CD40103B 8 bit binary counter with preset, terminal count, clock enable
  '74x4103': {
    name: '74x4103',
    simpleName: '8 bit Binary Presettable Synchronous Down Counter',
    description: '8 bit binary presettable synchronous down counter (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/gpn/cd40103b',
    tags: ['counter', 'binary', '8 bit', 'down', 'preset', 'synchronous'],
    sequential: true,
    guideOverview: 'The 74x4103 is a presettable synchronous 8 bit binary down counter (CD40103B). Load a starting value by holding PEn LOW on a rising CLK edge; the counter then decrements by 1 on each rising CLK edge when both CEn and SPE are LOW. TC goes active LOW when the counter reaches zero, making it easy to cascade multiple stages for longer delays or divide by-N functions.',
    guidePinDescriptions: {
      'PEn': 'Synchronous preset enable (active LOW). Hold LOW on a rising CLK edge to load P0 P7.',
      'P5': 'Preset data bit 5.',
      'P4': 'Preset data bit 4.',
      'P3': 'Preset data bit 3.',
      'P6': 'Preset data bit 6.',
      'P7': 'Preset data bit 7 (MSB).',
      'CEn': 'Count enable (active LOW). Both CEn and SPE must be LOW to count.',
      'GND': 'Ground reference for the counter.',
      'TC': 'Terminal count (active LOW). Goes LOW when the counter reaches zero.',
      'P0': 'Preset data bit 0 (LSB).',
      'P1': 'Preset data bit 1.',
      'P2': 'Preset data bit 2.',
      'SPE': 'Single phase enable (active LOW). Both CEn and SPE must be LOW to count.',
      'CLK': 'Clock input. Rising edge advances the counter or loads preset.',
      'NC': 'No internal connection. Leave unconnected.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Binary Countdown',
        paragraphs: [
          'An 8 bit down counter subtracts 1 on each rising CLK edge after a preset value has been loaded. That behavior is useful for programmable delays or dividing a clock by a selected number.',
          'Both CEn and SPE must be LOW for counting to occur. Hold PEn LOW on a rising CLK edge to synchronously reload the preset at any time.',
        ],
        list: [
          'TC (pin 9) goes LOW when the count reaches 0 connect to CEn of a cascaded stage for multi byte counters.',
          'The counter wraps from 0 back to 255 on the next clock edge if counting is not halted.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'PEn', type: 'input'  },
      { pin:  2, name: 'P5',  type: 'input'  },
      { pin:  3, name: 'P4',  type: 'input'  },
      { pin:  4, name: 'P3',  type: 'input'  },
      { pin:  5, name: 'P6',  type: 'input'  },
      { pin:  6, name: 'P7',  type: 'input'  },
      { pin:  7, name: 'CEn', type: 'input'  },
      { pin:  8, name: 'GND', type: 'power'  },
      { pin:  9, name: 'TC',  type: 'output' },
      { pin: 10, name: 'P0',  type: 'input'  },
      { pin: 11, name: 'P1',  type: 'input'  },
      { pin: 12, name: 'P2',  type: 'input'  },
      { pin: 13, name: 'SPE', type: 'input'  },
      { pin: 14, name: 'CLK', type: 'input'  },
      { pin: 15, name: 'NC',  type: 'nc'     },
      { pin: 16, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'BIN_DOWN_8BIT', inputs: ['CLK','PEn','P0','P1','P2','P3','P4','P5','P6','P7','CEn','SPE'], outputs: ['TC'] },
    ],
  },

  // 74x4245: 8 bit 3V/5V translating transceiver (24-pin)
  // SN74LVC4245A VCCA (pin 11) powers A-side, VCCB (pin 13) powers B-side, GND at pin 12.
  // Pin 24 is a second VCCB connection at the far end of the package (common in dual supply 24-pin SOIC).
  '74x4245': {
    name: '74x4245',
    simpleName: '8 bit Translating Transceiver (3V/5V)',
    description: '8 bit 3V/5V translating transceiver with three state outputs (24-pin)',
    pins: 24, vcc: 11, gnd: 12,
    datasheet: 'https://www.ti.com/lit/gpn/sn74lvc4245a',
    tags: ['transceiver', '8 bit', 'voltage-translator', 'bidir'],
    guideOverview: 'The 74x4245 is an octal bidirectional bus transceiver intended for voltage translation between logic domains, such as 3.3 V and 5 V systems. VCCA supplies the A-side I/O and VCCB supplies the B-side I/O, allowing the two buses to operate at different logic levels (for example 3.3 V and 5 V). Direction and output-enable controls let it pass an 8 bit bus either way while isolating the bus when disabled.',
    guidePinDescriptions: {
      'OEn': 'Active LOW output enable. Pull LOW to enable the transceiver; HIGH forces all outputs to high impedance.',
      'DIR': 'Direction control. HIGH = A-side drives B-side (A→B); LOW = B-side drives A-side (B→A).',
      'A1': 'Bit 1 on the A-side bus.',
      'A2': 'Bit 2 on the A-side bus.',
      'A3': 'Bit 3 on the A-side bus.',
      'A4': 'Bit 4 on the A-side bus.',
      'A5': 'Bit 5 on the A-side bus.',
      'A6': 'Bit 6 on the A-side bus.',
      'A7': 'Bit 7 on the A-side bus.',
      'A8': 'Bit 8 on the A-side bus.',
      'VCCA': 'Supply rail for the A-side logic domain. Connect to the voltage used by the A-side bus (e.g. 3.3 V).',
      'GND': 'Ground reference shared by both sides of the translator.',
      'VCCB': 'Supply rail for the B-side logic domain. Connect to the voltage used by the B-side bus (e.g. 5 V).',
      'B8': 'Bit 8 on the B-side bus.',
      'B7': 'Bit 7 on the B-side bus.',
      'B6': 'Bit 6 on the B-side bus.',
      'B5': 'Bit 5 on the B-side bus.',
      'B4': 'Bit 4 on the B-side bus.',
      'B3': 'Bit 3 on the B-side bus.',
      'B2': 'Bit 2 on the B-side bus.',
      'B1': 'Bit 1 on the B-side bus.',
      'NC': 'No internal connection. Leave unconnected.',
      'NC2': 'No internal connection. Leave unconnected.',
      'VCCB2': 'Second VCCB connection at the far end of the 24-pin package. Connect to the same B-side supply as VCCB (pin 13) for proper power distribution.',
    },
    guideSections: [
      {
        title: 'Voltage Translation',
        paragraphs: [
          'A translating transceiver lets one side of the bus operate at one supply voltage while the other side uses another. VCCA sets the logic thresholds and output swing for A-side pins; VCCB does the same for B-side pins. The device handles direction control and three state isolation so mixed voltage systems can exchange data safely.',
        ],
      },
      {
        title: 'Direction and Enable',
        paragraphs: [
          'Pull OEn LOW to enable the chip. With OEn LOW, DIR=HIGH sends data from A to B (A-side pins become inputs, B-side pins are driven). DIR=LOW reverses the flow. When OEn is HIGH, all eight channels go high impedance and neither bus is driven.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',   type: 'input'  },
      { pin:  2, name: 'DIR',   type: 'input'  },
      { pin:  3, name: 'A1',    type: 'bidir'  },
      { pin:  4, name: 'A2',    type: 'bidir'  },
      { pin:  5, name: 'A3',    type: 'bidir'  },
      { pin:  6, name: 'A4',    type: 'bidir'  },
      { pin:  7, name: 'A5',    type: 'bidir'  },
      { pin:  8, name: 'A6',    type: 'bidir'  },
      { pin:  9, name: 'A7',    type: 'bidir'  },
      { pin: 10, name: 'A8',    type: 'bidir'  },
      { pin: 11, name: 'VCCA',  type: 'power'  },
      { pin: 12, name: 'GND',   type: 'power'  },
      { pin: 13, name: 'VCCB',  type: 'power'  },
      { pin: 14, name: 'B8',    type: 'bidir'  },
      { pin: 15, name: 'B7',    type: 'bidir'  },
      { pin: 16, name: 'B6',    type: 'bidir'  },
      { pin: 17, name: 'B5',    type: 'bidir'  },
      { pin: 18, name: 'B4',    type: 'bidir'  },
      { pin: 19, name: 'B3',    type: 'bidir'  },
      { pin: 20, name: 'B2',    type: 'bidir'  },
      { pin: 21, name: 'B1',    type: 'bidir'  },
      { pin: 22, name: 'NC',    type: 'nc'     },
      { pin: 23, name: 'NC2',   type: 'nc'     },
      { pin: 24, name: 'VCCB2', type: 'power'  },
    ],
    gates: [
      { type: 'TRANSCEIVER_8BIT', inputs: ['A1','A2','A3','A4','A5','A6','A7','A8','B1','B2','B3','B4','B5','B6','B7','B8','DIR','OEn'], outputs: ['A1','A2','A3','A4','A5','A6','A7','A8','B1','B2','B3','B4','B5','B6','B7','B8'] },
    ],
  },

  // 74x4301: 8 bit latch, inverting outputs, three state (20-pin)
  // MN74x4301 latching of 8 data inputs; inverted Q outputs; bus-style pinout (D inputs lower, Q outputs upper)
  '74x4301': {
    name: '74x4301',
    simpleName: '8 bit Inverting Latch (TS)',
    description: '8 bit latch with inverting three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/gpn/sn74hc563',
    tags: ['latch', '8 bit', 'inverting', 'tri state'],
    guideOverview: 'The 74x4301 is an octal transparent latch with inverting three state outputs. While latch enable is active, the outputs follow the inputs through an inversion stage; when the latch closes, the last state is held and can be driven onto or disconnected from a bus. This is useful for temporary storage, bus interfacing, and address/data holding when inverted bus polarity is acceptable or desirable.',
    guidePinDescriptions: {
      'OEn': 'Active LOW output enable. Pull LOW to let the latched outputs drive the bus.',
      'D1': 'Data input bit 1.',
      'D2': 'Data input bit 2.',
      'D3': 'Data input bit 3.',
      'D4': 'Data input bit 4.',
      'D5': 'Data input bit 5.',
      'D6': 'Data input bit 6.',
      'D7': 'Data input bit 7.',
      'D8': 'Data input bit 8.',
      'GND': 'Ground reference for the device.',
      'LE': 'Latch enable. When active, the latch is transparent; when inactive, it holds the previous value.',
      'Q8n': 'Inverting three state output bit 8.',
      'Q7n': 'Inverting three state output bit 7.',
      'Q6n': 'Inverting three state output bit 6.',
      'Q5n': 'Inverting three state output bit 5.',
      'Q4n': 'Inverting three state output bit 4.',
      'Q3n': 'Inverting three state output bit 3.',
      'Q2n': 'Inverting three state output bit 2.',
      'Q1n': 'Inverting three state output bit 1.',
      'VCC': 'Positive supply for the latch.',
    },
    guideSections: [
      {
        title: 'Transparent Latch Behavior',
        paragraphs: [
          'A transparent latch passes input data to the storage node while latch enable is active. When latch enable changes state, the most recent input value is held until the latch is opened again.',
        ],
      },
      {
        title: 'Inverting Bus Output',
        paragraphs: [
          'This variant drives the complement of the stored data onto the output bus. That can be convenient in systems that already use active LOW bus conventions.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'D3',   type: 'input'  },
      { pin:  5, name: 'D4',   type: 'input'  },
      { pin:  6, name: 'D5',   type: 'input'  },
      { pin:  7, name: 'D6',   type: 'input'  },
      { pin:  8, name: 'D7',   type: 'input'  },
      { pin:  9, name: 'D8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'LE',   type: 'input'  },
      { pin: 12, name: 'Q8n',  type: 'output' },
      { pin: 13, name: 'Q7n',  type: 'output' },
      { pin: 14, name: 'Q6n',  type: 'output' },
      { pin: 15, name: 'Q5n',  type: 'output' },
      { pin: 16, name: 'Q4n',  type: 'output' },
      { pin: 17, name: 'Q3n',  type: 'output' },
      { pin: 18, name: 'Q2n',  type: 'output' },
      { pin: 19, name: 'Q1n',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'D_LATCH_OCTAL_TRI_INV', inputs: ['D1','D2','D3','D4','D5','D6','D7','D8','LE','OEn'], outputs: ['Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n','Q8n'] },
    ],
  },

  // 74x4302: 8 bit latch, non inverting outputs, three state (20-pin)
  // MN74x4302 same as 4301 but non inverting Q outputs
  '74x4302': {
    name: '74x4302',
    simpleName: '8 bit Non Inverting Latch (TS)',
    description: '8 bit latch with non inverting three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc573a.pdf',
    tags: ['latch', '8 bit', 'non inverting', 'tri state'],
    guideOverview: 'The 74x4302 is an octal transparent latch with non inverting three state outputs. It can capture and hold a byte while presenting the same polarity on the output bus, making it a common building block in microprocessor style address and data latching. The three state outputs let it share a bus cleanly with other devices.',
    guidePinDescriptions: {
      'OEn': 'Active LOW output enable. Pull LOW to let the outputs drive the bus.',
      'D1': 'Data input bit 1.',
      'D2': 'Data input bit 2.',
      'D3': 'Data input bit 3.',
      'D4': 'Data input bit 4.',
      'D5': 'Data input bit 5.',
      'D6': 'Data input bit 6.',
      'D7': 'Data input bit 7.',
      'D8': 'Data input bit 8.',
      'GND': 'Ground reference for the latch.',
      'LE': 'Latch enable. When active, the latch is transparent; when inactive, the stored byte is held.',
      'Q8': 'Non inverting three state output bit 8.',
      'Q7': 'Non inverting three state output bit 7.',
      'Q6': 'Non inverting three state output bit 6.',
      'Q5': 'Non inverting three state output bit 5.',
      'Q4': 'Non inverting three state output bit 4.',
      'Q3': 'Non inverting three state output bit 3.',
      'Q2': 'Non inverting three state output bit 2.',
      'Q1': 'Non inverting three state output bit 1.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Latch and Hold',
        paragraphs: [
          'While LE is active, the outputs track the inputs. When LE is released, the last input state is stored and remains available until the latch opens again.',
        ],
      },
      {
        title: 'Three State Bus Use',
        paragraphs: [
          'With output enable control, the latch can either drive the bus or disconnect from it. That is why parts like this are common in shared data-path designs.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'D3',   type: 'input'  },
      { pin:  5, name: 'D4',   type: 'input'  },
      { pin:  6, name: 'D5',   type: 'input'  },
      { pin:  7, name: 'D6',   type: 'input'  },
      { pin:  8, name: 'D7',   type: 'input'  },
      { pin:  9, name: 'D8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'LE',   type: 'input'  },
      { pin: 12, name: 'Q8',   type: 'output' },
      { pin: 13, name: 'Q7',   type: 'output' },
      { pin: 14, name: 'Q6',   type: 'output' },
      { pin: 15, name: 'Q5',   type: 'output' },
      { pin: 16, name: 'Q4',   type: 'output' },
      { pin: 17, name: 'Q3',   type: 'output' },
      { pin: 18, name: 'Q2',   type: 'output' },
      { pin: 19, name: 'Q1',   type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'D_LATCH_OCTAL_TRI', inputs: ['D1','D2','D3','D4','D5','D6','D7','D8','LE','OEn'], outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

  // 74x4303: 8 bit D type flip flop, inverting outputs, three state (20-pin)
  // MN74x4303 clocked 8 bit FF with inverted Q outputs; bus-style pinout like 4301
  '74x4303': {
    name: '74x4303',
    simpleName: '8 bit Inverting D Flip Flop (TS)',
    description: '8 bit D type flip flop with inverting three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/gpn/sn74als564b',
    tags: ['flip flop', '8 bit', 'D type', 'inverting', 'tri state'],
    guideOverview: 'The 74x4303 is an octal edge triggered D register with inverting three state outputs. On each active clock edge it captures the input byte, stores it, and presents the inverted result at the outputs when enabled. This kind of part is used in synchronous bus systems where data must be sampled only on clock edges and where active LOW bus conventions are acceptable.',
    guidePinDescriptions: {
      'OEn': 'Active LOW output enable. Pull LOW to let the stored outputs drive the bus.',
      'D1': 'Data input bit 1.',
      'D2': 'Data input bit 2.',
      'D3': 'Data input bit 3.',
      'D4': 'Data input bit 4.',
      'D5': 'Data input bit 5.',
      'D6': 'Data input bit 6.',
      'D7': 'Data input bit 7.',
      'D8': 'Data input bit 8.',
      'GND': 'Ground reference for the register.',
      'CLK': 'Clock input. The input byte is captured on the active clock edge.',
      'Q8n': 'Inverting three state output bit 8.',
      'Q7n': 'Inverting three state output bit 7.',
      'Q6n': 'Inverting three state output bit 6.',
      'Q5n': 'Inverting three state output bit 5.',
      'Q4n': 'Inverting three state output bit 4.',
      'Q3n': 'Inverting three state output bit 3.',
      'Q2n': 'Inverting three state output bit 2.',
      'Q1n': 'Inverting three state output bit 1.',
      'VCC': 'Positive supply for the flip flop register.',
    },
    guideSections: [
      {
        title: 'Edge Triggered Storage',
        paragraphs: [
          'Unlike a transparent latch, a D flip flop samples the inputs only on a clock edge. That makes timing easier in synchronous systems because the stored value changes only at defined instants.',
        ],
      },
      {
        title: 'Inverted Registered Bus Output',
        paragraphs: [
          'This variant stores the data on a clock edge and drives the inverted form onto the bus when enabled. It is the registered companion to an inverting latch family device.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'D3',   type: 'input'  },
      { pin:  5, name: 'D4',   type: 'input'  },
      { pin:  6, name: 'D5',   type: 'input'  },
      { pin:  7, name: 'D6',   type: 'input'  },
      { pin:  8, name: 'D7',   type: 'input'  },
      { pin:  9, name: 'D8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'CLK',  type: 'input'  },
      { pin: 12, name: 'Q8n',  type: 'output' },
      { pin: 13, name: 'Q7n',  type: 'output' },
      { pin: 14, name: 'Q6n',  type: 'output' },
      { pin: 15, name: 'Q5n',  type: 'output' },
      { pin: 16, name: 'Q4n',  type: 'output' },
      { pin: 17, name: 'Q3n',  type: 'output' },
      { pin: 18, name: 'Q2n',  type: 'output' },
      { pin: 19, name: 'Q1n',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'D_FF_OCTAL_TRI_INV', inputs: ['D1','D2','D3','D4','D5','D6','D7','D8','CLK','OEn'], outputs: ['Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n','Q8n'] },
    ],
  },

  // 74x4304: 8 bit D type flip flop, non inverting outputs, three state (20-pin)
  // MN74x4304 same as 4303 but non inverting Q outputs
  '74x4304': {
    name: '74x4304',
    simpleName: '8 bit Non Inverting D Flip Flop (TS)',
    description: '8 bit D type flip flop with non inverting three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/gpn/sn74hc574',
    tags: ['flip flop', '8 bit', 'D type', 'non inverting', 'tri state'],
    guideOverview: 'The 74x4304 is an octal edge triggered D register with non inverting three state outputs. It captures a byte on the clock edge and then holds that value until the next clock, which makes it a standard building block for synchronous data buses and register stages. The three state outputs let it coexist with other bus drivers cleanly.',
    guidePinDescriptions: {
      'OEn': 'Active LOW output enable. Pull LOW to let the stored outputs drive the bus.',
      'D1': 'Data input bit 1.',
      'D2': 'Data input bit 2.',
      'D3': 'Data input bit 3.',
      'D4': 'Data input bit 4.',
      'D5': 'Data input bit 5.',
      'D6': 'Data input bit 6.',
      'D7': 'Data input bit 7.',
      'D8': 'Data input bit 8.',
      'GND': 'Ground reference for the register.',
      'CLK': 'Clock input. The register captures the input byte on the active edge.',
      'Q8': 'Non inverting three state output bit 8.',
      'Q7': 'Non inverting three state output bit 7.',
      'Q6': 'Non inverting three state output bit 6.',
      'Q5': 'Non inverting three state output bit 5.',
      'Q4': 'Non inverting three state output bit 4.',
      'Q3': 'Non inverting three state output bit 3.',
      'Q2': 'Non inverting three state output bit 2.',
      'Q1': 'Non inverting three state output bit 1.',
      'VCC': 'Positive supply for the device.',
    },
    guideSections: [
      {
        title: 'Clocked Register Behavior',
        paragraphs: [
          'The register samples all eight D inputs together on the active clock edge, then holds that byte until the next sampling event. This makes it ideal for synchronous data movement and pipelining.',
        ],
      },
      {
        title: 'Bus Friendly Outputs',
        paragraphs: [
          'Three state outputs allow the stored byte to be disconnected from the bus when another device needs control of the same lines. That bus sharing role is one of the main reasons parts like this are so common.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'D3',   type: 'input'  },
      { pin:  5, name: 'D4',   type: 'input'  },
      { pin:  6, name: 'D5',   type: 'input'  },
      { pin:  7, name: 'D6',   type: 'input'  },
      { pin:  8, name: 'D7',   type: 'input'  },
      { pin:  9, name: 'D8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'CLK',  type: 'input'  },
      { pin: 12, name: 'Q8',   type: 'output' },
      { pin: 13, name: 'Q7',   type: 'output' },
      { pin: 14, name: 'Q6',   type: 'output' },
      { pin: 15, name: 'Q5',   type: 'output' },
      { pin: 16, name: 'Q4',   type: 'output' },
      { pin: 17, name: 'Q3',   type: 'output' },
      { pin: 18, name: 'Q2',   type: 'output' },
      { pin: 19, name: 'Q1',   type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'D_FF_OCTAL_TRI', inputs: ['D1','D2','D3','D4','D5','D6','D7','D8','CLK','OEn'], outputs: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'] },
    ],
  },

};
