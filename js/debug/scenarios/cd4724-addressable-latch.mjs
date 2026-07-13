// ── CD4724 8-bit addressable latch regression ───────────────────────────────
// The CD4724 (js/chips/chips117.js) maps onto the ADDRESSABLE_LATCH engine
// primitive with the opt-in gate.resetActiveHigh flag. It is the 4000-series
// part and is NOT a clone of the 74x259 / 74HC 74x4724 sibling (issues.md C2):
// its two control pins are ACTIVE HIGH and the RESET is gated by WRITE DISABLE,
// giving a true active-high 8-channel demultiplexer mode.
//
// Datasheet MODE SELECTION table (TI/Harris CD4724B SCHS092C, WD = WRITE
// DISABLE, R = RESET):
//   WD=0 R=0 : addressed bit follows DATA ; unaddressed bits hold.
//   WD=0 R=1 : addressed bit follows DATA ; unaddressed bits reset to 0 (demux).
//   WD=1 R=0 : all bits hold previous state.
//   WD=1 R=1 : all bits reset to 0 (master clear).
//
// Method: place ONE CD4724 and keep the same chip + sim instance across the run
// so the latch state (comp.state) persists. Inputs are re-wired HIGH/LOW each
// solve; Q0..Q7 are read straight off the pins by name.
//
// Run:  node js/debug/scenarios/cd4724-addressable-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4724');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with each input held at the given rail level (1 = VCC row, 0 = GND
// row). The latch state lives on the (persistent) chip component, not the wires.
function apply({ addr, data, wd, reset }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4724 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('A0', (addr & 1) ? 1 : 0);
  wirePin('A1', (addr & 2) ? 1 : 0);
  wirePin('A2', (addr & 4) ? 1 : 0);
  wirePin('DATA',  data  ? 1 : 0);
  wirePin('WD',    wd    ? 1 : 0);
  wirePin('RESET', reset ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Assert Q0..Q7 match the 8-element expected array (1 = HIGH, 0 = LOW).
function expectQ(tag, want) {
  for (let i = 0; i < 8; i++) {
    const got = read('Q' + i);
    assert(want[i] ? isHigh(got) : isLow(got),
      `${tag}: Q${i} expected ${want[i] ? 'HIGH' : 'LOW'}, got ${got.toFixed(2)} V`);
  }
}

// ── Mode WD=0,R=0 : normal addressable write (addressed follows DATA, hold) ───

// Write 1 into bit 0.
apply({ addr: 0, data: 1, wd: 0, reset: 0 });
expectQ('write Q0=1', [1, 0, 0, 0, 0, 0, 0, 0]);

// Write 1 into bit 3 — bit 0 must HOLD.
apply({ addr: 3, data: 1, wd: 0, reset: 0 });
expectQ('write Q3=1, Q0 holds', [1, 0, 0, 1, 0, 0, 0, 0]);

// Clear bit 0 (DATA=0 at addressed bit) — bit 3 must HOLD.
apply({ addr: 0, data: 0, wd: 0, reset: 0 });
expectQ('clear Q0, Q3 holds', [0, 0, 0, 1, 0, 0, 0, 0]);

// ── Mode WD=0,R=1 : demultiplexer (addressed follows DATA, others forced 0) ───

// Address bit 5, DATA=1 → Q5=1, every other bit (incl. the held Q3) forced 0.
apply({ addr: 5, data: 1, wd: 0, reset: 1 });
expectQ('demux Q5=1, rest cleared', [0, 0, 0, 0, 0, 1, 0, 0]);

// Demux move to bit 2 → only Q2 high.
apply({ addr: 2, data: 1, wd: 0, reset: 1 });
expectQ('demux Q2=1, rest cleared', [0, 0, 1, 0, 0, 0, 0, 0]);

// Demux with DATA=0 at the addressed bit → all outputs 0.
apply({ addr: 2, data: 0, wd: 0, reset: 1 });
expectQ('demux DATA=0 -> all low', [0, 0, 0, 0, 0, 0, 0, 0]);

// ── Mode WD=1,R=0 : all hold (storage register) ──────────────────────────────

// Seed a known pattern via normal write, then verify WD=1 freezes it.
apply({ addr: 1, data: 1, wd: 0, reset: 0 });
apply({ addr: 6, data: 1, wd: 0, reset: 0 });
expectQ('seed Q1,Q6', [0, 1, 0, 0, 0, 0, 1, 0]);

// WD=1: changing address & DATA must NOT alter any output.
apply({ addr: 1, data: 0, wd: 1, reset: 0 });
expectQ('WD=1 hold (write inhibited)', [0, 1, 0, 0, 0, 0, 1, 0]);
apply({ addr: 4, data: 1, wd: 1, reset: 0 });
expectQ('WD=1 hold (addr/data changed)', [0, 1, 0, 0, 0, 0, 1, 0]);

// ── Mode WD=1,R=1 : master clear (all reset to 0) ────────────────────────────

apply({ addr: 4, data: 1, wd: 1, reset: 1 });
expectQ('WD=1,R=1 master clear', [0, 0, 0, 0, 0, 0, 0, 0]);

console.log(`cd4724-addressable-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
