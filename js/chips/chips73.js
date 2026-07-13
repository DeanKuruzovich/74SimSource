// chips73.js  Block 73: CMOS 4000 series logic ICs (coverage expansion, Batch 12)
// Timers / monostables. Pinout, truth table and pulse-width formula verified
// directly against the National Semiconductor CD4538BM/CD4538BC datasheet
// (Feb 1988) — read from the PDF, not copied from a sibling part.
// See CMOS-4000-Coverage-Plan.md for the full roadmap.
// Chips: CD4538
export const CHIPS_BLOCK_73 = {

  // ── CD4538: Dual precision retriggerable monostable multivibrator (16-pin) ─
  /* Primary source: ON Semiconductor, MC14538B datasheet. [Online]. Available: https://www.onsemi.com/pdf/datasheet/mc14538b-d.pdf
     Pinout & truth table cross-checked against the National Semiconductor CD4538BM/CD4538BC datasheet (Feb 1988). */
  'CD4538': {
    name: 'CD4538',
    simpleName: 'Dual Precision Monostable (one-shot)',
    description: 'Dual precision retriggerable monostable, active LOW reset (16-pin)',
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.onsemi.com/pdf/datasheet/mc14538b-d.pdf',
    tags: ['cmos', '4000 series', 'monostable', 'multivibrator', 'one shot', 'timer', 'pulse', 'retriggerable', 'dual', 'reset'],
    guideOverview: 'The CD4538 contains two independent precision monostable multivibrators (one-shots). Each section fires a single output pulse of a fixed width set by an external resistor RX and capacitor CX. Two trigger inputs let you pick the edge: A is the negative-edge trigger (fires on A falling while B is held HIGH) and B is the positive-edge trigger (fires on B rising while A is held LOW). Each section is retriggerable — a new trigger during the pulse restarts the timing — and has its own active LOW reset (CD) that immediately ends the pulse and forces Q LOW. The control inputs are internally latched. Because the timing uses a linear CMOS reference, the pulse width follows the simple precision relation PW = RX·CX. It is pin compatible with the (non-precision) CD4528B. Supply voltage 3-15 V.',
    guidePinDescriptions: {
      '1CX':  'Section 1 external timing capacitor pin. The timing capacitor CX connects between this pin and 1RC.',
      '1RC':  'Section 1 RX/CX timing junction. RX ties from here to VDD and CX ties to 1CX; the voltage on this node sets the pulse width.',
      '1CD':  'Section 1 reset (Clear Direct), active LOW. Pull LOW to immediately end the pulse and hold Q LOW; must be HIGH to allow triggering.',
      '1A':   'Section 1 A trigger, negative-edge. A HIGH-to-LOW transition (while 1B is HIGH and 1CD is HIGH) starts the pulse.',
      '1B':   'Section 1 B trigger, positive-edge. A LOW-to-HIGH transition (while 1A is LOW and 1CD is HIGH) starts the pulse.',
      '1Q':   'Section 1 true output. LOW when idle, HIGH for the duration of the timed pulse.',
      '1Qn':  'Section 1 inverted output. HIGH when idle, LOW during the timed pulse.',
      'GND':  'Ground reference (VSS). Connect to 0 V.',
      '2Qn':  'Section 2 inverted output. HIGH when idle, LOW during the timed pulse.',
      '2Q':   'Section 2 true output. LOW when idle, HIGH for the duration of the timed pulse.',
      '2B':   'Section 2 B trigger, positive-edge. A LOW-to-HIGH transition (while 2A is LOW and 2CD is HIGH) starts the pulse.',
      '2A':   'Section 2 A trigger, negative-edge. A HIGH-to-LOW transition (while 2B is HIGH and 2CD is HIGH) starts the pulse.',
      '2CD':  'Section 2 reset (Clear Direct), active LOW. Pull LOW to immediately end the pulse and hold Q LOW.',
      '2RC':  'Section 2 RX/CX timing junction. RX ties from here to VDD and CX ties to 2CX.',
      '2CX':  'Section 2 external timing capacitor pin. The timing capacitor CX connects between this pin and 2RC.',
      'VDD':  'Positive supply. Accepts 3 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: '1CX',  type: 'input',  description: 'Section 1 timing capacitor pin (CX between 1CX and 1RC)' },
      { pin:  2, name: '1RC',  type: 'input',  description: 'Section 1 RX/CX timing junction (RX to VDD, CX to 1CX). Sets pulse width.' },
      { pin:  3, name: '1CD',  type: 'input',  description: 'Section 1 reset (active LOW). LOW forces Q=LOW; HIGH allows triggering.' },
      { pin:  4, name: '1A',   type: 'input',  description: 'Section 1 negative-edge trigger. Falling edge (with 1B HIGH) fires the pulse.' },
      { pin:  5, name: '1B',   type: 'input',  description: 'Section 1 positive-edge trigger. Rising edge (with 1A LOW) fires the pulse.' },
      { pin:  6, name: '1Q',   type: 'output', description: 'Section 1 true output. LOW idle, HIGH during pulse.' },
      { pin:  7, name: '1Qn',  type: 'output', description: 'Section 1 inverted output. HIGH idle, LOW during pulse.' },
      { pin:  8, name: 'GND',  type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin:  9, name: '2Qn',  type: 'output', description: 'Section 2 inverted output. HIGH idle, LOW during pulse.' },
      { pin: 10, name: '2Q',   type: 'output', description: 'Section 2 true output. LOW idle, HIGH during pulse.' },
      { pin: 11, name: '2B',   type: 'input',  description: 'Section 2 positive-edge trigger. Rising edge (with 2A LOW) fires the pulse.' },
      { pin: 12, name: '2A',   type: 'input',  description: 'Section 2 negative-edge trigger. Falling edge (with 2B HIGH) fires the pulse.' },
      { pin: 13, name: '2CD',  type: 'input',  description: 'Section 2 reset (active LOW). LOW forces Q=LOW; HIGH allows triggering.' },
      { pin: 14, name: '2RC',  type: 'input',  description: 'Section 2 RX/CX timing junction (RX to VDD, CX to 2CX). Sets pulse width.' },
      { pin: 15, name: '2CX',  type: 'input',  description: 'Section 2 timing capacitor pin (CX between 2CX and 2RC)' },
      { pin: 16, name: 'VDD',  type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      { type: 'MONOSTABLE_RC', inputs: ['1A', '1B', '1CD', '1RC'], outputs: ['1Q', '1Qn'] },
      { type: 'MONOSTABLE_RC', inputs: ['2A', '2B', '2CD', '2RC'], outputs: ['2Q', '2Qn'] },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Dual Retriggerable Precision One-Shot',
        paragraphs: [
          'Each half of the CD4538 sits idle with Q LOW until a valid trigger arrives. You choose the trigger edge: pulse the A input HIGH-to-LOW while B is held HIGH, or pulse the B input LOW-to-HIGH while A is held LOW. Either valid edge launches a single output pulse of width PW; the other input acts as the gate that arms the trigger.',
          'The part is retriggerable: a new valid edge while the pulse is still HIGH restarts the timing from that moment, so a steady stream of triggers keeps Q HIGH (the basis of a missing-pulse / watchdog detector). The active LOW reset (CD) overrides everything — pull it LOW to abort the pulse immediately and hold Q LOW. The trigger and reset inputs are internally latched.',
        ],
        formulas: [
          'Trigger via A: 1CD = HIGH, 1B = HIGH, 1A falling edge',
          'Trigger via B: 1CD = HIGH, 1A = LOW, 1B rising edge',
        ],
        note: 'In 74Sim the one-shot uses the shared retriggerable RC model: attach the timing resistor RX (to VDD) and capacitor CX (to GND) at the RC pin (2 or 14); the pulse ends when that node charges past the internal threshold. The separate CX pin (1 or 15) is informational. This is the same engine the 74x123 uses.',
      },
      {
        title: 'Setting the Pulse Width',
        paragraphs: [
          'The output pulse width is set by the external RX and CX only — no clock is needed. The CD4538 is the "precision" member of the family: its linear CMOS timing reference gives the clean relation PW = RX·CX (with PW in seconds, RX in ohms, CX in farads), rather than the 0.7·R·C of the bipolar 74x121/74x123 one-shots.',
          'Larger RX or CX lengthens the pulse; there is effectively no upper limit on pulse width. The device does not discharge the timing capacitor through the timing pin on power-down, so no external protection resistor is required.',
        ],
        formulas: [
          'PW = RX · CX   (seconds, ohms, farads)',
        ],
      },
      {
        title: 'Typical Uses',
        list: [
          'Fixed-width pulse / delay generator triggered from a digital edge.',
          'Switch-debounce or noise-gate timer that ignores activity for a set interval.',
          'Missing-pulse / watchdog detector: continuous retriggering holds Q HIGH; a gap lets the pulse time out.',
          'Pulse stretcher to widen a narrow trigger so slower logic can see it.',
        ],
        note: 'Use the CD4528B for the pin-compatible standard (non-precision) version, or the 74x123 for the bipolar dual retriggerable one-shot.',
      },
    ],
  },

};
