// chips124.js — CMOS 4000-series coverage expansion
// CD40161B: high-voltage CMOS synchronous programmable 4-bit BINARY counter
// with ASYNCHRONOUS clear. Functionally/pin-equivalent to the 74LS161.
//
// Source: Texas Instruments, "CD40160B, CD40161B, CD40162B, CD40163B Types —
//   CMOS Synchronous Programmable 4-Bit Counters", SCHS103C (data sheet acquired
//   from Harris Semiconductor, revised July 2003). [Online]. Available:
//   https://www.ti.com/lit/ds/symlink/cd40161b.pdf. Verified: terminal/Functional
//   Diagram + TRUTH TABLE on pages 1 and 3, read as rendered PDF page images
//   (300-dpi), not a text summary (per issues.md C4). Pinout read directly off the
//   CD40161B Functional Diagram — NOT cloned from the 74x161 sibling (issues.md C2).
//
// Verified terminal assignment (16-pin DIP, CD40161B):
//   1=CLEAR(async, active LOW)  2=CLOCK  3=P1(LSB data)  4=P2  5=P3  6=P4(MSB data)
//   7=PE(count enable P)  8=VSS  9=LOAD(sync parallel load, active LOW)
//   10=TE(count enable T, gates CARRY OUT)  11=Q4(MSB)  12=Q3  13=Q2  14=Q1(LSB)
//   15=CARRY OUT  16=VDD
//
// Behavior (from the SCHS103C TRUTH TABLE, CD40161B rows):
//   CLR=0                          → RESET, async (outputs to 0 immediately, any CLK)
//   CLK↑, CLR=1, LOAD=0            → PRESET (P1..P4 jammed to Q1..Q4)
//   CLK↑, CLR=1, LOAD=1, PE=0      → no change (hold)
//   CLK↑, CLR=1, LOAD=1, TE=0      → no change (hold)
//   CLK↑, CLR=1, LOAD=1, PE=TE=1  → COUNT up (binary 0..15, wraps 15→0)
//   CARRY OUT = TE AND (count == 15)
//
// Maps onto the existing COUNTER_SYNC_BIN engine primitive (the 74x161 model):
// async active-LOW clear, sync active-LOW load, two AND-ed count enables, and a
// terminal-count carry gated by the T enable — an exact match, so no engine work.
// The primitive's pin-name contract is [CLK,CLR,LOAD,ENP,ENT,A,B,C,D] →
// [QA,QB,QC,QD,RCO]; CD40161 PE/TE play the ENP/ENT roles and P1..P4 / Q1..Q4 the
// A..D / QA..QD roles (P1/Q1 = LSB).
export const CHIPS_BLOCK_124 = {
  // ── CD40161B: Synchronous 4-bit Binary Counter, asynchronous clear ──
  'CD40161': {
    name: 'CD40161',
    simpleName: 'Sync Binary Counter',
    description: 'CMOS synchronous 4 bit binary counter with asynchronous clear (16-pin)',
    guideOverview: 'The CD40161 is a synchronous 4 bit binary counter. It counts 0 to 15 on each rising clock edge when both count enables PE and TE are HIGH. CLEAR is asynchronous: pulling it LOW resets all four outputs to 0 immediately, without waiting for a clock edge. LOAD is synchronous: with LOAD LOW, the value on P1 to P4 is copied to the outputs on the next rising clock edge. CARRY OUT goes HIGH at count 15 so several counters can be chained into a wider one.',
    guidePinDescriptions: {
      'CLEAR': 'Clear, active LOW. Resets all outputs to 0 immediately (asynchronous, no clock needed).',
      'CLOCK': 'Clock input. Count increments on the rising edge when PE and TE are both HIGH.',
      'P1':    'Parallel data input bit 0 (LSB). Loaded when LOAD is LOW on the rising clock edge.',
      'P2':    'Parallel data input bit 1.',
      'P3':    'Parallel data input bit 2.',
      'P4':    'Parallel data input bit 3 (MSB).',
      'PE':    'Count enable P. Both PE and TE must be HIGH to count.',
      'VSS':   'Ground / negative supply (pin 8).',
      'LOAD':  'Parallel load, active LOW. Copies P1 to P4 into the outputs on the next rising clock edge (synchronous).',
      'TE':    'Count enable T. Both enables must be HIGH to count; TE also gates the CARRY OUT signal.',
      'Q4':    'Count output bit 3 (MSB, weight 8).',
      'Q3':    'Count output bit 2 (weight 4).',
      'Q2':    'Count output bit 1 (weight 2).',
      'Q1':    'Count output bit 0 (LSB, weight 1).',
      'CARRY OUT': 'Terminal count output. HIGH at count 15 when TE is HIGH. Wire to PE/TE of the next stage to cascade.',
      'VDD':   'Positive supply (pin 16). CMOS parts run 3 to 18 V; the simulator uses 5 V.',
    },
    guideSections: [
      {
        title: 'Synchronous binary counting (0 to 15)',
        paragraphs: [
          'All four flip-flops are clocked together, so the outputs change at the same instant on each rising clock edge. The counter advances only when both PE and TE are HIGH; holding either LOW freezes the count.',
          'To build a wider counter, connect CARRY OUT of one stage to the PE and TE inputs of the next. Each stage then advances only on the clock edge where the stage below it rolls over from 15 to 0.',
        ],
        note: 'CLEAR here is asynchronous: it acts the moment it goes LOW. For a version that clears only on a clock edge, use the CD40163.',
      },
    ],
    sequential: true,
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40161b.pdf',
    tags: ['counter', 'binary', 'synchronous', '4 bit', 'cmos', '4000 series', 'sequential'],
    pinout: [
      { pin: 1,  name: 'CLEAR',     type: 'input'  },
      { pin: 2,  name: 'CLOCK',     type: 'input'  },
      { pin: 3,  name: 'P1',        type: 'input'  },
      { pin: 4,  name: 'P2',        type: 'input'  },
      { pin: 5,  name: 'P3',        type: 'input'  },
      { pin: 6,  name: 'P4',        type: 'input'  },
      { pin: 7,  name: 'PE',        type: 'input'  },
      { pin: 8,  name: 'VSS',       type: 'power'  },
      { pin: 9,  name: 'LOAD',      type: 'input'  },
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
        // COUNTER_SYNC_BIN = 74x161 model (async active-LOW clear). Pin-name
        // contract: inputs [CLK,CLR,LOAD,ENP,ENT,A,B,C,D], outputs [QA,QB,QC,QD,RCO].
        type: 'COUNTER_SYNC_BIN',
        inputs:  ['CLOCK', 'CLEAR', 'LOAD', 'PE', 'TE', 'P1', 'P2', 'P3', 'P4'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'CARRY OUT'],
      },
    ],
  },
};
