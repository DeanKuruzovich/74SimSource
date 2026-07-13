// chips126.js — Block 126: CMOS 4000-series logic ICs (coverage expansion)
// CD40163B — synchronous presettable 4-bit BINARY counter with SYNCHRONOUS clear.
//
// Pinout + behavior verified by reading the Texas Instruments family datasheet
// "CD40160B, CD40161B, CD40162B, CD40163B Types — CMOS Synchronous Programmable
// 4-Bit Counters (High-Voltage Types, 20-Volt Rating)", SCHS103C (data acquired
// from Harris Semiconductor; Revised July 2003) directly as rendered PDF page
// images (pdftoppm -r 200 + Read on the PNGs), NOT via the WebFetch text
// summarizer which mangles these scans (see issues.md C4). The DIP-16 terminal
// numbers were read off the page-2 "Fig. 4 — Logic diagrams for CD40161B and
// CD40163B binary counters" (the CD40163B is the synchronous-clear half of that
// figure), and the behavior off the page-3 TRUTH TABLE. NOT cloned from the
// 74x163 sibling (issues.md C2) — though the two do share this map, it was
// confirmed against the CD40163B's own datasheet.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 7, sync-counter family) for the roadmap.
// Chips: CD40163

export const CHIPS_BLOCK_126 = {

  // ── CD40163: Synchronous 4-bit binary counter, synchronous clear (16-pin) ────
  /* Primary source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD40160B, CD40161B, CD40162B, CD40163B Types — CMOS Synchronous Programmable
     4-Bit Counters (High-Voltage Types, 20-Volt Rating)", SCHS103C (Revised July
     2003). [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40160b.pdf
     Verified: terminal numbers from "Fig. 4 — Logic diagrams for CD40161B and
     CD40163B binary counters" (page 2) and the function table on page 3, read as
     200-dpi rendered PDF page images (issues.md C4). DIP-16 map (CD40163B):
       1=CLEAR  2=CLOCK  3=P1  4=P2  5=P3  6=P4  7=PE  8=VSS
       9=LOAD   10=TE    11=Q4 12=Q3 13=Q2 14=Q1 15=COUT 16=VDD
     P1=LSB..P4=MSB parallel data; Q1=LSB..Q4=MSB; PE and TE are the two
     active-HIGH count enables (both HIGH to count); LOAD is the active-LOW
     synchronous parallel-load enable; CLEAR is the active-LOW SYNCHRONOUS clear
     (takes effect only on the next positive CLOCK edge — this is what
     distinguishes the CD40163B from the async-clear CD40161B). COUT (carry out)
     is HIGH at terminal count 1111 while TE is HIGH.
     Page-3 TRUTH TABLE (CLOCK ↑ unless noted):
       CLR=1 LOAD=0          → PRESET (load P1..P4)
       CLR=1 LOAD=1 PE=0     → NC (no count)
       CLR=1 LOAD=1 TE=0     → NC
       CLR=1 LOAD=1 PE=1 TE=1→ COUNT
       CLR=0 (on CLOCK ↑)    → RESET to 0000  (CD40162B/CD40163B synchronous)
     Priority CLEAR > LOAD > count, all sampled on the rising CLOCK edge.
     ENGINE PRIMITIVE: COUNTER_SYNC_BIN_SC — the same primitive that drives the
     74x163 (synchronous clear). gate.inputs order is
       [CLK, CLR, LOAD, ENP, ENT, A, B, C, D]
     and gate.outputs order [QA, QB, QC, QD, RCO]; here those slots are filled with
     this part's own pin names (PE→ENP, TE→ENT, P1..P4→A..D, Q1..Q4→QA..QD,
     COUT→RCO). No engine work needed — purely a DB entry. */
  'CD40163': {
    name: 'CD40163',
    simpleName: 'Sync Binary Counter (SC)',
    description: 'CMOS sync presettable 4-bit binary counter, sync clear (16-pin)',
    guideOverview: 'The CD40163 is a CMOS synchronous 4-bit binary counter that counts 0 to 15 and wraps. Every action happens on the rising clock edge: counting, loading a starting value, and clearing. It has two count-enable inputs (PE and TE) that both must be HIGH for the counter to advance, an active-LOW synchronous LOAD that copies the parallel inputs P1-P4 into the counter, and an active-LOW synchronous CLEAR that resets the count to 0. Because CLEAR is synchronous, asserting it does not reset the counter immediately; the counter waits for the next rising clock edge. This avoids the glitches that an immediate (asynchronous) clear can cause in clocked systems. The carry output COUT goes HIGH when the count reaches 15 and TE is HIGH, which lets several counters be chained into a wider counter.',
    guidePinDescriptions: {
      'CLEAR': 'Synchronous clear, active LOW. When LOW, the counter resets to 0 on the next rising clock edge (not immediately). Highest priority.',
      'CLOCK': 'Clock input. All state changes happen on the rising edge.',
      'P1': 'Parallel data input bit 0 (LSB). Loaded into the counter when LOAD is LOW on a rising clock edge.',
      'P2': 'Parallel data input bit 1.',
      'P3': 'Parallel data input bit 2.',
      'P4': 'Parallel data input bit 3 (MSB).',
      'PE': 'Count enable P, active HIGH. Must be HIGH (with TE) for the counter to advance.',
      'VSS': 'Ground reference (pin 8).',
      'LOAD': 'Synchronous parallel load, active LOW. Copies P1-P4 into the counter on the next rising clock edge.',
      'TE': 'Count enable T, active HIGH. Must be HIGH (with PE) to count. Also gates the COUT carry output.',
      'Q4': 'Count output bit 3 (weight 8, MSB).',
      'Q3': 'Count output bit 2 (weight 4).',
      'Q2': 'Count output bit 1 (weight 2).',
      'Q1': 'Count output bit 0 (weight 1, LSB).',
      'COUT': 'Carry output. HIGH when the count is 15 and TE is HIGH. Connect to the next stage to chain counters.',
      'VDD': 'Positive supply (+3 to +18 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Synchronous clear vs asynchronous',
        paragraphs: [
          'The CD40163 clear is synchronous: pulling CLEAR LOW does not reset the counter the instant it goes LOW, but on the next rising clock edge. This keeps transitions clean in clocked designs where a glitch on the outputs cannot be tolerated.',
        ],
        note: 'For an immediate (asynchronous) clear, use the CD40161 instead. The two count identically; only the clear timing differs.',
      },
      {
        title: 'Loading a starting value',
        paragraphs: [
          'Put the value you want on P1-P4 (P1 is the LSB), hold LOAD LOW, and apply a rising clock edge. The counter jumps to that value, then counts up from there. LOAD overrides the count enables but is itself overridden by CLEAR.',
        ],
      },
      {
        title: 'Chaining counters',
        paragraphs: [
          'COUT goes HIGH at count 15 (with TE HIGH). Feed it into the PE or TE enable of the next CD40163 so the higher stage advances only when the lower one rolls over. This builds an 8-bit, 12-bit, or wider synchronous counter.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40160b.pdf',
    tags: ['counter', 'binary', 'synchronous', 'presettable', '4 bit', 'cmos', '4000 series', 'sequential'],
    pinout: [
      { pin: 1,  name: 'CLEAR', type: 'input',  description: 'Synchronous clear, active LOW (resets to 0 on next rising clock edge)' },
      { pin: 2,  name: 'CLOCK', type: 'input',  description: 'Clock input (rising edge)' },
      { pin: 3,  name: 'P1',    type: 'input',  description: 'Parallel data input bit 0 (LSB)' },
      { pin: 4,  name: 'P2',    type: 'input',  description: 'Parallel data input bit 1' },
      { pin: 5,  name: 'P3',    type: 'input',  description: 'Parallel data input bit 2' },
      { pin: 6,  name: 'P4',    type: 'input',  description: 'Parallel data input bit 3 (MSB)' },
      { pin: 7,  name: 'PE',    type: 'input',  description: 'Count enable P, active HIGH' },
      { pin: 8,  name: 'VSS',   type: 'power',  description: 'Ground (0V)' },
      { pin: 9,  name: 'LOAD',  type: 'input',  description: 'Synchronous parallel load, active LOW' },
      { pin: 10, name: 'TE',    type: 'input',  description: 'Count enable T, active HIGH (also gates COUT)' },
      { pin: 11, name: 'Q4',    type: 'output', description: 'Count output bit 3 (weight 8, MSB)' },
      { pin: 12, name: 'Q3',    type: 'output', description: 'Count output bit 2 (weight 4)' },
      { pin: 13, name: 'Q2',    type: 'output', description: 'Count output bit 1 (weight 2)' },
      { pin: 14, name: 'Q1',    type: 'output', description: 'Count output bit 0 (weight 1, LSB)' },
      { pin: 15, name: 'COUT',  type: 'output', description: 'Carry output, HIGH at count 15 when TE is HIGH' },
      { pin: 16, name: 'VDD',   type: 'power',  description: 'Positive supply (+3 to +18 V)' },
    ],
    gates: [
      {
        type: 'COUNTER_SYNC_BIN_SC',
        inputs: ['CLOCK', 'CLEAR', 'LOAD', 'PE', 'TE', 'P1', 'P2', 'P3', 'P4'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'COUT'],
      },
    ],
  },
};
