// ── 74x8153 serial-to-parallel interface — documentation-stub guard ──────────
// The 74x8153 (js/chips/chips63.js) is LEFT AS A STUB on purpose. The real part
// is TI's SN74LV8153 (SCLS555): a UART-format serial-to-parallel converter whose
// defining feature is AUTOMATIC DATA-RATE (baud) DETECTION with NO clock pin — it
// recovers its bit clock by measuring the analog time between the two start bits
// of each frame. This settle-to-steady digital engine has no real-time axis and
// no clock pin to sample on, so the self-timed reception cannot be driven
// faithfully; an output-stage-only model would leave Y0-Y7 stuck at the reset
// value and misrepresent the part. So the entry stays GENERIC_STUB / tagged
// 'stub'. See the header comment on the entry and issues.md ("74x8153").
//
// What this guard locks in:
//   1. the CORRECTED pinout (the old hand-entered stub invented CLK/CSn/OEn/DIN/
//      Qn7/NC pins and a single VCC/GND — all wrong; the real device has A0-A2
//      address pins, D serial in, OUTSEL/RESET/OE, SOUT, dual VCC1/VCC2 and dual
//      GND). Verified vs SCLS555 Terminal Assignment + Pin Description.
//   2. the stub classification (tag + single GENERIC_STUB gate), so the part can
//      never quietly start claiming to simulate.
//   3. that the entry loads, places, wires and evaluates without throwing and
//      stays inert (drives no Y output to a logic HIGH) — this also guards against
//      the old unregistered-gate-type bug that froze the sim when placed.
//
// Run:  node js/debug/scenarios/74x8153-ser-par-stub.mjs  (exits non-zero on fail)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x8153');
assert(!!def, '74x8153 should be present in CHIP_DB');

if (def) {
  // ── Package / supply ──────────────────────────────────────────────────────
  assert(def.pins === 20, `pins should be 20, got ${def.pins}`);
  assert(def.vcc === 20,  `vcc should be pin 20 (VCC2), got ${def.vcc}`);
  assert(def.gnd === 10,  `gnd should be pin 10, got ${def.gnd}`);

  // ── Corrected pinout (vs SCLS555) ─────────────────────────────────────────
  const expect = {
    1: 'VCC1', 2: 'A0', 3: 'A1', 4: 'A2', 5: 'D', 6: 'OUTSEL', 7: 'RESET',
    8: 'OE', 9: 'SOUT', 10: 'GND', 11: 'GND2', 12: 'Y7', 13: 'Y6', 14: 'Y5',
    15: 'Y4', 16: 'Y3', 17: 'Y2', 18: 'Y1', 19: 'Y0', 20: 'VCC2',
  };
  for (const p of def.pinout) {
    assert(expect[p.pin] === p.name,
      `pin ${p.pin} should be ${expect[p.pin]}, got ${p.name}`);
  }
  // The wrong old names must be gone.
  const names = def.pinout.map(p => p.name);
  for (const bad of ['CLK', 'CSn', 'OEn', 'DIN', 'Qn7', 'NC1']) {
    assert(!names.includes(bad), `old wrong pin name ${bad} should be gone`);
  }
  // Two ground pins, two supply pins.
  assert(def.pinout.filter(p => p.type === 'power').length === 4,
    'should have 4 power pins (VCC1, VCC2, GND, GND2)');

  // ── Stub classification: must stay a stub until reception is modelable ─────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);
}

// ── Inert behavior: places, wires power + a few inputs, evaluates ─────────────
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x8153');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x8153 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC2', 1);
  wire('GND', 0);
  // Drive the documented data/control lines — a real device would receive and
  // latch; the stub stays inert and leaves Y0-Y7 / SOUT undriven (Hi-Z).
  wire('D', 1); wire('OUTSEL', 1); wire('RESET', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'SOUT']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x8153-ser-par-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
