// ── 74x822 10-bit inverting bus interface flip-flop (3-STATE) — regression ───
// The 74x822 (js/chips/chips40.js) is the inverting member of the SN74AS821/822
// 10-bit bus-interface flip-flop family. It is identical to the non-inverting
// 74x821 except the registered output is the complement of the captured data:
// on the rising clock edge each stored bit becomes Q = NOT D. It rides the
// width-agnostic D_FF_REG_TRI engine primitive with gate.invert:true.
//
// D_FF_REG_TRI contract (js/specificChipsSim.js):
//   inputs:  [D0..D9, CLK, OEn]      (OEn active LOW)
//   outputs: [Q0..Q9]                rising-edge parallel capture
//   gate.invert === true → Q = NOT D (the '822); false → Q = D (the '821)
//   OEn=0 → outputs driven; OEn=1 → Hi-Z; OEn does NOT change stored state.
//
// Pinout verified against TI SN54AS821A/SN74AS821A (SDAS230A, rev. Aug 1995)
// terminal assignment + function table, read as PDF page images (issues.md C4):
// OE=1, D0..D9=2..11, GND=12, CLK=13, Q9..Q0=14..23, VCC=24. The '822 shares
// this pinout; only the output polarity differs.
//
// Checks:
//   1. Rising-edge parallel capture is INVERTING (Q = complement of D).
//   2. All-zeros D → all-ones Q; all-ones D → all-zeros Q (pure inversion).
//   3. Falling edge holds; the next rising edge captures the new (inverted) word.
//   4. Data changing while CP stays HIGH must not change Q (edge-only).
//   5. OE HIGH forces all ten outputs Hi-Z; the stored word is untouched.
//
// Run:  node js/debug/scenarios/74x822-bus-ff-inv.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';
import { DRIVE } from '../../constants.js';

const HIGH = 2.5; // logic threshold (rails settle to ~5 V)
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x822');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// Re-solve with every input pin held at a rail level (1 = VCC row, 0 = GND row).
// Register state lives on the (persistent) chip component, not the wires, so a
// fresh WireManager per solve is fine.
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x822 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('CLK', st.clk ? 1 : 0);
  wirePin('OEn', st.oe ? 1 : 0);
  for (let i = 0; i < 10; i++) wirePin(`D${i}`, (st.d >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const driveOf = (name) => {
  const ds = sim.pinDriveStates.get(chip.id + ':' + name);
  return ds ? ds.type : undefined;
};
const isHiZ = (name) => driveOf(`Q${name}`) === DRIVE.HIGH_Z;
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
const st = { clk: 0, oe: 0, d: 0 };
const solve = () => apply(st);

// Load a 10-bit word: present D, then a rising CP edge captures its complement.
function load(word) {
  st.d = word;
  st.clk = 0; solve();   // setup data, clock low
  st.clk = 1; solve();   // rising edge → capture NOT D on all ten bits at once
}

// ── 1. Rising-edge parallel capture is INVERTING ─────────────────────────────
load(0b1010110010);
assert(qbits() === inv(0b1010110010), `inv load: got ${b10(qbits())}, want ${b10(inv(0b1010110010))}`);

// ── 2. Pure inversion at the rails ───────────────────────────────────────────
load(0b0000000000);
assert(qbits() === MASK, `zeros → all Q high, got ${b10(qbits())}`);
load(0b1111111111);
assert(qbits() === 0, `ones → all Q low, got ${b10(qbits())}`);

// ── 3. Falling edge holds; next rising edge captures the new word ────────────
load(0b1010110010);                         // Q = inv(that)
const held = qbits();
st.d = 0b0101001101;
st.clk = 0; solve();                        // drop clock only — no capture
assert(qbits() === held, `falling edge must hold ${b10(held)}, got ${b10(qbits())}`);
st.clk = 1; solve();                        // rising edge captures new inverted word
assert(qbits() === inv(0b0101001101), `rising capture: got ${b10(qbits())}`);

// ── 4. Data changing while CP stays HIGH must NOT change Q (edge-only) ────────
const before = qbits();
st.d = 0b1111111111; solve();               // clock still HIGH, data changed → hold
assert(qbits() === before, `level-change while CP high must hold ${b10(before)}, got ${b10(qbits())}`);

// ── 5. OE HIGH → all ten outputs Hi-Z, stored word untouched ─────────────────
st.oe = 1; solve();
for (let i = 0; i < 10; i++) assert(isHiZ(i), `OE high: Q${i} should be Hi-Z`);
st.oe = 0; solve();                         // re-enable without re-clocking
assert(qbits() === before, `OE does not disturb state: want ${b10(before)}, got ${b10(qbits())}`);

console.log(`74x822-bus-ff-inv: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
