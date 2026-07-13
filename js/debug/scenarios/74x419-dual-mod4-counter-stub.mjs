// ── 74x419 "Dual Mod-4 Counter" — documentation-stub guard ───────────────────
// The 74x419 (js/chips/chips66.js) is LEFT AS A STUB on purpose. Wikipedia's
// 7400-series list confirms only the FUNCTION and pin count ("dual modulo 4
// counters, shared preload and clear inputs," 16 pins); no datasheet with a
// verifiable PINOUT could be found anywhere (datasheetarchive's only "74419"
// hit is a screwdriver bit; bitsavers/alldatasheet/datasheetq/archive.org turn
// up nothing, and the "MC74419 Motorola" attribution is itself unverified).
// The two 2-bit counters are trivial to model, but the physical pin assignment
// cannot be trusted (C2 / CD4082 lesson), so the entry stays GENERIC_STUB /
// tagged 'stub'. See the header comment on the entry and issues.md ("74x419").
//
// There is no verified pinout to regress, so — unlike a real-chip scenario —
// this guard deliberately does NOT assert pin names. It guards the two things
// that could silently rot: (1) the stub classification (tag + single
// GENERIC_STUB gate), so the part can never quietly start claiming to simulate,
// and (2) that the entry still loads, places, wires, and evaluates without
// throwing and stays inert (drives no terminal to a logic HIGH).
//
// Run:  node js/debug/scenarios/74x419-dual-mod4-counter-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x419');
assert(!!def, '74x419 should be present in CHIP_DB');

if (def) {
  // ── Package / supply (the only facts the entry can assert) ─────────────────
  assert(def.pins === 16, `pins should be 16, got ${def.pins}`);
  assert(def.vcc === 16,  `vcc should be pin 16, got ${def.vcc}`);
  assert(def.gnd === 8,   `gnd should be pin 8, got ${def.gnd}`);

  // ── Stub classification: must stay a stub until a datasheet surfaces ───────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);
}

// ── Inert behavior: places, wires power + a couple of inputs, evaluates ───────
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x419');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x419 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC', 1);
  wire('GND', 0);
  // Drive the documented clock/control lines HIGH — a real counter would count
  // or load; the stub stays inert and leaves every output Hi-Z.
  wire('CLK1', 1); wire('CLK2', 1); wire('PL', 1); wire('CLR', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['Q1A', 'Q1B', 'CO1', 'Q2A', 'Q2B', 'CO2']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x419-dual-mod4-counter-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
