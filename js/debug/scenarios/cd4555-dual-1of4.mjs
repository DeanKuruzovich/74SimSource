// ── CD4555 dual 1-of-4 decoder / demultiplexer — regression ──────────────────
// The CD4555 (js/chips/chips137.js) is the first ACTIVE-HIGH user of the shared
// DEMUX_2TO4 primitive (74139/74155/74156 are active-LOW). It guards the DB entry
// and the new gate.activeHigh flag added to _evaluateDemux2to4.
//
// Verified facts (TI SCHS087D CD4555B TRUTH TABLE, page 3; pinout page 1):
//   • Two independent sections, each: A (LSB), B (MSB), Ē (active-LOW enable),
//     outputs Q0..Q3.
//   • Ē LOW  → selected output (sel = A + 2·B) HIGH, other three LOW.
//   • Ē HIGH → all four outputs LOW regardless of A/B.
//   • Sections are fully independent (no shared address pins).
//
// Method: place ONE CD4555 (purely combinational — no sequential state) and wire
// each input to the VCC or GND rail, re-solving combinationally for each case.
//
// Run:  node js/debug/scenarios/cd4555-dual-1of4.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD4555');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive both sections; e1/e2 are the active-LOW enables, a/b the 2-bit addresses.
function apply({ e1, a1, b1, e2, a2, b2 }) {
  const wm = new WireManager();
  const wireBit = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD4555 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wireBit('VDD', 1);
  wireBit('VSS', 0);
  wireBit('E1', e1); wireBit('A1', a1); wireBit('B1', b1);
  wireBit('E2', e2); wireBit('A2', a2); wireBit('B2', b2);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const secOuts = (n) => [0, 1, 2, 3].map((i) => `Q${n}_${i}`);
const highOuts = (n) => secOuts(n).filter((o) => isHigh(read(o)));

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Section 1 enabled (Ē=0): each address → exactly that output HIGH ──────
for (let code = 0; code < 4; code++) {
  const a = code & 1, b = (code >> 1) & 1;
  apply({ e1: 0, a1: a, b1: b, e2: 1, a2: 0, b2: 0 });
  const hot = highOuts(1);
  assert(hot.length === 1 && hot[0] === `Q1_${code}`,
    `sec1 enabled, BA=${b}${a}: expected only Q1_${code} HIGH, got [${hot.join(',')}]`);
  // section 2 disabled → all LOW
  assert(highOuts(2).length === 0,
    `sec2 disabled (Ē=1) but outputs HIGH: [${highOuts(2).join(',')}]`);
}

// ── 2. Section 1 disabled (Ē=1): all outputs LOW for every address ───────────
for (let code = 0; code < 4; code++) {
  const a = code & 1, b = (code >> 1) & 1;
  apply({ e1: 1, a1: a, b1: b, e2: 1, a2: 0, b2: 0 });
  assert(highOuts(1).length === 0,
    `sec1 disabled, BA=${b}${a}: expected all LOW, got [${highOuts(1).join(',')}]`);
}

// ── 3. Sections independent: both enabled, different addresses ───────────────
apply({ e1: 0, a1: 1, b1: 0, e2: 0, a2: 0, b2: 1 }); // sec1→Q1, sec2→Q2
{
  const h1 = highOuts(1), h2 = highOuts(2);
  assert(h1.length === 1 && h1[0] === 'Q1_1',
    `independent: sec1 expected Q1_1, got [${h1.join(',')}]`);
  assert(h2.length === 1 && h2[0] === 'Q2_2',
    `independent: sec2 expected Q2_2, got [${h2.join(',')}]`);
}

console.log(`cd4555-dual-1of4: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
