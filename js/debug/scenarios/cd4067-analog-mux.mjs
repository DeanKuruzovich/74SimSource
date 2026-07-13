// ── CD4067 regression: 16-channel analog mux/demux (ANALOG_MUX_16) ──────────
// Verifies the bidirectional transmission-gate behavior of the 24-pin part:
//   • the channel addressed by D,C,B,A is resistively coupled to the common Z;
//   • unaddressed channels are open (Z follows only its own pull-down);
//   • INHIBIT HIGH opens every channel regardless of the address;
//   • the switch is bidirectional (drive Z, the addressed channel follows).
//
// Method mirrors the CD4051 scenario: drive one channel hard to 5 V, hang a
// large (100 kΩ) pull-down on Z, and read Z. When that channel is selected the
// 125 Ω ON path dominates the 100 kΩ pull-down and Z ≈ 5 V; otherwise Z is
// isolated and the pull-down holds it near 0 V.
//
// Run:  node js/debug/scenarios/cd4067-analog-mux.mjs   (exits non-zero on fail)
//
// 24-pin chip at col 5.  Bottom row (row 5) cols 5..16 = pins 1..12;
// top row (row 4) cols 5..16 = pins 24..13.  Pin → (col, half):
//   bottom:  Z=c5 · Y7=c6 · Y6=c7 · Y5=c8 · Y4=c9 · Y3=c10 · Y2=c11 ·
//            Y1=c12 · Y0=c13 · A=c14 · B=c15 · VSS=c16
//   top:     VDD=c5 · Y8=c6 · Y9=c7 · Y10=c8 · Y11=c9 · Y12=c10 · Y13=c11 ·
//            Y14=c12 · Y15=c13 · INH=c14 · C=c15 · D=c16
//   (NOTE: real CD4067B has no VEE pin — signal path is VDD..VSS referenced.)
// Wire a top pin via main:col:3, a bottom pin via main:col:6.

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// Build a CD4067 with VDD/VSS powered, INH = inhibit level, address bits driven
// to {a,b,c,d}, channel Y5 (sel=5) hard-driven to 5 V, and a 100k pull-down on
// Z so isolation reads as ~0 V.
function build({ a, b, c, d, inh }) {
  const hi = '0:0:power:1:1';  // any VCC-rail hole (5 V)
  const lo = '0:0:power:1:2';  // any GND-rail hole (0 V)
  const railHi = col => `0:0:power:${col}:1`;
  const railLo = col => `0:0:power:${col}:2`;
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4067' },
      // 100k pull-down on Z (pin1 = col5 bottom)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:5:7', endHoleId: '0:0:power:5:0' },
    ],
    wires: [
      { id: 1, startHoleId: railHi(5),  endHoleId: '0:0:main:5:3'  }, // VDD pin24 (top c5) → 5V
      { id: 2, startHoleId: railLo(16), endHoleId: '0:0:main:16:6' }, // VSS pin12 (bot c16) → GND
      { id: 3, startHoleId: railHi(8),  endHoleId: '0:0:main:8:6'  }, // Y5 pin4 (bot c8) → 5V (driven channel)
      // address bits (A,B bottom; C,D top)
      { id: 4, startHoleId: a ? railHi(14) : railLo(14), endHoleId: '0:0:main:14:6' }, // A pin10 (bot c14)
      { id: 5, startHoleId: b ? railHi(15) : railLo(15), endHoleId: '0:0:main:15:6' }, // B pin11 (bot c15)
      { id: 6, startHoleId: c ? railHi(6)  : railLo(6),  endHoleId: '0:0:main:15:3' }, // C pin14 (top c15)
      { id: 7, startHoleId: d ? railHi(7)  : railLo(7),  endHoleId: '0:0:main:16:3' }, // D pin13 (top c16)
      // inhibit (top c14)
      { id: 8, startHoleId: inh ? railHi(9) : railLo(9), endHoleId: '0:0:main:14:3' }, // INH pin15
    ],
  });
}

// ── 1. Select channel 5 (DCBA = 0101) → Z couples to the 5V-driven Y5 ───────
{
  console.log('\n1. CD4067 address D,C,B,A = 0,1,0,1 → channel 5 selected, Z ≈ 5V');
  const h = build({ a: 1, b: 0, c: 1, d: 0, inh: 0 });
  h.evaluate();
  const vz = h.pinVoltage(10, 'Z');
  check('Z pulled up to the driven channel through the ON switch', vz > 4.5, `Vz=${fmt(vz)}`);
}

// ── 2. Select channel 0 (DCBA = 0000) → Y5 isolated, Z held low by pull-down ─
{
  console.log('\n2. Address D,C,B,A = 0,0,0,0 → channel 0 selected, Y5 isolated, Z ≈ 0V');
  const h = build({ a: 0, b: 0, c: 0, d: 0, inh: 0 });
  h.evaluate();
  const vz = h.pinVoltage(10, 'Z');
  check('Z isolated from Y5 → pull-down wins', vz < 0.5, `Vz=${fmt(vz)}`);
}

// ── 3. INHIBIT HIGH while addressing channel 5 → all channels open ──────────
{
  console.log('\n3. Address points at channel 5 but INH = HIGH → all switches open, Z ≈ 0V');
  const h = build({ a: 1, b: 0, c: 1, d: 0, inh: 1 });
  h.evaluate();
  const vz = h.pinVoltage(10, 'Z');
  check('INHIBIT opens the addressed switch → Z held low', vz < 0.5, `Vz=${fmt(vz)}`);
}

// ── 4. Demux direction, high channel: drive Z, select channel 10 → Y10 ──────
// Exercises the D (MSB) address bit and a top-row channel. Y10 is left undriven
// with its own pull-down; Z is driven to 5V; DCBA = 1010 selects channel 10.
{
  console.log('\n4. Demux: drive Z = 5V, select channel 10 (DCBA=1010) → Y10 follows Z');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4067' },
      // 100k pull-down on Y10 (pin22 = col7 top)
      { id: 21, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:0', endHoleId: '0:0:power:7:0' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD (top c5)
      { id: 2, startHoleId: '0:0:power:16:2', endHoleId: '0:0:main:16:6' }, // VSS (bot c16)
      { id: 3, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:6'  }, // Z pin1 (bot c5) → 5V (driven common)
      { id: 4, startHoleId: '0:0:power:14:2', endHoleId: '0:0:main:14:6' }, // A = 0 (bot c14)
      { id: 5, startHoleId: '0:0:power:15:1', endHoleId: '0:0:main:15:6' }, // B = 1 (bot c15)
      { id: 6, startHoleId: '0:0:power:6:2',  endHoleId: '0:0:main:15:3' }, // C = 0 (top c15)
      { id: 7, startHoleId: '0:0:power:8:1',  endHoleId: '0:0:main:16:3' }, // D = 1 (top c16)
      { id: 8, startHoleId: '0:0:power:9:2',  endHoleId: '0:0:main:14:3' }, // INH = 0 (top c14)
    ],
  });
  h.evaluate();
  const vy10 = h.pinVoltage(20, 'Y10');
  check('Y10 follows the driven Z through the ON switch', vy10 > 4.5, `Vy10=${fmt(vy10)}`);
}

console.log(failures === 0 ? '\nAll CD4067 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
