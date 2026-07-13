// ── 74x844 9-bit transparent D latch, inverting outputs, regression ──────────
// The 74x844 (js/chips/chips41.js) is the inverting-output sibling of the 74x843:
// a 9-bit bus-interface transparent D latch with an asynchronous active-LOW
// preset (PREn), an asynchronous active-LOW clear (CLRn) and active-LOW 3-state
// output control (OEn). Data capture is LEVEL-sensitive on LE (transparent while
// HIGH, held on the falling level) — it is NOT an edge-triggered flip-flop. It
// rides the shared LATCH_9BIT_PRE_CLR_TRI engine primitive with gate.invert set,
// so only the output buffer inverts; the internal latch core is identical to the
// 843. Pin map (corrected from the stub, per TI SN74ABT843): OEn=1, D0-D8=2-10,
// CLRn=11, LE=13, PREn=14, Q8-Q0=15-23.
//
// LATCH_9BIT_PRE_CLR_TRI contract (js/specificChipsSim.js), invert:true:
//   inputs:  [D0..D8, LE, OEn, CLRn, PREn]   (OEn/CLRn/PREn all active LOW)
//   outputs: [Q0..Q8]                        Q = NOT (internal bit)
//
// Function table (843 table with the Q column inverted):
//   PRE CLR OE LE  D | Q
//    L   X  L  X   X | L     (async preset → internal 1 → Q LOW, dominates)
//    H   L  L  X   X | H     (async clear  → internal 0 → Q HIGH)
//    H   H  L  H   D | ~D    (LE high: transparent, Q = NOT D)
//    H   H  L  L   X | ~Q0   (LE low: hold last data)
//    X   X  H  X   X | Z     (output disabled, latch state kept)
//
// Run:  node js/debug/scenarios/74x844-9bit-latch-inv.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;
const inv9 = (v) => (~v) & 0x1FF;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x844');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x844 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn',  st.oen ? 1 : 0);
  wirePin('CLRn', st.clrn ? 1 : 0);
  wirePin('PREn', st.pren ? 1 : 0);
  wirePin('LE',   st.le ? 1 : 0);
  for (let i = 0; i < 9; i++) wirePin(`D${i}`, st.d[i] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 9; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};
const bin9 = (v) => v.toString(2).padStart(9, '0');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Defaults: outputs enabled (OEn low), not presetting/clearing, latch open (LE high).
const st = { oen: 0, clrn: 1, pren: 1, le: 1, d: [0,0,0,0,0,0,0,0,0] };
const solve = () => apply(st);
function setD(pattern9) { for (let i = 0; i < 9; i++) st.d[i] = (pattern9 >> i) & 1; }

// ── 0. Transparent: while LE HIGH, Q tracks the INVERSE of D live ────────────
setD(0b101010101); st.le = 1; solve();
assert(qbits() === inv9(0b101010101), `transparent invert: got ${bin9(qbits())}`);
setD(0b010101010); solve();     // change D with LE still high → Q must change too
assert(qbits() === inv9(0b010101010), `transparent tracks new ~D: got ${bin9(qbits())}`);

// 9th bit (D8/Q8) specifically — the bit that makes this a 9-bit part.
setD(0b100000000); solve();
assert(qbits() === inv9(0b100000000), `transparent bit8 inverted: got ${bin9(qbits())}`);

// ── 1. Hold: capture on the falling level, then D changes are ignored ────────
setD(0b000111000); st.le = 1; solve();   // latch open, load pattern
assert(qbits() === inv9(0b000111000), `preload: got ${bin9(qbits())}`);
st.le = 0; solve();                        // close latch
setD(0b111111111); solve();                // D moves while held → Q must not
assert(qbits() === inv9(0b000111000), `LE low holds through D change: got ${bin9(qbits())}`);
st.le = 1; solve();                        // reopen → now Q follows the new ~D
assert(qbits() === inv9(0b111111111), `LE high reopens transparent: got ${bin9(qbits())}`);

// ── 2. Async active-LOW CLEAR: internal 0 → all nine Q HIGH, ignores LE ──────
st.le = 0; setD(0b111111111); solve();     // hold something, latch closed
st.clrn = 0; solve();                       // clear asserted while held
assert(qbits() === 0b111111111, `async clear (inverting) → Q all HIGH, ignores LE: got ${bin9(qbits())}`);
st.clrn = 1; solve();

// ── 3. Async active-LOW PRESET: internal 1 → all nine Q LOW, ignores LE ──────
st.le = 0; setD(0b111111111); solve();
st.pren = 0; solve();
assert(qbits() === 0, `async preset (inverting) → Q all LOW, ignores LE: got ${bin9(qbits())}`);

// ── 4. Preset dominates clear when both asserted → Q all LOW ─────────────────
st.clrn = 0; st.pren = 0; solve();          // both active-low asserted at once
assert(qbits() === 0, `preset dominates clear (inverting): got ${bin9(qbits())}`);
st.clrn = 1; st.pren = 1; solve();

// ── 5. Output enable: OEn HIGH → 3-state (not HIGH), latch state preserved ────
setD(0b110011001); st.le = 1; solve();
assert(qbits() === inv9(0b110011001), `preload for OEn test: got ${bin9(qbits())}`);
st.le = 0; st.oen = 1; solve();
assert(!isHigh(read('Q0')), `OEn high: Q0 should be high-impedance, not driven`);
assert(!isHigh(read('Q8')), `OEn high: Q8 should be high-impedance, not driven`);
st.oen = 0; solve();                        // re-enable outputs, latch untouched
assert(qbits() === inv9(0b110011001), `OEn low: stored state should reappear, got ${bin9(qbits())}`);

if (failures.length) {
  console.error(`74x844: FAIL (${failures.length})`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x844: PASS — inverting transparent follow, hold, async clear (Q HIGH), async preset (Q LOW, dominates), 3-state output all correct');
