// ── 74x996 8-bit edge-triggered read-back latch — regression ────────────────
// The 74x996 (js/chips/chips46.js) drives the REG_READBACK_996 engine
// primitive. Pinout + behavior verified vs TI "SN54ALS996, SN74ALS996 8-Bit
// D-Type Edge-Triggered Read-Back Latches" SDAS098B (description + logic
// diagram, pages 1-2, read as PDF page images).
//
// Guarded here:
//   EN=0, RD=1, CLK↑   → register loads the 1D..8D pins; 1Q..8Q show it (T/C=1)
//   T/C=0              → 1Q..8Q show the inverse of the stored byte
//   OEn=1              → 1Q..8Q released to high-Z (read 0 in the harness)
//   CLRn=0             → register cleared to 0 immediately, overriding the clock
//   EN=1, CLK↑         → clock ignored, register holds
//   EN=0, RD=0         → stored byte is driven back onto the 1D..8D pins
//
// Run:  node js/debug/scenarios/74x996-readback-latch.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v !== null && v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x996');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const D = ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D'];
const Q = ['1Q', '2Q', '3Q', '4Q', '5Q', '6Q', '7Q', '8Q'];

let st = { en: 0, rd: 1, clk: 0, clrn: 1, tc: 1, oen: 0,
           d0: 0, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0, d7: 0 };

// wireD=true drives the data pins from rails (write mode). Set false to leave
// them floating so the chip's read-back drivers can be observed.
function apply(patch = {}, wireD = true) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x996 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('EN', st.en);
  wirePin('RD', st.rd);
  wirePin('CLK', st.clk);
  wirePin('CLRn', st.clrn);
  wirePin('T/C', st.tc);
  wirePin('OEn', st.oen);
  if (wireD) D.forEach((n, i) => wirePin(n, st['d' + i]));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const qbits = () => Q.map((n) => (isHigh(read(n)) ? 1 : 0));
const dbits = () => D.map((n) => (isHigh(read(n)) ? 1 : 0));
const bStr = (a) => a.join('');
const setD = (arr) => { const p = {}; arr.forEach((b, i) => (p['d' + i] = b)); return p; };

// Rising edge on CLK with control levels applied first.
function pulse(patch = {}, wireD = true) {
  apply({ ...patch, clk: 0 }, wireD);
  apply({ clk: 1 }, wireD);
  apply({ clk: 0 }, wireD);
}

const failures = [];
const eq = (got, want, msg) => {
  if (bStr(got) !== bStr(want)) failures.push(`${msg}: want ${bStr(want)} got ${bStr(got)}`);
};
const is = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. Write on CLK↑ (EN=0, RD=1, T/C=1): Q reflects D ──────────────────────
const v1 = [1, 0, 1, 1, 0, 0, 1, 0];
pulse({ en: 0, rd: 1, tc: 1, oen: 0, clrn: 1, ...setD(v1) });
eq(qbits(), v1, 'write loads D into register, Q = stored (T/C=1)');

// ── 2. Inputs change but no clock edge → Q holds ────────────────────────────
apply({ ...setD([0, 0, 0, 0, 0, 0, 0, 0]) });
eq(qbits(), v1, 'Q holds between clock edges');

// ── 3. T/C=0 → Q shows the inverse of the stored byte ───────────────────────
apply({ tc: 0 });
eq(qbits(), v1.map((b) => b ^ 1), 'T/C=0 inverts the Q outputs');
apply({ tc: 1 });

// ── 4. OEn=1 → Q outputs released (high-Z, read 0 with no bus pull) ─────────
apply({ oen: 1 });
is(Q.every((n) => !isHigh(read(n))), 'OEn=1 releases all Q outputs');
apply({ oen: 0 });
eq(qbits(), v1, 'stored byte survived output disable (OEn does not clear state)');

// ── 5. EN=1 blocks the clock: register holds through an edge ────────────────
const vX = [0, 1, 0, 0, 1, 1, 0, 1];
pulse({ en: 1, ...setD(vX) });
eq(qbits(), v1, 'EN=1 makes the clock a no-op (register unchanged)');

// ── 6. CLRn=0 clears immediately, overriding the clock ──────────────────────
apply({ en: 0, clrn: 0 });
eq(qbits(), [0, 0, 0, 0, 0, 0, 0, 0], 'CLRn=0 clears register to 0 (async)');
apply({ clrn: 1 });

// ── 7. Read-back: store a byte, then drive it back onto the D pins ──────────
const v7 = [1, 1, 0, 1, 0, 0, 1, 1];
pulse({ en: 0, rd: 1, clrn: 1, ...setD(v7) });      // write it
eq(qbits(), v7, 'write byte for read-back test');
apply({ en: 0, rd: 0 }, /* wireD */ false);          // enable read-back, D floating
eq(dbits(), v7, 'read-back drives the stored byte onto the 1D..8D pins');

// ── 8. RD=1 releases the D drivers (pins act as inputs again) ───────────────
apply({ en: 0, rd: 1 }, /* wireD */ false);
is(D.every((n) => !isHigh(read(n))), 'RD=1 releases the data pins (no read-back drive)');

if (failures.length) {
  console.error('74x996 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x996 read-back latch: all checks passed');
