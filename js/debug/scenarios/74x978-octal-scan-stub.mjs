// ── 74x978 "Octal FF with Serial Scanner" — documentation-stub guard ─────────
// The 74x978 (js/chips/chips46.js) is LEFT AS A STUB on purpose: no datasheet
// exists for a "74978" octal flip-flop with serial scanner from any manufacturer
// under any prefix (74/74LS/74ALS/74AS/74S/74F/74HC). TI's datasheet symlink URLs
// all 404; the part is absent from Wikipedia's authoritative 7400-series list and
// from the amigawiki 74xx functional index. The hand-entered pinout is therefore
// unverifiable, and it is also functionally incomplete for a serial scan read-out
// (SEN + SO are exposed but no scan clock / scan-in), so the scan sequence cannot
// be modeled without fabricating both the pinout and the function table. Per the
// CD4082 lesson (issues.md C2) the entry stays GENERIC_STUB / tagged 'stub'. See
// the header comment on the entry and issues.md C84.
//
// There is no verified pinout to regress (the part is unattested), so — unlike a
// real-chip scenario — this guard deliberately does NOT assert scan behavior. It
// guards the two things that could silently rot: (1) the stub classification
// (tag + single GENERIC_STUB gate), so the part can never quietly start claiming
// to simulate, and (2) that the entry still loads, places, wires, and evaluates
// without throwing and stays inert (drives no output terminal to a logic HIGH).
//
// Run:  node js/debug/scenarios/74x978-octal-scan-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x978');
assert(!!def, '74x978 should be present in CHIP_DB');

if (def) {
  // ── Package / supply (the only facts the entry asserts) ───────────────────
  assert(def.pins === 24, `pins should be 24, got ${def.pins}`);
  assert(def.vcc === 24,  `vcc should be pin 24, got ${def.vcc}`);
  assert(def.gnd === 12,  `gnd should be pin 12, got ${def.gnd}`);

  // ── Stub classification: must stay a stub until a datasheet surfaces ───────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);
}

// ── Inert behavior: places, wires power + data/clock, evaluates ───────────────
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x978');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x978 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC', 1);
  wire('GND', 0);
  // Drive the documented data/clock/scan lines HIGH — a real part would register
  // and scan; the stub stays inert and leaves the Q lines + SO Hi-Z.
  wire('CLK', 1); wire('D0', 1); wire('SEN', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'SO']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x978-octal-scan-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
