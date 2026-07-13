#!/usr/bin/env node
// ── Circuit Debug CLI ────────────────────────────────────────────────────────
// Drive the simulator from the command line without writing a script.
//
// Usage:
//   node js/debug/cli.mjs <circuit.json> [command...]
//
// Commands run left-to-right. Each is one token group separated by spaces:
//   describe              print topology (components + wires)
//   eval                  static solve, then dump a snapshot
//   dump                  dump a snapshot (no solve)
//   press <id>            press push-button <id> (re-solves)
//   release <id>          release push-button <id>
//   switch <id> on|off    set toggle switch <id>
//   set <id> <value>      set resistor Ω or capacitor F  (e.g. set 433 1e-7)
//   step [dt]             one time-step (optional fixed dt seconds)
//   run <seconds> [dt]    advance N simulated seconds
//   settle                step until capacitors reach steady state
//   probe <sec> [dt]      run <sec> and print a trace of cap/LED/resistor probes
//   family <key>          set 74-series family (LS, HC, HCT, ...)
//
// Examples:
//   node js/debug/cli.mjs ~/Desktop/brokencap.json eval
//   node js/debug/cli.mjs ~/Desktop/brokencap.json press 431 run 1 dump release 431 probe 2

import { CircuitHarness } from './harness.mjs';

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error('usage: node js/debug/cli.mjs <circuit.json> [command...]');
  process.exit(1);
}

const file = argv[0];
const h = CircuitHarness.fromFile(file);
h.evaluate();

// Default probe set: every cap's vPrev + current, every LED V/I, every resistor I.
function defaultProbes() {
  const probes = [];
  for (const c of h.caps()) {
    probes.push({ name: `C${c.id}.v`, fn: hh => hh.capState(c).vPrev });
    probes.push({ name: `C${c.id}.I`, fn: hh => hh.current(c) });
  }
  for (const l of h.leds()) {
    probes.push({ name: `LED${l.id}.V`, fn: hh => hh.voltageAcross(l) });
    probes.push({ name: `LED${l.id}.I`, fn: hh => hh.current(l) });
  }
  for (const r of h.resistors()) {
    probes.push({ name: `R${r.id}.I`, fn: hh => hh.current(r) });
  }
  return probes;
}

let i = 1;
const next = () => argv[i++];
while (i < argv.length) {
  const cmd = next();
  switch (cmd) {
    case 'describe': console.log(h.describe()); break;
    case 'eval': h.evaluate(); console.log(h.report()); break;
    case 'dump': console.log(h.report()); break;
    case 'press': h.press(Number(next())); break;
    case 'release': h.release(Number(next())); break;
    case 'switch': { const id = Number(next()); h.setSwitch(id, next() === 'on'); break; }
    case 'set': { const id = Number(next()); h.setValue(id, Number(next())); break; }
    case 'family': h.sim.setFamily(next()); h.evaluate(); break;
    case 'step': {
      const peek = argv[i];
      const dt = peek !== undefined && !isNaN(Number(peek)) ? Number(next()) : undefined;
      h.step({ dt });
      break;
    }
    case 'run': {
      const secs = Number(next());
      const peek = argv[i];
      const dt = peek !== undefined && !isNaN(Number(peek)) ? Number(next()) : undefined;
      h.run(secs, { dt });
      break;
    }
    case 'settle': { const n = h.settle(); console.log(`settled in ${n} steps (t=${h.simTime.toFixed(4)}s)`); break; }
    case 'probe': {
      const secs = Number(next());
      const peek = argv[i];
      const dt = peek !== undefined && !isNaN(Number(peek)) ? Number(next()) : undefined;
      const rows = h.run(secs, { dt, record: defaultProbes() });
      CircuitHarness.printTrace(rows);
      break;
    }
    default:
      console.error(`unknown command: ${cmd}`);
      process.exit(1);
  }
}
