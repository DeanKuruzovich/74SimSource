// ── CD4051 regression: 8-channel analog mux/demux (ANALOG_MUX_8) ────────────
// Verifies the bidirectional transmission-gate behavior:
//   • the channel addressed by C,B,A is resistively coupled to the common Z;
//   • unaddressed channels are open (Z follows only its own pull-down);
//   • INHIBIT HIGH opens every channel regardless of the address.
//
// Method: drive one channel hard to 5 V, hang a large (100 kΩ) pull-down on Z,
// and read Z. When that channel is selected, the 125 Ω ON path dominates the
// 100 kΩ pull-down and Z ≈ 5 V. When it is not selected (or INH is HIGH), Z is
// isolated and the pull-down holds it near 0 V.
//
// Run:  node js/debug/scenarios/cd4051-analog-mux.mjs   (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// 16-pin chip at col 5. Top row (row 4) cols 5..12 = pins 16..9; bottom row
// (row 5) cols 5..12 = pins 1..8.  Pin → (col, half):
//   VDD16=c5 top · Y2=c6 top · Y1=c7 top · Y0=c8 top · Y3=c9 top ·
//   A=c10 top · B=c11 top · C=c12 top
//   Y4=c5 bot · Y6=c6 bot · Z=c7 bot · Y7=c8 bot · Y5=c9 bot ·
//   INH=c10 bot · VEE=c11 bot · VSS=c12 bot
// Wire a top pin via main:col:3, a bottom pin via main:col:6.

// Build a CD4051 with VDD/VSS/VEE powered, INH = inhibit level, address bits
// driven to {a,b,c}, channel Y3 (sel=3) hard-driven to 5 V, and a 100k
// pull-down hanging on Z so isolation reads as ~0 V.
function build({ a, b, c, inh }) {
  const lvl = bit => (bit ? 1 : 0);    // 1 → VCC rail (power:col:1), 0 → GND rail (power:col:0/2)
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4051' },
      // 100k pull-down on Z (pin 3 = col7 bottom)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:7', endHoleId: '0:0:power:7:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD pin16 → VCC
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // VSS pin8  → GND
      { id: 3, startHoleId: '0:0:power:11:0', endHoleId: '0:0:main:11:6' }, // VEE pin7  → GND (unipolar)
      { id: 4, startHoleId: '0:0:power:9:3',  endHoleId: '0:0:main:9:3'  }, // Y3 pin12  → 5V (driven channel)
      // address bits
      { id: 5, startHoleId: lvl(a) ? '0:0:power:10:1' : '0:0:power:10:2', endHoleId: '0:0:main:10:3' }, // A pin11
      { id: 6, startHoleId: lvl(b) ? '0:0:power:11:1' : '0:0:power:11:2', endHoleId: '0:0:main:11:3' }, // B pin10
      { id: 7, startHoleId: lvl(c) ? '0:0:power:12:1' : '0:0:power:12:2', endHoleId: '0:0:main:12:3' }, // C pin9
      // inhibit
      { id: 8, startHoleId: inh ? '0:0:power:10:3' : '0:0:power:10:0', endHoleId: '0:0:main:10:6' },     // INH pin6
    ],
  });
}

// ── 1. Select channel 3 (CBA = 011) → Z couples to the 5V-driven Y3 ─────────
{
  console.log('\n1. CD4051 address C,B,A = 0,1,1 → channel 3 selected, Z ≈ 5V');
  const h = build({ a: 1, b: 1, c: 0, inh: 0 });
  h.evaluate();
  const vz = h.pinVoltage(10, 'Z');
  check('Z pulled up to the driven channel through the ON switch', vz > 4.5, `Vz=${fmt(vz)}`);
}

// ── 2. Select channel 0 (CBA = 000) → Y3 isolated, Z held low by pull-down ──
{
  console.log('\n2. Address C,B,A = 0,0,0 → channel 0 selected, Y3 isolated, Z ≈ 0V');
  const h = build({ a: 0, b: 0, c: 0, inh: 0 });
  h.evaluate();
  const vz = h.pinVoltage(10, 'Z');
  check('Z isolated from Y3 → pull-down wins', vz < 0.5, `Vz=${fmt(vz)}`);
}

// ── 3. INHIBIT HIGH while addressing channel 3 → all channels open ──────────
{
  console.log('\n3. Address points at channel 3 but INH = HIGH → all switches open, Z ≈ 0V');
  const h = build({ a: 1, b: 1, c: 0, inh: 1 });
  h.evaluate();
  const vz = h.pinVoltage(10, 'Z');
  check('INHIBIT opens the addressed switch → Z held low', vz < 0.5, `Vz=${fmt(vz)}`);
}

// ── 4. Demux direction: drive Z, read the addressed channel ─────────────────
// Same bidirectional switch; here Y3 is left undriven with its own pull-down,
// Z is driven to 5V, channel 3 is selected → Y3 should follow Z.
{
  console.log('\n4. Demux: drive Z = 5V, select channel 3 → Y3 follows Z');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4051' },
      // 100k pull-down on Y3 (pin12 = col9 top)
      { id: 21, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:9:0', endHoleId: '0:0:power:9:0' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // VSS
      { id: 3, startHoleId: '0:0:power:11:0', endHoleId: '0:0:main:11:6' }, // VEE → GND
      { id: 4, startHoleId: '0:0:power:7:3',  endHoleId: '0:0:main:7:6'  }, // Z pin3 → 5V (driven common)
      { id: 5, startHoleId: '0:0:power:10:1', endHoleId: '0:0:main:10:3' }, // A = 1
      { id: 6, startHoleId: '0:0:power:11:1', endHoleId: '0:0:main:11:3' }, // B = 1
      { id: 7, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:3' }, // C = 0
      { id: 8, startHoleId: '0:0:power:10:0', endHoleId: '0:0:main:10:6' }, // INH = 0
    ],
  });
  h.evaluate();
  const vy3 = h.pinVoltage(20, 'Y3');
  check('Y3 follows the driven Z through the ON switch', vy3 > 4.5, `Vy3=${fmt(vy3)}`);
}

console.log(failures === 0 ? '\nAll CD4051 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
