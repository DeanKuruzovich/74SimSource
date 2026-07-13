// ── CD4517 dual 64-stage static shift register — documentation-stub guard ────
// The CD4517B (js/chips/chips157.js) is two independent 64-stage shift registers.
// Its defining feature is that the taps after stages 16/32/48/64 are
// BIDIRECTIONAL three-state pins: outputs when WRITE ENABLE is LOW, but inputs
// that block-load the hidden internal stages 17/33/49 when WRITE ENABLE is HIGH
// on the rising clock edge. 74Sim models a pin as input OR output, fixed — none
// of the shift-register primitives reproduce a tap that flips direction at run
// time or the mid-chain block load, so the part ships "info sheet only": tagged
// 'stub' (hidden from the picker) with a SHIFT_REG_16BIT_STUB gate that drives
// every tap output Hi-Z. (Same family/treatment as 74673/674/675/676 — issues.md
// B2.)
//
// There is no behavior to regress, so this scenario guards the two things that
// CAN silently rot: (1) the verified CD4517B pinout (the real risk per issues.md
// C2 — never let a sibling's pin map creep in), and (2) the stub classification
// (tag + gate type), so the part can never quietly start claiming to simulate
// the bidirectional register. Pinout verified vs TI/Harris CD4517B SCHS075
// terminal assignment + block diagram, read from the PDF page images.
//
// Run:  node js/debug/scenarios/cd4517-dual-shift-stub.mjs   (non-zero on fail)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('CD4517');
assert(!!def, 'CD4517 should be present in CHIP_DB');

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

  // ── Verified CD4517B terminal assignment (SCHS075, top view) ───────────────
  const expected = {
    1: 'Q16A',  2: 'Q48A',  3: 'WEA',   4: 'CLA',
    5: 'Q64A',  6: 'Q32A',  7: 'DA',    8: 'VSS',
    9: 'DB',   10: 'Q32B', 11: 'Q64B', 12: 'CLB',
    13: 'WEB', 14: 'Q48B', 15: 'Q16B', 16: 'VDD',
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
  const chip = new ChipComponent('CD4517');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4517 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VDD', 1);
  wire('VSS', 0);
  wire('CLA', 1); wire('DA', 1); wire('WEA', 0);
  wire('CLB', 1); wire('DB', 1); wire('WEB', 0);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  // SHIFT_REG_16BIT_STUB leaves every tap Hi-Z; with no external pull the net
  // floats toward 0 V — assert no tap is actively pulled to a logic-HIGH rail.
  for (const n of ['Q16A', 'Q32A', 'Q48A', 'Q64A', 'Q16B', 'Q32B', 'Q48B', 'Q64B']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`cd4517-dual-shift-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
