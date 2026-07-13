// ── CD40100 32-stage static left/right shift register — doc-stub guard ───────
// The CD40100B (js/chips/chips165.js) is a 32-stage BIDIRECTIONAL, RECIRCULATING
// shift register. Its shift DIRECTION (LEFT/RIGHT CONTROL pin 13) and its
// RECIRCULATE feedback path (RECIRCULATE CONTROL pin 9) are both chosen at run
// time, and a bit clocked into a stage only appears at that end's serial output
// half a clock later (next falling edge). 74Sim models a pin as input OR output
// and runs each gate to steady state with no propagation delay — none of the
// shift-register primitives reproduce a register that reverses direction and
// reroutes feedback live, and the shared engine file can't be edited during this
// parallel run, so the part ships "info sheet only": tagged 'stub' (hidden from
// the picker) with a SHIFT_REG_16BIT_STUB gate that drives its outputs Hi-Z.
// (Same family/treatment as the 64-stage CD4031/CD4517 — issues.md B2.)
//
// There is no behavior to regress, so this scenario guards the two things that
// CAN silently rot: (1) the verified CD40100B pinout (the real risk per issues.md
// C2 — never let a sibling's pin map creep in), and (2) the stub classification
// (tag + gate type), so the part can never quietly start claiming to simulate the
// bidirectional register. Pinout verified vs the RCA CD40100B terminal assignment
// (92CS-27568) + functional diagram (92CS-27567), RCA 1980 COS/MOS databook, read
// from the rendered PDF page images.
//
// Run:  node js/debug/scenarios/cd40100-lr-shift-stub.mjs   (non-zero on fail)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD40100');
assert(!!def, 'CD40100 should be present in CHIP_DB');

if (def) {
  // ── Package / supply ──────────────────────────────────────────────────────
  assert(def.pins === 16, `pins should be 16, got ${def.pins}`);
  assert(def.vcc === 16,  `vcc (VDD) should be pin 16, got ${def.vcc}`);
  assert(def.gnd === 8,   `gnd (VSS) should be pin 8, got ${def.gnd}`);

  // ── Stub classification ───────────────────────────────────────────────────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'SHIFT_REG_16BIT_STUB',
    `should have a single SHIFT_REG_16BIT_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);

  // ── Verified CD40100B terminal assignment (RCA 92CS-27568, top view) ───────
  const expected = {
    1: 'NC1',    2: 'CLKINH', 3: 'CLK',    4: 'SLOUT',
    5: 'NC5',    6: 'SLIN',   7: 'NC7',    8: 'VSS',
    9: 'RECIRC', 10: 'NC10',  11: 'SRIN',  12: 'SROUT',
    13: 'LRCTRL', 14: 'NC14', 15: 'NC15',  16: 'VDD',
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
  const chip = new ChipComponent('CD40100');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40100 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  wire('CLK', 1); wire('SRIN', 1); wire('SLIN', 0);
  wire('CLKINH', 0); wire('RECIRC', 1); wire('LRCTRL', 0);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // SHIFT_REG_16BIT_STUB leaves both serial outputs Hi-Z; with no external pull
  // the net floats toward 0 V — assert neither output is actively pulled HIGH.
  for (const n of ['SLOUT', 'SROUT']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd40100-lr-shift-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
