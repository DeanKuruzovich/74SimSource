// ── CD4514 4-to-16 line decoder (latched, active-HIGH) — regression ──────────
// The CD4514 (Batch 10, js/chips/chips97.js) maps onto the DEC_4TO16_LATCH_HI
// engine primitive, but with the new strobeActiveHigh:true flag — the original
// CMOS CD4514B STROBE is HIGH=transparent / LOW=latched, the OPPOSITE sense of
// the primitive's default active-LOW LE (which the 74HC 74x4514 entry uses).
//
// This guard pins down both the verified CD4514B pinout (functional diagram in
// TI SCHS074A — NOT the 74HC4514 map; see issues.md C7) and the three behaviors:
//   • active-HIGH one-hot decode of the 4-bit address A(LSB)..D(MSB) → S0..S15
//   • STROBE latch: HIGH transparent, address frozen on the HIGH→LOW edge
//   • INHIBIT HIGH forces every output LOW regardless of address / strobe
//
// Method: place ONE CD4514 and keep the same chip + sim instance across the run
// so the latch state (comp.state) persists. Inputs are re-wired HIGH/LOW each
// solve; the sixteen S-outputs are read straight off the pins by name.
//
// Run:  node js/debug/scenarios/cd4514-decoder-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4514');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with each named pin held at a rail (1 = VCC row, 0 = GND row). A
// fresh WireManager each call is fine — the latch state lives on the persistent
// chip component, not the wires. addr is the 4-bit value on A(LSB)..D(MSB).
function apply({ addr, strobe, inhibit }) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4514 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('A', (addr >> 0) & 1);
  wirePin('B', (addr >> 1) & 1);
  wirePin('C', (addr >> 2) & 1);
  wirePin('D', (addr >> 3) & 1);
  wirePin('STROBE', strobe ? 1 : 0);
  wirePin('INHIBIT', inhibit ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const OUTS = Array.from({ length: 16 }, (_, i) => 'S' + i);
const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const highOuts = () => OUTS.filter(o => isHigh(read(o)));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Transparent (STROBE HIGH): every address selects exactly its output ───
for (let n = 0; n < 16; n++) {
  apply({ addr: n, strobe: 1, inhibit: 0 });
  const hot = highOuts();
  assert(hot.length === 1 && hot[0] === 'S' + n,
    `addr ${n}: expected only S${n} HIGH, got [${hot.join(',')}]`);
}

// ── 2. STROBE latch: freeze address on HIGH→LOW, ignore later address change ─
apply({ addr: 5, strobe: 1, inhibit: 0 });          // transparent → S5
assert(highOuts().join() === 'S5', 'latch setup: S5 should be selected');
apply({ addr: 5, strobe: 0, inhibit: 0 });          // STROBE 1→0 latches addr 5
apply({ addr: 10, strobe: 0, inhibit: 0 });         // change address while held
assert(highOuts().join() === 'S5',
  `latched: address change to 10 must be ignored, expected S5, got [${highOuts().join(',')}]`);
apply({ addr: 10, strobe: 1, inhibit: 0 });         // STROBE HIGH → transparent again
assert(highOuts().join() === 'S10',
  `released: STROBE HIGH should pick up addr 10 → S10, got [${highOuts().join(',')}]`);

// ── 3. INHIBIT HIGH: all outputs LOW regardless of address / strobe ──────────
// 3a. Transparent (STROBE HIGH) but INHIBIT HIGH → outputs blanked anyway.
apply({ addr: 7, strobe: 1, inhibit: 1 });
assert(highOuts().length === 0,
  `inhibit (transparent): all outputs must be LOW, got [${highOuts().join(',')}]`);
// 3b. Latch a known address (9), freeze it, then blank with INHIBIT while held.
apply({ addr: 9, strobe: 1, inhibit: 0 });          // transparent → S9, latch tracks 9
assert(highOuts().join() === 'S9', 'pre-inhibit: S9 should be selected');
apply({ addr: 9, strobe: 0, inhibit: 0 });          // STROBE 1→0 freezes addr 9
apply({ addr: 2, strobe: 0, inhibit: 1 });          // blank while latched (addr input ignored)
assert(highOuts().length === 0,
  `inhibit (latched): all outputs must be LOW, got [${highOuts().join(',')}]`);
// 3c. Releasing INHIBIT restores the decode of the still-latched address (9).
apply({ addr: 2, strobe: 0, inhibit: 0 });
assert(highOuts().join() === 'S9',
  `inhibit release: latched addr 9 should reappear, got [${highOuts().join(',')}]`);

console.log(`cd4514-decoder-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
