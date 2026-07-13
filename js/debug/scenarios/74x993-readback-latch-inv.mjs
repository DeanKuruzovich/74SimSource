// ── 74x993 9-bit inverting transparent read-back latch (3-STATE) — regression ─
// The 74x993 (js/chips/chips46.js) is the inverting member of the SN74ALS992/993
// 9-bit read-back latch family. It is a LEVEL-sensitive transparent latch: while
// latch enable (LE) is HIGH the nine outputs continuously follow the data inputs;
// when LE goes LOW the word is held. The '993 inverts, so transparent means
// Q = NOT D. An active-LOW clear (CLRn) resets the stored bits, and an active-LOW
// output enable (OEQn) three-states the outputs without disturbing the store.
//
// It rides the width-agnostic LATCH_READBACK_TRI engine primitive with invert:true
// (js/specificChipsSim.js):
//   inputs:  [D0..D8, LE, OEn, CLRn]     outputs: [Q0..Q8]
//   CLRn=0 → stored word cleared to 0 (async, dominates LE); inverted → Q all HIGH
//   LE=1   → transparent, Q follows NOT D
//   LE=0   → hold last word
//   OEn=1  → outputs Hi-Z; OEn=0 → driven. OEn does NOT change stored state.
// The read-back path (OERB, pin 1) is intentionally NOT modeled (issues.md C88).
//
// Pinout verified against TI SN74ALS992 (SDAS028B, rev. Jan 1995) terminal
// assignment + description, read as PDF page images (issues.md C4): OERB=1,
// D0..D8=2..10, CLRn=11, GND=12, LE=13, OEQn=14, Q8n..Q0n=15..23, VCC=24. The
// '993 shares the '992 pinout; only the output polarity differs. The prior stub
// pinout (LE on 11, no CLR/OEQ, NC on 22/23) was hand-entered and wrong.
//
// Checks:
//   1. Transparent capture is INVERTING (Q = complement of D).
//   2. Pure inversion at the rails: all-zeros D → all-ones Q, all-ones D → all-zeros Q.
//   3. Transparency: D changing WHILE LE stays HIGH flows to Q (unlike a flip-flop).
//   4. LE LOW freezes the word; later D changes are ignored until LE returns HIGH.
//   5. CLRn LOW clears the store → all nine outputs HIGH (inverting clear).
//   6. OEQn HIGH forces all nine outputs Hi-Z; the stored word is untouched.
//
// Run:  node js/debug/scenarios/74x993-readback-latch-inv.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x993');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Latch state lives on the (persistent) chip component, not the wires, so a fresh
// WireManager per solve is fine. CLRn/OEQn default HIGH (inactive) = enabled/no-clear.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x993 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('LE',   st.le  ? 1 : 0);
  wirePin('OEQn', st.oe  ? 1 : 0);
  wirePin('CLRn', st.clr ? 0 : 1);   // st.clr asserts the active-LOW clear
  wirePin('OERB', 1);                // read-back held inactive (not modeled anyway)
  for (let i = 0; i < 9; i++) wirePin(`D${i}`, (st.d >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (n) => driveOf(`Q${n}n`) === DRIVE.HIGH_Z;
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 9; i++) if (isHigh(read(`Q${i}n`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const MASK = 0x1FF; // 9 bits
const inv = (n) => (~n) & MASK;
const b9 = (n) => n.toString(2).padStart(9, '0');

// Full input picture every solve. OEQn LOW = outputs enabled, CLRn inactive.
const st = { le: 0, oe: 0, clr: 0, d: 0 };
const solve = () => apply(st);

// Transparent load: raise LE, present D — Q follows NOT D — then drop LE to hold.
function load(word) {
  st.d = word;
  st.le = 1; solve();   // transparent → Q = NOT D
  st.le = 0; solve();   // latch closes → word held
}

// ── 1. Transparent capture is INVERTING ──────────────────────────────────────
load(0b110101100);
assert(qbits() === inv(0b110101100), `inv load: got ${b9(qbits())}, want ${b9(inv(0b110101100))}`);

// ── 2. Pure inversion at the rails ───────────────────────────────────────────
load(0b000000000);
assert(qbits() === MASK, `zeros → all Q high, got ${b9(qbits())}`);
load(0b111111111);
assert(qbits() === 0, `ones → all Q low, got ${b9(qbits())}`);

// ── 3. Transparency: D changes flow to Q WHILE LE stays HIGH ──────────────────
st.le = 1; st.d = 0b101011001; solve();
assert(qbits() === inv(0b101011001), `LE high, first word: got ${b9(qbits())}`);
st.d = 0b010100110; solve();                // LE still HIGH, new data
assert(qbits() === inv(0b010100110), `transparent follow-through: got ${b9(qbits())}, want ${b9(inv(0b010100110))}`);

// ── 4. LE LOW freezes; later D changes are ignored until LE returns HIGH ───────
st.le = 0; solve();                          // close latch on inv(010100110)
const held = qbits();
st.d = 0b111111111; solve();                 // LE low, data changed → hold
assert(qbits() === held, `LE low must hold ${b9(held)}, got ${b9(qbits())}`);

// ── 5. CLRn LOW clears the store → inverting clear drives all outputs HIGH ────
st.clr = 1; solve();
assert(qbits() === MASK, `CLRn: all Q should be HIGH (cleared store, inverted), got ${b9(qbits())}`);
st.clr = 0; st.le = 0; solve();              // release clear, latch stays closed
assert(qbits() === MASK, `after clear release, held word is 0 → outputs stay HIGH, got ${b9(qbits())}`);

// ── 6. OEQn HIGH → all nine outputs Hi-Z, stored word untouched ───────────────
// Reload a known non-trivial word first so "untouched" is meaningful.
load(0b101101011);
const before = qbits();                      // == inv(101101011)
st.oe = 1; solve();
for (let i = 0; i < 9; i++) assert(isHiZ(i), `OEQn high: Q${i}n should be Hi-Z`);
st.oe = 0; solve();                          // re-enable without reopening LE
assert(qbits() === before, `OEQn does not disturb state: want ${b9(before)}, got ${b9(qbits())}`);

console.log(`74x993-readback-latch-inv: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
