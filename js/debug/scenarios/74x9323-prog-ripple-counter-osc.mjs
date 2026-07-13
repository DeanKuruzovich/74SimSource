// ── 74x9323 programmable ripple counter with oscillator regression ───────────
// The 74x9323 (js/chips/chips65.js) drives the COUNTER_PROG_RIPPLE_OSC engine
// primitive. A 3-stage binary ripple counter advances on each HIGH→LOW (falling)
// edge of X1. Two select inputs choose how far the X1 frequency is divided before
// it reaches OUT: S1=0,S2=0 → ÷1 (OUT follows the clock); 0,1 → ÷2 (Q0);
// 1,0 → ÷4 (Q1); 1,1 → ÷8 (Q2). MR (active LOW) clears the counter, stops the
// oscillator, and tri-states OUT. X2 = NAND(X1, MR) is the oscillator output.
//
// Pin map (verified vs Nexperia 74HC6323A datasheet, Rev. 4, Fig. 4 / Table 2,
// the drop-in successor to the Philips/NXP 74HC9323A): 1=OUT, 2=S2, 3=S1, 4=GND,
// 5=MR, 6=X2, 7=X1, 8=VCC. Function table: datasheet Table 3.
//
// Run:  node js/debug/scenarios/74x9323-prog-ripple-counter-osc.mjs  (non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x9323');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply({ x1, mr = 1, s1 = 0, s2 = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x9323 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('X1', x1);
  wirePin('MR', mr);
  wirePin('S1', s1);
  wirePin('S2', s2);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One counter clock at the given select setting: X1 HIGH then LOW.
// The high→low edge advances the count.
function tick(sel) { apply({ x1: 1, ...sel }); apply({ x1: 0, ...sel }); }
// Asynchronous clear: MR LOW.
function clear(sel) { apply({ x1: 0, mr: 0, ...sel }); }

// ── 1. Divide-by-8 (S1=1,S2=1): OUT = Q2, HIGH only for counts 4..7 ───────────
{
  const sel = { mr: 1, s1: 1, s2: 1 };
  clear({ s1: 1, s2: 1 });            // reset, count = 0
  // Counter is cleared; bring MR back HIGH (idle X1 LOW, no falling edge yet).
  apply({ x1: 0, ...sel });
  for (let n = 1; n <= 8; n++) {
    tick(sel);
    const count = n % 8;
    const wantQ2 = (count >> 2) & 1;
    assert(wantQ2 ? isHigh(read('OUT')) : isLow(read('OUT')),
      `÷8: after ${n} edges (count ${count}) OUT should be ${wantQ2 ? 'HIGH' : 'LOW'}`);
  }
}

// ── 2. Divide-by-2 (S1=0,S2=1): OUT = Q0, toggles every falling edge ──────────
{
  const sel = { mr: 1, s1: 0, s2: 1 };
  clear({ s1: 0, s2: 1 });
  apply({ x1: 0, ...sel });
  for (let n = 1; n <= 4; n++) {
    tick(sel);
    const wantQ0 = n & 1;             // count = n, Q0 = bit0
    assert(wantQ0 ? isHigh(read('OUT')) : isLow(read('OUT')),
      `÷2: after ${n} edges OUT (Q0) should be ${wantQ0 ? 'HIGH' : 'LOW'}`);
  }
}

// ── 3. Divide-by-1 (S1=0,S2=0): OUT follows X1 directly ───────────────────────
{
  const sel = { mr: 1, s1: 0, s2: 0 };
  apply({ x1: 1, ...sel });
  assert(isHigh(read('OUT')), '÷1: OUT HIGH when X1 HIGH');
  apply({ x1: 0, ...sel });
  assert(isLow(read('OUT')),  '÷1: OUT LOW when X1 LOW');
}

// ── 4. X2 oscillator output = NAND(X1, MR) ────────────────────────────────────
{
  apply({ x1: 1, mr: 1, s1: 0, s2: 0 });
  assert(isLow(read('X2')),  'X2 = NAND(1,1) = LOW when X1 HIGH, MR HIGH');
  apply({ x1: 0, mr: 1, s1: 0, s2: 0 });
  assert(isHigh(read('X2')), 'X2 = NAND(0,1) = HIGH when X1 LOW, MR HIGH');
  apply({ x1: 1, mr: 0, s1: 0, s2: 0 });
  assert(isHigh(read('X2')), 'X2 = NAND(1,0) = HIGH when MR LOW (oscillator stopped)');
}

// ── 5. MR LOW clears the counter (and re-enabling restarts the count) ─────────
{
  const sel = { mr: 1, s1: 0, s2: 1 };  // ÷2 so OUT = Q0 is easy to read
  clear({ s1: 0, s2: 1 });
  apply({ x1: 0, ...sel });
  tick(sel); tick(sel); tick(sel);      // count = 3, Q0 = 1
  assert(isHigh(read('OUT')), 'pre-reset: count 3 → Q0 HIGH');
  clear({ s1: 0, s2: 1 });              // MR LOW → clear to 0
  apply({ x1: 0, ...sel });             // release reset, count = 0
  tick(sel);                            // one edge → count 1, Q0 = 1
  assert(isHigh(read('OUT')), 'after reset: one edge → count 1, Q0 HIGH');
}

// ── 6. Rising edge alone must NOT advance (falling-edge counter) ──────────────
{
  const sel = { mr: 1, s1: 0, s2: 1 };
  clear({ s1: 0, s2: 1 });
  apply({ x1: 0, ...sel });             // count 0, Q0 LOW
  apply({ x1: 1, ...sel });             // rising edge only
  assert(isLow(read('OUT')), 'rising edge alone does not advance (Q0 still LOW)');
  apply({ x1: 0, ...sel });             // now the falling edge
  assert(isHigh(read('OUT')), 'falling edge advances to count 1 (Q0 HIGH)');
}

console.log(`74x9323-prog-ripple-counter-osc: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
