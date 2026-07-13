// CMOS 4000-series coverage — CD4055 (BCD-to-7-segment LCD decoder/driver with
// a Display-Frequency output).
//
// Shipped in its own standalone block (CHIPS_BLOCK_168) to avoid colliding with
// other agents adding chips in the same working tree (Coverage-Plan §4, Batch 15).
//
// ── What the part is ─────────────────────────────────────────────────────────
// The CD4055B takes a 4-bit BCD code (A..D) and lights the seven bars of a single
// display digit (a..g). Unlike the CD4056B sibling it has NO input latch/strobe
// and NO blanking pin — the decode is purely combinational. It decodes all sixteen
// input codes: 0-9 plus L, H, P, A, "-", and a blank. A DISPLAY-FREQUENCY (DF)
// input sets the output polarity, and a DISPLAY-FREQUENCY OUT (DFO) pin gives back
// a buffered copy of DF for driving a liquid-crystal display's common backplane.
//
// ── DF / DFO, and what 74Sim does vs does not model ──────────────────────────
// DF behaves exactly like the CD4543's Ph (phase) pin: DF=LOW makes the SELECTED
// segments drive HIGH (active-HIGH, e.g. common-cathode LED use); DF=HIGH inverts
// every output so selected segments drive LOW (common-anode use). On real silicon
// a ~30 Hz square wave on DF makes selected segments swing 180° out of phase with
// the backplane (which is fed from DFO), developing the AC voltage that darkens an
// LCD segment, while unselected segments stay in phase (no net voltage). 74Sim
// resolves nets to static logic levels, so it models the static HIGH/LOW polarity
// (the useful, learnable behavior — it drives the existing 7-segment display widget
// like the CD4543 does) but NOT the AC-phase / across-glass LCD drive (issues.md A3).
// This is why it is a WORKING chip here, whereas the CD4054 (loose LCD segments,
// no decode, no 7-seg widget) is an info-sheet stub: the CD4055 is functionally a
// BCD-to-7-segment decoder, and that part is fully representable. DFO is modeled as
// a buffered copy of DF IN (same phase).
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4054B, CD4055B, CD4056B Types — CMOS Liquid-Crystal Display Drivers,
//   High-Voltage Types (20-Volt Rating)", SCHS048C (Revised October 2003).
//   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4054b.pdf.
//   Verified: "CD4055B Terminal Assignment" (16-pin DIP, drawing 92CS-24486) and
//   "Fig. 2 — CD4055B functional diagram" for the pinout, plus the "TRUTH TABLE
//   FOR CD4055B and CD4056B" (all 16 input codes → segments a-g + display char)
//   and the DISPLAY-FREQUENCY polarity paragraph on page 1, read as 300-dpi
//   rendered PDF page images (issues.md C4 — NOT the text summarizer). NOT cloned
//   from the CD4054B / CD4056B siblings on the same datasheet (issues.md C2): the
//   CD4054B has four loose strobed segment latches and no BCD decode, and the
//   CD4056B adds a STROBE-latch on pin 1 in place of the CD4055B's DISPLAY-FREQ OUT.
//   Verified 16-pin DIP map: DISPLAY FREQ OUT=1, 2²(C)=2, 2¹(B)=3, 2³(D)=4,
//   2⁰(A)=5, DISPLAY FREQ IN=6, VEE=7, VSS=8, a=9, b=10, c=11, d=12, e=13, g=14,
//   f=15, VDD=16.
//   Verified function: combinational BCD→7-seg decode of all 16 codes (0-9, L, H,
//   P, A, "-", blank). DF=LOW → selected segments HIGH; DF=HIGH → all outputs
//   inverted. DFO = buffered DF IN.

export const CHIPS_BLOCK_168 = {
  // ── CD4055: BCD to 7-Segment LCD Decoder/Driver with Display-Frequency Output ──
  'CD4055': {
    name: 'CD4055',
    simpleName: 'BCD to 7 Segment LCD Decoder/Driver',
    description: 'BCD to 7-seg LCD decoder/driver, DF output, no latch, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4054b.pdf',
    tags: ['cmos', '4000 series', 'decoder', '7 segment', 'BCD decoder', 'display driver', 'LCD', 'lcd driver', 'level shifter'],
    guideOverview: 'The CD4055 converts a 4 bit BCD code (A D) into the seven segment drive signals (a g) for a single display digit. It decodes every one of the 16 input codes: 0 through 9, plus the characters L, H, P, A, a dash, and a blank. There is no input latch and no blanking pin, so the segment outputs follow the BCD inputs in real time. The Display Frequency (DF) input sets output polarity: DF=LOW drives the selected segments HIGH (suits a common cathode LED display), and DF=HIGH inverts every output so the selected segments go LOW (suits a common anode display). The chip is built for liquid-crystal displays: when DF carries the square wave used on an LCD\'s common backplane, a selected segment swings out of phase with the backplane (an AC voltage appears across the liquid crystal and the segment turns dark) while an unselected segment stays in phase (no voltage, segment stays clear). The Display Frequency Out (DFO) pin gives back a buffered copy of DF to drive that backplane and to cascade to a CD4054. NOTE: 74Sim is a functional digital-logic simulator. It models the static polarity DF sets (so the chip drives a normal 7-segment display like the CD4543 does), but it does not model the AC, phase-based liquid-crystal drive — DF is treated as a fixed level, not a free-running square wave.',
    guidePinDescriptions: {
      DFO: 'Display Frequency Out (pin 1). Buffered copy of the DF input. On hardware it drives the LCD common backplane and cascades the phase signal to a CD4054.',
      C:   'BCD input bit 2 (weight 4).',
      B:   'BCD input bit 1 (weight 2).',
      D:   'BCD input bit 3 (weight 8, MSB).',
      A:   'BCD input bit 0 (weight 1, LSB).',
      DF:  'Display Frequency / phase select (pin 6). LOW = selected segments drive HIGH (common cathode). HIGH = outputs inverted, selected segments drive LOW (common anode). On hardware, a square wave here AC-drives a liquid-crystal display.',
      VEE: 'Negative output-driver supply (pin 7). Sets the low end of the level-shifted segment swing; VDD minus VEE can reach 18 V for high-voltage LCD drive. 74Sim has no sub-ground rail, so VEE is informational — tie to VSS for ordinary use.',
      VSS: 'Logic ground / negative logic supply (pin 8).',
      a:   'Segment a output (top horizontal bar).',
      b:   'Segment b output (upper right vertical bar).',
      c:   'Segment c output (lower right vertical bar).',
      d:   'Segment d output (bottom horizontal bar).',
      e:   'Segment e output (lower left vertical bar).',
      g:   'Segment g output (middle horizontal bar).',
      f:   'Segment f output (upper left vertical bar).',
      VDD: 'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    pinout: [
      { pin:  1, name: 'DFO', type: 'output', description: 'Display Frequency Out — buffered copy of DF (drives the LCD backplane / cascades to a CD4054).' },
      { pin:  2, name: 'C',   type: 'input',  description: 'BCD input bit 2 (weight 4).' },
      { pin:  3, name: 'B',   type: 'input',  description: 'BCD input bit 1 (weight 2).' },
      { pin:  4, name: 'D',   type: 'input',  description: 'BCD input bit 3 (weight 8).' },
      { pin:  5, name: 'A',   type: 'input',  description: 'BCD input bit 0 (weight 1).' },
      { pin:  6, name: 'DF',  type: 'input',  description: 'Display Frequency / phase select. LOW = selected segments HIGH; HIGH = outputs inverted.' },
      { pin:  7, name: 'VEE', type: 'power',  description: 'Negative output-driver supply (level-shift low rail; informational in 74Sim — tie to VSS).' },
      { pin:  8, name: 'VSS', type: 'power',  description: 'Logic ground / negative logic supply.' },
      { pin:  9, name: 'a',   type: 'output', description: 'Segment a (top horizontal).' },
      { pin: 10, name: 'b',   type: 'output', description: 'Segment b (upper right vertical).' },
      { pin: 11, name: 'c',   type: 'output', description: 'Segment c (lower right vertical).' },
      { pin: 12, name: 'd',   type: 'output', description: 'Segment d (bottom horizontal).' },
      { pin: 13, name: 'e',   type: 'output', description: 'Segment e (lower left vertical).' },
      { pin: 14, name: 'g',   type: 'output', description: 'Segment g (middle horizontal).' },
      { pin: 15, name: 'f',   type: 'output', description: 'Segment f (upper left vertical).' },
      { pin: 16, name: 'VDD', type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Combinational decode; DF maps to polarity exactly like the CD4543 Ph pin, but
    // the CD4055B decodes 10-15 to L/H/P/A/"-"/blank (the CD4543 blanks them) and has
    // a DISPLAY-FREQ OUT pin and no latch/blanking — hence its own primitive
    // BCD_7SEG_4055 (defined in js/specificChipsSim.js), not the BCD_7SEG_4543 type.
    // Pin/name order: A=2^0(pin5) B=2^1(pin3) C=2^2(pin2) D=2^3(pin4), DF=pin6;
    // outputs a,b,c,d,e,f,g then DFO (pin1).
    gates: [
      { type: 'BCD_7SEG_4055', inputs: ['A', 'B', 'C', 'D', 'DF'], outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'DFO'] },
    ],
    guideSections: [
      {
        title: 'BCD to 7 Segment Decoding',
        paragraphs: [
          'A single digit on a 7-segment display is made of seven bars, labeled a through g. The CD4055 reads a 4-bit BCD code on inputs A (weight 1) through D (weight 8) and turns on exactly the bars needed to draw that value. There is no input latch and no blanking pin, so the display follows the inputs as they change.',
          'It decodes all 16 possible codes, not just 0 through 9. Codes 0 through 9 draw the digits. Codes 10 through 15 draw L, H, P, A, a dash, and a blank (nothing lit). That extra set lets the chip show simple letters or status characters without a separate decoder.',
        ],
        list: [
          'Common cathode LED display: tie DF to GND. Segment outputs go HIGH for lit bars and drive the LED anodes through current-limiting resistors.',
          'Common anode LED display: tie DF to VDD. Every output inverts, so lit bars are driven LOW to sink current from the common anode.',
          'Liquid-crystal display: drive DF with the backplane square wave and wire DFO to the display common (see the next section).',
        ],
      },
      {
        title: 'Driving a liquid-crystal display',
        paragraphs: [
          'A liquid-crystal segment darkens when an AC voltage is applied across it and clears when there is none. Steady DC damages it, so it is never driven with a fixed level. Instead the display\'s common backplane is fed a square wave (around 30 Hz), and each segment is driven with either the same square wave or its inverse.',
          'DF carries that backplane square wave into the chip, and DFO sends a buffered copy back out to drive the display common. For a SELECTED segment the output swings opposite to the backplane, so the two sides differ and an AC voltage appears across the crystal — the bar goes dark. For an UNSELECTED segment the output matches the backplane, both sides move together, there is no voltage difference, and the bar stays clear.',
          'The outputs are level-shifted between VDD and VEE so the drive can be larger than the logic supply (up to 18 V across VDD to VEE), which suits larger or lower-contrast displays without an external capacitor.',
        ],
        note: '74Sim models the static polarity that DF sets (DF=LOW gives active-HIGH segment outputs, DF=HIGH inverts them), so the chip drives a normal 7-segment display in the simulator just like the CD4543. It does not model the AC, phase-based liquid-crystal drive — DF is treated as a fixed level, not a free-running square wave.',
      },
      {
        title: 'How it compares to its siblings',
        paragraphs: [
          'The CD4055 is one of three related LCD drivers on the same datasheet. The CD4054 drives four loose segments (decimal points, colons, annunciators) with no BCD decoding. The CD4056 is the same 7-segment decoder as the CD4055 but adds a strobed input latch (pin 1) to hold a digit, in place of the CD4055\'s Display-Frequency Out pin. The CD4543 (also in 74Sim) is a close relative with a latch and a blanking input, but it blanks codes 10 through 15 instead of showing letters.',
        ],
      },
    ],
  },
};
