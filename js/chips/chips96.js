// CMOS 4000-series coverage — Batch 12 (timers / monostables / PLL).
// CD4046: Micropower Phase-Locked Loop (PLL) with voltage-controlled
// oscillator (VCO), two phase comparators, a source-follower demodulator
// output and a 5.2 V zener for supply regulation.
//
// Shipped in its own standalone block (CHIPS_BLOCK_96) to avoid colliding
// with other agents adding chips in the same working tree.
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ──
// 74Sim is a functional logic simulator with no loop-filter / closed-loop
// analog modeling. The repo made a deliberate decision (issues.md A10, D3 and
// Simplifications.md §2) to REMOVE the PLL family (74x297 / 4046 / 7046 /
// 9046) rather than ship misleading stubs, because real phase-locking needs
// loop-filter dynamics the engine does not attempt. The CD4046 is therefore
// added here as an "info sheet only" documentation entry: the page documents
// the real part (verified pinout, function, design notes) but the chip is
// hidden from the picker and carries no wired-up behavior.
//
// Note: the engine DOES have a simplified voltage-to-frequency VCO primitive
// (`VCO_SINGLE_EN` / `VCO_STUB`, used by the 74x124/324 VCO parts — a square
// wave ~10 Hz @0 V rising to ~1 kHz @VDD). It could one day drive the CD4046's
// VCO sub-block (VCOIN pin 9 → VCOOUT pin 4 with INHIBIT on pin 5), but the
// phase comparators (PC1/PC2), the capture/lock loop and the loop filter would
// still be unmodeled, so the part as a whole stays a stub consistent with the
// A10 PLL-removal decision rather than presenting a half-working PLL.
//
// Pinout verified against the Texas Instruments / Harris CD4046B datasheet
// (SCHS043B, Rev. July 2003) Terminal Assignment (TOP VIEW), read directly
// from the PDF page image — NOT a text summarizer (see issues.md C4), and not
// cloned from any sibling part (see issues.md C2 lesson).

export const CHIPS_BLOCK_96 = {
  // ── CD4046: Micropower Phase-Locked Loop with VCO ────────────────────────
  'CD4046': {
    name: 'CD4046',
    simpleName: 'PLL w/ VCO',
    description: 'Micropower phase-locked loop with VCO (16-pin CMOS) — info sheet only',
    guideOverview: 'The CD4046B is a micropower CMOS phase-locked loop (PLL). It contains a linear voltage-controlled oscillator (VCO), a high-impedance signal-input amplifier, two different phase comparators sharing that amplifier, a source-follower demodulator output, and a 5.2 V zener for supply regulation. In a complete PLL the VCO output is fed back (directly or through a frequency divider) to the comparator input; the selected phase comparator drives the VCO control voltage through an external low-pass loop filter until the VCO frequency and phase track the incoming signal. NOTE: 74Sim is a functional logic simulator and does not model the closed-loop, loop-filter analog dynamics that phase locking requires, so this part is provided as a documentation / info-sheet entry only (consistent with the engine\'s decision to not simulate the PLL family). Its outputs are not driven in the simulator.',
    guidePinDescriptions: {
      'PCPOUT': 'PHASE PULSES (pin 1). Phase-comparator-pulse output used for lock indication (goes to one rail when the loop is locked).',
      'PC1OUT': 'PHASE COMP I OUT (pin 2). Output of phase comparator I — an exclusive-OR network. Drive the loop filter from here for maximum lock range.',
      'COMPIN': 'COMPARATOR IN (pin 3). Comparator input to both phase comparators (the VCO feedback, directly or through a divider, normally connects here).',
      'VCOOUT': 'VCO OUT (pin 4). The voltage-controlled oscillator square-wave output (full CMOS swing).',
      'INH':    'INHIBIT (pin 5). Logic 0 enables the VCO and source follower; logic 1 turns them off for minimum standby power.',
      'C1A':    'C1-I (pin 6). One terminal of the external VCO timing capacitor C1.',
      'C1B':    'C1-II (pin 7). Other terminal of the external VCO timing capacitor C1.',
      'VSS':    'Negative supply / ground (pin 8).',
      'VCOIN':  'VCO IN (pin 9). VCO control-voltage input (very high impedance, ~10^12 Ω). Higher voltage → higher VCO frequency.',
      'DEMOUT': 'DEMODULATOR OUT / source-follower output (pin 10). Buffered copy of the VCO control voltage; needs an external resistor to VSS to be used.',
      'R1':     'R1 TO VSS (pin 11). External VCO frequency-setting resistor R1 (sets f_max / center frequency).',
      'R2':     'R2 TO VSS (pin 12). External VCO offset resistor R2 (sets f_min; leave open for no frequency offset).',
      'PC2OUT': 'PHASE COMP II OUT (pin 13). Output of phase comparator II — an edge-controlled, three-state memory network that gives a phase-pulse lock output and harmonic-free locking.',
      'SIGIN':  'SIGNAL IN (pin 14). High-impedance signal input to the self-biasing amplifier feeding the phase comparators.',
      'ZENER':  'ZENER (pin 15). Cathode of the internal 5.2 V regulator zener; used with an external resistor for supply regulation. Leave open if unused.',
      'VDD':    'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'What the CD4046B is',
        paragraphs: [
          'The CD4046B is the classic CMOS phase-locked loop building block. A PLL forces a local oscillator (the VCO) to track the frequency and phase of an incoming reference signal. It is used for FM demodulation and modulation, frequency synthesis and multiplication, frequency discrimination, data/clock synchronization, voltage-to-frequency conversion, tone decoding and FSK modems.',
          'Three sub-blocks share one chip: (1) a linear VCO whose frequency is set by external R1, optional R2 and C1 and steered by the control voltage on VCO IN (pin 9); (2) a high-impedance self-biasing signal amplifier (SIGNAL IN pin 14) feeding two phase comparators; (3) a source-follower buffer (DEMODULATOR OUT pin 10) that copies the VCO control voltage, plus a 5.2 V zener for supply regulation.',
        ],
      },
      {
        title: 'The two phase comparators',
        paragraphs: [
          'Phase comparator I is an exclusive-OR network. It locks over a wide range but can lock onto harmonics of the center frequency and is sensitive to input noise; the signal and comparator inputs must have a 50% duty cycle for the full lock range. At lock the phase difference between signal and comparator is 90°.',
          'Phase comparator II is an edge-controlled digital memory network (four flip-flop stages with a three-state output driver). It locks only on the positive edges, so duty cycle does not matter, it will not lock onto harmonics, and at lock the phase difference is 0°. It also provides the PHASE PULSES (pin 1) lock-detection output.',
          'A complete loop wires VCO OUT (pin 4) — optionally through a CD4018/4020/4022/4029/4059 divider — back to COMPARATOR IN (pin 3), and connects the chosen comparator output (PC1OUT pin 2 or PC2OUT pin 13) through an external RC low-pass loop filter to VCO IN (pin 9).',
        ],
      },
      {
        title: 'Setting the VCO frequency (design notes)',
        paragraphs: [
          'External components set the VCO range: 5 kΩ ≤ R1, R2, Rs ≤ 1 MΩ; C1 ≥ 100 pF at VDD = 5 V (≥ 50 pF at VDD ≥ 10 V). R1 and C1 set the maximum/center frequency; R2 adds a low-frequency offset (leave R2 open for no offset, so f_min ≈ 0). VCO linearity is better than 1% at VDD = 10 V and operating frequency reaches ~1.4 MHz typical.',
          'INHIBIT (pin 5) at logic 0 enables the VCO and source follower; at logic 1 it turns both off and drops the device to ultra-low standby current — useful for ON/OFF keying.',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          '74Sim is a functional digital-logic simulator. It has no propagation-delay engine and no closed-loop analog loop-filter dynamics, which is exactly what a PLL needs to actually lock. The simulator project removed the PLL family (74x297 / 4046 / 7046 / 9046) rather than ship stubs that look like they work but do not.',
          'So this CD4046B entry documents the real part — pinout, function and design notes — but is hidden from the breadboard picker and drives no outputs in the sim. If you need oscillation behavior on the bench, build it for real; the datasheet linked here is the authority.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4046b.pdf',
    tags: ['pll', 'phase locked loop', 'vco', 'oscillator', 'analog', 'cmos', '4000', 'stub'],
    pinout: [
      { pin: 1,  name: 'PCPOUT', type: 'output', description: 'PHASE PULSES — lock-detection pulse output.' },
      { pin: 2,  name: 'PC1OUT', type: 'output', description: 'PHASE COMP I OUT — exclusive-OR phase comparator output.' },
      { pin: 3,  name: 'COMPIN', type: 'input',  description: 'COMPARATOR IN — common input to both phase comparators (VCO feedback).' },
      { pin: 4,  name: 'VCOOUT', type: 'output', description: 'VCO OUT — voltage-controlled oscillator square-wave output.' },
      { pin: 5,  name: 'INH',    type: 'input',  description: 'INHIBIT — logic 0 enables VCO + source follower; logic 1 = standby off.' },
      { pin: 6,  name: 'C1A',    type: 'input',  description: 'C1-I — external VCO timing capacitor terminal.' },
      { pin: 7,  name: 'C1B',    type: 'input',  description: 'C1-II — external VCO timing capacitor terminal.' },
      { pin: 8,  name: 'VSS',    type: 'power',  description: 'Negative supply / ground.' },
      { pin: 9,  name: 'VCOIN',  type: 'input',  description: 'VCO IN — VCO control voltage (high impedance).' },
      { pin: 10, name: 'DEMOUT', type: 'output', description: 'DEMODULATOR OUT — source-follower copy of the VCO control voltage.' },
      { pin: 11, name: 'R1',     type: 'input',  description: 'R1 TO VSS — external VCO frequency-setting resistor.' },
      { pin: 12, name: 'R2',     type: 'input',  description: 'R2 TO VSS — external VCO offset resistor (open = no offset).' },
      { pin: 13, name: 'PC2OUT', type: 'output', description: 'PHASE COMP II OUT — edge-controlled memory phase comparator output.' },
      { pin: 14, name: 'SIGIN',  type: 'input',  description: 'SIGNAL IN — high-impedance signal-amplifier input.' },
      { pin: 15, name: 'ZENER',  type: 'output', description: 'ZENER — cathode of the internal 5.2 V supply-regulation zener.' },
      { pin: 16, name: 'VDD',    type: 'power',  description: 'Positive supply (+3 V to +18 V; modeled at +5 V).' },
    ],
    // Documentation stub: the PLL closed-loop / VCO analog behavior is not
    // modeled (see issues.md A10/D3). GENERIC_STUB drives all signal outputs
    // Hi-Z; the chip is hidden from the picker by the 'stub' tag.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['PCPOUT', 'PC1OUT', 'VCOOUT', 'DEMOUT', 'PC2OUT', 'ZENER'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD4046B PLL (no loop-filter / closed-loop analog dynamics). Pinout verified vs TI CD4046B SCHS043B Terminal Assignment. See issues.md A10/D3.',
  },
};
