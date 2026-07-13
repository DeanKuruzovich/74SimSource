// ── 74x4851 regression: 8-channel analog mux/demux (ANALOG_MUX_8, COM common) ─
// The SN74HC4851 is terminal-compatible with the '4051 but names its common
// node COM (not Z) and has NC where the 4051 has VEE. This exercises the real
// bidirectional behavior through the COM node:
//   • the channel addressed by C,B,A is resistively coupled to COM;
//   • unaddressed channels are open (COM follows only its own pull-down);
//   • INHIBIT HIGH opens every channel regardless of the address;
//   • the switch is bidirectional (demux: drive COM, read the addressed Y).
//
// Source for behavior/pinout: TI SCLS542C, Table 4-1 Function Table + Fig 4-1.
//
// Method mirrors cd4051-analog-mux.mjs: drive one channel hard to 5 V, hang a
// 100 kΩ pull-down on COM, and read COM. When that channel is selected the
// ~100 Ω ON path dominates and COM ≈ 5 V; otherwise the pull-down holds it low.
//
// 16-pin chip at col 5. Top row (row 4) cols 5..12 = pins 16..9; bottom row
// (row 5) cols 5..12 = pins 1..8.  74x4851 pin → (col, half):
//   VCC16=c5 top · Y2=c6 top · Y1=c7 top · Y0=c8 top · Y3=c9 top ·
//   A=c10 top · B=c11 top · C=c12 top
//   Y4=c5 bot · Y6=c6 bot · COM=c7 bot · Y7=c8 bot · Y5=c9 bot ·
//   INH=c10 bot · NC=c11 bot · GND=c12 bot
//
// Run:  node js/debug/scenarios/74x4851-analog-mux.mjs   (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// Build a 74x4851 with VCC/GND powered (pin 7 NC left open), INH = inhibit
// level, address bits {a,b,c}, channel Y3 (sel=3) hard-driven to 5 V, and a
// 100k pull-down on COM so isolation reads as ~0 V.
function build({ a, b, c, inh }) {
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: '74x4851' },
      // 100k pull-down on COM (pin 3 = col7 bottom)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:7', endHoleId: '0:0:power:7:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VCC pin16 → VCC
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // GND pin8  → GND
      { id: 4, startHoleId: '0:0:power:9:3',  endHoleId: '0:0:main:9:3'  }, // Y3 pin12  → 5V (driven channel)
      // address bits
      { id: 5, startHoleId: a ? '0:0:power:10:1' : '0:0:power:10:2', endHoleId: '0:0:main:10:3' }, // A pin11
      { id: 6, startHoleId: b ? '0:0:power:11:1' : '0:0:power:11:2', endHoleId: '0:0:main:11:3' }, // B pin10
      { id: 7, startHoleId: c ? '0:0:power:12:1' : '0:0:power:12:2', endHoleId: '0:0:main:12:3' }, // C pin9
      // inhibit
      { id: 8, startHoleId: inh ? '0:0:power:10:3' : '0:0:power:10:0', endHoleId: '0:0:main:10:6' }, // INH pin6
    ],
  });
}

// ── 1. Select channel 3 (CBA = 011) → COM couples to the 5V-driven Y3 ────────
{
  console.log('\n1. 74x4851 address C,B,A = 0,1,1 → channel 3 selected, COM ≈ 5V');
  const h = build({ a: 1, b: 1, c: 0, inh: 0 });
  h.evaluate();
  const v = h.pinVoltage(10, 'COM');
  check('COM pulled up to the driven channel through the ON switch', v > 4.5, `Vcom=${fmt(v)}`);
}

// ── 2. Select channel 0 (CBA = 000) → Y3 isolated, COM held low by pull-down ─
{
  console.log('\n2. Address C,B,A = 0,0,0 → channel 0 selected, Y3 isolated, COM ≈ 0V');
  const h = build({ a: 0, b: 0, c: 0, inh: 0 });
  h.evaluate();
  const v = h.pinVoltage(10, 'COM');
  check('COM isolated from Y3 → pull-down wins', v < 0.5, `Vcom=${fmt(v)}`);
}

// ── 3. INHIBIT HIGH while addressing channel 3 → all channels open ───────────
{
  console.log('\n3. Address points at channel 3 but INH = HIGH → all switches open, COM ≈ 0V');
  const h = build({ a: 1, b: 1, c: 0, inh: 1 });
  h.evaluate();
  const v = h.pinVoltage(10, 'COM');
  check('INHIBIT opens the addressed switch → COM held low', v < 0.5, `Vcom=${fmt(v)}`);
}

// ── 4. Demux direction: drive COM, read the addressed channel ────────────────
// Same bidirectional switch; Y3 is left undriven with its own pull-down, COM is
// driven to 5V, channel 3 is selected → Y3 should follow COM.
{
  console.log('\n4. Demux: drive COM = 5V, select channel 3 → Y3 follows COM');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: '74x4851' },
      // 100k pull-down on Y3 (pin12 = col9 top)
      { id: 21, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:9:0', endHoleId: '0:0:power:9:0' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VCC
      { id: 2, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // GND
      { id: 4, startHoleId: '0:0:power:7:3',  endHoleId: '0:0:main:7:6'  }, // COM pin3 → 5V (driven common)
      { id: 5, startHoleId: '0:0:power:10:1', endHoleId: '0:0:main:10:3' }, // A = 1
      { id: 6, startHoleId: '0:0:power:11:1', endHoleId: '0:0:main:11:3' }, // B = 1
      { id: 7, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:3' }, // C = 0
      { id: 8, startHoleId: '0:0:power:10:0', endHoleId: '0:0:main:10:6' }, // INH = 0
    ],
  });
  h.evaluate();
  const vy3 = h.pinVoltage(20, 'Y3');
  check('Y3 follows the driven COM through the ON switch', vy3 > 4.5, `Vy3=${fmt(vy3)}`);
}

console.log(failures === 0 ? '\nAll 74x4851 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
