// ── CD4048 multifunction 8-input gate — documentation-stub guard ─────────────
// The CD4048B (js/chips/chips151.js) is a single 8-input gate whose logic
// function is chosen at RUN TIME by three control pins: Ka/Kb/Kc select one of
// eight functions (NOR, OR, OR/AND, OR/NAND, AND, NAND, AND/NOR, AND/OR), a
// fourth control input Kd switches the output between driven and high-impedance
// 3-state, and an EXPAND input cascades two packages into a 16-input gate.
// 74Sim's engine has no "function-select" gate primitive, so per the CD4046 /
// CD4553 precedent (issues.md D13) it ships as an "info sheet only" entry:
// tagged 'stub' (hidden from the picker) with a GENERIC_STUB gate that drives
// the output Hi-Z.
//
// There is no behavior to regress, so this scenario guards the two things that
// CAN silently rot: (1) the verified CD4048B pinout (the real risk per
// issues.md C2 — the control pins are deliberately NOT adjacent: Ka=10, Kb=7,
// Kc=9, Kd=2, so a sibling's "all the K's together" map must never creep in),
// and (2) the stub classification (tag + gate type), so the part can never
// quietly start claiming to simulate the multifunction gate. Pinout verified vs
// TI CD4048B SCHS045C TERMINAL ASSIGNMENT (TOP VIEW), read from the PDF page
// image (issues.md C4).
//
// Run:  node js/debug/scenarios/cd4048-multifunction-gate-stub.mjs  (non-zero on fail)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD4048');
assert(!!def, 'CD4048 should be present in CHIP_DB');

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

  // ── Verified CD4048B terminal assignment (SCHS045C, TOP VIEW) ──────────────
  const expected = {
    1: 'J',   2: 'Kd',  3: 'H',   4: 'G',
    5: 'F',   6: 'E',   7: 'Kb',  8: 'VSS',
    9: 'Kc', 10: 'Ka', 11: 'D',  12: 'C',
    13: 'B', 14: 'A',  15: 'EXPAND', 16: 'VDD',
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
  const chip = new ChipComponent('CD4048');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4048 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  // Drive a couple of data inputs + the 3-state control HIGH; a real gate could
  // make J HIGH, but the stub must stay inert.
  wire('A', 1); wire('B', 1); wire('Kd', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  const v = sim.getVoltageAtHole(chip.getPinByName('J').holeId);
  assert(v <= 2.5, `J should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd4048-multifunction-gate-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
