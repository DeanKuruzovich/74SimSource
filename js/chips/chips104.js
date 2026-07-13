// chips104.js — Block 104: CMOS 4000 series logic IC (coverage expansion, Batch 2)
// Standalone single-chip block (parallel-agent run) to avoid colliding with the
// other agents editing the shared chip files. Primitive-backed combinational part.
// Pinout + truth table verified against a primary datasheet, read by rasterizing
// the scanned RCA databook PDF (pdftoppm at 300 DPI) and cropping the Functional
// Diagram + Truth Table — the PDF's text layer is garbled OCR and unreliable for
// these scans (issues.md C4). Not cloned from any sibling (C2).
// See CMOS-4000-Coverage-Plan.md for the full roadmap.
// Chips: CD4037
export const CHIPS_BLOCK_104 = {

  // ── CD4037: Triple AND/OR bi-phase pairs (14-pin) ──────────────────────────
  /* Primary source: RCA-CD4037A, "COS/MOS Triple AND/OR Bi-Phase Pairs", in
     "RCA COS/MOS Integrated Circuits" databook (1980), pp. 519–520. Functional
     Diagram (pin assignment) + Truth Table read as a 300-dpi PDF page render.
     Archived: https://bitsavers.org/components/rca/_dataBooks/1980_RCA_COS_MOS_Integrated_Circuits.pdf */
  'CD4037': {
    name: 'CD4037',
    simpleName: 'Triple AND/OR Bi-Phase Pairs',
    description: 'Triple AND/OR bi-phase pair, CMOS 4000, split VCC level shift (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://bitsavers.org/components/rca/_dataBooks/1980_RCA_COS_MOS_Integrated_Circuits.pdf',
    tags: ['cmos', '4000 series', 'and-or', 'and-or-invert', 'bi-phase', 'biphase', 'encoder', 'split-phase'],
    guideOverview: 'The CD4037 contains three identical AND/OR "bi-phase" sections that share two common control inputs, A (pin 4) and B (pin 2). Each section n has one data input Cn and produces a complementary pair of outputs Dn and En, where Dn = NOT((A·C̄n)+(B·Cn)) and En = NOT((A·Cn)+(B·C̄n)). Working through the truth table: with A=B=0 both outputs sit HIGH; with A=1,B=0 the section passes the data straight through (D=C, E=C̄); with A=0,B=1 it passes the data inverted (D=C̄, E=C); with A=B=1 both outputs are forced LOW. Driving A and B with a clock and its complement makes each output a phase-modulated (bi-phase / split-phase) version of the data on Cn — the use the chip was built for: coding/decoding for magnetic tape, disc and drum recording, and plated-wire / core memory. A separate VCC pin (pin 1) supplies the output buffers, letting them swing to any level from 3 V up to VDD for TTL-compatible interfacing. Main supply VDD = pin 14, VSS = pin 7. Supply range 3-12 V.',
    guidePinDescriptions: {
      VCC: 'Output-buffer supply for level conversion (3 V to VDD). Must be ≤ VDD. Sets the HIGH level of the D/E outputs.',
      B: 'Control input B, shared by all three sections.',
      C1: 'Section 1 data input.',
      A: 'Control input A, shared by all three sections.',
      C2: 'Section 2 data input.',
      C3: 'Section 3 data input.',
      GND: 'Ground reference (VSS). Connect to 0 V.',
      D3: 'Section 3 output: D3 = NOT((A·C̄3)+(B·C3)).',
      E3: 'Section 3 output: E3 = NOT((A·C3)+(B·C̄3)). Complement phase of D3.',
      D2: 'Section 2 output: D2 = NOT((A·C̄2)+(B·C2)).',
      E2: 'Section 2 output: E2 = NOT((A·C2)+(B·C̄2)). Complement phase of D2.',
      E1: 'Section 1 output: E1 = NOT((A·C1)+(B·C̄1)). Complement phase of D1.',
      D1: 'Section 1 output: D1 = NOT((A·C̄1)+(B·C1)).',
      VDD: 'Positive supply. Accepts 3 V to 12 V.',
    },
    pinout: [
      { pin:  1, name: 'VCC', type: 'power',  description: 'Output-buffer supply for level conversion (3 V to VDD)' },
      { pin:  2, name: 'B',   type: 'input',  description: 'Control input B (shared by all three sections)' },
      { pin:  3, name: 'C1',  type: 'input',  description: 'Section 1 data input' },
      { pin:  4, name: 'A',   type: 'input',  description: 'Control input A (shared by all three sections)' },
      { pin:  5, name: 'C2',  type: 'input',  description: 'Section 2 data input' },
      { pin:  6, name: 'C3',  type: 'input',  description: 'Section 3 data input' },
      { pin:  7, name: 'GND', type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin:  8, name: 'D3',  type: 'output', description: 'Section 3 output: D3 = NOT((A·C̄3)+(B·C3))' },
      { pin:  9, name: 'E3',  type: 'output', description: 'Section 3 output: E3 = NOT((A·C3)+(B·C̄3))' },
      { pin: 10, name: 'D2',  type: 'output', description: 'Section 2 output: D2 = NOT((A·C̄2)+(B·C2))' },
      { pin: 11, name: 'E2',  type: 'output', description: 'Section 2 output: E2 = NOT((A·C2)+(B·C̄2))' },
      { pin: 12, name: 'E1',  type: 'output', description: 'Section 1 output: E1 = NOT((A·C1)+(B·C̄1))' },
      { pin: 13, name: 'D1',  type: 'output', description: 'Section 1 output: D1 = NOT((A·C̄1)+(B·C1))' },
      { pin: 14, name: 'VDD', type: 'power',  description: 'Positive supply (3-12 V)' },
    ],
    gates: [
      { type: 'AO_BIPHASE_PAIR', inputs: ['A', 'B', 'C1'], outputs: ['D1', 'E1'] },
      { type: 'AO_BIPHASE_PAIR', inputs: ['A', 'B', 'C2'], outputs: ['D2', 'E2'] },
      { type: 'AO_BIPHASE_PAIR', inputs: ['A', 'B', 'C3'], outputs: ['D3', 'E3'] },
    ],
    guideSections: [
      {
        title: 'Coding & Decoding Split-Phase (Bi-Phase) Data',
        paragraphs: [
          'Each section computes a complementary pair of AND-OR-INVERT functions from one data bit Cn and the two shared controls A and B: Dn = NOT((A·C̄n)+(B·Cn)) and En = NOT((A·Cn)+(B·C̄n)). The two controls set the mode for all three sections at once.',
          'The four control states give the chip its name. With A=B=0 both outputs are forced HIGH; with A=B=1 both are forced LOW. The interesting modes are the two single-control states: A=1,B=0 passes the data through (Dn follows Cn, En is its complement), while A=0,B=1 passes it inverted (Dn is the complement, En follows Cn). Feeding A and B a clock and its inverse therefore turns each output into a phase-modulated (bi-phase / split-phase) version of the data — the encoding used for self-clocking serial links and magnetic media, where a clock edge is embedded in every bit cell.',
        ],
        list: [
          'Split-phase (bi-phase) communication coding and decoding.',
          'Disc, drum and tape digital recording read/write channels.',
          'Plated-wire and core memory drive/sense steering.',
          'High-to-low logic-level conversion (separate VCC output supply).',
        ],
        note: '74Sim evaluates each section combinationally and exactly matches the datasheet truth table for static inputs. As with all parts there is no propagation delay (issues.md A1): the settled outputs are exact, but the ns-scale timing relationship between the A/B clock edges and the data — which is what makes a real bi-phase waveform — is not animated.',
      },
    ],
  },

};
