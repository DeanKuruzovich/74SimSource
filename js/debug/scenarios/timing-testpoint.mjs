// ── Test Point component: invisible probe, auto-watched timing lane ──────────
// Guards the TestPointComponent (js/components.js):
//   • serialize → deserialize round-trip (label, color, position)
//   • electrical invisibility: adding a TP to a resistor-divider net must not
//     move the solved voltage at all (no drive, no pull-up, no load)
//   • timing mode auto-watches every placed TP as a lane named by its label
//   • the lane records transitions like any probe
//
// Run:  node js/debug/scenarios/timing-testpoint.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import {
  ChipComponent, ClockComponent, ResistorComponent, TestPointComponent,
  deserializeComponent,
} from '../../components.js';
import { CircuitHarness } from '../harness.mjs';
import { CHIP_TPD_NS } from '../../timing.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── Round-trip ────────────────────────────────────────────────────────────────
{
  const tp = new TestPointComponent();
  tp.label = 'TP3';
  tp.color = '#3498db';
  tp.place(0, 0, 12, 6);
  const data = tp.serialize();
  assert(data.type === 'testpoint' && data.label === 'TP3' && data.color === '#3498db',
    `serialize should carry type/label/color, got ${JSON.stringify(data)}`);
  const back = deserializeComponent(data);
  assert(back && back.type === tp.type && back.label === 'TP3' && back.color === '#3498db' &&
    back.placed && back.pins[0].holeId === tp.pins[0].holeId,
    'deserialize must reconstruct an identical placed test point');
}

// ── Electrical invisibility ──────────────────────────────────────────────────
// 1kΩ/1kΩ divider VCC→node→GND solves to ≈2.5V; adding a TP on the node must
// not move the solved voltage at all (bit-identical solve).
{
  const mk = (withTp) => {
    const h = new CircuitHarness();
    const nodeHole = holeId(0, 0, 'main', 20, 2);
    const r1 = new ResistorComponent(1000);
    r1.placeWireLike(holeId(0, 0, 'power', 10, 1), nodeHole);
    h.components.push(r1);
    const r2 = new ResistorComponent(1000);
    r2.placeWireLike(holeId(0, 0, 'main', 20, 3), holeId(0, 0, 'power', 10, 0));
    h.components.push(r2);
    // r1 bottom and r2 top share column 20 rows 0-4 (same breadboard net)
    if (withTp) {
      const tp = new TestPointComponent('TPX');
      tp.place(0, 0, 20, 1); // same column/half → same net
      h.components.push(tp);
    }
    h.evaluate();
    return h.netVoltage(nodeHole);
  };
  const vBare = mk(false);
  const vWithTp = mk(true);
  assert(vBare !== undefined && Math.abs(vBare - 2.5) < 0.01,
    `divider should read ≈2.5V, got ${vBare}`);
  assert(vWithTp === vBare,
    `test point must not load the net: ${vBare} → ${vWithTp}`);
}

// ── Auto-watch + recording in timing mode ────────────────────────────────────
{
  const h = new CircuitHarness();
  const inv = new ChipComponent('74x04');
  inv.place(0, 0, 10, 4);
  h.components.push(inv);
  const clk = new ClockComponent(1e6, 0.5);
  clk.place(0, 0, 30, 2);
  h.components.push(clk);

  const tp = new TestPointComponent('MYPROBE');
  tp.place(0, 0, 40, 7);
  h.components.push(tp);

  const wm = h.wireManager;
  wm.addWire(holeId(0, 0, 'power', 5, 1), inv.getPinByName('VCC').holeId);
  wm.addWire(holeId(0, 0, 'power', 5, 0), inv.getPinByName('GND').holeId);
  wm.addWire(clk.pins[0].holeId, inv.getPinByName('1A').holeId);
  wm.addWire(inv.getPinByName('1Y').holeId, tp.pins[0].holeId);

  // enableTiming() performs the entry settle itself (clocks held LOW) —
  // a live evaluate() first would sample the wall clock nondeterministically.
  h.enableTiming();

  const lane = h.timing.lanes.get(tp.pins[0].holeId);
  assert(!!lane, 'placed test point must be auto-watched as a lane');
  assert(lane && lane.label === 'MYPROBE', `lane label should be MYPROBE, got ${lane && lane.label}`);

  h.advanceNs(1100); // one clock rise (500ns) + one fall (1000ns)
  const tr = h.transitions('MYPROBE');
  // Inverter output: starts 1 (clock low), falls/rises one tPD after edges.
  const INV = CHIP_TPD_NS['74x04'] * 1000;
  assert(tr.length === 3 &&
    tr[0].level === 1 &&
    tr[1].tPs === 500_000 + INV && tr[1].level === 0 &&
    tr[2].tPs === 1_000_000 + INV && tr[2].level === 1,
    `MYPROBE should record [1, (512000,0), (1012000,1)], got ${JSON.stringify(tr.map(t => [t.tPs, t.level]))}`);
}

console.log(`timing-testpoint: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
