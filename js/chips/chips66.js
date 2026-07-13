// chips66.js Block 66: 74406 .. 74934 (10 chips, all stubs)
// SKIP: 74131 (key conflict with 74AS131 in chips11.js),
//        74416 (key conflict with 74S416 in chips25.js),
//        74424 (key conflict with 74x424 in chips25.js)
// ALL STUBS obscure Motorola MC74xxx parts with unverified pinouts

export const CHIPS_BLOCK_66 = {

  // ── 74406: 3 to 8 line decoder (14-pin) ────────────────────────────────
  // LEFT AS STUB (deliberate, per effort policy). A 3-to-8 decode is a trivial
  // digital function, but this specific part number is undocumented: no
  // datasheet exists for "74406" / "MC74406" / "74F406" / "74HC406" as a
  // 3-to-8 decoder from any manufacturer. Searched the open web and parts
  // archives (alldatasheet, datasheetarchive, bitsavers Motorola databooks) —
  // "74406" only collides with unrelated parts (NXP 744060 14-stage ripple
  // counter; Würth power inductors). The ONLY source for the function is the
  // Wikipedia 7400-series list, which gives one line ("3-to-8 line decoder",
  // 14 pins) with no manufacturer, no pinout, and no output/enable polarity.
  // Without a datasheet I cannot establish the pin assignments OR even whether
  // outputs are active-HIGH or active-LOW and the enable active-HIGH or -LOW —
  // exactly the behavior that distinguishes the real standard parts (74138
  // active-LOW vs 74238 active-HIGH). The pinout below is the original hand-
  // entered best-guess and is NOT verified. Implementing it would require
  // fabricating both the pinout and the polarity with zero traceable citation,
  // which violates this project's verify-the-pinout discipline (issues.md C2,
  // the CD4082 lesson). So it stays GENERIC_STUB + 'stub'. See issues.md.
  //
  // Sources consulted (none usable to verify pinout/behavior):
  //   "List of 7400-series integrated circuits," Wikipedia. [Online].
  //     Available: https://en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits.
  //     Verified: row reads only "3-to-8 line decoder, 14 pins" — no pinout,
  //     no polarity, no manufacturer/datasheet reference.
  //   alldatasheet.com part search "74406" — no 3-to-8 decoder match (returns
  //     NXP 744060 ripple counter + Würth inductors only).
  '74x406': {
    name: '74x406',
    simpleName: '3 to 8 Decoder',
    description: '3 to 8 line decoder (MC74406, Motorola unverified pinout) (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['decoder', '3 to 8', 'Motorola', 'stub'],
    guideOverview: 'The 74x406 is a 3 to 8 line decoder (Motorola MC74406, pinout unverified). Three address inputs (A0-A2) select one of eight outputs, which goes active when the enable input is asserted. On a breadboard a 3 to 8 decoder is useful for memory address decoding, control signal routing, and any application that needs to activate exactly one of eight loads from a 3 bit binary code. The simulator currently represents this as a generic stub.',
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

  // ── 74408 (Motorola MC4008): 8-bit parity tree (14-pin) ────────────────
  // The repo's old stub guessed "MC74408"; the real Motorola part is the MC4008
  // (MTTL MC4300/4000 complex-function series), an 8-bit XNOR (equivalence)
  // parity tree plus one spare 2-input XNOR gate for cascading/inversion.
  // Source: Motorola, "MTTL Integrated Circuits Data Book", 1971 (3rd ed.).
  //   [Online]. Available: https://archive.org/details/bitsavers_motoroladaTTLIntegratedCircuitsDataBook_38442857
  //   Verified: logic-diagram pin/function listing in the "LOGIC DIAGRAMS —
  //   PARITY TREES" page and the MC4308/MC4008 device spec, read from the
  //   archive.org book text. Function table (positive logic):
  //     Pin 8 = 1 ⊕ 2 ⊕ 3 ⊕ 9 ⊕ 10 ⊕ 11 ⊕ 12 ⊕ 13   (the eight data inputs)
  //     Pin 6 = 4 ⊕ 5                                   (spare XNOR gate)
  //     where X ⊕ Y = X·Y + X̄·Ȳ  (equivalence / XNOR, HIGH when inputs match).
  //   So VCC = pin 14, GND = pin 7; the eight data inputs are pins
  //   1,2,3,9,10,11,12,13 (NOT pins 4/5 as the old stub assumed) and the two
  //   outputs are pins 6 and 8. The XNOR tree on pin 8 reads HIGH when an EVEN
  //   number of the eight data inputs are HIGH. Wiring the spare gate as
  //   GA = pin-8 output, GB = LOW makes GY = NOT(pin 8) — an ODD-parity output —
  //   and is also how two MC4008s + an MC4010 build a 20-bit parity tree
  //   (datasheet Fig. 5). Mapped to the engine's generic multi-input XNOR
  //   primitive (one gate per output); no new primitive needed.
  '74x408': {
    name: '74x408',
    simpleName: '8 bit Parity Tree',
    description: '8 bit parity tree with spare XNOR gate (Motorola MC4008) (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://archive.org/details/bitsavers_motoroladaTTLIntegratedCircuitsDataBook_38442857',
    tags: ['parity', '8 bit', 'XNOR', 'Motorola', 'MC4008'],
    guideOverview: 'The 74x408 (Motorola MC4008) is an 8 bit parity tree. It takes eight data inputs (D0-D7) and drives one output, EVEN, that is HIGH when an even number of those inputs are HIGH and LOW when an odd number are HIGH. Internally it is a tree of XNOR gates, which is why the output reads even parity directly. The package also holds one spare 2 input XNOR gate (GA, GB, GY) that is not connected to the tree. To get an odd parity output, feed EVEN into GA and tie GB LOW; GY then carries the inverse. The spare gate also lets you chain trees: two of these plus a dual 4 bit tree build a 20 bit parity generator. On a breadboard a parity tree is the standard building block for detecting single bit errors in byte wide data.',
    guidePinDescriptions: {
      D0:   'Data input, bit 0 (pin 1). One of the eight inputs feeding the parity tree.',
      D1:   'Data input, bit 1 (pin 2).',
      D2:   'Data input, bit 2 (pin 3).',
      D3:   'Data input, bit 3 (pin 9).',
      D4:   'Data input, bit 4 (pin 10).',
      D5:   'Data input, bit 5 (pin 11).',
      D6:   'Data input, bit 6 (pin 12).',
      D7:   'Data input, bit 7 (pin 13).',
      EVEN: 'Parity output (pin 8). HIGH when an even number of D0-D7 are HIGH, LOW when an odd number are HIGH.',
      GA:   'Spare XNOR gate input A (pin 4). Not connected to the tree.',
      GB:   'Spare XNOR gate input B (pin 5).',
      GY:   'Spare XNOR gate output (pin 6). HIGH when GA equals GB. Wire EVEN to GA and GB LOW to make an odd parity output.',
      GND:  'Ground, 0 V (pin 7).',
      VCC:  'Positive supply, +5 V (pin 14).',
    },
    pinout: [
      { pin:  1, name: 'D0',   type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'GA',   type: 'input'  },
      { pin:  5, name: 'GB',   type: 'input'  },
      { pin:  6, name: 'GY',   type: 'output' },
      { pin:  7, name: 'GND',  type: 'power'  },
      { pin:  8, name: 'EVEN', type: 'output' },
      { pin:  9, name: 'D3',   type: 'input'  },
      { pin: 10, name: 'D4',   type: 'input'  },
      { pin: 11, name: 'D5',   type: 'input'  },
      { pin: 12, name: 'D6',   type: 'input'  },
      { pin: 13, name: 'D7',   type: 'input'  },
      { pin: 14, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'XNOR', inputs: ['D0','D1','D2','D3','D4','D5','D6','D7'], output: 'EVEN' },
      { type: 'XNOR', inputs: ['GA','GB'], output: 'GY' },
    ],
    guideSections: [
      {
        title: 'How the parity tree works',
        paragraphs: [
          'An XNOR gate outputs HIGH when its two inputs are the same. Chain XNORs into a tree across eight inputs and the final output is HIGH whenever an even number of those inputs are HIGH. That is exactly even parity, read straight off the pin.',
          'The spare 2 input XNOR gate is independent of the tree. Tie one of its inputs LOW and it acts as an inverter, which turns the even parity output into an odd parity output. With both inputs free it is just an extra equality gate you can use to splice two trees together for wider words.',
        ],
        list: [
          'Even parity output: read EVEN directly. HIGH means an even count of HIGH data bits.',
          'Odd parity output: EVEN to GA, GB to LOW, read GY.',
          'Wider words: cascade the EVEN outputs of several trees through more XNOR stages.',
        ],
      },
    ],
  },

  // ── 74418: Programmable modulo-16 (hexadecimal) counter (16-pin) ───────
  // 74418 = Motorola MC4018 / MC4318 (bare-die MCC4018), the modulo-16 member
  // of the MC4016/MC4018 "Programmable Modulo-N Counter" family. Identity and
  // pinout verified against the datasheet below. The original hand-entered
  // pinout (CLK=1, PL=2, CLR=3, P0-P3=4-7, Q0-Q3=9-12, CO=13, NC 14/15) was
  // WRONG and was replaced (issues.md C2, the CD4082 lesson). Real terminal map:
  //   Q3=1, D3=2, PE=3, Gate=4, D0=5, Clock=6, Q0=7, Gnd=8, Q1=9, MR=10, D1=11,
  //   Bus=12, R=13, D2=14, Q2=15, VCC=16.
  // Engine: COUNTER_PROG_MODN_4018 (js/specificChipsSim.js). The Gate/internal-
  // carry cascade feedback is simplified (Gate modeled as a synchronous parallel
  // load enable); the brief 3-page datasheet has no Gate truth table. See
  // issues.md.
  //
  // Source: Motorola, "Programmable Modulo-N Counters — MC4316 thru MC4319,
  //   MC4016 thru MC4019," Motorola Semiconductor, 3-page data sheet (1976).
  //   [Online]. Available:
  //   https://datasheet4u.com/datasheets/Motorola/MC4016/500733 . Verified:
  //   terminal/pin assignment (left pinout shared by MC4316/4016 and MC4318/
  //   4018), the PROGRAMMABLE MODULO-N COUNTERS description block (PE enables the
  //   parallel data inputs; a logic 0 on MR and PE enters all zeros and stops
  //   counting; data independent of the clock), the MC4318/4018 count table
  //   (straight binary, mod-16) and the MC4318/4018 logic diagram (Bus = AND of
  //   Q0..Q3 and R; R pulled to VCC through ~2.2k; clock ungated) — read as
  //   upscaled PDF page images (datasheet4u 499x641 scans cropped and LANCZOS-
  //   magnified, per issues.md C4).
  // Source: "1976 Motorola Semiconductor Data Library, Vol. 8 Chips," selection
  //   guide. [Online]. Available: https://archive.org/details/
  //   bitsavers_motoroladauctorDataLibraryVol8Chips_17508458 . Verified: the
  //   identity 74418 ≡ MCC4018 ≡ MC4018/MC4318 "Programmable Modulo-N
  //   Hexadecimal Counter" (and 74416=MC4016 decade, 74417=MC4017, 74419=MC4019).
  // Source: "List of 7400-series integrated circuits," Wikipedia. [Online].
  //   Available: https://en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits .
  //   Used only to confirm the 74416-74419 family naming; gave no pinout.
  '74x418': {
    name: '74x418',
    simpleName: 'Mod-16 Counter',
    description: 'Programmable modulo-16 counter, async load, carry out (MC4018) (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://datasheet4u.com/datasheets/Motorola/MC4016/500733',
    tags: ['counter', 'modulo-16', 'hexadecimal', 'preset', 'load', 'Motorola', 'MC4018'],
    sequential: true,
    guideOverview: 'The 74x418 is a 4-bit binary counter (Motorola MC4018). The four outputs Q0 through Q3 count 0, 1, 2, ... up to 15 and then roll back to 0. Each clock pulse advances the count by one. When the count reaches 15, the carry output (Bus) goes high; wiring it to the next chip lets you chain counters to count past 15. Two inputs let you set the count instead of just stepping it: master reset (MR), which is active-low and forces the count to 0 the moment it is pulled low, and preset enable (PE), also active-low, which loads whatever value is on the data inputs D0 through D3. Both act immediately, without waiting for a clock edge. Gate loads the data inputs on the next clock edge instead of counting up. Because you can start the count at any value, the chip is handy for divide-by-N dividers, timers, and frequency synthesizers, which is what Motorola built it for.',
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

  // ── 74419: Dual modulo 4 counters, shared preload/clear (16-pin) ──────
  // LEFT AS STUB (GENERIC_STUB): the digital function is simple, but no
  // datasheet with a verifiable PINOUT could be found, so the physical pin
  // assignments below cannot be trusted (C2 / CD4082 lesson: never ship a
  // hand-entered pinout). Modelling behaviour onto unverified pins would
  // produce a chip that looks verified but is fiction.
  //
  // Source: Wikipedia, "List of 7400-series integrated circuits."
  //   [Online]. Available:
  //   https://en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits.
  //   Verified 2026-06-29: confirms ONLY function + pin count — "dual modulo 4
  //   counters, shared preload and clear inputs," 16 pins. No pinout, no
  //   manufacturer, no datasheet link.
  // Searched without success (2026-06-29): datasheetarchive.com (only hit for
  //   "74419" is a Wiha screwdriver bit), bitsavers.org, alldatasheet.com,
  //   datasheetq.com, archive.org Signetics cross-reference. The "MC74419
  //   Motorola" attribution carried by the original stub is itself unverified
  //   and could not be corroborated anywhere.
  '74x419': {
    name: '74x419',
    simpleName: 'Dual Mod-4 Counter',
    description: 'Dual modulo 4 counters with shared preload and clear inputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['counter', 'dual', 'modulo-4', 'preload', 'clear', 'stub'],
    sequential: true,
    guideOverview: 'The 74x419 is a dual modulo-4 counter with shared preload and clear controls. Two independent 2 bit counters occupy one 16-pin package; each has its own clock and carry output, but they share common preload and clear signals. This makes it a compact way to get two small counters that can be reset or loaded together. It is an obscure, long-obsolete part: the simulator lists it for reference but does not yet model its behavior, because a datasheet with a confirmed pinout could not be found.',
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
  '74x934': {
    name: '74x934',
    simpleName: 'ADC (ADC0829-like)',
    description: 'Analog to digital converter like ADC0829 (NSC unverified pinout) (28-pin)',
    pins: 28, vcc: 28, gnd: 14,
    datasheet: '',
    tags: ['ADC', 'analog', 'converter', 'NSC', 'stub'],
    guideOverview: 'The 74x934 is an analog to digital converter similar in organization to the ADC0829 (National Semiconductor, pinout unverified). Eight analog input channels are selected by address bits A0-A2, and a conversion produces an 8 bit digital result on D0-D7. The conversion cycle is controlled by chip select, write, and read strobes, with an interrupt output (INT) signaling completion. On a breadboard it provides a straightforward way to digitize analog signals from eight sources and read the results over a byte wide data bus. The simulator currently represents this as a generic stub.',
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
