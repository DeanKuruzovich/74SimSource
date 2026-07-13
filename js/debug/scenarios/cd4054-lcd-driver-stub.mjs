// ── CD4054 4-segment LCD driver — documentation-stub guard ───────────────────
// The CD4054 (js/chips/chips167.js) is a 4-segment liquid-crystal display driver:
// four independent STROBE-gated latches, each driving a level-shifted segment
// output, with one common DISPLAY-FREQUENCY (DF) input. Per channel the settled
// output is OUT = (latched IN) XOR DF. On a real LCD, DF carries the ~30 Hz
// backplane square wave and a segment is turned on/off by the PHASE of OUT
// relative to that backplane — an AC voltage across the glass, not a static
// level. 74Sim is a DC functional-logic simulator with idealized clocks
// (issues.md A3) and no loose-LCD-segment widget, so the part ships "info sheet
// only": tagged 'stub' (hidden from the picker) with a GENERIC_STUB gate that
// leaves every segment output Hi-Z.
//
// There is no behavior to regress, so this scenario guards the two things that
// CAN silently rot: (1) the verified CD4054B pinout (the real risk per issues.md
// C2 — never let a sibling's pin map creep in; the CD4055B/CD4056B on the SAME
// datasheet are BCD 7-segment parts with a different pinout), and (2) the stub
// classification (tag + gate type), so the part can never quietly start claiming
// to simulate an LCD driver. Pinout + truth table verified vs TI/Harris CD4054B
// SCHS048C "CD4054B Terminal Assignment" + "Fig. 1 functional diagram" + truth
// table, read from the PDF page images.
//
// Run:  node js/debug/scenarios/cd4054-lcd-driver-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD4054');
assert(!!def, 'CD4054 should be present in CHIP_DB');

if (def) {
  // ── Package / supply ──────────────────────────────────────────────────────
  assert(def.pins === 16, `pins should be 16, got ${def.pins}`);
  assert(def.vcc === 16,  `vcc (VDD) should be pin 16, got ${def.vcc}`);
  assert(def.gnd === 8,   `gnd (VSS) should be pin 8, got ${def.gnd}`);

  // ── Stub classification ───────────────────────────────────────────────────
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);

  // ── Verified CD4054B terminal assignment (SCHS048C, 92CS-24485) ────────────
  const expected = {
    1: 'ST4',  2: 'DFIN', 3: 'OUT4', 4: 'OUT3',
    5: 'OUT2', 6: 'OUT1', 7: 'VEE',  8: 'VSS',
    9: 'IN1', 10: 'ST1', 11: 'IN2', 12: 'ST2',
    13: 'IN3', 14: 'ST3', 15: 'IN4', 16: 'VDD',
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
  const chip = new ChipComponent('CD4054');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4054 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  // Select channel 1 (STROBE 1 = 1, IN 1 = 1) — on real silicon, with DF high,
  // OUT 1 would go low (OUT = IN XOR DF). In 74Sim the stub stays inert.
  wire('ST1', 1); wire('IN1', 1); wire('DFIN', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // GENERIC_STUB leaves the segment outputs Hi-Z; with no external pull the net
  // floats toward 0 V — assert no output is actively driven to a logic-HIGH rail
  // (i.e. the stub really is inert, not secretly driving segments).
  for (const n of ['OUT1', 'OUT2', 'OUT3', 'OUT4']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd4054-lcd-driver-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
