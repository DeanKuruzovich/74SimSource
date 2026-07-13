#!/usr/bin/env node
// ── Example-circuit test harness ─────────────────────────────────────────────
// Loads every circuit in js/examples/ through the REAL engine and reports what
// it actually does: shorts, floating nets, lit LEDs, and the character each
// 7-segment display is showing. Optional per-example expectations turn it into a
// regression gate — run this after any engine change to confirm the shipped
// example circuits still behave in real situations.
//
// Run:
//   node js/debug/test-examples.mjs            # summary of every example
//   node js/debug/test-examples.mjs --verbose  # + full report() per example
//   node js/debug/test-examples.mjs adder      # only examples matching "adder"
//
// Exits non-zero if any expectation fails (or an example throws).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CircuitHarness } from './harness.mjs';
import { COMP } from '../constants.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(here, '../examples');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const filter = args.find(a => !a.startsWith('--'));

// ── Per-example expectations ─────────────────────────────────────────────────
// Each entry runs against a freshly-loaded harness (already evaluated + settled).
// Return an array of [label, pass] checks. Keep these about observable behaviour
// (what the LEDs/displays do), not internal nets, so they stay meaningful.
const EXPECTATIONS = {
  '4BitAdderExample.json': (h) => {
    // Displays are [A, B, Sum]. Switch ids per weight: A={1:1,2:3,4:5,8:7},
    // B={1:97,2:98,4:99,8:116}. Verify idle 0+0 and a real add 3+5=8.
    const show = () => h.sevenSegs().map(d => d.char || (d.anyLit ? '?' : ' ')).join('');
    const A = { 1: 1, 2: 3, 4: 5, 8: 7 }, B = { 1: 97, 2: 98, 4: 99, 8: 116 };
    const setNum = (map, n) => { for (const w of [1, 2, 4, 8]) h.setSwitch(map[w], !!(n & w)); };
    const checks = [];
    checks.push(['3 displays, idle shows "000" (0+0)', show() === '000', 'showing ' + show()]);
    checks.push(['no segment overdrive idle', h.sevenSegs().every(d => !d.overdrive)]);
    setNum(A, 3); setNum(B, 5); h.evaluate();
    checks.push(['3 + 5 displays "358"', show() === '358', 'showing ' + show()]);
    setNum(A, 6); setNum(B, 3); h.evaluate();
    checks.push(['6 + 3 displays "639"', show() === '639', 'showing ' + show()]);
    checks.push(['no short circuit', !h.hasShort]);
    return checks;
  },
  'helloLED.json': (h) => {
    const leds = h.leds();
    return [
      ['has at least one LED', leds.length > 0],
      ['no short circuit', !h.hasShort],
    ];
  },
  'CD4001-SR-Latch.json': (h) => {
    // Cross-coupled NOR SR latch. A power-on-reset cap boots it into the RESET
    // state (Q low / green off, Q-bar high / red on). Then SET/RESET must latch.
    const Q = 8, QB = 10, SET = 5, RESET = 3;
    const q = () => h.ledState(Q).lit, qb = () => h.ledState(QB).lit;
    const checks = [];
    checks.push(['boots into RESET: Q off, Q-bar on', !q() && qb()]);
    h.press(SET); h.settle({ maxSteps: 2000 });
    checks.push(['SET latches Q on', q() && !qb()]);
    h.release(SET); h.settle({ maxSteps: 2000 });
    checks.push(['holds set after release', q() && !qb()]);
    h.press(RESET); h.settle({ maxSteps: 2000 });
    checks.push(['RESET clears Q', !q() && qb()]);
    h.release(RESET); h.settle({ maxSteps: 2000 });
    checks.push(['holds reset after release', !q() && qb()]);
    checks.push(['no short circuit', !h.hasShort]);
    return checks;
  },
  'CD4013-CoinToss.json': (h) => {
    // D flip-flop in toggle mode (Q-bar -> D), clock gated by the TOSS button.
    // Clock edges aren't deterministic here, so verify the static topology that
    // makes the toss work: power, toggle feedback, tied SET/RST, CLK pulled low.
    const chip = h.byId(1);
    const holeOf = (n) => chip.pins.find(p => p.name === n).holeId;
    const netOf = (n) => { const net = h.sim.netlist.findNetByHole(holeOf(n)); return net ? net.id : null; };
    const HEADS = 6, TAILS = 8;
    return [
      ['power good', h.pinVoltage(1, 'VDD') > 4.5 && h.pinVoltage(1, 'GND') < 0.5],
      ['toggle wiring: D1 tied to Q-bar1', netOf('D1') === netOf('Qn1')],
      ['unused SET/RST tied low', h.pinVoltage(1, 'SET1') < 0.8 && h.pinVoltage(1, 'RST1') < 0.8],
      ['CLK pulled low while TOSS released', h.pinVoltage(1, 'CLK1') < 0.8],
      ['HEADS and TAILS are complementary', h.ledState(HEADS).lit !== h.ledState(TAILS).lit],
      ['no short circuit', !h.hasShort],
    ];
  },
  'CombinationLock-FSM.json': (h) => {
    // 3-button combination lock FSM: press B1→B2→B3 in order, within the
    // 74x4538's one-shot RC window (~5 s, opened by B1), to light the green
    // UNLOCK LED. Any out-of-order press, or the window expiring, pulses the
    // active-HIGH reset of all CD4013 stages → back to LOCKED (red). The same
    // pulse fires at power-up, so it must boot LOCKED deterministically.
    const GREEN = 14, RED = 16, YELLOW = 18, B1 = 7, B2 = 9, B3 = 11;
    const lit = (id) => h.ledState(id).lit;
    const tap = (id) => { h.press(id); h.run(0.05); h.release(id); h.run(0.05); };
    const checks = [];
    checks.push(['boots LOCKED: green off, red on, timer off', !lit(GREEN) && lit(RED) && !lit(YELLOW)]);
    h.press(B1); h.run(0.05);
    checks.push(['pressing B1 opens the timing window (yellow on)', lit(YELLOW)]);
    h.release(B1); h.run(0.05);
    tap(B2); tap(B3);
    checks.push(['correct order B1,B2,B3 unlocks: green on, red off', lit(GREEN) && !lit(RED)]);
    h.run(8);
    checks.push(['window expiry re-locks: green off, red on, yellow off', !lit(GREEN) && lit(RED) && !lit(YELLOW)]);
    tap(B1); tap(B3);          // wrong press mid-sequence resets…
    tap(B2); tap(B3);          // …so finishing the code afterwards must fail
    checks.push(['wrong press (B1 then B3) resets progress', !lit(GREEN) && lit(RED)]);
    h.run(8);
    tap(B2); tap(B3);          // out-of-order start
    checks.push(['out-of-order start (B2 first) makes no progress', !lit(GREEN)]);
    h.run(8);
    tap(B1); h.run(7);         // dawdle past the window mid-code
    tap(B2); tap(B3);
    checks.push(['timeout mid-code resets: late B2,B3 do not unlock', !lit(GREEN) && lit(RED)]);
    h.run(8);
    tap(B1); tap(B2); tap(B3);
    checks.push(['still unlocks cleanly after all the failed attempts', lit(GREEN) && !lit(RED)]);
    checks.push(['no short circuit', !h.hasShort]);
    return checks;
  },
  'Crystal-Clock-Divider.json': (h) => {
    // 16 Hz 2-pin crystal clocks a 74x393; each stage halves the frequency:
    // QA 8 Hz, QB 4 Hz, QC 2 Hz, QD exactly 1 Hz (the quartz-watch trick).
    // Timing mode makes the crystal an exact sim-time event source, so the
    // measured frequencies are deterministic (live mode samples the wall clock).
    h.enableTiming();
    for (const p of ['CLK1', 'QA1', 'QB1', 'QC1', 'QD1']) h.watchPin(1, p, p);
    h.advanceNs(4e9); // 4 s of sim time = 64 crystal cycles
    const freqOf = (label) => {
      const trs = h.transitions(label);
      const rises = trs.filter((t, i) => i > 0 && t.level === 1 && trs[i - 1].level === 0);
      if (rises.length < 2) return null;
      return 1e12 * (rises.length - 1) / (rises[rises.length - 1].tPs - rises[0].tPs);
    };
    const checks = [];
    for (const [pin, hz] of [['CLK1', 16], ['QA1', 8], ['QB1', 4], ['QC1', 2], ['QD1', 1]]) {
      const f = freqOf(pin);
      checks.push([`${pin} runs at ${hz} Hz`, f !== null && Math.abs(f - hz) < 0.001,
        f === null ? 'no edges' : `measured ${f.toFixed(4)} Hz`]);
    }
    h.disableTiming();
    checks.push(['no short circuit', !h.hasShort]);
    return checks;
  },
  'LogicFamilies-FloatingInputs.json': (h) => {
    // 74x34 buffer, three live stations. Station 1 (floating inputs): RED input
    // floats (no pull-down), GREEN has a pull-down, YELLOW a pull-up — only the
    // floating one is family-dependent. Station 2 (thresholds): a 12k/10k
    // divider feeds ~2.3 V into 4A; BLUE reads it HIGH on TTL-threshold
    // families (LS/HCT/LVC, VTH 1.4 V) and LOW on HC (VTH 2.5 V). Station 3
    // (drive): buffer 5 drives six white LED branches; LS's 714 Ω output sags
    // below the LEDs' needs (bank dark), HC/HCT (150 Ω) light it, LVC (50 Ω)
    // lights it brighter. (Combinational — no settle needed.)
    const RED = 4, GREEN = 8, YELLOW = 12, BLUE = 16, bGREEN = 5;
    const BANK = [18, 20, 22, 24, 26, 28];
    const bankLit = () => BANK.every(id => h.ledState(id).lit);
    const bankDark = () => BANK.every(id => !h.ledState(id).lit);
    const checks = [];
    checks.push(['LS: floating RED self-biases HIGH (lit)', h.ledState(RED).lit]);
    checks.push(['LS: pulled-down GREEN released = off', !h.ledState(GREEN).lit]);
    checks.push(['LS: pulled-up YELLOW idle = on', h.ledState(YELLOW).lit]);
    checks.push(['LS: 2.3 V divider reads HIGH (BLUE on)', h.ledState(BLUE).lit]);
    checks.push(['LS: 714 Ω output sags under 6 LED loads (bank dark)', bankDark()]);
    h.press(bGREEN); h.evaluate();
    checks.push(['GREEN button drives input HIGH', h.ledState(GREEN).lit]);
    h.release(bGREEN); h.evaluate();
    h.sim.setFamily('HC'); h.evaluate();
    const hcBankBrightness = h.ledState(BANK[0]).brightness;
    checks.push(['HC: same floating RED now reads differently', !h.ledState(RED).lit]);
    checks.push(['HC: pulled resistors hold (GREEN off, YELLOW on)', !h.ledState(GREEN).lit && h.ledState(YELLOW).lit]);
    checks.push(['HC: same 2.3 V now reads LOW (BLUE off)', !h.ledState(BLUE).lit]);
    checks.push(['HC: stiffer 150 Ω output lights all six loads', bankLit()]);
    h.sim.setFamily('HCT'); h.evaluate();
    checks.push(['HCT: TTL thresholds on CMOS — BLUE comes back', h.ledState(BLUE).lit]);
    checks.push(['HCT: bank stays lit', bankLit()]);
    h.sim.setFamily('LVC'); h.evaluate();
    checks.push(['LVC: BLUE on, bank lit', h.ledState(BLUE).lit && bankLit()]);
    checks.push(['LVC: 50 Ω drive is visibly stronger than HC', h.ledState(BANK[0]).brightness > hcBankBrightness]);
    checks.push(['no short circuit', !h.hasShort]);
    return checks;
  },
};

function hasTimeDomain(h) {
  return h.caps().length > 0 || h.byType(COMP.CLOCK).length > 0;
}

function summarize(h) {
  const leds = h.leds();
  const litLeds = leds.filter(l => l.lit).length;
  const overLeds = leds.filter(l => l.overdrive).length;
  const segs = h.sevenSegs();
  const parts = [];
  parts.push(`${h.components.filter(c => c.placed).length} comps`);
  const chips = h.byType(COMP.CHIP).length;
  if (chips) parts.push(`${chips} chips`);
  if (leds.length) parts.push(`LEDs ${litLeds}/${leds.length} lit${overLeds ? ` (${overLeds} OVERDRIVE)` : ''}`);
  if (segs.length) parts.push(`7seg [${segs.map(s => s.char || (s.anyLit ? '?' : '·')).join('')}]`);
  if (h.hasShort) parts.push(`⚠ SHORT(${h.shorts.length})`);
  if (h.sim.floatingNets.size) parts.push(`${h.sim.floatingNets.size} float`);
  return parts.join('  ·  ');
}

let files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json')).sort();
if (filter) files = files.filter(f => f.toLowerCase().includes(filter.toLowerCase()));

let failed = 0, errored = 0;
for (const f of files) {
  let h;
  try {
    h = CircuitHarness.fromFile(path.join(examplesDir, f));
    h.evaluate();
    if (hasTimeDomain(h)) h.settle({ maxSteps: 4000 });
  } catch (e) {
    console.log(`\n✗ ${f}\n    ERROR: ${e.message}`);
    errored++;
    continue;
  }

  console.log(`\n● ${f}`);
  console.log(`    ${summarize(h)}`);

  const exp = EXPECTATIONS[f];
  if (exp) {
    for (const [label, pass, detail] of exp(h)) {
      console.log(`    ${pass ? '✓' : '✗'} ${label}${detail ? '   (' + detail + ')' : ''}`);
      if (!pass) failed++;
    }
  }
  if (verbose) console.log('\n' + h.report().split('\n').map(l => '    ' + l).join('\n'));
}

console.log(`\n──────────────────────────────────────────`);
console.log(`${files.length} example(s) loaded · ${errored} errored · ${failed} expectation(s) failed`);
process.exit(failed === 0 && errored === 0 ? 0 : 1);
