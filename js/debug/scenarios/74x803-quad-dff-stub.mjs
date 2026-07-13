// ── 74x803 "Quad D flip flop" — documentation-stub guard ─────────────────────
// The 74x803 (js/chips/chips40.js) is LEFT AS A STUB on purpose: no datasheet
// exists for a 74803 from any manufacturer. The "803" slot is a real gap in TI's
// Advanced Schottky 800 line-driver family (800, 802, 804, 805, 808, 810, 811,
// ... — no 801, no 803), confirmed by full-text search of TI's 1984 TTL Data
// Book Vol 3 and by cross-manufacturer web searches. The stub's "quad D flip
// flop" function was hand-entered on speculation and cannot be verified, so the
// entry stays GENERIC_STUB / tagged 'stub'. See the header comment on the entry
// and issues.md ("74x803").
//
// There is no verified pinout to regress (the part is unattested), so — unlike a
// real-chip scenario — this guard deliberately does NOT assert pin names. It
// guards the two things that could silently rot: (1) the stub classification
// (tag + single GENERIC_STUB gate), so the part can never quietly start claiming
// to simulate, and (2) that the entry still loads, places, wires, and evaluates
// without throwing and stays inert (drives no terminal to a logic HIGH).
//
// Run:  node js/debug/scenarios/74x803-quad-dff-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x803');
assert(!!def, '74x803 should be present in CHIP_DB');

if (def) {
  // ── Package / supply (the only facts the entry asserts) ───────────────────
  assert(def.pins === 14, `pins should be 14, got ${def.pins}`);
  assert(def.vcc === 14,  `vcc should be pin 14, got ${def.vcc}`);
  assert(def.gnd === 7,   `gnd should be pin 7, got ${def.gnd}`);

  // ── Stub classification: must stay a stub until a datasheet surfaces ───────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);
}

// ── Inert behavior: places, wires power + a couple of inputs, evaluates ───────
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x803');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x803 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC', 1);
  wire('GND', 0);
  // Drive the documented data/clock lines HIGH — a real FF would latch; the stub
  // stays inert and leaves the Q lines Hi-Z.
  wire('CLK', 1); wire('D0', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['Q0', 'Q1', 'Q2', 'Q3']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x803-quad-dff-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
