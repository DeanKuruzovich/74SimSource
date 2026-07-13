// ── 74F835 8-bit shift register w/ 2:1 mux-in + latched "B" inputs — regression ──
// First behavioral coverage of the SHIFT_REG_MUX_LATCH_835 primitive (chip entry
// in js/chips/chips41.js). The 74F835 datasheet prints no truth table; it defines
// the part as "Combines the 'F373, two 'F157s, and the 'F166 functions." This test
// pins down each of those three pieces and how they interact:
//   • 'F373 latch on the B bank — LE HIGH = transparent, LE LOW = hold.
//   • 'F157 muxes — SEL LOW selects the A inputs, SEL HIGH selects the latched B.
//   • 'F166 register — on the rising CP edge: PE LOW loads the 8 muxed bits in
//     parallel (stage n = bit n); PE HIGH shifts toward stage 7, SER entering
//     stage 0. Q7 is the only output = last stage / serial out.
//
// Method (mirrors cd4021-piso-shift.mjs): one 74x835, one persistent sim instance
// so the register + B-latch state carry across solves. Each solve re-wires every
// input to the VCC row (1) or GND row (0). A clock pulse is LOW→HIGH→LOW on CP.
//
// Run:  node js/debug/scenarios/74x835-mux-shift.mjs   (exits non-zero on fail)

import { BreadboardWorld, holeId } from '../../breadboard.js';
import { ChipComponent } from '../../components.js';
import { WireManager } from '../../wire.js';
import { CircuitSimulator } from '../../simulator.js';

const HIGH = 2.5;
const isHigh = (v) => v > HIGH;
const isLow  = (v) => v <= HIGH;

const world = new BreadboardWorld(2, 1);
const chip = new ChipComponent('74x835');
chip.place(0, 0, 2, 4);
const sim = new CircuitSimulator();

const ABANK = ['D0A','D1A','D2A','D3A','D4A','D5A','D6A','D7A'];
const BBANK = ['D0B','D1B','D2B','D3B','D4B','D5B','D6B','D7B'];

// Control + data state, persisted between apply() calls.
let st = {
  PEn: 1, CP: 0, SEL: 0, LE: 1, SER: 0,
  D0A:0,D1A:0,D2A:0,D3A:0,D4A:0,D5A:0,D6A:0,D7A:0,
  D0B:0,D1B:0,D2B:0,D3B:0,D4B:0,D5B:0,D6B:0,D7B:0,
};

function apply(patch = {}) {
  st = { ...st, ...patch };
  const wm = new WireManager();
  const wirePin = (name, bit) => {
    const pin = chip.getPinByName(name);
    if (!pin) throw new Error(`74x835 has no pin named ${name}`);
    wm.addWire(holeId(0, 0, 'power', Math.min(pin.col, 29), bit ? 1 : 0), pin.holeId);
  };
  wirePin('VCC', 1);
  wirePin('GND', 0);
  for (const name of ['PEn','CP','SEL','LE','SER', ...ABANK, ...BBANK]) wirePin(name, st[name]);
  sim.evaluate(world, [chip], wm);
}

const read = (name) => sim.getVoltageAtHole(chip.getPinByName(name).holeId);
const q7 = () => isHigh(read('Q7')) ? 1 : 0;

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Helper: set the 8 A inputs from a byte (bit n → DnA).
const setA = (byte) => { const p = {}; ABANK.forEach((n,i)=>p[n]=(byte>>i)&1); apply(p); };
const setB = (byte) => { const p = {}; BBANK.forEach((n,i)=>p[n]=(byte>>i)&1); apply(p); };

// One clock pulse with the current control state.
function clk() { apply({ CP: 1 }); apply({ CP: 0 }); }

// Parallel-load `byte` from a chosen bank, then clock out all 8 bits on Q7 and
// return them as an array (Q7 reads the bits MSB-first: stage 7 first).
function loadAndReadOut(byte, bank /* 'A' | 'B' */) {
  if (bank === 'A') { apply({ SEL: 0 }); setA(byte); }
  else              { apply({ SEL: 1, LE: 1 }); setB(byte); apply({ LE: 0 }); }
  apply({ PEn: 0 }); clk();          // parallel load on rising edge
  apply({ PEn: 1, SER: 0 });          // back to shift mode
  const out = [];
  out.push(q7());                     // stage 7 visible right after load
  for (let i = 0; i < 7; i++) { clk(); out.push(q7()); }
  return out;                         // [stage7, stage6, ..., stage0]
}

// ── 1. Parallel load from the A bank, shift it out on Q7 ─────────────────────
// byte 0b1011_0010 = 0xB2 → stage7..stage0 = 1,0,1,1,0,0,1,0
{
  const expect = [1,0,1,1,0,0,1,0];
  const got = loadAndReadOut(0xB2, 'A');
  assert(JSON.stringify(got) === JSON.stringify(expect),
    `A-bank load/shift: expected ${expect} got ${got}`);
}

// ── 2. SEL routes the B bank instead, and B passes through the latch ─────────
// Load 0x4D = 0b0100_1101 → stage7..0 = 0,1,0,0,1,1,0,1
{
  const expect = [0,1,0,0,1,1,0,1];
  const got = loadAndReadOut(0x4D, 'B');
  assert(JSON.stringify(got) === JSON.stringify(expect),
    `B-bank load/shift: expected ${expect} got ${got}`);
}

// ── 3. The B latch holds when LE is LOW ──────────────────────────────────────
// Make the latch transparent and present 0xFF on B, then freeze it (LE LOW),
// then change the live B inputs to 0x00. A SEL=B parallel load must capture the
// FROZEN 0xFF, not the new 0x00.
{
  apply({ SEL: 1, LE: 1 }); setB(0xFF);   // latch transparent, sees all-ones
  apply({ LE: 0 });                        // freeze
  setB(0x00);                              // live B inputs now all-zero
  apply({ PEn: 0 }); clk();                // load the LATCHED (frozen) value
  apply({ PEn: 1 });
  // Every stage should be 1 → Q7=1 for all 8 clocks.
  let allOnes = (q7() === 1);
  for (let i = 0; i < 7; i++) { clk(); allOnes = allOnes && (q7() === 1); }
  assert(allOnes, 'B latch hold: frozen 0xFF should load despite live B=0x00');
}

// ── 4. Latch transparency: with LE HIGH the B muxes track live B inputs ──────
{
  apply({ SEL: 1, LE: 1 }); setB(0x00);   // transparent, all-zero
  setB(0xFF);                              // change while still transparent
  apply({ PEn: 0 }); clk();                // load — should grab the new 0xFF
  apply({ PEn: 1 });
  let allOnes = (q7() === 1);
  for (let i = 0; i < 7; i++) { clk(); allOnes = allOnes && (q7() === 1); }
  assert(allOnes, 'B latch transparent: live 0xFF should load while LE HIGH');
}

// ── 5. Serial shift: SER enters stage 0 and ripples out at Q7 after 8 clocks ─
{
  apply({ SEL: 0 }); setA(0x00);
  apply({ PEn: 0 }); clk();                // clear register to 0
  apply({ PEn: 1, SER: 1 });
  // Inject a single 1 at stage 0, then shift it up with SER=0.
  clk();                                   // stage0 = 1
  apply({ SER: 0 });
  assert(q7() === 0, 'ser ripple: bit not yet at Q7 after 1 shift');
  for (let i = 0; i < 6; i++) clk();       // 6 more shifts → stage7 not yet
  assert(q7() === 0, 'ser ripple: bit should still be below Q7 after 7 shifts');
  clk();                                   // 8th shift → reaches stage7
  assert(q7() === 1, 'ser ripple: SER=1 bit should reach Q7 after 8 shifts');
}

// ── 6. No spurious update without a rising CP edge ───────────────────────────
{
  const before = q7();
  apply({ PEn: 0, SEL: 0 }); setA(before ? 0x00 : 0xFF);  // change inputs, CP stays LOW
  assert(q7() === before, 'idle: register changed with no rising CP edge');
}

console.log(`74x835-mux-shift: ${failures.length === 0 ? 'ALL PASS' : 'FAILURES'}`);
for (const f of failures) console.log('  ✗ ' + f);
process.exit(failures.length === 0 ? 0 : 1);
