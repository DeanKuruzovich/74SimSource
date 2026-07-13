// ── 74x811 quad 2-input XNOR, open collector — regression ────────────────────
// The 74x811 (js/chips/chips40.js) is the open-collector twin of the 74x810:
// four independent 2-input exclusive-NOR gates, Y = NOT(A XOR B), but the
// outputs only SINK. A gate whose inputs match wants Y HIGH, so it releases the
// output (HiZ) and the engine's implicit 4.7kOhm pull-up brings the net to VCC;
// a gate whose inputs differ pulls the output LOW. Net logic level is identical
// to the 810 — the difference is the drive class, which this guard exercises by
// reading the pulled-up HIGH and the actively-sunk LOW.
//
// Modeled with the built-in XNOR primitive (one per gate) plus the entry-level
// openCollector flag; specificChipsSim.js converts each gate's HIGH to a HiZ
// release and each LOW to a GND sink.
//
// Pinout (TI ALS8xx family sequential convention; the Datasheet Archive 74ALS811
// header confirms "QUADRUPLE 2-INPUT EXCLUSIVE NOR ... OPEN COLLECTOR ... PDIP14"
// and the SN74ALS804A SDAS022C page-1 image gives the per-gate order — see the
// entry header comment): A0=1,B0=2,Y0=3,A1=4,B1=5,Y1=6,GND=7,Y2=8,B2=9,A2=10,
// Y3=11,B3=12,A3=13,VCC=14. The four gates use 0-indexed names.
//
// Method: place ONE 74x811 (purely combinational) and drive each gate's A/B to
// the VCC or GND rail, re-solving for every input combination. Outputs read off
// the pins by name. No explicit pull-up is wired — the implicit OC pull-up is
// what lets a released (matching-input) output read HIGH, which is the property
// under test.
//
// Checks:
//   1. Full 2-input XNOR table on all four gates:
//        (0,0)->1  (0,1)->0  (1,0)->0  (1,1)->1.
//      A wrong OC polarity (e.g. output stuck LOW when inputs match, or floating
//      instead of pulled up) fails the ->1 rows.
//   2. Cross-wiring guard: drive the four gates with DISTINCT input patterns in
//      one solve so a mis-routed output (e.g. Y2 reading gate 3's inputs) fails.
//
// Run:  node js/debug/scenarios/74x811-quad-xnor-oc.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V; OC HIGH is the pull-up)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x811');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const GATES = [0, 1, 2, 3];
const xnor = (a, b) => (a ^ b) ? 0 : 1;

// Drive each gate's A/B inputs from a per-gate {a,b} table, then re-solve.
function applyPerGate(pattern) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x811 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const g of GATES) {
    wirePin(`A${g}`, pattern[g].a);
    wirePin(`B${g}`, pattern[g].b);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Full 2-input XNOR table, same inputs on all four gates ─────────────────
const TABLE = [
  { a: 0, b: 0 },
  { a: 0, b: 1 },
  { a: 1, b: 0 },
  { a: 1, b: 1 },
];

for (const { a, b } of TABLE) {
  applyPerGate(GATES.map(() => ({ a, b })));
  for (const g of GATES) {
    const got = isHigh(read(`Y${g}`)) ? 1 : 0;
    assert(got === xnor(a, b),
      `gate ${g}: A=${a} B=${b} expected Y=${xnor(a, b)}, got ${got}`);
  }
}

// ── 2. Cross-wiring guard: distinct pattern per gate, all four expected to differ
// gate0 (0,0)->1, gate1 (0,1)->0, gate2 (1,0)->0, gate3 (1,1)->1.
const DISTINCT = [
  { a: 0, b: 0 },
  { a: 0, b: 1 },
  { a: 1, b: 0 },
  { a: 1, b: 1 },
];
applyPerGate(DISTINCT);
for (const g of GATES) {
  const exp = xnor(DISTINCT[g].a, DISTINCT[g].b);
  const got = isHigh(read(`Y${g}`)) ? 1 : 0;
  assert(got === exp,
    `distinct gate ${g}: A=${DISTINCT[g].a} B=${DISTINCT[g].b} expected Y=${exp}, got ${got}`);
}

console.log(`74x811-quad-xnor-oc: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
