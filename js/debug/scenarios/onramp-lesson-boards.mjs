// ── Onramp lesson boards regression ──────────────────────────────────────────
// Guards the board-state constants in js/onramp-lesson-boards.js used by
// onramp lessons 4-13. The example-derived boards are byte-for-byte
// copies of js/examples/*.json (behaviour-gated by test-examples.mjs), so
// here they only get a load/short sanity pass plus the interactions the
// lesson steps actually script. The boards that exist only in that module
// (MEM_INTRO, ROM_DEMO, RAM_DEMO, COMBO_LOCK_FSM, GLITCH_HAZARD) get full
// behavioural checks — including the ffState key ('Q1_r16x4ni') the RAM
// lesson's write-then-read-back validator inspects.
//
// Run:  node js/debug/scenarios/onramp-lesson-boards.mjs   (exits non-zero on failure)

import { CircuitHarness } from '../harness.mjs';
import {
  CD4001_SR_LATCH_BOARD, CD4013_COINTOSS_BOARD, SCHMITT_CLOCK_BOARD,
  DUAL_555_BOARD, ENCODE_DECODE_838_BOARD, PISO_SIPO_BOARD,
  MEM_INTRO_BOARD, ROM_DEMO_BOARD, RAM_DEMO_BOARD, COMBO_LOCK_FSM_BOARD,
  GLITCH_HAZARD_BOARD,
} from '../../onramp-lesson-boards.js';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}

const litIds = (h) => h.leds().filter(l => h.ledState(l.id).lit).map(l => l.id).sort((a, b) => a - b).join(',');

// ── 1. Example-derived boards load cleanly ───────────────────────────────────
{
  console.log('\n1. Example-derived boards (load + no shorts)');
  const boards = {
    CD4001_SR_LATCH_BOARD, CD4013_COINTOSS_BOARD, SCHMITT_CLOCK_BOARD,
    DUAL_555_BOARD, ENCODE_DECODE_838_BOARD, PISO_SIPO_BOARD, COMBO_LOCK_FSM_BOARD,
  };
  for (const [name, board] of Object.entries(boards)) {
    const h = CircuitHarness.fromJSON(board);
    h.evaluate();
    check(`${name} loads without short`, !h.hasShort);
  }
}

// ── 2. SR latch does what Lesson 4 step 3 says ───────────────────────────────
{
  console.log('\n2. CD4001 SR latch (lesson 4 interaction)');
  const h = CircuitHarness.fromJSON(CD4001_SR_LATCH_BOARD);
  const Q = 8, QB = 10, SET = 5, RESET = 3;
  h.evaluate();
  h.press(SET); h.settle({ maxSteps: 2000 });
  check('SET latches Q (green) on', h.ledState(Q).lit && !h.ledState(QB).lit);
  h.release(SET); h.settle({ maxSteps: 2000 });
  check('HOLD keeps Q on after release', h.ledState(Q).lit);
  h.press(RESET); h.settle({ maxSteps: 2000 });
  check('RESET latches Q off / Q-bar on', !h.ledState(Q).lit && h.ledState(QB).lit);
  check('no short circuit', !h.hasShort);
}

// ── 3. ROM_DEMO: address switches look up the square of x ───────────────────
// Switches: 10=A0, 12=A1, 14=A2. LEDs 20..27 = data bits 0..7.
{
  console.log('\n3. ROM_DEMO (x² lookup table)');
  const h = CircuitHarness.fromJSON(ROM_DEMO_BOARD);
  h.evaluate();
  check('no short circuit', !h.hasShort);
  check('addr 0 → 0, all LEDs dark', litIds(h) === '', litIds(h) || 'dark');
  h.setSwitch(10, true); h.evaluate();
  check('addr 1 → 1 (bit 0)', litIds(h) === '20', litIds(h));
  h.setSwitch(14, true); h.evaluate();
  check('addr 5 → 25 (bits 0,3,4)', litIds(h) === '20,23,24', litIds(h));
  h.setSwitch(12, true); h.evaluate();
  check('addr 7 → 49 (bits 0,4,5)', litIds(h) === '20,24,25', litIds(h));
}

// ── 4. MEM_INTRO: fixed ROM word, COPY writes it into the RAM ────────────────
// Switches: 10=A0, 12=A1. Button 15=COPY. Red LEDs 20-23 = ROM, green 24-27 = RAM.
{
  console.log('\n4. MEM_INTRO (ROM vs RAM side by side)');
  const h = CircuitHarness.fromJSON(MEM_INTRO_BOARD);
  h.evaluate();
  check('no short circuit', !h.hasShort);
  check('addr 0: ROM word 0, RAM empty — all dark', litIds(h) === '', litIds(h) || 'dark');
  h.setSwitch(10, true); h.evaluate();
  check('addr 1: ROM shows 6 (red 21,22), RAM still empty', litIds(h) === '21,22', litIds(h));
  h.press(15); h.evaluate(); h.release(15); h.evaluate();
  check('COPY stores ROM word in RAM (green 25,26 join)', litIds(h) === '21,22,25,26', litIds(h));
  h.setSwitch(10, false); h.evaluate();
  check('addr 0 again: both halves dark', litIds(h) === '', litIds(h) || 'dark');
  h.setSwitch(10, true); h.evaluate();
  check('back at addr 1: RAM remembered the copy', litIds(h) === '21,22,25,26', litIds(h));
  const mem = h.byId(2).ffState.get('Q1_r16x4ni');
  check('RAM ffState mem[1] = [0,1,1,0]', !!mem && String(mem.mem[1]) === '0,1,1,0');
}

// ── 5. RAM_DEMO: write it, move away, read it back ───────────────────────────
// Switches: 10=A0, 12=A1 (address), 14=D1, 16=D2 (data). Button 19=WRITE.
// LEDs: 20=Q1, 21=Q2.
{
  console.log('\n5. RAM_DEMO (write-then-read-back)');
  const h = CircuitHarness.fromJSON(RAM_DEMO_BOARD);
  h.evaluate();
  check('no short circuit', !h.hasShort);
  check('starts empty (volatile)', litIds(h) === '', litIds(h) || 'dark');
  h.setSwitch(14, true); h.evaluate();
  check('setting D1 alone changes nothing', litIds(h) === '', litIds(h) || 'dark');
  h.press(19); h.evaluate();
  check('outputs tri-state during WRITE (LEDs dark)', litIds(h) === '', litIds(h) || 'dark');
  h.release(19); h.evaluate();
  check('after WRITE, Q1 reads back the stored 1', litIds(h) === '20', litIds(h));
  h.setSwitch(10, true); h.evaluate();
  check('addr 1 is a different, empty cell', litIds(h) === '', litIds(h) || 'dark');
  h.setSwitch(14, false); h.setSwitch(16, true);
  h.press(19); h.evaluate(); h.release(19); h.evaluate();
  check('write D2 at addr 1 → Q2 lit', litIds(h) === '21', litIds(h));
  h.setSwitch(10, false); h.evaluate();
  check('back at addr 0: first value survived', litIds(h) === '20', litIds(h));
  const mem = h.byId(1).ffState.get('Q1_r16x4ni');
  check('ffState mem holds both cells (lesson validator relies on this)',
    !!mem && String(mem.mem[0]) === '1,0,0,0' && String(mem.mem[1]) === '0,1,0,0');
}

// ── 6. PISO→SIPO: the exact button sequence Lesson 8 teaches ─────────────────
// Button 80 = Load/Reset (loads the 165, clears the 164), button 83 = clock.
// Switches D5(12), D6(14), D7(16) are preset ON, so after 8 clocks the LEDs
// wired to Q5/Q6/Q7 (ids 47, 48, 50) must mirror them.
{
  console.log('\n6. PISO_SIPO (lesson 8 transfer sequence)');
  const h = CircuitHarness.fromJSON(PISO_SIPO_BOARD);
  h.evaluate();
  check('starts dark (SIPO empty)', litIds(h) === '', litIds(h) || 'dark');
  h.press(80); h.evaluate(); h.release(80); h.evaluate();
  check('Load/Reset leaves LEDs dark', litIds(h) === '', litIds(h) || 'dark');
  for (let i = 0; i < 8; i++) { h.press(83); h.evaluate(); h.release(83); h.evaluate(); }
  check('after 8 clocks LEDs mirror switches D5-D7', litIds(h) === '47,48,50', litIds(h));
}

// ── 7. Combination lock: the exact sequence Lesson 13 teaches ────────────────
// Buttons 7=B1, 9=B2, 11=B3. LEDs 14=green UNLOCK, 16=red LOCKED, 18=yellow
// timer. Lesson step 'lock_open' validates on the green LED lighting; step
// 'lock_break' relies on out-of-order presses being ignored/reset.
{
  console.log('\n7. COMBO_LOCK_FSM (lesson 13 interactions)');
  const h = CircuitHarness.fromJSON(COMBO_LOCK_FSM_BOARD);
  const GREEN = 14, RED = 16, YELLOW = 18, B1 = 7, B2 = 9, B3 = 11;
  const lit = (id) => h.ledState(id).lit;
  const tap = (id) => { h.press(id); h.run(0.05); h.release(id); h.run(0.05); };
  h.evaluate();
  check('boots LOCKED (red on, green off)', lit(RED) && !lit(GREEN));
  tap(B3);
  check('pressing B3 from LOCKED does nothing', lit(RED) && !lit(GREEN));
  tap(B1);
  check('B1 opens the timing window (yellow on)', lit(YELLOW));
  tap(B2); tap(B3);
  check('correct order 1,2,3 unlocks (green on, red off)', lit(GREEN) && !lit(RED));
  h.run(8);
  check('window expiry re-locks (red on, green off)', lit(RED) && !lit(GREEN));
  check('no short circuit', !h.hasShort);
}

// ── 8. Glitch hazard board: the hand-stepped static-1 hazard (Lesson 6) ──────
// Y = (A AND SEL) OR (B AND SELB), A=B=HIGH. Break-before-make (SEL off, then
// SELB on) drops Y — the frozen glitch — and its recovery edge clocks the
// CD4013 toggle. Make-before-break (overlap) must leave Y and the counter alone.
{
  console.log('\n8. GLITCH_HAZARD_BOARD (lesson 6 interactions)');
  const h = CircuitHarness.fromJSON(GLITCH_HAZARD_BOARD);
  const Y = 21, Q = 23, SEL = 10, SELB = 12;
  h.evaluate();
  check('boots with Y HIGH (SEL on, SELB off)', h.ledState(Y).lit);
  check('no short circuit', !h.hasShort);
  const q0 = h.ledState(Q).lit;

  // Break-before-make: the glitch, frozen (lesson steps 5-6)
  h.setSwitch(SEL, false); h.evaluate();
  check('SEL off first → Y drops (inside the glitch)', !h.ledState(Y).lit);
  check('falling edge alone does not clock the toggle', h.ledState(Q).lit === q0);
  h.setSwitch(SELB, true); h.evaluate();
  check('SELB on → Y recovers', h.ledState(Y).lit);
  check('glitch recovery edge toggles the counter FF', h.ledState(Q).lit !== q0);
  const q1 = h.ledState(Q).lit;

  // Make-before-break: the overlap swap (lesson step 7) — no glitch, no count
  h.setSwitch(SEL, true); h.evaluate();
  check('overlap (both on) keeps Y HIGH', h.ledState(Y).lit);
  h.setSwitch(SELB, false); h.evaluate();
  check('SELB off completes swap with Y still HIGH', h.ledState(Y).lit);
  check('overlap swap does not toggle the counter', h.ledState(Q).lit === q1);
}

console.log(failures === 0 ? '\nAll onramp lesson board checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
