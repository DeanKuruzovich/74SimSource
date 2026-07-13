// ── Onramp lesson definitions regression ─────────────────────────────────────
// Structural + behavioural guard for js/onramp-lessons.js (the lesson player's
// single source of truth). Complements onramp-lesson-boards.mjs, which checks
// the boards themselves; this one checks the lesson objects built on them:
//
//   1. Every lesson: "Lesson N:" title matches its array slot (the completion
//      popup is keyed by index), unique ids, locked ids exist in initialState.
//   2. Every step: required fields, quiz steps have exactly one correct
//      option + a setup hook, inline SVGs are tag-balanced.
//   3. Every board-step validate() runs against REAL engine state (via the
//      harness) and must be false before the intended interaction and truthy
//      after — catching wrong component ids / property names / ffState keys.
//
// Run:  node js/debug/scenarios/onramp-lesson-definitions.mjs   (exits non-zero on failure)

import { LESSONS } from '../../onramp-lessons.js';
import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  // Structural sweep is noisy when green — only print failures and summaries.
  if (!pass) { console.log(`  ✗ ${name}${detail ? '   (' + detail + ')' : ''}`); failures++; }
}

// ── 1 + 2. Structure ─────────────────────────────────────────────────────────
console.log(`\n1. Structure of ${LESSONS.length} lessons`);
const ids = new Set();
// Title numbering must be contiguous and match array order. It may start at 0:
// "Lesson 0" is the tool-orientation prelude, and the displayed titles are
// rendered directly everywhere (catalog cards, completion popup), so only the
// ORDER ↔ NUMBER agreement matters, not a fixed 1-based origin. Keeping the
// origin stable also keeps the "Lesson N" cross-references inside later
// lessons' prose — and their translations in js/i18n/lessons.*.json — valid.
const firstNum = parseInt((LESSONS[0]?.title.match(/^Lesson (\d+):/) || [])[1], 10);
check('first lesson numbered 0 or 1', firstNum === 0 || firstNum === 1,
  LESSONS[0]?.title);
LESSONS.forEach((lesson, idx) => {
  const n = idx + 1;
  check(`lesson ${n} title matches slot`, lesson.title.startsWith(`Lesson ${firstNum + idx}:`), lesson.title);
  check(`lesson ${n} id unique`, !ids.has(lesson.id), lesson.id);
  ids.add(lesson.id);
  check(`lesson ${n} has description`, typeof lesson.description === 'string' && lesson.description.length > 10);
  check(`lesson ${n} has initialState`, !!lesson.initialState && Array.isArray(lesson.initialState.components));

  const compIds = new Set(lesson.initialState.components.map(c => c.id));
  const wireIds = new Set((lesson.initialState.wires || []).map(w => w.id));
  for (const id of lesson.lockedComponents) check(`lesson ${n} locked comp ${id} exists`, compIds.has(id));
  for (const id of lesson.lockedWires) check(`lesson ${n} locked wire ${id} exists`, wireIds.has(id));

  const stepIds = new Set();
  for (const step of lesson.steps) {
    const tag = `lesson ${n} step '${step.id}'`;
    check(`${tag} id unique`, !stepIds.has(step.id));
    stepIds.add(step.id);
    check(`${tag} has title+content`, !!step.title && typeof step.content === 'string' && step.content.length > 40);
    check(`${tag} allowedActions is array`, Array.isArray(step.allowedActions));
    check(`${tag} validate is fn or null`, step.validate === null || typeof step.validate === 'function');
    check(`${tag} not both fullWidth and boardState`, !(step.fullWidth && step.boardState));
    const corrects = (step.content.match(/data-answer="correct"/g) || []).length;
    const wrongs = (step.content.match(/data-answer="wrong"/g) || []).length;
    if (corrects + wrongs > 0) {
      check(`${tag} has exactly 1 correct quiz option`, corrects === 1, `${corrects} correct`);
      check(`${tag} has 3 wrong quiz options`, wrongs === 3, `${wrongs} wrong`);
      check(`${tag} quiz has setup hook`, typeof step.setup === 'function');
    }
    const svgOpen = (step.content.match(/<svg /g) || []).length;
    const svgClose = (step.content.match(/<\/svg>/g) || []).length;
    check(`${tag} svg tags balanced`, svgOpen === svgClose, `${svgOpen} open / ${svgClose} close`);
  }
});
console.log(failures === 0 ? '  ✓ all structural checks passed' : '  (see failures above)');

// ── 3. Board-step validators against real engine state ───────────────────────
// The validators only touch app.state.components and the _ledLitOnce /
// _quizAnswered flags, so a harness-backed stand-in is faithful.
console.log('\n2. Board-step validators against the real engine');
function fakeApp(harness, ledLitOnce) {
  return { _ledLitOnce: ledLitOnce, _quizAnswered: false, state: { components: harness.components } };
}
// Look lessons up by their stable id, never by array index — inserting a
// lesson (e.g. the Lesson 0 tool orientation) shifts every index and silently
// pointed these checks at the wrong lessons in the past.
const lessonOf = (lessonId) => {
  const l = LESSONS.find(x => x.id === lessonId);
  if (!l) throw new Error(`no lesson with id '${lessonId}'`);
  return l;
};
const stepOf = (lessonId, stepId) => {
  const s = lessonOf(lessonId).steps.find(x => x.id === stepId);
  if (!s) throw new Error(`lesson '${lessonId}' has no step '${stepId}'`);
  return s;
};
const loud = (name, pass, detail = '') => {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
};

{ // Latches, SR latch: gate = green Q LED latched on via SET
  const step = stepOf('latches_flipflops', 'sr_latch_board');
  const h = CircuitHarness.fromJSON(step.boardState); h.evaluate();
  h.settle({ maxSteps: 2000 }); // power-on-reset cap boots the latch into RESET
  loud('latches sr_latch: false at boot', step.validate(fakeApp(h, true)) === false);
  h.press(5); h.settle({ maxSteps: 2000 });
  loud('latches sr_latch: true after SET', !!step.validate(fakeApp(h, true)));
}
{ // Latches, coin toss: gate = TOSS held
  const step = stepOf('latches_flipflops', 'dff_board');
  const h = CircuitHarness.fromJSON(step.boardState); h.evaluate();
  loud('latches dff: false idle', step.validate(fakeApp(h, true)) === false);
  h.press(3);
  loud('latches dff: true while TOSS held', !!step.validate(fakeApp(h, true)));
}
{ // 555, dual-timer board: gate = trigger button held
  const step = stepOf('timer_555', 'board_555');
  const h = CircuitHarness.fromJSON(step.boardState); h.evaluate();
  loud('555: false idle', step.validate(fakeApp(h, true)) === false);
  h.press(5);
  loud('555: true while trigger held', !!step.validate(fakeApp(h, true)));
}
{ // Encoders, 8-3-8: gate = any switch on
  const step = stepOf('encoders_decoders', 'board_838');
  const h = CircuitHarness.fromJSON(step.boardState); h.evaluate();
  loud('838: false all-off', step.validate(fakeApp(h, true)) === false);
  h.setSwitch(120, true); h.evaluate();
  loud('838: true with a switch on', !!step.validate(fakeApp(h, true)));
}
// Boards gated purely on _ledLitOnce
for (const [lid, sid] of [
  ['schmitt_triggers', 'rc_oscillator'],
  ['serial_piso_sipo', 'board_piso'],
  ['memory_intro', 'board_mem_intro'],
  ['rom_deep', 'board_rom'],
]) {
  const step = stepOf(lid, sid);
  const h = CircuitHarness.fromJSON(step.boardState); h.evaluate();
  loud(`${lid} ${sid}: gated on ledLitOnce`,
    step.validate(fakeApp(h, false)) === false && step.validate(fakeApp(h, true)) === true);
}
{ // RAM: needs a real write in ffState AND a lit LED
  const step = stepOf('ram_deep', 'board_ram');
  const h = CircuitHarness.fromJSON(step.boardState); h.evaluate();
  loud('ram: false before write (even with lit LED)', step.validate(fakeApp(h, true)) === false);
  h.setSwitch(14, true); h.press(19); h.evaluate(); h.release(19); h.evaluate();
  loud('ram: true after write-then-read-back', step.validate(fakeApp(h, true)) === true);
  loud('ram: still requires the LED evidence', step.validate(fakeApp(h, false)) === false);
}

{ // FSM combination lock: gate = green UNLOCK LED lit after 1-2-3
  const step = stepOf('finite_state_machines', 'lock_open');
  const h = CircuitHarness.fromJSON(lessonOf('finite_state_machines').initialState); h.evaluate();
  const tap = (id) => { h.press(id); h.run(0.05); h.release(id); h.run(0.05); };
  h.run(0.5); // let the 4538's power-up reset pulse finish before pressing anything
  loud('lock: false at boot (LOCKED)', step.validate(fakeApp(h, true)) === false);
  tap(7); tap(9); tap(11); // buttons 1, 2, 3 in order
  loud('lock: true once green UNLOCK lights', !!step.validate(fakeApp(h, true)));
}

console.log(failures === 0 ? '\nAll onramp lesson definition checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
