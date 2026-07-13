// ── CD4553 3-digit BCD counter — documentation-stub guard ────────────────────
// The CD4553 (js/chips/chips132.js) is a 3-digit BCD counter whose defining
// feature is a TIME-MULTIPLEXED display interface: the three internal BCD digits
// are scanned one at a time onto a shared 4-bit bus Q0–Q3 with three active-low
// digit-select strobes DS1/DS2/DS3. That scan is driven by an on-chip
// free-running oscillator set by an external capacitor on C1A/C1B. 74Sim does
// NOT model the 4000-series free-running RC oscillators (issues.md A3/A9), so
// without the scan the multiplexed output is meaningless. Per the CD4046
// precedent (issues.md D13) it ships as an "info sheet only" documentation
// entry: tagged 'stub' (hidden from the picker) with a GENERIC_STUB gate that
// drives every signal output Hi-Z.
//
// There is no behavior to regress, so this scenario instead guards the two
// things that CAN silently rot: (1) the verified CD4553/MC14553B pinout (the
// real risk per issues.md C2 — never let a sibling's pin map creep in), and
// (2) the stub classification (tag + gate type), so the part can never quietly
// start claiming to simulate the multiplexed counter. Pinout verified vs ON Semi
// MC14553B (CD4553) Figure 1 Block Diagram, read from the PDF page image.
//
// Run:  node js/debug/scenarios/cd4553-bcd-counter-stub.mjs   (non-zero on fail)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD4553');
assert(!!def, 'CD4553 should be present in CHIP_DB');

if (def) {
  // ── Package / supply ──────────────────────────────────────────────────────
  assert(def.pins === 16, `pins should be 16, got ${def.pins}`);
  assert(def.vcc === 16,  `vcc should be pin 16, got ${def.vcc}`);
  assert(def.gnd === 8,   `gnd (VSS) should be pin 8, got ${def.gnd}`);

  // ── Stub classification ───────────────────────────────────────────────────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);

  // ── Verified MC14553B / CD4553 terminal assignment (Figure 1) ──────────────
  const expected = {
    1: 'DS2',   2: 'DS1',   3: 'C1B',   4: 'C1A',
    5: 'Q3',    6: 'Q2',    7: 'Q1',    8: 'VSS',
    9: 'Q0',   10: 'LE',   11: 'DIS',  12: 'CLOCK',
    13: 'MR',  14: 'OF',   15: 'DS3',  16: 'VDD',
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
  const chip = new ChipComponent('CD4553');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4553 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  wire('CLOCK', 1); wire('DIS', 0); wire('MR', 0); wire('LE', 0);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // GENERIC_STUB leaves outputs Hi-Z; with no external pull the net floats
  // toward 0 V — assert no output is actively pulled to a logic-HIGH rail.
  for (const n of ['Q0', 'Q1', 'Q2', 'Q3', 'OF', 'DS1', 'DS2', 'DS3']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd4553-bcd-counter-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
