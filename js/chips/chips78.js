// chips78.js  Block 78: CMOS 4000 series logic ICs (coverage expansion, Batch 12)
// Monostable / astable multivibrator. Pinout, function table and pulse-width
// formula verified directly against the Texas Instruments CD4047B datasheet
// (SCHS044C, data sheet acquired from Harris Semiconductor, rev. Sept 2003) —
// read from the PDF Terminal Diagram + "Functional Terminal Connections" table,
// not copied from a sibling part (see issues.md C2, the CD4082 lesson).
//
// Shipped as its own standalone block (one chip) to avoid colliding with the
// other parallel chip-add agents editing the shared block files.
// See CMOS-4000-Coverage-Plan.md (Batch 12) for the full roadmap.
// Chips: CD4047
export const CHIPS_BLOCK_78 = {

  // ── CD4047: Low-power monostable / astable multivibrator (14-pin) ───────────
  /* Primary source: Texas Instruments, CD4047B datasheet (SCHS044C, acquired
     from Harris Semiconductor), revised September 2003.
     https://www.ti.com/lit/ds/symlink/cd4047b.pdf
     Pinout read from the Terminal Diagram (top view) and cross-checked against
     the "CD4047B Functional Terminal Connections" table:
       VDD=14, VSS=7; +TRIGGER input=8, -TRIGGER input=6, EXTERNAL RESET=9
       (active HIGH — held to VSS in every monostable row); Q=10, Q-bar=11.
       External R between pins 2 & 3, external C between pins 1 & 3.
       Monostable pulse width t_M(10,11) = 2.48 * R * C. */
  'CD4047': {
    name: 'CD4047',
    simpleName: 'Monostable / Astable Multivibrator',
    description: 'Low-power monostable (+/- edge, retrig.) or astable multivib. (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4047b.pdf',
    tags: ['cmos', '4000 series', 'monostable', 'astable', 'multivibrator', 'one shot', 'timer', 'oscillator', 'pulse', 'retriggerable'],
    guideOverview: 'The CD4047 is a single gatable astable multivibrator that also works as an edge-triggered monostable (one-shot). Only one external resistor R (between pins 2 and 3) and one external capacitor C (between pins 1 and 3) set the timing. In MONOSTABLE mode a single output pulse of width t_M = 2.48*R*C is launched by either a positive-going edge on +TRIGGER (pin 8, with -TRIGGER held LOW) or a negative-going edge on -TRIGGER (pin 6, with +TRIGGER held HIGH). The pulse appears true on Q (pin 10) and complemented on Q-bar (pin 11), and is independent of the trigger pulse duration. Pulsing RETRIGGER (pin 12) while +TRIGGER is HIGH restarts the timing (retriggerable mode). A HIGH on EXTERNAL RESET (pin 9) immediately terminates the output pulse and inhibits triggering. In ASTABLE mode the device free-runs: a HIGH on ASTABLE (pin 5) and/or a LOW on ASTABLE-bar (pin 4) enables a square wave on Q/Q-bar at period 4.40*R*C, with a 50%-duty oscillator output at half that period on OSC OUT (pin 13). Supply 3-18 V.',
    guidePinDescriptions: {
      'C':       'External timing capacitor C connects between this pin and R-C COMMON (pin 3).',
      'R':       'External timing resistor R connects between this pin and R-C COMMON (pin 3).',
      'RCC':     'R-C COMMON: the junction node of the external R and C. Its charge/discharge through R sets the pulse width / oscillation period. (Pin 3 is static-sensitive.)',
      'ASTn':    'ASTABLE-bar, active-LOW astable enable / complement gating input. A LOW here enables free-running operation; used together with ASTABLE for gated oscillation.',
      'AST':     'ASTABLE, active-HIGH astable enable. A HIGH here enables free-running (astable) operation.',
      'TRIGn':   '-TRIGGER, negative-edge monostable trigger. A HIGH-to-LOW transition (while +TRIGGER is held HIGH and RESET is LOW) starts the output pulse.',
      'VSS':     'Negative supply / ground (0 V).',
      'TRIG':    '+TRIGGER, positive-edge monostable trigger. A LOW-to-HIGH transition (while -TRIGGER is held LOW and RESET is LOW) starts the output pulse.',
      'RESET':   'EXTERNAL RESET, active HIGH. A HIGH immediately terminates any output pulse, forces Q LOW, and inhibits triggering. Hold LOW for normal operation.',
      'Q':       'True buffered output. LOW when idle, HIGH for the duration of the timed pulse (monostable) or the square-wave HIGH phase (astable).',
      'Qn':      'Complemented buffered output (Q-bar). HIGH when idle / opposite of Q.',
      'RETRIG':  'RETRIGGER input. Pulsing this (with +TRIGGER HIGH) restarts the timing while the output pulse is still HIGH, giving retriggerable operation.',
      'OSC':     'OSCILLATOR OUTPUT. In astable mode, a 50%-duty square wave at twice the Q frequency (period 2.20*R*C).',
      'VDD':     'Positive supply (3-18 V).',
    },
    pinout: [
      { pin:  1, name: 'C',      type: 'input',  description: 'External timing capacitor C (between C and R-C COMMON pin 3).' },
      { pin:  2, name: 'R',      type: 'input',  description: 'External timing resistor R (between R and R-C COMMON pin 3).' },
      { pin:  3, name: 'RCC',    type: 'input',  description: 'R-C COMMON: junction of external R and C. Its voltage sets the timing.' },
      { pin:  4, name: 'ASTn',   type: 'input',  description: 'ASTABLE-bar (active-LOW astable enable / complement gating).' },
      { pin:  5, name: 'AST',    type: 'input',  description: 'ASTABLE (active-HIGH astable / free-running enable).' },
      { pin:  6, name: 'TRIGn',  type: 'input',  description: '-TRIGGER: negative-edge monostable trigger (with +TRIGGER held HIGH).' },
      { pin:  7, name: 'VSS',    type: 'power',  description: 'Negative supply / ground (0 V).' },
      { pin:  8, name: 'TRIG',   type: 'input',  description: '+TRIGGER: positive-edge monostable trigger (with -TRIGGER held LOW).' },
      { pin:  9, name: 'RESET',  type: 'input',  description: 'EXTERNAL RESET (active HIGH). HIGH terminates the pulse and forces Q LOW.' },
      { pin: 10, name: 'Q',      type: 'output', description: 'True output. LOW idle, HIGH during the timed pulse.' },
      { pin: 11, name: 'Qn',     type: 'output', description: 'Complemented output (Q-bar). HIGH idle.' },
      { pin: 12, name: 'RETRIG', type: 'input',  description: 'RETRIGGER input (restarts timing while pulse is HIGH).' },
      { pin: 13, name: 'OSC',    type: 'output', description: 'OSCILLATOR OUTPUT: 50%-duty square wave at twice the Q frequency (astable mode).' },
      { pin: 14, name: 'VDD',    type: 'power',  description: 'Positive supply (3-18 V).' },
    ],
    gates: [
      // Monostable one-shot: -TRIGGER (a, neg edge) / +TRIGGER (b, pos edge),
      // EXTERNAL RESET is active HIGH (resetActiveHigh), timing sensed at R-C COMMON.
      { type: 'MONOSTABLE_RC', inputs: ['TRIGn', 'TRIG', 'RESET', 'RCC'], outputs: ['Q', 'Qn'], resetActiveHigh: true },
    ],
    sequential: true,
    guideSections: [
      {
        title: 'Monostable (One-Shot) Operation',
        paragraphs: [
          'Sitting idle, Q is LOW. You pick the trigger edge with the two trigger pins. For a positive-edge one-shot, hold -TRIGGER (pin 6) LOW and apply a LOW-to-HIGH edge to +TRIGGER (pin 8). For a negative-edge one-shot, hold +TRIGGER (pin 8) HIGH and apply a HIGH-to-LOW edge to -TRIGGER (pin 6). Either valid edge launches one output pulse; the trigger pulse can be of any duration relative to the output.',
          'The pulse appears true on Q (pin 10) and complemented on Q-bar (pin 11). EXTERNAL RESET (pin 9) is active HIGH and overrides everything: drive it HIGH to abort the pulse immediately and hold Q LOW, then return it LOW to allow triggering again. Pulsing RETRIGGER (pin 12) while +TRIGGER is HIGH restarts the timing for retriggerable / missing-pulse-detector use.',
        ],
        formulas: [
          'Positive-edge trigger: RESET = LOW, -TRIGGER = LOW, +TRIGGER rising edge',
          'Negative-edge trigger: RESET = LOW, +TRIGGER = HIGH, -TRIGGER falling edge',
          'External reset: RESET = HIGH  ->  Q = LOW (pulse aborted)',
        ],
        note: 'In 74Sim the one-shot uses the shared retriggerable RC model (same engine as the 74x123/CD4538): attach the timing resistor R (to VDD) and capacitor C (to GND) at the R-C COMMON pin (3); the pulse ends when that node charges past the internal threshold. The separate C and R pins (1, 2) are informational in the sim. EXTERNAL RESET here is active HIGH (unlike the active-LOW reset on the CD4538).',
      },
      {
        title: 'Setting the Pulse Width',
        paragraphs: [
          'Only one external R and one external C are needed. R connects between pins 2 and 3; C connects between pins 1 and 3. The monostable output pulse width follows the precision relation t_M = 2.48*R*C (seconds, ohms, farads). Larger R or C lengthens the pulse. An internal power-on reset circuit prevents a spurious pulse at power-up.',
        ],
        formulas: [
          'Monostable pulse width:  t_M (pins 10,11) = 2.48 * R * C',
        ],
      },
      {
        title: 'Astable (Free-Running) Operation',
        paragraphs: [
          'Tie ASTABLE (pin 5) HIGH and/or ASTABLE-bar (pin 4) LOW to make the device free-run as an oscillator. The square wave on Q / Q-bar (pins 10, 11) has period t_A = 4.40*R*C, and OSC OUT (pin 13) gives a 50%-duty square wave at twice that frequency (period 2.20*R*C). Gating the ASTABLE inputs lets the circuit be used as a gated multivibrator.',
        ],
        formulas: [
          'Astable Q period:  t_A (pins 10,11) = 4.40 * R * C',
          'Oscillator out period:  t_A (pin 13) = 2.20 * R * C',
        ],
        note: '74Sim models the CD4047 only as the edge-triggered monostable one-shot (Q/Q-bar via the MONOSTABLE_RC engine). The free-running ASTABLE mode, OSC OUT, and the internal divide-by-2 are NOT simulated — pins 4, 5 and 13 carry no behavior. See issues.md for this divergence.',
      },
      {
        title: 'Typical Uses',
        list: [
          'Fixed-width pulse / time-delay generator triggered from a digital edge.',
          'Frequency multiplication, division, and frequency-discriminator timing (astable mode on real hardware).',
          'Envelope detection and missing-pulse / watchdog detection via retriggering.',
          'Switch-debounce or noise-gate one-shot driven from +TRIGGER or -TRIGGER.',
        ],
        note: 'For the dual precision retriggerable one-shot use the CD4538; for the bipolar dual one-shot use the 74x123.',
      },
    ],
  },

};
