// chips114.js — CMOS 4000-series coverage expansion (standalone block).
// One chip per file for the parallel-agent run to avoid collisions.
//
// Chips: CD4095
//
// CD4095: Gated J-K Master/Slave Flip-Flop, non-inverting inputs (14-pin).

export const CHIPS_BLOCK_114 = {

  // ── CD4095: Gated J-K Master/Slave Flip-Flop (non-inverting in), 14-pin ──
  /* Primary source: Intersil CD4095BMS / CD4096BMS datasheet (family). The
     CD-branded direct PDFs are bot-blocked to curl (Akamai), so the verified
     pinout was read from datasheethub's CD4095 terminal table and corroborated
     against the Intersil CD4096BMS datasheet (shared family pinout), which
     confirms "SET and RESET inputs (active high)" and that J-K data is
     transferred "on the positive edge of the clock pulse." See issues.md. */
  'CD4095': {
    name: 'CD4095',
    simpleName: 'Gated JK Master-Slave FF',
    description: 'Gated JK master/slave FF, non-inv, async SET/RESET, pos-edge (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.alldatasheet.com/datasheet-pdf/pdf/66451/INTERSIL/CD4096BMS.html',
    tags: ['cmos', '4000 series', 'flip flop', 'jk', 'gated', 'sequential', 'master slave', 'set', 'reset', 'positive edge'],
    sequential: true,
    guideOverview: 'The CD4095 is a single gated J-K master/slave flip-flop. It has three J inputs (J1·J2·J3 are ANDed to form the internal J) and three K inputs (K1·K2·K3 are ANDed to form the internal K), all non-inverting. SET and RESET are asynchronous and active HIGH: pull SET HIGH to force Q=1, RESET HIGH to force Q=0, independent of the clock. With SET and RESET both LOW, the gated J and K are transferred to Q on the rising (positive) edge of the clock: J=0,K=0 holds; J=1,K=0 sets; J=0,K=1 resets; J=1,K=1 toggles. Wide 3-15 V supply and near-zero static current. The CD4096 is the same part with one of the three J and one of the three K inputs internally inverted.',
    guidePinDescriptions: {
      'NC':    'No internal connection.',
      'RESET': 'Asynchronous reset, active HIGH. Pull HIGH to force Q=0 immediately, overriding the clock and SET.',
      'J1':    'J input 1. The three J inputs are ANDed: internal J = J1·J2·J3.',
      'J2':    'J input 2. The three J inputs are ANDed: internal J = J1·J2·J3.',
      'J3':    'J input 3. The three J inputs are ANDed: internal J = J1·J2·J3.',
      'Qn':    'Inverted output (/Q).',
      'VSS':   'Ground reference (0 V).',
      'Q':     'True output.',
      'K3':    'K input 3. The three K inputs are ANDed: internal K = K1·K2·K3.',
      'K2':    'K input 2. The three K inputs are ANDed: internal K = K1·K2·K3.',
      'K1':    'K input 1. The three K inputs are ANDed: internal K = K1·K2·K3.',
      'CLOCK': 'Clock input. J-K data is transferred on the rising (positive) edge.',
      'SET':   'Asynchronous set, active HIGH. Pull HIGH to force Q=1 immediately, overriding the clock.',
      'VDD':   'Positive supply (3-15 V).',
    },
    guideSections: [
      {
        title: 'AND-gated J and K inputs',
        paragraphs: [
          'Each of the J and K terminals is a three-input AND group. The flip-flop only sees J=1 when J1, J2 and J3 are all HIGH, and K=1 when K1, K2 and K3 are all HIGH. Unused gating inputs should be tied HIGH so they do not block the active input; tie a gating input LOW to hold that side at 0.',
          'The inputs are non-inverting (this is the CD4095). The CD4096 is the pin-compatible variant in which one J and one K input are internally inverted.',
        ],
      },
      {
        title: 'Active-HIGH SET and RESET, positive-edge clock',
        paragraphs: [
          'Unlike most 74-series J-K flip-flops (which use active-LOW preset/clear), the CD4095 SET and RESET are active HIGH and asynchronous. Pull SET HIGH to force Q=1, RESET HIGH to force Q=0. Both should not be HIGH simultaneously the result is undefined (this model is reset-dominant in that case).',
          'With SET and RESET both LOW, the gated J and K determine the next state on the clock rising edge: J=0,K=0 holds; J=1,K=0 sets; J=0,K=1 resets; J=1,K=1 toggles.',
        ],
        note: 'Positive-edge triggering (LOW→HIGH) is opposite to many 74-series J-K parts (74x73/74x76) that trigger on the falling edge. Supply 3-15 V (some versions to 18 V).',
      },
    ],
    pinout: [
      { pin: 1,  name: 'NC',    type: 'nc',     description: 'No connection' },
      { pin: 2,  name: 'RESET', type: 'input',  description: 'Asynchronous reset, active HIGH: forces Q=0' },
      { pin: 3,  name: 'J1',    type: 'input',  description: 'J input 1 (ANDed: J = J1·J2·J3)' },
      { pin: 4,  name: 'J2',    type: 'input',  description: 'J input 2 (ANDed: J = J1·J2·J3)' },
      { pin: 5,  name: 'J3',    type: 'input',  description: 'J input 3 (ANDed: J = J1·J2·J3)' },
      { pin: 6,  name: 'Qn',    type: 'output', description: 'Inverted output (/Q)' },
      { pin: 7,  name: 'VSS',   type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin: 8,  name: 'Q',     type: 'output', description: 'True output (Q)' },
      { pin: 9,  name: 'K3',    type: 'input',  description: 'K input 3 (ANDed: K = K1·K2·K3)' },
      { pin: 10, name: 'K2',    type: 'input',  description: 'K input 2 (ANDed: K = K1·K2·K3)' },
      { pin: 11, name: 'K1',    type: 'input',  description: 'K input 1 (ANDed: K = K1·K2·K3)' },
      { pin: 12, name: 'CLOCK', type: 'input',  description: 'Clock, rising (positive) edge triggered' },
      { pin: 13, name: 'SET',   type: 'input',  description: 'Asynchronous set, active HIGH: forces Q=1' },
      { pin: 14, name: 'VDD',   type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      // JK_FF: inputs [J1,J2,J3, K1,K2,K3, CLK, PRESET(SET), CLEAR(RESET)],
      // outputs [Q, Qn]. preClrActiveHigh:true selects the CD4095's active-HIGH
      // SET/RESET; the three J pins AND together, as do the three K pins.
      {
        type: 'JK_FF',
        inputs: ['J1', 'J2', 'J3', 'K1', 'K2', 'K3', 'CLOCK', 'SET', 'RESET'],
        outputs: ['Q', 'Qn'],
        preClrActiveHigh: true,
      },
    ],
  },

};
