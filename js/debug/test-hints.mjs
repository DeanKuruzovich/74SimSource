// ── Onramp hint-target validation ────────────────────────────────────────────
// Walks every course → lesson → step and checks that each step's visual hint
// (see js/onramp-hints.js) actually resolves against the board that step runs
// on. Catches typo'd hole ids, wrong component ids, misspelled chip pin names
// and toolbar ids that don't match the step's allowedActions — silent no-ops
// in the browser, hard failures here.
//
// Run:  node js/debug/test-hints.mjs

import { COURSES } from '../onramp-courses.js';
import { resolveTarget } from '../onramp-hints.js';
import { BreadboardWorld, parseHoleId } from '../breadboard.js';
import { deserializeComponent } from '../components.js';

let checkedTargets = 0;
let checkedHints = 0;
const failures = [];

function fail(where, msg) {
  failures.push(`${where}: ${msg}`);
}

function validHoleId(id) {
  if (typeof id !== 'string') return false;
  const h = parseHoleId(id);
  if (!Number.isInteger(h.tileX) || !Number.isInteger(h.tileY)) return false;
  if (!Number.isInteger(h.col) || !Number.isInteger(h.row)) return false;
  if (h.type === 'main') return h.col >= 0 && h.col <= 62 && h.row >= 0 && h.row <= 9;
  if (h.type === 'power') return h.col >= 0 && h.col <= 62 && h.row >= 0 && h.row <= 3;
  return false;
}

// A chip referenced by chipId string is usually one the *user* will place
// during the step, so it can't resolve against the initial board. Verify the
// chipId and pin name are real by deserializing a probe instance instead.
function checkChipReference(where, chipId, pinName) {
  const probe = deserializeComponent({
    id: 999999, type: 'chip', name: chipId, tileX: 0, tileY: 0,
    col: 4, row: 4, placed: true, chipId,
  });
  if (!probe) return fail(where, `chipId '${chipId}' failed to deserialize`);
  if (pinName !== undefined) {
    if (!probe.pins || !probe.pins.some(p => p.name === pinName)) {
      fail(where, `chip '${chipId}' has no pin named '${pinName}'`);
    }
  }
}

function checkTarget(where, t, app) {
  checkedTargets++;
  if (!t || typeof t !== 'object') return fail(where, 'target is not an object');

  if (t.arrow) {
    checkTarget(`${where}.arrow.from`, t.arrow.from, app);
    checkTarget(`${where}.arrow.to`, t.arrow.to, app);
    return;
  }

  // Static hole-id syntax checks first — they diagnose better than a bare
  // "did not resolve".
  if (t.hole !== undefined && !validHoleId(t.hole)) {
    return fail(where, `bad hole id '${t.hole}'`);
  }
  if (t.area !== undefined) {
    if (!Array.isArray(t.area) || t.area.length !== 2) {
      return fail(where, 'area must be [holeA, holeB]');
    }
    for (const id of t.area) {
      if (!validHoleId(id)) return fail(where, `bad area hole id '${id}'`);
    }
  }

  // Chip-by-string references (user-placed later): validate the chip registry
  // instead of the live board.
  if (t.chip !== undefined && typeof t.chip === 'string') {
    return checkChipReference(where, t.chip);
  }
  if (t.pin && t.pin.chip !== undefined) {
    return checkChipReference(where, t.pin.chip, t.pin.name);
  }

  // Everything else must resolve against the step's actual board.
  const shape = resolveTarget(app, t);
  if (!shape) return fail(where, `target did not resolve: ${JSON.stringify(t)}`);

  // Pin-by-comp-id: resolveTarget already proved the pin exists; nothing more.
}

function buildApp(boardState) {
  const world = new BreadboardWorld(2, 2);
  for (const { tx, ty } of (boardState.extraTiles || [])) world.addTile(tx, ty);
  const components = [];
  for (const d of (boardState.components || [])) {
    const comp = deserializeComponent(d);
    if (comp) components.push(comp);
  }
  return { world, state: { components } };
}

for (const course of Object.values(COURSES)) {
  course.lessons.forEach((lesson, li) => {
    // The board persists across steps: a step with boardState swaps it, later
    // steps inherit it. Mirror that walk so each hint checks against the board
    // it will really be shown over.
    let board = lesson.initialState;
    let app = buildApp(board);

    lesson.steps.forEach((step, si) => {
      if (step.boardState && step.boardState !== board) {
        board = step.boardState;
        app = buildApp(board);
      } else if (step.resetBoard && board !== lesson.initialState) {
        // resetBoard restores the lesson's working board after demo boards
        board = lesson.initialState;
        app = buildApp(board);
      }
      if (!step.hint) return;
      checkedHints++;
      const where = `${course.id} / lesson ${li} (${lesson.id}) / step ${si} (${step.id})`;

      if (step.hint.toolbar !== undefined) {
        const actions = step.allowedActions || [];
        if (!actions.includes(step.hint.toolbar)) {
          fail(where, `hint.toolbar '${step.hint.toolbar}' not in allowedActions [${actions}]`);
        }
      }
      for (const t of (step.hint.targets || [])) checkTarget(where, t, app);
    });
  });
}

console.log(`Checked ${checkedHints} hints / ${checkedTargets} targets across ${Object.keys(COURSES).length} courses.`);
if (failures.length) {
  console.error(`\n${failures.length} FAILURE(S):`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exitCode = 1;
} else {
  console.log('All hint targets resolve. ✓');
}
