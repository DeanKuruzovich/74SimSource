// CMOS 4000-series coverage — CD4553 (3-digit BCD counter, multiplexed BCD out).
//
// Shipped in its own standalone block (CHIPS_BLOCK_132) to avoid colliding with
// other agents adding chips in the same working tree.
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ──
// The CD4553's defining feature is a TIME-MULTIPLEXED display interface: the
// three internal BCD digits (units / tens / hundreds) are presented one at a
// time on a single shared 4-bit bus Q0–Q3, in lock-step with three digit-select
// strobes DS1/DS2/DS3 that tell the external display which digit is currently on
// the bus. That scan is driven by an ON-CHIP low-frequency oscillator whose rate
// is set by an external capacitor between C1A (pin 4) and C1B (pin 3)
// (f_osc ≈ 1.5/C1 Hz at VDD = 5 V, C1 in µF — datasheet Fig. 1 / switching table).
//
// 74Sim is a functional logic simulator with NO free-running RC oscillator for
// the 4000-series timing parts (issues.md A3, and the analogous CD4047 astable
// limitation A9). Without the scan oscillator running, Q0–Q3 would sit on a
// single digit and DS1–DS3 would never cycle — a three-digit count cannot be
// read off four shared lines without the scan. Per the CD4046 precedent
// (issues.md D13) and the project's stub policy (issues.md B1/B3,
// CMOS-4000-Coverage-Plan.md §6), a half-driven multiplexer is more misleading
// than an honest info sheet, so the CD4553 ships as an "info sheet only" entry:
// the page documents the real part (verified pinout, function, design notes) but
// the chip is hidden from the picker and drives no outputs in the sim. This is
// consistent with the coverage-plan hint, which maps the CD4553 onto the
// already-inert `COUNTER_LATCH_MUX_STUB` primitive (the 74x690-family stub that
// also drives all outputs Hi-Z); GENERIC_STUB is used here because it is the
// canonical, banner-registered documentation-stub gate type.
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: ON Semiconductor (Motorola), "MC14553B — 3-Digit BCD Counter" (the
//   industry-standard second-source for the discontinued CD4553B; the part is
//   marked "CD4553" on the cover and "MC14553B" on the body of this datasheet),
//   Rev. (undated reprint). [Online]. Available (mirror):
//   https://www.sycelectronica.com.ar/semiconductores/CD4553.pdf
//   Verified: terminal assignment (Figure 1 Block Diagram), TRUTH TABLE,
//   OPERATING CHARACTERISTICS text, and Figure 4 Expanded Block Diagram — all
//   read as rendered 300-dpi PDF page images (NOT a text summarizer — see
//   issues.md C4). TI's cd4553b.pdf 404s (part discontinued), so MC14553B is used
//   as the identical-pinout second source; not cloned from any sibling part
//   (see issues.md C2 lesson).
//
// Verified DIP-16 pinout (Figure 1, MC14553B), top-of-package numbering:
//   1=DS2  2=DS1  3=C1B  4=C1A  5=Q3  6=Q2  7=Q1  8=VSS
//   9=Q0  10=LE  11=DIS  12=CLOCK  13=MR  14=O.F.  15=DS3  16=VDD
// Behavioral facts (Figure 1 truth table + Operating Characteristics text):
//   • three negative-edge-triggered cascaded BCD counters (000–999);
//   • DISABLE (DIS, pin 11) HIGH inhibits the clock, count retained;
//   • MASTER RESET (MR, pin 13) HIGH async-clears all three counters + the
//     scanner (scanner parks on digit 1, all DS disabled, scan osc inhibited);
//   • LATCH ENABLE (LE, pin 10) HIGH freezes the count in the output latches;
//   • Q0–Q3 BCD outputs are ACTIVE HIGH; DS1/DS2/DS3 digit selects are
//     ACTIVE LOW (DS1=units/LSD pin 2, DS2=tens pin 1, DS3=hundreds/MSD pin 15);
//   • OVERFLOW (O.F., pin 14) emits one pulse per 1000 counts (cascade output).

export const CHIPS_BLOCK_132 = {
  // ── CD4553: 3-digit BCD counter with time-multiplexed BCD output ──────────
  'CD4553': {
    name: 'CD4553',
    simpleName: '3-digit BCD ctr',
    description: '3-digit BCD counter, multiplexed BCD out (16-pin CMOS) — info sheet only',
    sequential: true,
    guideOverview: 'The CD4553B (second-sourced as the MC14553B) is a 3-digit BCD counter. Inside are three negative-edge-triggered decade counters cascaded to count 000–999, each feeding a 4-bit output latch. Instead of bringing out all 12 bits, the chip time-multiplexes the three digits onto ONE shared 4-bit bus (Q0–Q3) and emits three active-low digit-select strobes (DS1/DS2/DS3) so an external multiplexed display knows which digit is currently on the bus. The scan rate is set by an on-chip oscillator whose frequency is programmed by an external capacitor between C1A (pin 4) and C1B (pin 3). A DISABLE input gates the clock, a MASTER RESET clears the counters, a LATCH ENABLE freezes the displayed count, and an OVERFLOW output emits one pulse per 1000 counts for cascading. NOTE: 74Sim is a functional logic simulator and does not model the free-running on-chip scan oscillator that drives the multiplexer (it models no analog RC oscillators for the 4000-series timing parts), so this part is provided as a documentation / info-sheet entry only. Its outputs are not driven in the simulator.',
    guidePinDescriptions: {
      'DS2':   'DIGIT SELECT 2 (pin 1, active LOW). Strobe for the tens digit — goes LOW while the tens BCD value is on Q0–Q3.',
      'DS1':   'DIGIT SELECT 1 (pin 2, active LOW). Strobe for the units / least-significant digit (LSD).',
      'C1B':   'C1-B (pin 3). One terminal of the external scan-oscillator capacitor C1 (between C1A and C1B).',
      'C1A':   'C1-A (pin 4). Other terminal of the external scan-oscillator capacitor C1. The internal scan oscillator can also be overridden and driven by an external clock applied here.',
      'Q3':    'BCD OUTPUT bit 3 / MSB (pin 5, active HIGH). Multiplexed: carries bit 3 of whichever digit DS1/DS2/DS3 currently selects.',
      'Q2':    'BCD OUTPUT bit 2 (pin 6, active HIGH). Multiplexed across the three digits.',
      'Q1':    'BCD OUTPUT bit 1 (pin 7, active HIGH). Multiplexed across the three digits.',
      'VSS':   'Negative supply / ground (pin 8).',
      'Q0':    'BCD OUTPUT bit 0 / LSB (pin 9, active HIGH). Multiplexed across the three digits.',
      'LE':    'LATCH ENABLE (pin 10, active HIGH). HIGH stores the current count in the output latches and holds it (frozen display) while LE stays HIGH, independent of the counters. LOW = latches transparent (display follows the count).',
      'DIS':   'DISABLE (pin 11, active HIGH). HIGH blocks the input clock from reaching the counters while retaining the last count; LOW allows counting.',
      'CLOCK': 'CLOCK (pin 12). Counter clock — the counters advance on the negative (falling) edge when DISABLE is LOW. An on-chip pulse shaper allows very slow input rise times.',
      'MR':    'MASTER RESET (pin 13, active HIGH). HIGH asynchronously clears all three BCD counters to 000 and resets the scanner (parks it on digit one, disables the digit selects, and inhibits the scan oscillator).',
      'OF':    'OVERFLOW / O.F. (pin 14, active HIGH). Emits one output pulse for every 1000 input counts (999→000 rollover); used to cascade multiple CD4553s.',
      'DS3':   'DIGIT SELECT 3 (pin 15, active LOW). Strobe for the hundreds / most-significant digit (MSD).',
      'VDD':   'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'What the CD4553B is',
        paragraphs: [
          'The CD4553B counts clock pulses from 000 to 999 in BCD (binary-coded decimal — each decimal digit is one 4-bit group). It is built for driving multiplexed numeric displays: rather than wiring out 12 separate output bits (three digits × four bits), it shows the three digits one at a time on a single shared 4-bit bus.',
          'A small on-chip oscillator, set by one external capacitor between pins 3 and 4, steps a scanner that puts the units, then tens, then hundreds digit onto Q0–Q3 in turn. In step with that scan, the three DIGIT SELECT outputs (DS1/DS2/DS3) go low one at a time to switch on the matching display digit. If the scan is fast enough, the eye sees all three digits lit steadily.',
        ],
      },
      {
        title: 'The control inputs',
        paragraphs: [
          'CLOCK (pin 12) advances the counter on each falling edge. DISABLE (pin 11) high blocks the clock so the count holds. MASTER RESET (pin 13) high clears the count to 000. These are the everyday controls.',
          'LATCH ENABLE (pin 10) is the display-freeze control: taking it high copies the current count into the output latches and holds it there, so the displayed number stops changing even while the counter keeps running underneath. Drop it low and the display tracks the live count again.',
          'OVERFLOW (pin 14) pulses once every 1000 counts. Feed it to the clock of a second CD4553 to extend the count past 999 (cascading).',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          'The whole point of the chip — showing a three-digit number one digit at a time on four shared lines — depends on the on-chip scan oscillator running continuously. 74Sim is a functional logic simulator: it has no model for the free-running RC oscillators inside the 4000-series timing parts, so that scan cannot run. With the scan stopped, Q0–Q3 would sit on a single digit and the digit-select strobes would never cycle, which would not represent the real part.',
          'So this CD4553B entry documents the real part — verified pinout, function and design notes — but is hidden from the breadboard picker and drives no outputs in the sim. If you need the multiplexed display behavior, build it on the bench; the datasheet linked here is the authority.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.sycelectronica.com.ar/semiconductores/CD4553.pdf',
    tags: ['counter', 'bcd', '3-digit', 'multiplexed', 'display', 'cmos', '4000', 'stub'],
    pinout: [
      { pin: 1,  name: 'DS2',   type: 'output', description: 'DIGIT SELECT 2 (tens) — active LOW digit strobe.' },
      { pin: 2,  name: 'DS1',   type: 'output', description: 'DIGIT SELECT 1 (units / LSD) — active LOW digit strobe.' },
      { pin: 3,  name: 'C1B',   type: 'input',  description: 'C1-B — external scan-oscillator capacitor terminal.' },
      { pin: 4,  name: 'C1A',   type: 'input',  description: 'C1-A — external scan-oscillator capacitor terminal (can be driven by an external scan clock).' },
      { pin: 5,  name: 'Q3',    type: 'output', description: 'BCD OUTPUT bit 3 / MSB (active HIGH, multiplexed).' },
      { pin: 6,  name: 'Q2',    type: 'output', description: 'BCD OUTPUT bit 2 (active HIGH, multiplexed).' },
      { pin: 7,  name: 'Q1',    type: 'output', description: 'BCD OUTPUT bit 1 (active HIGH, multiplexed).' },
      { pin: 8,  name: 'VSS',   type: 'power',  description: 'Negative supply / ground.' },
      { pin: 9,  name: 'Q0',    type: 'output', description: 'BCD OUTPUT bit 0 / LSB (active HIGH, multiplexed).' },
      { pin: 10, name: 'LE',    type: 'input',  description: 'LATCH ENABLE — HIGH freezes the count in the output latches.' },
      { pin: 11, name: 'DIS',   type: 'input',  description: 'DISABLE — HIGH inhibits the clock (count retained).' },
      { pin: 12, name: 'CLOCK', type: 'input',  description: 'CLOCK — counters advance on the falling edge.' },
      { pin: 13, name: 'MR',    type: 'input',  description: 'MASTER RESET — HIGH async-clears the counters and scanner.' },
      { pin: 14, name: 'OF',    type: 'output', description: 'OVERFLOW — one pulse per 1000 counts (cascade output).' },
      { pin: 15, name: 'DS3',   type: 'output', description: 'DIGIT SELECT 3 (hundreds / MSD) — active LOW digit strobe.' },
      { pin: 16, name: 'VDD',   type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Documentation stub: the time-multiplexed BCD scan depends on the on-chip
    // free-running scan oscillator (cap on C1A/C1B), which the engine does not
    // model (issues.md A3/A9; CD4046 precedent D13). GENERIC_STUB drives all
    // signal outputs Hi-Z; the 'stub' tag hides the chip from the picker.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['Q0', 'Q1', 'Q2', 'Q3', 'OF', 'DS1', 'DS2', 'DS3'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD4553B\'s on-chip scan oscillator / time-multiplexed BCD output (no free-running RC oscillator engine — issues.md A3/A9). Pinout verified vs ON Semi MC14553B (CD4553) Figure 1, the identical-pinout second source (TI cd4553b.pdf 404s). See issues.md C4/D13.',
  },
};
