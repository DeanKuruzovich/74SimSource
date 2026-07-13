// ── 74x913 "6-Digit BCD Display Controller" — documentation-stub guard ───────
// The 74x913 (js/chips/chips44.js) is LEFT AS A STUB on purpose. The 74C9xx LED
// display-controller family is real and well documented, but it is 911/912/915/
// 917 — NOT 913. "74C913" appears only as a cross-reference line in the Towers'
// International Digital IC Selector; it is absent from both the 1981 and 1984
// National CMOS Databooks (which print the 911/912/917 and 915 datasheets), and
// no 913-specific datasheet survives anywhere (June 2026 search). The family's
// core function IS modelable (verified against the MM74C912 datasheet, DS005916),
// but with no 913 datasheet its 24-pin terminal assignment cannot be established,
// and the existing hand-entered map (D0..D3 / CLK / LD / RST / DIS / MSB / COL)
// matches no real member of the family. Per C2 (the CD4082 lesson) the entry
// stays GENERIC_STUB / tagged 'stub'. See the header comment on the entry and
// issues.md ("74x913" / C63).
//
// There is no verified pinout to regress, so — unlike a real-chip scenario — this
// guard deliberately does NOT assert any function. It guards the two things that
// could silently rot: (1) the stub classification (tag + single GENERIC_STUB
// gate), so the part can never quietly start claiming to simulate, and (2) that
// the entry still loads, places, wires, and evaluates without throwing and stays
// inert (drives no output terminal to a logic HIGH).
//
// Run:  node js/debug/scenarios/74x913-display-ctrl-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x913');
assert(!!def, '74x913 should be present in CHIP_DB');

if (def) {
  // ── Package / supply (the only facts the entry can assert) ─────────────────
  assert(def.pins === 24, `pins should be 24, got ${def.pins}`);
  assert(def.vcc === 24,  `vcc should be pin 24, got ${def.vcc}`);
  assert(def.gnd === 12,  `gnd should be pin 12, got ${def.gnd}`);

  // ── Stub classification: must stay a stub until a 913 datasheet surfaces ───
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);
}

// ── Inert behavior: places, wires power + the documented control lines, evals ─
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x913');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x913 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC', 1);
  wire('GND', 0);
  // Drive the documented data/control lines HIGH — a real controller would load
  // and scan; the stub stays inert and leaves every output Hi-Z.
  wire('D0', 1); wire('D1', 1); wire('D2', 1); wire('D3', 1);
  wire('CLK', 1); wire('LD', 1); wire('RST', 1); wire('MSB', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['DIS', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'COL']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x913-display-ctrl-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
