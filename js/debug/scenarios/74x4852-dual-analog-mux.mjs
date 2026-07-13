// ── 74x4852 regression: dual 4-channel analog mux/demux (ANALOG_MUX_DUAL4_4852) ─
// Verifies the two sections switch together off one shared address:
//   • select code n = (B<<1)|A couples 1Z↔1Y(n) AND 2Z↔2Y(n) at the same time;
//   • an unaddressed channel is open (its common follows only its pull-down);
//   • INHIBIT HIGH opens every channel in both sections.
//
// Method (same as the CD4052 scenario): hard-drive channel 1Y0 and 2Y0 to 5 V,
// hang a 100 kΩ pull-down on each common node, and read the commons. When
// channel 0 is selected the 125 Ω ON path dominates the pull-down and the
// common ≈ 5 V; when isolated the pull-down holds it near 0 V.
//
// Pinout verified from TI SN74HC4852 datasheet (SCLS573A, Figure 4-1, 16-pin
// TSSOP top view) and function table (Table 4-1), read as PDF page images.
// 16-pin chip at col 5. Top row (row 4) cols 5..12 = pins 16..9; bottom row
// (row 5) cols 5..12 = pins 1..8.  Pin → (col, half):
//   VCC(16)=c5 top · 1Y2(15)=c6 top · 1Y1(14)=c7 top · 1Z(13)=c8 top ·
//   1Y0(12)=c9 top · 1Y3(11)=c10 top · A(10)=c11 top · B(9)=c12 top
//   2Y0(1)=c5 bot · 2Y2(2)=c6 bot · 2Z(3)=c7 bot · 2Y3(4)=c8 bot · 2Y1(5)=c9 bot ·
//   INH(6)=c10 bot · NC(7)=c11 bot · GND(8)=c12 bot
//   Top pin wired via main:col:3 (resistor at main:col:0 — same node);
//   bottom pin via main:col:6 (resistor at main:col:7 — same node).
//
// Run:  node js/debug/scenarios/74x4852-dual-analog-mux.mjs  (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// Build a 74x4852 with VCC/GND powered, INH = inhibit level, address bits A,B
// driven, 1Y0 (top c9) and 2Y0 (bottom c5) hard-driven to 5 V, and a 100k
// pull-down on each common (1Z top c8, 2Z bottom c7).
function build({ a, b, inh }) {
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: '74x4852' },
      // 100k pull-down on 1Z (pin13 = top col8)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:0', endHoleId: '0:0:power:8:2' },
      // 100k pull-down on 2Z (pin3 = bottom col7)
      { id: 12, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:7', endHoleId: '0:0:power:7:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VCC pin16 → 5V
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // GND pin8  → GND
      { id: 4, startHoleId: '0:0:power:9:3',  endHoleId: '0:0:main:9:3'  }, // 1Y0 pin12 → 5V (driven section-1 channel)
      { id: 5, startHoleId: '0:0:power:5:3',  endHoleId: '0:0:main:5:6'  }, // 2Y0 pin1  → 5V (driven section-2 channel)
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
  console.log('\n1. 74x4852 B,A = 0,0 → channel 0 selected; 1Z≈5V (from 1Y0) and 2Z≈5V (from 2Y0)');
  const h = build({ a: 0, b: 0, inh: 0 });
  h.evaluate();
  const v1z = h.pinVoltage(10, '1Z');
  const v2z = h.pinVoltage(10, '2Z');
  check('1Z couples to driven 1Y0 through ON switch', v1z > 4.5, `V1z=${fmt(v1z)}`);
  check('2Z couples to driven 2Y0 through ON switch (same address)', v2z > 4.5, `V2z=${fmt(v2z)}`);
}

// ── 2. Select channel 1 (B,A = 0,1) → channel 0 isolated in BOTH sections ────
{
  console.log('\n2. B,A = 0,1 → channel 1 selected; 1Y0/2Y0 isolated, both commons ≈ 0V');
  const h = build({ a: 1, b: 0, inh: 0 });
  h.evaluate();
  const v1z = h.pinVoltage(10, '1Z');
  const v2z = h.pinVoltage(10, '2Z');
  check('1Z isolated from 1Y0 → pull-down wins', v1z < 0.5, `V1z=${fmt(v1z)}`);
  check('2Z isolated from 2Y0 → pull-down wins', v2z < 0.5, `V2z=${fmt(v2z)}`);
}

// ── 3. INHIBIT HIGH while addressing channel 0 → all switches open ───────────
{
  console.log('\n3. B,A point at channel 0 but INH = HIGH → all switches open, commons ≈ 0V');
  const h = build({ a: 0, b: 0, inh: 1 });
  h.evaluate();
  const v1z = h.pinVoltage(10, '1Z');
  const v2z = h.pinVoltage(10, '2Z');
  check('INHIBIT opens section 1 → 1Z held low', v1z < 0.5, `V1z=${fmt(v1z)}`);
  check('INHIBIT opens section 2 → 2Z held low', v2z < 0.5, `V2z=${fmt(v2z)}`);
}

console.log(failures === 0 ? '\nAll 74x4852 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
