// ── 74x4351 regression: 8-channel analog mux/demux WITH address latch ────────
// Behavioral coverage of the ANALOG_MUX_8_LATCH primitive against the VERIFIED
// CD74HC4351 datasheet (TI/Harris SCHS213C, functional diagram + TRUTH TABLE,
// page 2). Guards:
//   • the channel addressed by S2,S1,S0 is resistively coupled to the common COM;
//   • unaddressed channels are open (COM follows only its own pull-down);
//   • the two enables: a channel conducts ONLY when E1 is LOW and E2 is HIGH —
//     E1 HIGH or E2 LOW opens every switch ("None");
//   • the address latch: LE HIGH is transparent (follows S0..S2); LE LOW holds
//     the stored channel so the selects can move without disturbing the switch.
//
// Method mirrors the CD4051 scenario: drive one channel (A5) hard to 5 V, hang a
// large (100 kΩ) pull-down on COM, and read COM. When A5 is selected the ~125 Ω
// ON path dominates the 100 kΩ pull-down and COM ≈ 5 V; otherwise COM is isolated
// and the pull-down holds it near 0 V. The latch test re-solves a PERSISTENT chip
// (state lives on the component) with a fresh WireManager each step.
//
// Run:  node js/debug/scenarios/cd74hc4351-mux-latch.mjs   (exits non-zero on fail)

import { CircuitHarness } from '../harness.mjs';
import { WireManager } from '../../wire.js';
import { holeId } from '../../breadboard.js';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// One persistent chip (id 10) at col 5 + a 100 kΩ pull-down on COM (pin 4 =
// bottom column 8). No wires in the JSON — every solve rebuilds them so the
// latch state on the chip persists across steps.
const h = CircuitHarness.fromJSON({
  components: [
    { id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: '74x4351' },
    { id: 11, type: 'resistor', resistance: 100000, startHoleId: '0:0:main:8:7', endHoleId: '0:0:power:8:0' },
  ],
  wires: [],
});
const chip = h.byId(10);

// Re-solve with each control pin held at a rail level (1 = VCC row, 0 = GND row).
// Channel A5 is always driven hard to 5 V (it is the channel we probe for).
function apply({ s0, s1, s2, le, e1, e2 }) {
  const wm = new WireManager();
  const drive = (name, bit) => {
    const p = chip.getPinByName(name);
    if (!p) throw new Error(`74x4351 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', p.col, bit ? 1 : 0), p.holeId);
  };
  drive('VCC', 1); drive('GND', 0); drive('VEE', 0);
  drive('A5', 1);                       // driven channel (sel = 5)
  drive('S0', s0); drive('S1', s1); drive('S2', s2);
  drive('LE', le); drive('E1', e1); drive('E2', e2);
  h.sim.evaluate(h.world, h.components, wm);
}
const com = () => h.pinVoltage(10, 'COM');

// ── 1. Enabled, transparent latch, select channel 5 → COM couples to A5 ──────
{
  console.log('\n1. E1=0,E2=1 enabled, LE=1, S2,S1,S0 = 1,0,1 (ch5) → COM ≈ 5V');
  apply({ s0: 1, s1: 0, s2: 1, le: 1, e1: 0, e2: 1 });
  check('COM pulled up to the driven channel A5 through the ON switch', com() > 4.5, `Vcom=${fmt(com())}`);
}

// ── 2. Select channel 0 → A5 isolated, COM held low by the pull-down ─────────
{
  console.log('\n2. Enabled, LE=1, select ch0 → A5 isolated, COM ≈ 0V');
  apply({ s0: 0, s1: 0, s2: 0, le: 1, e1: 0, e2: 1 });
  check('COM isolated from A5 → pull-down wins', com() < 0.5, `Vcom=${fmt(com())}`);
}

// ── 3. E1 HIGH disables the device while addressing ch5 → all switches open ──
{
  console.log('\n3. E1=1 (active-low enable not asserted), select ch5 → COM ≈ 0V');
  apply({ s0: 1, s1: 0, s2: 1, le: 1, e1: 1, e2: 1 });
  check('E1 HIGH opens every switch → COM held low', com() < 0.5, `Vcom=${fmt(com())}`);
}

// ── 4. E2 LOW disables the device while addressing ch5 → all switches open ───
{
  console.log('\n4. E2=0 (active-high enable not asserted), select ch5 → COM ≈ 0V');
  apply({ s0: 1, s1: 0, s2: 1, le: 1, e1: 0, e2: 0 });
  check('E2 LOW opens every switch → COM held low', com() < 0.5, `Vcom=${fmt(com())}`);
}

// ── 5. Address latch: capture ch5, then hold it while the selects change ─────
{
  console.log('\n5. Latch hold: capture ch5 with LE=1, then LE=0 and change selects');
  apply({ s0: 1, s1: 0, s2: 1, le: 1, e1: 0, e2: 1 });   // transparent: latch ch5
  check('5a. ch5 latched while transparent → COM ≈ 5V', com() > 4.5, `Vcom=${fmt(com())}`);

  apply({ s0: 0, s1: 0, s2: 0, le: 0, e1: 0, e2: 1 });   // hold: selects say ch0
  check('5b. LE LOW holds ch5 though selects now say ch0 → COM ≈ 5V', com() > 4.5, `Vcom=${fmt(com())}`);

  apply({ s0: 0, s1: 0, s2: 0, le: 1, e1: 0, e2: 1 });   // transparent again: ch0
  check('5c. LE HIGH re-opens the latch → ch0 selected, COM ≈ 0V', com() < 0.5, `Vcom=${fmt(com())}`);
}

console.log(failures === 0 ? '\nAll 74x4351 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
