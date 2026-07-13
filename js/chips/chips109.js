// ─────────────────────────────────────────────────────────────────────────────
// chips109.js — CMOS 4000-series coverage expansion (Batch 3)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_109.
//
//   CD40107 — CMOS dual 2-input NAND buffer/driver, open-drain outputs
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_109 = {
  // ── CD40107: Dual 2-Input NAND Buffer/Driver, open-drain ──────────────────
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), CD40107B datasheet (SCHS098D, Revised October 2003).
     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40107b.pdf
     Pinout + function read directly from the datasheet PDF page images
     (Functional Diagram + Truth Table + TERMINAL ASSIGNMENTS "TOP VIEW" for the
     8-lead CD40107BE) — not a text summarizer (see issues.md C4). NOT cloned
     from a sibling NAND part (see issues.md C2): this is an 8-pin device with two
     2-input NAND gates whose outputs are single n-channel open-drain transistors.
     8-pin DIP map: A(1), B(2), C=NAND(A,B)(3), VSS(4), F=NAND(D,E)(5), E(6),
     D(7), VDD(8). Truth table per gate (output = NAND, open-drain): A·B=00/01/10 →
     output HIGH only via an external pull-up resistor (RL) to VDD; A·B=11 → output
     pulled LOW by the on-chip n-channel transistor. With no pull-up the inactive
     output floats (high-impedance), matching real open-drain behavior — the
     engine auto-applies an implicit pull-up to any Hi-Z OC net (issues.md A8). */
  'CD40107': {
    name: 'CD40107',
    simpleName: 'Dual 2-In NAND Driver',
    description: 'CMOS dual 2-input NAND buffer/driver, open-drain high-sink out (8-pin)',
    pins: 8,
    vcc: 8,
    gnd: 4,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40107b.pdf',
    tags: ['cmos', '4000', 'nand', 'gate', 'dual', 'buffer', 'driver', 'open-drain', 'open collector', 'high-voltage', 'wired-or', 'line driver'],
    guideOverview: 'The CD40107B contains two independent 2-input NAND buffers/drivers. Each gate output is a single n-channel open-drain transistor — it can pull its pin strongly LOW but has no internal pull-up, so it cannot drive a pin HIGH on its own. Add an external pull-up resistor (RL) from each output to VDD: the output then idles HIGH and is pulled LOW only when both inputs of that gate are HIGH (NAND). Because the outputs only sink current, several outputs can share one wire through a single pull-up to form a wired-AND/wired-OR bus, and the high sink capability (≈136 mA typ at VDD=10 V) makes the part useful for driving relays, lamps, LEDs, and as a line driver or level shifter (up or down) over its 3–18 V supply range.',
    guidePinDescriptions: {
      A: 'Input A of gate 1.',
      B: 'Input B of gate 1.',
      C: 'Open-drain output of gate 1: C = NAND(A, B). Needs an external pull-up to VDD; pulls LOW only when A=B=1.',
      D: 'Input D of gate 2.',
      E: 'Input E of gate 2.',
      F: 'Open-drain output of gate 2: F = NAND(D, E). Needs an external pull-up to VDD; pulls LOW only when D=E=1.',
      VSS: 'Negative supply / ground reference (pin 4).',
      VDD: 'Positive supply (+3 to +18 V, pin 8).',
    },
    guideSections: [
      {
        title: 'Open-Drain NAND',
        paragraphs: [
          'Each gate computes the NAND of its two inputs but drives the output through a single n-channel transistor only. When the NAND result is logic 0 (both inputs HIGH) the transistor turns on and pulls the output to VSS. For every other input combination the transistor is off and the output is high-impedance — it floats unless an external pull-up resistor (RL) to VDD holds it HIGH.',
          'Always tie a pull-up resistor from each output (C and F) to VDD. Without it the output cannot reach a valid HIGH level. This simulator auto-applies an implicit pull-up to any undriven open-drain net so the logic still reads correctly, but on real hardware the resistor is mandatory.',
        ],
        formulas: [
          'C = NOT(A AND B)',
          'F = NOT(D AND E)',
          'A=0,B=0 → C=1 (via pull-up) | A=1,B=0 → C=1 | A=0,B=1 → C=1 | A=1,B=1 → C=0 (sinks to VSS)',
        ],
        note: 'Open-drain outputs require an external pull-up resistor to VDD. Without a pull-up the inactive output floats (high-impedance), not HIGH.',
      },
      {
        title: 'Wired-AND and Driving Loads',
        list: [
          'Wired-AND bus: connect several open-drain outputs to one wire with a single pull-up. The line is HIGH only when every gate output is off; any gate pulling LOW wins.',
          'High current sink: drives relays, incandescent lamps, and LEDs directly (≈136 mA typ sink at VDD=10 V, VDS=1 V).',
          'Line driver / level shifter: with VDD set to the destination logic rail, translates levels up or down across the 3–18 V supply range.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'A',   type: 'input'  },
      { pin: 2, name: 'B',   type: 'input'  },
      { pin: 3, name: 'C',   type: 'output' },
      { pin: 4, name: 'VSS', type: 'power'  },
      { pin: 5, name: 'F',   type: 'output' },
      { pin: 6, name: 'E',   type: 'input'  },
      { pin: 7, name: 'D',   type: 'input'  },
      { pin: 8, name: 'VDD', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['A', 'B'], output: 'C' },
      { type: 'NAND', inputs: ['D', 'E'], output: 'F' },
    ],
  },
};
