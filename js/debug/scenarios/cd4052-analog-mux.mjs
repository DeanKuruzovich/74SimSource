// ── CD4052 regression: dual 4-channel analog mux/demux (ANALOG_MUX_DUAL4) ────
// Verifies the two sections switch together off one shared address:
//   • select code n = (B<<1)|A couples XZ↔Xn AND YZ↔Yn at the same time;
//   • an unaddressed channel is open (its common follows only its pull-down);
//   • INHIBIT HIGH opens every channel in both sections.
//
// Method (same as the CD4051 scenario): hard-drive channel X0 and Y0 to 5 V,
// hang a 100 kΩ pull-down on each common node, and read the commons. When
// channel 0 is selected the 125 Ω ON path dominates the pull-down and the
// common ≈ 5 V; when isolated the pull-down holds it near 0 V.
//
// CD4052 pinout verified from TI CD4052B datasheet (SCHS047O, Figure 4-2):
//   16-pin chip at col 5. Top row (row 4) cols 5..12 = pins 16..9; bottom row
//   (row 5) cols 5..12 = pins 1..8.  Pin → (col, half):
//   VDD16=c5 top · X0(15)=c6 top · X2(14)=c7 top · XZ(13)=c8 top · X3(12)=c9 top ·
//   X1(11)=c10 top · A(10)=c11 top · B(9)=c12 top
//   Y0(1)=c5 bot · Y2(2)=c6 bot · YZ(3)=c7 bot · Y3(4)=c8 bot · Y1(5)=c9 bot ·
//   INH(6)=c10 bot · VEE(7)=c11 bot · VSS(8)=c12 bot
//   Top pin wired via main:col:3 (resistor at main:col:0 — same node);
//   bottom pin via main:col:6 (resistor at main:col:7 — same node).
//
// Run:  node js/debug/scenarios/cd4052-analog-mux.mjs   (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// Build a CD4052 with VDD/VSS/VEE powered, INH = inhibit level, address bits
// A,B driven, X0 (top c6) and Y0 (bottom c5) hard-driven to 5 V, and a 100k
// pull-down on each common (XZ top c8, YZ bottom c7).
function build({ a, b, inh }) {
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4052' },
      // 100k pull-down on XZ (pin13 = top col8)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:0', endHoleId: '0:0:power:8:2' },
      // 100k pull-down on YZ (pin3 = bottom col7)
      { id: 12, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:7', endHoleId: '0:0:power:7:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD pin16 → VCC
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // VSS pin8  → GND
      { id: 3, startHoleId: '0:0:power:11:0', endHoleId: '0:0:main:11:6' }, // VEE pin7  → GND (unipolar)
      { id: 4, startHoleId: '0:0:power:6:3',  endHoleId: '0:0:main:6:3'  }, // X0 pin15  → 5V (driven X channel)
      { id: 5, startHoleId: '0:0:power:5:3',  endHoleId: '0:0:main:5:6'  }, // Y0 pin1   → 5V (driven Y channel)
      // address bits
      { id: 6, startHoleId: a ? '0:0:power:11:1' : '0:0:power:11:2', endHoleId: '0:0:main:11:3' }, // A pin10 (top c11)
      { id: 7, startHoleId: b ? '0:0:power:12:1' : '0:0:power:12:2', endHoleId: '0:0:main:12:3' }, // B pin9  (top c12)
      // inhibit (bottom c10)
      { id: 8, startHoleId: inh ? '0:0:power:10:3' : '0:0:power:10:0', endHoleId: '0:0:main:10:6' }, // INH pin6
    ],
  });
}

// ── 1. Select channel 0 (B,A = 0,0) → both sections couple to channel 0 ──────
{
  console.log('\n1. CD4052 B,A = 0,0 → channel 0 selected; XZ≈5V (from X0) and YZ≈5V (from Y0)');
  const h = build({ a: 0, b: 0, inh: 0 });
  h.evaluate();
  const vxz = h.pinVoltage(10, 'XZ');
  const vyz = h.pinVoltage(10, 'YZ');
  check('XZ couples to driven X0 through ON switch', vxz > 4.5, `Vxz=${fmt(vxz)}`);
  check('YZ couples to driven Y0 through ON switch (same address)', vyz > 4.5, `Vyz=${fmt(vyz)}`);
}

// ── 2. Select channel 1 (B,A = 0,1) → channel 0 isolated in BOTH sections ────
{
  console.log('\n2. B,A = 0,1 → channel 1 selected; X0/Y0 isolated, both commons ≈ 0V');
  const h = build({ a: 1, b: 0, inh: 0 });
  h.evaluate();
  const vxz = h.pinVoltage(10, 'XZ');
  const vyz = h.pinVoltage(10, 'YZ');
  check('XZ isolated from X0 → pull-down wins', vxz < 0.5, `Vxz=${fmt(vxz)}`);
  check('YZ isolated from Y0 → pull-down wins', vyz < 0.5, `Vyz=${fmt(vyz)}`);
}

// ── 3. INHIBIT HIGH while addressing channel 0 → all switches open ───────────
{
  console.log('\n3. B,A point at channel 0 but INH = HIGH → all switches open, commons ≈ 0V');
  const h = build({ a: 0, b: 0, inh: 1 });
  h.evaluate();
  const vxz = h.pinVoltage(10, 'XZ');
  const vyz = h.pinVoltage(10, 'YZ');
  check('INHIBIT opens X section → XZ held low', vxz < 0.5, `Vxz=${fmt(vxz)}`);
  check('INHIBIT opens Y section → YZ held low', vyz < 0.5, `Vyz=${fmt(vyz)}`);
}

console.log(failures === 0 ? '\nAll CD4052 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
