// chips66.js Block 66: 74406 .. 74934 (10 chips, all stubs)
// SKIP: 74131 (key conflict with 74AS131 in chips11.js),
//        74416 (key conflict with 74S416 in chips25.js),
//        74424 (key conflict with 74x424 in chips25.js)
// ALL STUBS obscure Motorola MC74xxx parts with unverified pinouts

export const CHIPS_BLOCK_66 = {

  // ── 74406: 3-to-8 line decoder (14-pin) ────────────────────────────────
  /* Primary source: 74406 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Multiplexer */
  // MC74406P Motorola. Unknown pinout; best-guess based on description.
  '74406': {
    name: '74x406',
    simpleName: '3-to-8 Decoder',
    description: '3-to-8 line decoder (MC74406, Motorola unverified pinout) (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['decoder', '3-to-8', 'Motorola', 'stub'],
    guideOverview: 'The 74406 is a 3-to-8 line decoder (Motorola MC74406, pinout unverified). Three address inputs (A0-A2) select one of eight outputs, which goes active when the enable input is asserted. On a breadboard a 3-to-8 decoder is useful for memory address decoding, control signal routing, and any application that needs to activate exactly one of eight loads from a 3 bit binary code. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'EN',  type: 'input'  },
      { pin:  5, name: 'Y0',  type: 'output' },
      { pin:  6, name: 'Y1',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: 'Y2',  type: 'output' },
      { pin:  9, name: 'Y3',  type: 'output' },
      { pin: 10, name: 'Y4',  type: 'output' },
      { pin: 11, name: 'Y5',  type: 'output' },
      { pin: 12, name: 'Y6',  type: 'output' },
      { pin: 13, name: 'Y7',  type: 'output' },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','EN'], outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
    ],
  },

  // ── 74408: 8 bit parity tree (14-pin) ──────────────────────────────────
  /* Primary source: 74408 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Parity_bit */
  // MC74408 Motorola. Unknown pinout; best-guess.
  '74408': {
    name: '74x408',
    simpleName: '8 bit Parity Tree',
    description: '8 bit parity tree (MC74408, Motorola unverified pinout) (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['parity', '8 bit', 'Motorola', 'stub'],
    guideOverview: 'The 74408 is an 8 bit parity tree (Motorola MC74408, pinout unverified). It counts the number of HIGH bits across eight data inputs and asserts either the EVEN output for an even count or the ODD output for an odd count. On a breadboard a parity generator is a standard building block for detecting single-bit transmission errors in byte-wide data paths. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'D0',   type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'D3',   type: 'input'  },
      { pin:  5, name: 'D4',   type: 'input'  },
      { pin:  6, name: 'EVEN', type: 'output' },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: 'ODD',  type: 'output' },
      { pin:  9, name: 'D5',   type: 'input'  },
      { pin: 10, name: 'D6',   type: 'input'  },
      { pin: 11, name: 'D7',   type: 'input'  },
      { pin: 12, name: 'NC1',  type: 'nc'     },
      { pin: 13, name: 'NC2',  type: 'nc'     },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7'], outputs: ['EVEN','ODD'] },
    ],
  },

  // ── 74418: Modulo 16 counter, preload and clear (16-pin) ──────────────
  /* Primary source: 74418 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Counter_(digital) */
  // MC74418 Motorola. Sequential, unknown pinout.
  '74418': {
    name: '74x418',
    simpleName: 'Mod-16 Counter',
    description: 'Modulo 16 counter with preload and clear inputs (MC74418, Motorola unverified pinout) (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['counter', 'modulo-16', 'preload', 'clear', 'Motorola', 'stub'],
    sequential: true,
    guideOverview: 'The 74418 is a modulo-16 counter with preload and synchronous clear inputs (Motorola MC74418, pinout unverified). Four bits of output count from 0 through 15 and roll over, with a carry output (CO) for cascading. A preload input (PL) allows any starting count value to be loaded, and a clear input resets the counter. On a breadboard it is useful for divide-by-N applications, timers, and any circuit that needs a 4 bit up counter with a preset starting point. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input'  },
      { pin:  2, name: 'PL',   type: 'input'  },
      { pin:  3, name: 'CLR',  type: 'input'  },
      { pin:  4, name: 'P0',   type: 'input'  },
      { pin:  5, name: 'P1',   type: 'input'  },
      { pin:  6, name: 'P2',   type: 'input'  },
      { pin:  7, name: 'P3',   type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'Q0',   type: 'output' },
      { pin: 10, name: 'Q1',   type: 'output' },
      { pin: 11, name: 'Q2',   type: 'output' },
      { pin: 12, name: 'Q3',   type: 'output' },
      { pin: 13, name: 'CO',   type: 'output' },
      { pin: 14, name: 'NC1',  type: 'nc'     },
      { pin: 15, name: 'NC2',  type: 'nc'     },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CLK','PL','CLR','P0','P1','P2','P3'], outputs: ['Q0','Q1','Q2','Q3','CO'] },
    ],
  },

  // ── 74419: Dual modulo 4 counters, shared preload/clear (16-pin) ──────
  /* Primary source: 74419 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Counter_(digital) */
  // MC74419 Motorola. Sequential, unknown pinout.
  '74419': {
    name: '74x419',
    simpleName: 'Dual Mod-4 Counter',
    description: 'Dual modulo 4 counters with shared preload and clear inputs (MC74419, Motorola unverified pinout) (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['counter', 'dual', 'modulo-4', 'preload', 'clear', 'Motorola', 'stub'],
    sequential: true,
    guideOverview: 'The 74419 is a dual modulo-4 counter with shared preload and clear controls (Motorola MC74419, pinout unverified). Two independent 2 bit counters occupy one 16-pin package; each has its own clock and carry output, but they share common preload and clear signals. On a breadboard this makes it a compact solution for quadrature decoding or any application needing two small independent counters that can be reset or loaded together. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'CLK1', type: 'input'  },
      { pin:  2, name: 'P1A',  type: 'input'  },
      { pin:  3, name: 'P1B',  type: 'input'  },
      { pin:  4, name: 'Q1A',  type: 'output' },
      { pin:  5, name: 'Q1B',  type: 'output' },
      { pin:  6, name: 'CO1',  type: 'output' },
      { pin:  7, name: 'PL',   type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'CLR',  type: 'input'  },
      { pin: 10, name: 'CO2',  type: 'output' },
      { pin: 11, name: 'Q2B',  type: 'output' },
      { pin: 12, name: 'Q2A',  type: 'output' },
      { pin: 13, name: 'P2B',  type: 'input'  },
      { pin: 14, name: 'P2A',  type: 'input'  },
      { pin: 15, name: 'CLK2', type: 'input'  },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CLK1','P1A','P1B','PL','CLR','CLK2','P2A','P2B'], outputs: ['Q1A','Q1B','CO1','Q2A','Q2B','CO2'] },
    ],
  },


  

  // ── 74934: ADC similar to ADC0829 (28-pin) ────────────────────────────
  /* Primary source: 74934 datasheet   URL not yet verified. */
  // MM74C934 / NSC ADC; no datasheet found. Pin count from ADC0829 reference.
  '74934': {
    name: '74x934',
    simpleName: 'ADC (ADC0829-like)',
    description: 'Analog-to-digital converter similar to ADC0829 (NSC unverified pinout) (28-pin)',
    pins: 28, vcc: 28, gnd: 14,
    datasheet: '',
    tags: ['ADC', 'analog', 'converter', 'NSC', 'stub'],
    guideOverview: 'The 74934 is an analog-to-digital converter similar in organization to the ADC0829 (National Semiconductor, pinout unverified). Eight analog input channels are selected by address bits A0-A2, and a conversion produces an 8 bit digital result on D0-D7. The conversion cycle is controlled by chip select, write, and read strobes, with an interrupt output (INT) signaling completion. On a breadboard it provides a straightforward way to digitize analog signals from eight sources and read the results over a byte-wide data bus. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'IN0',  type: 'input'  },
      { pin:  2, name: 'IN1',  type: 'input'  },
      { pin:  3, name: 'IN2',  type: 'input'  },
      { pin:  4, name: 'IN3',  type: 'input'  },
      { pin:  5, name: 'IN4',  type: 'input'  },
      { pin:  6, name: 'IN5',  type: 'input'  },
      { pin:  7, name: 'IN6',  type: 'input'  },
      { pin:  8, name: 'IN7',  type: 'input'  },
      { pin:  9, name: 'VREF', type: 'input'  },
      { pin: 10, name: 'AGND', type: 'input'  },
      { pin: 11, name: 'CLK',  type: 'input'  },
      { pin: 12, name: 'CSn',  type: 'input'  },
      { pin: 13, name: 'WRn',  type: 'input'  },
      { pin: 14, name: 'GND',  type: 'power'  },
      { pin: 15, name: 'RDn',  type: 'input'  },
      { pin: 16, name: 'INT',  type: 'output' },
      { pin: 17, name: 'D0',   type: 'output' },
      { pin: 18, name: 'D1',   type: 'output' },
      { pin: 19, name: 'D2',   type: 'output' },
      { pin: 20, name: 'D3',   type: 'output' },
      { pin: 21, name: 'D4',   type: 'output' },
      { pin: 22, name: 'D5',   type: 'output' },
      { pin: 23, name: 'D6',   type: 'output' },
      { pin: 24, name: 'D7',   type: 'output' },
      { pin: 25, name: 'A0',   type: 'input'  },
      { pin: 26, name: 'A1',   type: 'input'  },
      { pin: 27, name: 'A2',   type: 'input'  },
      { pin: 28, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['IN0','IN1','IN2','IN3','IN4','IN5','IN6','IN7','VREF','AGND','CLK','CSn','WRn','RDn','A0','A1','A2'], outputs: ['INT','D0','D1','D2','D3','D4','D5','D6','D7'] },
    ],
  },

};
