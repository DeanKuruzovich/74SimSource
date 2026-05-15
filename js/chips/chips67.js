// chips67.js Block 67: NE555/556/558 Timer ICs
// The 555 timer is not a 74 series part but is one of the most widely used
// ICs in electronic circuits. It supports astable (free-running oscillator)
// and monostable (one-shot) modes via external RC networks.
//
// The simulator evaluates the 555's internal comparators against actual
// analog voltages from the MNA solver capacitor charging/discharging
// through resistors produces real RC waveforms that cross the 1/3 and
// 2/3 VCC thresholds, driving the internal SR flip-flop and DISCHARGE
// open-collector output.

export const CHIPS_BLOCK_67 = {

  // ── NE555: Timer IC (8-pin DIP) ────────────────────────────────────────
  /* Primary source: Texas Instruments, NE555 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/ne555.pdf
     https://en.wikipedia.org/wiki/Electronic_oscillator */
  // Standard pinout:
  //   Pin 1: GND        Pin 8: VCC
  //   Pin 2: TRIG       Pin 7: DISCH
  //   Pin 3: OUT        Pin 6: THRESH
  //   Pin 4: RESETn     Pin 5: CTRL
  '555': {
    name: '555',
    simpleName: '555 Timer',
    description: 'Timer IC astable/monostable via external RC (analog comparator model) (8-pin)',
    pins: 8,
    vcc: 8,
    gnd: 1,
    datasheet: 'https://www.ti.com/lit/ds/symlink/ne555.pdf',
    tags: ['timer', '555', 'oscillator', 'monostable', 'astable', 'NE555', 'LM555', 'RC'],
    guideOverview: 'The 555 is a general-purpose timer built around two comparators, an SR latch, and a discharge transistor. In normal timing circuits the capacitor voltage moves between about 1/3 VCC and 2/3 VCC; when it crosses those levels, the OUTPUT and DISCHARGE pins change state. In 74Sim that RC behavior is simulated from the actual analog voltages on the board, so astable and monostable circuits behave like charge-and-discharge timing networks rather than fixed digital delays.',
    guidePinDescriptions: {
      GND: 'Ground reference for the timer. Connect it to the GND rail.',
      TRIG: 'Trigger input. When this pin falls below about 1/3 VCC, the timer starts and OUTPUT goes HIGH. Common use: a short low pulse from a button, comparator, or RC edge.',
      OUT: 'Push-pull output. This is the timed HIGH/LOW signal that drives the rest of your circuit.',
      RESETn: 'Active LOW reset. Pulling it LOW forces OUTPUT LOW and turns on DISCHARGE immediately. Tie it to VCC if you are not using reset.',
      CTRL: 'Control-voltage input. It shifts the internal threshold levels away from their usual values. Common use: leave the default thresholds alone, or decouple this pin lightly to GND to reduce noise.',
      THRESH: 'Threshold input. When this pin rises above about 2/3 VCC, the timing interval ends and OUTPUT goes LOW.',
      DISCH: 'Discharge transistor connection. When OUTPUT is LOW, this pin sinks current to ground so the timing capacitor can empty.',
      VCC: 'Positive supply input. Powers the internal divider, comparators, latch, and output stage.',
    },
    pinout: [
      { pin: 1, name: 'GND',    type: 'power'  },
      { pin: 2, name: 'TRIG',   type: 'input'  },
      { pin: 3, name: 'OUT',    type: 'output' },
      { pin: 4, name: 'RESETn', type: 'input'  },
      { pin: 5, name: 'CTRL',   type: 'input'  },
      { pin: 6, name: 'THRESH', type: 'input'  },
      { pin: 7, name: 'DISCH',  type: 'output' },
      { pin: 8, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      {
        type: 'TIMER_555',
        inputs:  ['TRIG', 'THRESH', 'RESETn', 'CTRL'],
        outputs: ['OUT', 'DISCH'],
      },
    ],
    guideSections: [
      {
        title: 'Astable Mode',
        image: {
          src: 'assets/555_Astable_Diagram.png',
          alt: '555 timer astable mode diagram',
          caption: 'Astable wiring makes the 555 free-run, repeatedly charging and discharging the timing capacitor.',
          citation: { href: 'https://commons.wikimedia.org/wiki/File:555_Bistabiel_digitaal.svg', title: 'Philip Bosma, CC BY-SA 3.0, via Wikimedia Commons' },
        },
        paragraphs: [
          'In astable mode the 555 runs as an oscillator, so OUTPUT keeps switching HIGH and LOW without needing a fresh trigger each cycle.',
          'The usual wiring is: tie TRIG and THRESH together, connect a capacitor from that node to GND, run R1 from VCC to DISCH, and run R2 from DISCH to the TRIG/THRESH node. RESET should be held HIGH.',
        ],
        formulas: [
          'tHIGH ~= 0.693 * (R1 + R2) * C',
          'tLOW ~= 0.693 * R2 * C',
          'f ~= 1.44 / ((R1 + 2 * R2) * C)',
          'Duty cycle ~= (R1 + R2) / (R1 + 2 * R2)',
        ],
        list: [
          'Common uses: blinkers, square-wave clocks, tone generators, and repeating pulse sources.',
          'The capacitor charges through R1 and R2 until it reaches about 2/3 VCC, then discharges through R2 until it falls below about 1/3 VCC.',
        ],
        note: 'The basic astable wiring naturally gives a duty cycle above 50 percent because charging happens through two resistors while discharging happens through one.',
      },
      {
        title: 'Monostable Mode',
        image: {
          src: 'assets/555_Monostable.png',
          alt: '555 timer monostable mode diagram',
          caption: 'Monostable wiring turns a short trigger pulse into one longer output pulse.',
          citation: { href: 'https://commons.wikimedia.org/wiki/File:555_Monostable.svg', title: 'Inductiveload, Public domain, via Wikimedia Commons' },
        },
        paragraphs: [
          'In monostable mode the 555 waits in a stable idle state until TRIG sees a brief LOW pulse. That one event creates one output pulse of a predictable length.',
          'After the trigger, the timing capacitor charges through R. When the capacitor reaches about 2/3 VCC, OUTPUT goes LOW again and DISCHARGE quickly resets the capacitor for the next trigger.',
        ],
        formulas: [
          'Pulse width ~= 1.1 * R * C',
        ],
        list: [
          'Common uses: debounce timing, pulse stretching, one-shot delays, and clean single pulses from noisy edges.',
          'Tie RESET HIGH if unused, and keep CTRL quiet unless you intentionally want voltage-controlled timing.',
        ],
      },
      {
        title: 'Other 555 Modes',
        paragraphs: [
          'This guide focuses on astable and monostable because they are the two most common starting points on a breadboard.',
          'The 555 can also be wired as a bistable latch, a Schmitt trigger, or a control-voltage / PWM circuit, and those modes could be documented with dedicated examples later.',
          'Another common variation is the diode-assisted astable circuit, which separates the charge and discharge paths so the duty cycle can drop below 50 percent.',
        ],
        },
    ],
  },


  // ── NE556: Dual Timer IC (14-pin DIP) ──────────────────────────────────
  /* Primary source: Texas Instruments, NE556 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/ne556.pdf
     https://en.wikipedia.org/wiki/Electronic_oscillator */
  // Two independent 555-equivalent timers in one package.
  // Standard pinout:
  //   Timer A: DISCH(1) THRESH(2) CTRL(3) RESETn(4) OUT(5) TRIG(6)
  //   Shared:  GND(7)  VCC(14)
  //   Timer B: TRIG(8) OUT(9) RESETn(10) CTRL(11) THRESH(12) DISCH(13)
  '556': {
    name: '556',
    simpleName: '556 Dual Timer',
    description: 'Dual timer IC two independent 555-equivalent timers in one 14-pin package. Each timer supports astable/monostable via external RC.',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/ne556.pdf',
    tags: ['timer', '556', 'dual', 'oscillator', 'monostable', 'astable', 'NE556', 'RC'],
    guideOverview: 'The 556 contains two independent 555 timers in a 14-pin DIP. Both timers share a common VCC and GND, but each has its own TRIG, THRESH, DISCH, OUT, RESETn, and CTRL pins. Everything that works with a 555 works with each half of a 556. Common uses include generating two different timing signals or chaining Timer A output to Timer B trigger for sequential one-shots.',
    guidePinDescriptions: {
      DISCH_A: 'Discharge (Timer A). Open-collector output; sinks current to GND when OUT_A is LOW to discharge the timing capacitor.',
      THRESH_A: 'Threshold (Timer A). When this rises above about 2/3 VCC the timer resets and OUT_A goes LOW.',
      CTRL_A: 'Control voltage (Timer A). Overrides the internal 2/3 VCC reference. Leave unconnected (or bypass to GND with a small cap) when not in use.',
      RESETn_A: 'Active LOW reset (Timer A). Pulling LOW immediately forces OUT_A LOW and turns on DISCH_A. Tie to VCC if unused.',
      OUT_A: 'Output (Timer A). Push-pull; HIGH during timing interval.',
      TRIG_A: 'Trigger (Timer A). When this falls below about 1/3 VCC, the timer sets and OUT_A goes HIGH.',
      GND: 'Ground reference. Shared by both timers.',
      TRIG_B: 'Trigger (Timer B). When this falls below about 1/3 VCC, the timer sets and OUT_B goes HIGH.',
      OUT_B: 'Output (Timer B). Push-pull; HIGH during timing interval.',
      RESETn_B: 'Active LOW reset (Timer B). Tie to VCC if unused.',
      CTRL_B: 'Control voltage (Timer B). Overrides the internal 2/3 VCC reference. Bypass to GND with a small cap when not in use.',
      THRESH_B: 'Threshold (Timer B). When this rises above about 2/3 VCC the timer resets and OUT_B goes LOW.',
      DISCH_B: 'Discharge (Timer B). Open-collector output; sinks to GND when OUT_B is LOW.',
      VCC: 'Positive supply. Shared by both timers. Typical 5 V to 15 V.',
    },
    pinout: [
      { pin:  1, name: 'DISCH_A',  type: 'output' },
      { pin:  2, name: 'THRESH_A', type: 'input'  },
      { pin:  3, name: 'CTRL_A',   type: 'input'  },
      { pin:  4, name: 'RESETn_A', type: 'input'  },
      { pin:  5, name: 'OUT_A',    type: 'output' },
      { pin:  6, name: 'TRIG_A',   type: 'input'  },
      { pin:  7, name: 'GND',      type: 'power'  },
      { pin:  8, name: 'TRIG_B',   type: 'input'  },
      { pin:  9, name: 'OUT_B',    type: 'output' },
      { pin: 10, name: 'RESETn_B', type: 'input'  },
      { pin: 11, name: 'CTRL_B',   type: 'input'  },
      { pin: 12, name: 'THRESH_B', type: 'input'  },
      { pin: 13, name: 'DISCH_B',  type: 'output' },
      { pin: 14, name: 'VCC',      type: 'power'  },
    ],
    gates: [
      {
        type: 'TIMER_555',
        inputs:  ['TRIG_A', 'THRESH_A', 'RESETn_A', 'CTRL_A'],
        outputs: ['OUT_A', 'DISCH_A'],
      },
      {
        type: 'TIMER_555',
        inputs:  ['TRIG_B', 'THRESH_B', 'RESETn_B', 'CTRL_B'],
        outputs: ['OUT_B', 'DISCH_B'],
      },
    ],
    guideSections: [
      {
        title: 'Using the 556 as a Chained One-Shot',
        paragraphs: [
          'One common use for the 556 is to chain the two timers so that Timer A output triggers Timer B. Wire OUT_A through an RC differentiator to TRIG_B and you get a second pulse of a different length every time Timer A fires.',
          'Both timers can also run in astable mode simultaneously, generating two independent square waves at different frequencies from the same chip.',
        ],
        list: [
          'Timer A astable: tie TRIG_A and THRESH_A together, add timing RC, hold RESETn_A HIGH.',
          'Timer B monostable: connect OUT_A to TRIG_B (with a 0.01 µF coupling cap), hold RESETn_B HIGH.',
          'Each timer follows the standard 555 formulas: pulse = 1.1 × R × C, frequency = 1.44 / ((R1 + 2×R2) × C).',
        ],
        note: 'RESETn_A and RESETn_B must be tied HIGH if you are not using the reset feature. Leaving them floating can cause unpredictable behavior.',
      },
    ],
  },

  // ── NE558: Quad Timer IC (16-pin DIP) ──────────────────────────────────
  /* Primary source: NE558 datasheet   URL not yet verified.
     https://en.wikipedia.org/wiki/Electronic_oscillator */
  // Four simplified 555-equivalent timers in one package.
  // Each timer has TRIG, OUT, and DISCH (DISCH doubles as THRESH the timing
  // capacitor connects to DISCH/THRESH and GND). One shared RESETn and one
  // shared CTRL pin.
  // Standard pinout:
  //   Pin 1: RESETn (shared, active LOW)
  //   Timer A: TRIG(2) OUT(3) DISCH(4)
  //   Timer B: TRIG(5) OUT(6) DISCH(7)
  //   GND(8)
  //   Timer C: DISCH(9) OUT(10) TRIG(11)
  //   Timer D: DISCH(12) OUT(13) TRIG(14)
  //   VCC(15)  CTRL(16) shared control voltage
  '558': {
    name: '558',
    simpleName: '558 Quad Timer',
    description: 'Quad timer IC four simplified 555-equivalent timers in one 16-pin package. Each timer has TRIG, OUT, and a combined DISCH/THRESH pin.',
    pins: 16,
    vcc: 15,
    gnd: 8,
    datasheet: 'https://www.alldatasheet.com/datasheet-pdf/pdf/17980/PHILIPS/NE558.html',
    tags: ['timer', '558', 'quad', 'monostable', 'NE558', 'RC', 'one-shot'],
    guideOverview: 'The 558 contains four independent simplified timer sections in a 16-pin DIP. Each section works like a 555 except that the THRESH and DISCH roles are merged into a single pin (DISCH). The timing capacitor connects from DISCH to GND; when the timer fires, DISCH goes HiZ and the cap charges through the external resistor until it crosses 2/3 VCC, which resets the output. A shared reset (active LOW) forces all four outputs LOW simultaneously, and a shared CTRL pin adjusts the reference voltage for all timers at once.',
    guidePinDescriptions: {
      RESETn: 'Active LOW reset, shared by all four timers. When LOW, all OUT pins are forced LOW and all DISCH pins sink to GND. Tie to VCC when unused.',
      TRIG_A: 'Trigger (Timer A). When this falls below about 1/3 VCC, OUT_A goes HIGH and DISCH_A releases.',
      OUT_A:  'Output (Timer A). HIGH during timing interval.',
      DISCH_A: 'Discharge / Threshold (Timer A). Open-collector; sinks to GND when OUT_A is LOW. When HIGH-Z the timing capacitor charges; when capacitor voltage exceeds ~2/3 VCC the timer resets.',
      TRIG_B: 'Trigger (Timer B). Falls below 1/3 VCC to start timer B.',
      OUT_B:  'Output (Timer B).',
      DISCH_B: 'Discharge / Threshold (Timer B). Combined DISCH and THRESH pin.',
      GND: 'Ground reference. Shared by all timers.',
      DISCH_C: 'Discharge / Threshold (Timer C). Combined DISCH and THRESH pin.',
      OUT_C:  'Output (Timer C).',
      TRIG_C: 'Trigger (Timer C).',
      DISCH_D: 'Discharge / Threshold (Timer D). Combined DISCH and THRESH pin.',
      OUT_D:  'Output (Timer D).',
      TRIG_D: 'Trigger (Timer D).',
      VCC: 'Positive supply. Shared by all four timers.',
      CTRL: 'Shared control voltage. Overrides the internal 2/3 VCC reference for all four timers. Bypass to GND with a small cap when not in use.',
    },
    pinout: [
      { pin:  1, name: 'RESETn',  type: 'input'  },
      { pin:  2, name: 'TRIG_A',  type: 'input'  },
      { pin:  3, name: 'OUT_A',   type: 'output' },
      { pin:  4, name: 'DISCH_A', type: 'output' },
      { pin:  5, name: 'TRIG_B',  type: 'input'  },
      { pin:  6, name: 'OUT_B',   type: 'output' },
      { pin:  7, name: 'DISCH_B', type: 'output' },
      { pin:  8, name: 'GND',     type: 'power'  },
      { pin:  9, name: 'DISCH_C', type: 'output' },
      { pin: 10, name: 'OUT_C',   type: 'output' },
      { pin: 11, name: 'TRIG_C',  type: 'input'  },
      { pin: 12, name: 'DISCH_D', type: 'output' },
      { pin: 13, name: 'OUT_D',   type: 'output' },
      { pin: 14, name: 'TRIG_D',  type: 'input'  },
      { pin: 15, name: 'VCC',     type: 'power'  },
      { pin: 16, name: 'CTRL',    type: 'input'  },
    ],
    gates: [
      // Each section: inputs=[TRIG, DISCH_as_THRESH, RESETn, CTRL], outputs=[OUT, DISCH]
      // DISCH pin serves as both the threshold-sense input and the discharge output.
      {
        type: 'TIMER_558_SECTION',
        inputs:  ['TRIG_A', 'DISCH_A', 'RESETn', 'CTRL'],
        outputs: ['OUT_A',  'DISCH_A'],
      },
      {
        type: 'TIMER_558_SECTION',
        inputs:  ['TRIG_B', 'DISCH_B', 'RESETn', 'CTRL'],
        outputs: ['OUT_B',  'DISCH_B'],
      },
      {
        type: 'TIMER_558_SECTION',
        inputs:  ['TRIG_C', 'DISCH_C', 'RESETn', 'CTRL'],
        outputs: ['OUT_C',  'DISCH_C'],
      },
      {
        type: 'TIMER_558_SECTION',
        inputs:  ['TRIG_D', 'DISCH_D', 'RESETn', 'CTRL'],
        outputs: ['OUT_D',  'DISCH_D'],
      },
    ],
    guideSections: [
      {
        title: 'Monostable (One-Shot) Operation',
        paragraphs: [
          'Each 558 timer section fires a single timed pulse when TRIG drops below about 1/3 VCC. Connect a resistor from VCC to DISCH and a capacitor from DISCH to GND. When the trigger fires, DISCH goes HiZ and the cap starts charging.',
          'When the cap voltage crosses about 2/3 VCC, OUT returns LOW and DISCH pulls the cap back to GND, resetting the timer for the next trigger.',
        ],
        formulas: [
          'Pulse width ~= 1.1 × R × C',
        ],
        list: [
          'Tie RESETn HIGH if not using the reset feature.',
          'CTRL can be bypassed to GND through a small cap (0.01 µF) for noise immunity, or left floating to use the default 2/3 VCC threshold.',
          'Four independent timers share power and reset, saving board space versus four separate 555s.',
        ],
        note: 'Unlike the 555 and 556, the 558 does not support astable (free-running) mode because the THRESH and DISCH pins are combined there is no way to independently control charge vs. discharge paths.',
      },
    ],
  },

};
