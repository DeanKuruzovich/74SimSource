// Chip definitions block 123
// Chips: CD40160 (synchronous programmable decade counter, asynchronous clear)
//
// Standalone block authored for the CMOS 4000-series coverage effort. Kept on
// its own (instead of batching ~10-15 chips per file) to avoid collisions with
// other agents editing shared chip files in the same working tree.

export const CHIPS_BLOCK_123 = {

  // ── CD40160B: synchronous 4-bit decade counter, asynchronous clear (16-pin) ──
  /* Source: Texas Instruments (data acquired from Harris Semiconductor),
     "CD40160B, CD40161B, CD40162B, CD40163B Types — CMOS Synchronous
     Programmable 4-Bit Counters", datasheet SCHS103C (rev. July 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40160b.pdf
     Verified: Functional Diagram (terminal assignment, page 1) + TRUTH TABLE
     (page 3) read as rendered 300-dpi PDF page images, NOT a text summarizer
     (issues.md C4), and NOT cloned from the pin-compatible 74x160 sibling
     (issues.md C2 — though it is in fact pin-for-pin identical, the datasheet
     states the CD40160B "is functionally equivalent to and pin-compatible with
     the TTL counter series 74LS160", confirmed here against its own PDF).

     Verified terminal assignment (Functional Diagram, page 1):
       1=CLEAR (active LOW), 2=CLOCK, 3=P1, 4=P2, 5=P3, 6=P4, 7=PE, 8=VSS,
       9=LOAD (active LOW), 10=TE, 11=Q4, 12=Q3, 13=Q2, 14=Q1, 15=CARRY OUT,
       16=VDD.  P1/Q1 = LSB, P4/Q4 = MSB.

     Verified behavior (TRUTH TABLE, page 3):
       CLEAR=0 (X on everything else) → RESET, asynchronous for the CD40160B
         ("The CLEAR function of the CD40160B and CD40161B is asynchronous and a
          low level at the CLEAR input sets all four outputs low regardless of
          the state of the CLOCK, LOAD, or ENABLE inputs.").
       Rising CLOCK, CLEAR=1, LOAD=0 → PRESET (synchronous parallel load of
         P1-P4, regardless of the enable inputs).
       Rising CLOCK, CLEAR=1, LOAD=1, PE=1, TE=1 → COUNT (0-9 decade).
       PE=0 or TE=1=0 → NC (hold). The TE input is fed forward to enable
         CARRY OUT, which is HIGH at terminal count 9 while TE is HIGH.

     Maps exactly onto the existing COUNTER_SYNC_DECADE primitive (the 74x160
     model in js/specificChipsSim.js): inputs [CLK, CLR, LOAD, ENP, ENT, A, B,
     C, D], outputs [QA, QB, QC, QD, RCO]. CD40160B PE→ENP, TE→ENT (TE gates the
     carry, so it is the ENT count-enable), P1-P4→A-D, Q1-Q4→QA-QD,
     CARRY OUT→RCO. No engine work — this is purely authoring the DB entry. */
  'CD40160': {
    name: 'CD40160',
    simpleName: 'Sync Decade Counter',
    description: 'CMOS synchronous 4-bit decade counter with asynchronous clear (16-pin)',
    guideOverview: 'The CD40160 is a CMOS synchronous 4-bit decade (BCD) counter. It counts 0-9 on each rising clock edge when both count-enable inputs (PE and TE) are HIGH. CLEAR is an active-LOW asynchronous reset: pull it low and all four outputs go to 0 immediately, no clock needed. LOAD is an active-LOW synchronous parallel load: it captures P1-P4 into the counter on the next rising clock edge. CARRY OUT goes HIGH at count 9 (while TE is HIGH) so several stages can be chained into a wider counter. It is the CMOS, wide-supply (3-18 V) version of the 74LS160.',
    guidePinDescriptions: {
      'CLEAR': 'Asynchronous clear, active LOW. A low level forces all four outputs to 0 immediately, ignoring the clock and every other input.',
      'CLOCK': 'Clock input. The count advances on the rising edge when PE and TE are both HIGH.',
      'P1': 'Parallel data input bit 0 (LSB). Loaded into Q1 when LOAD is low on the clock edge.',
      'P2': 'Parallel data input bit 1.',
      'P3': 'Parallel data input bit 2.',
      'P4': 'Parallel data input bit 3 (MSB).',
      'PE': 'Count enable. Both PE and TE must be HIGH to count.',
      'VSS': 'Negative supply / ground (pin 8).',
      'LOAD': 'Synchronous parallel load, active LOW. When low, the next rising clock edge loads P1-P4 into the counter instead of counting.',
      'TE': 'Count enable. Must be HIGH (with PE) to count. Also gates the CARRY OUT pulse.',
      'Q4': 'Count output bit 3 (MSB, weight 8).',
      'Q3': 'Count output bit 2 (weight 4).',
      'Q2': 'Count output bit 1 (weight 2).',
      'Q1': 'Count output bit 0 (LSB, weight 1).',
      'CARRY OUT': 'Terminal-count / ripple-carry output. HIGH at count 9 when TE is HIGH. Feed it to the next stage to cascade.',
      'VDD': 'Positive supply (+3 to +18 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Synchronous Decade Counting',
        paragraphs: [
          'Every flip-flop shares one clock, so all four outputs update on the same edge. That is what "synchronous" means here, and it avoids the brief wrong counts a ripple counter shows while its stages settle one after another.',
          'CLEAR is asynchronous: it acts the instant you pull it low. LOAD is synchronous: it waits for the next rising clock edge. Both PE and TE must be HIGH to count.',
        ],
        note: 'The CD40161 is the same part counting 0-15 (binary) instead of 0-9. The CD40162/CD40163 are the synchronous-clear versions.',
      },
      {
        title: 'Cascading For A Wider Counter',
        paragraphs: [
          'CARRY OUT pulses HIGH at count 9 while TE is HIGH. To build a longer counter, wire CARRY OUT of one stage into the PE and TE enables of the next, with all stages sharing the same clock. The higher stage then advances only when the lower stage rolls over.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40160b.pdf',
    tags: ['counter', 'decade', 'synchronous', '4 bit', 'sequential', 'CMOS', '4000 series'],
    pinout: [
      { pin:  1, name: 'CLEAR',     type: 'input'  },
      { pin:  2, name: 'CLOCK',     type: 'input'  },
      { pin:  3, name: 'P1',        type: 'input'  },
      { pin:  4, name: 'P2',        type: 'input'  },
      { pin:  5, name: 'P3',        type: 'input'  },
      { pin:  6, name: 'P4',        type: 'input'  },
      { pin:  7, name: 'PE',        type: 'input'  },
      { pin:  8, name: 'VSS',       type: 'power'  },
      { pin:  9, name: 'LOAD',      type: 'input'  },
      { pin: 10, name: 'TE',        type: 'input'  },
      { pin: 11, name: 'Q4',        type: 'output' },
      { pin: 12, name: 'Q3',        type: 'output' },
      { pin: 13, name: 'Q2',        type: 'output' },
      { pin: 14, name: 'Q1',        type: 'output' },
      { pin: 15, name: 'CARRY OUT', type: 'output' },
      { pin: 16, name: 'VDD',       type: 'power'  },
    ],
    gates: [
      {
        // COUNTER_SYNC_DECADE = the 74x160 model: async active-LOW CLR, sync
        // active-LOW LOAD, count when ENP & ENT, RCO = ENT AND (count == 9).
        // CD40160B mapping: CLEAR→CLR, CLOCK→CLK, LOAD→LOAD, PE→ENP, TE→ENT,
        // P1-P4→A-D (P1=LSB), Q1-Q4→QA-QD (Q1=LSB), CARRY OUT→RCO.
        type: 'COUNTER_SYNC_DECADE',
        inputs: ['CLOCK', 'CLEAR', 'LOAD', 'PE', 'TE', 'P1', 'P2', 'P3', 'P4'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'CARRY OUT'],
      },
    ],
    sequential: true,
  },

};
