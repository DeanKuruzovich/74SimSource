// ── CD4053 regression: triple 2-channel analog mux/demux (ANALOG_MUX_TRIPLE2) ─
// The CD4053 is three INDEPENDENT single-pole double-throw (SPDT) switches that
// share a package, supplies, and one common inhibit. Each section n has its own
// select input and its own common:
//   • select 0 → common couples to that section's "x" channel (Y0);
//   • select 1 → common couples to that section's "y" channel (Y1);
//   • INHIBIT HIGH opens every channel in all three sections.
// This scenario specifically proves the three selects act independently (the key
// difference from the 4051/4052, which share one address).
//
// Method (same as the CD4051/4052 scenarios): hard-drive each section's "x"
// channel (Y0A/Y0B/Y0C) to 5 V, hang a 100 kΩ pull-down on each common
// (ZA/ZB/ZC), and read the commons. A section whose select = 0 couples its
// common to the 5 V x-channel through the 125 Ω ON path → common ≈ 5 V; a
// section whose select = 1 couples to its undriven y-channel → the pull-down
// holds the common near 0 V; INHIBIT opens everything → commons near 0 V.
//
// CD4053 pinout verified from TI CD4051B/CD4052B/CD4053B datasheet (SCHS047O,
// Figure 4-3, read as a rendered PDF image). 16-pin chip at col 5. Top row
// (row 4) cols 5..12 = pins 16..9; bottom row (row 5) cols 5..12 = pins 1..8.
//   Top:    VDD16=c5 · ZB(15)=c6 · ZA(14)=c7 · Y1A/ay(13)=c8 · Y0A/ax(12)=c9 ·
//           A(11)=c10 · B(10)=c11 · C(9)=c12
//   Bottom: Y1B/by(1)=c5 · Y0B/bx(2)=c6 · Y1C/cy(3)=c7 · ZC(4)=c8 · Y0C/cx(5)=c9 ·
//           INH(6)=c10 · VEE(7)=c11 · VSS(8)=c12
//   Top pin wired via main:col:3 (resistor at main:col:0 — same node);
//   bottom pin via main:col:6 (resistor at main:col:7 — same node).
//
// Run:  node js/debug/scenarios/cd4053-analog-mux.mjs   (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// Drive Y0A (top c9), Y0B (bottom c6), Y0C (bottom c9) to 5 V; pull-downs on the
// three commons ZA (top c7), ZB (top c6), ZC (bottom c8). Selects A/B/C (top
// c10/c11/c12) and INH (bottom c10) set per call.
function build({ a, b, c, inh }) {
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4053' },
      // 100k pull-down on ZA (pin14 = top col7)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:0', endHoleId: '0:0:power:7:2' },
      // 100k pull-down on ZB (pin15 = top col6)
      { id: 12, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:6:0', endHoleId: '0:0:power:6:2' },
      // 100k pull-down on ZC (pin4 = bottom col8)
      { id: 13, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:7', endHoleId: '0:0:power:8:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD pin16 → VCC
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // VSS pin8  → GND
      { id: 3, startHoleId: '0:0:power:11:0', endHoleId: '0:0:main:11:6' }, // VEE pin7  → GND (unipolar)
      // driven "x" channels (5 V)
      { id: 4, startHoleId: '0:0:power:9:1',  endHoleId: '0:0:main:9:3'  }, // Y0A/ax pin12 (top c9) → 5V
      { id: 5, startHoleId: '0:0:power:6:1',  endHoleId: '0:0:main:6:6'  }, // Y0B/bx pin2  (bot c6) → 5V
      { id: 6, startHoleId: '0:0:power:9:3',  endHoleId: '0:0:main:9:6'  }, // Y0C/cx pin5  (bot c9) → 5V
      // independent select inputs (top pins)
      { id: 7, startHoleId: a ? '0:0:power:10:1' : '0:0:power:10:2', endHoleId: '0:0:main:10:3' }, // A pin11 (top c10)
      { id: 8, startHoleId: b ? '0:0:power:11:1' : '0:0:power:11:2', endHoleId: '0:0:main:11:3' }, // B pin10 (top c11)
      { id: 9, startHoleId: c ? '0:0:power:12:1' : '0:0:power:12:2', endHoleId: '0:0:main:12:3' }, // C pin9  (top c12)
      // inhibit (bottom c10)
      { id: 14, startHoleId: inh ? '0:0:power:10:3' : '0:0:power:10:0', endHoleId: '0:0:main:10:6' }, // INH pin6
    ],
  });
}

// ── 1. All selects = 0 → every section couples to its x-channel; all commons 5V
{
  console.log('\n1. CD4053 A,B,C = 0,0,0 → each section selects its x-channel; ZA/ZB/ZC ≈ 5V');
  const h = build({ a: 0, b: 0, c: 0, inh: 0 });
  h.evaluate();
  const va = h.pinVoltage(10, 'ZA'), vb = h.pinVoltage(10, 'ZB'), vc = h.pinVoltage(10, 'ZC');
  check('section A: ZA couples to driven Y0A', va > 4.5, `Vza=${fmt(va)}`);
  check('section B: ZB couples to driven Y0B', vb > 4.5, `Vzb=${fmt(vb)}`);
  check('section C: ZC couples to driven Y0C', vc > 4.5, `Vzc=${fmt(vc)}`);
}

// ── 2. Independence: A=0, B=1, C=0 → only section B flips to its (undriven) y ──
{
  console.log('\n2. A,B,C = 0,1,0 → B selects its y-channel (undriven); A & C unchanged');
  const h = build({ a: 0, b: 1, c: 0, inh: 0 });
  h.evaluate();
  const va = h.pinVoltage(10, 'ZA'), vb = h.pinVoltage(10, 'ZB'), vc = h.pinVoltage(10, 'ZC');
  check('section A still couples to its x-channel → ZA ≈ 5V', va > 4.5, `Vza=${fmt(va)}`);
  check('section B isolated from Y0B → ZB pull-down wins ≈ 0V', vb < 0.5, `Vzb=${fmt(vb)}`);
  check('section C still couples to its x-channel → ZC ≈ 5V', vc > 4.5, `Vzc=${fmt(vc)}`);
}

// ── 3. Independence the other way: A=1, B=0, C=1 ─────────────────────────────
{
  console.log('\n3. A,B,C = 1,0,1 → A & C select their (undriven) y-channels; B unchanged');
  const h = build({ a: 1, b: 0, c: 1, inh: 0 });
  h.evaluate();
  const va = h.pinVoltage(10, 'ZA'), vb = h.pinVoltage(10, 'ZB'), vc = h.pinVoltage(10, 'ZC');
  check('section A isolated from Y0A → ZA ≈ 0V', va < 0.5, `Vza=${fmt(va)}`);
  check('section B couples to its x-channel → ZB ≈ 5V', vb > 4.5, `Vzb=${fmt(vb)}`);
  check('section C isolated from Y0C → ZC ≈ 0V', vc < 0.5, `Vzc=${fmt(vc)}`);
}

// ── 4. INHIBIT HIGH while all selects point at x → all sections open ─────────
{
  console.log('\n4. A,B,C = 0,0,0 but INH = HIGH → all three sections open, commons ≈ 0V');
  const h = build({ a: 0, b: 0, c: 0, inh: 1 });
  h.evaluate();
  const va = h.pinVoltage(10, 'ZA'), vb = h.pinVoltage(10, 'ZB'), vc = h.pinVoltage(10, 'ZC');
  check('INHIBIT opens section A → ZA ≈ 0V', va < 0.5, `Vza=${fmt(va)}`);
  check('INHIBIT opens section B → ZB ≈ 0V', vb < 0.5, `Vzb=${fmt(vb)}`);
  check('INHIBIT opens section C → ZC ≈ 0V', vc < 0.5, `Vzc=${fmt(vc)}`);
}

// ── 5. Demux direction: drive common ZA = 5V, select A = 1 → Y1A (ay) follows ─
// Same bidirectional switch run backwards: drive the common, read the addressed
// channel. Y1A (ay, pin13 = top c8) has its own pull-down and should follow ZA.
{
  console.log('\n5. Demux: drive ZA = 5V, select A = 1 → Y1A (ay) follows ZA');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4053' },
      // 100k pull-down on Y1A (pin13 = top col8)
      { id: 21, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:0', endHoleId: '0:0:power:8:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // VSS
      { id: 3, startHoleId: '0:0:power:11:0', endHoleId: '0:0:main:11:6' }, // VEE → GND
      { id: 4, startHoleId: '0:0:power:7:3',  endHoleId: '0:0:main:7:3'  }, // ZA pin14 (top c7) → 5V (driven common)
      { id: 5, startHoleId: '0:0:power:10:1', endHoleId: '0:0:main:10:3' }, // A = 1
      { id: 6, startHoleId: '0:0:power:11:2', endHoleId: '0:0:main:11:3' }, // B = 0
      { id: 7, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:3' }, // C = 0
      { id: 8, startHoleId: '0:0:power:10:0', endHoleId: '0:0:main:10:6' }, // INH = 0
    ],
  });
  h.evaluate();
  const vy1a = h.pinVoltage(20, 'Y1A');
  check('Y1A follows the driven ZA through the ON switch', vy1a > 4.5, `Vy1a=${fmt(vy1a)}`);
}

console.log(failures === 0 ? '\nAll CD4053 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
