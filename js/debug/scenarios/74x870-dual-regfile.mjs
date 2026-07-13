// ── 74x870 dual 16×4 register file regression ────────────────────────────────
// The 74x870 (js/chips/chips42.js) is two independent 16-word × 4-bit register
// files sharing two bidirectional 3-state bus ports (A and B). It rides the
// REG_FILE_DUAL16X4_TRI engine primitive (js/specificChipsSim.js).
//
// Primitive contract:
//   inputs:  [S0,S1,S2,S3, 1W,2W, 1A0..1A3, 2A0..2A3, DQA0..DQA3, DQB0..DQB3]
//   outputs: [DQA0..DQA3, DQB0..DQB3]   (same physical bidir pins)
//   S0/S1 route port A/B to file 1 (L) or file 2 (H). Each file owns its address
//   bus (1A / 2A). S2/S3 set port A/B direction: L = output (drive the bus from
//   the selected file), H = input (release the bus, write it into the file).
//   1W/2W active-LOW, level-sensitive write enables. B port wins a same-file write.
//
// Method: place ONE 74x870, keep the same chip + sim instance so the register
// files (comp.ffState) persist across solves. A bidir DQ pin is wired to a rail
// ONLY when its port is in input mode; in output mode it is left floating so the
// chip drives it (wiring it to a rail then would be bus contention).
//
// Run:  node js/debug/scenarios/74x870-dual-regfile.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x870');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

// st: { s0,s1,s2,s3, w1,w2, a1,a2, dqa,dqb }  (a1/a2 = 4-bit addr, dqa/dqb = nibble)
function apply(st) {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x870 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const s of ['S0', 'S1', 'S2', 'S3']) wirePin(s, st[s.toLowerCase()] ? 1 : 0);
  wirePin('1W', st.w1 ? 1 : 0);
  wirePin('2W', st.w2 ? 1 : 0);
  for (let i = 0; i < 4; i++) {
    wirePin(`1A${i}`, (st.a1 >> i) & 1);
    wirePin(`2A${i}`, (st.a2 >> i) & 1);
  }
  // Drive DQ pins only when that port is an input (chip is not driving them).
  if (st.s2) for (let i = 0; i < 4; i++) wirePin(`DQA${i}`, (st.dqa >> i) & 1);
  if (st.s3) for (let i = 0; i < 4; i++) wirePin(`DQB${i}`, (st.dqb >> i) & 1);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const nibble = (prefix) => {
  let v = 0;
  for (let i = 0; i < 4; i++) if (isHigh(read(`${prefix}${i}`))) v |= (1 << i);
  return v;
};
const dqa = () => nibble('DQA');
const dqb = () => nibble('DQB');

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Base state: both ports output, writes disabled, addresses 0.
const st = { s0: 0, s1: 0, s2: 0, s3: 0, w1: 1, w2: 1, a1: 0, a2: 0, dqa: 0, dqb: 0 };

// ── 1. Write 0xA to file 1 word 5 via port A, read it back on port A ──────────
Object.assign(st, { s0: 0, s2: 1, a1: 5, dqa: 0xA, w1: 0 }); apply(st); // write
Object.assign(st, { w1: 1, s2: 0 }); apply(st);                        // read A
assert(dqa() === 0xA, `file1[5] via port A: got ${dqa().toString(2)}, want 1010`);

// ── 2. Same word is visible on port B (also routed to file 1, same address) ──
Object.assign(st, { s1: 0, s3: 0, a1: 5 }); apply(st);
assert(dqb() === 0xA, `file1[5] via port B: got ${dqb().toString(2)}, want 1010`);

// ── 3. Files are independent: write 0x5 to file 2 word 3 via port B ──────────
Object.assign(st, { s1: 1, s3: 1, a2: 3, dqb: 0x5, w2: 0 }); apply(st); // B→file2 write
Object.assign(st, { w2: 1, s3: 0 }); apply(st);
// Port A reads file 2 word 3 (S0=1 routes A to file 2, uses 2A bus).
Object.assign(st, { s0: 1, s2: 0, a2: 3 }); apply(st);
assert(dqa() === 0x5, `file2[3] via port A: got ${dqa().toString(2)}, want 0101`);
// File 1 word 5 is untouched — read it on port B.
Object.assign(st, { s1: 0, s3: 0, a1: 5 }); apply(st);
assert(dqb() === 0xA, `file1[5] after file2 write: got ${dqb().toString(2)}, want 1010`);

// ── 4. Write-enable gating: with 1W HIGH, an input-mode port must not write ──
Object.assign(st, { s0: 0, s2: 1, a1: 5, dqa: 0x3, w1: 1 }); apply(st); // W disabled
Object.assign(st, { s2: 0 }); apply(st);
assert(dqa() === 0xA, `write with 1W HIGH must not store: got ${dqa().toString(2)}, want 1010`);

// ── 5. B-port write priority: both ports write file 1 word 7 at once ─────────
Object.assign(st, { s0: 0, s1: 0, s2: 1, s3: 1, a1: 7, dqa: 0x3, dqb: 0xC, w1: 0 });
apply(st);
Object.assign(st, { w1: 1, s2: 0, s3: 0 }); apply(st); // read word 7 on port A
assert(dqa() === 0xC, `B-port priority: got ${dqa().toString(2)}, want 1100 (B data)`);

// ── 6. Tri-state release: in input mode the chip does not drive the bus ───────
// Drive DQB externally to 0x6 while port B is an input; the chip must accept it,
// not fight it — proven by reading it back cleanly on port A afterwards.
Object.assign(st, { s1: 0, s3: 1, a1: 9, dqb: 0x6, w1: 0 }); apply(st); // B→file1[9] write
Object.assign(st, { w1: 1, s3: 0, s0: 0, s2: 0, a1: 9 }); apply(st);    // read on port A
assert(dqa() === 0x6, `bidir write via port B read on A: got ${dqa().toString(2)}, want 0110`);

console.log(`74x870-dual-regfile: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
