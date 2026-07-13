// Chip definitions block 125
// Chips: CD40162 (synchronous BCD/decade counter, synchronous clear)
//
// Standalone block authored for the CMOS 4000-series coverage effort. Kept on
// its own (instead of batching ~10-15 chips per file) to avoid collisions with
// other agents editing shared chip files in the same working tree.

export const CHIPS_BLOCK_125 = {

  // ── CD40162: synchronous decade counter, synchronous clear (16-pin) ─────────
  /* Source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD40160B, CD40161B, CD40162B, CD40163B Types — CMOS Synchronous
     Programmable 4-Bit Counters", datasheet SCHS103C (revised July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40160b.pdf
     (the family datasheet; the cd40162b.pdf symlink 404s, so the combined
     CD40160B-CD40163B document was used). Verified: terminal assignment read
     from the Functional Diagram + the TRUTH TABLE, both read as 400-dpi PDF
     page-image renders (issues.md C4 — the WebFetch summarizer hallucinates TI
     pinouts). NOT cloned from the 74x162 sibling (issues.md C2): the CD40162B's
     own diagram was read, which happens to be pin-compatible with the
     74LS162 (the datasheet states the CD40160B-CD40163B are "functionally
     equivalent to and pin-compatible with the TTL counter series 74LS160
     through 74LS163 respectively").

     Verified pinout (Functional Diagram, doc 92CS-28628R1):
       1=CLEAR(active LOW)  2=CLOCK  3=P1  4=P2  5=P3  6=P4  7=PE  8=VSS
       9=LOAD(active LOW)  10=TE  11=Q4  12=Q3  13=Q2  14=Q1  15=CARRY OUT  16=VDD
     Verified TRUTH TABLE (page 3 of SCHS103C):
       CLK↑ CLR=1 LOAD=0  X  X  -> PRESET (synchronous parallel load)
       CLK↑ CLR=1 LOAD=1  PE=0 X -> NC (hold)
       CLK↑ CLR=1 LOAD=1  X TE=0 -> NC (hold)
       CLK↑ CLR=1 LOAD=1  PE=1 TE=1 -> COUNT
       CLK↑ CLR=0  X  X  X -> RESET (CD40162B, CD40163B)  [SYNCHRONOUS clear]
     The CD40160B/40161B (async-clear siblings) instead reset on CLR=0 with
     CLOCK=X; the CD40162B clears only on the rising clock edge — exactly the
     COUNTER_SYNC_DECADE_SC primitive (shared with the 74x162). CARRY OUT
     (RCO) = TE AND (count == 9). */
  'CD40162': {
    name: 'CD40162',
    simpleName: 'Sync BCD Counter (sync CLR)',
    description: 'CMOS sync presettable 4-bit decade (BCD) counter, sync clear (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40160b.pdf',
    tags: ['counter', 'bcd', 'decade', 'synchronous', 'preset', 'sequential', 'CMOS', '4000 series'],
    guideOverview: 'The CD40162B is a CMOS synchronous decade counter. It counts 0 through 9 in binary-coded decimal on its four outputs Q1-Q4, then rolls back to 0. Every action happens on the rising edge of CLOCK: there is no ripple delay between the four flip-flops, so the outputs all change together. Two enable inputs, PE and TE, must both be HIGH for the counter to advance; pulling either LOW freezes the count. A LOW on LOAD jams the values on P1-P4 into the counter on the next clock edge, and a LOW on CLEAR resets it to 0 on the next clock edge. CARRY OUT goes HIGH when the count reaches 9 and TE is HIGH, which lets you chain decades to count in the hundreds and beyond. It is the CMOS version of the 74LS162 and shares its pinout.',
    guidePinDescriptions: {
      'CLEAR': 'Synchronous clear (active LOW). A LOW here resets the count to 0 on the next rising CLOCK edge — not immediately.',
      'CLOCK': 'Clock input. Every operation (count, load, clear) happens on the rising edge.',
      'P1': 'Parallel data input bit 0 (LSB). Loaded into Q1 when LOAD is LOW on the next clock edge.',
      'P2': 'Parallel data input bit 1. Loaded into Q2 when LOAD is LOW.',
      'P3': 'Parallel data input bit 2. Loaded into Q3 when LOAD is LOW.',
      'P4': 'Parallel data input bit 3 (MSB). Loaded into Q4 when LOAD is LOW.',
      'PE': 'Count enable. Both PE and TE must be HIGH for the counter to advance; LOW holds the count.',
      'TE': 'Count enable. Like PE, must be HIGH to count, and it also gates CARRY OUT — CARRY OUT is HIGH only when TE is HIGH.',
      'LOAD': 'Synchronous parallel load (active LOW). A LOW loads P1-P4 into Q1-Q4 on the next rising CLOCK edge.',
      'Q1': 'Counter output bit 0 (LSB, weight 1).',
      'Q2': 'Counter output bit 1 (weight 2).',
      'Q3': 'Counter output bit 2 (weight 4).',
      'Q4': 'Counter output bit 3 (MSB, weight 8).',
      'CARRY OUT': 'Carry out. Goes HIGH when the count reaches 9 and TE is HIGH. Connect it to the PE and TE of the next counter to cascade decades.',
      'VDD': 'Positive supply (3-18 V).',
      'VSS': 'Ground (0 V).',
    },
    guideSections: [
      {
        title: 'Synchronous clear vs. asynchronous clear',
        paragraphs: [
          'The CD40162B clears synchronously: pulling CLEAR LOW does not reset the outputs right away. The reset waits for the next rising CLOCK edge. This keeps every output change lined up with the clock, so a downstream circuit never sees a brief invalid value caused by the counter resetting between edges.',
          'The CD40160B is the otherwise-identical part with an asynchronous clear, where CLEAR resets the outputs the instant it goes LOW. The CD40163B is the binary (0-15) version of this synchronous-clear part.',
        ],
        note: 'CD40162B = decade + synchronous clear. CD40160B = decade + async clear. CD40163B = binary + synchronous clear. CD40161B = binary + async clear.',
      },
      {
        title: 'Counting, loading, and cascading',
        paragraphs: [
          'Both PE and TE must be HIGH for the counter to count. TE has an extra job: it gates CARRY OUT, which only goes HIGH when the count is 9 and TE is HIGH. To build a two-digit decade counter, wire the CARRY OUT of the ones digit to the PE and TE of the tens digit so the tens advance once per ten counts.',
        ],
        list: [
          'PE=1, TE=1 -> counter advances on each clock edge',
          'PE=0 or TE=0 -> counter holds its value',
          'LOAD=0 -> loads P1-P4 on the next clock edge',
          'CLEAR=0 -> resets to 0 on the next clock edge',
          'CARRY OUT = HIGH when count is 9 and TE=1',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLEAR', type: 'input' },
      { pin:  2, name: 'CLOCK', type: 'input' },
      { pin:  3, name: 'P1',    type: 'input' },
      { pin:  4, name: 'P2',    type: 'input' },
      { pin:  5, name: 'P3',    type: 'input' },
      { pin:  6, name: 'P4',    type: 'input' },
      { pin:  7, name: 'PE',    type: 'input' },
      { pin:  8, name: 'VSS',   type: 'power' },
      { pin:  9, name: 'LOAD',  type: 'input' },
      { pin: 10, name: 'TE',    type: 'input' },
      { pin: 11, name: 'Q4',    type: 'output' },
      { pin: 12, name: 'Q3',    type: 'output' },
      { pin: 13, name: 'Q2',    type: 'output' },
      { pin: 14, name: 'Q1',    type: 'output' },
      { pin: 15, name: 'CARRY OUT', type: 'output' },
      { pin: 16, name: 'VDD',   type: 'power' },
    ],
    gates: [
      // COUNTER_SYNC_DECADE_SC contract (js/specificChipsSim.js):
      //   inputs:  [CLK, CLR, LOAD, ENP, ENT, A, B, C, D]
      //   outputs: [QA,  QB,  QC,   QD,  RCO]
      // Mapped to CD40162B pin names: ENP=PE, ENT=TE, A..D=P1..P4, RCO=CARRY OUT.
      { type: 'COUNTER_SYNC_DECADE_SC',
        inputs:  ['CLOCK', 'CLEAR', 'LOAD', 'PE', 'TE', 'P1', 'P2', 'P3', 'P4'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'CARRY OUT'] },
    ],
    sequential: true,
  },
};
