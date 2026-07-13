// chips71.js — Block 71: Analog companion chips + 2764 EPROM + crystal oscillator
// These are the parts that sit next to the 74-series logic on a real breadboard:
// the LM741 op-amp, LM393 comparator, ULN2003 Darlington driver, LM7805
// regulator, the 2764 UV EPROM, and a DIP-8 crystal oscillator can.
//
// The comparator and op-amp read ACTUAL analog voltages from the MNA solver
// (same mechanism as the 555 timer), so divider/threshold circuits behave like
// real electronics rather than digital pattern matching.

export const CHIPS_BLOCK_71 = {

  // ── LM741: Single op-amp (8-pin DIP) ─────────────────────────────────────
  /* Primary source: Texas Instruments, LM741 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/lm741.pdf
     Op-amp theory: Wikipedia contributors, "Operational amplifier," https://en.wikipedia.org/wiki/Operational_amplifier */
  'LM741': {
    name: 'LM741',
    simpleName: 'Op-Amp',
    description: 'General purpose operational amplifier high gain analog amplifier (8-pin)',
    pins: 8,
    vcc: 7,
    gnd: 4,
    datasheet: 'https://www.ti.com/lit/ds/symlink/lm741.pdf',
    tags: ['op-amp', 'opamp', 'operational amplifier', 'analog', 'amplifier', '741', 'comparator', 'linear'],
    guideOverview: 'The LM741 is the classic general purpose op-amp: a very high gain differential amplifier. The output swings toward the positive supply when IN+ is above IN-, and toward ground when IN- is above IN+. With negative feedback (a resistor path from OUT back to IN-) the gain becomes set by the external resistors instead, which is how amplifiers, followers, and filters are built. In 74Sim the op-amp reads real analog voltages from the board, so it works both open loop (as a crude comparator) and with resistive negative feedback (follower, inverting and non-inverting amplifiers).',
    guidePinDescriptions: {
      'OFS1': 'Offset null 1. On a real 741 a trim potentiometer between the two offset pins cancels the input offset voltage. Not modeled in the simulator leave unconnected.',
      'IN-': 'Inverting input. The output moves DOWN when this input rises above IN+.',
      'IN+': 'Non-inverting input. The output moves UP when this input rises above IN-.',
      'V-': 'Negative supply. Connect to GND in this simulator. (A real 741 normally runs from a split supply such as ±15 V.)',
      'OFS2': 'Offset null 2. Not modeled leave unconnected.',
      'OUT': 'Amplifier output. In the simulator it swings between about 1 V and 4 V the real 741 also cannot reach its supply rails.',
      'V+': 'Positive supply. Connect to the +5 V rail.',
      'NC': 'Not connected.',
    },
    guideSections: [
      {
        title: 'How an Op-Amp Works',
        paragraphs: [
          'An op-amp amplifies the DIFFERENCE between its two inputs by a huge factor (over 100,000 for a real 741). Open loop, the tiniest difference slams the output to one extreme, so the bare chip acts like a comparator.',
          'Negative feedback tames that gain: wire the output back to IN- (directly, or through resistors) and the op-amp continuously adjusts its output so the two inputs stay equal. That single idea gives you followers, amplifiers with precise gain, summers, and filters.',
        ],
        formulas: [
          'Voltage follower: OUT = IN+',
          'Non-inverting amp: OUT = IN+ × (1 + Rf / Rg)',
          'Inverting amp: OUT = -IN × (Rf / Rin)  (needs a mid-rail reference on IN+ in single-supply circuits)',
        ],
      },
      {
        title: 'Single-Supply Limits (and why LM393 exists)',
        paragraphs: [
          'This simulator powers everything from a single +5 V rail. The 741 was designed for split supplies, so on 5 V its usable output range is narrow the simulator models a swing of roughly 1 V to 4 V, mirroring how a real 741 cannot pull its output near either rail.',
          'If you want a clean logic level out of an analog comparison, use the LM393 comparator instead: its open-collector output pulls all the way to ground and (with a pull-up) all the way to 5 V.',
        ],
        note: 'A real LM741 needs at least ±5 V supplies and is a poor choice at 5 V single-supply — it is modeled here because nearly every electronics course starts with it.',
      },
      {
        title: 'Common Uses',
        list: [
          'Voltage follower (buffer): wire OUT directly to IN-; OUT then tracks IN+ without loading the source.',
          'Comparator (crude): leave the loop open; OUT goes high when IN+ > IN-.',
          'Amplifying a sensor divider before feeding a logic input or LED.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'OFS1', type: 'nc',     description: 'Offset null 1 (not modeled; leave unconnected)' },
      { pin: 2, name: 'IN-',  type: 'input',  description: 'Inverting input' },
      { pin: 3, name: 'IN+',  type: 'input',  description: 'Non-inverting input' },
      { pin: 4, name: 'V-',   type: 'power',  description: 'Negative supply connect to GND in this simulator' },
      { pin: 5, name: 'OFS2', type: 'nc',     description: 'Offset null 2 (not modeled; leave unconnected)' },
      { pin: 6, name: 'OUT',  type: 'output', description: 'Amplifier output (swings ~1 V to ~4 V on a 5 V supply)' },
      { pin: 7, name: 'V+',   type: 'power',  description: 'Positive supply (+5 V)' },
      { pin: 8, name: 'NC',   type: 'nc',     description: 'Not connected' },
    ],
    gates: [
      { type: 'OPAMP', inputs: ['IN+', 'IN-'], output: 'OUT' },
    ],
    sequential: true,
  },

  // ── LM393: Dual comparator (8-pin DIP) ───────────────────────────────────
  /* Primary source: Texas Instruments, LM393 datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/lm393.pdf
     Comparator applications: Wikipedia contributors, "Comparator," https://en.wikipedia.org/wiki/Comparator */
  'LM393': {
    name: 'LM393',
    simpleName: 'Dual Comparator',
    description: 'Dual voltage comparator, open-collector outputs (8-pin)',
    pins: 8,
    vcc: 8,
    gnd: 4,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/lm393.pdf',
    tags: ['comparator', 'analog', 'threshold', 'open collector', 'lm393', 'sensor', 'voltage detector', 'linear'],
    guideOverview: 'The LM393 contains two independent voltage comparators with open-collector outputs. Each comparator answers one question: is IN+ above IN-? If yes, the output transistor turns OFF and a pull-up resistor takes the output HIGH; if no, the output transistor pulls the line to ground. This is the standard bridge between the analog world (sensor dividers, RC voltages, thresholds) and digital logic, and unlike the LM741 it is designed for single 5 V supply operation. In 74Sim the inputs read real analog net voltages, and a released output is given an implicit pull-up so it produces clean logic levels out of the box.',
    guidePinDescriptions: {
      '1OUT': 'Comparator 1 output, open collector. Pulled LOW when 1IN- is above 1IN+; released (HIGH via pull-up) when 1IN+ is above 1IN-.',
      '1IN-': 'Comparator 1 inverting input usually the reference threshold.',
      '1IN+': 'Comparator 1 non-inverting input usually the measured signal.',
      'GND': 'Ground reference (pin 4).',
      '2IN+': 'Comparator 2 non-inverting input.',
      '2IN-': 'Comparator 2 inverting input.',
      '2OUT': 'Comparator 2 output, open collector.',
      'VCC': 'Positive supply (+5 V) at pin 8.',
    },
    guideSections: [
      {
        title: 'Comparator Logic',
        paragraphs: [
          'A comparator is an op-amp stripped down for one job: deciding which of two voltages is larger, as fast and as decisively as possible.',
          'Typical wiring: build a reference voltage with a two-resistor divider on IN-, feed the signal you are watching into IN+. The output then tells you, digitally, whether the signal is above the threshold.',
        ],
        formulas: [
          'IN+ > IN-  →  OUT released (HIGH through pull-up)',
          'IN+ < IN-  →  OUT pulled LOW',
        ],
        note: 'The outputs are open collector: a real LM393 needs an external pull-up resistor (1-10 kΩ) to VCC. The simulator supplies an implicit 4.7 kΩ pull-up so the output reads HIGH even without one, but adding the real resistor is good practice.',
      },
      {
        title: 'Common Uses',
        list: [
          'Light/temperature sensor thresholds: divider with a sensor on one input, fixed divider on the other.',
          'Converting a slow RC ramp into a clean logic edge.',
          'Window detectors and zero-crossing detectors (two comparators in one package help here).',
          'Wired-AND alarm lines: several open-collector outputs can share one pulled-up wire.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: '1OUT', type: 'output', description: 'Comparator 1 output (open collector, LOW when 1IN- > 1IN+)' },
      { pin: 2, name: '1IN-', type: 'input',  description: 'Comparator 1 inverting input (reference)' },
      { pin: 3, name: '1IN+', type: 'input',  description: 'Comparator 1 non-inverting input (signal)' },
      { pin: 4, name: 'GND',  type: 'power',  description: 'Ground (0 V)' },
      { pin: 5, name: '2IN+', type: 'input',  description: 'Comparator 2 non-inverting input (signal)' },
      { pin: 6, name: '2IN-', type: 'input',  description: 'Comparator 2 inverting input (reference)' },
      { pin: 7, name: '2OUT', type: 'output', description: 'Comparator 2 output (open collector, LOW when 2IN- > 2IN+)' },
      { pin: 8, name: 'VCC',  type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'COMPARATOR_OC', inputs: ['1IN+', '1IN-'], output: '1OUT' },
      { type: 'COMPARATOR_OC', inputs: ['2IN+', '2IN-'], output: '2OUT' },
    ],
    sequential: true,
  },

  // ── ULN2003: 7-channel Darlington driver array (16-pin DIP) ──────────────
  /* Primary source: Texas Instruments, ULN2003A datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/uln2003a.pdf
     Darlington pair: Wikipedia contributors, "Darlington transistor," https://en.wikipedia.org/wiki/Darlington_transistor */
  'ULN2003': {
    name: 'ULN2003',
    simpleName: 'Darlington Driver ×7',
    description: 'Seven Darlington drivers, logic inputs, sink loads to ground (16-pin)',
    pins: 16,
    gnd: 8,
    noVccPin: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/uln2003a.pdf',
    tags: ['darlington', 'driver', 'relay', 'stepper', 'motor', 'uln2003', 'high current', 'sink', 'array', 'transistor'],
    guideOverview: 'The ULN2003 is seven independent Darlington transistor switches in one package the workhorse chip for driving relays, stepper motors, solenoids, and lamp loads from logic outputs. Each channel is an INVERTING current sink: drive the input HIGH and the matching output pulls hard to ground (up to 500 mA per channel in the real part); drive it LOW and the output floats. Note the unusual supply arrangement: there is NO VCC pin only the GND (emitter) pin must be connected. The COM pin connects internal flyback diodes for inductive loads.',
    guidePinDescriptions: {
      'IN1': 'Channel 1 input. HIGH turns the channel 1 output transistor ON (OUT1 sinks to ground). Internal series base resistor makes it directly logic-compatible.',
      'IN2': 'Channel 2 input.',
      'IN3': 'Channel 3 input.',
      'IN4': 'Channel 4 input.',
      'IN5': 'Channel 5 input.',
      'IN6': 'Channel 6 input.',
      'IN7': 'Channel 7 input.',
      'GND': 'Ground (common emitter) pin 8. This is the only required supply connection there is no VCC pin.',
      'COM': 'Common cathode of the internal flyback diodes. Tie to the load supply when switching inductive loads (relays, motors) so the diodes clamp the turn-off spike. May be left unconnected for resistive/LED loads. (Diodes are not modeled in the simulator.)',
      'OUT7': 'Channel 7 output, open collector sink.',
      'OUT6': 'Channel 6 output, open collector sink.',
      'OUT5': 'Channel 5 output, open collector sink.',
      'OUT4': 'Channel 4 output, open collector sink.',
      'OUT3': 'Channel 3 output, open collector sink.',
      'OUT2': 'Channel 2 output, open collector sink.',
      'OUT1': 'Channel 1 output, open collector sink. LOW (sinking) when IN1 is HIGH; floating when IN1 is LOW.',
    },
    guideSections: [
      {
        title: 'How a Darlington Sink Works',
        paragraphs: [
          'Each channel is two NPN transistors stacked so the first one\'s output current drives the second one\'s base. The combined current gain is in the thousands, so a few milliamps from a logic pin can switch hundreds of milliamps of load current.',
          'The load always connects between the positive supply and the OUT pin. When the input goes HIGH the output transistor saturates and current flows through the load to ground. The chip can only SINK current it never sources it.',
          'In the simulator the ON channel is modeled as a strong pull to ground (a few tens of ohms), much stronger than a normal logic output, so it visibly out-drives pull-ups and lights LEDs hard.',
        ],
        formulas: [
          'IN = HIGH  →  OUT sinks to GND (load ON)',
          'IN = LOW   →  OUT floats (load OFF)',
        ],
        note: 'The logic is INVERTING in the open-collector sense: a HIGH input produces a LOW output voltage. The load itself, wired from VCC to OUT, turns ON with a HIGH input.',
      },
      {
        title: 'Typical Wiring',
        list: [
          'LED load: VCC → resistor → LED anode, LED cathode → OUTx. Input HIGH lights the LED.',
          'Relay/stepper coil (real hardware): coil from supply to OUTx, COM tied to the coil supply so the flyback diodes protect the transistors.',
          'Channels can be paralleled for more current: tie two inputs together and the matching two outputs together.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'IN1',  type: 'input',  description: 'Channel 1 input (HIGH = channel ON)' },
      { pin: 2,  name: 'IN2',  type: 'input',  description: 'Channel 2 input' },
      { pin: 3,  name: 'IN3',  type: 'input',  description: 'Channel 3 input' },
      { pin: 4,  name: 'IN4',  type: 'input',  description: 'Channel 4 input' },
      { pin: 5,  name: 'IN5',  type: 'input',  description: 'Channel 5 input' },
      { pin: 6,  name: 'IN6',  type: 'input',  description: 'Channel 6 input' },
      { pin: 7,  name: 'IN7',  type: 'input',  description: 'Channel 7 input' },
      { pin: 8,  name: 'GND',  type: 'power',  description: 'Ground / common emitters (the only supply pin)' },
      { pin: 9,  name: 'COM',  type: 'input',  description: 'Flyback diode common tie to load supply for inductive loads (not modeled)' },
      { pin: 10, name: 'OUT7', type: 'output', description: 'Channel 7 Darlington sink output' },
      { pin: 11, name: 'OUT6', type: 'output', description: 'Channel 6 Darlington sink output' },
      { pin: 12, name: 'OUT5', type: 'output', description: 'Channel 5 Darlington sink output' },
      { pin: 13, name: 'OUT4', type: 'output', description: 'Channel 4 Darlington sink output' },
      { pin: 14, name: 'OUT3', type: 'output', description: 'Channel 3 Darlington sink output' },
      { pin: 15, name: 'OUT2', type: 'output', description: 'Channel 2 Darlington sink output' },
      { pin: 16, name: 'OUT1', type: 'output', description: 'Channel 1 Darlington sink output' },
    ],
    gates: [
      { type: 'DARLINGTON_OC', inputs: ['IN1'], output: 'OUT1' },
      { type: 'DARLINGTON_OC', inputs: ['IN2'], output: 'OUT2' },
      { type: 'DARLINGTON_OC', inputs: ['IN3'], output: 'OUT3' },
      { type: 'DARLINGTON_OC', inputs: ['IN4'], output: 'OUT4' },
      { type: 'DARLINGTON_OC', inputs: ['IN5'], output: 'OUT5' },
      { type: 'DARLINGTON_OC', inputs: ['IN6'], output: 'OUT6' },
      { type: 'DARLINGTON_OC', inputs: ['IN7'], output: 'OUT7' },
    ],
  },

  // ── LM7805: +5 V linear voltage regulator ────────────────────────────────
  /* Primary source: Texas Instruments, LM340/LM78xx datasheet. [Online]. Available: https://www.ti.com/lit/ds/symlink/lm340.pdf
     Linear regulator: Wikipedia contributors, "Linear regulator," https://en.wikipedia.org/wiki/Linear_regulator */
  'LM7805': {
    name: 'LM7805',
    simpleName: '+5V Regulator',
    description: '+5 V linear voltage regulator (breadboard adapter package)',
    pins: 4,
    gnd: 2,
    noVccPin: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/lm340.pdf',
    tags: ['regulator', 'voltage regulator', 'power', '7805', '78xx', 'linear', '5v', 'supply', 'to-220'],
    guideOverview: 'The LM7805 is the three-terminal linear regulator found in almost every classic 5 V project: feed it 7-35 V on VIN and it holds VOUT at a steady +5 V, burning the difference as heat. The real part is a TO-220 power package; here it is presented as a small breadboard adapter with VIN, GND, and VOUT pins. Because this simulator\'s supply rails are already regulated 5 V, the simulated part simply passes its input through capped at 5 V it exists so you can wire real schematics faithfully and learn the part\'s role.',
    guidePinDescriptions: {
      'VIN': 'Unregulated input voltage. A real 7805 needs at least ~7 V here (2 V of headroom above the output). In the simulator, connect it to the +5 V rail.',
      'GND': 'Ground reference (the TO-220 middle pin and mounting tab).',
      'NC': 'Not connected (breadboard adapter only the real part has 3 pins).',
      'VOUT': 'Regulated +5 V output. Modeled as a stiff source (a few ohms), stronger than a logic output.',
    },
    guideSections: [
      {
        title: 'What a Linear Regulator Does',
        paragraphs: [
          'A linear regulator is an automatic variable resistor in series with the load: it continuously drops whatever voltage is left over so the output stays at exactly 5 V. The dropped voltage times the load current is dissipated as heat, which is why real 7805s wear heat sinks.',
          'The classic application circuit adds a 0.33 µF capacitor on VIN and a 0.1 µF capacitor on VOUT for stability you can add those in the simulator too.',
        ],
        formulas: [
          'VOUT = 5 V  (when VIN ≥ ~7 V on real hardware)',
          'P(heat) = (VIN - 5 V) × I(load)',
        ],
        note: 'Real-hardware footgun: the 7805 needs ~2 V of headroom. Feeding it 5 V gives roughly 3 V out, not 5 V. The simulator idealizes this away (its rails are only 5 V), but remember it when you build the real circuit.',
      },
      {
        title: 'Why this chip is in a 5 V simulator',
        paragraphs: [
          'Every breadboard photo and schematic you follow online has a 7805 (or its smaller 78L05 sibling) between the battery and the logic. Including it here lets you reproduce those schematics one-for-one: wire VIN to the supply, GND to ground, and take your circuit\'s power from VOUT.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'VIN',  type: 'input',  description: 'Unregulated input (connect to the +5 V rail in this simulator; ≥7 V on real hardware)' },
      { pin: 2, name: 'GND',  type: 'power',  description: 'Ground (0 V)' },
      { pin: 3, name: 'NC',   type: 'nc',     description: 'Not connected (adapter pin)' },
      { pin: 4, name: 'VOUT', type: 'output', description: 'Regulated +5 V output (stiff source)' },
    ],
    gates: [
      { type: 'VREG_5V', inputs: ['VIN'], output: 'VOUT' },
    ],
  },

  // ── 2764: 8K × 8 UV EPROM (28-pin DIP) ───────────────────────────────────
  /* Primary source: Intel, 2764A datasheet; Microchip 27C64. [Online]. Available: https://ww1.microchip.com/downloads/en/DeviceDoc/doc0091.pdf
     EPROM: Wikipedia contributors, "EPROM," https://en.wikipedia.org/wiki/EPROM */
  '2764': {
    name: '2764',
    simpleName: '8K × 8 EPROM',
    description: '8192 × 8 UV-erasable PROM program ROM for homebrew computers (28-pin)',
    pins: 28,
    vcc: 28,
    gnd: 14,
    datasheet: 'https://ww1.microchip.com/downloads/en/DeviceDoc/doc0091.pdf',
    tags: ['eprom', 'rom', 'memory', '2764', '27c64', 'uv', 'programmable', '8k', 'storage', 'computer'],
    sequential: true,
    guideOverview: 'The 2764 is the classic 8K × 8 UV-erasable EPROM the chip with the little quartz window that held the firmware of countless 1980s computers, and the program ROM in most "build your own computer" projects. Thirteen address lines (A0-A12) select one of 8192 bytes, which drive O0-O7 when CE# and OE# are both LOW. An erased EPROM reads 0xFF everywhere; programming can only flip bits from 1 to 0. The simulator models that physics: a program pulse (CE# LOW, OE# HIGH, PGM# LOW, VPP tied to VCC as a stand-in for the real 12.5 V programming voltage) ANDs the data bus into the addressed byte, and the only way to get the 1s back is to "UV-erase" the chip by removing it from the board and placing it again.',
    guidePinDescriptions: {
      'VPP': 'Programming voltage. Real part: +12.5 V (or 21 V on older parts) while programming, VCC during reads. Simulator: tie to VCC to allow program pulses; reads work regardless.',
      'A12': 'Address bit 12 (MSB). A0-A12 select one of 8192 bytes.',
      'A7': 'Address bit 7.', 'A6': 'Address bit 6.', 'A5': 'Address bit 5.', 'A4': 'Address bit 4.',
      'A3': 'Address bit 3.', 'A2': 'Address bit 2.', 'A1': 'Address bit 1.', 'A0': 'Address bit 0 (LSB).',
      'O0': 'Data bit 0 (LSB). Output during reads; sampled as input during a program pulse.',
      'O1': 'Data bit 1.', 'O2': 'Data bit 2.', 'GND': 'Ground reference (pin 14).',
      'O3': 'Data bit 3.', 'O4': 'Data bit 4.', 'O5': 'Data bit 5.', 'O6': 'Data bit 6.',
      'O7': 'Data bit 7 (MSB).',
      'CE': 'Chip Enable, active LOW. HIGH puts the chip in standby with all outputs Hi-Z.',
      'A10': 'Address bit 10.',
      'OE': 'Output Enable, active LOW. With CE# LOW and PGM# HIGH, LOW drives the addressed byte onto O0-O7.',
      'A11': 'Address bit 11.', 'A9': 'Address bit 9.', 'A8': 'Address bit 8.',
      'NC': 'Not connected.',
      'PGM': 'Program pulse, active LOW. With CE# LOW, OE# HIGH, and VPP at the programming level, a LOW pulse writes (clears bits of) the addressed byte. Tie HIGH for normal reads.',
      'VCC': 'Supply voltage +5 V (pin 28).',
    },
    guideSections: [
      {
        title: 'Operating Modes',
        paragraphs: [
          'Read: CE# LOW, OE# LOW, PGM# HIGH. The byte at A0-A12 drives O0-O7. This is the only mode a finished computer uses.',
          'Standby: CE# HIGH. Outputs are Hi-Z regardless of the other controls.',
          'Program: CE# LOW, OE# HIGH, PGM# pulsed LOW with VPP at the programming voltage (tie VPP to VCC in the simulator). The data you drive onto O0-O7 is ANDed into the addressed byte bits can only go from 1 to 0.',
          'Erase: real EPROMs are erased back to all-1s with ~20 minutes of UV light through the quartz window. In the simulator, removing the chip from the board and placing it again restores the erased (0xFF) state.',
        ],
        note: 'Programming can only clear bits (1 → 0). If you program the wrong value, you cannot fix individual bits you must erase the whole chip. This is real EPROM physics, and the reason EEPROMs (like the 28C16) replaced them.',
      },
      {
        title: 'EPROM vs EEPROM',
        paragraphs: [
          'The 2764 (EPROM) needs a special programming voltage and UV light to erase ideal as untouchable firmware. The 28C16 (EEPROM, also in this simulator) erases and rewrites electrically in-circuit, byte by byte. Homebrew-computer tutorials typically program an EPROM/EEPROM with code or microcode lookup tables, then let the CPU read it like any other memory chip.',
          'Contents persist for the session but reset (to 0xFF) when the chip is removed from the board.',
        ],
      },
    ],
    pinout: [
      { pin: 1,  name: 'VPP', type: 'input',  description: 'Programming voltage tie to VCC to enable program pulses (real part: +12.5 V)' },
      { pin: 2,  name: 'A12', type: 'input',  description: 'Address bit 12 (MSB)' },
      { pin: 3,  name: 'A7',  type: 'input',  description: 'Address bit 7' },
      { pin: 4,  name: 'A6',  type: 'input',  description: 'Address bit 6' },
      { pin: 5,  name: 'A5',  type: 'input',  description: 'Address bit 5' },
      { pin: 6,  name: 'A4',  type: 'input',  description: 'Address bit 4' },
      { pin: 7,  name: 'A3',  type: 'input',  description: 'Address bit 3' },
      { pin: 8,  name: 'A2',  type: 'input',  description: 'Address bit 2' },
      { pin: 9,  name: 'A1',  type: 'input',  description: 'Address bit 1' },
      { pin: 10, name: 'A0',  type: 'input',  description: 'Address bit 0 (LSB)' },
      { pin: 11, name: 'O0',  type: 'output', description: 'Data bit 0 (input during program pulse)' },
      { pin: 12, name: 'O1',  type: 'output', description: 'Data bit 1' },
      { pin: 13, name: 'O2',  type: 'output', description: 'Data bit 2' },
      { pin: 14, name: 'GND', type: 'power',  description: 'Ground (0 V)' },
      { pin: 15, name: 'O3',  type: 'output', description: 'Data bit 3' },
      { pin: 16, name: 'O4',  type: 'output', description: 'Data bit 4' },
      { pin: 17, name: 'O5',  type: 'output', description: 'Data bit 5' },
      { pin: 18, name: 'O6',  type: 'output', description: 'Data bit 6' },
      { pin: 19, name: 'O7',  type: 'output', description: 'Data bit 7 (MSB)' },
      { pin: 20, name: 'CE',  type: 'input',  description: 'Chip Enable, active LOW: HIGH = standby, outputs Hi-Z' },
      { pin: 21, name: 'A10', type: 'input',  description: 'Address bit 10' },
      { pin: 22, name: 'OE',  type: 'input',  description: 'Output Enable, active LOW: drives the addressed byte onto O0-O7' },
      { pin: 23, name: 'A11', type: 'input',  description: 'Address bit 11' },
      { pin: 24, name: 'A9',  type: 'input',  description: 'Address bit 9' },
      { pin: 25, name: 'A8',  type: 'input',  description: 'Address bit 8' },
      { pin: 26, name: 'NC',  type: 'nc',     description: 'Not connected' },
      { pin: 27, name: 'PGM', type: 'input',  description: 'Program pulse, active LOW (tie HIGH for reads)' },
      { pin: 28, name: 'VCC', type: 'power',  description: 'Supply voltage (+5 V)' },
    ],
    gates: [
      {
        type: 'EPROM_8KX8',
        inputs: [
          'A0','A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12',
          'O0','O1','O2','O3','O4','O5','O6','O7',
          'CE','OE','PGM','VPP',
        ],
        outputs: ['O0','O1','O2','O3','O4','O5','O6','O7'],
      },
    ],
  },

  // ── XO: Crystal oscillator module (DIP-8 half-can) ───────────────────────
  /* Crystal oscillator modules: Wikipedia contributors, "Crystal oscillator," https://en.wikipedia.org/wiki/Crystal_oscillator
     Standard half-size DIP-8 can pinout: 1 = EN/NC, 4 = GND, 5 = OUT, 8 = VCC. */
  'XO': {
    name: 'XO',
    // Kept out of the Chip / Search picker; placed from the More ▾ menu under
    // "Clocks" as the Crystal Oscillator Can (active oscillator), alongside the
    // 2-pin passive Crystal component. hidden only filters the picker list;
    // placement by id still works.
    hidden: true,
    simpleName: 'Crystal Oscillator',
    description: 'Crystal oscillator, square-wave clock (8-pin half-can, 10 Hz simulated)',
    pins: 8,
    vcc: 8,
    gnd: 4,
    datasheet: 'https://ecsxtal.com/store/pdf/ecs_100a.pdf',
    tags: ['crystal', 'oscillator', 'clock', 'xtal', 'quartz', 'can', 'square wave', 'timing', 'xo'],
    guideOverview: 'A crystal oscillator "can" is a complete clock source in a metal package: a quartz crystal, its drive circuit, and an output buffer. Power it and a clean square wave appears on OUT no external resistors or capacitors needed, unlike a 555. The pinout here is the standard half-size DIP-8 can: only the four corner pins exist. Real cans run from 32.768 kHz (watch crystals) to many MHz; the simulator runs this one at 10 Hz so you can actually watch your circuit count. Pin 1 is an enable: leave it unconnected (or HIGH) to run, pull it LOW to tri-state the output.',
    guidePinDescriptions: {
      'EN': 'Output enable. Unconnected or HIGH: oscillator runs. LOW: OUT goes Hi-Z (the crystal keeps oscillating internally on real parts).',
      'NC': 'No pin at this position on a real half-can package.',
      'GND': 'Ground (case) at pin 4.',
      'OUT': 'Square-wave clock output, ~50% duty cycle. 10 Hz in the simulator.',
      'VCC': 'Positive supply (+5 V) at pin 8.',
    },
    guideSections: [
      {
        title: 'Why a Crystal?',
        paragraphs: [
          'RC oscillators (555, Schmitt-trigger loops) drift with temperature, supply voltage, and component tolerance a few percent is typical. A quartz crystal vibrates at a mechanically fixed frequency, giving accuracy in parts per million. Every computer, watch, and microcontroller keeps time with one.',
          'The oscillator can is the no-thinking-required version: the crystal and its amplifier are sealed together, so you just supply power and take the clock out. Compare with the 555 astable, where the frequency is set by your external R and C.',
        ],
        note: 'Simulator time-scale: real cans run at kHz-MHz, far too fast to watch on a breadboard simulator that solves in milliseconds. This module outputs 10 Hz so counters and LEDs animate visibly. The adjustable CLOCK component (parts tray) remains the way to pick other frequencies.',
      },
      {
        title: 'Common Uses',
        list: [
          'Master clock for counter chains (74x161/74x163) and shift registers.',
          'Clocking a homebrew CPU: this is the part Ben Eater\'s 555 module stands in for.',
          'Tri-state EN lets a halt switch or run/step circuit gate the clock cleanly.',
        ],
      },
    ],
    pinout: [
      { pin: 1, name: 'EN',  type: 'input',  description: 'Output enable leave unconnected or HIGH to run, LOW to tri-state OUT' },
      { pin: 2, name: 'NC',  type: 'nc',     description: 'Not connected (no pin on the real half-can)' },
      { pin: 3, name: 'NC',  type: 'nc',     description: 'Not connected (no pin on the real half-can)' },
      { pin: 4, name: 'GND', type: 'power',  description: 'Ground / case (0 V)' },
      { pin: 5, name: 'OUT', type: 'output', description: 'Square-wave clock output (10 Hz simulated, ~50% duty)' },
      { pin: 6, name: 'NC',  type: 'nc',     description: 'Not connected (no pin on the real half-can)' },
      { pin: 7, name: 'NC',  type: 'nc',     description: 'Not connected (no pin on the real half-can)' },
      { pin: 8, name: 'VCC', type: 'power',  description: 'Positive supply (+5 V)' },
    ],
    gates: [
      { type: 'XTAL_OSC', inputs: ['EN'], output: 'OUT', freqHz: 10 },
    ],
    sequential: true,
  },
};
