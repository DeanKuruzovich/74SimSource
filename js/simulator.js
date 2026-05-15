// ── Circuit Simulator ────────────────────────────────────────────────────────
// Evaluates the circuit after every change: computes net voltages (numbers),
// component currents, lights LEDs, drives 7-segment displays.
// Uses the component-boundary-aware Netlist.
//
// Model:
//   - VCC rails = 5V, GND rails = 0V
//   - Chip gates: outputs modelled with finite output impedance (CHIP_R_OUT)
//     via Norton equivalents in MNA, supporting push-pull, high-Z, and
//     open-collector (sink-only) drive states.
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

const VCC_VOLTAGE = 5;
const VCC_R_INT = 2.5;        // internal resistance → 2A short-circuit limit
const LED_VF = 2.0;          // LED forward voltage drop (V)
const LED_R_INTERNAL = 33;   // LED bulk resistance (Ω) above Vf realistic ~20mA with 150Ω series
const LED_G_OFF = 1e-6;      // LED off-state conductance (S) ≈ 1MΩ near-zero leakage below Vf
const DIODE_VF = 0.7;        // Silicon diode forward voltage drop (V)
const DIODE_R_INTERNAL = 10; // Diode bulk resistance (Ω) above Vf small-signal 1N4148
const DIODE_G_OFF = 1e-6;    // Diode reverse-bias conductance (S) ≈ 1MΩ near-zero leakage
const POL_CAP_G_LEAK_FWD = 1e-7;  // Polarized cap forward leakage (S) ≈ 10MΩ healthy electrolytic
const POL_CAP_G_LEAK_REV = 1e-3;  // Polarized cap reverse-bias leakage (S) ≈ 1kΩ leaky/failing path
const POL_CAP_REV_THRESH = -0.3;  // V   vCap below this is considered reverse-biased

export class CircuitSimulator {
  constructor() {
    this.netlist = new Netlist();
    this.netVoltages = new Map();        // netId → voltage (number, volts)
    this.componentCurrents = new Map();  // compId → current (number, amps)
    this.netCurrents = new Map();        // netId → max current (amps) on that net
    this.shortCircuits = [];             // [netId, ...]
    this.shortCircuitComponents = new Set(); // compIds bridging VCC↔GND via 0Ω path
    this.pinDriveStates = new Map();     // "compId:pinName" → { type: DRIVE.*, voltage: number }
    this.floatingNets = new Set();       // netIds with only TTL pull up (no real driver)

    // ── Time-domain state ─────────────────────────────────────────────────
    this.simTime = 0;                    // current simulation time (seconds)
    this.dt = 0.05;                      // time step (seconds), target 50ms
    this._dtMin = 0.001;                 // minimum time step (1ms)
    this._dtMax = 0.05;                  // maximum time step (50ms)
    this._simLoopId = null;              // setInterval id for time-stepping
    this._hasCapacitors = false;         // true when circuit contains capacitors
    this._hasClocks = false;             // true when circuit contains clock components
    this._steppingWorld = null;          // cached references for time-step loop
    this._steppingComponents = null;
    this._steppingWireManager = null;
    this._onStepCallback = null;         // called after each time step (for UI refresh)

    // ── Pure Digital mode ─────────────────────────────────────────────────
    // When true, _solveDigital() replaces _solveMNA() and the analog engine
    // is bypassed entirely nets resolve to 0V or 5V via union-find on
    // shorting passives + directional flood fill through LEDs/diodes.
    // Resistance values, LED forward voltages, and current are ignored.
    this.pureDigital = false;
    this._digitalReachesGND = new Set();  // Set<netId> populated by _solveDigital

    // ── 74 series family (affects thresholds, drive, pull ups) ──────────────
    this.family = DEFAULT_FAMILY;
    this._spec = getFamilySpec(this.family);

    // Incremented after every evaluate() and every time step the renderer
    // uses this to detect when the simPowerNodes cache needs rebuilding.
    this.simVersion = 0;
  }

  setFamily(key) {
    this.family = key;
    this._spec = getFamilySpec(key);
  }

  /**
   * Run a full simulation pass. Call after every circuit change.
   * Mutates component state (LED.lit, SevenSeg.segments).
   */
  evaluate(world, components, wireManager) {
    // 1. Build netlist (component-boundary-aware)
    const nodes = this.netlist.build(world, components, wireManager);

    this.netVoltages.clear();
    this.componentCurrents.clear();
    this.netCurrents.clear();
    this.shortCircuits = [];
    this.shortCircuitComponents.clear();
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

    // Drive clock outputs based on real wall-clock time before the initial MNA
    const _clockNow = performance.now() / 1000;
    for (const comp of components) {
      if (comp.type !== COMP.CLOCK || !comp.placed) continue;
      const hz = Math.max(0.001, comp.frequencyHz);
      const period = 1 / hz;
      comp.high = (_clockNow % period) < (period / 2);
      this._drivePinBit(comp, 'OUT', comp.high ? 1 : 0);
    }

    if (this.pureDigital) this._solveDigital(nodes, components);
    else                  this._solveMNA(nodes, components);
    for (let iter = 0; iter < 30; iter++) {
      let changed = false;
      for (const comp of components) {
        if (comp.type !== COMP.CHIP || !comp.placed || !comp.chipDef) continue;
        if (this._evaluateChip(comp)) changed = true;
      }

      // Re-solve with current drive states to get up-to-date net voltages
      if (this.pureDigital) this._solveDigital(nodes, components);
      else                  this._solveMNA(nodes, components);

      // Always run at least 2 iterations: the first iteration may read stale
      // voltages from the initial MNA (before any chip drove outputs), and
      // sequential chips need a second pass to see corrected voltages.
      if (!changed && iter > 0) break;
    }

    // 4. Compute currents for resistors, capacitors, diodes, and net current map
    this._computeResistorCurrents(components);
    this._computeCapacitorCurrents(components);
    this._computeDiodeCurrents(components);
    this._computeNetCurrents(components);

    // 5. Evaluate LEDs
    this._evaluateLEDs(components);

    // 6. Evaluate 7-segment displays
    this._evaluateSevenSegs(components);

    // 7. Update capacitor time-domain state (vPrev) for next step
    this._updateCapacitorState(components);

    // Track whether circuit has capacitors or clocks (for time-stepping loop)
    this._hasCapacitors = components.some(c => (c.type === COMP.CAPACITOR || c.type === COMP.POLARIZED_CAPACITOR) && c.placed);
    this._hasClocks = components.some(c => c.type === COMP.CLOCK && c.placed);
    this.simVersion++;
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

    if (!this._hasCapacitors && !this._hasClocks) return;

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

  /**
   * Perform one time step of the simulation.
   * Adapts dt based on how much capacitor voltages changed.
   */
  _timeStep() {
    if (!this._steppingWorld || !this._steppingComponents) return;

    // Save previous cap voltages before evaluate() updates them
    const prevCapVoltages = new Map();
    for (const comp of this._steppingComponents) {
      if ((comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) && comp.placed) {
        prevCapVoltages.set(comp.id, comp.vPrev);
      }
    }

    this.simTime += this.dt;
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

  // ── MNA Solver ────────────────────────────────────────────────────────────
  // Norton-equivalent nodal analysis: chip outputs modelled with finite
  // output impedance (CHIP_R_OUT), supporting push-pull, high-Z, and
  // open-collector drive states.

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
    const G_OUT = 1 / this._spec.R_OUT;                 // output conductance (family dependent)
    const netDrives = new Map(); // netId → [{type, voltage}]
    for (const ds of this.pinDriveStates.values()) {
      const pin = ds.comp.getPinByName(ds.pinName);
      if (!pin) continue;
      const net = this.netlist.findNetByHole(pin.holeId);
      if (!net) continue;
      const ni = nodeMap.get(net.id);
      if (ni === undefined) continue;
      if (!netDrives.has(net.id)) netDrives.set(net.id, []);
      netDrives.get(net.id).push({ type: ds.type, voltage: ds.voltage, nodeIdx: ni });
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

    // Collect chip input pin nodes for TTL weak pull up
    const ttlPullUpNodes = new Set();
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
          if (ni !== undefined && ni > 0) ttlPullUpNodes.add(ni);
        }
      }
    }

    // Record floating nets (TTL pull up only, no real driver) for UI display
    this.floatingNets = new Set();
    for (const ni of ttlPullUpNodes) {
      this.floatingNets.add(nonGndNodes[ni - 1].id);
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

    // Build and solve the MNA matrix, given the set of LED ids that are
    // currently considered forward-biased (and therefore get the VF Norton stamp).
    // Called twice:
    //   Pass 0 conductingLEDs is empty → plain resistors, no VF Norton →
    //            reveals which LEDs have a positive voltage across them.
    //   Pass 1 conductingLEDs filled from pass-0 results → VF Norton applied
    //            only to actually forward-biased LEDs.
    const buildAndSolve = (conductingLEDs, conductingDiodes, recordFloating = false) => {
      const A = new Array(N);
      for (let i = 0; i < N; i++) A[i] = new Float64Array(N);
      const z = new Float64Array(N);

      // Stamp conductance G between nodes ni and nj (1-based; 0=GND skip)
      const stampG = (ni, nj, G) => {
        if (ni > 0) A[ni - 1][ni - 1] += G;
        if (nj > 0) A[nj - 1][nj - 1] += G;
        if (ni > 0 && nj > 0) {
          A[ni - 1][nj - 1] -= G;
          A[nj - 1][ni - 1] -= G;
        }
      };

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
      const dtSafe = this.dt > 0 ? this.dt : 0.05;
      for (const comp of components) {
        if (!comp.placed || (comp.type !== COMP.CAPACITOR && comp.type !== COMP.POLARIZED_CAPACITOR)) continue;
        if (!comp.pins || comp.pins.length < 2) continue;
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

      // Norton stamp for VCC nodes (G=0.4S, I=2A → Thevenin 5V/2.5Ω)
      for (const ni of vccNodeIndices) {
        if (ni > 0) { A[ni - 1][ni - 1] += G_VCC_INT; z[ni - 1] += I_VCC_NORTON; }
      }

      // ── Stamp chip output drive states using Norton equivalents ──────────
      for (const [, drives] of netDrives) {
        for (const d of drives) {
          const ni = d.nodeIdx;
          if (ni <= 0) continue;  // GND node skip
          if (d.type === DRIVE.PUSH_PULL) {
            // Norton equivalent: current source I = V/R_OUT, conductance G = 1/R_OUT
            A[ni - 1][ni - 1] += G_OUT;
            z[ni - 1] += d.voltage * G_OUT;
          } else if (d.type === DRIVE.SINK_ONLY) {
            // Open-collector sinking: conductance to GND
            A[ni - 1][ni - 1] += G_OUT;
          }
          // HIGH_Z: do nothing pin disconnected
        }
      }

      // ── Stamp TTL input weak pull ups to VCC (family dependent) ─────────
      // 74LS (TTL): floating inputs get a weak pull up so they default HIGH.
      // 74HC / 74HCT (CMOS): undriven inputs are truly indeterminate no
      // pull up is applied, so the node stays floating and warnings flag it.
      if (this._spec.TTL_PULLUP !== null) {
        const G_TTL_PU = 1 / this._spec.TTL_PULLUP;
        const I_TTL_PU = VCC_VOLTAGE * G_TTL_PU;
        for (const ni of ttlPullUpNodes) {
          A[ni - 1][ni - 1] += G_TTL_PU;
          z[ni - 1] += I_TTL_PU;
        }
      }

      // ── Stamp open-collector pull ups to VCC ────────────────────────────
      // OC outputs in HiZ (gate HIGH) get an implicit 4.7kΩ pull up.
      const OC_PULLUP_R = 4700;
      const G_OC_PU = 1 / OC_PULLUP_R;
      const I_OC_PU = VCC_VOLTAGE * G_OC_PU;
      for (const comp of components) {
        if (comp.type !== COMP.CHIP || !comp.placed || !comp.chipDef) continue;
        if (!comp.chipDef.openCollector) continue;
        for (const pin of comp.pins) {
          if (pin.type !== 'output') continue;
          const key = comp.id + ':' + pin.name;
          const ds = this.pinDriveStates.get(key);
          if (ds && ds.type === DRIVE.HIGH_Z) {
            const net = this.netlist.findNetByHole(pin.holeId);
            if (!net) continue;
            const ni = nodeMap.get(net.id);
            if (ni !== undefined && ni > 0) {
              A[ni - 1][ni - 1] += G_OC_PU;
              z[ni - 1] += I_OC_PU;
            }
          }
        }
      }

      // Detect truly floating nodes (no real conductance before leak is added).
      // Any node whose diagonal entry is effectively zero has no resistor, LED,
      // Norton source, or pull up connecting it it is electrically floating.
      if (recordFloating) {
        for (let i = 0; i < N; i++) {
          if (A[i][i] < 1e-10) this.floatingNets.add(nonGndNodes[i].id);
        }
      }

      // Leak conductance on every node to prevent singular matrix for floating nodes
      for (let i = 0; i < N; i++) A[i][i] += 1e-9;

      return _gaussSolve(A, z, N);
    };

    // Pass 0: all LEDs/diodes as plain resistors (no VF Norton) find forward-biased ones
    const x0 = buildAndSolve(new Set(), new Set(), false);
    if (!x0) return;

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

    // Pass 1: final solve with VF Norton only for forward-biased LEDs/diodes
    const x = buildAndSolve(conductingLEDs, conductingDiodes, true);
    if (!x) return;

    // Write back: GND nodes → 0V, others → solved voltage
    for (const netId of gndNodes) this.netVoltages.set(netId, 0);
    for (let i = 0; i < N; i++) this.netVoltages.set(nonGndNodes[i].id, x[i]);
  }

  // ── Pure Digital solver ───────────────────────────────────────────────────
  // Alternative to _solveMNA(): resolves each net to 0V or 5V by
  //   1. union-find over nets connected by shorting passives (resistors act
  //      as wires; closed switches/buttons are already merged by the netlist).
  //   2. class tagging from rail flags (VCC/GND) and chip drive states.
  //   3. precedence: GND > SINK > VCC > PUSH_PULL('H') > PUSH_PULL('L'/'MIX')
  //      > TTL pull up for classes containing chip pins > floating.
  //   4. backward flood fill from GND through LEDs/diodes → "reachesGND" set.
  //   5. forward flood fill from VCC through the same LED/diode chain →
  //      paints intermediate nets HIGH so a chain VCC→LED→...→LED→GND works.
  _solveDigital(nodes, components) {
    this.floatingNets = new Set();
    // shortCircuits is populated upstream in evaluate() (rail-merge + conducting
    // pair detection). Do not clear here   that would wipe valid pre-solver
    // detections when _solveDigital re-runs inside the iteration loop.

    // 1. Union-find over net ids
    const parent = new Map();
    const find = (x) => {
      let r = x;
      while (parent.get(r) !== r) r = parent.get(r);
      // path compression
      while (parent.get(x) !== r) {
        const nx = parent.get(x);
        parent.set(x, r);
        x = nx;
      }
      return r;
    };
    const union = (a, b) => {
      const ra = find(a), rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    };
    for (const net of nodes) parent.set(net.id, net.id);

    // Resistors short their two endpoints in Pure Digital mode
    for (const comp of components) {
      if (comp.type !== COMP.RESISTOR || !comp.placed) continue;
      const a = this.netlist.findNetByHole(comp.pins[0].holeId);
      const b = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (a && b) union(a.id, b.id);
    }

    // Closed switches / pressed buttons: union their endpoints so voltage and
    // LED-path reachability flow across, same as resistors. Rail identity
    // (net.isVCC / net.isGND) is unaffected that's set at netlist level and
    // stays confined to actual power rails.
    for (const pair of this.netlist.conductingPairs) {
      const a = this.netlist.findNetByHole(pair.holeA);
      const b = this.netlist.findNetByHole(pair.holeB);
      if (a && b) union(a.id, b.id);
    }

    // 2. Per-class tagging
    const classTags = new Map(); // root → { gnd, vcc, sink, push: 'H'|'L'|'MIX'|null, hasChipPin }
    const tagOf = (root) => {
      let t = classTags.get(root);
      if (!t) { t = { gnd: false, vcc: false, sink: false, push: null, hasChipPin: false }; classTags.set(root, t); }
      return t;
    };
    for (const net of nodes) {
      const t = tagOf(find(net.id));
      if (net.isGND) t.gnd = true;
      if (net.isVCC) t.vcc = true;
      for (const { comp } of net.pins) {
        if (comp.type === COMP.CHIP) { t.hasChipPin = true; break; }
      }
    }

    // Drive states from chip outputs
    for (const ds of this.pinDriveStates.values()) {
      if (ds.type === DRIVE.HIGH_Z) continue;
      const pin = ds.comp.getPinByName ? ds.comp.getPinByName(ds.pinName) : null;
      const holeId = pin ? pin.holeId : null;
      const net = holeId ? this.netlist.findNetByHole(holeId) : null;
      if (!net) continue;
      const t = tagOf(find(net.id));
      if (ds.type === DRIVE.SINK_ONLY) {
        t.sink = true;
      } else if (ds.type === DRIVE.PUSH_PULL) {
        const lvl = ds.voltage > this._spec.VTH ? 'H' : 'L';
        if (t.push === null) t.push = lvl;
        else if (t.push !== lvl) t.push = 'MIX';
      }
    }

    // 3. Voltage assignment per class. Precedence from highest to lowest:
    //    GND rail > open-collector sink > push-pull LOW/MIX >
    //    push-pull HIGH > VCC rail (pull up) > TTL floating input pull up >
    //    floating. Active sinks outrank passive pull ups; GND wins all
    //    conflicts silently per the user spec.
    const classVoltage = new Map(); // root → 0 | 5 | undefined (floating)
    for (const [root, t] of classTags) {
      let v;
      if (t.gnd)                                    v = 0;
      else if (t.sink)                              v = 0;
      else if (t.push === 'L' || t.push === 'MIX') v = 0;
      else if (t.push === 'H')                      v = 5;
      else if (t.vcc)                               v = 5;
      else if (t.hasChipPin)                        v = 5;   // TTL weak pull up
      else                                          v = undefined;
      classVoltage.set(root, v);
    }

    // Write voltages; mark floating classes.
    // VCC/GND rail nets were already seeded by evaluate() and must not be
    // overwritten a resistor bridging VCC↔GND would merge their class and
    // (by GND-wins) collapse both rails to 0V otherwise.
    for (const net of nodes) {
      if (net.isVCC || net.isGND) continue;
      const root = find(net.id);
      const v = classVoltage.get(root);
      if (v === undefined) {
        this.floatingNets.add(net.id);
      } else {
        this.netVoltages.set(net.id, v);
      }
    }

    // 4. reachesGND: backward flood fill from GND-tagged classes through
    //    forward-biased LEDs/diodes (cathode→anode direction).
    const reach = new Set();
    for (const net of nodes) {
      if (classTags.get(find(net.id))?.gnd) reach.add(net.id);
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const comp of components) {
        if (!comp.placed) continue;
        if (comp.type !== COMP.LED && comp.type !== COMP.DIODE) continue;
        const a = this.netlist.findNetByHole(comp.pins[0].holeId);
        const k = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!a || !k) continue;
        if (reach.has(k.id) && !reach.has(a.id)) {
          reach.add(a.id);
          changed = true;
        }
      }
    }
    this._digitalReachesGND = reach;

    // 5. forwardFromVCC: paint intermediate nets between VCC and GND (via
    //    LED/diode chains) HIGH, so users see "signal stays HIGH until the
    //    GND terminus" on e.g. 10 LEDs in series.
    const forward = new Set();
    for (const net of nodes) {
      if (classTags.get(find(net.id))?.vcc) forward.add(net.id);
    }
    changed = true;
    while (changed) {
      changed = false;
      for (const comp of components) {
        if (!comp.placed) continue;
        if (comp.type !== COMP.LED && comp.type !== COMP.DIODE) continue;
        const a = this.netlist.findNetByHole(comp.pins[0].holeId);
        const k = this.netlist.findNetByHole(comp.pins[1].holeId);
        if (!a || !k) continue;
        // Only propagate HIGH downstream if the cathode side can reach GND
        // (otherwise it's a dead-end and we'd paint nothing useful).
        if (forward.has(a.id) && reach.has(k.id) && !forward.has(k.id)) {
          forward.add(k.id);
          changed = true;
        }
      }
    }
    for (const netId of forward) {
      const root = find(netId);
      if (classTags.get(root)?.gnd) continue;  // don't overwrite GND
      const cur = this.netVoltages.get(netId);
      if (cur === undefined || cur === 0) {
        this.netVoltages.set(netId, 5);
        this.floatingNets.delete(netId);
      }
    }
  }

  // ── Chip evaluation ───────────────────────────────────────────────────────

  _readPinBit(comp, pinName, options = {}) {
    const pin = comp.getPinByName(pinName);
    if (!pin) return 0;
    const net = this.netlist.findNetByHole(pin.holeId);
    if (!net) return 0;
    const v = this.netVoltages.get(net.id);
    const bit = (v !== undefined && v > this._spec.VTH) ? 1 : 0;
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

  _drivePinBit(comp, pinName, bit) {
    return this._drivePin(comp, pinName, DRIVE.PUSH_PULL, bit ? VCC_VOLTAGE : 0);
  }

  /** Record a drive state for a chip output pin. */
  _drivePin(comp, pinName, driveType, voltage) {
    const key = comp.id + ':' + pinName;
    const prev = this.pinDriveStates.get(key);
    if (prev && prev.type === driveType && prev.voltage === voltage) return false;
    this.pinDriveStates.set(key, { type: driveType, voltage, comp, pinName });
    return true;
  }

  /** Mark a pin as high-impedance (disconnected). */
  _drivePinHighZ(comp, pinName) {
    return this._drivePin(comp, pinName, DRIVE.HIGH_Z, 0);
  }

  /** Mark a pin as open-collector sinking (pulls to GND through output impedance). */
  _drivePinSink(comp, pinName) {
    return this._drivePin(comp, pinName, DRIVE.SINK_ONLY, 0);
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

  /** Drive open-collector pins: bit=1 (off) → HIGH_Z, bit=0 (sinking) → SINK_ONLY */
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

  _evaluateJKGate(comp, { jPins, kPins, clkPin, prePin = null, clrPin = null, outputs, triggerEdge = 'rising' }) {
    const jBit = jPins.every(pinName => this._readPinBit(comp, pinName, { invert: pinName.endsWith('n') }) === 1) ? 1 : 0;
    const kBit = kPins.every(pinName => this._readPinBit(comp, pinName, { invert: pinName.endsWith('n') }) === 1) ? 1 : 0;
    const clkBit = this._readPinBit(comp, clkPin);
    const preBit = prePin ? this._readPinBit(comp, prePin) : 1;
    const clrBit = clrPin ? this._readPinBit(comp, clrPin) : 1;
    const [qName, qnName] = outputs;
    const state = this._getSeqState(comp, qName, { q: 0, prevClk: 0 });
    const edgeTriggered = triggerEdge === 'falling'
      ? (clkBit === 0 && state.prevClk === 1)
      : (clkBit === 1 && state.prevClk === 0);

    if (clrBit === 0) {
      state.q = 0;
    } else if (prePin && preBit === 0) {
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
      } else if (comp.type === COMP.CAPACITOR || comp.type === COMP.POLARIZED_CAPACITOR) {
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
    if (this.pureDigital) { this._evaluateLEDsDigital(components); return; }
    for (const comp of components) {
      if (comp.type !== COMP.LED || !comp.placed) continue;

      const anodeNet = this.netlist.findNetByHole(comp.pins[0].holeId);
      const cathodeNet = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!anodeNet || !cathodeNet) { comp.lit = false; continue; }

      const vAnode = this.netVoltages.get(anodeNet.id);
      const vCathode = this.netVoltages.get(cathodeNet.id);

      if (vAnode !== undefined && vCathode !== undefined) {
        const dV = vAnode - vCathode;
        // Current through LED: (V_anode − V_cathode − VF) / R_internal
        // (VF is now modelled in MNA, so net dV ≈ VF + I·R)
        const iLed = dV > LED_VF ? (dV - LED_VF) / LED_R_INTERNAL : 0;
        // LED is lit only when meaningful current flows (>0.5mA).
        // This prevents false-lit from capacitor steady-state where
        // dV equals VF but actual current is zero.
        comp.lit = iLed > 0.0005;
        this.componentCurrents.set(comp.id, iLed);
      } else {
        comp.lit = false;
        this.componentCurrents.set(comp.id, 0);
      }
    }
  }

  // Pure-digital LED evaluation: lit iff anode net is HIGH AND cathode net
  // has a conducting path to GND (either is GND, or reaches GND through
  // further LEDs/diodes already computed as _digitalReachesGND).
  _evaluateLEDsDigital(components) {
    const reach = this._digitalReachesGND || new Set();
    for (const comp of components) {
      if (comp.type !== COMP.LED || !comp.placed) continue;
      const a = this.netlist.findNetByHole(comp.pins[0].holeId);
      const k = this.netlist.findNetByHole(comp.pins[1].holeId);
      if (!a || !k) { comp.lit = false; this.componentCurrents.set(comp.id, 0); continue; }
      const vA = this.netVoltages.get(a.id);
      const anodeHigh = vA !== undefined && vA > this._spec.VTH;
      comp.lit = anodeHigh && reach.has(k.id);
      this.componentCurrents.set(comp.id, 0);
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

  // ── 7-segment evaluation ──────────────────────────────────────────────────

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
        if (segFloating) { comp.segments[seg] = 0; continue; }
        const segV = this.netVoltages.get(segNet.id);

        if (comV !== undefined && segV !== undefined) {
          const VTH = this._spec.VTH;
          if (comp.commonAnode) {
            // Common anode: segment on when segment pin is LOW and common is HIGH
            comp.segments[seg] = (comV > VTH && segV < VTH) ? 1 : 0;
          } else {
            // Common cathode: segment on when segment pin is HIGH and common is LOW
            comp.segments[seg] = (segV > VTH && comV < VTH) ? 1 : 0;
          }
        } else {
          comp.segments[seg] = 0;
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

function _gaussSolve(A, z, n) {
  // Copy to avoid mutating input
  const M = new Array(n);
  for (let i = 0; i < n; i++) M[i] = Float64Array.from(A[i]);
  const b = Float64Array.from(z);

  // Forward elimination
  for (let col = 0; col < n; col++) {
    // Partial pivoting: find row with largest absolute value in column
    let maxVal = Math.abs(M[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      const v = Math.abs(M[row][col]);
      if (v > maxVal) { maxVal = v; maxRow = row; }
    }
    if (maxVal < 1e-14) return null; // singular matrix

    // Swap rows if needed
    if (maxRow !== col) {
      const tmpRow = M[col]; M[col] = M[maxRow]; M[maxRow] = tmpRow;
      const tmpB = b[col]; b[col] = b[maxRow]; b[maxRow] = tmpB;
    }

    // Eliminate below pivot
    const pivot = M[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / pivot;
      for (let j = col; j < n; j++) {
        M[row][j] -= factor * M[col][j];
      }
      b[row] -= factor * b[col];
    }
  }

  // Back substitution
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }
  return x;
}

