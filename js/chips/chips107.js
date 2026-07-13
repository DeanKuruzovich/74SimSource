// ─────────────────────────────────────────────────────────────────────────────
// chips107.js — CMOS 4000-series coverage expansion (Batch 3)
//
// Standalone block carrying a single chip so concurrent chip-adder agents do not
// collide on a shared file. Exports CHIPS_BLOCK_107.
//
//   CD4502 — strobed hex inverter/buffer with 3-state outputs
// ─────────────────────────────────────────────────────────────────────────────

export const CHIPS_BLOCK_107 = {
  // ── CD4502: Strobed Hex Inverter/Buffer, 3-state ──────────────────────────
  /* Primary source: Texas Instruments / Harris Semiconductor, CD4502B datasheet
     (SCHS067B, Revised July 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4502b.pdf
     Pinout + truth table read directly from the datasheet PDF page images
     (Functional Diagram + Terminal Assignment "TOP VIEW" + Truth Table), not a
     text summarizer — see issues.md C4. NOT cloned from the 74x366 / hex-buffer
     siblings — the CD4502 has a different pinout AND an extra INHIBIT control
     (see issues.md C2). Pin map (16-pin DIP): D3(1), Q3(2), D1(3),
     OUTPUT DISABLE(4), Q1(5), D2(6), Q2(7), VSS(8), Q4(9), D4(10), Q5(11),
     INHIBIT(12), D5(13), Q6(14), D6(15), VDD(16). */
  'CD4502': {
    name: 'CD4502',
    simpleName: 'Strobed Hex Inverter',
    description: 'Strobed hex inverter/buffer, inhibit, 3-state outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4502b.pdf',
    tags: ['cmos', '4000', 'hex', 'inverter', 'buffer', 'tri-state', '3-state', 'strobe', 'inhibit', 'bus', 'driver'],
    guideOverview: 'The CD4502B is a hex inverting buffer with two common control inputs and 3-state outputs. Each of the six channels normally drives Qn = NOT(Dn). A common OUTPUT DISABLE input (active HIGH) puts all six outputs into the high-impedance state, allowing several devices to share a common bus. A common INHIBIT input (active HIGH) forces all six outputs to logic 0 while OUTPUT DISABLE is LOW — a strobe that blanks the outputs without releasing the bus. The 3-state outputs and common bus-disable simplify system design.',
    guidePinDescriptions: {
      D1: 'Data input 1 (inverted to Q1).',
      D2: 'Data input 2 (inverted to Q2).',
      D3: 'Data input 3 (inverted to Q3).',
      D4: 'Data input 4 (inverted to Q4).',
      D5: 'Data input 5 (inverted to Q5).',
      D6: 'Data input 6 (inverted to Q6).',
      Q1: 'Inverting 3-state output 1 = NOT(D1).',
      Q2: 'Inverting 3-state output 2 = NOT(D2).',
      Q3: 'Inverting 3-state output 3 = NOT(D3).',
      Q4: 'Inverting 3-state output 4 = NOT(D4).',
      Q5: 'Inverting 3-state output 5 = NOT(D5).',
      Q6: 'Inverting 3-state output 6 = NOT(D6).',
      'OUTPUT DISABLE': 'Common output disable (active HIGH). HIGH = all six outputs go to the high-impedance (3-state) condition; LOW = outputs are enabled.',
      INHIBIT: 'Common inhibit/strobe (active HIGH). With OUTPUT DISABLE LOW, a HIGH on INHIBIT forces all six outputs to logic 0; LOW = normal inverting operation.',
      VSS: 'Ground reference (pin 8).',
      VDD: 'Positive supply (+3 V to +18 V; +5 V in this simulator) at pin 16.',
    },
    guideSections: [
      {
        title: 'Strobed inverter with bus disable',
        paragraphs: [
          'With OUTPUT DISABLE and INHIBIT both LOW, each channel is a simple inverting buffer: Qn = NOT(Dn).',
          'Driving INHIBIT HIGH (output-disable still LOW) forces every output to logic 0 — a synchronous "blank" strobe that keeps the outputs actively driven LOW rather than releasing them.',
          'Driving OUTPUT DISABLE HIGH releases all six outputs to high-impedance, so the chip can share a wired bus with other 3-state drivers. OUTPUT DISABLE dominates INHIBIT.',
        ],
        formulas: [
          'Qn = NOT(Dn)                        (DISABLE = 0, INHIBIT = 0)',
          'Qn = 0                              (DISABLE = 0, INHIBIT = 1)',
          'Qn = high-impedance (Z)             (DISABLE = 1)',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'D3',             type: 'input',  description: 'Data input 3' },
      { pin: 2,  name: 'Q3',             type: 'output', description: 'Inverting 3-state output 3 = NOT(D3)' },
      { pin: 3,  name: 'D1',             type: 'input',  description: 'Data input 1' },
      { pin: 4,  name: 'OUTPUT DISABLE', type: 'input',  description: 'Common output disable (active HIGH → all outputs Hi-Z)' },
      { pin: 5,  name: 'Q1',             type: 'output', description: 'Inverting 3-state output 1 = NOT(D1)' },
      { pin: 6,  name: 'D2',             type: 'input',  description: 'Data input 2' },
      { pin: 7,  name: 'Q2',             type: 'output', description: 'Inverting 3-state output 2 = NOT(D2)' },
      { pin: 8,  name: 'VSS',            type: 'power',  description: 'Ground (0 V)' },
      { pin: 9,  name: 'Q4',             type: 'output', description: 'Inverting 3-state output 4 = NOT(D4)' },
      { pin: 10, name: 'D4',             type: 'input',  description: 'Data input 4' },
      { pin: 11, name: 'Q5',             type: 'output', description: 'Inverting 3-state output 5 = NOT(D5)' },
      { pin: 12, name: 'INHIBIT',        type: 'input',  description: 'Common inhibit/strobe (active HIGH → all outputs forced LOW)' },
      { pin: 13, name: 'D5',             type: 'input',  description: 'Data input 5' },
      { pin: 14, name: 'Q6',             type: 'output', description: 'Inverting 3-state output 6 = NOT(D6)' },
      { pin: 15, name: 'D6',             type: 'input',  description: 'Data input 6' },
      { pin: 16, name: 'VDD',            type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      // BUFFER_HEX_INV_TRI in CD4502 "strobedInhibit" mode:
      //   inputs [D1..D6, OUTPUT_DISABLE, INHIBIT], outputs [Q1..Q6].
      //   DISABLE (active HIGH) → Hi-Z; INHIBIT (active HIGH, DISABLE low) → all LOW;
      //   else Qn = NOT(Dn).
      {
        type: 'BUFFER_HEX_INV_TRI',
        strobedInhibit: true,
        inputs:  ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'OUTPUT DISABLE', 'INHIBIT'],
        outputs: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
      },
    ],
  },
};
