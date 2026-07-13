// ── 74x867 synchronous 8-bit up/down counter (async clear) — regression ───────
// The 74x867 (js/chips/chips42.js) was a GENERIC_STUB upgraded in place to the
// COUNTER_8BIT_SYNC_867 primitive. Its hand-entered stub pinout was wrong (it
// invented CLRn/LDn/OEn/U_Dn and 3-state outputs, issues.md C2); the pinout has
// been corrected to the TI SDAS115C datasheet (SN74ALS867A, rev Jan 1995).
//
// Control is the S1/S0 mode select, NOT discrete pins:
//   S1 S0 = 00 → Clear (asynchronous, immediate — no clock needed)
//   S1 S0 = 01 → Count down
//   S1 S0 = 10 → Load A..H
//   S1 S0 = 11 → Count up
// ENPn and ENTn are both active-LOW and must both be LOW to count. RCO is
// active-LOW, gated by ENT, and pulses LOW at terminal count (FFh up / 00h down).
// Load and count act on the rising CLK edge; clear does not wait for a clock.
//
// Method mirrors the other counter scenarios: one chip + sim instance kept for
// the whole run so state persists; a clock pulse is LOW→HIGH→LOW.
//
// Run:  node js/debug/scenarios/74x867-updown-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x867');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const DBITS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Drive all 74x867 inputs to rail levels and solve.
// cfg: { clk, s0, s1, enpn, entn, d }  (d = 8-bit load value, default 0)
function apply({ clk = 0, s0 = 0, s1 = 0, enpn = 0, entn = 0, d = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x867 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', clk);
  wirePin('S0', s0);
  wirePin('S1', s1);
  wirePin('ENPn', enpn);
  wirePin('ENTn', entn);
  for (let i = 0; i < 8; i++) wirePin(DBITS[i], (d >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const QN = ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH'];
const count = () => QN.reduce((acc, n, i) => acc | (isHigh(read(n)) ? (1 << i) : 0), 0);
const rcoLow = () => !isHigh(read('RCO')); // active-LOW

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// A clock pulse in a steady control state: rising edge applies the action.
function pulse(cfg, n = 1) {
  for (let i = 0; i < n; i++) {
    apply({ ...cfg, clk: 1 });
    apply({ ...cfg, clk: 0 });
  }
}

// ── 1. Asynchronous clear (mode 00, no clock) ─────────────────────────────────
apply({ clk: 0, s0: 0, s1: 0 });
assert(count() === 0, `async clear: expected 0, got ${count()}`);

// ── 2. Synchronous load (mode 10) ─────────────────────────────────────────────
pulse({ s0: 0, s1: 1, d: 0xA5 });
assert(count() === 0xA5, `load: expected 0xA5, got 0x${count().toString(16)}`);

// Load alone (no clock) must NOT change the count — it is synchronous.
apply({ clk: 0, s0: 0, s1: 1, d: 0x3C });
assert(count() === 0xA5, `load is synchronous: expected 0xA5 held, got 0x${count().toString(16)}`);

// ── 3. Count up (mode 11) ─────────────────────────────────────────────────────
pulse({ s0: 0, s1: 1, d: 0xFD }); // load 253
assert(count() === 0xFD, `load 0xFD: got 0x${count().toString(16)}`);
pulse({ s0: 1, s1: 1 });          // 253 → 254
assert(count() === 0xFE, `count up: expected 254, got ${count()}`);
pulse({ s0: 1, s1: 1 });          // 254 → 255
assert(count() === 0xFF, `count up: expected 255, got ${count()}`);

// At 255 counting up with ENT LOW, RCO must be LOW (active).
assert(rcoLow(), 'RCO should be LOW at 255 counting up');
// Raising ENT must release RCO HIGH even at terminal count.
apply({ clk: 0, s0: 1, s1: 1, entn: 1 });
assert(!rcoLow(), 'RCO should be HIGH when ENT is HIGH');

// ── 4. Count up wraps 255 → 0 ─────────────────────────────────────────────────
pulse({ s0: 1, s1: 1 });
assert(count() === 0x00, `wrap up: expected 0, got ${count()}`);

// ── 5. Count down and terminal-count at 0 ─────────────────────────────────────
pulse({ s0: 0, s1: 1, d: 0x02 }); // load 2
pulse({ s0: 1, s1: 0 });          // 2 → 1 (mode 01 = down)
assert(count() === 1, `count down: expected 1, got ${count()}`);
pulse({ s0: 1, s1: 0 });          // 1 → 0
assert(count() === 0, `count down: expected 0, got ${count()}`);
assert(rcoLow(), 'RCO should be LOW at 0 counting down');
pulse({ s0: 1, s1: 0 });          // 0 → 255 wrap
assert(count() === 0xFF, `wrap down: expected 255, got ${count()}`);

// ── 6. Enables freeze the count ───────────────────────────────────────────────
pulse({ s0: 0, s1: 1, d: 0x40 }); // load 64
pulse({ s0: 1, s1: 1, enpn: 1 }); // ENP HIGH → no count
assert(count() === 0x40, `ENP HIGH freezes: expected 64, got ${count()}`);
pulse({ s0: 1, s1: 1, entn: 1 }); // ENT HIGH → no count
assert(count() === 0x40, `ENT HIGH freezes: expected 64, got ${count()}`);
pulse({ s0: 1, s1: 1 });          // both LOW → count
assert(count() === 0x41, `both enables LOW counts: expected 65, got ${count()}`);

// ── 7. Async clear overrides a held count immediately ─────────────────────────
apply({ clk: 0, s0: 0, s1: 0 });
assert(count() === 0, `async clear override: expected 0, got ${count()}`);

if (failures.length) {
  console.error(`74x867: ${failures.length} FAILED`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('74x867: all checks passed');
