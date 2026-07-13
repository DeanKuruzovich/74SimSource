// ── CD4021 8-stage PISO shift register, ASYNC load — regression ──────────────
// The CD4021 (Batch 9, js/chips/chips89.js) is the first behavioral coverage of
// the SHIFT_REG_8BIT_PISO_CD4021 primitive. It guards the two ways the CD4021
// differs from its sibling CD4014 (and from the synchronous SHIFT_REG_8BIT_PISO_CD
// primitive the coverage plan originally hinted):
//   1. Parallel load is ASYNCHRONOUS — a HIGH on PARALLEL/SERIAL CONTROL
//      ('P/S C') jams P1..P8 in immediately, no clock edge required.
//   2. The brought-out stages are Q6/Q7/Q8 (Q8 = last stage / main serial out),
//      i.e. register bits 5/6/7 — NOT the 5/6/7 stages of the CD4014 entry.
//
// Method (mirrors cd4020-ripple-counter.mjs): place ONE CD4021 and keep the same
// chip + sim instance for the whole run so the register's sequential state
// persists. Each input pin is wired to the VCC row (1) or GND row (0) before a
// solve. A clock pulse is a LOW→HIGH→LOW on CLK; the shift happens on the rising
// edge (P/S C LOW).
//
// Bit map: register bit i = stage i+1, loaded as reg=(P8<<7)|...|P1. So after an
// async load Q6=P6, Q7=P7, Q8=P8. A serial shift moves bit i → bit i+1, entering
// SER at bit 0 (stage 1); Q8 (bit 7) shifts out first.
//
// Run:  node js/debug/scenarios/cd4021-piso-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4021');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Defaults: P/S C low (serial mode), clk low, serial low, all parallel low.
const PARALLEL = ['P1','P2','P3','P4','P5','P6','P7','P8'];
let stateP = { P1:0,P2:0,P3:0,P4:0,P5:0,P6:0,P7:0,P8:0 };

function apply({ clk = 0, ps = 0, ser = 0, p = null } = {}) {
  if (p) stateP = { ...stateP, ...p };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4021 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLK', clk ? 1 : 0);
  wirePin('P/S C', ps ? 1 : 0);
  wirePin('SER', ser ? 1 : 0);
  for (const name of PARALLEL) wirePin(name, stateP[name] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

// One serial-shift clock pulse: rising edge (advance) then return low. P/S C LOW
// (serial mode) unless overridden. `ser` sets the serial-in bit during the edge.
function shift(ser = 0) {
  apply({ clk: 1, ps: 0, ser });   // rising edge → shift
  apply({ clk: 0, ps: 0, ser });   // back low
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const q = () => `Q6=${isHigh(read('Q6'))?1:0} Q7=${isHigh(read('Q7'))?1:0} Q8=${isHigh(read('Q8'))?1:0}`;

// ── 1. ASYNCHRONOUS parallel load (no clock edge at all) ─────────────────────
// Pattern: P6=1, P7=0, P8=1 (the three pinned stages), plus P1=1 deep inside.
// Hold CLK LOW the whole time — the load must happen purely from P/S C HIGH.
apply({ clk: 0, ps: 1, p: { P1:1, P2:0, P3:0, P4:0, P5:0, P6:1, P7:0, P8:1 } });
assert(isHigh(read('Q6')), `async load: Q6 should be HIGH (=P6), got ${q()}`);
assert(isLow (read('Q7')), `async load: Q7 should be LOW (=P7), got ${q()}`);
assert(isHigh(read('Q8')), `async load: Q8 should be HIGH (=P8), got ${q()}`);

// Changing the parallel inputs while P/S C stays HIGH re-jams immediately
// (level-sensitive async load, still no clock).
apply({ clk: 0, ps: 1, p: { P6:0, P7:1, P8:0 } });
assert(isLow (read('Q6')), `async re-jam: Q6 should follow P6=0, got ${q()}`);
assert(isHigh(read('Q7')), `async re-jam: Q7 should follow P7=1, got ${q()}`);
assert(isLow (read('Q8')), `async re-jam: Q8 should follow P8=0, got ${q()}`);

// ── 2. Re-load a known word, then SERIAL-SHIFT it out ────────────────────────
// reg = P8..P1 = 1 0 1 0 0 1 0 1  (P8=1,P7=0,P6=1,P5=0,P4=0,P3=1,P2=0,P1=1)
// → Q8=P8=1, Q7=P7=0, Q6=P6=1.
apply({ clk: 0, ps: 1, p: { P1:1,P2:0,P3:1,P4:0,P5:0,P6:1,P7:0,P8:1 } });
assert(isHigh(read('Q8')) && isLow(read('Q7')) && isHigh(read('Q6')),
  `reload: expected Q8,Q7,Q6 = 1,0,1, got ${q()}`);

// Drop into serial mode and shift once (SER=0). Shift moves bit i → bit i+1:
//   new Q8 = old bit6 = P7 = 0
//   new Q7 = old bit5 = P6 = 1
//   new Q6 = old bit4 = P5 = 0
shift(0);
assert(isLow (read('Q8')), `shift1: Q8 should be old P7=0, got ${q()}`);
assert(isHigh(read('Q7')), `shift1: Q7 should be old P6=1, got ${q()}`);
assert(isLow (read('Q6')), `shift1: Q6 should be old P5=0, got ${q()}`);

// ── 3. A bare load is NOT triggered by a clock edge in serial mode ───────────
// (i.e. serial shifting really is what moves data; verify a non-edge re-solve in
// serial mode does not spontaneously change the register.)
const before = q();
apply({ clk: 0, ps: 0, ser: 0 });   // no rising edge → no change
assert(q() === before, `idle serial: register changed without a clock edge (${before} → ${q()})`);

// ── 4. Serial input ripples all the way to Q8 after 8 shifts ─────────────────
// Async-clear to zero first (load all-zero parallel word), then clock SER=1 in.
apply({ clk: 0, ps: 1, p: { P1:0,P2:0,P3:0,P4:0,P5:0,P6:0,P7:0,P8:0 } });
assert(isLow(read('Q8')) && isLow(read('Q7')) && isLow(read('Q6')),
  `zero load: expected all-LOW outputs, got ${q()}`);
// After 1 shift with SER=1, bit0 set — not yet visible on Q6 (bit5).
shift(1);
assert(isLow(read('Q6')), `ser ripple: after 1 shift Q6 (bit5) should still be LOW, got ${q()}`);
// 5 more shifts (total 6) bring the first SER bit to bit5 = Q6, then keep SER=0.
shift(0); shift(0); shift(0); shift(0); shift(0);
assert(isHigh(read('Q6')), `ser ripple: after 6 shifts the SER=1 bit should reach Q6, got ${q()}`);
assert(isLow (read('Q7')), `ser ripple: Q7 (bit6) should still be LOW, got ${q()}`);
// 2 more shifts → the bit reaches Q8 (bit7).
shift(0); shift(0);
assert(isHigh(read('Q8')), `ser ripple: after 8 shifts the SER=1 bit should reach Q8, got ${q()}`);

console.log(`cd4021-piso-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
