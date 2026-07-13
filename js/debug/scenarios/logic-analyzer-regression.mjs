// ── Logic analyzer regression suite ─────────────────────────────────────────
// Guards two analyzer fixes (June 2026):
//
//   1. Reconvergent fanout — the trace's cycle guard used an add-only visited
//      set, so a gate output feeding TWO downstream gate inputs (e.g. the
//      shared NAND in a NAND-built XOR) collapsed to constant 0 on its second
//      reference, corrupting expressions and truth tables. The guard is now
//      path-based (keys removed after the recursive trace returns).
//
//   2. Tactile button inputs — the input-naming pass looked for a pin named
//      'A' on every input component, but 4-pin tactile buttons have TL/TR/
//      BL/BR, so they were silently dropped and anything they drove showed
//      as "floating". The pass now uses per-type candidates and prefers the
//      pin whose net is not a power rail.
//
// Run:  node js/debug/scenarios/logic-analyzer-regression.mjs   (exits non-zero on failure)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent, SwitchComponent, ButtonComponent, LEDComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { LogicAnalyzer, evalExpr } from '../../logic.js';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}

// ── 1. Reconvergent fanout: XOR built from four NANDs on a 74x00 ────────────
// N1 = NAND(A,B) fans out to both N2 = NAND(A,N1) and N3 = NAND(N1,B);
// Y = NAND(N2,N3) is XOR(A,B). Before the fix the second reference to N1
// read as constant 0 and the truth table degenerated.
{
  console.log('\n1. Reconvergent fanout (NAND-built XOR on a 74x00)');
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('74x00');
  chip.place(0, 0, 10, 4);

  const swA = new SwitchComponent();
  swA.placeWireLike(holeId(0, 0, 'main', 0, 0), holeId(0, 0, 'main', 1, 0));
  const swB = new SwitchComponent();
  swB.placeWireLike(holeId(0, 0, 'main', 2, 0), holeId(0, 0, 'main', 3, 0));

  const led = new LEDComponent();
  led.placeWireLike(holeId(0, 0, 'main', 5, 0), holeId(0, 0, 'power', 5, 0));

  const wm = new WireManager();
  const pin = (n) => chip.getPinByName(n).holeId;
  // A (switch A output side) → 1A and 2A
  wm.addWire(swA.pins[1].holeId, pin('1A'));
  wm.addWire(swA.pins[1].holeId, pin('2A'));
  // B → 1B and 3B
  wm.addWire(swB.pins[1].holeId, pin('1B'));
  wm.addWire(swB.pins[1].holeId, pin('3B'));
  // N1 = 1Y fans out to 2B AND 3A (the reconvergent edge)
  wm.addWire(pin('1Y'), pin('2B'));
  wm.addWire(pin('1Y'), pin('3A'));
  // N2, N3 → final NAND
  wm.addWire(pin('2Y'), pin('4A'));
  wm.addWire(pin('3Y'), pin('4B'));
  // Y → LED
  wm.addWire(pin('4Y'), led.pins[0].holeId);

  const analyzer = new LogicAnalyzer();
  analyzer.analyze(world, [chip, swA, swB, led], wm);

  const e = analyzer.expressions[0];
  check('LED expression exists', !!(e && e.expr));
  check('expression uses both switch inputs', e && e.inputNames.length === 2,
    e ? e.inputNames.join(',') : 'none');

  if (e && e.expr && e.inputNames.length === 2) {
    const [nA, nB] = e.inputNames;
    const truth = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) =>
      evalExpr(e.expr, { [nA]: a, [nB]: b }));
    check('truth table is XOR (0,1,1,0)', truth.join('') === '0110', truth.join(''));
  }
}

// ── 2. Tactile 4-pin button recognized as an analyzer input ─────────────────
// BTN.TL tied to the VCC rail, BTN.TR drives 1A of a 74x08 AND; switch on 1B;
// LED on 1Y. The button must appear as a named input (rail side must NOT be
// the named net), and the expression must be AND(BTN, SW).
{
  console.log('\n2. Tactile button as analyzer input');
  const world = new BreadboardWorld(1, 1);
  const chip = new ChipComponent('74x08');
  chip.place(0, 0, 10, 4);

  const btn = new ButtonComponent();
  btn.place(0, 0, 0, 0);  // horizontal: TL(0,0) TR(3,0) BL(0,2) BR(3,2)

  const sw = new SwitchComponent();
  sw.placeWireLike(holeId(0, 0, 'main', 5, 0), holeId(0, 0, 'main', 6, 0));

  const led = new LEDComponent();
  led.placeWireLike(holeId(0, 0, 'main', 8, 0), holeId(0, 0, 'power', 8, 0));

  const wm = new WireManager();
  const pin = (n) => chip.getPinByName(n).holeId;
  wm.addWire(holeId(0, 0, 'power', 0, 1), btn.pins[0].holeId);  // VCC → TL
  wm.addWire(btn.pins[1].holeId, pin('1A'));                    // TR → 1A
  wm.addWire(sw.pins[1].holeId, pin('1B'));                     // SW → 1B
  wm.addWire(pin('1Y'), led.pins[0].holeId);                    // 1Y → LED

  const analyzer = new LogicAnalyzer();
  analyzer.analyze(world, [chip, btn, sw, led], wm);

  const e = analyzer.expressions[0];
  check('LED expression exists', !!(e && e.expr));
  const names = e ? e.inputNames : [];
  check('button appears as an input', names.some(n => n.startsWith('BTN')), names.join(','));
  check('switch appears as an input', names.some(n => n.startsWith('SW')), names.join(','));

  if (e && e.expr && names.length === 2) {
    const [n1, n2] = names;
    const truth = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) =>
      evalExpr(e.expr, { [n1]: a, [n2]: b }));
    check('truth table is AND (0,0,0,1)', truth.join('') === '0001', truth.join(''));
  }
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
