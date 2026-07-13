// Chip definitions block 42
// Chips: 74852-74854, 74856-74857, 74861-74864, 74866-74867,
//        74869-74870, 74873-74874, 74876

export const CHIPS_BLOCK_42 = {

  // 74852: 8 bit universal transceiver port controller (24-pin)
  '74x852': {
    name: '74x852',
    simpleName: '8 bit Universal Transceiver Port Controller',
    description: '8-bit universal transceiver port controller, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['transceiver', '8 bit', 'tri state', 'stub'],
    guideOverview: 'The 74x852 is an 8 bit universal transceiver port controller with 3-state outputs. It routes 8 bit data between two bidirectional A and B buses under mode select inputs S0 and S1, which choose among pass through, registered, and hold modes. OEn (active LOW) enables all output drivers. CLK clocks the internal pipeline register and CLRn (active LOW) asynchronously clears it. The flexible mode control makes it useful in high speed bus interfaces where configurable data-flow direction and pipelining are needed.',
    pinout: [
      { pin:  1, name: 'S0',  type: 'input'  },
      { pin:  2, name: 'S1',  type: 'input'  },
      { pin:  3, name: 'OEn', type: 'input'  },
      { pin:  4, name: 'A0',  type: 'bidir'  },
      { pin:  5, name: 'A1',  type: 'bidir'  },
      { pin:  6, name: 'A2',  type: 'bidir'  },
      { pin:  7, name: 'A3',  type: 'bidir'  },
      { pin:  8, name: 'A4',  type: 'bidir'  },
      { pin:  9, name: 'A5',  type: 'bidir'  },
      { pin: 10, name: 'A6',  type: 'bidir'  },
      { pin: 11, name: 'A7',  type: 'bidir'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'B7',  type: 'bidir'  },
      { pin: 14, name: 'B6',  type: 'bidir'  },
      { pin: 15, name: 'B5',  type: 'bidir'  },
      { pin: 16, name: 'B4',  type: 'bidir'  },
      { pin: 17, name: 'B3',  type: 'bidir'  },
      { pin: 18, name: 'B2',  type: 'bidir'  },
      { pin: 19, name: 'B1',  type: 'bidir'  },
      { pin: 20, name: 'B0',  type: 'bidir'  },
      { pin: 21, name: 'CLK', type: 'input'  },
      { pin: 22, name: 'CLRn',type: 'input'  },
      { pin: 23, name: 'NC',  type: 'nc'     },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['S0','S1','OEn','CLK','CLRn'], outputs: [] },
    ],
  },

  // ── 74853: 8-to-9 bit parity bus transceiver, non-inverting, latched error, TRI (24-pin)
  // Source: Texas Instruments, "SN54ABT853, SN74ABT853 8-Bit to 9-Bit Parity Bus
  //   Transceivers", SCBS198G (Feb 1991, rev. Oct 2010). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74abt853.pdf. Verified: terminal
  //   assignment (JT/W/DB/DW/NT/PW 24-pin package, TOP VIEW), description, and
  //   FUNCTION TABLE, pages 1-2, read as 400-/500-dpi rendered PDF page images
  //   (issues.md C4 — the TI PDF text layer is not trusted).
  // Pinout FIX (issues.md C2): the prior hand-entered stub map (OEBAn/OEABn/DIR/
  //   A0-A7/B0-B8/CLKAB/CLKBA) did NOT match the datasheet and has been replaced.
  //   Real map, TOP VIEW: OEAn(1), A1-A8(2-9), ERRn(10), CLRn(11), GND(12),
  //   LEn(13), OEBn(14), PARITY(15), B8-B1(16-23), VCC(24). There is no DIR, no
  //   per-direction clock, and no B9 — the 9th bit is a single shared PARITY I/O,
  //   direction is set by the OEAn/OEBn pair, and the error flag is held in a
  //   level latch gated by LEn (there is one LE, not two clocks).
  // Behavior: this is the 74x833 with a level-sensitive error LATCH (LEn) in place
  //   of the 833's edge-triggered register (CLK). See the XCVR_PARITY_LATCH
  //   evaluator in js/specificChipsSim.js. FUNCTION TABLE, page 2: OEBn=L drives
  //   A->B and generates odd PARITY; OEAn=L drives B->A and checks the 9-bit word;
  //   both HIGH isolates; both LOW sends A->B with parity inverted (forced-error
  //   diagnostic). ERRn (pin 10) is open-collector, active LOW: LEn LOW makes the
  //   flag transparent (follows the live check), LEn HIGH freezes it, CLRn LOW
  //   forces it HIGH. Odd-parity convention: a valid 9-bit word (8 data + PARITY)
  //   holds an odd number of 1s.
  '74x853': {
    name: '74x853',
    simpleName: '8-to-9 Transceiver w/ Parity Latch (Non Inv, TRI)',
    description: '8-to-9-bit non-inv parity bus transceiver, 3-state, latched err (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74abt853.pdf',
    tags: ['transceiver', 'parity', '8 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x853 moves a byte between an A bus and a B bus and carries a ninth bit for parity. Sending A to B, it generates a parity bit so the whole 9 bit word has an odd number of 1s. Receiving B to A, it re-checks that parity and stores the result in an error flag. Two active LOW enables set what it does: OEBn LOW alone sends A to B; OEAn LOW alone sends B to A; both HIGH isolates the buses; both LOW sends A to B with the parity bit flipped, which forces an error for testing. The error flag ERRn is open collector and active LOW. It sits behind a latch: while LEn is LOW the flag follows the live check, and raising LEn HIGH freezes whatever it last saw. A LOW pulse on CLRn forces the flag back HIGH.',
    guidePinDescriptions: {
      'OEAn': 'Output enable for the A bus, active LOW. LOW (with OEBn HIGH) drives A from B.',
      'OEBn': 'Output enable for the B bus, active LOW. LOW (with OEAn HIGH) drives B from A.',
      'A1':  'Bus A bit 1.',
      'A2':  'Bus A bit 2.',
      'A3':  'Bus A bit 3.',
      'A4':  'Bus A bit 4.',
      'A5':  'Bus A bit 5.',
      'A6':  'Bus A bit 6.',
      'A7':  'Bus A bit 7.',
      'A8':  'Bus A bit 8.',
      'ERRn': 'Parity error flag, open collector and active LOW. LOW means a checked word failed its parity check. LEn holds it and CLRn clears it.',
      'CLRn': 'Clear the error flag, active LOW. A LOW pulse forces ERRn back HIGH.',
      'GND': 'Ground reference (pin 12).',
      'LEn': 'Latch enable for the error flag, active LOW. LOW makes the flag transparent (it follows the live parity check); HIGH freezes the stored value.',
      'PARITY': 'The ninth bit. An output when sending A to B (the generated parity bit); an input when receiving B to A (the parity bit to check).',
      'B1':  'Bus B bit 1.',
      'B2':  'Bus B bit 2.',
      'B3':  'Bus B bit 3.',
      'B4':  'Bus B bit 4.',
      'B5':  'Bus B bit 5.',
      'B6':  'Bus B bit 6.',
      'B7':  'Bus B bit 7.',
      'B8':  'Bus B bit 8.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Odd parity',
        paragraphs: [
          'Parity is a one bit check on a group of bits. This chip uses odd parity: the parity bit is set so the total number of 1s across all nine bits (eight data plus parity) is odd. If the eight data bits already have an odd number of 1s, the parity bit is 0; if even, the parity bit is 1.',
          'When the chip sends A to B it computes that parity bit and drives it on the PARITY pin. When it receives B to A it adds up the nine incoming bits: an odd total is a good word, an even total means a bit flipped somewhere on the bus.',
        ],
      },
      {
        title: 'The latched error flag',
        paragraphs: [
          'The result of each received-word check drives the ERRn flag through a latch. While LEn is LOW the latch is transparent, so ERRn tracks the live check: a bad word pulls it LOW, and a following good word lets it go HIGH again. Raise LEn HIGH to freeze whatever the flag last held, so a brief bad word is captured even if the bus recovers before software reads it. A LOW pulse on CLRn resets the flag to HIGH regardless of LEn.',
          'ERRn is open collector, so it only pulls LOW. Tie it to a pull-up (or wire several chips together) and any one of them can flag an error. Driving both buses at once with both enables LOW sends A to B with the parity bit inverted, which is a deliberate way to inject a bad word and confirm the checking path works.',
        ],
      },
      {
        title: 'How it differs from the 74x833',
        paragraphs: [
          'The 74x833 is the same transceiver but its error flag is clocked: a rising edge on CLK samples the check into a register that then holds until cleared. The 74x853 replaces that clocked register with the LEn latch described above, so the flag is level-controlled instead of edge-triggered.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEAn',   type: 'input'  },
      { pin:  2, name: 'A1',     type: 'bidir'  },
      { pin:  3, name: 'A2',     type: 'bidir'  },
      { pin:  4, name: 'A3',     type: 'bidir'  },
      { pin:  5, name: 'A4',     type: 'bidir'  },
      { pin:  6, name: 'A5',     type: 'bidir'  },
      { pin:  7, name: 'A6',     type: 'bidir'  },
      { pin:  8, name: 'A7',     type: 'bidir'  },
      { pin:  9, name: 'A8',     type: 'bidir'  },
      { pin: 10, name: 'ERRn',   type: 'output' },
      { pin: 11, name: 'CLRn',   type: 'input'  },
      { pin: 12, name: 'GND',    type: 'power'  },
      { pin: 13, name: 'LEn',    type: 'input'  },
      { pin: 14, name: 'OEBn',   type: 'input'  },
      { pin: 15, name: 'PARITY', type: 'bidir'  },
      { pin: 16, name: 'B8',     type: 'bidir'  },
      { pin: 17, name: 'B7',     type: 'bidir'  },
      { pin: 18, name: 'B6',     type: 'bidir'  },
      { pin: 19, name: 'B5',     type: 'bidir'  },
      { pin: 20, name: 'B4',     type: 'bidir'  },
      { pin: 21, name: 'B3',     type: 'bidir'  },
      { pin: 22, name: 'B2',     type: 'bidir'  },
      { pin: 23, name: 'B1',     type: 'bidir'  },
      { pin: 24, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      // inputs:  [OEAn, OEBn, CLRn, LEn, A1..A8, B1..B8, PARITY]
      // outputs: [A1..A8, B1..B8, PARITY, ERRn]   (A/B/PARITY are bidirectional)
      { type: 'XCVR_PARITY_LATCH',
        inputs:  ['OEAn','OEBn','CLRn','LEn',
                  'A1','A2','A3','A4','A5','A6','A7','A8',
                  'B1','B2','B3','B4','B5','B6','B7','B8','PARITY'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8',
                  'B1','B2','B3','B4','B5','B6','B7','B8','PARITY','ERRn'] },
    ],
  },
  // 74854: 8-to-9 bit inverting parity bus transceiver with error-flag latch (24-pin)
  // Source: Signetics (Philips Semiconductors), "8-bit inverting transceiver with
  //   9-bit parity checker/generator and flag latch (3-State), 74ABT854", Objective
  //   specification, in the "IC23 ABT/MULTIBYTE Advanced BiCMOS Bus Interface Logic"
  //   data book (Apr 30, 1991), pp. 242-243. [Online]. Available:
  //   https://www.bitsavers.org/components/signetics/_dataBooks/1991_Signetics_IC23_ABT_MULTIBYTE_Advanced_BiCMOS_Bus_Interface_Logic.pdf
  //   Verified: DESCRIPTION, PIN CONFIGURATION, PIN DESCRIPTION, FUNCTION TABLE, and
  //   ERROR-FLAG FUNCTION TABLE, read as rendered ~300-dpi PDF page images (issues.md
  //   C4 — the OCR text layer garbles this scan, so pin numbers and the B=A̅/A=B̅ data
  //   columns were read from the images). Signetics names the byte bits A0-A7/B0-B7.
  // Cross-check: Texas Instruments, "SN54ABT853, SN74ABT853 8-Bit to 9-Bit Parity
  //   Bus Transceivers", SCBS198G (Feb 1991, rev. Oct 2010). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74abt853.pdf. Verified: the non-inverting
  //   853 sibling shares this exact 24-pin terminal assignment and FUNCTION/ERROR-FLAG
  //   tables (terminal diagram + function table, pages 1-2, native-text PDF; TI names
  //   the bits A1-A8/B1-B8 — same physical pins). The 854 differs only in that both
  //   data buses invert (B=A̅ transmit, A=B̅ receive); PARITY and ERROR logic match.
  // Pinout FIX (issues.md C2, the CD4082 lesson): the prior hand-entered stub map
  //   (OEBAn/OEABn/DIR on 1-3, A0-A7 on 4-11, B0-B8 on 13-21, CLKAB/CLKBA on 22-23)
  //   was fabricated and did not match either datasheet. There is no DIR pin and no
  //   pair of CLK pins — direction is set by the OEAn/OEBn pair, the 9th bit is a
  //   single shared PARITY I/O, and the error flag is held by one LEn latch enable.
  //   Real map, TOP VIEW: OEAn(1), A0-A7(2-9), ERRn(10), CLRn(11), GND(12), LEn(13),
  //   OEBn(14), PARITY(15), B7-B0(16-23), VCC(24).
  // Engine: XCVR_PARITY_LATCH_INV (see _evaluateXcvrParityLatch854 in
  //   js/specificChipsSim.js) — the inverting sibling of the 853's XCVR_PARITY_LATCH,
  //   related to it as the 74x834 register part is to the 74x833.
  '74x854': {
    name: '74x854',
    simpleName: '8-to-9 bit Transceiver w/ Parity Latch, Inv (TRI)',
    description: '8-to-9-bit inverting parity bus transceiver, 3-state, latched err (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.bitsavers.org/components/signetics/_dataBooks/1991_Signetics_IC23_ABT_MULTIBYTE_Advanced_BiCMOS_Bus_Interface_Logic.pdf',
    tags: ['transceiver', 'parity', '8 bit', 'inverting', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x854 moves a byte between an A bus and a B bus and carries a ninth bit for parity, inverting the data on the way through. Sending A to B, it drives B with the inverted A byte and generates a parity bit so the whole 9 bit word has an odd number of 1s. Receiving B to A, it drives A with the inverted B byte and re-checks that parity, holding the result in an error flag. Two active LOW enables set what it does: OEBn LOW alone sends A to B; OEAn LOW alone sends B to A; both HIGH isolates the buses; both LOW sends A to B with the parity bit flipped, which forces an error for testing. The error flag ERRn is open collector and active LOW. It sits behind a latch: while LEn is LOW the flag follows the live parity check, and raising LEn HIGH freezes whatever it last held. A LOW pulse on CLRn forces the flag back to no-error.',
    guidePinDescriptions: {
      'OEAn': 'Output enable for the A bus, active LOW. LOW (with OEBn HIGH) drives A from the inverted B data.',
      'OEBn': 'Output enable for the B bus, active LOW. LOW (with OEAn HIGH) drives B from the inverted A data.',
      'A0': 'Bus A bit 0.',
      'A1': 'Bus A bit 1.',
      'A2': 'Bus A bit 2.',
      'A3': 'Bus A bit 3.',
      'A4': 'Bus A bit 4.',
      'A5': 'Bus A bit 5.',
      'A6': 'Bus A bit 6.',
      'A7': 'Bus A bit 7.',
      'B0': 'Bus B bit 0.',
      'B1': 'Bus B bit 1.',
      'B2': 'Bus B bit 2.',
      'B3': 'Bus B bit 3.',
      'B4': 'Bus B bit 4.',
      'B5': 'Bus B bit 5.',
      'B6': 'Bus B bit 6.',
      'B7': 'Bus B bit 7.',
      'PARITY': 'The ninth bit. An output when sending A to B (the generated parity bit); an input when receiving B to A (the parity bit to check). Because the data is inverted but eight bits invert without changing the count of 1s by an odd amount, the parity is computed the same way as on the non-inverting 853.',
      'ERRn': 'Parity error flag, open collector and active LOW. LOW means a received word failed its parity check. The latch behind it (LEn) decides whether it tracks the live check or holds a captured value.',
      'LEn': 'Latch enable for the error flag, active LOW. LOW makes the latch transparent so ERRn follows the current parity check; HIGH freezes the flag at its last value.',
      'CLRn': 'Clear the error flag, active LOW. A LOW pulse forces ERRn back HIGH (no error) no matter what LEn is doing.',
      'GND': 'Ground reference (pin 12).',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'Inverting, with odd parity',
        paragraphs: [
          'Parity is a one bit check on a group of bits. This chip uses odd parity: the parity bit is set so the total number of 1s across all nine bits (eight data plus parity) is odd. If the eight data bits already have an odd number of 1s, the parity bit is 0; if even, the parity bit is 1.',
          'The 854 inverts the byte as it passes it across, so a HIGH on the source bus appears as a LOW on the destination bus. Inverting all eight data bits does not change whether their number of 1s is odd or even, so the parity bit is generated exactly as it is on the non-inverting 853, and a received word still checks as good when its nine bits total to an odd count.',
        ],
      },
      {
        title: 'The latched error flag',
        paragraphs: [
          'When the chip receives B to A it adds up the nine incoming bits. An odd total is a good word and ERRn stays HIGH; an even total means a bit flipped and ERRn goes LOW. That result feeds a latch controlled by LEn: hold LEn LOW and ERRn tracks the check live; raise LEn HIGH to capture and hold the flag so a brief bad word on the bus is not lost once you have latched it.',
          'ERRn is open collector, so it only pulls LOW. Tie it to a pull-up (or wire several chips together) and any one of them can flag an error. A LOW pulse on CLRn clears it back to HIGH. Driving both enables LOW at once sends A to B with the parity bit inverted, a deliberate way to inject a bad word and confirm the checking path works.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEAn',   type: 'input'  },
      { pin:  2, name: 'A0',     type: 'bidir'  },
      { pin:  3, name: 'A1',     type: 'bidir'  },
      { pin:  4, name: 'A2',     type: 'bidir'  },
      { pin:  5, name: 'A3',     type: 'bidir'  },
      { pin:  6, name: 'A4',     type: 'bidir'  },
      { pin:  7, name: 'A5',     type: 'bidir'  },
      { pin:  8, name: 'A6',     type: 'bidir'  },
      { pin:  9, name: 'A7',     type: 'bidir'  },
      { pin: 10, name: 'ERRn',   type: 'output' },
      { pin: 11, name: 'CLRn',   type: 'input'  },
      { pin: 12, name: 'GND',    type: 'power'  },
      { pin: 13, name: 'LEn',    type: 'input'  },
      { pin: 14, name: 'OEBn',   type: 'input'  },
      { pin: 15, name: 'PARITY', type: 'bidir'  },
      { pin: 16, name: 'B7',     type: 'bidir'  },
      { pin: 17, name: 'B6',     type: 'bidir'  },
      { pin: 18, name: 'B5',     type: 'bidir'  },
      { pin: 19, name: 'B4',     type: 'bidir'  },
      { pin: 20, name: 'B3',     type: 'bidir'  },
      { pin: 21, name: 'B2',     type: 'bidir'  },
      { pin: 22, name: 'B1',     type: 'bidir'  },
      { pin: 23, name: 'B0',     type: 'bidir'  },
      { pin: 24, name: 'VCC',    type: 'power'  },
    ],
    gates: [
      // inputs:  [OEAn, OEBn, CLRn, LEn, A0..A7, B0..B7, PARITY]
      // outputs: [A0..A7, B0..B7, PARITY, ERRn]   (A/B/PARITY are bidirectional)
      { type: 'XCVR_PARITY_LATCH_INV',
        inputs:  ['OEAn','OEBn','CLRn','LEn',
                  'A0','A1','A2','A3','A4','A5','A6','A7',
                  'B0','B1','B2','B3','B4','B5','B6','B7','PARITY'],
        outputs: ['A0','A1','A2','A3','A4','A5','A6','A7',
                  'B0','B1','B2','B3','B4','B5','B6','B7','PARITY','ERRn'] },
    ],
  },
  // 74856: 8 bit universal transceiver port controller w/ latch (24-pin)
  '74x856': {
    name: '74x856',
    simpleName: '8 bit Universal Transceiver Port Controller (w/ Latch)',
    description: '8-bit universal transceiver port controller, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['transceiver', '8 bit', 'tri state', 'stub'],
    guideOverview: 'The 74x856 is an 8 bit universal transceiver port controller like the 74x852 but with an added latch stage between the input and the output register. Mode select inputs S0 and S1 set the operating mode; OEn (active LOW) enables the output drivers; CLK clocks the internal latch; CLRn (active LOW) asynchronously clears the latch. The latch allows incoming data to be captured and held stable on the output bus even when the input bus changes, which is useful in pipelined bus architectures.',
    pinout: [
      { pin:  1, name: 'S0',  type: 'input'  },
      { pin:  2, name: 'S1',  type: 'input'  },
      { pin:  3, name: 'OEn', type: 'input'  },
      { pin:  4, name: 'A0',  type: 'bidir'  },
      { pin:  5, name: 'A1',  type: 'bidir'  },
      { pin:  6, name: 'A2',  type: 'bidir'  },
      { pin:  7, name: 'A3',  type: 'bidir'  },
      { pin:  8, name: 'A4',  type: 'bidir'  },
      { pin:  9, name: 'A5',  type: 'bidir'  },
      { pin: 10, name: 'A6',  type: 'bidir'  },
      { pin: 11, name: 'A7',  type: 'bidir'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'B7',  type: 'bidir'  },
      { pin: 14, name: 'B6',  type: 'bidir'  },
      { pin: 15, name: 'B5',  type: 'bidir'  },
      { pin: 16, name: 'B4',  type: 'bidir'  },
      { pin: 17, name: 'B3',  type: 'bidir'  },
      { pin: 18, name: 'B2',  type: 'bidir'  },
      { pin: 19, name: 'B1',  type: 'bidir'  },
      { pin: 20, name: 'B0',  type: 'bidir'  },
      { pin: 21, name: 'CLK', type: 'input'  },
      { pin: 22, name: 'CLRn',type: 'input'  },
      { pin: 23, name: 'NC',  type: 'nc'     },
      { pin: 24, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['S0','S1','OEn','CLK','CLRn'], outputs: [] },
    ],
  },
  // 74857: Hex 2-to-1 universal multiplexer with 3-state outputs (24-pin)
  // Source: Texas Instruments, "SN54ALS857, SN74ALS857 Hex 2-to-1 Universal
  //   Multiplexers With 3-State Outputs", SDAS170A (Dec 1982, rev. Jan 1995).
  //   [Online]. Available: https://www.ti.com/lit/gpn/SN54ALS857. Verified:
  //   terminal assignment (DW/JT/NT 24-pin DIP, page 1) + FUNCTION TABLE
  //   (page 2), read as rendered PDF page images (issues.md C4). The pre-existing
  //   stub pinout (SEL/OEn/A0..B5) was fabricated — this part is a UNIVERSAL mux
  //   with three control inputs (S0,S1,COMP), AND/NAND masking, and an OPER=0
  //   zero-detect output; corrected here, not cloned (issues.md C2).
  '74x857': {
    name: '74x857',
    simpleName: 'Hex 2-to-1 Universal Multiplexer (TRI)',
    description: 'Hex 2-to-1 universal mux, mask/complement, zero detect, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/gpn/SN54ALS857',
    tags: ['multiplexer', 'hex', '2-to-1', 'universal', 'tri state'],
    guideOverview: 'The 74x857 has six channels, each with an A input, a B input, and a Y output. Three control lines shared by all six channels decide what every Y does at once. S1 and S0 pick the operation: select A, select B, or AND the A and B inputs together (Y = A AND B per channel). COMP sets the output polarity: COMP LOW passes the result through, COMP HIGH inverts it (so select-A becomes NOT A, the AND becomes NAND). A separate OPER=0 pin is a zero detector: in select-A or select-B mode it goes HIGH when every bit of the chosen operand is LOW, which lets you flag an all-zero word. Driving COMP, S1, and S0 all HIGH together puts all seven outputs into high impedance so several chips can share one bus.',
    pinout: [
      { pin:  1, name: 'S0',    type: 'input'  },
      { pin:  2, name: '1A',    type: 'input'  },
      { pin:  3, name: '1B',    type: 'input'  },
      { pin:  4, name: '1Y',    type: 'output' },
      { pin:  5, name: '2A',    type: 'input'  },
      { pin:  6, name: '2B',    type: 'input'  },
      { pin:  7, name: '2Y',    type: 'output' },
      { pin:  8, name: '3A',    type: 'input'  },
      { pin:  9, name: '3B',    type: 'input'  },
      { pin: 10, name: '3Y',    type: 'output' },
      { pin: 11, name: 'OPER0', type: 'output' },
      { pin: 12, name: 'GND',   type: 'power'  },
      { pin: 13, name: 'COMP',  type: 'input'  },
      { pin: 14, name: '4Y',    type: 'output' },
      { pin: 15, name: '4B',    type: 'input'  },
      { pin: 16, name: '4A',    type: 'input'  },
      { pin: 17, name: '5Y',    type: 'output' },
      { pin: 18, name: '5A',    type: 'input'  },
      { pin: 19, name: '5B',    type: 'input'  },
      { pin: 20, name: '6Y',    type: 'output' },
      { pin: 21, name: '6B',    type: 'input'  },
      { pin: 22, name: '6A',    type: 'input'  },
      { pin: 23, name: 'S1',    type: 'input'  },
      { pin: 24, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'MUX_HEX_UNIVERSAL',
        inputs: ['S0','S1','COMP','1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'],
        outputs: ['1Y','2Y','3Y','4Y','5Y','6Y','OPER0'] },
    ],
  },
  // 74861: 10 bit bus transceiver, non inverting, TRI (24-pin)
  // Source: Texas Instruments, "SN54ABT861, SN74ABT861 10-Bit Transceivers With
  //   3-State Outputs", SCBS199C (Feb 1991, rev. May 1997). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74abt861.pdf. Verified: terminal
  //   assignment (DW/JT/NT package) and FUNCTION TABLE, pages 1-2, read as PDF
  //   page images (C4). The pre-existing stub pinout was wrong (C2): it named the
  //   buses A0-A9/B0-B9 and placed OEAB at pin 2 with data at pin 3 and pin 13.
  //   Correct map: OEBA=1, A1-A10=2-11, GND=12, OEAB=13, B10-B1=14-23, VCC=24.
  '74x861': {
    name: '74x861',
    simpleName: '10 bit Bus Transceiver (Non Inv, TRI)',
    description: '10 bit bus transceiver, non inverting, three state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74abt861.pdf',
    tags: ['transceiver', '10 bit', 'tri state'],
    guideOverview: 'The 74x861 is a 10 bit non inverting bus transceiver with 3-state outputs. It passes a 10 bit word between two bidirectional bus domains (A1 A10 on the A side, B1 B10 on the B side) without changing the logic polarity. Two active LOW enables set the direction: OEABn LOW drives the B side from the A side, OEBAn LOW drives the A side from the B side. With both HIGH the chip is isolated and both sides sit at high impedance. With both LOW the two sides are tied together and hold the last word (A = B). Use it to connect two bus segments that carry 10 bit data, such as a combined address and data path or a byte plus parity bit bus.',
    guidePinDescriptions: {
      'OEBAn': 'Active LOW enable for the B-to-A direction. Pull LOW to drive the A side from the B side; drive HIGH to release the A outputs.',
      'OEABn': 'Active LOW enable for the A-to-B direction. Pull LOW to drive the B side from the A side; drive HIGH to release the B outputs.',
      'A1': 'A-side bus bit 1. Passes data without inversion when the A-to-B direction is enabled; acts as an input when the B-to-A direction is enabled.',
      'A10': 'A-side bus bit 10.',
      'B1': 'B-side bus bit 1. Mirror of A1 on the other bus domain.',
      'B10': 'B-side bus bit 10.',
      'GND': 'Ground reference for the device at pin 12.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    pinout: [
      { pin:  1, name: 'OEBAn',type: 'input' },
      { pin:  2, name: 'A1',   type: 'bidir' },
      { pin:  3, name: 'A2',   type: 'bidir' },
      { pin:  4, name: 'A3',   type: 'bidir' },
      { pin:  5, name: 'A4',   type: 'bidir' },
      { pin:  6, name: 'A5',   type: 'bidir' },
      { pin:  7, name: 'A6',   type: 'bidir' },
      { pin:  8, name: 'A7',   type: 'bidir' },
      { pin:  9, name: 'A8',   type: 'bidir' },
      { pin: 10, name: 'A9',   type: 'bidir' },
      { pin: 11, name: 'A10',  type: 'bidir' },
      { pin: 12, name: 'GND',  type: 'power' },
      { pin: 13, name: 'OEABn',type: 'input' },
      { pin: 14, name: 'B10',  type: 'bidir' },
      { pin: 15, name: 'B9',   type: 'bidir' },
      { pin: 16, name: 'B8',   type: 'bidir' },
      { pin: 17, name: 'B7',   type: 'bidir' },
      { pin: 18, name: 'B6',   type: 'bidir' },
      { pin: 19, name: 'B5',   type: 'bidir' },
      { pin: 20, name: 'B4',   type: 'bidir' },
      { pin: 21, name: 'B3',   type: 'bidir' },
      { pin: 22, name: 'B2',   type: 'bidir' },
      { pin: 23, name: 'B1',   type: 'bidir' },
      { pin: 24, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'BUS_XCVR_10BIT_DUAL_TRI',
        inputs: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10',
                 'B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','OEABn','OEBAn'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10',
                  'B1','B2','B3','B4','B5','B6','B7','B8','B9','B10'] },
    ],
  },
  // 74x862: 10-bit inverting bus transceiver, 3-state, dual output-enable per
  //   direction (24-pin). Inverting sibling of the 74x861.
  // Source: Texas Instruments, "SN54ABT861, SN74ABT861 10-Bit Transceivers With
  //   3-State Outputs", SCBS199C (Feb 1991, rev. May 1997). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74abt861.pdf. Verified: terminal
  //   assignment (DW/JT/NT package) + FUNCTION TABLE + logic diagram, pages 1-2,
  //   read as PDF page images (issues.md C4).
  //   The '862 has NO standalone TI datasheet still online (discontinued; TI
  //   /lit URLs for sn74abt862 return 404, confirmed 2026-07). Per TI's ABT
  //   bus-transceiver convention the inverting/non-inverting pair ('861/'862,
  //   like '620/'640 and '863/'864) shares one identical terminal assignment;
  //   only the internal buffers differ (inverting on the '862). Pinout therefore
  //   taken from the '861 datasheet above and the control scheme is identical.
  //   The pre-existing hand-entered stub pinout was WRONG (issues.md C2): it
  //   invented a DIR pin at 3, put OEAB at pin 2, and numbered the buses
  //   A0-A9/B0-B9. There is no DIR pin. Correct map: OEBA=1, A1-A10=2-11, GND=12,
  //   OEAB=13, B10-B1=14-23, VCC=24. Simulated with BUS_XCVR_10BIT_DUAL_TRI and
  //   gate.invert:true in js/specificChipsSim.js.
  '74x862': {
    name: '74x862',
    simpleName: '10 bit Bus Transceiver (Inv, TRI)',
    description: '10 bit bus transceiver, inverting, three state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    sequential: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74abt861.pdf',
    tags: ['transceiver', '10 bit', 'inverting', 'tri state'],
    guideOverview: 'The 74x862 is the inverting version of the 74x861. It is a 10 bit bus transceiver with 3-state outputs that flips each bit as data passes through: a HIGH on one bus side appears as a LOW on the other. The A side carries bits A1 A10, the B side carries B1 B10. Two active LOW enables set the direction: OEABn LOW drives the B side from the inverted A side, OEBAn LOW drives the A side from the inverted B side. With both HIGH the chip is isolated and both sides sit at high impedance. With both LOW the two sides hold the last word. Use it when a 10 bit bus crossing needs a logic level flip, for example when joining an active HIGH bus to an active LOW one.',
    guidePinDescriptions: {
      'OEBAn': 'Active LOW enable for the B-to-A direction. Pull LOW to drive the A side from the inverted B side; drive HIGH to release the A outputs.',
      'OEABn': 'Active LOW enable for the A-to-B direction. Pull LOW to drive the B side from the inverted A side; drive HIGH to release the B outputs.',
      'A1': 'A-side bus bit 1. Passes the inverted A-to-B data when that direction is enabled; acts as an input when the B-to-A direction is enabled.',
      'A10': 'A-side bus bit 10.',
      'B1': 'B-side bus bit 1. Carries the inverse of A1 when the A-to-B direction is enabled.',
      'B10': 'B-side bus bit 10.',
      'GND': 'Ground reference for the device at pin 12.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    pinout: [
      { pin:  1, name: 'OEBAn',type: 'input' },
      { pin:  2, name: 'A1',   type: 'bidir' },
      { pin:  3, name: 'A2',   type: 'bidir' },
      { pin:  4, name: 'A3',   type: 'bidir' },
      { pin:  5, name: 'A4',   type: 'bidir' },
      { pin:  6, name: 'A5',   type: 'bidir' },
      { pin:  7, name: 'A6',   type: 'bidir' },
      { pin:  8, name: 'A7',   type: 'bidir' },
      { pin:  9, name: 'A8',   type: 'bidir' },
      { pin: 10, name: 'A9',   type: 'bidir' },
      { pin: 11, name: 'A10',  type: 'bidir' },
      { pin: 12, name: 'GND',  type: 'power' },
      { pin: 13, name: 'OEABn',type: 'input' },
      { pin: 14, name: 'B10',  type: 'bidir' },
      { pin: 15, name: 'B9',   type: 'bidir' },
      { pin: 16, name: 'B8',   type: 'bidir' },
      { pin: 17, name: 'B7',   type: 'bidir' },
      { pin: 18, name: 'B6',   type: 'bidir' },
      { pin: 19, name: 'B5',   type: 'bidir' },
      { pin: 20, name: 'B4',   type: 'bidir' },
      { pin: 21, name: 'B3',   type: 'bidir' },
      { pin: 22, name: 'B2',   type: 'bidir' },
      { pin: 23, name: 'B1',   type: 'bidir' },
      { pin: 24, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'BUS_XCVR_10BIT_DUAL_TRI', invert: true,
        inputs: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10',
                 'B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','OEABn','OEBAn'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10',
                  'B1','B2','B3','B4','B5','B6','B7','B8','B9','B10'] },
    ],
  },
  // 74x863: 9-bit non-inverting bus transceiver, 3-state, dual output-enable per direction (24-pin)
  // Source: Texas Instruments, "SN54ABT863, SN74ABT863 9-Bit Bus Transceivers
  //   With 3-State Outputs", SCBS201E (Feb 1991, rev. Jul 1998). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn74abt863.pdf. Verified:
  //   terminal assignment (DB/DW/JT/NT/PW package top view) + FUNCTION TABLE +
  //   logic diagram, pages 1-3, read as PDF page images (issues.md C4). The
  //   hand-entered stub pinout was WRONG (had a nonexistent DIR pin on 3 and an
  //   NC on 23, buses numbered A0-A8/B0-B8) and was corrected against the
  //   datasheet (issues.md C2): 1=OEBA1, 2-10=A1..A9, 11=OEBA2, 12=GND,
  //   13=OEAB1, 14=OEAB2, 15-23=B9..B1, 24=VCC. Real part has four active-LOW
  //   output-enable pins (two per direction), no DIR, no NC. Simulated with the
  //   BUS_XCVR_9BIT_QUAD_OE primitive in js/specificChipsSim.js.
  '74x863': {
    name: '74x863',
    simpleName: '9 bit Bus Transceiver (Non Inv, TRI)',
    description: '9 bit bus transceiver, non inverting, three state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74abt863.pdf',
    tags: ['transceiver', '9 bit', 'tri state'],
    guideOverview: 'The 74x863 is a non inverting 9 bit bus transceiver with 3-state outputs. It moves a 9 bit word (typically 8 data bits plus 1 parity or control bit) between an A side bus and a B side bus without changing logic polarity. Two active LOW enables control each direction: OEAB1 and OEAB2 must both be LOW to send A to B, and OEBA1 and OEBA2 must both be LOW to send B to A. Enable one direction to pass data that way, disable both to isolate the chip from the bus, and enable both at once to hold the current word on both sides.',
    guidePinDescriptions: {
      'OEBA1': 'One of two active LOW enables for the B-to A path. Both OEBA1 and OEBA2 must be LOW to let the B side drive the A side.',
      'OEBA2': 'The second active LOW enable for the B-to A path. Any HIGH on OEBA1 or OEBA2 disables B-to A.',
      'OEAB1': 'One of two active LOW enables for the A-to B path. Both OEAB1 and OEAB2 must be LOW to let the A side drive the B side.',
      'OEAB2': 'The second active LOW enable for the A-to B path. Any HIGH on OEAB1 or OEAB2 disables A-to B.',
      'A1': 'A-side bus bit 1. This bidirectional pin passes data without inversion when the A-to B path is disabled and B-to A is enabled it is driven, otherwise it is an input.',
      'A2': 'A-side bus bit 2.',
      'A3': 'A-side bus bit 3.',
      'A4': 'A-side bus bit 4.',
      'A5': 'A-side bus bit 5.',
      'A6': 'A-side bus bit 6.',
      'A7': 'A-side bus bit 7.',
      'A8': 'A-side bus bit 8.',
      'A9': 'A-side bus bit 9, often used as a parity or extra control bit.',
      'GND': 'Ground reference for the device at pin 12.',
      'B9': 'B-side bus bit 9.',
      'B8': 'B-side bus bit 8.',
      'B7': 'B-side bus bit 7.',
      'B6': 'B-side bus bit 6.',
      'B5': 'B-side bus bit 5.',
      'B4': 'B-side bus bit 4.',
      'B3': 'B-side bus bit 3.',
      'B2': 'B-side bus bit 2.',
      'B1': 'B-side bus bit 1.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'Why 9 bit Buses Exist',
        paragraphs: [
          'A ninth bus bit is often used for parity, byte tagging, or an extra control flag. That makes a 9 bit transceiver handy whenever a plain octal buffer would leave one important line unmanaged.',
          'Because the 74x863 is non inverting, it is chosen when logic levels should appear unchanged on the receiving side of the bus.',
        ],
      },
      {
        title: 'The Four Enable Pins',
        paragraphs: [
          'Each direction has two active LOW enables that are ANDed together, so both pins in a pair must be LOW for that direction to drive. This lets two separate control signals gate one direction, for example a bus-grant line and a byte-select line, without an external gate.',
          'Enabling both directions at once is a valid state: the datasheet calls it "latch A and B". Both drivers push the last word onto both buses and hold it. The simulator models this as holding the most recent value that passed through.',
        ],
        list: [
          'A to B: OEAB1 and OEAB2 both LOW, at least one OEBA pin HIGH.',
          'B to A: OEBA1 and OEBA2 both LOW, at least one OEAB pin HIGH.',
          'Isolation (both sides high impedance): at least one pin HIGH in each pair.',
          'Latch: all four enables LOW, holds the current word on both buses.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OEBA1',type: 'input' },
      { pin:  2, name: 'A1',   type: 'bidir' },
      { pin:  3, name: 'A2',   type: 'bidir' },
      { pin:  4, name: 'A3',   type: 'bidir' },
      { pin:  5, name: 'A4',   type: 'bidir' },
      { pin:  6, name: 'A5',   type: 'bidir' },
      { pin:  7, name: 'A6',   type: 'bidir' },
      { pin:  8, name: 'A7',   type: 'bidir' },
      { pin:  9, name: 'A8',   type: 'bidir' },
      { pin: 10, name: 'A9',   type: 'bidir' },
      { pin: 11, name: 'OEBA2',type: 'input' },
      { pin: 12, name: 'GND',  type: 'power' },
      { pin: 13, name: 'OEAB1',type: 'input' },
      { pin: 14, name: 'OEAB2',type: 'input' },
      { pin: 15, name: 'B9',   type: 'bidir' },
      { pin: 16, name: 'B8',   type: 'bidir' },
      { pin: 17, name: 'B7',   type: 'bidir' },
      { pin: 18, name: 'B6',   type: 'bidir' },
      { pin: 19, name: 'B5',   type: 'bidir' },
      { pin: 20, name: 'B4',   type: 'bidir' },
      { pin: 21, name: 'B3',   type: 'bidir' },
      { pin: 22, name: 'B2',   type: 'bidir' },
      { pin: 23, name: 'B1',   type: 'bidir' },
      { pin: 24, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'BUS_XCVR_9BIT_QUAD_OE',
        inputs: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','B1','B2','B3','B4','B5','B6','B7','B8','B9','OEBA1','OEBA2','OEAB1','OEAB2'],
        outputs: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','B1','B2','B3','B4','B5','B6','B7','B8','B9'] },
    ],
  },
  // 74864: 9 bit bus transceiver, inverting, TRI (24-pin)
  // Source [1] (pinout): Philips Semiconductors, "74ABT863 9-bit bus transceiver
  //   (3-State)", Product specification, 1998 Jan 16 (supersedes 1993 Jun 21),
  //   IC23 Data Handbook, doc 853-1622 18869. [Online]. Available:
  //   http://www.doc.chipfind.ru/pdf/philips/74abt863n.pdf. Verified: PIN
  //   CONFIGURATION diagram (SA00283), PIN DESCRIPTION table, read as 200/400-dpi
  //   renderings of PDF page images (issues.md C4). This gave the 24-pin terminal
  //   assignment used below (the '864 shares the '863 package/pinout, inverting).
  // Source [2] (function table): Texas Instruments, "SN54ABT861, SN74ABT861 ...
  //   10-Bit Bus Transceivers With 3-State Outputs", SCBS199C (Feb 1991, rev May
  //   1997). [Online]. Available: https://www.ti.com/lit/gpn/sn74abt861.
  //   Verified: FUNCTION TABLE, read as a rendered PDF page. The '861/'863 family
  //   share the same control logic (the '863 just splits each enable into a
  //   NOR-ed pair and drops one data bit). The TI table documents all four modes,
  //   including the store mode the Philips sheet omits.
  // FUNCTION TABLE (per direction, enables active-LOW and NOR-ed):
  //   A->B active  when OEAB0=OEAB1=L and the OEBA pair is not both L.
  //   B->A active  when OEBA0=OEBA1=L and the OEAB pair is not both L.
  //   all four HIGH  -> Isolation (all 18 data pins Hi-Z).
  //   all four LOW   -> "Latch A and B": both directions drive at once, holding
  //     the last word that crossed. The '863 holds A = B; the inverting '864
  //     holds the B side as the complement of the stored A word. This is what
  //     needs `sequential: true` and the latched state in the primitive.
  //   The '864 inverts every bit relative to the '863.
  // NOTE: the original hand-entered stub pinout was WRONG (issues.md C2, the
  //   CD4082 lesson): it invented control pins OEBAn/OEABn/DIR plus an NC and
  //   placed A0-A8/B0-B8 on the wrong terminals. The real part has NO DIR pin.
  //   Control is four active-LOW output enables, two per direction, NOR-ed:
  //   A->B needs OEAB0(14)+OEAB1(13) both LOW, B->A needs OEBA0(1)+OEBA1(11)
  //   both LOW. Pinout below replaced to match the datasheet page image.
  '74x864': {
    name: '74x864',
    simpleName: '9 bit Bus Transceiver (Inv, TRI)',
    description: '9 bit bus transceiver, inverting, three state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['transceiver', '9 bit', 'inverting', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x864 is a 9 bit bidirectional bus transceiver that inverts every bit as it crosses. It links an A side (A0 A8) to a B side (B0 B8) and passes data one direction at a time. Each direction has its own pair of active LOW enables: A to B turns on only when both OEAB0 and OEAB1 are LOW, and B to A turns on only when both OEBA0 and OEBA1 are LOW. Two enables per direction let two separate control signals gate the same path. When a direction is on, a HIGH on the driving side appears as a LOW on the receiving side, and the driving side floats at high impedance. With all four enables HIGH the chip is isolated: all 18 data pins float. With all four enables LOW both directions turn on at once and the chip holds the last word that crossed, acting as a latch. The ninth bit lets a byte and its parity or an extra flag move together. This is the inverting version of the 74x863.',
    pinout: [
      { pin:  1, name: 'OEBA0',type: 'input' },
      { pin:  2, name: 'A0',   type: 'bidir' },
      { pin:  3, name: 'A1',   type: 'bidir' },
      { pin:  4, name: 'A2',   type: 'bidir' },
      { pin:  5, name: 'A3',   type: 'bidir' },
      { pin:  6, name: 'A4',   type: 'bidir' },
      { pin:  7, name: 'A5',   type: 'bidir' },
      { pin:  8, name: 'A6',   type: 'bidir' },
      { pin:  9, name: 'A7',   type: 'bidir' },
      { pin: 10, name: 'A8',   type: 'bidir' },
      { pin: 11, name: 'OEBA1',type: 'input' },
      { pin: 12, name: 'GND',  type: 'power' },
      { pin: 13, name: 'OEAB1',type: 'input' },
      { pin: 14, name: 'OEAB0',type: 'input' },
      { pin: 15, name: 'B8',   type: 'bidir' },
      { pin: 16, name: 'B7',   type: 'bidir' },
      { pin: 17, name: 'B6',   type: 'bidir' },
      { pin: 18, name: 'B5',   type: 'bidir' },
      { pin: 19, name: 'B4',   type: 'bidir' },
      { pin: 20, name: 'B3',   type: 'bidir' },
      { pin: 21, name: 'B2',   type: 'bidir' },
      { pin: 22, name: 'B1',   type: 'bidir' },
      { pin: 23, name: 'B0',   type: 'bidir' },
      { pin: 24, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'BUS_XCVR_9BIT_DUAL_OE', invert: true,
        inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8',
                 'B0','B1','B2','B3','B4','B5','B6','B7','B8',
                 'OEAB0','OEAB1','OEBA0','OEBA1'],
        outputs: ['A0','A1','A2','A3','A4','A5','A6','A7','A8',
                  'B0','B1','B2','B3','B4','B5','B6','B7','B8'] },
    ],
  },
  // 74866: 8 bit magnitude comparator with latches (24-pin)
  '74x866': {
    name: '74x866',
    simpleName: '8 bit Magnitude Comparator w/ Latches',
    description: '8 bit magnitude comparator with latches (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['comparator', '8 bit', 'latch'],
    sequential: true,
    guideOverview: 'The 74x866 is an 8 bit magnitude comparator with latched outputs. It compares two 8 bit unsigned words A0 A7 and B0 B7 and asserts one of four active HIGH result outputs: AGTB (A greater than B), AEQB (A equal to B), ALTB (A less than B), and AGEB (A greater than or equal to B). The latch enable (LE) captures the current comparison result into an output register when asserted, holding the result stable while the input data changes. Extends the 4 bit 74x85 comparator to full byte width.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input'  },
      { pin:  2, name: 'B0',   type: 'input'  },
      { pin:  3, name: 'A1',   type: 'input'  },
      { pin:  4, name: 'B1',   type: 'input'  },
      { pin:  5, name: 'A2',   type: 'input'  },
      { pin:  6, name: 'B2',   type: 'input'  },
      { pin:  7, name: 'A3',   type: 'input'  },
      { pin:  8, name: 'B3',   type: 'input'  },
      { pin:  9, name: 'LE',   type: 'input'  },
      { pin: 10, name: 'AGEB', type: 'output' },
      { pin: 11, name: 'ALTB', type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'AGTB', type: 'output' },
      { pin: 14, name: 'AEQB', type: 'output' },
      { pin: 15, name: 'A7',   type: 'input'  },
      { pin: 16, name: 'B7',   type: 'input'  },
      { pin: 17, name: 'A6',   type: 'input'  },
      { pin: 18, name: 'B6',   type: 'input'  },
      { pin: 19, name: 'A5',   type: 'input'  },
      { pin: 20, name: 'B5',   type: 'input'  },
      { pin: 21, name: 'A4',   type: 'input'  },
      { pin: 22, name: 'B4',   type: 'input'  },
      { pin: 23, name: 'NC',   type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COMPARATOR_8BIT_LATCH',
        inputs: ['A0','B0','A1','B1','A2','B2','A3','B3','A4','B4','A5','B5','A6','B6','A7','B7','LE'],
        outputs: ['AGEB','ALTB','AGTB','AEQB'] },
    ],
  },
  // 74867: Synchronous 8 bit up/down counter, async CLR (24-pin)
  // Source: Texas Instruments, "SN54AS867/869, SN74ALS867A, SN74ALS869,
  //   SN74AS867/869 Synchronous 8-Bit Up/Down Counters", SDAS115C
  //   (Dec 1982, rev Jan 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als867a.pdf. Verified: terminal
  //   assignment (DW/JT/NT package), function table, cascading description and
  //   'AS867 logic symbol (async 0R clear), pages 1-4, read as PDF page images.
  // NOTE: the original hand-entered stub pinout was wrong (it invented
  //   CLRn/LDn/OEn/U_Dn and 3-state outputs). The real part has no such pins:
  //   control is the S1/S0 mode select, enables are active-LOW ENP/ENT, RCO is
  //   active-LOW, clear/load are modes (not pins), and outputs are totem-pole.
  //   Pinout below replaced to match the datasheet (issues.md C2 lesson).
  '74x867': {
    name: '74x867',
    simpleName: '8 bit Sync Up/Down Counter (Async CLR)',
    description: 'Synchronous 8 bit up/down counter with asynchronous clear (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als867a.pdf',
    tags: ['counter', '8 bit', 'up-down', 'synchronous'],
    sequential: true,
    guideOverview: 'The 74x867 is a synchronous 8 bit up/down counter with asynchronous clear. All eight flip-flops are clocked together on the rising edge of CLK, so the outputs QA-QH change at the same instant instead of rippling. Two select inputs pick the mode: S1 LOW / S0 LOW clears the count to zero (immediately, without waiting for a clock edge), S1 LOW / S0 HIGH counts down, S1 HIGH / S0 LOW loads the value on A-H, and S1 HIGH / S0 HIGH counts up. Counting only happens when both active-LOW enables ENP and ENT are LOW. RCO is the active-LOW ripple-carry output: it is gated by ENT and pulses LOW at the terminal count (255 counting up, 0 counting down), which feeds the enables of the next stage so several chips chain into a wider counter.',
    guidePinDescriptions: {
      'S0': 'Mode select bit 0. With S1, picks the operation: 00 clear, 01 count down, 10 load, 11 count up.',
      'S1': 'Mode select bit 1. With S0, picks the operation: 00 clear, 01 count down, 10 load, 11 count up.',
      'A': 'Parallel data input for QA (bit 0). Loaded into the counter when S1 HIGH / S0 LOW on the next clock edge.',
      'B': 'Parallel data input for QB (bit 1).',
      'C': 'Parallel data input for QC (bit 2).',
      'D': 'Parallel data input for QD (bit 3).',
      'E': 'Parallel data input for QE (bit 4).',
      'F': 'Parallel data input for QF (bit 5).',
      'G': 'Parallel data input for QG (bit 6).',
      'H': 'Parallel data input for QH (bit 7).',
      'ENTn': 'Active-LOW count enable. Must be LOW (with ENPn) to count. Also gates RCO: RCO can only pulse LOW while ENT is LOW.',
      'ENPn': 'Active-LOW count enable. Must be LOW (with ENTn) to count. Does not affect RCO.',
      'CLK': 'Clock. The counter loads or counts on the rising edge. Clear (mode 00) does not wait for a clock.',
      'RCO': 'Active-LOW ripple-carry output. Pulses LOW at the terminal count (FFh up, 00h down) while ENT is LOW. Connect to the next stage to cascade.',
      'QA': 'Count output bit 0 (least significant).',
      'QB': 'Count output bit 1.',
      'QC': 'Count output bit 2.',
      'QD': 'Count output bit 3.',
      'QE': 'Count output bit 4.',
      'QF': 'Count output bit 5.',
      'QG': 'Count output bit 6.',
      'QH': 'Count output bit 7 (most significant).',
      'GND': 'Ground, pin 12.',
      'VCC': 'Supply voltage, pin 24.',
    },
    guideSections: [
      {
        title: 'Mode select instead of separate pins',
        paragraphs: [
          'Unlike a 74x161-style counter with a load pin and a clear pin, the 867 packs clear, load, count down and count up into the two select inputs S1 and S0. Set the mode you want, then clock the chip (clear is the exception   it acts immediately, no clock needed).',
          'Counting also needs both ENP and ENT held LOW. Either one HIGH freezes the count without changing the mode, which is handy for pausing while the rest of a circuit settles.',
        ],
      },
      {
        title: 'Cascading with RCO',
        paragraphs: [
          'RCO is active LOW and is gated by ENT: it drops LOW only at the last count in the current direction (255 when counting up, 0 when counting down). Wire one stage\'s RCO into the next stage\'s ENT (and ENP) so the upper byte advances exactly once per overflow of the lower byte, giving a 16 bit or wider synchronous counter with no extra glue logic.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'S0',   type: 'input'  },
      { pin:  2, name: 'S1',   type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'E',    type: 'input'  },
      { pin:  8, name: 'F',    type: 'input'  },
      { pin:  9, name: 'G',    type: 'input'  },
      { pin: 10, name: 'H',    type: 'input'  },
      { pin: 11, name: 'ENTn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'RCO',  type: 'output' },
      { pin: 14, name: 'CLK',  type: 'input'  },
      { pin: 15, name: 'QH',   type: 'output' },
      { pin: 16, name: 'QG',   type: 'output' },
      { pin: 17, name: 'QF',   type: 'output' },
      { pin: 18, name: 'QE',   type: 'output' },
      { pin: 19, name: 'QD',   type: 'output' },
      { pin: 20, name: 'QC',   type: 'output' },
      { pin: 21, name: 'QB',   type: 'output' },
      { pin: 22, name: 'QA',   type: 'output' },
      { pin: 23, name: 'ENPn', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_8BIT_SYNC_867',
        inputs:  ['S0','S1','A','B','C','D','E','F','G','H','ENPn','ENTn','CLK'],
        outputs: ['QA','QB','QC','QD','QE','QF','QG','QH','RCO'] },
    ],
  },
  // 74x869: Synchronous 8-bit up/down counter with SYNCHRONOUS clear (24-pin).
  // Source: Texas Instruments, "SN54AS867, SN54AS869, SN74ALS867A, SN74ALS869,
  //   SN74AS867, SN74AS869 Synchronous 8-Bit Up/Down Counters", SDAS115C
  //   (Dec 1982, rev. Jan 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als869.pdf. Verified: terminal
  //   assignment for the DW/JT/NT 24-pin package (p.1), function table
  //   S1,S0 = LL clear / LH count-down / HL load / HH count-up with both ENP,ENT
  //   active-LOW to count (pp.1-2), and the synchronous clear — IEEE logic symbol
  //   shows the '869 clear as "0,6R" (qualified by clock control 6) vs the '867's
  //   asynchronous "0R" (p.3). Read as PDF page images, not a text summary.
  // Engine: reuses the COUNTER_8BIT_SYNC_867 primitive with syncClear:true; the
  //   '869 differs from the '867 only in that its clear waits for the clock edge.
  '74x869': {
    name: '74x869',
    simpleName: '8 bit Sync Up/Down Counter (Sync CLR)',
    description: 'Synchronous 8 bit up/down counter with synchronous clear (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als869.pdf',
    tags: ['counter', '8 bit', 'up-down', 'synchronous'],
    sequential: true,
    guideOverview: 'The 74x869 is a synchronous 8 bit up/down counter. Two select inputs, S0 and S1, choose one of four actions that all take effect on the next rising clock edge: clear to zero, count down, load the A-H data inputs, or count up. Because the clear is synchronous it waits for the clock edge instead of acting the instant S0/S1 change, which keeps the count outputs free of glitches. Counting only happens when both enable inputs ENP and ENT are LOW; loading and clearing ignore the enables. The eight count bits appear on QA-QH, with QA the least significant. RCO is an active LOW ripple-carry output: it goes LOW when ENT is LOW and the counter reaches its terminal value (all HIGH counting up, or all LOW counting down), so several chips can be chained into a wider counter. The 74x869 is identical to the 74x867 except the 74x867 clears asynchronously, the instant S0/S1 select clear.',
    guidePinDescriptions: {
      'S0': 'Mode select, low bit. With S1 it picks the action taken on the next rising clock edge: S1,S0 = LOW,LOW clear; LOW,HIGH count down; HIGH,LOW load; HIGH,HIGH count up.',
      'S1': 'Mode select, high bit. See S0.',
      'A': 'Parallel data input, bit 0 (least significant). Loaded into the counter on the next clock edge when S1,S0 select load (HIGH,LOW).',
      'B': 'Parallel data input, bit 1.',
      'C': 'Parallel data input, bit 2.',
      'D': 'Parallel data input, bit 3.',
      'E': 'Parallel data input, bit 4.',
      'F': 'Parallel data input, bit 5.',
      'G': 'Parallel data input, bit 6.',
      'H': 'Parallel data input, bit 7 (most significant).',
      'ENTn': 'Active LOW count enable. Both ENT and ENP must be LOW to count. ENT also gates RCO.',
      'GND': 'Ground reference at pin 12.',
      'RCOn': 'Active LOW ripple-carry output. Goes LOW (when ENT is LOW) at terminal count — all outputs HIGH counting up, or all LOW counting down. Drives the next stage when cascading.',
      'CLK': 'Clock. Clear, load, and count all happen on the rising (LOW-to-HIGH) edge.',
      'QH': 'Count output, bit 7 (most significant).',
      'QG': 'Count output, bit 6.',
      'QF': 'Count output, bit 5.',
      'QE': 'Count output, bit 4.',
      'QD': 'Count output, bit 3.',
      'QC': 'Count output, bit 2.',
      'QB': 'Count output, bit 1.',
      'QA': 'Count output, bit 0 (least significant).',
      'ENPn': 'Active LOW count enable. Both ENP and ENT must be LOW to count. Unlike ENT it does not affect RCO.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    pinout: [
      { pin:  1, name: 'S0',   type: 'input'  },
      { pin:  2, name: 'S1',   type: 'input'  },
      { pin:  3, name: 'A',    type: 'input'  },
      { pin:  4, name: 'B',    type: 'input'  },
      { pin:  5, name: 'C',    type: 'input'  },
      { pin:  6, name: 'D',    type: 'input'  },
      { pin:  7, name: 'E',    type: 'input'  },
      { pin:  8, name: 'F',    type: 'input'  },
      { pin:  9, name: 'G',    type: 'input'  },
      { pin: 10, name: 'H',    type: 'input'  },
      { pin: 11, name: 'ENTn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'RCOn', type: 'output' },
      { pin: 14, name: 'CLK',  type: 'input'  },
      { pin: 15, name: 'QH',   type: 'output' },
      { pin: 16, name: 'QG',   type: 'output' },
      { pin: 17, name: 'QF',   type: 'output' },
      { pin: 18, name: 'QE',   type: 'output' },
      { pin: 19, name: 'QD',   type: 'output' },
      { pin: 20, name: 'QC',   type: 'output' },
      { pin: 21, name: 'QB',   type: 'output' },
      { pin: 22, name: 'QA',   type: 'output' },
      { pin: 23, name: 'ENPn', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_8BIT_SYNC_867', syncClear: true,
        inputs: ['S0','S1','A','B','C','D','E','F','G','H','ENPn','ENTn','CLK'],
        outputs: ['QA','QB','QC','QD','QE','QF','QG','QH','RCOn'] },
    ],
  },
  // 74870: Dual 16x4 register files with bidirectional ports (24-pin)
  // Source: Texas Instruments, "SN74ALS870 Dual 16-by-4 Register Files", datasheet.
  //   [Online]. Available: https://www.alldatasheet.com/datasheet-pdf/pdf/28301/TI/SN74ALS870.html
  //   (TI purged the original sn74als870.pdf from ti.com/lit; mirror idx 28301).
  //   Verified: terminal (pin) assignment, page 1, read as a rendered PDF-page image
  //   via the alldatasheet html-pdf viewer. NOTE the datasheet numbers the data pins
  //   DQA1-DQA4 / DQB1-DQB4 (1-based, DQA1 = LSB at pin 8, DQB1 = LSB at pin 13); this
  //   entry keeps the equivalent 0-based names DQA0-DQA3 / DQB0-DQB3 on the same pins.
  // Source: Texas Instruments, SN74ALS870 datasheet function description (secondary,
  //   text). Verified: S0/S1 select which file each port accesses, S2/S3 set port A/B
  //   direction, each file has its own address bus (1A/2A) and active-LOW write enable
  //   (1W/2W), and "to prevent writing conflicts in the dual-input mode, the B-input
  //   port takes priority." The full function-table page image could not be re-rendered
  //   (mirror rate-limited the tokened PDF; the gif thumbnails were 80x100, unreadable),
  //   so the tie-break/direction semantics rest on this text, not a read of that table.
  '74x870': {
    name: '74x870',
    simpleName: 'Dual 16×4 Register Files (3-State I/O)',
    description: 'Dual 16x4 register files, two bidirectional 4-bit ports, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.alldatasheet.com/datasheet-pdf/pdf/28301/TI/SN74ALS870.html',
    tags: ['register-file', 'dual', 'bidir', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x870 contains two independent 16 word by 4 bit register files, each accessible through two shared bidirectional 4 bit bus ports. Port A (DQA0-DQA3) and port B (DQB0-DQB3) can each independently read from or write to either register file. S0 and S1 select which internal file each port connects to, while S2 and S3 set the I/O direction for ports A and B respectively. Separate write enables (1W and 2W) gate writes into each register file. This lets two buses share storage: one bus can read one file while the other bus reads or writes the second file at the same time.',
    guidePinDescriptions: {
      'S0': 'File select bit 0 for port A. LOW connects port A to register file 1; HIGH connects port A to register file 2.',
      '1A0': 'Register file 1 address bit 0. Together with 1A1 1A3, selects one of 16 words in register file 1.',
      '1A1': 'Register file 1 address bit 1.',
      '1A2': 'Register file 1 address bit 2.',
      '1A3': 'Register file 1 address bit 3.',
      '1W': 'Active LOW write enable for register file 1. Pull LOW to enable a write operation into file 1.',
      'S2': 'Port A direction control. LOW = port A in output mode (reads data from the selected register file onto the DQA bus); HIGH = port A in input mode (writes data from the DQA bus into the selected register file).',
      'DQA0': 'Bidirectional data bus port A, bit 0. Drives read data when S2 is LOW; accepts write data when S2 is HIGH.',
      'DQA1': 'Bidirectional data bus port A, bit 1.',
      'DQA2': 'Bidirectional data bus port A, bit 2.',
      'DQA3': 'Bidirectional data bus port A, bit 3.',
      'GND': 'Ground reference for the device at pin 12.',
      'DQB0': 'Bidirectional data bus port B, bit 0. Drives read data when S3 is LOW; accepts write data when S3 is HIGH.',
      'DQB1': 'Bidirectional data bus port B, bit 1.',
      'DQB2': 'Bidirectional data bus port B, bit 2.',
      'DQB3': 'Bidirectional data bus port B, bit 3.',
      'S3': 'Port B direction control. LOW = port B in output mode (reads data from the selected register file onto the DQB bus); HIGH = port B in input mode (writes data from the DQB bus into the selected register file).',
      '2W': 'Active LOW write enable for register file 2. Pull LOW to enable a write operation into file 2.',
      '2A0': 'Register file 2 address bit 0. Together with 2A1 2A3, selects one of 16 words in register file 2.',
      '2A1': 'Register file 2 address bit 1.',
      '2A2': 'Register file 2 address bit 2.',
      '2A3': 'Register file 2 address bit 3.',
      'S1': 'File select bit 1 for port B. LOW connects port B to register file 1; HIGH connects port B to register file 2.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'Two Register Files, Two Bus Ports',
        paragraphs: [
          'The 74x870 holds two completely independent 16×4 register files in a single 24-pin package. Each file has its own 4 bit address bus (1A0 1A3 for file 1, 2A0 2A3 for file 2) and its own write enable (1W and 2W), so one file can be written while the other is simultaneously being read.',
          'Port A and port B are the two external bus interfaces. S0 routes port A to file 1 or file 2, and S1 does the same for port B, enabling any combination of file to port connections.',
        ],
      },
      {
        title: 'Bidirectional Bus Ports and Direction Control',
        paragraphs: [
          'Each port is fully bidirectional. When S2 is LOW, port A drives DQA0-DQA3 with read data from the selected register file (output mode). When S2 is HIGH, port A accepts data from the DQA bus and writes it into the selected file (input mode). S3 controls port B identically.',
          'When both ports simultaneously try to write to the same register file, the B-input port takes priority to prevent data conflicts.',
        ],
        list: [
          'S0=L → port A accesses file 1 (uses 1A0 1A3); S0=H → port A accesses file 2 (uses 2A0 2A3).',
          'S1=L → port B accesses file 1; S1=H → port B accesses file 2.',
          'S2=L → port A outputs (read mode); S2=H → port A inputs (write mode).',
          'S3=L → port B outputs (read mode); S3=H → port B inputs (write mode).',
          '1W active LOW enables writes to file 1; 2W active LOW enables writes to file 2.',
        ],
        note: 'The simulator models both files, both ports, the direction and file-select controls, and B-port write priority. Write timing (setup, hold, and the write pulse width) is not modeled: a write happens whenever the file write enable is LOW.',
      },
    ],
    pinout: [
      { pin:  1, name: 'S0',   type: 'input' },
      { pin:  2, name: '1A0',  type: 'input' },
      { pin:  3, name: '1A1',  type: 'input' },
      { pin:  4, name: '1A2',  type: 'input' },
      { pin:  5, name: '1A3',  type: 'input' },
      { pin:  6, name: '1W',   type: 'input' },
      { pin:  7, name: 'S2',   type: 'input' },
      { pin:  8, name: 'DQA0', type: 'bidir' },
      { pin:  9, name: 'DQA1', type: 'bidir' },
      { pin: 10, name: 'DQA2', type: 'bidir' },
      { pin: 11, name: 'DQA3', type: 'bidir' },
      { pin: 12, name: 'GND',  type: 'power' },
      { pin: 13, name: 'DQB0', type: 'bidir' },
      { pin: 14, name: 'DQB1', type: 'bidir' },
      { pin: 15, name: 'DQB2', type: 'bidir' },
      { pin: 16, name: 'DQB3', type: 'bidir' },
      { pin: 17, name: 'S3',   type: 'input' },
      { pin: 18, name: '2W',   type: 'input' },
      { pin: 19, name: '2A0',  type: 'input' },
      { pin: 20, name: '2A1',  type: 'input' },
      { pin: 21, name: '2A2',  type: 'input' },
      { pin: 22, name: '2A3',  type: 'input' },
      { pin: 23, name: 'S1',   type: 'input' },
      { pin: 24, name: 'VCC',  type: 'power' },
    ],
    gates: [
      { type: 'REG_FILE_DUAL16X4_TRI',
        inputs: ['S0','S1','S2','S3','1W','2W',
                 '1A0','1A1','1A2','1A3','2A0','2A1','2A2','2A3',
                 'DQA0','DQA1','DQA2','DQA3','DQB0','DQB1','DQB2','DQB3'],
        outputs: ['DQA0','DQA1','DQA2','DQA3','DQB0','DQB1','DQB2','DQB3'] },
    ],
  },
  // 74873: Dual 4 bit transparent latch w/ clear, TRI (24-pin)
  // Source: Texas Instruments, "SN54ALS873B, SN54AS873A, SN74ALS873B,
  //   SN74AS873A Dual 4-Bit D-Type Latches With 3-State Outputs", SDAS036D
  //   (April 1982, revised August 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als873b.pdf. Verified: DW/NT
  //   package terminal assignment (top view) + FUNCTION TABLE (each latch),
  //   page 1, read as 300-dpi PDF page images. The pre-existing stub pinout was
  //   hand-entered and WRONG (invented an OE/CLR/LE-D-Q interleave); corrected
  //   here to the datasheet map: 1CLR=1, 1OE=2, 1D1-1D4=3-6, 2D1-2D4=7-10,
  //   2OE=11, GND=12, 2CLR=13, 2LE=14, 2Q4-2Q1=15-18, 1Q4-1Q1=19-22, 1LE=23,
  //   VCC=24. Behavior (each latch): OE̅ HIGH -> Q high-impedance; else CLR̅ LOW
  //   -> Q=0 (independent of LE, per the description "the Q outputs go low
  //   independently of LE"); else LE HIGH -> transparent (Q follows D); else
  //   hold. Engine: new LATCH_4BIT_TRI_873 primitive (active-LOW OE and CLR),
  //   the active-low-control sibling of the CD4508 LATCH_4BIT_TRI_RST.
  '74x873': {
    name: '74x873',
    simpleName: 'Dual 4 bit Transparent Latch w/ Clear (TRI)',
    description: 'Dual 4 bit transparent latch with clear and three state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als873b.pdf',
    tags: ['latch', 'dual', '4 bit', 'transparent', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x873 contains two independent 4 bit transparent latch sections with 3-state outputs. A transparent latch is a small storage element that can either pass input data straight through or hold the last value, making it useful between combinational stages or on shared buses. On a breadboard this part is handy when you want nibble wide storage, independent bus isolation, and separate control over two 4 bit paths in one package.',
    guidePinDescriptions: {
      '1CLRn': 'Active LOW clear for section 1. Pull LOW to force 1Q1-1Q4 to 0; this overrides the latch enable. Tie HIGH when clear is not being used.',
      '1OEn': 'Active LOW output enable for section 1. Pull LOW to drive 1Q1-1Q4 onto the bus, or HIGH to place those outputs in high impedance.',
      '1D1': 'Section 1 data input bit 1.',
      '1D2': 'Section 1 data input bit 2.',
      '1D3': 'Section 1 data input bit 3.',
      '1D4': 'Section 1 data input bit 4.',
      '1LE': 'Latch enable for section 1. HIGH makes the section transparent so 1Q follows 1D; LOW holds the last value.',
      '1Q1': 'Section 1 latched output bit 1.',
      '1Q2': 'Section 1 latched output bit 2.',
      '1Q3': 'Section 1 latched output bit 3.',
      '1Q4': 'Section 1 latched output bit 4.',
      '2CLRn': 'Active LOW clear for section 2. Pull LOW to force 2Q1-2Q4 to 0; overrides the latch enable. Tie HIGH when unused.',
      '2OEn': 'Active LOW output enable for section 2. Pull LOW to drive 2Q1-2Q4, or HIGH to place those outputs in high impedance.',
      '2D1': 'Section 2 data input bit 1.',
      '2D2': 'Section 2 data input bit 2.',
      '2D3': 'Section 2 data input bit 3.',
      '2D4': 'Section 2 data input bit 4.',
      '2LE': 'Latch enable for section 2. HIGH makes the section transparent so 2Q follows 2D; LOW holds the last value.',
      '2Q1': 'Section 2 latched output bit 1.',
      '2Q2': 'Section 2 latched output bit 2.',
      '2Q3': 'Section 2 latched output bit 3.',
      '2Q4': 'Section 2 latched output bit 4.',
      'GND': 'Ground reference for the device at pin 12.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'How Transparent Latches Work',
        paragraphs: [
          'A transparent latch is level sensitive storage. While its latch enable control is HIGH, the output follows the input; when the control is LOW, the last input value is held.',
          'That makes latches useful for short term buffering, time separation between logic stages, or capturing a nibble before another circuit reads it.',
        ],
      },
      {
        title: 'Clear and Output Enable',
        paragraphs: [
          'Each section has an active LOW clear that forces its four outputs to 0. Clear takes priority over the latch enable, so a nibble can be wiped whether the latch is transparent or holding.',
          'The active LOW output enable is separate from storage. Pull it HIGH and the four outputs go to high impedance, disconnecting the nibble from a shared bus while the latch keeps its stored value.',
        ],
      },
      {
        title: 'Two Independent 4 bit Sections',
        paragraphs: [
          'The 74x873 gives you two separate 4 bit latches, so one package can handle a full byte as two nibbles or two unrelated control/data paths. Separate clear and output-enable pins let each half be managed independently.',
        ],
        list: [
          'Latch one nibble while the other nibble keeps updating.',
          'Isolate stored values from a shared bus until output enable is asserted.',
          'Build wider byte registers by treating the two sections as upper and lower nibbles.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1CLRn', type: 'input'  },
      { pin:  2, name: '1OEn',  type: 'input'  },
      { pin:  3, name: '1D1',   type: 'input'  },
      { pin:  4, name: '1D2',   type: 'input'  },
      { pin:  5, name: '1D3',   type: 'input'  },
      { pin:  6, name: '1D4',   type: 'input'  },
      { pin:  7, name: '2D1',   type: 'input'  },
      { pin:  8, name: '2D2',   type: 'input'  },
      { pin:  9, name: '2D3',   type: 'input'  },
      { pin: 10, name: '2D4',   type: 'input'  },
      { pin: 11, name: '2OEn',  type: 'input'  },
      { pin: 12, name: 'GND',   type: 'power'  },
      { pin: 13, name: '2CLRn', type: 'input'  },
      { pin: 14, name: '2LE',   type: 'input'  },
      { pin: 15, name: '2Q4',   type: 'output' },
      { pin: 16, name: '2Q3',   type: 'output' },
      { pin: 17, name: '2Q2',   type: 'output' },
      { pin: 18, name: '2Q1',   type: 'output' },
      { pin: 19, name: '1Q4',   type: 'output' },
      { pin: 20, name: '1Q3',   type: 'output' },
      { pin: 21, name: '1Q2',   type: 'output' },
      { pin: 22, name: '1Q1',   type: 'output' },
      { pin: 23, name: '1LE',   type: 'input'  },
      { pin: 24, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'LATCH_4BIT_TRI_873', inputs: ['1D1','1D2','1D3','1D4','1LE','1OEn','1CLRn'], outputs: ['1Q1','1Q2','1Q3','1Q4'] },
      { type: 'LATCH_4BIT_TRI_873', inputs: ['2D1','2D2','2D3','2D4','2LE','2OEn','2CLRn'], outputs: ['2Q1','2Q2','2Q3','2Q4'] },
    ],
  },
  // 74874: Dual 4 bit D-FF w/ clear, TRI (24-pin)
  // Source: Texas Instruments, "SN54ALS874B, SN74ALS874B, SN74ALS876A,
  //   SN74AS874, SN74AS876 Dual 4-Bit D-Type Edge-Triggered Flip-Flops",
  //   SDAS061C (April 1982, revised January 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als874b.pdf. Verified: DW/JT/NT
  //   24-pin terminal assignment (page 1) and the '874 function table (page 2),
  //   read as PDF page images. The hand-entered stub pinout was wrong (it had
  //   1OE/1CLR/1CLK on pins 1-3); corrected to the datasheet: pin 1 = 1CLR,
  //   pin 2 = 1OE, pins 3-6 = 1D1-1D4, pins 7-10 = 2D1-2D4, pin 11 = 2OE,
  //   pin 13 = 2CLR, pin 14 = 2CLK, pins 15-18 = 2Q4-2Q1, pins 19-22 = 1Q4-1Q1,
  //   pin 23 = 1CLK. Behavior: each bank is a positive-edge-triggered 4-bit D
  //   register with asynchronous active-LOW clear (dominates the clock) and an
  //   active-LOW 3-state output enable (see D_FF_REG_TRI_CLR primitive).
  '74x874': {
    name: '74x874',
    simpleName: 'Dual 4 bit D-FF w/ Clear (TRI)',
    description: 'Dual 4-bit edge-triggered D flip-flops, clear, 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als874b.pdf',
    tags: ['flip flop', 'D type', 'dual', '4 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x874 contains two independent 4 bit edge triggered D type register sections with 3-state outputs. Unlike a transparent latch, a D flip flop captures data only on a clock event and then holds it steady until the next clock or a clear operation. On a breadboard it is useful for building byte registers, separating combinational stages with a clock boundary, or placing registered values onto a bus only when enabled.',
    guidePinDescriptions: {
      'OE1n': 'Active LOW output enable for section 1. Pull LOW to drive Q10-Q13, or HIGH to disconnect that nibble from the bus.',
      'CLR1n': 'Active LOW clear for section 1. Pull LOW to reset the stored nibble; tie HIGH when clear is not needed.',
      'CLK1': 'Clock input for section 1. A clock event captures D10-D13 into the first 4 bit register.',
      'D10': 'Section 1 data input bit 0.',
      'D11': 'Section 1 data input bit 1.',
      'D12': 'Section 1 data input bit 2.',
      'D13': 'Section 1 data input bit 3.',
      'Q10': 'Section 1 registered output bit 0.',
      'Q11': 'Section 1 registered output bit 1.',
      'Q12': 'Section 1 registered output bit 2.',
      'Q13': 'Section 1 registered output bit 3.',
      'GND': 'Ground reference for the device at pin 12.',
      'Q23': 'Section 2 registered output bit 3.',
      'Q22': 'Section 2 registered output bit 2.',
      'Q21': 'Section 2 registered output bit 1.',
      'Q20': 'Section 2 registered output bit 0.',
      'D23': 'Section 2 data input bit 3.',
      'D22': 'Section 2 data input bit 2.',
      'D21': 'Section 2 data input bit 1.',
      'D20': 'Section 2 data input bit 0.',
      'CLK2': 'Clock input for section 2.',
      'CLR2n': 'Active LOW clear for section 2. Pull LOW to reset that nibble; tie HIGH when unused.',
      'OE2n': 'Active LOW output enable for section 2.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'Edge Triggered Storage',
        paragraphs: [
          'A D flip flop samples its input only at a clock transition, then holds that sampled value until the next valid clock event. This is the basic storage element used in synchronous state machines, counters, and pipeline stages.',
          'Compared with a latch, the flip flop is easier to reason about in clocked systems because its outputs do not keep following the input while the control signal is active.',
        ],
      },
      {
        title: 'Nibble Wide Bus Registers',
        paragraphs: [
          'The two 4 bit sections make it easy to register upper and lower nibbles separately or combine them into one byte wide register. Separate output enables let you keep the stored value internal until the bus is ready to read it.',
        ],
        list: [
          'Build an 8 bit register from two independently clocked nibbles.',
          'Capture control values on a clock edge before presenting them to a backplane.',
          'Use clear inputs to force a known startup state.',
        ],
        note: 'Clear is asynchronous: pulling CLRn LOW forces that section to zero immediately, without waiting for a clock edge.',
      },
    ],
    pinout: [
      { pin:  1, name: 'CLR1n',type: 'input'  },
      { pin:  2, name: 'OE1n', type: 'input'  },
      { pin:  3, name: 'D10',  type: 'input'  },
      { pin:  4, name: 'D11',  type: 'input'  },
      { pin:  5, name: 'D12',  type: 'input'  },
      { pin:  6, name: 'D13',  type: 'input'  },
      { pin:  7, name: 'D20',  type: 'input'  },
      { pin:  8, name: 'D21',  type: 'input'  },
      { pin:  9, name: 'D22',  type: 'input'  },
      { pin: 10, name: 'D23',  type: 'input'  },
      { pin: 11, name: 'OE2n', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'CLR2n',type: 'input'  },
      { pin: 14, name: 'CLK2', type: 'input'  },
      { pin: 15, name: 'Q23',  type: 'output' },
      { pin: 16, name: 'Q22',  type: 'output' },
      { pin: 17, name: 'Q21',  type: 'output' },
      { pin: 18, name: 'Q20',  type: 'output' },
      { pin: 19, name: 'Q13',  type: 'output' },
      { pin: 20, name: 'Q12',  type: 'output' },
      { pin: 21, name: 'Q11',  type: 'output' },
      { pin: 22, name: 'Q10',  type: 'output' },
      { pin: 23, name: 'CLK1', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // Each bank: D_FF_REG_TRI_CLR inputs = [D0..D3, CLK, CLRn, OEn].
      { type: 'D_FF_REG_TRI_CLR', inputs: ['D10','D11','D12','D13','CLK1','CLR1n','OE1n'], outputs: ['Q10','Q11','Q12','Q13'] },
      { type: 'D_FF_REG_TRI_CLR', inputs: ['D20','D21','D22','D23','CLK2','CLR2n','OE2n'], outputs: ['Q20','Q21','Q22','Q23'] },
    ],
  },
  // 74x876: Dual 4-bit D-type edge-triggered flip-flop, async preset, inverting 3-state (24-pin)
  // Source: Texas Instruments, "SN54ALS874B, SN74ALS874B, SN74ALS876A, SN74AS874,
  //   SN74AS876 Dual 4-Bit D-Type Edge-Triggered Flip-Flops", SDAS061C (Apr 1982,
  //   rev. Jan 1995). [Online]. Available: https://www.ti.com/lit/pdf/sdas061.
  //   Verified: terminal assignment (SN74ALS876A/SN74AS876 DW/NT package, top view),
  //   Function Table, and logic diagram, pages 1-2, read as PDF page images (issues.md
  //   C4). The '876 is the INVERTING / PRESET member of the family; the '874 sibling is
  //   true-output / CLEAR.
  // NOTE: the original stub pinout was wrong end-to-end (it invented an
  //   OE/SET/CLK/D0-3/Q order). The real part is bus-structured: pin 1 1PRE, pin 2 1OE,
  //   the eight D inputs on pins 3-10, 2OE/2PRE/2CLK on 11/13/14, the eight Q̄ outputs on
  //   pins 15-22, 1CLK on 23. Corrected from the SDAS061C terminal diagram, not cloned
  //   from the '874 (the CD4082 lesson, issues.md C2).
  '74x876': {
    name: '74x876',
    simpleName: 'Dual 4 bit D-FF w/ Set, Inv Out (TRI)',
    description: 'Dual 4-bit edge-triggered D flip-flops, preset, inverting 3-state (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/pdf/sdas061',
    tags: ['flip flop', 'D type', 'dual', '4 bit', 'preset', 'inverting', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x876 holds two independent 4 bit banks of positive edge triggered D flip flops. Each bank has its own clock (CLK), output enable (OEn), and preset (PREn). On the rising edge of CLK the four D inputs of that bank are captured. The outputs are inverting: the pin drives the opposite of the stored bit, so storing a 1 puts a LOW on the output. Preset is asynchronous and active LOW: pulling PREn LOW forces that bank to a stored 1 immediately, driving all four of its outputs LOW without waiting for a clock edge. The outputs are three state. When OEn (active LOW) is HIGH the outputs go high impedance and drop off the bus, but the stored bits are unchanged; pull OEn LOW to drive them again. The inverting bus outputs suit systems that read on an active LOW data bus.',
    guideSections: [
      {
        title: 'Nibble Wide Bus Registers',
        paragraphs: [
          'The two 4 bit sections let you register an upper and a lower nibble separately or clock them together as one byte wide register. Separate output enables keep each stored value internal until the bus is ready to read it.',
        ],
        list: [
          'Build an 8 bit register from two independently clocked nibbles.',
          'Capture control values on a clock edge before presenting them to a backplane.',
          'Use preset to force a bank to all ones, which drives all four outputs LOW, at startup.',
        ],
        note: 'The outputs are inverting: a stored 1 reads as a LOW on the pin. Preset is asynchronous, so PREn LOW acts immediately, ignoring the clock.',
      },
    ],
    pinout: [
      { pin:  1, name: 'PRE1n',type: 'input'  },
      { pin:  2, name: 'OE1n', type: 'input'  },
      { pin:  3, name: 'D10',  type: 'input'  },
      { pin:  4, name: 'D11',  type: 'input'  },
      { pin:  5, name: 'D12',  type: 'input'  },
      { pin:  6, name: 'D13',  type: 'input'  },
      { pin:  7, name: 'D20',  type: 'input'  },
      { pin:  8, name: 'D21',  type: 'input'  },
      { pin:  9, name: 'D22',  type: 'input'  },
      { pin: 10, name: 'D23',  type: 'input'  },
      { pin: 11, name: 'OE2n', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'PRE2n',type: 'input'  },
      { pin: 14, name: 'CLK2', type: 'input'  },
      { pin: 15, name: 'Q23n', type: 'output' },
      { pin: 16, name: 'Q22n', type: 'output' },
      { pin: 17, name: 'Q21n', type: 'output' },
      { pin: 18, name: 'Q20n', type: 'output' },
      { pin: 19, name: 'Q13n', type: 'output' },
      { pin: 20, name: 'Q12n', type: 'output' },
      { pin: 21, name: 'Q11n', type: 'output' },
      { pin: 22, name: 'Q10n', type: 'output' },
      { pin: 23, name: 'CLK1', type: 'input'  },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // Each bank: D_FF_REG_TRI_SET_INV inputs = [D0..D3, CLK, PREn, OEn].
      { type: 'D_FF_REG_TRI_SET_INV', inputs: ['D10','D11','D12','D13','CLK1','PRE1n','OE1n'], outputs: ['Q10n','Q11n','Q12n','Q13n'] },
      { type: 'D_FF_REG_TRI_SET_INV', inputs: ['D20','D21','D22','D23','CLK2','PRE2n','OE2n'], outputs: ['Q20n','Q21n','Q22n','Q23n'] },
    ],
  },

};