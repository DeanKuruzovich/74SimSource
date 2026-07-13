// ── 74x4353 regression: TRIPLE 2-channel analog mux/demux WITH address latch ──
// Behavioral coverage of the ANALOG_MUX_TRIPLE2_LATCH primitive against the
// VERIFIED SGS-Thomson M54/M74HC4351/4352/4353 datasheet (Nov. 1993): HC4353
// PIN DESCRIPTION table + TRUTH TABLE. Guards:
//   • three INDEPENDENT selects — A drives section X, B drives Y, C drives Z;
//     this is the trait that distinguishes the 4353 from the shared-select 4352;
//   • each section couples its common to channel 1 when its select is HIGH and
//     to channel 0 when LOW; unaddressed channels are open;
//   • the two enables: switches conduct ONLY when E1 (EN1) is LOW and E2 (EN2)
//     is HIGH — E1 HIGH or E2 LOW opens every switch ("None" row);
//   • the shared address latch: LE HIGH is transparent (follows A/B/C), LE LOW
//     holds the stored selections so the select lines can move without moving
//     the switches.
//
// Method mirrors the cd74hc4352 scenario: drive a channel hard to 5 V, hang a
// large (100 kΩ) pull-down on its common, and read the common. When that channel
// is selected the ~80 Ω ON path dominates the 100 kΩ pull-down and the common
// ≈ 5 V; otherwise the common is isolated and the pull-down holds it near 0 V.
// The chip is PERSISTENT (latch state lives on the component); each step rebuilds
// a fresh WireManager and re-solves so the stored selection survives.
//
// Layout note (chip at col 5, probed from the loaded part):
//   XCOM = main:7:4 (top half)  → pull-down on free hole main:7:0
//   YCOM = main:6:4 (top half)  → pull-down on free hole main:6:0
//   ZCOM = main:9:5 (bottom)    → pull-down on free hole main:9:9
//   driven channels X1=main:8:4, Y1=main:6:5, Z1=main:8:5 (channel 1 of each).
//
// Run:  node js/debug/scenarios/74x4353-triple-mux-latch.mjs  (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';
import { WireManager } from '../../wire.js';
import { holeId } from '../../breadboard.js';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

const h = CircuitHarness.fromJSON({
  components: [
    { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: '74x4353' },
    { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:7:0', endHoleId: '0:0:power:8:0' }, // XCOM
    { id: 12, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:6:0', endHoleId: '0:0:power:8:0' }, // YCOM
    { id: 13, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:9:9', endHoleId: '0:0:power:8:0' }, // ZCOM
  ],
  wires: [],
});
const chip = h.byId(10);

// Re-solve with each control pin held at a rail level (1 = VCC row, 0 = GND row).
// Channels X1, Y1 and Z1 are always driven hard to 5 V — these are the channels
// each section reaches when its select bit is HIGH.
function apply({ a, b, c, le, e1, e2 }) {
  const wm = new WireManager();
  const drive = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4353 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', p.col, bit ? 1 : 0), p.holeId);
  };
  drive('VCC', 1); drive('GND', 0); drive('VEE', 0);
  drive('X1', 1); drive('Y1', 1); drive('Z1', 1);  // channel-1 of every section
  drive('A', a); drive('B', b); drive('C', c);
  drive('LE', le); drive('E1', e1); drive('E2', e2);
  h.sim.evaluate(h.world, h.components, wm);
}
const xCom = () => h.pinVoltage(10, 'XCOM');
const yCom = () => h.pinVoltage(10, 'YCOM');
const zCom = () => h.pinVoltage(10, 'ZCOM');

// ── 1. Enabled, transparent, A=B=C=1 → all three commons couple to channel 1 ─
{
  console.log('\n1. E1=0,E2=1 enabled, LE=1, A=B=C=1 → XCOM,YCOM,ZCOM ≈ 5V');
  apply({ a: 1, b: 1, c: 1, le: 1, e1: 0, e2: 1 });
  check('XCOM pulled up to X1', xCom() > 4.5, `Vx=${fmt(xCom())}`);
  check('YCOM pulled up to Y1', yCom() > 4.5, `Vy=${fmt(yCom())}`);
  check('ZCOM pulled up to Z1', zCom() > 4.5, `Vz=${fmt(zCom())}`);
}

// ── 2. INDEPENDENT selects — A=1, B=0, C=1 routes X and Z but not Y ──────────
{
  console.log('\n2. Enabled, LE=1, A=1,B=0,C=1 → XCOM,ZCOM ≈ 5V but YCOM ≈ 0V');
  apply({ a: 1, b: 0, c: 1, le: 1, e1: 0, e2: 1 });
  check('XCOM still reaches X1 (A=1)', xCom() > 4.5, `Vx=${fmt(xCom())}`);
  check('YCOM dropped to Y0 (B=0, undriven) → pull-down wins', yCom() < 0.5, `Vy=${fmt(yCom())}`);
  check('ZCOM still reaches Z1 (C=1)', zCom() > 4.5, `Vz=${fmt(zCom())}`);
}

// ── 3. E1 HIGH disables the whole device while addressing ch1 → all open ─────
{
  console.log('\n3. E1=1 (active-low enable not asserted), A=B=C=1 → all commons ≈ 0V');
  apply({ a: 1, b: 1, c: 1, le: 1, e1: 1, e2: 1 });
  check('E1 HIGH opens every switch', xCom() < 0.5 && yCom() < 0.5 && zCom() < 0.5,
        `Vx=${fmt(xCom())} Vy=${fmt(yCom())} Vz=${fmt(zCom())}`);
}

// ── 4. E2 LOW disables the whole device while addressing ch1 → all open ──────
{
  console.log('\n4. E2=0 (active-high enable not asserted), A=B=C=1 → all commons ≈ 0V');
  apply({ a: 1, b: 1, c: 1, le: 1, e1: 0, e2: 0 });
  check('E2 LOW opens every switch', xCom() < 0.5 && yCom() < 0.5 && zCom() < 0.5,
        `Vx=${fmt(xCom())} Vy=${fmt(yCom())} Vz=${fmt(zCom())}`);
}

// ── 5. Address latch: capture ch1 everywhere, hold while selects go to ch0 ───
{
  console.log('\n5. Latch hold: capture A=B=C=1 with LE=1, then LE=0 and drop selects');
  apply({ a: 1, b: 1, c: 1, le: 1, e1: 0, e2: 1 });   // transparent: latch ch1
  check('5a. ch1 latched while transparent → all commons ≈ 5V',
        xCom() > 4.5 && yCom() > 4.5 && zCom() > 4.5,
        `Vx=${fmt(xCom())} Vy=${fmt(yCom())} Vz=${fmt(zCom())}`);

  apply({ a: 0, b: 0, c: 0, le: 0, e1: 0, e2: 1 });   // hold: selects now say ch0
  check('5b. LE LOW holds ch1 in all sections though selects say ch0',
        xCom() > 4.5 && yCom() > 4.5 && zCom() > 4.5,
        `Vx=${fmt(xCom())} Vy=${fmt(yCom())} Vz=${fmt(zCom())}`);

  apply({ a: 0, b: 0, c: 0, le: 1, e1: 0, e2: 1 });   // transparent again: ch0
  check('5c. LE HIGH re-opens the latch → ch0 selected, all commons ≈ 0V',
        xCom() < 0.5 && yCom() < 0.5 && zCom() < 0.5,
        `Vx=${fmt(xCom())} Vy=${fmt(yCom())} Vz=${fmt(zCom())}`);
}

console.log(failures === 0 ? '\nAll 74x4353 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
