// ── CD4007 dual complementary MOS pair plus inverter — documentation-stub guard ─
// The CD4007 (js/chips/chips170.js) is a bare transistor array: three n-channel
// and three p-channel MOSFETs grouped as three complementary pairs, each pair's
// two gates tied to one input pin, with the drain/source terminals brought out
// individually. It has no fixed logic function — its circuit is whatever the user
// wires the transistors into (inverters, a 3-input NAND/NOR, current drivers,
// transmission gates) — and its headline uses are analog (linear amplifiers,
// crystal oscillators) that 74Sim's gate-level digital engine does not model
// (issues.md A11/A2/A3). It therefore ships "info sheet only": tagged 'stub'
// (hidden from the picker) with a GENERIC_STUB gate that leaves every terminal
// Hi-Z.
//
// There is no behavior to regress, so this scenario guards the two things that
// CAN silently rot: (1) the verified CD4007UB pinout (the real risk per issues.md
// C2 — never let a sibling's pin map creep in), and (2) the stub classification
// (tag + gate type), so the part can never quietly start claiming to simulate a
// transistor array. Pinout verified vs TI/Harris CD4007UB SCHS018C "TERMINAL
// DIAGRAM Top View" (92CS-24449) + functional diagram, read as a PDF page image.
//
// Run:  node js/debug/scenarios/cd4007-transistor-array-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD4007');
assert(!!def, 'CD4007 should be present in CHIP_DB');

if (def) {
  // ── Package / supply (note non-standard 14-pin power pins: VDD=14, VSS=7) ───
  assert(def.pins === 14, `pins should be 14, got ${def.pins}`);
  assert(def.vcc === 14,  `vcc (VDD) should be pin 14, got ${def.vcc}`);
  assert(def.gnd === 7,   `gnd (VSS) should be pin 7, got ${def.gnd}`);

  // ── Stub classification ───────────────────────────────────────────────────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);

  // ── Verified CD4007UB terminal assignment (SCHS018C, 92CS-24449) ───────────
  const expected = {
    1: 'Q2PD', 2: 'Q2PS', 3: 'Q2G',  4: 'Q2NS',
    5: 'Q2ND', 6: 'Q1G',  7: 'VSS',  8: 'Q1ND',
    9: 'Q3NS', 10: 'Q3G', 11: 'Q3PD', 12: 'Q3O',
    13: 'Q1PS', 14: 'VDD',
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
  const chip = new ChipComponent('CD4007');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4007 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  // Wire pair 2 as an inverter and drive its gate HIGH. On real silicon that
  // would pull the joined drains (pin 1 / pin 5) toward VSS. In 74Sim the stub
  // stays inert — the whole point of the guard.
  wire('Q2PS', 1); // P-source to VDD
  wire('Q2NS', 0); // N-source to VSS
  wire('Q2G', 1);  // gate input HIGH
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // GENERIC_STUB leaves the drain/output terminals Hi-Z; with no external pull
  // the net floats toward 0 V — assert no terminal is actively driven HIGH
  // (i.e. the stub really is inert, not secretly acting as a transistor).
  for (const n of ['Q1ND', 'Q1PS', 'Q2PD', 'Q2ND', 'Q3PD', 'Q3O']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd4007-transistor-array-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
