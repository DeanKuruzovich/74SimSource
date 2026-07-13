// chips139.js — CMOS 4000-series coverage expansion
// CD40257: quad 2-line-to-1-line data selector/multiplexer with 3-state outputs.
// Shipped in its own standalone block (CHIPS_BLOCK_139) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_139 = {
  // ── CD40257B: quad 2-to-1 mux, non-inverting, 3-state outputs (16-pin) ──────
  /* Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
     "CD40257B Types — CMOS Quad 2-Line-to-1-Line Data Selector/Multiplexer",
     SCHS108C (revised October 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd40257b.pdf
     Verified: TERMINAL ASSIGNMENT (TOP VIEW), FUNCTIONAL DIAGRAM, Fig. 1 logic
     diagram and the TRUTH TABLE (all page 1 / page 3), read as 300-dpi rendered
     PDF page images (Read with pages:, NOT the text summarizer — see issues.md C4)
     and NOT cloned from the TTL 74x257 sibling (issues.md C2). The physical pin
     map happens to coincide with the 74x257, but it was confirmed against the
     CD40257B's own terminal assignment.

     Pinout (TOP VIEW), per the datasheet TERMINAL ASSIGNMENT, which agrees with
     the FUNCTIONAL DIAGRAM:
       1=INPUT SELECT, 2=A1, 3=B1, 4=D1(out), 5=A2, 6=B2, 7=D2(out), 8=VSS,
       9=D3(out), 10=B3, 11=A3, 12=D4(out), 13=B4, 14=A4, 15=OUTPUT DISABLE,
       16=VDD.
     The datasheet labels the four outputs D1..D4 (not Y), the select pin
     "INPUT SELECT", and the enable pin "OUTPUT DISABLE".

     Behavior (datasheet TRUTH TABLE): a single OUTPUT DISABLE (active HIGH) and a
     single INPUT SELECT feed all four sections.
       OUTPUT DISABLE=1            → all four D outputs = Z (high impedance)
       OUTPUT DISABLE=0, SELECT=0  → D = A   (non-inverting)
       OUTPUT DISABLE=0, SELECT=1  → D = B   (non-inverting)
     This is the active-HIGH-disable view of the 74257's active-LOW output enable:
     the same pin, HIGH = outputs released to high-Z. Pure combinational — no clock
     or storage (the clocked-storage sibling is the 74298 / MUX_QUAD_2TO1_STORED,
     which does NOT fit this part). Maps directly onto the engine's MUX_2TO1_TRI
     primitive (js/specificChipsSim.js _evaluateMux2to1Tri: inputs [A,B,SEL,OE],
     OE!==0 → high-Z, else SEL ? B : A), one instance per section, with SELECT and
     OUTPUT DISABLE shared across all four. */
  'CD40257': {
    name: 'CD40257',
    simpleName: 'Quad 2-to-1 Mux (TS)',
    description: 'CMOS quad 2-to-1 data selector/mux, 3-state outputs (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd40257b.pdf',
    tags: ['multiplexer', 'mux', '2-to-1', 'data selector', 'quad', 'tri state', 'cmos', '4000 series'],
    guideOverview: 'The CD40257 is four 2-to-1 multiplexers in one package. They share one select line and one output-disable line. The select line picks the A or the B input for all four channels at once, so a whole 4-bit word can be routed from one of two sources. When output disable is HIGH the four outputs go to high impedance, releasing whatever bus they drive.',
    guidePinDescriptions: {
      SEL: 'Shared input select. LOW routes every A input to its output; HIGH routes every B input.',
      OD: 'Output disable, active HIGH. HIGH puts all four outputs into high impedance; LOW lets them drive.',
    },
    guideSections: [
      {
        title: 'Choosing between two sources',
        paragraphs: [
          'Each of the four sections has two data inputs, A and B, and one output. The single select line decides A or B for all four at the same time. That makes it a clean way to swap a whole 4-bit word between two sources without wiring up a separate control for each bit.',
          'The output is non-inverting: the chosen input passes straight through to the output with no logic change.',
        ],
      },
      {
        title: 'Why the outputs can go high impedance',
        paragraphs: [
          'The output-disable line is active HIGH. When it is HIGH the four outputs stop driving and float to high impedance, so the chip can share a bus with other devices. When it is LOW the outputs drive normally. The chip has no clock and no memory: the outputs follow the inputs immediately while enabled.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'SEL', type: 'input' },
      { pin: 2, name: 'A1', type: 'input' },
      { pin: 3, name: 'B1', type: 'input' },
      { pin: 4, name: 'D1', type: 'output' },
      { pin: 5, name: 'A2', type: 'input' },
      { pin: 6, name: 'B2', type: 'input' },
      { pin: 7, name: 'D2', type: 'output' },
      { pin: 8, name: 'GND', type: 'power' },
      { pin: 9, name: 'D3', type: 'output' },
      { pin: 10, name: 'B3', type: 'input' },
      { pin: 11, name: 'A3', type: 'input' },
      { pin: 12, name: 'D4', type: 'output' },
      { pin: 13, name: 'B4', type: 'input' },
      { pin: 14, name: 'A4', type: 'input' },
      { pin: 15, name: 'OD', type: 'input' },
      { pin: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      // Four independent 2-to-1 sections sharing SEL (INPUT SELECT) and OD
      // (OUTPUT DISABLE, active HIGH → high-Z). MUX_2TO1_TRI inputs: [A,B,SEL,OE].
      { type: 'MUX_2TO1_TRI', inputs: ['A1', 'B1', 'SEL', 'OD'], output: 'D1' },
      { type: 'MUX_2TO1_TRI', inputs: ['A2', 'B2', 'SEL', 'OD'], output: 'D2' },
      { type: 'MUX_2TO1_TRI', inputs: ['A3', 'B3', 'SEL', 'OD'], output: 'D3' },
      { type: 'MUX_2TO1_TRI', inputs: ['A4', 'B4', 'SEL', 'OD'], output: 'D4' },
    ],
  },
};
