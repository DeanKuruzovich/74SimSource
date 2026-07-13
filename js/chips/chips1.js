// Chip definitions block 1
// Auto-generated from chips.js

export const CHIPS_BLOCK_1 = {
  // ── 7400: Quad 2 input NAND ──────────────────────────────────────────────
  /* Primary source: Texas Instruments, "SNx400, SNx4LS00, and SNx4S00 Quadruple
     2-Input Positive-NAND Gates," SDLS025D (Dec. 1983, rev. May 2017). [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls00.pdf. Verified: standard-DIP
     terminal assignment (CDIP/CFP/SOIC/PDIP/SO/SSOP, top view) + Pin Functions table
     + per-gate function Y = NOT(A·B) = A̅ + B̅ (positive logic) on pages 1 and 3, and
     tPLH/tPHL switching characteristics on page 7 ('00 tPLH 11 ns / tPHL 7 ns typ;
     'LS00 9 ns / 10 ns typ; 'S00 ~3 ns typ) -- all read as rendered 300-dpi PDF page
     images (issues.md C4). Pinout[] and the four NAND gates[] confirmed against this;
     engine left unchanged.
     NOTE on the A/B input labels (issues.md C112): SDLS025D prints the symmetric gate
     inputs as 3A=10/3B=9 and 4A=13/4B=12, whereas TI's own '03 (SDLS028) and '132
     (SDLS047) datasheets print the reverse, 3A=9/3B=10 and 4A=12/4B=13. 74Sim uses that
     second order consistently across all its 2-input gate chips (74x08/74x32/74x86), so
     it is kept here too. NAND is commutative and both pins feed the same gate, so the
     label choice has no effect on wiring or simulation -- every input, output, and power
     pin is on its correct pin number either way.
     Universal (functionally-complete) gate claim: M. M. Mano and C. R. Kime, Logic and
     Computer Design Fundamentals, 3rd ed. Prentice Hall, 2004, p. 73.
     Open-collector sibling (contrast only, for the "tie outputs" gotcha): Texas
     Instruments, "SN5403, SN54LS03, SN54S03, SN7403, SN74LS03, SN74S03 Quadruple 2-Input
     Positive-NAND Gates With Open-Collector Outputs," SDLS028 (Dec. 1983, rev. Mar. 1988).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls03.pdf. Verified page 1
     (PDF image): identical 14-pin map, output stage is open-collector (needs a pull-up),
     may be tied for active-low wired-OR / active-high wired-AND. Trusted for the "use the
     74x03 to wire outputs together" contrast.
     Schmitt-trigger sibling (contrast only, for the "slow/noisy edges" gotcha): Texas
     Instruments, "SN54132, SN54LS132, SN54S132, SN74132, SN74LS132, SN74S132 Quadruple
     2-Input Positive-NAND Schmitt Triggers," SDLS047 (Dec. 1983, rev. Mar. 1988). [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls132.pdf. Verified page 1 (PDF
     image): same NAND function but two input thresholds (VT+/VT-) for clean, jitter-free
     output from very slow input ramps. Trusted for the "use a 74x132 for slow/noisy edges
     or oscillators" gotcha.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x00': {
    name: '74x00',
    simpleName: 'Quad NAND',
    description: 'Four independent 2 input NAND gates. (14-pin)',
    guideOverview: 'The 74x00 packs four independent 2 input NAND gates into one 14-pin chip. A NAND gate is an AND gate with its output inverted: it goes LOW only when both inputs are HIGH, and stays HIGH for every other case. This is the lowest part number in the 74 series and one of the most-used logic chips ever made, for one reason: NAND is a universal gate. You can build NOT, AND, OR, NOR, and any other logic function out of NAND gates alone, so a single 74x00 often stands in for gates you are missing and is the natural grab when you are one gate short on a breadboard. Two cross-coupled gates from this chip also make an SR latch, the simplest 1-bit memory. Its pins follow the plain order shared by the 74x08 AND and 74x32 OR (two inputs then an output for each gate), not the shuffled order the 74x02 NOR uses. Two specifics are worth knowing: the outputs are ordinary push-pull, so you cannot wire two of them together, use the open-collector 74x03 with a pull-up resistor when you need that; and a plain 74x00 switches at a single threshold with no hysteresis, so for slow or noisy inputs, or for building an oscillator, the Schmitt-trigger 74x132 is the better NAND.',
    guidePinDescriptions: {
      '1A': 'Input A of NAND gate 1.',
      '1B': 'Input B of NAND gate 1.',
      '1Y': 'Output of gate 1. LOW only when both 1A and 1B are HIGH.',
      '2A': 'Input A of NAND gate 2.',
      '2B': 'Input B of NAND gate 2.',
      '2Y': 'Output of gate 2. LOW only when both 2A and 2B are HIGH.',
      'GND': 'Ground reference (pin 7).',
      '3Y': 'Output of gate 3. LOW only when both 3A and 3B are HIGH.',
      '3A': 'Input A of NAND gate 3.',
      '3B': 'Input B of NAND gate 3.',
      '4Y': 'Output of gate 4. LOW only when both 4A and 4B are HIGH.',
      '4A': 'Input A of NAND gate 4.',
      '4B': 'Input B of NAND gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls00.pdf',
    tags: ['nand', 'gate', 'logic', 'quad'],
    guideSections: [
      {
        title: 'NAND Gate Logic',
        paragraphs: [
          'A NAND gate is an AND gate followed by an inverter (NAND is short for NOT-AND). Its output is LOW only when both inputs are HIGH; for every other combination the output is HIGH. With two inputs that is exactly one LOW row in the table below, out of four.',
          'The four gates are completely independent. They share only the power pins (VCC and GND), so you can use one, two, or all four in unrelated parts of a circuit.',
        ],
        formulas: [
          'Y = NOT(A AND B)',
          'A=0,B=0 → Y=1 | A=0,B=1 → Y=1 | A=1,B=0 → Y=1 | A=1,B=1 → Y=0',
        ],
      },
      {
        title: 'The Universal Gate',
        paragraphs: [
          'NAND is functionally complete: any logic function can be built from NAND gates alone. That is what makes the 74x00 so useful, one chip can stand in for a NOT, AND, OR, or NOR package you do not have on hand.',
          'The building blocks are short. Tie a gate\'s two inputs together (or hold one HIGH) and it becomes an inverter. Follow that inverter with a second NAND and you get AND. By De Morgan\'s law, feeding two inverted inputs into a NAND gives OR. Chain these and you can reach any Boolean expression, which is why early computers were built almost entirely from NAND (and NOR) gates.',
        ],
        formulas: [
          'NOT A  = A NAND A',
          'A AND B = NOT(A NAND B)',
          'A OR B  = (NOT A) NAND (NOT B)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Inverter: tie a gate\'s two inputs together (or hold one HIGH) so it simply flips the remaining input, a spare NAND becomes a NOT gate.',
          'SR latch: cross-couple two gates (each gate\'s output drives one input of the other) to store a single bit. The two free inputs are the active-LOW Set and Reset lines.',
          'Standing in for a missing gate: build the AND, OR, or NOR you are short of from spare NAND gates instead of adding another package.',
          'Glue logic: combine a couple of control or chip-select lines into one signal, the everyday job of bridging larger chips.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Do not leave inputs floating. On bipolar TTL a floating input tends to read HIGH but is noise-sensitive, so tie every unused input to a defined level. For a gate you are not using at all, tie both its inputs HIGH or LOW so its output sits at a known state.',
          'The outputs are push-pull (totem-pole), not open-collector. Do not wire two 74x00 outputs together, that fights the two output drivers and can overheat the chip. When you need to tie outputs (wired-AND), use the open-collector 74x03 with a pull-up resistor.',
          'A plain 74x00 has no hysteresis, it switches at a single threshold, so a slow or noisy input can make the output chatter as it crosses. For slow edges, noisy lines, or building an oscillator, use the Schmitt-trigger 74x132 instead.',
          'Need more than two inputs per gate? The 74x10 is a triple 3-input NAND and the 74x20 a dual 4-input NAND, same logic, wider gates.',
        ],
        note: 'Real gates are not instant. A change takes a short time to travel from input to output, roughly 7 to 11 ns on the original bipolar 74x00, about 9 to 10 ns on the common 74LS00, and around 3 ns on the fast 74S00. The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '1Y', type: 'output' },
      { pin: 4, name: '2A', type: 'input' },
      { pin: 5, name: '2B', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '4Y', type: 'output' },
      { pin: 12, name: '4A', type: 'input' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7402: Quad 2 input NOR ───────────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN5402, SN54LS02, SN54S02, SN7402,
     SN74LS02, SN74S02 Quadruple 2-Input Positive-NOR Gates," SDLS027 (Dec. 1983,
     rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls02.pdf. Verified: standard-DIP terminal
     assignment (D/J/N package, top view) + Function Table (each gate: A=H -> Y=L,
     B=H -> Y=L, A=L B=L -> Y=H) + positive-logic logic diagram Y = A̅·B̅ = NOT(A+B)
     on page 1, and tPLH/tPHL switching characteristics on pages 3-5 ('02 tPLH 12 ns /
     tPHL 8 ns typ; 'LS02 10 ns / 10 ns typ; 'S02 ~3.5 ns typ) -- all read as rendered
     300-dpi PDF page images (issues.md C4). Pinout[] (outputs 1Y=1, 2Y=4, 3Y=10,
     4Y=13; inputs 1A=2/1B=3, 2A=5/2B=6, 3A=8/3B=9, 4A=11/4B=12; GND=7, VCC=14) and
     the four NOR gates[] confirmed against this; engine left unchanged.
     NOTE: the ceramic "W package" (flat pack) shown on page 1 uses a DIFFERENT
     pinout (VCC=4, GND=11); 74Sim models the standard DIP, so that variant is
     intentionally not used (same situation as the 74x04 W package).
     Universal (functionally-complete) gate claim: M. M. Mano and C. R. Kime, Logic
     and Computer Design Fundamentals, 3rd ed. Prentice Hall, 2004, p. 73.
     SR (NOR) latch behavior (active-HIGH S/R, forbidden S=R=1 state): Wikipedia
     contributors, "Flip-flop (electronics)," SR NOR latch section. [Online].
     Available: https://en.wikipedia.org/wiki/Flip-flop_(electronics)#SR_NOR_latch.
     "Whole computer from one NOR gate" teaching hook (Apollo Guidance Computer built
     almost entirely from a single 3-input NOR gate, ~5600 of them): Wikipedia
     contributors, "Apollo Guidance Computer." [Online]. Available:
     https://en.wikipedia.org/wiki/Apollo_Guidance_Computer. Used only as an
     illustration of NOR's functional completeness; not a claim about the 2-input 7402.
     Open-collector sibling (contrast only, for the "tie outputs" gotcha): Texas
     Instruments, "SN5433, SN54LS33, SN7433, SN74LS33 Quadruple 2-Input Positive-NOR
     Buffers With Open-Collector Outputs," SDLS101 (Dec. 1983, rev. Mar. 1988).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls33.pdf. Verified
     page 1 (PDF image): identical 14-pin NOR terminal map, output stage is
     open-collector (needs a pull-up), commonly tied for wired-AND. Trusted for the
     "use the 74x33 to wire NOR outputs together" contrast.
     Wider-NOR sibling (contrast only, for the "need more inputs" note): Texas
     Instruments, "SN5427, SN54LS27, SN7427, SN74LS27 Triple 3-Input Positive-NOR
     Gates," SDLS089 (Dec. 1983, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls27.pdf. Verified page 1 (PDF image):
     three independent 3-input NOR gates (Y HIGH only when A, B, C are all LOW).
     Trusted for the "74x27 is a 3-input NOR" note.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x02': {
    name: '74x02',
    simpleName: 'Quad NOR',
    description: 'Four independent 2 input NOR gates. (14-pin)',
    guideOverview: 'The 74x02 packs four independent 2 input NOR gates into one 14-pin chip. A NOR gate is an OR gate with its output inverted: it goes HIGH only when both inputs are LOW, and drops LOW the moment either input goes HIGH. Like NAND, NOR is a universal gate, you can build NOT, AND, OR, and any other logic function out of NOR gates alone, so a single 74x02 can stand in for gates you are missing. Two cross-coupled NOR gates from this chip make the textbook SR latch, the simplest 1-bit memory, with active-HIGH Set and Reset. The one thing to watch is the pinout. Unlike the 74x00 NAND, 74x08 AND, and 74x32 OR, which all put each gate\'s two inputs first and its output last, the 74x02 shuffles that order and its outputs land on pins 1, 4, 10, and 13. Dropping a 74x02 into wiring meant for a 74x00 is a classic mistake, so trace each gate before you build. Two more specifics: the outputs are ordinary push-pull, so you cannot wire two of them together, use the open-collector 74x33 with a pull-up resistor when you need that; and if you need a NOR with more than two inputs, the 74x27 is a triple 3-input NOR.',
    guidePinDescriptions: {
      '1Y': 'Output of gate 1. HIGH only when both 1A and 1B are LOW.',
      '1A': 'Input A of NOR gate 1.',
      '1B': 'Input B of NOR gate 1.',
      '2Y': 'Output of gate 2. HIGH only when both 2A and 2B are LOW.',
      '2A': 'Input A of NOR gate 2.',
      '2B': 'Input B of NOR gate 2.',
      'GND': 'Ground reference for all four gates (pin 7).',
      '3A': 'Input A of NOR gate 3.',
      '3B': 'Input B of NOR gate 3.',
      '3Y': 'Output of gate 3. HIGH only when both 3A and 3B are LOW.',
      '4A': 'Input A of NOR gate 4.',
      '4B': 'Input B of NOR gate 4.',
      '4Y': 'Output of gate 4. HIGH only when both 4A and 4B are LOW.',
      'VCC': 'Positive supply (+5 V) for all four gates, at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls02.pdf',
    tags: ['nor', 'gate', 'logic', 'quad'],
    guideSections: [
      {
        title: 'NOR Gate Logic',
        paragraphs: [
          'A NOR gate is an OR gate followed by an inverter (NOR is short for NOT-OR). Its output is HIGH only when both inputs are LOW; the moment either input goes HIGH, the output goes LOW. With two inputs that is exactly one HIGH row in the table below, out of four.',
          'The four gates are completely independent. They share only the power pins (VCC and GND), so you can use one, two, or all four in unrelated parts of a circuit.',
        ],
        formulas: [
          'Y = NOT(A OR B)',
          'A=0,B=0 → Y=1 | A=0,B=1 → Y=0 | A=1,B=0 → Y=0 | A=1,B=1 → Y=0',
        ],
      },
      {
        title: 'The Universal Gate',
        paragraphs: [
          'NOR is functionally complete: any logic function can be built from NOR gates alone, just like the 74x00 NAND. That is what makes the 74x02 handy, one chip can stand in for a NOT, OR, or AND package you do not have on hand.',
          'The building blocks are short. Tie a gate\'s two inputs together (or hold one input LOW) and it becomes an inverter. Follow that inverter with a second NOR and you get OR. By De Morgan\'s law, feeding two inverted inputs into a NOR gives AND. Chain these and you can reach any Boolean expression, which is why NOR (like NAND) can build a whole computer, the Apollo Guidance Computer that flew to the Moon was built almost entirely from a single type of 3-input NOR gate.',
        ],
        formulas: [
          'NOT A  = A NOR A',
          'A OR B  = NOT(A NOR B)',
          'A AND B = (NOT A) NOR (NOT B)',
        ],
      },
      {
        title: 'Reading the Pinout',
        paragraphs: [
          'The 74x02 is the odd one out among the 2-input quad gate chips. The 74x00 NAND, 74x08 AND, and 74x32 OR all lay each gate out the same way, two input pins then an output pin, so their outputs fall on pins 3, 6, 8, and 11. The 74x02 does not. On the standard DIP (top view) the left side runs output, input, input for the first two gates: 1Y, 1A, 1B, 2Y, 2A, 2B, down to GND on pin 7. The right side switches back to input, input, output: 3A, 3B, 3Y, 4A, 4B, 4Y, up to VCC on pin 14. The four outputs end up on pins 1, 4, 10, and 13.',
          'The practical upshot: you cannot swap a 74x02 into a socket wired for a 74x00 (or the other way around) and expect it to work, the output pins are in different places. Trace each gate\'s A/B inputs and Y output before you build.',
        ],
      },
      {
        title: 'SR Latch from NOR Gates',
        paragraphs: [
          'Cross-couple two gates: connect gate 1\'s output to an input of gate 2, and gate 2\'s output back to an input of gate 1. The two free inputs become S (Set) and R (Reset), and the two outputs hold opposite values, call them Q and Q-not. This is the textbook SR latch, the simplest form of 1-bit memory.',
          'A brief HIGH pulse on S forces Q HIGH; a brief HIGH pulse on R forces Q LOW. When both S and R are LOW, the latch holds whatever it was last set to, that held value is the stored bit. The NOR latch is active-HIGH (you pulse a HIGH to set or reset); the NAND latch built from a 74x00 is the active-LOW mirror image.',
        ],
        note: 'S and R both HIGH at once is the forbidden state: it forces both outputs LOW, so they are no longer complements. If S and R then go LOW together, the final state is unpredictable (a race). Keep at most one of S, R HIGH at a time.',
      },
      {
        title: 'Common Uses',
        list: [
          'SR latch: cross-couple two gates to store a single bit, with active-HIGH Set and Reset lines. This is the classic way to debounce a mechanical switch or build a simple set/reset control.',
          'Inverter: tie a gate\'s two inputs together (or hold one input LOW) so it simply flips the remaining input, a spare NOR becomes a NOT gate.',
          '"All-quiet" detector: because the output is HIGH only when every input is LOW, a NOR gate naturally signals "none of these lines is active" for active-HIGH signals.',
          'Standing in for a missing gate: build the OR, AND, or NOT you are short of from spare NOR gates instead of adding another package.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'The pinout is the number-one 74x02 mistake. Its outputs are on pins 1, 4, 10, and 13, not on 3, 6, 8, 11 like the 74x00/74x08/74x32. Do not assume a "quad 2-input gate" always has the same layout, check this one.',
          'Do not leave inputs floating. On bipolar TTL a floating input tends to read HIGH but is noise-sensitive, so tie every unused input to a defined level. For a gate you are not using at all, tie both its inputs LOW (its output then sits HIGH) or both HIGH.',
          'The outputs are push-pull (totem-pole), not open-collector. Do not wire two 74x02 outputs together, that fights the two output drivers and can overheat the chip. When you need to tie outputs (wired-AND), use the open-collector 74x33 NOR buffer with a pull-up resistor.',
          'Need more than two inputs per gate? The 74x27 is a triple 3-input NOR (HIGH only when all three inputs are LOW), same idea, wider gate.',
        ],
        note: 'Real gates are not instant. A change takes a short time to travel from input to output, roughly 8 to 12 ns on the original bipolar 74x02, about 10 ns on the common 74LS02, and around 3.5 ns on the fast 74S02. The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: '1Y', type: 'output' },
      { pin: 2, name: '1A', type: 'input' },
      { pin: 3, name: '1B', type: 'input' },
      { pin: 4, name: '2Y', type: 'output' },
      { pin: 5, name: '2A', type: 'input' },
      { pin: 6, name: '2B', type: 'input' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3A', type: 'input' },
      { pin: 9, name: '3B', type: 'input' },
      { pin: 10, name: '3Y', type: 'output' },
      { pin: 11, name: '4A', type: 'input' },
      { pin: 12, name: '4B', type: 'input' },
      { pin: 13, name: '4Y', type: 'output' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NOR', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NOR', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NOR', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7404: Hex Inverter (NOT) ─────────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN5404, SN54LS04, SN54S04, SN7404, SN74LS04,
     SN74S04 Hex Inverters," SDLS029C (Dec. 1983, rev. Jan. 2004). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls04.pdf. Verified: standard-DIP terminal
     assignment (D/N/NS/J package, top view) + per-inverter function table (A=H -> Y=L,
     A=L -> Y=H) on page 1, totem-pole (push-pull) output schematic on page 4, and
     tPLH/tPHL switching characteristics on pages 5-6 (7404 ~8-12 ns typ, LS04 ~9-10 ns
     typ) -- all read as rendered PDF page images (issues.md C4). Pinout[] and the six
     NOT gates[] confirmed against this; engine left unchanged. NOTE: the CFP "W package"
     shown on page 1 uses a DIFFERENT pinout (VCC=4, GND=11); 74Sim models the standard
     DIP, so that variant is intentionally not used.
     Schmitt-trigger sibling (contrast only): Texas Instruments, "SNx414 and SNx4LS14 Hex
     Schmitt-Trigger Inverters," SDLS049C (Dec. 1983, rev. Nov. 2016). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls14.pdf. Verified page 1 (PDF image): same
     inverter function but two input thresholds (VT+/VT-) for clean, jitter-free output from
     very slow input ramps. Trusted for the "use a 74x14 for slow/noisy edges or oscillators"
     gotcha.
     Open-collector sibling (contrast only): Texas Instruments, "SN5405, SN54LS05, SN54S05,
     SN7405, SN74LS05, SN74S05 Hex Inverters With Open-Collector Outputs," SDLS030A
     (Dec. 1983, rev. Nov. 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn7405.pdf. Verified page 1 (PDF image): identical
     14-pin map, output stage is open-collector (needs a pull-up), may be tied for
     wired-OR/AND and reaches a higher VOH. Trusted for the "tie outputs / needs pull-up"
     contrast.
     Open-collector high-voltage driver sibling (contrast only): Texas Instruments, "SN5406,
     SN5416, SN7406, SN7416 Hex Inverter Buffers/Drivers With Open-Collector High-Voltage
     Outputs," SDLS031A (Dec. 1983, rev. Dec. 2001). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn7406.pdf. Verified page 1 (PDF image): 30 V (7406)
     min breakdown, up to 40 mA sink, for driving lamps, relays, and MOS levels. Trusted for
     the "drive a lamp/relay/higher voltage" claim.
     Inverter used as a linear-region oscillator element is NOT modeled: issues.md A11
     (74Sim treats every inverter as a hard digital gate). */
  '74x04': {
    name: '74x04',
    simpleName: 'Hex Inverter',
    description: 'Six independent inverters (NOT gates). (14-pin)',
    guideOverview: 'The 74x04 packs six independent inverters (NOT gates) into one 14-pin chip; "hex" just means six. Each gate has one input and one output, and the output is always the opposite of the input: HIGH in gives LOW out, LOW in gives HIGH out. Inverting is the simplest thing you can do to a logic signal, which is why this is one of the most reached-for chips on a breadboard. Use it to flip an active-LOW line to active-HIGH, to produce a signal alongside its complement, to re-drive a weak or slow edge back to a clean level, or to chain two inverters into a plain buffer. Two things set this part apart. Its outputs are ordinary push-pull, so you cannot wire two of them together; when you need that, a higher voltage, or the muscle to drive a lamp or relay, use the open-collector 74x05 or 74x06 with a pull-up resistor. And a plain 74x04 switches at a single threshold with no hysteresis, so for slow or noisy inputs, or for building an oscillator, the Schmitt-trigger 74x14 is the better choice.',
    guidePinDescriptions: {
      '1A': 'Input of inverter 1.',
      '1Y': 'Output of inverter 1. Inverts 1A: HIGH when 1A is LOW.',
      '2A': 'Input of inverter 2.',
      '2Y': 'Output of inverter 2. Inverts 2A: HIGH when 2A is LOW.',
      '3A': 'Input of inverter 3.',
      '3Y': 'Output of inverter 3. Inverts 3A: HIGH when 3A is LOW.',
      'GND': 'Ground reference for all six inverters (pin 7).',
      '4Y': 'Output of inverter 4. Inverts 4A: HIGH when 4A is LOW.',
      '4A': 'Input of inverter 4.',
      '5Y': 'Output of inverter 5. Inverts 5A: HIGH when 5A is LOW.',
      '5A': 'Input of inverter 5.',
      '6Y': 'Output of inverter 6. Inverts 6A: HIGH when 6A is LOW.',
      '6A': 'Input of inverter 6.',
      'VCC': 'Positive supply (+5 V) for all six inverters, at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls04.pdf',
    tags: ['not', 'inverter', 'gate', 'logic', 'hex', 'six', '1-input', 'buffer'],
    guideSections: [
      {
        title: 'Inverter (NOT Gate) Logic',
        paragraphs: [
          'An inverter does one thing: it flips its input. A HIGH input gives a LOW output, and a LOW input gives a HIGH output. It is the simplest logic gate, one input and one output, and it supplies the "NOT" in every Boolean expression.',
          'Each of the six gates is completely independent. They share only the power pins (VCC and GND), so you can use one, two, or all six in unrelated parts of a circuit.',
        ],
        formulas: ['Y = NOT A', 'A=0 → Y=1', 'A=1 → Y=0'],
      },
      {
        title: 'Reading the Pinout',
        paragraphs: [
          'Unlike a two-input gate chip, where each gate uses a pair of adjacent input pins, the 74x04 alternates inputs and outputs down the package. On the standard DIP (top view) the left side runs input, output, input, output: 1A, 1Y, 2A, 2Y, 3A, 3Y, down to GND on pin 7. The right side continues 4Y, 4A, 5Y, 5A, 6Y, 6A, up to VCC on pin 14.',
          'Because the layout alternates, it is easy to wire an input where you meant an output. Trace each gate\'s A (input) and Y (output) pair before you build.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Flipping polarity: turn an active-LOW enable into active-HIGH, or the reverse.',
          'Making a complement: feed one signal into an inverter to get both it and its opposite, for circuits that need a signal and its inverse at once.',
          'Building a buffer: chain two inverters so the output follows the input but is re-driven at full strength.',
          'Cleaning up a signal: restore a degraded or slowly-rising edge back to a solid HIGH or LOW (the Schmitt-trigger 74x14 does this far better, see below).',
          'Oscillators: inverters are the classic core of ring, RC, and crystal oscillators (with the caveat in the note below).',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Do not leave inputs floating. On bipolar TTL a floating input tends to read HIGH but is noise-sensitive, so tie every unused inverter\'s input to a defined HIGH or LOW. This keeps its output steady and its supply current down.',
          'The outputs are push-pull (totem-pole), not open-collector. Do not wire two 74x04 outputs together; that fights the two output drivers and can overheat the chip. When you need to tie outputs (wired-OR/AND), swing above 5 V, or drive a lamp or relay, use the open-collector 74x05, or the higher-voltage 74x06 / 74x16 driver, each with a pull-up resistor.',
          'A plain 74x04 has no hysteresis. It switches at a single threshold, so a slow or noisy input can make the output chatter as it crosses. For slow edges, noisy lines, or building an oscillator, use the Schmitt-trigger 74x14 instead: its two thresholds give clean, jitter-free switching.',
        ],
        note: 'Two simplifications to be aware of. (1) Real gates are not instant: a change takes roughly 9 to 10 ns to travel from input to output on a 74LS04 (a bit more on the original 7404), and less on faster families like 74S or 74HC. The simulator treats this delay as zero, so it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause. (2) An inverter used in an RC or crystal oscillator actually works by biasing itself in its analog "linear" region, part-way between HIGH and LOW. The simulator models every inverter as a hard digital gate, so it does not reproduce that analog oscillation, build those oscillators on real hardware and use the sim for the digital logic only.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1Y', type: 'output' },
      { pin: 3, name: '2A', type: 'input' },
      { pin: 4, name: '2Y', type: 'output' },
      { pin: 5, name: '3A', type: 'input' },
      { pin: 6, name: '3Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '4Y', type: 'output' },
      { pin: 9, name: '4A', type: 'input' },
      { pin: 10, name: '5Y', type: 'output' },
      { pin: 11, name: '5A', type: 'input' },
      { pin: 12, name: '6Y', type: 'output' },
      { pin: 13, name: '6A', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },

  // ── 7408: Quad 2 input AND ───────────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN5408, SN54LS08, SN54S08, SN7408, SN74LS08, SN74S08
     Quadruple 2-Input Positive-AND Gates," SDLS033 (Dec. 1983, rev. Mar. 1988). [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls08.pdf. Verified: DIP terminal assignment
     (top view) + per-gate function table + positive-logic diagram on page 1, totem-pole output
     schematic on page 2, and tPLH 17.5 ns / tPHL 12 ns switching characteristics on page 3 all
     read as rendered PDF page images (issues.md C4). Pinout[] and AND gates[] confirmed against
     this; engine left unchanged.
     Open-collector sibling (contrast only): Texas Instruments, "SN5409 ... SN74S09 Quadruple
     2-Input Positive-AND Gates With Open-Collector Outputs," SDLS034. [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls09.pdf. Verified page 1 (PDF image): identical 14-pin
     map, output stage is open-collector requiring a pull-up. Trusted for the "use the 74x09 to tie
     outputs together" claim.
     AND is not functionally complete (also needs an inverting gate): M. M. Mano and C. R. Kime,
     Logic and Computer Design Fundamentals, 3rd ed. Prentice Hall, 2004, p. 73. */
  '74x08': {
    name: '74x08',
    simpleName: 'Quad AND',
    description: 'Four independent 2 input AND gates. (14-pin)',
    guideOverview: 'The 74x08 packages four independent 2 input AND gates. A gate output is HIGH only when both of its inputs are HIGH; if either input is LOW, the output is LOW. Reach for it when you want a plain AND: pass a signal through only while an enable line is HIGH, or confirm that two conditions are true at the same time. Unlike the 74x00 NAND, it gives the result directly, with no built in inversion to undo. Two specifics set this part apart. Its outputs are ordinary push-pull (totem-pole) outputs, so you cannot wire two of them together to combine signals; if you need that, use the open-collector 74x09 with a pull-up resistor instead. And AND is not a universal gate, so unlike NAND or NOR you cannot build every logic function from AND alone.',
    guidePinDescriptions: {
      '1A': 'Input A of AND gate 1.',
      '1B': 'Input B of AND gate 1.',
      '1Y': 'Output of gate 1. HIGH only when both 1A and 1B are HIGH.',
      '2A': 'Input A of AND gate 2.',
      '2B': 'Input B of AND gate 2.',
      '2Y': 'Output of gate 2. HIGH only when both 2A and 2B are HIGH.',
      'GND': 'Ground reference (pin 7).',
      '3Y': 'Output of gate 3. HIGH only when both 3A and 3B are HIGH.',
      '3A': 'Input A of AND gate 3.',
      '3B': 'Input B of AND gate 3.',
      '4Y': 'Output of gate 4. HIGH only when both 4A and 4B are HIGH.',
      '4A': 'Input A of AND gate 4.',
      '4B': 'Input B of AND gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls08.pdf',
    tags: ['and', 'gate', 'logic', 'quad', 'four', '2 input'],
    guideSections: [
      {
        title: 'AND Gate Logic',
        paragraphs: [
          'An AND gate outputs HIGH only when every input is HIGH. If any input is LOW, the output is LOW. With two inputs there is exactly one HIGH row in the table below, out of four.',
          'The output is the logical product of the inputs. That is why AND is written as a dot (A·B) or by placing the variables side by side, the same way you write multiplication.',
        ],
        formulas: [
          'Y = A AND B',
          'A=0,B=0 → Y=0 | A=0,B=1 → Y=0 | A=1,B=0 → Y=0 | A=1,B=1 → Y=1',
        ],
      },
      {
        title: 'Gating and Masking',
        paragraphs: [
          'The most common job for an AND gate is to gate a signal: let it pass or block it under the control of a second line. Feed the signal into one input and an enable line into the other. While enable is HIGH the output follows the signal; while enable is LOW the output is held LOW no matter what the signal does.',
          'The same idea masks data. AND a data bit with a mask bit: where the mask is 1 the data passes through, where the mask is 0 the output is forced to 0. Do this across several bits at once and you keep the bits you want while clearing the rest.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Clock gating: pass a clock only while an enable line is HIGH.',
          'Combining two active HIGH conditions into one, for example two chip-select or ready lines that must both be true.',
          'Masking: force selected bits to 0 while letting the others through.',
          'Address decoding, together with inverters and other gates, to detect a specific bit pattern.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Do not leave inputs floating. On bipolar TTL a floating input tends to read HIGH but is noise sensitive, so tie every unused input to a defined level. For a gate you are not using at all, tie its inputs HIGH or LOW so its output sits at a known state.',
          'The outputs are push-pull, not open-collector. Do not connect two 74x08 outputs together to make a wired AND; that fights the two output drivers and can overheat the chip. Use the 74x09 (open-collector) with a pull-up resistor when you need to tie outputs.',
          'To use a gate as a controlled pass-through, tie the spare input HIGH so the output simply follows the other input.',
        ],
        note: 'Real gates are not instant. A change takes a short time to travel from input to output, roughly 12 to 18 ns for the standard bipolar 74x08 and less for faster families like 74S or 74HC. The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '1Y', type: 'output' },
      { pin: 4, name: '2A', type: 'input' },
      { pin: 5, name: '2B', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '4Y', type: 'output' },
      { pin: 12, name: '4A', type: 'input' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'AND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'AND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'AND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'AND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7410: Triple 3 input NAND ───────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN5410, SN54LS10, SN54S10, SN7410,
     SN74LS10, SN74S10 Triple 3-Input Positive-NAND Gates," SDLS035A (Dec. 1983,
     rev. Apr. 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls10.pdf. Verified: N/D-package
     (standard DIP, top view) terminal assignment 1A=1, 1B=2, 2A=3, 2B=4, 2C=5,
     2Y=6, GND=7, 3Y=8, 3A=9, 3B=10, 3C=11, 1Y=12, 1C=13, VCC=14 -- confirmed
     against BOTH the top-view terminal diagram AND the pin numbers printed on the
     logic symbol -- plus the Function Table (each gate: A·B·C all H -> Y=L; any
     input L -> Y=H) and positive-logic Y = NOT(A·B·C) = A̅ + B̅ + C̅ on page 1, and
     tPLH/tPHL switching characteristics on pages 3-5 ('10 tPLH 11 ns / tPHL 7 ns
     typ; 'LS10 9 ns / 10 ns typ; 'S10 3 ns / 3 ns typ) -- all read as rendered
     300-dpi PDF page images (issues.md C4).
     PINOUT BUGFIX (issues.md C2): the pre-existing hand-entered pinout scrambled
     gate 3 -- it had 3A=8, 3B=9, 3C=10, 3Y=11, i.e. the gate-3 OUTPUT on pin 11
     and inputs on pins 8-10. The datasheet puts 3Y on pin 8 (right after GND) with
     3A/3B/3C on 9/10/11. Corrected here. The gates[] key off pin NAMES, so the
     three-input NAND logic was already right; only the physical pin map (which pin
     carries the gate-3 output) was wrong. Independently corroborated by the 74x27
     triple-3-input NOR (TI SDLS089), verified earlier in this repo, whose DIP-14
     package shares the identical map (3Y=8, 3A=9, 3B=10, 3C=11). Guard:
     js/debug/scenarios/74x10-triple-3in-nand.mjs.
     NOTE: the ceramic "W package" (flat pack) shown on page 1 uses a DIFFERENT
     pinout (VCC=4, GND=11); 74Sim models the standard DIP, so that variant is
     intentionally not used (same situation as the 74x00/74x02/74x20 W package).
     NAND-family width pointers (for the "choosing gate width" section): the 74x00
     (2-input, SDLS025D), 74x20 (dual 4-input, SDLS079), and 74x30 (single 8-input,
     SDLS099, https://www.ti.com/lit/ds/symlink/sn74ls30.pdf) are each cited and
     verified in this file's sibling entries; trusted for the 74x00/74x10/74x20/
     74x30 width pointers.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x10': {
    name: '74x10',
    simpleName: 'Triple 3-input NAND',
    description: 'Three independent 3-input NAND gates. (14-pin)',
    guideOverview: 'The 74x10 holds three independent 3-input NAND gates in one 14-pin chip. Each gate drives its output LOW only when all three of its inputs are HIGH; any input LOW sends the output back HIGH. Adding the third input makes the test more selective than a 2-input NAND: one gate now checks for a specific 3-bit all-HIGH pattern, or gates a data line on two separate enable conditions at once. It is the 3-input member of the NAND family: the 74x00 has 2-input gates, the 74x20 4-input gates, and the 74x30 a single 8-input gate, so you pick the width that matches how many signals you need to combine. The pinout is the thing to watch. The three gates are not laid out in tidy left-to-right blocks: gate 2 sits together on pins 3-6, but gate 1 is split across the package (inputs 1A and 1B on pins 1-2, its third input 1C on pin 13, and its output 1Y on pin 12), and gate 3\'s output lands on pin 8 with its inputs on pins 9-11. Trace each gate on the pin map before you wire it.',
    guidePinDescriptions: {
      '1A': 'Gate 1 input A (pin 1).',
      '1B': 'Gate 1 input B (pin 2).',
      '2A': 'Gate 2 input A (pin 3).',
      '2B': 'Gate 2 input B (pin 4).',
      '2C': 'Gate 2 input C (pin 5).',
      '2Y': 'Gate 2 output (pin 6). LOW only when 2A, 2B, and 2C are all HIGH.',
      'GND': 'Ground, 0 V (pin 7).',
      '3Y': 'Gate 3 output (pin 8). LOW only when 3A, 3B, and 3C are all HIGH. The output sits here, right after GND, ahead of gate 3\'s inputs.',
      '3A': 'Gate 3 input A (pin 9).',
      '3B': 'Gate 3 input B (pin 10).',
      '3C': 'Gate 3 input C (pin 11).',
      '1Y': 'Gate 1 output (pin 12). LOW only when 1A, 1B, and 1C are all HIGH.',
      '1C': 'Gate 1 input C (pin 13). Gate 1\'s third input sits across the chip from 1A and 1B.',
      'VCC': 'Positive supply, +5 V (pin 14).',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls10.pdf',
    tags: ['nand', 'gate', 'logic', 'triple', 'three', '3 input'],
    guideSections: [
      {
        title: '3-Input NAND Logic',
        paragraphs: [
          'A NAND gate is an AND gate followed by an inverter (NAND is short for NOT-AND). This one takes three inputs. Its output is LOW only when all three inputs are HIGH; for every other combination the output is HIGH. Out of the eight possible input combinations, that is a single LOW row (all three inputs HIGH); the other seven leave the output HIGH.',
          'The three gates are completely independent. They share only the power pins (VCC and GND), so you can use one, two, or all three in unrelated parts of a circuit.',
        ],
        formulas: [
          'Y = NOT(A AND B AND C) = (NOT A) OR (NOT B) OR (NOT C)',
          'A=1,B=1,C=1 → Y=0 | any input 0 → Y=1',
        ],
      },
      {
        title: 'Reading the Pinout',
        paragraphs: [
          'The 74x10 does not lay its three gates out in neat left-to-right blocks, which trips up people who expect the tidy pattern of a 74x08. Only gate 2 is contiguous. Gate 1 is split: two of its inputs are at one end of the chip while its third input and its output are at the other. Gate 3\'s output comes before its inputs, on the pin right after GND. Follow the gate you actually want on the pin map before wiring.',
        ],
        list: [
          'Gate 1: inputs 1A (pin 1), 1B (pin 2), 1C (pin 13); output 1Y (pin 12). Split across the package.',
          'Gate 2: inputs 2A (pin 3), 2B (pin 4), 2C (pin 5); output 2Y (pin 6). The one tidy block.',
          'Gate 3: output 3Y (pin 8); inputs 3A (pin 9), 3B (pin 10), 3C (pin 11). Output comes first, right after GND.',
          'Power: GND (pin 7), VCC (pin 14).',
        ],
        note: 'This is the same split layout the 74x27 triple 3-input NOR uses, so the pin habits carry over between the two.',
      },
      {
        title: 'Common Uses',
        list: [
          'Detecting a 3-bit code: wire three signals into one gate and its output drops LOW the instant all three are HIGH, a compact test for one specific pattern. This shows up in address and opcode decoding, where you watch for an exact combination of bits.',
          '3-input AND: follow one gate with an inverter (or a second NAND wired as a NOT) and you get a 3-input AND, HIGH only when all three inputs are HIGH.',
          'Gating with two controls: use two inputs as enable lines and the third as the data line, so the gate only passes the (inverted) data when both controls are HIGH.',
          'Standing in for a narrower gate: hold one input HIGH and a 3-input NAND behaves as a 2-input NAND. NAND is also a universal gate, so a spare one wired with all inputs tied together is an inverter.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Do not leave inputs floating. On bipolar TTL a floating input tends to read HIGH but is noise-sensitive, so tie every unused input to a defined level.',
          'Using a gate with only two signals? Tie its spare input HIGH, not LOW. A LOW input pins the output HIGH and disables the gate; holding the spare HIGH lets the other two inputs behave like a 2-input NAND.',
          'The outputs are push-pull (totem-pole), not open-collector. Do not wire two outputs together, that fights the two output drivers and can overheat the chip.',
          'Watch the pinout. Gate 3\'s output is on pin 8 and gate 1 is split across the package, so wiring meant for a chip with tidy gate blocks will not drop straight onto a 74x10.',
          'Need a different width? The 74x00 is a 2-input NAND, the 74x20 a dual 4-input NAND, and the 74x30 a single 8-input NAND, same logic, wider or narrower gates.',
        ],
        note: 'Real gates are not instant. A change takes a short time to travel from input to output, roughly 7 to 11 ns on the original bipolar 74x10, about 9 to 10 ns on the common 74LS10, and around 3 ns on the fast 74S10. The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '2A', type: 'input' },
      { pin: 4, name: '2B', type: 'input' },
      { pin: 5, name: '2C', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '3C', type: 'input' },
      { pin: 12, name: '1Y', type: 'output' },
      { pin: 13, name: '1C', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B', '1C'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B', '2C'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B', '3C'], output: '3Y' },
    ],
  },

  // ── 7420: Dual 4-input NAND ─────────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN5420, SN54LS20, SN54S20, SN7420,
     SN74LS20, SN74S20 Dual 4-Input Positive-NAND Gates," SDLS079 (Dec. 1983,
     rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls20.pdf. Verified: D/N-package
     (standard DIP, top view) terminal assignment 1A=1, 1B=2, NC=3, 1C=4, 1D=5,
     1Y=6, GND=7, 2Y=8, 2A=9, 2B=10, NC=11, 2C=12, 2D=13, VCC=14 + Function Table
     (each gate: all four inputs H -> Y=L; any input L -> Y=H) + positive-logic
     Y = NOT(A·B·C·D) = A̅ + B̅ + C̅ + D̅ on page 1, and tPLH/tPHL switching
     characteristics on pages 3-5 ('20 tPLH 12 ns / tPHL 8 ns typ; 'LS20 9 ns /
     10 ns typ; 'S20 ~3 ns typ) -- all read as rendered 300-dpi PDF page images
     (issues.md C4). Pinout[] (two NC pins at 3 and 11) and the two 4-input NAND
     gates[] confirmed against this; engine left unchanged.
     NOTE: the ceramic "W package" (flat pack) shown on page 1 uses a DIFFERENT
     pinout (1A=1, 1Y=2, NC=3, VCC=4, NC=5, 2A=6, 2B=7, 2C=8, 2D=9, 2Y=10, GND=11,
     1B=12, 1C=13, 1D=14); 74Sim models the standard DIP, so that variant is
     intentionally not used (same situation as the 74x00/74x02 W package).
     NAND-family width pointers (for the "choosing gate width" section): the 74x00
     (2-input, SDLS025D) is already cited above in this file; Texas Instruments,
     "...Triple 3-Input Positive-NAND Gates," SDLS035A (74x10). [Online].
     Available: https://www.ti.com/lit/ds/symlink/sn74ls10.pdf. Verified page 1
     (PDF image): three independent 3-input NAND gates. Texas Instruments,
     "...8-Input Positive-NAND Gates," SDLS099 (74x30). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls30.pdf. Verified page 1 (PDF image):
     one 8-input NAND gate. Trusted for the 74x00/74x10/74x30 width pointers.
     Open-collector sibling (contrast only, for the "tie outputs" gotcha): Texas
     Instruments, "SN5422, SN54LS22, SN54S22, SN7422, SN74LS22, SN74S22 Dual
     4-Input Positive-NAND Gates With Open-Collector Outputs," SDLS080 (Dec. 1983,
     rev. Mar. 1988). [Online]. Available:
     https://www.unicornelectronics.com/ftp/Data%20Sheets/7422.pdf (TI's
     sn74ls22.pdf 404s). Verified page 1 (PDF image): SAME 14-pin dual-4-input-NAND
     terminal map as the 74x20, output stage is open-collector (needs a pull-up),
     "may be connected to other open-collector outputs to implement active-low
     wired-OR or active-high wired-AND functions." Trusted for the "use the 74x22
     to wire outputs together" contrast.
     Schmitt-trigger sibling (contrast only, for the "slow/noisy edges" gotcha):
     TI's SN7413/SN74LS13 PDF is purged from ti.com, so this is a SECONDARY source
     -- build-electronic-circuits.com, "7400 Series Guide: 74HC13/74LS13 (Dual
     4-Input NAND Gate)." [Online]. Available:
     https://www.build-electronic-circuits.com/7400-series-integrated-circuits/74hc13-74ls13/.
     Corroborated by the SN7413 datasheet listing on digchip.com. Same dual
     4-input NAND function but with Schmitt-trigger inputs (two thresholds) for a
     clean output from slow or noisy edges. Trusted only for the "use a 74x13 for
     slow/noisy edges" gotcha.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x20': {
    name: '74x20',
    simpleName: 'Dual 4-input NAND',
    description: 'Two independent 4-input NAND gates. (14-pin)',
    guideOverview: 'The 74x20 holds two independent 4-input NAND gates in one 14-pin chip. Each gate drives its output LOW only when all four of its inputs are HIGH; any input LOW sends the output back HIGH. That makes one gate a compact test for a specific 4-bit all-HIGH pattern, so the part turns up in address and opcode decoding and anywhere you need to fold four control or status lines into a single signal. It is the 4-input member of the NAND family: the 74x00 has 2-input gates, the 74x10 3-input, and the 74x30 a single 8-input gate, so you pick the width that matches how many signals you need to combine. One quirk to expect: two 4-input gates plus power do not fill 14 pins, so pins 3 and 11 are left unconnected (NC) and do nothing.',
    guidePinDescriptions: {
      '1A': 'Gate 1 input A.',
      '1B': 'Gate 1 input B.',
      'NC': 'No internal connection (pins 3 and 11). Leave open, it is not a spare input or a tie point.',
      '1C': 'Gate 1 input C.',
      '1D': 'Gate 1 input D.',
      '1Y': 'Gate 1 output. LOW only when 1A, 1B, 1C, and 1D are all HIGH.',
      'GND': 'Ground, 0 V (pin 7).',
      '2Y': 'Gate 2 output. LOW only when 2A, 2B, 2C, and 2D are all HIGH.',
      '2A': 'Gate 2 input A.',
      '2B': 'Gate 2 input B.',
      '2C': 'Gate 2 input C.',
      '2D': 'Gate 2 input D.',
      'VCC': 'Positive supply, +5 V (pin 14).',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls20.pdf',
    tags: ['nand', 'gate', 'logic', 'dual', '4 input'],
    guideSections: [
      {
        title: '4-Input NAND Logic',
        paragraphs: [
          'A NAND gate is an AND gate with its output inverted (NAND is short for NOT-AND). This one takes four inputs: its output is LOW only when all four are HIGH, and HIGH for every other combination. Four inputs give 16 possible input combinations, and exactly one of them, all four HIGH, drives the output LOW.',
          'The two gates are completely independent. They share only the power pins (VCC and GND), so you can use one gate, both, or leave a gate unused in a corner of your circuit.',
        ],
        formulas: [
          'Y = NOT(A AND B AND C AND D)',
          'all four inputs HIGH → Y = LOW  |  any input LOW → Y = HIGH',
          'By De Morgan: Y = (NOT A) OR (NOT B) OR (NOT C) OR (NOT D)',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Pattern detector: a 4-bit value equals 1111 only when all four bits are HIGH, so a single gate flags that one code. The output is LOW when the pattern matches, an active-LOW hit.',
          '4-input AND: follow the gate with an inverter (or a second NAND wired as an inverter) to get a plain AND that is HIGH only when all four inputs are HIGH.',
          'Address or chip-select decoding: combine four address lines (some through inverters) so the output goes active for exactly one region of memory or one peripheral.',
          'Gathering control lines: AND four ready or enable signals into a single all-ready flag, then invert it if you need the active-HIGH sense.',
        ],
      },
      {
        title: 'Choosing the Right Gate Width',
        paragraphs: [
          'The NAND family comes in several gate widths that are otherwise the same logic. Match the part to how many signals you actually need to combine.',
        ],
        list: [
          '74x00 — four 2-input NAND gates.',
          '74x10 — three 3-input NAND gates.',
          '74x20 — two 4-input NAND gates (this chip).',
          '74x30 — one 8-input NAND gate.',
          'Need fewer inputs than the gate has? Tie the spare inputs HIGH (see the gotchas below). Need more? Feed one gate output into a later stage, or move up to the wider part.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Tie unused inputs HIGH, not LOW. Because the gate ANDs its inputs, a HIGH input has no effect on the result while a LOW input forces the output HIGH. To use this chip as a 2- or 3-input NAND, tie the spare inputs to VCC or strap them to an input you are already driving. Never leave an input floating: on bipolar TTL a floating input tends to read HIGH but is noise-sensitive.',
          'Pins 3 and 11 are NC (no internal connection). They are not spare inputs and not a place to route a wire through the chip. Leave them open.',
          'The outputs are push-pull (totem-pole), not open-collector. Do not wire two outputs together; that pits the two drivers against each other and can overheat the chip. When you need to tie outputs together (wired-AND), use the open-collector 74x22, which has the same pinout, with a pull-up resistor.',
          'A plain 74x20 switches at a single threshold with no hysteresis, so a slow or noisy input can make the output chatter as it crosses. For slow edges or noisy lines, the Schmitt-trigger 74x13 is the same dual 4-input NAND with two thresholds for a clean output.',
        ],
        note: 'Real gates are not instant. A change takes a short time to travel from input to output, roughly 8 to 12 ns typical on the original bipolar 74x20, about 9 to 10 ns on the common 74LS20, and around 3 ns on the fast 74S20. The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 input B' },
      { pin: 3, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 4, name: '1C', type: 'input', description: 'Gate 1 input C' },
      { pin: 5, name: '1D', type: 'input', description: 'Gate 1 input D' },
      { pin: 6, name: '1Y', type: 'output', description: 'Gate 1 NAND output' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '2Y', type: 'output', description: 'Gate 2 NAND output' },
      { pin: 9, name: '2A', type: 'input', description: 'Gate 2 input A' },
      { pin: 10, name: '2B', type: 'input', description: 'Gate 2 input B' },
      { pin: 11, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 12, name: '2C', type: 'input', description: 'Gate 2 input C' },
      { pin: 13, name: '2D', type: 'input', description: 'Gate 2 input D' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },

  // ── 7432: Quad 2 input OR ────────────────────────────────────────────────
  /* Source: Texas Instruments, "Quadruple 2-Input Positive-OR Gates
     (SN5432, SN54LS32, SN54S32, SN7432, SN74LS32, SN74S32)," SDLS100
     (Dec. 1983, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls32.pdf. Verified: terminal
     assignment (D/J/N/W package, top view) + function table + logic diagram,
     page 1, read as PDF page images (issues.md C4). Positive logic
     Y = A + B = NOT(NOT-A · NOT-B) confirmed on p. 1. Switching characteristics
     (pp. 3-4): '32 tPLH 10 ns / tPHL 14 ns typ; 'LS32 tPLH = tPHL 14 ns typ
     (VCC = 5 V, TA = 25 °C). */
  '74x32': {
    name: '74x32',
    simpleName: 'Quad 2 input OR',
    description: 'Four 2 input OR gates output HIGH when either input is HIGH. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls32.pdf',
    tags: ['or', 'gate', 'logic', 'quad', '2 input'],
    /* [1] OR is not functionally complete (not a universal gate), unlike NAND/NOR: Wikipedia contributors, "OR gate," https://en.wikipedia.org/wiki/OR_gate. The De Morgan equivalence Y = A + B = NOT(NOT-A · NOT-B) is the datasheet's own positive-logic line, p. 1. */
    guideOverview: 'The 74x32 gives you four independent 2 input OR gates in one 14-pin package. Each output is HIGH when at least one of its inputs is HIGH, and LOW only when both inputs are LOW so an OR gate is the natural way to say "if any of these conditions is true, act on it." Its pins follow the same order as the 74x00 and 74x08 (two inputs then an output for each gate), so it drops into that familiar layout instead of the odd one the 74x02 uses. Unlike NAND or NOR, OR is not a universal gate you cannot build every logic function from OR alone but paired with an inverter it handles most everyday signal-combining jobs.',/* [1] */
    guidePinDescriptions: {
      '1A': 'Input A of OR gate 1.',
      '1B': 'Input B of OR gate 1.',
      '1Y': 'Output of gate 1. HIGH when 1A or 1B (or both) is HIGH.',
      '2A': 'Input A of OR gate 2.',
      '2B': 'Input B of OR gate 2.',
      '2Y': 'Output of gate 2. HIGH when 2A or 2B (or both) is HIGH.',
      'GND': 'Ground reference (pin 7).',
      '3Y': 'Output of gate 3. HIGH when 3A or 3B (or both) is HIGH.',
      '3A': 'Input A of OR gate 3.',
      '3B': 'Input B of OR gate 3.',
      '4Y': 'Output of gate 4. HIGH when 4A or 4B (or both) is HIGH.',
      '4A': 'Input A of OR gate 4.',
      '4B': 'Input B of OR gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'OR Gate Logic',
        paragraphs: [
          'An OR gate output is HIGH if any one or more of its inputs are HIGH. It is LOW only when every input is LOW at the same time. With two inputs that is one LOW row (both inputs LOW) and three HIGH rows.',
          'A useful mental picture: OR is two switches wired in parallel between the supply and the output. Close either switch and the output goes HIGH. That is the mirror image of AND, whose switches sit in series so both must close.',
        ],
        formulas: [
          'Y = A OR B',
          'A=0,B=0 → Y=0 | A=0,B=1 → Y=1 | A=1,B=0 → Y=1 | A=1,B=1 → Y=1',
        ],
      },
      {
        title: 'Building OR from NAND',
        paragraphs: [
          "By De Morgan's law, A OR B is the same as NOT(NOT A AND NOT B). The datasheet writes the function exactly this way: Y = A + B = NOT(NOT-A · NOT-B). So if you run out of OR gates but have spare NAND gates, invert both inputs, feed them into a NAND gate, and you get OR no extra package needed.",
          'This is also why NAND and NOR are called universal gates and OR is not: you can build OR out of NANDs, but you cannot build every logic function out of OR gates alone.',
        ],
      },
      {
        title: 'Positive-OR vs negative logic',
        paragraphs: [
          'The datasheet title calls this a "positive-OR" gate. The reason: the gate only performs OR when you treat HIGH as logic 1 (positive logic). The very same silicon, read with LOW as logic 1 (negative logic), performs AND the transistors do not change, only the labels you put on HIGH and LOW. This is a simplification of a subtle point, but it explains why TTL datasheets bother to say "positive".',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Combining alarm or interrupt sources: drive the output HIGH if any one source trips.',
          'Merging reset conditions a power-on reset, a manual button, and a watchdog can all feed one OR gate so any of them clears the circuit.',
          'Building an active-HIGH enable from several trigger signals.',
          'Gating a signal: hold one input LOW and the output follows the other input; drive that held input HIGH and the output is forced HIGH regardless.',
        ],
      },
      {
        title: 'Watch Out For',
        list: [
          'A floating (unconnected) TTL input tends to sit near HIGH, which forces an OR output permanently HIGH. Tie every unused input to a known level; for an unused gate, tying both its inputs to GND is the safe default.',
          'Do not confuse OR with XOR (the 74x86). OR is HIGH when either or both inputs are HIGH; XOR is HIGH only when the two inputs differ, so both-HIGH gives LOW.',
        ],
        note: 'Real floating-input behavior depends on the logic family (LS-TTL drifts HIGH; HC-CMOS inputs must never be left floating). The simulator treats inputs as clean digital levels and does not model this, so always drive inputs to a defined level on real hardware.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 input B' },
      { pin: 3, name: '1Y', type: 'output', description: 'Gate 1 output: HIGH when 1A or 1B (or both) is HIGH' },
      { pin: 4, name: '2A', type: 'input', description: 'Gate 2 input A' },
      { pin: 5, name: '2B', type: 'input', description: 'Gate 2 input B' },
      { pin: 6, name: '2Y', type: 'output', description: 'Gate 2 output: HIGH when 2A or 2B (or both) is HIGH' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0 V)' },
      { pin: 8, name: '3Y', type: 'output', description: 'Gate 3 output: HIGH when 3A or 3B (or both) is HIGH' },
      { pin: 9, name: '3A', type: 'input', description: 'Gate 3 input A' },
      { pin: 10, name: '3B', type: 'input', description: 'Gate 3 input B' },
      { pin: 11, name: '4Y', type: 'output', description: 'Gate 4 output: HIGH when 4A or 4B (or both) is HIGH' },
      { pin: 12, name: '4A', type: 'input', description: 'Gate 4 input A' },
      { pin: 13, name: '4B', type: 'input', description: 'Gate 4 input B' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'OR', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'OR', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'OR', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'OR', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7486: Quad 2 input XOR ───────────────────────────────────────────────
  /* Source: Texas Instruments, "Quadruple 2-Input Exclusive-OR Gates
     (SN5486 / SN54LS86A / SN54S86 / SN7486 / SN74LS86A / SN74S86)," SDLS124
     (Dec. 1972, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls86a.pdf. Verified: terminal
     assignment (D/N package, top view) + function table, pages 1-2, read as
     PDF page images. Datasheet also confirms Y = A̅B + AB̅, the true/complement
     (controlled-inverter) application, and the even/odd-parity element symbols
     (p. 1). Typical propagation delay: 14 ns ('86), 10 ns ('LS86A), 7 ns ('S86). */
  '74x86': {
    name: '74x86',
    simpleName: 'Quad XOR',
    description: 'Four 2 input XOR gates output HIGH when the two inputs differ. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls86a.pdf',
    tags: ['xor', 'gate', 'logic', 'quad', 'exclusive or', 'combinational'],
    /* [1] XOR is not functionally complete, unlike NAND/NOR: Wikipedia contributors, "XOR gate," https://en.wikipedia.org/wiki/XOR_gate. Half-adder sum bit / binary addition: Wikipedia contributors, "Adder (electronics)," https://en.wikipedia.org/wiki/Adder_(electronics). */
    guideOverview: 'The 74x86 gives you four independent 2 input XOR (exclusive OR) gates. Each output is HIGH when its two inputs are different and LOW when they are the same, so one gate is really a 1-bit "are these two signals different?" detector. That single behavior is why XOR shows up everywhere: it produces the sum bit in binary addition, checks parity, compares bits for equality, and inverts a signal on command. Unlike NAND or NOR, XOR is not a universal gate you cannot build every logic function from XOR alone but it does a job in one gate that would otherwise take several.',/* [1] */
    guidePinDescriptions: {
      '1A': 'Input A of XOR gate 1.',
      '1B': 'Input B of XOR gate 1.',
      '1Y': 'Output of gate 1. HIGH when 1A ≠ 1B.',
      '2A': 'Input A of XOR gate 2.',
      '2B': 'Input B of XOR gate 2.',
      '2Y': 'Output of gate 2. HIGH when 2A ≠ 2B.',
      GND:  'Ground reference (pin 7).',
      '3Y': 'Output of gate 3. HIGH when 3A ≠ 3B.',
      '3A': 'Input A of XOR gate 3.',
      '3B': 'Input B of XOR gate 3.',
      '4Y': 'Output of gate 4. HIGH when 4A ≠ 4B.',
      '4A': 'Input A of XOR gate 4.',
      '4B': 'Input B of XOR gate 4.',
      VCC:  'Positive supply (+5 V) at pin 14.',
    },
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '1Y', type: 'output' },
      { pin: 4, name: '2A', type: 'input' },
      { pin: 5, name: '2B', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '4Y', type: 'output' },
      { pin: 12, name: '4A', type: 'input' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'XOR', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'XOR', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'XOR', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'XOR', inputs: ['4A', '4B'], output: '4Y' },
    ],
    guideSections: [
      {
        title: 'XOR Gate Logic',
        paragraphs: [
          'An XOR (exclusive OR) gate outputs HIGH when its two inputs are different and LOW when they are the same. Read it as "one or the other, but not both." A plain OR gate also goes HIGH when both inputs are HIGH; XOR is the version that excludes that case, which is where the "exclusive" comes from.',
          'Because the output is HIGH only when the inputs disagree, a single gate works as a 1-bit difference detector: same in, LOW out; different in, HIGH out.',
        ],
        formulas: [
          'Y = A XOR B = (A AND NOT B) OR (NOT A AND B)',
          'A=0,B=0 → Y=0 | A=0,B=1 → Y=1 | A=1,B=0 → Y=1 | A=1,B=1 → Y=0',
        ],
      },
      {
        title: 'Controlled Inverter',
        paragraphs: [
          'Use one input as data and the other as a control line. When the control is LOW, the data passes through unchanged. When the control is HIGH, the data comes out inverted. So one XOR gate is a switchable inverter: flip or don\'t flip, chosen by a single line.',
          'This is the core of binary addition. In a half adder the XOR output is the sum bit and an AND gate on the same two inputs supplies the carry; wiring these together builds a full adder that chains across as many bits as you need.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Binary addition: the sum bit of a half or full adder is A XOR B.',
          'Parity: chain gates to test whether a group of bits holds an even or odd number of 1s, which catches single-bit errors.',
          'Equality check: XOR outputs LOW when two bits match and HIGH where they differ, so it flags exactly which bits of two numbers disagree. (Its complement, the 74x266 XNOR, outputs HIGH on a match.)',
          'Controlled inversion and toggling: a control line decides whether a signal passes straight through or inverted.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'XOR is not a universal gate. NAND and NOR can each build any logic function on their own; XOR cannot, so you still need other gate types around it.',
          'On real TTL hardware, don\'t leave the inputs of an unused gate floating tie them to VCC or GND. A floating TTL input tends to read HIGH and picks up noise. (The simulator idealizes this; a real breadboard does not.)',
          'Each gate takes a few nanoseconds to switch (about 10 ns for the LS86A, 14 ns for the original 86), so chaining many for wide parity adds up the delay. The simulator\'s LIVE mode treats gates as instant and leaves this out a deliberate simplification.',
        ],
      },
    ],
  },

  // ── 74266: Quad 2 input XNOR ─────────────────────────────────────────────
  '74x266': {
    name: '74x266',
    simpleName: '2 input XNOR',
    description: 'Quad 2 input XNOR gate (14-pin)',
    guideOverview: 'The 74x266 provides four independent 2 input XNOR (exclusive NOR) gates with open collector outputs. An XNOR gate is the complement of XOR: its output is HIGH when both inputs are the same (both LOW or both HIGH). This makes it ideal for equality comparison, parity checking, and controlled inversion. The open collector outputs require external pull up resistors to VCC.',
    guidePinDescriptions: {
      '1A': 'Input A of XNOR gate 1.',
      '1B': 'Input B of XNOR gate 1.',
      '1Y': 'Open collector output of gate 1. HIGH (via pull up) when 1A equals 1B.',
      '2A': 'Input A of XNOR gate 2.',
      '2B': 'Input B of XNOR gate 2.',
      '2Y': 'Open collector output of gate 2. HIGH (via pull up) when 2A equals 2B.',
      'GND': 'Ground reference (pin 7).',
      '3Y': 'Open collector output of gate 3. HIGH (via pull up) when 3A equals 3B.',
      '3A': 'Input A of XNOR gate 3.',
      '3B': 'Input B of XNOR gate 3.',
      '4Y': 'Open collector output of gate 4. HIGH (via pull up) when 4A equals 4B.',
      '4A': 'Input A of XNOR gate 4.',
      '4B': 'Input B of XNOR gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls266.pdf',
    tags: ['xnor', 'gate', 'logic', 'quad', 'open collector', 'exclusive nor'],
    guideSections: [
      {
        title: 'XNOR Gate Logic',
        paragraphs: [
          'XNOR is the complement of XOR. The output is HIGH when both inputs are identical and LOW when they differ.',
          'Because the outputs are open collector, you must add a pull up resistor (typically 1-10 kΩ) from each Y output to VCC. Open collector outputs can also be wire ANDed: connect several Y outputs together through a single pull up to implement a wired AND function.',
        ],
        formulas: [
          'Y = NOT(A XOR B)',
          'A=0,B=0 → Y=1 | A=0,B=1 → Y=0 | A=1,B=0 → Y=0 | A=1,B=1 → Y=1',
        ],
        note: 'Open collector outputs require an external pull up resistor. Outputs left without a pull up will float HIGH and produce unreliable logic levels.',
      },
      {
        title: 'Common Uses',
        list: [
          '1 bit comparator: output HIGH when both bits are equal.',
          'Parity checking across multiple bits.',
          'Controlled inversion: input LOW passes signal; input HIGH inverts it same as XOR but with inverted sense.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '1Y', type: 'output' },
      { pin: 4, name: '2A', type: 'input' },
      { pin: 5, name: '2B', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '4Y', type: 'output' },
      { pin: 12, name: '4A', type: 'input' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'XNOR', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'XNOR', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'XNOR', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'XNOR', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7447: BCD to 7 segment decoder (common anode) ────────────────────────
  /* Source: Texas Instruments, "SN5446A, '47A, '48, SN54LS47, 'LS48, 'LS49,
       SN7446A, '47A, '48, SN74LS47, 'LS48, 'LS49 BCD-to-Seven-Segment
       Decoders/Drivers," doc. SDLS111 (Mar. 1974, rev. Mar. 1988). [Online].
       Available: https://www.ti.com/lit/ds/symlink/sn74ls47.pdf. Verified:
       terminal assignment (D/N package, TOP VIEW, pins 1-16), the driver-outputs
       table (SN74LS47 = active-LOW, open-collector, 24 mA sink, 15 V max; SN7447A
       40 mA/15 V; SN5446A/7446A 30 V), and the '46A/'47A/'LS47 FUNCTION TABLE (T1),
       pages 1-3, read as rendered 300-dpi PDF page images (per issues.md C4, not a
       text summarizer; the sn74ls47.pdf symlink resolves to SDLS111). pinout[]
       matches the datasheet terminal diagram exactly and was left untouched.
     Two engine fixes this pass (issues.md C115):
       (1) Glyph font — the '47 was on the shared BCD_7SEG table, which draws 6 and
           9 "with tails" (the '246/'247 font). SDLS111 T1 shows the '47 draws a
           TAIL-LESS 6 (segment a OFF) and a TAIL-LESS 9 (segment d OFF); the gate
           was rewired to a dedicated tail-less BCD_7SEG_7447 primitive. Page 3:
           the '246/'247/'LS247/'LS248 exist to "compose the 6 and the 9 with
           tails," i.e. the '46/'47/'48 do not. The '46 twin still shares the tailed
           BCD_7SEG table and needs the same treatment (out of scope this pass).
       (2) Open collector — the '47 outputs are open-collector (feature line 1 +
           the driver-outputs table), but the entry omitted openCollector:true that
           every sibling ('46/'49/'246/'247/'347/'447) sets. Added.
     Open-collector outputs are modeled idealized (issues.md A8): a released output
       reads HIGH via the engine's implicit pull-up. The evaluator checks lamp test
       before blanking, so LT# and BI# both LOW gives all-ON here while the datasheet
       gives all-OFF (BI# overrides lamp test) — a simplification, noted in C115.
     BCD encoding: Wikipedia contributors, "Binary-coded decimal." [Online].
       Available: https://en.wikipedia.org/wiki/Binary-coded_decimal.
     Segment lettering + 7-segment basics: Wikipedia contributors, "Seven-segment
       display." [Online]. Available: https://en.wikipedia.org/wiki/Seven-segment_display. */
  '74x47': {
    name: '74x47',
    simpleName: 'BCD to 7-Seg (CA)',
    description: 'BCD to 7-seg decoder/driver, common anode, open collector (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls47.pdf',
    tags: ['7 segment', '7 seg', 'decoder', 'driver', 'bcd', 'display', 'seven segment', 'common anode', 'active low', 'open collector', 'lamp test', 'zero suppression'],
    guideOverview: 'The 74x47 takes a 4 bit BCD number (0 to 9) on its A, B, C, D inputs and lights the matching segments of a 7 segment LED display to show that digit. It is built for common anode displays: every segment anode ties to +5 V, and a segment turns ON when the chip pulls its output LOW (active LOW). The outputs are open collector, which means they can only pull LOW (sink current), never drive HIGH, so each segment needs its own external current limiting resistor, and the outputs can stand off more than 5 V to drive larger indicators (the 74x46 and 74x47 are rated 15 to 30 V). Three active LOW control pins sit on top of the plain decoding: LT# (lamp test) forces every segment ON to check for dead LEDs, BI# blanks the whole digit (and can be pulsed to dim it), and RBI# together with BI#/RBO# hides leading zeros across a multi digit display. One quirk to expect: this chip draws the 6 without its top bar and the 9 without its bottom bar. The 74x48 is the sister part for common cathode displays (active HIGH, with resistors built in); the 74x46 is the same as the 74x47 but rated to 30 V.',
    guidePinDescriptions: {
      'B': 'BCD input, bit 1 (weight 2). Pin 1.',
      'C': 'BCD input, bit 2 (weight 4). Pin 2.',
      'LT': 'Lamp Test (pin 3), active LOW. Pull LOW to force all seven segments ON, to check for burned out LEDs. Works only while BI#/RBO# is HIGH. Tie HIGH for normal operation.',
      'BI/RBO': 'Blanking Input / Ripple Blank Output (pin 4), active LOW, bidirectional. Drive it LOW as an input to blank (turn off) all segments; pulse it to dim the display. It acts as an output during zero suppression, going LOW to tell the next digit to blank.',
      'RBI': 'Ripple Blank Input (pin 5), active LOW. When LOW and the BCD input is 0000, the digit blanks and RBO# is driven LOW, so leading zeros disappear. Tie HIGH to always show a zero.',
      'D': 'BCD input, bit 3 (MSB, weight 8). Pin 6.',
      'A': 'BCD input, bit 0 (LSB, weight 1). Pin 7.',
      'GND': 'Ground, 0 V (pin 8).',
      'e': 'Segment e drive (pin 9), active LOW, open collector. LOW turns the segment ON. Wire it to the display through a current limiting resistor.',
      'd': 'Segment d drive (pin 10), active LOW, open collector. LOW turns the segment ON.',
      'c': 'Segment c drive (pin 11), active LOW, open collector. LOW turns the segment ON.',
      'b': 'Segment b drive (pin 12), active LOW, open collector. LOW turns the segment ON.',
      'a': 'Segment a drive (pin 13, the top bar), active LOW, open collector. LOW turns the segment ON.',
      'g': 'Segment g drive (pin 14, the middle bar), active LOW, open collector. LOW turns the segment ON.',
      'f': 'Segment f drive (pin 15), active LOW, open collector. LOW turns the segment ON.',
      'VCC': 'Positive supply, +5 V (pin 16).',
    },
    guideSections: [
      {
        title: 'How it decodes BCD',
        paragraphs: [
          'BCD (Binary Coded Decimal) is just a decimal digit 0 to 9 written as a 4 bit binary number: 0000 is 0, 0001 is 1, and so on up to 1001 for 9. You put that number on the four inputs, with A as the least significant bit and B, C, D following, and the chip works out which segments must light to draw the digit.',
          'A 7 segment display is seven LED bars labelled a through g. Segment a is the top bar, b and c are the right side (top then bottom), d is the bottom bar, e and f are the left side (bottom then top), and g is the middle bar. Every digit 0 to 9 is some combination of these seven.',
          'The outputs are active LOW: the chip pulls a segment output LOW to light that segment and leaves it HIGH to keep it dark. That is exactly what a common anode display wants. All the segment anodes are tied to +5 V, so current flows and the LED lights only when the other end is pulled down near ground.',
        ],
      },
      {
        title: 'Segment patterns (0 to 9)',
        paragraphs: [
          'Each digit lights a fixed set of segments (listed below, "on" segments only). Two of them look unusual on this chip: the 6 is drawn without its top bar (segment a stays off) and the 9 is drawn without its bottom bar (segment d stays off). This is the original TTL font. The related 74x246 and 74x247 were made later to draw 6 and 9 with those extra bars, the so called tails.',
          'Inputs above 9 (1010 through 1111) are not valid BCD. The real chip does not blank them; it lights a fixed, meaningless pattern for each, so you keep the input in the 0 to 9 range. The simulator leaves these codes undecoded rather than drawing the odd hardware patterns, which is a simplification.',
        ],
        formulas: [
          '0 -> a b c d e f      1 -> b c',
          '2 -> a b d e g        3 -> a b c d g',
          '4 -> b c f g          5 -> a c d f g',
          '6 -> c d e f g (no a)     7 -> a b c',
          '8 -> a b c d e f g    9 -> a b c f g (no d)',
        ],
      },
      {
        title: 'Lamp test, blanking, and zero suppression',
        paragraphs: [
          'Lamp Test (LT#): pull pin 3 LOW and every segment turns on, whatever is on the BCD inputs. It is a quick way to spot a dead segment in a display. It only works while BI#/RBO# is held HIGH.',
          'Blanking (BI#): pin 4 doubles as a blanking input. Pull it LOW and all segments go off, regardless of the BCD value. Feeding it a fast on/off square wave dims the display, because the segments spend part of each cycle dark, which is how brightness is controlled.',
          'Zero suppression (RBI# and RBO#): a plain multi digit counter shows leading zeros, like "007" instead of "7". To hide them, pin 5 (RBI#) means "blank me if I am a zero". When RBI# is LOW and the digit is 0, that digit blanks and its RBO# (pin 4 acting as an output) goes LOW. Wire the RBO# of each digit to the RBI# of the next digit and the blanking ripples along, clearing zeros until the first real digit. Leave the RBI# of the last (units) digit HIGH so a value of zero still shows a single "0".',
        ],
      },
      {
        title: 'Common uses and gotchas',
        paragraphs: [
          'The everyday job is the display end of a digital counter, clock, or meter: a counter chip produces BCD, the 74x47 turns it into segment drive, and a common anode LED shows the digit. One chip drives one digit, so a multi digit display uses one per digit (or a multiplexing scheme that shares drivers).',
          'The outputs are open collector, so they can only pull a segment LOW. You must supply the current limiting resistors yourself, unlike the 74x48, which has resistors built in but runs dimmer. Do not tie a segment output straight to +5 V expecting a HIGH: an open collector output floats when it is not pulling down. Match the chip to the display type, since the 74x47 is common anode only; use the 74x48 for common cathode. And remember the 6 and 9 have no tails.',
          'One simplification in this simulator: if you assert lamp test and blanking at the same time, the real chip blanks the display (BI# overrides lamp test), but the simulator lights all segments. Drive one control pin at a time to stay on the datasheet behavior.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'B',      type: 'input',  description: 'BCD input bit 1' },
      { pin: 2,  name: 'C',      type: 'input',  description: 'BCD input bit 2' },
      { pin: 3,  name: 'LT',     type: 'input',  description: 'Lamp Test, active LOW: pull LOW to force all seven segments ON regardless of BCD input (tests that no segments are burned out)' },
      { pin: 4,  name: 'BI/RBO', type: 'input',  description: 'Blanking Input / Ripple Blank Output (bidirectional, active LOW): as input, pull LOW to blank (turn off) all segments; as output, goes LOW when RBI# blanking is applied to propagate zero suppression to adjacent digits' },
      { pin: 5,  name: 'RBI',    type: 'input',  description: 'Ripple Blank Input, active LOW: when LOW and BCD input is 0000, all segments are blanked and RBO# goes LOW (leading zero suppression)' },
      { pin: 6,  name: 'D',      type: 'input',  description: 'BCD input bit 3 (MSB)' },
      { pin: 7,  name: 'A',      type: 'input',  description: 'BCD input bit 0 (LSB)' },
      { pin: 8,  name: 'GND',    type: 'power',  description: 'Ground (0 V)' },
      { pin: 9,  name: 'e',      type: 'output', description: 'Segment e drive, active LOW (LOW = segment ON for common anode display)' },
      { pin: 10, name: 'd',      type: 'output', description: 'Segment d drive, active LOW' },
      { pin: 11, name: 'c',      type: 'output', description: 'Segment c drive, active LOW' },
      { pin: 12, name: 'b',      type: 'output', description: 'Segment b drive, active LOW' },
      { pin: 13, name: 'a',      type: 'output', description: 'Segment a drive, active LOW' },
      { pin: 14, name: 'g',      type: 'output', description: 'Segment g drive, active LOW' },
      { pin: 15, name: 'f',      type: 'output', description: 'Segment f drive, active LOW' },
      { pin: 16, name: 'VCC',    type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    // BCD decode is a lookup table. BCD_7SEG_7447 = the tail-less '46/'47 font
    // (6 without segment a, 9 without segment d); the generic BCD_7SEG draws them
    // "with tails" (the '246/'247 font). See issues.md C115.
    gates: [
      { type: 'BCD_7SEG_7447', inputs: ['A', 'B', 'C', 'D'], outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
    ],
  },

  // ── 7448: BCD to 7 segment decoder/driver (common cathode) ─────────────
  /* Source: Texas Instruments, "SN5446A, '47A, '48, SN54LS47, 'LS48, 'LS49,
       SN7446A, '47A, '48, SN74LS47, 'LS48, 'LS49 BCD-to-Seven-Segment
       Decoders/Drivers," doc. SDLS111 (Mar. 1974, rev. Mar. 1988). [Online].
       Available: https://www.ti.com/lit/ds/symlink/sn7448.pdf. Verified:
       terminal assignment (D/N package, TOP VIEW, pins 1-16), the driver-outputs
       table (SN7448 = active-HIGH, 2-kOhm internal pull-up, 6.4 mA sink), and the
       '48/'LS48 FUNCTION TABLE (T2), pages 1-4, read as rendered 300-dpi PDF page
       images (per issues.md C4, not a text summarizer). pinout[] matches the
       datasheet terminal diagram exactly and was left untouched.
     Glyph-font fix: the shared BCD_7SEG_CC_TABLE draws 6 and 9 "with tails" (the
       '247/'248 font). SDLS111 shows the '48 draws a TAIL-LESS 6 (segment a off)
       and TAIL-LESS 9 (segment d off) — page 3 states the '247/'LS248 exist to
       "compose the 6 and the 9 with tails." gates[] was rewired to a dedicated
       tail-less primitive (BCD_7SEG_CC_7448); the '46/'47 siblings still share the
       tailed table and need the same treatment. See issues.md C108 and the
       regression js/debug/scenarios/74x48-bcd-7seg-cc.mjs.
     BCD encoding: Wikipedia contributors, "Binary-coded decimal." [Online].
       Available: https://en.wikipedia.org/wiki/Binary-coded_decimal.
     Segment lettering + 7-segment basics: Wikipedia contributors,
       "Seven-segment display." [Online]. Available:
       https://en.wikipedia.org/wiki/Seven-segment_display. */
  '74x48': {
    name: '74x48',
    simpleName: 'BCD to 7-Seg (CC)',
    description: 'BCD to 7-seg decoder/driver, common cathode, built in pull ups (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7448.pdf',
    tags: ['7 segment', '7 seg', 'decoder', 'driver', 'bcd', 'display', 'seven segment', 'common cathode', 'active high', 'lamp test', 'zero suppression'],
    guideOverview: 'The 74x48 takes a 4 bit BCD number (0 to 9) on its A, B, C, D inputs and lights the matching segments of a 7 segment LED display to show that digit. It is built for common cathode displays: all the LED cathodes tie to ground, and a segment turns ON when its output goes HIGH (active HIGH). Each output has a 2 kOhm pull up resistor built in, so you can wire the LED segments straight to the chip with no external resistors. The catch is that 2 kOhm keeps the current small, so the display is dim. Three active LOW control pins sit on top of the plain decoding: LT# (lamp test) lights every segment to check for dead LEDs, BI# blanks the whole digit (and can be pulsed to dim it), and RBI# together with BI#/RBO# hides leading zeros across a multi digit display. The 74x47 is the sister part for common anode displays: same decoding, but active LOW open collector outputs.',
    guidePinDescriptions: {
      'B': 'BCD input, bit B (weight 2). Pin 1.',
      'C': 'BCD input, bit C (weight 4). Pin 2.',
      'LT': 'Lamp Test (active LOW). Pull LOW, with BI#/RBO# HIGH, to turn all seven segments ON at once and check for dead LEDs. Tie HIGH for normal operation.',
      'BI/RBO': 'Blanking Input / Ripple-Blanking Output (active LOW, bidirectional). As an input, pull LOW to force every segment OFF, also used to dim the display by pulsing it. As an output, it goes LOW when this digit is blanked by zero suppression, which feeds the next digit RBI#.',
      'RBI': 'Ripple-Blanking Input (active LOW). When LOW and the BCD input is 0000, this digit blanks itself instead of showing 0 (leading-zero suppression). Tie HIGH to always show 0.',
      'D': 'BCD input, bit D (MSB, weight 8). Pin 6.',
      'A': 'BCD input, bit A (LSB, weight 1). Pin 7.',
      'GND': 'Ground, 0 V (pin 8).',
      'e': 'Segment e output (lower-left bar), active HIGH: HIGH turns the segment ON.',
      'd': 'Segment d output (bottom bar), active HIGH.',
      'c': 'Segment c output (lower-right bar), active HIGH.',
      'b': 'Segment b output (upper-right bar), active HIGH.',
      'a': 'Segment a output (top bar), active HIGH.',
      'g': 'Segment g output (middle bar), active HIGH.',
      'f': 'Segment f output (upper-left bar), active HIGH.',
      'VCC': 'Positive supply, +5 V (pin 16).',
    },
    guideSections: [
      {
        title: 'Reading BCD and Lighting Segments',
        paragraphs: [
          'BCD (binary coded decimal) uses 4 bits to hold one decimal digit: A is the 1s bit, B the 2s, C the 4s, D the 8s. So 0101 (D=0, C=1, B=0, A=1) is 5. The seven segments are named a to g: a is the top bar, b and c the right side (upper and lower), d the bottom, e and f the left side (lower and upper), and g the middle bar.',
          'The outputs are active HIGH, so a HIGH turns a segment ON. The table below shows which segments each digit lights.',
        ],
        formulas: [
          'Digit  D C B A | segments ON',
          '  0    0 0 0 0 | a b c d e f',
          '  1    0 0 0 1 | b c',
          '  2    0 0 1 0 | a b d e g',
          '  3    0 0 1 1 | a b c d g',
          '  4    0 1 0 0 | b c f g',
          '  5    0 1 0 1 | a c d f g',
          '  6    0 1 1 0 | c d e f g    (no top bar a)',
          '  7    0 1 1 1 | a b c',
          '  8    1 0 0 0 | a b c d e f g',
          '  9    1 0 0 1 | a b c f g    (no bottom bar d)',
        ],
        note: 'This chip draws two digits in an old style: the 6 has no top bar (segment a stays off) and the 9 has no bottom bar (segment d stays off). That is real 7448 behavior, not a bug — the later 74x247 and 74x248 were made specifically to add those bars back. Feeding a value from 10 to 15 (not valid BCD) lights an odd partial pattern, and 1111 blanks the digit.',
      },
      {
        title: 'The Three Control Pins',
        paragraphs: [
          'LT# (lamp test): pull it LOW and every segment turns ON, whatever the BCD inputs say. It is a fast way to confirm no LED segments are burned out. It only works while BI#/RBO# is HIGH.',
          'BI# (blanking input): pull it LOW and every segment turns OFF, overriding the inputs. Driving it with a fast on/off signal (PWM) is the usual way to dim the display, the segments spend part of each cycle off, so they look dimmer.',
          'RBI# (ripple-blanking input) and RBO#: these hide leading zeros. When RBI# is LOW and the digit would show 0, the chip blanks that digit and pulls its BI#/RBO# pin LOW as an output. Wire RBO# of one digit into RBI# of the next and a number like 0037 shows as "37" with the leading zeros hidden. Keep the last (ones) digit RBI# HIGH so a value of 0 still shows a single 0.',
        ],
      },
      {
        title: 'Driving the Display',
        paragraphs: [
          'Tie all the display cathodes to ground and connect each segment anode to its matching output (a to a, b to b, and so on). Because each output has a 2 kOhm pull up built in, the segments light with no other parts. That built in pull up is what sets the 74x48 apart from the open collector 74x47, which needs an external resistor on every segment.',
          'The trade off is brightness. A 2 kOhm resistor only lets a milliamp or two flow, so the display is dim, fine indoors, weak in bright light. For a bright display, use the outputs to switch transistors that carry more current, or use the 74x47 (common anode) and size your own resistors. These current figures are rough; the real value depends on your supply voltage and the LEDs.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Showing one decimal digit from a BCD counter such as the 74x90 or 74x160.',
          'Multi digit numeric displays, using the RBI#/RBO# chain to hide leading zeros.',
          'Clocks, panel meters, and counters where logic or a microcontroller puts out BCD.',
          'Dimming a display by pulsing BI# (PWM) instead of changing the supply voltage.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'B',      type: 'input',  description: 'BCD input bit 1' },
      { pin: 2,  name: 'C',      type: 'input',  description: 'BCD input bit 2' },
      { pin: 3,  name: 'LT',     type: 'input',  description: 'Lamp Test, active LOW: pull LOW to force all seven segments ON regardless of BCD input' },
      { pin: 4,  name: 'BI/RBO', type: 'input',  description: 'Blanking Input / Ripple Blank Output (bidirectional, active LOW): as input, pull LOW to blank all segments; as output, goes LOW when RBI# zero suppression is active' },
      { pin: 5,  name: 'RBI',    type: 'input',  description: 'Ripple Blank Input, active LOW: when LOW and BCD input is 0000, all segments are blanked (leading zero suppression)' },
      { pin: 6,  name: 'D',      type: 'input',  description: 'BCD input bit 3 (MSB)' },
      { pin: 7,  name: 'A',      type: 'input',  description: 'BCD input bit 0 (LSB)' },
      { pin: 8,  name: 'GND',    type: 'power',  description: 'Ground (0 V)' },
      { pin: 9,  name: 'e',      type: 'output', description: 'Segment e drive, active HIGH (HIGH = segment ON for common cathode display)' },
      { pin: 10, name: 'd',      type: 'output', description: 'Segment d drive, active HIGH' },
      { pin: 11, name: 'c',      type: 'output', description: 'Segment c drive, active HIGH' },
      { pin: 12, name: 'b',      type: 'output', description: 'Segment b drive, active HIGH' },
      { pin: 13, name: 'a',      type: 'output', description: 'Segment a drive, active HIGH' },
      { pin: 14, name: 'g',      type: 'output', description: 'Segment g drive, active HIGH' },
      { pin: 15, name: 'f',      type: 'output', description: 'Segment f drive, active HIGH' },
      { pin: 16, name: 'VCC',    type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    // Tail-less 6/9 glyph font (BCD_7SEG_CC_7448), per TI SDLS111 — see the
    // header comment above and issues.md C108. Control pins LT/BI-RBO/RBI are
    // read by the evaluator by name from pinout[] above, not listed here.
    gates: [
      { type: 'BCD_7SEG_CC_7448', inputs: ['A', 'B', 'C', 'D'], outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
    ],
  },

  // ── 7474: Dual D flip flop ───────────────────────────────────────────────
  /* Source: Texas Instruments, "SN5474, SN54LS74A, SN54S74, SN7474, SN74LS74A, SN74S74
       Dual D-Type Positive-Edge-Triggered Flip-Flops With Preset and Clear," doc. SDLS119
       (Dec. 1983, rev. Mar. 1988). [Online]. Available:
       https://www.ti.com/lit/ds/symlink/sn74ls74a.pdf. Verified: terminal assignment
       (D/N package, TOP VIEW, pins 1-14) + FUNCTION TABLE (PRE#/CLR#/CLK/D -> Q/Q#),
       page 1, read as rendered 300-dpi PDF page images (per issues.md C4, not a text
       summarizer). pinout[] and the two D_FF gates below match the datasheet exactly;
       engine left untouched.
     D flip flop theory (setup/hold time, metastability): Wikipedia contributors,
       "Flip-flop (electronics)." [Online]. Available:
       https://en.wikipedia.org/wiki/Flip-flop_(electronics). */
  '74x74': {
    name: '74x74',
    simpleName: 'Dual D Flip Flop',
    description: 'Dual positive-edge D flip-flop, async active-LOW preset/clear (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls74a.pdf',
    tags: ['flip flop', 'flip flop', 'd', 'latch', 'sequential', 'register', 'memory', 'preset', 'clear'],
    guideOverview: 'The 74x74 packs two independent D flip flops into one 14 pin chip. Each one looks at its D input and copies that level to its Q output at a single instant: the moment the clock rises from LOW to HIGH. It then holds that value until the next rising edge, so a D flip flop is really a 1 bit memory that only listens on a clock edge. Each flip flop also has a preset and a clear (PRE# and CLR#, both active LOW) that force the output HIGH or LOW right away, ignoring the clock. Reach for it when you need to grab a signal on a clock edge, hold a single bit, or build the basic cell of a counter, shift register, or frequency divider. The two halves share only power and ground; their clocks are separate, so you can run them from different signals.',
    guidePinDescriptions: {
      '1CLR': 'Flip flop 1 asynchronous clear, active LOW. Pull LOW to force 1Q=0 at any time. Tie HIGH for normal clocked operation.',
      '1D': 'Flip flop 1 data input. Captured by 1Q on the rising edge of 1CLK.',
      '1CLK': 'Flip flop 1 clock. Q1 updates to D1 on the LOW→HIGH transition.',
      '1PRE': 'Flip flop 1 asynchronous preset, active LOW. Pull LOW to force 1Q=1 at any time. Tie HIGH for normal clocked operation.',
      '1Q': 'Flip flop 1 true output.',
      '1Qn': 'Flip flop 1 complementary output (/Q1). Always the inverse of 1Q during normal operation.',
      'GND': 'Ground reference (pin 7).',
      '2Qn': 'Flip flop 2 complementary output (/Q2).',
      '2Q': 'Flip flop 2 true output.',
      '2PRE': 'Flip flop 2 asynchronous preset, active LOW. Pull LOW to force 2Q=1.',
      '2CLK': 'Flip flop 2 clock. Q2 updates to D2 on the LOW→HIGH transition.',
      '2D': 'Flip flop 2 data input. Captured by 2Q on the rising edge of 2CLK.',
      '2CLR': 'Flip flop 2 asynchronous clear, active LOW. Pull LOW to force 2Q=0.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    guideSections: [
      {
        title: 'How the D Flip Flop Works',
        paragraphs: [
          'A D (data) flip flop copies whatever level is on its D input to its Q output, but only at one instant: the moment the clock goes from LOW to HIGH (the rising edge). Between edges, D can wiggle all it wants and Q ignores it. Q holds the captured value until the next rising edge. That is the whole idea: it is edge triggered, not level triggered like a plain latch.',
          'For the capture to be reliable, D has to be steady for a short window around the edge: a setup time just before the edge and a hold time just after. For the 74LS74A that window is roughly 20 ns before and 5 ns after (rounded from the datasheet; the exact numbers depend on the logic family, LS vs S vs HC). Change D outside that window and the flip flop does not care.',
          'PRE# and CLR# ignore the clock completely. Pull CLR# LOW and Q drops to 0 right away; pull PRE# LOW and Q jumps to 1 right away. That is what asynchronous means here: no clock edge needed. Both are active LOW, so for normal clocked behavior you tie them HIGH and leave them there.',
        ],
        note: 'Never pull PRE# and CLR# LOW at the same time. The datasheet shows both Q and /Q going HIGH in that case, which is invalid for outputs that are supposed to be opposites, and the result collapses to an unpredictable state the instant you release either one.',
      },
      {
        title: 'Function Table',
        paragraphs: [
          'From the datasheet function table. H = HIGH, L = LOW, X = don\'t care, and an up arrow marks a rising clock edge. Q0 means "the value Q already held" (no change).',
        ],
        formulas: [
          'PRE#  CLR#  CLK  D  |   Q    /Q',
          '  L    H    X   X  |   1    0     preset forces Q high',
          '  H    L    X   X  |   0    1     clear forces Q low',
          '  L    L    X   X  |   1    1     both low: invalid, avoid',
          '  H    H    ↑   1  |   1    0     rising edge captures D=1',
          '  H    H    ↑   0  |   0    1     rising edge captures D=0',
          '  H    H    L   X  |   Q0  /Q0    no edge: output holds',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Divide-by-2 / frequency divider: wire /Q back to D. Q then flips state on every rising clock edge, so its output runs at half the clock frequency. Chain several to divide by 4, 8, 16.',
          'Shift register: feed Q of one flip flop into D of the next and share a common clock; data marches one stage per edge.',
          'Synchroniser: catch a button press or other signal that is not aligned to your clock and re-time it into your clocked circuit.',
          '1 bit memory / register cell: hold a single bit and update it only when you choose to clock it.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'It triggers only on the rising edge (LOW to HIGH). A HIGH level sitting on the clock does nothing; the clock has to actually transition.',
          'Tie unused inputs to a defined level. On TTL a floating input tends to read HIGH but is unreliable and noise-sensitive. Idle PRE# and CLR# should sit HIGH, not float, or the flip flop can get stuck preset or cleared.',
          'Setup/hold violations cause metastability: if D changes right at the clock edge, Q can hang at an in-between voltage for a moment before settling to a random 0 or 1. This mostly bites when you clock in a signal that is not synchronised to your clock. (Simplified: real metastability is a probability that shrinks with time, not a hard guaranteed failure.)',
          'The two flip flops are fully independent, with separate D, clock, PRE#, and CLR# pins. There is no shared clock or shared reset; they only share VCC (pin 14) and GND (pin 7).',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: '1CLR',  type: 'input',  description: 'Flip flop 1 asynchronous clear, active LOW: forces Q1=0 regardless of clock' },
      { pin: 2,  name: '1D',    type: 'input',  description: 'Flip flop 1 data input captured on rising clock edge' },
      { pin: 3,  name: '1CLK',  type: 'input',  description: 'Flip flop 1 clock Q1 updates to D1 on rising edge (LOW→HIGH)' },
      { pin: 4,  name: '1PRE',  type: 'input',  description: 'Flip flop 1 asynchronous preset, active LOW: forces Q1=1 regardless of clock' },
      { pin: 5,  name: '1Q',    type: 'output', description: 'Flip flop 1 true output' },
      { pin: 6,  name: '1Qn',   type: 'output', description: 'Flip flop 1 inverted output (/Q1)' },
      { pin: 7,  name: 'GND',   type: 'power',  description: 'Ground (0 V)' },
      { pin: 8,  name: '2Qn',   type: 'output', description: 'Flip flop 2 inverted output (/Q2)' },
      { pin: 9,  name: '2Q',    type: 'output', description: 'Flip flop 2 true output' },
      { pin: 10, name: '2PRE',  type: 'input',  description: 'Flip flop 2 asynchronous preset, active LOW: forces Q2=1 regardless of clock' },
      { pin: 11, name: '2CLK',  type: 'input',  description: 'Flip flop 2 clock Q2 updates to D2 on rising edge (LOW→HIGH)' },
      { pin: 12, name: '2D',    type: 'input',  description: 'Flip flop 2 data input captured on rising clock edge' },
      { pin: 13, name: '2CLR',  type: 'input',  description: 'Flip flop 2 asynchronous clear, active LOW: forces Q2=0 regardless of clock' },
      { pin: 14, name: 'VCC',   type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'D_FF', inputs: ['1D', '1CLK', '1PRE', '1CLR'], outputs: ['1Q', '1Qn'] },
      { type: 'D_FF', inputs: ['2D', '2CLK', '2PRE', '2CLR'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
  },

  // ── 7401: Quad 2 input NAND (open collector) ──────────────────────────────
  /* Source: Texas Instruments, "SN5401, SN54LS01, SN7401, SN74LS01 Quadruple
     2-Input Positive-NAND Gates With Open-Collector Outputs," SDLS026 (Apr. 1985,
     rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn5401.pdf. Verified (all read as rendered
     ~300-dpi PDF page images, issues.md C4): terminal diagram (D/J/N/W package,
     TOP VIEW) + logic-symbol pin numbers, page 1. This part uses the NON-STANDARD
     7401 map in which each gate's OUTPUT comes first: 1Y=1, 1A=2, 1B=3, 2Y=4,
     2A=5, 2B=6, GND=7, 3A=8, 3B=9, 3Y=10, 4A=11, 4B=12, 4Y=13, VCC=14 -- outputs
     on pins 1/4/10/13, NOT the 3/6/8/11 of the push-pull 74x00 and the
     open-collector 74x03 (both of which share the standard quad-NAND map).
     pinout[] matches this and is CORRECT; the four NAND gates[] and the
     openCollector flag are correct; engine and js/specificChipsSim.js left
     unchanged (no hardware divergence found). Function Table (each gate, page 1):
     A=H B=H -> Y=L, A=L -> Y=H, B=L -> Y=H (= NAND); positive-logic diagram
     Y = NOT(A AND B), page 1. Description text (page 1): open-collector outputs
     "require pull-up resistors to perform correctly ... may be connected to other
     open-collector outputs to implement active-low wired-OR or active-high
     wired-AND functions ... often used to generate higher V(OH) levels."
     Absolute-max off-state output voltage 7 V (so a pull-up may sit above the 5 V
     rail); VCC 7 V; input voltage 5.5 V ('01) / 7 V ('LS01) (page 2). Recommended
     I(OL) 16 mA ('7401) / 8 mA ('74LS01); V(OH) test rail 5.5 V max (pages 3-4).
     Switching characteristics (VCC=5 V, 25 C, pages 3-4): '7401 tPLH 35 ns typ /
     55 ns max (pull-up-driven LOW->HIGH, R_L=4 kΩ) vs tPHL 8 ns typ / 15 ns max
     (transistor-driven HIGH->LOW, R_L=400 Ω) -- the rising edge is the slow one;
     '74LS01 tPLH 17 ns / tPHL 15 ns typ (R_L=2 kΩ). The '01 output-stage schematic
     (page 2) shows a single transistor to GND with no internal pull-up to VCC
     (open collector). The dead sn7401.pdf symlink in the previous entry was
     replaced with the live sn5401.pdf (same SDLS026 datasheet). Contrast to the
     push-pull 74x00 (TI SDLS025) and same-function open-collector 74x03 (TI
     SDLS028) is to those repo entries -- cited for the pinout/output-stage contrast
     only, not re-read as images this pass. Propagation delay is modeled as zero
     (LIVE mode): issues.md A1. */
  '74x01': {
    name: '74x01',
    simpleName: 'Quad NAND (OC)',
    description: 'Quad 2-input open collector NAND, pinout not 74x00/03 compatible (14-pin)',
    guideOverview: 'The 74x01 is a quad 2-input NAND gate with open-collector outputs. Its logic is the same as the 74x00: four independent gates, each output LOW only when both of its inputs are HIGH. Two things set this part apart. First, the outputs are open-collector instead of push-pull. A push-pull output drives both HIGH and LOW; an open-collector output can only pull its pin LOW, and to go HIGH it simply releases the pin, so the pin floats unless you add an external pull-up resistor to a supply rail. That resistor is not optional. In return, several outputs can share one pull-up so that any gate pulling LOW drags the shared line LOW, a wired-AND built from plain wire, and the pull-up can run to a rail above the 5 V supply, up to about 7 V, to drive a higher voltage. Second, and easy to miss, the 74x01 does not use the usual NAND pinout. Its outputs sit on pins 1, 4, 10, and 13, while the 74x00 and even the otherwise-identical open-collector 74x03 put their outputs on pins 3, 6, 8, and 11. Same logic, different pins, so a 74x01 will not drop into a socket wired for either one. For open-collector NAND on the standard pinout use the 74x03; for ordinary push-pull NAND use the 74x00.',
    guidePinDescriptions: {
      '1Y': 'Open-collector output of gate 1 (pin 1). Pulls LOW only when 1A and 1B are both HIGH; needs an external pull-up resistor to reach HIGH.',
      '1A': 'Input A of NAND gate 1 (pin 2).',
      '1B': 'Input B of NAND gate 1 (pin 3).',
      '2Y': 'Open-collector output of gate 2 (pin 4). Pulls LOW only when 2A and 2B are both HIGH; needs a pull-up resistor to reach HIGH.',
      '2A': 'Input A of NAND gate 2 (pin 5).',
      '2B': 'Input B of NAND gate 2 (pin 6).',
      'GND': 'Ground reference (pin 7).',
      '3A': 'Input A of NAND gate 3 (pin 8).',
      '3B': 'Input B of NAND gate 3 (pin 9).',
      '3Y': 'Open-collector output of gate 3 (pin 10). Pulls LOW only when 3A and 3B are both HIGH; needs a pull-up resistor to reach HIGH.',
      '4A': 'Input A of NAND gate 4 (pin 11).',
      '4B': 'Input B of NAND gate 4 (pin 12).',
      '4Y': 'Open-collector output of gate 4 (pin 13). Pulls LOW only when 4A and 4B are both HIGH; needs a pull-up resistor to reach HIGH.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn5401.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'open collector', '2 input', 'wired and'],
    guideSections: [
      {
        title: 'NAND Logic',
        paragraphs: [
          'Each of the four gates computes NAND (short for NOT-AND). The output is LOW only when both inputs are HIGH, and HIGH for every other input combination. That is the same logic as the 74x00 and the 74x03; only the output stage and the pin layout differ.',
          'The four gates are independent and share only the power pins (VCC on pin 14, GND on pin 7), so you can use one, two, or all four in separate parts of a circuit.',
        ],
        formulas: [
          'Y = NOT(A AND B)',
          'A=0,B=0 → Y=1 | A=0,B=1 → Y=1 | A=1,B=0 → Y=1 | A=1,B=1 → Y=0',
        ],
        note: 'The chip only ever actively drives the LOW row (both inputs HIGH). The three HIGH rows depend on the external pull-up resistor; with no pull-up those rows read as a floating pin, not a solid HIGH.',
      },
      {
        title: 'The Open-Collector Output',
        paragraphs: [
          'Inside each gate the output is a single transistor between the output pin and ground, with no connection from the pin up to the supply. That missing connection is the "open collector" the name points to. For a LOW the gate switches the transistor on and holds the pin near ground. For a HIGH it switches the transistor off and releases the pin. A released pin does not rise on its own, so you add a pull-up resistor from the pin to a supply rail, and the resistor lifts the released pin up to that rail.',
          'This makes the two output edges behave differently. The falling edge (HIGH to LOW) is fast, because the transistor pulls the pin down hard. The rising edge (LOW to HIGH) is slower, because the pull-up resistor has to charge the wiring and load capacitance through itself, an RC ramp. The datasheet shows it plainly: on the original bipolar 7401 the LOW-to-HIGH delay is about 35 ns while the HIGH-to-LOW delay is about 8 ns. The simulator treats both as zero, which is a simplification.',
        ],
        note: 'Pick the pull-up to balance speed against current. A smaller resistor charges the line faster (snappier rising edge) but wastes more current while the output is LOW; 1 to 10 kΩ is typical for TTL-level signals at moderate speed.',
      },
      {
        title: 'The Nonstandard Pinout',
        paragraphs: [
          'Most 74-series 2-input gates lay their pins out the same way: for each gate the two inputs come first, then the output. The 74x00 push-pull NAND and the 74x03 open-collector NAND both follow that order, with outputs on pins 3, 6, 8, and 11. The 74x01 does not. It puts each gate\'s output first, so the outputs land on pins 1, 4, 10, and 13 and the inputs fill the pins around them.',
          'The catch is that the 74x01 and 74x03 are the same part on paper (both quad 2-input NAND, both open-collector) yet they are wired differently. A 74x01 will not drop into a board laid out for a 74x03 or a 74x00. When you copy a circuit or swap a chip, check the pin numbers against this specific part, not against a NAND you used before. Only the signal pins move; GND stays on pin 7 and VCC on pin 14 for all three.',
        ],
        formulas: [
          'Pin       1   2   3   4   5   6    8   9  10  11  12  13',
          '74x01     1Y  1A  1B  2Y  2A  2B   3A  3B  3Y  4A  4B  4Y',
          '74x00/03  1A  1B  1Y  2A  2B  2Y   3Y  3A  3B  4Y  4A  4B',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Wired-AND bus: tie several open-collector outputs to one pull-up. The shared line is HIGH only while every gate releases it, so any single gate pulling LOW pulls the whole line LOW. A common way to gather several "ready" or "error" signals onto one line with no extra gate.',
          'Level shifting up: run the pull-up to a rail higher than 5 V (up to about 7 V on this part) so the HIGH level matches the input threshold of whatever the output drives.',
          'Driving a small load: the pulled-down output can sink current into an LED or a small driver stage, as long as you stay under the part\'s output current limit (about 16 mA on the 7401, 8 mA on the 74LS01).',
          'Any ordinary NAND job: use it as an inverter (tie a gate\'s two inputs together) or to stand in for a missing gate, exactly like the 74x00, as long as you add the pull-up its outputs need.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'No pull-up, no HIGH. Every output needs an external pull-up resistor to reach a logic HIGH. Leave it off and the output only ever pulls LOW and floats the rest of the time.',
          'The pinout is not the standard NAND pinout. Outputs are on pins 1, 4, 10, and 13, not 3, 6, 8, and 11. Do not assume it matches the 74x00 or the open-collector 74x03.',
          'Do not leave inputs floating. On bipolar TTL a floating input tends to read HIGH but is noise-sensitive, so tie every unused input to a defined level, and tie both inputs of any gate you are not using to a fixed HIGH or LOW.',
          'Watch the sink current. A pull-up sized too small dumps a lot of current through the output while it is LOW; keep the sunk current under the part\'s limit (about 16 mA on the 7401).',
          'Rising edges are slow. Because the pull-up sets the HIGH, a heavily loaded open-collector line is sluggish going HIGH. If you need speed and do not need wired-AND or a higher-than-5 V level, the push-pull 74x00 is the better choice.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1Y', type: 'output' },
      { pin: 2, name: '1A', type: 'input' },
      { pin: 3, name: '1B', type: 'input' },
      { pin: 4, name: '2Y', type: 'output' },
      { pin: 5, name: '2A', type: 'input' },
      { pin: 6, name: '2B', type: 'input' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3A', type: 'input' },
      { pin: 9, name: '3B', type: 'input' },
      { pin: 10, name: '3Y', type: 'output' },
      { pin: 11, name: '4A', type: 'input' },
      { pin: 12, name: '4B', type: 'input' },
      { pin: 13, name: '4Y', type: 'output' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7403: Quad 2 input NAND (open collector) ────────────────────────────
  /* Primary source: Texas Instruments, "SN5403, SN54LS03, SN54S03, SN7403,
     SN74LS03, SN74S03 Quadruple 2-Input Positive-NAND Gates With Open-Collector
     Outputs," SDLS028 (Dec. 1983, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls03.pdf. Verified (all read as rendered
     ~300-dpi PDF page images, issues.md C4): standard DIP-14 terminal assignment
     (D/J/N/W package, TOP VIEW, page 1) -- 1A=1, 1B=2, 1Y=3, 2A=4, 2B=5, 2Y=6,
     GND=7, 3Y=8, 3A=9, 3B=10, 4Y=11, 4A=12, 4B=13, VCC=14 (identical to the standard
     quad-NAND 74x00 map). Function Table, each gate: A=H B=H -> Y=L, A=L -> Y=H,
     B=L -> Y=H (= NAND), plus positive-logic logic diagram, page 1. Description text
     (page 1): open-collector outputs "require pull-up resistors to perform correctly
     ... may be connected to other open-collector outputs to implement active-low
     wired-OR or active-high wired-AND functions ... often used to generate higher
     V(OH) levels." Absolute-max off-state output voltage 7 V; VCC 7 V; input voltage
     5.5 V ('03/'S03) / 7 V ('LS03) (page 2). Recommended I(OL) 16 mA ('7403) / 8 mA
     ('74LS03) / 20 mA ('74S03); recommended V(OH) test rail 5.5 V max (pages 3-5).
     Switching characteristics (VCC=5 V, 25 C): '7403 tPLH 35 ns typ (R_L=4 kΩ) vs
     tPHL 8 ns typ -- the pull-up-driven LOW->HIGH edge is the slower one; '74LS03
     tPLH 17 ns / tPHL 15 ns typ; '74S03 tPLH 5 ns / tPHL 4.5 ns typ (pages 3-5). The
     '03 output-stage schematic (page 2) confirms a single output transistor to GND
     with no internal pull-up to VCC (open collector). pinout[] and the four NAND
     gates[] confirmed correct against this pass; openCollector flag correct; engine
     and js/specificChipsSim.js left unchanged (no hardware divergence found).
     Cross-reference to the push-pull quad NAND in the prose is to the repo's verified
     74x00 entry (TI SN74LS00, SDLS025); cited for the contrast only, not re-read as
     images this pass. Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x03': {
    name: '74x03',
    simpleName: 'Quad NAND (OC)',
    description: 'Quad 2-input open collector NAND; needs pull up resistors (14-pin)',
    guideOverview: 'The 74x03 is a 74x00 with one change: the same four independent 2 input NAND gates on the same pins, but the outputs are open collector instead of push pull. A normal push pull output actively drives both HIGH and LOW. An open collector output can only pull its pin LOW; to go HIGH it just lets go, so the pin floats unless you add an external pull up resistor from the output to a supply rail. That resistor is not optional: without it the output never reaches a logic HIGH. Why give up the built in HIGH drive? Two reasons. You can wire several outputs together onto one pull up, and the shared line sits HIGH only while every gate lets go: any single gate pulling LOW drags the whole line LOW, a wired AND (also called a wired OR when the active level is LOW) built from plain wire instead of another gate. And because the pull up sets the HIGH level, it can go to a rail above the chip\'s 5 V supply (up to about 7 V), letting one output drive a higher voltage input or load than an ordinary 5 V gate can. For everyday logic that needs none of this, reach for the push pull 74x00 instead.',
    guidePinDescriptions: {
      '1A': 'Input A of NAND gate 1.',
      '1B': 'Input B of NAND gate 1.',
      '1Y': 'Open collector output of gate 1. Pulls LOW only when 1A and 1B are both HIGH; needs an external pull up resistor to reach HIGH.',
      '2A': 'Input A of NAND gate 2.',
      '2B': 'Input B of NAND gate 2.',
      '2Y': 'Open collector output of gate 2. Pulls LOW only when 2A and 2B are both HIGH; needs a pull up resistor to reach HIGH.',
      'GND': 'Ground reference (pin 7).',
      '3Y': 'Open collector output of gate 3. Pulls LOW only when 3A and 3B are both HIGH; needs a pull up resistor to reach HIGH.',
      '3A': 'Input A of NAND gate 3.',
      '3B': 'Input B of NAND gate 3.',
      '4Y': 'Open collector output of gate 4. Pulls LOW only when 4A and 4B are both HIGH; needs a pull up resistor to reach HIGH.',
      '4A': 'Input A of NAND gate 4.',
      '4B': 'Input B of NAND gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls03.pdf',
    tags: ['nand', 'gate', 'logic', 'quad', 'open collector', '2 input', 'wired and'],
    guideSections: [
      {
        title: 'NAND Logic',
        paragraphs: [
          'Each of the four gates computes NAND (short for NOT-AND): the output is LOW only when both inputs are HIGH, and HIGH for every other input combination. That is the same logic as the 74x00; only the output stage is different.',
          'The four gates are independent and share only the power pins (VCC on pin 14, GND on pin 7), so you can use one, two, or all four in unrelated parts of a circuit.',
        ],
        formulas: [
          'Y = NOT(A AND B)',
          'A=0,B=0 → Y=1 | A=0,B=1 → Y=1 | A=1,B=0 → Y=1 | A=1,B=1 → Y=0',
        ],
        note: 'The chip only ever actively creates the LOW row (both inputs HIGH). The three HIGH rows rely on the external pull up resistor to lift the output; without a pull up those rows read as a floating pin, not a solid HIGH.',
      },
      {
        title: 'The Open Collector Output',
        paragraphs: [
          'Inside, each output is a single transistor between the output pin and ground, with nothing connecting the pin up to the supply (that missing connection is the open collector the name refers to). For a LOW the gate turns the transistor on and clamps the pin near ground. For a HIGH it turns the transistor off and simply releases the pin. Releasing a pin does not make it HIGH, so you add a pull up resistor from the pin to whatever rail you choose, and the resistor pulls the released pin up to that rail.',
          'This makes the two output edges behave differently. The falling edge (HIGH to LOW) is fast, because the transistor pulls the pin down hard. The rising edge (LOW to HIGH) is slower, because the pull up resistor has to charge the wiring and load capacitance through itself, an RC ramp. That is why an open collector line looks lazy going up and snappy coming down.',
        ],
        note: 'A typical pull up for TTL-level signals is 1 kΩ to 10 kΩ. A smaller resistor gives a faster, stiffer HIGH but wastes more current while the output is LOW; a larger resistor saves current but slows the rising edge and picks up more noise.',
      },
      {
        title: 'Common Uses',
        list: [
          'Wired AND / shared bus line: tie several outputs to one pull up so any gate can pull the common line LOW. The line is HIGH only when every output has let go. This is how open collector interrupt, busy, or status lines let many chips share a single wire.',
          'Level shifting up: pull the output up to a rail above 5 V (within the roughly 7 V limit) so a 5 V gate can drive a higher voltage input.',
          'Driving a load that wants more headroom: an LED, an opto-isolator, or a small relay, with the pull up or the load sized so the current the output sinks when LOW stays within the chip\'s limit.',
          'Plain NAND logic when a 74x03 is simply what you have on hand, just remember a pull up on every output you use.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'No pull up, no HIGH. The most common 74x03 mistake: with no pull up resistor the output can only pull LOW, so it looks stuck LOW or floats at an undefined level. Every output you use needs a pull up to a supply.',
          'Watch the sink current. When the output is LOW it carries the pull up and load current to ground through one transistor. Keep that under the part\'s rating, about 16 mA on the original 74x03 and 8 mA on the common 74LS03, so do not choose too small a pull up or too hungry a load.',
          'Respect the output voltage limit. The pull up rail may sit above 5 V for level shifting, but only up to about 7 V (the absolute maximum off-state output voltage); past that you risk the output transistor.',
          'The rising edge is the slow one. Because the pull up charges the line, LOW to HIGH is slower than HIGH to LOW and depends on the resistor and load. If timing is tight, use a smaller pull up or a faster part instead of assuming both edges match.',
          'Do not need open collector? Use the 74x00. Open collector only pays off for shared lines, level shifting, or higher voltage loads; for ordinary logic the push pull 74x00 is simpler and drives HIGH on its own.',
        ],
        note: 'Real gates are not instant, and the two edges are not equal: on the original 74x03 a LOW-to-HIGH change takes about 35 ns (set mostly by the pull up) against about 8 ns HIGH-to-LOW; the 74LS03 is roughly 17 ns and 15 ns, and the 74S03 about 5 ns each way. The simulator treats every output change as instantaneous and does not model the pull up\'s RC rising edge, which is a simplification.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '1Y', type: 'output' },
      { pin: 4, name: '2A', type: 'input' },
      { pin: 5, name: '2B', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '4Y', type: 'output' },
      { pin: 12, name: '4A', type: 'input' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7405: Hex Inverter (open collector) ─────────────────────────────────
  /* Primary source: Texas Instruments, "SN54LS05, SN54S05, SN7405, SN74LS05,
     SN74S05 Hex Inverters With Open-Collector Outputs," SDLS030A (Dec. 1983, rev.
     Nov. 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls05.pdf. Verified (all read as rendered
     ~300-dpi PDF page images, issues.md C4): standard DIP-14 terminal assignment
     (D/DB/J/N/NS package, top view, page 1) -- 1A=1, 1Y=2, 2A=3, 2Y=4, 3A=5, 3Y=6,
     GND=7, 4Y=8, 4A=9, 5Y=10, 5A=11, 6Y=12, 6A=13, VCC=14; Function Table + logic
     diagram Y = A̅ (page 2, each of six inverters: A=H -> Y=L, A=L -> Y=H);
     "open-collector outputs require pullup resistors ... may be connected to other
     open-collector outputs to implement active-low wired-OR or active-high wire-AND
     ... used to generate high V(OH) levels" (description text, page 1); absolute-max
     off-state output voltage V(O) = 7 V, input voltage 5.5 V ('05/'S05) / 7 V
     ('LS05) (page 3); recommended V(OH) test rail 5.5 V, I(OL) 16 mA ('7405) / 8 mA
     ('74LS05) (pages 4-5); switching characteristics -- '7405 tPLH 40 ns typ (R_L =
     4 kΩ) vs tPHL 8 ns typ, '74LS05 tPLH 17 ns / tPHL 15 ns typ -- confirming the
     pull-up-driven LOW->HIGH edge is the slower one (pages 4-5). pinout[] (six NOT
     gates, outputs 1Y=2/2Y=4/3Y=6/4Y=8/5Y=10/6Y=12) and gates[] confirmed against
     this; engine, openCollector flag, and js/specificChipsSim.js left unchanged.
     Contrast siblings (cited for the cross-references in the prose only, NOT re-read
     as images this pass): push-pull hex inverter -- TI, "SN74LS04 Hex Inverters,"
     https://www.ti.com/lit/ds/symlink/sn74ls04.pdf (same Y = A̅ logic, but a
     totem-pole output that cannot be wired together); high-voltage open-collector
     drivers -- TI, "SN5406, SN7406 Hex Inverter Buffers/Drivers With Open-Collector
     High-Voltage Outputs," https://www.ti.com/lit/ds/symlink/sn7406.pdf (30 V /
     40 mA output rating; the source of the "for lamps, relays, 12-24 V use the
     '06/'07" pointer, taken via the repo's already-verified 74x06 entry in this
     file). Propagation delay and the pull-up RC rise are modeled as zero (LIVE
     mode): issues.md A1. */
  '74x05': {
    name: '74x05',
    simpleName: 'Hex Inverter (OC)',
    description: 'Six open-collector inverters (NOT gates); needs pull-ups (14-pin)',
    guideOverview: 'The 74x05 is six independent inverters in one 14-pin chip ("hex" means six). Each one flips its input exactly like a 74x04 does: HIGH in gives LOW out, LOW in gives HIGH out. The difference is the output stage. A 74x04 actively drives both HIGH and LOW; a 74x05 output is open-collector, meaning it can only pull LOW (through an internal transistor to ground) or let go and float. There is no pull-up inside the chip, so on its own the output never reaches a real HIGH — you add an external pull-up resistor (usually 1–10 kΩ) from the output to a supply rail, and that resistor is what raises the floating output to HIGH. Two things make that extra resistor worth it. The pull-up can go to a different rail than the chip\'s own 5 V (up to about 5.5 V, 7 V absolute maximum), so the part does modest level shifting. And several outputs can share one pull-up on one wire: the shared line reads LOW if any inverter is pulling it down and only rises HIGH once all of them let go, which is wired logic that push-pull outputs cannot do. This is the plain, low-voltage open-collector inverter — for high voltage or driving lamps and relays reach for the 74x06/74x07 drivers, and when you just want to invert a signal with no pull-up fuss the 74x04 is simpler.',
    guidePinDescriptions: {
      '1A': 'Input of inverter 1.',
      '1Y': 'Open-collector output of inverter 1. Pulls LOW when 1A is HIGH; floats when 1A is LOW, so an external pull-up resistor is what makes it read HIGH.',
      '2A': 'Input of inverter 2.',
      '2Y': 'Open-collector output of inverter 2. Pulls LOW when 2A is HIGH; otherwise floats (a pull-up makes it HIGH).',
      '3A': 'Input of inverter 3.',
      '3Y': 'Open-collector output of inverter 3. Pulls LOW when 3A is HIGH; otherwise floats (a pull-up makes it HIGH).',
      'GND': 'Ground reference for all six inverters (pin 7). The output transistors sink their LOW current to here.',
      '4Y': 'Open-collector output of inverter 4. Pulls LOW when 4A is HIGH; otherwise floats (a pull-up makes it HIGH).',
      '4A': 'Input of inverter 4.',
      '5Y': 'Open-collector output of inverter 5. Pulls LOW when 5A is HIGH; otherwise floats (a pull-up makes it HIGH).',
      '5A': 'Input of inverter 5.',
      '6Y': 'Open-collector output of inverter 6. Pulls LOW when 6A is HIGH; otherwise floats (a pull-up makes it HIGH).',
      '6A': 'Input of inverter 6.',
      'VCC': 'Positive supply, +5 V (pin 14). Pull-up resistors can return here or to a separate rail up to about 5.5 V.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls05.pdf',
    tags: ['not', 'inverter', 'gate', 'logic', 'hex', 'six', 'open collector', 'oc', 'pull-up', 'wired-and', '1-input'],
    guideSections: [
      {
        title: 'How the Open-Collector Output Works',
        paragraphs: [
          'The logic is the plainest there is: each output is the opposite of its input. HIGH in gives LOW out, LOW in gives HIGH out. That is a NOT gate, and there are six of them, fully independent, sharing only the VCC and GND pins.',
          'What is special is how the output is built. Inside the chip each output pin is the collector of a transistor with nothing connected above it — that open collector is where the name comes from. When the input is HIGH the transistor turns on and clamps the output to GND: a solid, actively driven LOW. When the input is LOW the transistor turns off and the output pin is simply left disconnected — it floats, driving neither HIGH nor LOW. To turn that float into a real HIGH you connect an external pull-up resistor (typically 1–10 kΩ) from the output to a supply rail, and the resistor pulls the idle output up to that rail\'s voltage.',
        ],
        formulas: [
          'Y = NOT A   (each of the six inverters)',
          'A=1 → Y = LOW (driven to GND) | A=0 → Y = floating (a pull-up raises it to HIGH)',
        ],
        note: 'The LOW-to-HIGH edge is slower than the HIGH-to-LOW edge. Pulling LOW is done by a transistor and is quick; going HIGH relies on the pull-up resistor charging the wiring capacitance, so it rises gradually. On the original 7405 that is roughly 40 ns to go HIGH versus about 8 ns to go LOW; a smaller pull-up resistor speeds the rise but wastes more current while the output is LOW. The simulator treats both edges and the resistor\'s rise time as instant, which is a simplification.',
      },
      {
        title: 'Tying Outputs Together (Wired Logic)',
        paragraphs: [
          'Because an open-collector output only ever pulls down or lets go, you can safely wire several of them to the same node and share one pull-up resistor. The shared line sits HIGH only while every connected output is floating; the moment any one output pulls LOW, the whole line goes LOW. In effect the wire itself performs a logic operation for free — no extra gate needed.',
          'Read in terms of the output levels this is a wired-AND: the line is HIGH only when output 1 AND output 2 AND the rest are all HIGH. Read in terms of who is active, treating LOW as the active state, the same wire is a wired-OR: the line goes active (LOW) if any one output is active. Both names describe the identical circuit; which one you hear just depends on whether the signals are active-HIGH or active-LOW. You cannot do this with the push-pull 74x04, because two of its outputs at opposite levels would fight and dump current through each other.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Level shifting between rails: pull the output up to a voltage other than the chip\'s 5 V — for example up to 3.3 V so a 5 V part can drive a 3.3 V input, or up to about 5 V for a shared bus. Stay within the 7 V output limit.',
          'Shared "any device can pull low" buses: interrupt lines, busy/ready flags, and open-drain-style signaling where several sources tie to one pull-up and any of them can pull the line active-LOW.',
          'Wired-AND glue: combine a few active-LOW conditions into one line without spending a real gate.',
          'A spare inverter in a circuit that already runs open-collector: if you are already providing pull-ups, a 74x05 gate is a cheap NOT.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'No pull-up means no HIGH. This is the number-one mistake with open-collector parts: with nothing pulling the output up, it can only pull LOW or float, so a meter reads a fuzzy in-between level and never a clean HIGH. Always add the external pull-up resistor — in this simulator too.',
          'It is not a high-voltage or high-current driver. The output only stands about 5.5 V (7 V absolute maximum) and sinks around 16 mA on the plain 7405, 8 mA on the common 74LS05 — enough for another logic input, not for a lamp or relay. For those, or for a 12–24 V rail, use the open-collector 74x06 (inverting) or 74x07 (non-inverting) drivers, which are rated for far higher voltage and current.',
          'The pull-up value is a trade-off. A smaller resistor gives a faster, cleaner HIGH edge but draws more current (and more heat) whenever the output is LOW; a larger resistor saves current but makes the HIGH edge slow and noise-prone. A few kΩ is the usual middle ground.',
          'Do not leave unused inputs floating. Like any TTL input, a floating input drifts and picks up noise; tie every input you are not using to a defined HIGH or LOW.',
        ],
        note: 'The simulator models the open-collector output as two states, pulling LOW or floating, and treats propagation delay and the pull-up\'s rise time as zero. It does not reproduce the slow HIGH edge or the brief timing glitches real hardware can show. That is a deliberate simplification.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1Y', type: 'output' },
      { pin: 3, name: '2A', type: 'input' },
      { pin: 4, name: '2Y', type: 'output' },
      { pin: 5, name: '3A', type: 'input' },
      { pin: 6, name: '3Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '4Y', type: 'output' },
      { pin: 9, name: '4A', type: 'input' },
      { pin: 10, name: '5Y', type: 'output' },
      { pin: 11, name: '5A', type: 'input' },
      { pin: 12, name: '6Y', type: 'output' },
      { pin: 13, name: '6A', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },

  // ── 7406: Hex Inverter Buffer/Driver (open collector, high voltage) ───────────────────
  /* Primary source: Texas Instruments, "SN5406, SN5416, SN7406, SN7416 Hex
     Inverter Buffers/Drivers With Open-Collector High-Voltage Outputs," SDLS031A
     (Dec. 1983, rev. Dec. 2001). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn7406.pdf. Verified (all read as rendered
     ~300-dpi PDF page images, issues.md C4): DIP-14 terminal assignment (D/N/NS
     package, top view, page 1) -- 1A=1, 1Y=2, 2A=3, 2Y=4, 3A=5, 3Y=6, GND=7, 4Y=8,
     4A=9, 5Y=10, 5A=11, 6Y=12, 6A=13, VCC=14; logic diagram Y = A̅ (page 2, each of
     the six drivers is an inverter: A=H -> Y=L, A=L -> Y=H); the per-buffer
     schematic (page 2, labeled '06/'16) is a single open-collector NPN pull-down
     transistor to GND with no internal pull-up, input protected by a clamp diode.
     Ratings for the SN7406 this entry models: absolute-max output off-state voltage
     V(O) = 30 V, input voltage V(I) = 5.5 V, supply V(CC) = 7 V (Absolute Maximum
     Ratings, page 2); recommended high-level (off-state) output voltage V(OH) up to
     30 V and low-level output current I(OL) up to 40 mA (Recommended Operating
     Conditions, page 3; the SN5406/SN5416 military parts are limited to 30 mA, and
     the '16 versions to 15 V); V(OL) 0.4 V at I(OL) 16 mA and 0.7 V at I(OL) 40 mA,
     off-state output leakage I(OH) 0.25 mA max at 30 V (Electrical Characteristics,
     page 3); switching characteristics t(PLH) 10 ns typ / 15 ns max, t(PHL) 15 ns
     typ / 23 ns max at R_L = 110 ohm, C_L = 15 pF (page 3). "Convert TTL Voltage
     Levels to MOS Levels," "High Sink-Current Capability," "Open-Collector Drivers
     for Indicator Lamps and Relays," and input clamping diodes are from the Features
     list + description (page 1). pinout[] (six NOT gates, outputs
     1Y=2/2Y=4/3Y=6/4Y=8/5Y=10/6Y=12), the six NOT gates[], and openCollector:true
     were all confirmed CORRECT against this datasheet; engine and
     js/specificChipsSim.js left unchanged (the NOT primitive computes Y = NOT A,
     then the open-collector drive class releases a HIGH to Hi-Z and sinks a LOW to
     GND, with the implicit pull-up supplying the HIGH -- issues.md A8). This was a
     docs-and-citation pass only: no pinout/logic divergence found, so no issues.md
     hardware-divergence entry and no new regression scenario were needed.
     Contrast siblings (cited for the cross-references in the prose only, NOT re-read
     as images this pass): the SN7416 is the 15 V version of this same inverting hex
     OC driver (same 14-pin map, same Y = A̅), covered by this same SDLS031A document;
     non-inverting high-voltage OC drivers -- TI, "SN5407, SN5417, SN7407, SN7417 Hex
     Buffers/Drivers With Open-Collector High-Voltage Outputs," SDLS032H,
     https://www.ti.com/lit/ds/symlink/sn7407.pdf (Y = A, verified in this file's
     74x07 entry); plain low-voltage OC hex inverter -- TI SN74LS05,
     https://www.ti.com/lit/ds/symlink/sn74ls05.pdf (same pinout but only ~5.5 V /
     16 mA, verified in this file's 74x05 entry); push-pull hex inverter -- TI
     SN74LS04, https://www.ti.com/lit/ds/symlink/sn74ls04.pdf (same pinout, but a
     totem-pole output that cannot be wired together and cannot drive high-voltage
     loads). Idealized digital rails: the simulator models HIGH/LOW as ideal levels
     and does not enforce the real 30 V / 40 mA limits (issues.md A2); propagation
     delay and the pull-up rise are modeled as zero (LIVE mode): issues.md A1. */
  '74x06': {
    name: '74x06',
    simpleName: 'Hex Inv Driver (OC)',
    description: 'Six open-collector inverting drivers, 30 V / 40 mA sink (14-pin)',
    guideOverview: 'The 74x06 is six inverters in one 14-pin chip ("hex" means six), built to switch loads a normal logic gate cannot. Each one flips its input — HIGH in gives LOW out — but the output stage is what makes this part useful. It is open-collector, so the output can only pull LOW (through an internal transistor to ground) or let go and float; there is no pull-up inside. And that transistor is rated for up to 30 V across it and 40 mA of sink current, far more than an ordinary 5 V logic output handles. That combination lets a plain 5 V TTL signal control a 12 V or 24 V load: wire a lamp, LED, or relay coil between the higher supply and the output pin, and when the input goes HIGH the output pulls LOW and current flows through the load. Because the output only ever sinks current to ground, the load sits on the high side, between the positive rail and the output pin — this is a low-side switch. The 74x06 inverts, so the load is on when the input is HIGH. Its non-inverting twin is the 74x07, the 74x16 is the same chip rated for 15 V instead of 30 V, and the plain low-voltage version with this exact pinout is the 74x05.',
    guidePinDescriptions: {
      '1A': 'Input of driver 1. Ordinary 5 V TTL level — keep the load\'s higher voltage off this pin (5.5 V absolute maximum on any input).',
      '1Y': 'Open-collector output of driver 1. Pulls LOW (sinks up to 40 mA) when 1A is HIGH; floats when 1A is LOW and can stand off up to 30 V, so a pull-up or the load makes it read HIGH.',
      '2A': 'Input of driver 2.',
      '2Y': 'Open-collector output of driver 2. Pulls LOW when 2A is HIGH; otherwise floats (a pull-up or the load makes it HIGH).',
      '3A': 'Input of driver 3.',
      '3Y': 'Open-collector output of driver 3. Pulls LOW when 3A is HIGH; otherwise floats (a pull-up or the load makes it HIGH).',
      'GND': 'Ground reference for all six drivers (pin 7). Must be the common ground shared by the 5 V logic supply and the load\'s higher-voltage supply; the output transistors sink their current down to here.',
      '4Y': 'Open-collector output of driver 4. Pulls LOW when 4A is HIGH; otherwise floats (a pull-up or the load makes it HIGH).',
      '4A': 'Input of driver 4.',
      '5Y': 'Open-collector output of driver 5. Pulls LOW when 5A is HIGH; otherwise floats (a pull-up or the load makes it HIGH).',
      '5A': 'Input of driver 5.',
      '6Y': 'Open-collector output of driver 6. Pulls LOW when 6A is HIGH; otherwise floats (a pull-up or the load makes it HIGH).',
      '6A': 'Input of driver 6.',
      'VCC': 'Positive supply for the chip, +5 V (pin 14). This powers the logic only; the load\'s pull-up returns to its own rail (up to 30 V), not to this pin.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7406.pdf',
    tags: ['not', 'inverter', 'buffer', 'driver', 'gate', 'logic', 'hex', 'six', 'open collector', 'oc', 'high voltage', '30v', '40ma', 'lamp', 'relay', 'led', 'level shift', 'low-side switch', 'pull-up'],
    guideSections: [
      {
        title: 'How the High-Voltage Open-Collector Output Works',
        paragraphs: [
          'Each of the six drivers is a plain inverter feeding an open-collector output. The inverter part: the output is the opposite of the input. The output part: the pin is the collector of a transistor with nothing connected above it — that open collector is where the name comes from. When the input is HIGH the transistor turns on and clamps the output to ground, a solid, actively driven LOW that can sink up to 40 mA. When the input is LOW the transistor turns off and the output floats, driving neither level.',
          'What sets the 74x06 apart from an ordinary inverter is that this transistor can hold off up to 30 V while it is off. So the floating output does not have to be pulled up to the chip\'s own 5 V — you can tie the load (and its pull-up) to a separate 12 V, 24 V, or up-to-30 V rail. The chip runs on 5 V logic, the load runs on the higher rail, and the output transistor bridges the two by switching the load\'s current to ground.',
        ],
        formulas: [
          'Y = NOT A   (each of the six drivers)',
          'A=1 → Y = LOW (transistor on, sinks up to 40 mA) | A=0 → Y = floating (stands off up to 30 V; a pull-up or the load makes it HIGH)',
        ],
        note: 'Two limits are hard: no more than 30 V on any output pin, and no more than 40 mA sinking through it. Exceed either and the chip is permanently damaged. The 74x16 is the same part rated for 15 V instead of 30 V; the SN5406 military version is limited to 30 mA.',
      },
      {
        title: 'Driving a Lamp, LED, or Relay',
        paragraphs: [
          'The usual wiring is a low-side switch: put the load between the positive supply and the output pin, not between the output and ground. When the input is HIGH the output pulls LOW and current flows from the supply, through the load, into the output pin and down to ground — the load is on. When the input is LOW the output floats and no current flows — the load is off. Because the 74x06 inverts, a HIGH input turns the load on.',
          'For an LED, put the LED and its series resistor between the rail and the output. For a relay coil, a solenoid, or any other inductive load, add a flyback diode across the coil (cathode to the positive rail). When the coil switches off it produces a large reverse voltage spike; the diode clamps that spike so it does not blow past the 30 V limit and destroy the output transistor.',
        ],
        note: 'The load\'s supply and the chip must share the same ground (pin 7). Without a common ground the sink current has no return path and nothing switches.',
      },
      {
        title: 'Common Uses',
        list: [
          'Switching indicator lamps or LEDs from a 12 V or 24 V rail that a 5 V logic output could never drive directly.',
          'Driving a relay coil (with a flyback diode) so a logic signal can control a motor, solenoid, or mains-level circuit through the relay.',
          'Level-shifting a 5 V TTL signal up to a higher-voltage logic family — the original "convert TTL to MOS levels" job, done with a pull-up to the higher rail.',
          'Standing in for a 74x04 or 74x05 where the same inverting logic needs more voltage and current: same pinout, much stronger output.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'No pull-up (or no load) means no HIGH. An open-collector output can only pull LOW or float; on its own it never reaches a real HIGH. Something must pull it up — the load itself, or a separate pull-up resistor to the rail. This is the number-one open-collector mistake. In this simulator an implicit pull-up is added for you, so the output reads HIGH when undriven, but on real hardware you have to supply it.',
          'It only sinks current — it cannot source it. The output pulls toward ground, never toward the rail, so the load always goes on the high side, between the positive supply and the output pin. Wiring a load from the output down to ground will not light it.',
          'It inverts. HIGH in gives LOW out, so a HIGH input turns the load on and a LOW input turns it off. If you want a HIGH input to mean "off," use the non-inverting 74x07 instead.',
          'Keep the high voltage off the inputs. The 30 V rating is for the outputs only; the inputs are ordinary 5 V TTL and tolerate at most 5.5 V. Never feed the load rail into an input pin.',
          'Do not leave unused inputs floating. Like any TTL input, a floating input drifts and picks up noise; tie every input you are not using to a defined HIGH or LOW.',
        ],
        note: 'The simulator models the open-collector output as two states — pulling LOW or floating — with an implicit pull-up so a floating output reads HIGH. It treats logic levels as ideal digital HIGH/LOW and does not reproduce the real 30 V rail, the 40 mA current limit, propagation delay (roughly 10–15 ns on the real part), or the pull-up\'s rise time. Those are deliberate simplifications.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1Y', type: 'output' },
      { pin: 3, name: '2A', type: 'input' },
      { pin: 4, name: '2Y', type: 'output' },
      { pin: 5, name: '3A', type: 'input' },
      { pin: 6, name: '3Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '4Y', type: 'output' },
      { pin: 9, name: '4A', type: 'input' },
      { pin: 10, name: '5Y', type: 'output' },
      { pin: 11, name: '5A', type: 'input' },
      { pin: 12, name: '6Y', type: 'output' },
      { pin: 13, name: '6A', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },

  // ── 7407: Hex Buffer/Driver (open collector, non-inverting) ─────────────────────
  /* Primary source: Texas Instruments, "SN5407, SN5417, SN7407, SN7417 Hex
     Buffers and Drivers With Open-Collector High-Voltage Outputs," SDLS032H
     (Dec. 1983, rev. Sep. 2016). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn7407.pdf. Verified (read as rendered
     300-dpi PDF page images, issues.md C4): the "Pin Functions" table + terminal
     diagram (D/N/NS/J/W 14-pin package, top view) on page 3 -- 1A=1, 1Y=2, 2A=3,
     2Y=4, 3A=5, 3Y=6, GND=7, 4Y=8, 4A=9, 5Y=10, 5A=11, 6Y=12, 6A=13, VCC=14;
     the Function Table (Table 1, page 8): input A=H -> output Y=Hi-Z, A=L -> Y=L
     (i.e. Y=A in positive logic -- NON-inverting -- with the open-collector
     transistor sinking LOW only when A is LOW, releasing to Hi-Z when A is HIGH);
     the positive-logic logic diagram Y=A (page 1); the open-collector output
     schematic (single pull-down transistor to GND, no internal pull-up) in
     Figure 3 (page 8). Ratings for the 74-series SN7407 this entry models, from
     Absolute Maximum + Recommended Operating Conditions (page 4): output
     off-state voltage up to 30 V, low-level output current (IOL) up to 40 mA;
     VOL 0.4 V at IOL 16 mA and 0.7 V at IOL 40 mA, off-state output leakage IOH
     max 0.25 mA at VOH 30 V (Electrical Characteristics, page 5). Typical average
     propagation delay 14 ns and typical power dissipation 145 mW (Description,
     page 1). "Convert TTL voltage levels to MOS levels" use from Features +
     Overview (pages 1, 8). Pinout[] and the six BUFFER gates[] confirmed against
     this; engine left unchanged -- the BUFFER primitive + openCollector:true
     model matches the part (Y=A is computed, then _drivePinOC in simulator.js
     releases a HIGH to Hi-Z and sinks a LOW to GND, with the implicit pull-up
     supplying the HIGH).
     DOC FIX (this pass): the prior entry described the output backwards -- it
     said "a HIGH input turns on the output transistor, sinking current" and that
     1Y "Conducts (pulls LOW) when 1A is HIGH." That is the INVERTING 74x06
     behavior, not the '07. Per the '07 function table (page 8) the non-inverting
     part is the reverse: the transistor sinks (pulls LOW) when the input is LOW,
     and releases (Hi-Z, so the pull-up makes HIGH) when the input is HIGH.
     Pinout[] and gates[] were already correct (BUFFER, not NOT), so this was
     prose-only, not an engine change -- no issues.md hardware-divergence entry
     needed (the 74x09 lesson). Guard added:
     js/debug/scenarios/74x07-hex-buffer-oc.mjs (asserts Y=A per buffer, the OC
     drive class, and the 1A=1/1Y=2 ... input/output pin split).
     Family note (contrast only, to name the siblings): the SN7417 is the 15 V
     version of this same non-inverting hex OC buffer (same 14-pin map, same Y=A
     function); the SN7406/SN7416 are the inverting counterparts (30 V / 15 V);
     the SN5407/SN5417 are the -55..125 C military parts (30 mA IOL). All four
     share the SDLS032H family document above; the in-repo 74x06 entry (this file)
     is independently verified.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x07': {
    name: '74x07',
    simpleName: 'Hex Buffer (OC)',
    description: 'Six non-inverting open-collector buffers/drivers, 30 V / 40 mA (14-pin)',
    guideOverview: 'The 74x07 packs six independent buffers into one 14-pin chip. A buffer just copies its input to its output: the output goes HIGH when the input is HIGH and LOW when it is LOW. That makes the 74x07 the non-inverting counterpart of the inverting 74x06. What sets it apart is the output stage. Each output is open-collector: a single transistor that can only pull its pin down to LOW or switch off and let it float. It cannot drive a HIGH on its own, so you add a pull-up resistor from the output to a supply. When the input is LOW the transistor pulls the pin LOW; when the input is HIGH the transistor lets go and the resistor pulls the pin up, so the pin still reads as a plain copy of the input. Two things make that extra resistor worth it. The transistor is rated to stand off up to 30 V when off and to sink up to 40 mA when on, well beyond an ordinary logic output, so one buffer can switch an LED, a small lamp, or a relay coil directly. And because the pull-up sets the HIGH level, it can go to a rail above 5 V, which lets the same chip lift a 5 V logic signal up to a higher-voltage system (the classic job of driving the higher levels older MOS logic expects). The cost is speed on one edge: the output snaps LOW quickly but climbs back to HIGH only as fast as the pull-up can charge the wire, so its rising edge is slower than a normal push-pull output.',
    guidePinDescriptions: {
      '1A': 'Input of buffer 1. TTL-level logic input, referenced to the 5 V supply.',
      '1Y': 'Open-collector output of buffer 1. Pulled LOW when 1A is LOW; released (an external pull-up makes it HIGH) when 1A is HIGH.',
      '2A': 'Input of buffer 2.',
      '2Y': 'Open-collector output of buffer 2. Released HIGH via the pull-up when 2A is HIGH, otherwise pulled LOW.',
      '3A': 'Input of buffer 3.',
      '3Y': 'Open-collector output of buffer 3. Released HIGH via the pull-up when 3A is HIGH, otherwise pulled LOW.',
      'GND': 'Ground reference (pin 7). Must be common to both the logic supply and the load supply; the output transistors sink into this pin.',
      '4Y': 'Open-collector output of buffer 4. Released HIGH via the pull-up when 4A is HIGH, otherwise pulled LOW.',
      '4A': 'Input of buffer 4.',
      '5Y': 'Open-collector output of buffer 5. Released HIGH via the pull-up when 5A is HIGH, otherwise pulled LOW.',
      '5A': 'Input of buffer 5.',
      '6Y': 'Open-collector output of buffer 6. Released HIGH via the pull-up when 6A is HIGH, otherwise pulled LOW.',
      '6A': 'Input of buffer 6.',
      'VCC': 'Logic supply (+5 V) at pin 14. The output pull-up can go to a separate, higher rail (up to 30 V), which is what lets the chip level-shift and drive high-voltage loads.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn7407.pdf',
    tags: ['buffer', 'driver', 'gate', 'logic', 'hex', 'six', 'open collector', 'non inverting', 'high voltage', '30v', '40ma', 'led', 'relay', 'mos', 'level shift'],
    guideSections: [
      {
        title: 'Non-Inverting Open-Collector Buffer',
        paragraphs: [
          'A buffer copies its input straight through: HIGH in gives HIGH out, LOW in gives LOW out. The 74x07 has six of them, and they are independent, sharing only the power pins, so you can use one or all six in unrelated parts of a circuit.',
          'The catch is the output stage. Instead of a normal push-pull output that drives the pin both ways, each 74x07 output is just one transistor to ground (open collector). It can pull the pin down to LOW or turn off, but it cannot drive a HIGH by itself. To get a HIGH you wire a pull-up resistor from the output to a supply: when the input is LOW the transistor pulls the pin down; when the input is HIGH the transistor turns off and the resistor pulls the pin up. Without that resistor the output can only ever go LOW.',
        ],
        formulas: [
          'Y = A   (non-inverting)',
          'A=0 → transistor ON → Y = LOW (0)',
          'A=1 → transistor OFF (Hi-Z) → pull-up makes Y = HIGH (1)',
        ],
      },
      {
        title: 'High-Voltage, High-Current Driver',
        paragraphs: [
          'The output transistor on the 74x07 (the commercial SN7407) can stand off up to 30 V when it is off and sink up to 40 mA when it is on. That is far more than an ordinary 5 V logic output, so a single buffer can switch an LED, a small lamp, or a relay coil directly instead of needing a separate transistor.',
          'Because the pull-up sets the HIGH level, it can go to a rail higher than 5 V, and the output HIGH then sits at that higher voltage. That lets the same chip shift a 5 V logic signal up to a higher-voltage system (for example the higher levels older MOS logic expects). The logic side still runs at 5 V on VCC; only the pull-up rail changes.',
        ],
        note: 'The 30 V / 40 mA limits are for the 7407. The closely related 74x17 is the 15 V version of the same non-inverting buffer, and the SN5407 military part sinks up to 30 mA. Stay within the rating of the exact part you have; exceeding the output voltage or sink current can destroy it.',
      },
      {
        title: 'Common Uses',
        list: [
          'Driving an LED, indicator lamp, or relay coil from a 12 V or 24 V supply, straight off a 5 V logic signal.',
          'Level-shifting a 5 V logic output up to a higher-voltage logic family such as older MOS.',
          'Buffering a weak signal so it can drive many inputs at once (a buffer strengthens the drive without changing the logic).',
          'Wired-AND bus: tie several open-collector outputs to one pull-up so the shared wire is HIGH only when every buffer has released it, letting the wire itself AND the signals together with no extra gate.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'It needs a pull-up resistor. On its own an open-collector output can only pull LOW; it never drives a HIGH. Forget the pull-up and the output looks stuck LOW or floating. (The simulator supplies an implicit pull-up so the chip works on the breadboard, but real hardware needs a real resistor.)',
          'The rising edge is slow. The transistor pulls LOW fast, but the LOW-to-HIGH edge is only as fast as the pull-up resistor can charge the wire and whatever it feeds. A smaller pull-up is faster but wastes more current; that trade-off is yours to set.',
          'It is non-inverting. If you actually want the signal flipped, reach for the inverting 74x06 (30 V) or 74x16 (15 V). The 74x07 and 74x17 are the non-inverting pair.',
          'No isolation. The chip does not separate the two voltage domains; the load supply and the 5 V logic must share the same ground (pin 7). For a true barrier use an optocoupler.',
          'Driving a relay or other coil? Add a flyback (freewheeling) diode across the coil, or the voltage spike when the buffer switches off can destroy the output transistor.',
        ],
        note: 'Real buffers are not instant. The 7407 has a typical propagation delay around 14 ns, and in a real circuit the LOW-to-HIGH edge also depends on the pull-up resistor and load, so it can be noticeably slower than the fall. The simulator treats the delay as zero and models the pull-up as ideal, both simplifications.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1Y', type: 'output' },
      { pin: 3, name: '2A', type: 'input' },
      { pin: 4, name: '2Y', type: 'output' },
      { pin: 5, name: '3A', type: 'input' },
      { pin: 6, name: '3Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '4Y', type: 'output' },
      { pin: 9, name: '4A', type: 'input' },
      { pin: 10, name: '5Y', type: 'output' },
      { pin: 11, name: '5A', type: 'input' },
      { pin: 12, name: '6Y', type: 'output' },
      { pin: 13, name: '6A', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'BUFFER', inputs: ['1A'], output: '1Y' },
      { type: 'BUFFER', inputs: ['2A'], output: '2Y' },
      { type: 'BUFFER', inputs: ['3A'], output: '3Y' },
      { type: 'BUFFER', inputs: ['4A'], output: '4Y' },
      { type: 'BUFFER', inputs: ['5A'], output: '5Y' },
      { type: 'BUFFER', inputs: ['6A'], output: '6Y' },
    ],
  },

  // ── 7409: Quad 2 input AND (open collector) ─────────────────────────────
  /* Primary source: Texas Instruments, "SN5409, SN54LS09, SN54S09, SN7409,
     SN74LS09, SN74S09 Quadruple 2-Input Positive-AND Gates With Open-Collector
     Outputs," SDLS034 (Dec. 1983, rev. Mar. 1988). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls09.pdf. Verified: standard-DIP
     terminal assignment (D/J/N/W package, top view) 1A=1, 1B=2, 1Y=3, 2A=4,
     2B=5, 2Y=6, GND=7, 3Y=8, 3A=9, 3B=10, 4Y=11, 4A=12, 4B=13, VCC=14 +
     Function Table (each gate: A=H B=H -> Y=H; A=L -> Y=L; B=L -> Y=L) +
     positive-logic logic diagram Y = A·B = NOT(A̅ + B̅) on page 1, the
     open-collector output schematic (single pull-down transistor to GND, no
     internal pull-up) on page 2, and switching characteristics on pages 3-5
     ('09 tPLH 21 ns / tPHL 16 ns typ, RL 400 Ω; 'LS09 tPLH 20 ns / tPHL 17 ns
     typ, RL 2 kΩ; 'S09 tPLH/tPHL 6.5 ns typ, RL 280 Ω, CL 15 pF) -- all read as
     rendered 300-dpi PDF page images (issues.md C4). Recommended VOH max 5.5 V
     and IOL 16 mA ('09) / 8 mA ('LS09) / 20 mA ('S09) from the recommended-
     operating-conditions tables (pages 3-5). Pinout[] and the four AND gates[]
     confirmed against this; engine left unchanged (the AND primitive +
     openCollector:true model matches the part: HiZ when the AND result is HIGH,
     sinks LOW otherwise, with js/simulator.js supplying the implicit pull-up).
     DOC FIX (this pass): the prior entry described the output transistor
     backwards -- it said the transistor "conducts (pulls LOW) when both inputs
     are HIGH" and was "on when the AND result is HIGH." Per the '09 output
     schematic (page 2) and function table (page 1) it is the reverse: the
     transistor pulls LOW when the AND result is LOW (any input LOW) and releases
     (the external pull-up makes the HIGH) when both inputs are HIGH. Pinout[]
     and gates[] were already correct, so this was prose-only, not an engine
     change -- no issues.md hardware-divergence entry needed.
     Push-pull twin (identical AND logic and identical 14-pin map, totem-pole
     output instead of open collector), cited for the "use the 74x08 if you are
     not tying outputs together" contrast: Texas Instruments, SNx408 Quadruple
     2-Input Positive-AND Gates. [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls08.pdf. Not re-read as page images
     this pass; used only to name the twin, whose in-repo 74x08 entry (this
     file) is independently verified. The wired-AND / active-low wired-OR and
     "higher VOH" uses are taken verbatim from the '09 datasheet's own
     description text (page 1: "may be connected to other open-collector outputs
     to implement active-low wired-OR or active-high wired-AND functions ...
     often used to generate higher VOH levels").
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x09': {
    name: '74x09',
    simpleName: 'Quad AND (OC)',
    description: 'Four independent 2 input AND gates, open-collector outputs. (14-pin)',
    guideOverview: 'The 74x09 packs four independent 2 input AND gates into one 14-pin chip, with the same logic and the same pinout as the ordinary 74x08 AND: each gate\'s output goes HIGH only when both of its inputs are HIGH, and LOW otherwise. What makes the 74x09 different is the output stage. A normal (push-pull) output actively drives its pin both ways, up to HIGH and down to LOW. Each 74x09 output is open collector instead: a single transistor that can only pull the pin down to LOW or switch off and let it float. It cannot drive a HIGH by itself, so you add a pull-up resistor from the output to the supply. When the AND result is LOW the transistor pulls the pin down; when the result is HIGH the transistor lets go and the resistor pulls the pin up, so the pin still reads as a plain AND. That extra step buys two things a 74x08 cannot do. You can tie several open collector outputs to one wire sharing a single pull-up: the wire sits HIGH only when every gate has let go, so the wire itself ANDs the gates together (a trick called wired-AND) with no extra chip. And the pull-up can go to a rail a little above the 5 V supply, letting the HIGH level sit somewhat higher than VCC. The cost is speed and drive: the output snaps LOW quickly but climbs back to HIGH only as fast as the resistor can charge the wire, and it holds a HIGH weakly. If you are not tying outputs together, the push-pull 74x08 is the simpler choice.',
    guidePinDescriptions: {
      '1A': 'Input A of AND gate 1.',
      '1B': 'Input B of AND gate 1.',
      '1Y': 'Open-collector output of gate 1. Pulled LOW when either input is LOW; released (the external pull-up makes it HIGH) only when both 1A and 1B are HIGH.',
      '2A': 'Input A of AND gate 2.',
      '2B': 'Input B of AND gate 2.',
      '2Y': 'Open-collector output of gate 2. Released HIGH only when both 2A and 2B are HIGH, otherwise pulled LOW.',
      'GND': 'Ground reference for all four gates (pin 7). Also the return path the output transistors sink into.',
      '3Y': 'Open-collector output of gate 3. Released HIGH only when both 3A and 3B are HIGH, otherwise pulled LOW.',
      '3A': 'Input A of AND gate 3.',
      '3B': 'Input B of AND gate 3.',
      '4Y': 'Open-collector output of gate 4. Released HIGH only when both 4A and 4B are HIGH, otherwise pulled LOW.',
      '4A': 'Input A of AND gate 4.',
      '4B': 'Input B of AND gate 4.',
      'VCC': 'Positive supply (+5 V) at pin 14. The output pull-up resistors usually go here, or to a slightly higher rail.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls09.pdf',
    tags: ['and', 'gate', 'logic', 'quad', 'open collector'],
    guideSections: [
      {
        title: 'AND Gate Logic',
        paragraphs: [
          'Each of the four gates is a plain 2 input AND: its output is HIGH only when both inputs are HIGH, and LOW for every other combination. With two inputs that is exactly one HIGH row in the table below, out of four. This is the same logic as the 74x08, only the output stage differs.',
          'The four gates are completely independent. They share only the power pins (VCC and GND), so you can use one, two, or all four in unrelated parts of a circuit.',
        ],
        formulas: [
          'Y = A AND B',
          'A=0,B=0 → Y=0 | A=0,B=1 → Y=0 | A=1,B=0 → Y=0 | A=1,B=1 → Y=1',
        ],
      },
      {
        title: 'The Open-Collector Output',
        paragraphs: [
          'Open collector means each output pin is the collector of a single transistor whose emitter goes to ground. That transistor can pull the pin down to LOW (about 0.2 V) or switch off and leave the pin floating, but it can never drive the pin HIGH on its own. To get a real HIGH you add a pull-up resistor, commonly a few kΩ, from the output pin to the positive supply.',
          'The gate drives that transistor straight from the AND result. When the AND result is LOW (either input LOW) the transistor turns on and holds the pin LOW. When the AND result is HIGH (both inputs HIGH) the transistor turns off and the pull-up resistor raises the pin to the supply. So at the pin the logic still reads as a plain AND, it just needs the resistor to build the HIGH.',
        ],
        note: 'On real hardware every output you use needs a pull-up (its own, or a shared one, see below); a floating open-collector output with no pull-up sits at an undefined level. This simulator supplies an implicit pull-up on each open-collector output, so a 74x09 output reads HIGH here even if you have not drawn a resistor. That is a convenience of the simulator, on a breadboard you must add the resistor yourself.',
      },
      {
        title: 'Wired-AND: Tying Outputs Together',
        paragraphs: [
          'Because an open-collector output can only pull down or let go, you can safely connect several of them to the same wire. Push-pull outputs cannot do this: if one chip drove the wire HIGH while another drove it LOW they would fight, wasting current and possibly overheating. With open-collector outputs there is no fight, any output that turns on pulls the shared wire LOW, and the wire only floats up to HIGH when every output has let go.',
          'Give that shared wire one pull-up resistor and it becomes a gate for free. The wire is HIGH only when all the connected outputs are HIGH, which is an AND of those outputs, built from a piece of wire and one resistor instead of another chip. This is called a wired-AND. Viewed the other way, with LOW treated as the active state, the same wire is a wired-OR of the active-low signals, the datasheet lists both names. A common use is a shared "all ready" or interrupt line that any device can pull LOW.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Wired-AND: tie several 74x09 outputs to one pull-up so the shared line is HIGH only when every gate agrees, no extra AND chip needed.',
          'Shared status or interrupt line: many sources pull the same line LOW; it floats HIGH only when all of them release it.',
          'Shifting the HIGH level: run the pull-up to a rail a little above VCC (up to about 5.5 V for this family) so the output\'s HIGH sits higher than the chip\'s own supply, something a push-pull 74x08 cannot do.',
          'Sinking a load: the output can pull a modest load to ground (about 16 mA on the standard part), for example an indicator that lights when the AND result is LOW.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'No pull-up, no HIGH. Without a resistor from the output to the supply, the pin can only go LOW or float, it never reaches a real HIGH. Add a pull-up on every output you use, or one shared pull-up for outputs tied together.',
          'Do not leave inputs floating. Like any TTL input, an unused input tends to read HIGH but is noise-sensitive, so tie every input to a defined level. For a gate you are not using at all, tie both its inputs so its output sits in a known state.',
          'The rising edge is slower than the falling edge. The transistor snaps the output LOW, but the climb back to HIGH is only as fast as the pull-up can charge the wire and its stray capacitance. A smaller pull-up is faster but draws more current while the output is LOW, a speed-versus-power trade-off.',
          'It cannot actively source current. A 74x09 output sinks (pulls down) well but leans entirely on the resistor for a HIGH, so it drives a HIGH weakly. If you need a strong push-pull AND and are not tying outputs together, use the 74x08 instead.',
        ],
        note: 'Real gates are not instant. On the original bipolar 74x09 a change takes roughly 16 ns to fall and 21 ns to rise; the common 74LS09 is similar (about 17 ns fall, 20 ns rise) and the fast 74S09 around 6 to 10 ns. The rise figures depend on the pull-up value and load. The simulator treats all of this delay as zero, which is a simplification: it does not reproduce the slower open-collector rising edge or the brief timing glitches (hazards) real propagation delay can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '1Y', type: 'output' },
      { pin: 4, name: '2A', type: 'input' },
      { pin: 5, name: '2B', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '4Y', type: 'output' },
      { pin: 12, name: '4A', type: 'input' },
      { pin: 13, name: '4B', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'AND', inputs: ['1A', '1B'], output: '1Y' },
      { type: 'AND', inputs: ['2A', '2B'], output: '2Y' },
      { type: 'AND', inputs: ['3A', '3B'], output: '3Y' },
      { type: 'AND', inputs: ['4A', '4B'], output: '4Y' },
    ],
  },

  // ── 7411: Triple 3 input AND ────────────────────────────────────────────
  /* Primary source: Texas Instruments, "SN54LS11, SN54S11, SN74LS11, SN74S11
     Triple 3-Input Positive-AND Gates," SDLS131 (Apr. 1985, rev. Mar. 1988).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls11.pdf. Verified:
     standard-DIP terminal assignment (D/J/N/W package, top view) + Function Table
     (each gate: A=H B=H C=H -> Y=H; any input L -> Y=L) + positive-logic logic
     diagram Y = A·B·C = NOT(A̅ + B̅ + C̅) on page 1, and tPLH/tPHL switching
     characteristics on pages 3-4 ('LS11 tPLH 8 ns / tPHL 10 ns typ, 15/20 ns max;
     'S11 tPLH 4.5 ns / tPHL 5 ns typ, 7/7.5 ns max) -- all read as rendered 300-dpi
     PDF page images (issues.md C4). Pinout[] (1A=1, 1B=2, 2A=3, 2B=4, 2C=5, 2Y=6,
     GND=7, 3Y=8, 3A=9, 3B=10, 3C=11, 1Y=12, 1C=13, VCC=14) and the three AND gates[]
     (gate 1 = pins 1/2/13 -> 12, gate 2 = 3/4/5 -> 6, gate 3 = 9/10/11 -> 8)
     confirmed against this; engine left unchanged.
     NOTE: the ceramic FK package (20-terminal leadless chip carrier) shown on page 1
     uses a DIFFERENT pin numbering with NC pads; 74Sim models the standard 14-pin DIP,
     so that variant is intentionally not used (same situation as the 74x02 W package).
     Inverted-output twin (same pinout, NAND instead of AND), cited for the "74x10 is
     the NAND version" note: Texas Instruments, "SN5410, SN54LS10, SN54S10, SN7410,
     SN74LS10, SN74S10 Triple 3-Input Positive-NAND Gates," SDLS035A (Dec. 1983, rev.
     Apr. 2003). [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls10.pdf.
     Verified page 1 (PDF image): identical 14-pin terminal map, output is NOT(A·B·C).
     Open-collector version (same triple-3-input-AND function and identical pin map),
     cited for the "can't tie outputs; use the 74x15" gotcha: TI/Motorola SN54/74LS15
     "Triple 3-Input AND Gate" with open-collector outputs. The live TI symlink
     (sn74ls15.pdf) now 404s (obsolete part); function corroborated by the Motorola
     SN54/74LS15 datasheet ([Online]. Available:
     https://www.alldatasheet.com/datasheet-pdf/pdf/5662/MOTOROLA/SN74LS15.html) and
     74Sim's own verified 74x15 entry (chips2.js), which carries the identical 14-pin map.
     Different-width AND siblings, cited for the "need more/fewer inputs" note: quad
     2-input 74x08 (SN74LS08, same file) and dual 4-input 74x21 -- Texas Instruments,
     "SN54LS21, SN74LS21 Dual 4-Input Positive-AND Gates," SDLS139 (Apr. 1985, rev. Mar.
     1988). [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls21.pdf. Verified
     page 1 (PDF image): two 4-input AND gates, Y = A·B·C·D.
     Propagation delay is modeled as zero (LIVE mode): issues.md A1. */
  '74x11': {
    name: '74x11',
    simpleName: 'Triple 3-in AND',
    description: 'Three independent 3 input AND gates. (14-pin)',
    guideOverview: 'The 74x11 packs three independent 3 input AND gates into one 14-pin chip. An AND gate outputs HIGH only when every input is HIGH; with three inputs, that means all three (A, B, and C) must be HIGH at once, and any single LOW input forces the output LOW. You reach for it when you need to check that three signals are all HIGH at the same time, or to combine three enable or "ready" lines into one, using a single gate instead of chaining two 2 input ANDs. Only three gates fit rather than four, because each gate needs three input pins plus an output, which uses up all 12 signal pins and leaves just the two power pins. The 74x11 is the plain output twin of the 74x10 triple 3 input NAND: same pinout and same three gates, but the 74x11 gives you the AND result directly while the 74x10 gives its inverse. Two specifics are worth knowing. The pinout is not laid out tidily, gates 2 and 3 sit in neat blocks but gate 1 is split, with its inputs on pins 1, 2, and 13 and its output on pin 12 next to VCC, so trace gate 1 before you wire it. And the outputs are ordinary push-pull, so you cannot wire two of them together, use the open-collector 74x15 with a pull-up resistor when you need that.',
    guidePinDescriptions: {
      '1A': 'Input A of AND gate 1.',
      '1B': 'Input B of AND gate 1.',
      '2A': 'Input A of AND gate 2.',
      '2B': 'Input B of AND gate 2.',
      '2C': 'Input C of AND gate 2.',
      '2Y': 'Output of gate 2. HIGH only when 2A, 2B, and 2C are all HIGH.',
      'GND': 'Ground reference for all three gates (pin 7).',
      '3Y': 'Output of gate 3. HIGH only when 3A, 3B, and 3C are all HIGH.',
      '3A': 'Input A of AND gate 3.',
      '3B': 'Input B of AND gate 3.',
      '3C': 'Input C of AND gate 3.',
      '1Y': 'Output of gate 1. HIGH only when 1A, 1B, and 1C are all HIGH (pin 12, up next to VCC).',
      '1C': 'Input C of AND gate 1 (pin 13, across the chip from its A and B inputs).',
      'VCC': 'Positive supply (+5 V) for all three gates, at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls11.pdf',
    tags: ['and', 'gate', 'logic', 'triple', 'three', '3 input'],
    guideSections: [
      {
        title: '3-Input AND Logic',
        paragraphs: [
          'An AND gate outputs HIGH only when every input is HIGH. This one has three inputs, so all three (A, B, and C) must be HIGH at the same time for the output to go HIGH. If any single input is LOW, the output is LOW. Out of the eight possible input combinations, exactly one, all three HIGH, gives a HIGH output.',
          'The three gates are completely independent. They share only the power pins (VCC and GND), so you can use one, two, or all three in unrelated parts of a circuit.',
        ],
        formulas: [
          'Y = A AND B AND C',
          'ABC=000 → Y=0 | 001 → 0 | 010 → 0 | 011 → 0 | 100 → 0 | 101 → 0 | 110 → 0 | 111 → 1',
        ],
      },
      {
        title: 'Three Inputs Instead of Two',
        paragraphs: [
          'A single 3 input AND does in one gate what would otherwise take two 2 input ANDs wired in series: first A AND B, then that result AND C. Using one gate means less wiring, one propagation delay instead of two, and a spare gate left over.',
          'The 74x11 is the plain-output twin of the 74x10 triple 3 input NAND. They share the exact same pinout and the same three gates; the only difference is the output stage. The 74x11 gives A AND B AND C directly, while the 74x10 gives its inverse, NOT(A AND B AND C). If you need the AND but only have a 74x10 on hand, follow one of its gates with an inverter.',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Detecting a specific 3-bit condition: feed three signals (or three bits of a bus) into one gate to get a single HIGH when all three are HIGH at once, for example one line of an address decoder.',
          'Combining enables: AND together three separate enable or "ready" signals so a downstream block turns on only when all three conditions are met.',
          'Widening an AND: when a 74x08 gate runs out of inputs at two, one 74x11 gate ANDs three signals without chaining gates together.',
          'Standing in for a 3-input AND you would otherwise build from a 74x10 NAND plus an inverter.',
        ],
      },
      {
        title: 'Things That Trip People Up',
        list: [
          'Do not leave inputs floating. On bipolar TTL a floating input tends to read HIGH but is noise-sensitive. Tie any unused input of a gate you are using to VCC (HIGH), which keeps it from holding the AND output LOW and effectively turns a 3-input gate into a 2-input one. For a gate you are not using at all, tie its inputs to a known level so its output sits in a defined state.',
          'Watch the split pinout of gate 1. Gates 2 and 3 have their pins grouped together, but gate 1\'s inputs are on pins 1, 2, and 13 and its output is on pin 12, up beside VCC. It is an easy gate to miswire, so trace it before you build.',
          'The outputs are push-pull (totem-pole), not open-collector. Do not wire two 74x11 outputs together, that pits the two output drivers against each other and can overheat the chip. When you need to tie AND outputs onto a shared line (wired-AND), use the open-collector 74x15 with a pull-up resistor.',
          'Need a different number of inputs? The 74x08 is a quad 2-input AND and the 74x21 a dual 4-input AND, same AND logic, different gate widths.',
        ],
        note: 'Real gates are not instant. A change takes a short time to travel from input to output, roughly 8 to 10 ns on the common 74LS11 and about 4 to 5 ns on the faster 74S11. The simulator treats this delay as zero, which is a simplification: it does not reproduce the brief timing glitches (hazards) that real propagation delay can cause.',
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '2A', type: 'input' },
      { pin: 4, name: '2B', type: 'input' },
      { pin: 5, name: '2C', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '3C', type: 'input' },
      { pin: 12, name: '1Y', type: 'output' },
      { pin: 13, name: '1C', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'AND', inputs: ['1A', '1B', '1C'], output: '1Y' },
      { type: 'AND', inputs: ['2A', '2B', '2C'], output: '2Y' },
      { type: 'AND', inputs: ['3A', '3B', '3C'], output: '3Y' },
    ],
  },

  // ── 7412: Triple 3 input NAND (open collector) ─────────────────────────
  '74x12': {
    name: '74x12',
    simpleName: 'Triple 3-in NAND (OC)',
    description: 'Three 3 input NAND gates with open collector outputs. (14-pin)',
    guideOverview: 'The 74x12 combines three 3 input NAND gates with open collector outputs. The output is LOW only when all three inputs are HIGH; otherwise the open collector output is high impedance. Requires pull up resistors. Allows wire ANDing and interfacing to higher voltage loads.',
    guidePinDescriptions: {
      '1A': 'Input A of NAND gate 1.',
      '1B': 'Input B of NAND gate 1.',
      '2A': 'Input A of NAND gate 2.',
      '2B': 'Input B of NAND gate 2.',
      '2C': 'Input C of NAND gate 2.',
      '2Y': 'Open collector output of gate 2. LOW when 2A, 2B, and 2C are all HIGH.',
      'GND': 'Ground reference (pin 7).',
      '3A': 'Input A of NAND gate 3.',
      '3B': 'Input B of NAND gate 3.',
      '3C': 'Input C of NAND gate 3.',
      '3Y': 'Open collector output of gate 3.',
      '1Y': 'Open collector output of gate 1.',
      '1C': 'Input C of NAND gate 1.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls12.pdf',
    tags: ['nand', 'gate', 'logic', 'triple', 'three', '3 input', 'open collector', 'open collector', 'wired and'],
    guideSections: [
      {
        title: 'Open Collector 3-Input NAND',
        paragraphs: [
          'Logic function: Y = NOT(A AND B AND C). The output pulls LOW only when all three inputs are HIGH. An external pull up resistor is required for each output.',
          'Wire ANDing: connect multiple open collector NAND outputs to the same node with one pull up to AND all NAND results.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input' },
      { pin: 2, name: '1B', type: 'input' },
      { pin: 3, name: '2A', type: 'input' },
      { pin: 4, name: '2B', type: 'input' },
      { pin: 5, name: '2C', type: 'input' },
      { pin: 6, name: '2Y', type: 'output' },
      { pin: 7, name: 'GND', type: 'power' },
      { pin: 8, name: '3Y', type: 'output' },
      { pin: 9, name: '3A', type: 'input' },
      { pin: 10, name: '3B', type: 'input' },
      { pin: 11, name: '3C', type: 'input' },
      { pin: 12, name: '1Y', type: 'output' },
      { pin: 13, name: '1C', type: 'input' },
      { pin: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B', '1C'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B', '2C'], output: '2Y' },
      { type: 'NAND', inputs: ['3A', '3B', '3C'], output: '3Y' },
    ],
  },

  // ── 7413: Dual 4 input NAND (Schmitt trigger) ──────────────────────────
  /* Primary source: Texas Instruments, SN74LS13 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74ls13.pdf
     Schmitt trigger hysteresis: Wikipedia contributors, "Schmitt trigger." Available: https://en.wikipedia.org/wiki/Schmitt_trigger */
  '74x13': {
    name: '74x13',
    simpleName: 'Dual 4-in NAND (Schmitt)',
    description: 'Dual 4 input NAND gate with Schmitt trigger inputs. (14-pin)',
    schmittInputs: true,
    guideOverview: 'The 74x13 provides two independent 4 input NAND gates where every input passes through a Schmitt trigger. A Schmitt trigger uses two different threshold voltages a higher one for switching HIGH→LOW and a lower one for switching LOW→HIGH creating hysteresis. This makes the inputs immune to slow transitions, noise, and ringing on input signals, especially useful for capacitive RC inputs or mechanical switch debouncing.',
    guidePinDescriptions: {
      '1A': 'Schmitt trigger input A of NAND gate 1.',
      '1B': 'Schmitt trigger input B of NAND gate 1.',
      'NC': 'Not connected leave unconnected.',
      '1C': 'Schmitt trigger input C of NAND gate 1.',
      '1D': 'Schmitt trigger input D of NAND gate 1.',
      '1Y': 'Output of gate 1. LOW only when all four inputs are HIGH.',
      'GND': 'Ground reference (pin 7).',
      '2Y': 'Output of gate 2. LOW only when all four inputs are HIGH.',
      '2A': 'Schmitt trigger input A of NAND gate 2.',
      '2B': 'Schmitt trigger input B of NAND gate 2.',
      '2C': 'Schmitt trigger input C of NAND gate 2.',
      '2D': 'Schmitt trigger input D of NAND gate 2.',
      'VCC': 'Positive supply (+5 V) at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls13.pdf',
    tags: ['nand', 'gate', 'logic', 'dual', '4 input', 'schmitt', 'schmitt trigger', 'hysteresis'],
    guideSections: [
      {
        title: 'Schmitt Trigger Inputs',
        paragraphs: [
          'Standard TTL inputs switch at a single threshold voltage (~1.4 V). A Schmitt trigger uses two thresholds: V_T+ (positive going) and V_T- (negative going), where V_T+ > V_T-. The output only switches once the input voltage crosses the appropriate threshold in the correct direction, ignoring noise below the hysteresis band.',
          'Slow or noisy rising/falling edges will not cause multiple output transitions the output switches cleanly once and stays there.',
        ],
        formulas: [
          'Hysteresis = V_T+ − V_T−  (typically ~0.8 V for the LS13)',
        ],
        note: 'Tie unused inputs to VCC to prevent them from pulling the output to an unknown state.',
      },
      {
        title: 'Common Uses',
        list: [
          'Debouncing mechanical switches connected through an RC filter.',
          'Receiving slow rise-time signals from sensors or long cable runs.',
          'Building relaxation oscillators with an RC network.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Gate 1 input A' },
      { pin: 2, name: '1B', type: 'input', description: 'Gate 1 input B' },
      { pin: 3, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 4, name: '1C', type: 'input', description: 'Gate 1 input C' },
      { pin: 5, name: '1D', type: 'input', description: 'Gate 1 input D' },
      { pin: 6, name: '1Y', type: 'output', description: 'Gate 1 NAND output' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '2Y', type: 'output', description: 'Gate 2 NAND output' },
      { pin: 9, name: '2A', type: 'input', description: 'Gate 2 input A' },
      { pin: 10, name: '2B', type: 'input', description: 'Gate 2 input B' },
      { pin: 11, name: 'NC', type: 'nc', description: 'Not connected' },
      { pin: 12, name: '2C', type: 'input', description: 'Gate 2 input C' },
      { pin: 13, name: '2D', type: 'input', description: 'Gate 2 input D' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A', '1B', '1C', '1D'], output: '1Y' },
      { type: 'NAND', inputs: ['2A', '2B', '2C', '2D'], output: '2Y' },
    ],
  },

  // ── 7414: Hex Schmitt-Trigger Inverter ──────────────────────────────────
  /* Source: Texas Instruments, "SNx414 and SNx4LS14 Hex Schmitt-Trigger Inverters,"
     SDLS049C (Dec. 1983, rev. Nov. 2016). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/sn74ls14.pdf. Verified: 14-pin standard-DIP
     terminal assignment (D/DB/N/NS/J/W package, top view) + Pin Functions table on
     page 3, single-input function table Y = NOT A (A=H -> Y=L, A=L -> Y=H) on
     page 13, and the VT+/VT- Schmitt thresholds + hysteresis on page 5 -- all read
     as rendered PDF page images (issues.md C4). Verified thresholds at VCC=5 V,
     TA=25 C (typ): SN7414 VT+ 1.7 V (1.5-2.0), VT- 0.9 V (0.6-1.1); SN74LS14
     VT+ 1.6 V (1.4-1.9), VT- 0.8 V (0.5-1.0); hysteresis (VT+ - VT-) 0.8 V typ,
     0.4 V min. Switching tPLH/tPHL 15 ns typ / 22 ns max (LS14, page 5). pinout[]
     and the six NOT gates[] confirmed against this; engine left unchanged. The
     default 74Sim family (LS) uses VT+ = 1.6 V / VT- = 0.8 V (js/constants.js),
     matching the LS14 column above; the simulator models the two thresholds with
     per-input latched state and reads a real capacitor on the input net, so an RC
     oscillator built here actually oscillates (js/simulator.js _readSchmittBit).
     NOTE: the 20-pin LCCC "FK package" on page 3 uses a DIFFERENT pin-number map
     (NC pins, VCC=20, GND=10); 74Sim models the standard 14-pin DIP, so that
     variant is intentionally not used.
     Oscillator f ~= 1/(1.2*R*C): follows from the RC charge/discharge between VT+
     and VT- with realistic LS output levels (VOH ~3.4 V, VOL ~0.2 V); approximate
     and family-dependent, treated as a rule of thumb, not a datasheet spec.
     Schmitt-trigger noise-immunity background: Wikipedia contributors, "Schmitt
     trigger." [Online]. Available: https://en.wikipedia.org/wiki/Schmitt_trigger.
     Trusted only for the general hysteresis / noise-immunity explanation. */
  '74x14': {
    name: '74x14',
    simpleName: 'Hex NOT (Schmitt)',
    description: 'Six independent Schmitt-trigger inverters. (14-pin)',
    schmittInputs: true,
    guideOverview: 'The 74x14 packs six inverters into one 14-pin chip, but with a twist: every input is a Schmitt trigger. A plain inverter like the 74x04 switches at a single voltage, so a slow or noisy input that lingers near that point makes the output chatter, flipping back and forth on every little wiggle. A Schmitt trigger fixes this by using two thresholds instead of one. Coming up from LOW, the input has to climb past an upper threshold (about 1.6 V) before the chip accepts it as HIGH; coming back down, it has to fall past a lower threshold (about 0.8 V) before the chip accepts it as LOW. The gap between them is called hysteresis, and it means small wobbles in between are ignored. You reach for a 74x14 to turn a slow or noisy signal into a clean digital edge (a button through an RC filter, a slow sensor ramp, a signal that has traveled down a long wire), and to build a simple square-wave oscillator from one gate, one resistor, and one capacitor. Logically it is still six NOT gates: HIGH in gives LOW out.',
    guidePinDescriptions: {
      '1A': 'Schmitt-trigger input of inverter 1.',
      '1Y': 'Output of inverter 1. Inverts 1A: HIGH when 1A is LOW.',
      '2A': 'Schmitt-trigger input of inverter 2.',
      '2Y': 'Output of inverter 2. Inverts 2A: HIGH when 2A is LOW.',
      '3A': 'Schmitt-trigger input of inverter 3.',
      '3Y': 'Output of inverter 3. Inverts 3A: HIGH when 3A is LOW.',
      'GND': 'Ground reference for all six inverters (pin 7).',
      '4Y': 'Output of inverter 4. Inverts 4A: HIGH when 4A is LOW.',
      '4A': 'Schmitt-trigger input of inverter 4.',
      '5Y': 'Output of inverter 5. Inverts 5A: HIGH when 5A is LOW.',
      '5A': 'Schmitt-trigger input of inverter 5.',
      '6Y': 'Output of inverter 6. Inverts 6A: HIGH when 6A is LOW.',
      '6A': 'Schmitt-trigger input of inverter 6.',
      'VCC': 'Positive supply (+5 V) for all six inverters, at pin 14.',
    },
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74ls14.pdf',
    tags: ['not', 'inverter', 'gate', 'logic', 'hex', 'schmitt', 'schmitt trigger', 'hysteresis', 'oscillator'],
    guideSections: [
      {
        title: 'Schmitt-Trigger Inverter Logic',
        paragraphs: [
          'Logically the 74x14 is six inverters: each output is the opposite of its input. What makes it special is how each input decides between HIGH and LOW. An ordinary gate uses one threshold voltage: anything above reads HIGH, anything below reads LOW. The 74x14 uses two.',
          'Coming up from a LOW input, the voltage must rise past the upper threshold V_T+ before the chip treats it as HIGH (and drives the output LOW). Coming down from a HIGH input, it must fall past the lower threshold V_T− before the chip treats it as LOW. Between the two thresholds the output does not change; it holds whatever it last decided. That memory band is the hysteresis, and it is what lets the output ignore small noise riding on the signal.',
        ],
        formulas: [
          'Y = NOT A',
          'A=0 → Y=1 | A=1 → Y=0',
          'V_T+ ≈ 1.6 V, V_T− ≈ 0.8 V (74LS14 typical at 5 V), hysteresis ≈ 0.8 V',
        ],
        note: 'The plain 7414 sits slightly higher (V_T+ ≈ 1.7 V, V_T− ≈ 0.9 V), and CMOS HC parts scale their thresholds with the supply voltage. These are typical numbers; the datasheet only guarantees wider min/max limits.',
      },
      {
        title: 'Why the Two Thresholds Matter',
        paragraphs: [
          'Feed a slowly rising signal into a plain inverter and, as it creeps through the single switching point, any noise on it crosses back and forth, so the output stutters out several pulses instead of one clean edge. The 74x14 swallows that noise: once the output has flipped, the input has to travel all the way back across the other threshold to flip it again.',
          'This is why the part turns up wherever a signal is slow, noisy, or degraded: squaring up the output of a slow sensor, restoring a signal that has traveled down a long wire, or debouncing a mechanical switch through a resistor and capacitor before it reaches the rest of a logic circuit.',
        ],
      },
      {
        title: 'One-Gate RC Oscillator',
        paragraphs: [
          'Because a Schmitt inverter snaps cleanly at each threshold, one gate plus one resistor and one capacitor makes a square-wave oscillator. Wire the output back through resistor R to the input, and connect capacitor C from that input to ground. The capacitor charges toward the output through R until it reaches V_T+, the output snaps LOW, the capacitor discharges until it reaches V_T−, the output snaps HIGH, and the cycle repeats.',
        ],
        formulas: [
          'f ≈ 1 / (1.2 × R × C)   (approximate, 74x14)',
        ],
        note: 'The 1.2 factor comes from how far the capacitor swings between the two thresholds, so the real frequency shifts a little from part to part; trim R to tune it. The TTL/LS version draws current at its input, so keep R small (the datasheet oscillator uses 330 Ω); the CMOS HC14 works with much larger resistors. 74Sim does model the two thresholds and a capacitor on the input, so an oscillator built on the breadboard here actually runs.',
      },
      {
        title: 'Common Uses',
        list: [
          'Cleaning up slow or noisy signals into crisp digital edges.',
          'Debouncing a mechanical switch through an RC filter.',
          'A one-gate square-wave oscillator, useful from well below 1 Hz up to a few MHz.',
          'Receiving a signal sent down a long wire, where the edges have been rounded off.',
          'A plain inverter when you want the extra noise margin for free.',
        ],
      },
      {
        title: 'Gotchas',
        list: [
          'The outputs are push-pull, like the 74x04: never wire two of them together.',
          'Inputs and outputs alternate down the package (1A, 1Y, 2A, 2Y, ...), so it is easy to wire an input where you meant an output. Trace each gate before you build.',
          'Do not leave an unused input floating; tie it to VCC or GND.',
          'Hysteresis buys noise immunity, not infinite patience: a signal that stalls between the two thresholds leaves the output holding its last state, not switching.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1A', type: 'input', description: 'Inverter 1 input' },
      { pin: 2, name: '1Y', type: 'output', description: 'Inverter 1 output (NOT 1A)' },
      { pin: 3, name: '2A', type: 'input', description: 'Inverter 2 input' },
      { pin: 4, name: '2Y', type: 'output', description: 'Inverter 2 output (NOT 2A)' },
      { pin: 5, name: '3A', type: 'input', description: 'Inverter 3 input' },
      { pin: 6, name: '3Y', type: 'output', description: 'Inverter 3 output (NOT 3A)' },
      { pin: 7, name: 'GND', type: 'power', description: 'Ground (0V)' },
      { pin: 8, name: '4Y', type: 'output', description: 'Inverter 4 output (NOT 4A)' },
      { pin: 9, name: '4A', type: 'input', description: 'Inverter 4 input' },
      { pin: 10, name: '5Y', type: 'output', description: 'Inverter 5 output (NOT 5A)' },
      { pin: 11, name: '5A', type: 'input', description: 'Inverter 5 input' },
      { pin: 12, name: '6Y', type: 'output', description: 'Inverter 6 output (NOT 6A)' },
      { pin: 13, name: '6A', type: 'input', description: 'Inverter 6 input' },
      { pin: 14, name: 'VCC', type: 'power', description: 'Positive supply (+5V)' },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },
};
