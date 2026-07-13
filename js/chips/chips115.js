// chips115.js — CMOS 4000-series coverage expansion (standalone block).
// One chip per file for the parallel-agent run to avoid collisions.
//
// Chips: CD4096
//
// CD4096: Gated J-K Master/Slave Flip-Flop, INVERTING + NON-INVERTING J and K
// inputs (14-pin). Pin-compatible sibling of the CD4095 (chips114.js); the only
// difference is that the third J input (pin 5) and the third K input (pin 9) are
// internally INVERTING, so internal J = J1·J2·/J3 and internal K = K1·K2·/K3.

export const CHIPS_BLOCK_115 = {

  // ── CD4096: Gated J-K Master/Slave Flip-Flop (inv + non-inv in), 14-pin ──
  /* Primary source: Intersil "CD4095BMS, CD4096BMS — CMOS Gated J-K Master-Slave
     Flip-Flops", File Number 3331 (December 1992). Read directly as 400-dpi
     rendered PDF page images (NOT a text summarizer — see issues.md C4): the
     TI/Renesas CD-branded direct PDFs 404 to curl, so the verified copy was
     fetched from the ST/Intersil HCF4096BE/CD4096 mirror
     (arwill.hu/.../hcf4096-be-cd4096-cmos-logikai-aramkor-957239.pdf) and the
     CD4096BMS Functional Diagram + Pinout (TOP VIEW) on page 1 read pin-by-pin.
     The CD4096BMS pinout is physically identical to the CD4095BMS, BUT the
     functional diagram shows inversion bubbles on the J3 (pin 5) and K3 (pin 9)
     gate inputs — these are the inverting inputs that distinguish the CD4096:
        internal J = J1 · J2 · /J3      internal K = K1 · K2 · /K3
     Pinout (TOP VIEW):
        1=NC  2=RESET  3=J1  4=J2  5=J3(/)  6=Q  7=VSS
        8=Q   9=K3(/)  10=K2  11=K1  12=CLOCK  13=SET  14=VDD
     The page-1 functional diagram labels pin 8 = Q (true), pin 6 = /Q (Qn).
     Datasheet Description: "Information on the J-K inputs is transferred to the Q
     and Q outputs on the positive edge of the clock pulse. SET and RESET inputs
     (active high) are provided for asynchronous operation."
     ENGINE: reuses the existing `JK_FF` primitive (the 3-J / 3-K AND-gated form,
     shared with the 74H102/74H106/74H116/74x117 entries). Two features make the
     fit exact:
       (1) the gate's per-pin `invert` rule — a J/K pin whose NAME ends in 'n' is
           read inverted — so naming the inverting inputs 'J3n' / 'K3n' yields the
           datasheet's /J3 and /K3 with NO engine change; and
       (2) the opt-in `preClrActiveHigh: true` flag (added for the CD4095/CD4096
           family) selects the active-HIGH SET/RESET, instead of the active-LOW
           PRE/CLR the 74-series gated-JK entries use.
     NOT cloned from a sibling pinout (issues.md C2): the inversion lives on J3/K3,
     verified against the CD4096BMS functional diagram itself, not assumed.
     Divergence: if SET and RESET are HIGH simultaneously the datasheet leaves Q
     undefined (both outputs HIGH on the real part); this model is reset-dominant
     in that case (see issues.md). */
  'CD4096': {
    name: 'CD4096',
    simpleName: 'Gated JK MS FF (inv+non-inv in)',
    description: 'Gated JK master/slave FF, inverting J3/K3, SET/RESET, pos-edge (14-pin)',
    pins: 14,
    vcc: 14,
    gnd: 7,
    datasheet: 'https://www.alldatasheet.com/datasheet-pdf/pdf/66451/INTERSIL/CD4096BMS.html',
    tags: ['cmos', '4000 series', 'flip flop', 'jk', 'gated', 'sequential', 'master slave', 'set', 'reset', 'positive edge', 'inverted', 'inverting'],
    sequential: true,
    guideOverview: 'The CD4096 is a single gated J-K master/slave flip-flop, the pin-compatible variant of the CD4095. It has three J inputs and three K inputs that are ANDed to form the internal J and K terms, but unlike the CD4095 the third J input (J3, pin 5) and third K input (K3, pin 9) are internally INVERTING. So internal J = J1·J2·/J3 and internal K = K1·K2·/K3: J3 and K3 must be held LOW to enable their side, while J1/J2/K1/K2 are non-inverting and must be HIGH. SET and RESET are asynchronous and active HIGH: pull SET HIGH to force Q=1, RESET HIGH to force Q=0, independent of the clock. With SET and RESET both LOW, the gated J and K are transferred to Q on the rising (positive) edge of the clock: J=0,K=0 holds; J=1,K=0 sets; J=0,K=1 resets; J=1,K=1 toggles. Wide 3-15 V supply and near-zero static current. The inverting J3/K3 inputs let active-LOW enable signals drive the gating directly without external inverters.',
    guidePinDescriptions: {
      'NC':    'No internal connection.',
      'RESET': 'Asynchronous reset, active HIGH. Pull HIGH to force Q=0 immediately, overriding the clock and SET.',
      'J1':    'J input 1, non-inverting. Internal J = J1·J2·/J3.',
      'J2':    'J input 2, non-inverting. Internal J = J1·J2·/J3.',
      'J3n':   'J input 3, INVERTING (active LOW). Internal J = J1·J2·/J3 — hold this LOW to enable the J side.',
      'Qn':    'Inverted output (/Q).',
      'VSS':   'Ground reference (0 V).',
      'Q':     'True output.',
      'K3n':   'K input 3, INVERTING (active LOW). Internal K = K1·K2·/K3 — hold this LOW to enable the K side.',
      'K2':    'K input 2, non-inverting. Internal K = K1·K2·/K3.',
      'K1':    'K input 1, non-inverting. Internal K = K1·K2·/K3.',
      'CLOCK': 'Clock input. J-K data is transferred on the rising (positive) edge.',
      'SET':   'Asynchronous set, active HIGH. Pull HIGH to force Q=1 immediately, overriding the clock.',
      'VDD':   'Positive supply (3-15 V).',
    },
    guideSections: [
      {
        title: 'AND-gated J and K inputs, with inverting J3/K3',
        paragraphs: [
          'Each of the J and K terminals is a three-input AND group. The flip-flop only sees internal J=1 when J1 and J2 are HIGH and J3 is LOW (J3 is inverted), and internal K=1 when K1 and K2 are HIGH and K3 is LOW (K3 is inverted): J = J1·J2·/J3, K = K1·K2·/K3.',
          'This inverting pair is exactly what separates the CD4096 from the non-inverting CD4095. To leave a side fully enabled, tie the non-inverting gating inputs (J1/J2 or K1/K2) HIGH and the inverting input (J3 or K3) LOW; drive any one of them the other way to block that side at 0.',
        ],
        note: 'J3 (pin 5) and K3 (pin 9) are active LOW. The other four gating inputs are active HIGH.',
      },
      {
        title: 'Active-HIGH SET and RESET, positive-edge clock',
        paragraphs: [
          'Unlike most 74-series J-K flip-flops (which use active-LOW preset/clear), the CD4096 SET and RESET are active HIGH and asynchronous. Pull SET HIGH to force Q=1, RESET HIGH to force Q=0. Both should not be HIGH simultaneously the result is undefined (this model is reset-dominant in that case).',
          'With SET and RESET both LOW, the gated J and K determine the next state on the clock rising edge: J=0,K=0 holds; J=1,K=0 sets; J=0,K=1 resets; J=1,K=1 toggles.',
        ],
        note: 'Positive-edge triggering (LOW→HIGH) is opposite to many 74-series J-K parts (74x73/74x76) that trigger on the falling edge. Supply 3-15 V (some versions to 18 V).',
      },
    ],
    pinout: [
      { pin: 1,  name: 'NC',    type: 'nc',     description: 'No connection' },
      { pin: 2,  name: 'RESET', type: 'input',  description: 'Asynchronous reset, active HIGH: forces Q=0' },
      { pin: 3,  name: 'J1',    type: 'input',  description: 'J input 1, non-inverting (J = J1·J2·/J3)' },
      { pin: 4,  name: 'J2',    type: 'input',  description: 'J input 2, non-inverting (J = J1·J2·/J3)' },
      { pin: 5,  name: 'J3n',   type: 'input',  description: 'J input 3, INVERTING / active LOW (J = J1·J2·/J3)' },
      { pin: 6,  name: 'Qn',    type: 'output', description: 'Inverted output (/Q)' },
      { pin: 7,  name: 'VSS',   type: 'power',  description: 'Ground (VSS, 0 V)' },
      { pin: 8,  name: 'Q',     type: 'output', description: 'True output (Q)' },
      { pin: 9,  name: 'K3n',   type: 'input',  description: 'K input 3, INVERTING / active LOW (K = K1·K2·/K3)' },
      { pin: 10, name: 'K2',    type: 'input',  description: 'K input 2, non-inverting (K = K1·K2·/K3)' },
      { pin: 11, name: 'K1',    type: 'input',  description: 'K input 1, non-inverting (K = K1·K2·/K3)' },
      { pin: 12, name: 'CLOCK', type: 'input',  description: 'Clock, rising (positive) edge triggered' },
      { pin: 13, name: 'SET',   type: 'input',  description: 'Asynchronous set, active HIGH: forces Q=1' },
      { pin: 14, name: 'VDD',   type: 'power',  description: 'Positive supply (3-15 V)' },
    ],
    gates: [
      // JK_FF: inputs [J1,J2,J3, K1,K2,K3, CLK, PRESET(SET), CLEAR(RESET)],
      // outputs [Q, Qn]. The inverting J3/K3 inputs are expressed by naming the
      // pins 'J3n'/'K3n' — the engine reads a J/K pin inverted when its name ends
      // in 'n', giving J = J1·J2·/J3 and K = K1·K2·/K3. preClrActiveHigh:true
      // selects the CD4096's active-HIGH SET/RESET.
      {
        type: 'JK_FF',
        inputs: ['J1', 'J2', 'J3n', 'K1', 'K2', 'K3n', 'CLOCK', 'SET', 'RESET'],
        outputs: ['Q', 'Qn'],
        preClrActiveHigh: true,
      },
    ],
  },

};
