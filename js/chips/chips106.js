// ─────────────────────────────────────────────────────────────────────────────
// chips106.js — CMOS 4000-series coverage expansion (Batch 2)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_106.
//
//   CD4531 — 13-input parity checker / 12-bit parity tree
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_106 = {
  // ── CD4531: 12-bit parity tree (13-input parity checker/generator) ─────────
  /* Primary source: Motorola/onsemi MC14531B "12-Bit Parity Tree" datasheet —
     the industry-standard second-source for the CD4531B, identical 16-pin DIP
     terminal assignment. The TI `cd4531b.pdf` symlink 404s (TI no longer hosts
     this discontinued part), as do the onsemi/Renesas direct-PDF links to curl,
     so the pinout was read off the MC14531B LOGIC DIAGRAM (with per-pin numbers)
     rendered as a page image — NOT a text summarizer (see issues.md C4) and NOT
     cloned from a sibling (see issues.md C2).
       https://www.onsemi.com/pdf/datasheet/mc14531b-d.pdf
     Verified physical pin map (DIP-16): D6=1 D5=2 D4=3 D3=4 D2=5 D1=6 D0=7
     VSS=8 Q=9 W=10 D11=11 D10=12 D9=13 D8=14 D7=15 VDD=16.
     The 13 inputs are 12 data bits (D0–D11) plus a parity/cascade input W (the
     "ODD/EVEN" select, also labelled Pi on some CD4531B datasheets). Q is the
     XOR of all 13 inputs, so W lets you choose even/odd parity or cascade trees.
     Pure combinational — uses the built-in multi-input XOR gate, no primitive. */
  'CD4531': {
    name: 'CD4531',
    simpleName: '13-In Parity',
    description: '13-input parity checker / 12-bit parity tree (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.onsemi.com/pdf/datasheet/mc14531b-d.pdf',
    tags: ['cmos', '4000', 'parity', 'parity checker', 'parity generator', 'parity tree', 'xor', 'logic', 'error detection'],
    guideOverview: 'The CD4531B is a 12-bit parity tree: twelve data inputs (D0–D11) and a thirteenth cascade/parity input (W, also called Pi or the ODD/EVEN select) all feed one big EXCLUSIVE-OR tree. The single output Q is HIGH when an ODD number of its thirteen inputs are HIGH, and LOW when an even number are HIGH. Tie W LOW and Q is the even-parity check of the twelve data bits; tie W HIGH (or feed the Q of a previous stage into W) to invert the sense or to cascade several CD4531s into a parity tree wider than 12 bits. It is the classic building block for error-detection on data buses.',
    guidePinDescriptions: {
      D0: 'Data input bit 0 (pin 7). One of the twelve data inputs XOR-ed into Q.',
      D1: 'Data input bit 1 (pin 6).',
      D2: 'Data input bit 2 (pin 5).',
      D3: 'Data input bit 3 (pin 4).',
      D4: 'Data input bit 4 (pin 3).',
      D5: 'Data input bit 5 (pin 2).',
      D6: 'Data input bit 6 (pin 1).',
      D7: 'Data input bit 7 (pin 15).',
      D8: 'Data input bit 8 (pin 14).',
      D9: 'Data input bit 9 (pin 13).',
      D10: 'Data input bit 10 (pin 12).',
      D11: 'Data input bit 11 (pin 11).',
      W: 'Cascade / parity-select input (pin 10; "Pi" or ODD/EVEN on some datasheets). It is just a 13th XOR input: W LOW gives even-parity of D0–D11; W HIGH inverts it. Drive W from a previous CD4531\'s Q to build parity trees wider than 12 bits.',
      Q: 'Parity output (pin 9): Q = D0 ⊕ D1 ⊕ … ⊕ D11 ⊕ W. HIGH when an odd number of the thirteen inputs are HIGH.',
      VSS: 'Ground reference (pin 8).',
      VDD: 'Positive supply (+3 V to +18 V; +5 V in this simulator) at pin 16.',
    },
    guideSections: [
      {
        title: 'Parity checking / generating',
        paragraphs: [
          'All thirteen inputs are exclusive-OR-ed together. Because XOR is commutative and associative, the output only depends on HOW MANY inputs are HIGH, not which ones: Q is HIGH for an odd count, LOW for an even count.',
          'To GENERATE a parity bit for a 12-bit word, wire the word to D0–D11, hold W LOW, and use Q as the even-parity bit (append it so the transmitted 13 bits always have even parity). To CHECK, feed all 13 received bits in (12 data on D0–D11, the parity bit on W); Q then reads 0 when parity is intact and 1 when a single-bit error flipped the count.',
          'For words wider than 12 bits, cascade: feed the Q of the first CD4531 into the W input of the next so its tree extends the running XOR.',
        ],
        formulas: [
          'Q = D0 ⊕ D1 ⊕ D2 ⊕ D3 ⊕ D4 ⊕ D5 ⊕ D6 ⊕ D7 ⊕ D8 ⊕ D9 ⊕ D10 ⊕ D11 ⊕ W',
          'Q = 1  ⟺  an odd number of the 13 inputs are HIGH',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'D6',  type: 'input',  description: 'Data input bit 6' },
      { pin: 2,  name: 'D5',  type: 'input',  description: 'Data input bit 5' },
      { pin: 3,  name: 'D4',  type: 'input',  description: 'Data input bit 4' },
      { pin: 4,  name: 'D3',  type: 'input',  description: 'Data input bit 3' },
      { pin: 5,  name: 'D2',  type: 'input',  description: 'Data input bit 2' },
      { pin: 6,  name: 'D1',  type: 'input',  description: 'Data input bit 1' },
      { pin: 7,  name: 'D0',  type: 'input',  description: 'Data input bit 0' },
      { pin: 8,  name: 'VSS', type: 'power',  description: 'Ground (0 V)' },
      { pin: 9,  name: 'Q',   type: 'output', description: 'Parity output = XOR of all 13 inputs (HIGH for odd count)' },
      { pin: 10, name: 'W',   type: 'input',  description: 'Cascade / parity-select input (13th XOR input; "Pi" / ODD-EVEN)' },
      { pin: 11, name: 'D11', type: 'input',  description: 'Data input bit 11' },
      { pin: 12, name: 'D10', type: 'input',  description: 'Data input bit 10' },
      { pin: 13, name: 'D9',  type: 'input',  description: 'Data input bit 9' },
      { pin: 14, name: 'D8',  type: 'input',  description: 'Data input bit 8' },
      { pin: 15, name: 'D7',  type: 'input',  description: 'Data input bit 7' },
      { pin: 16, name: 'VDD', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // Built-in multi-input XOR: output = inputBits.reduce((a,b)=>a^b,0).
      // Q = XOR of the twelve data bits and the cascade/parity input W (13 inputs).
      { type: 'XOR', inputs: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'W'], output: 'Q' },
    ],
  },
};
