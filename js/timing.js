// ── Propagation-delay timing engine ──────────────────────────────────────────
// Opt-in analysis mode that models real per-chip propagation delay (tPD).
// Lifts issues.md A1 ("No propagation delay") for the analysis mode only —
// live mode is untouched.
//
// How it plugs in (three hooks in simulator.js, all inert when timing is off):
//   1. CircuitSimulator.evaluate() delegates to onExternalChange() while the
//      engine is active, so every existing call site (switch pokes, undo,
//      load) keeps working: pokes inject at the current sim time, structural
//      edits restart the analysis at t=0.
//   2. _drivePin() — the single choke point every chip output goes through —
//      routes to scheduleDrive() while active: the drive intent is queued at
//      (now + tPD) instead of applied instantly. The ~250 chip evaluators in
//      specificChipsSim.js are untouched.
//   3. evaluate()'s clock loop holds clock levels instead of sampling
//      performance.now(): in timing mode, CLOCK/CRYSTAL components are exact
//      scheduled events in sim time (deterministic, ps-exact edges).
//
// Time base: integer picoseconds. Number.MAX_SAFE_INTEGER ps ≈ 2.5 hours of
// sim time. Integer time makes event ordering exact and clock periods stable.
//
// Delay semantics: transport delay per output pin. A pulse narrower than a
// chip's tPD still propagates (real parts partially swallow those — "inertial
// delay" — but hazard glitches are exactly what this mode exists to show).
//
// Entry convention: t=0 starts from the circuit's current settled state with
// every clock at the beginning of its LOW phase (first rising edge one full
// LOW portion after t=0). Deterministic everywhere, no artificial edge at t=0.

import { COMP, DRIVE, FAMILY_SPEC, CMOS4000_TPD_NS } from './constants.js';

const VCC_VOLTAGE = 5;

// Analog dt (seconds) used for the MNA solves inside a zero-elapsed-time event
// batch: small enough that capacitor companion models hold their voltage (a
// cap's charge cannot move during an instantaneous digital event).
const EVENT_HOLD_DT = 1e-9;

// Guardrail: max event batches processed per advanceBy() call. When a circuit
// out-produces this (fast clock at a fast playback speed), the run visibly
// falls behind (`behind` flag) instead of freezing the tab.
const DEFAULT_EVENT_BUDGET = 10000;

// Recorder cap per lane; on overflow the oldest half is dropped and the lane
// is flagged truncated.
const MAX_LANE_TRANSITIONS = 100000;

const eventBefore = (a, b) =>
  a.tPs < b.tPs || (a.tPs === b.tPs && a.seq < b.seq);

// ── Per-chip propagation delays (LS datasheet typicals, ns, rounded) ─────────
// One number per chip: the dominant input→output path (CLK→Q for sequential
// parts). Kept here — rather than spread across the js/chips/ blocks — so the
// whole timing dataset is reviewable in one place; a chip def's own `tpd`
// field (if someone adds one) takes precedence. Chips absent from this table
// fall back to FAMILY_SPEC[family].TPD_NS (or CMOS4000_TPD_NS for CD parts).
// Non-LS families scale these by TPD_NS(family)/TPD_NS(LS).
// Known simplification: no tPLH/tPHL split, no per-path delays (a 74x93's QD
// really lags QA by the internal ripple; here the whole chip switches at one
// tPD after the clock).
export const CHIP_TPD_NS = {
  // Simple gates
  '74x00': 10, '74x02': 10, '74x03': 12, '74x04': 10, '74x05': 12,
  '74x08': 9,  '74x10': 10, '74x11': 9,  '74x20': 10, '74x21': 9,
  '74x27': 10, '74x30': 11, '74x32': 12, '74x86': 12, '74x266': 20,
  '74x14': 15, '74x13': 15,
  // Flip-flops / latches
  '74x74': 25, '74x109': 25, '74x112': 20, '74x73': 20, '74x76': 20,
  '74x75': 22, '74x279': 15,
  // Decoders / encoders / mux
  '74x138': 21, '74x139': 22, '74x42': 17, '74x47': 30, '74x48': 30,
  '74x151': 20, '74x153': 18, '74x157': 15, '74x158': 12, '74x148': 20,
  // Counters / registers (CLK→Q)
  '74x90': 16, '74x93': 16, '74x160': 18, '74x161': 18, '74x162': 18,
  '74x163': 18, '74x164': 24, '74x165': 24, '74x173': 25, '74x174': 22,
  '74x175': 21, '74x192': 25, '74x193': 25, '74x194': 20, '74x393': 16,
  // Arithmetic / comparators
  '74x283': 16, '74x85': 23, '74x181': 25,
  // Bus / drivers
  '74x125': 12, '74x126': 12, '74x240': 12, '74x241': 12, '74x244': 12,
  '74x245': 10, '74x373': 19, '74x374': 22, '74x573': 19, '74x574': 22,
};

export class TimingEngine {
  constructor(sim) {
    this.sim = sim;
    this.active = false;

    // ── Sim-time state ──────────────────────────────────────────────────────
    this.timePs = 0;
    this._seq = 0;          // FIFO tiebreaker for same-time events
    this._heap = [];        // binary min-heap ordered by (tPs, seq)
    // Last *intended* drive per output pin (scheduled or committed) — the
    // dedupe baseline for scheduleDrive. Keyed "compId:pinName".
    this._lastIntent = new Map();

    // ── Recorder ────────────────────────────────────────────────────────────
    // holeId → { holeId, label, transitions: [{t(ps), level}], current, truncated }
    // level ∈ 0 | 1 | 'Z' (floating) | 'X' (short/conflict)
    this.lanes = new Map();

    // ── Playback / UI state (consumed by the timing panel) ─────────────────
    this.running = false;
    this.rateNsPerSec = 10;       // playback speed: sim-ns advanced per wall-second
    this.glitchThresholdNs = 15;  // pulses narrower than this are flagged
    this.behind = false;          // last advance hit the event budget
    this.eventBudget = DEFAULT_EVENT_BUDGET;
    this.onReset = null;          // callback fired after a structural restart

    this._world = null;
    this._components = null;
    this._wireManager = null;
    this._structSig = '';
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Enter timing mode: settle the circuit once in live mode (clocks held LOW),
   * take that as the t=0 state, and schedule the first clock edges.
   */
  begin(world, components, wireManager) {
    this.active = false; // entry settle below must run the normal live path
    this._world = world;
    this._components = components;
    this._wireManager = wireManager;

    this.timePs = 0;
    this._seq = 0;
    this._heap = [];
    this._lastIntent.clear();
    this.behind = false;

    // Clocks start at the beginning of their LOW phase (see header note).
    for (const comp of components) {
      if (!comp.placed) continue;
      if (comp.type === COMP.CLOCK || comp.type === COMP.CRYSTAL) comp.high = false;
    }

    // Entry settle: one instantaneous live-mode solve with the held clock
    // levels. This snapshots the running circuit (counter values, latch
    // states, cap charges all carry over) as the t=0 initial condition.
    this.sim.evaluate(world, components, wireManager);

    // The committed drive states are the baseline intents.
    for (const [key, ds] of this.sim.pinDriveStates) {
      this._lastIntent.set(key, { type: ds.type, voltage: ds.voltage, rOut: ds.rOut ?? null });
    }

    // Schedule each clock's first rising edge one full LOW portion out.
    for (const comp of components) {
      if (!comp.placed) continue;
      if (comp.type !== COMP.CLOCK && comp.type !== COMP.CRYSTAL) continue;
      this._push({ tPs: this._clockLowPs(comp), seq: this._seq++, kind: 'clock', comp });
    }

    // Rebuild recorder lanes: previously-watched holes survive a restart
    // (with history cleared), then every test point and clock is auto-added.
    const kept = [...this.lanes.values()].map(l => ({ holeId: l.holeId, label: l.label }));
    this.lanes.clear();
    for (const k of kept) this.watch(k.holeId, k.label);
    for (const comp of components) {
      if (!comp.placed || !comp.pins || !comp.pins.length) continue;
      if (comp.type === COMP.TESTPOINT) {
        this.watch(comp.pins[0].holeId, comp.label || `TP${comp.id}`);
      } else if (comp.type === COMP.CLOCK || comp.type === COMP.CRYSTAL) {
        this.watch(comp.pins[0].holeId, comp.type === COMP.CRYSTAL ? `XTAL ${comp.id}` : `CLK ${comp.id}`);
      }
    }

    this._structSig = this._computeStructSig();
    this.active = true;

    // Kick-start: evaluate every chip once with interception on. A settled
    // circuit schedules nothing (all intents match). A circuit the live
    // settle loop could NOT settle — e.g. a ring oscillator, frozen today at
    // the 30-iteration cap — has gates whose committed outputs contradict
    // their inputs; those schedule their first events here and the loop
    // starts oscillating for real.
    this._evaluateChips();

    this._sampleLanes(0, true);
    this.sim.simVersion++;
  }

  /** Restart the analysis at t=0 (used when the circuit structure changes). */
  reset() {
    this.begin(this._world, this._components, this._wireManager);
    if (this.onReset) this.onReset();
  }

  // ── Scheduling (called from the _drivePin hook) ───────────────────────────

  /**
   * Queue a chip output change at now + tPD instead of applying it. Transport
   * delay: every change of *intent* schedules an event; if the intent later
   * reverts, both edges stay queued and the output genuinely pulses.
   */
  scheduleDrive(comp, pinName, driveType, voltage, rOut = null) {
    const key = comp.id + ':' + pinName;
    const prev = this._lastIntent.get(key);
    if (prev && prev.type === driveType && prev.voltage === voltage &&
        (prev.rOut ?? null) === (rOut ?? null)) return false;
    const drive = { type: driveType, voltage, rOut: rOut ?? null };
    this._lastIntent.set(key, drive);
    this._push({
      tPs: this.timePs + this._tpdPs(comp),
      seq: this._seq++,
      kind: 'drive',
      key, comp, pinName, drive,
    });
    return true;
  }

  /**
   * Resolve a chip's propagation delay in integer picoseconds.
   * Order: per-def `tpd` → CHIP_TPD_NS table (both LS-typical ns, scaled to
   * the active family) → CMOS-4000 default for CD-prefix parts → the active
   * family's TPD_NS. Non-chip components (nothing else schedules today) get 0.
   */
  _tpdPs(comp) {
    if (comp.type !== COMP.CHIP || !comp.chipDef) return 0;
    const def = comp.chipDef;
    const isCmos4000 = /^CD\d/.test(def.name || '') ||
      (Array.isArray(def.tags) && def.tags.includes('4000 series'));
    const famNs = this.sim._specFor(comp).TPD_NS ?? 12;
    const lsNs = typeof def.tpd === 'number' ? def.tpd : CHIP_TPD_NS[def.name];
    let ns;
    if (typeof lsNs === 'number') {
      // Table/def values are LS typicals; scale to the active family.
      // 4000-series parts don't ride the 74-family dial — use them as-is.
      ns = isCmos4000 ? lsNs : lsNs * (famNs / (FAMILY_SPEC.LS.TPD_NS ?? 12));
    } else {
      ns = isCmos4000 ? CMOS4000_TPD_NS : famNs;
    }
    return Math.max(1, Math.round(ns * 1000));
  }

  // ── Advancing time ────────────────────────────────────────────────────────

  /**
   * Process one event batch (all events sharing the earliest timestamp), then
   * re-solve and let chips react — their responses queue at t + tPD.
   * Returns the batch's time in ps, or null if the queue is empty.
   */
  microStep() {
    if (!this.active || this._heap.length === 0) return null;
    const t = this._heap[0].tPs;
    this.timePs = t;

    while (this._heap.length && this._heap[0].tPs === t) {
      const ev = this._pop();
      if (ev.kind === 'clock') this._applyClockToggle(ev.comp, t);
      else {
        this.sim.pinDriveStates.set(ev.key, {
          type: ev.drive.type, voltage: ev.drive.voltage, rOut: ev.drive.rOut,
          comp: ev.comp, pinName: ev.pinName,
        });
      }
    }

    this._solveInstant();
    this._evaluateChips();
    this._sampleLanes(t);
    this.sim.simTime = t * 1e-12;
    this.sim.simVersion++;
    return t;
  }

  /**
   * Advance sim time by dtPs, processing every event that falls inside the
   * window (bounded by the event budget), then step the analog layer with the
   * true elapsed sim time and refresh derived display state (LEDs, currents).
   */
  advanceByPs(dtPs) {
    if (!this.active || dtPs <= 0) return;
    const target = this.timePs + Math.round(dtPs);
    let budget = this.eventBudget;
    this.behind = false;

    while (this._heap.length && this._heap[0].tPs <= target) {
      if (budget-- <= 0) { this.behind = true; break; }
      this.microStep();
    }
    if (!this.behind) this.timePs = target;

    this._analogStep(dtPs * 1e-12);
    this._postPasses();
    this.sim.simTime = this.timePs * 1e-12;
    this.sim.simVersion++;
  }

  /**
   * The analog layer (caps, coils, 555/RC parts, free-running analog gates)
   * advances on the same sim-time clock: at ns-scale playback speeds RC
   * circuits are correctly near-frozen; at real time they behave exactly as
   * live mode.
   */
  _analogStep(dtSec) {
    const sim = this.sim;
    if (!sim._hasCapacitors && !sim._hasInductors && !sim._hasAnalogTimeDrivers) return;
    if (dtSec <= 0) return;
    sim.dt = dtSec;
    sim._solveMNA(sim.netlist.nodes, this._components);
    this._evaluateChips();
    sim._updateCapacitorState(this._components);
    if (sim._updateInductorState) sim._updateInductorState(this._components);
    this._sampleLanes(this.timePs);
  }

  // ── External changes (routed here by the evaluate() delegation hook) ──────

  /**
   * Something outside the engine changed. A poke (switch/button/value edit)
   * injects at the current sim time; a structural edit (place/move/delete of
   * components or wires) restarts the analysis at t=0.
   */
  onExternalChange(world, components, wireManager) {
    if (world) this._world = world;
    if (components) this._components = components;
    if (wireManager) this._wireManager = wireManager;

    const sig = this._computeStructSig();
    if (sig !== this._structSig) {
      this.reset();
      return;
    }

    // Poke: conducting pairs may have changed → rebuild nets, re-solve, and
    // let chips react (their responses schedule with normal tPD).
    const nodes = this._rebuildNets();
    this._solveInstant(nodes);
    this._evaluateChips();
    this._sampleLanes(this.timePs);
    this._postPasses();
    this.sim.simVersion++;
  }

  /**
   * Rebuild connectivity and re-detect shorts/rails. Mirrors the preamble of
   * CircuitSimulator.evaluate() (netlist build → reset per-pass state → rail
   * tagging → conducting-pair shorts → clock-vs-rail shorts) without touching
   * the retained pinDriveStates, using the engine-held clock levels.
   */
  _rebuildNets() {
    const sim = this.sim;
    const nodes = sim.netlist.build(this._world, this._components, this._wireManager);
    sim.netVoltages.clear();
    sim.componentCurrents.clear();
    sim.netCurrents.clear();
    sim.shortCircuits = [];
    sim.shortCircuitComponents.clear();
    sim._isolatedCaps.clear();
    for (const net of nodes) {
      if (net.isVCC && net.isGND) sim.shortCircuits.push(net.id);
      if (net.isVCC) sim.netVoltages.set(net.id, VCC_VOLTAGE);
      else if (net.isGND) sim.netVoltages.set(net.id, 0);
    }
    sim._detectConductingPairShorts(nodes);

    // Clock-vs-rail / clock-vs-clock shorts (mirrors evaluate()'s check 2b).
    const clockNetState = new Map(); // netId → 'H' | 'L' | 'MIX'
    for (const comp of this._components) {
      if ((comp.type !== COMP.CLOCK && comp.type !== COMP.CRYSTAL) || !comp.placed) continue;
      const pin = comp.pins[0];
      if (!pin) continue;
      const net = sim.netlist.findNetByHole(pin.holeId);
      if (!net) continue;
      const lvl = comp.high ? 'H' : 'L';
      const prev = clockNetState.get(net.id);
      clockNetState.set(net.id, prev === undefined ? lvl : (prev === lvl ? lvl : 'MIX'));
      if ((comp.high && net.isGND) || (!comp.high && net.isVCC)) {
        if (!sim.shortCircuits.includes(net.id)) sim.shortCircuits.push(net.id);
      }
    }
    for (const [netId, state] of clockNetState) {
      if (state === 'MIX' && !sim.shortCircuits.includes(netId)) sim.shortCircuits.push(netId);
    }
    return nodes;
  }

  /** Refresh derived display state (currents, LEDs, 7-segs) after a solve. */
  _postPasses() {
    const sim = this.sim;
    const comps = this._components;
    sim._computeResistorCurrents(comps);
    sim._computeCapacitorCurrents(comps);
    if (sim._computeInductorCurrents) sim._computeInductorCurrents(comps);
    sim._computeDiodeCurrents(comps);
    sim._computeNetCurrents(comps);
    sim._evaluateLEDs(comps);
    sim._evaluateSevenSegs(comps);
  }

  // ── Recorder ──────────────────────────────────────────────────────────────

  /** Add a probe lane on a hole. Safe to call before or during a run. */
  watch(holeId, label) {
    if (this.lanes.has(holeId)) {
      const lane = this.lanes.get(holeId);
      if (label) lane.label = label;
      return lane;
    }
    const lane = {
      holeId,
      label: label || holeId,
      transitions: [],
      current: null,
      truncated: false,
    };
    this.lanes.set(holeId, lane);
    if (this.active) {
      lane.current = this._classify(holeId);
      lane.transitions.push({ t: this.timePs, level: lane.current });
    }
    return lane;
  }

  unwatch(holeId) { this.lanes.delete(holeId); }

  /** Transition history for a lane, by holeId or label. */
  getTransitions(holeIdOrLabel) {
    const lane = this.lanes.get(holeIdOrLabel) ||
      [...this.lanes.values()].find(l => l.label === holeIdOrLabel);
    return lane ? lane.transitions.slice() : [];
  }

  _sampleLanes(tPs, force = false) {
    for (const lane of this.lanes.values()) {
      const level = this._classify(lane.holeId);
      if (force || level !== lane.current) {
        lane.current = level;
        lane.transitions.push({ t: tPs, level });
        if (lane.transitions.length > MAX_LANE_TRANSITIONS) {
          lane.transitions.splice(0, lane.transitions.length >> 1);
          lane.truncated = true;
        }
      }
    }
  }

  /** Digital classification of a net: 0 | 1 | 'Z' (floating) | 'X' (short). */
  _classify(holeId) {
    const net = this.sim.netlist.findNetByHole(holeId);
    if (!net) return 'Z';
    if (this.sim.shortCircuits.includes(net.id)) return 'X';
    // The engine flags any net without a direct chip/rail driver as floating,
    // including nets fed through a resistor or a closed switch — those carry a
    // real solved voltage, so threshold them like a chip input would. Reserve
    // 'Z' for true tri-state: only chip pins on the net (a released bus).
    if (this.sim.floatingNets.has(net.id) && !this._hasPassivePath(net)) return 'Z';
    const v = this.sim.netVoltages.get(net.id);
    if (v === undefined) return 'Z';
    return v > this.sim._spec.VTH ? 1 : 0;
  }

  _hasPassivePath(net) {
    return net.pins.some(p =>
      p.comp.type === COMP.RESISTOR ||
      p.comp.type === COMP.CAPACITOR ||
      p.comp.type === COMP.POLARIZED_CAPACITOR ||
      p.comp.type === COMP.INDUCTOR ||
      p.comp.type === COMP.DIODE ||
      p.comp.type === COMP.LED ||
      p.comp.type === COMP.BUTTON ||
      p.comp.type === COMP.PUSH_BUTTON ||
      p.comp.type === COMP.SWITCH ||
      p.comp.type === COMP.SLIDE_SWITCH ||
      p.comp.type === COMP.DIP_SWITCH);
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  /** Event-instant solve: caps hold their charge (EVENT_HOLD_DT). */
  _solveInstant(nodes = null) {
    this.sim.dt = EVENT_HOLD_DT;
    this.sim._solveMNA(nodes || this.sim.netlist.nodes, this._components);
  }

  _evaluateChips() {
    for (const comp of this._components) {
      if (comp.type !== COMP.CHIP || !comp.placed || !comp.chipDef) continue;
      this.sim._evaluateChip(comp);
    }
  }

  _applyClockToggle(comp, tPs) {
    comp.high = !comp.high;
    const key = comp.id + ':OUT';
    this.sim.pinDriveStates.set(key, {
      type: DRIVE.PUSH_PULL,
      voltage: comp.high ? VCC_VOLTAGE : 0,
      rOut: null, comp, pinName: 'OUT',
    });
    const nextPs = comp.high ? this._clockHighPs(comp) : this._clockLowPs(comp);
    this._push({ tPs: tPs + nextPs, seq: this._seq++, kind: 'clock', comp });
  }

  _clockPeriodPs(comp) {
    const hz = Math.max(0.001, comp.frequencyHz);
    return Math.max(2, Math.round(1e12 / hz));
  }

  _clockHighPs(comp) {
    const duty = comp.type === COMP.CRYSTAL
      ? 0.5
      : Math.min(0.99, Math.max(0.01, comp.dutyCycle ?? 0.5));
    return Math.max(1, Math.round(this._clockPeriodPs(comp) * duty));
  }

  _clockLowPs(comp) {
    return Math.max(1, this._clockPeriodPs(comp) - this._clockHighPs(comp));
  }

  /**
   * Placement signature: which components/wires exist and where their pins
   * sit. Deliberately excludes poke state (switch on/off, pressed, resistance,
   * clock frequency) so those route through the inject path.
   */
  _computeStructSig() {
    const parts = [];
    for (const c of this._components) {
      if (!c.placed) continue;
      const holes = (c.pins || []).map(p => p.holeId).join(',');
      parts.push(`${c.id}:${c.type}:${c.type === COMP.CHIP ? c.chipId : ''}:${holes}`);
    }
    for (const w of this._wireManager.wires) {
      parts.push(`w${w.id}:${w.startHoleId}:${w.endHoleId}`);
    }
    return parts.join('|');
  }

  // ── Binary min-heap ordered by (tPs, seq) ─────────────────────────────────

  _push(ev) {
    const h = this._heap;
    h.push(ev);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (eventBefore(h[i], h[p])) { [h[i], h[p]] = [h[p], h[i]]; i = p; }
      else break;
    }
  }

  _pop() {
    const h = this._heap;
    const top = h[0];
    const last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < h.length && eventBefore(h[l], h[m])) m = l;
        if (r < h.length && eventBefore(h[r], h[m])) m = r;
        if (m === i) break;
        [h[i], h[m]] = [h[m], h[i]];
        i = m;
      }
    }
    return top;
  }
}
