// ── 74x597 8-bit PISO shift register with input latch — regression ───────────
// Guards the C2-class pinout fix + behavioral completion of the
// SHIFT_REG_8BIT_PISO_LATCH primitive (js/chips/chips32.js, js/specificChipsSim.js).
//
// The original entry had an INVENTED pinout: it put SER on pin 1, parallel data on
// pins 2-10, and "QG"/"QH" OUTPUTS on pins 14/15. The real SN74LS597 (TI SDLS007,
// terminal diagram read as PDF page images) is:
//   1-7 = B,C,D,E,F,G,H (parallel inputs), 8 = GND, 9 = QH' (serial out),
//   10 = SRCLR (async clear, active low), 11 = SRCK (shift clock),
//   12 = RCK (latch clock), 13 = SRLOAD (async load, active low),
//   14 = SER (serial in), 15 = A (parallel input), 16 = VCC.
// The primitive was also missing SRCLR entirely; it is now modelled.
//
// This test would have failed against the old build in three independent ways:
//   - getPinByName('A')/('SRLOAD')/('SRCLR')/('QHs') did not exist (wrong names);
//   - there was no serial output on pin 9 to read;
//   - there was no async clear.
//
// Method (mirrors cd4021-piso-shift.mjs): place ONE 74x597 and reuse the same chip
// + sim instance so the register's sequential state persists across solves. Each
// pin is wired to the VCC row (1) or GND row (0) before every evaluate().
//
// Bit map: storage latch bit i, i=0..7, = inputs A,B,C,D,E,F,G,H. A parallel load
// copies latch → shift register, so sr[0]=A .. sr[7]=H and QHs = sr[7] = H. A shift
// does sr.pop()+unshift(SER): SER enters at the A end, and the byte leaves QHs in
// the order H, G, F, E, D, C, B, A.
//
// Run:  node js/debug/scenarios/74x597-piso-inlatch.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x597');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const PARALLEL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
// Defaults: SRCLR high (inactive), SRLOAD high (shift mode), clocks low, SER low.
let ctrl = { SRCK: 0, RCK: 0, SRLOAD: 1, SRCLR: 1, SER: 0 };
let data = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 };

function apply(over = {}) {
  const { p = null, ...rest } = over;
  ctrl = { ...ctrl, ...rest };
  if (p) data = { ...data, ...p };
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x597 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), row), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const k of ['SRCK', 'RCK', 'SRLOAD', 'SRCLR', 'SER']) wirePin(k, ctrl[k] ? 1 : 0);
  for (const k of PARALLEL) wirePin(k, data[k] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qhs  = () => (isHigh(read('QHs')) ? 1 : 0);

// A parallel-load pulse: SRLOAD low (async copy latch→shift reg) then back high.
function load() { apply({ SRLOAD: 0 }); apply({ SRLOAD: 1 }); }
// A shift pulse: rising SRCK with SRLOAD/SRCLR inactive high; then back low.
function shift(ser = 0) {
  apply({ SRCK: 1, SRLOAD: 1, SRCLR: 1, SER: ser });
  apply({ SRCK: 0, SRLOAD: 1, SRCLR: 1, SER: ser });
}
// Rising edge on RCK to latch the current A–H into the storage latch.
function latch() { apply({ RCK: 1 }); apply({ RCK: 0 }); }

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. RCK latches A–H; SRLOAD then loads; H comes out first ─────────────────
// Byte on A–H: A=0 B=0 C=0 D=0 E=1 F=1 G=0 H=1  → serial order H,G,F,E,D,C,B,A
//                                                = 1,0,1,1,0,0,0,0
const expected = { H: 1, G: 0, F: 1, E: 1, D: 0, C: 0, B: 0, A: 0 };
apply({ p: { A: 0, B: 0, C: 0, D: 0, E: 1, F: 1, G: 0, H: 1 } });
latch();
// RCK alone must NOT change the serial output — the shift register isn't loaded yet.
assert(qhs() === 0, `after RCK only, QHs should still be 0 (not loaded yet), got ${qhs()}`);
load();
assert(qhs() === expected.H, `after load, QHs should be H=${expected.H}, got ${qhs()}`);
// Now clock the remaining 7 bits out and check the full order H,G,F,E,D,C,B,A.
const order = ['G', 'F', 'E', 'D', 'C', 'B', 'A'];
for (const bit of order) {
  shift(0);
  assert(qhs() === expected[bit], `serial read: expected ${bit}=${expected[bit]} at QHs, got ${qhs()}`);
}

// ── 2. RCK is a snapshot: changing A–H after the edge does not re-latch ───────
// Latch a 1 on H, then drop H to 0 while RCK stays low. A fresh load must still
// produce the OLD latched value (H=1), proving the latch froze the snapshot.
apply({ p: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 1 } });
latch();
apply({ p: { H: 0 } });          // change the input, but do NOT pulse RCK
load();
assert(qhs() === 1, `snapshot: QHs should hold old H=1 after input changed w/o RCK, got ${qhs()}`);
// A new RCK edge now re-latches the new (H=0) value.
latch();
load();
assert(qhs() === 0, `snapshot: after a fresh RCK edge QHs should follow new H=0, got ${qhs()}`);

// ── 3. SRCLR asynchronously clears, and dominates SRLOAD ─────────────────────
// Load a byte with H=1, confirm, then assert SRCLR low → QHs 0 with no clock.
apply({ p: { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1, G: 1, H: 1 } });
latch();
load();
assert(qhs() === 1, `pre-clear: QHs should be H=1, got ${qhs()}`);
apply({ SRCLR: 0 });             // async clear, no clock edge
assert(qhs() === 0, `SRCLR low should clear the shift register to 0, got ${qhs()}`);
// Clear must win over load: hold SRCLR low AND SRLOAD low → still zeros.
apply({ SRCLR: 0, SRLOAD: 0 });
assert(qhs() === 0, `SRCLR must dominate SRLOAD (both low → 0), got ${qhs()}`);
apply({ SRCLR: 1, SRLOAD: 1 });  // release both

// ── 4. Serial input ripples from SER (A end) to QHs (H end) in 8 shifts ──────
// Clear to zero, then clock a single 1 in on SER and watch it reach QHs.
apply({ SRCLR: 0 }); apply({ SRCLR: 1 });
assert(qhs() === 0, `zero start: QHs should be 0 after clear, got ${qhs()}`);
shift(1);                        // 1 enters at A (bit0); not yet at QHs (bit7)
assert(qhs() === 0, `ser ripple: after 1 shift QHs (bit7) should still be 0, got ${qhs()}`);
for (let i = 0; i < 6; i++) shift(0);   // 6 more (total 7) — bit now at bit7-1
assert(qhs() === 0, `ser ripple: after 7 shifts QHs should still be 0, got ${qhs()}`);
shift(0);                        // 8th shift brings the bit to QHs
assert(qhs() === 1, `ser ripple: after 8 shifts the SER=1 bit should reach QHs, got ${qhs()}`);

console.log(`74x597-piso-inlatch: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
