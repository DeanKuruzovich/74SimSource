// ── 74x699 binary up/down counter + register + 2:1 MUX, sync CLR — regression ─
// The 74x699 (js/chips/chips37.js) is an upgraded former stub. It shares the
// COUNTER_UPDOWN_REG_MUX_TRI primitive with the rest of the '696-'699 family;
// the '699 is the binary (mod 16), synchronous-clear member. This guards the DB
// entry after the stub fix that corrected a wrong pin map (single CLK/CLR/LE/S/
// OEn) to the verified 20-pin one and wired the real behavior:
//   pins 1=U/D 2=CCK 3=A 4=B 5=C 6=D 7=ENP 8=CCLR 9=RCK 10=GND 11=R/C 12=G
//        13=LOAD 14=ENT 15=QD 16=QC 17=QB 18=QA 19=RCO 20=VCC.
// Verified vs TI SN54/74LS696..699 datasheet D2424 (Jan 1981): two clocks (CCK
// counts, RCK snapshots the counter into the register), U/D HIGH=up/LOW=down,
// active-LOW ENP/ENT count enables, active-LOW LOAD synchronous jam-load,
// synchronous active-LOW CCLR, active-LOW RCO at terminal count gated by ENT,
// R/C LOW shows the counter & HIGH shows the register, G active-LOW output enable.
//
// Method: one 74x699, kept across the run so sequential state persists. Each
// apply() re-wires all 13 inputs to the VCC (1) or GND (0) rail; a clock "pulse"
// drives the named clock LOW then HIGH (a rising edge).
//
// Run:  node js/debug/scenarios/74x699-updown-counter-reg-mux.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x699');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Input defaults: up, enables active (LOW), no clear, no load, show counter,
// outputs enabled, both clocks LOW, data lines LOW.
const DEF = {
  UD: 1, CCK: 0, A: 0, B: 0, C: 0, D: 0, ENP: 0, CCLR: 1,
  RCK: 0, RC: 0, G: 0, LOAD: 1, ENT: 0,
};

function apply(over = {}) {
  const s = { ...DEF, ...over };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x699 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const k of Object.keys(DEF)) wirePin(k, s[k]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit = (name) => (isHigh(read(name)) ? 1 : 0);
// Q outputs: QA = LSB ... QD = MSB.
const qVal = () => bit('QA') | (bit('QB') << 1) | (bit('QC') << 2) | (bit('QD') << 3);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One counter pulse on CCK (rising edge) with the given overrides held steady.
function cck(over = {}) { apply({ ...over, CCK: 0 }); apply({ ...over, CCK: 1 }); }
// One register pulse on RCK.
function rck(over = {}) { apply({ ...over, RCK: 0 }); apply({ ...over, RCK: 1 }); }

// ── 0. Synchronous clear: CCLR LOW takes effect on the next CCK edge ─────────
cck({ CCLR: 0 });
assert(qVal() === 0, `sync clear: expected count 0, got ${qVal()}`);

// ── 1. Count up 1..5 with both enables active (LOW) ──────────────────────────
for (let n = 1; n <= 5; n++) {
  cck();
  assert(qVal() === n, `count up: expected ${n}, got ${qVal()}`);
}

// ── 2. Enables HIGH inhibit counting (edge ignored) ──────────────────────────
cck({ ENT: 1 });
assert(qVal() === 5, `ENT HIGH should inhibit, expected 5, got ${qVal()}`);
cck({ ENP: 1 });
assert(qVal() === 5, `ENP HIGH should inhibit, expected 5, got ${qVal()}`);

// ── 3. Synchronous parallel load of A-D (LOAD active LOW) ─────────────────────
// Load 0b1101 = 13 (A=1,B=0,C=1,D=1).
cck({ LOAD: 0, A: 1, B: 0, C: 1, D: 1 });
assert(qVal() === 13, `parallel load: expected 13, got ${qVal()}`);

// ── 4. RCO active LOW at terminal count (15) counting up, gated by ENT ────────
cck();                                  // 13 -> 14
cck();                                  // 14 -> 15 (terminal)
assert(qVal() === 15, `expected 15 before RCO check, got ${qVal()}`);
assert(bit('RCO') === 0, 'RCO should be LOW (asserted) at count 15 with ENT LOW');
apply({ ENT: 1 });                      // de-asserting ENT releases RCO
assert(bit('RCO') === 1, 'RCO should be HIGH when ENT is HIGH even at terminal count');

// ── 5. Up wrap 15 -> 0 ───────────────────────────────────────────────────────
cck();
assert(qVal() === 0, `up wrap: expected 0, got ${qVal()}`);

// ── 6. Count down wraps 0 -> 15 and asserts RCO at 0 ─────────────────────────
apply({ UD: 0 });                       // select down; count stays 0 (no edge)
assert(bit('RCO') === 0, 'RCO should be LOW (asserted) at count 0 counting down');
cck({ UD: 0 });                         // 0 -> 15
assert(qVal() === 15, `down wrap: expected 15, got ${qVal()}`);
cck({ UD: 0 });                         // 15 -> 14
assert(qVal() === 14, `count down: expected 14, got ${qVal()}`);

// ── 7. Register snapshot + MUX select ────────────────────────────────────────
// Counter is at 14. Snapshot it into the register with an RCK edge, then count
// the counter on and confirm R/C HIGH still shows the frozen register value.
rck();                                  // register <- 14
cck({ UD: 0 });                         // counter 14 -> 13
assert(qVal() === 13, `counter after extra step: expected 13, got ${qVal()}`);
apply({ RC: 1 });                       // show register
assert(qVal() === 14, `register via MUX: expected frozen 14, got ${qVal()}`);
apply({ RC: 0 });                       // back to live counter
assert(qVal() === 13, `counter via MUX: expected 13, got ${qVal()}`);

// ── 8. Tri-state: G HIGH releases the Q outputs ──────────────────────────────
// Drive count to 1 (QA HIGH) so the difference between driven and floating shows.
cck({ CCLR: 0 });                       // -> 0
cck();                                  // -> 1
assert(isHigh(read('QA')), 'QA should be driven HIGH at count 1 with G LOW');
apply({ G: 1 });                        // disable outputs
assert(!isHigh(read('QA')), 'QA should not be driven HIGH when G is HIGH (Hi-Z)');

console.log(`74x699-updown-counter-reg-mux: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
