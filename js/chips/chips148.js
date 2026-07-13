// chips148.js  Block 148: CMOS 4000-series coverage expansion (Batch 13, Math).
// Single-chip block: CD40182 (look-ahead carry generator), authored standalone
// in its own file to avoid colliding with other agents editing the shared chip
// files during this parallel run.
//
// Pinout + behavior verified against the part's OWN datasheet family (issues.md
// C2: never copy a sibling's pin map; issues.md C4: never trust a PDF text
// summary — read the rendered page images). Three independent datasheets were
// read and cross-checked; all three give the identical standardized 16-pin DIP
// map (JEDEC standard no. 7A / MS-001), so the pin numbers below are corroborated
// three ways:
//
//   Primary (CMOS, the exact part family):
//     Source: SGS-Thomson Microelectronics, "HCC/HCF40182B — Look-Ahead Carry
//       Generator", doc. ref. S-3436 (June 1989). [Online]. Available:
//       http://doc.chipfind.ru/pdf/stmicroelectronics/hcf40182b.pdf
//       Verified: PIN CONNECTIONS diagram + TERMINAL DESIGNATIONS TABLE +
//       FUNCTIONAL DIAGRAM, read as rendered PDF page images (pp. 1-2). Map:
//       G1(1) P1(2) G0(3) P0(4) G3(5) P3(6) P(7) VSS(8) Cn+z(9) G(10) Cn+y(11)
//       Cn+x(12) Cn(13) G2(14) P2(15) VDD(16). The datasheet states the carry
//       generate (Gn) and carry propagate (Pn) inputs and the group G/P outputs
//       are ACTIVE-LOW, while the carry input Cn and the carry outputs
//       Cn+x/Cn+y/Cn+z are ACTIVE-HIGH; "designed for use with HCC/HCF40181B ALU"
//       (= CD40181) and "similar to industry type MC14582."
//
//   Cross-reference 1 (bipolar S182, full pin-designation table + connection
//   diagram, used to corroborate the pin numbers):
//     Source: Fairchild Semiconductor, "DM74S182 — Look-Ahead Carry Generator",
//       doc. DS006474 (Aug. 1986, rev. Mar. 2000). [Online]. Available:
//       https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/1135/DM74S182.pdf
//       Verified: Connection Diagram + Pin Designations table, page 1, read as a
//       rendered PDF page image. G0/G1/G2/G3 = pins 3/1/14/5 (active-LOW carry
//       generate), P0/P1/P2/P3 = pins 4/2/15/6 (active-LOW carry propagate),
//       Cn = 13, Cn+x/Cn+y/Cn+z = 12/11/9, G = 10, P = 7, VCC = 16, GND = 8 —
//       identical to the CMOS map above.
//
//   Cross-reference 2 (CMOS logic equations + active-LOW/active-HIGH convention):
//     Source: Philips Semiconductors, "74HC/HCT182 — Look-ahead carry generator",
//       File under Integrated Circuits IC06 (Dec. 1990). [Online]. Available:
//       https://digsys.upc.edu/csd/chips/classic/SN74HCT182.pdf
//       Verified: General Description + logic equations, page 2, read as a
//       rendered PDF page image. Confirms Cn+x = G0 + P0·Cn,
//       Cn+y = G1 + P1·G0 + P1·P0·Cn, Cn+z = G2 + P2·G1 + P2·P2·G0 + P2·P1·P0·Cn,
//       group G = G3 + P3·G2 + P3·P2·G1 + P3·P2·P1·G0, group P = P3·P2·P1·P0, and
//       that the Pn/Gn inputs and G/P outputs are active-LOW while Cn and the
//       Cn+x/y/z carries are active-HIGH.
//
// Engine mapping: reuses the existing CARRY_LOOKAHEAD primitive
// (js/specificChipsSim.js _evaluateCarryLookahead) with NO engine work — already
// driven by the pre-existing 74x182 entry. NOTE on polarity: the silicon's Gn/Pn
// inputs and group G/P outputs are active-LOW, but the 74Sim engine models the
// whole 181/182 family in plain POSITIVE logic (active-HIGH), exactly as the
// CD40181 ALU_4BIT primitive emits its P/G. So in the simulator a CD40181's
// (active-high modeled) P/G feed straight into this chip's (active-high modeled)
// P/G inputs and the carries come out active-high — internally consistent, even
// though both polarities are inverted relative to real silicon. This is the same
// approximation already documented for the shared P/G path (issues.md C16); it
// does not affect the carry data path itself. The standardized 74x182 entry in
// this repo (chips13.js) carries a DIFFERENT, non-standard pin map — it was NOT
// used as the source here (see issues.md C18).

export const CHIPS_BLOCK_148 = {

  // ── CD40182: COS/MOS look-ahead carry generator (16-pin) ───────────────────
  'CD40182': {
    name: 'CD40182',
    simpleName: 'Look-ahead carry generator',
    description: 'CMOS look-ahead carry generator for four 4-bit ALU slices (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'http://doc.chipfind.ru/pdf/stmicroelectronics/hcf40182b.pdf',
    tags: ['cmos', '4000 series', 'carry', 'lookahead', 'alu', 'arithmetic', 'combinational'],
    guideOverview: 'The CD40182 is the CMOS version of the 74182 look ahead carry generator. It is the partner chip to the CD40181 ALU. When you chain several CD40181 slices to add or subtract wide numbers, the carry normally has to ripple from the lowest slice to the highest, and each stage adds delay. The CD40182 reads the carry propagate (P) and carry generate (G) signals from up to four slices and works out all of their carries at the same time, so the whole group settles in roughly one gate delay instead of four. It also produces its own group P and G outputs, so several CD40182 chips can be stacked to look ahead across even wider words. Being CMOS, it runs from 3 V to 18 V and draws almost no current when idle.',
    guidePinDescriptions: {
      'G0': 'Carry generate from ALU slice 0. A slice asserts generate when it makes a carry on its own, regardless of any carry coming in.',
      'P0': 'Carry propagate from ALU slice 0. A slice asserts propagate when it would pass an incoming carry straight through.',
      'G1': 'Carry generate from ALU slice 1.',
      'P1': 'Carry propagate from ALU slice 1.',
      'G2': 'Carry generate from ALU slice 2.',
      'P2': 'Carry propagate from ALU slice 2.',
      'G3': 'Carry generate from ALU slice 3.',
      'P3': 'Carry propagate from ALU slice 3.',
      'Cn': 'Carry into the whole group; the carry coming into the least significant slice.',
      'Cn_x': 'Carry out of slice 0, i.e. the carry into slice 1. Cn_x = G0 or (P0 and Cn).',
      'Cn_y': 'Carry out of slice 1, i.e. the carry into slice 2.',
      'Cn_z': 'Carry out of slice 2, i.e. the carry into slice 3.',
      'P': 'Group carry propagate. Asserted when all four slices would propagate, so a carry entering the group would pass all the way through.',
      'G': 'Group carry generate. Asserted when the group makes a carry of its own, independent of the group carry in.',
    },
    guideSections: [
      {
        title: 'Why look-ahead beats ripple carry',
        paragraphs: [
          'When you add two numbers, the carry out of each bit can depend on the carry into it. If every stage waits for the stage below to finish, the delay piles up: an 8 bit add waits on 8 carries in a row. Look-ahead breaks that chain. Each ALU slice reports two facts that do not depend on the incoming carry: generate (G), meaning this slice makes a carry no matter what, and propagate (P), meaning this slice would pass an incoming carry through. From just the P and G bits the CD40182 computes every carry in the group directly.',
          'The carry into slice 1 is Cn_x = G0 or (P0 and Cn): slice 0 either makes its own carry, or it passes the group carry in. The next two carries follow the same idea with more terms, and all three appear together in about one gate delay instead of rippling stage by stage.',
        ],
        formulas: [
          'Cn_x = G0 + P0*Cn',
          'Cn_y = G1 + P1*G0 + P1*P0*Cn',
          'Cn_z = G2 + P2*G1 + P2*P1*G0 + P2*P1*P0*Cn',
          'P = P3*P2*P1*P0',
          'G = G3 + P3*G2 + P3*P2*G1 + P3*P2*P1*G0',
        ],
      },
      {
        title: 'Building wider adders',
        paragraphs: [
          'One CD40182 handles a group of four ALU slices, which is up to 16 bits when each slice is a 4 bit CD40181. Its own group P and G outputs describe that whole group the same way a single slice describes itself, so a second CD40182 can look ahead across four such groups, and so on. This tree of look-ahead chips is how fast 32 and 64 bit adders were built before adders moved inside single chips.',
        ],
      },
      {
        title: 'Active-low signals on the real chip',
        paragraphs: [
          'On the real CD40182 the generate and propagate signals (both the G/P inputs and the group G/P outputs) are active-low: a LOW pin means the signal is true. The carry input Cn and the three carry outputs are active-high in the usual way. The CD40181 ALU produces its P and G in the matching active-low form, so on hardware the two chips wire together directly. 74Sim simplifies this by modeling the whole family in plain active-high logic, so in the simulator a HIGH on a P or G pin means the signal is true. The carry results are identical either way; only the labeling of the P and G pins differs from the datasheet.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'G1',   type: 'input',  description: 'Carry generate from slice 1 (active-low on real silicon)' },
      { pin:  2, name: 'P1',   type: 'input',  description: 'Carry propagate from slice 1 (active-low on real silicon)' },
      { pin:  3, name: 'G0',   type: 'input',  description: 'Carry generate from slice 0 (active-low on real silicon)' },
      { pin:  4, name: 'P0',   type: 'input',  description: 'Carry propagate from slice 0 (active-low on real silicon)' },
      { pin:  5, name: 'G3',   type: 'input',  description: 'Carry generate from slice 3 (active-low on real silicon)' },
      { pin:  6, name: 'P3',   type: 'input',  description: 'Carry propagate from slice 3 (active-low on real silicon)' },
      { pin:  7, name: 'P',    type: 'output', description: 'Group carry propagate (active-low on real silicon)' },
      { pin:  8, name: 'GND',  type: 'power',  description: 'Ground reference (VSS)' },
      { pin:  9, name: 'Cn_z', type: 'output', description: 'Carry into slice 3' },
      { pin: 10, name: 'G',    type: 'output', description: 'Group carry generate (active-low on real silicon)' },
      { pin: 11, name: 'Cn_y', type: 'output', description: 'Carry into slice 2' },
      { pin: 12, name: 'Cn_x', type: 'output', description: 'Carry into slice 1' },
      { pin: 13, name: 'Cn',   type: 'input',  description: 'Carry into the group (active-high)' },
      { pin: 14, name: 'G2',   type: 'input',  description: 'Carry generate from slice 2 (active-low on real silicon)' },
      { pin: 15, name: 'P2',   type: 'input',  description: 'Carry propagate from slice 2 (active-low on real silicon)' },
      { pin: 16, name: 'VCC',  type: 'power',  description: 'Positive supply (VDD), 3 V to 18 V' },
    ],
    // Reuses the existing CARRY_LOOKAHEAD primitive. Input/output pin-name
    // contract matches the 74x182 entry, verified in js/specificChipsSim.js
    // _evaluateCarryLookahead:
    //   inputs:  [P0, G0, P1, G1, P2, G2, P3, G3, Cn]
    //   outputs: [Cn_x, Cn_y, Cn_z, P, G]
    gates: [
      { type: 'CARRY_LOOKAHEAD', inputs: ['P0', 'G0', 'P1', 'G1', 'P2', 'G2', 'P3', 'G3', 'Cn'], outputs: ['Cn_x', 'Cn_y', 'Cn_z', 'P', 'G'] },
    ],
  },

};
