// ── 555 Timer RC Network Analyzer ────────────────────────────────────────────
// Pure netlist inspection: given a placed 555/556 chip, find the resistors and
// capacitors wired around each timer section and compute the ideal timing from
// the datasheet formulas. No DOM and no simulator state — just the netlist and
// the component list — so the side panel readout tracks live as parts are
// added, moved, or their values edited, and the debug harness can regression-
// test it headlessly.
//
// Recognized wirings (per TIMER_555 gate; covers both the 555 and each half
// of the 556):
//
//   Astable    TRIG tied to THRESH, R1 from VCC to DISCH, R2 from DISCH to
//              the TRIG/THRESH node, C from that node to GND.
//                tHIGH = 0.693·(R1+R2)·C   tLOW = 0.693·R2·C
//                f = 1/(tHIGH+tLOW)        duty = (R1+R2)/(R1+2·R2)
//
//   Astable, R2 = 0 (minimal one-resistor blinker: DISCH also tied to the
//              TRIG/THRESH node). The cap discharges through the DISCH
//              transistor almost instantly, so tLOW ≈ 0 and f ≈ 1/(0.693·R1·C).
//
//   Monostable THRESH tied to DISCH, R from VCC to that node, C from that
//              node to GND, TRIG driven separately.
//                pulse width = 1.1·R·C
//
// Parts that share the same two nets are combined the way the circuit sees
// them: resistors in parallel, capacitors summed. Series chains through a
// middle net with other connections are NOT traced — same limitation as
// reading the schematic by adjacency.

import { COMP } from './constants.js';

const CAP_TYPES = new Set([COMP.CAPACITOR, COMP.POLARIZED_CAPACITOR]);

function pinNet(netlist, comp, pinName) {
  const pin = comp.getPinByName(pinName);
  if (!pin) return null;
  return netlist.findNetByHole(pin.holeId);
}

// Two-terminal parts whose end nets satisfy the two predicates (either way
// around). Predicates take a net, e.g. exact-net match or the VCC/GND rails.
function partsBetween(parts, netlist, matchA, matchB) {
  const found = [];
  for (const p of parts) {
    const nA = netlist.findNetByHole(p.startHoleId);
    const nB = netlist.findNetByHole(p.endHoleId);
    if (!nA || !nB) continue;
    if ((matchA(nA) && matchB(nB)) || (matchA(nB) && matchB(nA))) found.push(p);
  }
  return found;
}

const sameNet = (net) => (n) => n.id === net.id;
const isVCC = (n) => n.isVCC;
const isGND = (n) => n.isGND;

const parallelR = (rs) => rs.length ? 1 / rs.reduce((s, r) => s + 1 / r.resistance, 0) : null;
const summedC   = (cs) => cs.length ? cs.reduce((s, c) => s + c.capacitance, 0) : null;

/**
 * Analyze the RC network around every TIMER_555 gate of a placed chip.
 * Returns one entry per timer section:
 *   { label, mode: 'astable', r1, r2, c, tHigh, tLow, period, freq, duty, note? }
 *   { label, mode: 'monostable', r, c, pulse }
 *   { label, mode: null, hint }   — wiring partially recognized (hint says
 *                                   what's missing) or not recognized (hint null)
 * label is 'Timer A'/'Timer B' on multi-timer chips, null on the 555.
 */
export function analyze555Timing(comp, def, netlist, components) {
  const gates = (def.gates || []).filter(g => g.type === 'TIMER_555');
  const results = [];
  if (gates.length === 0) return results;

  const placed    = components.filter(c => c.placed);
  const resistors = placed.filter(c => c.type === COMP.RESISTOR);
  const caps      = placed.filter(c => CAP_TYPES.has(c.type));

  gates.forEach((gate, idx) => {
    const [trigName, threshName] = gate.inputs;
    const dischName = gate.outputs[1];
    const out = { label: gates.length > 1 ? `Timer ${String.fromCharCode(65 + idx)}` : null, mode: null };
    results.push(out);

    const trigNet   = pinNet(netlist, comp, trigName);
    const threshNet = pinNet(netlist, comp, threshName);
    const dischNet  = pinNet(netlist, comp, dischName);
    if (!threshNet) { out.hint = null; return; }

    // The timing capacitor sits on the THRESH node in every recognized mode.
    const c = summedC(partsBetween(caps, netlist, sameNet(threshNet), isGND));

    const trigTied  = !!trigNet  && trigNet.id  === threshNet.id;
    const dischTied = !!dischNet && dischNet.id === threshNet.id;

    if (trigTied && dischNet && !dischTied) {
      // ── Astable ──
      const r1 = parallelR(partsBetween(resistors, netlist, isVCC, sameNet(dischNet)));
      const r2 = parallelR(partsBetween(resistors, netlist, sameNet(dischNet), sameNet(threshNet)));
      if (r1 && r2 && c) {
        out.mode = 'astable';
        out.r1 = r1; out.r2 = r2; out.c = c;
        out.tHigh  = 0.693 * (r1 + r2) * c;
        out.tLow   = 0.693 * r2 * c;
        out.period = out.tHigh + out.tLow;
        out.freq   = 1 / out.period;
        out.duty   = (r1 + r2) / (r1 + 2 * r2);
        return;
      }
      const missing = [];
      if (!r1) missing.push('R1 (VCC→DISCH)');
      if (!r2) missing.push('R2 (DISCH→THRESH)');
      if (!c)  missing.push('C (THRESH→GND)');
      out.hint = `Astable wiring started — add ${missing.join(', ')}`;
      return;
    }

    if (trigTied && dischTied) {
      // ── Astable, R2 = 0 — DISCH dumps the cap straight to GND ──
      const r1 = parallelR(partsBetween(resistors, netlist, isVCC, sameNet(threshNet)));
      if (r1 && c) {
        out.mode = 'astable';
        out.r1 = r1; out.r2 = 0; out.c = c;
        out.tHigh  = 0.693 * r1 * c;
        out.tLow   = 0;
        out.period = out.tHigh;
        out.freq   = 1 / out.period;
        out.duty   = 1;
        out.note   = 'R2 = 0 (DISCH tied to THRESH): output is a train of very short LOW spikes';
        return;
      }
      const missing = [];
      if (!r1) missing.push('R (VCC→THRESH)');
      if (!c)  missing.push('C (THRESH→GND)');
      out.hint = `Astable wiring started — add ${missing.join(', ')}`;
      return;
    }

    if (dischTied) {
      // ── Monostable ──
      const r = parallelR(partsBetween(resistors, netlist, isVCC, sameNet(threshNet)));
      if (r && c) {
        out.mode = 'monostable';
        out.r = r; out.c = c;
        out.pulse = 1.1 * r * c;
        return;
      }
      const missing = [];
      if (!r) missing.push('R (VCC→THRESH/DISCH)');
      if (!c) missing.push('C (THRESH→GND)');
      out.hint = `Monostable wiring started — add ${missing.join(', ')}`;
      return;
    }

    out.hint = null;
  });

  return results;
}

// ── Display formatting ────────────────────────────────────────────────────

export function fmtFreq(hz) {
  if (hz >= 1e6) return (hz / 1e6).toFixed(2) + ' MHz';
  if (hz >= 1e3) return (hz / 1e3).toFixed(2) + ' kHz';
  if (hz >= 10)  return hz.toFixed(1) + ' Hz';
  if (hz >= 1)   return hz.toFixed(2) + ' Hz';
  return hz.toFixed(3) + ' Hz';
}

export function fmtTime(s) {
  if (s >= 1)    return s.toFixed(2) + ' s';
  if (s >= 1e-3) return (s * 1e3).toFixed(2) + ' ms';
  if (s >= 1e-6) return (s * 1e6).toFixed(1) + ' µs';
  return (s * 1e9).toFixed(0) + ' ns';
}

export function fmtRes(r) {
  if (r >= 1e6) return trimZeros(r / 1e6) + ' MΩ';
  if (r >= 1e3) return trimZeros(r / 1e3) + ' kΩ';
  return trimZeros(r) + ' Ω';
}

export function fmtCapVal(c) {
  if (c >= 1e-3) return trimZeros(c * 1e3) + ' mF';
  if (c >= 1e-6) return trimZeros(c * 1e6) + ' µF';
  if (c >= 1e-9) return trimZeros(c * 1e9) + ' nF';
  return trimZeros(c * 1e12) + ' pF';
}

function trimZeros(n) {
  return String(parseFloat(n.toFixed(2)));
}
