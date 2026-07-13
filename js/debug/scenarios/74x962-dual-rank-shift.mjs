// ── 74x962 (DM74LS962) dual-rank 8-bit TRI-STATE shift register regression ────
// Behavioral coverage of the DUAL_RANK_SHIFT_962 primitive against the VERIFIED
// National DM54LS962/DM74LS962 pinout + Function Table (1987 National LS/S/TTL
// Logic Databook, pp. 2-264..2-267; see chips45.js header + CMOS notes).
//
// Two 8-bit ranks share one clock. Register A is the parallel rank wired to the
// eight bidirectional I/O pins; register B is the serial shift rank (IS -> OS).
// Six control inputs, ALL active LOW, gate what each rank does on the rising
// clock edge. This guards:
//   • parallel load  (DISI low)  : reg A <- I/O pins, read back via output enable;
//   • output enable  (DISO low)  : reg A drives the I/O pins, else Hi-Z;
//   • transfer down  (DISTD low) : reg B <- reg A;
//   • serial shift   (DISS low)  : reg B shifts IS -> B1 ... -> B8, OS = B8;
//   • transfer up    (DISTU low) : reg A <- reg B;
//   • exchange (DISTU+DISTD low) : reg A <-> reg B swap in one edge;
//   • data-ORing     (DISTD+DISI): reg B <- (I/O pins OR reg A).
//
// Run:  node js/debug/scenarios/74x962-dual-rank-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x962');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const IO = ['IO1','IO2','IO3','IO4','IO5','IO6','IO7','IO8'];

// Control-pin levels (1 = HIGH/inactive, 0 = LOW/active). All DIS* default HIGH.
const st = { CLK: 0, IS: 0, DISO: 1, DISI: 1, DISTU: 1, DISTD: 1, DISS: 1 };
// When `ioDrive` is an 8-element array, wire each I/O pin to a rail (external
// source into register A). When null, leave the I/O pins free so the chip may
// drive them (output mode) or float.
let ioDrive = null;

function solve() {
  const wm = new WireManager();
  const wirePin = (name, row) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x962 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(p.col, 29), row), p.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const k of ['CLK','IS','DISO','DISI','DISTU','DISTD','DISS']) wirePin(k, st[k] ? 1 : 0);
  if (ioDrive) for (let i = 0; i < 8; i++) wirePin(IO[i], ioDrive[i] ? 1 : 0);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const readBus = () => IO.map(n => (isHigh(read(n)) ? 1 : 0)); // [IO1..IO8]

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// One rising clock edge with the current control lines (and I/O drive) held.
function pulse() {
  st.CLK = 0; solve();
  st.CLK = 1; solve();   // rising edge does the work
  st.CLK = 0; solve();
}

// Set all DIS* controls inactive (HIGH) between operations.
function idle() { st.DISO = st.DISI = st.DISTU = st.DISTD = st.DISS = 1; }

// ── 1. Parallel load of register A from the I/O pins, read back on the bus ────
const P = [1,0,1,0,0,1,0,1]; // IO1..IO8
idle();
st.DISI = 0;            // input disable asserted -> load A from I/O pins
ioDrive = P;
pulse();
// Read A back onto the bus: output enable, stop driving the pins externally.
idle();
ioDrive = null;
st.DISO = 0;           // output enable -> reg A onto the I/O pins
solve();
assert(eq(readBus(), P), `parallel load/readback: expected ${P} got ${readBus()}`);

// Output-disable => I/O pins Hi-Z (not driven).
idle();                // DISO back HIGH
solve();
assert(!isHigh(read('IO1')) && !isHigh(read('IO3')),
  `outputs should be Hi-Z when DISO inactive, got IO1=${read('IO1')} IO3=${read('IO3')}`);

// ── 2. Transfer down A -> B, then shift it out serially at OS ─────────────────
// A currently holds P. Copy it down into shift register B.
idle();
st.DISTD = 0;          // transfer down asserted -> B <- A
ioDrive = null;
pulse();
// OS reflects B8 = bit that came from IO8 = P[7] = 1.
assert(isHigh(read('OS')) === (P[7] === 1), `after transfer-down OS should equal P[7]=${P[7]}, got ${read('OS')}`);
// Shift B toward OS. Bits emerge MSB-first: B8,B7,...,B1 = P[7],P[6],...,P[0].
idle();
st.DISS = 0;           // shift enable
st.IS = 0;             // feed zeros in
const emitted = [P[7]]; // OS before shifting is already B8
for (let i = 6; i >= 0; i--) { pulse(); emitted.push(isHigh(read('OS')) ? 1 : 0); }
const expectedSerial = [P[7],P[6],P[5],P[4],P[3],P[2],P[1],P[0]];
assert(eq(emitted, expectedSerial), `serial-out order: expected ${expectedSerial} got ${emitted}`);

// ── 3. Serial-IN through IS lands at B1 and walks to B8 (OS) ──────────────────
// Shift a lone 1 in at IS; any leftover bit in B is flushed out first.
idle();
st.DISS = 0; st.IS = 1;
pulse();               // B1 <- 1 (lone 1 now at stage 1)
st.IS = 0;
for (let i = 0; i < 7; i++) { assert(!isHigh(read('OS')), `lone 1 not yet at OS, step ${i}`); pulse(); }
assert(isHigh(read('OS')), `serial 1 should reach OS (B8) after 8 shifts, got ${read('OS')}`);

// ── 4. Transfer up B -> A, read A back on the bus ────────────────────────────
// Load a known Q into B via load-A-then-transfer-down, then transfer up to A.
const Q = [0,1,1,0,1,0,0,1]; // IO1..IO8
idle(); st.DISI = 0; ioDrive = Q; pulse();        // A <- Q
idle(); st.DISTD = 0; ioDrive = null; pulse();    // B <- A(=Q)
idle(); st.DISI = 0; ioDrive = [0,0,0,0,0,0,0,0]; pulse(); // A <- 0 (wipe A)
idle(); st.DISTU = 0; ioDrive = null; pulse();    // A <- B(=Q)
idle(); ioDrive = null; st.DISO = 0; solve();
assert(eq(readBus(), Q), `transfer-up: A should equal Q ${Q}, got ${readBus()}`);

// ── 5. Exchange: A and B swap in one edge ────────────────────────────────────
// Set A = P (bus), B = Q (already there from step 4), then exchange.
idle(); st.DISI = 0; ioDrive = P; pulse();        // A <- P (B still Q)
idle(); st.DISTU = 0; st.DISTD = 0; ioDrive = null; pulse(); // swap: A<-Q(=B), B<-P(=A)
idle(); ioDrive = null; st.DISO = 0; solve();
assert(eq(readBus(), Q), `exchange: A should now hold old B (=Q) ${Q}, got ${readBus()}`);
// And B should now hold old A (=P): OS = P[7].
idle(); solve();
assert(isHigh(read('OS')) === (P[7] === 1), `exchange: B8 (OS) should equal P[7]=${P[7]}, got ${read('OS')}`);

// ── 6. Data-ORing: transfer-down while also loading A => B <- (I/O OR A) ──────
// Load A with a1=0b...; then in one edge assert DISTD + DISI with I/O pins.
// A <- I/O pins; B <- (I/O pins OR old A).
idle(); st.DISI = 0; ioDrive = [1,1,0,0,0,0,0,0]; pulse();  // A = 1,1,0,0,0,0,0,0
idle(); st.DISI = 0; st.DISTD = 0; ioDrive = [0,0,1,1,0,0,0,0]; pulse(); // A<-newIO, B<-(IO OR oldA)
// old A = 1,1,0,0,0,0,0,0 ; IO = 0,0,1,1,0,0,0,0 ; OR = 1,1,1,1,0,0,0,0
// New A should be the I/O pins we drove: 0,0,1,1,0,0,0,0
idle(); ioDrive = null; st.DISO = 0; solve();
assert(eq(readBus(), [0,0,1,1,0,0,0,0]), `DOR: reg A should hold new I/O ${[0,0,1,1,0,0,0,0]}, got ${readBus()}`);
// B[7] (OS) is 0 for both, so shift B out and confirm the OR pattern MSB-first.
idle(); st.DISS = 0; st.IS = 0;
const dorOut = [];
for (let i = 7; i >= 0; i--) { dorOut.push(isHigh(read('OS')) ? 1 : 0); pulse(); }
// OR = B in IO1..IO8 order = [1,1,1,1,0,0,0,0]; serial MSB-first = B8..B1 = [0,0,0,0,1,1,1,1]
assert(eq(dorOut, [0,0,0,0,1,1,1,1]), `DOR serial-out expected ${[0,0,0,0,1,1,1,1]} got ${dorOut}`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error('74x962 FAIL:');
  for (const f of failures) console.error('  • ' + f);
  process.exit(1);
}
console.log('74x962 dual-rank 8-bit shift register: all checks passed.');
