// ── 74Sim Onramp Lesson Definitions ──────────────────────────────────────────
// Single source of truth for all lessons. Imported by the lesson player
// (js/onramp.js) and the lesson catalog (onramp/lessons.html).

import { COMP } from './constants.js';
import { Netlist } from './netlist.js';
import {
  CD4001_SR_LATCH_BOARD, CD4013_COINTOSS_BOARD, SCHMITT_CLOCK_BOARD,
  DUAL_555_BOARD, ENCODE_DECODE_838_BOARD, PISO_SIPO_BOARD,
  MEM_INTRO_BOARD, ROM_DEMO_BOARD, RAM_DEMO_BOARD, COMBO_LOCK_FSM_BOARD,
  GLITCH_HAZARD_BOARD,
} from './onramp-lesson-boards.js';
import {
  SVG_PUSH_ONLY, SVG_PUSH_PULL, SVG_OPEN_DRAIN, SVG_TRISTATE,
  SVG_SR_LATCH, SVG_D_FF, SVG_SLOW_EDGE, SVG_HYSTERESIS,
  SVG_PROP_DELAY, SVG_HAZARD_CIRCUIT, SVG_HAZARD_TIMING, SVG_CONSENSUS,
  SVG_555_INSIDE, SVG_555_MONO, SVG_555_ASTABLE,
  SVG_ENCODE_FUNNEL, SVG_ACTIVE_LOW, SVG_PAR_VS_SER, SVG_SHIFT_CHAIN,
  SVG_MEM_CELLS, SVG_ROM_VS_RAM, SVG_ROM_READ, SVG_RAM_RW,
  SVG_FSM_STATE_DIAGRAM, SVG_FSM_ANATOMY,
  SVG_ANALYSIS_CIRCUIT, SVG_ANALYSIS_LOGIC, SVG_ANALYSIS_TIMING,
} from './onramp-diagrams.js';


// ── Validation Helpers ───────────────────────────────────────────────────────

function buildNetlist(app) {
  const netlist = new Netlist();
  netlist.build(app.world, app.state.components, app.state.wireManager);
  return netlist;
}

// Netlist nodes only record OCCUPIED holes (pins + wire endpoints). Lesson
// validators, however, name convenient reference holes like "anywhere on the
// button's strip" — which may be empty. Fall back to strip connectivity so a
// wire landing on ANY hole of the referenced strip counts, exactly what the
// step prose and hints promise.
function findNodeForHole(netlist, holeId, world) {
  const direct = netlist.nodes.find(n => n.holes.has(holeId));
  if (direct || !world) return direct;
  return netlist.nodes.find(n => {
    for (const h of n.holes) {
      if (world.areConnected(h, holeId)) return true;
    }
    return false;
  });
}

function isConnectedToRail(app, holeId, isVCC) {
  const netlist = buildNetlist(app);
  const node = findNodeForHole(netlist, holeId, app.world);
  if (!node) return false;
  return isVCC ? node.isVCC : node.isGND;
}

function areSameNet(app, holeA, holeB) {
  const netlist = buildNetlist(app);
  const nodeA = findNodeForHole(netlist, holeA, app.world);
  const nodeB = findNodeForHole(netlist, holeB, app.world);
  if (!nodeA || !nodeB) return false;
  return nodeA.id === nodeB.id;
}


// ── Lesson 0: Welcome to 74Sim ───────────────────────────────────────────────
// Tool orientation, before any theory: how the breadboard connects things,
// what wire numbers mean, place + power a first chip (74x32 OR), and what the
// three Analysis panels are for.

// Bare board for the breadboard-anatomy step — the red x-ray overlay
// (step.showConnections) does the talking.
const WELCOME_EMPTY_STATE = {
  version: 1,
  components: [],
  wires: [],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [],
};

// Wire-numbers demo: a button lights an LED through a chain of three wires
// whose endpoints never visually touch — they connect because each endpoint
// lands on a strip another wire also touches, so all three share one net
// number. A second wire pair and a VCC tap show a different number and the
// rail-label endpoints.
const WELCOME_NETS_STATE = {
  version: 1,
  components: [
    // Push button: VCC → button → col 6 strip
    { id: 1, type: 'push_button', name: 'PBTN', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, pressed: false,
      startHoleId: '0:0:main:6:2', endHoleId: '0:0:power:6:1' },
    // Pull down so the strip reads LOW when the button is up
    { id: 2, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 10000,
      startHoleId: '0:0:main:6:3', endHoleId: '0:0:power:6:2' },
    // Current limiter feeding the LED strip
    { id: 3, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 470,
      startHoleId: '0:0:main:33:7', endHoleId: '0:0:main:35:7' },
    // LED: anode col 35 strip, cathode straight into the GND rail
    { id: 4, type: 'led', name: 'LED', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, lit: false, color: 'red',
      startHoleId: '0:0:main:35:8', endHoleId: '0:0:power:36:2' },
  ],
  wires: [
    // The chain: button strip → col 16 → col 26 → LED-resistor strip.
    // Consecutive wires meet on a shared strip, so all three become net 0.
    { id: 1, startHoleId: '0:0:main:6:1', endHoleId: '0:0:main:16:2', startNet: 0, endNet: 0, color: '#3498db' },
    { id: 2, startHoleId: '0:0:main:16:3', endHoleId: '0:0:main:26:2', startNet: 0, endNet: 0, color: '#3498db' },
    { id: 3, startHoleId: '0:0:main:26:3', endHoleId: '0:0:main:33:6', startNet: 0, endNet: 0, color: '#3498db' },
    // An unrelated wire — different net, different number, different color
    { id: 4, startHoleId: '0:0:main:10:6', endHoleId: '0:0:main:14:6', startNet: 1, endNet: 1, color: '#9b59b6' },
    // A tap on the + rail: both endpoints display "VCC" instead of a number
    { id: 5, startHoleId: '0:0:power:10:1', endHoleId: '0:0:main:10:0', startNet: 2, endNet: 2, color: '#e74c3c' },
  ],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [],
};

// Working board for the OR-gate build: two push buttons with pull-downs and
// an LED with its current-limiting resistor. Same proven layout as the AND
// lesson, so the wiring instructions carry over one lesson later.
const WELCOME_BUILD_STATE = {
  version: 1,
  components: [
    // Push Button A: VCC → button → col 8 strip
    { id: 1, type: 'push_button', name: 'PBTN', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, pressed: false,
      startHoleId: '0:0:main:8:2', endHoleId: '0:0:power:8:1' },
    { id: 2, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 10000,
      startHoleId: '0:0:main:8:3', endHoleId: '0:0:power:8:2' },

    // Push Button B: VCC → button → col 12 strip
    { id: 3, type: 'push_button', name: 'PBTN', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, pressed: false,
      startHoleId: '0:0:main:12:2', endHoleId: '0:0:power:12:1' },
    { id: 4, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 10000,
      startHoleId: '0:0:main:12:3', endHoleId: '0:0:power:12:2' },

    // LED: anode col 30 strip, cathode col 31 strip → resistor → GND rail
    { id: 5, type: 'led', name: 'LED', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, lit: false, color: 'red',
      startHoleId: '0:0:main:30:8', endHoleId: '0:0:main:31:8' },
    { id: 6, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 470,
      startHoleId: '0:0:main:31:9', endHoleId: '0:0:power:32:2' },
  ],
  wires: [],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [],
};

const LESSON_WELCOME = {
  id: 'sim_basics',
  title: 'Lesson 0: Welcome to 74Sim',
  description: 'Learn the simulator itself: how a breadboard secretly connects holes, what '
    + 'wire numbers mean, how to place and power your first chip (a 74x32 OR gate), and '
    + 'what the three Analysis panels tell you.',
  initialState: WELCOME_BUILD_STATE,
  lockedComponents: [1, 2, 3, 4, 5, 6],
  lockedWires: [],
  steps: [

    // ── Step 1: Welcome ──────────────────────────────────────────────────────
    {
      id: 'welcome',
      title: 'Welcome',
      fullWidth: true,
      content: `
        <h2>Welcome to 74Sim</h2>
        <p>74Sim is a virtual breadboard for <strong>real 74-series logic chips</strong>. You place chips, buttons and LEDs on the board, connect them, and the circuit behaves like the physical parts would — voltages, currents, propagation delays and all.</p>
        <p>This lesson is a tour of the tool itself. You will:</p>
        <ul>
          <li>See how a breadboard <strong>secretly connects</strong> some holes to each other</li>
          <li>Learn what the <strong>numbers on wires</strong> mean (this is the #1 thing that confuses new users)</li>
          <li>Place and power your first chip — a <strong>74x32 OR gate</strong> — and make it do something</li>
          <li>Meet the three <strong>Analysis</strong> panels that let you look inside a running circuit</li>
        </ul>
        <p>Two controls worth knowing before we start: <strong>zoom</strong> with the scroll wheel, and <strong>pan</strong> by dragging with the middle mouse button (or hold <strong>Alt</strong> and drag).</p>
        <div class="onramp-hint">No electronics background needed — later lessons cover the theory. This one is just about finding your way around.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 2: How a breadboard works (red x-ray) ───────────────────────────
    {
      id: 'breadboard',
      title: 'How a Breadboard Works',
      boardState: WELCOME_EMPTY_STATE,
      showConnections: true,
      content: `
        <h2>How a Breadboard Works</h2>
        <p>A breadboard looks like a field of unrelated holes, but inside it is full of hidden metal strips. The <strong style="color:#e84338">red lines</strong> on the board right now are an x-ray of those strips: <strong>every hole touching the same red line is already connected</strong> — no wire needed.</p>
        <p>Three things to spot:</p>
        <ul>
          <li><strong>Column strips</strong> — in the main grid, each column of 5 holes (rows A–E on top, F–J on the bottom) is one strip. Plug two things into the same 5-hole column and they're joined.</li>
          <li><strong>The center channel</strong> — the gap between the two halves. Nothing crosses it. Chips sit <em>across</em> the channel so every pin lands on its own private strip.</li>
          <li><strong>Power rails</strong> — the long <strong>+</strong> and <strong>−</strong> rows along the top and bottom. Each rail row is one strip running the whole board, <em>even across the small cosmetic gaps</em> drawn every 5 holes. In 74Sim the <strong>+</strong> rail <em>is</em> the 5 V supply and the <strong>−</strong> rail is ground (0 V) — there's no separate battery part.</li>
        </ul>
        <div class="onramp-hint">The red x-ray is lesson-only — the real simulator doesn't draw it. One more detail: this board is built from tiles, and a rail stops at its tile's edge. If you ever work across multiple tiles, bridge the rails with a wire, exactly like on a real bench.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 3: Wire numbers and nets ────────────────────────────────────────
    {
      id: 'nets',
      title: 'Wire Numbers & Nets',
      boardState: WELCOME_NETS_STATE,
      fitBoard: true,
      showConnections: true,
      content: `
        <h2>Wire Numbers &amp; Nets</h2>
        <p>In 74Sim a wire is <strong>not drawn as a line</strong>. Each wire is just two dots — one on each hole it connects — stamped with a number. That keeps big circuits readable instead of burying the board in spaghetti.</p>
        <p>The rule: <strong>dots with the same number are the same electrical connection</strong>, no matter how far apart they sit. Everything joined together — strips, wires, pins — forms one <strong>net</strong>, and the number is that net's name. Dots on the same net also share a color.</p>
        <p>Look at the board:</p>
        <ul>
          <li>Three wires carry the number <strong>0</strong>. They never touch visually, but each one ends on a strip the next one starts on — one net, one number.</li>
          <li>The purple pair marked <strong>1</strong> is a separate net.</li>
          <li>The endpoints on the <strong>+</strong> rail say <strong>VCC</strong> instead of a number (ground connections say <strong>GND</strong>). A red ring around a dot means that net is currently HIGH.</li>
        </ul>
        <p><strong>Try it:</strong> press and hold the push button. Watch the LED light up through the whole numbered chain.</p>
        <div class="onramp-hint">Numbers are assigned automatically as you wire — you never have to manage them. Right-click any wire dot to see that jumper's live voltage and current.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        const led = app.state.components.find(c => c.id === 4 && c.type === COMP.LED);
        return !!(led && led.lit);
      },
      hint: {
        targets: [
          { comp: 1, label: 'Press and hold this button' },
          { comp: 4, label: 'LED — fed through the net-0 chain' },
        ],
      },
    },

    // ── Step 4: Meet the working board ───────────────────────────────────────
    {
      id: 'build_intro',
      title: 'Your First Chip',
      resetBoard: true,
      content: `
        <h2>Your First Chip: a 74x32 OR Gate</h2>
        <p>Time to build. The board now has the supporting cast already placed:</p>
        <ul>
          <li><strong>Button A</strong> (column 8) and <strong>button B</strong> (column 12) — each one puts 5 V on its strip while pressed; a pull-down resistor keeps the strip at 0 V otherwise</li>
          <li>A <strong>red LED</strong> (column 30) with its current-limiting resistor to ground</li>
        </ul>
        <p>You'll add a <strong>74x32</strong> — a chip containing four independent 2-input OR gates — and wire one gate so the LED lights when <strong>either</strong> button is pressed.</p>
        <p>In the full simulator you find parts yourself: <strong>Chip Search ▾</strong> to search any 74-series chip by number or by what it does, <strong>Input ▾</strong> for buttons and switches, <strong>Output ▾</strong> for LEDs and displays. In this lesson the toolbar above the board offers exactly the tools each step needs.</p>
        <div class="onramp-hint">The pre-placed parts are locked so you can't accidentally drag them — but buttons still press just fine.</div>
      `,
      allowedActions: [],
      validate: null,
      hint: {
        targets: [
          { comp: 1, label: 'Button A' },
          { comp: 3, label: 'Button B' },
          { comp: 5, label: 'LED' },
        ],
      },
    },

    // ── Step 5: Place the chip ───────────────────────────────────────────────
    {
      id: 'place_chip',
      title: 'Place the 74x32',
      content: `
        <h2>Place the Chip</h2>
        <p>Click <strong>Place 74x32</strong> in the toolbar, then click the breadboard to drop the chip. Place it around <strong>columns 18–24, straddling the center channel</strong>.</p>
        <p>Chips always sit across the channel: the top row of pins lands on row E, the bottom row on row F, and every pin gets its own 5-hole strip to connect to.</p>
        <p>Pin numbering is the same on every DIP chip: <strong>pin 1 is bottom-left</strong>, numbers run counterclockwise — along the bottom to pin 7, then back along the top to pin 14 at top-left.</p>
        <div class="onramp-hint">Misplaced it? Press Escape to cancel a ghost, or drag the placed chip to move it. Hover any pin to see its name.</div>
      `,
      allowedActions: ['chip:74x32'],
      validate: (app) => {
        return app.state.components.some(c => c.type === COMP.CHIP && c.chipId === '74x32' && c.placed);
      },
      hint: {
        toolbar: 'chip:74x32',
        targets: [
          { area: ['0:0:main:18:4', '0:0:main:24:5'], label: 'Place the chip here, across the channel' },
        ],
      },
    },

    // ── Step 6: Power ────────────────────────────────────────────────────────
    {
      id: 'wire_vcc',
      title: 'Connect Power (VCC)',
      content: `
        <h2>Connect Power: Pin 14 → +</h2>
        <p>Every 74-series chip needs power before it does anything. On this chip <strong>pin 14 (VCC)</strong> — the <strong>top-left</strong> pin — takes the positive supply.</p>
        <p>Click <strong>Wire</strong> in the toolbar, click <strong>pin 14</strong>, then click a hole on the <strong>+ rail</strong> above the chip. That's the whole move: wiring is always click one hole, click the other.</p>
        <div class="onramp-hint">Both endpoints of your new wire show <strong>VCC</strong> — the wire touches the + rail, so its whole net is the 5 V supply.</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x32' && c.placed);
        if (!chip) return false;
        const vccPin = chip.pins.find(p => p.name === 'VCC');
        if (!vccPin) return false;
        return isConnectedToRail(app, vccPin.holeId, true);
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { pin: { chip: '74x32', name: 'VCC' }, label: 'pin 14 (VCC)' },
          { area: ['0:0:power:16:1', '0:0:power:28:1'], label: '+ rail' },
          { arrow: { from: { pin: { chip: '74x32', name: 'VCC' } },
                     to: { area: ['0:0:power:16:1', '0:0:power:28:1'] } } },
        ],
      },
    },

    // ── Step 7: Ground ───────────────────────────────────────────────────────
    {
      id: 'wire_gnd',
      title: 'Connect Ground (GND)',
      content: `
        <h2>Connect Ground: Pin 7 → −</h2>
        <p>Now the return path: <strong>pin 7 (GND)</strong> — the <strong>bottom-right</strong> pin — goes to the <strong>− rail</strong> at the bottom of the board.</p>
        <p>Same move as before: <strong>Wire</strong>, click pin 7, click the − rail.</p>
        <div class="onramp-hint">VCC top-left, GND bottom-right is the standard layout for most 14-pin logic chips — you'll stop thinking about it very quickly.</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x32' && c.placed);
        if (!chip) return false;
        const gndPin = chip.pins.find(p => p.name === 'GND');
        if (!gndPin) return false;
        return isConnectedToRail(app, gndPin.holeId, false);
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { pin: { chip: '74x32', name: 'GND' }, label: 'pin 7 (GND)' },
          { area: ['0:0:power:16:2', '0:0:power:28:2'], label: '− rail' },
          { arrow: { from: { pin: { chip: '74x32', name: 'GND' } },
                     to: { area: ['0:0:power:16:2', '0:0:power:28:2'] } } },
        ],
      },
    },

    // ── Step 8: Input A ──────────────────────────────────────────────────────
    {
      id: 'wire_a',
      title: 'Wire Button A → Input 1A',
      content: `
        <h2>Button A → Pin 1 (1A)</h2>
        <p>Feed the first OR input. Wire from <strong>any free hole on button A's strip</strong> (column 8, rows A–E) to <strong>pin 1 (1A)</strong> — the bottom-left pin of the chip.</p>
        <p>This is the breadboard trick from earlier doing real work: the button, its pull-down and your new wire all share the column-8 strip, so they're all one net.</p>
        <div class="onramp-hint">The chip's first gate reads its two inputs on pins 1 and 2 (1A, 1B) and drives its result on pin 3 (1Y).</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x32' && c.placed);
        if (!chip) return false;
        const pin1A = chip.pins.find(p => p.name === '1A');
        if (!pin1A) return false;
        return areSameNet(app, pin1A.holeId, '0:0:main:8:1');
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { area: ['0:0:main:8:0', '0:0:main:8:4'], label: "button A's strip (col 8)" },
          { pin: { chip: '74x32', name: '1A' }, label: 'pin 1 (1A)' },
          { arrow: { from: { area: ['0:0:main:8:0', '0:0:main:8:4'] },
                     to: { pin: { chip: '74x32', name: '1A' } } } },
        ],
      },
    },

    // ── Step 9: Input B ──────────────────────────────────────────────────────
    {
      id: 'wire_b',
      title: 'Wire Button B → Input 1B',
      content: `
        <h2>Button B → Pin 2 (1B)</h2>
        <p>Same again for the second input: wire from <strong>button B's strip</strong> (column 12) to <strong>pin 2 (1B)</strong>, the second pin on the bottom row.</p>
        <div class="onramp-hint">Unconnected inputs are not "off" — they float, and floating inputs misbehave on real chips. Later lessons make a whole story of this; for now, both gate inputs get a definite signal.</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x32' && c.placed);
        if (!chip) return false;
        const pin1B = chip.pins.find(p => p.name === '1B');
        if (!pin1B) return false;
        return areSameNet(app, pin1B.holeId, '0:0:main:12:1');
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { area: ['0:0:main:12:0', '0:0:main:12:4'], label: "button B's strip (col 12)" },
          { pin: { chip: '74x32', name: '1B' }, label: 'pin 2 (1B)' },
          { arrow: { from: { area: ['0:0:main:12:0', '0:0:main:12:4'] },
                     to: { pin: { chip: '74x32', name: '1B' } } } },
        ],
      },
    },

    // ── Step 10: Output ──────────────────────────────────────────────────────
    {
      id: 'wire_led',
      title: 'Wire the Output → LED',
      content: `
        <h2>Pin 3 (1Y) → LED</h2>
        <p>Last wire: connect the gate's output, <strong>pin 3 (1Y)</strong>, to the <strong>LED's anode strip</strong> — column 30, any free hole on rows F–J below the channel.</p>
        <p>Current will flow from the pin, through the LED, through its resistor, into the − rail — and the LED will light whenever 1Y drives HIGH.</p>
        <div class="onramp-hint">The resistor limits the LED current to a safe few milliamps. Drive an LED without one and the Circuit Analyzer (two steps from now) will show you exactly why that's a bad idea.</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x32' && c.placed);
        if (!chip) return false;
        const pin1Y = chip.pins.find(p => p.name === '1Y');
        if (!pin1Y) return false;
        return areSameNet(app, pin1Y.holeId, '0:0:main:30:7');
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { pin: { chip: '74x32', name: '1Y' }, label: 'pin 3 (1Y, output)' },
          { area: ['0:0:main:30:5', '0:0:main:30:7'], label: 'LED anode strip (col 30)' },
          { arrow: { from: { pin: { chip: '74x32', name: '1Y' } },
                     to: { area: ['0:0:main:30:5', '0:0:main:30:7'] } } },
        ],
      },
    },

    // ── Step 11: Test ────────────────────────────────────────────────────────
    {
      id: 'test_or',
      title: 'Test It!',
      content: `
        <h2>Test It!</h2>
        <p>The circuit is complete. Prove it ORs:</p>
        <ol>
          <li>Press <strong>button A</strong> — the LED lights</li>
          <li>Press <strong>button B</strong> instead — the LED lights</li>
          <li>Hold <strong>both</strong> — still lit</li>
          <li>Release everything — off</li>
        </ol>
        <p>That's the OR truth table, live: the output is HIGH when <strong>at least one</strong> input is HIGH. One press of a button and you've used a real logic chip.</p>
        <div class="onramp-hint">In Lesson 2 you'll wire this exact same board to an AND gate, which lights only when <em>both</em> buttons are down. Same wiring, different chip — that's the 74-series in a nutshell.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        const led = app.state.components.find(c => c.id === 5 && c.type === COMP.LED);
        return !!(led && led.lit);
      },
      hint: {
        targets: [
          { comp: 1, label: 'Press A…' },
          { comp: 3, label: '…or B — either lights it' },
          { comp: 5, label: 'LED' },
        ],
      },
    },

    // ── Step 12: Circuit Analyzer ────────────────────────────────────────────
    {
      id: 'an_circuit',
      title: 'Analysis 1 of 3: Circuit Analyzer',
      content: `
        <h2>Analysis 1 of 3: the Circuit Analyzer</h2>
        <p>Your OR gate works — now meet the tools that show you <em>why</em> a circuit works (or doesn't). In the full simulator they live in the <strong>Analysis ▾</strong> menu at the top right. First up: the <strong>Circuit Analyzer</strong>.</p>
        ${SVG_ANALYSIS_CIRCUIT}
        <p>It's the electrical view: every net's live <strong>voltage</strong>, every resistor's and LED's <strong>current</strong>, and the total power draw. Click any row and the matching net lights up on the board.</p>
        <p>Reach for it when something is electrically wrong: an LED that stays dark (is its net even getting voltage?), a part running hot (over-current rows get flagged), or the big one — a <strong>short-circuit warning</strong> when VCC and GND touch.</p>
        <div class="onramp-hint">Try pressing a button on your board and imagine the table updating — the LED row jumping from ○ OFF to ● LIT with ~4 mA through it.</div>
      `,
      allowedActions: ['interact'],
      validate: null,
    },

    // ── Step 13: Logic Analyzer ──────────────────────────────────────────────
    {
      id: 'an_logic',
      title: 'Analysis 2 of 3: Logic Analyzer',
      content: `
        <h2>Analysis 2 of 3: the Combinational Logic Analyzer</h2>
        <p>The second panel ignores volts entirely and reads your circuit as <strong>Boolean logic</strong>.</p>
        ${SVG_ANALYSIS_LOGIC}
        <p>It names every input and output automatically (buttons become B1, B2…, LEDs become LED1…), then works out the expression connecting them. For the board you just wired it would derive <strong>LED1&nbsp;=&nbsp;B1&nbsp;+&nbsp;B2</strong> — plus a full truth table and a Karnaugh map for every output.</p>
        <p>Its state list is clickable, too: toggle switches from the panel and watch the outputs respond. Use it to check that what you <em>built</em> matches what you <em>meant</em> — invaluable once circuits grow past one gate.</p>
        <div class="onramp-hint">"+" means OR in Boolean notation, not addition — a format dropdown switches between programming style (a*b+c), math symbols (∧ ∨) and plain AND/OR words.</div>
      `,
      allowedActions: ['interact'],
      validate: null,
    },

    // ── Step 14: Timing Analysis ─────────────────────────────────────────────
    {
      id: 'an_timing',
      title: 'Analysis 3 of 3: Timing Analysis',
      content: `
        <h2>Analysis 3 of 3: Timing Analysis</h2>
        <p>The third panel answers <strong>when</strong>. Real gates aren't instant — a 74LS32 takes roughly 14–22 nanoseconds to change its output. Timing Analysis replays your circuit event by event using each chip's real <strong>propagation delay</strong> and draws the result as waveforms.</p>
        ${SVG_ANALYSIS_TIMING}
        <p>You get transport controls — <strong>Run</strong>, <strong>Step</strong> (advance to the next event), and <strong>↺ t=0</strong> — plus a speed dial from real time down to nanoseconds-per-second slow motion. To watch a signal, drop a <strong>Test Point</strong> on its net (More ▾ → Test Point in the full simulator) and it appears as a lane.</p>
        <p>This is the panel for the subtle stuff: race conditions, glitches (it can flag pulses shorter than a threshold you set), and understanding why fast circuits misbehave in ways a truth table can't explain.</p>
        <p>That's the tour. You can wire a chip, read the numbers, and you know where the x-ray tools live. Hit <strong>Finish Lesson</strong> — next up: what HIGH and LOW actually are, with charge, pushing and pulling.</p>
        <div class="onramp-hint">Want to keep playing? Open the full simulator from the home page any time — your lesson progress stays here.</div>
      `,
      allowedActions: ['interact'],
      validate: null,
    },

  ],
};


// ── Lesson 2: Logic Gates (74x08 AND) ────────────────────────────────────────
// Pre-placed: 2 push buttons with pull downs, 1 LED with resistor to GND
// User must: place 74x08, wire VCC/GND, wire inputs, wire output, test

const LESSON_1_STATE = {
  version: 1,
  components: [
    // Push Button A: VCC → button → col 8 row 3 (signal output on row 3)
    { id: 1, type: 'push_button', name: 'PBTN', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, pressed: false,
      startHoleId: '0:0:main:8:2', endHoleId: '0:0:power:8:1' },
    // Pull down A: col 8 row 3 → GND rail
    { id: 2, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 10000,
      startHoleId: '0:0:main:8:3', endHoleId: '0:0:power:8:2' },

    // Push Button B: VCC → button → col 12 row 3 (signal output on row 3)
    { id: 3, type: 'push_button', name: 'PBTN', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, pressed: false,
      startHoleId: '0:0:main:12:2', endHoleId: '0:0:power:12:1' },
    // Pull down B: col 12 row 3 → GND rail
    { id: 4, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 10000,
      startHoleId: '0:0:main:12:3', endHoleId: '0:0:power:12:2' },

    // LED: anode on the col-30 strip, cathode on the col-31 strip. The two
    // leads must sit on different strips — both on col 30 would short the LED
    // through the breadboard itself and it could never light.
    { id: 5, type: 'led', name: 'LED', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, lit: false, color: 'red',
      startHoleId: '0:0:main:30:8', endHoleId: '0:0:main:31:8' },
    // Current limiting resistor: cathode strip (col 31) → GND rail
    { id: 6, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0,
      placed: true, resistance: 470,
      startHoleId: '0:0:main:31:9', endHoleId: '0:0:power:32:2' },
  ],
  wires: [],
  lastUsedChips: [],
  extraTiles: [],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [],
};

const LESSON_1 = {
  id: 'and_gate_basics',
  title: 'Lesson 2: Logic Gates',
  description: 'Wire up a 74x08 AND gate to make an LED light when both buttons are pressed.',
  initialState: LESSON_1_STATE,
  lockedComponents: [1, 2, 3, 4, 5, 6],
  lockedWires: [],
  steps: [
    {
      id: 'intro',
      title: 'Welcome to Logic Gates',
      content: `
        <h2>Logic Gates</h2>
        <p>In this lesson, you'll wire up a <strong>74x08 AND gate</strong> to make an LED light up only when both push buttons are pressed.</p>
        <p>The breadboard already has:</p>
        <ul>
          <li>Two <strong>push buttons</strong> (with pull down resistors)</li>
          <li>One <strong>red LED</strong> (with a current limiting resistor)</li>
        </ul>
        <p>Your job is to place an AND gate chip and wire everything together.</p>
        <div class="onramp-hint">Tip: The push buttons connect to VCC when pressed. The pull down resistors ensure the signal is LOW (0V) when the button is not pressed.</div>
      `,
      allowedActions: [],
      validate: null,
      hint: {
        targets: [
          { comp: 1, label: 'Button A' },
          { comp: 3, label: 'Button B' },
          { comp: 5, label: 'LED' },
        ],
      },
    },
    {
      id: 'place_chip',
      title: 'Place the 74x08 AND Gate',
      content: `
        <h2>Step 1: Place the Chip</h2>
        <p>Click the <strong>Place 74x08</strong> button in the toolbar above, then click on the breadboard to place the chip.</p>
        <p>The chip needs to <strong>straddle the center channel</strong> place it so it spans rows E and F (the gap in the middle).</p>
        <div class="onramp-hint">Tip: Click on the breadboard between columns 18-24 to place the chip. The first click sets pin 1, the second click confirms placement across the channel.</div>
      `,
      allowedActions: ['chip:74x08'],
      validate: (app) => {
        return app.state.components.some(c => c.type === COMP.CHIP && c.chipId === '74x08' && c.placed);
      },
      hint: {
        toolbar: 'chip:74x08',
        targets: [
          { area: ['0:0:main:18:4', '0:0:main:24:5'], label: 'Place the chip here, across the channel' },
        ],
      },
    },
    {
      id: 'wire_vcc',
      title: 'Wire VCC to the Chip',
      content: `
        <h2>Step 2: Wire VCC (Power)</h2>
        <p>The 74x08 needs power to operate. Connect <strong>pin 14 (VCC)</strong> to the <strong>positive power rail</strong> (the + row at the top).</p>
        <p>Pin 14 is the <strong>top-left pin</strong> of the chip.</p>
        <div class="onramp-hint">Tip: Click "Wire" in the toolbar, then click pin 14, then click the + rail directly above it.</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x08' && c.placed);
        if (!chip) return false;
        const vccPin = chip.pins.find(p => p.name === 'VCC');
        if (!vccPin) return false;
        return isConnectedToRail(app, vccPin.holeId, true);
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { pin: { chip: '74x08', name: 'VCC' }, label: 'pin 14 (VCC)' },
          { area: ['0:0:power:16:1', '0:0:power:28:1'], label: '+ rail' },
          { arrow: { from: { pin: { chip: '74x08', name: 'VCC' } },
                     to: { area: ['0:0:power:16:1', '0:0:power:28:1'] } } },
        ],
      },
    },
    {
      id: 'wire_gnd',
      title: 'Wire GND to the Chip',
      content: `
        <h2>Step 3: Wire GND (Ground)</h2>
        <p>Now connect <strong>pin 7 (GND)</strong> to the <strong>ground rail</strong> (the - row at the bottom).</p>
        <p>Pin 7 is the <strong>bottom-right pin</strong> of the chip.</p>
        <div class="onramp-hint">Tip: Click "Wire", then click pin 7 of the chip, then click the - rail below it.</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x08' && c.placed);
        if (!chip) return false;
        const gndPin = chip.pins.find(p => p.name === 'GND');
        if (!gndPin) return false;
        return isConnectedToRail(app, gndPin.holeId, false);
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { pin: { chip: '74x08', name: 'GND' }, label: 'pin 7 (GND)' },
          { area: ['0:0:power:16:2', '0:0:power:28:2'], label: '− rail' },
          { arrow: { from: { pin: { chip: '74x08', name: 'GND' } },
                     to: { area: ['0:0:power:16:2', '0:0:power:28:2'] } } },
        ],
      },
    },
    {
      id: 'wire_input_a',
      title: 'Wire Button A to AND Input',
      content: `
        <h2>Step 4: Wire Button A → Input 1A</h2>
        <p>Connect <strong>Push Button A's signal</strong> (column 8, any row on the same strip) to the AND gate's <strong>pin 1 (1A)</strong>.</p>
        <p>Pin 1 is the <strong>bottom-left pin</strong> of the chip the first pin on the lower row.</p>
        <div class="onramp-hint">Tip: The button's signal is available on any hole in column 8, rows 0-4 (same strip). Wire from there to pin 1 of the AND gate.</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x08' && c.placed);
        if (!chip) return false;
        const pin1A = chip.pins.find(p => p.name === '1A');
        if (!pin1A) return false;
        // Button A signal is on col 8, connected via pull down resistor to col 8
        // Check if pin 1A shares a net with the button's signal
        return areSameNet(app, pin1A.holeId, '0:0:main:8:1');
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { area: ['0:0:main:8:0', '0:0:main:8:4'], label: "Button A's signal strip" },
          { pin: { chip: '74x08', name: '1A' }, label: 'pin 1 (1A)' },
          { arrow: { from: { area: ['0:0:main:8:0', '0:0:main:8:4'] },
                     to: { pin: { chip: '74x08', name: '1A' } } } },
        ],
      },
    },
    {
      id: 'wire_input_b',
      title: 'Wire Button B to AND Input',
      content: `
        <h2>Step 5: Wire Button B → Input 1B</h2>
        <p>Connect <strong>Push Button B's signal</strong> (column 12) to the AND gate's <strong>pin 2 (1B)</strong>.</p>
        <p>Pin 2 is the <strong>second pin from the left</strong> on the bottom row.</p>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x08' && c.placed);
        if (!chip) return false;
        const pin1B = chip.pins.find(p => p.name === '1B');
        if (!pin1B) return false;
        return areSameNet(app, pin1B.holeId, '0:0:main:12:1');
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { area: ['0:0:main:12:0', '0:0:main:12:4'], label: "Button B's signal strip" },
          { pin: { chip: '74x08', name: '1B' }, label: 'pin 2 (1B)' },
          { arrow: { from: { area: ['0:0:main:12:0', '0:0:main:12:4'] },
                     to: { pin: { chip: '74x08', name: '1B' } } } },
        ],
      },
    },
    {
      id: 'wire_output',
      title: 'Wire AND Output to LED',
      content: `
        <h2>Step 6: Wire Output → LED</h2>
        <p>Connect the AND gate's <strong>pin 3 (1Y, the output)</strong> to the <strong>LED's anode</strong> (column 30, row 5 or above same strip as the LED's top pin).</p>
        <p>Pin 3 is the <strong>third pin from the left</strong> on the bottom row of the chip.</p>
        <div class="onramp-hint">Tip: The LED's anode is at column 30. Wire from pin 3 of the AND gate to any hole on column 30, rows 5-8 (same strip as the LED's top end).</div>
      `,
      allowedActions: ['wire'],
      validate: (app) => {
        const chip = app.state.components.find(c => c.chipId === '74x08' && c.placed);
        if (!chip) return false;
        const pin1Y = chip.pins.find(p => p.name === '1Y');
        if (!pin1Y) return false;
        // LED anode is at 0:0:main:30:8 (startHoleId of the LED)
        return areSameNet(app, pin1Y.holeId, '0:0:main:30:7');
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { pin: { chip: '74x08', name: '1Y' }, label: 'pin 3 (1Y, output)' },
          { area: ['0:0:main:30:5', '0:0:main:30:7'], label: "LED anode strip" },
          { arrow: { from: { pin: { chip: '74x08', name: '1Y' } },
                     to: { area: ['0:0:main:30:5', '0:0:main:30:7'] } } },
        ],
      },
    },
    {
      id: 'test',
      title: 'Test Your Circuit!',
      content: `
        <h2>Step 7: Test It!</h2>
        <p>Your circuit is wired! Now test it:</p>
        <ol>
          <li>Click and <strong>hold</strong> both push buttons at the same time</li>
          <li>The LED should <strong>light up</strong>!</li>
          <li>Release one button the LED should turn <strong>off</strong></li>
        </ol>
        <p>This is the AND gate in action: the output is HIGH only when both inputs are HIGH.</p>
        <div class="onramp-hint">Tip: Click and hold one button, then while holding, click the other button too. The LED will light when both are pressed.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        return app._ledLitOnce;
      },
      hint: {
        targets: [
          { comp: 1, label: 'Hold button A…' },
          { comp: 3, label: '…and button B together' },
          { comp: 5, label: 'LED lights' },
        ],
      },
    },
  ],
};


// ── Lesson 3: Debug a Combinational Circuit ──────────────────────────────────
// Based on chipInfo/not_or_and_circuit.json with 2 intentional errors:
// 1. Wire 9 endpoint wrong: 0:0:main:8:6 → 0:0:main:8:3 (wrong row)
// 2. Component 29 (pull down resistor for push button) removed

const LESSON_2_STATE = {
  version: 1,
  components: [
    { id: 13, type: 'chip', name: '74Sim', tileX: 0, tileY: 0, col: 22, row: 4, placed: true, chipId: '74Sim' },
    { id: 4, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 470,
      startHoleId: '1:1:main:11:3', endHoleId: '1:1:main:11:7' },
    { id: 3, type: 'capacitor', name: 'C', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, capacitance: 0.0001,
      startHoleId: '1:1:main:7:4', endHoleId: '1:1:main:12:4' },
    { id: 20, type: 'chip', name: '74x04', tileX: 0, tileY: 0, col: 12, row: 4, placed: true, chipId: '74x04' },
    { id: 22, type: 'chip', name: '74x32', tileX: 0, tileY: 0, col: 20, row: 4, placed: true, chipId: '74x32' },
    { id: 14, type: 'chip', name: '74x08', tileX: 0, tileY: 0, col: 4, row: 4, placed: true, chipId: '74x08' },
    // Component 29 REMOVED (missing pull down resistor this is error #2)
    { id: 31, type: 'switch', name: 'SW', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, on: false,
      startHoleId: '0:1:main:14:2', endHoleId: '0:1:power:14:1' },
    { id: 32, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 1000,
      startHoleId: '0:1:main:14:4', endHoleId: '0:1:power:14:2' },
    { id: 33, type: 'switch', name: 'SW', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, on: false,
      startHoleId: '0:1:main:19:2', endHoleId: '0:1:power:19:1' },
    { id: 34, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 1000,
      startHoleId: '0:1:main:19:4', endHoleId: '0:1:power:19:2' },
    { id: 35, type: 'led', name: 'LED', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, lit: false, color: 'red',
      startHoleId: '0:0:main:30:9', endHoleId: '0:0:power:30:2' },
    { id: 40, type: 'push_button', name: 'PBTN', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, pressed: false,
      startHoleId: '0:1:main:9:1', endHoleId: '0:1:power:9:1' },
    { id: 41, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 10000,
      startHoleId: '0:0:main:6:2', endHoleId: '0:0:main:9:2' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:main:4:0', endHoleId: '0:0:power:4:1', startNet: 0, endNet: 0, color: '#3498db' },
    { id: 2, startHoleId: '0:0:main:10:9', endHoleId: '0:0:power:10:2', startNet: 1, endNet: 1, color: '#6c5ce7' },
    { id: 3, startHoleId: '0:0:main:12:0', endHoleId: '0:0:power:12:1', startNet: 2, endNet: 2, color: '#55efc4' },
    { id: 4, startHoleId: '0:0:main:18:9', endHoleId: '0:0:power:18:2', startNet: 3, endNet: 3, color: '#e84393' },
    { id: 5, startHoleId: '0:0:main:20:0', endHoleId: '0:0:power:20:1', startNet: 4, endNet: 4, color: '#1abc9c' },
    { id: 6, startHoleId: '0:0:main:26:9', endHoleId: '0:0:power:26:2', startNet: 5, endNet: 5, color: '#ffeaa7' },
    { id: 7, startHoleId: '0:1:main:9:3', endHoleId: '0:0:main:20:6', startNet: 6, endNet: 6, color: '#ffeaa7' },
    { id: 8, startHoleId: '0:1:main:19:3', endHoleId: '0:0:main:16:6', startNet: 7, endNet: 7, color: '#9b59b6' },
    // Wire 9: ERROR endpoint changed from 0:0:main:8:6 to 0:0:main:8:3 (wrong row)
    { id: 9, startHoleId: '0:0:main:17:6', endHoleId: '0:0:main:8:3', startNet: 8, endNet: 8, color: '#74b9ff' },
    { id: 10, startHoleId: '0:0:main:7:6', endHoleId: '0:1:main:14:3', startNet: 9, endNet: 9, color: '#9b59b6' },
    { id: 11, startHoleId: '0:0:main:9:6', endHoleId: '0:0:main:21:6', startNet: 10, endNet: 10, color: '#00cec9' },
    { id: 12, startHoleId: '0:0:main:22:6', endHoleId: '0:0:main:30:8', startNet: 11, endNet: 11, color: '#55efc4' },
  ],
  lastUsedChips: [],
  extraTiles: [{ tx: 0, ty: 1 }, { tx: 1, ty: 1 }],
  showNetPower: false,
  showRealisticBoard: false,
  textBoxes: [],
};

const LESSON_2 = {
  id: 'debug_circuit',
  title: 'Lesson 3: Debug a Circuit',
  description: 'Find and fix two errors in a combinational logic circuit.',
  initialState: LESSON_2_STATE,
  // Lock everything except wire 9 (the wrong one) and allow adding new components/wires
  lockedComponents: [13, 4, 3, 20, 22, 14, 31, 32, 33, 34, 35, 40, 41],
  lockedWires: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12], // wire 9 is NOT locked (user must delete it)
  steps: [
    {
      id: 'intro',
      title: 'The Circuit Has Bugs',
      content: `
        <h2>Debug a Combinational Circuit</h2>
        <p>This circuit uses three 74 series chips to implement a logic function:</p>
        <ul>
          <li><strong>74x08</strong> AND gate</li>
          <li><strong>74x04</strong> NOT gate (inverter)</li>
          <li><strong>74x32</strong> OR gate</li>
        </ul>
        <p>The circuit should light the LED when: <strong>Switch 1 is ON</strong> AND <strong>Switch 2 is OFF</strong> (inverted), then OR'd with the push button signal.</p>
        <p>But it has <strong>two errors</strong>. Your job is to find and fix them both.</p>
      `,
      allowedActions: [],
      validate: null,
      hint: {
        targets: [
          { comp: 14, label: '74x08 AND' },
          { comp: 20, label: '74x04 NOT' },
          { comp: 22, label: '74x32 OR' },
          { comp: 35, label: 'LED' },
        ],
      },
    },
    {
      id: 'observe',
      title: 'Observe the Problem',
      content: `
        <h2>Step 1: Observe</h2>
        <p>Try toggling the switches and pressing the push button. Notice the circuit doesn't behave correctly.</p>
        <p>The <strong>expected behavior</strong>:</p>
        <ul>
          <li>Turn <strong>Switch 1 ON</strong> and <strong>Switch 2 OFF</strong></li>
          <li>The NOT gate inverts Switch 2 → HIGH</li>
          <li>AND gate: Switch 1 (HIGH) AND NOT(Switch 2) (HIGH) → output HIGH</li>
          <li>OR gate passes this to the LED → <strong>LED ON</strong></li>
        </ul>
        <p>But when you try this, the LED doesn't light correctly. Something is wrong with the wiring.</p>
        <div class="onramp-hint">Tip: Click "Next" when you've observed the problem and are ready to start debugging.</div>
      `,
      allowedActions: ['interact'],
      validate: null,
      hint: {
        targets: [
          { comp: 31, label: 'Switch 1' },
          { comp: 33, label: 'Switch 2' },
          { comp: 40, label: 'Push button' },
          { comp: 35, label: 'Watch the LED' },
        ],
      },
    },
    {
      id: 'find_wire_error',
      title: 'Fix the Wrong Wire',
      content: `
        <h2>Step 2: Fix the Wrong Wire</h2>
        <p>Trace the signal path from the NOT gate to the AND gate:</p>
        <ol>
          <li>The <strong>NOT gate (74x04)</strong> inverts Switch 2 at gate 3 (pin 5 → pin 6, which is <code>3Y</code>)</li>
          <li>The inverted output should connect to the <strong>AND gate's pin 5</strong> (<code>2B</code>)</li>
          <li>But look at the blue wire it goes to the <strong>wrong row</strong>!</li>
        </ol>
        <p><strong>To fix:</strong></p>
        <ol>
          <li>Click the wrong wire's endpoint to select it</li>
          <li>Press <strong>Delete</strong> to remove it</li>
          <li>Click <strong>Wire</strong> and draw a new wire from the NOT output (col 17, row F) to AND pin 2B (col 8, row F)</li>
        </ol>
        <div class="onramp-hint">Tip: The wire needs to connect column 17 row 6 (bottom side) to column 8 row 6 (bottom side) both on the F row.</div>
      `,
      allowedActions: ['wire', 'delete'],
      validate: (app) => {
        // Check that 74x04-pin 3Y (col 17 row 5 = 0:0:main:17:5 on bottom side → holeId from pin)
        // is on the same net as 74x08-pin 2B
        const notGate = app.state.components.find(c => c.chipId === '74x04' && c.placed);
        const andGate = app.state.components.find(c => c.chipId === '74x08' && c.placed);
        if (!notGate || !andGate) return false;
        const pin3Y = notGate.pins.find(p => p.name === '3Y');
        const pin2B = andGate.pins.find(p => p.name === '2B');
        if (!pin3Y || !pin2B) return false;
        return areSameNet(app, pin3Y.holeId, pin2B.holeId);
      },
      hint: {
        toolbar: 'wire',
        targets: [
          { hole: '0:0:main:8:3', label: 'Wrong endpoint — delete this wire' },
          { pin: { comp: 20, name: '3Y' }, label: 'NOT output (3Y)' },
          { pin: { comp: 14, name: '2B' }, label: 'AND pin 5 (2B)' },
          { arrow: { from: { pin: { comp: 20, name: '3Y' } },
                     to: { pin: { comp: 14, name: '2B' } } } },
        ],
      },
    },
    {
      id: 'find_resistor_error',
      title: 'Add the Missing Pull Down',
      content: `
        <h2>Step 3: Add the Missing Pull Down Resistor</h2>
        <p>The push button still doesn't work correctly. When it's <strong>not pressed</strong>, its input line is <strong>floating</strong> not connected to any defined voltage.</p>
        <p>Every button needs a <strong>pull down resistor</strong> to GND so it reads LOW when not pressed.</p>
        <p>The other switch inputs have pull down resistors, but the push button is missing one.</p>
        <p><strong>To fix:</strong></p>
        <ol>
          <li>Click <strong>Resistor</strong> in the toolbar</li>
          <li>Place a resistor from the button's signal column (column 9, on the lower breadboard tile) to the <strong>GND rail</strong></li>
        </ol>
        <div class="onramp-hint">Tip: Place the resistor from hole 0:1:main:9:4 down to the GND rail at 0:1:power:9:2. Use a 1k or 10k ohm value.</div>
      `,
      allowedActions: ['resistor', 'wire'],
      validate: (app) => {
        // Check there's a resistor connected between the push button signal line and GND
        // The push button signal is on column 9 of tile 0:1
        // We need a resistor with one end on that column and the other on GND
        const resistors = app.state.components.filter(c => c.type === COMP.RESISTOR && c.placed);
        for (const r of resistors) {
          if (r.id <= 41) continue; // skip pre-existing resistors
          // Check if one end is on the button's signal net and the other on GND
          const startOnSignal = r.startHoleId && r.startHoleId.startsWith('0:1:') && r.startHoleId.includes(':9:');
          const endOnGND = r.endHoleId && r.endHoleId.includes('power') && r.endHoleId.includes(':2');
          const startOnGND = r.startHoleId && r.startHoleId.includes('power') && r.startHoleId.includes(':2');
          const endOnSignal = r.endHoleId && r.endHoleId.startsWith('0:1:') && r.endHoleId.includes(':9:');
          if ((startOnSignal && endOnGND) || (startOnGND && endOnSignal)) return true;
        }
        return false;
      },
      hint: {
        toolbar: 'resistor',
        targets: [
          { hole: '0:1:main:9:4', label: "Button's signal column" },
          { area: ['0:1:power:6:2', '0:1:power:12:2'], label: 'GND rail (−)' },
          { arrow: { from: { hole: '0:1:main:9:4' },
                     to: { area: ['0:1:power:6:2', '0:1:power:12:2'] } } },
        ],
      },
    },
    {
      id: 'verify',
      title: 'Verify the Fix',
      content: `
        <h2>Step 4: Verify Your Fix</h2>
        <p>Now test the circuit to confirm it works:</p>
        <ol>
          <li>Turn <strong>Switch 1 ON</strong> (click it)</li>
          <li>Keep <strong>Switch 2 OFF</strong></li>
          <li>The LED should <strong>light up</strong>!</li>
        </ol>
        <p>You can also try pressing the push button the OR gate means the LED should also light when the button is pressed (regardless of switch positions).</p>
        <div class="onramp-hint">Tip: Toggle the switches by clicking them. Click and hold the push button.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        return app._ledLitOnce;
      },
      hint: {
        targets: [
          { comp: 31, label: 'Switch 1 → ON' },
          { comp: 33, label: 'Switch 2 stays OFF' },
          { comp: 40, label: '…or hold the button' },
          { comp: 35, label: 'LED should light' },
        ],
      },
    },
  ],
};


// ── Lesson 1: Pushing and Pulling ────────────────────────────────────────────
// Pure theory lesson — no circuit building. All steps use the blank breadboard
// as a backdrop while SVG diagrams in the instruction panel carry the content.

const LESSON_PUSH_PULL_STATE = {
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





// ── Quiz circuit board states ─────────────────────────────────────────────────
// Each quiz puts a *real* circuit on the breadboard (verified through the debug
// harness) and asks the learner to identify its output type. The boards are
// loaded read-only by the player (every component/wire is locked).

// Circuit A — Open-drain: a 74x07 open-collector buffer whose output is held
// HIGH only by an external pull-up resistor to VCC. The pull-up is the tell.
const QUIZ_STATE_OPEN_DRAIN = {
  version: 1,
  components: [
    { id: 1, type: 'chip', name: '74x07', tileX: 0, tileY: 0, col: 4, row: 4, placed: true, chipId: '74x07' },
    { id: 10, type: 'led', name: 'LED', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, lit: false, color: 'red',
      startHoleId: '0:0:main:5:7', endHoleId: '0:0:main:14:7' },
    { id: 11, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 470,
      startHoleId: '0:0:main:14:8', endHoleId: '0:0:power:14:2' },
    { id: 12, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 1000,
      startHoleId: '0:0:main:5:6', endHoleId: '0:0:power:5:1' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:main:4:3', endHoleId: '0:0:power:4:1', color: '#e74c3c' },
    { id: 2, startHoleId: '0:0:main:10:9', endHoleId: '0:0:power:10:2', color: '#27ae60' },
    { id: 3, startHoleId: '0:0:main:4:6', endHoleId: '0:0:power:4:1', color: '#e74c3c' },
  ],
  lastUsedChips: [], extraTiles: [], showNetPower: false, showRealisticBoard: false, textBoxes: [],
};

// Circuit B — Push-pull: a 74x08 AND gate driving the LED directly, with no
// external pull resistor on its output. Active in both directions.
const QUIZ_STATE_PUSH_PULL = {
  version: 1,
  components: [
    { id: 1, type: 'chip', name: '74x08', tileX: 0, tileY: 0, col: 4, row: 4, placed: true, chipId: '74x08' },
    { id: 10, type: 'led', name: 'LED', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, lit: false, color: 'red',
      startHoleId: '0:0:main:6:7', endHoleId: '0:0:main:14:7' },
    { id: 11, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 470,
      startHoleId: '0:0:main:14:8', endHoleId: '0:0:power:14:2' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:main:4:3', endHoleId: '0:0:power:4:1', color: '#e74c3c' },
    { id: 2, startHoleId: '0:0:main:10:9', endHoleId: '0:0:power:10:2', color: '#27ae60' },
    { id: 3, startHoleId: '0:0:main:4:6', endHoleId: '0:0:power:4:1', color: '#e74c3c' },
    { id: 4, startHoleId: '0:0:main:5:6', endHoleId: '0:0:power:5:1', color: '#e74c3c' },
  ],
  lastUsedChips: [], extraTiles: [], showNetPower: false, showRealisticBoard: false, textBoxes: [],
};

// Circuit C — Tri-state: a 74x125 bus buffer whose output-enable (OE) pin
// decides whether the output drives the net at all. The OE control line is the tell.
const QUIZ_STATE_TRISTATE = {
  version: 1,
  components: [
    { id: 1, type: 'chip', name: '74x125', tileX: 0, tileY: 0, col: 4, row: 4, placed: true, chipId: '74x125' },
    { id: 10, type: 'led', name: 'LED', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, lit: false, color: 'red',
      startHoleId: '0:0:main:6:7', endHoleId: '0:0:main:14:7' },
    { id: 11, type: 'resistor', name: 'R', tileX: 0, tileY: 0, col: 0, row: 0, placed: true, resistance: 470,
      startHoleId: '0:0:main:14:8', endHoleId: '0:0:power:14:2' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:main:4:3', endHoleId: '0:0:power:4:1', color: '#e74c3c' },
    { id: 2, startHoleId: '0:0:main:10:9', endHoleId: '0:0:power:10:2', color: '#27ae60' },
    { id: 3, startHoleId: '0:0:main:4:6', endHoleId: '0:0:power:4:2', color: '#9b59b6' },
    { id: 4, startHoleId: '0:0:main:5:6', endHoleId: '0:0:power:5:1', color: '#e74c3c' },
  ],
  lastUsedChips: [], extraTiles: [], showNetPower: false, showRealisticBoard: false, textBoxes: [],
};

// ── Quiz setup helper ─────────────────────────────────────────────────────────

export function makeQuizSetup() {
  return (app) => {
    app._quizAnswered = false;
    const options = app._contentEl.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('correct', 'incorrect'));
        const isCorrect = opt.dataset.answer === 'correct';
        opt.classList.add(isCorrect ? 'correct' : 'incorrect');
        app._quizAnswered = isCorrect;
        // Selecting the right answer advances the quiz — there is no Check button.
        if (isCorrect && !app._stepCompleted.has(app.currentStepIdx)) {
          app._onStepComplete();
        }
      });
    });
  };
}

// ── Lesson definition ─────────────────────────────────────────────────────────

const LESSON_PUSH_PULL = {
  id: 'push_pull_intro',
  title: 'Lesson 1: Pushing and Pulling',
  description: 'Understand how charge is pushed and pulled on a net, and why output type matters in real hardware.',
  initialState: LESSON_PUSH_PULL_STATE,
  lockedComponents: [],
  lockedWires: [],
  steps: [

    // ── Step 1: Concept intro ────────────────────────────────────────────────
    {
      id: 'intro',
      title: 'Pushing and Pulling',
      fullWidth: true,
      content: `
        <h2>Pushing and Pulling Charge</h2>
        <p>In a pure digital system, an active input produces a HIGH, and when it's released the signal returns to LOW automatically. Clean and simple.</p>
        <p>Real hardware is different. When voltage is applied to a net, <strong>charge builds up</strong> in the parasitic capacitance of the traces, pins, and components on that net.</p>
        <p>When the voltage source is removed, that charge doesn't disappear — it stays trapped, keeping the net logically HIGH. Without a path to ground, the net <strong>floats</strong> at whatever charge remains.</p>
        <p>This gives us two fundamental operations:</p>
        <ul>
          <li><strong>Pushing charge</strong> — a path from a supply voltage to the net, driving it HIGH by charging the parasitic capacitance</li>
          <li><strong>Pulling charge</strong> — a path from the net to ground, draining that charge and driving the net LOW</li>
        </ul>
        <p>Every output pin in digital hardware is built around some combination of these two operations. The four types are covered on the next pages.</p>
        <div class="onramp-hint">In the simulator, nets default to 0 V — floating is modelled as LOW. Physical hardware is subtler, which is why output types matter.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 2: Push-Only ────────────────────────────────────────────────────
    {
      id: 'push_only',
      title: 'Push-Only Output',
      fullWidth: true,
      content: `
        <h2>Push-Only</h2>
        <p>A push-only output can drive the net HIGH but has <strong>no active path to ground</strong>. To bring the net back LOW, an <strong>external pull-down resistor</strong> must drain the charge.</p>
        ${SVG_PUSH_ONLY}
        <p>Here the button acts as the push-only device. When pressed it connects VCC to the net, pushing charge in. When released, the resistor provides the only discharge path, slowly pulling the net back to GND.</p>
        <p>Without the pull-down resistor the net would float HIGH indefinitely after being pressed once.</p>
        <div class="onramp-hint">Push-only is rarely used inside a chip pin — it has no advantages over open-drain and is less power efficient. But it's a useful model for simple switch circuits.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 3: Push-Pull ────────────────────────────────────────────────────
    {
      id: 'push_pull',
      title: 'Push-Pull (Totem Pole)',
      fullWidth: true,
      content: `
        <h2>Push-Pull (Totem Pole)</h2>
        <p>Push-pull uses two transistors — one connected to the supply, one to ground. It <strong>actively pushes</strong> to drive HIGH and <strong>actively pulls</strong> to drive LOW.</p>
        <p>This is the standard output for most logic gates. Because both transitions are active, switching is fast and the output voltage is well-defined in both states.</p>
        ${SVG_PUSH_PULL}
        <p>You can model it as an SPDT switch: one throw connected to VCC, the other to GND, with the pole as the output. The lever can only sit in one position at a time — either pushing or pulling.</p>
        <div class="onramp-hint">Most 74 series gates (74x08 AND, 74x04 NOT, 74x32 OR) have push-pull outputs. No external pull resistors needed.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 4: Open-Drain ───────────────────────────────────────────────────
    {
      id: 'open_drain',
      title: 'Open-Drain (Open-Collector)',
      fullWidth: true,
      content: `
        <h2>Open-Drain / Open-Collector</h2>
        <p>The output stage has <strong>only a transistor to ground</strong>. It can pull the net LOW, but it <em>cannot</em> actively drive it HIGH. To reach a HIGH state, an <strong>external pull-up resistor</strong> connected to the supply is required.</p>
        ${SVG_OPEN_DRAIN}
        <p>When the transistor turns off, the pull-up resistor slowly charges the net toward VCC. The speed of the HIGH transition depends on the resistor value and the net's capacitance.</p>
        <p>Two important uses:</p>
        <ul>
          <li><strong>Wired-OR / Wired-AND</strong> — multiple open-drain outputs can share one wire without contention. Any device pulling LOW wins.</li>
          <li><strong>Voltage translation</strong> — the pull-up can be at a different voltage than the driving chip, allowing easy level shifting.</li>
        </ul>
        <div class="onramp-hint">I²C (SDA and SCL) uses open-drain for exactly this reason — any device on the bus can pull the line low, and the pull-up restores it to idle-HIGH.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 5: Tri-State ────────────────────────────────────────────────────
    {
      id: 'tri_state',
      title: 'Tri-State (Hi-Z)',
      fullWidth: true,
      content: `
        <h2>Tri-State (High-Impedance)</h2>
        <p>Tri-state extends push-pull with a <strong>third state: disconnected</strong>. The output can be driven HIGH, driven LOW, or put into a <strong>high-impedance (Hi-Z)</strong> state where it effectively disconnects from the net entirely.</p>
        ${SVG_TRISTATE}
        <p>In the SPDT model, the middle position leaves the pole floating — connected to neither VCC nor GND. The output sits at whatever voltage the rest of the net imposes.</p>
        <p>This is what makes shared buses possible. In a CPU memory bus, for example, many chips are wired to the same data lines. Only one chip drives at a time; all others tri-state their outputs to avoid contention.</p>
        <div class="onramp-hint">The OE (output enable) pin on many 74 series chips (74x244, 74x245 buffers) controls tri-state. Pull OE LOW to drive, pull it HIGH to go Hi-Z.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 6: Quiz intro ───────────────────────────────────────────────────
    {
      id: 'quiz_intro',
      title: 'Knowledge Check',
      fullWidth: true,
      content: `
        <h2>Knowledge Check</h2>
        <p>Three short questions. Each one puts a <strong>real circuit on the board</strong> — read it and identify which output type the chip uses.</p>
        <ul>
          <li><strong>Push-Only</strong> — active path to VCC only; needs external pull-down</li>
          <li><strong>Open-Drain</strong> — active path to GND only; needs external pull-up</li>
          <li><strong>Push-Pull</strong> — active paths to both VCC and GND; fast transitions</li>
          <li><strong>Tri-State</strong> — push-pull plus a disconnected (Hi-Z) state via enable</li>
        </ul>
        <p>Select the correct answer to move on.</p>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 7: Quiz 1 ───────────────────────────────────────────────────────
    {
      id: 'quiz_1',
      title: 'Quiz 1 of 3',
      boardState: QUIZ_STATE_OPEN_DRAIN,
      content: `
        <h2>Quiz 1 of 3</h2>
        <p>Look at the circuit on the board. A <strong>74x07</strong> buffer drives the LED, and its output is tied up to <strong>VCC through a resistor</strong> — without that resistor the output could never reach HIGH.</p>
        <p>What output type does this chip use?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Push-Only</button>
          <button class="quiz-option" data-answer="correct">B) Open-Drain</button>
          <button class="quiz-option" data-answer="wrong">C) Push-Pull (Totem Pole)</button>
          <button class="quiz-option" data-answer="wrong">D) Tri-State</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },

    // ── Step 8: Quiz 2 ───────────────────────────────────────────────────────
    {
      id: 'quiz_2',
      title: 'Quiz 2 of 3',
      boardState: QUIZ_STATE_PUSH_PULL,
      content: `
        <h2>Quiz 2 of 3</h2>
        <p>This circuit uses a <strong>74x08</strong> AND gate to drive the LED <strong>directly</strong> — notice there is no pull-up or pull-down resistor on its output. The gate actively drives both HIGH and LOW.</p>
        <p>What output type does the gate use?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Open-Drain</button>
          <button class="quiz-option" data-answer="wrong">B) Tri-State</button>
          <button class="quiz-option" data-answer="correct">C) Push-Pull (Totem Pole)</button>
          <button class="quiz-option" data-answer="wrong">D) Push-Only</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },

    // ── Step 9: Quiz 3 ───────────────────────────────────────────────────────
    {
      id: 'quiz_3',
      title: 'Quiz 3 of 3',
      boardState: QUIZ_STATE_TRISTATE,
      content: `
        <h2>Quiz 3 of 3</h2>
        <p>Here a <strong>74x125</strong> buffer drives the LED, but it also has an <strong>output-enable (OE)</strong> line wired to a rail. That OE pin decides whether the output is connected to the net at all — when disabled, the output floats (Hi-Z).</p>
        <p>What output type is this?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Push-Only</button>
          <button class="quiz-option" data-answer="wrong">B) Push-Pull (Totem Pole)</button>
          <button class="quiz-option" data-answer="wrong">C) Open-Drain</button>
          <button class="quiz-option" data-answer="correct">D) Tri-State</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },

  ],
};


// ═══ Lesson 4: Latches & Flip-Flops ═══════════════════════════════════════════
// First taste of state: cross-coupled NOR gates hold a bit, a clock turns the
// latch into a flip-flop. Demo boards from the CD4001 SR-latch and CD4013
// coin-toss examples (see onramp-lesson-boards.js).



const LESSON_LATCHES = {
  id: 'latches_flipflops',
  title: 'Lesson 4: Latches & Flip-Flops',
  description: 'Meet the first circuit that remembers: cross-coupled gates form a latch, and a clocked flip-flop stores one bit per tick.',
  initialState: CD4001_SR_LATCH_BOARD,
  lockedComponents: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  lockedWires: [1, 2, 3, 4],
  steps: [
    {
      id: 'what_is_state',
      title: 'What "State" Means',
      fullWidth: true,
      content: `
        <h2>Circuits That Remember</h2>
        <p>Everything you have built so far is <strong>combinational</strong>: the output depends only on what the inputs are <em>right now</em>. Release the buttons on the AND-gate board and the LED goes out — the circuit has no idea the buttons were ever pressed.</p>
        <p><strong>Sequential</strong> circuits are different. Their output depends on inputs <em>and on what happened before</em>. They have <strong>state</strong> — a stored value that persists after the input that created it is gone.</p>
        <p>The trick that makes this possible is <strong>feedback</strong>: route a gate's output back around to its own input, and the circuit's present output becomes part of its own future input. The loop can hold itself in a condition indefinitely.</p>
        <p>Every kind of memory in a computer — registers, cache, RAM — is built on this one idea. In this lesson you'll meet the two simplest forms:</p>
        <ul>
          <li>The <strong>SR latch</strong> — two gates in a feedback loop, set and reset directly</li>
          <li>The <strong>D flip-flop</strong> — a latch that only updates when a clock ticks</li>
        </ul>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'sr_latch_theory',
      title: 'The SR Latch',
      fullWidth: true,
      content: `
        <h2>The SR Latch</h2>
        <p>Take two NOR gates and cross-wire them: each gate's output feeds one input of the other. The two free inputs are called <strong>S (set)</strong> and <strong>R (reset)</strong>.</p>
        ${SVG_SR_LATCH}
        <p>A NOR gate outputs HIGH only when <em>both</em> inputs are LOW. Work through the loop and four behaviours fall out:</p>
        <ul>
          <li><strong>S=1, R=0 — SET.</strong> Q is forced HIGH, and stays HIGH.</li>
          <li><strong>S=0, R=1 — RESET.</strong> Q is forced LOW, and stays LOW.</li>
          <li><strong>S=0, R=0 — HOLD.</strong> Neither input interferes; the feedback loop keeps whatever Q already was. <em>This is the memory.</em></li>
          <li><strong>S=1, R=1 — forbidden.</strong> Both outputs are forced LOW at once (Q and Q&#772; are supposed to be opposites), and when the inputs release, the loop lands unpredictably. Real designs avoid this input.</li>
        </ul>
        <div class="onramp-hint">Q&#772; ("Q-bar") is the complement output — always the opposite of Q. Having both available for free is a side effect of the cross-coupled structure.</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'sr_latch_board',
      title: 'SR Latch on the Board',
      boardState: CD4001_SR_LATCH_BOARD,
      content: `
        <h2>Try It: a Real SR Latch</h2>
        <p>On the board is a <strong>CD4001</strong> — four NOR gates in one package, two of them cross-wired exactly like the diagram. The <strong>SET</strong> button (right, column 24) drives S; the <strong>RESET</strong> button (left, column 20) drives R. Green LED = Q, red LED = Q&#772;.</p>
        <ol>
          <li><strong>Press and release SET.</strong> The green Q LED turns on — and stays on. The circuit remembers the press.</li>
          <li><strong>Press and release RESET.</strong> Q goes out, the red Q&#772; LED takes over — and holds.</li>
          <li>With both buttons released the latch is in <strong>HOLD</strong>: poke nothing, and it keeps its bit forever.</li>
        </ol>
        <p>Note the 10&nbsp;k&#8486; pull-down resistor under each button — the same rule you learned in Lesson 1. A CMOS input must never float, and HOLD only works if a released button reads a clean LOW.</p>
        <div class="onramp-hint">Complete this step by pressing SET so the green Q LED latches ON.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        const q = app.state.components.find(c => c.id === 8 && c.type === COMP.LED);
        return !!(q && q.lit);
      },
      hint: {
        targets: [
          { comp: 5, label: 'Press SET' },
          { comp: 3, label: 'RESET' },
          { comp: 8, label: 'Q — latches ON' },
          { comp: 10, label: 'Q̄ (opposite)' },
        ],
      },
    },
    {
      id: 'dff_theory',
      title: 'From Latch to Flip-Flop',
      fullWidth: true,
      content: `
        <h2>Adding a Clock</h2>
        <p>The SR latch reacts the instant an input changes. That's fine for buttons, but inside a computer <em>millions</em> of stored bits must all update in lockstep, or the machine falls apart. The fix: only let the latch change at one agreed moment — the tick of a <strong>clock</strong>.</p>
        ${SVG_D_FF}
        <p>A <strong>D flip-flop</strong> wraps a latch behind edge-detecting logic. It has a single data input, <strong>D</strong>, and a clock input, <strong>CLK</strong>:</p>
        <ul>
          <li>On each <strong>rising edge</strong> of CLK (the instant it goes LOW&#8594;HIGH), Q takes a snapshot of whatever D is at that moment.</li>
          <li>At <em>every other time</em> — D can change all it likes — Q holds the snapshot.</li>
        </ul>
        <p>The little triangle on the CLK pin in the symbol is how datasheets say "edge-triggered". One flip-flop stores one bit per tick; put 8 side by side sharing a clock and you have a register holding a byte.</p>
        <div class="onramp-hint">One classic trick: wire Q&#772; back to D. Every clock edge then loads the <em>opposite</em> of the current state — the flip-flop toggles, dividing the clock frequency by 2. You're about to see it.</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'dff_board',
      title: 'D Flip-Flop on the Board',
      boardState: CD4013_COINTOSS_BOARD,
      content: `
        <h2>Try It: the Coin Toss</h2>
        <p>This board uses half of a <strong>CD4013</strong> dual D flip-flop, wired as the toggle from the last page: Q&#772; (pin 2) feeds back into D (pin 5), so every clock edge flips the state. Green LED = HEADS (Q), red LED = TAILS (Q&#772;) — always opposites.</p>
        <p>A 240&nbsp;Hz clock is on the board, but it only reaches the CLK pin <strong>while you hold the TOSS button</strong>:</p>
        <ol>
          <li><strong>Hold TOSS.</strong> The flip-flop toggles 240 times a second — far faster than your eye can follow, both LEDs blur.</li>
          <li><strong>Release.</strong> The last clock edge wins, and the latch holds it: heads or tails, genuinely unpredictable.</li>
        </ol>
        <p>Notice the supporting cast, all ideas you already know: a 10&nbsp;k pull-down keeps CLK at a clean LOW while the button is open (no floating input, no stray edges), and the CD4013's SET/RESET pins are tied to GND to keep them out of the way.</p>
        <div class="onramp-hint">Complete this step by holding TOSS for a moment, then releasing — flip a few coins.</div>
      `,
      allowedActions: ['interact'],
      // Completes the moment TOSS goes down; step-completion is sticky, so
      // releasing afterwards doesn't un-complete it.
      validate: (app) => app.state.components.some(c => c.type === COMP.PUSH_BUTTON && c.pressed),
      hint: {
        targets: [
          { comp: 3, label: 'Hold TOSS, then release' },
          { comp: 6, label: 'HEADS (Q)' },
          { comp: 8, label: 'TAILS (Q̄)' },
        ],
      },
    },
    {
      id: 'quiz_hold',
      title: 'Quiz 1 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 3</h2>
        <p>An SR latch has <strong>both S and R at 0</strong>. What is it doing?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Forcing Q LOW</button>
          <button class="quiz-option" data-answer="correct">B) Holding whatever value Q already had</button>
          <button class="quiz-option" data-answer="wrong">C) Forcing Q HIGH</button>
          <button class="quiz-option" data-answer="wrong">D) Oscillating between HIGH and LOW</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_edge',
      title: 'Quiz 2 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 3</h2>
        <p>On a D flip-flop, <strong>when</strong> does Q change?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Whenever D changes</button>
          <button class="quiz-option" data-answer="wrong">B) Whenever CLK is HIGH</button>
          <button class="quiz-option" data-answer="correct">C) Only at the rising edge of CLK</button>
          <button class="quiz-option" data-answer="wrong">D) Only when S and R are both 1</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_float',
      title: 'Quiz 3 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 3 of 3</h2>
        <p>Both demo boards put a <strong>10&nbsp;k&#8486; resistor to GND</strong> on every button-driven input. Why?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) To protect the LEDs from overcurrent</button>
          <button class="quiz-option" data-answer="wrong">B) To slow the clock down to a visible speed</button>
          <button class="quiz-option" data-answer="correct">C) So a released button reads a clean LOW — CMOS inputs must never float</button>
          <button class="quiz-option" data-answer="wrong">D) To make the button press HIGH instead of LOW</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 5: Schmitt Triggers ═══════════════════════════════════════════════
// Hysteresis: two thresholds clean up slow/noisy edges — and make the
// simplest possible oscillator (74x14 + RC, from SchmittTriggerClock.json).



const LESSON_SCHMITT = {
  id: 'schmitt_triggers',
  title: 'Lesson 5: Schmitt Triggers',
  description: 'A gate with hysteresis: two switching thresholds turn a slow, noisy signal into a clean digital edge — and make a simple RC oscillator.',
  initialState: SCHMITT_CLOCK_BOARD,
  lockedComponents: [1, 3, 6, 19, 20, 22],
  lockedWires: [50, 51, 61, 62, 63, 64],
  steps: [
    {
      id: 'noisy_edges',
      title: 'The Problem: Slow, Noisy Edges',
      fullWidth: true,
      content: `
        <h2>Real Signals Are Ugly</h2>
        <p>Logic diagrams draw signals as perfect square edges. Real inputs often aren't: a capacitor charging, a sensor warming up, a long wire picking up interference, a mechanical switch bouncing — all of these <strong>cross the logic threshold slowly, with noise on top</strong>.</p>
        ${SVG_SLOW_EDGE}
        <p>An ordinary gate has <strong>one</strong> threshold voltage. While a slow input crawls through that threshold, every little noise wiggle re-crosses it — and the output <strong>chatters</strong>, firing a burst of false edges instead of one clean transition.</p>
        <p>Feed that chattering output into a counter or a flip-flop (Lesson 4!) and it will count every false edge. One button press becomes fifteen.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'hysteresis',
      title: 'Hysteresis: Two Thresholds',
      fullWidth: true,
      content: `
        <h2>The Fix: Two Thresholds</h2>
        <p>A <strong>Schmitt trigger</strong> is a gate with <strong>hysteresis</strong>: instead of one threshold it has two.</p>
        ${SVG_HYSTERESIS}
        <ul>
          <li>A <strong>rising</strong> input doesn't flip the output until it climbs above the <strong>upper threshold V<sub>T+</sub></strong>.</li>
          <li>A <strong>falling</strong> input doesn't flip it back until it drops below the <strong>lower threshold V<sub>T&#8722;</sub></strong>.</li>
        </ul>
        <p>After the output flips, the input would have to backtrack all the way across the <em>gap between the thresholds</em> to flip it again. Noise smaller than that gap does nothing: one crossing, one clean edge.</p>
        <p>The distinctive "hysteresis loop" glyph inside the gate symbol marks a Schmitt input. The <strong>74x14</strong> is the classic part: six Schmitt-trigger inverters in one package.</p>
        <div class="onramp-hint">Hysteresis has a bonus superpower: because the gate flips at two <em>different</em> voltages, it can turn a smoothly drifting analog voltage into an oscillation. Next page.</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'rc_oscillator',
      title: 'The RC Oscillator',
      boardState: SCHMITT_CLOCK_BOARD,
      content: `
        <h2>Watch It: a One-Gate Clock</h2>
        <p>On the board, a <strong>74x14</strong> Schmitt inverter has its output fed back to its own input through a resistor, with a capacitor from the input to GND. That's the whole oscillator — and the LED is blinking to prove it.</p>
        <p>Follow one cycle:</p>
        <ol>
          <li>Say the cap is discharged: input LOW &#8594; inverter output HIGH &#8594; the output <strong>charges the cap</strong> through the resistor.</li>
          <li>The cap voltage creeps up... past V<sub>T&#8722;</sub>... nothing happens (hysteresis!)... until it crosses <strong>V<sub>T+</sub></strong> — the output snaps LOW.</li>
          <li>Now the output <strong>discharges the cap</strong> back down until it crosses <strong>V<sub>T&#8722;</sub></strong> — the output snaps HIGH again. Repeat forever.</li>
        </ol>
        <p>The cap shuttles between the two thresholds, and the output is a square wave. The frequency is set by how fast the RC pair moves the cap between V<sub>T&#8722;</sub> and V<sub>T+</sub>: <strong>bigger R or bigger C &#8594; slower clock</strong>.</p>
        <p>An ordinary inverter could not do this: with a single threshold there is no gap to shuttle across, and the loop just settles at the threshold and sits there.</p>
        <div class="onramp-hint">A second 74x14 gate buffers the oscillator to the LED so the blinking load doesn't disturb the timing node.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => app._ledLitOnce,
      hint: {
        targets: [
          { comp: 3, label: 'the cap — shuttling between thresholds' },
          { comp: 19, label: 'R feeds the output back' },
          { comp: 22, label: 'watch it blink' },
        ],
      },
    },
    {
      id: 'quiz_why_two',
      title: 'Quiz 1 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 2</h2>
        <p>Why does a Schmitt trigger <strong>ignore noise</strong> that an ordinary gate would chatter on?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) It filters the input with an internal capacitor</button>
          <button class="quiz-option" data-answer="correct">B) After flipping, the input must cross a different, farther threshold to flip it back</button>
          <button class="quiz-option" data-answer="wrong">C) It responds more slowly than a normal gate</button>
          <button class="quiz-option" data-answer="wrong">D) Its output is open-drain</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_freq',
      title: 'Quiz 2 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 2</h2>
        <p>In the RC oscillator you just watched, what sets the <strong>blink frequency</strong>?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The number of inverters in the 74x14 package</button>
          <button class="quiz-option" data-answer="wrong">B) The LED's forward voltage</button>
          <button class="quiz-option" data-answer="wrong">C) The VCC supply voltage alone</button>
          <button class="quiz-option" data-answer="correct">D) The R and C values — how fast the cap moves between the two thresholds</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 6: Glitches & Hazards ═════════════════════════════════════════════
// Propagation delay makes two paths race; the loser's lateness punches a
// momentary wrong answer (a glitch) out of a combinational circuit. The board
// freezes a static-1 hazard in time: two switches stand in for SEL and its
// too-slow inverter, and a CD4013 toggle wired to the output proves the
// glitch registers as a real clock edge.





const LESSON_GLITCHES = {
  id: 'glitches_hazards',
  title: 'Lesson 6: Glitches & Hazards',
  description: 'Gates take time to answer. When two signal paths race, the output can blip a wrong value — a glitch. Freeze one in slow motion and watch a flip-flop count it as real.',
  initialState: GLITCH_HAZARD_BOARD,
  lockedComponents: [1, 2, 3, 10, 11, 12, 13, 20, 21, 22, 23],
  lockedWires: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  steps: [

    // ── Step 1: Propagation delay ────────────────────────────────────────────
    {
      id: 'prop_delay',
      title: 'Gates Take Time',
      fullWidth: true,
      content: `
        <h2>Gates Take Time</h2>
        <p>So far you've treated logic gates as instant: change an input, the output updates. Real silicon doesn't work that way. When an input changes, the new value has to charge and discharge the transistors inside the gate before the output pin moves.</p>
        ${SVG_PROP_DELAY}
        <p>That lag is called <strong>propagation delay</strong> (t<sub>pd</sub>) — around <strong>10 nanoseconds</strong> for a classic LS-family gate. Ten billionths of a second sounds like nothing, but it has two consequences that shape all of digital design:</p>
        <ul>
          <li>Chain gates together and the delays <strong>add up</strong> — a signal through five gates arrives five gate-delays late.</li>
          <li>Send one signal down <strong>two different paths</strong> and the copies arrive at <strong>different times</strong>.</li>
        </ul>
        <p>That second one is where the trouble lives. This lesson is about what happens in the gap.</p>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 2: Two paths race ───────────────────────────────────────────────
    {
      id: 'two_paths',
      title: 'Two Paths Race',
      fullWidth: true,
      content: `
        <h2>Two Paths Race</h2>
        <p>Here's a 2-way <strong>selector</strong>: when SEL is 1, output Y follows input A; when SEL is 0, Y follows input B. One AND gate per input, an OR to combine them, and an inverter so only one AND is enabled at a time: <strong>Y&nbsp;=&nbsp;A&#183;SEL&nbsp;+&nbsp;B&#183;SEL&#772;</strong>.</p>
        ${SVG_HAZARD_CIRCUIT}
        <p>Notice that SEL reaches the two AND gates by <strong>paths of different length</strong>: the top AND gets it directly, the bottom AND gets it <em>through the inverter</em> — one extra gate-delay later.</p>
        <p>Now set both data inputs HIGH (A&nbsp;=&nbsp;B&nbsp;=&nbsp;1). Whichever way SEL points, Y should be 1. Flipping SEL just hands the job from one AND gate to the other — the output has no reason to change.</p>
        <p>A circuit where unequal delays <em>can</em> produce a momentary wrong output is said to have a <strong>hazard</strong>. Whether it actually misbehaves comes down to a race measured in nanoseconds.</p>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 3: The glitch on a timing diagram ───────────────────────────────
    {
      id: 'timing',
      title: 'Anatomy of a Glitch',
      fullWidth: true,
      content: `
        <h2>Anatomy of a Glitch</h2>
        <p>Watch the handoff in slow motion. SEL falls from 1 to 0. The top AND turns off <em>immediately</em>. But the bottom AND can't turn on until the inverter finishes — one gate-delay later.</p>
        ${SVG_HAZARD_TIMING}
        <p>In that window <strong>both AND gates output 0 at once</strong>, so Y drops LOW for a few nanoseconds before recovering. The unwanted pulse is a <strong>glitch</strong>; the circuit flaw that permits it is the hazard.</p>
        <p>This flavour — output supposed to sit at 1, briefly dips to 0 — is a <strong>static-1 hazard</strong>. (Its mirror image, a 0 that blips HIGH, is a static-0 hazard.)</p>
        <div class="onramp-hint">Vocabulary worth keeping straight: the <em>hazard</em> is the design property ("this circuit can glitch"); the <em>glitch</em> is the event ("there it went"). Datasheets and textbooks use both.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 4: Meet the board ───────────────────────────────────────────────
    {
      id: 'board_intro',
      title: 'The Hazard, On the Bench',
      content: `
        <h2>The Hazard, On the Bench</h2>
        <p>That exact selector is on the board: a <strong>74x08</strong> provides the two AND gates, a <strong>74x32</strong> the OR, and both data inputs are wired straight to VCC (A&nbsp;=&nbsp;B&nbsp;=&nbsp;1). The green LED (column 33) shows Y — lit, as it should be.</p>
        <p>One honest confession first: 74Sim's engine is idealized — it settles every net <strong>instantly</strong>, with no propagation delay. A real 10&nbsp;ns glitch can't happen here on its own. So we'll cheat time: the inverter has been <em>removed</em> and replaced with a second switch.</p>
        <ul>
          <li><strong>Left switch (column 0)</strong> — SEL itself.</li>
          <li><strong>Right switch (column 2)</strong> — what the inverter's output <em>should</em> be. <strong>You</strong> are the inverter now, and your fingers are gloriously slow.</li>
        </ul>
        <p>There's one more player: a <strong>CD4013 flip-flop</strong> wired as a toggle (Q&#772; feeding D — the coin-toss trick from Lesson 4), with its <strong>clock pin connected to Y</strong>. The red LED (column 36) shows its state. Remember which state it's in.</p>
        <div class="onramp-hint">Current state: SEL is ON, the inverter stand-in is OFF — consistent, since a real inverter outputs the opposite of its input. Y is HIGH. All quiet.</div>
      `,
      allowedActions: ['interact'],
      validate: null,
      hint: {
        targets: [
          { comp: 10, label: 'SEL (left)' },
          { comp: 12, label: 'inverter stand-in (right)' },
          { comp: 21, label: 'Y — green' },
          { comp: 23, label: 'flip-flop — red' },
        ],
      },
    },

    // ── Step 5: Create the glitch ────────────────────────────────────────────
    {
      id: 'make_glitch',
      title: 'Step Into the Glitch',
      content: `
        <h2>Step Into the Glitch</h2>
        <p>Time to flip SEL from 1 to 0 — the handoff from the A gate to the B gate. In real hardware the inverter would follow 10&nbsp;ns behind. You'll take considerably longer.</p>
        <ol>
          <li>Turn the <strong>left switch (SEL) OFF</strong>.</li>
          <li>Do <em>not</em> touch the right switch yet.</li>
        </ol>
        <p>The green Y LED goes <strong>dark</strong>. Look at what you've built: SEL says "use B", but the inverter hasn't answered yet, so the B gate is still disabled. Both AND gates are outputting 0. <strong>You are standing inside the glitch.</strong></p>
        <p>On a real board this moment lasts nanoseconds. Here it lasts until you move your hand.</p>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        const sel = app.state.components.find(c => c.id === 10 && c.type === COMP.SWITCH);
        const selb = app.state.components.find(c => c.id === 12 && c.type === COMP.SWITCH);
        const yLed = app.state.components.find(c => c.id === 21 && c.type === COMP.LED);
        return !!(sel && selb && yLed && !sel.on && !selb.on && !yLed.lit);
      },
      hint: {
        targets: [
          { comp: 10, label: 'Turn SEL OFF' },
          { comp: 12, label: "don't touch yet!" },
          { comp: 21, label: 'Y goes dark — the glitch' },
        ],
      },
    },

    // ── Step 6: Finish the swap — and check the counter ──────────────────────
    {
      id: 'finish_swap',
      title: 'The Inverter Catches Up',
      content: `
        <h2>The Inverter Catches Up</h2>
        <p>Now play the inverter's late reply: turn the <strong>right switch ON</strong>.</p>
        <p>The green LED comes back — the B gate has taken over, and Y is HIGH again, exactly as the logic equation always promised. If you looked away for a second, you'd swear nothing ever happened.</p>
        <p>But <strong>check the red LED</strong>. It flipped.</p>
        <p>The flip-flop's clock input can't tell the difference between a real clock edge and a glitch's recovery edge — <em>an edge is an edge</em>. Your "harmless" blip just got counted as an event by every clocked circuit listening to Y. In a counter that's a phantom count; in a register, a corrupted value; in a state machine, a wrong turn.</p>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        const sel = app.state.components.find(c => c.id === 10 && c.type === COMP.SWITCH);
        const selb = app.state.components.find(c => c.id === 12 && c.type === COMP.SWITCH);
        const yLed = app.state.components.find(c => c.id === 21 && c.type === COMP.LED);
        return !!(sel && selb && yLed && !sel.on && selb.on && yLed.lit);
      },
      hint: {
        targets: [
          { comp: 12, label: 'Turn ON now' },
          { comp: 21, label: 'Y comes back…' },
          { comp: 23, label: '…but the red LED flipped!' },
        ],
      },
    },

    // ── Step 7: Swap back the safe way ───────────────────────────────────────
    {
      id: 'overlap_swap',
      title: 'Now Swap Without the Glitch',
      content: `
        <h2>Now Swap Without the Glitch</h2>
        <p>Swap back to SEL&nbsp;=&nbsp;1, but this time <strong>reverse the order</strong> — turn the new gate on <em>before</em> turning the old one off:</p>
        <ol>
          <li>Turn the <strong>left switch (SEL) ON</strong> first. For a moment <em>both</em> switches are on — both AND gates enabled, both saying 1.</li>
          <li>Then turn the <strong>right switch OFF</strong>.</li>
        </ol>
        <p>The green LED <strong>never blinks</strong>, and the red counter <strong>doesn't move</strong>. Same start point, same end point — but the handoff <em>overlapped</em> instead of leaving a gap, so Y was held HIGH the whole way through.</p>
        <p>An overlap instead of a gap. Keep that idea; it's the heart of the classic fix on the next page.</p>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        const sel = app.state.components.find(c => c.id === 10 && c.type === COMP.SWITCH);
        const selb = app.state.components.find(c => c.id === 12 && c.type === COMP.SWITCH);
        const yLed = app.state.components.find(c => c.id === 21 && c.type === COMP.LED);
        return !!(sel && selb && yLed && sel.on && !selb.on && yLed.lit);
      },
      hint: {
        targets: [
          { comp: 10, label: '1) SEL ON first' },
          { comp: 12, label: '2) then this one OFF' },
          { comp: 23, label: 'red must NOT move' },
        ],
      },
    },

    // ── Step 8: The fixes ────────────────────────────────────────────────────
    {
      id: 'fixes',
      title: 'How Designers Fight Back',
      fullWidth: true,
      content: `
        <h2>How Designers Fight Back</h2>
        <p><strong>Fix 1 — cover the gap with redundant logic.</strong> You just proved the glitch disappears if something holds Y HIGH during the handoff. A third AND gate computing <strong>A&#183;B</strong> does exactly that, automatically:</p>
        ${SVG_CONSENSUS}
        <p>Logically the extra term is redundant — it never changes what Y is <em>supposed</em> to be. It exists purely to bridge the transition. (In Karnaugh-map terms it's called a <strong>consensus term</strong>: it covers the boundary the two original terms meet at.)</p>
        <p><strong>Fix 2 — the one the whole industry runs on: synchronous design.</strong> Patching every hazard gate-by-gate doesn't scale to millions of gates. Instead, designers surrender: let combinational logic glitch all it wants, but <em>nobody listens</em> until it has settled. Every flip-flop samples its input only on the shared clock edge, and the clock period is chosen longer than the slowest path's worst-case settling time. Glitches still happen — they just happen while no one is looking.</p>
        <p>This is why the golden rule exists: <strong>never use a combinational output as a clock.</strong> Our demo board commits that sin on purpose — Y drives the flip-flop's clock pin directly, which is precisely why the glitch got counted.</p>
        <div class="onramp-hint">Lesson 5's Schmitt trigger fought noise on a <em>slow analog edge</em>; hazards are wrongness born inside <em>perfectly clean digital logic</em>. Different disease, same symptom: false edges. The clock cures both.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 9-11: Quizzes ───────────────────────────────────────────────────
    {
      id: 'quiz_cause',
      title: 'Quiz 1 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 3</h2>
        <p>What causes a combinational circuit to glitch during an input change?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) A floating input picking up noise</button>
          <button class="quiz-option" data-answer="correct">B) One signal reaching different gates through paths of unequal delay</button>
          <button class="quiz-option" data-answer="wrong">C) The power supply dipping when outputs switch</button>
          <button class="quiz-option" data-answer="wrong">D) Using AND and OR gates in the same circuit</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_counter',
      title: 'Quiz 2 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 3</h2>
        <p>Y glitched LOW for 20 nanoseconds and came right back. Why did the flip-flop wired to Y toggle anyway?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The flip-flop was defective — 20 ns is too fast to register</button>
          <button class="quiz-option" data-answer="wrong">B) The glitch drew extra current through the LED</button>
          <button class="quiz-option" data-answer="correct">C) The glitch's recovery is a real rising edge — a clock input can't tell it from a legitimate one</button>
          <button class="quiz-option" data-answer="wrong">D) The pull-down resistor on the switch discharged the clock net</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_fix',
      title: 'Quiz 3 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 3 of 3</h2>
        <p>Which habit protects a large design from hazards without hunting them down one by one?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Add a pull-down resistor to every gate output</button>
          <button class="quiz-option" data-answer="wrong">B) Use only NAND gates, which have no propagation delay</button>
          <button class="quiz-option" data-answer="wrong">C) Run the circuit at a lower supply voltage so edges are gentler</button>
          <button class="quiz-option" data-answer="correct">D) Synchronous design — let logic settle, sample only on a clock edge, and never clock anything from a combinational output</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 7: 555 Timers ═════════════════════════════════════════════════════
// Comparators + an SR latch = the most popular chip ever. Monostable and
// astable side by side (from 2x555timers.json).




const LESSON_555 = {
  id: 'timer_555',
  title: 'Lesson 7: 555 Timers',
  description: 'The most popular chip ever: comparators + an SR latch make precise pulses. One-shot (monostable) and free-running (astable) on one board.',
  initialState: DUAL_555_BOARD,
  lockedComponents: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  lockedWires: [1, 2, 3, 4, 5, 6, 7, 8],
  steps: [
    {
      id: 'inside_555',
      title: 'Inside the 555',
      fullWidth: true,
      content: `
        <h2>The Most Popular Chip Ever Made</h2>
        <p>The 555 timer has been in production since 1972, with billions sold — and by now you already know every part inside it:</p>
        ${SVG_555_INSIDE}
        <ul>
          <li>Three equal resistors divide VCC into <strong>&#8531; and &#8532; reference points</strong> (that string is where the name "555" comes from — 5&nbsp;k + 5&nbsp;k + 5&nbsp;k).</li>
          <li>Two <strong>comparators</strong> watch external pins against those references — two thresholds, exactly the trick from Lesson 5.</li>
          <li>They <strong>SET and RESET a latch</strong> — the circuit from Lesson 4 — which drives the output pin.</li>
          <li>A <strong>discharge transistor</strong> (pin 7) gives external capacitors a path to empty through.</li>
        </ul>
        <p>Trigger (pin 2) dropping below &#8531;&nbsp;VCC <strong>sets</strong> the latch &#8594; OUT goes HIGH. Threshold (pin 6) rising above &#8532;&nbsp;VCC <strong>resets</strong> it &#8594; OUT goes LOW. Everything the 555 does comes from wiring resistors and capacitors around those two rules.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'monostable',
      title: 'Monostable: the One-Shot',
      fullWidth: true,
      content: `
        <h2>Monostable — One Trigger, One Pulse</h2>
        <p>Wire a resistor from VCC to a capacitor, connect that node to <strong>threshold</strong> (pin 6) and <strong>discharge</strong> (pin 7), and use a button to pull <strong>trigger</strong> (pin 2) LOW:</p>
        ${SVG_555_MONO}
        <ol>
          <li>At rest, the latch is reset: OUT is LOW and the discharge transistor holds the cap empty.</li>
          <li><strong>Press the button</strong> — trigger drops below &#8531;&nbsp;VCC, the latch sets: OUT snaps HIGH and the cap is released to charge through R.</li>
          <li>When the cap reaches <strong>&#8532;&nbsp;VCC</strong>, the threshold comparator resets the latch: OUT drops, the cap is dumped, ready for the next shot.</li>
        </ol>
        <p>The pulse width is fixed by physics, not by how long you hold the button: <strong>T = 1.1&nbsp;&#183;&nbsp;R&nbsp;&#183;&nbsp;C</strong>. Tap it or lean on it — same pulse. That's what makes the one-shot useful: it turns sloppy human-length events into precise machine-length ones.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'astable',
      title: 'Astable: Free-Running',
      fullWidth: true,
      content: `
        <h2>Astable — No Stable State At All</h2>
        <p>Now let the chip trigger <em>itself</em>: tie trigger (pin 2) to the capacitor too. The cap voltage now works both comparators:</p>
        ${SVG_555_ASTABLE}
        <ol>
          <li>Cap charges up through the resistors... hits <strong>&#8532;&nbsp;VCC</strong> &#8594; latch resets, OUT LOW, discharge opens.</li>
          <li>Cap drains down... hits <strong>&#8531;&nbsp;VCC</strong> &#8594; latch sets, OUT HIGH, charging resumes. Forever.</li>
        </ol>
        <p>Sound familiar? It's the same shuttle-between-two-thresholds idea as the Schmitt RC oscillator in Lesson 5 — just with the thresholds provided by comparators instead of a special gate input. R and C set the frequency; the ratio of the two timing resistors sets how long HIGH lasts versus LOW.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board_555',
      title: 'Both on the Board',
      boardState: DUAL_555_BOARD,
      content: `
        <h2>Try It: One-Shot and Blinker</h2>
        <p>Two 555s, two personalities:</p>
        <ul>
          <li><strong>LEFT — monostable.</strong> Press the push button below the chip: the red LED fires one fixed-width pulse (about a tenth of a second — 1.1 &#215; 10&nbsp;k &#215; 10&nbsp;&#181;F). Hold the button down; the pulse is the same length anyway.</li>
          <li><strong>RIGHT — astable.</strong> Nobody is touching it, and the green LED blinks away at roughly 1&nbsp;Hz regardless. Its timing pair is 10&nbsp;k with a 100&nbsp;nF cap.</li>
        </ul>
        <p>Both timing networks are ordinary resistors and capacitors sitting right on the board — no magic inside the chips beyond the comparators and latch you saw on page 1.</p>
        <div class="onramp-hint">Complete this step by pressing the LEFT button to fire the one-shot.</div>
      `,
      allowedActions: ['interact'],
      // Fire the monostable: completes when the trigger button goes down
      // (sticky, like every completed step).
      validate: (app) => app.state.components.some(c => c.type === COMP.PUSH_BUTTON && c.pressed),
      hint: {
        targets: [
          { comp: 5, label: 'Press — fires the one-shot' },
          { comp: 7, label: 'red: one fixed-width pulse' },
          { comp: 13, label: 'green: astable, blinks on its own' },
        ],
      },
    },
    {
      id: 'quiz_trigger',
      title: 'Quiz 1 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 2</h2>
        <p>In a monostable 555, what happens the moment the <strong>trigger pin drops below &#8531; VCC</strong>?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The output goes LOW and the capacitor discharges</button>
          <button class="quiz-option" data-answer="correct">B) The internal latch is SET: output HIGH, capacitor starts charging</button>
          <button class="quiz-option" data-answer="wrong">C) Nothing until the threshold pin also passes &#8532; VCC</button>
          <button class="quiz-option" data-answer="wrong">D) The chip resets and the pulse restarts from zero volts</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_mono_vs_astable',
      title: 'Quiz 2 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 2</h2>
        <p>What's the key difference between <strong>monostable</strong> and <strong>astable</strong> operation?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Monostable uses the comparators; astable doesn't</button>
          <button class="quiz-option" data-answer="wrong">B) Astable needs a bigger supply voltage</button>
          <button class="quiz-option" data-answer="correct">C) Monostable fires one fixed pulse per external trigger; astable re-triggers itself and runs forever</button>
          <button class="quiz-option" data-answer="wrong">D) Only the astable circuit uses a capacitor</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 8: Encoders / Decoders ════════════════════════════════════════════
// Many↔few line conversion on the 8-3-8 board (74x148 + 74x237).



const LESSON_ENCODERS = {
  id: 'encoders_decoders',
  title: 'Lesson 8: Encoders / Decoders',
  description: 'Squeeze many lines down to a few (encode) and fan them back out (decode): 8 switches → 3 bits → 1 of 8 LEDs.',
  initialState: ENCODE_DECODE_838_BOARD,
  lockedComponents: [7, 8, 9, 113, 6, 120, 122, 123, 1, 126, 127, 128, 130, 131, 132, 133, 134, 135, 136, 137, 141, 146, 147, 152, 153, 154, 155, 156, 157],
  lockedWires: [1, 2, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
  steps: [
    {
      id: 'why_encode',
      title: 'Why Encode? Lines vs Bits',
      fullWidth: true,
      content: `
        <h2>Many Lines, Few Wires</h2>
        <p>Suppose a keypad has 8 keys and you need to tell a distant chip which one is pressed. The obvious way is 8 wires — one per key. But only one key is pressed at a time, so 8 wires to carry one fact is wasteful.</p>
        ${SVG_ENCODE_FUNNEL}
        <p>Number the keys 0&#8211;7 and send the <strong>number in binary</strong> instead: 3 wires cover all 8 possibilities, because 2&#179; = 8. In general, n lines compress into <strong>&#8968;log&#8322;&nbsp;n&#8969;</strong> bits — 256 lines into 8, a thousand into 10.</p>
        <ul>
          <li>An <strong>encoder</strong> does the compression: 8 input lines in, the 3-bit number of the active line out. That's the 74x148.</li>
          <li>A <strong>decoder</strong> reverses it: a 3-bit number in, exactly one of 8 output lines activated. That's the 74x237.</li>
        </ul>
        <p>Both are pure combinational logic — no clock, no state (unlike Lesson 4), just gates computing which-line&nbsp;&#8596;&nbsp;which-number.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'active_low',
      title: 'Priority and Active-Low',
      fullWidth: true,
      content: `
        <h2>Two Habits of Real Chips</h2>
        <p>The 74x148 will introduce you to two conventions you'll meet on almost every datasheet from now on.</p>
        <p><strong>1. Its inputs are active-low.</strong> "Select me" is signalled with 0, not 1. Each input line idles HIGH through a pull-up resistor; closing that line's switch connects it to GND:</p>
        ${SVG_ACTIVE_LOW}
        <p>Why design it "upside down"? Historical electronics reasons (TTL chips could pull LOW much harder than HIGH), but the convention stuck and half the control pins in the catalog use it. Watch for the bar over the name or a small circle on the symbol.</p>
        <p><strong>2. It's a <em>priority</em> encoder.</strong> What if two keys are pressed at once — which number wins? The 74x148 answers: <strong>the highest one</strong>. Inputs 3 and 5 both active &#8594; output says 5, cleanly, every time. Without a priority rule the output would be garbage whenever inputs overlap.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board_838',
      title: 'The 8-3-8 Board',
      boardState: ENCODE_DECODE_838_BOARD,
      content: `
        <h2>Try It: 8 &#8594; 3 &#8594; 8</h2>
        <p>The full round trip on one board:</p>
        <ul>
          <li><strong>Eight switches</strong> (left) are the inputs — remember, active-low: flipping a switch ON connects its line to GND, <em>selecting</em> it. The 1&nbsp;k pull-ups above hold unselected lines HIGH.</li>
          <li>The <strong>74x148</strong> encodes the highest selected line into a 3-bit code, shown on the <strong>three red LEDs</strong> (middle).</li>
          <li>The <strong>74x237</strong> decodes those same 3 bits and lights exactly <strong>one of the eight yellow LEDs</strong> (right).</li>
        </ul>
        <p>Things to try:</p>
        <ol>
          <li>Flip switch 5 ON — the red LEDs show 101 and yellow LED 5 lights.</li>
          <li>Now <em>also</em> flip switch 2 ON. Nothing changes: 5 has priority. Turn 5 off and the display drops to 2.</li>
        </ol>
        <div class="onramp-hint">Complete this step by flipping any switch ON.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => app.state.components.some(c => c.type === COMP.SWITCH && c.on),
      hint: {
        targets: [
          { area: ['0:0:power:3:2', '0:0:main:11:7'], label: 'Flip any switch ON (try 5)' },
          { area: ['0:0:power:22:0', '0:0:main:24:0'], label: '3-bit code' },
          { area: ['0:0:power:38:0', '0:0:main:47:0'], label: '1-of-8 decoded' },
        ],
      },
    },
    {
      id: 'quiz_log2',
      title: 'Quiz 1 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 2</h2>
        <p>You need to report which one of <strong>16 lines</strong> is active. How few wires can an encoder squeeze that into?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) 8</button>
          <button class="quiz-option" data-answer="correct">B) 4</button>
          <button class="quiz-option" data-answer="wrong">C) 15</button>
          <button class="quiz-option" data-answer="wrong">D) 2</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_priority',
      title: 'Quiz 2 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 2</h2>
        <p>On the board, switches <strong>3 and 6</strong> are both ON (both lines pulled LOW). What does the 74x148 output?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The code for 3 — first one wins</button>
          <button class="quiz-option" data-answer="correct">B) The code for 6 — highest input has priority</button>
          <button class="quiz-option" data-answer="wrong">C) The code for 9 — it adds them</button>
          <button class="quiz-option" data-answer="wrong">D) All outputs float until one switch is released</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 9: Serial Communication — PISO/SIPO ═══════════════════════════════
// Shift registers trade wires for time (two-board demo from PISO-SIPO.json).



const LESSON_PISO_SIPO = {
  id: 'serial_piso_sipo',
  title: 'Lesson 9: Serial Communication',
  description: 'Send 8 bits over 1 wire and time. A PISO shift register turns parallel data into a serial stream; a SIPO turns it back.',
  initialState: PISO_SIPO_BOARD,
  lockedComponents: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 21, 1, 41, 42, 43, 44, 46, 47, 48, 50, 52, 53, 55, 56, 59, 60, 61, 63, 79, 80, 81, 83],
  lockedWires: [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 19, 20, 21, 26, 27, 28, 29, 32, 33, 34, 35, 36, 37, 38, 39, 41],
  steps: [
    {
      id: 'wires_vs_time',
      title: 'Parallel vs Serial',
      fullWidth: true,
      content: `
        <h2>Trading Wires for Time</h2>
        <p>Lesson 8 shrank 8 lines to 3 by encoding <em>which single line</em> is active. But what if all 8 bits matter at once — a whole byte of data? Encoding can't compress that; 8 independent bits genuinely need 8 wires...</p>
        <p>...or <strong>1 wire used 8 times</strong>.</p>
        ${SVG_PAR_VS_SER}
        <p>That's the whole idea of <strong>serial communication</strong>: send the bits one after another down a single wire, one per clock tick, and reassemble them at the far end. It's slower — 8 ticks instead of 1 — but the cable shrinks from 8 wires to basically 2 (data + clock).</p>
        <p>Almost every cable you own works this way: USB, HDMI, SATA, Ethernet. Wires are expensive; ticks are nearly free.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'shift_registers',
      title: 'Shift Registers: PISO and SIPO',
      fullWidth: true,
      content: `
        <h2>The Hardware: Chained Flip-Flops</h2>
        <p>The machine that converts between "8 bits side by side" and "8 bits one after another" is the <strong>shift register</strong>: 8 D flip-flops (Lesson 4!) sharing one clock, each one's Q wired to the next one's D. Every clock edge, the whole row of bits steps one position sideways.</p>
        ${SVG_SHIFT_CHAIN}
        <p>Two flavours make a transmitter and a receiver:</p>
        <ul>
          <li><strong>74x165 — PISO</strong> (parallel in, serial out). A LOAD pin snapshots all 8 inputs into the flip-flops at once; then each clock tick pushes the next bit out the end of the chain.</li>
          <li><strong>74x164 — SIPO</strong> (serial in, parallel out). Each clock tick shifts one incoming bit into the chain; after 8 ticks the whole byte sits on its 8 output pins.</li>
        </ul>
        <p>Both ends <strong>share the clock wire</strong>, so they step in perfect lockstep — and they must share GND too, or "HIGH" and "LOW" mean nothing between the boards (voltages are always measured against a common reference).</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board_piso',
      title: 'The Link on the Board',
      boardState: PISO_SIPO_BOARD,
      content: `
        <h2>Try It: Send a Byte Across</h2>
        <p>Two separate breadboards. LEFT: 8 switches and the 74x165. RIGHT: the 74x164 and 8 green LEDs. Count the wires crossing between the boards: <strong>serial data and clock</strong> — that's it (plus the shared rails).</p>
        <p>You are the clock generator. Send a byte by hand:</p>
        <ol>
          <li>Set a pattern on the <strong>8 switches</strong> (a few are already ON).</li>
          <li>Press <strong>Load/Reset</strong> (bottom button) — it snapshots the switches into the 165 and clears the 164.</li>
          <li>Press the <strong>Serial Load</strong> clock button <strong>8 times</strong> — and watch your pattern crawl across the LEDs, one bit per press, until after the 8th press it sits in place, matching the switches.</li>
        </ol>
        <p>That crawl you're watching is the serial stream itself — normally it happens millions of times a second, invisibly.</p>
        <div class="onramp-hint">Change the switches and send another byte. Note: changing switches alone does nothing until you Load — the 165's flip-flops hold the old snapshot. That's Lesson 4's HOLD state doing real work.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => app._ledLitOnce,
      hint: {
        targets: [
          { area: ['0:0:power:2:3', '0:0:main:23:9'], label: '1) set a pattern' },
          { comp: 80, label: '2) Load/Reset' },
          { comp: 83, label: '3) clock it — 8 presses' },
          { area: ['1:0:main:19:4', '1:0:main:33:5'], label: 'the byte arrives here' },
        ],
      },
    },
    {
      id: 'quiz_wires',
      title: 'Quiz 1 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 2</h2>
        <p>Beyond the shared power rails, which signals had to cross between the two boards?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) All 8 data bits</button>
          <button class="quiz-option" data-answer="correct">B) Just serial data and the clock</button>
          <button class="quiz-option" data-answer="wrong">C) Only the serial data — the boards each have their own clock</button>
          <button class="quiz-option" data-answer="wrong">D) The 3-bit encoded line number</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_clock_role',
      title: 'Quiz 2 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 2</h2>
        <p>Why did the byte need exactly <strong>8 clock presses</strong> to arrive?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The clock charges a capacitor that releases the data at 8 volts</button>
          <button class="quiz-option" data-answer="wrong">B) The 164 ignores the first 7 presses for noise immunity</button>
          <button class="quiz-option" data-answer="correct">C) Each rising edge moves every bit one flip-flop along the chain — 8 positions needs 8 edges</button>
          <button class="quiz-option" data-answer="wrong">D) It doesn't — one press would do, the other 7 are tradition</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 10: Intro to Memory — RAM vs ROM ══════════════════════════════════
// New board (MEM_INTRO_BOARD): a 28C16 EEPROM wired read-only and a 74x219
// RAM share one 2-bit address; COPY writes the ROM word into the RAM.



const LESSON_MEMORY_INTRO = {
  id: 'memory_intro',
  title: 'Lesson 10: Intro to Memory — RAM vs ROM',
  description: "Two ways to store many bits: ROM you read but can't change in circuit, RAM you read and write but loses it on power-off. Both on one board.",
  initialState: MEM_INTRO_BOARD,
  lockedComponents: [1, 2, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27],
  lockedWires: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  steps: [
    {
      id: 'what_memory_is',
      title: 'What Memory Is',
      fullWidth: true,
      content: `
        <h2>From One Bit to Many</h2>
        <p>Lesson 4's latch stores one bit. A useful memory stores thousands — so how do you talk to thousands of latches without a wire to each one? You give every group of them a <strong>number</strong>, called an <strong>address</strong>, and build the selection right into the chip:</p>
        ${SVG_MEM_CELLS}
        <p>Present an address, and a decoder — the very circuit from Lesson 7 — activates exactly one row of storage cells. That row's contents appear on the <strong>data pins</strong>. Every memory chip, from this board's little 16&#215;4 RAM to the gigabytes in your PC, is this same picture scaled up:</p>
        <ul>
          <li><strong>Address pins</strong> — say <em>which</em> word you want. n address bits reach 2&#8319; words.</li>
          <li><strong>Data pins</strong> — carry the word itself.</li>
          <li><strong>Control pins</strong> — say <em>what to do</em> with it (read it out, or store a new one).</li>
        </ul>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'rom_vs_ram',
      title: 'ROM vs RAM',
      fullWidth: true,
      content: `
        <h2>The Two Families</h2>
        <p>Memory chips split by one question: <em>can the circuit change the contents, and do they survive power-off?</em></p>
        ${SVG_ROM_VS_RAM}
        <p><strong>ROM — Read-Only Memory.</strong> The contents are put in ahead of time and the circuit can only read them. In exchange, they're <strong>non-volatile</strong>: unplug it for a year, the data is still there. That's where a computer's first instructions live — the machine has to know what to do <em>before</em> it could possibly have loaded anything.</p>
        <p><strong>RAM — Random-Access Memory.</strong> The circuit can read <em>and write</em> any cell at any moment. The price: it's <strong>volatile</strong>. The cells are just powered latches, and when the power drops, every bit evaporates. RAM always wakes up blank.</p>
        <div class="onramp-hint">"Random access" just means any address is equally quick to reach — as opposed to a shift register (Lesson 8), where bits arrive in order and you wait your turn.</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board_mem_intro',
      title: 'Both on One Board',
      boardState: MEM_INTRO_BOARD,
      content: `
        <h2>Try It: ROM and RAM, Same Address</h2>
        <p>The two <strong>ADDRESS switches</strong> (bottom left) feed both chips at once, selecting location 0&#8211;3 in each. Red LEDs show the <strong>ROM's</strong> word at that address; green LEDs show the <strong>RAM's</strong>.</p>
        <ol>
          <li><strong>Step through the addresses.</strong> The ROM (a 28C16 EEPROM, wired read-only) has data baked in: address 1 holds 6, address 2 holds 9, address 3 holds 15. The RAM shows nothing anywhere — it's fresh out of power-on, so it's <em>empty</em>. That blankness is volatility, live on the board.</li>
          <li><strong>Press COPY</strong> at some address. The button pulses the RAM's write-enable, storing the ROM's current word into the RAM at the same address — the green LEDs snap to match the red.</li>
          <li><strong>Walk away and come back.</strong> Change the address, then return: the RAM kept what you copied. Copy all four locations and the two chips match everywhere.</li>
        </ol>
        <div class="onramp-hint">Copying ROM into RAM at startup is exactly what real computers do — it's called shadowing, and you just did it by hand. Complete this step by finding some data (flip an address switch).</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => app._ledLitOnce,
      hint: {
        targets: [
          { area: ['0:0:power:10:3', '0:0:main:11:9'], label: '1) ADDRESS — step through' },
          { comp: 15, label: '2) COPY ROM → RAM' },
          { area: ['0:0:power:17:0', '0:0:main:20:0'], label: 'ROM word (baked in)' },
          { area: ['0:0:power:34:0', '0:0:main:37:0'], label: 'RAM word (starts empty)' },
        ],
      },
    },
    {
      id: 'quiz_powerloss',
      title: 'Quiz 1 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 2</h2>
        <p>Power is cut, then restored. What does each chip on this board hold?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Both keep their data — chips don't forget</button>
          <button class="quiz-option" data-answer="correct">B) The ROM still holds 6, 9, 15…; the RAM is blank again</button>
          <button class="quiz-option" data-answer="wrong">C) Both are blank — memory always starts at zero</button>
          <button class="quiz-option" data-answer="wrong">D) The RAM keeps its data; the ROM must be reprogrammed</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_addr_data',
      title: 'Quiz 2 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 2</h2>
        <p>On this board the two switches and the four LEDs per chip play different roles. Which is which?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="correct">A) Switches = address (which cell); LEDs = data (what's stored there)</button>
          <button class="quiz-option" data-answer="wrong">B) Switches = data; LEDs = address</button>
          <button class="quiz-option" data-answer="wrong">C) Both are data — the address is fixed inside the chip</button>
          <button class="quiz-option" data-answer="wrong">D) Both are addresses — the data never leaves the chip</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 11: ROM, Deeper ═══════════════════════════════════════════════════
// New board (ROM_DEMO_BOARD): 28C16 preloaded with x² — ROM as a lookup table.


const LESSON_ROM_DEEP = {
  id: 'rom_deep',
  title: 'Lesson 11: ROM, Deeper',
  description: 'Non-volatile read-only memory: how an address selects a fixed data word, and why we use it for firmware and lookup tables.',
  initialState: ROM_DEMO_BOARD,
  lockedComponents: [1, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27],
  lockedWires: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
  steps: [
    {
      id: 'rom_read_path',
      title: 'Address → Fixed Data',
      fullWidth: true,
      content: `
        <h2>Inside a Read</h2>
        <p>A ROM is the memory picture from Lesson 9 with the write machinery removed. This board's <strong>28C16</strong> stores 2048 bytes: 11 address pins (2&#185;&#185; = 2048) select a byte, and 8 data pins deliver it.</p>
        ${SVG_ROM_READ}
        <p>Three control pins run the show, all active-low:</p>
        <ul>
          <li><strong>CE&#773; (chip enable)</strong> — the master switch. HIGH = chip asleep, pins disconnected.</li>
          <li><strong>OE&#773; (output enable)</strong> — the tri-state gate from Lesson 1. Only when OE&#773; is LOW does the chip drive its data onto the pins; otherwise they go Hi-Z so <em>other chips can share the same bus</em>. A computer hangs its ROM, RAM and peripherals on one data bus and uses OE&#773; lines to pick who talks.</li>
          <li><strong>WE&#773; (write enable)</strong> — this chip is an EEPROM, so writing <em>is</em> electrically possible; on this board WE&#773; is wired to VCC, so it behaves as pure ROM.</li>
        </ul>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'rom_programming',
      title: 'How ROM Gets Its Data',
      fullWidth: true,
      content: `
        <h2>Where the Bits Come From</h2>
        <p>"Read-only" means the <em>circuit</em> can't change it — somebody still had to put the data in. The family tree, one line each:</p>
        <ul>
          <li><strong>Mask ROM</strong> — the data is etched into the silicon at the factory. Cheapest per chip, unchangeable forever.</li>
          <li><strong>PROM</strong> — ships blank; a programmer burns microscopic fuses. One shot, no undo.</li>
          <li><strong>EPROM</strong> — erasable with 20 minutes of UV light through the little quartz window, then reprogrammable.</li>
          <li><strong>EEPROM</strong> — erasable <em>electrically</em>, byte by byte. This board's 28C16 is one.</li>
          <li><strong>Flash</strong> — EEPROM's fast, block-erased descendant: SSDs, USB sticks, your phone.</li>
        </ul>
        <p>Notice the whole history is one long fight to make "read-only" easier to change — while still keeping the part that matters: <strong>the data survives with no power</strong>.</p>
        <div class="onramp-hint">In this simulator the EEPROM's contents were simply preloaded into the saved circuit — the equivalent of the chip arriving from the programmer already burned.</div>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board_rom',
      title: 'ROM as a Lookup Table',
      boardState: ROM_DEMO_BOARD,
      content: `
        <h2>Try It: a Chip That "Computes" Squares</h2>
        <p>This 28C16 was programmed so that <strong>location x stores x&#178;</strong>. The three ADDRESS switches form x (0&#8211;7); the eight red LEDs read out the stored byte in binary, 1s bit on the left.</p>
        <ol>
          <li>Set the switches to 5 (ON&#8211;OFF&#8211;ON, right-to-left: A0=1, A1=0, A2=1). The LEDs show 25 — bits 1, 8 and 16.</li>
          <li>Try 7: out comes 49. Try 0: all dark. Every answer in one address-time, no gates computing anything.</li>
        </ol>
        <p>This is a <strong>lookup table</strong>, and it's a genuinely important trick: any function of n input bits can be "computed" by a 2&#8319;-word ROM that simply stores every answer in advance. Early arcade games drew graphics this way; digital synths store whole sine waves in ROM; and Lesson 7's decoder is really just a 1-bit-deep lookup table.</p>
        <div class="onramp-hint">Complete this step by looking up any non-zero square (set the address to 1 or more).</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => app._ledLitOnce,
      hint: {
        targets: [
          { area: ['0:0:power:25:3', '0:0:main:27:9'], label: 'ADDRESS — set to 1 or more (A0 is rightmost)' },
          { area: ['0:0:power:36:0', '0:0:main:43:0'], label: 'x² comes out here' },
        ],
      },
    },
    {
      id: 'quiz_oe',
      title: 'Quiz 1 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 2</h2>
        <p>What does the <strong>OE&#773; (output enable)</strong> pin actually control?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) Which address is selected</button>
          <button class="quiz-option" data-answer="wrong">B) Whether the chip's contents get erased</button>
          <button class="quiz-option" data-answer="correct">C) Whether the chip drives its data onto the bus or goes Hi-Z</button>
          <button class="quiz-option" data-answer="wrong">D) The chip's supply voltage</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_lut',
      title: 'Quiz 2 of 2',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 2</h2>
        <p>Why can a ROM act as a <strong>lookup table</strong> for a function like x&#178;?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The chip contains a small multiplier circuit</button>
          <button class="quiz-option" data-answer="correct">B) Every possible answer was stored in advance — the address is the question, the stored word is the answer</button>
          <button class="quiz-option" data-answer="wrong">C) The address pins perform binary multiplication as they switch</button>
          <button class="quiz-option" data-answer="wrong">D) It can't — ROMs only store program code</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 12: RAM, Deeper ═══════════════════════════════════════════════════
// New board (RAM_DEMO_BOARD): 74x219 with address/data switches and a WRITE
// button — the full write-then-read-back loop, by hand.


const LESSON_RAM_DEEP = {
  id: 'ram_deep',
  title: 'Lesson 12: RAM, Deeper',
  description: 'Read/write volatile memory: address selects a cell, WE picks read or write, data flows both ways — and it forgets on power-off.',
  initialState: RAM_DEMO_BOARD,
  lockedComponents: [1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
  lockedWires: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  steps: [
    {
      id: 'ram_rw_paths',
      title: 'Read and Write',
      fullWidth: true,
      content: `
        <h2>One More Pin Changes Everything</h2>
        <p>Take Lesson 10's ROM read path and add a way <em>in</em>: that's RAM. The new control pin is <strong>WE&#773; (write enable)</strong>, and it steers the direction of the data:</p>
        ${SVG_RAM_RW}
        <ul>
          <li><strong>WE&#773; HIGH — read.</strong> The addressed cell's contents drive the outputs, exactly like the ROM.</li>
          <li><strong>WE&#773; LOW — write.</strong> Whatever is on the data inputs is stored into the addressed cell, replacing what was there. During the write the outputs go <strong>tri-state</strong> (Lesson 1 again): the port can't carry data out while data is going in.</li>
        </ul>
        <p>This board's chip is a <strong>74x219</strong>: 16 words of 4 bits, each cell a pair of cross-coupled inverters — literally the latch from Lesson 4, times 64. Many memory chips go further and use the <em>same physical pins</em> for data in and data out (a bidirectional bus); the 74x219 keeps them separate, which makes the two directions easy to see.</p>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'ram_volatile',
      title: 'Why It Forgets',
      fullWidth: true,
      content: `
        <h2>Volatility Is Not a Defect</h2>
        <p>Each RAM cell holds its bit the way Lesson 4's latch did: a feedback loop <em>actively driving itself</em>, powered every nanosecond. Cut the power and the loop isn't holding anything — it's just two dead transistors. When power returns, each loop falls whichever way manufacturing imperfections push it. That's why RAM wakes up as garbage and must be treated as blank.</p>
        <p>So why tolerate a memory with amnesia? Because the same properties that make it volatile make it <strong>fast and endlessly rewritable</strong> — a latch flips in nanoseconds and never wears out, while an EEPROM write is thousands of times slower and each cell survives a limited number of erases.</p>
        <p>Hence the division of labour in every computer since the beginning:</p>
        <ul>
          <li><strong>ROM / flash</strong> holds what must survive: firmware, the OS, your files.</li>
          <li><strong>RAM</strong> holds what's being <em>worked on right now</em> — copied in from storage (remember shadowing, in Lesson 9?), chewed on at full speed, written back if it's worth keeping.</li>
        </ul>
      `,
      allowedActions: [],
      validate: null,
    },
    {
      id: 'board_ram',
      title: 'Write It, Then Read It Back',
      boardState: RAM_DEMO_BOARD,
      content: `
        <h2>Try It: the Full Memory Loop</h2>
        <p>Left to right under the chip: <strong>A0, D1, A1, D2</strong> switches (address bits interleaved with data bits — labels on the board), the <strong>WRITE</strong> button above on the right, and two green LEDs showing the stored word at the current address.</p>
        <ol>
          <li><strong>Pick a cell:</strong> set A0/A1, say both OFF (address 0). LEDs dark — empty, as always at power-on.</li>
          <li><strong>Offer a value:</strong> flip D1 ON. LEDs still dark! Data inputs alone change nothing — the chip is in read mode.</li>
          <li><strong>Hold WRITE.</strong> WE&#773; goes LOW and the value is stored. Notice the LEDs stay dark <em>while you hold it</em> — the outputs are tri-stated mid-write.</li>
          <li><strong>Release.</strong> Back in read mode: the LEDs now show your bit, read back from the cell.</li>
          <li><strong>Prove it's really stored:</strong> change the address (LEDs go dark — different, empty cell), write something different there, then come back. Each cell kept its own value.</li>
        </ol>
        <div class="onramp-hint">Complete this step by writing a non-zero value and reading it back (get a green LED lit from a stored bit).</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        if (!app._ledLitOnce) return false;
        const ram = app.state.components.find(c => c.chipId === '74x219' && c.placed);
        if (!ram || !ram.ffState) return false;
        const st = ram.ffState.get('Q1_r16x4ni');
        if (!st || !st.mem) return false;
        return Object.values(st.mem).some(w => Array.isArray(w) && w.includes(1));
      },
      hint: {
        targets: [
          { comp: 14, label: '1) flip D1 ON' },
          { comp: 19, label: '2) hold WRITE, then release' },
          { area: ['0:0:power:34:0', '0:0:main:36:0'], label: '3) the stored bit reads back' },
        ],
      },
    },
    {
      id: 'quiz_we',
      title: 'Quiz 1 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 3</h2>
        <p>On the board you flipped D1 ON but the LEDs didn't change until you pressed WRITE. Why?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The data switch was wired to the wrong pin</button>
          <button class="quiz-option" data-answer="correct">B) With WE&#773; HIGH the chip is reading — data inputs are ignored until a write is enabled</button>
          <button class="quiz-option" data-answer="wrong">C) The LEDs only update once per second</button>
          <button class="quiz-option" data-answer="wrong">D) The address switches must be toggled first to unlock the cell</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_volatile',
      title: 'Quiz 2 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 3</h2>
        <p>Why does RAM lose its contents at power-off?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) A discharge circuit erases it deliberately for security</button>
          <button class="quiz-option" data-answer="wrong">B) The address decoder forgets which cells were used</button>
          <button class="quiz-option" data-answer="correct">C) Each cell is a powered feedback loop — no power, nothing is holding the bit</button>
          <button class="quiz-option" data-answer="wrong">D) It doesn't, as long as you wrote the data twice</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_tristate_write',
      title: 'Quiz 3 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 3 of 3</h2>
        <p>While you held WRITE, the LEDs went dark. What was happening at the output pins?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) They were driving LOW to signal a write in progress</button>
          <button class="quiz-option" data-answer="wrong">B) The chip lost power for the duration of the write</button>
          <button class="quiz-option" data-answer="correct">C) They went Hi-Z (tri-state) — the data path was busy flowing inward</button>
          <button class="quiz-option" data-answer="wrong">D) They showed the old value inverted</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


// ═══ Lesson 13: Finite State Machines ═════════════════════════════════════════
// The capstone of the sequential-logic thread: flip-flops hold *which step* a
// circuit is on, combinational gates decide which step comes next. Anchored by
// the combination-lock example circuit (CombinationLock-FSM.json), whose
// behaviour is regression-tested in js/debug/test-examples.mjs.



const LESSON_FSM = {
  id: 'finite_state_machines',
  title: 'Lesson 13: Finite State Machines',
  description: 'Flip-flops remember which step a circuit is on; logic gates decide which step comes next. Learn the pattern behind traffic lights and CPUs, then crack a 3-button combination lock built from it.',
  initialState: COMBO_LOCK_FSM_BOARD,
  lockedComponents: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
  lockedWires: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  ],
  steps: [

    // ── Step 1: What a state machine is ──────────────────────────────────────
    {
      id: 'what_is_fsm',
      title: 'Circuits With a Plan',
      fullWidth: true,
      content: `
        <h2>Circuits With a Plan</h2>
        <p>In Lesson 4 you built circuits that <strong>remember one bit</strong> — a latch holds a value after the button that set it is released. But most useful machines need to remember something richer than one bit: they need to remember <strong>where they are in a sequence</strong>.</p>
        <p>Think about a combination lock with the code <strong>1&nbsp;·&nbsp;2&nbsp;·&nbsp;3</strong>. Pressing button 2 should do completely different things depending on history:</p>
        <ul>
          <li>If you already pressed 1 — great, you're making progress.</li>
          <li>If you pressed nothing yet — that's a wrong guess, start over.</li>
        </ul>
        <p>Same input, different response. The circuit must be keeping track of <em>which step it is on</em>. That "which step" is called the <strong>state</strong>, and a circuit that moves between a fixed set of states in response to inputs is a <strong>finite state machine</strong> (FSM).</p>
        ${SVG_FSM_STATE_DIAGRAM}
        <p>This diagram is the whole design of the lock, drawn before touching a single chip. Four states, three forward transitions, and a reset arrow for every way to get it wrong. Engineers draw this picture first — the circuit is just a translation of it into hardware.</p>
        <div class="onramp-hint">"Finite" simply means the list of states is fixed and countable — this machine has exactly four. Your washing machine, an elevator controller, and the control unit inside a CPU are all FSMs with longer lists.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 2: The universal skeleton ────────────────────────────────────────
    {
      id: 'fsm_anatomy',
      title: 'The FSM Skeleton',
      fullWidth: true,
      content: `
        <h2>How to Build One: the Skeleton</h2>
        <p>Every FSM, no matter how fancy, is the same two blocks wired in a loop — both of which you already know how to build:</p>
        <ul>
          <li>A <strong>state register</strong> — flip-flops (Lesson 4) holding a code for the current state. Two flip-flops can hold 4 states, three can hold 8, and so on.</li>
          <li><strong>Next-state logic</strong> — plain combinational gates (Lesson 2) that look at the current state <em>and</em> the inputs, and compute which state to load next.</li>
        </ul>
        ${SVG_FSM_ANATOMY}
        <p>The magic is the <strong>feedback path</strong>: the register's outputs loop back around to become inputs of the gates. That's how "press 2" can mean different things — the gates see the button <em>and</em> the current state, so <em>1&nbsp;then&nbsp;2</em> takes a different path through the logic than <em>2 alone</em>.</p>
        <p>It's the same trick as the SR latch's cross-coupled feedback, scaled up: instead of a loop trapping one bit, it's a loop steering a whole machine.</p>
        <div class="onramp-hint">Outputs (the LEDs here) usually just decode the state register — "state = OPEN, light the green LED". Machines wired that way are called <em>Moore machines</em>; if outputs also depend directly on the inputs, it's a <em>Mealy machine</em>. Same skeleton either way.</div>
      `,
      allowedActions: [],
      validate: null,
    },

    // ── Step 3: Meet the hardware ─────────────────────────────────────────────
    {
      id: 'lock_tour',
      title: 'The Lock, Chip by Chip',
      content: `
        <h2>The Lock, Chip by Chip</h2>
        <p>On the board is the combination lock from the state diagram, built from chips you've already met. Find each block of the skeleton:</p>
        <ul>
          <li><strong>State register — the two CD4013s</strong> (middle). Three D flip-flops, one per step of progress: <em>got&nbsp;1</em>, <em>got&nbsp;1,2</em>, and <em>OPEN</em>. Each D pin is tied HIGH, so clocking a stage latches "reached".</li>
          <li><strong>Next-state logic — the CD4081 AND gates.</strong> Button 1 clocks stage 1 directly, but button 2 only reaches stage 2's clock through an AND with stage 1's Q — <em>press 2 AND already got 1</em>. Same again for button 3.</li>
          <li><strong>Wrong-press detector — the CD4069 NOT + CD4071 OR.</strong> <em>Button 2 AND NOT stage 1</em> means you pressed out of order; the OR gate collects every such mistake and drives the reset pin of all three flip-flops. That's the red dashed arrow from the state diagram, in silicon.</li>
          <li><strong>The timer — the 74x4538</strong> (far left). Pressing button 1 starts a real RC one-shot: the capacitor charges through the 100&nbsp;k&#8486; resistor, giving a ~5 second window (the yellow LED). When it closes, it pulses the same reset line.</li>
        </ul>
        <p>The LEDs just report the state: <span style="color:#27ae60"><strong>green = OPEN</strong></span> (stage 3's Q), <span style="color:#e74c3c"><strong>red = LOCKED</strong></span> (its Q&#772; — the built-in opposite), yellow = timer window.</p>
        <div class="onramp-hint">Note the reset pulse also fires once at power-up — so the machine always boots in a known state, LOCKED. Every real FSM needs a defined starting state.</div>
      `,
      allowedActions: ['interact'],
      validate: null,
      hint: {
        targets: [
          { comp: 1, label: '74x4538 — the 5s timer' },
          { comp: 2, label: 'state register…' },
          { comp: 3, label: '…CD4013 flip-flops' },
          { comp: 4, label: 'next-state ANDs' },
          { comp: 6, label: 'wrong-press OR → reset' },
        ],
      },
    },

    // ── Step 4: Crack it ──────────────────────────────────────────────────────
    {
      id: 'lock_open',
      title: 'Crack the Lock',
      content: `
        <h2>Try It: Crack the Lock</h2>
        <p>Enter the combination:</p>
        <ol>
          <li>Press <strong>button 1</strong> — the yellow LED lights: the 5 second window is open and you're in state <em>GOT 1</em>.</li>
          <li>Press <strong>button 2</strong>, then <strong>button 3</strong>, before the yellow LED goes out.</li>
          <li>The <strong>green UNLOCK LED</strong> lights — the machine walked LOCKED → GOT 1 → GOT 1,2 → OPEN.</li>
        </ol>
        <p>Watch the yellow LED as you go. When the window expires, the lock snaps back to LOCKED on its own — even from OPEN. A state machine never stops; it just keeps taking transitions.</p>
        <div class="onramp-hint">Complete this step by lighting the green UNLOCK LED. Too slow? Just press 1 and start again — resetting to a known state is exactly what the machine is built to do.</div>
      `,
      allowedActions: ['interact'],
      validate: (app) => {
        const unlock = app.state.components.find(c => c.id === 14 && c.type === COMP.LED);
        return !!(unlock && unlock.lit);
      },
      hint: {
        targets: [
          { comp: 7, label: '1) press first' },
          { comp: 9, label: '2) then this…' },
          { comp: 11, label: '3) …then this, before the yellow LED dies' },
          { comp: 18, label: 'the 5s window' },
          { comp: 14, label: 'UNLOCK' },
        ],
      },
    },

    // ── Step 5: Try to break it ───────────────────────────────────────────────
    {
      id: 'lock_break',
      title: 'Now Try to Break It',
      content: `
        <h2>Now Try to Break It</h2>
        <p>A state machine is defined as much by the transitions it <em>refuses</em> as the ones it takes. Attack the lock and watch the state diagram defend itself:</p>
        <ul>
          <li><strong>Press 3 first.</strong> Nothing. The AND gate guarding stage 3 sees stage 2's Q is LOW and swallows the press.</li>
          <li><strong>Press 1, then 3.</strong> The wrong-press detector fires — <em>button 3 AND NOT stage 2</em> — and resets your progress. Finishing with 2, 3 afterwards won't unlock it.</li>
          <li><strong>Press 1, then wait out the yellow LED.</strong> Timeout: same reset line, back to LOCKED.</li>
        </ul>
        <p>However you scramble the buttons, the machine is always in exactly one of its four states, and only the drawn arrows are possible. That predictability is why FSMs run everything from elevator doors to the instruction decoder in a CPU: you can list every state, every transition, and <em>prove</em> nothing else can happen.</p>
        <div class="onramp-hint">When you've made the lock ignore or reset you at least once, click Next.</div>
      `,
      allowedActions: ['interact'],
      validate: null,
      hint: {
        targets: [
          { comp: 11, label: 'try 3 first — ignored' },
          { comp: 7, label: 'or 1, then 3 → resets you' },
          { comp: 16, label: 'red = still LOCKED' },
        ],
      },
    },

    // ── Step 6-8: Quizzes ─────────────────────────────────────────────────────
    {
      id: 'quiz_next_state',
      title: 'Quiz 1 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 1 of 3</h2>
        <p>What determines a state machine's <strong>next state</strong>?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The inputs alone</button>
          <button class="quiz-option" data-answer="wrong">B) The current state alone</button>
          <button class="quiz-option" data-answer="correct">C) The current state combined with the inputs</button>
          <button class="quiz-option" data-answer="wrong">D) The outputs</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_register',
      title: 'Quiz 2 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 2 of 3</h2>
        <p>In the combination lock, which chips form the <strong>state register</strong> — the part that remembers how far you've got?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The CD4081 AND gates</button>
          <button class="quiz-option" data-answer="correct">B) The CD4013 D flip-flops</button>
          <button class="quiz-option" data-answer="wrong">C) The 74x4538 timer</button>
          <button class="quiz-option" data-answer="wrong">D) The LEDs</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
    {
      id: 'quiz_guard',
      title: 'Quiz 3 of 3',
      fullWidth: true,
      content: `
        <h2>Quiz 3 of 3</h2>
        <p>Fresh from power-up, you press <strong>button 3</strong> and nothing at all happens. Why?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong">A) The timer window isn't open, so all buttons are disabled</button>
          <button class="quiz-option" data-answer="wrong">B) Button 3's pull-down resistor blocks the press</button>
          <button class="quiz-option" data-answer="correct">C) The AND gate only passes button 3 to the unlock flip-flop when stage 2 is already latched — in LOCKED it is not</button>
          <button class="quiz-option" data-answer="wrong">D) The flip-flops only respond to button 1</button>
        </div>
      `,
      allowedActions: [],
      setup: makeQuizSetup(),
      validate: (app) => app._quizAnswered === true,
    },
  ],
};


export const LESSONS = [
  LESSON_WELCOME,       // Lesson 0: Welcome to 74Sim (tool orientation)
  LESSON_PUSH_PULL,     // Lesson 1: Pushing and Pulling
  LESSON_1,             // Lesson 2: Logic Gates
  LESSON_2,             // Lesson 3: Debug a Circuit
  LESSON_LATCHES,       // Lesson 4: Latches & Flip-Flops
  LESSON_SCHMITT,       // Lesson 5: Schmitt Triggers
  LESSON_GLITCHES,      // Lesson 6: Glitches & Hazards
  LESSON_555,           // Lesson 7: 555 Timers
  LESSON_ENCODERS,      // Lesson 8: Encoders / Decoders
  LESSON_PISO_SIPO,     // Lesson 9: Serial Communication
  LESSON_MEMORY_INTRO,  // Lesson 10: Intro to Memory — RAM vs ROM
  LESSON_ROM_DEEP,      // Lesson 11: ROM, Deeper
  LESSON_RAM_DEEP,      // Lesson 12: RAM, Deeper
  LESSON_FSM,           // Lesson 13: Finite State Machines
];
