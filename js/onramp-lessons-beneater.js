// ── 74Sim Onramp: Ben Eater 8-bit CPU course ─────────────────────────────────
// A module-by-module tour of Ben Eater's SAP-1 ("Simple As Possible") 8-bit
// breadboard computer, mirroring his video series: one lesson per module, then
// a synthesis lesson on how the modules combine — and why every CPU ever built
// does the same fetch/decode/execute dance.
//
// Prose is adapted from BenEater8BitCPU.md. Every module lesson pairs the text
// with that module's REAL board — the same chips, wiring, and LED panel the
// full CPU example uses, generated in isolation by
// helperscripts/generate_ben_eater_cpu.py --modules into
// js/onramp-beneater-boards.js. Boards are loaded read-only ("anatomy" views):
// an isolated module has no bus or control rails feeding it, so it holds
// still — the point is to see and probe the actual 74-series wiring.
//
// The final lesson fetches the complete CPU example
// (js/examples/BenEater8BitCPU.json) onto the board at runtime rather than
// inlining its ~170 kB here.

import { BENEATER_MODULE_BOARDS as B } from './onramp-beneater-boards.js';
import { makeQuizSetup } from './onramp-lessons.js';
import { SVG_BUS, SVG_FETCH } from './onramp-diagrams.js';

// ── Empty initial board (steps carry their own boardState or are fullWidth) ──

const EMPTY_BOARD = {
  version: 1,
  components: [],
  wires: [],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [],
};

// ── SVG diagrams ─────────────────────────────────────────────────────────────

// The bus highway: six modules hanging off one shared 8-bit bus. Exactly one
// (the PC, via CO) is driving; everyone else listens.

// Fetch / execute timing: the shared two-step fetch, then microcoded execute.

// ── Shared board-step boilerplate ────────────────────────────────────────────

const ANATOMY_NOTE = `
  <div class="onramp-hint">This board is the real module lifted straight out of the
  full CPU — same chips, same wiring. In the complete machine its inputs arrive on
  the bus and control rails, so in isolation it holds still: this is an anatomy view.
  Hover over pins and wires to trace the nets.</div>`;

// The synthesis lesson pulls the complete CPU example onto the board at
// runtime. If the fetch fails (offline dev server), the step still reads fine
// and the "open in simulator" button remains the escape hatch.
function makeFullCpuSetup() {
  return (app) => {
    const lessonIdx = app.currentLessonIdx;
    const stepIdx = app.currentStepIdx;
    fetch('/js/examples/BenEater8BitCPU.json')
      .then(r => (r.ok ? r.json() : null))
      .then(state => {
        if (!state) return;
        // Bail if the learner has already navigated away from this step.
        if (app.currentLessonIdx !== lessonIdx || app.currentStepIdx !== stepIdx) return;
        app._applyBoardState(state);
        app._fitBoardToView();
      })
      .catch(() => {});
  };
}

// ── Lesson 1: The big picture ────────────────────────────────────────────────

const LESSON_BE_OVERVIEW = {
  id: 'be_overview',
  title: '1. The Big Picture: One Bus, One Clock',
  description: 'What the SAP-1 is, and the two ideas that tie a dozen breadboards into one computer: a shared 8-bit bus with a single-driver rule, and a clock that keeps every module in lock-step.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'welcome',
      title: 'A computer you can point at',
      fullWidth: true,
      content: `
        <h2>A Computer You Can Point At</h2>
        <p>This course walks through a working recreation of <strong>Ben Eater's SAP-1</strong>
        ("Simple As Possible") 8-bit computer, built entirely from 74-series logic chips
        inside 74Sim. It runs real programs — the demo program counts 1, 2, 3, … on a
        7-segment display.</p>
        <p>Just like Ben's video series, <strong>every module lives on its own breadboard</strong>:
        clock, program counter, memory address register, RAM, instruction register,
        control logic, two data registers, an ALU, a flags register, and an output display.
        Each of the next twelve lessons puts one of those real boards next to the text, so
        you can see exactly which chips do the job and how they're wired.</p>
        <p>The point is not to be fast or clever. It's to let you <em>see</em>, one clock
        edge at a time, how a pile of logic chips becomes a computer.</p>
        <div class="onramp-hint">No prior CPU knowledge needed, but the "Introduction to
        Digital Hardware" course (especially the tri-state and counters lessons) is a good
        warm-up.</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'the_bus',
      title: 'The bus',
      fullWidth: true,
      content: `
        <h2>The Bus — a Shared 8-bit Highway</h2>
        <p>Every module connects to <strong>one</strong> common set of 8 wires: the
        <strong>bus</strong>. It is the only road data travels between modules. The single
        most important rule of the whole machine:</p>
        <p><strong>Only one module may <em>drive</em> the bus at any instant — but any
        number may <em>listen</em> and latch a copy of it.</strong></p>
        ${SVG_BUS}
        <p>If two modules drove the bus at once you'd get a short and garbage data. That's
        why every module that can put a value on the bus does it through a
        <strong>74x245 tri-state buffer</strong>: its outputs disconnect (go Hi-Z) unless the
        module's <em>output-enable</em> signal is active — <code>CO</code> (counter out),
        <code>RO</code> (RAM out), <code>IO</code> (instruction operand out),
        <code>AO</code> (A out), or <code>EO</code> (ALU out).</p>
        <p>Modules that need to capture the bus assert an "…-in" signal instead:
        <code>MI</code>, <code>RI</code>, <code>II</code>, <code>AI</code>, <code>BI</code>,
        <code>OI</code>, <code>FI</code>, or <code>J</code>.</p>
        <div class="onramp-hint">This is the tri-state idea from the intro course doing its
        signature job: letting many chips share one set of wires without contention.</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'the_clock',
      title: 'The clock',
      fullWidth: true,
      content: `
        <h2>The Clock — Everything in Lock-step</h2>
        <p>The second unifying idea: <strong>no register changes except on a clock
        edge</strong>. On each tick, the modules whose "-in" signal is active grab whatever
        is on the bus <em>right now</em>, and the counters advance.</p>
        <p>That single shared tick is what keeps a dozen separate boards acting as one
        machine instead of twelve loose chips. Between edges, the control logic sets up
        <em>who drives</em> and <em>who listens</em>; the edge itself is the moment the data
        actually moves.</p>
        <p>Set the clock to single-step (as you can in the full simulator) and the whole
        computer walks one micro-step at a time — you can literally watch each transfer
        happen.</p>
        <p>Keep these two ideas in mind through every module lesson: each module is just
        <strong>something that drives the bus, listens to the bus, or both — on the beat of
        the clock</strong>.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'quiz_bus',
      title: 'Quick check',
      fullWidth: true,
      content: `
        <h2>Quick Check</h2>
        <p>At one instant during a program, how many modules may be <strong>driving</strong>
        the bus, and how many may be <strong>listening</strong>?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Many may drive, one may listen</button>
          <button class="quiz-option" data-answer="correct">B) Exactly one may drive, any number may listen</button>
          <button class="quiz-option" data-answer="wrong">C) One may drive and only one may listen</button>
          <button class="quiz-option" data-answer="wrong">D) As many as needed may drive, as long as they agree</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};

// ── Lesson 2: Clock ──────────────────────────────────────────────────────────

const LESSON_BE_CLOCK = {
  id: 'be_clock',
  title: '2. Clock: the Heartbeat',
  description: 'A 555-based clock with a halt gate. Nothing in the CPU moves except on its edge — single-step it and the whole machine walks one micro-step at a time.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'Why a clock',
      fullWidth: true,
      content: `
        <h2>Clock — the Heartbeat</h2>
        <p>Every register, the program counter, and the control step counter all share one
        <code>CLK</code> line. Nothing changes except on its edge, which is what keeps the
        whole machine synchronized.</p>
        <p>In Ben Eater's build, a <strong>555 timer</strong> wired astable makes the square
        wave. A <strong>74x08</strong> AND gate plus a <strong>74x04</strong> inverter sit
        between the 555 and the rest of the machine so the <code>HLT</code> (halt) control
        signal can freeze the clock — that's how the <code>HLT</code> instruction stops the
        computer. A second 555 debounces a manual single-step button.</p>
        <p>Slowing the clock down (or stopping it entirely between manual steps) is the
        SAP-1's superpower as a teaching machine: at 1 Hz you can watch every transfer.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.clock,
      fitBoard: true,
      content: `
        <h2>The Clock Board</h2>
        <p><em>Chips: 555, 74x08, 74x04.</em></p>
        <p>On this board the 555, AND, and inverter are placed for fidelity to Ben's build,
        and a built-in <strong>1 Hz clock source</strong> (the small square component to
        their right) drives the <code>CLK</code> net directly — in the full machine that net
        fans out to every register and counter.</p>
        <p>Things to spot:</p>
        <ul>
          <li>Every chip's <strong>VCC and GND</strong> wires run to the power rails — red
          to +5 V, dark to ground. Every module in the machine repeats this pattern.</li>
          <li>The clock source ticks on its own — it's the one component here that moves
          without any input.</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 3: Reset ──────────────────────────────────────────────────────────

const LESSON_BE_RESET = {
  id: 'be_reset',
  title: '3. Reset: Clear the Machine',
  description: 'One push button pulls the RST line and every register and counter clears to zero. Execution restarts from address 0.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'Why reset',
      fullWidth: true,
      content: `
        <h2>Reset — Clear the Machine</h2>
        <p>A computer full of registers has a problem at power-on: every register wakes up
        holding garbage. The <strong>reset</strong> line fixes that — and lets you re-run a
        program from the top at any time.</p>
        <p>Pressing the button asserts <code>RST</code>, which is wired to the
        <code>CLR</code> (clear) input of <em>every</em> register, the program counter, and
        the control logic's step counter. All of them snap to zero: the PC points at address
        0, the step counter starts at T0, and execution restarts from the first
        instruction.</p>
        <p>It's the simplest module in the machine — and a good reminder that a "module"
        doesn't have to be complicated to matter.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.reset,
      fitBoard: true,
      content: `
        <h2>The Reset Board</h2>
        <p><em>Parts: one push button.</em></p>
        <p>That's the whole module: a push button between the <code>RST</code> net and a
        power rail. In the full machine, one wire chains from here to the
        <code>CLR</code> pin of every 74x173 register, the 74x161 program counter, and the
        74x161 step counter.</p>
        <p>One button, wired to a dozen chips, is what makes the difference between a
        machine you have to power-cycle and one you can restart with a tap.</p>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 4: Program Counter ────────────────────────────────────────────────

const LESSON_BE_PC = {
  id: 'be_pc',
  title: '4. Program Counter: What Runs Next',
  description: 'A 74x161 counter holds the address of the next instruction; a 74x245 puts it on the bus on CO. Count-enable steps the program in order; the jump-load input is how JMP works.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>Program Counter — What's Next</h2>
        <p>A program is a list of instructions sitting in memory at addresses 0, 1, 2, …
        Something has to remember <em>where we are</em> in that list. That is the entire job
        of the program counter (PC).</p>
        <p>It holds an address from 0–15 and responds to three control signals:</p>
        <ul>
          <li><code>CE</code> (count-enable) — bump the address +1. Asserted once during
          every fetch, so the program runs in order.</li>
          <li><code>CO</code> (counter-out) — drive the current address onto the bus, so the
          memory address register can grab it.</li>
          <li><code>J</code> (jump) — <em>load</em> a new address from the bus instead of
          counting. This is how <code>JMP</code> (and the conditional jumps) work: overwrite
          "where we are" and the program continues from somewhere else.</li>
        </ul>
        <p>Counting in order is what makes it a machine that runs <em>programs</em>; loading
        from the bus is what makes those programs able to loop and branch.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.pc,
      fitBoard: true,
      content: `
        <h2>The PC Board</h2>
        <p><em>Chips: 74x161 counter, 74x245 buffer.</em></p>
        <ul>
          <li>The <strong>74x161</strong> is a 4-bit binary counter: <code>CLK</code> ticks
          it, <code>ENP</code> is the <code>CE</code> count-enable, <code>LOAD</code> is the
          <code>J</code> jump input, and its A–D load pins tap the bus's low 4 bits.</li>
          <li>The <strong>74x245</strong> tri-state buffer sits between the counter's
          outputs and the bus. Its <code>OE</code> pin is driven by <code>CO</code> — the
          counter only appears on the bus when the control logic says so.</li>
          <li>The green LEDs on the lower board show the current address — in the running
          machine you watch them count 0, 1, 2, … then snap backwards on a jump.</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'quiz',
      title: 'Quick check',
      fullWidth: true,
      content: `
        <h2>Quick Check</h2>
        <p>How does the SAP-1 execute a <code>JMP 6</code> instruction?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The PC counts up repeatedly until it reaches 6</button>
          <button class="quiz-option" data-answer="correct">B) The operand 6 is put on the bus and the PC loads it via its J input</button>
          <button class="quiz-option" data-answer="wrong">C) RAM moves the instruction at address 6 into the PC</button>
          <button class="quiz-option" data-answer="wrong">D) The clock skips ahead 6 ticks</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};

// ── Lesson 5: Memory Address Register ────────────────────────────────────────

const LESSON_BE_MAR = {
  id: 'be_mar',
  title: '5. Memory Address Register: Pointing at a Word',
  description: 'A single 74x173 latches 4 bits of the bus on MI and holds them as RAM’s address lines. DIP switches let you dial an address by hand.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>Memory Address Register — Point RAM at a Word</h2>
        <p>RAM holds 16 bytes, but it can only show you <em>one</em> at a time: whichever
        one its 4 address lines select. Those address lines need to hold steady while RAM is
        being read or written — you can't have the address wobbling mid-access.</p>
        <p>So the machine gives the address its own register. When <code>MI</code>
        (memory-address-in) is asserted, the MAR latches the low 4 bits of the bus on the
        clock edge, and from then on it holds RAM pointed at that word — no matter what the
        bus does next.</p>
        <p>Every memory access in every instruction starts the same way: put an address on
        the bus, assert <code>MI</code>, tick. During fetch that address comes from the PC;
        during <code>LDA</code>/<code>ADD</code>/<code>STA</code> it comes from the
        instruction's operand.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.mar,
      fitBoard: true,
      content: `
        <h2>The MAR Board</h2>
        <p><em>Chips: 74x173, plus a 4-way DIP switch.</em></p>
        <ul>
          <li>The <strong>74x173</strong> is a 4-bit D register: its D inputs tap the bus's
          low 4 bits, its <code>IE</code> (input-enable) pin is wired to <code>MI</code>,
          and its Q outputs run to the RAM module's address mux.</li>
          <li>The <strong>DIP switches</strong> are the manual side: on Ben's real machine
          you flip these to dial an address by hand when loading a program. (In this build
          the pre-loaded demo program makes them optional.)</li>
          <li>The amber LEDs below show which address is currently selected.</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 6: RAM ────────────────────────────────────────────────────────────

const LESSON_BE_RAM = {
  id: 'be_ram',
  title: '6. RAM: 16 Bytes of Everything',
  description: 'Two 74x189 chips hold the program AND its data — 16 bytes of memory behind an address mux, with a re-inverting 74x245 gating reads onto the bus.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>RAM — Where the Program and Data Live</h2>
        <p>Sixteen bytes. That's the SAP-1's entire memory — and remarkably, it holds
        <strong>both the program and the data</strong> in the same address space. That's the
        von Neumann idea in its smallest possible form: instructions are just bytes in
        memory, no different from the numbers they operate on.</p>
        <p>Two control signals:</p>
        <ul>
          <li><code>RO</code> (RAM-out) — drive the byte at the MAR's address onto the
          bus. Used to fetch instructions <em>and</em> to read data.</li>
          <li><code>RI</code> (RAM-in) — write the bus into the byte at the MAR's address.
          That's <code>STA</code>.</li>
        </ul>
        <p>The demo program the machine ships with lives at addresses 0–6, and uses
        addresses 14 and 15 as its two variables. Program and data, side by side, in the
        same sixteen bytes.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.ram,
      fitBoard: true,
      content: `
        <h2>The RAM Board</h2>
        <p><em>Chips: 2× 74x189, 74x157, 74x00, 74x245, plus DIP switches.</em></p>
        <ul>
          <li>Each <strong>74x189</strong> is a 16×4 static RAM; two side-by-side store 16
          bytes (one chip holds the low nibbles, one the high).</li>
          <li>The <strong>74x157</strong> mux picks the address source: the MAR (when the
          program runs) or the DIP switches (for hand-programming).</li>
          <li>Here's the gotcha Ben spends a whole video on: the 74x189's outputs are
          <strong>inverted</strong>. The <strong>74x245</strong> buffer both re-inverts the
          byte and gates it onto the bus when <code>RO</code> is active.</li>
          <li>The <strong>74x00</strong> gates the write-enable pulse for <code>RI</code>
          (tied off in this build — RAM is pre-loaded and read-mostly).</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'quiz',
      title: 'Quick check',
      fullWidth: true,
      content: `
        <h2>Quick Check</h2>
        <p>The SAP-1 stores its program and its data in the same 16 bytes of RAM. What is
        the deep consequence of that?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Programs run twice as fast because memory is shared</button>
          <button class="quiz-option" data-answer="correct">B) An instruction is just a byte — memory doesn't "know" code from data</button>
          <button class="quiz-option" data-answer="wrong">C) The program can never modify data</button>
          <button class="quiz-option" data-answer="wrong">D) Each address stores both an instruction and a number</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};

// ── Lesson 7: Instruction Register ───────────────────────────────────────────

const LESSON_BE_IR = {
  id: 'be_ir',
  title: '7. Instruction Register: the Current Instruction',
  description: 'Two 74x173s latch the instruction byte on II. Top nibble = opcode, straight to the control logic; bottom nibble = operand, back onto the bus on IO.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>Instruction Register — Holding the Instruction Apart</h2>
        <p>During fetch, the instruction byte arrives from RAM over the bus. But the bus is
        about to be reused — the very next micro-step needs it for data. So the instruction
        gets parked in its own register: when <code>II</code> is asserted, the IR latches
        the whole byte.</p>
        <p>Then the byte is <strong>split in half</strong>, and the two halves lead very
        different lives:</p>
        <ul>
          <li><strong>Top nibble = opcode.</strong> Wired straight to the control logic; it
          decides <em>what this instruction does</em>.</li>
          <li><strong>Bottom nibble = operand</strong> — an address or a small constant. On
          <code>IO</code>, a buffer puts it back onto the bus, e.g. to supply
          <code>LDA</code>'s address to the MAR or <code>LDI</code>'s value to the A
          register.</li>
        </ul>
        <p>So <code>0x1F</code> means "opcode 1, operand 15" — <code>LDA 15</code>. The
        format is the machine's entire instruction encoding.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.ir,
      fitBoard: true,
      content: `
        <h2>The IR Board</h2>
        <p><em>Chips: 2× 74x173, 74x245.</em></p>
        <ul>
          <li>The two <strong>74x173</strong> 4-bit registers latch the byte together —
          shared <code>CLK</code>, shared <code>II</code> input-enable (follow the purple
          wire linking their IE pins).</li>
          <li>The high register's Q outputs leave the board for the control logic — that's
          the opcode path. Nothing gates them; the control logic always sees the current
          opcode.</li>
          <li>The low register's Q outputs feed the <strong>74x245</strong>, whose
          <code>OE</code> is wired to <code>IO</code> — the operand only touches the bus
          when asked. Its unused high inputs are tied low, which is why an operand on the
          bus reads as 0–15.</li>
          <li>Red LEDs below show the full latched instruction byte.</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 8: Control Logic ──────────────────────────────────────────────────

const LESSON_BE_CONTROL = {
  id: 'be_control',
  title: '8. Control Logic: the Conductor',
  description: 'A step counter, a decoder, and two microcode EEPROMs. Addressed by {opcode, step, flags}, they fire the 16 control signals that run every other module.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>Control Logic — the Conductor</h2>
        <p>Every module so far responds to control signals — <code>CO</code>,
        <code>MI</code>, <code>RO</code>, <code>AI</code>, … But who asserts them, and in
        what order? This module. It is the brain of the machine.</p>
        <p>The mechanism is beautifully simple:</p>
        <ul>
          <li>A <strong>step counter</strong> walks through micro-steps T0, T1, T2, …
          one per clock tick.</li>
          <li>Two <strong>EEPROMs</strong> hold the <strong>microcode</strong>: a lookup
          table addressed by <code>{ opcode, step, carry-flag, zero-flag }</code>. Whatever
          16-bit word lives at that address <em>is</em> the set of control lines to assert
          on this tick.</li>
        </ul>
        <p>That's it — the "brain" is a table lookup. The opcode picks a row, the step
        counter walks the columns, and the outputs pull the strings of every other
        module.</p>
        <p>The deep consequence: <strong>change the ROM contents and you change the
        instruction set</strong>. The hardware doesn't move; the machine just means
        something different. That boundary — hardware below, stored microcode above — is
        where "software" begins.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.control,
      fitBoard: true,
      content: `
        <h2>The Control Board</h2>
        <p><em>Chips: 74x161, 74x138, 2× 28C16 EEPROM, 74x04.</em></p>
        <ul>
          <li>The <strong>74x161</strong> is the step counter; the <strong>74x138</strong>
          decodes the step number (Ben uses it to reset the sequence).</li>
          <li>The two <strong>28C16</strong> EEPROMs are the stars. Their address pins are
          fed by the step counter (A0–A2), the IR's opcode (A3–A6), and the two flag bits
          (A7–A8). Their sixteen combined output pins <em>are</em> the machine's sixteen
          control signals — <code>HLT MI RI RO IO II AI AO EO SU BI OI CE CO J FI</code>.</li>
          <li>Both ROMs are pre-loaded with the SAP-1 microcode — the same fetch steps and
          per-opcode sequences you'll walk through in the final lesson.</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'quiz',
      title: 'Quick check',
      fullWidth: true,
      content: `
        <h2>Quick Check</h2>
        <p>You want to add a brand-new instruction to the SAP-1 (say, a "decrement A"
        opcode). What has to change?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) New chips must be added to the control board</button>
          <button class="quiz-option" data-answer="wrong">B) Every register needs an extra control input</button>
          <button class="quiz-option" data-answer="correct">C) Only the microcode table in the EEPROMs — the hardware stays put</button>
          <button class="quiz-option" data-answer="wrong">D) The clock must run a different speed for the new opcode</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};

// ── Lesson 9: A Register ─────────────────────────────────────────────────────

const LESSON_BE_A = {
  id: 'be_a',
  title: '9. A Register: the Accumulator',
  description: 'The machine’s working value. Latches from the bus on AI, always feeds the ALU, and can drive the bus on AO. Nearly every result lands here.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>A Register — the Accumulator</h2>
        <p>The A register is where the machine <em>works</em>. Load a number —
        it goes to A. Add — the result goes back to A. Print — A is what gets displayed.
        Nearly every instruction either reads it, writes it, or both, which is why this
        style of register earned the name <strong>accumulator</strong>: results accumulate
        here.</p>
        <p>Three connections define it:</p>
        <ul>
          <li><code>AI</code> — latch a byte from the bus (that's <code>LDA</code>,
          <code>LDI</code>, and the write-back of <code>ADD</code>/<code>SUB</code>).</li>
          <li>Its value is <strong>permanently wired to the ALU</strong> as the "A" operand
          — no control signal needed; the ALU always sees it.</li>
          <li><code>AO</code> — drive its value onto the bus (used by <code>STA</code> and
          <code>OUT</code>).</li>
        </ul>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.a,
      fitBoard: true,
      content: `
        <h2>The A Register Board</h2>
        <p><em>Chips: 2× 74x173, 74x245.</em></p>
        <ul>
          <li>Two <strong>74x173</strong> 4-bit registers hold the byte; their D inputs tap
          the bus, their shared input-enable is <code>AI</code>, and their shared
          <code>CLR</code> ties to the reset line.</li>
          <li>Their Q outputs run two places at once: off-board to the ALU (always), and
          into the <strong>74x245</strong> buffer whose <code>OE</code> is <code>AO</code>
          (onto the bus, only when asked).</li>
          <li>This exact pattern — <em>latch on "-in", buffer out on "-out"</em> — is the
          template for every register in the machine. Once you can read this board, you can
          read them all.</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 10: ALU ───────────────────────────────────────────────────────────

const LESSON_BE_ALU = {
  id: 'be_alu',
  title: '10. ALU: the Math',
  description: 'Two 74x283 adders compute A+B; XOR gates and a carry-in turn the same adder into a subtractor via two’s complement. Produces the carry and zero flags.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>ALU — the Math</h2>
        <p>The arithmetic logic unit continuously computes <strong>A + B</strong> — it has
        no clock and no memory. It just sits between the two registers, and its sum is
        always live. <code>EO</code> gates that result onto the bus when an instruction
        wants it.</p>
        <p>The elegant part is subtraction. When the <code>SU</code> signal is set, XOR
        gates flip every bit of B, and the adder's carry-in adds 1:</p>
        <p><code>A + (B XOR 11111111) + 1&nbsp;&nbsp;=&nbsp;&nbsp;A + (−B)</code></p>
        <p>That's <strong>two's complement</strong>: flip the bits and add one to negate.
        The <em>same</em> adder circuit does both operations — no separate subtractor
        exists.</p>
        <p>The ALU also reports two facts about its result: did the add <strong>carry</strong>
        past 8 bits (<code>CF</code>), and is the result exactly <strong>zero</strong>
        (<code>ZF</code>)? Those two bits, latched by the flags register, are what make
        conditional jumps — decisions — possible.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.alu,
      fitBoard: true,
      content: `
        <h2>The ALU Board</h2>
        <p><em>Chips: 2× 74x283, 2× 74x86, 74x245, 74x32.</em></p>
        <ul>
          <li>The two <strong>74x283</strong> 4-bit adders chain their carry (spot the
          yellow wire from the low chip's carry-out to the high chip's carry-in) to add full
          bytes.</li>
          <li>The two <strong>74x86</strong> XOR banks sit on the B inputs — the
          conditional bit-flipper for subtraction. <code>SU</code> feeds both the XORs and
          the low adder's carry-in.</li>
          <li>The <strong>74x32</strong> OR tree checks for an all-zero result (the zero
          flag); the top adder's carry-out is the carry flag.</li>
          <li>The <strong>74x245</strong> puts the sum on the bus when <code>EO</code> is
          active. Yellow LEDs below show the live sum.</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'quiz',
      title: 'Quick check',
      fullWidth: true,
      content: `
        <h2>Quick Check</h2>
        <p>How does the SAP-1 subtract, given that it only contains adder chips?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) It runs the adder backwards on the falling clock edge</button>
          <button class="quiz-option" data-answer="wrong">B) A second, hidden adder is wired for subtraction</button>
          <button class="quiz-option" data-answer="wrong">C) It repeatedly decrements A until B reaches zero</button>
          <button class="quiz-option" data-answer="correct">D) It XOR-inverts B and adds 1 via carry-in — two's-complement negation</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};

// ── Lesson 11: B Register ────────────────────────────────────────────────────

const LESSON_BE_B = {
  id: 'be_b',
  title: '11. B Register: the Second Operand',
  description: 'Latches the ALU’s second operand from the bus on BI and feeds it straight to the adder. Unlike A, it has no path back onto the bus.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>B Register — the Second Operand</h2>
        <p>Adding takes two numbers. A holds the first; <strong>B holds the second</strong>.
        During <code>ADD 14</code>, the machine fetches <code>mem[14]</code> from RAM into B
        (<code>RO + BI</code>), and only then fires the ALU's result back into A.</p>
        <p>B is deliberately a lesser register than A:</p>
        <ul>
          <li>It latches from the bus on <code>BI</code> — same as any register.</li>
          <li>Its outputs are permanently wired to the ALU's "B" input.</li>
          <li>But it has <strong>no output buffer</strong> — the classic SAP-1 B register
          cannot drive the bus at all. It exists solely to feed the adder.</li>
        </ul>
        <p>That asymmetry is a design lesson in itself: every part costs chips, and the
        minimal machine gives each register only the connections its instruction set
        actually uses.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.b,
      fitBoard: true,
      content: `
        <h2>The B Register Board</h2>
        <p><em>Chips: 2× 74x173.</em></p>
        <p>Compare this board with the A register's: the same two <strong>74x173</strong>
        latches, the same bus taps on the D inputs, the same shared <code>BI</code>
        input-enable and reset wiring — but <strong>no 74x245</strong>. Where A had a buffer
        gating its value onto the bus, B's outputs head only one place: the ALU.</p>
        <p>Red LEDs below show its contents in the running machine.</p>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 12: Flags Register ────────────────────────────────────────────────

const LESSON_BE_FLAGS = {
  id: 'be_flags',
  title: '12. Flags: How a CPU Decides',
  description: 'One 74x173 latches the carry and zero bits on FI. The control ROMs read them as address lines — that’s the whole mechanism behind conditional jumps.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>Flags Register — Remembering the Result's Status</h2>
        <p>Everything so far moves and combines data. But a computer isn't just a
        calculator because it can <strong>decide</strong> — run different code depending on
        a result. The entire mechanism of decision fits in one tiny register.</p>
        <p>When <code>FI</code> is asserted (during <code>ADD</code>/<code>SUB</code>), it
        latches two bits from the ALU:</p>
        <ul>
          <li><code>CF</code> — the operation carried past 8 bits.</li>
          <li><code>ZF</code> — the result was exactly zero.</li>
        </ul>
        <p>Remember that the control ROMs are addressed by
        <code>{ opcode, step, CF, ZF }</code>. A <code>JC</code> (jump-if-carry) opcode
        points at microcode that loads the PC <em>only in the CF=1 half of the table</em>;
        in the CF=0 half, the same steps do nothing. The flag literally selects which
        microcode runs.</p>
        <p>That's an <code>if</code> statement, in hardware. Loops that terminate, branches
        that react to data — all of it rides on these two latched bits.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.flags,
      fitBoard: true,
      content: `
        <h2>The Flags Board</h2>
        <p><em>Chips: 74x173.</em></p>
        <p>One 4-bit register, using only two of its bits: D1 latches the carry flag, D2
        the zero flag (the unused inputs are tied low). <code>FI</code> is its input-enable;
        its two Q outputs run to the control ROMs' A8 and A7 address pins.</p>
        <p>Yellow LEDs below show the latched flags.</p>
        <div class="onramp-hint">Honest caveat: in this build the zero-flag <em>detector</em>
        isn't wired into the latch yet, so <code>JZ</code> won't actually branch — the
        carry path (<code>JC</code>) is fully functional. The architecture story above is
        exactly right; one wire is still on the to-do list.</div>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 13: Output ────────────────────────────────────────────────────────

const LESSON_BE_OUTPUT = {
  id: 'be_output',
  title: '13. Output: the Display',
  description: 'A 74x377 latches a byte on OI; an EEPROM converts it to 7-segment patterns and four displays show it in decimal. The machine’s only way to print.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'why',
      title: 'What it does',
      fullWidth: true,
      content: `
        <h2>Output — the Display</h2>
        <p>A CPU that can't show you anything might as well not exist. The output module is
        the machine's one window to the world: when <code>OI</code> is asserted
        (that's the <code>OUT</code> instruction), it latches whatever is on the bus and
        shows it as a <strong>decimal number</strong> on 7-segment displays.</p>
        <p>Decimal is the clever part. The latched byte is binary; a display digit needs a
        specific 7-segment pattern. Rather than build binary-to-decimal conversion from
        gates (a lot of gates), Ben uses another <strong>EEPROM as a lookup table</strong>:
        address = the byte plus which digit we're rendering; data = the segment pattern for
        that digit. Pure precomputed answers.</p>
        <p>Note the trick echoes the control logic: <em>when logic gets complicated, bake it
        into a ROM.</em> Same idea, second appearance.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board',
      title: 'On the board',
      boardState: B.output,
      fitBoard: true,
      content: `
        <h2>The Output Board</h2>
        <p><em>Chips: 74x377, 28C16, 74x107, 74x139, 4× 7-segment.</em></p>
        <ul>
          <li>The <strong>74x377</strong> is an 8-bit latch — the register that grabs the
          bus on <code>OI</code>.</li>
          <li>Its byte feeds the <strong>28C16</strong> decode ROM's address pins; the ROM's
          outputs are segment patterns.</li>
          <li>The <strong>74x107</strong> flip-flops and <strong>74x139</strong> decoder are
          Ben's digit-scanning circuit: they cycle through the four digits fast enough that
          all appear lit. (In this build the scan is placeholder-wired; the ROM and displays
          are real.)</li>
        </ul>
        ${ANATOMY_NOTE}
      `,
      allowedActions: [],
      validate: null,
    },
  ],
};

// ── Lesson 14: Putting it all together ───────────────────────────────────────

const LESSON_BE_SYNTHESIS = {
  id: 'be_synthesis',
  title: '14. Putting It All Together',
  description: 'Fetch, decode, execute: walk the full instruction cycle through the machine, read the instruction set, trace the demo program — and see why a modern CPU is this same dance at billions of steps per second.',
  initialState: EMPTY_BOARD,
  lockedComponents: [],
  lockedWires: [],
  steps: [
    {
      id: 'cycle',
      title: 'The instruction cycle',
      fullWidth: true,
      content: `
        <h2>The Instruction Cycle: Fetch, Decode, Execute</h2>
        <p>You've now met every module. Here is the choreography that makes them a
        computer. Every instruction begins with the <strong>same two fetch steps</strong>:</p>
        <table class="onramp-table">
          <tr><th>Step</th><th>Signals</th><th>What moves</th></tr>
          <tr><td><code>T0</code></td><td><code>CO + MI</code></td><td>Program Counter → bus → Memory Address Register (point RAM at the next instruction)</td></tr>
          <tr><td><code>T1</code></td><td><code>RO + II + CE</code></td><td>RAM → bus → Instruction Register; counter +1</td></tr>
        </table>
        ${SVG_FETCH}
        <p>After the fetch, the opcode now sitting in the IR — plus the step number and the
        flags — addresses the control ROMs, which fire the right signals for steps T2, T3, …
        That's the <strong>decode and execute</strong>. When the instruction is done, the
        step counter resets and the next fetch begins.</p>
        <p>For example, <code>ADD 14</code> executes as:</p>
        <table class="onramp-table">
          <tr><th>Step</th><th>Signals</th><th>What moves</th></tr>
          <tr><td><code>T2</code></td><td><code>IO + MI</code></td><td>operand → bus → MAR (address of the number to add)</td></tr>
          <tr><td><code>T3</code></td><td><code>RO + BI</code></td><td>RAM → bus → B register (fetch the number)</td></tr>
          <tr><td><code>T4</code></td><td><code>EO + AI + FI</code></td><td>ALU(A+B) → bus → A; latch the flags</td></tr>
        </table>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'trace',
      title: 'Tracing one instruction',
      fullWidth: true,
      content: `
        <h2>Tracing One Instruction, Ben's Way</h2>
        <p>In his control-logic video, Ben does something worth copying: he writes a
        program, then <em>says out loud</em> what the control logic must do on every single
        clock tick to execute it. Let's do that for the demo program's <code>LDA 15</code>
        (it lives at address 2, and address 15 holds the running total).</p>
        <table class="onramp-table">
          <tr><th>Tick</th><th>Signals</th><th>Say it out loud</th></tr>
          <tr><td><code>T0</code></td><td><code>CO + MI</code></td><td>"The program counter says 2 — move that value into the memory address register."</td></tr>
          <tr><td><code>T1</code></td><td><code>RO + II + CE</code></td><td>"Take the contents of RAM at address 2 — the byte <code>0x1F</code> — and put it in the instruction register. Count the PC up to 3."</td></tr>
          <tr><td><code>T2</code></td><td><code>IO + MI</code></td><td>"Take the operand nibble of the instruction register — 15 — and move that value into the memory address register."</td></tr>
          <tr><td><code>T3</code></td><td><code>RO + AI</code></td><td>"Take the contents of RAM at address 15 and move it into the A register."</td></tr>
        </table>
        <p>Read the right-hand column again and notice: each sentence is just <em>one
        module driving the bus and one module latching from it</em>. That's all a CPU ever
        does.</p>
        <p>And the microcode ROM? It is exactly that speech, frozen into a table. Every row
        you could say out loud for every instruction, stored at the address
        <code>{ opcode, step }</code>, replayed by the step counter forever.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'isa',
      title: 'The instruction set',
      fullWidth: true,
      content: `
        <h2>The Instruction Set</h2>
        <p>Eleven instructions. The opcode is the byte's top nibble; the operand (where
        used) is the bottom nibble.</p>
        <table class="onramp-table">
          <tr><th>Opcode</th><th>Mnemonic</th><th>Meaning</th></tr>
          <tr><td><code>0x0</code></td><td><code>NOP</code></td><td>do nothing</td></tr>
          <tr><td><code>0x1</code></td><td><code>LDA addr</code></td><td>load A from RAM[addr]</td></tr>
          <tr><td><code>0x2</code></td><td><code>ADD addr</code></td><td>A = A + RAM[addr] (sets flags)</td></tr>
          <tr><td><code>0x3</code></td><td><code>SUB addr</code></td><td>A = A − RAM[addr] (sets flags)</td></tr>
          <tr><td><code>0x4</code></td><td><code>STA addr</code></td><td>store A into RAM[addr]</td></tr>
          <tr><td><code>0x5</code></td><td><code>LDI val</code></td><td>load the 4-bit immediate into A</td></tr>
          <tr><td><code>0x6</code></td><td><code>JMP addr</code></td><td>jump to addr</td></tr>
          <tr><td><code>0x7</code></td><td><code>JC addr</code></td><td>jump if carry flag set</td></tr>
          <tr><td><code>0x8</code></td><td><code>JZ addr</code></td><td>jump if zero flag set</td></tr>
          <tr><td><code>0xE</code></td><td><code>OUT</code></td><td>copy A to the output display</td></tr>
          <tr><td><code>0xF</code></td><td><code>HLT</code></td><td>halt the clock</td></tr>
        </table>
        <p>Every one of these is nothing more than a short list of control-signal words in
        the microcode ROMs, appended to the shared fetch. There is no deeper magic to
        find — this table <em>is</em> the machine's vocabulary.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'program',
      title: 'The demo program',
      fullWidth: true,
      content: `
        <h2>The Demo Program</h2>
        <p>RAM ships pre-loaded with a counter that prints 1, 2, 3, … on the display:</p>
        <table class="onramp-table">
          <tr><th>Addr</th><th>Instruction</th><th>Effect</th></tr>
          <tr><td>0</td><td><code>LDI 1</code></td><td>A = 1</td></tr>
          <tr><td>1</td><td><code>STA 14</code></td><td>mem[14] = 1 (the increment)</td></tr>
          <tr><td>2</td><td><code>LDA 15</code></td><td>A = mem[15] (running total, starts at 0)</td></tr>
          <tr><td>3</td><td><code>ADD 14</code></td><td>A = A + 1</td></tr>
          <tr><td>4</td><td><code>OUT</code></td><td>display A</td></tr>
          <tr><td>5</td><td><code>STA 15</code></td><td>mem[15] = A</td></tr>
          <tr><td>6</td><td><code>JMP 2</code></td><td>loop back to address 2</td></tr>
        </table>
        <p>Watch what's really happening: the program keeps its <em>variables</em> (the
        increment at address 14, the running total at 15) in the same RAM as its
        <em>code</em>, uses the ALU through A and B, prints through the output register, and
        loops forever through the PC's jump input. Every module you've studied earns its
        keep within seven bytes.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'whole_machine',
      title: 'The whole machine',
      setup: makeFullCpuSetup(),
      content: `
        <h2>The Whole Machine</h2>
        <p>Here it is — all twelve boards, wired together. The left column of boards is the
        CPU, top-to-bottom in the order data flows; the right column is each module's LED
        readout. The long colored wires running board-to-board are the 8-bit bus; the gray
        ones are the control signals you now know by name.</p>
        <p>The lesson canvas is small for a machine this size, so when you're ready:</p>
        <p><a class="onramp-cta" href="/simulator?example=BenEater8BitCPU">Open the full CPU in the simulator</a></p>
        <p>There you can zoom around each board, set the clock to single-step, press reset,
        and watch the demo program count on the displays — one micro-step per tick, every
        transfer visible on the LEDs.</p>
        <div class="onramp-hint">Honest caveats if you go probing: the zero-flag detector,
        the RAM write-button path, and the display's digit-scanning are placeholder-wired in
        this build — the architecture is faithful, but those three corners are the "next
        things to wire up."</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'generalize',
      title: 'Every CPU ever built',
      fullWidth: true,
      content: `
        <h2>This Is Every CPU Ever Built</h2>
        <p>Here's the payoff. The machine you just studied is not a toy version of a
        computer — it is the <em>actual shape</em> of every computer:</p>
        <ul>
          <li>A <strong>program counter</strong> remembers where execution is.</li>
          <li>Instructions are <strong>fetched from memory</strong>, decoded, executed.</li>
          <li>An <strong>ALU</strong> computes; <strong>flags</strong> record result status;
          conditional jumps read them to make decisions.</li>
          <li><strong>Control logic</strong> sequences who talks to whom over shared
          datapaths.</li>
        </ul>
        <p>A modern Ryzen or Apple Silicon core does this same dance — fetch, decode,
        execute — <strong>billions of times per second</strong>, with wider buses, more
        registers, caches in front of memory, and dozens of instructions in flight at once.
        Those are magnificent optimizations, but they are optimizations <em>of this
        loop</em>. Strip any CPU to its skeleton and you find the SAP-1.</p>
        <p>You now know what a computer <em>is</em>: registers on a bus, an adder, a table
        of microcode, and a clock. Everything else is scale.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'quiz_fetch',
      title: 'Final check 1',
      fullWidth: true,
      content: `
        <h2>Final Check 1 of 2</h2>
        <p>Why do the first two micro-steps (T0, T1) of <em>every</em> instruction look
        exactly the same?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The clock isn't stable until the third tick</button>
          <button class="quiz-option" data-answer="correct">B) Until an instruction is fetched into the IR, the machine can't know what to do — fetch must precede decode</button>
          <button class="quiz-option" data-answer="wrong">C) The bus needs two ticks to charge up before carrying data</button>
          <button class="quiz-option" data-answer="wrong">D) They are only the same for arithmetic instructions</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_micro',
      title: 'Final check 2',
      fullWidth: true,
      content: `
        <h2>Final Check 2 of 2</h2>
        <p>During execution, what exactly do the control ROMs look up on each clock
        tick?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The next instruction's address</button>
          <button class="quiz-option" data-answer="wrong">B) The value to load into the A register</button>
          <button class="quiz-option" data-answer="correct">C) The set of control signals to assert, addressed by opcode + step + flags</button>
          <button class="quiz-option" data-answer="wrong">D) The 7-segment pattern for the output display</button>
        </div>
        <p>Answer correctly to finish the course — then go single-step the real thing.</p>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};

// ── Course export ────────────────────────────────────────────────────────────

export const BENEATER_LESSONS = [
  LESSON_BE_OVERVIEW,
  LESSON_BE_CLOCK,
  LESSON_BE_RESET,
  LESSON_BE_PC,
  LESSON_BE_MAR,
  LESSON_BE_RAM,
  LESSON_BE_IR,
  LESSON_BE_CONTROL,
  LESSON_BE_A,
  LESSON_BE_ALU,
  LESSON_BE_B,
  LESSON_BE_FLAGS,
  LESSON_BE_OUTPUT,
  LESSON_BE_SYNTHESIS,
];
