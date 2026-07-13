// Chip definitions block 37
// Chips: 74694 74699, 74700 74702, 74707, 74710 74712, 74715, 74716, 74718

export const CHIPS_BLOCK_37 = {

  // ── 74694: 4 bit decade counter/latch/mux, sync+async CLR, TRI (20-pin) ──
  //
  // ── LEFT AS A STUB: '694 is not a real device ───────────────────────────────
  // The number '694 is not assigned in the 74-series "synchronous counter with
  // output register and multiplexed 3-state outputs" family. That family runs
  //   '690 decade / direct (async) clear      '696 up-down decade  / async clear
  //   '691 binary / direct (async) clear      '697 up-down binary  / async clear
  //   '692 decade / synchronous clear         '698 up-down decade  / sync clear
  //   '693 binary / synchronous clear         '699 up-down binary  / sync clear
  // and skips straight from '693 to '696 — there is no '694 or '695. No
  // manufacturer (TI, National, Fairchild) ever shipped one, so there is no
  // datasheet to read and no terminal assignment to verify. The pinout and the
  // "synchronous AND asynchronous clear" function in this entry were hand-entered
  // (same fabricated-stub class as the '691/'692/'693 siblings — see issues.md
  // C38) and cannot be confirmed against any source. Assigning pin numbers to a
  // part that does not exist would be exactly the C2/CD4082 fabrication this
  // project forbids, so this stays an inert documentation stub: the engine
  // primitive COUNTER_LATCH_MUX_STUB drives all outputs Hi-Z and the 'stub' tag
  // hides it from the picker. See issues.md C39.
  //
  // Sources consulted (all real; none lists a '694):
  // Source: Texas Instruments, "SN54LS690..SN54LS693, SN74LS690..SN74LS693 —
  //   Synchronous Counters with Output Registers and Multiplexed 3-State Outputs",
  //   doc D2423 (Jan 1981, rev. Mar 1988), in "The TTL Logic Data Book" (1988),
  //   pp. 2-1139..2-1146. [Online]. Available (bitsavers):
  //   http://www.bitsavers.org/components/ti/_dataBooks/1988_TI_Standard_TTL_Logic_Data_Book.pdf
  //   Verified: the book selection index and the family datasheet header — the
  //   family is '690/'691/'693 (up) and '696/'697/'699 (up-down); the index jumps
  //   from 2-1139 ('690..'693) to 2-1149 ('696..'699), with no '694/'695 — read
  //   as a rendered PDF page image (issues.md C4). TI's own sn74als694 /
  //   sn74as694 / sn74ls690 symlinks all 404.
  // Source: R. Tellason, "Integrated Circuits by Generic Number" (7400-series
  //   master index). [Online]. Available: http://rtellason.com/ic-generic.html
  //   Verified: lists '690,'691,'692,'693,'696,'697,'698,'699 — no '694 or '695.
  '74x694': {
    name: '74x694',
    simpleName: '4 bit BCD Counter/Latch/Mux (S+A CLR)',
    description: '4-bit decade counter/latch/mux, 3-state out (20-pin) — info sheet only',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'http://www.bitsavers.org/components/ti/_dataBooks/1988_TI_Standard_TTL_Logic_Data_Book.pdf',
    tags: ['counter', 'bcd', 'decade', 'latch', 'multiplexer', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x690 family combines a synchronous counter, a 4 bit output register, and a 2:1 multiplexer that drives shared 3-state outputs in one 20-pin chip. Its real members are the 74x690/691/693 (count up) and 74x696/697/699 (count up or down); the number 74x694 is not one of them — the family skips from 693 to 696, and no manufacturer ever made a 694. This page is a placeholder kept for an old wishlist entry: there is no datasheet to verify a pinout against, so 74Sim does not simulate it. For the real behavior, see the 74x690.',
    guidePinDescriptions: {
      'CLK':  'Clock input (rising edge).',
      'ACLR': 'Asynchronous Clear (active LOW). Instantly resets counter.',
      'SCLR': 'Synchronous Clear (active LOW). Clears on next clock edge.',
      'D0':   'Parallel load input bit 0.',
      'D1':   'Parallel load input bit 1.',
      'D2':   'Parallel load input bit 2.',
      'D3':   'Parallel load input bit 3.',
      'LE':   'Latch Enable.',
      'S':    'Output Select: LOW = latch; HIGH = counter.',
      'GND':  'Ground reference (pin 10).',
      'OEn':  'Output Enable (active LOW).',
      'Q0':   'Output bit 0.',
      'Q1':   'Output bit 1.',
      'Q2':   'Output bit 2.',
      'Q3':   'Output bit 3.',
      'RCO':  'Ripple Carry Output.',
      'ENT':  'Count Enable T (active LOW).',
      'ENP':  'Count Enable P (active LOW).',
      'LOAD': 'Parallel Load (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Dual Clear Inputs',
        paragraphs: [
          'ACLR resets the counter immediately regardless of clock; SCLR waits for the next rising edge. This lets designers choose between fast deterministic reset and clean clocked reset from the same IC.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input'  },
      { pin:  2, name: 'ACLR', type: 'input'  },
      { pin:  3, name: 'SCLR', type: 'input'  },
      { pin:  4, name: 'D0',   type: 'input'  },
      { pin:  5, name: 'D1',   type: 'input'  },
      { pin:  6, name: 'D2',   type: 'input'  },
      { pin:  7, name: 'D3',   type: 'input'  },
      { pin:  8, name: 'LE',   type: 'input'  },
      { pin:  9, name: 'S',    type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'OEn',  type: 'input'  },
      { pin: 12, name: 'Q0',   type: 'output' },
      { pin: 13, name: 'Q1',   type: 'output' },
      { pin: 14, name: 'Q2',   type: 'output' },
      { pin: 15, name: 'Q3',   type: 'output' },
      { pin: 16, name: 'RCO',  type: 'output' },
      { pin: 17, name: 'ENT',  type: 'input'  },
      { pin: 18, name: 'ENP',  type: 'input'  },
      { pin: 19, name: 'LOAD', type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // Inert documentation stub. '694 is not a real part — there is no datasheet
      // to verify a pinout against, so the pins above are an unverifiable guess and
      // the chip drives no outputs (all Hi-Z). See the header comment and issues.md C39.
      { type: 'COUNTER_LATCH_MUX_STUB', inputs: ['CLK','ACLR','SCLR','D0','D1','D2','D3','LE','S','OEn','ENT','ENP','LOAD'], outputs: ['Q0','Q1','Q2','Q3','RCO'] },
    ],
    note: 'Info sheet only: 74x694 is not a real part number. The 74x690-family counter/register/mux runs 690/691/693 (up) and 696/697/699 (up-down) and skips from 693 to 696 — no manufacturer made a 694, so there is no datasheet to verify a pinout against. Kept as a hidden documentation placeholder; drives no outputs. See the real 74x690.',
  },

  // ── 74695: 4 bit binary counter/latch/mux, sync+async CLR, TRI (20-pin) ──
  //
  // ── LEFT AS A STUB: '695 is not a real device ───────────────────────────────
  // Like its '694 sibling above, the number '695 is not assigned in the 74-series
  // "synchronous counter with output register and multiplexed 3-state outputs"
  // family. That family runs
  //   '690 decade / direct (async) clear      '696 up-down decade  / async clear
  //   '691 binary / direct (async) clear      '697 up-down binary  / async clear
  //   '692 decade / synchronous clear         '698 up-down decade  / sync clear
  //   '693 binary / synchronous clear         '699 up-down binary  / sync clear
  // and skips straight from '693 to '696 — there is no '694 or '695. No
  // manufacturer (TI, National, Fairchild) ever shipped one, so there is no
  // datasheet to read and no terminal assignment to verify. The pinout and the
  // "synchronous AND asynchronous clear" function in this entry were hand-entered
  // (same fabricated-stub class as the '691/'692/'693 siblings — see issues.md
  // C38) and cannot be confirmed against any source. Assigning pin numbers to a
  // part that does not exist would be exactly the C2/CD4082 fabrication this
  // project forbids, so this stays an inert documentation stub: the engine
  // primitive COUNTER_LATCH_MUX_STUB drives all outputs Hi-Z and the 'stub' tag
  // hides it from the picker. See issues.md C41.
  //
  // Sources consulted (all real; none lists a '695):
  // Source: Texas Instruments, "SN54LS690..SN54LS693, SN74LS690..SN74LS693 —
  //   Synchronous Counters with Output Registers and Multiplexed 3-State Outputs",
  //   doc D2423 (Jan 1981, rev. Mar 1988), in "The TTL Logic Data Book" (1988),
  //   pp. 2-1139..2-1146. [Online]. Available (bitsavers):
  //   http://www.bitsavers.org/components/ti/_dataBooks/1988_TI_Standard_TTL_Logic_Data_Book.pdf
  //   Verified: the book selection index and the family datasheet header — the
  //   family is '690/'691/'693 (up) and '696/'697/'699 (up-down); the index jumps
  //   from 2-1139 ('690..'693) to 2-1149 ('696..'699), with no '694/'695 — read
  //   as a rendered PDF page image (issues.md C4). TI's own sn74als695 /
  //   sn74as695 / sn74ls695 symlinks all 404.
  // Source: R. Tellason, "Integrated Circuits by Generic Number" (7400-series
  //   master index). [Online]. Available: http://rtellason.com/ic-generic.html
  //   Verified: lists '690,'691,'692,'693,'696,'697,'698,'699 — no '694 or '695.
  '74x695': {
    name: '74x695',
    simpleName: '4 bit Binary Counter/Latch/Mux (S+A CLR)',
    description: '4-bit binary counter/latch/mux, 3-state out (20-pin) — info sheet only',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'http://www.bitsavers.org/components/ti/_dataBooks/1988_TI_Standard_TTL_Logic_Data_Book.pdf',
    tags: ['counter', 'binary', '4 bit', 'latch', 'multiplexer', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x690 family combines a synchronous counter, a 4 bit output register, and a 2:1 multiplexer that drives shared 3-state outputs in one 20-pin chip. Its real members are the 74x690/691/693 (count up) and 74x696/697/699 (count up or down); the number 74x695 is not one of them — the family skips from 693 to 696, and no manufacturer ever made a 695. This page is a placeholder kept for an old wishlist entry: there is no datasheet to verify a pinout against, so 74Sim does not simulate it. For the real binary version, see the 74x691.',
    guidePinDescriptions: {
      'CLK':  'Clock input (rising edge).',
      'ACLR': 'Asynchronous Clear (active LOW).',
      'SCLR': 'Synchronous Clear (active LOW).',
      'D0':   'Parallel load input bit 0.',
      'D1':   'Parallel load input bit 1.',
      'D2':   'Parallel load input bit 2.',
      'D3':   'Parallel load input bit 3.',
      'LE':   'Latch Enable.',
      'S':    'Output Select.',
      'GND':  'Ground reference (pin 10).',
      'OEn':  'Output Enable (active LOW).',
      'Q0':   'Output bit 0.',
      'Q1':   'Output bit 1.',
      'Q2':   'Output bit 2.',
      'Q3':   'Output bit 3.',
      'RCO':  'Ripple Carry Output.',
      'ENT':  'Count Enable T (active LOW).',
      'ENP':  'Count Enable P (active LOW).',
      'LOAD': 'Parallel Load (active LOW).',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Use the real parts instead',
        paragraphs: [
          'There is no 74x695. For a 4 bit binary counter with an output register and a multiplexed 3-state output, use the 74x691 (asynchronous clear) or 74x693 (synchronous clear). For an up/down version, see the 74x697.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input'  },
      { pin:  2, name: 'ACLR', type: 'input'  },
      { pin:  3, name: 'SCLR', type: 'input'  },
      { pin:  4, name: 'D0',   type: 'input'  },
      { pin:  5, name: 'D1',   type: 'input'  },
      { pin:  6, name: 'D2',   type: 'input'  },
      { pin:  7, name: 'D3',   type: 'input'  },
      { pin:  8, name: 'LE',   type: 'input'  },
      { pin:  9, name: 'S',    type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'OEn',  type: 'input'  },
      { pin: 12, name: 'Q0',   type: 'output' },
      { pin: 13, name: 'Q1',   type: 'output' },
      { pin: 14, name: 'Q2',   type: 'output' },
      { pin: 15, name: 'Q3',   type: 'output' },
      { pin: 16, name: 'RCO',  type: 'output' },
      { pin: 17, name: 'ENT',  type: 'input'  },
      { pin: 18, name: 'ENP',  type: 'input'  },
      { pin: 19, name: 'LOAD', type: 'input'  },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // Inert documentation stub. '695 is not a real part — there is no datasheet
      // to verify a pinout against, so the pins above are an unverifiable guess and
      // the chip drives no outputs (all Hi-Z). See the header comment and issues.md C41.
      { type: 'COUNTER_LATCH_MUX_STUB', inputs: ['CLK','ACLR','SCLR','D0','D1','D2','D3','LE','S','OEn','ENT','ENP','LOAD'], outputs: ['Q0','Q1','Q2','Q3','RCO'] },
    ],
    note: 'Info sheet only: 74x695 is not a real part number. The 74x690-family counter/register/mux runs 690/691/693 (up) and 696/697/699 (up-down) and skips from 693 to 696 — no manufacturer made a 695, so there is no datasheet to verify a pinout against. Kept as a hidden documentation placeholder; drives no outputs. See the real 74x691.',
  },

  // ── 74696: 4 bit BCD up/down counter/reg/mux, async CLR, TRI (20-pin) ─────
  // Source: Texas Instruments, "SN54LS696/697/699, SN74LS696/697/699
  //   Synchronous Up/Down Counters with Output Registers and Multiplexed
  //   3-State Outputs", SDLS199 / D2424 (Jan 1981, rev. Mar 1988). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn74ls696.pdf (404s; the
  //   family sheet at .../sn74ls697.pdf is the same document). Verified:
  //   terminal assignment, description, the 'LS696 positive-logic logic diagram
  //   and the 'LS696 IEC logic symbol, pages 1-3, read as 300-dpi rendered PDF
  //   page images (issues.md C4 — the TI text summarizer mangles these pinouts).
  // PINOUT FIX (issues.md C2): the pre-existing stub map (CLK/CLR/D0-D3/LE/S/
  //   OEn/.../UD on pins 1-19) was hand-entered and WRONG — it invented signals
  //   the '696 does not have. Replaced with the real U/D(1), CCK(2), A-D(3-6),
  //   ENP(7), CCLR(8), RCK(9), GND(10), R/C(11), G(12), LOAD(13), ENT(14),
  //   QD-QA(15-18), RCO(19), VCC(20) assignment read off the datasheet pinout
  //   (identical to the verified '697 sibling — same family package).
  // Polarity verified from the IEC symbol: ENP, ENT and RCO are ACTIVE LOW
  //   (overbars + active-low triangle on the pin-19 RCO output; the
  //   package-diagram overbar on RCO is faint but the symbol bars it, and the
  //   datasheet cascade ties RCO -> ENT, which only works if both are active
  //   low). U/D HIGH = up, LOW = down; R/C HIGH = register, LOW = counter; G
  //   active LOW gates the 3-state outputs; CCLR active LOW is asynchronous.
  // Engine: drives the shared COUNTER_UPDOWN_REG_MUX_TRI primitive with mod:10
  //   (BCD decade). Same primitive the '697 uses with mod:16; the only
  //   difference between the two parts is the count radix and the terminal
  //   count (9 vs 15). NOT the up-only 74x690 COUNTER_REG_MUX_TRI (that has an
  //   RCLR pin, no U/D, and active-HIGH enables/RCO).
  '74x696': {
    name: '74x696',
    simpleName: '4 bit BCD Counter/Reg/Mux (Async CLR)',
    description: '4-bit sync BCD up/down counter/reg/mux, 3-state, async clr (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls697.pdf',
    tags: ['counter', 'bcd', 'decade', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x696 packs three blocks into one 20-pin chip: a synchronous decade counter that counts BCD 0-9 up or down, a 4 bit register that can snapshot the count, and a multiplexer that picks which of the two drives the output pins. The counter and the register each have their own clock, so you can freeze a reading in the register while the counter keeps running. U/D sets the direction: HIGH counts up, LOW counts down. R/C selects what appears on QA-QD: the live counter when LOW, the stored register when HIGH. The Q outputs are 3-state, switched on and off by G. It is the BCD version of the 74x697, which counts binary 0-15.',
    guidePinDescriptions: {
      'U/D':  'Up/Down direction. HIGH counts up, LOW counts down.',
      'CCK':  'Counter Clock. The counter acts on the rising edge.',
      'A':    'Parallel data input, bit 0 (least significant). Loaded into the counter on a CCK rising edge while LOAD is LOW.',
      'B':    'Parallel data input, bit 1.',
      'C':    'Parallel data input, bit 2.',
      'D':    'Parallel data input, bit 3 (most significant).',
      'ENP':  'Count Enable P (active LOW). Counting needs both ENP and ENT LOW.',
      'CCLR': 'Counter Clear (active LOW, asynchronous). Forces the counter to 0 at once, no clock needed.',
      'RCK':  'Register Clock. On the rising edge the register snapshots the current count.',
      'GND':  'Ground (pin 10).',
      'R/C':  'Register/Counter select. LOW shows the live counter on QA-QD; HIGH shows the stored register.',
      'G':    'Output Enable (active LOW). LOW drives QA-QD; HIGH puts them in high impedance (off the bus).',
      'LOAD': 'Parallel Load (active LOW). With LOAD LOW, the next CCK rising edge loads A-D into the counter instead of counting.',
      'ENT':  'Count Enable T (active LOW). Also gates the ripple carry output.',
      'QD':   'Multiplexed 3-state output, bit 3.',
      'QC':   'Multiplexed 3-state output, bit 2.',
      'QB':   'Multiplexed 3-state output, bit 1.',
      'QA':   'Multiplexed 3-state output, bit 0.',
      'RCO':  'Ripple Carry Output (active LOW). Goes LOW at the terminal count (9 counting up, 0 counting down) while ENT is LOW; feed it to the next stage ENT to cascade.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Three blocks in one',
        paragraphs: [
          'The counter, the register, and the multiplexer sit in series. The counter steps on CCK. Its four bits feed both the register and one side of the multiplexer. On a rising RCK edge the register copies whatever the counter holds at that moment. The multiplexer, set by R/C, then drives the output pins from either the live counter or the frozen register.',
          'Because the two clocks are separate, you can let the counter free-run while the register holds a steady value for a display or a bus read. If you tie CCK and RCK together, the register just lags the counter by one clock.',
        ],
      },
      {
        title: 'Counting, loading, and cascading',
        paragraphs: [
          'Counting happens on a CCK rising edge only when ENP and ENT are both LOW and LOAD is HIGH. U/D picks the direction: HIGH counts up, LOW counts down. Pull LOAD LOW and the next CCK edge loads A-D into the counter instead. CCLR LOW clears the counter at any time, no clock needed.',
          'The 74x696 counts BCD, so counting up it rolls 9 to 0 and counting down it rolls 0 to 9. RCO goes LOW at the terminal count (9 when counting up, 0 when counting down) while ENT is LOW; wire it to the ENT of the next chip to chain stages into a longer count.',
        ],
      },
      {
        title: '74x696/74x697/74x698/74x699 Family',
        list: [
          '74x696: BCD (0-9), async clear',
          '74x697: Binary (0-15), async clear',
          '74x698: BCD (0-9), sync clear',
          '74x699: Binary (0-15), sync clear',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'U/D',  type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'CCLR', type: 'input'  },
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
      { type: 'COUNTER_UPDOWN_REG_MUX_TRI', mod: 10,
        inputs: ['U/D','CCK','A','B','C','D','ENP','ENT','CCLR','RCK','LOAD','G','R/C'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },

  // ── 74697: 4 bit binary up/down counter/reg/mux, async CLR, TRI (20-pin) ──
  // Source: Texas Instruments, "SN54LS696/697/699, SN74LS696/697/699
  //   Synchronous Up/Down Counters with Output Registers and Multiplexed
  //   3-State Outputs", SDLS199 / D2424 (Jan 1981, rev. Mar 1988). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn74ls697.pdf. Verified:
  //   terminal assignment, description, positive-logic logic diagrams and IEC
  //   logic symbols, page 1-2, read as rendered PDF page images (issues.md C4).
  // PINOUT FIX (issues.md C2): the pre-existing stub map (CLK/CLR/D0-D3/LE/S/
  //   OEn/ENT/ENP/LOAD/UD on pins 1-19) was hand-entered and WRONG — it invented
  //   74160/161-style signals the '697 does not have (the same bad stub the
  //   74x690 carried). Replaced with the real U/D, CCK, A-D, ENP, CCLR, RCK,
  //   R/C, G, LOAD, ENT, QA-QD, RCO assignment read off the datasheet pinout.
  //   Per the datasheet ENP, ENT and RCO are ACTIVE LOW (overbars; cascading
  //   ties RCO -> ENT). U/D HIGH = up, LOW = down; R/C HIGH = register, LOW =
  //   counter; G active LOW gates the 3-state outputs.
  // Engine: drives the COUNTER_UPDOWN_REG_MUX_TRI primitive (mod:16 = binary).
  //   This is the up/down sibling of the up-only 74x690 COUNTER_REG_MUX_TRI; it
  //   is NOT reusable here (the '697 has no RCLR, adds U/D, and its enables and
  //   RCO are active low instead of active high), so a separate primitive.
  '74x697': {
    name: '74x697',
    simpleName: '4 bit Binary Counter/Reg/Mux (Async CLR)',
    description: '4-bit sync binary up/down counter/reg/mux, 3-state, async clr (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls697.pdf',
    tags: ['counter', 'binary', '4 bit', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x697 packs three blocks into one 20-pin chip: a synchronous binary counter that counts 0-15 up or down, a 4 bit register that can snapshot the count, and a multiplexer that picks which of the two drives the output pins. The counter and the register each have their own clock, so you can freeze a reading in the register while the counter keeps running. U/D sets the direction: HIGH counts up, LOW counts down. R/C selects what appears on QA-QD: the live counter when LOW, the stored register when HIGH. The Q outputs are 3-state, switched on and off by G. It is the binary version of the 74x696, which counts BCD 0-9.',
    guidePinDescriptions: {
      'U/D':  'Up/Down direction. HIGH counts up, LOW counts down.',
      'CCK':  'Counter Clock. The counter acts on the rising edge.',
      'A':    'Parallel data input, bit 0 (least significant). Loaded into the counter on a CCK rising edge while LOAD is LOW.',
      'B':    'Parallel data input, bit 1.',
      'C':    'Parallel data input, bit 2.',
      'D':    'Parallel data input, bit 3 (most significant).',
      'ENP':  'Count Enable P (active LOW). Counting needs both ENP and ENT LOW.',
      'CCLR': 'Counter Clear (active LOW, asynchronous). Forces the counter to 0 at once, no clock needed.',
      'RCK':  'Register Clock. On the rising edge the register snapshots the current count.',
      'GND':  'Ground (pin 10).',
      'R/C':  'Register/Counter select. LOW shows the live counter on QA-QD; HIGH shows the stored register.',
      'G':    'Output Enable (active LOW). LOW drives QA-QD; HIGH puts them in high impedance (off the bus).',
      'LOAD': 'Parallel Load (active LOW). With LOAD LOW, the next CCK rising edge loads A-D into the counter instead of counting.',
      'ENT':  'Count Enable T (active LOW). Also gates the ripple carry output.',
      'QD':   'Multiplexed 3-state output, bit 3.',
      'QC':   'Multiplexed 3-state output, bit 2.',
      'QB':   'Multiplexed 3-state output, bit 1.',
      'QA':   'Multiplexed 3-state output, bit 0.',
      'RCO':  'Ripple Carry Output (active LOW). Goes LOW at the terminal count (15 counting up, 0 counting down) while ENT is LOW; feed it to the next stage ENT to cascade.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Three blocks in one',
        paragraphs: [
          'The counter, the register, and the multiplexer sit in series. The counter steps on CCK. Its four bits feed both the register and one side of the multiplexer. On a rising RCK edge the register copies whatever the counter holds at that moment. The multiplexer, set by R/C, then drives the output pins from either the live counter or the frozen register.',
          'Because the two clocks are separate, you can let the counter free-run while the register holds a steady value for a display or a bus read. If you tie CCK and RCK together, the register just lags the counter by one clock.',
        ],
      },
      {
        title: 'Counting, loading, and cascading',
        paragraphs: [
          'Counting happens on a CCK rising edge only when ENP and ENT are both LOW and LOAD is HIGH. U/D picks the direction: HIGH counts up, LOW counts down. Pull LOAD LOW and the next CCK edge loads A-D into the counter instead. CCLR LOW clears the counter at any time, no clock needed.',
          'The 74x697 counts binary, so counting up it rolls 15 to 0 and counting down it rolls 0 to 15. RCO goes LOW at the terminal count (15 when counting up, 0 when counting down) while ENT is LOW; wire it to the ENT of the next chip to chain stages into a longer count.',
        ],
      },
      {
        title: '74x696/74x697/74x698/74x699 Family',
        list: [
          '74x696: BCD (0-9), async clear',
          '74x697: Binary (0-15), async clear',
          '74x698: BCD (0-9), sync clear',
          '74x699: Binary (0-15), sync clear',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'U/D',  type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'CCLR', type: 'input'  },
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
      { type: 'COUNTER_UPDOWN_REG_MUX_TRI', mod: 16,
        inputs: ['U/D','CCK','A','B','C','D','ENP','ENT','CCLR','RCK','LOAD','G','R/C'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },

  // ── 74698: 4 bit BCD counter/reg/mux, sync CLR, TRI (20-pin) ─────────────
  // Source: Texas Instruments, "SN54LS696/697/699, SN74LS696/697/699
  //   Synchronous Up/Down Counters with Output Registers and Multiplexed
  //   3-State Outputs", SDLS199 / D2424 (Jan 1981, rev. Mar 1988). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn74ls697.pdf. Verified:
  //   terminal assignment, description, and the SN54LS698/SN74LS698 positive-
  //   logic logic diagram (page 5) + IEC logic symbol, read as rendered PDF
  //   page images (issues.md C4). The '698 shares one datasheet with the
  //   '696/'697/'699; the '698-specific PDF URL 404s, the '697 PDF carries the
  //   whole family including the '698 logic diagram.
  // PINOUT FIX (issues.md C2): the pre-existing stub map (CLK/CLR/D0-D3/LE/S/
  //   OEn/ENT/ENP/LOAD/UD on pins 1-19) was hand-entered and WRONG — it invented
  //   signals the '698 does not have (the same bad stub the 74x690/697 carried).
  //   Replaced with the real U/D, CCK, A-D, ENP, CCLR, RCK, R/C, G, LOAD, ENT,
  //   QA-QD, RCO assignment read off the datasheet pinout. Per the datasheet
  //   ENP, ENT and RCO are ACTIVE LOW (overbars; cascading ties RCO -> ENT).
  //   U/D HIGH = up, LOW = down; R/C HIGH = register, LOW = counter; G active
  //   LOW gates the 3-state outputs.
  // Engine: reuses the COUNTER_UPDOWN_REG_MUX_TRI primitive with mod:10 (decade)
  //   and syncClear:true. The '698 is the synchronous-clear BCD member of the
  //   family: identical to the '696 except CCLR is sampled on the CCK edge
  //   instead of clearing asynchronously. Same primitive as the '697, only the
  //   modulus and clear timing differ.
  '74x698': {
    name: '74x698',
    simpleName: '4 bit BCD Counter/Reg/Mux (Sync CLR)',
    description: '4-bit sync BCD up/down counter/reg/mux, 3-state, sync clr (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls698.pdf',
    tags: ['counter', 'bcd', 'decade', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x698 packs three blocks into one 20-pin chip: a synchronous BCD counter that counts 0-9 up or down, a 4 bit register that can snapshot the count, and a multiplexer that picks which of the two drives the output pins. The counter and the register each have their own clock, so you can freeze a reading in the register while the counter keeps running. U/D sets the direction: HIGH counts up, LOW counts down. R/C selects what appears on QA-QD: the live counter when LOW, the stored register when HIGH. The Q outputs are 3-state, switched on and off by G. It is the synchronous-clear version of the 74x696: CCLR clears the counter on the next CCK edge instead of the moment it goes LOW.',
    guidePinDescriptions: {
      'U/D':  'Up/Down direction. HIGH counts up, LOW counts down.',
      'CCK':  'Counter Clock. The counter acts on the rising edge.',
      'A':    'Parallel data input, bit 0 (least significant). Loaded into the counter on a CCK rising edge while LOAD is LOW.',
      'B':    'Parallel data input, bit 1.',
      'C':    'Parallel data input, bit 2.',
      'D':    'Parallel data input, bit 3 (most significant).',
      'ENP':  'Count Enable P (active LOW). Counting needs both ENP and ENT LOW.',
      'CCLR': 'Counter Clear (active LOW, synchronous). With CCLR LOW, the next CCK rising edge forces the counter to 0.',
      'RCK':  'Register Clock. On the rising edge the register snapshots the current count.',
      'GND':  'Ground (pin 10).',
      'R/C':  'Register/Counter select. LOW shows the live counter on QA-QD; HIGH shows the stored register.',
      'G':    'Output Enable (active LOW). LOW drives QA-QD; HIGH puts them in high impedance (off the bus).',
      'LOAD': 'Parallel Load (active LOW). With LOAD LOW, the next CCK rising edge loads A-D into the counter instead of counting.',
      'ENT':  'Count Enable T (active LOW). Also gates the ripple carry output.',
      'QD':   'Multiplexed 3-state output, bit 3.',
      'QC':   'Multiplexed 3-state output, bit 2.',
      'QB':   'Multiplexed 3-state output, bit 1.',
      'QA':   'Multiplexed 3-state output, bit 0.',
      'RCO':  'Ripple Carry Output (active LOW). Goes LOW at the terminal count (9 counting up, 0 counting down) while ENT is LOW; feed it to the next stage ENT to cascade.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Three blocks in one',
        paragraphs: [
          'The counter, the register, and the multiplexer sit in series. The counter steps on CCK. Its four bits feed both the register and one side of the multiplexer. On a rising RCK edge the register copies whatever the counter holds at that moment. The multiplexer, set by R/C, then drives the output pins from either the live counter or the frozen register.',
          'Because the two clocks are separate, you can let the counter free-run while the register holds a steady value for a display or a bus read. If you tie CCK and RCK together, the register just lags the counter by one clock.',
        ],
      },
      {
        title: 'Synchronous clear',
        paragraphs: [
          'CCLR clears the counter, but unlike the 74x696 it waits for the clock. Hold CCLR LOW and the counter goes to 0 on the next CCK rising edge, not the instant CCLR drops. Clearing on the edge keeps every change to the count lined up with the clock, so a brief glitch on CCLR between edges cannot zero the counter on its own.',
          'On that edge the clear takes priority over both loading and counting: if CCLR is LOW the counter goes to 0 regardless of LOAD or the enables.',
        ],
      },
      {
        title: '74x696/74x697/74x698/74x699 Family',
        list: [
          '74x696: BCD (0-9), async clear',
          '74x697: Binary (0-15), async clear',
          '74x698: BCD (0-9), sync clear',
          '74x699: Binary (0-15), sync clear',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'U/D',  type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'CCLR', type: 'input'  },
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
      { type: 'COUNTER_UPDOWN_REG_MUX_TRI', mod: 10, syncClear: true,
        inputs: ['U/D','CCK','A','B','C','D','ENP','ENT','CCLR','RCK','LOAD','G','R/C'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },

  // ── 74699: 4 bit binary up/down counter/reg/mux, sync CLR, TRI (20-pin) ───
  // Source: Texas Instruments, "Types SN54LS696 thru SN54LS699, SN74LS696 thru
  //   SN74LS699 — Synchronous Up/Down Counters With Output Registers and
  //   Multiplexed 3-State Outputs", doc D2424 (Jan. 1981). [Online]. Available:
  //   https://datasheet.datasheetarchive.com/originals/scans/Scans-007/Scans-00141452.pdf
  //   Verified: DIP terminal assignment (top view), description, recommended
  //   operating conditions, IEC logic symbols and positive-logic logic diagrams,
  //   pp. 1-2/4-5, read as rendered ~300-dpi PDF page images (issues.md C4).
  //   TI's own sn74ls699.pdf now 404s (obsolete LS part); the scan above is the
  //   TI "TTL Devices" data-book page, retrieved via DatasheetArchive.
  // Pinout (DW/J/N, top view) read directly off the datasheet — the prior stub
  //   pin map (single CLK/CLR/LE/S/OEn) was wrong (issues.md C2 lesson): the real
  //   part has two clocks (CCK counter, RCK register), CCLR, U/D, ENP/ENT, LOAD,
  //   R/C select and G output-enable. 1=U/D 2=CCK 3=A 4=B 5=C 6=D 7=ENP 8=CCLR
  //   9=RCK 10=GND 11=R/C 12=G 13=LOAD 14=ENT 15=QD 16=QC 17=QB 18=QA 19=RCO
  //   20=VCC. ENP, ENT and RCO are active LOW (cascade: RCO -> ENT).
  // Behavior: reuses the shared COUNTER_UPDOWN_REG_MUX_TRI primitive (the whole
  //   '696-'699 family); '699 = binary (mod 16) + synchronous CCLR.
  '74x699': {
    name: '74x699',
    simpleName: '4 bit Binary Counter/Reg/Mux (Sync CLR)',
    description: '4-bit binary up/down counter/reg/mux, sync clr, 3-state (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls699.pdf',
    tags: ['counter', 'binary', '4 bit', 'up/down', 'register', 'multiplexer', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x699 packs three blocks behind one set of pins: a 4 bit binary up/down counter (0-15), a 4 bit register that snapshots the counter, and a 2:1 multiplexer that picks which of the two drives the tri state outputs. The counter and the register each have their own clock (CCK and RCK), so you can freeze a count in the register and keep counting. R/C selects what the outputs show; G turns the outputs on. The 74x699 is the binary, synchronous-clear member of the 74x696-74x699 family.',
    guidePinDescriptions: {
      'UD':   'Up/Down direction. HIGH counts up, LOW counts down.',
      'CCK':  'Counter clock. The counter updates on the rising edge.',
      'A':    'Parallel load data, bit 0 (LSB).',
      'B':    'Parallel load data, bit 1.',
      'C':    'Parallel load data, bit 2.',
      'D':    'Parallel load data, bit 3 (MSB).',
      'ENP':  'Count enable P (active LOW). Both ENP and ENT must be LOW to count.',
      'CCLR': 'Counter clear (active LOW). Synchronous: clears on the next CCK rising edge.',
      'RCK':  'Register clock. The register loads the counter value on the rising edge.',
      'GND':  'Ground reference (pin 10).',
      'RC':   'Register/Counter select. LOW shows the counter, HIGH shows the register.',
      'G':    'Output enable (active LOW). HIGH puts the Q outputs in tri state.',
      'LOAD': 'Parallel load (active LOW). On the next CCK rising edge the counter loads A-D.',
      'ENT':  'Count enable T (active LOW). Also gates RCO. Tie a stage RCO to the next ENT to cascade.',
      'QD':   'Output bit 3 (MSB).',
      'QC':   'Output bit 2.',
      'QB':   'Output bit 1.',
      'QA':   'Output bit 0 (LSB).',
      'RCO':  'Ripple carry out (active LOW). LOW at terminal count (15 counting up, 0 counting down) while ENT is LOW.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Two clocks, one set of outputs',
        paragraphs: [
          'The counter and the register run on separate clocks. CCK steps the counter; RCK copies the current count into the register. Because they are independent, you can latch a value into the register and keep the counter running, then read either one through the multiplexer by setting R/C.',
          'Tie CCK and RCK together and the register simply tracks the counter one clock behind.',
        ],
      },
      {
        title: '74x696-74x699 family',
        list: [
          '74x696: BCD (decade), asynchronous clear',
          '74x697: binary (0-15), asynchronous clear',
          '74x698: BCD (decade), synchronous clear',
          '74x699: binary (0-15), synchronous clear',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'UD',   type: 'input'  },
      { pin:  2, name: 'CCK',  type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'ENP',  type: 'input'  },
      { pin:  8, name: 'CCLR', type: 'input'  },
      { pin:  9, name: 'RCK',  type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'RC',   type: 'input'  },
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
      { type: 'COUNTER_UPDOWN_REG_MUX_TRI', mod: 16, syncClear: true,
        inputs: ['UD','CCK','A','B','C','D','ENP','ENT','CCLR','RCK','LOAD','G','RC'],
        outputs: ['QA','QB','QC','QD','RCO'] },
    ],
  },

  // ── 74700: Octal DRAM driver, inverting, TRI (20-pin) ────────────────────
  /* Primary source: Texas Instruments, 74700 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74s700.pdf
     https://en.wikipedia.org/wiki/Random-access_memory */
  '74x700': {
    name: '74x700',
    simpleName: 'Octal DRAM Driver (Inv)',
    description: 'Octal DRAM address driver with inverting tri state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74s700.pdf',
    tags: ['buffer', 'driver', 'DRAM', 'octal', 'inverting', 'tri state', 'stub'],
    guideOverview: 'The 74x700 is an octal DRAM address driver with inverting tri state outputs. It buffers and inverts 8 address lines (A0-A7) to the active LOW DRAM address format (Y0-Y7). OEn enables all outputs simultaneously. Used in DRAM controller circuits to multiplex row and column address signals.',
    guidePinDescriptions: {
      'OEn':  'Output Enable (active LOW). All 8 outputs go tri state when HIGH.',
      'A0':   'Address input bit 0.',
      'A1':   'Address input bit 1.',
      'A2':   'Address input bit 2.',
      'A3':   'Address input bit 3.',
      'A4':   'Address input bit 4.',
      'A5':   'Address input bit 5.',
      'A6':   'Address input bit 6.',
      'A7':   'Address input bit 7.',
      'GND':  'Ground reference (pin 10).',
      'Y7':   'Inverted output for A7.',
      'Y6':   'Inverted output for A6.',
      'Y5':   'Inverted output for A5.',
      'Y4':   'Inverted output for A4.',
      'Y3':   'Inverted output for A3.',
      'Y2':   'Inverted output for A2.',
      'Y1':   'Inverted output for A1.',
      'Y0':   'Inverted output for A0.',
      'NC':   'No connect.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'DRAM Address Multiplexing',
        paragraphs: [
          'DRAM chips use multiplexed row/column addresses on the same pins. The 74x700 buffers one set of address lines during RAS or CAS strobe. The inversion handles the active LOW address convention on some DRAM families.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'A0',   type: 'input'  },
      { pin:  3, name: 'A1',   type: 'input'  },
      { pin:  4, name: 'A2',   type: 'input'  },
      { pin:  5, name: 'A3',   type: 'input'  },
      { pin:  6, name: 'A4',   type: 'input'  },
      { pin:  7, name: 'A5',   type: 'input'  },
      { pin:  8, name: 'A6',   type: 'input'  },
      { pin:  9, name: 'A7',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'Y7',   type: 'output' },
      { pin: 12, name: 'Y6',   type: 'output' },
      { pin: 13, name: 'Y5',   type: 'output' },
      { pin: 14, name: 'Y4',   type: 'output' },
      { pin: 15, name: 'Y3',   type: 'output' },
      { pin: 16, name: 'Y2',   type: 'output' },
      { pin: 17, name: 'Y1',   type: 'output' },
      { pin: 18, name: 'Y0',   type: 'output' },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','OEn'], outputs: ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'] },
    ],
  },

  // ── 74701: 8 bit register/counter/comparator, TRI (24-pin) ───────────────
  // Source: National Semiconductor, "54F/74F701 Register, Counter, Comparator",
  //   ADVANCED INFORMATION datasheet (drawing refs TL/F/9589), in the National
  //   "FAST Databook" (1988), printed pp. 4-558..4-559. [Online]. Available:
  //   http://www.bitsavers.org/components/national/_dataBooks/1988_National_FAST_Databook.pdf
  //   Verified: connection diagram (24-pin DIP), logic symbol, general description,
  //   features, and functional block diagram, read as 600-dpi rendered PDF page
  //   images (issues.md C4 — never trust the PDF text summarizer). The pinout below
  //   is taken from that connection diagram and CORRECTS the original hand-entered
  //   stub, which was fabricated: it invented separate D0-D7 inputs + Q0-Q7 outputs
  //   and CLK/CLR/OEn/EQout pins that the real part does not have (issues.md C2).
  //   The real device shares ONE 8-bit bidirectional bus (D0-D7) for both load and
  //   read-back, has two VCC pins (18,19) and two GND pins (6,7), and selects its
  //   operation with S0-S2.
  // LEFT AS STUB: the only surviving datasheet is the 2-page preliminary "ADVANCED
  //   INFORMATION" release. It documents the pinout, the functional block diagram,
  //   and the SET of operations (load register or counter from the bus, up/down
  //   count, register<->counter transfer, compare register vs counter) but gives NO
  //   S2:S0 operation truth table. Which S-code selects load vs up-count vs
  //   down-count vs transfer — and the count direction itself, which has no
  //   dedicated pin — was never published, so the control logic cannot be modeled
  //   without fabricating it. The 1990 "FAST Advanced Schottky TTL Logic Databook"
  //   carries the F701 in its selection guide only (no datasheet pages), and web /
  //   datasheet-archive searches surfaced only the same preliminary 2-pager. The
  //   pinout and docs are corrected and verified; the gate is kept GENERIC_STUB and
  //   the entry stays tagged 'stub'. See issues.md ("74x701").
  /* https://en.wikipedia.org/wiki/Digital_comparator */
  '74x701': {
    name: '74x701',
    simpleName: '8 bit Register/Counter/Comparator',
    description: '8-bit register, up/down counter and comparator on shared bus (24-pin)',
    pins: 24, vcc: 18, gnd: 6,
    datasheet: 'http://www.bitsavers.org/components/national/_dataBooks/1988_National_FAST_Databook.pdf',
    tags: ['register', 'counter', 'comparator', '8 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x701 packs an 8 bit register, an 8 bit up/down counter, and a comparator that flags when the two hold equal values, all in one 24-pin package. D0-D7 is a single bidirectional bus: data is loaded into the register or the counter from the bus, and either one can be driven back out onto it. CLOCK loads and counts on the rising edge; CLRR and CLRC clear the register and the counter; CET enables counting. S0-S2 select which operation runs, and SEL picks whether the register or the counter drives the bus when OE turns the three-state outputs on. Oa=b goes active when the register and counter are equal, and TC is the counter carry for chaining wider counters.',
    guidePinDescriptions: {
      'CET':   'Count enable (active LOW). Lets the counter advance.',
      'CLRC':  'Clear counter (active LOW).',
      'CLRR':  'Clear register (active LOW).',
      'CLOCK': 'Clock input. Loads and counts on the rising edge.',
      'SEL':   'Bus source select. Picks whether the register or the counter drives the data bus.',
      'GND':   'Ground reference (pins 6 and 7).',
      'OE':    'Output enable (active LOW). Turns on the three-state bus drivers.',
      'S2':    'Operation select input, bit 2.',
      'S1':    'Operation select input, bit 1.',
      'S0':    'Operation select input, bit 0.',
      'LE':    'Latch enable.',
      'Oa=b':  'Equal output. Active when the register and counter hold the same value.',
      'D7':    'Bidirectional data bus, bit 7.',
      'D6':    'Bidirectional data bus, bit 6.',
      'D5':    'Bidirectional data bus, bit 5.',
      'D4':    'Bidirectional data bus, bit 4.',
      'D3':    'Bidirectional data bus, bit 3.',
      'D2':    'Bidirectional data bus, bit 2.',
      'D1':    'Bidirectional data bus, bit 1.',
      'D0':    'Bidirectional data bus, bit 0.',
      'TC':    'Terminal count. Carry output for cascading counters.',
      'VCC':   'Positive supply (+5 V, pins 18 and 19).',
    },
    guideSections: [
      {
        title: 'Register, counter and comparator on one bus',
        paragraphs: [
          'One chip holds a value (the register), counts (the up/down counter), and checks whether the two match (the comparator). The register and counter share a single bidirectional bus, so the same eight pins both load data in and read data back out. That makes it useful for match-and-trigger jobs: count events, hold a target, and fire Oa=b when they line up, without separate comparator chips.',
        ],
        note: 'Operation is not simulated. The only surviving datasheet is a preliminary release with no operation table for the S0-S2 mode-select inputs, so the control logic cannot be modeled faithfully. The verified pinout is shown.',
      },
    ],
    pinout: [
      { pin:  1, name: 'CET',   type: 'input'  },
      { pin:  2, name: 'CLRC',  type: 'input'  },
      { pin:  3, name: 'CLRR',  type: 'input'  },
      { pin:  4, name: 'CLOCK', type: 'input'  },
      { pin:  5, name: 'SEL',   type: 'input'  },
      { pin:  6, name: 'GND',   type: 'power'  },
      { pin:  7, name: 'GND',   type: 'power'  },
      { pin:  8, name: 'OE',    type: 'input'  },
      { pin:  9, name: 'S2',    type: 'input'  },
      { pin: 10, name: 'S1',    type: 'input'  },
      { pin: 11, name: 'S0',    type: 'input'  },
      { pin: 12, name: 'LE',    type: 'input'  },
      { pin: 13, name: 'Oa=b',  type: 'output' },
      { pin: 14, name: 'D7',    type: 'bidir'  },
      { pin: 15, name: 'D6',    type: 'bidir'  },
      { pin: 16, name: 'D5',    type: 'bidir'  },
      { pin: 17, name: 'D4',    type: 'bidir'  },
      { pin: 18, name: 'VCC',   type: 'power'  },
      { pin: 19, name: 'VCC',   type: 'power'  },
      { pin: 20, name: 'D3',    type: 'bidir'  },
      { pin: 21, name: 'D2',    type: 'bidir'  },
      { pin: 22, name: 'D1',    type: 'bidir'  },
      { pin: 23, name: 'D0',    type: 'bidir'  },
      { pin: 24, name: 'TC',    type: 'output' },
    ],
    gates: [
      // Kept GENERIC_STUB — see the "LEFT AS STUB" note in the header comment.
      { type: 'GENERIC_STUB', inputs: ['CET','CLRC','CLRR','CLOCK','SEL','OE','S2','S1','S0','LE','D0','D1','D2','D3','D4','D5','D6','D7'], outputs: ['Oa=b','TC'] },
    ],
  },

  // ── 74702: 8 bit registered read-back transceiver, TRI (24-pin) ──────────
  /* Primary source: Texas Instruments, 74702 datasheet. [Online]. Available: https://www.datasheetz.com/datasheet/74F702
     https://en.wikipedia.org/wiki/Bus_transceiver */
  '74x702': {
    name: '74x702',
    simpleName: '8 bit Reg Read-back Transceiver',
    description: '8 bit registered read-back transceiver with tri state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.datasheetz.com/datasheet/74F702',
    tags: ['transceiver', 'register', '8 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x702 is an 8 bit registered transceiver with read-back capability. CLK registers data; DIR controls transfer direction; OEABn and OEBAn enable A-to B and B-to A paths independently. The read-back feature allows the CPU to verify what was written to the bus without additional logic.',
    guidePinDescriptions: {
      'CLK':   'Clock input. Registers data on rising edge.',
      'OEABn': 'Output Enable A-to B (active LOW).',
      'OEBAn': 'Output Enable B-to A (active LOW).',
      'DIR':   'Direction select. HIGH = A to B; LOW = B to A.',
      'A0':    'Bidirectional port A, bit 0.',
      'A1':    'Bidirectional port A, bit 1.',
      'A2':    'Bidirectional port A, bit 2.',
      'A3':    'Bidirectional port A, bit 3.',
      'A4':    'Bidirectional port A, bit 4.',
      'A5':    'Bidirectional port A, bit 5.',
      'A6':    'Bidirectional port A, bit 6.',
      'GND':   'Ground reference (pin 12).',
      'A7':    'Bidirectional port A, bit 7.',
      'B7':    'Bidirectional port B, bit 7.',
      'B6':    'Bidirectional port B, bit 6.',
      'B5':    'Bidirectional port B, bit 5.',
      'B4':    'Bidirectional port B, bit 4.',
      'B3':    'Bidirectional port B, bit 3.',
      'B2':    'Bidirectional port B, bit 2.',
      'B1':    'Bidirectional port B, bit 1.',
      'B0':    'Bidirectional port B, bit 0.',
      'NC1':   'No connect.',
      'NC2':   'No connect.',
      'VCC':   'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Registered Transceiver',
        paragraphs: [
          'Registered transceivers capture incoming data on the clock edge before driving it onto the destination bus. This prevents bus contention glitches and synchronizes data crossing between asynchronous bus segments.',
        ],
        note: 'Stub in simulator.',
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input'  },
      { pin:  2, name: 'OEABn',type: 'input'  },
      { pin:  3, name: 'OEBAn',type: 'input'  },
      { pin:  4, name: 'DIR',  type: 'input'  },
      { pin:  5, name: 'A0',   type: 'bidir'  },
      { pin:  6, name: 'A1',   type: 'bidir'  },
      { pin:  7, name: 'A2',   type: 'bidir'  },
      { pin:  8, name: 'A3',   type: 'bidir'  },
      { pin:  9, name: 'A4',   type: 'bidir'  },
      { pin: 10, name: 'A5',   type: 'bidir'  },
      { pin: 11, name: 'A6',   type: 'bidir'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'A7',   type: 'bidir'  },
      { pin: 14, name: 'B7',   type: 'bidir'  },
      { pin: 15, name: 'B6',   type: 'bidir'  },
      { pin: 16, name: 'B5',   type: 'bidir'  },
      { pin: 17, name: 'B4',   type: 'bidir'  },
      { pin: 18, name: 'B3',   type: 'bidir'  },
      { pin: 19, name: 'B2',   type: 'bidir'  },
      { pin: 20, name: 'B1',   type: 'bidir'  },
      { pin: 21, name: 'B0',   type: 'bidir'  },
      { pin: 22, name: 'NC1',  type: 'nc'     },
      { pin: 23, name: 'NC2',  type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CLK','OEABn','OEBAn','DIR','A0','A1','A2','A3','A4','A5','A6','A7'], outputs: ['B0','B1','B2','B3','B4','B5','B6','B7'] },
    ],
  },

  // ── 74707: 8 bit TTL ECL shift register (20-pin) ─────────────────────────
  /* Primary source: Texas Instruments, 74707 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74f707.pdf
     https://en.wikipedia.org/wiki/Shift_register */
  '74x707': {
    name: '74x707',
    simpleName: '8 bit TTL ECL Shift Register',
    description: '8 bit TTL to ECL shift register (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74f707.pdf',
    tags: ['shift register', 'ECL', 'TTL', '8 bit', 'stub'],
    sequential: true,
    guideOverview: 'The 74x707 is an 8 bit SIPO shift register that converts TTL input levels to ECL output levels, enabling interfacing between TTL logic and high speed ECL circuits. SI is the TTL serial input; CLK/CLKn provide differential clock. Q0-Q7 are ECL level outputs.',
    guidePinDescriptions: {
      'SI':   'Serial Input (TTL level).',
      'CLK':  'Clock input (positive phase of differential clock).',
      'CLKn': 'Complementary clock input.',
      'Q0':   'ECL output bit 0 (first shifted).',
      'Q1':   'ECL output bit 1.',
      'Q2':   'ECL output bit 2.',
      'Q3':   'ECL output bit 3.',
      'Q4':   'ECL output bit 4.',
      'Q5':   'ECL output bit 5.',
      'GND':  'Ground reference (pin 10).',
      'Q6':   'ECL output bit 6.',
      'Q7':   'ECL output bit 7.',
      'NC1':  'No connect.',
      'NC2':  'No connect.',
      'NC3':  'No connect.',
      'NC4':  'No connect.',
      'NC5':  'No connect.',
      'NC6':  'No connect.',
      'NC7':  'No connect.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'TTL to ECL Level Translation',
        paragraphs: [
          'ECL (Emitter Coupled Logic) operates at very high speeds but at different voltage levels than TTL. The 74x707 provides the level shifting function while capturing serial TTL data into an 8 bit parallel ECL word.',
        ],
        note: 'Stub in simulator. ECL output levels not fully modeled.',
      },
    ],
    pinout: [
      { pin:  1, name: 'SI',   type: 'input'  },
      { pin:  2, name: 'CLK',  type: 'input'  },
      { pin:  3, name: 'CLKn', type: 'input'  },
      { pin:  4, name: 'Q0',   type: 'output' },
      { pin:  5, name: 'Q1',   type: 'output' },
      { pin:  6, name: 'Q2',   type: 'output' },
      { pin:  7, name: 'Q3',   type: 'output' },
      { pin:  8, name: 'Q4',   type: 'output' },
      { pin:  9, name: 'Q5',   type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'Q6',   type: 'output' },
      { pin: 12, name: 'Q7',   type: 'output' },
      { pin: 13, name: 'NC1',  type: 'nc'     },
      { pin: 14, name: 'NC2',  type: 'nc'     },
      { pin: 15, name: 'NC3',  type: 'nc'     },
      { pin: 16, name: 'NC4',  type: 'nc'     },
      { pin: 17, name: 'NC5',  type: 'nc'     },
      { pin: 18, name: 'NC6',  type: 'nc'     },
      { pin: 19, name: 'NC7',  type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['SI','CLK','CLKn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
    ],
  },

  // ── 74710: 8 bit single supply TTL ECL shift register (20-pin) ───────────
  /* Primary source: Texas Instruments, 74710 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74f710.pdf
     https://en.wikipedia.org/wiki/Shift_register */
  '74x710': {
    name: '74x710',
    simpleName: '8 bit TTL ECL Shift Register (Single Supply)',
    description: '8 bit single supply TTL to ECL shift register (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74f710.pdf',
    tags: ['shift register', 'ECL', 'TTL', '8 bit', 'stub'],
    sequential: true,
    guideOverview: 'The 74x710 is a single supply version of the 74x707: 8 bit TTL to ECL shift register that operates from a single +5 V supply instead of dual ±5 V. The single supply design simplifies power distribution in mixed TTL/ECL boards.',
    guidePinDescriptions: {
      'SI':   'Serial Input (TTL level).',
      'CLK':  'Clock input (positive phase).',
      'CLKn': 'Complementary clock.',
      'Q0':   'ECL output bit 0.',
      'Q1':   'ECL output bit 1.',
      'Q2':   'ECL output bit 2.',
      'Q3':   'ECL output bit 3.',
      'Q4':   'ECL output bit 4.',
      'Q5':   'ECL output bit 5.',
      'GND':  'Ground reference (pin 10).',
      'Q6':   'ECL output bit 6.',
      'Q7':   'ECL output bit 7.',
      'NC1':  'No connect.',
      'NC2':  'No connect.',
      'NC3':  'No connect.',
      'NC4':  'No connect.',
      'NC5':  'No connect.',
      'NC6':  'No connect.',
      'NC7':  'No connect.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: '74x707 vs 74x710',
        paragraphs: [
          '74x707 requires dual supply (+5 V / -5.2 V); 74x710 works from a single +5 V supply. Otherwise functionally identical.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'SI',   type: 'input'  },
      { pin:  2, name: 'CLK',  type: 'input'  },
      { pin:  3, name: 'CLKn', type: 'input'  },
      { pin:  4, name: 'Q0',   type: 'output' },
      { pin:  5, name: 'Q1',   type: 'output' },
      { pin:  6, name: 'Q2',   type: 'output' },
      { pin:  7, name: 'Q3',   type: 'output' },
      { pin:  8, name: 'Q4',   type: 'output' },
      { pin:  9, name: 'Q5',   type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'Q6',   type: 'output' },
      { pin: 12, name: 'Q7',   type: 'output' },
      { pin: 13, name: 'NC1',  type: 'nc'     },
      { pin: 14, name: 'NC2',  type: 'nc'     },
      { pin: 15, name: 'NC3',  type: 'nc'     },
      { pin: 16, name: 'NC4',  type: 'nc'     },
      { pin: 17, name: 'NC5',  type: 'nc'     },
      { pin: 18, name: 'NC6',  type: 'nc'     },
      { pin: 19, name: 'NC7',  type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['SI','CLK','CLKn'], outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
    ],
  },

  // ── 74711: Quint 2-to-1 multiplexer, TRI (20-pin) ─────────────────────────
  /* Primary source: Texas Instruments, 74711 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74f711.pdf
     https://en.wikipedia.org/wiki/Multiplexer */
  '74x711': {
    name: '74x711',
    simpleName: 'Quint 2-to-1 Mux',
    description: 'Five 2-to-1 multiplexers with tri state outputs and common select (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74f711.pdf',
    tags: ['multiplexer', '2-to-1', 'quint', 'tri state'],
    guideOverview: 'The 74x711 contains five independent 2-to-1 multiplexers sharing a single SEL line and OEn enable. SEL=0 routes A0-A4 to Y0-Y4; SEL=1 routes B0-B4. OEn forces all outputs tri state. This bus width approach (five MUXes in one package) is useful for routing 5 bit data paths or arbitrary 5 bit control signals.',
    guidePinDescriptions: {
      'OEn':  'Output Enable (active LOW). All outputs go tri state when HIGH.',
      'SEL':  'Select. LOW = A inputs; HIGH = B inputs.',
      'A0':   'Input A of channel 0.',
      'B0':   'Input B of channel 0.',
      'A1':   'Input A of channel 1.',
      'B1':   'Input B of channel 1.',
      'A2':   'Input A of channel 2.',
      'B2':   'Input B of channel 2.',
      'A3':   'Input A of channel 3.',
      'GND':  'Ground reference (pin 10).',
      'B3':   'Input B of channel 3.',
      'A4':   'Input A of channel 4.',
      'B4':   'Input B of channel 4.',
      'Y4':   'Output of channel 4.',
      'Y3':   'Output of channel 3.',
      'Y2':   'Output of channel 2.',
      'Y1':   'Output of channel 1.',
      'Y0':   'Output of channel 0.',
      'NC':   'No connect.',
      'VCC':  'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Quint 2-to-1 Multiplexer',
        paragraphs: [
          'Five separate 2-to-1 channels share one select line, allowing a 5 bit word to be routed from one of two 5 bit sources with a single control signal. Suitable for bus arbitration or path switching in datapath circuits.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEn',  type: 'input'  },
      { pin:  2, name: 'SEL',  type: 'input'  },
      { pin:  3, name: 'A0',   type: 'input'  },
      { pin:  4, name: 'B0',   type: 'input'  },
      { pin:  5, name: 'A1',   type: 'input'  },
      { pin:  6, name: 'B1',   type: 'input'  },
      { pin:  7, name: 'A2',   type: 'input'  },
      { pin:  8, name: 'B2',   type: 'input'  },
      { pin:  9, name: 'A3',   type: 'input'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'B3',   type: 'input'  },
      { pin: 12, name: 'A4',   type: 'input'  },
      { pin: 13, name: 'B4',   type: 'input'  },
      { pin: 14, name: 'Y4',   type: 'output' },
      { pin: 15, name: 'Y3',   type: 'output' },
      { pin: 16, name: 'Y2',   type: 'output' },
      { pin: 17, name: 'Y1',   type: 'output' },
      { pin: 18, name: 'Y0',   type: 'output' },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'MUX_QUINT_2TO1', inputs: ['A0','B0','A1','B1','A2','B2','A3','B3','A4','B4','SEL','OEn'], outputs: ['Y0','Y1','Y2','Y3','Y4'] },
    ],
  },

  // ── 74712: Quint 3-to-1 multiplexer (24-pin) ──────────────────────────────
  // Source: Signetics (Philips), "74F711/711-1, 74F712/712-1 Multiplexers",
  //   Preliminary Specification, in 1989 Signetics FAST Data Manual, pp. 6-674..6-676
  //   (April 26, 1989). [Online]. Available:
  //   http://bitsavers.org/components/signetics/_dataBooks/1989_Signetics_FAST.pdf
  //   Verified: PIN CONFIGURATION (24-pin DIP), FUNCTION TABLE for 'F712, FEATURES
  //   and DESCRIPTION on pages 6-674/6-675/6-676, read as 300-dpi PDF page images
  //   (issues.md C4 — the text summarizer mangles these). Pinout read off the F712
  //   PIN CONFIGURATION diagram, NOT cloned from the 20-pin 74x711 sibling
  //   (issues.md C2). The hand-entered stub pinout this replaces was wrong on
  //   every power/output pin (it put GND=12, VCC=24, outputs scattered 13/17/21/22/23).
  // Behaviour ('F712 only — the 'F711 is the 2-to-1 sibling): five independent
  //   3-to-1 muxes, common select S0/S1, NO output-enable and NO invert control
  //   (those exist only on the 'F711). Outputs are true (non-inverting), not 3-state.
  //   FUNCTION TABLE: Qn = Dna when S1=L,S0=L; Dnb when S1=L,S0=H; Dnc when S1=H
  //   (S0 = don't-care) — S1 dominates, there is no "unused" code.
  // Datasheet self-contradiction: the 'F712 LOGIC DIAGRAM note on p.6-676 reads
  //   "VCC=Pin 20, GND=Pin 10" — those are the 20-pin 'F711 power pins, left on the
  //   F712 drawing by mistake. The 24-pin PIN CONFIGURATION (VCC=19, GND=6, fully
  //   labelled and internally consistent) is authoritative and is what's used here.
  //   See issues.md C58.
  '74x712': {
    name: '74x712',
    simpleName: 'Quint 3-to-1 Mux',
    description: 'Five 3-to-1 multiplexers with common select (24-pin)',
    pins: 24, vcc: 19, gnd: 6,
    datasheet: 'http://bitsavers.org/components/signetics/_dataBooks/1989_Signetics_FAST.pdf',
    tags: ['multiplexer', '3-to-1', 'quint'],
    guideOverview: 'The 74x712 holds five 3-to-1 multiplexers that share one pair of select lines, S0 and S1. Each channel has three data inputs, called a, b and c, and one output Q. The select code picks the same input on all five channels at once, so the chip routes one of three 5-bit words onto a single 5-bit output. It was made for address multiplexing in dynamic RAM, where a row, column and refresh address have to take turns on the same bus. There is no output enable and no invert control; the outputs always follow the selected inputs directly.',
    guidePinDescriptions: {
      'S0':   'Select bit 0, shared by all five channels.',
      'S1':   'Select bit 1, shared by all five channels. S1 takes priority: when S1 is HIGH the c input is chosen no matter what S0 is.',
      'D0a':  'Channel 0, a input.',
      'D0b':  'Channel 0, b input.',
      'D0c':  'Channel 0, c input.',
      'D1a':  'Channel 1, a input.',
      'D1b':  'Channel 1, b input.',
      'D1c':  'Channel 1, c input.',
      'D2a':  'Channel 2, a input.',
      'D2b':  'Channel 2, b input.',
      'D2c':  'Channel 2, c input.',
      'D3a':  'Channel 3, a input.',
      'D3b':  'Channel 3, b input.',
      'D3c':  'Channel 3, c input.',
      'D4a':  'Channel 4, a input.',
      'D4b':  'Channel 4, b input.',
      'D4c':  'Channel 4, c input.',
      'Q0':   'Output of channel 0.',
      'Q1':   'Output of channel 1.',
      'Q2':   'Output of channel 2.',
      'Q3':   'Output of channel 3.',
      'Q4':   'Output of channel 4.',
      'GND':  'Ground reference (pin 6).',
      'VCC':  'Positive supply (+5 V, pin 19).',
    },
    guideSections: [
      {
        title: 'Select Encoding',
        formulas: [
          'S1=0, S0=0 → Q = a input',
          'S1=0, S0=1 → Q = b input',
          'S1=1, S0=x → Q = c input',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'S0',   type: 'input'  },
      { pin:  2, name: 'S1',   type: 'input'  },
      { pin:  3, name: 'Q0',   type: 'output' },
      { pin:  4, name: 'Q1',   type: 'output' },
      { pin:  5, name: 'Q2',   type: 'output' },
      { pin:  6, name: 'GND',  type: 'power'  },
      { pin:  7, name: 'Q3',   type: 'output' },
      { pin:  8, name: 'Q4',   type: 'output' },
      { pin:  9, name: 'D0c',  type: 'input'  },
      { pin: 10, name: 'D1c',  type: 'input'  },
      { pin: 11, name: 'D2c',  type: 'input'  },
      { pin: 12, name: 'D3c',  type: 'input'  },
      { pin: 13, name: 'D4c',  type: 'input'  },
      { pin: 14, name: 'D4b',  type: 'input'  },
      { pin: 15, name: 'D3b',  type: 'input'  },
      { pin: 16, name: 'D2b',  type: 'input'  },
      { pin: 17, name: 'D1b',  type: 'input'  },
      { pin: 18, name: 'D0b',  type: 'input'  },
      { pin: 19, name: 'VCC',  type: 'power'  },
      { pin: 20, name: 'D4a',  type: 'input'  },
      { pin: 21, name: 'D3a',  type: 'input'  },
      { pin: 22, name: 'D2a',  type: 'input'  },
      { pin: 23, name: 'D1a',  type: 'input'  },
      { pin: 24, name: 'D0a',  type: 'input'  },
    ],
    gates: [
      { type: 'MUX_QUINT_3TO1', inputs: ['S0','S1','D0a','D0b','D0c','D1a','D1b','D1c','D2a','D2b','D2c','D3a','D3b','D3c','D4a','D4b','D4c'], outputs: ['Q0','Q1','Q2','Q3','Q4'] },
    ],
  },


  // ── 74715: Video sync generator (20-pin) ──────────────────────────────────
  /* Primary source: 74715 datasheet   URL not yet verified. */
  '74x715': {
    name: '74x715',
    simpleName: 'Video Sync Generator',
    description: 'Video sync generator: HSYNC, VSYNC, BLANK, composite sync out (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: null,
    tags: ['video', 'sync', 'generator', 'stub'],
    guideOverview: 'The 74x715 is a video sync generator that produces standard horizontal sync (HSYNC), vertical sync (VSYNC), blanking (BLANK), and composite sync (CSYNC) signals from a master clock input. Timing configuration inputs allow selection of horizontal and vertical resolution parameters. Used in video display controller designs to provide precise timing signals to CRTs and video DACs.',
    guidePinDescriptions: {
      'CLK':   'Master clock input. Divides down to generate line and frame timing.',
      'RESETn':'Asynchronous reset (active LOW). Resets all internal timing counters.',
      'OEn':   'Output enable (active LOW). Tri states all sync outputs when HIGH.',
      'H0':    'Horizontal timing configuration bit 0.',
      'H1':    'Horizontal timing configuration bit 1.',
      'H2':    'Horizontal timing configuration bit 2.',
      'V0':    'Vertical timing configuration bit 0.',
      'V1':    'Vertical timing configuration bit 1.',
      'V2':    'Vertical timing configuration bit 2.',
      'GND':   'Ground reference (pin 10).',
      'HSYNC': 'Horizontal sync output. Pulses at end of each scan line.',
      'VSYNC': 'Vertical sync output. Pulses at end of each field/frame.',
      'BLANK': 'Blanking output. HIGH during horizontal and vertical retrace intervals.',
      'CSYNC': 'Composite sync output. OR of HSYNC and VSYNC on a single line.',
      'ODDEVEN':'Odd/Even field indicator output for interlaced display modes.',
      'NC1':   'No connect.',
      'NC2':   'No connect.',
      'NC3':   'No connect.',
      'NC4':   'No connect.',
      'VCC':   'Positive supply (+5 V, pin 20).',
    },
    guideSections: [
      {
        title: 'Video Sync Timing',
        paragraphs: [
          'A video sync generator divides a master pixel clock into the horizontal and vertical timing signals required by a CRT monitor or composite video system. HSYNC fires at the end of each horizontal scan line; VSYNC fires at the end of each frame. The BLANK signal masks the display during retrace intervals to prevent visible scan lines on screen.',
        ],
      },
      {
        title: 'Configuration Inputs',
        paragraphs: [
          'H0-H2 and V0-V2 select among preset horizontal and vertical timing parameters, allowing the same chip to generate sync for multiple standard resolutions without external timing components.',
        ],
        note: 'Full sync generation logic is represented as a generic stub in simulation.',
      },
    ],
    pinout: [
      { pin:  1, name: 'CLK',    type: 'input'  },
      { pin:  2, name: 'RESETn', type: 'input'  },
      { pin:  3, name: 'OEn',    type: 'input'  },
      { pin:  4, name: 'H0',     type: 'input'  },
      { pin:  5, name: 'H1',     type: 'input'  },
      { pin:  6, name: 'H2',     type: 'input'  },
      { pin:  7, name: 'V0',     type: 'input'  },
      { pin:  8, name: 'V1',     type: 'input'  },
      { pin:  9, name: 'V2',     type: 'input'  },
      { pin: 10, name: 'GND',    type: 'power'  },
      { pin: 11, name: 'HSYNC',  type: 'output' },
      { pin: 12, name: 'VSYNC',  type: 'output' },
      { pin: 13, name: 'BLANK',  type: 'output' },
      { pin: 14, name: 'CSYNC',  type: 'output' },
      { pin: 15, name: 'ODDEVEN',type: 'output' },
      { pin: 16, name: 'NC1',    type: 'nc'     },
      { pin: 17, name: 'NC2',    type: 'nc'     },
      { pin: 18, name: 'NC3',    type: 'nc'     },
      { pin: 19, name: 'NC4',    type: 'nc'     },
      { pin: 20, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CLK','RESETn','OEn','H0','H1','H2','V0','V1','V2'], outputs: ['HSYNC','VSYNC','BLANK','CSYNC','ODDEVEN'] },
    ],
  },

  // ── 74716: Programmable decade (modulo-10) counter (16-pin) ───────────────
  // 74716 = Motorola MC4016 / MC4316 (a.k.a. 74416), the modulo-10 (decade)
  // member of the MC4016/MC4018 "Programmable Modulo-N Counter" family. The
  // modulo-16 sibling is the 74x418 (MC4018) in chips66.js; both share the same
  // engine primitive and the SAME left-DIP pinout.
  // The original hand-entered stub pinout (CLK=1, CLRn=2, D0-D3=3-6, LOAD=7,
  // ENP=9, QA-QD=10-13, RCO=14, NC=15) was WRONG — it was an invented 74x16x-
  // style map — and was replaced (issues.md C2, the CD4082 lesson). Real
  // terminal map (verified, identical to the 74x418):
  //   Q3=1, D3=2, PE=3, Gate=4, D0=5, Clock=6, Q0=7, Gnd=8, Q1=9, MR=10, D1=11,
  //   Bus=12, R=13, D2=14, Q2=15, VCC=16.
  // Engine: COUNTER_PROG_MODN_4018 (js/specificChipsSim.js) with mod = 10 (the
  // decade modulus; the same primitive runs the mod-16 74x418). The Gate/
  // internal-carry cascade feedback is simplified (Gate modeled as a synchronous
  // parallel-load enable); the brief 3-page datasheet has no Gate truth table.
  // See issues.md.
  //
  // Source: Motorola, "Programmable Modulo-N Counters — MC4316 thru MC4319,
  //   MC4016 thru MC4019," Motorola Semiconductor, 3-page data sheet (1976).
  //   [Online]. Available:
  //   https://datasheet4u.com/datasheets/Motorola/MC4016/500733 . Verified:
  //   terminal/pin assignment (left pinout shared by MC4316/4016 and MC4318/
  //   4018), the PROGRAMMABLE MODULO-N COUNTERS description block (MC4316/4016
  //   divides by any number 0-9; PE enables the parallel data inputs; a logic 0
  //   on MR and PE enters all zeros and stops counting; data independent of the
  //   clock), the MC4316/4016 count table (straight BCD, count 0-9) and the
  //   MC4316/4016 logic diagram (Bus = AND of the Q outputs and R; R pulled to
  //   VCC through ~2.2k; clock ungated) — read as the alldatasheet full-page
  //   PNG scans (921x1188), pages 1-2, per issues.md C4 (not the text summarizer).
  // Source: "List of 7400-series integrated circuits," Wikipedia. [Online].
  //   Available: https://en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits .
  //   Used only to confirm the 74716 ≡ MC4016 decade naming; gave no pinout.
  '74x716': {
    name: '74x716',
    simpleName: 'Decade Counter',
    description: 'Programmable modulo-10 counter, async load/reset, carry, MC4016 (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://datasheet4u.com/datasheets/Motorola/MC4016/500733',
    tags: ['counter', 'decade', 'modulo-10', 'programmable', 'preset', 'load', 'Motorola', 'MC4016'],
    sequential: true,
    guideOverview: 'The 74x716 is a 4-bit decade counter (Motorola MC4016). The four outputs Q0 through Q3 count 0, 1, 2, ... up to 9 in BCD and then roll back to 0. Each clock pulse advances the count by one. When the count reaches 9, the carry output (Bus) goes high; wiring it to the next chip lets you chain counters to count past 9. Two inputs let you set the count instead of just stepping it: master reset (MR), which is active-low and forces the count to 0 the moment it is pulled low, and preset enable (PE), also active-low, which loads whatever value is on the data inputs D0 through D3. Both act immediately, without waiting for a clock edge. Gate loads the data inputs on the next clock edge instead of counting up. Because you can start the count at any value, the chip is handy for divide-by-N dividers, timers, and frequency synthesizers, which is what Motorola built it for.',
    guidePinDescriptions: {
      'Q3':  'Count output, most significant bit.',
      'D3':  'Preset data input for bit 3 (loaded by PE or Gate).',
      'PE':  'Preset enable, active-low. While low, the data inputs D0-D3 are loaded into the counter immediately (no clock needed).',
      'Gate':'Synchronous load enable. While high, the next clock edge loads D0-D3 instead of counting up.',
      'D0':  'Preset data input for bit 0 (loaded by PE or Gate).',
      'Clock':'Count clock. The counter advances on the low-to-high edge.',
      'Q0':  'Count output, least significant bit.',
      'GND': 'Ground (0 V).',
      'Q1':  'Count output, bit 1.',
      'MR':  'Master reset, active-low. While low, the count is held at 0; it overrides preset.',
      'D1':  'Preset data input for bit 1 (loaded by PE or Gate).',
      'Bus': 'Carry output. High when the count reaches 9 (and R is high). Used to cascade counters.',
      'R':   'Carry enable. The Bus carry is gated by this pin; it has an internal pull-up, so leaving it unconnected enables the carry.',
      'D2':  'Preset data input for bit 2 (loaded by PE or Gate).',
      'Q2':  'Count output, bit 2.',
      'VCC': 'Supply voltage (+5 V).',
    },
    guideSections: [
      {
        title: 'Programmable counter',
        paragraphs: [
          'A programmable counter starts from a value you load instead of always from zero, which lets you set how many steps it takes before it rolls over. Load a number with the data inputs, then count up: a decade counter loaded with 7 counts 7, 8, 9 and then wraps, three steps instead of ten.',
          'Feed the carry output (Bus) back to the preset so the counter reloads each time it rolls over and you get a divide-by-N block: one output pulse for every N clock pulses. That is why these parts show up in frequency synthesizers and phase-locked loops.',
        ],
      },
      {
        title: '716 vs 718',
        paragraphs: [
          'The 74x716 counts in BCD (decade, 0-9); the 74x718 counts in 4-bit binary (0-15). Same pinout and same controls; only the count length differs.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Q3',    type: 'output' },
      { pin:  2, name: 'D3',    type: 'input'  },
      { pin:  3, name: 'PE',    type: 'input'  },
      { pin:  4, name: 'Gate',  type: 'input'  },
      { pin:  5, name: 'D0',    type: 'input'  },
      { pin:  6, name: 'Clock', type: 'input'  },
      { pin:  7, name: 'Q0',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'Q1',    type: 'output' },
      { pin: 10, name: 'MR',    type: 'input'  },
      { pin: 11, name: 'D1',    type: 'input'  },
      { pin: 12, name: 'Bus',   type: 'output' },
      { pin: 13, name: 'R',     type: 'input'  },
      { pin: 14, name: 'D2',    type: 'input'  },
      { pin: 15, name: 'Q2',    type: 'output' },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      // inputs:  [Clock, PE(active-low), Gate, MR(active-low), D0, D1, D2, D3, R]
      // outputs: [Q0, Q1, Q2, Q3, Bus]
      { type: 'COUNTER_PROG_MODN_4018', mod: 10,
        inputs: ['Clock','PE','Gate','MR','D0','D1','D2','D3','R'],
        outputs: ['Q0','Q1','Q2','Q3','Bus'] },
    ],
  },

  // ── 74718: Programmable modulo-16 (binary) counter (16-pin) ───────────────
  // 74718 = Motorola MC4018 / MC4318, the modulo-16 (hexadecimal) member of the
  // MC4016/MC4018 "Programmable Modulo-N Counter" family. It is the binary twin
  // of the 74x716 (= MC4016 decade) above and the 74x418 (chips66.js): all three
  // share the SAME primitive and the SAME left-DIP pinout, differing only in the
  // modulus (16 here vs 10 for the 716).
  // The original hand-entered stub (TI 74161-style: CLK=1, CLRn=2, D0-D3=3-6,
  // LOAD=7, ENP=9, QA-QD=10-13, RCO=14, NC=15, with a dead TI sn74ls718.pdf link
  // that 404s) was an INVENTED pinout — TI never made this part. It was replaced
  // with the verified Motorola map (issues.md C2, the CD4082 lesson):
  //   Q3=1, D3=2, PE=3, Gate=4, D0=5, Clock=6, Q0=7, Gnd=8, Q1=9, MR=10, D1=11,
  //   Bus=12, R=13, D2=14, Q2=15, VCC=16.
  // Engine: COUNTER_PROG_MODN_4018 (js/specificChipsSim.js) with mod = 16. The
  // Gate/internal-carry cascade feedback is simplified (Gate modeled as a
  // synchronous parallel-load enable); the brief datasheet has no Gate truth
  // table and shows the clock ungated. See issues.md.
  //
  // Source: Motorola, "SN54LS/74LS716 • SN54LS/74LS718 — Programmable Modulo-N
  //   Counters (Low Power Schottky)," in 1986 Motorola FAST and LS TTL Data,
  //   pp. 5-352..5-353. [Online]. Available:
  //   https://bitsavers.org/components/motorola/_dataBooks/1986_Motorola_FAST_and_LS_TTL.pdf .
  //   Verified: the SN54LS/74LS718 CONNECTION DIAGRAM (DIP, top view) giving the
  //   full 16-pin terminal assignment above; the description block (PE enables
  //   parallel data D0-D3; a logic 0 on MR and PE enters all zeros and stops
  //   counting; data independent of the clock; the 718 divides by any N from
  //   0 thru 15); the SN54LS/74LS718 OUTPUT/COUNT table (straight binary, count
  //   0-15); and the logic diagram (Bus = AND of the Q outputs and R; R pulled to
  //   VCC through 2k; clock ungated) — pages rendered at 200 dpi from the source
  //   PDF and read as page images per issues.md C4, not via a text summarizer.
  // Source: Motorola, "Programmable Modulo-N Counters — MC4316 thru MC4319,
  //   MC4016 thru MC4019," 3-page data sheet (1976). [Online]. Available:
  //   https://datasheet4u.com/datasheets/Motorola/MC4016/500733 . Verified
  //   (corroborating): identical MC4318/4018 pinout, the MC4318/4018 binary
  //   count table (0-15), and the MC4318/4018 logic diagram — full-page PNG
  //   scans, confirming 74718 ≡ MC4018.
  '74x718': {
    name: '74x718',
    simpleName: 'Binary Counter',
    description: 'Programmable modulo-16 counter, async load/reset, carry, MC4018 (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://datasheet4u.com/datasheets/Motorola/MC4016/500733',
    tags: ['counter', 'binary', 'modulo-16', '4 bit', 'programmable', 'preset', 'load', 'Motorola', 'MC4018'],
    sequential: true,
    guideOverview: 'The 74x718 is a 4-bit binary counter (Motorola MC4018). The four outputs Q0 through Q3 count 0, 1, 2, ... up to 15 and then roll back to 0. Each clock pulse advances the count by one. When the count reaches 15, the carry output (Bus) goes high; wiring it to the next chip lets you chain counters to count past 15. Two inputs let you set the count instead of just stepping it: master reset (MR), which is active-low and forces the count to 0 the moment it is pulled low, and preset enable (PE), also active-low, which loads whatever value is on the data inputs D0 through D3. Both act immediately, without waiting for a clock edge. Gate loads the data inputs on the next clock edge instead of counting up. Because you can start the count at any value, the chip is handy for divide-by-N dividers, timers, and frequency synthesizers, which is what Motorola built it for. It is the binary twin of the 74x716, which counts only 0 through 9.',
    guidePinDescriptions: {
      'Q3':  'Count output, most significant bit.',
      'D3':  'Preset data input for bit 3 (loaded by PE or Gate).',
      'PE':  'Preset enable, active-low. While low, the data inputs D0-D3 are loaded into the counter immediately (no clock needed).',
      'Gate':'Synchronous load enable. While high, the next clock edge loads D0-D3 instead of counting up.',
      'D0':  'Preset data input for bit 0 (loaded by PE or Gate).',
      'Clock':'Count clock. The counter advances on the low-to-high edge.',
      'Q0':  'Count output, least significant bit.',
      'GND': 'Ground (0 V).',
      'Q1':  'Count output, bit 1.',
      'MR':  'Master reset, active-low. While low, the count is held at 0; it overrides preset.',
      'D1':  'Preset data input for bit 1 (loaded by PE or Gate).',
      'Bus': 'Carry output. High when the count reaches 15 (and R is high). Used to cascade counters.',
      'R':   'Carry enable. The Bus carry is gated by this pin; it has an internal pull-up, so leaving it unconnected enables the carry.',
      'D2':  'Preset data input for bit 2 (loaded by PE or Gate).',
      'Q2':  'Count output, bit 2.',
      'VCC': 'Supply voltage (+5 V).',
    },
    guideSections: [
      {
        title: 'Programmable counter',
        paragraphs: [
          'A programmable counter starts from a value you load instead of always from zero, which lets you set how many steps it takes before it rolls over. Load a number with the data inputs, then count up: a binary counter loaded with 12 counts 12, 13, 14, 15 and then wraps, four steps instead of sixteen.',
          'Feed the carry output (Bus) back to the preset so the counter reloads each time it rolls over and you get a divide-by-N block: one output pulse for every N clock pulses. That is why these parts show up in frequency synthesizers and phase-locked loops.',
        ],
      },
      {
        title: '716 vs 718',
        paragraphs: [
          'The 74x716 counts in BCD (decade, 0-9); the 74x718 counts in 4-bit binary (0-15). Same pinout and same controls; only the count length differs.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'Q3',    type: 'output' },
      { pin:  2, name: 'D3',    type: 'input'  },
      { pin:  3, name: 'PE',    type: 'input'  },
      { pin:  4, name: 'Gate',  type: 'input'  },
      { pin:  5, name: 'D0',    type: 'input'  },
      { pin:  6, name: 'Clock', type: 'input'  },
      { pin:  7, name: 'Q0',    type: 'output' },
      { pin:  8, name: 'GND',   type: 'power'  },
      { pin:  9, name: 'Q1',    type: 'output' },
      { pin: 10, name: 'MR',    type: 'input'  },
      { pin: 11, name: 'D1',    type: 'input'  },
      { pin: 12, name: 'Bus',   type: 'output' },
      { pin: 13, name: 'R',     type: 'input'  },
      { pin: 14, name: 'D2',    type: 'input'  },
      { pin: 15, name: 'Q2',    type: 'output' },
      { pin: 16, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      // inputs:  [Clock, PE(active-low), Gate, MR(active-low), D0, D1, D2, D3, R]
      // outputs: [Q0, Q1, Q2, Q3, Bus]
      { type: 'COUNTER_PROG_MODN_4018', mod: 16,
        inputs: ['Clock','PE','Gate','MR','D0','D1','D2','D3','R'],
        outputs: ['Q0','Q1','Q2','Q3','Bus'] },
    ],
  },
};