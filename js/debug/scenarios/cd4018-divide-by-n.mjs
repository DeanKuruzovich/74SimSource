// ── CD4018 presettable divide-by-N counter — regression ─────────────────────
// The CD4018 (js/chips/chips119.js) is the first behavioral coverage of the
// COUNTER_JOHNSON_4018 primitive. It guards the facts that make the CD4018
// different from the 7490 the coverage-plan hint COUNTER_DECADE_DIV actually
// models (a ÷2/÷5 decade counter with R01/R02/R91/R92), and from the close-but-
// wrong SHIFT_REG_5BIT (74x96, active-LOW CLR + async, set-only preset):
//   1. Five-stage shift chain: on the rising CLOCK edge Q1<-DATA, Q2<-Q1,
//      Q3<-Q2, Q4<-Q3, Q5<-Q4.
//   2. RESET (pin 15) is active-HIGH and ASYNCHRONOUS — a HIGH clears all five.
//   3. PRESET ENABLE (pin 10) is active-HIGH and ASYNCHRONOUS — a HIGH jams
//      JAM1..JAM5 into the stages with no clock edge.
//   4. Divide-by-10 Johnson operation: feeding ~Q5 back to DATA yields a
//      period-10 sequence; Q1 is HIGH for 5 of every 10 clocks.
//
// Method (mirrors cd4021-piso-shift.mjs): place ONE CD4018 and keep the same
// chip + sim instance for the whole run so the register's state persists. Each
// input pin is wired to the VCC row (1) or GND row (0) before a solve. A clock
// pulse is a LOW→HIGH→LOW on CLOCK; the shift happens on the rising edge.
//
// Run:  node js/debug/scenarios/cd4018-divide-by-n.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4018');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const JAMS = ['JAM1', 'JAM2', 'JAM3', 'JAM4', 'JAM5'];
let stateJ = { JAM1: 0, JAM2: 0, JAM3: 0, JAM4: 0, JAM5: 0 };

function apply({ clk = 0, rst = 0, pe = 0, data = 0, jam = null } = {}) {
  if (jam) stateJ = { ...stateJ, ...jam };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`CD4018 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', clk ? 1 : 0);
  wirePin('RESET', rst ? 1 : 0);
  wirePin('PE',    pe  ? 1 : 0);
  wirePin('DATA',  data ? 1 : 0);
  for (const name of JAMS) wirePin(name, stateJ[name] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bit  = (name) => (isHigh(read(name)) ? 1 : 0);
const q = () => `Q1=${bit('Q1')} Q2=${bit('Q2')} Q3=${bit('Q3')} Q4=${bit('Q4')} Q5=${bit('Q5')}`;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// One clock pulse with given DATA on the rising edge.
function clock(data = 0) {
  apply({ clk: 1, data });
  apply({ clk: 0, data });
}

// ── 1. Async RESET clears all five stages (no clock edge) ────────────────────
apply({ rst: 1 });
assert(isLow(read('Q1')) && isLow(read('Q2')) && isLow(read('Q3')) &&
       isLow(read('Q4')) && isLow(read('Q5')),
  `reset: all outputs should be LOW, got ${q()}`);

// ── 2. Plain 5-stage shift: DATA ripples Q1→Q2→…→Q5 ──────────────────────────
apply({ rst: 0 });
clock(1);                       // Q1<-1
assert(bit('Q1') === 1 && bit('Q2') === 0, `shift1: expected Q1=1,Q2=0, got ${q()}`);
clock(0);                       // Q1<-0, Q2<-1
assert(bit('Q1') === 0 && bit('Q2') === 1 && bit('Q3') === 0, `shift2: expected Q2=1, got ${q()}`);
clock(0); clock(0); clock(0);   // ripple the 1 out to Q5
assert(bit('Q5') === 1 && bit('Q1') === 0 && bit('Q2') === 0 && bit('Q3') === 0 && bit('Q4') === 0,
  `shift5: the single 1 should reach Q5 and clear behind it, got ${q()}`);

// ── 3. Async PRESET ENABLE jam-load (no clock edge) ──────────────────────────
// Jam a known word 1,0,1,1,0 and confirm it appears immediately with CLOCK low.
apply({ clk: 0, pe: 1, jam: { JAM1: 1, JAM2: 0, JAM3: 1, JAM4: 1, JAM5: 0 } });
assert(bit('Q1') === 1 && bit('Q2') === 0 && bit('Q3') === 1 && bit('Q4') === 1 && bit('Q5') === 0,
  `jam load: expected 1,0,1,1,0, got ${q()}`);
// Changing JAM while PE stays HIGH re-jams immediately (level-sensitive).
apply({ clk: 0, pe: 1, jam: { JAM1: 0, JAM5: 1 } });
assert(bit('Q1') === 0 && bit('Q5') === 1, `jam re-load: Q1 should follow JAM1=0, Q5 JAM5=1, got ${q()}`);

// ── 4. RESET dominates PRESET ENABLE (disallowed both-HIGH case) ─────────────
apply({ clk: 0, pe: 1, rst: 1, jam: { JAM1: 1, JAM2: 1, JAM3: 1, JAM4: 1, JAM5: 1 } });
assert(bit('Q1') === 0 && bit('Q2') === 0 && bit('Q3') === 0 && bit('Q4') === 0 && bit('Q5') === 0,
  `reset>pe: RESET should win and clear, got ${q()}`);

// ── 5. Divide-by-10 Johnson operation (feed ~Q5 back to DATA) ────────────────
// Start from all-zero, then on every clock drive DATA = NOT(Q5). The expected
// Johnson sequence on (Q1..Q5) over 10 clocks, returning to all-zero:
//   00000 -> 10000 -> 11000 -> 11100 -> 11110 -> 11111 -> 01111 -> 00111
//         -> 00011 -> 00001 -> 00000
apply({ rst: 1 }); apply({ rst: 0 });        // clear to 00000
const expected = [
  [1,0,0,0,0],[1,1,0,0,0],[1,1,1,0,0],[1,1,1,1,0],[1,1,1,1,1],
  [0,1,1,1,1],[0,0,1,1,1],[0,0,0,1,1],[0,0,0,0,1],[0,0,0,0,0],
];
let q1Highs = 0;
for (let i = 0; i < 10; i++) {
  const data = bit('Q5') ? 0 : 1;            // DATA = NOT(Q5)
  clock(data);
  const got = [bit('Q1'), bit('Q2'), bit('Q3'), bit('Q4'), bit('Q5')];
  assert(got.join('') === expected[i].join(''),
    `div10 step ${i + 1}: expected ${expected[i].join('')}, got ${got.join('')}`);
  if (got[0] === 1) q1Highs++;
}
// In a ÷10 Johnson counter Q1 is HIGH for exactly 5 of the 10 states (a clean
// divide-by-10 / 50%-duty square wave on Q1).
assert(q1Highs === 5, `div10: Q1 should be HIGH in 5 of 10 states, got ${q1Highs}`);

console.log(`cd4018-divide-by-n: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
