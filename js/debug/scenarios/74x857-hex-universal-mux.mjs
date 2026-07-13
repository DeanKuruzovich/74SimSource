// ── 74x857 hex 2-to-1 universal mux, 3-state — regression ───────────────────
// De-stubbed in chips42.js (gate MUX_HEX_UNIVERSAL). Six channels share three
// control inputs (S0,S1,COMP) and a zero-detect output (OPER=0). Verified vs TI
// SN54ALS857/SN74ALS857 SDAS170A FUNCTION TABLE (page 2):
//
//   COMP S1 S0 | Yn      | OPER=0
//    L   L  L  | An      | H if all A inputs L
//    L   L  H  | Bn      | H if all B inputs L
//    L   H  L  | An·Bn   | Z
//    L   H  H  | L       | L
//    H   L  L  | /An     | H if all A inputs L
//    H   L  H  | /Bn     | H if all B inputs L
//    H   H  L  | /(An·Bn)| Z
//    H   H  H  | Z       | Z   (disable: COMP=S1=S0=H → all 7 outputs Hi-Z)
//
// Pinout verified vs the SDAS170A 24-pin DW/JT/NT terminal assignment (page 1):
//   S0=1 1A=2 1B=3 1Y=4 2A=5 2B=6 2Y=7 3A=8 3B=9 3Y=10 OPER0=11 GND=12
//   COMP=13 4Y=14 4B=15 4A=16 5Y=17 5A=18 5B=19 6Y=20 6B=21 6A=22 S1=23 VCC=24
//
// Run:  node js/debug/scenarios/74x857-hex-universal-mux.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x857');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const Apin = ['1A','2A','3A','4A','5A','6A'];
const Bpin = ['1B','2B','3B','4B','5B','6B'];
const Ypin = ['1Y','2Y','3Y','4Y','5Y','6Y'];

// Drive the six A and six B bits (6-bit words each) plus S0,S1,COMP; solve.
function apply(aWord, bWord, { s0, s1, comp }) {
  const wm = new WireManager();
  const wirePin = (name, hi) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x857 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), hi ? 1 : 0), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (let i = 0; i < 6; i++) {
    wirePin(Apin[i], (aWord >> i) & 1);
    wirePin(Bpin[i], (bWord >> i) & 1);
  }
  wirePin('S0', s0);
  wirePin('S1', s1);
  wirePin('COMP', comp);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const outBit = (name) => isHigh(read(name)) ? 1 : 0;
const isHiZ = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type === DRIVE.HIGH_Z : false;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const A = 0b101010; // distinct A/B words so a crossed channel shows up
const B = 0b011100;
const bit = (w, i) => (w >> i) & 1;
const b6 = (w) => w.toString(2).padStart(6, '0');

// ── 1. Select A (COMP=L,S1=L,S0=L): Yn = An, all driven ──────────────────────
apply(A, B, { s0: 0, s1: 0, comp: 0 });
for (let i = 0; i < 6; i++) {
  assert(outBit(Ypin[i]) === bit(A, i), `selA A=${b6(A)} ${Ypin[i]}: expected ${bit(A,i)}, got ${outBit(Ypin[i])}`);
  assert(!isHiZ(Ypin[i]), `selA ${Ypin[i]}: must drive`);
}
assert(outBit('OPER0') === 0 && !isHiZ('OPER0'), 'selA OPER0: A not all-zero → must be LOW driven');

// ── 2. Select B (COMP=L,S1=L,S0=H): Yn = Bn ──────────────────────────────────
apply(A, B, { s0: 1, s1: 0, comp: 0 });
for (let i = 0; i < 6; i++) {
  assert(outBit(Ypin[i]) === bit(B, i), `selB B=${b6(B)} ${Ypin[i]}: expected ${bit(B,i)}, got ${outBit(Ypin[i])}`);
}

// ── 3. AND mask (COMP=L,S1=H,S0=L): Yn = An·Bn, OPER0 Hi-Z ────────────────────
apply(A, B, { s0: 0, s1: 1, comp: 0 });
for (let i = 0; i < 6; i++) {
  assert(outBit(Ypin[i]) === (bit(A, i) & bit(B, i)), `AND ${Ypin[i]}: expected ${bit(A,i)&bit(B,i)}, got ${outBit(Ypin[i])}`);
}
assert(isHiZ('OPER0'), 'AND mode: OPER0 must be Hi-Z');

// ── 4. Force-L (COMP=L,S1=H,S0=H): Yn = 0 driven, OPER0 = 0 driven ───────────
apply(A, B, { s0: 1, s1: 1, comp: 0 });
for (let i = 0; i < 6; i++) {
  assert(outBit(Ypin[i]) === 0 && !isHiZ(Ypin[i]), `forceL ${Ypin[i]}: must be LOW driven`);
}
assert(outBit('OPER0') === 0 && !isHiZ('OPER0'), 'forceL OPER0: must be LOW driven');

// ── 5. Complement select A (COMP=H,S1=L,S0=L): Yn = /An ──────────────────────
apply(A, B, { s0: 0, s1: 0, comp: 1 });
for (let i = 0; i < 6; i++) {
  assert(outBit(Ypin[i]) === (bit(A, i) ^ 1), `/selA ${Ypin[i]}: expected ${bit(A,i)^1}, got ${outBit(Ypin[i])}`);
}

// ── 6. NAND (COMP=H,S1=H,S0=L): Yn = /(An·Bn), OPER0 Hi-Z ─────────────────────
apply(A, B, { s0: 0, s1: 1, comp: 1 });
for (let i = 0; i < 6; i++) {
  assert(outBit(Ypin[i]) === ((bit(A, i) & bit(B, i)) ^ 1), `NAND ${Ypin[i]}: expected ${(bit(A,i)&bit(B,i))^1}, got ${outBit(Ypin[i])}`);
}
assert(isHiZ('OPER0'), 'NAND mode: OPER0 must be Hi-Z');

// ── 7. Disable (COMP=S1=S0=H): all six Y and OPER=0 Hi-Z ─────────────────────
apply(A, B, { s0: 1, s1: 1, comp: 1 });
for (let i = 0; i < 6; i++) assert(isHiZ(Ypin[i]), `disable ${Ypin[i]}: must be Hi-Z`);
assert(isHiZ('OPER0'), 'disable OPER0: must be Hi-Z');

// ── 8. Zero detect: all A low (select-A) → OPER0 HIGH; all B low (select-B) → HIGH
apply(0b000000, 0b111111, { s0: 0, s1: 0, comp: 0 });
assert(outBit('OPER0') === 1 && !isHiZ('OPER0'), 'zero-detect selA: all A low → OPER0 HIGH');
apply(0b111111, 0b000000, { s0: 1, s1: 0, comp: 0 });
assert(outBit('OPER0') === 1 && !isHiZ('OPER0'), 'zero-detect selB: all B low → OPER0 HIGH');
// COMP must not change the zero-detect operand sense (table: still "all A low")
apply(0b000000, 0b111111, { s0: 0, s1: 0, comp: 1 });
assert(outBit('OPER0') === 1 && !isHiZ('OPER0'), 'zero-detect /selA: all A low → OPER0 HIGH (COMP independent)');

if (failures.length) {
  console.error(`74x857 FAIL (${failures.length}):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x857 hex universal mux: all checks passed');
