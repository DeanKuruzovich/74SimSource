// ── Block 71 regression suite: analog companion chips ───────────────────────
// Covers the chips added in js/chips/chips71.js and their evaluators:
//
//   1. LM393  — dual comparator, open-collector outs (released → implicit
//               pull-up HIGH, asserted → sinks LOW).
//   2. LM741  — op-amp: open-loop slams to its (single-supply limited) rail;
//               voltage-follower feedback converges to IN+.
//   3. ULN2003 — Darlington sink: IN HIGH pulls OUT hard to GND (strong 30 Ω
//               sink vs a 1 kΩ pull-up), floating IN = channel OFF. Also
//               exercises the noVccPin power path (GND-only chip).
//   4. LM7805 — VOUT = 5 V stiff source when VIN is on the rail (noVccPin).
//   5. XO     — crystal-oscillator can free-runs at 10 Hz; EN LOW tri-states.
//   6. 2764   — EPROM: erased reads 0xFF; program pulse ANDs the data bus in
//               (bits only clear); other addresses stay erased. Floating data
//               pins read as 0 during a program pulse and therefore clear —
//               drive the whole bus when programming, like a real programmer.
//
// Run:  node js/debug/scenarios/block71-analog-chips.mjs   (exits non-zero on failure)

import { CircuitHarness } from '../harness.mjs';

let failures = 0;
function check(name, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? '   (' + detail + ')' : ''}`);
  if (!pass) failures++;
}
const fmt = v => (v === undefined || v === null || Number.isNaN(v)) ? String(v) : v.toFixed(3);

// DIP pin ↔ hole refresher (see components.js): a chip at col C occupies
// main rows 4/5. Top row (row 4), cols C.. : pins N, N-1, … N/2+1.
// Bottom row (row 5), cols C.. : pins 1, 2, … N/2. Wire to a top pin via
// rows 0-3 of its column, to a bottom pin via rows 6-9.
// Power rails: power:col:1 / power:col:3 = VCC, power:col:0 / power:col:2 = GND.

// ── 1. LM393 dual comparator ─────────────────────────────────────────────────
{
  console.log('\n1. LM393 comparator (ch1: IN+>IN- → HIGH, ch2: IN-<IN+ → LOW)');
  // 8-pin at col 5: top 8 VCC,7 2OUT,6 2IN-,5 2IN+ · bottom 1 1OUT,2 1IN-,3 1IN+,4 GND
  const h = CircuitHarness.fromJSON({
    components: [{ id: 10, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'LM393' }],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:5:3' }, // VCC → pin 8
      { id: 2, startHoleId: '0:0:power:8:2', endHoleId: '0:0:main:8:6' }, // GND → pin 4
      { id: 3, startHoleId: '0:0:power:7:3', endHoleId: '0:0:main:7:6' }, // 1IN+ = 5V
      { id: 4, startHoleId: '0:0:power:6:2', endHoleId: '0:0:main:6:6' }, // 1IN- = 0V
      { id: 5, startHoleId: '0:0:power:8:0', endHoleId: '0:0:main:8:2' }, // 2IN+ = 0V
      { id: 6, startHoleId: '0:0:power:7:1', endHoleId: '0:0:main:7:2' }, // 2IN- = 5V
    ],
  });
  h.evaluate();
  const v1 = h.pinVoltage(10, '1OUT');
  const v2 = h.pinVoltage(10, '2OUT');
  check('1OUT released → HIGH via implicit OC pull-up', v1 > 4.0, `v=${fmt(v1)}`);
  check('2OUT sinking → LOW', v2 < 0.5, `v=${fmt(v2)}`);
}

// ── 2. LM741 op-amp ──────────────────────────────────────────────────────────
// 8-pin at col 5: top 8 NC,7 V+,6 OUT,5 OFS2 · bottom 1 OFS1,2 IN-,3 IN+,4 V-
const LM741_BASE = {
  components: [
    { id: 20, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'LM741' },
    // 1k/1k divider on col 10 (bottom half) → 2.5 V reference
    { id: 21, type: 'resistor', resistance: 1000, startHoleId: '0:0:power:10:3', endHoleId: '0:0:main:10:6' },
    { id: 22, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:10:7', endHoleId: '0:0:power:10:2' },
  ],
  wires: [
    { id: 1, startHoleId: '0:0:power:6:1', endHoleId: '0:0:main:6:3' },  // V+ → VCC
    { id: 2, startHoleId: '0:0:power:8:2', endHoleId: '0:0:main:8:6' },  // V- → GND
    { id: 3, startHoleId: '0:0:main:10:8', endHoleId: '0:0:main:7:6' },  // divider → IN+
  ],
};
{
  console.log('\n2a. LM741 open loop (comparator): IN+ = 2.5V, IN- = 0V → rails high');
  const c = structuredClone(LM741_BASE);
  c.wires.push({ id: 4, startHoleId: '0:0:power:6:2', endHoleId: '0:0:main:6:6' }); // IN- = 0V
  const h = CircuitHarness.fromJSON(c);
  h.evaluate();
  const v = h.pinVoltage(20, 'OUT');
  check('OUT saturates at the single-supply high limit (~4V)', Math.abs(v - 4.0) < 0.15, `v=${fmt(v)}`);
}
{
  console.log('\n2b. LM741 voltage follower: OUT wired to IN- → OUT tracks IN+ (2.5V)');
  const c = structuredClone(LM741_BASE);
  c.wires.push({ id: 4, startHoleId: '0:0:main:7:2', endHoleId: '0:0:main:6:6' }); // OUT → IN-
  const h = CircuitHarness.fromJSON(c);
  h.evaluate();
  // Feedback convergence continues across time steps (OPAMP keeps the loop alive)
  h.run(0.5, { dt: 0.01 });
  const v = h.pinVoltage(20, 'OUT');
  check('follower output ≈ 2.5V', Math.abs(v - 2.5) < 0.1, `v=${fmt(v)}`);
}

// ── 3. ULN2003 Darlington array (no VCC pin — GND only) ──────────────────────
{
  console.log('\n3. ULN2003: IN1 HIGH sinks OUT1 against a 1k pull-up; IN2 floating = OFF');
  // 16-pin at col 5: top 16 OUT1,15 OUT2,…,9 COM · bottom 1 IN1,…,7 IN7,8 GND
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 30, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'ULN2003' },
      { id: 31, type: 'resistor', resistance: 1000, startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:5:0' }, // pull-up OUT1
      { id: 32, type: 'resistor', resistance: 1000, startHoleId: '0:0:power:6:1', endHoleId: '0:0:main:6:0' }, // pull-up OUT2
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:12:2', endHoleId: '0:0:main:12:6' }, // GND → pin 8 (only supply pin!)
      { id: 2, startHoleId: '0:0:power:5:3',  endHoleId: '0:0:main:5:6' },  // IN1 = 5V
    ],
  });
  h.evaluate();
  const v1 = h.pinVoltage(30, 'OUT1');
  const v2 = h.pinVoltage(30, 'OUT2');
  check('OUT1 sinks well below TTL low (strong 30Ω Darlington)', v1 < 0.5, `v=${fmt(v1)}`);
  check('OUT2 floats → pull-up wins (channel off)', v2 > 4.5, `v=${fmt(v2)}`);
}

// ── 4. LM7805 regulator (no VCC pin — VIN is a normal input) ─────────────────
{
  console.log('\n4. LM7805: VIN on the 5V rail → VOUT regulated 5V');
  // 4-pin at col 5: top 4 VOUT,3 NC · bottom 1 VIN,2 GND
  const h = CircuitHarness.fromJSON({
    components: [{ id: 40, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'LM7805' }],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:3', endHoleId: '0:0:main:5:6' }, // VIN → VCC rail
      { id: 2, startHoleId: '0:0:power:6:2', endHoleId: '0:0:main:6:6' }, // GND
    ],
  });
  h.evaluate();
  const v = h.pinVoltage(40, 'VOUT');
  check('VOUT ≈ 5V', Math.abs(v - 5) < 0.1, `v=${fmt(v)}`);
}

// ── 5. XO crystal oscillator can ─────────────────────────────────────────────
{
  console.log('\n5. XO: free-runs at 10 Hz with EN floating; EN LOW tri-states OUT');
  // 8-pin at col 5: top 8 VCC,7 NC,6 NC,5 OUT · bottom 1 EN,2 NC,3 NC,4 GND
  const h = CircuitHarness.fromJSON({
    components: [{ id: 50, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'XO' }],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:5:3' }, // VCC → pin 8
      { id: 2, startHoleId: '0:0:power:8:2', endHoleId: '0:0:main:8:6' }, // GND → pin 4
    ],
  });
  h.evaluate();
  const rows = h.run(0.5, { dt: 0.01, record: [{ name: 'out', fn: hh => hh.pinVoltage(50, 'OUT') }] });
  let transitions = 0;
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i].out > 2.5) !== (rows[i - 1].out > 2.5)) transitions++;
  }
  // 10 Hz over 0.5 s = 5 periods = 10 edges; allow slack for step rounding
  check('OUT toggles ~10 times in 0.5s @10Hz', transitions >= 6 && transitions <= 14, `edges=${transitions}`);
}
{
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 50, type: 'chip', tileX: 0, tileY: 0, col: 5, row: 4, chipId: 'XO' },
      { id: 51, type: 'resistor', resistance: 1000, startHoleId: '0:0:main:8:0', endHoleId: '0:0:power:8:0' }, // pull-down on OUT
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:5:1', endHoleId: '0:0:main:5:3' }, // VCC
      { id: 2, startHoleId: '0:0:power:8:2', endHoleId: '0:0:main:8:6' }, // GND
      { id: 3, startHoleId: '0:0:power:5:0', endHoleId: '0:0:main:5:6' }, // EN → GND
    ],
  });
  h.evaluate();
  const rows = h.run(0.3, { dt: 0.01, record: [{ name: 'out', fn: hh => hh.pinVoltage(50, 'OUT') }] });
  const stuckLow = rows.every(r => r.out < 0.5);
  check('EN LOW → OUT tri-stated (pull-down holds it at 0V, no toggling)', stuckLow);
}

// ── 6. 2764 EPROM: erased read, program pulse, selective verify ──────────────
{
  console.log('\n6. 2764 EPROM: reads 0xFF erased; program pulse clears bits at one address');
  // 28-pin at col 3: top 28 VCC,27 PGM,26 NC,25 A8,24 A9,23 A11,22 OE,21 A10,
  //                  20 CE,19 O7,18 O6,17 O5,16 O4,15 O3  (cols 3..16)
  //             bottom 1 VPP,2 A12,3 A7,4 A6,5 A5,6 A4,7 A3,8 A2,9 A1,10 A0,
  //                  11 O0,12 O1,13 O2,14 GND
  // Address pins float HIGH (74LS inputs) → addr = 0x1FFF.
  const h = CircuitHarness.fromJSON({
    components: [
      { id: 60, type: 'chip', tileX: 0, tileY: 0, col: 3, row: 4, chipId: '2764' },
      { id: 61, type: 'push_button', startHoleId: '0:0:main:9:2',  endHoleId: '0:0:power:9:0'  }, // OE# → GND when pressed (read)
      { id: 62, type: 'push_button', startHoleId: '0:0:main:4:2',  endHoleId: '0:0:power:4:0'  }, // PGM# → GND when pressed (program)
      { id: 63, type: 'switch',      startHoleId: '0:0:main:13:7', endHoleId: '0:0:power:13:2' }, // O0 → GND while programming
      { id: 64, type: 'switch',      startHoleId: '0:0:main:12:7', endHoleId: '0:0:power:12:2' }, // A0 → GND to move to addr 0x1FFE
    ],
    wires: [
      { id: 1, startHoleId: '0:0:power:3:1',  endHoleId: '0:0:main:3:3'  }, // VCC → pin 28
      { id: 2, startHoleId: '0:0:power:16:2', endHoleId: '0:0:main:16:6' }, // GND → pin 14
      { id: 3, startHoleId: '0:0:power:3:3',  endHoleId: '0:0:main:3:6'  }, // VPP → VCC (programming allowed)
      { id: 4, startHoleId: '0:0:power:11:0', endHoleId: '0:0:main:11:3' }, // CE# → GND (always selected)
    ],
  });
  h.evaluate();

  // Read erased contents @0x1FFF
  h.press(61);
  let o0 = h.pinVoltage(60, 'O0'), o7 = h.pinVoltage(60, 'O7');
  check('erased read: O0 HIGH', o0 > 4.0, `v=${fmt(o0)}`);
  check('erased read: O7 HIGH', o7 > 4.0, `v=${fmt(o7)}`);

  // Program @0x1FFF: OE# high, O0 grounded, PGM# pulse. Floating O1-O7 read
  // as 0 during the pulse and also clear — drive the bus in real circuits.
  h.release(61);
  h.setSwitch(63, true);
  h.press(62);
  h.release(62);
  h.setSwitch(63, false);

  // Verify @0x1FFF
  h.press(61);
  o0 = h.pinVoltage(60, 'O0'); o7 = h.pinVoltage(60, 'O7');
  check('programmed read: O0 cleared LOW', o0 < 0.5, `v=${fmt(o0)}`);
  check('programmed read: floating bus bit (O7) also cleared', o7 < 0.5, `v=${fmt(o7)}`);

  // Other addresses untouched: A0 → 0 selects 0x1FFE, still erased
  h.setSwitch(64, true);
  o0 = h.pinVoltage(60, 'O0');
  check('neighbour address 0x1FFE still erased (O0 HIGH)', o0 > 4.0, `v=${fmt(o0)}`);
}

console.log(failures === 0 ? '\nAll block-71 checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
