// ── CD4060 14-stage counter + oscillator: PIN-MAP regression ─────────────────
// Guards the bug fixed on 2026-07-04 (issues.md C104): the hand-entered CD4060
// map (js/chips/chips68.js) had Q9 and Q10 swapped — pin 13 was labelled Q10 and
// pin 15 was labelled Q9. The TI CD4060B functional diagram (SCHS049C, p.1) puts
// Q9 on pin 13 and Q10 on pin 15.
//
// Why a by-NAME test (like 74x4060-binary-counter-osc.mjs) does NOT catch this:
// the COUNTER_BIN_OSC_14_CLKO primitive drives outputs by pin NAME, so "the pin
// named Q9" always carries Q9's value no matter which physical pin wears that
// label. To catch a position swap you must check the PHYSICAL pin number. This
// scenario does both — a static name→number map assertion and a simulated
// physical-pin readback at a count where Q9 (bit 8) and Q10 (bit 9) differ.
//
// Verified pin map: 1=Q12, 2=Q13, 3=Q14, 4=Q6, 5=Q5, 6=Q7, 7=Q4, 8=GND,
// 9=CLKO, 10=CLKOn, 11=CLK, 12=MR, 13=Q9, 14=Q8, 15=Q10, 16=VDD.
//
// Run:  node js/debug/scenarios/cd4060-counter-osc-pinmap.mjs   (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4060');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Static terminal-assignment map (the definitive bug-catcher) ────────────
const EXPECTED = {
  1: 'Q12', 2: 'Q13', 3: 'Q14', 4: 'Q6', 5: 'Q5', 6: 'Q7', 7: 'Q4', 8: 'GND',
  9: 'CLKO', 10: 'CLKOn', 11: 'CLK', 12: 'MR', 13: 'Q9', 14: 'Q8', 15: 'Q10', 16: 'VDD',
};
for (const [num, name] of Object.entries(EXPECTED)) {
  const p = chip.getPinByNumber(Number(num));
  assert(p && p.name === name, `pin ${num} must be ${name}, is ${p ? p.name : 'MISSING'}`);
}

// ── Simulation helpers ────────────────────────────────────────────────────────
function apply({ clk, mr = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4060 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk);
  wirePin('MR', mr);
  sim.evaluate(world, [chip], wm);
}
const readName = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readPin  = (num)  => sim.getVoltageAtHole(chip.getPinByNumber(num).holeId);

// One counter clock: HIGH then LOW; the HIGH→LOW (falling) edge advances.
function tick() { apply({ clk: 1 }); apply({ clk: 0 }); }
function clearTo0() { apply({ clk: 0, mr: 1 }); apply({ clk: 0, mr: 0 }); }

// ── 2. Reset clears the outputs and parks the oscillator ──────────────────────
apply({ clk: 0, mr: 1 });
for (const q of ['Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q12','Q13','Q14'])
  assert(isLow(readName(q)), `MR HIGH: ${q} must be LOW`);
assert(isHigh(readName('CLKO')), 'MR HIGH parks CLKO HIGH');
assert(isLow(readName('CLKOn')), 'MR HIGH parks CLKOn LOW');

// ── 3. Physical-pin readback where Q9 (bit 8) and Q10 (bit 9) differ ──────────
// Count = 256 → bit 8 = 1, bit 9 = 0 → Q9 HIGH, Q10 LOW.
clearTo0();
for (let i = 0; i < 256; i++) tick();
assert(isHigh(readName('Q9')),  'count 256: Q9 (by name) HIGH');
assert(isLow(readName('Q10')),  'count 256: Q10 (by name) LOW');
assert(isHigh(readPin(13)),     'count 256: physical pin 13 (=Q9) HIGH');   // catches the swap
assert(isLow(readPin(15)),      'count 256: physical pin 15 (=Q10) LOW');   // catches the swap

// Count = 512 → bit 8 = 0, bit 9 = 1 → Q9 LOW, Q10 HIGH.
for (let i = 0; i < 256; i++) tick();
assert(isLow(readName('Q9')),   'count 512: Q9 (by name) LOW');
assert(isHigh(readName('Q10')), 'count 512: Q10 (by name) HIGH');
assert(isLow(readPin(13)),      'count 512: physical pin 13 (=Q9) LOW');    // catches the swap
assert(isHigh(readPin(15)),     'count 512: physical pin 15 (=Q10) HIGH');  // catches the swap

// ── 4. Divide ratios + falling-edge behaviour of the low outputs ──────────────
clearTo0();
apply({ clk: 1 });                      // rising edge alone: must NOT advance
assert(isLow(readName('Q4')), 'rising edge alone does not advance (Q4 LOW)');
for (let i = 0; i < 7; i++) { apply({ clk: 0 }); apply({ clk: 1 }); }
assert(isLow(readName('Q4')),  '7 falling edges: Q4 still LOW (count 7)');
apply({ clk: 0 });                      // 8th falling edge → count 8 (bit 3 set)
assert(isHigh(readName('Q4')), '8 falling edges: Q4 HIGH (count 8, ÷16 tap)');

// ── 5. Oscillator buffers are complementary while running ─────────────────────
apply({ clk: 1 });
assert(isLow(readName('CLKO')),   'CLK HIGH, running: CLKO is the complement (LOW)');
assert(isHigh(readName('CLKOn')), 'CLK HIGH, running: CLKOn HIGH');
apply({ clk: 0 });
assert(isHigh(readName('CLKO')),  'CLK LOW, running: CLKO HIGH');
assert(isLow(readName('CLKOn')),  'CLK LOW, running: CLKOn LOW');

console.log(`cd4060-counter-osc-pinmap: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
