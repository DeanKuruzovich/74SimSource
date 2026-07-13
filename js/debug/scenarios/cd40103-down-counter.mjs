// ── CD40103 presettable 8-bit synchronous binary DOWN counter regression ─────
// The CD40103 (js/chips/chips130.js) exercises the BIN_DOWN_8BIT engine
// primitive in its EXTENDED (14-input) "full model" — the one that adds the two
// asynchronous controls the real silicon has and the legacy 74x4103/74x40103
// entries lacked: APE (async preset) and CLR (clear to maximum count), plus the
// CI/CE-gated terminal count.
//
// The chip brings out NO count bus — only CO/ZD (carry out / zero detect). So we
// pin down the internal count indirectly: preset N via SPE, then count down and
// confirm CO/ZD goes LOW after exactly N clocks (and only when CI/CE is LOW).
//
// Pin map (verified vs TI SCHS104B, Fig. 13 + TRUTH TABLE): CLOCK=1, CLR=2,
// CI/CE=3, J0..J3=4..7, VSS=8, APE=9, J4..J7=10..13, CO/ZD=14, SPE=15, VDD=16.
// ALL controls (CLR/APE/SPE/CI/CE) and CO/ZD are ACTIVE LOW; J0=LSB, J7=MSB.
//
// Run:  node js/debug/scenarios/cd40103-down-counter.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('CD40103');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Drive all inputs to rail levels and solve. Controls are active LOW: pass the
// raw rail bit you want on the pin (0 = LOW = asserted for the control inputs).
// `jam` is the 8-bit preset word placed on J0..J7.
function apply({ clk, clr = 1, ape = 1, spe = 1, cice = 1, jam = 0 }) {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`CD40103 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VDD', 1);
  wirePin('VSS', 0);
  wirePin('CLOCK', clk);
  wirePin('CLR', clr);
  wirePin('APE', ape);
  wirePin('SPE', spe);
  wirePin('CI/CE', cice);
  for (let i = 0; i < 8; i++) wirePin('J' + i, (jam >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const co = () => sim.getVoltageAtHole(chip.getPinByName('CO/ZD').holeId);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// A clock pulse: rising edge acts, then return CLOCK low. `cfg` is the steady
// control state held across the pulse.
function pulse(cfg, n = 1) {
  for (let i = 0; i < n; i++) {
    apply({ ...cfg, clk: 1 });
    apply({ ...cfg, clk: 0 });
  }
}

// ── 1. Asynchronous preset (APE LOW, no clock) loads JAM immediately ──────────
// Load 5, then count down 5 → CO/ZD must go LOW after exactly 5 clocks.
apply({ clk: 0, ape: 0, jam: 5 });
assert(isHigh(co()), 'after async preset to 5, CO/ZD should be HIGH (count != 0)');
const countCfg = { cice: 0 }; // CLR/APE/SPE released (HIGH), CI/CE LOW = counting
pulse(countCfg);             // 5 -> 4
pulse(countCfg);             // 4 -> 3
pulse(countCfg);             // 3 -> 2
pulse(countCfg);             // 2 -> 1
assert(isHigh(co()), 'count=1: CO/ZD still HIGH');
pulse(countCfg);             // 1 -> 0
assert(isLow(co()), 'count reached 0 after 5 clocks: CO/ZD must be LOW');

// ── 2. Zero wraps to 255 on the next clock ────────────────────────────────────
pulse(countCfg);             // 0 -> 255
assert(isHigh(co()), 'after wrap to 255: CO/ZD HIGH again');

// ── 3. CLR (clear) forces maximum count 255, dominates everything ─────────────
// While trying to async-preset to 0, hold CLR LOW: CLR must win → count = 255.
apply({ clk: 0, clr: 0, ape: 0, jam: 0 });
assert(isHigh(co()), 'CLR LOW dominates APE: count = 255, CO/ZD HIGH');
// Release CLR (HIGH), count down 255 would be long; instead async-preset to 1.
apply({ clk: 0, ape: 0, jam: 1 });
assert(isHigh(co()), 'async preset to 1: CO/ZD HIGH');
pulse(countCfg);             // 1 -> 0
assert(isLow(co()), 'count 1 -> 0: CO/ZD LOW');

// ── 4. CI/CE HIGH inhibits both counting AND the zero-detect ──────────────────
// count is 0. Drive CI/CE HIGH: CO/ZD must go HIGH (zero-detect gated by CI/CE),
// and a clock edge must NOT advance the count.
apply({ clk: 0, cice: 1 });
assert(isHigh(co()), 'at count 0 but CI/CE HIGH: CO/ZD must be HIGH (gated)');
pulse({ cice: 1 });          // inhibited: count stays 0
apply({ clk: 0, cice: 0 });  // re-enable: zero-detect returns
assert(isLow(co()), 'count held at 0 through inhibit; CO/ZD LOW again when CI/CE LOW');

// ── 5. Synchronous preset: SPE LOW loads on the RISING edge, not before ───────
// From count 0, hold SPE LOW with jam=3. Before any edge the count is unchanged
// (still 0 → CO/ZD LOW). The rising edge loads 3 → CO/ZD HIGH.
apply({ clk: 0, spe: 0, jam: 3, cice: 0 }); // CI/CE LOW so the zero-detect shows
assert(isLow(co()), 'SPE LOW but no clock edge yet: count still 0, CO/ZD LOW');
apply({ clk: 1, spe: 0, jam: 3, cice: 0 }); // rising edge loads 3 (SPE wins)
assert(isHigh(co()), 'rising edge with SPE LOW loaded 3: CO/ZD HIGH');
apply({ clk: 0, spe: 1 });
pulse(countCfg);             // 3 -> 2
pulse(countCfg);             // 2 -> 1
pulse(countCfg);             // 1 -> 0
assert(isLow(co()), 'synchronously-preset 3 counted down to 0: CO/ZD LOW');

// ── 6. Falling edge must not advance ──────────────────────────────────────────
// Async-preset to 2, then a high→low (falling) edge must not decrement.
apply({ clk: 0, ape: 0, jam: 2 });
apply({ clk: 1, cice: 0 });  // rising: 2 -> 1
apply({ clk: 0, cice: 0 });  // falling: no change (still 1)
assert(isHigh(co()), 'falling edge did not advance: count 1, CO/ZD HIGH');
apply({ clk: 1, cice: 0 });  // rising: 1 -> 0
assert(isLow(co()), 'next rising edge: 1 -> 0, CO/ZD LOW');

console.log(`cd40103-down-counter: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
