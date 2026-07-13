// ── 74x842 10-bit inverting transparent D latch (3-STATE) — regression ───────
// The 74x842 (js/chips/chips41.js) is the inverting member of the SN74ALS841/842
// 10-bit bus-interface D-LATCH family. Unlike the edge-triggered 74x82x bus
// flip-flops, this part is a LEVEL-sensitive transparent latch: while the latch
// enable (LE) is HIGH the outputs continuously follow the inputs; when LE goes
// LOW the ten bits are held. The '842 inverts, so transparent means Q = NOT D.
// It rides the width-agnostic D_LATCH_REG_TRI engine primitive with invert:true.
//
// D_LATCH_REG_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D9, LE, OEn]       (OEn active LOW)
//   outputs: [Q0..Q9]
//   LE=1 → transparent, Q follows D (Q = NOT D when gate.invert, the '842)
//   LE=0 → latched, Q holds its last value
//   OEn=0 → outputs driven; OEn=1 → Hi-Z; OEn does NOT change stored state.
//
// Pinout verified against TI SN74ALS841/842 (SDAS059C, rev. Jan 1995) terminal
// assignment + '842 function table + logic diagram, read as PDF page images
// (issues.md C4): OE=1, D0..D9=2..11, GND=12, LE=13, Q9..Q0=14..23, VCC=24.
// The '842 shares the '841 pinout exactly; only the D-input polarity differs.
//
// Checks:
//   1. While LE HIGH the latch is TRANSPARENT and INVERTING (Q = complement of D).
//   2. All-zeros D → all-ones Q; all-ones D → all-zeros Q (pure inversion).
//   3. Transparency: data changing WHILE LE stays HIGH DOES flow to Q (this is
//      the key difference from an edge-triggered flip-flop).
//   4. LE LOW freezes the word; later D changes are ignored until LE returns HIGH.
//   5. OE HIGH forces all ten outputs Hi-Z; the stored word is untouched.
//
// Run:  node js/debug/scenarios/74x842-latch-inv.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x842');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Latch state lives on the (persistent) chip component, not the wires, so a
// fresh WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x842 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('LE', st.le ? 1 : 0);
  wirePin('OEn', st.oe ? 1 : 0);
  for (let i = 0; i < 10; i++) wirePin(`D${i}`, (st.d >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (n) => driveOf(`Q${n}`) === DRIVE.HIGH_Z;
const qbits = () => {
  let v = 0;
  for (let i = 0; i < 10; i++) if (isHigh(read(`Q${i}`))) v |= (1 << i);
  return v;
};

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const MASK = 0x3FF; // 10 bits
const inv = (n) => (~n) & MASK;
const b10 = (n) => n.toString(2).padStart(10, '0');

// Full input picture every solve. OE held LOW = outputs enabled.
const st = { le: 0, oe: 0, d: 0 };
const solve = () => apply(st);

// Transparent load: raise LE, present D — Q follows NOT D — then drop LE to hold.
function load(word) {
  st.d = word;
  st.le = 1; solve();   // transparent → Q = NOT D
  st.le = 0; solve();   // latch closes → word held
}

// ── 1. Transparent capture is INVERTING ──────────────────────────────────────
load(0b1010110010);
assert(qbits() === inv(0b1010110010), `inv load: got ${b10(qbits())}, want ${b10(inv(0b1010110010))}`);

// ── 2. Pure inversion at the rails ───────────────────────────────────────────
load(0b0000000000);
assert(qbits() === MASK, `zeros → all Q high, got ${b10(qbits())}`);
load(0b1111111111);
assert(qbits() === 0, `ones → all Q low, got ${b10(qbits())}`);

// ── 3. Transparency: D changes flow to Q WHILE LE stays HIGH ──────────────────
// (This is exactly where a flip-flop would hold and a latch must not.)
st.le = 1; st.d = 0b1010110010; solve();
assert(qbits() === inv(0b1010110010), `LE high, first word: got ${b10(qbits())}`);
st.d = 0b0101001101; solve();               // LE still HIGH, new data
assert(qbits() === inv(0b0101001101), `transparent follow-through: got ${b10(qbits())}, want ${b10(inv(0b0101001101))}`);

// ── 4. LE LOW freezes; later D changes are ignored until LE returns HIGH ──────
st.le = 0; solve();                         // close the latch on inv(0101001101)
const held = qbits();
st.d = 0b1111111111; solve();               // LE low, data changed → hold
assert(qbits() === held, `LE low must hold ${b10(held)}, got ${b10(qbits())}`);
st.le = 1; solve();                         // reopen → transparent again
assert(qbits() === inv(0b1111111111), `reopen transparent: got ${b10(qbits())}`);
st.le = 0; solve();                         // re-latch the all-ones→all-zeros word
const before = qbits();                     // == 0

// ── 5. OE HIGH → all ten outputs Hi-Z, stored word untouched ─────────────────
st.oe = 1; solve();
for (let i = 0; i < 10; i++) assert(isHiZ(i), `OE high: Q${i} should be Hi-Z`);
st.oe = 0; solve();                         // re-enable without reopening LE
assert(qbits() === before, `OE does not disturb state: want ${b10(before)}, got ${b10(qbits())}`);

console.log(`74x842-latch-inv: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
