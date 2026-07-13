// ── 74x701 "Register, Counter, Comparator" — documentation-stub guard ────────
// The 74x701 (js/chips/chips37.js) is LEFT AS A STUB on purpose. The National
// 54F/74F701 is a real part, but the only surviving datasheet is the 2-page
// preliminary "ADVANCED INFORMATION" release in the 1988 National FAST Databook
// (printed pp. 4-558..4-559, drawing refs TL/F/9589). That release documents the
// pinout, the functional block diagram, and the SET of operations (load register
// or counter from the bus, up/down count, register<->counter transfer, compare)
// but gives NO operation truth table for the S0-S2 mode-select inputs. The
// control-mode decode — including the count direction, which has no dedicated
// pin — was never published, so the operation cannot be simulated without
// fabricating it. See the header comment on the entry and issues.md ("74x701").
//
// What WAS fixed (and is verified against the connection diagram, read as 600-dpi
// PDF page images): the pinout. The original hand-entered stub was fabricated —
// it invented separate D0-D7 inputs + Q0-Q7 outputs and CLK/CLR/OEn/EQout pins.
// The real device shares ONE bidirectional bus D0-D7, has two VCC pins (18,19)
// and two GND pins (6,7), control inputs CET/CLRC/CLRR/CLOCK/SEL/OE/S0-S2/LE, and
// outputs Oa=b (pin 13) + TC (pin 24). This guard pins that verified pinout so it
// can't silently rot back, AND guards the stub classification so the part can
// never quietly start claiming to simulate.
//
// Run:  node js/debug/scenarios/74x701-reg-counter-compare-stub.mjs  (exits non-zero on failure)

import { getChipDef } from '../../chips.js';
import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const def = getChipDef('74x701');
assert(!!def, '74x701 should be present in CHIP_DB');

if (def) {
  // ── Package / supply ──────────────────────────────────────────────────────
  assert(def.pins === 24, `pins should be 24, got ${def.pins}`);
  assert(def.vcc === 18,  `vcc should be pin 18, got ${def.vcc}`);
  assert(def.gnd === 6,   `gnd should be pin 6, got ${def.gnd}`);

  // ── Verified pinout (National 54F/74F701 connection diagram) ──────────────
  const expected = {
    1: 'CET', 2: 'CLRC', 3: 'CLRR', 4: 'CLOCK', 5: 'SEL', 6: 'GND',
    7: 'GND', 8: 'OE', 9: 'S2', 10: 'S1', 11: 'S0', 12: 'LE',
    13: 'Oa=b', 14: 'D7', 15: 'D6', 16: 'D5', 17: 'D4', 18: 'VCC',
    19: 'VCC', 20: 'D3', 21: 'D2', 22: 'D1', 23: 'D0', 24: 'TC',
  };
  for (const [pin, name] of Object.entries(expected)) {
    const e = def.pinout.find(p => p.pin === Number(pin));
    assert(e && e.name === name, `pin ${pin} should be ${name}, got ${e ? e.name : 'missing'}`);
  }
  // The bus pins must be bidirectional (one shared load/read-back bus, not Q outputs).
  for (const n of ['D0','D1','D2','D3','D4','D5','D6','D7']) {
    const e = def.pinout.find(p => p.name === n);
    assert(e && e.type === 'bidir', `${n} should be type 'bidir', got ${e ? e.type : 'missing'}`);
  }

  // ── Stub classification: must stay a stub until a full datasheet surfaces ──
  assert(def.tags.includes('stub'),
    `should be tagged 'stub' (hidden from picker), tags=${JSON.stringify(def.tags)}`);
  assert(def.gates.length === 1 && def.gates[0].type === 'GENERIC_STUB',
    `should have a single GENERIC_STUB gate, got ${def.gates.map(g => g.type).join(',')}`);
}

// ── Inert behavior: places, wires power + a few control lines, evaluates ──────
try {
  const world = new BreadboardWorld(2, 1);
  const chip = new ChipComponent('74x701');
  chip.place(0, 0, 2, 4);
  const wm = new WireManager();
  const wire = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x701 missing pin ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wire('VCC', 1);
  wire('GND', 0);
  // Drive clock + a couple of control/bus lines HIGH. A real part would act on a
  // selected operation; the stub stays inert and leaves Oa=b / TC undriven.
  wire('CLOCK', 1); wire('S0', 1); wire('D0', 1);
  const sim = new CircuitSimulator();
  sim.evaluate(world, [chip], wm);
  for (const n of ['Oa=b', 'TC']) {
    const v = sim.getVoltageAtHole(chip.getPinByName(n).holeId);
    assert(v <= 2.5, `${n} should not be driven HIGH (stub is inert), got ${v.toFixed(2)} V`);
  }
} catch (e) {
  failures.push(`place/evaluate threw: ${e.message}`);
}

console.log(`74x701-reg-counter-compare-stub: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
