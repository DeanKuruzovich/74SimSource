// CMOS 4000-series coverage — CD4007 (dual complementary MOS pair plus inverter).
//
// Shipped in its own standalone block (CHIPS_BLOCK_170) to avoid colliding with
// other agents adding chips in the same working tree (Coverage-Plan §4, hard
// tail; chips-to-add.md CD4007 row).
//
// ── What the part is ─────────────────────────────────────────────────────────
// The CD4007UB is not a logic function — it is a bag of transistors. It contains
// three n-channel and three p-channel enhancement-mode MOSFETs, arranged as three
// complementary (one n + one p) pairs. Each pair has the two gates tied together
// and brought out to a single input pin, so each pair can be used as a CMOS
// inverter. The drain and source terminals of the pairs are brought out to the
// package pins individually, which is the whole point of the chip: you wire the
// transistors yourself into whatever you need. TI's own application list for it is
// inverters, shapers, threshold detectors, *linear amplifiers*, and *crystal
// oscillators* — i.e. mostly ANALOG uses, not logic.
//
// Three pairs (datasheet transistor labels Q1/Q2/Q3):
//   • Q2 pair — fully uncommitted: gates=pin 3, P-drain=1, P-source=2,
//     N-drain=5, N-source=4. Tie source pins to the rails and join the drains to
//     get an inverter; or use the four drain/source pins as separate transistors.
//   • Q3 pair — gates=pin 10, P-drain=11, N-source=9, and the P-source and
//     N-drain are joined internally at pin 12 (the natural inverter output node).
//   • Q1 pair — gates=pin 6; its P-drain sits on pin 14 (VDD) and its N-source on
//     pin 7 (VSS) along with the substrate connections, so it takes the fewest
//     external connections to drop in as an inverter (N-drain=8, P-source=13).
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ──────
// 74Sim is a functional DIGITAL-logic simulator (issues.md scope note). The CD4007
// is a transistor array whose purpose is analog and topology-defined-by-wiring:
// the same chip can be three inverters, a 3-input NAND or NOR (Fig. 2 in the
// datasheet), a high-current driver, a bidirectional transmission gate, or a
// linear amplifier / crystal oscillator biased in its active region. 74Sim has no
// transistor-level (SPICE-style) primitive — it evaluates gates, not individual
// MOSFETs — and it explicitly does not model the unbuffered-inverter linear /
// amplifier behavior the CD4007 is bought for (issues.md A11; the related A2
// idealized-rails and A3 idealized-oscillator limits also bite here). The
// CMOS-4000 coverage plan therefore designated the CD4007 for the "info sheet
// only" hard tail from the start (CMOS-4000-Coverage-Plan.md §5 + the chips-to-add
// hint `GENERIC_STUB (analog part)`, and issues.md §D3). A "working" CD4007 would
// have to guess one fixed wiring (say, three inverters) and silently throw away
// every other use of the part — more misleading than helpful (cf. the A10
// PLL-removal rationale and the CD4054 LCD-driver stub in chips167.js). It is
// added as a documentation entry: the page documents the real part (verified
// pinout, transistor map, uses, design notes), but the chip is hidden from the
// picker and drives no outputs.
//
// ── Sources ──────────────────────────────────────────────────────────────────
// Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
//   "CD4007UB Types — CMOS Dual Complementary Pair Plus Inverter, High-Voltage
//   Types (20-Volt Rating)", SCHS018C (Revised September 2003). [Online].
//   Available: https://www.ti.com/lit/ds/symlink/cd4007ub.pdf. Verified: the
//   "TERMINAL DIAGRAM — Top View" (drawing 92CS-24449) and the "FUNCTIONAL
//   DIAGRAM", page 1 (3-14), read as a 400-dpi rendered PDF page image, cropped
//   and zoomed to read the small per-pin transistor labels (issues.md C4 — the
//   text summarizer is NOT trusted for TI PDFs); corroborated against "Fig. 2 —
//   Sample CMOS logic circuit arrangements using type CD4007UB" (pages 3-15/3-16)
//   whose wiring groupings (e.g. triple inverters, 3-input NAND/NOR, transmission
//   gating) are consistent with the terminal map below. NOT cloned from any
//   sibling chip (issues.md C2 — the CD4082 lesson).
//   Verified 14-pin DIP map (top view): pin 1 = Q2 P-drain, 2 = Q2 P-source,
//   3 = Q2 gates (input), 4 = Q2 N-source, 5 = Q2 N-drain, 6 = Q1 gates (input),
//   7 = VSS / Q1·Q2·Q3 N-substrates / Q1 N-source, 8 = Q1 N-drain,
//   9 = Q3 N-source, 10 = Q3 gates (input), 11 = Q3 P-drain,
//   12 = Q3 N-drain + Q3 P-source (joined internally), 13 = Q1 P-source,
//   14 = VDD / Q1·Q2·Q3 P-substrates / Q1 P-drain.

export const CHIPS_BLOCK_170 = {
  // ── CD4007: Dual Complementary Pair Plus Inverter ──────────────────────────
  'CD4007': {
    name: 'CD4007',
    simpleName: 'dual complementary MOS pair + inverter',
    description: 'Array of 3 n- and 3 p-channel MOSFETs, user-wired — info sheet only',
    guideOverview: 'The CD4007UB is not a fixed logic gate; it is a small bag of transistors you wire up yourself. Inside are three n-channel and three p-channel MOSFETs, grouped as three complementary (one n + one p) pairs. Each pair has its two gates tied together and brought out to a single input pin, so each pair can act as a CMOS inverter. The drain and source terminals are brought out to individual pins, which lets you build inverters, a 3-input NAND or NOR gate, high-current drivers, bidirectional transmission gates, or analog circuits like linear amplifiers and crystal oscillators — all from the one package. One pair has its substrate and supply-rail connections already made internally, so it takes the fewest external wires to use as an inverter. NOTE: 74Sim is a functional digital-logic simulator. It evaluates whole gates, not individual transistors, so it has no way to represent a chip whose behavior is defined by how you wire its bare MOSFETs, and it does not model the linear/amplifier region these transistors are often biased into. This part is therefore provided as a documentation / info-sheet entry only; its terminals are not driven in the simulator.',
    guidePinDescriptions: {
      'Q2PD': 'Q2 P-channel DRAIN (pin 1). One terminal of the pair-2 p-channel transistor.',
      'Q2PS': 'Q2 P-channel SOURCE (pin 2). Tie to VDD to use pair 2 as an inverter.',
      'Q2G':  'Q2 GATES (pin 3). Common gate input for the pair-2 n and p transistors — the input when pair 2 is wired as an inverter.',
      'Q2NS': 'Q2 N-channel SOURCE (pin 4). Tie to VSS to use pair 2 as an inverter.',
      'Q2ND': 'Q2 N-channel DRAIN (pin 5). Join to the Q2 P-drain (pin 1) to form the pair-2 inverter output.',
      'Q1G':  'Q1 GATES (pin 6). Common gate input for the pair-1 transistors (the "plus inverter" pair).',
      'VSS':  'Negative supply / ground (pin 7). Also the n-channel substrate connection for all three pairs and the Q1 n-channel source.',
      'Q1ND': 'Q1 N-channel DRAIN (pin 8). Join to the Q1 P-source (pin 13) to form the pair-1 inverter output.',
      'Q3NS': 'Q3 N-channel SOURCE (pin 9). Tie to VSS to use pair 3 as an inverter.',
      'Q3G':  'Q3 GATES (pin 10). Common gate input for the pair-3 transistors.',
      'Q3PD': 'Q3 P-channel DRAIN (pin 11). Tie to VDD to use pair 3 as an inverter.',
      'Q3O':  'Q3 output node (pin 12). The pair-3 n-channel drain and p-channel source are joined here internally — the natural inverter output for pair 3.',
      'Q1PS': 'Q1 P-channel SOURCE (pin 13). The pair-1 p-channel drain is committed to VDD (pin 14) internally; join this to the Q1 n-channel drain (pin 8) for the inverter output.',
      'VDD':  'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 14. Also the p-channel substrate connection for all three pairs and the Q1 p-channel drain.',
    },
    guideSections: [
      {
        title: 'What the CD4007 is',
        paragraphs: [
          'Most chips in this library do one fixed job: a quad NAND, a decade counter, a shift register. The CD4007 is different. It is a transistor array — six bare MOSFETs (metal-oxide-semiconductor field-effect transistors, the basic switch a CMOS chip is built from) with their pins brought out so you can wire them into whatever you need.',
          'The six transistors are three n-channel and three p-channel, grouped into three complementary pairs. "Complementary" just means one of each type per pair — the same n-over-p arrangement that makes up a normal CMOS inverter. In each pair the two gates (the control terminals) are tied together and brought to one input pin, so feeding a signal to that pin and connecting the sources to the supply rails gives you an inverter.',
        ],
      },
      {
        title: 'What you can build with it',
        paragraphs: [
          'Because the drains and sources are individually accessible, the same chip can be wired many ways. The datasheet shows three independent inverters; a 3-input NAND or NOR gate built by stacking the transistors; high sink- or source-current drivers; and a bidirectional transmission gate (an analog switch).',
          'It is also used as an analog building block: biased in its in-between region rather than fully on or off, a complementary pair acts as a high-gain amplifier, which is how the chip ends up in linear amplifiers, signal shapers, threshold detectors, and crystal oscillators. That flexibility — one part, many circuits — is the reason it exists.',
        ],
      },
      {
        title: 'The "plus inverter" pair',
        paragraphs: [
          'The three pairs are not quite identical. Two of them have all four drain and source terminals free, so you wire everything yourself. The third pair already has some of its connections made inside the package: its substrate and one rail connection are committed, so it drops in as an inverter with the fewest external wires. That is the "plus inverter" in the part\'s name, "dual complementary pair plus inverter."',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          '74Sim simulates logic at the level of whole gates — it asks "what does this NAND output for these inputs," not "what current flows through this one transistor." The CD4007 has no fixed function to simulate: its behavior is whatever you wire the bare transistors to do. Modeling it properly would need a transistor-level (SPICE-style) analog simulator, which 74Sim is not, and many of its real uses are analog — amplifiers and oscillators biased in the linear region — which the digital engine does not model at all (see issues.md A11).',
          'Rather than pick one arbitrary wiring (say, three inverters) and silently hide every other use, this entry documents the real part: its pinout, its transistor map, what it can be built into, and how it is wired. It is hidden from the breadboard picker and drives no outputs. The datasheet linked here is the authority. The CD4007 was designated for this info-sheet treatment in the coverage plan from the start (CMOS-4000-Coverage-Plan.md section D3).',
        ],
      },
    ],
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4007ub.pdf',
    tags: ['transistor array', 'mosfet', 'complementary pair', 'inverter', 'analog', 'amplifier', 'cmos', '4000', 'stub'],
    // Verified terminal assignment — TI/Harris CD4007UB SCHS018C, "TERMINAL
    // DIAGRAM Top View" (drawing 92CS-24449) + "FUNCTIONAL DIAGRAM", page 1,
    // read as a 400-dpi PDF page image, cropped/zoomed for the small per-pin
    // transistor labels (issues.md C4). NOT cloned from any sibling (issues.md C2).
    pinout: [
      { pin: 1,  name: 'Q2PD', type: 'input',  description: 'Q2 P-channel drain.' },
      { pin: 2,  name: 'Q2PS', type: 'input',  description: 'Q2 P-channel source (tie to VDD for an inverter).' },
      { pin: 3,  name: 'Q2G',  type: 'input',  description: 'Q2 gates — common gate input for the pair-2 transistors.' },
      { pin: 4,  name: 'Q2NS', type: 'input',  description: 'Q2 N-channel source (tie to VSS for an inverter).' },
      { pin: 5,  name: 'Q2ND', type: 'output', description: 'Q2 N-channel drain (join to pin 1 for the pair-2 inverter output).' },
      { pin: 6,  name: 'Q1G',  type: 'input',  description: 'Q1 gates — common gate input for the pair-1 transistors.' },
      { pin: 7,  name: 'VSS',  type: 'power',  description: 'Negative supply / ground; n-channel substrates for all pairs; Q1 n-channel source.' },
      { pin: 8,  name: 'Q1ND', type: 'output', description: 'Q1 N-channel drain (join to pin 13 for the pair-1 inverter output).' },
      { pin: 9,  name: 'Q3NS', type: 'input',  description: 'Q3 N-channel source (tie to VSS for an inverter).' },
      { pin: 10, name: 'Q3G',  type: 'input',  description: 'Q3 gates — common gate input for the pair-3 transistors.' },
      { pin: 11, name: 'Q3PD', type: 'input',  description: 'Q3 P-channel drain (tie to VDD for an inverter).' },
      { pin: 12, name: 'Q3O',  type: 'output', description: 'Q3 output node — pair-3 n-channel drain and p-channel source joined internally.' },
      { pin: 13, name: 'Q1PS', type: 'output', description: 'Q1 P-channel source (P-channel drain is committed to VDD; join to pin 8 for the inverter output).' },
      { pin: 14, name: 'VDD',  type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V); p-channel substrates for all pairs; Q1 p-channel drain.' },
    ],
    // Documentation stub: the CD4007 is a bare-transistor array with no fixed
    // function (its circuit is defined by external wiring), and its common analog
    // uses (linear amplifier, oscillator) need transistor-level modeling 74Sim
    // does not have — see issues.md A11/A2/A3 and §D3, and the Coverage-Plan hard
    // tail. GENERIC_STUB leaves the drain/output terminals Hi-Z; the chip is
    // hidden from the picker by the 'stub' tag.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['Q1ND', 'Q1PS', 'Q2PD', 'Q2ND', 'Q3PD', 'Q3O'],
      },
    ],
    note: 'Info sheet only: 74Sim does not simulate the CD4007. It is a bare array of three n-channel and three p-channel MOSFETs (three complementary pairs) whose circuit is defined entirely by how you wire it — and its common uses (linear amplifier, crystal oscillator, transmission gate) are analog/transistor-level, which the digital functional-logic engine does not model (issues.md A11). Pinout + transistor map verified vs TI/Harris CD4007UB SCHS018C terminal diagram, read as a PDF page image, not cloned from a sibling. See Coverage-Plan §D3.',
  },
};
