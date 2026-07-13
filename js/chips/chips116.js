// chips116.js — Block 116: CMOS 4000 series logic ICs (coverage expansion, Batch 4)
// CD4099B — 8-bit addressable latch. Pinout + MODE SELECTION table verified by
// reading the TI datasheet "CD4099B Types — CMOS 8-Bit Addressable Latch
// (High-Voltage Types, 20-Volt Rating)", SCHS066C (data acquired from Harris
// Semiconductor; Revised October 2003) directly as rendered PDF page images
// (pdftoppm + Read on the PNG), NOT via the WebFetch text summarizer which mangles
// these scans (see issues.md C4). The TERMINAL ASSIGNMENT (TOP VIEW) and the
// Functional Diagram on page 1 were cross-checked and agree.
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 4) for the full roadmap.
// Chips: CD4099
export const CHIPS_BLOCK_116 = {

  // ── CD4099: 8-bit addressable latch (16-pin) ─────────────────────────────────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD4099B Types — CMOS 8-Bit Addressable Latch (High-Voltage Types, 20-Volt
     Rating)", SCHS066C (Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4099b.pdf
     Pinout taken from the page-1 "TERMINAL ASSIGNMENT" (TOP VIEW), cross-checked
     against the page-1 Functional Diagram — both agree:
       1=Q7  2=RESET  3=DATA  4=WRITE DISABLE  5=A0  6=A1  7=A2  8=VSS
       9=Q0  10=Q1  11=Q2  12=Q3  13=Q4  14=Q5  15=Q6  16=VDD
     This DIP map is its OWN, distinct from the 74x259 (A0=1, active-LOW CLR=15,
     G=14) — NOT cloned from that sibling (issues.md C2). The CD4099 brings the
     three address inputs out on 5/6/7, DATA on 3, the active-HIGH WRITE DISABLE on
     4, the active-HIGH master RESET on 2, and splits Q0..Q7 across 9..15 + pin 1.
     Behavior from the page-2 "MODE SELECTION" table (WD = WRITE DISABLE,
     R = RESET; both ACTIVE HIGH):
       WD=0,R=0:  addressed latch follows DATA;  unaddressed latches HOLD.
       WD=0,R=1:  addressed latch follows DATA;  unaddressed latches reset to 0
                  (i.e. an active-high 1-of-8 demultiplexer).
       WD=1,R=0:  all latches HOLD.
       WD=1,R=1:  all latches reset to 0 (master clear).
     ENGINE PRIMITIVE: maps onto the shared `ADDRESSABLE_LATCH` primitive with the
     opt-in `resetActiveHigh:true` flag. WRITE DISABLE carries the SAME active-LOW-
     enable polarity as that primitive's G slot (0 = write the addressed bit,
     1 = inhibit), so it maps straight into the G input with no inversion; the flag
     re-interprets the CLR slot as an ACTIVE-HIGH RESET and adds the demultiplexer
     mode (unaddressed bits reset only when R is HIGH). The default (flag unset)
     74x259 path — active-LOW CLR, no demux gating — is left untouched. */
  'CD4099': {
    name: 'CD4099',
    simpleName: '8 bit Addr Latch',
    description: 'CMOS 8 bit addressable latch (16-pin)',
    guideOverview: 'The CD4099B stores eight output bits but lets you write them one at a time over a tiny address/data interface. The three address inputs A0 A2 select which one of the eight latches (Q0 Q7) you are targeting, and DATA is the bit value. WRITE DISABLE is an active-HIGH inhibit: hold it LOW to write the addressed latch, HIGH to make all eight latches hold. RESET is an active-HIGH master clear. With WRITE DISABLE LOW and RESET HIGH the part behaves as an active-high 1-of-8 demultiplexer — the addressed output follows DATA while every other output is forced to 0. It is the CMOS counterpart of the 74x259, but note its pinout and its control polarity (active-HIGH RESET / WRITE DISABLE) differ from that part.',
    guidePinDescriptions: {
      'A0': 'Address bit 0 (LSB). With A1/A2 it selects which one of the eight latches (Q0 Q7) the next write targets.',
      'A1': 'Address bit 1.',
      'A2': 'Address bit 2 (MSB).',
      'DATA': 'Data bit written into the addressed latch while WRITE DISABLE is LOW.',
      'WD': 'WRITE DISABLE, active HIGH. LOW lets the addressed latch follow DATA; HIGH inhibits all writes so every latch holds.',
      'RESET': 'Master RESET, active HIGH and asynchronous. HIGH clears the unaddressed latches to 0 (and, when WRITE DISABLE is also HIGH, the addressed latch too) — see the mode table.',
      'Q0': 'Latched output bit 0.',
      'Q1': 'Latched output bit 1.',
      'Q2': 'Latched output bit 2.',
      'Q3': 'Latched output bit 3.',
      'Q4': 'Latched output bit 4.',
      'Q5': 'Latched output bit 5.',
      'Q6': 'Latched output bit 6.',
      'Q7': 'Latched output bit 7.',
      'GND': 'Negative supply / ground reference, VSS (pin 8).',
      'VCC': 'Positive supply, VDD (+3 to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Addressed Storage',
        paragraphs: [
          'Pick one of the eight latches with A0 A2, place the bit on DATA, then pulse WRITE DISABLE LOW to store it. Outputs that are not currently addressed keep their previous values, so you can build up an 8-bit pattern across several single-bit writes — useful for creating software-controlled output lines from a small address/data bus.',
          'RESET is active HIGH (the opposite sense from the 74x259 active-LOW clear) and clears the latches asynchronously. Hold RESET LOW for normal latch operation.',
        ],
      },
      {
        title: 'Demultiplexer Mode',
        paragraphs: [
          'Hold RESET HIGH while keeping WRITE DISABLE LOW and the chip acts as an active-high 1-of-8 demultiplexer: the one output picked by A0 A2 follows DATA, while all seven other outputs are forced to 0. Drive both RESET and WRITE DISABLE HIGH together to clear all eight outputs (master reset).',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4099b.pdf',
    tags: ['latch', 'addressable', '8 bit', 'demultiplexer', 'cmos', '4000 series', 'sequential'],
    pinout: [
      { pin: 1,  name: 'Q7',    type: 'output' },
      { pin: 2,  name: 'RESET', type: 'input'  },
      { pin: 3,  name: 'DATA',  type: 'input'  },
      { pin: 4,  name: 'WD',    type: 'input'  },
      { pin: 5,  name: 'A0',    type: 'input'  },
      { pin: 6,  name: 'A1',    type: 'input'  },
      { pin: 7,  name: 'A2',    type: 'input'  },
      { pin: 8,  name: 'GND',   type: 'power'  },
      { pin: 9,  name: 'Q0',    type: 'output' },
      { pin: 10, name: 'Q1',    type: 'output' },
      { pin: 11, name: 'Q2',    type: 'output' },
      { pin: 12, name: 'Q3',    type: 'output' },
      { pin: 13, name: 'Q4',    type: 'output' },
      { pin: 14, name: 'Q5',    type: 'output' },
      { pin: 15, name: 'Q6',    type: 'output' },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      {
        type: 'ADDRESSABLE_LATCH',
        // inputs: [A0, A1, A2, D, G(=WRITE DISABLE), CLR(=RESET)]
        inputs: ['A0', 'A1', 'A2', 'DATA', 'WD', 'RESET'],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
        resetActiveHigh: true,  // CD4099: active-HIGH RESET + active-high demux mode
      },
    ],
    sequential: true,
  },

};
