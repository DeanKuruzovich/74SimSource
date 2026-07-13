// Chip definitions block 4
// Auto-generated from chips.js

export const CHIPS_BLOCK_4 = {
  // ── 7490: Decade Counter ───────────────────────────────────────────────
  /* Source: Texas Instruments, "SN5490A, SN5492A, SN5493A ... SN74LS90, SN74LS92,
       SN74LS93 Decade, Divide-By-Twelve and Binary Counters", SDLS940A
       (Mar. 1974, rev. Mar. 1988). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls90.pdf. Verified: '90A/'LS90
       terminal assignment (TOP VIEW, page 1), BCD count sequence, bi-quinary
       (5-2) sequence, and RESET/COUNT function table (page 3) — read as 300-dpi
       PDF page images, not the text summarizer (issues.md C4).
     Pinout confirmed correct as previously entered. The set-to-nine-over-reset
       priority in the function table (R0 is "don't care" in the set-9 row) did
       NOT match the engine, which reset first; corrected in
       js/specificChipsSim.js _evaluateCounterDecade (issues.md C98). Guard:
       js/debug/scenarios/74x90-decade-counter.mjs.
     Counter background: Wikipedia contributors, "Counter (digital)". [Online].
       Available: https://en.wikipedia.org/wiki/Counter_(digital). */
  '74x90': {
    name: '74x90',
    simpleName: 'BCD Decade Counter (0 to 9)',
    description: 'Decade counter: ÷2 and ÷5 sections chain for 0-9 BCD count. (14-pin)',
    pins: 14,
    vcc: 5,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls90.pdf',
    tags: ['counter', 'decade', 'bcd', 'sequential', 'divider', 'ripple'],
    guideOverview: 'The 74x90 counts clock pulses from 0 to 9 and shows the total as a 4 bit BCD number on QA to QD. Inside it is really two separate counters: a divide by-2 stage (clock CKA, output QA) and a divide by-5 stage (clock CKB, outputs QB, QC, QD). They are not joined on-chip, so you choose how to chain them — for a normal 0 to 9 count, wire QA to CKB and feed your clock into CKA. It is an asynchronous (ripple) counter, so the outputs do not all switch at the exact same instant. Watch the power pins: VCC is pin 5 and GND is pin 10, not the usual corners.',
    guidePinDescriptions: {
      CKB:  'Clock input to the ÷5 section (drives QB, QC, QD). Counts on the falling edge (HIGH→LOW). For a 0 to 9 BCD count, wire QA to this pin.',
      R01:  'Reset-to-zero input, 1 of 2. When R01 and R02 are both HIGH, all four outputs are forced to 0000 no matter the clock. Hold at least one LOW to count.',
      R02:  'Reset-to-zero input, 2 of 2. See R01 — both must be HIGH to reset.',
      NC1:  'Not connected. No internal bond; leave it open.',
      VCC:  'Positive supply, +5 V. Sits at pin 5, not a corner pin — easy to miswire.',
      R91:  'Set-to-nine input, 1 of 2. When R91 and R92 are both HIGH, the outputs are forced to 1001 (decimal 9). This overrides the reset inputs. Hold at least one LOW to count.',
      R92:  'Set-to-nine input, 2 of 2. See R91 — both must be HIGH to set 9.',
      QC:   'Count output bit 2 (weight 4).',
      QB:   'Count output bit 1 (weight 2).',
      GND:  'Ground, 0 V. Sits at pin 10, not a corner pin — easy to miswire.',
      QD:   'Count output bit 3 (weight 8, MSB).',
      QA:   'Count output bit 0 (weight 1, LSB) and the ÷2 section output. Wire to CKB for a 0 to 9 BCD count.',
      NC2:  'Not connected. No internal bond; leave it open.',
      CKA:  'Clock input to the ÷2 section (drives QA). Counts on the falling edge (HIGH→LOW). For a 0 to 9 BCD count, feed your clock here.',
    },
    pinout: [
      { pin: 1, name: 'CKB', type: 'input' },
      { pin: 2, name: 'R01', type: 'input' },
      { pin: 3, name: 'R02', type: 'input' },
      { pin: 4, name: 'NC1', type: 'nc' },
      { pin: 5, name: 'VCC', type: 'power' },
      { pin: 6, name: 'R91', type: 'input' },
      { pin: 7, name: 'R92', type: 'input' },
      { pin: 8, name: 'QC', type: 'output' },
      { pin: 9, name: 'QB', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'QD', type: 'output' },
      { pin: 12, name: 'QA', type: 'output' },
      { pin: 13, name: 'NC2', type: 'nc' },
      { pin: 14, name: 'CKA', type: 'input' },
    ],
    gates: [
      {
        type: 'COUNTER_DECADE',
        inputs: ['CKA', 'CKB', 'R01', 'R02', 'R91', 'R92'],
        outputs: ['QA', 'QB', 'QC', 'QD'],
      },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Two counters in one package',
        paragraphs: [
          'The 74x90 holds two independent counters that share only power and the reset/set logic. The ÷2 section takes clock CKA and produces QA — it just toggles high, low, high, low. The ÷5 section takes clock CKB and produces QB, QC, QD, cycling through five states before repeating.',
          'Nothing joins the two sections inside the chip; you wire them together outside. The usual choice is a 0 to 9 BCD count: connect QA to CKB and feed your clock into CKA. QA becomes the least significant bit, and its output clocks the ÷5 section, so the four outputs together read 0 through 9, then roll over to 0.',
          'Both sections trigger on the falling edge of their clock — the moment the clock goes from HIGH to LOW, not LOW to HIGH.',
        ],
        formulas: [
          'BCD count on QA→CKB, clock into CKA:',
          'count  QD QC QB QA     count  QD QC QB QA',
          '  0     0  0  0  0       5     0  1  0  1',
          '  1     0  0  0  1       6     0  1  1  0',
          '  2     0  0  1  0       7     0  1  1  1',
          '  3     0  0  1  1       8     1  0  0  0',
          '  4     0  1  0  0       9     1  0  0  1  → back to 0',
        ],
        note: 'This is an asynchronous (ripple) counter: one section clocks the next. The outputs do not all change at the same instant, so a brief wrong combination can appear right after a clock edge. Fine for driving a display, but it can glitch fast logic that decodes the outputs. (Simplified — 74Sim settles outputs instantly and does not show the few-nanosecond ripple delay.)',
      },
      {
        title: 'Reset and set to nine',
        paragraphs: [
          'Four control pins can force the outputs regardless of the clock. R01 and R02 are the reset pair; R91 and R92 are the set-to-nine pair. Each function needs BOTH of its pins HIGH — a single HIGH pin does nothing.',
          'Set-to-nine overrides reset. If the reset pair and the set-to-nine pair are asserted at the same time, the chip goes to 9 (1001), not 0. To count normally, keep all four control pins LOW.',
        ],
        formulas: [
          'R91 · R92 = HIGH            → QD QC QB QA = 1001  (set to 9, wins)',
          'R01 · R02 = HIGH (not set-9) → QD QC QB QA = 0000  (reset to 0)',
          'otherwise                    → count',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Count events and show the total as one decimal digit — feed QA to QD into a BCD-to-7-segment decoder like the 74x47.',
          'Build digital clocks and frequency counters by chaining several 74x90 stages, one per decimal digit (each QD carries to the next stage\'s clock).',
          'Divide a frequency by 10, by 5, or by 2 — use whichever section or combination you need.',
          'Get a clean 50% duty-cycle divide-by-ten: wire QD to CKA and clock into CKB (the "bi-quinary" mode). QA then gives a symmetrical square wave at one tenth the input frequency.',
        ],
      },
      {
        title: 'Gotchas for beginners',
        list: [
          'Power is in odd places: VCC is pin 5 and GND is pin 10, not the corners. Check this before wiring.',
          'The two sections are separate. Forget to connect QA to CKB and you get a ÷2 and a ÷5 counter, not a 0 to 9 count.',
          'It advances on the falling clock edge (HIGH→LOW), not the rising edge.',
          'Set-to-nine beats reset — holding all four control pins HIGH gives 9, not 0.',
          'To count freely, all four reset/set pins must be LOW. One left floating HIGH will freeze or force the count.',
        ],
      },
    ],
  },

  // ── 7491: 8 bit Shift Register ─────────────────────────────────────────
  /* Primary source: Texas Instruments, SN74LS91 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls91.pdf
     Shift register concept: https://en.wikipedia.org/wiki/Shift_register */
  '74x91': {
    name: '74x91',
    simpleName: '8 bit Serial In Serial Out Shift Register',
    description: '8-bit SISO shift register, AND-gated in, complementary out (14-pin)',
    pins: 14,
    vcc: 5,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls91.pdf',
    tags: ['shift register', 'serial', '8 bit', 'sequential', 'siso'],
    guideOverview: 'The 74x91 is an 8 bit serial in serial out (SISO) shift register. Data enters through AND gated inputs A and B, both must be HIGH to shift in a 1. After 8 clock pulses, data appears at output Q (and its complement Qn). Used for serial data delay, buffering, and storage.',
    guidePinDescriptions: {
      NC1:  'Not connected (pin 1).',
      NC2:  'Not connected (pin 2).',
      NC3:  'Not connected (pin 3).',
      NC4:  'Not connected (pin 4).',
      VCC:  'Positive supply (5V). Note: VCC is at pin 5, non standard position.',
      NC5:  'Not connected (pin 6).',
      NC6:  'Not connected (pin 7).',
      NC7:  'Not connected (pin 8).',
      CLK:  'Clock input. Data shifts on the rising edge.',
      GND:  'Ground reference at pin 10.',
      B:    'AND gate enable/data input. Both A and B must be HIGH to shift in a 1.',
      A:    'AND gate data input. Both A and B must be HIGH to shift in a 1.',
      Q:    'Serial output data appears here after 8 clock pulses.',
      Qn:   'Complement of Q output.',
    },
    pinout: [
      { pin:  1, name: 'NC1', type: 'nc'     },
      { pin:  2, name: 'NC2', type: 'nc'     },
      { pin:  3, name: 'NC3', type: 'nc'     },
      { pin:  4, name: 'NC4', type: 'nc'     },
      { pin:  5, name: 'VCC', type: 'power'  },
      { pin:  6, name: 'NC5', type: 'nc'     },
      { pin:  7, name: 'NC6', type: 'nc'     },
      { pin:  8, name: 'NC7', type: 'nc'     },
      { pin:  9, name: 'CLK', type: 'input'  },
      { pin: 10, name: 'GND', type: 'power'  },
      { pin: 11, name: 'B',   type: 'input'  },
      { pin: 12, name: 'A',   type: 'input'  },
      { pin: 13, name: 'Q',   type: 'output' },
      { pin: 14, name: 'Qn',  type: 'output' },
    ],
    gates: [
      { type: 'SHIFT_REG_SISO', inputs: ['A', 'B', 'CLK'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
    guideSections: [
      {
        title: '8 bit Serial Operation',
        paragraphs: [
          'To shift in a logic 1: set both A and B HIGH before the rising edge of CLK. To shift in a logic 0: hold either A or B LOW. Data ripples through 8 internal stages and emerges at Q after 8 clock pulses.',
          'Q and Qn are always complementary. This chip provides only serial output, there are no parallel tap outputs between stages.',
        ],
      },
    ],
  },

  // ── 7492: Divide by-12 Counter ─────────────────────────────────────────
  /* 74x92 — divide-by-twelve counter (7492A / SN74LS92).
     Source: Texas Instruments, "SN5490A, SN5492A, SN5493A, SN54LS90/92/93,
     SN7490A, SN7492A, SN7493A, SN74LS90/92/93 — Decade, Divide-By-Twelve and
     Binary Counters," SDLS940A, Mar. 1974 (rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls92.pdf. Verified against 300-dpi PDF
     page images (see issues.md C4): 'SN7492A/'LS92 package pinout (TOP VIEW, p.1) —
     CKB1, NC2, NC3, NC4, VCC5, R0(1)6, R0(2)7, QD8, QC9, GND10, QB11, QA12, NC13,
     CKA14; '92 IEC logic symbol p.2 (CKA→DIV2→QA; CKB→DIV3 producing QB,QC → DIV2→QD);
     '92A/'LS92 COUNT SEQUENCE p.3 (QD QC QB QA over counts 0–11, Note C: QA wired to
     CKB) and the shared '92/'93 RESET/COUNT FUNCTION TABLE p.3 (R0(1)·R0(2)=H → 0000,
     else count). Negative-edge master-slave JK stages (positive-logic diagram, p.4):
     the count advances on the falling clock edge. The ÷6 section is a ÷3 (QB,QC)
     followed by a ÷2 (QD), so its states run 000,001,010,100,101,110 — NOT a straight
     binary ÷6 — which makes QD a symmetric ÷12 square wave. Every pin number and
     behavioral claim below traces to this datasheet.
     FIXES (2026-07-05, this pass): (1) outputs on pins 8/9/11 were QC/QB/QD — the
     '93 output map wrongly cloned onto the '92 (issues.md C2 hazard) — corrected to
     QD/QC/QB per the '92A pinout above; (2) the COUNTER_DIV12 primitive's _advanceDiv6
     helper counted a straight binary 0–5, rewritten to the ÷3-then-÷2 sequence.
     Guard: js/debug/scenarios/74x92-div12-counter.mjs.
     Digital-counter background (concept only): https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x92': {
    name: '74x92',
    simpleName: 'Divide by-12 Counter',
    description: '÷12 ripple counter: ÷2 (QA) + ÷6 (QB-QD); wire QA to CKB. (14-pin)',
    pins: 14,
    vcc: 5,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls92.pdf',
    tags: ['counter', 'divider', 'divide by-12', 'sequential', 'ripple'],
    guideOverview: 'The 74x92 is a divide-by-12 counter: feed it a clock and it produces an output at 1/12 of that frequency. Inside are four flip flops in two blocks that are not wired together. Block A is a single flip flop (÷2): clock CKA and QA toggles at half the clock rate. Block B is three flip flops arranged as a ÷6 (clock CKB, outputs QB, QC, QD). For a full ÷12 you join them yourself: wire QA to CKB, feed your clock into CKA, and take the divided output from QD. That ÷6 block is not a plain binary counter, it is a ÷3 (QB, QC) followed by a ÷2 (QD), which is what makes QD a clean 50% duty square wave, the reason you reach for a 7492 in a clock divider. Both reset pins R0(1) and R0(2) HIGH at the same time clear every output to 0. Like the rest of this family it counts on the falling (HIGH to LOW) edge, and the power pins sit in unusual spots (VCC pin 5, GND pin 10).',
    guidePinDescriptions: {
      CKB:  'Clock for the ÷6 section (QB, QC, QD). Advances on the falling (HIGH to LOW) edge. Wire QA here for a full divide-by-12.',
      NC1:  'No internal connection (pin 2).',
      NC2:  'No internal connection (pin 3).',
      NC3:  'No internal connection (pin 4).',
      VCC:  'Positive supply (+5 V) at pin 5, an unusual spot: most 14-pin chips put +5 V on pin 14.',
      R01:  'Reset 1 of 2. Pull R0(1) and R0(2) both HIGH to force every output to 0 at once, whatever the clock is doing.',
      R02:  'Reset 2 of 2. Pull R0(1) and R0(2) both HIGH to force every output to 0 at once, whatever the clock is doing.',
      QD:   'Top output of the ÷6 section (pin 8). A ÷2 of the ÷3, so it is a clean 50% duty square wave at 1/6 of CKB, or 1/12 of CKA when QA is wired to CKB.',
      QC:   'Count output of the ÷6 section (pin 9). With QB it forms the ÷3 sub-counter inside block B.',
      GND:  'Ground (0 V) at pin 10, also unusual: most 14-pin chips put ground on pin 7.',
      QB:   'Count output of the ÷6 section (pin 11). With QC it forms the ÷3 sub-counter; it toggles fastest inside block B.',
      QA:   'The whole ÷2 section (pin 12). Toggles every clock, so it runs at half the CKA frequency. Wire to CKB for divide-by-12.',
      NC4:  'No internal connection (pin 13).',
      CKA:  'Clock for the ÷2 section (QA). Advances on the falling (HIGH to LOW) edge. Use as the main clock for divide-by-12.',
    },
    pinout: [
      { pin: 1, name: 'CKB', type: 'input' },
      { pin: 2, name: 'NC1', type: 'nc' },
      { pin: 3, name: 'NC2', type: 'nc' },
      { pin: 4, name: 'NC3', type: 'nc' },
      { pin: 5, name: 'VCC', type: 'power' },
      { pin: 6, name: 'R01', type: 'input' },
      { pin: 7, name: 'R02', type: 'input' },
      { pin: 8, name: 'QD', type: 'output' },
      { pin: 9, name: 'QC', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'QB', type: 'output' },
      { pin: 12, name: 'QA', type: 'output' },
      { pin: 13, name: 'NC4', type: 'nc' },
      { pin: 14, name: 'CKA', type: 'input' },
    ],
    gates: [
      {
        type: 'COUNTER_DIV12',
        inputs: ['CKA', 'CKB', 'R01', 'R02'],
        outputs: ['QA', 'QB', 'QC', 'QD'],
      },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Two sections you wire together',
        paragraphs: [
          'The 74x92 holds four flip flops in two blocks that are not connected inside the chip. Block A is one flip flop: clock it on CKA and QA toggles, running at half the clock frequency (÷2). Block B is three flip flops that divide by six: clock CKB and the outputs QB, QC, QD repeat every six pulses.',
          'For the full divide-by-12, join the blocks yourself: run a wire from QA (pin 12) to CKB (pin 1), feed your clock into CKA (pin 14), and take the divided output from QD (pin 8). Left separate, the two blocks give you a ÷2 and a ÷6 from one chip.',
          'The flip flops trigger on the falling edge: the count advances when the clock goes from HIGH to LOW, not from LOW to HIGH.',
        ],
        note: 'Watch the power pins: VCC is pin 5 and GND is pin 10, not the pin 14 and pin 7 you would expect on a 14-pin DIP.',
      },
      {
        title: 'The count sequence (it is not plain binary)',
        paragraphs: [
          'The ÷6 block is built as a ÷3 (QB and QC) followed by a ÷2 (QD), not as a plain 0-to-5 binary counter. Because of that, if you read the four outputs as a binary number they do not step 0, 1, 2, up to 11. The real sequence has a jump: once the outputs reach 0101 they go straight to 1000.',
          'What you get instead is very useful. QD, the last flip flop, splits the ÷6 exactly in half, so it is HIGH for six counts and LOW for six counts. Wired for ÷12 (QA into CKB, clock into CKA), that makes QD a clean 50% duty square wave at 1/12 of the input, which is why you pick a 7492 for a clock divider instead of wiring up a plain binary counter.',
        ],
        formulas: [
          'Count (QD QC QB QA), clock into CKA with QA wired to CKB:',
          '0:0000  1:0001  2:0010  3:0011  4:0100  5:0101',
          '6:1000  7:1001  8:1010  9:1011  10:1100  11:1101  → back to 0000',
          'QB,QC cycle 00→01→10 (÷3); QD toggles each time that ÷3 rolls over (÷2).',
        ],
      },
      {
        title: 'Reset, and shorter counts',
        paragraphs: [
          'There is no load or preset. The only way to force a known state is the reset, and it can only force 0. Pull both R0(1) and R0(2) HIGH and all four outputs clear to 0 immediately, ignoring the clock. If either reset pin is LOW, the chip counts. For normal counting, tie both reset pins LOW.',
          'The reset is asynchronous (it does not wait for a clock edge), so you can also use it to make shorter counts: decode the value you want to stop at and feed it back to the reset pins to clear early.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Divide a clock by 12 with a clean 50% duty square wave at QD (for example 60 Hz mains down to 5 Hz).',
          'Use just half the chip: divide by 2 at QA, or divide by 6 at QD by clocking CKB directly.',
          'Older digital clock and timing chains, where a ÷12 or ÷6 stage is common.',
          'Anywhere you need to slow a clock by 12 and do not need a straight binary count on the way.',
        ],
      },
    ],
  },

  // ── 7493: 4 bit Binary Counter ─────────────────────────────────────────
  /* 74x93 — 4 bit binary ripple counter (7493 / SN74LS93).
     Source: Texas Instruments, "SN5490A, SN5492A, SN5493A, SN54LS90/92/93,
     SN7490A, SN7492A, SN7493A, SN74LS90/92/93 — Decade, Divide-By-Twelve and
     Binary Counters," SDLS940A, Mar. 1974 (rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls93.pdf. Verified against 300-dpi PDF
     page images: '93A/'LS93 package pinout (TOP VIEW, p.1) — CKB1, R0(1)2, R0(2)3,
     NC4, VCC5, NC6, NC7, QC8, QB9, GND10, QD11, QA12, NC13, CKA14; IEC logic symbol
     p.2 (CKA→DIV2→QA, CKB→DIV8→QB/QC/QD, R0(1)·R0(2)→CT=0); '93A/'LS93 count sequence
     (0→15) + '92/'93 reset/count function table p.3; positive-logic logic diagram p.4
     showing negative-edge master-slave JK stages. Every pin number and behavioral
     claim below traces to this datasheet.
     Digital-counter background (concept only): https://en.wikipedia.org/wiki/Counter_(digital) */
  '74x93': {
    name: '74x93',
    simpleName: '4 bit Binary Counter (0 to 15)',
    description: '4-bit binary ripple counter: ÷2 and ÷8 combine for ÷16 (0-15) (14-pin)',
    pins: 14,
    vcc: 5,
    gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls93.pdf',
    tags: ['counter', 'binary', '4 bit', 'sequential', 'divider', 'ripple'],
    guideOverview: 'The 74x93 is a 4 bit asynchronous (ripple) binary counter. Inside are two counters that are not wired together: a ÷2 stage (clock CKA, output QA) and a ÷8 stage (clock CKB, outputs QB, QC, QD). Used on their own they give you a divide by-2 and a divide by-8 output. Wire QA to CKB and clock CKA, and the four outputs count 0 to 15 in binary and then roll over. It counts on the falling (HIGH to LOW) edge of the clock. This is about the cheapest, simplest counter there is, and you reach for it when you just need to divide a frequency or count pulses. To clear all outputs to 0000, both reset pins R0(1) and R0(2) must be HIGH at the same time.',
    guidePinDescriptions: {
      CKB:  'Clock for the ÷8 section (QB, QC, QD). Advances on the falling (HIGH to LOW) edge. Wire QA here for a full 4 bit count.',
      R01:  'Reset 1 of 2. Pull R0(1) and R0(2) both HIGH to force every output to 0 immediately, whatever the clock is doing.',
      R02:  'Reset 2 of 2. Pull R0(1) and R0(2) both HIGH to force every output to 0 immediately, whatever the clock is doing.',
      NC1:  'No internal connection (pin 4).',
      VCC:  'Positive supply (+5 V) at pin 5, an unusual spot: most 14-pin chips put +5 V on pin 14.',
      NC2:  'No internal connection (pin 6).',
      NC3:  'No internal connection (pin 7).',
      QC:   'Count output, bit 2 (weight 4). Part of the ÷8 section.',
      QB:   'Count output, bit 1 (weight 2). Part of the ÷8 section.',
      GND:  'Ground (0 V) at pin 10, also unusual: most 14-pin chips put ground on pin 7.',
      QD:   'Count output, bit 3, the MSB (weight 8). Part of the ÷8 section.',
      QA:   'Count output, bit 0, the LSB (weight 1). This is the whole ÷2 section. Wire to CKB for a full 4 bit count.',
      NC4:  'No internal connection (pin 13).',
      CKA:  'Clock for the ÷2 section (QA). Advances on the falling (HIGH to LOW) edge. Use as the main clock when counting 0 to 15.',
    },
    pinout: [
      { pin: 1, name: 'CKB', type: 'input' },
      { pin: 2, name: 'R01', type: 'input' },
      { pin: 3, name: 'R02', type: 'input' },
      { pin: 4, name: 'NC1', type: 'nc' },
      { pin: 5, name: 'VCC', type: 'power' },
      { pin: 6, name: 'NC2', type: 'nc' },
      { pin: 7, name: 'NC3', type: 'nc' },
      { pin: 8, name: 'QC', type: 'output' },
      { pin: 9, name: 'QB', type: 'output' },
      { pin: 10, name: 'GND', type: 'power' },
      { pin: 11, name: 'QD', type: 'output' },
      { pin: 12, name: 'QA', type: 'output' },
      { pin: 13, name: 'NC4', type: 'nc' },
      { pin: 14, name: 'CKA', type: 'input' },
    ],
    gates: [
      {
        type: 'COUNTER_4BIT',
        inputs: ['CKA', 'CKB', 'R01', 'R02'],
        outputs: ['QA', 'QB', 'QC', 'QD'],
      },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Two counters in one chip',
        paragraphs: [
          'The 74x93 holds four flip flops split into two blocks that are not connected inside the chip. Block A is a single flip flop: clock it on CKA and its output QA toggles, so QA runs at half the clock frequency (÷2). Block B is three flip flops chained together: clock CKB and QB, QC, QD count 0 to 7 and repeat (÷8).',
          'To count a full 0 to 15 you join the two blocks yourself: run a wire from QA (pin 12) to CKB (pin 1), feed your clock into CKA (pin 14), and read the count off QA, QB, QC, QD. Keeping the blocks separate is deliberate. It lets one chip give you a ÷2 and a ÷8 output at once, or you can use just the ÷8 side on its own.',
          'The flip flops trigger on the falling edge of their clock. The count advances when the clock goes from HIGH to LOW, not from LOW to HIGH.',
        ],
        note: 'Watch the power pins: VCC is pin 5 and GND is pin 10, not the pin 14 and pin 7 you expect on a 14-pin DIP.',
      },
      {
        title: 'Counting 0 to 15',
        paragraphs: [
          'With QA wired to CKB, each output runs at half the frequency of the one before it: QA toggles every clock, QB every 2 clocks, QC every 4, QD every 8. Read the outputs as a binary number with QD as the most significant bit and they step 0, 1, 2, up to 15, then wrap back to 0.',
        ],
        formulas: [
          'Count (QD QC QB QA): 0000, 0001, 0010, 0011, 0100, 0101, 0110, 0111,',
          '1000, 1001, 1010, 1011, 1100, 1101, 1110, 1111, then back to 0000.',
          'QA = clock ÷2,  QB = clock ÷4,  QC = clock ÷8,  QD = clock ÷16.',
        ],
      },
      {
        title: 'Reset, and making shorter counts',
        paragraphs: [
          'The counter has no load or preset input. The only way to force a known value is the reset, and it can only force 0. Pull R0(1) and R0(2) both HIGH and all four outputs go to 0000 right away, ignoring the clock. If either reset pin is LOW, the chip counts normally. For everyday counting, tie both reset pins LOW.',
          'Because the reset is instant (asynchronous), you can make the counter wrap early. Decode the count you want to stop at and feed it back to the reset pins. To count 0 to 9 (a decade), note that 10 is binary 1010, where QB and QD are both HIGH: connect QB to R0(1) and QD to R0(2), and the instant the counter reaches 10 it clears itself to 0. The same trick gives any count length up to 16.',
        ],
      },
      {
        title: 'Ripple counting, and the catch',
        paragraphs: [
          'Asynchronous means the flip flops do not all switch at the same instant. Each stage clocks the next, so a change ripples down the chain one flip flop at a time. Going from 7 (0111) to 8 (1000), the outputs briefly pass through wrong values as the carry works its way up.',
          'For dividing a frequency or blinking an LED this never matters. It bites you when you feed the outputs into gates that watch for a specific count, because those gates can see a brief false value (a glitch) during the ripple. When that matters, use a synchronous counter such as the 74x161 or 74x163, whose outputs all change together.',
        ],
        note: 'Real ripple delay is a few nanoseconds per stage. The simulator updates the outputs together and does not model that delay. This is a simplification.',
      },
      {
        title: 'Common Uses',
        list: [
          'Frequency division: tap QA, QB, QC, QD for ÷2, ÷4, ÷8, ÷16 of the input clock.',
          'Counting events or pulses where the exact output timing does not matter.',
          'Short custom counts (÷10, ÷12, ÷6, and so on) by feeding a decoded count back to the reset pins.',
          'Cheap glue in clocks, timers, and simple frequency dividers.',
        ],
      },
    ],
  },

  // ── 7495: 4 bit Parallel Access Shift Register ─────────────────────────
  // Source: Texas Instruments, "SN5495A, SN54LS95B, SN7495A, SN74LS95B 4-Bit
  //   Parallel-Access Shift Registers", doc SDLS128 (Mar. 1974, rev. Mar. 1988).
  //   [Online]. Available: https://www.ti.com/lit/gpn/sn74ls95b. Verified:
  //   terminal assignment (N-package top view), functional description and
  //   function table, page 1, read as 300-dpi PDF page images (issues.md C4 —
  //   NOT a text summary; live TI symlink 404s, read via the unicornelectronics
  //   .com/ftp/Data Sheets/7495.pdf mirror of the same TI doc). Confirms the
  //   pinout below and that CLK1/CLK2 are falling-edge ("active LOW-going edge").
  // Source: Motorola, "SN54/74LS95B 4-Bit Shift Register", in FAST and LS TTL
  //   Data. [Online]. Available: http://www.applelogic.org/files/74LS95.pdf.
  //   Verified: connection diagram + MODE SELECT truth table + logic diagram,
  //   pages 1-2, read as PDF page images. Independent second source for the same
  //   pinout and the HIGH→LOW clocking (CP1/CP2 = "Active LOW Going Edge").
  // Engine note: the SN74x95 clocks on the HIGH→LOW transition; the shared
  //   SHIFT_REG_4BIT primitive defaulted to rising, so this gate sets
  //   edge:'falling'. See issues.md C112.
  '74x95': {
    name: '74x95',
    simpleName: '4 bit Parallel Access Shift Register',
    description: '4-bit shift register: shift-right or parallel load, falling-edge (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/gpn/sn74ls95b',
    tags: ['shift register', 'parallel', '4 bit', 'sequential', 'serial'],
    guideOverview: 'The 74x95 is a 4 bit shift register that can either move data through one bit at a time or load all four bits at once. The MODE pin picks which: MODE LOW selects serial shift (data enters at SER and moves QA→QB→QC→QD), MODE HIGH selects parallel load (inputs A to D are copied straight into QA to QD). The two jobs use separate clocks: CLK1 for shifting, CLK2 for loading. Unlike most modern registers, this part acts on the falling edge of the clock (the HIGH to LOW step), not the rising edge. It has no reset pin, so to clear it you load 0000. The four outputs QA to QD are always visible.',
    guidePinDescriptions: {
      SER:  'Serial data input. On a falling CLK1 edge in shift mode it becomes the new QA.',
      A:    'Parallel input for bit QA. Copied into QA on a falling CLK2 edge when MODE is HIGH.',
      B:    'Parallel input for bit QB. Copied into QB on a falling CLK2 edge when MODE is HIGH.',
      C:    'Parallel input for bit QC. Copied into QC on a falling CLK2 edge when MODE is HIGH.',
      D:    'Parallel input for bit QD. Copied into QD on a falling CLK2 edge when MODE is HIGH.',
      MODE: 'Mode select. LOW = shift right (use CLK1). HIGH = parallel load (use CLK2). Change it only while both clocks are LOW.',
      GND:  'Ground reference (pin 7).',
      CLK2: 'Load clock. A HIGH to LOW edge loads A to D into the register when MODE is HIGH.',
      CLK1: 'Shift clock. A HIGH to LOW edge shifts the register right (SER → QA → QB → QC → QD) when MODE is LOW.',
      QD:   'Output bit 3 (MSB), the last stage of the shift chain.',
      QC:   'Output bit 2.',
      QB:   'Output bit 1.',
      QA:   'Output bit 0 (LSB), the first stage. New serial data appears here.',
      VCC:  'Positive supply (+5 V) at pin 14.',
    },
    pinout: [
      { pin: 1, name: 'SER', type: 'input' },
      { pin: 2, name: 'A', type: 'input' },
      { pin: 3, name: 'B', type: 'input' },
      { pin: 4, name: 'C', type: 'input' },
      { pin: 5, name: 'D', type: 'input' },
      { pin: 6, name: 'MODE', type: 'input' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: 'CLK2', type: 'input' },
      { pin: 9, name: 'CLK1', type: 'input' },
      { pin: 10, name: 'QD', type: 'output' },
      { pin: 11, name: 'QC', type: 'output' },
      { pin: 12, name: 'QB', type: 'output' },
      { pin: 13, name: 'QA', type: 'output' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        type: 'SHIFT_REG_4BIT',
        edge: 'falling',
        inputs: ['SER', 'A', 'B', 'C', 'D', 'MODE', 'CLK1', 'CLK2'],
        outputs: ['QA', 'QB', 'QC', 'QD'],
      },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Two Modes, Two Clocks',
        paragraphs: [
          'The MODE pin chooses what the chip does. With MODE LOW it is in shift mode and watches CLK1; with MODE HIGH it is in load mode and watches CLK2. The clock it is not using is ignored, so in a simple design you can tie CLK1 and CLK2 together and let MODE alone decide shift-versus-load.',
          'In shift mode, each clock moves every bit one place to the right: whatever is on SER becomes QA, the old QA moves to QB, QB to QC, QC to QD, and the old QD drops off the end and is lost. In load mode, inputs A, B, C, D are copied into QA, QB, QC, QD all at once, replacing whatever was there.',
        ],
      },
      {
        title: 'Function Table',
        formulas: [
          'MODE=0 (shift), CLK1 falling: QA←SER, QB←QA, QC←QB, QD←QC',
          'MODE=1 (load),  CLK2 falling: QA←A, QB←B, QC←C, QD←D',
          'No falling clock edge on the selected clock: outputs hold',
        ],
      },
      {
        title: 'It Clocks on the Falling Edge',
        paragraphs: [
          'Most registers you meet capture data on the rising edge of the clock (the LOW to HIGH step). The 74x95 is the opposite: it acts on the falling edge, the HIGH to LOW step. The datasheet calls this the "active LOW-going edge." Drive it with a clock meant for a rising-edge part and the data lands half a clock later than you expect.',
          'The practical rule: set up SER (or A to D) while the clock is HIGH, then bring the clock LOW to capture.',
        ],
        note: 'The simulator captures the new value the instant the clock steps from HIGH to LOW and updates all four outputs together. Real silicon needs a few nanoseconds of setup and hold time before the edge and takes a few nanoseconds to update its outputs after it; the simulator does not model that timing. This is a simplification.',
      },
      {
        title: 'Shifting the Other Way',
        paragraphs: [
          'On its own the 74x95 only shifts right (toward QD). You can make it shift left with a few external wires: connect QD back to input C, QC to input B, and QB to input A, feed the new bit into input D, and run the chip in load mode (MODE HIGH) clocking CLK2. Each "load" now looks like a left shift, because every stage takes the value of the stage to its right. This trick is why the part is often grouped with the universal shift registers even though it has no built-in left mode.',
        ],
      },
      {
        title: 'Clearing It (There Is No Reset)',
        paragraphs: [
          'The 74x95 has no clear or reset pin. To force it to a known value you parallel-load it: put the value you want on A to D (all LOW to clear), set MODE HIGH, and pulse CLK2. Loading is the only way to set the contents without shifting.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Serial-to-parallel conversion: feed a bit stream into SER and read the assembled 4 bit word off QA to QD.',
          'Parallel-to-serial conversion: load a word through A to D, then shift it out one bit at a time on QD.',
          'A short delay line: a bit reaches QD four clocks after it enters SER.',
          'A bidirectional shift register, using the external-wiring left-shift trick above.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'It clocks on the falling edge, not the rising edge — the most common surprise with this part.',
          'Switch MODE only while both clocks are LOW. Changing mode while a clock is HIGH can disturb the stored bits.',
          'There is no reset pin; clear the register by loading zeros.',
          'By itself it shifts only to the right — left-shifting needs the external wiring trick.',
        ],
      },
    ],
  },

  // ── 74107: Dual negative-edge JK flip flop, active-LOW clear, no preset ───
  // Source: Texas Instruments, "SN54107, SN54LS107A, SN74107, SN74LS107A Dual
  //   J-K Flip-Flops With Clear," datasheet SDLS036 (Dec. 1983, rev. Mar. 1988).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls107a.pdf.
  //   Verified: terminal assignment (J/D/N package, top view), both the '107
  //   (master-slave) and 'LS107A (negative-edge) function tables, and the logic
  //   symbols — pages 1 & 3, read as rendered PDF page images (issues.md C4),
  //   NOT via a text summarizer and NOT cloned from a sibling (issues.md C2).
  //   - Pinout CONFIRMED correct against the datasheet: 1J=1, 1Qn=2, 1Q=3,
  //     1K=4, 2Q=5, 2Qn=6, GND=7, 2J=8, 2CLK=9, 2CLR=10, 2K=11, 1CLK=12,
  //     1CLR=13, VCC=14 (1CLR/2CLR active LOW). Engine pinout[] left untouched.
  //   - Behavior: Q updates on the HIGH→LOW (negative) clock transition for
  //     both variants; CLR is active-LOW asynchronous; there is NO preset. The
  //     sim models the clean 'LS107A negative-edge behavior (a simplification —
  //     it drops the master-slave "ones-catching" quirk of the original '107).
  //   FIXED 2026-07-05 (issues.md C113): the shared JK_FF_SIMPLE primitive
  //     defaulted to the RISING edge, so this part had been toggling on the
  //     wrong edge. Added a per-gate triggerEdge passthrough in
  //     _evaluateJKFFSimple and set triggerEdge:'falling' on both gates below;
  //     every other JK_FF_SIMPLE user (no flag) is unchanged.
  // JK / master-slave / ones-catching background: Wikipedia contributors,
  //   "Flip-flop (electronics)," https://en.wikipedia.org/wiki/Flip-flop_(electronics)
  //   (JK and master-slave sections). Used only for the history note, not pins.
  '74x107': {
    name: '74x107',
    simpleName: 'Dual JK FF (Neg Edge, Active LOW CLR)',
    description: 'Dual neg-edge JK flip flop, active LOW clear, no preset. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls107a.pdf',
    tags: ['flip flop', 'jk', 'sequential', 'dual', 'clear', 'negative edge', 'toggle', 'counter'],
    guideOverview: 'The 74x107 holds two independent JK flip flops, each with its own J, K, clock, and clear. A JK flip flop is a one-bit memory: on each active clock edge the J and K inputs decide what the stored bit does — hold it, set it to 1, reset it to 0, or flip it. This part clocks on the falling edge (the HIGH→LOW step of the clock), and its clear is asynchronous and active LOW, so pulling a clear pin LOW forces that flip flop\'s Q to 0 right away without waiting for a clock. There is no preset pin, so there is no matching way to force Q to 1 on demand — you have to clock a 1 in. The everyday reason to reach for it is the toggle: tie J and K both HIGH and Q flips on every clock, which divides the clock frequency by two; chain several and you have a ripple counter. Watch the pinout — each flip flop\'s two outputs sit right beside its inputs, and the clock and clear pins are bunched near the bottom (pins 9 to 13), which is easy to miswire.',
    guidePinDescriptions: {
      '1J':   'J input of flip flop 1. With 1K, sets what FF1 does on its clock edge.',
      '1Qn':  'Complement output of flip flop 1 — always the opposite of 1Q.',
      '1Q':   'Output of flip flop 1 (the stored bit).',
      '1K':   'K input of flip flop 1.',
      '2Q':   'Output of flip flop 2 (the stored bit).',
      '2Qn':  'Complement output of flip flop 2 — always the opposite of 2Q.',
      GND:    'Ground reference (pin 7).',
      '2J':   'J input of flip flop 2.',
      '2CLK': 'Clock for flip flop 2. FF2 updates on the falling (HIGH→LOW) edge.',
      '2CLR': 'Asynchronous clear for FF2, active LOW. Hold HIGH for normal use; pull LOW to force 2Q=0 at once.',
      '2K':   'K input of flip flop 2.',
      '1CLK': 'Clock for flip flop 1. FF1 updates on the falling (HIGH→LOW) edge.',
      '1CLR': 'Asynchronous clear for FF1, active LOW. Hold HIGH for normal use; pull LOW to force 1Q=0 at once.',
      VCC:    'Positive supply (+5 V) at pin 14.',
    },
    pinout: [
      { pin: 1, name: '1J', type: 'input' },
      { pin: 2, name: '1Qn', type: 'output' },
      { pin: 3, name: '1Q', type: 'output' },
      { pin: 4, name: '1K', type: 'input' },
      { pin: 5, name: '2Q', type: 'output' },
      { pin: 6, name: '2Qn', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '2J', type: 'input' },
      { pin: 9, name: '2CLK', type: 'input' },
      { pin: 10, name: '2CLR', type: 'input' },
      { pin: 11, name: '2K', type: 'input' },
      { pin: 12, name: '1CLK', type: 'input' },
      { pin: 13, name: '1CLR', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_SIMPLE', inputs: ['1J', '1K', '1CLK', '1CLR'], outputs: ['1Q', '1Qn'], triggerEdge: 'falling' },
      { type: 'JK_FF_SIMPLE', inputs: ['2J', '2K', '2CLK', '2CLR'], outputs: ['2Q', '2Qn'], triggerEdge: 'falling' },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'How a JK Flip Flop Works',
        paragraphs: [
          'J and K are the two control inputs. They do nothing on their own; the chip only acts on them when the clock makes its active edge. On this part that edge is the falling one — the moment the clock steps from HIGH to LOW. Think of J as a "set" request and K as a "reset" request, both checked at that instant.',
          'There are four cases. J=0, K=0 holds the current value. J=1, K=0 sets Q to 1. J=0, K=1 resets Q to 0. J=1, K=1 toggles — Q flips to the opposite of whatever it was. That toggle case is the thing a JK gives you that a plain D flip flop cannot.',
          'The second output, written Qn here (Q with a bar over it on the datasheet), is simply the opposite of Q at all times.',
        ],
        formulas: [
          'CLR=0                     → Q=0, Qn=1  (clear wins, ignores clock/J/K)',
          'CLR=1, falling edge, J=0 K=0 → Q holds',
          'CLR=1, falling edge, J=1 K=0 → Q=1   (set)',
          'CLR=1, falling edge, J=0 K=1 → Q=0   (reset)',
          'CLR=1, falling edge, J=1 K=1 → Q flips (toggle)',
        ],
      },
      {
        title: 'Clear, But No Preset',
        paragraphs: [
          'Each flip flop has one override pin: an active-LOW clear (CLR). "Asynchronous" means it does not wait for a clock — the instant CLR goes LOW, Q is forced to 0 and Qn to 1. "Active LOW" means LOW is the action level, so keep CLR HIGH whenever you want normal clocked operation.',
          'There is no preset. Some JK flip flops (the 74x76, for example) add a second override that forces Q to 1; this part leaves it out. So you can clear a flip flop to 0 on demand, but the only way to make Q a 1 is to clock it there with J=1. Plan your reset scheme around that.',
        ],
        note: 'A clear pin left unconnected on real TTL tends to float HIGH (inactive), but that is not something to rely on — tie every clear to a defined level.',
      },
      {
        title: 'Master-Slave vs Edge-Triggered (a history note)',
        paragraphs: [
          'The number "107" covers two generations that behave a little differently. The original bipolar 74107 is a master-slave (pulse-triggered) flip flop: it copies J and K into an internal "master" stage while the clock is HIGH, then moves that value to the output on the HIGH→LOW step. The catch, called "ones-catching," is that even a brief HIGH glitch on J or K while the clock is HIGH gets captured and cannot be taken back — so on that part J and K must be held steady the whole time the clock is HIGH.',
          'The later 74LS107A fixes this: it is truly negative-edge-triggered, sampling J and K only in the instant of the falling edge. This simulator models that cleaner edge-triggered behavior. That is a simplification — it ignores the ones-catching quirk of the oldest parts — but it matches how a 74LS107A or 74HC107 you buy today actually works.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Toggle (T) flip flop: tie J and K both HIGH so Q flips on every falling clock edge. One flip flop then outputs half the clock frequency — a divide-by-2.',
          'Ripple counter: run the clock into the first flip flop in toggle mode, then drive each next flip flop from the previous stage\'s output. Each stage halves the rate again, giving a binary count. Two flip flops here make a divide-by-4; chain more packages for more bits.',
          'A single-bit state flag, set and cleared under logic control.',
          'Clearing a whole counter at once: wire every CLR together and pull the line LOW to force all flip flops to 0.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'It clocks on the falling edge, not the rising edge — the single most common surprise with this part. If a counter built from it seems to lag by half a clock, this is why.',
          'Clear is active LOW. Holding a clear pin LOW (or leaving it grounded) pins that Q at 0 no matter what the clock does; keep clears HIGH for normal operation.',
          'There is no preset — you cannot force Q to 1 asynchronously, only clock it there with J=1.',
          'On the original master-slave 74107, keep J and K steady while the clock is HIGH (ones-catching). The 74LS107A and this simulator drop that restriction, but real master-slave parts have it.',
          'Do not leave J, K, or clock inputs floating; tie every unused input to a defined level.',
        ],
        note: 'Real flip flops take a few nanoseconds to respond after the clock edge (propagation delay) and need J and K held steady for a short setup-and-hold window around it. The simulator treats both as zero, which is a simplification: it will not show the timing hazards that matter at high clock rates.',
      },
    ],
  },

  // ── 74109: Dual JK positive edge triggered flip flop with preset and clear ─
  /* Primary source: Texas Instruments, SN74LS109A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls109a.pdf
     Flip flop concept: https://en.wikipedia.org/wiki/Flip-flop_(electronics) */
  '74x109': {
    name: '74x109',
    simpleName: 'Dual JK# FF (pos edge)',
    description: 'Dual JK pos-edge flip flop, active LOW preset & clear. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls109a.pdf',
    tags: ['flip flop', 'flip flop', 'jk', 'sequential', 'dual', 'edge triggered', 'positive-edge', 'preset', 'clear'],
    guideOverview: 'The 74x109 provides two independent positive edge triggered JK flip flops. Unlike most JK flip flops that have active HIGH K, this device uses an active LOW K input (Kn). So to set the flip flop: J=1, Kn=1 (K effectively LOW); to reset: J=0, Kn=0 (K effectively HIGH). Both active LOW preset (PRE#) and clear (CLR#) pins override the clock asynchronously.',
    guidePinDescriptions: {
      '1CLR': 'Asynchronous clear for FF1, active LOW. Forces 1Q=0 immediately.',
      '1J':   'J input for FF1.',
      '1Kn':  'K-bar (inverted K) input for FF1. Pull LOW to effectively set K=HIGH (reset on clock edge); pull HIGH to set K=LOW (set on clock edge).',
      '1CLK': 'Clock input for FF1. State changes on the rising edge.',
      '1PRE': 'Asynchronous preset for FF1, active LOW. Forces 1Q=1 immediately.',
      '1Q':   'True output of FF1.',
      '1Qn':  'Inverted output of FF1.',
      'GND':  'Ground reference (pin 8).',
      '2Qn':  'Inverted output of FF2.',
      '2Q':   'True output of FF2.',
      '2PRE': 'Asynchronous preset for FF2, active LOW.',
      '2CLK': 'Clock input for FF2. State changes on the rising edge.',
      '2Kn':  'K-bar input for FF2.',
      '2J':   'J input for FF2.',
      '2CLR': 'Asynchronous clear for FF2, active LOW.',
      'VCC':  'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'JK# (Inverted K) Operation',
        paragraphs: [
          'The 74x109 uses J and Kn (K-bar) rather than J and K. Kn is the logical complement of K: when Kn=LOW, K is effectively HIGH.',
          'J=0, Kn=1 → hold (J=0, K=0); J=1, Kn=1 → set Q=1 (J=1, K=0); J=0, Kn=0 → reset Q=0 (J=0, K=1); J=1, Kn=0 → toggle (J=1, K=1).',
        ],
        note: 'Updates occur on the positive (rising) clock edge, unlike the 74x76 and 74x73 which trigger on the negative edge.',
      },
    ],
    pinout: [
      { pin: 1,  name: '1CLR', type: 'input',  description: 'Clear (reset) input for FF1 (active LOW, sets Q=0 immediately)' },
      { pin: 2,  name: '1J',   type: 'input',  description: 'J input for FF1' },
      { pin: 3,  name: '1Kn',  type: 'input',  description: 'K-bar (inverted K) input for FF1, LOW=set, HIGH=reset when clocked' },
      { pin: 4,  name: '1CLK', type: 'input',  description: 'Clock input for FF1 (triggers on rising edge)' },
      { pin: 5,  name: '1PRE', type: 'input',  description: 'Preset input for FF1 (active LOW, sets Q=1 immediately)' },
      { pin: 6,  name: '1Q',   type: 'output', description: 'Q output of FF1' },
      { pin: 7,  name: '1Qn',  type: 'output', description: 'Q-bar (inverted) output of FF1' },
      { pin: 8,  name: 'GND',  type: 'power' },
      { pin: 9,  name: '2Qn',  type: 'output', description: 'Q-bar (inverted) output of FF2' },
      { pin: 10, name: '2Q',   type: 'output', description: 'Q output of FF2' },
      { pin: 11, name: '2PRE', type: 'input',  description: 'Preset input for FF2 (active LOW, sets Q=1 immediately)' },
      { pin: 12, name: '2CLK', type: 'input',  description: 'Clock input for FF2 (triggers on rising edge)' },
      { pin: 13, name: '2Kn',  type: 'input',  description: 'K-bar (inverted K) input for FF2, LOW=set, HIGH=reset when clocked' },
      { pin: 14, name: '2J',   type: 'input',  description: 'J input for FF2' },
      { pin: 15, name: '2CLR', type: 'input',  description: 'Clear (reset) input for FF2 (active LOW, sets Q=0 immediately)' },
      { pin: 16, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'JK_FF_FULL', inputs: ['1J', '1Kn', '1CLK', '1PRE', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'JK_FF_FULL', inputs: ['2J', '2Kn', '2CLK', '2PRE', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74121: Monostable Multivibrator ────────────────────────────────────
  /* Primary source: Texas Instruments, SN74121 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74121.pdf */
  '74x121': {
    name: '74x121',
    simpleName: 'One Shot (non retrig)',
    description: 'Non-retriggerable monostable multivibrator (one-shot). (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74121.pdf',
    tags: ['monostable', 'multivibrator', 'one shot', 'timer', 'pulse', 'non-retriggerable'],
    guideOverview: 'The 74x121 is a non retriggerable monostable multivibrator (one shot). When triggered, it generates a single fixed width output pulse. If additional triggers arrive during the pulse, they are ignored. The pulse width is set by an internal 2 kΩ resistor (when RINT is tied to VCC) or an external RC network on the REXT/CEXT pins.',
    guidePinDescriptions: {
      'Qn':   'Inverted output. HIGH when idle; LOW during the output pulse.',
      'NC1':  'Not connected (pin 2). Leave unconnected.',
      'A1':   'Trigger input 1, active LOW. A falling edge here (while B=HIGH) triggers the one shot.',
      'A2':   'Trigger input 2, active LOW. A falling edge here (while B=HIGH) triggers the one shot.',
      'B':    'Trigger input, active HIGH. A rising edge here (while A1 or A2 is LOW) triggers the one shot.',
      'Q':    'True output. LOW when idle; HIGH during the output pulse.',
      'GND':  'Ground reference (pin 7).',
      'NC2':  'Not connected (pin 8).',
      'RINT': 'Internal resistor connection. Tie to VCC to use the internal ~2 kΩ timing resistor.',
      'CEXT': 'External timing capacitor. Connect one side here, other side to REXT.',
      'REXT': 'External timing resistor connection. RC network here sets pulse width.',
      'NC3':  'Not connected (pin 12).',
      'NC4':  'Not connected (pin 13).',
      'VCC':  'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'One Shot Pulse Width',
        paragraphs: [
          'Connect a resistor R between VCC and REXT, and a capacitor C from REXT to GND. The output pulse width is approximately: tW ≈ 0.7 × R × C. Minimum pulse with internal resistor only (~2 kΩ) and no external capacitor is approximately 35 ns.',
          'To trigger: hold B=HIGH and pulse A1 or A2 LOW; or hold A1 and A2 LOW and pulse B HIGH. Once triggered, additional triggers are ignored until the pulse ends.',
        ],
        formulas: ['tW ≈ 0.7 × R × C'],
        note: 'For a retriggerable version that extends the pulse on each new trigger, use the 74x122 or 74x123.',
      },
    ],
    pinout: [
      { pin: 1,  name: 'Qn',   type: 'output', description: 'Inverted (Q-bar) output, HIGH when idle, LOW during pulse' },
      { pin: 2,  name: 'NC1',  type: 'nc',  description: 'No connection' },
      { pin: 3,  name: 'A1',   type: 'input',  description: 'Active LOW trigger input 1 (used with B to trigger pulse)' },
      { pin: 4,  name: 'A2',   type: 'input',  description: 'Active LOW trigger input 2 (used with B to trigger pulse)' },
      { pin: 5,  name: 'B',    type: 'input',  description: 'Active HIGH trigger input; pulse fires when B=HIGH and A1 or A2 is LOW' },
      { pin: 6,  name: 'Q',    type: 'output', description: 'Non inverted output, LOW when idle, HIGH during pulse' },
      { pin: 7,  name: 'GND',  type: 'power' },
      { pin: 8,  name: 'NC2',  type: 'nc',  description: 'No connection' },
      { pin: 9,  name: 'RINT', type: 'input',  description: 'Connect to VCC to use internal timing resistor (~2kΩ)' },
      { pin: 10, name: 'CEXT', type: 'input',  description: 'External timing capacitor connection' },
      { pin: 11, name: 'REXT', type: 'input',  description: 'External timing resistor/RC network connection' },
      { pin: 12, name: 'NC3',  type: 'nc',  description: 'No connection' },
      { pin: 13, name: 'NC4',  type: 'nc',  description: 'No connection' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'MONOSTABLE', inputs: ['A1', 'A2', 'B'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },

  // ── 74122: Retriggerable Monostable Multivibrator (with clear) ─────────
  /* Primary source: Texas Instruments, SN74LS122 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls122.pdf */
  '74x122': {
    name: '74x122',
    simpleName: 'One Shot (retriggerable)',
    description: 'Retriggerable monostable (one-shot), active LOW clear. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls122.pdf',
    tags: ['monostable', 'multivibrator', 'one shot', 'timer', 'pulse', 'retriggerable', 'clear'],
    guideOverview: 'The 74x122 is a single retriggerable monostable multivibrator. Unlike the 74x121, each new valid trigger while the output pulse is active extends the pulse duration from that moment. This allows you to create a pulse that stays HIGH as long as triggers keep arriving within the pulse interval. An active LOW CLR input can terminate the pulse immediately.',
    guidePinDescriptions: {
      'A1':   'Trigger input 1, active LOW.',
      'A2':   'Trigger input 2, active LOW.',
      'B1':   'Trigger input 1, active HIGH.',
      'B2':   'Trigger input 2, active HIGH.',
      'CLR':  'Clear, active LOW. Pull LOW to immediately end any active pulse and return output to idle.',
      'Qn':   'Inverted output. HIGH when idle, LOW during pulse.',
      'GND':  'Ground reference (pin 7).',
      'Q':    'True output. LOW when idle, HIGH during pulse.',
      'RINT': 'Connect to VCC to use internal 10 kΩ timing resistor.',
      'NC1':  'Not connected (pin 10).',
      'CEXT': 'External timing capacitor connection.',
      'NC2':  'Not connected (pin 12).',
      'REXT': 'External timing resistor/RC network connection.',
      'VCC':  'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Retriggerable One Shot',
        paragraphs: [
          'On each valid trigger edge, the output goes HIGH for a duration of tW. If another valid trigger arrives before tW expires, the timer resets and the output remains HIGH for another full tW from that point.',
          'This is useful for watchdog timers and activity detectors: the output stays HIGH while signals keep arriving and drops LOW only when there is a gap larger than tW.',
        ],
        formulas: ['tW ≈ 0.7 × R × C'],
        note: 'For a non retriggerable one shot, use the 74x121 or 74x221.',
      },
    ],
    pinout: [
      { pin: 1,  name: 'A1',   type: 'input',  description: 'Active LOW trigger input 1' },
      { pin: 2,  name: 'A2',   type: 'input',  description: 'Active LOW trigger input 2' },
      { pin: 3,  name: 'B1',   type: 'input',  description: 'Active HIGH trigger input 1' },
      { pin: 4,  name: 'B2',   type: 'input',  description: 'Active HIGH trigger input 2' },
      { pin: 5,  name: 'CLR',  type: 'input',  description: 'Clear input (active LOW), aborts pulse and forces Q=LOW' },
      { pin: 6,  name: 'Qn',   type: 'output', description: 'Inverted (Q-bar) output, HIGH when idle, LOW during pulse' },
      { pin: 7,  name: 'GND',  type: 'power' },
      { pin: 8,  name: 'Q',    type: 'output', description: 'Non inverted output, LOW when idle, HIGH during pulse' },
      { pin: 9,  name: 'RINT', type: 'input',  description: 'Connect to VCC to use internal 10kΩ timing resistor' },
      { pin: 10, name: 'NC1',  type: 'nc',  description: 'No connection' },
      { pin: 11, name: 'CEXT', type: 'input',  description: 'External timing capacitor connection' },
      { pin: 12, name: 'NC2',  type: 'nc',  description: 'No connection' },
      { pin: 13, name: 'REXT', type: 'input',  description: 'External timing resistor/RC network connection' },
      { pin: 14, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'MONOSTABLE_122', inputs: ['A1', 'A2', 'B1', 'B2', 'CLR'], outputs: ['Q', 'Qn'] },
    ],
    sequential: true,
  },
  '74x123': {
    name: '74x123',
    simpleName: 'Dual One Shot (retriggerable)',
    description: 'Dual retriggerable monostable multivibrator with active LOW clear. (16-pin)',
    guideOverview: 'The 74x123 is the dual version of the 74x122: two independent retriggerable one shot circuits in a 16-pin package. Each section has separate A# (active LOW) and B (active HIGH) trigger inputs, an active LOW clear, and individual external R/C timing pins. Both Q and Q-bar outputs are available per section.',
    guidePinDescriptions: {
      '1A':    'Active LOW trigger for section 1. Falling edge (while 1B=HIGH) triggers the pulse.',
      '1B':    'Active HIGH trigger for section 1. Rising edge (while 1A#=LOW) triggers the pulse.',
      '1CLR':  'Clear for section 1, active LOW. Pull LOW to immediately end pulse.',
      '1Qn':   'Inverted output of section 1. HIGH when idle, LOW during pulse.',
      '2Q':    'True output of section 2. LOW when idle, HIGH during pulse.',
      '2CEXT': 'External timing capacitor connection for section 2.',
      '2REXT': 'External timing resistor connection for section 2.',
      'GND':   'Ground reference (pin 8).',
      '2A':    'Active LOW trigger for section 2.',
      '2B':    'Active HIGH trigger for section 2.',
      '2CLR':  'Clear for section 2, active LOW.',
      '2Qn':   'Inverted output of section 2.',
      '1Q':    'True output of section 1. LOW when idle, HIGH during pulse.',
      '1CEXT': 'External timing capacitor connection for section 1.',
      '1REXT': 'External timing resistor connection for section 1.',
      'VCC':   'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Dual Retriggerable One Shot',
        paragraphs: [
          'Each section operates independently. Connect an external capacitor between CEXT and GND, and an external resistor between CEXT and VCC, to set the pulse width: tW ≈ 0.7 × R × C. In 74Sim the REXT pin is documentation-only; both R and C attach to the CEXT side and the pulse timing emerges from the analog cap voltage as it charges through R.',
          'Retriggerable: each new trigger during an active pulse extends the timing from that moment. Use the 74x221 for non retriggerable dual one shots.',
        ],
        formulas: ['tW ≈ 0.7 × R × C'],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls123.pdf',
    tags: ['monostable', 'multivibrator', 'one shot', 'retriggerable', 'dual', 'timer', 'pulse', 'clear'],
    pinout: [
      { pin: 1,  name: '1A',    type: 'input',  description: 'Active LOW trigger input for section 1 (falling edge or LOW level triggers)' },
      { pin: 2,  name: '1B',    type: 'input',  description: 'Active HIGH trigger input for section 1 (rising edge or HIGH level triggers)' },
      { pin: 3,  name: '1CLR',  type: 'input',  description: 'Clear input for section 1 (active LOW, aborts pulse and forces Q=LOW)' },
      { pin: 4,  name: '1Qn',   type: 'output', description: 'Inverted output of section 1, HIGH when idle, LOW during pulse' },
      { pin: 5,  name: '2Q',    type: 'output', description: 'Non inverted output of section 2, LOW when idle, HIGH during pulse' },
      { pin: 6,  name: '2CEXT', type: 'input',  description: 'External timing capacitor connection for section 2' },
      { pin: 7,  name: '2REXT', type: 'input',  description: 'External timing resistor/RC connection for section 2' },
      { pin: 8,  name: 'GND',   type: 'power' },
      { pin: 9,  name: '2A',    type: 'input',  description: 'Active LOW trigger input for section 2' },
      { pin: 10, name: '2B',    type: 'input',  description: 'Active HIGH trigger input for section 2' },
      { pin: 11, name: '2CLR',  type: 'input',  description: 'Clear input for section 2 (active LOW, aborts pulse and forces Q=LOW)' },
      { pin: 12, name: '2Qn',   type: 'output', description: 'Inverted output of section 2, HIGH when idle, LOW during pulse' },
      { pin: 13, name: '1Q',    type: 'output', description: 'Non inverted output of section 1, LOW when idle, HIGH during pulse' },
      { pin: 14, name: '1CEXT', type: 'input',  description: 'External timing capacitor connection for section 1' },
      { pin: 15, name: '1REXT', type: 'input',  description: 'External timing resistor/RC connection for section 1' },
      { pin: 16, name: 'VCC',   type: 'power' },
    ],
    gates: [
      { type: 'MONOSTABLE_RC', inputs: ['1A', '1B', '1CLR', '1CEXT'], outputs: ['1Q', '1Qn'] },
      { type: 'MONOSTABLE_RC', inputs: ['2A', '2B', '2CLR', '2CEXT'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 74221: Dual Non-Retriggerable Monostable Multivibrator (with clear) ─
  /* Primary source: Texas Instruments, SN74LS221 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls221.pdf */
  // Like the 74121 but doubled. Each section fires a fixed-width pulse on a
  // valid trigger edge; unlike the 74123 it does NOT extend on re-trigger.
  // CLR immediately terminates the output pulse when pulled LOW.
  '74x221': {
    name: '74x221',
    simpleName: 'Dual One Shot (non retrig, CLR)',
    description: 'Dual non-retriggerable monostable, active LOW clear. (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls221.pdf',
    tags: ['monostable', 'multivibrator', 'one shot', 'timer', 'pulse', 'non-retriggerable', 'dual', 'clear'],
    guideOverview: 'The 74x221 contains two independent non retriggerable one shot circuits. Each section generates a single output pulse when triggered either by a falling edge on the A# (active LOW) input or a rising edge on the B (active HIGH) input. Once the pulse starts, additional triggers are ignored until the pulse ends. An active LOW CLR input can terminate the pulse early at any time. Pulse width is determined by external resistor and capacitor values: tW ≈ 0.7 × Rext × Cext.',
    guidePinDescriptions: {
      '1A':   'Active LOW trigger input for section 1. A falling edge here (while B is HIGH) starts the one shot pulse.',
      '1B':   'Active HIGH trigger input for section 1. A rising edge here (while A# is LOW) starts the one shot pulse.',
      '1CLR': 'Clear for section 1 (active LOW). Pulling LOW immediately resets the output to idle (Q=LOW, Q#=HIGH).',
      '1Q':   'True output of section 1, LOW when idle, HIGH during the timed pulse.',
      '1Qn':  'Inverted output of section 1, HIGH when idle, LOW during the timed pulse.',
      '2A':   'Active LOW trigger input for section 2.',
      '2B':   'Active HIGH trigger input for section 2.',
      '2CLR': 'Clear for section 2 (active LOW). Pulling LOW immediately resets section 2 output.',
      '2Q':   'True output of section 2, LOW when idle, HIGH during the timed pulse.',
      '2Qn':  'Inverted output of section 2, HIGH when idle, LOW during the timed pulse.',
    },
    pinout: [
      { pin: 1,  name: '1A',    type: 'input',  description: 'Active LOW trigger input for section 1. Falling edge triggers the one shot (when 1B=HIGH).' },
      { pin: 2,  name: '1B',    type: 'input',  description: 'Active HIGH trigger input for section 1. Rising edge triggers the one shot (when 1A#=LOW).' },
      { pin: 3,  name: '1CLR',  type: 'input',  description: 'Clear for section 1 (active LOW). Drive LOW to immediately end any active pulse.' },
      { pin: 4,  name: '1Qn',   type: 'output', description: 'Inverted output of section 1, HIGH when idle, LOW during pulse.' },
      { pin: 5,  name: '2Q',    type: 'output', description: 'True output of section 2, LOW when idle, HIGH during pulse.' },
      { pin: 6,  name: '2CEXT', type: 'input',  description: 'External timing capacitor connection for section 2.' },
      { pin: 7,  name: '2REXT', type: 'input',  description: 'External timing resistor/RC network connection for section 2.' },
      { pin: 8,  name: 'GND',   type: 'power' },
      { pin: 9,  name: '2A',    type: 'input',  description: 'Active LOW trigger input for section 2. Falling edge triggers the one shot (when 2B=HIGH).' },
      { pin: 10, name: '2B',    type: 'input',  description: 'Active HIGH trigger input for section 2. Rising edge triggers the one shot (when 2A#=LOW).' },
      { pin: 11, name: '2CLR',  type: 'input',  description: 'Clear for section 2 (active LOW). Drive LOW to immediately end any active pulse.' },
      { pin: 12, name: '2Qn',   type: 'output', description: 'Inverted output of section 2, HIGH when idle, LOW during pulse.' },
      { pin: 13, name: '1Q',    type: 'output', description: 'True output of section 1, LOW when idle, HIGH during pulse.' },
      { pin: 14, name: '1CEXT', type: 'input',  description: 'External timing capacitor connection for section 1.' },
      { pin: 15, name: '1REXT', type: 'input',  description: 'External timing resistor/RC network connection for section 1.' },
      { pin: 16, name: 'VCC',   type: 'power' },
    ],
    gates: [
      { type: 'MONOSTABLE', inputs: ['1A', '1B', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'MONOSTABLE', inputs: ['2A', '2B', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Non Retriggerable Dual One Shot',
        paragraphs: [
          'Each section produces a single fixed width output pulse when triggered. Additional triggers during the pulse are ignored, the timer runs to completion before the circuit can be triggered again.',
          'Pulse width: tW ≈ 0.7 × Rext × Cext. Connect external R from VCC to REXT and external C from REXT to GND.',
        ],
        formulas: ['tW ≈ 0.7 × R × C'],
        note: 'Use the 74x123 for a retriggerable version. CLR# can terminate the pulse early at any time.',
      },
    ],
  },

  // ── 74125: Quad Bus Buffer (tri state, active LOW enable) ──────────────
  // Source: Texas Instruments, "SN54125, SN54126, SN54LS125A, SN54LS126A, SN74125,
  //   SN74126, SN74LS125A, SN74LS126A Quadruple Bus Buffers With 3-State Outputs",
  //   SDLS044A (Dec. 1983, rev. Mar. 2002). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74ls125a.pdf. Verified: DIP-14 terminal
  //   assignment (TOP VIEW, N package, p.1), logic diagram (Y = A with a bubble on
  //   the control input Ḡ — i.e. active-LOW enable, p.2), description text ("The
  //   '125 and 'LS125A devices' outputs are disabled when Ḡ is high", p.1), and
  //   LS125A switching characteristics (tPLH 15 ns / tPHL 18 ns typ; enable/disable
  //   tPZH/tPZL/tPHZ/tPLZ in the tens of ns, p.6). Read as 300-dpi PDF page images,
  //   not a text summary, per issues.md C4. The datasheet labels each enable pin
  //   "Ḡ"; this entry names it "OE" (output enable) to match the 74x126 sibling.
  //   pinout[] + gates[] checked against the terminal diagram and logic diagram —
  //   both correct as authored; engine (TRI_BUFFER_LO, active-LOW, non-inverting)
  //   left untouched.
  // Source: Wikipedia contributors, "Three-state logic". [Online]. Available:
  //   https://en.wikipedia.org/wiki/Three-state_logic. Verified: definition of the
  //   high-impedance (Hi-Z) output state used in the prose.
  '74x125': {
    name: '74x125',
    simpleName: 'Quad Tristate Buffer (active LOW OE)',
    description: 'Quad non-inverting 3-state bus buffer, active LOW enable. (14-pin)',
    guideOverview: 'The 74x125 holds four independent non-inverting buffers, each with its own enable pin. When a buffer is enabled its output copies its input; when disabled the output goes to high impedance (Hi-Z) — electrically disconnected, driving neither HIGH nor LOW. That third state is what lets several chips take turns on one shared bus wire: whichever buffer is enabled drives the line, the rest stay out of the way. On the 74x125 the enable is active LOW — output active when the enable is held LOW, Hi-Z when it is HIGH — which is the only difference from the otherwise identical 74x126 (active HIGH). The active-LOW sense is handy because a control line that is idle-HIGH (or left pulled up) leaves the buffer safely off. The datasheet labels each enable pin Ḡ; this simulator labels it OE (output enable) for clarity.',
    guidePinDescriptions: {
      '1OE': 'Enable for buffer 1 (labeled 1Ḡ on the datasheet), active LOW. LOW = output drives; HIGH = Hi-Z.',
      '1A':  'Data input for buffer 1.',
      '1Y':  'Three-state output of buffer 1. Copies 1A when 1OE is LOW; Hi-Z when 1OE is HIGH.',
      '2OE': 'Enable for buffer 2 (2Ḡ on the datasheet), active LOW.',
      '2A':  'Data input for buffer 2.',
      '2Y':  'Three-state output of buffer 2.',
      'GND': 'Ground, 0 V reference (pin 7).',
      '3Y':  'Three-state output of buffer 3.',
      '3A':  'Data input for buffer 3.',
      '3OE': 'Enable for buffer 3 (3Ḡ on the datasheet), active LOW.',
      '4Y':  'Three-state output of buffer 4.',
      '4A':  'Data input for buffer 4.',
      '4OE': 'Enable for buffer 4 (4Ḡ on the datasheet), active LOW.',
      'VCC': 'Positive supply, +5 V (pin 14).',
    },
    guideSections: [
      {
        title: 'Three States and the Active-LOW Enable',
        paragraphs: [
          'A normal logic output is always driving its wire — either HIGH or LOW. A three-state (tristate) output adds a third choice: high impedance, or Hi-Z. In Hi-Z the output is switched off inside the chip, so it neither pushes the wire HIGH nor pulls it LOW. It simply lets go of the line.',
          'Each of the four buffers has an enable pin that picks between those modes, and on the 74x125 the enable is active LOW: hold it LOW and the output copies the input (Y = A, non-inverting), let it go HIGH and the output drops to Hi-Z. The little bubble on the enable in the datasheet logic symbol is what marks it as active LOW. The four buffers are fully independent — enabling or disabling one does nothing to the other three.',
        ],
        formulas: [
          'Y = A when OE is LOW, else Hi-Z',
          'OE=0, A=0 → Y=0 | OE=0, A=1 → Y=1 | OE=1, A=X → Y=Hi-Z   (X = don\'t care)',
        ],
      },
      {
        title: 'Taking Turns on a Bus',
        paragraphs: [
          'A bus is one wire (or a group of wires) that several chips need to put data onto at different times — think of the data lines shared by a CPU, a memory, and a peripheral. They cannot all drive it at once. The rule is one talker at a time: exactly one buffer enabled, everyone else in Hi-Z.',
          'If two enabled outputs disagree — one driving HIGH, one driving LOW — they fight. That is bus contention: a near-short from supply to ground through the two chips, which wastes current, produces a garbage voltage in between, and can overheat the parts. The "bus buffer" name points to the beefed-up outputs (the LS125A can sink 24 mA): they can drive a heavily loaded bus line without external pull-up resistors.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Connecting several devices to one shared data bus, gating on only the one whose turn it is to talk.',
          'Steering a signal to one of several destinations by enabling only the buffer that feeds the chosen path.',
          'Buffering a weak signal so it can drive a long trace or a heavier load without sagging.',
          'Parking part of a circuit in Hi-Z to cut it off the bus without removing power.',
        ],
      },
      {
        title: 'Gotchas',
        paragraphs: [
          'Never enable two drivers onto the same wire at once — that is the bus contention above. In real designs the enable signals usually come from a decoder so that only one can ever be LOW (active) at a time.',
          'Active LOW cuts both ways. It is convenient because an idle-HIGH control line, or an enable pin pulled up through a resistor, leaves the buffer safely off by default. But it is also the one thing that separates this chip from the 74x126 — wire a 74x125 where a design expected active-HIGH enables and every buffer behaves backwards. Check the polarity before you trust the wiring.',
          'When no buffer is enabled the bus is left floating: nothing drives it, so its voltage drifts and downstream inputs can read random, noisy values. A pull-up (or pull-down) resistor on the bus, or a bus-holder, keeps the line at a defined level while idle.',
        ],
        note: 'Simplification: the simulator switches each buffer instantly. A real 74LS125A takes a few nanoseconds to change its output (tPLH/tPHL ~15–18 ns typical) and a bit longer to enter or leave Hi-Z — fine for hand-built circuits, but a real limit at high speed. Use the 74x126 when you want the opposite (active HIGH) enable polarity.',
      },
    ],
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls125a.pdf',
    tags: ['buffer', 'tri state', 'bus', 'quad', '3-state', 'non inverting'],
    pinout: [
      { pin: 1,  name: '1OE', type: 'input',  description: 'Output enable for buffer 1 (active LOW: LOW=enabled, HIGH=Hi Z)' },
      { pin: 2,  name: '1A',  type: 'input',  description: 'Data input for buffer 1' },
      { pin: 3,  name: '1Y',  type: 'output', description: 'Data output for buffer 1 (follows 1A when enabled, Hi Z when disabled)' },
      { pin: 4,  name: '2OE', type: 'input',  description: 'Output enable for buffer 2 (active LOW)' },
      { pin: 5,  name: '2A',  type: 'input',  description: 'Data input for buffer 2' },
      { pin: 6,  name: '2Y',  type: 'output', description: 'Data output for buffer 2' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3Y',  type: 'output', description: 'Data output for buffer 3' },
      { pin: 9,  name: '3A',  type: 'input',  description: 'Data input for buffer 3' },
      { pin: 10, name: '3OE', type: 'input',  description: 'Output enable for buffer 3 (active LOW)' },
      { pin: 11, name: '4Y',  type: 'output', description: 'Data output for buffer 4' },
      { pin: 12, name: '4A',  type: 'input',  description: 'Data input for buffer 4' },
      { pin: 13, name: '4OE', type: 'input',  description: 'Output enable for buffer 4 (active LOW)' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'TRI_BUFFER_LO', inputs: ['1A', '1OE'], output: '1Y' },
      { type: 'TRI_BUFFER_LO', inputs: ['2A', '2OE'], output: '2Y' },
      { type: 'TRI_BUFFER_LO', inputs: ['3A', '3OE'], output: '3Y' },
      { type: 'TRI_BUFFER_LO', inputs: ['4A', '4OE'], output: '4Y' },
    ],
  },

  // ── 74126: Quad Bus Buffer (tri state, active HIGH enable) ─────────────
  // Source: Texas Instruments, "SN54125, SN54126, SN54LS125A, SN54LS126A, SN74125,
  //   SN74126, SN74LS125A, SN74LS126A Quadruple Bus Buffers With 3-State Outputs",
  //   SDLS044A (Dec. 1983, rev. Mar. 2002). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74ls126a.pdf. Verified: DIP-14 terminal
  //   assignment (TOP VIEW, N package, p.1), logic diagram (Y = A with active-HIGH
  //   control G, p.2), description text ("the '126 ... outputs are disabled when G
  //   is low"), and LS126A switching characteristics (p.6). Read as 300-dpi PDF
  //   page images, not a text summary, per issues.md C4. The datasheet labels each
  //   enable pin "G"; this entry names it "OE" (output enable) to match 74x125.
  //   pinout[] + gates[] checked against the terminal diagram and function — both
  //   correct as authored; engine left untouched.
  // Source: Wikipedia contributors, "Three-state logic". [Online]. Available:
  //   https://en.wikipedia.org/wiki/Three-state_logic. Verified: definition of the
  //   high-impedance (Hi-Z) output state used in the prose.
  '74x126': {
    name: '74x126',
    simpleName: 'Quad Tristate Buffer (active HIGH OE)',
    description: 'Quad non-inverting 3-state bus buffer, active HIGH enable. (14-pin)',
    guideOverview: 'The 74x126 holds four independent non-inverting buffers, each with its own enable pin. When a buffer is enabled its output copies its input; when disabled the output goes to high impedance (Hi-Z) — electrically disconnected, driving neither HIGH nor LOW. That third state is what lets several chips take turns on one shared bus wire: the enabled buffer drives it, the rest stay out of the way. On the 74x126 the enable is active HIGH — output active when the enable is HIGH, Hi-Z when it is LOW — which is the only difference from the otherwise identical 74x125 (active LOW). The datasheet labels each enable pin G; this simulator labels it OE (output enable) for clarity.',
    guidePinDescriptions: {
      '1OE': 'Enable for buffer 1 (labeled 1G on the datasheet), active HIGH. HIGH = output drives; LOW = Hi-Z.',
      '1A':  'Data input for buffer 1.',
      '1Y':  'Three-state output of buffer 1. Copies 1A when 1OE is HIGH; Hi-Z when 1OE is LOW.',
      '2OE': 'Enable for buffer 2 (2G on the datasheet), active HIGH.',
      '2A':  'Data input for buffer 2.',
      '2Y':  'Three-state output of buffer 2.',
      'GND': 'Ground, 0 V reference (pin 7).',
      '3Y':  'Three-state output of buffer 3.',
      '3A':  'Data input for buffer 3.',
      '3OE': 'Enable for buffer 3 (3G on the datasheet), active HIGH.',
      '4Y':  'Three-state output of buffer 4.',
      '4A':  'Data input for buffer 4.',
      '4OE': 'Enable for buffer 4 (4G on the datasheet), active HIGH.',
      'VCC': 'Positive supply, +5 V (pin 14).',
    },
    guideSections: [
      {
        title: 'Three-State Buffers and the Enable Pin',
        paragraphs: [
          'An ordinary logic output can only be HIGH or LOW — it is always driving the wire. A three-state (tristate) output adds a third choice: high impedance, or Hi-Z. In Hi-Z the output is switched off internally, so it neither pushes the wire HIGH nor pulls it LOW. It just lets go.',
          'Each of the four buffers has an enable pin that picks between those modes. On the 74x126 the enable is active HIGH: drive it HIGH and the output copies the input, drive it LOW and the output drops to Hi-Z. (On the sister part 74x125 the sense is reversed — LOW enables.) The four buffers are fully independent; enabling one has no effect on the others.',
        ],
        formulas: [
          'Y = A when OE is HIGH, else Hi-Z',
          'OE=1, A=0 → Y=0 | OE=1, A=1 → Y=1 | OE=0, A=X → Y=Hi-Z   (X = don\'t care)',
        ],
      },
      {
        title: 'Sharing a Bus',
        paragraphs: [
          'A bus is one wire (or a group of wires) that several chips need to put data onto at different times — for example the data lines between a CPU, a memory, and a couple of peripherals. They cannot all drive it at once. The rule is one talker at a time: exactly one buffer enabled, everyone else in Hi-Z.',
          'If two enabled outputs disagree — one driving HIGH, one driving LOW — they fight. This is bus contention: a near-short from supply to ground through the two chips that wastes current, produces a garbage voltage in between, and can overheat the parts. The "bus buffer" name points to the beefed-up outputs: they can drive a heavily loaded bus line HIGH or LOW without needing external pull-up resistors.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Connecting several devices to one shared data bus, each gated on only when it is that device\'s turn to talk.',
          'Steering one signal to one of several destinations by enabling only the buffer that feeds the chosen path.',
          'Buffering a weak signal so it can drive a long trace or a heavier load.',
          'Isolating part of a circuit: drop a stage into Hi-Z to cut it off the bus without powering it down.',
        ],
      },
      {
        title: 'Gotchas',
        paragraphs: [
          'Never enable two drivers onto the same wire at once — that is the bus contention above. In real designs the enable signals usually come from a decoder so that only one can ever be active at a time.',
          'When no buffer is enabled the bus is left floating: nothing drives it, so its voltage drifts and downstream inputs can read random, noisy values. A pull-up (or pull-down) resistor on the bus, or a bus-holder, keeps the line at a defined level while idle.',
        ],
        note: 'Simplification: the simulator switches each buffer instantly. A real 74LS126A takes a few nanoseconds to change its output and a bit longer (tens of nanoseconds) to enter or leave Hi-Z — fine for hand-built circuits, but a real limit at high speed.',
      },
    ],
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls126a.pdf',
    tags: ['buffer', 'tri state', 'bus', 'quad', '3-state', 'non inverting'],
    pinout: [
      { pin: 1,  name: '1OE', type: 'input',  description: 'Output enable for buffer 1 (active HIGH: HIGH=enabled, LOW=Hi Z)' },
      { pin: 2,  name: '1A',  type: 'input',  description: 'Data input for buffer 1' },
      { pin: 3,  name: '1Y',  type: 'output', description: 'Data output for buffer 1 (follows 1A when enabled, Hi Z when disabled)' },
      { pin: 4,  name: '2OE', type: 'input',  description: 'Output enable for buffer 2 (active HIGH)' },
      { pin: 5,  name: '2A',  type: 'input',  description: 'Data input for buffer 2' },
      { pin: 6,  name: '2Y',  type: 'output', description: 'Data output for buffer 2' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3Y',  type: 'output', description: 'Data output for buffer 3' },
      { pin: 9,  name: '3A',  type: 'input',  description: 'Data input for buffer 3' },
      { pin: 10, name: '3OE', type: 'input',  description: 'Output enable for buffer 3 (active HIGH)' },
      { pin: 11, name: '4Y',  type: 'output', description: 'Data output for buffer 4' },
      { pin: 12, name: '4A',  type: 'input',  description: 'Data input for buffer 4' },
      { pin: 13, name: '4OE', type: 'input',  description: 'Output enable for buffer 4 (active HIGH)' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'TRI_BUFFER_HI', inputs: ['1A', '1OE'], output: '1Y' },
      { type: 'TRI_BUFFER_HI', inputs: ['2A', '2OE'], output: '2Y' },
      { type: 'TRI_BUFFER_HI', inputs: ['3A', '3OE'], output: '3Y' },
      { type: 'TRI_BUFFER_HI', inputs: ['4A', '4OE'], output: '4Y' },
    ],
  },

  // ── 74132: Quad 2 input NAND (Schmitt trigger) ─────────────────────────
  /* Primary source: Texas Instruments, SN74LS132 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls132.pdf */
  '74x132': {
    name: '74x132',
    simpleName: 'Quad 2 input NAND (Schmitt)',
    description: 'Quad 2 input NAND gate with Schmitt trigger inputs. (14-pin)',
    schmittInputs: true,
    guideOverview: 'The 74x132 contains four 2 input NAND gates with Schmitt trigger inputs. The Schmitt trigger adds hysteresis to the input threshold: the positive going threshold (VT+) is higher than the negative going threshold (VT-). This makes the gates immune to slow, noisy, or bouncing input signals. Use it to clean up messy digital signals before feeding other logic.',
    guidePinDescriptions: {
      '1A':  'Schmitt trigger input A of NAND gate 1.',
      '1B':  'Schmitt trigger input B of NAND gate 1.',
      '1Y':  'Output of NAND gate 1. LOW only when both inputs are above VT+.',
      '2A':  'Schmitt trigger input A of NAND gate 2.',
      '2B':  'Schmitt trigger input B of NAND gate 2.',
      '2Y':  'Output of NAND gate 2.',
      'GND': 'Ground reference (pin 7).',
      '3Y':  'Output of NAND gate 3.',
      '3A':  'Schmitt trigger input A of NAND gate 3.',
      '3B':  'Schmitt trigger input B of NAND gate 3.',
      '4Y':  'Output of NAND gate 4.',
      '4A':  'Schmitt trigger input A of NAND gate 4.',
      '4B':  'Schmitt trigger input B of NAND gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'Schmitt Trigger Hysteresis',
        paragraphs: [
          'Normal TTL gates switch at a single threshold voltage. A Schmitt trigger input uses two thresholds: VT+ (typically ~1.7 V) for the rising transition and VT- (typically ~0.9 V) for the falling transition. The gap between them (hysteresis) prevents rapid toggling on slow or noisy signals.',
          'Typical uses include debouncing mechanical switches, squaring up slowly changing waveforms, and receiving signals from long cable runs.',
        ],
        note: 'The 74x132 is logically identical to the 74x00 but with Schmitt inputs. Swap it in when signal integrity is a problem.',
      },
    ],
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls132.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'schmitt', 'schmitt trigger', 'hysteresis', '2 input'],
    pinout: [
      { pin: 1,  name: '1A',  type: 'input',  description: 'Input A of NAND gate 1 (Schmitt trigger)' },
      { pin: 2,  name: '1B',  type: 'input',  description: 'Input B of NAND gate 1 (Schmitt trigger)' },
      { pin: 3,  name: '1Y',  type: 'output', description: 'Output of NAND gate 1: LOW only when both 1A and 1B are HIGH' },
      { pin: 4,  name: '2A',  type: 'input',  description: 'Input A of NAND gate 2 (Schmitt trigger)' },
      { pin: 5,  name: '2B',  type: 'input',  description: 'Input B of NAND gate 2 (Schmitt trigger)' },
      { pin: 6,  name: '2Y',  type: 'output', description: 'Output of NAND gate 2' },
      { pin: 7,  name: 'GND', type: 'power' },
      { pin: 8,  name: '3Y',  type: 'output', description: 'Output of NAND gate 3' },
      { pin: 9,  name: '3A',  type: 'input',  description: 'Input A of NAND gate 3 (Schmitt trigger)' },
      { pin: 10, name: '3B',  type: 'input',  description: 'Input B of NAND gate 3 (Schmitt trigger)' },
      { pin: 11, name: '4Y',  type: 'output', description: 'Output of NAND gate 4' },
      { pin: 12, name: '4A',  type: 'input',  description: 'Input A of NAND gate 4 (Schmitt trigger)' },
      { pin: 13, name: '4B',  type: 'input',  description: 'Input B of NAND gate 4 (Schmitt trigger)' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 74138: 3 to 8 Line Decoder / Demultiplexer ──────────────────────────
  /* Source: Texas Instruments, "SNx4HC138 3-Line To 8-Line
       Decoders/Demultiplexers", SCLS107G (Dec. 1982, rev. Oct. 2021).
       [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74hc138.pdf.
       Verified: Pin Functions terminal table (16-pin D/DB/J/N/NS/PW/W
       package, top view) and Function Table (Table 8-1), pages 3 and 10,
       read as rendered PDF page images (issues.md C4) — never via a text
       summarizer (C4), and not cloned from a sibling (C2). Both match the
       existing pinout[]/gates[] exactly: A=pin1 (LSB), B=pin2, C=pin3 (MSB);
       G2A=pin4 and G2B=pin5 active LOW; G1=pin6 active HIGH; Y7=pin7,
       GND=pin8, Y6=pin9, Y5=pin10, Y4=pin11, Y3=pin12, Y2=pin13, Y1=pin14,
       Y0=pin15, VCC=pin16. Outputs enable only when G1=H, G2A=L, G2B=L;
       selected output index = A|(B<<1)|(C<<2) is driven LOW and all others
       HIGH; any disable forces every output HIGH. Engine left unchanged.
     Cascading / demux behaviour and the 24-line/32-line expansion note taken
       from the same datasheet's Overview (§8.1) and Application Information
       (§9.1, LED-matrix column scan). Verified as page images per C4.
     Decoder/demultiplexer background: Wikipedia contributors, "Multiplexer",
       https://en.wikipedia.org/wiki/Multiplexer. */
  '74x138': {
    name: '74x138',
    simpleName: '3 to 8 Line Decoder',
    description: '3-to-8 decoder/demux, 1 of 8 active LOW outputs. (16-pin)',
    guideOverview: 'The 74x138 turns a 3 bit binary code into eight separate output lines. The three select inputs A (LSB), B, and C (MSB) name a number from 0 to 7, and the matching output (Y0 to Y7) goes LOW while the other seven stay HIGH. The outputs are active LOW, which catches out anyone expecting the selected line to go HIGH. What sets this part apart is its three enable inputs one active HIGH (G1) and two active LOW (G2A, G2B) that all have to agree before any output turns on. That mix lets you chain several 74x138s into a larger decoder with little or no extra logic, or feed a data signal into one enable to use the chip as a 1 of 8 demultiplexer. The classic job is address decoding: turning the top few address bits into individual chip-select lines for memory or peripherals.',
    guidePinDescriptions: {
      A:    'Select input A the least significant address bit (weight 1).',
      B:    'Select input B the middle address bit (weight 2).',
      C:    'Select input C the most significant address bit (weight 4).',
      G2A:  'Active LOW enable. Must be LOW (along with G2B LOW and G1 HIGH) to turn the outputs on; HIGH forces all outputs HIGH.',
      G2B:  'Active LOW enable. Must be LOW (along with G2A LOW and G1 HIGH) to turn the outputs on; HIGH forces all outputs HIGH.',
      G1:   'Active HIGH enable. Must be HIGH (along with G2A and G2B LOW) to turn the outputs on; LOW forces all outputs HIGH.',
      Y7:   'Active LOW output for code 7 (C=1, B=1, A=1). LOW only when selected and the chip is enabled.',
      GND:  'Ground reference (pin 8).',
      Y6:   'Active LOW output for code 6 (C=1, B=1, A=0).',
      Y5:   'Active LOW output for code 5 (C=1, B=0, A=1).',
      Y4:   'Active LOW output for code 4 (C=1, B=0, A=0).',
      Y3:   'Active LOW output for code 3 (C=0, B=1, A=1).',
      Y2:   'Active LOW output for code 2 (C=0, B=1, A=0).',
      Y1:   'Active LOW output for code 1 (C=0, B=0, A=1).',
      Y0:   'Active LOW output for code 0 (all select inputs LOW).',
      VCC:  'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How 3 to 8 Decoding Works',
        paragraphs: [
          'The three select inputs A, B, and C form a 3 bit binary number, with A as the least significant bit and C as the most significant. That number, 0 through 7, picks which one of the eight outputs (Y0 through Y7) turns on. In other words the chip decodes a 3 bit code into eight separate lines, one line per code.',
          'The outputs are active LOW: the chosen line goes LOW while the other seven stay HIGH. This is the opposite of what many people expect, where the selected line would go HIGH. Active LOW is convenient because a lot of memory and peripheral chips are switched on by a LOW, so a 74x138 output can drive one of those chip-select pins directly, no inverter needed.',
        ],
        formulas: [
          'selected output index = A + 2*B + 4*C',
        ],
      },
      {
        title: 'The Three Enable Inputs',
        paragraphs: [
          'Before any output can go LOW, all three enable pins must agree: G1 HIGH, G2A LOW, and G2B LOW. Get any one wrong and every output stays HIGH, whatever the select inputs say. The mix of one active HIGH enable and two active LOW enables is deliberate it lets you switch the decoder on and off from different kinds of control signals without adding inverters.',
          'For a decoder that is always on, tie G1 to VCC and both G2A and G2B to GND. A floating or wrong-level enable is the most common reason a 74x138 looks dead: all eight outputs sit HIGH and nothing responds to the address.',
        ],
      },
      {
        title: 'Function Table',
        paragraphs: [
          'The chip is enabled only in the first block below. Once enabled, the select code CBA picks the single output that goes LOW.',
        ],
        formulas: [
          'G1=0            → all outputs HIGH (disabled)',
          'G2A=1 or G2B=1  → all outputs HIGH (disabled)',
          'enabled, C=0 B=0 A=0 → Y0 LOW, rest HIGH',
          'enabled, C=0 B=0 A=1 → Y1 LOW, rest HIGH',
          'enabled, C=0 B=1 A=0 → Y2 LOW, rest HIGH',
          'enabled, C=0 B=1 A=1 → Y3 LOW, rest HIGH',
          'enabled, C=1 B=0 A=0 → Y4 LOW, rest HIGH',
          'enabled, C=1 B=0 A=1 → Y5 LOW, rest HIGH',
          'enabled, C=1 B=1 A=0 → Y6 LOW, rest HIGH',
          'enabled, C=1 B=1 A=1 → Y7 LOW, rest HIGH',
        ],
        note: '"Enabled" means G1=HIGH and G2A=G2B=LOW all at once.',
      },
      {
        title: 'Cascading for Larger Decoders',
        paragraphs: [
          'The three enables exist so you can chain decoders. Feed the low three address bits to A, B, and C on several 74x138s, then drive each chip\'s enables from the higher address bits so exactly one chip is active at a time. Two 74x138s give you a 4 to 16 decoder; a handful builds a 5 to 32 decoder.',
          'Because the part has both active HIGH and active LOW enables, the higher address bit can enable one chip and disable another with no external gate. The datasheet points out that a 24 line decoder needs no external inverter at all, and a 32 line decoder needs only one.',
        ],
      },
      {
        title: 'Demultiplexer Mode',
        paragraphs: [
          'A decoder becomes a demultiplexer (demux) when you feed a data signal into an enable pin instead of a fixed level. The select inputs then steer that data to one output while the rest stay HIGH.',
          'Put your data on G2A (active LOW). When the data is LOW the addressed output follows it and goes LOW; when the data is HIGH all outputs are HIGH. A, B, and C choose which of the eight lines the data comes out on. That gives a 1 line to 8 line demux from a single chip.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Address decoding: turning the top address bits into individual chip-select lines for memory or I/O devices.',
          'Scanning one line at a time: driving the columns of an LED matrix or keypad, since only one output is ever LOW.',
          '1 of 8 demultiplexing: routing a single data or clock line to one of eight destinations.',
          'Generating up to eight mutually exclusive control or strobe signals from a 3 bit code.',
        ],
      },
      {
        title: 'Gotchas',
        paragraphs: [
          'Outputs are active LOW: the selected line is the one that goes LOW, not HIGH.',
          'All three enables must be right (G1 HIGH, G2A and G2B LOW) or the whole chip is off and every output stays HIGH. Tie unused enables to their active level rather than leaving them floating.',
          'Only one output is ever active, and only while the chip is enabled. The outputs are never all LOW at once.',
          'The output pins are not in order. Y0 sits at pin 15 and Y7 at pin 7, so the outputs run "backwards" down the package. It is easy to miswire if you assume Y0 is next to Y1 in pin order.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc138.pdf',
    tags: ['decoder', 'demultiplexer', 'demux', '3 to 8', '1-of-8', 'active low', 'logic', '74138', '74hc138', '74ls138'],
    pinout: [
      { pin: 1,  name: 'A',   type: 'input',  description: 'Address input, least significant bit' },
      { pin: 2,  name: 'B',   type: 'input',  description: 'Address input, middle bit' },
      { pin: 3,  name: 'C',   type: 'input',  description: 'Address input, most significant bit' },
      { pin: 4,  name: 'G2A', type: 'input',  description: 'Enable input, active LOW' },
      { pin: 5,  name: 'G2B', type: 'input',  description: 'Enable input, active LOW' },
      { pin: 6,  name: 'G1',  type: 'input',  description: 'Enable input, active HIGH' },
      { pin: 7,  name: 'Y7',  type: 'output', description: 'Output for address 111, active LOW' },
      { pin: 8,  name: 'GND', type: 'power' },
      { pin: 9,  name: 'Y6',  type: 'output', description: 'Output for address 110, active LOW' },
      { pin: 10, name: 'Y5',  type: 'output', description: 'Output for address 101, active LOW' },
      { pin: 11, name: 'Y4',  type: 'output', description: 'Output for address 100, active LOW' },
      { pin: 12, name: 'Y3',  type: 'output', description: 'Output for address 011, active LOW' },
      { pin: 13, name: 'Y2',  type: 'output', description: 'Output for address 010, active LOW' },
      { pin: 14, name: 'Y1',  type: 'output', description: 'Output for address 001, active LOW' },
      { pin: 15, name: 'Y0',  type: 'output', description: 'Output for address 000, active LOW' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      {
        // Inputs order must match _evaluateDecoder3to8: [A, B, C, G1, G2A, G2B]
        // Enabled when G1=1, G2A=0, G2B=0; selected output = LOW, all others HIGH.
        // Address: index = A | (B<<1) | (C<<2)
        type: 'DECODER_3TO8',
        inputs: ['A', 'B', 'C', 'G1', 'G2A', 'G2B'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7'],
      },
    ],
  },

  // ── 74139: Dual 2-to-4 Decoder / Demultiplexer ─────────────────────────
  /* Source: Texas Instruments, "SN54LS139A, SN54S139, SN74LS139A, SN74S139A
       Dual 2-Line to 4-Line Decoders/Demultiplexers", SDLS013A (Dec. 1972,
       rev. Mar. 1988). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls139a.pdf. Verified: terminal
       assignment (D/J/N/W package, top view) and function table, page 1, read
       as rendered PDF page images (issues.md C4). Both match the existing
       pinout[]/gates[] exactly (A = low select bit, B = high select bit; enable
       and outputs active LOW; selected output index = A | (B<<1)), so the
       engine was left unchanged.
     Decoder/demultiplexer background: Wikipedia contributors, "Multiplexer",
       https://en.wikipedia.org/wiki/Multiplexer. */
  '74x139': {
    name: '74x139',
    simpleName: 'Dual 2 to 4 Decoder',
    description: 'Dual 2-to-4 line decoder/demux (1 of 4 each). (16-pin)',
    guideOverview: 'The 74x139 puts two separate 2 to 4 line decoders in one 16-pin chip. Each half takes a 2 bit address (inputs A and B) and an active LOW enable, and drives four outputs. When a half is enabled, exactly one output goes LOW the one the address points at while the other three stay HIGH. The two halves share only power and ground, so you can run them as two independent decoders, or feed a data signal into an enable pin to use each half as a 1 of 4 demultiplexer. The outputs are active LOW, which catches out anyone expecting the selected line to go HIGH.',
    guidePinDescriptions: {
      '1G':  'Enable for section 1, active LOW. HIGH disables all outputs of section 1 (all go HIGH).',
      '1A':  'Address bit 0 (LSB) for section 1.',
      '1B':  'Address bit 1 (MSB) for section 1.',
      '1Y0': 'Output 0 of section 1, active LOW. LOW when G=0, A=0, B=0.',
      '1Y1': 'Output 1 of section 1, active LOW. LOW when G=0, A=1, B=0.',
      '1Y2': 'Output 2 of section 1, active LOW. LOW when G=0, A=0, B=1.',
      '1Y3': 'Output 3 of section 1, active LOW. LOW when G=0, A=1, B=1.',
      'GND': 'Ground reference (pin 8).',
      '2Y3': 'Output 3 of section 2, active LOW. LOW when G=0, A=1, B=1.',
      '2Y2': 'Output 2 of section 2, active LOW. LOW when G=0, A=0, B=1.',
      '2Y1': 'Output 1 of section 2, active LOW. LOW when G=0, A=1, B=0.',
      '2Y0': 'Output 0 of section 2, active LOW. LOW when G=0, A=0, B=0.',
      '2B':  'Address bit 1 (MSB) for section 2.',
      '2A':  'Address bit 0 (LSB) for section 2.',
      '2G':  'Enable for section 2, active LOW. HIGH disables all outputs of section 2 (all go HIGH).',
      'VCC': 'Positive supply (+5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'How Each Decoder Works',
        paragraphs: [
          'Each half has two select inputs, A and B, and one enable input, G. A is the low bit and B is the high bit, so together they name a number from 0 to 3. That number picks which one of the four outputs (Y0 to Y3) is activated.',
          'The enable must be LOW for the decoder to do anything. With enable LOW, the selected output goes LOW and the other three stay HIGH. With enable HIGH the whole half is switched off and all four outputs sit HIGH, no matter what the address is.',
        ],
        formulas: [
          'G=1 (disabled) → Y0=1  Y1=1  Y2=1  Y3=1',
          'G=0, B=0 A=0 → Y0=0  Y1=1  Y2=1  Y3=1',
          'G=0, B=0 A=1 → Y0=1  Y1=0  Y2=1  Y3=1',
          'G=0, B=1 A=0 → Y0=1  Y1=1  Y2=0  Y3=1',
          'G=0, B=1 A=1 → Y0=1  Y1=1  Y2=1  Y3=0',
          'selected output index = A + 2*B',
        ],
      },
      {
        title: 'Active LOW Outputs',
        paragraphs: [
          'When a half is enabled, only one output is LOW at a time. Think of that LOW line as the chosen one and the three HIGH lines as not chosen. This is the opposite of what many people expect, where the selected line would go HIGH.',
          'Active LOW outputs are convenient because a lot of chips are themselves switched on by a LOW (memory chip-selects, other enable pins). You can wire a 74x139 output straight to one of those inputs without adding an inverter.',
        ],
      },
      {
        title: 'Demultiplexer Mode',
        paragraphs: [
          'A decoder turns into a demultiplexer (demux) when you route a data signal into the enable pin instead of a fixed enable level. The address then steers that data to one output while the rest stay HIGH.',
          'Put the data on G. When G is LOW the selected output follows it and goes LOW; when G is HIGH all outputs are HIGH. A and B choose which of the four outputs the data comes out on. That gives a 1 line to 4 line demux, one in each half of the chip.',
        ],
      },
      {
        title: 'Building a 3 to 8 Decoder',
        paragraphs: [
          'The two halves can be joined into a single 3 to 8 decoder. Feed the low two address bits to the A and B inputs of both halves. Use the third (most significant) bit to pick which half is active: send it straight to one enable and through an inverter to the other, so exactly one half is enabled at a time. The eight outputs then cover all eight 3 bit addresses.',
          'If you need a 3 to 8 decoder often, the 74x138 does it in one chip. Reach for the 74x139 when you want two smaller decoders that work independently.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Address decoding: turning the top address bits into individual chip-select lines for memory or peripherals.',
          'Demultiplexing: steering one data or clock line to one of four destinations.',
          'Generating four mutually exclusive control signals from a 2 bit code.',
          'Doing two of these jobs at once, since the chip holds two independent decoders.',
        ],
      },
      {
        title: 'Gotchas',
        paragraphs: [
          'Outputs are active LOW: the selected line is the one that goes LOW, not HIGH.',
          'The enable G is active LOW too. Tie it to GND to keep a half permanently on; a floating or HIGH enable leaves all four outputs HIGH and the chip looks dead.',
          'The two halves are fully independent. You must wire the enable of each half; enabling one does nothing to the other.',
          'Watch the output pin order. The outputs of section 2 run 2Y3, 2Y2, 2Y1, 2Y0 down pins 9 to 12, the reverse of section 1, which is easy to miswire.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls139a.pdf',
    tags: ['decoder', 'demultiplexer', 'demux', '2-to-4', 'dual', 'inverting', 'active low'],
    pinout: [
      { pin: 1,  name: '1G',  type: 'input',  description: 'Enable for section 1 (active LOW); HIGH disables all outputs' },
      { pin: 2,  name: '1A',  type: 'input',  description: 'Address bit 0 for section 1' },
      { pin: 3,  name: '1B',  type: 'input',  description: 'Address bit 1 for section 1' },
      { pin: 4,  name: '1Y0', type: 'output', description: 'Section 1 output 0 (active LOW; LOW when A=0, B=0)' },
      { pin: 5,  name: '1Y1', type: 'output', description: 'Section 1 output 1 (active LOW; LOW when A=1, B=0)' },
      { pin: 6,  name: '1Y2', type: 'output', description: 'Section 1 output 2 (active LOW; LOW when A=0, B=1)' },
      { pin: 7,  name: '1Y3', type: 'output', description: 'Section 1 output 3 (active LOW; LOW when A=1, B=1)' },
      { pin: 8,  name: 'GND', type: 'power',  description: 'Ground (0V)' },
      { pin: 9,  name: '2Y3', type: 'output', description: 'Section 2 output 3 (active LOW; LOW when A=1, B=1)' },
      { pin: 10, name: '2Y2', type: 'output', description: 'Section 2 output 2 (active LOW; LOW when A=0, B=1)' },
      { pin: 11, name: '2Y1', type: 'output', description: 'Section 2 output 1 (active LOW; LOW when A=1, B=0)' },
      { pin: 12, name: '2Y0', type: 'output', description: 'Section 2 output 0 (active LOW; LOW when A=0, B=0)' },
      { pin: 13, name: '2B',  type: 'input',  description: 'Address bit 1 for section 2' },
      { pin: 14, name: '2A',  type: 'input',  description: 'Address bit 0 for section 2' },
      { pin: 15, name: '2G',  type: 'input',  description: 'Enable for section 2 (active LOW); HIGH disables all outputs' },
      { pin: 16, name: 'VCC', type: 'power',  description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'DECODER_2TO4', inputs: ['1A', '1B', '1G'], outputs: ['1Y0', '1Y1', '1Y2', '1Y3'] },
      { type: 'DECODER_2TO4', inputs: ['2A', '2B', '2G'], outputs: ['2Y0', '2Y1', '2Y2', '2Y3'] },
    ],
  },
};
