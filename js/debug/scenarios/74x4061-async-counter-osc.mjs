// ── 74x4061 14-stage asynchronous (ripple) counter + oscillator regression ───
// The 74x4061 (js/chips/chips58.js) is the asynchronous 14-stage counter the TI
// SN74HC4060 family doc describes; it reuses the COUNTER_BIN_OSC_14_CLKO engine
// primitive. The counter advances on the HIGH-to-LOW (falling) edge of CLKI; a
// HIGH on CLR clears every stage and parks the oscillator buffers.
//
// Stages 1-3 and stage 11 are internal, so the accessible taps are Q4..Q10 and
// Q12..Q14. Q4 = bit 3 of the count (divide-by-16), Q14 = bit 13 (divide-by-16384).
//
// Pin map (verified vs TI SCLS161D, package drawing + logic diagram; letter
// naming QD=stage4 … QN=stage14): 1=Q12, 2=Q13, 3=Q14, 4=Q6, 5=Q5, 6=Q7,
// 7=Q4, 8=GND, 9=CLKO, 10=CLKOn, 11=CLKI, 12=CLR, 13=Q9, 14=Q8, 15=Q10, 16=VCC.
//
// Run:  node js/debug/scenarios/74x4061-async-counter-osc.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x4061');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply({ clk, clr = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4061 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLKI', clk);
  wirePin('CLR', clr);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One counter clock: drive CLKI HIGH then LOW. The high→low edge advances.
function tick(clr = 0) {
  apply({ clk: 1, clr });
  apply({ clk: 0, clr });
}

// Map every accessible tap to its count bit (stage n → bit n-1).
const QBIT = { Q4: 3, Q5: 4, Q6: 5, Q7: 6, Q8: 7, Q9: 8, Q10: 9, Q12: 11, Q13: 12, Q14: 13 };
function expectCount(n, label) {
  for (const [q, b] of Object.entries(QBIT)) {
    const want = (n >> b) & 1;
    assert(want ? isHigh(read(q)) : isLow(read(q)),
      `count ${n} (${label}): ${q} should be ${want ? 'HIGH' : 'LOW'}`);
  }
}

// ── 1. Reset: CLR HIGH clears all outputs and parks the oscillator ────────────
apply({ clk: 0, clr: 1 });
for (const q of Object.keys(QBIT)) assert(isLow(read(q)), `CLR HIGH: ${q} must be LOW`);
assert(isHigh(read('CLKO')), 'CLR HIGH parks CLKO HIGH');
assert(isLow(read('CLKOn')), 'CLR HIGH parks CLKOn LOW');

// Release reset; count stays at zero until clocked.
apply({ clk: 0, clr: 0 });
expectCount(0, 'after CLR release, still zero');

// ── 2. Low taps follow the binary count ───────────────────────────────────────
for (let i = 0; i < 8;  i++) tick();   expectCount(8,  'Q4 first HIGH at count 8');
for (let i = 0; i < 8;  i++) tick();   expectCount(16, 'Q5 HIGH, Q4 LOW');
for (let i = 0; i < 8;  i++) tick();   expectCount(24, 'Q4 and Q5 HIGH');

// ── 3. High taps (Q12-Q14) and the full 14-bit wrap ───────────────────────────
apply({ clk: 0, clr: 1 });   // clear to 0
apply({ clk: 0, clr: 0 });
// Q12 is bit 11: first HIGH at count 2048. Walk there and check the slow taps.
for (let i = 0; i < 2048; i++) tick();
expectCount(2048, 'Q12 first HIGH (divide-by-4096 tap)');
// Advance to the full count 16383 (all 14 stages set) then one more to wrap to 0.
for (let i = 2048; i < 16383; i++) tick();
expectCount(16383, 'all stages HIGH at 16383');
tick();
expectCount(0, '14-bit counter wraps 16383 -> 0');

// ── 4. Falling edge advances, rising edge does not ────────────────────────────
apply({ clk: 0, clr: 1 });
apply({ clk: 0, clr: 0 });
apply({ clk: 1, clr: 0 });   // rising edge: must NOT advance
expectCount(0, 'rising edge alone does not advance');
for (let i = 0; i < 7; i++) { apply({ clk: 0, clr: 0 }); apply({ clk: 1, clr: 0 }); }
assert(isLow(read('Q4')),  '7 falling edges: Q4 still LOW (count 7)');
apply({ clk: 0, clr: 0 });   // 8th falling edge -> count 8
assert(isHigh(read('Q4')), '8 falling edges total: Q4 HIGH (count 8)');

// ── 5. Oscillator buffers are complementary while running ─────────────────────
apply({ clk: 1, clr: 0 });
assert(isLow(read('CLKO')),   'CLKI HIGH, running: CLKO complement (LOW)');
assert(isHigh(read('CLKOn')), 'CLKI HIGH, running: CLKOn HIGH');
apply({ clk: 0, clr: 0 });
assert(isHigh(read('CLKO')),  'CLKI LOW, running: CLKO HIGH');
assert(isLow(read('CLKOn')),  'CLKI LOW, running: CLKOn LOW');

console.log(`74x4061-async-counter-osc: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
