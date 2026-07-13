// ── CD4097 regression: differential 8-channel analog mux/demux (ANALOG_MUX_DUAL8)
// Verifies the two independent 8-channel banks switch TOGETHER off one shared
// 3-bit address, on the 24-pin part:
//   • select code n = (C<<2)|(B<<1)|A couples XZ↔Xn AND YZ↔Yn at the same time;
//   • an unaddressed channel is open (its common follows only its pull-down);
//   • INHIBIT HIGH opens every channel in both sections;
//   • the switch is bidirectional (drive a common, the addressed channel follows),
//     and the MSB (C) is exercised by selecting channel 5.
//
// Method mirrors the CD4052 / CD4067 scenarios: hard-drive a channel to 5 V,
// hang a 100 kΩ pull-down on the matching common, and read the common. When the
// channel is selected the 125 Ω ON path dominates the pull-down and the common
// ≈ 5 V; when isolated the pull-down holds it near 0 V.
//
// CD4097 pinout verified from TI CD4067B/CD4097B datasheet (SCHS052D), CD4097
// logic diagram (page 2) + Table 4-2 truth table (page 4), read as 400-dpi PDF
// page images. 24-pin chip at col 5:
//   Bottom row (row 5) cols 5..16 = pins 1..12; top row (row 4) cols 5..16 = pins 24..13.
//   bottom:  XZ(1)=c5 · X7(2)=c6 · X6(3)=c7 · X5(4)=c8 · X4(5)=c9 · X3(6)=c10 ·
//            X2(7)=c11 · X1(8)=c12 · X0(9)=c13 · A(10)=c14 · B(11)=c15 · VSS(12)=c16
//   top:     VDD(24)=c5 · Y0(23)=c6 · Y1(22)=c7 · Y2(21)=c8 · Y3(20)=c9 · Y4(19)=c10 ·
//            Y5(18)=c11 · YZ(17)=c12 · Y6(16)=c13 · Y7(15)=c14 · C(14)=c15 · INH(13)=c16
//   (NOTE: real CD4097B has no VEE pin — signal path is VDD..VSS referenced.)
// Wire a top pin via main:col:3 (resistor tap main:col:0 — same node);
// wire a bottom pin via main:col:6 (resistor tap main:col:7 — same node).
//
// Run:  node js/debug/scenarios/cd4097-analog-mux.mjs   (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// Build a CD4097 with VDD/VSS powered, INH = inhibit level, address bits A,B,C
// driven, channel X0 (bot c13) and Y0 (top c6) hard-driven to 5 V, and a 100k
// pull-down on each common (XZ bot c5, YZ top c12).
function build({ a, b, c, inh }) {
  const railHi = col => `0:0:power:${col}:1`;
  const railLo = col => `0:0:power:${col}:2`;
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4097' },
      // 100k pull-down on XZ (pin1 = c5 bottom)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:5:7', endHoleId: '0:0:power:5:0' },
      // 100k pull-down on YZ (pin17 = c12 top)
      { id: 12, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:12:0', endHoleId: '0:0:power:12:0' },
    ],
    wires: [
      { id: 1, startHoleId: railHi(5),  endHoleId: '0:0:main:5:3'  }, // VDD pin24 (top c5) → 5V
      { id: 2, startHoleId: railLo(16), endHoleId: '0:0:main:16:6' }, // VSS pin12 (bot c16) → GND
      { id: 3, startHoleId: railHi(13), endHoleId: '0:0:main:13:6' }, // X0 pin9 (bot c13) → 5V (driven X channel)
      { id: 4, startHoleId: railHi(6),  endHoleId: '0:0:main:6:3'  }, // Y0 pin23 (top c6) → 5V (driven Y channel)
      // address bits: A pin10 (bot c14), B pin11 (bot c15), C pin14 (top c15)
      { id: 5, startHoleId: a ? railHi(14) : railLo(14), endHoleId: '0:0:main:14:6' }, // A
      { id: 6, startHoleId: b ? railHi(15) : railLo(15), endHoleId: '0:0:main:15:6' }, // B
      { id: 7, startHoleId: c ? railHi(7)  : railLo(7),  endHoleId: '0:0:main:15:3' }, // C pin14 (top c15)
      // inhibit pin13 (top c16)
      { id: 8, startHoleId: inh ? railHi(8) : railLo(8), endHoleId: '0:0:main:16:3' }, // INH
    ],
  });
}

// ── 1. Select channel 0 (C,B,A = 0,0,0) → both sections couple to channel 0 ──
{
  console.log('\n1. CD4097 C,B,A = 0,0,0 → channel 0 selected; XZ≈5V (from X0) and YZ≈5V (from Y0)');
  const h = build({ a: 0, b: 0, c: 0, inh: 0 });
  h.evaluate();
  const vxz = h.pinVoltage(10, 'XZ');
  const vyz = h.pinVoltage(10, 'YZ');
  check('XZ couples to driven X0 through ON switch', vxz > 4.5, `Vxz=${fmt(vxz)}`);
  check('YZ couples to driven Y0 through ON switch (same address)', vyz > 4.5, `Vyz=${fmt(vyz)}`);
}

// ── 2. Select channel 1 (C,B,A = 0,0,1) → channel 0 isolated in BOTH sections ─
{
  console.log('\n2. C,B,A = 0,0,1 → channel 1 selected; X0/Y0 isolated, both commons ≈ 0V');
  const h = build({ a: 1, b: 0, c: 0, inh: 0 });
  h.evaluate();
  const vxz = h.pinVoltage(10, 'XZ');
  const vyz = h.pinVoltage(10, 'YZ');
  check('XZ isolated from X0 → pull-down wins', vxz < 0.5, `Vxz=${fmt(vxz)}`);
  check('YZ isolated from Y0 → pull-down wins', vyz < 0.5, `Vyz=${fmt(vyz)}`);
}

// ── 3. INHIBIT HIGH while addressing channel 0 → all switches open ───────────
{
  console.log('\n3. C,B,A point at channel 0 but INH = HIGH → all switches open, commons ≈ 0V');
  const h = build({ a: 0, b: 0, c: 0, inh: 1 });
  h.evaluate();
  const vxz = h.pinVoltage(10, 'XZ');
  const vyz = h.pinVoltage(10, 'YZ');
  check('INHIBIT opens X section → XZ held low', vxz < 0.5, `Vxz=${fmt(vxz)}`);
  check('INHIBIT opens Y section → YZ held low', vyz < 0.5, `Vyz=${fmt(vyz)}`);
}

// ── 4. Demux + MSB: drive commons, select channel 5 (C,B,A=1,0,1) → X5/Y5 ────
// Exercises the C (MSB) address bit and the bidirectional direction: drive XZ
// and YZ to 5 V, leave X5/Y5 with their own pull-downs, select channel 5.
{
  console.log('\n4. Demux: drive XZ=YZ=5V, select channel 5 (C,B,A=1,0,1) → X5 & Y5 follow');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4097' },
      // 100k pull-down on X5 (pin4 = c8 bottom)
      { id: 21, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:7', endHoleId: '0:0:power:8:0' },
      // 100k pull-down on Y5 (pin18 = c11 top)
      { id: 22, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:11:0', endHoleId: '0:0:power:11:0' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD (top c5)
      { id: 2, startHoleId: '0:0:power:16:2', endHoleId: '0:0:main:16:6' }, // VSS (bot c16)
      { id: 3, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:6'  }, // XZ pin1 (bot c5) → 5V (driven common)
      { id: 4, startHoleId: '0:0:power:7:1',  endHoleId: '0:0:main:12:3' }, // YZ pin17 (top c12) → 5V (driven common)
      { id: 5, startHoleId: '0:0:power:14:1', endHoleId: '0:0:main:14:6' }, // A = 1 (bot c14)
      { id: 6, startHoleId: '0:0:power:15:2', endHoleId: '0:0:main:15:6' }, // B = 0 (bot c15)
      { id: 7, startHoleId: '0:0:power:9:1',  endHoleId: '0:0:main:15:3' }, // C = 1 (top c15)
      { id: 8, startHoleId: '0:0:power:10:2', endHoleId: '0:0:main:16:3' }, // INH = 0 (top c16)
    ],
  });
  h.evaluate();
  const vx5 = h.pinVoltage(20, 'X5');
  const vy5 = h.pinVoltage(20, 'Y5');
  check('X5 follows the driven XZ through the ON switch', vx5 > 4.5, `Vx5=${fmt(vx5)}`);
  check('Y5 follows the driven YZ through the ON switch (same MSB address)', vy5 > 4.5, `Vy5=${fmt(vy5)}`);
}

console.log(failures === 0 ? '\nAll CD4097 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
