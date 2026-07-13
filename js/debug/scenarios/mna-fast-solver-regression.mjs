// ── Fast-solver + netlist-cache regression ───────────────────────────────────
// Guards the July 2026 perf work (Simulator-Performance-Research.md, Tiers 0–1):
//   • _gaussSolve: flat row-major matrix, in-place, zero-factor skip
//   • _solveMNA: persistent scratch buffers (reused across solves)
//   • Netlist: O(1) hole→net / pin→net lookup maps
//   • _timeStep: reuses the previous netlist build (topology can't change
//     between ticks; every edit path runs an external evaluate first)
//
// Asserts:
//   1. Repeated evaluate() is deterministic — scratch-buffer reuse must not
//      leak state between solves (voltages identical across runs).
//   2. The O(1) lookup maps agree exactly with a linear scan over the nets,
//      for every hole and every pin; unknown keys return null.
//   3. Stepping the time loop with netlist reuse produces *identical* state
//      (voltages, cap vPrev, LED brightness) to stepping with the reuse
//      defeated (rebuild every tick) — and the reuse path actually skips
//      rebuilds while the defeated path performs them.
//   4. A button press invalidates the cache end-to-end: markChanged rebuilds
//      the netlist and the pressed pair shows up in conductingPairs.
//
// Run:  node js/debug/scenarios/mna-fast-solver-regression.mjs
// (exits non-zero on failure)

import { CircuitHarness } from '../harness.mjs';
import { COMP } from '../../constants.js';

// Deterministic wall clock so CLOCK components can't inject nondeterminism.
let fakeMs = 0;
performance.now = () => fakeMs;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Determinism of repeated evaluate (scratch buffers must not leak) ─────
{
  const h = CircuitHarness.fromFile('js/examples/BenEater8BitCPU.json');
  h.evaluate();
  const first = new Map(h.sim.netVoltages);
  for (let i = 0; i < 3; i++) h.evaluate();
  let maxD = 0;
  for (const [id, v] of h.sim.netVoltages) {
    const v0 = first.get(id);
    if (v0 === undefined) { failures.push(`net ${id} appeared after re-evaluate`); continue; }
    maxD = Math.max(maxD, Math.abs(v - v0));
  }
  assert(h.sim.netVoltages.size === first.size,
    `net count changed across evaluates: ${first.size} → ${h.sim.netVoltages.size}`);
  assert(maxD === 0, `repeated evaluate() drifted: maxΔ=${maxD} V (scratch-buffer leak?)`);
}

// ── 2. O(1) netlist lookups agree with a linear scan ────────────────────────
{
  const h = CircuitHarness.fromFile('js/examples/BenEater8BitCPU.json');
  h.evaluate();
  const nl = h.sim.netlist;
  let holeChecks = 0, pinChecks = 0;
  for (const net of nl.nodes) {
    for (const hole of net.holes) {
      holeChecks++;
      if (nl.findNetByHole(hole) !== net) {
        failures.push(`findNetByHole(${hole}) returned wrong net`);
      }
    }
    for (const p of net.pins) {
      pinChecks++;
      if (nl.findNetByPin(p.comp, p.pin.name) !== net) {
        failures.push(`findNetByPin(${p.comp.id}:${p.pin.name}) returned wrong net`);
      }
    }
  }
  assert(holeChecks > 100, `suspiciously few holes checked (${holeChecks})`);
  assert(pinChecks > 100, `suspiciously few pins checked (${pinChecks})`);
  assert(nl.findNetByHole('no-such-hole') === null, 'unknown hole should return null');
  assert(nl.findNetByPin({ id: -1 }, 'nope') === null, 'unknown pin should return null');
}

// ── 3. Time-loop netlist reuse ≡ rebuilding every tick ──────────────────────
{
  const mkCounting = (h) => {
    let builds = 0;
    const orig = h.sim.netlist.build.bind(h.sim.netlist);
    h.sim.netlist.build = (...a) => { builds++; return orig(...a); };
    return () => builds;
  };

  const hReuse = CircuitHarness.fromFile('js/examples/2x555timers.json');
  const hRebuild = CircuitHarness.fromFile('js/examples/2x555timers.json');
  const buildsReuse = mkCounting(hReuse);
  const buildsRebuild = mkCounting(hRebuild);
  hReuse.evaluate();
  hRebuild.evaluate();

  const STEPS = 60;
  const base = { r: buildsReuse(), b: buildsRebuild() };
  for (let i = 0; i < STEPS; i++) {
    fakeMs += 20;
    hReuse.step();                        // production path: reuse engaged
    hRebuild.sim._netlistWorld = null;    // defeat the cache: force rebuild
    hRebuild.step();

    let maxD = 0;
    for (const [id, v] of hReuse.sim.netVoltages) {
      const v2 = hRebuild.sim.netVoltages.get(id);
      if (v2 === undefined) { failures.push(`step ${i}: net ${id} missing in rebuild run`); break; }
      maxD = Math.max(maxD, Math.abs(v - v2));
    }
    if (maxD !== 0) { failures.push(`step ${i}: reuse vs rebuild voltages differ, maxΔ=${maxD} V`); break; }
    for (const c of hReuse.caps()) {
      const c2 = hRebuild.byId(c.id);
      if (c.vPrev !== c2.vPrev) { failures.push(`step ${i}: cap ${c.id} vPrev ${c.vPrev} vs ${c2.vPrev}`); break; }
    }
    for (const c of hReuse.components) {
      if (c.type !== COMP.LED) continue;
      const c2 = hRebuild.byId(c.id);
      if (c.brightness !== c2.brightness) { failures.push(`step ${i}: LED ${c.id} brightness differs`); break; }
    }
  }
  assert(buildsReuse() - base.r === 0,
    `reuse path rebuilt the netlist ${buildsReuse() - base.r}× during ${STEPS} steps (expected 0)`);
  assert(buildsRebuild() - base.b === STEPS,
    `rebuild path built ${buildsRebuild() - base.b}× (expected ${STEPS})`);
}

// ── 4. Button press invalidates the cache end-to-end ────────────────────────
{
  const h = CircuitHarness.fromFile('js/examples/BenEater8BitCPU.json');
  let builds = 0;
  const orig = h.sim.netlist.build.bind(h.sim.netlist);
  h.sim.netlist.build = (...a) => { builds++; return orig(...a); };
  h.evaluate();

  const btn = h.components.find(c => c.placed &&
    (c.type === COMP.PUSH_BUTTON || c.type === COMP.BUTTON));
  assert(!!btn, 'expected a push button in the Ben Eater example');
  if (btn) {
    const before = builds;
    h.press(btn);   // harness mirrors onCircuitChanged → external evaluate
    assert(builds > before, 'press() must rebuild the netlist (cache invalidation)');
    const pair = h.sim.netlist.conductingPairs.find(p => p.comp.id === btn.id);
    assert(!!pair, 'pressed button must appear in conductingPairs after rebuild');
    h.release(btn);
    const pairAfter = h.sim.netlist.conductingPairs.find(p => p.comp.id === btn.id);
    assert(!pairAfter, 'released button must leave conductingPairs after rebuild');
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length === 0) {
  console.log('mna-fast-solver-regression: all checks passed');
  process.exit(0);
} else {
  console.error(`mna-fast-solver-regression: ${failures.length} FAILURE(S)`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
