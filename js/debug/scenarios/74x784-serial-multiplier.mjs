// ── 74x784 8-bit serial/parallel multiplier regression ──────────────────────
// The 74x784 (js/chips/chips39.js) is the Signetics FAST serial/parallel
// multiplier with a serial add/subtract stage. It uses the dedicated
// SERIAL_PARALLEL_MULT_784 engine primitive. This scenario guards the DB entry
// and the primitive against the verified datasheet behaviour (1987 Signetics
// FAST Data Manual, pp. 6-767..6-770):
//   - verified pin map (X0=LSB..X7=MSB parallel; Y serial in; SP serial product;
//     S±B serial product ± B; PLn active-LOW parallel load; A/S select)
//   - the 8-bit multiplicand X is parallel-loaded on a clock edge with PLn LOW
//   - the multiplier Y is clocked in serially, LSB first, and the product SP
//     comes out serially, LSB first (the load clock also takes the first Y bit)
//   - the S±B output is the serial product with a serial B stream added
//     (A/S HIGH) or subtracted (A/S LOW)
//
// Method: place ONE 74x784 and keep the same chip + sim instance across a run so
// the multiply state persists. Re-wire all inputs each solve.
//
// Run:  node js/debug/scenarios/74x784-serial-multiplier.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x784');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Current input state.
const st = {
  clk: 0, pln: 1, as: 1, y: 0, b: 0, bn1: 0, m: 0, k: 0, x: 0,
};

function apply() {
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x784 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), bit ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CP',  st.clk);
  wirePin('PLn', st.pln);
  wirePin('ASn', st.as);
  wirePin('Y',   st.y);
  wirePin('Bn',  st.b);
  wirePin('Bn1', st.bn1);
  wirePin('M',   st.m);
  wirePin('K',   st.k);
  for (let i = 0; i < 8; i++) wirePin('X' + i, (st.x >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const sp   = () => (isHigh(read('SP'))  ? 1 : 0);
const spb  = () => (isHigh(read('SPB')) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Run one full multiply: load X, then stream nbits of Y (LSB first) plus a B
// stream (LSB first), collecting SP and S±B on each rising clock. Returns the
// reconstructed integers.
function multiply(X, Y, B, nbits, addMode) {
  st.x = X; st.as = addMode ? 1 : 0;
  let product = 0, sumB = 0;
  for (let t = 0; t < nbits; t++) {
    st.pln = (t === 0) ? 0 : 1;         // load on the first clock only
    st.y   = (Y >> t) & 1;
    st.b   = (B >> t) & 1;
    st.clk = 0; apply();                // set data with clock low
    st.clk = 1; apply();                // rising edge: consume Y bit, emit bits
    product |= sp()  << t;
    sumB    |= spb() << t;
  }
  st.clk = 0; apply();
  return { product, sumB };
}

// ── 1. Unsigned products (SP path), B held 0 ─────────────────────────────────
const cases = [
  [5, 3], [0, 123], [123, 0], [1, 200], [255, 255], [17, 19], [200, 3], [255, 1],
];
for (const [X, Y] of cases) {
  const { product } = multiply(X, Y, 0, 16, true);
  assert(product === X * Y, `SP: ${X} * ${Y} = ${X * Y}, got ${product}`);
}

// ── 2. Add stage: S±B = X·Y + B (A/S HIGH) ───────────────────────────────────
{
  const { product, sumB } = multiply(5, 3, 2, 16, true);
  assert(product === 15, `add-mode product: expected 15, got ${product}`);
  assert(sumB === 15 + 2, `S±B add: expected 17, got ${sumB}`);
}
{
  const { sumB } = multiply(17, 19, 100, 16, true);
  assert(sumB === 17 * 19 + 100, `S±B add: expected ${17 * 19 + 100}, got ${sumB}`);
}

// ── 3. Subtract stage: S±B = X·Y − B (A/S LOW), result stays non-negative ────
{
  const { product, sumB } = multiply(5, 3, 2, 16, false);
  assert(product === 15, `sub-mode product: expected 15, got ${product}`);
  assert(sumB === 15 - 2, `S±B subtract: expected 13, got ${sumB}`);
}
{
  const { sumB } = multiply(20, 6, 100, 16, false);   // 120 - 100 = 20
  assert(sumB === 120 - 100, `S±B subtract: expected 20, got ${sumB}`);
}

// ── 4. Reload restarts a clean multiply (no carry from the previous one) ─────
{
  multiply(255, 255, 0, 16, true);        // dirty the accumulator
  const { product } = multiply(7, 9, 0, 16, true);
  assert(product === 63, `reload clears state: expected 63, got ${product}`);
}

if (failures.length) {
  console.error('74x784 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x784 serial/parallel multiplier: all checks passed');
