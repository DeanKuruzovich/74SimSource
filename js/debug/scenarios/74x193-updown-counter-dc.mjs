// ── 74x193 4-bit binary up/down counter (dual clock) regression ──────────────
// The 74x193 (js/chips/chips6.js) is a presettable 4-bit BINARY up/down counter
// with SEPARATE up and down clock inputs. It uses the COUNTER_UPDOWN_DC engine
// primitive. Pinout + behavior verified against TI SDLS074 (SN74LS193 terminal
// diagram + '193 CTRDIV-16 logic symbol, read as PDF page images — issues.md C4):
//   pin map 1=B 2=QB 3=QA 4=DOWN 5=UP 6=QC 7=QD 8=GND 9=D 10=C 11=/LOAD 12=/CO
//   13=/BO 14=CLR 15=A 16=VCC
//   - CLR active HIGH, asynchronous  → count = 0 (overrides load and count)
//   - /LOAD active LOW, asynchronous → count = D C B A
//   - rising edge on UP (DOWN held HIGH)   → count up,   wraps 15→0
//   - rising edge on DOWN (UP held HIGH)   → count down, wraps 0→15
//   - /CO LOW when count==15 AND UP LOW ; /BO LOW when count==0 AND DOWN LOW
//
// Run:  node js/debug/scenarios/74x193-updown-counter-dc.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x193');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Control levels driven onto the pins. Idle both clocks HIGH, load inactive HIGH,
// clear inactive LOW; data inputs A(LSB)..D(MSB).
const st = { up: 1, down: 1, clr: 0, load: 1, a: 0, b: 0, c: 0, d: 0 };

function apply() {
  const wm = new WireManager();
  const wirePin = (name, level) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x193 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), level ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('UP',   st.up);
  wirePin('DOWN', st.down);
  wirePin('CLR',  st.clr);
  wirePin('LOAD', st.load);
  wirePin('A', st.a);
  wirePin('B', st.b);
  wirePin('C', st.c);
  wirePin('D', st.d);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const count = () =>
  (isHigh(read('QA')) ? 1 : 0) |
  (isHigh(read('QB')) ? 2 : 0) |
  (isHigh(read('QC')) ? 4 : 0) |
  (isHigh(read('QD')) ? 8 : 0);
const co = () => (isHigh(read('CO')) ? 1 : 0); // active LOW: 0 = asserted
const bo = () => (isHigh(read('BO')) ? 1 : 0); // active LOW: 0 = asserted

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// A count pulse is a LOW-to-HIGH edge on one clock while the other is held HIGH.
function pulseUp()   { st.up = 0; apply(); st.up = 1; apply(); }
function pulseDown() { st.down = 0; apply(); st.down = 1; apply(); }

// ── 1. Asynchronous clear (active HIGH) ──────────────────────────────────────
st.clr = 1; apply();
assert(count() === 0, `CLR HIGH should force 0, got ${count()}`);
st.clr = 0; apply();

// ── 2. Asynchronous parallel load (active LOW) ───────────────────────────────
st.a = 1; st.b = 0; st.c = 1; st.d = 1;   // D C B A = 1101 = 13
st.load = 0; apply();
assert(count() === 13, `LOAD LOW should jam 13, got ${count()}`);
st.load = 1; apply();
assert(count() === 13, `count should hold 13 after LOAD released, got ${count()}`);

// ── 3. Count up + carry at 15 + wrap ─────────────────────────────────────────
pulseUp();
assert(count() === 14, `up 13->14, got ${count()}`);
pulseUp();
assert(count() === 15, `up 14->15, got ${count()}`);
assert(co() === 1, 'CO released (HIGH) at 15 while UP HIGH');
st.up = 0; apply();                        // falling edge: count holds, CO asserts
assert(count() === 15, `count holds 15 on UP falling edge, got ${count()}`);
assert(co() === 0, 'CO asserted (LOW) at 15 with UP LOW');
st.up = 1; apply();                        // rising edge: wrap 15->0
assert(count() === 0, `up wrap 15->0, got ${count()}`);
assert(co() === 1, 'CO released after wrap');

// ── 4. Borrow at 0 + count down + wrap ───────────────────────────────────────
assert(bo() === 1, 'BO released (HIGH) at 0 while DOWN HIGH');
st.down = 0; apply();                       // falling edge: count holds, BO asserts
assert(count() === 0, `count holds 0 on DOWN falling edge, got ${count()}`);
assert(bo() === 0, 'BO asserted (LOW) at 0 with DOWN LOW');
st.down = 1; apply();                       // rising edge: wrap 0->15
assert(count() === 15, `down wrap 0->15, got ${count()}`);
assert(bo() === 1, 'BO released after wrap');
pulseDown();
assert(count() === 14, `down 15->14, got ${count()}`);

// ── 5. Clear overrides load ──────────────────────────────────────────────────
st.clr = 1; st.load = 0; st.a = 1; st.b = 1; st.c = 1; st.d = 1; apply();
assert(count() === 0, `CLR must win over LOAD, got ${count()}`);
st.clr = 0; st.load = 1; apply();

if (failures.length) {
  console.error('74x193 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x193 OK — clear / load / up+carry / down+borrow / wrap / clear-priority verified');
