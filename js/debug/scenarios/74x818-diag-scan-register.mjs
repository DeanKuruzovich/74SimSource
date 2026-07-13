// ── 74x818 8-bit diagnostic scan register — regression ──────────────────────
// The 74x818 (js/chips/chips40.js) drives the DIAG_SCAN_REG_818 engine
// primitive. Pinout + behavior verified vs TI/Cypress CY29FCT818T "Diagnostic
// Scan Register With 3-State Outputs" SCCS012B (function table page 2, logic
// diagram page 3, read as PDF images).
//
// Two 8-bit registers:
//   Pipeline register  → drives Y0..Y7 through the OE tri-state buffer.
//   Shadow register    → serial scan chain, SDI in / SDO = S7 out.
// Function table guarded here:
//   MODE=L, PCLK↑        → pipeline loads from D inputs, Y = D
//   MODE=L, DCLK↑        → shadow serial shift, S0←SDI, SDO emerges after 8 shifts
//   MODE=H, PCLK↑        → pipeline loads from shadow (a scanned-in value goes live)
//   MODE=H, SDI=L, DCLK↑ → shadow captures the Y outputs
//   MODE=H, SDI=H, DCLK↑ → shadow holds
//   OEn=1                → Y0..Y7 high-Z; SDO always driven
//
// Run:  node js/debug/scenarios/74x818-diag-scan-register.mjs  (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v !== null && v > HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x818');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const D = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
const Y = ['Y0', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7'];

let st = { oen: 0, dclk: 0, pclk: 0, mode: 0, sdi: 0,
           d0: 0, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0, d7: 0 };

function apply(patch = {}) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x818 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  wirePin('OEn', st.oen);
  wirePin('DCLK', st.dclk);
  wirePin('PCLK', st.pclk);
  wirePin('MODE', st.mode);
  wirePin('SDI', st.sdi);
  D.forEach((n, i) => wirePin(n, st['d' + i]));
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const ybits = () => Y.map((n) => (isHigh(read(n)) ? 1 : 0));
const bStr = (a) => a.join('');

// set D0..D7 from a bit array
const setD = (arr) => {
  const p = {}; arr.forEach((b, i) => (p['d' + i] = b)); return p;
};

// rising edge on a named clock (dclk|pclk) with control levels applied first
function pulse(clk, patch = {}) {
  apply({ ...patch, [clk]: 0 });
  apply({ [clk]: 1 });
  apply({ [clk]: 0 });
}

const failures = [];
const eq = (got, want, msg) => {
  if (bStr(got) !== bStr(want)) failures.push(`${msg}: want ${bStr(want)} got ${bStr(got)}`);
};
const is = (cond, msg) => { if (!cond) failures.push(msg); };

// ── 1. MODE=L, PCLK↑: pipeline loads from D inputs ──────────────────────────
const v1 = [1, 0, 1, 1, 0, 0, 1, 0];
pulse('pclk', { mode: 0, ...setD(v1) });
eq(ybits(), v1, 'pipeline load from D (MODE=L)');

// ── 2. MODE=L, DCLK↑: serial shift. Feed a known byte in LSB-first on SDI and
//        after 8 shifts it appears MSB (S7) at SDO. Bits entered: SDI sequence
//        1,0,0,0,0,0,0,0 → after 8 clocks the first bit has walked S0→S7=SDO. ──
const seq = [1, 0, 1, 1, 0, 1, 0, 0];   // 8 bits pushed on SDI, in order
for (const b of seq) pulse('dclk', { mode: 0, sdi: b });
// The FIRST bit pushed (seq[0]) has been shifted 8 times → it is now at S7=SDO.
is(isHigh(read('SDO')) === (seq[0] === 1), 'first SDI bit reaches SDO after 8 shifts');
// Pipeline (Y) was untouched by the shadow shifts.
eq(ybits(), v1, 'Y unchanged during shadow shift');

// ── 3. MODE=H, PCLK↑: pipeline loads from shadow register ───────────────────
// After step 2 the shadow holds seq shifted so S = [last..first] = reverse(seq)?
// S0 got the last pushed bit; S7 got the first. So S[i] (i=0..7) = seq[7-i].
const shadow = seq.slice().reverse();   // S0..S7
pulse('pclk', { mode: 1 });             // Pi ← Si  → Y = shadow
eq(ybits(), shadow, 'pipeline loads from shadow (MODE=H)');

// ── 4. MODE=H, SDI=L, DCLK↑: shadow captures the Y outputs ──────────────────
// Reload the pipeline with a fresh known byte first (MODE=L path), then capture.
const v4 = [0, 1, 1, 0, 1, 0, 0, 1];
pulse('pclk', { mode: 0, ...setD(v4) });
eq(ybits(), v4, 'reload pipeline before capture');
pulse('dclk', { mode: 1, sdi: 0 });     // Si ← Yi
// Shadow now equals v4. Verify by shipping it back into the pipeline.
pulse('pclk', { mode: 1 });
eq(ybits(), v4, 'shadow captured Y, then fed back to pipeline');

// ── 5. MODE=H, SDI=H, DCLK↑: shadow holds (no capture) ──────────────────────
const v5 = [1, 1, 1, 1, 0, 0, 0, 0];
pulse('pclk', { mode: 0, ...setD(v5) });   // pipeline = v5, but shadow still v4
pulse('dclk', { mode: 1, sdi: 1 });        // hold shadow
pulse('pclk', { mode: 1 });                // pipeline ← shadow (should still be v4)
eq(ybits(), v4, 'shadow held (SDI=H) — pipeline still gets v4, not v5');

// ── 6. OEn=1: Y outputs released (high-Z); SDO still driven ──────────────────
// v4 has HIGH bits (Y1,Y2,Y4,Y7); with the outputs released none may read HIGH.
// (The harness has no bus pull, so a released pin reads 0 rather than null.)
apply({ oen: 1 });
is(Y.every((n) => !isHigh(read(n))), 'all Y pins released (none driven HIGH) while OEn=1');
// SDO is never tri-stated; drive a known 1 into S7 and confirm it still appears.
pulse('dclk', { mode: 0, sdi: 1 });          // one shift so S0=1 walks toward S7
for (let i = 0; i < 7; i++) pulse('dclk', { mode: 0, sdi: 0 });
is(isHigh(read('SDO')) === true, 'SDO still driven while OEn=1');

if (failures.length) {
  console.error('74x818 FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('74x818 diagnostic scan register: all checks passed');
