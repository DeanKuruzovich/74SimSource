// chips82.js — Block 82: CMOS 4000 series logic ICs (coverage expansion, Batch 5)
// Ripple counters. Pinout + behavior verified by reading the TI datasheet
// "CD4020B, CD4024B, CD4040B Types" (SCHS030D) directly as PDF page images
// (Read with pages:), NOT via the WebFetch text summarizer which mangles these
// scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (Batch 5) for the full roadmap.
// Chips: CD4020
export const CHIPS_BLOCK_82 = {

  // ── CD4020: 14-stage binary ripple counter (16-pin) ──────────────────────
  // Source: Texas Instruments, "CD4020B, CD4024B, CD4040B Types — CMOS
  //   Ripple-Carry Binary Counter/Dividers", SCHS030D (Rev. December 2003).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4020b.pdf.
  //   Verified: CD4020B terminal assignment (16-pin, TOP VIEW) + functional
  //   diagram + behavior text, page 1, read as rendered PDF page images (per
  //   issues.md C4 — the WebFetch text summarizer mangles these scans).
  //   Pins 1-16 = Q12, Q13, Q14, Q6, Q5, Q7, Q4, VSS, Q1, CLK, RESET, Q9, Q8,
  //   Q10, Q11, VDD. Behavior (quoted, page 1): "the state of a counter advances
  //   one count on the negative transition of each input pulse; a high level on
  //   the RESET line resets the counter to its all-zeros state"; "Schmitt trigger
  //   action on the input-pulse line permits unlimited rise and fall times"; all
  //   inputs and outputs buffered; recommended VDD 3-18 V. Stages 2 and 3 are
  //   internal only — Q2/Q3 are NOT brought out; available outputs are Q1 and
  //   Q4-Q14. This is the CD4020B column of a datasheet shared with the CD4024B
  //   (7-stage) and CD4040B (12-stage); NOT cloned from a sibling (issues.md C2).
  //   Regression guard: js/debug/scenarios/cd4020-ripple-counter.mjs.
  'CD4020': {
    name: 'CD4020',
    simpleName: '14-stage Binary Ripple Counter',
    description: '14-stage ripple-carry binary counter/divider CMOS 4000 series (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4020b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary counter', 'ripple counter', 'divider', 'frequency divider', 'timer'],
    guideOverview: 'The CD4020 is a 14-stage binary ripple counter. Inside are 14 flip-flops chained end to end; each one halves the frequency of the one before it, so the chip both counts input pulses in binary and divides the clock down by powers of two. It steps on the falling edge of CLK (HIGH going to LOW), and a HIGH on RESET clears the whole count to zero at once. Only 12 of the 14 stages reach the pins — you get Q1 (divide-by-2) and Q4 through Q14 (divide-by-16 up to divide-by-16384); stages 2 and 3 are internal, so there is no Q2 or Q3. The clock input is a Schmitt trigger, so a slow or noisy clock edge is fine. People reach for it to divide a clock frequency, build long time delays, or make a timer.',
    guidePinDescriptions: {
      Q1:    'Counter bit 1 output. First stage — toggles every clock pulse (divide-by-2).',
      Q4:    'Counter bit 4 output (divide-by-16).',
      Q5:    'Counter bit 5 output (divide-by-32).',
      Q6:    'Counter bit 6 output (divide-by-64).',
      Q7:    'Counter bit 7 output (divide-by-128).',
      Q8:    'Counter bit 8 output (divide-by-256).',
      Q9:    'Counter bit 9 output (divide-by-512).',
      Q10:   'Counter bit 10 output (divide-by-1024).',
      Q11:   'Counter bit 11 output (divide-by-2048).',
      Q12:   'Counter bit 12 output (divide-by-4096).',
      Q13:   'Counter bit 13 output (divide-by-8192).',
      Q14:   'Counter bit 14 output (divide-by-16384). Last stage.',
      CLK:   'Clock input (input pulses). The counter advances one count on each falling edge. Schmitt-triggered, so rise/fall times are unrestricted.',
      RESET: 'Master Reset. Active HIGH: asynchronously clears all stages to zero. Hold LOW for normal counting.',
      VSS:   'Negative supply / ground (0 V).',
      VDD:   'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'Q12',   type: 'output' },
      { pin:  2, name: 'Q13',   type: 'output' },
      { pin:  3, name: 'Q14',   type: 'output' },
      { pin:  4, name: 'Q6',    type: 'output' },
      { pin:  5, name: 'Q5',    type: 'output' },
      { pin:  6, name: 'Q7',    type: 'output' },
      { pin:  7, name: 'Q4',    type: 'output' },
      { pin:  8, name: 'VSS',   type: 'power'  },
      { pin:  9, name: 'Q1',    type: 'output' },
      { pin: 10, name: 'CLK',   type: 'input'  },
      { pin: 11, name: 'RESET', type: 'input'  },
      { pin: 12, name: 'Q9',    type: 'output' },
      { pin: 13, name: 'Q8',    type: 'output' },
      { pin: 14, name: 'Q10',   type: 'output' },
      { pin: 15, name: 'Q11',   type: 'output' },
      { pin: 16, name: 'VDD',   type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_BIN_RIPPLE',
        inputs: ['CLK', 'RESET'],
        outputs: ['Q1', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14'] },
    ],
    guideSections: [
      {
        title: 'How the ripple counter works',
        paragraphs: [
          'Inside are 14 flip-flops in a chain. A flip-flop here is a one-bit memory that flips its output every time it is clocked, so its output runs at exactly half the frequency of its clock — one output pulse for every two input pulses. That is where "divide by 2" comes from.',
          'The first flip-flop is clocked by CLK. Its output clocks the second, the second clocks the third, and so on down the line. Each stage halves the frequency again, so stage n divides CLK by 2ⁿ. Read the stage outputs together as a binary number and they count up: 0, 1, 2, 3 … one higher on every clock.',
          'The count steps on the falling edge of CLK (HIGH going to LOW), not the rising edge. Because each stage has to wait for the stage before it to flip, the higher bits change slightly later than the lower bits — the change "ripples" down the chain. That lag is what "ripple counter" means, and it is the difference from a synchronous counter, where every bit is clocked at the same instant.',
          'RESET is separate from the clock. Take RESET HIGH and every stage clears to 0 right away, whatever the clock is doing — this is called an asynchronous (or "common") reset. Hold RESET LOW for normal counting. After 2¹⁴ = 16384 falling edges the count rolls over to zero and repeats.',
        ],
      },
      {
        title: 'Reading the outputs',
        paragraphs: [
          'The CD4020 has 14 stages but only 12 output pins. Stages 2 and 3 are built but not wired to any pin, so Q2 and Q3 do not exist on the package — the outputs jump straight from Q1 to Q4. Each pin is the clock divided by a fixed power of two:',
        ],
        formulas: [
          'Q1  = divide-by-2 (2¹)',
          'Q4  = divide-by-16 (2⁴)',
          'Q5  = divide-by-32 (2⁵)',
          'Q6  = divide-by-64 (2⁶)',
          'Q7  = divide-by-128 (2⁷)',
          'Q8  = divide-by-256 (2⁸)',
          'Q9  = divide-by-512 (2⁹)',
          'Q10 = divide-by-1024 (2¹⁰)',
          'Q11 = divide-by-2048 (2¹¹)',
          'Q12 = divide-by-4096 (2¹²)',
          'Q13 = divide-by-8192 (2¹³)',
          'Q14 = divide-by-16384 (2¹⁴)',
        ],
        note: 'For frequency division the missing Q2/Q3 do not matter — you just pick the pin that divides by the amount you want. But it does mean you cannot read a clean, continuous binary count off the pins the way you can on a CD4040 (12 stages, all brought out). If you need every low bit in order, the CD4020 is the wrong part.',
      },
      {
        title: 'Common uses',
        list: [
          'Frequency division: feed a clock into CLK and take a slower square wave off any Q pin — Q1 is half the clock, Q14 is the clock divided by 16384.',
          'Long time delays: from a zeroed start, Q14 first goes HIGH only after 8192 clock pulses. With a slow clock that is a cheap way to wait a long time without a big timer.',
          'Timebase generation: from one fast oscillator, tap several Q pins at once to get many slower clocks (halves, quarters, and so on) out of a single chip.',
        ],
      },
      {
        title: 'Things to watch for',
        paragraphs: [
          'RESET is active HIGH and asynchronous — a HIGH on it zeros the count immediately, without waiting for a clock edge. If RESET floats or is accidentally tied HIGH, the counter sits at zero and never counts. Hold it LOW to count.',
          'There is no oscillator inside. The CD4020 only counts edges you feed into CLK; you supply the clock from something else. (The CD4060 is the same counter with an oscillator built in, if you want one chip to do both.)',
          'Because the count ripples down the chain, the high bits settle a few nanoseconds after the low bits. For those few nanoseconds the outputs show a wrong in-between number. If you decode several Q pins with a gate to detect a specific count, that brief glitch can trip it — a classic ripple-counter trap that synchronous counters avoid by clocking every bit at once.',
        ],
        note: '74Sim updates all 14 stages together in one solve, so it shows only the final settled count — it does not reproduce the brief invalid values the real chip\'s ripple delay produces between edges. The settled count and all steady-state behavior are correct (see issues.md A1/D6).',
      },
    ],
  },

};
