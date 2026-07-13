// CMOS 4000-series coverage — CD4057A (RCA COS/MOS LSI 4-bit Arithmetic Logic
// Unit). Shipped in its own standalone block (CHIPS_BLOCK_146) to avoid
// colliding with other agents adding chips in the same working tree.
//
// ── Why this is a documentation stub (tags: ['stub'], gate GENERIC_STUB) ─────
// The coverage-plan hint maps "4057 → ALU_4BIT". That is a mis-mapping: the
// `ALU_4BIT` engine primitive is the purely COMBINATIONAL 74181/CD40181 ALU
// (inputs A0-3,B0-3,S0-3,M,Cn → F0-3,Cn4,P,G,A=B; see
// js/specificChipsSim.js _evaluateAlu4Bit, line ~3114). The CD4057A is NOT that
// part. It is a CLOCKED 4-bit bit-slice PROCESSOR: it has an internal 4-bit
// shift/store register that acts as an accumulator/result register, a
// 16-instruction repertoire encoded on four opcode lines (a,b,c,d), four
// data-flow MODES selected by C1/C2, bidirectional left/right serial-data lines
// for cascading to a wider word, an overflow flip-flop with bidirectional
// overflow I/O, conditional-clock gating from three conditional inputs (A,B,C),
// and zero / negative / overflow condition outputs. All 16 instructions execute
// on the positive edge of the CLOCK. A combinational 74181-style primitive
// cannot represent a clocked register machine with serial cascade and mode
// control — forcing it onto ALU_4BIT would put wrong behavior on wrong pins
// (the exact CD4082 / issues.md C2 trap).
//
// A faithful CD4057A model (16 opcodes × 4 modes × serial-carry semantics +
// overflow FF + conditional gating) is a large, hard-to-verify primitive for a
// rare 1975 LSI part with no available test vectors. Consistent with the repo's
// "hard tail" policy for exotic LSI parts (issues.md B/D2/D3; precedents CD4046,
// CD4553), it ships as an "info sheet only" documentation entry: the page
// documents the real part (verified pinout, function, design notes), but the
// chip is hidden from the breadboard picker and drives no outputs. An honest
// info sheet beats a misleading half-working sim (cf. the A10 PLL-removal
// decision). See issues.md C17.
//
// ── Sources (IEEE-style; pinout/behaviour facts traceable to these) ─────────
// Source: RCA Solid State Division, "COS/MOS LSI 4-Bit Arithmetic Logic Unit —
//   CD4057AD, CD4057AK, CD4057AH", File No. 635 (RCA COS/MOS Components, 1975).
//   [Online]. Available:
//   https://cdn.hackaday.io/files/1834027846671168/CD4057AD%20-%20RCA%20COS-MOS%20Components%201975.pdf
//   Verified: terminal assignment (Fig. 2, p.273) read as a 300-dpi rendered
//   PDF page-image crop (NOT a text summarizer — issues.md C4), and corrected an
//   earlier lower-res mis-read; instruction repertoire + mode definition (Table
//   I, p.277), parallel/serial/conditional operation descriptions (pp.277-282),
//   block + simplified logic diagrams (Figs. 1 & 3, pp.273/276), and timing
//   diagram (Fig. 8, p.280). All read as PDF page images.
//
// Verified 28-lead DIP terminal assignment (Fig. 2, TOP VIEW). Note the
// NON-STANDARD power pins: VDD = pin 26, VSS = pin 25 (not the corner pins):
//   1  PARALLEL DATA 1 (D1)        28 Ro2 (rotate/serial cascade terminal 2)
//   2  PARALLEL DATA 4 (D4)        27 PARALLEL DATA 3 (D3)
//   3  PARALLEL DATA 2 (D2)        26 VDD  *non-standard
//   4  NEGATIVE INDICATOR          25 VSS  *non-standard
//   5  ZI INPUT                    24 ZERO INDICATOR OUTPUT
//   6  INPUT c (opcode bit c)      23 "DATA OUT" CONTROL
//   7  INPUT d (opcode bit d)      22 INPUT a (opcode bit a)
//   8  CONDITIONAL INPUT A         21 INPUT b (opcode bit b)
//   9  CONDITIONAL INPUT C         20 CLOCK
//   10 RIGHT SERIAL DATA LINE      19 CONDITIONAL INPUT B
//   11 BYPASS                      18 LEFT SERIAL DATA LINE
//   12 NC                          17 OVERFLOW INDICATOR
//   13 MODE-CONTROL INPUT LINE C1  16 OVERFLOW I/O
//   14 Ro1 (rotate/serial cascade) 15 MODE-CONTROL INPUT LINE C2
//
// Instruction repertoire (opcode a b c d, executed on rising CLOCK edge; Table I
// / p.277): 0000 NO-OP, 0001 AND, 0010 Count up, 0011 Count down, 0100 SMZ
// (subtract stored number from zero), 0101 SM (subtract from parallel data),
// 0110 AD (add), 0111 SUB (subtract, parallel from stored), 1000 SET (all ones),
// 1001 CLEAR (all zeroes), 1010 Exclusive-OR, 1011 OR, 1100 IN (input parallel
// data), 1101 Left shift, 1110 Right shift, 1111 Rotate (cycle) right.
// Modes (C2 C1, Table I): 00→MODE 0, 01→MODE 1, 10→MODE 2, 11→MODE 3 — these set
// how serial data may enter/leave the register on the left/right serial lines.

export const CHIPS_BLOCK_146 = {
  // ── CD4057A: COS/MOS LSI 4-bit arithmetic logic unit ──────────────────────
  'CD4057': {
    name: 'CD4057',
    simpleName: '4-bit ALU slice',
    description: '4-bit ALU / processor slice (28-pin) — info sheet only',
    guideOverview: 'The CD4057A is an early-CMOS (COS/MOS) 4-bit arithmetic logic unit built as one large building block for small computers and controllers. Unlike a plain combinational ALU, it contains its own 4-bit register that holds the running result, like a tiny accumulator. A 4-bit opcode on inputs a, b, c, d picks one of 16 operations — add, subtract, count up, count down, AND, OR, exclusive-OR, set, clear, load, shift left, shift right, rotate, and no-op — and that operation runs on the rising edge of the clock. Several chips chain side by side through left/right serial-data lines to make an 8-, 12-, or 16-bit unit; two mode-control lines (C1, C2) set how data flows along that chain so each chip knows whether it is the most-significant slice, the least-significant slice, or one in the middle. It also reports three conditions: zero, negative, and arithmetic overflow. NOTE: 74Sim is a functional logic simulator and does not model this clocked, multi-mode, serially-cascaded processor (it does not fit the simple combinational ALU model the engine has for the 74181). It is provided as a documentation / info-sheet entry only; its outputs are not driven in the simulator.',
    guidePinDescriptions: {
      'D1':    'PARALLEL DATA 1 (pin 1). Bit 1 (LSB) of the bidirectional parallel data bus. Carries operands in and, with DATA OUT control high, the result out.',
      'D4':    'PARALLEL DATA 4 (pin 2). Bit 4 (MSB) of the parallel data bus.',
      'D2':    'PARALLEL DATA 2 (pin 3). Bit 2 of the parallel data bus.',
      'NEGIND':'NEGATIVE INDICATOR (pin 4). High when the most-significant bit of the register is 1, i.e. the stored number is negative (two\'s-complement). Independent of mode.',
      'ZIIN':  'ZI INPUT (pin 5). Serial input used with the rotate/shift cascade; the ZI line of the most-significant slice ties to VDD when chips are chained.',
      'INc':   'INPUT c (pin 6). Opcode bit c — one of the four instruction-select lines.',
      'INd':   'INPUT d (pin 7). Opcode bit d — one of the four instruction-select lines.',
      'CONDA': 'CONDITIONAL INPUT A (pin 8). One of three inputs whose combination can inhibit the clock so an operation runs only when a condition is met (see conditional-inputs truth table).',
      'CONDC': 'CONDITIONAL INPUT C (pin 9). Conditional-control input C.',
      'RSDL':  'RIGHT SERIAL DATA LINE (pin 10). Bidirectional serial link to the next less-significant slice; whether data enters or leaves here depends on the operation and the mode.',
      'BYPASS':'BYPASS (pin 11). Used in mode 3 to electrically tie the right and left serial lines together so the register is skipped; left floating on the most/least-significant chip of a chain.',
      'NC':    'No connection (pin 12).',
      'C1':    'MODE-CONTROL INPUT LINE C1 (pin 13). With C2, selects one of four data-flow modes (00=mode 0 … 11=mode 3).',
      'Ro1':   'ROTATE terminal 1 (pin 14). Serial rotate/cascade connection; on the most-significant slice it ties to the Ro2 terminal of the least-significant slice.',
      'C2':    'MODE-CONTROL INPUT LINE C2 (pin 15). With C1, selects the data-flow mode.',
      'OVFIO': 'OVERFLOW I/O (pin 16). Bidirectional overflow-carry path between slices; an overflow detected during add/subtract in mode 2 or 3 is loaded into the overflow flip-flop.',
      'OVFIND':'OVERFLOW INDICATOR (pin 17). High when a two\'s-complement arithmetic overflow has been detected and stored.',
      'LSDL':  'LEFT SERIAL DATA LINE (pin 18). Bidirectional serial link to the next more-significant slice.',
      'CONDB': 'CONDITIONAL INPUT B (pin 19). Conditional-control input B.',
      'CLK':   'CLOCK (pin 20). Single-phase clock. The selected instruction executes on the positive (rising) edge.',
      'INb':   'INPUT b (pin 21). Opcode bit b — one of the four instruction-select lines.',
      'INa':   'INPUT a (pin 22). Opcode bit a — one of the four instruction-select lines.',
      'DOC':   'DATA OUT CONTROL (pin 23). High unloads the register (and overflow flip-flop) onto the parallel data lines, independent of the other instructions; should only be driven high while a NO-OP, shift, count, clear or set is loaded.',
      'ZEROIND':'ZERO INDICATOR OUTPUT (pin 24). High when the whole register (across all chained slices) holds all zeros. Independent of mode.',
      'VSS':   'Negative supply / ground (pin 25). Non-standard location — most COS/MOS parts use a corner pin.',
      'VDD':   'Positive supply, +3 V to +15 V (modeled at +5 V) at pin 26. Non-standard location — most COS/MOS parts use a corner pin.',
      'D3':    'PARALLEL DATA 3 (pin 27). Bit 3 of the parallel data bus.',
      'Ro2':   'ROTATE terminal 2 (pin 28). Serial rotate/cascade connection paired with Ro1.',
    },
    guideSections: [
      {
        title: 'What the CD4057A is',
        paragraphs: [
          'The CD4057A is a 4-bit arithmetic logic unit (ALU) made by RCA in the mid-1970s using their early CMOS process, called COS/MOS. It was meant as a building block: wire several together and you get an arithmetic unit of almost any width, the heart of a small custom computer or controller.',
          'What makes it different from an ordinary ALU is that it carries its own storage. Inside is a 4-bit register that holds the running result, behaving like an accumulator. You give it a 4-bit instruction code and a clock pulse; it performs the operation and stores the new result back in that register.',
        ],
      },
      {
        title: 'The 16 instructions',
        paragraphs: [
          'Four input lines (a, b, c, d) encode one of 16 operations: no-op, AND, count up, count down, four kinds of add/subtract, set to all ones, clear to all zeros, exclusive-OR, OR, load from the parallel data bus, shift left, shift right, and rotate right. Every operation happens on the rising edge of the clock.',
          'A separate DATA OUT control line, when taken high, dumps the register contents back onto the parallel data bus so you can read the result. It works independently of the 16 instructions, so it must only be raised while a "safe" instruction (no-op, shift, count, clear, or set) is loaded.',
        ],
      },
      {
        title: 'Modes and chaining',
        paragraphs: [
          'Real arithmetic needs more than 4 bits, so the chip is built to chain. Left and right serial-data lines connect one slice to the next, passing carries and shifted bits between them. The two mode-control lines C1 and C2 tell each chip its role: mode 0 lets data flow both ways, modes 1 and 2 restrict it to the left or right line, and mode 3 bypasses the register entirely. By setting different modes on each chip you hard-wire which one is the most-significant slice and which is the least-significant.',
          'Three condition outputs report the result across the whole chain: zero (all bits are 0), negative (top bit is 1), and overflow (a two\'s-complement add or subtract went out of range). Three conditional inputs (A, B, C) can gate the clock so an operation runs only when a chosen condition holds — useful for the conditional branches in a multiply or divide routine.',
        ],
      },
      {
        title: 'Why 74Sim treats this as an info-sheet stub',
        paragraphs: [
          '74Sim does have a 4-bit ALU model, but it is the simple combinational kind (the 74181/CD40181): give it operands and a function code and it produces an answer immediately, with no internal storage and no clock. The CD4057A is a fundamentally different animal — a clocked machine with its own result register, a 16-instruction repertoire, four data-flow modes, and serial cascade lines. The combinational model cannot represent any of that.',
          'Building a faithful model of all 16 instructions across all four modes (with their serial-carry rules and the overflow flip-flop) would be a large, hard-to-verify piece of code for a rare part with no test vectors to check against. Following the project\'s policy for exotic large-scale parts, this entry documents the real chip — pinout, instructions, modes, and design notes — but is hidden from the breadboard picker and drives no outputs. The datasheet linked here is the authority.',
        ],
      },
    ],
    pins: 28,
    vcc: 26,
    gnd: 25,
    sequential: true,
    datasheet: 'https://cdn.hackaday.io/files/1834027846671168/CD4057AD%20-%20RCA%20COS-MOS%20Components%201975.pdf',
    tags: ['alu', 'arithmetic logic unit', 'processor slice', 'bit slice', 'accumulator', 'cmos', 'cos/mos', '4000', 'lsi', 'stub'],
    // Verified vs RCA File No. 635 Fig. 2 (terminal assignment), read as a
    // 300-dpi rendered PDF page-image crop (issues.md C4); NOT cloned from a
    // sibling (issues.md C2). VDD/VSS are on non-standard pins 26/25.
    pinout: [
      { pin: 1,  name: 'D1',     type: 'io',     description: 'PARALLEL DATA 1 (LSB) — bidirectional parallel data bus.' },
      { pin: 2,  name: 'D4',     type: 'io',     description: 'PARALLEL DATA 4 (MSB) — bidirectional parallel data bus.' },
      { pin: 3,  name: 'D2',     type: 'io',     description: 'PARALLEL DATA 2 — bidirectional parallel data bus.' },
      { pin: 4,  name: 'NEGIND', type: 'output', description: 'NEGATIVE INDICATOR — high when the register MSB (sign bit) is 1.' },
      { pin: 5,  name: 'ZIIN',   type: 'input',  description: 'ZI INPUT — serial rotate/cascade input (tie to VDD on the most-significant slice).' },
      { pin: 6,  name: 'INc',    type: 'input',  description: 'INPUT c — opcode bit c.' },
      { pin: 7,  name: 'INd',    type: 'input',  description: 'INPUT d — opcode bit d.' },
      { pin: 8,  name: 'CONDA',  type: 'input',  description: 'CONDITIONAL INPUT A — conditional clock-gating control.' },
      { pin: 9,  name: 'CONDC',  type: 'input',  description: 'CONDITIONAL INPUT C — conditional clock-gating control.' },
      { pin: 10, name: 'RSDL',   type: 'io',     description: 'RIGHT SERIAL DATA LINE — bidirectional serial link to the less-significant slice.' },
      { pin: 11, name: 'BYPASS', type: 'input',  description: 'BYPASS — mode-3 right/left serial bypass; leave floating on end-of-chain slices.' },
      { pin: 12, name: 'NC',     type: 'nc',     description: 'No connection.' },
      { pin: 13, name: 'C1',     type: 'input',  description: 'MODE-CONTROL INPUT LINE C1 — with C2 selects the data-flow mode.' },
      { pin: 14, name: 'Ro1',    type: 'io',     description: 'ROTATE terminal 1 — serial rotate/cascade connection.' },
      { pin: 15, name: 'C2',     type: 'input',  description: 'MODE-CONTROL INPUT LINE C2 — with C1 selects the data-flow mode.' },
      { pin: 16, name: 'OVFIO',  type: 'io',     description: 'OVERFLOW I/O — bidirectional overflow-carry path between slices.' },
      { pin: 17, name: 'OVFIND', type: 'output', description: 'OVERFLOW INDICATOR — high when a stored two\'s-complement overflow is detected.' },
      { pin: 18, name: 'LSDL',   type: 'io',     description: 'LEFT SERIAL DATA LINE — bidirectional serial link to the more-significant slice.' },
      { pin: 19, name: 'CONDB',  type: 'input',  description: 'CONDITIONAL INPUT B — conditional clock-gating control.' },
      { pin: 20, name: 'CLK',    type: 'input',  description: 'CLOCK — instruction executes on the positive edge.' },
      { pin: 21, name: 'INb',    type: 'input',  description: 'INPUT b — opcode bit b.' },
      { pin: 22, name: 'INa',    type: 'input',  description: 'INPUT a — opcode bit a.' },
      { pin: 23, name: 'DOC',    type: 'input',  description: 'DATA OUT CONTROL — high unloads the register onto the parallel data bus.' },
      { pin: 24, name: 'ZEROIND',type: 'output', description: 'ZERO INDICATOR OUTPUT — high when the (chained) register holds all zeros.' },
      { pin: 25, name: 'VSS',    type: 'power',  description: 'Negative supply / ground (non-standard pin location).' },
      { pin: 26, name: 'VDD',    type: 'power',  description: 'Positive supply (+3 V to +15 V; modeled at +5 V) — non-standard pin location.' },
      { pin: 27, name: 'D3',     type: 'io',     description: 'PARALLEL DATA 3 — bidirectional parallel data bus.' },
      { pin: 28, name: 'Ro2',    type: 'io',     description: 'ROTATE terminal 2 — serial rotate/cascade connection.' },
    ],
    // Documentation stub: the CD4057A's clocked, multi-mode, serially-cascaded
    // processor behavior is not modeled (does not fit the combinational ALU_4BIT
    // primitive — see header + issues.md C17). GENERIC_STUB drives the dedicated
    // condition outputs Hi-Z; the chip is hidden from the picker by the 'stub'
    // tag. The bidirectional data/serial/overflow pins are left undriven.
    gates: [
      {
        type: 'GENERIC_STUB',
        inputs: [],
        outputs: ['NEGIND', 'OVFIND', 'ZEROIND'],
      },
    ],
    note: 'Info sheet only: 74Sim does not model the CD4057A clocked 4-bit processor slice (16 instructions × 4 serial-cascade modes + result register + overflow flip-flop do not fit the combinational ALU_4BIT/74181 primitive). Pinout verified vs RCA File No. 635 (1975) Fig. 2 terminal assignment. See issues.md C17.',
  },
};
