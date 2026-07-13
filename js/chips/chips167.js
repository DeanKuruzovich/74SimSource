// CMOS 4000-series coverage — CD4054 (4-segment liquid-crystal display driver).
//
// Shipped in its own standalone block (CHIPS_BLOCK_167) to avoid colliding with
// other agents adding chips in the same working tree (Coverage-Plan §4, Batch 15).
//
// ── What the part is ─────────────────────────────────────────────────────────
// The CD4054B is a 4-segment LCD (liquid-crystal display) driver. It has four
// independent channels; each channel is a transparent DATA latch (one per
// channel, each with its own STROBE) feeding a level-shifted segment output. A
// single common DISPLAY-FREQUENCY (DF) input controls all four outputs at once.
// It is the decimal-point / colon / "annunciator" companion to the CD4055B and
// CD4056B BCD-to-7-segment LCD decoders — it drives the loose extra segments a
// 7-segment digit chip does not.
//
// ── How the outputs work (the LCD trick) ─────────────────────────────────────
// Per channel, with STROBE = 1 the latch is transparent and stores the DATA bit;
// with STROBE = 0 it holds the last value latched. The settled output is then
//     OUT = (latched IN) XOR DF                          (CD4054B truth table)
// For a liquid-crystal display, DF is normally driven with a ~30 Hz square wave —
// the same waveform applied to the display's common backplane. A SELECTED segment
// (IN = 1) then produces a square wave 180° OUT of phase with the backplane, so an
// AC voltage appears across the liquid crystal and the segment turns dark; an
// UNSELECTED segment (IN = 0) produces a wave IN phase with the backplane, so
// there is no net AC voltage and the segment stays clear. (With DF held at a DC
// level the part behaves as a plain latch/inverter: DF = 0 → OUT = IN, DF = 1 →
// OUT = IN inverted.) With VDD − VEE up to 18 V the output gives an effective
// 36 V p-p drive across a selected segment, with no external capacitor.
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ──────
// The whole point of this part is AC, phase-modulated drive of a liquid-crystal
// segment: "on" vs "off" is the PHASE of the output relative to the backplane
// common, not a static logic level, and it relies on an idealized free-running
// DF square wave (issues.md A3) plus a real AC voltage developed across a glass
// segment that 74Sim's DC functional-logic model cannot represent. There is also
// no breadboard widget for four loose LCD segments (unlike the 7-segment display
// the CD4543 drives). The CMOS-4000 coverage plan already designated the
// CD4054/CD4055/CD4056 LCD drivers for the "info sheet only" tail
// (CMOS-4000-Coverage-Plan.md §D3 and the Batch-15 row, hint `GENERIC_STUB`).
// Shipping a "working" CD4054 would mean emitting OUT = IN XOR (an idealized
// clock) on abstract pins with the LCD phase/contrast semantics stripped away —
// more misleading than helpful (cf. the A10 PLL-removal rationale). It is
// therefore added as a documentation entry: the page documents the real part
// (verified pinout, function, truth table, design notes), but the chip is hidden
// from the picker and drives no outputs.
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4054B, CD4055B, CD4056B Types — CMOS Liquid-Crystal Display Drivers,
//   High-Voltage Types (20-Volt Rating)", SCHS048C (Revised October 2003).
//   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4054b.pdf.
//   Verified: "CD4054B Terminal Assignment" (16-pin DIP, drawing 92CS-24485),
//   "Fig. 1 — CD4054B functional diagram" (per-pin numbers on the four LATCH +
//   LEVEL SHIFTERS + DISPLAY DRIVERS blocks), and the "CD4054B TRUTH TABLE"
//   (DF / IN / ST / OUT), pages 1–2, read as 300-dpi rendered PDF page images —
//   NOT the text summarizer (issues.md C4) — and NOT cloned from the CD4055B /
//   CD4056B siblings on the same datasheet (issues.md C2: the CD4055B/CD4056B are
//   BCD-decoded 7-segment parts with a different pinout and a DISPLAY-FREQUENCY
//   OUT pin the CD4054B does not have).
//   Verified 16-pin DIP map: STROBE 4=1, DISPLAY FREQ IN=2, OUT 4=3, OUT 3=4,
//   OUT 2=5, OUT 1=6, VEE=7, VSS=8, IN 1=9, STROBE 1=10, IN 2=11, STROBE 2=12,
//   IN 3=13, STROBE 3=14, IN 4=15, VDD=16.
//   Verified function (truth table): with ST=1 the channel latch is transparent
//   and stores IN; with ST=0 it holds. OUT = (latched IN) XOR DF — i.e.
//   DF=0,IN=0→0; DF=1,IN=0→1; DF=0,IN=1→1; DF=1,IN=1→0.

export const CHIPS_BLOCK_167 = {
  // ── CD4054: 4-Segment Liquid-Crystal Display Driver ───────────────────────────
  'CD4054': {
    name: 'CD4054',
    simpleName: '4-segment LCD driver',
    description: '4-segment LCD driver, per-segment latches (16-pin CMOS) — info sheet only',
    guideOverview: 'The CD4054B is a 4-segment liquid-crystal display (LCD) driver. It has four independent channels; each channel has its own DATA input and STROBE, and a single common DISPLAY-FREQUENCY (DF) input controls all four outputs together. With a channel\'s STROBE high the data passes through a latch and is stored; with STROBE low the latch holds. The output of each channel is the stored data bit combined with DF: when DF carries the ~30 Hz square wave used on an LCD\'s common backplane, a selected segment swings 180 degrees out of phase with the backplane (an AC voltage appears across the liquid crystal and the segment turns dark), while an unselected segment swings in phase (no net voltage, segment stays clear). It is the companion chip to the CD4055B / CD4056B 7-segment LCD decoders, used to drive the loose extra segments — decimal points, colons, annunciators — that a digit chip does not. NOTE: 74Sim is a functional digital-logic simulator. An LCD segment is turned on or off by the AC PHASE of the driver output relative to the backplane, not by a static logic level, and 74Sim has no AC-across-glass model and no liquid-crystal display widget for loose segments. This part is therefore provided as a documentation / info-sheet entry only; its outputs are not driven in the simulator.',
    guidePinDescriptions: {
      'ST4':  'STROBE 4 (pin 1). Latch-enable for channel 4. HIGH = channel 4 latch is transparent (passes IN 4); LOW = channel 4 holds its last value.',
      'DFIN': 'DISPLAY FREQUENCY IN (pin 2). Common phase/control input for all four outputs. Drive with the LCD backplane square wave (~30 Hz) for AC display drive, or hold at a DC level to use the chip as four latch/inverters.',
      'OUT4': 'Segment OUTPUT 4 (pin 3). Level-shifted drive for LCD segment 4.',
      'OUT3': 'Segment OUTPUT 3 (pin 4). Level-shifted drive for LCD segment 3.',
      'OUT2': 'Segment OUTPUT 2 (pin 5). Level-shifted drive for LCD segment 2.',
      'OUT1': 'Segment OUTPUT 1 (pin 6). Level-shifted drive for LCD segment 1.',
      'VEE':  'Negative output-driver supply (pin 7). Sets the low end of the segment-output swing for level shifting; VDD − VEE can be up to 18 V for ~36 V p-p segment drive. 74Sim has no sub-VSS rail, so VEE is informational (tie to VSS for unipolar use).',
      'VSS':  'Logic ground / negative logic supply (pin 8).',
      'IN1':  'DATA IN 1 (pin 9). Segment-data bit for channel 1 (latched by STROBE 1).',
      'ST1':  'STROBE 1 (pin 10). Latch-enable for channel 1.',
      'IN2':  'DATA IN 2 (pin 11). Segment-data bit for channel 2 (latched by STROBE 2).',
      'ST2':  'STROBE 2 (pin 12). Latch-enable for channel 2.',
      'IN3':  'DATA IN 3 (pin 13). Segment-data bit for channel 3 (latched by STROBE 3).',
      'ST3':  'STROBE 3 (pin 14). Latch-enable for channel 3.',
      'IN4':  'DATA IN 4 (pin 15). Segment-data bit for channel 4 (latched by STROBE 4).',
      'VDD':  'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'What the CD4054B is',
        paragraphs: [
          'A liquid-crystal display is made of segments. A 7-segment digit chip (like the CD4055B or CD4056B) handles the seven bars of a single digit, but a real display also has loose extra segments: decimal points, a colon between hours and minutes, low-battery or AM/PM annunciators. The CD4054B drives four of those loose segments.',
          'It has four independent channels. Each channel takes one data bit (IN) and has its own strobe (STROBE) to latch it. A single shared DISPLAY-FREQUENCY (DF) input then controls how all four outputs drive their segments.',
        ],
      },
      {
        title: 'How a segment is turned on',
        paragraphs: [
          'A liquid-crystal segment darkens when an AC voltage is applied across it, and clears when there is none. It is damaged by steady DC, so it is never driven with a fixed level — it is driven with a square wave, and the segment\'s common backplane gets that same square wave.',
          'DF carries that backplane square wave (around 30 Hz). For each channel, the output is the latched data bit combined with DF: a SELECTED segment (data = 1) puts out a square wave 180 degrees out of phase with the backplane, so the two sides differ and an AC voltage appears across the crystal — the segment goes dark. An UNSELECTED segment (data = 0) puts out a wave in phase with the backplane, so both sides move together, there is no voltage difference, and the segment stays clear.',
          'The truth table (with STROBE = 1, so the latch is passing data): DF 0 / IN 0 -> OUT 0; DF 1 / IN 0 -> OUT 1; DF 0 / IN 1 -> OUT 1; DF 1 / IN 1 -> OUT 0. That is OUT = IN XOR DF. With STROBE = 0 the channel holds whatever it last latched. (If DF is held at a fixed DC level instead of a square wave, the chip acts as four simple latch/inverters.)',
        ],
      },
      {
        title: 'Strobing and the high-voltage swing',
        paragraphs: [
          'Each channel latches independently: pulse a channel\'s STROBE high to load its data, then take STROBE low to freeze it. This lets a controller update one annunciator without disturbing the others.',
          'The outputs are level-shifted between VDD and VEE. With VDD − VEE as large as 18 V, a selected segment sees an effective 36 V peak-to-peak drive — enough for large or low-contrast displays — and no external capacitor is needed.',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          'Whether a segment is on or off depends on the PHASE of the output relative to the backplane, and on a real AC voltage building up across a piece of liquid-crystal glass. 74Sim resolves nets to static digital logic levels; it has no model for AC-across-glass or for the idealized free-running display-frequency square wave the part needs (see issues.md A3), and there is no breadboard widget for four loose LCD segments the way there is a 7-segment display for the CD4543.',
          'A simulated CD4054 would just emit "data XOR a clock" on four abstract pins with the entire point of the chip — the liquid-crystal phase/contrast behavior — thrown away. Rather than ship something misleading, this entry documents the real part: pinout, function, truth table, and design notes. It is hidden from the breadboard picker and drives no outputs. The datasheet linked here is the authority. The CD4054/CD4055/CD4056 LCD-driver family was designated for this info-sheet treatment in the coverage plan (CMOS-4000-Coverage-Plan.md section D3).',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4054b.pdf',
    tags: ['lcd', 'lcd driver', 'display driver', 'segment driver', 'latch', 'level shifter', 'cmos', '4000', 'stub'],
    // Verified terminal assignment — TI/Harris CD4054B SCHS048C, "CD4054B
    // Terminal Assignment" (drawing 92CS-24485) + "Fig. 1 CD4054B functional
    // diagram", pages 1-2, read as PDF page images (issues.md C4). NOT cloned
    // from the CD4055B/CD4056B siblings on the same datasheet (issues.md C2).
    pinout: [
      { pin: 1,  name: 'ST4',  type: 'input',  description: 'STROBE 4 — channel 4 latch enable (HIGH = transparent, LOW = hold).' },
      { pin: 2,  name: 'DFIN', type: 'input',  description: 'DISPLAY FREQUENCY IN — common phase/control input (LCD backplane square wave) for all four outputs.' },
      { pin: 3,  name: 'OUT4', type: 'output', description: 'Segment output 4 (level-shifted LCD drive).' },
      { pin: 4,  name: 'OUT3', type: 'output', description: 'Segment output 3 (level-shifted LCD drive).' },
      { pin: 5,  name: 'OUT2', type: 'output', description: 'Segment output 2 (level-shifted LCD drive).' },
      { pin: 6,  name: 'OUT1', type: 'output', description: 'Segment output 1 (level-shifted LCD drive).' },
      { pin: 7,  name: 'VEE',  type: 'power',  description: 'Negative output-driver supply (level-shift low rail; informational in 74Sim — tie to VSS).' },
      { pin: 8,  name: 'VSS',  type: 'power',  description: 'Logic ground / negative logic supply.' },
      { pin: 9,  name: 'IN1',  type: 'input',  description: 'DATA IN 1 — channel 1 segment-data bit (latched by STROBE 1).' },
      { pin: 10, name: 'ST1',  type: 'input',  description: 'STROBE 1 — channel 1 latch enable.' },
      { pin: 11, name: 'IN2',  type: 'input',  description: 'DATA IN 2 — channel 2 segment-data bit (latched by STROBE 2).' },
      { pin: 12, name: 'ST2',  type: 'input',  description: 'STROBE 2 — channel 2 latch enable.' },
      { pin: 13, name: 'IN3',  type: 'input',  description: 'DATA IN 3 — channel 3 segment-data bit (latched by STROBE 3).' },
      { pin: 14, name: 'ST3',  type: 'input',  description: 'STROBE 3 — channel 3 latch enable.' },
      { pin: 15, name: 'IN4',  type: 'input',  description: 'DATA IN 4 — channel 4 segment-data bit (latched by STROBE 4).' },
      { pin: 16, name: 'VDD',  type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Documentation stub: the AC phase-modulated LCD segment drive (OUT = latched
    // IN XOR DF, with DF an idealized backplane square wave and the segment turned
    // on/off by AC phase across glass) is not modeled — see issues.md A3 / D3 and
    // the Coverage-Plan Batch-15 row. GENERIC_STUB leaves all four OUT pins Hi-Z;
    // the chip is hidden from the picker by the 'stub' tag.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['OUT1', 'OUT2', 'OUT3', 'OUT4'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD4054B LCD driver. A segment is turned on/off by the AC PHASE of OUT relative to the display-frequency backplane (OUT = latched IN XOR DF), which the DC functional-logic engine and idealized clocks cannot represent (issues.md A3), and there is no loose-LCD-segment widget. Pinout + truth table verified vs TI/Harris CD4054B SCHS048C, read as PDF page images, not cloned from the CD4055B/CD4056B siblings. See Coverage-Plan §D3.',
  },
};
