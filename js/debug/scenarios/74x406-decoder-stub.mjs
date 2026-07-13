// ── 74x406 "3-to-8 decoder" — documentation-stub guard ──────────────────────
// The 74x406 (js/chips/chips66.js) is an UNDOCUMENTED part. A 3-to-8 decode is
// trivial to model, but no datasheet exists for 74406 / MC74406 / 74F406 /
// 74HC406 from any manufacturer (searched the open web + alldatasheet /
// datasheetarchive / bitsavers Motorola databooks — "74406" only collides with
// the unrelated NXP 744060 ripple counter and Würth inductors). The sole source
// is the Wikipedia 7400-series list: one line, no pinout, no output/enable
// polarity. With nothing to verify against — and no way to tell active-HIGH
// (74238-style) outputs from active-LOW (74138-style), or the enable polarity —
// implementing it would mean fabricating both the pinout and the behavior, which
// the project forbids (issues.md C2/C28). So it stays "info sheet only": tagged
// 'stub' (hidden from the picker) with a GENERIC_STUB gate that leaves every
// output Hi-Z.
//
// There is no verified behavior to regress. This scenario guards the two things
// that can silently rot: (1) the stub classification (tag + gate type), so the
// part can never quietly start *claiming* to simulate without a datasheet, and
// (2) inert outputs (nothing driven HIGH). The pin assignments below are the
// existing hand-entered UNVERIFIED placeholder; the guard pins them only so a
// pinout/polarity change can't sneak in without re-verifying against a real
// datasheet — it does NOT assert they are correct.
//
// Run:  node js/debug/scenarios/74x406-decoder-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x406');
assert(!!def, '74x406 should be present in CHIP_DB');

if (def) {
  // ── Package / supply ────────────────────────────────────────────────────
  assert(def.pins === 14, `pins should be 14, got ${def.pins}`);
  assert(def.vcc === 14,  `vcc should be pin 14, got ${def.vcc}`);
  assert(def.gnd === 7,   `gnd should be pin 7, got ${def.gnd}`);

  // ── Stub classification (the part of the guard that actually matters) ─────
  assert(def.tags.includes('stub'),
    `should stay tagged 'stub' (hidden from picker) until a datasheet is found, tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);

  // ── Existing UNVERIFIED placeholder pinout (locked, not asserted correct) ──
  const placeholder = {
    1: 'A0', 2: 'A1', 3: 'A2', 4: 'EN', 5: 'Y0', 6: 'Y1', 7: 'GND',
    8: 'Y2', 9: 'Y3', 10: 'Y4', 11: 'Y5', 12: 'Y6', 13: 'Y7', 14: 'VCC',
  };
  const byPin = Object.fromEntries(def.pinout.map(p => [p.pin, p.name]));
  for (const [pin, name] of Object.entries(placeholder)) {
    assert(byPin[pin] === name,
      `pin ${pin} placeholder name changed to ${byPin[pin]} (was ${name}) — if you re-pinned this, you must have a verified datasheet and should drop the stub`);
  }
}

// ── Inert behavior: places, wires by name, evaluates without error ───────────
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x406');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x406 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC', 1);
  wire('GND', 0);
  // Drive the address to select what *would* be Y0 and assert the enable: a real
  // decoder would move an output. The stub leaves all outputs Hi-Z — the point.
  wire('A0', 0); wire('A1', 0); wire('A2', 0); wire('EN', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x406-decoder-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
