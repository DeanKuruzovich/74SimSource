// ── CD4062A 200-stage dynamic shift register — documentation-stub guard ───────
// The CD4062A (js/chips/chips166.js) is a 200-stage DYNAMIC serial shift register:
// a bit at D moves one stage per clock toward Q, 200 stages later, clocked either
// single-phase (CM low, on CL) or two-phase (CM high, on CL1/CL2), with a
// recirculate path (RC/REC) and delayed-clock cascade outputs (CL1D/CL2D).
//
// 74Sim ships it as "info sheet only": "dynamic" means each bit is held as charge
// that leaks away unless clocked continuously above a minimum rate, and 74Sim
// models storage as ideal/static with no charge decay or minimum clock rate
// (issues.md A5/A3); 200 stages also exceeds the engine's 31-bit shift-register
// packing (issues.md D6), and nothing models the dual clock modes / recirculate /
// delayed-clock outputs (Coverage-Plan §D3). It is therefore tagged 'stub'
// (hidden from the picker) with a GENERIC_STUB gate that leaves its outputs Hi-Z.
//
// There is no behavior to regress, so this scenario guards the two things that
// CAN silently rot: (1) the verified CD4062AT pinout (the real risk per issues.md
// C2 — never let a sibling's or guessed pin map creep in), and (2) the stub
// classification (tag + gate type), so the part can never quietly start claiming
// to simulate a 200-bit dynamic register. Pinout verified vs the RCA CD4062AT
// TERMINAL DIAGRAM (1980 COS/MOS databook, drawing 92CS-22693), cross-checked
// against the 1975 File No. 816 logic diagram, read from the PDF page images.
//
// Run:  node js/debug/scenarios/cd4062-dynamic-shift-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD4062');
assert(!!def, 'CD4062 should be present in CHIP_DB');

if (def) {
  // ── Package / supply (12-lead TO-5, CD4062AT — no DIP exists) ───────────────
  assert(def.pins === 12, `pins should be 12, got ${def.pins}`);
  assert(def.vcc === 12,  `vcc (VDD) should be pin 12, got ${def.vcc}`);
  assert(def.gnd === 7,   `gnd (VSS) should be pin 7, got ${def.gnd}`);

  // ── Stub classification ───────────────────────────────────────────────────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);

  // ── Verified CD4062AT terminal assignment (92CS-22693, TOP VIEW) ───────────
  const expected = {
    1: 'CL',   2: 'D',    3: 'RC',   4: 'REC',
    5: 'CL2',  6: 'CL2D', 7: 'VSS',  8: 'CL1D',
    9: 'CL1', 10: 'Q',   11: 'CM',  12: 'VDD',
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
  const chip = new ChipComponent('CD4062');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4062 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  // Drive a data bit in and request single-phase clocking — on real silicon the
  // bit would eventually ripple to Q. In 74Sim the stub stays inert.
  wire('D', 1); wire('CM', 0); wire('CL', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // GENERIC_STUB leaves the output pins Hi-Z; with no external pull the net floats
  // toward 0 V — assert no output is actively driven HIGH (the stub really is
  // inert, not secretly shifting).
  for (const n of ['Q', 'CL1D', 'CL2D']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd4062-dynamic-shift-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
