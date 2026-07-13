// ─────────────────────────────────────────────────────────────────────────────
// chips110.js — CMOS 4000-series coverage expansion (Batch 3)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_110.
//
//   CD40109 — quad low-to-high voltage level shifter, 3-state outputs
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_110 = {
  // ── CD40109: CMOS Quad Low-to-High Voltage Level Shifter, 3-state ─────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), CD40109B datasheet (SCHS099B, Revised January 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40109b.pdf
     Pinout + truth table read directly from the datasheet PDF page images
     (Fig.1 "CD40109B logic diagram (1 of 4 units)" with per-unit pin lists, and
     the Truth Table), rendered at 300 dpi — NOT a text summarizer (issues.md C4),
     and NOT cloned from a sibling (issues.md C2).

     16-pin DIP terminal assignment (from Fig.1 parenthetical pin lists):
       1  VCC  (input-side / low-voltage supply, sets logic-1 input level)
       2  ENABLE A          3  A (in)         4  E (out A)
       5  F (out B)         6  B (in)         7  ENABLE B
       8  VSS  (ground)
       9  ENABLE C         10  C (in)        11  G (out C)
      12  NC
      13  H (out D)        14  D (in)        15  ENABLE D
      16  VDD  (output-side / high-voltage supply, sets logic-1 output level)

     Each of the four channels occupies 3 consecutive pins, mirrored about the
     package: ch1 = 2/3/4, ch2 = 5/6/7, ch3 = 9/10/11, ch4 = 13/14/15; pin 12 is
     NC. Each unit shifts a low-voltage input (logic-1 = VCC) to a higher-voltage
     output (logic-1 = VDD).

     Truth table (per channel):
       IN  ENABLE | OUT
        0     1   |  0      ← non-inverting buffer, enabled
        1     1   |  1
        X     0   |  Z      ← ENABLE LOW → output high-impedance (3-state)

     ENABLE is active HIGH and outputs are non-inverting, so this maps onto the
     existing BUFFER_QUAD_TRI_NHIGH engine primitive (per-channel active-HIGH
     enable, tri-state). 74Sim evaluates the logic digitally — the analog
     level-translation (VCC vs VDD rails) is informational only; the part is also
     usable as a high-to-low shifter when VCC > VDD (datasheet), but the logic
     behavior is identical. */
  'CD40109': {
    name: 'CD40109',
    simpleName: 'Quad Level Shifter (3-state)',
    description: 'Quad low-to-high level shifter, active-HIGH EN, 3-state, dual rail (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40109b.pdf',
    tags: ['cmos', '4000', 'quad', 'level shifter', 'translator', 'tri-state', '3-state', 'buffer', 'dual supply', 'bus', 'driver'],
    guideOverview: 'The CD40109 contains four independent low-to-high voltage level-shifting buffers. Each channel shifts a low-voltage digital input (logic-1 = VCC, pin 1) to a higher-voltage output (logic-1 = VDD, pin 16). Every channel has its own active-HIGH enable: when the enable is HIGH the output follows the input; when it is LOW the output is high-impedance (3-state). The chip has three supply pins — VCC (input/low rail), VDD (output/high rail), and VSS (ground) — and has no restriction on supply-sequencing. When VCC exceeds VDD it instead works as a high-to-low shifter; 74Sim models only the digital logic, so the behavior is the same either way.',
    guidePinDescriptions: {
      VCC: 'Input-stage / low-voltage supply (pin 1). Sets the logic-1 input level. 74Sim treats it as a power pin; logic is evaluated digitally.',
      'ENABLE A': 'Active-HIGH enable for channel A. HIGH → E follows A; LOW → E is high-impedance (3-state).',
      A: 'Channel A data input (low-voltage side).',
      E: 'Channel A 3-state output (high-voltage side).',
      F: 'Channel B 3-state output (high-voltage side).',
      B: 'Channel B data input (low-voltage side).',
      'ENABLE B': 'Active-HIGH enable for channel B.',
      VSS: 'Ground reference (pin 8). Connect to 0 V.',
      'ENABLE C': 'Active-HIGH enable for channel C.',
      C: 'Channel C data input (low-voltage side).',
      G: 'Channel C 3-state output (high-voltage side).',
      NC: 'No connection (pin 12).',
      H: 'Channel D 3-state output (high-voltage side).',
      D: 'Channel D data input (low-voltage side).',
      'ENABLE D': 'Active-HIGH enable for channel D.',
      VDD: 'Output-stage / high-voltage supply (pin 16). Sets the logic-1 output level.',
    },
    pinout: [
      { pin:  1, name: 'VCC',      type: 'power',  description: 'Input/low-voltage supply (sets logic-1 input level)' },
      { pin:  2, name: 'ENABLE A', type: 'input',  description: 'Channel A enable (active HIGH; LOW → E is 3-state)' },
      { pin:  3, name: 'A',        type: 'input',  description: 'Channel A data input' },
      { pin:  4, name: 'E',        type: 'output', description: 'Channel A 3-state output' },
      { pin:  5, name: 'F',        type: 'output', description: 'Channel B 3-state output' },
      { pin:  6, name: 'B',        type: 'input',  description: 'Channel B data input' },
      { pin:  7, name: 'ENABLE B', type: 'input',  description: 'Channel B enable (active HIGH)' },
      { pin:  8, name: 'VSS',      type: 'power',  description: 'Ground (0 V)' },
      { pin:  9, name: 'ENABLE C', type: 'input',  description: 'Channel C enable (active HIGH)' },
      { pin: 10, name: 'C',        type: 'input',  description: 'Channel C data input' },
      { pin: 11, name: 'G',        type: 'output', description: 'Channel C 3-state output' },
      { pin: 12, name: 'NC',       type: 'nc',     description: 'No connection' },
      { pin: 13, name: 'H',        type: 'output', description: 'Channel D 3-state output' },
      { pin: 14, name: 'D',        type: 'input',  description: 'Channel D data input' },
      { pin: 15, name: 'ENABLE D', type: 'input',  description: 'Channel D enable (active HIGH)' },
      { pin: 16, name: 'VDD',      type: 'power',  description: 'Output/high-voltage supply (sets logic-1 output level)' },
    ],
    gates: [
      // BUFFER_QUAD_TRI_NHIGH: inputs are [A,En] pairs per channel; outputs Y1..Y4.
      // Enable HIGH → output follows input; enable LOW → output high-impedance.
      { type: 'BUFFER_QUAD_TRI_NHIGH',
        inputs:  ['A', 'ENABLE A', 'B', 'ENABLE B', 'C', 'ENABLE C', 'D', 'ENABLE D'],
        outputs: ['E', 'F', 'G', 'H'] },
    ],
    guideSections: [
      {
        title: 'Independent Level-Shifting Channels',
        paragraphs: [
          'Each of the four channels is a self-contained level shifter with its own enable, so four different signals can be translated and bus-gated independently rather than sharing a single output-enable.',
          'The input side references VCC (pin 1) and the output side references VDD (pin 16). Driving a low-voltage logic family on the inputs and a higher rail on VDD produces high-voltage outputs; the device places no restriction on the order in which VCC, VDD, and the inputs are applied.',
        ],
        note: '74Sim models the four channels as digital tri-state buffers (active-HIGH enable). The analog voltage-translation between the VCC and VDD rails is informational; logic is evaluated digitally.',
      },
      {
        title: '3-State Outputs',
        paragraphs: [
          'When a channel enable is HIGH the output follows the input (non-inverting). When the enable is LOW the output is released to a high-impedance state, letting several CD40109 outputs share a common bus line.',
        ],
      },
    ],
  },
};
