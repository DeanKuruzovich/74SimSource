// ── CD4066 regression: quad bilateral switch (BILATERAL_SWITCH) ─────────────
// Verifies the bidirectional transmission-gate behavior of each independently
// controlled switch:
//   • control HIGH → the two signal terminals are resistively coupled (~125 Ω);
//   • control LOW  → the terminals are isolated (Hi-Z);
//   • the switch is bidirectional (drive either terminal, the other follows);
//   • each switch is independent (closing A does not close B).
//
// Method: drive one terminal hard to 5 V, hang a large (100 kΩ) pull-down on the
// other terminal, and read it. With the switch closed the 125 Ω ON path
// dominates the 100 kΩ pull-down (terminal ≈ 5 V); open, the pull-down wins (≈0).
//
// 14-pin chip at col 5, row 4. half = 7 →
//   Top row (row 4),  cols 5..11 = pins 14,13,12,11,10,9,8
//     c5=VDD(14) c6=CTLA(13) c7=CTLD(12) c8=XD(11) c9=YD(10) c10=YC(9) c11=XC(8)
//   Bottom row (row 5), cols 5..11 = pins 1,2,3,4,5,6,7
//     c5=XA(1) c6=YA(2) c7=YB(3) c8=XB(4) c9=CTLB(5) c10=CTLC(6) c11=VSS(7)
// Wire a top pin via main:col:3 (top strip), a bottom pin via main:col:6 (bottom
// strip); hang resistors on a top pin via main:col:0, a bottom pin via main:col:7.
// Power rail sub-holes: 1 & 3 = +5 V, 0 & 2 = GND.
//
// Run:  node js/debug/scenarios/cd4066-bilateral-switch.mjs  (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// Switch A: drive XA (pin1, bottom c5) to 5 V, 100 kΩ pull-down on YA
// (pin2, bottom c6), CTLA (pin13, top c6) set by the test.
function buildA({ ctlA }) {
  return CircuitHarness.fromJSON({
    components: [
      { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4066' },
      // 100k pull-down on YA (pin2 = bottom strip col6)
      { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:6:7', endHoleId: '0:0:power:6:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD pin14 → +5V
      { id: 2, startHoleId: '0:0:power:11:2', endHoleId: '0:0:main:11:6' }, // VSS pin7  → GND
      { id: 3, startHoleId: '0:0:power:5:3',  endHoleId: '0:0:main:5:6'  }, // XA pin1   → 5V (driven terminal)
      { id: 4, startHoleId: ctlA ? '0:0:power:6:3' : '0:0:power:6:0', endHoleId: '0:0:main:6:3' }, // CTLA pin13
    ],
  });
}

// ── 1. CTLA HIGH → switch A closed, YA follows the 5 V on XA ─────────────────
{
  console.log('\n1. CTLA = HIGH → switch A closed, YA ≈ 5V');
  const h = buildA({ ctlA: 1 });
  h.evaluate();
  const vy = h.pinVoltage(10, 'YA');
  check('YA coupled to the driven XA through the ON switch', vy > 4.5, `Vya=${fmt(vy)}`);
}

// ── 2. CTLA LOW → switch A open, YA held low by its pull-down ────────────────
{
  console.log('\n2. CTLA = LOW → switch A open, YA isolated → ≈ 0V');
  const h = buildA({ ctlA: 0 });
  h.evaluate();
  const vy = h.pinVoltage(10, 'YA');
  check('YA isolated from XA → pull-down wins', vy < 0.5, `Vya=${fmt(vy)}`);
}

// ── 3. Bidirectional: drive YA, read XA (same switch closed) ─────────────────
{
  console.log('\n3. Bidirectional: drive YA = 5V, CTLA HIGH → XA follows YA');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4066' },
      // 100k pull-down on XA (pin1 = bottom strip col5)
      { id: 21, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:5:7', endHoleId: '0:0:power:5:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD pin14 → +5V
      { id: 2, startHoleId: '0:0:power:11:2', endHoleId: '0:0:main:11:6' }, // VSS pin7  → GND
      { id: 3, startHoleId: '0:0:power:6:1',  endHoleId: '0:0:main:6:6'  }, // YA pin2   → 5V (driven terminal)
      { id: 4, startHoleId: '0:0:power:6:3',  endHoleId: '0:0:main:6:3'  }, // CTLA pin13 = HIGH
    ],
  });
  h.evaluate();
  const vx = h.pinVoltage(20, 'XA');
  check('XA follows the driven YA through the ON switch', vx > 4.5, `Vxa=${fmt(vx)}`);
}

// ── 4. Independence: switch A closed must NOT close switch B ─────────────────
{
  console.log('\n4. Switch A closed, switch B open (CTLB LOW) → YB stays isolated ≈ 0V');
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 30, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'CD4066' },
      // 100k pull-down on YB (pin3 = bottom strip col7)
      { id: 31, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:7', endHoleId: '0:0:power:7:2' },
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1',  endHoleId: '0:0:main:5:3'  }, // VDD pin14 → +5V
      { id: 2, startHoleId: '0:0:power:11:2', endHoleId: '0:0:main:11:6' }, // VSS pin7  → GND
      { id: 3, startHoleId: '0:0:power:5:3',  endHoleId: '0:0:main:5:6'  }, // XA pin1   → 5V
      { id: 4, startHoleId: '0:0:power:6:3',  endHoleId: '0:0:main:6:3'  }, // CTLA pin13 = HIGH (A closed)
      { id: 5, startHoleId: '0:0:power:8:1',  endHoleId: '0:0:main:8:6'  }, // XB pin4   → 5V
      { id: 6, startHoleId: '0:0:power:9:0',  endHoleId: '0:0:main:9:6'  }, // CTLB pin5 = LOW (B open)
    ],
  });
  h.evaluate();
  const vyb = h.pinVoltage(30, 'YB');
  const vya = h.pinVoltage(30, 'YA');   // sanity: A really is closed → YA ≈ 5V
  check('YB isolated while only switch A is closed', vyb < 0.5, `Vyb=${fmt(vyb)}`);
  check('sanity: switch A still closed (YA ≈ 5V)', vya > 4.5, `Vya=${fmt(vya)}`);
}

console.log(failures === 0 ? '\nAll CD4066 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
