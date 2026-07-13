// ── 74x4024 7-stage binary ripple counter regression ─────────────────────────
// The 74x4024 (js/chips/chips57.js) drives the generic COUNTER_BIN_RIPPLE engine
// primitive. The count advances on the HIGH→LOW (falling) edge of CLK; a HIGH on
// MR clears every stage asynchronously (no clock needed).
//
// All seven stages are brought out: Q1 = bit 0 (÷2) … Q7 = bit 6 (÷128). The
// chain wraps at 2^7 = 128.
//
// Pin map (verified vs TI SCHS202D §4, page 3, cross-checked vs CD4024B SCHS030D
// page 1 "NC = 8,10,13"): 1=CLK, 2=MR, 3=Q7, 4=Q6, 5=Q5, 6=Q4, 7=GND, 8=NC,
// 9=Q3, 10=NC, 11=Q2, 12=Q1, 13=NC, 14=VCC.
//
// Run:  node js/debug/scenarios/74x4024-ripple-counter.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4024');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply({ clk, mr = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4024 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk);
  wirePin('MR', mr);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const QBIT = { Q1: 0, Q2: 1, Q3: 2, Q4: 3, Q5: 4, Q6: 5, Q7: 6 };

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

function expectCount(n, label) {
  for (const [q, b] of Object.entries(QBIT)) {
    const want = (n >> b) & 1;
    assert(want ? isHigh(read(q)) : isLow(read(q)),
      `count ${n} (${label}): ${q} should be ${want ? 'HIGH' : 'LOW'}`);
  }
}

// One counter clock: CLK HIGH then LOW. The high→low edge advances the count.
function tick(mr = 0) { apply({ clk: 1, mr }); apply({ clk: 0, mr }); }

// ── 1. MR HIGH clears all stages, asynchronously (no clock) ───────────────────
apply({ clk: 0, mr: 1 });
expectCount(0, 'MR HIGH clears all stages');
apply({ clk: 0, mr: 0 });        // release reset; count stays 0 until clocked
expectCount(0, 'after MR release, still 0');

// ── 2. Falling edges step the binary count 1,2,3,…,8 ──────────────────────────
for (let n = 1; n <= 8; n++) { tick(); expectCount(n, 'walk up'); }

// ── 3. Q7 (bit 6) first goes HIGH at count 64, the divide-by-128 stage ────────
apply({ clk: 0, mr: 1 }); apply({ clk: 0, mr: 0 });   // back to 0
for (let i = 0; i < 63; i++) tick();
assert(isLow(read('Q7')),  '63 edges: Q7 still LOW');
tick();                                               // 64th edge
expectCount(64, 'Q7 HIGH at count 64');

// ── 4. Wrap: 128 edges from zero returns all stages to 0 ──────────────────────
apply({ clk: 0, mr: 1 }); apply({ clk: 0, mr: 0 });   // back to 0
for (let i = 0; i < 128; i++) tick();
expectCount(0, '128 edges wraps back to 0');

// ── 5. Rising edge alone must NOT advance (falling-edge counter) ──────────────
apply({ clk: 0, mr: 1 }); apply({ clk: 0, mr: 0 });   // back to 0
apply({ clk: 1, mr: 0 });                             // rising edge only
expectCount(0, 'rising edge alone does not advance');
apply({ clk: 0, mr: 0 });                             // now the falling edge
expectCount(1, 'falling edge advances to 1');

console.log(`74x4024-ripple-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
