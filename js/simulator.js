// ── Circuit Simulator ────────────────────────────────────────────────────────
// Evaluates the circuit after every change: computes net voltages (numbers),
// component currents, lights LEDs, drives 7 segment displays.
// Uses the component-boundary-aware Netlist.
//
// Model:
//   - VCC rails = 5V, GND rails = 0V
//   - Chip gates: outputs modelled with finite output impedance (CHIP_R_OUT)
//     via Norton equivalents in MNA, supporting push pull, high-Z, and
//     open collector (sink-only) drive states.
//   - Undriven (floating) TTL inputs get a weak internal pull up (TTL_INPUT_R_PULLUP)
//     so they default HIGH matching real 74 series behaviour.
//   - Resistors: bridge two nodes; current = ΔV / R (Ohm's law)
//   - Pull up/pull down resistors resolve naturally through the MNA solver:
//     competing values produce a voltage divider.
//   - LEDs: lit when anode_V > cathode_V; forward voltage drop modelled
//   - Buttons/switches: handled in netlist (closed = merged nodes)

import { COMP, DRIVE, CHIP_R_OUT, TTL_INPUT_R_PULLUP, getFamilySpec, DEFAULT_FAMILY } from './constants.js';
import { Netlist } from './netlist.js';
import { chipEvaluators } from './specificChipsSim.js';
import { TimingEngine } from './timing.js';

const VCC_VOLTAGE = 5;
const VCC_R_INT = 2.5;        // internal resistance → 2A short-circuit limit
const LED_VF = 2.0;          // LED forward voltage drop (V)
const LED_R_INTERNAL = 33;   // LED bulk resistance (Ω) above Vf realistic ~20mA with 150Ω series
const LED_G_OFF = 1e-6;      // LED off-state conductance (S) ≈ 1MΩ near zero leakage below Vf
const LED_I_KNEE     = 0.0005; // 0.5 mA — below this an LED reads as off
const LED_I_RATED    = 0.020;  // 20 mA — discrete LED full-brightness reference
// 7-seg full-brightness reference. A segment fed from a chip output through a
// realistic 470Ω limiting resistor only pulls a couple mA (5V push-pull,
// R_OUT≈714Ω for 74LS, plus the segment's own ~33Ω + 2V Vf) — far below a
// discrete LED's 20mA, so segments need their own (lower) full-brightness
// reference, calibrated so a typical chip-driven display reads near full.
const SEG_I_RATED    = 0.0011; // 1.1 mA — 7-seg segment full-brightness reference
const LED_I_BURNOUT  = 0.030;  // 30 mA — over this triggers the red overdrive ring
const DRIVER_I_CONSTANT = 0.015; // 74x143-class constant-current driver magnitude (A)
const DIODE_VF = 0.7;        // Silicon diode forward voltage drop (V)
const DIODE_R_INTERNAL = 10; // Diode bulk resistance (Ω) above Vf small-signal 1N4148
const DIODE_G_OFF = 1e-6;    // Diode reverse-bias conductance (S) ≈ 1MΩ near zero leakage
const POL_CAP_G_LEAK_FWD = 1e-7;  // Polarized cap forward leakage (S) ≈ 10MΩ healthy electrolytic
const POL_CAP_G_LEAK_REV = 1e-3;  // Polarized cap reverse-bias leakage (S) ≈ 1kΩ leaky/failing path
const POL_CAP_REV_THRESH = -0.3;  // V   vCap below this is considered reverse-biased
// ── Inductor model ──────────────────────────────────────────────────────────
// Backward-Euler companion model, the electrical dual of the capacitor above:
// the coil remembers a CURRENT (iPrev) instead of a voltage, stamps
// G_eq = dt/L_eff instead of C/dt, and behaves as a wire (not an open) at DC.
// Real breadboard L/R time constants are microseconds — invisible at this
// engine's 1–50ms timestep — so the inductance is scaled up by IND_L_SCALE to
// make current ramps play out at human speed. This is the same pedagogical
// time stretch the capacitor gets via its MAX_CAP_DV per-step clamp.
const IND_L_SCALE = 1e4;     // 10 mH behaves like 100 H → τ = L/R lands in visible seconds
const IND_R_LOSS  = 10000;   // built-in parallel loss path (Ω): bounds the flyback spike
                             // to iPrev·R_loss (tens of volts) instead of the gigavolts the
                             // universal 1e-9 leak would produce when the current path breaks
const IND_G_LOSS  = 1 / IND_R_LOSS;
const IND_G_MAX   = 1;       // conductance ceiling (S) guards matrix conditioning for tiny L
const MAX_IND_DI  = 0.0005;  // max current change per step (A) — keeps ramps visible (dual of MAX_CAP_DV)
const IND_DECAY_FLOOR = 0.0001; // min per-step decay (A) when the coil voltage opposes the stored
                                // current (flyback/freewheel), so stored energy drains in seconds

export class CircuitSimulator {
  constructor() {
    this.netlist = new Netlist();
    this.netVoltages = new Map();        // netId → voltage (number, volts)
    this.componentCurrents = new Map();  // compId → current (number, amps)
    this.netCurrents = new Map();        // netId → max current (amps) on that net
    this.shortCircuits = [];             // [netId, ...]
    this.shortCircuitComponents = new Set(); // compIds bridging VCC↔GND via 0Ω path
    this.pinDriveStates = new Map();     // "compId:pinName" → { type: DRIVE.*, voltage: number }
    // Chip-controlled resistive couplings: "compId:gateKey" →
    //   { comp, pinA, pinB, resistance }. Written by chip evaluators
    //   (bilateral switches, analog mux closed channels) and consumed by the
    //   MNA solver to stamp a conductance between the two pins' nets. In pure
    //   digital mode the same entries union the two nets together.
    this.chipCouplings = new Map();
    this.floatingNets = new Set();       // netIds with only TTL pull up (no real driver)
    this._isolatedCaps = new Set();      // compIds of caps with no real return path (open-circuit)

    // ── Time-domain state ─────────────────────────────────────────────────
    this.simTime = 0;                    // current simulation time (seconds)
    this.dt = 0.05;                      // time step (seconds), target 50ms
    this._dtMin = 0.001;                 // minimum time step (1ms)
    this._dtMax = 0.05;                  // maximum time step (50ms)
    this._simLoopId = null;              // setInterval id for time-stepping
    this._hasCapacitors = false;         // true when circuit contains capacitors
    this._hasInductors = false;          // true when circuit contains inductors
    this._hasClocks = false;             // true when circuit contains clock components
    // ── Edge-gated solving (perf) ──────────────────────────────────────────
    // When the only time-domain driver is digital CLOCK/CRYSTAL sources (no
    // caps, no free-running analog gates), the circuit is static between clock
    // edges, so the time-loop can skip the ~100ms MNA solve until a clock flips.
    this._hasDigitalClocks = false;      // ≥1 placed CLOCK/CRYSTAL
    this._hasAnalogTimeDrivers = false;  // VCO/XTAL_OSC/OPAMP gate present
    this._edgeSkipEligible = false;      // safe to skip static time-steps
    this._lastClockLevels = null;        // Map(compId → bool) solved last evaluate
    this._steppingWorld = null;          // cached references for time-step loop
    this._steppingComponents = null;
    this._steppingWireManager = null;
    this._onStepCallback = null;         // called after each time step (for UI refresh)

    // ── Netlist reuse between time steps (perf) ───────────────────────────
    // Topology only changes through user edits, and every edit path funnels
    // into App.onCircuitChanged() → an external evaluate(), which rebuilds.
    // Between _timeStep ticks nothing can have changed the netlist, so the
    // loop sets _netlistReuseOk and evaluate() skips the rebuild. Any call
    // that doesn't explicitly set the flag rebuilds unconditionally.
    this._netlistReuseOk = false;        // one-shot, set by _timeStep only
    this._netlistWorld = null;           // identity of the last-built inputs
    this._netlistComponents = null;
    this._netlistWireManager = null;
    this._netlistCompCount = -1;

    // ── MNA scratch buffers (perf) ────────────────────────────────────────
    // The matrix is rebuilt for every solve, but its backing memory is
    // reused: at 350 nets one matrix is ~1MB, and evaluate() runs up to 6
    // solves — allocating fresh buffers each time dominated GC churn.
    this._mnaScratchN = 0;               // allocated dimension (grow-only)
    this._mnaScratchA = null;            // Float64Array(N*N), row-major
    this._mnaScratchZ = null;            // Float64Array(N)

    // ── 74 series family (affects thresholds, drive, pull ups) ──────────────
    this.family = DEFAULT_FAMILY;
    this._spec = getFamilySpec(this.family);

    // Incremented after every evaluate() and every time step the renderer
    // uses this to detect when the simPowerNodes cache needs rebuilding.
    this.simVersion = 0;

    // Propagation-delay analysis engine (js/timing.js). null = live mode.
    // While `timing.active`, evaluate() delegates external changes to the
    // engine and _drivePin() schedules output changes at now + tPD instead
    // of applying them instantly.
    this.timing = null;
  }

  setFamily(key) {
    this.family = key;
    this._spec = getFamilySpec(key);
  }

  // Per-chip spec lookup: falls back to the project default when a chip
  // has no per-chip override (comp.chipFamily is null/undefined).
  _specFor(comp) {
    return comp ? getFamilySpec(comp.chipFamily ?? this.family) : this._spec;
  }

  /**
   * Run a full simulation pass. Call after every circuit change.
   * Mutates component state (LED.lit, SevenSeg.segments).
   */
  evaluate(world, components, wireManager) {
    // One-shot netlist-reuse flag (see constructor). Captured and cleared
    // first so no early return below can leave it armed for a later call.
    const reuseRequested = this._netlistReuseOk === true;
    this._netlistReuseOk = false;

    // Timing-analysis mode: external changes route through the engine —
    // pokes (switch/button/value edits) inject at the current sim time,
    // structural edits restart the analysis at t=0. Keeps every existing
    // call site working unchanged while the mode is active.
    if (this.timing && this.timing.active) {
      this.timing.onExternalChange(world, components, wireManager);
      return;
    }

    // 1. Build netlist (component-boundary-aware), or reuse the previous
    //    build when the time loop vouches that topology is unchanged AND the
    //    circuit objects are the very same ones the netlist was built from.
    let nodes;
    if (reuseRequested &&
        this._netlistWorld === world &&
        this._netlistComponents === components &&
        this._netlistWireManager === wireManager &&
        this._netlistCompCount === components.length &&
        this.netlist.nodes.length > 0) {
      nodes = this.netlist.nodes;
    } else {
      nodes = this.netlist.build(world, components, wireManager);
      this._netlistWorld = world;
      this._netlistComponents = components;
      this._netlistWireManager = wireManager;
      this._netlistCompCount = components.length;
    }

    this.netVoltages.clear();
    this.componentCurrents.clear();
    this.netCurrents.clear();
    this.shortCircuits = [];
    this.shortCircuitComponents.clear();
    this._isolatedCaps.clear();
    // NOTE: pinDriveStates is intentionally NOT cleared here.
    // Retaining drive states from the previous evaluate() allows the
    // initial MNA solve to produce correct voltages for externally-wired
    // feedback nodes (e.g. QA→CKB on ripple counters). Gates will update
    // drive states during the iteration loop as needed.

    // 2. Tag power nodes and detect shorts
    for (const net of nodes) {
      if (net.isVCC && net.isGND) {
        this.shortCircuits.push(net.id);
      }
      if (net.isVCC) this.netVoltages.set(net.id, VCC_VOLTAGE);
      else if (net.isGND) this.netVoltages.set(net.id, 0);
    }

    // 2a. Detect shorts that close through a 0Ω element (closed switch, pressed
    // button, slide-switch active pair). Direct rail-to-rail merges via wires
    // and breadboard internals already produce a single net flagged isVCC &&
    // isGND above; this pass catches the case where two rail-tagged nets stay
    // distinct in the netlist but a conducting component bridges them.
    this._detectConductingPairShorts(nodes);

    // 3. Iterative gate evaluation with MNA solve each pass.
    //    Gates write to pinDriveStates → MNA resolves net voltages →
    //    gates re-read voltages → repeat until stable (max 30 iterations).
    //    An initial MNA pass runs before the first gate evaluation so that
    //    externally-wired feedback nodes (e.g. QA→CKB on ripple counters)
    //    already carry the correct voltage when gates first read them.

    // Drive clock outputs based on real wall-clock time before the initial MNA.
    // Record the exact levels solved so _timeStep can detect edges cheaply
    // (see _clockLevel / _clockEdgePending) and skip redundant static solves.
    const _clockNow = performance.now() / 1000;
    const clockLevels = new Map();
    for (const comp of components) {
      if (!comp.placed) continue;
      if (comp.type !== COMP.CLOCK && comp.type !== COMP.CRYSTAL) continue;
      // While a timing engine exists (even during its t=0 entry settle),
      // clocks are sim-time event sources — hold the engine-managed level
      // instead of sampling the wall clock.
      comp.high = this.timing ? !!comp.high : this._clockLevel(comp, _clockNow);
      this._drivePinBit(comp, 'OUT', comp.high ? 1 : 0);
      clockLevels.set(comp.id, comp.high);
    }
    this._lastClockLevels = clockLevels;

    // 2b. Clock-vs-rail (and clock-vs-clock) shorts. A clock is an idealized
    // rail source: HIGH = wire-to-VCC, LOW = wire-to-GND. Wiring it to the
    // opposite rail   or two clocks at opposite states onto the same net   is
    // a short. Runs regardless of solve mode.
    const clockNetState = new Map(); // netId → 'H' | 'L' | 'MIX'
    for (const comp of components) {
      if ((comp.type !== COMP.CLOCK && comp.type !== COMP.CRYSTAL) || !comp.placed) continue;
      const pin = comp.pins[0]; // OUT
      if (!pin) continue;
      const net = this.netlist.findNetByHole(pin.holeId);
      if (!net) continue;
      const lvl = comp.high ? 'H' : 'L';
      const prev = clockNetState.get(net.id);
      clockNetState.set(net.id, prev === undefined ? lvl : (prev === lvl ? lvl : 'MIX'));
      if ((comp.high && net.isGND) || (!comp.high && net.isVCC)) {
        if (!this.shortCircuits.includes(net.id)) this.shortCircuits.push(net.id);
      }
    }
    for (const [netId, state] of clockNetState) {
      if (state === 'MIX' && !this.shortCircuits.includes(netId)) {
        this.shortCircuits.push(netId);
      }
    }

    this._solveMNA(nodes, components);
    for (let iter = 0; iter < 30; iter++) {
      let changed = false;
      for (const comp of components) {
        if (comp.type !== COMP.CHIP || !comp.placed || !comp.chipDef) continue;
        if (this._evaluateChip(comp)) changed = true;
      }

      // Re-solve with current drive states to get up-to-date net voltages
      this._solveMNA(nodes, components);

      // Always run at least 2 iterations: the first iteration may read stale
      // voltages from the initial MNA (before any chip drove outputs), and
      // sequential chips need a second pass to see corrected voltages.
      if (!changed && iter > 0) break;
    }

    // 4. Compute currents for resistors, capacitors, diodes, and net current map
    this._computeResistorCurrents(components);
    this._computeCapacitorCurrents(components);
    this._computeInductorCurrents(components);
    this._computeDiodeCurrents(components);
    this._computeNetCurrents(components);

    // 5. Evaluate LEDs
    this._evaluateLEDs(components);

    // 6. Evaluate 7 segment displays
    this._evaluateSevenSegs(components);

    // 7. Update capacitor/inductor time-domain state (vPrev/iPrev) for next step
    this._updateCapacitorState(components);
    this._updateInductorState(components);

    // Track whether circuit has capacitors or clocks (for time-stepping loop).
    // VCO chips also need the loop — they generate their own square wave from
    // simTime, not from an external CLOCK component.
    this._hasCapacitors = components.some(c => (c.type === COMP.CAPACITOR || c.type === COMP.POLARIZED_CAPACITOR) && c.placed);
    // Inductors are RL time-domain elements: they need the continuous loop
    // (iPrev integrates every step) and disqualify edge-gated solving.
    this._hasInductors = components.some(c => c.type === COMP.INDUCTOR && c.placed);
    // Digital clock sources (CLOCK/CRYSTAL): output is a pure function of
    // performance.now(), so their edges can be detected without a solve.
    this._hasDigitalClocks = components.some(c => c.placed && (c.type === COMP.CLOCK || c.type === COMP.CRYSTAL));
    // Free-running analog gates need a continuous solve (their state evolves
    // every tick from simTime / relaxation), so they disqualify edge-skipping.
    this._hasAnalogTimeDrivers = components.some(c => {
      if (!c.placed || c.type !== COMP.CHIP || !c.chipDef || !c.chipDef.gates) return false;
      // XTAL_OSC free-runs from simTime; OPAMP needs the loop so its damped
      // relaxation keeps converging in feedback circuits.
      return c.chipDef.gates.some(g => g.type === 'VCO_STUB' || g.type === 'VCO_SINGLE_EN' || g.type === 'VCO_DUAL' || g.type === 'VCO_DUAL_EN' || g.type === 'XTAL_OSC' || g.type === 'OPAMP');
    });
    this._hasClocks = this._hasDigitalClocks || this._hasAnalogTimeDrivers;
    // Edge-gated solving is safe only when digital clocks are the SOLE time
    // driver: no caps (RC transients) and no free-running analog gates. Then
    // the circuit is static between clock edges and the solve can be skipped.
    this._edgeSkipEligible = this._hasDigitalClocks && !this._hasCapacitors && !this._hasInductors && !this._hasAnalogTimeDrivers;
    this.simVersion++;
  }

  /**
   * Output level of a CLOCK/CRYSTAL at wall-clock time nowSec (seconds).
   * Pure function of performance.now() and the component's frequency/duty —
   * no simulation state — so it is safe to call outside a solve to detect
   * clock edges cheaply. Single source of truth shared by evaluate() and the
   * time-loop's edge check.
   */
  _clockLevel(comp, nowSec) {
    const hz = Math.max(0.001, comp.frequencyHz);
    const period = 1 / hz;
    // Crystals are idealized fixed-frequency 50%-duty clock sources.
    const duty = comp.type === COMP.CRYSTAL
      ? 0.5
      : Math.min(0.99, Math.max(0.01, comp.dutyCycle ?? 0.5));
    return (nowSec % period) < (period * duty);
  }

  /**
   * True if any digital clock's level differs from the level solved in the last
   * evaluate() — i.e. an unsolved edge is pending. A null snapshot (first tick
   * after a circuit change) forces a solve.
   */
  _clockEdgePending(nowSec) {
    if (!this._lastClockLevels) return true;
    for (const comp of this._steppingComponents) {
      if (!comp.placed) continue;
      if (comp.type !== COMP.CLOCK && comp.type !== COMP.CRYSTAL) continue;
      if (this._clockLevel(comp, nowSec) !== this._lastClockLevels.get(comp.id)) return true;
    }
    return false;
  }

  // ── Time-stepping loop for time-domain simulation ─────────────────────────
  // When capacitors are present, the simulator automatically runs a
  // continuous loop that advances simulation time in real-time.

  /**
   * Start the time-domain simulation loop. Call after the initial evaluate().
   * The loop runs at real-time speed with adaptive dt.
   *
   * Invariant: any path that replaces state.components (load, undo, deserialize)
   * MUST end in App.onCircuitChanged(), which re-invokes this method with the
   * fresh array. Otherwise this interval keeps mutating orphan components and
   * the UI will appear "stuck until page reload".
   */
  startTimeLoop(world, components, wireManager, onStepCallback) {
    this.stopTimeLoop();
    this._steppingWorld = world;
    this._steppingComponents = components;
    this._steppingWireManager = wireManager;
    this._onStepCallback = onStepCallback;

    // Reset dt to minimum on circuit change so first steps don't overshoot
    this.dt = this._dtMin;

    // Timing-analysis mode drives time itself (rAF in the app, advanceNs in
    // the debug harness) — the wall-clock interval stays off.
    if (this.timing && this.timing.active) return;

    if (!this._hasCapacitors && !this._hasInductors && !this._hasClocks) return;

    // Run at ~20ms real-time intervals (50 FPS) dt adapts independently
    this._simLoopId = setInterval(() => {
      this._timeStep();
    }, 20);
  }

  /**
   * Stop the time-domain simulation loop.
   */
  stopTimeLoop() {
    if (this._simLoopId !== null) {
      clearInterval(this._simLoopId);
      this._simLoopId = null;
    }
  }

  // ── Timing-analysis mode (propagation delay, js/timing.js) ────────────────

  /**
   * Enter propagation-delay analysis mode. The current settled state becomes
   * the t=0 initial condition; clocks become exact sim-time event sources.
   * The caller drives time via the returned engine (advanceByPs/microStep).
   */
  beginTimingMode(world, components, wireManager) {
    this.stopTimeLoop();
    this.timing = new TimingEngine(this);
    this.timing.begin(world, components, wireManager);
    return this.timing;
  }

  /**
   * Leave timing mode. The caller should follow with a normal evaluate() +
   * startTimeLoop() (the app's onCircuitChanged does both) so live-mode
   * clocks and the wall-clock loop resume.
   */
  endTimingMode() {
    if (!this.timing) return;
    this.timing.active = false;
    this.timing = null;
  }

  /**
   * Perform one time step of the simulation.
   * Adapts dt based on how much capacitor voltages changed.
   */
  _timeStep() {
    if (!this._steppingWorld || !this._steppingComponents) return;

    // Edge-gated solving: when digital clocks are the only time driver, the
    // circuit is static between clock edges, so the ~100ms MNA solve produces
    // an identical result. Detecting an edge is ~free (a modulo on
    // performance.now()), so skip the solve until a clock actually flips. The
    // loop still fires every 20ms, so edge latency is unchanged (≤ one tick).
    if (this._edgeSkipEligible && !this._clockEdgePending(performance.now() / 1000)) {
      return;
    }

    // Save previous cap voltages before evaluate() updates them
    const prevCapVoltages = new Map();
    for (const comp of this._steppingComponents) {
      if ((comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) && comp.placed) {
        prevCapVoltages.set(comp.id, comp.vPrev);
      }
    }

    this.simTime += this.dt;
    // Between ticks nothing can have edited the circuit (all edit paths run
    // an external evaluate first), so the netlist from the last build is
    // still valid — skip the rebuild for this one call.
    this._netlistReuseOk = true;
    this.evaluate(this._steppingWorld, this._steppingComponents, this._steppingWireManager);

    // Adaptive dt: check max voltage change across any capacitor
    let maxDv = 0;
    for (const comp of this._steppingComponents) {
      if (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR || !comp.placed) continue;
      const oldV = prevCapVoltages.get(comp.id) ?? 0;
      const dv = Math.abs(comp.vPrev - oldV);
      if (dv > maxDv) maxDv = dv;
    }

    // Adjust dt: large changes → shrink, small changes → grow
    if (maxDv > 0.1) {
      this.dt = Math.max(this._dtMin, this.dt * 0.5);
    } else if (maxDv < 0.02) {
      this.dt = Math.min(this._dtMax, this.dt * 1.2);
    }

    if (this._onStepCallback) this._onStepCallback();
  }

  /**
   * Update capacitor vPrev after MNA solve.
   * Clamps the voltage change per step to MAX_CAP_DV so charging is
   * visually gradual the companion model then naturally produces the
   * exponential RC curve over many small steps. When the cap reaches
   * steady state, vPrev converges and the companion model's current
   * source exactly cancels its conductance stamp → zero net DC current.
   */
  _updateCapacitorState(components) {
    const MAX_CAP_DV = 0.25; // max voltage change per step (V)
    for (const comp of components) {
      if (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR || !comp.placed) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      // Isolated caps (no real return path) freeze vPrev no charge can flow.
      if (this._isolatedCaps.has(comp.id)) continue;
      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB) continue;
      const vA = this.netVoltages.get(netA.id) ?? 0;
      const vB = this.netVoltages.get(netB.id) ?? 0;
      const vTarget = vA - vB;
      const delta = vTarget - comp.vPrev;
      // Clamp the per-step change so charging is visible
      if (Math.abs(delta) > MAX_CAP_DV) {
        comp.vPrev += Math.sign(delta) * MAX_CAP_DV;
      } else {
        comp.vPrev = vTarget;
      }
    }
  }

  /**
   * Compute current through capacitors: I = C * dV/dt
   */
  _computeCapacitorCurrents(components) {
    for (const comp of components) {
      if (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR || !comp.placed) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      // Isolated caps carry no current; also skips the spurious dV spike when
      // the post-processed floating-terminal voltage first appears.
      if (this._isolatedCaps.has(comp.id)) { this.componentCurrents.set(comp.id, 0); continue; }
      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB) { this.componentCurrents.set(comp.id, 0); continue; }
      const vA = this.netVoltages.get(netA.id) ?? 0;
      const vB = this.netVoltages.get(netB.id) ?? 0;
      const vCap = vA - vB;
      const dv = vCap - comp.vPrev;
      let I = this.dt > 0 ? Math.abs(comp.capacitance * dv / this.dt) : 0;
      if (comp.type === COMP.POLARIZED_CAPACITOR) {
        const G_leak = comp.vPrev < POL_CAP_REV_THRESH ? POL_CAP_G_LEAK_REV : POL_CAP_G_LEAK_FWD;
        I += Math.abs(G_leak * vCap);
      }
      this.componentCurrents.set(comp.id, I);
    }
  }

  /**
   * Companion-model conductance for an inductor at the current time step:
   * G_eq = dt / L_eff, with L_eff = L × IND_L_SCALE (see constants above).
   * Capped at IND_G_MAX so a tiny inductance can't wreck matrix conditioning.
   */
  _inductorGeq(comp) {
    const dtSafe = this.dt > 0 ? this.dt : 0.05;
    return Math.min(dtSafe / ((comp.inductance || 10e-3) * IND_L_SCALE), IND_G_MAX);
  }

  /**
   * Update inductor iPrev after MNA solve — the dual of _updateCapacitorState.
   * Each step the stored current integrates di = G_eq · V_solved, clamped to
   * MAX_IND_DI so current ramps are visually gradual. At steady state the
   * voltage across the coil converges to ~0 and iPrev holds constant: the
   * coil is then a wire carrying a steady current, which is correct DC
   * behaviour, with no net contribution from the companion stamp.
   */
  _updateInductorState(components) {
    for (const comp of components) {
      if (comp.type !== COMP.INDUCTOR || !comp.placed) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      // Unplaced legs or both legs in the same net: no branch, no stored current.
      if (!netA || !netB || netA.id === netB.id) { comp.iPrev = 0; continue; }
      const vA = this.netVoltages.get(netA.id);
      const vB = this.netVoltages.get(netB.id);
      // Unsolved nets (e.g. the circuit has no GND reference, so the MNA
      // never ran): there is no real loop to integrate — don't invent current.
      if (vA === undefined || vB === undefined) { comp.iPrev = 0; continue; }
      const vL = vA - vB;
      let delta = this._inductorGeq(comp) * vL;
      if (Math.abs(delta) > MAX_IND_DI) delta = Math.sign(delta) * MAX_IND_DI;
      // Flyback/freewheel decay floor: when the coil voltage opposes the
      // stored current (drive removed, current dying through a diode or the
      // internal loss path), a large L_eff can make G_eq·vL imperceptibly
      // small — e.g. freewheeling through just a diode's ~0.8V. Enforce a
      // minimum decay rate so the stored energy drains in a few seconds,
      // and stop exactly at zero rather than integrating past it.
      const opposing = comp.iPrev !== 0 && Math.sign(vL) !== Math.sign(comp.iPrev) && Math.abs(vL) > 0.3;
      if (opposing && Math.abs(delta) < IND_DECAY_FLOOR) {
        delta = Math.sign(vL) * IND_DECAY_FLOOR;
      }
      const next = comp.iPrev + delta;
      comp.iPrev = (opposing && next !== 0 && Math.sign(next) === Math.sign(vL)) ? 0 : next;
    }
  }

  /**
   * Compute current through inductors. The branch current as stamped in the
   * last solve is the stored current plus the companion-conductance and
   * internal-loss terms; at DC steady state (V across ≈ 0) it is just iPrev.
   */
  _computeInductorCurrents(components) {
    for (const comp of components) {
      if (comp.type !== COMP.INDUCTOR || !comp.placed) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB || netA.id === netB.id) { this.componentCurrents.set(comp.id, 0); continue; }
      const vA = this.netVoltages.get(netA.id);
      const vB = this.netVoltages.get(netB.id);
      if (vA === undefined || vB === undefined) { this.componentCurrents.set(comp.id, 0); continue; }
      const I = comp.iPrev + (this._inductorGeq(comp) + IND_G_LOSS) * (vA - vB);
      this.componentCurrents.set(comp.id, Math.abs(I));
    }
  }

  // ── MNA Solver ────────────────────────────────────────────────────────────
  // Norton-equivalent nodal analysis: chip outputs modelled with finite
  // output impedance (CHIP_R_OUT), supporting push pull, high-Z, and
  // open collector drive states.

  _solveMNA(nodes, components) {
    // Map nodes to MNA node indices.
    // GND nodes → reference node 0 (excluded from matrix).
    // All other nodes → 1..N
    const gndNodes = new Set();
    const nonGndNodes = [];
    for (const net of nodes) {
      if (net.isGND) gndNodes.add(net.id);
      else nonGndNodes.push(net);
    }
    // No GND reference cannot solve; leave all voltages as-is
    if (gndNodes.size === 0) return;

    const N = nonGndNodes.length;
    if (N === 0) return;

    // Grow the persistent scratch buffers to fit this circuit (grow-only;
    // a shrinking circuit just uses a slice of the allocation).
    if (this._mnaScratchN < N) {
      this._mnaScratchA = new Float64Array(N * N);
      this._mnaScratchZ = new Float64Array(N);
      this._mnaScratchN = N; // recorded last: a failed allocation must not claim capacity
    }

    // The capacitor-isolation analysis inside buildAndSolve exists only to
    // classify caps; on cap-free circuits its graph build + BFS + pruning is
    // pure overhead (and used to run twice per solve). Detect once here.
    let circuitHasCaps = false;
    for (const comp of components) {
      if (comp.placed && (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR)) {
        circuitHasCaps = true;
        break;
      }
    }

    // netId → node index (1-based; 0 = GND reference)
    const nodeMap = new Map();
    for (const netId of gndNodes) nodeMap.set(netId, 0);
    for (let i = 0; i < N; i++) nodeMap.set(nonGndNodes[i].id, i + 1);

    // VCC nodes use Norton model (5V / 2.5Ω)
    const G_VCC_INT = 1 / VCC_R_INT;
    const I_VCC_NORTON = VCC_VOLTAGE * G_VCC_INT;
    const vccNodeIndices = [];
    for (const net of nonGndNodes) {
      if (net.isVCC) vccNodeIndices.push(nodeMap.get(net.id));
    }

    // ── Collect chip drive states per net ──────────────────────────────────
    // Group drive states by net so we can handle multiple drivers on the same net.
    // PUSH_PULL → Norton source (V/R_OUT from pin to GND)
    // SINK_ONLY → Conductance 1/R_OUT from pin's net to GND (pulls low)
    // HIGH_Z → skip (pin not connected)
    // R_OUT comes from each driving chip's own family (per-chip override allowed).
    const netDrives = new Map(); // netId → [{type, voltage, nodeIdx, comp}]
    for (const ds of this.pinDriveStates.values()) {
      const pin = ds.comp.getPinByName(ds.pinName);
      if (!pin) continue;
      const net = this.netlist.findNetByHole(pin.holeId);
      if (!net) continue;
      const ni = nodeMap.get(net.id);
      if (ni === undefined) continue;
      if (!netDrives.has(net.id)) netDrives.set(net.id, []);
      netDrives.get(net.id).push({ type: ds.type, voltage: ds.voltage, rOut: ds.rOut ?? null, nodeIdx: ni, comp: ds.comp });
    }

    // ── Build set of chip input pins that have no active driver on their net ─
    // These get a weak TTL pull up (100kΩ to VCC).
    const drivenNodes = new Set();
    // Nodes with VCC/GND are already driven
    for (const net of nodes) {
      if (net.isVCC || net.isGND) drivenNodes.add(net.id);
    }
    // Nodes with any chip output drive (even HiZ from a specific pin doesn't count as driven)
    for (const [netId, drives] of netDrives) {
      for (const d of drives) {
        if (d.type !== DRIVE.HIGH_Z) { drivenNodes.add(netId); break; }
      }
    }
    // Nodes with a resistor connection to a driven net are indirectly driven
    // (handled by MNA naturally pull up resistor to VCC net creates a path)

    // Build set of pin keys that have a drive state (even HiZ).
    // These are chip-managed output pins and should NOT get TTL pull ups,
    // even if the pin is typed 'input' (e.g. bidirectional transceiver pins).
    const drivenPinKeys = new Set();
    for (const ds of this.pinDriveStates.values()) {
      drivenPinKeys.add(ds.comp.id + ':' + ds.pinName);
    }

    // Collect chip input pin nodes for TTL weak pull up.
    // Each entry carries the owning chip so per-chip family overrides can apply
    // their own TTL_PULLUP value (CMOS families have no pull-up).
    const ttlPullUpNodes = []; // [{ nodeIdx, comp }]
    const ttlPullUpSeen = new Set(); // nodeIdx dedupe
    for (const comp of components) {
      if (comp.type !== COMP.CHIP || !comp.placed || !comp.chipDef) continue;
      for (const pin of comp.pins) {
        if (pin.type !== 'input') continue;
        // Skip pins that have a drive state (chip is managing them as outputs)
        if (drivenPinKeys.has(comp.id + ':' + pin.name)) continue;
        const net = this.netlist.findNetByHole(pin.holeId);
        if (!net) continue;
        if (!drivenNodes.has(net.id)) {
          const ni = nodeMap.get(net.id);
          if (ni !== undefined && ni > 0 && !ttlPullUpSeen.has(ni)) {
            ttlPullUpSeen.add(ni);
            ttlPullUpNodes.push({ nodeIdx: ni, comp });
          }
        }
      }
    }

    // Record floating nets (TTL pull up only, no real driver) for UI display
    this.floatingNets = new Set();
    for (const { nodeIdx } of ttlPullUpNodes) {
      this.floatingNets.add(nonGndNodes[nodeIdx - 1].id);
    }

    // ── Pre-collect LED network info for the two-pass diode model ─────────
    // We need to know which LEDs are forward-biased before injecting the VF
    // Norton current, to avoid bootstrapping isolated floating nodes to VF.
    const ledNetInfos = [];
    for (const comp of components) {
      if (!comp.placed || comp.type !== COMP.LED) continue;
      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB || netA.id === netB.id) continue;
      const ni = nodeMap.get(netA.id);
      const nj = nodeMap.get(netB.id);
      if (ni === undefined || nj === undefined) continue;
      ledNetInfos.push({ comp, ni, nj });
    }

    // ── Pre-collect Diode network info (same two-pass model as LEDs) ──────
    const diodeNetInfos = [];
    for (const comp of components) {
      if (!comp.placed || comp.type !== COMP.DIODE) continue;
      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB || netA.id === netB.id) continue;
      const ni = nodeMap.get(netA.id);
      const nj = nodeMap.get(netB.id);
      if (ni === undefined || nj === undefined) continue;
      diodeNetInfos.push({ comp, ni, nj });
    }

    // ── Pre-collect 7-segment internal segment-LED info ───────────────────
    // Each placed 7-seg has up to 8 segment LEDs (a-g, dp) between segment pin
    // and common pin. Stamped in the MNA the same way as discrete LEDs so that
    // constant-current segment drivers (74x143) and push-pull drivers both yield
    // sensible segment-pin voltages instead of the solver hitting 0.015/1e-9 ≈ 15 MV
    // on an otherwise-isolated net.
    const segLedNetInfos = [];
    for (const comp of components) {
      if (!comp.placed || comp.type !== COMP.SEVEN_SEG) continue;
      const com1Net = this.netlist.findNetByPin(comp, 'COM1');
      const com2Net = this.netlist.findNetByPin(comp, 'COM2');
      const comNet = com1Net || com2Net;
      if (!comNet) continue;
      const niCom = nodeMap.get(comNet.id);
      if (niCom === undefined) continue;
      for (const segName of ['a','b','c','d','e','f','g','dp']) {
        const segNet = this.netlist.findNetByPin(comp, segName);
        if (!segNet || segNet.id === comNet.id) continue;
        const niSeg = nodeMap.get(segNet.id);
        if (niSeg === undefined) continue;
        // Orient anode → cathode by display polarity
        const anodeIdx   = comp.commonAnode ? niCom : niSeg;
        const cathodeIdx = comp.commonAnode ? niSeg : niCom;
        const anodeNetId   = comp.commonAnode ? comNet.id : segNet.id;
        const cathodeNetId = comp.commonAnode ? segNet.id : comNet.id;
        segLedNetInfos.push({
          id: comp.id + ':' + segName,
          ni: anodeIdx,
          nj: cathodeIdx,
          anodeNetId,
          cathodeNetId,
        });
      }
    }

    // Build and solve the MNA matrix, given the set of LED ids that are
    // currently considered forward-biased (and therefore get the VF Norton stamp).
    // Called twice:
    //   Pass 0 conductingLEDs is empty → plain resistors, no VF Norton →
    //            reveals which LEDs have a positive voltage across them.
    //   Pass 1 conductingLEDs filled from pass-0 results → VF Norton applied
    //            only to actually forward-biased LEDs.
    // forceStampCaps: pass 0 stamps every cap (using its stored vPrev) even if
    // the isolation analysis would otherwise skip it. This lets a cap's own
    // stored charge forward-bias an LED/diode whose conduction is the cap's only
    // discharge path, so that conduction is detected here and pass 1's isolation
    // analysis then sees the LED edge and correctly keeps the cap connected.
    // Without it a cap that can only discharge through an LED is mis-classified
    // as permanently isolated (frozen) → "cap never discharges" bug.
    const buildAndSolve = (conductingLEDs, conductingDiodes, conductingSegLeds = new Set(), recordFloating = false, forceStampCaps = false) => {
      // Flat row-major N×N matrix in the persistent scratch buffer:
      // entry (i,j) lives at A[i * N + j]. One contiguous allocation is far
      // kinder to the CPU cache than an array of row objects, and reusing it
      // avoids ~1MB of allocation per solve. The solver works in place and
      // destroys A/z, which is fine — every solve rebuilds them from zero.
      const A = this._mnaScratchA;
      A.fill(0, 0, N * N);
      const z = this._mnaScratchZ;
      z.fill(0, 0, N);

      // Stamp conductance G between nodes ni and nj (1-based; 0=GND skip)
      const stampG = (ni, nj, G) => {
        if (ni > 0) A[(ni - 1) * N + (ni - 1)] += G;
        if (nj > 0) A[(nj - 1) * N + (nj - 1)] += G;
        if (ni > 0 && nj > 0) {
          A[(ni - 1) * N + (nj - 1)] -= G;
          A[(nj - 1) * N + (ni - 1)] -= G;
        }
      };

      // ── Identify OC pull-up nets (HiZ open-collector outputs get 4.7kΩ to VCC) ─
      // Hoisted from the stamping loop below so the cap-isolation analysis can
      // also use these as DC seeds: a HiZ OC output net has a real path to VCC
      // through the implicit 4.7kΩ pull-up, so it can sink current for a cap.
      const ocPullUpNetIds = [];
      for (const comp of components) {
        if (comp.type !== COMP.CHIP || !comp.placed || !comp.chipDef) continue;
        if (!comp.chipDef.openCollector) continue;
        for (const pin of comp.pins) {
          // Outputs *and* bidirectional bus pins (e.g. OC bus transceivers)
          // both need the implicit pull-up when driven HiZ.
          if (pin.type !== 'output' && pin.type !== 'io' && pin.type !== 'bidir') continue;
          const ds = this.pinDriveStates.get(comp.id + ':' + pin.name);
          if (!ds || ds.type !== DRIVE.HIGH_Z) continue;
          const net = this.netlist.findNetByHole(pin.holeId);
          if (!net) continue;
          ocPullUpNetIds.push(net.id);
        }
      }

      // ── Cap-isolation analysis ───────────────────────────────────────────
      // Classify each capacitor as stampable or isolated. A cap is isolated
      // when one of its terminals has no real DC return path: electrons can't
      // flow onto a plate that has nowhere to source/sink charge through the
      // rest of the circuit. Without this gate, the universal 1e-9 leak below
      // acts as a phantom 1GΩ return-to-ground that slowly charges any cap to
      // its driven terminal's voltage which is unphysical.
      //
      // Algorithm:
      //   1. Build undirected graph: edges are resistors, closed switches,
      //      forward-biased LEDs/diodes, AND caps themselves (so caps in
      //      series can share charge via their floating midpoint).
      //   2. BFS from seeds (VCC, GND, active drives, TTL/OC pull-ups) into
      //      the graph → set `reachable`.
      //   3. Iteratively prune non-seed nets with degree ≤ 1 from `reachable`:
      //      a dead-end net cannot carry current (no return path).
      //   4. A cap is isolated iff one of its terminals was pruned.
      const isolatedCapIds = new Set();
      const alive = new Set();
      // No caps → nothing to classify: isolatedCapIds stays empty and the
      // `alive` set is only consumed by the isolated-cap post-processing,
      // which also never runs. Skip the whole graph analysis.
      if (circuitHasCaps) {
        const seeds = new Set();
        for (const net of nodes) {
          if (net.isVCC || net.isGND) seeds.add(net.id);
        }
        for (const [netId, drives] of netDrives) {
          for (const d of drives) {
            if (d.type !== DRIVE.HIGH_Z) { seeds.add(netId); break; }
          }
        }
        for (const { nodeIdx, comp } of ttlPullUpNodes) {
          if (this._specFor(comp).TTL_PULLUP !== null) {
            seeds.add(nonGndNodes[nodeIdx - 1].id);
          }
        }
        for (const netId of ocPullUpNetIds) seeds.add(netId);

        // Multigraph: adj maps node → (neighbor → parallel-edge count), and
        // deg tracks each node's TOTAL incident edge count (with multiplicity).
        // Counting multiplicity matters for the dead-end prune below: a node
        // tied to the same neighbor by two separate elements (e.g. a bleed
        // resistor AND a capacitor both from a node to GND — a textbook RC
        // discharge) can carry current (in one element, out the other), so it is
        // NOT a dead end. A plain Set would collapse those parallel edges to one
        // neighbor, mis-count the degree as 1, prune the node, and wrongly
        // isolate the cap so it never discharges.
        const adj = new Map();
        const deg = new Map();
        const addEdge = (a, b) => {
          if (a === b) return;
          if (!adj.has(a)) adj.set(a, new Map());
          if (!adj.has(b)) adj.set(b, new Map());
          adj.get(a).set(b, (adj.get(a).get(b) || 0) + 1);
          adj.get(b).set(a, (adj.get(b).get(a) || 0) + 1);
          deg.set(a, (deg.get(a) || 0) + 1);
          deg.set(b, (deg.get(b) || 0) + 1);
        };
        for (const comp of components) {
          if (!comp.placed || comp.type !== COMP.RESISTOR) continue;
          const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
          const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
          if (netA && netB) addEdge(netA.id, netB.id);
        }
        for (const pair of this.netlist.conductingPairs) {
          const netA = this.netlist.findNetByHole(pair.holeA);
          const netB = this.netlist.findNetByHole(pair.holeB);
          if (netA && netB) addEdge(netA.id, netB.id);
        }
        for (const info of ledNetInfos) {
          if (!conductingLEDs.has(info.comp.id)) continue;
          const netA = this.netlist.findNetByHole(info.comp.pins[0].holeId);
          const netB = this.netlist.findNetByHole(info.comp.pins[1].holeId);
          if (netA && netB) addEdge(netA.id, netB.id);
        }
        for (const info of diodeNetInfos) {
          if (!conductingDiodes.has(info.comp.id)) continue;
          const netA = this.netlist.findNetByHole(info.comp.pins[0].holeId);
          const netB = this.netlist.findNetByHole(info.comp.pins[1].holeId);
          if (netA && netB) addEdge(netA.id, netB.id);
        }
        for (const info of segLedNetInfos) {
          if (!conductingSegLeds.has(info.id)) continue;
          addEdge(info.anodeNetId, info.cathodeNetId);
        }
        // Inductors: a coil is a near-wire path, and its built-in parallel
        // loss path is a second parallel element — added as a second edge so
        // the multigraph degree count never sees a coil terminal as a
        // prunable dead end (current can circulate through the internal
        // freewheel loop during flyback, exactly like the parallel
        // bleed-resistor + cap case described above).
        for (const comp of components) {
          if (!comp.placed || comp.type !== COMP.INDUCTOR) continue;
          if (!comp.pins || comp.pins.length < 2) continue;
          const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
          const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
          if (netA && netB && netA.id !== netB.id) {
            addEdge(netA.id, netB.id);
            addEdge(netA.id, netB.id);
          }
        }
        const capEdges = [];
        for (const comp of components) {
          if (!comp.placed) continue;
          if (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR) continue;
          if (!comp.pins || comp.pins.length < 2) continue;
          const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
          const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
          if (!netA || !netB || netA.id === netB.id) continue;
          addEdge(netA.id, netB.id);
          capEdges.push({ compId: comp.id, a: netA.id, b: netB.id });
        }

        // BFS from seeds (reachability uses neighbor identity, not multiplicity)
        const queue = [];
        for (const s of seeds) { alive.add(s); queue.push(s); }
        while (queue.length > 0) {
          const cur = queue.shift();
          const nbrs = adj.get(cur);
          if (!nbrs) continue;
          for (const nb of nbrs.keys()) {
            if (!alive.has(nb)) { alive.add(nb); queue.push(nb); }
          }
        }

        // Iterative pruning of non-seed dead-ends. A node with ≤1 incident edge
        // (counting parallel elements) can't carry steady current → prune it and
        // ripple the degree decrement to its neighbours.
        const pruneQ = [];
        for (const n of alive) {
          if (seeds.has(n)) continue;
          if ((deg.get(n) || 0) <= 1) pruneQ.push(n);
        }
        while (pruneQ.length > 0) {
          const n = pruneQ.shift();
          if (!alive.has(n) || seeds.has(n)) continue;
          if ((deg.get(n) || 0) > 1) continue;
          alive.delete(n);
          const nbrs = adj.get(n);
          if (nbrs) {
            for (const [nb, mult] of nbrs) {
              const nbMap = adj.get(nb);
              if (nbMap) nbMap.delete(n);
              deg.set(nb, (deg.get(nb) || 0) - mult); // drop all parallel edges to n
              if (!seeds.has(nb) && alive.has(nb) && (deg.get(nb) || 0) <= 1) {
                pruneQ.push(nb);
              }
            }
            adj.delete(n);
          }
          deg.delete(n);
        }

        for (const cap of capEdges) {
          if (!alive.has(cap.a) || !alive.has(cap.b)) isolatedCapIds.add(cap.compId);
        }
      }

      // Stamp resistors
      for (const comp of components) {
        if (!comp.placed || comp.type !== COMP.RESISTOR) continue;
        const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
        const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!netA || !netB || netA.id === netB.id) continue;
        const ni = nodeMap.get(netA.id);
        const nj = nodeMap.get(netB.id);
        if (ni === undefined || nj === undefined) continue;
        stampG(ni, nj, 1 / (comp.resistance || 1000));
      }

      // Stamp chip-controlled couplings: bilateral switches and closed
      // analog-mux channels appear here as a conductance between two pins
      // on the same chip. Voltage propagates through the MNA naturally, so
      // analog levels survive (rather than being snapped to a digital rail).
      for (const { comp, pinA, pinB, resistance } of this.chipCouplings.values()) {
        const pA = comp.getPinByName(pinA);
        const pB = comp.getPinByName(pinB);
        if (!pA || !pB) continue;
        const netA = this.netlist.findNetByHole(pA.holeId);
        const netB = this.netlist.findNetByHole(pB.holeId);
        if (!netA || !netB || netA.id === netB.id) continue;
        const ni = nodeMap.get(netA.id);
        const nj = nodeMap.get(netB.id);
        if (ni === undefined || nj === undefined) continue;
        stampG(ni, nj, 1 / (resistance || 200));
      }

      // Stamp closed switches/pressed buttons as low-resistance conductors.
      // Keeping the two sides as distinct nets means voltage propagates here
      // (via MNA) but VCC/GND identity does not a closed switch does not
      // make its output side behave as a power rail.
      const G_SWITCH_CLOSED = 100; // 0.01Ω effectively ideal wire
      for (const pair of this.netlist.conductingPairs) {
        const netA = this.netlist.findNetByHole(pair.holeA);
        const netB = this.netlist.findNetByHole(pair.holeB);
        if (!netA || !netB || netA.id === netB.id) continue;
        const ni = nodeMap.get(netA.id);
        const nj = nodeMap.get(netB.id);
        if (ni === undefined || nj === undefined) continue;
        stampG(ni, nj, G_SWITCH_CLOSED);
      }

      // Stamp capacitors backward Euler companion model:
      //   G_eq = C / dt  (equivalent conductance)
      //   I_eq = G_eq * V_prev  (equivalent current source from previous voltage)
      // This models the capacitor as a resistor (1/G_eq) in parallel with a
      // current source, which is the standard MNA transient companion model.
      // At DC steady state the current source exactly cancels G_eq's current
      // draw, so no net DC current flows the cap naturally blocks DC.
      // The visible charging transient is enforced by clamping vPrev changes
      // per step in _updateCapacitorState, not by switching MNA modes.
      // Caps in isolatedCapIds (no real return path on at least one terminal)
      // are skipped entirely they behave as open circuits and keep vPrev.
      const dtSafe = this.dt > 0 ? this.dt : 0.05;
      for (const comp of components) {
        if (!comp.placed || (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR)) continue;
        if (!comp.pins || comp.pins.length < 2) continue;
        if (!forceStampCaps && isolatedCapIds.has(comp.id)) continue;
        const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
        const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!netA || !netB || netA.id === netB.id) continue;
        const ni = nodeMap.get(netA.id);
        const nj = nodeMap.get(netB.id);
        if (ni === undefined || nj === undefined) continue;
        const G_eq = (comp.capacitance || 100e-6) / dtSafe;
        stampG(ni, nj, G_eq);
        // Current source representing stored charge: I_eq = G_eq * V_prev
        const I_eq = G_eq * comp.vPrev;
        if (ni > 0) z[ni - 1] += I_eq;
        if (nj > 0) z[nj - 1] -= I_eq;
        // Polarized cap leakage path: small forward leakage, large reverse-bias
        // leakage. Lagged on vPrev to keep the per-step MNA linear.
        if (comp.type === COMP.POLARIZED_CAPACITOR) {
          const G_leak = comp.vPrev < POL_CAP_REV_THRESH ? POL_CAP_G_LEAK_REV : POL_CAP_G_LEAK_FWD;
          stampG(ni, nj, G_leak);
        }
      }

      // Stamp inductors backward-Euler companion model, the dual of the caps:
      //   G_eq = dt / L_eff  (equivalent conductance)
      //   I_eq = iPrev       (current source carrying the stored current A→B)
      // Branch current out of node A = G_eq·(vA−vB) + iPrev, so the known
      // iPrev term moves to the RHS: −iPrev at A, +iPrev at B. At steady
      // state the solve drives V across the coil to ~0 and the branch passes
      // exactly iPrev — a wire carrying a steady current, correct DC physics.
      // Each coil also stamps its built-in parallel loss path (IND_G_LOSS):
      // when the external current path breaks (switch opens), iPrev has a
      // bounded place to go, producing a finite flyback spike of about
      // iPrev·IND_R_LOSS instead of iPrev/1e-9 gigavolts through the leak.
      // Inductors are stamped in BOTH passes, so a flyback spike in pass 0
      // forward-biases any freewheel diode and pass 1 clamps to ~0.7V.
      for (const comp of components) {
        if (!comp.placed || comp.type !== COMP.INDUCTOR) continue;
        if (!comp.pins || comp.pins.length < 2) continue;
        const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
        const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!netA || !netB || netA.id === netB.id) continue;
        const ni = nodeMap.get(netA.id);
        const nj = nodeMap.get(netB.id);
        if (ni === undefined || nj === undefined) continue;
        stampG(ni, nj, this._inductorGeq(comp) + IND_G_LOSS);
        if (ni > 0) z[ni - 1] -= comp.iPrev;
        if (nj > 0) z[nj - 1] += comp.iPrev;
      }

      // Stamp LEDs two-pass piecewise-linear diode model:
      //   conducting  → G_LED (1/33Ω bulk) + VF Norton current offset
      //   non-conducting → LED_G_OFF (≈1MΩ) for numerical stability, not a current path
      const G_LED = 1 / LED_R_INTERNAL;
      for (const { comp, ni, nj } of ledNetInfos) {
        if (conductingLEDs.has(comp.id)) {
          stampG(ni, nj, G_LED);
          // Norton current for VF offset (injects into anode, removes from cathode)
          const I_N = LED_VF * G_LED;
          if (ni > 0) z[ni - 1] += I_N;
          if (nj > 0) z[nj - 1] -= I_N;
        } else {
          stampG(ni, nj, LED_G_OFF); // off-state: near-open circuit, not a resistor path
        }
      }

      // Stamp diodes same two-pass piecewise-linear model as LEDs
      const G_DIODE = 1 / DIODE_R_INTERNAL;
      for (const { comp, ni, nj } of diodeNetInfos) {
        if (conductingDiodes.has(comp.id)) {
          stampG(ni, nj, G_DIODE);
          const I_N = DIODE_VF * G_DIODE;
          if (ni > 0) z[ni - 1] += I_N;
          if (nj > 0) z[nj - 1] -= I_N;
        } else {
          stampG(ni, nj, DIODE_G_OFF);
        }
      }

      // Stamp 7-seg segment LEDs same model as discrete LEDs
      for (const { id, ni, nj } of segLedNetInfos) {
        if (conductingSegLeds.has(id)) {
          stampG(ni, nj, G_LED);
          const I_N = LED_VF * G_LED;
          if (ni > 0) z[ni - 1] += I_N;
          if (nj > 0) z[nj - 1] -= I_N;
        } else {
          stampG(ni, nj, LED_G_OFF);
        }
      }

      // Norton stamp for VCC nodes (G=0.4S, I=2A → Thevenin 5V/2.5Ω)
      for (const ni of vccNodeIndices) {
        if (ni > 0) { A[(ni - 1) * N + (ni - 1)] += G_VCC_INT; z[ni - 1] += I_VCC_NORTON; }
      }

      // ── Stamp chip output drive states using Norton equivalents ──────────
      // R_OUT is taken from each driving chip's own family so per-chip family
      // overrides actually affect drive strength.
      for (const [, drives] of netDrives) {
        for (const d of drives) {
          const ni = d.nodeIdx;
          if (ni <= 0) continue;  // GND node skip
          const G_OUT_D = 1 / (d.rOut ?? this._specFor(d.comp).R_OUT);
          if (d.type === DRIVE.PUSH_PULL) {
            // Norton equivalent: current source I = V/R_OUT, conductance G = 1/R_OUT
            A[(ni - 1) * N + (ni - 1)] += G_OUT_D;
            z[ni - 1] += d.voltage * G_OUT_D;
          } else if (d.type === DRIVE.SINK_ONLY) {
            // Open collector sinking: conductance to GND
            A[(ni - 1) * N + (ni - 1)] += G_OUT_D;
          } else if (d.type === DRIVE.CURRENT_SOURCE) {
            // Ideal current source: inject I, no conductance term (infinite output impedance).
            // .voltage field overloaded to hold amps for CS mode.
            z[ni - 1] += d.voltage;
          }
          // HIGH_Z: do nothing pin disconnected
        }
      }

      // ── Stamp TTL input weak pull ups to VCC (family dependent) ─────────
      // 74LS (TTL): floating inputs get a weak pull up so they default HIGH.
      // 74HC / 74HCT (CMOS): undriven inputs are truly indeterminate no
      // pull up is applied, so the node stays floating and warnings flag it.
      // Each input uses its own chip's family so per-chip overrides apply.
      for (const { nodeIdx, comp } of ttlPullUpNodes) {
        const sp = this._specFor(comp);
        if (sp.TTL_PULLUP === null) continue;
        const G_TTL_PU = 1 / sp.TTL_PULLUP;
        const I_TTL_PU = VCC_VOLTAGE * G_TTL_PU;
        A[(nodeIdx - 1) * N + (nodeIdx - 1)] += G_TTL_PU;
        z[nodeIdx - 1] += I_TTL_PU;
      }

      // ── Stamp open collector pull ups to VCC ────────────────────────────
      // OC outputs in HiZ (gate HIGH) get an implicit 4.7kΩ pull up.
      // ocPullUpNetIds was hoisted above the cap-isolation analysis so both
      // paths see the same set of HiZ OC outputs.
      const OC_PULLUP_R = 4700;
      const G_OC_PU = 1 / OC_PULLUP_R;
      const I_OC_PU = VCC_VOLTAGE * G_OC_PU;
      for (const netId of ocPullUpNetIds) {
        const ni = nodeMap.get(netId);
        if (ni !== undefined && ni > 0) {
          A[(ni - 1) * N + (ni - 1)] += G_OC_PU;
          z[ni - 1] += I_OC_PU;
        }
      }

      // Detect truly floating nodes (no real conductance before leak is added).
      // Any node whose diagonal entry is effectively zero has no resistor, LED,
      // Norton source, or pull up connecting it it is electrically floating.
      if (recordFloating) {
        for (let i = 0; i < N; i++) {
          if (A[i * N + i] < 1e-10) this.floatingNets.add(nonGndNodes[i].id);
        }
      }

      // Leak conductance on every node to prevent singular matrix for floating nodes
      for (let i = 0; i < N; i++) A[i * N + i] += 1e-9;

      const x = _gaussSolve(A, z, N);
      return { x, isolatedCapIds, alive };
    };

    // Pass 0: all LEDs/diodes as plain resistors (no VF Norton) find forward-biased ones.
    // forceStampCaps=true so a charged cap drives its node here and any LED it
    // forward-biases is detected as conducting (see buildAndSolve comment).
    const pass0 = buildAndSolve(new Set(), new Set(), new Set(), false, true);
    if (!pass0.x) return;
    const x0 = pass0.x;

    // Determine which LEDs are forward-biased from pass-0 voltages
    const conductingLEDs = new Set();
    for (const { comp, ni, nj } of ledNetInfos) {
      const vA = ni > 0 ? x0[ni - 1] : 0;
      const vC = nj > 0 ? x0[nj - 1] : 0;
      if (vA - vC > 1e-6) conductingLEDs.add(comp.id);
    }

    // Determine which diodes are forward-biased from pass-0 voltages
    const conductingDiodes = new Set();
    for (const { comp, ni, nj } of diodeNetInfos) {
      const vA = ni > 0 ? x0[ni - 1] : 0;
      const vC = nj > 0 ? x0[nj - 1] : 0;
      if (vA - vC > 1e-6) conductingDiodes.add(comp.id);
    }

    // Determine which 7-seg segment LEDs are forward-biased
    const conductingSegLeds = new Set();
    for (const { id, ni, nj } of segLedNetInfos) {
      const vA = ni > 0 ? x0[ni - 1] : 0;
      const vC = nj > 0 ? x0[nj - 1] : 0;
      if (vA - vC > 1e-6) conductingSegLeds.add(id);
    }

    // Pass 1: final solve with VF Norton only for forward-biased LEDs/diodes/segments
    const pass1 = buildAndSolve(conductingLEDs, conductingDiodes, conductingSegLeds, true);
    if (!pass1.x) return;
    const x = pass1.x;
    this._isolatedCaps = pass1.isolatedCapIds;

    // ── Floating-terminal voltage post-processing ────────────────────────
    // Cosmetic only: mutates x[] for display, not used downstream of the
    // writeback below. For caps where one terminal was pruned (no return
    // path), the floating terminal otherwise reads ~0V via the 1e-9 leak
    // which is misleading on a probe. Set it to driven_V - vPrev so the
    // probe shows both leads at the same potential when vPrev is frozen
    // at 0 matching the physical picture of an open-circuit cap.
    for (const comp of components) {
      if (!this._isolatedCaps.has(comp.id)) continue;
      if (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR) continue;
      if (!comp.pins || comp.pins.length < 2) continue;
      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB) continue;
      const aAlive = pass1.alive.has(netA.id);
      const bAlive = pass1.alive.has(netB.id);
      if (aAlive === bAlive) continue;  // both alive (shouldn't happen for isolated) or both dead (no reference)
      const niA = nodeMap.get(netA.id);
      const niB = nodeMap.get(netB.id);
      // vPrev = V(netA) - V(netB)
      if (aAlive) {
        // netB floating: V(netB) = V(netA) - vPrev
        const vA_solved = niA > 0 ? x[niA - 1] : 0;
        if (niB > 0) x[niB - 1] = vA_solved - comp.vPrev;
      } else {
        // netA floating: V(netA) = V(netB) + vPrev
        const vB_solved = niB > 0 ? x[niB - 1] : 0;
        if (niA > 0) x[niA - 1] = vB_solved + comp.vPrev;
      }
    }

    // Write back: GND nodes → 0V, others → solved voltage
    for (const netId of gndNodes) this.netVoltages.set(netId, 0);
    for (let i = 0; i < N; i++) this.netVoltages.set(nonGndNodes[i].id, x[i]);
  }

  // ── Chip evaluation ───────────────────────────────────────────────────────

  _readPinBit(comp, pinName, options = {}) {
    const pin = comp.getPinByName(pinName);
    if (!pin) return 0;
    const net = this.netlist.findNetByHole(pin.holeId);
    if (!net) return 0;
    const v = this.netVoltages.get(net.id);
    const bit = (v !== undefined && v > this._specFor(comp).VTH) ? 1 : 0;
    return options.invert ? (bit ? 0 : 1) : bit;
  }

  /** Read the raw analog voltage on a pin's net (0 5V). Returns null if unconnected/floating. */
  _readPinVoltage(comp, pinName) {
    const pin = comp.getPinByName(pinName);
    if (!pin) return null;
    const net = this.netlist.findNetByHole(pin.holeId);
    if (!net) return null;
    if (this.floatingNets.has(net.id)) {
      // Allow reading the actual MNA voltage when passive components (R, C) are
      // connected to this net RC timing networks produce real analog voltages
      // even when no chip output drives the net directly (e.g. 555 timer RC circuits).
      const hasPassive = net.pins.some(p =>
        p.comp.type === COMP.RESISTOR ||
        p.comp.type === COMP.CAPACITOR ||
        p.comp.type === COMP.POLARIZED_CAPACITOR ||
        p.comp.type === COMP.INDUCTOR ||
        p.comp.type === COMP.DIODE
      );
      if (!hasPassive) return null;
    }
    const v = this.netVoltages.get(net.id);
    return v !== undefined ? v : null;
  }

  _readGateInputs(comp, inputPinNames) {
    return inputPinNames.map(pinName => this._readPinBit(comp, pinName));
  }

  /**
   * Read a Schmitt-trigger input bit with hysteresis.
   *
   * Real Schmitt inputs have two switching thresholds: V_T+ (rising) and V_T-
   * (falling). The latched output bit only transitions when the input crosses
   * the *opposite* threshold from the current latched state.
   *
   * Voltage source, in order of preference:
   *   1. A capacitor directly on the input net — use its vPrev (oriented).
   *   2. A capacitor one resistor-hop away from the input net — use that
   *      cap's vPrev (oriented to the resistor-neighbor side). This handles
   *      the "feedback resistor between output and input, cap on the output
   *      net to GND" topology, which is electrically a valid 7414 RC
   *      oscillator but puts the cap on a different net than the input pin.
   *   3. Fallback: the MNA-solved net voltage (used for Schmitt inputs
   *      with no nearby cap — e.g. pure digital noise cleanup).
   *
   * Why prefer the cap over the MNA node voltage: at typical simulator dt
   * (1–50 ms) the cap's MNA companion stamp (G = C/dt) is far weaker than
   * the output driver path through the feedback resistor, so the MNA node
   * voltage would follow the output, not the cap, and the oscillator could
   * never swing. Reading the cap voltage directly matches what a real
   * Schmitt input sees, since real Schmitt inputs are ~MΩ and the cap *is*
   * the node.
   *
   * Per-input latched state is stored on `comp.schmittState` (lazy init).
   */
  _readSchmittBit(comp, pinName) {
    if (!comp.schmittState) comp.schmittState = {};
    let state = comp.schmittState[pinName] | 0;

    const pin = comp.getPinByName(pinName);
    if (!pin) return state;
    const net = this.netlist.findNetByHole(pin.holeId);
    if (!net) return state;

    // Orient cap voltage to the plate that sits on `searchNet`.
    // vPrev = V(pins[0]) − V(pins[1]); the plate-on-searchNet's potential
    // is vPrev + V(other) if it's pins[0], or V(other) − vPrev if it's pins[1].
    const capVoltageOnNet = (p, c) => {
      if (!c.pins || c.pins.length < 2) return null;
      const onPin0 = (p.pin === c.pins[0]);
      const otherHole = onPin0 ? c.pins[1].holeId : c.pins[0].holeId;
      const otherNet = this.netlist.findNetByHole(otherHole);
      const vOther = otherNet ? (this.netVoltages.get(otherNet.id) ?? 0) : 0;
      return onPin0 ? (c.vPrev + vOther) : (vOther - c.vPrev);
    };

    let v = null;

    // Stage A: capacitor directly on the input net.
    for (const p of net.pins) {
      const c = p.comp;
      if (!c.placed) continue;
      if (c.type !== COMP.CAPACITOR && c.type !== COMP.POLARIZED_CAPACITOR) continue;
      v = capVoltageOnNet(p, c);
      if (v !== null) break;
    }

    // Stage B: capacitor one resistor-hop away. Resistors are net-boundary
    // 2-pin components (see netlist.js), so the resistor's other pin is on
    // a different net we can scan.
    if (v === null) {
      for (const p of net.pins) {
        const r = p.comp;
        if (!r.placed) continue;
        if (r.type !== COMP.RESISTOR) continue;
        if (!r.pins || r.pins.length < 2) continue;
        const otherHole = (p.pin === r.pins[0]) ? r.pins[1].holeId : r.pins[0].holeId;
        const neighborNet = this.netlist.findNetByHole(otherHole);
        if (!neighborNet) continue;
        for (const np of neighborNet.pins) {
          const c = np.comp;
          if (!c.placed) continue;
          if (c.type !== COMP.CAPACITOR && c.type !== COMP.POLARIZED_CAPACITOR) continue;
          v = capVoltageOnNet(np, c);
          if (v !== null) break;
        }
        if (v !== null) break;
      }
    }

    if (v === null) {
      const nv = this.netVoltages.get(net.id);
      if (nv === undefined) {
        comp.schmittState[pinName] = state;
        return state;
      }
      v = nv;
    }

    const sp = this._specFor(comp);
    const VTp = sp.VT_PLUS ?? (sp.VTH + 0.3);
    const VTm = sp.VT_MINUS ?? (sp.VTH - 0.3);

    if (state === 0 && v > VTp) state = 1;
    else if (state === 1 && v < VTm) state = 0;

    comp.schmittState[pinName] = state;
    return state;
  }

  _drivePinBit(comp, pinName, bit) {
    return this._drivePin(comp, pinName, DRIVE.PUSH_PULL, bit ? VCC_VOLTAGE : 0);
  }

  /** Record a drive state for a chip output pin.
   *  rOut (Ω, optional) overrides the family output impedance for this pin —
   *  used by power devices (ULN2003 Darlington sink, LM7805 regulator) that
   *  drive much harder than a logic output. */
  _drivePin(comp, pinName, driveType, voltage, rOut = null) {
    // Timing-analysis mode: schedule the output change at now + tPD instead
    // of applying it (transport-delay model). This one interception delays
    // every chip in the library — see js/timing.js.
    if (this.timing && this.timing.active) {
      return this.timing.scheduleDrive(comp, pinName, driveType, voltage, rOut);
    }
    const key = comp.id + ':' + pinName;
    const prev = this.pinDriveStates.get(key);
    if (prev && prev.type === driveType && prev.voltage === voltage && (prev.rOut ?? null) === rOut) return false;
    this.pinDriveStates.set(key, { type: driveType, voltage, rOut, comp, pinName });
    return true;
  }

  /** Mark a pin as high-impedance (disconnected). */
  _drivePinHighZ(comp, pinName) {
    return this._drivePin(comp, pinName, DRIVE.HIGH_Z, 0);
  }

  /**
   * Couple two pins on the same chip through a fixed resistance. Used by
   * bilateral switches and closed analog-mux channels. Sticky: stays set
   * until _uncoupleChipPins is called, so evaluators must re-assert or clear
   * on every pass.
   */
  _coupleChipPins(comp, gateKey, pinA, pinB, resistance) {
    const key = comp.id + ':' + gateKey;
    const prev = this.chipCouplings.get(key);
    if (prev && prev.pinA === pinA && prev.pinB === pinB && prev.resistance === resistance) return false;
    this.chipCouplings.set(key, { comp, pinA, pinB, resistance });
    return true;
  }

  _uncoupleChipPins(comp, gateKey) {
    const key = comp.id + ':' + gateKey;
    if (!this.chipCouplings.has(key)) return false;
    this.chipCouplings.delete(key);
    return true;
  }

  /**
   * Drop all retained drive states and pin couplings for deleted components.
   * pinDriveStates persists across evaluate() calls by design (feedback nets
   * need warm-start voltages), so every path that removes components MUST
   * call this — otherwise the orphan keeps stamping voltage at its old hole
   * positions and a replacement chip placed in the same spot fights it
   * through the MNA (contested nets read ~2.5–3 V). Same story for
   * chipCouplings: a deleted bilateral switch would otherwise leave a
   * phantom resistive bridge between its old pins.
   */
  purgeComponentStates(compIds) {
    for (const [key, ds] of this.pinDriveStates) {
      if (compIds.has(ds.comp.id)) this.pinDriveStates.delete(key);
    }
    for (const [key, cpl] of this.chipCouplings) {
      if (compIds.has(cpl.comp.id)) this.chipCouplings.delete(key);
    }
  }

  /** Mark a pin as open collector sinking (pulls to GND through output impedance). */
  _drivePinSink(comp, pinName) {
    return this._drivePin(comp, pinName, DRIVE.SINK_ONLY, 0);
  }

  /** Drive a pin as an ideal current source (injects `amps` into the net regardless of voltage). */
  _drivePinCurrentSource(comp, pinName, amps) {
    return this._drivePin(comp, pinName, DRIVE.CURRENT_SOURCE, amps);
  }

  _drivePinBits(comp, pinNames, bits) {
    let changed = false;
    for (let i = 0; i < pinNames.length; i++) {
      if (this._drivePinBit(comp, pinNames[i], bits[i])) changed = true;
    }
    return changed;
  }

  /** Drive multiple pins as high-Z */
  _drivePinsHighZ(comp, pinNames) {
    let changed = false;
    for (const pinName of pinNames) {
      if (this._drivePinHighZ(comp, pinName)) changed = true;
    }
    return changed;
  }

  /** Drive open collector pins: bit=1 (off) → HIGH_Z, bit=0 (sinking) → SINK_ONLY */
  _drivePinOC(comp, pinName, bit) {
    if (bit) {
      return this._drivePinHighZ(comp, pinName);
    } else {
      return this._drivePinSink(comp, pinName);
    }
  }

  _drivePinBitsOC(comp, pinNames, bits) {
    let changed = false;
    for (let i = 0; i < pinNames.length; i++) {
      if (this._drivePinOC(comp, pinNames[i], bits[i])) changed = true;
    }
    return changed;
  }

  _getSeqState(comp, key, initialState) {
    let state = comp.ffState.get(key);
    if (!state) {
      state = { ...initialState };
      comp.ffState.set(key, state);
    }
    return state;
  }

  _getRamState(comp) {
    if (!comp.ramState) {
      comp.ramState = {
        words: Array.from({ length: 16 }, () => [0, 0, 0, 0]),
      };
    }
    return comp.ramState;
  }

  _nextJKState(currentQ, jBit, kBit) {
    if (jBit === 0 && kBit === 0) return currentQ;
    if (jBit === 0 && kBit === 1) return 0;
    if (jBit === 1 && kBit === 0) return 1;
    return currentQ ? 0 : 1;
  }

  _evaluateJKGate(comp, { jPins, kPins, clkPin, prePin = null, clrPin = null, outputs, triggerEdge = 'rising', preClrActiveHigh = false }) {
    const jBit = jPins.every(pinName => this._readPinBit(comp, pinName, { invert: pinName.endsWith('n') }) === 1) ? 1 : 0;
    const kBit = kPins.every(pinName => this._readPinBit(comp, pinName, { invert: pinName.endsWith('n') }) === 1) ? 1 : 0;
    const clkBit = this._readPinBit(comp, clkPin);
    const preBit = prePin ? this._readPinBit(comp, prePin) : (preClrActiveHigh ? 0 : 1);
    const clrBit = clrPin ? this._readPinBit(comp, clrPin) : (preClrActiveHigh ? 0 : 1);
    const [qName, qnName] = outputs;
    const state = this._getSeqState(comp, qName, { q: 0, prevClk: 0 });
    const edgeTriggered = triggerEdge === 'falling'
      ? (clkBit === 0 && state.prevClk === 1)
      : (clkBit === 1 && state.prevClk === 0);

    const clrActive = preClrActiveHigh ? (clrBit === 1) : (clrBit === 0);
    const preActive = preClrActiveHigh ? (preBit === 1) : (preBit === 0);
    if (clrActive) {
      state.q = 0;
    } else if (prePin && preActive) {
      state.q = 1;
    } else if (edgeTriggered) {
      state.q = this._nextJKState(state.q, jBit, kBit);
    }

    state.prevClk = clkBit;
    return this._drivePinBits(comp, [qName, qnName], [state.q, state.q ? 0 : 1]);
  }


  // ── Net current computation ─────────────────────────────────────────────

  _computeNetCurrents(components) {
    // For each net, find the max current from any component touching it
    this.netCurrents.clear();
    const addNetCurrent = (netId, current) => {
      const existing = this.netCurrents.get(netId) || 0;
      if (current > existing) this.netCurrents.set(netId, current);
    };

    for (const comp of components) {
      if (!comp.placed) continue;
      if (comp.type === COMP.RESISTOR) {
        const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
        const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!netA || !netB) continue;
        const vA = this.netVoltages.get(netA.id);
        const vB = this.netVoltages.get(netB.id);
        if (vA !== undefined && vB !== undefined) {
          const I = Math.abs(vA - vB) / (comp.resistance || 1000);
          addNetCurrent(netA.id, I);
          addNetCurrent(netB.id, I);
        }
      } else if (comp.type === COMP.LED) {
        const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
        const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!netA || !netB) continue;
        const vA = this.netVoltages.get(netA.id);
        const vB = this.netVoltages.get(netB.id);
        if (vA !== undefined && vB !== undefined && vA > vB) {
          const dV = vA - vB;
          const I = dV > LED_VF ? (dV - LED_VF) / LED_R_INTERNAL : 0;
          addNetCurrent(netA.id, I);
          addNetCurrent(netB.id, I);
        }
      } else if (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR || comp.type === COMP.INDUCTOR) {
        const I = this.componentCurrents.get(comp.id) || 0;
        if (I > 0) {
          const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
          const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
          if (netA) addNetCurrent(netA.id, I);
          if (netB) addNetCurrent(netB.id, I);
        }
      } else if (comp.type === COMP.DIODE) {
        const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
        const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!netA || !netB) continue;
        const vA = this.netVoltages.get(netA.id);
        const vB = this.netVoltages.get(netB.id);
        if (vA !== undefined && vB !== undefined && vA > vB) {
          const dV = vA - vB;
          const I = dV > DIODE_VF ? (dV - DIODE_VF) / DIODE_R_INTERNAL : 0;
          addNetCurrent(netA.id, I);
          addNetCurrent(netB.id, I);
        }
      }
    }
  }

  // ── Resistor current computation ──────────────────────────────────────────

  _computeResistorCurrents(components) {
    for (const comp of components) {
      if (comp.type !== COMP.RESISTOR || !comp.placed) continue;

      const netA = this.netlist.findNetByHole(comp.pins[0].holeId);
      const netB = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!netA || !netB) { this.componentCurrents.set(comp.id, 0); continue; }

      const vA = this.netVoltages.get(netA.id);
      const vB = this.netVoltages.get(netB.id);

      if (vA !== undefined && vB !== undefined) {
        const dV = Math.abs(vA - vB);
        const R = comp.resistance || 1000;
        this.componentCurrents.set(comp.id, dV / R); // amps
      } else {
        this.componentCurrents.set(comp.id, 0);
      }
    }
  }

  // ── LED evaluation ────────────────────────────────────────────────────────

  _evaluateLEDs(components) {
    for (const comp of components) {
      if (comp.type !== COMP.LED || !comp.placed) continue;

      const anodeNet = this.netlist.findNetByHole(comp.pins[0].holeId);
      const cathodeNet = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!anodeNet || !cathodeNet) {
        comp.lit = false; comp.brightness = 0; comp.overdrive = false;
        continue;
      }

      const vAnode = this.netVoltages.get(anodeNet.id);
      const vCathode = this.netVoltages.get(cathodeNet.id);

      if (vAnode !== undefined && vCathode !== undefined) {
        const dV = vAnode - vCathode;
        // Current through LED: (V_anode − V_cathode − VF) / R_internal
        // (VF is now modelled in MNA, so net dV ≈ VF + I·R)
        const iLed = dV > LED_VF ? (dV - LED_VF) / LED_R_INTERNAL : 0;
        const b = Math.min(1, Math.max(0, (iLed - LED_I_KNEE) / (LED_I_RATED - LED_I_KNEE)));
        comp.brightness = b;
        comp.overdrive  = iLed > LED_I_BURNOUT;
        // Boolean preserved for callers in main.js / onramp.js that read .lit directly.
        comp.lit = b > 0.05;
        this.componentCurrents.set(comp.id, iLed);
      } else {
        comp.lit = false;
        comp.brightness = 0;
        comp.overdrive = false;
        this.componentCurrents.set(comp.id, 0);
      }
    }
  }

  // ── Diode current computation ─────────────────────────────────────────────

  _computeDiodeCurrents(components) {
    for (const comp of components) {
      if (comp.type !== COMP.DIODE || !comp.placed) continue;

      const anodeNet = this.netlist.findNetByHole(comp.pins[0].holeId);
      const cathodeNet = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!anodeNet || !cathodeNet) { this.componentCurrents.set(comp.id, 0); continue; }

      const vAnode = this.netVoltages.get(anodeNet.id);
      const vCathode = this.netVoltages.get(cathodeNet.id);

      if (vAnode !== undefined && vCathode !== undefined) {
        const dV = vAnode - vCathode;
        const iDiode = dV > DIODE_VF ? (dV - DIODE_VF) / DIODE_R_INTERNAL : 0;
        this.componentCurrents.set(comp.id, iDiode);
      } else {
        this.componentCurrents.set(comp.id, 0);
      }
    }
  }

  // ── 7 segment evaluation ──────────────────────────────────────────────────

  _evaluateSevenSegs(components) {
    for (const comp of components) {
      if (comp.type !== COMP.SEVEN_SEG || !comp.placed) continue;

      // Check common pins treat floating nets as unconnected
      const com1Net = this.netlist.findNetByPin(comp, 'COM1');
      const com2Net = this.netlist.findNetByPin(comp, 'COM2');
      const com1Floating = !com1Net || this.floatingNets.has(com1Net.id);
      const com2Floating = !com2Net || this.floatingNets.has(com2Net.id);
      const comV1 = com1Floating ? undefined : this.netVoltages.get(com1Net.id);
      const comV2 = com2Floating ? undefined : this.netVoltages.get(com2Net.id);
      // Use whichever common pin is connected (non-floating)
      const comV = comV1 !== undefined ? comV1 : comV2;

      const segNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
      for (const seg of segNames) {
        const segNet = this.netlist.findNetByPin(comp, seg);
        const segFloating = !segNet || this.floatingNets.has(segNet.id);
        if (segFloating) {
          comp.segments[seg] = 0;
          comp.segmentBrightness[seg] = 0;
          comp.segmentOverdrive[seg] = false;
          continue;
        }
        const segV = this.netVoltages.get(segNet.id);

        if (comV !== undefined && segV !== undefined) {
          // Treat each segment as an LED between common and segment pin. Conduction
          // direction follows display polarity. Segment LEDs are stamped into the
          // MNA (segLedNetInfos in _solveMNA), so the solved pin voltages already
          // reflect the diode model; the same (V−VF)/R formula as _evaluateLEDs
          // recovers the segment current from those voltages.
          const dV = comp.commonAnode ? (comV - segV) : (segV - comV);
          const iSeg = dV > LED_VF ? (dV - LED_VF) / LED_R_INTERNAL : 0;
          const b = Math.min(1, Math.max(0, (iSeg - LED_I_KNEE) / (SEG_I_RATED - LED_I_KNEE)));
          comp.segments[seg] = iSeg > LED_I_KNEE ? 1 : 0;
          comp.segmentBrightness[seg] = b;
          comp.segmentOverdrive[seg] = iSeg > LED_I_BURNOUT;
        } else {
          comp.segments[seg] = 0;
          comp.segmentBrightness[seg] = 0;
          comp.segmentOverdrive[seg] = false;
        }
      }
    }
  }

  // ── Public query helpers ──────────────────────────────────────────────────

  getNetVoltage(netId) {
    return this.netVoltages.get(netId);
  }

  getComponentCurrent(compId) {
    return this.componentCurrents.get(compId) || 0;
  }

  hasShortCircuit() {
    return this.shortCircuits.length > 0;
  }

  // Union-find over nets connected by conducting pairs (closed switches,
  // pressed buttons, slide-switch active position). Any resulting class
  // containing both a VCC-tagged net and a GND-tagged net is a short   every
  // member net joins shortCircuits and every conducting component on a bridge
  // joins shortCircuitComponents (for canvas highlight). Resistors are
  // deliberately excluded: in MNA mode they have real resistance, and in
  // digital mode the user spec already treats VCC-through-R-to-GND as a
  // GND-wins resolution rather than an error.
  _detectConductingPairShorts(nodes) {
    if (this.netlist.conductingPairs.length === 0) return;

    const parent = new Map();
    for (const net of nodes) parent.set(net.id, net.id);
    const find = (x) => {
      let r = x;
      while (parent.get(r) !== r) r = parent.get(r);
      while (parent.get(x) !== r) {
        const nx = parent.get(x);
        parent.set(x, r);
        x = nx;
      }
      return r;
    };

    for (const pair of this.netlist.conductingPairs) {
      const a = this.netlist.findNetByHole(pair.holeA);
      const b = this.netlist.findNetByHole(pair.holeB);
      if (!a || !b) continue;
      const ra = find(a.id), rb = find(b.id);
      if (ra !== rb) parent.set(ra, rb);
    }

    const classInfo = new Map(); // root → { vcc, gnd, members: [netId] }
    for (const net of nodes) {
      const root = find(net.id);
      let info = classInfo.get(root);
      if (!info) { info = { vcc: false, gnd: false, members: [] }; classInfo.set(root, info); }
      if (net.isVCC) info.vcc = true;
      if (net.isGND) info.gnd = true;
      info.members.push(net.id);
    }

    const shortRoots = new Set();
    for (const [root, info] of classInfo) {
      if (info.vcc && info.gnd) {
        shortRoots.add(root);
        for (const id of info.members) {
          if (!this.shortCircuits.includes(id)) this.shortCircuits.push(id);
        }
      }
    }
    if (shortRoots.size === 0) return;

    for (const pair of this.netlist.conductingPairs) {
      const a = this.netlist.findNetByHole(pair.holeA);
      if (!a) continue;
      if (shortRoots.has(find(a.id))) {
        this.shortCircuitComponents.add(pair.comp.id);
      }
    }
  }

  /**
   * Returns a map of wire net number → 'VCC' | 'GND' | null
   * based on actual simulation data (not just direct rail connections).
   */
  buildPowerNetMap() {
    const map = new Map(); // wireNetNum is not the same as our net id...
    // Instead, provide a holeId-based lookup
    return this.netVoltages;
  }

  /**
   * Check if a net (by hole) is powered (voltage above family switching threshold)
   */
  isNetPowered(holeId) {
    const net = this.netlist.findNetByHole(holeId);
    if (!net) return false;
    const v = this.netVoltages.get(net.id);
    return v !== undefined && v > this._spec.VTH;
  }

  /**
   * Check if a net (by hole) is at VCC
   */
  isNetVCC(holeId) {
    const net = this.netlist.findNetByHole(holeId);
    if (!net) return false;
    const v = this.netVoltages.get(net.id);
    return v !== undefined && v >= VCC_VOLTAGE - 0.1;
  }

  /**
   * Get voltage at a hole. Returns number or undefined if floating.
   */
  getVoltageAtHole(holeId) {
    const net = this.netlist.findNetByHole(holeId);
    if (!net) return undefined;
    return this.netVoltages.get(net.id);
  }

  /**
   * Get current at a hole's net. Returns amps or 0.
   */
  getCurrentAtHole(holeId) {
    const net = this.netlist.findNetByHole(holeId);
    if (!net) return 0;
    return this.netCurrents.get(net.id) || 0;
  }

  // ── Chips16 gate evaluators ──────────────────────────────────────────────
}

Object.assign(CircuitSimulator.prototype, chipEvaluators);

// Gaussian elimination with partial pivoting on a flat row-major matrix
// (entry (i,j) at M[i*n+j]). Solves IN PLACE — M and b are destroyed — which
// is fine because every caller rebuilds them from zero before each solve.
//
// The one performance-critical line is the zero-factor skip: MNA matrices
// from breadboard circuits are ~99% empty (most nets couple only to GND via
// their driver, so off-diagonals are rare), and a row whose entry under the
// pivot is exactly 0.0 is left untouched by that elimination step. Skipping
// it is exact arithmetic (factor would be 0), so results are bit-for-bit
// identical to the dense version — measured 4–30× faster on large circuits.
function _gaussSolve(M, b, n) {
  // Forward elimination
  for (let col = 0; col < n; col++) {
    const colBase = col * n;

    // Partial pivoting: find row with largest absolute value in column
    let maxVal = Math.abs(M[colBase + col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      const v = Math.abs(M[row * n + col]);
      if (v > maxVal) { maxVal = v; maxRow = row; }
    }
    if (maxVal < 1e-14) return null; // singular matrix

    // Swap rows if needed. Only columns ≥ col matter: entries left of the
    // pivot column are never read again by elimination or back-substitution.
    if (maxRow !== col) {
      const maxBase = maxRow * n;
      for (let j = col; j < n; j++) {
        const t = M[colBase + j]; M[colBase + j] = M[maxBase + j]; M[maxBase + j] = t;
      }
      const tmpB = b[col]; b[col] = b[maxRow]; b[maxRow] = tmpB;
    }

    // Eliminate below pivot
    const pivot = M[colBase + col];
    for (let row = col + 1; row < n; row++) {
      const rowBase = row * n;
      const mrc = M[rowBase + col];
      if (mrc === 0) continue; // zero-factor skip: row untouched by this pivot
      const factor = mrc / pivot;
      for (let j = col; j < n; j++) {
        M[rowBase + j] -= factor * M[colBase + j];
      }
      b[row] -= factor * b[col];
    }
  }

  // Back substitution
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    const base = i * n;
    let sum = b[i];
    for (let j = i + 1; j < n; j++) {
      sum -= M[base + j] * x[j];
    }
    x[i] = sum / M[base + i];
  }
  return x;
}

