// ── Whole-catalog placement/evaluation safety gate ───────────────────────────
// Places EVERY chip in the catalog, wires VCC/GND, and runs a full evaluate().
// Any throw fails the scenario.
//
// Guards two crash classes found in June 2026:
//   - chip defs whose gate type dispatches to an evaluator method that does
//     not exist (74x8153/74x8154 froze the whole simulator when placed);
//   - chip defs whose pinout array is shorter than the declared pin count
//     (74x448/74x918/74x930/74x952/74x964 crashed computePins on placement).
//
// Run:  node js/debug/scenarios/all-chips-evaluate.mjs   (exits non-zero on failure)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { getAllChipIds } from '../../chips.js';

const ids = getAllChipIds();
const crashed = [];

for (const id of ids) {
  try {
    const world = new BreadboardWorld(2, 1);
    const chip = new ChipComponent(id);
    chip.place(0, 0, 2, 4);
    const wm = new WireManager();
    const vcc = chip.getPinByName('VCC');
    const gnd = chip.getPinByName('GND');
    if (vcc) wm.addWire(holeId(0, 0, 'power', Math.min(vcc.col, 29), 1), vcc.holeId);
    if (gnd) wm.addWire(holeId(0, 0, 'power', Math.min(gnd.col, 29), 0), gnd.holeId);
    new CircuitSimulator().evaluate(world, [chip], wm);
  } catch (e) {
    crashed.push(`${id} → ${e.message}`);
  }
}

console.log(`Evaluated ${ids.length} chips, ${crashed.length} crashed.`);
for (const c of crashed) console.log('  ✗ ' + c);
console.log(crashed.length === 0 ? 'ALL PASS' : 'FAILURES');
process.exit(crashed.length === 0 ? 0 : 1);
