// ── Interaction hit-test consistency ─────────────────────────────────────────
// Guards the "what you hover is what you click" contract in interaction.js.
//
// The hover circle is drawn on state.hoveredHole (nearest occupied hole within
// the snap radius). Historically the click path ran a SEPARATE hit-test whose
// segment/bbox fallbacks could return a different target than the hole the
// circle was showing on — e.g. hovering a wire endpoint that sits on/near a
// resistor lead would select the resistor on click, not the wire. The fix
// makes the hovered hole's occupant the sole click target whenever a hole is
// hovered; segment/bbox body hits only apply when no hole is hovered.
//
// This drives the REAL Interaction handlers (_onMouseMove / _onMouseDown /
// _handleIdleClick) headlessly with a stub app + real BreadboardWorld,
// WireManager and components from the harness.
//
// Run:  node js/debug/scenarios/interaction-hit-test.mjs   (exits non-zero on failure)

import { CircuitHarness } from '../harness.mjs';
import { MODE } from '../../constants.js';

// Minimal DOM stubs so Interaction's constructor can bind its listeners.
const noop = () => {};
globalThis.document = { addEventListener: noop };
globalThis.window = { addEventListener: noop, getSelection: () => ({ toString: () => '' }) };

const { Interaction } = await import('../../interaction.js');

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}

// ── Board under test ─────────────────────────────────────────────────────────
// chip   74x04 at col 20 (pins straddle the channel)
// R1     resistor lead running along row 2, cols 30→36
// W1     wire whose top endpoint (33,2) sits directly ON R1's lead path
// W2     wire whose bottom endpoint (20,3) is one hole above chip pin A1
const h = CircuitHarness.fromJSON({
  components: [
    { id: 1, type: 'chip', chipId: '74x04', tileX: 0, tileY: 0, col: 20, row: 4 },
    { id: 2, type: 'resistor', resistance: 1000,
      startHoleId: '0:0:main:30:2', endHoleId: '0:0:main:36:2' },
  ],
  wires: [
    { startHoleId: '0:0:main:33:2', endHoleId: '0:0:main:33:8', num: 0 },
    { startHoleId: '0:0:main:20:3', endHoleId: '0:0:main:15:0', num: 1 },
  ],
});
const chip = h.byId(1);
const R1 = h.byId(2);
const W1 = h.wireManager.wires[0];
const W2 = h.wireManager.wires[1];

// ── Stub app around the real world/components/wires ─────────────────────────
const canvas = {
  style: {},
  addEventListener: noop,
  parentElement: { addEventListener: noop },
  getBoundingClientRect: () => ({ left: 0, top: 0, right: 100000, bottom: 100000 }),
};
const app = {
  world: h.world,
  canvas,
  renderer: { canvas, zoom: 1, screenToWorld: (x, y) => ({ x, y }) },
  state: {
    components: h.components,
    wireManager: h.wireManager,
    hoveredHole: null,
    selectedItems: [],
    selectRect: null,
    ghost: null,
    compDragPreview: null,
    mouseWorld: { x: 0, y: 0 },
  },
  simulator: null,
  onCircuitChanged: noop,
  pushUndo: noop,
  _highlightSelectedInAnalyzer: noop,
  _closeInfoPanel: noop,
  _clearActiveBtn: noop,
  _renderDirty: false,
};
const inter = new Interaction(app);

const holePos = (id) => h.world.getHolePosById(id);
function moveTo(x, y) {
  // World == screen (identity transform, zoom 1)
  inter._onMouseMove({ clientX: x, clientY: y });
}
function mouseDownAt(x, y) {
  moveTo(x, y);
  inter._onMouseDown({ button: 0, clientX: x, clientY: y, altKey: false,
                       preventDefault: noop });
}
function resetGesture() {
  inter._maybeMoving = false;
  inter._maybeMovingGroup = false;
  inter._maybeMovingWireEp = false;
  inter._maybeMovingCompEp = false;
  inter._maybePanning = false;
  inter._moveTarget = null;
  inter._moveWireEp = null;
  inter._moveCompEp = null;
  inter.mode = MODE.IDLE;
  app.state.selectedItems = [];
}

// ── 1. Wire endpoint lying ON a resistor lead: the circle wins ───────────────
{
  console.log('\n1. Hovered wire endpoint on a resistor lead path');
  const p = holePos(W1.startHoleId); // (33,2) — on R1\'s segment
  moveTo(p.x + 3, p.y + 2);
  check('hover circle is on the endpoint hole',
        app.state.hoveredHole?.id === W1.startHoleId,
        `hovered=${app.state.hoveredHole?.id}`);
  check('no component steals the click', inter._findComponentAtMouse() === null);
  check('click target is the wire', inter._findWireAtMouse() === W1);
  check('cursor telegraphs a target', canvas.style.cursor === 'pointer');

  mouseDownAt(p.x + 3, p.y + 2);
  check('mousedown arms wire-endpoint drag', inter._maybeMovingWireEp === true &&
        inter._moveWireEp?.wire === W1 && inter._moveWireEp?.endpoint === 'start');
  check('mousedown did not arm a component move', !inter._maybeMoving);
  inter._onMouseUp({ button: 0, clientX: p.x + 3, clientY: p.y + 2 });
  check('tap (no drag) selects the wire',
        app.state.selectedItems.length === 1 &&
        app.state.selectedItems[0].type === 'wire' &&
        app.state.selectedItems[0].ref === W1);
  resetGesture();
}

// ── 2. Wire endpoint one hole above a chip pin ───────────────────────────────
{
  console.log('\n2. Hovered wire endpoint adjacent to a chip');
  const p = holePos(W2.startHoleId); // (20,3), 20px above chip pin row
  moveTo(p.x - 2, p.y + 4);
  check('hover circle is on the endpoint hole',
        app.state.hoveredHole?.id === W2.startHoleId);
  check('chip does not steal the click', inter._findComponentAtMouse() === null);
  check('click target is the wire', inter._findWireAtMouse() === W2);
  mouseDownAt(p.x - 2, p.y + 4);
  check('mousedown arms wire-endpoint drag', inter._maybeMovingWireEp === true &&
        inter._moveWireEp?.wire === W2);
  resetGesture();
}

// ── 3. Hovering a wire-like component pin arms a pin drag ────────────────────
{
  console.log('\n3. Hovered resistor pin → drag moves that pin');
  const p = holePos(R1.startHoleId); // (30,2)
  moveTo(p.x + 2, p.y - 3);
  check('hover circle is on the resistor pin',
        app.state.hoveredHole?.id === R1.startHoleId);
  check('hit-test returns the resistor', inter._findComponentAtMouse() === R1);
  mouseDownAt(p.x + 2, p.y - 3);
  check('mousedown arms pin-endpoint drag', inter._maybeMovingCompEp === true &&
        inter._moveCompEp?.comp === R1 && inter._moveCompEp?.endpoint === 'start');
  check('whole-component move NOT armed', !inter._maybeMoving);
  resetGesture();
}

// ── 4. Hovering a chip pin targets the chip ──────────────────────────────────
{
  console.log('\n4. Hovered chip pin → chip is the target');
  const pinHole = chip.pins[0].holeId;
  const p = holePos(pinHole);
  moveTo(p.x + 3, p.y);
  check('hover circle is on the chip pin', app.state.hoveredHole?.id === pinHole);
  check('hit-test returns the chip', inter._findComponentAtMouse() === chip);
  mouseDownAt(p.x + 3, p.y);
  check('mousedown arms component move', inter._maybeMoving === true &&
        inter._moveTarget === chip);
  resetGesture();
}

// ── 5. Body hits still work when no hole is hovered ──────────────────────────
{
  console.log('\n5. Body hit-tests (no hover circle)');
  // Chip body center: midpoint of first/last pins sits in the channel gap
  const a = holePos(chip.pins[0].holeId);
  const b = holePos(chip.pins[chip.pins.length - 1].holeId);
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
  moveTo(cx, cy);
  check('channel center: no hover circle', app.state.hoveredHole === null,
        `hovered=${app.state.hoveredHole?.id}`);
  check('bbox fallback returns the chip', inter._findComponentAtMouse() === chip);
  check('cursor telegraphs the body hit', canvas.style.cursor === 'pointer');

  // Resistor lead mid-span, a few px off the hole row (empty holes → no circle)
  const r = holePos(R1.startHoleId);
  moveTo(r.x + 30, r.y + 5);
  check('mid-lead: no hover circle', app.state.hoveredHole === null);
  check('segment fallback returns the resistor', inter._findComponentAtMouse() === R1);
  mouseDownAt(r.x + 30, r.y + 5);
  check('mousedown arms whole-resistor move', inter._maybeMoving === true &&
        inter._moveTarget === R1);
  resetGesture();

  // Empty board space
  const far = holePos('0:0:main:50:8');
  moveTo(far.x + 8, far.y + 8);
  check('empty space: no target', inter._findComponentAtMouse() === null &&
        inter._findWireAtMouse() === null);
  check('cursor is default over empty space', canvas.style.cursor === 'default');
}

// ── 6. Locked wire endpoint: no drag armed, no pan ───────────────────────────
{
  console.log('\n6. Locked wire endpoint');
  app.state.lockedWireIds = new Set([W1.id]);
  const p = holePos(W1.startHoleId);
  mouseDownAt(p.x + 3, p.y + 2);
  check('locked endpoint arms nothing', !inter._maybeMovingWireEp &&
        !inter._maybeMoving && !inter._maybePanning);
  delete app.state.lockedWireIds;
  resetGesture();
}

// ── 7. Multi-selection: grabbing a selected wire endpoint drags the group ────
{
  console.log('\n7. Group grab beats endpoint drag for selected wires');
  app.state.selectedItems = [
    { type: 'component', ref: R1 },
    { type: 'wire', ref: W1 },
  ];
  const p = holePos(W1.startHoleId);
  mouseDownAt(p.x + 3, p.y + 2);
  check('mousedown arms a group move', inter._maybeMoving === true &&
        inter._maybeMovingGroup === true);
  check('endpoint drag NOT armed for in-group wire', !inter._maybeMovingWireEp);
  resetGesture();

  // But an UNSELECTED wire endpoint inside the group bbox still wins
  app.state.selectedItems = [
    { type: 'component', ref: R1 },
    { type: 'wire', ref: W1 },
  ];
  const q = holePos(W1.endHoleId); // (33,8): W1 selected → group; use W2? outside bbox.
  // W1's far endpoint is part of the same selected wire → still group grab:
  mouseDownAt(q.x + 3, q.y - 2);
  check('other endpoint of selected wire also group-grabs',
        inter._maybeMoving === true && inter._maybeMovingGroup === true);
  resetGesture();
}

console.log(failures === 0
  ? '\nAll interaction hit-test checks passed.'
  : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
