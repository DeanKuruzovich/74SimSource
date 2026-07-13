// ── 74x4352 regression: DUAL 4-channel analog mux/demux WITH shared latch ────
// Behavioral coverage of the ANALOG_MUX_DUAL4_LATCH primitive against the
// VERIFIED CD74HC4352 datasheet (TI/Harris SCHS213C, functional diagram + TRUTH
// TABLE for the CD74HC4352, page 3). Guards:
//   • both banks track ONE shared select: select n couples ACOM↔An AND BCOM↔Bn
//     at the same time (the dual-section behaviour that distinguishes this part
//     from the single-bank 74x4351);
//   • unaddressed channels are open (each common follows only its pull-down);
//   • the two enables: switches conduct ONLY when E1 (ET) is LOW and E2 is HIGH —
//     E1 HIGH or E2 LOW opens every switch in both banks ("None" row);
//   • the shared address latch: LE HIGH is transparent (follows S0/S1), LE LOW
//     holds the stored channel so the selects can move without moving the
//     switches, and both banks stay locked together.
//
// Method mirrors the CD4051/4351 scenarios: drive a channel hard to 5 V, hang a
// large (100 kΩ) pull-down on its common, and read the common. When that channel
// is selected the ~70 Ω ON path dominates the 100 kΩ pull-down and the common
// ≈ 5 V; otherwise the common is isolated and the pull-down holds it near 0 V.
// The latch test re-solves a PERSISTENT chip (state lives on the component) with
// a fresh WireManager each step.
//
// Layout note: the chip sits at col 5. ACOM is pin 17 (top main half, hole
// main:8:4) and BCOM is pin 4 (bottom main half, hole main:8:5). Each pull-down
// taps a free hole in the SAME column-half as its common (main:8:2 for ACOM,
// main:8:7 for BCOM) down to the ground rail (power row 0). No wires in the JSON —
// every solve rebuilds them so the latch state on the chip persists across steps.
//
// Run:  node js/debug/scenarios/cd74hc4352-dual-mux-latch.mjs  (exits non-zero on fail)

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
    { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: '74x4352' },
    { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:2', endHoleId: '0:0:power:8:0' },
    { id: 12, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:7', endHoleId: '0:0:power:8:0' },
  ],
  wires: [],
});
const chip = h.byId(10);

// Re-solve with each control pin held at a rail level (1 = VCC row, 0 = GND row).
// Channels A2 and B2 are always driven hard to 5 V (the channels we probe for).
function apply({ s0, s1, le, e1, e2 }) {
  const wm = new WireManager();
  const drive = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4352 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', p.col, bit ? 1 : 0), p.holeId);
  };
  drive('VCC', 1); drive('GND', 0); drive('VEE', 0);
  drive('A2', 1); drive('B2', 1);           // driven channels (sel = 2)
  drive('S0', s0); drive('S1', s1);
  drive('LE', le); drive('E1', e1); drive('E2', e2);
  h.sim.evaluate(h.world, h.components, wm);
}
const aCom = () => h.pinVoltage(10, 'ACOM');
const bCom = () => h.pinVoltage(10, 'BCOM');

// ── 1. Enabled, transparent latch, select ch2 → BOTH commons couple ─────────
{
  console.log('\n1. E1=0,E2=1 enabled, LE=1, S1,S0 = 1,0 (ch2) → ACOM and BCOM ≈ 5V');
  apply({ s0: 0, s1: 1, le: 1, e1: 0, e2: 1 });
  check('ACOM pulled up to A2 through the ON switch', aCom() > 4.5, `Vacom=${fmt(aCom())}`);
  check('BCOM pulled up to B2 at the same time (shared select)', bCom() > 4.5, `Vbcom=${fmt(bCom())}`);
}

// ── 2. Select ch0 → A2/B2 isolated, both commons held low by the pull-downs ──
{
  console.log('\n2. Enabled, LE=1, select ch0 → A2/B2 isolated, both commons ≈ 0V');
  apply({ s0: 0, s1: 0, le: 1, e1: 0, e2: 1 });
  check('ACOM isolated from A2 → pull-down wins', aCom() < 0.5, `Vacom=${fmt(aCom())}`);
  check('BCOM isolated from B2 → pull-down wins', bCom() < 0.5, `Vbcom=${fmt(bCom())}`);
}

// ── 3. E1 HIGH disables the device while addressing ch2 → all switches open ──
{
  console.log('\n3. E1=1 (active-low enable not asserted), select ch2 → both commons ≈ 0V');
  apply({ s0: 0, s1: 1, le: 1, e1: 1, e2: 1 });
  check('E1 HIGH opens every switch in both banks', aCom() < 0.5 && bCom() < 0.5,
        `Vacom=${fmt(aCom())} Vbcom=${fmt(bCom())}`);
}

// ── 4. E2 LOW disables the device while addressing ch2 → all switches open ───
{
  console.log('\n4. E2=0 (active-high enable not asserted), select ch2 → both commons ≈ 0V');
  apply({ s0: 0, s1: 1, le: 1, e1: 0, e2: 0 });
  check('E2 LOW opens every switch in both banks', aCom() < 0.5 && bCom() < 0.5,
        `Vacom=${fmt(aCom())} Vbcom=${fmt(bCom())}`);
}

// ── 5. Shared address latch: capture ch2, then hold while selects change ─────
{
  console.log('\n5. Latch hold: capture ch2 with LE=1, then LE=0 and change selects');
  apply({ s0: 0, s1: 1, le: 1, e1: 0, e2: 1 });   // transparent: latch ch2
  check('5a. ch2 latched while transparent → both commons ≈ 5V',
        aCom() > 4.5 && bCom() > 4.5, `Vacom=${fmt(aCom())} Vbcom=${fmt(bCom())}`);

  apply({ s0: 0, s1: 0, le: 0, e1: 0, e2: 1 });   // hold: selects now say ch0
  check('5b. LE LOW holds ch2 in BOTH banks though selects say ch0',
        aCom() > 4.5 && bCom() > 4.5, `Vacom=${fmt(aCom())} Vbcom=${fmt(bCom())}`);

  apply({ s0: 0, s1: 0, le: 1, e1: 0, e2: 1 });   // transparent again: ch0
  check('5c. LE HIGH re-opens the latch → ch0 selected, both commons ≈ 0V',
        aCom() < 0.5 && bCom() < 0.5, `Vacom=${fmt(aCom())} Vbcom=${fmt(bCom())}`);
}

console.log(failures === 0 ? '\nAll 74x4352 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
