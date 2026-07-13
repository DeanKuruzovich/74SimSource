// Chip definitions block 46
// Chips: 74978, 74989-74996, 74x1000/1002-1005/1008, 74ALS1010

export const CHIPS_BLOCK_46 = {

  // 74978: Octal flip flop with serial scanner (24-pin)
  //
  // LEFT AS A STUB ON PURPOSE — no datasheet exists to verify this part.
  // A "serial scanner" octal register (parallel D storage + a serial scan read-
  // out, as in board-level test / boundary-scan chains) IS in principle
  // simulatable. The blocker is twofold and unresolvable from available sources:
  //   1. No datasheet. A June/July 2026 search found nothing for a "74978" octal
  //      FF w/ serial scanner under any prefix (74/74LS/74ALS/74AS/74S/74F/74HC),
  //      any manufacturer. TI's cdXXXX/sn74alsXXX/sn74asXXX symlink URLs all 404
  //      (sn74als978, sn74as978, sn74ls978, sn74s978). The part is absent from
  //      Wikipedia's authoritative "List of 7400-series integrated circuits" (its
  //      table doesn't even reach the 900s) and from the amigawiki 74xx functional
  //      index (which stops at 925 / 9323). alldatasheet's only "74978" hit is an
  //      unrelated internal document-index id (Microchip PIC parts), not a part
  //      number. The 74x989–996 siblings in this block ARE real TI SN74ALS read-
  //      back latches with live datasheets; 978 is not among them.
  //   2. The hand-entered stub pinout is unverifiable AND functionally incomplete:
  //      a serial scan read-out needs at minimum a scan clock (and usually a scan-
  //      data-in for cascading), but the entry exposes only SEN + SO. There is no
  //      way to derive a scan sequence, or trust CLK/D0–D7/Q0–Q7/OEn/SEN/SO pin
  //      assignments, without fabricating both the pinout and the function table.
  // Per issues.md C2 (the CD4082 lesson — never trust a hand-entered or sibling
  // pinout) and the hard-tail stub policy, shipping a placeable chip on an invented
  // pinout a student might wire on a real breadboard is worse than a clearly
  // labelled info-sheet stub. So it stays GENERIC_STUB / tags:['stub'].
  // Same situation and resolution as issues.md C28 (74x406), C29 (74x1280),
  // C30 (74x803): undocumented / non-existent part numbers left as stubs.
  //
  // Sources consulted (all negative — see issues.md C84):
  // Texas Instruments, datasheet symlink probes sn74als978/sn74as978/sn74ls978/
  //   sn74s978 (https://www.ti.com/lit/ds/symlink/<part>.pdf) — all HTTP 404,
  //   verified 2026-07-01.
  // Wikipedia, "List of 7400-series integrated circuits."
  //   [Online]. https://en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits
  //   Verified: no 978/979 entry; table does not reach the 900s.
  // amigaWiki, "74xx series" functional index (PDF).
  //   [Online]. https://www.amigawiki.org/lib/exe/fetch.php?media=de:parts:74xx_series.pdf
  //   Verified as extracted text: highest entries 925, then 9114/9115/9323 — no 978.
  '74x978': {
    name: '74x978',
    simpleName: 'Octal FF with Serial Scanner',
    description: 'Octal flip flop with serial scanner (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['flip flop', 'octal', 'scanner', 'stub'],
    sequential: true,
    guideOverview: 'The 74x978 is an octal D type flip flop that adds a serial scanner output, useful in board level testing. Eight data inputs load into eight flip flops on a clock edge. When the scan enable (SEN) is asserted, the stored bits can be read out through the serial output (SO) without disturbing the parallel outputs. On a breadboard it is most useful for applications that need both normal parallel storage and a way to inspect the stored byte bit by bit. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'CLK',  type: 'input'  },
      { pin:  2, name: 'D0',   type: 'input'  },
      { pin:  3, name: 'D1',   type: 'input'  },
      { pin:  4, name: 'D2',   type: 'input'  },
      { pin:  5, name: 'D3',   type: 'input'  },
      { pin:  6, name: 'D4',   type: 'input'  },
      { pin:  7, name: 'D5',   type: 'input'  },
      { pin:  8, name: 'D6',   type: 'input'  },
      { pin:  9, name: 'D7',   type: 'input'  },
      { pin: 10, name: 'OEn',  type: 'input'  },
      { pin: 11, name: 'SO',   type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'SEN',  type: 'input'  },
      { pin: 14, name: 'Q0',   type: 'output' },
      { pin: 15, name: 'Q1',   type: 'output' },
      { pin: 16, name: 'Q2',   type: 'output' },
      { pin: 17, name: 'Q3',   type: 'output' },
      { pin: 18, name: 'Q4',   type: 'output' },
      { pin: 19, name: 'Q5',   type: 'output' },
      { pin: 20, name: 'Q6',   type: 'output' },
      { pin: 21, name: 'Q7',   type: 'output' },
      { pin: 22, name: 'NC',   type: 'nc'     },
      { pin: 23, name: 'NC2',  type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['CLK','D0','D1','D2','D3','D4','D5','D6','D7','OEn','SEN'], outputs: ['SO','Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7'] },
    ],
  },

  // 74989: 64 bit RAM (16x4), inverting output, three state (16-pin)
  '74x989': {
    name: '74x989',
    simpleName: '64 bit RAM 16x4 Inv (TRI)',
    description: '64-bit RAM, 16 words x 4 bits, inverting 3-state outputs (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: '',
    tags: ['ram', 'memory', '64 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x989 is a 64 bit static RAM organized as 16 words of 4 bits each, with inverting three state outputs. Writing stores a 4 bit nibble at the selected address, and reading retrieves the complement of the stored value. On a breadboard it is useful as a small look up table or as temporary storage for 4 bit values in a data path. The simulator currently represents this as a generic stub.',
    pinout: [
      { pin:  1, name: 'A0',   type: 'input'  },
      { pin:  2, name: 'A1',   type: 'input'  },
      { pin:  3, name: 'A2',   type: 'input'  },
      { pin:  4, name: 'A3',   type: 'input'  },
      { pin:  5, name: 'WEn',  type: 'input'  },
      { pin:  6, name: 'OEn',  type: 'input'  },
      { pin:  7, name: 'CSn',  type: 'input'  },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'D0',   type: 'bidir'  },
      { pin: 10, name: 'D1',   type: 'bidir'  },
      { pin: 11, name: 'D2',   type: 'bidir'  },
      { pin: 12, name: 'D3',   type: 'bidir'  },
      { pin: 13, name: 'NC',   type: 'nc'     },
      { pin: 14, name: 'NC2',  type: 'nc'     },
      { pin: 15, name: 'NC3',  type: 'nc'     },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','WEn','OEn','CSn'], outputs: [] },
    ],
  },

  // 74990: 8 bit D type transparent read-back latch, non inverting, TRI (20-pin)
  //
  // Source: Texas Instruments, "SN74ALS990 8-Bit D-Type Transparent Read-Back
  //   Latch", SDAS027B (Apr. 1984, rev. Jan. 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als990.pdf. Verified: terminal
  //   assignment (DW/N package top view), description, logic diagram and timing
  //   diagram, pages 1-2, read as 200-dpi rendered PDF page images (issues.md
  //   C4). Pinout confirmed against the datasheet, not cloned from a sibling
  //   (issues.md C2): OERB=1, 1D..8D=2..9, GND=10, LE=11, 8Q..1Q=12..19, VCC=20.
  //   D0=1D (LSB, pin 2) .. D7=8D (pin 9); Q0=1Q (pin 19) .. Q7=8Q (pin 12).
  // Behavioral model: the 1Q..8Q pins are TRUE LOGIC outputs (always driven,
  //   never 3-stated) that follow D while LE is HIGH and hold when LE is LOW.
  //   Read-back is the special feature: the D pins are a 3-state I/O bus. OERB
  //   (active LOW) drives the stored byte back onto the D pins; OERB HIGH
  //   releases them so they act as ordinary inputs. Per the datasheet, OERB does
  //   not gate the Q outputs and does not disturb the stored data. The original
  //   stub mislabeled pin 1 as a Q output-enable ("OEn"); corrected here to OERB
  //   and the D pins to bidirectional. Runs the READBACK_LATCH primitive
  //   (js/specificChipsSim.js), the 74x870 bidirectional-pin pattern.
  '74x990': {
    name: '74x990',
    simpleName: '8 bit Transparent Latch Read-Back (TRI)',
    description: '8-bit D transparent read-back latch, non-inverting, 3-state bus (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als990.pdf',
    tags: ['latch', '8 bit', 'tri state', 'read-back'],
    sequential: true,
    guideOverview: 'The 74x990 is an 8 bit transparent D type latch with a read-back feature. While the latch enable (LE) input is HIGH the outputs Q0-Q7 follow the data inputs D0-D7; when LE goes LOW the latch holds the last byte. The Q outputs are always driven. What makes this part unusual is the D pins: they double as an input/output bus. Pull OERB (active LOW) LOW and the stored byte is driven back out onto the same D pins it came in on, so a controller can read back what it earlier wrote without a separate output port. On a breadboard it works as a byte wide holding register whose stored value can be inspected on the input bus.',
    guidePinDescriptions: {
      'OERB': 'Read-back enable, active LOW. Pull LOW to drive the stored byte back onto the D0-D7 pins. HIGH releases those pins so they act as ordinary data inputs. Does not affect the Q outputs.',
      'D0': 'Data bit 0. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'D1': 'Data bit 1. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'D2': 'Data bit 2. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'D3': 'Data bit 3. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'D4': 'Data bit 4. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'D5': 'Data bit 5. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'D6': 'Data bit 6. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'D7': 'Data bit 7. Input while OERB is HIGH; driven with the stored bit while OERB is LOW.',
      'GND': 'Ground reference for the device at pin 10.',
      'LE': 'Latch enable. HIGH makes the latch transparent (Q follows D). LOW holds the last byte.',
      'Q7': 'Stored output bit 7.',
      'Q6': 'Stored output bit 6.',
      'Q5': 'Stored output bit 5.',
      'Q4': 'Stored output bit 4.',
      'Q3': 'Stored output bit 3.',
      'Q2': 'Stored output bit 2.',
      'Q1': 'Stored output bit 1.',
      'Q0': 'Stored output bit 0.',
      'VCC': 'Positive 5 V supply at pin 20.',
    },
    guideSections: [
      {
        title: 'Transparent latching',
        paragraphs: [
          'While LE is HIGH the latch is transparent: each Q output tracks its D input. When LE goes LOW the latch freezes the byte present at that moment and holds it. The Q outputs stay driven the whole time.',
          'That makes the 74x990 a byte wide holding register between logic stages, with no clock edge needed.',
        ],
      },
      {
        title: 'Read-back',
        paragraphs: [
          'The D pins do double duty. Normally they are inputs. Pull OERB LOW and the latch drives the stored byte back out onto those same D pins, so whatever loaded the byte can read it back on the bus it wrote to. Pull OERB HIGH and the D pins go back to being inputs.',
          'Because both directions share one set of pins, only one side should drive at a time. Read back with LE LOW (holding) so the stored byte cannot change while it is presented, and keep anything else off the D bus during the read.',
        ],
        list: [
          'Capture a byte from a bus while LE is HIGH, then hold it with LE LOW.',
          'Read the held byte back onto the same bus by pulling OERB LOW.',
          'Keep the D bus quiet during read-back so the two directions do not collide.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OERB', type: 'input'  },
      { pin:  2, name: 'D0',   type: 'bidir'  },
      { pin:  3, name: 'D1',   type: 'bidir'  },
      { pin:  4, name: 'D2',   type: 'bidir'  },
      { pin:  5, name: 'D3',   type: 'bidir'  },
      { pin:  6, name: 'D4',   type: 'bidir'  },
      { pin:  7, name: 'D5',   type: 'bidir'  },
      { pin:  8, name: 'D6',   type: 'bidir'  },
      { pin:  9, name: 'D7',   type: 'bidir'  },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'LE',   type: 'input'  },
      { pin: 12, name: 'Q7',   type: 'output' },
      { pin: 13, name: 'Q6',   type: 'output' },
      { pin: 14, name: 'Q5',   type: 'output' },
      { pin: 15, name: 'Q4',   type: 'output' },
      { pin: 16, name: 'Q3',   type: 'output' },
      { pin: 17, name: 'Q2',   type: 'output' },
      { pin: 18, name: 'Q1',   type: 'output' },
      { pin: 19, name: 'Q0',   type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'READBACK_LATCH',
        inputs:  ['D0','D1','D2','D3','D4','D5','D6','D7','LE','OERB'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7',
                  'D0','D1','D2','D3','D4','D5','D6','D7'] },
    ],
  },

  // 74991: 8 bit D type transparent read-back latch, inverting, TRI (20-pin)
  //
  // Sources (read as PDF page images per issues.md C4 — the WebFetch text
  // summarizer hallucinates TI pinouts; the sn74als991 symlink itself 404s):
  //   [1] Texas Instruments, "SN74ALS990 8-Bit D-Type Transparent Read-Back Latch",
  //       SDAS027B (Apr 1984, rev. Jan 1995). [Online]. Available:
  //       https://www.ti.com/lit/ds/symlink/sn74als990.pdf. Verified: 20-pin
  //       terminal assignment (OERB=1, 1D-8D=2-9, GND=10, LE=11, 8Q-1Q=12-19,
  //       VCC=20), description, logic/timing diagrams, pages 1-2. The '991 is the
  //       inverting twin of the '990 (same 20-pin package, same read-back path).
  //   [2] Texas Instruments, "SN74ALS992 9-Bit D-Type Transparent Read-Back Latch
  //       With 3-State Outputs", SDAS028B (Apr 1984, rev. Jan 1995). [Online].
  //       Available: https://www.ti.com/lit/ds/symlink/sn74als992.pdf. Verified:
  //       read-back semantics + the OEQ distinction, pages 1-2 — confirms the
  //       20-pin '990/'991 have NO output-enable on Q (Q always driven); only the
  //       >=24-pin members ('992+) add a separate OEQ that 3-states the Q outputs.
  //   [3] Wikipedia contributors, "List of 7400-series integrated circuits."
  //       [Online]. Available:
  //       https://en.wikipedia.org/wiki/List_of_7400-series_integrated_circuits.
  //       Verified: the 74x991-specific facts — 8-bit, INVERTING, three-state,
  //       20 pins (row 74991, citing the TI databook). Used because the '991's own
  //       TI datasheet is not retrievable (symlink 404; the bitsavers databook
  //       identifier redirects to an unrelated document).
  // Traceability: pin frame + read-back behavior -> [1]; Q-always-driven (no OEQ on
  // the 20-pin part) -> [1]+[2]; inverting outputs / 8-bit / 20-pin -> [3].
  // Read-back polarity: read-back returns the TRUE stored byte (what was written);
  // only Q is inverted — inferred from the [1]/[2] read-back definition, since the
  // '991-specific function table was unobtainable.
  '74x991': {
    name: '74x991',
    simpleName: '8 bit Transparent Latch Read-Back Inv (TRI)',
    description: '8-bit D transparent read-back latch, inverting, 3-state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als990.pdf',
    tags: ['latch', '8 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x991 is an 8-bit transparent D-type latch with a read-back path. While latch-enable (LE) is HIGH the outputs follow the data inputs; drop LE LOW and the last byte is held. The eight Q outputs present the complement of the stored value (inverting) and are always driven. What sets a read-back latch apart is OERB: pull it LOW and the stored byte is pushed back out onto the same D pins it came in on, so whatever wrote the byte can re-read it without a separate return path. Pull OERB HIGH and those D pins are just inputs again. The 74x990 is the non-inverting version of the same part.',
    guidePinDescriptions: {
      'OERB': 'Read-back output enable (active LOW). LOW drives the stored byte back onto the D pins; HIGH leaves the D pins as ordinary inputs.',
      'D0': 'Data input bit 0. Also carries the stored byte back out when OERB is LOW.',
      'D1': 'Data input bit 1. Also carries the stored byte back out when OERB is LOW.',
      'D2': 'Data input bit 2. Also carries the stored byte back out when OERB is LOW.',
      'D3': 'Data input bit 3. Also carries the stored byte back out when OERB is LOW.',
      'D4': 'Data input bit 4. Also carries the stored byte back out when OERB is LOW.',
      'D5': 'Data input bit 5. Also carries the stored byte back out when OERB is LOW.',
      'D6': 'Data input bit 6. Also carries the stored byte back out when OERB is LOW.',
      'D7': 'Data input bit 7. Also carries the stored byte back out when OERB is LOW.',
      'GND': 'Ground reference for the device at pin 10.',
      'LE': 'Latch enable. HIGH makes the latch transparent (outputs follow the inputs); LOW holds the stored byte.',
      'Q7n': 'Inverted stored output bit 7 — the complement of the latched data. Always driven.',
      'Q6n': 'Inverted stored output bit 6 — the complement of the latched data. Always driven.',
      'Q5n': 'Inverted stored output bit 5 — the complement of the latched data. Always driven.',
      'Q4n': 'Inverted stored output bit 4 — the complement of the latched data. Always driven.',
      'Q3n': 'Inverted stored output bit 3 — the complement of the latched data. Always driven.',
      'Q2n': 'Inverted stored output bit 2 — the complement of the latched data. Always driven.',
      'Q1n': 'Inverted stored output bit 1 — the complement of the latched data. Always driven.',
      'Q0n': 'Inverted stored output bit 0 — the complement of the latched data. Always driven.',
      'VCC': 'Positive 5 V supply at pin 20.',
    },
    guideSections: [
      {
        title: 'What Read-Back Buys You',
        paragraphs: [
          'A plain latch only sends data one way: in on D, out on Q. A read-back latch adds a path in the other direction. With OERB LOW the stored byte drives back onto the D pins, so whatever wrote the byte can read it back over the same wires.',
          'Hold an external driver and OERB active at once and the two fight over the bus. Assert OERB only after the writing device has let go of the D pins — the same rule the datasheet gives for the real part.',
        ],
      },
      {
        title: 'Inverting Outputs',
        paragraphs: [
          'The Q outputs are the complement of the stored byte: store 0x0F and the outputs read 0xF0. That is handy when the next stage wants an active LOW byte. The read-back path is separate and returns the true stored byte, so you always read back exactly what you wrote.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OERB',  type: 'input'  },
      { pin:  2, name: 'D0',    type: 'io'     },
      { pin:  3, name: 'D1',    type: 'io'     },
      { pin:  4, name: 'D2',    type: 'io'     },
      { pin:  5, name: 'D3',    type: 'io'     },
      { pin:  6, name: 'D4',    type: 'io'     },
      { pin:  7, name: 'D5',    type: 'io'     },
      { pin:  8, name: 'D6',    type: 'io'     },
      { pin:  9, name: 'D7',    type: 'io'     },
      { pin: 10, name: 'GND',   type: 'power'  },
      { pin: 11, name: 'LE',    type: 'input'  },
      { pin: 12, name: 'Q7n',   type: 'output' },
      { pin: 13, name: 'Q6n',   type: 'output' },
      { pin: 14, name: 'Q5n',   type: 'output' },
      { pin: 15, name: 'Q4n',   type: 'output' },
      { pin: 16, name: 'Q3n',   type: 'output' },
      { pin: 17, name: 'Q2n',   type: 'output' },
      { pin: 18, name: 'Q1n',   type: 'output' },
      { pin: 19, name: 'Q0n',   type: 'output' },
      { pin: 20, name: 'VCC',   type: 'power'  },
    ],
    // D0-D7 are the bidirectional 3-state read-back I/O bus (type:'io', same as the
    // 74x593/74x995): listed as both gate inputs and outputs so the primitive can
    // read the input byte and later drive the stored byte back onto the same pins.
    gates: [
      { type: 'LATCH_READBACK_INV',
        inputs:  ['OERB','LE','D0','D1','D2','D3','D4','D5','D6','D7'],
        outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n',
                  'D0','D1','D2','D3','D4','D5','D6','D7'] },
    ],
  },

  // 74992: 9 bit D type transparent read-back latch, non inverting, TRI (24-pin)
  // Source: Texas Instruments, "SN74ALS992 9-Bit D-Type Transparent Read-Back
  //   Latch With 3-State Outputs", SDAS028B (Apr. 1984, rev. Jan. 1995).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als992.pdf.
  //   Verified: terminal assignment (DW/NT top view), description, logic diagram,
  //   and switching-characteristics table (D->Q, LE->Q, CLR->Q&D, OERB->D,
  //   OEQ->Q), pages 1-4, read as 300-dpi PDF page images.
  // Pinout corrected here vs the hand-entered stub, which was wrong: pin 1 is
  //   OERB (read-back enable) not a lone "OEn"; pin 11 is CLR not LE; pin 13 is
  //   LE not Q8; pin 14 is OEQ not Q7; there are no NC pins (22/23 are 2Q/1Q).
  //   Nine bidirectional D pins carry the read-back path; the modeled behavior is
  //   the LATCH_9BIT_READBACK_TRI primitive in js/specificChipsSim.js.
  '74x992': {
    name: '74x992',
    simpleName: '9 bit Transparent Latch Read-Back (TRI)',
    description: '9-bit D transparent read-back latch, non-inv, 3-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als992.pdf',
    tags: ['latch', '9 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x992 is a nine bit transparent latch built for parity protected buses: eight data bits plus a ninth for parity or a status flag. While the latch enable is HIGH the outputs follow the data inputs; take it LOW and the chip holds the captured word. Two separate enables control the outputs. One drives the true Q outputs onto their own bus; the other drives the stored word back onto the data inputs, so the same nine pins that took data in can later read it out. Both output paths are 3-state, so the latch can hold a word without driving anything.',
    guidePinDescriptions: {
      'OERBn': 'Active LOW read-back enable. Pull LOW to drive the stored word back onto the D0-D8 pins; HIGH leaves those pins as data inputs.',
      'D0': 'Data bus bit 0. An input while OERB is HIGH; driven by the chip during read-back.',
      'D1': 'Data bus bit 1. An input while OERB is HIGH; driven by the chip during read-back.',
      'D2': 'Data bus bit 2. An input while OERB is HIGH; driven by the chip during read-back.',
      'D3': 'Data bus bit 3. An input while OERB is HIGH; driven by the chip during read-back.',
      'D4': 'Data bus bit 4. An input while OERB is HIGH; driven by the chip during read-back.',
      'D5': 'Data bus bit 5. An input while OERB is HIGH; driven by the chip during read-back.',
      'D6': 'Data bus bit 6. An input while OERB is HIGH; driven by the chip during read-back.',
      'D7': 'Data bus bit 7. An input while OERB is HIGH; driven by the chip during read-back.',
      'D8': 'Data bus bit 8, often used as a parity or status bit. An input while OERB is HIGH; driven by the chip during read-back.',
      'CLRn': 'Active LOW clear. Pull LOW to force all nine stored bits to 0.',
      'LE': 'Latch enable. HIGH makes the latch transparent so Q follows D; LOW holds the last captured word.',
      'OEQn': 'Active LOW output enable for the Q outputs. LOW drives Q0-Q8; HIGH sets them to high impedance.',
      'GND': 'Ground reference for the device at pin 12.',
      'Q8': 'Stored output bit 8.',
      'Q7': 'Stored output bit 7.',
      'Q6': 'Stored output bit 6.',
      'Q5': 'Stored output bit 5.',
      'Q4': 'Stored output bit 4.',
      'Q3': 'Stored output bit 3.',
      'Q2': 'Stored output bit 2.',
      'Q1': 'Stored output bit 1.',
      'Q0': 'Stored output bit 0.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'Nine Bit Bus Storage',
        paragraphs: [
          'A ninth stored bit is commonly used for parity, framing, or an extra control flag. The 74x992 keeps that extra bit synchronized with the rest of the byte instead of forcing you to add a separate single bit latch.',
        ],
      },
      {
        title: 'Read-Back',
        paragraphs: [
          'The nine data pins are bidirectional. Normally they are inputs. Pull OERB LOW and the chip drives the stored word back out onto those same pins, letting a processor read back what it wrote without a separate output bus.',
          'Read-back is meant to be used while the latch is holding, so the stored value it drives out does not fight the data it is trying to capture. If you enable read-back while the latch is transparent and something else is driving the data pins, you get a bus conflict, just like on real hardware.',
        ],
      },
      {
        title: 'Bus Isolation',
        paragraphs: [
          'Both output paths are 3-state, so the latch can hold data internally without driving either bus. That matters on shared backplanes where only one device should talk at a time.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OERBn', type: 'input'  },
      { pin:  2, name: 'D0',   type: 'bidir'  },
      { pin:  3, name: 'D1',   type: 'bidir'  },
      { pin:  4, name: 'D2',   type: 'bidir'  },
      { pin:  5, name: 'D3',   type: 'bidir'  },
      { pin:  6, name: 'D4',   type: 'bidir'  },
      { pin:  7, name: 'D5',   type: 'bidir'  },
      { pin:  8, name: 'D6',   type: 'bidir'  },
      { pin:  9, name: 'D7',   type: 'bidir'  },
      { pin: 10, name: 'D8',   type: 'bidir'  },
      { pin: 11, name: 'CLRn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'OEQn', type: 'input'  },
      { pin: 15, name: 'Q8',   type: 'output' },
      { pin: 16, name: 'Q7',   type: 'output' },
      { pin: 17, name: 'Q6',   type: 'output' },
      { pin: 18, name: 'Q5',   type: 'output' },
      { pin: 19, name: 'Q4',   type: 'output' },
      { pin: 20, name: 'Q3',   type: 'output' },
      { pin: 21, name: 'Q2',   type: 'output' },
      { pin: 22, name: 'Q1',   type: 'output' },
      { pin: 23, name: 'Q0',   type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'LATCH_9BIT_READBACK_TRI',
        inputs:  ['D0','D1','D2','D3','D4','D5','D6','D7','D8','LE','OEQn','OERBn','CLRn'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','D0','D1','D2','D3','D4','D5','D6','D7','D8'] },
    ],
  },

  // 74993: 9 bit D type transparent read-back latch, inverting, TRI (24-pin)
  //
  // Engine: LATCH_READBACK_TRI with invert:true — 9 transparent D latches, async
  // active-LOW clear, active-LOW output-enable on the (inverting) Q side. The
  // read-back path (OERB driving the stored word back onto the D bus) is not
  // modeled; the D pins are unidirectional inputs in this engine (see issues.md C88).
  //
  // The prior stub pinout was hand-entered and WRONG (LE on 11, no CLR/OEQ, NC on
  // 22/23). Corrected against the datasheet below.
  //
  // Source: Texas Instruments, "SN74ALS992 9-Bit D-Type Transparent Read-Back Latch
  //   With 3-State Outputs", SDAS028B (Apr. 1984, rev. Jan. 1995). [Online].
  //   Available: https://www.ti.com/lit/ds/symlink/sn74als992.pdf. Verified:
  //   terminal assignment (24-pin DW/NT), description, logic/timing diagrams and the
  //   recommended-operating-conditions table (active-LOW CLR pulse, LE-high /
  //   data-before-LE setup), pages 1-3 read as ~300-dpi PDF page images (issues.md C4).
  // Source: Texas Instruments, "SN74ALS990 8-Bit D-Type Transparent Read-Back Latch",
  //   SDAS027B (Apr. 1984, rev. Jan. 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als990.pdf. Verified: family read-back
  //   description + logic diagram, pages 1-2 as PDF images — used to confirm the
  //   OERB read-back semantics shared across the '990-'995 family.
  // Reconciliation: no '993-specific datasheet is published on ti.com (the
  //   sn74als99{1,3,5} symlinks 404). The part's identity — "9-bit D-type transparent
  //   read-back latch with INVERTING 3-state outputs", the complementary sibling of
  //   the '992 — was confirmed via TI's catalog / distributor listings (web search,
  //   Jul. 2026). TI's even/odd = true/inverting bus-latch convention keeps the pinout
  //   identical between a pair (cf. the '990/'991 and '842/'841 pairs), so the '992
  //   24-pin terminal assignment is used verbatim with the Q outputs inverted. Trusted
  //   the '992 sheet for the pin map, the catalog for the inverting-output claim.
  '74x993': {
    name: '74x993',
    simpleName: '9 bit Transparent Latch Read-Back Inv (TRI)',
    description: '9-bit D transparent read-back latch, inverting, 3-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['latch', '9 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x993 is a nine bit transparent latch with inverting three state outputs, the complementary version of the 74x992. While the latch enable (LE) is HIGH the nine outputs follow the data inputs; when LE goes LOW the last word is held. Every output is the complement of its stored bit, so the chip presents an active LOW copy of the data. A separate active LOW output enable (OEQn) puts all nine outputs in high impedance so the part can share a bus, and an active LOW clear (CLRn) resets every stored bit at once. The ninth bit is normally used for a parity or status flag alongside a byte. The part also has a read-back path (OERB) that can drive the stored word back onto the data inputs; that path is not modeled in the simulator.',
    guidePinDescriptions: {
      'OERB': 'Active LOW read-back enable. On real hardware, pulling it LOW drives the stored word back onto the data inputs. The simulator does not model this path.',
      'D0': 'Data input bit 0.',
      'D1': 'Data input bit 1.',
      'D2': 'Data input bit 2.',
      'D3': 'Data input bit 3.',
      'D4': 'Data input bit 4.',
      'D5': 'Data input bit 5.',
      'D6': 'Data input bit 6.',
      'D7': 'Data input bit 7.',
      'D8': 'Data input bit 8, often used as a parity or status bit.',
      'CLRn': 'Active LOW clear. Pull LOW to reset all nine stored bits to 0, which drives every inverting output HIGH.',
      'GND': 'Ground reference for the device at pin 12.',
      'LE': 'Latch enable. HIGH makes the latch transparent so the outputs follow the inputs; LOW holds the stored word.',
      'OEQn': 'Active LOW output enable for the Q outputs. LOW drives the bus, HIGH places all nine outputs in high impedance without changing the stored word.',
      'Q8n': 'Inverting stored output bit 8.',
      'Q7n': 'Inverting stored output bit 7.',
      'Q6n': 'Inverting stored output bit 6.',
      'Q5n': 'Inverting stored output bit 5.',
      'Q4n': 'Inverting stored output bit 4.',
      'Q3n': 'Inverting stored output bit 3.',
      'Q2n': 'Inverting stored output bit 2.',
      'Q1n': 'Inverting stored output bit 1.',
      'Q0n': 'Inverting stored output bit 0.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'Inverting Transparent Latch',
        paragraphs: [
          'While LE is HIGH the latch is transparent and each output holds the complement of its data input. When LE goes LOW the nine bits are frozen and keep driving their complemented values until LE returns HIGH.',
          'The active LOW clear forces every stored bit to 0. Because the outputs invert, a clear drives all nine outputs HIGH.',
        ],
      },
      {
        title: 'Sharing a Bus',
        paragraphs: [
          'OEQn controls only whether the outputs drive. With OEQn HIGH the nine outputs go to high impedance and the stored word is untouched, so several devices can take turns on one set of bus lines.',
        ],
        note: 'The read-back path (OERB) is documented on the pinout but not simulated, since the data pins are treated as inputs only.',
      },
    ],
    pinout: [
      { pin:  1, name: 'OERB', type: 'input'  },
      { pin:  2, name: 'D0',   type: 'input'  },
      { pin:  3, name: 'D1',   type: 'input'  },
      { pin:  4, name: 'D2',   type: 'input'  },
      { pin:  5, name: 'D3',   type: 'input'  },
      { pin:  6, name: 'D4',   type: 'input'  },
      { pin:  7, name: 'D5',   type: 'input'  },
      { pin:  8, name: 'D6',   type: 'input'  },
      { pin:  9, name: 'D7',   type: 'input'  },
      { pin: 10, name: 'D8',   type: 'input'  },
      { pin: 11, name: 'CLRn', type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'OEQn', type: 'input'  },
      { pin: 15, name: 'Q8n',  type: 'output' },
      { pin: 16, name: 'Q7n',  type: 'output' },
      { pin: 17, name: 'Q6n',  type: 'output' },
      { pin: 18, name: 'Q5n',  type: 'output' },
      { pin: 19, name: 'Q4n',  type: 'output' },
      { pin: 20, name: 'Q3n',  type: 'output' },
      { pin: 21, name: 'Q2n',  type: 'output' },
      { pin: 22, name: 'Q1n',  type: 'output' },
      { pin: 23, name: 'Q0n',  type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'LATCH_READBACK_TRI', invert: true,
        inputs: ['D0','D1','D2','D3','D4','D5','D6','D7','D8','LE','OEQn','CLRn'],
        outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n','Q8n'] },
    ],
  },

  // 74994: 10 bit D type transparent read-back latch, non inverting, TRI (24-pin)
  // Source: Texas Instruments, "SN74ALS994 10-Bit D-Type Transparent Read-Back
  //   Latch", SDAS237A (Oct. 1984, rev. Jan. 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als994.pdf (TI /lit blocks non-
  //   browser fetches; the PDF actually read was the identical SDAS237A mirror
  //   at media.digikey.com/pdf/Data%20Sheets/Texas%20Instruments%20PDFs/
  //   SN74ALS994.pdf). Verified: TOP-VIEW terminal diagram + description + logic
  //   diagram, pages 1-2, read as rendered PDF page images (issues.md C4), not a
  //   text summary. Pinout: OERB=1, 1D..10D=2..11, GND=12, LE=13, 10Q..1Q=14..23,
  //   VCC=24. D0/Q0 = bit 0 = pin 2 / pin 23.
  //   The hand-entered stub was WRONG about function: it called pin 1 "OEn" and
  //   made it a 3-state enable on the Q outputs, with D0..D9 as plain inputs.
  //   The datasheet shows the opposite architecture (a "read-back" latch): the Q
  //   outputs are TRUE LOGIC OUTPUTS that always drive, and pin 1 is OERB
  //   (Output-Enable Read-Back, active LOW) which, when LOW, drives the stored
  //   word BACK onto the D pins so a CPU can read the held value off the same
  //   data bus. The D pins are therefore 3-state I/O, not inputs.
  //   Engine: LATCH_READBACK_BIDIR_TRI (js/specificChipsSim.js), the level-
  //   controlled twin of the 74x996's edge-triggered read-back primitive. (Note:
  //   a sibling's LATCH_READBACK_TRI is a Q-side-only model of the 992/993 that
  //   omits the read-back path; this part uses the bidirectional variant.)
  //   Regression: js/debug/scenarios/74x994-readback-latch.mjs.
  '74x994': {
    name: '74x994',
    simpleName: '10 bit Transparent Latch Read-Back (TRI)',
    description: '10-bit D transparent read-back latch, non-inv, 3-state inputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als994.pdf',
    tags: ['latch', 'D type', '10 bit', 'transparent', 'read-back', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x994 is a ten bit transparent latch built for reading data off a bus and handing the same data back later. While Latch Enable (LE) is HIGH the ten Q outputs follow the D inputs; when LE goes LOW the current word is held. The Q outputs always drive their stored value. What makes this a read-back latch is the D side: a single active LOW Output Enable Read-Back (OERB) pin, when pulled LOW, drives the held word back onto the same D pins the data came in on, so a processor can read the latched value over the shared data bus without a separate output port. When OERB is HIGH the D pins are ordinary inputs. Ten bits covers a byte plus two extra parity or control bits.',
    guidePinDescriptions: {
      'OERB': 'Output enable read-back (active LOW). LOW drives the stored word back onto the D pins so it can be read off the bus; HIGH leaves the D pins as inputs. Does not affect the stored data.',
      'D0':  'Data bit 0. Input while capturing; driven with the stored bit during read-back (OERB LOW).',
      'D1':  'Data bit 1.',
      'D2':  'Data bit 2.',
      'D3':  'Data bit 3.',
      'D4':  'Data bit 4.',
      'D5':  'Data bit 5.',
      'D6':  'Data bit 6.',
      'D7':  'Data bit 7.',
      'D8':  'Data bit 8.',
      'D9':  'Data bit 9.',
      'GND': 'Ground reference (pin 12).',
      'LE':  'Latch enable. HIGH makes the latches transparent (Q follows D); a HIGH to LOW transition captures and holds the current word.',
      'Q9':  'Latched output bit 9 (always driven).',
      'Q8':  'Latched output bit 8.',
      'Q7':  'Latched output bit 7.',
      'Q6':  'Latched output bit 6.',
      'Q5':  'Latched output bit 5.',
      'Q4':  'Latched output bit 4.',
      'Q3':  'Latched output bit 3.',
      'Q2':  'Latched output bit 2.',
      'Q1':  'Latched output bit 1.',
      'Q0':  'Latched output bit 0.',
      'VCC': 'Positive supply (+5 V, pin 24).',
    },
    guideSections: [
      {
        title: 'What "read-back" means',
        paragraphs: [
          'A normal latch has separate input and output pins. This part has both, but it can also send its stored word back out the input pins. Picture a processor connected to a data bus. It writes a word, the latch captures it, and the bus moves on. Later the processor wants to check what was stored. Instead of routing the Q outputs back to the bus through extra wiring, it pulls OERB LOW and the latch drives the held word straight back onto the same D lines it read from.',
          'The Q outputs still show the stored word the whole time. Read-back is a second path, on the D side, controlled independently by OERB.',
        ],
      },
      {
        title: 'Transparent latch, not a flip flop',
        paragraphs: [
          'This is level controlled. While LE is HIGH the outputs track the inputs directly; the word you keep is whatever was present the instant LE fell to LOW. A flip flop samples only on a clock edge. Use the latch when you want to freeze a bus at a moment in time rather than on a repeating clock.',
        ],
        note: 'Avoid pulling OERB LOW while another device is actively driving the D bus. Both would drive the same wires at once, which is a bus conflict. Release the external driver first.',
      },
    ],
    pinout: [
      { pin:  1, name: 'OERB', type: 'input'  },
      { pin:  2, name: 'D0',   type: 'bidir'  },
      { pin:  3, name: 'D1',   type: 'bidir'  },
      { pin:  4, name: 'D2',   type: 'bidir'  },
      { pin:  5, name: 'D3',   type: 'bidir'  },
      { pin:  6, name: 'D4',   type: 'bidir'  },
      { pin:  7, name: 'D5',   type: 'bidir'  },
      { pin:  8, name: 'D6',   type: 'bidir'  },
      { pin:  9, name: 'D7',   type: 'bidir'  },
      { pin: 10, name: 'D8',   type: 'bidir'  },
      { pin: 11, name: 'D9',   type: 'bidir'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'Q9',   type: 'output' },
      { pin: 15, name: 'Q8',   type: 'output' },
      { pin: 16, name: 'Q7',   type: 'output' },
      { pin: 17, name: 'Q6',   type: 'output' },
      { pin: 18, name: 'Q5',   type: 'output' },
      { pin: 19, name: 'Q4',   type: 'output' },
      { pin: 20, name: 'Q3',   type: 'output' },
      { pin: 21, name: 'Q2',   type: 'output' },
      { pin: 22, name: 'Q1',   type: 'output' },
      { pin: 23, name: 'Q0',   type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'LATCH_READBACK_BIDIR_TRI',
        inputs:  ['D0','D1','D2','D3','D4','D5','D6','D7','D8','D9','LE','OERB'],
        outputs: ['Q0','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9',
                  'D0','D1','D2','D3','D4','D5','D6','D7','D8','D9'] },
    ],
  },

  // 74995: 10 bit D type transparent read-back latch, inverting, TRI (24-pin)
  //
  // Behavioral model: 10-bit inverting transparent latch (LATCH_10BIT_READBACK_INV
  // in js/specificChipsSim.js). LE HIGH → transparent; LE LOW → hold. The Q0n..Q9n
  // pins are dedicated TRUE-LOGIC outputs (always driven, never 3-state) presenting
  // the complemented stored word. OERB (active LOW) is the only 3-state control: LOW
  // drives the stored word back onto the bidirectional D0..D9 bus, HIGH releases the
  // D pins (Hi-Z) so they act as inputs. This is the defining read-back feature and
  // the only thing OERB does — a 10-bit part in a 24-pin package has no room for a
  // separate output-enable or clear pin (10 D + 10 Q + VCC + GND = 22 pins, leaving
  // exactly OERB + LE), so unlike the 9-bit '992/'993 there is no OEQ and no CLR.
  //
  // Read-back polarity: the D bus presents the stored (NON-inverted) word, matching
  // the verified '990 read-back path ("the data present at the output of the data
  // latches"); only the dedicated Q outputs invert. The '995-specific datasheet could
  // not confirm this (it is unpublished — see reconciliation below), so it is the
  // 990-consistent interpretation. See issues.md C89.
  //
  // Pinout verification: the stub pins were structurally correct; corrected pin 1's
  // label (OEn → OERB, the family read-back-enable name) and made D0..D9 bidirectional
  // ('io'). Pin budget + the '990 24-pin family layout confirm OERB=1, D0..D9=2-11,
  // GND=12, LE=13, Q9n..Q0n=14-23 (pin ascending = bit descending), VCC=24.
  //
  // Source: Texas Instruments, "SN74ALS990 8-Bit D-Type Transparent Read-Back Latch",
  //   SDAS027B (Apr. 1984, rev. Jan. 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als990.pdf. Verified: terminal assignment,
  //   description ("True Logic Outputs"; OERB read-back onto the data bus; "OERB does
  //   not affect the internal operation of the latches"), logic diagram + timing
  //   diagram, and recommended-operating-conditions (LE-high transparent, data-before-
  //   LE setup) — pages 1-3 read as ~300-dpi PDF page images (issues.md C4). This is
  //   the 2-control-pin family member the '994/'995 scale up from.
  // Source: Texas Instruments, "SN74ALS992 9-Bit D-Type Transparent Read-Back Latch
  //   With 3-State Outputs", SDAS028B (Apr. 1984, rev. Jan. 1995). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/sn74als992.pdf. Verified: 24-pin terminal
  //   assignment + description, page 1 as a PDF page image — used to confirm the 24-pin
  //   family layout and that the extra OEQ/CLR pins appear only on the narrower 9-bit
  //   members that have spare pins (they do not exist on the 10-bit '994/'995).
  // Reconciliation: no '994- or '995-specific datasheet is published on ti.com (the
  //   sn74als99{4,5} symlinks 404 — the parts are obsolete). The '995's identity —
  //   "10-bit D-type transparent read-back latch, inverting outputs", the complementary
  //   sibling of the '994 — is from TI's catalog / distributor listings (web search,
  //   Jul. 2026) and the family naming convention. Trusted the '990 sheet for the
  //   read-back architecture + true-logic-output behavior, the '992 sheet for the 24-pin
  //   layout, the catalog for the inverting-output + 10-bit-width claims. The read-back
  //   D-bus drive is modeled (via 'io' pins, like the 74x593); its polarity is the one
  //   corner not directly datasheet-confirmed.
  '74x995': {
    name: '74x995',
    simpleName: '10 bit Transparent Latch Read-Back Inv (TRI)',
    description: '10-bit D transparent read-back latch, inverting, 3-state bus (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als990.pdf',
    tags: ['latch', '10 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x995 is the inverting version of the 74x994: a ten bit transparent latch that stores a wide word and hands back the complement of every bit. While the latch enable (LE) is HIGH the latch is transparent and each Q output follows the complement of its data input; when LE goes LOW the ten bits are frozen. The Q outputs are always driven, so they are handy when downstream logic expects an active LOW copy of the word without adding inverter packages. The D0-D9 pins double as a read-back bus: with the read-back enable (OERB) LOW the chip drives the stored word back onto those pins, and with OERB HIGH it lets go of them so they act as inputs again. This lets a processor read back what it earlier latched over the same wires. Because the ten data and ten output pins fill a 24 pin package, there is no separate output enable or clear pin.',
    guidePinDescriptions: {
      'OERB': 'Read-back enable, active LOW. LOW drives the stored ten bit word back onto the D0-D9 pins; HIGH releases those pins so they act as data inputs. It does not change the stored word or the Q outputs.',
      'D0': 'Data bit 0. Input while OERB is HIGH; driven with the stored bit during read-back when OERB is LOW.',
      'D1': 'Data bit 1. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D2': 'Data bit 2. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D3': 'Data bit 3. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D4': 'Data bit 4. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D5': 'Data bit 5. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D6': 'Data bit 6. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D7': 'Data bit 7. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D8': 'Data bit 8. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'D9': 'Data bit 9. Input while OERB is HIGH; driven during read-back when OERB is LOW.',
      'GND': 'Ground reference for the device at pin 12.',
      'LE': 'Latch enable. HIGH makes the latch transparent so the outputs follow the inputs; LOW holds the stored word.',
      'Q9n': 'Inverting stored output bit 9. Always driven.',
      'Q8n': 'Inverting stored output bit 8. Always driven.',
      'Q7n': 'Inverting stored output bit 7. Always driven.',
      'Q6n': 'Inverting stored output bit 6. Always driven.',
      'Q5n': 'Inverting stored output bit 5. Always driven.',
      'Q4n': 'Inverting stored output bit 4. Always driven.',
      'Q3n': 'Inverting stored output bit 3. Always driven.',
      'Q2n': 'Inverting stored output bit 2. Always driven.',
      'Q1n': 'Inverting stored output bit 1. Always driven.',
      'Q0n': 'Inverting stored output bit 0. Always driven.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'Inverting Transparent Latch',
        paragraphs: [
          'While LE is HIGH the latch is transparent and each output holds the complement of its data input. When LE goes LOW the ten bits are frozen and keep driving their complemented values until LE returns HIGH.',
          'The Q outputs are always driven, so a stored 1 always shows as a 0 on its output pin and a stored 0 shows as a 1. That is the difference from the non-inverting 74x994.',
        ],
      },
      {
        title: 'Read-Back on the Data Bus',
        paragraphs: [
          'The D0-D9 pins carry data in, but they can also carry the stored word back out. With OERB HIGH the pins are inputs; with OERB LOW the chip drives the latched word back onto them so a processor can read back what it stored earlier over the same wires.',
          'Only one device should drive those wires at a time. Assert read-back while another driver holds the same lines and both fight, which is why read-back is normally used with the external driver released.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: 'OERB', type: 'input'  },
      { pin:  2, name: 'D0',   type: 'io'     },
      { pin:  3, name: 'D1',   type: 'io'     },
      { pin:  4, name: 'D2',   type: 'io'     },
      { pin:  5, name: 'D3',   type: 'io'     },
      { pin:  6, name: 'D4',   type: 'io'     },
      { pin:  7, name: 'D5',   type: 'io'     },
      { pin:  8, name: 'D6',   type: 'io'     },
      { pin:  9, name: 'D7',   type: 'io'     },
      { pin: 10, name: 'D8',   type: 'io'     },
      { pin: 11, name: 'D9',   type: 'io'     },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'LE',   type: 'input'  },
      { pin: 14, name: 'Q9n',  type: 'output' },
      { pin: 15, name: 'Q8n',  type: 'output' },
      { pin: 16, name: 'Q7n',  type: 'output' },
      { pin: 17, name: 'Q6n',  type: 'output' },
      { pin: 18, name: 'Q5n',  type: 'output' },
      { pin: 19, name: 'Q4n',  type: 'output' },
      { pin: 20, name: 'Q3n',  type: 'output' },
      { pin: 21, name: 'Q2n',  type: 'output' },
      { pin: 22, name: 'Q1n',  type: 'output' },
      { pin: 23, name: 'Q0n',  type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'LATCH_10BIT_READBACK_INV',
        inputs:  ['OERB','D0','D1','D2','D3','D4','D5','D6','D7','D8','D9','LE'],
        outputs: ['Q0n','Q1n','Q2n','Q3n','Q4n','Q5n','Q6n','Q7n','Q8n','Q9n',
                  'D0','D1','D2','D3','D4','D5','D6','D7','D8','D9'] },
    ],
  },

  // 74996: 8 bit D type edge triggered read-back latch, TRI (24-pin)
  // Source: Texas Instruments, "SN54ALS996, SN74ALS996 8-Bit D-Type
  //   Edge-Triggered Read-Back Latches", SDAS098B (Oct 1984, rev Jan 1995).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/sn74als996.pdf.
  //   Verified: terminal assignment (DW/NT/JT DIP), description and logic
  //   diagram, pages 1-2, read as PDF page images. The hand-entered stub pinout
  //   was wrong (D0-D7/OEn/CLK/CLRn plus three NC pins) — replaced with the real
  //   bus-structured pinout: 1D-8D on pins 1-8, EN/RD/CLK on 9-11, CLR/T-C/OE on
  //   13-15, 8Q-1Q on 16-23, no NC pins.
  '74x996': {
    name: '74x996',
    simpleName: '8 bit Edge Triggered Latch Read-Back (TRI)',
    description: '8-bit D edge-triggered read-back latch, 3-state outputs (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als996.pdf',
    tags: ['latch', 'flip flop', '8 bit', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x996 stores a byte on a clock edge and can read that byte back onto the same bus it was loaded from. Its eight data pins are bidirectional: normally they are inputs, but pull the read line LOW and the chip drives the stored byte back onto them, so one bus both writes and reads the register. A separate set of Q outputs also shows the stored byte, and a polarity pin lets those outputs be the data as stored or its inverse. On a breadboard it fits designs where a processor writes a byte to a device and later needs to read the same byte back over one shared data bus.',
    guidePinDescriptions: {
      '1D': 'Data bus bit 0. An input while writing; during read-back (EN and RD both LOW) the chip drives the stored bit 0 back onto this pin.',
      '2D': 'Data bus bit 1. Input while writing, driven with the stored bit during read-back.',
      '3D': 'Data bus bit 2. Input while writing, driven with the stored bit during read-back.',
      '4D': 'Data bus bit 3. Input while writing, driven with the stored bit during read-back.',
      '5D': 'Data bus bit 4. Input while writing, driven with the stored bit during read-back.',
      '6D': 'Data bus bit 5. Input while writing, driven with the stored bit during read-back.',
      '7D': 'Data bus bit 6. Input while writing, driven with the stored bit during read-back.',
      '8D': 'Data bus bit 7. Input while writing, driven with the stored bit during read-back.',
      'EN': 'Enable, active LOW. Must be LOW to clock data in or to read data back. HIGH disables both: the clock is ignored and the data pins stay released.',
      'RD': 'Read-back, active LOW. With EN also LOW, pull RD LOW to drive the stored byte back onto the data pins. Tie HIGH for normal writing.',
      'CLK': 'Clock. On a LOW to HIGH edge, with EN LOW, the eight data pins are captured into the register.',
      'CLRn': 'Clear, active LOW. Pull LOW to reset the register to all zeros at once, regardless of the clock. Tie HIGH when not clearing.',
      'T/C': 'True/complement select. HIGH makes the Q outputs match the stored data; LOW makes them the inverse.',
      'OEn': 'Output enable, active LOW. LOW lets the Q outputs drive; HIGH releases them to high impedance. Does not change the stored data.',
      'GND': 'Ground reference for the device at pin 12.',
      '8Q': 'Registered output bit 7. Shows stored bit 7, or its inverse when T/C is LOW.',
      '7Q': 'Registered output bit 6. Shows stored bit 6, or its inverse when T/C is LOW.',
      '6Q': 'Registered output bit 5. Shows stored bit 5, or its inverse when T/C is LOW.',
      '5Q': 'Registered output bit 4. Shows stored bit 4, or its inverse when T/C is LOW.',
      '4Q': 'Registered output bit 3. Shows stored bit 3, or its inverse when T/C is LOW.',
      '3Q': 'Registered output bit 2. Shows stored bit 2, or its inverse when T/C is LOW.',
      '2Q': 'Registered output bit 1. Shows stored bit 1, or its inverse when T/C is LOW.',
      '1Q': 'Registered output bit 0. Shows stored bit 0, or its inverse when T/C is LOW.',
      'VCC': 'Positive 5 V supply at pin 24.',
    },
    guideSections: [
      {
        title: 'Edge triggered storage',
        paragraphs: [
          'The register captures data only on the LOW to HIGH edge of the clock, and only while EN is LOW. Between edges the stored byte holds, so the outputs change once per clock rather than following the inputs moment to moment. That makes timing predictable in a clocked system, unlike a transparent latch whose output tracks its input whenever it is open.',
          'A LOW on CLR clears the register to all zeros immediately, without waiting for a clock edge, and overrides everything else. Use it to force a known startup state.',
        ],
      },
      {
        title: 'Reading the byte back',
        paragraphs: [
          'The eight data pins double as read-back outputs. With EN LOW and RD LOW, the chip drives the stored byte back onto those same pins, so a bus that wrote the register can later read it without extra wiring. Keep RD HIGH the rest of the time, otherwise the chip fights whatever is driving the data bus.',
          'The Q outputs are a separate, one-way copy of the stored byte with their own enable. Pull OE HIGH to release them to high impedance so they can share a bus, and set T/C to choose whether they present the data as stored or inverted. Neither OE nor T/C changes what is stored.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1D',   type: 'input'  },
      { pin:  2, name: '2D',   type: 'input'  },
      { pin:  3, name: '3D',   type: 'input'  },
      { pin:  4, name: '4D',   type: 'input'  },
      { pin:  5, name: '5D',   type: 'input'  },
      { pin:  6, name: '6D',   type: 'input'  },
      { pin:  7, name: '7D',   type: 'input'  },
      { pin:  8, name: '8D',   type: 'input'  },
      { pin:  9, name: 'EN',   type: 'input'  },
      { pin: 10, name: 'RD',   type: 'input'  },
      { pin: 11, name: 'CLK',  type: 'input'  },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'CLRn', type: 'input'  },
      { pin: 14, name: 'T/C',  type: 'input'  },
      { pin: 15, name: 'OEn',  type: 'input'  },
      { pin: 16, name: '8Q',   type: 'output' },
      { pin: 17, name: '7Q',   type: 'output' },
      { pin: 18, name: '6Q',   type: 'output' },
      { pin: 19, name: '5Q',   type: 'output' },
      { pin: 20, name: '4Q',   type: 'output' },
      { pin: 21, name: '3Q',   type: 'output' },
      { pin: 22, name: '2Q',   type: 'output' },
      { pin: 23, name: '1Q',   type: 'output' },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      // Bidirectional data pins (1D-8D) appear in both inputs and outputs: sensed
      // as inputs, driven with the stored byte during read-back. See
      // REG_READBACK_996 in specificChipsSim.js.
      {
        type: 'REG_READBACK_996',
        inputs:  ['1D','2D','3D','4D','5D','6D','7D','8D','EN','RD','CLK','CLRn','T/C','OEn'],
        outputs: ['1Q','2Q','3Q','4Q','5Q','6Q','7Q','8Q','1D','2D','3D','4D','5D','6D','7D','8D'],
      },
    ],
  },
  // 74x1000: Quad 2 input NAND gate driver (14-pin)
  '74x1000': {
    name: '74x1000',
    simpleName: 'Quad 2 Input NAND Gate Driver',
    description: 'Quad 2 input NAND gate with high drive outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74as1000a.pdf',
    tags: ['nand', 'gate', 'quad', 'driver'],
    guideOverview: 'The 74x1000 contains four independent 2 input NAND buffer/driver stages in one package. A NAND gate outputs LOW only when both inputs are HIGH, which makes it one of the most flexible building blocks in digital logic because many other functions can be assembled from NANDs. On a breadboard it is useful when you need ordinary logic plus stronger output drive than a small-signal gate can provide.',
    guidePinDescriptions: {
      '1A': 'Input A of gate 1.',
      '1B': 'Input B of gate 1.',
      '1Y': 'Output of gate 1. It goes LOW only when both 1A and 1B are HIGH.',
      '2A': 'Input A of gate 2.',
      '2B': 'Input B of gate 2.',
      '2Y': 'Output of gate 2.',
      'GND': 'Ground reference for the device at pin 7.',
      '3Y': 'Output of gate 3.',
      '3A': 'Input A of gate 3.',
      '3B': 'Input B of gate 3.',
      '4Y': 'Output of gate 4.',
      '4A': 'Input A of gate 4.',
      '4B': 'Input B of gate 4.',
      'VCC': 'Positive 5 V supply at pin 14.',
    },
    guideSections: [
      {
        title: 'Logic Function',
        paragraphs: [
          'A 2 input NAND performs the function Y = !(A · B). Only the input combination HIGH HIGH produces a LOW output; every other combination gives a HIGH output.',
        ],
        formulas: [
          'A=0, B=0 -> Y=1',
          'A=0, B=1 -> Y=1',
          'A=1, B=0 -> Y=1',
          'A=1, B=1 -> Y=0',
        ],
      },
      {
        title: 'Why Drivers Matter',
        paragraphs: [
          'A buffer/driver version of a logic gate is intended to source or sink more current than a minimal logic stage. That makes it a better choice when one gate output must feed several TTL inputs or a slightly heavier load.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1Y',  type: 'output' },
      { pin:  4, name: '2A',  type: 'input'  },
      { pin:  5, name: '2B',  type: 'input'  },
      { pin:  6, name: '2Y',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '3Y',  type: 'output' },
      { pin:  9, name: '3A',  type: 'input'  },
      { pin: 10, name: '3B',  type: 'input'  },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input'  },
      { pin: 13, name: '4B',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A','1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A','2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A','3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A','4B'], output: '4Y' },
    ],
  },

  // 74x1002: Quad 2 input NOR gate driver (14-pin)
  '74x1002': {
    name: '74x1002',
    simpleName: 'Quad 2 Input NOR Gate Driver',
    description: 'Quad 2 input NOR gate with high drive outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['nor', 'gate', 'quad', 'driver'],
    guideOverview: 'The 74x1002 contains four independent 2 input NOR buffer/driver stages. A NOR gate outputs HIGH only when both inputs are LOW, making it the complement of OR and a useful universal building block alongside NAND gates. The driver outputs supply stronger current than a minimal logic gate, which helps when one gate must feed several TTL inputs on a breadboard.',
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1Y',  type: 'output' },
      { pin:  4, name: '2A',  type: 'input'  },
      { pin:  5, name: '2B',  type: 'input'  },
      { pin:  6, name: '2Y',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '3Y',  type: 'output' },
      { pin:  9, name: '3A',  type: 'input'  },
      { pin: 10, name: '3B',  type: 'input'  },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input'  },
      { pin: 13, name: '4B',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NOR', inputs: ['1A','1B'], output: '1Y' },
      { type: 'NOR', inputs: ['2A','2B'], output: '2Y' },
      { type: 'NOR', inputs: ['3A','3B'], output: '3Y' },
      { type: 'NOR', inputs: ['4A','4B'], output: '4Y' },
    ],
  },

  // 74x1003: Quad 2 input NAND gate, open collector driver (14-pin)
  '74x1003': {
    name: '74x1003',
    simpleName: 'Quad 2 Input NAND Gate OC Driver',
    description: 'Quad 2 input NAND gate with open collector high drive outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    openCollector: true,
    datasheet: '',
    tags: ['nand', 'gate', 'quad', 'driver', 'open collector'],
    guideOverview: 'The 74x1003 provides four 2 input NAND stages with open collector outputs. Internally each gate computes the NAND function, but the output transistor can only pull the line LOW. An external pull up resistor is required to create a HIGH level. On a breadboard this makes it possible to wire several open collector NAND outputs together on one shared line for wired AND behavior, or to drive loads at a voltage different from the supply rail.',
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1Y',  type: 'output' },
      { pin:  4, name: '2A',  type: 'input'  },
      { pin:  5, name: '2B',  type: 'input'  },
      { pin:  6, name: '2Y',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '3Y',  type: 'output' },
      { pin:  9, name: '3A',  type: 'input'  },
      { pin: 10, name: '3B',  type: 'input'  },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input'  },
      { pin: 13, name: '4B',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A','1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A','2B'], output: '2Y' },
      { type: 'NAND', inputs: ['3A','3B'], output: '3Y' },
      { type: 'NAND', inputs: ['4A','4B'], output: '4Y' },
    ],
  },

  // 74x1004: Hex inverting buffer driver (14-pin)
  '74x1004': {
    name: '74x1004',
    simpleName: 'Hex Inverting Buffer Driver',
    description: 'Hex inverting buffer with high drive outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als1004.pdf',
    tags: ['inverter', 'hex', 'driver'],
    guideOverview: 'The 74x1004 is a hex inverting buffer/driver. Each of the six channels performs a simple logical inversion, but the driver family is intended to supply stronger output current than a tiny logic gate. On a breadboard it is useful for polarity cleanup, fanout, and turning one control signal into several stronger inverted copies.',
    guidePinDescriptions: {
      '1A': 'Input of inverter 1.',
      '1Y': 'Output of inverter 1. It is the logical inverse of 1A.',
      '2A': 'Input of inverter 2.',
      '2Y': 'Output of inverter 2.',
      '3A': 'Input of inverter 3.',
      '3Y': 'Output of inverter 3.',
      'GND': 'Ground reference for the device at pin 7.',
      '4Y': 'Output of inverter 4.',
      '4A': 'Input of inverter 4.',
      '5Y': 'Output of inverter 5.',
      '5A': 'Input of inverter 5.',
      '6Y': 'Output of inverter 6.',
      '6A': 'Input of inverter 6.',
      'VCC': 'Positive 5 V supply at pin 14.',
    },
    guideSections: [
      {
        title: 'Inversion',
        paragraphs: [
          'An inverter implements Y = !A. A HIGH input becomes a LOW output, and a LOW input becomes a HIGH output.',
        ],
        formulas: [
          'A=0 -> Y=1',
          'A=1 -> Y=0',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Generate active LOW control signals from active HIGH logic.',
          'Strengthen a weak logic source before driving multiple loads.',
          'Add a deliberate inversion stage in timing or control paths.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1Y',  type: 'output' },
      { pin:  3, name: '2A',  type: 'input'  },
      { pin:  4, name: '2Y',  type: 'output' },
      { pin:  5, name: '3A',  type: 'input'  },
      { pin:  6, name: '3Y',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '4Y',  type: 'output' },
      { pin:  9, name: '4A',  type: 'input'  },
      { pin: 10, name: '5Y',  type: 'output' },
      { pin: 11, name: '5A',  type: 'input'  },
      { pin: 12, name: '6Y',  type: 'output' },
      { pin: 13, name: '6A',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },

  // 74x1005: Hex inverting buffer, open collector driver (14-pin)
  '74x1005': {
    name: '74x1005',
    simpleName: 'Hex Inverting Buffer OC Driver',
    description: 'Hex inverting buffer with open collector high drive outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    openCollector: true,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74als1005.pdf',
    tags: ['inverter', 'hex', 'driver', 'open collector'],
    guideOverview: 'The 74x1005 is a hex inverting driver with open collector outputs. Internally each channel still behaves like an inverter, but the output transistor can only pull the line LOW, so an external pull up is needed to create a HIGH level. On a breadboard this makes the part useful for wired logic connections, level shifting tricks, and driving loads that should share a pull up rail.',
    guidePinDescriptions: {
      '1A': 'Input of inverter 1.',
      '1Y': 'Open collector output of inverter 1. It pulls LOW when active and otherwise releases the line, so use a pull up resistor.',
      '2A': 'Input of inverter 2.',
      '2Y': 'Open collector output of inverter 2.',
      '3A': 'Input of inverter 3.',
      '3Y': 'Open collector output of inverter 3.',
      'GND': 'Ground reference for the device at pin 7.',
      '4Y': 'Open collector output of inverter 4.',
      '4A': 'Input of inverter 4.',
      '5Y': 'Open collector output of inverter 5.',
      '5A': 'Input of inverter 5.',
      '6Y': 'Open collector output of inverter 6.',
      '6A': 'Input of inverter 6.',
      'VCC': 'Positive 5 V supply at pin 14.',
    },
    guideSections: [
      {
        title: 'Open Collector Behavior',
        paragraphs: [
          'An open collector output can actively pull the line LOW but cannot drive it HIGH by itself. Instead, a resistor or another pull up network brings the line HIGH when the transistor is off.',
        ],
        list: [
          'Add a pull up resistor whenever you use the output.',
          'Multiple open collector outputs can share one line for wired logic behavior.',
          'Use it when the load voltage or pull up arrangement needs flexibility.',
        ],
      },
      {
        title: 'Logic Function',
        paragraphs: [
          'Each channel still performs inversion: a HIGH input turns on the pull down transistor, while a LOW input releases the output node.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1Y',  type: 'output' },
      { pin:  3, name: '2A',  type: 'input'  },
      { pin:  4, name: '2Y',  type: 'output' },
      { pin:  5, name: '3A',  type: 'input'  },
      { pin:  6, name: '3Y',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '4Y',  type: 'output' },
      { pin:  9, name: '4A',  type: 'input'  },
      { pin: 10, name: '5Y',  type: 'output' },
      { pin: 11, name: '5A',  type: 'input'  },
      { pin: 12, name: '6Y',  type: 'output' },
      { pin: 13, name: '6A',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NOT', inputs: ['1A'], output: '1Y' },
      { type: 'NOT', inputs: ['2A'], output: '2Y' },
      { type: 'NOT', inputs: ['3A'], output: '3Y' },
      { type: 'NOT', inputs: ['4A'], output: '4Y' },
      { type: 'NOT', inputs: ['5A'], output: '5Y' },
      { type: 'NOT', inputs: ['6A'], output: '6Y' },
    ],
  },

  // 74x1008: Quad 2 input AND gate driver (14-pin)
  '74x1008': {
    name: '74x1008',
    simpleName: 'Quad 2 Input AND Gate Driver',
    description: 'Quad 2 input AND gate with high drive outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: 'https://www.ti.com/lit/ds/symlink/sn74as1008a.pdf',
    tags: ['and', 'gate', 'quad', 'driver'],
    guideOverview: 'The 74x1008 provides four independent 2 input AND buffer/driver stages. An AND gate outputs HIGH only when both inputs are HIGH, which makes it a convenient way to combine two enable conditions or require two simultaneous logic truths before driving a load. The driver family gives the outputs enough strength to be useful in real TTL fanout situations on a breadboard.',
    guidePinDescriptions: {
      '1A': 'Input A of gate 1.',
      '1B': 'Input B of gate 1.',
      '1Y': 'Output of gate 1. It is HIGH only when both 1A and 1B are HIGH.',
      '2A': 'Input A of gate 2.',
      '2B': 'Input B of gate 2.',
      '2Y': 'Output of gate 2.',
      'GND': 'Ground reference for the device at pin 7.',
      '3Y': 'Output of gate 3.',
      '3A': 'Input A of gate 3.',
      '3B': 'Input B of gate 3.',
      '4Y': 'Output of gate 4.',
      '4A': 'Input A of gate 4.',
      '4B': 'Input B of gate 4.',
      'VCC': 'Positive 5 V supply at pin 14.',
    },
    guideSections: [
      {
        title: 'Logic Function',
        paragraphs: [
          'A 2 input AND performs Y = A · B. The output goes HIGH only when both inputs are HIGH.',
        ],
        formulas: [
          'A=0, B=0 -> Y=0',
          'A=0, B=1 -> Y=0',
          'A=1, B=0 -> Y=0',
          'A=1, B=1 -> Y=1',
        ],
      },
      {
        title: 'Common Uses',
        list: [
          'Gate one control signal with another enable signal.',
          'Require two independent conditions before turning something on.',
          'Drive a slightly heavier TTL load than a minimal logic gate can handle.',
        ],
      },
    ],
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1Y',  type: 'output' },
      { pin:  4, name: '2A',  type: 'input'  },
      { pin:  5, name: '2B',  type: 'input'  },
      { pin:  6, name: '2Y',  type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '3Y',  type: 'output' },
      { pin:  9, name: '3A',  type: 'input'  },
      { pin: 10, name: '3B',  type: 'input'  },
      { pin: 11, name: '4Y',  type: 'output' },
      { pin: 12, name: '4A',  type: 'input'  },
      { pin: 13, name: '4B',  type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'AND', inputs: ['1A','1B'], output: '1Y' },
      { type: 'AND', inputs: ['2A','2B'], output: '2Y' },
      { type: 'AND', inputs: ['3A','3B'], output: '3Y' },
      { type: 'AND', inputs: ['4A','4B'], output: '4Y' },
    ],
  },

  // 74x1010: Triple 3-input NAND gate driver (14-pin)
  '74x1010': {
    name: '74x1010',
    simpleName: 'Triple 3-Input NAND Gate Driver',
    description: 'Triple 3-input NAND gate with high drive outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['nand', 'gate', 'triple', 'driver'],
    guideOverview: 'The 74x1010 contains three independent 3 input NAND buffer/driver stages. A three input NAND outputs LOW only when all three inputs are simultaneously HIGH, making it useful for gate functions that need a third control or enable signal before an action is blocked. The driver outputs supply stronger current than a minimal logic gate, which helps when one gate must feed multiple TTL loads on a breadboard.',
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1B',  type: 'input'  },
      { pin:  3, name: '1C',  type: 'input'  },
      { pin:  4, name: '1Y',  type: 'output' },
      { pin:  5, name: '2A',  type: 'input'  },
      { pin:  6, name: '2B',  type: 'input'  },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '2C',  type: 'input'  },
      { pin:  9, name: '2Y',  type: 'output' },
      { pin: 10, name: '3A',  type: 'input'  },
      { pin: 11, name: '3B',  type: 'input'  },
      { pin: 12, name: '3C',  type: 'input'  },
      { pin: 13, name: '3Y',  type: 'output' },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A','1B','1C'], output: '1Y' },
      { type: 'NAND', inputs: ['2A','2B','2C'], output: '2Y' },
      { type: 'NAND', inputs: ['3A','3B','3C'], output: '3Y' },
    ],
  },
};