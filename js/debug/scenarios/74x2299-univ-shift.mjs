// ── 74x2299 8-bit universal shift/storage register — regression ─────────────
// The 74x2299 (js/chips/chips52.js) is the Advanced-Schottky '299 variant (25 Ω
// series output resistors). It drives the new SHIFT_REG_8BIT_UNIV_CLR_TRI engine
// primitive. Pinout + behavior verified vs TI SN54ALS299/SN74ALS299 SDAS220B
// (function table + positive-logic diagram, pages 1-3, read as PDF images).
//
// Properties guarded here:
//   CLRn=0                          → all eight bits forced to 0 (async, no clock)
//   rising CLK, S1S0=11             → parallel load from the A/QA..H/QH pins
//   rising CLK, S1S0=00             → hold; I/O pins drive the stored byte out
//   rising CLK, S1S0=01             → shift right, SR enters QA, bits move to QH
//   rising CLK, S1S0=10             → shift left,  SL enters QH, bits move to QA
//   QA'/QH'                         → dedicated stage outputs, always driven
//   OE1n or OE2n HIGH               → I/O pins high-Z, QA'/QH' unaffected
//
// The eight A/QA..H/QH pins are multiplexed: external data is driven onto them
// only during parallel load (when the chip releases them); in every other mode
// the chip drives them, so they are left unwired to avoid a bus fight.
//
// Run:  node js/debug/scenarios/74x2299-univ-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v !== null && v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x2299');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const IO = ['A/QA', 'B/QB', 'C/QC', 'D/QD', 'E/QE', 'F/QF', 'G/QG', 'H/QH'];

let st = { clrn: 1, clk: 0, s0: 0, s1: 0, sr: 0, sl: 0, oe1n: 0, oe2n: 0 };

// `io` (optional) maps an I/O pin name → bit to drive it externally (load only).
function apply(patch = {}, io = null) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x2299 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLRn', st.clrn);
  wirePin('CLK', st.clk);
  wirePin('S0', st.s0);
  wirePin('S1', st.s1);
  wirePin('SR', st.sr);
  wirePin('SL', st.sl);
  wirePin('OE1n', st.oe1n);
  wirePin('OE2n', st.oe2n);
  if (io) for (const name of IO) wirePin(name, io[name]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bits = () => IO.map((n) => (isHigh(read(n)) ? 1 : 0));
const bStr = (a) => a.join('');

// rising clock edge with the given control levels (+ optional load data)
function pulse(patch = {}, io = null) {
  apply({ ...patch, clk: 0 }, io);
  apply({ clk: 1 }, io);
  apply({ clk: 0 }, io);
}

const failures = [];
const eq = (got, want, msg) => {
  if (bStr(got) !== bStr(want)) failures.push(`${msg}: want ${bStr(want)} got ${bStr(got)}`);
};
const is = (cond, msg) => { if (!cond) failures.push(msg); };

// helper: drop into hold mode with outputs enabled so the I/O pins read back
const holdRead = () => { apply({ s0: 0, s1: 0, oe1n: 0, oe2n: 0 }); return bits(); };

// ── 1. Parallel load A..H = 1,1,0,0,1,0,1,1 ─────────────────────────────────
const data = { 'A/QA': 1, 'B/QB': 1, 'C/QC': 0, 'D/QD': 0, 'E/QE': 1, 'F/QF': 0, 'G/QG': 1, 'H/QH': 1 };
pulse({ s0: 1, s1: 1 }, data);
eq(holdRead(), [1, 1, 0, 0, 1, 0, 1, 1], 'parallel load');
is(isHigh(read("QA'")) === true, "QA' = stage A (1) after load");
is(isHigh(read("QH'")) === true, "QH' = stage H (1) after load");

// ── 2. Hold keeps the byte across a clock edge ──────────────────────────────
pulse({ s0: 0, s1: 0 });
eq(holdRead(), [1, 1, 0, 0, 1, 0, 1, 1], 'hold across clock');

// ── 3. Shift right, SR=1: new QA=SR, each bit moves toward QH ────────────────
// before 1,1,0,0,1,0,1,1 → after [SR, oldA..oldG] = 1,1,1,0,0,1,0,1
pulse({ s0: 1, s1: 0, sr: 1 });
eq(holdRead(), [1, 1, 1, 0, 0, 1, 0, 1], 'shift right');
is(isHigh(read("QA'")) === true, "QA' tracks new stage A after shift right");

// ── 4. Shift left, SL=0: new QH=SL, each bit moves toward QA ─────────────────
// before 1,1,1,0,0,1,0,1 → after [oldB..oldH, SL] = 1,1,0,0,1,0,1,0
pulse({ s0: 0, s1: 1, sl: 0 });
eq(holdRead(), [1, 1, 0, 0, 1, 0, 1, 0], 'shift left');
is(isHigh(read("QH'")) === false, "QH' = SL (0) after shift left");

// ── 5. Output enable: either OE high releases the I/O pins; QA'/QH' stay live ─
apply({ s0: 0, s1: 0, oe1n: 1, oe2n: 0 });   // hold, low nibble enable removed
is(isHigh(read("QA'")) === true,  "QA' still driven while OE1n HIGH");
is(isHigh(read("QH'")) === false, "QH' still driven while OE1n HIGH");
is(isHigh(read('A/QA')) === false, "A/QA released (not driven HIGH) while OE1n HIGH");

// ── 6. Direct clear: CLRn=0 zeros the register with no clock edge ────────────
apply({ clrn: 0, oe1n: 0, oe2n: 0, s0: 0, s1: 0 });   // no pulse() — async
eq(bits(), [0, 0, 0, 0, 0, 0, 0, 0], 'async clear');
is(isHigh(read("QA'")) === false && isHigh(read("QH'")) === false, "QA'/QH' cleared");

if (failures.length) {
  console.error('74x2299 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x2299 universal shift register: all checks passed');
