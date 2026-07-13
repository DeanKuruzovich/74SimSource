// ── 74F779 8-bit bidirectional binary counter, 3-STATE I/O — regression ──────
// The 74x779 (js/chips/chips39.js) drives the COUNTER_UPDOWN_TRI_779 engine
// primitive. It guards the parts of the Fairchild 74F779 (DS009593) function
// table that are easy to get wrong:
//   • Eight I/O pins are SHARED: outputs when OE (active LOW) is LOW, high-Z
//     input bus when OE is HIGH. Loading needs OE HIGH so the harness can drive.
//   • Mode is S1,S0: 0,0 load · 1,0 count up · 0,1 count down · 1,1 hold.
//   • CET (active LOW) gates counting only — a load still works while CET is HIGH.
//   • TC (active LOW) goes LOW at 255 going up / 0 going down, while counting.
//
// Method mirrors cd4034-bus-register.mjs: one chip + one sim instance for the
// whole run so the count persists. To read the count we set OE LOW (chip drives
// the pins) and never wire the I/O pins. To load we set OE HIGH and wire the
// I/O pins to the start value.
//
// Run:  node js/debug/scenarios/74x779-updown-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x779');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const IO = ['IO0','IO1','IO2','IO3','IO4','IO5','IO6','IO7'];
let st = { cp: 0, s1: 0, s0: 0, cet: 0, oe: 0 };
let loadBits = [0,0,0,0,0,0,0,0];

// driveIO = true wires the I/O pins to loadBits (used while OE is HIGH for a load).
function apply(patch = {}, driveIO = false) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x779 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CP',   st.cp);
  wirePin('S1',   st.s1);
  wirePin('S0',   st.s0);
  wirePin('CETn', st.cet);
  wirePin('OEn',  st.oe);
  if (driveIO) for (let i = 0; i < 8; i++) wirePin(IO[i], loadBits[i]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Read the 8-bit count back. Needs OE LOW so the chip drives the I/O pins; a CP
// edge is NOT generated here (cp held at its current level, no rising transition).
function count() {
  apply({ oe: 0 }, false);
  let v = 0;
  for (let i = 0; i < 8; i++) v |= (isHigh(read(IO[i])) ? 1 : 0) << i;
  return v;
}

// One clock pulse in the given mode. driveIO feeds the load value during the edge.
function pulse(patch = {}, driveIO = false) {
  apply({ ...patch, cp: 0 }, driveIO);
  apply({ cp: 1 }, driveIO);
  apply({ cp: 0 }, driveIO);
}

// ── 1. Parallel load 0xA5 (OE HIGH so the harness drives the bus) ────────────
loadBits = [1,0,1,0,0,1,0,1]; // IO0..IO7 = 0xA5 (LSB first): 0b10100101
pulse({ s1: 0, s0: 0, cet: 1, oe: 1 }, /*driveIO*/true); // load works even with CET HIGH
assert(count() === 0xA5, `load 0xA5 → got 0x${count().toString(16)}`);

// ── 2. Count up a few steps ──────────────────────────────────────────────────
pulse({ s1: 1, s0: 0, cet: 0, oe: 0 });
assert(count() === 0xA6, `up 1 → got 0x${count().toString(16)}`);
pulse({ s1: 1, s0: 0, cet: 0, oe: 0 });
assert(count() === 0xA7, `up 2 → got 0x${count().toString(16)}`);

// ── 3. CET HIGH holds (no count) ─────────────────────────────────────────────
pulse({ s1: 1, s0: 0, cet: 1, oe: 0 });
assert(count() === 0xA7, `CET HIGH holds → got 0x${count().toString(16)}`);

// ── 4. Hold mode (S1=S0=1) holds even with CET LOW ───────────────────────────
pulse({ s1: 1, s0: 1, cet: 0, oe: 0 });
assert(count() === 0xA7, `hold mode → got 0x${count().toString(16)}`);

// ── 5. Count down ────────────────────────────────────────────────────────────
pulse({ s1: 0, s0: 1, cet: 0, oe: 0 });
assert(count() === 0xA6, `down 1 → got 0x${count().toString(16)}`);

// ── 6. Terminal count up: load 0xFE, step to 0xFF, TC goes LOW, wrap to 0 ─────
loadBits = [0,1,1,1,1,1,1,1]; // 0xFE
pulse({ s1: 0, s0: 0, cet: 1, oe: 1 }, true);
assert(count() === 0xFE, `load 0xFE → got 0x${count().toString(16)}`);
apply({ s1: 1, s0: 0, cet: 0, oe: 0 }, false); // settle TC for current count
assert(isHigh(read('TCn')), 'TC HIGH at 0xFE while counting up');
pulse({ s1: 1, s0: 0, cet: 0, oe: 0 });        // → 0xFF
assert(count() === 0xFF, `up to 0xFF → got 0x${count().toString(16)}`);
apply({ s1: 1, s0: 0, cet: 0, oe: 0 }, false);
assert(!isHigh(read('TCn')), 'TC LOW (active) at 0xFF while counting up');
pulse({ s1: 1, s0: 0, cet: 0, oe: 0 });        // wrap → 0x00
assert(count() === 0x00, `wrap 0xFF→0x00 → got 0x${count().toString(16)}`);

// ── 7. Terminal count down at 0x00 ───────────────────────────────────────────
apply({ s1: 0, s0: 1, cet: 0, oe: 0 }, false);
assert(!isHigh(read('TCn')), 'TC LOW (active) at 0x00 while counting down');
// CET HIGH masks TC (function table: hold → TC held HIGH)
apply({ s1: 0, s0: 1, cet: 1, oe: 0 }, false);
assert(isHigh(read('TCn')), 'TC HIGH when CET disables counting');

// ── 8. OE HIGH puts the I/O pins in high-Z (not driven) ──────────────────────
apply({ oe: 1 }, false);
const ds = sim.pinDriveStates.get(chip.id + ':IO0');
assert(ds !== undefined && ds.type === DRIVE.HIGH_Z, 'OE HIGH → I/O0 high-impedance');

if (failures.length) {
  console.error('74x779 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x779 up/down counter with 3-STATE I/O: all checks passed');
