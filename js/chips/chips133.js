// chips133.js — Block 133: CMOS 4000 series logic ICs (coverage expansion).
// CD4034 — 8-stage static bidirectional parallel/serial input/output bus register.
// Pinout + behavior verified by reading the TI/Harris datasheet "CD4034B Types —
// CMOS 8-Stage Static Bidirectional Parallel/Serial Input/Output Bus Register"
// (SCHS037B, data sheet acquired from Harris Semiconductor, Revised June 2003)
// directly as 300-dpi PDF page images (Read with pages:), NOT via the WebFetch text
// summarizer which mangles these scans (see issues.md C4).
// NOTE: this part lives alone in its own block file to avoid edit collisions with
// the other concurrent chip-add agents working in this same tree.
// See CMOS-4000-Coverage-Plan.md (row "4034") for the roadmap.
// Chips: CD4034
//
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4034B Types — CMOS 8-Stage Static Bidirectional Parallel/Serial
//   Input/Output Bus Register", SCHS037B (Revised June 2003).
//   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4034b.pdf
//   Verified: TERMINAL DIAGRAM (TOP VIEW, page 6) — read as a 300-dpi rendered
//   PDF page image and cropped/zoomed to confirm every pin number; FUNCTIONAL /
//   STEERING-LOGIC diagrams (Fig.1 page 2, Fig.11 page 4); the "TRUTH TABLE FOR
//   REGISTER INPUT-LEVELS AND RESULTING REGISTER OPERATION" (page 4); and the
//   PARALLEL/SERIAL OPERATION prose (page 1). NOT cloned from any sibling
//   (issues.md C2) — see the divergence note below.
//
//   VERIFIED TERMINAL DIAGRAM (TOP VIEW), page 6:
//      1  B8                 24 VDD
//      2  B7                 23 A8
//      3  B6                 22 A7
//      4  B5                 21 A6
//      5  B4                 20 A5
//      6  B3                 19 A4
//      7  B2                 18 A3
//      8  B1                 17 A2
//      9  "A" ENABLE (AE)    16 A1
//     10  SERIAL INPUT       15 CLOCK
//     11  A/B                14 A/S
//     12  VSS                13 P/S
//   Note the reversed numbering of each bus: pin 1 = B8 ... pin 8 = B1 down the
//   left side; pin 16 = A1 ... pin 23 = A8 up the right side. A_n and B_n are the
//   two parallel taps of the same register stage n (one acts as input, the other
//   as output, set by A/B). This is the REAL CD4034B assignment, read off its own
//   terminal diagram, NOT assumed from a same-function part.
//
//   HINT MISMATCH (issues.md C2/D-series): the coverage-plan hint
//   SHIFT_REG_8BIT_BIDIR is the 74198 universal shift register (S0/S1 mode select,
//   separate SER_R/SER_L serial inputs, async CLR, one set of parallel inputs A–H
//   and one set of outputs QA–QH). The CD4034 shares none of that architecture: it
//   has TWO 8-bit bidirectional 3-state buses (A and B), a single SERIAL INPUT, and
//   four mode controls P/S (parallel vs serial), A/S (async vs sync), A/B (bus
//   direction) and "A" ENABLE. A dedicated SHIFT_REG_8BIT_BUS_4034 engine primitive
//   was added (see specificChipsSim.js); the 74198 primitive was NOT reused.
//
//   BEHAVIOR (datasheet page 1 + page 4 truth table):
//     • A/B HIGH  → A lines are inputs, B lines are outputs; A/B LOW reverses it.
//     • Serial mode (P/S LOW): SERIAL INPUT shifts in on each positive CLOCK edge
//       (always synchronous — A/S is internally disabled in serial mode). The data
//       appears on the B lines (A/B HIGH) or on the A lines (A/B LOW and AE HIGH).
//     • Parallel mode (P/S HIGH): the input-side bus is jam-loaded into the
//       8 stages — synchronously on the positive CLOCK edge when A/S is LOW, or
//       asynchronously (transparent, no clock) when A/S is HIGH.
//     • "A" ENABLE (AE) gates only the A side: when A is the output side AE must be
//       HIGH to drive it (else A outputs are Hi-Z), letting many registers share one
//       A bus; when A is the input side, AE LOW disables the A input so the register
//       RECIRCULATES (holds) its data — the datasheet's storage mode (A/B HIGH,
//       AE LOW). The B side has no enable: it always drives/loads when selected.
export const CHIPS_BLOCK_133 = {

  // ── CD4034: 8-stage bidirectional parallel/serial I/O bus register (24-pin) ──
  'CD4034': {
    name: 'CD4034',
    simpleName: '8-Stage Bidirectional Parallel/Serial Bus Register',
    description: '8-stage bidirectional parallel/serial 3-state bus register, CMOS (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4034b.pdf',
    tags: ['cmos', '4000 series', 'shift register', 'bus register', '8 bit', 'bidirectional', 'parallel load', 'serial', '3-state', 'sequential'],
    guideOverview: 'The CD4034 is an 8-stage register that sits between two 8-bit data buses, called the A bus and the B bus, and moves data either way between them. Each of its eight storage stages has one pin on the A bus (A1–A8) and one on the B bus (B1–B8); whichever bus is the output side has its eight pins driven by the stored bits, and the other bus acts as the input side. Four control pins set what it does. A/B picks the direction: HIGH makes the A pins inputs and the B pins outputs, LOW reverses that. P/S picks parallel vs serial: HIGH loads or reads all eight bits at once across the bus, LOW shifts data in one bit at a time through the SERIAL INPUT pin on each clock edge. A/S picks how a parallel load happens: LOW = synchronous (on the clock edge), HIGH = asynchronous (immediately, no clock). "A" ENABLE gates the A bus: it must be HIGH for the A pins to drive when A is the output side, which lets several CD4034s share one common A bus; and when A is the input side, holding "A" ENABLE LOW makes the register recirculate (store) its data instead of loading new data. Typical uses are bidirectional bus interfaces, serial-to-parallel and parallel-to-serial conversion, storage/recirculation registers, and sample-and-hold registers for displays.',
    guidePinDescriptions: {
      B8:    'B-bus data line for stage 8 (the last / serial-output stage). Output when A/B is HIGH, input when A/B is LOW.',
      B7:    'B-bus data line for stage 7. Output when A/B is HIGH, input when A/B is LOW.',
      B6:    'B-bus data line for stage 6. Output when A/B is HIGH, input when A/B is LOW.',
      B5:    'B-bus data line for stage 5. Output when A/B is HIGH, input when A/B is LOW.',
      B4:    'B-bus data line for stage 4. Output when A/B is HIGH, input when A/B is LOW.',
      B3:    'B-bus data line for stage 3. Output when A/B is HIGH, input when A/B is LOW.',
      B2:    'B-bus data line for stage 2. Output when A/B is HIGH, input when A/B is LOW.',
      B1:    'B-bus data line for stage 1 (the first / serial-input stage). Output when A/B is HIGH, input when A/B is LOW.',
      AE:    '"A" ENABLE. Gates the A bus. When A is the output side (A/B LOW) it must be HIGH for the A pins to drive, else they go high-impedance — this lets several registers share one A bus. When A is the input side (A/B HIGH), holding it LOW disables the A input so the register recirculates (holds) its stored data.',
      SER:   'SERIAL INPUT. In serial mode (P/S LOW) the bit on this pin is shifted into stage 1 on each rising clock edge; the data shifts on toward stage 8.',
      'A/B': 'Bus direction control. HIGH: A pins are inputs, B pins are outputs. LOW: A pins are outputs, B pins are inputs.',
      VSS:   'Negative supply / ground (0 V), pin 12.',
      'P/S': 'Parallel/Serial mode. HIGH: parallel — all eight bits load or read across the bus at once. LOW: serial — data shifts one bit per clock through SERIAL INPUT.',
      'A/S': 'Asynchronous/Synchronous control for parallel loads. LOW: synchronous, data loads on the rising clock edge. HIGH: asynchronous, data loads immediately with no clock. Internally ignored in serial mode (serial is always synchronous).',
      CLK:   'Clock input. Serial shifts and synchronous parallel loads occur on the rising (LOW-to-HIGH) edge.',
      A1:    'A-bus data line for stage 1 (the first / serial-input stage). Input when A/B is HIGH, output when A/B is LOW.',
      A2:    'A-bus data line for stage 2. Input when A/B is HIGH, output when A/B is LOW.',
      A3:    'A-bus data line for stage 3. Input when A/B is HIGH, output when A/B is LOW.',
      A4:    'A-bus data line for stage 4. Input when A/B is HIGH, output when A/B is LOW.',
      A5:    'A-bus data line for stage 5. Input when A/B is HIGH, output when A/B is LOW.',
      A6:    'A-bus data line for stage 6. Input when A/B is HIGH, output when A/B is LOW.',
      A7:    'A-bus data line for stage 7. Input when A/B is HIGH, output when A/B is LOW.',
      A8:    'A-bus data line for stage 8 (the last / serial-output stage). Input when A/B is HIGH, output when A/B is LOW.',
      VDD:   'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'B8',  type: 'output' },
      { pin:  2, name: 'B7',  type: 'output' },
      { pin:  3, name: 'B6',  type: 'output' },
      { pin:  4, name: 'B5',  type: 'output' },
      { pin:  5, name: 'B4',  type: 'output' },
      { pin:  6, name: 'B3',  type: 'output' },
      { pin:  7, name: 'B2',  type: 'output' },
      { pin:  8, name: 'B1',  type: 'output' },
      { pin:  9, name: 'AE',  type: 'input'  },
      { pin: 10, name: 'SER', type: 'input'  },
      { pin: 11, name: 'A/B', type: 'input'  },
      { pin: 12, name: 'VSS', type: 'power'  },
      { pin: 13, name: 'P/S', type: 'input'  },
      { pin: 14, name: 'A/S', type: 'input'  },
      { pin: 15, name: 'CLK', type: 'input'  },
      { pin: 16, name: 'A1',  type: 'output' },
      { pin: 17, name: 'A2',  type: 'output' },
      { pin: 18, name: 'A3',  type: 'output' },
      { pin: 19, name: 'A4',  type: 'output' },
      { pin: 20, name: 'A5',  type: 'output' },
      { pin: 21, name: 'A6',  type: 'output' },
      { pin: 22, name: 'A7',  type: 'output' },
      { pin: 23, name: 'A8',  type: 'output' },
      { pin: 24, name: 'VDD', type: 'power'  },
    ],
    gates: [
      // SHIFT_REG_8BIT_BUS_4034 — see specificChipsSim.js for the contract.
      //   inputs:  [CLK, P/S, A/S, A/B, AE, SER, A1..A8, B1..B8]
      //   outputs: [A1..A8, B1..B8]   (A_n / B_n are bidirectional; stage 1 = LSB
      //                                / serial-input end, stage 8 = serial out)
      { type: 'SHIFT_REG_8BIT_BUS_4034',
        inputs:  ['CLK', 'P/S', 'A/S', 'A/B', 'AE', 'SER',
                  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
                  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
        outputs: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
                  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'] },
    ],
    guideSections: [
      {
        title: 'Two buses, one register',
        paragraphs: [
          'The CD4034 holds eight bits. Each bit has two pins: one on the A bus (A1–A8) and one on the B bus (B1–B8). At any moment one bus is the output side — its eight pins are driven by the stored bits — and the other bus is the input side, read by the chip. A/B chooses which: A/B HIGH makes A the input side and B the output side; A/B LOW swaps them.',
          'Because each bit reaches the outside world on both buses, the same chip can take data in on one bus and present it on the other, in either direction. That is what "bidirectional bus register" means.',
        ],
        formulas: [
          'A/B = 1 → A pins are inputs,  B pins are outputs',
          'A/B = 0 → A pins are outputs, B pins are inputs',
          'A_n and B_n are the two taps of stage n  (A1/B1 = stage 1 … A8/B8 = stage 8)',
        ],
      },
      {
        title: 'Parallel vs serial, synchronous vs asynchronous',
        paragraphs: [
          'P/S picks how data moves. With P/S HIGH (parallel) all eight stages load from the input-side bus at once, and the output-side bus shows all eight stored bits at once. With P/S LOW (serial) data enters one bit at a time on the SERIAL INPUT pin: on each rising clock edge the new bit goes into stage 1 and every stored bit shifts one stage toward stage 8. Stage 8 (A8/B8) is the serial output you tap when cascading chips.',
          'A/S only matters for a parallel load. A/S LOW makes the load synchronous — the input bus is captured on the rising clock edge. A/S HIGH makes it asynchronous — the input bus passes straight through to the stages with no clock needed (a transparent, level-sensitive load). Serial mode ignores A/S; serial shifting is always clocked.',
        ],
        formulas: [
          'P/S = 1 → parallel (whole byte)      P/S = 0 → serial (one bit per clock)',
          'Parallel, A/S = 0 → load on rising CLK edge (synchronous)',
          'Parallel, A/S = 1 → load immediately, no clock (asynchronous / transparent)',
          'Serial → shift in on rising CLK edge (SERIAL INPUT → stage 1 → … → stage 8)',
        ],
      },
      {
        title: '"A" ENABLE: shared bus and storage mode',
        paragraphs: [
          '"A" ENABLE controls only the A bus. When A is the output side (A/B LOW), the A pins drive only while "A" ENABLE is HIGH; hold it LOW and the A pins go high-impedance. That lets several CD4034s wire their A buses together — only the one with "A" ENABLE HIGH drives the shared bus at a time.',
          'When A is the input side (A/B HIGH), "A" ENABLE LOW disables the A input. With nothing new coming in, each stage recirculates its own value, so the register simply holds its data. The datasheet calls this the storage/recirculation mode (A/B HIGH, "A" ENABLE LOW). The B bus has no enable of its own — it always drives when it is the output side and always loads when it is the input side.',
        ],
        formulas: [
          'A is output side (A/B = 0): AE = 1 → A drives;  AE = 0 → A pins Hi-Z',
          'A is input side  (A/B = 1): AE = 1 → load from A;  AE = 0 → recirculate (hold)',
          'B side: always active (no enable pin)',
        ],
        note: '74Sim models the CD4034 as an ideal 8-stage register: rising-edge clock for serial shifts and synchronous parallel loads, transparent (level) load when A/S is HIGH, and the A-side "A" ENABLE gating both the 3-state A outputs and (as recirculation) the A inputs. The input side is presented as high-impedance (the chip does not drive it). As with all 74Sim sequential parts there is no propagation delay, so the brief master/slave settling of real silicon is not reproduced; the settled data is correct (see issues.md A1). The wide CMOS 3–18 V supply range is collapsed to ideal digital levels (issues.md A2).',
      },
    ],
  },

};
