// chips155.js — Block 155: CMOS 4000 series logic ICs (coverage expansion).
// Single chip: CD4006 (18-stage static shift register).
//
// Pinout + behavior verified by reading a datasheet PDF page as a rendered
// image (Read with pages:), NOT via the WebFetch text summarizer which mangles
// these scans (see issues.md C4). The primary TI URL (cd4006b.pdf) currently
// 404s, so the second-source SYC Semiconductores datasheet was used — it is a
// verbatim reproduction of the TI/RCA "CD4006B CMOS 18-Stage Static Register"
// data, including the CD4006BM TOP VIEW pinout and the Functional Diagram.
// IEEE-style references are in the chip header comment below.
//
// Why a dedicated engine primitive: the coverage-plan hint
// SHIFT_REG_SISO / SHIFT_REG_16BIT_STUB did NOT fit. SHIFT_REG_SISO is the
// 7491 — a single 8-stage chain whose data is A AND B and which shifts on the
// RISING edge. SHIFT_REG_16BIT_STUB is an inert HiZ stub. The CD4006 is fully
// modelable: four independent sections (4 + 5 + 4 + 5 = 18 stages) on a common
// clock, shifting on the FALLING edge, plus a half-cycle-delayed cascade output
// (D1+4'). A new SHIFT_REG_18BIT_4006 primitive models all of it.
//
// NOTE: this part lives alone in its own block file to avoid edit collisions
// with the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md for the roadmap.
// Chips: CD4006
export const CHIPS_BLOCK_155 = {

  // ── CD4006: 18-stage static shift register (14-pin) ──────────────────────
  /* Source: SYC Semiconductores y Componentes, "CD4006 — CMOS 18-Stage Static
     Register" (second-source reproduction of the TI/RCA CD4006B data sheet),
     n.d. [Online]. Available:
     https://www.sycelectronica.com.ar/semiconductores/CD4006.pdf
     Verified: terminal assignment (CD4006BM TOP VIEW) + Functional Diagram +
     Description, page 1, read as a rendered ~300-dpi PDF page image (issues.md
     C4 — the TI cd4006b.pdf URL 404s; text summaries of these scans hallucinate
     pinouts so the page was read as an image instead).
     Pinout (14-lead DIP): 1=D1, 2=D1+4', 3=CLOCK, 4=D2, 5=D3, 6=D4, 7=VSS,
       8=D4+4, 9=D4+5, 10=D3+4, 11=D2+4, 12=D2+5, 13=D1+4, 14=VDD.
     Functional diagram: section 1 = D1→4 stages→D1+4, plus a latch→D1+4';
       section 2 = D2→4 stages (tap D2+4)→1 stage→D2+5;
       section 3 = D3→4 stages→D3+4;
       section 4 = D4→4 stages (tap D4+4)→1 stage→D4+5.
     Behavior (Description): "A common clock signal is used for all stages. Data
       are shifted to the next stages on negative-going transitions of the
       clock." (i.e. the falling edge.) "To facilitate cascading ... an optional
       output (D1+4') that is delayed one-half clock-cycle is provided."
     Cross-checked the structural summary (4+5+4+5 stages, output tap at the
       fourth stage, falling-edge shift, cascade modulos 4/5/8/9/10/12/13/14/
       16/17/18) against the TI product-page description text and the RCA-format
       datasheet; the SYC scan was trusted for the exact pin numbers because it
       was read as an image rather than a summary. */
  'CD4006': {
    name: 'CD4006',
    simpleName: '18-Stage Static Shift Register',
    description: '18-stage static shift register, four sections, CMOS 4000 (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    sequential: true,
    datasheet: 'https://www.sycelectronica.com.ar/semiconductores/CD4006.pdf',
    tags: ['cmos', '4000 series', 'shift register', 'serial', 'SISO', 'delay line', 'sequential'],
    guideOverview: 'The CD4006 is an 18-stage static shift register split into four separate sections — two of 4 stages and two of 5 stages — that all share one clock. Each section has its own serial data input (D1–D4) and its own output. Data move one stage forward on every falling (negative-going) edge of the clock. Because the sections are independent, you wire them together externally to build whatever length you need: a single section gives 4 or 5 stages of delay; chaining sections gives 8, 9, 10, 12, 13, 14, 16, 17 or the full 18 stages from one package. The two 5-stage sections also bring out a tap at their 4th stage (D2+4, D4+4), and section 1 provides an extra output, D1+4′, that is the same data delayed half a clock cycle — handy when cascading chips with slow clock edges. It is "static," so the stored bits hold indefinitely with the clock stopped HIGH or LOW; no refresh is needed. Typical uses: serial delay lines, frequency division, and time-delay circuits.',
    guidePinDescriptions: {
      D1:       'Serial data input to section 1 (4 stages). Sampled on each falling clock edge.',
      "D1+4'":  "Section-1 output delayed one HALF clock cycle past D1+4. Provided to ease cascading when clock edges are slow.",
      CLOCK:    'Common clock for all four sections. Data shift forward one stage on each falling (HIGH→LOW) edge.',
      D2:       'Serial data input to section 2 (5 stages).',
      D3:       'Serial data input to section 3 (4 stages).',
      D4:       'Serial data input to section 4 (5 stages).',
      'D4+4':   'Tap at the 4th stage of section 4.',
      'D4+5':   'Output of section 4 (5th / last stage).',
      'D3+4':   'Output of section 3 (4th / last stage).',
      'D2+4':   'Tap at the 4th stage of section 2.',
      'D2+5':   'Output of section 2 (5th / last stage).',
      'D1+4':   'Output of section 1 (4th / last stage).',
      VSS:      'Negative supply / ground (0 V).',
      VDD:      'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'D1',     type: 'input',  description: 'Serial data input, section 1 (4 stages)' },
      { pin:  2, name: "D1+4'",  type: 'output', description: "Section-1 output delayed one half clock cycle (cascade aid)" },
      { pin:  3, name: 'CLOCK',  type: 'input',  description: 'Common clock — shifts all sections on the falling edge' },
      { pin:  4, name: 'D2',     type: 'input',  description: 'Serial data input, section 2 (5 stages)' },
      { pin:  5, name: 'D3',     type: 'input',  description: 'Serial data input, section 3 (4 stages)' },
      { pin:  6, name: 'D4',     type: 'input',  description: 'Serial data input, section 4 (5 stages)' },
      { pin:  7, name: 'VSS',    type: 'power',  description: 'Ground (0 V)' },
      { pin:  8, name: 'D4+4',   type: 'output', description: 'Tap at the 4th stage of section 4' },
      { pin:  9, name: 'D4+5',   type: 'output', description: 'Output of section 4 (5th / last stage)' },
      { pin: 10, name: 'D3+4',   type: 'output', description: 'Output of section 3 (4th / last stage)' },
      { pin: 11, name: 'D2+4',   type: 'output', description: 'Tap at the 4th stage of section 2' },
      { pin: 12, name: 'D2+5',   type: 'output', description: 'Output of section 2 (5th / last stage)' },
      { pin: 13, name: 'D1+4',   type: 'output', description: 'Output of section 1 (4th / last stage)' },
      { pin: 14, name: 'VDD',    type: 'power',  description: 'Positive supply (3–18 V)' },
    ],
    gates: [
      { type: 'SHIFT_REG_18BIT_4006',
        inputs: ['D1', 'D2', 'D3', 'D4', 'CLOCK'],
        outputs: ['D1+4', "D1+4'", 'D2+4', 'D2+5', 'D3+4', 'D4+4', 'D4+5'] },
    ],
    guideSections: [
      {
        title: 'Four sections, one clock, falling-edge shift',
        paragraphs: [
          'Each section is an independent chain of D flip-flops. A bit on a section’s data input (D1–D4) enters the first stage on the next falling clock edge, then moves one stage forward on every falling edge after that. Section 1 is 4 stages deep, so a bit reaches D1+4 four clocks after it went in. Section 3 is also 4 stages (D3+4). Sections 2 and 4 are 5 stages deep, and they bring out both the 4th-stage tap (D2+4, D4+4) and the final 5th stage (D2+5, D4+5).',
          'The shift happens on the negative-going (HIGH→LOW) clock edge — the opposite of most 74-series registers. Because the chip is static, the contents hold as long as you want with the clock parked at either level; you do not have to keep clocking to retain data.',
          'D1+4′ is the same data as D1+4 but delayed one half clock cycle. It exists only to make chaining reliable: when several chips are cascaded and the clock edges are slow, feeding the next chip from the half-cycle-delayed output avoids a race.',
        ],
        list: [
          'Single 4-stage delay: feed D1, read D1+4. Single 5-stage delay: feed D2, read D2+5.',
          'Build longer delays by wiring one section’s output to the next section’s input: 4+4=8, 4+5=9, 5+5=10, up to all four sections = 18 stages.',
          'Use the 4th-stage taps (D2+4, D4+4) to grab an intermediate length out of a 5-stage section.',
          'Serial delay lines, simple frequency division, and time-delay circuits are the datasheet’s named applications.',
        ],
        note: 'The CD4006 shifts on the FALLING clock edge (datasheet: "Data are shifted ... on negative-going transitions of the clock"). 74Sim models all four sections plus the half-cycle D1+4′ cascade latch with the dedicated SHIFT_REG_18BIT_4006 primitive. As with every 74Sim sequential part there is no propagation delay (issues.md A1): the settled stage data is correct, but the real chip’s tiny stage-to-stage delays are not reproduced.',
      },
    ],
  },

};
