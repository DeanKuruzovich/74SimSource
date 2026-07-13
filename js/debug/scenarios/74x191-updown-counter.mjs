// ── 74x191 4-bit binary up/down counter (single clock) regression ────────────
// The 74x191 (js/chips/chips6.js) is a presettable 4-bit BINARY up/down counter
// with a SINGLE clock and one direction pin. It uses the COUNTER_UPDOWN engine
// primitive. Pinout + behavior verified against TI SDLS072 (SN74LS191 terminal
// diagram + '191 CTRDIV16 logic symbol, read as PDF page images — issues.md C4):
//   pin map 1=B 2=QB 3=QA 4=/CTEN 5=D//U 6=QC 7=QD 8=GND 9=D 10=C 11=/LOAD
//   12=MAX/MIN 13=/RCO 14=CLK 15=A 16=VCC
//   - /LOAD active LOW, ASYNCHRONOUS → count = D C B A, no clock edge needed
//   - D/U LOW = up, HIGH = down; count advances on the rising CLK edge
//   - /CTEN active LOW enables counting; HIGH freezes the count (load still works)
//   - MAX/MIN HIGH at terminal count (15 up / 0 down) while enabled
//   - /RCO LOW at that same terminal count (simplified: steady level, not a pulse)
//
// This guards issues.md C105: LOAD used to be modeled as synchronous (load only on
// a rising CLK edge). The async-load-with-no-clock-edge check below would fail on
// that buggy engine.
//
// Run:  node js/debug/scenarios/74x191-updown-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x191');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Control levels driven onto the pins. Idle: clock LOW, load inactive HIGH, count
// enable active LOW (running), direction up. Data inputs A(LSB)..D(MSB).
const st = { clk: 0, cten: 0, du: 0, load: 1, a: 0, b: 0, c: 0, d: 0 };

function apply() {
  const wm = new WireManager();
  const wirePin = (name, level) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x191 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), level ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK',  st.clk);
  wirePin('CTEN', st.cten);
  wirePin('D/U',  st.du);
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
const maxmin = () => (isHigh(read('MAX/MIN')) ? 1 : 0);
const rco = () => (isHigh(read('RCO')) ? 1 : 0); // active LOW: 0 = asserted

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// A count step is a clean LOW-to-HIGH edge on CLK.
function tick() { st.clk = 0; apply(); st.clk = 1; apply(); }

// Load helper: set data, assert /LOAD, apply, release. Clock is NOT toggled so the
// load must be asynchronous to take effect.
function loadValue(v) {
  st.a = v & 1; st.b = (v >> 1) & 1; st.c = (v >> 2) & 1; st.d = (v >> 3) & 1;
  st.load = 0; apply();
  st.load = 1; apply();
}

// ── 1. Asynchronous parallel load with NO clock edge (guards C105) ───────────
st.clk = 0; apply();                         // establish a steady LOW clock, no edges
assert(count() === 0, `power-up count should be 0, got ${count()}`);
st.a = 0; st.b = 1; st.c = 0; st.d = 1;      // D C B A = 1010 = 10
st.load = 0; apply();                        // /LOAD LOW while CLK held LOW
assert(count() === 10, `async LOAD (no clock edge) should jam 10, got ${count()}`);
st.load = 1; apply();
assert(count() === 10, `count should hold 10 after LOAD released, got ${count()}`);

// ── 2. Count up + terminal count at 15 + wrap ────────────────────────────────
st.du = 0;                                    // direction up
loadValue(13);
assert(count() === 13, `load 13 for up-count, got ${count()}`);
tick();
assert(count() === 14, `up 13->14, got ${count()}`);
tick();
assert(count() === 15, `up 14->15, got ${count()}`);
assert(maxmin() === 1, 'MAX/MIN HIGH at 15 counting up');
assert(rco() === 0, '/RCO LOW (asserted) at 15 counting up');
tick();
assert(count() === 0, `up wrap 15->0, got ${count()}`);
assert(maxmin() === 0, 'MAX/MIN LOW after wrap off terminal (up)');
assert(rco() === 1, '/RCO released after wrap (up)');

// ── 3. Count down + terminal count at 0 + wrap ───────────────────────────────
st.du = 1;                                    // direction down
loadValue(2);
assert(count() === 2, `load 2 for down-count, got ${count()}`);
tick();
assert(count() === 1, `down 2->1, got ${count()}`);
tick();
assert(count() === 0, `down 1->0, got ${count()}`);
assert(maxmin() === 1, 'MAX/MIN HIGH at 0 counting down');
assert(rco() === 0, '/RCO LOW (asserted) at 0 counting down');
tick();
assert(count() === 15, `down wrap 0->15, got ${count()}`);
assert(maxmin() === 0, 'MAX/MIN LOW after wrap off terminal (down)');

// ── 4. CTEN freezes the count ────────────────────────────────────────────────
st.du = 0; loadValue(6);
assert(count() === 6, `load 6, got ${count()}`);
st.cten = 1;                                  // disable counting
tick(); tick();
assert(count() === 6, `CTEN HIGH must freeze count at 6, got ${count()}`);
assert(maxmin() === 0, 'MAX/MIN suppressed while CTEN HIGH');

// ── 5. Load works even while CTEN is HIGH (load overrides enable) ─────────────
st.cten = 1; st.clk = 0; apply();
st.a = 1; st.b = 1; st.c = 0; st.d = 0;       // D C B A = 0011 = 3
st.load = 0; apply();
assert(count() === 3, `async LOAD must work with CTEN HIGH, got ${count()}`);
st.load = 1; st.cten = 0; apply();

if (failures.length) {
  console.error('74x191 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x191 OK — async load / up+down / wrap / terminal MAX-MIN+RCO / CTEN freeze / load-over-enable verified');
