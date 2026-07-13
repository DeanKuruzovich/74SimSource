// ── CD4034 8-stage bidirectional parallel/serial bus register — regression ───
// The CD4034 (js/chips/chips133.js) is NOT a 74198-style universal shift register
// (the coverage-plan hint SHIFT_REG_8BIT_BIDIR); it is a dual-bus tri-state
// register with its own SHIFT_REG_8BIT_BUS_4034 engine primitive. This scenario
// guards the pin-name wiring + the four control modes, all verified vs the TI/Harris
// CD4034B SCHS037B page-4 truth table + page-1 prose:
//   • A/B = 1 → A pins inputs, B pins outputs ; A/B = 0 → reversed
//   • Parallel synchronous load  (P/S=1, A/S=0): input bus → stages on rising CLK
//   • Parallel asynchronous load (P/S=1, A/S=1): input bus → stages, no clock
//   • Serial shift (P/S=0): SERIAL INPUT → stage 1, shift toward stage 8, on CLK
//   • "A" ENABLE gates the A side: AE=0 with A as output → A pins Hi-Z;
//     AE=0 with A as input (A/B=1) → recirculate (hold)
//
// Method mirrors cd40194-bidir-shift.mjs: one chip + one sim instance for the
// whole run so register state persists; each pin wired HIGH/LOW before a solve.
//
// Run:  node js/debug/scenarios/cd4034-bus-register.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4034');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// control + bus state; A1..A8 / B1..B8 default 0 (driven externally as inputs)
const A = [0,0,0,0,0,0,0,0];
const B = [0,0,0,0,0,0,0,0];
let st = { clk: 0, ps: 0, as: 0, ab: 0, ae: 0, ser: 0 };

// which bus pins we actively drive externally (input side). When a bus is the
// chip's output side we must NOT drive it from the harness (it would fight the
// chip), so we only wire the input-side bus.
function apply(patch = {}, driveA = false, driveB = false) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4034 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK', st.clk);
  wirePin('P/S', st.ps);
  wirePin('A/S', st.as);
  wirePin('A/B', st.ab);
  wirePin('AE',  st.ae);
  wirePin('SER', st.ser);
  if (driveA) for (let i = 0; i < 8; i++) wirePin(`A${i+1}`, A[i]);
  if (driveB) for (let i = 0; i < 8; i++) wirePin(`B${i+1}`, B[i]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(name) === DRIVE.HIGH_Z;
const busBits = (prefix) => Array.from({length:8}, (_,i)=> {
  const name = `${prefix}${i+1}`;
  if (isHiZ(name)) return 'Z';
  return isHigh(read(name)) ? 1 : 0;
});

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const eqArr = (got, want, msg) => assert(got.join('')===want.join(''), `${msg} — got ${got.join('')} want ${want.join('')}`);

// rising clock edge helper (driveA/driveB say which bus we feed as input)
function pulse(patch = {}, driveA=false, driveB=false) {
  apply({ ...patch, clk: 0 }, driveA, driveB);
  apply({ clk: 1 }, driveA, driveB);
  apply({ clk: 0 }, driveA, driveB);
}

// ── 1. Parallel SYNC load from A bus → read on B bus ─────────────────────────
// A/B=1 (A input, B output), P/S=1 parallel, A/S=0 sync, AE=1 enable A input.
A.splice(0,8, 1,0,1,1,0,0,1,0); // A1..A8
pulse({ ps:1, as:0, ab:1, ae:1 }, /*driveA*/true, /*driveB*/false);
eqArr(busBits('B'), [1,0,1,1,0,0,1,0], 'parallel sync load A→B');

// ── 2. Recirculate / hold: A/B=1, AE=0 → A input disabled, data held ─────────
A.splice(0,8, 0,0,0,0,0,0,0,0); // change A bus; should be ignored
pulse({ ps:1, as:0, ab:1, ae:0 }, true, false);
eqArr(busBits('B'), [1,0,1,1,0,0,1,0], 'recirculate (AE=0) holds data');

// ── 3. Parallel ASYNC load from B bus → read on A bus (no clock) ─────────────
// A/B=0 (B input, A output), A/S=1 async, AE=1 so A drives.
B.splice(0,8, 0,1,1,0,1,0,0,1); // B1..B8
apply({ ps:1, as:1, ab:0, ae:1, clk:0 }, /*driveA*/false, /*driveB*/true);
eqArr(busBits('A'), [0,1,1,0,1,0,0,1], 'parallel async load B→A (no clock)');

// ── 4. "A" ENABLE gates A outputs: AE=0 with A as output → A pins Hi-Z ────────
apply({ ps:1, as:1, ab:0, ae:0, clk:0 }, false, true);
eqArr(busBits('A'), ['Z','Z','Z','Z','Z','Z','Z','Z'], 'AE=0 → A outputs Hi-Z');

// ── 5. Serial shift: P/S=0, A/B=1 so data appears on B bus ───────────────────
// Clear register first via async parallel load of all-zero from A.
A.splice(0,8, 0,0,0,0,0,0,0,0);
apply({ ps:1, as:1, ab:1, ae:1, clk:0 }, true, false);
eqArr(busBits('B'), [0,0,0,0,0,0,0,0], 'clear register (async load 0)');
// Now shift a single 1 in on SERIAL INPUT (P/S=0). After one clock stage1(B1)=1.
pulse({ ps:0, ab:1, ae:1, ser:1 }, false, false);
eqArr(busBits('B'), [1,0,0,0,0,0,0,0], 'serial shift: first 1 into stage 1');
// Two more clocks with SER=0 → the 1 walks B1→B2→B3.
pulse({ ser:0 });
eqArr(busBits('B'), [0,1,0,0,0,0,0,0], 'serial shift: 1 → stage 2');
pulse({ ser:0 });
eqArr(busBits('B'), [0,0,1,0,0,0,0,0], 'serial shift: 1 → stage 3');

// ── 6. Synchronous parallel load ignores data until the clock edge ───────────
A.splice(0,8, 1,1,1,1,1,1,1,1);
// set up inputs with CLK low, no edge yet → output should still hold prev (00100000)
apply({ ps:1, as:0, ab:1, ae:1, clk:0 }, true, false);
eqArr(busBits('B'), [0,0,1,0,0,0,0,0], 'sync load: no change without clock edge');
apply({ clk:1 }, true, false); // rising edge now loads
eqArr(busBits('B'), [1,1,1,1,1,1,1,1], 'sync load: captured on rising edge');

if (failures.length) {
  console.error('CD4034 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('CD4034 bidirectional bus register: all checks passed');
