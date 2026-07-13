// ── 74F732 quad data multiplexer, inverting, 3-state — regression ───────────
// The 74x732 (js/chips/chips38.js) is primitive-backed by MUX_3BUS_TRI
// (gate.invert:true). It is a BIDIRECTIONAL part: three 4-bit bus ports A, B, C
// each act as input or output. S0/S1/DIR pick a data-flow source→dest from the
// Signetics FUNCTION TABLE, and each port's active-LOW output enable
// (OEAn/OEBn/OECn) gates its drive. A driven destination carries the COMPLEMENT
// of the source (inverting 74F732); an enabled port with no selected source is
// forced HIGH (74F732) / LOW (74F733).
//
//   S0 S1 DIR | flow              S0 S1 DIR | flow
//    0  0  0  | A → C              1  0  0  | A → B
//    0  0  1  | C → A              1  0  1  | B → A
//    0  1  0  | B → C              1  1  x  | A → B and C
//    0  1  1  | C → B
//
// Pinout verified vs Signetics 1989 FAST Data Manual pp. 6-687..6-689 (see the
// chip's header comment). This guards the pin map, the routing table, the
// inversion, the per-port 3-state enables, and the forced-level fallback.
//
// Run:  node js/debug/scenarios/74x732-3bus-mux.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const comp4 = (w) => (~w) & 0xF;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x732');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive only the named control pins and the externally-sourced bus(es). Buses
// the chip is meant to drive (or release) are left unwired to avoid contention.
function apply({ dir, s0, s1, oeA, oeB, oeC, drive = {} }) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x732 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('DIR', dir);
  wirePin('S0', s0);
  wirePin('S1', s1);
  wirePin('OEAn', oeA);
  wirePin('OEBn', oeB);
  wirePin('OECn', oeC);
  for (const [bus, word] of Object.entries(drive)) {
    if (word == null) continue;
    for (let i = 0; i < 4; i++) wirePin(`${bus}${i}`, (word >> i) & 1);
  }
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const wordOf = (bus) => {
  let w = 0;
  for (let i = 0; i < 4; i++) if (isHigh(read(`${bus}${i}`))) w |= (1 << i);
  return w;
};
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const busHiZ = (bus) => {
  for (let i = 0; i < 4; i++) if (driveOf(`${bus}${i}`) !== DRIVE.HIGH_Z) return false;
  return true;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const b4 = (w) => w.toString(2).padStart(4, '0');

// ── 1. Every point-to-point route, inverting. Source driven externally; the
// destination must carry its complement; the third bus is released (Hi-Z). ────
const routes = [
  { name: 'A→C', s0: 0, s1: 0, dir: 0, src: 'A', dst: 'C', off: 'B', oeA: 1, oeB: 1, oeC: 0 },
  { name: 'C→A', s0: 0, s1: 0, dir: 1, src: 'C', dst: 'A', off: 'B', oeA: 0, oeB: 1, oeC: 1 },
  { name: 'B→C', s0: 0, s1: 1, dir: 0, src: 'B', dst: 'C', off: 'A', oeA: 1, oeB: 1, oeC: 0 },
  { name: 'C→B', s0: 0, s1: 1, dir: 1, src: 'C', dst: 'B', off: 'A', oeA: 1, oeB: 0, oeC: 1 },
  { name: 'A→B', s0: 1, s1: 0, dir: 0, src: 'A', dst: 'B', off: 'C', oeA: 1, oeB: 0, oeC: 1 },
  { name: 'B→A', s0: 1, s1: 0, dir: 1, src: 'B', dst: 'A', off: 'C', oeA: 0, oeB: 1, oeC: 1 },
];
for (const r of routes) {
  for (const word of [0b1010, 0b0101, 0b1111, 0b0000, 0b1100]) {
    apply({ dir: r.dir, s0: r.s0, s1: r.s1, oeA: r.oeA, oeB: r.oeB, oeC: r.oeC, drive: { [r.src]: word } });
    const got = wordOf(r.dst);
    assert(got === comp4(word),
      `${r.name} src=${b4(word)}: dst ${r.dst} expected ~src=${b4(comp4(word))}, got ${b4(got)}`);
    assert(!busHiZ(r.dst), `${r.name} ${r.dst}: destination must be driven, not Hi-Z`);
    assert(busHiZ(r.off), `${r.name} ${r.off}: uninvolved bus must be released (Hi-Z)`);
  }
}

// ── 2. Broadcast: S0=S1=H sends A to BOTH B and C (inverted), DIR don't-care. ─
for (const dir of [0, 1]) {
  apply({ dir, s0: 1, s1: 1, oeA: 1, oeB: 0, oeC: 0, drive: { A: 0b1001 } });
  assert(wordOf('B') === comp4(0b1001), `broadcast DIR=${dir}: B expected ${b4(comp4(0b1001))}, got ${b4(wordOf('B'))}`);
  assert(wordOf('C') === comp4(0b1001), `broadcast DIR=${dir}: C expected ${b4(comp4(0b1001))}, got ${b4(wordOf('C'))}`);
}

// ── 3. Broadcast with one destination released → only the enabled one drives. ─
apply({ dir: 0, s0: 1, s1: 1, oeA: 1, oeB: 1, oeC: 0, drive: { A: 0b0110 } }); // OEBn=H → B Hi-Z
assert(busHiZ('B'), 'broadcast OEBn=H: B must be Hi-Z');
assert(wordOf('C') === comp4(0b0110), `broadcast OEBn=H: C expected ${b4(comp4(0b0110))}, got ${b4(wordOf('C'))}`);

// ── 4. Output-enable HIGH releases the destination even with a valid route. ───
apply({ dir: 0, s0: 0, s1: 0, oeA: 1, oeB: 1, oeC: 1, drive: { A: 0b1111 } }); // A→C route but OECn=H
assert(busHiZ('C'), 'OECn=H on A→C route: C must be Hi-Z');

// ── 5. Forced level: enabling a bus with no selected source drives all-HIGH
// (inverting 74F732). In A→C mode, bus B has no source; OEBn=L forces it HIGH. ─
apply({ dir: 0, s0: 0, s1: 0, oeA: 1, oeB: 0, oeC: 0, drive: { A: 0b0011 } });
assert(wordOf('B') === 0b1111, `forced level: B expected 1111, got ${b4(wordOf('B'))}`);
assert(!busHiZ('B'), 'forced level: B must be driven, not Hi-Z');
assert(wordOf('C') === comp4(0b0011), `forced level: C (real dest) expected ${b4(comp4(0b0011))}, got ${b4(wordOf('C'))}`);

if (failures.length) {
  console.error(`74x732 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x732 3-bus-mux: all checks passed');
