// Chip definitions block 36
// Chips: 74678 74693

export const CHIPS_BLOCK_36 = {

  // ── 74678: 16 bit address comparator with latch (24-pin) ──────────────────
  /* Primary source: Texas Instruments, 74678 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als678.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x678': {
    name: '74x678',
    simpleName: '16 bit Addr Comparator/Latch',
    description: '16 bit address comparator with latch (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als678.pdf',
    tags: ['comparator', 'address', '16 bit', 'latch'],
    sequential: true,
    guideOverview: 'The 74x678 is a 16 bit address comparator with an internal reference latch. LE loads the 16 bit address (A0-A15) into the internal latch; OE (active LOW) enables the comparison outputs. Once latched, the chip continuously compares any 16 bit input against the stored reference without needing external storage. Used for memory address decoding.',
    guidePinDescriptions: {
      'A0':    'Address input bit 0.',
      'A1':    'Address input bit 1.',
      'A2':    'Address input bit 2.',
      'A3':    'Address input bit 3.',
      'A4':    'Address input bit 4.',
      'A5':    'Address input bit 5.',
      'A6':    'Address input bit 6.',
      'A7':    'Address input bit 7.',
      'A8':    'Address input bit 8.',
      'A9':    'Address input bit 9.',
      'A10':   'Address input bit 10.',
      'GND':   'Ground reference (pin 12).',
      'A11':   'Address input bit 11.',
      'A12':   'Address input bit 12.',
      'A13':   'Address input bit 13.',
      'A14':   'Address input bit 14.',
      'A15':   'Address input bit 15.',
      'LE':    'Latch Enable. Stores the current A0-A15 value as the reference.',
      'OEn':   'Output Enable for GEn and EQout (active LOW).',
      'NC1':   'No connect.',
      'GEn':   'Greater or Equal output (active LOW).',
      'EQout': 'Equal output.',
      'NC2':   'No connect.',
      'VCC':   'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Address Comparator with Latch',
        paragraphs: [
          'The internal latch stores a programmable base address. Once loaded via LE, the chip asserts EQout whenever the 16 bit address bus exactly matches the stored value. This saves external latch chips in address decoding circuits.',
        ],
        note: 'Comparison logic is now simulated. LE captures the current A word into the internal reference latch; with OEn LOW, EQout asserts when A matches the stored reference and GEn (active LOW) asserts when A is greater or equal.',
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',   type: 'input'  },
      { pin:  2, name: 'A1',   type: 'input'  },
      { pin:  3, name: 'A2',   type: 'input'  },
      { pin:  4, name: 'A3',   type: 'input'  },
      { pin:  5, name: 'A4',   type: 'input'  },
      { pin:  6, name: 'A5',   type: 'input'  },
      { pin:  7, name: 'A6',   type: 'input'  },
      { pin:  8, name: 'A7',   type: 'input'  },
      { pin:  9, name: 'A8',   type: 'input'  },
      { pin: 10, name: 'A9',   type: 'input'  },
      { pin: 11, name: 'A10',  type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'A11',  type: 'input'  },
      { pin: 14, name: 'A12',  type: 'input'  },
      { pin: 15, name: 'A13',  type: 'input'  },
      { pin: 16, name: 'A14',  type: 'input'  },
      { pin: 17, name: 'A15',  type: 'input'  },
      { pin: 18, name: 'LE',   type: 'input'  },
      { pin: 19, name: 'OEn',  type: 'input'  },
      { pin: 20, name: 'NC1',  type: 'nc'     },
      { pin: 21, name: 'GEn',  type: 'output' },
      { pin: 22, name: 'EQout',type: 'output' },
      { pin: 23, name: 'NC2',  type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'ADDR_COMP_LATCH', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12','A13','A14','A15','LE','OEn'], outputs: ['GEn','EQout'] },
    ],
  },

  // ── 74679: 12 bit address comparator with latch (20-pin) ─────────────────
  /* Primary source: Texas Instruments, 74679 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als679.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x679': {
    name: '74x679',
    simpleName: '12 bit Addr Comparator/Latch',
    description: '12 bit address comparator with latch (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als679.pdf',
    tags: ['comparator', 'address', '12 bit', 'latch'],
    sequential: true,
    guideOverview: 'The 74x679 is a 12 bit address comparator with an internal reference latch, in a 20-pin package. Functionally similar to the 74x678 but with 12 address bits (A0-A11). LE stores the reference address; OE (active LOW) enables outputs. Used in systems with 12 bit address spaces or as the lower half of a 16 bit comparison.',
    guidePinDescriptions: {
      'A0':    'Address input bit 0.',
      'A1':    'Address input bit 1.',
      'A2':    'Address input bit 2.',
      'A3':    'Address input bit 3.',
      'A4':    'Address input bit 4.',
      'A5':    'Address input bit 5.',
      'A6':    'Address input bit 6.',
      'A7':    'Address input bit 7.',
      'A8':    'Address input bit 8.',
      'GND':   'Ground reference (pin 10).',
      'A9':    'Address input bit 9.',
      'A10':   'Address input bit 10.',
      'A11':   'Address input bit 11.',
      'LE':    'Latch Enable. Stores A0-A11 as reference.',
      'OEn':   'Output Enable (active LOW).',
      'NC1':   'No connect.',
      'NC2':   'No connect.',
      'GEn':   'Greater or Equal output (active LOW).',
      'EQout': 'Equal output.',
      'VCC':   'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x678 vs 74x679',
        paragraphs: [
          '74x678 compares 16 bits (24-pin); 74x679 compares 12 bits (20-pin). For a full 16 bit comparison in a 20-pin package, cascade 74x679 with a 74x677 for the remaining 4 bits.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',   type: 'input'  },
      { pin:  2, name: 'A1',   type: 'input'  },
      { pin:  3, name: 'A2',   type: 'input'  },
      { pin:  4, name: 'A3',   type: 'input'  },
      { pin:  5, name: 'A4',   type: 'input'  },
      { pin:  6, name: 'A5',   type: 'input'  },
      { pin:  7, name: 'A6',   type: 'input'  },
      { pin:  8, name: 'A7',   type: 'input'  },
      { pin:  9, name: 'A8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'A9',   type: 'input'  },
      { pin: 12, name: 'A10',  type: 'input'  },
      { pin: 13, name: 'A11',  type: 'input'  },
      { pin: 14, name: 'LE',   type: 'input'  },
      { pin: 15, name: 'OEn',  type: 'input'  },
      { pin: 16, name: 'NC1',  type: 'nc'     },
      { pin: 17, name: 'NC2',  type: 'nc'     },
      { pin: 18, name: 'GEn',  type: 'output' },
      { pin: 19, name: 'EQout',type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'ADDR_COMP_LATCH', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','LE','OEn'], outputs: ['GEn','EQout'] },
    ],
  },

  // ── 74680: 12 bit address comparator with enable (20-pin) ────────────────
  /* Primary source: Texas Instruments, 74680 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als680.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x680': {
    name: '74x680',
    simpleName: '12 bit Addr Comparator/Enable',
    description: '12 bit address comparator with enable (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als680.pdf',
    tags: ['comparator', 'address', '12 bit', 'enable'],
    sequential: true,
    guideOverview: 'The 74x680 is a 12 bit address comparator with a global enable pin instead of a latch. When G (active LOW) is asserted, the comparison outputs are enabled; when G is deasserted, outputs are disabled. Use when a fixed (wired) reference address is sufficient.',
    guidePinDescriptions: {
      'A0':    'Address input bit 0.',
      'A1':    'Address input bit 1.',
      'A2':    'Address input bit 2.',
      'A3':    'Address input bit 3.',
      'A4':    'Address input bit 4.',
      'A5':    'Address input bit 5.',
      'A6':    'Address input bit 6.',
      'A7':    'Address input bit 7.',
      'A8':    'Address input bit 8.',
      'GND':   'Ground reference (pin 10).',
      'A9':    'Address input bit 9.',
      'A10':   'Address input bit 10.',
      'A11':   'Address input bit 11.',
      'G':     'Global Enable (active LOW). When LOW, enables the comparison outputs.',
      'NC1':   'No connect.',
      'NC2':   'No connect.',
      'NC3':   'No connect.',
      'GEn':   'Greater or Equal output (active LOW).',
      'EQout': 'Equal output.',
      'VCC':   'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x679 vs 74x680',
        paragraphs: [
          '74x679 has an internal LE latch (programmable reference); 74x680 uses a fixed wire programmed reference and a G enable. Use 74x680 for hard wired address decoding where the base address is set at board assembly time.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'A0',   type: 'input'  },
      { pin:  2, name: 'A1',   type: 'input'  },
      { pin:  3, name: 'A2',   type: 'input'  },
      { pin:  4, name: 'A3',   type: 'input'  },
      { pin:  5, name: 'A4',   type: 'input'  },
      { pin:  6, name: 'A5',   type: 'input'  },
      { pin:  7, name: 'A6',   type: 'input'  },
      { pin:  8, name: 'A7',   type: 'input'  },
      { pin:  9, name: 'A8',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'A9',   type: 'input'  },
      { pin: 12, name: 'A10',  type: 'input'  },
      { pin: 13, name: 'A11',  type: 'input'  },
      { pin: 14, name: 'G',    type: 'input'  },
      { pin: 15, name: 'NC1',  type: 'nc'     },
      { pin: 16, name: 'NC2',  type: 'nc'     },
      { pin: 17, name: 'NC3',  type: 'nc'     },
      { pin: 18, name: 'GEn',  type: 'output' },
      { pin: 19, name: 'EQout',type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'ADDR_COMP_FIXED', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','G'], outputs: ['GEn','EQout'] },
    ],
  },

  // ── 74681: 4 bit parallel binary accumulator, 3-state I/O (20-pin) ───────
  // Source: Texas Instruments, "SN54LS681, SN74LS681 4-Bit Parallel Binary
  //   Accumulators", doc D2422 (Jan 1981, rev. Apr 1985), in "The TTL Data
  //   Book, Volume 2" (1985), pp. 3-1289..3-1292. [Online]. Available:
  //   https://bitsavers.org/components/ti/_dataBooks/1985_TI_The_TTL_Data_Book_Vol_2.pdf
  //   Verified: terminal assignment (N/J package top view), functional block
  //   diagram, and Function Tables 1 (arithmetic, M=L), 2 (logic, M=H) and 3
  //   (register modes) read as 200-400 dpi PDF page images (per issues.md C4,
  //   never a text-summary fetch). TI's live sn74ls681.pdf symlink is dead
  //   (part obsolete) and redirected to a product-selection page, so the
  //   archived databook scan is the primary source.
  // NOTE: the previous stub pinout (S0-S3 select, A0-A3 inputs, F0-F3 outputs,
  //   OEn, COUT/CIN) was hand-entered and WRONG — the real part has no separate
  //   A input / F output pins. It uses three bidirectional I/O ports, RS0-RS2
  //   register select, AS0-AS2 ALU select, serial shift ports, and P̄/Ḡ carry
  //   look-ahead. Pinout corrected from the datasheet (the CD4082 lesson, C2).
  '74x681': {
    name: '74x681',
    simpleName: '4 bit Binary Accumulator',
    description: '4-bit binary accumulator, ALU, A/B regs, 3-state I/O ports (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls681.pdf',
    tags: ['accumulator', '4 bit', 'ALU', 'tri state', 'register'],
    sequential: true,
    guideOverview: 'The 74x681 packs a 4 bit ALU and two 4 bit registers (word A and word B) into one chip. The ALU works on the stored A and B words: AS0-AS2 pick one of eight operations, M chooses arithmetic (M LOW) or logic (M HIGH), and Cn is the carry in. On each rising clock edge RS0-RS2 pick what the registers do — load a word from the I/O bus, hold, shift, or accumulate (store the ALU result back into B). The four I/O ports are shared: they carry the ALU result out, or load word A or B in. Cn+4 is the carry out, and P and G let several chips chain into wider words through a 74x182 look-ahead generator.',
    guidePinDescriptions: {
      'CLK':   'Clock. Registers update on the LOW to HIGH edge.',
      'RS2':   'Register select bit 2. RS0-RS2 pick one of eight register modes.',
      'RS1':   'Register select bit 1.',
      'RS0':   'Register select bit 0.',
      'LI/RO': 'Left-in / right-out serial port for cascading the B shift register.',
      'Cn':    'Carry in (active HIGH).',
      'G':     'Carry generate output (active LOW), for a 74x182 look-ahead generator.',
      'Cn+4':  'Carry out (active HIGH).',
      'P':     'Carry propagate output (active LOW), for a 74x182 look-ahead generator.',
      'GND':   'Ground reference (pin 10).',
      'I/O3':  'Bidirectional data port bit 3: ALU result out, or A/B word in.',
      'I/O2':  'Bidirectional data port bit 2.',
      'I/O1':  'Bidirectional data port bit 1.',
      'I/O0':  'Bidirectional data port bit 0.',
      'M':     'Mode select. LOW = arithmetic functions; HIGH = logic functions.',
      'AS2':   'ALU function select bit 2. AS0-AS2 pick one of eight operations.',
      'AS1':   'ALU function select bit 1.',
      'AS0':   'ALU function select bit 0.',
      'RI/LO': 'Right-in / left-out serial port for cascading the B shift register.',
      'VCC':   'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'What an accumulator does',
        paragraphs: [
          'An accumulator is an ALU wired so its output feeds back as one of its own inputs. Add a number in, and the running total builds up over successive clock cycles without any external storage. The 74x681 holds that running total in its word B register.',
          'The ALU always works on the two stored words, A and B — not on the pins directly. Load a constant into A, then repeatedly accumulate, and B grows by A on every clock edge.',
        ],
      },
      {
        title: 'Register modes and the shared I/O bus',
        paragraphs: [
          'RS0-RS2 choose what happens on each clock edge: load word A, load word B, hold, accumulate (store the ALU result into B), or shift B left or right. The four I/O ports do double duty — they are inputs while loading a word, and outputs (driving the ALU result) the rest of the time.',
          'The serial ports LI/RO and RI/LO let the B register shift bits in and out, so several 74x681s can be chained to accumulate words wider than four bits.',
        ],
      },
    ],
    // Bidirectional I/O ports carry type 'input' (74x245 convention); the engine
    // resolves who drives each net. Serial ports LI/RO and RI/LO are likewise
    // bidirectional. G, Cn+4 and P are the only pure outputs.
    pinout: [
      { pin:  1, name: 'CLK',   type: 'input'  },
      { pin:  2, name: 'RS2',   type: 'input'  },
      { pin:  3, name: 'RS1',   type: 'input'  },
      { pin:  4, name: 'RS0',   type: 'input'  },
      { pin:  5, name: 'LI/RO', type: 'input'  },
      { pin:  6, name: 'Cn',    type: 'input'  },
      { pin:  7, name: 'G',     type: 'output' },
      { pin:  8, name: 'Cn+4',  type: 'output' },
      { pin:  9, name: 'P',     type: 'output' },
      { pin: 10, name: 'GND',   type: 'power'  },
      { pin: 11, name: 'I/O3',  type: 'input'  },
      { pin: 12, name: 'I/O2',  type: 'input'  },
      { pin: 13, name: 'I/O1',  type: 'input'  },
      { pin: 14, name: 'I/O0',  type: 'input'  },
      { pin: 15, name: 'M',     type: 'input'  },
      { pin: 16, name: 'AS2',   type: 'input'  },
      { pin: 17, name: 'AS1',   type: 'input'  },
      { pin: 18, name: 'AS0',   type: 'input'  },
      { pin: 19, name: 'RI/LO', type: 'input'  },
      { pin: 20, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      {
        type: 'ACC_4BIT_681',
        inputs:  ['CLK','RS2','RS1','RS0','AS2','AS1','AS0','M','Cn','LI/RO','RI/LO','I/O0','I/O1','I/O2','I/O3'],
        outputs: ['I/O0','I/O1','I/O2','I/O3','Cn+4','G','P','LI/RO','RI/LO'],
      },
    ],
  },

  // ── 74682: 8 bit magnitude comparator P>Q, pull up (20-pin) ──────────────
  /* Primary source: Texas Instruments, 74682 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls682.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x682': {
    name: '74x682',
    simpleName: '8 bit Magnitude Comparator (P>Q)',
    description: '8 bit magnitude comparator with P>Q output and 20kΩ pull up inputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls682.pdf',
    tags: ['comparator', '8 bit', 'magnitude', 'P>Q'],
    guideOverview: 'The 74x682 is an 8 bit magnitude comparator that compares word P (P0-P7) against word Q (Q0-Q7) and asserts PGQ (active LOW) when P > Q. G is a global enable. The Q inputs have internal 20 kΩ pull up resistors, making them compatible with open collector bus lines or DIP switches.',
    guidePinDescriptions: {
      'G':    'Global Enable (active LOW). Disables PGQ and PEQQ outputs when HIGH.',
      'P0':   'P word input bit 0.',
      'P1':   'P word input bit 1.',
      'P2':   'P word input bit 2.',
      'P3':   'P word input bit 3.',
      'P4':   'P word input bit 4.',
      'P5':   'P word input bit 5.',
      'P6':   'P word input bit 6.',
      'P7':   'P word input bit 7.',
      'GND':  'Ground reference (pin 10).',
      'Q7':   'Q word input bit 7 (has 20 kΩ pull up).',
      'Q6':   'Q word input bit 6.',
      'Q5':   'Q word input bit 5.',
      'Q4':   'Q word input bit 4.',
      'Q3':   'Q word input bit 3.',
      'Q2':   'Q word input bit 2.',
      'Q1':   'Q word input bit 1.',
      'Q0':   'Q word input bit 0 (has 20 kΩ pull up).',
      'PGQ':  'P Greater Than Q output (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '8 bit Magnitude Comparator',
        paragraphs: [
          'A magnitude comparator determines the numeric relationship between two binary words. The 74x682 outputs P>Q; use with 74x688 (P=Q) to implement full greater/less/equal comparison.',
        ],
      },
      {
        title: '74x682 vs 74x684',
        paragraphs: [
          '74x682 has 20 kΩ pull up resistors on the Q inputs for compatibility with open collector or DIP switch buses. 74x684 has no pull ups and is for direct TTL inputs only.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G',    type: 'input'  },
      { pin:  2, name: 'P0',   type: 'input'  },
      { pin:  3, name: 'P1',   type: 'input'  },
      { pin:  4, name: 'P2',   type: 'input'  },
      { pin:  5, name: 'P3',   type: 'input'  },
      { pin:  6, name: 'P4',   type: 'input'  },
      { pin:  7, name: 'P5',   type: 'input'  },
      { pin:  8, name: 'P6',   type: 'input'  },
      { pin:  9, name: 'P7',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'Q7',   type: 'input'  },
      { pin: 12, name: 'Q6',   type: 'input'  },
      { pin: 13, name: 'Q5',   type: 'input'  },
      { pin: 14, name: 'Q4',   type: 'input'  },
      { pin: 15, name: 'Q3',   type: 'input'  },
      { pin: 16, name: 'Q2',   type: 'input'  },
      { pin: 17, name: 'Q1',   type: 'input'  },
      { pin: 18, name: 'Q0',   type: 'input'  },
      { pin: 19, name: 'PGQ',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_PQ', inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','G'], outputs: ['PGQ'] },
    ],
  },

  // ── 74683: 8 bit magnitude comparator P>Q, OC (20-pin) ───────────────────
  /* Primary source: Texas Instruments, 74683 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls683.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x683': {
    name: '74x683',
    simpleName: '8 bit Magnitude Comparator (P>Q, OC)',
    description: '8-bit magnitude comparator, P>Q open-collector, 20kΩ pull-ups (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls683.pdf',
    tags: ['comparator', '8 bit', 'magnitude', 'P>Q', 'open collector'],
    guideOverview: 'The 74x683 is the open collector version of the 74x682. Same P>Q comparison with 20 kΩ Q-input pull ups and G enable, but PGQ output is open collector, allowing wire AND of multiple comparison chips. External pull up required on PGQ.',
    guidePinDescriptions: {
      'G':    'Global Enable (active LOW).',
      'P0':   'P word input bit 0.',
      'P1':   'P word input bit 1.',
      'P2':   'P word input bit 2.',
      'P3':   'P word input bit 3.',
      'P4':   'P word input bit 4.',
      'P5':   'P word input bit 5.',
      'P6':   'P word input bit 6.',
      'P7':   'P word input bit 7.',
      'GND':  'Ground reference (pin 10).',
      'Q7':   'Q word input bit 7 (pull up).',
      'Q6':   'Q word input bit 6.',
      'Q5':   'Q word input bit 5.',
      'Q4':   'Q word input bit 4.',
      'Q3':   'Q word input bit 3.',
      'Q2':   'Q word input bit 2.',
      'Q1':   'Q word input bit 1.',
      'Q0':   'Q word input bit 0 (pull up).',
      'PGQ':  'P Greater Than Q output (active LOW, open collector).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Wire AND Comparison',
        paragraphs: [
          'OC output enables wire AND: connect PGQ from multiple comparators together with a pull up; the combined output is LOW only when all comparators assert P>Q simultaneously. Useful for multi stage address range checks.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G',    type: 'input'  },
      { pin:  2, name: 'P0',   type: 'input'  },
      { pin:  3, name: 'P1',   type: 'input'  },
      { pin:  4, name: 'P2',   type: 'input'  },
      { pin:  5, name: 'P3',   type: 'input'  },
      { pin:  6, name: 'P4',   type: 'input'  },
      { pin:  7, name: 'P5',   type: 'input'  },
      { pin:  8, name: 'P6',   type: 'input'  },
      { pin:  9, name: 'P7',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'Q7',   type: 'input'  },
      { pin: 12, name: 'Q6',   type: 'input'  },
      { pin: 13, name: 'Q5',   type: 'input'  },
      { pin: 14, name: 'Q4',   type: 'input'  },
      { pin: 15, name: 'Q3',   type: 'input'  },
      { pin: 16, name: 'Q2',   type: 'input'  },
      { pin: 17, name: 'Q1',   type: 'input'  },
      { pin: 18, name: 'Q0',   type: 'input'  },
      { pin: 19, name: 'PGQ',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_PQ', inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','G'], outputs: ['PGQ'] },
    ],
  },

  // ── 74684: 8 bit magnitude/identity comparator, P>Q + P=Q (20-pin) ───────────
  /* Source: Texas Instruments, "SN54LS682, SN54LS684, SN54LS685, SN54LS687,
     SN54LS688, SN74LS682, SN74LS684 THRU SN74LS688 — 8-Bit Magnitude/Identity
     Comparators", doc D2617 (SDLS008), Jan. 1981, rev. Mar. 1988. [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls684.pdf. Verified as
     300-dpi PDF page images (issues.md C4 — NOT a text summary):
       - Terminal assignment, '682/'684/'685 J/DW/N 20-pin package (TOP VIEW, p.1),
         cross-checked against the '682/'684 logic symbol (p.2): pin 1 = P>Q output,
         2=P0, 3=Q0, 4=P1, 5=Q1, 6=P2, 7=Q2, 8=P3, 9=Q3, 10=GND, 11=P4, 12=Q4,
         13=P5, 14=Q5, 15=P6, 16=Q6, 17=P7, 18=Q7, 19 = P=Q output, 20=VCC.
       - Type table (p.1): '684 provides BOTH P=Q and P>Q, no output-enable,
         totem-pole outputs, no 20-kohm Q-input pull-ups.
       - Function table + description (p.2): both outputs active LOW — P=Q out LOW
         when the words are equal, P>Q out LOW when P>Q, both HIGH when P<Q. Note 2:
         a P<Q signal = NAND of the two outputs. Feature list (p.1): Schmitt-trigger
         hysteresis on all P and Q inputs.
     [1] Digital magnitude comparison (unsigned): Wikipedia, "Digital comparator".
         [Online]. Available: https://en.wikipedia.org/wiki/Digital_comparator.
     FIX (2026-07-04, issues.md C102): the prior hand-entered entry was wrong on
     nearly every count — it invented a G enable on pin 1 (the '684 has no enable;
     pin 1 is the P>Q output), grouped P0-P7 on 2-9 / Q on 11-18 (the real part
     interleaves P/Q, same class of bug as the '688 fix C95), placed a single "PGQ"
     output on pin 19 (pin 19 is P=Q), and omitted the P>Q output entirely. Pinout
     and gates corrected below. */
  '74x684': {
    name: '74x684',
    simpleName: '8 bit Magnitude Comparator (P>Q, P=Q)',
    description: '8-bit magnitude/identity comparator, active-LOW outs, totem-pole (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls684.pdf',
    tags: ['comparator', '8 bit', 'magnitude', 'identity', 'P>Q', 'P=Q'],
    guideOverview: 'The 74x684 compares two 8 bit numbers, P (P0-P7) and Q (Q0-Q7), and reports how they relate as plain unsigned values. It has two outputs, both active LOW: P>Q (pin 1) pulls LOW when P is the larger word, and P=Q (pin 19) pulls LOW when the two words are identical. If neither output is LOW, then P is smaller than Q. There is no separate P<Q pin, but you can make one by feeding both outputs into a NAND gate. Unlike the 74x682, the 684 has no pull up resistors on its Q inputs, so every P and Q line must be driven directly by a logic output. Unlike the 74x686 and 74x688, it has no enable pin, so the outputs always follow the inputs. The P and Q pins alternate down the package instead of being grouped, so check pin numbers carefully when wiring.',/* [1] */
    guidePinDescriptions: {
      'PGQ':  'P > Q output (active LOW): pulls LOW when word P is greater than word Q, otherwise HIGH. Pin 1.',
      'P0':   'P word input, bit 0 (least significant).',
      'P1':   'P word input, bit 1.',
      'P2':   'P word input, bit 2.',
      'P3':   'P word input, bit 3.',
      'P4':   'P word input, bit 4.',
      'P5':   'P word input, bit 5.',
      'P6':   'P word input, bit 6.',
      'P7':   'P word input, bit 7 (most significant).',
      'Q0':   'Q word input, bit 0 (least significant).',
      'Q1':   'Q word input, bit 1.',
      'Q2':   'Q word input, bit 2.',
      'Q3':   'Q word input, bit 3.',
      'Q4':   'Q word input, bit 4.',
      'Q5':   'Q word input, bit 5.',
      'Q6':   'Q word input, bit 6.',
      'Q7':   'Q word input, bit 7 (most significant).',
      'GND':  'Ground reference (pin 10).',
      'PEQQ': 'P = Q output (active LOW): pulls LOW when the two words are equal, otherwise HIGH. Pin 19.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'How it compares two words',
        paragraphs: [
          'A magnitude comparator takes two binary numbers and works out which is bigger, or whether they are equal. The 684 treats P and Q as plain 8 bit unsigned values (0 to 255) and compares them the way you would by hand: line the two numbers up, look at the most significant bit first (P7 against Q7), and work down until the bits differ. Whichever number has the first 1 where the other has a 0 is the larger one.',
          'The comparison is combinational there is no clock. The outputs simply settle to match whatever is on the inputs. The first number goes on P0-P7 and the second on Q0-Q7, with bit 0 the least significant and bit 7 the most significant.',
        ],
        formulas: [
          'P > Q  ->  PGQ = LOW,  PEQQ = HIGH',
          'P = Q  ->  PGQ = HIGH, PEQQ = LOW',
          'P < Q  ->  PGQ = HIGH, PEQQ = HIGH',
          '(both outputs are active LOW: a LOW output means its condition is true)',
        ],
      },
      {
        title: 'Reading the two outputs',
        paragraphs: [
          'Both outputs are active LOW, which is the part people read backwards. An output sitting at LOW (near 0 V) means its condition is TRUE. PGQ LOW means P is greater; PEQQ LOW means the two words match. At most one of them is LOW at any time.',
          'There is no dedicated "less than" pin. When P is smaller than Q, both outputs stay HIGH. To get an active LOW P<Q signal, feed PGQ and PEQQ into a 2 input NAND gate: its output is LOW only when both comparator outputs are HIGH, which is exactly the P<Q case.',
          'The outputs are totem pole (push-pull), so they drive both HIGH and LOW on their own and can wire straight into other logic. The 74x685 is the open-collector version of this same part, meant for wired-OR buses where several outputs share one line through a pull up resistor.',
        ],
      },
      {
        title: 'Where it is used',
        list: [
          'Address decoding: check whether an address bus is above, below, or inside a range to select a memory or I/O device.',
          'Threshold and limit detection: flag when a measured count or value crosses a preset number.',
          'Priority and sorting logic: decide which of two values wins.',
          'Replacing a stack of XOR and gate logic that would otherwise be needed to compare eight bit pairs by hand.',
          'Wider comparisons: two 684s plus a couple of gates compare 16 bit words (see the gotchas).',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'Active LOW outputs: LOW means the condition is true. Easy to read the wrong way round.',
          'Interleaved pinout: the P and Q inputs alternate down the package (P0 on pin 2, Q0 on pin 3, P1 on pin 4, Q1 on pin 5, and so on), and the two outputs sit on pins 1 and 19. Count pins carefully rather than assuming P and Q sit in tidy blocks.',
          'No enable pin. The outputs are always live and cannot be switched off or three-stated. If you need an enable, use the 74x686 (both outputs, dual enable) or the 74x688 (equality only, single enable).',
          'No pull up resistors. Every P and Q input must be driven by a real logic output; a floating input reads as a random level. The 74x682 adds 20 kohm pull ups on its Q inputs for reading DIP switches or open-collector buses the 684 does not.',
          'Unsigned only. The 684 compares numbers as unsigned 0 to 255. It does not understand two\'s complement signed numbers: a negative value has its top bit set and would read as a large positive number.',
          'Cascading needs external gates. There are no cascade inputs. For a 16 bit compare, use the high byte\'s P=Q result to decide whether the low byte\'s comparison matters, combined with a few gates.',
          'The real P and Q inputs have Schmitt-trigger hysteresis, which cleans up slow or slightly noisy edges. 74Sim treats them as ordinary logic inputs (a simplification), and models the outputs with no propagation delay a real LS684 chip takes on the order of tens of nanoseconds to settle.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'PGQ',  type: 'output' },
      { pin:  2, name: 'P0',   type: 'input'  },
      { pin:  3, name: 'Q0',   type: 'input'  },
      { pin:  4, name: 'P1',   type: 'input'  },
      { pin:  5, name: 'Q1',   type: 'input'  },
      { pin:  6, name: 'P2',   type: 'input'  },
      { pin:  7, name: 'Q2',   type: 'input'  },
      { pin:  8, name: 'P3',   type: 'input'  },
      { pin:  9, name: 'Q3',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'P4',   type: 'input'  },
      { pin: 12, name: 'Q4',   type: 'input'  },
      { pin: 13, name: 'P5',   type: 'input'  },
      { pin: 14, name: 'Q5',   type: 'input'  },
      { pin: 15, name: 'P6',   type: 'input'  },
      { pin: 16, name: 'Q6',   type: 'input'  },
      { pin: 17, name: 'P7',   type: 'input'  },
      { pin: 18, name: 'Q7',   type: 'input'  },
      { pin: 19, name: 'PEQQ', type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // The '684 has no enable pin and drives BOTH P>Q and P=Q (totem-pole). Reuse
      // the dual-output comparator primitive with its two active-LOW enables tied to
      // GND (LOW = permanently enabled); openCollector is not set, so both outputs
      // drive push-pull. Inputs are read by name, so the interleaved pinout above
      // does not change the logic. Output order matches the primitive: PGQ = P>Q
      // (pin 1), PEQQ = P=Q (pin 19).
      { type: 'COMPARATOR_8BIT_PQ_EN',
        inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','GND','GND'],
        outputs: ['PGQ','PEQQ'] },
    ],
  },

  // ── 74685: 8 bit magnitude comparator P>Q, OC (20-pin) ───────────────────
  /* Primary source: Texas Instruments, 74685 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls685.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x685': {
    name: '74x685',
    simpleName: '8 bit Magnitude Comparator (P>Q, OC)',
    description: '8 bit magnitude comparator with P>Q open collector output (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls685.pdf',
    tags: ['comparator', '8 bit', 'magnitude', 'P>Q', 'open collector'],
    guideOverview: 'The 74x685 is the open collector version of the 74x684. P>Q comparison without Q-input pull ups and with OC PGQ output. External pull up required on PGQ. The no pull up OC variant for direct drive systems.',
    guidePinDescriptions: {
      'G':    'Global Enable (active LOW).',
      'P0':   'P word input bit 0.',
      'P1':   'P word input bit 1.',
      'P2':   'P word input bit 2.',
      'P3':   'P word input bit 3.',
      'P4':   'P word input bit 4.',
      'P5':   'P word input bit 5.',
      'P6':   'P word input bit 6.',
      'P7':   'P word input bit 7.',
      'GND':  'Ground reference (pin 10).',
      'Q7':   'Q word input bit 7.',
      'Q6':   'Q word input bit 6.',
      'Q5':   'Q word input bit 5.',
      'Q4':   'Q word input bit 4.',
      'Q3':   'Q word input bit 3.',
      'Q2':   'Q word input bit 2.',
      'Q1':   'Q word input bit 1.',
      'Q0':   'Q word input bit 0.',
      'PGQ':  'P Greater Than Q output (active LOW, open collector).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x682 74x685 Family Summary',
        list: [
          '74x682: TRI, 20kΩ Q pull ups',
          '74x683: OC, 20kΩ Q pull ups',
          '74x684: TRI, no pull ups',
          '74x685: OC, no pull ups',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G',    type: 'input'  },
      { pin:  2, name: 'P0',   type: 'input'  },
      { pin:  3, name: 'P1',   type: 'input'  },
      { pin:  4, name: 'P2',   type: 'input'  },
      { pin:  5, name: 'P3',   type: 'input'  },
      { pin:  6, name: 'P4',   type: 'input'  },
      { pin:  7, name: 'P5',   type: 'input'  },
      { pin:  8, name: 'P6',   type: 'input'  },
      { pin:  9, name: 'P7',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'Q7',   type: 'input'  },
      { pin: 12, name: 'Q6',   type: 'input'  },
      { pin: 13, name: 'Q5',   type: 'input'  },
      { pin: 14, name: 'Q4',   type: 'input'  },
      { pin: 15, name: 'Q3',   type: 'input'  },
      { pin: 16, name: 'Q2',   type: 'input'  },
      { pin: 17, name: 'Q1',   type: 'input'  },
      { pin: 18, name: 'Q0',   type: 'input'  },
      { pin: 19, name: 'PGQ',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_PQ', inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','G'], outputs: ['PGQ'] },
    ],
  },

  // ── 74686: 8 bit magnitude comparator P>Q with enable, TRI (24-pin) ──────
  /* Primary source: Texas Instruments, 74686 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls686.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x686': {
    name: '74x686',
    simpleName: '8 bit Magnitude Comparator (P>Q, Enable)',
    description: '8 bit magnitude comparator with P>Q output and enable (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls686.pdf',
    tags: ['comparator', '8 bit', 'magnitude', 'P>Q', 'enable', 'tri state'],
    guideOverview: 'The 74x686 is a 24-pin 8 bit comparator providing both P>Q (PGQ) and P=Q (PEQQ) outputs with dual enable pins G1 and G2. Useful when both magnitude and equality decisions are needed simultaneously for example, address decoding with range checking.',
    guidePinDescriptions: {
      'G1':   'Enable input 1 (active LOW).',
      'G2':   'Enable input 2 (active LOW).',
      'P0':   'P word input bit 0.',
      'P1':   'P word input bit 1.',
      'P2':   'P word input bit 2.',
      'P3':   'P word input bit 3.',
      'P4':   'P word input bit 4.',
      'P5':   'P word input bit 5.',
      'P6':   'P word input bit 6.',
      'P7':   'P word input bit 7.',
      'NC1':  'No connect.',
      'GND':  'Ground reference (pin 12).',
      'Q7':   'Q word input bit 7.',
      'Q6':   'Q word input bit 6.',
      'Q5':   'Q word input bit 5.',
      'Q4':   'Q word input bit 4.',
      'Q3':   'Q word input bit 3.',
      'Q2':   'Q word input bit 2.',
      'Q1':   'Q word input bit 1.',
      'Q0':   'Q word input bit 0.',
      'NC2':  'No connect.',
      'PGQ':  'P Greater Than Q output (active LOW).',
      'PEQQ': 'P Equal Q output (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Dual Output Comparator',
        paragraphs: [
          'By providing both PGQ and PEQQ, the 74x686 covers greater than, equal, and (by deduction) less than without external logic. Dual enables allow use in shared bus and cascaded configurations.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1',   type: 'input'  },
      { pin:  2, name: 'G2',   type: 'input'  },
      { pin:  3, name: 'P0',   type: 'input'  },
      { pin:  4, name: 'P1',   type: 'input'  },
      { pin:  5, name: 'P2',   type: 'input'  },
      { pin:  6, name: 'P3',   type: 'input'  },
      { pin:  7, name: 'P4',   type: 'input'  },
      { pin:  8, name: 'P5',   type: 'input'  },
      { pin:  9, name: 'P6',   type: 'input'  },
      { pin: 10, name: 'P7',   type: 'input'  },
      { pin: 11, name: 'NC1',  type: 'nc'     },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'Q7',   type: 'input'  },
      { pin: 14, name: 'Q6',   type: 'input'  },
      { pin: 15, name: 'Q5',   type: 'input'  },
      { pin: 16, name: 'Q4',   type: 'input'  },
      { pin: 17, name: 'Q3',   type: 'input'  },
      { pin: 18, name: 'Q2',   type: 'input'  },
      { pin: 19, name: 'Q1',   type: 'input'  },
      { pin: 20, name: 'Q0',   type: 'input'  },
      { pin: 21, name: 'NC2',  type: 'nc'     },
      { pin: 22, name: 'PGQ',  type: 'output' },
      { pin: 23, name: 'PEQQ', type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_PQ_EN', inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','G1','G2'], outputs: ['PGQ','PEQQ'] },
    ],
  },

  // ── 74687: 8 bit magnitude comparator P>Q with enable, OC (24-pin) ───────
  /* Primary source: Texas Instruments, 74687 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls687.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x687': {
    name: '74x687',
    simpleName: '8 bit Magnitude Comparator (P>Q, Enable, OC)',
    description: '8-bit magnitude comparator, P>Q, enable, open-collector out (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls687.pdf',
    tags: ['comparator', '8 bit', 'magnitude', 'P>Q', 'enable', 'open collector'],
    guideOverview: 'The 74x687 is the open collector version of the 74x686: 8 bit magnitude comparator with PGQ and PEQQ outputs and G1/G2 enables. Both outputs are OC, allowing wire AND when multiple chips share the same output lines.',
    guidePinDescriptions: {
      'G1':   'Enable input 1 (active LOW).',
      'G2':   'Enable input 2 (active LOW).',
      'P0':   'P word input bit 0.',
      'P1':   'P word input bit 1.',
      'P2':   'P word input bit 2.',
      'P3':   'P word input bit 3.',
      'P4':   'P word input bit 4.',
      'P5':   'P word input bit 5.',
      'P6':   'P word input bit 6.',
      'P7':   'P word input bit 7.',
      'NC1':  'No connect.',
      'GND':  'Ground reference (pin 12).',
      'Q7':   'Q word input bit 7.',
      'Q6':   'Q word input bit 6.',
      'Q5':   'Q word input bit 5.',
      'Q4':   'Q word input bit 4.',
      'Q3':   'Q word input bit 3.',
      'Q2':   'Q word input bit 2.',
      'Q1':   'Q word input bit 1.',
      'Q0':   'Q word input bit 0.',
      'NC2':  'No connect.',
      'PGQ':  'P Greater Than Q output (active LOW, open collector).',
      'PEQQ': 'P Equal Q output (active LOW, open collector).',
      'VCC':  'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'OC Dual Output',
        paragraphs: [
          'Wire AND both PGQ and PEQQ across multiple chips for multi chip comparison: all connected comparators must agree before the shared output asserts.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1',   type: 'input'  },
      { pin:  2, name: 'G2',   type: 'input'  },
      { pin:  3, name: 'P0',   type: 'input'  },
      { pin:  4, name: 'P1',   type: 'input'  },
      { pin:  5, name: 'P2',   type: 'input'  },
      { pin:  6, name: 'P3',   type: 'input'  },
      { pin:  7, name: 'P4',   type: 'input'  },
      { pin:  8, name: 'P5',   type: 'input'  },
      { pin:  9, name: 'P6',   type: 'input'  },
      { pin: 10, name: 'P7',   type: 'input'  },
      { pin: 11, name: 'NC1',  type: 'nc'     },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'Q7',   type: 'input'  },
      { pin: 14, name: 'Q6',   type: 'input'  },
      { pin: 15, name: 'Q5',   type: 'input'  },
      { pin: 16, name: 'Q4',   type: 'input'  },
      { pin: 17, name: 'Q3',   type: 'input'  },
      { pin: 18, name: 'Q2',   type: 'input'  },
      { pin: 19, name: 'Q1',   type: 'input'  },
      { pin: 20, name: 'Q0',   type: 'input'  },
      { pin: 21, name: 'NC2',  type: 'nc'     },
      { pin: 22, name: 'PGQ',  type: 'output' },
      { pin: 23, name: 'PEQQ', type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_PQ_EN', inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','G1','G2'], outputs: ['PGQ','PEQQ'] },
    ],
  },

  // ── 74688: 8 bit identity comparator, P==Q with enable (20-pin) ──────────
  /* [1] Texas Instruments, "SN54LS682, SN54LS684, SN54LS685, SN54LS687, SN54LS688,
         SN74LS682, SN74LS684 thru SN74LS688 8-Bit Magnitude/Identity Comparators,"
         doc SDLS008 / D2617 (Jan. 1981, rev. Mar. 1988). [Online]. Available:
         https://www.ti.com/lit/ds/symlink/sn74ls688.pdf. Verified: the 'LS688
         terminal assignment (SN74LS688 DW/N package, top view), cross-checked
         against the 'LS688 logic symbol and the family function table, pages 1-2,
         read as 300-dpi rendered PDF page images (per issues.md C4 — NOT a text
         summarizer). Confirms the P and Q inputs INTERLEAVE down the package:
         G=1; P0=2,Q0=3,P1=4,Q1=5,P2=6,Q2=7,P3=8,Q3=9; GND=10; P4=11,Q4=12,
         P5=13,Q5=14,P6=15,Q6=16,P7=17,Q7=18; P=Q(out)=19; VCC=20. Also confirms
         'LS688 has the equality (P=Q) output ONLY (no P>Q), a single active-LOW
         enable /G, totem-pole outputs (its sibling 'LS689 is open-collector),
         and input hysteresis. The prior hand-entered pinout was WRONG: it grouped
         P0-P7 on pins 2-9 and Q7-Q0 on pins 11-18 (a C2-class invented pinout).
         Corrected 2026-07-04; see issues.md C95 and
         js/debug/scenarios/74x688-identity-comparator.mjs.
     [2] Address-decode / chip-select use is the standard TTL comparator
         application; see also Wikipedia contributors, "Digital comparator,"
         https://en.wikipedia.org/wiki/Digital_comparator. */
  '74x688': {
    name: '74x688',
    simpleName: '8 bit Identity Comparator',
    description: '8-bit identity comparator, active-LOW P=Q output & enable (20-pin)',/* [1] */
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls688.pdf',
    tags: ['comparator', '8 bit', 'equality', 'identity'],
    guideOverview: 'The 74x688 compares two 8 bit words, P (P0-P7) and Q (Q0-Q7), and reports whether they are exactly equal. Its single output, P=Q, goes LOW when every bit of P matches the matching bit of Q and the enable G is LOW; otherwise it stays HIGH. It tests equality only, with no greater-than or less-than output, and that is what separates an identity comparator from a full magnitude comparator. The classic use is address decoding: feed the address bus into P, fix Q to a chosen address, and P=Q drops LOW to select a device whenever the bus lands on that address. Two things trip people up: both the output and the enable are active LOW, and the P and Q pins are interleaved along the package (P0, Q0, P1, Q1, and so on) rather than grouped, so check the pinout before wiring.',/* [1][2] */
    guidePinDescriptions: {
      'G':    'Enable, active LOW (pin 1). The P=Q output only responds while G is LOW; hold G HIGH and the output is forced HIGH no matter what P and Q are.',
      'P0':   'P word input, bit 0 (pin 2).',
      'Q0':   'Q word input, bit 0 (pin 3).',
      'P1':   'P word input, bit 1 (pin 4).',
      'Q1':   'Q word input, bit 1 (pin 5).',
      'P2':   'P word input, bit 2 (pin 6).',
      'Q2':   'Q word input, bit 2 (pin 7).',
      'P3':   'P word input, bit 3 (pin 8).',
      'Q3':   'Q word input, bit 3 (pin 9).',
      'GND':  'Ground reference (pin 10).',
      'P4':   'P word input, bit 4 (pin 11).',
      'Q4':   'Q word input, bit 4 (pin 12).',
      'P5':   'P word input, bit 5 (pin 13).',
      'Q5':   'Q word input, bit 5 (pin 14).',
      'P6':   'P word input, bit 6 (pin 15).',
      'Q6':   'Q word input, bit 6 (pin 16).',
      'P7':   'P word input, bit 7 (pin 17).',
      'Q7':   'Q word input, bit 7 (pin 18).',
      'PEQQ': 'P=Q output, active LOW (pin 19). Goes LOW only when P equals Q and G is LOW; HIGH otherwise. Totem-pole output, so it needs no pull-up resistor.',
      'VCC':  'Positive supply (+5 V) at pin 20.',
    },
    guideSections: [
      {
        title: 'How the comparison works',
        paragraphs: [
          'Inside, the chip compares P and Q one bit at a time: P0 against Q0, P1 against Q1, and so on up to P7 against Q7. A pair "agrees" when both bits are the same, both HIGH or both LOW. Only when all eight pairs agree does the chip call the two words equal.',
          'The result appears on a single output, P=Q, and it is active LOW: a match pulls the output down to LOW (0 V), while any mismatch leaves it HIGH. This is the opposite of what many people expect, so it is worth saying twice: LOW means equal.',
          'The enable G gates the whole thing. While G is LOW the output reflects the comparison. Take G HIGH and the output is forced HIGH regardless of P and Q, which lets you switch a comparator off or stack several of them (more on that below).',
        ],
        formulas: [
          'P=Q is LOW  only when  G = LOW  AND  P0..P7 equals Q0..Q7',
          'G=LOW,  P equals Q     -> P=Q = LOW',
          'G=LOW,  P not equal Q  -> P=Q = HIGH',
          'G=HIGH, anything       -> P=Q = HIGH',
        ],
      },
      {
        title: 'Address decoding, the classic use',
        paragraphs: [
          'The most common job for a 74x688 is deciding when an address bus is pointing at a particular device. Wire the address lines to P0-P7 and set Q0-Q7 to the address you want to detect, using pull-up and pull-down resistors or a DIP switch. When the bus matches your fixed pattern, P=Q goes LOW and can drive a chip-select input, which is also usually active LOW.',
          'The enable G is handy here: drive it from higher address bits decoded elsewhere, so the comparator only reports a match inside the memory region you care about.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Address decoding and chip-select generation in CPU and memory systems.',
          'Comparing a bus against a fixed address set on a DIP switch. The input hysteresis makes the chip tolerant of the slow, bouncy edges a mechanical switch produces.',
          'Checking whether two 8 bit data buses carry the same value.',
          'Widening the comparison: use the open-collector 74x689 instead, tie several P=Q outputs together through one pull-up, and the shared line is LOW only when every chip sees a match (a wired-AND).',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'The output is active LOW. A match gives you LOW, not HIGH.',
          'The enable G is active LOW too. Tie it to ground if you always want the comparison live; leave it HIGH and the output sits HIGH forever.',
          'The P and Q pins interleave down the package: P0=2, Q0=3, P1=4, Q1=5, and after GND, P4=11, Q4=12, and so on. They are not two tidy groups, and this is the easiest place to miswire the chip.',
          'It reports equality only; there is no greater-than or less-than output. For magnitude you need a full comparator such as the 74x682 or 74x684 (which add a P>Q output), or the 4 bit 74x85.',
          'The 74x688 has totem-pole outputs and drives the line itself. Its sibling 74x689 is the open-collector version and needs an external pull-up resistor.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G',    type: 'input'  },
      { pin:  2, name: 'P0',   type: 'input'  },
      { pin:  3, name: 'Q0',   type: 'input'  },
      { pin:  4, name: 'P1',   type: 'input'  },
      { pin:  5, name: 'Q1',   type: 'input'  },
      { pin:  6, name: 'P2',   type: 'input'  },
      { pin:  7, name: 'Q2',   type: 'input'  },
      { pin:  8, name: 'P3',   type: 'input'  },
      { pin:  9, name: 'Q3',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'P4',   type: 'input'  },
      { pin: 12, name: 'Q4',   type: 'input'  },
      { pin: 13, name: 'P5',   type: 'input'  },
      { pin: 14, name: 'Q5',   type: 'input'  },
      { pin: 15, name: 'P6',   type: 'input'  },
      { pin: 16, name: 'Q6',   type: 'input'  },
      { pin: 17, name: 'P7',   type: 'input'  },
      { pin: 18, name: 'Q7',   type: 'input'  },
      { pin: 19, name: 'PEQQ', type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_EQ', inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','G'], outputs: ['PEQQ'] },
    ],
  },

  // ── 74689: 8 bit magnitude comparator P==Q with enable, OC (20-pin) ──────
  /* Primary source: Texas Instruments, 74689 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls689.pdf
     https://en.wikipedia.org/wiki/Digital_comparator */
  '74x689': {
    name: '74x689',
    simpleName: '8 bit Identity Comparator (OC)',
    description: '8-bit magnitude comparator, P=Q open-collector out, enable (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls689.pdf',
    tags: ['comparator', '8 bit', 'equality', 'identity', 'open collector'],
    guideOverview: 'The 74x689 is the open collector version of the 74x688. Same 8 bit equality comparison with G enable and active LOW PEQQ output. The OC output allows wire AND: connect multiple 74x689s sharing PEQQ to implement an N×8 bit comparison where all sections must agree.',
    guidePinDescriptions: {
      'G':    'Global Enable (active LOW).',
      'P0':   'P word input bit 0.',
      'P1':   'P word input bit 1.',
      'P2':   'P word input bit 2.',
      'P3':   'P word input bit 3.',
      'P4':   'P word input bit 4.',
      'P5':   'P word input bit 5.',
      'P6':   'P word input bit 6.',
      'P7':   'P word input bit 7.',
      'GND':  'Ground reference (pin 10).',
      'Q7':   'Q reference input bit 7.',
      'Q6':   'Q reference input bit 6.',
      'Q5':   'Q reference input bit 5.',
      'Q4':   'Q reference input bit 4.',
      'Q3':   'Q reference input bit 3.',
      'Q2':   'Q reference input bit 2.',
      'Q1':   'Q reference input bit 1.',
      'Q0':   'Q reference input bit 0.',
      'PEQQ': 'P Equal Q output (active LOW, open collector).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '16 bit Equality from Two 74x689s',
        paragraphs: [
          'Wire the PEQQ pins of two 74x689s together with a pull up resistor. The result is LOW only when both byte comparisons match implementing a 16 bit address compare without a cascading input pin.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G',    type: 'input'  },
      { pin:  2, name: 'P0',   type: 'input'  },
      { pin:  3, name: 'P1',   type: 'input'  },
      { pin:  4, name: 'P2',   type: 'input'  },
      { pin:  5, name: 'P3',   type: 'input'  },
      { pin:  6, name: 'P4',   type: 'input'  },
      { pin:  7, name: 'P5',   type: 'input'  },
      { pin:  8, name: 'P6',   type: 'input'  },
      { pin:  9, name: 'P7',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'Q7',   type: 'input'  },
      { pin: 12, name: 'Q6',   type: 'input'  },
      { pin: 13, name: 'Q5',   type: 'input'  },
      { pin: 14, name: 'Q4',   type: 'input'  },
      { pin: 15, name: 'Q3',   type: 'input'  },
      { pin: 16, name: 'Q2',   type: 'input'  },
      { pin: 17, name: 'Q1',   type: 'input'  },
      { pin: 18, name: 'Q0',   type: 'input'  },
      { pin: 19, name: 'PEQQ',type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_EQ', inputs: ['P0','P1','P2','P3','P4','P5','P6','P7','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','G'], outputs: ['PEQQ'] },
    ],
  },

  // ── 74690: 4 bit BCD counter + output register + multiplexed 3-state outs ──
  // Source: Texas Instruments, "SN54LS690..SN54LS693, SN74LS690..SN74LS693 —
  //   Synchronous Counters with Output Registers and Multiplexed 3-State
  //   Outputs", doc D2423, Jan 1981 (rev. Mar 1988), in "The TTL Logic Data
  //   Book" (1988), pp. 2-1139..2-1146. [Online]. Available (bitsavers):
  //   http://www.bitsavers.org/components/ti/_dataBooks/1988_TI_Standard_TTL_Logic_Data_Book.pdf
  //   Verified: DIP-20 terminal assignment (J/N package, top view), the
  //   "description" text, the '690 positive-logic logic diagram, and the
  //   recommended-operating-conditions + switching-characteristics tables —
  //   read as 300-dpi rendered PDF page images (issues.md C4).
  // PINOUT FIX (issues.md C2): the pre-existing stub map
  //   (CLK/CLR/D0-D3/LE/S/OEn/ENT/ENP/LOAD/UD on pins 1-19) was hand-entered and
  //   WRONG — it invented 74160/161-style up/down signals the '690 does not have.
  //   Replaced with the real CCLR/CCK/A-D/ENP/RCLR/RCK + R/C/G/LOAD/ENT/QA-QD/RCO
  //   assignment read off the datasheet pinout image above.
  // Engine: drives the new COUNTER_REG_MUX_TRI primitive (mod:10 = decade). The
  //   shared COUNTER_LATCH_MUX_STUB used by the 691/692/693/696/697 sibling stubs
  //   is intentionally left untouched.
  '74x690': {
    name: '74x690',
    simpleName: '4 bit BCD Counter/Latch/Mux (Async CLR)',
    description: '4-bit sync BCD counter, 4-bit reg, 2:1 mux to 3-state out (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls690.pdf',
    tags: ['counter', 'bcd', 'decade', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x690 packs three blocks into one 20-pin chip: a synchronous BCD counter that counts 0-9, a 4 bit register that can snapshot the count, and a multiplexer that picks which of the two drives the output pins. The counter and the register each have their own clock and their own clear, so you can freeze a reading in the register while the counter keeps running. R/C selects what appears on QA-QD: the live counter when LOW, the stored register when HIGH. The Q outputs are 3-state, switched on and off by G.',
    guidePinDescriptions: {
      'CCLR': 'Counter Clear (active LOW, asynchronous). Forces the counter to 0 at once, no clock needed.',
      'CCK':  'Counter Clock. The counter acts on the rising edge.',
      'A':    'Parallel data input, bit 0 (least significant). Loaded into the counter on a CCK rising edge while LOAD is LOW.',
      'B':    'Parallel data input, bit 1.',
      'C':    'Parallel data input, bit 2.',
      'D':    'Parallel data input, bit 3 (most significant).',
      'ENP':  'Count Enable P (active HIGH). Counting needs both ENP and ENT HIGH.',
      'RCLR': 'Register Clear (active LOW, asynchronous). Forces the register to 0 at once.',
      'RCK':  'Register Clock. On the rising edge the register snapshots the current count.',
      'GND':  'Ground (pin 10).',
      'R/C':  'Register/Counter select. LOW shows the live counter on QA-QD; HIGH shows the stored register.',
      'G':    'Output Enable (active LOW). LOW drives QA-QD; HIGH puts them in high impedance (off the bus).',
      'LOAD': 'Parallel Load (active LOW). With LOAD LOW, the next CCK rising edge loads A-D into the counter instead of counting.',
      'ENT':  'Count Enable T (active HIGH). Also gates the ripple carry output.',
      'QD':   'Multiplexed 3-state output, bit 3.',
      'QC':   'Multiplexed 3-state output, bit 2.',
      'QB':   'Multiplexed 3-state output, bit 1.',
      'QA':   'Multiplexed 3-state output, bit 0.',
      'RCO':  'Ripple Carry Output. Goes HIGH at the top count (9) while ENT is HIGH; feed it to the next stage to cascade.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Three blocks in one',
        paragraphs: [
          'The counter, the register, and the multiplexer sit in series. The counter increments on CCK. Its four bits feed both the register and one side of the multiplexer. On a rising RCK edge the register copies whatever the counter holds at that moment. The multiplexer, set by R/C, then drives the output pins from either the live counter or the frozen register.',
          'Because the two clocks are separate, you can let the counter free-run while the register holds a steady value for a display or a bus read. If you tie CCK and RCK together, the register just lags the counter by one clock.',
        ],
      },
      {
        title: 'Counting, loading, and cascading',
        paragraphs: [
          'Counting happens on a CCK rising edge only when ENP and ENT are both HIGH and LOAD is HIGH. Pull LOAD LOW and the next CCK edge loads A-D into the counter instead. CCLR LOW clears the counter at any time, no clock needed.',
          'The 74x690 counts BCD, so it rolls over 9 to 0. RCO goes HIGH at 9 (while ENT is HIGH); wire it to the ENT of the next chip to chain stages into a longer count.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CCLR', type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'RCLR', type: 'input'  },
      { pin:  9, name: 'RCK',  type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'R/C',  type: 'input'  },
      { pin: 12, name: 'G',    type: 'input'  },
      { pin: 13, name: 'LOAD', type: 'input'  },
      { pin: 14, name: 'ENT',  type: 'input'  },
      { pin: 15, name: 'QD',   type: 'output' },
      { pin: 16, name: 'QC',   type: 'output' },
      { pin: 17, name: 'QB',   type: 'output' },
      { pin: 18, name: 'QA',   type: 'output' },
      { pin: 19, name: 'RCO',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_REG_MUX_TRI', mod: 10,
        inputs: ['CCLR','CCK','A','B','C','D','ENP','ENT','RCLR','RCK','LOAD','G','R/C'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },

  // ── 74691: 4 bit binary counter/register/mux, async CLR, 3-state (20-pin) ──
  // The binary sibling of the 74x690: same package and pinout, counting modulus
  //   16 instead of 10, clear still asynchronous. Drives the shared
  //   COUNTER_REG_MUX_TRI primitive (the 690 author built it for the whole
  //   '690/'691/'693 family) with gate.mod:16.
  // PITFALL FIXED (issues.md C2): the original stub's hand-entered pinout was
  //   fabricated — it invented CLK/CLR/LE/S/OEn/UD/D0-D3 signals the '691 does
  //   not have. Replaced with the real CCLR/CCK/A-D/ENP/RCLR/RCK/R-C/G/LOAD/ENT/
  //   QA-QD/RCO assignment read off the datasheet TOP VIEW package diagram.
  // Source: Texas Instruments, "SN54LS690..693, SN74LS690..693 Synchronous
  //   Counters With Output Registers and Multiplexed 3-State Outputs", document
  //   D2423 (Jan 1981, rev. Mar 1988), in "1988 TI Standard TTL Logic Data Book"
  //   pp. 2-1139..2-1142. [Online]. Available:
  //   https://www.bitsavers.org/components/ti/_dataBooks/1988_TI_Standard_TTL_Logic_Data_Book.pdf
  //   Verified: terminal-assignment diagram (J/DW/N package, TOP VIEW, shared by
  //   '690/'691/'693) read as a 400-dpi rendered PDF page image — 1=CCLR 2=CCK
  //   3=A 4=B 5=C 6=D 7=ENP 8=RCLR 9=RCK 10=GND 11=R/C 12=G 13=LOAD 14=ENT 15=QD
  //   16=QC 17=QB 18=QA 19=RCO 20=VCC; plus the page-1 description confirming
  //   "'LS691 ... Binary Counter, Direct [asynchronous] Clear", separate
  //   counter/register clocks and clears, R/C output select, and RCO for cascade.
  //   The TI symlink PDF (sn74ls691.pdf) 404s for this obsolete part (issues.md
  //   C4), so the bitsavers data-book scan was used.
  '74x691': {
    name: '74x691',
    simpleName: '4 bit Binary Counter/Register/Mux (Async CLR)',
    description: '4-bit sync binary counter, 4-bit reg, 2:1 mux to 3-state out (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls691.pdf',
    tags: ['counter', 'binary', '4 bit', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x691 is the binary version of the 74x690. It packs three blocks into one 20-pin chip: a synchronous binary counter that counts 0-15, a 4 bit register that can snapshot the count, and a multiplexer that picks which of the two drives the output pins. The counter and the register each have their own clock and their own clear, so you can freeze a reading in the register while the counter keeps running. R/C selects what appears on QA-QD: the live counter when LOW, the stored register when HIGH. The Q outputs are 3-state, switched on and off by G.',
    guidePinDescriptions: {
      'CCLR': 'Counter Clear (active LOW, asynchronous). Forces the counter to 0 at once, no clock needed.',
      'CCK':  'Counter Clock. The counter acts on the rising edge.',
      'A':    'Parallel data input, bit 0 (least significant). Loaded into the counter on a CCK rising edge while LOAD is LOW.',
      'B':    'Parallel data input, bit 1.',
      'C':    'Parallel data input, bit 2.',
      'D':    'Parallel data input, bit 3 (most significant).',
      'ENP':  'Count Enable P (active HIGH). Counting needs both ENP and ENT HIGH.',
      'RCLR': 'Register Clear (active LOW, asynchronous). Forces the register to 0 at once.',
      'RCK':  'Register Clock. On the rising edge the register snapshots the current count.',
      'GND':  'Ground (pin 10).',
      'R/C':  'Register/Counter select. LOW shows the live counter on QA-QD; HIGH shows the stored register.',
      'G':    'Output Enable (active LOW). LOW drives QA-QD; HIGH puts them in high impedance (off the bus).',
      'LOAD': 'Parallel Load (active LOW). With LOAD LOW, the next CCK rising edge loads A-D into the counter instead of counting.',
      'ENT':  'Count Enable T (active HIGH). Also gates the ripple carry output.',
      'QD':   'Multiplexed 3-state output, bit 3.',
      'QC':   'Multiplexed 3-state output, bit 2.',
      'QB':   'Multiplexed 3-state output, bit 1.',
      'QA':   'Multiplexed 3-state output, bit 0.',
      'RCO':  'Ripple Carry Output. Goes HIGH at the top count (15) while ENT is HIGH; feed it to the next stage to cascade.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Three blocks in one',
        paragraphs: [
          'The counter, the register, and the multiplexer sit in series. The counter increments on CCK. Its four bits feed both the register and one side of the multiplexer. On a rising RCK edge the register copies whatever the counter holds at that moment. The multiplexer, set by R/C, then drives the output pins from either the live counter or the frozen register.',
          'Because the two clocks are separate, you can let the counter free-run while the register holds a steady value for a display or a bus read. If you tie CCK and RCK together, the register just lags the counter by one clock.',
        ],
      },
      {
        title: '74x690 vs 74x691',
        paragraphs: [
          'Same package, same pinout, same three blocks. The 74x690 counts BCD and rolls over 9 to 0; the 74x691 counts in 4 bit binary and rolls over 15 to 0. RCO goes HIGH at the top count (9 on the 690, 15 on the 691) while ENT is HIGH; wire it to the ENT of the next chip to chain stages into a longer count. Both clear the counter asynchronously the moment CCLR goes LOW; the 74x693 is the binary part with a synchronous clear instead.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CCLR', type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'RCLR', type: 'input'  },
      { pin:  9, name: 'RCK',  type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'R/C',  type: 'input'  },
      { pin: 12, name: 'G',    type: 'input'  },
      { pin: 13, name: 'LOAD', type: 'input'  },
      { pin: 14, name: 'ENT',  type: 'input'  },
      { pin: 15, name: 'QD',   type: 'output' },
      { pin: 16, name: 'QC',   type: 'output' },
      { pin: 17, name: 'QB',   type: 'output' },
      { pin: 18, name: 'QA',   type: 'output' },
      { pin: 19, name: 'RCO',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_REG_MUX_TRI', mod: 16,
        inputs: ['CCLR','CCK','A','B','C','D','ENP','ENT','RCLR','RCK','LOAD','G','R/C'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },

  // ── 74692: 4 bit decade counter/register/mux, SYNCHRONOUS clear, 3-state (20-pin) ──
  // The '690-'693 are one family sharing a single connection diagram; only two
  // things vary across them: decade vs binary count, and asynchronous vs
  // synchronous counter clear. The '692 = decade ('690 core) + synchronous CCLR.
  // Engine: reuses the COUNTER_REG_MUX_TRI primitive already driving the '690,
  //   with mod:10 (decade) and syncClear:true (CCLR gated to the CCK edge,
  //   '163-style: clear dominates load and count, independent of the enables).
  //
  // PINOUT NOTE: the prior hand-entered stub pinout (CLK/CLR/D0-D3/LE/S/OEn/
  //   Q0-Q3/ENT/ENP/LOAD/UD) was invented and wrong — it even carried an UP/DOWN
  //   pin this family does not have (up/down is the separate '696-'699). Replaced
  //   with the real '690-family terminal assignment. See issues.md C2 lesson.
  //
  // Source: Texas Instruments, "SN54LS690..SN54LS693, SN74LS690..SN74LS693
  //   Synchronous 4-Bit Counters/Latches/Multiplexers With 3-State Outputs," doc
  //   D2423, in The TTL Logic Data Book, 1988, pp. 2-1139..2-1146. This single
  //   datasheet documents all four parts on one connection diagram; it was read
  //   as rendered PDF page images (issues.md C4) to build the verified sibling
  //   74x690 entry above, whose pinout this entry shares pin-for-pin. The only
  //   '690->'692 delta per that datasheet's function table is synchronous CCLR.
  //   A standalone SN74LS692 PDF could not be retrieved for an independent re-read
  //   (TI ti.com/lit/...sn74ls692.pdf now 404s the obsolete part; alldatasheet/
  //   octopart/datasheetspdf are JS/access-walled; the 1987 National LS/S TTL
  //   Databook on bitsavers does not carry the '690 series).
  //   [Online]. Available: https://www.ti.com/product/SN74LS692 (product page).
  // Corroboration (secondary, for the pin semantics CCLR/CCK/RCK/R-C/3-state):
  //   National/Fairchild DM74LS690 family product summaries, web search, June 2026.
  '74x692': {
    name: '74x692',
    simpleName: '4 bit BCD Counter/Latch/Mux (Sync CLR)',
    description: '4-bit sync BCD counter, reg, 2:1 mux, 3-state out, sync clear (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls690.pdf',
    tags: ['counter', 'bcd', 'decade', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x692 is the same chip as the 74x690 with one change: the counter clear is synchronous instead of asynchronous. It still holds three blocks in one 20-pin package — a synchronous BCD counter that counts 0-9, a 4 bit register that can snapshot the count, and a multiplexer that picks which of the two drives the output pins. CCLR LOW does not clear right away; the counter clears on the next CCK rising edge, so the reset lines up with the clock instead of cutting in between edges. R/C selects what appears on QA-QD: the live counter when LOW, the stored register when HIGH. The Q outputs are 3-state, switched on and off by G.',
    guidePinDescriptions: {
      'CCLR': 'Counter Clear (active LOW, synchronous). Pulling it LOW arms a clear; the counter goes to 0 on the next CCK rising edge. A clear overrides load and count.',
      'CCK':  'Counter Clock. The counter acts on the rising edge.',
      'A':    'Parallel data input, bit 0 (least significant). Loaded into the counter on a CCK rising edge while LOAD is LOW.',
      'B':    'Parallel data input, bit 1.',
      'C':    'Parallel data input, bit 2.',
      'D':    'Parallel data input, bit 3 (most significant).',
      'ENP':  'Count Enable P (active HIGH). Counting needs both ENP and ENT HIGH.',
      'RCLR': 'Register Clear (active LOW, asynchronous). Forces the register to 0 at once.',
      'RCK':  'Register Clock. On the rising edge the register snapshots the current count.',
      'GND':  'Ground (pin 10).',
      'R/C':  'Register/Counter select. LOW shows the live counter on QA-QD; HIGH shows the stored register.',
      'G':    'Output Enable (active LOW). LOW drives QA-QD; HIGH puts them in high impedance (off the bus).',
      'LOAD': 'Parallel Load (active LOW). With LOAD LOW, the next CCK rising edge loads A-D into the counter instead of counting.',
      'ENT':  'Count Enable T (active HIGH). Also gates the ripple carry output.',
      'QD':   'Multiplexed 3-state output, bit 3.',
      'QC':   'Multiplexed 3-state output, bit 2.',
      'QB':   'Multiplexed 3-state output, bit 1.',
      'QA':   'Multiplexed 3-state output, bit 0.',
      'RCO':  'Ripple Carry Output. Goes HIGH at the top count (9) while ENT is HIGH; feed it to the next stage to cascade.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Synchronous vs asynchronous clear',
        paragraphs: [
          'On the 74x690 the counter clear is asynchronous: pull CCLR LOW and the count drops to 0 the instant the signal arrives, with no clock involved. On the 74x692 the same pin is synchronous: pulling CCLR LOW arms the clear, and the count only goes to 0 on the next CCK rising edge.',
          'Synchronous clear keeps the reset tied to the clock. The counter never changes between edges, so a glitch on CCLR cannot drop a stray value onto the outputs the way it can with an asynchronous clear. The trade-off is that the clear needs a clock edge to take effect — with no CCK pulse, CCLR LOW does nothing.',
          'A clear outranks both loading and counting: if CCLR is LOW at a CCK edge, the counter goes to 0 regardless of LOAD or the ENP/ENT enables.',
        ],
      },
      {
        title: '74x690-74x693 family',
        list: [
          '74x690: BCD (0-9), asynchronous clear',
          '74x691: binary (0-15), asynchronous clear',
          '74x692: BCD (0-9), synchronous clear',
          '74x693: binary (0-15), synchronous clear',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CCLR', type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'RCLR', type: 'input'  },
      { pin:  9, name: 'RCK',  type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'R/C',  type: 'input'  },
      { pin: 12, name: 'G',    type: 'input'  },
      { pin: 13, name: 'LOAD', type: 'input'  },
      { pin: 14, name: 'ENT',  type: 'input'  },
      { pin: 15, name: 'QD',   type: 'output' },
      { pin: 16, name: 'QC',   type: 'output' },
      { pin: 17, name: 'QB',   type: 'output' },
      { pin: 18, name: 'QA',   type: 'output' },
      { pin: 19, name: 'RCO',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_REG_MUX_TRI', mod: 10, syncClear: true,
        inputs: ['CCLR','CCK','A','B','C','D','ENP','ENT','RCLR','RCK','LOAD','G','R/C'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },

  // ── 74693: 4 bit binary counter + register + mux, sync CLR, TRI (20-pin) ──
  // Pinout + behavior verified against the family datasheet (the obsolete TI
  // sn74ls693.pdf 404s; the ST CMOS second source covers all four members on
  // one document and matches the original TI part pin-for-pin):
  //   Source: SGS-Thomson Microelectronics, "M54/74HC690/691 - M54/74HC692/693:
  //     Decade/4 Bit Binary Counter/Register (3-State)", (March 1993). [Online].
  //     Available: https://datasheet4u.com/datasheets/ST-Microelectronics/M74HC693/446486
  //     Verified: PIN CONNECTIONS (top view) DIP-20 + PIN DESCRIPTION table
  //     (page 1-2) and the DESCRIPTION prose, read as rendered ~80-dpi PDF page
  //     images (issues.md C4 — not a text summary). Confirmed: 1=CCLR 2=CCK
  //     3=A 4=B 5=C 6=D 7=ENP 8=RCLR 9=RCK 10=GND 11=R/C 12=G 13=LOAD 14=ENT
  //     15=QD 16=QC 17=QB 18=QA 19=RCO 20=VCC. The DESCRIPTION states the counter
  //     counts UP only (there is no up/down pin) and that, for HC692/HC693, BOTH
  //     the counter clear (to CCK) and the register clear (to RCK) are
  //     SYNCHRONOUS, whereas HC690/HC691 clear asynchronously. The hand-entered
  //     stub pinout (CLK/CLR/D0-D3/LE/S/OEn/Q0-Q3/UD) was fabricated and wrong
  //     (issues.md C2 lesson) — replaced wholesale with the assignment above.
  //   Family origin/title corroboration: Texas Instruments, "Counters/Registers/
  //     Multiplexers with 3-State Outputs (SN74LS690..693)", D2423, 1988 TTL
  //     Logic Data Book pp. 2-1139..2-1146 (the source the sibling 74x690 entry
  //     was verified against; the original TI part the ST device second-sources).
  // Engine: drives COUNTER_REG_MUX_TRI (mod:16 = binary, syncClear:true =
  //   synchronous CCLR and RCLR). Same primitive as the 74x690/691; the inert
  //   COUNTER_LATCH_MUX_STUB used by the 691/692/696/697 stubs is left untouched.
  '74x693': {
    name: '74x693',
    simpleName: '4 bit Binary Counter/Register/Mux (Sync CLR)',
    description: '4-bit sync binary counter, reg, 2:1 mux, 3-state out, sync clears (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://datasheet4u.com/datasheets/ST-Microelectronics/M74HC693/446486',
    tags: ['counter', 'binary', '4 bit', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x693 is the binary, synchronous-clear member of the 74x690 family: a 4 bit binary counter (counts 0-15), a 4 bit output register that can snapshot the count, and a 2:1 multiplexer that picks which of the two drives the output pins. The counter and the register each have their own clock (CCK, RCK) and their own clear (CCLR, RCLR), so you can freeze a reading in the register while the counter keeps running. R/C selects what appears on QA-QD: the live counter when LOW, the stored register when HIGH. The Q outputs are 3-state, switched on and off by G. It is identical to the 74x691 except both clears are synchronous: CCLR clears the counter on the next CCK rising edge and RCLR clears the register on the next RCK rising edge, rather than the instant the clear goes LOW. Aligning the reset to the clock keeps it from cutting a clock pulse short.',
    guidePinDescriptions: {
      'CCLR': 'Counter Clear (active LOW, synchronous). Clears the counter to 0 on the next CCK rising edge.',
      'CCK':  'Counter Clock. The counter acts on the rising edge.',
      'A':    'Parallel data input, bit 0 (least significant). Loaded into the counter on a CCK rising edge while LOAD is LOW.',
      'B':    'Parallel data input, bit 1.',
      'C':    'Parallel data input, bit 2.',
      'D':    'Parallel data input, bit 3 (most significant).',
      'ENP':  'Count Enable P (active HIGH). Counting needs both ENP and ENT HIGH.',
      'RCLR': 'Register Clear (active LOW, synchronous). Clears the register to 0 on the next RCK rising edge.',
      'RCK':  'Register Clock. On the rising edge the register snapshots the current count.',
      'GND':  'Ground (pin 10).',
      'R/C':  'Register/Counter select. LOW shows the live counter on QA-QD; HIGH shows the stored register.',
      'G':    'Output Enable (active LOW). LOW drives QA-QD; HIGH puts them in high impedance (off the bus).',
      'LOAD': 'Parallel Load (active LOW). With LOAD LOW, the next CCK rising edge loads A-D into the counter instead of counting.',
      'ENT':  'Count Enable T (active HIGH). Also gates the ripple carry output.',
      'QD':   'Multiplexed 3-state output, bit 3.',
      'QC':   'Multiplexed 3-state output, bit 2.',
      'QB':   'Multiplexed 3-state output, bit 1.',
      'QA':   'Multiplexed 3-state output, bit 0.',
      'RCO':  'Ripple Carry Output. Goes HIGH at the top count (15) while ENT is HIGH; feed it to the next stage to cascade.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Three blocks in one',
        paragraphs: [
          'The counter, the register, and the multiplexer sit in series. The counter increments on CCK. Its four bits feed both the register and one side of the multiplexer. On a rising RCK edge the register copies whatever the counter holds at that moment. The multiplexer, set by R/C, then drives the output pins from either the live counter or the frozen register.',
          'Because the two clocks are separate, you can let the counter free-run while the register holds a steady value for a display or a bus read. If you tie CCK and RCK together, the register just lags the counter by one clock.',
        ],
      },
      {
        title: 'Synchronous clear',
        paragraphs: [
          'CCLR and RCLR are active LOW, and on the 74x693 both are synchronous. Pulling CCLR LOW does nothing until the next CCK rising edge, which then forces the counter to 0; pulling RCLR LOW clears the register on the next RCK rising edge. The asynchronous-clear member of the family, the 74x691, clears the instant the line goes LOW instead.',
          'A synchronous clear cannot chop a clock period in half, so the count sequence stays clean. That matters when the counter is gating other clocked logic and you need every state to last a full clock.',
        ],
      },
      {
        title: '74x690-74x693 family',
        list: [
          '74x690: BCD (0-9), async clear',
          '74x691: Binary (0-15), async clear',
          '74x692: BCD (0-9), sync clear',
          '74x693: Binary (0-15), sync clear',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CCLR', type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'RCLR', type: 'input'  },
      { pin:  9, name: 'RCK',  type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'R/C',  type: 'input'  },
      { pin: 12, name: 'G',    type: 'input'  },
      { pin: 13, name: 'LOAD', type: 'input'  },
      { pin: 14, name: 'ENT',  type: 'input'  },
      { pin: 15, name: 'QD',   type: 'output' },
      { pin: 16, name: 'QC',   type: 'output' },
      { pin: 17, name: 'QB',   type: 'output' },
      { pin: 18, name: 'QA',   type: 'output' },
      { pin: 19, name: 'RCO',  type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_REG_MUX_TRI', mod: 16, syncClear: true,
        inputs: ['CCLR','CCK','A','B','C','D','ENP','ENT','RCLR','RCK','LOAD','G','R/C'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },
};