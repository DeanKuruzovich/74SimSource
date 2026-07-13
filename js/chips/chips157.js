// CMOS 4000-series coverage — CD4517B (dual 64-stage static shift register).
//
// Shipped in its own standalone block (CHIPS_BLOCK_157) to avoid colliding with
// other agents adding chips in the same working tree.
//
// ── Why this is a documentation stub (tags: ['stub'], gate SHIFT_REG_16BIT_STUB) ─
// The CD4517B is two independent 64-stage shift registers, but its defining
// feature is that the taps after the 16th, 32nd, 48th and 64th stages are
// BIDIRECTIONAL THREE-STATE pins whose direction flips under the WRITE ENABLE
// (WE) control (datasheet truth table):
//   • WE = 0  → the four taps are OUTPUTS, presenting the stored Q16/Q32/Q48/Q64
//               stage values (plain 64-stage serial shift on the low→high CLK edge,
//               data entering at the D input).
//   • WE = 1  → the same four tap pins become INPUTS, and on the low→high CLK edge
//               the value driven onto the Q16 tap is loaded into stage 17, the
//               Q32 tap into stage 33, and the Q48 tap into stage 49 (block / parallel
//               entry — 64 bits can be written in 16 clocks). The Q64 tap is High-Z
//               in this mode (there is no stage beyond 64 to receive it).
// So each of these pins is sometimes an output and sometimes an input, chosen at
// run time by WE. 74Sim's gate model has a fixed inputs[]/outputs[] direction per
// pin, and none of the engine's shift-register primitives model a tap that
// alternates direction or the WE=1 block-load into stages 17/33/49. This is the
// same situation as the other large "various serial/parallel config" shift
// registers already in the library (74673/674/675/676), which the coverage plan
// maps onto the inert `SHIFT_REG_16BIT_STUB` primitive, and the sibling 64-stage
// CD4031 / 40100 rows. Per the project's stub policy (issues.md B1/B2,
// CMOS-4000-Coverage-Plan.md §6) a half-driven bidirectional bus is more
// misleading than an honest info sheet, so the CD4517B ships as an "info sheet
// only" entry: the page documents the real part (verified pinout, function,
// design notes) but the chip is hidden from the breadboard picker and drives no
// outputs in the sim. The gate type is the coverage-plan-mapped, banner-registered
// `SHIFT_REG_16BIT_STUB` (drives every listed output Hi-Z; see issues.md B2).
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4517B Types — CMOS Dual 64-Stage Static Shift Register", SCHS075.
//   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4517b.pdf
//   Verified: TERMINAL ASSIGNMENT (top-view DIP drawing + the labelled 64-bit
//   shift-register block diagram giving the pin number behind each signal),
//   the descriptive text ("taps following the 16th, 32nd, 48th and 64th stages …
//   also serve as input points allowing data to be inputted at the 17th, 33rd,
//   and 49th stages when the write enable input is a logic 1 and the clock goes
//   through a low-to-high transition"), and the TRUTH TABLE — all read as
//   rendered 300-dpi PDF page images (NOT a text summarizer — see issues.md C4),
//   the terminal-assignment block cropped/zoomed to confirm pin 7 = DATA(DI) and
//   the four tap pin numbers. NOT cloned from a sibling part (see issues.md C2).
//
// Verified DIP-16 pinout (SCHS075 terminal assignment, top-of-package numbering;
// "A" = first register, "B" = second register):
//   1=Q16A  2=Q48A  3=WEA  4=CLA  5=Q64A  6=Q32A  7=DA  8=VSS
//   9=DB  10=Q32B  11=Q64B  12=CLB  13=WEB  14=Q48B  15=Q16B  16=VDD
// (The block diagram confirms CLOCK=4(12), DATA/DI=7(9), WRITE ENABLE=3(13), and
//  the tap pins 1(15)/6(10)/2(14)/5(11) for Q16/Q32/Q48/Q64.)
// Behavioral facts (description + truth table):
//   • two independent registers, each a 64-stage static (fully static, DC→12 MHz)
//     serial shift register clocked on the LOW-TO-HIGH (rising) CLK edge;
//   • Schmitt-trigger clock inputs (tolerate slow CLK rise/fall);
//   • WRITE ENABLE LOW → the Q16/Q32/Q48/Q64 taps are three-state OUTPUTS showing
//     the stored stage values;
//   • WRITE ENABLE HIGH → those four pins are three-state INPUTS; on the rising
//     CLK edge the Q16/Q32/Q48 taps jam data into stages 17/33/49 (Q64 tap = Hi-Z);
//   • high-voltage (20 V) type, 3–18 V operation, three-state outputs.

export const CHIPS_BLOCK_157 = {
  // ── CD4517: dual 64-stage static shift register ───────────────────────────
  'CD4517': {
    name: 'CD4517',
    simpleName: 'Dual 64-stage SR',
    description: 'Dual 64-stage shift register, 3-state I/O (16-pin CMOS) — info sheet only',
    sequential: true,
    guideOverview: 'The CD4517B is two independent 64-stage shift registers in one 16-pin package. Each register has a data input (D), a clock (CL), a write enable (WE), and four taps brought out after the 16th, 32nd, 48th and 64th stages (Q16/Q32/Q48/Q64). Data clocked into D marches one stage per clock on the low-to-high (rising) clock edge, so it takes 64 clocks to travel the full length. The clever part is the taps: with WRITE ENABLE low they are three-state outputs that show the stored value at those stages; with WRITE ENABLE high the same pins become inputs, and on the next rising clock edge the value you drive onto the Q16/Q32/Q48 tap is jammed straight into stage 17/33/49. That lets you fill all 64 bits in just 16 clocks (block loading) and lets several chips share a common bus. NOTE: this part is provided as a documentation / info-sheet entry only — 74Sim\'s shift-register engine does not model a tap pin that switches between output and input under WRITE ENABLE, nor the block-load into the intermediate stages, so its outputs are not driven in the simulator.',
    guidePinDescriptions: {
      'Q16A':  'Register A tap after the 16th stage (pin 1). Three-state I/O: OUTPUT when WE_A is LOW (shows stage-16 value); INPUT to stage 17 when WE_A is HIGH.',
      'Q48A':  'Register A tap after the 48th stage (pin 2). Three-state I/O: OUTPUT when WE_A is LOW; INPUT to stage 49 when WE_A is HIGH.',
      'WEA':   'Register A WRITE ENABLE (pin 3). LOW = the four taps are outputs (normal shift). HIGH = the taps become inputs and load stages 17/33/49 on the rising clock edge.',
      'CLA':   'Register A CLOCK (pin 4). Data shifts one stage on each LOW-to-HIGH (rising) edge. Schmitt-trigger input, so slow rise/fall times are fine.',
      'Q64A':  'Register A tap after the 64th / last stage (pin 5). OUTPUT when WE_A is LOW; High-Z when WE_A is HIGH (no stage beyond 64 to load).',
      'Q32A':  'Register A tap after the 32nd stage (pin 6). Three-state I/O: OUTPUT when WE_A is LOW; INPUT to stage 33 when WE_A is HIGH.',
      'DA':    'Register A DATA input (pin 7). The serial bit entering stage 1 on each rising clock edge.',
      'VSS':   'Negative supply / ground (pin 8).',
      'DB':    'Register B DATA input (pin 9). The serial bit entering stage 1 of register B.',
      'Q32B':  'Register B tap after the 32nd stage (pin 10). Three-state I/O (output when WE_B LOW; input to stage 33 when WE_B HIGH).',
      'Q64B':  'Register B tap after the 64th / last stage (pin 11). OUTPUT when WE_B is LOW; High-Z when WE_B is HIGH.',
      'CLB':   'Register B CLOCK (pin 12). Rising-edge clock, Schmitt-trigger input.',
      'WEB':   'Register B WRITE ENABLE (pin 13). LOW = taps are outputs; HIGH = taps load stages 17/33/49 on the rising edge.',
      'Q48B':  'Register B tap after the 48th stage (pin 14). Three-state I/O (output when WE_B LOW; input to stage 49 when WE_B HIGH).',
      'Q16B':  'Register B tap after the 16th stage (pin 15). Three-state I/O (output when WE_B LOW; input to stage 17 when WE_B HIGH).',
      'VDD':   'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'What the CD4517B is',
        paragraphs: [
          'A shift register is a chain of one-bit memory cells (stages) wired so that on each clock the bit in each cell moves into the next cell down the line. The CD4517B packs two of these chains, 64 stages each, into one chip. Feed a bit into the data input and 64 clock pulses later it falls out the far end.',
          'Each register brings out four taps — connection points after the 16th, 32nd, 48th and 64th stages — so you can watch or grab the value partway along the chain instead of only at the very end. The two registers are fully independent: separate data, clock, write-enable and tap pins.',
        ],
      },
      {
        title: 'The taps go both ways',
        paragraphs: [
          'The taps are not plain outputs. They are three-state pins whose direction is set by the WRITE ENABLE pin for that register. With WRITE ENABLE low they act as outputs and show the stored bit at stages 16, 32, 48 and 64.',
          'With WRITE ENABLE high the same pins turn into inputs. On the next rising clock edge, whatever you drive onto the stage-16 tap is jammed into stage 17, the stage-32 tap into stage 33, and the stage-48 tap into stage 49. Because you are writing into three points at once plus the normal data input, you can fill all 64 stages in 16 clocks instead of 64 — that is what the datasheet means by "entry of 64 bits with 16 clock pulses." The stage-64 tap has no stage past it to write into, so it just goes high-impedance in this mode.',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          '74Sim models a chip pin as either an input or an output, fixed for the life of the part. The CD4517B\'s taps break that assumption: each one is an output when WRITE ENABLE is low and an input when WRITE ENABLE is high, and in input mode it feeds a hidden internal stage (17, 33 or 49) that is not even a pin. None of the simulator\'s shift-register building blocks reproduce a pin that flips direction at run time or this kind of mid-chain block loading.',
          'Rather than ship a half-working version that would drive the taps the wrong way in half its modes, this CD4517B entry documents the real part — verified pinout, function and design notes — but is hidden from the breadboard picker and drives no outputs in the sim. The datasheet linked here is the authority; build it on the bench if you need the real behavior.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4517b.pdf',
    tags: ['shift register', '64-stage', 'dual', 'three-state', 'cmos', '4000', 'sequential', 'stub'],
    pinout: [
      { pin: 1,  name: 'Q16A', type: 'output', description: 'Register A tap after the 16th stage. Three-state I/O (output when WE_A LOW; input to stage 17 when WE_A HIGH).' },
      { pin: 2,  name: 'Q48A', type: 'output', description: 'Register A tap after the 48th stage. Three-state I/O (output when WE_A LOW; input to stage 49 when WE_A HIGH).' },
      { pin: 3,  name: 'WEA',  type: 'input',  description: 'Register A WRITE ENABLE. LOW = taps are outputs; HIGH = taps load stages 17/33/49 on the rising clock edge.' },
      { pin: 4,  name: 'CLA',  type: 'input',  description: 'Register A CLOCK — shifts one stage on the rising (LOW-to-HIGH) edge. Schmitt-trigger input.' },
      { pin: 5,  name: 'Q64A', type: 'output', description: 'Register A tap after the 64th / last stage. Output when WE_A LOW; High-Z when WE_A HIGH.' },
      { pin: 6,  name: 'Q32A', type: 'output', description: 'Register A tap after the 32nd stage. Three-state I/O (output when WE_A LOW; input to stage 33 when WE_A HIGH).' },
      { pin: 7,  name: 'DA',   type: 'input',  description: 'Register A DATA input — serial bit entering stage 1 on the rising clock edge.' },
      { pin: 8,  name: 'VSS',  type: 'power',  description: 'Negative supply / ground.' },
      { pin: 9,  name: 'DB',   type: 'input',  description: 'Register B DATA input — serial bit entering stage 1.' },
      { pin: 10, name: 'Q32B', type: 'output', description: 'Register B tap after the 32nd stage. Three-state I/O (output when WE_B LOW; input to stage 33 when WE_B HIGH).' },
      { pin: 11, name: 'Q64B', type: 'output', description: 'Register B tap after the 64th / last stage. Output when WE_B LOW; High-Z when WE_B HIGH.' },
      { pin: 12, name: 'CLB',  type: 'input',  description: 'Register B CLOCK — rising-edge, Schmitt-trigger input.' },
      { pin: 13, name: 'WEB',  type: 'input',  description: 'Register B WRITE ENABLE. LOW = taps are outputs; HIGH = taps load stages 17/33/49 on the rising edge.' },
      { pin: 14, name: 'Q48B', type: 'output', description: 'Register B tap after the 48th stage. Three-state I/O (output when WE_B LOW; input to stage 49 when WE_B HIGH).' },
      { pin: 15, name: 'Q16B', type: 'output', description: 'Register B tap after the 16th stage. Three-state I/O (output when WE_B LOW; input to stage 17 when WE_B HIGH).' },
      { pin: 16, name: 'VDD',  type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Documentation stub: the CD4517B's four taps per register are bidirectional
    // three-state pins whose direction flips with WRITE ENABLE, and WE=1 jams data
    // into the hidden internal stages 17/33/49 — neither is modeled by any engine
    // shift-register primitive (issues.md B2; coverage-plan §9 hint
    // SHIFT_REG_16BIT_STUB). SHIFT_REG_16BIT_STUB drives all listed outputs Hi-Z;
    // the 'stub' tag hides the chip from the picker (info sheet only).
    gates: [
      {
        type: 'SHIFT_REG_16BIT_STUB',
        inputs: ['DA', 'CLA', 'WEA', 'DB', 'CLB', 'WEB'],
        outputs: ['Q16A', 'Q32A', 'Q48A', 'Q64A', 'Q16B', 'Q32B', 'Q48B', 'Q64B'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD4517B\'s bidirectional three-state taps (each tap is an output when WRITE ENABLE is LOW and an input — loading internal stages 17/33/49 — when WRITE ENABLE is HIGH), so its outputs are not driven. Pinout verified vs TI/Harris CD4517B SCHS075 terminal assignment read as 300-dpi PDF page images. See issues.md B2 and C4.',
  },
};
