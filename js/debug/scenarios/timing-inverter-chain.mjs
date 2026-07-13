// ── Timing engine: delays accumulate down an inverter chain ──────────────────
// Four chained 74x04 inverters driven by a 1 MHz clock. Each hop adds the
// chip's tPD (CHIP_TPD_NS['74x04'], LS datasheet typical), so the chain
// output must lag every clock edge by exactly 4 × tPD — the core promise of
// propagation-delay analysis (issues.md A1 lifted).
//
//   CLK ──▷1──▷2──▷3──▷4──  (74x04 gates 1Y→2A, 2Y→3A, 3Y→4A)
//
// Also guards: intermediate taps lag 12/24/36 ns; polarity alternates per
// stage; no spurious events between edges.
//
// Run:  node js/debug/scenarios/timing-inverter-chain.mjs   (exits non-zero on fail)

import { holeId } from '../../breadboard.js';
import { ChipComponent, ClockComponent } from '../../components.js';
import { CircuitHarness } from '../harness.mjs';
import { CHIP_TPD_NS } from '../../timing.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const h = new CircuitHarness(); // default family LS

const chip = new ChipComponent('74x04');
chip.place(0, 0, 10, 4);
h.components.push(chip);

const clk = new ClockComponent(1e6, 0.5); // 1 MHz: rise @500ns, fall @1000ns…
clk.place(0, 0, 30, 2);
h.components.push(clk);

const pin = (name) => chip.getPinByName(name).holeId;
const wm = h.wireManager;
wm.addWire(holeId(0, 0, 'power', 5, 1), pin('VCC'));
wm.addWire(holeId(0, 0, 'power', 5, 0), pin('GND'));
wm.addWire(clk.pins[0].holeId, pin('1A'));
wm.addWire(pin('1Y'), pin('2A'));
wm.addWire(pin('2Y'), pin('3A'));
wm.addWire(pin('3Y'), pin('4A'));

// No live evaluate() first: live mode samples performance.now() for the
// clock level and could clock the circuit nondeterministically before
// t=0. enableTiming() performs the entry settle itself, clocks held LOW.
h.enableTiming();
h.watch(pin('1Y'), 'Y1').watch(pin('2Y'), 'Y2')
 .watch(pin('3Y'), 'Y3').watch(pin('4Y'), 'Y4');

h.advanceNs(2100); // two full clock periods and a bit

const TPD = CHIP_TPD_NS['74x04'] * 1000; // ps — LS datasheet typical

// t=0 settled state: clock LOW → Y1=1, Y2=0, Y3=1, Y4=0.
const initial = { Y1: 1, Y2: 0, Y3: 1, Y4: 0 };
for (const [lane, lvl] of Object.entries(initial)) {
  const tr = h.transitions(lane);
  assert(tr.length > 0 && tr[0].tPs === 0 && tr[0].level === lvl,
    `${lane} initial should be (0, ${lvl}), got ${JSON.stringify(tr[0])}`);
}

// Clock edges at 500ns, 1000ns, 1500ns, 2000ns (in ps). Stage k lags by
// k·tPD and alternates polarity (Y1 falls when CLK rises, Y2 rises, …).
const edgesPs = [500_000, 1_000_000, 1_500_000, 2_000_000];
for (const [k, lane] of [[1, 'Y1'], [2, 'Y2'], [3, 'Y3'], [4, 'Y4']]) {
  const tr = h.transitions(lane);
  // Expected: initial sample + one transition per clock edge.
  assert(tr.length === 1 + edgesPs.length,
    `${lane}: expected ${1 + edgesPs.length} entries, got ${tr.length}`);
  for (let e = 0; e < edgesPs.length; e++) {
    const expT = edgesPs[e] + k * TPD;
    const clkRising = e % 2 === 0;
    // Inverting chain from a rising clock edge: Y1 falls, Y2 rises, Y3 falls, Y4 rises.
    const expLevel = clkRising ? (k % 2 === 1 ? 0 : 1) : (k % 2 === 1 ? 1 : 0);
    const tr_e = tr[e + 1];
    assert(tr_e && tr_e.tPs === expT && tr_e.level === expLevel,
      `${lane} edge ${e}: expected (${expT}ps, ${expLevel}), got ${JSON.stringify(tr_e)}`);
  }
}

console.log(`timing-inverter-chain: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
