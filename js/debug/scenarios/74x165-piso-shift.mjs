// ── 74x165 8-bit PISO shift register — behavioral regression ─────────────────
// The 74x165 (js/chips/chips5.js) drives the SHIFT_REG_PISO primitive. This guard
// locks in the three facts verified against TI SDLS062D (SN74LS165A datasheet,
// TERMINAL ASSIGNMENT + FUNCTION TABLE + LOGIC DIAGRAM read as PDF page images):
//   1. Parallel load is ASYNCHRONOUS — a LOW on SH/LD jams A..H into the stages
//      immediately, no clock edge, and re-tracks A..H while SH/LD stays LOW.
//   2. Shifting is toward QH (A → B → … → H). H sits at the output, so after a
//      load QH = H, and each rising CLK edge presents the next bit: G, F, E, …, A.
//   3. Only QH (pin 9) and its complement QH-bar (pin 7) are brought out, and
//      CLK INH HIGH freezes the register (the clock is blocked).
// SER enters the far (A-end) stage and takes 8 shifts to reach QH.
//
// Method (mirrors cd4021-piso-shift.mjs): place ONE 74x165 and reuse the same chip
// + sim instance so the register's sequential state persists. Each pin is wired to
// the VCC row (1) or GND row (0) before every solve. A shift pulse is a
// LOW→HIGH→LOW on CLK with SH/LD HIGH and CLK INH LOW; the shift happens on the
// rising edge.
//
// Run:  node js/debug/scenarios/74x165-piso-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x165');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const PARALLEL = ['A','B','C','D','E','F','G','H'];
let stateP = { A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0 };

// shld defaults HIGH (shift mode); clkinh LOW (clock allowed); clk/ser LOW.
function apply({ shld = 1, clk = 0, clkinh = 0, ser = 0, p = null } = {}) {
  if (p) stateP = { ...stateP, ...p };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x165 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('SH/LD', shld ? 1 : 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('CLKINH', clkinh ? 1 : 0);
  wirePin('SER', ser ? 1 : 0);
  for (const name of PARALLEL) wirePin(name, stateP[name] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qh  = () => isHigh(read('QH'))  ? 1 : 0;
const qhn = () => isHigh(read('QHn')) ? 1 : 0;

// One serial-shift clock pulse (SH/LD HIGH, CLK INH LOW): rising edge then low.
function shift(ser = 0) {
  apply({ shld: 1, clk: 1, clkinh: 0, ser });
  apply({ shld: 1, clk: 0, clkinh: 0, ser });
}

// Load a parallel word asynchronously (SH/LD LOW, CLK held LOW the whole time).
function load(p) { apply({ shld: 0, clk: 0, p }); }

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. ASYNCHRONOUS parallel load: QH follows H with no clock edge ───────────
load({ A:1, B:1, C:0, D:1, E:0, F:0, G:1, H:1 });
assert(qh() === 1, `async load: QH should equal H=1, got ${qh()}`);
assert(qhn() === 0, `async load: QH-bar should be complement of QH, got ${qhn()}`);

// Level-sensitive: change H while SH/LD stays LOW → QH re-tracks immediately.
apply({ shld: 0, clk: 0, p: { H: 0 } });
assert(qh() === 0, `async re-jam: QH should follow H=0 while SH/LD LOW, got ${qh()}`);
apply({ shld: 0, clk: 0, p: { H: 1 } });
assert(qh() === 1, `async re-jam: QH should follow H=1 while SH/LD LOW, got ${qh()}`);

// ── 2. Shift the loaded word out on QH: H, G, F, E, D, C, B, A ────────────────
// word A..H = 1 1 0 1 0 0 1 1  → expected QH stream (H first): 1,1,0,0,1,0,1,1
load({ A:1, B:1, C:0, D:1, E:0, F:0, G:1, H:1 });
const expected = [1, 1, 0, 0, 1, 0, 1, 1]; // H, G, F, E, D, C, B, A
assert(qh() === expected[0], `stream[0] (H): expected ${expected[0]}, got ${qh()}`);
for (let i = 1; i < 8; i++) {
  shift(0);
  assert(qh() === expected[i], `stream[${i}]: expected ${expected[i]}, got ${qh()}`);
  assert(qhn() === (expected[i] ? 0 : 1), `stream[${i}]: QH-bar not complement, got ${qhn()}`);
}

// ── 3. CLK INH HIGH freezes the register (clock blocked) ─────────────────────
load({ A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:1 });   // QH = H = 1
assert(qh() === 1, `inhibit setup: QH should be 1, got ${qh()}`);
apply({ shld: 1, clk: 1, clkinh: 1 });   // rising CLK but CLK INH HIGH → no shift
apply({ shld: 1, clk: 0, clkinh: 1 });
assert(qh() === 1, `inhibit: QH must not change while CLK INH HIGH, got ${qh()}`);

// ── 4. SER ripples from the A-end to QH after 8 shifts ───────────────────────
load({ A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0 });   // clear to zero, QH = 0
assert(qh() === 0, `ser setup: QH should be 0 after zero load, got ${qh()}`);
shift(1);                                            // shift #1: SER=1 enters the A-end stage
for (let n = 2; n <= 8; n++) {                        // shifts #2..#8
  assert(qh() === 0, `ser ripple: QH still 0 before shift #${n} (SER bit not yet at QH), got ${qh()}`);
  shift(0);
}
assert(qh() === 1, `ser ripple: SER=1 bit should reach QH after 8 shifts, got ${qh()}`);

console.log(`74x165-piso-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
