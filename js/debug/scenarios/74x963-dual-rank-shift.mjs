// ── 74x963 dual-rank 8-bit shift register — regression ──────────────────────
// The 74x963 (js/chips/chips45.js) drives the SHIFT_REG_DUAL_RANK_963 engine
// primitive. Pinout + behavior verified vs TI "SN54ALS963/964, SN74ALS963/964
// Dual-Rank 8-Bit Shift Registers With 3-State Outputs" (doc D2881), in the 1986
// TI ALS/AS Logic Data Book: DIP-20 terminal assignment p.2-783, function table
// p.2-786, and the "typical sequence" timing waveform p.2-790 (read as PDF
// images). This scenario reproduces that datasheet waveform step for step.
//
// Two 8-bit registers, bit order A(MSB)..H(LSB):
//   Reg 1 = parallel I/O register → bidirectional pins IOA..IOH, clocked by CLK1.
//   Reg 2 = shift register → SERIN in / SEROUT = A-end out, clocked by CLK2.
// Active-low gates: OEn, GINn, G21n (Reg2→Reg1), G12n (Reg1→Reg2), GSHn (shift).
// SCLR = active-high synchronous clear. Shift is toward A: new[i]=old[i+1],
// new[H]=SERIN, SEROUT=old A.
//
// Datasheet typical sequence (p.2-790):
//   1. clear both registers            2. load Reg1 = 0011 0011 from I/O
//   3. copy Reg1 → Reg2                 4. load Reg1 = 0111 0111 from I/O
//   5. shift Reg2, SERIN=0 → 0110 0110  6. shift Reg2, SERIN=1 → 1100 1101
//   7. exchange Reg1 ↔ Reg2 → Reg1 = 1100 1101, Reg2 = 0111 0111
//
// Run:  node js/debug/scenarios/74x963-dual-rank-shift.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v !== null && v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x963');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const IO = ['IOA', 'IOB', 'IOC', 'IOD', 'IOE', 'IOF', 'IOG', 'IOH'];

// Full input state. `io` is either null (leave IOA..IOH unwired so they read the
// chip's own outputs) or an 8-bit array [A..H] to drive onto the pins as inputs.
let st = { oen: 1, serin: 0, ginn: 1, g21n: 1, sclr: 0, g12n: 1, gshn: 1,
           clk1: 0, clk2: 0, io: null };

function apply(patch = {}) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x963 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn', st.oen);
  wirePin('SERIN', st.serin);
  wirePin('GINn', st.ginn);
  wirePin('G21n', st.g21n);
  wirePin('SCLR', st.sclr);
  wirePin('G12n', st.g12n);
  wirePin('GSHn', st.gshn);
  wirePin('CLK1', st.clk1);
  wirePin('CLK2', st.clk2);
  if (st.io) IO.forEach((n, i) => wirePin(n, st.io[i]));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const bStr = (a) => a.join('');

// Pulse a clock (clk1|clk2) rising with control levels applied first.
function pulse(clk, patch = {}) {
  apply({ ...patch, [clk]: 0 });
  apply({ [clk]: 1 });
  apply({ [clk]: 0 });
}

// Read Reg 1 out of the IOA..IOH pins: enable outputs (OEn=0), no input, no
// clock, leave the pins unwired so we read what the chip drives.
function readReg1() {
  apply({ oen: 0, ginn: 1, g21n: 1, g12n: 1, gshn: 1, sclr: 0, io: null });
  return IO.map((n) => (isHigh(read(n)) ? 1 : 0));
}

// Copy Reg 2 into Reg 1 (G21n=0, CLK1 rising) then read it back. Destroys the
// previous Reg 1 contents — used only where that is acceptable.
function readReg2ViaCopy() {
  pulse('clk1', { oen: 1, ginn: 1, g21n: 0, g12n: 1, gshn: 1, sclr: 0, io: null });
  return readReg1();
}

const failures = [];
const eq = (got, want, msg) => {
  if (bStr(got) !== bStr(want)) failures.push(`${msg}: want ${bStr(want)} got ${bStr(got)}`);
};
const is = (cond, msg) => { if (!cond) failures.push(msg); };

const serout = () => (isHigh(read('SEROUT')) ? 1 : 0);

// ── 1. Clear both registers (SCLR high, pulse both clocks) ───────────────────
pulse('clk1', { sclr: 1, io: null });
pulse('clk2', { sclr: 1, io: null });
eq(readReg1(), [0, 0, 0, 0, 0, 0, 0, 0], 'clear Reg1');

// ── 2. Load Reg1 = 0011 0011 from the I/O pins (GINn=0, OEn=1, CLK1) ─────────
const w1 = [0, 0, 1, 1, 0, 0, 1, 1];
pulse('clk1', { oen: 1, ginn: 0, g21n: 1, sclr: 0, io: w1 });
eq(readReg1(), w1, 'load Reg1 from I/O = 0011 0011');

// ── 3. Copy Reg1 → Reg2 (G12n=0, CLK2). SEROUT then = Reg2 A-bit = 0 ─────────
pulse('clk2', { oen: 1, ginn: 1, g12n: 0, gshn: 1, sclr: 0, io: null });
is(serout() === 0, 'SEROUT = A-bit of Reg2 after copy (want 0)');
eq(readReg2ViaCopy(), w1, 'Reg2 holds 0011 0011 after copy from Reg1');

// readReg2ViaCopy clobbered Reg1; reload it to continue the datasheet sequence.
// ── 4. Load Reg1 = 0111 0111 from the I/O pins ──────────────────────────────
const w2 = [0, 1, 1, 1, 0, 1, 1, 1];
pulse('clk1', { oen: 1, ginn: 0, g21n: 1, sclr: 0, io: w2 });
eq(readReg1(), w2, 'load Reg1 from I/O = 0111 0111');

// ── 5. Shift Reg2, SERIN=0 (GSHn=0, G12n=1, CLK2): 0011 0011 → 0110 0110 ─────
pulse('clk2', { oen: 1, ginn: 1, g12n: 1, gshn: 0, serin: 0, sclr: 0, io: null });
is(serout() === 0, 'SEROUT after shift #1 = new A-bit (want 0)');

// ── 6. Shift Reg2, SERIN=1: 0110 0110 → 1100 1101 ───────────────────────────
pulse('clk2', { oen: 1, ginn: 1, g12n: 1, gshn: 0, serin: 1, sclr: 0, io: null });
is(serout() === 1, 'SEROUT after shift #2 = new A-bit (want 1)');

// Reg1 is still 0111 0111 at this point (shifts only touched Reg2).
eq(readReg1(), w2, 'Reg1 unchanged by Reg2 shifts');

// ── 7. Exchange Reg1 ↔ Reg2 (G21n=0 & G12n=0, both clocks pulse together) ────
// Both registers must swap using pre-edge values. Pulse both clocks in one step.
apply({ oen: 1, ginn: 1, g21n: 0, g12n: 0, gshn: 1, sclr: 0, serin: 0,
        clk1: 0, clk2: 0, io: null });
apply({ clk1: 1, clk2: 1 });
apply({ clk1: 0, clk2: 0 });
eq(readReg1(), [1, 1, 0, 0, 1, 1, 0, 1], 'after exchange Reg1 = 1100 1101');
// Reg1 now = 1100 1101; Reg2 should hold the old Reg1 = 0111 0111.
eq(readReg2ViaCopy(), w2, 'after exchange Reg2 = 0111 0111 (old Reg1)');

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error('74x963 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x963 dual-rank shift register: all checks passed');
