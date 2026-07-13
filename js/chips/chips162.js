// chips162.js — Block 162: CMOS 4000 series logic IC (coverage expansion, Batch 5)
// CD4045B — 21-stage ripple counter / frequency divider with an on-chip
// oscillator amplifier. Lives ALONE in its own block file to avoid edit
// collisions with the other concurrent chip-add agents in this tree.
// See CMOS-4000-Coverage-Plan.md (Batch 5) for the roadmap.
//
// Pinout + behavior verified by reading the manufacturer datasheet directly as
// rendered PDF page images (pdftoppm @200-400 dpi), NOT the WebFetch text
// summarizer which mangles these scans (see issues.md C4).
//
// Source: Texas Instruments (Harris/RCA originated), "CD4045B Types — CMOS
//   21-Stage Counter", SCHS042C (Rev. July 2003).
//   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4045b.pdf.
//   Verified: page-1 FUNCTIONAL DIAGRAM (read as a 400-dpi cropped PDF image) —
//   terminal assignment Sp=1, Sn=2, VDD=3, NC=4/5/6, y=7, y+d=8, NC=9/10/11/12/13,
//   VSS=14, φ̄0=15, φ1=16; plus the page-1 description ("timing circuit consisting
//   of 21 counter stages, two output-shaping flip-flops ... output waveform for a
//   3.125% duty cycle"; first inverter = crystal oscillator/amplifier, Sp/Sn = the
//   p/n source terminals shorted to VDD/VSS when no source resistors are used) and
//   the page-2 RECOMMENDED OPERATING CONDITIONS ("Maximum Input-Pulse Frequency,
//   fφ (External Pulse Source)", supply 3–18 V). Pin map is NOT cloned from a
//   sibling — note the non-standard power pins (VDD=3, VSS=14), unlike the
//   CD4020/4040/4024 family (issues.md C2 / CD4082 lesson).
export const CHIPS_BLOCK_162 = {

  // ── CD4045: 21-stage ripple counter / frequency divider (16-pin) ──────────
  /* The 21-stage ripple counter divides its clock by 2^21 (2 097 152). Q of the
     last stage is brought out through two output-shaping flip-flops + push-pull
     inverter drivers to y (pin 7) and y+d (pin 8). There is NO master-reset pin
     on this part (verified absent from the functional diagram) — the only signal
     pins are the oscillator amplifier (φ1 in / φ̄0 out, Sp / Sn source taps) and
     the two divided outputs.
     SIM MODEL: reuse the generic COUNTER_BIN_RIPPLE primitive with an explicit
     bits:[20,20], maxBit:20 → both outputs follow counter bit 20 (= the 21st
     stage), so each toggles once per 2^21 input cycles. The clock is taken at φ1
     (pin 16); the on-chip crystal/RC oscillator itself is NOT modeled (engine has
     no analog oscillator — issues.md A3/A9), so the user injects an external clock
     there. The 3.125% (=1/32) duty-cycle output shaping and the y vs y+d phase
     relationship are NOT reproduced (idealized to a 50%-duty divide-by-2^21 square
     wave — issues.md A1). Gate inputs:[φ1] only → the primitive reads no MR pin, so
     the counter never auto-resets, matching the real reset-less part. */
  'CD4045': {
    name: 'CD4045',
    simpleName: '21-stage Counter / Frequency Divider',
    description: '21-stage ripple counter / freq divider, on-chip osc, CMOS (16-pin)',
    pins: 16,
    vcc: 3,
    gnd: 14,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4045b.pdf',
    tags: ['cmos', '4000 series', 'counter', 'binary counter', 'ripple counter', 'divider', 'frequency divider', 'oscillator', 'timer'],
    guideOverview: 'The CD4045 is a 21-stage ripple counter built for timekeeping and frequency division. Each of its 21 internal flip-flop stages divides the frequency by 2, so the chain as a whole divides the clock by 2^21 = 2,097,152. The result appears at two output pins, y (pin 7) and y+d (pin 8). The first on-chip inverter is meant to be wired as a crystal oscillator amplifier (φ1 is its input, φ̄0 its output; Sp and Sn bring out the transistor source terminals so you can add source resistors or, more usually, tie them to the supply rails). A common use is to take a 32.768 kHz watch crystal and divide it down to a 1-second time base. Unlike the CD4020/4040, this part has no reset pin and no taps on the intermediate stages — only the final divide-by-2^21 output is brought out. Supply range is 3 V to 18 V. Note: the power pins are non-standard — VDD is pin 3 and VSS is pin 14.',
    guidePinDescriptions: {
      'φ1':  'Oscillator amplifier input. This is the clock input: drive it from the external oscillator (or, in 74Sim, a clock source). Each input cycle advances the 21-stage counter.',
      'φ̄0': 'Oscillator amplifier output (the inverted/buffered amplifier output, datasheet symbol φ̄0). Used with a crystal and bias resistor to form the oscillator. Informational in 74Sim — the oscillator itself is not simulated.',
      Sp:    'Source terminal of the amplifier\'s p-channel transistor. Tie to VDD when no source resistor is used. Informational in 74Sim.',
      Sn:    'Source terminal of the amplifier\'s n-channel transistor. Tie to VSS when no source resistor is used. Informational in 74Sim.',
      y:     'Divided output. Toggles once every 2^21 input cycles (divide-by-2,097,152).',
      'y+d': 'Divided output (datasheet symbol y+d). Toggles once every 2^21 input cycles, the same rate as y. On real silicon y and y+d are shaped to a 3.125% duty-cycle pulse; 74Sim outputs a 50%-duty square wave instead.',
      NC:    'No internal connection.',
      VSS:   'Negative supply / ground (0 V). Pin 14 on this part.',
      VDD:   'Positive supply (3 V to 18 V). Pin 3 on this part.',
    },
    pinout: [
      { pin:  1, name: 'Sp',  type: 'input'  },
      { pin:  2, name: 'Sn',  type: 'input'  },
      { pin:  3, name: 'VDD', type: 'power'  },
      { pin:  4, name: 'NC',  type: 'nc'     },
      { pin:  5, name: 'NC',  type: 'nc'     },
      { pin:  6, name: 'NC',  type: 'nc'     },
      { pin:  7, name: 'y',   type: 'output' },
      { pin:  8, name: 'y+d', type: 'output' },
      { pin:  9, name: 'NC',  type: 'nc'     },
      { pin: 10, name: 'NC',  type: 'nc'     },
      { pin: 11, name: 'NC',  type: 'nc'     },
      { pin: 12, name: 'NC',  type: 'nc'     },
      { pin: 13, name: 'NC',  type: 'nc'     },
      { pin: 14, name: 'VSS', type: 'power'  },
      { pin: 15, name: 'φ̄0', type: 'output' },
      { pin: 16, name: 'φ1',  type: 'input'  },
    ],
    gates: [
      // Clock at φ1 (pin 16); no reset pin on this part (mrN undefined → never
      // resets). Both shaped outputs follow counter bit 20 (the 21st stage).
      { type: 'COUNTER_BIN_RIPPLE',
        inputs:  ['φ1'],
        outputs: ['y+d', 'y'],
        bits:    [20, 20],
        maxBit:  20 },
    ],
    guideSections: [
      {
        title: '21-Stage Ripple Divider',
        paragraphs: [
          'The 21 internal flip-flop stages are chained so each one divides the previous by 2. Together they divide the input frequency by 2^21 = 2,097,152.',
          'Only the final stage is brought out — there are no intermediate taps and no reset pin. Both output pins, y (pin 7) and y+d (pin 8), carry the same divide-by-2^21 signal.',
          'Feed a clock into φ1 (pin 16). On each input cycle the counter advances one count; after 2^21 cycles the outputs complete one full period.',
        ],
        formulas: [
          'output frequency = input frequency ÷ 2,097,152  (÷2²¹)',
          'one output period = 2²¹ = 2,097,152 input cycles',
        ],
        list: [
          'Crystal time base: a 32.768 kHz watch crystal divided by 2^21 ≈ 0.0156 Hz — combine with the chip\'s shaping flip-flops for a slow, clean timing pulse.',
          'Long time delays: with a slow clock, one output transition appears only after millions of input cycles.',
        ],
        note: 'The on-chip oscillator amplifier (φ1 / φ̄0 / Sp / Sn) is NOT simulated — 74Sim has no analog crystal/RC oscillator engine (see issues.md A3/A9), so drive an external clock into φ1 instead, and tie Sp to VDD and Sn to VSS as the datasheet shows. The real part shapes y and y+d into a 3.125% (1/32) duty-cycle pulse with a fixed phase offset between them; 74Sim instead drives both as an idealized 50%-duty divide-by-2^21 square wave that toggles at the same rate (the no-propagation-delay / no-waveform-shaping idealization, issues.md A1/D6). The settled divide ratio is exact. Note the non-standard power pins: VDD = pin 3, VSS = pin 14.',
      },
    ],
  },

};
