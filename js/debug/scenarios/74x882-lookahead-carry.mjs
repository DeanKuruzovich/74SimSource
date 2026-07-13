// ── 74x882 32-bit lookahead carry generator — regression ─────────────────────
// The 74x882 (js/chips/chips43.js) scales the 74x182 up to eight 4-bit ALU
// stages. It is purely combinational and uses the CARRY_LOOKAHEAD_32 engine
// primitive (js/specificChipsSim.js _evaluateCarryLookahead32).
//
// Source verified for behavior: TI SN54AS882/SN74AS882A 32-Bit Look-Ahead Carry
// Generators (AllDataSheet mirror 116797 / 466590, page images read as PNGs).
// Real device inputs are active-LOW P̄/Ḡ; like the sim's 74x181/74x182 this model
// uses ACTIVE-HIGH P/G, so the 882 chains off the in-sim ALUs. Outputs are the
// carries into the 8/16/24/32-bit boundaries — there is no group-generate output.
//
// CARRY_LOOKAHEAD_32 contract (js/specificChipsSim.js):
//   inputs:  [P0,G0,P1,G1,P2,G2,P3,G3,P4,G4,P5,G5,P6,G6,P7,G7, Cn]
//   outputs: [Cn8, Cn16, Cn24, Cn32]
//   carry out of stage i: c(i+1) = G_i + P_i·c_i, with c0 = Cn.
//   Cn8=c2, Cn16=c4, Cn24=c6, Cn32=c8.
//
// Method: place ONE 74x882 (no sequential state), drive P0–P7/G0–G7/Cn from
// rails, re-solve, read the four carry outputs off the pins. The expected values
// are computed by an independent reference model of the same recurrence.
//
// Run:  node js/debug/scenarios/74x882-lookahead-carry.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x882');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Independent reference: group carries from P[], G[] (both length 8) and Cn.
function ref(P, G, cn) {
  let c = cn;
  const cout = [];
  for (let i = 0; i < 8; i++) { c = G[i] | (P[i] & c); cout[i] = c; }
  return { Cn8: cout[1], Cn16: cout[3], Cn24: cout[5], Cn32: cout[7] };
}

// Drive all inputs from the power rail, then re-solve.
function apply(P, G, cn) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x882 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 8; i++) { wirePin(`P${i}`, P[i]); wirePin(`G${i}`, G[i]); }
  wirePin('Cn', cn);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBit = (name) => (isHigh(read(name)) ? 1 : 0);

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

function check(label, P, G, cn) {
  apply(P, G, cn);
  const e = ref(P, G, cn);
  for (const out of ['Cn8', 'Cn16', 'Cn24', 'Cn32']) {
    const got = readBit(out);
    assert(got === e[out], `${label}: ${out} expected ${e[out]}, got ${got}`);
  }
}

const z = [0, 0, 0, 0, 0, 0, 0, 0];

// 1. All quiet, no carry in: nothing generated or propagated → all outputs LOW.
check('idle', z.slice(), z.slice(), 0);

// 2. Carry in propagates through every stage: all P=1, no generate → Cn ripples
//    to every boundary. With Cn=1 all four outputs go HIGH; with Cn=0 they stay LOW.
check('propagate-all Cn=1', [1,1,1,1,1,1,1,1], z.slice(), 1);
check('propagate-all Cn=0', [1,1,1,1,1,1,1,1], z.slice(), 0);

// 3. A single stage generates. G4 alone (stage 4, bits 16–19) generates a carry.
//    Its carry appears at Cn24 (out of stages 0–5) and Cn32, but NOT at Cn8/Cn16
//    which sit below it — regardless of carry in.
check('generate at stage 4', z.slice(), [0,0,0,0,1,0,0,0], 0);

// 4. Generate low, blocked from propagating up. G0 generates, but stage 1 does
//    NOT propagate (P1=0), so the carry dies before Cn8.
check('generate blocked by P1=0', [1,0,1,1,1,1,1,1], [1,0,0,0,0,0,0,0], 0);

// 5. Generate low, propagates the whole way. G0 generates and every stage above
//    propagates → carry reaches all four boundaries.
check('generate at 0, propagate up', [1,1,1,1,1,1,1,1], [1,0,0,0,0,0,0,0], 0);

// 6. Exhaustive-ish random sweep against the reference model.
let seed = 0x9e3779b9;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed; };
for (let t = 0; t < 64; t++) {
  const P = [], G = [];
  for (let i = 0; i < 8; i++) { P.push(rnd() & 1); G.push((rnd() >> 3) & 1); }
  check(`random#${t}`, P, G, (rnd() >> 5) & 1);
}

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`74x882 lookahead carry regression FAILED (${failures.length}):`);
  for (const f of failures.slice(0, 20)) console.error('  ✗', f);
  process.exit(1);
}
console.log('74x882 lookahead carry regression PASSED');
