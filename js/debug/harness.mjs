// ── Circuit Debug Harness ────────────────────────────────────────────────────
// A headless, scriptable wrapper around the real simulation engine. This is the
// SAME code that runs in the browser (breadboard, components, netlist,
// CircuitSimulator) — no reimplementation — so anything you reproduce here is
// faithful to what the user sees.
//
// Why this exists: the simulator's time-domain behaviour (capacitor charge /
// discharge, RC timing, clocks) only emerges when you step the engine through
// time and watch voltages/currents evolve. In the browser that happens inside a
// setInterval you can't easily inspect. This harness lets you:
//
//   • load a saved circuit JSON exactly as the app would
//   • press/release buttons, flip switches, edit component values
//   • step the time-domain loop deterministically (no setInterval, no wall clock)
//   • read any net voltage, component current, capacitor state, LED state
//   • dump a full human-readable snapshot of the circuit at any instant
//   • record traces of arbitrary probes over time
//
// Quick start:
//   import { CircuitHarness } from './harness.mjs';
//   const h = CircuitHarness.fromFile('brokencap.json');
//   h.evaluate();
//   console.log(h.report());
//   h.press(431);                 // press the push-button by component id
//   h.run(2.0);                   // advance 2 simulated seconds
//   console.log(h.report());
//
// NOTE: clock-driven circuits read performance.now() inside evaluate(), so they
// are NOT fully deterministic here. Capacitor/RC circuits are deterministic.

import fs from 'node:fs';
import path from 'node:path';

import { BreadboardWorld, parseHoleId } from '../breadboard.js';
import { WireManager, resetWireCounter } from '../wire.js';
import { deserializeComponent, setNextComponentId } from '../components.js';
import { CircuitSimulator } from '../simulator.js';
import { COMP } from '../constants.js';

const CAP_TYPES = new Set([COMP.CAPACITOR, COMP.POLARIZED_CAPACITOR]);
const TWO_PIN_TYPES = new Set([
  COMP.LED, COMP.RESISTOR, COMP.CAPACITOR, COMP.POLARIZED_CAPACITOR,
  COMP.INDUCTOR, COMP.DIODE, COMP.PUSH_BUTTON, COMP.SWITCH,
]);

function fmtV(v) {
  if (v === undefined || v === null) return '  --  ';
  return (v >= 0 ? ' ' : '') + v.toFixed(3) + 'V';
}

function fmtI(a) {
  if (a === undefined || a === null) return '  --  ';
  const mA = a * 1000;
  if (Math.abs(mA) >= 1) return mA.toFixed(2) + 'mA';
  return (a * 1e6).toFixed(1) + 'µA';
}

function fmtCap(c) {
  if (c >= 1e-3) return (c * 1e3).toFixed(2) + 'mF';
  if (c >= 1e-6) return (c * 1e6).toFixed(2) + 'µF';
  if (c >= 1e-9) return (c * 1e9).toFixed(2) + 'nF';
  return (c * 1e12).toFixed(2) + 'pF';
}

function fmtR(r) {
  if (r >= 1e6) return (r / 1e6).toFixed(2) + 'MΩ';
  if (r >= 1e3) return (r / 1e3).toFixed(2) + 'kΩ';
  return r + 'Ω';
}

// Standard 7-segment font: sorted lit-segment string → displayed character.
// Segments: a=top, b=top-right, c=bottom-right, d=bottom, e=bottom-left,
// f=top-left, g=middle.
const SEG_FONT = {
  '': '', abcdef: '0', bc: '1', abdeg: '2', abcdg: '3', bcfg: '4',
  acdfg: '5', acdefg: '6', abc: '7', abcdefg: '8', abcdfg: '9',
  abcefg: 'A', cdefg: 'b', adef: 'C', bcdeg: 'd', adefg: 'E', aefg: 'F',
  cef: '?', // partial / ambiguous fall-throughs handled below
};
export function decodeSevenSeg(litSegments) {
  const key = [...litSegments].sort().join('');
  if (key in SEG_FONT) return SEG_FONT[key];
  return key ? '▟' : ''; // unknown non-empty pattern → "lit but undecodable"
}

export class CircuitHarness {
  /**
   * @param {object} [opts]
   * @param {string} [opts.family] override 74-series family (e.g. 'LS','HC')
   */
  constructor(opts = {}) {
    this.world = new BreadboardWorld();
    this.wireManager = new WireManager();
    this.components = [];
    this.sim = new CircuitSimulator();
    if (opts.family) this.sim.setFamily(opts.family);
    this._stepCount = 0;
    this._refsReady = false;
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  /** Load from a saved-circuit JSON file path. */
  static fromFile(filePath, opts = {}) {
    const abs = path.resolve(filePath);
    const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
    const h = new CircuitHarness(opts);
    h.load(data);
    h._sourcePath = abs;
    return h;
  }

  /** Load from an already-parsed save object. */
  static fromJSON(data, opts = {}) {
    const h = new CircuitHarness(opts);
    h.load(data);
    return h;
  }

  /** Mirrors storage.deserializeState() without the localStorage/DOM bits. */
  load(data) {
    resetWireCounter();
    this.components = [];
    let maxId = 0;

    // Ensure every tile referenced by a hole exists before we wire anything.
    const ensureTile = (holeId) => {
      if (!holeId) return;
      const p = parseHoleId(holeId);
      if (!this.world.getTile(p.tileX, p.tileY)) this.world.addTile(p.tileX, p.tileY);
    };
    for (const t of (data.extraTiles || [])) this.world.addTile(t.tx, t.ty);
    for (const d of (data.components || [])) {
      ensureTile(d.startHoleId); ensureTile(d.endHoleId);
      if (d.col !== undefined) ensureTile(`${d.tileX ?? 0}:${d.tileY ?? 0}:main:${d.col}:${d.row}`);
    }
    for (const w of (data.wires || [])) { ensureTile(w.startHoleId); ensureTile(w.endHoleId); }

    for (const d of (data.components || [])) {
      const comp = deserializeComponent(d);
      if (comp) {
        this.components.push(comp);
        if (comp.id > maxId) maxId = comp.id;
      }
    }
    setNextComponentId(maxId + 1);
    this.wireManager.deserialize(data.wires || [], this.world);

    if (data.chipFamily !== undefined) this.sim.setFamily(data.chipFamily);
    this._refsReady = false;
    return this;
  }

  // ── Simulation control ──────────────────────────────────────────────────────

  /** Full static solve (no time advance). Call after any structural change. */
  evaluate() {
    this.sim.evaluate(this.world, this.components, this.wireManager);
    this._refsReady = false;
    return this;
  }

  _ensureRefs() {
    // Wire up the time-stepping references the engine expects, WITHOUT starting
    // the setInterval loop. Mirrors startTimeLoop()'s bookkeeping.
    this.sim._steppingWorld = this.world;
    this.sim._steppingComponents = this.components;
    this.sim._steppingWireManager = this.wireManager;
    this.sim._onStepCallback = null;
    this._refsReady = true;
  }

  /**
   * Signal a circuit change (button press, value edit, etc). Mirrors the app's
   * onCircuitChanged → startTimeLoop path: resets the adaptive dt to its minimum
   * so the next steps don't overshoot a fast transient, then re-solves.
   */
  markChanged() {
    this.sim.dt = this.sim._dtMin;
    this.evaluate();
    return this;
  }

  /**
   * Advance the time-domain simulation by ONE step.
   * @param {object} [opts]
   * @param {number} [opts.dt] fixed step size (s). Omit to use the engine's
   *                           own adaptive dt (faithful to production).
   */
  step({ dt } = {}) {
    if (!this._refsReady) this._ensureRefs();
    if (dt != null) {
      this.sim.dt = dt;
      this.sim.simTime += dt;
      this.sim.evaluate(this.world, this.components, this.wireManager);
    } else {
      this.sim._timeStep();
    }
    this._stepCount++;
    return this;
  }

  /**
   * Advance simulated time by `seconds`, stepping repeatedly.
   * @param {number} seconds
   * @param {object} [opts]
   * @param {number} [opts.dt] fixed step size; default = engine adaptive dt
   * @param {Array<{name:string, fn:(h:CircuitHarness)=>number}>} [opts.record]
   *        probes sampled after every step → returns array of row objects
   * @returns {Array<object>} trace rows (empty if no `record`)
   */
  run(seconds, { dt, record } = {}) {
    const start = this.sim.simTime;
    const rows = [];
    let guard = 0;
    const maxSteps = 200000;
    while (this.sim.simTime - start < seconds && guard++ < maxSteps) {
      this.step({ dt });
      if (record) rows.push(this._sample(record));
    }
    return rows;
  }

  /**
   * Step until capacitor voltages stop changing (DC steady state reached), or
   * `maxSteps` is hit. Returns the number of steps taken.
   */
  settle({ maxSteps = 5000, eps = 1e-5, dt } = {}) {
    let stable = 0;
    let n = 0;
    while (n < maxSteps) {
      const before = this.caps().map(c => c.vPrev);
      this.step({ dt });
      n++;
      const after = this.caps().map(c => c.vPrev);
      let maxDv = 0;
      for (let i = 0; i < after.length; i++) maxDv = Math.max(maxDv, Math.abs(after[i] - before[i]));
      if (this.caps().length === 0) return n; // nothing time-domain to settle
      if (maxDv < eps) { if (++stable >= 3) break; } else stable = 0;
    }
    return n;
  }

  _sample(record) {
    const row = { t: +this.sim.simTime.toFixed(6), dt: +this.sim.dt.toFixed(6) };
    for (const { name, fn } of record) row[name] = fn(this);
    return row;
  }

  // ── Timing analysis (propagation delay — js/timing.js) ──────────────────────
  // Deterministic by construction: timing mode never reads the wall clock, so
  // clock edges land at exact integer picoseconds (unlike live mode, see the
  // NOTE at the top of this file).

  /**
   * Enter propagation-delay analysis mode. The circuit settles once in live
   * mode with every clock held LOW — that is the t=0 state — then clocks
   * become exact sim-time event sources (first rising edge one full LOW
   * portion after t=0). Advance with advanceNs()/stepEvent(); read probe
   * histories with transitions().
   */
  enableTiming() {
    this.sim.beginTimingMode(this.world, this.components, this.wireManager);
    return this;
  }

  /** Leave timing mode and restore a live-mode solve. */
  disableTiming() {
    this.sim.endTimingMode();
    return this.evaluate();
  }

  get timing() { return this.sim.timing; }

  /** Timing-mode sim time (integer picoseconds / float nanoseconds). */
  get timePs() { return this.sim.timing ? this.sim.timing.timePs : 0; }
  get timeNs() { return this.timePs / 1000; }

  /** Advance timing-mode sim time by `ns` nanoseconds, processing events. */
  advanceNs(ns) {
    this.sim.timing.advanceByPs(Math.round(ns * 1000));
    return this;
  }

  /** Process the next event batch; returns its time (ps), null when idle. */
  stepEvent() { return this.sim.timing.microStep(); }

  /** Add a recorder lane on a hole id (safe before or during a run). */
  watch(holeId, label) {
    this.sim.timing.watch(holeId, label);
    return this;
  }

  /** Add a recorder lane on a component's named pin. */
  watchPin(idOrComp, pinName, label) {
    const c = this._resolve(idOrComp);
    const pin = c?.getPinByName(pinName);
    if (!pin) throw new Error(`watchPin: no pin ${pinName} on ${idOrComp}`);
    return this.watch(pin.holeId, label || `${c.type}#${c.id}.${pinName}`);
  }

  /**
   * Transition history of a lane (by holeId or label):
   * [{ tPs, tNs, level }], level ∈ 0 | 1 | 'Z' (floating) | 'X' (conflict).
   * The first entry is the lane's level at the moment it was created.
   */
  transitions(holeIdOrLabel) {
    return this.sim.timing.getTransitions(holeIdOrLabel)
      .map(tr => ({ tPs: tr.t, tNs: tr.t / 1000, level: tr.level }));
  }

  // ── Input control ────────────────────────────────────────────────────────────

  setPressed(idOrComp, pressed) {
    const c = this._resolve(idOrComp);
    if (!c) throw new Error(`No component ${idOrComp}`);
    c.pressed = pressed;
    return this.markChanged();
  }
  press(idOrComp) { return this.setPressed(idOrComp, true); }
  release(idOrComp) { return this.setPressed(idOrComp, false); }

  setSwitch(idOrComp, on) {
    const c = this._resolve(idOrComp);
    if (!c) throw new Error(`No component ${idOrComp}`);
    c.on = on;
    return this.markChanged();
  }

  setValue(idOrComp, value) {
    const c = this._resolve(idOrComp);
    if (!c) throw new Error(`No component ${idOrComp}`);
    if (CAP_TYPES.has(c.type)) c.capacitance = value;
    else if (c.type === COMP.RESISTOR) c.resistance = value === 0 ? 0.01 : value;
    else if (c.type === COMP.INDUCTOR) c.inductance = value;
    else throw new Error(`setValue not supported for ${c.type}`);
    return this.markChanged();
  }

  // ── Component lookup ──────────────────────────────────────────────────────────

  _resolve(idOrComp) {
    if (idOrComp && typeof idOrComp === 'object') return idOrComp;
    return this.byId(idOrComp);
  }
  byId(id) { return this.components.find(c => c.id === id) || null; }
  byType(type) { return this.components.filter(c => c.type === type); }
  leds() { return this.byType(COMP.LED); }
  resistors() { return this.byType(COMP.RESISTOR); }
  caps() { return this.components.filter(c => CAP_TYPES.has(c.type)); }
  buttons() { return [...this.byType(COMP.PUSH_BUTTON), ...this.byType(COMP.BUTTON)]; }

  // ── Measurement ───────────────────────────────────────────────────────────────

  /** Net object containing a hole id, or null. (Requires a prior evaluate/step.) */
  holeNet(holeId) { return this.sim.netlist.findNetByHole(holeId); }

  /** Voltage at a hole's net (number) or undefined if floating/unsolved. */
  netVoltage(holeId) { return this.sim.getVoltageAtHole(holeId); }

  /** Voltage on a named pin of a component. */
  pinVoltage(idOrComp, pinName) {
    const c = this._resolve(idOrComp);
    const pin = c?.getPinByName(pinName);
    if (!pin) return undefined;
    return this.netVoltage(pin.holeId);
  }

  /** Signed voltage across a 2-pin component: V(pin0) − V(pin1). */
  voltageAcross(idOrComp) {
    const c = this._resolve(idOrComp);
    if (!c || !c.pins || c.pins.length < 2) return undefined;
    const a = this.netVoltage(c.pins[0].holeId);
    const b = this.netVoltage(c.pins[1].holeId);
    if (a === undefined || b === undefined) return undefined;
    return a - b;
  }

  /** Current through a component (amps), as computed by the engine. */
  current(idOrComp) {
    const c = this._resolve(idOrComp);
    return c ? this.sim.getComponentCurrent(c.id) : 0;
  }

  /** Rich capacitor state snapshot. */
  capState(idOrComp) {
    const c = this._resolve(idOrComp);
    if (!c || !CAP_TYPES.has(c.type)) return null;
    return {
      id: c.id,
      capacitance: c.capacitance,
      vPrev: c.vPrev,                          // stored plate voltage (state variable)
      vAcross: this.voltageAcross(c),          // solved node-to-node voltage this step
      current: this.current(c),
      isolated: this.sim._isolatedCaps.has(c.id), // engine flagged it open-circuit
    };
  }

  /** LED state snapshot. */
  ledState(idOrComp) {
    const c = this._resolve(idOrComp);
    if (!c || c.type !== COMP.LED) return null;
    return {
      id: c.id,
      vAcross: this.voltageAcross(c),
      current: this.current(c),
      lit: c.lit,
      brightness: c.brightness,
      overdrive: c.overdrive,
    };
  }

  /**
   * 7-segment display snapshot, including the character it's showing.
   * `char` is decoded from the lit segment pattern ('' = blank/dark).
   */
  sevenSegState(idOrComp) {
    const c = this._resolve(idOrComp);
    if (!c || c.type !== COMP.SEVEN_SEG) return null;
    const lit = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].filter(s => c.segments[s]);
    const overdrive = Object.values(c.segmentOverdrive || {}).some(Boolean);
    return {
      id: c.id,
      commonAnode: c.commonAnode,
      segments: { ...c.segments },
      lit,
      anyLit: lit.length > 0 || !!c.segments.dp,
      dp: !!c.segments.dp,
      char: decodeSevenSeg(lit),
      overdrive,
    };
  }
  sevenSegs() { return this.byType(COMP.SEVEN_SEG).map(c => this.sevenSegState(c)); }

  get simTime() { return this.sim.simTime; }
  get dt() { return this.sim.dt; }
  get shorts() { return this.sim.shortCircuits.slice(); }
  get hasShort() { return this.sim.hasShortCircuit(); }

  // ── Reporting ─────────────────────────────────────────────────────────────────

  _netLabel(net) {
    if (net.isVCC && net.isGND) return 'SHORT';
    if (net.isVCC) return 'VCC';
    if (net.isGND) return 'GND';
    if (this.sim.floatingNets.has(net.id)) return `float#${net.id}`;
    return `n${net.id}`;
  }

  _pinLabel(p) {
    const c = p.comp;
    const tag = c.type.replace('_', '') + '#' + c.id;
    return `${tag}.${p.pin.name}`;
  }

  /** Structured net list: [{id,label,voltage,holeCount,pins:[...]}] */
  netReport() {
    return this.sim.netlist.nodes.map(net => ({
      id: net.id,
      label: this._netLabel(net),
      voltage: this.sim.netVoltages.get(net.id),
      holeCount: net.holes.size,
      pins: net.pins.map(p => this._pinLabel(p)),
    }));
  }

  /** Multi-line human-readable snapshot of the whole circuit at this instant. */
  report() {
    const L = [];
    L.push('═'.repeat(74));
    L.push(`CIRCUIT SNAPSHOT   t=${this.sim.simTime.toFixed(4)}s  dt=${(this.sim.dt * 1000).toFixed(2)}ms  family=${this.sim.family}  step#${this._stepCount}`);
    L.push('═'.repeat(74));

    // Flags
    const flags = [];
    if (this.sim.shortCircuits.length) flags.push(`⚠ SHORT on nets [${this.sim.shortCircuits.join(',')}]`);
    if (this.sim._isolatedCaps.size) flags.push(`isolated caps: [${[...this.sim._isolatedCaps].join(',')}]`);
    if (this.sim.floatingNets.size) flags.push(`floating nets: [${[...this.sim.floatingNets].join(',')}]`);
    L.push(flags.length ? flags.join('   ') : '(no shorts / isolated caps / floating nets)');
    L.push('');

    // Nets
    L.push('NETS  (label  voltage   holes   connected pins)');
    L.push('─'.repeat(74));
    for (const n of this.netReport()) {
      L.push(`  ${n.label.padEnd(9)} ${fmtV(n.voltage).padStart(8)}  ${String(n.holeCount).padStart(3)}h   ${n.pins.join(', ')}`);
    }
    L.push('');

    // Components
    L.push('COMPONENTS  (type#id  value   V across   current   state)');
    L.push('─'.repeat(74));
    for (const c of this.components) {
      if (!c.placed) continue;
      const tag = (c.type.replace('_', '') + '#' + c.id).padEnd(16);
      let value = '';
      if (c.type === COMP.RESISTOR) value = fmtR(c.resistance);
      else if (CAP_TYPES.has(c.type)) value = fmtCap(c.capacitance);
      else if (c.type === COMP.INDUCTOR) value = c.getLabel();
      else if (c.type === COMP.LED) value = c.color;
      value = value.padEnd(8);

      const isTwoPin = TWO_PIN_TYPES.has(c.type);
      const vacross = isTwoPin ? fmtV(this.voltageAcross(c)) : '      ';
      const cur = (c.type === COMP.RESISTOR || c.type === COMP.LED || CAP_TYPES.has(c.type) || c.type === COMP.INDUCTOR || c.type === COMP.DIODE)
        ? fmtI(this.current(c)) : '      ';

      let state = '';
      if (c.type === COMP.LED) state = `lit=${c.lit} b=${(c.brightness ?? 0).toFixed(2)}${c.overdrive ? ' OVERDRIVE' : ''}`;
      else if (CAP_TYPES.has(c.type)) { const cs = this.capState(c); state = `vPrev=${cs.vPrev.toFixed(3)}V${cs.isolated ? ' ISOLATED' : ''}`; }
      else if (c.type === COMP.INDUCTOR) state = `iPrev=${((c.iPrev ?? 0) * 1000).toFixed(3)}mA`;
      else if (c.type === COMP.PUSH_BUTTON || c.type === COMP.BUTTON) state = `pressed=${!!c.pressed}`;
      else if (c.type === COMP.SWITCH) state = `on=${!!c.on}`;
      else if (c.type === COMP.SEVEN_SEG) { const s = this.sevenSegState(c); state = `shows "${s.char || (s.anyLit ? '?' : ' ')}" lit=[${s.lit.join('')}]${s.overdrive ? ' OVERDRIVE' : ''}`; }

      L.push(`  ${tag} ${value} ${vacross.padStart(8)}  ${cur.padStart(8)}  ${state}`);
    }
    L.push('═'.repeat(74));
    return L.join('\n');
  }

  /** Compact one-line topology description (handy for sanity checks). */
  describe() {
    const lines = [];
    for (const c of this.components) {
      if (!c.placed) continue;
      const pins = (c.pins || []).map(p => p.holeId).join('  ↔  ');
      lines.push(`${c.type}#${c.id}: ${pins}`);
    }
    for (const w of this.wireManager.wires) {
      lines.push(`wire#${w.id}: ${w.startHoleId}  ──  ${w.endHoleId}`);
    }
    return lines.join('\n');
  }

  /** Print a trace (array of row objects from run(..,{record})) as a table. */
  static printTrace(rows) {
    if (!rows.length) { console.log('(empty trace)'); return; }
    const cols = Object.keys(rows[0]);
    const widths = cols.map(c => Math.max(c.length, ...rows.map(r => String(fmtCell(r[c])).length)));
    const header = cols.map((c, i) => c.padStart(widths[i])).join('  ');
    console.log(header);
    console.log('─'.repeat(header.length));
    for (const r of rows) {
      console.log(cols.map((c, i) => String(fmtCell(r[c])).padStart(widths[i])).join('  '));
    }
  }
}

function fmtCell(v) {
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(Math.abs(v) < 0.01 && v !== 0 ? 6 : 3);
  }
  return String(v);
}
