// ── 74x952 dual-rank 8-bit TRI-STATE I/O shift register — regression ─────────
// The 74x952 (js/chips/chips45.js) is the National DM74LS952. It drives the
// SHIFT_REG_8BIT_DUALRANK_952 engine primitive. Pinout + behavior verified vs
// National Semiconductor "DM74LS952 Dual Rank 8-Bit TRI-STATE Shift Registers"
// (LS/S TTL Logic Databook 1989, p. 2-505..2-508, Function Table I), read as a
// 300-dpi PDF page image.
//
// Two 8-bit ranks: upper register "A" on the eight bidirectional I/O pins, lower
// serial shift register "B" (serial in Is, serial out Os). All five DIS control
// lines are active LOW and act on the rising clock edge.
//
// Properties guarded here:
//   DISi LOW                          → input: A ← I/O pins on the rising edge
//   DISo LOW (DISi HIGH)              → output: A drives the I/O pins
//   DISTD LOW                         → transfer down: B ← A
//   DISs LOW                          → shift B one place, Is → B1, B8 → Os
//   DISTU LOW                         → transfer up: A ← B
//   DISTU LOW + DISTD LOW             → synchronous clear of both ranks
//   DISo HIGH & DISi HIGH            → I/O pins high-Z
//   Os always tracks the last stage of register B
//
// The eight I/O pins are bidirectional: external data is driven onto them only
// while the chip releases them (input mode); when the chip drives them we read
// them back to check register A.
//
// Run:  node js/debug/scenarios/74x952-dualrank-shift.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v !== null && v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x952');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const IO = ['I/O1', 'I/O2', 'I/O3', 'I/O4', 'I/O5', 'I/O6', 'I/O7', 'I/O8'];

// All DIS controls default HIGH (inactive). clk LOW, serial input 0.
let st = { clk: 0, is: 0, diso: 1, disi: 1, distu: 1, distd: 1, diss: 1 };

// `io` (optional) maps an I/O pin name → bit to drive it externally (input mode).
function apply(patch = {}, io = null) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x952 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk);
  wirePin('Is', st.is);
  wirePin('DISo', st.diso);
  wirePin('DISi', st.disi);
  wirePin('DISTU', st.distu);
  wirePin('DISTD', st.distd);
  wirePin('DISs', st.diss);
  if (io) for (const name of IO) wirePin(name, io[name]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bits = () => IO.map((n) => (isHigh(read(n)) ? 1 : 0));
const bStr = (a) => a.join('');

// rising clock edge with the given control levels (+ optional input data)
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

// helper: drop into output mode (DISo LOW, everything else inactive) and read A
const outRead = () => { apply({ diso: 0, disi: 1, distu: 1, distd: 1, diss: 1 }); return bits(); };

// ── 1. Input: load register A from the I/O pins (DISi LOW) ───────────────────
const data = { 'I/O1': 1, 'I/O2': 1, 'I/O3': 0, 'I/O4': 0, 'I/O5': 1, 'I/O6': 0, 'I/O7': 1, 'I/O8': 1 };
pulse({ disi: 0, diso: 1 }, data);
eq(outRead(), [1, 1, 0, 0, 1, 0, 1, 1], 'input loads register A');

// ── 2. Transfer down: B ← A (DISTD LOW) ──────────────────────────────────────
// B was 0; after transfer down B holds the same byte as A. Os = B8 = A8 = 1.
pulse({ distd: 0 });
is(isHigh(read('Os')) === true, "Os = B8 after transfer down (A8 was 1)");
eq(outRead(), [1, 1, 0, 0, 1, 0, 1, 1], 'register A unchanged by transfer down');

// ── 3. Shift B: Is → B1, each stage moves toward B8, B8 drops onto Os ────────
// B before = 1,1,0,0,1,0,1,1 (B1..B8). Shift with Is=0:
//   new B = [0, 1,1,0,0,1,0,1]  → Os = new B8 = old B7 = 1
pulse({ diss: 0, is: 0 });
is(isHigh(read('Os')) === true, "Os = old B7 (1) after one shift");
// shift again with Is=1: B = [1, 0,1,1,0,0,1,0] → Os = old B7 = 0
pulse({ diss: 0, is: 1 });
is(isHigh(read('Os')) === false, "Os = old B7 (0) after second shift");
// A must be untouched by the shifts (shift only moves register B)
eq(outRead(), [1, 1, 0, 0, 1, 0, 1, 1], 'register A untouched by shifting');

// ── 4. Transfer up: A ← B (DISTU LOW) ────────────────────────────────────────
// After the two shifts B = 1,0,1,1,0,0,1,0. Transfer up copies it into A.
pulse({ distu: 0 });
eq(outRead(), [1, 0, 1, 1, 0, 0, 1, 0], 'transfer up copies B into A');

// ── 5. Synchronous clear: DISTU LOW + DISTD LOW zero both ranks ──────────────
pulse({ distu: 0, distd: 0 });
eq(outRead(), [0, 0, 0, 0, 0, 0, 0, 0], 'sync clear zeros register A');
is(isHigh(read('Os')) === false, 'Os = 0 after sync clear (B cleared)');

// ── 6. High-Z: with DISo and DISi both HIGH the I/O pins float ───────────────
// reload a 1 into A so "driven HIGH" is distinguishable from "released"
pulse({ disi: 0 }, { 'I/O1': 1, 'I/O2': 1, 'I/O3': 1, 'I/O4': 1, 'I/O5': 1, 'I/O6': 1, 'I/O7': 1, 'I/O8': 1 });
apply({ diso: 1, disi: 1 });   // no drive path to the pins now
is(isHigh(read('I/O1')) === false, 'I/O1 high-Z (not driven HIGH) when DISo & DISi HIGH');
is(isHigh(read('I/O8')) === false, 'I/O8 high-Z (not driven HIGH) when DISo & DISi HIGH');
// but the stored byte is still there — re-enable output and read it back
eq(outRead(), [1, 1, 1, 1, 1, 1, 1, 1], 'register A retained through high-Z');

if (failures.length) {
  console.error('74x952 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x952 dual-rank shift register: all checks passed');
