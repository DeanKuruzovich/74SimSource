// chips97.js — CMOS 4000-series coverage expansion (Batch 10)
// CD4514: 4-bit strobed-latch / 4-to-16 line decoder, active-HIGH outputs.
// Shipped in its own standalone block (CHIPS_BLOCK_97) to avoid collisions
// with the other concurrent chip-add agents sharing this working directory.

export const CHIPS_BLOCK_97 = {
  // ── CD4514: 4-to-16 decoder with input latch, active-HIGH outputs (24-pin) ──
  /* Primary source: Texas Instruments (data sheet acquired from Harris
     Semiconductor), "CD4514B, CD4515B Types — CMOS 4-Bit Latch/4-to-16 Line
     Decoders", SCHS074A (revised June 2003). [Online]. Available:
     https://www.ti.com/lit/ds/symlink/cd4514b.pdf
     Pinout verified against the CD4514B/CD4515B FUNCTIONAL DIAGRAM read directly
     from the rendered PDF page (Read with pages:, then a 300-dpi crop) — it is
     NOT the 74HC4514 pin map (see issues.md C2/C7). The real CD4514B uses an
     entirely different terminal assignment: STROBE on pin 1, the four data
     inputs split DATA1/2 on pins 2/3 and DATA3/4 on pins 21/22, INHIBIT on pin
     23, and the sixteen S0-S15 outputs scattered across pins 4-11 and 13-20.
     CD4514B = active-HIGH outputs (selected output HIGH); CD4515B is the
     active-LOW sibling. */
  'CD4514': {
    name: 'CD4514',
    simpleName: '4-to-16 Line Decoder (Latched, Active HIGH)',
    description: '4-bit strobed-latch / 4-to-16 decoder, active-HIGH, CMOS (24-pin)',
    pins: 24,
    vcc: 24,
    gnd: 12,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4514b.pdf',
    tags: ['cmos', '4000 series', 'decoder', 'demultiplexer', '4 to 16', '1 of 16', 'latch', 'active high'],
    guideOverview: 'The CD4514 is a 4-to-16 line decoder with a built-in 4-bit input latch and active-HIGH outputs. A 4-bit address on inputs A (LSB) through D (MSB) selects exactly one of the sixteen outputs S0-S15, which goes HIGH while the other fifteen stay LOW. A STROBE input controls the latch: while STROBE is HIGH the address passes straight through (transparent), and on the STROBE HIGH-to-LOW transition the current address is held, so the selected output stays put even if the address bus changes afterward. A separate INHIBIT input, when taken HIGH, forces all sixteen outputs LOW regardless of the address or strobe. Typical uses are one-hot control, address/hexadecimal/BCD decoding, program-counter decoding, and digital multiplexing.',
    guidePinDescriptions: {
      'STROBE': 'Latch strobe (pin 1). HIGH = latch transparent, address flows to the decoder. The address present just before the HIGH-to-LOW transition is held while STROBE is LOW.',
      'A': 'Address input bit A (DATA 1, least significant, weight 1). Pin 2.',
      'B': 'Address input bit B (DATA 2, weight 2). Pin 3.',
      'C': 'Address input bit C (DATA 3, weight 4). Pin 21.',
      'D': 'Address input bit D (DATA 4, most significant, weight 8). Pin 22.',
      'INHIBIT': 'Active-HIGH inhibit (pin 23). HIGH forces all outputs LOW; LOW allows normal decoding.',
      'S0': 'Decoded output 0, HIGH when address 0 is selected and INHIBIT is LOW. Pin 11.',
      'S1': 'Decoded output 1. Pin 9.',
      'S2': 'Decoded output 2. Pin 10.',
      'S3': 'Decoded output 3. Pin 8.',
      'S4': 'Decoded output 4. Pin 7.',
      'S5': 'Decoded output 5. Pin 6.',
      'S6': 'Decoded output 6. Pin 5.',
      'S7': 'Decoded output 7. Pin 4.',
      'S8': 'Decoded output 8. Pin 18.',
      'S9': 'Decoded output 9. Pin 17.',
      'S10': 'Decoded output 10. Pin 20.',
      'S11': 'Decoded output 11. Pin 19.',
      'S12': 'Decoded output 12. Pin 14.',
      'S13': 'Decoded output 13. Pin 13.',
      'S14': 'Decoded output 14. Pin 16.',
      'S15': 'Decoded output 15. Pin 15.',
      'VDD': 'Positive supply (pin 24).',
      'VSS': 'Ground / negative supply (pin 12).',
    },
    guideSections: [
      {
        title: 'One-of-Sixteen Decoding',
        paragraphs: [
          'The 4-bit address code A-D is expanded into a one-hot pattern: exactly one of the sixteen outputs S0-S15 is driven HIGH when the part is enabled (INHIBIT LOW), and all the others are LOW. Output Sn is the one selected when the binary value of D C B A equals n.',
        ],
      },
      {
        title: 'Strobed Input Latch',
        paragraphs: [
          'While STROBE is HIGH the latch is transparent and the outputs track the address inputs. Taking STROBE LOW freezes the address that was present at the moment of the HIGH-to-LOW transition, so the selected output holds even after the address bus changes. This is useful where the address is only briefly valid or is shared with other devices.',
        ],
      },
      {
        title: 'Inhibit',
        paragraphs: [
          'Driving INHIBIT HIGH blanks the decoder: all sixteen outputs go LOW regardless of the address or strobe. Returning INHIBIT LOW restores normal decoding of the (possibly latched) address. INHIBIT is handy for blanking displays or gating the one-hot bus without disturbing the stored address.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'STROBE',  type: 'input'  },
      { pin:  2, name: 'A',       type: 'input'  },
      { pin:  3, name: 'B',       type: 'input'  },
      { pin:  4, name: 'S7',      type: 'output' },
      { pin:  5, name: 'S6',      type: 'output' },
      { pin:  6, name: 'S5',      type: 'output' },
      { pin:  7, name: 'S4',      type: 'output' },
      { pin:  8, name: 'S3',      type: 'output' },
      { pin:  9, name: 'S1',      type: 'output' },
      { pin: 10, name: 'S2',      type: 'output' },
      { pin: 11, name: 'S0',      type: 'output' },
      { pin: 12, name: 'VSS',     type: 'power'  },
      { pin: 13, name: 'S13',     type: 'output' },
      { pin: 14, name: 'S12',     type: 'output' },
      { pin: 15, name: 'S15',     type: 'output' },
      { pin: 16, name: 'S14',     type: 'output' },
      { pin: 17, name: 'S9',      type: 'output' },
      { pin: 18, name: 'S8',      type: 'output' },
      { pin: 19, name: 'S11',     type: 'output' },
      { pin: 20, name: 'S10',     type: 'output' },
      { pin: 21, name: 'C',       type: 'input'  },
      { pin: 22, name: 'D',       type: 'input'  },
      { pin: 23, name: 'INHIBIT', type: 'input'  },
      { pin: 24, name: 'VDD',     type: 'power'  },
    ],
    gates: [
      // DEC_4TO16_LATCH_HI input contract: [A, B, C, D, LE/STROBE, ENn/INHIBIT].
      // strobeActiveHigh:true — the CD4514B STROBE is HIGH=transparent (opposite
      // of the primitive's default active-LOW-transparent LE). INHIBIT maps
      // directly to the active-HIGH disable input (HIGH -> all outputs LOW).
      {
        type: 'DEC_4TO16_LATCH_HI',
        strobeActiveHigh: true,
        inputs: ['A', 'B', 'C', 'D', 'STROBE', 'INHIBIT'],
        outputs: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7',
                  'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15'],
      },
    ],
  },
};
