// ── 74x9164 "8-bit Shift Reg (S/P I/O)" — documentation-stub guard ───────────
// The 74x9164 (js/chips/chips65.js) is LEFT AS A STUB on purpose. No datasheet
// with a verifiable PINOUT could be found for any "9164" shift register: it is
// not in Wikipedia's 7400-series list, not in the West Florida 7400 guide, and
// turns up in no datasheet search across the 74F/54F/74S/74HC/74AC/F prefixes or
// the Fairchild/National/Signetics-Philips/IDT FAST/FCT lines (its sibling
// 74x9323 DID resolve, to NXP 74HC9323A; 9164 has no equivalent). The hand-
// entered map is additionally impossible — a 16-pin package cannot carry
// separate 8-bit parallel-in AND parallel-out ports, and the map only lists
// 5 of the 8 bits. An 8-bit universal shift register is trivial to model, but
// the physical pin assignment cannot be trusted (C2 / CD4082 lesson), so the
// entry stays GENERIC_STUB / tagged 'stub'. See the header comment on the entry
// and issues.md ("74x9164").
//
// There is no verified pinout to regress, so — unlike a real-chip scenario —
// this guard deliberately does NOT assert pin names. It guards the two things
// that could silently rot: (1) the stub classification (tag + single
// GENERIC_STUB gate), so the part can never quietly start claiming to simulate,
// and (2) that the entry still loads, places, wires, and evaluates without
// throwing and stays inert (drives no terminal to a logic HIGH).
//
// Run:  node js/debug/scenarios/74x9164-shift-reg-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x9164');
assert(!!def, '74x9164 should be present in CHIP_DB');

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
  const chip = new ChipComponent('74x9164');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x9164 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC', 1);
  wire('GND', 0);
  // Drive the documented clock/control lines HIGH — a real shift register would
  // clock/load; the stub stays inert and leaves every output Hi-Z.
  wire('CLK', 1); wire('MODE', 1); wire('SER', 1); wire('OEn', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'QSER']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x9164-shift-reg-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
