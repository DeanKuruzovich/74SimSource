// ── 74x873 DUAL 4-bit transparent D-latch with clear, 3-state — regression ────
// The 74x873 (js/chips/chips42.js) was a GENERIC_STUB upgraded in place to the
// new LATCH_4BIT_TRI_873 primitive. Its hand-entered stub pinout was invented
// (issues.md C2) and has been corrected to the TI SN74ALS873B datasheet
// (SDAS036D, Aug. 1995) DW/NT terminal assignment + FUNCTION TABLE (each latch).
// This guards, per that function table:
//   OE̅=1                → outputs high-impedance (dominant)
//   else CLR̅=0          → Q=0, independent of LE (clear overrides the latch)
//   else LE=1           → transparent, Q follows D
//   else (LE=0)         → hold last latched value
// and the two sections are fully independent (separate CLR̅/OE̅/LE per nibble).
//
// Method mirrors 74x40104-univ-shift.mjs: one chip + sim instance kept for the
// whole run so the latch state persists across re-solves. Latches are level
// sensitive, so no clock edge is needed — each apply() just re-solves the pins.
//
// Run:  node js/debug/scenarios/74x873-dual-latch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x873');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Persist the last-applied logic level for every input so a step that only
// changes a couple of pins keeps the rest where they were.
const state = {
  '1CLRn': 1, '1OEn': 0, '1LE': 0, '1D1': 0, '1D2': 0, '1D3': 0, '1D4': 0,
  '2CLRn': 1, '2OEn': 0, '2LE': 0, '2D1': 0, '2D2': 0, '2D3': 0, '2D4': 0,
};

function apply(changes = {}) {
  Object.assign(state, changes);
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x873 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const [name, bit] of Object.entries(state)) wirePin(name, bit);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const nibble = (p) =>
  `${p}Q1=${isHigh(read(p + 'Q1')) ? 1 : 0} ${p}Q2=${isHigh(read(p + 'Q2')) ? 1 : 0} ` +
  `${p}Q3=${isHigh(read(p + 'Q3')) ? 1 : 0} ${p}Q4=${isHigh(read(p + 'Q4')) ? 1 : 0}`;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const expectQ = (p, label, e1, e2, e3, e4) => {
  assert(isHigh(read(p + 'Q1')) === !!e1 && isHigh(read(p + 'Q2')) === !!e2 &&
         isHigh(read(p + 'Q3')) === !!e3 && isHigh(read(p + 'Q4')) === !!e4,
    `${label}: expected ${p}Q=${e1}${e2}${e3}${e4}, got ${nibble(p)}`);
};

// ── 1. Transparent: section 1 follows its data when LE=1, OE̅=0, CLR̅=1 ───────
apply({ '1CLRn': 1, '1OEn': 0, '1LE': 1, '1D1': 1, '1D2': 0, '1D3': 1, '1D4': 0 });
expectQ('1', 'transparent', 1, 0, 1, 0);

// ── 2. Hold: drop LE, change the data → outputs keep the captured value ───────
apply({ '1LE': 0, '1D1': 0, '1D2': 1, '1D3': 0, '1D4': 1 });
expectQ('1', 'hold across data change', 1, 0, 1, 0);

// ── 3. Clear dominates: CLR̅=0 forces Q=0 even while LE=1 with all-ones data ──
apply({ '1LE': 1, '1D1': 1, '1D2': 1, '1D3': 1, '1D4': 1, '1CLRn': 0 });
expectQ('1', 'clear over transparent', 0, 0, 0, 0);

// ── 3b. Clear works while holding too (LE=0) — clear is independent of LE ─────
apply({ '1CLRn': 1, '1LE': 1, '1D1': 1, '1D2': 1, '1D3': 1, '1D4': 1 }); // load 1111
expectQ('1', 'reload before hold-clear', 1, 1, 1, 1);
apply({ '1LE': 0 });                 // hold 1111
expectQ('1', 'hold 1111', 1, 1, 1, 1);
apply({ '1CLRn': 0 });               // clear while LE=0
expectQ('1', 'clear while holding', 0, 0, 0, 0);

// ── 4. Output enable: OE̅=1 → high-impedance; re-enable restores stored data ──
apply({ '1CLRn': 1, '1LE': 1, '1D1': 1, '1D2': 0, '1D3': 1, '1D4': 0 }); // Q=1010
expectQ('1', 'load before OE test', 1, 0, 1, 0);
apply({ '1LE': 0, '1OEn': 1 });      // hold, then disable outputs
assert(!isHigh(read('1Q1')), `OE̅=1: 1Q1 should be high-impedance, got ${nibble('1')}`);
assert(!isHigh(read('1Q3')), `OE̅=1: 1Q3 should be high-impedance, got ${nibble('1')}`);
apply({ '1OEn': 0 });                // re-enable — stored data reappears intact
expectQ('1', 'OE re-enabled keeps data', 1, 0, 1, 0);

// ── 5. Independence: driving/clearing section 2 leaves section 1 untouched ────
apply({ '2CLRn': 1, '2OEn': 0, '2LE': 1, '2D1': 0, '2D2': 1, '2D3': 1, '2D4': 0 });
expectQ('2', 'section 2 transparent', 0, 1, 1, 0);
expectQ('1', 'section 1 unchanged by section 2 activity', 1, 0, 1, 0);
apply({ '2CLRn': 0 });               // clear section 2 only
expectQ('2', 'section 2 cleared', 0, 0, 0, 0);
expectQ('1', 'section 1 still holds its data', 1, 0, 1, 0);

console.log(`74x873-dual-latch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
