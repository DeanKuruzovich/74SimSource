# Circuit debug toolkit (`js/debug/`)

A headless, scriptable way to drive the **real** simulation engine — the same
`breadboard` / `components` / `netlist` / `CircuitSimulator` code that runs in
the browser, with no DOM and no reimplementation. Anything you reproduce here is
faithful to what the user sees in the app.

It exists because the simulator's interesting failures are **time-domain**:
capacitor charge/discharge, RC timing, oscillators. In the browser those evolve
inside a `setInterval` you can't pause or inspect. Here you can step the engine
one tick at a time and read every net voltage, component current, and capacitor
state.

## Files

| File | What it is |
|---|---|
| `harness.mjs` | The core API: `CircuitHarness`. Load a circuit, press buttons, step time, read everything, dump snapshots. |
| `cli.mjs` | Command-line driver — debug a saved `.json` circuit without writing code. |
| `scenarios/` | Self-checking reproduction scripts (each exits non-zero on failure → they double as regression tests). |
| `run-scenarios.mjs` | Runs every scenario in `scenarios/` and reports pass/fail. |
| `test-examples.mjs` | Loads every circuit in `js/examples/` through the real engine and reports what it actually does (LEDs lit, 7-seg characters, shorts). Per-example expectations make it a regression gate for the shipped demos. |

## CLI quick start

```bash
# Static solve + full snapshot of a saved circuit:
node js/debug/cli.mjs ~/Desktop/brokencap.json eval

# Press a push-button (by component id), let it run, dump, release, watch discharge:
node js/debug/cli.mjs ~/Desktop/brokencap.json press 431 settle dump release 431 probe 1.5
```

Commands run left-to-right:

| Command | Effect |
|---|---|
| `describe` | Print topology (components + wires). |
| `eval` | Static solve, then dump a snapshot. |
| `dump` | Dump a snapshot (no solve). |
| `press <id>` / `release <id>` | Press/release a push-button. |
| `switch <id> on\|off` | Set a toggle switch. |
| `set <id> <value>` | Set resistor Ω or capacitor F (e.g. `set 433 1e-7`). |
| `step [dt]` | One time-step (optional fixed dt in seconds). |
| `run <seconds> [dt]` | Advance N simulated seconds. |
| `settle` | Step until capacitors reach steady state. |
| `probe <sec> [dt]` | Run and print a time-trace of every cap/LED/resistor. |
| `family <key>` | Set 74-series family (LS, HC, HCT, …). |

## Programmatic API

```js
import { CircuitHarness } from './js/debug/harness.mjs';

const h = CircuitHarness.fromFile('brokencap.json');   // or .fromJSON(obj)
h.evaluate();                       // static solve
console.log(h.report());            // human-readable snapshot

h.press(431);                       // press push-button #431  (re-solves)
h.settle();                         // run to steady state
console.log(h.capState(433));       // { vPrev, vAcross, current, isolated, ... }

h.release(431);
const rows = h.run(1.5, {           // advance 1.5 s, recording probes each step
  record: [
    { name: 'capV', fn: hh => hh.capState(433).vPrev },
    { name: 'ledI', fn: hh => hh.current(427) },
  ],
});
CircuitHarness.printTrace(rows);
```

### Most useful methods

- **Load:** `CircuitHarness.fromFile(path)`, `.fromJSON(data)`
- **Solve / time:** `evaluate()`, `step({dt})`, `run(seconds, {dt, record})`, `settle()`
- **Inputs:** `press(id)`, `release(id)`, `setSwitch(id,on)`, `setValue(id,value)`
- **Measure:** `netVoltage(holeId)`, `pinVoltage(id,pin)`, `voltageAcross(id)`,
  `current(id)`, `capState(id)`, `ledState(id)`
- **Inspect:** `report()`, `describe()`, `netReport()`, `hasShort`, `shorts`, `simTime`, `dt`
- **Find:** `byId(id)`, `byType(type)`, `leds()`, `caps()`, `resistors()`, `buttons()`

### How time stepping works

`step()` calls the engine's own `_timeStep()` (adaptive dt, the `vPrev` clamp —
exactly production) but **synchronously**, with no `setInterval`. Pass a fixed
`dt` for clean, evenly-spaced traces. `markChanged()` (called by `press` etc.)
mirrors the app's `onCircuitChanged` → resets dt to its minimum and re-solves.

> ⚠️ Clock-driven circuits read `performance.now()` inside `evaluate()`, so they
> are **not** fully deterministic here. Capacitor/RC circuits are.

## Scenarios / regression tests

```bash
node js/debug/run-scenarios.mjs                       # run them all
node js/debug/scenarios/cap-discharge-through-led.mjs # run one
```

- `cap-discharge-through-led.mjs` — the original "broken capacitor" bug: a cap
  that can only discharge by forward-biasing an LED. Guards against the cap
  freezing / the bogus 4.9 V LED overcurrent.
- `cap-regression.mjs` — neighbouring cap cases: RC charge, full RC discharge to
  GND, decoupling cap across the rails, and a genuinely dangling cap that must
  stay isolated.
- `block71-analog-chips.mjs` — the analog companion chips (chips71.js): LM393
  comparator levels, LM741 open-loop saturation + voltage-follower convergence,
  ULN2003 strong Darlington sink (and the GND-only `noVccPin` power path),
  LM7805 output, XO 10 Hz oscillation/tri-state, and 2764 EPROM
  erase/program/verify semantics.
- `all-chips-evaluate.mjs` — places every chip in the catalog, wires power, and
  runs a full evaluate(). Guards the two crash classes found in June 2026:
  gate types dispatching to evaluator methods that don't exist, and pinout
  arrays shorter than the declared pin count.
- `logic-analyzer-regression.mjs` — Logic-panel correctness: reconvergent
  fanout (NAND-built XOR truth table) and 4-pin tactile buttons being
  recognized as named analyzer inputs.

Add a scenario by dropping a `*.mjs` into `scenarios/` that `process.exit(1)` on
failure; `run-scenarios.mjs` picks it up automatically.

## Testing the shipped example circuits

```bash
node js/debug/test-examples.mjs            # summary of every js/examples/*.json
node js/debug/test-examples.mjs --verbose  # + full report() per example
node js/debug/test-examples.mjs adder      # only examples matching "adder"
```

It loads each example, evaluates (and settles, if it has caps/clocks), prints a
one-line summary (lit LEDs, the character on each 7-seg, shorts/floats), and runs
any per-example **expectations** in the `EXPECTATIONS` map. Add an entry there to
lock in a demo's intended behaviour — e.g. the 4-bit adder asserts that 3 + 5
shows "358". Run it after any engine change to confirm the demos still work in
real situations.

