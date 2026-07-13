// ── Onramp guided lessons — end-to-end walk ──────────────────────────────────
// Plays the two build-a-gate lessons (Lesson 0: 74x32 OR, Lesson 2: 74x08 AND)
// the way a user would: start from each lesson's shipped initialState, perform
// every step's canonical action (place the chip, add each wire, press the
// buttons), and assert the step's real validate() flips false → true.
//
// This guards two classes of past regressions that shipped silently because
// nothing exercised the lesson content itself:
//   1. Toolbar chip ids that aren't CHIP_DB keys ('chip:7408') — the placed
//      chip had no pins and no step could ever validate.
//   2. Board layouts that are electrically dead — the original LED had both
//      leads on the col-30 strip, shorting it through the breadboard, so the
//      final "LED lights" step could never complete.
// It also covers the Lesson 0 wire-numbers demo board (button lights the LED
// through the three-wire net chain) and asserts the OR/AND truth tables.
//
// Run:  node js/debug/scenarios/onramp-guided-lessons.mjs   (exits non-zero on fail)

import { BreadboardWorld } from '../../breadboard.js';
import { WireManager } from '../../wire.js';
import { deserializeComponent, ChipComponent } from '../../components.js';
import { CircuitSimulator } from '../../simulator.js';
import { COMP } from '../../constants.js';
import { LESSONS } from '../../onramp-lessons.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Minimal stand-in for the OnrampApp shape the lesson validators consume:
// { world, state: { components, wireManager } }. Simulation is driven manually.
function makeApp(initialState) {
  const world = new BreadboardWorld(2, 2);
  for (const { tx, ty } of (initialState.extraTiles || [])) world.addTile(tx, ty);
  const components = [];
  for (const d of (initialState.components || [])) {
    const comp = deserializeComponent(d);
    if (comp) components.push(comp);
  }
  const wireManager = new WireManager();
  wireManager.deserialize(initialState.wires || [], world);
  const simulator = new CircuitSimulator();
  const app = { world, state: { components, wireManager } };
  app.evaluate = () => simulator.evaluate(world, components, wireManager);
  app.press = (id, down) => {
    const b = components.find(c => c.id === id && c.type === COMP.PUSH_BUTTON);
    if (!b) failures.push(`no push button with id ${id}`);
    else b.pressed = down;
    app.evaluate();
  };
  app.led = (id) => components.find(c => c.id === id && c.type === COMP.LED);
  return app;
}

// Walk one build-a-gate lesson. Each entry pairs a step id with the action
// that satisfies it; validate() must be false before and true after.
function walkGateLesson(lesson, chipId, stepActions, ledId, truthTable) {
  const name = lesson.id;
  const app = makeApp(lesson.initialState);
  app.evaluate();

  for (const [stepId, action] of stepActions) {
    const step = lesson.steps.find(s => s.id === stepId);
    if (!step) { failures.push(`${name}: no step '${stepId}'`); continue; }
    if (!step.validate) { failures.push(`${name}/${stepId}: step has no validate`); continue; }
    assert(!step.validate(app), `${name}/${stepId}: validate passed before the user acted`);
    action(app);
    app.evaluate();
    assert(step.validate(app), `${name}/${stepId}: validate still failing after the canonical action`);
  }

  // Truth table on the finished board: [pressA, pressB, expectLit]
  for (const [a, b, lit] of truthTable) {
    app.press(1, a);
    app.press(3, b);
    assert(app.led(ledId).lit === lit,
      `${name}: A=${a} B=${b} → LED expected ${lit ? 'LIT' : 'off'}, got ${app.led(ledId).lit ? 'LIT' : 'off'}`);
  }
  app.press(1, false);
  app.press(3, false);
}

// Canonical user wiring, shared by both gate lessons (same board layout).
// Wires deliberately land on strip-mates of the holes the validators name, so
// the strip-connectivity path is exercised, not just exact-hole matches.
function gateActions(chipId) {
  const placeChip = (app) => {
    const chip = new ChipComponent(chipId);
    chip.id = 99;
    chip.place(0, 0, 18, 4);
    app.state.components.push(chip);
  };
  const wire = (from, to) => (app) => app.state.wireManager.addWireSmart(from, to, app.world);
  const pinHole = (app, pin) => {
    const chip = app.state.components.find(c => c.chipId === chipId && c.placed);
    return chip.pins.find(p => p.name === pin).holeId;
  };
  const wireFromPin = (pin, to) => (app) => app.state.wireManager.addWireSmart(pinHole(app, pin), to, app.world);

  return [
    ['place_chip', placeChip],
    ['wire_vcc', wireFromPin('VCC', '0:0:power:18:1')],
    ['wire_gnd', wireFromPin('GND', '0:0:power:24:2')],
    [null, null], // placeholder — input step ids differ between the lessons
    [null, null],
    [null, null],
  ];
}

// ── Lesson 0: 74x32 OR ───────────────────────────────────────────────────────
{
  const lesson = LESSONS.find(l => l.id === 'sim_basics');
  assert(!!lesson, 'lesson sim_basics missing from LESSONS');
  if (lesson) {
    const acts = gateActions('74x32');
    acts[3] = ['wire_a', (app) => app.state.wireManager.addWireSmart('0:0:main:8:0', '0:0:main:18:5', app.world)];
    acts[4] = ['wire_b', (app) => app.state.wireManager.addWireSmart('0:0:main:12:0', '0:0:main:19:5', app.world)];
    acts[5] = ['wire_led', (app) => app.state.wireManager.addWireSmart('0:0:main:20:5', '0:0:main:30:6', app.world)];
    walkGateLesson(lesson, '74x32', acts, 5, [
      [false, false, false],
      [true, false, true],
      [false, true, true],
      [true, true, true],
    ]);

    // The test_or step gates on the LED being lit right now.
    const testStep = lesson.steps.find(s => s.id === 'test_or');
    assert(!!testStep && !!testStep.validate, 'sim_basics: test_or step with validate expected');

    // Wire-numbers demo board: pressing the button lights the LED through the
    // three-wire chain, and the chain really is one net.
    const netsStep = lesson.steps.find(s => s.id === 'nets');
    assert(!!netsStep && !!netsStep.boardState, 'sim_basics: nets step with boardState expected');
    if (netsStep && netsStep.boardState) {
      const demo = makeApp(netsStep.boardState);
      demo.evaluate();
      assert(!netsStep.validate(demo), 'sim_basics/nets: validate passed before pressing');
      demo.press(1, true);
      assert(demo.led(4).lit, 'sim_basics/nets: LED did not light through the wire chain');
      assert(netsStep.validate(demo), 'sim_basics/nets: validate failing while LED is lit');
      const chain = demo.state.wireManager.wires.filter(w => w.id <= 3);
      assert(new Set(chain.map(w => w.startNet)).size === 1,
        'sim_basics/nets: the three chain wires should share one net number');
    }
  }
}

// ── Lesson 2: 74x08 AND (the original guided lesson) ─────────────────────────
{
  const lesson = LESSONS.find(l => l.id === 'and_gate_basics');
  assert(!!lesson, 'lesson and_gate_basics missing from LESSONS');
  if (lesson) {
    const acts = gateActions('74x08');
    acts[3] = ['wire_input_a', (app) => app.state.wireManager.addWireSmart('0:0:main:8:0', '0:0:main:18:5', app.world)];
    acts[4] = ['wire_input_b', (app) => app.state.wireManager.addWireSmart('0:0:main:12:0', '0:0:main:19:5', app.world)];
    acts[5] = ['wire_output', (app) => app.state.wireManager.addWireSmart('0:0:main:20:5', '0:0:main:30:6', app.world)];
    walkGateLesson(lesson, '74x08', acts, 5, [
      [false, false, false],
      [true, false, false],
      [false, true, false],
      [true, true, true],
    ]);
  }
}

// Every lesson's toolbar chip actions must name real CHIP_DB chips — a bad id
// places a pinless husk the validators can never accept.
{
  const { getChipDef } = await import('../../chips.js');
  for (const lesson of LESSONS) {
    for (const step of lesson.steps) {
      for (const action of (step.allowedActions || [])) {
        if (!action.startsWith('chip:')) continue;
        const id = action.split(':')[1];
        assert(!!getChipDef(id),
          `${lesson.id}/${step.id}: allowedActions '${action}' is not a CHIP_DB key`);
      }
    }
  }
}

if (failures.length) {
  console.error(`✗ onramp-guided-lessons: ${failures.length} failure(s)`);
  for (const f of failures) console.error('   - ' + f);
  process.exit(1);
}
console.log('✓ onramp-guided-lessons: Lesson 0 (OR) and Lesson 2 (AND) walk clean, truth tables verified');
