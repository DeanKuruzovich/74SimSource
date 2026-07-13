// chips80.js — Block 80: CMOS 4000 series (coverage expansion, Batch 11)
// Single-chip block (parallel-agent run) to avoid colliding with sibling
// chip blocks being authored concurrently in this same working directory.
// Pinout verified against the primary TI datasheet (CD4066B, SCHS051J,
// Table 4-1 "Pin Functions" — read directly from the PDF pages, not a
// WebFetch summary). See CMOS-4000-Coverage-Plan.md, Batch 11.
// Chips: CD4066
export const CHIPS_BLOCK_80 = {

  // ── CD4066: Quad bilateral switch (14-pin) ──────────────────────────────
  // Source: Texas Instruments, "CD4066B CMOS Quad Bilateral Switch",
  //   SCHS051J (Nov. 1998, rev. Aug. 2024). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4066b.pdf. Verified: terminal
  //   assignment (Fig. 4-1 + Table 4-1 "Pin Functions"), function table
  //   (Table 7-1: control HIGH passes, control LOW = Hi-Z), on-resistance
  //   (Sec. 5.5, rON typ 125 Ω @ 15 V, 180 Ω @ 10 V, 470 Ω @ 5 V; max ~1050 Ω
  //   @ 5 V), and control-high threshold V_IHC (3.5 V @ 5 V, 7 V @ 10 V,
  //   11 V @ 15 V) — every pin number and figure read as 300-dpi PDF page
  //   images, not a text summary (issues.md C4). Pinout is CORRECT as
  //   entered; engine (pinout[], gates[]) left untouched.
  // Source: Texas Instruments, "CD4016B CMOS Quad Bilateral Switch",
  //   SCHS026E (Nov. 1998, rev. Aug. 2024). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4016b.pdf. Verified: 280 Ω typ
  //   on-resistance @ 15 V (Features, p. 1, read as a PDF page image). Used
  //   only for the CD4016-vs-CD4066 comparison number (an earlier draft said
  //   "~400 Ω", which no datasheet supports — corrected to 280 Ω). TI's
  //   CD4066B datasheet states the CD4066 is "pin-for-pin compatible with the
  //   CD4016B device, but exhibits a much lower on-state resistance."
  'CD4066': {
    name: 'CD4066',
    simpleName: 'Quad Bilateral Switch',
    description: 'Quad bilateral switch, CMOS; CD4016-compatible, lower RON (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    onResistance: 125,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4066b.pdf',
    tags: ['cmos', '4000 series', 'analog switch', 'bilateral switch', 'transmission gate', 'multiplexer', 'quad'],
    guideOverview: 'The CD4066 holds four analog switches you turn on and off with logic levels. Each switch is just a controllable low-resistance connection between two pins: when its control pin is HIGH the two signal terminals are joined (about 125 ohm at a 15 V supply) and a signal flows either way through them — there is no fixed input or output. When the control is LOW the connection opens and the terminals are isolated. It passes both analog and digital signals, so people reach for it to route or gate signals under digital control: multiplexers, signal choppers, modulators, and simple routing. Because the closed switch is real silicon and not a perfect wire, it has resistance, and that resistance rises as you lower the supply. The CD4066 is pin-for-pin compatible with the older CD4016 but has lower on-resistance (about 125 ohm vs 280 ohm at 15 V) that stays nearly flat across the signal swing, which means less distortion.',
    guidePinDescriptions: {
      XA:   'Switch A signal terminal 1 (IN/OUT). Bidirectional — can be input or output.',
      YA:   'Switch A signal terminal 2 (OUT/IN). Bidirectional — can be input or output.',
      XB:   'Switch B signal terminal 1 (IN/OUT).',
      YB:   'Switch B signal terminal 2 (OUT/IN).',
      XC:   'Switch C signal terminal 1 (IN/OUT).',
      YC:   'Switch C signal terminal 2 (OUT/IN).',
      XD:   'Switch D signal terminal 1 (IN/OUT).',
      YD:   'Switch D signal terminal 2 (OUT/IN).',
      CTLA: 'Control for switch A. HIGH = switch closed (XA↔YA connected); LOW = open (Hi-Z).',
      CTLB: 'Control for switch B. HIGH = closed, LOW = open.',
      CTLC: 'Control for switch C. HIGH = closed, LOW = open.',
      CTLD: 'Control for switch D. HIGH = closed, LOW = open.',
      VSS:  'Ground / negative supply (0 V). Low-voltage power pin.',
      VDD:  'Positive supply. Accepts 3 V to 18 V.',
    },
    pinout: [
      { pin:  1, name: 'XA',   type: 'bidir', description: 'Switch A signal IN/OUT' },
      { pin:  2, name: 'YA',   type: 'bidir', description: 'Switch A signal OUT/IN' },
      { pin:  3, name: 'YB',   type: 'bidir', description: 'Switch B signal OUT/IN' },
      { pin:  4, name: 'XB',   type: 'bidir', description: 'Switch B signal IN/OUT' },
      { pin:  5, name: 'CTLB', type: 'input', description: 'Control for switch B (HIGH = closed)' },
      { pin:  6, name: 'CTLC', type: 'input', description: 'Control for switch C (HIGH = closed)' },
      { pin:  7, name: 'VSS',  type: 'power', description: 'Ground / low-voltage power pin (0 V)' },
      { pin:  8, name: 'XC',   type: 'bidir', description: 'Switch C signal IN/OUT' },
      { pin:  9, name: 'YC',   type: 'bidir', description: 'Switch C signal OUT/IN' },
      { pin: 10, name: 'YD',   type: 'bidir', description: 'Switch D signal OUT/IN' },
      { pin: 11, name: 'XD',   type: 'bidir', description: 'Switch D signal IN/OUT' },
      { pin: 12, name: 'CTLD', type: 'input', description: 'Control for switch D (HIGH = closed)' },
      { pin: 13, name: 'CTLA', type: 'input', description: 'Control for switch A (HIGH = closed)' },
      { pin: 14, name: 'VDD',  type: 'power', description: 'Positive supply (3-18 V)' },
    ],
    gates: [
      { type: 'BILATERAL_SWITCH', inputs: ['XA', 'YA', 'CTLA'], outputs: ['XA', 'YA'] },
      { type: 'BILATERAL_SWITCH', inputs: ['XB', 'YB', 'CTLB'], outputs: ['XB', 'YB'] },
      { type: 'BILATERAL_SWITCH', inputs: ['XC', 'YC', 'CTLC'], outputs: ['XC', 'YC'] },
      { type: 'BILATERAL_SWITCH', inputs: ['XD', 'YD', 'CTLD'], outputs: ['XD', 'YD'] },
    ],
    guideSections: [
      {
        title: 'How each switch works',
        paragraphs: [
          'Inside each switch is a CMOS transmission gate: an N-channel and a P-channel transistor wired in parallel. The control pin turns both on together or both off together. With both on, the pair forms a low-resistance path that conducts in either direction; with both off, the path is broken. Using both transistor types is what lets the switch pass the full voltage range between the supply rails cleanly, instead of one type dropping out partway.',
          'There is no dedicated input or output. Either signal terminal can be the source — current flows whichever way the outside circuit pushes it. That is what "bilateral" means, and it is the main thing that separates one of these switches from a logic gate, which only ever drives one direction. Each of the four switches has its own control pin, so they are fully independent.',
        ],
        formulas: [
          'CONTROL = HIGH  →  switch closed:  signal terminals joined, signal passes either way',
          'CONTROL = LOW   →  switch open:    terminals isolated, high impedance (Hi-Z)',
        ],
        note: '74Sim models a closed switch as a plain resistor (~125 ohm) stamped between the two signal terminals, so any voltage between the rails passes through and loads the source like a real divider; an open switch is a clean break. Distortion, bandwidth limits, charge injection, leakage, and below-ground (VEE) operation are not modeled — real analog behavior is more involved than this.',
      },
      {
        title: 'On-resistance: it is a resistor, not a perfect wire',
        paragraphs: [
          'A closed switch is not a dead short. It has an on-resistance (RON), and that resistance forms a voltage divider with whatever the signal drives into. Feed a high-impedance load (say 10 kilohm or more, like a logic input or an op-amp input) and the loss across the switch is small. Drive a low-impedance load and the signal sags noticeably. Rule of thumb: keep the load impedance much larger than RON.',
          'RON depends strongly on the supply voltage. Typical values are about 125 ohm at a 15 V supply, 180 ohm at 10 V, and 470 ohm at 5 V (and it can climb toward 1 kilohm at 5 V over temperature). Running the chip from a higher supply gives a lower, flatter switch resistance. That is the CD4066\'s main advantage over the older CD4016, whose on-resistance is higher (about 280 ohm at 15 V) and varies more as the signal swings — which shows up as distortion.',
        ],
      },
      {
        title: 'Driving it correctly (the common gotchas)',
        paragraphs: [
          'The control pin is a logic input referenced to the chip\'s own supply, and its HIGH threshold scales with that supply — roughly 0.7 x VDD (about 3.5 V at a 5 V supply, 7 V at 10 V, 11 V at 15 V). The classic beginner mistake is powering the chip at 15 V but driving the control from 5 V logic: 5 V never crosses the 11 V threshold, so the switch never fully turns on. Match the control HIGH level to the chip\'s supply.',
          'The signal you switch must stay between the supply rails: VSS <= signal <= VDD. On a single 0-to-VDD supply that means signals above ground only. To pass a signal that swings below ground (audio centered on 0 V, for example), tie VSS to a negative rail (VEE) so the whole swing fits between VSS and VDD.',
        ],
      },
      {
        title: 'Common uses',
        list: [
          'Analog multiplexer: connect several sources to one line, and close only the switch you want.',
          'Signal gating or chopping: pass or block an audio or sensor signal under digital control.',
          'Modulators, demodulators, and squelch: switch a signal on and off at a controlled rate.',
          'Bidirectional routing: steer a signal between two nodes, either direction.',
          'Sample-and-hold front gate — though TI recommends the CD4016 for sample-and-hold, where its characteristics suit that job better.',
        ],
      },
    ],
  },

};
