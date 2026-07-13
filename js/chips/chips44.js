// Chip definitions block 44
// Chips: 74907-74910, 74913-74915, 74918, 74920-74923, 74925-74928

export const CHIPS_BLOCK_44 = {

  // 74907: Hex open drain p-channel buffers (14-pin)
  '74x907': {
    name: '74x907',
    simpleName: 'Hex Open Drain P-Channel Buffer',
    description: 'Hex open drain p-channel buffers (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    openCollector: true,
    datasheet: '',
    tags: ['buffer', 'hex', 'open drain', 'pmos'],
    guideOverview: 'The 74x907 is a hex open drain p-channel buffer. Six BUFFER channels pass their input without inversion, but each output is an open drain p-channel transistor that can only pull the output HIGH (toward VCC), not drive it LOW. An external pull down resistor is required. Multiple 74x907 outputs can share a wired AND bus line where the line is pulled LOW only when all drivers allow it.',
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
      { type: 'BUFFER', inputs: ['1A'], output: '1Y' },
      { type: 'BUFFER', inputs: ['2A'], output: '2Y' },
      { type: 'BUFFER', inputs: ['3A'], output: '3Y' },
      { type: 'BUFFER', inputs: ['4A'], output: '4Y' },
      { type: 'BUFFER', inputs: ['5A'], output: '5Y' },
      { type: 'BUFFER', inputs: ['6A'], output: '6Y' },
    ],
  },

  // 74908: Dual 2 input NAND 30V/250mA relay driver (8-pin)
  '74x908': {
    name: '74x908',
    simpleName: 'Dual 2 Input NAND Relay Driver',
    description: 'Dual 2 input NAND 30V/250mA relay driver (8-pin)',
    pins: 8, vcc: 8, gnd: 4,
    datasheet: '',
    tags: ['nand', 'gate', 'relay', 'driver'],
    guideOverview: 'The 74x908 is a dual 2-input NAND gate with high voltage (30V) high current (250mA) output drivers designed to switch relays, solenoids, or other inductive loads directly. Each gate produces a LOW only when both inputs are HIGH. The heavy duty open collector outputs replace the need for separate transistor driver stages when controlling electromechanical loads.',
    pinout: [
      { pin: 1, name: '1A',  type: 'input'  },
      { pin: 2, name: '1B',  type: 'input'  },
      { pin: 3, name: '1Y',  type: 'output' },
      { pin: 4, name: 'GND', type: 'power'  },
      { pin: 5, name: '2Y',  type: 'output' },
      { pin: 6, name: '2A',  type: 'input'  },
      { pin: 7, name: '2B',  type: 'input'  },
      { pin: 8, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A','1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A','2B'], output: '2Y' },
    ],
  },

  // 74909: Quad voltage comparator, analog input, OC output (14-pin)
  '74x909': {
    name: '74x909',
    simpleName: 'Quad Voltage Comparator (OC)',
    description: 'Quad voltage comparator, open-collector outputs (14-pin)',
    pins: 14, vcc: 14, gnd: 7,
    openCollector: true,
    datasheet: '',
    tags: ['comparator', 'analog', 'quad', 'open collector', 'stub'],
    guideOverview: 'The 74x909 is a quad voltage comparator with open collector outputs. Each of the four channels drives its output LOW when the non inverting input (IN+) is below the inverting input (IN-); otherwise the output is high impedance. An external pull up resistor is required to pull the output HIGH. Use for threshold detection, window detectors, zero crossing detection, and interfacing analog signals to digital logic.',
    pinout: [
      { pin:  1, name: '1IN+',type: 'input'  },
      { pin:  2, name: '1IN-',type: 'input'  },
      { pin:  3, name: '1OUT',type: 'output' },
      { pin:  4, name: '2IN+',type: 'input'  },
      { pin:  5, name: '2IN-',type: 'input'  },
      { pin:  6, name: '2OUT',type: 'output' },
      { pin:  7, name: 'GND', type: 'power'  },
      { pin:  8, name: '3OUT',type: 'output' },
      { pin:  9, name: '3IN-',type: 'input'  },
      { pin: 10, name: '3IN+',type: 'input'  },
      { pin: 11, name: '4OUT',type: 'output' },
      { pin: 12, name: '4IN-',type: 'input'  },
      { pin: 13, name: '4IN+',type: 'input'  },
      { pin: 14, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['1IN+','1IN-','2IN+','2IN-','3IN+','3IN-','4IN+','4IN-'], outputs: ['1OUT','2OUT','3OUT','4OUT'] },
    ],
  },

  // 74910: 256 bit RAM (64x4), three state (18-pin)
  '74x910': {
    name: '74x910',
    simpleName: '256 bit RAM 64x4 (TRI)',
    description: '256-bit RAM, 64 words x 4 bits, 3-state outputs (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: '',
    tags: ['ram', 'memory', '256 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x910 is a 256 bit static RAM organized as 64 words by 4 bits with 3-state outputs. Address inputs A0 A5 select one of 64 word locations. WEn (active LOW) writes the four data bits D0-D3 into the selected location; OEn (active LOW) drives the stored data onto the shared D0-D3 bidirectional pins. When both WEn and OEn are HIGH, outputs are in high impedance for bus sharing.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'WEn', type: 'input'  },
      { pin:  8, name: 'OEn', type: 'input'  },
      { pin:  9, name: 'GND', type: 'power'  },
      { pin: 10, name: 'D0',  type: 'bidir'  },
      { pin: 11, name: 'D1',  type: 'bidir'  },
      { pin: 12, name: 'D2',  type: 'bidir'  },
      { pin: 13, name: 'D3',  type: 'bidir'  },
      { pin: 14, name: 'NC',  type: 'nc'     },
      { pin: 15, name: 'NC2', type: 'nc'     },
      { pin: 16, name: 'NC3', type: 'nc'     },
      { pin: 17, name: 'NC4', type: 'nc'     },
      { pin: 18, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','A4','A5','WEn','OEn'], outputs: [] },
    ],
  },

  // 74913: 6-digit BCD display controller and driver (24-pin)
  //
  // LEFT AS A STUB ON PURPOSE — no datasheet with a verifiable pinout exists.
  // The 74C9xx LED-display-controller family is real and well documented, but it
  // is 911 / 912 / 915 / 917, NOT 913: the MM74C911 (4-digit), MM74C912 (6-digit
  // BCD, +DP), MM74C917 (6-digit HEX, +DP) and MM74C915 (7-seg→BCD) all carry
  // full datasheets, while "74C913" appears ONLY as a cross-reference line in the
  // Towers' International Digital IC Selector — a third-party guide known to list
  // announced-but-unproduced and mis-transcribed parts. It is absent from the
  // index AND the body of both the 1981 and 1984 National CMOS Databooks (each of
  // which prints the 911/912/917 and 915 datasheets). No 913-specific datasheet
  // survives on bitsavers, alldatasheet, datasheetcatalog, digchip or any vendor
  // mirror (June 2026 search).
  //
  // The core digital function is fully modelable — I read the MM74C912 datasheet
  // end to end (write one of six 5-bit registers via /CE,/WE + K1..K3 address with
  // BCD data on A..D+DP; an internal oscillator self-scans the six digit-enable
  // outputs D1..D6 and a ROM 7-seg decoder drives /Sa../Sg via 3-state segment
  // drivers gated by /SOE; oscillator gated by /OSE). Modelability is NOT the
  // blocker. The blocker is the PINOUT: the 913 is supposedly the no-DP 24-pin
  // variant, but with no 913 datasheet its 24-pin terminal assignment cannot be
  // established, and the existing hand-entered map (D0..D3 / CLK / LD / RST / DIS /
  // MSB / COL — a serial-load, single-digit-select, colon-driving part) matches NO
  // real member of this family: the real parts have no serial/clock/load/reset
  // interface, no colon, and bring out six separate digit lines. Per C2 (the
  // CD4082 lesson — never ship a hand-entered or sibling pinout), placing a chip a
  // student might wire on a breadboard onto an invented map is worse than a clearly
  // labelled info-sheet stub, so the entry stays GENERIC_STUB / tags:['stub'].
  // Same situation/resolution as issues.md C45 (74x419), C50 (74x9164), C56
  // (74x701). See issues.md C63.
  //
  // Sources:
  //   Fairchild Semiconductor, "MM74C912 6-Digit BCD Display Controller/Driver,"
  //     datasheet DS005916 (Oct. 1987, rev. Jan. 1999). [Online]. Available:
  //     https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/MM74C912.pdf.
  //     Verified: connection diagram (28-pin DIP), Input Control + Output Control
  //     truth tables, character-font table and block diagram, pages 1-3, read as
  //     rendered PDF page images (issues.md C4). Establishes the family's actual
  //     architecture; confirms the existing stub pinout is fabricated.
  //   National Semiconductor, "CMOS Databook," 1981 ed., §2 (Special Function/LSI),
  //     pp. 2-20..2-36. [Online]. Available:
  //     https://www.bitsavers.org/components/national/_dataBooks/1981_Natonal_CMOS_Databook.pdf.
  //     Verified: device index + the MM74C911/912/917 and MM74C915 datasheet pages;
  //     no MM74C913 listed.
  //   National Semiconductor, "CMOS Databook," 1984 ed. [Online]. Available:
  //     http://www.bitsavers.org/components/national/_dataBooks/1984_CMOS_Databook.pdf.
  //     Verified: full-text search for "74C913" returns zero hits (911/912/915/917
  //     present); the part still does not exist three years later.
  //   Towers' International Digital IC Selector. [Online, scan]. Available:
  //     https://device.report/m/7e6da97bfa8959fb7fac4613081107c77286e5b423503b411715157ac01262a9.
  //     The sole source that lists "MM74C913" at all — a cross-reference guide,
  //     not a datasheet; insufficient for a verifiable pinout.
  '74x913': {
    name: '74x913',
    simpleName: '6-Digit BCD Display Controller',
    description: '6-digit BCD display controller and driver, no decimal point (24-pin)',
    pins: 24, vcc: 24, gnd: 12,
    datasheet: '',
    tags: ['display', 'bcd', '7 segment', 'driver', 'stub'],
    sequential: true,
    guideOverview: 'The 74x913 is a 6-digit BCD display controller and driver. Four bit BCD digits are loaded serially via D0-D3 and CLK into internal storage registers, latched on LD, and reset on RST. The chip multiplexes 7 segment outputs a g across the six display positions: DIS sequences through digit select signals, and COL drives a colon indicator. MSB controls most significant digit blanking. Use with a time multiplexed 7 segment LED display for numeric readouts.',
    pinout: [
      { pin:  1, name: 'D0',   type: 'input'  },
      { pin:  2, name: 'D1',   type: 'input'  },
      { pin:  3, name: 'D2',   type: 'input'  },
      { pin:  4, name: 'D3',   type: 'input'  },
      { pin:  5, name: 'CLK',  type: 'input'  },
      { pin:  6, name: 'LD',   type: 'input'  },
      { pin:  7, name: 'RST',  type: 'input'  },
      { pin:  8, name: 'DIS',  type: 'output' },
      { pin:  9, name: 'a',    type: 'output' },
      { pin: 10, name: 'b',    type: 'output' },
      { pin: 11, name: 'c',    type: 'output' },
      { pin: 12, name: 'GND',  type: 'power'  },
      { pin: 13, name: 'd',    type: 'output' },
      { pin: 14, name: 'e',    type: 'output' },
      { pin: 15, name: 'f',    type: 'output' },
      { pin: 16, name: 'g',    type: 'output' },
      { pin: 17, name: 'MSB',  type: 'input'  },
      { pin: 18, name: 'COL',  type: 'output' },
      { pin: 19, name: 'NC',   type: 'nc'     },
      { pin: 20, name: 'NC2',  type: 'nc'     },
      { pin: 21, name: 'NC3',  type: 'nc'     },
      { pin: 22, name: 'NC4',  type: 'nc'     },
      { pin: 23, name: 'NC5',  type: 'nc'     },
      { pin: 24, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['D0','D1','D2','D3','CLK','LD','RST','MSB'], outputs: ['DIS','a','b','c','d','e','f','g','COL'] },
    ],
  },

  // 74914: Hex inverter gate, Schmitt trigger inputs (14-pin)
  '74x914': {
    name: '74x914',
    simpleName: 'Hex Schmitt Trigger Inverter',
    description: 'Hex inverter gate with Schmitt trigger inputs (14-pin)',
    schmittInputs: true,
    pins: 14, vcc: 14, gnd: 7,
    datasheet: '',
    tags: ['inverter', 'schmitt trigger', 'hex'],
    guideOverview: 'The 74x914 is a hex Schmitt trigger inverter. Six NOT gates each produce a logic inverted output, but the inputs use a hysteresis threshold: the output switches HIGH to LOW at an upper trigger level and switches back LOW to HIGH at a lower level. This prevents chattering and false transitions on slow slewing, noisy, or bouncing inputs. Drop-in replacement for a standard hex inverter (74x04) when input signal quality is poor.',
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

  // 74915: 7-segment-to-BCD converter, TRI-STATE (18-pin) = National MM74C915.
  // Source: National Semiconductor, "MM54C915/MM74C915 7-Segment-to-BCD
  //   Converter", in CMOS Databook (1981), pp. 2-36..2-38. [Online]. Available:
  //   https://www.bitsavers.org/components/national/_dataBooks/1981_Natonal_CMOS_Databook.pdf .
  //   Verified: General Description, Logic and Connection Diagram (18-pin DIP,
  //   TOP VIEW), and the Truth Table, read as 300-dpi rendered PDF page images
  //   (issues.md C4 — the text summarizer mangles these pages). Terminal
  //   assignment: 1=d, 2=e, 3=f, 4=g (segment inputs), 5=ERROR OUT, 6=OE (output
  //   enable, active LOW), 7=A(2^0), 8=B(2^1), 9=GND, 10=C(2^2), 11=D(2^3),
  //   12=LE (latch enable), 13=MINUS OUT, 14=INVERT/NON-INVERT control, 15=a,
  //   16=b, 17=c (segment inputs), 18=VCC. The pre-existing stub pinout (segments
  //   a..g on 1..7, single OEn on 8, BCD Q0..Q3 on 10..13, INV on 14, NCs on
  //   15..17) was hand-entered and wrong on every functional pin; corrected
  //   against the datasheet, not cloned from a sibling (issues.md C2).
  // Behaviour (Truth Table, p.2-38): the seven segments are decoded back to BCD.
  //   The standard digit shapes 0-9 decode to 0000..1001 with ERROR=0, MINUS=0;
  //   the table shows two accepted glyphs each for 1, 6 and 9. A blank display
  //   (no segments lit) gives BCD 1111 with ERROR=0. The minus code (segment g
  //   only) drives ERROR=1 and MINUS=1. Any other pattern drives ERROR=1,
  //   MINUS=0. On any ERROR (minus included) the four BCD outputs go to
  //   TRI-STATE; OE HIGH also forces them to TRI-STATE; ERROR and MINUS stay
  //   driven. INVERT control: LOW = segment inputs active HIGH (HIGH = lit),
  //   HIGH = active LOW. LE LOW = flow-through, LE HIGH = outputs latched. New
  //   SEG7_TO_BCD_915 engine primitive (the inverse of the BCD_7SEG decoder; no
  //   existing primitive performs segment->BCD decode with the error/minus/latch
  //   behaviour). Standard-form digit segment sets are universal 7-seg encodings;
  //   the alternate forms for 1/6/9 were read from the paired truth-table glyphs.
  '74x915': {
    name: '74x915',
    simpleName: '7 Segment to BCD Converter (TRI)',
    description: '7 segment to BCD converter with three state outputs (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    sequential: true,
    datasheet: '',
    tags: ['decoder', '7 segment', 'bcd', 'tri state'],
    guideOverview: 'The 74x915 runs a 7-segment display backwards: it reads the seven segment lines a-g and works out which BCD digit they spell. The four BCD outputs are A (2^0) through D (2^3). The INVERT control sets the input polarity: LOW means a segment counts as lit when its input is HIGH, HIGH means lit when the input is LOW, so the chip can read either common-cathode or common-anode style drive. A blank display (no segments lit) reads as 1111. The ERROR output goes HIGH whenever the pattern is not a valid digit; when that happens the BCD outputs are switched to high-impedance, so you can tie them through resistors to your own error code. The minus sign (segment g alone) is treated as an error too, but also raises the separate MINUS output, handy as a flag or interrupt. LE LOW passes data straight through; LE HIGH latches the last result. OE (active LOW) is the output enable for the BCD pins.',
    pinout: [
      { pin:  1, name: 'd',     type: 'input'  },
      { pin:  2, name: 'e',     type: 'input'  },
      { pin:  3, name: 'f',     type: 'input'  },
      { pin:  4, name: 'g',     type: 'input'  },
      { pin:  5, name: 'ERROR', type: 'output' },
      { pin:  6, name: 'OEn',   type: 'input'  },
      { pin:  7, name: 'A',     type: 'output' },
      { pin:  8, name: 'B',     type: 'output' },
      { pin:  9, name: 'GND',   type: 'power'  },
      { pin: 10, name: 'C',     type: 'output' },
      { pin: 11, name: 'D',     type: 'output' },
      { pin: 12, name: 'LE',    type: 'input'  },
      { pin: 13, name: 'MINUS', type: 'output' },
      { pin: 14, name: 'INV',   type: 'input'  },
      { pin: 15, name: 'a',     type: 'input'  },
      { pin: 16, name: 'b',     type: 'input'  },
      { pin: 17, name: 'c',     type: 'input'  },
      { pin: 18, name: 'VCC',   type: 'power'  },
    ],
    gates: [
      { type: 'SEG7_TO_BCD_915',
        inputs: ['a','b','c','d','e','f','g','INV','LE','OEn'],
        outputs: ['A','B','C','D','ERROR','MINUS'] },
    ],
  },

  // 74918: Dual 2-input NAND 30V/250mA relay driver (14-pin) = National MM74C918
  // Source: National Semiconductor, "MM74C908, MM74C918 Dual CMOS 30-Volt Driver",
  //   in Interface Databook (1979), p. 9-25. [Online]. Available:
  //   https://xdevs.com/doc/eBooks/Interface%20Databook%201979_text.pdf .
  //   Verified: general description ("two CMOS NAND gates driving an emitter-follower
  //   darlington output") + the MM74C918N (NS package N14A) connection diagram, read
  //   as a 600-dpi rendered PDF page image (issues.md C4). 14-pin terminal assignment:
  //   1=IN(gate A), 2=V_OUT A, 3/4/5=Vcc, 6=V_OUT B, 7=IN(gate B), 8=IN(gate B),
  //   9=GND, 10/11/12=Vcc, 13=NC, 14=IN(gate A). Six Vcc pins (high source current),
  //   one GND. Logic per driver = NAND: the darlington sources current to the load
  //   when NOT both inputs are HIGH, so the output follows the NAND of its two inputs.
  //   The pre-existing stub pinout (GND=7, VCC=14, pins 1-4 missing) was hand-entered
  //   and wrong; corrected against the datasheet, not cloned (issues.md C2).
  '74x918': {
    name: '74x918',
    simpleName: 'Dual 2 Input NAND Relay Driver (14-pin)',
    description: 'Dual 2 input NAND 30V/250mA relay driver (14-pin)',
    pins: 14, vcc: 3, gnd: 9,
    datasheet: '',
    tags: ['nand', 'gate', 'relay', 'driver'],
    guideOverview: 'The 74x918 is the 14-pin version of the 74x908: two 2-input NAND gates, each driving a high-current output that can switch 30V at 250mA. That output stage is meant to drive loads ordinary logic cannot   relays, solenoids, small lamps. Each NAND output is LOW only when both of its inputs are HIGH; the rest of the time the driver sources current to the load. Inputs for the first gate are on pins 1 and 14 (output on pin 2); the second gate is on pins 7 and 8 (output on pin 6). The high source current is why six pins (3, 4, 5, 10, 11, 12) are all tied to VCC; pin 9 is the single ground, and pin 13 is the only no-connect.',
    pinout: [
      { pin:  1, name: '1A',  type: 'input'  },
      { pin:  2, name: '1Y',  type: 'output' },
      { pin:  3, name: 'VCC', type: 'power'  },
      { pin:  4, name: 'VCC', type: 'power'  },
      { pin:  5, name: 'VCC', type: 'power'  },
      { pin:  6, name: '2Y',  type: 'output' },
      { pin:  7, name: '2A',  type: 'input'  },
      { pin:  8, name: '2B',  type: 'input'  },
      { pin:  9, name: 'GND', type: 'power'  },
      { pin: 10, name: 'VCC', type: 'power'  },
      { pin: 11, name: 'VCC', type: 'power'  },
      { pin: 12, name: 'VCC', type: 'power'  },
      { pin: 13, name: 'NC',  type: 'nc'     },
      { pin: 14, name: '1B',  type: 'input'  },
    ],
    gates: [
      { type: 'NAND', inputs: ['1A','1B'], output: '1Y' },
      { type: 'NAND', inputs: ['2A','2B'], output: '2Y' },
    ],
  },

  // 74920: 1024 bit RAM (256x4), TRI, separate I/O (22-pin)
  '74x920': {
    name: '74x920',
    simpleName: '1024 bit RAM 256x4 (TRI, Sep I/O)',
    description: '1024-bit RAM, 256 words x 4 bits, 3-state, separate I/O (22-pin)',
    pins: 22, vcc: 22, gnd: 12,
    datasheet: '',
    tags: ['ram', 'memory', '1024 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x920 is a 1024 bit static RAM organized as 256 words by 4 bits with 3-state outputs and separate data input (DI0-DI3) and output (DO0-DO3) pins. Address inputs A0 A7 select one of 256 locations. WEn (active LOW) writes the DI inputs into the addressed location; OEn (active LOW) enables the DO outputs; CSn (chip select, active LOW) enables the device. Separate I/O pins prevent bus contention and allow simultaneous data setup and readback.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'A6',  type: 'input'  },
      { pin:  8, name: 'A7',  type: 'input'  },
      { pin:  9, name: 'WEn', type: 'input'  },
      { pin: 10, name: 'OEn', type: 'input'  },
      { pin: 11, name: 'CSn', type: 'input'  },
      { pin: 12, name: 'GND', type: 'power'  },
      { pin: 13, name: 'DI0', type: 'input'  },
      { pin: 14, name: 'DI1', type: 'input'  },
      { pin: 15, name: 'DI2', type: 'input'  },
      { pin: 16, name: 'DI3', type: 'input'  },
      { pin: 17, name: 'DO0', type: 'output' },
      { pin: 18, name: 'DO1', type: 'output' },
      { pin: 19, name: 'DO2', type: 'output' },
      { pin: 20, name: 'DO3', type: 'output' },
      { pin: 21, name: 'NC',  type: 'nc'     },
      { pin: 22, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','WEn','OEn','CSn','DI0','DI1','DI2','DI3'], outputs: ['DO0','DO1','DO2','DO3'] },
    ],
  },

  // 74921: 1024 bit RAM (256x4), TRI (18-pin)
  '74x921': {
    name: '74x921',
    simpleName: '1024 bit RAM 256x4 (TRI)',
    description: '1024-bit RAM, 256 words x 4 bits, 3-state outputs (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: '',
    tags: ['ram', 'memory', '1024 bit', 'tri state', 'stub'],
    sequential: true,
    guideOverview: 'The 74x921 is a 1024 bit static RAM organized as 256 words by 4 bits with 3-state outputs and common bidirectional data pins D0-D3. Address inputs A0 A7 select one of 256 memory locations. WEn (active LOW) writes the data present on D0-D3 into the addressed word; OEn (active LOW) drives the stored data onto the D0-D3 pins. Compared to the 74x920, the shared I/O pins reduce pin count but require careful bus management to avoid write/read contention.',
    pinout: [
      { pin:  1, name: 'A0',  type: 'input'  },
      { pin:  2, name: 'A1',  type: 'input'  },
      { pin:  3, name: 'A2',  type: 'input'  },
      { pin:  4, name: 'A3',  type: 'input'  },
      { pin:  5, name: 'A4',  type: 'input'  },
      { pin:  6, name: 'A5',  type: 'input'  },
      { pin:  7, name: 'A6',  type: 'input'  },
      { pin:  8, name: 'A7',  type: 'input'  },
      { pin:  9, name: 'GND', type: 'power'  },
      { pin: 10, name: 'WEn', type: 'input'  },
      { pin: 11, name: 'OEn', type: 'input'  },
      { pin: 12, name: 'D0',  type: 'bidir'  },
      { pin: 13, name: 'D1',  type: 'bidir'  },
      { pin: 14, name: 'D2',  type: 'bidir'  },
      { pin: 15, name: 'D3',  type: 'bidir'  },
      { pin: 16, name: 'NC',  type: 'nc'     },
      { pin: 17, name: 'NC2', type: 'nc'     },
      { pin: 18, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'GENERIC_STUB', inputs: ['A0','A1','A2','A3','A4','A5','A6','A7','WEn','OEn'], outputs: [] },
    ],
  },

  // 74922: 16-key encoder, TRI (18-pin). MM74C922.
  // Source: Fairchild Semiconductor, "MM74C922 / MM74C923 16-Key Encoder /
  //   20-Key Encoder", DS006037 (Oct 1987, rev. Apr 2001).
  //   [Online]. Available:
  //   https://ece-classes.usc.edu/ee459/library/datasheets/MM74C922.pdf
  //   Verified: 18-pin DIP terminal assignment (p.1) — the hand-entered stub
  //   pinout was wrong (rows/cols/data on invented pins; issues.md C2). Real
  //   map: 1-4 ROW Y1-Y4, 5 OSCILLATOR, 6 KEYBOUNCE MASK, 7 COLUMN X4,
  //   8 COLUMN X3, 9 GND, 10 COLUMN X2, 11 COLUMN X1, 12 DATA AVAILABLE,
  //   13 OUTPUT ENABLE, 14-17 DATA OUT D/C/B/A, 18 VCC. Truth Tables (p.2),
  //   Block Diagram (p.3), Theory of Operation (p.8) also read as PDF page
  //   images. Engine: KEY_ENCODER_SCAN (see js/specificChipsSim.js).
  '74x922': {
    name: '74x922',
    simpleName: '16-Key Encoder (TRI)',
    description: '16-key encoder with three state outputs (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: 'https://ece-classes.usc.edu/ee459/library/datasheets/MM74C922.pdf',
    tags: ['encoder', 'keyboard', '16-key', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x922 reads a 4×4 grid of 16 push buttons and turns whichever one is pressed into a 4-bit number. It does this by scanning: OSC clocks an internal counter that drives the four column outputs C1–C4 LOW one at a time, while the four row inputs R1–R4 watch for a button connecting a row to the column that is currently LOW. When it finds one, it stops scanning on that column, works out the key from the row and column, puts the 4-bit code on A–D, and drives DA (data available) HIGH. The code stays on the outputs even after the key is released; only DA drops. OEn (active LOW) gates the 3-state code outputs A–D so several encoders can share one bus. R1–R4 have internal pull-ups, so an unpressed row reads HIGH on its own. KBM is the debounce-capacitor pin on the real chip and has no effect in the simulator.',
    pinout: [
      { pin:  1, name: 'R1',   type: 'input'  },
      { pin:  2, name: 'R2',   type: 'input'  },
      { pin:  3, name: 'R3',   type: 'input'  },
      { pin:  4, name: 'R4',   type: 'input'  },
      { pin:  5, name: 'OSC',  type: 'input'  },
      { pin:  6, name: 'KBM',  type: 'input'  },
      { pin:  7, name: 'C4',   type: 'output' },
      { pin:  8, name: 'C3',   type: 'output' },
      { pin:  9, name: 'GND',  type: 'power'  },
      { pin: 10, name: 'C2',   type: 'output' },
      { pin: 11, name: 'C1',   type: 'output' },
      { pin: 12, name: 'DA',   type: 'output' },
      { pin: 13, name: 'OEn',  type: 'input'  },
      { pin: 14, name: 'D',    type: 'output' },
      { pin: 15, name: 'C',    type: 'output' },
      { pin: 16, name: 'B',    type: 'output' },
      { pin: 17, name: 'A',    type: 'output' },
      { pin: 18, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'KEY_ENCODER_SCAN', inputs: ['R1','R2','R3','R4','OSC','OEn'], outputs: ['C1','C2','C3','C4','DA','A','B','C','D'] },
    ],
  },

  // 74923: 20-key encoder, TRI (20-pin) — the 5-row sibling of the 74x922.
  // Source: Fairchild Semiconductor, "MM74C922 / MM74C923 16-Key Encoder /
  //   20-Key Encoder", DS006037 (Oct 1987, rev. Apr 2001).
  //   [Online]. Available:
  //   https://ece-classes.usc.edu/ee459/library/datasheets/MM74C922.pdf
  //   Verified: MM74C923 DIP terminal assignment (p.2 "Pin Assignment for DIP
  //   and SOIC Package") + Truth Tables for positions 0–19 (p.2), read as
  //   300-dpi PDF page images (issues.md C4 — the text summarizer hallucinates
  //   these pinouts). The hand-entered stub pinout was wrong from pin 6 on
  //   (columns/OSC/KBM/DA/data on invented pins; issues.md C2). Real DIP map:
  //   1-5 ROW Y1-Y5, 6 OSCILLATOR, 7 KEYBOUNCE MASK, 8 COLUMN X4, 9 COLUMN X3,
  //   10 GND, 11 COLUMN X2, 12 COLUMN X1, 13 DATA AVAILABLE, 14 OUTPUT ENABLE,
  //   15-19 DATA OUT E/D/C/B/A, 20 VCC. Truth table confirms the engine's
  //   encoding code = column(X-1, 0-3) | (row(Y-1, 0-4) << 2), A = LSB.
  //   Engine: KEY_ENCODER_SCAN (shared with the 74x922; the primitive derives
  //   row count from gate.inputs.length and already covers the 5-row '923).
  '74x923': {
    name: '74x923',
    simpleName: '20-Key Encoder (TRI)',
    description: '20-key encoder with three state outputs (20-pin)',
    pins: 20, vcc: 20, gnd: 10,
    datasheet: 'https://ece-classes.usc.edu/ee459/library/datasheets/MM74C922.pdf',
    tags: ['encoder', 'keyboard', '20-key', 'tri state'],
    sequential: true,
    guideOverview: 'The 74x923 reads a 4×5 grid of 20 push buttons and turns whichever one is pressed into a 5-bit number. It works by scanning: OSC clocks an internal counter that drives the four column outputs C1–C4 LOW one at a time, while the five row inputs R1–R5 watch for a button connecting a row to the column that is currently LOW. When it finds one, it stops scanning on that column, works out the key from the row and column, puts the 5-bit code on A–E, and drives DA (data available) HIGH. The code stays on the outputs even after the key is released; only DA drops. OEn (active LOW) gates the 3-state code outputs A–E so several encoders can share one bus. R1–R5 have internal pull-ups, so an unpressed row reads HIGH on its own. KBM is the debounce-capacitor pin on the real chip and has no effect in the simulator. This is the 20-key version of the 16-key 74x922.',
    pinout: [
      { pin:  1, name: 'R1',   type: 'input'  },
      { pin:  2, name: 'R2',   type: 'input'  },
      { pin:  3, name: 'R3',   type: 'input'  },
      { pin:  4, name: 'R4',   type: 'input'  },
      { pin:  5, name: 'R5',   type: 'input'  },
      { pin:  6, name: 'OSC',  type: 'input'  },
      { pin:  7, name: 'KBM',  type: 'input'  },
      { pin:  8, name: 'C4',   type: 'output' },
      { pin:  9, name: 'C3',   type: 'output' },
      { pin: 10, name: 'GND',  type: 'power'  },
      { pin: 11, name: 'C2',   type: 'output' },
      { pin: 12, name: 'C1',   type: 'output' },
      { pin: 13, name: 'DA',   type: 'output' },
      { pin: 14, name: 'OEn',  type: 'input'  },
      { pin: 15, name: 'E',    type: 'output' },
      { pin: 16, name: 'D',    type: 'output' },
      { pin: 17, name: 'C',    type: 'output' },
      { pin: 18, name: 'B',    type: 'output' },
      { pin: 19, name: 'A',    type: 'output' },
      { pin: 20, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'KEY_ENCODER_SCAN', inputs: ['R1','R2','R3','R4','R5','OSC','OEn'], outputs: ['C1','C2','C3','C4','DA','A','B','C','D','E'] },
    ],
  },

  // 74925 (MM74C925): 4-decade counter (0000–9999) + multiplexed 7-segment display
  // driver, 16-pin DIP. The family base part: the '926 adds a carry-out and a
  // display-select pin, the '928 makes the top digit divide-by-2; the '925 has
  // neither extra pin. Reuses the family primitive COUNTER_DISPLAY_4DIGIT_928 with
  // gate.maxCount:9999 and no DS input / no CO output.
  // Source: Fairchild Semiconductor, "MM74C925 / MM74C926 / MM74C927 / MM74C928
  //   4-Digit Counters with Multiplexed 7-Segment Output Drivers", DS005919
  //   (Oct 1987, rev. Jan 1999). [Online]. Available:
  //   https://pdf.datasheet.live/3e8c607b/fairchildsemi.com/74C925.pdf (TI/Fairchild
  //   reprint; the jameco.com 44599.pdf mirror is Cloudflare-gated). Verified: the
  //   MM74C925 16-pin Connection Diagram (Top View, p.2) + Functional Description
  //   + MM74C925 logic diagram (p.2), read as 300-dpi PDF page images (issues.md
  //   C4). Terminal assignment: d1 e2 f3 g4, LATCH ENABLE 5, A_OUT 6, B_OUT 7,
  //   GND 8, C_OUT 9, D_OUT 10, CLOCK 11, RESET 12, a13 b14 c15, VCC 16. This
  //   corrects the prior hand-entered stub, which put CLK/RST/LE on pins 1–3 and
  //   the segments on 4–11 — a C2-class pinout error (only VCC=16/GND=8 were right).
  '74x925': {
    name: '74x925',
    simpleName: '4-Digit Counter/Display Driver',
    description: '4-digit decade counter/display driver (up to 9999) (16-pin)',
    pins: 16, vcc: 16, gnd: 8,
    datasheet: 'https://pdf.datasheet.live/3e8c607b/fairchildsemi.com/74C925.pdf',
    tags: ['counter', 'display', 'driver', '4-digit', 'decade'],
    sequential: true,
    guideOverview: 'The 74x925 counts from 0 to 9999 and drives a 4-digit 7-segment display. CLK advances the counter on its falling edge; RST forces the count back to 0 (asynchronous, active HIGH). LE controls an internal latch: HIGH lets it follow the count, LOW freezes the last value so the display stays still while the counter keeps running underneath. The seven segment lines a-g are shared by all four digits and lit one digit at a time; D1-D4 say which digit is active right now, so an external display cycles through them fast enough to look continuous. D1 is the units digit, D4 the thousands digit. Unlike the 74x926/928 this part has no carry-out and no display-select pin, so the display always shows the latched value.',
    pinout: [
      { pin:  1, name: 'd',    type: 'output' },
      { pin:  2, name: 'e',    type: 'output' },
      { pin:  3, name: 'f',    type: 'output' },
      { pin:  4, name: 'g',    type: 'output' },
      { pin:  5, name: 'LE',   type: 'input'  },
      { pin:  6, name: 'D1',   type: 'output' },
      { pin:  7, name: 'D2',   type: 'output' },
      { pin:  8, name: 'GND',  type: 'power'  },
      { pin:  9, name: 'D3',   type: 'output' },
      { pin: 10, name: 'D4',   type: 'output' },
      { pin: 11, name: 'CLK',  type: 'input'  },
      { pin: 12, name: 'RST',  type: 'input'  },
      { pin: 13, name: 'a',    type: 'output' },
      { pin: 14, name: 'b',    type: 'output' },
      { pin: 15, name: 'c',    type: 'output' },
      { pin: 16, name: 'VCC',  type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_DISPLAY_4DIGIT_928', maxCount: 9999,
        inputs: ['CLK', 'RST', 'LE'],
        outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'D1', 'D2', 'D3', 'D4'] },
    ],
  },

  // 74926 (MM74C926): 4-digit decade counter + multiplexed 7-segment display
  // driver, 18-pin DIP. Counts 0–9999; adds a display select and a cascade
  // carry-out over the 16-pin '925.
  // Source: Fairchild Semiconductor, "MM74C925 / MM74C926 / MM74C927 / MM74C928
  //   4-Digit Counters with Multiplexed 7-Segment Output Drivers", DS005919
  //   (Oct 1987, rev. Jan 1999). [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/MM74C925-28.pdf
  //   Verified: 18-pin terminal assignment (Connection Diagrams p.2, shared by
  //   '926/'927/'928 + MM74C926 logic diagram p.3), Functional Description p.2,
  //   General Description p.1 — read as 300-dpi PDF page images (issues.md C4).
  //   Corrects the prior hand-entered stub, which had it as a 16-pin part with no
  //   DISPLAY SELECT or CARRY-OUT pin — that 16-pin layout is the '925's, not the
  //   '926's (issues.md C2, the CD4082 lesson).
  '74x926': {
    name: '74x926',
    simpleName: '4-Digit Decade Counter/Display Driver',
    description: '4-digit decade counter/display driver, carry-out + latch (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: 'https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/MM74C925-28.pdf',
    tags: ['counter', 'display', 'driver', '4-digit', 'decade'],
    sequential: true,
    guideOverview: 'The 74x926 counts from 0 to 9999 and drives a 4-digit 7-segment display. All four digits divide by 10, so the largest reading is 9999. CLK advances the counter on its falling edge; RST forces the count back to 0. LE controls an internal latch: HIGH lets it follow the count, LOW freezes the last value so the display stays still while the counter keeps running underneath. DS picks what the segments show: HIGH the live count, LOW the latched value. The seven segment lines a-g are shared by all four digits and lit one digit at a time; D1-D4 say which digit is active right now, so an external display cycles through them fast enough to look continuous. CO is the cascade carry: it goes HIGH at 6000 and back LOW at 0000, so the HIGH-to-LOW edge at rollover (9999 to 0000) can clock a second 74x926 to count past 9999. This is the 74x925 with a display select and a carry added.',
    pinout: [
      { pin:  1, name: 'd',   type: 'output' },
      { pin:  2, name: 'e',   type: 'output' },
      { pin:  3, name: 'f',   type: 'output' },
      { pin:  4, name: 'g',   type: 'output' },
      { pin:  5, name: 'LE',  type: 'input'  },
      { pin:  6, name: 'DS',  type: 'input'  },
      { pin:  7, name: 'D1',  type: 'output' },
      { pin:  8, name: 'D2',  type: 'output' },
      { pin:  9, name: 'GND', type: 'power'  },
      { pin: 10, name: 'D3',  type: 'output' },
      { pin: 11, name: 'D4',  type: 'output' },
      { pin: 12, name: 'CLK', type: 'input'  },
      { pin: 13, name: 'RST', type: 'input'  },
      { pin: 14, name: 'CO',  type: 'output' },
      { pin: 15, name: 'a',   type: 'output' },
      { pin: 16, name: 'b',   type: 'output' },
      { pin: 17, name: 'c',   type: 'output' },
      { pin: 18, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_DISPLAY_4DIGIT_926',
        inputs: ['CLK', 'RST', 'LE', 'DS'],
        outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'D1', 'D2', 'D3', 'D4', 'CO'] },
    ],
  },

  // 74927 (MM74C927): 4-digit TIMER counter + multiplexed 7-segment display
  // driver, 18-pin DIP. Same family as the '925/'926/'928; identical to the '926
  // except the second-most-significant digit divides by 6 instead of 10, so at a
  // 10 Hz clock the display reads minutes:seconds.tenths up to 9:59.9.
  // Source: National Semiconductor (Fairchild), "MM74C925 / MM74C926 / MM74C927 /
  //   MM74C928 4-Digit Counters with Multiplexed 7-Segment Output Drivers",
  //   DS005919 (March 1988, rev. 1995). [Online]. Available:
  //   https://archive.org/details/manuallib-id-2710717 (file 2710717.pdf).
  //   Verified: 18-pin terminal assignment (Connection Diagrams p.1, shared
  //   MM74C926/927/928 package) + MM74C927 Logic and Block Diagram p.4 (decade
  //   dividers MSD→LSD = ÷10/÷6/÷10/÷10) + Functional Description p.3 + Carry-Out
  //   Waveforms p.6 — read as 300-dpi PDF page images (issues.md C4). Corrects the
  //   prior hand-entered stub, which had it as a 16-pin part with no DISPLAY
  //   SELECT or CARRY-OUT (that 16-pin layout is actually the MM74C925) — an
  //   issues.md C2 cloned-pinout error.
  '74x927': {
    name: '74x927',
    simpleName: '4-Digit Timer Counter/Display Driver',
    description: '4-digit timer counter/display driver (up to 9:59.9) (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: 'https://archive.org/details/manuallib-id-2710717',
    tags: ['counter', 'display', 'driver', '4-digit', 'timer'],
    sequential: true,
    guideOverview: 'The 74x927 counts up and drives a 4-digit 7-segment display, wired so the reading comes out as a stopwatch time. Three of its four digits divide by 10 like a normal decimal counter, but the second-from-left digit divides by 6, so it only ever shows 0 to 5 the way the tens-of-seconds place on a clock does. Clock it at 10 Hz (one tick per tenth of a second) and the four digits read minutes:seconds.tenths, from 0:00.0 up to 9:59.9, then roll back to zero. CLK advances the count on its falling edge; RST forces the count back to 0. LE controls an internal latch: HIGH lets it follow the count, LOW freezes the last value so the display holds steady while the counter keeps running underneath. DS picks what the segments show: HIGH the live count, LOW the latched value. The seven segment lines a-g are shared by all four digits and lit one digit at a time; D1-D4 say which digit is active right now, so an external display cycles through them fast enough to look continuous. CO is the cascade carry: it goes HIGH partway through the cycle and drops back LOW at the 9:59.9 to 0:00.0 rollover, and that falling edge can clock a second 74x927 to extend the range past ten minutes.',
    pinout: [
      { pin:  1, name: 'd',   type: 'output' },
      { pin:  2, name: 'e',   type: 'output' },
      { pin:  3, name: 'f',   type: 'output' },
      { pin:  4, name: 'g',   type: 'output' },
      { pin:  5, name: 'LE',  type: 'input'  },
      { pin:  6, name: 'DS',  type: 'input'  },
      { pin:  7, name: 'D1',  type: 'output' },
      { pin:  8, name: 'D2',  type: 'output' },
      { pin:  9, name: 'GND', type: 'power'  },
      { pin: 10, name: 'D3',  type: 'output' },
      { pin: 11, name: 'D4',  type: 'output' },
      { pin: 12, name: 'CLK', type: 'input'  },
      { pin: 13, name: 'RST', type: 'input'  },
      { pin: 14, name: 'CO',  type: 'output' },
      { pin: 15, name: 'a',   type: 'output' },
      { pin: 16, name: 'b',   type: 'output' },
      { pin: 17, name: 'c',   type: 'output' },
      { pin: 18, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_DISPLAY_4DIGIT_927',
        inputs: ['CLK', 'RST', 'LE', 'DS'],
        outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'D1', 'D2', 'D3', 'D4', 'CO'] },
    ],
  },

  // 74928 (MM74C928): 4-digit (3½-digit) counter + multiplexed 7-segment display
  // driver, 18-pin DIP. Counts 0–1999; most-significant digit divides by 2.
  // Source: Fairchild Semiconductor, "MM74C925 / MM74C926 / MM74C927 / MM74C928
  //   4-Digit Counters with Multiplexed 7-Segment Output Drivers", DS005919
  //   (Oct 1987, rev. Jan 1999). [Online]. Available:
  //   https://www.jameco.com/Jameco/Products/ProdDS/44599.pdf. Verified: 18-pin
  //   terminal assignment (Connection Diagrams p.2 + MM74C928 logic diagram p.3),
  //   Functional Description p.2, General Description p.1 — read as 300-dpi PDF
  //   page images (issues.md C4). Corrects the prior hand-entered stub, which had
  //   it as a 16-pin part with no DISPLAY SELECT or CARRY-OUT pin (issues.md C2).
  '74x928': {
    name: '74x928',
    simpleName: '4-Digit Counter/Display Driver (1999)',
    description: '4-digit counter/display driver (up to 1999) (18-pin)',
    pins: 18, vcc: 18, gnd: 9,
    datasheet: 'https://www.jameco.com/Jameco/Products/ProdDS/44599.pdf',
    tags: ['counter', 'display', 'driver', '4-digit'],
    sequential: true,
    guideOverview: 'The 74x928 counts from 0 to 1999 and drives a 4-digit 7-segment display. The most significant digit only ever shows "0" or "1" (it divides by 2 instead of 10), so the largest reading is 1999. CLK advances the counter on its falling edge; RST forces the count back to 0. LE controls an internal latch: HIGH lets it follow the count, LOW freezes the last value so the display stays still while the counter keeps running underneath. DS picks what the segments show: HIGH the live count, LOW the latched value. The seven segment lines a-g are shared by all four digits and lit one digit at a time; D1-D4 say which digit is active right now, so an external display cycles through them fast enough to look continuous. CO is an overflow flag: it goes HIGH when the count rolls past 1999 and stays HIGH until RST. Typical use is a counter or basic meter whose reading never exceeds 1999, such as a millivolt or pulse-count display.',
    pinout: [
      { pin:  1, name: 'd',   type: 'output' },
      { pin:  2, name: 'e',   type: 'output' },
      { pin:  3, name: 'f',   type: 'output' },
      { pin:  4, name: 'g',   type: 'output' },
      { pin:  5, name: 'LE',  type: 'input'  },
      { pin:  6, name: 'DS',  type: 'input'  },
      { pin:  7, name: 'D1',  type: 'output' },
      { pin:  8, name: 'D2',  type: 'output' },
      { pin:  9, name: 'GND', type: 'power'  },
      { pin: 10, name: 'D3',  type: 'output' },
      { pin: 11, name: 'D4',  type: 'output' },
      { pin: 12, name: 'CLK', type: 'input'  },
      { pin: 13, name: 'RST', type: 'input'  },
      { pin: 14, name: 'CO',  type: 'output' },
      { pin: 15, name: 'a',   type: 'output' },
      { pin: 16, name: 'b',   type: 'output' },
      { pin: 17, name: 'c',   type: 'output' },
      { pin: 18, name: 'VCC', type: 'power'  },
    ],
    gates: [
      { type: 'COUNTER_DISPLAY_4DIGIT_928',
        inputs: ['CLK', 'RST', 'LE', 'DS'],
        outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'D1', 'D2', 'D3', 'D4', 'CO'] },
    ],
  },
};