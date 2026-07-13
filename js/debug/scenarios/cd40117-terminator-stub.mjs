// ── CD40117 programmable dual 4-bit terminator — documentation-stub guard ─────
// The CD40117 (js/chips/chips153.js) is a programmable dual 4-bit BUS TERMINATOR:
// each of its two sections becomes weak pull-up resistors, weak pull-down
// resistors, or a bus-hold latch, per its STROBE + DATA control bits. 74Sim does
// NOT model weak-keeper / weak-resistor drive strength (issues.md A12) — a
// terminator only works by being weaker than the real drivers on the bus — so it
// ships as an "info sheet only" documentation entry: tagged 'stub' (hidden from
// the picker) with a GENERIC_STUB gate that leaves every terminal line Hi-Z.
//
// There is no behavior to regress, so this scenario instead guards the two things
// that CAN silently rot: (1) the verified CD40117B pinout (the real risk per
// issues.md C2 — never let a sibling's pin map creep in), and (2) the stub
// classification (tag + gate type), so the part can never quietly start claiming
// to simulate a terminator. Pinout + truth table verified vs TI/Harris CD40117B
// SCHS101C TERMINAL DIAGRAM (TOP VIEW), read from the PDF page image.
//
// Run:  node js/debug/scenarios/cd40117-terminator-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD40117');
assert(!!def, 'CD40117 should be present in CHIP_DB');

if (def) {
  // ── Package / supply ──────────────────────────────────────────────────────
  assert(def.pins === 14, `pins should be 14, got ${def.pins}`);
  assert(def.vcc === 14,  `vcc should be pin 14, got ${def.vcc}`);
  assert(def.gnd === 7,   `gnd (VSS) should be pin 7, got ${def.gnd}`);

  // ── Stub classification ───────────────────────────────────────────────────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);

  // ── Verified CD40117B terminal assignment (SCHS101C, TOP VIEW) ─────────────
  const expected = {
    1: 'STRA', 2: 'STRB', 3: '1A',   4: '2A',
    5: '3A',   6: '4A',   7: 'VSS',  8: '4B',
    9: '3B',  10: '2B',  11: '1B',  12: 'DATB',
    13: 'DATA', 14: 'VDD',
  };
  const byPin = Object.fromEntries(def.pinout.map(p => [p.pin, p.name]));
  for (const [pin, name] of Object.entries(expected)) {
    assert(byPin[pin] === name,
      `pin ${pin} should be ${name}, got ${byPin[pin]}`);
  }
}

// ── Inert behavior: places, wires by name, evaluates without error ───────────
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('CD40117');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40117 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  // Program section A to "pull-up" (STROBE=1, DATA=1) — on real silicon the four
  // A terminals would be pulled toward VDD. In 74Sim the stub stays inert.
  wire('STRA', 1); wire('DATA', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // GENERIC_STUB leaves the terminal lines Hi-Z; with no external pull the net
  // floats toward 0 V — assert no terminal is actively pulled to a logic-HIGH
  // rail (i.e. the stub really is inert, not secretly terminating).
  for (const n of ['1A', '2A', '3A', '4A', '1B', '2B', '3B', '4B']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd40117-terminator-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
