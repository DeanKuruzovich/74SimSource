// CMOS 4000-series coverage — CD4056 (BCD-to-7-segment LCD decoder/driver with
// a strobed input latch).
//
// Shipped in its own standalone block (CHIPS_BLOCK_169) to avoid colliding with
// other agents adding chips in the same working tree (Coverage-Plan §4, Batch 15).
//
// ── What the part is ─────────────────────────────────────────────────────────
// The CD4056B takes a 4-bit BCD code (A..D) and lights the seven bars of a single
// display digit (a..g). It is the sibling of the CD4055B: same combinational
// BCD→7-seg decode of all sixteen input codes — 0-9 plus L, H, P, A, "-", and a
// blank — but the CD4056B adds an input STROBE latch (pin 1) to freeze a digit,
// in place of the CD4055B's DISPLAY-FREQUENCY OUT pin. A DISPLAY-FREQUENCY (DF)
// input (pin 6) sets the output polarity. There is no blanking pin.
//
// ── STROBE latch ─────────────────────────────────────────────────────────────
// STROBE HIGH = transparent (the decoded segments follow the BCD inputs in real
// time); STROBE LOW = the data is latched and the display holds whatever digit
// was present when STROBE last went LOW. Note this is the OPPOSITE polarity to
// the CD4543's Latch Enable (LE LOW = transparent), so the CD4056 cannot reuse
// the CD4543 primitive.
//
// ── DF, and what 74Sim does vs does not model ────────────────────────────────
// DF behaves exactly like the CD4543's Ph (phase) pin: DF=LOW makes the SELECTED
// segments drive HIGH (active-HIGH, e.g. common-cathode LED use); DF=HIGH inverts
// every output so selected segments drive LOW (common-anode use). On real silicon
// a ~30 Hz square wave on DF makes a selected segment swing 180° out of phase with
// the backplane, developing the AC voltage that darkens an LCD segment, while an
// unselected segment stays in phase (no net voltage). 74Sim resolves nets to
// static logic levels and has only idealized clocks (issues.md A3), so it models
// the static HIGH/LOW polarity (the useful, learnable behavior — it drives the
// existing 7-segment display widget like the CD4543 does) but NOT the AC-phase /
// across-glass LCD drive. This is why it is a WORKING chip here, whereas the
// CD4054 (loose LCD segments, no decode, no 7-seg widget) is an info-sheet stub:
// the CD4056 is functionally a BCD-to-7-segment decoder, and that part is fully
// representable. (This is a deliberate divergence from the issues.md C19 note,
// which had preemptively grouped CD4055/CD4056 with the CD4054 stub; recorded in
// issues.md.)
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4054B, CD4055B, CD4056B Types — CMOS Liquid-Crystal Display Drivers,
//   High-Voltage Types (20-Volt Rating)", SCHS048C (Revised October 2003).
//   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4056b.pdf.
//   Verified: "CD4056B Terminal Assignment" (16-pin DIP, drawing 92CS-24487) and
//   "Fig. 3 — CD4056B functional diagram" for the pinout; the "TRUTH TABLE FOR
//   CD4055B and CD4056B" (all 16 input codes → segments a-g + display char); the
//   STROBE-latch paragraph and DISPLAY-FREQUENCY polarity text on page 1; and the
//   "CD4054B TRUTH TABLE" (ST=1 → output follows, ST=0 → hold) — all read as
//   300-dpi rendered PDF page images (issues.md C4 — NOT the text summarizer).
//   NOT cloned from the CD4543 / CD4054B / CD4055B siblings (issues.md C2): the
//   CD4543 has a LE of the opposite polarity and blanks codes 10-15; the CD4054B
//   has four loose strobed segment latches and no BCD decode; the CD4055B has a
//   DISPLAY-FREQ OUT pin on pin 1 in place of the CD4056B's STROBE.
//   Verified 16-pin DIP map: STROBE=1, 2²(C)=2, 2¹(B)=3, 2³(D)=4, 2⁰(A)=5,
//   DISPLAY FREQ IN=6, VEE=7, VSS=8, a=9, b=10, c=11, d=12, e=13, g=14, f=15,
//   VDD=16.
//   Verified function: STROBE-latched BCD→7-seg decode of all 16 codes (0-9, L, H,
//   P, A, "-", blank). DF=LOW → selected segments HIGH; DF=HIGH → all outputs
//   inverted.

export const CHIPS_BLOCK_169 = {
  // ── CD4056: BCD to 7-Segment LCD Decoder/Driver with Strobed Latch ──────────
  'CD4056': {
    name: 'CD4056',
    simpleName: 'BCD to 7 Segment LCD Decoder/Driver (Latched)',
    description: 'BCD to 7-seg LCD decoder/driver, strobed input latch, CMOS (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4056b.pdf',
    tags: ['cmos', '4000 series', 'decoder', '7 segment', 'BCD decoder', 'display driver', 'latch', 'LCD', 'lcd driver', 'level shifter'],
    guideOverview: 'The CD4056 converts a 4 bit BCD code (A D) into the seven segment drive signals (a g) for a single display digit. It decodes every one of the 16 input codes: 0 through 9, plus the characters L, H, P, A, a dash, and a blank. A strobed input latch holds the displayed digit: when STROBE is HIGH the segments follow the BCD inputs in real time, and when STROBE goes LOW the current digit is frozen even if the inputs change. The Display Frequency (DF) input sets output polarity: DF=LOW drives the selected segments HIGH (suits a common cathode LED display), and DF=HIGH inverts every output so the selected segments go LOW (suits a common anode display). The chip is built for liquid-crystal displays: when DF carries the square wave used on an LCD\'s common backplane, a selected segment swings out of phase with the backplane (an AC voltage appears across the liquid crystal and the segment turns dark) while an unselected segment stays in phase (no voltage, segment stays clear). NOTE: 74Sim is a functional digital-logic simulator. It models the static polarity DF sets (so the chip drives a normal 7-segment display like the CD4543 does), but it does not model the AC, phase-based liquid-crystal drive — DF is treated as a fixed level, not a free-running square wave.',
    guidePinDescriptions: {
      ST:  'Strobe / latch control (pin 1). HIGH = transparent: segment outputs follow the BCD inputs. LOW = latched: the displayed digit is held even if the BCD inputs change. (Opposite polarity to the CD4543 Latch Enable.)',
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
      { pin:  1, name: 'ST',  type: 'input',  description: 'Strobe / latch. HIGH = transparent (follow BCD); LOW = latched (hold digit).' },
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
    // STROBE-latched decode; DF maps to polarity like the CD4543 Ph pin, but the
    // CD4056B decodes 10-15 to L/H/P/A/"-"/blank (the CD4543 blanks them), its
    // STROBE is the opposite polarity of the CD4543 LE, and it has no blanking pin
    // — hence its own primitive BCD_7SEG_4056 (defined in js/specificChipsSim.js),
    // not the BCD_7SEG_4543 type. Pin/name order: A=2^0(pin5) B=2^1(pin3)
    // C=2^2(pin2) D=2^3(pin4), ST=pin1, DF=pin6; outputs a,b,c,d,e,f,g.
    gates: [
      { type: 'BCD_7SEG_4056', inputs: ['A', 'B', 'C', 'D', 'ST', 'DF'], outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
    ],
    guideSections: [
      {
        title: 'BCD to 7 Segment Decoding',
        paragraphs: [
          'A single digit on a 7-segment display is made of seven bars, labeled a through g. The CD4056 reads a 4-bit BCD code on inputs A (weight 1) through D (weight 8) and turns on exactly the bars needed to draw that value.',
          'It decodes all 16 possible codes, not just 0 through 9. Codes 0 through 9 draw the digits. Codes 10 through 15 draw L, H, P, A, a dash, and a blank (nothing lit). That extra set lets the chip show simple letters or status characters without a separate decoder.',
        ],
        list: [
          'Common cathode LED display: tie DF to GND. Segment outputs go HIGH for lit bars and drive the LED anodes through current-limiting resistors.',
          'Common anode LED display: tie DF to VDD. Every output inverts, so lit bars are driven LOW to sink current from the common anode.',
          'Liquid-crystal display: drive DF with the backplane square wave (see the LCD section below).',
        ],
      },
      {
        title: 'The strobe latch',
        paragraphs: [
          'STROBE controls an input latch in front of the decoder. While STROBE is HIGH the latch is transparent: the decoded segments track the BCD inputs as they change. Take STROBE LOW and the latch freezes whatever code was present at that moment, so the display keeps showing that digit even if the BCD inputs move on to something else.',
          'This is useful when the BCD code is shared on a bus or comes from a counter that keeps running: pulse STROBE HIGH to capture a fresh value, then return it LOW to hold the digit steady while the source changes.',
        ],
        note: 'The STROBE polarity is the reverse of the CD4543 Latch Enable. On the CD4056, HIGH is the transparent (follow) state and LOW holds; on the CD4543, LOW is transparent and HIGH holds.',
      },
      {
        title: 'Driving a liquid-crystal display',
        paragraphs: [
          'A liquid-crystal segment darkens when an AC voltage is applied across it and clears when there is none. Steady DC damages it, so it is never driven with a fixed level. Instead the display\'s common backplane is fed a square wave (around 30 Hz), and each segment is driven with either the same square wave or its inverse.',
          'DF carries that backplane square wave into the chip. For a SELECTED segment the output swings opposite to the backplane, so the two sides differ and an AC voltage appears across the crystal — the bar goes dark. For an UNSELECTED segment the output matches the backplane, both sides move together, there is no voltage difference, and the bar stays clear.',
          'The outputs are level-shifted between VDD and VEE so the drive can be larger than the logic supply (up to 18 V across VDD to VEE), which suits larger or lower-contrast displays without an external capacitor.',
        ],
        note: '74Sim models the static polarity that DF sets (DF=LOW gives active-HIGH segment outputs, DF=HIGH inverts them), so the chip drives a normal 7-segment display in the simulator just like the CD4543. It does not model the AC, phase-based liquid-crystal drive — DF is treated as a fixed level, not a free-running square wave.',
      },
      {
        title: 'How it compares to its siblings',
        paragraphs: [
          'The CD4056 is one of three related LCD drivers on the same datasheet. The CD4054 drives four loose segments (decimal points, colons, annunciators) with no BCD decoding. The CD4055 is the same 7-segment decoder as the CD4056 but has no input latch — instead it brings out a buffered Display-Frequency Out pin to drive the LCD backplane. The CD4543 (also in 74Sim) is a close relative with a latch and a blanking input, but its Latch Enable is the opposite polarity and it blanks codes 10 through 15 instead of showing letters.',
        ],
      },
    ],
  },
};
